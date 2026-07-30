// Testes de lib/cosmicSoundSession.js — as regras da SESSÃO do "Som do céu".
//
// O componente (components/CosmicSoundPlayer.js) não roda em node:test, então
// tudo que precisa de garantia mora no módulo puro: quanto tempo conta como dia
// ativo, o fade do timer, e o WAV de silêncio que segura a sessão de mídia.
//
// O que estes testes protegem, em uma frase cada:
//   - "escutei 3 s e ganhei dia ativo" nunca pode acontecer (a sequência do app
//     só vale porque é honesta — ver lib/streak.js);
//   - "o aparelho dormiu 3 h e acordou com o dia já marcado" também não;
//   - o timer nunca corta o som seco no ouvido de quem dormiu ouvindo.
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MIN_ESCUTA_SEGUNDOS,
  TETO_POR_TIQUE_S,
  SEM_TIMER,
  TIMER_MINUTOS,
  FADE_PASSOS,
  criarContadorEscuta,
  planoDeFade,
  calcularRestante,
  metadadosDeMidia,
  bytesWavSilencioso,
  wavSilenciosoDataUri,
  faixaDeBrilho,
} = require('../lib/cosmicSoundSession.js');

// ===========================================================================
// 1. ESCUTA → DIA ATIVO
// ===========================================================================

test('o mínimo de escuta é minutos, não segundos — 3 s nunca vale um dia ativo', () => {
  assert.ok(MIN_ESCUTA_SEGUNDOS >= 60, 'menos de um minuto seria dia ativo de graça');
  const c = criarContadorEscuta({ dia: () => '2026-07-30' });
  assert.equal(c.registrar(3).atingiu, false);
  assert.equal(c.estado().jaContou, false);
});

test('atinge o mínimo uma única vez, e só depois do tempo cheio', () => {
  const c = criarContadorEscuta({ minSegundos: 10, dia: () => '2026-07-30' });
  for (let i = 0; i < 9; i++) assert.equal(c.registrar(1).atingiu, false, `tique ${i}`);
  assert.equal(c.registrar(1).atingiu, true, 'o tique que cruza o mínimo avisa');
  // Segunda vez NÃO avisa: quem chama dispara recordActiveDay() nesse sinal, e
  // repetir o sinal seria bater no storage/servidor a cada segundo.
  for (let i = 0; i < 30; i++) assert.equal(c.registrar(1).atingiu, false);
  assert.equal(c.estado().jaContou, true);
});

test('escuta acumula entre pausas do mesmo dia (2 min + 2 min conta)', () => {
  const c = criarContadorEscuta({ minSegundos: 240, dia: () => '2026-07-30' });
  for (let i = 0; i < 120; i++) c.registrar(1); // 2 min
  assert.equal(c.estado().jaContou, false);
  for (let i = 0; i < 119; i++) c.registrar(1);
  assert.equal(c.estado().jaContou, false, 'ainda falta 1 s');
  assert.equal(c.registrar(1).atingiu, true);
});

test('aparelho que dormiu 3 h não vira escuta — teto por tique', () => {
  const c = criarContadorEscuta({ minSegundos: 180, dia: () => '2026-07-30' });
  const r = c.registrar(3 * 60 * 60); // 10 800 s de relógio de parede num tique
  assert.equal(r.atingiu, false, 'um salto de relógio não é escuta');
  assert.equal(r.segundos, TETO_POR_TIQUE_S);
});

test('virou a meia-noite ouvindo: o dia novo começa do zero e pode contar sozinho', () => {
  let hoje = '2026-07-30';
  const c = criarContadorEscuta({ minSegundos: 10, dia: () => hoje });
  for (let i = 0; i < 10; i++) c.registrar(1);
  assert.equal(c.estado().jaContou, true);

  hoje = '2026-07-31';
  const primeiro = c.registrar(1);
  assert.equal(primeiro.dia, '2026-07-31');
  assert.equal(primeiro.segundos, 1, 'o dia novo não herda os segundos de ontem');
  assert.equal(primeiro.atingiu, false, 'nem herda o crédito');
  for (let i = 0; i < 9; i++) c.registrar(1);
  assert.equal(c.estado().jaContou, true, 'o dia novo ganha o próprio crédito');
});

test('tique negativo, NaN ou undefined não move o contador', () => {
  const c = criarContadorEscuta({ minSegundos: 5, dia: () => '2026-07-30' });
  c.registrar(-100);
  c.registrar(NaN);
  c.registrar(undefined);
  c.registrar(Infinity);
  assert.equal(c.estado().segundos, 0);
});

test('faltam devolve quanto ainda resta pra contar (é o que a tela mostra)', () => {
  const c = criarContadorEscuta({ minSegundos: 100, dia: () => '2026-07-30' });
  assert.equal(c.registrar(40).faltam, 60);
  assert.equal(c.registrar(40).faltam, 20);
  assert.equal(c.registrar(20).faltam, 0);
});

// ===========================================================================
// 2. TIMER
// ===========================================================================

test('as opções de timer são as que a pessoa pensa, mais "até eu parar"', () => {
  assert.deepEqual(TIMER_MINUTOS, [15, 30, 60]);
  assert.equal(SEM_TIMER, 0);
});

test('o fade do timer termina em silêncio e desce sempre (nunca corta seco)', () => {
  const plano = planoDeFade(0.8);
  assert.equal(plano.length, FADE_PASSOS);
  assert.equal(plano[plano.length - 1], 0, 'o último degrau é silêncio');
  for (let i = 1; i < plano.length; i++) {
    assert.ok(plano[i] < plano[i - 1], `degrau ${i} tem que ser menor que o anterior`);
  }
  assert.ok(plano[0] < 0.8, 'o primeiro degrau já baixa do volume atual');
});

test('fade com volume zerado ou inválido não estoura nem sobe o som', () => {
  for (const v of [0, -1, NaN, undefined, 'alto']) {
    const plano = planoDeFade(v);
    assert.equal(plano.length, FADE_PASSOS);
    assert.ok(plano.every((x) => x === 0));
  }
});

test('restante do timer conta pra baixo, nunca abaixo de zero, e é null sem timer', () => {
  const fim = 1_000_000;
  assert.equal(calcularRestante(fim, fim - 90_000), 90);
  assert.equal(calcularRestante(fim, fim + 5_000), 0);
  assert.equal(calcularRestante(null), null);
  assert.equal(calcularRestante(undefined), null);
});

// ===========================================================================
// 3. SESSÃO DE MÍDIA
// ===========================================================================

test('metadados da tela de bloqueio saem no formato do MediaMetadata', () => {
  const m = metadadosDeMidia({
    titulo: 'Som do céu',
    artista: '528 Hz',
    album: 'Cosmic Guide',
    artwork: 'https://exemplo/icon.png',
  });
  assert.equal(m.title, 'Som do céu');
  assert.equal(m.artist, '528 Hz');
  assert.equal(m.album, 'Cosmic Guide');
  assert.equal(m.artwork.length, 1);
  assert.equal(m.artwork[0].src, 'https://exemplo/icon.png');
});

test('sem arte, artwork fica vazio em vez de virar [undefined]', () => {
  const m = metadadosDeMidia({ titulo: 'x' });
  assert.deepEqual(m.artwork, []);
  assert.equal(m.artist, '');
});

test('a âncora de silêncio é um WAV válido, silencioso de verdade', () => {
  const bytes = bytesWavSilencioso(1, 8000);
  const texto = (i, n) => String.fromCharCode(...bytes.subarray(i, i + n));
  assert.equal(texto(0, 4), 'RIFF');
  assert.equal(texto(8, 4), 'WAVE');
  assert.equal(texto(36, 4), 'data');
  assert.equal(bytes.length, 44 + 8000, 'cabeçalho + 1 s a 8 kHz');
  // PCM de 8 bits é sem sinal: silêncio é 128. Preencher com 0 daria um estalo
  // a cada volta do loop — o oposto do objetivo.
  assert.ok(bytes.subarray(44).every((b) => b === 128));
});

test('a âncora vira data URI (nenhum arquivo de áudio entra no bundle)', () => {
  const uri = wavSilenciosoDataUri(1, 8000);
  assert.ok(uri.startsWith('data:audio/wav;base64,'));
  const base64 = uri.slice('data:audio/wav;base64,'.length);
  assert.ok(base64.length > 100);
  assert.equal(Buffer.from(base64, 'base64').subarray(0, 4).toString('utf8'), 'RIFF');
});

// ===========================================================================
// 4. BRILHO EM PALAVRA
// ===========================================================================

test('a palavra do brilho acompanha a iluminação da Lua', () => {
  assert.equal(faixaDeBrilho(100), 'alto'); // Cheia
  assert.equal(faixaDeBrilho(70), 'alto');
  assert.equal(faixaDeBrilho(50), 'medio'); // Quarto
  assert.equal(faixaDeBrilho(10), 'baixo'); // Nova
  assert.equal(faixaDeBrilho(undefined), 'medio', 'sem dado, nunca exagera pra nenhum lado');
});
