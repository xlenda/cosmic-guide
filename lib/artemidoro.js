// lib/artemidoro.js
// AS CINCO ESPÉCIES DE SONHO — e, antes delas, a pergunta que decide se há
// alguma coisa a interpretar.
//
// ===========================================================================
// O QUE ESTA FEATURE É, EM UMA FRASE
// ===========================================================================
// Antes de dizer o que um sonho quer dizer, Artemidoro de Daldis pergunta se
// ele diz alguma coisa. Quem sonhou com o chefe depois de um dia infernal
// recebeu o dia de volta, não um recado — e dizer isso é mais honesto (e mais
// interessante) do que fingir que tudo significa.
//
// Fonte PRIMÁRIA, uma só e do séc. II d.C.:
//   · Artemidoro de Daldis, Oneirocritica (Ὀνειροκριτικά), cinco livros,
//     escritos por volta de 170–200 d.C. O Livro IV é sobre MÉTODO e o Livro V
//     reúne 95 sonhos com o desfecho registrado — casuística, não verbete.
//   · 1.1 e 1.2 — enhypnion (espelha o que a pessoa está vivendo) × oneiros
//     (significativo do que virá); dentro do oneiros, sonho direto
//     (theorematikoi) × alegórico (allegorikoi).
//   · 1.2.45–55 — as CINCO ESPÉCIES do sonho alegórico: idioi, allotrioi,
//     koina, demosia, kosmika.
//   · 1.9 — o que o intérprete precisa saber sobre QUEM sonhou antes de abrir
//     a boca. É a regra que faz de Artemidoro o oposto de um dicionário.
//
// Referência interna: docs/tradicao/06-oniromancia-e-artes-corporais.md §1.2 e
// §7.8, docs/tradicao/16-oportunidades-de-conteudo.md §12.
//
// ===========================================================================
// POR QUE ESTE MÓDULO NÃO CALCULA CÉU NENHUM
// ===========================================================================
// Não há efeméride aqui, e não é esquecimento. O material desta feature é o
// RELATO da pessoa, e o único dado de entrada são as respostas que ela deu às
// perguntas da fonte. A regra de "nunca fabricar" continua valendo inteira, só
// que aplicada a outra matéria-prima: sem resposta, `classificarSonho` devolve
// `disponivel: false`, diz qual pergunta falta e diz onde respondê-la. Chutar
// a espécie a partir do texto do sonho seria exatamente o dicionário de
// símbolos que Artemidoro passou cinco livros combatendo.
//
// ===========================================================================
// AS TRÊS DECISÕES QUE ESTE ARQUIVO TOMA, E QUE NÃO SÃO ÓBVIAS
// ===========================================================================
// 1. A PERGUNTA DA PERSISTÊNCIA É NOSSA, E NÃO DECIDE NADA. O app pergunta se
//    o sonho continuou com a pessoa depois de acordar. É boa pergunta e ajuda
//    quem responde a reparar — mas NENHUM texto antigo desta base autoriza
//    usá-la como critério. Por isso ela nunca troca a camada: quando ela puxa
//    para o lado contrário da pergunta de Artemidoro, o app registra a
//    discordância (`sinaisDiscordam`) e mantém o critério da fonte. Ver
//    NAO_ACHADO.perguntaDaPersistencia.
//
// 2. O APP NUNCA DECRETA QUE O SONHO É ALEGÓRICO. As cinco espécies são
//    subdivisões do sonho alegórico (1.2.1), e o que separa alegórico de
//    direto é o DESFECHO — o exemplo do próprio Artemidoro é retrospectivo (um
//    homem sonhou com um naufrágio e o naufrágio veio como no sonho). Desfecho
//    o app não tem. Então ele nomeia a espécie pela pessoa que apareceu, diz
//    de onde a espécie vem, e deixa a outra divisão em aberto.
//
// 3. PESSOA DESCONHECIDA NÃO VIRA allotrioi À FORÇA. A definição de 1.2.45 é
//    "outra pessoa, CONHECIDA de quem sonhou". Quando a pessoa responde que
//    não conhece a figura, esta base não sabe onde Artemidoro a arquivaria — e
//    o app responde "não deu para dizer", com o motivo, em vez de empurrar
//    para a gaveta mais parecida. Ver NAO_ACHADO.pessoaDesconhecida.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string dos packs
// ===========================================================================
// (mesma disciplina de lib/seita.js, lib/zodiacBody.js e lib/synastry.js — e
// vale nos TRÊS idiomas, sem exceção)
//
// 1. PRENDE PRIMEIRO, FONTE DEPOIS. Todo texto abre na vida real — a briga das
//    sete, o chefe, a mãe, a cama — em língua de conversa. Obra, autor e
//    século vêm DEPOIS, como recibo. O termo grego ganha glosa na primeira
//    aparição.
// 2. TODA AFIRMAÇÃO HISTÓRICA CARREGA O LOCUS. Livro e parágrafo (1.2.45),
//    obra, autor e século. A datação passa por traduzirQuando/traduzirAutor.
// 3. NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita, em nenhum idioma: pt aliviar/
//    acalmar/curar/tratar/sarar; es aliviar/calmar/sanar/curar/tratar; en
//    soothe/heal/cure/treat. Isto tem uma consequência visível nesta feature:
//    a lista de 1.9 tem SEIS itens e o sexto é o estado do corpo de quem
//    sonha. O app cita o item, diz que ele existe, e não o usa — a elisão fica
//    declarada em vez de silenciosa (pack.checklist.corpo e verbatim.elisao).
// 4. NADA DE VEREDITO NEM DE PROMESSA. Classificar não é interpretar. Em
//    nenhum lugar sai "seu sonho significa que…", "isso quer dizer que você
//    é…" nem qualquer coisa sobre o que vai acontecer com quem leu.
// 5. O QUE É DO APP VEM ROTULADO COMO DO APP (notaLeituraDoApp), e o que a
//    pesquisa não achou continua não achado (NAO_ACHADO).
//
// ===========================================================================
// OS TRÊS IDIOMAS
// ===========================================================================
// Toda prosa vive em lib/traducoes/artemidoro.{pt,es,en}.js, com a MESMA
// forma: mesmas chaves, mesmas funções, mesma assinatura. O que NUNCA muda
// entre eles: o verbatim inglês (traduzir citação é falsificá-la), os loci
// (1.2.45 continua 1.2.45), o grego e a transliteração, e as CHAVES internas —
// os ids das espécies são os nomes gregos transliterados nos três packs,
// porque são dados, não texto de tela. As funções públicas têm `lang` com
// default 'pt'.

import { traduzirQuando, traduzirAutor } from './traducoes/datacao';
import { PACK as PACK_PT } from './traducoes/artemidoro.pt.js';
import { PACK as PACK_ES } from './traducoes/artemidoro.es.js';
import { PACK as PACK_EN } from './traducoes/artemidoro.en.js';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma fora dos três cai no PT — mesmo fallback de lib/i18n.js e de
// lib/seita.js, e o que garante que chamada sem `lang` nunca quebre.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// 1. A OBRA E AS DATAÇÕES
// ---------------------------------------------------------------------------
// Guardadas em PT canônico. A tradução da datação NÃO é feita aqui: passa por
// lib/traducoes/datacao.js, que é onde mora o padrão ("séc. II d.C." →
// "siglo II d.C." → "2nd c. AD"). Nome de OBRA nunca traduz; o AUTOR ganha a
// forma consagrada de cada língua.
export const DATACOES = {
  oneirocritica: { obra: 'Oneirocritica', autor: 'Artemidoro de Daldis', quando: 'séc. II d.C.' },
  macrobio: { obra: 'Commentarii in Somnium Scipionis', autor: 'Macróbio', quando: 'c. 430 d.C.' },
  // "Chester Beatty III" é a designação do papiro, e é o que não traduz —
  // "papiro"/"papyrus" é substantivo comum e fica com o pack de cada língua.
  chesterBeatty: { obra: 'Chester Beatty III', autor: null, quando: 'c. 1220 a.C.' },
  ziqiqu: { obra: 'Ziqīqu', autor: null, quando: 'séc. VII a.C.' },
  edicaoPack: { obra: 'Artemidori Daldiani Onirocriticon libri V', autor: 'Roger A. Pack', quando: '1963' },
  harrisMcCoy: { obra: "Artemidorus' Oneirocritica: Text, Translation, and Commentary", autor: 'Daniel E. Harris-McCoy', quando: '2012' },
  hammondThonemann: { obra: 'The Interpretation of Dreams', autor: 'Martin Hammond e Peter Thonemann', quando: '2020' },
};

export const ORDEM_DAS_DATACOES = [
  'oneirocritica', 'chesterBeatty', 'ziqiqu', 'macrobio', 'edicaoPack', 'harrisMcCoy', 'hammondThonemann',
];

// datacao.js manda quando conhece o nome (é o mapa compartilhado do app); onde
// ele ainda não tem entrada, vale a forma consagrada do pack. A ordem importa:
// se um dia "Artemidoro de Daldis" entrar no mapa comum, o mapa comum passa a
// mandar sozinho e nada aqui precisa mudar.
function autorDaDatacao(id, base, pack, lang) {
  if (!base.autor) return null;
  const doMapaComum = traduzirAutor(base.autor, lang);
  if (doMapaComum !== base.autor) return doMapaComum;
  return (pack.autores && pack.autores[id]) || base.autor;
}

/**
 * A bibliografia datada, no idioma pedido.
 * Devolve [{ id, obra, autor, quando }] — obra em forma original sempre,
 * autor e datação na forma da língua.
 */
export function datacoesDaFeature(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return ORDEM_DAS_DATACOES.map((id) => {
    const base = DATACOES[id];
    return {
      id,
      obra: base.obra,
      autor: autorDaDatacao(id, base, pack, lang),
      quando: traduzirQuando(base.quando, lang),
    };
  });
}

// O recibo de uma passagem: "Artemidoro de Daldis, Oneirocritica 1.2.45,
// séc. II d.C.". A ordem e a pontuação são do pack; a datação vem de
// datacao.js; o número do parágrafo não muda em língua nenhuma.
function reciboDe(locus, pack, lang) {
  return pack.recibo({
    autor: autorDaDatacao('oneirocritica', DATACOES.oneirocritica, pack, lang),
    obra: DATACOES.oneirocritica.obra,
    locus,
    quando: traduzirQuando(DATACOES.oneirocritica.quando, lang),
  });
}

// ---------------------------------------------------------------------------
// 2. O VOCABULÁRIO DE 1.1–1.2 — as duas camadas, e as palavras vizinhas
// ---------------------------------------------------------------------------
// `verificado: false` marca o termo cuja definição esta base NÃO leu inteira
// na fonte (horama chegou truncado até nós; chrematismos e phantasma foram
// lidos em resumo). O app diz isso em vez de completar — e o pack traz a
// ressalva no texto, não em letra miúda.
export const VOCABULARIO = [
  { id: 'enhypnion', grego: 'ἐνύπνιον', transliteracao: 'enhypnion', locus: '1.2.20–25', verificado: true },
  { id: 'oneiros', grego: 'ὄνειρος', transliteracao: 'oneiros', locus: '1.1.26', verificado: true },
  { id: 'theorematikoi', grego: 'θεωρηματικοί', transliteracao: 'theorematikoi', locus: '1.2.1', verificado: true },
  { id: 'allegorikoi', grego: 'ἀλληγορικοί', transliteracao: 'allegorikoi', locus: '1.2.1', verificado: true },
  { id: 'horama', grego: 'ὅραμα', transliteracao: 'horama', locus: '1.2', verificado: false },
  { id: 'chrematismos', grego: 'χρηματισμός', transliteracao: 'chrematismos', locus: '1.2.40', verificado: false },
  { id: 'phantasma', grego: 'φάντασμα', transliteracao: 'phantasma', locus: '1.2.40', verificado: false },
];

// ---------------------------------------------------------------------------
// 3. AS CINCO ESPÉCIES — Oneirocritica 1.2.45–55
// ---------------------------------------------------------------------------
// `abrange` é dado, não texto: é o que a rota das perguntas devolve. O grego e
// a transliteração são os mesmos nos três idiomas.
export const ESPECIES = [
  { id: 'idioi', grego: 'ἴδιοι', transliteracao: 'idioi', locus: '1.2.45', abrange: 'so-voce' },
  { id: 'allotrioi', grego: 'ἀλλότριοι', transliteracao: 'allotrioi', locus: '1.2.45', abrange: 'outra-pessoa-conhecida' },
  { id: 'koina', grego: 'κοινά', transliteracao: 'koina', locus: '1.2.50', abrange: 'voce-e-outra' },
  { id: 'demosia', grego: 'δημόσια', transliteracao: 'demosia', locus: '1.2.50', abrange: 'a-cidade' },
  { id: 'kosmika', grego: 'κοσμικά', transliteracao: 'kosmika', locus: '1.2.55', abrange: 'o-mundo' },
];

export const ORDEM_DAS_ESPECIES = ESPECIES.map((e) => e.id);

const ESPECIE_POR_ROTA = {};
for (const e of ESPECIES) ESPECIE_POR_ROTA[e.abrange] = e.id;

// ---------------------------------------------------------------------------
// 4. O CHECKLIST DE 1.9 — o que Artemidoro exige saber ANTES de interpretar
// ---------------------------------------------------------------------------
// Seis itens na fonte. O sexto (`corpo`) é o estado do corpo de quem sonha:
// ele existe, está citado, e o app NÃO o usa — porque o app não fala do corpo
// de ninguém. `foraDoApp: true` é o que permite à tela mostrá-lo em outro tom
// em vez de fingir que a lista tem cinco.
export const CHECKLIST_1_9 = [
  { id: 'identidade', foraDoApp: false },
  { id: 'oficio', foraDoApp: false },
  { id: 'nascimento', foraDoApp: false },
  { id: 'dinheiro', foraDoApp: false },
  { id: 'corpo', foraDoApp: true },
  { id: 'idade', foraDoApp: false },
];

// ---------------------------------------------------------------------------
// 5. AS PERGUNTAS — três da fonte, uma nossa e declarada como nossa
// ---------------------------------------------------------------------------
// `soQuando` é a condição para a pergunta aparecer na tela. `conhece…` só
// existe porque 1.2.45 define allotrioi como "outra pessoa CONHECIDA de quem
// sonhou" — para koina a fonte não pede que o outro seja conhecido, então o
// app também não pergunta. Perguntar onde a fonte não pede é inventar método.
export const PERGUNTAS = [
  { id: 'diaAnterior', obrigatoria: true, doApp: false, locus: '1.2.20–25', opcoes: ['sim', 'nao'], soQuando: null },
  {
    id: 'quemApareceu',
    obrigatoria: true,
    doApp: false,
    locus: '1.2.45–55',
    opcoes: ['so-voce', 'outra-pessoa', 'voce-e-outra', 'a-cidade', 'o-mundo', 'nada-disso'],
    soQuando: null,
  },
  {
    id: 'conheceQuemApareceu',
    obrigatoria: true,
    doApp: false,
    locus: '1.2.45',
    opcoes: ['sim', 'nao'],
    soQuando: { quemApareceu: ['outra-pessoa'] },
  },
  { id: 'aindaComVoce', obrigatoria: false, doApp: true, locus: null, opcoes: ['sim', 'nao'], soQuando: null },
];

const PERGUNTA_POR_ID = {};
for (const p of PERGUNTAS) PERGUNTA_POR_ID[p.id] = p;

// ---------------------------------------------------------------------------
// 6. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/seita.js e lib/synastry.js: declarar o
// buraco impede que a próxima pessoa a editar o preencha com a versão que
// circula por aí. É registro de pesquisa, não é renderizado em tela — por isso
// fica no motor e em PT.
export const NAO_ACHADO = [
  {
    id: 'perguntaDaPersistencia',
    texto:
      'Linha antiga que autorize usar "o sonho continuou com você depois de acordar?" como critério. A distinção que Artemidoro dá em 1.1–1.2 é outra: o enhypnion espelha o que a pessoa está vivendo, o oneiros traz outra coisa. A pergunta da persistência é operacionalização DESTE APP, e por isso ela nunca troca a camada — quando discorda da pergunta da fonte, o app registra a discordância e mantém o critério antigo.',
  },
  {
    id: 'pessoaDesconhecida',
    texto:
      'Onde Artemidoro arquiva o sonho em que aparece uma pessoa que o sonhador NÃO conhece. A definição de allotrioi em 1.2.45 é explícita: outra pessoa, conhecida de quem sonhou. Esta base não leu o que ele faz com o desconhecido, então o app responde "não deu para dizer" com o motivo, em vez de empurrar o relato para a gaveta mais parecida.',
  },
  {
    id: 'foraDasCincoEspecies',
    texto:
      'Uma sexta espécie para o sonho em que não aparece pessoa nenhuma, nem cidade, nem céu — só um objeto, um bicho, um lugar fechado. As cinco de 1.2.45–55 cobrem quem o sonho abrange; o relato que não cai em nenhuma delas fica sem espécie e o app diz isso, em vez de forçar idioi por eliminação.',
  },
  {
    id: 'diretoOuAlegorico',
    texto:
      'Qualquer critério que permita separar theorematikos (sonho direto) de allegorikos ANTES do desfecho. O exemplo do próprio Artemidoro em 1.2.1 é retrospectivo — um homem sonhou com um naufrágio e o naufrágio aconteceu como visto. Como as cinco espécies são subdivisões do alegórico, o app nomeia a espécie pela pessoa que apareceu e não decreta que o sonho é alegórico.',
  },
  {
    id: 'termosDeMacrobio',
    texto:
      'Os cinco termos da OUTRA taxonomia quíntupla da Antiguidade tardia — a de Macróbio, Commentarii in Somnium Scipionis, c. 430 d.C. A internet mistura as duas listas rotineiramente. Esta base confirma que a segunda existe e que é de outro autor e outro século, mas não conferiu os termos dele em edição; por isso o app nomeia a confusão e não apresenta a lista de Macróbio como verificada.',
  },
  {
    id: 'demaisCasosDoLivroV',
    texto:
      'Os 93 casos restantes do Livro V. O livro é uma coleção de 95 sonhos com o desfecho registrado, e esta base leu dois deles (5.91, o escravo dos três nomes, e 1.79, o pobre de mãe rica). O app cita os dois que leu e não faz afirmação de conjunto sobre os outros.',
  },
];

// A bibliografia em PT, para quem importar do motor. A versão localizada de
// cada idioma vive no pack e é a que sai no campo `fonte` da classificação.
export const FONTES = PACK_PT.fontes;

// ---------------------------------------------------------------------------
// 7. LEITURA DO CONTEÚDO — as listas prontas para a tela
// ---------------------------------------------------------------------------

/** As cinco espécies, na ordem da fonte, prontas para uma lista. */
export function especies(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return ESPECIES.map((e) => ({
    id: e.id,
    grego: e.grego,
    transliteracao: e.transliteracao,
    locus: e.locus,
    abrange: e.abrange,
    nome: pack.especies[e.id].nome,
    oQueE: pack.especies[e.id].oQueE,
    exemplo: pack.especies[e.id].exemplo,
    recibo: reciboDe(e.locus, pack, lang),
  }));
}

/** Uma espécie pelo id grego transliterado. Id desconhecido devolve null. */
export function especiePorId(id, lang = 'pt') {
  if (!id) return null;
  return especies(lang).find((e) => e.id === id) || null;
}

/** enhypnion × oneiros e os termos vizinhos de 1.1–1.2. */
export function vocabulario(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return VOCABULARIO.map((v) => ({
    id: v.id,
    grego: v.grego,
    transliteracao: v.transliteracao,
    locus: v.locus,
    verificado: v.verificado,
    nome: pack.vocabulario[v.id].nome,
    oQueE: pack.vocabulario[v.id].oQueE,
    recibo: reciboDe(v.locus, pack, lang),
  }));
}

/**
 * O checklist de 1.9 — o que Artemidoro exige saber sobre quem sonhou.
 * Devolve os SEIS itens; o do corpo vem com `foraDoApp: true` e o texto que
 * explica por que o app o cita e não o usa.
 */
export function checklistDoSonhador(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return {
    intro: pack.checklistIntro,
    recibo: reciboDe('1.9', pack, lang),
    itens: CHECKLIST_1_9.map((c) => ({ id: c.id, foraDoApp: c.foraDoApp, texto: pack.checklist[c.id] })),
  };
}

/**
 * O questionário. Devolve [{ id, obrigatoria, doApp, locus, pergunta, nota,
 * soQuando, opcoes: [{ id, texto }] }] — a tela desenha na ordem em que vem.
 */
export function perguntas(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return PERGUNTAS.map((p) => ({
    id: p.id,
    obrigatoria: p.obrigatoria,
    doApp: p.doApp,
    locus: p.locus,
    soQuando: p.soQuando,
    pergunta: pack.perguntas[p.id].pergunta,
    // A pergunta que é nossa diz que é nossa, na própria tela.
    nota: p.doApp ? pack.perguntaDoApp : reciboDe(p.locus, pack, lang),
    opcoes: p.opcoes.map((o) => ({ id: o, texto: pack.perguntas[p.id].opcoes[o] })),
  }));
}

// ---------------------------------------------------------------------------
// 8. A CLASSIFICAÇÃO
// ---------------------------------------------------------------------------

function respostaValida(id, valor) {
  const p = PERGUNTA_POR_ID[id];
  if (!p) return null;
  return p.opcoes.includes(valor) ? valor : null;
}

// A pergunta condicional só conta quando a condição dela está satisfeita.
function perguntaSeAplica(p, respostas) {
  if (!p.soQuando) return true;
  return Object.entries(p.soQuando).every(([campo, valores]) => valores.includes(respostas[campo]));
}

function semEspecie(motivo, pack, lang) {
  return {
    especie: null,
    especieNome: null,
    especieGrego: null,
    especieTransliteracao: null,
    especieTexto: null,
    especieRecibo: motivo === 'faltaResposta' ? null : reciboDe('1.2.45–55', pack, lang),
    motivoSemEspecie: motivo,
    textoSemEspecie: pack.semEspecie[motivo],
  };
}

function blocoDaEspecie(rota, pack, lang) {
  const id = ESPECIE_POR_ROTA[rota];
  if (!id) return semEspecie(rota === 'nada-disso' ? 'foraDaLista' : 'pessoaDesconhecida', pack, lang);
  const e = especiePorId(id, lang);
  return {
    especie: id,
    especieNome: e.nome,
    especieGrego: e.grego,
    especieTransliteracao: e.transliteracao,
    especieTexto: pack.especieTexto(e),
    especieRecibo: e.recibo,
    motivoSemEspecie: null,
    textoSemEspecie: null,
  };
}

// A forma é sempre a mesma, com dado ou sem dado — a tela não precisa de dois
// renderizadores. Sem resposta, `disponivel: false`, `faltam` e `comoResolver`.
function esqueleto(pack, lang) {
  return {
    disponivel: false,
    faltam: [],
    perguntaQueFalta: null,
    comoResolver: null,
    chamada: pack.chamada.neutra,
    explicacao: pack.explicacao.neutra,
    camada: null,
    camadaNome: null,
    camadaGrego: null,
    camadaTransliteracao: null,
    camadaTexto: null,
    camadaRecibo: null,
    ...semEspecie('faltaResposta', pack, lang),
    porque: null,
    sinaisDiscordam: false,
    notaDiscordancia: null,
    notaSubespecie: pack.notaSubespecie,
    notaNaoEDicionario: pack.notaNaoEDicionario,
    notaLeituraDoApp: pack.notaLeituraDoApp,
    checklist: checklistDoSonhador(lang),
    verbatins: [pack.verbatim.definicao11, pack.verbatim.checklist19, pack.verbatim.prefacio],
    fonte: pack.fontes,
    // O eco do que foi lido — a tela mostra o que a pessoa respondeu sem
    // guardar estado por conta própria. Resposta fora das opções vira null
    // aqui, e é assim que ela aparece: como não respondida.
    respostas: { diaAnterior: null, quemApareceu: null, conheceQuemApareceu: null, aindaComVoce: null },
  };
}

/**
 * CLASSIFICA UM RELATO PELAS PERGUNTAS DE ARTEMIDORO.
 *
 * `respostas` — { diaAnterior, quemApareceu, conheceQuemApareceu, aindaComVoce }
 *   diaAnterior          'sim' | 'nao'      (1.2.20–25, obrigatória)
 *   quemApareceu         'so-voce' | 'outra-pessoa' | 'voce-e-outra' |
 *                        'a-cidade' | 'o-mundo' | 'nada-disso'
 *                                            (1.2.45–55, obrigatória)
 *   conheceQuemApareceu  'sim' | 'nao'      (1.2.45, só quando a resposta
 *                                            anterior foi 'outra-pessoa')
 *   aindaComVoce         'sim' | 'nao'      (pergunta DO APP, opcional, nunca
 *                                            decide — ver o cabeçalho)
 * `lang` — 'pt' (default), 'es' ou 'en'.
 *
 * Devolve SEMPRE a mesma forma. Não devolve interpretação: devolve a camada
 * (enhypnion × oneiros), a espécie quando ela cabe, e o PORQUÊ de cada uma,
 * com o parágrafo da fonte do lado. Valor fora das opções é tratado como
 * resposta ausente — chutar em cima de lixo é a mesma coisa que chutar.
 */
export function classificarSonho(respostas, lang = 'pt') {
  const pack = packDoIdioma(lang);
  const r = respostas && typeof respostas === 'object' ? respostas : {};

  const lidas = {
    diaAnterior: respostaValida('diaAnterior', r.diaAnterior),
    quemApareceu: respostaValida('quemApareceu', r.quemApareceu),
    conheceQuemApareceu: respostaValida('conheceQuemApareceu', r.conheceQuemApareceu),
    aindaComVoce: respostaValida('aindaComVoce', r.aindaComVoce),
  };

  const faltam = PERGUNTAS.filter(
    (p) => p.obrigatoria && perguntaSeAplica(p, lidas) && lidas[p.id] === null
  ).map((p) => p.id);

  const base = esqueleto(pack, lang);

  if (faltam.length) {
    const primeira = perguntas(lang).find((p) => p.id === faltam[0]);
    return {
      ...base,
      faltam,
      perguntaQueFalta: primeira,
      comoResolver: pack.falta[faltam[0]].comoResolver,
      explicacao: pack.falta[faltam[0]].texto,
      respostas: lidas,
    };
  }

  // A camada sai da pergunta da FONTE, e só dela.
  const camada = lidas.diaAnterior === 'sim' ? 'enhypnion' : 'oneiros';
  const v = vocabulario(lang).find((x) => x.id === camada);

  // A pergunta do app puxando para o outro lado não troca nada — fica
  // registrada. Ver NAO_ACHADO.perguntaDaPersistencia.
  const sinaisDiscordam =
    (camada === 'enhypnion' && lidas.aindaComVoce === 'sim') ||
    (camada === 'oneiros' && lidas.aindaComVoce === 'nao');

  const rota =
    lidas.quemApareceu === 'outra-pessoa'
      ? lidas.conheceQuemApareceu === 'sim'
        ? 'outra-pessoa-conhecida'
        : 'outra-pessoa-desconhecida'
      : lidas.quemApareceu;

  const especie = blocoDaEspecie(rota, pack, lang);

  return {
    ...base,
    ...especie,
    disponivel: true,
    faltam: [],
    perguntaQueFalta: null,
    comoResolver: null,

    chamada: pack.chamada[camada],
    explicacao: pack.explicacao[camada],

    camada,
    camadaNome: v.nome,
    camadaGrego: v.grego,
    camadaTransliteracao: v.transliteracao,
    camadaTexto: v.oQueE,
    camadaRecibo: v.recibo,

    porque: [pack.porqueCamada[camada], pack.porqueEspecie[rota]].filter(Boolean).join(' '),
    sinaisDiscordam,
    notaDiscordancia: sinaisDiscordam ? pack.notaDiscordancia({ camada }) : null,

    respostas: lidas,
  };
}
