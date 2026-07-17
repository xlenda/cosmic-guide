// lib/tarotDeck.js
// Baralho de Tarô completo Rider-Waite-Smith (78 cartas), em português.
// 22 Arcanos Maiores (0-21) + 56 Arcanos Menores (4 naipes x 14 cartas).
// Significados tradicionais/padrão (domínio público, esoterismo clássico) — uso de entretenimento.
//
// Cada carta: { id, name, arcana, suit, number, keywords, uprightMeaning, reversedMeaning, element, icon }
// - arcana: 'maior' | 'menor'
// - suit: null (maiores) | 'paus' | 'copas' | 'espadas' | 'ouros'
// - number: 0-21 para maiores; 1-14 para menores (1=Ás, 11=Valete, 12=Cavaleiro, 13=Rainha, 14=Rei)
// - element: elemento/planeta/signo tradicionalmente associado (Golden Dawn / RWS); null se não padronizado
// - icon: nome de glifo do @expo/vector-icons/Ionicons, para renderização na UI existente

// ---------------------------------------------------------------------------
// ARCANOS MAIORES
// ---------------------------------------------------------------------------
export const MAJOR_ARCANA = [
  {
    id: 'major-00', name: 'O Louco', arcana: 'maior', suit: null, number: 0,
    keywords: ['novos começos', 'espontaneidade', 'fé', 'liberdade'],
    uprightMeaning: 'Início de uma jornada, inocência e disposição para arriscar sem medo do desconhecido.',
    reversedMeaning: 'Imprudência, decisões precipitadas ou medo de dar o primeiro passo.',
    element: 'ar', icon: 'walk',
  },
  {
    id: 'major-01', name: 'O Mago', arcana: 'maior', suit: null, number: 1,
    keywords: ['poder pessoal', 'habilidade', 'manifestação', 'ação'],
    uprightMeaning: 'Você tem todas as ferramentas e recursos necessários para manifestar seus objetivos.',
    reversedMeaning: 'Manipulação, talentos desperdiçados ou falta de foco e planejamento.',
    element: 'mercúrio', icon: 'sparkles',
  },
  {
    id: 'major-02', name: 'A Sacerdotisa', arcana: 'maior', suit: null, number: 2,
    keywords: ['intuição', 'mistério', 'sabedoria interior', 'subconsciente'],
    uprightMeaning: 'Confie na sua intuição e nos segredos ainda não revelados; a sabedoria vem do silêncio interior.',
    reversedMeaning: 'Segredos revelados, desconexão da intuição ou informação oculta e enganosa.',
    element: 'lua', icon: 'moon',
  },
  {
    id: 'major-03', name: 'A Imperatriz', arcana: 'maior', suit: null, number: 3,
    keywords: ['abundância', 'fertilidade', 'natureza', 'criatividade'],
    uprightMeaning: 'Abundância, criatividade fértil e conexão com a natureza florescem em sua vida.',
    reversedMeaning: 'Bloqueio criativo, dependência excessiva ou negligência consigo mesmo.',
    element: 'vênus', icon: 'flower',
  },
  {
    id: 'major-04', name: 'O Imperador', arcana: 'maior', suit: null, number: 4,
    keywords: ['autoridade', 'estrutura', 'controle', 'liderança'],
    uprightMeaning: 'Estrutura, autoridade e liderança estável trazem ordem e segurança.',
    reversedMeaning: 'Rigidez excessiva, autoritarismo ou falta de disciplina e controle.',
    element: 'áries', icon: 'shield',
  },
  {
    id: 'major-05', name: 'O Hierofante', arcana: 'maior', suit: null, number: 5,
    keywords: ['tradição', 'conformidade', 'espiritualidade institucional', 'ensino'],
    uprightMeaning: 'Tradição, orientação espiritual e valores estabelecidos guiam o caminho.',
    reversedMeaning: 'Rebeldia contra convenções, dogmatismo ou questionamento de crenças tradicionais.',
    element: 'touro', icon: 'book',
  },
  {
    id: 'major-06', name: 'Os Enamorados', arcana: 'maior', suit: null, number: 6,
    keywords: ['amor', 'harmonia', 'escolhas', 'alinhamento de valores'],
    uprightMeaning: 'União, amor verdadeiro e uma escolha importante alinhada aos seus valores.',
    reversedMeaning: 'Desarmonia, desalinhamento de valores ou escolhas conflitantes no amor.',
    element: 'gêmeos', icon: 'heart',
  },
  {
    id: 'major-07', name: 'O Carro', arcana: 'maior', suit: null, number: 7,
    keywords: ['determinação', 'vontade', 'vitória', 'controle'],
    uprightMeaning: 'Vitória através de determinação, foco e controle sobre forças opostas.',
    reversedMeaning: 'Falta de direção, agressividade ou perda de controle sobre o rumo.',
    element: 'câncer', icon: 'car-sport',
  },
  {
    id: 'major-08', name: 'A Força', arcana: 'maior', suit: null, number: 8,
    keywords: ['coragem', 'paciência', 'compaixão', 'força interior'],
    uprightMeaning: 'Coragem serena e compaixão superam qualquer obstáculo com paciência.',
    reversedMeaning: 'Insegurança, dúvida própria ou uso de força bruta em vez de gentileza.',
    element: 'leão', icon: 'fitness',
  },
  {
    id: 'major-09', name: 'O Eremita', arcana: 'maior', suit: null, number: 9,
    keywords: ['introspecção', 'busca interior', 'solidão', 'orientação'],
    uprightMeaning: 'Momento de introspecção e busca de respostas dentro de si mesmo.',
    reversedMeaning: 'Isolamento excessivo, solidão indesejada ou recusa em pedir ajuda.',
    element: 'virgem', icon: 'flashlight',
  },
  {
    id: 'major-10', name: 'A Roda da Fortuna', arcana: 'maior', suit: null, number: 10,
    keywords: ['ciclos', 'destino', 'mudança', 'sorte'],
    uprightMeaning: 'Mudança de ciclo trazendo novas oportunidades guiadas pelo destino.',
    reversedMeaning: 'Azar percebido, resistência à mudança ou ciclos negativos se repetindo.',
    element: 'júpiter', icon: 'sync',
  },
  {
    id: 'major-11', name: 'A Justiça', arcana: 'maior', suit: null, number: 11,
    keywords: ['verdade', 'equilíbrio', 'lei', 'causa e efeito'],
    uprightMeaning: 'Equilíbrio, verdade e justiça imparcial guiam as decisões e seus resultados.',
    reversedMeaning: 'Injustiça, desonestidade ou falta de responsabilidade pelas próprias ações.',
    element: 'libra', icon: 'scale',
  },
  {
    id: 'major-12', name: 'O Enforcado', arcana: 'maior', suit: null, number: 12,
    keywords: ['pausa', 'entrega', 'nova perspectiva', 'sacrifício'],
    uprightMeaning: 'Uma pausa voluntária revela uma nova perspectiva sobre a situação.',
    reversedMeaning: 'Resistência ao sacrifício necessário, estagnação ou atrasos indesejados.',
    element: 'água', icon: 'pause',
  },
  {
    id: 'major-13', name: 'A Morte', arcana: 'maior', suit: null, number: 13,
    keywords: ['fim', 'transformação', 'transição', 'renovação'],
    uprightMeaning: 'Fim de um ciclo abrindo espaço para transformação profunda e renovação.',
    reversedMeaning: 'Resistência à mudança, estagnação ou medo de encerrar um ciclo necessário.',
    element: 'escorpião', icon: 'skull',
  },
  {
    id: 'major-14', name: 'A Temperança', arcana: 'maior', suit: null, number: 14,
    keywords: ['equilíbrio', 'moderação', 'paciência', 'harmonia'],
    uprightMeaning: 'Equilíbrio e moderação trazem harmonia entre forças opostas.',
    reversedMeaning: 'Excessos, desequilíbrio ou falta de paciência e visão de longo prazo.',
    element: 'sagitário', icon: 'water',
  },
  {
    id: 'major-15', name: 'O Diabo', arcana: 'maior', suit: null, number: 15,
    keywords: ['apego', 'vícios', 'materialismo', 'sombra'],
    uprightMeaning: 'Apego a padrões limitantes, vícios ou materialismo excessivo prendem você.',
    reversedMeaning: 'Libertação de correntes autoimpostas e reconhecimento de padrões prejudiciais.',
    element: 'capricórnio', icon: 'flame',
  },
  {
    id: 'major-16', name: 'A Torre', arcana: 'maior', suit: null, number: 16,
    keywords: ['ruptura súbita', 'revelação', 'caos', 'despertar'],
    uprightMeaning: 'Uma ruptura súbita e reveladora derruba estruturas que já não sustentavam mais.',
    reversedMeaning: 'Evitar uma mudança inevitável, desastre adiado ou medo da transformação.',
    element: 'marte', icon: 'warning',
  },
  {
    id: 'major-17', name: 'A Estrela', arcana: 'maior', suit: null, number: 17,
    keywords: ['esperança', 'fé', 'renovação', 'inspiração'],
    uprightMeaning: 'Esperança, inspiração e renovação trazem cura após tempos difíceis.',
    reversedMeaning: 'Desespero, falta de fé ou desconexão da própria inspiração.',
    element: 'aquário', icon: 'star',
  },
  {
    id: 'major-18', name: 'A Lua', arcana: 'maior', suit: null, number: 18,
    keywords: ['ilusão', 'intuição', 'medo', 'subconsciente'],
    uprightMeaning: 'Intuição profunda emerge, mas ilusões e medos ainda turvam a clareza.',
    reversedMeaning: 'Confusão dissipada, medos superados ou verdade vindo à tona.',
    element: 'peixes', icon: 'cloudy-night',
  },
  {
    id: 'major-19', name: 'O Sol', arcana: 'maior', suit: null, number: 19,
    keywords: ['alegria', 'sucesso', 'vitalidade', 'clareza'],
    uprightMeaning: 'Sucesso, alegria genuína e vitalidade plena iluminam o caminho.',
    reversedMeaning: 'Otimismo exagerado, sucesso momentaneamente ofuscado ou falta de clareza.',
    element: 'sol', icon: 'sunny',
  },
  {
    id: 'major-20', name: 'O Julgamento', arcana: 'maior', suit: null, number: 20,
    keywords: ['renascimento', 'chamado interior', 'avaliação', 'absolvição'],
    uprightMeaning: 'Um chamado interior convida a um despertar e renascimento pessoal.',
    reversedMeaning: 'Autocrítica excessiva, dúvida sobre decisões passadas ou resistência ao chamado.',
    element: 'fogo', icon: 'megaphone',
  },
  {
    id: 'major-21', name: 'O Mundo', arcana: 'maior', suit: null, number: 21,
    keywords: ['conclusão', 'realização', 'integração', 'plenitude'],
    uprightMeaning: 'Realização plena e conclusão bem-sucedida de um grande ciclo de vida.',
    reversedMeaning: 'Ciclo inacabado, sensação de estagnação ou busca por fechamento.',
    element: 'saturno', icon: 'earth',
  },
];

// ---------------------------------------------------------------------------
// ARCANOS MENORES — construídos a partir de tabelas de naipe/grau para
// garantir consistência (78 no total, 14 por naipe, ids/nomes sem duplicidade).
// ---------------------------------------------------------------------------
const SUITS = [
  { key: 'paus', name: 'Paus', element: 'fogo', icon: 'flame' },
  { key: 'copas', name: 'Copas', element: 'água', icon: 'wine' },
  { key: 'espadas', name: 'Espadas', element: 'ar', icon: 'flash' },
  { key: 'ouros', name: 'Ouros', element: 'terra', icon: 'disc' },
];

const RANKS = [
  { number: 1, name: 'Ás' },
  { number: 2, name: 'Dois' },
  { number: 3, name: 'Três' },
  { number: 4, name: 'Quatro' },
  { number: 5, name: 'Cinco' },
  { number: 6, name: 'Seis' },
  { number: 7, name: 'Sete' },
  { number: 8, name: 'Oito' },
  { number: 9, name: 'Nove' },
  { number: 10, name: 'Dez' },
  { number: 11, name: 'Valete' },
  { number: 12, name: 'Cavaleiro' },
  { number: 13, name: 'Rainha' },
  { number: 14, name: 'Rei' },
];

// Significados tradicionais (Rider-Waite-Smith / Pictorial Key to the Tarot), por naipe e grau.
const MINOR_MEANINGS = {
  paus: {
    1: { keywords: ['início', 'inspiração', 'potencial'], upright: 'Novo começo, inspiração criativa e potencial pronto para entrar em ação.', reversed: 'Atrasos, falta de direção ou energia criativa bloqueada.' },
    2: { keywords: ['planejamento', 'decisão', 'expansão'], upright: 'Planejamento cuidadoso e decisões sobre o futuro abrem novos horizontes.', reversed: 'Medo do desconhecido ou falta de planejamento para expandir.' },
    3: { keywords: ['previsão', 'expansão', 'resultados'], upright: 'Expansão e visão de longo prazo trazem resultados de esforços já em andamento.', reversed: 'Atrasos ou obstáculos inesperados nos planos em curso.' },
    4: { keywords: ['celebração', 'harmonia', 'lar'], upright: 'Celebração, harmonia e um momento de comemoração no lar ou na comunidade.', reversed: 'Instabilidade doméstica ou uma celebração adiada.' },
    5: { keywords: ['conflito', 'competição', 'tensão'], upright: 'Conflito, competição e tensão entre diferentes vontades ou interesses.', reversed: 'Conflitos internos ou o desejo de evitar um confronto necessário.' },
    6: { keywords: ['vitória', 'reconhecimento', 'sucesso'], upright: 'Vitória e reconhecimento público após um esforço bem-sucedido.', reversed: 'Queda de popularidade, arrogância ou atraso no reconhecimento merecido.' },
    7: { keywords: ['defesa', 'perseverança', 'desafio'], upright: 'Defesa firme da própria posição e perseverança diante de desafios.', reversed: 'Sensação de estar sobrecarregado ou ceder à pressão dos outros.' },
    8: { keywords: ['velocidade', 'movimento', 'progresso'], upright: 'Ação rápida, movimento e progresso acelerado em direção ao objetivo.', reversed: 'Atrasos, frustração ou algo que se arrasta mais do que deveria.' },
    9: { keywords: ['resiliência', 'cautela', 'persistência'], upright: 'Resiliência e cautela reúnem as últimas forças antes da vitória final.', reversed: 'Exaustão, teimosia excessiva ou esgotamento das forças.' },
    10: { keywords: ['sobrecarga', 'fardo', 'responsabilidade'], upright: 'Sobrecarga de responsabilidades e um fardo pesado a ser carregado.', reversed: 'Soltar cargas desnecessárias, delegar ou reconhecer o esgotamento.' },
    11: { keywords: ['entusiasmo', 'curiosidade', 'mensagem'], upright: 'Mensageiro entusiasmado, curiosidade e novas ideias criativas surgindo.', reversed: 'Falta de direção, procrastinação ou más notícias.' },
    12: { keywords: ['ação', 'aventura', 'impulsividade'], upright: 'Ação impulsiva, paixão e disposição para viagens e aventuras.', reversed: 'Impulsividade excessiva, frustração ou projetos abandonados no meio do caminho.' },
    13: { keywords: ['confiança', 'determinação', 'independência'], upright: 'Confiança magnética, determinação e independência inabaláveis.', reversed: 'Ciúmes, insegurança ou comportamento autoritário.' },
    14: { keywords: ['liderança', 'visão', 'carisma'], upright: 'Liderança visionária, coragem empreendedora e carisma natural.', reversed: 'Impulsividade, arrogância ou expectativas exageradas sobre os outros.' },
  },
  copas: {
    1: { keywords: ['novo amor', 'intuição', 'abertura emocional'], upright: 'Novo amor, abertura emocional e intuição fértil transbordando.', reversed: 'Bloqueio emocional, amor não correspondido ou sensação de vazio interior.' },
    2: { keywords: ['união', 'parceria', 'atração'], upright: 'União, parceria e atração mútua criando uma conexão verdadeira.', reversed: 'Desequilíbrio na relação, rompimento ou desarmonia entre as partes.' },
    3: { keywords: ['celebração', 'amizade', 'comunidade'], upright: 'Celebração, amizade e alegria compartilhada em boa companhia.', reversed: 'Excessos, fofoca ou isolamento social.' },
    4: { keywords: ['apatia', 'contemplação', 'oportunidade perdida'], upright: 'Apatia e contemplação diante de oportunidades que passam despercebidas.', reversed: 'Despertar para novas possibilidades e superação do tédio.' },
    5: { keywords: ['perda', 'luto', 'arrependimento'], upright: 'Perda, luto e o foco voltado para o que já não se tem mais.', reversed: 'Aceitação, perdão e disposição para seguir em frente.' },
    6: { keywords: ['nostalgia', 'memórias', 'infância'], upright: 'Nostalgia, boas memórias e reencontros com o passado.', reversed: 'Apego excessivo ao passado ou idealização de tempos que já se foram.' },
    7: { keywords: ['fantasia', 'ilusão', 'escolhas'], upright: 'Fantasias e opções ilusórias tornam as escolhas confusas.', reversed: 'Clareza sobre uma escolha real, com as ilusões finalmente desfeitas.' },
    8: { keywords: ['abandono', 'busca', 'propósito'], upright: 'Abandono do que não satisfaz mais em busca de um propósito maior.', reversed: 'Medo de seguir em frente ou estagnação por comodismo.' },
    9: { keywords: ['satisfação', 'desejo realizado', 'contentamento'], upright: 'Satisfação, contentamento e realização de um desejo importante.', reversed: 'Excesso, satisfação superficial ou orgulho vazio.' },
    10: { keywords: ['felicidade', 'família', 'harmonia'], upright: 'Felicidade familiar e harmonia emocional plena e duradoura.', reversed: 'Conflitos familiares ou valores desalinhados dentro do lar.' },
    11: { keywords: ['mensagem', 'intuição', 'criatividade'], upright: 'Mensagens intuitivas e criatividade emocional trazendo novidades afetivas.', reversed: 'Imaturidade emocional, decepção ou bloqueio criativo.' },
    12: { keywords: ['romance', 'convite', 'idealismo'], upright: 'Romantismo, convites e a disposição de seguir o coração.', reversed: 'Humor instável, promessas vazias ou decepção romântica.' },
    13: { keywords: ['empatia', 'intuição', 'cuidado'], upright: 'Empatia, intuição aguçada e cuidado emocional profundo com os outros.', reversed: 'Insegurança emocional, dependência ou sensibilidade excessiva.' },
    14: { keywords: ['equilíbrio emocional', 'sabedoria', 'maturidade'], upright: 'Equilíbrio emocional, sabedoria compassiva e maturidade nos sentimentos.', reversed: 'Instabilidade emocional, manipulação ou frieza afetiva.' },
  },
  espadas: {
    1: { keywords: ['clareza', 'verdade', 'nova ideia'], upright: 'Clareza mental, verdade e uma nova ideia poderosa surgindo.', reversed: 'Confusão, informação distorcida ou decisões tomadas de forma precipitada.' },
    2: { keywords: ['impasse', 'indecisão', 'equilíbrio tenso'], upright: 'Impasse e indecisão diante de uma decisão difícil.', reversed: 'Sobrecarga de informação, decisão forçada ou fuga da verdade.' },
    3: { keywords: ['dor', 'traição', 'luto emocional'], upright: 'Dor emocional, traição e a sensação de um coração partido.', reversed: 'Cura, perdão e recuperação gradual da dor.' },
    4: { keywords: ['descanso', 'recuperação', 'pausa'], upright: 'Descanso e recuperação necessários após um período de esforço.', reversed: 'Esgotamento, retorno forçado à ação ou estagnação prolongada.' },
    5: { keywords: ['conflito', 'derrota', 'disputa'], upright: 'Conflito e uma vitória obtida às custas de algo importante.', reversed: 'Reconciliação e disposição para deixar rancores para trás.' },
    6: { keywords: ['transição', 'movimento', 'deixar para trás'], upright: 'Transição e movimento em direção a águas mais calmas, deixando dificuldades para trás.', reversed: 'Resistência à mudança ou dificuldade em seguir adiante.' },
    7: { keywords: ['estratégia', 'engano', 'ação furtiva'], upright: 'Estratégia e ação discreta, às vezes envolvendo algum tipo de engano.', reversed: 'Confissão, arrependimento ou exposição de mentiras.' },
    8: { keywords: ['aprisionamento', 'limitação', 'medo'], upright: 'Sensação de aprisionamento diante de limitações que são, na verdade, autoimpostas.', reversed: 'Libertação, nova perspectiva e o rompimento de padrões mentais limitantes.' },
    9: { keywords: ['ansiedade', 'angústia', 'pesadelo'], upright: 'Ansiedade, pesadelos e angústia mental que tiram o sono.', reversed: 'Alívio gradual da ansiedade ou desespero que ainda permanece oculto.' },
    10: { keywords: ['fim', 'colapso', 'ponto baixo'], upright: 'Um fim doloroso, colapso e a sensação de ter chegado ao ponto mais baixo.', reversed: 'Recuperação e resistência para não repetir o mesmo ciclo.' },
    11: { keywords: ['curiosidade', 'vigilância', 'ideias'], upright: 'Curiosidade intelectual, vigilância e novas ideias em formação.', reversed: 'Fofoca, informação equivocada ou impulsividade verbal.' },
    12: { keywords: ['ação rápida', 'ambição', 'impulsividade'], upright: 'Ação rápida e direta impulsionada por ambição intelectual.', reversed: 'Impulsividade, imprudência ou agressividade nas palavras e atos.' },
    13: { keywords: ['clareza', 'honestidade', 'independência'], upright: 'Clareza mental, honestidade direta e independência intelectual.', reversed: 'Frieza excessiva, crítica cortante ou isolamento emocional.' },
    14: { keywords: ['autoridade', 'ética', 'intelecto'], upright: 'Autoridade intelectual, ética sólida e busca pela verdade.', reversed: 'Manipulação mental, rigidez ou abuso de poder.' },
  },
  ouros: {
    1: { keywords: ['oportunidade', 'prosperidade', 'novo projeto material'], upright: 'Nova oportunidade material e prosperidade em potencial se manifestando.', reversed: 'Oportunidade perdida ou instabilidade financeira.' },
    2: { keywords: ['equilíbrio', 'adaptação', 'prioridades'], upright: 'Equilíbrio entre prioridades e boa adaptação diante de mudanças.', reversed: 'Desorganização financeira ou sobrecarga de compromissos.' },
    3: { keywords: ['colaboração', 'trabalho em equipe', 'reconhecimento'], upright: 'Trabalho em equipe, colaboração e reconhecimento profissional merecido.', reversed: 'Falta de cooperação ou trabalho entregue com baixa qualidade.' },
    4: { keywords: ['segurança', 'controle', 'apego material'], upright: 'Segurança material, controle e desejo de manter o que já foi conquistado.', reversed: 'Avareza, medo de perder ou materialismo excessivo.' },
    5: { keywords: ['dificuldade', 'exclusão', 'perda financeira'], upright: 'Dificuldade financeira e a sensação de exclusão em um momento difícil.', reversed: 'Recuperação financeira e o fim de um período de escassez.' },
    6: { keywords: ['generosidade', 'ajuda mútua', 'equilíbrio'], upright: 'Generosidade e ajuda mútua criam equilíbrio entre dar e receber.', reversed: 'Dívidas, dependência ou generosidade com segundas intenções.' },
    7: { keywords: ['paciência', 'avaliação', 'investimento'], upright: 'Paciência para avaliar investimentos que ainda precisam de tempo para florescer.', reversed: 'Impaciência ou esforço que parece não trazer recompensa.' },
    8: { keywords: ['dedicação', 'aprendizado', 'habilidade'], upright: 'Dedicação, aprendizado constante e aperfeiçoamento de uma habilidade.', reversed: 'Perfeccionismo, trabalho sem propósito claro ou estagnação profissional.' },
    9: { keywords: ['independência', 'autossuficiência', 'conquista'], upright: 'Independência financeira, autossuficiência e conquistas desfrutadas com prazer.', reversed: 'Dependência financeira ou insegurança apesar do sucesso aparente.' },
    10: { keywords: ['riqueza', 'legado', 'estabilidade'], upright: 'Riqueza duradoura, legado familiar e estabilidade construída a longo prazo.', reversed: 'Instabilidade financeira familiar ou disputas em torno de uma herança.' },
    11: { keywords: ['oportunidade', 'estudo', 'praticidade'], upright: 'Nova oportunidade de estudo ou trabalho, com foco prático nos próximos passos.', reversed: 'Falta de planejamento, procrastinação ou oportunidades desperdiçadas.' },
    12: { keywords: ['método', 'confiabilidade', 'constância'], upright: 'Trabalho metódico, confiabilidade e esforço constante rumo ao resultado.', reversed: 'Estagnação, teimosia ou rotina levada ao extremo.' },
    13: { keywords: ['praticidade', 'cuidado', 'abundância'], upright: 'Praticidade, cuidado material e emocional, e abundância generosa.', reversed: 'Negligência com as finanças ou com o próprio autocuidado.' },
    14: { keywords: ['sucesso material', 'liderança', 'segurança'], upright: 'Sucesso material consolidado, liderança segura e abundância estabelecida.', reversed: 'Materialismo excessivo, rigidez financeira ou autoritarismo.' },
  },
};

function buildMinorArcana() {
  const cards = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      const meaning = MINOR_MEANINGS[suit.key][rank.number];
      cards.push({
        id: `${suit.key}-${String(rank.number).padStart(2, '0')}`,
        name: `${rank.name} de ${suit.name}`,
        arcana: 'menor',
        suit: suit.key,
        number: rank.number,
        keywords: meaning.keywords,
        uprightMeaning: meaning.upright,
        reversedMeaning: meaning.reversed,
        element: suit.element,
        icon: suit.icon,
      });
    });
  });
  return cards;
}

export const MINOR_ARCANA = buildMinorArcana();

// ---------------------------------------------------------------------------
// Baralho completo (78 cartas) e helpers de acesso
// ---------------------------------------------------------------------------
export const TAROT_DECK = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export function getRandomCard() {
  const idx = Math.floor(Math.random() * TAROT_DECK.length);
  return TAROT_DECK[idx];
}

export function getCardById(id) {
  return TAROT_DECK.find((card) => card.id === id);
}

export default TAROT_DECK;
