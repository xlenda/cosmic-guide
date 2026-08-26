const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');

test('a Home não monta o catálogo inteiro e abre o destino permanente Explorar', () => {
  const home = fs.readFileSync(path.join(raiz, 'screens', 'HomeScreen.js'), 'utf8');
  const explore = fs.readFileSync(path.join(raiz, 'screens', 'ExploreScreen.js'), 'utf8');
  const app = fs.readFileSync(path.join(raiz, 'App.js'), 'utf8');

  assert.doesNotMatch(home, /exploreOpen|setExploreOpen/);
  assert.match(home, /testID="home-explore-toggle"/);
  assert.match(home, /navigation\.navigate\(ROUTES\.EXPLORE\)/);
  assert.match(app, /<Stack\.Screen name=\{ROUTES\.EXPLORE\} component=\{ExploreScreen\} \/>/);
  assert.match(explore, /testID=\{`card-\$\{item\.key\}`\}/);
  assert.match(explore, /ROUTES\.TAROT_TAB/);
  assert.match(explore, /ROUTES\.COMMUNITY_TAB/);
});

test('o botão de ouvir não recorre à voz robótica do navegador', () => {
  const fonte = fs.readFileSync(path.join(raiz, 'components', 'BotaoOuvir.js'), 'utf8');
  assert.doesNotMatch(fonte, /speechSynthesis|SpeechSynthesisUtterance/);
  assert.match(fonte, /return null/);
});
