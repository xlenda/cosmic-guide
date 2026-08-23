const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const screens = [
  ['ChatScreen.js', /getMockReply/],
  ['CoffeeScreen.js', /getMockCoffeeReading/],
  ['DreamScreen.js', /getMockDreamReading/],
  ['PalmScreen.js', /getMock(?:Palm|Hand|Foot|Face)Reading/],
];

test('leituras não disfarçam respostas locais como resultado personalizado da IA', () => {
  for (const [file, forbiddenFallback] of screens) {
    const source = fs.readFileSync(path.join(root, 'screens', file), 'utf8');
    assert.doesNotMatch(source, forbiddenFallback, `${file} ainda contém fallback genérico`);
    assert.match(source, /ai\.unavailable/, `${file} precisa explicar a indisponibilidade`);
  }
});
