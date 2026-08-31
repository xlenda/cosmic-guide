const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('packs de voz cobrem PT/ES/EN sem editar o pacote gigante de i18n', () => {
  for (const lang of ['pt', 'es', 'en']) {
    const source = fs.readFileSync(path.join(root, 'lib', 'traducoes', `voice.${lang}.js`), 'utf8');
    for (const field of [
      'listen',
      'preparing',
      'cancel',
      'stop',
      'login_required',
      'voice_quota_exhausted',
      'voice_global_quota_exhausted',
    ]) {
      assert.match(source, new RegExp(`${field}:`));
    }
    assert.match(source, /24/);
  }
  const aggregator = fs.readFileSync(path.join(root, 'lib', 'voiceCopy.js'), 'utf8');
  assert.match(aggregator, /PACKS/);
  assert.match(aggregator, /voicePrivacyCopy/);
});

test('BotaoOuvir usa backend neural e nunca speechSynthesis/TTS do aparelho', () => {
  const button = fs.readFileSync(path.join(root, 'components', 'BotaoOuvir.js'), 'utf8');
  const client = fs.readFileSync(path.join(root, 'lib', 'voiceClient.js'), 'utf8');
  assert.match(button, /fetchVoiceStatus/);
  assert.match(button, /requestVoiceAudio/);
  assert.match(button, /voicePrivacyCopy/);
  assert.doesNotMatch(button + client, /speechSynthesis|SpeechSynthesisUtterance/);
  assert.match(button, /if \(!texto[^\n]+!availability\) return null/);
});

test('Privacidade interna explica ElevenLabs, conta confirmada e cache temporário', () => {
  const screen = fs.readFileSync(path.join(root, 'screens', 'PrivacyScreen.js'), 'utf8');
  assert.match(screen, /voicePrivacyCopy/);
  assert.match(screen, /voicePrivacy\.data/);
  assert.match(screen, /voicePrivacy\.process/);

  for (const lang of ['pt', 'es', 'en']) {
    const source = fs.readFileSync(path.join(root, 'lib', 'traducoes', `voice.${lang}.js`), 'utf8');
    assert.match(source, /ElevenLabs/);
    assert.match(source, /24/);
  }
});

test('reprodução tem implementações separadas e reais para web e Android/iOS', () => {
  const web = fs.readFileSync(path.join(root, 'lib', 'useVoicePlayback.web.js'), 'utf8');
  const native = fs.readFileSync(path.join(root, 'lib', 'useVoicePlayback.native.js'), 'utf8');
  assert.match(web, /AudioContext|webkitAudioContext/);
  assert.match(web, /decodeAudioData/);
  assert.match(native, /from 'expo-audio'/);
  assert.match(native, /from 'expo-file-system'/);
  assert.match(native, /player\.replace/);
  assert.match(native, /player\.play/);
  assert.doesNotMatch(native, /speechSynthesis|SpeechSynthesisUtterance/);
});

test('app declara áudio compatível com Expo 54 sem pedir microfone', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  assert.equal(pkg.dependencies['expo-audio'], '~1.1.1');
  assert.equal(pkg.dependencies['expo-file-system'], '~19.0.24');
  const audioPlugin = app.expo.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-audio');
  assert.ok(audioPlugin);
  assert.equal(audioPlugin[1].microphonePermission, false);
  assert.equal(audioPlugin[1].recordAudioAndroid, false);
});
