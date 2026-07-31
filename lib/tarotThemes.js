// lib/tarotThemes.js
// Camada de interpretação do Tarô por Tema.
//
// NÃO redefine as cartas (isso continua em lib/tarotDeck.js). Pega a carta REAL
// sorteada e a lê — pela imagem dela, pelo nome tradicional dela e pelo
// conselho dela — através da pergunta que a pessoa escolheu (Amor, Carreira,
// Dinheiro, Energia, Saúde).
//
// ===========================================================================
// POR QUE ESTE ARQUIVO FOI REFEITO (31/07/2026)
// ===========================================================================
// A versão anterior montava a leitura a partir de 25 frases-molde
// (5 categorias de carta × 5 temas). Resultado medido: 78 cartas colapsavam em
// 25 formas de dizer a mesma coisa. Cinco de Espadas e O Sol saíam com a MESMA
// estrutura, mudando só o miolo. Pior: os 22 Arcanos Maiores dividiam UM
// template por tema — "não é episódio de rotina, é o eixo da relação sendo
// mexido" serve para qualquer arcano e por isso não diz nada de nenhum.
//
// O dono do app resumiu assim: "muito genérico as cartas tiradas, ele não é
// impactante e incisivo, fica enrolando linguiça".
//
// A REGRA DE ESCRITA QUE VALE AQUI AGORA, e o teste que a cobra:
//   TODA frase da leitura carrega pelo menos um dado exclusivo DAQUELA carta.
//   Se uma frase serviria para outra carta, ela está errada.
//   test/tarotVoice.test.js quebra o build quando duas cartas diferentes, no
//   mesmo tema e na mesma posição, produzem frases iguais ou textos com
//   sobreposição de trigramas acima do teto declarado lá.
//
// ===========================================================================
// DE ONDE VEM O MÉTODO (é tradição, e tem data)
// ===========================================================================
// 1. A CARTA NÃO FALA SOZINHA, e o significado nasce da imagem.
//    A. E. Waite, "The Pictorial Key to the Tarot" (1911), no prefácio:
//    "The true Tarot is symbolism; it speaks no other language and offers no
//    other signs" e, na sequência, as cartas são "a kind of alphabet which is
//    capable of indefinite combinations and makes true sense in all".
//    Por isso a leitura aqui abre pela CENA (card.cena, a imagem de Pamela
//    Colman Smith carta a carta) e infere dali — método que Camelia Elias
//    ("Marseille Tarot: Towards the Art of Reading", Eyecorner Press, 2014)
//    chama de argumento visual.
//
// 2. UMA PALAVRA POR CARTA, ENCADEADA — o antídoto documentado contra enrolar.
//    Golden Dawn, método "Opening of the Key" (S. L. MacGregor Mathers,
//    "Book T", fim do séc. XIX; publicado por Israel Regardie em "The Golden
//    Dawn", 1937-1940): reduzir cada carta a uma palavra e encadear as
//    palavras numa narrativa. É a primeira linha de toda leitura daqui.
//
// 3. O REGISTRO É SECO. As "Divinatory Meanings" de Waite são listas de
//    substantivos, sem hedge e sem consolo. A Torre, verbatim: "Misery,
//    distress, indigence, adversity, calamity, disgrace, deception, ruin. It
//    is a card in particular of unforeseen catastrophe." Oito substantivos e
//    ponto. Três de Espadas termina com Waite se RECUSANDO a explicar, porque
//    a imagem já disse: "and all that the design signifies naturally, being
//    too simple and obvious to call for specific enumeration."
//
// 4. A POSIÇÃO É PARTE DO SIGNIFICADO. Etteilla (Jean-Baptiste Alliette),
//    "Manière de se récréer avec le jeu de cartes nommées tarots" (1785), é o
//    primeiro a publicar tiragens com significado por POSIÇÃO e a modificar a
//    leitura de uma carta pelas adjacentes. Por isso getThemedMeaning recebe
//    `position` e a mesma carta lê diferente em Passado, Presente e Futuro.
//
// 5. CARTA DURA SE DIZ INTEIRA, E SÓ DEPOIS O QUE RESTA. O modelo é o Cinco de
//    Copas de Waite, verbatim: "It is a card of loss, but something remains
//    over; three have been taken, but two are left". Nomeia a perda sem
//    suavizar, e o que sobra vem de um FATO DA IMAGEM (duas taças em pé), não
//    de um chavão. Mary K. Greer, sobre o Dez de Espadas (02/03/2008), diz a
//    mesma coisa por outro lado: "it is only by knowing the true state and
//    feelings of the person on this card that we have any chance of knowing
//    its blessings" — o alívio só é legítimo depois de a dificuldade ter sido
//    dita por inteiro.
//
// 6. DIGNIDADES ELEMENTAIS: a carta muda conforme as vizinhas. Doutrina
//    escrita, do "Book T" de Mathers, publicada por Regardie: mesmo elemento
//    fortalece muito; fogo/água e ar/terra são contrários e enfraquecem;
//    fogo/terra e ar/água são neutros. Aplicação canônica em TRÍADE — a carta
//    do centro é a principal e é modificada pelas duas ao lado. A tiragem
//    deste app é exatamente uma tríade. Ver getElementalDignity().
//
// ===========================================================================
// O QUE NÃO ENTRA — a linha que já vale no resto do app
// ===========================================================================
// Ver os cabeçalhos de lib/zodiacBody.js e lib/grounding.js: tradição com
// FONTE, nunca alegação de saúde, nunca invenção apresentada como milenar.
//
// • Nada de previsão de doença, de morte ou de efeito sobre o corpo. Isso é
//   convergência entre o registro de Waite e os códigos de ética de leitores
//   profissionais contemporâneos (American Tarot Association e equivalentes) —
//   que são CONTEMPORÂNEOS, não milenares, e não devem ser vendidos como tal.
// • Incisivo não é assustador nem determinista. A carta descreve a natureza da
//   situação; não decreta desfecho e não decide pela pessoa. Por isso a casa do
//   Futuro é enunciada como VETOR, nunca como fato consumado.
// • Nada de conselho imperativo inventado em cima da keyword crua ("invista em
//   dificuldade", "é hora de agir com sobrecarga"). O conselho vem de
//   card.conselho / card.conselhoInvertido, escrito carta a carta na tradição.
// • A INVERSÃO (corrigida em 30/07/2026) não é oposto simples e não usa as
//   palavras da leitura direta como se fossem afirmação: é a MESMA energia
//   bloqueada, em excesso ou virada para dentro, com o conselho vindo do campo
//   invertido da própria carta. Isso está preservado abaixo, de propósito.
// ===========================================================================

const THEME_KEYS = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];

// Como a pergunta é aberta em cada tema. Uma preposição, não uma tese.
const THEME_OPENER = {
  Amor: 'No amor',
  Carreira: 'Na carreira',
  Dinheiro: 'Nas finanças',
  Energia: 'Na energia',
  Saúde: 'Na saúde',
};

// TERRITÓRIO DO NAIPE por tema. Repare no que isto é e no que NÃO é: é o
// rótulo do território que aquele naipe cobre naquela pergunta — três a seis
// palavras — e NUNCA a leitura da carta. A leitura inteira vem da carta.
// Este é o único pedaço de texto compartilhado entre cartas, e ele fica dentro
// de uma frase que termina no nome tradicional exclusivo daquela carta.
const SUIT_TERRITORY = {
  paus: {
    Amor: 'desejo e iniciativa',
    Carreira: 'ímpeto e projeto',
    Dinheiro: 'dinheiro que só se move por iniciativa',
    Energia: 'vigor — e quanto dele já foi gasto',
    Saúde: 'corpo em movimento, entre vigor e exaustão',
  },
  copas: {
    Amor: 'vínculo e o que se sente antes de conseguir explicar',
    Carreira: 'clima e pessoas',
    Dinheiro: 'decisão movida por valor afetivo',
    Energia: 'estado emocional',
    Saúde: 'estado emocional, que é o que sustenta o corpo',
  },
  espadas: {
    Amor: 'aquilo que precisa ser dito',
    Carreira: 'análise, estratégia e a conversa difícil',
    Dinheiro: 'número olhado sem a história em volta',
    Energia: 'cabeça, e o quanto ela deixa o resto funcionar',
    Saúde: 'sono e pensamento',
  },
  ouros: {
    Amor: 'sentimento virado em gesto concreto',
    Carreira: 'ofício, prazo e resultado que se vê',
    Dinheiro: 'matéria, e aqui o naipe joga em casa',
    Energia: 'corpo físico e o que ele aguenta',
    Saúde: 'hábito e rotina que se sustentam no tempo',
  },
};

// Nos Arcanos Maiores não há naipe. O que a tradição diz é outra coisa: o
// assunto é de outra ordem de grandeza. Isso vira UMA oração curta, e a frase
// termina na atribuição astrológica exclusiva daquele arcano.
const MAJOR_TERRITORY = {
  Amor: 'o eixo da relação, não o episódio da semana',
  Carreira: 'o rumo, não a tarefa da semana',
  Dinheiro: 'a sua relação com o dinheiro, antes do saldo',
  Energia: 'o pano de fundo, não o humor do dia',
  Saúde: 'corpo e mente lidos juntos, não em partes',
};

const SUIT_LABEL = { paus: 'Paus', copas: 'Copas', espadas: 'Espadas', ouros: 'Ouros' };

// Posições da tiragem de três (Etteilla, 1785). Cada frase leva o NOME da
// carta dentro — sem isso a casa vira mais uma moldura repetida, que é
// exatamente o defeito que este arquivo existe para corrigir.
//
// A casa do Futuro é a mais delicada: a tradição não promete acontecimento.
// Ptolomeu já tratava posição dura como natureza, não como sentença (mesma
// lógica aplicada em lib/compatibility). Aqui: vetor, nunca fato consumado.
const POSITION_FRAMES = {
  Passado: (card) => `Na casa do Passado, ${card.name} é raiz: já aconteceu e ainda sustenta o que está de pé.`,
  Presente: (card) => `Na casa do Presente, ${card.name} é o que se move agora, enquanto você lê.`,
  Futuro: (card) => `Na casa do Futuro, ${card.name} é vetor e não fato: é para onde isto aponta se nada mudar — o tarô desenha a direção, não o acontecimento.`,
};

const POSITION_KEYS = ['Passado', 'Presente', 'Futuro'];

// Categoria de uma carta: naipe (paus/copas/espadas/ouros) ou 'maior' para os
// Arcanos Maiores (que não têm suit).
export function getCardCategory(card) {
  return card.suit || 'maior';
}

function lowerFirst(text) {
  if (!text) return '';
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function upperFirst(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// A primeira linha: a carta reduzida a substantivos secos, no registro das
// "Divinatory Meanings" de Waite. Nada de verbo de futuro, nada de adjetivo
// dramático, nada de consolo — a lista de keywords da carta, e ponto.
function dryOpening(card, themeKey, isReversed) {
  const words = Array.isArray(card.keywords) ? card.keywords : [];
  if (!words.length) return `${themeKey}.`;
  if (isReversed) return `${themeKey} — ${words[0]} pelo avesso.`;
  return `${themeKey} — ${words.join(', ')}.`;
}

// A frase que faz o trabalho do TEMA e, no mesmo fôlego, entrega a atribuição
// tradicional exclusiva da carta (título Golden Dawn + decanato nas numeradas,
// elemento composto nas cortes, raiz nos Ases, planeta/signo nos Maiores).
// É por isso que ela nunca sai igual para duas cartas.
function themeAndTraditionLine(card, themeKey) {
  const opener = THEME_OPENER[themeKey] || THEME_OPENER.Amor;
  const category = getCardCategory(card);

  if (category === 'maior') {
    const territory = MAJOR_TERRITORY[themeKey] || MAJOR_TERRITORY.Amor;
    const attr = card.element ? upperFirst(card.element) : 'o próprio símbolo';
    return `${opener}, um Arcano Maior põe em jogo ${territory}; a atribuição tradicional deste arcano é ${attr}.`;
  }

  const territory = (SUIT_TERRITORY[category] || {})[themeKey] || '';
  const label = SUIT_LABEL[category] || 'o naipe';
  const base = `${opener}, ${label} responde por ${territory}`;

  if (card.tituloGD && card.astro) {
    return `${base}, e quem entra aqui é o ${card.tituloGD} — ${card.astro} na atribuição da Golden Dawn.`;
  }
  if (card.astro) {
    return `${base}, e esta carta é ${card.astro} na atribuição da Golden Dawn.`;
  }
  return `${base}.`;
}

// Retorna o texto de interpretação da carta.
// - card: a carta de lib/tarotDeck.js
// - themeKey: 'Amor' | 'Carreira' | 'Dinheiro' | 'Energia' | 'Saúde'
// - isReversed: carta invertida
// - position: 'Passado' | 'Presente' | 'Futuro' (opcional). Sem posição a
//   leitura sai sem casa — é o comportamento de "carta do dia", e é por isso
//   que nenhuma frase crava tempo sem saber a casa.
export function getThemedMeaning(card, themeKey, isReversed = false, position = null) {
  if (!card) return '';
  const theme = THEME_KEYS.includes(themeKey) ? themeKey : THEME_KEYS[0];
  const parts = [];

  // 1. A palavra seca (Opening of the Key + registro de Waite).
  parts.push(dryOpening(card, theme, isReversed));

  // 2. A CENA. O que está desenhado na carta, concreto. É daqui que a leitura
  //    tradicional sai de verdade — e é o que impede 14 cartas de um naipe de
  //    lerem com a mesma forma de frase.
  if (card.cena) parts.push(`Na carta, ${card.cena}.`);

  // 3. O que a cena diz.
  if (isReversed) {
    // Preservado da correção de 30/07/2026: a inversão é NOMEADA como a
    // tradição a lê (mesma energia travada), e o texto que vem depois é o
    // reversedMeaning da carta — nunca as palavras da leitura direta usadas
    // como afirmação.
    const eixo = card.keywords?.[0];
    const lead = eixo
      ? `Invertida, ela não vira o oposto: ${eixo} aparece bloqueada, em excesso ou virada para dentro —`
      : 'Invertida, a mesma força aparece bloqueada, em excesso ou virada para dentro —';
    parts.push(`${lead} ${lowerFirst(card.reversedMeaning)}`);
  } else {
    parts.push(card.uprightMeaning);
  }

  // 4. O tema + o nome tradicional exclusivo da carta.
  parts.push(themeAndTraditionLine(card, theme));

  // 5. O conselho da própria carta naquela orientação. Carta dura é
  //    diagnóstico: o conselho dela aponta o que a imagem mostra, não manda a
  //    pessoa cultivar o próprio problema.
  const conselho = isReversed ? card.conselhoInvertido : card.conselho;
  if (conselho) parts.push(conselho);

  // 6. A casa da tiragem, com o nome da carta dentro.
  const frame = position && POSITION_FRAMES[position];
  if (frame) parts.push(frame(card));

  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// DIGNIDADES ELEMENTAIS — a carta lida pelas vizinhas (Book T)
// ---------------------------------------------------------------------------
// Doutrina de S. L. MacGregor Mathers, "Book T" (manuscrito da Hermetic Order
// of the Golden Dawn, fim do séc. XIX), publicada por Israel Regardie em "The
// Golden Dawn" (1937-1940). Regra da tríade: a carta do CENTRO é a principal e
// é modificada pelas duas que a ladeiam.
//
// HONESTIDADE SOBRE A FONTE: o verbatim do Book T não foi conferido no
// manuscrito original. O que está aqui segue a literatura secundária
// consistente (Mary K. Greer, "Elemental Dignities", 2008; Anthony Louis,
// "Elemental Dignities in Tarot Readings", 2022): mesmo elemento fortalece
// muito, para o bem ou para o mal; fogo e água são contrários, assim como ar e
// terra, e "mal dignificam" as cartas envolvidas; fogo com terra e ar com água
// são passivos, nem ajudam nem atrapalham.
//
// LIMITE DELIBERADO: a doutrina é sobre os QUATRO ELEMENTOS. Arcano Maior de
// atribuição planetária (O Mago/Mercúrio, A Roda/Júpiter, A Torre/Marte...)
// não entra na conta — devolvemos null em vez de inventar um elemento para
// ele. Arcano de atribuição por SIGNO entra pelo elemento do signo, que é a
// mesma classificação que Ptolomeu usa nas triplicidades.
const SIGN_ELEMENT = {
  áries: 'fogo', leão: 'fogo', sagitário: 'fogo',
  touro: 'terra', virgem: 'terra', capricórnio: 'terra',
  gêmeos: 'ar', libra: 'ar', aquário: 'ar',
  câncer: 'água', escorpião: 'água', peixes: 'água',
};

const ELEMENT_LABEL = { fogo: 'fogo', terra: 'terra', ar: 'ar', água: 'água' };

export function getCardElement(card) {
  if (!card) return null;
  if (card.suit) {
    const bySuit = { paus: 'fogo', copas: 'água', espadas: 'ar', ouros: 'terra' };
    return bySuit[card.suit] || null;
  }
  const el = card.element;
  if (!el) return null;
  if (ELEMENT_LABEL[el]) return el; // O Louco (ar), O Enforcado (água), O Julgamento (fogo)
  return SIGN_ELEMENT[el] || null; // signo → elemento da triplicidade; planeta → null
}

const FRIENDLY = { fogo: 'ar', ar: 'fogo', água: 'terra', terra: 'água' };
const CONTRARY = { fogo: 'água', água: 'fogo', ar: 'terra', terra: 'ar' };

// 'igual' | 'amiga' | 'contrária' | 'passiva' | null
export function getElementalRelation(a, b) {
  if (!a || !b) return null;
  if (a === b) return 'igual';
  if (FRIENDLY[a] === b) return 'amiga';
  if (CONTRARY[a] === b) return 'contrária';
  return 'passiva';
}

// Nota de dignidade elemental da TIRAGEM de três. Devolve string ou null —
// nunca fabrica leitura quando a doutrina não se aplica.
export function getElementalDignity(cards) {
  if (!Array.isArray(cards) || cards.length !== 3) return null;
  const [left, center, right] = cards;
  const elC = getCardElement(center);
  if (!elC) return null;
  const elL = getCardElement(left);
  const elR = getCardElement(right);
  if (!elL && !elR) return null;

  const relL = getElementalRelation(elC, elL);
  const relR = getElementalRelation(elC, elR);
  const rels = [relL, relR].filter(Boolean);

  const iguais = rels.filter((r) => r === 'igual').length;
  const amigas = rels.filter((r) => r === 'amiga').length;
  const contrarias = rels.filter((r) => r === 'contrária').length;

  let veredito;
  if (contrarias === 2) {
    veredito = `${center.name} sai mal dignificada: os dois lados são contrários ao elemento dela, e a tradição diz que aí ela perde força — o assunto do meio não encontra apoio em nenhuma das duas casas vizinhas.`;
  } else if (contrarias === 1 && (iguais + amigas) === 1) {
    veredito = `${center.name} fica dividida: um lado sustenta o elemento dela e o outro é contrário, então a força dela depende de qual das duas casas você olhar.`;
  } else if (contrarias === 1) {
    veredito = `${center.name} sai enfraquecida por um dos lados, sem nada do outro que compense.`;
  } else if (iguais === 2) {
    veredito = `${center.name} sai muito reforçada: os três são do mesmo elemento, e a regra vale para os dois lados — reforça tanto o que a carta tem de bom quanto o que ela tem de duro.`;
  } else if (iguais + amigas === 2) {
    veredito = `${center.name} sai fortalecida: as duas vizinhas são do mesmo elemento ou de elemento amigo, e a tradição lê isso como energia que corre sem obstáculo.`;
  } else if (iguais + amigas === 1) {
    veredito = `${center.name} recebe apoio de um lado só; o outro é passivo, nem ajuda nem atrapalha.`;
  } else {
    veredito = `${center.name} fica em terreno passivo: nenhuma vizinha reforça nem contraria o elemento dela.`;
  }

  const vizinhas = [
    elL ? `${left.name} (${elL})` : `${left.name} (atribuição planetária, fora da regra)`,
    elR ? `${right.name} (${elR})` : `${right.name} (atribuição planetária, fora da regra)`,
  ].join(' e ');

  return `Dignidade elemental (regra da tríade do "Book T", S. L. MacGregor Mathers, fim do séc. XIX, publicada por Regardie em 1937-1940): numa tiragem de três, a carta do meio é lida através das duas ao lado. Aqui o meio é ${center.name}, de ${elC}, ladeado por ${vizinhas}. ${veredito}`;
}

// Nota de tradição da carta, para quem quiser ver a costura por baixo: a
// atribuição Golden Dawn (decanato/elemento composto/raiz) com o título
// tradicional, e a leitura do grau. Devolve null quando a carta não tem esse
// dado (os 22 Maiores, cuja atribuição já está em card.element).
export function getCardTraditionNote(card) {
  if (!card) return null;
  const bits = [];
  if (card.astro) bits.push(card.tituloGD ? `${card.tituloGD} (${card.astro})` : card.astro);
  if (card.grau) bits.push(card.grau);
  return bits.length ? bits.join(' · ') : null;
}

export { THEME_KEYS, POSITION_FRAMES, POSITION_KEYS };
export default getThemedMeaning;
