// lib/tarotThemes.js
// Camada de interpretação temática para o Tarô por Tema.
//
// NÃO redefine as cartas (isso continua em lib/tarotDeck.js). Pega a carta REAL
// sorteada e a lê através da lente do tema escolhido (Amor, Carreira, Dinheiro,
// Energia, Saúde).
//
// COMO O TEXTO É MONTADO (reescrito em 30/07/2026 depois da auditoria de
// fidelidade). Cada leitura tem quatro partes, e três delas são específicas
// DAQUELA carta:
//   1. moldura do tema  — 1 frase por (categoria de carta × tema). É a única
//      parte compartilhada. Nos Arcanos Maiores ela ainda varia por carta,
//      porque cita a atribuição astrológica de cada arcano.
//   2. a CENA da carta  — a imagem Rider-Waite-Smith, de onde a leitura
//      tradicional realmente sai. É isto que impede as 14 cartas de um naipe de
//      lerem com a mesma forma de frase (o efeito Barnum que a versão anterior
//      tinha por construção: 78 cartas colapsavam em 25 moldes).
//   3. o significado     — uprightMeaning ou reversedMeaning.
//   4. o CONSELHO da carta naquela orientação (card.conselho /
//      card.conselhoInvertido), escrito carta a carta na tradição.
//
// TRÊS ERROS QUE ISTO CORRIGE, e por quê:
//
// (a) CARTA INVERTIDA CONTRADITÓRIA. Antes, com isReversed=true só o
//     significado trocava; a frase de conselho continuava construída sobre
//     keywords[0]/[1], que são as palavras da leitura DIRETA. Saía "Cinco de
//     Copas invertida: ...disposição para seguir em frente. Deixe PERDA guiar a
//     relação, com a sensibilidade de LUTO em primeiro plano." Agora a inversão
//     é NOMEADA como a tradição a lê — a mesma energia bloqueada, em excesso ou
//     interiorizada — e o conselho vem do campo invertido da própria carta.
//
// (b) CONSELHO IMPERATIVO EM CARTA DURA. Antes o molde terminava sempre em
//     ordem positiva colada na keyword crua, então as cartas de advertência
//     mandavam a pessoa cultivar o próprio problema: "Invista em DIFICULDADE"
//     (Cinco de Ouros), "É hora de agir com SOBRECARGA" (Dez de Paus), "Use
//     APRISIONAMENTO para decidir" (Oito de Espadas). Essas cartas são
//     diagnóstico, nunca prescrição — o conselho agora vem de card.conselho,
//     que segue a tradição (Cinco de Ouros pede procurar o amparo que está
//     atrás do vitral; Dez de Paus pede POUSAR o fardo; Oito de Espadas pede
//     reconhecer que as cordas estão frouxas).
//
// (c) POSIÇÃO IGNORADA NA TIRAGEM DE TRÊS. A tiragem é Passado/Presente/Futuro
//     e o texto não sabia disso — os moldes de Energia cravavam "hoje" nas três
//     posições, e a carta do Futuro era enunciada como fato consumado. Agora
//     getThemedMeaning aceita `position` e a casa muda a leitura, com a terceira
//     tratada como vetor condicional, nunca como previsão.

const THEME_KEYS = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];

// Posições da tiragem de três cartas. A posição É parte do significado na
// leitura clássica: a mesma carta é raiz na primeira casa, dinâmica ativa na
// segunda e tendência na terceira. Sem isso não é uma tiragem de três cartas,
// são três cartas do dia empilhadas.
const POSITION_FRAMES = {
  Passado: ' Nesta primeira casa a carta é raiz: descreve o que já aconteceu e ainda sustenta a situação — não o que está por vir.',
  Presente: ' Na casa do meio é a dinâmica ativa: o que está em movimento agora, enquanto você lê.',
  Futuro: ' Na terceira casa isto é tendência, não fato: para onde a situação aponta se nada mudar. O tarô não prevê o que vai acontecer — desenha o vetor, e o vetor muda quando você muda.',
};

// Categoria de uma carta: naipe (paus/copas/espadas/ouros) ou 'maior' para
// os Arcanos Maiores (que não têm suit).
export function getCardCategory(card) {
  return card.suit || 'maior';
}

// 5 categorias × 5 temas = 25 molduras. Diferente da versão anterior, a moldura
// agora é SÓ a lente do tema (o território do naipe) — não carrega mais conselho
// nem imperativo. O conteúdo específico vem da cena, do significado e do
// conselho da carta.
const THEME_TEMPLATES = {
  paus: {
    Amor: 'No amor, {name} entra pelo fogo do naipe de Paus: desejo, iniciativa e o que move a relação para a frente.',
    Carreira: 'Na carreira, {name} acende a ambição do naipe de Paus: projeto, ímpeto e vontade de construir.',
    Dinheiro: 'Nas finanças, {name} chega como chamado à ação do naipe de Paus — aqui o dinheiro se move por iniciativa, e o risco é o impulso.',
    Energia: 'Sua energia vital pulsa como {name}, no fogo do naipe de Paus.',
    Saúde: 'Na saúde, {name} fala pelo naipe de Paus: corpo em movimento, disposição, e a linha fina entre vigor e exaustão.',
  },
  copas: {
    Amor: 'No amor, {name} fala pelo naipe de Copas: água, vínculo e o que se sente antes de conseguir explicar.',
    Carreira: 'Na carreira, {name} lembra que Copas também trabalha — o clima, as pessoas e o que você sente pelo que faz.',
    Dinheiro: 'Nas finanças, {name} traduz Copas em decisão guiada por valor afetivo, não só por número.',
    Energia: 'Sua energia aparece emocional, como {name}, na água do naipe de Copas.',
    Saúde: 'Na saúde, {name} trata do estado emocional que sustenta o corpo, pelo naipe de Copas.',
  },
  espadas: {
    Amor: 'No amor, {name} traz a lâmina do naipe de Espadas: o que precisa ser dito, e o que dói justamente por ser verdade.',
    Carreira: 'Na carreira, {name} pede a cabeça fria do naipe de Espadas: análise, estratégia e a conversa difícil.',
    Dinheiro: 'Nas finanças, {name} exige a análise seca do naipe de Espadas — o número olhado sem a história em volta.',
    Energia: 'Sua energia aparece mental, como {name}, no ar do naipe de Espadas.',
    Saúde: 'Na saúde, {name} aponta para a cabeça: no naipe de Espadas, sono, pensamento e ruído mental são parte do quadro.',
  },
  ouros: {
    Amor: 'No amor, {name} traduz sentimento em gesto concreto, no barro do naipe de Ouros.',
    Carreira: 'Na carreira, {name} fala de construção lenta pelo naipe de Ouros: ofício, prazo e resultado que se vê.',
    Dinheiro: 'Nas finanças, {name} está em casa — Ouros é o território da matéria.',
    Energia: 'Sua energia aparece física, como {name}, na terra do naipe de Ouros.',
    Saúde: 'Na saúde, {name} fala do corpo mesmo, território do naipe de Ouros: hábito, rotina e o que se sustenta no tempo.',
  },
  // Nos Maiores a moldura cita {element}, que nos 22 arcanos é a atribuição
  // astrológica tradicional (Golden Dawn/RWS) de cada carta — então nem esta
  // parte fica igual entre O Louco, A Torre e A Morte, como ficava antes.
  maior: {
    Amor: 'No amor, {name} entra como Arcano Maior, sob {element}: não é episódio de rotina, é o eixo da relação sendo mexido.',
    Carreira: 'Na carreira, {name} entra como Arcano Maior, sob {element}: o que está em jogo é o rumo, não a tarefa da semana.',
    Dinheiro: 'Nas finanças, {name} entra como Arcano Maior, sob {element}: mexe na sua relação com o dinheiro antes de mexer no saldo.',
    Energia: 'Sua energia carrega o peso de um Arcano Maior: {name}, sob {element}.',
    Saúde: 'Na saúde, {name} entra como Arcano Maior, sob {element}: corpo e mente lidos juntos, não em partes.',
  },
};

function lowerFirst(text) {
  if (!text) return '';
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function upperFirst(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function fillFrame(template, card) {
  return template
    .replace(/{name}/g, card.name)
    // Nos Maiores, {element} é nome próprio de planeta/signo ("Marte",
    // "Gêmeos") — guardado em minúsculas no dado, exibido capitalizado.
    .replace(/{element}/g, card.element ? upperFirst(card.element) : 'o próprio símbolo');
}

// Retorna o texto de interpretação da carta, lido através da lente do tema.
// - themeKey: um de THEME_KEYS ('Amor' | 'Carreira' | 'Dinheiro' | 'Energia' | 'Saúde')
// - isReversed: carta invertida
// - position: 'Passado' | 'Presente' | 'Futuro' (opcional). Quando ausente, a
//   leitura sai sem casa — é o comportamento de "carta do dia", e é por isso que
//   nenhuma moldura crava mais "hoje": não dá pra afirmar tempo sem saber a casa.
export function getThemedMeaning(card, themeKey, isReversed = false, position = null) {
  const category = getCardCategory(card);
  const categoryTemplates = THEME_TEMPLATES[category] || THEME_TEMPLATES.maior;
  const template = categoryTemplates[themeKey] || categoryTemplates[THEME_KEYS[0]];

  const parts = [fillFrame(template, card)];

  if (card.cena) parts.push(`Na carta, ${card.cena}.`);

  // keywords[0] é o EIXO da carta — em lib/tarotDeck.js a ordem foi corrigida
  // justamente porque é este índice que chega na tela (Os Enamorados agora abre
  // por "escolhas", não por "amor"; A Morte por "transformação", não por "fim").
  const eixo = card.keywords?.[0] || null;

  if (isReversed) {
    // A inversão reinterpreta o símbolo INTEIRO, e a tradição não a lê como
    // oposto simples. Nomear isso explicitamente é o que impede o texto de se
    // contradizer usando o vocabulário da carta direta.
    const lead = eixo
      ? `Invertida, ela não vira o oposto: a energia de ${eixo} aparece bloqueada, em excesso ou virada para dentro —`
      : 'Invertida, a mesma energia aparece bloqueada, em excesso ou virada para dentro —';
    parts.push(`${lead} ${lowerFirst(card.reversedMeaning)}`);
    if (card.conselhoInvertido) parts.push(card.conselhoInvertido);
  } else {
    parts.push(card.uprightMeaning);
    if (eixo) parts.push(`O eixo aqui é ${eixo}.`);
    if (card.conselho) parts.push(card.conselho);
  }

  let text = parts.join(' ');
  if (position && POSITION_FRAMES[position]) text += POSITION_FRAMES[position];
  return text;
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

export { THEME_KEYS, POSITION_FRAMES };
export default getThemedMeaning;
