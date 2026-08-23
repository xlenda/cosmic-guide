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
