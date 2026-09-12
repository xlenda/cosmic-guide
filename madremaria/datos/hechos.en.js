// datos/hechos.en.js
// INGLES dos 22 fatos historicos. Vizinho de datos/hechos.js e irmao de
// datos/hechos.es.js.
//
// ===========================================================================
// A TRADUCAO AQUI E A QUE CORRE MAIS RISCO, E NAO POR IDIOMA
// ===========================================================================
// O original substitui o "EITA! 92% dos usuarios" do concorrente por um FATO
// HISTORICO VERIFICAVEL, e o contador anima ate um ANO REAL. Em ingles o texto
// fica NO IDIOMA DAS FONTES — Waite, Golden Dawn, Crowley, Moakley, Kaplan,
// Dummett escreveram em ingles. Isso e uma vantagem e uma armadilha:
//   VANTAGEM: as citacoes de Waite deixam de ser corpo estranho na frase.
//   ARMADILHA: o leitor ingles pode conferir a fonte no original com dois
//   cliques. Uma parafrase folgada que passa despercebida em PT/ES e pega aqui.
// Por isso nada foi acrescentado, nada foi tirado, nenhuma afirmacao ficou mais
// forte do que a do PT. Onde o PT declara interpretacao, o ingles declara
// tambem: "the deck never said that", "influential, not consensual".
//
// ===========================================================================
// O QUE NAO SE TRADUZ
// ===========================================================================
//  · `fuente` NAO entra neste arquivo (e o recibo) e `anios` tambem nao (e
//    numero, e a invariante testada diz que ele aparece textualmente dentro da
//    `fuente`).
//  · As CITACOES de Waite estao em ingles nos tres idiomas. Aqui elas ficam
//    como estao e PERDEM a glosa entre travessoes que PT e ES precisam ter:
//    "— onde quer que ela deva ser posta, o Zero e uma carta sem numero" existe
//    em portugues porque o leitor nao le ingles. Repetir a glosa em ingles
//    seria dizer a mesma frase duas vezes na mesma linha.
//  · Titulos de obra e nomes de pessoa nao mudam: A. E. Waite, The Pictorial
//    Key to the Tarot, Cipher Manuscripts, Book T, Éliphas Lévi, Dogme et
//    Rituel de la Haute Magie, Jean-Baptiste Alliette, Etteilla, Grand
//    Etteilla, A Wicked Pack of Cards, Aleister Crowley, The Book of Thoth,
//    Liber AL vel Legis, Gertrude Moakley, Israel Regardie, Sefer Yetzirah,
//    Minchiate, Nicolas Conver, Paul Marteau, Grimaud, Pamela Colman Smith,
//    Bonifacio Bembo, Stuart R. Kaplan, Michael Dummett, Comte de Mellet, Eden
//    Gray, Rachel Pollack, Mary K. Greer. Nem os titulos impressos nas cartas:
//    LE MAT, LE PAPE, LA PAPESSE, LA MAISON DIEU, PCS.
//
// ===========================================================================
// DOIS PONTOS ONDE O INGLES MUDA A FRASE, e de proposito
// ===========================================================================
//  · major-11: o exemplo textual de Waite e "will there be a lawsuit?" — e a
//    frase DELE, em ingles. O PT traduz ("havera processo?"); aqui ela volta ao
//    original, e e por isso que o titular diz "lawsuit" e nao "process".
//  · major-16: LA MAISON DIEU e "the house of God". "A Torre" / "La Torre" e o
//    nome do baralho de 1909, que em ingles e simplesmente The Tower — o
//    contraste da frase continua de pe porque o que muda e o TITULO IMPRESSO,
//    nao a traducao dele.
//
// Ortografia: ingles britanico, o mesmo de textos.en.js — e tambem o do
// baralho, que foi impresso em Londres.
//
// FORMA: dicionario plano, 'hecho.<id>.titular' e 'hecho.<id>.cuerpo', com o
// MESMO id do original. Id nao se traduz.
// ===========================================================================

export const EN = {
  // --- BLOCK A · verified by test in Cosmic Guide --------------------------
  'hecho.major-00.titular':
    'The card carries a 0, and the deck’s own author wrote that it has no number.',
  'hecho.major-00.cuerpo':
    'You look at The Fool and see a zero printed on top. In the book that accompanies the deck, A. E. Waite writes: "Wherever it ought to be put, the Zero is an unnumbered card" — and in his own list of meanings The Fool comes after 20, not before 1. '
    + 'In the Tarot de Marseille the card is called LE MAT and carries no number at all; the "0 at the start" is a Golden Dawn convention, from the end of the nineteenth century.',

  'hecho.major-08.titular': 'This card used to be the 11. It changed number for an astrological reason.',
  'hecho.major-08.cuerpo':
    'In earlier decks Justice is the 8 and Strength is the 11. The swap you see here was already in the Golden Dawn Cipher Manuscripts before the 1909 deck existed: Waite followed the order of the order he was formed in, he did not invent it. '
    + 'The reason is a table and it is simple: with Leo on the 8 and Libra on the 11, the twelve signs fall in zodiacal sequence.',

  'hecho.major-10.titular': 'Reversed, this card gets BETTER in the original text.',
  'hecho.major-10.cuerpo':
    'The rule that circulates says a reversed card is the same thing, only jammed. In Waite’s text it is not like that: the Wheel of Fortune reversed is "Increase, abundance, superfluity". '
    + 'Systematic reversals, card by card, were instituted by Etteilla in the eighteenth century; the "reversed means blocked" key only arrived in the twentieth, with Eden Gray, Rachel Pollack and Mary K. Greer.',

  'hecho.major-11.titular': 'Waite picked one single card as his example, and the example was a lawsuit.',
  'hecho.major-11.cuerpo':
    'Justice was the 8 until the Golden Dawn swapped its number with Strength’s, and that change was already in the Cipher Manuscripts, before the deck. '
    + 'It is also the only card Waite names when explaining how to choose the significator when the question is about a matter and not about a person: his own worked example is "will there be a lawsuit?", and the card he has you put on the table is trump XI. '
    + 'The detail sits in his description of the Celtic Cross, which he himself titles "an ancient Celtic method" without offering a single piece of evidence that it is Celtic or ancient.',

  'hecho.major-13.titular': 'The gentleness with which this card is read today belongs to the twentieth century.',
  'hecho.major-13.cuerpo':
    'When Death comes up, someone at the table says "it is not literal death, it is transformation". That second sentence is a reading choice from the last century — a legitimate one, and it is what holds up today’s reading — but it is not what is written in 1911: Waite’s entry opens with "End, mortality, destruction, corruption". '
    + 'Saying "the tradition always read this card as transformation" credits Waite with a gentleness that belonged to the century after him, not to him.',

  'hecho.major-17.titular': 'In 1911 this was a card about theft.',
  'hecho.major-17.cuerpo':
    'You drew The Star and read hope. The book Waite wrote to accompany the deck opens that entry from the other side: "Loss, theft, privation, abandonment". '
    + 'Hope shows up afterwards, introduced as "another reading says". The priority between the two flipped over the twentieth century, and today’s reading follows Pamela Colman Smith’s image, not Waite’s word list.',

  // --- BLOCK B · written here, over the research documents in the repo -----
  'hecho.major-01.titular': 'This card was the first letter of the Hebrew alphabet for 34 years.',
  'hecho.major-01.cuerpo':
    'Éliphas Lévi starts the count at The Magician and gives him Aleph, the first letter, leaving The Fool unnumbered between Judgement and The World. '
    + 'In 1888 the Golden Dawn pulls The Fool to the front, gives him Aleph, and The Magician gets Beth — with that, every letter shifts one place. '
    + 'The two tables circulate today as if they were one, and they are incompatible: anyone who says "the correspondence" is picking a side without saying so.',

  'hecho.major-02.titular': 'The Moon on this card was chosen by a card reader who signed his surname backwards.',
  'hecho.major-02.cuerpo':
    'Jean-Baptiste Alliette reversed his own surname and became Etteilla; in 1789 he published the Grand Etteilla, the first deck drawn on purpose for reading. '
    + 'He is the one who fixed High Priestess = Moon and Empress = Venus, and the Golden Dawn kept those two when it built its own table a century later, discarding the rest of his system as incompatible. '
    + 'The attribution does not come from Egypt or from Jerusalem: it comes from an eighteenth-century Parisian professional who charged by the reading.',

  'hecho.major-03.titular': 'In the original list, this card reads better reversed than upright.',
  'hecho.major-03.cuerpo':
    'The Empress upright, in Waite’s list, includes "difficulty, doubt, ignorance". The Empress reversed is "Light, truth, the unravelling of involved matters, public rejoicings". '
    + 'So in 1911 the reversed card was not the jammed version of anything, and the modern "reversed = blocked energy" key belongs to the twentieth century, with authors whose names are known: Eden Gray, Rachel Pollack, Mary K. Greer.',

  'hecho.major-04.titular': 'One single line from a 1904 book changed this card’s letter.',
  'hecho.major-04.cuerpo':
    'Aleister Crowley read in Liber AL vel Legis I:57 the sentence "Tzaddi is not the Star" and concluded that two trumps had swapped letters. '
    + 'In The Book of Thoth, of 1944, The Emperor becomes Tzaddi and The Star becomes Heh; the signs do not move — Aries stays on the Emperor and Aquarius on the Star — what moves are the letters and, with them, the paths. '
    + 'Anyone reading with Crowley’s deck inherits that change; anyone reading with the 1909 one does not. They are two systems, not one.',

  'hecho.major-07.titular': 'There is a thesis that this chariot is, literally, a parade float.',
  'hecho.major-07.cuerpo':
    'Gertrude Moakley proposed in 1966 that the 22 trumps are the visual programme of the Italian triumphal parades and of Petrarch’s Triumphi: allegorical floats crossing the city in festival, each one defeating the one before it. '
    + 'The word trionfo, where "trump" comes from, named the parade before it named the game. '
    + 'Mind the grade: historians relate the card to those parades and the thesis is influential, but it is not consensus — the deck never said that, and no fifteenth-century document confirms it.',

  'hecho.major-09.titular': 'In the 1911 list, the first word on this card is "treason".',
  'hecho.major-09.cuerpo':
    'The upright meaning of The Hermit in Waite’s book includes "treason, dissimulation, roguery, corruption". '
    + 'Today’s reading — the withdrawal, the lamp lighting your own path — follows Pamela Colman Smith’s image and not that list. '
    + 'The two halves of the deck do not tell the same story: the word lists descend from French cartomancy, and the images carry Golden Dawn symbolism.',

  'hecho.major-12.titular': 'Only three cards in the deck carry a "mother" letter. This is one of them.',
  'hecho.major-12.cuerpo':
    'The Sefer Yetzirah, a text from the first millennium, divides the Hebrew alphabet into 3 mothers, 7 doubles and 12 simples. When the Golden Dawn fitted the trumps into that grid, the three mothers landed on The Fool (Aleph, air), The Hanged Man (Mem, water) and Judgement (Shin, fire); Israel Regardie published that material from 1937 onwards, and only then could it be read outside the order. '
    + 'Many tables in circulation today get that column wrong: if one calls Beth, Gimel or Daleth a "mother", it is corrupted.',

  'hecho.major-14.titular': 'Of the four cardinal virtues, one is missing from this deck.',
  'hecho.major-14.cuerpo':
    'Temperance, Strength and Justice are among the trumps; Prudence is not. She is there in the sixteenth-century Florentine Minchiate, a 97-card tarot where the twelve signs and the four elements also parade past — so the absence is a maker’s decision, not a riddle. '
    + 'A detail on the same card: in Waite’s list, Temperance reversed is "things connected with churches, religions, sects, the priesthood".',

  'hecho.major-20.titular': 'In the French system, The Fool sits exactly between this card and The World.',
  'hecho.major-20.cuerpo':
    'Éliphas Lévi ordered the trumps with The Magician at the front and left The Fool unnumbered, tucked between Judgement (XX) and The World (XXI). With that arrangement Judgement gets the letter Resh; in the Golden Dawn table, three decades later, Judgement gets Shin and The Fool goes to the front. '
    + 'There are three possible places for an unnumbered card, and history used all three: the Comte de Mellet put it at the end in 1781, Lévi in the second-to-last gap, the Golden Dawn at the front.',

  'hecho.major-21.titular': 'It is the only trump the two rival schools agree on.',
  'hecho.major-21.cuerpo':
    'Lévi’s table and the Golden Dawn’s are offset by a whole square: where one puts Aleph the other puts Beth, and so on to the end. '
    + 'The only card that gets the same letter in both is The World, which is Tav in each — the last letter, on the last card. '
    + 'The coincidence is arithmetic and not mystical: it is what is left over when two systems start differently and finish in the same place.',

  // --- BLOCK C · a documented general fact, for want of a card-specific one -
  'hecho.major-05.titular': 'For over four centuries this card was called, plainly, "The Pope".',
  'hecho.major-05.cuerpo':
    'In the fifteenth-century Italian trumps and in the Marseille pattern the card carries LE PAPE printed on it, and its counterpart, number 2, LA PAPESSE. They are two of the "conditions of life" that parade through the series, alongside the Emperor and the Empress. '
    + 'The names Hierophant and High Priestess appear in the deck published in London in December 1909: they are a label change a little over a century old, not an ancient name.',

  'hecho.major-06.titular': 'The scene you know is barely a century old. The one before it was something else.',
  'hecho.major-06.cuerpo':
    'In the Marseille pattern the card shows a young man between two figures, with an archer aiming from above: a scene of choosing, not of a couple. '
    + 'The version that became standard — two naked figures, an angel, two trees — is the one Pamela Colman Smith drew for the 1909 deck, and it became standard because that deck became standard. '
    + 'Historians relate the older scene to the motif of the moral crossroads; the deck never said that, and that part is interpretation.',

  'hecho.major-15.titular': 'In the oldest painted tarot that survived, this card is missing.',
  'hecho.major-15.cuerpo':
    'The Visconti-Sforza decks, hand-painted with gold leaf in Milan around 1441–1451, are the oldest tarots that reached us — and they reached us incomplete: the set now split between the Morgan Library and the Accademia Carrara is missing precisely The Devil and The Tower. '
    + 'The catalogues do not settle whether they were lost or never painted at all. Any claim about "the original fifteenth-century Devil" is made about a card nobody has in front of their eyes.',

  'hecho.major-16.titular': 'In the Marseille deck this card is called "the house of God".',
  'hecho.major-16.cuerpo':
    'The tarot of Nicolas Conver, printed in Marseille in 1760, titles the card LA MAISON DIEU: the house of God, not a tower. The name The Tower is the 1909 London deck’s. '
    + 'And the whole pattern came to be called "Marseille" long after it existed: the one who popularised it was Paul Marteau with the Grimaud factory, in 1930, fixing the colours and the drawing from the Conver.',

  'hecho.major-18.titular': 'The crustacean coming out of the water was already in eighteenth-century French decks.',
  'hecho.major-18.cuerpo':
    'Two towers, two animals howling and a crustacean coming out of the pool: the scene is in the Marseille pattern long before 1909, and Pamela Colman Smith kept it almost whole when she redrew the deck. '
    + 'It is one of the few cards where the visual continuity between the two decks is plain to the naked eye. What changed was not the drawing: it was the reading system hung on top of it, built between 1781 and 1911.',

  'hecho.major-19.titular': 'There is a signature hidden in all 78 cards, and it is only three letters.',
  'hecho.major-19.cuerpo':
    'In a corner of every scene sits the monogram PCS: that is Pamela Colman Smith (1878–1951), the illustrator who drew all 78 from A. E. Waite’s directions, with no sketches from him. '
    + 'Her name stayed off the deck’s title for decades, and that is why the correct thing to say is Rider-Waite-Smith, and not Rider-Waite. '
    + 'This fact is not exclusive to The Sun: it holds for all 78 cards, and it is the thing most often left out when the story of where this deck came from gets told.',
};

export default EN;
