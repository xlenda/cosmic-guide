const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');

test('carta oculta do Álbum aceita toque e abre uma resposta sem spoiler', () => {
  const fonte = fs.readFileSync(path.join(raiz, 'screens', 'TarotAlbumScreen.js'), 'utf8');
  assert.doesNotMatch(fonte, /disabled=\{!seen\}/);
  assert.match(fonte, /seen \? openCard\(card\) : openHiddenCard\(\)/);
  assert.match(fonte, /testID="album-hidden-modal"/);
  assert.match(fonte, /testID="album-hidden-draw"/);
});

test('a resposta da carta oculta existe nos três idiomas', async () => {
  const { LANGUAGES, translate } = await import('../lib/i18n.js');
  for (const lang of LANGUAGES) {
    for (const key of [
      'album.cardHiddenHint',
      'album.cardHiddenTitle',
      'album.cardHiddenBody',
      'album.continueCta',
    ]) {
      assert.notEqual(translate(lang, key), key, `${lang}: faltou ${key}`);
    }
  }
});

test('a terceira revelação espera o registro no Álbum', () => {
  const fonte = fs.readFileSync(path.join(raiz, 'screens', 'TarotScreen.js'), 'utf8');
  const inicioConclusao = fonte.indexOf('const completeReading');
  const inicioReveal = fonte.indexOf('const reveal', inicioConclusao);
  assert.ok(inicioConclusao >= 0 && inicioReveal > inicioConclusao, 'callbacks da tiragem não encontrados');

  const conclusao = fonte.slice(inicioConclusao, inicioReveal);
  const grava = conclusao.indexOf('await recordCardsSeen(drawn.map((card) => card.id))');
  const limpa = conclusao.indexOf('await clearPendingTarotReadingIfMatches({');
  assert.ok(grava >= 0, 'completeReading não aguarda o Álbum');
  assert.ok(limpa > grava, 'o snapshot correspondente foi limpo antes de o Álbum terminar de gravar');

  const reveal = fonte.slice(inicioReveal, fonte.indexOf('useEffect', inicioReveal));
  assert.match(reveal, /if \(next\.every\(Boolean\)\) await completeReading\(\)/);
});
