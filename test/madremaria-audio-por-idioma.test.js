// A VOZ SEGUE O IDIOMA (12/09) — lib/audios.js.
//
// O que se vigia: audioDaCarta() resolve pelo idioma ATIVO, e idioma sem
// gravacao devolve null (o botao some) em vez de cair no portugues. A Madre
// falando PT por cima de uma tela em ingles e o defeito que
// feedback-app-inteiro-no-mesmo-idioma nomeia — pior que o silencio.
//
// POR QUE UM STUB DE .m4a: node:test nao sabe ler um arquivo de audio (ele
// tenta parsear como JS e estoura "Invalid or unexpected token"). Quem resolve
// require de asset e o Metro, que nao roda aqui. Entao registramos uma
// extensao '.m4a' que devolve o CAMINHO do arquivo como modulo — assim o
// require literal resolve, e o teste ainda consegue afirmar QUAL arquivo saiu.
// O caminho que volta e o do disco de verdade: um require apontando para um
// .m4a inexistente estoura aqui igual estoura no Metro.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

/* FUSAO COSMIC GUIDE: babel-preset-expo transpila com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo. */
const path = require('node:path');
const RAIZ = path.join(__dirname, '..');

require.extensions['.m4a'] = function stubDeAudio(modulo, arquivo) {
  modulo.exports = arquivo;
};

const { audioDaCarta, temAudio } = require('../madremaria/lib/audios.js');
const { setIdiomaMadre, IDIOMAS } = require('../madremaria/datos/textos.js');

const FONTE = readFileSync(path.join(RAIZ, 'madremaria', 'lib', 'audios.js'), 'utf8');

/* A LISTA OFICIAL dos 27 ids que ganham voz em ES/EN. Nao e chute: e a saida de
 * _montar-lote.js, que colhe o texto pela mesma porta que a tela usa
 * (getRitual/blocosDaVariante/t). carta-4/5/6 NAO estao aqui de proposito —
 * o lote nao os inclui. */
const IDS_TRADUZIDOS = [
  'ritual-cafe', 'ritual-mao', 'ritual-cartas', 'ritual-sonho',
  'ritual-caminhada', 'ritual-canto', 'ritual-respiro',
  'entrada-lenormand-32', 'entrada-lenormand-21', 'entrada-lenormand-22',
  'entrada-lenormand-33', 'entrada-lenormand-35', 'entrada-lenormand-16',
  'profunda-7', 'profunda-8', 'profunda-9', 'profunda-10', 'profunda-11',
  'profunda-b1', 'profunda-b2', 'profunda-b3', 'profunda-b4', 'profunda-b5',
  'entrada-apresentacao', 'entrada-presenca',
  'entrada-anuncio-extra', 'entrada-anuncio-estrela',
];

test.afterEach(() => setIdiomaMadre('pt'));

test('em portugues, a voz e a que sempre foi', () => {
  setIdiomaMadre('pt');
  const fonte = audioDaCarta('ritual-cafe');
  assert.ok(fonte, 'ritual-cafe perdeu a voz em portugues');
  assert.match(String(fonte), /ritual-cafe\.m4a$/);
  assert.equal(temAudio('ritual-cafe'), true);
});

test('idioma com gravacao toca o arquivo DAQUELE idioma, nunca o portugues', () => {
  for (const lang of IDIOMAS.filter((l) => l !== 'pt')) {
    setIdiomaMadre(lang);
    for (const id of IDS_TRADUZIDOS) {
      const fonte = audioDaCarta(id);
      if (fonte == null) continue; // ainda nao gravado — coberto pelo teste seguinte
      assert.match(
        String(fonte),
        new RegExp(`${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.${lang}\\.m4a$`),
        `${id} em ${lang} resolveu para outro arquivo: ${fonte}`
      );
    }
  }
});

test('idioma SEM gravacao devolve null — nunca cai no portugues', () => {
  /* Os 54 chegaram em 12/09, entao hoje quem cai aqui sao so as cartas sem
   * traducao (carta-4/5/6, no teste seguinte). O ramo fica vigiando o caso
   * inverso: um .m4a que suma do disco sem sumir do require, ou um require que
   * suma sem o arquivo sumir — os dois viram silencio ou bundle quebrado. */
  for (const lang of IDIOMAS.filter((l) => l !== 'pt')) {
    setIdiomaMadre(lang);
    for (const id of IDS_TRADUZIDOS) {
      const fonte = audioDaCarta(id);
      const arquivo = path.join(RAIZ, 'assets', 'madremaria', 'audio', `${id}.${lang}.m4a`);
      if (existsSync(arquivo)) {
        assert.ok(fonte, `${id}.${lang}.m4a esta no disco mas falta o require em lib/audios.js`);
        continue;
      }
      assert.equal(
        fonte, null,
        `${id} em ${lang} nao tem gravacao e mesmo assim devolveu ${fonte} — `
          + 'se isso e o .m4a portugues, a Madre vai falar portugues para quem escolheu outro idioma'
      );
      assert.equal(temAudio(id), false, `${id} em ${lang} desenharia um botao sem som`);
    }
  }
});

test('carta-4/5/6 nao tem versao traduzida, e sao mudas fora do portugues', () => {
  /* Nao e esquecimento: o lote de _montar-lote.js nao as inclui. O teste guarda
   * a decisao para que "sumiu o audio das tres cartas em ES" nao seja lido como
   * regressao. */
  for (const id of ['carta-4', 'carta-5', 'carta-6']) {
    setIdiomaMadre('pt');
    assert.ok(audioDaCarta(id), `${id} perdeu a voz em portugues`);
    setIdiomaMadre('es');
    assert.equal(audioDaCarta(id), null, `${id} nao foi traduzida; em espanhol tem de calar`);
  }
});

test('o fallback esta no resolver, nao espalhado pelas telas', () => {
  /* Se alguem "consertar" o silencio fazendo `?? AUDIOS[id]`, o defeito volta
   * inteiro e sem ruido nenhum. */
  assert.doesNotMatch(
    FONTE,
    /POR_IDIOMA\[lang\]\?\.\[id\]\s*\?\?\s*AUDIOS\[id\]/,
    'o idioma sem gravacao voltou a cair no portugues'
  );
  assert.match(FONTE, /idiomaMadre\(\)/, 'audioDaCarta parou de olhar o idioma ativo');
});

test('nenhum consumidor congela o audio em useMemo/useState', () => {
  /* Trocar de idioma com a tela aberta tem de trocar a voz. Quem garante isso e
   * o key={lang} de MadreMariaApp.js (remonta a arvore) somado a BotaoOuvir
   * chamar audioDaCarta a cada render. Um useMemo com o modulo dentro
   * sobreviveria a remontagem do PAI e deixaria a voz no idioma velho. */
  const botao = readFileSync(path.join(RAIZ, 'madremaria', 'components', 'BotaoOuvir.js'), 'utf8');
  assert.match(botao, /const fonte = audioDaCarta\(audioId\);/, 'BotaoOuvir parou de resolver no render');
  assert.doesNotMatch(botao, /useMemo\([^)]*audioDaCarta/, 'a fonte virou memo e nao acompanha a troca de idioma');

  const app = readFileSync(path.join(RAIZ, 'madremaria', 'MadreMariaApp.js'), 'utf8');
  assert.match(app, /key=\{lang\}/, 'sem key={lang} a arvore nao remonta e a voz fica no idioma antigo');
});
