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

// A contrapartida web do teste acima: no aparelho o app não PEDE microfone;
// na web o deploy não pode DESLIGAR o microfone da própria origem. O commit
// f462a50 pôs `microphone=()` (allowlist vazia) no Permissions-Policy de toda
// a produção, num lote de "endurecer pra loja", e nada barrava — o ditado de
// voz do VoiceInsightRecorder passou a dar not-allowed para sempre.
test('deploy web não desliga o microfone da própria origem', () => {
  const deploy = fs.readFileSync(path.join(root, 'scripts', 'deploy-vercel.sh'), 'utf8');
  const gerado = deploy.match(/cat > deploy-vercel\/vercel\.json << 'EOF'\r?\n([\s\S]*?)\r?\nEOF/);
  assert.ok(gerado, 'não achei o vercel.json gerado por scripts/deploy-vercel.sh');

  const vercel = JSON.parse(gerado[1]);
  const regra = vercel.headers.find((h) => h.source === '/(.*)');
  assert.ok(regra, 'nenhuma regra de header cobre a produção inteira');
  const policy = regra.headers.find((h) => h.key === 'Permissions-Policy');
  assert.ok(policy, 'Permissions-Policy sumiu do deploy web');

  assert.doesNotMatch(
    policy.value,
    /microphone\s*=\s*\(\s*\)/,
    'microphone com allowlist VAZIA desliga o microfone até para a própria origem e mata o ditado de voz',
  );
  assert.match(
    policy.value,
    /microphone\s*=\s*\(\s*self/,
    'microphone precisa liberar explicitamente a própria origem',
  );
});

// E se a política do navegador barrar mesmo assim, o botão de ditar some (cai
// no texto honesto voice.noMic) em vez de culpar a fala da pessoa com
// voice.hearingError. Só vale onde o navegador expõe document.featurePolicy
// (Chrome/Edge); no Safari o gate não tem como saber e o botão continua.
test('botão de ditar consulta a Permissions Policy antes de se oferecer', () => {
  const recorder = fs.readFileSync(path.join(root, 'components', 'VoiceInsightRecorder.js'), 'utf8');
  assert.match(recorder, /featurePolicy\?\.allowsFeature\?\.\('microphone'\) !== false/);
  // Intencao, nao formatacao: o gate do botao tem que consultar a politica do
  // navegador. Quebrar a linha em duas ou trocar espacos NAO pode reprovar.
  assert.match(recorder, /speechSupported\s*=[^;]*micAllowedByPolicy\(\)/s);
  assert.match(recorder, /speechSupported \? t\('voice\.orWrite'\) : t\('voice\.noMic'\)/);
});
