// lib/melotesiaDupla.js
// MELOTESIA DUPLA — as DUAS listas antigas de signo ↔ parte do corpo, lado a
// lado, e o desencontro entre elas.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE, JÁ HAVENDO lib/zodiacBody.js
// ===========================================================================
// `lib/zodiacBody.js` guarda UMA lista: a de Manílio (Astronomica II.453-465,
// séc. I), com o latim verbatim e o locus verso a verso. Ela continua sendo a
// dona desse dado — este módulo IMPORTA de lá e não repete uma linha.
//
// O que falta lá é a segunda tradição. O Sefer Yetzirah (séc. II–VI) também
// distribui partes do corpo pelos doze signos, por um caminho totalmente
// diferente: divide as 22 letras hebraicas em 3 mães, 7 duplas e 12 simples, e
// amarra cada uma das 12 simples a um signo, a um mês e a um órgão (cap. 5).
//
// Duas tradições independentes chegando a mapas DIFERENTES do mesmo corpo é
// mais interessante que uma sozinha — e é a prova viva da proposição 2 da tese
// (docs/tradicao/00-tese.md): a tradição nunca foi uma coisa só, e mostrar a
// discordância é mais forte que escondê-la. A DIVERGÊNCIA é o conteúdo.
//
// ===========================================================================
// A REGRA QUE MANDA AQUI: NÃO FUNDIR
// ===========================================================================
// docs/tradicao/07 §7.5 e docs/tradicao/16 §13 dizem a mesma coisa com todas as
// letras: as duas listas NÃO coincidem, e misturá-las fabricaria uma terceira
// lista que nunca existiu — que é exatamente o erro que a auditoria do Homem
// Zodiacal encontrou nos sites. Por isso, aqui, cada linha tem duas colunas
// rotuladas e nenhuma média entre elas. Nenhuma função deste arquivo devolve
// "a parte do corpo do signo": devolve o que CADA fonte atribuía, com o nome
// da fonte grudado.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string dos packs
// ===========================================================================
// (a mesma disciplina de lib/zodiacBody.js, e aqui ela é mais apertada, porque
// melotesia é o assunto em que alegação de saúde aparece sozinha)
//
// 1. NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita, em nenhum dos três idiomas.
//    Regra de PALAVRA, não de intenção: pt aliviar/acalmar/curar/tratar/sarar/
//    remédio/terapia; es aliviar/calmar/sanar/curar/tratar; en relieve/soothe/
//    calm/heal/cure/treat (e "health", que o \w* de heal já morde). Nenhuma
//    entra. Nada sobre o que a parte do corpo "sente", "precisa" ou como
//    "cuidar" dela. Na dúvida sobre uma frase, a frase cai.
// 2. SEMPRE NO PASSADO, SEMPRE COM DONO. "Manílio atribuía", "o Sefer Yetzirah
//    põe nesta linha" — nunca "o seu ponto fraco é". A pessoa não é informada
//    sobre o corpo dela; ela é informada sobre o que dois textos antigos
//    escreveram.
// 3. PRENDE PRIMEIRO, FONTE DEPOIS. Todo texto longo abre na vida real, em
//    língua de conversa (a tatuagem, a cadeira do escritório, o grupo da
//    família), e só então mostra o recibo. Nunca o contrário.
// 4. O QUE É LEITURA DO APP VEM ROTULADO. "Concordam / vizinhas / divergem" é
//    classificação DESTE APP comparando as duas listas — nenhuma das duas
//    fontes comenta a outra. Ver `notaDaClassificacao`.
// 5. NADA DE PROMESSA NEM DE VEREDITO sobre a vida de quem lê.
//
// test/melotesiaDupla.test.js varre os três packs atrás disso tudo e falha o
// build. É de propósito.
//
// ===========================================================================
// O GRAU DA SEGUNDA FONTE — declarado, não escondido
// ===========================================================================
// A lista de Manílio é `confianca: 'alta'`: texto latino conservado, verso a
// verso conferido na margem impressa (ver lib/zodiacBody.js).
//
// A lista do Sefer Yetzirah é `confianca: 'media'`, e por dois motivos que o
// app diz em voz alta em vez de esconder:
//   · QUAL órgão cai em qual letra VARIA entre as recensões (Curta, Longa,
//     Saadia, Gra/Ari). O que está aqui é a recensão Gra/Ari como a reporta a
//     tradução de Aryeh Kaplan (1990) — uma entre várias, e assim rotulada.
//   · A edição crítica de A. Peter Hayman (Mohr Siebeck, 2004), que é a que
//     decide, NÃO foi consultada por esta base (docs/tradicao/99 §1.1). Isso é
//     BLOQUEIO declarado (ver `BLOQUEIO`), não nota de rodapé.
//
// ===========================================================================
// OS TRÊS IDIOMAS
// ===========================================================================
// Toda prosa vive em lib/traducoes/melotesiaDupla.{pt,es,en}.js, com a MESMA
// forma: mesmas chaves, mesmos campos. O que NUNCA muda entre packs e por isso
// mora aqui, no motor: o latim de Manílio (via zodiacBody), a letra hebraica e
// seu nome, o mês hebraico, os loci, e as CHAVES internas (ids de signo em
// português, como em todo o repositório, porque são dados e não texto de tela).
// As funções públicas têm `lang` com default 'pt'.
//
// A DATAÇÃO passa por lib/traducoes/datacao.js: a OBRA nunca traduz (Sefer
// Yetzirah continua Sefer Yetzirah), o AUTOR ganha a forma consagrada da
// língua, e o século ganha a forma da língua (séc. I d.C. / siglo I d.C. /
// 1st c. AD).

import { ZODIAC_BODY, entryForSign } from './zodiacBody';
import { signoFromDate } from './signs';
import { traduzirQuando, traduzirAutor } from './traducoes/datacao.js';
import { PACK as PACK_PT } from './traducoes/melotesiaDupla.pt.js';
import { PACK as PACK_ES } from './traducoes/melotesiaDupla.es.js';
import { PACK as PACK_EN } from './traducoes/melotesiaDupla.en.js';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma fora dos três cai no PT — mesmo fallback de lib/i18n.js e lib/seita.js.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// 1. NOMES PRÓPRIOS QUE A DATAÇÃO COMPARTILHADA AINDA NÃO CONHECE
// ---------------------------------------------------------------------------
// `traduzirAutor` (lib/traducoes/datacao.js) é o lugar canônico da forma
// consagrada de cada autor, e é onde Manílio deveria estar. Este arquivo NÃO o
// edita: datacao.js é compartilhado com outras frentes e mexer nele destrói o
// trabalho alheio. Então a ordem é: pergunta primeiro ao mapa canônico; só se
// ele devolver o nome intacto é que o complemento local responde. No dia em que
// Manílio entrar lá, o canônico ganha e esta tabela vira redundante sem quebrar
// nada.
const AUTORES_DESTE_MODULO = {
  es: { 'Manílio': 'Manilio' },
  en: { 'Manílio': 'Manilius' },
};

export function autorNaLingua(nome, lang = 'pt') {
  if (!nome) return null;
  const canonico = traduzirAutor(nome, lang);
  if (canonico !== nome) return canonico;
  const local = AUTORES_DESTE_MODULO[lang];
  return (local && local[nome]) || nome;
}

// ---------------------------------------------------------------------------
// 2. AS DUAS DATAÇÕES, EM FORMA CANÔNICA PT (traduzidas na saída)
// ---------------------------------------------------------------------------
export const QUANDO_MANILIO = 'séc. I d.C.';
export const QUANDO_SEFER = 'séc. II–VI d.C.';

// ---------------------------------------------------------------------------
// 3. A SEGUNDA LISTA — Sefer Yetzirah, cap. 5
// ---------------------------------------------------------------------------
// As 12 letras SIMPLES, cada uma amarrada a um signo, a um mês do calendário
// hebraico e a um órgão. A fórmula do capítulo é sempre a mesma tríade — "no
// universo, no ano, no corpo".
//
// `orgao` é CHAVE, não texto: o nome do órgão em cada língua vive nos packs.
// `letra`, `letraHebraica` e `mes` são dados e não se traduzem.
// `confianca: 'media'` em TODAS as entradas, e não é modéstia de fachada — ver
// o bloco "O GRAU DA SEGUNDA FONTE" no cabeçalho e `BLOQUEIO` mais abaixo.
export const RECENSAO_SEFER = 'Gra/Ari';
// A OBRA não traduz — "Sefer Yetzirah" é Sefer Yetzirah nos três idiomas. O que
// traduz é a abreviação do CAPÍTULO ("cap." / "ch."), que é ponteiro e não
// título: por isso o locus é composto com o rótulo do pack, em locusSefer().
export const OBRA_SEFER = 'Sefer Yetzirah';
export const CAPITULO_SEFER = 5;

function locusSefer(pack) {
  return `${OBRA_SEFER}, ${pack.rotulos.capitulo} ${CAPITULO_SEFER}`;
}

export const SEFER_YETZIRAH = [
  { id: 'aries', letra: 'Heh', letraHebraica: 'ה', mes: 'Nissan', orgao: 'peDireito', tipo: 'membro' },
  { id: 'touro', letra: 'Vav', letraHebraica: 'ו', mes: 'Iyar', orgao: 'rimDireito', tipo: 'viscera' },
  { id: 'gemeos', letra: 'Zayin', letraHebraica: 'ז', mes: 'Sivan', orgao: 'peEsquerdo', tipo: 'membro' },
  { id: 'cancer', letra: 'Chet', letraHebraica: 'ח', mes: 'Tamuz', orgao: 'maoDireita', tipo: 'membro' },
  { id: 'leao', letra: 'Tet', letraHebraica: 'ט', mes: 'Av', orgao: 'rimEsquerdo', tipo: 'viscera' },
  { id: 'virgem', letra: 'Yod', letraHebraica: 'י', mes: 'Elul', orgao: 'maoEsquerda', tipo: 'membro' },
  { id: 'libra', letra: 'Lamed', letraHebraica: 'ל', mes: 'Tishrei', orgao: 'vesicula', tipo: 'viscera' },
  { id: 'escorpiao', letra: 'Nun', letraHebraica: 'נ', mes: 'Cheshvan', orgao: 'intestino', tipo: 'viscera' },
  { id: 'sagitario', letra: 'Samekh', letraHebraica: 'ס', mes: 'Kislev', orgao: 'estomago', tipo: 'viscera' },
  { id: 'capricornio', letra: 'Ayin', letraHebraica: 'ע', mes: 'Tevet', orgao: 'figado', tipo: 'viscera' },
  { id: 'aquario', letra: 'Tzadi', letraHebraica: 'צ', mes: 'Shevat', orgao: 'korkeban', tipo: 'viscera' },
  { id: 'peixes', letra: 'Qof', letraHebraica: 'ק', mes: 'Adar', orgao: 'baco', tipo: 'viscera' },
];

// ---------------------------------------------------------------------------
// 4. A PRIMEIRA LISTA, CLASSIFICADA — e a classificação é LEITURA DO APP
// ---------------------------------------------------------------------------
// Manílio dá o verso latino e a parte; ele não classifica nada. Dizer que
// "cabeça" é superfície e "braços" é membro é leitura deste app sobre o texto
// dele — leitura trivial, verificável por qualquer um que leia a lista, mas
// leitura. Vem rotulada em `notaDaClassificacao`.
//
// `superficie` = região da superfície do tronco ou da cabeça · `membro` = braço
// ou perna · `viscera` = órgão de dentro. O achado que sai daqui está em
// `contagem()`: Manílio não tem NENHUMA víscera e o Sefer Yetzirah não tem
// NENHUMA superfície.
const TIPO_MANILIO = {
  aries: 'superficie',
  touro: 'superficie',
  gemeos: 'membro',
  cancer: 'superficie',
  leao: 'superficie',
  virgem: 'superficie',
  libra: 'superficie',
  escorpiao: 'superficie',
  sagitario: 'membro',
  capricornio: 'membro',
  aquario: 'membro',
  peixes: 'membro',
};

// ---------------------------------------------------------------------------
// 5. A RELAÇÃO ENTRE AS DUAS COLUNAS — leitura do app, e a mais importante
// ---------------------------------------------------------------------------
// 'concordam' — as duas fontes nomeiam a MESMA parte. Não acontece nenhuma vez,
//               e esse zero é o conteúdo desta feature. O valor existe no
//               vocabulário justamente para que a contagem possa dizer zero.
// 'vizinhas'  — as duas partes ficam na mesma região do corpo, sem serem a
//               mesma. Dois casos, e nenhum dos dois é acordo: é proximidade
//               anatômica lida pelo app.
// 'divergem'  — regiões diferentes do corpo. Dez casos.
export const RELACOES = ['concordam', 'vizinhas', 'divergem'];
export const TIPOS = ['superficie', 'membro', 'viscera'];

const RELACAO = {
  aries: 'divergem',
  touro: 'divergem',
  gemeos: 'divergem',
  cancer: 'divergem',
  // O rim fica no flanco, e "latera" é justamente o flanco. Mesma região,
  // partes diferentes — um por fora, outro por dentro.
  leao: 'vizinhas',
  virgem: 'divergem',
  libra: 'divergem',
  // Virilha e intestino delgado ficam os dois no baixo-ventre.
  escorpiao: 'vizinhas',
  sagitario: 'divergem',
  capricornio: 'divergem',
  aquario: 'divergem',
  peixes: 'divergem',
};

// Áries é o caso extremo e vale marcar: a lista latina abre o corpo pela
// cabeça, a hebraica abre pelo pé direito. As duas pontas, no mesmo signo.
const EXTREMOS = { aries: true };

// ---------------------------------------------------------------------------
// 6. AS DOZE LINHAS, MONTADAS
// ---------------------------------------------------------------------------
// Uma linha por signo, com a coluna de Manílio vindo INTEIRA de
// lib/zodiacBody.js (nada de latim copiado aqui) e a coluna do Sefer Yetzirah
// vindo de SEFER_YETZIRAH.
export const MELOTESIA_DUPLA = ZODIAC_BODY.map((entrada) => {
  const sefer = SEFER_YETZIRAH.find((s) => s.id === entrada.id) || null;
  return {
    id: entrada.id,
    signo: entrada.sign,
    emoji: entrada.emoji,
    manilio: {
      latim: entrada.latin,
      locus: entrada.locus,
      lateLayer: entrada.lateLayer,
      tipo: TIPO_MANILIO[entrada.id],
      confianca: entrada.confidence,
    },
    sefer: sefer
      ? {
          letra: sefer.letra,
          letraHebraica: sefer.letraHebraica,
          mes: sefer.mes,
          orgao: sefer.orgao,
          tipo: sefer.tipo,
          obra: OBRA_SEFER,
          capitulo: CAPITULO_SEFER,
          recensao: RECENSAO_SEFER,
          confianca: 'media',
        }
      : null,
    relacao: RELACAO[entrada.id],
    extremos: EXTREMOS[entrada.id] === true,
    // Duas partes de mesma natureza (dois membros, duas vísceras) ainda que
    // sejam partes diferentes. Só Gêmeos: braços de um lado, pé esquerdo do
    // outro.
    mesmoTipo: sefer ? TIPO_MANILIO[entrada.id] === sefer.tipo : false,
  };
});

const POR_ID = MELOTESIA_DUPLA.reduce((acc, l) => {
  acc[l.id] = l;
  return acc;
}, {});

// Sanidade: a lista dupla tem que cobrir os doze de lib/zodiacBody.js, na
// ordem, e cada linha tem que ter as duas colunas. Se alguém acrescentar um
// signo lá e esquecer daqui, isto vira `false` e o teste quebra o build — em
// vez de a tela mostrar meia linha.
export function cobreOsDoze() {
  return (
    MELOTESIA_DUPLA.length === ZODIAC_BODY.length &&
    MELOTESIA_DUPLA.every((l, i) => l.id === ZODIAC_BODY[i].id && l.sefer !== null && RELACOES.includes(l.relacao))
  );
}

// ---------------------------------------------------------------------------
// 7. A CONTA DA DIVERGÊNCIA — aritmética, conferível linha a linha
// ---------------------------------------------------------------------------
// Nada aqui é opinião: é contagem sobre as duas listas. O número que interessa
// é `concordam: 0`, e os dois que explicam a forma do desencontro são
// `manilioViscera: 0` e `seferSuperficie: 0` — um mapa é de fora, o outro é de
// dentro.
export function contagem() {
  const c = {
    total: MELOTESIA_DUPLA.length,
    concordam: 0,
    vizinhas: 0,
    divergem: 0,
    mesmoTipo: 0,
    manilioSuperficie: 0,
    manilioMembro: 0,
    manilioViscera: 0,
    seferSuperficie: 0,
    seferMembro: 0,
    seferViscera: 0,
  };
  const caixa = { superficie: 'Superficie', membro: 'Membro', viscera: 'Viscera' };
  for (const l of MELOTESIA_DUPLA) {
    c[l.relacao] += 1;
    if (l.mesmoTipo) c.mesmoTipo += 1;
    c[`manilio${caixa[l.manilio.tipo]}`] += 1;
    if (l.sefer) c[`sefer${caixa[l.sefer.tipo]}`] += 1;
  }
  return c;
}

// ---------------------------------------------------------------------------
// 8. A BIBLIOGRAFIA — datação pela língua, obra intacta
// ---------------------------------------------------------------------------
// `obra` NUNCA traduz. `autor` passa por autorNaLingua. `quando` passa por
// traduzirQuando. A prosa de cada linha (o que aquela obra é e por que está
// aqui) vive nos packs, em `notasDeFonte`.
export const FONTES_BASE = [
  { id: 'manilio', obra: 'Astronomica II.453-465', autor: 'Manílio', quando: QUANDO_MANILIO },
  { id: 'sefer', obra: OBRA_SEFER, capitulo: CAPITULO_SEFER, autor: null, quando: QUANDO_SEFER },
  { id: 'hayman', obra: 'Sefer Yesira: Edition, Translation and Text-Critical Commentary', autor: 'A. Peter Hayman', quando: '2004' },
  { id: 'kaplan', obra: 'Sefer Yetzirah: The Book of Creation', autor: 'Aryeh Kaplan', quando: '1990' },
  { id: 'westcott', obra: 'Sepher Yetzirah', autor: 'W. Wynn Westcott', quando: '1887' },
  { id: 'ptolomeu', obra: 'Tetrabiblos III.xvii', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
];

export function fontes(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return FONTES_BASE.map((f) => {
    const autor = f.autor ? `${autorNaLingua(f.autor, lang)}, ` : '';
    // Só o ponteiro de capítulo fala a língua; o título fica como está.
    const obra = f.capitulo ? `${f.obra}, ${pack.rotulos.capitulo} ${f.capitulo}` : f.obra;
    const datado = `${obra} — ${autor}${traduzirQuando(f.quando, lang)}`;
    // "séc. I d.C." já termina em ponto; "1990" não. Sem isto, metade das
    // linhas sai com ponto duplo em pt e es.
    return `${datado}${datado.endsWith('.') ? ' ' : '. '}${pack.notasDeFonte[f.id]}`;
  });
}

// A bibliografia em PT, para quem importar o motor sem passar idioma.
export const FONTES = fontes('pt');

// ---------------------------------------------------------------------------
// 9. O BLOQUEIO, E O QUE A PESQUISA NÃO ACHOU
// ---------------------------------------------------------------------------
// `BLOQUEIO` não é uma nota de rodapé: é a condição que docs/tradicao/16 §13
// põe por escrito para esta feature ("conferir na edição crítica de Hayman
// antes de publicar"). Enquanto `resolvido` for false, toda leitura devolvida
// por este módulo carrega o campo `bloqueio` preenchido, e a tela mostra.
// Apagar o campo sem consultar Hayman é o bug.
export const BLOQUEIO = {
  id: 'edicaoCriticaDeHayman',
  resolvido: false,
  obra: 'A. Peter Hayman, Sefer Yesira: Edition, Translation and Text-Critical Commentary, Mohr Siebeck, 2004',
  texto:
    'A coluna do Sefer Yetzirah chegou a esta base por relato de fonte secundária da recensão Gra/Ari, e não pela edição crítica que decide entre os manuscritos (Hayman, Mohr Siebeck, 2004 — 19+ manuscritos). A ordem dos órgãos varia entre as recensões, exatamente como varia a atribuição planeta↔letra do cap. 4, que a mesma base já registra como disputada. Enquanto Hayman não for consultado, a coluna hebraica anda com confiança média declarada na tela, e as versões vitorianas (Westcott, 1887) NÃO são a base — são o que a bibliografia manda evitar.',
};

export const NAO_ACHADO = [
  {
    id: 'recensaoUnica',
    texto:
      'Uma recensão do Sefer Yetzirah que possa ser chamada de "a" recensão. São pelo menos três famílias antigas (Curta, Longa e a de Saadia Gaon), mais a Gra/Ari, e elas divergem entre si na distribuição das letras. O app declara qual usou (Gra/Ari) em vez de escrever a lista como se fosse única — o mesmo cuidado que a base já exige para a tabela planeta↔letra do cap. 4.',
  },
  {
    id: 'contatoEntreAsListas',
    texto:
      'Qualquer texto antigo ligando a lista de Manílio à do Sefer Yetzirah — nos dois sentidos. Manílio escreve no séc. I, o Sefer Yetzirah é datado entre os séc. II e VI, e não foi achada linha nenhuma em que um cite o outro ou dependa do outro. Por isso o app diz "duas listas independentes" e não diz que uma corrigiu, copiou ou reagiu à outra.',
  },
  {
    id: 'razaoDoPeDireito',
    texto:
      'A razão pela qual o Sefer Yetzirah começa Áries no pé direito, e não na cabeça. A lista latina desce pelo corpo na ordem do zodíaco e a hebraica não desce por lugar nenhum: a sequência dela é a ordem das letras. Nenhum texto antigo desta base explica a escolha, e o app não inventa uma explicação bonita para ela.',
  },
  {
    id: 'traducaoDeKorkeban',
    texto:
      'Uma tradução estável de korkeban (קורקבן). As versões correntes oscilam entre moela, papo e esôfago, e nenhuma delas é consenso. A palavra fica sem traduzir nos três idiomas, com a oscilação dita na tela — inventar um órgão para fechar a lista seria fabricar o que a fonte não fixa.',
  },
  {
    id: 'datacaoDoSefer',
    texto:
      'Uma datação consensual do Sefer Yetzirah. Séc. II a VI é o intervalo que a literatura sustenta, e ele é disputado. A atribuição a Abraão é pseudepigrafia interna do próprio texto, do mesmo gênero de Nechepso e Petosiris na astrologia helenística — e o app diz isso em vez de repetir "quatro mil anos".',
  },
  {
    id: 'orgaoNaListaLatina',
    texto:
      'Qualquer víscera na lista de Manílio. Não há nenhuma: as doze entradas dele são superfície do tronco, cabeça e membros. O coração de Leão e o estômago de Câncer, que o mercado apresenta como antigos, não estão lá — lib/zodiacBody.js já marca essas duas com lateLayer, e este módulo repete o aviso na linha do signo em vez de deixá-lo só na outra tela.',
  },
];

// ---------------------------------------------------------------------------
// 10. VALIDAÇÃO DE DATA — a mesma trava de lib/signs.js e lib/seita.js
// ---------------------------------------------------------------------------
// Rejeita formato errado E data impossível ("2023-02-29" fora de bissexto), que
// o construtor Date aceitaria em silêncio rolando pro mês seguinte.
function dataValida(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return false;
  const d = new Date(dateStr + 'T00:00');
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === +m[1] && d.getMonth() + 1 === +m[2] && d.getDate() === +m[3];
}

function horaValida(timeStr) {
  if (typeof timeStr !== 'string') return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!m) return false;
  return +m[1] <= 23 && +m[2] <= 59;
}

// ---------------------------------------------------------------------------
// 11. UMA LINHA, PRONTA PARA A TELA
// ---------------------------------------------------------------------------
// Entrada pelo id ('aries') OU pelo nome do signo em português, com ou sem
// acento e em qualquer caixa ('Áries', 'aries', 'ARIES', 'Gemeos'). Mesmo
// critério de nomeCanonicoDePlaneta em lib/seita.js: as chaves são dados, e
// dado em português é o que o repositório inteiro usa.
const COMBINANTES = /[̀-ͯ]/g;

function semAcento(s) {
  return String(s).normalize('NFD').replace(COMBINANTES, '').toLowerCase().trim();
}

const POR_APELIDO = {};
for (const l of MELOTESIA_DUPLA) {
  POR_APELIDO[semAcento(l.id)] = l;
  POR_APELIDO[semAcento(l.signo)] = l;
}

export function linhaDoSigno(signo) {
  if (!signo || typeof signo !== 'string') return null;
  const direto = entryForSign(signo);
  if (direto) return POR_ID[direto.id] || null;
  return POR_APELIDO[semAcento(signo)] || null;
}

// O recibo é montado AQUI, e não nos packs, porque cada peça dele tem regra
// própria: obra e locus não traduzem, o autor ganha a forma consagrada da
// língua, o século ganha a forma da língua, e o latim é verbatim. Nos packs
// ficam só os rótulos ("verso latino", "letra", "mês de", "recensão").
function reciboDaLinha(linha, pack, lang) {
  const r = pack.rotulos;
  const manilio =
    `${autorNaLingua('Manílio', lang)}, ${linha.manilio.locus} (${traduzirQuando(QUANDO_MANILIO, lang)}) — ` +
    `${r.verso}: "${linha.manilio.latim}".`;
  const sefer =
    `${locusSefer(pack)} (${traduzirQuando(QUANDO_SEFER, lang)}) — ` +
    `${r.letra} ${linha.sefer.letra} (${linha.sefer.letraHebraica}), ${r.mes} ${linha.sefer.mes}, ` +
    `${r.recensao} ${linha.sefer.recensao}.`;
  return `${manilio} ${sefer}`;
}

/**
 * O PAR DE UM SIGNO — as duas colunas, lado a lado, prontas para render.
 *
 * `signo` — id do signo ('aries') OU o nome em português ('Áries', 'aries',
 *           'ARIES'), que é o mesmo de SIGNS em lib/signs.js. As chaves são
 *           dados e continuam em PT nos três idiomas.
 * `lang`  — 'pt' (default), 'es' ou 'en'.
 *
 * Devolve o objeto da linha com prosa e recibo, ou null se o signo não existir
 * — nunca um chute.
 */
export function parDeSigno(signo, lang = 'pt') {
  const pack = packDoIdioma(lang);
  const linha = linhaDoSigno(signo);
  if (!linha) return null;

  const s = pack.signos[linha.id];
  return {
    disponivel: true,
    id: linha.id,
    signo: linha.signo,
    signoNome: s.nome,
    emoji: linha.emoji,

    // ------------------------------------------------------------------
    // As duas colunas. Rotuladas, nunca somadas.
    // ------------------------------------------------------------------
    manilio: {
      tradicao: pack.rotulos.manilio,
      parte: s.parte,
      latim: linha.manilio.latim,
      locus: linha.manilio.locus,
      autor: autorNaLingua('Manílio', lang),
      quando: traduzirQuando(QUANDO_MANILIO, lang),
      tipo: linha.manilio.tipo,
      tipoNome: pack.tipos[linha.manilio.tipo],
      confianca: linha.manilio.confianca,
      // Só Câncer e Leão: a versão POPULAR da entrada (estômago, coração) é
      // dedução posterior, não o que Manílio escreveu.
      camadaTardia: linha.manilio.lateLayer ? pack.camadaTardia[linha.id] : null,
    },
    sefer: {
      tradicao: pack.rotulos.sefer,
      orgao: pack.orgaos[linha.sefer.orgao],
      letra: linha.sefer.letra,
      letraHebraica: linha.sefer.letraHebraica,
      mes: linha.sefer.mes,
      locus: locusSefer(pack),
      recensao: linha.sefer.recensao,
      quando: traduzirQuando(QUANDO_SEFER, lang),
      tipo: linha.sefer.tipo,
      tipoNome: pack.tipos[linha.sefer.tipo],
      confianca: linha.sefer.confianca,
      // A palavra que não tem tradução estável fica sem tradução, e o app diz
      // por quê. Só Aquário.
      notaDaPalavra: linha.sefer.orgao === 'korkeban' ? pack.notaKorkeban : null,
    },

    // ------------------------------------------------------------------
    // A relação — leitura do app, e vem com a etiqueta disso
    // ------------------------------------------------------------------
    relacao: linha.relacao,
    relacaoNome: pack.relacoes[linha.relacao],
    mesmoTipo: linha.mesmoTipo,
    extremos: linha.extremos,

    // ------------------------------------------------------------------
    // A prosa: prende primeiro, recibo depois
    // ------------------------------------------------------------------
    abertura: s.abertura,
    leitura: s.leitura,
    recibo: reciboDaLinha(linha, pack, lang),

    // ------------------------------------------------------------------
    // As ressalvas que andam junto com TODA leitura
    // ------------------------------------------------------------------
    notaDaClassificacao: pack.notaDaClassificacao,
    notaNaoFundir: pack.notaNaoFundir,
    notaLeituraDoApp: pack.notaLeituraDoApp,
    bloqueio: BLOQUEIO.resolvido ? null : pack.bloqueio,
    fonte: fontes(lang),
  };
}

// ---------------------------------------------------------------------------
// 12. A TELA INTEIRA — as doze linhas e a conta
// ---------------------------------------------------------------------------
/**
 * `lang` — 'pt' (default), 'es' ou 'en'.
 *
 * Devolve { chamada, explicacao, pares[12], contagem, estrutura, ... }. Não
 * depende de céu, de hora nem de cidade: é conteúdo, e responde sempre.
 */
export function melotesiaDupla(lang = 'pt') {
  const pack = packDoIdioma(lang);
  const c = contagem();
  return {
    disponivel: true,
    // Vida real primeiro. A fonte aparece só a partir do terceiro parágrafo da
    // explicação.
    chamada: pack.chamada,
    explicacao: pack.explicacao,

    pares: MELOTESIA_DUPLA.map((l) => parDeSigno(l.id, lang)),

    // A aritmética exposta — quem quiser conferir, confere linha a linha.
    contagem: c,
    estrutura: pack.estrutura(c),

    notaDaClassificacao: pack.notaDaClassificacao,
    notaNaoFundir: pack.notaNaoFundir,
    notaLeituraDoApp: pack.notaLeituraDoApp,
    notaKorkeban: pack.notaKorkeban,
    bloqueio: BLOQUEIO.resolvido ? null : pack.bloqueio,
    fonte: fontes(lang),
  };
}

// ---------------------------------------------------------------------------
// 13. O PAR DO SIGNO DE QUEM ESTÁ LENDO — sem fabricar céu
// ---------------------------------------------------------------------------
// O signo solar sai de signoFromDate (lib/signs.js), que é longitude eclíptica
// real e não tabela de calendário. HORA e CIDADE são OPCIONAIS aqui, e essa é
// uma diferença de natureza em relação a lib/seita.js: sem hora, signoFromDate
// lê o meio-dia, que é o instante que menos erra dentro do dia. Isso é palpite
// honesto para o signo solar (o Sol anda ~1°/dia) e seria cara-ou-coroa para a
// seita — por isso lá a hora é obrigatória e aqui não é.
//
// Mas quem nasceu na virada de um signo PODE receber o vizinho quando a hora
// falta. O app não esconde: devolve `precisao` e a nota que diz isso.
function indisponivel(pack, motivo) {
  const f = pack.falta[motivo];
  return {
    disponivel: false,
    motivo,
    falta: [motivo],
    comoResolver: f.comoResolver,
    explicacao: f.texto,
    par: null,
    signo: null,
    precisao: null,
    notaPrecisao: null,
    bloqueio: BLOQUEIO.resolvido ? null : pack.bloqueio,
    fonte: fontes(pack.idioma),
  };
}

/**
 * `data`   — 'YYYY-MM-DD'. Obrigatória.
 * `hora`   — 'HH:MM' de parede, ou null. OPCIONAL.
 * `cidade` — objeto de lib/cities.js ({ lat, lon, timezone, utcOffset }), ou
 *            null. OPCIONAL — serve só para o fuso da hora informada.
 * `lang`   — 'pt' (default), 'es' ou 'en'.
 *
 * getAnyBirthData (lib/birthData.js) devolve { date, time (pode ser null),
 * city (pode ser null) } — os três campos entram aqui direto, nessa ordem.
 */
export function parDoNascimento(data, hora, cidade, lang = 'pt') {
  const pack = packDoIdioma(lang);
  if (!dataValida(data)) return indisponivel(pack, 'data');

  const temHora = horaValida(hora);
  const temCidade = !!(cidade && typeof cidade.lat === 'number' && typeof cidade.lon === 'number');
  const signo = signoFromDate(data, temHora ? hora : null, temCidade ? cidade : undefined);
  if (!signo) return indisponivel(pack, 'efemeride');

  const par = parDeSigno(signo, lang);
  if (!par) return indisponivel(pack, 'efemeride');

  const precisao = temHora && temCidade ? 'instante' : temHora ? 'semCidade' : 'meiaDia';
  return {
    disponivel: true,
    motivo: null,
    falta: [],
    comoResolver: null,
    explicacao: null,
    par,
    signo,
    precisao,
    notaPrecisao: precisao === 'instante' ? null : pack.precisao[precisao],
    bloqueio: BLOQUEIO.resolvido ? null : pack.bloqueio,
    fonte: fontes(lang),
  };
}
