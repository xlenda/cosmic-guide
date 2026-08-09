// O REGISTRO DE ILUSTRAÇÃO — a porta única pro pack de arte do app.
//
// Por que existe (08/08/2026): a diferença final pro concorrente premium era
// ILUSTRAÇÃO — lá os signos são personagens (mascotes) e cada seção tem cena
// desenhada; aqui eram símbolos de fonte em círculo. O pack foi gerado com o
// Gemini na MESMA família de arte (flat, corpo lavanda/violeta, acentos
// dourados, fundo índigo-noite, estrelinhas), comprimido pra tamanho de app
// (mascote 256px ≈ 6-10KB, cena 640px) e mora em assets/ilustracoes/.
//
// REGRAS:
//   - require() ESTÁTICO por arquivo — o Metro só embala asset que consegue
//     ver em tempo de build; nada de caminho montado dinamicamente.
//   - A chave dos mascotes é o NOME do signo como o app já usa em
//     theme.js/zodiacSigns e lib/signs.js ('Áries'...'Peixes') — dado
//     interno, não input de cliente.
//   - Consumidor usa mascoteDoSigno(nome): devolve o asset ou null — e quem
//     recebe null mostra o glifo de sempre. A arte é upgrade, nunca
//     dependência: sem imagem, o app continua inteiro.
export const MASCOTES = Object.freeze({
  'Áries': require('../assets/ilustracoes/aries.jpg'),
  'Touro': require('../assets/ilustracoes/touro.jpg'),
  'Gêmeos': require('../assets/ilustracoes/gemeos.jpg'),
  'Câncer': require('../assets/ilustracoes/cancer.jpg'),
  'Leão': require('../assets/ilustracoes/leao.jpg'),
  'Virgem': require('../assets/ilustracoes/virgem.jpg'),
  'Libra': require('../assets/ilustracoes/libra.jpg'),
  'Escorpião': require('../assets/ilustracoes/escorpiao.jpg'),
  'Sagitário': require('../assets/ilustracoes/sagitario.jpg'),
  'Capricórnio': require('../assets/ilustracoes/capricornio.jpg'),
  'Aquário': require('../assets/ilustracoes/aquario.jpg'),
  'Peixes': require('../assets/ilustracoes/peixes.jpg'),
});

export function mascoteDoSigno(nome) {
  return Object.prototype.hasOwnProperty.call(MASCOTES, nome) ? MASCOTES[nome] : null;
}

// Cenas de seção — heros ilustrados (640px). Chave = a seção que a consome.
export const CENAS = Object.freeze({
  casal: require('../assets/ilustracoes/cena-casal.jpg'),
  taro: require('../assets/ilustracoes/cena-taro.jpg'),
  lua: require('../assets/ilustracoes/cena-lua.jpg'),
  planeta: require('../assets/ilustracoes/cena-planeta.jpg'),
  sonho: require('../assets/ilustracoes/cena-sonho.jpg'),
  amor: require('../assets/ilustracoes/cena-amor.jpg'),
  guia: require('../assets/ilustracoes/cena-guia.jpg'),
  loja: require('../assets/ilustracoes/cena-loja.jpg'),
  onboarding: require('../assets/ilustracoes/cena-onboarding.jpg'),
});

// Planetas pintados (256px) — chave = o nome PT que o motor já usa em
// planetPositions/personalSky/calendarioCosmico ('Sol'...'Plutão'). Dado
// interno, mesmo contrato dos mascotes: null → quem consome mostra o
// emoji/glifo de sempre.
export const PLANETAS = Object.freeze({
  'Sol': require('../assets/ilustracoes/planeta-sol.jpg'),
  'Lua': require('../assets/ilustracoes/planeta-lua.jpg'),
  'Mercúrio': require('../assets/ilustracoes/planeta-mercurio.jpg'),
  'Vênus': require('../assets/ilustracoes/planeta-venus.jpg'),
  'Marte': require('../assets/ilustracoes/planeta-marte.jpg'),
  'Júpiter': require('../assets/ilustracoes/planeta-jupiter.jpg'),
  'Saturno': require('../assets/ilustracoes/planeta-saturno.jpg'),
  'Urano': require('../assets/ilustracoes/planeta-urano.jpg'),
  'Netuno': require('../assets/ilustracoes/planeta-netuno.jpg'),
  'Plutão': require('../assets/ilustracoes/planeta-plutao.jpg'),
});

export function planetaImagem(nome) {
  return Object.prototype.hasOwnProperty.call(PLANETAS, nome) ? PLANETAS[nome] : null;
}

// Espíritos dos elementos (256px) — chave = o identificador do motor de
// lib/elementos.js (fogo/terra/ar/agua, sem acento).
export const ELEMENTOS_ARTE = Object.freeze({
  fogo: require('../assets/ilustracoes/elemento-fogo.jpg'),
  terra: require('../assets/ilustracoes/elemento-terra.jpg'),
  ar: require('../assets/ilustracoes/elemento-ar.jpg'),
  agua: require('../assets/ilustracoes/elemento-agua.jpg'),
});

export function elementoImagem(chave) {
  return Object.prototype.hasOwnProperty.call(ELEMENTOS_ARTE, chave) ? ELEMENTOS_ARTE[chave] : null;
}
