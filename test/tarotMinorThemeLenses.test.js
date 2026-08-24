import test from 'node:test';
import assert from 'node:assert/strict';

import { TAROT_DECK } from '../lib/tarotDeck';
import { getMajorThemeLens } from '../lib/tarotMajorThemeLenses';
import {
  MINOR_THEME_LENS_CARD_IDS,
  getMinorThemeLens,
} from '../lib/tarotMinorThemeLenses';

const THEMES = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];
const LANGUAGES = ['pt', 'es', 'en'];
const MINOR_CARDS = TAROT_DECK.filter((card) => card.arcana !== 'maior');

test('o agregador cobre exatamente as 56 cartas menores do baralho real', () => {
  assert.equal(MINOR_CARDS.length, 56);
  assert.deepEqual(
    [...MINOR_THEME_LENS_CARD_IDS].sort(),
    MINOR_CARDS.map((card) => card.id).sort(),
  );
});

test('as 840 lentes menores são acessíveis por carta, tema e idioma', () => {
  let total = 0;
  for (const card of MINOR_CARDS) {
    for (const theme of THEMES) {
      for (const language of LANGUAGES) {
        const lens = getMinorThemeLens(card, theme, language);
        assert.equal(typeof lens, 'string', `${card.id}/${theme}/${language}`);
        assert.ok(lens.trim().length > 0, `${card.id}/${theme}/${language} vazio`);
        total += 1;
      }
    }
  }
  assert.equal(total, 56 * 5 * 3);
});

test('aliases de tema e locale caem na mesma lente, e entradas inválidas não vazam fallback', () => {
  const card = MINOR_CARDS[0];
  assert.equal(getMinorThemeLens(card.id, 'love', 'pt-BR'), getMinorThemeLens(card, 'Amor', 'pt'));
  assert.equal(getMinorThemeLens(card.id, 'health', 'en-US'), getMinorThemeLens(card, 'Saúde', 'en'));
  assert.equal(getMinorThemeLens('major-00', 'Amor', 'pt'), null);
  assert.equal(getMinorThemeLens(card, 'tema-inexistente', 'pt'), null);
  assert.equal(getMinorThemeLens(null, 'Amor', 'pt'), null);
});

test('as duas camadas juntas cobrem as 78 cartas sem texto genérico de emergência', () => {
  for (const card of TAROT_DECK) {
    for (const theme of THEMES) {
      for (const language of LANGUAGES) {
        const lens = getMajorThemeLens(card, theme, language) || getMinorThemeLens(card, theme, language);
        assert.ok(lens, `sem lente: ${card.id}/${theme}/${language}`);
      }
    }
  }
});
