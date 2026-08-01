// lib/seita.js
// SEITA (hairesis) — o mapa é DIURNO ou NOTURNO, e isso muda a leitura dos
// sete planetas de uma vez.
//
// ===========================================================================
// O QUE ESTA FEATURE É, EM UMA FRASE
// ===========================================================================
// O Sol estava ACIMA ou ABAIXO do horizonte no instante do nascimento. É um
// booleano — e é, na fonte antiga, o principal modulador de tudo o mais: um
// Saturno de mapa diurno e um Saturno de mapa noturno não são a mesma coisa
// para Ptolomeu nem para Valente.
//
// Fonte PRIMÁRIA e DUPLA, as duas do séc. II:
//   · Ptolomeu, Tetrabiblos I.7 — a tabela: Sol e Júpiter diurnos, Lua e Vênus
//     noturnos, Mercúrio "common as before, diurnal when it is a morning star
//     and nocturnal as an evening star" (trad. Robbins, 1940).
//   · Vétio Valente, Anthologiae I.1 (trad. Riley) — a mesma grade planeta a
//     planeta, MAIS a linha que o resto do mercado esqueceu: "even the malefic
//     stars, when they are operative in appropriate places in their own sect,
//     are bestowers of good and indicative of the greatest positions and
//     success".
//
// Referência interna: docs/tradicao/11-planetas-em-profundidade.md §2.4 e §9.2,
// docs/tradicao/16-oportunidades-de-conteudo.md §1, docs/tradicao/01 §2.5.
//
// ===========================================================================
// A CONTA, E POR QUE ELA ESTÁ CERTA 📐
// ===========================================================================
// O Ascendente é o ponto da eclíptica que está NASCENDO no horizonte leste. O
// que já nasceu está acima do horizonte e tem longitude MENOR que a dele; o que
// ainda não nasceu está abaixo. Em Casas Inteiras (o sistema que lib/signs.js
// usa, e o da antiguidade) isso é o mesmo que dizer: casas 1 a 6 embaixo, 7 a
// 12 em cima. Logo:
//
//   delta = (longitude do Sol − grau do Ascendente) mod 360
//   delta ∈ (180, 360)  →  Sol ACIMA do horizonte  →  mapa DIURNO
//   delta ∈ (0, 180)    →  Sol ABAIXO do horizonte →  mapa NOTURNO
//
// 📐 MEDIDO nesta frente (31/07/2026), porque uma inversão de sinal aqui seria
// invisível e permanente: comparei este critério com a ALTITUDE GEOMÉTRICA do
// Sol calculada por outro caminho inteiro (astronomy-engine `Equator` +
// `Horizon`, sem refração), em 242.586 instantes — um ano inteiro, passo de 13
// minutos, em seis lugares de Longyearbyen (78°N) a Ushuaia (54°S), incluindo
// Tromsø e Reiquiavique, onde o Sol passa dias sem se pôr.
//
//   242.577 concordâncias · 9 divergências
//   as 9 têm o Sol a menos de 0,006° do horizonte — ou seja, o instante EXATO
//   do cruzamento, onde os dois métodos diferem só pela latitude eclíptica do
//   Sol e pela paralaxe.
//
// A prova roda em test/seita.test.js e falha o build se o sinal inverter.
//
// POR QUE O GRAU DO ASCENDENTE É RECALCULADO AQUI. `lib/signs.js` exporta
// `ascendantSign` (só o SIGNO) e guarda o grau exato numa função interna
// (`_ascendantDegree`), que ele próprio já duplica de propósito para não mexer
// em `ascendantSign`. A matemática abaixo é a MESMA — RAMC/atan2 de
// Duffett-Smith, mesma obliquidade verdadeira, mesma conversão de hora de
// parede. Duplicar mantém a seita coerente com o Ascendente que a tela do Mapa
// Astral mostra ao lado: se um dia os dois discordarem, é bug, e o teste
// compara os dois signos em varredura ampla justamente para pegar isso.
//
// ===========================================================================
// NUNCA FABRICAR CÉU
// ===========================================================================
// Sem data, sem hora, sem cidade ou sem efeméride, esta função NÃO devolve um
// palpite: devolve `disponivel: false`, diz o que falta e diz onde informar.
// Meio-dia e meia-noite do mesmo dia dão seitas opostas — "chutar meio-dia",
// que é aceitável para o signo lunar, aqui seria cara-ou-coroa.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string dos packs
// ===========================================================================
// (mesma disciplina de lib/zodiacBody.js, lib/grounding.js e lib/synastry.js —
// e vale nos TRÊS idiomas, sem exceção)
//
// 1. PRENDE PRIMEIRO, FONTE DEPOIS. Toda leitura abre na vida real, em língua
//    de conversa, e fecha com o recibo. Termo técnico ganha glosa na primeira
//    aparição ("seita — o time a que cada planeta pertence").
// 2. TODA AFIRMAÇÃO HISTÓRICA CARREGA O LOCUS. Obra, autor, século. O que é
//    leitura do app vem rotulado como leitura do app (notaLeituraDoApp). O que
//    a pesquisa não achou fica em NAO_ACHADO e continua não achado.
// 3. NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita, em nenhum idioma: pt aliviar/
//    acalmar/curar/tratar/energizar; es aliviar/calmar/sanar/curar/tratar;
//    en relieve/soothe/calm/heal/cure/treat. Nenhuma entra.
// 4. NADA DE VEREDITO NEM DE PROMESSA. A seita descreve a natureza da
//    configuração, não o desfecho da vida de ninguém. Nada de "você vai",
//    "garantido", "sorte grande".
// 5. NÃO COMPLETAR A LACUNA. O ponto mais delicado desta feature: Valente
//    afirma o POSITIVO (maléfico na própria seita é doador de bem) e a frase
//    oposta dele é sobre maléfico INOPERANTE — não sobre maléfico fora de
//    seita. A astrologia tradicional moderna faz essa ponte; esta base não
//    achou a linha antiga que a autorize. Por isso o app NÃO diz que Saturno de
//    noite ou Marte de dia é pior. Ver NAO_ACHADO.maleficoForaDeSeita.
//
// test/seita.test.js segura tudo isso — o PT byte a byte, a paridade dos três
// packs, a linha vermelha e o sinal da conta — e falha o build. É de propósito.
//
// ===========================================================================
// OS TRÊS IDIOMAS
// ===========================================================================
// Toda prosa vive em lib/traducoes/seita.{pt,es,en}.js, com a MESMA forma:
// mesmas chaves, mesmas funções, mesma assinatura. O que NUNCA muda entre eles:
// o verbatim inglês de Robbins e de Riley (traduzir citação é falsificá-la), os
// loci (Tetrabiblos I.7 continua Tetrabiblos I.7), os números, e as CHAVES
// internas — nomes de planeta continuam em português nos três packs, porque são
// dados, não texto de tela. As funções públicas têm `lang` com default 'pt'.

import { planetPositions } from './signs';
import { resolveOffsetHours } from './timezone';
import { PACK as PACK_PT } from './traducoes/seita.pt.js';
import { PACK as PACK_ES } from './traducoes/seita.es.js';
import { PACK as PACK_EN } from './traducoes/seita.en.js';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma fora dos três cai no PT — o mesmo fallback de lib/i18n.js e de
// lib/synastry.js, e o que garante que chamada sem `lang` nunca quebra.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// 1. A TABELA — Ptolomeu I.7 e Valente I.1
// ---------------------------------------------------------------------------
// `seita` null = comum (só Mercúrio): a seita dele depende do mapa, porque
// depende de ele aparecer no céu antes ou depois do Sol (Ptol. I.7 ✅, e a
// distinção oriental/ocidental é I.8 ✅).
//
// `classe` é Tetrabiblos I.5 e NÃO é juízo moral: é excesso de qualidade
// elemental. Repare em duas coisas que quase todo resumo erra e que estão na
// fonte: a LUA é benéfica (I.5 lista Júpiter, Vênus E a Lua) e o SOL não é
// (é comum, junto de Mercúrio).
//
// `valens` é a etiqueta verbatim que Valente dá àquele planeta em I.1. Mercúrio
// está com null de propósito — a base registra os outros seis planeta a planeta
// e não registra Mercúrio (ver NAO_ACHADO.seitaDeMercurioEmValente).
export const SEITA_POR_PLANETA = {
  'Sol': { seita: 'diurno', classe: 'comum', comum: false, valens: 'of the day sect' },
  'Lua': { seita: 'noturno', classe: 'benefico', comum: false, valens: 'of the night sect' },
  'Mercúrio': { seita: null, classe: 'comum', comum: true, valens: null },
  'Vênus': { seita: 'noturno', classe: 'benefico', comum: false, valens: 'of the night sect' },
  'Marte': { seita: 'noturno', classe: 'malefico', comum: false, valens: 'of the night sect' },
  'Júpiter': { seita: 'diurno', classe: 'benefico', comum: false, valens: 'of the day sect' },
  'Saturno': { seita: 'diurno', classe: 'malefico', comum: false, valens: 'of the day sect' },
};

// A ordem em que a tela desenha. É a mesma de PLANETS em lib/signs.js, restrita
// aos sete que a fonte antiga conhece.
export const ORDEM_DOS_SETE = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];

// Os três modernos e o ano da descoberta. Não têm seita, e não é omissão do
// app: a doutrina é sobre os sete que se veem a olho nu. Ver NAO_ACHADO.
export const MODERNOS = { 'Urano': 1781, 'Netuno': 1846, 'Plutão': 1930 };

// ---------------------------------------------------------------------------
// 2. A FAIXA LIMÍTROFE — escolha DESTE APP, e declarada como tal
// ---------------------------------------------------------------------------
// Na fonte não há meio-termo: ou o Sol está acima, ou está abaixo. Mas a hora
// de nascimento que as pessoas informam quase nunca tem precisão de minuto, e
// perto do eixo alguns minutos trocam o resultado inteiro.
//
// 📐 Medido: o eixo se afasta do Sol a ~0,229°/min em São Paulo, 0,205 em Nova
// York e 0,249 em Quito (mediana ao longo de um ano) — ou seja, 3° são 12 a 15
// minutos de relógio. E 3,34% dos instantes de um ano em São Paulo caem dentro
// dessa faixa.
//
// O app usa isso só para AVISAR que a hora informada decide o resultado. Nunca
// para dizer que a tradição reconhece um meio-termo — ela não reconhece.
export const LIMIAR_LIMITROFE_GRAUS = 3;

// ---------------------------------------------------------------------------
// 3. EFEMÉRIDE E DATA — as mesmas travas de lib/signs.js
// ---------------------------------------------------------------------------
let _Astronomy;
function getAstronomy() {
  if (_Astronomy !== undefined) return _Astronomy;
  try {
    _Astronomy = require('astronomy-engine');
  } catch {
    _Astronomy = false;
  }
  return _Astronomy;
}

// Rejeita formato errado E datas impossíveis ("2023-02-29" fora de bissexto),
// que o construtor Date aceitaria em silêncio rolando pro mês seguinte. Mesma
// função de lib/signs.js, replicada porque lá ela é interna.
function dataValida(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return false;
  const ano = +m[1];
  const mes = +m[2];
  const dia = +m[3];
  const d = new Date(dateStr + 'T00:00');
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === ano && d.getMonth() + 1 === mes && d.getDate() === dia;
}

// "HH:MM" de relógio de verdade. Hora ausente NÃO vira meio-dia aqui (ver o
// cabeçalho): meio-dia e meia-noite dão seitas opostas.
function horaValida(timeStr) {
  if (typeof timeStr !== 'string') return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!m) return false;
  return +m[1] <= 23 && +m[2] <= 59;
}

function offsetHorasDe(zona, dateStr, timeStr) {
  if (typeof zona === 'number') return Number.isNaN(zona) ? 0 : zona;
  const r = resolveOffsetHours(zona, dateStr, timeStr);
  return typeof r === 'number' && !Number.isNaN(r) ? r : 0;
}

function norm360(x) {
  return ((x % 360) + 360) % 360;
}

// Grau exato do Ascendente (0–360). MESMA matemática de lib/signs.js
// (`_ascendantDegree`): RAMC/atan2 de Duffett-Smith, obliquidade verdadeira da
// data, hora de parede convertida pelo fuso do lugar. Ver o cabeçalho para o
// motivo da duplicação.
export function ascendenteGrau(dateStr, timeStr, latitude, longitude, zona) {
  if (!dataValida(dateStr) || !horaValida(timeStr)) return null;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  const A = getAstronomy();
  if (!A) return null;

  const offset = offsetHorasDe(zona, dateStr, timeStr);
  const localAsUtcMs = new Date(`${dateStr}T${timeStr}:00Z`).getTime();
  if (Number.isNaN(localAsUtcMs)) return null;
  const d = new Date(localAsUtcMs - offset * 3600 * 1000);

  const gastHours = A.SiderealTime(d);
  const tilt = A.e_tilt(A.MakeTime(d));
  const epsRad = (tilt.tobl * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;

  const ramcDeg = norm360((gastHours + longitude / 15) * 15);
  const ramcRad = (ramcDeg * Math.PI) / 180;

  const y = Math.cos(ramcRad);
  const x = -(Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(ramcRad));
  return norm360((Math.atan2(y, x) * 180) / Math.PI);
}

// ---------------------------------------------------------------------------
// 4. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/synastry.js e lib/grounding.js: declarar o
// buraco impede que a próxima pessoa a editar o preencha com a versão que
// circula por aí. É registro de pesquisa, não é renderizado em tela — por isso
// fica no motor e em PT.
export const NAO_ACHADO = [
  {
    id: 'maleficoForaDeSeita',
    texto:
      'Texto antigo dizendo, com todas as letras, que maléfico FORA da própria seita é pior. Valente I.1 opõe "operative in appropriate places in their own sect" a "inoperative" — e inoperante não é sinônimo de fora de seita. A astrologia tradicional moderna faz essa ponte o tempo todo; esta base não achou a linha antiga que a autorize. Por isso o app afirma o positivo (maléfico na própria seita, com Valente) e se recusa a afirmar o negativo.',
  },
  {
    id: 'condicaoCompleta',
    texto:
      'As demais condições que a astrologia helenística soma à seita — hemisfério, gênero do signo, e o conjunto que a literatura posterior chama de hayz/halb. Não foram lidas em fonte primária nesta base e por isso não entram na conta. Chris Brennan, Hellenistic Astrology (2017), é onde essa discussão está mais bem organizada, e é justamente a obra protegida que a base não leu (doc 99 §1.4).',
  },
  {
    id: 'lugarApropriado',
    texto:
      'A definição antiga de "appropriate places" na frase de Valente I.1. A condição dele é dupla — estar na própria seita E operar em lugar apropriado —, e o app só calcula a primeira metade. Enquanto a segunda não estiver lida em fonte, toda leitura carrega notaCondicao dizendo isso na cara do usuário.',
  },
  {
    id: 'margemDoHorizonte',
    texto:
      'Qualquer margem de tolerância antiga para o Sol junto do horizonte. Os 3 graus de LIMIAR_LIMITROFE_GRAUS são escolha deste app e servem para avisar que a hora informada pode virar o resultado — não para sugerir que a tradição reconheça um meio-termo. Na fonte, ou está acima ou está abaixo.',
  },
  {
    id: 'seitaDeMercurioEmValente',
    texto:
      'Mercúrio na grade de seitas de Valente I.1. A base registra os outros seis planeta a planeta ("of the day sect" / "of the night sect") e não registra Mercúrio — pode ser ausência do texto ou da extração. Enquanto não se confere, a seita de Mercúrio anda só com Ptolomeu I.7.',
  },
  {
    id: 'seitaDosModernos',
    texto:
      'Qualquer atribuição de seita a Urano, Netuno ou Plutão. Não existe, e não pode existir: eles são de 1781, 1846 e 1930, e a tabela é do séc. II. O app diz isso em vez de deixar a linha em branco.',
  },
];

// A bibliografia em PT, para quem importar do motor. A versão localizada de
// cada idioma vive no pack e é a que sai no campo `fonte` da leitura.
export const FONTES = PACK_PT.fontes;

// ---------------------------------------------------------------------------
// 5. NOMES DE PLANETA — as chaves são dados, e são PT nos três idiomas
// ---------------------------------------------------------------------------
const COMBINANTES = /[\u0300-\u036f]/g;

function semAcento(s) {
  return String(s)
    .normalize('NFD')
    .replace(COMBINANTES, '')
    .toLowerCase()
    .trim();
}

const NOME_CANONICO = {};
for (const nome of [...ORDEM_DOS_SETE, ...Object.keys(MODERNOS)]) {
  NOME_CANONICO[semAcento(nome)] = nome;
}

export function nomeCanonicoDePlaneta(planeta) {
  if (!planeta) return null;
  return NOME_CANONICO[semAcento(planeta)] || null;
}

// ---------------------------------------------------------------------------
// 6. A LEITURA INDISPONÍVEL — o que falta, e onde resolver
// ---------------------------------------------------------------------------
// Mesma forma da leitura completa (a tela não precisa de dois renderizadores),
// com `disponivel: false`, `falta` e `comoResolver` preenchidos.
function indisponivel(pack, motivo) {
  const f = pack.falta[motivo];
  return {
    disponivel: false,
    motivo,
    falta: [motivo],
    seita: null,
    seitaNome: null,
    chamada: null,
    explicacao: f.texto,
    comoResolver: f.comoResolver,
    planetasDaSeita: [],
    planetasForaDaSeita: [],
    planetasIndeterminados: [],
    planetas: [],
    mercurio: { estrela: null, seita: null, elongacaoGraus: null, texto: pack.mercurio.indeterminado },
    ascendente: null,
    sol: null,
    grausDoHorizonte: null,
    limitrofe: false,
    notaLimitrofe: null,
    notaCondicao: pack.notaCondicao,
    notaLeituraDoApp: pack.notaLeituraDoApp,
    verbatins: [pack.verbatim.valensMaleficos, pack.verbatim.ptolomeuMercurio],
    // Por que "benéfico", "maléfico" e "comum" significam o que significam —
    // Tetrabiblos I.5, que é onde a Lua entra entre os benéficos e o Sol não.
    verbatinsDasClasses: [pack.verbatim.ptolomeuBeneficos, pack.verbatim.ptolomeuMaleficos, pack.verbatim.ptolomeuComuns],
    fonte: pack.fontes,
  };
}

// ---------------------------------------------------------------------------
// 7. A ENTRADA DE UM PLANETA — a "linha extra" que a tela pendura em qualquer
//    leitura de planeta
// ---------------------------------------------------------------------------
function entradaDeModerno(nome, pack) {
  const ano = MODERNOS[nome];
  return {
    planeta: nome,
    nome: pack.planetas[nome],
    moderno: true,
    ano,
    comum: false,
    classe: null,
    classeNome: null,
    seitaDoPlaneta: null,
    naSeita: null,
    linha: pack.linhaModerna[nome]({ ano }),
    recibo: pack.recibos[nome],
    verbatimSeita: null,
  };
}

function entradaDosSete(nome, seitaDoMapa, estrelaDeMercurio, pack) {
  const info = SEITA_POR_PLANETA[nome];
  const seitaDoPlaneta = info.comum ? (estrelaDeMercurio === 'manha' ? 'diurno' : estrelaDeMercurio === 'tarde' ? 'noturno' : null) : info.seita;
  const naSeita = seitaDoPlaneta === null || !seitaDoMapa ? null : seitaDoPlaneta === seitaDoMapa;
  const c = { seita: seitaDoMapa, estrela: estrelaDeMercurio, planeta: nome };

  let linha;
  if (naSeita === null) linha = pack.mercurio.indeterminado;
  else if (naSeita) linha = pack.linhas[nome].naSeita(c);
  else linha = pack.linhas[nome].foraDaSeita(c);

  return {
    planeta: nome,
    nome: pack.planetas[nome],
    moderno: false,
    ano: null,
    comum: info.comum,
    classe: info.classe,
    classeNome: pack.classes[info.classe],
    seitaDoPlaneta,
    naSeita,
    linha,
    recibo: pack.recibos[nome],
    // A etiqueta verbatim de Valente I.1, planeta a planeta. Mercúrio vem com
    // null de propósito — a base não o registra nessa lista.
    verbatimSeita: info.valens === 'of the day sect' ? pack.verbatim.valensDia : info.valens === 'of the night sect' ? pack.verbatim.valensNoite : null,
  };
}

/**
 * A LINHA EXTRA DE QUALQUER PLANETA.
 *
 * `planeta`  — nome em PT, com ou sem acento, maiúsculas indiferentes
 *              ('Saturno', 'saturno', 'Mercurio'). As chaves são dados e são
 *              PT nos três idiomas.
 * `mapa`     — o objeto devolvido por seitaDoMapa() (o melhor caso: resolve
 *              Mercúrio de verdade) OU a string 'diurno' / 'noturno'.
 * `lang`     — 'pt' (default), 'es' ou 'en'.
 *
 * Devolve `{ planeta, nome, seitaDoPlaneta, naSeita, classe, comum, linha,
 * recibo, disponivel }`, onde `linha` é a frase que a tela pendura embaixo da
 * leitura do planeta e `recibo` é a fonte, para a linha miúda ao lado.
 *
 * Os três modernos respondem SEMPRE (a resposta deles é a declaração de que
 * seita não se aplica, com o ano da descoberta) — não dependem do mapa.
 * Planeta desconhecido devolve null.
 */
export function linhaDeSeita(planeta, mapa, lang = 'pt') {
  const pack = packDoIdioma(lang);
  const nome = nomeCanonicoDePlaneta(planeta);
  if (!nome) return null;

  if (MODERNOS[nome]) {
    return { ...entradaDeModerno(nome, pack), disponivel: true };
  }

  let seita = null;
  let estrela = null;
  let motivo = 'hora';
  if (mapa === 'diurno' || mapa === 'noturno') {
    seita = mapa;
  } else if (mapa && typeof mapa === 'object') {
    if (mapa.seita === 'diurno' || mapa.seita === 'noturno') seita = mapa.seita;
    if (mapa.mercurio && (mapa.mercurio.estrela === 'manha' || mapa.mercurio.estrela === 'tarde')) {
      estrela = mapa.mercurio.estrela;
    }
    if (Array.isArray(mapa.falta) && mapa.falta.length) motivo = mapa.falta[0];
  }

  if (!seita) {
    const f = pack.falta[motivo] || pack.falta.hora;
    return {
      planeta: nome,
      nome: pack.planetas[nome],
      moderno: false,
      ano: null,
      comum: SEITA_POR_PLANETA[nome].comum,
      classe: SEITA_POR_PLANETA[nome].classe,
      classeNome: pack.classes[SEITA_POR_PLANETA[nome].classe],
      seitaDoPlaneta: SEITA_POR_PLANETA[nome].seita,
      naSeita: null,
      linha: f.texto,
      recibo: pack.recibos[nome],
      verbatimSeita: null,
      disponivel: false,
      comoResolver: f.comoResolver,
    };
  }

  return { ...entradaDosSete(nome, seita, estrela, pack), disponivel: true };
}

// ---------------------------------------------------------------------------
// 8. A PORTA DE ENTRADA
// ---------------------------------------------------------------------------
/**
 * `data`   — 'YYYY-MM-DD'
 * `hora`   — 'HH:MM', hora de PAREDE do lugar de nascimento. Obrigatória.
 * `cidade` — o objeto de cidade de lib/cities.js ({ lat, lon, timezone,
 *            utcOffset }). Obrigatório: o horizonte é diferente em cada lugar.
 * `lang`   — 'pt' (default), 'es' ou 'en'.
 *
 * Devolve sempre um objeto com a mesma forma. Com dado suficiente,
 * `disponivel: true` e { seita, planetasDaSeita, explicacao, fonte } cheios.
 * Sem dado suficiente, `disponivel: false`, `falta` e `comoResolver` — nunca
 * um palpite.
 */
export function seitaDoMapa(data, hora, cidade, lang = 'pt') {
  const pack = packDoIdioma(lang);

  if (!dataValida(data)) return indisponivel(pack, 'data');
  if (!horaValida(hora)) return indisponivel(pack, 'hora');

  const lat = cidade && typeof cidade.lat === 'number' && !Number.isNaN(cidade.lat) ? cidade.lat : null;
  const lon = cidade && typeof cidade.lon === 'number' && !Number.isNaN(cidade.lon) ? cidade.lon : null;
  if (lat === null || lon === null) return indisponivel(pack, 'cidade');

  const ascDeg = ascendenteGrau(data, hora, lat, lon, cidade);
  if (ascDeg === null) return indisponivel(pack, 'efemeride');

  const posicoes = planetPositions(data, hora, cidade);
  if (!posicoes) return indisponivel(pack, 'efemeride');
  const sol = posicoes.find((p) => p.planet === 'Sol');
  const merc = posicoes.find((p) => p.planet === 'Mercúrio');
  if (!sol) return indisponivel(pack, 'efemeride');

  // O booleano. Ver "A CONTA, E POR QUE ELA ESTÁ CERTA" no cabeçalho.
  const delta = norm360(sol.longitude - ascDeg);
  const acimaDoHorizonte = delta > 180;
  const seita = acimaDoHorizonte ? 'diurno' : 'noturno';

  // Distância angular do Sol ao eixo Ascendente–Descendente: 0 a 90.
  const grausDoHorizonte = Math.min(delta, Math.abs(delta - 180), 360 - delta);
  const limitrofe = grausDoHorizonte < LIMIAR_LIMITROFE_GRAUS;

  // Mercúrio: estrela da manhã (aparece antes do Sol, longitude menor) é
  // diurno; estrela da tarde é noturno. Ptol. I.7 ✅ e I.8 ✅. A elongação
  // máxima de Mercúrio é ~28°, então o sinal aqui nunca é ambíguo.
  let estrela = null;
  let elongacao = null;
  if (merc) {
    const d = ((merc.longitude - sol.longitude + 540) % 360) - 180;
    elongacao = Math.abs(d);
    if (d < 0) estrela = 'manha';
    else if (d > 0) estrela = 'tarde';
  }

  const planetas = [
    ...ORDEM_DOS_SETE.map((n) => entradaDosSete(n, seita, estrela, pack)),
    ...Object.keys(MODERNOS).map((n) => entradaDeModerno(n, pack)),
  ];

  const c = { seita, estrela, graus: grausDoHorizonte, elongacao, limitrofe };

  return {
    disponivel: true,
    motivo: null,
    falta: [],
    comoResolver: null,

    // ------------------------------------------------------------------
    // O booleano, e o que ele significa
    // ------------------------------------------------------------------
    seita,
    seitaNome: pack.seitaNome[seita],
    seitaMapa: pack.seitaMapa[seita],

    // ------------------------------------------------------------------
    // BLOCO 1 — o que a tela mostra PRIMEIRO
    // ------------------------------------------------------------------
    chamada: pack.chamada[seita](c),
    explicacao: pack.explicacao[seita](c),

    // ------------------------------------------------------------------
    // Os planetas
    // ------------------------------------------------------------------
    planetasDaSeita: planetas.filter((p) => p.naSeita === true),
    planetasForaDaSeita: planetas.filter((p) => p.naSeita === false),
    planetasIndeterminados: planetas.filter((p) => !p.moderno && p.naSeita === null),
    planetas,

    mercurio: {
      estrela,
      seita: estrela === 'manha' ? 'diurno' : estrela === 'tarde' ? 'noturno' : null,
      elongacaoGraus: elongacao,
      texto: estrela ? pack.mercurio[estrela](c) : pack.mercurio.indeterminado,
    },

    // ------------------------------------------------------------------
    // A conta, exposta — quem quiser conferir, confere
    // ------------------------------------------------------------------
    ascendente: { grau: ascDeg },
    sol: { longitude: sol.longitude, acimaDoHorizonte, grausDoAscendente: delta },
    grausDoHorizonte,
    limitrofe,
    notaLimitrofe: limitrofe ? pack.notaLimitrofe(c) : null,

    // ------------------------------------------------------------------
    // As ressalvas que andam junto com TODA leitura
    // ------------------------------------------------------------------
    notaCondicao: pack.notaCondicao,
    notaLeituraDoApp: pack.notaLeituraDoApp,
    verbatins: [pack.verbatim.valensMaleficos, pack.verbatim.ptolomeuMercurio],
    // Por que "benéfico", "maléfico" e "comum" significam o que significam —
    // Tetrabiblos I.5, que é onde a Lua entra entre os benéficos e o Sol não.
    verbatinsDasClasses: [pack.verbatim.ptolomeuBeneficos, pack.verbatim.ptolomeuMaleficos, pack.verbatim.ptolomeuComuns],
    fonte: pack.fontes,
  };
}
