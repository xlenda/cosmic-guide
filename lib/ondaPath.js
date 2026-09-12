// A MATEMÁTICA DA ONDA — o gerador do `d` das faixas curvas (12/09/2026).
//
// POR QUE ISTO É UM MÓDULO SEPARADO. O componente components/FaixaCurva.js só
// desenha; a decisão de QUAL curva é lógica pura, e lógica pura é a única coisa
// aqui que dá pra provar por mutação num teste node:test (não há
// react-test-renderer no projeto — conferido em 12/09/2026). Então a curva mora
// aqui e o teste é test/ondaPath.test.js.
//
// O QUE ESTÁ SENDO COPIADO. Nos 66 prints do concorrente nenhuma seção começa
// com linha reta: a borda de cima de cada faixa é uma ONDA LARGA E ASSIMÉTRICA
// — sobe de um lado, desce do outro, uma crista só. Duas coisas fazem isso
// parecer caro em vez de parecer papel de parede:
//   1. a onda é RASA (a crista ocupa uns 4-6% da altura da tela, não 20%);
//   2. CADA FAIXA TEM UMA ONDA DIFERENTE. Repetir a mesma curva empilhada é
//      exatamente o que transforma elegância em textura de fundo barato.
//
// COMO A VARIAÇÃO FUNCIONA. `ondaPath(semente)` é DETERMINÍSTICA: a mesma
// semente devolve sempre a mesma curva. Não é Math.random — com random a onda
// mudaria a cada render e a tela "formigaria" no scroll (mesma lição do céu
// determinístico de components/CosmicScene.js). A semente é um número ou uma
// string (o nome da seção serve: 'mapa', 'sobre', 'planos' — cada seção ganha
// sua onda e a mantém pra sempre).
//
// O QUE ISTO NÃO É: não é animação, não é física de água, não é gerador de
// terreno. São duas curvas de Bézier cúbicas dentro de um viewBox 100×100 com
// preserveAspectRatio="none" — o SVG estica na horizontal e a curva acompanha
// qualquer largura de tela sem recalcular nada.

// Hash determinístico de string/número -> fração 0..1. O sin(x)*grande e pega a
// parte fracionária é o truque clássico de shader portado pra JS: espalha bem,
// custa nada, e é estável entre plataformas (web e nativo dão o mesmo double).
function fracao(n) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

// String -> número, pra semente poder ser o nome da seção.
function numeroDaSemente(semente) {
  if (typeof semente === 'number' && Number.isFinite(semente)) return semente;
  const s = String(semente == null ? '' : semente);
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) % 100000;
  }
  return h + 1;
}

// A ALTURA DA ONDA em unidades do viewBox (0..100). 100 = a crista ocupa a
// caixa inteira. Estes limites são o "raso" dos prints: nunca chapado, nunca
// montanha.
export const ONDA_MIN = 28;
export const ONDA_MAX = 62;

/**
 * Devolve o atributo `d` de um <Path> que preenche a faixa: borda de cima em
 * onda, os outros três lados retos. Pensado pra viewBox="0 0 100 100" com
 * preserveAspectRatio="none".
 *
 * @param {string|number} semente  identidade da faixa (nome da seção serve)
 * @returns {string} o `d`
 */
export function ondaPath(semente) {
  const n = numeroDaSemente(semente);
  const a = fracao(n);
  const b = fracao(n + 1);
  const c = fracao(n + 2);

  // Onde a curva começa e termina na vertical, e onde fica a crista. Os três
  // saem de frações diferentes da mesma semente, então nenhuma faixa repete a
  // anterior mas todas ficam dentro da faixa de "raso".
  const esquerda = ONDA_MIN + a * (ONDA_MAX - ONDA_MIN);
  const direita = ONDA_MIN + b * (ONDA_MAX - ONDA_MIN);
  // A crista sobe ACIMA das duas pontas (valor menor = mais alto no SVG), e o
  // quanto ela sobe também varia. Sem isto a "onda" vira uma rampa.
  const crista = Math.max(2, Math.min(esquerda, direita) - (10 + c * 16));
  // O pico fora do centro é o que faz a curva ler como orgânica em vez de
  // simétrica. Entre 30% e 70% da largura.
  const pico = 30 + c * 40;

  const p = (v) => Math.round(v * 100) / 100;

  return [
    `M 0 ${p(esquerda)}`,
    // Sobe até a crista: controles espelhados em torno do trecho esquerdo.
    `C ${p(pico * 0.35)} ${p(esquerda)} ${p(pico * 0.65)} ${p(crista)} ${p(pico)} ${p(crista)}`,
    // Desce da crista até a ponta direita.
    `C ${p(pico + (100 - pico) * 0.35)} ${p(crista)} ${p(pico + (100 - pico) * 0.7)} ${p(direita)} 100 ${p(direita)}`,
    // Fecha o retângulo por baixo — é isto que faz a faixa ser um CHÃO
    // preenchido e não um risco.
    'L 100 100',
    'L 0 100',
    'Z',
  ].join(' ');
}

/**
 * A altura em pixels que o desenho da onda precisa ocupar acima do conteúdo.
 * Fixa de propósito: a onda é rasa, e altura proporcional à tela faria a mesma
 * faixa virar montanha no tablet.
 */
export const ONDA_ALTURA = 56;
