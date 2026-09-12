// Guarda da FUSAO visual da Madre Maria dentro do Cosmic Guide (11/09/2026).
//
// O que este teste protege, e por que cada parte existe:
//
// 1. As cores ESTRUTURAIS da Madre tem de SEGUIR o Cosmic. Se alguem congelar um
//    hex de volta em madremaria/theme.js "pra nao depender do outro arquivo", a
//    Madre volta a parecer outro app e ninguem percebe — cor errada nao lanca erro.
// 2. As cores da ALMA tem de FICAR. O fio vermelho e o NOME do projeto. Um agente
//    futuro "uniformizando a paleta" trocaria hilo por cosmic.red e apagaria a marca.
// 3. `foil` tem de continuar HEX LITERAL parseavel: ScratchRevealCard.js (paletaDeVelo
//    /aCanales) le os canais RGB dele em runtime pra gerar os quatro tons da lamina.
//    Virar rgba() ou token quebraria o veu raspavel — o gesto central do produto.
// 4. Contraste: os tokens de TEXTO tem de passar WCAG AA (4,5:1) sobre os fundos
//    novos, e `hilo` tem de CONTINUAR reprovando como texto — e por isso que a regra
//    travada no topo do theme.js proibe usa-lo assim.

const { test } = require('node:test');
const assert = require('node:assert');

const { colores, tipo, sombra, familias } = require('../madremaria/theme');
const { colors: cosmic } = require('../theme');

/* --- contraste WCAG 2.1, so pra hex opaco --------------------------------------- */
const canal = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminancia = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
};
const contraste = (a, b) => {
  const [alto, baixo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (alto + 0.05) / (baixo + 0.05);
};

test('as cores estruturais da Madre seguem o tema do Cosmic Guide', () => {
  assert.equal(colores.noche, cosmic.background, 'noche tem de ser o fundo do Cosmic');
  assert.equal(colores.penumbra, cosmic.card, 'penumbra tem de ser o card do Cosmic');
  assert.equal(colores.papel, cosmic.text, 'papel tem de ser o texto do Cosmic');
  assert.equal(colores.ceniza, cosmic.textSecondary, 'ceniza tem de ser o texto secundario');
  assert.equal(colores.escenario, cosmic.background, 'escenario nao pode abrir buraco preto');
});

test('as cores da ALMA ficam — o fio vermelho e o nome do projeto', () => {
  assert.equal(colores.hilo, '#C1121F', 'o fio e vermelho porque o projeto se chama Fio Vermelho');
  assert.equal(colores.nudo, '#7A0B14', 'o no e o fio escurecido');
  assert.equal(colores.aguja, '#C9A227', 'a agulha de latao nao e o gold do Cosmic');
  assert.equal(colores.foil, '#3E2F33', 'o veu raspavel e escuro porque existe pra ser removido');
  // a alma NAO pode ter virado token do Cosmic
  assert.notEqual(colores.hilo, cosmic.red);
  assert.notEqual(colores.hilo, cosmic.pink);
  assert.notEqual(colores.aguja, cosmic.gold);
});

test('foil continua hex literal parseavel — o veu raspavel depende disso', () => {
  // Reproduz o parser real de ScratchRevealCard.js (aCanales, ramo hex).
  assert.match(colores.foil, /^#[0-9A-Fa-f]{6}$/, 'rgba()/token quebraria paletaDeVelo');
  const h = colores.foil.replace('#', '');
  const canais = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  assert.ok(canais.every(Number.isFinite), 'os 3 canais tem de sair numeros');
});

test('os derivados com alfa nascem das cores NOVAS, nao de hex velho', () => {
  // velo = fundo do Cosmic a 86%; bordeSuave = borda do Cosmic a 55%.
  const rgbDe = (hex) => {
    const h = hex.replace('#', '');
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ');
  };
  assert.equal(colores.velo, `rgba(${rgbDe(cosmic.background)}, 0.86)`);
  assert.equal(colores.bordeSuave, `rgba(${rgbDe(cosmic.border)}, 0.55)`);
  // bordeHilo e ALMA: deriva do fio, nao do Cosmic.
  assert.equal(colores.bordeHilo, 'rgba(193, 18, 31, 0.45)');
});

test('os tokens de TEXTO passam WCAG AA sobre os fundos novos', () => {
  const pares = [
    ['papel', colores.papel, 'noche', colores.noche],
    ['papel', colores.papel, 'penumbra', colores.penumbra],
    ['ceniza', colores.ceniza, 'noche', colores.noche],
    ['ceniza', colores.ceniza, 'penumbra', colores.penumbra],
    ['aguja', colores.aguja, 'noche', colores.noche],
    ['foilTexto', colores.foilTexto, 'noche', colores.noche],
    ['foilTexto', colores.foilTexto, 'penumbra', colores.penumbra],
    ['papel', colores.papel, 'nudo', colores.nudo],
  ];
  for (const [nf, fg, nb, bg] of pares) {
    const r = contraste(fg, bg);
    assert.ok(r >= 4.5, `${nf} sobre ${nb} = ${r.toFixed(2)}:1, abaixo de AA (4,5:1)`);
  }
});

test('hilo CONTINUA reprovando como texto — e por isso que a regra travada existe', () => {
  // Se algum dia isto passar de 4,5:1, a regra do topo do theme.js pode ser revista.
  // Enquanto reprovar, hilo so pode ser traco, icone, fundo de botao e progresso.
  const r = contraste(colores.hilo, colores.noche);
  assert.ok(r < 4.5, `hilo sobre noche deu ${r.toFixed(2)}:1 — reveja a regra travada`);
  // Como FUNDO de botao ele passa, e o rotulo e papel:
  assert.ok(contraste(colores.papel, colores.hilo) >= 4.5, 'rotulo do botao tem de passar');
});

test('foilTexto conserta o texto que era invisivel, sem mexer no veu', () => {
  // O bug herdado: foil como COR DE TEXTO em tela escura dava ~1,5:1.
  assert.ok(contraste(colores.foil, colores.penumbra) < 3, 'foil como texto escuro segue ilegivel (por isso existe o irmao)');
  assert.ok(contraste(colores.foilTexto, colores.penumbra) >= 4.5, 'foilTexto tem de ser legivel');
  assert.notEqual(colores.foilTexto, colores.foil, 'sao dois trabalhos diferentes');
});

test('tipo e sombra seguiram as cores novas, e as fontes da alma ficaram', () => {
  assert.equal(tipo.cuerpo.color, colores.papel);
  assert.equal(tipo.micro.color, colores.ceniza);
  assert.equal(tipo.titulo.color, colores.papel);
  assert.equal(sombra.halo.shadowColor, colores.hilo, 'o halo e feito com o fio');
  assert.equal(sombra.carta.shadowColor, colores.noche);
  // As fontes sao ALMA e ficam dentro das telas dela (o Cosmic usa fonte de sistema).
  assert.equal(familias.displayNegrita, 'CormorantGaramond_700Bold');
  assert.equal(familias.cuerpoRegular, 'Inter_400Regular');
});

test('os tokens continuam congelados — ninguem muta a paleta em runtime', () => {
  assert.ok(Object.isFrozen(colores));
  assert.ok(Object.isFrozen(tipo));
  assert.ok(Object.isFrozen(sombra));
});
