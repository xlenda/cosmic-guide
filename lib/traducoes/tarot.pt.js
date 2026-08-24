// lib/traducoes/tarot.pt.js
// Pacote de idioma PORTUGUÊS do Tarô — o pacote de REFERÊNCIA: os packs es/en
// têm de ter exatamente estas chaves, com os mesmos placeholders {x}
// (test/tarotIdiomas.test.js cobra a paridade).
//
// DUAS DECISÕES DE ARQUITETURA, e o porquê:
//
// 1. `cards` NÃO é uma cópia: é DERIVADO de lib/tarotDeck.js na carga do
//    módulo. O texto PT das 78 cartas continua morando no deck (que é ouro e
//    não muda um byte); aqui só se projeta a mesma FORMA que es/en declaram à
//    mão. Cópia à mão dessincronizaria na primeira revisão do deck.
//
// 2. As TABELAS e MOLDURAS de frase vieram de lib/tarotThemes.js SEM MUDAR UM
//    BYTE (31/07/2026) — só trocaram template literal por placeholder {x}.
//    A prova de que a troca não alterou nada é dupla: as saídas douradas em
//    test/tarotIdiomas.test.js (capturadas ANTES da mudança) e as 90.090
//    comparações de test/tarotVoice.test.js, que rodam inteiras em PT.
//    Os comentários de doutrina que explicavam cada tabela FICARAM em
//    lib/tarotThemes.js, junto do motor que as usa — aqui só mora o texto.

import { TAROT_DECK, RANK_GRADES, SPREAD_TEXTS } from '../tarotDeck';

function buildCards() {
  const cards = {};
  TAROT_DECK.forEach((c) => {
    cards[c.id] = {
      name: c.name,
      keywords: c.keywords,
      uprightMeaning: c.uprightMeaning,
      reversedMeaning: c.reversedMeaning,
      cena: c.cena,
      conselho: c.conselho,
      conselhoInvertido: c.conselhoInvertido,
      astro: c.astro,
      tituloGD: c.tituloGD,
    };
  });
  return cards;
}

function buildWaiteNotas() {
  const notas = {};
  TAROT_DECK.forEach((c) => {
    if (c.waite1911) notas[c.id] = c.waite1911.nota;
  });
  return notas;
}

const pack = {
  // Em PT a palavra do tema É a chave canônica ('Amor', 'Saúde'...) — por isso
  // o mapa identidade: o motor sempre passa pela tabela, em qualquer idioma.
  themeWord: { Amor: 'Amor', Carreira: 'Carreira', Dinheiro: 'Dinheiro', Energia: 'Energia', 'Saúde': 'Saúde' },
  themeOpener: {
    Amor: 'No amor',
    Carreira: 'Na carreira',
    Dinheiro: 'Nas finanças',
    Energia: 'Na energia',
    'Saúde': 'Na saúde',
  },
  suitTerritory: {
    paus: {
      Amor: 'desejo e iniciativa',
      Carreira: 'ímpeto e projeto',
      Dinheiro: 'dinheiro que só se move por iniciativa',
      Energia: 'vigor — e quanto dele já foi gasto',
      'Saúde': 'corpo em movimento, entre vigor e exaustão',
    },
    copas: {
      Amor: 'vínculo e o que ainda não virou palavra',
      Carreira: 'clima e pessoas',
      Dinheiro: 'decisão movida por valor afetivo',
      Energia: 'estado emocional',
      'Saúde': 'estado emocional, que sustenta o resto',
    },
    espadas: {
      Amor: 'aquilo que precisa ser dito',
      Carreira: 'análise, estratégia e a conversa difícil',
      Dinheiro: 'número olhado sem a história em volta',
      Energia: 'cabeça, e o quanto ela deixa o resto rodar',
      'Saúde': 'sono e pensamento',
    },
    ouros: {
      Amor: 'sentimento virado em gesto concreto',
      Carreira: 'ofício, prazo e resultado que se vê',
      Dinheiro: 'matéria, e aqui o naipe joga em casa',
      Energia: 'corpo físico e o que ele aguenta',
      'Saúde': 'hábito e rotina que se sustentam no tempo',
    },
  },
  suitLabel: { paus: 'Paus', copas: 'Copas', espadas: 'Espadas', ouros: 'Ouros' },
  rankRole: {
    1: 'a raiz do elemento, ainda inteira',
    2: 'o grau da polaridade, com duas forças se encarando antes de qualquer coisa acontecer',
    3: 'o grau em que o plano sai do plano e aparece no mundo',
    4: 'o grau da forma que já começa a pesar',
    5: 'o grau da crise, onde o equilíbrio do elemento se perde',
    6: 'o grau do restabelecimento depois da crise',
    7: 'o grau da prova, que se passa longe da plateia',
    8: 'o grau do movimento, quando o assunto volta a andar',
    9: 'o grau da culminação, com o que ela tem de solitário',
    10: 'o grau do limite, completude que já virou excesso',
    11: 'a figura que ainda aprende o elemento',
    12: 'a figura que lança o elemento para fora',
    13: 'a figura que sustenta o elemento por dentro',
    14: 'a figura que administra o elemento no mundo',
  },
  rankGrades: RANK_GRADES,
  syClassPhrase: {
    'mãe': 'uma das três mães',
    dupla: 'uma das sete duplas',
    simples: 'uma das doze simples',
  },
  // O valor já sai pronto para a tela ("sob Marte"). Em PT é upperFirst do
  // identificador; en/es têm nomes próprios (Mars, la Luna...) — por isso o
  // motor usa a tabela e nunca capitaliza por conta própria.
  elements: {
    ar: 'Ar', 'água': 'Água', fogo: 'Fogo', terra: 'Terra',
    'mercúrio': 'Mercúrio', lua: 'Lua', 'vênus': 'Vênus', sol: 'Sol',
    marte: 'Marte', 'júpiter': 'Júpiter', saturno: 'Saturno',
    'áries': 'Áries', touro: 'Touro', 'gêmeos': 'Gêmeos', 'câncer': 'Câncer',
    'leão': 'Leão', virgem: 'Virgem', libra: 'Libra', 'escorpião': 'Escorpião',
    'sagitário': 'Sagitário', 'capricórnio': 'Capricórnio', 'aquário': 'Aquário', peixes: 'Peixes',
  },
  elementLow: { fogo: 'fogo', terra: 'terra', ar: 'ar', 'água': 'água' },
  frames: {
    abreSemEixo: '{tema}.',
    abre: '{tema} — {eixo}.',
    abreInvertida: '{tema} — {eixo} pelo avesso.',
    cena: 'Na carta, {cena}.',
    eixoNome: 'o eixo — {eixo} —',
    eixoNomeSemEixo: 'o eixo',
    invertidaPassado: 'Ali {eixoNome} já estava travado. {significado}',
    invertidaFuturo: '{eixoNome} segue travado. {significado}. Vetor, não fato consumado.',
    invertidaPresente: '{eixoNome} está travado. {significado}',
    invertidaSituacao: 'Situação, {nome} invertida: {eixoNome} está travado. {significado} Em {nome} invertida, {contexto} ficam sob bloqueio.',
    invertidaTensao: 'Tensão em {nome} invertida: {eixoNome} está travado. {significado}',
    invertidaProximoPasso: 'Próximo passo, {nome} invertida: {eixoNome} segue travado. {significado}. Vetor, não fato consumado.',
    diretaPassado: 'Raiz já cumprida: {significado}. É terreno, não notícia.',
    diretaFuturo: 'Sem mudar a condução: {significado}. Vetor, não fato consumado.',
    diretaPresente: '{significado}',
    diretaSituacao: 'Situação, {nome}: {significado}. Em {nome}, {contexto} delimitam o quadro.',
    diretaTensao: 'Tensão em {nome}: {significado}. Sombra: {sombra}.',
    diretaProximoPasso: 'Próximo passo, {nome}: {significado}. Vetor, não fato consumado.',
    diretaSemCasa: '{significado}',
    atributoFallback: 'o próprio símbolo',
    maiorPassado: '{opener}: {nome}, arcano {numero}, letra {letra} na grade da Golden Dawn.',
    maiorFuturo: '{opener}: {nome}, caminho {caminho} da Árvore da Vida, sob {atributo} na grade da Golden Dawn.',
    maiorPresente: '{opener}: {nome}, arcano {numero}, sob {atributo} na grade da Golden Dawn.',
    maiorSituacao: '{opener}: {nome}; arcano {numero}, letra {letra}; Golden Dawn.',
    maiorTensao: '{opener}: {nome}; letra {letra}, sob {atributo}; Golden Dawn.',
    maiorProximoPasso: '{opener}: {nome}; arcano {numero}, Árvore da Vida, caminho {caminho}; Golden Dawn.',
    campo: '{opener}, {naipe} cobre {territorio}.',
    campoSemTerritorio: '{opener}, fala {naipe}.',
    asPassado: '{campo} O Ás é {astro}, e naquele ponto o potencial estava inteiro — pela grade da Golden Dawn.',
    asFuturo: '{campo} O Ás é {astro} — semente, não colheita (grade da Golden Dawn).',
    asPresente: '{campo} O Ás é {astro}, potencial ainda não gasto — pela grade da Golden Dawn.',
    asSituacao: '{campo} {nome}: {astro}; potencial situado; Golden Dawn.',
    asTensao: '{campo} {nome}: {astro}; potencial sob atrito; Golden Dawn.',
    asProximoPasso: '{campo} {nome}: {astro}; semente em gesto; Golden Dawn.',
    cortePassado: '{campo} Golden Dawn: {astro}, {papel}.',
    corteFuturo: '{campo} Golden Dawn: {astro} — quem conduz daqui.',
    cortePresente: '{campo} Golden Dawn: {astro} — {papel}.',
    corteSituacao: '{campo} {nome}: {astro}; {papel}; Golden Dawn.',
    corteTensao: '{campo} {nome}: atrito em {astro}; {papel}; Golden Dawn.',
    corteProximoPasso: '{campo} {nome}: gesto em {astro}; {papel}; Golden Dawn.',
    numeradaPassado: '{campo} Golden Dawn: {astro}, {papel}.',
    numeradaFuturo: '{campo} Golden Dawn: {tituloGD}, {astro} — quem conduz daqui.',
    numeradaPresente: '{campo} Golden Dawn: {tituloGD}, {astro} — {papel}.',
    numeradaSituacao: '{campo} {nome}: {tituloGD}; {astro}; {papel}; Golden Dawn.',
    numeradaTensao: '{campo} {nome}: {tituloGD} sob atrito; {astro}; {papel}; Golden Dawn.',
    numeradaProximoPasso: '{campo} {nome}: {tituloGD} orienta; {astro}; {papel}; Golden Dawn.',
    menorFallback: '{campo} É dali que esta carta fala, na grade da Golden Dawn.',
    conselhoFuturo: 'Muda o vetor: {conselho}',
    conselhoPresente: '{conselho}',
    conselhoTensao: '{nome}, cuidado: {conselho}',
    conselhoProximoPasso: '{nome}, gesto: {conselho}',
  },
  waite: {
    titulo: 'O que A. E. Waite escreveu em 1911 — a carta {orientacao} na lista dele',
    orientacao: { direta: 'direta', invertida: 'invertida' },
    notas: buildWaiteNotas(),
  },
  dignidade: {
    intro: 'Nesta mesa de três, a carta do meio não se lê sozinha: as duas vizinhas reforçam ou enfraquecem a força dela, conforme o elemento de cada uma — fogo, água, ar ou terra. Aqui o meio é {nome}, de {elemento}, ladeado por {vizinhas}. {veredito} E não sou eu inventando: é a dignidade elemental, regra da tríade do "Book T" (S. L. MacGregor Mathers, fim do séc. XIX, publicada por Regardie em 1937-1940).',
    vizinha: '{nome} ({elemento})',
    vizinhaForaDaRegra: '{nome} (carta de planeta — fica fora desta regra)',
    vizinhasConector: ' e ',
    vereditos: {
      duasContrarias: '{nome} sai mal dignificada: os dois lados são contrários ao elemento dela, e a tradição diz que aí ela perde força — o assunto do meio não encontra apoio em nenhuma das duas casas vizinhas.',
      dividida: '{nome} fica dividida: um lado sustenta o elemento dela e o outro é contrário, então a força dela depende de qual das duas casas você olhar.',
      umaContraria: '{nome} sai enfraquecida por um dos lados, sem nada do outro que compense.',
      duasIguais: '{nome} sai muito reforçada: os três são do mesmo elemento, e a regra vale para os dois lados — reforça tanto o que a carta tem de bom quanto o que ela tem de duro.',
      fortalecida: '{nome} sai fortalecida: as duas vizinhas são do mesmo elemento ou de elemento amigo, e a tradição lê isso como energia que corre sem obstáculo.',
      apoioDeUmLado: '{nome} recebe apoio de um lado só; o outro é passivo, nem ajuda nem atrapalha.',
      passiva: '{nome} fica em terreno passivo: nenhuma vizinha reforça nem contraria o elemento dela.',
    },
  },
  spread: SPREAD_TEXTS,
  tradicaoNota: {
    astroComTitulo: '{tituloGD} ({astro})',
    letraComClasse: 'letra hebraica {letra}, {classe} do Sepher Yetzirah — o "Livro da Formação", texto antigo da mística judaica',
    letraSemClasse: 'letra hebraica {letra}',
    caminho: 'caminho {caminho} da Árvore da Vida, o mapa da Cabala',
    separador: ' · ',
  },
  cards: buildCards(),
};

export default pack;
