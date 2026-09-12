// AS DUAS LEITURAS DE ENTRADA — o sorteio 50/50 (lib/variante.js, 08/09).
//
// O que se vigia: o sorteio acontece UMA vez e fica gravado (a mesma pessoa
// ve sempre a mesma leitura); as duas tiragens sao validas (cartas que existem
// no baralho, tres para raspar na mesa nas duas, extra nas duas, estrela so na
// B); toda carta nova tem audio registrado E arquivo nos assets (um require de
// .m4a ausente derruba o bundle no Metro); e a chave esta no Apagar tudo.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { CARTAS_NA_MESA, tiragemDeEntrada, tirarTresLenormand } from '../madremaria/datos/lenormand.js';
import { VARIANTES, varianteDaEntrada, varianteGravada } from '../madremaria/lib/variante.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

const AUDIOS = readFileSync(new URL('../madremaria/lib/audios.js', __RAIZ_URL), 'utf8');

test('o sorteio acontece uma vez e fica gravado', async () => {
  assert.equal(await varianteGravada(), null);
  const primeira = await varianteDaEntrada(() => 0.9); // 0.9 -> 'b'
  assert.equal(primeira, 'b');
  // Sortear de novo com outro dado NAO troca: a gravada manda.
  const segunda = await varianteDaEntrada(() => 0.1);
  assert.equal(segunda, 'b');
  assert.equal(await varianteGravada(), 'b');
});

test('as duas tiragens sao validas: tres na mesa, extra nas duas, estrela so na B', () => {
  for (const v of VARIANTES) {
    const tiragem = tiragemDeEntrada(v);
    const papeis = tiragem.map((x) => x.papel);
    assert.equal(papeis.filter((p) => p === 'carta').length, CARTAS_NA_MESA, v);
    assert.equal(papeis.filter((p) => p === 'extra').length, 1, v);
    assert.equal(papeis.filter((p) => p === 'estrela').length, v === 'b' ? 1 : 0, v);
    // Posicoes 1..n, cartas de verdade, nenhuma repetida.
    assert.deepEqual(tiragem.map((x) => x.posicao), tiragem.map((_, i) => i + 1));
    assert.equal(new Set(tiragem.map((x) => x.carta.id)).size, tiragem.length, v + ': carta repetida');
    for (const x of tiragem) assert.ok(x.carta.nome && x.carta.leitura, x.carta.id);
  }
  // A comeca com as mesmas tres de sempre — a leitura antiga nao mudou.
  assert.deepEqual(
    tiragemDeEntrada('a').slice(0, 3).map((x) => x.carta.id),
    tirarTresLenormand().map((x) => x.carta.id)
  );
  // Variante desconhecida cai na A.
  assert.deepEqual(tiragemDeEntrada('zzz').map((x) => x.carta.id), tiragemDeEntrada('a').map((x) => x.carta.id));
});

test('toda carta nova tem voz registrada e arquivo nos assets', () => {
  const novas = [...tiragemDeEntrada('a'), ...tiragemDeEntrada('b')]
    .map((x) => x.carta.audio)
    .filter((a) => a && a.startsWith('entrada-'));
  assert.ok(novas.length >= 6, 'as cartas novas perderam o audio');
  for (const id of novas) {
    assert.match(AUDIOS, new RegExp(`'${id}': require\\('\\.\\./\\.\\./assets/madremaria/audio/${id}\\.m4a'\\)`), id);
    assert.ok(existsSync(new URL(`../assets/madremaria/audio/${id}.m4a`, __RAIZ_URL)), `assets/madremaria/audio/${id}.m4a nao existe`);
  }
});

test('a leitura profunda B existe inteira: cinco blocos, voz, tempos e o mesmo final', async () => {
  const { BLOQUES_PROFUNDA, BLOQUES_PROFUNDA_B, blocosDaVariante, trechosDe, duracaoDe } = await import(
    '../madremaria/datos/profunda.js'
  );
  assert.equal(BLOQUES_PROFUNDA_B.length, 5);
  assert.equal(blocosDaVariante('b', 'mulher'), BLOQUES_PROFUNDA_B);
  assert.equal(blocosDaVariante('a', 'mulher').length, BLOQUES_PROFUNDA.length);
  for (const b of BLOQUES_PROFUNDA_B) {
    assert.ok(b.texto.length >= 300, b.id);
    assert.match(AUDIOS, new RegExp(`'${b.audio}': require\\('\\.\\./\\.\\./assets/madremaria/audio/${b.audio}\\.m4a'\\)`), b.id);
    assert.ok(existsSync(new URL(`../assets/madremaria/audio/${b.audio}.m4a`, __RAIZ_URL)), b.audio);
    assert.ok(trechosDe(b.id).length >= 10, `${b.id}: sem tempos por frase`);
    assert.ok(duracaoDe(b.id) > 30, `${b.id}: sem duracao medida`);
  }
  // O MESMO final da A: a recusa em voz alta, o loop aberto, a lua nova na
  // tela e o convite — mesma essencia, imagens proprias.
  const fecho = BLOQUES_PROFUNDA_B[4].texto;
  assert.match(fecho, /Ningu[eé]m pode te dizer isso/);
  assert.match(fecho, /primeira pergunta da primeira lua/);
  assert.match(fecho, /lua nova/);
  assert.match(fecho, /Vamos\?$/);
  // Identidade propria: as cartas dela aparecem na leitura.
  const tudo = BLOQUES_PROFUNDA_B.map((b) => b.texto).join(' ');
  for (const imagem of [/montanha/i, /[Cc]aminhos|bifurca/i, /[Cc]have/i, /[ÂAâa]ncora/i, /[Ee]strela/i]) {
    assert.match(tudo, imagem);
  }
  // Os anuncios estao escritos (a voz tem transcricao na tela).
  // A narradora se apresenta (Madre Maria): texto + voz registrada + arquivo.
  assert.match(await import('../madremaria/datos/textos.js').then((m) => m.t('entrada.apresentacao')), /Madre Maria/);
  assert.match(AUDIOS, /'entrada-apresentacao': require\('\.\.\/\.\.\/assets\/madremaria\/audio\/entrada-apresentacao\.m4a'\)/);
  assert.ok(existsSync(new URL('../assets/madremaria/audio/entrada-apresentacao.m4a', __RAIZ_URL)));
  for (const chave of ['entrada.apresentacao', 'entrada.extra.anuncio', 'entrada.estrela.anuncio', 'entrada.presenca.texto']) {
    const { t } = await import('../madremaria/datos/textos.js');
    const texto = t(chave);
    assert.ok(texto && !texto.startsWith('entrada.'), chave);
    assert.doesNotMatch(texto, /gr[aá]tis|pix|pagar|pre[cç]o/i, chave);
  }
});

test('toda carta das duas tiragens tem arte registrada e arquivo nos assets', () => {
  const ARTES = readFileSync(new URL('../madremaria/lib/imagenesLenormand.js', __RAIZ_URL), 'utf8');
  for (const v of VARIANTES) {
    for (const { carta } of tiragemDeEntrada(v)) {
      assert.match(ARTES, new RegExp(`'${carta.id}': require\\('\\.\\./\\.\\./assets/madremaria/lenormand/${carta.id}\\.jpg'\\)`), carta.id);
      assert.ok(existsSync(new URL(`../assets/madremaria/lenormand/${carta.id}.jpg`, __RAIZ_URL)), `sem arte: ${carta.id}`);
    }
  }
});

test("a chave 'variante' esta no Apagar tudo", () => {
  const AJUSTES = readFileSync(new URL('../madremaria/screens/AjustesScreen.js', __RAIZ_URL), 'utf8');
  const lista = AJUSTES.slice(
    AJUSTES.indexOf('CLAVES_HILO_ROJO'),
    AJUSTES.indexOf(']);', AJUSTES.indexOf('CLAVES_HILO_ROJO'))
  );
  assert.match(lista, /'variante'/);
});
