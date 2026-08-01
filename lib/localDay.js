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
//
// DATA INVALIDA CAI PARA HOJE (01/08/2026). Antes localDayStr(new Date('lixo'))
// devolvia a string 'NaN-NaN-NaN' — e esse valor VIAJAVA: virava chave de dia
// no streak, prefixo de mes no Wrapped, campo `date` de entrada do Diario.
// Nenhum desses lugares testa NaN, entao o estrago aparecia longe da origem,
// como "meu streak sumiu" ou "a leitura nao aparece em mes nenhum". Cair para
// hoje e a degradacao certa aqui: o dia local e sempre conhecivel, e um dia
// util errado por um caso impossivel e melhor que uma chave envenenada.
export function localDayStr(d = new Date()) {
  const data = d instanceof Date && !Number.isNaN(d.getTime()) ? d : new Date();
  return `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(data.getDate())}`;
}

// Timestamp local SEM sufixo Z (YYYY-MM-DDTHH:mm:ss). new Date(string) parseia
// data-hora sem offset como hora LOCAL (spec ES), então exibição continua
// idêntica — mas .slice(0, 10) e .startsWith('YYYY-MM') passam a devolver o
// dia e o mês LOCAIS (é o que o Diário e o Wrapped mensal esperam).
export function localISOString(d = new Date()) {
  // Mesma guarda do localDayStr — senao a parte da DATA cairia para hoje e a
  // da HORA continuaria 'NaN:NaN:NaN', produzindo um timestamp meio valido,
  // que e pior que um invalido inteiro: ele passa por checagem superficial.
  const data = d instanceof Date && !Number.isNaN(d.getTime()) ? d : new Date();
  return `${localDayStr(data)}T${pad2(data.getHours())}:${pad2(data.getMinutes())}:${pad2(data.getSeconds())}`;
}
