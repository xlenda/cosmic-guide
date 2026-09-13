// O SELETOR DE SIGNOS DA PRIMEIRA TELA (13/09/2026).
//
// screens/OnboardingChoiceScreen.js desenhava `{z.pt}` — o campo CRAVADO em
// português de theme.js:zodiacSigns. Quem abria o app em espanhol ou inglês
// via "Áries, Touro, Gêmeos, Câncer, Leão…" com TODA a interface traduzida em
// volta, e essa é a PRIMEIRA tela de quem chega pelo link.
//
// O helper certo já existia e já era usado em HoroscopeScreen.js:285 —
// nomeDoSigno(nome, lang) de lib/synastry.js. Não faltava tradução: faltava
// chamar o que já estava pronto.
//
// Este portão segura os dois lados: a tela não pode voltar a `z.pt`, e o
// helper tem de responder pelos DOZE signos nos TRÊS idiomas (um sign novo em
// theme.js sem entrada no helper cairia no fallback português em silêncio).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const { nomeDoSigno } = require('../lib/synastry.js');
const { zodiacSigns } = require('../theme.js');

test('a tela de entrada não desenha o campo português cravado', () => {
  const tela = fs.readFileSync(path.join(RAIZ, 'screens/OnboardingChoiceScreen.js'), 'utf8');
  // Ignora comentários: o racional acima cita `z.pt` de propósito.
  const semComentarios = tela
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  assert.ok(
    !/\{\s*z\.pt\s*\}/.test(semComentarios),
    'OnboardingChoiceScreen voltou a desenhar {z.pt}: espanhol e inglês veem português',
  );
  assert.match(
    semComentarios,
    /nomeDoSigno\s*\(\s*z\.name\s*,\s*lang\s*\)/,
    'a tela precisa passar pelo helper nomeDoSigno(z.name, lang)',
  );
});

test('nomeDoSigno responde pelos 12 signos nos 3 idiomas, sem cair no português', () => {
  assert.strictEqual(zodiacSigns.length, 12, 'o zodíaco deixou de ter 12 signos?');

  for (const lang of ['pt', 'es', 'en']) {
    const nomes = zodiacSigns.map((z) => nomeDoSigno(z.name, lang));
    for (const n of nomes) {
      assert.ok(n && typeof n === 'string' && n.trim(), `nome vazio em ${lang}`);
    }
    assert.strictEqual(new Set(nomes).size, 12, `nomes repetidos em ${lang}`);
  }

  // ES e EN não podem ser o pacote PT inteiro: Libra é igual nos três (é o
  // mesmo nome latino), então a comparação é do CONJUNTO, não de item a item.
  const pt = zodiacSigns.map((z) => nomeDoSigno(z.name, 'pt')).join('|');
  for (const lang of ['es', 'en']) {
    const outro = zodiacSigns.map((z) => nomeDoSigno(z.name, lang)).join('|');
    assert.notStrictEqual(outro, pt, `nomeDoSigno devolveu o pacote PT inteiro para ${lang}`);
  }

  // Âncoras: os três nomes que mais denunciam o vazamento de português.
  assert.strictEqual(nomeDoSigno('Touro', 'en'), 'Taurus');
  assert.strictEqual(nomeDoSigno('Gêmeos', 'es'), 'Géminis');
  assert.strictEqual(nomeDoSigno('Peixes', 'en'), 'Pisces');
});
