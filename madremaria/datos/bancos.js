// datos/bancos.js
// OS TRES BANCOS QUE DAO VOLUME AO ANO: reflexoes, afirmacoes e contencoes.
//
// O motor do dia mora em lib/plano.js e lib/rituaisRotativos.js; a copy de tela
// mora em datos/textos.js. Este arquivo so tem material e os seletores que dizem
// QUAL material cai hoje. Mesma divisao de datos/ritual.js e datos/plano.js.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE, SE datos/plano.js JA TEM REFLEXOES E AFIRMACOES
// ===========================================================================
// As de datos/plano.js sao SETE reflexoes e ONZE afirmacoes: um catalogo curto,
// dimensionado para o plano diario girar sem estado. Isso resolve a semana e nao
// resolve o ano — em 365 dias a mesma afirmacao voltaria 33 vezes.
// Este arquivo e o banco grande, e traz a coisa que o pequeno nao tem: a marca
// de LUNACAO. Uma pergunta de "nomear o que foi" (lunacao 1) nao serve na
// lunacao 9, quando o tema e "o que eu quero, dito sem citar ninguem".
// Os dois convivem de proposito e nenhum sobrescreve o outro.
//
// ===========================================================================
// A GARANTIA — nada se repete dentro de uma mesma lunacao
// ===========================================================================
// O mes sinodico mede 29,530588 dias e varia de ~29,27 a ~29,83. Um intervalo de
// 29,83 dias corridos toca, no pior caso, 31 dias civis distintos. Entao dois
// dias quaisquer da MESMA lunacao estao a no maximo 30 de distancia na contagem
// continua de dias.
//
// O indice de cada banco e (a * n + b) mod P, com n = dias desde a epoca,
// P = tamanho do bolo e mdc(a, P) = 1. Dois dias colidem quando
// a * (n1 - n2) === 0 (mod P); com `a` coprimo com P isso exige P dividir
// (n1 - n2), ou seja |n1 - n2| >= P. Basta P >= 31 e a colisao fica impossivel
// dentro de uma lunacao. A garantia inteira repousa nessa unica desigualdade:
//
//     maior distancia dentro de uma lunacao (30)  <  menor bolo (31)
//
// Por isso os tres bancos tem tamanho minimo 31 — inclusive as contencoes, que o
// briefing pedia "~20". Vinte gestos em trinta dias repetem por casa de pombos,
// e nenhuma aritmetica conserta isso. Ou o bolo passa de 31 ou a garantia e falsa.
//
// Zero Math.random, zero leitura de storage, zero chave nova em
// CLAVES_HILO_ROJO. Os tres seletores sao funcoes puras da data — testaveis sem
// mock e auditaveis a olho.
//
// ===========================================================================
// O PRECO QUE ESTA ARITMETICA PAGA, DE OLHO ABERTO
// ===========================================================================
// Com `a` e `b` fixos por bolo, a sequencia tem periodo exatamente P: o dia n e o
// dia n+P entregam o mesmo item E os mesmos vizinhos. A tentacao e trocar o
// multiplicador a cada passada (como faz o baralho de 78) para quebrar a
// adjacencia. Nao se faz aqui: na virada de passada os dois multiplicadores
// convivem dentro da mesma janela de 30 dias e a prova acima deixa de valer
// exatamente ali. Seria trocar um bug real de repeticao por um ganho cosmetico
// invisivel a 31 dias de distancia. Fica o periodo fixo, escrito.
//
// ===========================================================================
// AS LINHAS QUE NENHUM TEXTO DAQUI ATRAVESSA
// ===========================================================================
// 1. Nenhuma promessa de desfecho. Nenhuma frase diz o que a outra pessoa faz,
//    sente ou decide — ela nunca e sujeito de verbo em lugar nenhum deste arquivo.
// 2. Nenhum texto depende do ceu. Sem efemeride o dia continua inteiro: a
//    lunacao entra como MARCA de tema, e quando o chamador nao sabe qual e, o
//    seletor cai no bolo inteiro em vez de devolver nada.
// 3. Nenhuma contencao proibe. Toda contencao e convite reversivel e sobre ELA:
//    "se vier a vontade de mandar, escreve aqui primeiro". Nunca "nao mande",
//    nunca uma consequencia descrita caso ela mande, e nunca a insinuacao de que
//    nao mandar age sobre alguem.
// 4. Nenhuma afirmacao fala da outra pessoa, promete desfecho ou alega saude.
// 5. Nenhum texto pune falta. O banco nao sabe se ela veio ontem e nao pergunta.

/* =================================================================================
 * OS OUTROS DOIS IDIOMAS — consulta por id, e o indice continua aqui
 * =================================================================================
 * O espanhol mora em datos/bancos.es.js e o ingles em datos/bancos.en.js, os dois
 * como MAPA `id -> texto` e nada mais. Nao sao listas paralelas, de proposito:
 *
 *   "Filtra preservando a ordem do array — a ordem e parte do indice, e reordenar
 *    REFLEXOES troca a reflexao de todos os dias passados de uma vez."
 *
 * Tres listas na mesma ordem seriam tres chances de divergir, e a divergencia
 * seria SILENCIOSA: a espanhola veria a pergunta de outro dia sem erro nenhum na
 * tela. Com mapa por id, a rotacao e sempre a do portugues e traduzir nao pode
 * mudar qual item cai hoje — o unico jeito de a traducao entrar errada e o texto
 * estar errado, que e uma coisa que se LE.
 *
 * `lunacoes` e `forma` tambem nao se duplicam la: sao etiquetas de encaixe e de
 * verificacao (`verificarBancos` mede exclusivas por lunacao e teto de forma), e
 * duas versoes da mesma verdade e um bug esperando data.
 *
 * Import estatico, como em datos/textos.js: o Metro precisa ver as tres pontas em
 * tempo de build, e `await import()` aqui tornaria os seletores assincronos.
 *
 * O IDIOMA ATIVO VEM DO ESPELHO DE MODULO de datos/textos.js — o mesmo que t()
 * le. Nao ha segundo estado de idioma: se houvesse, a tela poderia mostrar rotulo
 * em ingles e pergunta em portugues depois de uma troca.
 * ================================================================================= */
import { idiomaMadre } from './textos.js';
import { BANCOS_ES } from './bancos.es.js';
import { BANCOS_EN } from './bancos.en.js';

const TRADUCOES = { es: BANCOS_ES, en: BANCOS_EN };

/** O texto de um item no idioma ativo. Fallback honesto em duas etapas, igual ao
 *  de t(): idioma ativo -> PORTUGUES do proprio item -> nada inventado.
 *  String vazia NAO cai no fallback (mesmo critério de valorDe() em textos.js):
 *  ela e defeito de traducao e tem de aparecer como tal, nao se esconder atras do
 *  portugues e fazer a tradutora concluir que o arquivo dela nao salvou. */
export function textoDoBanco(item) {
  if (!item || typeof item.id !== 'string') return item;
  const dict = TRADUCOES[idiomaMadre()];
  if (!dict) return item;
  const traduzido = dict[item.id];
  if (traduzido === undefined || traduzido === null) return item;
  return { ...item, texto: traduzido };
}

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * OS LIMITES DO ARCO
 *
 * TREZE lunacoes, numeradas de 1 a 13 na ordem dos temas do ano. O numero e a
 * unica coisa que este arquivo sabe sobre o tema — o titulo, a pergunta e a copy
 * do tema moram em datos/textos.js. Aqui a lunacao e so uma etiqueta de encaixe.
 * ================================================================================= */
export const LUNACAO_MIN = 1;
export const LUNACAO_MAX = 13;
export const TOTAL_LUNACOES = LUNACAO_MAX - LUNACAO_MIN + 1;

/* AS DUAS LUNACOES QUE NAO PEDEM MATERIAL NOVO.
 *
 * A 12 e ARQUIVO e a 13 e DEVOLUCAO: as duas trabalham com o que ELA ja escreveu.
 * lib/ano.js grava isso em bandeira propria — `apenasIndice: true` no tema 12,
 * `devolveVerbatimDe: 1` no tema 13 — e o fecho da lunacao 11 promete na tela que
 * "as duas seguintes trabalham com o que você já escreveu".
 *
 * ESTE ARQUIVO NAO SABE DISSO SOZINHO, e por isso a lista esta aqui. Os bolos das
 * lunacoes 12 e 13 existem e sao grandes (55 e 46 perguntas), porque o piso de 31
 * vale para as treze e porque a tela precisa de material se a pessoa nao escreveu
 * nada no ano — mas eles sao a SEGUNDA opcao, nunca a primeira. Quem monta o dia
 * nessas duas lunacoes abre uma entrada antiga com a data; so quando nao ha
 * nenhuma e que cai numa pergunta destes bancos.
 *
 * A INVERSAO E O BUG, e ele e silencioso: sem esta lista, a lunacao 12 pergunta
 * "por onde você começaria" (uma pergunta da lunacao 1) em vez de MOSTRAR o que
 * ela escreveu na lunacao 1. O app vira entrevistador no mes em que prometeu ser
 * indice, e nada na tela denuncia. test/ano.test.js confere esta lista contra as
 * bandeiras de lib/ano.js. */
export const LUNACOES_DE_ARQUIVO = Object.freeze([12, 13]);

/** true quando a lunacao trabalha material ja escrito por ela (12 e 13). Quem
 *  monta o dia consulta isto ANTES de pedir `reflexaoDoDia`. */
export function ehLunacaoDeArquivo(lunacao) {
  return LUNACOES_DE_ARQUIVO.includes(lunacao);
}

/** Maior numero de dias civis distintos que uma unica lunacao pode tocar (29,83
 *  dias corridos cabem em 31 datas). E o piso de tamanho dos tres bancos. */
export const DIAS_CIVIS_POR_LUNACAO = 31;

/* Etiquetas reaproveitadas. Sao arrays compartilhados e congelados: escrever a
 * mesma lista treze vezes so aumentaria a chance de uma delas sair diferente das
 * outras sem ninguem perceber. */
const SEMPRE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/* =================================================================================
 * 1. REFLEXOES — o que ela responde por escrito.
 *
 * Forma: { id, texto, lunacoes: [] }
 *
 * `lunacoes` e a lista de temas em que aquela pergunta CABE. Lista cheia com as
 * treze (SEMPRE) quer dizer "esta pergunta e sobre o dia dela, e o dia dela
 * existe em qualquer tema". Lista curta quer dizer "so aqui" — e a lista curta e
 * a parte que importa: e ela que impede uma pergunta de nomear o rompimento de
 * cair na lunacao 9, onde o assunto e o que ela quer sem citar ninguem.
 *
 * As trinta primeiras sao as de dia. Elas sao a maioria de proposito: o tema da
 * lunacao ja chega na tela pela copy do tema, e um banco feito so de perguntas
 * tematicas transformaria o ano inteiro em entrevista sobre o rompimento.
 *
 * Nenhuma pergunta pede previsao, nenhuma pergunta pede o que a outra pessoa
 * pensa, e nenhuma pede estado emocional como condicao — "este mes nao" e sempre
 * uma resposta legitima.
 * ================================================================================= */
export const REFLEXOES = congelar([
  /* --- as trinta do dia: cabem nas treze lunacoes ------------------------------- */
  { id: 'hora-leve', texto: 'Que hora de hoje foi a mais leve, e o que você estava fazendo?', lunacoes: SEMPRE },
  { id: 'comeu-sentada', texto: 'O que você comeu hoje, e comeu sentada?', lunacoes: SEMPRE },
  { id: 'primeiro-pensamento', texto: 'Qual foi a primeira coisa que você pensou ao acordar hoje?', lunacoes: SEMPRE },
  { id: 'som-conhecido', texto: 'Que som de hoje você reconheceria de olhos fechados?', lunacoes: SEMPRE },
  { id: 'pediu-mais', texto: 'O que hoje pediu mais de você do que você esperava?', lunacoes: SEMPRE },
  { id: 'onde-pesou', texto: 'Onde no corpo hoje pesou mais — ombro, peito, mandíbula, estômago?', lunacoes: SEMPRE },
  { id: 'faria-de-qualquer-jeito', texto: 'O que você fez hoje que teria feito de qualquer jeito, com ou sem essa história?', lunacoes: SEMPRE },
  { id: 'vontade-de-rir', texto: 'Qual foi a coisa mais boba que te deu vontade de rir hoje?', lunacoes: SEMPRE },
  { id: 'tela-sem-escolher', texto: 'Quanto tempo hoje você passou olhando tela sem ter escolhido olhar?', lunacoes: SEMPRE },
  { id: 'adiou-hoje', texto: 'O que você adiou hoje, e por quê?', lunacoes: SEMPRE },
  { id: 'duas-horas-a-mais', texto: 'Se hoje tivesse durado duas horas a mais, o que você teria feito com elas?', lunacoes: SEMPRE },
  { id: 'casa-do-jeito', texto: 'Que parte da sua casa está do jeito que você gosta, e que parte não está?', lunacoes: SEMPRE },
  { id: 'agradeceu-calada', texto: 'O que você agradeceu hoje sem dizer em voz alta?', lunacoes: SEMPRE },
  { id: 'conversa-que-somou', texto: 'Qual conversa de hoje te deixou melhor do que antes dela?', lunacoes: SEMPRE },
  { id: 'repetiu-a-semana', texto: 'O que você repetiu hoje que já vinha repetindo a semana toda?', lunacoes: SEMPRE },
  { id: 'hora-da-fome', texto: 'A que horas hoje você teve mais fome, e o que fez com isso?', lunacoes: SEMPRE },
  { id: 'decisao-inteira', texto: 'O que hoje foi decisão sua, do começo ao fim?', lunacoes: SEMPRE },
  { id: 'cheiro-que-ficou', texto: 'Que cheiro de hoje ficou com você?', lunacoes: SEMPRE },
  { id: 'roupa-para-quem', texto: 'Que roupa você escolheu hoje, e escolheu para quem?', lunacoes: SEMPRE },
  { id: 'pela-metade', texto: 'O que você deixou pela metade hoje?', lunacoes: SEMPRE },
  { id: 'hora-silenciosa', texto: 'Qual foi a hora mais silenciosa do seu dia?', lunacoes: SEMPRE },
  { id: 'aprendeu-hoje', texto: 'O que você aprendeu hoje que não sabia ontem, por menor que seja?', lunacoes: SEMPRE },
  { id: 'dia-em-uma-frase', texto: 'Se você tivesse que contar o dia de hoje em uma frase, qual seria?', lunacoes: SEMPRE },
  { id: 'custou-sem-valer', texto: 'O que hoje custou dinheiro, tempo ou energia sem valer nenhum dos três?', lunacoes: SEMPRE },
  { id: 'gesto-de-cuidado', texto: 'Que gesto pequeno de hoje foi só cuidado com você?', lunacoes: SEMPRE },
  { id: 'nem-casa-nem-trabalho', texto: 'Onde você esteve hoje que não era casa nem trabalho?', lunacoes: SEMPRE },
  { id: 'esqueceu-das-horas', texto: 'Qual foi o momento de hoje em que você esqueceu das horas?', lunacoes: SEMPRE },
  { id: 'ninguem-ia-saber', texto: 'O que você teria feito hoje se ninguém fosse saber?', lunacoes: SEMPRE },
  { id: 'promessa-cumprida', texto: 'Que promessa pequena você fez a si mesma esta semana, e cumpriu?', lunacoes: SEMPRE },
  { id: 'tirou-do-lugar', texto: 'O que hoje te tirou do lugar, e por quanto tempo?', lunacoes: SEMPRE },

  /* --- bloco do chao: nomear (1), a rotina (2), o que ja era meu (3) ------------- */
  { id: 'por-onde-comecaria', texto: 'Se você contasse o que aconteceu sem arrumar nenhuma frase, por onde começaria?', lunacoes: [1, 2, 6, 12] },
  { id: 'palavra-usada', texto: 'Que palavra você tem usado para nomear isso, e ela é a palavra certa?', lunacoes: [1, 5, 6, 9, 12] },
  { id: 'duas-versoes', texto: 'Qual versão dessa história você conta para os outros, e qual você conta para você?', lunacoes: [1, 5, 6, 12, 13] },
  { id: 'data-marcada', texto: 'Que data ficou marcada, e o que você lembra dela de verdade?', lunacoes: [1, 5, 12] },
  { id: 'frase-repetida-de-cabeca', texto: 'Que frase dita naquele tempo você ainda repete de cabeça?', lunacoes: [1, 5, 8, 12] },
  { id: 'titulo-da-historia', texto: 'Se essa história tivesse um título, qual seria hoje?', lunacoes: [1, 6, 12, 13] },
  { id: 'uma-frase-sem-justificar', texto: 'O que você diria que aconteceu, em uma frase, sem justificar nada?', lunacoes: [1, 6, 9, 12] },
  { id: 'comeco-do-dia', texto: 'Como começa o seu dia agora, do despertador até sair do quarto?', lunacoes: [2, 4, 10, 12] },
  { id: 'horario-que-mudou', texto: 'Que horário do seu dia mudou de forma nesse tempo?', lunacoes: [2, 4, 5, 7, 10] },
  { id: 'parou-sem-decidir', texto: 'O que você parou de fazer sem ter decidido parar?', lunacoes: [2, 3, 7, 9, 10, 12] },
  { id: 'semana-igual', texto: 'Qual parte da sua semana ainda está exatamente igual?', lunacoes: [2, 3, 7, 10, 12] },
  { id: 'o-sono-mudou', texto: 'O que mudou no seu sono nesse tempo, se é que mudou?', lunacoes: [2, 4, 10] },
  { id: 'hora-so-sua', texto: 'Qual é a hora do seu dia que hoje é só sua?', lunacoes: [2, 3, 4, 10, 13] },
  { id: 'continua-seu', texto: 'O que era seu antes e continua seu — objeto, lugar, hábito, pessoa?', lunacoes: [3, 7, 9, 10, 12, 13] },
  { id: 'ficou-de-lado', texto: 'Que música, livro ou lugar ficou de lado nesse tempo?', lunacoes: [3, 7, 9, 12] },
  { id: 'habilidade-intacta', texto: 'Qual habilidade sua ninguém tirou de você?', lunacoes: [3, 9, 10, 13] },
  { id: 'sozinha-e-gostava', texto: 'O que você fazia sozinha e gostava, antes de tudo isso?', lunacoes: [3, 7, 9, 10, 13] },

  /* --- bloco do laco: a vontade tem hora (4), sei ou suponho (5), a parte (6) ---- */
  { id: 'hora-da-vontade', texto: 'A que horas hoje a vontade de dizer alguma coisa apertou mais?', lunacoes: [4, 5, 8, 11] },
  { id: 'antes-da-vontade', texto: 'O que costuma vir logo antes dessa vontade — fome, cansaço, silêncio, uma foto?', lunacoes: [4, 5, 8, 11] },
  { id: 'vontade-passou-sozinha', texto: 'Onde você estava da última vez que essa vontade passou sozinha?', lunacoes: [4, 5, 8, 10, 11] },
  { id: 'viu-ou-montou', texto: 'O que você sabe porque viu ou ouviu, e o que você montou de cabeça?', lunacoes: [5, 6, 8, 9, 12] },
  { id: 'sem-dado-novo', texto: 'Qual história você reconstruiu hoje sem ter nenhum dado novo?', lunacoes: [5, 6, 8, 12] },
  { id: 'qual-e-a-prova', texto: 'Se alguém te pedisse a prova do que você está supondo, o que você mostraria?', lunacoes: [5, 6, 10, 12] },
  { id: 'parte-sem-aumentar', texto: 'Qual foi a sua parte, dita sem aumentar?', lunacoes: [6, 8, 9, 11, 12] },
  { id: 'parte-sem-diminuir', texto: 'Qual foi a sua parte, dita sem diminuir?', lunacoes: [6, 8, 9, 11, 12] },
  { id: 'nao-era-seu-carregar', texto: 'O que não era seu para carregar e você carregou mesmo assim?', lunacoes: [6, 7, 8, 10, 11] },
  { id: 'faria-de-novo', texto: 'Que coisa você fez ali que faria de novo, sem vergonha nenhuma?', lunacoes: [6, 9, 10, 13] },

  /* --- bloco do alargamento: outros fios (7), raiva (8), o que eu quero (9) ------ */
  { id: 'apareceu-sem-chamar', texto: 'Quem apareceu na sua semana sem você ter chamado?', lunacoes: [7, 10, 12, 13] },
  { id: 'conversa-que-nao-e-sobre-isso', texto: 'Há quanto tempo você não fala com alguém de quem gosta sobre qualquer outro assunto?', lunacoes: [7, 8, 10, 11] },
  { id: 'mesa-abandonada', texto: 'Qual grupo, aula ou mesa você abandonou e ainda existe?', lunacoes: [7, 10, 12, 13] },
  { id: 'quem-te-procurou', texto: 'Quem te procurou este mês, e o que você respondeu?', lunacoes: [7, 10, 11, 12] },
  { id: 'raiva-nao-dita', texto: 'O que ficou sem ser dito do lado da raiva?', lunacoes: [8, 11, 12] },
  { id: 'frase-nunca-mandada', texto: 'Que frase você já escreveu de cabeça umas dez vezes e nunca mandou?', lunacoes: [8, 11, 12] },
  { id: 'nao-concordo-mais', texto: 'Com o que exatamente você não concorda mais?', lunacoes: [8, 9, 10, 11] },
  { id: 'quero-sem-citar', texto: 'O que você quer, dito sem citar ninguém?', lunacoes: [9, 10, 11, 13] },
  { id: 'verdade-daqui-a-um-ano', texto: 'O que você quer que continue verdade sobre você, aconteça o que acontecer?', lunacoes: [9, 10, 12, 13] },
  { id: 'desejo-sem-resposta', texto: 'Qual desejo seu não depende de resposta de ninguém?', lunacoes: [9, 10, 11, 13] },

  /* --- bloco da capacidade: confiar (10), o que se diz (11), o ano (12), a lua (13) */
  { id: 'confiar-em-quem-for', texto: 'O que você precisaria para confiar de novo — em quem for?', lunacoes: [10, 11, 13] },
  { id: 'sinal-de-seguranca', texto: 'Que sinal te faz sentir segura com qualquer pessoa: amiga, chefe ou vizinha?', lunacoes: [10, 11, 13] },
  { id: 'tres-frases', texto: 'O que você diria se tivesse três frases, e o que fica sendo só seu?', lunacoes: [11, 12, 13] },
  { id: 'mudou-de-tom', texto: 'Lendo o que você escreveu nos últimos meses, o que mudou de tom?', lunacoes: [12, 13] },
  { id: 'pergunta-que-abre', texto: 'Qual pergunta você quer abrir agora?', lunacoes: [12, 13] },

  /* --- AS EXCLUSIVAS: duas por lunacao, e nenhuma cai em mais de uma --------------
   *
   * POR QUE ESTE BLOCO EXISTE. Antes dele, o banco tinha ZERO perguntas exclusivas:
   * todas as 47 tematicas eram compartilhadas por duas lunacoes ou mais, e havia
   * pares que se sobrepunham quase inteiros — a 8 e a 11 dividiam DEZ das treze
   * perguntas da 8 (Jaccard 0,53), a 10 e a 13 dividiam doze.
   *
   * O efeito nao aparece em teste nenhum e aparece na cara de quem usa: nenhuma
   * pergunta do dia MARCAVA o tema. Treze meses de perguntas intercambiaveis sao,
   * na percepcao, um tema so escrito de treze maneiras — que e exatamente o modo de
   * um plano de 365 dias morrer no dia 40. A copy do tema anunciava treze temas
   * distintos e o banco entregava um.
   *
   * A REGRA E DE FORMA, nao de gosto: `lunacoes` de tamanho 1 aqui, sempre. Uma
   * exclusiva que ganha uma segunda etiqueta deixa de ser exclusiva, e
   * `verificarBancos` reprova quando alguma lunacao fica com menos de duas.
   *
   * ACRESCENTADAS NO FIM, como manda o cabecalho do bloco dos bolos: o indice e a
   * ordem, e mover qualquer linha acima desta troca a pergunta de todos os dias
   * passados de uma vez. Crescer o bolo so aumenta a folga da garantia (o piso de
   * 31 continua de pe com sobra).
   *
   * Nenhuma delas pede previsao, nenhuma pergunta o que a outra pessoa pensa, e
   * nenhuma exige estado emocional — "este mes nao" continua sendo resposta em
   * todas as treze. */
  { id: 'nunca-escrita-em-lugar-nenhum', texto: 'Que parte dessa história você nunca escreveu em lugar nenhum?', lunacoes: [1] },
  { id: 'sem-os-porques', texto: 'Se você tirasse todos os porquês do que aconteceu, o que sobraria de fato?', lunacoes: [1] },
  { id: 'hora-identica-a-ontem', texto: 'Que hora do seu dia hoje foi igualzinha à de ontem, minuto a minuto?', lunacoes: [2] },
  { id: 'primeira-voz-do-dia', texto: 'Qual é o primeiro horário do seu dia em que você fala com alguém em voz alta?', lunacoes: [2] },
  { id: 'guardado-numa-caixa', texto: 'Que coisa sua está guardada numa caixa, numa pasta ou num armário há meses?', lunacoes: [3] },
  { id: 'gosto-que-parou-de-defender', texto: 'Qual gosto seu você deixou de defender numa mesa?', lunacoes: [3] },
  { id: 'dia-da-semana-da-vontade', texto: 'Em que dia da semana essa vontade costuma aparecer mais de uma vez?', lunacoes: [4] },
  { id: 'horas-sem-a-vontade', texto: 'Que parte do dia de hoje passou sem a vontade aparecer nenhuma vez?', lunacoes: [4] },
  { id: 'visto-com-os-proprios-olhos', texto: 'Qual é a última coisa que você sabe por ter visto com os seus próprios olhos?', lunacoes: [5] },
  { id: 'suposicao-que-mudou-sozinha', texto: 'Que suposição sua mudou de forma nos últimos trinta dias sem nenhum dado novo?', lunacoes: [5] },
  { id: 'diferente-e-igual', texto: 'O que você faria diferente, e o que você faria igual? As duas coisas, nesta ordem.', lunacoes: [6] },
  { id: 'nao-estava-na-sua-mao', texto: 'Que parte disso não estava na sua mão de jeito nenhum?', lunacoes: [6] },
  { id: 'quem-mora-mais-perto', texto: 'Quem da sua vida mora mais perto de você, em quilômetros?', lunacoes: [7] },
  { id: 'aniversario-de-cabeca', texto: 'De quem é o último aniversário que você lembra sem olhar o telefone?', lunacoes: [7] },
  /* As duas da 8 puxam para CRITERIO e nao para fala guardada. A raiva do mes 8 vale
   * pelo que ela informa — o que ela nao aceita mais —, e e o mes 11 que trata do
   * que se diz e do que fica. Sem esta separacao os dois meses fazem a mesma
   * pergunta com duas capas. */
  { id: 'regra-que-nao-se-abre-mao', texto: 'De que regra sua você não abre mão mais, aconteça o que acontecer?', lunacoes: [8] },
  { id: 'irritaria-numa-pessoa-nova', texto: 'O que hoje te incomodaria numa pessoa que você acabou de conhecer?', lunacoes: [8] },
  { id: 'cabe-num-sabado', texto: 'Que coisa que você quer caberia num sábado, sem depender de mais ninguém?', lunacoes: [9] },
  { id: 'quero-sem-custar-dinheiro', texto: 'O que você quer que não custa dinheiro nenhum?', lunacoes: [9] },
  { id: 'relaxa-os-ombros', texto: 'Que atitude, vinda de qualquer pessoa, te faz relaxar os ombros?', lunacoes: [10] },
  { id: 'saber-de-antemao', texto: 'O que você precisa saber de antemão para topar um plano com alguém?', lunacoes: [10] },
  { id: 'olho-no-olho-ou-papel', texto: 'Que frase sua você diria olhando nos olhos, e qual só caberia no papel?', lunacoes: [11] },
  { id: 'limite-de-tres-palavras', texto: 'O que você diria hoje em três palavras, se três fossem o limite?', lunacoes: [11] },
  /* As duas da 12 sao sobre RELER, nunca sobre escrever coisa nova: e a lunacao em
   * que o app e indice e nao interprete. E nenhuma das duas conta ausencia — "que
   * mes tem menos coisa escrita" seria a mesma culpa que este arquivo recusa. */
  { id: 'nao-lembrava-de-ter-escrito', texto: 'Qual entrada sua você não lembrava de ter escrito?', lunacoes: [12] },
  { id: 'releria-agora', texto: 'Qual entrada antiga sua você releria agora, se pudesse escolher uma?', lunacoes: [12] },
  { id: 'pergunta-que-fica-para-tras', texto: 'Qual pergunta desta volta você não quer mais carregar?', lunacoes: [13] },
  { id: 'daqui-a-treze-luas', texto: 'Que pergunta você faria a si mesma daqui a treze luas?', lunacoes: [13] },
]);

/* =================================================================================
 * 2. AFIRMACOES — frases DELA sobre ELA.
 *
 * Forma: { id, texto }
 *
 * Cinquenta, todas em primeira pessoa e no presente. As tres regras que valem
 * para as cinquenta, sem excecao:
 *
 *   (a) a outra pessoa nao aparece. Nem como sujeito, nem como complemento, nem
 *       por baixo do pano ("eu sei esperar o que é meu" ja seria promessa
 *       disfarcada de afirmacao);
 *   (b) nenhum desfecho. Afirmacao no futuro — "um dia eu vou entender" — e
 *       promessa com outra roupa, e promessa e o que este produto nao vende;
 *   (c) nenhuma alegacao de saude. O app nao trata nada e nao faz sintoma passar.
 *       Afirmacao fala de direito, de escolha e de capacidade — nunca de sintoma.
 *
 * Cinquenta e maior que 31, entao a mesma afirmacao nunca cai duas vezes na
 * mesma lunacao. Volta cerca de sete vezes ao longo de um ano, e isso e o teto
 * aritmetico de um banco de cinquenta em 365 dias, nao um descuido.
 * ================================================================================= */
export const AFIRMACOES = congelar([
  { id: 'sozinha-sem-perdida', texto: 'Eu consigo estar sozinha sem estar perdida.' },
  { id: 'sinto-e-sigo-dona', texto: 'Eu sinto o que sinto e continuo dona do meu dia.' },
  { id: 'meu-tempo', texto: 'O tempo que eu estou levando é o meu tempo.' },
  { id: 'sem-explicacao', texto: 'Eu não devo explicação a ninguém pelo jeito como atravesso isto.' },
  { id: 'silencio-sem-abandono', texto: 'Eu sei ficar em silêncio sem me abandonar.' },
  { id: 'minha-parte-existe', texto: 'Hoje eu cuido da parte que é minha, que é a parte que existe.' },
  { id: 'mudar-de-ideia', texto: 'Eu posso mudar de ideia sem trair quem eu fui até aqui.' },
  { id: 'calma-nao-guardada', texto: 'A minha calma não está guardada com mais ninguém.' },
  { id: 'minha-noite', texto: 'Eu escolho o que faço com a minha noite.' },
  { id: 'nada-errado-em-mim', texto: 'Nada em mim está errado por esta história não ter fechado.' },
  { id: 'mais-constante', texto: 'Eu sou a pessoa mais constante da minha vida.' },
  { id: 'nao-estar-bem-com-respeito', texto: 'Eu tenho o direito de não estar bem hoje e ainda assim me tratar com respeito.' },
  { id: 'esperar-sem-parar', texto: 'Eu consigo esperar sem ficar parada.' },
  { id: 'dia-que-nao-depende', texto: 'O meu dia tem coisas que não dependem de ninguém.' },
  { id: 'fiz-bem-no-que-deu-errado', texto: 'Eu reconheço o que eu fiz bem, mesmo dentro do que deu errado.' },
  { id: 'devolvo-o-resto', texto: 'Eu carrego a minha parte e devolvo o resto.' },
  { id: 'nao-entender-tudo', texto: 'Eu não preciso entender tudo hoje para viver o dia de hoje.' },
  { id: 'memoria-tambem-minha', texto: 'Eu tenho memória boa e ela também é minha.' },
  { id: 'saudade-nao-manda', texto: 'Saudade cabe em mim sem mandar na minha semana.' },
  { id: 'falo-como-com-amiga', texto: 'Eu falo comigo do jeito que eu falaria com uma amiga.' },
  { id: 'querer-sem-correr', texto: 'Eu posso querer uma coisa e ainda assim não fazer nada a respeito hoje.' },
  { id: 'moro-no-meu-corpo', texto: 'O meu corpo é o lugar onde eu moro, e eu cuido de onde eu moro.' },
  { id: 'sei-o-que-nao-aceito', texto: 'Eu sei o que eu não aceito mais.' },
  { id: 'ocupar-espaco', texto: 'Eu tenho o direito de ocupar espaço numa conversa.' },
  { id: 'escolho-quem-sabe', texto: 'Eu escolho quem sabe das minhas coisas.' },
  { id: 'descanso-sem-merecer', texto: 'Eu me permito descansar sem ter merecido primeiro.' },
  { id: 'hoje-sem-desfecho', texto: 'Eu consigo passar por hoje sem cobrar de mim um desfecho.' },
  { id: 'amizades-existem', texto: 'As minhas amizades existem, e eu posso chegar nelas.' },
  { id: 'nao-sou-meu-pior-dia', texto: 'Eu não sou o pior dia que eu tive.' },
  { id: 'gostos-meus', texto: 'Eu tenho gostos meus e eles não estão em negociação.' },
  { id: 'nao-e-ser-boa', texto: 'Eu sei dizer não e continuar sendo uma pessoa boa.' },
  { id: 'rotina-um-horario', texto: 'Eu construo a minha rotina, um horário de cada vez.' },
  { id: 'raiva-sem-injustica', texto: 'Eu posso sentir raiva sem virar uma pessoa injusta.' },
  { id: 'reparo-nas-pequenas', texto: 'Eu reparo nas coisas pequenas e isso é uma qualidade minha.' },
  { id: 'paciencia-comigo', texto: 'Eu me dou a paciência que eu costumo dar aos outros.' },
  { id: 'o-que-entra-antes-de-dormir', texto: 'Eu escolho o que entra na minha cabeça antes de dormir.' },
  { id: 'vida-acontecendo-agora', texto: 'Eu tenho uma vida que continua acontecendo agora.' },
  { id: 'pedir-ajuda', texto: 'Eu posso pedir ajuda sem estar fraca.' },
  { id: 'confio-na-minha-leitura', texto: 'Eu confio na minha leitura das coisas.' },
  { id: 'aprendizado-e-meu', texto: 'O que eu aprendi neste tempo é meu.' },
  { id: 'valor-fora-do-amor', texto: 'Eu tenho valor fora de qualquer história de amor.' },
  { id: 'falar-ou-guardar', texto: 'Eu decido quando falar e quando guardar.' },
  { id: 'pergunta-em-aberto', texto: 'Eu consigo ficar com uma pergunta em aberto.' },
  { id: 'recomecar-pequeno', texto: 'Eu sou capaz de recomeçar uma coisa pequena hoje.' },
  { id: 'sem-ser-exemplo', texto: 'Eu não preciso ser exemplo de nada para ninguém.' },
  { id: 'falta-sem-agir', texto: 'Eu tenho o direito de sentir falta e não fazer nada com isso.' },
  { id: 'me-reconheco', texto: 'Eu me olho no espelho e reconheço quem está ali.' },
  { id: 'meu-passo', texto: 'Eu ando no meu passo, e o meu passo serve para mim.' },
  { id: 'projetos-meus', texto: 'Eu tenho projetos que são só meus.' },
  { id: 'volto-para-mim', texto: 'Eu volto para mim quando eu me perco de vista.' },
]);

/* =================================================================================
 * 3. CONTENCOES — para o momento em que vier a vontade de mandar mensagem.
 *
 * Forma: { id, texto, forma }
 *
 * E a peca mais forte herdada do funil, e a mais facil de estragar. As quatro
 * regras sao de forma, nao de gosto, e valem para as trinta e uma:
 *
 *   (a) CONVITE, nunca proibicao. Nenhuma frase diz "nao mande". Todas dizem o
 *       que fazer PRIMEIRO — e "primeiro" pressupoe que mandar continua sendo
 *       uma opcao dela;
 *   (b) REVERSIVEL. Nada aqui e um portao. Ela faz o gesto e segue mandando se
 *       quiser: o gesto e o ganho, nao o pedagio;
 *   (c) SEM CONSEQUENCIA DESCRITA. Nenhuma frase diz o que acontece se ela
 *       mandar — nem para bem, nem para mal. O app nao sabe e nao chuta;
 *   (d) NUNCA ACAO SOBRE ALGUEM. Em nenhuma linha segurar a mensagem aparece
 *       como coisa que produz efeito na outra pessoa. Esse e o eufemismo classico
 *       do nicho ("o silencio faz milagre") e e exatamente a promessa proibida,
 *       so que dita pelo avesso.
 *
 * `forma` existe para o portao conferir variedade sem ler o texto. O erro de
 * projeto que mata no dia 40 nao e repetir palavra, e repetir FORMA: trinta e um
 * textos diferentes que pedem todos "escreve aqui" sao, na percepcao, um texto
 * so. Por isso `verificarBancos` reprova quando uma unica forma passa de um
 * terco do banco — a regra e conferida, nao confiada a quem escrever a proxima.
 *
 * Trinta e uma, e nao as "~20" do briefing, pelo motivo aritmetico do cabecalho:
 * abaixo de 31 a garantia de nao repetir dentro da lunacao seria falsa. Se o dono
 * preferir um bolo menor e gesto mais familiar, a decisao e legitima — mas entao
 * a garantia tem de ser reescrita, nao so o array encurtado.
 * ================================================================================= */
export const CONTENCOES = congelar([
  { id: 'escreve-aqui-primeiro', forma: 'escrever', texto: 'Se vier a vontade de mandar, escreve aqui primeiro. O que sair aqui fica neste telefone.' },
  { id: 'inteira-depois-le', forma: 'escrever', texto: 'Se vier a vontade de mandar, escreve aqui, inteiro, o que você diria, e leia depois de terminar. Continua sendo seu, saindo daqui ou não.' },
  { id: 'marca-a-hora', forma: 'tempo', texto: 'Se vier a vontade de mandar, anota a hora num papel. Só a hora. Depois você faz o que quiser.' },
  { id: 'copo-de-agua', forma: 'corpo', texto: 'Se vier a vontade de mandar, bebe um copo de água até o fim antes de decidir.' },
  { id: 'sai-do-comodo', forma: 'lugar', texto: 'Se vier a vontade de mandar, sai do cômodo em que você está e volta. A vontade vem junto ou não vem.' },
  { id: 'frase-que-quer-ouvir', forma: 'escrever', texto: 'Se vier a vontade de mandar, escreve primeiro a frase que você gostaria de ouvir. Depois olhe as duas.' },
  { id: 'outra-mao', forma: 'corpo', texto: 'Se vier a vontade de mandar, põe o telefone na outra mão por um minuto.' },
  { id: 'o-que-quer-que-aconteca', forma: 'escrever', texto: 'Se vier a vontade de mandar, escreve aqui o que você gostaria que acontecesse depois. Fica sendo seu.' },
  { id: 'escada-ou-esquina', forma: 'corpo', texto: 'Se vier a vontade de mandar, desce e sobe uma escada, ou anda até a esquina e volta.' },
  { id: 'le-em-voz-alta', forma: 'voz', texto: 'Se vier a vontade de mandar, lê em voz alta o que você escreveu. A sua voz é a primeira leitora.' },
  { id: 'tres-frases-depois-uma', forma: 'escrever', texto: 'Se vier a vontade de mandar, escreve a mesma coisa em três frases, depois em uma.' },
  { id: 'guarda-o-rascunho', forma: 'guardar', texto: 'Se vier a vontade de mandar, guarda o rascunho aqui e anota num papel a hora de reler.' },
  { id: 'cinco-minutos-antes', forma: 'tempo', texto: 'Se vier a vontade de mandar, escreve aqui o que estava acontecendo cinco minutos antes de a vontade chegar.' },
  { id: 'manda-para-voce', forma: 'escrever', texto: 'Se vier a vontade de mandar, manda para você mesma primeiro, em outro aplicativo, e leia como se fosse de outra pessoa.' },
  { id: 'musica-inteira', forma: 'tempo', texto: 'Se vier a vontade de mandar, escolhe uma música inteira e ouve até o fim. Depois volte aqui.' },
  { id: 'palavra-que-travou', forma: 'nomear', texto: 'Se vier a vontade de mandar, escreve aqui em qual palavra você travou.' },
  { id: 'dois-pes-no-chao', forma: 'corpo', texto: 'Se vier a vontade de mandar, senta e apoia os dois pés no chão até contar até sessenta.' },
  { id: 'se-nao-tivesse-vindo', forma: 'escrever', texto: 'Se vier a vontade de mandar, escreve o que você faria agora se essa vontade não tivesse vindo. Depois escolha uma das duas.' },
  { id: 'janela-e-dez-respiracoes', forma: 'corpo', texto: 'Se vier a vontade de mandar, abre a janela e olha para fora enquanto conta dez respirações.' },
  { id: 'data-e-frase', forma: 'guardar', texto: 'Se vier a vontade de mandar, escreve aqui a data de hoje e a frase, só isso. O registro é seu.' },
  { id: 'agua-fria-no-rosto', forma: 'corpo', texto: 'Se vier a vontade de mandar, lava o rosto com água fria e volta ao telefone.' },
  { id: 'arruma-a-mesa', forma: 'coisa', texto: 'Se vier a vontade de mandar, arruma uma coisa da sua mesa antes de escrever qualquer palavra.' },
  { id: 'o-que-mandaria-ontem', forma: 'tempo', texto: 'Se vier a vontade de mandar, escreve aqui o que você teria mandado ontem, se tivesse mandado.' },
  { id: 'liga-para-alguem', forma: 'voz', texto: 'Se vier a vontade de mandar, chama alguém de quem você gosta e fala de qualquer outro assunto por cinco minutos.' },
  { id: 'poe-um-titulo', forma: 'nomear', texto: 'Se vier a vontade de mandar, escreve aqui e coloque um título na página. O título costuma dizer mais que o texto.' },
  { id: 'come-alguma-coisa', forma: 'corpo', texto: 'Se vier a vontade de mandar, anda até a cozinha e come alguma coisa. Fome e vontade se parecem por dentro.' },
  { id: 'ultima-frase-pela-metade', forma: 'guardar', texto: 'Se vier a vontade de mandar, escreve aqui e deixe a última frase pela metade. Volte a ela mais tarde.' },
  { id: 'foto-do-lugar', forma: 'coisa', texto: 'Se vier a vontade de mandar, tira uma foto do lugar onde você está agora. É um registro do seu dia.' },
  { id: 'conta-os-eu', forma: 'contar', texto: 'Se vier a vontade de mandar, escreve aqui e conte quantas vezes a palavra "eu" aparece.' },
  { id: 'dois-minutos-na-porta', forma: 'lugar', texto: 'Se vier a vontade de mandar, veste um agasalho e fica dois minutos na porta de casa.' },
  { id: 'verdade-amanha-de-manha', forma: 'escrever', texto: 'Se vier a vontade de mandar, escreve aqui o que você gostaria que continuasse verdade quando o dia virar.' },
]);

/* =================================================================================
 * ARITMETICA DO DIA — a mesma de lib/ceu.js, reescrita aqui de proposito.
 *
 * datos/ nao importa de lib/: a pasta e material, e material que importa motor
 * inverte a dependencia e prende este arquivo a um modulo que outro agente pode
 * estar reescrevendo agora. O preco e a copia poder divergir da original, e o
 * antidoto e o proprio portao: `_diasDesdeEpoca` esta exportado justamente para
 * um teste comparar, dia a dia, com o de lib/ceu.js. Copia com conferencia
 * automatica e barata; import invertido e caro para sempre.
 *
 * Round-trip, e nao regex: /^\d{4}-\d{2}-\d{2}$/ aceita '2026-02-31', e uma data
 * impossivel rola para o mes seguinte EM SILENCIO.
 * ================================================================================= */
const MS_DIA = 86400000;

function ehDiaValido(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(anio, mes - 1, dd));
  return t.getUTCFullYear() === anio && t.getUTCMonth() === mes - 1 && t.getUTCDate() === dd;
}

/* Aceita 'YYYY-MM-DD' ou Date. Um Date vira dia LOCAL — nunca toISOString(), que
 * as 21h ja entregaria amanha e trocaria a reflexao no meio da noite de quem
 * mora a oeste de Greenwich. */
function comoDia(dia) {
  if (dia instanceof Date && !Number.isNaN(dia.getTime())) {
    const p = (n, l = 2) => String(n).padStart(l, '0');
    return `${p(dia.getFullYear(), 4)}-${p(dia.getMonth() + 1)}-${p(dia.getDate())}`;
  }
  return dia;
}

/** Contagem CONTINUA de dias desde a epoca. E ela, e nunca o dia-do-ano, que serve
 *  de indice: dia-do-ano zera em 1 de janeiro e faz 31/12 e 01/01 caírem no mesmo
 *  lugar sempre que o tamanho do banco divide 365 — o unico dia em que a rotacao
 *  promete nao repetir e repete. Exportada para o portao comparar com lib/ceu.js. */
export function _diasDesdeEpoca(dia) {
  const d = comoDia(dia);
  if (!ehDiaValido(d)) return null;
  const [anio, mes, dd] = d.split('-').map(Number);
  return Math.round(Date.UTC(anio, mes - 1, dd) / MS_DIA);
}

/* Dia invalido nao devolve dia vazio: cai em 0. A doutrina de datos/plano.js vale
 * aqui inteira — um dia com material repetido vale mais que um dia sem material,
 * e um `null` vazando para a tela e um card em branco. */
function giroDoDia(dia) {
  const n = _diasDesdeEpoca(dia);
  return n === null ? 0 : n;
}

function mdc(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const r = x % y;
    x = y;
    y = r;
  }
  return x;
}

/* Multiplicadores candidatos. Sao primos, entao sao coprimos com qualquer bolo
 * que nao seja multiplo deles — a busca abaixo quase sempre acerta de primeira.
 * O 1 no fim e a rede: 1 e coprimo com tudo, e um passo 1 ainda percorre o bolo
 * inteiro sem repetir. A garantia nunca fica sem multiplicador valido. */
const MULTIPLICADORES = Object.freeze([7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]);

function passoDe(tamanho, semente) {
  if (tamanho <= 1) return 1;
  const base = ((semente % MULTIPLICADORES.length) + MULTIPLICADORES.length) % MULTIPLICADORES.length;
  for (let i = 0; i < MULTIPLICADORES.length; i += 1) {
    const a = MULTIPLICADORES[(base + i) % MULTIPLICADORES.length];
    if (mdc(a, tamanho) === 1) return a;
  }
  return 1;
}

/* O escolhedor unico dos tres bancos. `semente` separa as trilhas: bancos
 * diferentes (e lunacoes diferentes, dentro das reflexoes) comecam em pontos
 * diferentes e andam com passos diferentes, entao o dia nao entrega tres itens
 * que sempre andam colados. */
function escolher(lista, dia, semente) {
  if (!Array.isArray(lista) || lista.length === 0) return null;
  const n = giroDoDia(dia);
  const P = lista.length;
  const a = passoDe(P, semente);
  const b = ((semente * 7) % P + P) % P;
  const i = (((a * n + b) % P) + P) % P;
  return lista[i];
}

/* =================================================================================
 * OS BOLOS POR LUNACAO
 *
 * Filtra preservando a ordem do array — a ordem e parte do indice, e reordenar
 * REFLEXOES troca a reflexao de todos os dias passados de uma vez. Quem editar
 * este arquivo pode ACRESCENTAR no fim sem consequencia; mover uma linha para
 * cima reescreve o historico inteiro em silencio.
 * ================================================================================= */
function lunacaoValida(lunacao) {
  return Number.isInteger(lunacao) && lunacao >= LUNACAO_MIN && lunacao <= LUNACAO_MAX;
}

/** As reflexoes que cabem numa lunacao. Lunacao invalida (ou desconhecida, que e
 *  o caso honesto de quem ainda nao mediu a lua) devolve o banco INTEIRO: o dia
 *  continua tendo pergunta. Nao medir o ceu nunca esvazia a tela — e a mesma
 *  regra do `null` que nao vira `false` em lib/plano.js. */
export function reflexoesDaLunacao(lunacao) {
  if (!lunacaoValida(lunacao)) return REFLEXOES;
  /* Congelado como o banco inteiro, e nao por preciosismo: um `.sort()` de quem
   * chamar reordenaria o bolo e trocaria a pergunta de todos os dias daquela
   * lunacao de uma vez, sem erro nenhum na tela. A ordem E o indice. */
  return Object.freeze(REFLEXOES.filter((r) => r.lunacoes.includes(lunacao)));
}

/* =================================================================================
 * OS TRES SELETORES
 * ================================================================================= */

/** A reflexao de um dia, dentro do tema daquela lunacao.
 *  @param {string|Date} dia  'YYYY-MM-DD' ou Date (vira dia local).
 *  @param {number} [lunacao] 1..13. Ausente ou invalida usa o banco inteiro.
 *  @returns {{id:string,texto:string,lunacoes:number[]}|null} */
export function reflexaoDoDia(dia, lunacao) {
  const bolo = reflexoesDaLunacao(lunacao);
  const semente = lunacaoValida(lunacao) ? lunacao : 0;
  /* A TRADUCAO ENTRA DEPOIS DA ESCOLHA, nunca antes: quem escolhe e a aritmetica
   * sobre o bolo PORTUGUES, e so o texto devolvido muda de idioma. Traduzir antes
   * (filtrar ou reordenar um bolo traduzido) mudaria o indice e faria a espanhola
   * receber a pergunta de outro dia. */
  return textoDoBanco(escolher(bolo, dia, semente));
}

/** A afirmacao de um dia. Nao recebe lunacao de proposito: a afirmacao e sobre
 *  ela, e ela nao muda de pessoa quando o tema do mes muda.
 *  @param {string|Date} dia
 *  @returns {{id:string,texto:string}|null} */
export function afirmacaoDoDia(dia) {
  return textoDoBanco(escolher(AFIRMACOES, dia, 3));
}

/** A contencao de um dia — o gesto para quando vier a vontade de mandar.
 *  Tambem sem lunacao: a vontade nao respeita o calendario do arco.
 *  @param {string|Date} dia
 *  @returns {{id:string,texto:string,forma:string}|null} */
export function contencaoDoDia(dia) {
  return textoDoBanco(escolher(CONTENCOES, dia, 5));
}

/** Indices do dia nos tres bancos. Existe para o portao conferir a rotacao sem
 *  depender do texto, e para QA responder "por que esta pergunta hoje?". */
export function _rotacaoDe(dia, lunacao) {
  const n = giroDoDia(dia);
  const bolo = reflexoesDaLunacao(lunacao);
  const idx = (lista, semente) => {
    const P = lista.length;
    if (P === 0) return null;
    return (((passoDe(P, semente) * n + ((semente * 7) % P)) % P) + P) % P;
  };
  return {
    n,
    boloReflexoes: bolo.length,
    reflexao: idx(bolo, lunacaoValida(lunacao) ? lunacao : 0),
    afirmacao: idx(AFIRMACOES, 3),
    contencao: idx(CONTENCOES, 5),
  };
}

/* =================================================================================
 * VERIFICACAO — a garantia conferida, nao prometida.
 *
 * Devolve a lista de problemas (vazia quer dizer tudo certo). Um teste chama isto
 * e reprova o build; o portao nao precisa reimplementar a regra.
 *
 * Confere as tres coisas que, se cairem, quebram a promessa deste arquivo:
 *   1. nenhum id repetido em banco nenhum (id repetido esconde texto perdido);
 *   2. todo bolo — os treze das reflexoes, as afirmacoes e as contencoes — tem
 *      pelo menos 31 itens, que e o piso da prova do cabecalho;
 *   3. toda etiqueta de lunacao e um inteiro de 1 a 13, e nenhuma reflexao ficou
 *      sem etiqueta nenhuma (lista vazia sairia de todos os bolos e o texto
 *      nunca apareceria, sem erro nenhum e para sempre).
 * ================================================================================= */
export function verificarBancos() {
  const problemas = [];

  const conferirIds = (nome, lista) => {
    const vistos = new Set();
    lista.forEach((item) => {
      if (!item || typeof item.id !== 'string' || !item.id) {
        problemas.push(`${nome}: item sem id`);
        return;
      }
      if (vistos.has(item.id)) problemas.push(`${nome}: id repetido "${item.id}"`);
      vistos.add(item.id);
      if (typeof item.texto !== 'string' || !item.texto.trim()) {
        problemas.push(`${nome}: "${item.id}" sem texto`);
      }
    });
  };

  conferirIds('REFLEXOES', REFLEXOES);
  conferirIds('AFIRMACOES', AFIRMACOES);
  conferirIds('CONTENCOES', CONTENCOES);

  REFLEXOES.forEach((r) => {
    if (!Array.isArray(r.lunacoes) || r.lunacoes.length === 0) {
      problemas.push(`REFLEXOES: "${r.id}" sem lunacao — nunca apareceria em bolo nenhum`);
      return;
    }
    r.lunacoes.forEach((l) => {
      if (!lunacaoValida(l)) problemas.push(`REFLEXOES: "${r.id}" com lunacao invalida ${l}`);
    });
  });

  const piso = DIAS_CIVIS_POR_LUNACAO;
  for (let l = LUNACAO_MIN; l <= LUNACAO_MAX; l += 1) {
    const tamanho = reflexoesDaLunacao(l).length;
    if (tamanho < piso) {
      problemas.push(
        `REFLEXOES: lunacao ${l} tem ${tamanho} perguntas e o piso e ${piso}. `
          + 'Abaixo disso a mesma pergunta volta dentro da lunacao.'
      );
    }
  }
  if (AFIRMACOES.length < piso) problemas.push(`AFIRMACOES: ${AFIRMACOES.length} < ${piso}`);
  if (CONTENCOES.length < piso) problemas.push(`CONTENCOES: ${CONTENCOES.length} < ${piso}`);

  /* Toda lunacao precisa de pergunta que so ELA faz. Este e o unico teste do
   * arquivo que mede TEDIO em vez de repeticao, e ele mede a coisa certa: o piso de
   * 31 garante que a pergunta de hoje nao volta este mes, e nao garante nada sobre
   * o tema ser reconhecivel. O banco ja passou nas outras quatro conferencias com
   * ZERO exclusivas em treze lunacoes — treze temas anunciados na copy e um tema
   * entregue no dia. Duas por lunacao e o minimo para o tema aparecer na pergunta;
   * abaixo disso os meses viram capas do mesmo mes. */
  const EXCLUSIVAS_MINIMAS = 2;
  for (let l = LUNACAO_MIN; l <= LUNACAO_MAX; l += 1) {
    const exclusivas = REFLEXOES.filter(
      (r) => Array.isArray(r.lunacoes) && r.lunacoes.length === 1 && r.lunacoes[0] === l
    ).length;
    if (exclusivas < EXCLUSIVAS_MINIMAS) {
      problemas.push(
        `REFLEXOES: lunacao ${l} tem ${exclusivas} pergunta(s) exclusiva(s) e o minimo e `
          + `${EXCLUSIVAS_MINIMAS}. Sem pergunta propria o tema nao aparece no dia, e treze `
          + 'temas viram um tema com treze nomes.'
      );
    }
  }

  /* 4. nenhuma forma de contencao domina o banco. Tedio de FORMA nao aparece em
   *    nenhuma das conferencias acima: trinta e uma contencoes todas de escrever
   *    passariam nos ids, no piso e nas etiquetas, e ainda assim seriam a mesma
   *    contencao trinta e uma vezes na cabeca de quem le. */
  const teto = Math.ceil(CONTENCOES.length / 3);
  const porForma = new Map();
  CONTENCOES.forEach((c) => {
    if (typeof c.forma !== 'string' || !c.forma) {
      problemas.push(`CONTENCOES: "${c.id}" sem forma`);
      return;
    }
    porForma.set(c.forma, (porForma.get(c.forma) || 0) + 1);
  });
  porForma.forEach((quantas, forma) => {
    if (quantas > teto) {
      problemas.push(
        `CONTENCOES: a forma "${forma}" aparece ${quantas} vezes e o teto e ${teto}. `
          + 'Forma repetida cansa antes da palavra repetida.'
      );
    }
  });

  /* 5. os outros dois idiomas cobrem os mesmos ids, e nenhum texto e vazio.
   *
   * Sem esta conferencia a falta de traducao e SILENCIOSA — textoDoBanco() cai no
   * portugues de proposito (fallback honesto vale mais que tela vazia), e a
   * consequencia e uma espanhola lendo portugues sem nada acusar. Quem acrescenta
   * uma reflexao nova no fim do PT nao tem como saber que precisa vir aos dois
   * vizinhos; e esta lista que conta.
   *
   * CHAVE A MAIS tambem e problema, e pelo mesmo motivo de textos.es.js: id que
   * nao existe no PT e texto que nunca aparece na tela — e quase sempre um id
   * escrito errado, com a traducao de verdade faltando logo ao lado.
   *
   * VAZIO nao cai no fallback (ver textoDoBanco): '' chegaria na tela como card em
   * branco. Ou traduz, ou deixa o id de fora. */
  const TODOS = [
    ['REFLEXOES', REFLEXOES],
    ['AFIRMACOES', AFIRMACOES],
    ['CONTENCOES', CONTENCOES],
  ];
  const idsPT = new Set(TODOS.flatMap(([, lista]) => lista.map((i) => i.id)));
  Object.entries(TRADUCOES).forEach(([lang, dict]) => {
    TODOS.forEach(([nome, lista]) => {
      lista.forEach((item) => {
        const texto = dict[item.id];
        if (texto === undefined || texto === null) {
          problemas.push(`${nome}: "${item.id}" sem traducao em ${lang} (bancos.${lang}.js)`);
          return;
        }
        if (typeof texto !== 'string' || !texto.trim()) {
          problemas.push(
            `${nome}: "${item.id}" com texto vazio em ${lang} — a tela renderiza em branco `
              + 'e o fallback para o portugues NAO pega string vazia.'
          );
        }
      });
    });
    Object.keys(dict).forEach((id) => {
      if (!idsPT.has(id)) {
        problemas.push(
          `bancos.${lang}.js: id "${id}" nao existe no portugues — texto que nunca aparece.`
        );
      }
    });
  });

  return problemas;
}

export default congelar({
  LUNACAO_MIN,
  LUNACAO_MAX,
  TOTAL_LUNACOES,
  LUNACOES_DE_ARQUIVO,
  ehLunacaoDeArquivo,
  DIAS_CIVIS_POR_LUNACAO,
  REFLEXOES,
  AFIRMACOES,
  CONTENCOES,
  reflexoesDaLunacao,
  reflexaoDoDia,
  afirmacaoDoDia,
  contencaoDoDia,
  textoDoBanco,
  verificarBancos,
});
