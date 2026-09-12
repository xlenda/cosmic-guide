// O Baralho Cigano (Lenormand) — a tiragem com voz.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE, SE O APP JA TEM 78 CARTAS
// ===========================================================================
// Os audios gravados pelo dono (C:\TAROT\AUDIO PORTUGUES\4,5,6.ogg) NAO sao de
// tarô: falam de Coração, Nuvens e Cavaleiro, que sao cartas do LENORMAND. Sao
// dois baralhos diferentes, e misturar os dois numa leitura so seria erro de
// tradicao — o Rider-Waite-Smith tem 78 cartas e arcanos; o Lenormand tem 36,
// sem arcanos, e a leitura e mais direta e mais curta.
//
// Entao eles convivem, com papeis distintos:
//   · LENORMAND (36) — a tiragem rapida de tres cartas, COM VOZ. E a que o
//     funil do dono ja usa e que o publico brasileiro conhece como "cigano".
//   · TARÔ (78)      — o album, a colecao, o estudo. Sem voz por enquanto.
//
// ===========================================================================
// A REGRA DE FIDELIDADE AO AUDIO
// ===========================================================================
// O texto de cada carta aqui foi escrito a partir da TRANSCRICAO do audio, para
// que quem ouve e quem le recebam a mesma leitura. Onde o audio diz "amor,
// felicidade, paixao e intimidade", as claves sao essas — nao outras escolhidas
// por gosto.
//
// UMA EXCECAO DECLARADA, e ela e importante: o audio do Cavaleiro termina em
// "algo IRA VIR em sua direcao e voce precisa estar preparado". Isso e previsao
// de futuro, que o produto inteiro nao faz e que test/copy.test.js aborta. O
// texto escrito aqui guarda a FORCA da carta (movimento, velocidade, iniciativa)
// sem a previsao. Enquanto o audio original nao for regravado, o app fica com as
// duas versoes desencontradas nesse ponto — e isso esta anotado em
// `avisoDeAudio` para ninguem descobrir por acidente.
//
// ===========================================================================
// AS 33 QUE NAO TEM AUDIO AINDA
// ===========================================================================
// Tres cartas tinham voz e 33 nao tinham texto nenhum. Agora as 36 tem texto, e
// so as tres tem voz — `audio: null` nas outras, que e o sinal que
// components/BotaoOuvir.js e lib/audios.js ja entendem como "nao desenhe o
// botao". A ordem do array e a ORDEM CANONICA do baralho (1 Cavaleiro .. 36
// Cruz), nao a ordem em que os audios foram gravados.
//
// AS 33 FORAM ESCRITAS NO MOLDE DAS TRES, de proposito: mesma forma de objeto,
// mesmo tamanho de leitura (duas frases), mesmo tipo de convite. Quando as
// gravacoes chegarem, quem escrever o roteiro le o campo `leitura` e tem o texto
// pronto — sem precisar inventar de novo e sem risco de a voz e a tela dizerem
// coisas diferentes, que e exatamente o problema que o Cavaleiro tem hoje.
//
// O CAMPO `naipe` e a carta de baralho francesa embutida na carta. Ela nao e
// enfeite: e o que permite a leitura combinada da tradicao (o metodo que le o
// Lenormand junto com um baralho comum). As tres cartas ja escritas fixaram a
// convencao — so o NAIPE, sem o valor (Copas, e nao "Valete de Copas") —, e as
// 33 seguem essa convencao para nao ficarem com forma diferente das irmas.
//
// DATACAO. O jogo que deu origem a este baralho e o Das Spiel der Hoffnung, de
// Johann Kaspar Hechtel, de 1799 — um jogo de tabuleiro de 36 casas, nao um
// oraculo. O baralho de 36 cartas que hoje leva o nome de Mlle Lenormand e do
// inicio do seculo XIX e circulou com esse nome depois da morte dela. NENHUMA
// data entrou no texto das cartas: as tres gravadas nao citam nenhuma, e o
// pedido explicito era que as 33 fossem indistinguiveis delas. O lugar do fato
// datado neste projeto e datos/hechos.js, que test/contenido.test.js cobra com
// ano e fonte.

// Uma so definicao por carta, na ordem canonica. LENORMAND, LENORMAND_36 e
// LENORMAND_COM_AUDIO sao todas vistas desta mesma lista — nenhuma copia, para
// que nao exista o dia em que uma delas e corrigida e a outra nao.
const BARALHO = [
  {
    id: 'lenormand-01',
    numero: 1,
    nome: 'O Cavaleiro',
    naipe: 'Copas',
    claves: ['habilidade', 'força', 'energia', 'velocidade', 'iniciativa'],
    escena: 'o cavaleiro a galope, já em movimento quando a carta é virada',
    leitura:
      'O Cavaleiro é uma carta de movimento: habilidade, força, energia e velocidade. Ela trata de iniciativa — do que já está andando e do que depende de alguém assumir o passo.',
    convite:
      'Escolha uma coisa sua que está parada esperando decisão de outra pessoa, e dê nela o passo que só depende de você.',
    audio: 'carta-6',
    // ATENCAO — desencontro conhecido entre o audio e o texto, ver cabecalho.
    avisoDeAudio:
      'O áudio gravado termina em "algo irá vir em sua direção e você precisa estar preparado". É previsão de futuro, que o app não faz. O texto escrito guarda a força da carta sem a previsão. Regravar essa frase resolve o desencontro.',
  },

  {
    id: 'lenormand-02',
    numero: 2,
    nome: 'O Trevo',
    naipe: 'Ouros',
    claves: ['sorte pequena', 'oportunidade breve', 'alívio', 'acaso'],
    escena: 'o trevo pequeno no meio do capim, fácil de passar batido',
    leitura:
      'O Trevo fala de sorte pequena e de curta duração: uma brecha, um alívio, uma coincidência boa que não se repete sozinha. É a carta do acaso miúdo — o que aparece de graça e some do mesmo jeito quando ninguém repara.',
    convite:
      'Anote a menor coisa boa que aconteceu hoje sem você planejar, e o que ela custaria para acontecer de novo por sua conta.',
    audio: 'lenormand-01',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-03',
    numero: 3,
    nome: 'O Navio',
    naipe: 'Espadas',
    claves: ['distância', 'viagem', 'saudade', 'partida'],
    escena: 'o navio de velas abertas, já afastado da margem',
    leitura:
      'O Navio fala de distância: viagem, afastamento, saudade e o que acontece longe de onde você está. É também a carta do que se move por conta própria, empurrado por um vento que ninguém no porto controla.',
    convite:
      'Nomeie a distância que mais pesa hoje — de quilômetro, de tempo ou de assunto — e escreva qual das três está ao seu alcance.',
    audio: 'lenormand-02',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-04',
    numero: 4,
    nome: 'A Casa',
    naipe: 'Copas',
    claves: ['lar', 'base', 'família', 'pertencimento', 'estrutura'],
    escena: 'a casa fechada, de porta e telhado inteiros',
    leitura:
      'A Casa fala de base: lar, família, pertencimento e a estrutura que sustenta o resto. Numa leitura de relação, aponta o terreno onde a coisa acontece — o que é morada de verdade e o que é só passagem.',
    convite:
      'Olhe o cômodo em que você mais fica e pergunte-se o que ali é seu de fato, e não herdado de uma vida a dois.',
    audio: 'lenormand-03',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-05',
    numero: 5,
    nome: 'A Árvore',
    naipe: 'Copas',
    claves: ['raiz', 'tempo longo', 'origem', 'crescimento lento'],
    escena: 'a árvore sozinha no campo, com a raiz maior do que a copa',
    leitura:
      'A Árvore fala de raiz e de tempo longo: o que cresce devagar, o que tem origem antiga e o que não muda de lugar por vontade. É a carta da vitalidade lenta, a que mede em anos o que as outras medem em dias.',
    convite:
      'Escolha uma coisa sua que só melhora com repetição e faça hoje a menor porção dela.',
    audio: 'lenormand-04',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-06',
    numero: 6,
    nome: 'As Nuvens',
    naipe: 'Paus',
    claves: ['falta de clareza', 'dúvida', 'segredo', 'insegurança', 'conflito'],
    escena: 'as nuvens carregadas de um lado e claras do outro, cobrindo o sol',
    leitura:
      'As Nuvens falam de falta de clareza: dúvida, segredo, insegurança e conflito. Há algo ou alguém guardando uma parte da verdade, do mesmo jeito que a nuvem esconde o brilho do sol sem apagá-lo.',
    convite:
      'Separe, no papel, o que você sabe do que você está preenchendo sozinha. A dúvida diminui de tamanho quando ganha duas colunas.',
    audio: 'carta-5',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-07',
    numero: 7,
    nome: 'A Serpente',
    naipe: 'Paus',
    claves: ['desvio', 'astúcia', 'complicação', 'interesse alheio'],
    escena: 'a serpente enrolada, avançando em curva e nunca em linha reta',
    leitura:
      'A Serpente fala de desvio e de astúcia: o caminho que não segue reto, a complicação que se enrola e a presença de um interesse que não é o seu. É a carta da coisa que se move devagar e sem barulho.',
    convite:
      'Aponte o ponto exato onde a história começou a dar volta, e o que você aceitou ali para não brigar.',
    audio: 'lenormand-05',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-08',
    numero: 8,
    nome: 'O Caixão',
    naipe: 'Ouros',
    claves: ['fim', 'luto', 'encerramento', 'despedida'],
    escena: 'o caixão fechado, atravessado na frente do caminho',
    leitura:
      'O Caixão é a carta do fim: encerramento, luto e o que já se despediu sem cerimônia. Ela não anuncia perda nenhuma — dá nome ao que dentro de você já acabou e continua ocupando lugar.',
    convite:
      'Escreva o nome de uma coisa que terminou e que você ainda mantém aberta, e deixe o papel guardado.',
    audio: 'lenormand-06',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-09',
    numero: 9,
    nome: 'O Buquê',
    naipe: 'Espadas',
    claves: ['gentileza', 'beleza', 'agrado', 'alegria oferecida'],
    escena: 'o buquê já cortado e arrumado, oferecido com as duas mãos',
    leitura:
      'O Buquê fala de gentileza oferecida: beleza, agrado, cortesia e a alegria que chega arrumada. É a carta do gesto bonito — e também do que é bonito por fora sem que ninguém pergunte o que sustenta por dentro.',
    convite:
      'Ofereça hoje uma gentileza a alguém que não tem nada a ver com essa história, e repare no que sobra em você depois.',
    audio: 'lenormand-07',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-10',
    numero: 10,
    nome: 'A Foice',
    naipe: 'Ouros',
    claves: ['corte', 'decisão brusca', 'colheita', 'separação'],
    escena: 'a foice de lâmina virada, parada no alto do gesto',
    leitura:
      'A Foice fala de corte: decisão brusca, separação seca e a colheita que só acontece porque alguma coisa foi ceifada. É a carta do gesto rápido, que resolve e machuca no mesmo movimento.',
    convite:
      'Escolha um corte pequeno que só depende de você — um grupo, uma aba aberta, um hábito — e faça hoje.',
    audio: 'lenormand-08',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-11',
    numero: 11,
    nome: 'O Chicote',
    naipe: 'Paus',
    claves: ['repetição', 'atrito', 'desgaste', 'disciplina'],
    escena: 'o chicote de várias tiras, feito para bater sempre no mesmo lugar',
    leitura:
      'O Chicote fala de repetição e de atrito: a mesma discussão de novo, o mesmo desgaste, o mesmo lugar batido muitas vezes. É também a carta da disciplina — a repetição serve para machucar ou para treinar, e a diferença está em quem escolhe o ritmo.',
    convite:
      'Identifique a frase que você já repetiu demais nessa história e decida o que fazer com o fôlego que ela consome.',
    audio: 'lenormand-09',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-12',
    numero: 12,
    nome: 'Os Pássaros',
    naipe: 'Ouros',
    claves: ['conversa', 'ruído', 'agitação', 'duas vozes'],
    escena: 'dois pássaros pequenos no mesmo galho, falando ao mesmo tempo',
    leitura:
      'Os Pássaros falam de conversa e de ruído: o falatório, a agitação miúda e o nervosismo que vem de tanta palavra junta. São dois de propósito — a carta trata do que só existe entre duas pessoas ou entre duas vozes suas.',
    convite:
      'Escolha qual das duas vozes dentro de você está falando mais alto hoje, e dê à outra cinco minutos escritos.',
    audio: 'lenormand-10',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-13',
    numero: 13,
    nome: 'A Criança',
    naipe: 'Espadas',
    claves: ['começo', 'pequeno', 'novo', 'leveza', 'ingenuidade'],
    escena: 'a criança de pé no começo do caminho, sem bagagem',
    leitura:
      'A Criança fala do que é novo e pequeno: começo, ingenuidade, leveza e o tamanho ainda reduzido de uma coisa que acabou de nascer. É a carta que pede que não se cobre de um broto o desempenho de uma árvore.',
    convite:
      'Meça uma coisa recente da sua vida pelo tamanho que ela tem hoje, e escreva o que seria justo pedir dela.',
    audio: 'lenormand-11',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-14',
    numero: 14,
    nome: 'A Raposa',
    naipe: 'Paus',
    claves: ['cautela', 'disfarce', 'esperteza', 'trabalho'],
    escena: 'a raposa parada de lado, olhando sem se aproximar',
    leitura:
      'A Raposa fala de cautela e de esperteza: o que não se apresenta pelo nome verdadeiro, o interesse disfarçado e a necessidade de olhar duas vezes. Na tradição ela também é a carta do trabalho — o lugar onde é preciso ser esperta para sobreviver.',
    convite:
      'Escreva uma coisa que você fingiu aceitar nessa história e o preço que fingir cobrou de você.',
    audio: 'lenormand-12',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-15',
    numero: 15,
    nome: 'O Urso',
    naipe: 'Paus',
    claves: ['força', 'poder', 'proteção', 'posse', 'recursos'],
    escena: 'o urso de pé, grande demais para ser ignorado',
    leitura:
      'O Urso fala de força e de poder: proteção, mando, recursos e o peso de quem manda na cena. É também a carta do ciúme e da posse — a mesma força que protege é a que sufoca quando não sabe medir.',
    convite:
      'Reconheça onde nessa história você tem força de verdade e onde só tem vontade de controlar.',
    audio: 'lenormand-13',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-16',
    numero: 16,
    nome: 'As Estrelas',
    naipe: 'Copas',
    claves: ['orientação', 'esperança', 'clareza', 'dispersão'],
    escena: 'muitas estrelas pequenas espalhadas pelo céu inteiro',
    leitura:
      'As Estrelas falam de orientação: esperança, clareza e a direção que se acha olhando para cima em vez de para os pés. São muitas de propósito — a carta trata tanto do rumo quanto da dispersão de quem quer seguir todos os pontos ao mesmo tempo.',
    convite:
      'Escreva os três rumos que disputam sua cabeça hoje e circule o único que você consegue andar esta semana.',
    audio: 'lenormand-14',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-17',
    numero: 17,
    nome: 'A Cegonha',
    naipe: 'Copas',
    claves: ['mudança', 'deslocamento', 'ciclo', 'novidade'],
    escena: 'a cegonha de asas abertas, trocando de estação',
    leitura:
      'A Cegonha fala de mudança: deslocamento, troca de fase e o movimento de quem parte e retorna com a estação. É a carta da novidade que não rompe — muda o lugar da coisa sem destruir o que já existia.',
    convite:
      'Mude hoje uma coisa pequena e concreta na sua rotina e repare no que isso desloca no resto do dia.',
    audio: 'lenormand-15',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-18',
    numero: 18,
    nome: 'O Cachorro',
    naipe: 'Copas',
    claves: ['lealdade', 'amizade', 'confiança', 'dependência'],
    escena: 'o cachorro sentado ao lado, sem correia e sem pressa',
    leitura:
      'O Cachorro fala de lealdade: amizade, confiança e a presença que fica sem precisar de convocação. É também a carta que pergunta se a fidelidade em jogo é escolha ou é dependência com outro nome.',
    convite:
      'Escolha uma pessoa leal da sua vida que não tem a ver com essa história e ocupe um pedaço do seu dia com essa presença.',
    audio: 'lenormand-16',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-19',
    numero: 19,
    nome: 'A Torre',
    naipe: 'Espadas',
    claves: ['isolamento', 'autoridade', 'limite', 'instituição'],
    escena: 'a torre alta e estreita, com uma janela só',
    leitura:
      'A Torre fala de isolamento e de autoridade: o limite firme, a instituição, a altura que protege e afasta ao mesmo tempo. É a carta de quem se recolhe — por escolha, por posto ou por defesa.',
    convite:
      'Repare se o seu recolhimento de hoje está te protegendo ou só está te deixando sozinha com o assunto.',
    audio: 'lenormand-17',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-20',
    numero: 20,
    nome: 'O Jardim',
    naipe: 'Espadas',
    claves: ['convívio', 'público', 'encontro', 'exposição'],
    escena: 'o jardim público de alamedas abertas, onde todo mundo passa',
    leitura:
      'O Jardim fala do que é público: convívio, comunidade, encontro e a parte da vida que acontece na frente dos outros. É a carta da exposição — o que se mostra em praça é visto por muita gente e explicado por cada uma de um jeito.',
    convite:
      'Escolha um lugar coletivo, mesmo pequeno, onde você esteja hoje por um motivo que não tem nada a ver com essa história.',
    audio: 'lenormand-18',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-21',
    numero: 21,
    nome: 'A Montanha',
    naipe: 'Paus',
    claves: ['obstáculo', 'bloqueio', 'demora', 'peso'],
    escena: 'a montanha atravessada no caminho, sem atalho visível',
    leitura:
      'A Montanha fala de obstáculo: bloqueio, demora e o peso do que não se resolve por esforço de vontade. É a carta do que é grande de verdade — e que por isso se atravessa por partes ou se contorna, nunca de um salto.',
    convite:
      'Divida o obstáculo que mais te trava em três pedaços e faça hoje o menor deles.',
    audio: 'lenormand-19',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-22',
    numero: 22,
    nome: 'Os Caminhos',
    naipe: 'Ouros',
    claves: ['escolha', 'bifurcação', 'alternativa', 'indecisão'],
    escena: 'a estrada que se abre em dois, sem placa em nenhum dos lados',
    leitura:
      'Os Caminhos falam de escolha: a bifurcação, a alternativa e o desconforto de decidir sem garantia. É a carta que devolve a decisão para as mãos de quem consulta, e não para as circunstâncias.',
    convite:
      'Escreva as duas opções que estão na sua frente e o que cada uma custa — não o que cada uma promete.',
    audio: 'lenormand-20',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-23',
    numero: 23,
    nome: 'Os Ratos',
    naipe: 'Paus',
    claves: ['perda lenta', 'desgaste', 'cansaço', 'corrosão'],
    escena: 'os ratos roendo o canto do que está guardado',
    leitura:
      'Os Ratos falam de perda lenta: o desgaste que come pelas beiradas, o cansaço que se acumula e o pouco que some todo dia sem estardalhaço. É a carta do que não quebra de uma vez — apenas diminui.',
    convite:
      'Encontre as frestas por onde sua energia escapa em silêncio e feche uma hoje, mesmo que mal fechada.',
    audio: 'lenormand-21',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-24',
    numero: 24,
    nome: 'O Coração',
    naipe: 'Copas',
    claves: ['amor', 'felicidade', 'paixão', 'intimidade'],
    escena: 'um coração aberto, sem moldura e sem guarda',
    leitura:
      'O Coração fala de afeto declarado: amor, felicidade, paixão e intimidade. Numa leitura de relação, aponta um momento de conexão emocional sincera e a busca de harmonia entre as pessoas envolvidas.',
    // O que ELA faz com isso hoje. Nunca o que a outra pessoa vai fazer.
    convite:
      'Repare em que lugar do seu dia esse afeto ainda aparece — e o que ele pede de você, não da outra pessoa.',
    audio: 'carta-4',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-25',
    numero: 25,
    nome: 'O Anel',
    naipe: 'Paus',
    claves: ['compromisso', 'acordo', 'vínculo', 'ciclo'],
    escena: 'o anel fechado, sem começo e sem fim visíveis',
    leitura:
      'O Anel fala de vínculo: compromisso, acordo, aliança e a forma redonda do que se repete. É a carta do contrato — escrito ou não — e das condições que alguém aceitou sem ler.',
    convite:
      'Escreva o acordo não dito que você vem cumprindo nessa história e decida se ele ainda é seu.',
    audio: 'lenormand-22',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-26',
    numero: 26,
    nome: 'O Livro',
    naipe: 'Ouros',
    claves: ['segredo', 'conhecimento', 'estudo', 'o não revelado'],
    escena: 'o livro de capa fechada, com uma parte das páginas ainda intacta',
    leitura:
      'O Livro fala do que está guardado: segredo, conhecimento e a parte da história que ainda não foi aberta. É a carta do estudo — o que se sabe por dentro, e o que só se descobre lendo até o fim.',
    convite:
      'Escolha um assunto seu que você adiou por não saber o suficiente e leia hoje a primeira página dele.',
    audio: 'lenormand-23',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-27',
    numero: 27,
    nome: 'A Carta',
    naipe: 'Espadas',
    claves: ['notícia', 'documento', 'palavra escrita', 'registro'],
    escena: 'o envelope fechado em cima da mesa, ainda sem ser aberto',
    leitura:
      'A Carta fala de notícia e de palavra escrita: documento, recado, aviso e tudo que circula por escrito em vez de circular por voz. É a carta do que fica registrado — o que se pode reler depois, ao contrário do que se diz no calor.',
    convite:
      'Escreva para si mesma o que você diria se ninguém fosse ler, e guarde o papel sem destino.',
    audio: 'lenormand-24',
    avisoDeAudio: null,
  },

  /* AS DUAS CARTAS DE PESSOA (28 e 29).
   *
   * Na tradicao elas sao "o homem" e "a mulher", e representam quem consulta e o
   * par. Aqui o NOME fica (e o nome canonico do baralho, e trocar o nome seria
   * inventar um baralho diferente) mas o TEXTO nao assume genero nenhum de quem
   * esta do outro lado — regra 4 da doutrina, a que test/copy.test.js vigia. As
   * duas leituras funcionam nos dois sentidos: qual figura e quem se decide pelo
   * lugar em que a carta cai, nunca pelo nome dela. */
  {
    id: 'lenormand-28',
    numero: 28,
    nome: 'O Homem',
    naipe: 'Copas',
    claves: ['pessoa', 'presença', 'um dos lados', 'ponto de vista'],
    escena: 'a figura de corpo inteiro, de pé e virada para quem lê',
    leitura:
      'Esta é uma das duas cartas de pessoa do baralho: ela marca um dos lados da história — quem consulta ou quem está do outro lado. O nome vem da tradição e não define o gênero de ninguém na leitura; quem ela representa se decide pelas cartas que caem ao redor.',
    convite:
      'Antes de decidir de quem essa carta fala, escreva em uma linha o que você quer para si mesma nessa história.',
    audio: 'lenormand-25',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-29',
    numero: 29,
    nome: 'A Mulher',
    naipe: 'Espadas',
    claves: ['pessoa', 'o outro lado', 'par', 'espelho'],
    escena: 'a segunda figura de corpo inteiro, de frente para a primeira',
    leitura:
      'Esta é a outra carta de pessoa, e forma par com a anterior: uma representa quem consulta e a outra, quem está do outro lado. Qual é qual não vem do nome — vem de onde cada uma cai e do que a pergunta pediu.',
    convite:
      'Marque no papel qual das duas figuras é você hoje, e o que muda na leitura se a posição for trocada.',
    audio: 'lenormand-26',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-30',
    numero: 30,
    nome: 'O Lírio',
    naipe: 'Espadas',
    claves: ['maturidade', 'serenidade', 'honra', 'experiência'],
    escena: 'os lírios abertos em campo aberto, no ritmo lento do inverno',
    leitura:
      'O Lírio fala de maturidade: serenidade, honra, experiência e o que só chega depois de um tempo vivido. Na tradição ela também toca a intimidade — a que é feita de calma e não de urgência.',
    convite:
      'Escolha hoje uma decisão que você tomaria com dez anos a mais de estrada, e tome só essa.',
    audio: 'lenormand-27',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-31',
    numero: 31,
    nome: 'O Sol',
    naipe: 'Ouros',
    claves: ['clareza', 'energia', 'sucesso', 'visibilidade'],
    escena: 'o sol alto, sem nuvem nenhuma entre ele e o chão',
    leitura:
      'O Sol fala de clareza e de energia: sucesso, calor, visibilidade e a força de quem está com o dia a favor. É a carta do que aparece inteiro, sem sombra por cima — o oposto exato do que As Nuvens descrevem.',
    convite:
      'Nomeie a única coisa da sua vida que hoje está clara e faça dela o ponto de apoio do resto do dia.',
    audio: 'lenormand-28',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-32',
    numero: 32,
    nome: 'A Lua',
    naipe: 'Copas',
    claves: ['emoção', 'imaginação', 'reconhecimento', 'ciclo'],
    escena: 'a lua sozinha no céu, mudando de forma sem mudar de tamanho',
    leitura:
      'A Lua fala de emoção e de imaginação: o sonho, a noite, o reconhecimento e o ciclo que se refaz sem pressa. É a carta do que sentimos sobre uma coisa, que nem sempre é do tamanho da coisa.',
    convite:
      'Separe hoje o fato do sentimento sobre o fato — duas linhas, uma para cada, e leia as duas em voz alta.',
    audio: 'lenormand-29',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-33',
    numero: 33,
    nome: 'A Chave',
    naipe: 'Ouros',
    claves: ['abertura', 'solução', 'acesso', 'confirmação'],
    escena: 'a chave sozinha, sem a fechadura ao lado',
    leitura:
      'A Chave fala de abertura: solução, acesso, destrave e a certeza de que existe uma porta para aquele assunto. Na tradição é uma das cartas mais firmes do baralho — ela confirma o que está ao lado dela em vez de duvidar.',
    convite:
      'Liste as portas que você já sabe abrir sozinha e use uma delas hoje, mesmo que não seja a principal.',
    audio: 'lenormand-30',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-34',
    numero: 34,
    nome: 'Os Peixes',
    naipe: 'Ouros',
    claves: ['fluxo', 'recursos', 'abundância', 'profundidade'],
    escena: 'os peixes em cardume, sempre em movimento na mesma água',
    leitura:
      'Os Peixes falam de fluxo: dinheiro, recursos, abundância e tudo que circula em vez de ficar parado. É a carta da profundidade também — o que corre por baixo da superfície e sustenta o que se vê em cima.',
    convite:
      'Olhe um número concreto da sua vida hoje — uma conta, um gasto, um saldo — e resolva a menor coisa que esse número pede de você.',
    audio: 'lenormand-31',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-35',
    numero: 35,
    nome: 'A Âncora',
    naipe: 'Espadas',
    claves: ['permanência', 'firmeza', 'porto', 'teimosia'],
    escena: 'a âncora no fundo, segurando um barco que não se vê',
    leitura:
      'A Âncora fala de permanência: firmeza, porto, trabalho constante e o que fica no lugar quando a água mexe. É a carta da estabilidade — e também da teimosia, porque a mesma âncora que segura é a que impede de zarpar.',
    convite:
      'Descubra o que hoje te segura e escreva se é raiz ou é peso, com uma palavra só para cada.',
    audio: 'lenormand-32',
    avisoDeAudio: null,
  },

  {
    id: 'lenormand-36',
    numero: 36,
    nome: 'A Cruz',
    naipe: 'Paus',
    claves: ['peso', 'fardo', 'provação', 'crença'],
    escena: 'a cruz plantada no chão, marcando o lugar de um peso',
    leitura:
      'A Cruz é a carta mais pesada do baralho: fardo, provação e o que se carrega por dever, por crença ou por história de família. Ela não anuncia castigo nenhum — dá nome ao peso que já está aí e pergunta de quem ele é.',
    convite:
      'Escreva um peso que você carrega e ao lado o nome de quem o colocou ali; se o nome for o seu, já é um começo.',
    audio: 'lenormand-33',
    avisoDeAudio: null,
  },
];

// Congela em profundidade, pelo mesmo motivo de lib/mazo.js: sem isto, uma tela
// que escrevesse `carta.nome = ...` contaminaria TODAS as tiragens seguintes da
// sessao, porque o objeto e compartilhado. Em modo estrito a atribuicao passa a
// lançar — o erro estoura em quem escreveu, na hora.
function congelarCarta(carta) {
  Object.freeze(carta.claves);
  return Object.freeze(carta);
}

/* ===================================================================================
   OS OUTROS DOIS IDIOMAS (ONDA 2)
   ===================================================================================
   O mesmo molde de datos/textos.js: um objeto por idioma, um mapa, e o idioma
   ativo lido do espelho de modulo de textos.js (idiomaMadre()) na HORA da
   chamada. Import estatico, nao dinamico — o Metro precisa ver as tres pontas
   em tempo de build.

   POR QUE A TRADUCAO ENTRA NA SAIDA, E NAO EM LENORMAND_36:
   LENORMAND_36 e congelada uma vez no carregamento do modulo, e o idioma muda em
   runtime (o seletor do Perfil). Traduzir lá congelaria o baralho no idioma em
   que o app abriu. Entao a troca acontece nas tres funcoes por onde a carta SAI
   do modulo — tirarTresLenormand, tiragemDeEntrada e cartaLenormandPorId —, que
   sao as unicas portas que as telas usam (medido: nenhum screens/ importa
   LENORMAND_36 direto).

   Campo por campo, com fallback para o PT: traducao pela metade mostra o que ja
   existe no idioma da pessoa e o resto em portugues, nunca a chave crua e nunca
   texto inventado. Mesma regra de t().

   O QUE NAO SE TRADUZ: id, numero, naipe, claves e audio. Ver o cabecalho de
   datos/lenormand.es.js, que explica cada um — e em especial que `audio` e nome
   de arquivo resolvido por require ESTATICO, e que as tres faixas gravadas
   continuam em portugues nos tres idiomas. */
import { LENORMAND_ES } from './lenormand.es.js';
import { LENORMAND_EN } from './lenormand.en.js';
import { IDIOMA_PADRAO, idiomaMadre } from './textos.js';

const CARTAS_POR_IDIOMA = { es: LENORMAND_ES, en: LENORMAND_EN };

/* Os campos de TEXTO da carta, e so eles. Lista explicita, e nao
 * "tudo que nao e tecnico": um campo novo no baralho nasce em portugues nos tres
 * idiomas (fallback honesto) em vez de nascer traduzido por acidente. */
const CAMPOS_TRADUZIVEIS = ['nome', 'escena', 'leitura', 'convite', 'avisoDeAudio'];

/* O cache e por IDIOMA, nao por chamada: `useMemo` das telas tem a tiragem numa
 * lista de dependencias, e um objeto novo a cada render reiniciaria a animacao
 * das cartas. Dois idiomas => no maximo duas copias do baralho na memoria. */
const CACHE_TRADUZIDO = new Map();

/**
 * A carta no idioma ativo. PT (ou idioma sem dicionario) devolve a MESMA
 * instancia congelada de LENORMAND_36 — zero copia no caminho padrao.
 *
 * @param {object} carta uma das 36, ja congelada
 * @returns {object} congelada, com os campos de texto no idioma ativo
 */
function cartaNoIdioma(carta) {
  const lang = idiomaMadre();
  if (!carta || lang === IDIOMA_PADRAO) return carta;

  const dicionario = CARTAS_POR_IDIOMA[lang];
  if (!dicionario) return carta;

  let porId = CACHE_TRADUZIDO.get(lang);
  if (!porId) {
    porId = new Map();
    CACHE_TRADUZIDO.set(lang, porId);
  }
  const pronta = porId.get(carta.id);
  if (pronta) return pronta;

  const traduzida = dicionario[carta.id];
  if (!traduzida) {
    porId.set(carta.id, carta);
    return carta;
  }

  const copia = { ...carta };
  for (const campo of CAMPOS_TRADUZIVEIS) {
    const valor = traduzida[campo];
    // `== null` e nao `||`: string vazia e defeito de traducao, nao fallback
    // escondido — cai no PT em vez de desenhar um paragrafo em branco.
    if (valor != null && String(valor).trim() !== '') copia[campo] = valor;
  }
  const congelada = Object.freeze(copia);
  porId.set(carta.id, congelada);
  return congelada;
}

/** As 36 do baralho, na ordem canonica (1 Cavaleiro .. 36 Cruz). Congelada. */
export const LENORMAND_36 = Object.freeze(BARALHO.map(congelarCarta));

/**
 * O baralho. Era so as tres gravadas enquanto so elas existiam; agora e o
 * baralho inteiro, que e o que o nome sempre quis dizer. Quem precisa das tres
 * com voz usa LENORMAND_COM_AUDIO, que continua sendo exatamente essas tres.
 */
export const LENORMAND = LENORMAND_36;

/* A ORDEM DA NARRACAO, e nao a do baralho.
 *
 * Isto e uma armadilha real e ja quase custou caro nesta mesma edicao: enquanto
 * o arquivo tinha so tres cartas, elas estavam escritas na ordem em que a voz
 * fala — Coração (carta-4, "primeira"), Nuvens (carta-5, "segunda"), Cavaleiro
 * (carta-6, "terceira e ultima") — e `filter` devolvia essa ordem de graça. Com
 * as 36 na ordem CANONICA do baralho, o mesmo `filter` passa a devolver
 * Cavaleiro (1), Nuvens (6), Coração (24): a voz continuaria dizendo "primeira
 * carta" sobre o audio do Coração enquanto a tela mostraria o Cavaleiro.
 *
 * Por isso a ordem da narracao vira dado EXPLICITO. Ela nao se deduz do numero
 * da carta nem da ordem do array — se deduz do arquivo de audio, que e quem
 * fala "primeira", "segunda" e "terceira e ultima". Quando as 36 forem
 * gravadas, esta lista deixa de importar (o sorteio assume) e pode sair junto
 * com a `slice` la embaixo. */
const ORDEM_DA_NARRACAO = ['carta-4', 'carta-5', 'carta-6'];

/** So as que tem .m4a em assets/audio. Hoje sao tres, na ordem em que a voz fala. */
// Audio que ainda nao esta na ORDEM_DA_NARRACAO vai para o FIM, e nao para o
// comeco: `indexOf` devolve -1 para desconhecido, e -1 ordena antes de tudo —
// uma gravacao nova entraria calada na posicao "primeira carta".
const posicaoNaNarracao = (carta) => {
  const i = ORDEM_DA_NARRACAO.indexOf(carta.audio);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
};

export const LENORMAND_COM_AUDIO = Object.freeze(
  LENORMAND_36.filter((c) => c.audio).sort((a, b) => posicaoNaNarracao(a) - posicaoNaNarracao(b))
);

export function cartaLenormandPorId(id) {
  if (typeof id !== 'string') return null;
  const carta = LENORMAND_36.find((c) => c.id === id);
  return carta ? cartaNoIdioma(carta) : null;
}

/** true so quando as 36 tiverem voz. E o interruptor do sorteio, abaixo. */
export const TODAS_COM_VOZ = LENORMAND_COM_AUDIO.length === LENORMAND_36.length;

/* Fisher-Yates parcial, o mesmo de lib/mazo.js: cada passo escolhe
 * uniformemente entre as cartas ainda no saco e a tira de la. As tres saem
 * necessariamente DISTINTAS, sem laço de "sorteia de novo se repetir".
 *
 * Math.random() direto, sem parametro de aleatoriedade e sem semente — a mesma
 * regra que e contrato em lib/mazo.js. Um parametro `azar` aqui seria o convite
 * aberto para a proxima onda passar o nome ou a resposta da pessoa "para ficar
 * mais personalizado", e nesse dia o app estaria mentindo. A ausencia do
 * parametro e a defesa. */
function sortearTres(lista) {
  const indices = lista.map((_, i) => i);
  const total = Math.min(3, indices.length);
  const sacadas = [];

  for (let i = 0; i < total; i += 1) {
    const j = i + Math.floor(Math.random() * (indices.length - i));
    const guardado = indices[i];
    indices[i] = indices[j];
    indices[j] = guardado;
    sacadas.push(lista[indices[i]]);
  }

  return sacadas;
}

/**
 * A LEITURA DE ENTRADA — sempre as mesmas tres, nesta ordem.
 *
 * DECISAO DO DONO (31/08/2026), e ela nao e limitacao tecnica: toda pessoa que
 * entra no app recebe O CORAÇÃO, AS NUVENS e O CAVALEIRO, com os audios
 * gravados na voz dele. Nao ha sorteio aqui.
 *
 * POR QUE ISSO E CERTO, e nao um atalho:
 *  1. E o funil que ja converte. No WhatsApp, toda lead ouve essas tres faixas
 *     nesta ordem — o app nao esta inventando uma leitura, esta entregando a
 *     que ja foi testada com gente de verdade.
 *  2. A voz diz "vossa PRIMEIRA carta", "a sua SEGUNDA", "a sua TERCEIRA e
 *     ultima". Sortear faria a narracao mentir, e uma voz que fala de uma carta
 *     que a tela nao mostra e o pior defeito possivel num produto de leitura.
 *  3. As tres formam um arco fechado que serve a qualquer pessoa que chega
 *     aqui: o afeto que existe (Coração), o que esta encoberto (Nuvens) e o que
 *     depende dela mover (Cavaleiro). Nao e leitura generica — e leitura FIXA,
 *     e o app diz isso na tela em vez de fingir sorteio.
 *
 * O SORTEIO VIVE NO TARÔ. lib/mazo.js sorteia entre as 78 com Fisher-Yates, e
 * e la que a variacao do produto acontece — inclusive a leitura de cada dia do
 * plano de 365 dias. Aqui, no cigano, o valor e o oposto: e sempre a mesma
 * porta de entrada, com a mesma voz.
 *
 * As outras 33 cartas continuam escritas neste arquivo de proposito: elas
 * alimentam o album e o estudo, e ficam prontas caso um dia o dono queira uma
 * segunda leitura cigana. Elas NAO entram nesta tiragem.
 */
export function tirarTresLenormand() {
  const fixas = ['lenormand-24', 'lenormand-06', 'lenormand-01']; // Coração, Nuvens, Cavaleiro
  return fixas
    .map((id) => LENORMAND_36.find((c) => c.id === id))
    .filter(Boolean)
    .map((carta, indice) => ({ carta: cartaNoIdioma(carta), posicao: indice + 1 }));
}

/* ===================================================================================
   AS DUAS TIRAGENS DE ENTRADA (08/09) — o sorteio 50/50 de lib/variante.js.

   A é a de sempre (as três acima) + a carta EXTRA; B é outra tríade + extra +
   a carta ESTRELA, que vira sozinha. Continua sendo escolha de POSIÇÃO, não de
   carta (ver o cabeçalho da tela): as cartas de cada variante são fixas.

   `papel`: 'carta' (ela raspa, uma das três), 'extra' (ela raspa mais uma,
   anunciada pela voz) ou 'estrela' (o guia vira por ela — sem raspar).

   O ÁUDIO das cartas novas NÃO usa o campo `audio` do baralho: aquele campo é
   a ordem da narração que o dono ainda vai gravar (ver o cabeçalho deste
   arquivo), e 'lenormand-16' ali é O Cachorro, não As Estrelas. As vozes
   destas cartas foram geradas na voz clonada lendo a `leitura` palavra por
   palavra, e moram em lib/audios.js como 'entrada-<id>'. As três da A mantêm
   os áudios gravados pelo dono (carta-4/5/6).
   =================================================================================== */
const TIRAGENS_DE_ENTRADA = Object.freeze({
  a: Object.freeze([
    { id: 'lenormand-24', papel: 'carta' },
    { id: 'lenormand-06', papel: 'carta' },
    { id: 'lenormand-01', papel: 'carta' },
    { id: 'lenormand-32', papel: 'extra', audio: 'entrada-lenormand-32' }, // A Lua
  ]),
  b: Object.freeze([
    { id: 'lenormand-21', papel: 'carta', audio: 'entrada-lenormand-21' }, // A Montanha
    { id: 'lenormand-22', papel: 'carta', audio: 'entrada-lenormand-22' }, // Os Caminhos
    { id: 'lenormand-33', papel: 'carta', audio: 'entrada-lenormand-33' }, // A Chave
    { id: 'lenormand-35', papel: 'extra', audio: 'entrada-lenormand-35' }, // A Âncora
    { id: 'lenormand-16', papel: 'estrela', audio: 'entrada-lenormand-16' }, // As Estrelas
  ]),
});

export const PAPEIS_DE_ENTRADA = Object.freeze(['carta', 'extra', 'estrela']);

/** Quantas ela toca na mesa: sempre três, nas duas variantes. */
export const CARTAS_NA_MESA = 3;

/**
 * A tiragem completa de uma variante: [{ carta, posicao, papel }, ...].
 * Variante desconhecida cai na A. Nunca lança; id que sumir do baralho some
 * da tiragem em vez de derrubar a tela.
 */
export function tiragemDeEntrada(variante) {
  const lista = TIRAGENS_DE_ENTRADA[variante] || TIRAGENS_DE_ENTRADA.a;
  return lista
    .map((item, indice) => {
      /* A TRADUCAO VEM ANTES DO `audio`, e a ordem nao e gosto: cartaNoIdioma
       * guarda o resultado em cache por ID, e a carta com `audio` trocado tem o
       * MESMO id da canonica. Traduzir depois envenenaria o cache — a primeira
       * variante a passar por aqui fixaria o seu audio para todas as outras. */
      const original = LENORMAND_36.find((c) => c.id === item.id);
      if (!original) return null;
      const base = cartaNoIdioma(original);
      const carta = item.audio ? Object.freeze({ ...base, audio: item.audio }) : base;
      return { carta, posicao: indice + 1, papel: item.papel };
    })
    .filter(Boolean);
}

export default LENORMAND;
