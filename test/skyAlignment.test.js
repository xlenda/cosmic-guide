const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const packageLock = require('../package-lock.json');

const { planetPositions } = require('../lib/signs.js');
const { personalSkyFromPositions, personalSkyToday } = require('../lib/personalSky.js');
const {
  buildSkyAlignment,
  firstAvailableAlignment,
  nextRealSkyEvent,
} = require('../lib/skyAlignment.js');

const SP = {
  id: 'sao-paulo-br',
  name: 'São Paulo',
  lat: -23.5505,
  lon: -46.6333,
  utcOffset: -3,
  timezone: 'America/Sao_Paulo',
};

const BIRTH = { date: '1990-06-15', time: '14:30', city: SP };
const INSTANT = '2026-08-01T03:27:48.123Z';

test('o motor não lê relógio, storage, rede, IA nem sorteio', () => {
  const fonte = fs.readFileSync(path.join(__dirname, '..', 'lib', 'skyAlignment.js'), 'utf8');
  assert.doesNotMatch(fonte, /new Date\(\s*\)/, 'o relógio entrou escondido no motor');
  assert.doesNotMatch(fonte, /AsyncStorage|SecureStore|localStorage|fetch\s*\(|axios|aiClient|Math\.random/);
});

test('personalSkyFromPositions é a fonte única dos orbes e mantém o ranking rápido → lento', () => {
  const natal = [{ planet: 'Sol', longitude: 0 }];
  const atual = [
    { planet: 'Plutão', longitude: 1 }, // conjunção: limite 6 × 0,25 = 1,5
    { planet: 'Lua', longitude: 5 }, // conjunção: limite 6 × 1 = 6
    { planet: 'Júpiter', longitude: 4 }, // fora: limite 6 × 0,5 = 3
  ];

  const aspectos = personalSkyFromPositions(natal, atual, 100, 'pt');
  assert.deepEqual(
    aspectos.map((a) => ({ planeta: a.transitPlanet, orbe: a.orb, limite: a.orbLimit, tempo: a.tempo })),
    [
      { planeta: 'Lua', orbe: 5, limite: 6, tempo: 'rapido' },
      { planeta: 'Plutão', orbe: 1, limite: 1.5, tempo: 'lento' },
    ]
  );
  assert.equal(personalSkyFromPositions(null, atual), null);
  assert.equal(personalSkyFromPositions(natal, null), null);
});

test('personalSkyToday preserva a forma pública anterior, sem orbLimit novo nas telas antigas', () => {
  const aspectos = personalSkyToday(BIRTH, 100, 'pt');
  assert.ok(Array.isArray(aspectos) && aspectos.length > 0);
  for (const aspecto of aspectos) {
    assert.equal(Object.prototype.hasOwnProperty.call(aspecto, 'orbLimit'), false);
  }
});

test('buildSkyAlignment exige instante UTC explícito e nunca consulta relógio escondido', () => {
  const semZona = buildSkyAlignment({ birth: BIRTH, instantISO: '2026-08-01T03:27:00' });
  assert.equal(semZona.status, 'unavailable');
  assert.equal(semZona.reason, 'invalid_utc_instant');

  const impossivel = buildSkyAlignment({ birth: BIRTH, instantISO: '2026-02-30T03:27:00Z' });
  assert.equal(impossivel.status, 'unavailable');
  assert.equal(impossivel.reason, 'invalid_utc_instant');

  const semNascimento = buildSkyAlignment({ instantISO: INSTANT });
  assert.equal(semNascimento.status, 'needs_birth');
  assert.equal(semNascimento.reason, 'birth_date_missing');
});

test('mesmo nascimento + mesmo instante devolve resultado idêntico, com os dois discos', () => {
  const um = buildSkyAlignment({ birth: BIRTH, instantISO: INSTANT, lang: 'pt' });
  const dois = buildSkyAlignment({ birth: BIRTH, instantISO: INSTANT, lang: 'pt' });
  assert.deepEqual(dois, um);

  assert.equal(um.status, 'aspect');
  assert.equal(um.calculatedAt, INSTANT);
  assert.equal(um.ephemerisAt, '2026-08-01T03:27:00.000Z');
  assert.equal(um.dataQuality.mode, 'exact_birth_moment');
  assert.equal(um.dataQuality.timezoneMode, 'iana');
  assert.equal(um.positions.natal.length, 10);
  assert.equal(um.positions.current.length, 10);

  // O disco atual é 03:27 UTC, não o meio-dia escondido do wrapper histórico.
  assert.deepEqual(um.positions.current, planetPositions('2026-08-01', '03:27'));
  assert.notDeepEqual(um.positions.current, planetPositions('2026-08-01'));

  assert.ok(um.encounter.orbDegrees <= um.encounter.orbLimitDegrees);
  assert.equal(um.receipt.calculation.orbLimitDegrees, um.encounter.orbLimitDegrees);
  assert.equal(um.receipt.calculation.selectionRule, 'transit_speed_then_orb');
  assert.equal(um.receipt.limits.projectionHorizonDays, 3);
  assert.equal(um.receipt.dataUsed.ephemerisMinuteUTC, um.ephemerisAt);
  assert.equal(
    um.receipt.calculationEngine,
    `Astronomy Engine ${packageLock.packages['node_modules/astronomy-engine'].version}`,
    'o recibo ficou com versão de efeméride diferente da instalada'
  );
  assert.ok(um.encounter.transitPlanetLabel);
  assert.ok(um.encounter.natalPlanetLabel);
  assert.ok(um.encounter.aspectLabel);
  assert.ok(um.encounter.phaseLabel);
});

test('hora natal só entra com cidade/fuso; sem ele o motor cai honestamente para date_only', () => {
  const horaSemCidade = buildSkyAlignment({
    birth: { date: BIRTH.date, time: BIRTH.time, city: null },
    instantISO: INSTANT,
  });
  const soData = buildSkyAlignment({
    birth: { date: BIRTH.date, time: null, city: null },
    instantISO: INSTANT,
  });
  const completo = buildSkyAlignment({ birth: BIRTH, instantISO: INSTANT });

  assert.equal(horaSemCidade.dataQuality.mode, 'date_only');
  assert.equal(horaSemCidade.receipt.dataUsed.birthTime, null);
  assert.ok(horaSemCidade.dataQuality.warnings.includes('birth_time_ignored_without_timezone'));
  assert.ok(horaSemCidade.dataQuality.warnings.includes('date_only_uses_12_utc'));
  assert.deepEqual(horaSemCidade.positions.natal, soData.positions.natal);
  assert.notDeepEqual(horaSemCidade.positions.natal, completo.positions.natal);

  // A cidade entra somente no recibo; coordenadas e objeto cru nunca vazam.
  assert.equal(completo.receipt.dataUsed.birthLocation, 'São Paulo');
  const foraDoRecibo = { ...completo, receipt: null };
  assert.doesNotMatch(JSON.stringify(foraDoRecibo), /São Paulo|sao-paulo-br|-23\.5505|-46\.6333/);
  assert.doesNotMatch(JSON.stringify(completo), /sao-paulo-br|-23\.5505|-46\.6333/);
  assert.equal(completo.receipt.dataUsed.utcOffsetHours, -3);
});

test('offset fixo legado usa a hora, mas nunca se apresenta como fuso histórico exato', () => {
  const legado = buildSkyAlignment({
    birth: {
      date: '2015-01-10',
      time: '13:00',
      city: { name: 'São Paulo', utcOffset: -3 },
    },
    instantISO: INSTANT,
  });

  assert.equal(legado.dataQuality.mode, 'fixed_offset_birth_moment');
  assert.equal(legado.dataQuality.timezoneMode, 'fixed_offset');
  assert.ok(legado.dataQuality.warnings.includes('birth_time_uses_fixed_offset'));
  assert.equal(legado.receipt.dataUsed.birthTime, '13:00');
  assert.equal(
    legado.receipt.dataUsed.birthAnchor,
    'reported_local_time_with_fixed_offset_approximation'
  );
  assert.notEqual(legado.receipt.dataUsed.birthAnchor, 'reported_local_time_with_iana_timezone');
});

test('idioma muda texto, nunca posições, encontro, orbe ou fase', () => {
  const pt = buildSkyAlignment({ birth: BIRTH, instantISO: INSTANT, lang: 'pt' });
  const en = buildSkyAlignment({ birth: BIRTH, instantISO: INSTANT, lang: 'en' });

  assert.deepEqual(en.positions, pt.positions);
  for (const chave of [
    'transitPlanet',
    'natalPlanet',
    'aspectType',
    'tempo',
    'orbDegrees',
    'orbLimitDegrees',
    'phase',
    'movementDegreesPerDay',
    'retrograde',
    'daysToExact',
    'exactWithinWindow',
    'candidateIndex',
  ]) {
    assert.deepEqual(en.encounter[chave], pt.encounter[chave], chave);
  }
  assert.notEqual(en.encounter.content.reading, pt.encounter.content.reading);
  assert.notEqual(en.encounter.transitPlanetLabel, pt.encounter.transitPlanetLabel);
  assert.notEqual(en.encounter.aspectLabel, pt.encounter.aspectLabel);
  assert.notEqual(en.encounter.phaseLabel, pt.encounter.phaseLabel);
});

test('firstAvailableAlignment pula candidato recusado em vez de revelar um céu indisponível', () => {
  const candidates = [{ id: 'lua-sem-hora' }, { id: 'sol-valido' }, { id: 'terceiro' }];
  const readings = [
    { disponivel: false, motivo: 'horaParaLuaNatal' },
    { disponivel: true, fase: 'aplicativo' },
    { disponivel: true, fase: 'separativo' },
  ];
  assert.deepEqual(firstAvailableAlignment(candidates, readings), {
    candidate: candidates[1],
    reading: readings[1],
    index: 1,
  });
  assert.equal(firstAvailableAlignment(candidates, [{ disponivel: false }]), null);
});

test('fallback é evento real estritamente futuro e conserva fonte, precisão e detalhe', () => {
  const pt = nextRealSkyEvent(INSTANT, 'pt');
  const en = nextRealSkyEvent(INSTANT, 'en');
  assert.equal(pt.available, true);
  assert.equal(en.available, true);
  assert.ok(new Date(pt.event.instantISO).getTime() > new Date(INSTANT).getTime());
  assert.ok(pt.event.source);
  assert.ok(pt.event.precision);
  assert.ok(pt.event.detail);
  assert.equal(en.event.type, pt.event.type);
  assert.equal(en.event.instantISO, pt.event.instantISO);
  assert.notEqual(en.event.title, pt.event.title);

  const invalido = nextRealSkyEvent('2026-08-01T03:27:00', 'pt');
  assert.deepEqual(invalido, { available: false, reason: 'invalid_instant', event: null });
});

test('buildSkyAlignment integra o fallback sem fabricar aspecto quando a busca volta vazia', () => {
  const personalSkyModule = require('../lib/personalSky.js');
  const skyAlignmentPath = require.resolve('../lib/skyAlignment.js');
  const original = personalSkyModule.personalSkyFromPositions;

  try {
    personalSkyModule.personalSkyFromPositions = () => [];
    delete require.cache[skyAlignmentPath];
    const isolated = require('../lib/skyAlignment.js');
    const result = isolated.buildSkyAlignment({ birth: BIRTH, instantISO: INSTANT, lang: 'pt' });

    assert.equal(result.status, 'next_event');
    assert.equal(result.reason, 'no_nearby_personal_aspect');
    assert.equal(result.encounter, null);
    assert.ok(new Date(result.fallbackEvent.instantISO).getTime() > new Date(INSTANT).getTime());
    assert.equal(result.receipt.calculation.eventInstantUTC, result.fallbackEvent.instantISO);
    assert.equal(result.receipt.sources, result.fallbackEvent.source);
    assert.equal(result.receipt.limits.scope, 'collective_sky_event_not_personal_prediction');
  } finally {
    personalSkyModule.personalSkyFromPositions = original;
    delete require.cache[skyAlignmentPath];
  }
});
