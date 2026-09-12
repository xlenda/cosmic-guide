/* ===================================================================================
   O ATO ÚNICO DO DIA — "cada dia tem que ser uma coisa, eu não posso juntar
   as coisas" (o dono, 03/09/2026).

   Um dia = UM ato. O dia deixou de empilhar gesto + missão + pergunta +
   encontro; o rodízio virou o CALENDÁRIO, e cada casa do tabuleiro pede uma
   coisa só:

     · sexta      → 'ritmo'    (o dia de Vênus — o app já anuncia isso)
     · sábado     → 'encontro' (o convite de abrir horizonte)
     · domingo    → 'gesto'    (o giro dos cinco: café, caminhada, respiro…)
     · seg–qui    → gesto / missão / pergunta girando num padrão semanal

   Determinístico e puro: mesma data, mesmo ato, em qualquer aparelho, sem
   relógio e sem random — a mesma regra de todos os motores do app. Quem
   decide QUAL gesto ou QUAL missão continua sendo lib/plano.js e
   lib/missaoDoDia.js; aqui só se decide O TIPO do dia.
   =================================================================================== */

import { esDiaValido } from './ceu.js';

export const ATOS = Object.freeze(['gesto', 'missao', 'pergunta', 'ritmo', 'encontro']);

const MS_DIA = 86400000;

/* A validação é a de lib/ceu.js, não um NaN-check próprio: Date.UTC aceita
 * '2026-02-31' e rola para março em silêncio — exatamente o bug que
 * esDiaValido existe para barrar (achado do /code-review de 03/09). */
function utcDe(dia) {
  const [a, m, d] = String(dia).split('-').map(Number);
  return Date.UTC(a, m - 1, d);
}

/* Os padrões de segunda a quinta. Nenhum começa com 'gesto' (o domingo
 * anterior já foi) e nenhum tem vizinhos iguais — nem por dentro, nem nas
 * emendas com o domingo ('gesto') e com a sexta ('ritmo'). Quatro padrões
 * para a semana não ter cara de tabela. */
const SEMANAS = Object.freeze([
  ['missao', 'pergunta', 'gesto', 'missao'],
  ['pergunta', 'gesto', 'missao', 'pergunta'],
  ['missao', 'gesto', 'pergunta', 'missao'],
  ['pergunta', 'missao', 'gesto', 'pergunta'],
]);

/**
 * O tipo do dia. Nunca lança: data podre cai em 'gesto', que é o dia mais
 * seguro do app (o giro tem rede de contato própria).
 *
 * @param {string} dia  'YYYY-MM-DD'
 * @returns {'gesto'|'missao'|'pergunta'|'ritmo'|'encontro'}
 */
export function atoDoDia(dia) {
  if (!esDiaValido(dia)) return 'gesto';
  const utc = utcDe(dia);
  if (Number.isNaN(utc)) return 'gesto';
  const diaDaSemana = new Date(utc).getUTCDay();
  if (diaDaSemana === 5) return 'ritmo';
  if (diaDaSemana === 6) return 'encontro';
  if (diaDaSemana === 0) return 'gesto';
  // Semana estável pela própria data. ATENÇÃO à fronteira: com o +4 o balde
  // vira no DOMINGO (medido, não deduzido) — e tudo bem, porque seg–qui
  // nunca cruza um domingo e sex/sáb/dom são fixos. Se um padrão futuro
  // precisar que o domingo pertença à semana ANTERIOR, este offset muda.
  // Não depende da âncora da jornada — o tabuleiro é legível antes de
  // qualquer dado da pessoa.
  const semana = Math.floor((utc / MS_DIA + 4) / 7);
  const padrao = SEMANAS[((semana % SEMANAS.length) + SEMANAS.length) % SEMANAS.length];
  return padrao[diaDaSemana - 1];
}

/** O dia seguinte, no mesmo formato. Data podre volta como veio. */
export function diaSeguinte(dia) {
  if (!esDiaValido(dia)) return dia;
  const d = new Date(utcDe(dia) + MS_DIA);
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const diaDoMes = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}-${mes}-${diaDoMes}`;
}
