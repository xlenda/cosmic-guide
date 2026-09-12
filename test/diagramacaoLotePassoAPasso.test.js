// O LOTE DO PASSO A PASSO — o portão. (12/09/2026)
//
// Irmão de test/diagramacaoLoteTelas.test.js e de test/diagramacaoPecas.test.js.
// Este guarda as quatro telas de PERGUNTA e PASSO A PASSO: a Jornada Guiada, o
// Quiz do Casal, o "Como você tá?" e o "Como este app decide".
//
// POR QUE UM TESTE DE FONTE, E NÃO DE RENDER. Não há react-test-renderer no
// projeto (mesma nota dos dois testes irmãos), e o que estas telas têm de
// testável sem render é justamente o que volta sozinho: alguém reabre o
// arquivo, acha um 14 "mais bonito" e repõe o número cru, ou põe um
// fontWeight '800' pra "destacar", e nenhum teste reclama até o app já estar
// no ar com duas caras.
//
// AS LEIS GUARDADAS AQUI
//   1. as quatro leem a fundação (escala de espaço + escala tipográfica);
//   2. as quatro usam faixa curva de verdade, 2 a 4 por arquivo;
//   3. toda faixa tem SEMENTE, e sementes distintas no mesmo arquivo;
//   4. nada de fontSize cru fora da lista nominal de glifos;
//   5. NEGRITO É EXCEÇÃO: nenhuma das quatro repõe fontWeight depois do
//      spread de type.* — era a medida do "grita em vez de convidar";
//   6. a tela que tem estado vazio (Como você tá?) protege a faixa com `rasa`:
//      faixa sem conteúdo não pode virar bloco de cor.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const leia = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');

const LOTE = [
  'screens/JornadaScreen.js',
  'screens/QuizScreen.js',
  'screens/ComoVoceTaScreen.js',
  'screens/ComoDecideScreen.js',
];

// Tira comentários: o que vale é o que o arquivo FAZ, não o que ele diz que
// faz. Sem isto, um comentário citando "FaixaCurva" passaria por uso.
function codigo(fonte) {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

test('as quatro telas do passo a passo leem a fundação', () => {
  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    assert.match(
      fonte,
      /import \{[^}]*\bspace\b[^}]*\} from '\.\.\/theme'/,
      `${arq} não importa a escala de espaço — diagramação sem escala é número cru de novo`
    );
    assert.match(
      fonte,
      /import \{[^}]*\btype\b[^}]*\} from '\.\.\/theme'/,
      `${arq} não importa a escala tipográfica`
    );
  }
});

test('as quatro usam a faixa de verdade, 2 a 4 por arquivo', () => {
  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    assert.match(
      fonte,
      /import FaixaCurva from '\.\.\/components\/FaixaCurva'/,
      `${arq} não importa a peça`
    );
    const usos = (fonte.match(/<FaixaCurva/g) || []).length;
    assert.ok(
      usos >= 2 && usos <= 4,
      `${arq} desenha ${usos} faixas — a regra do guia é duas a quatro por tela (cinco vira textura)`
    );
  }
});

test('toda faixa tem SEMENTE, e duas faixas do mesmo arquivo nunca repetem a onda', () => {
  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    const tags = fonte.match(/<FaixaCurva[\s\S]*?>/g) || [];
    const sementes = [];
    for (const tag of tags) {
      const m = tag.match(/semente=\{?[`"']([^`"']+)/);
      assert.ok(m, `${arq}: faixa sem semente — todas as faixas desenhariam a MESMA onda:\n${tag}`);
      sementes.push(m[1]);
    }
    assert.equal(
      new Set(sementes).size,
      sementes.length,
      `${arq}: duas faixas com a mesma semente (${sementes.join(', ')}) — onda repetida é papel de parede`
    );
  }
});

// A ÚNICA exceção legítima ao fontSize cru: o GLIFO. Emoji, símbolo, estrela
// de composição — ali o número é DIMENSÃO DE DESENHO, não degrau de leitura.
// A lista é nominal de propósito: assim a exceção é auditável e ninguém
// escapa da escala batizando um parágrafo de "glifo".
const GLIFOS = new Set([
  'loaderOrb',       // o orbe de 40px do loading do quiz
  'heroStar',        // a estrela de composição da abertura do quiz
  'signCellEmoji',   // o emoji do signo na grade
  'tarotBackGlyph',  // o ✷ do verso da carta
  'tarotEmoji',      // o emoji da carta
  'trayEmoji',       // o emoji na bandeja das três posições
  'revealEmojis',    // os dois emojis grandes do revelar
  'chipEmoji',       // o emoji do chip de emoção
]);

test('o texto das quatro sai da escala — nada de fontSize cru no corpo', () => {
  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    const infratores = [];
    const re = /fontSize:\s*[\d.]+/g;
    let m;
    while ((m = re.exec(fonte)) !== null) {
      const antes = fonte.slice(0, m.index);
      const donos = antes.match(/(\w+):\s*\{/g) || [];
      const dono = donos.length ? donos[donos.length - 1].replace(/:\s*\{$/, '') : '(sem nome)';
      if (!GLIFOS.has(dono)) infratores.push(`${dono} (${m[0]})`);
    }
    assert.deepEqual(
      infratores,
      [],
      `${arq} tem fontSize cru fora da escala: ${infratores.join(', ')} — o degrau tem que vir de type.*`
    );
  }
});

test('NEGRITO É EXCEÇÃO — nenhuma das quatro repõe fontWeight na mão', () => {
  // A lei da escala tipográfica: o peso vem do degrau de type.*, e ponto. Se
  // um texto precisa de destaque e não é título, o que falta é ESPAÇO ou COR.
  // O diagnóstico que abriu esta obra foi 471 usos de peso '800' contra dois
  // de peso leve — um app que grita em vez de convidar.
  for (const arq of LOTE) {
    const fonte = codigo(leia(arq));
    const pesos = fonte.match(/fontWeight:\s*'[0-9]+'/g) || [];
    assert.deepEqual(
      pesos,
      [],
      `${arq} repõe peso na mão (${pesos.join(', ')}) — o peso sai de type.*, e destaque que não é título se faz com espaço ou cor`
    );
  }
});

test('o estado vazio do "Como você tá?" não deixa a faixa virar bloco de cor', () => {
  // O defeito ALTO que um revisor achou na Home: faixa desenhada sem conteúdo
  // nenhum dentro vira um bloco de cor no meio da tela. Aqui a faixa das
  // pontes só existe DEPOIS que a pessoa toca num estado — enquanto não toca,
  // ela é `rasa` (onda pela metade) e com o corpo zerado.
  const fonte = codigo(leia('screens/ComoVoceTaScreen.js'));
  const tag = (fonte.match(/<FaixaCurva[\s\S]*?semente="emocoes-pontes"[\s\S]*?>/) || [])[0];
  assert.ok(tag, 'a faixa das pontes sumiu do Como você tá?');
  assert.match(
    tag,
    /rasa=\{!estado\}/,
    'a faixa das pontes não encolhe no estado vazio — sem `rasa` ela desenha a onda inteira sobre nada'
  );
  assert.match(
    tag,
    /estiloCorpo=\{estado \? null : styles\.faixaVazia\}/,
    'o corpo da faixa não é zerado no estado vazio — o padding de seção pinta um bloco de cor sem conteúdo'
  );
  assert.match(
    fonte,
    /faixaVazia:\s*\{\s*paddingTop:\s*0,\s*paddingBottom:\s*0\s*\}/,
    'faixaVazia deixou de zerar o padding — a faixa volta a ter corpo sem conteúdo'
  );
});

test('a Jornada protege a faixa do Arco enquanto o arco não carregou', () => {
  // Mesmo defeito, outra tela: `arco === null` é "ainda não li o storage".
  // Desenhar a faixa violeta cheia nesse instante é um bloco de cor que pisca
  // antes do conteúdo aparecer.
  const fonte = codigo(leia('screens/JornadaScreen.js'));
  const tag = (fonte.match(/<FaixaCurva[\s\S]*?semente="jornada-arco"[\s\S]*?>/) || [])[0];
  assert.ok(tag, 'a faixa do Arco sumiu da Jornada');
  assert.match(
    tag,
    /rasa=\{arco === null\}/,
    'a faixa do Arco não encolhe enquanto o arco não carregou'
  );
});
