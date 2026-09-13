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

// ---------------------------------------------------------------------------
// A SEGUNDA FONTE DO MESMO RASGO — a área TRANSPARENTE da própria onda.
// (12/09/2026, medida em foto depois do conserto do padding acima.)
//
// O teste de padding lá em cima fechou uma das fontes e as telas continuaram
// mostrando preto entre duas faixas. Medido na coluna central do print, com o
// padding já zerado: Tokens y 950-984 (34px de rgb(11,7,18) entre dois
// ameixas) e Termos y 486-513 (27px). Não era padding: é a caixa da onda.
//
// A GEOMETRIA. <Svg height=ONDA_ALTURA viewBox="0 0 100 100"> com o `d` de
// ondaPath: o Path começa em `esquerda`/`direita`, que ONDA_MIN/ONDA_MAX
// prendem entre 28 e 62. Tudo ACIMA disso, dentro da caixa, é transparente —
// e por trás dela aparece o fundo da tela, não a faixa de cima. Em pixels:
// 62% de 56px = ~34px. Exatamente o que a foto mediu.
//
// Ou seja: a transparência é de PROPÓSITO (é ela que recorta a curva), e o
// defeito é o que está por trás dela. O conserto é pintar a cor da faixa de
// cima ali atrás — `grude` passou a aceitar o NOME DO TOM da vizinha.
//
// PROVA POR MUTAÇÃO: troque `corDeCima` por `null` fixo em FaixaCurva.js, ou
// devolva o <Svg> pra fora da View que o embrulha, e o último teste quebra.
const { ondaPath, ONDA_ALTURA, ONDA_MIN, ONDA_MAX } = require('../lib/ondaPath');

/** O `y` inicial (0..100 do viewBox) das duas pontas da onda de uma semente. */
function pontasDaOnda(semente) {
  const d = ondaPath(semente);
  const esquerda = Number(d.match(/^M 0 ([\d.]+)/)[1]);
  const direita = Number(d.match(/100 ([\d.]+)\s+L 100 100/)[1]);
  return { esquerda, direita };
}

test('a onda deixa dezenas de pixels transparentes no topo — é o tamanho do rasgo fotografado', () => {
  // Sem isto o conserto abaixo seria remendo pra um problema de 1px.
  let pior = 0;
  for (const semente of ['tokens-saldo', 'tokens-historico', 'termos-corpo', 'sobre', 'dados', 'oferta']) {
    const { esquerda, direita } = pontasDaOnda(semente);
    assert.ok(esquerda >= ONDA_MIN && esquerda <= ONDA_MAX, `esquerda fora da faixa: ${esquerda}`);
    assert.ok(direita >= ONDA_MIN && direita <= ONDA_MAX, `direita fora da faixa: ${direita}`);
    // Na BORDA da tela o transparente vai do topo da caixa até a ponta da onda.
    pior = Math.max(pior, (Math.max(esquerda, direita) / 100) * ONDA_ALTURA);
  }
  assert.ok(
    pior >= 20,
    `a área transparente da onda deu ${pior.toFixed(1)}px — o rasgo fotografado tinha 27 e 34px. ` +
      'Se este número virou ~0 a onda ficou chapada e a faixa perdeu a curva.'
  );
});

test('FaixaCurva pinta a cor da faixa de cima atrás da onda quando `grude` nomeia um tom', () => {
  const fonte = fs.readFileSync(path.join(raiz, 'components', 'FaixaCurva.js'), 'utf8');
  // 1. `grude` string vira cor.
  assert.match(
    fonte,
    /typeof grude === 'string'/,
    '`grude` voltou a ser só booleano: sem o nome do tom da vizinha a peça não tem ' +
      'como saber com que cor tapar a fresta, e o preto volta entre as faixas.'
  );
  // 2. E essa cor é REALMENTE pintada atrás do <Svg> — não basta calcular.
  const i = fonte.indexOf('corDeCima ?');
  assert.ok(i !== -1, 'corDeCima não é usada em lugar nenhum — calculada e jogada fora');
  const depois = fonte.slice(i, i + 400);
  assert.match(
    depois,
    /backgroundColor:\s*corDeCima/,
    'corDeCima existe mas não vira backgroundColor'
  );
  assert.ok(
    depois.indexOf('<Svg') !== -1,
    'a cor da vizinha tem que ficar ATRÁS do <Svg> da onda: é a área transparente ' +
      'dele que deixava o fundo da tela aparecer.'
  );
});

test('grude booleano continua valendo — as faixas antigas não podem mudar de comportamento', () => {
  const fonte = fs.readFileSync(path.join(raiz, 'components', 'FaixaCurva.js'), 'utf8');
  // `grude && styles.grude` é truthy pra string também: o -1px do antialias
  // continua valendo nos dois casos, e quem passa `grude` puro não ganha cor.
  assert.match(fonte, /grude && styles\.grude/, 'o -1px do antialias deixou de valer pro grude');
  assert.match(
    fonte,
    /TONS\[grude\]/,
    'sem checar TONS[grude] um `grude` string qualquer viraria cor inválida'
  );
});

// ---------------------------------------------------------------------------
// A TERCEIRA FONTE, e a que sobrou viva: o CHAMADOR que esqueceu o nome do tom.
// (13/09/2026 — fotografado na tela de Assinatura, em 390x844.)
//
// Os testes acima guardam a PEÇA: ela sabe pintar a cor da vizinha atrás da
// onda quando `grude` nomeia um tom. Só que nada obrigava a TELA a passar esse
// nome — e `grude` seco continua sendo `true`, que é truthy, encosta as duas
// faixas e não pinta nada. O resultado é o defeito original de volta, com a
// peça inteiramente correta.
//
// MEDIDO NO AR, e não deduzido: em screens/PlanosScreen.js a segunda faixa
// (violeta, "o que entra") vinha com `grude` seco abaixo de uma faixa `ameixa`.
// Entre a nota de moeda (termina em y=638) e o primeiro benefício (y=764)
// havia 126px em que a onda (y 669-725) desenhava uma CUNHA PRETA de até 35px
// de rgb(11,7,18) atravessando a largura inteira — que o dono viu como
// "faixa roxa vazia no rodapé". screens/RituaisScreen.js tinha o mesmo engano
// na forma condicional (`grude={!categoria}`).
//
// POR QUE UM TESTE: as OUTRAS ~45 chamadas do app já passavam o nome do tom
// certo. Não era desconhecimento do padrão — eram duas que ficaram para trás
// quando o parâmetro ganhou a forma nova, e ninguém tinha como ver isso lendo
// o diff: `grude` sozinho é JSX perfeitamente válido e parece deliberado.
//
// PROVA POR MUTAÇÃO: troque `grude={TOM_OFERTA}` por `grude` em
// PlanosScreen.js (ou `grude={!categoria && 'ameixa'}` por `grude={!categoria}`
// em RituaisScreen.js) e este teste quebra nomeando o arquivo.

/** Como cada <FaixaCurva> do arquivo declara o `grude`. */
function grudesDeclarados(fonte) {
  const achados = [];
  const re = /<FaixaCurva\b[\s\S]*?>/g;
  let m;
  while ((m = re.exec(fonte)) !== null) {
    const tag = m[0];
    // `grude` só conta quando é a prop inteira: `grude=` com valor, ou `grude`
    // seco seguido de espaço/fim-de-tag. O \b evita casar `grudeX`.
    // O atributo JSX com aspas (grude="ameixa") é a forma mais comum e vem
    // PRIMEIRO: casar `={...}` antes devolveria o miolo sem as aspas e um
    // literal perfeitamente válido passaria a parecer identificador solto.
    const aspas = tag.match(/\bgrude="([^"]*)"/);
    const chaves = tag.match(/\bgrude=\{([\s\S]*?)\}/);
    if (aspas) achados.push({ tag, valor: `'${aspas[1]}'`, seco: false });
    else if (chaves) achados.push({ tag, valor: chaves[1].trim(), seco: false });
    else if (/\bgrude\b(?!\s*=)/.test(tag)) achados.push({ tag, valor: 'true', seco: true });
  }
  return achados;
}

// AS TELAS DA MADRE FICAM DE FORA DESTE PORTÃO, e é dívida declarada, não
// esquecimento (medido em 13/09/2026): madremaria tem 7 chamadas com `grude`
// seco — AjustesScreen, AyudaScreen, MetodoScreen, PerfilScreen,
// PrivacidadScreen e duas em TerminosScreen. Seis delas estão dentro de um
// componente `Seccion({ tom })` reusado, cujas seções ALTERNAM noite/ameixa:
// consertar exige passar o tom da seção ANTERIOR em cada chamador, um por um,
// e isso é obra na Madre — outro app dentro do mesmo repo — não acabamento do
// Cosmic. (AyudaScreen:567 já mostra a forma certa, `grude="noite"`: alguém
// consertou uma e não voltou pras outras.)
// ponytail: portão só no Cosmic; ampliar pra madremaria quando as Seccion
// passarem a receber o tom da faixa de cima.
const SO_COSMIC = (arq) => !arq.includes(`${path.sep}madremaria${path.sep}`);

test('nenhuma tela passa `grude` seco: sem o NOME do tom de cima a onda recorta contra o preto', () => {
  const culpados = [];
  for (const arq of arquivosDeTela().filter(SO_COSMIC)) {
    const fonte = fs.readFileSync(arq, 'utf8');
    if (!fonte.includes('<FaixaCurva')) continue;
    for (const { valor, seco } of grudesDeclarados(fonte)) {
      // O que vale: uma string ('ameixa'), ou uma expressão que PRODUZ string
      // no caminho em que gruda (`!categoria && 'ameixa'`), ou uma constante
      // de tom do próprio arquivo (TOM_OFERTA = 'ameixa').
      const nomeiaTom = /'[a-zç]+'|"[a-zç]+"|\b[A-Z][A-Z_0-9]*\b/.test(valor);
      if (seco || !nomeiaTom) {
        culpados.push(`${path.relative(raiz, arq)} -> grude={${valor}}`);
      }
    }
  }
  assert.deepEqual(
    culpados,
    [],
    '`grude` sem o nome do tom da faixa de CIMA só encosta as duas caixas: a área ' +
      'transparente acima da crista continua mostrando o fundo #0B0712 da tela, e sai a ' +
      'cunha preta fotografada em 13/09/2026 na tela de Assinatura (35px atravessando a ' +
      'largura inteira). Passe o tom da faixa anterior — grude="ameixa", grude={TOM_OFERTA} ' +
      'ou grude={condicao && \'ameixa\'}:\n  ' + culpados.join('\n  ')
  );
});

test('e o tom nomeado no `grude` existe de verdade em FAIXA_TONS', () => {
  // O par do teste acima: `grude="ameixaa"` passaria lá (nomeia algo) e cairia
  // no fallback null da peça, trazendo o preto de volta em silêncio.
  // Os tons saem do TEXTO de FaixaCurva.js, não de um require: a peça importa
  // react-native-svg, que não carrega sob o `node --test` deste projeto — e os
  // testes acima já leem este mesmo arquivo como fonte.
  const fonteFaixa = fs.readFileSync(path.join(raiz, 'components', 'FaixaCurva.js'), 'utf8');
  const blocoTons = fonteFaixa.slice(fonteFaixa.indexOf('const TONS'), fonteFaixa.indexOf('export const FAIXA_TONS'));
  const FAIXA_TONS = [...blocoTons.matchAll(/^\s{2}(\w+):\s*'rgba?\(/gm)].map((m) => m[1]);
  assert.ok(FAIXA_TONS.length >= 4, `não li os tons de FaixaCurva.js (achei ${FAIXA_TONS.length})`);
  const culpados = [];
  for (const arq of arquivosDeTela()) {
    const fonte = fs.readFileSync(arq, 'utf8');
    if (!fonte.includes('<FaixaCurva')) continue;
    for (const { valor } of grudesDeclarados(fonte)) {
      // Só dá pra conferir literal; constante/condicional fica pro teste acima.
      const lit = valor.match(/^'([a-zç]+)'$|^"([a-zç]+)"$/);
      const nome = lit && (lit[1] || lit[2]);
      if (nome && !FAIXA_TONS.includes(nome)) {
        culpados.push(`${path.relative(raiz, arq)} -> grude="${nome}"`);
      }
    }
  }
  assert.deepEqual(
    culpados,
    [],
    'tom inexistente no `grude`: TONS[grude] devolve undefined, corDeCima vira null e o ' +
      'preto volta sem ninguém perceber. Tons válidos: ' + FAIXA_TONS.join(', ') + '\n  ' +
      culpados.join('\n  ')
  );
});
