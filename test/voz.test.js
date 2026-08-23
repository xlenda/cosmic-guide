// O BOTÃO "OUVIR" — teste do que é PURO em lib/voz.js: a quebra em frases que
// alimenta a fila de utterances (armadilha 2 do cabeçalho de lá: Chrome
// desktop pausa utterance longa ~15s, então cada frase vira uma utterance).
//
// O que NÃO se testa aqui, de propósito: speechSynthesis em si. É API de
// browser — em node:test não existe window, vozDisponivel() devolve false e
// falar()/parar()/falando() degradam pra no-op. Testar isso seria mockar o
// browser pra ver o mock funcionar.
const test = require('node:test');
const assert = require('node:assert/strict');
const { quebraEmFrases, vozDisponivel } = require('../lib/voz.js');

test('nenhuma frase se perde — o join reconstrói o texto original byte a byte', () => {
  const textos = [
    'Olá. Tudo bem? Sim! O céu de hoje… muda tudo.',
    'Primeira frase. Segunda sem ponto final',
    'Frase com fecho ("assim dizia ele.") e mais uma depois. Fim!',
    'A Lua está em Escorpião — fase minguante. Marte rege o dia. Observa o que encerra.',
  ];
  for (const texto of textos) {
    const frases = quebraEmFrases(texto);
    assert.ok(frases.length >= 2, `esperava 2+ frases em: ${texto}`);
    assert.equal(frases.join(''), texto, `o join não reconstruiu: ${texto}`);
  }
});

test('texto curto sem pontuação final vira exatamente 1 item, inteiro', () => {
  assert.deepEqual(quebraEmFrases('só uma frase sem ponto'), ['só uma frase sem ponto']);
  assert.deepEqual(quebraEmFrases('Uma frase com ponto.'), ['Uma frase com ponto.']);
});

test('vazio, null e undefined viram []', () => {
  assert.deepEqual(quebraEmFrases(''), []);
  assert.deepEqual(quebraEmFrases(null), []);
  assert.deepEqual(quebraEmFrases(undefined), []);
});

test('texto que não casa com o regex (só pontuação) sai inteiro em vez de sumir', () => {
  assert.deepEqual(quebraEmFrases('...'), ['...']);
});

test('em node não há Web Speech API — vozDisponivel() é false e nada explode', () => {
  assert.equal(vozDisponivel(), false);
});

// ---------------------------------------------------------------------------
// A ESCOLHA DA VOZ (09/08/2026) — o conserto do "voz robótica" relatado pelo
// dono. escolherVoz() é pura de propósito: recebe a lista (que no browser vem
// de getVoices()) e devolve a melhor pro idioma. É o placar que decide se a
// pessoa ouve a voz NEURAL instalada ou a sintética velha do sistema.
// ---------------------------------------------------------------------------
const { escolherVoz, escolherVozNatural } = require('../lib/voz.js');

// Retratos fiéis do que getVoices() devolve em cada plataforma real.
const V = {
  edgeNatural: { name: 'Microsoft Francisca Online (Natural) - Portuguese (Brazil)', lang: 'pt-BR' },
  windowsVelha: { name: 'Microsoft Maria Desktop - Portuguese(Brazil)', lang: 'pt-BR', default: true },
  googleBr: { name: 'Google português do Brasil', lang: 'pt-BR' },
  iosLuciana: { name: 'Luciana', lang: 'pt-BR' },
  iosCompacta: { name: 'Luciana (compact)', lang: 'pt-BR' },
  ptPortugal: { name: 'Joana', lang: 'pt-PT' },
  espanhola: { name: 'Mónica', lang: 'es-ES' },
  ingles: { name: 'Samantha', lang: 'en-US' },
  macBrincadeira: { name: 'Zarvox', lang: 'en-US', default: true },
};

test('a voz NEURAL ganha da voz padrão velha do sistema (o bug do robótico)', () => {
  // A padrão do Windows tem `default: true` e ainda assim perde — era
  // exatamente ela que o navegador escolhia sozinho antes deste placar.
  const escolhida = escolherVoz([V.windowsVelha, V.edgeNatural], 'pt-BR');
  assert.equal(escolhida, V.edgeNatural);
});

test('Google/nuvem ganha da compacta, e a compacta ganha de nada', () => {
  assert.equal(escolherVoz([V.iosCompacta, V.googleBr], 'pt-BR'), V.googleBr);
  assert.equal(escolherVoz([V.iosCompacta], 'pt-BR'), V.iosCompacta);
});

test('voz de brincadeira do macOS nunca é escolhida quando há voz séria', () => {
  const escolhida = escolherVoz([V.macBrincadeira, V.ingles], 'en-US');
  assert.equal(escolhida, V.ingles);
});

test('idioma exato ganha do mesmo idioma em outro país', () => {
  assert.equal(escolherVoz([V.ptPortugal, V.iosLuciana], 'pt-BR'), V.iosLuciana);
});

test('sem voz do idioma pedido, devolve null — a tela cai no lang puro', () => {
  assert.equal(escolherVoz([V.espanhola, V.ingles], 'pt-BR'), null);
});

test('lista vazia, nula ou com buraco não explode', () => {
  assert.equal(escolherVoz([], 'pt-BR'), null);
  assert.equal(escolherVoz(null, 'pt-BR'), null);
  assert.equal(escolherVoz([null, V.iosLuciana], 'pt-BR'), V.iosLuciana);
  assert.equal(escolherVoz([V.iosLuciana], ''), null);
});

test('pt-PT serve pra quem pede pt-BR quando é a única do idioma', () => {
  assert.equal(escolherVoz([V.ptPortugal, V.ingles], 'pt-BR'), V.ptPortugal);
});

test('reprodução real recusa a voz desktop robótica mesmo quando ela é a padrão', () => {
  assert.equal(escolherVozNatural([V.windowsVelha], 'pt-BR'), null);
  assert.equal(escolherVozNatural([V.iosCompacta], 'pt-BR'), null);
});

test('reprodução real aceita natural, Google e a voz preferida do sistema', () => {
  assert.equal(escolherVozNatural([V.windowsVelha, V.edgeNatural], 'pt-BR'), V.edgeNatural);
  assert.equal(escolherVozNatural([V.googleBr], 'pt-BR'), V.googleBr);
  assert.equal(escolherVozNatural([V.iosLuciana], 'pt-BR'), V.iosLuciana);
});

test('voz remota de nome genérico passa a régua natural; local genérica não', () => {
  const remota = { name: 'Português Brasil', lang: 'pt-BR', localService: false };
  const local = { name: 'Português Brasil', lang: 'pt-BR', localService: true };
  assert.equal(escolherVozNatural([remota], 'pt-BR'), remota);
  assert.equal(escolherVozNatural([local], 'pt-BR'), null);
});
