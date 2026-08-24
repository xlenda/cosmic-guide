import test from 'node:test';
import assert from 'node:assert/strict';
import TAROT_DECK from '../lib/tarotDeck.js';
import getMajorThemeLens, {
  MAJOR_THEME_LENS_CARD_IDS,
  MAJOR_THEME_LENS_LANGUAGES,
  MAJOR_THEME_LENS_THEME_KEYS,
  normalizeMajorThemeLensLanguage,
  normalizeMajorThemeLensTheme,
} from '../lib/tarotMajorThemeLenses.js';
import pt from '../lib/traducoes/tarotMajorThemeLenses.pt.js';
import es from '../lib/traducoes/tarotMajorThemeLenses.es.js';
import en from '../lib/traducoes/tarotMajorThemeLenses.en.js';

const packs = { pt, es, en };
const majorIds = TAROT_DECK.filter((card) => card.arcana === 'maior').map((card) => card.id);

function words(value) {
  return String(value)
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function ngrams(value, size = 4) {
  const tokens = words(value);
  const result = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    result.add(tokens.slice(index, index + size).join(' '));
  }
  return result;
}

function containment(left, right) {
  const a = ngrams(left);
  const b = ngrams(right);
  const smaller = Math.min(a.size, b.size);
  if (!smaller) return 0;
  let shared = 0;
  for (const gram of a) if (b.has(gram)) shared += 1;
  return shared / smaller;
}

test('cobre exatamente os 22 Maiores × 5 temas × 3 idiomas', () => {
  assert.equal(majorIds.length, 22);
  assert.deepEqual([...MAJOR_THEME_LENS_CARD_IDS].sort(), [...majorIds].sort());
  assert.deepEqual(MAJOR_THEME_LENS_LANGUAGES, ['pt', 'es', 'en']);
  assert.deepEqual(MAJOR_THEME_LENS_THEME_KEYS, ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde']);

  let total = 0;
  for (const lang of MAJOR_THEME_LENS_LANGUAGES) {
    assert.deepEqual(Object.keys(packs[lang]).sort(), [...majorIds].sort(), `ids divergentes em ${lang}`);
    for (const cardId of majorIds) {
      assert.deepEqual(
        Object.keys(packs[lang][cardId]),
        MAJOR_THEME_LENS_THEME_KEYS,
        `temas divergentes em ${lang}/${cardId}`,
      );
      for (const theme of MAJOR_THEME_LENS_THEME_KEYS) {
        const lens = getMajorThemeLens({ id: cardId }, theme, lang);
        assert.equal(lens, packs[lang][cardId][theme]);
        assert.ok(words(lens).length >= 14, `lente curta demais em ${lang}/${cardId}/${theme}`);
        assert.ok(words(lens).length <= 42, `lente longa demais em ${lang}/${cardId}/${theme}`);
        total += 1;
      }
    }
  }
  assert.equal(total, 22 * 5 * 3);
});

test('a API aceita ids, locales e nomes localizados; menores usam fallback null', () => {
  assert.equal(normalizeMajorThemeLensLanguage('pt-BR'), 'pt');
  assert.equal(normalizeMajorThemeLensLanguage('es_MX'), 'es');
  assert.equal(normalizeMajorThemeLensLanguage('en-US'), 'en');
  assert.equal(normalizeMajorThemeLensLanguage('fr'), 'pt');

  assert.equal(normalizeMajorThemeLensTheme('Saúde'), 'Saúde');
  assert.equal(normalizeMajorThemeLensTheme('salud'), 'Saúde');
  assert.equal(normalizeMajorThemeLensTheme('health'), 'Saúde');
  assert.equal(normalizeMajorThemeLensTheme('wellbeing'), 'Saúde');
  assert.equal(normalizeMajorThemeLensTheme('career'), 'Carreira');
  assert.equal(normalizeMajorThemeLensTheme('tema-inexistente'), null);

  assert.equal(getMajorThemeLens('major-00', 'love', 'en'), en['major-00'].Amor);
  assert.equal(getMajorThemeLens({ id: 'paus-01' }, 'Amor', 'pt'), null);
  assert.equal(getMajorThemeLens('ouros-14', 'Dinheiro', 'es'), null);
  assert.equal(getMajorThemeLens({ id: 'major-99' }, 'Amor', 'pt'), null);
  assert.equal(getMajorThemeLens(null, 'Amor', 'pt'), null);
  assert.equal(getMajorThemeLens('major-00', 'invalido', 'pt'), null);
});

test('nenhuma lente é cópia de outra dentro do mesmo idioma', () => {
  for (const lang of MAJOR_THEME_LENS_LANGUAGES) {
    const all = majorIds.flatMap((cardId) => (
      MAJOR_THEME_LENS_THEME_KEYS.map((theme) => packs[lang][cardId][theme].trim().toLowerCase())
    ));
    assert.equal(new Set(all).size, all.length, `há lente duplicada no pack ${lang}`);
  }
});

test('a troca de tema muda de verdade a lente da mesma carta', () => {
  const ceiling = 0.18;
  for (const lang of MAJOR_THEME_LENS_LANGUAGES) {
    for (const cardId of majorIds) {
      for (let left = 0; left < MAJOR_THEME_LENS_THEME_KEYS.length; left += 1) {
        for (let right = left + 1; right < MAJOR_THEME_LENS_THEME_KEYS.length; right += 1) {
          const themeA = MAJOR_THEME_LENS_THEME_KEYS[left];
          const themeB = MAJOR_THEME_LENS_THEME_KEYS[right];
          const score = containment(packs[lang][cardId][themeA], packs[lang][cardId][themeB]);
          assert.ok(
            score <= ceiling,
            `${lang}/${cardId}: ${themeA} × ${themeB} repetem ${(score * 100).toFixed(1)}% dos 4-gramas`,
          );
        }
      }
    }
  }
});

test('as lentes evitam promessa de futuro e alegação clínica', () => {
  const unsafe = {
    pt: [
      /\b(?:vai|ira|acontecera|garante|garantido|certeza de que)\b/i,
      /\b(?:cura|curar|tratamento|medicamento|doenca)\b/i,
    ],
    es: [
      /\b(?:ocurrira|sucedera|garantiza|garantizado|certeza de que)\b/i,
      /\b(?:cura|curar|tratamiento|medicamento|enfermedad)\b/i,
    ],
    en: [
      /\b(?:will|shall|guarantees?|guaranteed|certain to)\b/i,
      /\b(?:heal|heals|healing|cure|cures|treatment|medication|disease)\b/i,
    ],
  };

  for (const lang of MAJOR_THEME_LENS_LANGUAGES) {
    for (const cardId of majorIds) {
      for (const theme of MAJOR_THEME_LENS_THEME_KEYS) {
        const lens = packs[lang][cardId][theme];
        const folded = words(lens).join(' ');
        for (const pattern of unsafe[lang]) {
          assert.doesNotMatch(folded, pattern, `linguagem insegura em ${lang}/${cardId}/${theme}`);
        }
      }
    }
  }
});
