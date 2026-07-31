// Calendário Lunar — fase real da Lua via astronomy-engine (mesma lib pure-JS
// já usada em lib/signs.js para moonSign/ascendantSign, mesmo padrão de
// require lazy dentro de try/catch pra não quebrar o bundling do Metro caso
// o pacote não esteja presente). Arquivo NOVO e isolado: não importa nem
// modifica lib/signs.js.
//
// Convenção de Astronomy.MoonPhase(date) (astronomy-engine): devolve um grau
// 0–360, a diferença de longitude eclíptica geocêntrica (Lua − Sol).
//   0   = Lua Nova
//   90  = Quarto Crescente
//   180 = Lua Cheia
//   270 = Quarto Minguante
// Dividimos o ciclo sinódico em 8 fatias de 45°, centradas nos múltiplos de
// 45° — a fatia da Lua Nova cruza o zero (337.5°–22.5°).
//
// Validado com Astronomy.Illumination(Body.Moon, date).phase_fraction em datas
// reais conhecidas antes de fechar este arquivo (ver spot-check no PR/relatório):
// 25/jan/2024 17:54 UTC (lua cheia conhecida) → lon≈179.99°, classificado como
// "Lua Cheia", illum≈100%; 11/jan/2024 11:57 UTC (lua nova conhecida) →
// lon≈359.99°, classificado como "Lua Nova", illum≈0%.

let _Astronomy = null;
function getAstronomy() {
  if (_Astronomy) return _Astronomy;
  try {
    _Astronomy = require("astronomy-engine");
  } catch {
    _Astronomy = false;
  }
  return _Astronomy;
}

// Textos são só reflexão/ritual simbólico — nunca previsão real ou garantia de
// resultado (mesmo tom honesto de lib/palmReadings.js e lib/chatResponses.js:
// "previsão real eu não tenho... espelho simbólico").
//
// A IDADE DESTA MOLDURA, corrigida em 31/07/2026 (docs/tradicao/04, §3.1 e §6):
// as OITO fases nomeadas, com leitura psicológica de cada uma, são de **Dane
// Rudhyar, "The Lunation Cycle", 1967** — não são milenares. A moldura antiga é
// a de QUATRO quartos com qualidades elementares (Ptolomeu, Tetrabiblos I.8), e
// o esquema agrícola romano é de DIAS NUMERADOS do mês lunar (1–30), não de
// fases: quem transpõe Hesíodo ou Virgílio para "Lua Gibosa Crescente" inventa
// uma equivalência que a fonte não faz. Por isso nenhuma das oito reflexões
// abaixo diz mais "a tradição lunar milenar aponta".
//
// E A INVERSÃO QUE ESTAVA AQUI: a Lua Cheia dizia "momento de colher". A fonte
// romana põe colher-para-guardar na MINGUANTE (Plínio, Naturalis Historia
// XVIII.321; Columela XII.16.1 colhe a uva para passa assim); a cheia, em
// Columela XI.2.85, é dia de semear fava. Desde 31/07/2026 o app diz isso em
// lib/i18n.js, no cartão do quarto lunar do horóscopo — literalmente "colher
// para guardar é minguante, não é Lua Cheia" —, e este arquivo afirmava o
// contrário na mesma versão. O app não pode se contradizer de uma tela para
// a outra sobre a mesma fonte.
const PHASES = [
  {
    name: "Lua Nova",
    emoji: "🌑",
    reflexao:
      "A Lua Nova abre o mês em todo calendário lunisolar antigo — esse ponto zero é genuinamente milenar. Já lê-la como hora de «plantar uma intenção» é leitura contemporânea, não antiga. Fica o convite simbólico à pausa antes de agir: vale anotar o que você quer deixar nascer neste ciclo.",
  },
  {
    name: "Lua Crescente",
    emoji: "🌒",
    reflexao:
      "Luz crescendo, e a leitura contemporânea do ciclo (a moldura de oito fases é de 1967, não é antiga) põe construção aqui: dar os primeiros passos no que começou na Lua Nova. É um lembrete simbólico de manter o ritmo — pequenas ações contam mais que grandes decisões agora.",
  },
  {
    name: "Quarto Crescente",
    emoji: "🌓",
    reflexao:
      "O quarto crescente é divisão antiga de verdade: Ptolomeu (Tetrabiblos I.8) parte o ciclo em quatro, e é este o marco. Ajuste de rota e tensão criativa, porém, são leitura contemporânea — um convite simbólico a revisar o plano; vale perguntar o que precisa de mais foco esta semana.",
  },
  {
    name: "Lua Gibosa Crescente",
    emoji: "🌔",
    reflexao:
      "Refinar detalhes antes da cheia — e isto é leitura contemporânea, não herança antiga: a gibosa nem sequer é uma fase nomeada fora da moldura de oito, que é de 1967. Fica o convite simbólico à paciência com o que já está em andamento. Ajustar é diferente de recomeçar.",
  },
  {
    name: "Lua Cheia",
    emoji: "🌕",
    reflexao:
      "Pico de luz do ciclo — isso é astronomia, e a fonte romana é mais específica do que a fama desta fase sugere: em Columela (XI.2.85) a cheia é dia de SEMEAR fava, e é a minguante que Plínio (XVIII.321) reserva para colher e guardar. A fama de fase da colheita, portanto, inverte a fonte. O que cabe aqui é ver com clareza: um convite simbólico à observação do que já vinha se desenhando.",
  },
  {
    name: "Lua Gibosa Minguante",
    emoji: "🌖",
    reflexao:
      "A luz começou a ceder, e é agora que a lavoura romana colhia para guardar (Plínio, XVIII.321: o que se corta, se colhe e se tosquia sofre menos dano com a lua decrescente). Gratidão e partilha são a camada contemporânea por cima disso — um convite simbólico a olhar pra trás com mais leveza. Bom momento pra repassar algo que você aprendeu.",
  },
  {
    name: "Quarto Minguante",
    emoji: "🌗",
    reflexao:
      "Quarto minguante: dos oito rótulos, é um dos dois com melhor lastro antigo. Plínio (XVIII.321–322) põe na minguante o que é cortar, colher, tosquiar, capinar — o mês antigo tira, aqui, em vez de pôr. Soltar o que não serve mais é a transposição contemporânea disso: um convite simbólico à faxina emocional. Pergunte a si mesma(o) o que já pode ficar pra trás.",
  },
  {
    name: "Lua Minguante",
    emoji: "🌘",
    reflexao:
      "Últimos dias antes da conjunção com o Sol, e a lua velha romana continua sendo a de tirar, não a de pôr (Plínio, XVIII.321–322). Descanso e recolhimento são a leitura contemporânea desse esvaziamento — um convite simbólico a desacelerar. Bom momento pra silêncio e balanço pessoal.",
  },
];

// idx 0 = Nova (0°), 1 = Crescente (45°), 2 = Quarto Crescente (90°),
// 3 = Gibosa Crescente (135°), 4 = Cheia (180°), 5 = Gibosa Minguante (225°),
// 6 = Quarto Minguante (270°), 7 = Minguante (315°). O módulo 8 depois do
// round cuida do wraparound de 337.5°–360° de volta pro índice 0 (Nova).
function phaseIndexFromLongitude(lonDeg) {
  const lon = ((lonDeg % 360) + 360) % 360;
  return Math.round(lon / 45) % 8;
}

// Núcleo do módulo: recebe uma Date (ou algo que vire Date) e devolve os dados
// reais da fase lunar naquele instante. Retorna null se astronomy-engine não
// estiver disponível ou a data for inválida — mesmo contrato de null-safety
// de moonSign()/ascendantSign() em lib/signs.js.
export function getMoonPhase(date) {
  const A = getAstronomy();
  if (!A) return null;

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  const lonDeg = A.MoonPhase(d);
  if (typeof lonDeg !== "number" || Number.isNaN(lonDeg)) return null;

  const idx = phaseIndexFromLongitude(lonDeg);
  const phase = PHASES[idx];

  // Illumination() é uma função separada (mesmo pacote) — guardada em try/catch
  // própria pra nunca derrubar o cálculo da fase em si só porque o % de
  // iluminação não pôde ser calculado.
  let illumination = null;
  try {
    const info = A.Illumination(A.Body.Moon, d);
    if (info && typeof info.phase_fraction === "number" && !Number.isNaN(info.phase_fraction)) {
      illumination = Math.round(info.phase_fraction * 100);
    }
  } catch {
    illumination = null;
  }

  return {
    date: d,
    longitude: lonDeg,
    name: phase.name,
    emoji: phase.emoji,
    reflexao: phase.reflexao,
    illumination, // 0–100, ou null se o pacote não devolveu phase_fraction
  };
}

// Atalho pra "hoje" — usa a data/hora atual do dispositivo.
export function getMoonPhaseToday() {
  return getMoonPhase(new Date());
}

// Fase lunar de cada dia de um mês, pra uma visão simples de calendário.
// month é 1-12 (humano) pra evitar a pegadinha do Date 0-based do JS vazar
// pra quem chama esta função. Meio-dia local (12:00) em cada dia evita que o
// fuso horário empurre a data pro dia anterior/seguinte por acidente.
// Custo: no máximo 31 chamadas a MoonPhase/Illumination (cada uma é só
// trigonometria O(1)) — nada absurdo mesmo rodando na UI thread.
export function getMoonPhaseForMonth(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day, 12, 0, 0);
    days.push({ day, date: d, phase: getMoonPhase(d) });
  }
  return days;
}

// ---------------------------------------------------------------------------
// INSTANTE EXATO de um marco lunar.
//
// As 8 fatias de 45° acima servem pra NOMEAR a fase de um dia qualquer — isso é
// convenção legítima e continua como está. O que NÃO dá pra fazer com fatia é
// dizer a DATA de um marco: o rótulo "Lua Cheia" cobre 157,5°–202,5°, ou seja
// ~3,7 dias, então varrer dia a dia procurando o primeiro dia rotulado "Cheia"
// anuncia o evento até um dia antes e continua anunciando até dois dias depois
// (em julho de 2026 os dias 28, 29, 30 e 31 são todos rotulados "Lua Cheia",
// enquanto a Cheia real é instantânea, em 29/07 às 14:36 UTC).
//
// Lua Cheia é a oposição exata Sol-Lua: um instante, não uma faixa — e é em
// torno desse instante que toda a prática ritual lunar se organiza, por isso
// efeméride e almanaque publicam data E hora. SearchMoonPhase devolve isso.
//
// targetLon: 0 = Nova, 90 = Quarto Crescente, 180 = Cheia, 270 = Quarto Minguante.
// Devolve Date (UTC) ou null — nunca estima quando o motor não está disponível.
export function nextExactMoonPhase(targetLon, from = new Date(), limitDays = 40) {
  const A = getAstronomy();
  if (!A) return null;
  const start = from instanceof Date ? from : new Date(from);
  if (Number.isNaN(start.getTime())) return null;
  try {
    const found = A.SearchMoonPhase(targetLon, A.MakeTime(start), limitDays);
    if (!found || !found.date) return null;
    return found.date;
  } catch {
    return null;
  }
}

// Próxima Lua Nova ou Cheia (o que vier primeiro) a partir de `from`, com o
// instante exato. Devolve { name, emoji, date } ou null.
export function nextExactNewOrFullMoon(from = new Date(), limitDays = 40) {
  const nova = nextExactMoonPhase(0, from, limitDays);
  const cheia = nextExactMoonPhase(180, from, limitDays);
  if (!nova && !cheia) return null;
  if (nova && (!cheia || nova <= cheia)) return { name: 'Lua Nova', emoji: '🌑', date: nova };
  return { name: 'Lua Cheia', emoji: '🌕', date: cheia };
}

// Atalho pro mês corrente (o mais comum pra tela de calendário).
export function getMoonPhaseForCurrentMonth() {
  const now = new Date();
  return getMoonPhaseForMonth(now.getFullYear(), now.getMonth() + 1);
}
