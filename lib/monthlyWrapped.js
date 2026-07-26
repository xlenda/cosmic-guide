// lib/monthlyWrapped.js
// Retrospectiva Cósmica mensal (estilo "Wrapped") — agrega SÓ o que a própria
// pessoa registrou neste aparelho: leituras do Diário (lib/journal.js), dias
// ativos (lib/streak.js) e tokens ganhos (lib/tokens.js). Nada aqui consulta
// rede nem fabrica número: mês sem registro NENHUM devolve null, e a tela
// decide não celebrar o vazio (mesmo princípio do Diário, que nunca inventa
// um insight que a pessoa não teve).
import { getJournalEntries } from './journal';
import { getMonthActivity } from './streak';
import { getTokenHistory } from './tokens';

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// "Energia do mês" = tipo de leitura dominante traduzido numa frase simbólica.
// Honesta por construção: cada frase só descreve o que a pessoa MAIS fez
// (tradição simbólica/entretenimento), nunca promete previsão nem resultado.
// Chaves = mesmos `type` que as telas de leitura já gravam no Diário via
// lib/readingCompletion.js.
const ENERGY_PHRASES = {
  tarot: 'Mês de arquétipos — o Tarô foi o espelho simbólico que você mais consultou.',
  coffee: 'Mês de ritual — a borra do café foi a linguagem simbólica que você mais escolheu.',
  dream: 'Mês de sonhos — você passou as noites escutando o que elas tinham a dizer.',
  palma: 'Mês de autoconhecimento — as linhas da própria mão foram seu mapa favorito.',
  rosto: 'Mês de espelho — ler o próprio rosto foi o caminho que você mais percorreu.',
  pe: 'Mês de raiz — a leitura dos pés foi a tradição que você mais visitou.',
  pintas: 'Mês de constelações na pele — as pintas foram os símbolos que você mais explorou.',
  horoscope: 'Mês dos astros — o horóscopo foi seu ponto de partida mais frequente.',
  birthchart: 'Mês de origem — você mergulhou no próprio mapa astral mais do que em tudo.',
  compatibility: 'Mês de conexão — comparar energias com alguém foi o que mais te moveu.',
  chat: 'Mês de conversa — o papo com os guias foi seu ritual mais constante.',
  lunarCalendar: 'Mês lunar — você acompanhou os ciclos da Lua de perto.',
};

// Todo o app marca "dia" pela data ISO em UTC (journal.date = toISOString,
// streak.todayStr = toISOString.slice(0,10)) — o recorte de mês aqui usa o
// mesmo prefixo ISO pra nunca divergir da contagem que as outras telas mostram.
function monthPrefix(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

// Maior sequência de dias seguidos DENTRO do mês, de propósito: uma sequência
// que atravessa a virada conta aqui só os dias que caem neste mês (o recorte é
// do mês, não da sequência global — essa continua sendo a de lib/streak.js).
// Dias protegidos por escudo contam: getMonthActivity já os devolve como
// ativos, e pro streak global eles também contam.
function bestStreakWithinMonth(activity, year, month) {
  const prefix = monthPrefix(year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let best = 0;
  let run = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (activity[`${prefix}-${String(d).padStart(2, '0')}`]) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

// month segue a MESMA convenção 0-based de Date#getMonth e de
// getMonthActivity (julho = 6) — misturar convenções aqui geraria um wrapped
// do mês errado sem nenhum erro visível.
//
// Retorna null quando o mês não tem NADA (nenhuma leitura, nenhum dia ativo,
// nenhum token) — nunca um wrapped de zeros fingindo celebração.
export async function computeMonthlyWrapped(year, month) {
  const prefix = monthPrefix(year, month);
  const [entries, activity, tokenHistory] = await Promise.all([
    getJournalEntries(),
    getMonthActivity(year, month),
    getTokenHistory(),
  ]);

  const monthEntries = entries.filter((e) => typeof e.date === 'string' && e.date.startsWith(prefix));
  const totalReadings = monthEntries.length;

  // Conta leituras por tipo. Empate vai pro tipo visto primeiro na varredura —
  // como o Diário guarda mais recente primeiro, o desempate favorece o tipo
  // usado mais recentemente (critério determinístico, sem sorteio).
  const countsByType = {};
  monthEntries.forEach((e) => {
    if (!countsByType[e.type]) {
      countsByType[e.type] = { type: e.type, typeLabel: e.typeLabel, count: 0 };
    }
    countsByType[e.type].count += 1;
  });
  let topType = null;
  Object.values(countsByType).forEach((c) => {
    if (!topType || c.count > topType.count) topType = c;
  });

  const activeDays = Object.keys(activity).length;
  const bestStreakInMonth = bestStreakWithinMonth(activity, year, month);

  // Só entradas positivas (ganhos) do mês. O histórico é capado em 100
  // lançamentos (MAX_HISTORY em lib/tokens.js), então num mês muito intenso a
  // soma pode ser um piso do que realmente foi ganho — preferimos subestimar
  // com dado real a estimar um total que não está mais registrado.
  const tokensEarned = tokenHistory
    .filter((h) => typeof h.date === 'string' && h.date.startsWith(prefix) && h.amount > 0)
    .reduce((sum, h) => sum + h.amount, 0);

  if (totalReadings === 0 && activeDays === 0 && tokensEarned === 0) return null;

  // Sem leitura no mês não existe "tipo dominante" — energia fica null em vez
  // de uma frase genérica fabricada. O fallback com typeLabel cobre tipos
  // novos que ainda não ganharam frase própria: descreve o que a pessoa fez,
  // não inventa presságio.
  const energy = topType
    ? {
        type: topType.type,
        typeLabel: topType.typeLabel,
        phrase:
          ENERGY_PHRASES[topType.type] ||
          `Mês de ${topType.typeLabel} — foi a leitura que você mais procurou.`,
      }
    : null;

  return {
    year,
    month,
    monthLabel: `${MONTH_NAMES[month]} de ${year}`,
    totalReadings,
    topType,
    activeDays,
    bestStreakInMonth,
    tokensEarned,
    energy,
  };
}

// Mês que o wrapped celebra: sempre o ANTERIOR ao atual (o mês corrente ainda
// está sendo vivido, fechar a conta dele no meio seria número parcial).
export function getWrappedMonth(now = new Date()) {
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { year: prev.getFullYear(), month: prev.getMonth() };
}

// Janela de celebração: só nos dias 1–7 de cada mês, olhando pro mês anterior.
// Fora dela a entrada some da Home — retrospectiva é rito de virada, não um
// relatório permanente (pra isso já existe o Diário).
export function isWrappedAvailable(now = new Date()) {
  return now.getDate() <= 7;
}
