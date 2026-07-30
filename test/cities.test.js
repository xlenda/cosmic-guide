// Testes de lib/cities.js — a camada fina sobre a busca do servidor.
//
// O que estes testes protegem, em ordem de importância:
//
//   1. O CADASTRO NUNCA TRAVA. A tela de nascimento é a porta de entrada do
//      app: sem rede, com o servidor fora, com JSON quebrado ou com o banco de
//      cidades ainda não gerado (503), a reserva embutida continua atendendo e
//      a pessoa termina o cadastro. Nada aqui pode lançar.
//   2. NÃO METRALHAR O SERVIDOR. Busca-enquanto-digita com debounce: 14 teclas
//      viram 1 requisição, e resposta velha que chega atrasada é descartada
//      (senão a lista pisca entre respostas fora de ordem).
//   3. QUEM JÁ TEM CIDADE SALVA NÃO PERDE NADA. Os ids antigos continuam
//      resolvendo, e o upgrade pro fuso IANA preserva as coordenadas salvas.
//   4. O CONTRATO COM O SERVIDOR. Os 6 campos que o app sempre usou (id, name,
//      admin, country, lat, lon, utcOffset) chegam com a MESMA semântica.
//
// Mesmo esquema de mock por require-cache dos outros testes deste diretório
// (funnel.test.js, birthData.mirror.test.js): AsyncStorage em memória. O fetch
// entra por injeção (opção `fetchImpl`), sem tocar no global.
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

const loadOriginal = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return loadOriginal.apply(this, arguments);
};

const cities = require('../lib/cities');
const {
  CITIES,
  searchCities,
  cityById,
  cityLabel,
  normalize,
  isRemoteCityId,
  searchCitiesRemote,
  createCitySearch,
  fetchCityById,
  resolveCityById,
  upgradeCityTimezone,
  classifyCityError,
  _resetCityCaches,
} = cities;

// A lista de ids que o servidor sabe traduzir (server-patches/scripts/
// legacy-cities.json alimenta a tabela legacy_city_ids).
const PONTE = require('../server-patches/scripts/legacy-cities.json');

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Resposta REAL da rota, copiada do enunciado da tarefa (execução contra o
// banco gerado). Usar o payload verdadeiro é o que impede o teste de validar
// um formato que só existe na cabeça de quem escreveu o cliente.
const RESPOSTA_JUNQUEIROPOLIS = {
  query: 'junqueiropolis',
  lang: 'pt',
  count: 1,
  items: [
    {
      id: 'gn-3459452',
      geonameid: 3459452,
      name: 'Junqueirópolis',
      admin: 'SP',
      country: 'Brasil',
      countryCode: 'BR',
      lat: -21.51472,
      lon: -51.43361,
      utcOffset: -3,
      timezone: 'America/Sao_Paulo',
      population: 20448,
      utcOffsetAt: -2,
      utcOffsetAtMinutes: -120,
      dstAt: true,
    },
  ],
  attribution: 'GeoNames (CC BY 4.0) — https://www.geonames.org',
};

function respostaOk(corpo) {
  return { ok: true, status: 200, json: async () => corpo };
}
function respostaStatus(status, corpo) {
  return { ok: false, status, json: async () => corpo || {} };
}

// Um fetch falso que registra as URLs chamadas.
function fakeFetch(responder) {
  const chamadas = [];
  const f = async (url) => {
    chamadas.push(url);
    const r = await responder(url, chamadas.length);
    if (r instanceof Error) throw r;
    return r;
  };
  f.chamadas = chamadas;
  return f;
}

test.beforeEach(() => {
  mem.clear();
  _resetCityCaches();
});

// ===========================================================================
// A RESERVA OFFLINE
// ===========================================================================
test('a reserva tem ~150 cidades e TODAS têm fuso IANA (senão o horário de verão não teria como funcionar offline)', () => {
  assert.ok(CITIES.length >= 120 && CITIES.length <= 155, `reserva com ${CITIES.length} cidades`);
  const semFuso = CITIES.filter((c) => !c.timezone);
  assert.deepStrictEqual(semFuso, []);
  // E todo fuso é conhecido pela tzdata (id digitado errado morre aqui, não no
  // celular de alguém).
  for (const c of CITIES) {
    assert.doesNotThrow(
      () => new Intl.DateTimeFormat('en-US', { timeZone: c.timezone }),
      `fuso inválido em ${c.id}: ${c.timezone}`
    );
  }
});

test('as 27 capitais brasileiras continuam na reserva (cobertura mínima offline de todos os estados)', () => {
  const ufs = new Set(CITIES.filter((c) => c.country === 'Brasil').map((c) => c.admin));
  assert.strictEqual(ufs.size, 27, [...ufs].sort().join(','));
});

test('TODO id da reserva resolve na ponte do servidor — ninguém escolhe offline uma cidade que o servidor não conhece', () => {
  const naPonte = new Set(PONTE.map((c) => c.id));
  const orfaos = CITIES.filter((c) => !naPonte.has(c.id)).map((c) => c.id);
  assert.deepStrictEqual(orfaos, []);
});

test('as cidades que vieram da lista antiga mantêm id, nome e coordenadas byte a byte', () => {
  const antigas = new Map(PONTE.map((c) => [c.id, c]));
  let conferidas = 0;
  for (const c of CITIES) {
    const velha = antigas.get(c.id);
    if (!velha) continue;
    assert.strictEqual(c.name, velha.name, c.id);
    assert.strictEqual(c.admin, velha.admin, c.id);
    assert.strictEqual(c.country, velha.country, c.id);
    assert.strictEqual(c.lat, velha.lat, c.id);
    assert.strictEqual(c.lon, velha.lon, c.id);
    assert.strictEqual(c.utcOffset, velha.utcOffset, c.id);
    conferidas++;
  }
  assert.strictEqual(conferidas, CITIES.length);
});

test('a busca local continua ignorando acento, aceitando sigla e nome de estado por extenso', () => {
  assert.strictEqual(searchCities('uberlandia')[0].name, 'Uberlândia');
  assert.strictEqual(searchCities('niteroi')[0].name, 'Niterói');
  assert.strictEqual(searchCities('sao ber')[0].name, 'São Bernardo do Campo');
  assert.ok(searchCities('minas').every((c) => c.admin === 'MG'));
  assert.ok(searchCities('sp').length > 0);
  // Query vazia devolve tudo, em ordem de população.
  assert.strictEqual(searchCities('').length, CITIES.length);
  assert.strictEqual(searchCities('')[0].name, 'São Paulo');
  // Termo inexistente devolve lista vazia (e não a lista inteira).
  assert.deepStrictEqual(searchCities('xyzzy'), []);
});

test('cityLabel e cityById não mudaram de forma — é o que as telas já consomem', () => {
  const sp = cityById('sao-paulo-br');
  assert.strictEqual(cityLabel(sp), 'São Paulo, SP — Brasil');
  assert.strictEqual(cityLabel(cityById('lisboa-pt')), 'Lisboa — Portugal');
  assert.strictEqual(cityById('nao-existe'), null);
  assert.strictEqual(cityLabel(null), '');
});

test('isRemoteCityId separa id do servidor de id antigo sem ambiguidade', () => {
  assert.strictEqual(isRemoteCityId('gn-3459452'), true);
  assert.strictEqual(isRemoteCityId('sao-paulo-br'), false);
  assert.strictEqual(isRemoteCityId('3459452'), false);
  assert.strictEqual(isRemoteCityId(null), false);
});

// ===========================================================================
// BUSCA REMOTA
// ===========================================================================
test('a busca remota devolve Junqueirópolis com os 6 campos de sempre + o fuso', async () => {
  const f = fakeFetch(() => respostaOk(RESPOSTA_JUNQUEIROPOLIS));
  const r = await searchCitiesRemote('junqueiropolis', { at: '2015-01-20T14:30', fetchImpl: f });

  assert.strictEqual(r.items.length, 1);
  const c = r.items[0];
  // Os 6 campos que o app já usava, com a MESMA semântica.
  assert.strictEqual(c.id, 'gn-3459452');
  assert.strictEqual(c.name, 'Junqueirópolis');
  assert.strictEqual(c.admin, 'SP');
  assert.strictEqual(c.country, 'Brasil');
  assert.strictEqual(c.lat, -21.51472);
  assert.strictEqual(c.lon, -51.43361);
  assert.strictEqual(c.utcOffset, -3);
  // O que é novo.
  assert.strictEqual(c.timezone, 'America/Sao_Paulo');
  assert.strictEqual(c.utcOffsetAt, -2);
  assert.strictEqual(c.dstAt, true);
  // E passa direto pelo que a tela já faz com uma cidade.
  assert.strictEqual(cityLabel(c), 'Junqueirópolis, SP — Brasil');
});

test('a URL leva q, lang, limit e o at (data+hora de nascimento) devidamente escapados', async () => {
  const f = fakeFetch(() => respostaOk({ items: [] }));
  await searchCitiesRemote('Junqueirópolis', { lang: 'es', at: '2015-01-20T14:30', limit: 7, fetchImpl: f });
  const url = f.chamadas[0];
  assert.ok(url.startsWith('https://api.cosmicguide.cloud/api/cities/search?'), url);
  assert.ok(url.includes('q=Junqueir%C3%B3polis'), url);
  assert.ok(url.includes('lang=es'), url);
  assert.ok(url.includes('limit=7'), url);
  assert.ok(url.includes('at=2015-01-20T14%3A30'), url);
});

test('query de 1 caractere nem sai do aparelho (o servidor responderia 400)', async () => {
  const f = fakeFetch(() => respostaOk({ items: [] }));
  const r = await searchCitiesRemote('j', { fetchImpl: f });
  assert.deepStrictEqual(r.items, []);
  assert.strictEqual(f.chamadas.length, 0);
});

test('item malformado do servidor é descartado, não entra no cálculo como NaN', async () => {
  const f = fakeFetch(() =>
    respostaOk({
      items: [
        { id: 'gn-1', name: 'Sem coordenada', admin: '', country: 'X', utcOffset: -3 },
        { id: 'gn-2', name: '', admin: '', country: 'X', lat: 1, lon: 2, utcOffset: -3 },
        { id: 'gn-3', name: 'Boa', admin: '', country: 'X', lat: 1, lon: 2, utcOffset: -3 },
        'lixo',
        null,
      ],
    })
  );
  const r = await searchCitiesRemote('teste', { fetchImpl: f });
  assert.strictEqual(r.items.length, 1);
  assert.strictEqual(r.items[0].id, 'gn-3');
});

test('503 (banco de cidades ainda não gerado no servidor) vira o erro "indisponivel", não um 500 genérico', async () => {
  const f = fakeFetch(() => respostaStatus(503, { error: 'Busca de cidades indisponível no servidor.' }));
  await assert.rejects(
    () => searchCitiesRemote('junqueiro', { fetchImpl: f }),
    (err) => classifyCityError(err) === 'indisponivel'
  );
});

test('400 do servidor não é erro de tela: vira lista vazia', async () => {
  const f = fakeFetch(() => respostaStatus(400, { error: 'q precisa de pelo menos 2 caracteres' }));
  const r = await searchCitiesRemote('ab', { fetchImpl: f });
  assert.deepStrictEqual(r.items, []);
});

test('JSON quebrado na resposta não derruba nada — vira erro classificável', async () => {
  const f = fakeFetch(() => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new Error('Unexpected token < in JSON');
    },
  }));
  await assert.rejects(
    () => searchCitiesRemote('junqueiro', { fetchImpl: f }),
    (err) => classifyCityError(err) === 'erro'
  );
});

test('a mesma busca duas vezes só vai à rede uma vez (apagar e redigitar não custa requisição)', async () => {
  const f = fakeFetch(() => respostaOk(RESPOSTA_JUNQUEIROPOLIS));
  await searchCitiesRemote('junqueiropolis', { fetchImpl: f });
  const segunda = await searchCitiesRemote('junqueiropolis', { fetchImpl: f });
  assert.strictEqual(f.chamadas.length, 1);
  assert.strictEqual(segunda.cached, true);
  assert.strictEqual(segunda.items[0].name, 'Junqueirópolis');
});

// ===========================================================================
// DEBOUNCE E ORDEM — o que impede a UI de metralhar o servidor e de piscar
// ===========================================================================
test('digitar 14 letras dispara UMA requisição, não 14', async () => {
  const f = fakeFetch(() => respostaOk(RESPOSTA_JUNQUEIROPOLIS));
  const buscador = createCitySearch({ delay: 20, fetchImpl: f });
  const emitidos = [];
  const alvo = 'junqueiropolis';
  for (let i = 2; i <= alvo.length; i++) {
    buscador.run(alvo.slice(0, i), { emit: (e) => emitidos.push(e) });
  }
  await esperar(120);
  assert.strictEqual(f.chamadas.length, 1, `chamadas: ${f.chamadas.length}`);
  // A última emissão é a do servidor, com a cidade que o tester não achava.
  const ultima = emitidos[emitidos.length - 1];
  assert.strictEqual(ultima.source, 'remote');
  assert.strictEqual(ultima.items[0].name, 'Junqueirópolis');
});

test('enquanto a rede não responde a lista já mostra a reserva (nunca fica vazia esperando)', async () => {
  const f = fakeFetch(async () => {
    await esperar(40);
    return respostaOk({ items: [] });
  });
  const buscador = createCitySearch({ delay: 5, fetchImpl: f });
  const emitidos = [];
  buscador.run('sao paulo', { emit: (e) => emitidos.push(e) });

  // A PRIMEIRA emissão é síncrona e já tem conteúdo.
  assert.strictEqual(emitidos.length, 1);
  assert.strictEqual(emitidos[0].loading, true);
  assert.strictEqual(emitidos[0].source, 'local');
  assert.ok(emitidos[0].items.length > 0);
  assert.strictEqual(emitidos[0].items[0].name, 'São Paulo');

  await esperar(120);
  assert.strictEqual(emitidos[emitidos.length - 1].loading, false);
});

test('resposta de busca velha que chega atrasada é DESCARTADA (a lista não pisca)', async () => {
  const f = fakeFetch(async (url) => {
    // A primeira busca demora muito mais que a segunda.
    if (url.includes('q=curitiba')) {
      await esperar(80);
      return respostaOk({ items: [{ id: 'gn-1', name: 'Curitiba', admin: 'PR', country: 'Brasil', lat: -25, lon: -49, utcOffset: -3 }] });
    }
    return respostaOk({ items: [{ id: 'gn-2', name: 'Recife', admin: 'PE', country: 'Brasil', lat: -8, lon: -34, utcOffset: -3 }] });
  });
  const buscador = createCitySearch({ delay: 5, fetchImpl: f });
  const emitidos = [];
  buscador.run('curitiba', { emit: (e) => emitidos.push(e) });
  await esperar(15);
  buscador.run('recife', { emit: (e) => emitidos.push(e) });
  await esperar(200);

  const remotos = emitidos.filter((e) => e.source === 'remote');
  assert.strictEqual(remotos.length, 1);
  assert.strictEqual(remotos[0].items[0].name, 'Recife');
  assert.strictEqual(emitidos[emitidos.length - 1].items[0].name, 'Recife');
});

test('rede caindo NÃO trava o seletor: continua com a reserva e sinaliza o motivo', async () => {
  const f = fakeFetch(() => new Error('Network request failed'));
  const buscador = createCitySearch({ delay: 5, fetchImpl: f });
  const emitidos = [];
  buscador.run('sao paulo', { emit: (e) => emitidos.push(e) });
  await esperar(80);

  const ultima = emitidos[emitidos.length - 1];
  assert.strictEqual(ultima.loading, false);
  assert.strictEqual(ultima.error, 'offline');
  assert.strictEqual(ultima.source, 'local');
  assert.ok(ultima.items.length > 0);
  assert.strictEqual(ultima.items[0].name, 'São Paulo');
});

test('servidor sem o banco de cidades (503) também não trava: reserva + aviso próprio', async () => {
  const f = fakeFetch(() => respostaStatus(503, {}));
  const buscador = createCitySearch({ delay: 5, fetchImpl: f });
  const emitidos = [];
  buscador.run('junqueiro', { emit: (e) => emitidos.push(e) });
  await esperar(80);
  const ultima = emitidos[emitidos.length - 1];
  assert.strictEqual(ultima.error, 'indisponivel');
  assert.strictEqual(ultima.source, 'local');
});

test('servidor sem resultado, mas a reserva tem: mostra a reserva em vez de "nada encontrado"', async () => {
  const f = fakeFetch(() => respostaOk({ items: [] }));
  const buscador = createCitySearch({ delay: 5, fetchImpl: f });
  const emitidos = [];
  buscador.run('sao paulo', { emit: (e) => emitidos.push(e) });
  await esperar(80);
  const ultima = emitidos[emitidos.length - 1];
  assert.strictEqual(ultima.source, 'local');
  assert.ok(ultima.items.length > 0);
  assert.strictEqual(ultima.error, null);
});

test('query curta é respondida na hora pela reserva, sem debounce e sem rede', () => {
  const f = fakeFetch(() => respostaOk({ items: [] }));
  const buscador = createCitySearch({ delay: 5, fetchImpl: f });
  const emitidos = [];
  buscador.run('', { emit: (e) => emitidos.push(e) });
  assert.strictEqual(emitidos.length, 1);
  assert.strictEqual(emitidos[0].loading, false);
  assert.strictEqual(emitidos[0].items.length, CITIES.length);
  assert.strictEqual(f.chamadas.length, 0);
});

test('cancel() mata o timer: fechar o modal no meio da digitação não gera requisição', async () => {
  const f = fakeFetch(() => respostaOk({ items: [] }));
  const buscador = createCitySearch({ delay: 30, fetchImpl: f });
  buscador.run('junqueiro', { emit: () => {} });
  buscador.cancel();
  await esperar(80);
  assert.strictEqual(f.chamadas.length, 0);
});

// ===========================================================================
// IDS ANTIGOS E REIDRATAÇÃO
// ===========================================================================
test('id antigo resolve no servidor e vem com resolvedFrom, pro app regravar o id novo', async () => {
  const f = fakeFetch(() =>
    respostaOk({
      city: {
        id: 'gn-3448439',
        name: 'São Paulo',
        admin: 'SP',
        country: 'Brasil',
        lat: -23.5475,
        lon: -46.63611,
        utcOffset: -3,
        timezone: 'America/Sao_Paulo',
      },
      attribution: 'GeoNames (CC BY 4.0)',
      resolvedFrom: 'sao-paulo-br',
    })
  );
  const r = await fetchCityById('sao-paulo-br', { fetchImpl: f });
  assert.strictEqual(r.city.id, 'gn-3448439');
  assert.strictEqual(r.resolvedFrom, 'sao-paulo-br');
  assert.ok(f.chamadas[0].includes('/api/cities/sao-paulo-br'));
});

test('404 vira null (o app segue com o objeto que já tem salvo)', async () => {
  const f = fakeFetch(() => respostaStatus(404, { error: 'cidade não encontrada' }));
  assert.strictEqual(await fetchCityById('cidade-que-nao-existe-xx', { fetchImpl: f }), null);
});

test('resolveCityById atende pela reserva sem tocar na rede', async () => {
  const f = fakeFetch(() => respostaOk({ city: {} }));
  const c = await resolveCityById('sao-paulo-br', { fetchImpl: f });
  assert.strictEqual(c.name, 'São Paulo');
  assert.strictEqual(f.chamadas.length, 0);
});

test('resolveCityById busca o que não está na reserva e guarda em cache — a segunda vez é offline', async () => {
  const f = fakeFetch(() =>
    respostaOk({ city: RESPOSTA_JUNQUEIROPOLIS.items[0], attribution: 'x' })
  );
  const primeira = await resolveCityById('gn-3459452', { fetchImpl: f });
  assert.strictEqual(primeira.name, 'Junqueirópolis');
  assert.strictEqual(f.chamadas.length, 1);
  assert.ok(mem.has('cg-city:gn-3459452'), 'não gravou no cache persistente');

  const segunda = await resolveCityById('gn-3459452', { fetchImpl: f });
  assert.strictEqual(segunda.name, 'Junqueirópolis');
  assert.strictEqual(f.chamadas.length, 1);
});

test('resolveCityById devolve null (nunca lança) quando a rede está morta', async () => {
  const f = fakeFetch(() => new Error('Network request failed'));
  assert.strictEqual(await resolveCityById('gn-999999', { fetchImpl: f }), null);
});

// ===========================================================================
// UPGRADE DO FUSO — o ganho pra quem JÁ tinha cidade salva
// ===========================================================================
test('cidade que já tem fuso não vai à rede', async () => {
  const f = fakeFetch(() => respostaOk({ city: {} }));
  const c = { id: 'gn-1', name: 'X', lat: 1, lon: 2, utcOffset: -3, timezone: 'America/Sao_Paulo' };
  assert.strictEqual(await upgradeCityTimezone(c, { fetchImpl: f }), c);
  assert.strictEqual(f.chamadas.length, 0);
});

test('cidade antiga que está na reserva ganha o fuso SEM rede', async () => {
  const f = fakeFetch(() => respostaOk({ city: {} }));
  const salva = { id: 'sao-paulo-br', name: 'São Paulo', admin: 'SP', country: 'Brasil', lat: -23.5505, lon: -46.6333, utcOffset: -3 };
  const melhor = await upgradeCityTimezone(salva, { fetchImpl: f });
  assert.strictEqual(melhor.timezone, 'America/Sao_Paulo');
  assert.strictEqual(f.chamadas.length, 0);
  // Coordenadas salvas preservadas.
  assert.strictEqual(melhor.lat, -23.5505);
  assert.strictEqual(melhor.lon, -46.6333);
});

test('cidade antiga fora da reserva pega o fuso no servidor e PRESERVA as coordenadas salvas', async () => {
  const f = fakeFetch(() =>
    respostaOk({
      city: {
        id: 'gn-3466537',
        name: 'Curvelo',
        admin: 'MG',
        country: 'Brasil',
        lat: -18.7561, // levemente diferente da salva, de propósito
        lon: -44.4312,
        utcOffset: -3,
        timezone: 'America/Sao_Paulo',
      },
      resolvedFrom: 'curvelo-mg-br',
    })
  );
  const salva = { id: 'curvelo-mg-br', name: 'Curvelo', admin: 'MG', country: 'Brasil', lat: -18.7527, lon: -44.4303, utcOffset: -3 };
  const melhor = await upgradeCityTimezone(salva, { fetchImpl: f });

  assert.strictEqual(melhor.timezone, 'America/Sao_Paulo');
  assert.strictEqual(melhor.id, 'gn-3466537');
  assert.strictEqual(melhor.legacyId, 'curvelo-mg-br');
  // O mapa de quem já tinha isso salvo NÃO pode se mexer: coordenadas
  // preservadas byte a byte.
  assert.strictEqual(melhor.lat, -18.7527);
  assert.strictEqual(melhor.lon, -44.4303);
  assert.strictEqual(melhor.name, 'Curvelo');
});

test('sem rede, o upgrade devolve a MESMA cidade e o app segue funcionando como antes', async () => {
  const f = fakeFetch(() => new Error('Network request failed'));
  const salva = { id: 'curvelo-mg-br', name: 'Curvelo', admin: 'MG', country: 'Brasil', lat: -18.7527, lon: -44.4303, utcOffset: -3 };
  const igual = await upgradeCityTimezone(salva, { fetchImpl: f });
  assert.strictEqual(igual, salva);
});

test('upgrade com entrada nula/estranha não lança', async () => {
  const f = fakeFetch(() => respostaOk({ city: {} }));
  assert.strictEqual(await upgradeCityTimezone(null, { fetchImpl: f }), null);
  assert.strictEqual(await upgradeCityTimezone(undefined, { fetchImpl: f }), undefined);
});

test('classifyCityError separa os três casos que a tela precisa distinguir', () => {
  assert.strictEqual(classifyCityError(null), null);
  const abort = new Error('abortado');
  abort.name = 'AbortError';
  assert.strictEqual(classifyCityError(abort), 'offline');
  assert.strictEqual(classifyCityError(new Error('Failed to fetch')), 'offline');
  const indisp = new Error('x');
  indisp.code = 'indisponivel';
  assert.strictEqual(classifyCityError(indisp), 'indisponivel');
  assert.strictEqual(classifyCityError(new Error('qualquer outra')), 'erro');
});

test('normalize é a MESMA do servidor (senão offline e online achariam coisas diferentes)', () => {
  assert.strictEqual(normalize('Junqueirópolis'), 'junqueiropolis');
  assert.strictEqual(normalize("Santa Bárbara d'Oeste"), 'santa barbara d oeste');
  assert.strictEqual(normalize('  SÃO   PAULO  '), 'sao paulo');
  assert.strictEqual(normalize(null), '');
});
