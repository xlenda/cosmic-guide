// A COMPATIBILIDADE DO CASAL NA HOME — o cálculo que rodava e não aparecia.
// (13/09/2026)
//
// POR QUE ESTE TESTE EXISTE. Irmão gêmeo de test/fraseDoAmorNaHome.test.js, e
// o mesmo commit: 62c1db4 ("Tira os blocos que viraram missão") levou da Home
// os blocos promovidos a missão do dia. Três saíram por decisão (céu de hoje,
// próximos dias, e a compatibilidade). O dono depois pediu ESTA de volta, como
// já tinha pedido a Frase do Amor.
//
// E NADA QUEBROU NO MEIO TEMPO — esse é o ponto. `compat` continuou sendo
// CALCULADO em todo render da Home, chamando compatibility() → sinastria()
// inteira, e o resultado não era escrito em lugar nenhum. Medido no código vivo
// (comentários removidos, porque o arquivo fala de "compatibilidade" em prosa e
// um grep cru mente): UMA única ocorrência de `compat` no arquivo, a própria
// definição. Zero uso. Trabalho jogado fora a cada render, invisível pra build,
// lint e testes.
//
// A ASSERÇÃO PRINCIPAL É O USO, NÃO A POSIÇÃO. Ancorar em testID ou em "vem
// depois do card X" quebra sozinho na próxima reordenação da Home — e a Home já
// foi reordenada duas vezes em três dias (12/09 e 13/09). O teste da Frase do
// Amor sobreviveu a essas viradas justamente por exigir o CALL SITE. Mesmo
// antídoto aqui: `compat` tem que ser LIDO no JSX, onde quer que o bloco esteja.
//
// NÃO RENDERIZA COMPONENTE: não há react-test-renderer no projeto (mesma razão
// declarada em test/elementosNaHome.test.js e test/fraseDoAmorNaHome.test.js).
// Lê a FONTE, como o resto do repo.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const home = fs.readFileSync(path.join(raiz, 'screens/HomeScreen.js'), 'utf8');
const i18n = fs.readFileSync(path.join(raiz, 'lib/i18n.js'), 'utf8');
const signs = fs.readFileSync(path.join(raiz, 'lib/signs.js'), 'utf8');

// Comentário é prosa, não código. O HomeScreen escreve "compatibilidade" em
// vários cabeçalhos explicando por que o bloco saiu e voltou — contar `compat`
// sem remover comentário dá falso positivo, e já deu dois nesta sessão.
const BARRA = String.fromCharCode(92);
function semComentarios(s) {
  let o = '';
  let i = 0;
  const n = s.length;
  while (i < n) {
    const c = s[i];
    const d = s[i + 1];
    if (c === '/' && d === '/') { while (i < n && s[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(s[i] === '*' && s[i + 1] === '/')) i++; i += 2; continue; }
    if (c === "'" || c === '"' || c === '`') {
      const q = c;
      o += c;
      i++;
      while (i < n) {
        if (s[i] === BARRA) { o += s[i] + (s[i + 1] || ''); i += 2; continue; }
        if (s[i] === q) { o += s[i]; i++; break; }
        o += s[i];
        i++;
      }
      continue;
    }
    o += c;
    i++;
  }
  return o;
}

const homeVivo = semComentarios(home);

// ESTA É A TRAVA PRINCIPAL. O defeito não era "a função sumiu" — era "calcula e
// não mostra". Então a asserção é sobre USO, e ela conta no código vivo.
test('compat é USADO no JSX, não só calculado', () => {
  const usos = (homeVivo.match(/\bcompat\b/g) || []).length;
  assert.ok(
    usos > 1,
    `\`compat\` aparece ${usos}x no código vivo do HomeScreen — só a definição. ` +
      'Voltou a ser o defeito de 62c1db4: a Home calcula a sinastria inteira a cada ' +
      'render e não escreve o resultado em lugar nenhum da tela.'
  );
  // E o cálculo continua de pé, senão o uso acima apontaria pro nada.
  assert.match(
    homeVivo,
    /const compat = coupleData\?\.sa && coupleData\?\.sb \? compatibility\(coupleData\.sa, coupleData\.sb, lang\) : null;/,
    'o cálculo da sinastria sumiu ou mudou de forma'
  );
  assert.match(homeVivo, /import \{ compatibility \} from '\.\.\/lib\/signs'/, 'o import de compatibility() saiu');
});

// O QUE O ESTADO CHEIO TEM QUE ESCREVER. Cada um destes é um campo que vem do
// CÁLCULO — tirar qualquer um deixa o cartão dizendo menos do que o app sabe.
test('o estado cheio escreve o que foi calculado: resumo, os dois emojis, aspecto e categoria', () => {
  assert.match(homeVivo, /\{compat\.resumo\}/, 'o resumo da leitura não é escrito: o cartão fica sem o texto em língua de gente');
  assert.match(homeVivo, /\{compat\.emojiA\}\{compat\.emojiB\}/, 'os emojis dos dois signos sumiram do chip');
  assert.match(
    homeVivo,
    /CHAVES_DE_TRADUCAO\.aspecto\[compat\.familia\]/,
    'o aspecto deixou de ser traduzido: apareceria "trigono" cru, ou nada'
  );
  assert.match(
    homeVivo,
    /CHAVES_DE_TRADUCAO\.categoria\[compat\.categoriaId\]/,
    'a categoria deixou de ser traduzida'
  );
  assert.match(homeVivo, /import \{[^}]*CHAVES_DE_TRADUCAO[^}]*\} from '\.\.\/lib\/synastry'/, 'CHAVES_DE_TRADUCAO saiu do import');
});

// QUENTE PRIMEIRO, FICHA DEPOIS (lei da casa, 04/08/2026). O resumo em língua
// de gente abre; "{aspecto} · {categoria}" desce e vira recibo. Esta é a única
// asserção de ORDEM do arquivo, e ela é DENTRO do bloco — não a posição do
// bloco na tela, que é justamente o que não pode travar.
test('dentro do cartão, o resumo vem antes do recibo aspecto·categoria', () => {
  const iResumo = homeVivo.indexOf('{compat.resumo}');
  const iRecibo = homeVivo.indexOf("t('home.compatAspect'");
  assert.ok(iResumo > -1 && iRecibo > -1, 'resumo ou recibo sumiram do cartão');
  assert.ok(
    iResumo < iRecibo,
    'a ficha subiu na frente da leitura: "trígono · harmônico" antes do texto que explica o par'
  );
});

// O ESTADO VAZIO É O CENTRO DA LEI DE NÃO FABRICAR. Sem os dois signos, compat
// é null — e null tem que virar CONVITE, não buraco e muito menos número.
test('sem par, o cartão cai no convite e não some da tela', () => {
  assert.match(homeVivo, /\{compat \? \(/, 'o ternário sumiu: sem ele não há estado vazio, e quem está solo vê um buraco');
  for (const chave of ['compatTitleEmpty', 'compatSubtitleEmpty', 'compatTextEmpty', 'compatLinkEmpty']) {
    assert.match(homeVivo, new RegExp(`t\\('home\\.${chave}'\\)`), `home.${chave} não é escrita: o estado vazio ficou incompleto`);
  }
});

// NÃO FABRICAR, MEDIDO NO MOTOR E NA TELA. O dono recusou porcentagem inventada
// duas vezes; compatPercent() não foi renomeada, foi REMOVIDA do app. Este teste
// falha se ela voltar por qualquer porta, ou se a tela plantar um número.
test('nenhuma porcentagem de compatibilidade, nem no motor nem no cartão', () => {
  assert.doesNotMatch(signs, /export function compatPercent/, 'compatPercent() voltou a lib/signs.js — a porcentagem foi removida do app inteiro');
  assert.doesNotMatch(homeVivo, /compat\.(pct|percent|score|nota)\b/, 'o cartão voltou a ler um número de compatibilidade que o motor não calcula');
  assert.doesNotMatch(homeVivo, /\d+% de compatibilidade/, 'porcentagem hard-coded no cartão da Home');
});

// O que o motor DEVOLVE é o contrato que o cartão lê. Se o shape mudar, o
// cartão escreve `undefined` na tela sem quebrar nada — exatamente o tipo de
// falha silenciosa que este arquivo inteiro existe pra pegar.
test('o motor devolve os campos que o cartão lê, e null sem os dois signos', () => {
  for (const campo of ['emojiA', 'emojiB']) {
    assert.match(signs, new RegExp(`${campo}: `), `compatibility() parou de devolver ${campo}`);
  }
  assert.match(signs, /if \(ia < 0 \|\| ib < 0\) return null;/, 'o motor parou de devolver null pra signo desconhecido');
  assert.match(signs, /if \(!leitura\) return null;/, 'o motor parou de devolver null quando não há leitura');
});

// O APP INTEIRO NO MESMO IDIOMA (lei da casa). `coupleData.sa`/`sb` são SEMPRE
// português — é o que o quiz grava. Escritos crus, o título do cartão ficava
// "Gêmeos + Libra" coroando um corpo que dizia "Gemini and Libra" (medido no
// build de 13/09/2026 em en e es). Mesmo defeito que lib/signs.js consertou no
// `titulo` em 01/08/2026.
test('o título do cartão traduz os dois signos, não escreve o campo cru', () => {
  assert.match(
    homeVivo,
    /\{nomeDoSigno\(coupleData\.sa, lang\)\} \+ \{nomeDoSigno\(coupleData\.sb, lang\)\}/,
    'o título voltou a escrever coupleData.sa/sb crus: em en/es o cartão mistura dois idiomas'
  );
  assert.doesNotMatch(homeVivo, /\{coupleData\.sa\} \+ \{coupleData\.sb\}/, 'sobrou um título sem tradução');
  assert.match(homeVivo, /import \{[^}]*nomeDoSigno[^}]*\} from '\.\.\/lib\/synastry'/, 'nomeDoSigno saiu do import');
});

// O app inteiro no mesmo idioma: as chaves do bloco nos TRÊS pacotes, senão a
// tela mostra a chave crua pra quem não está em pt.
test('as chaves do bloco existem nos três idiomas', () => {
  const chaves = ['compatSeeMore', 'compatTitleEmpty', 'compatSubtitleEmpty', 'compatTextEmpty', 'compatLinkEmpty', 'compatAspect'];
  for (const chave of chaves) {
    const ocorrencias = i18n.split(`'home.${chave}':`).length - 1;
    assert.equal(ocorrencias, 3, `home.${chave} existe em ${ocorrencias} idioma(s), deviam ser 3`);
  }
});
