const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');

test('a Home nasce com o catálogo completo aberto', () => {
  const fonte = fs.readFileSync(path.join(raiz, 'screens', 'HomeScreen.js'), 'utf8');
  assert.match(fonte, /const \[exploreOpen, setExploreOpen\] = useState\(true\)/);
  assert.doesNotMatch(fonte, /const \[exploreOpen, setExploreOpen\] = useState\(false\)/);
});

test('o botão de ouvir não recorre à voz robótica do navegador', () => {
  const fonte = fs.readFileSync(path.join(raiz, 'components', 'BotaoOuvir.js'), 'utf8');
  assert.doesNotMatch(fonte, /speechSynthesis|SpeechSynthesisUtterance/);
  assert.match(fonte, /return null/);
});
