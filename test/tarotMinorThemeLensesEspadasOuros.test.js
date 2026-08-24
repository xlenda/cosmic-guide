import test from 'node:test';
import assert from 'node:assert/strict';
import { PACK as swordsPt } from '../lib/traducoes/tarotMinorThemeLenses.espadas.pt.js';
import { PACK as swordsEs } from '../lib/traducoes/tarotMinorThemeLenses.espadas.es.js';
import { PACK as swordsEn } from '../lib/traducoes/tarotMinorThemeLenses.espadas.en.js';
import { PACK as pentaclesPt } from '../lib/traducoes/tarotMinorThemeLenses.ouros.pt.js';
import { PACK as pentaclesEs } from '../lib/traducoes/tarotMinorThemeLenses.ouros.es.js';
import { PACK as pentaclesEn } from '../lib/traducoes/tarotMinorThemeLenses.ouros.en.js';

const THEMES = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];
const LANGUAGES = ['pt', 'es', 'en'];
const packs = {
  espadas: { pt: swordsPt, es: swordsEs, en: swordsEn },
  ouros: { pt: pentaclesPt, es: pentaclesEs, en: pentaclesEn },
};

function idsFor(suit) {
  return Array.from({ length: 14 }, (_, index) => `${suit}-${String(index + 1).padStart(2, '0')}`);
}

function words(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function ngrams(value, size = 4) {
  const tokens = words(value);
  const grams = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    grams.add(tokens.slice(index, index + size).join(' '));
  }
  return grams;
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

test('Espadas e Ouros cobrem exatamente 14 cartas × 5 temas × 3 idiomas', () => {
  let total = 0;
  for (const suit of Object.keys(packs)) {
    const expectedIds = idsFor(suit);
    for (const lang of LANGUAGES) {
      const pack = packs[suit][lang];
      assert.deepEqual(Object.keys(pack), expectedIds, `ids divergentes em ${suit}/${lang}`);
      for (const cardId of expectedIds) {
        assert.deepEqual(Object.keys(pack[cardId]), THEMES, `temas divergentes em ${lang}/${cardId}`);
        for (const theme of THEMES) {
          const lens = pack[cardId][theme];
          assert.equal(typeof lens, 'string', `lente não textual em ${lang}/${cardId}/${theme}`);
          assert.ok(lens.trim(), `lente vazia em ${lang}/${cardId}/${theme}`);
          assert.ok(words(lens).length >= 14, `lente curta demais em ${lang}/${cardId}/${theme}`);
          assert.ok(words(lens).length <= 50, `lente longa demais em ${lang}/${cardId}/${theme}`);
          total += 1;
        }
      }
    }
  }
  assert.equal(total, 2 * 14 * 5 * 3);
});

test('nenhuma lente é duplicada dentro do mesmo idioma', () => {
  for (const lang of LANGUAGES) {
    const all = Object.keys(packs).flatMap((suit) => (
      idsFor(suit).flatMap((cardId) => THEMES.map((theme) => (
        packs[suit][lang][cardId][theme].trim().toLowerCase()
      )))
    ));
    assert.equal(new Set(all).size, all.length, `há lente duplicada no idioma ${lang}`);
  }
});

test('os cinco temas da mesma carta não repetem um molde editorial', () => {
  const ceiling = 0.35;
  for (const suit of Object.keys(packs)) {
    for (const lang of LANGUAGES) {
      for (const cardId of idsFor(suit)) {
        for (let left = 0; left < THEMES.length; left += 1) {
          for (let right = left + 1; right < THEMES.length; right += 1) {
            const score = containment(
              packs[suit][lang][cardId][THEMES[left]],
              packs[suit][lang][cardId][THEMES[right]],
            );
            assert.ok(
              score <= ceiling,
              `${lang}/${cardId}: ${THEMES[left]} × ${THEMES[right]} repetem ${(score * 100).toFixed(1)}% dos 4-gramas`,
            );
          }
        }
      }
    }
  }
});

test('os textos evitam promessa certa, alegação clínica, prescrição financeira e falsa IA', () => {
  const unsafe = {
    pt: [
      /\b(?:vai|ira|acontecera|garante|garantido|certeza de que)\b/i,
      /\b(?:cura|curar|tratamento|medicamento|doenca)\b/i,
      /\b(?:inteligencia artificial|gerado por ia)\b/i,
    ],
    es: [
      /\b(?:ocurrira|sucedera|garantiza|garantizado|certeza de que)\b/i,
      /\b(?:cura|curar|tratamiento|medicamento|enfermedad)\b/i,
      /\b(?:inteligencia artificial|generado por ia)\b/i,
    ],
    en: [
      /\b(?:will|shall|guarantees?|guaranteed|certain to)\b/i,
      /\b(?:heal|heals|healing|cure|cures|treatment|medication|disease)\b/i,
      /\b(?:artificial intelligence|ai-generated)\b/i,
    ],
  };
  const unsafeFinancial = {
    pt: /\b(?:compre|invista|emprestimo certo)\b/i,
    es: /\b(?:compra|vende|invierte|prestamo seguro)\b/i,
    en: /\b(?:buy|sell|invest|risk-free loan)\b/i,
  };

  for (const suit of Object.keys(packs)) {
    for (const lang of LANGUAGES) {
      for (const cardId of idsFor(suit)) {
        for (const theme of THEMES) {
          const folded = words(packs[suit][lang][cardId][theme]).join(' ');
          for (const pattern of unsafe[lang]) {
            assert.doesNotMatch(folded, pattern, `linguagem insegura em ${lang}/${cardId}/${theme}`);
          }
          if (theme === 'Dinheiro') {
            assert.doesNotMatch(
              folded,
              unsafeFinancial[lang],
              `prescrição financeira em ${lang}/${cardId}/${theme}`,
            );
          }
        }
      }
    }
  }
});
