const test = require('node:test');
const assert = require('node:assert/strict');
const { TAROT_DECK } = require('../lib/tarotDeck.js');
const { getCardName, getThemedMeaning } = require('../lib/tarotThemes.js');
const { translate } = require('../lib/i18n.js');
const { buildPublicTarotBody } = require('../lib/tarotPersonalization.js');
const { getMajorThemeLens } = require('../lib/tarotMajorThemeLenses.js');
const { getMinorThemeLens } = require('../lib/tarotMinorThemeLenses.js');
const { getTarotGuideSpread } = require('../lib/tarotRitualGuide.js');

const LANGUAGES = ['pt', 'es', 'en'];
const THEMES = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];
const SERVER_BODY_LIMIT = 2000;

function canonicalPosition(id) {
  return ({
    past: 'Passado',
    present: 'Presente',
    future: 'Futuro',
    situation: 'Situação',
    tension: 'Tensão',
    'next-step': 'Próximo passo',
  })[id];
}

test('pior resumo público das duas estruturas continua abaixo do limite real do servidor', () => {
  for (const lang of LANGUAGES) {
    for (const theme of THEMES) {
      for (const spreadId of ['past-present-future', 'situation-tension-next-step']) {
        const spread = getTarotGuideSpread(spreadId, lang);
        const longestPerPosition = spread.positions.map((position) => {
          const candidates = [];
          for (const card of TAROT_DECK) {
            for (const reversed of [false, true]) {
              const name = `${position.label} — ${getCardName(card, lang)}${reversed ? translate(lang, 'tarot.reversedTag') : ''}`;
              const canonical = getThemedMeaning(card, theme, reversed, canonicalPosition(position.id), lang);
              const publicSnippet = getMajorThemeLens(card, theme, lang) || getMinorThemeLens(card, theme, lang) || canonical;
              candidates.push({ name, publicSnippet, length: name.length + publicSnippet.length });
            }
          }
          return candidates.sort((a, b) => b.length - a.length)[0];
        });

        const body = buildPublicTarotBody({
          themeLabel: translate(lang, `tarot.theme.${theme}`),
          cardNames: longestPerPosition.map((item) => item.name),
          canonicalSnippets: longestPerPosition.map((item) => item.publicSnippet),
          question: 'NUNCA-DEVE-ENTRAR',
          reflection: 'NUNCA-DEVE-ENTRAR-TAMBÉM',
        });

        assert.ok(
          body.length <= SERVER_BODY_LIMIT,
          `${lang}/${theme}/${spreadId}: ${body.length} excede ${SERVER_BODY_LIMIT}`
        );
        assert.doesNotMatch(body, /NUNCA-DEVE-ENTRAR/);
      }
    }
  }
});
