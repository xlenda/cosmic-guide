// A arte das missões diárias (lote dos cards e ícones, 12/09/2026).
//
// O que este teste segura: as missões passaram a mostrar a MESMA ilustração
// que a feature de destino já usa na grade da Home, em vez do emoji de 20px.
// A ligação é uma STRING (`arte: 'tarot'`) resolvida em runtime por
// tileArte() — string errada não quebra o build, não estoura no console e
// ninguém percebe: a missão só volta silenciosamente pro emoji. É exatamente
// o tipo de erro que precisa de teste.
//
// E segura também o outro lado: o emoji NÃO pode sumir de nenhuma missão. A
// regra da obra é complementar, nunca substituir — onde não há arte, o emoji
// é o que existe, e apagá-lo deixaria a linha sem nenhum sinal visual.
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

// Mesmo esquema de mock por require-cache dos outros testes: missions.js puxa
// AsyncStorage e (via journal → webPush) o Platform do react-native.
const mem = new Map();
const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) { return mem.has(k) ? mem.get(k) : null; },
    async setItem(k, v) { mem.set(k, String(v)); },
    async removeItem(k) { mem.delete(k); },
    async multiRemove(keys) { keys.forEach((k) => mem.delete(k)); },
  },
};
const reactNativeMock = { __esModule: true, Platform: { OS: 'test' } };
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'react-native') return reactNativeMock;
  return originalLoad.call(this, request, parent, isMain);
};

const { MISSION_POOL, getTodaysMissions } = require('../lib/missions.js');

const RAIZ = path.join(__dirname, '..');
const REGISTRO = fs.readFileSync(path.join(RAIZ, 'lib/ilustracoes.js'), 'utf8');
const CARD = fs.readFileSync(path.join(RAIZ, 'components/DailyMissionsCard.js'), 'utf8');

// O bloco TILES do registro, lido como texto: chave → caminho do arquivo.
// (Ler o texto em vez de importar o módulo é o que permite provar que o JPEG
// EXISTE no disco — o require() de asset só resolve dentro do Metro.)
function tilesDoRegistro() {
  const inicio = REGISTRO.indexOf('export const TILES');
  assert.ok(inicio > -1, 'TILES sumiu de lib/ilustracoes.js');
  const fim = REGISTRO.indexOf('export function tileArte', inicio);
  const bloco = REGISTRO.slice(inicio, fim);
  const mapa = new Map();
  for (const m of bloco.matchAll(/(\w+):\s*require\('([^']+)'\)/g)) mapa.set(m[1], m[2]);
  return mapa;
}

test('toda missão com `arte` aponta pra uma chave REAL de TILES, e o JPEG existe no disco', () => {
  const tiles = tilesDoRegistro();
  const comArte = MISSION_POOL.filter((m) => m.arte);
  // Se alguém apagar os `arte` do pool inteiro o teste acima passaria vazio.
  assert.ok(comArte.length >= 9, `esperava 9+ missões com arte, achei ${comArte.length}`);

  for (const m of comArte) {
    assert.ok(tiles.has(m.arte), `missão '${m.id}': arte '${m.arte}' não é chave de TILES`);
    const arquivo = path.join(RAIZ, 'lib', tiles.get(m.arte));
    assert.ok(fs.existsSync(arquivo), `missão '${m.id}': ${tiles.get(m.arte)} não existe no disco`);
  }
});

test('NENHUMA missão perdeu o emoji — a arte complementa, não substitui', () => {
  for (const m of MISSION_POOL) {
    assert.ok(m.emoji && m.emoji.length > 0, `missão '${m.id}' ficou sem emoji`);
  }
});

test('getTodaysMissions entrega a chave de arte pra tela (senão o card nunca vê)', async () => {
  const hoje = await getTodaysMissions(new Date(2026, 0, 15, 10, 0, 0));
  assert.ok(hoje.length > 0);
  for (const m of hoje) {
    const def = MISSION_POOL.find((d) => d.id === m.id);
    assert.strictEqual(m.arte, def.arte || null, `missão '${m.id}': arte não chegou na tela`);
  }
  // As três fixas entram todo dia; duas delas têm arte — se o campo for
  // descartado no caminho, isto cai.
  const compat = hoje.find((m) => m.id === 'ver-compatibilidade');
  assert.strictEqual(compat.arte, 'compatibility');
});

test('o card resolve a arte por tileArte e mantém o caminho do emoji', () => {
  assert.match(CARD, /import \{ tileArte \} from '\.\.\/lib\/ilustracoes'/);
  assert.match(CARD, /tileArte\(m\.arte\)/);
  // O fallback: sem arte, ainda existe um <Text> com o emoji da missão.
  assert.match(CARD, /\{m\.emoji\}/);
});
