// Fisher–Yates: cada permutação tem a mesma chance quando o RNG é uniforme.
// O antigo `sort(() => Math.random() - 0.5)` era enviesado e dependia do motor
// de JavaScript. RNG injetável mantém o sorteio testável sem fixar resultados
// no produto.
export function drawTarotCards(deck, count = 3, rng = Math.random) {
  if (!Array.isArray(deck) || deck.length === 0) return [];
  const wanted = Math.max(0, Math.min(deck.length, Math.floor(count)));
  const random = typeof rng === 'function' ? rng : Math.random;
  const shuffled = deck.slice();

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const value = Number(random());
    const normalized = Number.isFinite(value) ? Math.max(0, Math.min(0.9999999999999999, value)) : 0;
    const swapIndex = Math.floor(normalized * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, wanted);
}
