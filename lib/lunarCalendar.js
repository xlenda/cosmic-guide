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
const PHASES = [
  {
    name: "Lua Nova",
    emoji: "🌑",
    reflexao:
      "A tradição lunar milenar aponta este como o momento de plantar uma intenção nova ou começar algo do zero — um convite simbólico à pausa antes de agir. Vale anotar o que você quer deixar nascer neste ciclo.",
  },
  {
    name: "Lua Crescente",
    emoji: "🌒",
    reflexao:
      "A tradição lunar aponta construção aqui: dar os primeiros passos no que começou na Lua Nova. É um lembrete simbólico de manter o ritmo — pequenas ações contam mais que grandes decisões agora.",
  },
  {
    name: "Quarto Crescente",
    emoji: "🌓",
    reflexao:
      "Fase de ajuste de rota na tradição lunar — a tensão criativa que empurra pra frente. Um convite simbólico a revisar o plano; vale perguntar o que precisa de mais foco esta semana.",
  },
  {
    name: "Lua Gibosa Crescente",
    emoji: "🌔",
    reflexao:
      "Momento de refinar detalhes antes da fase cheia, na leitura tradicional dos ciclos lunares — um convite simbólico à paciência com o que já está em andamento. Ajustar é diferente de recomeçar.",
  },
  {
    name: "Lua Cheia",
    emoji: "🌕",
    reflexao:
      "É o pico do ciclo na tradição lunar — momento de colher, celebrar ou enxergar com mais clareza o que já vinha se desenhando. Um convite simbólico à observação; boa fase pra reconhecer o que amadureceu.",
  },
  {
    name: "Lua Gibosa Minguante",
    emoji: "🌖",
    reflexao:
      "Fase de gratidão e compartilhamento do que foi colhido, na tradição lunar — um convite simbólico a olhar pra trás com mais leveza. Bom momento pra repassar algo que você aprendeu.",
  },
  {
    name: "Quarto Minguante",
    emoji: "🌗",
    reflexao:
      "É hora de soltar o que não serve mais, na leitura tradicional deste quarto lunar — um convite simbólico à faxina emocional. Pergunte a si mesma(o) o que já pode ficar pra trás.",
  },
  {
    name: "Lua Minguante",
    emoji: "🌘",
    reflexao:
      "Fase de descanso e recolhimento antes do próximo ciclo começar, na tradição lunar — um convite simbólico a desacelerar. Bom momento pra silêncio e balanço pessoal.",
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

// Atalho pro mês corrente (o mais comum pra tela de calendário).
export function getMoonPhaseForCurrentMonth() {
  const now = new Date();
  return getMoonPhaseForMonth(now.getFullYear(), now.getMonth() + 1);
}
