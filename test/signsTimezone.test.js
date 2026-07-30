// O teste que prova o GANHO: o Ascendente muda de signo quando o horário de
// verão entra na conta.
//
// Antes de 30/07/2026, lib/signs.js recebia um offset FIXO por cidade
// (São Paulo = -3, sempre) e a cidade guardava só esse número. Quem nasceu em
// janeiro de 2015 em São Paulo estava em UTC-2 — uma hora de diferença. Como o
// Ascendente anda ~30° (UM SIGNO) a cada 2 horas, isso é meio signo errado.
//
// Aqui a gente NÃO acredita no argumento: mede. O primeiro teste varre um dia
// inteiro de janeiro em São Paulo, meia hora a meia hora, e conta em quantas
// combinações o signo muda. E os demais travam a compatibilidade: número
// continua produzindo EXATAMENTE o mesmo resultado de antes, senão o mapa de
// quem já usava o app mudaria sozinho.
const test = require('node:test');
const assert = require('node:assert');

const { ascendantSign, houses, astrocartographyCities } = require('../lib/signs');

const SP = { lat: -23.5505, lon: -46.6333 }; // São Paulo, as coordenadas do app
const NY = { lat: 40.7128, lon: -74.006 }; // Nova York
const MANAUS = { lat: -3.119, lon: -60.0217 };

const CIDADE_SP = { ...SP, utcOffset: -3, timezone: 'America/Sao_Paulo' };
const CIDADE_SP_ANTIGA = { ...SP, utcOffset: -3 }; // salva antes desta versão
const CIDADE_NY = { ...NY, utcOffset: -5, timezone: 'America/New_York' };
const CIDADE_MANAUS = { ...MANAUS, utcOffset: -4, timezone: 'America/Manaus' };

// ---------------------------------------------------------------------------
// A MEDIÇÃO
// ---------------------------------------------------------------------------
test('metade dos nascimentos de janeiro em São Paulo saía com o Ascendente no signo errado', () => {
  let mudaram = 0;
  let total = 0;
  for (const data of ['2015-01-10', '2015-01-20', '1995-01-15', '2005-01-05', '1990-01-25']) {
    for (let h = 0; h < 24; h++) {
      for (const m of ['00', '30']) {
        const hora = `${String(h).padStart(2, '0')}:${m}`;
        const antigo = ascendantSign(data, hora, SP.lat, SP.lon, -3); // o app de ontem
        const certo = ascendantSign(data, hora, SP.lat, SP.lon, 'America/Sao_Paulo');
        assert.ok(antigo && certo, `sem ascendente pra ${data} ${hora}`);
        total++;
        if (antigo.name !== certo.name) mudaram++;
      }
    }
  }
  assert.strictEqual(total, 240);
  // Não é "alguns casos de borda": é praticamente metade.
  assert.ok(mudaram > total * 0.45, `mudaram ${mudaram} de ${total}`);
  assert.ok(mudaram < total * 0.55, `mudaram ${mudaram} de ${total}`);
});

test('caso concreto: São Paulo, 10/01/2015 às 13:00 — Touro (errado) vira Áries (certo)', () => {
  assert.strictEqual(ascendantSign('2015-01-10', '13:00', SP.lat, SP.lon, -3).name, 'Touro');
  assert.strictEqual(
    ascendantSign('2015-01-10', '13:00', SP.lat, SP.lon, 'America/Sao_Paulo').name,
    'Áries'
  );
  // E com o objeto de cidade inteiro, que é como as telas passam hoje.
  assert.strictEqual(
    ascendantSign('2015-01-10', '13:00', SP.lat, SP.lon, CIDADE_SP).name,
    'Áries'
  );
});

test('fora do horário de verão o fuso IANA concorda com o número antigo — nada muda em julho', () => {
  for (let h = 0; h < 24; h++) {
    const hora = `${String(h).padStart(2, '0')}:00`;
    const antigo = ascendantSign('2015-07-10', hora, SP.lat, SP.lon, -3);
    const novo = ascendantSign('2015-07-10', hora, SP.lat, SP.lon, CIDADE_SP);
    assert.strictEqual(novo.name, antigo.name, `divergiu às ${hora}`);
  }
});

test('Manaus nunca teve horário de verão: IANA e número dão o mesmo o ano inteiro', () => {
  for (const data of ['2015-01-20', '2015-07-20', '1988-12-31']) {
    for (const hora of ['00:30', '06:00', '13:00', '21:45']) {
      const antigo = ascendantSign(data, hora, MANAUS.lat, MANAUS.lon, -4);
      const novo = ascendantSign(data, hora, MANAUS.lat, MANAUS.lon, CIDADE_MANAUS);
      assert.strictEqual(novo.name, antigo.name, `divergiu em ${data} ${hora}`);
    }
  }
});

test('Nova York: julho (-4) e janeiro (-5) batem com o número correspondente, e diferem entre si', () => {
  const julho = ascendantSign('2015-07-20', '18:00', NY.lat, NY.lon, CIDADE_NY);
  const janeiro = ascendantSign('2015-01-20', '18:00', NY.lat, NY.lon, CIDADE_NY);
  assert.strictEqual(julho.name, ascendantSign('2015-07-20', '18:00', NY.lat, NY.lon, -4).name);
  assert.strictEqual(janeiro.name, ascendantSign('2015-01-20', '18:00', NY.lat, NY.lon, -5).name);
  // O app antigo usaria -5 nos dois — e em julho isso é 1h de erro, que aqui
  // vale um signo inteiro: Sagitário (certo) vs Capricórnio (errado).
  const julhoErrado = ascendantSign('2015-07-20', '18:00', NY.lat, NY.lon, -5);
  assert.strictEqual(julho.name, 'Sagitário');
  assert.strictEqual(julhoErrado.name, 'Capricórnio');
});

// ---------------------------------------------------------------------------
// COMPATIBILIDADE — o contrato que não pode quebrar
// ---------------------------------------------------------------------------
test('a assinatura antiga (número) continua idêntica, inclusive nos casos degenerados', () => {
  // Valores-âncora: se algum destes mudar, o mapa de alguém mudou sozinho.
  assert.strictEqual(ascendantSign('1990-06-15', '08:00', SP.lat, SP.lon, -3).name, 'Câncer');
  assert.strictEqual(ascendantSign('2000-12-31', '23:59', SP.lat, SP.lon, -3).name, 'Libra');
  // Sem offset: continua tratando a hora como UTC (comportamento histórico).
  const semOffset = ascendantSign('1990-06-15', '08:00', SP.lat, SP.lon);
  const comZero = ascendantSign('1990-06-15', '08:00', SP.lat, SP.lon, 0);
  assert.strictEqual(semOffset.name, comZero.name);
  // NaN e lixo também caem em zero, como caíam antes.
  assert.strictEqual(ascendantSign('1990-06-15', '08:00', SP.lat, SP.lon, NaN).name, comZero.name);
  assert.strictEqual(ascendantSign('1990-06-15', '08:00', SP.lat, SP.lon, {}).name, comZero.name);
});

test('cidade salva SEM fuso (usuário antigo) segue pelo caminho velho, sem surpresa', () => {
  const antigo = ascendantSign('2015-01-10', '13:00', SP.lat, SP.lon, -3);
  const salvo = ascendantSign('2015-01-10', '13:00', SP.lat, SP.lon, CIDADE_SP_ANTIGA);
  assert.strictEqual(salvo.name, antigo.name);
});

test('fuso IANA desconhecido pelo aparelho cai no utcOffset da cidade, nunca em zero', () => {
  const quebrada = { ...SP, utcOffset: -3, timezone: 'Nao/Existe' };
  assert.strictEqual(
    ascendantSign('2015-01-10', '13:00', SP.lat, SP.lon, quebrada).name,
    ascendantSign('2015-01-10', '13:00', SP.lat, SP.lon, -3).name
  );
});

test('nunca fabrica: sem hora, sem data ou sem coordenada continua devolvendo null', () => {
  assert.strictEqual(ascendantSign('2015-01-10', '', SP.lat, SP.lon, CIDADE_SP), null);
  assert.strictEqual(ascendantSign('', '13:00', SP.lat, SP.lon, CIDADE_SP), null);
  assert.strictEqual(ascendantSign('2015-01-10', '13:00', undefined, SP.lon, CIDADE_SP), null);
});

// ---------------------------------------------------------------------------
// Casas e astrocartografia usam a MESMA porta de entrada
// ---------------------------------------------------------------------------
test('houses() aceita fuso IANA e acompanha o Ascendente corrigido', () => {
  const casas = houses('2015-01-10', '13:00', SP.lat, SP.lon, CIDADE_SP);
  assert.ok(Array.isArray(casas) && casas.length === 12);
  // Casa 1 = signo do Ascendente (Casas Inteiras).
  assert.strictEqual(casas[0].sign.name, 'Áries');
  const casasAntigas = houses('2015-01-10', '13:00', SP.lat, SP.lon, -3);
  assert.strictEqual(casasAntigas[0].sign.name, 'Touro');
});

test('astrocartographyCities() aceita fuso IANA e muda de resultado com o horário de verão', () => {
  const comFuso = astrocartographyCities('2015-01-10', '13:00', CIDADE_SP);
  const antigo = astrocartographyCities('2015-01-10', '13:00', -3);
  assert.ok(Array.isArray(comFuso) && Array.isArray(antigo));
  // Uma hora inteira de diferença move os ângulos ~15°, então a lista de
  // cidades angulares não pode ser a mesma.
  assert.notDeepStrictEqual(comFuso, antigo);
  // E bate com o offset correto passado à mão.
  assert.deepStrictEqual(comFuso, astrocartographyCities('2015-01-10', '13:00', -2));
});
