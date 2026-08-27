const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { datasDoSigno, nomeDoSigno } = require('../lib/synastry.js');
const { rotuloDoAspecto, rotuloDoPlaneta } = require('../lib/transitoFase.js');

test('nomes de signos seguem PT, ES e EN sem alterar o identificador canônico', () => {
  assert.equal(nomeDoSigno('Leão', 'pt'), 'Leão');
  assert.equal(nomeDoSigno('Leão', 'es'), 'Leo');
  assert.equal(nomeDoSigno('Leão', 'en'), 'Leo');
  assert.equal(nomeDoSigno('Aquário', 'es'), 'Acuario');
  assert.equal(nomeDoSigno('Aquário', 'en'), 'Aquarius');
  assert.equal(nomeDoSigno('nome-desconhecido', 'en'), 'nome-desconhecido');
});

test('intervalos dos signos localizam somente os meses', () => {
  assert.equal(datasDoSigno('23 Jul - 22 Ago', 'pt'), '23 Jul - 22 Ago');
  assert.equal(datasDoSigno('23 Jul - 22 Ago', 'es'), '23 Jul - 22 Ago');
  assert.equal(datasDoSigno('23 Jul - 22 Ago', 'en'), '23 Jul - 22 Aug');
  assert.equal(datasDoSigno('22 Dez - 19 Jan', 'es-419'), '22 Dic - 19 Ene');
  assert.equal(datasDoSigno('22 Dez - 19 Jan', 'en-US'), '22 Dec - 19 Jan');
});

test('as telas da vitrine usam rótulos localizados, não sign.pt', () => {
  const root = path.resolve(__dirname, '..');
  const horoscope = fs.readFileSync(path.join(root, 'screens', 'HoroscopeScreen.js'), 'utf8');
  const compatibility = fs.readFileSync(path.join(root, 'screens', 'CompatibilityScreen.js'), 'utf8');
  const birthChart = fs.readFileSync(path.join(root, 'screens', 'BirthChartScreen.js'), 'utf8');

  assert.doesNotMatch(horoscope, />\{(?:sign|z)\.pt\}</);
  assert.doesNotMatch(compatibility, />\{(?:sign|signA|signB|z)\.pt\}</);
  assert.match(horoscope, /nomeDoSigno\(f\.luaSigno, lang\)/);
  assert.match(horoscope, /localizeAstroValue\(f\.faseNome, t, lang\)/);
  assert.match(compatibility, /datasDoSigno\(sign\.dates, lang\)/);
  assert.match(birthChart, /label: nomeDoSigno\(name, lang\)/);
  assert.match(birthChart, /nomeDoSigno\(h\.sign\.name, lang\)/);
  assert.match(birthChart, /activeChart\.sun\.label/);
  assert.match(birthChart, /rotuloDoPlaneta\(a\.planetA, lang\)/);
  assert.match(birthChart, /rotuloDoAspecto\(a\.aspectType, lang\)/);
  assert.match(birthChart, /formatBirthDate\(chart\.date, lang\)/);
});

test('os dez planetas e cinco aspectos têm rótulo nos três idiomas', () => {
  const planets = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão'];
  const aspects = ['Conjunção', 'Sextil', 'Quadratura', 'Trígono', 'Oposição'];
  for (const lang of ['pt', 'es', 'en']) {
    for (const planet of planets) assert.ok(rotuloDoPlaneta(planet, lang));
    for (const aspect of aspects) assert.ok(rotuloDoAspecto(aspect, lang));
  }
  assert.equal(rotuloDoPlaneta('Lua', 'en'), 'Moon');
  assert.equal(rotuloDoAspecto('Quadratura', 'en'), 'Square');
});

test('o seed EN da vitrine usa Brazil, sem alterar PT e ES', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'play-store', 'assets', 'loja-shots.js'), 'utf8');
  assert.match(source, /locale === 'en-US' \? 'Brazil' : 'Brasil'/);
  assert.match(source, /cityA: \{ \.\.\.DEMO_CITY_A, country \}/);
});
