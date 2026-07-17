// lib/tarotThemes.js
// Camada de interpretação temática para o Tarô por Tema.
//
// NÃO redefine as cartas (isso continua em lib/tarotDeck.js). Em vez disso,
// pega a carta REAL sorteada (keywords, uprightMeaning, element) e a lê através
// da lente do tema escolhido (Amor, Carreira, Dinheiro, Energia, Saúde), usando
// um pequeno conjunto de templates por categoria de carta (4 naipes + arcanos
// maiores) x 5 temas = 25 templates. Isso garante que:
//   1) qualquer carta do baralho de 78 pode sair em qualquer tema (sem filtrar
//      o sorteio por tema — o sorteio continua no baralho completo);
//   2) o texto exibido muda de forma real conforme o tema, mas continua
//      ancorado no significado tradicional daquela carta específica
//      (keywords + uprightMeaning + elemento), sem virar "genérico".

const THEME_KEYS = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];

// Categoria de uma carta: naipe (paus/copas/espadas/ouros) ou 'maior' para
// os Arcanos Maiores (que não têm suit).
export function getCardCategory(card) {
  return card.suit || 'maior';
}

// 5 categorias x 4 temas = 20 templates curtos. Cada um usa placeholders que
// são preenchidos com dados reais da carta sorteada: {name}, {keyword},
// {keyword2}, {element} e {meaning} (a uprightMeaning original, com a
// primeira letra em minúscula para encaixar no meio da frase).
const THEME_TEMPLATES = {
  paus: {
    Amor: 'No amor, {name} traz para a relação a energia direta do naipe de Paus: {meaning} Deixe {keyword} falar mais alto, com a coragem de {keyword2} guiando o próximo passo do coração.',
    Carreira: 'Na carreira, {name} acende a ambição do naipe de Paus: {meaning} É hora de agir com {keyword} e transformar {keyword2} em movimento profissional concreto.',
    Dinheiro: 'Nas finanças, {name} funciona como um chamado à ação do naipe de Paus: {meaning} A energia de {keyword} pede iniciativa, mas cuidado para {keyword2} não virar impulsividade com o dinheiro.',
    Energia: 'Sua energia vital hoje pulsa como {name}: {meaning} Use esse impulso do elemento {element} e a força de {keyword} para não deixar {keyword2} se apagar.',
    Saúde: 'Na saúde, {name} pede movimento, no espírito do naipe de Paus: {meaning} Canalize {keyword} em disposição física real, sem deixar {keyword2} virar exaustão.',
  },
  copas: {
    Amor: 'No amor, {name} fala direto ao coração pelo naipe de Copas: {meaning} Deixe {keyword} guiar a relação, com a sensibilidade de {keyword2} em primeiro plano.',
    Carreira: 'Na carreira, {name} lembra que Copas também tem lugar no trabalho: {meaning} Cultive {keyword} nas relações profissionais e não subestime o peso de {keyword2} nas decisões.',
    Dinheiro: 'Nas finanças, {name} traduz o naipe de Copas em decisões guiadas por valores, não só números: {meaning} Cuidado para {keyword} não virar gasto por impulso ligado a {keyword2}.',
    Energia: 'Sua energia hoje é emocional, como {name}: {meaning} Respeite {keyword} e deixe o elemento {element} fluir, sem represar {keyword2}.',
    Saúde: 'Na saúde, {name} fala do equilíbrio emocional que sustenta o corpo, pelo naipe de Copas: {meaning} Cuide de {keyword} como parte real do autocuidado, sem reprimir {keyword2}.',
  },
  espadas: {
    Amor: 'No amor, {name} traz a clareza cortante do naipe de Espadas: {meaning} É hora de falar sobre {keyword} sem rodeios, mesmo que {keyword2} doa um pouco.',
    Carreira: 'Na carreira, {name} pede estratégia mental do naipe de Espadas: {meaning} Use {keyword} para decidir com a razão, e não deixe {keyword2} nublar o julgamento profissional.',
    Dinheiro: 'Nas finanças, {name} exige a análise fria do naipe de Espadas: {meaning} Avalie {keyword} com lógica antes de qualquer movimento, prestando atenção em {keyword2}.',
    Energia: 'Sua energia mental hoje reflete {name}: {meaning} Canalize {keyword} do elemento {element} para pensar com clareza, evitando o excesso de {keyword2}.',
    Saúde: 'Na saúde, {name} aponta pra clareza mental como parte real do bem-estar, no naipe de Espadas: {meaning} Use {keyword} pra reduzir o excesso de {keyword2} que pesa na cabeça.',
  },
  ouros: {
    Amor: 'No amor, {name} traduz sentimento em gesto concreto, ao estilo do naipe de Ouros: {meaning} Mostre {keyword} através de ações práticas, com {keyword2} como prova real.',
    Carreira: 'Na carreira, {name} fala de construção sólida pelo naipe de Ouros: {meaning} Invista em {keyword} e em {keyword2} para colher resultados materiais duradouros.',
    Dinheiro: 'Nas finanças, {name} é território natural do naipe de Ouros: {meaning} Trabalhe {keyword} com os pés no chão, fortalecendo {keyword2} na sua vida material.',
    Energia: 'Sua energia física hoje ecoa {name}: {meaning} Aterre-se no elemento {element} através de {keyword} e cuide do corpo com {keyword2}.',
    Saúde: 'Na saúde, {name} fala diretamente do corpo físico, território do naipe de Ouros: {meaning} Invista em {keyword} como hábito concreto de cuidado, sustentando {keyword2}.',
  },
  maior: {
    Amor: 'No amor, {name} traz uma lição maior para a relação: {meaning} Encare {keyword} como um marco importante da sua história afetiva, atento a {keyword2}.',
    Carreira: 'Na carreira, {name} sinaliza um capítulo decisivo: {meaning} O tema de {keyword2} pode redefinir os rumos profissionais agora, puxado por {keyword}.',
    Dinheiro: 'Nas finanças, {name} representa uma virada significativa: {meaning} O aspecto de {keyword} está diretamente ligado ao seu momento material, com {keyword2} como pano de fundo.',
    Energia: 'Sua energia vital hoje carrega o peso simbólico de {name}: {meaning} Deixe {keyword} orientar os próximos passos, com mais consciência sobre {keyword2}.',
    Saúde: 'Na saúde, {name} traz uma lição maior sobre corpo e mente: {meaning} Encare {keyword} como um chamado de atenção real, atento a {keyword2}.',
  },
};

function lowerFirst(text) {
  if (!text) return '';
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function fillTemplate(template, card, isReversed) {
  const keyword = card.keywords?.[0] || 'transformação';
  const keyword2 = card.keywords?.[1] || keyword;
  return template
    .replace(/{name}/g, card.name)
    .replace(/{keyword2}/g, keyword2)
    .replace(/{keyword}/g, keyword)
    .replace(/{element}/g, card.element || 'espírito')
    .replace(/{meaning}/g, lowerFirst(isReversed ? card.reversedMeaning : card.uprightMeaning));
}

// Retorna o texto de interpretação da carta, lido através da lente do tema.
// themeKey deve ser um de THEME_KEYS ('Amor' | 'Carreira' | 'Dinheiro' | 'Energia').
export function getThemedMeaning(card, themeKey, isReversed = false) {
  const category = getCardCategory(card);
  const categoryTemplates = THEME_TEMPLATES[category] || THEME_TEMPLATES.maior;
  const template = categoryTemplates[themeKey] || categoryTemplates[THEME_KEYS[0]];
  return fillTemplate(template, card, isReversed);
}

export { THEME_KEYS };
export default getThemedMeaning;
