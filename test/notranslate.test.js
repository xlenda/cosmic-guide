// O PORTAO DO NOTRANSLATE (13/09/2026).
//
// ===========================================================================
// O DEFEITO QUE ESTE ARQUIVO FECHA
// ===========================================================================
// O Google Tradutor nao reescreve o texto no lugar: ele ENVOLVE cada no de
// texto num <font> que ele mesmo cria e insere no DOM. O React guardou a
// referencia do no ORIGINAL; quando ele vai atualizar aquele texto, o no que
// tem na mao ja nao e filho do pai que ele espera, e o removeChild estoura.
// A tela morre no meio do uso, sem erro de rede e sem log util.
//
// Nao e hipotese: mordeu o Celeste em 09/08/2026 e virou lei da casa desde
// entao ("notranslate em 2 camadas em TODO app web").
//
// MEDIDO NESTE REPO no dia em que este teste nasceu: producao
// (https://cosmicguide.cloud/cosmic-guide/) servia <html lang="en"> com corpo
// em portugues, SEM translate="no", SEM class notranslate e SEM a meta —
// nenhuma das duas camadas existia, e nenhum teste do repo mencionava o
// assunto, entao nunca ia acusar sozinho. A superficie exposta eram 53 telas,
// 17 arquivos com TextInput e 3 telas que reescrevem texto por intervalo
// (DescobrirScreen, GroundingScreen, QuizScreen) — exatamente o perfil que o
// bug morde.
//
// ===========================================================================
// POR QUE O PORTAO OLHA A RAIZ, E NAO CADA TELA
// ===========================================================================
// A tentacao era marcar tela por tela / peca por peca. Seria o erro: a proxima
// tela nova nasce desprotegida por esquecimento, e o portao viraria uma lista
// de 70 nomes pra manter. `translate="no"` e a classe `notranslate` no <html>
// sao HERDADOS por toda a arvore — uma linha cobre as 70 telas, as 6 pecas de
// components/ e todo TextInput de uma vez, hoje e depois.
//
// As TRES formas juntas de proposito: o Chrome respeita o atributo, o
// Firefox/Edge historicamente so a classe, e a meta `google/notranslate`
// desliga a OFERTA de traduzir (a barrinha) em vez de so recusar o resultado.
//
// Falha aqui = nao pode publicar. E de proposito.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const TEMPLATE = path.join(RAIZ, 'public', 'index.html');
const html = fs.readFileSync(TEMPLATE, 'utf8');

// A tag <html ...> de abertura, que e onde as tres marcas tem de estar pra
// valerem por heranca em toda a arvore.
const tagHtml = (html.match(/<html\b[^>]*>/i) || [''])[0];

// =====================================================================
// CAMADA 1 — HTML ESTATICO (vale antes de o bundle de ~2MB existir)
// =====================================================================

test('a tag <html> traz translate="no" (a forma que o Chrome respeita)', () => {
  assert.ok(tagHtml, 'nao achei a tag <html> de abertura em public/index.html');
  assert.match(
    tagHtml,
    /\btranslate\s*=\s*["']no["']/i,
    'sem translate="no" na raiz, o Chrome traduz o app inteiro e o React quebra ' +
      'ao atualizar qualquer texto envolvido por <font> (Celeste, 09/08/2026)'
  );
});

test('a tag <html> traz class notranslate (a forma que Firefox/Edge respeitam)', () => {
  assert.match(
    tagHtml,
    /\bclass\s*=\s*["'][^"']*\bnotranslate\b/i,
    'a classe notranslate na raiz e a segunda forma da mesma blindagem — ' +
      'navegador que ignora o atributo ainda le a classe'
  );
});

test('a meta google/notranslate desliga a OFERTA de traduzir', () => {
  assert.match(
    html,
    /<meta\s+name\s*=\s*["']google["']\s+content\s*=\s*["']notranslate["']/i,
    'sem esta meta a barrinha "Traduzir esta pagina?" ainda aparece — o atributo ' +
      'so recusa o resultado, a meta evita o convite'
  );
});

// =====================================================================
// CAMADA 2 — RUNTIME (sobrevive a quem reescreva o <html> no export/hospedagem)
// =====================================================================
// O script inline do splash JA mexe no documentElement (ele corrige o `lang`
// pro idioma real, porque o Expo resolve %LANG_ISO_CODE% pra "en" fixo). A
// segunda camada mora no MESMO lugar de proposito: e o unico codigo que roda
// antes do bundle, e custa duas linhas.

test('o script inline reafirma translate="no" no documentElement', () => {
  assert.match(
    html,
    /setAttribute\(\s*['"]translate['"]\s*,\s*['"]no['"]\s*\)/,
    'a segunda camada sumiu: se alguma etapa do export ou da hospedagem reescrever ' +
      'a tag <html>, nada mais repoe a blindagem'
  );
});

test('o script inline reafirma a classe notranslate no documentElement', () => {
  assert.match(
    html,
    /classList\.add\(\s*['"]notranslate['"]\s*\)/,
    'a segunda camada da classe sumiu — mesma razao do teste acima'
  );
});

// =====================================================================
// O PORTAO NAO PASSA POR VACUIDADE
// =====================================================================
// Se um dia public/index.html for renomeado ou esvaziado, os testes acima
// passariam com prazer num arquivo que nao e mais o template servido. Este
// exige que o arquivo continue sendo o template de verdade.

test('o portao esta olhando o template de verdade (nao um arquivo vazio)', () => {
  assert.ok(html.length > 2000, `public/index.html tem so ${html.length} bytes — nao e mais o template`);
  assert.match(html, /<div id="root">/, 'o template perdeu o #root — este teste precisa ser reescrito');
  assert.match(html, /%LANG_ISO_CODE%/, 'o template perdeu o placeholder do Expo — este teste precisa ser reescrito');
});
