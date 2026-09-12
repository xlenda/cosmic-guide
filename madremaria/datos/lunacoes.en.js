// datos/lunacoes.en.js
// INGLES dos treze temas do arco. Vizinho de datos/lunacoes.js e irmao de
// datos/lunacoes.es.js — um arquivo por idioma, mesma forma que a Onda 1 fixou
// em datos/textos.en.js.
//
// ===========================================================================
// DE ONDE VEIO ESTE INGLES
// ===========================================================================
// `nome`, `pergunta` e `abertura` das treze lunacoes JA existiam em
// datos/textos.en.js (chaves 'ano.lunacao.N.titulo', '.pergunta', '.abertura',
// linhas 413-451) e foram copiados VERBATIM de la: duas redacoes do mesmo texto
// em dois arquivos e um defeito que a usuaria ve quando o tema abre na Lua Nova
// e repete no card do ano. Os 37 restantes (`fecho`, `foco`, os cinco blocos do
// ARCO e a nota do CICLO) foram escritos aqui.
//
// ===========================================================================
// O QUE ESTE IDIOMA PERDE SE NAO TOMAR CUIDADO
// ===========================================================================
// O ingles e o idioma que passava por TODOS os sete portoes antigos de doutrina
// (ver test/madremaria-promessa-tres-idiomas.test.js): "will come back" nao tem
// terminacao de futuro para a morfologia PT/ES morder. Entao aqui a regra vale
// em dobro:
//  · A outra pessoa NUNCA e sujeito de verbo. Nenhum "they will", nenhum
//    "he'll", nenhum "coming back".
//  · Nenhum texto promete, cobra ou conclui. "Not this month" e resposta
//    legitima em todo tema.
//  · Lunacao 6: SIMETRIA em cada frase — neither the whole story, nor nothing.
//  · Lunacao 10: "in whoever it is" em CADA campo, nao so no titulo.
//  · Lunacao 13 diz "is closing", nunca "has closed": na abertura do tema 13 so
//    DOZE lunacoes se fecharam.
//  · "Madre Maria" e nome proprio — nao traduz, e nao aparece aqui.
//  · Os numeros (354 / 384 / 365 / ~11 days) NAO mudam.
//
// Ortografia: ingles britanico, o mesmo que a Onda 1 usou em textos.en.js
// ("summarises", "neighbour"). Nao misturar com americano no mesmo app.
//
// FORMA: dicionario plano, chaves IDENTICAS as de lunacoes.es.js e as do PT.
// NAO se traduz: `numero`, `bloco`, `id`, `lunacoes`, os numeros de CICLO.
// ===========================================================================

export const EN = {
  /* --- THE ARC: the five groupings --------------------------------------- */
  'arco.chao.nome': 'The ground',
  'arco.chao.porque':
    'The terrain: what happened, what the day is like now, and what was already yours before. Everything named here stays true in both possible endings.',
  'arco.laco.nome': 'The tie',
  'arco.laco.porque':
    'The daily cost: the urge with a time of day, the rumination, and the size of your part. It is the block that most needs a counterweight, and the counterweight comes from the block before it.',
  'arco.alargamento.nome': 'The widening',
  'arco.alargamento.porque':
    'The exact middle of the arc, where the focus leaves the bond: who else exists, what went unsaid, and what you want without naming anyone.',
  'arco.capacidade.nome': 'The capacity',
  'arco.capacidade.porque':
    'Trust as a general capacity, and the line drawn in both directions. These are the two most slippery lunations of the year: both invite "get ready for the conversation", and both refuse.',
  'arco.fechamento.nome': 'The closing',
  'arco.fechamento.porque':
    'Archive and handing back. Keeping the archive (12) apart from the closing (13) stops the last month from doing both at once and turning into a verdict.',

  /* --- 1 · NAMING --------------------------------------------------------
   * nome/pergunta/abertura: VERBATIM from textos.en.js (ano.lunacao.1.*). */
  'lunacao.1.nome': 'Naming what happened',
  'lunacao.1.pergunta':
    'What happened, said in your own words and without tidying the sentence?',
  'lunacao.1.abertura':
    "This lunation starts at the beginning: what happened, written by you, however it comes out. It doesn't have to look good or make sense to anyone else — it stays on this device.",
  /* PT: "ele volta para você exatamente como está" — the subject is WHAT SHE
   * WROTE, not the other person. In English "it comes back to you" reads
   * ambiguous on screen and matches the doctrine gate's 'outcome declared'
   * formula (measured: the gate flagged this line). Fixed by naming the
   * subject — the text, explicitly, in place of the implied pronoun. */
  'lunacao.1.fecho':
    'What you wrote in this lunation was kept, with the date. When the moon closes the turn, the app hands that text back to you exactly as it is.',
  'lunacao.1.foco':
    'The day plan opens room to write, and the question pulls towards the record, never towards interpretation. The app summarises nothing and comments on nothing.',

  /* --- 2 · THE ROUTINE --------------------------------------------------- */
  'lunacao.2.nome': 'The routine left over',
  'lunacao.2.pergunta':
    'What is a day of yours like now, from waking up to turning off the light?',
  'lunacao.2.abertura':
    'After naming what happened, one thing is left over, twenty-four hours long: Tuesday. This lunation looks at the shape of your day, not at the story.',
  'lunacao.2.fecho':
    'The day has a shape, and it has been described in your own words. What you do with that shape is still your choice.',
  'lunacao.2.foco':
    'The gestures of the day stay anchored to a concrete hour and place — the coffee, the commute, bedtime. It is the only ground where a small gesture fits.',

  /* --- 3 · WHAT WAS ALREADY MINE ---------------------------------------- */
  'lunacao.3.nome': 'What was already mine',
  'lunacao.3.pergunta': 'What was yours before that bond and is still yours?',
  'lunacao.3.abertura':
    'This lunation asks for concrete things and not concepts: the coffee, the route, the song, the friendship. The material comes from the month that passed, already written down here.',
  'lunacao.3.fecho':
    'Whatever went on this list stays yours either way. The list is kept, and it is the list the app draws a gesture from when a day turns hard.',
  'lunacao.3.foco':
    'The gesture of the day now comes out of the list you wrote, instead of arriving ready-made from the app.',

  /* --- 4 · THE URGE HAS AN HOUR ----------------------------------------- */
  'lunacao.4.nome': 'The urge has an hour',
  'lunacao.4.pergunta': 'At what hour does the urge to say something press on you?',
  'lunacao.4.abertura':
    "The urge to say something usually has a time of day, and each person has their own. This lunation doesn't ask you to hold back: it asks you to notice which one is yours.",
  'lunacao.4.fecho':
    'The urge has an hour, and that hour is written down now. What you do with it is still your choice.',
  'lunacao.4.foco':
    'The day gains a field with a time on it: the whole sentence fits there, the way it arrived and with the hour it arrived at.',

  /* --- 5 · I KNOW OR I ASSUME ------------------------------------------- */
  'lunacao.5.nome': 'I know or I assume',
  'lunacao.5.pergunta':
    'Where does what you know end and what you rebuild in your head begin?',
  'lunacao.5.abertura':
    "No card reads that person, and this device doesn't either. What can be done is separating what you know from what you've been assuming.",
  'lunacao.5.fecho':
    'What is known and what is assumed were written down, side by side and with the date. Nothing here says which of the two is bigger.',
  'lunacao.5.foco':
    'The question of the day now asks for two columns: this I know, this I assume.',

  /* --- 6 · THE SIZE OF MY PART -----------------------------------------
   * SYMMETRY in every sentence: neither the whole story, nor nothing. */
  'lunacao.6.nome': 'The size of my part',
  'lunacao.6.pergunta':
    'What was your part, said without inflating it and without shrinking it?',
  'lunacao.6.abertura':
    "Your part isn't the whole story, and it isn't nothing either. This lunation asks for its size, with both halves on the same screen.",
  'lunacao.6.fecho':
    'Neither the whole story nor nothing: what was written down was the size. It is kept, and it is yours to revise whenever you want.',
  'lunacao.6.foco':
    'Every screen of this lunation carries both halves together — what was yours and what was not. No field accepts only one of them.',

  /* --- 7 · THE OTHER THREADS ------------------------------------------- */
  'lunacao.7.nome': 'The other threads',
  'lunacao.7.pergunta':
    'Who else is in your life, and how long has it been since you looked at that?',
  'lunacao.7.abertura':
    "This whole lunation isn't about that person: it's an inventory of what already exists. Your sister, the colleague, the neighbour, the group that's been still since March.",
  'lunacao.7.fecho':
    'The list is the size it is and it does not need to grow. It is kept, with the date.',
  'lunacao.7.foco':
    'The gesture of the day may involve someone from the list you wrote — and never that person.',

  /* --- 8 · THE ANGER NOT SPOKEN ---------------------------------------
   * "Not being angry this month is a legitimate answer" has to survive. */
  'lunacao.8.nome': 'The anger not spoken',
  'lunacao.8.pergunta': 'What went unsaid on the side of the anger?',
  'lunacao.8.abertura':
    'This lunation opens a place for what went unsaid on the side of the anger. Not being angry this month is a legitimate answer, and the day goes on the same.',
  'lunacao.8.fecho':
    'What you wrote here did not leave this device and it will not. It was written down, and writing is not the same thing as resolving.',
  'lunacao.8.foco':
    'The writing of the day is closed: nothing in this lunation has a send, share or copy button.',

  /* --- 9 · WHAT I WANT ------------------------------------------------- */
  'lunacao.9.nome': 'What I want',
  'lunacao.9.pergunta': 'What do you want, said without naming anyone?',
  'lunacao.9.abertura':
    "This lunation has one rule only: write what you want without naming anyone. The app doesn't know what you ought to want, and it doesn't vote.",
  'lunacao.9.fecho':
    'What was written stays readable either way, because it does not depend on anyone to be read. It is kept, with the date.',
  'lunacao.9.foco':
    'The question of the day is always worded without naming anyone else, and the ask is that the answer be worded that way too.',

  /* --- 10 · TRUSTING AGAIN --------------------------------------------
   * "in whoever it is" in EVERY field, not only in the title. */
  'lunacao.10.nome': 'Trusting again',
  'lunacao.10.pergunta':
    'What would you need in order to trust again — in whoever it is?',
  'lunacao.10.abertura':
    'The wording of this lunation is "in whoever it is", and it holds every day from here to the next new moon. Trust here is a general capacity, not preparation for one specific conversation.',
  'lunacao.10.fecho':
    'The list of conditions is yours and it was written down. It holds for any bond, and it has no deadline.',
  'lunacao.10.foco':
    'Every gesture of the day can be finished today and on your own. None of them is a rehearsal for a conversation, and the wording "in whoever it is" appears on every screen.',

  /* --- 11 · WHAT GETS SAID -------------------------------------------- */
  'lunacao.11.nome': 'What gets said',
  'lunacao.11.pergunta': 'What would you say, and what stays only yours?',
  'lunacao.11.abertura':
    "This lunation works both sides of the line: what gets said and what stays only yours. The letter you don't send counts just the same.",
  'lunacao.11.fecho':
    'It was written on both sides, and none of it left the device. This is the last lunation of new material: the two that follow work with what you have already written.',
  'lunacao.11.foco':
    'The screen of the day has two fields side by side — what would come out of your mouth and what stays put. Neither of them has a send button.',

  /* --- 12 · THE YEAR FROM INSIDE ------------------------------------- */
  'lunacao.12.nome': 'The year from inside',
  'lunacao.12.pergunta': 'What did this year keep of you, in your own handwriting?',
  'lunacao.12.abertura':
    'This lunation is archive. The app opens what you wrote, lunation by lunation, with the dates, and summarises nothing.',
  'lunacao.12.fecho':
    'What you read, you wrote, with the date beside it. Here the app is an index, not an interpreter.',
  'lunacao.12.foco':
    'The day plan swaps the new question for rereading an old entry, in the order of the lunations. No entry arrives with a comment on it.',

  /* --- 13 · THE SAME MOON ------------------------------------------
   * "is closing", never "has closed". The numbers 354 / 384 / 365 stand. */
  'lunacao.13.nome': 'The same moon',
  'lunacao.13.pergunta':
    'The moon is closing a turn. Which question do you want to open in the next one?',
  'lunacao.13.abertura':
    "This is the thirteenth lunation, and it's the one that closes the turn. Twelve lunations add up to 354 days, thirteen to 384, and the civil year has 365: the moon and the calendar don't close together, and never did.",
  'lunacao.13.fecho':
    'The line from the first lunation is here, with the date, exactly as you left it. The question for the next turn is yours to write.',
  'lunacao.13.foco':
    'The day hands back, word for word, the first entry of lunation 1, with the date, and asks for a question — never for a conclusion.',

  /* --- The CYCLE: measurement, not doctrine ------------------------ */
  'ciclo.nota':
    'The synodic month varies; none of these numbers becomes a fixed calendar. The roughly 11-day gap between twelve lunations and the civil year is why the theme is counted by measured lunation and never by date.',
};

export default EN;
