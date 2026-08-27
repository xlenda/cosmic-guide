const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const { cosmicMemoryCopy, COSMIC_MEMORY_LANGUAGES } = require('../lib/cosmicMemoryCopy');
const { LANGUAGES, _DICTS_FOR_TESTS: DICTS } = require('../lib/i18n');

test('controle da Memória Cósmica está completo nos três idiomas', () => {
  assert.deepEqual([...COSMIC_MEMORY_LANGUAGES].sort(), [...LANGUAGES].sort());
  for (const lang of LANGUAGES) {
    const copy = cosmicMemoryCopy(lang);
    for (const key of [
      'title', 'profileRow', 'intro', 'consentTitle', 'consentBody', 'enabled', 'disabled',
      'privacy', 'rememberedTitle', 'clearAll', 'removeLabel', 'loginCta',
    ]) {
      assert.ok(copy[key], `${key} ausente em ${lang}`);
    }
    for (const key of ['privacy.ai.memory', 'privacy.use.memory']) {
      assert.ok(DICTS[lang][key], `${key} ausente em ${lang}`);
    }
    assert.match(DICTS[lang]['profile.delete.text'], /Mem[oó]ria C[oó]smica|Cosmic Memory/i);
    assert.match(DICTS[lang]['profile.delete.finalText'], /Mem[oó]ria C[oó]smica|Cosmic Memory/i);
  }
});

test('tela é uma extensão discreta do Perfil, com lista virtualizada e controles acessíveis', () => {
  const app = fs.readFileSync(path.join(ROOT, 'App.js'), 'utf8');
  const profile = fs.readFileSync(path.join(ROOT, 'screens', 'ProfileScreen.js'), 'utf8');
  const screen = fs.readFileSync(path.join(ROOT, 'screens', 'CosmicMemoryScreen.js'), 'utf8');
  assert.match(app, /ROUTES\.COSMIC_MEMORY/);
  assert.match(profile, /memoryCopy\.profileRow/);
  assert.match(screen, /<FlatList/);
  assert.match(screen, /accessibilityRole="switch"/);
  assert.match(screen, /minHeight:\s*44|width:\s*44,\s*height:\s*44/);
  assert.doesNotMatch(screen, /Community|DiaryScreen|journalEntries|birthData|coupleData/);
});

test('cliente não aceita item sem id inteiro e conteúdo textual', () => {
  const client = fs.readFileSync(path.join(ROOT, 'lib', 'cosmicMemoryClient.js'), 'utf8');
  assert.match(client, /Number\.isInteger\(item\.id\)/);
  assert.match(client, /typeof item\.content !== 'string'/);
  assert.match(client, /Authorization: `Bearer \$\{token\}`/);
  assert.match(client, /AbortController/);
});

test('chat e memória aceitam o mesmo limite de 1.600 caracteres', () => {
  const screen = fs.readFileSync(path.join(ROOT, 'screens', 'ChatScreen.js'), 'utf8');
  const server = fs.readFileSync(path.join(ROOT, 'server-patches', 'src', 'http', 'server.js'), 'utf8');
  const memory = fs.readFileSync(path.join(ROOT, 'server-patches', 'src', 'application', 'cosmicMemory.js'), 'utf8');
  assert.match(screen, /maxLength=\{1600\}/);
  assert.match(server, /CHAT_MESSAGE_MAX_LENGTH = 1600/);
  assert.match(memory, /MAX_MEMORY_CHARACTERS = 1600/);
});
