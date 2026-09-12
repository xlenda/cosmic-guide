// datos/rituais.en.js
// INGLES dos rituais ROTATIVOS de datos/rituais.js. Arquivo VIZINHO, como
// datos/textos.en.js, e mesma forma do rituais.es.js ao lado: mapa por id, so
// texto visivel.
//
// ATENCAO AO NOME: este NAO e datos/ritual.en.js (singular), que e o ritual de
// SETE DIAS. Aqui nao ha dia 7, nao ha pacto e nao ha progresso: sao os gestos
// que giram e nao acabam.
//
// ===========================================================================
// O QUE NAO ENTRA AQUI
// ===========================================================================
//   · id — chave tecnica, e aqui e a CHAVE do objeto. E o que lib/rituaisRotativos.js
//     poe na ESCALA; id trocado = toque morto na rotacao, sem erro nenhum.
//   · precisaCamera — O CAMPO QUE MANDA. Quem le e a tela, nao o texto.
//   · obra / autor / quando — CITACAO REAL, e duas delas NAO sao em ingles:
//     "Das Spiel der Hoffnung" (Johann Kaspar Hechtel, Nuremberg, 1799) e "Les
//     Rêveries du promeneur solitaire" (Jean-Jacques Rousseau, Paris, 1782)
//     ficam no idioma em que foram publicadas. Traduzir o titulo para ingles
//     faria a citacao apontar para um livro que nao existe. O mesmo vale para
//     "Oneirocritica" e "A Manual of Cheirosophy". Vem do PT, sempre.
//   · comoFazerTexto — DERIVADO no original.
//
// ===========================================================================
// OS PASSOS: VERBO OBSERVAVEL
// ===========================================================================
// Todo passo e verbo de acao que se PODE CONFERIR ("turn", "look", "write").
// Nada de "feel", "connect with", "allow yourself": verbo que ninguem consegue
// conferir e verbo que a pessoa acha que fez errado.
//
// "WRITE" aqui e legitimo: escrever nao e sair. O passo pede palavra que fica
// NESTE telefone, o oposto de mandar recado. Nenhum passo manda procurar,
// escrever PARA alguem, ligar nem aparecer — e em ingles o cuidado e extra,
// porque "reach out" soa inofensivo e e exatamente o empurrao proibido. Duas das
// cinco respostas da pergunta 4 do onboarding sao 'le-escribi-no-responde' e
// 'cero-contacto', e para quem respondeu qualquer uma delas um gesto de contato
// e o app empurrando a pessoa para o lugar mais doloroso que ela tem.
//
// SEM ALEGACAO DE SAUDE: nenhum gesto "calms", "relieves", "treats" nem "clears
// your head". O texto descreve o gesto e para. O `naoTemFonte` do canto mantem a
// frase do ORIGINAL sobre arrumar com as maos, sem aumentar.
//
// NENHUM DESFECHO PROMETIDO, e em ingles o portao antigo nao pega: hablaDelFuturo()
// morde morfologia PT/ES ('-rá', '-rán'), e "will come back" nao tem terminacao.
// Quem guarda este arquivo e test/madremaria-promessa-tres-idiomas.test.js.
//
// GESTO QUE TEVE DE MUDAR DE PAIS: nenhum. Xicara de cafe, a propria mao, o
// telefone, papel, a quadra e uma gaveta existem em qualquer pais. O unico
// ajuste de vocabulario e 'coffee grounds' (nao 'dregs'), que e o termo que a
// Onda 1 ja fixou na tela ('plano.tela.ritual.abrir.cafe' em datos/textos.en.js),
// e 'the block' para o quarteirao.
// ===========================================================================

export const RITUAIS = {
  cafe: {
    nome: 'The coffee grounds',
    gesto: 'Turning the empty cup over onto the saucer and looking at the drawing the grounds left.',
    duracao: '5 minutes',
    abertura:
      'Today belongs to the grounds. You drink the coffee to the last drop, turn the cup over and look at what stayed drawn in there. Nobody here is going to tell you what the figure is: the one who picks the word is you.',
    comoFazer: [
      'Drink the coffee until only the grounds are left at the bottom.',
      'Turn the cup upside down on the saucer and count to ten.',
      'Turn it back up and look at the drawing for a few seconds, without looking for anything in particular.',
      'Photograph the cup.',
      'Pick ONE word for what you saw and write it under the photo.',
    ],
    fecho:
      'A photo and a word are left, with today’s date. The word is yours: nothing here corrected it.',
    fonte: {
      nota: 'Reading what the grounds leave in the cup is an old and widespread practice, but the repertoire of figures going around today was organised in English manuals from the start of the 20th century. The manual describes figures; it does not claim they tell you anything about another person.',
    },
  },

  mao: {
    nome: 'The line on your own hand',
    gesto: 'Opening your own palm under a light and following one line with your finger, start to finish.',
    duracao: '5 minutes',
    abertura:
      'Today belongs to your hand. You open the palm, pick one line and run it with your finger to where the stroke ends. It is a drawing that is with you all day long and that you almost never look at.',
    comoFazer: [
      'Open the hand you use less, under a direct light.',
      'Pick ONE line, the one that catches your eye first.',
      'Run the finger of your other hand along it, slowly, from the start to where it fades out.',
      'Notice where it is deep, where it breaks, and where another line crosses it.',
      'Write one sentence about what you saw in the drawing — not about what it means.',
    ],
    fecho: 'You looked at your own hand for five minutes and left a sentence written about it.',
    fonte: {
      nota: 'The system of mounts, hand types and line names the manuals use today was organised in 19th-century Europe. The treatise attributed to Aristotle that these manuals like to cite is not among his works. None of this replaces a medical exam, and this ritual claims nothing about anyone’s body.',
    },
  },

  cartas: {
    nome: 'The same three',
    gesto: 'Opening your reading again and listening to one of the three all the way through.',
    duracao: '5 minutes',
    abertura:
      'Today belongs to your three cards — the same ones that brought you this far. They do not change. What changes, from moon to moon, is the one reading them.',
    comoFazer: [
      'Open your reading again.',
      'Read the three in order, without rushing.',
      'Pick the one that moves you most today — it may not be the same one as last time.',
      'Listen to its audio all the way through, without doing anything else while you listen.',
    ],
    fecho: 'The reading is the same. What changes is the ear — and that is what this gesture measures.',
    fonte: {
      nota: 'The 36-card game the three cards of this reading came from. It only became "the Lenormand deck" in 1846, two years after Marie Anne Lenormand died — her name was borrowed without leave, and that is why the source here is the original game, not the legend.',
    },
  },

  sonho: {
    nome: 'What the night left',
    gesto: 'Writing down what the night left — the dream, or the way you woke up.',
    duracao: '5 minutes',
    abertura:
      'Today belongs to the night just gone. Did a dream come? The loose scrap counts, the scene with no head or tail. None came? That works too — how you woke up is word from the same place.',
    comoFazer: [
      'If a dream came, write down what is left of it, in the jumbled order it comes in.',
      'If none came, write down how you woke up: the body, the mood, the first thing you thought.',
      'Note who was in it — in the dream, or in that first thought.',
      'Underline the strongest image in what you wrote.',
      'Write what YOU think it is. The app is not going to hand you any meaning.',
    ],
    fecho: 'What the night left is written down with the date. A month from now it will still be here.',
    fonte: {
      nota: 'It is the most complete treatise on dreams that came down from antiquity — and it spends five books insisting that the same dream means different things depending on who dreamt it. That is why there is no dictionary of symbols here: the record is yours and so is the reading of it.',
    },
  },

  caminhada: {
    nome: 'The walk for noticing',
    gesto: 'Going out on foot for five minutes and coming back with ONE thing never seen before.',
    duracao: '5 minutes',
    abertura:
      'Today belongs to the street. This is not exercise: it is stepping out of the phone’s orbit and coming back with a detail that was always there and you had never seen.',
    comoFazer: [
      'Go out on foot, no headphones and no set route — the block is enough.',
      'Walk looking up and to the sides, not at the ground.',
      'Pick ONE thing you had never noticed: a window, a tree, a sound.',
      'Come back and write that thing in one line, in today’s question.',
    ],
    fecho:
      'The street was the same yesterday. What changed was the eye — and an eye trained on noticing sees what routine hides.',
    fonte: {
      nota: 'The book that turned the aimless walk into a method for listening to oneself: Rousseau would go out on foot to put his head in order and, on coming back, write down what the road had shown him.',
    },
  },

  canto: {
    nome: 'One corner in order',
    gesto: 'Picking one small corner and leaving it in order, with your hands.',
    duracao: '5 minutes',
    abertura:
      'Today belongs to tidying ONE corner — the drawer, the side table, the bag. Only one, small on purpose: whatever fits in five minutes.',
    comoFazer: [
      'Pick the corner before you start, and do not switch halfway.',
      'Take everything out of it, without judging anything.',
      'Put back only what stays; the rest has two destinations: the bin, or somewhere else.',
      'Look at the finished corner for ten seconds, without touching anything more.',
    ],
    fecho:
      'Nobody tidies a whole life in one day. One corner at a time is how anything big gets done.',
    naoTemFonte:
      'This gesture has no old treatise behind it, and we would rather say so than invent one. It is here because tidying with your hands settles the head — and a corner in order is a piece of the day under your command.',
  },

  respiro: {
    nome: 'Five minutes still',
    gesto: 'Sitting down, turning the phone face down and counting breaths up to twenty.',
    duracao: '5 minutes',
    abertura:
      'Today asks for no materials at all: no cup, no deck, no notebook. Just five minutes in which the only task is counting to twenty.',
    comoFazer: [
      'Sit wherever you are and put both feet on the floor.',
      'Turn the phone face down.',
      'Count twenty whole breaths, one by one.',
      'If you lose count, start again from one — losing count is part of it.',
      'Turn the phone back over and mark the day.',
    ],
    fecho: 'Five minutes in which you did nothing else. Today is marked.',
    naoTemFonte:
      'Counting breaths sitting down: a contemporary practice, with no old source found. There are traditions that have counted the breath for a very long time, but none of them describes this gesture this way, with this number and for this long — so there is no work to cite, and inventing one would be worse than having none.',
  },
};

export default RITUAIS;
