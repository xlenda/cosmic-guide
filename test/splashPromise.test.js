// A promessa do splash (public/index.html) tem que dizer exatamente o que o
// dicionário diz, nos 3 idiomas.
//
// Por que este teste existe: o splash é o ÚNICO texto do app que não pode
// passar por t(). Ele cobre justamente os 3,4-5,2 segundos em que o bundle
// ainda está baixando — se dependesse de lib/i18n.js, não existiria texto
// nenhum no intervalo que ele precisa preencher. A saída foi duplicar as 6
// frases: PT no HTML estático (pinta no primeiro paint, sem uma linha de JS)
// e ES/EN num <script> inline de microssegundos.
//
// Duplicação sem guarda vira divergência silenciosa: alguém melhora a copy em
// splash.promise, o dicionário fica certo, e o splash — que é o que a pessoa
// realmente lê primeiro — continua com o texto velho pra sempre, sem nenhum
// sinal. Este teste é a guarda. Se as duas cópias divergirem, falha aqui.
//
// (Efeito colateral esperado: splash.promise/splash.trial aparecem no aviso de
// "chave morta" do i18nKeysExist.test.js, porque nenhuma tela chama t() nelas.
// É proposital — o dicionário é a fonte de verdade da tradução, o HTML é só o
// espelho que consegue pintar antes do JS.)

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { translate, LANGUAGES } = require('../lib/i18n.js');

const TEMPLATE = path.join(__dirname, '..', 'public', 'index.html');
const html = fs.readFileSync(TEMPLATE, 'utf8');

test('public/index.html é o template do build (dist/ é gerado a partir dele)', () => {
  // Se este arquivo sumir/for renomeado, o Expo volta pro template padrão dele
  // e a promessa desaparece do ar sem ninguém perceber.
  assert.ok(fs.existsSync(TEMPLATE), 'public/index.html sumiu — o splash inteiro vai embora no próximo export');
  assert.match(html, /id="cosmic-splash"/, 'o bloco #cosmic-splash não está mais no template');
});

test('as 6 frases do splash batem com splash.promise/splash.trial nos 3 idiomas', () => {
  for (const lang of LANGUAGES) {
    for (const key of ['splash.promise', 'splash.trial']) {
      const frase = translate(lang, key);
      assert.notEqual(frase, key, `${lang}/${key} não existe no dicionário`);
      assert.ok(
        html.includes(frase),
        `${lang}/${key} = "${frase}" está no dicionário mas NÃO em public/index.html — ` +
          `as duas cópias divergiram e o visitante lê a do HTML.`
      );
    }
  }
});

test('a promessa em PT é markup dentro de #root, antes de qualquer <script>', () => {
  // Este é o ponto INTEIRO da frente: a frase tem que pintar junto com o
  // splash, sem depender de nada baixar. Se ela escorregar pra dentro do JS
  // (ou pra depois da primeira tag <script>), volta a aparecer só quando o
  // bundle já carregou — ou seja, tarde demais pra ter servido pra algo.
  //
  // O recorte é estreito de propósito: comentários fora (o navegador não
  // pinta comentário) e a busca começa DEPOIS de <div id="root">. Sem isso o
  // teste passaria de graça — a mesma frase existe lá em cima no
  // og:description, e "achar o texto no arquivo" não prova nada sobre o que
  // aparece na tela.
  const promessaPt = translate('pt', 'splash.promise');
  const trialPt = translate('pt', 'splash.trial');

  const semComentarios = html.replace(/<!--[\s\S]*?-->/g, '');

  const inicioRoot = semComentarios.indexOf('<div id="root">');
  assert.ok(inicioRoot > -1, 'não achei <div id="root"> — o Expo monta o app aí');

  // #root é o bloco que o React substitui ao montar; splash fora dali ficaria
  // na tela por cima do app pra sempre.
  const depoisDoRoot = semComentarios.slice(inicioRoot);
  const primeiroScript = depoisDoRoot.indexOf('<script');
  assert.ok(primeiroScript > -1, 'esperava pelo menos um <script> depois de #root');

  const pintaSemJs = depoisDoRoot.slice(0, primeiroScript);
  assert.ok(
    pintaSemJs.includes(promessaPt),
    'a promessa em PT não é markup dentro de #root — só apareceria depois do bundle carregar'
  );
  assert.ok(
    pintaSemJs.includes(trialPt),
    '"7 dias grátis" não é markup dentro de #root — só apareceria depois do bundle carregar'
  );
});

test('o splash detecta idioma igual ao LanguageContext (?lang= > salvo > navegador)', () => {
  // Se a ordem divergir, a pessoa lê a promessa num idioma e o app abre em
  // outro dois segundos depois.
  assert.match(html, /lang=\(pt\|es\|en\)/, 'sumiu a leitura do ?lang= da URL');
  assert.match(html, /getItem\('app-language'\)/, "sumiu a leitura da preferência salva ('app-language')");
  assert.match(html, /navigator\.language/, 'sumiu o fallback pro idioma do navegador');
});
