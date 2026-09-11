// test/horoscopoLocalizado.test.js
//
// Os localizadores do horóscopo saíram de screens/HoroscopeScreen.js pra
// lib/horoscopoLocalizado.js em 11/09/2026 (a Home ganhou o carrossel com o
// mesmo texto). Este arquivo prova duas coisas:
//   1. a extração NÃO mudou comportamento — a CÓPIA CONGELADA da implementação
//      antiga, colada aqui embaixo, devolve o mesmo resumo pros doze signos,
//      em três datas e três idiomas. Não atualize a cópia: se divergir, foi a
//      extração que mudou, e o teste está certo.
//   2. itensDoCarrossel devolve um card por bloco, com título e texto de
//      leitura resolvidos (sem chave crua, sem {var} solta), cortado em ~140
//      caracteres — e NADA quando não há céu (available false): a Home não
//      inventa horóscopo, como a tela não escreve sem efeméride.
const test = require('node:test');
const assert = require('node:assert/strict');
const { translate } = require('../lib/i18n.js');
const { zodiacSigns } = require('../theme.js');
const { nomeDoSigno } = require('../lib/synastry.js');
const { horoscopeFor } = require('../lib/dailyHoroscope.js');
const {
  localizeAstroValue,
  resolveVars,
  resumoLocalizadoDoDia,
  itensDoCarrossel,
} = require('../lib/horoscopoLocalizado.js');

const IDIOMAS = ['pt', 'es', 'en'];
const tDe = (lang) => (key, vars) => translate(lang, key, vars);
const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
// Três céus diferentes: hoje (data da extração), Lua Cheia e Lua Nova já
// validadas em test/lunarCalendar.test.js.
const DATAS = [utc(2026, 9, 11), utc(2024, 1, 25), utc(2024, 1, 11)];
const SIGNOS = zodiacSigns.map((s) => s.name);

// ---------------------------------------------------------------------------
// CÓPIA CONGELADA — HoroscopeScreen.js antes de 11/09/2026. NÃO ATUALIZAR.
// ---------------------------------------------------------------------------
const PHASE_LABEL_KEYS_ANTIGO = {
  'Lua Nova': 'rituais.fase.luaNova',
  'Lua Crescente': 'rituais.fase.luaCrescente',
  'Quarto Crescente': 'rituais.fase.quartoCrescente',
  'Lua Gibosa Crescente': 'rituais.fase.gibosaCrescente',
  'Lua Cheia': 'rituais.fase.luaCheia',
  'Lua Gibosa Minguante': 'rituais.fase.gibosaMinguante',
  'Quarto Minguante': 'rituais.fase.quartoMinguante',
  'Lua Minguante': 'rituais.fase.luaMinguante',
};
const ZODIAC_NAMES_ANTIGO = new Set(zodiacSigns.map((sign) => sign.name));
function localizeAstroValueAntigo(value, t, lang) {
  if (value && typeof value === 'object' && value.i18n) return t(value.i18n);
  if (typeof value !== 'string') return value;
  if (ZODIAC_NAMES_ANTIGO.has(value)) return nomeDoSigno(value, lang);
  return PHASE_LABEL_KEYS_ANTIGO[value] ? t(PHASE_LABEL_KEYS_ANTIGO[value]) : value;
}
function resolveVarsAntigo(vars, t, lang) {
  if (!vars) return undefined;
  const out = {};
  for (const k of Object.keys(vars)) {
    out[k] = localizeAstroValueAntigo(vars[k], t, lang);
  }
  return out;
}
function resumoLocalizadoDoDiaAntigo(signName, date, t, lang) {
  const leitura = horoscopeFor(signName, date);
  if (!leitura.available) return null;
  const primeiraLinha = leitura.blocks
    .flatMap((bloco) => bloco.lines)
    .find((line) => line.role !== 'metodo');
  return primeiraLinha ? t(primeiraLinha.key, resolveVarsAntigo(primeiraLinha.vars, t, lang)) : null;
}

test('resumoLocalizadoDoDia extraído devolve o MESMO que a implementação antiga — 12 signos × 3 datas × 3 idiomas', () => {
  let comparacoes = 0;
  for (const lang of IDIOMAS) {
    const t = tDe(lang);
    for (const signo of SIGNOS) {
      for (const data of DATAS) {
        const novo = resumoLocalizadoDoDia(signo, data, t, lang);
        const antigo = resumoLocalizadoDoDiaAntigo(signo, data, t, lang);
        assert.equal(typeof antigo, 'string', `${signo}/${lang}: a cópia antiga precisa ter céu nessa data, senão o teste compara null com null`);
        assert.ok(antigo.length > 0);
        assert.equal(novo, antigo, `${signo} ${data.toISOString().slice(0, 10)} [${lang}]`);
        comparacoes += 1;
      }
    }
  }
  assert.equal(comparacoes, 12 * 3 * 3);
});

test('localizeAstroValue e resolveVars batem com a versão antiga em cada tipo de valor', () => {
  const casos = [
    { i18n: 'grounding.ruler.marte.name' },
    'Escorpião',
    'Lua Cheia',
    'Quarto Minguante',
    'texto qualquer',
    '17',
    42,
    null,
    undefined,
  ];
  for (const lang of IDIOMAS) {
    const t = tDe(lang);
    for (const valor of casos) {
      assert.equal(localizeAstroValue(valor, t, lang), localizeAstroValueAntigo(valor, t, lang), `${JSON.stringify(valor)} [${lang}]`);
    }
    const vars = { signo: 'Áries', planeta: { i18n: 'grounding.ruler.sol.name' }, graus: '12', fase: 'Lua Nova' };
    assert.deepEqual(resolveVars(vars, t, lang), resolveVarsAntigo(vars, t, lang));
    assert.equal(resolveVars(null, t, lang), undefined);
  }
  // O signo sai traduzido de verdade, não só igual à cópia.
  assert.equal(localizeAstroValue('Escorpião', tDe('en'), 'en'), 'Scorpio');
});

test('itensDoCarrossel: um card por bloco, título e texto resolvidos, texto ≤ 141 caracteres', () => {
  const data = utc(2026, 9, 11);
  for (const lang of IDIOMAS) {
    const t = tDe(lang);
    const leitura = horoscopeFor('Áries', data);
    const itens = itensDoCarrossel('Áries', data, t, lang);
    assert.ok(itens.length > 0, 'com céu calculado tem que haver card');
    assert.equal(itens.length, leitura.blocks.length, 'um card por bloco — nenhum bloco somem, nenhum é inventado');
    itens.forEach((item, i) => {
      assert.equal(item.id, leitura.blocks[i].id);
      assert.equal(typeof item.titulo, 'string');
      assert.ok(item.titulo.length > 0, `${item.id}: título vazio`);
      assert.doesNotMatch(item.titulo, /^horoscope\./, `${item.id}: título saiu como chave crua`);
      assert.equal(typeof item.texto, 'string');
      assert.ok(item.texto.length > 0, `${item.id}: texto vazio`);
      assert.ok(item.texto.length <= 141, `${item.id}: ${item.texto.length} caracteres — o card é convite, não a leitura inteira`);
      assert.doesNotMatch(item.texto, /\{[a-zA-Z]+\}/, `${item.id}: variável não resolvida no texto`);
      assert.doesNotMatch(item.texto, /horoscope\.sky\./, `${item.id}: chave crua no texto`);
    });
    // Pelo menos um bloco de Áries tem leitura maior que o corte: o texto
    // cortado tem que terminar em reticência, e o inteiro não.
    const cortados = itens.filter((item) => item.texto.endsWith('…'));
    assert.ok(cortados.length > 0, 'algum card precisa ter sido cortado, senão o corte não está sendo exercitado');
    for (const item of cortados) assert.ok(item.texto.length <= 141);
  }
});

test('itensDoCarrossel: signos diferentes no mesmo dia recebem cards diferentes', () => {
  const t = tDe('pt');
  const aries = itensDoCarrossel('Áries', utc(2026, 9, 11), t, 'pt').map((i) => i.texto).join('|');
  const gemeos = itensDoCarrossel('Gêmeos', utc(2026, 9, 11), t, 'pt').map((i) => i.texto).join('|');
  assert.notEqual(aries, gemeos);
});

test('itensDoCarrossel: sem céu (data impossível → available false) devolve [] — a Home não inventa horóscopo', () => {
  // Mesma data impossível de test/dailyHoroscope.test.js: horoscopeFor devolve
  // available false, blocks [].
  assert.equal(horoscopeFor('Áries', '2023-02-30').available, false);
  assert.deepEqual(itensDoCarrossel('Áries', '2023-02-30', tDe('pt'), 'pt'), []);
  assert.equal(resumoLocalizadoDoDia('Áries', '2023-02-30', tDe('pt'), 'pt'), null);
});
