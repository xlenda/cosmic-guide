// datos/fases.en.js
// INGLES dos quatro tons de semana. Vizinho de datos/fases.js e irmao de
// datos/fases.es.js.
//
// ===========================================================================
// O QUE VEIO DA ONDA 1, VERBATIM
// ===========================================================================
// `tom` e `oQuePede` das quatro fases JA existiam em datos/textos.en.js
// (chaves 'ano.fase.<slug>.tom' e '.pede', linhas 452-459) e foram copiados de
// la sem tocar. O resto foi escrito aqui.
//
// ===========================================================================
// DESCREVER, NUNCA CAUSAR — e em ingles isso custa mais atencao
// ===========================================================================
// "From the first quarter to the full moon the lit fraction goes from half to
// whole" e medida. "In the waxing moon things grow in your life" e invencao, e
// escorrega em tres palavras para "in the waxing moon that person comes closer".
// A contencao e ESTRUTURAL: em nenhum campo deste arquivo a outra pessoa e
// sujeito de verbo. Nenhum "they will", nenhum "he'll", nenhum "coming back" —
// o ingles nao tem terminacao de futuro para a morfologia PT/ES morder, e foi
// por isso que o portao de doutrina de tres idiomas precisou existir.
//
// ===========================================================================
// O QUE NAO SE TRADUZ, E POR QUE ESTA FORA DESTE ARQUIVO
// ===========================================================================
//  · `id`, `quarto`, `elongacao` — tecnicos.
//  · `autor`, `obra`, `locus`, `seculo` — O RECIBO, e ele fica como esta no
//    original. Nem "Cláudio Ptolomeu" virou "Claudius Ptolemy", nem "Catão, o
//    Velho" virou "Cato the Elder": o campo `autor` esta em CAMPOS_FORA do
//    portao de doutrina e e texto compartilhado entre os tres idiomas — uma
//    traducao aqui criaria uma segunda grafia do mesmo autor e quebraria a
//    invariante de que `anios`/`seculo` batem com o que esta impresso.
//    Titulos (Tetrabiblos, De Agri Cultura, Naturalis Historia, Opus
//    Agriculturae, De Re Rustica) sao latim nos tres idiomas de qualquer jeito.
//  · `oQueDiz` SIM se traduz: e PARAFRASE da Madre sobre o que a obra diz, nao
//    a citacao. Prosa do autor do app.
//  · As expressoes LATINAS ficam em latim: `luna silente`, `luna decrescente`.
//
// Ortografia: ingles britanico, o mesmo de textos.en.js ("summarises").
//
// FORMA: dicionario plano, chaves IDENTICAS as de fases.es.js e as do PT.
// ===========================================================================

export const EN = {
  /* =======================================================================
   * THE SOURCES — the paraphrase is translated; author, work, locus and
   * century are not: they are the receipt.
   * ======================================================================= */
  'fonte.quatroQuartos.oQueDiz':
    'Divides the lunar month into four quarters and gives each one an elemental quality: from the New Moon to the First Quarter, moist; from the First Quarter to the Full Moon, hot; from the Full Moon to the Last Quarter, dry; from the Last Quarter to conjunction, cold.',
  'fonte.oitoFases.oQueDiz':
    'The psychological reading of the eight phases is formulated here, on an idea the author had been developing since the 1930s and 40s (The Astrology of Personality, 1936). It is later tradition, with an author and a date — it is not ancient.',

  /* =======================================================================
   * 1 · STARTING IN THE DARK (New Moon to First Quarter)
   * tom/pede: VERBATIM from textos.en.js (ano.fase.comecar-no-escuro.*)
   * ======================================================================= */
  'fase.novaACrescente.fase': 'New Moon to First Quarter',
  'fase.novaACrescente.tom': 'Starting in the dark',
  'fase.novaACrescente.qualidade': 'moist',
  'fase.novaACrescente.abertura':
    'Between the New Moon and the First Quarter the lit fraction of the disc goes from almost nothing up to half. It is the stretch of the month with the least light in the night sky, and the only one in which the phase changes its name without the difference being visible from one night to the next.',
  'fase.novaACrescente.oQuePede':
    'A small gesture, started today, that produces nothing visible today.',
  'fase.novaACrescente.comoMudaOPlano':
    'The screen of the day is the shortest of the four and asks for one thing only. No list, no second step, nothing to check at the end of the day — what is asked for here is the kind of thing that has no result yet.',
  'fase.novaACrescente.proibicao.0':
    'Do not swap the concrete gesture for a "planted intention". Planting for real in the dark moon has a primary source two thousand years old (Catão 40.1); "planting intentions" is a modern transposition, popularised by Jan Spiller in New Moon Astrology (2001). If the second one is used, the text says that it is modern.',
  'fase.novaACrescente.proibicao.1':
    'Do not promise that today’s gesture changes what comes after. What this phase asks for is precisely the thing with no result in sight.',
  'fonte.catao401.oQueDiz':
    'Fig, apple, olive, pear and vine planted luna silente — with the moon dark —, at dusk.',
  'fonte.paladio.oQueDiz': 'Everything that is sown should be sown with the moon waxing.',

  /* =======================================================================
   * 2 · HOLDING WITHOUT ADDING (First Quarter to Full Moon)
   * The most slippery spot in the file: the Roman rule is about SEED, and the
   * distance between "what grows is your own record" and "what grows is the
   * bond" is one word. The other person appears in no field.
   * ======================================================================= */
  'fase.crescenteACheia.fase': 'First Quarter to Full Moon',
  'fase.crescenteACheia.tom': 'Holding what already started, without adding to it',
  'fase.crescenteACheia.qualidade': 'hot',
  'fase.crescenteACheia.abertura':
    'From the First Quarter to the Full Moon the lit part of the disc goes from half to whole. It is the stretch in which the same thing looks bigger each night without changing its nature: what changes is how much of it is turned this way.',
  'fase.crescenteACheia.oQuePede':
    "Doing the previous phase's gesture one more time, the same size.",
  'fase.crescenteACheia.comoMudaOPlano':
    'It is the only one of the four phases that asks for repetition instead of novelty. The size of the ask does not go up on any day of this phase — the gesture is the same one, done again.',
  'fase.crescenteACheia.proibicao.0':
    'Do not say that repeating makes anything grow between you and another person. The Roman rule is about seed. What repetition makes grow, when it grows, is your own record — and that is countable on the screen, without metaphor.',
  'fase.crescenteACheia.proibicao.1':
    'Do not scale the ask up over the week. Scaling turns the next phase into a debt.',
  'fonte.carr.oQueDiz':
    'A survey of every Latin passage on the moon and farming. The rule he draws from the whole: everything you want to grow is done with the moon waxing; everything you want to dry or shrink, with the moon waning.',

  /* =======================================================================
   * 3 · WHAT CAN ALREADY BE SEEN (Full Moon to Last Quarter)
   * Two prohibitions of its own, both sourced: (a) HARVESTING belongs to the
   * waning moon (Plinio XVIII.321), not the full one; (b) the full moon is NOT
   * tied to behaviour (Rotton & Kelly 1985, 37 studies) — and that fact is
   * ACTIVE: it protects against "I'm like this because of the full moon".
   * ======================================================================= */
  'fase.cheiaAMinguante.fase': 'Full Moon to Last Quarter',
  'fase.cheiaAMinguante.tom': 'What can already be seen',
  'fase.cheiaAMinguante.qualidade': 'dry',
  'fase.cheiaAMinguante.abertura':
    'The Full Moon is the exact opposition between Sun and Moon: an instant, not a day — to the naked eye the disc looks full for about three nights. From that point to the Last Quarter the lit fraction goes back from whole to half, and it is the stretch of the month with the most light for seeing what is already there.',
  'fase.cheiaAMinguante.oQuePede':
    'Writing down one thing that can already be seen without interpreting it.',
  'fase.cheiaAMinguante.comoMudaOPlano':
    'It is the only one of the four that asks for written words, which is why it turns up once per lunation and not every week. The sky card shares no visual block with any meeting block, and in this phase no meeting gesture goes in.',
  'fase.cheiaAMinguante.proibicao.0':
    'Do not say "harvest". The Roman source puts harvesting-to-store in the waning moon (Plínio, NH XVIII.321), and in the full moon Columela (XI.2.85) has you sow broad beans. The sentence that circulates online inverts the source.',
  'fase.cheiaAMinguante.proibicao.1':
    'Do not tie the Full Moon to behaviour, yours or anyone else’s. The Rotton & Kelly meta-analysis (1985, 37 studies) finds no relation — and that fact works as protection against "I’m like this because of the full moon".',
  'fase.cheiaAMinguante.proibicao.2':
    'Do not put a meeting gesture in this phase, and do not let the dated marker share a visual block with the meeting block. A date on the screen is measurement; a date next to reconciliation becomes the eve of an event.',
  'fonte.columelaFava.oQueDiz':
    'Broad beans sown on the eve of the full moon or on the day itself.',
  'fonte.plinioColher.oQueDiz':
    'Everything cut, harvested and shorn takes less damage with the moon waning — that is, harvesting-to-store belongs to the waning moon, not the full one.',
  'fonte.rottonKelly.oQueDiz':
    'Meta-analysis of 37 studies: no relation between the full moon and human behaviour.',

  /* =======================================================================
   * 4 · TAKING AWAY, CUTTING, LETTING IT DRY (Last Quarter to New Moon)
   * RED LINE: this app cuts browser tabs, NOT bonds. "Let that person go"
   * would be the app deciding the outcome it swore not to know. Prohibition 0
   * spells it out.
   * ======================================================================= */
  'fase.minguanteANova.fase': 'Last Quarter to New Moon',
  'fase.minguanteANova.tom': 'Taking away, cutting, letting it dry',
  'fase.minguanteANova.qualidade': 'cold',
  'fase.minguanteANova.abertura':
    'From the Last Quarter to the New Moon the lit fraction goes from half to almost nothing, and the Moon rises later and later. It is the quarter with the most ancient sourcing of all four: the three great Latin sources put everything that cuts, harvests to dry, weeds and diminishes right here.',
  'fase.minguanteANova.oQuePede':
    'Taking one concrete thing out of the day — an open tab, a time slot, an object, one more check.',
  'fase.minguanteANova.comoMudaOPlano':
    'It is the only phase in the cycle where the ask is less, and not more. The screen of the day subtracts instead of adding, and that difference in shape is what keeps the four weeks from looking like the same week.',
  'fase.minguanteANova.proibicao.0':
    'Never "let that person go", "cut that bond", "release them". What this app cuts is a browser tab, a time slot and an object — never a bond. Who decides what gets cut is you.',
  'fase.minguanteANova.proibicao.1':
    'Do not turn the subtraction into addition in disguise ("take that out and put this in its place"). What this phase asks for is only the removal.',
  'fonte.plinioMinguante.oQueDiz':
    'Everything cut, harvested and shorn takes less damage with the moon waning; manure and gelding also with the moon waning.',
  'fonte.cataoMadeira.oQueDiz':
    'Manure luna silente; timber cut luna decrescente, after midday.',
  'fonte.columelaCapina.oQueDiz':
    'Weeding and manure with the moon waning; timber cut between the twentieth and the thirtieth lunar day.',
};

export default EN;
