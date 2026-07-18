// lib/dailyThought.js
// "Pensamento cósmico do dia" — mesmo padrão de apps de versículo diário
// (Bíblia, meditação), mas correlacionado de verdade com o dia: junta várias
// peças que já são REAIS e calculadas em outro lugar do app (fase da Lua,
// signo da Lua, regência tradicional do dia da semana, Mercúrio retrógrado,
// aspecto mais exato do dia) numa frase só. Nunca inventa uma previsão nova
// pra alguma combinação específica — só descreve, com o mesmo tom simbólico
// e honesto do resto do app, o que já é fato de tradição ou cálculo real.
// Se a lib de astronomia não estiver disponível, devolve um fallback
// honesto — nunca fabrica um "signo/fase/aspecto de hoje".
import { moonSign, aspects, isMercuryRetrograde } from './signs';
import { getMoonPhase } from './lunarCalendar';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// Regência tradicional dos dias da semana (ordem caldaica — a mesma usada em
// qualquer livro/site de astrologia ocidental, fato de tradição, não
// horóscopo individual). Índice = Date.getDay() (0 = domingo). Dá variedade
// real de tema ao longo da semana sem precisar adivinhar "o humor da pessoa
// hoje" — o mesmo dia da semana traz o mesmo tema pra todo mundo. `theme`
// escrito sempre em tom de motivação/abundância/apoio — o convite é ler e
// sentir vontade de voltar amanhã, não uma descrição técnica do regente.
export const RULER_BY_WEEKDAY = [
  { planet: 'Sol', emoji: '☀️', theme: 'brilhar do seu próprio jeito e lembrar do seu valor' }, // domingo
  { planet: 'Lua', emoji: '🌙', theme: 'cuidar de quem você ama — incluindo você mesma(o)' }, // segunda
  { planet: 'Marte', emoji: '🔥', theme: 'agir com coragem — todo primeiro passo já é motivo de orgulho' }, // terça
  { planet: 'Mercúrio', emoji: '💬', theme: 'uma boa conversa que pode destravar o que você precisa' }, // quarta
  { planet: 'Júpiter', emoji: '🍀', theme: 'ficar de olho nas portas que estão se abrindo pra você' }, // quinta
  { planet: 'Vênus', emoji: '💛', theme: 'atrair abundância — amor, beleza e prosperidade por perto' }, // sexta
  { planet: 'Saturno', emoji: '🪐', theme: 'dar um passo firme de cada vez — a disciplina de hoje é o presente de amanhã' }, // sábado
];

// Tom por tipo de aspecto (convenção tradicional: trígono/sextil = fluem
// fácil, quadratura/oposição = tensão que impulsiona crescimento, conjunção =
// energias somando força) — mesmo significado usado em qualquer livro de
// astrologia, só escrito de um jeito que dá vontade de ler, não um relatório.
const ASPECT_TONE = {
  Conjunção: 'somando forças a seu favor',
  Sextil: 'abrindo uma oportunidade leve de aproveitar',
  Trígono: 'fluindo fácil, quase sem esforço',
  Quadratura: 'pedindo um ajuste — a tensão de hoje é o convite pra crescer',
  Oposição: 'pedindo equilíbrio entre dois lados que importam pra você',
};

export function rulerOfDay(date = new Date()) {
  return RULER_BY_WEEKDAY[date.getDay()];
}

// Aspecto mais forte do dia = o de menor orb (mais próximo do ângulo exato)
// entre todos os que aspects() encontrar — nunca fabrica um aspecto que não
// exista: se o array vier vazio ou aspects() devolver null, devolve null.
function strongestAspect(dateStr) {
  const all = aspects(dateStr);
  if (!all || all.length === 0) return null;
  return all.reduce((best, a) => (a.orb < best.orb ? a : best), all[0]);
}

// Complementa a reflexão da fase lunar (já real) com o signo real da Lua, a
// regência real do dia da semana, o status real de Mercúrio retrógrado e o
// aspecto mais exato do dia — todas peças que já existiam separadas no app
// (Mapa Astral, Calendário Lunar); aqui só juntamos numa única frase pro
// card do dia. `personalSign` é opcional e é o signo real da PESSOA (já
// calculado em outro lugar do app, ex. HomeScreen — nunca escolhido/inventado
// aqui): quando presente, só personaliza o endereçamento da frase.
export function getThoughtForDate(date = new Date(), personalSign = null) {
  const phase = getMoonPhase(date);
  if (!phase) {
    // astronomy-engine indisponível ou data inválida — nunca fabrica fase/signo.
    return 'O céu de hoje ainda está carregando — abra o Calendário Lunar em instantes.';
  }

  const dateStr = toDateStr(date);
  const moon = moonSign(dateStr);
  const signPart = moon?.name ? `A Lua está em ${moon.name} ${moon.emoji || ''}. ` : '';
  const greeting = personalSign?.name
    ? `${personalSign.icon ? personalSign.icon + ' ' : ''}${personalSign.name}, `
    : '';

  const ruler = rulerOfDay(date);
  const rulerPart = ` Hoje é dia de ${ruler.planet} ${ruler.emoji} — deixa espaço pra ${ruler.theme}.`;

  const retro = isMercuryRetrograde(dateStr);
  const retroPart = retro
    ? ' Mercúrio está em movimento retrógrado ↩️ — ótimo momento pra rever, repensar e ajustar com calma, sem pressa de decidir tudo agora.'
    : '';

  const aspect = strongestAspect(dateStr);
  const aspectPart = aspect
    ? ` ${aspect.planetA} e ${aspect.planetB} estão em ${aspect.aspectType.toLowerCase()} hoje — ${ASPECT_TONE[aspect.aspectType]}.`
    : '';

  return `${greeting}${phase.emoji} ${phase.name}. ${signPart}${phase.reflexao}${rulerPart}${retroPart}${aspectPart}`;
}

export function getTodaysThought(personalSign = null) {
  return getThoughtForDate(new Date(), personalSign);
}
