// A MADRE MARIA E A PRIMEIRA COISA DO FUNIL (screens/ApresentacaoScreen.js, 09/09;
// com o VIDEO dela desde 10/09).
//
// O que se vigia: sem perfil o App abre na apresentacao (e nao nas perguntas);
// a tela mostra o video dela (arquivo e poster nos assets, expo-video no
// plugin) e NAO toca sozinha; o texto na tela e a transcricao do que ela diz,
// com os tempos por frase batendo palavra por palavra; ela sai por replace
// para as perguntas; e a abertura das cartas nao se apresenta de novo.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';

import { PREGUNTAS } from '../madremaria/datos/preguntas.js';
import { t } from '../madremaria/datos/textos.js';
import { rotaDeAbertura } from '../madremaria/lib/porta.js';
import { RUTAS } from '../madremaria/routes.js';

/* Um onboarding completo montado A PARTIR das perguntas de verdade, e nao de
 * uma lista escrita a mao: se alguem acrescentar uma sexta pergunta amanha, este
 * objeto cresce junto e o teste continua exercendo "perfil completo". Uma lista
 * fixa aqui viraria, no dia dessa mudanca, um perfil INCOMPLETO que faz o teste
 * falhar por um motivo que nao tem nada a ver com o que ele vigia. */
const RESPOSTAS_COMPLETAS = Object.fromEntries(
  PREGUNTAS.map((p) => {
    if (p.tipo === 'texto') return [p.id, 'Lenda'];
    if (p.tipo === 'fecha') return [p.id, '1990-05-15'];
    const opcoes = p.opciones || p.opcoes || [];
    const primeira = opcoes[0];
    return [p.id, typeof primeira === 'string' ? primeira : primeira && primeira.id];
  })
);

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

const ler = (rel) => readFileSync(new URL(rel, __RAIZ_URL), 'utf8');
const APP = ler('../madremaria/MadreMariaApp.js');
const TELA = ler('../madremaria/screens/ApresentacaoScreen.js');

/* FUSAO COSMIC GUIDE: este portao passou a EXECUTAR a regra em vez de ler o
 * texto do App.js. A decisao dos tres passos do funil saiu de dentro do JSX e
 * virou madremaria/lib/porta.js (rotaDeAbertura) — um modulo sem React, que a
 * suite do Cosmic (node puro, sem parser de JSX) consegue chamar de verdade.
 * Ler texto-fonte so provava que a linha existia; chamar a funcao prova que ela
 * DECIDE certo, inclusive nos discos podres que hayPerfil() existe para pegar. */
test('sem perfil, a Madre abre na apresentacao e a rota tem caminho na web', () => {
  assert.equal(RUTAS.APRESENTACAO, 'Apresentacao');

  const ABAS = 'MadreAbas';
  const perfilBom = JSON.stringify({ respuestas: RESPOSTAS_COMPLETAS });

  // Os tres passos do funil, cada um exercido de verdade.
  assert.equal(rotaDeAbertura(null, false, ABAS), RUTAS.APRESENTACAO, 'sem perfil');
  assert.equal(rotaDeAbertura(perfilBom, false, ABAS), RUTAS.LEITURA_ENTRADA, 'com perfil, sem leitura');
  assert.equal(rotaDeAbertura(perfilBom, true, ABAS), ABAS, 'com os dois');

  // O disco podre nunca abre as abas numa pessoa sem respostas.
  for (const podre of ['', '   ', 'nao e json', '{', 'null', '[]', JSON.stringify({ respuestas: {} })]) {
    assert.equal(
      rotaDeAbertura(podre, true, ABAS),
      RUTAS.APRESENTACAO,
      `disco podre (${JSON.stringify(podre)}) devia cair na apresentacao`
    );
  }

  /* A URL DA PORTA mudou de forma na fusao e o mapa mudou de arquivo. La a
   * apresentacao era '/madre-maria' na raiz do app dela; aqui a Madre inteira
   * vive sob 'amor' (App.js do Cosmic) e a porta e a string VAZIA — ou seja,
   * /cosmic-guide/amor abre direto nela, que e a URL curta que o card entrega.
   * O mapa mora em madremaria/enlaces.js e nao no MadreMariaApp.js: aquele
   * entra por lazy() e o linking e lido antes de qualquer chunk chegar. */
  const ENLACES = ler('../madremaria/enlaces.js');
  assert.match(ENLACES, /\[RUTAS\.APRESENTACAO\]: ''/);
  assert.match(ler('../App.js'), /\[ROUTES\.MADRE_MARIA\]: \{ path: 'amor', screens: ENLACES_MADRE \}/);
  assert.match(APP, /<Stack\.Screen name=\{RUTAS\.APRESENTACAO\} component=\{ApresentacaoScreen\} \/>/);
});

test('a tela mostra o video dela, com poster, sem tocar sozinha, e sai por replace', () => {
  /* FUSAO: os assets da Madre moram em assets/madremaria/, e as telas dela
   * subiram um nivel (madremaria/screens/) — dai o '../../'. O require tem de
   * continuar ESTATICO: o Metro so resolve asset por literal, e um caminho
   * montado em runtime vira video que nunca carrega, sem erro nenhum. */
  assert.match(TELA, /require\('\.\.\/\.\.\/assets\/madremaria\/video\/madre-maria\.mp4'\)/);
  assert.match(TELA, /require\('\.\.\/\.\.\/assets\/madremaria\/video\/madre-maria-poster\.jpg'\)/);
  for (const arquivo of ['../assets/madremaria/video/madre-maria.mp4', '../assets/madremaria/video/madre-maria-poster.jpg']) {
    assert.ok(existsSync(new URL(arquivo, __RAIZ_URL)), arquivo);
  }
  // Leve o bastante para a primeira tela num celular: ate 4MB.
  assert.ok(statSync(new URL('../assets/madremaria/video/madre-maria.mp4', __RAIZ_URL)).size < 4 * 1024 * 1024);
  assert.match(TELA, /from 'expo-video'/);
  assert.match(TELA, /nativeControls=\{false\}/);
  // Nao toca sozinha: nenhum play() fora do toque, pause explicito na montagem
  // (a web comeca sozinha sem ele — visto em producao em 10/09), e o poster
  // cobre a tela ate o primeiro toque.
  assert.doesNotMatch(TELA, /autoplay|autoPlay|p\.play\(\)/);
  assert.match(TELA, /useVideoPlayer\(VIDEO_APRESENTACAO, \(p\) => \{[\s\S]*?p\.pause\(\)/);
  assert.match(TELA, /!jaTocou \?/);
  assert.match(TELA, /t\('apresentacao\.texto'\)/);
  assert.match(TELA, /navigation\.replace\(RUTAS\.ONBOARDING\)/);
  assert.doesNotMatch(TELA, /guardarSeguro|CLAVES_HILO_ROJO|BotaoOuvir/);
  const app = JSON.parse(ler('../app.json')).expo;
  assert.ok(app.plugins.includes('expo-video'), 'plugin expo-video ausente');
  assert.ok(JSON.parse(ler('../package.json')).dependencies['expo-video']);
});

test('o texto e o que ela diz no video, dentro da doutrina', () => {
  const texto = t('apresentacao.texto');
  assert.match(texto, /Eu sou a Madre Maria\./);
  for (const parte of [/perguntas/, /cartas/, /treze luas/, /Senta aqui comigo\?$/]) assert.match(texto, parte);
  for (const chave of ['apresentacao.sobreceja', 'apresentacao.titulo', 'apresentacao.botao', 'apresentacao.video.assistir', 'apresentacao.video.pausar', 'apresentacao.video.nota']) {
    assert.ok(t(chave) && !t(chave).startsWith('apresentacao.'), chave);
  }
  for (const proibido of [
    /\bvolt\w*/i, /reconquist/i, /\d/, /%/, /\b(ele|ela|dele|dela)\b/i,
    /\b(sorte|destino|energia|cura|curar|espiritual)\b/i, /gr[aá]tis|pix|pre[çç]o|pagar/i,
    /\b(querida|senhora|dona)\b/i, /\b(sozinh|cansad|pront)[ao]\b/i, /\.\.\./,
  ]) assert.doesNotMatch(texto, proibido, String(proibido));
});

test('o texto acende com o video: os tempos batem palavra por palavra e cabem na duracao', () => {
  const TEMPOS = JSON.parse(ler('../madremaria/datos/apresentacao-tempos.json'));
  assert.ok(TEMPOS.duracao > 15 && TEMPOS.duracao < 45, 'duracao fora do esperado');
  assert.ok(TEMPOS.trechos.length >= 6);
  assert.equal(TEMPOS.trechos.map((x) => x.texto).join(' '), t('apresentacao.texto'));
  let anterior = -1;
  for (const x of TEMPOS.trechos) {
    assert.ok(Number.isFinite(x.ini) && Number.isFinite(x.fim) && x.ini >= anterior && x.fim >= x.ini, x.texto);
    assert.ok(x.fim <= TEMPOS.duracao + 0.5, x.texto);
    anterior = x.ini;
  }
  assert.match(TELA, /useFraseAtual\(player, TRECHOS/);
  assert.match(TELA, /<TextoNoRitmo/);
});

test('a abertura das cartas nao se apresenta duas vezes', () => {
  const segunda = t('entrada.apresentacao');
  assert.match(segunda, /Madre Maria/);
  assert.doesNotMatch(segunda, /^Eu sou a Madre Maria/);
});
