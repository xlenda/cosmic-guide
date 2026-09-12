// OS 4 ELEMENTOS NA HOME — a arte que já existia passou a aparecer.
// (12/09/2026)
//
// POR QUE ESTE TESTE EXISTE. As quatro artes de elemento
// (assets/ilustracoes/elemento-*.jpg, 52,5 KB) estavam no repo desde
// 31/08/2026, exportadas em ELEMENTOS_ARTE, e NÃO APARECIAM EM PIXEL NENHUM:
// `elementoImagem()` não tinha um só call site no app inteiro. A pessoa baixava
// as quatro imagens e nunca as via. Um import some sem barulho — foi assim que
// elas sumiram da tela do Mapa em 11/09/2026 — então a ligação fica travada
// aqui.
//
// NÃO RENDERIZA COMPONENTE: não há react-test-renderer no projeto (mesma razão
// declarada em test/diagramacaoPecas.test.js). Lê a FONTE, como o resto do repo.
//
// AS TRÊS LEIS QUE ELE GUARDA:
//   1. a Home CHAMA elementoImagem — sem isso a arte volta a ser peso morto;
//   2. a % continua na tela — a arte COMPLEMENTA o anel, não o substitui, e o
//      número é a única porcentagem que a doutrina do app permite (contagem de
//      planetas × 10). Se ela sumir, a Home perde a vantagem medível que tem
//      sobre o concorrente, que no mesmo lugar mostra "Amor 82%";
//   3. tudo isso vive atrás de `identidade.elementos` — sem data de nascimento
//      não há elemento na tela, nem chutado nem zerado.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const fonte = fs.readFileSync(path.join(raiz, 'components/CabecalhoIdentidade.js'), 'utf8');
const { ELEMENTOS } = require('../lib/elementos');
const { distribuicaoDeElementos } = require('../lib/elementos');

test('a Home desenha a arte do elemento — elementoImagem tem call site de verdade', () => {
  assert.match(fonte, /import \{ elementoImagem \} from '\.\.\/lib\/ilustracoes'/);
  assert.match(fonte, /elementoImagem\(e\.key\)/, 'a chamada sumiu: a arte voltou a ser peso morto no bundle');
  assert.match(fonte, /<Image\s+source=\{arte\}/, 'sem <Image source={arte}> nada é desenhado');
});

test('as quatro artes existem em disco — chave do motor casa com arquivo', () => {
  for (const el of ELEMENTOS) {
    const arq = path.join(raiz, `assets/ilustracoes/elemento-${el}.jpg`);
    assert.ok(fs.existsSync(arq), `falta ${arq}`);
    assert.ok(fs.statSync(arq).size > 1000, `${arq} está vazio`);
  }
});

test('a % NÃO sumiu: a arte complementa o anel, não o substitui', () => {
  // O anel continua recebendo a porcentagem real...
  assert.match(fonte, /<AnelProgresso pct=\{pct\}/, 'o anel perdeu o pct — o desenho deixou de medir');
  // ...e o número continua escrito, agora no chip do canto.
  assert.match(fonte, /anelChipTexto[^]*?\{pct\}%|\{pct\}%<\/Text>/, 'a porcentagem some da tela');
  assert.match(fonte, /identidade\.elementos\.pct\[e\.key\]/, 'o pct deixou de vir da conta real');
});

test('sem data de nascimento não há elemento na tela — nem chutado, nem zero', () => {
  // A composição inteira está atrás da guarda.
  assert.match(fonte, /\{identidade\.elementos && \(/, 'a guarda sumiu: a Home passaria a desenhar elemento sem mapa');
  // E o motor devolve null mesmo, quando não há data — a guarda tem o que guardar.
  assert.equal(distribuicaoDeElementos(null, null), null);
  assert.equal(distribuicaoDeElementos('', ''), null);
});

test('os quatro anéis levam a algum lugar — o convite do concorrente', () => {
  assert.match(fonte, /testID=\{`home-elemento-\$\{e\.key\}`\}/, 'os anéis voltaram a ser pixel morto');
  assert.match(fonte, /chevron-forward/, 'a seta de entrar sumiu');
});
