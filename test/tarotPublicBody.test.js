const test = require('node:test');
const assert = require('node:assert/strict');
const { TAROT_DECK } = require('../lib/tarotDeck.js');
const { getCardName, getThemedMeaning } = require('../lib/tarotThemes.js');
const { translate } = require('../lib/i18n.js');
const { buildPublicTarotBody } = require('../lib/tarotPersonalization.js');

const LANGUAGES = ['pt', 'es', 'en'];
const THEMES = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];
const POSITIONS = ['Passado', 'Presente', 'Futuro'];
const SERVER_BODY_LIMIT = 2000;

test('pior corpo público possível continua abaixo do limite real do servidor', () => {
  for (const lang of LANGUAGES) {
    for (const theme of THEMES) {
      const longestPerPosition = POSITIONS.map((position) => {
        const candidates = [];
        for (const card of TAROT_DECK) {
          for (const reversed of [false, true]) {
            const name = `${translate(lang, `tarot.position.${position}`)} — ${getCardName(card, lang)}${reversed ? translate(lang, 'tarot.reversedTag') : ''}`;
            const meaning = getThemedMeaning(card, theme, reversed, position, lang);
            candidates.push({ name, meaning, length: name.length + meaning.length });
          }
        }
        return candidates.sort((a, b) => b.length - a.length)[0];
      });

      const body = buildPublicTarotBody({
        themeLabel: translate(lang, `tarot.theme.${theme}`),
        cardNames: longestPerPosition.map((item) => item.name),
        canonicalSnippets: longestPerPosition.map((item) => item.meaning),
        question: 'NUNCA-DEVE-ENTRAR',
        reflection: 'NUNCA-DEVE-ENTRAR-TAMBÉM',
      });

      assert.ok(
        body.length <= SERVER_BODY_LIMIT,
        `${lang}/${theme}: ${body.length} excede ${SERVER_BODY_LIMIT}`
      );
      assert.doesNotMatch(body, /NUNCA-DEVE-ENTRAR/);
    }
  }
});
