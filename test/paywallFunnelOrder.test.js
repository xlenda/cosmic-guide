// O degrau "checkout_click" NÃO pode ser disparado por quem está deslogado.
//
// Por que este teste existe: em 29/07/2026 a oferta passou a aparecer ANTES do
// login (screens/PlanosScreen.js) — o CTA virou o primeiro botão que um
// visitante sem conta encontra. O disparo do funnel.checkoutClick ficou onde
// estava, no topo de abrirCheckout, ou seja ANTES do freio `if (!authToken)`.
// Duas coisas quebravam de uma vez:
//
//   1. No relatório (server-patches/scripts/funil.js) o degrau "Clicou em
//      assinar" vem ABAIXO de "Caiu na tela de login" e "Entrou na conta".
//      Contar ali o toque de quem está deslogado enche esse degrau de gente
//      que só foi parar no login — e some com a queda real, que é justamente
//      a que o dono precisa enxergar.
//   2. O dedupe de lib/funnel.js é por plano (`checkout_click:trial`), então
//      o clique BOM — o de depois do login, o único que chega no backend —
//      era descartado como repetido. O buraco checkout_click→checkout_open
//      deixava de significar "clicou e o formulário não abriu".
//
// Verificação estática de propósito: exercitar a tela inteira exigiria
// react-navigation + Supabase + DOM. O que precisa ser garantido é uma coisa
// só e é visível na fonte — o disparo vem DEPOIS do freio de login, nas duas
// versões da tela (web e nativa).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const FONTE = path.join(__dirname, '..', 'screens', 'PlanosScreen.js');

function posicoes(src, regex) {
  return [...src.matchAll(regex)].map((m) => m.index);
}

test('checkout_click só dispara depois do freio de login (web e nativo)', () => {
  const src = fs.readFileSync(FONTE, 'utf8');

  const freios = posicoes(src, /if \(!authToken\)/g);
  const cliques = posicoes(src, /funnel\.checkoutClick\(/g);

  assert.equal(freios.length, 2, 'esperado 1 freio de login por versão da tela (web + nativa)');
  assert.equal(cliques.length, 2, 'esperado 1 disparo de checkout_click por versão da tela');

  for (let i = 0; i < cliques.length; i++) {
    assert.ok(
      cliques[i] > freios[i],
      `funnel.checkoutClick #${i + 1} está ANTES do freio "if (!authToken)" — ` +
        'deslogado tocando no CTA voltaria a contar como "Clicou em assinar"'
    );
  }
});

test('o freio de login manda pro login em vez de abrir checkout', () => {
  const src = fs.readFileSync(FONTE, 'utf8');
  // O corpo do freio precisa continuar sendo "pede login e SAI" — sem o
  // return, a tela seguiria pro initiateCheckout sem token e o backend criaria
  // uma assinatura sem conta nenhuma vinculada (o bug de pagar e não liberar).
  const freios = [...src.matchAll(/if \(!authToken\) \{([\s\S]{0,200}?)\}/g)].map((m) => m[1]);
  assert.equal(freios.length, 2);
  for (const corpo of freios) {
    assert.match(corpo, /pedirLogin\(navigation, selectedPlan\)/);
    assert.match(corpo, /\breturn\b/);
  }
});
