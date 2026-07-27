// lib/localDay.js
// Convenção ÚNICA de "dia" no app: o dia LOCAL do aparelho, nunca UTC.
//
// toISOString() devolve a data em UTC — no Brasil (UTC-3), depois das 21h o
// dia UTC já é AMANHÃ. Gravar toISOString().slice(0,10) causava bugs reais
// (reproduzidos pelo tester em 25-26/07/2026):
//   - streak com buraco em dia que a pessoa USOU (seg 9h + ter 22h + qua 9h
//     virava {seg, qua}), consumindo Escudos comprados ou zerando a sequência;
//   - bolinhas da semana deslocadas depois das 21h (getWeekActivity);
//   - leitura de 31/07 21h30 caindo no Wrapped de AGOSTO (journal.date).
//
// Este helper é a promoção do todayISO de lib/tokens.js e do localDayStr da
// HomeScreen pra um lugar compartilhado — qualquer código novo que precise de
// "hoje" em YYYY-MM-DD deve importar daqui, nunca usar toISOString.

function pad2(n) {
  return String(n).padStart(2, '0');
}

// Dia local em YYYY-MM-DD.
export function localDayStr(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// Timestamp local SEM sufixo Z (YYYY-MM-DDTHH:mm:ss). new Date(string) parseia
// data-hora sem offset como hora LOCAL (spec ES), então exibição continua
// idêntica — mas .slice(0, 10) e .startsWith('YYYY-MM') passam a devolver o
// dia e o mês LOCAIS (é o que o Diário e o Wrapped mensal esperam).
export function localISOString(d = new Date()) {
  return `${localDayStr(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
