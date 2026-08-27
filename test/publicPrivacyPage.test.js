// A URL informada à Play Store precisa ser uma política pública de verdade.
// Até 26/08/2026, /cosmic-guide/privacidade caía no fallback do app: em
// contexto limpo a pessoa via o onboarding e não o documento legal. Estes
// testes travam o arquivo estático, o rewrite da FONTE de deploy e a prova E2E
// com JavaScript desligado.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'public', 'privacidade.html'), 'utf8');
const deploy = fs.readFileSync(path.join(ROOT, 'scripts', 'deploy-vercel.sh'), 'utf8');
const e2e = fs.readFileSync(path.join(ROOT, 'scripts', 'e2e-regression.js'), 'utf8');

test('política pública é HTML estático indexável, sem bundle nem JavaScript', () => {
  assert.match(html, /^<!DOCTYPE html>/i);
  assert.match(html, /<meta name="robots" content="index, follow"/);
  assert.match(html, /rel="canonical" href="https:\/\/cosmicguide\.cloud\/cosmic-guide\/privacidade"/);
  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /id=["']root["']/i);
  assert.doesNotMatch(html, /http-equiv=["']refresh["']/i);
});

test('política pública entrega o contrato essencial em PT, ES e EN', () => {
  for (const marker of [
    'Como o Cosmic Guide trata seus dados',
    'Cómo trata tus datos Cosmic Guide',
    'How Cosmic Guide handles your data',
    'Anthropic',
    'ElevenLabs',
    'Hotmart',
    'Supabase',
    'Google',
    'Vercel',
    '90 dias',
    '24 horas',
    'Diário Cósmico',
    'Memória Cósmica',
    'Memoria Cósmica',
    'Cosmic Memory',
    '300',
    '480',
    'contato@cosmicguide.cloud',
  ]) {
    assert.ok(html.includes(marker), `política pública não contém: ${marker}`);
  }

  assert.match(html, /id="pt" lang="pt-BR"/);
  assert.match(html, /id="es" lang="es"/);
  assert.match(html, /id="en" lang="en"/);
  assert.match(html, /Cosmic Guide não vende dados pessoais/);
  assert.match(html, /apagar a conta não apaga automaticamente suas entradas/i);
  assert.match(html, /texto da leitura passa pelo nosso servidor e\s+é enviado à ElevenLabs/);
  assert.match(html, /texto de la lectura pasa por nuestro servidor y\s+se envía a ElevenLabs/);
  assert.match(html, /reading text passes through our server and is\s+sent to ElevenLabs/);
  assert.match(html, /recurso exige uma conta verificada/);
  assert.match(html, /cache, identificado por um hash, por até 24 horas/);
  assert.match(html, /começa desligada/i);
  assert.match(html, /starts disabled/i);
  assert.match(html, /excluir a conta apaga conteúdo e consentimento/i);
});

test('rewrite canônico aponta para o HTML e vem antes do fallback da SPA', () => {
  const source = '{ "source": "/cosmic-guide/privacidade", "destination": "/cosmic-guide/privacidade.html" }';
  const fallback = '{ "source": "/:path*", "destination": "/cosmic-guide/index.html" }';
  const sourceIndex = deploy.indexOf(source);
  const fallbackIndex = deploy.indexOf(fallback);

  assert.ok(sourceIndex >= 0, 'rewrite estático da privacidade não está na fonte oficial de deploy');
  assert.ok(fallbackIndex > sourceIndex, 'fallback da SPA engole a política pública');
  assert.match(deploy, /"source": "\/privacidade"[^\n]+"destination": "\/cosmic-guide\/privacidade"/);
});

test('portão de deploy abre a URL em contexto frio com JavaScript desligado', () => {
  assert.match(e2e, /\['\/cosmic-guide\/privacidade', '\/cosmic-guide\/privacidade\.html'\]/);
  assert.match(e2e, /javaScriptEnabled:\s*false/);
  assert.match(e2e, /page\.goto\(`http:\/\/localhost:\$\{PORT\}\/cosmic-guide\/privacidade`\)/);
  assert.match(e2e, /scriptCount === 0/);
  assert.match(e2e, /!body\.includes\('7 dias grátis'\)/);
});
