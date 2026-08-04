// RECAPTURA DO GOLDEN DO PENSAMENTO E DO PAPEL DE PAREDE — deliberada.
//
// Mesmo espírito de scripts/recapturar-golden-seita.js: o golden existe pra
// que nenhuma mudança de texto passe despercebida, então este script não roda
// sozinho em canto nenhum. Ele imprime o que vai mudar e só grava com
// --confirmar.
//
// A recaptura de 03/08/2026 foi por causa da ÂNCORA ÚNICA DA LUA: o golden
// tinha sido capturado quando dailyThought e cosmicSound perguntavam a fase no
// meio-dia UTC, e o app inteiro passou a perguntar no meio-dia LOCAL — a mesma
// âncora da grade do Calendário Lunar. Num aparelho a oeste de Greenwich as
// duas coisas são horas diferentes, e perto de uma borda de fase dão rótulos
// diferentes. Os dias que mudam aqui são exatamente os que estavam em cima de
// uma borda.
//
// Uso:
//   node -r ./test/setup.js scripts/recapturar-golden-pensamento.js
//   node -r ./test/setup.js scripts/recapturar-golden-pensamento.js --confirmar
const fs = require('node:fs');
const path = require('node:path');

const DT = require('../lib/dailyThought.js');
const W = require('../lib/wallpaper.js');

const RAIZ = path.join(__dirname, '..');
const CAMINHO = path.join(RAIZ, 'test', 'golden', 'pensamento.pt.golden.json');
const GOLDEN = JSON.parse(fs.readFileSync(CAMINHO, 'utf8'));

// As MESMAS entradas do teste (test/pensamentoIdiomas.test.js).
const noon = (iso) => new Date(`${iso}T12:00:00`);
// AS MESMAS constantes do teste — copiadas de la, nao deduzidas. A
// primeira versao usou `emoji` no lugar de `icon` e `2026-07-31` no lugar
// de `2024-01-25`, e o diff apareceu cheio de mudanca que nao existia (o
// glifo do signo sumindo do inicio da frase). Golden e literal: se a
// entrada nao for identica, o que ele grava e ficcao.
const diaAs = (hora, minuto = 0) => new Date(2024, 0, 25, hora, minuto, 0);
const TOURO = { name: 'Touro', icon: '♉' };
const CAPRI = { name: 'Capricórnio', icon: '♑' };

const mudancas = [];
function registrar(onde, antes, agora) {
  if (JSON.stringify(antes) === JSON.stringify(agora)) return false;
  mudancas.push({ onde, antes, agora });
  return true;
}

// ---- pensamento do dia -----------------------------------------------------
const novoThought = {};
for (const iso of Object.keys(GOLDEN.dailyThought.getThoughtForDate)) {
  novoThought[iso] = {
    semSigno: DT.getThoughtForDate(noon(iso), null),
    touro: DT.getThoughtForDate(noon(iso), TOURO),
    capricornio: DT.getThoughtForDate(noon(iso), CAPRI),
  };
  for (const k of ['semSigno', 'touro', 'capricornio']) {
    registrar(`pensamento ${iso}/${k}`, GOLDEN.dailyThought.getThoughtForDate[iso][k], novoThought[iso][k]);
  }
}

const novoHoje = {};
for (const hora of Object.keys(GOLDEN.dailyThought.getTodaysThought)) {
  const quando = diaAs(Number(hora));
  novoHoje[hora] = {
    semSigno: DT.getTodaysThought(null, quando),
    touro: DT.getTodaysThought(TOURO, quando),
  };
  for (const k of Object.keys(novoHoje[hora])) {
    registrar(`hoje ${hora}h/${k}`, GOLDEN.dailyThought.getTodaysThought[hora][k], novoHoje[hora][k]);
  }
}

// ---- papel de parede -------------------------------------------------------
const novoWall = {};
for (const iso of Object.keys(GOLDEN.wallpaper.getWallpaperData)) {
  novoWall[iso] = W.getWallpaperData(noon(iso));
  registrar(`wallpaper ${iso}`, GOLDEN.wallpaper.getWallpaperData[iso], novoWall[iso]);
}

console.log('=== o que muda ===\n');
for (const m of mudancas) {
  console.log('  %s', m.onde);
  console.log('    antes: %s', JSON.stringify(m.antes).slice(0, 180));
  console.log('    agora: %s\n', JSON.stringify(m.agora).slice(0, 180));
}
console.log('%d campos mudaram.\n', mudancas.length);

if (!process.argv.includes('--confirmar')) {
  console.log('Nada foi gravado. Se o diff acima é o esperado, rode de novo com --confirmar.');
  process.exit(0);
}

GOLDEN.dailyThought.getThoughtForDate = novoThought;
GOLDEN.dailyThought.getTodaysThought = novoHoje;
GOLDEN.wallpaper.getWallpaperData = novoWall;
fs.writeFileSync(CAMINHO, JSON.stringify(GOLDEN, null, 2) + '\n', 'utf8');
console.log('golden regravado: %s', path.relative(RAIZ, CAMINHO));
