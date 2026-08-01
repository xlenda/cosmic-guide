// lib/traducoes/tarotHistoria.en.js
// THE ENGLISH PACK for the real history of tarot. Same SHAPE as
// lib/traducoes/tarotHistoria.pt.js: same keys, same fields, same function
// signatures. The engine lives in lib/tarotHistoria.js.
//
// THE RULES, IDENTICAL TO THE PT PACK:
// 1. HOOK FIRST, SOURCE AFTER. Every `texto` opens in real life and closes on
//    the receipt. The first 70 characters carry no four-digit year. The test
//    fails the build.
// 2. NO CLAIM ABOUT THE BODY, no promise, no verdict on the person who
//    believes the myth, no invented social proof, no defensive notice.
// 3. TAKING A MYTH APART IS NOT MOCKING ANYONE. Inventing antiquity is a trait
//    of the tradition, not its corruption — and whoever repeated the Egypt
//    story heard it from someone they loved. The Roma are named by their name.
// 4. WAITE IS QUOTED IN ENGLISH, identical across the three packs. Here that
//    means the quotation and the surrounding prose are in the same language —
//    the quote is still verbatim and still marked as a quote.
// 5. THE TITLE OF A WORK IS NEVER TRANSLATED. Le Monde primitif stays
//    Le Monde primitif. Author and dating go through lib/traducoes/datacao.js.

const TELA = {
  titulo: 'The real history of this deck',
  subtitulo: 'From an Italian court game to the deck sitting in your album',
  ctaLinhaDoTempo: 'See the timeline',
  rotuloRecibo: 'Receipt',
  rotuloFases: 'How to read this timeline',
  rotuloNaoSeSustenta: 'What gets repeated, and what the source shows',
  rotuloOQueSeDiz: 'What people say',
  rotuloOQueAFonteMostra: 'What the source shows',
  rotuloParalelo: 'And there is one thing nobody tells you',
  rotuloFontes: 'Where to check it',
  rotuloNoAlbum: 'This shows up in your album',
  // Added when the feature moved INSIDE the Album of 78: the screen writes
  // nothing of its own, so everything it needs to say is born here, with exact
  // key parity against .pt and .es. The two number labels below serve the
  // DISTANCE, which is what this feature is about — the number is computed by
  // the engine, the label comes from here.
  abrir: 'Tap to open',
  fechar: 'Tap to close',
  fecharLinhaDoTempo: 'Close the timeline',
  rotuloSeculosDeImagem: 'centuries of imagery',
  rotuloAnosDeLeitura: 'years of card reading',
  rotuloEstaSecao: 'The history of this section',
  rotuloEstaCarta: 'The history of this card',
  seloHistoria: 'This card carries a history note',
  compartilhar: 'Share',
  copiado: 'Copied. Paste it wherever you like.',
  naoCopiou: 'Copying did not work here. Select the text above and copy it by hand.',
  marca: 'Cosmic Guide · cosmicguide.cloud',
};

const FASES = {
  jogo: 'While it was only a game',
  leitura: 'When the cards became an oracle',
  oculto: 'When the system was built',
  erudicao: 'When someone went and checked',
};

// The seven sources that are NOT titled works: a deck in a museum, an account
// book, an untitled sheet, a stone, an objection, a thesis, a corpus. Their
// name is a description, and a description has to be in the reader's language.
// The title of a work stays intact in the engine.
const OBRAS = {
  baralhoMameluco: 'Mamluk deck (Topkapı Sarayı Müzesi, Istanbul)',
  contasDeFerrara: 'account books of the courts of Ferrara and Florence (carte da trionfi)',
  folhaBolonhesa: 'Bolognese manuscript sheet, with meanings for 35 cards',
  pedraDeRoseta: 'the Rosetta Stone and the deciphering of hieroglyphs',
  objecaoMerlin: 'the objection raised by Romain Merlin, taken up by Waite in the Pictorial Key',
  teseVaillant: 'the thesis of an Egyptian origin by way of the Roma people',
  textosFundadores: 'the founding texts attributed to Nechepso and Petosiris',
};

const AUTORES = {
  anonimo: 'no known author',
  escrivao: 'court clerks',
  frade: 'an anonymous friar',
  gravadorIncerto: 'engraver uncertain (proposed: Nicola di Maestro Antonio)',
  smithEWaite: 'Pamela Colman Smith on the art and A. E. Waite on the structure',
  pseudonimos: 'pen names of Greek authors in Alexandria',
};

const ABERTURA = {
  chamada:
    'Someone told you a deck should never be bought, that it has to be a gift. Someone said Egypt, pharaohs, a secret kept by priests. And you filed it away without arguing, the way we file away what we hear from people we love.',
  texto: (c) =>
    'Here is the odd part: the true story is better than the one you were told, and it comes with an address. ' +
    'These cards were born as a GAME. A betting game, played at Italian courts, with a trump that beats the suits — the same idea as the trump in a hand of bridge. ' +
    'And it is not a dead past: people still play tarot in France, Königrufen in Austria and tarocchini in Bologna, with the very same deck.' +
    '\n\n' +
    `Card reading as you know it arrives much later, and you can point at the volume and the page. That is roughly ${c.seculosDeImagem} centuries of imagery against ${c.anosDeLeitura} years of reading — ` +
    'and every step of that distance has a work, an author and a year, from the first hand-painted deck to the one in your album.' +
    '\n\n' +
    'None of this takes a single line away from what you feel when you turn a card over. It only changes what you answer when someone asks where this comes from.',
};

const MARCOS = {
  'rheinfelden-1377': {
    titulo: 'Playing cards reach Europe — and arrive with a sermon attached',
    texto:
      'The first time anyone in Europe describes a deck in writing, it is a friar complaining about it. ' +
      'Johannes von Rheinfelden, in Basel, in the year 1377: four suits, court figures, and a moral about social order hung on every card. ' +
      'Notice what is NOT there — no trumps, no divination, no Egypt. Just people gambling, and a churchman annoyed about it.',
  },
  'mameluco-naipes': {
    titulo: 'The four suits do come from Egypt. Only the suits.',
    texto:
      'Here is a good piece of irony: there is a link between Egypt and playing cards, and it is real — it is just not the one you were told. ' +
      'The Mamluk deck that survived nearly complete sits in Istanbul, at the Topkapı, and it carries four suits: coins, scimitars, cups and polo sticks. ' +
      'Coins became pentacles, scimitars became swords, polo sticks became wands. So what came from there were the 56 minors, the ones you collect in the four suits of your album. The 22 trumps were not in that deck.',
  },
  'trionfi-ferrara': {
    titulo: 'The first time the word shows up, it is in an account book',
    texto:
      'Not in a temple, not in a fortune-teller’s tent: in the bookkeeping of a duke who liked to play. ' +
      'The clerk of the court of Ferrara writes down carte da trionfi — cards of triumph — in the expense ledger, in 1442. ' +
      'Two years earlier, in Florence, someone records two decks being handed to Sigismondo Pandolfo Malatesta. That is how tarot enters written history: as a line item.',
  },
  'visconti-sforza': {
    titulo: 'The oldest ones left are hand-painted, with gold leaf',
    texto:
      'Before cheap printing, a deck was a rich household item: hand-painted, gold leaf, commissioned by the family that ran Milan. ' +
      'The Visconti-Sforza decks, c. 1441–1451, are the oldest tarots that reached us — and they are not one deck: they are several, all incomplete, today split between New York and Bergamo. ' +
      'Part of the painting is attributed to Bonifacio Bembo. Not one of them was made to tell anybody anything.',
  },
  'sermao-steele': {
    titulo: 'A friar curses the gamblers and saves the list of the 22',
    texto:
      'The oldest list of the 22 trumps, in order, reached us because a churchman was furious. ' +
      'In the sermon scholars call the Steele Sermon, he preaches against dice and cards and, to show how bad the problem is, names one by one the trumps of the ludus triumphorum. ' +
      'He cursed, he listed, he became our source. The order he gives is essentially the one your album uses in the Major Arcana. Nobody pins the exact date: last third of the fifteenth century.',
  },
  'sola-busca': {
    titulo: 'The first complete deck with a scene on every card',
    texto:
      'Look at your album: even the numbered cards have people, a landscape, something happening. That is rare, and it is recent. ' +
      'The Sola Busca, engraved on metal around 1491, is the oldest 78-card deck that survived whole and the first in which every pip card gets a scene instead of a repeated symbol. ' +
      'Keep the name: it comes back four centuries later, in London.',
  },
  'palavra-taro': {
    titulo: 'The word "tarot" arrives after the game — and nobody knows from where',
    texto:
      'For decades the game was called trionfi, trumps, and nothing else. ' +
      'The form tarocho turns up in Ferrara in 1505 and taraux in Avignon that same year. Where the word came from, nobody knows — and that is not our ignorance: in 1550 the Ferrarese poet Alberto Lollio already wrote that the origin of the name was unknown. ' +
      'Anyone offering you an Egyptian etymology is offering something the sixteenth century had already given up on.',
  },
  'padroes-regionais': {
    titulo: 'Not every tarot has 78 cards',
    texto:
      'Your album has 78 slots because that is the standard that won — not because 78 is a sacred number. ' +
      'Sixteenth-century Florence played Minchiate, with 97 cards, carrying the twelve zodiac signs and the four elements among its trumps. Bologna used 62. Sicily, 64. ' +
      'When someone pulls a mystical meaning out of the number 78, they are doing numerology on top of a manufacturer’s decision.',
  },
  'folha-bolonhesa': {
    titulo: 'The oldest fortune-telling found is Italian, ordinary and plain',
    texto:
      'Before any French occultist, someone in Bologna wrote by hand, on a single sheet, what each card meant: 35 of them, with a simple way of laying the cards out. ' +
      'The sheet predates 1750, it was found in an archive by the researcher Franco Pratesi, and there the Fool means "foolishness", with no hidden layer. ' +
      'There are no reversed cards on it. It is the oldest known attestation of tarot cartomancy — and it comes from ordinary people, not priests.',
  },
  etteilla: {
    titulo: 'The first professional card reader had a method, a table and a price',
    texto:
      'There was a man in Paris who signed his name backwards — Alliette became Etteilla — and turned card reading into a trade. ' +
      'He is the one who fixed a meaning for each card, a meaning for the card turned upside down, and a set way of laying them out: he started in 1770 with an ordinary deck and in 1789 published the Grand Etteilla, the first deck drawn on purpose for divination. ' +
      'Every reversed card you have ever read, in any deck on earth, descends from him.',
  },
  'volume-1781': {
    titulo: 'Egypt enters the story in a French book, without a single document',
    texto:
      'A learned clergyman runs into tarot by chance at a social gathering in Paris, thinks he recognises Egyptian symbolism, and writes that the cards are what remains of the Book of Thoth, saved by the priests. ' +
      'He presents not one document. This is Antoine Court de Gébelin, in volume VIII of the Monde primitif, in 1781. In the same volume, the Comte de Mellet ties the 22 trumps to the 22 Hebrew letters. ' +
      'Two essays in a French book founded everything that is sold today as ancient.',
  },
  'levi-arvore': {
    titulo: 'The Tree of Life is hung on the cards',
    texto:
      'A former French seminarian who signed as Éliphas Lévi takes Mellet’s suggestion and builds the whole system: every trump becomes a Hebrew letter and a path on the kabbalistic Tree of Life. ' +
      'Dogme et Rituel de la Haute Magie comes out in two volumes, 1854 and 1856, each with 22 chapters — the shape of the book imitates the deck. Papus popularises it in 1889, with arcana drawn by Oswald Wirth. ' +
      'No Italian document from the fifteenth to the seventeenth century ties a trump to a Hebrew letter. That stitching is nineteenth-century work.',
  },
  'book-t': {
    titulo: 'The astrological table this app uses was born in a London order',
    texto:
      'When the app tells you a card is "Mars in Aries", that does not come from Italy and it does not come from Egypt. ' +
      'It comes from a late nineteenth-century English initiatory order, the Golden Dawn, in the internal papers known as the Cipher Manuscripts and Book T: that is where the 22 trumps, the 36 decans of the cards from 2 to 10 and the court figures each receive their correspondence. ' +
      'Israel Regardie published the material from 1937 onward. There are at least three rival and incompatible tables — this app uses the Golden Dawn one and says so on screen, instead of writing "the astrological attribution" as if there were only one.',
  },
  'rider-waite-smith': {
    titulo: 'The deck in your album is published — with a date, a city and a publisher',
    texto:
      'The images you collect here did not fall out of the sky: London, December 1909, William Rider & Son. ' +
      'All 78 were drawn by Pamela Colman Smith, an illustrator, working from written and spoken instructions by A. E. Waite — with no sketches from him. Her name stayed off the title for decades, which is why the right thing to say is Rider-Waite-Smith. ' +
      'For the 56 minors, Smith leaned on the Sola Busca: photographs of all 78 cards of that 1491 deck entered the British Museum in 1907, two years earlier.',
  },
  'waite-desmente': {
    titulo: 'The author of the best-selling deck on earth takes Egypt apart in his own book',
    texto:
      'This is the best part, and almost nobody tells it: the man who brought down the Egyptian origin was the author of the deck himself, in the book that comes with it. ' +
      'In 1911, Waite goes through Court de Gébelin’s ten arguments and writes: "These, therefore, are ten pillars which support the edifice of the thesis, and the same are pillars of sand". ' +
      'On the etymology, he points out that it was offered before the Rosetta Stone, when nobody alive could read Egyptian — the Stone surfaced in 1799 and Champollion only deciphered hieroglyphs in 1822. And he concludes: "there is no particle of evidence for the Egyptian origin of Tarot cards". ' +
      'When this app says tarot does not come from Egypt, it is not being sceptical about the tradition: it is standing with Waite.',
  },
  'marteau-marselha': {
    titulo: 'Even "Tarot de Marseille" is a catalogue name',
    texto:
      'The Marseille is not the oldest tarot: it is a French printing pattern of the seventeenth and eighteenth centuries — Noblet in Paris around 1650, Conver in Marseille in 1760. ' +
      'The oldest tarots in existence are still the hand-painted Italian ones. The name as we use it today was popularised in 1930 by Paul Marteau, of the Grimaud company, who fixed the colours and the drawing from the Conver. ' +
      'Two earlier attributions for the name circulate, and this research could not verify either of them in the source.',
  },
  'crowley-thoth': {
    titulo: 'The "Book of Thoth" that actually exists dates from the Second World War',
    texto:
      'If somebody tells you tarot is the Book of Thoth, it is worth knowing that a book with that title does exist. ' +
      'Aleister Crowley published The Book of Thoth in 1944, with art by Frieda Harris, following the Golden Dawn with one swap he declares himself. ' +
      'It is a twentieth-century deck with an Egyptian name — not an Egyptian document. Chronological order clears the confusion on its own.',
  },
  'dummett-arquivo': {
    titulo: 'The man who gathered the evidence was a professor of logic',
    texto:
      'The story you have just read did not come from anybody’s intuition: it came out of archives, account books and museums. ' +
      'Michael Dummett, an Oxford philosopher, published The Game of Tarot in 1980, following the paper trail from Ferrara to Salt Lake City; in 1996, with Ronald Decker and Thierry Depaulis, he published A Wicked Pack of Cards, on the origins of occult tarot. ' +
      'That is why every date on this timeline has somewhere to be checked — and why it can change, if a new document turns up. A history that cannot be corrected is not history.',
  },
};

const MITOS = {
  egito: {
    oQueSeDiz: 'This deck is the Book of Thoth: it comes from the Egypt of the pharaohs, kept by priests until it reached Europe.',
    oQueAFonteMostra:
      'The whole claim comes out of one chapter published in Paris in 1781, with no document attached — and the man who demolished it, in 1911, was the author of the best-selling deck on the planet, in the handbook that ships with his own deck. ' +
      'There is a link between Egypt and playing cards, and it is a different one: the four Mamluk suits, coins, scimitars, cups and polo sticks. It accounts for the 56 minors, not for the 22 trumps.',
  },
  etimologia: {
    oQueSeDiz: 'TAROT comes from the Egyptian TAR-RO, "royal road" — the royal road of life.',
    oQueAFonteMostra:
      'That etymology was written in 1781. The Rosetta Stone only surfaced in 1799 and Champollion only deciphered hieroglyphs in 1822: in 1781 nobody on the planet could read Egyptian, starting with the man who proposed the etymology. ' +
      'The origin of the word tarocco is still unknown, and was already being called unknown in 1550. The ROTA, TORA and ORAT anagrams are a nineteenth-century game with Latin letters, not an etymology.',
  },
  'vinte-e-duas-letras': {
    oQueSeDiz: 'There are 22 major arcana and 22 Hebrew letters — proof that tarot is kabbalistic from the start.',
    oQueAFonteMostra:
      'The link is suggested by the Comte de Mellet in 1781 and systematised by Éliphas Lévi in 1854: French Enlightenment and nineteenth-century occultism, not ancient Jerusalem. No Italian document from the fifteenth to the seventeenth century ties a trump to a letter. ' +
      'And the numerical argument collapses inside the game itself: the Florentine Minchiate has 40 trumps. If 22 were a kabbalistic design, somebody should have told the Florentines.',
  },
  'povo-rom': {
    oQueSeDiz: 'A travelling people carried tarot out of Egypt and into Europe.',
    oQueAFonteMostra:
      'The idea belongs to Boiteau, 1854, and Vaillant, 1857 — and it has two problems with dates. Language shows that the Roma come from north-western India, and comparative linguistics established that in 1782–1783, before the thesis was even written. ' +
      'On top of that, cards were already circulating in Europe before the documented arrival of the Roma. Waite was already making that objection in 1911, crediting the correction to Romain Merlin, 1869.',
  },
  'cinco-mil-anos': {
    oQueSeDiz: 'Tarot is five thousand years old: Atlantis, the druids, a lost wisdom.',
    oQueAFonteMostra:
      'There is no source for any of the three. What holds up, and can be checked card by card in a museum, is this: about six centuries of imagery and about two and a half centuries of reading. ' +
      'It is less than what gets announced out there and it is more interesting, because each of those centuries has a city, a name and a document — and the five thousand years do not have a single line.',
  },
  'sempre-espiritual': {
    oQueSeDiz: 'Tarot was always a spiritual instrument; the card game is a modern degradation.',
    oQueAFonteMostra:
      'The order of events is the opposite. First came some 350 years of gaming tables, betting and parlour play; the first documented reading arrives after all of that. ' +
      'And the game did not die to become an oracle: tarot is played in France, Königrufen in Austria and tarocchini in Bologna, today, with the same cards that sit in your album.',
  },
};

const GRUPOS = {
  maiores: {
    titulo: 'The 22 trumps: an Italian parade, not a secret alphabet',
    texto:
      'These 22 figures were not a riddle for initiates: they were the visual repertoire of any festival and any church in fifteenth-century Italy. ' +
      'Virtues (Strength, Justice, Temperance), estates of life (the Emperor, the Pope, the Popess), the Wheel of Fortune, the triumph of Death, the Last Judgement — the same images as the triumphal parades and Petrarch’s Triumphi, a thesis Gertrude Moakley argued in 1966. ' +
      'The oldest list of them, in order, survived inside a sermon against gambling, from the last third of the fifteenth century.',
  },
  paus: {
    titulo: 'Wands were polo sticks',
    texto:
      'In the Mamluk deck the European suits came from, this was the suit of polo sticks — a mounted noble’s sport, which Europe did not play. ' +
      'Without the sport, the drawing turned into a staff, a club, a wand. The nearly complete example sits in Istanbul, at the Topkapı, and dates from the fifteenth century.',
  },
  copas: {
    titulo: 'Cups were cups, and they crossed everything unchanged',
    texto:
      'This is the suit that changed least along the way: a cup in the Mamluk deck, a cup in Italy, a cup in Spain, cups here. ' +
      'When the image already exists on the table of whoever receives it, it needs no translation. Fifteenth century, and the deck is in Istanbul.',
  },
  espadas: {
    titulo: 'Swords were scimitars',
    texto:
      'The curved blade of the Mamluk deck straightened out on arrival in Italy and became the straight sword you see on your cards. ' +
      'In Spain the drawing stayed closer to the original. Same fifteenth-century deck, same Topkapı.',
  },
  ouros: {
    titulo: 'Pentacles are coins — the money suit, no metaphor',
    texto:
      'A coin in the Mamluk deck, denaro in Italy, pentacles here. It is the suit that needed the least translation, because money is the thing that crosses borders most easily. ' +
      'Fifteenth century, nearly complete example in Istanbul.',
  },
};

const NOTAS_DE_CARTA = {
  estrela: {
    titulo: 'In 1911 this was a card about theft',
    texto:
      'You turned over The Star and read hope. The book Waite wrote to accompany the deck opens her entry from the other side: "Loss, theft, privation, abandonment". ' +
      'Hope comes afterwards, introduced as "another reading says". The priority was flipped over the course of the twentieth century. ' +
      'This app follows the modern reading on purpose, and it is worth knowing why: Waite’s word lists descend from French cartomancy, while Pamela Colman Smith’s pictures carry Golden Dawn symbolism. The two halves of the deck do not tell the same story, and the app sides with the picture.',
  },
  roda: {
    titulo: 'Upside down, this card gets BETTER in the original text',
    texto:
      'The rule you were taught says a reversed card is the same thing, only jammed. That is not what Waite writes: the Wheel of Fortune reversed is "Increase, abundance, superfluity". ' +
      'The Empress reversed is "Light, truth, the unravelling of involved matters". The "reversed means blocked" key belongs to the twentieth century, to the line running through Eden Gray, Rachel Pollack and Mary K. Greer — good reading, just not an old one. ' +
      'Systematic reversals, card by card, were instituted by Etteilla, in the eighteenth century.',
  },
  morte: {
    titulo: 'The kindness of Death is twentieth-century, and the app keeps it',
    texto:
      'When Death comes up, somebody at the table laughs awkwardly and somebody says "it is not literal death, it is transformation". ' +
      'The second sentence is a twentieth-century reading choice — a legitimate one, and the one this app keeps. It is simply not what stands written in 1911: Waite’s entry opens with "End, mortality, destruction, corruption". ' +
      'Saying that "the tradition always read it as transformation" credits Waite with a gentleness that belonged to the last century.',
  },
  louco: {
    titulo: 'The card shows a 0. The author of the deck says it has no number.',
    texto:
      'You look at The Fool and see a zero printed at the top. In his own book, Waite writes: "Wherever it ought to be put, the Zero is an unnumbered card" — and in his list of meanings the Fool appears after 20, not before 1. ' +
      'In the Tarot de Marseille he is LE MAT, with no number at all. In Etteilla he is card 78. The "0 at the beginning" is a Golden Dawn convention, from the end of the nineteenth century. ' +
      'The card in your album and the book by its own author disagree, and that has been in print since the first edition.',
  },
  'forca-justica': {
    titulo: 'Strength is 8 and Justice is 11 — and the swap was not Waite’s',
    texto:
      'If you have ever seen an older deck, Justice was 8 and Strength was 11. The swap your album uses was already in the Golden Dawn Cipher Manuscripts before the deck existed; Waite followed the order he had been trained in. ' +
      'The reason is astrological and simple: putting Leo and Libra in zodiacal sequence. It is a Golden Dawn attribution, from the end of the nineteenth century — not the correction of an ancient mistake, but the choice of a school.',
  },
  'tres-espadas': {
    titulo: 'This image has a relative from 1491',
    texto:
      'Three swords through a heart, under the rain. It is one of the most recognisable cards in the deck — and it has an ancestor. ' +
      'The matching card in the Sola Busca, engraved around 1491, looks very much like it, and the link is documented: photographs of all 78 cards of that deck entered the British Museum in 1907, two years before Pamela Colman Smith drew hers. ' +
      'The same congruence shows up in the Ten of Wands and the Ten of Swords.',
  },
};

const PARALELO = {
  chamada:
    'It feels bad to find out that something you respected was invented by a man in a room in Paris. The feeling passes when you see that this is not the exception — it is the house method, and it is far older than tarot.',
  texto:
    'Western astrology, which the rest of this app runs on, starts in exactly the same way. ' +
    'The texts that found the birth chart as a system circulate under the names of Nechepso, a pharaoh, and Petosiris, an Egyptian priest. Both are pen names: the writing was done by Greek authors in Alexandria, around 150 to 120 BC, giving Egyptian pedigree to a text they were producing at that moment.' +
    '\n\n' +
    'It is the same gesture as Court de Gébelin’s, 1,900 years later. And the astrologer who coined "supermoon" in 1979. And the almanac that named the full moons in the 1930s.' +
    '\n\n' +
    'So: inventing antiquity is not the corruption of the tradition — it is a trait of it, from day one. That is no reason to put the deck down. It is a reason to know what you are holding: about six centuries of imagery, two and a half centuries of reading, and a line of people who always felt their own invention needed to look older than it was.',
};

const FONTES = [
  'A. E. Waite, The Pictorial Key to the Tarot, 1911 — Part I §4 is the history and the place where he brings down the Egyptian origin; Part II §3 is the numbering of the Fool. Public domain, full text at sacred-texts.com/tarot/pkt/',
  'Antoine Court de Gébelin, Le Monde primitif, vol. VIII, "Du Jeu des Tarots", 1781 — the essay that invents the Egyptian origin, and the Comte de Mellet essay, in the same volume, that ties the 22 trumps to the Hebrew alphabet',
  'Michael Dummett, The Game of Tarot: from Ferrara to Salt Lake City, 1980 — the archival work that established the documented history of the deck',
  'Ronald Decker, Thierry Depaulis and Michael Dummett, A Wicked Pack of Cards: The Origins of the Occult Tarot, 1996 — the origins of occult tarot, from 1781 onward',
  'Golden Dawn, Cipher Manuscripts and "Book T — The Tarot" — the astrological table of all 78 cards, published by Israel Regardie from 1937 onward. It is the table this app uses',
  'Sermones de ludo cum aliis, northern Italy, last third of the fifteenth century — the oldest known list of the 22 trumps, in order',
  'Gertrude Moakley, The Tarot Cards Painted by Bonifacio Bembo, 1966 — the thesis that the trumps descend from Petrarch’s Triumphi and the triumphal parades. Influential, not settled',
  'docs/tradicao/05-taro-historia-e-leitura.md — the internal base where every date on this screen was checked, with the grade of each claim',
];

const COMPARTILHAR = {
  oQueSeDiz: 'People say:',
  oQueAFonteMostra: 'The source shows:',
  recibo: 'Receipt:',
};

export const PACK = {
  idioma: 'en',
  tela: TELA,
  fases: FASES,
  obras: OBRAS,
  autores: AUTORES,
  abertura: ABERTURA,
  marcos: MARCOS,
  mitos: MITOS,
  grupos: GRUPOS,
  notasDeCarta: NOTAS_DE_CARTA,
  paralelo: PARALELO,
  fontes: FONTES,
  compartilhar: COMPARTILHAR,
};

export default PACK;
