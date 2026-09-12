// A CORRENTE — os dias se ligam um no outro (lib/corrente.js, 03/09).
//
// O contrato: a deixa volta LITERAL (citação, nunca paráfrase — a tela
// desenha aspas em volta e o app não comenta o conteúdo), ausência nunca
// quebra o elo (a deixa espera o próximo dia vivido), e a chave 'corrente'
// sai no "Apagar tudo".
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { guardarDeixa, lerDeixa } from '../madremaria/lib/corrente.js';
import { t } from '../madremaria/datos/textos.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

const TELA = readFileSync(new URL('../madremaria/screens/PlanoScreen.js', __RAIZ_URL), 'utf8');

test('a deixa gravada volta literal, aparada no teto', async () => {
  await guardarDeixa('2026-09-03', 'pergunta', '  eu escrevi isso com as minhas palavras  ');
  const d = await lerDeixa();
  assert.ok(d);
  assert.equal(d.texto, 'eu escrevi isso com as minhas palavras');
  assert.equal(d.dia, '2026-09-03');
  assert.equal(d.ato, 'pergunta');
  // Teto: linha gigante não vira parede.
  await guardarDeixa('2026-09-04', 'gesto', 'x'.repeat(500));
  const g = await lerDeixa();
  assert.equal(g.texto.length, 120);
});

test('texto vazio nao apaga o elo anterior', async () => {
  await guardarDeixa('2026-09-05', 'missao', 'o elo que fica');
  await guardarDeixa('2026-09-06', 'gesto', '   ');
  const d = await lerDeixa();
  assert.equal(d.texto, 'o elo que fica');
});

test('a corrente nunca anda para tras — fechar ontem nao apaga hoje', async () => {
  await guardarDeixa('2026-09-10', 'pergunta', 'a linha de hoje');
  const gravouVelho = await guardarDeixa('2026-09-09', 'gesto', 'a linha de ontem');
  assert.equal(gravouVelho, false);
  const d = await lerDeixa();
  assert.equal(d.dia, '2026-09-10');
  assert.equal(d.texto, 'a linha de hoje');
  // O mesmo dia pode regravar (reabrir e fechar de novo vale).
  await guardarDeixa('2026-09-10', 'pergunta', 'a linha corrigida');
  assert.equal((await lerDeixa()).texto, 'a linha corrigida');
});

test('o corte do teto nao parte emoji ao meio', async () => {
  const texto = 'x'.repeat(119) + '\u{1F49B}\u{1F49B}';
  await guardarDeixa('2026-09-11', 'pergunta', texto);
  const d = await lerDeixa();
  // 119 x + UM coracao inteiro (120 CARACTERES), nunca meio surrogate.
  assert.equal(Array.from(d.texto).length, 120);
  assert.ok(d.texto.endsWith('\u{1F49B}'));
  assert.doesNotMatch(d.texto, /[\uD800-\uDBFF]$/);
});

test('a tela cita entre aspas e nunca parafraseia; o fio so cita dia ANTERIOR', () => {
  // A citação literal: o texto da deixa entra cru, emoldurado por aspas.
  assert.match(TELA, /\\u201C' \+ deixa\.texto \+ '\\u201D/);
  // O gate cronológico: reabrir ontem não cita o texto de hoje como passado.
  assert.match(TELA, /d\.dia < dia \? d : null/);
  // O fechamento grava o elo com o ATO EFETIVO — o que o dia mostrou.
  assert.match(TELA, /guardarDeixa\(dia, atoEfetivo, textoDaDeixa\(\)\)/);
  // E a gravação vive FORA do updater de setEtapa (efeito puro no handler).
  assert.doesNotMatch(TELA, /setEtapa\(\(atual\) => \{[\s\S]{0,400}guardarDeixa/);
});

test('pergunta sem resposta nao inventa deixa de gesto nunca mostrado', () => {
  // textoDaDeixa devolve a resposta APARADA (vazio => vazio, e vazio não
  // grava — lib/corrente.js preserva o elo anterior); o fallback de gesto só
  // existe no ramo 'gesto' do ato efetivo.
  assert.match(TELA, /if \(atoEfetivo === 'pergunta'\) return respostaReflexao\.trim\(\);/);
});

test("a chave 'corrente' esta no Apagar tudo", () => {
  const AJUSTES = readFileSync(new URL('../madremaria/screens/AjustesScreen.js', __RAIZ_URL), 'utf8');
  const lista = AJUSTES.slice(
    AJUSTES.indexOf('CLAVES_HILO_ROJO'),
    AJUSTES.indexOf(']);', AJUSTES.indexOf('CLAVES_HILO_ROJO'))
  );
  assert.match(lista, /'corrente'/);
});

test('as pontes do fio anunciam o tipo e nao prometem nada', () => {
  for (const ato of ['gesto', 'missao', 'pergunta', 'ritmo', 'encontro']) {
    const ponte = t('plano.fio.ponte.' + ato);
    assert.ok(ponte && !ponte.startsWith('plano.fio.'), `sem ponte para ${ato}`);
    assert.doesNotMatch(ponte, /volta|destino|sorte|vai dar|garant|%/i, ponte);
  }
  // E a fresta de amanhã só existe como TIPO + frase cortada: o wizard nunca
  // desenha o nome do gesto de amanhã (promessa do áudio 10).
  assert.match(TELA, /t\('plano\.ato\.' \+ atoAmanha\)/);
  assert.doesNotMatch(TELA, /ritualDoDia\(diaSeguinte/);
});
