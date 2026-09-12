// datos/lecturas.en.js
// INGLES dos dois catalogos de datos/lecturas.js — as oito figuras da borra e as
// quatro linhas da mao. Arquivo VIZINHO, como datos/textos.en.js. Mesma forma do
// lecturas.es.js ao lado: mapa por id, so texto visivel, a `nota` da fonte
// inclusa e obra/autor/quando fora.
//
// ===========================================================================
// O QUE NAO ENTRA AQUI, E POR QUE
// ===========================================================================
//   · id — chave tecnica; aqui ele e a CHAVE do objeto, e e assim que a fusao em
//     datos/lecturas.js acha o par. Renomear = entrada muda em ingles, sem erro.
//   · obra / autor / quando — CITACAO BIBLIOGRAFICA REAL, e em ingles a
//     tentacao e maior justamente porque as tres obras JA sao inglesas:
//     "Telling Fortunes by Tea Leaves" (Cicely Kent, London, 1922), "A Manual of
//     Cheirosophy" (Edward Heron-Allen, London, 1885) e "The Laws of Scientific
//     Hand Reading" (William G. Benham, New York, 1900) ficam EXATAMENTE como
//     estao, sem "translated", sem reescrever a cidade e sem mexer no ano. Quem
//     resolve esses campos e o PT — e a fusao troca apenas a `nota`.
//
// ===========================================================================
// A LINHA QUE NAO SE ATRAVESSA, EM INGLES
// ===========================================================================
// NENHUM DESFECHO PROMETIDO. E em ingles o risco e tecnico, nao so editorial:
// os portoes antigos (hablaDelFuturo em lib/lectura.js) morderam MORFOLOGIA de
// futuro PT/ES — '-rá', '-rán' — e "will come back" nao tem terminacao nenhuma
// para morder. Quem guarda este arquivo e
// test/madremaria-promessa-tres-idiomas.test.js, com 28 formulas EN, e ele
// descobre o arquivo pelo disco e tira o idioma do nome ('.en.js').
//
// Por isso, aqui, a leitura do manual e sempre ATRIBUIDA ("the manuals read it
// as...", "Kent reads it as...") e nunca afirmada. Citar o que a tradicao diz
// nao e dizer que acontece.
//
// GENERO: 'that person', 'they' — nunca 'he'/'she' para quem esta do outro lado.
// 'Madre Maria' continua Madre Maria: e nome, nao titulo.
// ===========================================================================

/* A datacao da PRATICA, mostrada uma vez por tela, acima das figuras. */
export const TRADICION_BORRA = {
  titulo: 'How old is this, really',
  texto:
    'Reading what the grounds leave in the cup is an old and widespread practice, and it reaches Europe along with coffee, in the 17th century. The repertoire of figures going around today is much newer: it was organised in English manuals from the start of the 20th century, and that is where almost everything you read out there comes from.',
  fonte: {
    nota: 'It is one of the manuals that fixed that repertoire. It describes figures; it does not claim, at any point, that a figure tells you what another person is thinking or doing.',
  },
};

export const TRADICION_MANO = {
  titulo: 'How old is this, really',
  texto:
    'Looking at the lines of the hand is an ancient practice and it turns up in places very far apart from each other. But the system the manuals use today — the names of the lines, the mounts, the hand types — was organised in Europe between 1840 and 1900. It is recent, and that is worth knowing before you read anything into it.',
  fonte: {
    nota: 'The treatise attributed to Aristotle that these manuals like to cite as the origin is not among his works. And none of this speaks about anyone’s body: it does not replace a medical exam and it is not used here to say anything about health.',
  },
};

/* =================================================================================
 * AS OITO FIGURAS DA BORRA, por id. Mapa, nao lista: a ORDEM de tela sai do PT,
 * e assim nenhuma traducao reordena a tela por engano.
 * ================================================================================= */
export const FIGURAS_BORRA = {
  anel: {
    nome: 'A ring',
    comoE: 'A closed loop, or almost closed, anywhere in the cup.',
    leitura:
      'In the manuals the ring is the figure of what closes: a line that goes all the way round and touches its own beginning. They read that as marriage. Here it announces nothing about anyone — it is a closed shape, and it is the one that caught your eye today.',
    pergunta: 'What in your last week has already gone all the way round and come back to where it started?',
    fonte: {
      nota: 'The ring belongs to the English repertoire that the manuals of the early 20th century organised. Kent reads it as marriage; this reading does not, and no figure here claims anything at all about another person.',
    },
  },

  passaro: {
    nome: 'A bird',
    comoE: 'A small body with two lines opening out to the sides, like wings.',
    leitura:
      'The bird is one of the most repeated figures in the repertoire, and the manuals read it as news arriving from far away. What can be said without inventing is what the shape is: a small thing, wings open, still in the middle of the grounds. No news is written in a cup.',
    pergunta: 'Which of your matters has been sitting still, waiting on something that is not in your hands?',
    fonte: {
      nota: 'The news reading belongs to the manual, not to this app. It is quoted here as what the tradition records — quoting what the tradition says is not claiming that it happens.',
    },
  },

  caminho: {
    nome: 'A path',
    comoE: 'One long line, straight or wavy, crossing the grounds.',
    leitura:
      'Long lines are, in the manuals, the figure of travel: the straighter, the more direct the route; the wavier, the more detours. It is a description of shape, and that is all it hands over. Where that line starts and where it ends are things only you can look at.',
    pergunta: 'If that line were your last month, which point of it are you standing on now?',
    fonte: {
      nota: 'Lines as a route is one of the steadiest parts of the English repertoire. The manual describes the stroke; it sets no date and no destination, and neither does this text.',
    },
  },

  ponte: {
    nome: 'A bridge',
    comoE: 'Two banks and a short stroke joining them.',
    leitura:
      'The bridge is in the English lists of figures, read as a crossing from one side to the other. What it shows is the structure: there are two banks, and there is something short in between. The bridge does not say who crosses, or on what day.',
    pergunta: 'What are the two banks of your matter today — the one you left, and the one you are looking at?',
    fonte: {
      nota: 'The bridge appears in the repertoire as a crossing. The manual names neither who crosses nor when — and where it keeps quiet, this text keeps quiet with it.',
    },
  },

  escada: {
    nome: 'A ladder',
    comoE: 'Two parallel lines with short strokes crossing between them.',
    leitura:
      'The ladder is in the repertoire of the manuals, read as a climb in stages. The shape is literal: rungs, one above the other, none skipped. It describes the way up — not the height you reach, which no grounds know.',
    pergunta: 'Which rung is right in front of you: the next one, not the last one?',
    fonte: {
      nota: 'The ladder belongs to the English repertoire. The manual speaks of stages; it does not promise the top, and the question here asks on purpose for the next rung.',
    },
  },

  no: {
    nome: 'A knot',
    comoE: 'A point where two or more lines cross and the drawing thickens.',
    leitura:
      'The knot does not come from the manuals: it is this house’s own figure. In grounds it shows up as a thickening, a darker patch where the strokes meet and stop running. It is the same drawing that gives your thread in here its name.',
    pergunta: 'Which is the matter that, when you get to it, makes everything else stop?',
    naoTemFonte:
      'The knot was not found in the lists of coffee-grounds figures: it is this app’s figure, not the tradition’s. It comes in here as a shape, and that is why it has no work and no author to cite — inventing one would be worse than having none.',
  },

  muro: {
    nome: 'A wall',
    comoE: 'A continuous dark band, with no opening, cutting across the cup.',
    leitura:
      'The wall is not in the old lists. It came in here because it is what many people see first in closed grounds: a band with no way through. It is a shape that interrupts — and noticing it already says something about where your eye landed today.',
    pergunta: 'What are you treating as impassable today, and what ruler did you measure that with?',
    naoTemFonte:
      'The wall was not found in the coffee-grounds manuals consulted. It is a contemporary figure, and it is declared as one instead of borrowing a work that does not speak of it.',
  },

  ponto: {
    nome: 'A single dot',
    comoE: 'One single mark, set apart, far from the rest of the drawing.',
    leitura:
      'Dots do exist in the coffee-grounds manuals, but about another matter: they are read as money. This app does not use that reading. Here the dot is what it looks like — one lone mark that ended up outside the rest of the drawing and is there all the same.',
    pergunta: 'What in your life ended up like that: apart from the rest, and still there?',
    naoTemFonte:
      'The dot appears in the English manuals with another meaning (money), so this reading does not lean on them. It is contemporary, and borrowing the old work to speak about something else would be using it as decoration.',
  },
};

/* =================================================================================
 * AS QUATRO LINHAS DA MAO, por id. `comoE` e literalmente anatomico, como no PT:
 * descrever posicao e o unico jeito de ela achar a linha certa sem o app olhar a
 * mao dela.
 * ================================================================================= */
export const LINEAS_MANO = {
  corazon: {
    nome: 'The heart line',
    comoE: 'The highest of the three big ones: it runs horizontally, just below the base of the fingers.',
    leitura:
      'The 19th-century European manuals named this line "of the heart" and read in it the record of one’s affections. What you can check by looking is the shape: where it starts, whether it runs whole or breaks in the middle, and where it ends. The name belongs to the manual; the drawing is yours, and it was already there before any reading.',
    pergunta:
      'Run your finger along it to the end. At what point does it change — and what were you remembering when you reached that point?',
    fonte: {
      nota: 'The name and the affective reading of this line come from the 19th-century European systematisation. Nothing here claims what another person feels, and nothing here speaks about your body.',
    },
  },

  cabeza: {
    nome: 'The head line',
    comoE: 'The middle one: it starts near the index finger and crosses the palm horizontally, below the heart line.',
    leitura:
      'The manuals read in this line a way of thinking — straight would be the practical way, curving down would be the imaginative way. The verifiable part is only the stroke: how far it crosses, whether it drops at the end, whether it touches the life line at the start. The ruler belongs to the manual, and it is from 1900.',
    pergunta: 'Is it straight, or does it drop at the end? Describe the stroke in one sentence, without drawing any conclusion about yourself.',
    fonte: {
      nota: 'Benham put together the most detailed system of the European school and called it scientific; it is not. It is a scheme for classifying shapes — useful to look at, with no value as proof about anyone.',
    },
  },

  vida: {
    nome: 'The life line',
    comoE: 'The arc that curves around the base of the thumb, from mid-palm down to the wrist.',
    leitura:
      'This is the line the manuals get most wrong: several of them read it as a measure of how long someone lives. That has no support whatsoever, and this app does not repeat it. What you can look at is the arc — how wide it opens towards the centre of the palm, and where it runs. It is a drawing, and a drawing is no forecast of anything.',
    pergunta: 'Is its arc wide or tight? Say that in one sentence, and stop there: the sentence needs no conclusion.',
    fonte: {
      nota: 'The lifespan reading has been going around since the 19th-century manuals and it is refused here to its face. No line of the hand tells you anything about anyone’s body, and none of this replaces a medical exam.',
    },
  },

  destino: {
    nome: 'The fate line',
    comoE: 'The vertical one that climbs up the middle of the palm towards the middle finger. Plenty of hands have none at all.',
    leitura:
      'The 19th-century manuals call this one the line of fate and read work and place in it. The more interesting piece of information is another one, and it comes from the manuals themselves: this line is missing in many hands, and its absence means nothing bad in any manual. If you do not find one, that is your hand’s drawing too.',
    pergunta: 'Did you find one? If so, where does it start. If not, what did you notice in the place where it would be?',
    fonte: {
      nota: 'The absence of this line is recorded by the manuals themselves as common and of no weight. That is why it is here: it is the catalogue entry that disarms the reading instead of reinforcing it.',
    },
  },
};

export default { TRADICION_BORRA, TRADICION_MANO, FIGURAS_BORRA, LINEAS_MANO };
