// datos/profunda.en.js
// THE ENGLISH of the deep reading — the five blocks of variant A and the five
// of variant B.
//
// Arquivo de UM tradutor so, no mesmo molde de datos/textos.en.js: o portugues
// fica em datos/profunda.js (intocado), o espanhol em datos/profunda.es.js.
//
// ===========================================================================
// READ THIS FIRST: THE CONTRACT THIS FILE DOES **NOT** INHERIT
// ===========================================================================
// The Portuguese in datos/profunda.js carries a hard contract, written in its
// own header: `texto` is NOT a summary and NOT a paraphrase — it is the
// word-for-word TRANSCRIPT of the .m4a recorded in the cloned voice. And
// datos/profunda-tempos.json holds, sentence by sentence, the second at which
// the voice says each one, so the screen can light the sentence currently
// sounding (components/TextoNoRitmo.js).
//
// THE AUDIO IS PORTUGUESE ONLY. No English .m4a exists for these ten blocks.
// So this file does not inherit that contract, and that is a declared decision,
// not an oversight:
//
//   1. THE TRANSLATED TEXT IS A TRANSCRIPT OF NOTHING. It is a faithful
//      translation of what the Portuguese voice says. Whoever opens the app in
//      English READS English and, if they press the button, HEARS Portuguese.
//      The screen says there is audio; it never promises a language.
//
//   2. THE PER-SENTENCE HIGHLIGHT SWITCHES ITSELF OFF, by construction.
//      `trechosDe` in datos/profunda.js matches the JSON timings against the
//      sentences of the text; in English the sentences are not the same ones, so
//      the function hands back the PARAGRAPHS with `ini: null` — the degradation
//      path that file already documents ("the screen draws exactly what it drew
//      before this feature, nothing lights up, and nothing breaks"). Do NOT try
//      to align Portuguese timings to English sentences: it would light the
//      wrong sentence, which is worse than lighting none.
//
//   3. WHEN THE AUDIO IS RECORDED IN ENGLISH, this file becomes the script for
//      it — and in the SAME commit as the recording, a profunda-tempos.en.json
//      lands and `trechosDe` gains a language. Until then, what is here is
//      honest: the whole text, no highlight.
//
// ===========================================================================
// WHAT IS TRANSLATED
// ===========================================================================
//   titulo  the card's navigation label
//   texto   the body of the block, with the '\n\n' between paragraphs INTACT
//           (datos/profunda.js splits on them in paragrafosDe)
//
// NOT TRANSLATED: `id` and `audio`. They are a data address and an .m4a
// filename resolved by STATIC require by Metro — changing either one orphans
// the progress of whoever already listened and makes the listen button vanish,
// with no error at all.
//
// PARAGRAPH COUNT: the same as the Portuguese in all ten blocks. Not a whim —
// `paragrafosDe` draws one <Cuerpo> per paragraph, and the shape test in
// test/madremaria-profunda.test.js requires at least two.
//
// ===========================================================================
// HONEST ENCHANTMENT — AND THE REFUSAL, WHICH IS THE HEART OF IT
// ===========================================================================
// Block 11 (and b5) does not merely avoid the promise: it REFUSES it out loud.
// That refusal is what separates this product from everyone who promises, and in
// English it had to stay a refusal rather than become an embarrassed promise:
//
//   PT  "Eu não vou te dizer que essa pessoa vai voltar. Ninguém pode te dizer
//        isso, e quem diz está inventando."
//   EN  "I will not tell you that this person will come back. Nobody can
//        tell you that, and anyone who does is making it up."
//
// THIS IS THE MOST DANGEROUS SENTENCE IN THE ENGLISH OF THE WHOLE APP, and it
// is worth knowing why. The seven doctrine gates that predate Wave 2 bite PT/ES
// future morphology (-rá / -rão / -rán); English "will come back" has no ending
// to catch, so it walks past ALL SEVEN. Only
// test/madremaria-promessa-tres-idiomas.test.js sees it — and it sees it because
// it judges sentence by sentence and recognises an explicit REFUSAL: a negated
// verb of telling ("I will not tell you", "nobody can tell you"), never a
// bare "not". If this sentence is ever rewritten, it MUST keep the negated verb
// of telling inside the same sentence, or the gate will flag it — and the gate
// will be right to.
//
// Outside the refusal, no promise goes in: no block says the other person comes
// back, writes, or reaches out. The only commitment the text makes is the one
// the app KEEPS (handing back, on the thirteenth moon, what the reader wrote on
// the first), and it is named as "the only one I can keep".
//
// GENDER: neutral on both sides. The person on the other side is always "this
// person" — never "he" or "she". The Portuguese close says "quem sabe isso ja
// nao e a mesma pessoa" precisely so as not to fix a gender (see the 11/09 note
// in datos/profunda.js); English keeps that: "anyone who knows that is not the
// same person any more".
//
// ADDRESS: "you", plain, one person at a time. "Madre Maria" stays Madre Maria.

/* THE REFUSAL, on ONE LINE — the same reason as the Portuguese: the gate
 * recognises the refusal by the content of the SENTENCE, and breaking the line
 * inside it does not change the text, but makes the intent easier to wreck in
 * the next edit. */
const P11_REFUSAL_EN =
  'I will not tell you that this person will come back. Nobody can tell you that, and anyone who does is making it up. And I know you have heard it from someone already — from an app, from a card in a deck, from someone who charged you for it. It felt good for two days. Then there was nothing left.';

const P11_WILL_KNOW_EN =
  'What I can tell you is what I see from here: you will reach the end of these thirteen moons knowing things about yourself that you do not know today. You will know the hour when the missing hurts most. You will know how to separate what you know from what you are filling in on your own. And you will know what you accept and what you no longer accept. Anyone who knows that is not the same person any more. And what happens with your love, whether with this person or with another, is different from what happens today.';

const P11_REST_EN =
  'Now I have to tell you something that I am not going to finish here. There is a point in these three cards that I will not tell you today, and it is not unkindness: it is that it only makes sense after you answer the first question of the first moon — the one that asks you to tell what happened in your own words, without tidying the sentence up for anybody.\n\n'
  + 'Your reading from today stays in there, whole, and you can open it again whenever you want. But write your version BEFORE you reopen mine. In that order the thing shows itself. In the other order you tidy your sentence to fit what I said, and then the whole exercise is lost.\n\n'
  + 'And there is something I would rather tell you now than have you find out tomorrow. Every day there will be a gesture waiting for you in there. You will see what it is, and you will see how much time it costs. What does not open by itself is the how. The steps.\n\n'
  + 'And I am not going to pretend that is a detail, just to keep you comfortable. The how is the whole thing: it is where you do something, instead of only reading about it. It is the difference between spending one more day thinking about this person and actually moving.\n\n'
  + 'I need you to open that part by deciding. Not because it showed up on the screen, not on a day when you had nothing else to do. Deciding. Because what comes after asks that of you every day, and the first day is the one that teaches all the ones behind it.\n\n'
  + 'And I am going to tell you what waits for you on the other side of that door, because you have the right to know before you decide.\n\n'
  + 'Every day, one gesture. One only, with its time counted out. The first moons are yours alone: your own ground, your own voice, your own way of answering. Then the steps this person sees begin, one a week, in the right order.\n\n'
  + 'It starts with a kind sentence that asks for nothing. Then a thank-you with an address on it, for one specific thing. Then a question about the day, with no answer demanded. Then a good memory, shared with no hook in it. Then two minutes of listening without cutting in. And further on, once you are standing, the invitation. And the mistake owned whole, with no "but", which is the step almost nobody has the courage to climb.\n\n'
  + 'One does not open before the other. If one of them hurts, or falls into silence, we hold there, go back to your own ground for a few days, and climb again when you are steady. It is not haste. It is order.\n\n'
  + 'In thirteen moons, what this person sees is not you asking. It is you, different. And that is not explained, it is shown. You do not chase. You become impossible not to notice.\n\n'
  + 'And there is the hour. Your first moon does not begin when you decide: it begins at the next new moon, which already has its day and its hour marked in the sky — and you are seeing both of them written here on the screen, right now. If you come in before it, that new moon is yours. If you come in after, yours is the next one, and the next one is twenty-nine and a half days away. That is not a rule of mine. It is the moon, and she waits for nobody.\n\n'
  + 'Your first moon is right there. Shall we?';

/** The five blocks of variant A, by id. */
export const PROFUNDA_EN = {
  'profunda-7': {
    titulo: 'More stones than it should have had',
    texto:
      'I see a road that had more stones on it than it should have had, and even so, your determination is remarkable. Everything you have won came from your own effort. I noticed that few people held out a hand to you along that road.\n\n'
      + 'There are days when you wake up well, and days when getting up is already the whole job. Some days are lighter, others weigh more than they should. And that weight does not seem to be yours alone.\n\n'
      + 'There were important changes in your life in a recent period.\n\n'
      + 'As for love: this person you feel what you feel for did not bring you the happiness you deserved. On the contrary, they caused you pain. And even at a distance, they still take up room in your thoughts.',
  },

  'profunda-8': {
    titulo: 'The knot did not come undone in a day',
    texto:
      'Now I have to tell you something about what those three cards showed.\n\n'
      + 'The knot that appeared there was not tied in a day, and it will not come undone in a day either. It was pulled tight little by little — a conversation that never happened, an answer that came back cold, a silence that lasted longer than it should have.\n\n'
      + 'And that is why I am not going to promise you a turnaround overnight. Anyone promising you that is selling you haste, and haste in matters of love usually pulls the knot tighter.\n\n'
      + 'What I am going to offer you is something else: time. Thirteen moons, one at a time, and each one of them with a piece of work that is yours.',
  },

  'profunda-9': {
    titulo: 'Thirteen moons in a year',
    texto:
      'Have you ever noticed that the moon never repeats herself exactly? She takes twenty-nine and a half days to close a whole turn. Not twenty-eight, not a calendar month: twenty-nine and a half days, counted in the sky.\n\n'
      + 'And there are thirteen of those turns. Thirteen moons.\n\n'
      + 'That is how I laid out your road. Each moon is a different piece of work, and it begins on the night the moon is born dark and closes when she goes dark again.\n\n'
      + 'The first moon is for naming what happened, in your own words, without tidying the sentence up for anybody. The sixth is for looking at your own part, and it comes halfway along on purpose, because asked too early that question turns into blame.\n\n'
      + 'And now I am going to tell you the one thing I promise in here. What you write on the first moon stays in this phone. And on the thirteenth, when the moon closes the whole turn and arrives back at the same point in the sky, I hand it back to you in your own words, with the date of the day you wrote it, without a comma changed.\n\n'
      + 'It is not the promise you wanted to hear from me. But it is the only one I can keep — and that one I keep.',
  },

  'profunda-10': {
    titulo: 'Five minutes, every day',
    texto:
      'From now on, every day you will open this and find three things.\n\n'
      + 'The first is the sky of that day. What phase the moon is in, what day of the week it is in the old calendar — because each day has its planet, and that is older than any of us.\n\n'
      + 'The second is the work of the day. There are five gestures that turn with the sky, each with its own name and its own right hour to appear. One of them uses something that is in your kitchen right now. Another asks for nothing but you. Which one falls on which day is not mine to choose and not yours: it is the day that chooses.\n\n'
      + 'The how of each one I am not going to tell you now — and it is not a secret to keep you hooked: it is that the gesture loses its force if you know it before its hour. What I will tell you is the size: five minutes. The hour does not matter, the place does not matter. That is the price, and it is the whole price.\n\n'
      + 'But there is one condition, and that one is not up for negotiation: it is every day. One gesture prepares the next, and it is the repetition that does the work — like sleep: there is no sleeping a whole week in a single night.\n\n'
      + 'And what does this have to do with this person coming back? Everything. Chasing brings nobody back — you know that already. These gestures turn the game around: each day sets one piece of you right, until the version of you this person chose back at the beginning comes back into view. And when there is a conversation, the plan comes with it: the hour to answer, the hour for silence, what is not said. This is not hope. It is strategy, one day at a time.\n\n'
      + 'And the third is your part. A question only you answer, written in there, which never leaves this phone and which nobody else reads.',
  },

  'profunda-11': {
    titulo: 'Your first moon',
    texto: `${P11_REFUSAL_EN}\n\n${P11_WILL_KNOW_EN}\n\n${P11_REST_EN}`,
  },

  /* ===================================================================
     VARIANT B — the same essence, with its own cards' images (the
     mountain, the crossroads, the key, the anchor, the stars).
     =================================================================== */
  'profunda-b1': {
    titulo: 'A mountain in the road',
    texto:
      'I see a mountain in your road. You have tried going around it, you have tried climbing it by force, and the mountain is still there. But what catches my attention is not the mountain. It is that you never stopped walking. Everything you have won came from your own steps. There were plenty of people nearby. Helping, almost nobody.\n\n'
      + 'There are days when the climb is light. And there are days when the mountain starts at the edge of the bed. You know that weight. And that weight is not yours alone: there are stones in there that somebody else left, and you carry them as if they were your own.\n\n'
      + 'There was a big change in your life in a recent time, and you are still putting things in place in the new one.\n\n'
      + 'And as for love: this person you feel what you feel for did not bring you the peace you deserved. They brought more weight than embrace. And even far away, that person still lives in your thoughts. That is the mountain that showed up here.',
  },

  'profunda-b2': {
    titulo: 'It is not crossed in a day',
    texto:
      'That mountain did not appear in a day, and it is not crossed in a day either. It went up stone by stone: one letting-it-go on top of another, a hurt you swallowed so as not to fight, a day when you pretended everything was fine.\n\n'
      + 'That is why I am not going to promise you a turnaround overnight. Anyone promising you a shortcut up that mountain is pushing haste at you. And haste, in matters of love, usually puts another stone on top.\n\n'
      + 'The second card is the one that interests me. The Crossroads. A fork: two roads, and neither with a sign. You have been at that junction for a while now, looking both ways, waiting for a sign. Choosing without a guarantee is uncomfortable, I know. But staying at the junction is a choice too. And that one you already know.\n\n'
      + 'What I am going to offer you is something else: time. Thirteen moons, one at a time, divided into thirteen stretches. And each stretch with a step of yours.',
  },

  'profunda-b3': {
    titulo: 'Thirteen moons and a key',
    texto:
      'The moon is in no hurry and never miscounts. She takes twenty-nine and a half days to be born dark, fill, and go dark again. And there are thirteen of those. Thirteen moons.\n\n'
      + 'It was by them that I divided your mountain into thirteen stretches. The first moon is for naming what happened, in your own words, without tidying the sentence up for anybody. The sixth is for looking at your own part, and it comes in the middle on purpose, because too early it turns into blame.\n\n'
      + 'And here the third card comes in, the Key. A key does not bring a mountain down. What the key says is that a door exists in this matter. Over the top is not possible. The way through is from the inside, one moon at a time.\n\n'
      + 'Now the one thing I promise you. What you write on the first moon stays in here. On the thirteenth, when the moon arrives back at the point she left, I hand that line back to you in your own words. With the date of the day. Without a comma out of place.\n\n'
      + 'It is not the promise you wanted to hear. But it is the only one I can keep. And that one I keep.',
  },

  'profunda-b4': {
    titulo: 'Five minutes, one anchor',
    texto:
      'Every day you open this and find three things.\n\n'
      + 'The first is the sky of that day: the phase of the moon.\n\n'
      + 'The second is the gesture of the day. There are five gestures that turn with the sky, each with its own name and its own right day to appear. One of them fits in your hand. Another you do without moving from where you are. The how stays in there. What I will tell you is the size: five minutes.\n\n'
      + 'But there is one condition, and that one is not up for negotiation: it is every day. It is the card you scratched last, the Anchor. An anchor does not hold because it is big. It holds because it is there when the water moves. Those five minutes are your anchor, the piece of the day that does not rock.\n\n'
      + 'And what does this have to do with that person? Everything, because the only part of this story that depends on you is your own. Each day sets one piece of you right. And when there is a conversation, the plan comes with it: the hour to answer, the hour for silence. This is not hope. It is ground, one day at a time.\n\n'
      + 'The third is your part: a question only you answer. And tomorrow, the first thing you see is the line you wrote today. That is the thread.',
  },

  'profunda-b5': {
    titulo: 'That star is yours',
    texto:
      'I will not tell you that this person will cross that mountain in your direction. Nobody can tell you that. Anyone who does is making it up. You have heard it before: from an app, from a card, from someone who charged you for it. It felt good for two days. Then there was nothing left.\n\n'
      + 'The Star does not take anyone off the mountain. It only shows the direction. Direction is found by looking up. That star is yours. If you make it to the thirteenth, you will know things about yourself that you do not know today. Anyone who knows that is no longer the person who started the climb.\n\n'
      + 'There is a point in these cards that I will only tell you after you answer the first question of the first moon. Today’s reading stays in there. Write your version before you reopen mine.\n\n'
      + 'And there is something I would rather say now. The gesture of the day will be in there waiting for you: you see what it is, how much time it costs. What does not open by itself is the how. That door, the one the key is for, I need you to open by deciding.\n\n'
      + 'And I am going to tell you what waits for you on the other side of that door, because you have the right to know before you decide.\n\n'
      + 'Every day, one step up the mountain. One only, with its time counted out. The first moons climb your own side: your own ground, your own voice, your own way of answering. Then the key starts opening the other part, the steps this person sees, one a week, in the right order.\n\n'
      + 'It starts with a kind sentence that asks for nothing. Then a thank-you with an address on it, for one specific thing. Then a question about the day, with no answer demanded. Then a good memory, shared with no hook in it. Then two minutes of listening without cutting in. And further on, once your footing is firm, the invitation. And the mistake owned whole, with no "but", which is the step almost nobody has the courage to climb.\n\n'
      + 'One step does not open before the other. If one of them hurts, or falls into silence, we set the anchor there, go down to your own ground for a few days, and climb again when your footing is sure. It is not haste. It is the order of the climb.\n\n'
      + 'In thirteen moons, what this person sees is not you asking. It is you, different. And that is not explained, it is shown. You do not chase. You become impossible not to notice.\n\n'
      + 'And there is the hour. Your first moon does not begin when you decide: it begins at the next new moon, with its day and its hour marked in the sky, written here on the screen, right now. The moon waits for nobody.\n\n'
      + 'Your first moon is right there. Shall we?',
  },
};

export default PROFUNDA_EN;
