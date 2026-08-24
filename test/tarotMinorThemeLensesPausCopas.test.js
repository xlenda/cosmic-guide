import test from 'node:test';
import assert from 'node:assert/strict';
import { PACK as pausPt } from '../lib/traducoes/tarotMinorThemeLenses.paus.pt.js';
import { PACK as pausEs } from '../lib/traducoes/tarotMinorThemeLenses.paus.es.js';
import { PACK as pausEn } from '../lib/traducoes/tarotMinorThemeLenses.paus.en.js';
import { PACK as copasPt } from '../lib/traducoes/tarotMinorThemeLenses.copas.pt.js';
import { PACK as copasEs } from '../lib/traducoes/tarotMinorThemeLenses.copas.es.js';
import { PACK as copasEn } from '../lib/traducoes/tarotMinorThemeLenses.copas.en.js';

const THEMES = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];
const LANGS = ['pt', 'es', 'en'];
const SUITS = ['paus', 'copas'];
const packs = {
  paus: { pt: pausPt, es: pausEs, en: pausEn },
  copas: { pt: copasPt, es: copasEs, en: copasEn },
};

function expectedIds(suit) {
  return Array.from({ length: 14 }, (_, index) => `${suit}-${String(index + 1).padStart(2, '0')}`);
}

function words(value) {
  return String(value)
    .normalize('NFC')
    .match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu) || [];
}

function fourGrams(value) {
  const tokens = words(value).map((token) => token.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const result = new Set();
  for (let index = 0; index <= tokens.length - 4; index += 1) {
    result.add(tokens.slice(index, index + 4).join(' '));
  }
  return result;
}

function containment(left, right) {
  const a = fourGrams(left);
  const b = fourGrams(right);
  const smaller = Math.min(a.size, b.size);
  if (!smaller) return 0;
  let shared = 0;
  for (const gram of a) if (b.has(gram)) shared += 1;
  return shared / smaller;
}

test('Paus e Copas cobrem exatamente 14 cartas × 5 temas × 3 idiomas', () => {
  let total = 0;
  for (const suit of SUITS) {
    for (const lang of LANGS) {
      const pack = packs[suit][lang];
      assert.deepEqual(Object.keys(pack), expectedIds(suit), `ids divergentes em ${suit}/${lang}`);
      for (const cardId of expectedIds(suit)) {
        assert.deepEqual(Object.keys(pack[cardId]), THEMES, `temas divergentes em ${lang}/${cardId}`);
        for (const theme of THEMES) {
          const lens = pack[cardId][theme];
          assert.equal(typeof lens, 'string', `lente não textual em ${lang}/${cardId}/${theme}`);
          assert.equal(lens, lens.trim(), `espaço externo em ${lang}/${cardId}/${theme}`);
          assert.ok(lens.length > 0, `lente vazia em ${lang}/${cardId}/${theme}`);
          const count = words(lens).length;
          assert.ok(count >= 18, `lente curta (${count}) em ${lang}/${cardId}/${theme}`);
          assert.ok(count <= 45, `lente longa (${count}) em ${lang}/${cardId}/${theme}`);
          total += 1;
        }
      }
    }
  }
  assert.equal(total, 2 * 14 * 5 * 3);
});

test('nenhuma lente se repete dentro do mesmo idioma e naipe', () => {
  for (const suit of SUITS) {
    for (const lang of LANGS) {
      const all = expectedIds(suit).flatMap((cardId) => (
        THEMES.map((theme) => packs[suit][lang][cardId][theme].trim().toLocaleLowerCase(lang))
      ));
      assert.equal(new Set(all).size, all.length, `há lente duplicada em ${suit}/${lang}`);
    }
  }
});

test('a troca de tema não reutiliza um molde na mesma carta', () => {
  for (const suit of SUITS) {
    for (const lang of LANGS) {
      for (const cardId of expectedIds(suit)) {
        for (let left = 0; left < THEMES.length; left += 1) {
          for (let right = left + 1; right < THEMES.length; right += 1) {
            const score = containment(
              packs[suit][lang][cardId][THEMES[left]],
              packs[suit][lang][cardId][THEMES[right]],
            );
            assert.ok(
              score <= 0.18,
              `${lang}/${cardId}: ${THEMES[left]} × ${THEMES[right]} repetem ${(score * 100).toFixed(1)}% dos 4-gramas`,
            );
          }
        }
      }
    }
  }
});

test('as lentes evitam promessa certa, prescrição e falsa inteligência artificial', () => {
  const unsafe = {
    pt: [
      /\b(?:vai|irá|acontecerá|garante|garantido|certeza de que)\b/iu,
      /\b(?:cura|curar|tratamento|medicamento|doença)\b/iu,
      /\b(?:lucro certo|retorno garantido|inteligência artificial|gerado por ia|resposta da ia)\b/iu,
    ],
    es: [
      /\b(?:ocurrirá|sucederá|garantiza|garantizado|certeza de que)\b/iu,
      /\b(?:cura|curar|tratamiento|medicamento|enfermedad)\b/iu,
      /\b(?:beneficio seguro|retorno garantizado|inteligencia artificial|generado por ia|respuesta de la ia)\b/iu,
    ],
    en: [
      /\b(?:will|shall|guarantees?|guaranteed|certain to)\b/iu,
      /\b(?:heal|heals|healing|cure|cures|treatment|medication|disease)\b/iu,
      /\b(?:certain profit|guaranteed return|artificial intelligence|ai-generated|answer from ai)\b/iu,
    ],
  };

  for (const suit of SUITS) {
    for (const lang of LANGS) {
      for (const cardId of expectedIds(suit)) {
        for (const theme of THEMES) {
          const lens = packs[suit][lang][cardId][theme];
          for (const pattern of unsafe[lang]) {
            assert.doesNotMatch(lens, pattern, `linguagem insegura em ${lang}/${cardId}/${theme}`);
          }
        }
      }
    }
  }
});

test('PT e ES não regressam para grafia sem diacríticos em termos recorrentes', () => {
  const degraded = {
    pt: /\b(?:nao|voce|proprio|propria|acao|acoes|atencao|intencao|bastao|bastoes|vinculo|vinculos|seguranca|condicao|condicoes|orientacao|decisao|decisoes|avaliacao|experiencia|inspiracao|execucao|possivel|necessario|necessaria|informacao|informacoes|criterio|criterios|pressao|obrigacao|exposicao|preocupacao|recuperacao|comparacao|aparencia|influencia|lideranca|governanca|ambicao|visao|direcao|proxima|prestigio|animo|competicao|posicao|espaco|mudanca|observacao|presenca|celebracao|realizacao|constancia|tensao|resistencia|estimulos|forca|papeis|ruido)\b/iu,
    es: /\b(?:tambien|atencion|orientacion|evaluacion|limite|limites|vinculo|vinculos|proposito|numero|numeros|condicion|senal|senales|presion|vision|direccion|proteccion|exposicion|ambicion|energia|situacion|practica|practicas|reciproca|reciproco|ejecucion|inspiracion|accion|obligacion|celebracion|contribucion|posicion|tension|restriccion|intencion|imaginacion|emocion)\b/iu,
  };

  for (const suit of SUITS) {
    for (const lang of ['pt', 'es']) {
      for (const cardId of expectedIds(suit)) {
        for (const theme of THEMES) {
          const lens = packs[suit][lang][cardId][theme];
          assert.doesNotMatch(lens, degraded[lang], `diacrítico ausente em ${lang}/${cardId}/${theme}`);
        }
      }
    }
  }
});
