// lib/tarotDeck.js
// Baralho de Tarô completo Rider-Waite-Smith (78 cartas), em português.
// 22 Arcanos Maiores (0-21) + 56 Arcanos Menores (4 naipes x 14 cartas).
// Significados tradicionais/padrão (domínio público, esoterismo clássico) — uso de entretenimento.
//
// Cada carta: { id, name, arcana, suit, number, keywords, uprightMeaning,
//               reversedMeaning, element, icon, cena, conselho, conselhoInvertido,
//               astro, tituloGD, grau, letra, classeSY, caminho, waite1911 }
// - arcana: 'maior' | 'menor'
// - suit: null (maiores) | 'paus' | 'copas' | 'espadas' | 'ouros'
// - number: 0-21 para maiores; 1-14 para menores (1=Ás, 11=Valete, 12=Cavaleiro, 13=Rainha, 14=Rei)
// - element: para os 22 Maiores, o planeta/signo/elemento da atribuição Golden
//   Dawn. Para os 56 Menores é o ELEMENTO DO NAIPE (fogo/água/ar/terra) — não a
//   atribuição fina; essa fica em `astro` (ver abaixo), que é o dado Golden Dawn
//   de verdade. Antes este comentário prometia Golden Dawn nos 56 menores e
//   entregava só o elemento do naipe repetido 14 vezes (auditoria 29/07/2026).
// - astro: atribuição Golden Dawn específica da carta — decanato (planeta em
//   signo) nas 36 numeradas de 2 a 10, elemento composto nas 16 cortes, raiz
//   elemental nos 4 Ases. null nos Arcanos Maiores (lá o dado está em `element`).
// - tituloGD: título tradicional Golden Dawn da carta numerada (ex. "Senhor do
//   Domínio"), quando existe.
// - grau: leitura numerológica transversal do grau (o que um Cinco significa
//   ENQUANTO Cinco, em qualquer naipe) — ver RANK_GRADES.
// - letra / classeSY / caminho: SÓ nos 22 Maiores. A letra hebraica, a classe
//   dela no Sepher Yetzirah (mãe / dupla / simples) e o número do caminho na
//   Árvore da Vida, na atribuição da Golden Dawn (Cipher Manuscripts / "Book T",
//   publicado por Regardie 1937-1940). Ver docs/tradicao/05, §4.1.
//   POR QUE ISTO ENTROU (31/07/2026): sem estes campos os 22 Maiores tinham UM
//   único dado tradicional exclusivo cada (o `element`), e a frase de leitura
//   saía praticamente idêntica de arcano para arcano — o defeito que o dono
//   chamou de "genérico" e "enrolando linguiça". Agora cada Maior tem quatro
//   dados exclusivos e verificáveis.
//   ARMADILHA REGISTRADA, e coberta por teste (test/tarotVoice.test.js): a
//   classe do Sepher Yetzirah está ERRADA em muita tabela que circula online.
//   As MÃES são exatamente três — Aleph (O Louco), Mem (O Enforcado) e Shin
//   (O Julgamento). As DUPLAS são exatamente sete — Beth, Gimel, Daleth, Kaph,
//   Peh, Resh, Tav. As outras doze são SIMPLES, e são elas que recebem os doze
//   signos, em ordem zodiacal de Áries a Peixes.
//   E NUNCA escreva "a" atribuição astrológica do tarô: há pelo menos três
//   incompatíveis (Golden Dawn; continental de Lévi/Papus, que desloca todas as
//   letras em uma casa; e a troca Heh ⇄ Tzaddi do Thoth de Crowley, 1944).
//   Este app usa a da Golden Dawn e diz isso na tela.
// - waite1911: citação VERBATIM da lista de "Divinatory Meanings" do "Pictorial
//   Key to the Tarot" (A. E. Waite, 1911), só nas 11 cartas em que a citação
//   está conferida (oito na base, docs/tradicao/05; três no Pictorial Key
//   direto — a procedência de cada uma está listada em WAITE_1911, e três
//   citações são TRECHO, marcado com reticências, não a entrada inteira).
//   `null` em todas as outras — de propósito:
//   inventar Waite é pior que não citar Waite, e metade do que a internet
//   atribui a ele, ele não escreveu. Serve para a nota mais honesta que este
//   app pode dar sobre o próprio baralho: as duas metades do RWS não contam a
//   mesma história. A lista verbal de Waite vem da cartomancia francesa (linha
//   Etteilla, via Mathers 1888); as imagens de Pamela Colman Smith carregam
//   simbolismo Golden Dawn. A leitura moderna — e a deste app — segue a IMAGEM.
// - cena: a imagem da carta no baralho Rider-Waite-Smith (Pamela Colman Smith),
//   em uma frase. É de onde a leitura tradicional realmente sai — sem ela o
//   texto temático vira moldura reciclada por naipe (efeito Barnum).
// - conselho / conselhoInvertido: o conselho que a tradição dá para esta carta
//   nesta orientação. Existe separado das keywords de propósito: as cartas duras
//   são DIAGNÓSTICO, não prescrição — "Cinco de Ouros" pede procurar amparo, não
//   "investir em dificuldade".
// - icon: nome de glifo do @expo/vector-icons/Ionicons, para renderização na UI existente

// Pacotes de idioma da leitura transversal (getSpreadPattern). São standalone
// (não importam nada deste arquivo), então não há ciclo. O pacote PT não é
// importado aqui de propósito: ele importa DESTE arquivo (SPREAD_TEXTS,
// RANK_GRADES, TAROT_DECK) e importá-lo de volta criaria o ciclo que os
// standalone evitam.
import tarotEs from './traducoes/tarot.es';
import tarotEn from './traducoes/tarot.en';

// ---------------------------------------------------------------------------
// ARCANOS MAIORES
// ---------------------------------------------------------------------------
// `cena`, `conselho` e `conselhoInvertido` são anexados logo abaixo, a partir da
// tabela CARD_DEPTH (ver MAJOR_ARCANA no fim do arquivo) — ficam separados aqui
// só pra não inchar cada objeto e manter esta lista legível.
const MAJOR_ARCANA_RAW = [
  {
    id: 'major-00', name: 'O Louco', arcana: 'maior', suit: null, number: 0,
    // Ordem importa: keywords[0] e [1] são as que aparecem no texto temático.
    // "salto de fé" é o eixo real da carta (o pé na borda do penhasco), não
    // "novos começos" genérico.
    keywords: ['salto de fé', 'novos começos', 'espontaneidade', 'liberdade'],
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
    // Os Enamorados é a carta da ESCOLHA (Gêmeos, o discernimento), não do
    // romance — em Marselha o arqueiro mira um homem entre duas figuras; na RWS
    // é o instante antes da decisão, diante das duas árvores. "escolhas" e
    // "alinhamento de valores" estavam nos índices 2 e 3, que nunca eram
    // renderizados: o eixo central da carta jamais chegava na tela.
    keywords: ['escolhas', 'alinhamento de valores', 'amor', 'harmonia'],
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
    // "fim" solto na posição 0 empurrava o leitor exatamente para a leitura
    // literal que o uprightMeaning tenta evitar. A tradição lê a Morte como
    // transformação irreversível — o sol nasce entre as torres ao fundo.
    keywords: ['transformação', 'fim de ciclo', 'transição', 'renovação'],
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
    uprightMeaning: 'Esperança, inspiração e renovação depois de um tempo difícil.',
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

// Significados por naipe e grau.
//
// FONTE, com honestidade (correção de 30/07/2026): os significados DIRETOS
// seguem a linha Rider-Waite-Smith, coerentes com as imagens de Pamela Colman
// Smith e com o "Pictorial Key to the Tarot" (Waite, 1910). Os INVERTIDOS NÃO
// são os de Waite — são leituras contemporâneas consolidadas, na escola em que
// a inversão lê bloqueio, excesso, atraso ou interiorização da mesma energia
// (ex.: Três de Espadas invertido aqui é "cura gradual"; no Pictorial Key é
// "mental alienation, error, loss, distraction"). As duas escolas são legítimas,
// mas são escolas DIFERENTES — antes este comentário citava nominalmente o
// Pictorial Key como fonte dos invertidos, o que não se sustentava na
// conferência de quem conhece o texto de Waite.
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
    3: { keywords: ['dor', 'traição', 'luto emocional'], upright: 'Dor emocional, traição e a sensação de um coração partido.', reversed: 'Perdão e reconstrução: a dor cede aos poucos.' },
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

// ---------------------------------------------------------------------------
// CAMADA NUMEROLÓGICA (grau) — o que liga os quatro naipes entre si.
// Na leitura contemporânea os graus se falam: os quatro Cincos são o MESMO grau
// (crise, perda de equilíbrio) em quatro elementos, e é por isso que 5 de Paus
// é briga, 5 de Copas é luto, 5 de Espadas é derrota e 5 de Ouros é privação.
// Sem esta tabela o app não tinha como dizer nada quando saíam três Cincos.
// ---------------------------------------------------------------------------
export const RANK_GRADES = {
  1: 'Ás — a raiz do elemento: potencial puro, ainda inteiro e ainda não gasto.',
  2: 'Dois — polaridade e escolha: duas forças se encarando antes de qualquer coisa acontecer.',
  3: 'Três — primeira manifestação: o que era plano sai do plano e aparece no mundo.',
  4: 'Quatro — estabilidade e consolidação: já tem forma, e forma já começa a pesar.',
  5: 'Cinco — crise: o equilíbrio do elemento se perde. É o mesmo grau em quatro elementos, por isso briga em Paus, luto em Copas, derrota em Espadas e privação em Ouros.',
  6: 'Seis — restabelecimento: o equilíbrio voltando depois da crise do Cinco.',
  7: 'Sete — prova: a força é testada por dentro, longe da plateia.',
  8: 'Oito — movimento: a energia volta a circular e o assunto anda.',
  9: 'Nove — culminação: o máximo que o elemento sustenta sozinho, com o que isso tem de solitário.',
  10: 'Dez — limite do ciclo: completude que já é excesso e pede encerramento.',
  11: 'Valete — quem está APRENDENDO o elemento: começo, curiosidade, ainda sem domínio.',
  12: 'Cavaleiro — quem LANÇA o elemento para fora: movimento, ímpeto, às vezes excesso.',
  13: 'Rainha — quem SUSTENTA o elemento por dentro: domínio pela vivência.',
  14: 'Rei — quem ADMINISTRA o elemento no mundo: domínio pelo exercício da autoridade.',
};

// ---------------------------------------------------------------------------
// ATRIBUIÇÃO GOLDEN DAWN dos 56 Menores (a base da RWS — Waite e Pamela Colman
// Smith eram membros da Ordem). 36 decanatos nas cartas de 2 a 10, com o título
// tradicional; elemento composto nas 16 cortes; raiz elemental nos 4 Ases.
//
// NOTA HONESTA sobre as cortes: a Golden Dawn original usa Cavaleiro (Fogo),
// Rainha (Água), Príncipe (Ar) e Princesa (Terra). Este baralho é RWS, que tem
// Rei e Valete no lugar de Príncipe e Princesa, então usamos a adaptação
// corrente do baralho de Waite — Rei=Fogo, Rainha=Água, Cavaleiro=Ar,
// Valete=Terra. São duas convenções reais e divergentes; registramos qual foi
// escolhida em vez de fingir que só existe uma.
// ---------------------------------------------------------------------------
const COURT_ELEMENT = { 11: 'Terra', 12: 'Ar', 13: 'Água', 14: 'Fogo' };
const SUIT_ELEMENT_PT = { paus: 'Fogo', copas: 'Água', espadas: 'Ar', ouros: 'Terra' };

const GOLDEN_DAWN_DECANS = {
  paus: {
    2: ['Marte em Áries', 'Senhor do Domínio'],
    3: ['Sol em Áries', 'Senhor da Força Estabelecida'],
    4: ['Vênus em Áries', 'Senhor da Obra Perfeita'],
    5: ['Saturno em Leão', 'Senhor da Contenda'],
    6: ['Júpiter em Leão', 'Senhor da Vitória'],
    7: ['Marte em Leão', 'Senhor do Valor'],
    8: ['Mercúrio em Sagitário', 'Senhor da Rapidez'],
    9: ['Lua em Sagitário', 'Senhor da Grande Força'],
    10: ['Saturno em Sagitário', 'Senhor da Opressão'],
  },
  copas: {
    2: ['Vênus em Câncer', 'Senhor do Amor'],
    3: ['Mercúrio em Câncer', 'Senhor da Abundância'],
    4: ['Lua em Câncer', 'Senhor do Prazer Misturado'],
    5: ['Marte em Escorpião', 'Senhor da Perda no Prazer'],
    6: ['Sol em Escorpião', 'Senhor do Prazer'],
    7: ['Vênus em Escorpião', 'Senhor do Sucesso Ilusório'],
    8: ['Saturno em Peixes', 'Senhor do Sucesso Abandonado'],
    9: ['Júpiter em Peixes', 'Senhor da Felicidade Material'],
    10: ['Marte em Peixes', 'Senhor do Sucesso Perfeito'],
  },
  espadas: {
    2: ['Lua em Libra', 'Senhor da Paz Restaurada'],
    3: ['Saturno em Libra', 'Senhor da Tristeza'],
    4: ['Júpiter em Libra', 'Senhor do Descanso da Contenda'],
    5: ['Vênus em Aquário', 'Senhor da Derrota'],
    6: ['Mercúrio em Aquário', 'Senhor do Sucesso Conquistado'],
    7: ['Lua em Aquário', 'Senhor do Esforço Instável'],
    8: ['Júpiter em Gêmeos', 'Senhor da Força Reduzida'],
    9: ['Marte em Gêmeos', 'Senhor do Desespero e da Crueldade'],
    10: ['Sol em Gêmeos', 'Senhor da Ruína'],
  },
  ouros: {
    2: ['Júpiter em Capricórnio', 'Senhor da Mudança Harmoniosa'],
    3: ['Marte em Capricórnio', 'Senhor das Obras Materiais'],
    4: ['Sol em Capricórnio', 'Senhor do Poder Terreno'],
    5: ['Mercúrio em Touro', 'Senhor da Dificuldade Material'],
    6: ['Lua em Touro', 'Senhor do Sucesso Material'],
    7: ['Saturno em Touro', 'Senhor do Sucesso Não Cumprido'],
    8: ['Sol em Virgem', 'Senhor da Prudência'],
    9: ['Vênus em Virgem', 'Senhor do Ganho Material'],
    10: ['Mercúrio em Virgem', 'Senhor da Riqueza'],
  },
};

// O artigo muda com o gênero do elemento em português: "do Fogo", "do Ar",
// mas "da Água", "da Terra". Antes saía "raiz das forças do Água" nos Ases —
// erro de concordância que aparecia na tela do usuário em 2 das 4 cartas.
const SUIT_ELEMENT_ARTICLE = { paus: 'do', copas: 'da', espadas: 'do', ouros: 'da' };

function astroForMinor(suitKey, number) {
  if (number === 1) return `raiz das forças ${SUIT_ELEMENT_ARTICLE[suitKey]} ${SUIT_ELEMENT_PT[suitKey]}`;
  if (number >= 11) return `${COURT_ELEMENT[number]} de ${SUIT_ELEMENT_PT[suitKey]}`;
  const entry = GOLDEN_DAWN_DECANS[suitKey]?.[number];
  return entry ? entry[0] : null;
}

function titleForMinor(suitKey, number) {
  const entry = GOLDEN_DAWN_DECANS[suitKey]?.[number];
  return entry ? entry[1] : null;
}

// ---------------------------------------------------------------------------
// CENA + CONSELHO por carta (78).
//
// `cena` é a imagem RWS de onde a leitura tradicional sai de verdade. `conselho`
// e `conselhoInvertido` são o conselho da tradição para aquela carta naquela
// orientação — nunca uma ordem construída em cima da keyword crua, que é o que
// produzia frases como "Invista em DIFICULDADE" (Cinco de Ouros) ou "É hora de
// agir com SOBRECARGA" (Dez de Paus). Carta dura é diagnóstico e advertência,
// não prescrição.
// ---------------------------------------------------------------------------
const CARD_DEPTH = {
  'major-00': { cena: 'o andarilho de trouxa no ombro com o pé na borda do penhasco, e o cachorro puxando a barra da roupa', conselho: 'O passo pede confiança, não garantia — mas olhe onde pisa antes de saltar.', conselhoInvertido: 'Antes de arriscar, pergunte se é coragem ou fuga; se o que trava é medo, nomeie o medo.' },
  'major-01': { cena: 'a mesa com os quatro símbolos dos naipes, uma mão apontando pro céu e outra pra terra', conselho: 'As ferramentas já estão na sua mesa; o que falta é escolher qual usar primeiro.', conselhoInvertido: 'Confira se a promessa — sua ou de alguém — tem lastro: talento disperso não manifesta nada.' },
  'major-02': { cena: 'a guardiã sentada entre as colunas branca e negra, com o rolo da lei meio escondido no manto', conselho: 'Nem tudo precisa ser dito ou decidido agora; espere o dado que ainda não chegou.', conselhoInvertido: 'Ou estão te escondendo algo, ou você está ignorando o que já sabe por dentro — verifique qual dos dois.' },
  'major-03': { cena: 'o trono almofadado no campo de trigo maduro, com o cetro na mão e o escudo de Vênus ao lado', conselho: 'Deixe crescer no tempo que a coisa pede — cuidar aqui também é produzir.', conselhoInvertido: 'Cuidar de todo mundo e de nada seu seca a fonte; recolha um pouco pra dentro.' },
  'major-04': { cena: 'o trono de pedra com cabeças de carneiro, numa montanha seca sem nada verde em volta', conselho: 'Defina a regra e o limite antes de seguir — aqui estrutura é proteção, não prisão.', conselhoInvertido: 'Rigidez demais e ausência total de moldura dão no mesmo: nada se sustenta.' },
  'major-05': { cena: 'o mestre entre duas colunas abençoando dois discípulos, com as chaves cruzadas aos pés', conselho: 'Vale consultar quem já percorreu esse caminho antes de inventar o seu.', conselhoInvertido: 'A regra herdada pode não servir mais — questione, mas saiba o que está deixando pra trás.' },
  'major-06': { cena: 'o anjo acima de duas figuras, entre a árvore do conhecimento e a árvore da vida: o instante antes da escolha', conselho: 'Escolha pelo que você valoriza, não pelo que é mais fácil — e escolha uma coisa só.', conselhoInvertido: 'Se a decisão travou, é porque dois valores seus estão em conflito; nomeie os dois antes de decidir.' },
  'major-07': { cena: 'o condutor de pé entre duas esfinges de cores opostas, sem rédeas nas mãos', conselho: 'Segure a direção pela vontade, não pela força — as duas esfinges puxam pra lados opostos.', conselhoInvertido: 'Sem rumo definido, energia vira agitação; pare e diga pra onde antes de acelerar.' },
  'major-08': { cena: 'a mulher fechando a boca do leão com as próprias mãos, sem violência, sob o símbolo do infinito', conselho: 'Firmeza com gentileza dobra o que a força bruta só irrita.', conselhoInvertido: 'A dúvida sobre si está fazendo o serviço que o obstáculo não conseguiu fazer.' },
  'major-09': { cena: 'o velho no alto da montanha com uma estrela dentro da lanterna, iluminando só o próximo passo', conselho: 'Recolher-se um tempo aqui é método, não fuga — a lanterna mostra um passo por vez.', conselhoInvertido: 'O retiro virou isolamento; peça ajuda a uma pessoa específica, não ao mundo em geral.' },
  'major-10': { cena: 'a roda girando no céu com as quatro criaturas nos cantos, cada uma lendo seu próprio livro', conselho: 'O que gira não pede controle, pede posicionamento — veja em que ponto da volta você está.', conselhoInvertido: 'Se o mesmo ciclo se repete, procure a sua parte nele: é ali que existe escolha.' },
  'major-11': { cena: 'a figura sentada com a espada erguida numa mão e a balança na outra, entre as cortinas', conselho: 'Olhe o fato antes do sentimento e assuma a sua parte na conta.', conselhoInvertido: 'Há um desequilíbrio real; antes de acusar, confira o que nele é seu.' },
  'major-12': { cena: 'o homem pendurado de cabeça pra baixo por um pé, sereno, com um halo em volta da cabeça', conselho: 'A pausa é o trabalho agora — insistir só aperta o nó.', conselhoInvertido: 'Você está pendurado há tempo demais sem nada mudar: ou entrega de verdade, ou desce.' },
  'major-13': { cena: 'o cavaleiro de armadura passando com o estandarte da rosa branca, e o sol nascendo entre duas torres ao fundo', conselho: 'Algo acabou de fato; a energia gasta em segurar é a que vai faltar pro que vem.', conselhoInvertido: 'Segurar o que já acabou não traz de volta — só adia o luto e cobra juros.' },
  'major-14': { cena: 'o anjo com um pé na água e outro na terra, passando líquido de uma taça pra outra', conselho: 'Misture aos poucos: aqui a dose certa importa mais que a decisão.', conselhoInvertido: 'Algum excesso está desregulando o resto; identifique um só e reduza esse.' },
  'major-15': { cena: 'o casal acorrentado ao bloco — com as correntes largas o bastante pra sair pela cabeça', conselho: 'Olhe a corrente e o que ela te dá em troca; sem isso o padrão continua.', conselhoInvertido: 'A corrente está afrouxando — nomeie o que você já consegue largar hoje.' },
  'major-16': { cena: 'o raio arrancando a coroa do alto da torre e as duas figuras caindo', conselho: 'O que caiu já estava rachado; recolha o que era verdadeiro e não reconstrua igual.', conselhoInvertido: 'A queda está sendo adiada, ou vivida por dentro em silêncio — adiar aqui cobra juros.' },
  'major-17': { cena: 'a mulher ajoelhada derramando duas jarras, uma na lagoa e outra na terra, sob oito estrelas', conselho: 'Confie o bastante pra continuar molhando o chão: recuperação é lenta e é real.', conselhoInvertido: 'A fé baixou — procure a coisa pequena e concreta que ainda funciona e comece por ela.' },
  'major-18': { cena: 'o caminho entre duas torres, o cão e o lobo uivando e o lagostim saindo da água', conselho: 'Não decida no escuro; espere clarear ou peça um segundo par de olhos.', conselhoInvertido: 'O que assustava está tomando forma — o medo era maior que o fato.' },
  'major-19': { cena: 'a criança no cavalo branco sob os girassóis, com o sol de rosto aberto no alto', conselho: 'Deixe ser simples e visível — nem tudo precisa de complicação pra ter valor.', conselhoInvertido: 'A alegria está aí, só ofuscada; procure o que está tapando a luz.' },
  'major-20': { cena: 'o anjo com a trombeta e as figuras se erguendo dos caixões, de braços abertos', conselho: 'Um chamado antigo voltou; responder é decidir, não é esperar um sinal melhor.', conselhoInvertido: 'Autocrítica não é avaliação: julgue o ato, não a pessoa que você é.' },
  'major-21': { cena: 'a figura dançando dentro da coroa de louros, com as quatro criaturas nos cantos', conselho: 'Feche o ciclo por inteiro antes de abrir o próximo — reconhecer o fim faz parte.', conselhoInvertido: 'Falta um detalhe pra fechar e é ele que segura tudo; descubra qual é.' },

  'paus-01': { cena: 'a mão saindo da nuvem segurando um bastão que ainda brota folhas', conselho: 'A faísca é real, mas ainda é faísca — dê hoje o primeiro passo concreto.', conselhoInvertido: 'A vontade existe e não sai do lugar: reduza o projeto ao menor passo possível.' },
  'paus-02': { cena: 'o homem no alto do castelo com o globo na mão, olhando o mar, um bastão preso à parede e outro na mão', conselho: 'Escolha entre o mapa e o mundo: planejar mais não substitui decidir.', conselhoInvertido: 'O medo do desconhecido está disfarçado de "ainda não é hora".' },
  'paus-03': { cena: 'a figura de costas no penhasco, três bastões fincados, vendo os navios partirem', conselho: 'O que você lançou já está a caminho; agora é acompanhar, não recomeçar.', conselhoInvertido: 'O atraso é do prazo, não do projeto — revise a expectativa antes de revisar o plano.' },
  'paus-04': { cena: 'quatro bastões floridos formando um pórtico com guirlanda, e a festa acontecendo atrás', conselho: 'Alguma coisa já foi construída e ainda não foi reconhecida — reconheça antes de seguir.', conselhoInvertido: 'Ou a base está instável, ou a comemoração está sendo adiada; cuide da casa primeiro.' },
  'paus-05': { cena: 'cinco jovens com bastões erguidos numa escaramuça confusa, mais treino do que guerra', conselho: 'Isso é escaramuça, não guerra: arbitre o combinado em vez de vencer a discussão.', conselhoInvertido: 'O conflito virou pra dentro — nomeie o que você não disse.' },
  'paus-06': { cena: 'o cavaleiro coroado de louros desfilando entre os que caminham a pé', conselho: 'Aceite o reconhecimento sem se convencer de que ele é permanente.', conselhoInvertido: 'Se o mérito não veio, confira o que foi entregue antes de culpar a plateia.' },
  'paus-07': { cena: 'a figura no alto do terreno defendendo a posição contra seis bastões que sobem', conselho: 'Vale defender a posição, desde que ela ainda seja sua — confira isso antes de gastar força.', conselhoInvertido: 'A pressão venceu pelo cansaço; escolha uma frente só e solte as outras.' },
  'paus-08': { cena: 'oito bastões atravessando o céu aberto em pleno voo, sem ninguém na cena', conselho: 'As coisas andam rápido agora: responda no ritmo em vez de segurar.', conselhoInvertido: 'O que empacou pede um destravamento simples, não um plano novo.' },
  'paus-09': { cena: 'o homem ferido na cabeça, apoiado no bastão, com oito bastões enfileirados atrás como cerca', conselho: 'Você está ferido e ainda de pé — só não confunda vigilância com desconfiar de tudo.', conselhoInvertido: 'A guarda alta virou muro; verifique se ainda existe inimigo do lado de fora.' },
  'paus-10': { cena: 'a figura curvada carregando dez bastões que tapam a própria vista da cidade logo à frente', conselho: 'O fardo precisa ser pousado, não carregado melhor: largue uma parte ou divida.', conselhoInvertido: 'Você já está soltando carga — escolha qual sai primeiro e não pegue outra no lugar.' },
  'paus-11': { cena: 'o jovem de pé no deserto olhando o alto do bastão como quem lê uma notícia', conselho: 'Chegou uma ideia ou notícia nova; investigue antes de anunciar.', conselhoInvertido: 'Muita ideia e nenhum começo: escolha uma e dê um prazo a ela.' },
  'paus-12': { cena: 'o cavalo empinado e o cavaleiro de armadura partindo em disparada', conselho: 'Boa hora pra partir — com a ressalva de sempre: saiba pra onde.', conselhoInvertido: 'Impulso sem direção deixa projeto pela metade; termine um antes do próximo.' },
  'paus-13': { cena: 'a rainha de frente, girassol na mão e o gato preto sentado aos pés', conselho: 'Sustente o que é seu com calor, sem precisar convencer ninguém.', conselhoInvertido: 'Se a insegurança for quem fala, ela vai sair com som de controle — repare nisso.' },
  'paus-14': { cena: 'o rei ligeiramente de lado no trono de salamandras, bastão firme na mão', conselho: 'Lidere pela visão e delegue a execução; centralizar aqui trava tudo.', conselhoInvertido: 'A promessa ficou maior que a entrega — ajuste o tamanho do que você prometeu.' },

  'copas-01': { cena: 'a mão na nuvem oferecendo a taça de cinco jorros, com a pomba descendo', conselho: 'Há uma abertura afetiva disponível; receber também é um ato.', conselhoInvertido: 'O canal fechou por proteção — não force, mas repare no que o fechou.' },
  'copas-02': { cena: 'os dois se encarando e trocando taças sob o caduceu e a cabeça de leão', conselho: 'Vínculo entre iguais pede acordo dito em voz alta, não suposto.', conselhoInvertido: 'A troca está desigual; diga qual é o desequilíbrio em vez de compensar sozinho.' },
  'copas-03': { cena: 'as três dançando em roda com as taças erguidas, no meio da colheita', conselho: 'Celebre com quem esteve junto — laço também se mantém em festa.', conselhoInvertido: 'Excesso ou fofoca está corroendo o grupo; recolha-se um pouco.' },
  'copas-04': { cena: 'o jovem de braços cruzados sob a árvore, ignorando a quarta taça que a nuvem oferece', conselho: 'Uma oferta está estendida e você não está olhando — repare no que já chegou.', conselhoInvertido: 'O tédio está passando; volte a aceitar os convites pequenos.' },
  'copas-05': { cena: 'a figura de manto preto olhando as três taças caídas, sem ver as duas ainda de pé atrás dela', conselho: 'Três taças caíram e duas seguem de pé — vire-se pras que ficaram, sem apressar o luto.', conselhoInvertido: 'O perdão está começando a caber; siga em frente sem exigir de si que esqueça.' },
  'copas-06': { cena: 'a criança entregando a taça florida a outra, no pátio da casa antiga', conselho: 'Memória é boa companhia, não endereço: visite sem se mudar pra lá.', conselhoInvertido: 'Idealizar o passado está impedindo o presente de ganhar cor.' },
  'copas-07': { cena: 'as sete taças na nuvem, cada uma com uma visão diferente, e só uma com algo real dentro', conselho: 'Das sete visões, uma é real — elimine primeiro as opções bonitas e vazias.', conselhoInvertido: 'A névoa baixou: escolha agora, enquanto ainda está claro.' },
  'copas-08': { cena: 'a figura de costas indo embora sob a lua, deixando oito taças empilhadas com uma falha no meio', conselho: 'Sair do que já não alimenta é uma perda voluntária — e às vezes é o caminho.', conselhoInvertido: 'Ficar por comodismo também é escolha; nomeie o que te segura.' },
  'copas-09': { cena: 'o anfitrião satisfeito de braços cruzados, com as nove taças alinhadas na bancada atrás', conselho: 'O desejo se realizou; repare se ele ainda era o desejo certo.', conselhoInvertido: 'Satisfação de vitrine não sustenta — pergunte o que você realmente queria.' },
  'copas-10': { cena: 'o arco-íris de dez taças sobre o casal e as duas crianças dançando', conselho: 'Harmonia de casa se cuida em dia comum, não só em foto.', conselhoInvertido: 'Há um desalinhamento de valores dentro de casa; trate antes que vire rotina.' },
  'copas-11': { cena: 'o jovem que olha, surpreso, o peixe que apareceu dentro da taça', conselho: 'Uma mensagem afetiva ou criativa está surgindo; dê espaço mesmo sem entender ainda.', conselhoInvertido: 'Imaturidade emocional está atrapalhando — sua ou dela; não leve tudo pro pessoal.' },
  'copas-12': { cena: 'o cavaleiro avançando devagar à beira do rio, taça estendida à frente', conselho: 'O convite é sincero; verifique se a proposta acompanha o encanto.', conselhoInvertido: 'Promessa bonita sem data é só promessa — peça a data.' },
  'copas-13': { cena: 'a rainha à beira-mar, absorta na taça fechada e ornamentada que só ela vê por dentro', conselho: 'Sua leitura emocional está afiada; cuide de si com o mesmo cuidado que oferece.', conselhoInvertido: 'Absorver o sentimento dos outros virou peso — refaça o contorno entre você e eles.' },
  'copas-14': { cena: 'o rei no trono em pleno mar agitado, sem se molhar', conselho: 'Sentir e decidir no mesmo gesto: maturidade aqui é não afogar nem congelar.', conselhoInvertido: 'Frieza ou chantagem afetiva estão em jogo; verifique de que lado elas estão.' },

  'espadas-01': { cena: 'a mão na nuvem erguendo a espada, com a coroa e o ramo pendurados na ponta', conselho: 'A verdade está disponível e corta dos dois lados — use uma vez, com precisão.', conselhoInvertido: 'A informação está distorcida; confirme na fonte antes de agir.' },
  'espadas-02': { cena: 'a mulher vendada, de costas pro mar, equilibrando duas espadas cruzadas sobre o peito', conselho: 'Tire a venda antes de decidir: o impasse é falta de dado, não falta de coragem.', conselhoInvertido: 'A decisão está sendo forçada pelo prazo; escolha o critério antes de escolher o lado.' },
  'espadas-03': { cena: 'as três espadas atravessando o coração, sob a chuva e o céu fechado', conselho: 'A dor é real e nomeá-la é o trabalho de hoje — não corra pra positivar.', conselhoInvertido: 'A recuperação começou, aos poucos; não confunda cicatriz com ferida aberta.' },
  'espadas-04': { cena: 'o cavaleiro deitado em pedra na capela, três espadas na parede e uma sob o corpo', conselho: 'Descansar aqui faz parte da estratégia; a batalha continua depois.', conselhoInvertido: 'Ou você para agora, ou o corpo para por você.' },
  'espadas-05': { cena: 'o vencedor recolhendo as espadas enquanto os outros dois se afastam de costas', conselho: 'Confira o preço da vitória antes de comemorar — pode não valer o que custou.', conselhoInvertido: 'Há espaço pra reconciliação; alguém precisa dar o primeiro passo e pode ser você.' },
  'espadas-06': { cena: 'o barqueiro levando a mulher e a criança pra outra margem, seis espadas fincadas na proa', conselho: 'A travessia já começou: leve o essencial e aceite que a margem nova é estranha no início.', conselhoInvertido: 'Você quer ir e segue atracado — veja o que ainda está preso na outra margem.' },
  'espadas-07': { cena: 'a figura saindo do acampamento na ponta dos pés com cinco espadas, deixando duas fincadas', conselho: 'Estratégia discreta pode ser legítima; se precisa esconder de todo mundo, não é.', conselhoInvertido: 'É hora de confessar ou devolver, antes que apareça por outra via.' },
  'espadas-08': { cena: 'a mulher amarrada e vendada entre oito espadas, com as cordas frouxas e o chão livre à frente', conselho: 'As cordas estão frouxas e o chão está livre: a prisão é mais mental do que real.', conselhoInvertido: 'Você começou a enxergar a saída; dê um passo pequeno e confira que ele sustenta.' },
  'espadas-09': { cena: 'a figura sentada na cama no escuro, o rosto nas mãos, nove espadas alinhadas na parede', conselho: 'O sofrimento está maior na cabeça do que no fato — confira o fato de manhã, acordado.', conselhoInvertido: 'A angústia está cedendo, ou está escondida; conte pra alguém e descubra qual das duas.' },
  'espadas-10': { cena: 'a figura caída de bruços com dez espadas nas costas, e o céu já clareando no horizonte', conselho: 'O fundo do poço tem uma vantagem: daqui só se sobe, e o dia já está clareando.', conselhoInvertido: 'Você sobreviveu — o cuidado agora é não repetir o mesmo roteiro por hábito.' },
  'espadas-11': { cena: 'o jovem em pé no alto do morro ventoso, espada erguida, olhando por cima do ombro', conselho: 'Curiosidade e vigilância são úteis; observar não é vigiar todo mundo.', conselhoInvertido: 'Fofoca e informação torta estão circulando: não repasse o que você não confirmou.' },
  'espadas-12': { cena: 'o cavaleiro em disparada contra o vento, espada apontada à frente', conselho: 'Rapidez é a força aqui; só verifique se você está indo ou fugindo.', conselhoInvertido: 'A pressa está virando atropelo — releia antes de enviar.' },
  'espadas-13': { cena: 'a rainha de perfil no trono das nuvens, espada erguida e a mão aberta em convite', conselho: 'Fale com clareza e sem crueldade: honestidade não precisa doer de propósito.', conselhoInvertido: 'A crítica está cortando quem você ama; pergunte de que dor ela vem.' },
  'espadas-14': { cena: 'o rei de frente no trono, espada levemente inclinada e o olhar atravessando quem chega', conselho: 'Decida pelo critério e não pelo humor — e escreva o critério.', conselhoInvertido: 'Argumento sendo usado como poder; se você está do lado forte, recue um passo.' },

  'ouros-01': { cena: 'a mão na nuvem sustentando o pentáculo sobre o jardim florido, com o arco de sebe abrindo caminho', conselho: 'Uma oportunidade material concreta chegou; trate como semente, não como colheita.', conselhoInvertido: 'Ou a oportunidade escapou, ou a base não estava pronta — confira qual das duas.' },
  'ouros-02': { cena: 'o malabarista equilibrando dois pentáculos na fita em forma de oito, com navios no mar agitado atrás', conselho: 'Equilibrar dois compromissos é possível hoje; um terceiro derruba os dois.', conselhoInvertido: 'O malabarista cansou: corte um compromisso em vez de acelerar.' },
  'ouros-03': { cena: 'o artesão no andaime explicando o trabalho ao monge e ao mestre de obras', conselho: 'Trabalho bom aqui é trabalho combinado — alinhe o que cada um entrega.', conselhoInvertido: 'Falta combinar antes de executar; a falha é de coordenação, não de esforço.' },
  'ouros-04': { cena: 'a figura coroada agarrada a um pentáculo, um na cabeça e um sob cada pé, com a cidade atrás', conselho: 'Guardar faz sentido; segurar tudo com as duas mãos é o que impede de receber.', conselhoInvertido: 'Ou o medo de perder afrouxou, ou o controle apertou — verifique qual dos dois.' },
  'ouros-05': { cena: 'os dois andarilhos passando na neve por baixo do vitral aceso que eles não olham', conselho: 'Falta amparo e há ajuda a poucos passos, atrás do vitral aceso: peça.', conselhoInvertido: 'A escassez está passando; aceite a ajuda que aparecer sem ler isso como derrota.' },
  'ouros-06': { cena: 'o mercador pesando na balança e distribuindo moedas a dois mendigos ajoelhados', conselho: 'Dar e receber precisam ficar claros — quem segura a balança define os termos.', conselhoInvertido: 'Confira se a generosidade tem preço embutido, de um lado ou do outro.' },
  'ouros-07': { cena: 'o lavrador apoiado na enxada olhando os sete pentáculos no arbusto que ainda não colheu', conselho: 'A safra ainda não está pronta; avaliar agora é melhor do que colher verde.', conselhoInvertido: 'Se o esforço não rende há tempo demais, o problema pode ser a plantação, não a paciência.' },
  'ouros-08': { cena: 'o artesão sentado cinzelando o oitavo pentáculo, com os já prontos pendurados ao lado', conselho: 'Repetição é o método aqui: a habilidade se constrói fazendo de novo.', conselhoInvertido: 'Perfeccionismo ou trabalho sem sentido — nos dois casos falta destino pro que você faz.' },
  'ouros-09': { cena: 'a mulher no próprio jardim de vinhas, com o falcão encapuzado pousado na mão', conselho: 'Você construiu o próprio jardim; desfrutar dele também é parte do trabalho.', conselhoInvertido: 'A independência está mais na aparência do que na conta; olhe os números.' },
  'ouros-10': { cena: 'as três gerações sob o arco da cidade, os cães aos pés do velho e os dez pentáculos espalhados na cena', conselho: 'Pense no longo prazo e em quem vem depois — legado se constrói em decisão comum.', conselhoInvertido: 'Há disputa ou instabilidade na base familiar; trate o combinado, não a pessoa.' },
  'ouros-11': { cena: 'o jovem no campo segurando o pentáculo diante dos olhos, completamente absorto', conselho: 'Um estudo ou trabalho novo começa devagar; trate o começo como aprendizado.', conselhoInvertido: 'Planejar sem começar é procrastinação com nome bonito.' },
  'ouros-12': { cena: 'o cavaleiro parado no campo arado, cavalo pesado e imóvel, pentáculo na mão', conselho: 'Devagar e sempre é literalmente a leitura: constância vence brilho aqui.', conselhoInvertido: 'A rotina virou estagnação; mude uma variável pequena.' },
  'ouros-13': { cena: 'a rainha no trono florido olhando pro pentáculo no colo como quem cuida de algo vivo', conselho: 'Cuidar do concreto — corpo, casa, dinheiro — também é cuidado afetivo.', conselhoInvertido: 'Você cuidou de tudo menos de si; o autocuidado aqui é material, não motivacional.' },
  'ouros-14': { cena: 'o rei no trono de cachos de uva e cabeças de touro, com o castelo já construído atrás', conselho: 'A base está construída; administre com generosidade em vez de acumular.', conselhoInvertido: 'Rigidez financeira ou autoritarismo: o recurso está servindo a você, ou o contrário?' },
};

// ---------------------------------------------------------------------------
// A GRADE DA GOLDEN DAWN NOS 22 MAIORES — letra hebraica, classe no Sepher
// Yetzirah e caminho na Árvore da Vida.
//
// Fonte: Cipher Manuscripts / "Book T" da Hermetic Order of the Golden Dawn,
// publicados por Israel Regardie em "The Golden Dawn" (1937-1940). Tabela
// conferida em docs/tradicao/05, §4.1. A base é o Sepher Yetzirah, que divide
// as 22 letras em 3 mães (elementos), 7 duplas (planetas) e 12 simples (signos)
// — e é por isso que, nesta atribuição, os doze signos caem em ordem zodiacal
// natural de Áries (O Imperador) a Peixes (A Lua).
//
// A troca Força VIII ⇄ Justiça XI, que quase todo mundo credita a Waite, está
// nos Cipher Manuscripts, ANTERIORES ao baralho: ela existe exatamente para pôr
// Leão (Teth) e Libra (Lamed) na ordem certa. Waite herdou; não inventou.
// ---------------------------------------------------------------------------
const MAJOR_GD_PATH = {
  'major-00': ['Aleph', 'mãe', 11],
  'major-01': ['Beth', 'dupla', 12],
  'major-02': ['Gimel', 'dupla', 13],
  'major-03': ['Daleth', 'dupla', 14],
  'major-04': ['Heh', 'simples', 15],
  'major-05': ['Vav', 'simples', 16],
  'major-06': ['Zayin', 'simples', 17],
  'major-07': ['Cheth', 'simples', 18],
  'major-08': ['Teth', 'simples', 19],
  'major-09': ['Yod', 'simples', 20],
  'major-10': ['Kaph', 'dupla', 21],
  'major-11': ['Lamed', 'simples', 22],
  'major-12': ['Mem', 'mãe', 23],
  'major-13': ['Nun', 'simples', 24],
  'major-14': ['Samekh', 'simples', 25],
  'major-15': ['Ayin', 'simples', 26],
  'major-16': ['Peh', 'dupla', 27],
  'major-17': ['Tzaddi', 'simples', 28],
  'major-18': ['Qoph', 'simples', 29],
  'major-19': ['Resh', 'dupla', 30],
  'major-20': ['Shin', 'mãe', 31],
  'major-21': ['Tav', 'dupla', 32],
};

// ---------------------------------------------------------------------------
// WAITE, 1911, VERBATIM — só onde a citação está conferida.
//
// Cada entrada: a orientação a que a citação pertence na lista dele, o inglês
// literal, e a `nota` que diz o que ESTE app faz com aquilo. A nota existe
// porque a citação sozinha enganaria: em quase todos estes casos a leitura
// moderna (a que o app entrega) diverge de Waite, e esconder isso seria
// exatamente o tipo de mentira por omissão que docs/tradicao/05 §7 proíbe.
//
// 11 de 78 cartas. As outras 67 ficam com `null` porque a citação não foi
// conferida no texto — e "não encontrei a fonte" é uma resposta melhor do que
// uma citação plausível.
//
// DE ONDE VEM CADA UMA (corrigido em 31/07/2026 — a versão anterior deste
// comentário dizia que as 11 estavam conferidas em docs/tradicao/05, e três
// não estavam; num arquivo cujo assunto é rigor de fonte, essa é a pior linha
// possível para se estar errado):
//   • CONFERIDAS NA BASE, docs/tradicao/05 §5 itens 12-14 e §6.1 — O Louco,
//     A Imperatriz, O Imperador, O Eremita, A Roda, A Morte, A Temperança,
//     A Estrela. São sete arcanos e oito entradas; é o núcleo do argumento
//     "as duas metades do RWS não contam a mesma história".
//   • DO "PICTORIAL KEY" DIRETO, ainda NÃO transcritas na base — A Torre,
//     o Cinco de Copas e o Três de Espadas. Ficam porque são o registro seco
//     que o app usa como modelo de como se diz carta dura sem mentir, mas
//     estão marcadas aqui e devem ser transcritas para docs/tradicao/05 na
//     próxima passagem na base (ver docs/tradicao/99-o-que-falta.md).
//
// TRUNCAMENTO: onde a citação é um TRECHO da entrada de Waite, e não a entrada
// inteira, o trecho leva reticências. Sem elas o campo mente pelo formato: diz
// "verbatim" e entrega uma lista aparada no ponto que convém ao app. É o que
// acontecia com O Eremita ("Prudence, circumspection" abre a lista dele) e com
// A Temperança — os dois corrigidos em 31/07/2026.
// ---------------------------------------------------------------------------
const WAITE_1911 = {
  'major-00': {
    orientacao: 'direta',
    verbatim: 'Folly, mania, extravagance, intoxication, delirium, frenzy.',
    nota: 'Na lista de 1911 O Louco é isso — loucura, não salto de fé. O app lê a IMAGEM de Pamela Colman Smith (o pé na borda do penhasco), que é a escola contemporânea majoritária. É uma escolha, e ela não é de Waite.',
  },
  'major-03': {
    orientacao: 'invertida',
    verbatim: 'Light, truth, the unravelling of involved matters, public rejoicings.',
    nota: 'Repare: em Waite a Imperatriz INVERTIDA é luz e verdade, e a direta dele inclui "difficulty, doubt, ignorance". A ideia de que invertida é sempre a energia travada é do século XX (Gray, Pollack, Greer), não de 1911.',
  },
  'major-04': {
    orientacao: 'invertida',
    verbatim: 'Benevolence, compassion, credit.',
    nota: 'Mais uma invertida que em Waite é melhor que a direta. O app usa a escola contemporânea (bloqueio, excesso, interiorização) e diz que é contemporânea.',
  },
  'major-09': {
    orientacao: 'direta',
    verbatim: '…treason, dissimulation, roguery, corruption.',
    nota: 'Repare nas reticências: este é um TRECHO da lista direta do Eremita, não ela inteira — a base registra que o significado direto em Waite "inclui" estas quatro palavras, ao lado de outras. O app fica com a imagem, a lanterna que ilumina um passo por vez, e o que ele não faz é fingir que a lista de 1911 é só bondade e sabedoria.',
  },
  'major-10': {
    orientacao: 'invertida',
    verbatim: 'Increase, abundance, superfluity.',
    nota: 'A Roda invertida é POSITIVA em Waite. É o exemplo mais limpo de que "invertida = oposto" nunca foi a regra dele.',
  },
  'major-13': {
    orientacao: 'direta',
    verbatim: 'End, mortality, destruction, corruption; also, for a man, the loss of a benefactor; for a woman, many contrarieties; for a maid, failure of marriage projects.',
    nota: '"A Morte nunca significou morte" é falso como afirmação histórica: a lista de 1911 abre exatamente assim. Ler a carta como fim de forma e transformação é uma escolha ética do século XX — é a que este app faz, e não vamos fingir que é antiga.',
  },
  'major-14': {
    orientacao: 'invertida',
    verbatim: 'Things connected with churches, religions, sects, the priesthood…',
    nota: 'Uma invertida que em Waite não é nem melhor nem pior — é LATERAL, sobre outro assunto. Mais uma vez: a inversão dele não é oposto.',
  },
  'major-16': {
    orientacao: 'direta',
    verbatim: 'Misery, distress, indigence, adversity, calamity, disgrace, deception, ruin. It is a card in particular of unforeseen catastrophe.',
    nota: 'Oito substantivos e ponto. É este o registro seco da tradição, e é por isso que o app não adoça a Torre. O que o app NÃO faz é transformar isso em sentença: a carta descreve a natureza do que está em jogo, não decreta desfecho.',
  },
  'major-17': {
    orientacao: 'direta',
    verbatim: 'Loss, theft, privation, abandonment; another reading says—hope and bright prospects.',
    nota: 'O caso mais chocante da lista: a esperança é a SEGUNDA leitura de Waite, apresentada como "outra versão". O app fica com a esperança, que é a leitura moderna e a certa para o produto, e nunca a credita ao Pictorial Key.',
  },
  'copas-05': {
    orientacao: 'direta',
    verbatim: 'It is a card of loss, but something remains over; three have been taken, but two are left.',
    nota: 'O modelo de como se diz uma carta dura sem mentir: nomeia a perda inteira, e o alívio que vem depois é um FATO DA IMAGEM (duas taças ainda de pé), não um chavão de consolo.',
  },
  'espadas-03': {
    orientacao: 'direta',
    verbatim: '…and all that the design signifies naturally, being too simple and obvious to call for specific enumeration.',
    nota: 'É o FIM da entrada dele — daí as reticências — e Waite termina o Três de Espadas se recusando a explicar, porque a imagem já disse. É a licença mais antiga que este app tem para ser direto em vez de enrolar. E não é coincidência que seja justamente esta carta: é no Três de Espadas que mais se vê o quanto Pamela Colman Smith se inspirou no Sola Busca, um baralho italiano de c. 1491 — a dívida visual mais documentada dela.',
  },
};

function withDepth(card) {
  const depth = CARD_DEPTH[card.id] || {};
  const gd = MAJOR_GD_PATH[card.id] || null;
  return {
    ...card,
    cena: depth.cena || null,
    conselho: depth.conselho || null,
    conselhoInvertido: depth.conselhoInvertido || null,
    letra: gd ? gd[0] : null,
    classeSY: gd ? gd[1] : null,
    caminho: gd ? gd[2] : null,
    waite1911: WAITE_1911[card.id] || null,
  };
}

function buildMinorArcana() {
  const cards = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      const meaning = MINOR_MEANINGS[suit.key][rank.number];
      cards.push(withDepth({
        id: `${suit.key}-${String(rank.number).padStart(2, '0')}`,
        name: `${rank.name} de ${suit.name}`,
        arcana: 'menor',
        suit: suit.key,
        number: rank.number,
        keywords: meaning.keywords,
        uprightMeaning: meaning.upright,
        reversedMeaning: meaning.reversed,
        element: suit.element,
        astro: astroForMinor(suit.key, rank.number),
        tituloGD: titleForMinor(suit.key, rank.number),
        grau: RANK_GRADES[rank.number] || null,
        icon: suit.icon,
      }));
    });
  });
  return cards;
}

// Nos Maiores a atribuição astrológica já está em `element` (planeta/signo da
// Golden Dawn), então `astro`/`tituloGD`/`grau` ficam null de propósito — em vez
// de repetir o mesmo dado em dois campos.
export const MAJOR_ARCANA = MAJOR_ARCANA_RAW.map((card) => withDepth({
  ...card, astro: null, tituloGD: null, grau: null,
}));

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

// Leitura transversal da TIRAGEM (não da carta): grau repetido, proporção de
// Maiores e naipe dominante. É a pergunta que separa quem estudou de quem lê
// carta por carta — "por que caíram três Cincos?" tem resposta, e até agora o
// app não tinha como dizer nada sobre isso.
// Devolve string ou null — nunca fabrica padrão onde não há.
//
// GRAU DA FONTE, e ele é modesto (correção de 31/07/2026): repetição de grau,
// naipe dominante e proporção Maiores × menores são **[TP] — prática
// consolidada do século XX**, não doutrina antiga (docs/tradicao/05, §3.5). O
// que É [FP] na relação entre cartas é outra coisa: contagem/emparelhamento e
// dignidades elementares, da Opening of the Key da Golden Dawn (Book T) — e é
// só a dignidade elemental que este app credita à Ordem, em
// lib/tarotThemes.js. Aqui, portanto, nada de "na leitura clássica" nem de "a
// tradição lê isso": este texto vai pra tela desde 31/07/2026 e a única coisa
// que ele pode dizer sobre si mesmo é a idade que tem. Coberto por teste
// (test/tarotVoice.test.js, "o app nunca vende a tiragem de três como antiga").
// TEXTOS PT da leitura transversal, extraídos das template literals inline em
// 31/07/2026 SEM MUDAR UM BYTE (golden em test/tarotIdiomas.test.js). Viraram
// tabela por causa dos idiomas: es/en vivem em lib/traducoes/tarot.es.js e
// tarot.en.js com ESTAS MESMAS chaves e placeholders; o pacote pt
// (lib/traducoes/tarot.pt.js) importa esta constante para o teste de paridade
// — uma fonte só, sem cópia que dessincroniza.
export const SPREAD_TEXTS = {
  grauRepetido: 'O mesmo grau — o número da carta — saiu {qtd} vezes nesta tiragem. A leitura de conjunto pesa esse padrão mais que cada carta isolada — prática que se firmou no séc. XX. {grade}',
  maiores: '{qtd} Arcanos Maiores em {total} cartas: a leitura contemporânea toma isso como assunto que não está inteiramente nas suas mãos — é pano de fundo, não detalhe de rotina.',
  naipeDominante: 'Tiragem dominada por {naipe}: o assunto inteiro está concentrado nesse território.',
  naipeDominanteLabel: { paus: 'Paus (fogo — ação e desejo)', copas: 'Copas (água — afeto e vínculo)', espadas: 'Espadas (ar — mente e verdade)', ouros: 'Ouros (terra — matéria e corpo)' },
};

// Mesmo fill de lib/tarotThemes.js, duplicado de propósito (3 linhas): importar
// de lá criaria ciclo — tarotThemes importa o pacote pt, que importa este
// arquivo.
function fillSpread(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
}

// `lang` entrou em 31/07/2026 com default 'pt' — chamada antiga continua
// saindo PT byte a byte. es/en vêm dos pacotes standalone (sem import circular:
// tarot.es/tarot.en não importam nada daqui).
export function getSpreadPattern(cards, lang = 'pt') {
  if (!Array.isArray(cards) || cards.length < 2) return null;
  const texts = lang === 'es' ? tarotEs.spread : lang === 'en' ? tarotEn.spread : SPREAD_TEXTS;
  const grades = lang === 'es' ? tarotEs.rankGrades : lang === 'en' ? tarotEn.rankGrades : RANK_GRADES;
  const notes = [];

  const byNumber = {};
  cards.forEach((c) => {
    if (c.arcana !== 'menor') return;
    byNumber[c.number] = (byNumber[c.number] || 0) + 1;
  });
  const repeatedRank = Object.keys(byNumber).find((n) => byNumber[n] >= 2);
  if (repeatedRank && grades[repeatedRank]) {
    const qtd = byNumber[repeatedRank];
    notes.push(fillSpread(texts.grauRepetido, { qtd, grade: grades[repeatedRank] }));
  }

  const majors = cards.filter((c) => c.arcana === 'maior').length;
  if (majors >= 2) {
    notes.push(fillSpread(texts.maiores, { qtd: majors, total: cards.length }));
  }

  const bySuit = {};
  cards.forEach((c) => { if (c.suit) bySuit[c.suit] = (bySuit[c.suit] || 0) + 1; });
  const dominant = Object.keys(bySuit).find((s) => bySuit[s] >= 3);
  if (dominant) {
    notes.push(fillSpread(texts.naipeDominante, { naipe: texts.naipeDominanteLabel[dominant] }));
  }

  return notes.length ? notes.join(' ') : null;
}

export default TAROT_DECK;
