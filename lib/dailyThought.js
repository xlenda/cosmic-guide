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
//
// ============================ IDIOMAS (31/07/2026) =========================
// Este é o conteúdo nº 1 da Home: todo mundo lê, todo dia. Até aqui existia só
// em português. Agora `lang` ('pt' | 'es' | 'en', default e fallback 'pt')
// atravessa getThoughtForDate/getTodaysThought e troca SÓ as palavras — o
// texto que a pessoa lê vive em lib/traducoes/pensamento.es.js e
// pensamento.en.js, com a MESMA forma do PT.
//
// O MOTOR NÃO MUDA, e essa é a regra dura da parcela: mesmo dia + mesmo signo
// = MESMO pensamento, em qualquer idioma. Fase, signo lunar, regente do dia,
// retrógrado e aspecto continuam calculados e escolhidos exatamente como
// antes; o idioma entra só na hora de escrever. E o PT é OURO: sem `lang`, ou
// com lang='pt', a saída é byte a byte a de sempre — as constantes PT deste
// arquivo continuam sendo a fonte de verdade, e o "pack pt" é montado A PARTIR
// delas (nunca uma segunda cópia que possa divergir). test/pensamentoIdiomas.
// test.js trava isso com golden capturado ANTES da refatoração.
// ===========================================================================
//
// ============ A REFLEXÃO ABRE, A FICHA TÉCNICA FECHA (04/08/2026) ==========
// Feedback do dono, lendo o próprio card da Home: "♊ Gêmeos, 🌖 Quarto
// Minguante. A Lua está em Áries ♈..." — ele leu e não entendeu. E ele tem
// razão: as três primeiras coisas que o texto dizia eram um vocativo, um
// rótulo de fase e uma coordenada. Ficha técnica. Ninguém para o dedo numa
// ficha técnica; quem já sabe ler aquilo não precisa do card, e quem não sabe
// desiste na primeira linha.
//
// É o MESMO movimento que screens/CompatibilityScreen.js fez em 31/07/2026
// ("o quente abre, a fonte fecha"): lá, as cinco dimensões de vida real
// subiram pro topo e o aspecto/geometria/capítulo desceu pro bloco "De onde
// vem isso". Aqui a ordem virou:
//
//   ABRE  → a relação da Lua de hoje com o SEU signo (a linha mais pessoal
//           que este motor produz), depois a reflexão da fase.
//   MEIO  → regente do dia, Mercúrio retrógrado, aspecto do dia.
//   FECHA → O RECIBO: "De onde vem o que você acabou de ler: 🌕 Lua Cheia.
//           A Lua está em Leão ♌. Leitura de hoje para ♉ Touro."
//
// NADA SE PERDE — e isso é literal, não intenção: a fase, o signo da Lua e o
// signo da pessoa continuam TODOS no texto, só que no fim, como recibo do que
// foi dito. test/umaAncoraDaLua.test.js exige o nome da fase dentro do
// pensamento e continua verde por causa do recibo; test/pensamentoIdiomas.
// test.js ganhou uma trava nova ("a ficha técnica não abre, o recibo fecha")
// pra que ninguém desfaça isto sem ver.
//
// O golden PT foi recapturado de propósito (scripts/recapturar-golden-
// pensamento.js): esta mudança de ordem É a parcela, não um acidente.
// ===========================================================================
import { moonSign, aspects, isMercuryRetrograde, SIGNS } from './signs';
import { faseDoDia } from './lunarCalendar';
import PACK_ES from './traducoes/pensamento.es';
import PACK_EN from './traducoes/pensamento.en';

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

// Devolve SEMPRE o objeto PT canônico — sem `lang` de propósito. Três outros
// módulos casam pelo nome do planeta que sai daqui (lib/cosmicSound.js escolhe
// a nota base por `planet`, lib/grounding.js e lib/rituais.js casam o dia da
// semana pelo mesmo nome). Traduzir aqui quebraria os três em silêncio; quem
// precisa do nome na tela traduz na hora de escrever, com o mapa `planetas` do
// pack.
export function rulerOfDay(date = new Date()) {
  // DATA INVALIDA NAO PODE DERRUBAR A TELA (01/08/2026). getDay() de um Date
  // invalido devolve NaN, RULER_BY_WEEKDAY[NaN] e undefined, e quem chama
  // (getSkyTuning em lib/cosmicSound.js) fazia .planet em cima disso —
  // TypeError, e o Som do Ceu morria junto com a Home que o hospeda.
  //
  // O regente do dia e aritmetica de dia da semana: sempre ha um dia de hoje,
  // entao cair para hoje e a resposta certa, nao um chute. Nada aqui depende
  // de efemeride — a regra de "nunca fabricar ceu" nao se aplica a este campo.
  const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  return RULER_BY_WEEKDAY[d.getDay()];
}

// Os dez nomes canônicos de planeta que aspects() pode devolver (lib/signs.js,
// const PLANETS — que não é exportada). Existem aqui por dois motivos: montar
// o mapa de identidade do PT e dar aos packs uma lista fechada a cobrir.
// Duas fontes de verdade só não viram bug porque test/pensamentoIdiomas.test.js
// compara esta lista com os nomes que aspects() devolve de verdade ao longo de
// um ano inteiro — mesma trava que GLIFO_POR_SIGNO tem em lib/wallpaper.js.
export const PLANETAS_CANONICOS = [
  'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte',
  'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão',
];

// Relação entre o signo da Lua hoje e o signo PESSOAL de quem abre o app, lida
// por SIGNO INTEIRO (whole-sign): conta-se a distância em signos na roda, não em
// graus com orbe.
//
// Isto é doutrina helenística legítima — dois signos se veem ou não se veem, sem
// orbe — e é a escolha certa aqui, porque o dado de partida é o signo solar, que
// já é uma faixa de 30° e não um grau. O comentário anterior dizia que era "o
// mesmo jeito que qualquer mapa astral calcula aspecto entre dois pontos", o que
// não é verdade: mapa astral moderno compara longitudes exatas com orbe. As duas
// escolas existem, mas descrever uma como se fosse a outra induz quem mexer
// nesta função depois a confiar numa precisão que ela não tem.
//
// index 0 = mesmo signo
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

// A DISTÂNCIA é calculada nos nomes CANÔNICOS (os de lib/signs.js) — nunca nos
// traduzidos. O idioma entra só em `tons`, a lista de frases do pack: a conta é
// a mesma nos três, o que muda é a língua em que ela é dita.
//
// Devolve a frase LIMPA, sem espaço na frente (04/08/2026): quem junta os
// blocos agora é o `.join(' ')` lá embaixo, e esta linha passou a ser a
// PRIMEIRA do texto — um espaço grudado aqui viraria espaço duplo depois da
// abertura por período.
function signRelationTone(personSignName, moonSignName, tons) {
  const personIdx = SIGNS.findIndex((s) => s.name === personSignName);
  const moonIdx = SIGNS.findIndex((s) => s.name === moonSignName);
  if (personIdx === -1 || moonIdx === -1) return '';
  const rawDiff = Math.abs(personIdx - moonIdx) % 12;
  const distance = Math.min(rawDiff, 12 - rawDiff); // 0..6, simétrico (60°=300° na prática)
  return tons[distance];
}

// Aspectos GERACIONAIS: pares entre os transpessoais. Urano, Netuno e Plutão se
// movem tão devagar que os pares entre eles ficam dentro de orbe por anos —
// o sextil Netuno-Plutão está em orbe praticamente sem interrupção desde os anos
// 1940. Eles descrevem o pano de fundo de coortes inteiras e, por definição, não
// dizem nada sobre o dia de ninguém.
const GENERATIONAL = new Set(['Urano', 'Netuno', 'Plutão']);
// Luminares e planetas pessoais — os únicos que se movem rápido o bastante para
// um aspecto "de hoje" significar hoje.
const PERSONAL = new Set(['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte']);

function aspectTier(a) {
  // 0 = envolve luminar/planeta pessoal (aspecto que realmente muda no dia)
  if (PERSONAL.has(a.planetA) || PERSONAL.has(a.planetB)) return 0;
  // 1 = Júpiter/Saturno entre si (semanas — dá pra chamar de "momento")
  if (!GENERATIONAL.has(a.planetA) && !GENERATIONAL.has(a.planetB)) return 1;
  // 2 = pelo menos um transpessoal com Júpiter/Saturno (meses)
  if (!GENERATIONAL.has(a.planetA) || !GENERATIONAL.has(a.planetB)) return 2;
  // 3 = transpessoal com transpessoal: geracional puro, nunca leitura do dia
  return 3;
}

// Aspecto do dia. Antes era simplesmente o de MENOR ORBE entre os 45 pares, e o
// resultado era que os pares transaturninos venciam quase sempre: rodando 2026
// dia a dia, Netuno-Plutão sextil vencia em 93 dias e o conjunto geracional em
// 148 dias — 41% do ano com um aspecto de coorte apresentado como novidade do
// dia, em blocos contínuos de meses (30/07 a 30/10 de 2026 lia a mesma frase).
//
// Agora a escolha é hierárquica, como qualquer efeméride séria pondera: primeiro
// o tier (velocidade e relevância pessoal), só depois o orbe dentro do tier.
// Aspecto puramente geracional (tier 3) é DESCARTADO — melhor não ter frase de
// aspecto no dia do que chamar de "hoje" algo que dura décadas.
// Nunca fabrica: array vazio, aspects() null ou só tier 3 → devolve null.
function strongestAspect(dateStr) {
  const all = aspects(dateStr);
  if (!all || all.length === 0) return null;
  const usable = all.filter((a) => aspectTier(a) < 3);
  if (usable.length === 0) return null;
  return usable.reduce((best, a) => {
    const ta = aspectTier(a);
    const tb = aspectTier(best);
    if (ta !== tb) return ta < tb ? a : best;
    return a.orb < best.orb ? a : best;
  }, usable[0]);
}

// Complementa a reflexão da fase lunar (já real) com o signo real da Lua, a
// regência real do dia da semana, o status real de Mercúrio retrógrado e o
// aspecto mais exato do dia — todas peças que já existiam separadas no app
// (Mapa Astral, Calendário Lunar); aqui só juntamos numa única frase pro
// card do dia. `personalSign` é opcional e é o signo real da PESSOA (já
// calculado em outro lugar do app, ex. HomeScreen — nunca escolhido/inventado
// aqui): quando presente, ele faz duas coisas e só essas duas — escolhe a
// relação da Lua de hoje com o signo (a linha que ABRE o texto) e assina o
// recibo no fim ("Leitura de hoje para ♉ Touro.").
//
// A ORDEM DE SAÍDA, desde 04/08/2026 (ver o bloco no topo do arquivo):
//   relação com o seu signo · reflexão da fase · regente · retrógrado ·
//   aspecto · RECIBO (fase + Lua no signo + para quem).
//
// `lang` (3º argumento, OPCIONAL) só troca as palavras. Sem ele — ou com 'pt'
// — a saída é byte a byte a de sempre, porque o pacote 'pt' É montado das
// constantes deste arquivo. Nada de cálculo muda com o idioma: a fase, o signo
// da Lua, o regente, o retrógrado e o aspecto do dia são exatamente os mesmos
// em pt, es e en.
export function getThoughtForDate(date = new Date(), personalSign = null, lang = 'pt') {
  const P = pacoteDoIdioma(lang);
  const dateStr = toDateStr(date);
  // Ancorado ao meio-dia UTC do dia — mesmo padrão de moonSign/aspects/
  // isMercuryRetrograde logo abaixo (signs.js usa `${dateStr}T12:00:00Z`).
  // Sem isso, a fase mudava com o instante real da chamada (a Lua avança
  // ~12°/dia num bin de 45°) enquanto o resto do texto já era fixo por data
  // — descombinando a Home (aberta à noite) do push diário (enviado às 12:00
  // UTC), cada um narrando uma fase da Lua diferente no mesmo dia (achado
  // real de auditoria, 25/07/2026).
  // O nome e a reflexão da fase saem do MESMO motor do Calendário Lunar, já com
  // idioma (lib/lunarCalendar.js, bloco `fases` dos packs de calendario.*) —
  // uma fonte de verdade só pro nome da fase em todo o app.
  const phase = faseDoDia(dateStr, lang);
  if (!phase) {
    // astronomy-engine indisponível ou data inválida — nunca fabrica fase/signo.
    return P.carregando;
  }

  const moon = moonSign(dateStr);
  // A COORDENADA DA LUA — vive no recibo do fim desde 04/08/2026. `luaEm`
  // continua sendo uma frase inteira, com ponto e espaço no fim, porque é
  // exatamente assim que ela entra no meio do recibo, entre o nome da fase e a
  // linha de endereçamento.
  const luaPart = moon?.name
    ? preencher(P.luaEm, { signo: nomeExibido(P.signos, moon.name), emoji: moon.emoji || '' })
    : '';
  // O ENDEREÇAMENTO também desceu: era o vocativo que abria o texto ("♉ Touro,
  // 🌕 Lua Cheia...") e virou a última linha do recibo ("Leitura de hoje para
  // ♉ Touro."). O signo da pessoa não sumiu — mudou de lugar, que é a única
  // coisa que esta parcela faz com ele.
  const assinaturaPart = personalSign?.name
    ? preencher(P.assinatura, {
        icone: personalSign.icon ? personalSign.icon + ' ' : '',
        signo: nomeExibido(P.signos, personalSign.name),
      })
    : '';
  // Só existe quando sabemos o signo real da pessoa E o da Lua hoje — nunca
  // fabrica uma relação sem os dois dados de verdade. É a linha mais pessoal
  // que este motor produz, e por isso é ela que ABRE o texto quando existe.
  const relationPart =
    personalSign?.name && moon?.name
      ? signRelationTone(personalSign.name, moon.name, P.relacaoSigno)
      : '';

  const ruler = rulerOfDay(date);
  const rulerTexto = P.regentes[date.getDay()];
  const rulerPart = preencher(P.regenteFrase, {
    planeta: nomeExibido(P.planetas, ruler.planet),
    emoji: ruler.emoji,
    tema: rulerTexto.tema,
    ponte: rulerTexto.ponte,
  });

  const retro = isMercuryRetrograde(dateStr);
  const retroPart = retro ? P.retrogrado : '';

  const aspect = strongestAspect(dateStr);
  // "hoje" só quando o aspecto realmente é de hoje (tier 0: envolve luminar ou
  // planeta pessoal). Aspecto entre planetas lentos dura semanas ou meses e é
  // anunciado como período, não como novidade do dia — dizer "hoje" para algo
  // que não muda em três meses é a mesma coisa que sortear, só com aparência
  // de cálculo.
  const aspectWhen = aspect && aspectTier(aspect) === 0 ? P.aspectoQuando.hoje : P.aspectoQuando.periodo;
  // Tipo de aspecto que o pack do idioma não conhece cai no PT e, se nem lá
  // existir, no próprio nome em minúscula — que é exatamente o que o texto
  // português sempre imprimiu.
  const aspectoInfo = (aspect && (P.aspectos[aspect.aspectType] || PACOTE_PT.aspectos[aspect.aspectType])) || {};
  const aspectPart = aspect
    ? preencher(P.aspectoFrase, {
        planetaA: nomeExibido(P.planetas, aspect.planetA),
        planetaB: nomeExibido(P.planetas, aspect.planetB),
        aspecto: aspectoInfo.nome ?? aspect.aspectType.toLowerCase(),
        quando: aspectWhen,
        tom: aspectoInfo.tom,
      })
    : '';

  // O RECIBO — o fecho. Tudo o que antes abria o texto (fase, signo da Lua,
  // signo da pessoa) está aqui dentro, nesta ordem, anunciado pelo que é: a
  // procedência do que a pessoa acabou de ler. `.trim()` porque as duas peças
  // opcionais (a Lua sem nome, a pessoa sem signo) deixariam um espaço solto no
  // fim da frase — e um espaço no fim de um card é lixo que vaza pro share.
  const recibo = `${P.recibo}${phase.emoji} ${phase.name}. ${luaPart}${assinaturaPart}`.trim();

  // A ORDEM É A PARCELA (04/08/2026): reflexão na frente, recibo no fim. O
  // `.join(' ')` num array filtrado substituiu a concatenação com espaços
  // grudados em cada pedaço — assim um bloco ausente (sem relação de signo, sem
  // retrógrado, sem aspecto) não deixa espaço duplo no meio do texto.
  return [relationPart, phase.reflexao, rulerPart, retroPart, aspectPart, recibo]
    .filter(Boolean)
    .join(' ');
}

// ---------------------------------------------------------------------------
// Variação por PERÍODO do dia (manhã/tarde/noite) — a versão honesta do
// "conteúdo novo a cada hora" que o concorrente nº 1 anuncia. Lá, é frase
// gerada sem lastro; aqui, o pensamento-base do dia continua sendo UM só — o
// mesmo motor determinístico de getThoughtForDate (fase, signo da Lua,
// regente, retrógrado, aspecto — tudo real e calculado) — e o que muda entre
// manhã, tarde e noite é SÓ a frase de abertura, que aponta pro momento em
// que a pessoa está de verdade: dia começando, meio do caminho, fechamento.
// Abrir o app às 8h e de novo às 21h dá sensação de conteúdo vivo sem
// fabricar leitura nova nenhuma — e sem custo de IA.

// Faixas: manhã 5h–11h59, tarde 12h–17h59, noite o resto (18h–4h59).
// Hora LOCAL do aparelho de propósito — "manhã" é a manhã de quem abre o
// app, não a de um fuso de servidor.
export function periodoDoDia(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'manha';
  if (h >= 12 && h < 18) return 'tarde';
  return 'noite';
}

// UMA frase de abertura por período — vida real primeiro, sem previsão e sem
// promessa: manhã aponta pro dia que começa, tarde pro meio do caminho,
// noite pro fechamento (e pro Diário, que é onde o dia se anota).
//
// A FORMA DAS TRÊS, desde 04/08/2026: SOCO CURTO, DEPOIS O DESENVOLVIMENTO.
// Antes eram três frases corretas e mornas ("O dia está começando agora,
// inteiro, sem nada escrito nele ainda") — descreviam a hora, e descrição não
// prende. Agora cada uma começa com uma sentença curta que para o dedo e só
// então se desdobra num convite. É a primeira linha que a pessoa lê no app;
// se ela não segurar, o resto do pensamento não é lido.
//
// A régua não afrouxou junto: convite e espelho, nunca promessa. Nenhuma das
// três diz o que VAI acontecer — dizem o que ainda não foi decidido, o que dá
// pra perguntar e o que vale anotar. "Nada foi decidido" é fato sobre o
// relógio, não profecia sobre a vida de ninguém.
export const ABERTURA_POR_PERIODO = {
  manha:
    'Ninguém escreveu nada neste dia ainda. Ele chega inteiro, e a primeira coisa que entra nele é o que você decidir olhar primeiro.',
  tarde:
    'Metade do seu dia já foi embora. A pergunta honesta é se ele está indo pro lado que você queria — e ainda tem a outra metade pra responder.',
  noite:
    'O dia está fechando a porta. Antes de dormir, vale olhar pra trás e escrever uma linha sobre o que ele te deixou — o que ninguém anota costuma sumir.',
};

// ---------------------------------------------------------------------------
// OS PACOTES DE TEXTO — pt montado das constantes acima, es/en de lib/traducoes
// ---------------------------------------------------------------------------
// Vem depois de ABERTURA_POR_PERIODO porque o pacote 'pt' aponta pra ela: é
// dependência de inicialização, não organização. Nada aqui é chamado antes do
// módulo terminar de carregar (só de dentro de função), então a ordem serve.

function mapaIdentidade(nomes) {
  const out = {};
  for (const n of nomes) out[n] = n;
  return out;
}

// O "pack pt" — DERIVADO das constantes deste arquivo, nunca redigitado. É o
// que torna impossível a tradução mexer no português: se alguém editar uma
// constante PT, este pacote muda junto e o golden do teste morde na hora.
const PACOTE_PT = {
  aberturas: ABERTURA_POR_PERIODO,
  carregando: 'O céu de hoje ainda está carregando — abra o Calendário Lunar em instantes.',
  // AS TRÊS PEÇAS DO RECIBO (04/08/2026). `recibo` é o rótulo que anuncia a
  // procedência — nome emprestado do bloco "De onde vem isso" de
  // screens/CompatibilityScreen.js, pra que o app chame a mesma coisa pelo
  // mesmo nome em toda tela. `luaEm` é a coordenada (era a segunda frase do
  // texto, hoje é a segunda linha do recibo) e `assinatura` é o endereçamento
  // (era o vocativo de abertura, hoje é a última linha).
  recibo: 'De onde vem o que você acabou de ler: ',
  luaEm: 'A Lua está em {signo} {emoji}. ',
  assinatura: 'Leitura de hoje para {icone}{signo}.',
  regenteFrase: 'Hoje é dia de {planeta} {emoji} — deixa espaço pra {tema}. {ponte}',
  aspectoFrase: '{planetaA} e {planetaB} estão em {aspecto} {quando} — {tom}.',
  relacaoSigno: SIGN_RELATION_TONE,
  regentes: RULER_BY_WEEKDAY.map((r) => ({ tema: r.theme, ponte: r.next })),
  retrogrado:
    'Se hoje parecer que nada anda no ritmo certo, Mercúrio retrógrado ↩️ explica isso — não é impressão sua. É um convite pra rever e ajustar com calma, sem pressa de decidir tudo agora.',
  aspectoQuando: { hoje: 'hoje', periodo: 'neste período' },
  // `nome` sai da própria chave: é literalmente o `aspectType.toLowerCase()`
  // que o texto PT sempre imprimiu — tipo de aspecto novo em lib/signs.js
  // nunca deixa o português com um buraco.
  aspectos: Object.fromEntries(
    Object.entries(ASPECT_TONE).map(([tipo, tom]) => [tipo, { nome: tipo.toLowerCase(), tom }])
  ),
  signos: mapaIdentidade(SIGNS.map((s) => s.name)),
  planetas: mapaIdentidade(PLANETAS_CANONICOS),
};

const PACOTES = { pt: PACOTE_PT, es: PACK_ES, en: PACK_EN };

// Idioma desconhecido cai no PT — nunca inventa e nunca deixa a tela vazia.
// Exportada porque o teste mede a FORMA dos três pacotes pela mesma porta que
// a tela usa, em vez de importar os arquivos por fora.
export function pacoteDoIdioma(lang = 'pt') {
  return PACOTES[lang] || PACOTE_PT;
}

// Preenche {chaves} de um molde. Chave ausente vira string vazia — nunca
// "undefined" na cara de quem lê.
function preencher(molde, vars) {
  return String(molde).replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '' : String(vars[k])));
}

// Nome de exibição de um signo/planeta: a chave é o canônico de lib/signs.js.
// Nome que o pacote não conhece sai como está — um nome em português é melhor
// que um buraco na frase.
function nomeExibido(mapa, canonico) {
  return (mapa && mapa[canonico]) || canonico;
}

// Compatibilidade: a assinatura antiga (só personalSign) continua valendo —
// quem chama sem pensar em período recebe o texto do período de AGORA, com o
// mesmo pensamento-base de sempre logo depois da abertura. `date` é opcional
// e existe pra teste e pra quem quiser renderizar outro momento de propósito.
// `lang` é o 3º e último argumento pela mesma razão: chamada antiga não muda.
export function getTodaysThought(personalSign = null, date = new Date(), lang = 'pt') {
  const abertura = pacoteDoIdioma(lang).aberturas[periodoDoDia(date)];
  return `${abertura} ${getThoughtForDate(date, personalSign, lang)}`;
}
