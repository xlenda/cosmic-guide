// lib/decanatoPorque.js
// POR QUE ESTA CARTA É ESTE DECANATO — o app mostra o ENCAIXE, não o significado.
//
// ===========================================================================
// O QUE ESTA FEATURE É, EM UMA FRASE
// ===========================================================================
// Toda tela do app entrega resultado pronto. Esta entrega a REGRA: por que o
// Cinco de Copas é "Marte em Escorpião" e não podia ser outra coisa. É o oposto
// de "a carta significa X" — aqui não há leitura da vida de ninguém, há uma
// conta que qualquer pessoa consegue refazer com papel.
//
// ===========================================================================
// A DECISÃO QUE GOVERNA O ARQUIVO: a regra GERA a tabela, não a copia
// ===========================================================================
// `lib/tarotDeck.js` tem as 36 atribuições em GOLDEN_DAWN_DECANS (expostas em
// cada carta nos campos `astro` e `tituloGD`). O caminho preguiçoso seria ler
// aquela tabela e escrever um texto bonito em cima. Este arquivo faz o
// contrário: RECONSTRÓI as 36 do zero, a partir da regra, e só então compara
// com o baralho. Três consequências, e as três são de propósito:
//
//   1. Se a regra e a tabela discordarem em UMA carta, o app declara que não
//      consegue explicar aquela carta (motivo 'divergencia') em vez de narrar
//      um encaixe que ele não conferiu. É a mesma disciplina de "nunca fabricar
//      céu", aplicada a atribuição em vez de a efeméride.
//   2. A conferência roda a cada abertura da tela e sai no campo `conferencia`.
//      O usuário não recebe "confie em nós": recebe 36 de 36, agora.
//   3. O teste vira uma prova de verdade: test/decanatoPorque.test.js compara as
//      36 geradas com as 36 do baralho nos TRÊS idiomas. Se alguém editar
//      GOLDEN_DAWN_DECANS por engano, o build cai.
//
// ===========================================================================
// A REGRA, EM QUATRO PASSOS 📐 (reconstruída aqui, conferida contra o baralho)
// ===========================================================================
//   1. O NAIPE dá o elemento (Paus fogo, Copas água, Espadas ar, Ouros terra),
//      e o elemento dá três signos — a triplicidade.
//   2. O NÚMERO escolhe qual dos três: 2·3·4 vão para o signo cardinal do
//      elemento, 5·6·7 para o fixo, 8·9·10 para o mutável.
//   3. O NÚMERO também escolhe o terço de 10° dentro do signo: 2, 5 e 8 pegam
//      0°–10°; 3, 6 e 9 pegam 10°–20°; 4, 7 e 10 pegam 20°–30°.
//   4. O PLANETA sai de uma contagem: enfileiram-se os 36 terços em ordem
//      zodiacal, do primeiro de Áries ao último de Peixes, e distribuem-se os
//      sete planetas na ordem caldaica (Saturno, Júpiter, Marte, Sol, Vênus,
//      Mercúrio, Lua) em roda, começando com MARTE no terço número 1.
//
// 📐 MEDIDO AQUI: os quatro passos reproduzem as 36 entradas do baralho sem uma
// única exceção, e reproduzem também os 36 rótulos nos três idiomas. Dois
// achados aritméticos que saem da própria conta e que o teste trava:
//
//   · O elemento anda de quatro em quatro signos e o trio de números anda de
//     três em três. Como 3 e 4 são coprimos, cada naipe recebe cada trio
//     exatamente uma vez — e é por ISSO que os quatro naipes têm 2 a 10
//     completos, sem sobrar nem faltar carta. A conta fecha por construção.
//   · Os planetas NÃO fecham redondo: 36 = 5×7 + 1. Marte aparece seis vezes e
//     os outros seis planetas cinco vezes cada; a volta abre em Marte (1º de
//     Áries) e fecha em Marte (3º de Peixes).
//   · A tentação que não se sustenta, e ela quase engana: o 1º terço de Áries
//     cai em Marte, que é o domicílio de Áries, o que sugere a regra "cada
//     signo abre com o próprio dono". Não é regra. 📐 Varrendo os doze, isso
//     acontece em EXATAMENTE DOIS — Áries e Escorpião — e os dois são as casas
//     de Marte, que é justamente quem abre a contagem. Nos outros dez não bate:
//     Touro abre em Mercúrio (dono: Vênus), Gêmeos em Júpiter (dono: Mercúrio).
//     Dois em doze é efeito colateral do ponto de partida, não princípio. Este
//     achado veio do TESTE derrubando a versão anterior deste comentário, que
//     dizia "vale só para Áries" — ficou registrado porque é exatamente para
//     isso que a varredura existe. Ver NAO_ACHADO.razaoDeComecarEmMarte.
//
// ===========================================================================
// AS TRÊS CAMADAS DE IDADE — e elas são muito diferentes
// ===========================================================================
//   · Os terços de 10° já circulavam e já eram disputados na antiguidade.
//     Ptolomeu, Tetrabiblos I.22, séc. II, os REJEITA com todas as letras
//     ("we shall omit") — e eles sobreviveram assim mesmo.
//   · A ordem caldaica dos sete está em Dio Cássio, Historia Romana 37.18–19,
//     séc. III (trad. Cary, LacusCurtius).
//   · O encaixe nas 36 cartas é da Ordem Hermética da Golden Dawn, Book T,
//     1888, publicado por Israel Regardie em The Golden Dawn, 1937–1940.
//
// ARMADILHA DE CITAÇÃO, registrada porque é a mais comum desta matéria: o que
// Ptolomeu chama de "face" em Tetrabiblos I.23 NÃO é o terço de 10° — é uma
// relação de ângulo entre um planeta e os luminares. Mesmo nome, outra coisa.
// Nunca citar I.23 para justificar decanato. (docs/tradicao/01 §2.8, 11 §8.9.)
//
// E a regra de escrita que o doc 16 §9 exige em letras maiúsculas: escrever
// "a atribuição da Golden Dawn, 1888", NUNCA "a atribuição astrológica" — há
// pelo menos três sistemas rivais e incompatíveis (docs/tradicao/05 §4.2–4.3).
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string dos packs
// ===========================================================================
// (mesma disciplina de lib/seita.js, lib/zodiacBody.js e lib/synastry.js — e
// vale nos TRÊS idiomas, sem exceção)
//
// 1. PRENDE PRIMEIRO, FONTE DEPOIS. A chamada e o primeiro parágrafo abrem no
//    momento real de tirar carta — a briga, a mensagem não enviada, a conta do
//    mês. O espanto vem antes da erudição: "existe uma regra" antes de "qual é
//    a regra". Termo técnico ganha glosa na primeira aparição ("decanato — um
//    terço de signo, dez graus").
// 2. TODA AFIRMAÇÃO HISTÓRICA CARREGA O LOCUS: obra, autor e século, e a
//    datação passa por traduzirQuando/traduzirAutor. O que é leitura do app vem
//    rotulado como leitura do app (notaLeituraDoApp) — inclusive os quatro
//    passos, que são a MANEIRA DO APP de contar a conta: a fonte publica a
//    tabela, não a receita.
// 3. NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita, em nenhum idioma.
// 4. NADA DE VEREDITO NEM DE PROMESSA. Esta feature não lê a vida de ninguém:
//    ela explica um encaixe. Se um texto daqui começar a dizer o que a carta
//    significa para a pessoa, ele saiu do escopo.
// 5. NADA DE AVISO DEFENSIVO. Não existe "apenas entretenimento" neste arquivo,
//    e escrever um é bug.
//
// ===========================================================================
// OS TRÊS IDIOMAS
// ===========================================================================
// Toda prosa vive em lib/traducoes/decanatoPorque.{pt,es,en}.js, com a MESMA
// forma: mesmas chaves, mesmas funções, mesma assinatura. As CHAVES internas
// (nomes de planeta, de signo, de naipe, ids de elemento e modalidade) são
// DADOS e continuam em português nos três packs.
//
// O que este arquivo NÃO duplica: os 36 títulos Golden Dawn ("Senhor do
// Domínio") e os 36 rótulos ("Marte em Áries") nos três idiomas. Eles já
// existem em lib/tarotDeck.js (pt) e em lib/traducoes/tarot.{es,en}.js, e
// copiá-los aqui criaria 216 strings que podem dessincronizar em silêncio. O
// motor LÊ de lá — e o teste confere que o rótulo que a regra monta é byte a
// byte o que o baralho publica, nos três idiomas.

import { getCardById, TAROT_DECK } from './tarotDeck';
import tarotEs from './traducoes/tarot.es';
import tarotEn from './traducoes/tarot.en';
import { traduzirAutor, traduzirQuando } from './traducoes/datacao';
import { PACK as PACK_PT } from './traducoes/decanatoPorque.pt.js';
import { PACK as PACK_ES } from './traducoes/decanatoPorque.es.js';
import { PACK as PACK_EN } from './traducoes/decanatoPorque.en.js';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma fora dos três cai no PT — o mesmo fallback de lib/i18n.js, de
// lib/seita.js e de lib/synastry.js.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// 1. AS TABELAS DE ESTRUTURA — dados, não texto. Chaves em PT nos três idiomas.
// ---------------------------------------------------------------------------

// Saturno · Júpiter · Marte · Sol · Vênus · Mercúrio · Lua. Ordem por período
// orbital aparente decrescente, lida como distância à Terra num cosmo
// geocêntrico. Dio Cássio, Historia Romana 37.18–19, séc. III.
export const ORDEM_CALDAICA = ['Saturno', 'Júpiter', 'Marte', 'Sol', 'Vênus', 'Mercúrio', 'Lua'];

// O planeta que abre a contagem, no primeiro terço de Áries. Ver
// NAO_ACHADO.razaoDeComecarEmMarte: a base não achou o texto antigo que diga
// POR QUE é Marte, e o app diz isso em vez de inventar um motivo elegante.
export const PLANETA_QUE_ABRE = 'Marte';

export const ZODIACO = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
];

export const ELEMENTO_DO_SIGNO = {
  'Áries': 'fogo', 'Touro': 'terra', 'Gêmeos': 'ar', 'Câncer': 'agua',
  'Leão': 'fogo', 'Virgem': 'terra', 'Libra': 'ar', 'Escorpião': 'agua',
  'Sagitário': 'fogo', 'Capricórnio': 'terra', 'Aquário': 'ar', 'Peixes': 'agua',
};

export const MODALIDADE_DO_SIGNO = {
  'Áries': 'cardinal', 'Touro': 'fixo', 'Gêmeos': 'mutavel', 'Câncer': 'cardinal',
  'Leão': 'fixo', 'Virgem': 'mutavel', 'Libra': 'cardinal', 'Escorpião': 'fixo',
  'Sagitário': 'mutavel', 'Capricórnio': 'cardinal', 'Aquário': 'fixo', 'Peixes': 'mutavel',
};

// Golden Dawn, correta para um baralho RWS. É atribuição de 1888 e houve
// versões rivais no séc. XIX — o app diz isso em notaAtribuicaoRival.
export const NAIPE_DO_ELEMENTO = { fogo: 'paus', agua: 'copas', ar: 'espadas', terra: 'ouros' };
export const ELEMENTO_DO_NAIPE = { paus: 'fogo', copas: 'agua', espadas: 'ar', ouros: 'terra' };

// Passo 2 e passo 3 juntos: a modalidade escolhe o trio, a posição no trio
// escolhe o terço de 10°.
export const TRIO_DA_MODALIDADE = { cardinal: [2, 3, 4], fixo: [5, 6, 7], mutavel: [8, 9, 10] };

// Domicílio dos sete clássicos, usado SÓ para mostrar que a regra "cada signo
// abre com o próprio dono" NÃO se sustenta: 📐 ela bate em DOIS dos doze —
// Áries e Escorpião —, e os dois são casas de Marte, que é quem abre a
// contagem. Mesma tabela de DOMICILIO_POR_SIGNO em lib/dailyHoroscope.js —
// Ptolomeu, Tetrabiblos I.17, séc. II.
export const DOMICILIO_POR_SIGNO = {
  'Áries': 'Marte', 'Touro': 'Vênus', 'Gêmeos': 'Mercúrio', 'Câncer': 'Lua',
  'Leão': 'Sol', 'Virgem': 'Mercúrio', 'Libra': 'Vênus', 'Escorpião': 'Marte',
  'Sagitário': 'Júpiter', 'Capricórnio': 'Saturno', 'Aquário': 'Saturno', 'Peixes': 'Júpiter',
};

// ---------------------------------------------------------------------------
// 2. A CONSTRUÇÃO DOS 36 — a regra rodando, sem olhar para o baralho
// ---------------------------------------------------------------------------
function construirDecanatos() {
  const inicio = ORDEM_CALDAICA.indexOf(PLANETA_QUE_ABRE);
  const lista = [];
  for (let i = 0; i < 36; i += 1) {
    const signo = ZODIACO[Math.floor(i / 3)];
    const ordemNoSigno = (i % 3) + 1;
    const elemento = ELEMENTO_DO_SIGNO[signo];
    const modalidade = MODALIDADE_DO_SIGNO[signo];
    const naipe = NAIPE_DO_ELEMENTO[elemento];
    const numero = TRIO_DA_MODALIDADE[modalidade][ordemNoSigno - 1];
    lista.push({
      // 1 a 36, na ordem zodiacal. É o número que o texto usa para mostrar a conta.
      posicao: i + 1,
      signo,
      elemento,
      modalidade,
      ordemNoSigno,
      grauInicio: (ordemNoSigno - 1) * 10,
      grauFim: ordemNoSigno * 10,
      grauAbsolutoInicio: i * 10,
      grauAbsolutoFim: (i + 1) * 10,
      planeta: ORDEM_CALDAICA[(inicio + i) % ORDEM_CALDAICA.length],
      passosDesdeMarte: i,
      naipe,
      numero,
      cartaId: `${naipe}-${String(numero).padStart(2, '0')}`,
      // Só para a nota que derruba a regra bonita: o dono do signo.
      domicilioDoSigno: DOMICILIO_POR_SIGNO[signo],
      abreComOProprioDono: ordemNoSigno === 1 && DOMICILIO_POR_SIGNO[signo] === ORDEM_CALDAICA[(inicio + i) % ORDEM_CALDAICA.length],
    });
  }
  return lista;
}

export const DECANATOS = construirDecanatos();

export const DECANATO_POR_CARTA = DECANATOS.reduce((acc, d) => {
  acc[d.cartaId] = d;
  return acc;
}, {});

// Quantas vezes cada planeta aparece nas 36. 36 = 5×7 + 1, então um deles
// aparece seis vezes — e é o que abre a volta.
export const VEZES_POR_PLANETA = ORDEM_CALDAICA.reduce((acc, p) => {
  acc[p] = DECANATOS.filter((d) => d.planeta === p).length;
  return acc;
}, {});

// ---------------------------------------------------------------------------
// 3. O BARALHO — de onde vêm nome de carta, rótulo publicado e título Book T
// ---------------------------------------------------------------------------
function cartaNoIdioma(id, lang) {
  if (lang === 'es') {
    const c = tarotEs.cards && tarotEs.cards[id];
    return c ? { name: c.name, astro: c.astro, tituloGD: c.tituloGD } : null;
  }
  if (lang === 'en') {
    const c = tarotEn.cards && tarotEn.cards[id];
    return c ? { name: c.name, astro: c.astro, tituloGD: c.tituloGD } : null;
  }
  const c = getCardById(id);
  return c ? { name: c.name, astro: c.astro, tituloGD: c.tituloGD } : null;
}

// O rótulo que a REGRA monta: planeta + conector + signo, no idioma pedido.
// É este que se compara com o `astro` publicado pelo baralho.
function rotuloDaRegra(decanato, pack) {
  return `${pack.planetas[decanato.planeta]} ${pack.conector} ${pack.signos[decanato.signo]}`;
}

/**
 * A CONFERÊNCIA. Roda a regra contra a tabela do baralho, carta a carta, num
 * idioma. Devolve `{ total, conferem, divergencias }` — `divergencias` traz
 * `{ cartaId, daRegra, doBaralho }` para cada desencontro.
 *
 * É o que permite a tela dizer "36 de 36, conferido agora" sem pedir fé.
 */
export function conferirContraOBaralho(lang = 'pt') {
  const pack = packDoIdioma(lang);
  const divergencias = [];
  for (const d of DECANATOS) {
    const carta = cartaNoIdioma(d.cartaId, pack.idioma);
    const daRegra = rotuloDaRegra(d, pack);
    if (!carta || carta.astro !== daRegra) {
      divergencias.push({ cartaId: d.cartaId, daRegra, doBaralho: carta ? carta.astro : null });
    }
  }
  return { total: DECANATOS.length, conferem: DECANATOS.length - divergencias.length, divergencias };
}

export const CONFERENCIA = conferirContraOBaralho('pt');

// ---------------------------------------------------------------------------
// 4. A DATAÇÃO — tudo passa por traduzirQuando/traduzirAutor
// ---------------------------------------------------------------------------
// Nome de OBRA nunca traduz (Tetrabiblos continua Tetrabiblos, Book T continua
// Book T). Nome de AUTOR ganha a forma consagrada da língua. DATAÇÃO ganha a
// forma da língua ("séc. II" / "siglo II" / "2nd c.").
//
// Por que existe `pack.autores`: lib/traducoes/datacao.js é COMPARTILHADO e
// conhece o elenco antigo (Ptolomeu, Valente, Catão…), não a Golden Dawn nem
// Dio Cássio. Este arquivo não pode editar aquele. Então a ordem é: datacao.js
// primeiro e, só se ele devolver o nome como veio, a extensão local do pack.
// No dia em que datacao.js aprender esses nomes, ele passa a ganhar sozinho —
// a extensão vira inofensiva sem precisar de mudança aqui.
function autorNaLingua(autor, lang, pack) {
  if (!autor) return null;
  const consagrado = traduzirAutor(autor, lang);
  if (consagrado !== autor) return consagrado;
  return (pack.autores && pack.autores[autor]) || autor;
}

// As três camadas da corrente, com obra, autor e século de cada uma. A prosa
// de cada camada vive no pack; a FONTE vive aqui, porque é dado.
//
// `notaChave` em vez de `nota` escrita: a nota de uma fonte é PROSA ("trad.
// Robbins, 1940" vira "trans. Robbins, 1940" em inglês; "a publicação que tirou
// o Book T do círculo fechado" é uma frase inteira), e prosa não pode morar no
// motor — sairia em português nos três idiomas. A chave é dado, e cada pack
// resolve em pack.notasDeFonte. `null` é fonte sem nota.
export const CAMADAS = [
  {
    id: 'decanatos',
    fontes: [{ obra: 'Tetrabiblos I.22', autor: 'Ptolomeu', quando: 'séc. II', notaChave: 'robbins' }],
    naoDatado: 'origemEgipciaDosDecanatos',
  },
  {
    id: 'ordemDosPlanetas',
    fontes: [{ obra: 'Historia Romana 37.18–19', autor: 'Dio Cássio', quando: 'séc. III', notaChave: 'cary' }],
    naoDatado: 'obraDaFaceHelenistica',
  },
  {
    id: 'asTrintaESeisCartas',
    fontes: [
      { obra: 'Book T — The Tarot', autor: 'Ordem Hermética da Golden Dawn', quando: '1888', notaChave: null },
      { obra: 'The Golden Dawn', autor: 'Israel Regardie', quando: '1937–1940', notaChave: 'regardie' },
    ],
    naoDatado: null,
  },
];

// O verbatim inglês é IDÊNTICO nos três packs — traduzir citação é falsificá-la.
// O que muda por idioma é a paráfrase (assinada pelo app) e a língua do locus.
function verbatinsDoPack(pack, lang) {
  return ['ptolomeuRejeita', 'ptolomeuFace'].map((chave) => {
    const v = pack.verbatim[chave];
    return {
      id: chave,
      texto: v.texto,
      parafrase: v.parafrase,
      locus: `${autorNaLingua(v.autor, lang, pack)}, ${v.obra}, ${traduzirQuando(v.quando, lang)}${v.nota ? `, ${v.nota}` : ''}`,
    };
  });
}

// A datação já na língua do leitor, montada UMA vez e usada nos dois caminhos
// (leitura completa e leitura indisponível). Existe para que nenhuma nota do
// pack precise escrever "Ptolomeu, séc. II" à mão: a forma consagrada do autor e
// a forma da datação vêm sempre de traduzirAutor/traduzirQuando.
function datacaoLocalizada(pack, lang) {
  return {
    autorPtolomeu: autorNaLingua('Ptolomeu', lang, pack),
    quandoPtolomeu: traduzirQuando('séc. II', lang),
    autorDio: autorNaLingua('Dio Cássio', lang, pack),
    quandoDio: traduzirQuando('séc. III', lang),
    autorGoldenDawn: autorNaLingua('Ordem Hermética da Golden Dawn', lang, pack),
    anoBookT: traduzirQuando('1888', lang),
    autorRegardie: autorNaLingua('Israel Regardie', lang, pack),
    quandoRegardie: traduzirQuando('1937–1940', lang),
    seculoGoldenDawn: traduzirQuando('séc. XIX', lang),
  };
}

function camadasDoPack(pack, lang) {
  return CAMADAS.map((c) => ({
    id: c.id,
    titulo: pack.camadas[c.id].titulo,
    texto: pack.camadas[c.id].texto,
    idade: pack.camadas[c.id].idade,
    fontes: c.fontes.map((f) => ({
      obra: f.obra,
      autor: autorNaLingua(f.autor, lang, pack),
      quando: traduzirQuando(f.quando, lang),
      nota: f.notaChave ? pack.notasDeFonte[f.notaChave] : null,
      linha: `${f.obra} — ${autorNaLingua(f.autor, lang, pack)}, ${traduzirQuando(f.quando, lang)}`,
    })),
  }));
}

// ---------------------------------------------------------------------------
// 5. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/seita.js, lib/synastry.js e lib/grounding.js:
// declarar o buraco impede que a próxima pessoa a editar o preencha com a versão
// que circula por aí. É registro de pesquisa, não é renderizado em tela — por
// isso fica no motor e em PT.
export const NAO_ACHADO = [
  {
    id: 'origemEgipciaDosDecanatos',
    texto:
      'Obra, autor e século para a origem egípcia dos 36 decanatos. Esta base sustenta que eles vêm dos relógios estelares egípcios e são muito anteriores à astrologia grega (docs/tradicao/14 §6.3), mas não fixou um texto datado que o comprove. O que ESTÁ conferido é o limite superior: Ptolomeu já os conhece e já os rejeita no séc. II, o que prova que em 150 d.C. eles eram corrente e já eram disputados. Por isso o app cita Ptolomeu para a antiguidade dos decanatos e não escreve nada como "os egípcios ligaram estas cartas ao céu".',
  },
  {
    id: 'obraDaFaceHelenistica',
    texto:
      'O texto antigo que aplica a ordem caldaica aos 36 decanatos começando por Marte no primeiro decanato de Áries. A base registra a prática como helenística — as "faces", prosopa — atravessando a magia medieval e renascentista até o Picatrix, mas não leu o capítulo em fonte primária. Enquanto isso não acontece, o app diz que a regência planetária dos decanatos é helenística e para aí, sem obra nem autor para esse elo específico.',
  },
  {
    id: 'razaoDeComecarEmMarte',
    texto:
      'Qualquer texto antigo que explique POR QUE a contagem começa em Marte, e não em Saturno, que é onde a ordem caldaica começa em toda outra aplicação (horas planetárias, dias da semana, metais). 📐 A racionalização tentadora não se sustenta: "cada signo abre com o próprio dono" bate em dois signos dos doze — Áries e Escorpião —, e os dois são casas de Marte em Ptolomeu I.17, ou seja, a coincidência é consequência do ponto de partida e não sua razão. Touro abre com Mercúrio (domicílio: Vênus) e Gêmeos com Júpiter (domicílio: Mercúrio). O app mostra o dado e declara a falta em vez de inventar um motivo elegante.',
  },
  {
    id: 'apelidoCaldaico',
    texto:
      'Confirmação de que a ordem apelidada de "caldaica" seja a ordem canônica dos textos astronômicos babilônicos. "Caldaico" é uso greco-romano para "babilônico" em sentido largo. E havia pelo menos duas ordens antigas concorrentes: Ptolomeu registra no Almagesto IX.1 que os astrônomos mais antigos punham Vênus e Mercúrio abaixo do Sol e os mais recentes acima — capítulo reportado nesta base, não lido no original. O app usa o apelido consagrado e registra que ele é frouxo.',
  },
  {
    id: 'regraEscritaNoBookT',
    texto:
      'Se o Book T enuncia os quatro passos como REGRA, ou se apenas publica a tabela pronta das 36 cartas. Esta base conferiu as 36 entradas e os 36 títulos contra o Book T (docs/tradicao/05 §6.1) e viu que fecham como um ciclo caldaico único (14 §6.3) — mas conferir a tabela não é ler a receita. Por isso os quatro passos saem rotulados como leitura do app em notaLeituraDoApp: a fonte publica a tabela, a formulação em quatro passos é nossa, e a conferência de que ela reproduz as 36 roda em código.',
  },
  {
    id: 'decanatoDosAsesECortes',
    texto:
      'Um decanato para os quatro Ases e as dezesseis cartas de corte. Não existe, e não é omissão do app: na mesma tabela o Ás é a raiz do elemento do naipe e a corte recebe elemento composto. São 22 Maiores + 4 Ases + 16 cortes = 42 cartas fora dos 36 decanatos, e 36 + 42 = 78. A conta do baralho fecha justamente porque essas cartas ficam de fora.',
  },
];

// A bibliografia em PT, para quem importar do motor. A versão localizada de
// cada idioma vive no pack e é a que sai no campo `fonte` da leitura.
export const FONTES = PACK_PT.fontes;

// ---------------------------------------------------------------------------
// 6. IDENTIFICAR A CARTA — id, objeto de carta, ou naipe + número
// ---------------------------------------------------------------------------
const NAIPES = ['paus', 'copas', 'espadas', 'ouros'];

function idDaCarta(carta) {
  if (typeof carta === 'string') return carta.trim().toLowerCase();
  if (carta && typeof carta === 'object') {
    if (typeof carta.id === 'string') return carta.id.trim().toLowerCase();
    if (NAIPES.includes(carta.suit) && Number.isInteger(carta.number)) {
      return `${carta.suit}-${String(carta.number).padStart(2, '0')}`;
    }
  }
  return null;
}

// Por que a carta não tem decanato — e são motivos DIFERENTES, com textos
// diferentes. "Não tem" sem dizer por quê é o tipo de silêncio que esta feature
// existe para não repetir.
function motivoDeNaoTerDecanato(id) {
  if (!id) return 'carta';
  if (/^major-\d{2}$/.test(id)) return 'maior';
  const m = /^(paus|copas|espadas|ouros)-(\d{2})$/.exec(id);
  if (!m) return 'carta';
  const n = Number(m[2]);
  if (n === 1) return 'as';
  if (n >= 11 && n <= 14) return 'corte';
  if (n >= 2 && n <= 10) return null;
  return 'carta';
}

/**
 * O DADO CRU, sem prosa. `carta` aceita:
 *   · o id ('copas-05', 'COPAS-05')
 *   · o objeto de carta do baralho ({ id, suit, number, … })
 *   · { suit: 'copas', number: 5 }
 *
 * Devolve a entrada de DECANATOS (posição, signo, elemento, modalidade, terço,
 * graus, planeta, naipe, número) ou `null` se a carta não for uma das 36
 * numeradas de 2 a 10. Não localiza nada — para texto, use porqueEsteDecanato.
 */
export function decanatoDaCarta(carta) {
  const id = idDaCarta(carta);
  if (!id || motivoDeNaoTerDecanato(id) !== null) return null;
  return DECANATO_POR_CARTA[id] || null;
}

// ---------------------------------------------------------------------------
// 7. A LEITURA INDISPONÍVEL — mesma forma da completa
// ---------------------------------------------------------------------------
// A tela não precisa de dois renderizadores: os mesmos campos, com
// `disponivel: false`, `motivo` e `comoResolver` preenchidos.
function indisponivel(pack, lang, motivo, id, extra) {
  const f = pack.falta[motivo];
  const carta = id ? cartaNoIdioma(id, pack.idioma) : null;
  const dat = datacaoLocalizada(pack, lang);
  return {
    disponivel: false,
    motivo,
    cartaId: id || null,
    cartaNome: carta ? carta.name : null,
    decanato: null,
    planeta: null,
    planetaNome: null,
    signo: null,
    signoNome: null,
    rotulo: null,
    tituloGD: carta ? carta.tituloGD : null,
    chamada: null,
    explicacao: typeof f.texto === 'function' ? f.texto(extra || {}) : f.texto,
    comoResolver: f.comoResolver,
    aRegra: [],
    aConta: null,
    notaDaVolta: null,
    notaDoPrimeiroTerco: null,
    notaAtribuicaoRival: pack.notaAtribuicaoRival(dat),
    notaArmadilhaPtolomeu: pack.notaArmadilhaPtolomeu(dat),
    notaLeituraDoApp: pack.notaLeituraDoApp(dat),
    camadas: camadasDoPack(pack, lang),
    verbatins: verbatinsDoPack(pack, lang),
    conferencia: null,
    fonte: pack.fontes,
  };
}

// ---------------------------------------------------------------------------
// 8. A PORTA DE ENTRADA
// ---------------------------------------------------------------------------
/**
 * POR QUE ESTA CARTA É ESTE DECANATO.
 *
 * `carta` — id, objeto de carta, ou { suit, number }. Ver decanatoDaCarta.
 * `lang`  — 'pt' (default), 'es' ou 'en'. Idioma desconhecido cai no PT.
 *
 * Devolve sempre um objeto com a mesma forma. Com uma das 36 numeradas,
 * `disponivel: true` e { chamada, explicacao, aRegra, aConta, camadas,
 * conferencia } cheios. Com Maior, Ás, corte ou carta desconhecida,
 * `disponivel: false`, `motivo` e `comoResolver` — nunca um encaixe inventado.
 *
 * Campos que a tela usa, na ordem em que ela deveria desenhar:
 *   chamada        → o gancho, vida real, sem nenhum termo técnico
 *   rotulo/tituloGD→ "Marte em Áries" · "Senhor do Domínio"
 *   aRegra         → os quatro passos, já com os valores DESTA carta
 *   aConta         → a contagem que produz o planeta, em uma frase
 *   explicacao     → o texto longo, cinco parágrafos
 *   conferencia    → "36 de 36, conferido agora"
 *   camadas        → as três idades, cada uma com obra, autor e século
 *   notas + fonte  → o rodapé
 */
export function porqueEsteDecanato(carta, lang = 'pt') {
  const pack = packDoIdioma(lang);
  const id = idDaCarta(carta);

  const motivo = motivoDeNaoTerDecanato(id);
  if (motivo) return indisponivel(pack, lang, motivo, id, {});

  const d = DECANATO_POR_CARTA[id];
  if (!d) return indisponivel(pack, lang, 'carta', id, {});

  const doBaralho = cartaNoIdioma(id, pack.idioma);
  const daRegra = rotuloDaRegra(d, pack);

  // A trava desta feature: se a regra e a tabela discordarem, o app NÃO explica
  // um encaixe que não conseguiu conferir. Nunca deve acontecer — o teste
  // compara as 36 nos três idiomas — e é justamente por isso que o caminho
  // existe: o dia em que acontecer, a tela diz que aconteceu.
  if (!doBaralho || doBaralho.astro !== daRegra) {
    return indisponivel(pack, lang, 'divergencia', id, { daRegra, doBaralho: doBaralho ? doBaralho.astro : null });
  }

  const trio = TRIO_DA_MODALIDADE[d.modalidade];
  const signosDoElemento = ZODIACO.filter((s) => ELEMENTO_DO_SIGNO[s] === d.elemento)
    // Na ordem em que os números caminham: cardinal, fixo, mutável.
    .sort((a, b) => ['cardinal', 'fixo', 'mutavel'].indexOf(MODALIDADE_DO_SIGNO[a]) - ['cardinal', 'fixo', 'mutavel'].indexOf(MODALIDADE_DO_SIGNO[b]));

  const c = {
    cartaNome: doBaralho.name,
    naipe: d.naipe,
    naipeNome: pack.naipes[d.naipe],
    elemento: d.elemento,
    elementoNome: pack.elementos[d.elemento],
    signo: d.signo,
    signoNome: pack.signos[d.signo],
    signosDoElemento: signosDoElemento.map((s) => pack.signos[s]),
    modalidade: d.modalidade,
    modalidadeNome: pack.modalidades[d.modalidade],
    numero: d.numero,
    numeroExtenso: pack.numeroExtenso[d.numero],
    trio,
    ordemNoSigno: d.ordemNoSigno,
    ordinal: pack.ordinais[d.ordemNoSigno],
    grauInicio: d.grauInicio,
    grauFim: d.grauFim,
    posicao: d.posicao,
    passos: d.passosDesdeMarte,
    planeta: d.planeta,
    planetaNome: pack.planetas[d.planeta],
    planetaQueAbre: pack.planetas[PLANETA_QUE_ABRE],
    ordemCaldaicaNome: ORDEM_CALDAICA.map((p) => pack.planetas[p]),
    rotulo: daRegra,
    tituloGD: doBaralho.tituloGD,
    vezesDoPlanetaQueAbre: VEZES_POR_PLANETA[PLANETA_QUE_ABRE],
    vezesDosOutros: VEZES_POR_PLANETA[ORDEM_CALDAICA.find((p) => p !== PLANETA_QUE_ABRE)],
    // A datação, já na língua do leitor, via traduzirQuando/traduzirAutor.
    ...datacaoLocalizada(pack, lang),
    // Os dois signos que derrubam a regra bonita do "cada signo abre com o
    // próprio dono" — dado, não opinião.
    touroNome: pack.signos['Touro'],
    gemeosNome: pack.signos['Gêmeos'],
    donoDeTouro: pack.planetas[DOMICILIO_POR_SIGNO['Touro']],
    abreTouro: pack.planetas[DECANATOS.find((x) => x.signo === 'Touro' && x.ordemNoSigno === 1).planeta],
    donoDeGemeos: pack.planetas[DOMICILIO_POR_SIGNO['Gêmeos']],
    abreGemeos: pack.planetas[DECANATOS.find((x) => x.signo === 'Gêmeos' && x.ordemNoSigno === 1).planeta],
    ariesNome: pack.signos['Áries'],
    peixesNome: pack.signos['Peixes'],
    escorpiaoNome: pack.signos['Escorpião'],
    // Quantos dos doze signos abrem com o próprio dono. 📐 São dois, e o texto
    // dos packs lê este número em vez de trazê-lo escrito à mão.
    signosQueAbremComODono: DECANATOS.filter((x) => x.abreComOProprioDono).map((x) => pack.signos[x.signo]),
    conferem: CONFERENCIA.conferem,
    total: CONFERENCIA.total,
  };

  return {
    disponivel: true,
    motivo: null,
    comoResolver: null,

    // ------------------------------------------------------------------
    // A carta e o encaixe, em dado bruto
    // ------------------------------------------------------------------
    cartaId: id,
    cartaNome: doBaralho.name,
    decanato: {
      posicao: d.posicao,
      signo: d.signo,
      signoNome: c.signoNome,
      elemento: d.elemento,
      modalidade: d.modalidade,
      ordemNoSigno: d.ordemNoSigno,
      grauInicio: d.grauInicio,
      grauFim: d.grauFim,
      faixa: pack.faixa(c),
    },
    planeta: d.planeta,
    planetaNome: c.planetaNome,
    signo: d.signo,
    signoNome: c.signoNome,
    rotulo: daRegra,
    tituloGD: doBaralho.tituloGD,

    // ------------------------------------------------------------------
    // BLOCO 1 — o que a tela mostra PRIMEIRO
    // ------------------------------------------------------------------
    chamada: pack.chamada[d.naipe](c),
    explicacao: pack.explicacao(c),

    // ------------------------------------------------------------------
    // A regra, passo a passo, já com os valores desta carta
    // ------------------------------------------------------------------
    aRegra: pack.aRegra.map((p) => ({ titulo: p.titulo, texto: p.texto(c) })),
    aConta: pack.aConta(c),
    notaDaVolta: pack.notaDaVolta(c),
    notaDoPrimeiroTerco: pack.notaDoPrimeiroTerco(c),

    // ------------------------------------------------------------------
    // A conta, exposta — quem quiser conferir, confere
    // ------------------------------------------------------------------
    conferencia: {
      total: CONFERENCIA.total,
      conferem: CONFERENCIA.conferem,
      divergencias: CONFERENCIA.divergencias,
      texto: pack.conferenciaTexto(c),
    },

    // ------------------------------------------------------------------
    // As ressalvas e a fonte, que andam junto com TODA leitura
    // ------------------------------------------------------------------
    camadas: camadasDoPack(pack, lang),
    notaAtribuicaoRival: pack.notaAtribuicaoRival(c),
    notaArmadilhaPtolomeu: pack.notaArmadilhaPtolomeu(c),
    notaLeituraDoApp: pack.notaLeituraDoApp(c),
    verbatins: verbatinsDoPack(pack, lang),
    fonte: pack.fontes,
  };
}

/**
 * A VOLTA INTEIRA — as 36 posições em ordem zodiacal, já localizadas.
 *
 * Para a tela que quiser mostrar a roda em vez de uma carta só: cada item traz
 * `{ posicao, signoNome, faixa, planetaNome, rotulo, cartaId, cartaNome,
 * tituloGD, confere }`. `confere` é a comparação item a item com o baralho —
 * quem desenhar a roda pode marcar em vermelho o que não bater, se um dia não
 * bater.
 *
 * Não recebe carta e não depende de nada do usuário: é a tabela.
 */
export function aVoltaCaldaica(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return DECANATOS.map((d) => {
    const carta = cartaNoIdioma(d.cartaId, pack.idioma);
    const daRegra = rotuloDaRegra(d, pack);
    return {
      posicao: d.posicao,
      signo: d.signo,
      signoNome: pack.signos[d.signo],
      grauInicio: d.grauInicio,
      grauFim: d.grauFim,
      faixa: pack.faixa({ grauInicio: d.grauInicio, grauFim: d.grauFim, signoNome: pack.signos[d.signo] }),
      planeta: d.planeta,
      planetaNome: pack.planetas[d.planeta],
      rotulo: daRegra,
      cartaId: d.cartaId,
      cartaNome: carta ? carta.name : null,
      tituloGD: carta ? carta.tituloGD : null,
      confere: !!carta && carta.astro === daRegra,
    };
  });
}

// As 78 do baralho, para o teste conferir que 36 têm decanato e 42 não têm —
// e que a soma fecha. Exportado porque a conta é conteúdo, não só verificação.
export const CARTAS_DO_BARALHO = TAROT_DECK.length;
