// lib/synastry.js
// SINASTRIA POR ASPECTO — o motor de compatibilidade entre dois signos.
//
// ===========================================================================
// O DEFEITO QUE ESTE ARQUIVO EXISTE PRA CORRIGIR (medido em 31/07/2026)
// ===========================================================================
// A versão anterior vivia em lib/signs.js, em duas tabelas de 10 entradas
// chaveadas só pelo PAR DE ELEMENTOS (`fogo+água`, `ar+ar`…). Consequências
// medidas, rodando as 144 combinações:
//
//   • 144 pares colapsavam em 10 textos e 10 notas — Áries+Leão, Áries+Sagitário
//     e Leão+Sagitário recebiam a MESMA frase, palavra por palavra;
//   • a nota mínima era 74 e a máxima 92, média 83,5. ZERO pares abaixo de 70.
//     Todo mundo combinava com todo mundo, e num app de astrologia isso não é
//     gentileza: é o usuário percebendo que a conta não existe;
//   • distância entre os signos — que é o ÚNICO dado que a tradição usa pra
//     falar de afinidade — não entrava na conta em lugar nenhum. Áries+Câncer
//     (quadratura, que Ptolomeu chama desarmônica) e Áries+Escorpião (aversão,
//     que ele chama "disjunta e alheia") recebiam os dois 74, porque os dois
//     são "fogo+água";
//   • `PCT[key] || 82` tinha um fallback inalcançável — as 10 chaves sempre
//     existiam —, o que escondia que o domínio da função era de 10 valores.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string daqui
// ===========================================================================
// (mesma disciplina de lib/zodiacBody.js e lib/grounding.js)
//
// 1. TRADIÇÃO COM FONTE. Toda afirmação sobre o que "a tradição diz" carrega o
//    capítulo. O verbatim inglês de Robbins (1940) fica SEM TRADUÇÃO, como o
//    latim de Manílio em lib/zodiacBody.js — traduzir citação é falsificá-la.
//
// 2. NUNCA DECRETAR DESTINO. A tradição descreve a NATUREZA do encontro, não o
//    desfecho. PROIBIDO: "vocês não vão dar certo", "essa relação acaba",
//    "termine", "procure outro", qualquer verbo no futuro sobre o casal, e
//    qualquer imperativo que decida pela pessoa. O próprio Ptolomeu, no mesmo
//    capítulo em que põe quadratura e oposição entre as posições de separação,
//    registra a união difícil que NÃO termina — ver VERBATIM.modificador.
//
// 3. INCISIVO NÃO É ASSUSTADOR. O modelo é o Cinco de Copas de Waite: nomeia a
//    perda ("é uma carta de perda") e ancora o que resta num FATO da imagem
//    ("três foram levadas, duas ficaram") — nunca num chavão de consolo. Aqui o
//    fato é geométrico: elemento, qualidade compartilhada, modalidade, eixo.
//
// 4. NENHUMA ALEGAÇÃO DE SAÚDE. Sem exceção, e sem metáfora. Nada de "cura",
//    "faz bem", "alivia", "energia que sara". Astrologia de relação descreve
//    relação.
//
// 5. NÃO INVENTAR TRADIÇÃO. O que é leitura do app vem rotulado como leitura do
//    app. O que a pesquisa não achou está em NAO_ACHADO e continua não achado —
//    não completar a lacuna com o que circula por aí.
//
// test/synastry.test.js segura tudo isso e falha o build. É de propósito.
// ===========================================================================
//
// ===========================================================================
// POR QUE EXISTE UMA NOTA, SE A NOTA NÃO É TRADIÇÃO
// ===========================================================================
// A pesquisa é categórica: NÃO existe percentual de compatibilidade em nenhuma
// fonte antiga, medieval ou renascentista. Ptolomeu dá CATEGORIAS qualitativas
// (harmônico, desarmônico, disjunto, duradouro, brigado) e nunca um número. O
// único sistema de pontuação realmente tradicional é o das dignidades
// essenciais e a tabela de fortitudes de Lilly (Christian Astrology, 1647,
// de +38 a −38) — e ele mede a FORÇA DE UM PLANETA numa carta, não a afinidade
// entre duas pessoas. Nem Linda Goodman, que popularizou a compatibilidade por
// signo solar em 1968/1978, usa nota: ela escreve em prosa. Quem converteu isso
// em 0–100% é lacuna não fechada (ver NAO_ACHADO).
//
// A DECISÃO, e o motivo dela: a CATEGORIA vira o resultado principal — é ela
// que aparece grande na tela e é ela que tem fonte. O número continua existindo
// como ÍNDICE DO APP, derivado do aspecto, declarado como tal em NOTA_INDICE, e
// exibido em segundo plano. Três razões:
//
//   (a) A reclamação do dono não é "tem número", é "todo mundo combina". Um
//       número que discrimina de verdade (16 na aversão, 92 no trígono) resolve
//       exatamente isso, e mantém uma ordem que a tela já sabe desenhar.
//   (b) `compatPercent()` é lido por três telas (Compatibilidade, Home, Quiz).
//       Arrancar o número seria uma cirurgia grande pra ganhar menos do que
//       renomeá-lo honestamente.
//   (c) A própria pesquisa autoriza esta saída, e só esta: "Se o produto exigir
//       um número, ele precisa ser apresentado como índice do app derivado do
//       aspecto, não como medida da tradição."
//
// O que NÃO é aceitável é o que existia antes: um número sem origem declarada,
// apresentado como se fosse medida de alguma coisa.
// ===========================================================================
//
// ===========================================================================
// DE ONDE SAI CADA NÚMERO — duas camadas, e elas não se misturam
// ===========================================================================
// CAMADA 1 — A CATEGORIA. Tem fonte antiga e não é opinião de ninguém:
//   trígono e sextil ......... HARMÔNICOS      (Tetrabiblos I.13, verbatim)
//   quadratura e oposição .... DESARMÔNICOS    (Tetrabiblos I.13, verbatim)
//   aversão (1 e 5 signos) ... SEM ASPECTO     (Tetrabiblos I.16, verbatim)
//   mesmo signo .............. CO-PRESENÇA     (não é aspecto: Ptolomeu enumera
//                                               quatro, e conjunção não está)
//
// CAMADA 2 — A ORDEM DENTRO DA ESCALA. É DO APP, sobre fatos verificáveis, e
// está dita como do app em NOTA_INDICE:
//   • trígono acima de sextil: mesmo elemento (duas qualidades em comum) contra
//     uma qualidade só. Fato aristotélico, não hierarquia inventada.
//   • oposição acima de quadratura: a oposição junta fogo-ar ou terra-água — os
//     MESMOS pares que o sextil, elementos que a tradição trata como
//     compatíveis. A quadratura nunca faz isso. Ptolomeu não gradua os dois
//     aspectos duros entre si; o critério é do app, sobre fato geométrico.
//   • quadratura em dois níveis: pela física de Aristóteles (Da Geração e
//     Corrupção II.3), fogo-água e ar-terra não compartilham NENHUMA qualidade
//     (contrários absolutos), enquanto fogo-terra compartilham o seco e ar-água
//     o úmido. A física é antiga; graduar quadraturas por ela é do app.
//   • co-presença no meio da escala, e de propósito: a geometria se cala, então
//     a nota se recusa a afirmar. Não é 50 por acaso — é o único valor que não
//     inventa informação.
//   • aversão no fundo: é o "não combina" REAL da tradição, e não a quadratura.
// ===========================================================================

// ---------------------------------------------------------------------------
// 1. AS QUALIDADES DOS ELEMENTOS (Aristóteles, Da Geração e Corrupção II.3)
// ---------------------------------------------------------------------------
// Cada corpo simples tem duas das quatro qualidades primárias, e os contrários
// não se acoplam — daí só existirem quatro combinações. As chaves casam byte a
// byte com o campo `element` de lib/signs.js, que é de onde os signos chegam.
export const ARISTOTELES_LOCUS = 'Aristóteles, Da Geração e Corrupção II.3';

export const QUALIDADES = {
  fogo: ['quente', 'seco'],
  ar: ['quente', 'úmido'],
  água: ['frio', 'úmido'],
  terra: ['frio', 'seco'],
};

const ARTIGO = { fogo: 'o fogo', ar: 'o ar', água: 'a água', terra: 'a terra' };

// A qualidade que dois elementos têm em comum. Vazio = contrários absolutos
// (fogo-água e ar-terra são os únicos dois casos).
export function qualidadesEmComum(elementoA, elementoB) {
  const a = QUALIDADES[elementoA] || [];
  const b = QUALIDADES[elementoB] || [];
  return a.filter((q) => b.includes(q));
}

export function qualidadesFrase(elemento) {
  const q = QUALIDADES[elemento];
  return q ? `${q[0]} e ${q[1]}` : '';
}

// ---------------------------------------------------------------------------
// 2. AS MODALIDADES (Ptolomeu, Tetrabiblos I.11)
// ---------------------------------------------------------------------------
// Ptolomeu não fala em "modalidade": ele nomeia signos SOLSTICIAIS E
// EQUINOCIAIS, SÓLIDOS e BICORPÓREOS, e o critério dele é sazonal — o que o Sol
// faz com a estação quando entra em cada grupo. "Cardeal/fixo/mutável" é o nome
// posterior corrente para os mesmos três grupos, e a glosa abaixo fica presa à
// imagem SAZONAL da fonte, de propósito: descrever cardeal como "quem toma a
// iniciativa" e fixo como "quem é teimoso" é psicologia do séc. XX, não
// Tetrabiblos, e este arquivo não faz esse salto.
//
// A modalidade é ARITMÉTICA no zodíaco (índice % 3) — por isso não há tabela
// aqui, e por isso não pode haver divergência com lib/signs.js.
export const PTOLOMEU_MODALIDADE_LOCUS = 'Ptolomeu, Tetrabiblos I.11';

export const MODALIDADES = [
  {
    id: 'cardeal',
    nome: 'cardeal',
    ptolomeu: 'solsticial ou equinocial',
    glosa: 'a estação vira quando o Sol entra neles',
  },
  {
    id: 'fixo',
    nome: 'fixo',
    ptolomeu: 'sólido',
    glosa: 'a estação já está firmada quando o Sol está neles',
  },
  {
    id: 'mutavel',
    nome: 'mutável',
    ptolomeu: 'bicorpóreo',
    glosa: 'ficam entre duas estações e participam das duas',
  },
];

export function modalidadePorIndice(indice) {
  return MODALIDADES[((indice % 3) + 3) % 3];
}

// ---------------------------------------------------------------------------
// 3. AS CITAÇÕES — verbatim de Robbins (Loeb/Harvard, 1940), SEM tradução
// ---------------------------------------------------------------------------
// Mesma regra do latim de Manílio em lib/zodiacBody.js. A tela mostra o inglês
// e, ao lado, o que ele estabelece — nunca uma "tradução" nossa passando por
// citação.
export const VERBATIM = {
  quatroAspectos: {
    texto:
      'Of the parts of the zodiac those first are familiar one to another which are in aspect. These are the ones which are in opposition... those which are in trine... those which are said to be in quartile... and finally those that occupy the sextile position.',
    locus: 'Ptolomeu, Tetrabiblos I.13 (Dos aspectos dos signos), trad. Robbins, 1940',
  },
  harmonicos: {
    texto:
      'Of these aspects trine and sextile are called harmonious because they are composed of signs of the same kind, either entirely of feminine or entirely of masculine signs; while quartile and opposition are disharmonious because they are composed of signs of opposite kinds.',
    locus: 'Ptolomeu, Tetrabiblos I.13, trad. Robbins, 1940',
  },
  disjuntos: {
    texto:
      "'Disjunct' and 'alien' are the names applied to those divisions of the zodiac which have none whatever of the aforesaid familiarities with one another... they are found to be entirely without share in the four aforesaid aspects, opposition, trine, quartile, and sextile, and are either one or five signs apart; for those which are one sign apart are as it were averted from one another...",
    locus: 'Ptolomeu, Tetrabiblos I.16 (Dos signos disjuntos), trad. Robbins, 1940',
  },
  duradouro: {
    texto:
      "Marriages for the most part are lasting when in both the genitures the luminaries happen to be in harmonious aspect, that is, in trine or in sextile with one another, and particularly when this comes about by exchange, and even more when the husband's moon is in such aspect with the wife's sun.",
    locus: 'Ptolomeu, Tetrabiblos IV.5 (Do casamento), trad. Robbins, 1940',
  },
  separacao: {
    texto:
      'Divorces on slight pretexts and complete alienations occur when the aforesaid positions of the luminaries are in disjunct signs, or in opposition or in quartile.',
    locus: 'Ptolomeu, Tetrabiblos IV.5, trad. Robbins, 1940',
  },
  modificador: {
    texto:
      'When the luminaries are in inharmonious positions, the beneficent planets testifying to the luminaries do not completely terminate the marriages, but bring about renewals and recollections, which preserve kindness and affection.',
    locus: 'Ptolomeu, Tetrabiblos IV.5, trad. Robbins, 1940',
  },
};

// ---------------------------------------------------------------------------
// 4. A GEOMETRIA
// ---------------------------------------------------------------------------
// Distância em SIGNOS pelo caminho mais curto: 0 a 6. Aspecto por signo inteiro
// (whole sign), que é como Ptolomeu raciocina em I.13 — ele conta signos, não
// graus, e é por isso que o app pode falar de aspecto tendo só o signo solar.
export function distanciaEmSignos(indiceA, indiceB) {
  const d = (((indiceB - indiceA) % 12) + 12) % 12;
  return d > 6 ? 12 - d : d;
}

export function grausDoAspecto(distancia) {
  return distancia * 30;
}

// distância (0-6) → identidade do aspecto. Repare no 1 e no 5: os dois são
// aversão, e é essa a única leitura fiel de I.16 ("either one or five signs
// apart"). O 0 NÃO é conjunção: Ptolomeu enumera quatro aspectos e conjunção
// não está entre eles — signos no mesmo lugar não se olham, estão juntos.
const ASPECTO_POR_DISTANCIA = ['copresenca', 'aversao', 'sextil', 'quadratura', 'trigono', 'aversao', 'oposicao'];

// ---------------------------------------------------------------------------
// 5. O ÍNDICE DO APP
// ---------------------------------------------------------------------------
// Ver o cabeçalho "DE ONDE SAI CADA NÚMERO". A camada 1 (categoria) tem fonte;
// esta escala é a camada 2 e é do app.
export const INDICE = {
  trigono: 92,
  sextil: 78,
  copresenca: 50,
  oposicao: 54,
  quadraturaUmaQualidade: 40,
  quadraturaContrarios: 28,
  aversao: 16,
};

// Categorias — o vocabulário da própria tradição, que é o que substitui a nota
// como resultado principal da tela.
export const CATEGORIAS = {
  harmonico: 'harmônico',
  desarmonico: 'desarmônico',
  semAspecto: 'sem aspecto',
  copresenca: 'co-presença',
};

// ---------------------------------------------------------------------------
// 6. AS RESSALVAS QUE ANDAM JUNTO COM TODA LEITURA
// ---------------------------------------------------------------------------
export const NOTA_INDICE =
  'A nota é do app, não da tradição. Ptolomeu dá categorias — harmônico, desarmônico, disjunto — e nunca uma porcentagem: não existe nota de compatibilidade entre signos em nenhuma fonte antiga, medieval ou renascentista. O único sistema de pontuação realmente tradicional é o das dignidades essenciais, com a tabela de fortitudes de William Lilly (Christian Astrology, Londres, 1647, de +38 a −38), e ele mede a força de um planeta numa carta, não a afinidade entre duas pessoas. O número aqui só ordena as categorias numa escala pra caberem numa tela. A categoria é o que tem fonte.';

export const RESSALVA_SIGNO_SOLAR =
  'Isto compara signo solar com signo solar, e esse recorte é de coluna de jornal: nasceu com R. H. Naylor no Sunday Express em 1930 e virou doze blocos por volta de 1937. A sinastria antiga é outra coisa — no capítulo do casamento, Ptolomeu compara o Sol e a Lua das duas cartas, com peso especial na Lua de um sobre o Sol do outro. O aspecto abaixo é real e a fonte dele está citada; o recorte é uma simplificação, e o app prefere dizer isso a fingir que não.';

// ---------------------------------------------------------------------------
// 7. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/grounding.js e NOT_VERIFIED em
// lib/zodiacBody.js: dizer que não se achou impede que a próxima pessoa a
// editar preencha a lacuna com a versão que circula por aí.
export const NAO_ACHADO = [
  {
    id: 'percentual',
    texto:
      'Quem, quando e onde converteu as categorias de Ptolomeu numa nota de 0 a 100%. Não achamos e não completamos a lacuna. O que dá pra afirmar é o negativo: o percentual não está em Ptolomeu, não está na astrologia tradicional e nem sequer está em Linda Goodman, que escreve em prosa, signo por signo.',
  },
  {
    id: 'regentesInimigos',
    texto:
      'Fonte ocidental antiga dizendo que signo regido por Marte não combina com signo regido por Vênus. Tabelas de amizade e inimizade entre planetas existem (al-Biruni, 1029; e arranjos que divergem entre si em Lilly, Ramesey, Coley e Raphael), mas tratam planeta com planeta e não são aplicadas a casais — e o próprio Ptolomeu contraria o clichê, registrando que Saturno com Vênus produz uniões estáveis. Por isso regência de planeta NÃO entra nesta conta.',
  },
  {
    id: 'graduacaoQuadraturas',
    texto:
      'Texto antigo que gradue uma quadratura como pior que outra. A física dos elementos de Aristóteles é antiga e verificável, e é dela que sai a distinção entre quadratura de contrários absolutos e quadratura que compartilha uma qualidade — mas o uso dela para ordenar quadraturas é leitura deste app, não citação.',
  },
  {
    id: 'firmicus',
    texto:
      'A passagem verbatim de Firmicus Materno (Mathesis, séc. IV) sobre o sétimo lugar como casa do casamento. A atribuição é consenso na astrologia helenística e por isso é citada; a linha exata não foi conferida no original.',
  },
  {
    id: 'tomDeVoz',
    texto:
      'Qualquer prescrição antiga sobre o TOM de uma leitura — direto, ambíguo, aberto. O tom deste app não se justifica pela antiguidade: ele imita o registro seco das fontes e segue ética contemporânea de leitor, que é contemporânea mesmo.',
  },
];

export const FONTES = [
  'Ptolomeu, Tetrabiblos I.13, Dos aspectos dos signos (trad. F. E. Robbins, Loeb/Harvard, 1940) — os quatro aspectos; trígono e sextil harmônicos, quadratura e oposição desarmônicas — https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Ptolemy/Tetrabiblos/1B*.html',
  'Ptolomeu, Tetrabiblos I.16, Dos signos disjuntos — aversão a 1 e 5 signos: sem nenhuma familiaridade, "disjunct and alien"',
  'Ptolomeu, Tetrabiblos I.11 — signos solsticiais e equinociais, sólidos e bicorpóreos (o que hoje se chama modalidade)',
  'Ptolomeu, Tetrabiblos IV.5, Do casamento — a sinastria antiga compara os luminares das duas cartas; e o modificador que impede o determinismo — https://www.skyscript.co.uk/tet4.html',
  'Aristóteles, Da Geração e Corrupção II.3 — quente, frio, seco e úmido: as qualidades dos quatro elementos — https://sacred-texts.com/cla/ari/ogc/ogc13.htm',
  'Julius Firmicus Maternus, Mathesis, séc. IV — o sétimo lugar (o Descendente) como lugar da união (atribuição consensual; passagem não conferida verbatim)',
  'William Lilly, Christian Astrology, Londres, 1647 — dignidades essenciais e a tabela de fortitudes (+38 a −38): o único sistema de pontuação realmente tradicional, e ele não mede compatibilidade',
  'R. H. Naylor, Sunday Express, 24/08/1930 — o nascimento do horóscopo por signo solar na imprensa — https://en.wikipedia.org/wiki/R._H._Naylor',
  'Linda Goodman, Sun Signs (1968) e Love Signs (1978) — a popularização da compatibilidade por signo solar, em prosa e sem percentuais',
  'Nicholas Campion, A History of Western Astrology, vol. II, Continuum, 2009 — cap. sobre o séc. XX, a psicologia e a imprensa popular',
];

// ---------------------------------------------------------------------------
// 8. A LEITURA
// ---------------------------------------------------------------------------
// Cada aspecto tem seu próprio construtor, e cada construtor monta a frase com
// os FATOS DAQUELE PAR: os dois elementos pelo nome, as qualidades de cada um,
// a qualidade que compartilham (ou a ausência dela), as duas modalidades, o
// eixo quando é oposição, a distância exata quando é aversão. É de propósito
// que não exista um molde único com o miolo trocado — foi exatamente esse o
// defeito que o dono apontou no Tarô, e ele vale igual aqui.
//
// `sa` e `sb` são { name, element, emoji, index }.

function ctx(sa, sb) {
  const modA = modalidadePorIndice(sa.index);
  const modB = modalidadePorIndice(sb.index);
  const comum = qualidadesEmComum(sa.element, sb.element);
  return {
    A: sa.name,
    B: sb.name,
    elemA: sa.element,
    elemB: sb.element,
    artA: ARTIGO[sa.element],
    artB: ARTIGO[sb.element],
    qA: qualidadesFrase(sa.element),
    qB: qualidadesFrase(sb.element),
    modA,
    modB,
    comum,
  };
}

function lerTrigono(sa, sb) {
  const c = ctx(sa, sb);
  return {
    aspecto: 'Trígono',
    natureza: 'afinidade por identidade',
    categoria: CATEGORIAS.harmonico,
    indice: INDICE.trigono,
    texto:
      `Trígono: quatro signos de distância, 120 graus — o mais harmônico dos quatro aspectos que Ptolomeu enumera. ` +
      `${c.A} e ${c.B} são do mesmo elemento, ${c.elemA}, e portanto das mesmas duas qualidades: ${c.qA}. ` +
      `Não há tradução a fazer entre vocês — o mesmo tipo de coisa move os dois. ` +
      `O que muda é a modalidade: ${c.A} é ${c.modA.nome} (${c.modA.glosa}) e ${c.B} é ${c.modB.nome} (${c.modB.glosa}). ` +
      `Muda a hora de entrar, não o que importa.`,
    forte:
      `Reconhecimento sem esforço: ${c.elemA} lendo ${c.elemA}. Vocês não gastam energia explicando o óbvio um pro outro, ` +
      `e no capítulo do casamento é justamente o trígono entre os luminares que Ptolomeu associa às uniões que duram.`,
    cuidado:
      `O que a geometria não entrega aqui é atrito. Trígono descreve facilidade, e facilidade não empurra ninguém do lugar — ` +
      `o que precisar mudar entre ${c.A} e ${c.B} vai ter que partir de vocês, porque o aspecto não vai cobrar. ` +
      `(Esta última frase é leitura do app: Ptolomeu diz "harmônico" e para por aí.)`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.duradouro],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — trígono é harmônico; quatro signos, 120 graus',
      'Ptolomeu, Tetrabiblos IV.5 — luminares em trígono entre as duas cartas: uniões duradouras',
      ARISTOTELES_LOCUS + ' — as duas qualidades do elemento ' + c.elemA,
    ],
  };
}

function lerSextil(sa, sb) {
  const c = ctx(sa, sb);
  const q = c.comum[0];
  return {
    aspecto: 'Sextil',
    natureza: 'afinidade por uma qualidade em comum',
    categoria: CATEGORIAS.harmonico,
    indice: INDICE.sextil,
    texto:
      `Sextil: dois signos de distância, 60 graus — harmônico, e o menor dos dois harmônicos. ` +
      `${c.A} é ${c.qA}; ${c.B} é ${c.qB}. O que os dois têm em comum é uma qualidade só: o ${q}. ` +
      `Não é a identidade do trígono, é meio caminho — e meio caminho, na conta de Ptolomeu, já basta pra dois signos se verem: ` +
      `${c.artA} e ${c.artB} são da mesma polaridade. As modalidades divergem (${c.A} ${c.modA.nome}, ${c.B} ${c.modB.nome}), então o tempo de cada um é diferente.`,
    forte:
      `Um ponto de contato real — o ${q} — e nenhuma obrigação de ser igual no resto. ` +
      `Ptolomeu põe o sextil ao lado do trígono entre os aspectos de união duradoura.`,
    cuidado:
      `Sextil é contato, não fusão: o encaixe é de uma qualidade só, e as outras duas ficam de fora da conta. ` +
      `Onde ${c.A} é ${c.qA.split(' e ')[1]} e ${c.B} não é, ninguém está errado — está apenas em outro elemento.`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.duradouro],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — sextil é harmônico; dois signos, 60 graus',
      'Ptolomeu, Tetrabiblos IV.5 — luminares em sextil: uniões duradouras',
      ARISTOTELES_LOCUS + ` — ${c.elemA} e ${c.elemB} compartilham o ${q}`,
    ],
  };
}

function lerQuadratura(sa, sb) {
  const c = ctx(sa, sb);
  const contrarios = c.comum.length === 0;
  const mod = c.modA; // quadratura é sempre a MESMA modalidade — aritmética do zodíaco
  const abertura = contrarios
    ? `${c.A} é ${c.qA}; ${c.B} é ${c.qB}: nenhuma qualidade em comum. ` +
      `Pela física de Aristóteles, ${c.artA} e ${c.artB} são contrários absolutos — é o caso mais duro que uma quadratura pode ter.`
    : `${c.A} é ${c.qA}; ${c.B} é ${c.qB}. Os dois ainda compartilham o ${c.comum[0]} — um fio em comum, e um só. ` +
      `Não é o pior caso da própria quadratura: contrários absolutos, pela física de Aristóteles, seriam elementos sem nenhuma qualidade em comum.`;
  return {
    aspecto: 'Quadratura',
    natureza: contrarios ? 'atrito entre contrários absolutos' : 'atrito com um fio em comum',
    categoria: CATEGORIAS.desarmonico,
    indice: contrarios ? INDICE.quadraturaContrarios : INDICE.quadraturaUmaQualidade,
    texto:
      `Quadratura: três signos de distância, 90 graus. Ptolomeu a lista entre os aspectos DESARMÔNICOS, e dá o motivo — ` +
      `é composta de "signos de tipos opostos". ${abertura} ` +
      `E os dois são ${mod.nome} (${mod.ptolomeu} em Ptolomeu: ${mod.glosa}): mesmo tempo interno, alvos diferentes. ` +
      `Vocês disputam o mesmo território.`,
    forte:
      `Vocês se veem. Quadratura é aspecto — os dois lados se enxergam e se reconhecem, e é exatamente por isso que conseguem brigar, ` +
      `se irritar e eventualmente se acertar. A aversão, que é o "não combina" de verdade da tradição, não permite nem a briga.`,
    cuidado:
      `Aqui dói, e a tradição não finge que não: no capítulo do casamento, Ptolomeu põe a quadratura ao lado da oposição e dos signos disjuntos ` +
      `entre as posições em que ocorrem separações. E, no MESMO capítulo, ele nega o determinismo — com os benéficos testemunhando os luminares, ` +
      `a união em posição desarmônica não termina, e traz "recomeços e lembranças, que preservam gentileza e afeto". ` +
      `Aspecto tenso descreve por que a relação dói onde dói. Não decide o desfecho, e este app não decide por você.`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — quadratura é desarmônica: "signos de tipos opostos"',
      'Ptolomeu, Tetrabiblos IV.5 — separação; e o modificador que impede a sentença',
      ARISTOTELES_LOCUS +
        (contrarios
          ? ` — ${c.elemA} e ${c.elemB} não compartilham nenhuma qualidade`
          : ` — ${c.elemA} e ${c.elemB} compartilham o ${c.comum[0]}`),
      'Ptolomeu, Tetrabiblos I.11 — quadratura cai sempre entre signos da mesma modalidade (aqui, ' + mod.nome + ')',
    ],
  };
}

function lerOposicao(sa, sb) {
  const c = ctx(sa, sb);
  const q = c.comum[0];
  const mod = c.modA; // oposição também é sempre a mesma modalidade
  return {
    aspecto: 'Oposição',
    natureza: 'eixo — o confronto que a tradição chama de lugar da união',
    categoria: CATEGORIAS.desarmonico,
    indice: INDICE.oposicao,
    texto:
      `Oposição: o eixo ${c.A}–${c.B}, seis signos, 180 graus. Ptolomeu a lista entre os desarmônicos, e a tradição a atribui a Saturno. ` +
      `Agora repare no que ela NÃO é: ${c.artA} e ${c.artB} compartilham o ${q} — elementalmente, signos opostos combinam, ` +
      `e são exatamente os mesmos pares de elemento que o sextil junta. A dureza da oposição não é de elemento, é de posição. ` +
      `E o sétimo signo a partir do seu é, desde a astrologia helenística, o lugar da união: o signo que mais te confronta é literalmente o que rege a parceria. ` +
      `Os dois são ${mod.nome} (${mod.glosa}) — dois polos com o mesmo tempo interno.`,
    forte:
      `O que falta em um sobra no outro, e não por acaso: é o mesmo eixo visto dos dois lados. ` +
      `Nenhum outro par de signos se completa por um motivo tão estrutural quanto este.`,
    cuidado:
      `Encontro de iguais em polos contrários: vocês se completam e se enfrentam pelo mesmo motivo, e o motivo não vai embora. ` +
      `Ptolomeu põe a oposição entre as posições de separação — e, na mesma página, registra que benéficos testemunhando os luminares ` +
      `trazem "recomeços e lembranças, que preservam gentileza e afeto". Descrição da natureza do encontro, não do fim dele.`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — oposição é desarmônica; seis signos, 180 graus',
      'Ptolomeu, Tetrabiblos IV.5 — separação; e o modificador que impede a sentença',
      ARISTOTELES_LOCUS + ` — ${c.elemA} e ${c.elemB} compartilham o ${q}: elementos compatíveis`,
      'Julius Firmicus Maternus, Mathesis, séc. IV — o sétimo lugar como lugar da união (atribuição consensual; verbatim não conferido)',
    ],
  };
}

function lerAversao(sa, sb, distancia) {
  const c = ctx(sa, sb);
  const umSigno = distancia === 1;
  const abertura = umSigno
    ? `${c.A} e ${c.B} estão a UM signo de distância, 30 graus. Ptolomeu descreve esses signos como estando "como que desviados um do outro".`
    : `${c.A} e ${c.B} estão a CINCO signos de distância, 150 graus. Ptolomeu os põe fora dos quatro aspectos, junto com os vizinhos de 30 graus.`;
  return {
    aspecto: 'Aversão',
    natureza: umSigno ? 'signos disjuntos — vizinhos que não se veem' : 'signos disjuntos — distantes que não se veem',
    categoria: CATEGORIAS.semAspecto,
    indice: INDICE.aversao,
    texto:
      `${abertura} Isto NÃO é um aspecto: ele chama esses signos de "disjuntos e alheios", e diz que não têm familiaridade nenhuma um com o outro. ` +
      `O critério é óptico — signos em aspecto se veem; estes não se veem. ` +
      `E não há nada nos dois eixos pra segurar: ${c.A} é ${c.elemA} ${c.modA.nome}, ${c.B} é ${c.elemB} ${c.modB.nome}. ` +
      `Nem elemento nem modalidade em comum. Este é o "não combina" da tradição — e não a quadratura, como se costuma dizer por aí.`,
    forte:
      `Nada aqui é herdado. Se existe reconhecimento entre ${c.A} e ${c.B}, ele foi construído por vocês dois — ` +
      `a geometria não tem como levar crédito por isso, e a rigor nem tem o que dizer.`,
    cuidado:
      `Aversão não é briga: é ausência de reconhecimento automático, dois signos que não se registram. É o ponto de partida mais desfavorável da tradição, ` +
      `e é também o ponto em que a leitura por signo solar mostra o seu limite — a sinastria de Ptolomeu não compara signo solar com signo solar, ` +
      `compara o Sol e a Lua das duas cartas inteiras. Isto descreve o começo, não o fim: nenhum texto antigo decreta o desfecho de nada a partir de dois signos.`,
    verbatins: [VERBATIM.disjuntos, VERBATIM.separacao],
    fontes: [
      'Ptolomeu, Tetrabiblos I.16 — signos disjuntos e alheios, a um ou a cinco signos de distância',
      'Ptolomeu, Tetrabiblos IV.5 — luminares em signos disjuntos entre as posições de separação',
      ARISTOTELES_LOCUS + ` — ${c.elemA} e ${c.elemB}: elementos distintos`,
      'Ptolomeu, Tetrabiblos I.11 — modalidades distintas (' + c.modA.nome + ' e ' + c.modB.nome + ')',
    ],
  };
}

function lerCopresenca(sa) {
  const mod = modalidadePorIndice(sa.index);
  const elem = sa.element;
  return {
    aspecto: 'Co-presença',
    natureza: 'mesmo signo — a geometria se cala',
    categoria: CATEGORIAS.copresenca,
    indice: INDICE.copresenca,
    texto:
      `Mesmo signo. E aqui a tradição diz uma coisa que este app faz questão de repetir em voz alta: isto NÃO é um aspecto. ` +
      `Ptolomeu enumera quatro — oposição, trígono, quadratura e sextil — e repete a lista adiante; conjunção não está nela. ` +
      `Signos no mesmo lugar não se olham: estão juntos. ${sa.name} com ${sa.name} é ${elem} sobre ${elem}, ${qualidadesFrase(elem)} em dobro, ` +
      `os dois ${mod.nome} (${mod.ptolomeu} em Ptolomeu: ${mod.glosa}). Nenhum contraste pra medir. ` +
      `O efeito, na tradição, depende inteiramente de QUEM está junto — não da geometria.`,
    forte:
      `Vocês partem do mesmo lugar: mesmo elemento, mesmas duas qualidades, mesma modalidade. ` +
      `Não há mal-entendido de temperamento a traduzir entre um e outro.`,
    cuidado:
      `Nem espelho a segurar: o que um exagera, o outro exagera igual, e não há um terceiro ponto de vista dentro do par. ` +
      `O índice ao lado fica no meio da escala de propósito — é o único número honesto quando a geometria não tem nada a dizer sobre vocês. ` +
      `Aqui o app se recusa a afirmar.`,
    verbatins: [VERBATIM.quatroAspectos, VERBATIM.disjuntos],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — a enumeração dos quatro aspectos; conjunção não está entre eles',
      'Ptolomeu, Tetrabiblos I.16 — "the four aforesaid aspects, opposition, trine, quartile, and sextile"',
      ARISTOTELES_LOCUS + ` — as duas qualidades do elemento ${elem}`,
      'Ptolomeu, Tetrabiblos I.11 — modalidade ' + mod.nome,
    ],
  };
}

// ---------------------------------------------------------------------------
// 9. A PORTA DE ENTRADA
// ---------------------------------------------------------------------------
// Recebe os dois registros de signo já resolvidos ({ name, element, emoji,
// index }) e devolve a leitura inteira. Puro, síncrono e determinístico —
// mesma disciplina do resto de lib/signs.js.
export function sinastria(sa, sb) {
  if (!sa || !sb || typeof sa.index !== 'number' || typeof sb.index !== 'number') return null;
  const distancia = distanciaEmSignos(sa.index, sb.index);
  const id = ASPECTO_POR_DISTANCIA[distancia];

  let leitura;
  if (id === 'trigono') leitura = lerTrigono(sa, sb);
  else if (id === 'sextil') leitura = lerSextil(sa, sb);
  else if (id === 'quadratura') leitura = lerQuadratura(sa, sb);
  else if (id === 'oposicao') leitura = lerOposicao(sa, sb);
  else if (id === 'aversao') leitura = lerAversao(sa, sb, distancia);
  else leitura = lerCopresenca(sa);

  const modA = modalidadePorIndice(sa.index);
  const modB = modalidadePorIndice(sb.index);

  return {
    ...leitura,
    id,
    distancia,
    graus: grausDoAspecto(distancia),
    elementoA: sa.element,
    elementoB: sb.element,
    modalidadeA: modA.nome,
    modalidadeB: modB.nome,
    qualidadesA: QUALIDADES[sa.element],
    qualidadesB: QUALIDADES[sb.element],
    qualidadesEmComum: qualidadesEmComum(sa.element, sb.element),
    notaIndice: NOTA_INDICE,
    ressalvaSignoSolar: RESSALVA_SIGNO_SOLAR,
  };
}
