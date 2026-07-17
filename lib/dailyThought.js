// lib/dailyThought.js
// "Pensamento cósmico do dia" — mesmo padrão de apps de versículo diário
// (Bíblia, meditação), mas correlacionado de verdade com o dia: usa a
// posição REAL da Lua (astronomy-engine, mesma lib de lib/signs.js e
// lib/lunarCalendar.js), nunca uma frase solta inventada. Se a lib de
// astronomia não estiver disponível por qualquer motivo, devolve um
// fallback honesto — nunca fabrica um "signo de hoje" ou fase da lua.
import { moonSign } from './signs';
import { getMoonPhase } from './lunarCalendar';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// Complementa a reflexão da fase lunar (já real, lib/lunarCalendar.js) com o
// signo real que a Lua ocupa hoje (já real, lib/signs.js) — as duas peças já
// existiam separadas no app (Mapa Astral, Calendário Lunar); aqui só juntamos
// numa única frase pro card do dia. `personalSign` é opcional e é o signo
// real da PESSOA (já calculado em outro lugar do app, ex. HomeScreen — nunca
// escolhido/inventado aqui): quando presente, só personaliza o endereçamento
// da frase, sem fabricar nenhuma previsão nova pra essa combinação.
export function getThoughtForDate(date = new Date(), personalSign = null) {
  const phase = getMoonPhase(date);
  if (!phase) {
    // astronomy-engine indisponível ou data inválida — nunca fabrica fase/signo.
    return 'O céu de hoje ainda está carregando — abra o Calendário Lunar em instantes.';
  }

  const moon = moonSign(toDateStr(date));
  const signPart = moon?.name ? `A Lua está em ${moon.name} ${moon.emoji || ''}. ` : '';
  const greeting = personalSign?.name
    ? `${personalSign.icon ? personalSign.icon + ' ' : ''}${personalSign.name}, `
    : '';

  return `${greeting}${phase.emoji} ${phase.name}. ${signPart}${phase.reflexao}`;
}

export function getTodaysThought(personalSign = null) {
  return getThoughtForDate(new Date(), personalSign);
}
