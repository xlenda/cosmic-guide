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

test('o botão de assinar do nativo fica DENTRO do ramo do gate', () => {
  const nativo = blocoNativo();
  // Sem chave/produtos configurados não pode existir vitrine: é o que permite
  // publicar grátis na Play e ligar a venda depois.
  assert.match(nativo, /const vendendo = LOJA_ATIVA && !!loja;/);
  // E a compra tem que ser a da loja, não um checkout web.
  assert.match(nativo, /comprarPlano\(/);
  // O que morde não é a linha existir, é a POSIÇÃO do CTA. A versão anterior
  // deste teste só conferia que a linha do "vendendo" continuava no arquivo:
  // dava pra mover o botão de assinar pra fora do ternário — Android
  // mostrando "assinar" sem produto configurado — e os 4 testes seguiam
  // verdes. Agora o CTA tem que estar depois da abertura do ramo e antes do
  // ramo sem-venda, que é o que "dentro do gate" quer dizer.
  const iGate = nativo.indexOf('vendendo ? (');
  const iCta = nativo.indexOf('onPress={comprarNaLoja}');
  // Primeira coisa do ramo SEM venda (o cartão de "ainda não abriu por aqui").
  const iSemVenda = nativo.indexOf("planos.store.soonTitle");
  assert.ok(iGate > 0, 'sumiu o ramo "vendendo ? (" da tela nativa');
  assert.ok(iSemVenda > iGate, 'sumiu o cartão do gate desligado');
  assert.ok(iCta > iGate, 'o CTA de assinar está ANTES do gate — apareceria sem loja configurada');
  assert.ok(iCta < iSemVenda, 'o CTA de assinar caiu fora do ramo "vendendo"');
});

// A TELA NUNCA AFIRMA QUE A PESSOA É ASSINANTE POR CONTA PRÓPRIA.
// Quem concede acesso é o backend (GET /api/subscription/me via refreshAccess);
// o entitlement do RevenueCat só prova que a Play cobrou. Trocar a tela pelo
// cartão "você é assinante" com base no estado local dava o pior desfecho
// possível: a pessoa lia que era assinante e nenhuma tela paga abria.
test('o nativo não declara assinatura com base no RevenueCat local', () => {
  const nativo = blocoNativo();
  assert.doesNotMatch(
    nativo,
    /setJaAssinante/,
    'o fluxo nativo voltou a afirmar assinatura antes de o backend confirmar'
  );
  // O cartão de assinante do nativo só pode sair do que o servidor devolveu.
  assert.match(nativo, /if \(relevantAccess && subscriptionStatus && subscriptionStatus !== 'pending'\) \{/);
});

test('restaurar compras exige conta logada', () => {
  const nativo = blocoNativo();
  const iRestaurar = nativo.indexOf('const restaurar = useCallback(');
  const iToken = nativo.indexOf('getAuthToken()', iRestaurar);
  const iRestore = nativo.indexOf('restaurarCompras(', iRestaurar);
  assert.ok(iRestaurar > 0, 'sumiu o restaurar do fluxo nativo');
  assert.ok(iToken > iRestaurar && iToken < iRestore, 'restaurar chama a loja antes de exigir conta — restaura na identidade errada');
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

// O require tardio NÃO tira o pacote do bundle web: o Metro resolve require
// com string literal estaticamente, então react-native-purchases (e junto o
// @revenuecat/purchases-js-hybrid-mappings, ~750 KB minificados) entrava no
// chunk da tela que fatura — medido em 19/08/2026: PlanosScreen-*.js com
// 929 KB contra 21 KB antes. Quem tira é a extensão de plataforma: na web o
// Metro prefere lib/purchases.web.js. Este teste existe pra ninguém
// "simplificar" apagando o stub.
test('a web não empacota o SDK da loja (extensão de plataforma)', () => {
  const web = fs.readFileSync(path.join(RAIZ, 'lib', 'purchases.web.js'), 'utf8');
  const nativo = fs.readFileSync(path.join(RAIZ, 'lib', 'purchases.js'), 'utf8');
  // Citar o pacote em comentário é permitido; IMPORTAR ou requerer não —
  // é a referência de módulo que faz o Metro empacotar.
  assert.doesNotMatch(
    web,
    /(require\s*\(|from)\s*['"]react-native-purchases/,
    'o stub da web importa o SDK nativo — o Metro volta a empacotar ~750 KB no chunk do paywall'
  );
  assert.match(web, /export const LOJA_ATIVA = false;/, 'a web tem que responder "não vendo por aqui"');
  // Os dois lados exportam os MESMOS nomes: a tela importa de
  // '../lib/purchases' e quem escolhe o arquivo é a plataforma.
  for (const nome of ['LOJA_ATIVA', 'carregarLoja', 'comprarPlano', 'restaurarCompras']) {
    const re = new RegExp('export (const|async function) ' + nome + '\\b');
    assert.match(web, re, 'lib/purchases.web.js sem ' + nome);
    assert.match(nativo, re, 'lib/purchases.js sem ' + nome);
  }
  assert.match(
    PLANOS,
    /from '\.\.\/lib\/purchases'/,
    'a tela precisa importar sem extensão — é isso que deixa a plataforma escolher o arquivo'
  );
});

// PREÇO DA VITRINE. Se a Play não devolveu priceString, o plano não entra na
// lista — senão a tela cairia no preço cravado do site (US$ 5/10/20) enquanto
// a Play cobra outro valor em outra moeda.
test('o preço do site nunca completa a vitrine da loja', () => {
  const src = fs.readFileSync(path.join(RAIZ, 'lib', 'purchases.js'), 'utf8');
  assert.match(src, /if \(pkg\?\.product\?\.priceString\)/, 'carregarLoja aceita pacote sem preço da Play');
  assert.doesNotMatch(
    PLANOS,
    /precos\?\.\[plan\.id\]\?\.preco \|\| plan\.price/,
    'o preço da loja voltou a cair no preço do site como fallback'
  );
});
