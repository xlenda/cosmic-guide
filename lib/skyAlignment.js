// lib/skyAlignment.js
// Motor puro do 3S "Alinhe seu céu".
//
// A interação só revela: este módulo não lê storage, não navega, não dispara
// haptic e não usa IA. A tela lê o nascimento antes, fixa um `instantISO` UTC
// uma vez e passa os dois dados para cá. Mesmo input = mesmo resultado.
//
// O cálculo não nasce aqui. Ele compõe quatro motores já testados:
//   - planetPositions (efeméride real);
//   - personalSkyFromPositions (orbes e ranking, em uma única fonte);
//   - fasesDoCeuPessoal (aplicativo/separativo/estacionário e limites);
//   - calendarioCosmico (fallback de evento real, nunca inventado).

import { planetPositions } from './signs';
import { personalSkyFromPositions } from './personalSky';
import { fasesDoCeuPessoal, HORIZONTE_DO_PRAZO_DIAS } from './transitoFase';
import { calendarioCosmico } from './calendarioCosmico';
import { offsetHoursFor, resolveOffsetHours } from './timezone';

const MAX_CANDIDATES = 100; // 10 planetas atuais × 10 natais
const MS_DIA = 24 * 60 * 60 * 1000;

function idiomaValido(lang) {
  return lang === 'es' || lang === 'en' ? lang : 'pt';
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function dataValida(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return false;
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return (
    !Number.isNaN(d.getTime()) &&
    d.getUTCFullYear() === Number(m[1]) &&
    d.getUTCMonth() + 1 === Number(m[2]) &&
    d.getUTCDate() === Number(m[3])
  );
}

function horaValida(timeStr) {
  if (typeof timeStr !== 'string') return null;
  const m = /^(\d{2}):(\d{2})$/.exec(timeStr.trim());
  if (!m) return null;
  const hora = Number(m[1]);
  const minuto = Number(m[2]);
  if (hora > 23 || minuto > 59) return null;
  return `${pad2(hora)}:${pad2(minuto)}`;
}

// Exige o Z final. Uma string com hora local ou offset implícito faria dois
// aparelhos calcularem céus diferentes a partir do mesmo texto.
function instanteUtc(instantISO) {
  if (typeof instantISO !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?Z$/.exec(
    instantISO.trim()
  );
  if (!m) return null;
  const d = new Date(instantISO.trim());
  if (Number.isNaN(d.getTime())) return null;
  if (
    d.getUTCFullYear() !== Number(m[1]) ||
    d.getUTCMonth() + 1 !== Number(m[2]) ||
    d.getUTCDate() !== Number(m[3]) ||
    d.getUTCHours() !== Number(m[4]) ||
    d.getUTCMinutes() !== Number(m[5]) ||
    d.getUTCSeconds() !== Number(m[6] || 0)
  ) {
    return null;
  }
  return d;
}

function partesUtc(date) {
  const data = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
  const hora = `${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}`;
  return { data, hora, minuteISO: `${data}T${hora}:00.000Z` };
}

function nomeFusoIana(zona) {
  if (typeof zona === 'string' && zona.trim() && !/^[+-]?\d+(\.\d+)?$/.test(zona.trim())) {
    return zona.trim();
  }
  if (zona && typeof zona === 'object' && typeof zona.timezone === 'string' && zona.timezone.trim()) {
    return zona.timezone.trim();
  }
  return null;
}

// Resolve antes de chamar planetPositions. Em signs.js, um fuso totalmente
// desconhecido acabaria no comportamento legado UTC=0; aqui isso pareceria
// precisão natal sem ser. Só aceitamos a hora quando o offset é verificável.
function zonaResolvida(zona, dateStr, timeStr) {
  if (zona === undefined || zona === null) return null;
  const iana = nomeFusoIana(zona);
  if (iana) {
    const real = offsetHoursFor(iana, dateStr, timeStr);
    if (typeof real === 'number' && Number.isFinite(real)) {
      return { offsetHours: real, mode: 'iana' };
    }
  }
  const reserva = resolveOffsetHours(zona, dateStr, timeStr);
  if (typeof reserva === 'number' && Number.isFinite(reserva)) {
    return { offsetHours: reserva, mode: 'fixed_offset' };
  }
  return null;
}

function rotuloDaLocalidade(zona) {
  if (!zona || typeof zona !== 'object' || typeof zona.name !== 'string' || !zona.name.trim()) return null;
  const partes = [zona.name.trim()];
  if (typeof zona.admin === 'string' && zona.admin.trim()) partes.push(zona.admin.trim());
  if (typeof zona.country === 'string' && zona.country.trim()) partes.push(zona.country.trim());
  return partes.join(', ');
}

function nascimentoEfetivo(birth) {
  const timeWasProvided = !!(birth && typeof birth.time === 'string' && birth.time.trim());
  const time = horaValida(birth && birth.time);
  const warnings = [];

  if (!timeWasProvided) warnings.push('birth_time_missing');
  else if (!time) warnings.push('birth_time_invalid');

  const exactZone = time ? zonaResolvida(birth.city, birth.date, time) : null;
  if (time && !exactZone) warnings.push('birth_time_ignored_without_timezone');

  const hasTimedZone = !!(time && exactZone);
  const exact = !!(hasTimedZone && exactZone.mode === 'iana');
  const fixedOffset = !!(hasTimedZone && exactZone.mode === 'fixed_offset');
  if (fixedOffset) warnings.push('birth_time_uses_fixed_offset');
  // Mesmo sem hora, uma cidade válida permite ancorar o palpite no meio-dia
  // LOCAL. Sem cidade, o comportamento histórico e declarado é 12:00 UTC.
  const noonZone = hasTimedZone ? exactZone : zonaResolvida(birth.city, birth.date, '12:00');
  if (!hasTimedZone && !noonZone) warnings.push('date_only_uses_12_utc');

  const zone = hasTimedZone ? exactZone : noonZone;
  return {
    date: birth.date,
    time: hasTimedZone ? time : null,
    zone,
    locationLabel: zone ? rotuloDaLocalidade(birth.city) : null,
    mode: exact
      ? 'exact_birth_moment'
      : fixedOffset
        ? 'fixed_offset_birth_moment'
        : 'date_only',
    warnings,
  };
}

function dadosDoRecibo(nascimento, calculatedAt, ephemerisAt) {
  return {
    birthDate: nascimento.date,
    birthTime: nascimento.time,
    birthLocation: nascimento.locationLabel,
    birthAnchor: nascimento.mode === 'exact_birth_moment'
      ? 'reported_local_time_with_iana_timezone'
      : nascimento.mode === 'fixed_offset_birth_moment'
        ? 'reported_local_time_with_fixed_offset_approximation'
        : 'midday_approximation',
    utcOffsetHours: nascimento.zone ? nascimento.zone.offsetHours : null,
    timezoneMode: nascimento.zone ? nascimento.zone.mode : 'not_used',
    currentInstantUTC: calculatedAt,
    ephemerisMinuteUTC: ephemerisAt,
  };
}

function base({ status, reason, language, calculatedAt, ephemerisAt, dataQuality, positions }) {
  return {
    status,
    reason,
    language,
    calculatedAt,
    ephemerisAt,
    dataQuality,
    positions,
    encounter: null,
    fallbackEvent: null,
    receipt: null,
  };
}

function mesesDoFallback(agora) {
  const ano = agora.getUTCFullYear();
  const mes = agora.getUTCMonth() + 1;
  return [
    { ano, mes },
    mes === 12 ? { ano: ano + 1, mes: 1 } : { ano, mes: mes + 1 },
  ];
}

// Estritamente futuro: ao contrário do card da Home, um marco ocorrido mais
// cedo no mesmo dia não pode ser chamado de "próximo" nesta experiência.
export function nextRealSkyEvent(instantISO, lang = 'pt') {
  const agora = instanteUtc(instantISO);
  if (!agora) return { available: false, reason: 'invalid_instant', event: null };

  const eventos = [];
  let algumMesDisponivel = false;
  for (const { ano, mes } of mesesDoFallback(agora)) {
    const calendario = calendarioCosmico(ano, mes, idiomaValido(lang));
    if (!calendario || !calendario.ceuDisponivel || !Array.isArray(calendario.eventos)) continue;
    algumMesDisponivel = true;
    eventos.push(...calendario.eventos);
  }

  if (!algumMesDisponivel) return { available: false, reason: 'ephemeris_unavailable', event: null };
  const proximo = eventos
    .filter((evento) => evento && evento.data instanceof Date && evento.data.getTime() > agora.getTime())
    .sort((a, b) => a.data - b.data)[0];
  if (!proximo) return { available: false, reason: 'no_future_event_in_window', event: null };

  return {
    available: true,
    reason: null,
    event: {
      type: proximo.tipo,
      title: proximo.titulo,
      emoji: proximo.emoji,
      instantISO: proximo.data.toISOString(),
      millisecondsUntil: proximo.data.getTime() - agora.getTime(),
      precision: proximo.precisao || null,
      detail: proximo.detalhe || null,
      source: proximo.fonte || null,
      tradition: proximo.tradicao || null,
      ageNotice: proximo.avisoDeIdade || null,
    },
  };
}

export function firstAvailableAlignment(candidates, readings) {
  if (!Array.isArray(candidates) || !Array.isArray(readings)) return null;
  const limite = Math.min(candidates.length, readings.length);
  for (let i = 0; i < limite; i += 1) {
    if (readings[i] && readings[i].disponivel) return { candidate: candidates[i], reading: readings[i], index: i };
  }
  return null;
}

/**
 * Resultado completo para os dois discos e o Recibo Cósmico.
 *
 * `instantISO` é obrigatório e precisa terminar em Z. O motor arredonda a
 * efeméride ao minuto porque planetPositions recebe HH:MM; o recibo expõe os
 * dois instantes em vez de esconder essa precisão.
 */
export function buildSkyAlignment({ birth, instantISO, lang = 'pt' } = {}) {
  const language = idiomaValido(lang);
  const agora = instanteUtc(instantISO);
  if (!agora) {
    return base({
      status: 'unavailable',
      reason: 'invalid_utc_instant',
      language,
      calculatedAt: null,
      ephemerisAt: null,
      dataQuality: null,
      positions: null,
    });
  }
  const calculatedAt = agora.toISOString();
  const agoraPartes = partesUtc(agora);

  if (!birth || !birth.date) {
    return base({
      status: 'needs_birth',
      reason: 'birth_date_missing',
      language,
      calculatedAt,
      ephemerisAt: agoraPartes.minuteISO,
      dataQuality: null,
      positions: null,
    });
  }
  if (!dataValida(birth.date)) {
    return base({
      status: 'unavailable',
      reason: 'birth_date_invalid',
      language,
      calculatedAt,
      ephemerisAt: agoraPartes.minuteISO,
      dataQuality: null,
      positions: null,
    });
  }

  const nascimento = nascimentoEfetivo(birth);
  const dataQuality = {
    mode: nascimento.mode,
    timezoneMode: nascimento.zone ? nascimento.zone.mode : 'not_used',
    warnings: [...nascimento.warnings],
  };

  const natal = planetPositions(
    nascimento.date,
    nascimento.time || undefined,
    nascimento.zone ? nascimento.zone.offsetHours : undefined
  );
  const atual = planetPositions(agoraPartes.data, agoraPartes.hora);
  const amanhaDate = new Date(agora.getTime() + MS_DIA);
  const amanhaPartes = partesUtc(amanhaDate);
  const amanha = planetPositions(amanhaPartes.data, amanhaPartes.hora);
  const positions = natal && atual ? { natal, current: atual } : null;

  if (!natal || !atual || !amanha) {
    return base({
      status: 'unavailable',
      reason: 'ephemeris_unavailable',
      language,
      calculatedAt,
      ephemerisAt: agoraPartes.minuteISO,
      dataQuality,
      positions,
    });
  }

  const candidates = personalSkyFromPositions(natal, atual, MAX_CANDIDATES, language);
  if (!Array.isArray(candidates)) {
    return base({
      status: 'unavailable',
      reason: 'ephemeris_unavailable',
      language,
      calculatedAt,
      ephemerisAt: agoraPartes.minuteISO,
      dataQuality,
      positions,
    });
  }

  const effectiveBirth = {
    date: nascimento.date,
    time: nascimento.time,
    city: nascimento.zone ? nascimento.zone.offsetHours : null,
  };
  const posicoesDaFase = {
    natal,
    hoje: atual,
    amanha,
    diaHoje: agoraPartes.minuteISO,
    diaAmanha: amanhaPartes.minuteISO,
  };
  const readings = fasesDoCeuPessoal(candidates, effectiveBirth, language, { posicoes: posicoesDaFase });
  const selected = firstAvailableAlignment(candidates, readings);
  const dataUsed = dadosDoRecibo(nascimento, calculatedAt, agoraPartes.minuteISO);

  if (selected) {
    const { candidate, reading, index } = selected;
    return {
      ...base({
        status: 'aspect',
        reason: null,
        language,
        calculatedAt,
        ephemerisAt: agoraPartes.minuteISO,
        dataQuality,
        positions,
      }),
      encounter: {
        transitPlanet: candidate.transitPlanet,
        transitPlanetLabel: reading.transitoRotulo,
        natalPlanet: candidate.natalPlanet,
        natalPlanetLabel: reading.natalRotulo,
        aspectType: candidate.aspectType,
        aspectLabel: reading.aspectoNome,
        tempo: candidate.tempo,
        orbDegrees: reading.residuoGraus,
        orbLimitDegrees: candidate.orbLimit,
        phase: reading.fase,
        phaseLabel: reading.faseNome,
        movementDegreesPerDay: reading.movimentoDiario,
        retrograde: reading.retrogrado,
        daysToExact: reading.diasParaExato,
        exactWithinWindow: reading.exatoNoDia,
        candidateIndex: index,
        content: {
          callout: reading.chamada,
          reading: reading.leitura,
          shortLine: reading.linhaCurta,
          phaseName: reading.faseNome,
        },
      },
      receipt: {
        dataUsed,
        calculationEngine: 'Astronomy Engine 2.1.19',
        calculation: {
          transitLongitudeNow: reading.longitudes.hoje,
          transitLongitudeAfter24h: reading.longitudes.amanha,
          natalLongitude: reading.longitudes.natal,
          aspectAngle: reading.angulo,
          orbDegrees: reading.residuoGraus,
          orbLimitDegrees: candidate.orbLimit,
          selectionRule: 'transit_speed_then_orb',
          candidatesMeasured: candidates.length,
        },
        sources: reading.fonte,
        limits: {
          projectionHorizonDays: HORIZONTE_DO_PRAZO_DIAS,
          orbConvention: reading.notaOrbe,
          calculationVsReading: reading.notaLeituraDoApp,
          eventDateBoundary: reading.notaDataDeEvento,
        },
      },
    };
  }

  const moonWithoutTimeWasExcluded =
    Array.isArray(readings) && readings.some((reading) => reading && reading.motivo === 'horaParaLuaNatal');
  if (moonWithoutTimeWasExcluded && !dataQuality.warnings.includes('natal_moon_excluded_without_time')) {
    dataQuality.warnings.push('natal_moon_excluded_without_time');
  }

  const fallback = nextRealSkyEvent(calculatedAt, language);
  if (!fallback.available) {
    return base({
      status: 'unavailable',
      reason: fallback.reason,
      language,
      calculatedAt,
      ephemerisAt: agoraPartes.minuteISO,
      dataQuality,
      positions,
    });
  }

  return {
    ...base({
      status: 'next_event',
      reason: candidates.length === 0 ? 'no_nearby_personal_aspect' : 'no_available_personal_aspect',
      language,
      calculatedAt,
      ephemerisAt: agoraPartes.minuteISO,
      dataQuality,
      positions,
    }),
    fallbackEvent: fallback.event,
    receipt: {
      dataUsed,
      calculationEngine: 'Astronomy Engine 2.1.19',
      calculation: {
        eventType: fallback.event.type,
        eventInstantUTC: fallback.event.instantISO,
        precision: fallback.event.precision,
        detail: fallback.event.detail,
      },
      sources: fallback.event.source,
      limits: {
        scope: 'collective_sky_event_not_personal_prediction',
        precision: fallback.event.precision,
        ageNotice: fallback.event.ageNotice,
      },
    },
  };
}
