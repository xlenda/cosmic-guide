// PORTÃO DA PLAY STORE: nenhum caminho do app NATIVO pode levar a pagamento
// externo.
//
// A política de Pagamentos do Google exige Google Play Billing pra conteúdo
// digital consumido dentro do app. Até 19/08/2026 a versão nativa desta tela
// abria o checkout da Hotmart num navegador in-app
// (WebBrowser.openBrowserAsync) — reprovação certa. O teste existe pra que
// isso não volte por descuido: a web continua com o checkout da Hotmart
// inteiro (e é ela que fatura hoje), o nativo compra pela loja ou não vende.
//
// Varredura de FONTE, sem importar react-native — mesma técnica de
// test/paywallFunnelOrder.test.js.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const PLANOS = fs.readFileSync(path.join(RAIZ, 'screens', 'PlanosScreen.js'), 'utf8');

// Só o corpo da versão nativa da tela — a versão web pode (e deve) continuar
// abrindo a Hotmart.
function blocoNativo() {
  const ini = PLANOS.indexOf('function PlanosScreenNative()');
  assert.ok(ini > 0, 'PlanosScreenNative sumiu da tela de Planos');
  const fim = PLANOS.indexOf('export default function PlanosScreen(', ini);
  assert.ok(fim > ini, 'não achei o fim do bloco nativo');
  return PLANOS.slice(ini, fim);
}

test('a tela de Planos não abre navegador externo em lugar nenhum', () => {
  assert.doesNotMatch(
    PLANOS,
    /openBrowserAsync|expo-web-browser/,
    'navegador in-app de volta na tela de Planos — no Android isso é checkout externo e reprova'
  );
});

test('o fluxo nativo não toca em link de pagamento da Hotmart', () => {
  const nativo = blocoNativo();
  assert.doesNotMatch(nativo, /HOTMART_PAY_URLS|pay\.hotmart\.com/, 'link de checkout externo dentro do fluxo nativo');
  assert.doesNotMatch(nativo, /Linking\.openURL/, 'openURL dentro do fluxo nativo — só a web pode sair pro checkout');
});

test('o botão de assinar do nativo depende do gate de configuração', () => {
  const nativo = blocoNativo();
  // Sem chave/produtos configurados não pode existir vitrine: é o que permite
  // publicar grátis na Play e ligar a venda depois.
  assert.match(nativo, /const vendendo = LOJA_ATIVA && !!loja;/);
  // E a compra tem que ser a da loja, não um checkout web.
  assert.match(nativo, /comprarPlano\(/);
});

test('o SDK da loja nunca é importado estaticamente (a web quebraria)', () => {
  const src = fs.readFileSync(path.join(RAIZ, 'lib', 'purchases.js'), 'utf8');
  assert.doesNotMatch(
    src,
    /^import .*react-native-purchases/m,
    'import estático de react-native-purchases — o módulo nativo seria executado no bundle web'
  );
  assert.match(src, /require\('react-native-purchases'\)/);
});
