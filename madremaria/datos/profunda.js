// datos/profunda.js — OS CINCO BLOCOS DA LEITURA PROFUNDA.
//
// ===========================================================================
// O QUE ESTE ARQUIVO E
// ===========================================================================
// A leitura profunda e o terceiro passo do funil do dono:
//
//   1. as cinco perguntas          (screens/OnboardingScreen.js)
//   2. as tres cartas com a voz    (screens/LeituraDeEntradaScreen.js)
//   3. ESTE CARROSSEL              (screens/LeituraProfundaScreen.js)
//   4. o app, com o plano de 365 dias em treze lunacoes
//
// Sao cinco audios na MESMA voz clonada, 6,7 minutos ao todo, e este arquivo
// guarda o que cada um DIZ, palavra por palavra.
//
// ===========================================================================
// A REGRA QUE FAZ O CARROSSEL FUNCIONAR: O TEXTO E A VOZ DIZEM A MESMA COISA
// ===========================================================================
// Metade das pessoas abre isto no onibus, sem fone. Se o texto da tela fosse um
// resumo do audio, quem nao pode ouvir agora receberia um produto menor — e o
// audio viraria conteudo exclusivo de quem tem fone na hora certa.
//
// Por isso `texto` NAO e um resumo, nao e uma parafrase e nao e uma introducao:
// e a transcricao do que a voz fala naquele arquivo. Trocar uma palavra aqui sem
// regravar o audio quebra o contrato em silencio — ninguem ve erro, e quem esta
// ouvindo e lendo ao mesmo tempo percebe na primeira frase.
//
// DE ONDE VEIO CADA TEXTO:
//  · bloco 8 — copiado de docs/ROTEIRO-LEITURA-PROFUNDA.md, que e o roteiro a
//    partir do qual os audios foram gravados. Conferido contra a transcricao do
//    .m4a: bate palavra por palavra.
//  · bloco 7 — o roteiro NAO traz o texto dele (ele ja estava gravado quando o
//    documento nasceu, e o documento so diz "ja feito, 54s"). O texto abaixo foi
//    transcrito do proprio assets/audio/profunda-7.m4a. Se o audio for
//    regravado — e ha uma pendencia aberta sobre ele em
//    play-store/CHECKLIST-PUBLICACION.md —, este texto muda no MESMO commit.
//  · blocos 9, 10 e 11 — REESCRITOS a partir de docs/PERSUASAO.md e JA GRAVADOS
//    na mesma voz clonada (b8boGhcWbCyPtZnKW69X, eleven_multilingual_v2). Os
//    .m4a em assets/audio e os tempos em datos/profunda-tempos.json sao destes
//    textos: a regravacao e a remedicao sairam no MESMO commit, que e a unica
//    forma de o contrato "texto = voz" nao quebrar em silencio.
//
// ===========================================================================
// O QUE O BLOCO 11 EXIGE DA TELA (e nao pode ser dito pelo audio)
// ===========================================================================
// O fecho fala da proxima lua nova como urgencia — e ela e real: lib/ceu.js
// (proximoMarcoLunar) e lib/ano.js (proximaVirada) calculam DATA E HORA. Mas o
// audio e gravado uma vez e a data muda toda lunacao. Por isso o audio fala da
// lua em termos gerais e MANDA OLHAR A TELA ("voce esta vendo a data escrita
// aqui agora"). Enquanto screens/LeituraProfundaScreen.js nao desenhar essa
// data no bloco 11, lida em tempo real, o audio aponta para um lugar vazio — e
// isso e exatamente o tipo de divida que docs/PERSUASAO.md proibe.
//
// ===========================================================================
// DOUTRINA
// ===========================================================================
// Nenhum destes cinco textos promete desfecho, atribui sentimento a quem esta do
// outro lado, alega saude ou vende nada por fora do app. O bloco 11 faz mais que
// isso: ele RECUSA a promessa em voz alta ("ninguem pode te dizer isso, e quem
// diz esta inventando"), e essa recusa e o que separa este produto de todo mundo
// que promete. test/copy.test.js conhece essa frase pelo nome — ler o comentario
// de RECUSAS_LITERAIS la antes de reescreve-la.
//
// ===========================================================================
// DISCO: NADA
// ===========================================================================
// Este arquivo e tabela congelada e pura. Quem grava o progresso do carrossel e
// lib/profunda.js, e a chave dele ('profunda') ja esta em CLAVES_HILO_ROJO
// (screens/AjustesScreen.js).

/* Os tempos medidos de cada frase. A costura entre eles e os blocos esta no fim
 * deste arquivo, em `trechosDe`. O `with { type: 'json' }` e o mesmo de
 * lib/mazo.js: sem ele o Node trata o .json como ESM e recusa carregar. */
import TEMPOS from './profunda-tempos.json' with { type: 'json' };

/* ===================================================================================
   UM FECHO SO, PARA QUALQUER PESSOA (11/09)
   ===================================================================================
   Ate 11/09 este bloco existia em TRES versoes, porque uma frase afirmava quem
   ela passa a ser depois das treze luas — "uma mulher que sabe isso e outra
   mulher" — e aquela frase nao falava com um homem. Custava tres audios de
   quase cinco minutos, tres tabelas de tempos e um parametro `genero`
   atravessando este arquivo, lib/audios.js e a tela.

   O dono cortou: "faca generico tudo para nao precisar de varios". A versao
   neutra virou a unica — e ela nunca foi um contorno. Ela troca a afirmacao por
   outra que se sustenta sozinha para qualquer pessoa: "quem sabe isso ja nao e
   a mesma pessoa".

   O QUE ISSO NAO MUDA: o genero de QUEM ESTA DO OUTRO LADO continua sem ser
   assumido em lugar nenhum do produto ("essa pessoa"), e test/copy.test.js
   segue vigiando. A pergunta de genero do onboarding continua existindo —
   outras partes do app a usam.
   =================================================================================== */
const ID_BLOCO_11 = 'profunda-11';

/* As cinco partes do bloco 11 que NAO mudam. A recusa da promessa abre a
 * primeira e mora numa LINHA SO de proposito: test/copy.test.js reconhece a
 * recusa pelo texto literal, e uma quebra de linha no meio dela faria o portao
 * voltar a acusar a propria recusa como se fosse promessa (RECUSAS_LITERAIS). */
const P11_RECUSA =
  'Eu não vou te dizer que essa pessoa vai voltar. Ninguém pode te dizer isso, e quem diz está inventando. E eu sei que você já ouviu isso de alguém — de um aplicativo, de uma carta de baralho, de alguém que cobrou por isso. Foi bom por dois dias. Depois não sobrou nada.';

/* O paragrafo que o fecho FECHA: as tres coisas que ela vai saber. A afirmacao
 * de genero entra colada no fim dele porque o "isso" dela aponta para esta
 * lista — movida para o fim do bloco, a frase perderia o referente. */
const P11_VAI_SABER =
  'O que eu posso te dizer é o que eu vejo daqui: você vai chegar no fim dessas treze luas sabendo coisas sobre você que hoje você não sabe. Vai saber a que horas a saudade aperta. Vai saber separar o que você sabe do que você está preenchendo por conta própria. E vai saber o que você aceita e o que você não aceita mais. Quem sabe isso já não é a mesma pessoa. E o que acontece com o seu amor, seja com essa pessoa ou com outra, é diferente do que acontece hoje.';

const P11_RESTO =
  'Agora eu preciso te dizer uma coisa que eu não vou terminar aqui. Tem um ponto nessas três cartas que eu não vou te falar hoje, e não é maldade: é que ele só faz sentido depois que você responder a primeira pergunta da primeira lua — a que pede que você conte o que aconteceu com as suas palavras, sem arrumar a frase para ninguém.\n\n'
  + 'A sua leitura de hoje fica guardada aí dentro, inteira, e você pode reabrir ela quando quiser. Mas escreva a sua versão ANTES de reabrir a minha. Nessa ordem a coisa aparece. Na ordem contrária você arruma a frase para caber no que eu disse, e aí o exercício inteiro se perde.\n\n'
  /* O PARAGRAFO QUE DIZ O QUE FICA ATRAS DO PAGAMENTO. Ele so pode existir
   * porque o portao existe de verdade: screens/PlanoScreen.js esconde os PASSOS
   * e o botao de quem nao assina, e deixa a vista o nome do gesto, a frase dele,
   * a duracao, a abertura e o recibo da fonte. As duas afirmacoes daqui — "voce
   * vai ver qual e" e "o que nao abre sozinho e o como se faz" — sao a descricao
   * literal daquela tela, e nao uma promessa.
   *
   * MEXEU NO PORTAO, MEXE AQUI. Se um dia os passos voltarem a aparecer para
   * quem nao assina, estas tres frases viram mentira na voz dele, no fecho da
   * venda — que e o pior lugar possivel para o app mentir.
   * test/portao-ritual.js guarda o outro lado desse par. */
  + 'E tem uma coisa que eu prefiro te falar agora do que você descobrir amanhã. Todo dia vai ter um gesto esperando você lá dentro. Você vai ver qual é, e vai ver quanto tempo ele custa. O que não abre sozinho é o como se faz. Os passos.\n\n'
  + 'E eu não vou fingir que isso é detalhe pra te deixar confortável. O como se faz é a coisa toda: é onde você faz alguma coisa, em vez de só ler sobre. É a diferença entre passar mais um dia pensando nessa pessoa e sair do lugar.\n\n'
  + 'Eu preciso que você abra essa parte decidindo. Não porque apareceu na tela, não num dia em que você estava sem fazer nada. Decidindo. Porque o que vem depois pede isso de você todo dia, e o primeiro dia é o que ensina todos os que vêm depois.\n\n'
  + 'E eu vou te dizer o que te espera do outro lado dessa porta, porque você tem direito de saber antes de decidir.\n\n'
  + 'Todo dia, um gesto. Um só, com o tempo dele contado. As primeiras luas são só suas: o seu chão, a sua voz, o seu jeito de responder. Depois começam os passos que essa pessoa vê, um por semana, na ordem certa.\n\n'
  + 'Começa com uma frase gentil que não pede nada. Depois um obrigado com endereço, por uma coisa específica. Depois uma pergunta sobre o dia, sem cobrar resposta. Depois uma lembrança boa, dividida sem anzol. Depois dois minutos escutando sem cortar. E lá na frente, quando você estiver de pé, o convite. E o erro assumido por inteiro, sem mas, que é o degrau que quase ninguém tem coragem de subir.\n\n'
  + 'Um não abre antes do outro. Se um doer, ou cair no vazio, a gente segura ali, volta pro seu chão por uns dias, e sobe de novo quando você estiver firme. Não é pressa. É ordem.\n\n'
  + 'Em treze luas, o que essa pessoa vê não é você pedindo. É você diferente. E isso não se explica, se mostra. Você não vai atrás. Você fica impossível de não notar.\n\n'
  + 'E tem a hora. A sua primeira lua não começa quando você decide: ela começa na próxima lua nova, que já tem dia e hora marcados no céu — e você está vendo esses dois escritos aqui na tela, agora. Se você entrar antes dela, essa lua nova é a sua. Se você entrar depois, a sua é a seguinte, e a seguinte é daqui a vinte e nove dias e meio. Isso não é regra minha. É a lua, e ela não espera ninguém.\n\n'
  + 'A sua primeira lua está aí. Vamos?';

/** O bloco 11 inteiro — a transcricao do .m4a. Um so, para qualquer pessoa. */
function textoDoFecho() {
  return `${P11_RECUSA}\n\n${P11_VAI_SABER}\n\n${P11_RESTO}`;
}

/* Um bloco por audio, NA ORDEM EM QUE A VOZ FOI GRAVADA. A ordem e conteudo: o
 * 8 responde ao 7, o 11 fecha o que o 9 abriu. Reordenar aqui reordena a leitura.
 *
 * `id` e `audio` sao campos separados de proposito, mesmo valendo o mesmo hoje:
 * `id` identifica o BLOCO (e o que lib/profunda.js guarda como ouvido) e `audio`
 * identifica o ARQUIVO em lib/audios.js. No dia em que um bloco for regravado em
 * duas partes, ou em que um audio for trocado por outro corte, so um dos dois
 * muda — e o progresso de quem ja ouviu continua valendo.
 *
 * `titulo` e um rotulo de navegacao, nao conteudo novo: cada um usa palavras que
 * a propria voz diz naquele bloco, para que o titulo nunca afirme algo que o
 * audio nao afirma. */
export const BLOQUES_PROFUNDA = Object.freeze([
  Object.freeze({
    id: 'profunda-7',
    audio: 'profunda-7',
    titulo: 'Mais pedra do que devia',
    texto:
      'Eu vejo um caminho que teve mais pedra do que devia, e, apesar disso, é notável a sua determinação. Cada conquista que você teve foi fruto do seu próprio esforço. Percebi que poucos foram os que te estenderam a mão ao longo dessa jornada.\n\n'
      + 'Tem dia que você acorda bem, e tem dia em que levantar já é o trabalho inteiro. Alguns dias são mais leves, outros pesam mais do que deveriam. E esse peso parece não ser só seu.\n\n'
      + 'Houve mudanças importantes na sua vida num período recente.\n\n'
      + 'Quanto ao amor: essa pessoa por quem você tem um sentimento não te trouxe a felicidade que você merecia. Pelo contrário, te fez sofrer. E mesmo distante, ela ainda ocupa os seus pensamentos.',
  }),

  Object.freeze({
    id: 'profunda-8',
    audio: 'profunda-8',
    titulo: 'O nó não se desfez num dia',
    texto:
      'Agora eu preciso te dizer uma coisa sobre o que essas três cartas mostraram.\n\n'
      + 'O nó que apareceu ali não se desfez num dia, e não vai se desfazer num dia também. Ele foi sendo apertado aos poucos — uma conversa que não aconteceu, uma resposta que ficou fria, um silêncio que durou mais do que devia.\n\n'
      + 'E é por isso que eu não vou te prometer uma virada de um dia para o outro. Quem te promete isso está te vendendo pressa, e pressa em assunto de amor costuma apertar mais o nó.\n\n'
      + 'O que eu vou te oferecer é outra coisa: tempo. Treze luas, uma de cada vez, e cada uma delas com um trabalho seu.',
  }),

  Object.freeze({
    id: 'profunda-9',
    audio: 'profunda-9',
    titulo: 'Treze luas num ano',
    texto:
      'Você já reparou que a lua não se repete nunca igual? Ela leva vinte e nove dias e meio para fechar uma volta inteira. Não é vinte e oito, não é um mês do calendário: é vinte e nove dias e meio, contados no céu.\n\n'
      + 'E são treze dessas voltas. Treze luas.\n\n'
      + 'Foi assim que eu montei o seu caminho. Cada lua é um trabalho diferente, e ele começa na noite em que a lua nasce escura e fecha quando ela escurece de novo.\n\n'
      + 'A primeira lua é para nomear o que aconteceu, com as suas palavras, sem arrumar a frase para ninguém. A sexta é para olhar a sua parte, e ela vem no meio do caminho de propósito, porque perguntada cedo demais essa pergunta vira culpa.\n\n'
      + 'E agora eu vou te dizer a única coisa que eu prometo aqui dentro. O que você escrever na primeira lua fica guardado neste telefone. E na décima terceira, quando a lua fechar a volta inteira e chegar de novo no mesmo ponto do céu, eu te devolvo aquilo do seu jeito, com a data do dia em que você escreveu, sem uma vírgula mudada.\n\n'
      + 'Não é a promessa que você queria ouvir de mim. Mas é a única que eu consigo cumprir — e essa eu cumpro.',
  }),

  Object.freeze({
    id: 'profunda-10',
    audio: 'profunda-10',
    titulo: 'Cinco minutos, todo dia',
    texto:
      'Agora, todo dia você vai abrir isso aqui e vai encontrar três coisas.\n\n'
      + 'A primeira é o céu daquele dia. Em que fase a lua está, que dia da semana é no calendário antigo — porque cada dia tem o seu planeta, e isso é mais velho que qualquer um de nós.\n\n'
      /* A SEGUNDA COISA NAO ENSINA GESTO NENHUM — decisao do dono, 01/09.
       * A versao anterior deste trecho entregava a xicara e a mao passo a passo,
       * no audio, antes do paywall — no mesmo dia em que os passos foram
       * trancados atras da assinatura (screens/PlanoScreen.js). O bloco vendia
       * de graça o que o app passou a cobrar, e ainda desmentia o proprio bloco
       * 11 ("o que nao abre sozinho e o como se faz"). Aqui fica so o contorno:
       * quantos sao, que tem nome e hora, e UMA pista concreta por gesto — o
       * suficiente para a curiosidade, nada do como. */
      + 'A segunda é o trabalho do dia. São cinco gestos que giram com o céu, cada um com o seu nome e a sua hora certa de aparecer. Um deles usa uma coisa que está na sua cozinha agora. Outro não pede nada além de você. Qual cai em qual dia, não sou eu que escolho e não é você: é o dia que escolhe.\n\n'
      + 'O como se faz de cada um eu não vou te contar agora — e não é segredo pra te prender: é que o gesto perde a força se você souber dele antes da hora. O que eu te digo é o tamanho: cinco minutos. Não importa a hora, não importa o lugar. Esse é o preço, e é o preço inteiro.\n\n'
      + 'Mas tem uma condição, e essa não se negocia: é todo dia. Um gesto prepara o seguinte, e é a repetição que trabalha — como o sono: não existe dormir a semana inteira numa noite só.\n\n'
      /* A PONTE — a resposta a pergunta "e isso traz a pessoa de volta como?".
       * Nomeia o objetivo DELA (a volta) sem prometer o desfecho; "quando houver
       * conversa" e condicional de proposito, para nao mandar ninguem procurar
       * quem esta em contato zero (o filtro duro de lib/plano.js continua
       * mandando). Neutra de genero porque este audio e um so para todos. */
      + 'E o que isso tem a ver com essa pessoa voltar? Tudo. Correr atrás não traz ninguém — isso você já sabe. Esses gestos viram o jogo: cada dia arruma um pedaço seu, até reaparecer a versão sua que essa pessoa escolheu lá no começo. E quando houver conversa, o plano entra junto: a hora de responder, a hora do silêncio, o que não se diz. Isso não é esperança. É estratégia, um dia de cada vez.\n\n'
      + 'E a terceira é a sua parte. Uma pergunta que só você responde, escrita aí dentro, que não sai desse telefone e ninguém mais lê.',  }),

  /* O CONVITE. A primeira frase deste bloco e a recusa da promessa, e ela esta
   * numa LINHA SO de proposito: test/copy.test.js reconhece a recusa pelo texto
   * literal, e uma quebra de linha no meio dela faria o portao voltar a acusar a
   * propria recusa como se fosse promessa. Ver RECUSAS_LITERAIS naquele arquivo.
   *
   * UM SO desde 11/09: o texto vale para qualquer pessoa (ver a nota no topo
   * sobre o fecho unico). */
  Object.freeze({
    id: ID_BLOCO_11,
    audio: ID_BLOCO_11,
    titulo: 'A sua primeira lua',
    texto: textoDoFecho(),
  }),
]);

/** Quantos blocos sao. A tela nunca digita 5: ela conta. */
export const TOTAL_PROFUNDA = BLOQUES_PROFUNDA.length;

/**
 * O texto do bloco quebrado em paragrafos, para a tela desenhar um <Cuerpo> por
 * paragrafo em vez de um bloco unico de 200 palavras.
 *
 * A separacao e a linha em branco do proprio texto ('\n\n'). Paragrafo vazio nao
 * entra: uma linha em branco a mais no fim de um texto viraria um <Cuerpo> vazio
 * com margem, e o espaco extra na tela nao teria explicacao nenhuma.
 *
 * @param {{texto?: string}} bloco
 * @returns {string[]}
 */
export function paragrafosDe(bloco) {
  const texto = bloco && typeof bloco.texto === 'string' ? bloco.texto : '';
  return texto
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * O bloco de um id, ou null. Existe para quem chega pelo progresso guardado (um
 * id gravado ontem pode ter sumido do array depois de uma regravacao) — e null
 * ali quer dizer "esse bloco nao existe mais", nunca uma tela quebrada.
 *
 * @param {string} id
 * @returns {object|null}
 */
export function bloqueDe(id) {
  if (!id) return null;
  return BLOQUES_PROFUNDA.find((b) => b.id === id) || null;
}

/* ===================================================================================
   OS TRECHOS — O TEXTO PARTIDO NAS FRASES QUE A VOZ DIZ, COM A HORA DE CADA UMA
   ===================================================================================
   datos/profunda-tempos.json guarda, POR AUDIO, `{ duracao, trechos: [{ ini,
   fim, texto }] }`: 137 frases em sete arquivos — os quatro primeiros blocos mais
   as tres versoes do bloco 11, que tem tres .m4a com duracoes diferentes e por
   isso nao cabem numa entrada so. O TEXTO de cada trecho veio do roteiro
   (e por isso esta certo, com acento e pontuacao); os TEMPOS saem da duracao real
   do .m4a, medida com ffprobe e repartida entre as frases na proporcao do numero
   de caracteres de cada uma. A duracao nao e estimada; o corte dentro dela e
   proporcional, e por isso as frases longas erram alguns decimos.

   Este arquivo nao regenera nem corrige aquele JSON — ele so o COSE ao bloco:

    1. confere que o texto emendado das frases e, palavra por palavra, o `texto`
       do bloco. test/profunda.test.js prova isso; aqui embaixo a checagem e de
       forma, para que um arquivo torto degrade em vez de desenhar errado.
    2. devolve a que PARAGRAFO cada frase pertence, para a tela nao perder o
       respiro do texto ao trocar de paragrafo por frase. Sem isso as 13 frases
       do bloco 9 sairiam como 13 linhas iguais, e a parede de texto que
       `paragrafosDe` existe para evitar voltaria de outro jeito.

   QUANDO NAO HA TEMPO MEDIDO (bloco novo, JSON ausente, JSON quebrado) o retorno
   nao fica vazio: cada PARAGRAFO vira um trecho sem tempo (`ini: null`). A tela
   desenha exatamente o que desenhava antes desta feature, nada acende, e nada
   quebra. E o unico caminho de degradacao que nao exige uma segunda tela.
   =================================================================================== */

/* Achata todo espaco em branco. O JSON de tempos e o texto do bloco quebram as
 * linhas em lugares diferentes (um veio do Whisper, o outro de uma string com
 * '\n\n'), entao comparar cru so acusaria a largura do editor de quem escreveu. */
const achatar = (texto) => String(texto == null ? '' : texto).replace(/\s+/g, ' ').trim();

/**
 * A que paragrafo pertence cada trecho.
 *
 * Anda pelos paragrafos consumindo o inicio de cada um com o texto do trecho da
 * vez. Enquanto o trecho e o comeco do que sobrou do paragrafo, ele e daquele
 * paragrafo; quando o paragrafo acaba, o proximo trecho abre o seguinte.
 *
 * DESALINHOU (alguem editou o texto do bloco sem regravar os tempos)? O trecho
 * fecha o paragrafo corrente e o proximo comeca no seguinte. O texto continua
 * inteiro e na ordem — o que se perde e a quebra de paragrafo, que e o menor
 * estrago possivel para esse erro.
 */
function agruparEmParagrafos(crus, paragrafos) {
  const donos = [];
  let p = 0;
  let restante = achatar(paragrafos[0] || '');

  for (const trecho of crus) {
    while (restante.length === 0 && p + 1 < paragrafos.length) {
      p += 1;
      restante = achatar(paragrafos[p]);
    }
    donos.push(p);
    const texto = achatar(trecho.texto);
    restante = restante.startsWith(texto) ? restante.slice(texto.length).trim() : '';
  }

  return donos;
}

/** Os trechos do JSON servem? Ordem crescente, tempos finitos, texto de verdade. */
function tempoUtilizavel(crus) {
  if (!Array.isArray(crus) || crus.length === 0) return false;
  let anterior = -1;
  for (const trecho of crus) {
    const ini = Number(trecho?.ini);
    const fim = Number(trecho?.fim);
    if (!Number.isFinite(ini) || !Number.isFinite(fim)) return false;
    if (ini < anterior || fim < ini) return false;
    if (achatar(trecho?.texto).length === 0) return false;
    anterior = ini;
  }
  return true;
}

function construirTrechos(bloco) {
  const paragrafos = paragrafosDe(bloco);
  const medido = TEMPOS && typeof TEMPOS === 'object' ? TEMPOS[bloco.audio] : null;
  const crus = medido ? medido.trechos : null;

  if (!tempoUtilizavel(crus)) {
    return paragrafos.map((texto, i) =>
      Object.freeze({ ini: null, fim: null, texto, paragrafo: i })
    );
  }

  const donos = agruparEmParagrafos(crus, paragrafos);
  return crus.map((trecho, i) =>
    Object.freeze({
      ini: Number(trecho.ini),
      fim: Number(trecho.fim),
      texto: String(trecho.texto).trim(),
      paragrafo: donos[i],
    })
  );
}

/* Montada UMA vez, no carregamento do modulo, e congelada. A identidade estavel
 * importa: `useFraseAtual` tem os trechos numa lista de dependencias, e um array
 * novo a cada chamada reiniciaria o relogio do audio a cada render.
 *
 * A chave e o AUDIO, nao o bloco: o bloco 11 e um id so com tres arquivos, e
 * cada arquivo tem os seus proprios segundos. */
/* ===================================================================================
   A LEITURA PROFUNDA B (08/09) — a segunda variante do sorteio de
   lib/variante.js. MESMA essencia da A (reconhecimento -> nao se resolve num
   dia -> treze luas e o espelho -> o que ela encontra todo dia -> a recusa da
   promessa + o loop aberto + a lua nova escrita na tela -> "Vamos?"), com as
   imagens das cartas dela (a montanha, os caminhos, a chave, a ancora, as
   estrelas) e o MESMO final: abrir as treze luas.

   O mesmo contrato da A: `texto` e a transcricao palavra por palavra do .m4a
   (gerado na voz clonada b8boGhcWbCyPtZnKW69X, eleven_multilingual_v2,
   stability 0.5 / similarity 0.85 / style 0.25), e os tempos por frase em
   datos/profunda-tempos.json vieram do alinhamento da propria geracao
   (endpoint with-timestamps). O fecho da B e NEUTRO de genero — um audio so,
   e por isso id e audio sao a mesma palavra nos cinco.
   =================================================================================== */
export const BLOQUES_PROFUNDA_B = Object.freeze([
  Object.freeze({
    id: 'profunda-b1',
    audio: 'profunda-b1',
    titulo: "Uma montanha no caminho",
    texto:
      "Eu vejo uma montanha no seu caminho. Você já tentou contornar, já tentou subir na marra, e a montanha continua ali. Mas o que me chama a atenção não é a montanha. É que você não parou de andar. Tudo o que você conquistou foi no seu próprio passo. Tinha muita gente por perto. Ajudando, quase ninguém.\n\n"
      + "Tem dia que a subida é leve. E tem dia em que a montanha começa na beira da cama. Você conhece esse peso. E esse peso não é só seu: tem pedra aí que foi outra pessoa que deixou, e você carrega como se fosse sua.\n\n"
      + "Teve mudança grande na sua vida num tempo recente, e você ainda está arrumando as coisas no lugar novo.\n\n"
      + "E quanto ao amor: essa pessoa por quem você sente o que sente não te trouxe a paz que você merecia. Trouxe mais peso do que abraço. E mesmo longe, essa pessoa ainda mora nos seus pensamentos. É essa a montanha que apareceu aqui.",
  }),

  Object.freeze({
    id: 'profunda-b2',
    audio: 'profunda-b2',
    titulo: "Não se atravessa num dia",
    texto:
      "Essa montanha não apareceu num dia, e não se atravessa num dia também. Foi subindo pedra por pedra: um deixa pra lá em cima do outro, uma mágoa que você engoliu pra não brigar, um dia em que você fingiu que estava tudo bem.\n\n"
      + "Por isso eu não vou te prometer uma virada de um dia pro outro. Quem te promete atalho nessa montanha está te empurrando pressa. E pressa, em assunto de amor, costuma botar mais pedra em cima.\n\n"
      + "A segunda carta é a que me interessa. Os Caminhos. Uma bifurcação: dois caminhos, e nenhum com placa. Você já está nessa encruzilhada há um tempo, olhando pros dois lados, esperando uma placa. Escolher sem garantia incomoda, eu sei. Mas ficar na encruzilhada também é uma escolha. E essa você já conhece.\n\n"
      + "O que eu vou te oferecer é outra coisa: tempo. Treze luas, uma de cada vez, divididas em treze trechos. E cada trecho com um passo seu.",
  }),

  Object.freeze({
    id: 'profunda-b3',
    audio: 'profunda-b3',
    titulo: "Treze luas e uma chave",
    texto:
      "A lua não tem pressa e não erra a conta. Leva vinte e nove dias e meio pra nascer escura, encher e escurecer de novo. E são treze dessas. Treze luas.\n\n"
      + "Foi por elas que eu dividi a sua montanha em treze trechos. A primeira lua é pra nomear o que aconteceu, com as suas palavras, sem arrumar a frase pra ninguém. A sexta é pra olhar a sua parte, e vem no meio de propósito, porque cedo demais vira culpa.\n\n"
      + "E aqui entra a terceira carta, a Chave. Chave não derruba montanha. O que a chave diz é que existe uma porta nesse assunto. Por cima não dá. O caminho é por dentro, uma lua de cada vez.\n\n"
      + "Agora a única coisa que eu te prometo. O que você escrever na primeira lua fica guardado aqui dentro. Na décima terceira, quando a lua chegar de novo no ponto de onde saiu, eu te devolvo aquela linha do seu jeito. Com a data do dia. Sem uma vírgula fora do lugar.\n\n"
      + "Não é a promessa que você queria ouvir. Mas é a única que eu consigo cumprir. E essa eu cumpro.",
  }),

  Object.freeze({
    id: 'profunda-b4',
    audio: 'profunda-b4',
    titulo: "Cinco minutos, uma âncora",
    texto:
      "Todo dia você abre isso aqui e encontra três coisas.\n\n"
      + "A primeira é o céu daquele dia: a fase da lua.\n\n"
      + "A segunda é o gesto do dia. São cinco gestos que giram com o céu, cada um com o próprio nome e o dia certo de aparecer. Um deles cabe na sua mão. Outro você faz sem sair do lugar. O como se faz fica lá dentro. O que eu te digo é o tamanho: cinco minutos.\n\n"
      + "Mas tem uma condição, e essa não se negocia: é todo dia. É a carta que você raspou por último, a Âncora. Âncora não segura por ser grande. Segura porque está lá quando a água mexe. Esses cinco minutos são a sua âncora, o pedaço do dia que não balança.\n\n"
      + "E o que isso tem a ver com essa pessoa? Tudo, porque a única parte dessa história que depende de você é a sua. Cada dia arruma um pedaço seu. E quando houver conversa, o plano entra junto: a hora de responder, a hora do silêncio. Isso não é esperança. É chão, um dia de cada vez.\n\n"
      + "A terceira é a sua parte: uma pergunta que só você responde. E amanhã, a primeira coisa que você vê é a linha que escreveu hoje. É o fio.",
  }),

  Object.freeze({
    id: 'profunda-b5',
    audio: 'profunda-b5',
    titulo: "Essa estrela é sua",
    texto:
      "Eu não vou te dizer que essa pessoa vai atravessar essa montanha na sua direção. Ninguém pode te dizer isso. Quem diz está inventando. Você já ouviu isso: de um aplicativo, de uma carta, de alguém que cobrou por isso. Foi bom por dois dias. Depois não sobrou nada.\n\n"
      + "A Estrela não tira ninguém da montanha. Só mostra a direção. Direção se acha olhando pra cima. Essa estrela é sua. Se você chegar na décima terceira, vai saber coisas de você que hoje não sabe. Quem sabe isso já não é quem começou a subida.\n\n"
      + "Tem um ponto nessas cartas que eu só te falo depois que você responder a primeira pergunta da primeira lua. A leitura de hoje fica guardada aí dentro. Escreva a sua versão antes de reabrir a minha.\n\n"
      + "E tem uma coisa que eu prefiro falar agora. O gesto do dia vai estar lá te esperando: você vê qual é, quanto tempo custa. O que não abre sozinho é o como se faz. Essa porta, a da chave, eu preciso que você abra decidindo.\n\n"
      + "E eu vou te dizer o que te espera do outro lado dessa porta, porque você tem direito de saber antes de decidir.\n\n"
      + "Todo dia, um passo na montanha. Um só, com o tempo dele contado. As primeiras luas sobem o seu lado: o seu chão, a sua voz, o seu jeito de responder. Depois a chave começa a abrir a outra parte, os passos que essa pessoa vê, um por semana, na ordem certa.\n\n"
      + "Começa com uma frase gentil que não pede nada. Depois um obrigado com endereço, por uma coisa específica. Depois uma pergunta sobre o dia, sem cobrar resposta. Depois uma lembrança boa, dividida sem anzol. Depois dois minutos escutando sem cortar. E lá na frente, quando o pé estiver firme, o convite. E o erro assumido por inteiro, sem mas, que é o degrau que quase ninguém tem coragem de subir.\n\n"
      + "Um degrau não abre antes do outro. Se um deles doer, ou cair no vazio, a gente firma a âncora ali, desce pro seu chão por uns dias, e sobe de novo quando o pé estiver seguro. Não é pressa. É a ordem da subida.\n\n"
      + "Em treze luas, o que essa pessoa vê não é você pedindo. É você diferente. E isso não se explica, se mostra. Você não vai atrás. Você fica impossível de não notar.\n\n"
      + "E tem a hora. A sua primeira lua não começa quando você decide: começa na próxima lua nova, com dia e hora marcados no céu, escritos aqui na tela, agora. A lua não espera ninguém.\n\n"
      + "A sua primeira lua está aí. Vamos?",
  }),
]);

const TRECHOS_POR_AUDIO = new Map();

for (const bloco of [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B]) {
  if (!TRECHOS_POR_AUDIO.has(bloco.audio)) {
    TRECHOS_POR_AUDIO.set(bloco.audio, Object.freeze(construirTrechos(bloco)));
  }
}

const SEM_TRECHOS = Object.freeze([]);

/* id e audio sao a mesma palavra nos cinco blocos desde 11/09 (o 11 deixou de
 * ter versao por genero). Esta funcao fica como ponto unico de traducao para o
 * dia em que um bloco voltar a ter mais de um arquivo. */
/* id e audio sao a mesma palavra nos cinco blocos desde 11/09 (o 11 deixou de
 * ter versao por genero). A funcao fica como ponto unico de traducao para o dia
 * em que um bloco voltar a ter mais de um arquivo. */
function audioDe(id) {
  return id;
}

/**
 * As frases de um bloco, na ordem em que a voz as diz.
 *
 * @param {string} id
 * @returns {ReadonlyArray<{ini:number|null, fim:number|null, texto:string, paragrafo:number}>}
 *   Sempre um array (vazio para id desconhecido), sempre a MESMA instancia para
 *   o mesmo audio, sempre congelado.
 */
export function trechosDe(id) {
  if (!id) return SEM_TRECHOS;

  /* FORA DO PORTUGUES, NINGUEM ACENDE — e e de proposito.
   * profunda-tempos.json cronometra as frases PORTUGUESAS. A frase traduzida
   * cai em outro segundo e tem outro numero de frases: casar os dois acenderia
   * a frase errada enquanto a voz diz outra, que e pior do que nao acender
   * nada. Entao cada PARAGRAFO traduzido vira um trecho sem tempo — o mesmo
   * retorno que este arquivo ja entrega para bloco sem JSON, e a tela desenha
   * exatamente o que desenhava antes do realce existir.
   *
   * Quando houver .m4a traduzido e um profunda-tempos.<lang>.json medido no
   * MESMO commit da gravacao, este ramo passa a ler o JSON do idioma. */
  const lang = idiomaMadre();
  if (lang !== IDIOMA_PADRAO && BLOCOS_POR_IDIOMA[lang]) {
    const chave = `${lang}:${id}`;
    const pronta = CACHE_TRECHOS_TRADUZIDOS.get(chave);
    if (pronta) return pronta;

    const traduzido = BLOCOS_POR_IDIOMA[lang][id];
    if (!traduzido) return TRECHOS_POR_AUDIO.get(audioDe(id)) || SEM_TRECHOS;

    const trechos = Object.freeze(
      paragrafosDe(traduzido).map((texto, i) =>
        Object.freeze({ ini: null, fim: null, texto, paragrafo: i })
      )
    );
    CACHE_TRECHOS_TRADUZIDOS.set(chave, trechos);
    return trechos;
  }

  return TRECHOS_POR_AUDIO.get(audioDe(id)) || SEM_TRECHOS;
}

/**
 * A duracao medida do audio, em segundos, ou 0.
 *
 * Serve de reserva para o `progresso` de `useFraseAtual`: `player.duration` so
 * e conhecido depois de o arquivo carregar, e ate la uma barra desenhada com ele
 * ficaria parada no zero.
 *
 * @param {string} id
 * @returns {number}
 */
export function duracaoDe(id) {
  if (!id) return 0;
  const medido = TEMPOS && typeof TEMPOS === 'object' ? TEMPOS[audioDe(id)] : null;
  const duracao = Number(medido?.duracao);
  return Number.isFinite(duracao) && duracao > 0 ? duracao : 0;
}

/* ===================================================================================
   OS OUTROS DOIS IDIOMAS (ONDA 2)
   ===================================================================================
   O mesmo molde de datos/textos.js: um objeto por idioma, um mapa, e o idioma
   ativo lido do espelho de modulo de textos.js na HORA da chamada. Import
   estatico, nao dinamico — o Metro precisa ver as tres pontas em tempo de build.

   O QUE MUDA, E O QUE **NAO** MUDA
   --------------------------------
   `titulo` e `texto` vem do arquivo do idioma, com fallback campo a campo para o
   portugues. `id` e `audio` NAO mudam nunca: o primeiro e o que lib/profunda.js
   grava como "ja ouvido" e o segundo e nome de arquivo .m4a resolvido por require
   ESTATICO pelo Metro.

   O CONTRATO "TEXTO = VOZ" VALE SO NO PORTUGUES, E ISSO E DECLARADO
   -----------------------------------------------------------------
   Os dez .m4a existem so em portugues. Em es/en a pessoa LE traduzido e OUVE
   portugues — os cabecalhos de datos/profunda.es.js e datos/profunda.en.js
   dizem isso em voz alta, e o teste de "palavra por palavra" contra
   docs/ROTEIRO-LEITURA-PROFUNDA.md continua varrendo o PT, que e de onde a
   regra nasce.

   E O REALCE POR FRASE DESLIGA, DE PROPOSITO
   ------------------------------------------
   datos/profunda-tempos.json tem o segundo de cada frase PORTUGUESA. Casar
   aquele tempo com a frase traduzida acenderia a frase errada — pior do que nao
   acender nenhuma. Entao `trechosDe` devolve os PARAGRAFOS com `ini: null` fora
   do portugues: o caminho de degradacao que este arquivo ja documenta
   ("a tela desenha exatamente o que desenhava antes desta feature, nada acende,
   e nada quebra"). Quando houver audio traduzido, entra um
   profunda-tempos.<lang>.json e este ramo passa a consultar o JSON do idioma. */
import { PROFUNDA_ES } from './profunda.es.js';
import { PROFUNDA_EN } from './profunda.en.js';
import { IDIOMA_PADRAO, idiomaMadre } from './textos.js';

const BLOCOS_POR_IDIOMA = { es: PROFUNDA_ES, en: PROFUNDA_EN };

/* Lista explicita, e nao "tudo que nao e id/audio": um campo novo no bloco nasce
 * em portugues nos tres idiomas (fallback honesto) em vez de nascer traduzido
 * por acidente. */
const CAMPOS_TRADUZIVEIS = ['titulo', 'texto'];

/* Cache por IDIOMA: a tela tem `blocos` e `trechos` em listas de dependencia de
 * useMemo, e um array novo a cada render reiniciaria o relogio do audio. */
const CACHE_BLOCOS = new Map();
const CACHE_TRECHOS_TRADUZIDOS = new Map();

/** Um bloco no idioma ativo. PT devolve a MESMA instancia congelada. */
function blocoNoIdioma(bloco, dicionario) {
  const traduzido = dicionario[bloco.id];
  if (!traduzido) return bloco;

  const copia = { ...bloco };
  for (const campo of CAMPOS_TRADUZIVEIS) {
    const valor = traduzido[campo];
    // `== null` e nao `||`: string vazia e defeito de traducao, nao fallback
    // escondido — cai no PT em vez de desenhar um card em branco.
    if (valor != null && String(valor).trim() !== '') copia[campo] = valor;
  }
  return Object.freeze(copia);
}

/** Os blocos de uma lista, no idioma ativo, memoizados por idioma + variante. */
function listaNoIdioma(blocos, etiqueta) {
  const lang = idiomaMadre();
  if (lang === IDIOMA_PADRAO) return blocos;

  const dicionario = BLOCOS_POR_IDIOMA[lang];
  if (!dicionario) return blocos;

  const chave = `${lang}:${etiqueta}`;
  const pronta = CACHE_BLOCOS.get(chave);
  if (pronta) return pronta;

  const traduzida = Object.freeze(blocos.map((b) => blocoNoIdioma(b, dicionario)));
  CACHE_BLOCOS.set(chave, traduzida);
  return traduzida;
}

/**
 * Os blocos da variante, NO IDIOMA ATIVO. 'b' devolve a B inteira; qualquer
 * outra coisa (ou uma B ainda vazia) devolve a A — a tela nunca fica sem
 * leitura.
 */
export function blocosDaVariante(variante) {
  if (variante === 'b' && BLOQUES_PROFUNDA_B.length > 0) {
    return listaNoIdioma(BLOQUES_PROFUNDA_B, 'b');
  }
  return listaNoIdioma(BLOQUES_PROFUNDA, 'a');
}

export default BLOQUES_PROFUNDA;
