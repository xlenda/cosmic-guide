// lib/luaForaDeCurso.js
// LUA FORA DE CURSO (κενοδρομία, kenodromia) — as DUAS definições, calculadas,
// e a divergência entre elas mostrada em vez de escondida.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE
// ===========================================================================
// O mercado vende isto como veredito seco ("Dia Livre — sem Lua Fora de Curso
// hoje"). O problema é que NÃO EXISTE "a" Lua fora de curso: existem pelo menos
// duas contas, de séculos diferentes, que produzem PERÍODOS DIFERENTES para o
// mesmo dia. Quem mostra só uma está escolhendo em silêncio — e a tese deste
// app (docs/tradicao/00-tese.md, proposição 2) proíbe escolher em silêncio:
// "quando duas fontes discordam, mostrar as duas com o nome de cada uma".
//
// As duas contas, direto de docs/tradicao/04-lua-fases-e-calendario.md §3.4:
//
//   [FP] HELENÍSTICA — Antíoco de Atenas (séc. II d.C.) dá a PRIMEIRA definição
//        conhecida; Porfírio de Tiro (séc. III, Introdução ao Tetrabiblos) a
//        formula pelos 30° SEGUINTES do caminho da Lua, SEM QUALQUER REFERÊNCIA
//        A FRONTEIRA DE SIGNO. Gramaglia (Astrología Hermética, p. 188) registra
//        ainda uma variante em Antíoco medida em tempo — "um dia e uma noite",
//        ~13° de arco. Essa variante NÃO está implementada aqui: fica declarada
//        em NAO_ACHADO/fonte, não virou terceira conta.
//
//   [TP] POR FRONTEIRA DE SIGNO — William Lilly, Christian Astrology, Londres,
//        1647, p. 112: "A Planet is void of course, when he is separated from a
//        Planet, nor doth forthwith, during his being in that Signe, apply to
//        any other." É AQUI que o signo entra. A mudança de critério acontece em
//        algum ponto entre Fírmico (séc. IV) e Mashallah / Abu Ma'shar (séc.
//        VIII–IX) — [NF] a base NÃO achou o texto que documenta quem a fez.
//
// E a camada que o usuário realmente conhece, que não é nenhuma das duas:
//   [TP] Al H. Morrison, a partir de ~1970, publica tabelas de Void-of-Course
//        Moon e transforma um critério de HORÁRIA (em Lilly, julgamento sobre
//        uma PERGUNTA: "nada virá deste assunto") em conselho de agenda diária.
//        O astrólogo contemporâneo Anthony Louis chama isso de mal-entendido de
//        Lilly (2013, 2021).
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string dos packs
// ===========================================================================
// (mesma disciplina de lib/zodiacBody.js, lib/grounding.js e lib/synastry.js, e
// vale nos TRÊS idiomas, sem exceção)
//
// 1. NENHUMA ORDEM À PESSOA. Nada de "não assine contrato hoje", "evite marcar
//    reunião", "aproveite para descansar". Isso é veredito, e veredito é
//    justamente o produto do concorrente. O app DESCREVE o estado do céu
//    (calculado) e DESCREVE o que cada autor escreveu (com locus). A decisão
//    fica com quem lê, sempre.
// 2. O CONSELHO DE AGENDA NÃO É ANTIGO, E O TEXTO DIZ ISSO. Escrever "os antigos
//    evitavam começar coisas com a Lua fora de curso" é falso (doc 04 §5). Em
//    Lilly é horária; a agenda é de Morrison, ~1970.
// 3. TODA AFIRMAÇÃO HISTÓRICA CARREGA O LOCUS. Obra, autor, século. O verbatim
//    inglês de Lilly e de Morrison fica SEM TRADUÇÃO nos três packs — traduzir
//    citação é falsificá-la —, com paráfrase ao lado, rotulada como nossa.
// 4. NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita, nem por metáfora, em nenhum
//    idioma. É por isso que a citação de Morrison entra TRUNCADA: a lista dele
//    ("prayer, yoga, play, psychotherapy, or passive experience, sleep or
//    meditation") está inteira no doc 04 §3.4 e não precisa estar na tela de um
//    app; o que a tela precisa é da moldura ("subjective, spiritual non-material
//    concerns"), que é o que prova a virada de horária para agenda.
// 5. NUNCA FABRICAR CÉU. Sem efeméride, sem data válida ou sem convergência
//    numérica, a função devolve `disponivel: false` com motivo — nunca um
//    horário estimado.
// 6. O QUE A PESQUISA NÃO ACHOU FICA DECLARADO. Ver NAO_ACHADO.
//
// ===========================================================================
// OS TRÊS IDIOMAS
// ===========================================================================
// Toda prosa vive em lib/traducoes/luaForaDeCurso.{pt,es,en}.js, com a MESMA
// forma: mesmas chaves, mesmas funções com a mesma assinatura. O motor recebe
// `lang` com default 'pt'. O que NUNCA muda entre packs: o verbatim inglês, os
// loci (Christian Astrology, 1647, p. 112 continua sendo isso nos três) e os
// números. test/luaForaDeCurso.test.js segura o PT byte a byte e a paridade.
//
// ===========================================================================
// A CONTA — e por que ela não reusa `aspects()` de lib/signs.js
// ===========================================================================
// `aspects()` responde "que aspectos existem AGORA, dentro do orbe" e trabalha
// com data em string. Fora de curso não pergunta isso: pergunta QUANDO o ângulo
// fica EXATO (a fonte diz "aperfeiçoa" — perfect, aplicar até fechar), o que é
// uma busca de raiz no tempo. Além disso `aspects()` inclui Urano, Netuno e
// Plutão, que nenhuma das definições citadas aqui conhecia (Urano é de 1781).
// Por isso este arquivo fala direto com o astronomy-engine, no MESMO referencial
// que lib/signs.js usa (eclíptica verdadeira da data): EclipticGeoMoon para a
// Lua, SunPosition para o Sol, Ecliptic(GeoVector(..., true)) para os outros —
// se um dia divergirem, o app teria dois céus, que é o pior bug possível aqui.
//
// A busca de raiz é Newton com derivada numérica, e ela é segura por um motivo
// medido: a elongação Lua−planeta é ESTRITAMENTE CRESCENTE. 📐 Varrendo 2026 de
// 6 em 6 horas com este mesmo motor: a Lua anda de 11,79 a 15,32°/dia e a
// velocidade relativa mínima contra o planeta mais rápido (Mercúrio) é
// 9,85°/dia — nunca zero, nunca negativa. Ou seja: entre dois ângulos exatos não
// há vaivém, e o alvo de menor distância angular é sempre o primeiro a ser
// alcançado. É isso que permite achar o próximo encontro sem varrer o tempo.
//
// ===========================================================================
// O QUE FOI MEDIDO ANTES DE FECHAR ESTE ARQUIVO 📐
// ===========================================================================
// 1. CONTRA VARREDURA INDEPENDENTE. Uma varredura burra de 2 em 2 minutos entre
//    25/07 e 05/08/2026 achou 18 ângulos exatos; o motor reproduz os 18 dentro
//    de 1,5 min (que é a resolução da varredura). Em 429 instantes amostrados,
//    nas DUAS definições, o estado fora-de-curso do motor bateu com o da
//    varredura em 858 de 858 casos.
// 2. A IMPLICAÇÃO ARITMÉTICA SE CONFIRMA NA MEDIDA. Nenhum dos 429 instantes
//    teve "Porfírio sim / fronteira de signo não" — como tem que ser, já que o
//    arco que falta até a troca de signo nunca passa de 30°.
// 3. O TAMANHO DA DIVERGÊNCIA. Ano de 2026 inteiro: 159 janelas pela fronteira
//    de signo (23,63% do ano, média 13,02 h, maior 57,21 h) contra 5 janelas por
//    Porfírio (0,65% do ano). Em 22,98% do ano uma diz vazio e a outra não. É
//    este número que o texto `oQuantoIssoMuda` dos packs carrega, e o teste o
//    refaz a cada build.
// 4. CONTRA O PRÓPRIO astronomy-engine. Lua Cheia é a oposição exata Sol–Lua, e
//    Lua Nova é a conjunção: SearchMoonPhase(180) em 03/01/2026 dá 10:03:26 UTC e
//    esta busca dá 10:02:49 — 37 s de diferença, SEMPRE no mesmo sentido. A
//    causa foi medida e não é erro numérico: SearchMoonPhase usa PairLongitude,
//    que chama GeoVector com aberração DESLIGADA, e este arquivo usa SunPosition
//    (aberração ligada), que é o que lib/signs.js usa no resto do app. A
//    aberração do Sol vale 21,2" = 0,0059°, e a 12,2°/dia de movimento relativo
//    isso dá exatamente ~41 s. Preferimos ficar de acordo com o céu do PRÓPRIO
//    app a ficar de acordo com um auxiliar de outro módulo — duas definições de
//    Sol dentro do mesmo produto seria o pior dos dois mundos.
import { SIGNS } from './signs';
import { PACK as PACK_PT } from './traducoes/luaForaDeCurso.pt.js';
import { PACK as PACK_ES } from './traducoes/luaForaDeCurso.es.js';
import { PACK as PACK_EN } from './traducoes/luaForaDeCurso.en.js';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Mesmo fallback de lib/i18n.js e lib/synastry.js: idioma desconhecido cai no
// PT, e chamada sem lang continua devolvendo exatamente o PT de sempre.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// 1. OS CORPOS E AS FIGURAS
// ---------------------------------------------------------------------------
// OS SETE, menos a própria Lua: sobram seis corpos com quem ela pode fechar
// ângulo. Urano, Netuno e Plutão (os três modernos) ficam de fora porque nenhuma
// das definições em jogo os conhecia. Isso é ESCOLHA DECLARADA, não esquecimento
// — e ela tem consequência aritmética que o texto assume: mais corpos só podem
// ACRESCENTAR encontros, e portanto só podem ENCURTAR os períodos.
// As chaves são os nomes em PT de lib/signs.js — dado, não texto de tela.
export const CLASSICOS = ['Sol', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];

const CORPO_ASTRONOMY = {
  'Mercúrio': 'Mercury',
  'Vênus': 'Venus',
  'Marte': 'Mars',
  'Júpiter': 'Jupiter',
  'Saturno': 'Saturn',
};

// Os cinco ângulos maiores, exatamente como doc 04 §3.4 os lista para esta
// definição: conjunção, sextil, quadratura, trígono e oposição.
//
// A RESSALVA QUE O APP NÃO ESCONDE: Ptolomeu (Tetrabiblos I.13) enumera QUATRO
// aspectos — oposição, trígono, quadratura, sextil — e a conjunção NÃO está
// entre eles (é o mesmo ponto que lib/synastry.js faz). As definições de fora de
// curso contam a conjunção assim mesmo, porque o critério delas é o ENCONTRO que
// se aperfeiçoa, e conjunção é encontro. O texto diz isso em voz alta
// (pack.notaConjuncao) em vez de deixar o leitor achar que o app se contradiz.
export const ASPECTOS_MAIORES = [
  { id: 'conjuncao', angulo: 0 },
  { id: 'sextil', angulo: 60 },
  { id: 'quadratura', angulo: 90 },
  { id: 'trigono', angulo: 120 },
  { id: 'oposicao', angulo: 180 },
];

// Os OITO valores de elongação (0–360) que perfazem as cinco figuras: sextil,
// quadratura e trígono acontecem dos dois lados.
const ALVOS = [
  { elong: 0, id: 'conjuncao', angulo: 0 },
  { elong: 60, id: 'sextil', angulo: 60 },
  { elong: 90, id: 'quadratura', angulo: 90 },
  { elong: 120, id: 'trigono', angulo: 120 },
  { elong: 180, id: 'oposicao', angulo: 180 },
  { elong: 240, id: 'trigono', angulo: 120 },
  { elong: 270, id: 'quadratura', angulo: 90 },
  { elong: 300, id: 'sextil', angulo: 60 },
];

// As duas definições, como IDs de lógica. O texto de cada uma vive nos packs.
export const DEFINICOES = ['moderna', 'porfirio'];

const OUTRA = { moderna: 'porfirio', porfirio: 'moderna' };

// ---------------------------------------------------------------------------
// 2. O MOTOR ASTRONÔMICO
// ---------------------------------------------------------------------------
let _Astronomy = null;
function getAstronomy() {
  if (_Astronomy) return _Astronomy;
  try {
    _Astronomy = require('astronomy-engine');
  } catch {
    _Astronomy = false;
  }
  return _Astronomy;
}

const MS_DIA = 86400000;

function norm360(x) {
  return ((x % 360) + 360) % 360;
}

// (-180, 180]. Usado só para ERRO de busca, que é sempre pequeno.
function norm180(x) {
  const y = norm360(x);
  return y > 180 ? y - 360 : y;
}

function lonLua(A, ms) {
  return norm360(A.EclipticGeoMoon(new Date(ms)).lon);
}

function lonCorpo(A, id, ms) {
  const d = new Date(ms);
  if (id === 'Sol') return norm360(A.SunPosition(d).elon);
  return norm360(A.Ecliptic(A.GeoVector(A.Body[CORPO_ASTRONOMY[id]], d, true)).elon);
}

// Elongação Lua − corpo, 0–360. É a grandeza monotônica de que toda a busca
// depende (ver o cabeçalho).
function elong(A, id, ms) {
  return norm360(lonLua(A, ms) - lonCorpo(A, id, ms));
}

const H_DIAS = 0.005; // 7,2 min — passo da derivada numérica
const TOL_GRAUS = 1e-7; // ~0,6 milissegundo de tempo, com a Lua a 13°/dia
const SALTO_MAXIMO_MS = 2 * MS_DIA; // guarda: refinamento não pode "fugir" pra outra raiz

function velElong(A, id, ms) {
  const e1 = elong(A, id, ms - H_DIAS * MS_DIA);
  const e2 = elong(A, id, ms + H_DIAS * MS_DIA);
  return norm180(e2 - e1) / (2 * H_DIAS);
}

function velLua(A, ms) {
  const l1 = lonLua(A, ms - H_DIAS * MS_DIA);
  const l2 = lonLua(A, ms + H_DIAS * MS_DIA);
  return norm180(l2 - l1) / (2 * H_DIAS);
}

// Newton com derivada numérica reancorada. Devolve o instante (ms) em que a
// elongação fica EXATAMENTE no alvo, ou null — nunca um chute.
function refinarElong(A, id, alvo, msChute) {
  let ms = msChute;
  let v = velElong(A, id, ms);
  if (!(v > 1)) return null;
  for (let i = 0; i < 40; i++) {
    const err = norm180(alvo - elong(A, id, ms));
    if (Math.abs(err) < TOL_GRAUS) break;
    ms += (err / v) * MS_DIA;
    if (Math.abs(ms - msChute) > SALTO_MAXIMO_MS) return null;
    if (i === 2 || i === 8) {
      v = velElong(A, id, ms);
      if (!(v > 1)) return null;
    }
  }
  // Arredonda para milissegundo inteiro. A tolerância de 1e-7° já vale ~0,6 ms
  // com a Lua a 13°/dia, então não se perde precisão nenhuma — e se ganha uma
  // coisa que importa: `new Date(ms)` TRUNCA fração de milissegundo, então sem
  // isto a duração calculada no número e a duração calculada nas duas Datas
  // discordariam na última casa.
  return Math.abs(norm180(alvo - elong(A, id, ms))) < 1e-6 ? Math.round(ms) : null;
}

// Idem, para a longitude da Lua sozinha (troca de signo e o ponto "faltam 30°").
function refinarLua(A, alvo, msChute) {
  let ms = msChute;
  let v = velLua(A, ms);
  if (!(v > 1)) return null;
  for (let i = 0; i < 40; i++) {
    const err = norm180(alvo - lonLua(A, ms));
    if (Math.abs(err) < TOL_GRAUS) break;
    ms += (err / v) * MS_DIA;
    if (Math.abs(ms - msChute) > SALTO_MAXIMO_MS) return null;
    if (i === 2 || i === 8) {
      v = velLua(A, ms);
      if (!(v > 1)) return null;
    }
  }
  // Milissegundo inteiro, pelo mesmo motivo de refinarElong.
  return Math.abs(norm180(alvo - lonLua(A, ms))) < 1e-6 ? Math.round(ms) : null;
}

// O próximo (direcao +1) ou o último (direcao −1) ângulo exato entre a Lua e UM
// corpo. Como a elongação é estritamente crescente, o alvo de menor distância
// angular é o primeiro alcançado — não é preciso varrer o tempo.
function exatoDoCorpo(A, id, ms0, direcao) {
  const e0 = elong(A, id, ms0);
  const v = velElong(A, id, ms0);
  if (!(v > 1)) return null;
  let melhor = null;
  for (const alvo of ALVOS) {
    const delta = direcao > 0 ? norm360(alvo.elong - e0) : norm360(e0 - alvo.elong);
    // delta ~0 é o ângulo que está exato NESTE instante: não é nem o próximo
    // nem o anterior. Quem chama já vem afastado 1 s justamente por isso.
    if (delta < 1e-6) continue;
    if (!melhor || delta < melhor.delta) melhor = { alvo, delta };
  }
  if (!melhor) return null;
  const ms = refinarElong(A, id, melhor.alvo.elong, ms0 + direcao * (melhor.delta / v) * MS_DIA);
  if (ms === null) return null;
  return { corpoId: id, aspectoId: melhor.alvo.id, angulo: melhor.alvo.angulo, ms };
}

// O encontro mais próximo entre TODOS os seis. Compara INSTANTES, não graus: as
// velocidades relativas diferem (9,8 a 15,4°/dia), então o menor arco não é
// necessariamente o primeiro no relógio.
//
// Se a busca falhar para QUALQUER um dos seis, devolve null e a feature se
// declara indisponível. Ignorar o corpo que falhou seria fabricar céu.
function exatoGeral(A, ms0, direcao) {
  let melhor = null;
  for (const id of CLASSICOS) {
    const r = exatoDoCorpo(A, id, ms0, direcao);
    if (!r) return null;
    if (!melhor) melhor = r;
    else if (direcao > 0 ? r.ms < melhor.ms : r.ms > melhor.ms) melhor = r;
  }
  return melhor;
}

function signoIdx(lon) {
  return Math.floor(norm360(lon) / 30);
}

// Instante da próxima troca de signo da Lua: quando a longitude cruza o próximo
// múltiplo de 30°. Mesma aritmética de moonSign() em lib/signs.js (floor(lon/30)
// sobre a MESMA longitude), então os dois nunca discordam de signo.
function proximoIngresso(A, ms0) {
  const lon = lonLua(A, ms0);
  const idx = signoIdx(lon);
  const bruto = (idx + 1) * 30;
  const falta = norm360(bruto - lon) || 30;
  const v = velLua(A, ms0);
  if (!(v > 1)) return null;
  const ms = refinarLua(A, norm360(bruto), ms0 + (falta / v) * MS_DIA);
  if (ms === null) return null;
  return { ms, deIdx: idx, paraIdx: (idx + 1) % 12 };
}

// ---------------------------------------------------------------------------
// 3. AS DUAS DEFINIÇÕES, COMO GEOMETRIA
// ---------------------------------------------------------------------------
// Uma janela de vazio vive SEMPRE entre dois encontros exatos consecutivos, `a`
// e `b`. O que muda entre as definições é só onde ela TERMINA:
//
//   por fronteira de signo → termina na ÚLTIMA troca de signo antes de `b`.
//     Se não houver troca nenhuma entre `a` e `b`, não há janela: a Lua fecha o
//     próximo ângulo sem sair do signo. (O "última" em vez de "primeira" cobre o
//     caso raro de a Lua atravessar dois signos sem encontrar ninguém — aí a
//     janela continua através da primeira troca, que é o que Lilly descreve:
//     enquanto estiver naquele signo, não aplica a nenhum outro.)
//
//   Porfírio, 30° → termina quando faltam exatamente 30° de caminho da Lua para
//     `b`. Se de `a` até `b` a Lua anda 30° ou menos, não há janela nenhuma.
//
// 📐 CONSEQUÊNCIA ARITMÉTICA, e ela é conferível: o pedaço que falta até a troca
// de signo nunca passa de 30°. Logo "nenhum encontro nos próximos 30°" implica
// "nenhum encontro até trocar de signo". Todo instante que a régua grega chama
// de vazio, a de fronteira de signo também chama — e nunca o contrário.
function janelaEntre(A, a, b, defId) {
  if (!a || !b || b.ms <= a.ms) return null;

  if (defId === 'porfirio') {
    const lonA = lonLua(A, a.ms);
    const lonB = lonLua(A, b.ms);
    const viagem = norm360(lonB - lonA);
    if (viagem <= 30) return null;
    const fim = refinarLua(A, norm360(lonB - 30), b.ms - (30 / 13.176) * MS_DIA);
    if (fim === null || fim <= a.ms) return null;
    return { desde: a.ms, ate: fim, aIdx: signoIdx(lonA), paraIdx: null, anterior: a, proximo: b };
  }

  let ing = proximoIngresso(A, a.ms + 1000);
  if (!ing || ing.ms >= b.ms) return null;
  // Guarda de 4: a Lua leva ~2,28 dias por signo e nunca fica dias sem fechar
  // ângulo nenhum; o laço existe só para não depender dessa suposição.
  for (let i = 0; i < 4; i++) {
    const seg = proximoIngresso(A, ing.ms + 1000);
    if (!seg || seg.ms >= b.ms) break;
    ing = seg;
  }
  return { desde: a.ms, ate: ing.ms, aIdx: ing.deIdx, paraIdx: ing.paraIdx, anterior: a, proximo: b };
}

// ---------------------------------------------------------------------------
// 4. O CONTEXTO QUE O PACK RECEBE
// ---------------------------------------------------------------------------
// O motor prepara os FATOS; o pack escreve a prosa. Mesma divisão de trabalho de
// lib/synastry.js. Nenhum número é formatado aqui: cada idioma formata do jeito
// dele (vírgula decimal em pt/es, ponto em en).
function horas(msA, msB) {
  return (msB - msA) / 3600000;
}

function descreveEncontro(enc, pack) {
  if (!enc) return null;
  return {
    planeta: pack.planetas[enc.corpoId],
    planetaId: enc.corpoId,
    aspecto: pack.aspectos[enc.aspectoId],
    aspectoId: enc.aspectoId,
    aspectoComGlosa: pack.aspectosComGlosa[enc.aspectoId],
    // Forma flexionada («uma conjunção exata» × «um sextil exato»): em pt e es o
    // gênero muda de aspecto para aspecto, e sem isto o texto erraria a
    // concordância. Ver ASPECTOS_EXATO nos packs.
    aspectoExato: pack.aspectosExato[enc.aspectoId],
    angulo: enc.angulo,
    quando: new Date(enc.ms),
  };
}

function montarCtx(A, ms0, defId, pack, dados) {
  const { lonAgora, idx, anterior, proximo, janela, outraJanela, ingresso, futura, horizonteMs } = dados;
  const dentro = !!(janela && ms0 >= janela.desde && ms0 < janela.ate);
  const outraDentro = !!(outraJanela && ms0 >= outraJanela.desde && ms0 < outraJanela.ate);
  const lonProximo = lonLua(A, proximo.ms);
  const grausAteProximo = norm360(lonProximo - lonAgora);
  const paraIdx = janela && janela.paraIdx !== null && janela.paraIdx !== undefined
    ? janela.paraIdx
    : ingresso.paraIdx;
  return {
    definicaoId: defId,
    outraId: OUTRA[defId],
    definicao: pack.definicoes[defId].nome,
    definicaoNaFrase: pack.definicoes[defId].naFrase,
    outraDefinicao: pack.definicoes[OUTRA[defId]].nome,
    outraDefinicaoNaFrase: pack.definicoes[OUTRA[defId]].naFrase,
    foraDeCurso: dentro,
    outraForaDeCurso: outraDentro,
    divergem: dentro !== outraDentro,
    signo: pack.signos[SIGNS[idx].name],
    signoId: SIGNS[idx].name,
    grauNoSigno: norm360(lonAgora) - idx * 30,
    proximoSigno: pack.signos[SIGNS[paraIdx].name],
    planeta: pack.planetas[proximo.corpoId],
    aspecto: pack.aspectos[proximo.aspectoId],
    aspectoComGlosa: pack.aspectosComGlosa[proximo.aspectoId],
    aspectoExato: pack.aspectosExato[proximo.aspectoId],
    horasAteProximo: horas(ms0, proximo.ms),
    grausAteProximo,
    proximoNoSignoAtual: proximo.ms < ingresso.ms,
    proximoDentroDos30: grausAteProximo <= 30,
    planetaAnterior: pack.planetas[anterior.corpoId],
    aspectoAnterior: pack.aspectos[anterior.aspectoId],
    aspectoAnteriorComGlosa: pack.aspectosComGlosa[anterior.aspectoId],
    aspectoAnteriorExato: pack.aspectosExato[anterior.aspectoId],
    horasDesdeAnterior: horas(anterior.ms, ms0),
    horasAteIngresso: horas(ms0, ingresso.ms),
    horasDecorridas: dentro ? horas(janela.desde, ms0) : 0,
    horasQueFaltam: dentro ? horas(ms0, janela.ate) : 0,
    horasDeJanela: dentro ? horas(janela.desde, janela.ate) : 0,
    temJanelaFutura: !!futura,
    horasAteJanela: futura ? horas(ms0, futura.desde) : 0,
    horasDeJanelaFutura: futura ? horas(futura.desde, futura.ate) : 0,
    // Até onde a varredura foi quando não achou janela nenhuma. Dizer "nos
    // próximos 7 dias não há" é verificável; dizer "não encontrei" não é.
    diasVarridos: Math.floor(Math.max(0, (horizonteMs - ms0) / MS_DIA)),
  };
}

// ---------------------------------------------------------------------------
// 5. ENTRADA E INDISPONIBILIDADE
// ---------------------------------------------------------------------------
function instanteMs(quando) {
  if (quando instanceof Date) return Number.isNaN(quando.getTime()) ? null : quando.getTime();
  if (typeof quando === 'number') return Number.isNaN(quando) ? null : quando;
  if (typeof quando === 'string') {
    const t = new Date(quando).getTime();
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

function definicaoUsada(pack, defId) {
  const d = pack.definicoes[defId];
  return {
    id: defId,
    nome: d.nome,
    criterio: d.criterio,
    autor: d.autor,
    seculo: d.seculo,
    locus: d.locus,
    quemUsa: d.quemUsa,
    porQueEssa: d.porQueEssa,
  };
}

// Mesma política de lib/signs.js: nunca fabricar. Quando não dá para calcular, o
// app DIZ que não dá e diz por quê — não estima horário de nada.
function indisponivel(pack, defId, motivo) {
  return {
    disponivel: false,
    motivo,
    // O nome da coisa, localizado, existe nos dois caminhos: a tela consegue
    // titular a si mesma sem precisar importar pack nenhum.
    termo: pack.termo,
    foraDeCurso: null,
    desde: null,
    ate: null,
    proximoAspecto: null,
    aspectoAnterior: null,
    definicaoUsada: definicaoUsada(pack, defId),
    fonte: pack.fonte,
    instante: null,
    lua: null,
    ingresso: null,
    ambas: null,
    divergem: null,
    proximaJanela: null,
    textos: {
      indisponivel: pack.indisponivel[motivo] || pack.indisponivel.semEfemeride,
      glosa: pack.glosa,
      semDadoPessoal: pack.semDadoPessoal,
      leituraDoApp: pack.leituraDoApp,
    },
  };
}

// ---------------------------------------------------------------------------
// 6. A PORTA DE ENTRADA
// ---------------------------------------------------------------------------
// `quando`: Date, ms ou string ISO. `definicao`: 'moderna' (default — é a régua
// que o mercado usa e a que a pessoa reconhece) ou 'porfirio'. `lang`: 'pt'
// (default), 'es', 'en'.
//
// Devolve, além do contrato pedido ({ foraDeCurso, desde, ate, proximoAspecto,
// definicaoUsada, fonte }), o suficiente para a tela mostrar a DIVERGÊNCIA: as
// duas definições calculadas lado a lado em `ambas`, e os textos prontos.
export function luaForaDeCurso(quando = new Date(), definicao = 'moderna', lang = 'pt') {
  // ARGUMENTO NO SLOT ERRADO, CONSERTADO NA ENTRADA (01/08/2026).
  // A única tela que chama esta função chamava luaForaDeCurso(new Date(), lang)
  // — dois argumentos, com o idioma caindo onde vai a definição. Não estourava:
  // 'es' não está em DEFINICOES, então virava 'moderna' em silêncio, e `lang`
  // ficava no default 'pt'. Resultado: o espanhol e o inglês liam "Lua fora de
  // curso". A suíte passava porque teste nenhum chama do jeito que a tela chama.
  //
  // Os dois conjuntos são DISJUNTOS — nenhuma definição se chama 'pt', 'es' ou
  // 'en' — então dá pra desfazer a troca sem ambiguidade nenhuma. Isso não
  // substitui arrumar o chamador (já arrumado): é a rede pro dia em que a
  // próxima tela chamar errado e ninguém perceber, que foi o que aconteceu.
  if (['pt', 'es', 'en'].includes(definicao)) {
    lang = arguments.length >= 3 ? lang : definicao;
    definicao = 'moderna';
  }
  const pack = packDoIdioma(lang);
  const defId = DEFINICOES.includes(definicao) ? definicao : 'moderna';

  const ms0 = instanteMs(quando);
  if (ms0 === null) return indisponivel(pack, defId, 'dataInvalida');
  const A = getAstronomy();
  if (!A) return indisponivel(pack, defId, 'semEfemeride');

  let anterior;
  let proximo;
  let ingresso;
  let janela;
  let outraJanela;
  try {
    anterior = exatoGeral(A, ms0 - 1000, -1);
    proximo = exatoGeral(A, ms0 + 1000, 1);
    ingresso = proximoIngresso(A, ms0);
    if (!anterior || !proximo || !ingresso) return indisponivel(pack, defId, 'buscaNaoConvergiu');
    janela = janelaEntre(A, anterior, proximo, defId);
    outraJanela = janelaEntre(A, anterior, proximo, OUTRA[defId]);
  } catch {
    return indisponivel(pack, defId, 'semEfemeride');
  }

  const dentro = !!(janela && ms0 >= janela.desde && ms0 < janela.ate);
  const outraDentro = !!(outraJanela && ms0 >= outraJanela.desde && ms0 < outraJanela.ate);

  // A próxima janela só é procurada quando NÃO há uma aberta — quando há, o que
  // interessa é a que está em curso, e cada busca custa efeméride de verdade.
  // 12 encontros ≈ 7,5 dias varridos (📐 1,6 encontro por dia, medido).
  let futura = null;
  let horizonteMs = ms0;
  if (!dentro) {
    try {
      const busca = procurarProximaJanela(A, proximo, defId, 12);
      futura = busca.janela;
      horizonteMs = busca.ateMs;
    } catch {
      futura = null;
      horizonteMs = ms0;
    }
  }

  const lonAgora = lonLua(A, ms0);
  const idx = signoIdx(lonAgora);
  const c = montarCtx(A, ms0, defId, pack, {
    lonAgora, idx, anterior, proximo, janela, outraJanela, ingresso, futura, horizonteMs,
  });

  return {
    disponivel: true,
    motivo: null,
    termo: pack.termo,
    // ---- o contrato pedido -------------------------------------------------
    foraDeCurso: dentro,
    desde: dentro ? new Date(janela.desde) : null,
    ate: dentro ? new Date(janela.ate) : null,
    proximoAspecto: descreveEncontro(proximo, pack),
    definicaoUsada: definicaoUsada(pack, defId),
    fonte: pack.fonte,
    // ---- o que a tela precisa para não virar veredito -----------------------
    aspectoAnterior: descreveEncontro(anterior, pack),
    instante: new Date(ms0),
    lua: {
      longitude: lonAgora,
      signo: pack.signos[SIGNS[idx].name],
      signoId: SIGNS[idx].name,
      emoji: SIGNS[idx].emoji,
      grauNoSigno: c.grauNoSigno,
    },
    ingresso: {
      quando: new Date(ingresso.ms),
      signo: pack.signos[SIGNS[ingresso.paraIdx].name],
      signoId: SIGNS[ingresso.paraIdx].name,
    },
    // As DUAS contas, sempre. É isto que o concorrente não faz.
    ambas: {
      [defId]: { foraDeCurso: dentro, desde: dentro ? new Date(janela.desde) : null, ate: dentro ? new Date(janela.ate) : null },
      [OUTRA[defId]]: {
        foraDeCurso: outraDentro,
        desde: outraDentro ? new Date(outraJanela.desde) : null,
        ate: outraDentro ? new Date(outraJanela.ate) : null,
      },
    },
    divergem: dentro !== outraDentro,
    proximaJanela: futura ? { desde: new Date(futura.desde), ate: new Date(futura.ate) } : null,
    precisaDeDadoPessoal: false,
    textos: {
      glosa: pack.glosa,
      abertura: pack.abertura(c),
      estado: pack.estado(c),
      janela: pack.janela(c),
      proximoEncontro: pack.proximoEncontro(c),
      divergencia: pack.divergencia(c),
      recibo: pack.recibo[defId],
      aOutraRegua: pack.recibo[OUTRA[defId]],
      oQuantoIssoMuda: pack.oQuantoIssoMuda,
      comoOMercadoUsa: pack.comoOMercadoUsa,
      oQueNaoSeAchou: pack.oQueNaoSeAchou,
      osSeteEOsTres: pack.osSeteEOsTres,
      notaConjuncao: pack.notaConjuncao,
      comoFoiCalculado: pack.comoFoiCalculado,
      leituraDoApp: pack.leituraDoApp,
      semDadoPessoal: pack.semDadoPessoal,
    },
    verbatins: [pack.verbatim.lilly, pack.verbatim.morrison],
  };
}

// A primeira janela que COMEÇA a partir de um encontro dado. Anda de encontro em
// encontro e devolve TAMBÉM até onde chegou a varredura — porque "não achei" sem
// dizer até onde procurei é informação inútil, e pela régua de Porfírio o normal
// é mesmo não achar: 📐 são 5 janelas no ano de 2026 contra 159 da régua
// moderna. O texto vira "nos próximos N dias não há nenhuma", que é verdade
// verificável, em vez de "não encontrei".
function procurarProximaJanela(A, deEncontro, defId, limite) {
  let a = deEncontro;
  let ateMs = deEncontro.ms;
  for (let i = 0; i < limite; i++) {
    const b = exatoGeral(A, a.ms + 1000, 1);
    if (!b) return { janela: null, ateMs };
    ateMs = b.ms;
    const j = janelaEntre(A, a, b, defId);
    if (j) return { janela: j, ateMs };
    a = b;
  }
  return { janela: null, ateMs };
}

// ---------------------------------------------------------------------------
// 7. AS JANELAS DE UM PERÍODO — o "tem fora de curso hoje?" resolvido de uma vez
// ---------------------------------------------------------------------------
// Devolve todas as janelas que TOCAM o intervalo [de, ate] (inclusive a que já
// estava aberta antes do começo e a que ainda não terminou no fim), pela
// definição pedida. Consistência com luaForaDeCurso() é estrutural: as duas
// derivam da MESMA janelaEntre() sobre os MESMOS encontros.
export function janelasForaDeCurso(de, ate, definicao = 'moderna', lang = 'pt') {
  const pack = packDoIdioma(lang);
  const defId = DEFINICOES.includes(definicao) ? definicao : 'moderna';
  const msDe = instanteMs(de);
  const msAte = instanteMs(ate);
  if (msDe === null || msAte === null || msAte < msDe) return null;
  const A = getAstronomy();
  if (!A) return null;

  try {
    // Começa no encontro ANTERIOR ao início: sem ele, a janela que já estava
    // aberta quando o dia começou sumiria da lista.
    let a = exatoGeral(A, msDe - 1000, -1);
    if (!a) return null;
    const saida = [];
    // A margem de 4 dias fecha a última janela mesmo quando o encontro que a
    // encerra cai depois do fim do intervalo (a Lua leva ~2,28 dias por signo).
    const teto = msAte + 4 * MS_DIA;
    // 📐 Medido de 25/07 a 05/08/2026 por varredura independente: a Lua fecha
    // 1,6 ângulo exato por dia. O teto de 12/dia é folga de sete vezes — e
    // existe só para o laço ter fim. Se ele for atingido antes de o intervalo
    // acabar, a função devolve NULL: lista truncada em silêncio seria pior que
    // resposta nenhuma, porque a tela mostraria "não há janela" onde há.
    const limite = Math.ceil(((teto - msDe) / MS_DIA) * 12) + 20;
    let completou = false;
    for (let i = 0; i < limite; i++) {
      const b = exatoGeral(A, a.ms + 1000, 1);
      if (!b) return null;
      const j = janelaEntre(A, a, b, defId);
      if (j && j.ate > msDe && j.desde < msAte) {
        const idxInicio = signoIdx(lonLua(A, j.desde));
        saida.push({
          desde: new Date(j.desde),
          ate: new Date(j.ate),
          duracaoHoras: horas(j.desde, j.ate),
          signo: pack.signos[SIGNS[idxInicio].name],
          signoId: SIGNS[idxInicio].name,
          proximoSigno: j.paraIdx === null || j.paraIdx === undefined ? null : pack.signos[SIGNS[j.paraIdx].name],
          aspectoAnterior: descreveEncontro(j.anterior, pack),
          proximoAspecto: descreveEncontro(j.proximo, pack),
          resumo: pack.resumoJanela({
            definicaoId: defId,
            definicao: pack.definicoes[defId].nome,
            signo: pack.signos[SIGNS[idxInicio].name],
            proximoSigno: j.paraIdx === null || j.paraIdx === undefined ? null : pack.signos[SIGNS[j.paraIdx].name],
            duracaoHoras: horas(j.desde, j.ate),
            planeta: pack.planetas[j.anterior.corpoId],
            aspecto: pack.aspectos[j.anterior.aspectoId],
            planetaSeguinte: pack.planetas[j.proximo.corpoId],
            aspectoSeguinte: pack.aspectos[j.proximo.aspectoId],
          }),
        });
      }
      if (b.ms > teto) {
        completou = true;
        break;
      }
      a = b;
    }
    return completou ? saida : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 8. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/synastry.js e NOT_VERIFIED em
// lib/zodiacBody.js: declarar a lacuna impede que a próxima pessoa a editar a
// preencha com o que circula por aí. Registro de pesquisa — não vai para a tela
// —, por isso fica no motor e em PT.
export const NAO_ACHADO = [
  {
    id: 'quemTrocouOCriterio',
    texto:
      'O texto que documenta QUEM trocou o critério dos 30° pelo da fronteira de signo. A mudança acontece em algum ponto entre Fírmico Materno (séc. IV) e Mashallah / Abu Ma\'shar (séc. VIII–IX), na tradição árabe, mas não localizamos a passagem que a registra. Doc 04 §3.4.',
  },
  {
    id: 'antigosEAgenda',
    texto:
      'Qualquer texto antigo mandando não começar coisas com a Lua fora de curso. Não existe na base: em Lilly (1647) o critério julga uma PERGUNTA de astrologia horária ("nada virá deste assunto"), e a regra de agenda cotidiana é de Al H. Morrison, a partir de ~1970. Doc 04 §5.',
  },
  {
    id: 'lillyVersusMorrison',
    texto:
      'O que separa exatamente a conta de Lilly da conta de Morrison. Doc 04 §3.4 distingue TRÊS definições (helenística por 30°, Lilly por signo, Morrison por signo com aspectos ptolemaicos) e Anthony Louis sustenta que Morrison leu Lilly errado — mas a base não fecha a diferença operacional entre as duas. Este app implementa duas contas: os 30° e a fronteira de signo com os cinco ângulos maiores. A terceira fica declarada, não simulada.',
  },
  {
    id: 'morrisonEOsTresModernos',
    texto:
      'Se as tabelas de Morrison (a partir de ~1970) contavam aspectos com Urano, Netuno e Plutão. A base não diz. Este app usa só os sete corpos antigos — que é o que Antíoco, Porfírio e Lilly tinham — e declara a escolha na tela.',
  },
  {
    id: 'variante13Graus',
    texto:
      'A passagem verbatim da variante de Antíoco medida em tempo ("um dia e uma noite", ~13° de arco). Ela chega por Gramaglia (Astrología Hermética, p. 188), que é fonte secundária; o original não foi conferido. Por isso a variante é citada como registro e NÃO virou uma terceira conta neste arquivo.',
  },
];

export const FONTES = PACK_PT.fonte;
