export const colors = {
  // Ameixa quase preta + metais quentes. A paleta anterior usava o mesmo
  // roxo/azul saturado de interfaces geradas em série; estes neutros deixam
  // ilustração, conteúdo e ação criarem a hierarquia em vez do gradiente.
  background: '#0B0712',
  surface: '#151019',
  surfaceElevated: '#211925',
  card: '#19121F',
  border: '#3A2E3D',
  text: '#FAF5EA',
  textSecondary: '#C9BFCB',
  textMuted: '#918593',
  accent: '#9B6AC8',
  accent2: '#755895',
  purple: '#B68BDD',
  pink: '#D96E9C',
  gold: '#E3B85F',
  teal: '#70B9AE',
  green: '#78B58D',
  amber: '#D7A452',
  red: '#D97078',
  blue: '#718CB3',
};

export const gradients = {
  hero: ['#25152D', '#3B2340', '#130C18'],
  purple: ['#8058A8', '#A678C8'],
  pink: ['#B95880', '#8058A8'],
  gold: ['#E3B85F', '#B87943'],
  teal: ['#5C9E96', '#526F8E'],
  night: ['#151019', '#0B0712'],
  card: ['#261A2B', '#151019'],
};

// ---- Tema Dourado (recompensa da Loja, ver lib/cosmeticRewards.js) ----
// A troca de paleta acontece AQUI, no próprio módulo do tema, de forma
// síncrona no carregamento — precisa rodar antes de qualquer
// StyleSheet.create das telas capturar os valores (todas importam este
// módulo primeiro). Por isso a flag vive no localStorage (leitura síncrona,
// só web): AsyncStorage é assíncrono e chegaria tarde demais. No nativo o
// tema não se aplica ainda — a Loja só oferece a recompensa na web (ver
// LojaScreen.js), pra nunca vender um efeito que não existe na plataforma.
export const GOLD_THEME_KEY = 'cosmic-gold-theme';

export function isGoldThemeActive() {
  try {
    return typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem(GOLD_THEME_KEY) === 'true';
  } catch {
    return false;
  }
}

// Liga/desliga — quem chama decide recarregar a página (a paleta só é
// recapturada pelas StyleSheets num carregamento novo).
export function setGoldThemeActive(active) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(GOLD_THEME_KEY, active ? 'true' : 'false');
    }
  } catch {}
}

if (isGoldThemeActive()) {
  colors.accent = '#C9962E';
  colors.accent2 = '#E0B34C';
  colors.purple = '#E8C878';
  colors.border = '#4A3A18';
  gradients.hero = ['#7A5A14', '#C9962E', '#5C4310'];
  gradients.purple = ['#C9962E', '#E8C878'];
  gradients.card = ['#3A2D10', '#1A1235'];
}

export const zodiacSigns = [
  { name: 'Áries', pt: 'Áries', icon: '♈', symbol: 'flame', dates: '21 Mar - 19 Abr', element: 'Fogo', color: '#FF6B7A' },
  { name: 'Touro', pt: 'Touro', icon: '♉', symbol: 'leaf', dates: '20 Abr - 20 Mai', element: 'Terra', color: '#5FD98C' },
  { name: 'Gêmeos', pt: 'Gêmeos', icon: '♊', symbol: 'people', dates: '21 Mai - 20 Jun', element: 'Ar', color: '#FFC85C' },
  { name: 'Câncer', pt: 'Câncer', icon: '♋', symbol: 'water', dates: '21 Jun - 22 Jul', element: 'Água', color: '#5CA8FF' },
  { name: 'Leão', pt: 'Leão', icon: '♌', symbol: 'sunny', dates: '23 Jul - 22 Ago', element: 'Fogo', color: '#FF8C5C' },
  { name: 'Virgem', pt: 'Virgem', icon: '♍', symbol: 'flower', dates: '23 Ago - 22 Set', element: 'Terra', color: '#5CE0D8' },
  { name: 'Libra', pt: 'Libra', icon: '♎', symbol: 'scale', dates: '23 Set - 22 Out', element: 'Ar', color: '#B57BFF' },
  { name: 'Escorpião', pt: 'Escorpião', icon: '♏', symbol: 'bug', dates: '23 Out - 21 Nov', element: 'Água', color: '#FF6BA0' },
  { name: 'Sagitário', pt: 'Sagitário', icon: '♐', symbol: 'navigate', dates: '22 Nov - 21 Dez', element: 'Fogo', color: '#FFB84D' },
  { name: 'Capricórnio', pt: 'Capricórnio', icon: '♑', symbol: 'triangle', dates: '22 Dez - 19 Jan', element: 'Terra', color: '#8A7CB0' },
  { name: 'Aquário', pt: 'Aquário', icon: '♒', symbol: 'snow', dates: '20 Jan - 18 Fev', element: 'Ar', color: '#5CE0D8' },
  { name: 'Peixes', pt: 'Peixes', icon: '♓', symbol: 'fish', dates: '19 Fev - 20 Mar', element: 'Água', color: '#6C7BFF' },
];

// =====================================================================================
// A FUNDAÇÃO — escala de espaço, escala tipográfica e profundidade do fundo
// (12/09/2026). Escrita comparando a Home do Cosmic lado a lado com os 66
// prints do concorrente.
// =====================================================================================
//
// POR QUE ISTO EXISTE. O dono olhou os dois apps e disse: "olha a elegância que
// tem no deles e não tem no meu". A elegância deles não é cor bonita — é ESPAÇO,
// UMA IDEIA POR TELA, FUNDO COM PROFUNDIDADE e TEXTO QUE RESPIRA. As duas do
// meio são decisão de tela; a primeira e a última são decisão de TOKEN, e token
// é exatamente o que faltava aqui.
//
// MEDIDO ANTES DE INVENTAR (grep em screens/ + components/, 12/09/2026):
//   padding : 14(154) 12(146) 16(123) 20(90) 10(78) 8(68) 18(54) 4(35) 40(32) 24(27)
//   margin  : 8(139) 12(123) 10(120) 14(118) 4(108) 16(95) 6(92) 20(71) 18(40) 24(20)
//   gap     : 8(160) 10(117) 6(70) 12(52) 4(38)
//   fontSize: 12(273) 13(261) 14(209) 11(182) 15(146) 10(86) 16(63) 17(42) 18(34)
//   weight  : '800'(471) '700'(263) '600'(51) '900'(37) — e só DOIS usos de peso leve
//
// O diagnóstico sai sozinho desses números. Os valores já se aglomeram em torno
// de 4/8/12/16/20-24/32/40-48 — a progressão limpa está lá, enterrada em ruído
// (11, 13, 17, 18, 22...). E 471 usos de peso 800 contra 2 de peso leve é,
// literalmente, um app que grita em vez de convidar.
//
// SÓ SE ADICIONA AQUI. Mexer neste arquivo mexe em 52 telas de uma vez: nada
// acima desta linha foi renomeado ou removido, e nada abaixo dela pode ser. Se
// um nome daqui morrer um dia, ele fica FUNCIONANDO e ganha um comentário de
// obsoleto — nunca some.
//
// -------------------------------------------------------------------------------------
// GUIA DE APLICAÇÃO — leia isto antes de mexer numa tela.
// -------------------------------------------------------------------------------------
// 1. Importe junto com o que você já importava:
//        import { colors, space, type } from '../theme';
//    (de dentro de components/ ou screens/; a Madre Maria lê por '../theme').
//
// 2. Espaço: troque o número cru pelo degrau cujo NOME descreve a relação entre
//    os dois elementos — não pelo degrau cujo número é mais perto do antigo.
//        marginBottom: 24   ->  marginBottom: space.entre
//    Um 14 solto quase sempre queria ser `space.bloco` (16) ou `space.dentro`
//    (12); decida pela relação, e o app inteiro passa a alinhar entre telas.
//
// 3. Texto: cada degrau é um estilo COMPLETO (tamanho + entrelinha + peso).
//    Espalhe com spread e ponha a cor por fora:
//        titulo: { ...type.titulo, color: colors.text },
//        corpo:  { ...type.corpo,  color: colors.textSecondary },
//    A cor fica de fora porque depende do fundo, e a fundação não sabe onde o
//    texto vai pousar.
//
// 4. A regra que muda tudo: NÃO reponha `fontWeight` depois do spread para
//    deixar "mais forte". Se o texto precisa de destaque e não é título, o que
//    falta é ESPAÇO em volta ou COR, não peso.
//
// 5. Não crie um segundo sistema. Faltou um degrau? Fale — a escala cresce aqui,
//    uma vez, e não em 52 arquivos.

// -------------------------------------------------------------------------------------
// ESPAÇO — nomeado pelo USO, não pelo tamanho.
// -------------------------------------------------------------------------------------
// Os nomes dizem QUAL usar sem ter que pensar em pixel. A regra é: quanto mais
// forte a separação entre duas coisas, maior o degrau. Escolha pela RELAÇÃO
// entre os elementos, nunca pelo número que "parece certo".
//
//   grudado (4)  — coisas que são UMA coisa só: ícone e seu rótulo, número e
//                  seu sufixo, estrela e a nota. Se dá pra ler como duas coisas
//                  separadas, o degrau está errado.
//   junto   (8)  — itens irmãos dentro do mesmo bloco: linhas de uma lista,
//                  chips lado a lado, as três estatísticas de uma fileira.
//   dentro  (12) — respiro INTERNO de elemento pequeno: padding de chip, de
//                  pílula, de badge, de botão pequeno.
//   bloco   (16) — padding interno de card, e distância entre um rótulo e o
//                  conteúdo que ele nomeia. É o degrau mais comum do app.
//   entre   (24) — distância entre BLOCOS irmãos: um card e o próximo, um
//                  parágrafo e o seguinte. Aqui começa a leitura de "são coisas
//                  diferentes".
//   secao   (32) — entre SEÇÕES da tela: o fim de um assunto e o título do
//                  próximo. É o degrau que o app hoje quase não usa, e é
//                  exatamente o que faz a tela deles respirar.
//   ar      (48) — o silêncio deliberado. Antes de um título de seção
//                  importante, depois do herói, em volta de um elemento que
//                  deve ficar sozinho. Espaço vazio não é desperdício: é o que
//                  faz o olho saber onde pousar.
//   respiro (64) — reservado à PRIMEIRA DOBRA de uma tela de uma ideia só (a
//                  "Carta diária" deles: título, data, duas linhas finas, e
//                  metade da tela é céu). Use pouco. Se aparecer três vezes na
//                  mesma tela, não é mais respiro: é buraco.
//
// Dois pares prontos, pra ninguém somar na mão:
//   tela        — padding horizontal padrão de qualquer tela (16 — o mesmo
//                 valor que 123 lugares já escolheram sozinhos).
//   fimDaLista  — padding inferior de ScrollView, pra última linha nunca morar
//                 embaixo da barra de navegação.
//
//                 O VALOR NÃO É ESTÉTICO, É MEDIDO (13/09/2026). A barra de
//                 abas virou pílula FLUTUANTE (ESTILO_PILULA em App.js):
//                 height 68 + marginBottom 10 = 78 de rodapé, dos quais 73
//                 medidos ocupados no navegador (mesmos 73 em 1280x720 e em
//                 390x844 — a pílula não escala com o viewport). Enquanto isto
//                 valeu 48, a última linha de TODA tela rolava por baixo da
//                 pílula: o toque caía no ícone da aba, não na linha. Foi
//                 assim que "Gerenciar assinatura" do Perfil passou a navegar
//                 pra /comunidade e travou o portão de regressão (cenário 4).
//
//                 Por isso a escala GANHOU UM DEGRAU, `rodape` (76), em vez de
//                 este atalho virar número solto: a lei da fundação
//                 (test/fundacaoEscalas.test.js) manda todo atalho apontar
//                 para um degrau real, e 73 não cabia em nenhum dos que
//                 existiam — `ar` (48) e `respiro` (64) ficam os dois abaixo
//                 da pílula. `rodape` é o degrau do PÉ DA TELA: o único lugar
//                 onde ele deve aparecer é um paddingBottom de lista.
//                 Se a pílula mudar de altura, `rodape` muda JUNTO.
export const space = {
  grudado: 4,
  junto: 8,
  dentro: 12,
  bloco: 16,
  entre: 24,
  secao: 32,
  ar: 48,
  respiro: 64,
  // O PÉ DA TELA (13/09/2026). Nasceu medido, não escolhido: é o primeiro
  // degrau que passa dos 73px que a pílula flutuante da barra de abas ocupa
  // (ESTILO_PILULA em App.js — height 68 + marginBottom 10). Existe como
  // degrau, e não como número solto dentro de `fimDaLista`, porque a lei da
  // fundação manda todo atalho apontar pra escala — e porque qualquer coisa
  // que precise limpar a barra de abas precisa deste mesmo valor.
  rodape: 76,

  tela: 16,
  fimDaLista: 76,
};

// -------------------------------------------------------------------------------------
// TIPOGRAFIA — o peso é EXCEÇÃO, não padrão.
// -------------------------------------------------------------------------------------
// A lei desta escala, tirada dos prints: NEGRITO É HIERARQUIA, NÃO ÊNFASE.
// No concorrente o negrito aparece no título da tela e no nome da pessoa — e
// para por aí. Todo o texto corrido é peso normal, corpo grande e entrelinha
// larga (medido no print "Casamentos de Áries": ~17px, entrelinha ~1,55, em
// cinza claro e não em branco puro). O nosso faz o oposto: 471 usos de peso 800,
// corpo de texto em 12–13px com entrelinha 1,45.
//
// Cada degrau é um OBJETO DE ESTILO COMPLETO — fontSize, lineHeight e fontWeight
// juntos, de propósito: a entrelinha é METADE do efeito, e solta ela é esquecida.
//
// ENTRELINHA. Texto corrido em ~1,6 (o respiro deles). Título em ~1,25 — título
// com entrelinha de parágrafo desmonta em linhas soltas.
//
// TAMANHOS. Progressão 11 / 13 / 15 / 17 / 20 / 24 / 32: cada degrau é
// visivelmente outro degrau. Hoje o app usa 11,12,13,14,15,16,17,18 espalhados,
// e diferença de 1px não é hierarquia — é desalinho, que é o que o olho lê como
// "menos caprichado".
export const type = {
  // ---- Títulos: aqui o peso é legítimo, é hierarquia de verdade. ----
  // Primeira dobra de uma tela de uma ideia só. Um por tela, no máximo.
  display: { fontSize: 32, lineHeight: 40, fontWeight: '800' },
  // Título de tela.
  titulo: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  // Título de seção dentro da tela, e título de card grande.
  secao: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  // Título de card comum, nome de item de lista.
  cartao: { fontSize: 17, lineHeight: 22, fontWeight: '600' },

  // ---- Texto: peso normal. SEMPRE. ----
  // Texto corrido, parágrafo, leitura longa — o degrau do "Casamentos de Áries".
  // Deve carregar a maior parte das palavras do app.
  corpo: { fontSize: 17, lineHeight: 27, fontWeight: '400' },
  // Texto corrido em espaço apertado (dentro de card, coluna estreita).
  corpoCurto: { fontSize: 15, lineHeight: 24, fontWeight: '400' },
  // Apoio: legenda, data, subtítulo, a linha que explica o título.
  apoio: { fontSize: 13, lineHeight: 20, fontWeight: '400' },
  // O menor degrau legível: crédito, nota de rodapé, selo. Não desça daqui.
  nota: { fontSize: 11, lineHeight: 17, fontWeight: '400' },

  // ---- Funcionais: peso por necessidade de toque e leitura rápida, nunca por ênfase. ----
  // Rótulo de botão e de ação.
  botao: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  // Rótulo maiúsculo de seção (o "O QUE EXIGIMOS" deles). O letterSpacing já vem
  // junto: é ele que faz maiúscula parecer intencional em vez de grito.
  etiqueta: { fontSize: 11, lineHeight: 16, fontWeight: '600', letterSpacing: 1.2 },
  // Número em destaque: idade real, contagem, porcentagem REAL calculada do mapa.
  // (Nunca porcentagem inventada — a lei de não fabricar vale aqui também.)
  numero: { fontSize: 24, lineHeight: 28, fontWeight: '700' },
};

// -------------------------------------------------------------------------------------
// PROFUNDIDADE DO FUNDO — a vinheta.
// -------------------------------------------------------------------------------------
// O céu do concorrente ESCURECE NAS BORDAS: o centro é mais claro que os cantos,
// e é só isso que separa "atmosfera" de "papel de parede". O Cosmic JÁ TEM o
// cenário certo em components/CosmicScene.js (gradiente + estrelas + colinas) —
// não existe um segundo fundo aqui, e não deve existir: dois fundos brigando é
// pior que um fundo simples. Esta constante é o que faltava NELE, e é ele o
// único que a consome (CosmicScene.js). Quem quiser profundidade numa tela não
// monta vinheta na mão: monta o CosmicScene, que já vem com ela.
//
// Como funciona: um LinearGradient escuro nas duas bordas e transparente no
// miolo, por cima do céu e por baixo de tudo. Sem SVG (não está nas
// dependências) e sem gradiente radial (não existe no React Native) — a vinheta
// VERTICAL é a que se sente, porque a tela é alta e estreita.
export const vinheta = {
  // Alfas do preto-ameixa (a família do colors.background), do topo ao rodapé.
  // As pontas seguram a borda; o miolo abre pro conteúdo respirar.
  cores: ['rgba(6,3,10,0.55)', 'rgba(6,3,10,0)', 'rgba(6,3,10,0)', 'rgba(6,3,10,0.65)'],
  locais: [0, 0.28, 0.68, 1],
};
