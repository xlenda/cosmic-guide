// A FUNDAÇÃO — o portão das escalas de espaço e tipografia (12/09/2026).
//
// Este teste NÃO carimba os números da escala: se amanhã `entre` virar 20 em vez
// de 24, isso é decisão de design e o teste não tem nada a dizer. Ele guarda as
// LEIS que fazem a fundação funcionar — as que, se quebradas em silêncio,
// devolvem o app ao estado que o dono chamou de "sem elegância":
//
//   1. os degraus existem e são uma PROGRESSÃO (nada fora de ordem, nada igual);
//   2. o texto corrido RESPIRA (entrelinha >= 1,5 — o respiro do concorrente);
//   3. o negrito é EXCEÇÃO (nenhum degrau de texto de leitura vem em peso forte);
//   4. o título NÃO usa entrelinha de parágrafo (desmontaria em linhas soltas);
//   5. nada do que já existia em theme.js sumiu (52 telas dependem disso);
//   6. a vinheta escurece as BORDAS e abre o MIOLO — se inverter, vira névoa.
const test = require('node:test');
const assert = require('node:assert');

const { colors, gradients, zodiacSigns, GOLD_THEME_KEY, space, type, vinheta } = require('../theme');

const crescente = (arr) => arr.every((v, i) => i === 0 || v > arr[i - 1]);

test('a escala de espaço é uma progressão crescente, sem degrau repetido', () => {
  const degraus = [space.grudado, space.junto, space.dentro, space.bloco, space.entre, space.secao, space.ar, space.respiro, space.rodape];
  assert.ok(degraus.every((d) => Number.isFinite(d) && d > 0), 'todo degrau é um número positivo');
  assert.ok(crescente(degraus), `os degraus têm que subir sempre: ${degraus.join(' ')}`);
  assert.strictEqual(new Set(degraus).size, degraus.length, 'dois degraus com o mesmo valor = um deles não serve pra nada');
});

test('os atalhos de tela apontam para degraus reais da escala', () => {
  // `rodape` (76) entrou na escala em 13/09/2026: é o degrau do pé da tela, o
  // primeiro que passa dos 73px ocupados pela pílula flutuante da barra de
  // abas. Sem ele, `fimDaLista` teria que ser número solto — e era exatamente
  // isso que esta lei existe pra impedir.
  const degraus = new Set([space.grudado, space.junto, space.dentro, space.bloco, space.entre, space.secao, space.ar, space.respiro, space.rodape]);
  assert.ok(degraus.has(space.tela), 'space.tela tem que ser um degrau da escala, não um número solto');
  assert.ok(degraus.has(space.fimDaLista), 'space.fimDaLista tem que ser um degrau da escala');
});

test('os tamanhos de fonte são uma progressão — nada de 13,14,15 espalhados', () => {
  const tamanhos = [type.nota, type.apoio, type.corpoCurto, type.corpo, type.secao, type.titulo, type.display].map((t) => t.fontSize);
  assert.ok(crescente(tamanhos), `os tamanhos têm que subir sempre: ${tamanhos.join(' ')}`);
  // Cada degrau tem que ser visivelmente outro degrau. 1px de diferença não é
  // hierarquia: é o desalinho que o olho lê como "menos caprichado".
  tamanhos.forEach((t, i) => {
    if (i === 0) return;
    assert.ok(t - tamanhos[i - 1] >= 2, `degrau ${t} está a menos de 2px do anterior (${tamanhos[i - 1]}) — não é hierarquia, é ruído`);
  });
});

test('o texto de leitura respira: entrelinha de pelo menos 1,5', () => {
  for (const nome of ['corpo', 'corpoCurto', 'apoio', 'nota']) {
    const t = type[nome];
    const razao = t.lineHeight / t.fontSize;
    assert.ok(razao >= 1.5, `type.${nome} tem entrelinha ${razao.toFixed(2)} — texto apertado grita em vez de convidar`);
  }
});

test('o negrito é exceção: nenhum degrau de leitura vem em peso forte', () => {
  for (const nome of ['corpo', 'corpoCurto', 'apoio', 'nota']) {
    const peso = Number(type[nome].fontWeight);
    assert.ok(peso <= 400, `type.${nome} está em peso ${peso} — texto corrido é peso normal, SEMPRE`);
  }
});

test('título não usa entrelinha de parágrafo', () => {
  for (const nome of ['display', 'titulo', 'secao']) {
    const t = type[nome];
    const razao = t.lineHeight / t.fontSize;
    assert.ok(razao <= 1.35, `type.${nome} tem entrelinha ${razao.toFixed(2)} — título folgado desmonta em linhas soltas`);
  }
});

test('todo degrau tipográfico é um estilo completo: tamanho + entrelinha + peso', () => {
  for (const [nome, t] of Object.entries(type)) {
    assert.ok(Number.isFinite(t.fontSize), `type.${nome} sem fontSize`);
    assert.ok(Number.isFinite(t.lineHeight), `type.${nome} sem lineHeight — a entrelinha é metade do efeito, não pode ficar solta`);
    assert.ok(typeof t.fontWeight === 'string', `type.${nome} sem fontWeight`);
  }
});

test('a vinheta escurece as bordas e abre o miolo', () => {
  assert.strictEqual(vinheta.cores.length, vinheta.locais.length, 'uma cor para cada parada');
  assert.ok(crescente(vinheta.locais), 'as paradas do gradiente têm que subir');
  assert.strictEqual(vinheta.locais[0], 0, 'a vinheta começa no topo da tela');
  assert.strictEqual(vinheta.locais[vinheta.locais.length - 1], 1, 'a vinheta termina no rodapé');

  const alfa = (c) => {
    const m = /rgba\([^)]*,\s*([0-9.]+)\s*\)/.exec(c);
    assert.ok(m, `cor da vinheta sem alfa legível: ${c}`);
    return Number(m[1]);
  };
  const alfas = vinheta.cores.map(alfa);
  const topo = alfas[0];
  const rodape = alfas[alfas.length - 1];
  const miolo = Math.max(...alfas.slice(1, -1));
  assert.ok(topo > miolo, 'a borda de cima tem que ser mais escura que o miolo — senão é névoa, não profundidade');
  assert.ok(rodape > miolo, 'a borda de baixo tem que ser mais escura que o miolo');
  assert.strictEqual(miolo, 0, 'o miolo tem que ser transparente: é por onde o conteúdo respira');
});

test('a fundação só ADICIONOU: nada do theme antigo sumiu', () => {
  // 52 telas + a Madre Maria importam destes nomes. Renomear ou remover
  // qualquer um quebra tudo de uma vez.
  for (const chave of ['background', 'surface', 'card', 'border', 'text', 'textSecondary', 'textMuted', 'accent', 'gold']) {
    assert.ok(colors[chave], `colors.${chave} sumiu do theme`);
  }
  for (const chave of ['hero', 'purple', 'night', 'card']) {
    assert.ok(Array.isArray(gradients[chave]), `gradients.${chave} sumiu do theme`);
  }
  assert.strictEqual(zodiacSigns.length, 12, 'os 12 signos continuam lá');
  assert.strictEqual(typeof GOLD_THEME_KEY, 'string', 'a chave do tema dourado continua exportada');
});
