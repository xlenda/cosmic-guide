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
import { moonSign, aspects, isMercuryRetrograde, SIGNS } from './signs';
import { getMoonPhase } from './lunarCalendar';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// Regência tradicional dos dias da semana (ordem caldaica — a mesma usada em
// qualquer livro/site de astrologia ocidental, fato de tradição, não
// horóscopo individual). Índice = Date.getDay() (0 = domingo). Essa ordem
// (Sol-Lua-Marte-Mercúrio-Júpiter-Vênus-Saturno) se repete toda semana de
// verdade — por isso `next` (a ponte pro dia seguinte) nunca é fabricado,
// é sempre o regente real de amanhã. `theme` varia a faixa emocional de
// propósito (motivação, ternura, coragem, abundância, peso/introspecção no
// dia de Saturno) — não é positividade forçada todo dia, é sentir o que faz
// sentido sentir, sempre pousando em apoio no final.
export const RULER_BY_WEEKDAY = [
  {
    planet: 'Sol', emoji: '☀️',
    theme: 'brilhar do seu próprio jeito, sem precisar se explicar pra ninguém',
    next: 'Amanhã a Lua chega trazendo espaço pra sentir mais fundo — guarda um lugar pra isso.',
  }, // domingo
  {
    planet: 'Lua', emoji: '🌙',
    theme: 'sentir com profundidade e cuidar de quem você ama — inclusive você mesma(o)',
    next: 'Amanhã Marte empresta coragem pro que você sentiu hoje virar ação.',
  }, // segunda
  {
    planet: 'Marte', emoji: '🔥',
    theme: 'agir mesmo com medo — coragem de verdade é dar o passo apesar dele',
    next: 'Amanhã Mercúrio ajuda a colocar em palavras o que você começou a mover hoje.',
  }, // terça
  {
    planet: 'Mercúrio', emoji: '💬',
    theme: 'dizer o que precisa ser dito, mesmo que a voz saia tremendo um pouco',
    next: 'Amanhã Júpiter abre horizontes a partir do que foi conversado hoje.',
  }, // quarta
  {
    planet: 'Júpiter', emoji: '🍀',
    theme: 'acreditar que ainda dá tempo pras coisas boas acontecerem',
    next: 'Amanhã Vênus convida pro amor e pra abundância — aproveita o que se abriu hoje.',
  }, // quinta
  {
    planet: 'Vênus', emoji: '💛',
    theme: 'se permitir receber amor, beleza e abundância sem culpa',
    next: 'Amanhã Saturno ajuda a dar forma e raiz a tudo isso.',
  }, // sexta
  {
    planet: 'Saturno', emoji: '🪐',
    theme: 'encarar o que pesa com maturidade — nem tudo precisa ser leve pra valer a pena',
    next: 'Amanhã o ciclo recomeça com o Sol — um capítulo novo da sua semana.',
  }, // sábado
];

// Tom por tipo de aspecto (convenção tradicional: trígono/sextil = fluem
// fácil, quadratura/oposição = tensão real que pesa antes de virar
// crescimento, conjunção = energias somando força) — mesmo significado usado
// em qualquer livro de astrologia, só escrito com espaço pra sentir o peso
// quando ele existir de verdade, em vez de forçar leveza o tempo todo.
const ASPECT_TONE = {
  Conjunção: 'somando forças a seu favor',
  Sextil: 'abrindo uma oportunidade leve de aproveitar',
  Trígono: 'fluindo fácil, quase sem esforço',
  Quadratura: 'cobrando uma decisão difícil — dói, mas é o tipo de dor que faz crescer',
  Oposição: 'puxando pra dois lados — tudo bem sentir o peso disso antes de achar o equilíbrio',
};

export function rulerOfDay(date = new Date()) {
  return RULER_BY_WEEKDAY[date.getDay()];
}

// Distância angular real entre o signo da Lua hoje e o signo PESSOAL de quem
// abre o app (índice na roda do zodíaco × 30°, o mesmo jeito que qualquer
// mapa astral calcula aspecto entre dois pontos) — index 0 = mesmo signo
// (conjunção) até index 6 = signo oposto (oposição). Antes o "Pensamento
// Cósmico" só usava o signo da pessoa pra endereçar a saudação ("Capricórnio,
// ...") — o resto do texto (fase da Lua, regente do dia, aspecto do dia) era
// idêntico pra qualquer signo no mesmo dia, então duas pessoas com signos
// diferentes liam a mesma leitura só com o nome trocado (achado real do
// Lenda, 25/07/2026). Isso aqui faz o conteúdo variar de verdade por signo,
// com base num aspecto real (Lua transitando x signo natal), não inventado.
const SIGN_RELATION_TONE = [
  'A Lua está bem no seu signo hoje — leve o dia com o coração mais exposto, sua sensibilidade está em alta.',
  'A Lua pede um ajuste fino na sua rotina hoje — pequenas adaptações rendem mais que grandes decisões.',
  'A Lua abre uma oportunidade leve pro seu signo hoje — vale aproveitar sem forçar.',
  'A Lua tensiona um pouco o seu signo hoje — pode cobrar uma decisão que você vinha adiando.',
  'A Lua flui fácil com o seu signo hoje — as coisas tendem a se resolver com menos esforço que o normal.',
  'A Lua pede um pequeno reajuste de expectativa hoje — o que parece fora do lugar só precisa de outro ângulo.',
  'A Lua está bem em frente ao seu signo hoje — é normal sentir um puxa-empurra entre o que você quer e o que o momento pede.',
];

function signRelationTone(personSignName, moonSignName) {
  const personIdx = SIGNS.findIndex((s) => s.name === personSignName);
  const moonIdx = SIGNS.findIndex((s) => s.name === moonSignName);
  if (personIdx === -1 || moonIdx === -1) return '';
  const rawDiff = Math.abs(personIdx - moonIdx) % 12;
  const distance = Math.min(rawDiff, 12 - rawDiff); // 0..6, simétrico (60°=300° na prática)
  return ` ${SIGN_RELATION_TONE[distance]}`;
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
  const dateStr = toDateStr(date);
  // Ancorado ao meio-dia UTC do dia — mesmo padrão de moonSign/aspects/
  // isMercuryRetrograde logo abaixo (signs.js usa `${dateStr}T12:00:00Z`).
  // Sem isso, a fase mudava com o instante real da chamada (a Lua avança
  // ~12°/dia num bin de 45°) enquanto o resto do texto já era fixo por data
  // — descombinando a Home (aberta à noite) do push diário (enviado às 12:00
  // UTC), cada um narrando uma fase da Lua diferente no mesmo dia (achado
  // real de auditoria, 25/07/2026).
  const phase = getMoonPhase(new Date(`${dateStr}T12:00:00Z`));
  if (!phase) {
    // astronomy-engine indisponível ou data inválida — nunca fabrica fase/signo.
    return 'O céu de hoje ainda está carregando — abra o Calendário Lunar em instantes.';
  }

  const moon = moonSign(dateStr);
  const signPart = moon?.name ? `A Lua está em ${moon.name} ${moon.emoji || ''}. ` : '';
  const greeting = personalSign?.name
    ? `${personalSign.icon ? personalSign.icon + ' ' : ''}${personalSign.name}, `
    : '';
  // Só existe quando sabemos o signo real da pessoa E o da Lua hoje — nunca
  // fabrica uma relação sem os dois dados de verdade.
  const relationPart = personalSign?.name && moon?.name ? signRelationTone(personalSign.name, moon.name) : '';

  const ruler = rulerOfDay(date);
  const rulerPart = ` Hoje é dia de ${ruler.planet} ${ruler.emoji} — deixa espaço pra ${ruler.theme}. ${ruler.next}`;

  const retro = isMercuryRetrograde(dateStr);
  const retroPart = retro
    ? ' Se hoje parecer que nada anda no ritmo certo, Mercúrio retrógrado ↩️ explica isso — não é impressão sua. É um convite pra rever e ajustar com calma, sem pressa de decidir tudo agora.'
    : '';

  const aspect = strongestAspect(dateStr);
  const aspectPart = aspect
    ? ` ${aspect.planetA} e ${aspect.planetB} estão em ${aspect.aspectType.toLowerCase()} hoje — ${ASPECT_TONE[aspect.aspectType]}.`
    : '';

  return `${greeting}${phase.emoji} ${phase.name}. ${signPart}${phase.reflexao}${relationPart}${rulerPart}${retroPart}${aspectPart}`;
}

export function getTodaysThought(personalSign = null) {
  return getThoughtForDate(new Date(), personalSign);
}
