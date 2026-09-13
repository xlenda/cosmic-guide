// datos/rituais.js
// OS CINCO RITUAIS QUE GIRAM — a tabela de conteudo. Sem motor, sem disco, sem
// tela. Comentarios em portugues, como em datos/ritual.js e datos/preguntas.js.
//
// ===========================================================================
// ATENCAO AO NOME: ESTE ARQUIVO NAO E datos/ritual.js
// ===========================================================================
// Existem DOIS arquivos com nome quase igual e papeis que nao se misturam:
//
//   datos/ritual.js  (singular) — O RITUAL DE SETE DIAS. Uma trilha com comeco,
//                    meio e FIM marcado no dia 7. Tem pacto, tem progresso
//                    gravado no disco ('ritual'), acaba.
//
//   datos/rituais.js (plural, este) — OS CINCO RITUAIS ROTATIVOS. O gesto do
//                    dia, que gira e nao acaba. Nao grava nada, nao tem
//                    progresso, nao tem dia 7. Quem escolhe o do dia e
//                    lib/rituaisRotativos.js, so pela data local.
//
// Os dois convivem: o de sete dias e uma temporada; estes cinco sao o dia a dia
// depois (e durante). Se voce veio consertar "o ritual" e nao sabe qual, e
// porque abriu o arquivo errado.
//
// ===========================================================================
// POR QUE CINCO, E POR QUE ELES GIRAM
// ===========================================================================
// Pedido do dono, na palavra dele: "hoje e dia do ritual do cafe, hoje e dia da
// leitura da mao". O valor esta na TROCA. Um app de tarot que abre igual todo
// dia vira notificacao ignorada na terceira semana; cinco gestos diferentes
// girando fazem o mesmo app ter cinco caras.
//
// Cinco e o numero certo por medida, nao por gosto: com quatro, um deles cai
// mais de uma vez por semana e a repeticao aparece; com seis ou mais, o ritual
// mais raro passa quinze dias sumido e a pessoa esquece que existe.
//
// ===========================================================================
// O FORMATO DE UM RITUAL (todos os campos obrigatorios)
// ===========================================================================
//   id            — chave tecnica, sem acento, nunca visivel. E o que
//                   lib/rituaisRotativos.js poe na ESCALA e o que a tela guarda
//                   se algum dia guardar alguma coisa.
//   nome          — como ele se chama na tela. Curto, sem numero, sem promessa.
//   gesto         — O QUE ELA FAZ COM AS MAOS, numa frase. E o campo mais
//                   importante do arquivo: se nao da para descrever o gesto sem
//                   falar de efeito, o ritual nao entra aqui.
//   duracao       — o preco declarado, em texto. Todos custam '5 minutos', o
//                   mesmo preco do PACTO em datos/ritual.js. Preco declarado e
//                   preco unico: dois numeros diferentes no mesmo app viram
//                   desconfianca.
//   abertura      — a frase que abre o dia. Fala com ela. Nunca sobre a outra
//                   pessoa, nunca sobre amanha.
//   comoFazer     — ARRAY de passos curtos, todo verbo de acao OBSERVAVEL
//                   ("vire", "olhe", "escreva"). Nada de "sinta", "conecte-se",
//                   "permita-se": verbo que ninguem consegue conferir e verbo
//                   que a pessoa acha que fez errado.
//                   "ESCREVA" AQUI E LEGITIMO, e a distincao custou uma medida:
//                   escrever nao e sair. O passo pede palavra num papel que fica
//                   neste telefone, que e o oposto de mandar recado. Por isso o
//                   imperativo solto saiu de PATRONES_CONTACTO (ver o bloco 1 de
//                   lib/lectura.js) — o que continua caindo, e tem de continuar
//                   caindo, e "escreva PRA ELA" e "escreva uma mensagem".
//   fecho         — uma frase que fecha. CONSTATA o que ela acabou de fazer.
//                   Nao promete nada, nao adivinha o amanha, nao fala de
//                   terceiro.
//   precisaCamera — true so no cafe. Ver o bloco A CAMERA, abaixo.
//   fonte         — { obra, autor, quando, nota } quando ha tradicao datavel
//                   por tras, ou null. Ver O RECIBO, abaixo.
//   naoTemFonte   — string declarando a ausencia, obrigatoria quando fonte e
//                   null. Ausencia declarada e diferente de ausencia escondida.
//
// Um alias DERIVADO, gerado no map do fim do arquivo e nunca digitado:
// `comoFazerTexto` (os passos juntos numa string). Mesma solucao de
// datos/ritual.js com `lectura` e `gesto.texto`: dois campos digitados a mao
// acabam discordando, e a discordancia sai na tela como o app dizendo duas
// coisas diferentes sobre o mesmo gesto.
//
// ===========================================================================
// A CAMERA — e o unico ritual que a pede, e o que o app NAO faz com a foto
// ===========================================================================
// So o cafe pede camera, e ele pede para REGISTRAR, nao para analisar. Quem
// olha a borra e escolhe a figura e ELA; o app guarda a foto e a palavra que ela
// escolheu, e nada mais acontece com a imagem.
//
// DENTRO DO COSMIC GUIDE ISSO GANHOU UM SEGUNDO ANDAR (11/09/2026, a solda de
// cafe/mao — ver o ★ em screens/PlanoScreen.js). O texto acima continua descrevendo
// o GESTO, e o gesto nao mudou: ela vira a xicara, olha, fotografa e escolhe UMA
// palavra, e essa palavra ninguem corrige. O que mudou e que agora existe uma porta
// ao lado do gesto: o botao do dia abre a leitura da borra do COSMIC, que tem
// servidor de visao e devolve um texto sobre a imagem.
//
// As duas coisas convivem sem se contradizer justamente porque a ordem e essa — a
// palavra dela primeiro, a leitura depois e so se ela quiser. O que NAO pode voltar
// a ser escrito aqui e "nada analisa a imagem": era verdade no Fio Vermelho
// autonomo (que segue assim, em madre-maria.vercel.app) e deixou de ser verdade
// neste modulo. Os textos visiveis foram revisados junto da solda —
// 'plano.tela.ritual.camera', 'privacidad.red.cuerpo', 'privacidad.no.lineas' e
// 'metodo.offline.pie' em datos/textos.js.
//
// A mao NAO pede camera POR ESTE CATALOGO, e o motivo original continua de pe: ela
// olha a propria palma e escolhe a linha, e foto de mao e dado biometrico numa
// ficha de loja. Quem pede foto no dia da mao e a tela do Cosmic, se ela abrir — a
// decisao e dela e a ficha e a de la, nao a nossa.
//
// ===========================================================================
// O RECIBO — o que este arquivo afirma sobre historia
// ===========================================================================
// Quatro dos cinco tem tradicao datavel atras. Cada um declara obra, autor e
// quando, e a `nota` diz o que a fonte NAO sustenta — porque a mentira comum
// nao e inventar a fonte, e deixar a fonte parecer sustentar mais do que
// sustenta ("os antigos ja sabiam que...").
//
// O respiro nao tem fonte antiga e diz isso em voz alta em `naoTemFonte`. E o
// unico que nao pede material nenhum, e e ele que segura o dia em que a pessoa
// nao tem cafe, nem sonho lembrado, nem vontade de mexer no baralho.
//
// ===========================================================================
// AS TRES LINHAS QUE NENHUM TEXTO DAQUI ATRAVESSA
// ===========================================================================
//  1. NENHUM CEU FABRICADO. Este arquivo nao fala de lua, de transito nem de
//     dia astrologico. Quem cruza o gesto com o ceu e outro modulo, e la o ceu
//     ou existe (efemeride) ou o bloco nao renderiza. Aqui nao ha o que
//     estimar, entao nao ha como estimar errado.
//  2. NENHUM DESFECHO PROMETIDO, e nenhum gesto que aja sobre outra pessoa. O
//     ritual e sobre quem esta segurando o telefone. "Voce olhou a borra e
//     escolheu uma palavra" e constatacao; qualquer frase sobre o que a outra
//     pessoa vai fazer depois disso e mentira e alegacao sobre terceiro.
//  3. NENHUM EMPURRAO PARA O CONTATO. Nenhum dos cinco manda procurar,
//     escrever, ligar ou aparecer. Isso nao e cuidado extra: duas das cinco
//     respostas da pergunta 4 do onboarding sao 'le-escribi-no-responde' e
//     'cero-contacto' (IDS_CONTACTO_DURO em datos/preguntas.js), e para quem
//     respondeu qualquer uma delas um gesto de contato e o app empurrando a
//     pessoa para o lugar mais doloroso que ela tem.
//
//     E ISTO E COBRADO, NAO PROMETIDO — e a diferenca nao e retorica. Durante
//     um tempo a linha acima terminava em "por construcao os cinco rituais estao
//     livres desse filtro", e "por construcao" queria dizer NADA MEDIA: nenhum
//     teste varria este arquivo e a rede de runtime de lib/plano.js varria o
//     OUTRO catalogo (datos/plano.js), que a tela do plano nao desenha. Este
//     arquivo e o que ela le, e ele ia inteiro e cru para a tela de quem
//     respondeu 'cero-contacto'.
//
//     O que a primeira medicao encontrou: a abertura da MAO dizia "segue ela com
//     o dedo ate onde ela vai" — a linha da mao, mas "ela vai" e exatamente o
//     padrao de falar PELA outra pessoa, e num app sobre um vinculo que nao
//     fechou a leitura errada e a primeira que ocorre. Foi reescrita.
//
//     Hoje ha as duas coisas, e as duas sao necessarias: test/madremaria-plano.test.js
//     varre este arquivo inteiro com sugiereContacto(), e ritualSeguroDoDia()
//     (lib/plano.js) passa os campos visiveis pela rede em runtime quando o
//     contato e duro ou ha bloqueio — porque o teste protege o texto de hoje e a
//     rede protege a linha que alguem acrescentar aqui daqui a tres meses.
//
// E valem as gerais que test/copy-promessa-app-inteiro.test.js cobra: sem prova social inventada,
// sem alegacao de saude (nenhum destes gestos "acalma", "trata" ou "alivia"
// coisa nenhuma — o texto descreve o gesto e para), sem assumir genero de quem
// esta do outro lado, sem punir falta, sem cor literal fora do theme.js.
//
// ===========================================================================
// DISCO: NADA. Este arquivo nao cria chave de armazenamento nenhuma, e
// lib/rituaisRotativos.js tambem nao — a escolha do dia sai da data local, sem
// gravar. Por isso nao ha nada a acrescentar em CLAVES_HILO_ROJO
// (screens/AjustesScreen.js). No dia em que alguem quiser guardar "os rituais
// que ela ja fez", a chave nova entra NAQUELA lista antes de qualquer outra
// coisa, senao ela sobrevive ao "Borrar todo" e a politica de privacidade da
// ficha de loja vira declaracao falsa.
// ===========================================================================

import { RITUAIS as EN } from './rituais.en.js';
import { RITUAIS as ES } from './rituais.es.js';
import { traduzido } from './traduzir.js';

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * OS CINCO. A ordem aqui e so de leitura humana — quem decide o dia e a ESCALA
 * de lib/rituaisRotativos.js. Trocar a ordem deste array NAO muda o ritual de
 * hoje, e isso e de proposito: ordem de catalogo virando ordem de exibicao foi
 * exatamente o bug que fez um app irmao mostrar quatro dias seguidos do mesmo
 * texto.
 * ================================================================================= */
const RITUAIS_BASE = [
  /* --- CAFE ----------------------------------------------------------------------
   * O unico com camera, e o mais fotogenico dos cinco — e o que o dono cita
   * primeiro. A borra e o material; a figura e escolha DELA.
   *
   * A fonte e boa e e checavel, e a nota existe para segurar o exagero: ler
   * borra e pratica documentada ha seculos, mas o dicionario de figuras que
   * circula hoje foi organizado na Inglaterra do inicio do seculo XX, e nao ha
   * nada de antigo nele. */
  {
    id: 'cafe',
    nome: 'A borra do café',
    gesto: 'Virar a xícara vazia no pires e olhar o desenho que a borra deixou.',
    duracao: '5 minutos',
    abertura:
      'Hoje o dia é da borra. Você toma o café até o fim, vira a xícara e olha o que ficou desenhado ali. Ninguém aqui vai dizer o que a figura é: quem escolhe a palavra é você.',
    comoFazer: [
      'Tome o café até sobrar só a borra no fundo.',
      'Vire a xícara de boca para baixo no pires e conte até dez.',
      'Desvire e olhe o desenho por alguns segundos, sem procurar nada específico.',
      'Fotografe a xícara.',
      'Escolha UMA palavra para o que você viu e escreva embaixo da foto.',
    ],
    fecho:
      'Ficaram uma foto e uma palavra, com a data de hoje. A palavra é sua: nada aqui a corrigiu.',
    precisaCamera: true,
    fonte: {
      obra: 'Telling Fortunes by Tea Leaves',
      autor: 'Cicely Kent',
      quando: 'Londres, 1922',
      nota: 'Ler o que a borra deixa na xícara é prática antiga e espalhada, mas o repertório de figuras que circula hoje foi organizado em manuais ingleses do começo do século XX. O manual descreve figuras; ele não afirma que elas informem sobre outra pessoa.',
    },
    naoTemFonte: null,
  },

  /* --- MAO -----------------------------------------------------------------------
   * Sem camera, e a ausencia dela e o desenho (ver o bloco A CAMERA no topo).
   *
   * A nota carrega as duas ressalvas que os manuais escondem: o tratado "de
   * Aristoteles" que eles citam nao esta nas obras dele, e o sistema de montes e
   * linhas usado hoje e europeu do seculo XIX, nao da antiguidade. E nao ha uma
   * palavra sobre corpo ou saude neste ritual — a mao aqui e um desenho que ela
   * olha, e so. */
  {
    id: 'mao',
    nome: 'A linha da própria mão',
    gesto: 'Abrir a própria palma sob uma luz e seguir uma linha com o dedo, do começo ao fim.',
    duracao: '5 minutos',
    abertura:
      'Hoje o dia é da sua mão. Você abre a palma, escolhe uma linha e percorre ela com o dedo até onde o traço termina. É um desenho que está com você o dia inteiro e que você quase nunca olha.',
    comoFazer: [
      'Abra a mão que você usa menos, sob uma luz direta.',
      'Escolha UMA linha, a que puxar seu olho primeiro.',
      'Percorra ela com o dedo da outra mão, devagar, do começo até onde ela some.',
      'Repare onde ela é funda, onde ela se parte e onde outra linha cruza.',
      'Escreva uma frase sobre o que você viu no desenho — não sobre o que ele significa.',
    ],
    fecho: 'Você olhou a própria mão por cinco minutos e deixou uma frase escrita sobre ela.',
    precisaCamera: false,
    fonte: {
      obra: 'A Manual of Cheirosophy',
      autor: 'Edward Heron-Allen',
      quando: 'Londres, 1885',
      nota: 'O sistema de montes, tipos de mão e nomes das linhas que os manuais usam hoje foi organizado na Europa do século XIX. O tratado atribuído a Aristóteles que esses manuais costumam citar não está entre as obras dele. Nada disto substitui exame médico, e este ritual não afirma nada sobre o corpo de ninguém.',
    },
    naoTemFonte: null,
  },

  /* --- CARTAS --------------------------------------------------------------------
   * A tiragem que o app JA TEM. Este ritual nao inventa mecanica nenhuma: no dia
   * das cartas a tela abre a tirada de sempre (RUTAS.TIRADA, lib/mazo.js), e o
   * ritual e so o enquadramento do dia.
   *
   * Ele existe na escala por um motivo de produto: sem ele, o dia das cartas
   * viraria "o dia em que o app nao tem ritual", e a coisa central do produto
   * acabaria como buraco na rotacao. */
  {
    id: 'cartas',
    /* REESCRITO EM 01/09 — antes era "A tiragem de sempre": cortar um baralho
     * de 78 na TiradaScreen, com album e fichas. O dono mandou tirar toda
     * tiragem de dentro do app; o que ficou de cartas e a leitura DELA — as
     * tres fixas do funil, com a voz — e este gesto e reabri-la. O destino em
     * screens/PlanoScreen.js aponta para RUTAS.REOUVIR_ENTRADA. */
    nome: 'As três de sempre',
    gesto: 'Reabrir a sua leitura e ouvir uma das três até o fim.',
    duracao: '5 minutos',
    abertura:
      'Hoje o dia é das suas três cartas — as mesmas que te trouxeram até aqui. Elas não mudam. Quem muda, de lua em lua, é quem lê.',
    comoFazer: [
      'Reabra a sua leitura.',
      'Releia as três na ordem, sem pressa.',
      'Escolha a que mais mexer com você hoje — pode não ser a mesma da última vez.',
      'Ouça o áudio dela até o fim, sem fazer outra coisa enquanto ouve.',
    ],
    fecho: 'A leitura é a mesma. O que muda é o ouvido — e é isso que este gesto mede.',
    precisaCamera: false,
    fonte: {
      obra: 'Das Spiel der Hoffnung',
      autor: 'Johann Kaspar Hechtel',
      quando: 'Nuremberg, 1799',
      nota: 'O jogo de 36 cartas de onde saíram as três desta leitura. Virou "baralho Lenormand" só em 1846, dois anos depois da morte de Marie Anne Lenormand — o nome dela foi emprestado à revelia, e é por isso que a fonte aqui é o jogo original, não a lenda.',
    },
    naoTemFonte: null,
  },

  /* --- SONHO ---------------------------------------------------------------------
   * Entrada por TEXTO, nunca por foto. E o unico ritual que so funciona de manha,
   * e o texto assume isso em vez de fingir que serve para qualquer hora.
   *
   * A nota e a parte mais importante do recibo do arquivo inteiro: Artemidoro
   * passou cinco livros dizendo que sonho nao se le por dicionario de simbolo
   * fixo. Por isso o passo 5 pede o que ELA achou, e o app nao devolve
   * significado nenhum. Se algum dia o Fio Vermelho ganhar um catalogo de
   * simbolos de sonho, e essa a regua. */
  {
    id: 'sonho',
    /* REFORMULADO em 01/09 apos a objecao do dono: "e se ele sonhou apenas um
     * dia?" — o gesto nao pode depender de sonho vir. Agora a NOITE e o
     * material: veio sonho, escreve o sonho; nao veio, escreve o acordar. Todo
     * mundo acorda de algum jeito, entao o gesto nunca trava. */
    nome: 'O que a noite deixou',
    gesto: 'Escrever o que a noite deixou — o sonho, ou o jeito de acordar.',
    duracao: '5 minutos',
    abertura:
      'Hoje o dia é da noite que passou. Veio sonho? Vale o pedaço solto, a cena sem pé nem cabeça. Não veio? Também serve — o jeito como você acordou é recado do mesmo lugar.',
    comoFazer: [
      'Se veio sonho, escreva o que sobrou, na ordem bagunçada em que vier.',
      'Se não veio, escreva como você acordou: o corpo, o humor, a primeira coisa que pensou.',
      'Anote quem aparecia — no sonho, ou no primeiro pensamento.',
      'Sublinhe a imagem mais forte do que você escreveu.',
      'Escreva o que VOCÊ acha que ela é. O app não vai te dar significado nenhum.',
    ],
    fecho: 'O que a noite deixou está escrito com a data. Daqui a um mês ainda vai estar aqui.',
    precisaCamera: false,
    fonte: {
      obra: 'Oneirocritica',
      autor: 'Artemidoro de Daldis',
      quando: 'século II d.C.',
      nota: 'É o tratado de sonhos mais completo que chegou da antiguidade — e ele passa cinco livros insistindo que o mesmo sonho quer dizer coisas diferentes conforme quem sonhou. Por isso aqui não existe dicionário de símbolos: o registro é seu e a leitura dele também.',
    },
    naoTemFonte: null,
  },

  /* --- RESPIRO -------------------------------------------------------------------
   * O unico sem material nenhum, e o unico sem fonte. Ele existe para o dia
   * ruim: sem cafe em casa, sem sonho lembrado, sem vontade de baralho. Um
   * catalogo em que todo ritual pede alguma coisa e um catalogo que, no pior
   * dia, nao tem nada a oferecer.
   *
   * ATENCAO AO TEXTO DESTE AQUI, que e onde e mais facil escorregar: ele NAO
   * acalma, NAO alivia, NAO trata e NAO organiza pensamento nenhum. Descrever
   * efeito no corpo ou na mente e alegacao de saude — reprova em
   * test/copy-promessa-app-inteiro.test.js e reprova na ficha da loja. O texto diz o que ela FAZ com
   * as maos e com o telefone, e para por ai.
   *
   * A "contencao" do nome tambem nao e moral: a regra e sobre o aparelho ficar
   * virado por cinco minutos, nao sobre ela nao escrever para ninguem. O app
   * nao manda procurar e tambem nao manda deixar de procurar — isso e dela. */
  {
    id: 'caminhada',
    nome: 'A caminhada de reparar',
    gesto: 'Sair a pé, cinco minutos, e voltar com UMA coisa nunca vista.',
    duracao: '5 minutos',
    abertura:
      'Hoje o dia é da rua. Não é exercício: é sair da órbita do telefone e voltar com um detalhe que sempre esteve lá e você nunca tinha visto.',
    comoFazer: [
      'Saia a pé, sem fone e sem rumo marcado — o quarteirão basta.',
      'Ande olhando para cima e para os lados, não para o chão.',
      'Escolha UMA coisa que você nunca tinha reparado: uma janela, uma árvore, um som.',
      'Volte e escreva essa coisa em uma linha, na pergunta de hoje.',
    ],
    fecho: 'A rua era a mesma ontem. O que mudou foi o olho — e olho treinado em reparar vê o que a rotina esconde.',
    precisaCamera: false,
    fonte: {
      obra: 'Les Rêveries du promeneur solitaire',
      autor: 'Jean-Jacques Rousseau',
      quando: 'Paris, 1782',
      nota: 'O livro que fez da caminhada sem rumo um método de se escutar: Rousseau saía a pé para pôr a cabeça em ordem e anotava, ao voltar, o que a estrada tinha mostrado.',
    },
  },

  {
    id: 'canto',
    nome: 'Um canto em ordem',
    gesto: 'Escolher um canto pequeno e deixar em ordem, com as mãos.',
    duracao: '5 minutos',
    abertura:
      'Hoje o dia é de arrumar UM canto — a gaveta, a mesinha, a bolsa. Um só, pequeno de propósito: o que couber em cinco minutos.',
    comoFazer: [
      'Escolha o canto antes de começar, e não troque no meio.',
      'Tire tudo dele, sem julgar nada.',
      'Devolva só o que fica; o resto tem dois destinos: o lixo, ou outro lugar.',
      'Olhe o canto pronto por dez segundos, sem mexer em mais nada.',
    ],
    fecho: 'Ninguém arruma a vida inteira num dia. Um canto por vez é como qualquer coisa grande se faz.',
    precisaCamera: false,
    naoTemFonte:
      'Este gesto não tem tratado antigo por trás, e preferimos dizer isso a inventar um. Ele está aqui porque arrumar com as mãos aquieta a cabeça — e um canto em ordem é um pedaço do dia sob o seu comando.',
  },

  {
    id: 'respiro',
    nome: 'Cinco minutos parada',
    gesto: 'Sentar, virar o telefone para baixo e contar as respirações até chegar a vinte.',
    duracao: '5 minutos',
    abertura:
      'Hoje o dia não pede material nenhum: nem xícara, nem baralho, nem caderno. Só cinco minutos em que a única tarefa é contar até vinte.',
    comoFazer: [
      'Sente onde você estiver e apoie os dois pés no chão.',
      'Vire o telefone com a tela para baixo.',
      'Conte vinte respirações inteiras, uma a uma.',
      'Se você perder a conta, comece do um de novo — perder a conta faz parte.',
      'Desvire o telefone e marque o dia.',
    ],
    fecho: 'Cinco minutos em que você não fez mais nada. O dia de hoje está marcado.',
    precisaCamera: false,
    fonte: null,
    naoTemFonte:
      'Contar respirações sentada: prática contemporânea, sem fonte antiga localizada. Existem tradições que contam a respiração há muito tempo, mas nenhuma delas descreve este gesto assim, com este número e nesta duração — então não há obra a citar, e inventar uma seria pior que não ter nenhuma.',
  },
];

/* =================================================================================
 * RITUAIS — o que motor e telas consomem.
 *
 * `comoFazerTexto` sai daqui, de uma origem so: nao ha como ele ficar para tras
 * numa correcao de passo, porque ninguem o digita. A tela que quiser lista usa
 * `comoFazer`; a que quiser paragrafo (ou o card compartilhavel) usa
 * `comoFazerTexto`.
 * ================================================================================= */
export const RITUAIS = congelar(
  RITUAIS_BASE.map((r) => ({
    ...r,
    comoFazerTexto: r.comoFazer.join(' '),
  }))
);

/** 5. Ninguem digita esse numero na tela nem no motor. */
export const TOTAL_RITUAIS = RITUAIS.length;

/** Os ids, na ordem do catalogo. A ESCALA de lib/rituaisRotativos.js e conferida
 * contra esta lista: id na escala que nao existe aqui e toque morto. */
export const IDS_RITUAIS = congelar(RITUAIS.map((r) => r.id));

/**
 * O ritual pelo id. Devolve undefined quando nao existe — nunca lanca. Um id
 * que nao existe tem de aparecer como ausencia, nunca como um ritual errado com
 * cara de certo.
 *
 * JA NO IDIOMA ATIVO (ver OS TRES IDIOMAS, abaixo). Traduzir AQUI e nao na tela
 * e o que mantem a ORDEM certa da cadeia: lib/rituaisRotativos.js chama este
 * getter, lib/plano.js (ritualSeguroDoDia) passa o que sai dele pela REDE DE
 * CONTATO, e so depois a tela desenha. Se a traducao entrasse depois da rede, o
 * texto que a rede acabou de retirar voltaria em espanhol — a protecao
 * desligada em silencio, exatamente o buraco que o cabecalho descreve.
 *
 * `comoFazerTexto` continua sendo recomposto por lib/plano.js a partir dos
 * passos que sobraram, e agora ele recompoe os passos JA traduzidos.
 */
export function getRitual(id) {
  const base = RITUAIS.find((r) => r.id === id);
  const tr = traduzido(base, RITUAIS_POR_IDIOMA, id);
  if (tr === base) return base;
  /* `comoFazerTexto` e DERIVADO e nasce no map acima, no import, em portugues. A
   * fusao copia o campo do PT junto com o resto, e sem esta linha o card
   * compartilhavel sairia com os passos em espanhol e o paragrafo em portugues —
   * a mesma discordancia de dois campos que o alias existe para impedir. */
  return Object.freeze({ ...tr, comoFazerTexto: tr.comoFazer.join(' ') });
}

/* =================================================================================
 * OS TRES IDIOMAS (12/09/2026)
 * =================================================================================
 * O PT mora NESTE arquivo e nao se move: e a fonte da verdade (ids, ordem,
 * contagem, `precisaCamera`) e e o que os testes de doutrina varrem como
 * texto-fonte. ES e EN moram em vizinhos — datos/rituais.es.js e
 * datos/rituais.en.js —, um mapa por id com SO texto visivel. Quem costura e
 * datos/traduzir.js, na hora da chamada.
 *
 * `RITUAIS` (a constante) continua em PORTUGUES e continua exportada: ela e
 * avaliada no import e o idioma so chega depois, por setIdiomaMadre(). Quem
 * desenha chama getRitual(id) — ou, melhor ainda, ritualSeguroDoDia() de
 * lib/plano.js, que e a unica porta que a tela deve usar.
 *
 * NAO ATRAVESSAM a traducao, por construcao: `id` (o que a ESCALA de
 * lib/rituaisRotativos.js conhece), `precisaCamera` (o campo que manda na tela),
 * `comoFazerTexto` (derivado) e `obra`/`autor`/`quando` (citacao real — duas das
 * quatro obras nao sao em ingles nem em espanhol, e nenhuma delas muda de
 * titulo). A `nota` de dentro da fonte SIM se traduz: e prosa da Madre sobre o
 * que a obra nao sustenta.
 *
 * Import ESTATICO, como datos/textos.js faz com textos.es.js: o Metro precisa ver
 * as tres pontas em tempo de build.
 * ================================================================================= */
const RITUAIS_POR_IDIOMA = { es: ES, en: EN };

/** Os sete rituais, na ordem do catalogo, no idioma ativo. Para quem precisa da
 *  lista inteira (o giro nao precisa: ele vai por id). */
export function rituaisDoGiro() {
  return RITUAIS.map((r) => getRitual(r.id));
}

export default RITUAIS;
