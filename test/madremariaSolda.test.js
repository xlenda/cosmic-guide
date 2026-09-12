// A SOLDA DE CAFE E PALMA — o portao que impede a religacao silenciosa.
//
// Cafe e palma sao UM SO no app (decisao do dono, 11/09/2026): quem le a borra e
// a mao e o COSMIC GUIDE. As telas da Madre (RitualCafeScreen, RitualMaoScreen)
// nao vieram na copia, e com elas sairam lib/camara.js, lib/camaraExpo.js,
// lib/visao.js e lib/api.js.
//
// A SOLDA FOI FEITA em 11/09/2026: 'cafe' e 'mao' apontam para ROUTES.COFFEE e
// ROUTES.PALM, as telas do Cosmic. Este arquivo deixou de guardar a AUSENCIA dos
// destinos e passou a guardar a CORRECAO deles.
//
// POR QUE ESTE TESTE EXISTE: o botao do plano navega por NOME, e o nome sobe das
// abas da Madre para o HomeStack do Cosmic sozinho (TabRouter devolve null para
// nome que nao conhece, useOnAction sobe a acao ao pai). Isso e elegante e e
// FRAGIL de um jeito silencioso, em tres pontos que este arquivo cobre:
//
//   1. Se alguem trocar o destino por um nome inventado ou pelos antigos
//      'RitualCafe'/'RitualMao', o toque navega para uma rota que nao existe. O
//      React Navigation so avisa em __DEV__: em producao o botao nao faz nada.
//   2. Se alguem renomear COFFEE/PALM no routes.js do Cosmic, a Madre continua
//      pedindo o nome velho e o botao morre calado.
//   3. Se alguem declarar uma rota 'Coffee' ou 'Palm' dentro de madremaria/, o
//      TabRouter da Madre passa a CAPTURAR a navegacao antes de ela subir, e o
//      botao abre a tela errada — o pior dos tres, porque algo acontece na tela e
//      parece que funcionou.
//
// Leia o bloco ★ em madremaria/screens/PlanoScreen.js antes de mexer.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const TELA = path.join(__dirname, '..', 'madremaria', 'screens', 'PlanoScreen.js');

/** Extrai o mapa e a funcao sem importar a tela (ela puxa react-native inteiro). */
function carregarDestinoDoRitual() {
  const src = fs.readFileSync(TELA, 'utf8');
  const mapa = src.match(/const DESTINO_POR_RITUAL = Object\.freeze\(\{[\s\S]*?\n\}\);/);
  const fn = src.match(/export function destinoDoRitual[\s\S]*?\n\}/);
  assert.ok(mapa, 'DESTINO_POR_RITUAL sumiu de PlanoScreen.js');
  assert.ok(fn, 'destinoDoRitual() sumiu de PlanoScreen.js — ver ★ PONTO DE SOLDA');
  const RUTAS = { REOUVIR_ENTRADA: 'ReouvirEntrada' };
  // ROUTES vem do routes.js REAL do Cosmic, nao de um stub: e isso que faz o
  // teste quebrar se alguem renomear COFFEE/PALM la (o ponto 2 do cabecalho).
  // Um stub aqui transformaria este arquivo num teste que sempre passa.
  const ROUTES = lerRoutesDoCosmic();
  // eslint-disable-next-line no-eval
  return eval(
    `(()=>{${mapa[0].replace('const', 'var')};${fn[0].replace('export ', '')};return destinoDoRitual;})()`
  );
}

/** O objeto ROUTES do Cosmic, lido do disco sem importar o modulo ESM. */
function lerRoutesDoCosmic() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'routes.js'), 'utf8');
  const bloco = src.match(/export const ROUTES = \{[\s\S]*?\n\};/);
  assert.ok(bloco, 'ROUTES sumiu do routes.js do Cosmic');
  // eslint-disable-next-line no-eval
  return eval(`(()=>{${bloco[0].replace('export ', '')};return ROUTES;})()`);
}

test('cafe e mao abrem as telas do Cosmic — a solda esta ligada', () => {
  const destinoDoRitual = carregarDestinoDoRitual();
  const ROUTES = lerRoutesDoCosmic();
  assert.equal(destinoDoRitual('cafe'), ROUTES.COFFEE);
  assert.equal(destinoDoRitual('mao'), ROUTES.PALM);
});

// Ponto 2 do cabecalho: o nome que a Madre pede tem de ser um nome que o Cosmic
// de fato registra. Comparar destinoDoRitual com ROUTES.COFFEE nao basta sozinho
// — se as duas pontas mudassem juntas para um nome nao registrado, o teste acima
// continuaria verde e o botao estaria morto.
test('COFFEE e PALM sao telas registradas no HomeStack do Cosmic', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'App.js'), 'utf8');
  assert.match(app, /<Stack\.Screen name=\{ROUTES\.COFFEE\}/);
  assert.match(app, /<Stack\.Screen name=\{ROUTES\.PALM\}/);
});

// Ponto 3 do cabecalho, e o mais perigoso: uma rota homonima dentro da Madre
// captura a navegacao antes de ela subir ao Cosmic, e o botao abre a tela errada
// sem erro nenhum.
test('madremaria/routes.js nao declara nenhum nome que colida com COFFEE ou PALM', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'madremaria', 'routes.js'),
    'utf8'
  );
  const ROUTES = lerRoutesDoCosmic();
  // So os VALORES declarados (o que vira nome de rota), ignorando comentarios —
  // os dois nomes aparecem em prosa no arquivo, de proposito.
  const semComentarios = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const valores = (semComentarios.match(/'[^']*'/g) || []).map((s) => s.slice(1, -1));
  assert.equal(valores.includes(ROUTES.COFFEE), false, `a Madre declarou '${ROUTES.COFFEE}'`);
  assert.equal(valores.includes(ROUTES.PALM), false, `a Madre declarou '${ROUTES.PALM}'`);
});

test('sonho e respiro seguem sem tela — o gesto acontece fora do telefone', () => {
  const destinoDoRitual = carregarDestinoDoRitual();
  assert.equal(destinoDoRitual('sonho'), null);
  assert.equal(destinoDoRitual('respiro'), null);
});

test('cartas continua abrindo a leitura dela', () => {
  const destinoDoRitual = carregarDestinoDoRitual();
  assert.equal(destinoDoRitual('cartas'), 'ReouvirEntrada');
});

test('ritual desconhecido devolve null, nunca undefined (fallback honesto)', () => {
  const destinoDoRitual = carregarDestinoDoRitual();
  assert.equal(destinoDoRitual('inexistente'), null);
});

// As telas nao podem ter voltado pela porta dos fundos.
test('RitualCafeScreen e RitualMaoScreen nao existem em madremaria/', () => {
  const screens = path.join(__dirname, '..', 'madremaria', 'screens');
  assert.equal(fs.existsSync(path.join(screens, 'RitualCafeScreen.js')), false);
  assert.equal(fs.existsSync(path.join(screens, 'RitualMaoScreen.js')), false);
});

// O Circulo ficou de fora, e lib/circulo.js e quem o implementava.
test('lib/circulo.js nao veio para madremaria/', () => {
  assert.equal(
    fs.existsSync(path.join(__dirname, '..', 'madremaria', 'lib', 'circulo.js')),
    false
  );
});

/* ===================================================================================
   A LEI DE NAO FABRICAR, NO CAMINHO DA DESISTENCIA
   Quem abre o cafe do Cosmic e sai no meio (ou nega a camera) NAO pode ter o dia
   dado por vivido. A defesa nao e um if: e a ausencia de qualquer gancho na volta.
   O no do dia ja foi atado la atras, por raspar o veu (o gesto de presenca desde
   01/09), e atarNudo e idempotente no dia.

   O que quebraria isso e um `.then()` pendurado na navegacao do ritual ou um
   listener de 'focus' que atasse o no ao voltar — os dois parecem melhorias
   inocentes ("marcar que ela fez o ritual") e os dois premiariam quem desistiu.
   =================================================================================== */
test('a navegacao do ritual nao tem gancho de volta — nada e marcado ao voltar', () => {
  const src = fs.readFileSync(TELA, 'utf8');
  const semComentarios = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  // `ir()` navega e devolve um booleano. Encadear .then() nela so faria sentido
  // para reagir a uma VOLTA que a navegacao nao entrega — e o valor de que
  // reagiriam seria inventado.
  assert.equal(/\bir\([^)]*\)\s*\.then/.test(semComentarios), false,
    'ir() ganhou um .then(): a volta da tela do Cosmic nao devolve resultado, entao qualquer coisa marcada ali e fabricada');

  // O no do dia ata em UM lugar so, e e o veu.
  const atadas = semComentarios.match(/atarNudo\(/g) || [];
  assert.equal(atadas.length, 1,
    `atarNudo aparece ${atadas.length}x em PlanoScreen.js — deve atar so em aoRasparODia (o veu)`);
  const aoRaspar = semComentarios.match(/const aoRasparODia = useCallback\([\s\S]*?\n  \}, \[dia\]\);/);
  assert.ok(aoRaspar, 'aoRasparODia sumiu — era ele que atava o no do dia');
  assert.match(aoRaspar[0], /atarNudo\(dia\)/);
});

// O isolamento dos dados e UMA linha, e e ela que impede os dois apps de se
// misturarem no mesmo AsyncStorage.
test('o pote da Madre e isolado: PREFIJO = mm-hr.', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'madremaria', 'lib', 'almacen.js'),
    'utf8'
  );
  assert.match(src, /const PREFIJO = 'mm-hr\.';/);
});
