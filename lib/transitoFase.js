// lib/transitoFase.js
// APLICATIVO × SEPARATIVO — o aspecto que está CHEGANDO não é o mesmo que já
// está INDO EMBORA, e até hoje o app dizia a mesma frase para os dois.
//
// ===========================================================================
// O QUE ESTA FEATURE É, EM UMA FRASE
// ===========================================================================
// `lib/personalSky.js` calcula `Math.abs(sep - angle)` e, com o valor absoluto,
// PERDE O SINAL: um trânsito que ainda vai fechar e um que já fechou saem com
// o mesmo texto. Este módulo devolve o sinal — e o verbo muda de "está se
// formando" para "está se desfazendo".
//
// Fonte PRIMÁRIA e DUPLA, as duas do séc. II, e elas não dizem a mesma coisa:
//   · Ptolomeu, Tetrabiblos I.24 — o capítulo se chama, literalmente, "Of
//     Applications and Separations and the Other Powers": "In general those
//     which precede are said to 'apply' to those which follow, and those that
//     follow to 'be separated' from those that precede, when the interval
//     between them is not great." (trad. Robbins, Loeb/Harvard, 1940)
//   · Vétio Valente, Anthologiae IX.3 — o caso que a frase de Ptolomeu não
//     cobre: "If Jupiter is ahead <of the Ascendant> and is found to have a
//     retrograde configuration, its beneficial effect will be strong because
//     it is being carried towards the position of the Ascendant." (trad. Riley)
//
// Referência interna: docs/tradicao/13-tecnicas-preditivas.md §2 e §13.2(a),
// docs/tradicao/16-oportunidades-de-conteudo.md §3.
//
// ===========================================================================
// REGISTRO DE PESQUISA — duas correções à base, feitas lendo o texto
// ===========================================================================
// (exportadas em REGISTRO_DE_PESQUISA; ficam aqui porque este módulo não edita
// documento de outro agente, e sumir com o achado seria pior que registrá-lo
// no lugar errado)
//
// 1. docs/tradicao/99-o-que-falta.md registra como buraco: "Se a distinção
//    aplicativo/separativo existe em Ptolomeu. Achada em Valente (IX.3); não
//    procurada sistematicamente no Tetrabiblos." — ELA EXISTE. É o Tetrabiblos
//    I.24, e o capítulo tem esse nome no índice de Robbins. O buraco está
//    fechado, e a citação verbatim está no pack dos três idiomas.
//
// 2. docs/tradicao/11 §... atribui a frase da retrogradação ("they delay
//    expectations, actions, profits, and enterprises") à Anthologiae V. No
//    texto de Riley ela está no capítulo 14, "The Phases and Transits of the
//    Stars", com o cabeçalho de página "Book IV" e o marcador /183K/. Este
//    módulo cita IV.14 porque foi ali que a leu.
//
// ===========================================================================
// A CONTA, E POR QUE ELA ESTÁ CERTA 📐
// ===========================================================================
// O resíduo assinado. Para um aspecto de ângulo θ entre o planeta em trânsito
// (longitude L) e o ponto natal (longitude N, que não se move):
//
//   d    = norm180(L − N)                  → em qual lado o aspecto está
//   lado = θ é 0 ou 180 ? +1 : sinal(d)    → sextil/quadratura/trígono têm dois
//   r    = norm180(L − N − lado·θ)         → ZERO no instante exato do aspecto
//
// `r` é contínuo e passa por zero quando o aspecto perfaz. `|r|` é o orbe que
// `personalSky` já mostra; o SINAL de `r` é o que ele joga fora.
//
// Como o ponto natal é fixo, a derivada de `r` é o movimento diário do planeta:
//
//   movimentoDiario = norm180(L_amanhã − L_hoje)   (negativo = retrógrado)
//   diasParaExato   = −r / movimentoDiario         (+ futuro, − passado)
//
//   diasParaExato > 0 → APLICATIVO   (está se formando)
//   diasParaExato < 0 → SEPARATIVO   (já se desfez)
//
// Repare no que isso resolve de graça: o aspecto que perfaz DENTRO das próximas
// 24 horas. Comparar |r_hoje| com |r_amanhã| erraria esse caso — a Lua a 0,5°
// do exato hoje está a 12° do outro lado amanhã, e a comparação de módulos
// diria "separativo" para um aspecto que fecha em uma hora. O resíduo assinado
// acerta porque atravessa o zero em vez de refletir nele.
//
// 📐 MEDIDO nesta frente (01/08/2026), porque o sinal invertido seria invisível
// na tela e permanente no produto:
//
//   (1) DIREÇÃO. 3.735 aspectos em orbe (dez planetas, grade de longitudes
//       natais, janela de 2026 em diante), cada um com o instante exato do
//       aspecto achado por bisseção na efeméride real. A direção calculada por
//       hoje-vs-amanhã bateu com a direção real em 3.735 de 3.735 — ZERO
//       trocas de sinal. É por isso que este módulo sempre diz a fase.
//
//   (2) PRAZO. A mesma varredura, comparando o prazo estimado com o real:
//         até 1 dia   → erro mediano ≤ 0,01 d · pior caso 0,13 d (~3 h)
//         1 a 3 dias  → erro mediano ≤ 0,03 d · pior caso 1,12 d (Mercúrio
//                       perto de estação)
//         3 a 7 dias  → pior caso 36 dias (Mercúrio)
//         7 a 15 dias → pior caso 40 dias
//       O prazo em DIAS é uma reta traçada a partir de 24 horas de movimento, e
//       ela deixa de valer rápido: o planeta muda de velocidade e pode PARAR e
//       VOLTAR antes de chegar lá (301 dos 4.036 casos varridos nunca chegam ao
//       exato). Daí HORIZONTE_DO_PRAZO_DIAS = 3: dentro dele o app diz o prazo,
//       fora dele diz quantos GRAUS faltam — que é medida, não projeção — e
//       declara por que não põe data.
//
//   (3) POSIÇÃO × MOVIMENTO. Ptolomeu I.24 define por POSIÇÃO ("os que
//       precedem", "os que seguem"), supondo marcha direta. Valente IX.3 define
//       por MOVIMENTO. Em 66.445 aspectos em orbe entre 2020 e 2029, os dois
//       critérios discordam em 7.994 — pouco mais de um a cada oito — e as
//       7.994 discordâncias são, todas elas, planeta retrógrado. Cem por cento.
//       Saturno passa 37,5 dos dias retrógrado; Plutão, 44,5. Este app segue
//       Valente, e declara a escolha em vez de escondê-la.
//
// ===========================================================================
// NUNCA FABRICAR CÉU
// ===========================================================================
// Sem data de nascimento, sem efeméride ou sem um aspecto reconhecível, a
// função devolve `disponivel: false`, diz o que falta e diz onde resolver.
//
// E há um caso que este módulo RECUSA, com número na mão: aspecto ao natal da
// LUA quando não há hora de nascimento. `personalSky` usa meio-dia como
// aproximação — o que é aceitável para os lentos e é o que o Mapa Astral já
// faz. Para a Lua, não é: 📐 medido, ela anda até 7,69° em 24 horas (média
// 4,94°), mais que qualquer orbe desta tela. Comparando a Lua natal de meio-dia
// com a de 00:00 e a de 23:59 em 6.334 aspectos: 10.054 das 12.668 comparações
// SAEM DE ORBE, 2.613 continuam em orbe mas VIRAM A FASE, e exatamente 1
// sobrevive igual. Dizer "está se formando" sobre isso seria chutar cara ou
// coroa com cara de conta. O app diz que falta a hora e diz onde informá-la.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string dos packs
// ===========================================================================
// (mesma disciplina de lib/seita.js, lib/zodiacBody.js e lib/grounding.js — e
// vale nos TRÊS idiomas, sem exceção)
//
// 1. PRENDE PRIMEIRO, FONTE DEPOIS. Toda leitura abre na vida real — a briga de
//    segunda que ainda ocupa a quinta, a conversa que ainda não teve — em
//    língua de conversa. O recibo vem depois. Termo técnico ganha glosa na
//    primeira aparição ("aplicativo — o aspecto que ainda vai fechar").
// 2. TODA AFIRMAÇÃO HISTÓRICA CARREGA O LOCUS. Obra, autor, século. O que é
//    leitura do app vem rotulado como leitura do app (notaLeituraDoApp).
// 3. NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita, em nenhum idioma.
// 4. NADA DE VEREDITO NEM DE PROMESSA. A fase descreve o estado do ângulo, não
//    o desfecho da vida de ninguém.
// 5. NÃO COMPLETAR A LACUNA. O ponto delicado desta feature: a astrologia
//    moderna diz, o tempo todo, que o aspecto aplicativo é mais forte que o
//    separativo. Esta base NÃO achou a linha antiga que autorize isso — nem em
//    I.24, nem em IX.3. Por isso o app descreve os dois estados e NÃO os ordena.
//    Ver NAO_ACHADO.hierarquiaEntreOsDois.
// 6. NADA DE DATA DE EVENTO. O ângulo fecha na data que a conta diz — isso é
//    astronomia. "Trânsito exato = acontecimento no dia" é do séc. XX e do
//    software de efeméride barato (doc 13 §2), e o texto diz isso como
//    conteúdo datado, não como ressalva defensiva.
//
// ===========================================================================
// OS TRÊS IDIOMAS
// ===========================================================================
// Toda prosa vive em lib/traducoes/transitoFase.{pt,es,en}.js, com a MESMA
// forma: mesmas chaves, mesmas funções, mesma assinatura. O que NUNCA muda
// entre eles: o verbatim inglês de Robbins e de Riley (traduzir citação é
// falsificá-la), os loci (Tetrabiblos I.24 continua Tetrabiblos I.24), os
// números, e as CHAVES internas — nomes de planeta e de aspecto continuam em
// português nos três packs, porque são dados e vêm assim de personalSky.js. As
// funções públicas têm `lang` com default 'pt'.

import { planetPositions } from './signs';
import { traduzirAutor, traduzirQuando } from './traducoes/datacao.js';
import { PACK as PACK_PT } from './traducoes/transitoFase.pt.js';
import { PACK as PACK_ES } from './traducoes/transitoFase.es.js';
import { PACK as PACK_EN } from './traducoes/transitoFase.en.js';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma fora dos três cai no PT — mesmo fallback de lib/i18n.js, de
// lib/synastry.js e de lib/seita.js.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// 1. OS ÂNGULOS — a mesma tabela de lib/personalSky.js, e as CHAVES são as dele
// ---------------------------------------------------------------------------
// As chaves são os `aspectType` que personalSkyToday devolve. São dados, não
// texto de tela: continuam em PT nos três packs, e o pack traduz só o rótulo.
//
// Ptolomeu I.13 lista QUATRO aspectos (oposição, trígono, quadratura, sextil).
// A conjunção não é aspecto para ele — entra em I.24 como "bodily conjunction",
// categoria à parte, e é exatamente o capítulo desta feature. O app mantém as
// cinco porque é o que personalSky calcula, e diz de onde vem cada uma.
export const ANGULO_DO_ASPECTO = {
  'Conjunção': 0,
  'Sextil': 60,
  'Quadratura': 90,
  'Trígono': 120,
  'Oposição': 180,
};

export const ORDEM_DOS_ASPECTOS = ['Conjunção', 'Sextil', 'Quadratura', 'Trígono', 'Oposição'];

// Os dez que personalSky cruza. Sete clássicos + três modernos, e a ordem é a
// de PLANETS em lib/signs.js.
export const ORDEM_DOS_PLANETAS = [
  'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão',
];

// ---------------------------------------------------------------------------
// 2. OS DOIS LIMIARES — escolhas DESTE APP, e declaradas como tais
// ---------------------------------------------------------------------------
// Até quantos dias o app põe prazo em dias. Ver 📐 (2) no cabeçalho: dentro de
// três dias o erro mediano da reta ficou abaixo de uma hora; de uma semana em
// diante ele passa de um mês em alguns casos. Fora do horizonte o app diz
// GRAUS, que é medida, não projeção.
export const HORIZONTE_DO_PRAZO_DIAS = 3;

// Abaixo disto o planeta está, para efeito de leitura, parado no céu — e com
// planeta parado não existe "chegando" nem "indo embora". 📐 Medido em 3.653
// dias (2020–2029): pega 42 dias de Plutão, 33 de Netuno, 15 de Saturno, 2 de
// Marte e nenhum do Sol, da Lua ou de Mercúrio. É a estação, e a fonte antiga
// fala dela (Valente, Anthologiae IV.14).
export const LIMIAR_PARADO_GRAUS_POR_DIA = 0.0005;

// Meio dia para cada lado do exato: o app chama isso de "fecha hoje". É rótulo
// de leitura, não fronteira da tradição.
export const JANELA_DO_DIA_EXATO_DIAS = 0.5;

// ---------------------------------------------------------------------------
// 3. AS CONTAS DE BASE
// ---------------------------------------------------------------------------
function norm180(x) {
  return ((((x + 180) % 360) + 360) % 360) - 180;
}

// Mesma validação estrita de lib/signs.js e lib/seita.js: rejeita formato
// errado E data impossível ("2023-02-29"), que o construtor Date aceitaria em
// silêncio rolando pro mês seguinte.
function dataValida(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return false;
  const d = new Date(dateStr + 'T00:00');
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === +m[1] && d.getMonth() + 1 === +m[2] && d.getDate() === +m[3];
}

// O dia seguinte, em UTC. planetPositions sem hora usa 12:00Z, então hoje e
// amanhã ficam a EXATAMENTE 24 horas um do outro — a base da medida.
export function diaSeguinte(dateStr) {
  if (!dataValida(dateStr)) return null;
  const [a, m, d] = dateStr.split('-').map(Number);
  const t = Date.UTC(a, m - 1, d) + 86400000;
  const x = new Date(t);
  const p = (n) => String(n).padStart(2, '0');
  return `${x.getUTCFullYear()}-${p(x.getUTCMonth() + 1)}-${p(x.getUTCDate())}`;
}

// A mesma função de lib/personalSky.js — data LOCAL do aparelho, para que as
// duas telas nunca falem de dias diferentes.
function hojeStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const COMBINANTES = new RegExp('[\u0300-\u036f]', 'g');

function semAcento(s) {
  return String(s).normalize('NFD').replace(COMBINANTES, '').toLowerCase().trim();
}

const PLANETA_CANONICO = {};
for (const n of ORDEM_DOS_PLANETAS) PLANETA_CANONICO[semAcento(n)] = n;

const ASPECTO_CANONICO = {};
for (const a of ORDEM_DOS_ASPECTOS) ASPECTO_CANONICO[semAcento(a)] = a;

export function nomeCanonicoDePlaneta(planeta) {
  if (!planeta) return null;
  return PLANETA_CANONICO[semAcento(planeta)] || null;
}

export function nomeCanonicoDeAspecto(aspecto) {
  if (!aspecto) return null;
  return ASPECTO_CANONICO[semAcento(aspecto)] || null;
}

// Rótulos públicos para telas que recebem os identificadores canônicos de
// lib/signs.js. Reaproveitam os mesmos packs auditados desta feature, evitando
// que cada tela invente uma segunda tabela de dez planetas e cinco aspectos.
export function rotuloDoPlaneta(planeta, lang = 'pt') {
  const canonico = nomeCanonicoDePlaneta(planeta);
  if (!canonico) return null;
  return packDoIdioma(String(lang || 'pt').split('-')[0]).planetas[canonico] || null;
}

export function rotuloDoAspecto(aspecto, lang = 'pt') {
  const canonico = nomeCanonicoDeAspecto(aspecto);
  if (!canonico) return null;
  return packDoIdioma(String(lang || 'pt').split('-')[0]).aspectos[canonico] || null;
}

// ---------------------------------------------------------------------------
// 4. O MOTOR PURO — sem efeméride, sem idioma, sem texto
// ---------------------------------------------------------------------------
/**
 * A FASE DE UM ASPECTO, a partir de três longitudes e um ângulo.
 *
 * `longitudeHoje`   — longitude eclíptica do planeta em trânsito hoje (0–360)
 * `longitudeAmanha` — a mesma, 24 horas depois. É ela que dá a direção — e é
 *                     ela que acerta o planeta RETRÓGRADO, que inverte tudo.
 * `longitudeNatal`  — o ponto do mapa de nascimento. Não se move.
 * `angulo`          — 0, 60, 90, 120 ou 180.
 *
 * Devolve `{ fase, residuoGraus, residuoAssinado, movimentoDiario, retrogrado,
 * diasParaExato, dentroDoHorizonte, exatoNoDia, lado }` — ou null se alguma
 * entrada não for número finito.
 *
 * `fase` é 'aplicativo' (o ângulo ainda vai fechar), 'separativo' (já fechou) ou
 * 'estacionario' (o planeta praticamente não andou em 24 horas — e aí não
 * existe chegando nem indo embora).
 *
 * `diasParaExato` é POSITIVO no futuro e NEGATIVO no passado, e vem null quando
 * a estimativa passa de HORIZONTE_DO_PRAZO_DIAS ou o planeta está parado: o app
 * não põe data onde a reta não se sustenta. `residuoGraus` continua lá nos dois
 * casos, porque grau é medida e não projeção.
 */
export function faseDoAspecto(longitudeHoje, longitudeAmanha, longitudeNatal, angulo) {
  const nums = [longitudeHoje, longitudeAmanha, longitudeNatal, angulo];
  if (nums.some((n) => typeof n !== 'number' || !Number.isFinite(n))) return null;
  if (!ORDEM_DOS_ASPECTOS.some((a) => ANGULO_DO_ASPECTO[a] === angulo)) return null;

  const d = norm180(longitudeHoje - longitudeNatal);
  // Conjunção e oposição só têm um lado; sextil, quadratura e trígono têm dois,
  // e o lado é o que o planeta ocupa hoje. Os orbes de personalSky (no máximo
  // 6°) contra o menor ângulo com dois lados (60°) garantem que não há
  // ambiguidade: 6 < 30.
  const lado = angulo === 0 || angulo === 180 ? 1 : d >= 0 ? 1 : -1;
  const residuoAssinado = norm180(d - lado * angulo);
  const movimentoDiario = norm180(longitudeAmanha - longitudeHoje);
  const retrogrado = movimentoDiario < 0;

  if (Math.abs(movimentoDiario) < LIMIAR_PARADO_GRAUS_POR_DIA) {
    return {
      fase: 'estacionario',
      residuoGraus: Math.abs(residuoAssinado),
      residuoAssinado,
      movimentoDiario,
      retrogrado,
      diasParaExato: null,
      dentroDoHorizonte: false,
      exatoNoDia: false,
      lado,
    };
  }

  const dias = -residuoAssinado / movimentoDiario;
  const dentroDoHorizonte = Math.abs(dias) <= HORIZONTE_DO_PRAZO_DIAS;

  return {
    fase: dias > 0 ? 'aplicativo' : 'separativo',
    residuoGraus: Math.abs(residuoAssinado),
    residuoAssinado,
    movimentoDiario,
    retrogrado,
    diasParaExato: dentroDoHorizonte ? dias : null,
    dentroDoHorizonte,
    exatoNoDia: Math.abs(dias) < JANELA_DO_DIA_EXATO_DIAS,
    lado,
  };
}

// ---------------------------------------------------------------------------
// 5. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/seita.js e lib/synastry.js: declarar o
// buraco impede que a próxima pessoa a editar o preencha com a versão que
// circula por aí. É registro de pesquisa, não é renderizado em tela — por isso
// fica no motor e em PT.
export const NAO_ACHADO = [
  {
    id: 'hierarquiaEntreOsDois',
    texto:
      'Texto antigo dizendo que o aspecto aplicativo é MAIS FORTE que o separativo. A astrologia moderna repete isso o tempo todo ("o aplicativo age, o separativo já agiu"), e é a frase mais fácil de acrescentar aqui. Ptolomeu I.24 define os dois e não os ordena; Valente IX.3 fala de um Júpiter específico, não de uma regra de força. Esta base não achou a linha antiga que autorize a hierarquia — por isso o app descreve os dois estados e não diz qual pesa mais.',
  },
  {
    id: 'orbeParaAplicacao',
    texto:
      'O número que Ptolomeu não dá. Em I.24 a condição é "when the interval between them is not great" — e "not great" não é grau. Os orbes desta tela vêm de lib/personalSky.js e são convenção moderna do app: Ptolomeu não dá orbe nenhum (I.13, aspectos entre signos inteiros), e na tradição posterior o orbe pertence ao PLANETA, não ao aspecto (Lilly, Christian Astrology I, p. 107, 1647). Enquanto isso não for lido em fonte antiga, o texto diz de quem é a convenção.',
  },
  {
    id: 'retrogradoEmPtolomeu',
    texto:
      'Passagem no Tetrabiblos que reconcilie a definição posicional de I.24 ("os que precedem", "os que seguem") com a marcha retrógrada. Ptolomeu fala de estação e retrogradação em I.8, mas como QUALIDADE TÉRMICA do ciclo, sem ligar o assunto a aplicação e separação. A resposta que este app usa vem de Valente IX.3. Não foi achada, nesta base, a ponte dentro do próprio Ptolomeu.',
  },
  {
    id: 'prazoEmDiasNaFonte',
    texto:
      'Qualquer fonte antiga que converta orbe em tempo — "faltam três dias para o exato". Não existe nesta base. A conversão de graus em dias é aritmética do app sobre efeméride moderna, e é exatamente por isso que existe um HORIZONTE_DO_PRAZO_DIAS declarado em vez de um número solto.',
  },
  {
    id: 'refinoPorBissecao',
    texto:
      'Não é lacuna de fonte, é limite declarado de engenharia. O prazo sai de uma reta traçada com 24 horas de movimento. Uma bisseção na efeméride daria o instante exato para qualquer horizonte, ao custo de várias chamadas de planetPositions por aspecto. Esta versão não faz isso de propósito (a correção pedida era uma segunda chamada, não um solver); o preço é o horizonte de três dias, e ele está medido e dito na cara do usuário.',
  },
];

// Os dois achados que corrigem a base. Ver o cabeçalho.
export const REGISTRO_DE_PESQUISA = [
  {
    id: 'ptolomeuI24Existe',
    texto:
      'docs/tradicao/99-o-que-falta.md registra como buraco em aberto: "Se a distinção aplicativo/separativo existe em Ptolomeu... não procurada sistematicamente no Tetrabiblos". Existe. Tetrabiblos I.24, "Of Applications and Separations and the Other Powers", trad. Robbins 1940 — e o verbatim está nos três packs. O buraco pode ser fechado no doc.',
  },
  {
    id: 'valenteRetrogradoEhIV14',
    texto:
      'A frase da retrogradação ("they delay expectations, actions, profits, and enterprises") aparece nos docs atribuída à Anthologiae V. No texto de Riley ela está no capítulo 14, "The Phases and Transits of the Stars", sob o cabeçalho de página "Book IV", marcador /183K/. Este módulo cita IV.14.',
  },
];

// A bibliografia em PT, para quem importar do motor. A versão localizada de
// cada idioma vive no pack e é a que sai no campo `fonte` da leitura.
export const FONTES = PACK_PT.fontes;

// ---------------------------------------------------------------------------
// 6. A LEITURA INDISPONÍVEL — o que falta, e onde resolver
// ---------------------------------------------------------------------------
// Mesma forma da leitura completa (a tela não precisa de dois renderizadores).
function indisponivel(pack, motivo, aspecto) {
  const f = pack.falta[motivo] || pack.falta.data;
  const t = aspecto ? nomeCanonicoDePlaneta(aspecto.transitPlanet) : null;
  const n = aspecto ? nomeCanonicoDePlaneta(aspecto.natalPlanet) : null;
  const a = aspecto ? nomeCanonicoDeAspecto(aspecto.aspectType) : null;
  return {
    disponivel: false,
    motivo,
    falta: [motivo],
    comoResolver: f.comoResolver,

    transito: t,
    transitoNome: t ? pack.planetasFrase[t] : null,
    transitoRotulo: t ? pack.planetas[t] : null,
    natal: n,
    natalNome: n ? pack.planetasFrase[n] : null,
    natalRotulo: n ? pack.planetas[n] : null,
    aspecto: a,
    aspectoNome: a ? pack.aspectos[a] : null,
    angulo: a ? ANGULO_DO_ASPECTO[a] : null,

    fase: null,
    faseNome: null,
    faseTermo: null,
    residuoGraus: null,
    movimentoDiario: null,
    retrogrado: null,
    diasParaExato: null,
    dentroDoHorizonte: false,
    exatoNoDia: false,

    chamada: null,
    leitura: f.texto,
    prazo: null,
    linhaCurta: null,
    notaMarcha: null,
    notaHorizonte: null,
    notaOrbe: pack.notaOrbe,
    notaLeituraDoApp: pack.notaLeituraDoApp,
    notaDataDeEvento: pack.notaDataDeEvento,
    verbatins: [pack.verbatim.ptolomeuI24, pack.verbatim.valenteJupiterRetrogrado, pack.verbatim.valenteEstacoes],
    fonte: pack.fontes,
  };
}

// ---------------------------------------------------------------------------
// 7. A LEITURA COMPLETA
// ---------------------------------------------------------------------------
function montar(pack, ctx) {
  return {
    disponivel: true,
    motivo: null,
    falta: [],
    comoResolver: null,

    // ------------------------------------------------------------------
    // Quem é quem
    // ------------------------------------------------------------------
    transito: ctx.transito,
    transitoNome: ctx.transitoNome,
    transitoRotulo: ctx.transitoRotulo,
    natal: ctx.natal,
    natalNome: ctx.natalNome,
    natalRotulo: ctx.natalRotulo,
    aspecto: ctx.aspecto,
    aspectoNome: ctx.aspectoNome,
    angulo: ctx.angulo,

    // ------------------------------------------------------------------
    // A conta, exposta — quem quiser conferir, confere
    // ------------------------------------------------------------------
    fase: ctx.fase,
    faseNome: pack.faseNome[ctx.fase],
    faseTermo: pack.faseTermo[ctx.fase],
    residuoGraus: ctx.residuoGraus,
    residuoAssinado: ctx.residuoAssinado,
    movimentoDiario: ctx.movimentoDiario,
    retrogrado: ctx.retrogrado,
    diasParaExato: ctx.diasParaExato,
    dentroDoHorizonte: ctx.dentroDoHorizonte,
    exatoNoDia: ctx.exatoNoDia,
    longitudes: { hoje: ctx.longitudeHoje, amanha: ctx.longitudeAmanha, natal: ctx.longitudeNatal },
    dias: { hoje: ctx.diaHoje, amanha: ctx.diaAmanha },

    // ------------------------------------------------------------------
    // BLOCO 1 — o que a tela mostra PRIMEIRO
    // ------------------------------------------------------------------
    chamada: pack.chamada[ctx.fase](ctx),
    leitura: pack.leitura[ctx.fase](ctx),
    prazo: pack.prazo(ctx),
    // A linha única, para pendurar embaixo do card que o Céu de Hoje já mostra.
    linhaCurta: pack.linhaCurta[ctx.fase](ctx),

    // ------------------------------------------------------------------
    // As ressalvas que andam junto com TODA leitura
    // ------------------------------------------------------------------
    notaMarcha: ctx.retrogrado ? pack.notaMarcha.retrogrado(ctx) : pack.notaMarcha.direto(ctx),
    notaHorizonte: ctx.dentroDoHorizonte ? null : pack.notaHorizonte(ctx),
    notaOrbe: pack.notaOrbe,
    notaLeituraDoApp: pack.notaLeituraDoApp,
    notaDataDeEvento: pack.notaDataDeEvento,
    verbatins: [pack.verbatim.ptolomeuI24, pack.verbatim.valenteJupiterRetrogrado, pack.verbatim.valenteEstacoes],
    fonte: pack.fontes,
  };
}

// ---------------------------------------------------------------------------
// 8. AS PORTAS DE ENTRADA
// ---------------------------------------------------------------------------
/**
 * A FASE DE UM TRÂNSITO, com texto pronto.
 *
 * `aspecto` — um item do array de personalSkyToday(), ou qualquer objeto com
 *             `{ transitPlanet, natalPlanet, aspectType }`. Os nomes são os de
 *             lib/signs.js (PT, com ou sem acento).
 * `birth`   — `{ date, time, city }` de lib/birthData.js → getAnyBirthData().
 *             `time` e `city` PODEM SER NULL: os planetas não se movem o
 *             bastante em um dia para isso importar — exceto a LUA natal, e
 *             esse caso o app recusa em vez de chutar (ver o cabeçalho).
 * `lang`    — 'pt' (default), 'es' ou 'en'.
 * `opts`    — `{ hoje }` fixa o dia (teste); `{ posicoes }` reaproveita as três
 *             listas de longitudes quando várias fases são calculadas de uma vez.
 *
 * Devolve sempre um objeto com a mesma forma. Sem dado suficiente,
 * `disponivel: false`, `falta` e `comoResolver` — nunca um palpite.
 */
export function faseDoTransito(aspecto, birth, lang = 'pt', opts = {}) {
  const pack = packDoIdioma(lang);

  if (!aspecto || typeof aspecto !== 'object') return indisponivel(pack, 'aspecto', null);
  const transito = nomeCanonicoDePlaneta(aspecto.transitPlanet);
  const natal = nomeCanonicoDePlaneta(aspecto.natalPlanet);
  const nomeAspecto = nomeCanonicoDeAspecto(aspecto.aspectType);
  if (!transito || !natal || !nomeAspecto) return indisponivel(pack, 'aspecto', aspecto);

  if (!birth || !dataValida(birth.date)) return indisponivel(pack, 'data', aspecto);

  // A recusa medida: aspecto ao natal da LUA sem hora de nascimento.
  if (natal === 'Lua' && !birth.time) return indisponivel(pack, 'horaParaLuaNatal', aspecto);

  const posicoes = opts.posicoes || posicoesDoDia(birth, opts.hoje);
  if (!posicoes) return indisponivel(pack, 'efemeride', aspecto);

  const pNatal = posicoes.natal.find((p) => p.planet === natal);
  const pHoje = posicoes.hoje.find((p) => p.planet === transito);
  const pAmanha = posicoes.amanha.find((p) => p.planet === transito);
  if (!pNatal || !pHoje || !pAmanha) return indisponivel(pack, 'efemeride', aspecto);

  const angulo = ANGULO_DO_ASPECTO[nomeAspecto];
  const f = faseDoAspecto(pHoje.longitude, pAmanha.longitude, pNatal.longitude, angulo);
  if (!f) return indisponivel(pack, 'efemeride', aspecto);

  const ctx = {
    ...f,
    transito,
    transitoNome: pack.planetasFrase[transito],
    transitoRotulo: pack.planetas[transito],
    natal,
    natalNome: pack.planetasFrase[natal],
    natalRotulo: pack.planetas[natal],
    aspecto: nomeAspecto,
    aspectoNome: pack.aspectos[nomeAspecto],
    angulo,
    longitudeHoje: pHoje.longitude,
    longitudeAmanha: pAmanha.longitude,
    longitudeNatal: pNatal.longitude,
    diaHoje: posicoes.diaHoje,
    diaAmanha: posicoes.diaAmanha,
    horizonte: HORIZONTE_DO_PRAZO_DIAS,
  };

  return montar(pack, ctx);
}

/**
 * AS TRÊS LISTAS DE LONGITUDES de um dia — natal, hoje e amanhã.
 *
 * Exportada porque `fasesDoCeuPessoal` a calcula UMA vez e passa adiante: sem
 * isso, três aspectos custariam nove chamadas de planetPositions em vez de três.
 * Devolve null quando falta data ou efeméride — nunca um céu inventado.
 *
 * O natal é levantado com EXATAMENTE os mesmos argumentos de
 * lib/personalSky.js (`time || undefined`, `city || undefined`), para que as
 * duas telas nunca discordem sobre onde está o mapa da pessoa.
 */
export function posicoesDoDia(birth, hoje) {
  if (!birth || !dataValida(birth.date)) return null;
  const diaHoje = dataValida(hoje) ? hoje : hojeStr();
  const diaAmanha = diaSeguinte(diaHoje);
  if (!diaAmanha) return null;

  const natal = planetPositions(birth.date, birth.time || undefined, birth.city || undefined);
  const posHoje = planetPositions(diaHoje);
  const posAmanha = planetPositions(diaAmanha);
  if (!natal || !posHoje || !posAmanha) return null;

  return { natal, hoje: posHoje, amanha: posAmanha, diaHoje, diaAmanha };
}

/**
 * A LISTA INTEIRA DO CÉU DE HOJE, enriquecida.
 *
 * `aspectos` — o array que personalSkyToday(birth, max) devolveu.
 * `birth`    — o mesmo `{ date, time, city }` passado a ele.
 *
 * Devolve um array do MESMO tamanho e na MESMA ordem, cada item sendo a leitura
 * de faseDoTransito para o aspecto correspondente — para a tela poder casar um
 * a um com os cards que já desenha. `aspectos` nulo devolve null.
 */
export function fasesDoCeuPessoal(aspectos, birth, lang = 'pt', opts = {}) {
  if (!Array.isArray(aspectos)) return null;
  const posicoes = opts.posicoes || posicoesDoDia(birth, opts.hoje);
  return aspectos.map((a) => faseDoTransito(a, birth, lang, { ...opts, posicoes }));
}

/**
 * A DATAÇÃO DAS FONTES desta feature, já na forma de cada língua.
 *
 * Passa por traduzirAutor/traduzirQuando de lib/traducoes/datacao.js — a OBRA
 * nunca traduz (Tetrabiblos continua Tetrabiblos), o AUTOR ganha a forma
 * consagrada (Ptolomeu / Ptolomeo / Ptolemy) e a DATAÇÃO ganha a forma da
 * língua (séc. II / siglo II / 2nd c.).
 */
export function datacaoDasFontes(lang = 'pt') {
  return [
    { obra: 'Tetrabiblos I.24', autor: traduzirAutor('Ptolomeu', lang), quando: traduzirQuando('séc. II', lang) },
    { obra: 'Anthologiae IX.3', autor: traduzirAutor('Vétio Valente', lang), quando: traduzirQuando('séc. II', lang) },
    { obra: 'Anthologiae IV.14', autor: traduzirAutor('Vétio Valente', lang), quando: traduzirQuando('séc. II', lang) },
    { obra: 'Tetrabiblos I.13', autor: traduzirAutor('Ptolomeu', lang), quando: traduzirQuando('séc. II', lang) },
    { obra: 'Christian Astrology I, p. 107', autor: 'William Lilly', quando: traduzirQuando('1647', lang) },
  ];
}
