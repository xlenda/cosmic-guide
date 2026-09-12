// AS PEÇAS DE DIAGRAMAÇÃO — o portão da lógica pura por trás delas.
// (12/09/2026)
//
// Este teste NÃO renderiza componente: não há react-test-renderer no projeto
// (conferido 12/09/2026) e o resto do repo testa lógica em lib/ + o TEXTO dos
// componentes. Segue o mesmo padrão. O que ele guarda são as duas leis que, se
// quebradas em silêncio, devolvem o app ao estado que o dono recusou:
//
//   1. a onda VARIA de faixa pra faixa (se repetir, vira papel de parede);
//   2. NUNCA FABRICAR — dado que não existe não vira traço, não vira zero, não
//      vira "não informado": a linha some.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const { ondaPath, ONDA_MIN, ONDA_MAX, ONDA_ALTURA } = require('../lib/ondaPath');
const { temValor, apenasReais } = require('../lib/filtroDado');

// =====================================================================
// A ONDA
// =====================================================================

test('a mesma semente devolve sempre a mesma onda — nada de formigar no scroll', () => {
  assert.equal(ondaPath('mapa'), ondaPath('mapa'));
  assert.equal(ondaPath(7), ondaPath(7));
});

test('sementes diferentes desenham ondas DIFERENTES — senão é papel de parede', () => {
  const nomes = ['mapa', 'sobre', 'planos', 'dados', 'oferta', 'rodape'];
  const curvas = nomes.map(ondaPath);
  assert.equal(new Set(curvas).size, curvas.length, `duas seções desenharam a mesma onda: ${curvas.join('\n')}`);
});

test('a onda é RASA e tem crista de verdade — nem chapada, nem montanha, nem rampa', () => {
  for (let i = 0; i < 40; i += 1) {
    const d = ondaPath(`faixa-${i}`);
    // Extrai os Y do path: M 0 y0 C .. .. .. yc .. yc C .. yc .. yd 100 yd
    const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
    const esquerda = nums[1];
    const direita = nums[13];
    // A crista é o menor Y (no SVG, menor = mais alto).
    const ys = [nums[1], nums[5], nums[7], nums[9], nums[11], nums[13]];
    const crista = Math.min(...ys);

    assert.ok(esquerda >= ONDA_MIN && esquerda <= ONDA_MAX, `ponta esquerda ${esquerda} fora da faixa rasa`);
    assert.ok(direita >= ONDA_MIN && direita <= ONDA_MAX, `ponta direita ${direita} fora da faixa rasa`);
    // Crista acima das duas pontas por uma margem visível: sem isso a "onda"
    // é uma rampa reta de um lado pro outro.
    assert.ok(
      crista <= Math.min(esquerda, direita) - 8,
      `onda ${i}: crista ${crista} não sobe o bastante acima das pontas (${esquerda}, ${direita}) — isso é rampa, não onda`
    );
    assert.ok(crista >= 0, `crista ${crista} saiu do viewBox`);
  }
});

test('o path fecha a figura — a faixa é um CHÃO preenchido, não um risco', () => {
  const d = ondaPath('x');
  assert.match(d, /^M /, 'o path tem que começar com M');
  assert.match(d, /L 100 100/, 'sem o canto de baixo o preenchimento vaza');
  assert.match(d, /L 0 100/);
  assert.match(d, /Z$/, 'path aberto não preenche');
});

test('a altura da onda é fixa em px — onda proporcional à tela vira montanha no tablet', () => {
  assert.ok(Number.isFinite(ONDA_ALTURA) && ONDA_ALTURA > 0 && ONDA_ALTURA < 120);
});

// =====================================================================
// NUNCA FABRICAR
// =====================================================================

test('vazio, branco, null e undefined NÃO são valor', () => {
  for (const v of [null, undefined, '', '   ', '\n', NaN]) {
    assert.equal(temValor(v), false, `${JSON.stringify(v)} não pode contar como dado`);
  }
});

test('zero e false SÃO valores reais — o bug clássico do if(!valor)', () => {
  assert.equal(temValor(0), true, '0 acertos é um dado, não ausência de dado');
  assert.equal(temValor(false), true);
});

test('linha sem dado e sem convite SOME — nunca traço mudo, nunca "não informado"', () => {
  const saida = apenasReais([
    { chave: 'nome', rotulo: 'Nome', valor: 'Guilherme' },
    { chave: 'hora', rotulo: 'Hora de nasc.', valor: null },
    { chave: 'local', rotulo: 'Local', valor: '   ' },
  ]);
  assert.deepEqual(saida.map((l) => l.chave), ['nome']);
  assert.equal(saida[0].pendente, false);
});

test('sem dado MAS com convite honesto, a linha aparece marcada como pendente', () => {
  const saida = apenasReais([
    { chave: 'hora', rotulo: 'Hora de nasc.', valor: null, convite: 'adicione sua hora de nascimento' },
  ]);
  assert.equal(saida.length, 1);
  assert.equal(saida[0].pendente, true);
  assert.equal(saida[0].valor, null, 'o convite não pode virar o valor — senão o convite É a fabricação');
});

test('apenasReais não engole zero', () => {
  const saida = apenasReais([{ chave: 'streak', rotulo: 'Dias', valor: 0 }]);
  assert.equal(saida.length, 1);
  assert.equal(saida[0].pendente, false);
});

test('entrada inválida não explode a tela', () => {
  assert.deepEqual(apenasReais(null), []);
  assert.deepEqual(apenasReais([null, undefined, 'nao e objeto']), []);
});

// =====================================================================
// AS LEIS ESCRITAS NAS PEÇAS
// =====================================================================

const leia = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');

test('as peças usam a escala da fundação, não número cru de espaço', () => {
  for (const arq of [
    'components/FaixaCurva.js',
    'components/ColunaLeitura.js',
    'components/TabelaDados.js',
    'components/FileiraDeTres.js',
    'components/ListaCheck.js',
    'components/HeroiDoTopo.js',
  ]) {
    const fonte = leia(arq);
    assert.match(fonte, /from '\.\.\/theme'/, `${arq} não lê a fundação`);
    // Nenhum padding/margin/gap com número cru: tudo tem que sair de space.*
    // (as exceções conscientes são -1 do antialias e o 2 do ✓, comentados).
    const crus = fonte.match(/(padding|margin|gap)[A-Za-z]*:\s*(\d+)(?!\d*%)/g) || [];
    const proibidos = crus.filter((m) => !/:\s*(0|1|2)$/.test(m));
    assert.deepEqual(proibidos, [], `${arq} tem espaço em número cru: ${proibidos.join(', ')}`);
  }
});

test('as duas peças de dado passam pelo filtro de não fabricar', () => {
  for (const arq of ['components/TabelaDados.js', 'components/FileiraDeTres.js']) {
    assert.match(leia(arq), /apenasReais/, `${arq} desenha dado sem passar pelo filtro`);
  }
});

test('o herói NÃO monta um segundo fundo — o cenário é o CosmicScene', () => {
  // Só o CÓDIGO: o cabeçalho cita o CosmicScene de propósito, pra explicar
  // justamente esta regra. Tirar os comentários é o que separa "fala sobre"
  // de "faz".
  const codigo = leia('components/HeroiDoTopo.js')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(codigo, /CosmicScene|estrela|ESTRELAS/i, 'dois fundos brigando é pior que um fundo simples');
  const fonte = codigo;
  // O único gradiente permitido aqui é a emenda até colors.background.
  const gradientes = fonte.match(/colors=\{\[[^\]]*\]\}/g) || [];
  assert.equal(gradientes.length, 1, 'o herói só pode ter o gradiente da emenda');
  assert.match(gradientes[0], /transparent.*colors\.background/);
});

test('a faixa curva é decoração que não rouba toque, mas deixa os filhos vivos', () => {
  const fonte = leia('components/FaixaCurva.js');
  assert.match(fonte, /pointerEvents="box-none"/);
  assert.doesNotMatch(fonte, /pointerEvents="none"[\s\S]{0,40}\{children\}/);
});
