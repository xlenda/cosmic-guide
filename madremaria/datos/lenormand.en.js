// datos/lenormand.en.js
// THE ENGLISH of the Lenormand deck — all 36 cards.
//
// Arquivo de UM tradutor so, no mesmo molde de datos/textos.en.js: o portugues
// fica em datos/lenormand.js (intocado), o espanhol em datos/lenormand.es.js.
// Tres arquivos disjuntos, zero conflito de merge.
//
// ===========================================================================
// WHAT IS HERE, AND WHAT IS NOT
// ===========================================================================
// TRANSLATED — the four fields the reader sees on screen:
//   nome     the card's canonical English name (The Rider, The Clover…)
//   escena   the picture described
//   leitura  what the card says
//   convite  the gesture the reader keeps
//   avisoDeAudio  (card 01 only) — internal note, never drawn on screen
//
// NOT TRANSLATED, and not an oversight:
//   id      'lenormand-01' addresses both the data and the artwork
//           (assets/madremaria/lenormand/<id>.jpg). Change it = orphan art, no error.
//   numero  a number, not a word.
//   naipe   Copas / Ouros / Paus / Espadas — see the note at the end of this file.
//   claves  keywords. The doctrine gate treats them as a technical field
//           (CAMPOS_FORA in test/madremaria-promessa-tres-idiomas.test.js) and
//           no screen draws them today. They stay in PT with the rest of the data.
//   audio   .m4a filename, resolved by STATIC require by Metro.
//
// ===========================================================================
// THE CARD NAME: WHY IT CHANGES HERE
// ===========================================================================
// The PT header says changing the name "would be inventing a different deck".
// True — and that is exactly why nothing is invented here: the Lenormand has
// circulated in English under its own canonical names since the 19th century,
// and those are the ones that go in — The Rider, The Clover, The Ship, The
// House, The Tree, The Clouds, The Snake, The Coffin, The Bouquet, The Scythe,
// The Whip, The Birds, The Child, The Fox, The Bear, The Stars, The Stork, The
// Dog, The Tower, The Garden, The Mountain, The Crossroads, The Mice, The
// Heart, The Ring, The Book, The Letter, The Man, The Woman, The Lily, The Sun,
// The Moon, The Key, The Fish, The Anchor, The Cross.
//
// This is the opposite of translating a WORK TITLE (those stay intact — see
// `fuente`/`obra` in other files): the card name does not point outside the
// app, it IS the card.
//
// ===========================================================================
// THE THREE CARDS WITH RECORDED VOICE — THE DECLARED MISMATCH
// ===========================================================================
// The Heart (24), The Clouds (06) and The Rider (01) have audio in the owner's
// voice, IN PORTUGUESE. No English audio exists for these cards, and this file
// does not pretend otherwise: the screen draws the English text and the listen
// button keeps playing the Portuguese .m4a, because `audio` is never
// translated. Until those tracks are re-recorded in English, whoever opens the
// app in English READS in English and HEARS Portuguese. Written down here so
// nobody finds out by accident — the same kind of mismatch the PT file already
// declares in the Rider's `avisoDeAudio`.
//
// ===========================================================================
// HONEST ENCHANTMENT — IT HOLDS IN ENGLISH TOO
// ===========================================================================
// The doctrine lives in madremaria/theme.js:80: "never an outcome, never a
// promise about what the other person will do". A translation that promises is
// a NEW violation, even when the original does not promise.
//
// ENGLISH IS THE DANGEROUS ONE. The seven pre-existing doctrine gates bite
// PT/ES morphology (-rá/-rão/-rán); "will come back" has no ending to catch, so
// it walks past ALL SEVEN. Only test/madremaria-promessa-tres-idiomas.test.js
// sees it. None of these go in here: "will come back", "will return", "is going
// to text you", "you will win them back", "in X days", "guaranteed", "destiny
// will bring".
//
// Every `leitura` describes what the card SHOWS; every `convite` closes on a
// gesture by THE READER. None of the 36 invitations tells anyone to reach out,
// write or show up for the other person — which matters double here, because
// PATRONES_CONTACTO in lib/lectura.js only knows PT and ES: an English
// invitation that pushed toward contact would reach someone in hard no-contact
// WITHOUT the runtime guard catching it. So the English invitations are clean
// at the source, by hand, not by the net.
//
// GENDER: PT addresses the reader in the feminine in five invitations
// ("sozinha"). English carries no gendered adjective there, so those land
// neutral for free. The gender of WHOEVER IS ON THE OTHER SIDE is never
// assumed: "that person", never "he"/"she".
//
// ADDRESS: "you", plain. Never "thou", never a pet name. "Madre Maria" stays
// Madre Maria — it is a name.

/** All 36, by id. A field missing here falls back to the Portuguese in datos/lenormand.js. */
export const LENORMAND_EN = {
  'lenormand-01': {
    nome: 'The Rider',
    escena: 'the rider at a gallop, already in motion when the card is turned',
    leitura:
      'The Rider is a card of movement: skill, strength, energy and speed. It is about initiative — about what is already underway, and what waits for someone to take the step.',
    convite:
      'Pick one thing of yours that is stalled waiting on someone else’s decision, and take the step in it that depends on you alone.',
    avisoDeAudio:
      'The recorded audio ends on "algo irá vir em sua direção e você precisa estar preparado" — a prediction about the future, which this app does not make. The written text keeps the card’s force without the prediction. Re-recording that sentence resolves the mismatch. The audio is also in Portuguese: there is no English track for it yet.',
  },

  'lenormand-02': {
    nome: 'The Clover',
    escena: 'the small clover in the middle of the grass, easy to walk right past',
    leitura:
      'The Clover speaks of small, short-lived luck: a gap, a relief, a good coincidence that does not repeat on its own. It is the card of minor chance — what shows up free and leaves the same way when nobody notices.',
    convite:
      'Write down the smallest good thing that happened today without you planning it, and what it would cost to make it happen again on your own.',
  },

  'lenormand-03': {
    nome: 'The Ship',
    escena: 'the ship with its sails open, already away from the shore',
    leitura:
      'The Ship speaks of distance: travel, going away, longing, and what happens far from where you are. It is also the card of what moves under its own power, pushed by a wind nobody at the harbour controls.',
    convite:
      'Name the distance that weighs most today — in miles, in time, or in subject — and write which of the three is within your reach.',
  },

  'lenormand-04': {
    nome: 'The House',
    escena: 'the house shut, with its door and roof whole',
    leitura:
      'The House speaks of ground: home, family, belonging, and the structure that holds the rest up. In a reading about a relationship it points to the terrain the thing happens on — what is a real dwelling and what is only a passage.',
    convite:
      'Look at the room you spend the most time in and ask yourself what in it is truly yours, and not inherited from a life built for two.',
  },

  'lenormand-05': {
    nome: 'The Tree',
    escena: 'the tree alone in the field, its root larger than its crown',
    leitura:
      'The Tree speaks of root and long time: what grows slowly, what has an old origin, and what does not move because someone wishes it would. It is the card of slow vitality — it measures in years what the others measure in days.',
    convite:
      'Pick something of yours that only improves by repetition, and do the smallest portion of it today.',
  },

  'lenormand-06': {
    nome: 'The Clouds',
    escena: 'the clouds heavy on one side and clear on the other, covering the sun',
    leitura:
      'The Clouds speak of a lack of clarity: doubt, secrecy, insecurity and conflict. Something or someone is keeping part of the truth, the way a cloud hides the sun’s brightness without putting it out.',
    convite:
      'Separate, on paper, what you know from what you are filling in on your own. Doubt loses size once it has two columns.',
  },

  'lenormand-07': {
    nome: 'The Snake',
    escena: 'the snake coiled, advancing in a curve and never in a straight line',
    leitura:
      'The Snake speaks of detour and cunning: the path that does not run straight, the complication that coils, and the presence of an interest that is not yours. It is the card of what moves slowly and without noise.',
    convite:
      'Point to the exact place where the story started going around in circles, and what you accepted there to avoid a fight.',
  },

  'lenormand-08': {
    nome: 'The Coffin',
    escena: 'the coffin shut, lying across the path',
    leitura:
      'The Coffin is the card of the end: closure, mourning, and what already said goodbye without a ceremony. It announces no loss — it names what inside you has already ended and still takes up room.',
    convite:
      'Write the name of one thing that ended and that you are still keeping open, and put the paper away.',
  },

  'lenormand-09': {
    nome: 'The Bouquet',
    escena: 'the bouquet already cut and arranged, offered with both hands',
    leitura:
      'The Bouquet speaks of kindness offered: beauty, pleasure, courtesy, and the joy that arrives already arranged. It is the card of the lovely gesture — and also of what is lovely on the outside while nobody asks what holds it up inside.',
    convite:
      'Offer a kindness today to someone with nothing to do with this story, and notice what is left in you afterwards.',
  },

  'lenormand-10': {
    nome: 'The Scythe',
    escena: 'the scythe with its blade turned, stopped at the top of the swing',
    leitura:
      'The Scythe speaks of cutting: an abrupt decision, a dry separation, and the harvest that only happens because something was reaped. It is the card of the fast gesture, which settles and wounds in the same motion.',
    convite:
      'Choose one small cut that depends on you alone — a group, an open tab, a habit — and make it today.',
  },

  'lenormand-11': {
    nome: 'The Whip',
    escena: 'the many-tailed whip, built to strike the same spot every time',
    leitura:
      'The Whip speaks of repetition and friction: the same argument again, the same wearing down, the same place struck many times. It is also the card of discipline — repetition serves either to wound or to train, and the difference lies with whoever sets the rhythm.',
    convite:
      'Name the sentence you have already repeated too often in this story, and decide what to do with the breath it costs you.',
  },

  'lenormand-12': {
    nome: 'The Birds',
    escena: 'two small birds on the same branch, talking at the same time',
    leitura:
      'The Birds speak of talk and of noise: the chatter, the small agitation, and the jitters that come from so many words at once. There are two of them on purpose — the card is about what exists only between two people, or between two voices of your own.',
    convite:
      'Decide which of the two voices inside you is talking loudest today, and give the other one five written minutes.',
  },

  'lenormand-13': {
    nome: 'The Child',
    escena: 'the child standing at the start of the road, carrying nothing',
    leitura:
      'The Child speaks of what is new and small: a beginning, innocence, lightness, and the still-modest size of something just born. It is the card that asks that a sprout not be held to the output of a tree.',
    convite:
      'Measure something recent in your life by the size it actually is today, and write down what would be fair to ask of it.',
  },

  'lenormand-14': {
    nome: 'The Fox',
    escena: 'the fox stopped side-on, watching without coming closer',
    leitura:
      'The Fox speaks of caution and sharpness: what does not introduce itself by its real name, the disguised interest, and the need to look twice. In the tradition it is also the card of work — the place where you have to be shrewd to survive.',
    convite:
      'Write down one thing you pretended to accept in this story, and the price pretending charged you.',
  },

  'lenormand-15': {
    nome: 'The Bear',
    escena: 'the bear on its feet, too large to ignore',
    leitura:
      'The Bear speaks of strength and power: protection, command, resources, and the weight of whoever runs the scene. It is also the card of jealousy and possession — the same strength that protects is the one that smothers when it cannot measure itself.',
    convite:
      'Recognise where in this story you have real strength, and where you only have the urge to control.',
  },

  'lenormand-16': {
    nome: 'The Stars',
    escena: 'many small stars scattered across the whole sky',
    leitura:
      'The Stars speak of orientation: hope, clarity, and the direction you find by looking up instead of at your feet. There are many of them on purpose — the card is about bearing as much as about the scattering of someone who wants to follow every point at once.',
    convite:
      'Write the three directions fighting over your head today, and circle the only one you can actually walk this week.',
  },

  'lenormand-17': {
    nome: 'The Stork',
    escena: 'the stork with its wings open, changing season',
    leitura:
      'The Stork speaks of change: relocation, a shift of phase, and the movement of whoever leaves and returns with the season. It is the card of the novelty that does not break anything — it moves where a thing sits without destroying what was already there.',
    convite:
      'Change one small, concrete thing in your routine today, and notice what that shifts in the rest of the day.',
  },

  'lenormand-18': {
    nome: 'The Dog',
    escena: 'the dog sitting alongside, off the leash and in no hurry',
    leitura:
      'The Dog speaks of loyalty: friendship, trust, and the presence that stays without needing to be summoned. It is also the card that asks whether the faithfulness at stake is a choice or dependence under another name.',
    convite:
      'Pick a loyal person in your life who has nothing to do with this story, and spend a piece of your day in that company.',
  },

  'lenormand-19': {
    nome: 'The Tower',
    escena: 'the tall narrow tower, with a single window',
    leitura:
      'The Tower speaks of isolation and authority: the firm limit, the institution, the height that protects and keeps away at once. It is the card of whoever withdraws — by choice, by office, or by defence.',
    convite:
      'Notice whether today’s withdrawal is protecting you or only leaving you alone with the subject.',
  },

  'lenormand-20': {
    nome: 'The Garden',
    escena: 'the public garden with its open walks, where everyone passes through',
    leitura:
      'The Garden speaks of what is public: company, community, gathering, and the part of life that happens in front of others. It is the card of exposure — what is shown in the square is seen by many people and explained by each of them differently.',
    convite:
      'Pick a shared place, however small, where you can be today for a reason that has nothing to do with this story.',
  },

  'lenormand-21': {
    nome: 'The Mountain',
    escena: 'the mountain lying across the road, with no visible way around',
    leitura:
      'The Mountain speaks of obstacle: blockage, delay, and the weight of what does not yield to willpower. It is the card of what is genuinely large — and for that reason is crossed in parts or gone around, never in one leap.',
    convite:
      'Break the obstacle that blocks you most into three pieces, and do the smallest one today.',
  },

  'lenormand-22': {
    nome: 'The Crossroads',
    escena: 'the road opening in two, with no sign on either side',
    leitura:
      'The Crossroads speak of choice: the fork, the alternative, and the discomfort of deciding without a guarantee. It is the card that hands the decision back to the hands of whoever is asking, and not to the circumstances.',
    convite:
      'Write down the two options in front of you and what each one costs — not what each one promises.',
  },

  'lenormand-23': {
    nome: 'The Mice',
    escena: 'the mice gnawing the corner of what is stored away',
    leitura:
      'The Mice speak of slow loss: the wear that eats from the edges, the tiredness that piles up, and the little that goes missing every day without a sound. It is the card of what does not break all at once — it only dwindles.',
    convite:
      'Find the cracks your energy leaks out of quietly, and close one today, even badly.',
  },

  'lenormand-24': {
    nome: 'The Heart',
    escena: 'an open heart, with no frame and no guard',
    leitura:
      'The Heart speaks of declared affection: love, happiness, passion and intimacy. In a reading about a relationship it points to a moment of sincere emotional connection, and to the search for harmony between the people involved.',
    // What YOU do with it today. Never what the other person is going to do.
    convite:
      'Notice where in your day that affection still shows up — and what it asks of you, not of the other person.',
  },

  'lenormand-25': {
    nome: 'The Ring',
    escena: 'the ring closed, with no visible beginning and no visible end',
    leitura:
      'The Ring speaks of bond: commitment, agreement, alliance, and the round shape of what repeats. It is the card of the contract — written or not — and of the terms somebody accepted without reading.',
    convite:
      'Write down the unspoken agreement you have been keeping in this story, and decide whether it is still yours.',
  },

  'lenormand-26': {
    nome: 'The Book',
    escena: 'the book with its cover closed, part of its pages still untouched',
    leitura:
      'The Book speaks of what is kept: a secret, knowledge, and the part of the story that has not been opened yet. It is the card of study — what is known from the inside, and what is only found out by reading to the end.',
    convite:
      'Pick a subject of yours you put off because you did not know enough, and read its first page today.',
  },

  'lenormand-27': {
    nome: 'The Letter',
    escena: 'the sealed envelope on the table, still unopened',
    leitura:
      'The Letter speaks of news and of the written word: a document, a message, a notice, and everything that travels in writing instead of by voice. It is the card of what stays on the record — what can be reread later, unlike what gets said in the heat.',
    convite:
      'Write to yourself what you would say if nobody were going to read it, and put the paper away with no address on it.',
  },

  /* THE TWO PERSON CARDS (28 and 29). The name comes from the tradition and
   * defines nobody's gender in the reading — the same rule as the Portuguese. */
  'lenormand-28': {
    nome: 'The Man',
    escena: 'the full-length figure, standing and turned toward the reader',
    leitura:
      'This is one of the two person cards in the deck: it marks one side of the story — whoever is asking, or whoever is on the other side. The name comes from the tradition and defines nobody’s gender in the reading; who it stands for is settled by the cards that fall around it.',
    convite:
      'Before deciding who this card is about, write in one line what you want for yourself in this story.',
  },

  'lenormand-29': {
    nome: 'The Woman',
    escena: 'the second full-length figure, facing the first',
    leitura:
      'This is the other person card, and it pairs with the previous one: one stands for whoever is asking and the other for whoever is on the other side. Which is which does not come from the name — it comes from where each one falls and from what the question asked.',
    convite:
      'Mark on paper which of the two figures is you today, and what changes in the reading if the positions are swapped.',
  },

  'lenormand-30': {
    nome: 'The Lily',
    escena: 'the lilies open in open country, in the slow rhythm of winter',
    leitura:
      'The Lily speaks of maturity: serenity, honour, experience, and what only arrives after time has been lived. In the tradition it also touches intimacy — the kind made of calm rather than urgency.',
    convite:
      'Choose one decision today that you would make with ten more years of road behind you, and make only that one.',
  },

  'lenormand-31': {
    nome: 'The Sun',
    escena: 'the sun high up, with no cloud between it and the ground',
    leitura:
      'The Sun speaks of clarity and energy: success, warmth, visibility, and the strength of someone with the day on their side. It is the card of what shows up whole, with no shadow over it — the exact opposite of what The Clouds describe.',
    convite:
      'Name the one thing in your life that is clear today, and make it the resting point for the rest of the day.',
  },

  'lenormand-32': {
    nome: 'The Moon',
    escena: 'the moon alone in the sky, changing shape without changing size',
    leitura:
      'The Moon speaks of emotion and imagination: the dream, the night, recognition, and the cycle that remakes itself without hurrying. It is the card of what we feel about a thing, which is not always the size of the thing.',
    convite:
      'Separate the fact from the feeling about the fact today — two lines, one for each, and read both out loud.',
  },

  'lenormand-33': {
    nome: 'The Key',
    escena: 'the key by itself, with no lock beside it',
    leitura:
      'The Key speaks of opening: a solution, access, release, and the certainty that a door exists for that subject. In the tradition it is one of the firmest cards in the deck — it confirms whatever sits beside it instead of doubting it.',
    convite:
      'List the doors you already know how to open on your own, and use one of them today, even if it is not the main one.',
  },

  'lenormand-34': {
    nome: 'The Fish',
    escena: 'the fish in a shoal, always moving in the same water',
    leitura:
      'The Fish speak of flow: money, resources, abundance, and everything that circulates instead of sitting still. It is also the card of depth — what runs below the surface and holds up what is seen above it.',
    convite:
      'Look at one concrete number in your life today — a bill, an expense, a balance — and settle the smallest thing that number asks of you.',
  },

  'lenormand-35': {
    nome: 'The Anchor',
    escena: 'the anchor on the seabed, holding a boat you cannot see',
    leitura:
      'The Anchor speaks of permanence: steadiness, harbour, constant work, and what stays in place when the water moves. It is the card of stability — and of stubbornness too, because the same anchor that holds is the one that keeps you from sailing.',
    convite:
      'Work out what is holding you today and write whether it is root or weight, one word for each.',
  },

  'lenormand-36': {
    nome: 'The Cross',
    escena: 'the cross planted in the ground, marking the place of a weight',
    leitura:
      'The Cross is the heaviest card in the deck: burden, trial, and what is carried out of duty, out of belief, or out of family history. It announces no punishment — it names the weight already there and asks whose it is.',
    convite:
      'Write down a weight you carry and, beside it, the name of whoever put it there; if the name is yours, that is already a start.',
  },
};

/* ===========================================================================
   THE SUIT IS NOT TRANSLATED, AND THAT IS NOT AN OVERSIGHT
   ===========================================================================
   `naipe` (Copas / Ouros / Paus / Espadas) is the French playing card embedded
   in the Lenormand card, and the Portuguese header explains what it is for:
   enabling the tradition's combined reading. Today NO screen draws it —
   neither of the two screens that read the deck (LeituraDeEntradaScreen,
   ReouvirTresCartasScreen) shows it, and the doctrine gate does not scan it.

   Translating it here would mean writing text nobody reads, and creating a
   second list of suits that can drift out of sync with the first. When a screen
   does draw it, it gets translated there — Hearts / Diamonds / Clubs / Spades —
   and this comment goes away.
   =========================================================================== */

export default LENORMAND_EN;
