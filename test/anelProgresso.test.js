// ANEL DE PROGRESSO — a geometria do "two-half trick".
//
// O componente desenha porcentagem sem SVG: duas máscaras de meio círculo,
// cada uma com um semicírculo girando dentro. A metade direita cobre 0→50%
// (0°→180°), e só depois dos 50% a esquerda começa a girar. Se essa conta
// estiver errada o anel mente calado — desenha um arco plausível que não
// corresponde ao número escrito ao lado dele, que é o pior tipo de bug numa
// tela que promete "a conta na cara".
//
// Aqui a conta é testada isolada do React: as mesmas expressões do
// componente, verificadas nos pontos que quebram (0, 50, 100 e os limites).
const test = require('node:test');
const assert = require('node:assert/strict');

// Réplica exata das linhas de AnelProgresso.js. Se lá mudar, este teste tem
// que mudar junto — é o ponto: a fórmula fica travada em algum lugar.
function geometria(pct) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  const metadeDireita = Math.min(50, p);
  const metadeEsquerda = Math.max(0, p - 50);
  return {
    grausDireita: (metadeDireita / 50) * 180,
    grausEsquerda: (metadeEsquerda / 50) * 180,
    esquerdaVisivel: metadeEsquerda > 0,
  };
}

test('0% não desenha arco nenhum', () => {
  const g = geometria(0);
  assert.equal(g.grausDireita, 0);
  assert.equal(g.grausEsquerda, 0);
  assert.equal(g.esquerdaVisivel, false);
});

test('50% = meia volta na direita, esquerda ainda escondida', () => {
  const g = geometria(50);
  assert.equal(g.grausDireita, 180);
  assert.equal(g.grausEsquerda, 0);
  // A metade esquerda NÃO pode aparecer em 50%: com 0° ela desenharia um arco
  // no topo esquerdo que não corresponde a porcentagem nenhuma.
  assert.equal(g.esquerdaVisivel, false);
});

test('100% = volta completa, as duas metades cheias', () => {
  const g = geometria(100);
  assert.equal(g.grausDireita, 180);
  assert.equal(g.grausEsquerda, 180);
  assert.equal(g.esquerdaVisivel, true);
});

test('a direita trava em 180° e nunca passa disso', () => {
  // Sem o Math.min(50, p) a direita giraria além do meio e pintaria por cima
  // do que a esquerda desenha — o anel mostraria mais do que o valor real.
  for (const pct of [51, 70, 99, 100]) {
    assert.equal(geometria(pct).grausDireita, 180, `pct ${pct}`);
  }
});

test('proporção é linear nos dois lados', () => {
  assert.equal(geometria(25).grausDireita, 90);
  assert.equal(geometria(75).grausEsquerda, 90);
});

test('valores fora da faixa são presos, não giram além da volta', () => {
  // pct vem de conta (lib/elementos.js dá 0..100), mas um valor fora da faixa
  // desenharia um anel maior que o total, erro silencioso e difícil de achar.
  assert.equal(geometria(140).grausEsquerda, 180);
  assert.equal(geometria(-30).grausDireita, 0);
  assert.equal(geometria(null).grausDireita, 0);
  assert.equal(geometria(undefined).grausDireita, 0);
  assert.equal(geometria('abc').grausDireita, 0);
});

test('as porcentagens reais de elementos caem certas no anel', () => {
  // lib/elementos.js entrega contagem × 10, então os valores possíveis são
  // múltiplos de 10 — estes são os que a tela realmente desenha.
  const { distribuicaoDeElementos } = require('../lib/elementos.js');
  const r = distribuicaoDeElementos('1990-05-15');
  assert.ok(r, 'a distribuição precisa existir pra esta prova valer');
  const soma = Object.values(r.pct).reduce((a, b) => a + b, 0);
  assert.equal(soma, 100, 'os quatro anéis juntos precisam fechar uma volta inteira');
  for (const chave of Object.keys(r.pct)) {
    const g = geometria(r.pct[chave]);
    assert.ok(g.grausDireita >= 0 && g.grausDireita <= 180, chave);
    assert.ok(g.grausEsquerda >= 0 && g.grausEsquerda <= 180, chave);
  }
});
