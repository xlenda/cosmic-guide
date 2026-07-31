// Testes dos Brindes da Loja (lib/brindes.js + posse em lib/cosmeticRewards.js):
// a regra dura "só entra brinde com efeito real" vira asserção — todo brinde
// digital de conteúdo TEM conteúdo embutido, físicos ficam desligados atrás da
// flag, e a posse (compra única) persiste. Mesmo esquema de mock por
// require-cache dos outros testes (missions.test.js).
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const mem = new Map();

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return mem.has(k) ? mem.get(k) : null;
    },
    async setItem(k, v) {
      mem.set(k, String(v));
    },
    async removeItem(k) {
      mem.delete(k);
    },
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'react-native') return { __esModule: true, Platform: { OS: 'test' } };
  return originalLoad.call(this, request, parent, isMain);
};

const brindes = require('../lib/brindes.js');
const rewards = require('../lib/cosmeticRewards.js');

test('físicos ficam DESLIGADOS: flag false e nenhum item físico na lista disponível', () => {
  assert.strictEqual(
    brindes.BRINDES_FISICOS_ATIVOS,
    false,
    'só ligue BRINDES_FISICOS_ATIVOS com a logística decidida (estoque/frete/endereço/LGPD)'
  );
  const visiveis = brindes.getBrindesDisponiveis();
  assert.ok(visiveis.length > 0, 'os brindes digitais têm que aparecer');
  assert.ok(visiveis.every((b) => !b.fisico), 'nenhum brinde físico pode vazar com a flag desligada');
  // ...mas a estrutura deles existe, pronta pra ligar depois.
  assert.ok(brindes.BRINDES.some((b) => b.fisico), 'estrutura dos físicos deve existir no catálogo');
});

test('catálogo saudável: ids únicos, custo positivo e campos de card completos', () => {
  const ids = brindes.BRINDES.map((b) => b.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'id de brinde duplicado');
  for (const b of brindes.BRINDES) {
    assert.ok(Number.isFinite(b.cost) && b.cost > 0, `custo inválido em ${b.id}`);
    assert.ok(b.icon, `card sem ícone em ${b.id}`);
    // title/description saíram daqui de propósito: são traduzidos e moram no
    // dicionário (loja.brinde.<id>.*). Quem guarda que existem nos três
    // idiomas é test/i18nKeysExist.test.js — se voltarem para cá, a Loja volta
    // a mostrar português para quem usa o app em es/en.
    assert.ok(!('title' in b) && !('description' in b), `${b.id}: texto de card pertence ao dicionário, não ao catálogo`);
    assert.ok(['conteudo', 'repetivel', 'fisico'].includes(b.kind), `kind desconhecido em ${b.id}: ${b.kind}`);
  }
});

test('regra do efeito real: todo brinde de conteúdo tem conteúdo embutido de verdade', () => {
  for (const b of brindes.BRINDES.filter((x) => x.kind === 'conteudo')) {
    const c = brindes.BRINDE_CONTEUDO[b.id];
    assert.ok(c, `brinde ${b.id} sem conteúdo em BRINDE_CONTEUDO — violaria a regra do commit 123078a`);
    const temTexto = Array.isArray(c.secoes) && c.secoes.length > 0 && c.secoes.every((s) => s.t && s.p && s.p.length > 40);
    assert.ok(temTexto, `conteúdo raso demais em ${b.id}`);
  }
  // Sem repetíveis no catálogo: o "escudo extra" saiu na auditoria de 27/07
  // por ser o MESMO produto (custo e efeito idênticos) do Escudo da Sequência
  // que as REWARDS da Loja já vendem — produto duplicado confunde, não soma.
  const repetiveis = brindes.BRINDES.filter((x) => x.kind === 'repetivel').map((x) => x.id);
  assert.deepStrictEqual(repetiveis, []);
});

test('wallpapers: entrega embutida (data URI svg), determinística e com os 3 fundos', () => {
  assert.strictEqual(brindes.WALLPAPERS.length, 3);
  for (const w of brindes.WALLPAPERS) {
    assert.ok(w.uri.startsWith('data:image/svg+xml'), `wallpaper ${w.nome} não é entrega embutida`);
    assert.ok(w.nome && w.arquivo, `wallpaper sem nome/arquivo`);
  }
  // Determinístico: importar de novo tem que gerar exatamente os mesmos bytes
  // (o preview que a pessoa vê é o arquivo que ela baixa).
  delete require.cache[require.resolve('../lib/brindes.js')];
  const denovo = require('../lib/brindes.js');
  assert.deepStrictEqual(
    denovo.WALLPAPERS.map((w) => w.uri),
    brindes.WALLPAPERS.map((w) => w.uri)
  );
});

test('posse de brinde (compra única): grant/has/getOwned persistem e id desconhecido é false', async () => {
  mem.clear();
  assert.strictEqual(await rewards.hasBrinde('brinde-ritual-lua'), false);
  assert.deepStrictEqual(await rewards.getOwnedBrindes(), {});

  await rewards.grantBrinde('brinde-ritual-lua');
  assert.strictEqual(await rewards.hasBrinde('brinde-ritual-lua'), true);
  assert.strictEqual(await rewards.hasBrinde('brinde-wallpapers'), false, 'posse não pode vazar entre brindes');

  await rewards.grantBrinde('brinde-wallpapers');
  const owned = await rewards.getOwnedBrindes();
  assert.deepStrictEqual(owned, { 'brinde-ritual-lua': true, 'brinde-wallpapers': true });

  // Dado corrompido não derruba: volta pro mapa vazio.
  mem.set('cosmic-reward-brindes', '{quebrado');
  assert.deepStrictEqual(await rewards.getOwnedBrindes(), {});
});
