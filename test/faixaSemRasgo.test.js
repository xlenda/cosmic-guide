// A FAIXA NÃO PODE ABRIR RASGO — o portão do conserto de 12/09/2026.
//
// O DEFEITO QUE ESTE TESTE GUARDA, e ele foi FOTOGRAFADO antes de ser escrito:
// na segunda dobra da tela de termos aparecia uma faixa PRETA de ~64px entre a
// seção `ameixa` e a `noite` seguinte. Os dois chãos não se encostavam — o
// "rasgo de fundo entre duas faixas que devem encostar" que os comentários de
// meia dúzia de telas diziam estar evitando, e que estava acontecendo em todas
// elas ao mesmo tempo, inclusive nas três já entregues.
//
// A CAUSA, lida em components/FaixaCurva.js e não adivinhada: o `style` da peça
// vai para a View de FORA, que embrulha o SVG da onda MAIS o corpo colorido.
// Padding vertical ali cria espaço TRANSPARENTE acima e abaixo do
// preenchimento; com duas faixas empilhadas isso vira 32+32 = 64px de fundo do
// app no meio da paisagem. O `grude` (marginTop: -1) foi feito para matar meia
// linha de antialias e não tem como fechar 64px.
//
// POR QUE UM TESTE, e não só o conserto: o defeito é INVISÍVEL na leitura do
// código — `paddingTop: space.secao` num estilo chamado `seccion` parece
// exatamente o que se deve escrever, e foi escrito assim por duas sessões
// diferentes em seis telas. Sem um portão ele volta na sétima.
//
// O QUE ELE PERMITE: `marginTop`/`marginBottom` no `style` da faixa continuam
// válidos — margem separa a faixa do que vem ANTES ou DEPOIS, por fora, que é
// justamente o trabalho dela. O que o teste morde é PADDING vertical, que é o
// que empurra o chão para dentro da própria caixa.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');

/** Todos os .js de telas e componentes, do Cosmic e da Madre. */
function arquivosDeTela() {
  const dirs = [
    path.join(raiz, 'screens'),
    path.join(raiz, 'components'),
    path.join(raiz, 'madremaria', 'screens'),
    path.join(raiz, 'madremaria', 'components'),
  ];
  const saida = [];
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const nome of fs.readdirSync(d)) {
      if (nome.endsWith('.js')) saida.push(path.join(d, nome));
    }
  }
  return saida;
}

/** Os nomes de estilo passados como `style={estilos.X}` a uma <FaixaCurva>. */
function estilosPassadosAFaixa(fonte) {
  const nomes = new Set();
  // <FaixaCurva ... style={estilos.X}> / {styles.X} — a tag pode ter várias
  // linhas e props com arrow function, então varre até o '>' que fecha a tag.
  const re = /<FaixaCurva\b[\s\S]*?>/g;
  let m;
  while ((m = re.exec(fonte)) !== null) {
    const tag = m[0];
    const s = tag.match(/style=\{(?:estilos|styles)\.(\w+)\}/);
    if (s) nomes.add(s[1]);
  }
  return nomes;
}

/** O corpo textual do estilo `nome` dentro de um StyleSheet.create do arquivo. */
function corpoDoEstilo(fonte, nome) {
  const i = fonte.search(new RegExp('^\\s{2}' + nome + ':\\s*\\{', 'm'));
  if (i === -1) return null;
  const abre = fonte.indexOf('{', i);
  let nivel = 0;
  for (let j = abre; j < fonte.length; j += 1) {
    if (fonte[j] === '{') nivel += 1;
    else if (fonte[j] === '}') {
      nivel -= 1;
      if (nivel === 0) return fonte.slice(abre + 1, j);
    }
  }
  return null;
}

const PADDING_VERTICAL = /\bpadding(Top|Bottom|Vertical)?\s*:/;

test('nenhuma FaixaCurva recebe padding vertical no `style` — é ele que abre o rasgo de 64px', () => {
  const culpados = [];
  for (const arq of arquivosDeTela()) {
    const fonte = fs.readFileSync(arq, 'utf8');
    if (!fonte.includes('<FaixaCurva')) continue;
    for (const nome of estilosPassadosAFaixa(fonte)) {
      const corpo = corpoDoEstilo(fonte, nome);
      if (corpo === null) continue; // estilo de outro módulo: fora do alcance
      if (PADDING_VERTICAL.test(corpo)) {
        culpados.push(`${path.relative(raiz, arq)} -> estilos.${nome}`);
      }
    }
  }
  assert.deepEqual(
    culpados,
    [],
    'padding vertical no `style` da FaixaCurva vira espaço TRANSPARENTE entre o chão ' +
      'de uma faixa e o da seguinte (32+32 = 64px de fundo do app no meio da paisagem, ' +
      'fotografado em 12/09/2026 na tela de termos). O respiro já existe DENTRO da peça ' +
      '(styles.corpo tem space.secao em cima e embaixo). Use margin, que separa por fora, ' +
      'ou não passe nada:\n  ' + culpados.join('\n  ')
  );
});

test('a peça continua trazendo o respiro por dentro — senão tirar o padding das telas mutila o espaço', () => {
  // Este é o par do teste acima: ele só está certo enquanto a FaixaCurva de
  // fato puser o respiro no corpo dela. Se alguém tirar de lá, as telas ficam
  // sem respiro nenhum e o teste de cima continuaria passando, satisfeito.
  const fonte = fs.readFileSync(path.join(raiz, 'components', 'FaixaCurva.js'), 'utf8');
  const corpo = corpoDoEstilo(fonte, 'corpo');
  assert.ok(corpo, 'não achei styles.corpo em FaixaCurva.js');
  assert.match(corpo, /paddingTop:\s*space\./, 'o corpo da faixa perdeu o respiro de cima');
  assert.match(corpo, /paddingBottom:\s*space\./, 'o corpo da faixa perdeu o respiro de baixo');
});

test('e o `grude` continua sendo o -1px do antialias, não um remendo de rasgo', () => {
  // Se alguém "consertar" um rasgo futuro aumentando o grude, o número explica
  // por que isso é remendo: -1 mata meia linha de antialias; rasgo de verdade
  // tem dezenas de pixels e a causa é outra (o padding do teste acima).
  const fonte = fs.readFileSync(path.join(raiz, 'components', 'FaixaCurva.js'), 'utf8');
  const grude = corpoDoEstilo(fonte, 'grude');
  assert.ok(grude, 'não achei styles.grude em FaixaCurva.js');
  const m = grude.match(/marginTop:\s*(-?\d+)/);
  assert.ok(m, 'grude sem marginTop numérico');
  assert.equal(
    Number(m[1]),
    -1,
    'o grude deixou de ser -1: ele existe para a meia-linha de antialias entre dois ' +
      'preenchimentos. Rasgo de dezenas de pixels não se fecha aqui — a causa é padding ' +
      'vertical no `style` da faixa (ver o primeiro teste deste arquivo).'
  );
});
