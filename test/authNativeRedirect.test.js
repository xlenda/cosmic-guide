// Regressão do login que NUNCA voltava pro app no Android: o OAuth do Google e
// os links de e-mail apontavam pra URL web (cosmicguide.cloud), então a pessoa
// aprovava tudo no navegador e o app continuava deslogado pra sempre. No
// nativo o caminho de volta é o deep link 'cosmicguide://' e a troca do código
// PKCE por sessão tem que ser feita à mão (na web quem faz isso é o
// detectSessionInUrl do SDK, que não existe fora do navegador).
//
// O segundo bug travado aqui é a ORDEM real do Android. O openAuthSessionAsync
// do expo-web-browser 15 NÃO usa ASWebAuthenticationSession no Android
// (_authSessionIsNativelySupported() = `Platform.OS !== 'android'`): ele cai no
// polyfill _waitForRedirectAsync, que só registra o Linking.addEventListener
// DELE na hora da chamada. O listener do supabaseClient já está registrado
// desde o import, e o emitter do React Native entrega na ordem de registro —
// ou seja, o listener do app vê o código PRIMEIRO. Se a trava de código duplo
// for um simples "já usei esse código", quem chega depois (o retorno do
// openAuthSessionAsync, que é quem a tela de login está esperando) recebe uma
// resposta vazia: a sessão é criada mas a pessoa fica parada na tela de login.
// Por isso o mock abaixo registra os DOIS listeners e faz UMA emissão só, na
// ordem real — simular a ordem invertida deixava este teste verde num código
// quebrado.
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const registro = { oauth: null, signUp: null, reset: null, update: null, exchange: [], abriu: null, emissoes: [] };
// O que o SISTEMA entrega enquanto a aba de autenticação está aberta. `null` =
// a pessoa fechou a aba sem aprovar (nenhum deep link chega).
let deepLinkDeVolta = 'cosmicguide://?code=abc123';
let exchangeExplode = false;
const ouvintesDeUrl = [];

const supabaseMock = {
  __esModule: true,
  createClient: () => ({
    auth: {
      async signInWithOAuth(opts) {
        registro.oauth = opts;
        return { data: { url: 'https://accounts.google.com/o/oauth2/auth?x=1' }, error: null };
      },
      async exchangeCodeForSession(code) {
        registro.exchange.push(code);
        if (exchangeExplode) throw new Error('Network request failed');
        return { error: null };
      },
      async signUp(opts) {
        registro.signUp = opts;
        return { data: { session: {} }, error: null };
      },
      async resetPasswordForEmail(email, opts) {
        registro.reset = opts;
        return { error: null };
      },
      async updateUser(fields) {
        registro.update = fields;
        return { error: null };
      },
    },
  }),
};

const reactNativeMock = {
  __esModule: true,
  Platform: { OS: 'android' },
  Linking: {
    async getInitialURL() {
      return null;
    },
    addEventListener(evento, handler) {
      if (evento !== 'url') return { remove() {} };
      ouvintesDeUrl.push(handler);
      return {
        remove() {
          const i = ouvintesDeUrl.indexOf(handler);
          if (i >= 0) ouvintesDeUrl.splice(i, 1);
        },
      };
    },
  },
};

const webBrowserMock = {
  __esModule: true,
  // Reproduz o polyfill do Android (_openAuthSessionPolyfillAsync ->
  // _waitForRedirectAsync): o listener nasce AGORA, depois do que o
  // supabaseClient registrou no import do módulo.
  async openAuthSessionAsync(url, redirect) {
    registro.abriu = { url, redirect };
    if (!deepLinkDeVolta) return { type: 'dismiss' };
    return new Promise((resolve) => {
      const sub = reactNativeMock.Linking.addEventListener('url', (evento) => {
        if (evento.url.startsWith(redirect)) {
          sub.remove();
          resolve({ type: 'success', url: evento.url });
        }
      });
      // A aba já está aberta quando o sistema entrega o deep link.
      setImmediate(() => emitirDeepLink(deepLinkDeVolta));
    });
  },
};

// Emitter do React Native: UMA emissão, todos os listeners, na ordem de
// registro (Libraries/vendor/emitter/EventEmitter.js).
function emitirDeepLink(url) {
  registro.emissoes.push({
    ouvintes: ouvintesDeUrl.length,
    appEraOPrimeiro: ouvintesDeUrl[0] === ouvinteDoApp,
  });
  for (const handler of Array.from(ouvintesDeUrl)) handler({ url });
}

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'react-native') return reactNativeMock;
  if (request === 'expo-web-browser') return webBrowserMock;
  if (request === '@supabase/supabase-js') return supabaseMock;
  if (request === 'react-native-url-polyfill/auto') return {};
  if (request === '@react-native-async-storage/async-storage') return { __esModule: true, default: {} };
  return originalLoad.call(this, request, parent, isMain);
};

const auth = require('../lib/supabaseClient.js');
// Registrado no import do módulo — antes de qualquer chamada.
const ouvinteDoApp = ouvintesDeUrl[0];

test('nativo: Google abre a aba com deep link de volta e troca o código por sessão', async () => {
  const r = await auth.signInWithGoogle();
  assert.equal(registro.oauth.options.redirectTo, 'cosmicguide://');
  assert.equal(registro.oauth.options.skipBrowserRedirect, true);
  assert.equal(registro.abriu.redirect, 'cosmicguide://');
  // A ordem REAL do Android: dois listeners na mesma emissão, o do app na
  // frente. Se isso deixar de valer, o teste parou de testar o bug.
  assert.deepEqual(registro.emissoes, [{ ouvintes: 2, appEraOPrimeiro: true }]);
  // Código de uso único: uma troca só, mesmo chegando pelos dois caminhos.
  assert.deepEqual(registro.exchange, ['abc123']);
  // Sem isso a tela de login não sabe que pode seguir viagem (e quem veio do
  // checkout ficaria preso na tela de login, sem o plano escolhido).
  assert.equal(r.concluido, true);
  assert.equal(r.error, undefined);
});

test('o mesmo retorno chegando de novo devolve a MESMA resposta, sem trocar duas vezes', async () => {
  assert.ok(ouvinteDoApp, 'o listener de deep link precisa existir no nativo');
  const r = await ouvinteDoApp({ url: 'cosmicguide://?code=abc123' });
  assert.deepEqual(registro.exchange, ['abc123']);
  assert.equal(r.concluido, true);
  assert.equal(r.error, undefined);
});

test('link de e-mail (código novo) entra sozinho pelo deep link', async () => {
  await ouvinteDoApp({ url: 'cosmicguide://?code=zzz999' });
  assert.deepEqual(registro.exchange, ['abc123', 'zzz999']);
});

test('desistir do login não vira erro na tela', async () => {
  deepLinkDeVolta = null;
  const r = await auth.signInWithGoogle();
  assert.deepEqual(r, {});
});

// O erro que volta na URL é sempre inglês do Supabase/Google; o módulo devolve
// CHAVE de i18n pra tela traduzir, nunca o texto cru.
test('erro que volta na URL vira chave de i18n e não tenta trocar código', async () => {
  const antes = registro.exchange.length;
  deepLinkDeVolta = 'cosmicguide://?error=access_denied&error_description=Login+cancelado';
  const r = await auth.signInWithGoogle();
  assert.equal(r.error, 'login.error.generic');
  assert.equal(registro.exchange.length, antes);
});

test('rede caindo no meio da troca vira mensagem, não promessa rejeitada', async () => {
  exchangeExplode = true;
  deepLinkDeVolta = 'cosmicguide://?code=caiu-a-rede';
  const r = await auth.signInWithGoogle();
  assert.equal(r.error, 'login.error.generic');
  assert.equal(r.concluido, undefined);
  exchangeExplode = false;
});

// Aparelho sem navegador (ActivityNotFoundException) ou uma aba de auth já
// aberta: o expo-web-browser RE-LANÇA. Se a exceção subir, o
// setGoogleLoading(false) da LoginScreen nunca roda e a tela fica girando pra
// sempre — sem segundo toque possível, porque o botão já é o ActivityIndicator.
test('navegador que não abre vira erro na tela, não tela girando pra sempre', async () => {
  const original = webBrowserMock.openAuthSessionAsync;
  webBrowserMock.openAuthSessionAsync = async () => {
    throw new Error('No matching activity found');
  };
  const antes = registro.exchange.length;
  try {
    const r = await auth.signInWithGoogle();
    assert.equal(r.error, 'login.error.generic');
    assert.equal(r.concluido, undefined);
    assert.equal(registro.exchange.length, antes);
  } finally {
    webBrowserMock.openAuthSessionAsync = original;
  }
});

test('confirmação de e-mail e recuperação de senha voltam pro app, não pro site', async () => {
  await auth.signUpWithEmail('a@b.com', 'segredo123');
  assert.equal(registro.signUp.options.emailRedirectTo, 'cosmicguide://');
  await auth.resetPasswordForEmail('a@b.com');
  assert.equal(registro.reset.redirectTo, 'cosmicguide://');
});

test('sessão de recuperação só troca a senha quando updateUser é chamado', async () => {
  assert.deepEqual(await auth.updatePasswordForCurrentUser('curta'), { error: 'login.error.weakPassword' });
  assert.equal(registro.update, null, 'senha inválida não deve chegar ao Supabase');

  assert.deepEqual(await auth.updatePasswordForCurrentUser('segredo123'), {});
  assert.deepEqual(registro.update, { password: 'segredo123' });
});
