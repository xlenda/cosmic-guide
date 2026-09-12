// lib/lectura.en.js
// THE ENGLISH OF THE READING ENGINE. Mirrors TABLAS + ALTERNATIVAS + the
// nameless greeting of lib/lectura.js, with the SAME keys and the same shape.
//
// ===========================================================================
// WHY A SIBLING FILE AND NOT KEYS IN datos/textos.js
// ===========================================================================
// What lives here is a TABLE INDEXED BY ANSWER: the engine asks for
// TABLAS.accion['entender-mi-parte'], not a screen key. Flattening that into
// 'lectura.tablas.accion.entender-mi-parte' would trade a table the engine
// already reads for 76 loose ownerless keys — and, above all, it would land in
// datos/textos.en.js, which belongs to the OTHER translation wave. Same
// reasoning, and the same mould, as datos/lecturas.js with datos/lecturas.en.js.
//
// THE FALLBACK is the one t() and traduzir.js use, in this order: field in the
// active language -> field in PORTUGUESE -> nothing invented. A key missing here
// shows the Portuguese, which is true; never a blank screen.
//
// ===========================================================================
// DOCTRINE — the three rules this file cannot break
// ===========================================================================
// 1. NO PROMISE OF AN OUTCOME. Nothing here says what the other person will do.
//    The reading describes, and it ends in a gesture belonging to THE READER.
// 2. THE OTHER PERSON IS ALWAYS "that person". Never "he", never "she": the
//    gender of whoever is on the other side is never assumed (contract, item 4).
// 3. NO FUTURE TENSE where the subject is the other person. The guard in
//    lib/lectura.js reads PT/ES morphology and is BLIND to English "will" — so
//    in English the rule is held by the gate
//    (test/madremaria-lectura-tres-idiomas.test.js), not by the engine. That is
//    why this file is written in the present tense throughout.
//
// ===========================================================================
// THE ALTERNATIVES — what goes IN PLACE OF the removed sentence
// ===========================================================================
// They are what someone under hard no-contact receives INSTEAD of the
// invitation. So none of them may contain a contact word — write, message,
// call, text, reach out, talk, ask, tell, send. If an alternative carried one,
// the guard would eat the alternative itself and the person in a block would get
// exactly what the protection exists to prevent.
//
// English is the dangerous case: PATRONES_CONTACTO knows Portuguese and Spanish
// and NOTHING of English, so here no regex catches a slip. The wording avoids it
// by construction:
//   · "no step outward" instead of "don't write";
//   · "on this side of the thread" instead of "without contacting";
//   · "hold" instead of "wait for";
//   · plain present tense, never "will", never "is going to".
// test/madremaria-lectura-tres-idiomas.test.js checks each one against an
// explicit English word list, because the engine cannot.
// ===========================================================================

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

export const TABLAS = congelar({
  /* --- POSITION 1: THE KNOT — respuestas.corte (P2) ---------------------------- */
  preguntaNudo: {
    pelea: 'What got said that time that neither of you knew how to undo afterwards?',
    distancia: 'At what point did the two of you stop telling each other the small things?',
    ruptura: 'What actually broke on the day that got said outright?',
    'me-arrepenti': 'What were you protecting yourself from when you decided to end it?',
    'nunca-empezo': 'What went unsaid in something that never got a name?',
    generica: 'Where exactly did this get tangled?',
  },

  fraseNudo: {
    pelea: 'The card does not judge that argument: it marks the point where the thread pulled tight. A tight knot gets looked at before it gets touched.',
    distancia:
      'The card shows a knot that formed slowly, with no exact day to point at. That does not make it smaller: it makes it harder to find.',
    ruptura:
      'The card puts the knot on something that really was said. What was said has a date, and a date at least gives you an edge to start looking from.',
    'me-arrepenti':
      'The card puts the knot on your side of the thread. There is something uncomfortable and something useful in that at once: it is the only end within your reach.',
    'nunca-empezo':
      'The card shows a knot made of what never happened. It tangles just the same, even with no story to tell anyone.',
    generica: 'The card marks the point where the thread pulled tight. It does not explain why: it points at where to look.',
  },

  /* --- POSITION 2: THE TENSION — the PAIR cuando (P3) + hoy (P4) ---------------- */
  preguntaTension: {
    dias: 'How much of what you feel today is the wound, and how much is the shock of these few days?',
    semanas: 'What part of the tension is still alive, and what part has already become the habit of these weeks?',
    'meses-1-3': 'What turned into routine over these months without you noticing?',
    'meses-3-12': 'What have you been holding stretched for months because letting go feels like losing?',
    'mas-de-un-ano': 'What of this is still genuinely tense, and what is already an old gesture you repeat?',
    generica: 'What exactly keeps this stretched today?',
  },

  tiempo: {
    dias: 'With days in between, the card reads a tension that is still hot: nothing has settled, and what weighs today weighs double because of the noise.',
    semanas:
      'With weeks in between, the card reads a tension that has already lost the noise of the beginning and gone quieter.',
    'meses-1-3': 'With one to three months in between, the card reads a tension that has already taken the shape of routine.',
    'meses-3-12':
      'With several months in between, the card reads a tension that has become part of the landscape and is barely noticed until someone names it.',
    'mas-de-un-ano':
      'With more than a year in between, the card reads an old tension, the kind held up by habit rather than by urgency.',
    generica: 'The card reads a tension that has been settled in for a long while.',
  },

  /* The contact axis. The two hard-filter states ('le-escribi-no-responde' and
   * 'cero-contacto') describe the waiting WITHOUT proposing anything — they are
   * what the guard protects, so they must not fall into it. Worded without
   * "write", "message" or "wait for a reply". */
  contacto: {
    hablamos:
      'And since there is still conversation, what is stretched is not the silence, but what goes unnamed inside that conversation.',
    'le-escribi-no-responde':
      'And since there has already been an attempt of yours with nothing coming back, the tension lives on this side today: what holds it up is the pause, not an exchange.',
    'cero-contacto':
      'And since there is no contact from either side, what is stretched is yours and only yours: today there is nobody on the other side pulling the thread.',
    'me-escribe-a-veces':
      'And since word arrives with no pattern, the tension renews itself each time and never gets to settle.',
    bloqueo:
      'And since there is a block in the middle, the card reads a tension with no way outward: what moves, moves on the inside.',
    generica: 'And the state of contact today changes the weight of that tension more than anything else.',
  },

  /* --- POSITION 3: YOUR END — respuestas.intencion (P5) ------------------------ */
  preguntaExtremo: {
    'entender-que-paso': 'What part of this story do you understand better today than yesterday?',
    'entender-mi-parte': 'What did you do that you would do differently today, without turning it into guilt?',
    /* "instead of waiting for a sign" would be the natural phrase here and falls
     * into the guard itself in the PT/ES originals (wait + sign). The question
     * gets rewritten; the guard does not get loosened. */
    'decidir-insistir-o-soltar': 'What do you need to know about yourself in order to decide today, without depending on any sign from outside?',
    'entender-que-diria': 'What would you say if you did not have to manage anyone else’s reaction?',
    'entender-para-cerrar': 'What do you still need to understand for this to stop taking first place in your day?',
    generica: 'What part of this is genuinely in your hands today?',
  },

  fraseExtremo: {
    'entender-que-paso':
      'The end of the thread you hold today is not the whole explanation: it is the part of the story you can already tell without your voice tangling. That part is already yours.',
    'entender-mi-parte':
      'The end you hold today is your part, at the real size it is: not all the blame, and not none. Looking at that part whole is what brings it down to the size of one person.',
    'decidir-insistir-o-soltar':
      'The end you hold today is not the decision: it is the material a decision gets made from. Nobody decides well with half the facts and the other half imagined.',
    'entender-que-diria':
      'The end you hold today is your own voice: what you would say, whole, unedited by fear of anyone’s reaction. That version exists even if it never reaches anywhere.',
    'entender-para-cerrar':
      'The end you hold today is the room this matter takes up in your day. That room is yours, and it gets measured without anyone’s permission.',
    generica:
      'The end you hold today is what is in your hand: to look, to name, and to decide how much room to give this.',
  },

  /* --- SYNTHESIS -------------------------------------------------------------- */
  lecturaCierre: {
    pelea: 'The three read over a story that got cut off suddenly: that is why the knot has a date and the tension still sounds like what was said.',
    distancia:
      'The three read over a story that came loose little by little: that is why the knot has no exact date and the tension feels more like an emptiness than a noise.',
    ruptura:
      'The three read over a story that closed with words: that is why the knot sits in what was said, and the tension in everything that stayed underneath it.',
    'me-arrepenti':
      'The three read over a decision that was yours: that is why the knot falls on your side and your end weighs more than in any other spread.',
    'nunca-empezo':
      'The three read over something that never got a name: that is why the knot is made of possibility rather than of story, and it tightens just the same.',
    generica:
      'The three read together: the knot where it pulled tight, the tension that keeps this stretched, and the end you hold in your hand.',
  },

  tuParte: {
    'entender-que-paso':
      'What you hold is the version of events that can actually be revised: yours. That one puts itself in order on its own, with nobody coming to confirm it.',
    'entender-mi-parte':
      'What you hold is your part, and only that. The part belonging to whoever is on the other side is not in your hand and is not in this reading.',
    'decidir-insistir-o-soltar':
      'What you hold is the criterion: which information you decide with and which you do not. The decision can keep; the criterion cannot.',
    'entender-que-diria':
      'What you hold is your own words. They exist whole even unspoken, and putting them in order changes the weight this matter has in your day.',
    'entender-para-cerrar':
      'What you hold is the room this matter takes up. Nobody else changes that room for you, and that is why nobody else can stop you from changing it.',
    generica:
      'What you hold is your end of the thread: what you look at, what you name, and the room you give this in the day.',
  },

  /* The "ONE ACTION FOR TODAY" block. Every action completes on its own: paper,
   * voice, a count. None of them depends on anyone answering, showing up or
   * giving permission.
   *
   * "Write" is avoided here on purpose, same as in the Portuguese: it is the
   * imperative of going outward in PATRONES_CONTACTO, and the action runs
   * through both guards ALWAYS. In English the engine would not catch it — which
   * is precisely why the wording must not rely on the engine catching it. */
  accion: {
    'entender-que-paso':
      'Put down in a single line what broke, in your own words and with no decoration. One line, and leave it where nobody else reads it.',
    'entender-mi-parte':
      'Finish out loud, just once, the sentence that begins «in this, I did». Nobody needs to hear it for it to count.',
    'decidir-insistir-o-soltar':
      'Make two lists on the same sheet: what you know and what you are assuming. Do not decide today; today is only for separating one from the other.',
    'entender-que-diria':
      'Put down what you would say, whole, on a sheet you can tear up afterwards. The sheet is not for anyone: it is to get this out of your head.',
    'entender-para-cerrar':
      'Count how many times this matter has come into your head since you woke up, and note the number without correcting it. Closing begins with knowing the real size of what is being closed.',
    generica:
      'Put down on a sheet the sentence that keeps going round today, and leave it there. Getting it out of your head and onto the paper is already the action.',
  },

  entrada: {
    nudo: {
      derecha: 'Upright in this position, the card says it plainly:',
      invertida: 'Upside down in this position, the card shifts the emphasis:',
    },
    tension: {
      derecha: 'Upright, the card points at where it eases:',
      invertida: 'Reversed, the card points at what is gripping too hard:',
    },
    extremo: {
      derecha: 'Upright at your end, the card gives back this:',
      invertida: 'Reversed at your end, the card gives back this:',
    },
  },
});

export const ALTERNATIVAS = congelar({
  contacto: {
    generica:
      'With contact the way it stands today, this reading asks for no step outward. What is left to do gets done on this side of the thread.',
    nudo: 'Here the card asks for no movement outward: it asks you to look at the knot from where you are, which is the only place it can be looked at from.',
    tension:
      'With contact the way it stands today, the card points at nobody else. Holding the tension without pulling the thread any tighter is also doing something.',
    extremo:
      'Your end of the thread does not depend on anyone else showing up. What falls to you today completes with you, and that is why it can be completed.',
    accion: 'Today’s action goes through nobody else: it goes through you, and it ends when you end it.',
  },
  futuro: {
    generica: 'This card predicts nothing. It speaks of the place where you stand today.',
    extremo:
      'At your end, the card predicts nothing: it speaks of what you have in your hand today and of what can be looked at with that.',
    accion: 'Today’s action gets done today and ends today. It needs no date to count.',
  },
  aviso:
    'With contact the way it stands today, this reading asks for no step outward. Stay with the image of the card: the action of the day is the one you hold.',
});

/* The greeting for when no name arrived. TRANSLATED, not left in Portuguese:
 * it is the FIRST line of the synthesis, the one that opens the climax screen of
 * the funnel. Leaving it in Portuguese would put a single foreign sentence
 * directly above the whole translated block — the exact defect named by
 * feedback-app-inteiro-no-mesmo-idioma. Never interpolate an empty value into
 * 'sintesis.saludo': it would read ", this is what was left...". */
export const SALUDO_SIN_NOMBRE = 'This is what was left on the table.';

/* The heading of the three-card enumeration in the synthesis. It lives here and
 * not in datos/textos.en.js for the same reason the tables do: the engine
 * assembles it, and the engine reads from here. */
export const SOBRE_LA_MESA = 'On the table:';

export default TABLAS;
