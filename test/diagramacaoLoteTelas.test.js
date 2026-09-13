// O LOTE DE TELAS QUE RECEBEU A DIAGRAMAÇÃO — o portão. (12/09/2026)
//
// Irmão de test/diagramacaoPecas.test.js, que guarda AS PEÇAS. Este guarda o
// USO delas nas telas do lote: Comunidade, Órbi (chat), Diário, Explorar,
// Quiz Cósmico, Mitos e Papel de Parede.
//
// POR QUE UM TESTE DE FONTE, E NÃO DE RENDER. Não há react-test-renderer no
// projeto (conferido 12/09/2026, mesma nota do teste das peças), e o repo
// inteiro testa lógica em lib/ + o TEXTO dos componentes. O que estas telas
// têm de testável sem render é justamente o que volta sozinho: alguém reabre
// o arquivo, acha um número "mais bonito" e repõe o 14/21 de sempre, e
// nenhum teste reclama até o app já estar no ar com duas caras.
//
// AS LEIS GUARDADAS AQUI
//   1. cada tela do lote usa ao menos UMA peça (senão não recebeu nada);
//   2. duas a quatro faixas por tela — cinco vira textura;
//   3. toda faixa tem SEMENTE, e sementes distintas dentro do mesmo arquivo
//      (semente repetida = a mesma onda duas vezes = papel de parede);
//   4. o corpo de texto das telas do lote sai da ESCALA, não de número cru;
//   5. as duas strings do Diário que estavam cravadas em português existem
//      nos três idiomas.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const leia = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');

// As telas do lote e a peça que cada uma DEVE usar. Quem só recebeu escala de
// espaço/tipografia (o chat e o diário, que são listas de mensagens e de
// cards — faixa em volta de balão de conversa seria textura) entra com
// `pecas: null` e é cobrada só pela escala.
const LOTE = [
  { arq: 'screens/MitosScreen.js', faixas: true },
  { arq: 'screens/QuizCosmicoScreen.js', faixas: true },
  { arq: 'screens/ExploreScreen.js', faixas: true },
  { arq: 'screens/WallpaperScreen.js', faixas: true },
  { arq: 'screens/CommunityHubScreen.js', faixas: false },
  { arq: 'screens/ChatScreen.js', faixas: false },
  { arq: 'screens/DiaryScreen.js', faixas: false },
];

// Tira comentários: o que vale é o que o arquivo FAZ, não o que ele diz que
// faz. Sem isto, um comentário citando "FaixaCurva" passaria por uso.
function codigo(fonte) {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

test('toda tela do lote lê a fundação — escala de espaço e de tipografia', () => {
  for (const { arq } of LOTE) {
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

test('as telas que ganharam faixa usam a peça de verdade, não um card com borda', () => {
  for (const { arq, faixas } of LOTE) {
    if (!faixas) continue;
    const fonte = codigo(leia(arq));
    assert.match(fonte, /<FaixaCurva/, `${arq} deveria ter faixa curva e não tem`);
    // O import default da peça, com ou sem nomeados ao lado. O `, { corDoTom }`
    // é legítimo (12/09/2026): a tela que pinta o próprio chão com o tom da
    // última faixa precisa da cor, e a versão anterior desta regex — que exigia
    // `import FaixaCurva from` colado — reprovava esse import correto.
    assert.match(
      fonte,
      /import FaixaCurva(?:,\s*\{[^}]*\})? from '\.\.\/components\/FaixaCurva'/,
      `${arq} usa <FaixaCurva> sem importar a peça`
    );
  }
});

test('DUAS A QUATRO faixas por tela — cinco ou mais e a faixa vira textura', () => {
  for (const { arq, faixas } of LOTE) {
    if (!faixas) continue;
    const fonte = codigo(leia(arq));
    const usos = (fonte.match(/<FaixaCurva/g) || []).length;
    assert.ok(
      usos >= 1 && usos <= 4,
      `${arq} desenha ${usos} faixas — a regra do guia é duas a quatro por tela (uma só vale quando a tela tem uma seção só, como o Papel de Parede)`
    );
  }
});

test('toda faixa tem SEMENTE, e duas faixas do mesmo arquivo nunca repetem a onda', () => {
  for (const { arq, faixas } of LOTE) {
    if (!faixas) continue;
    const fonte = codigo(leia(arq));
    const tags = fonte.match(/<FaixaCurva[\s\S]*?>/g) || [];
    const sementes = [];
    for (const tag of tags) {
      // A semente pode ser literal ("mito-fonte") ou template (`explorar-${...}`),
      // que é uma semente POR SEÇÃO e portanto sempre distinta.
      const m = tag.match(/semente=\{?[`"']([^`"']+)/);
      assert.ok(m, `${arq}: faixa sem semente — sem ela todas as faixas do arquivo desenham a MESMA onda:\n${tag}`);
      sementes.push(m[1]);
    }
    assert.equal(
      new Set(sementes).size,
      sementes.length,
      `${arq}: duas faixas com a mesma semente (${sementes.join(', ')}) — onda repetida é papel de parede`
    );
  }
});

// A ÚNICA exceção legítima ao fontSize cru: o GLIFO. Emoji de signo, símbolo
// do zodíaco, avatar — ali o número é DIMENSÃO DE DESENHO, não degrau de
// leitura. Um símbolo de Áries em 11px não é "hierarquia menor", é um ícone
// ilegível. A lista é nominal de propósito: assim a exceção é auditável e
// ninguém escapa da escala batizando um parágrafo de "glifo".
const GLIFOS = new Set([
  'guestGlyph',
  'signControlGlyph',
  'avatarEmoji',
  'relationGlyph',
  'signOptionGlyph',
  'targetChipGlyph',
  'threadCommentAvatarText',
  'glifoNativo', // o glifo de 96px da maquete do PNG, em WallpaperScreen
]);

test('o texto das telas do lote sai da escala — nada de fontSize cru no corpo', () => {
  // O alvo é o TEXTO: fontSize solto num StyleSheet. Tamanhos de CAIXA
  // (width/height/borderRadius) não são tipografia e continuam livres.
  for (const { arq } of LOTE) {
    const fonte = codigo(leia(arq));
    // Acha o NOME do estilo dono de cada fontSize: varre pra trás até a última
    // abertura de chave rotulada (`nomeDoEstilo: {`) antes da ocorrência.
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
      `${arq} tem fontSize cru fora da escala: ${infratores.join(', ')} — o degrau tem que vir de type.*, senão a hierarquia volta a ser 12/13/14/15 espalhados`
    );
  }
});

test('o Diário não tem mais texto cravado em português — as duas viraram chave', () => {
  const fonte = leia('screens/DiaryScreen.js');
  assert.doesNotMatch(
    fonte,
    /INSIGHT DA SEMANA/,
    'o rótulo do Insight voltou a ser literal — quem abre em ES/EN vê português no meio da tela'
  );
  assert.doesNotMatch(
    codigo(fonte),
    /Toda leitura de tar/,
    'o parágrafo do diário vazio voltou a ser literal'
  );
  const dic = leia('lib/i18n.js');
  for (const chave of ['diary.weekly.label', 'diary.empty.desc']) {
    const ocorrencias = (dic.match(new RegExp(`'${chave.replace(/\./g, '\\.')}':`, 'g')) || []).length;
    assert.equal(
      ocorrencias,
      3,
      `${chave} existe em ${ocorrencias} idiomas — tem que existir nos três (pt/es/en), senão a tela cai no fallback`
    );
  }
});

test('o Explorar tem UM rodapé de seção, não dois — o segundo apagava o player', () => {
  // O BUG: havia duas props renderSectionFooter no mesmo <SectionList>. Em JS a
  // chave repetida vence a última, então o espaçador matava o CosmicSoundPlayer
  // das Práticas — o player nunca renderizou desde que foi escrito. Se alguém
  // reintroduzir a duplicata, o player some outra vez EM SILÊNCIO.
  const fonte = codigo(leia('screens/ExploreScreen.js'));
  const usos = (fonte.match(/renderSectionFooter=/g) || []).length;
  assert.equal(
    usos,
    1,
    `renderSectionFooter aparece ${usos} vezes — prop repetida em JSX não soma, a última apaga as anteriores`
  );
  assert.match(
    fonte,
    /renderSectionFooter=[\s\S]{0,400}CosmicSoundPlayer/,
    'o rodapé que sobrou não é o que desenha o player — as Práticas perderam o som do céu'
  );
});
