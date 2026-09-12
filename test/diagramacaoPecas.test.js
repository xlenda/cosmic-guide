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

// O HERÓI DO TOPO NO TARÔ (12/09/2026). O Tarô era a última tela principal que
// abria sem arte nenhuma no terço de cima — header e, colado nele, a fileira de
// chips. A cena CENAS.taro já existia no pack desde 08/08/2026 e não tinha UM
// call site: o usuário baixava a imagem e nunca a via.
//
// As duas coisas que este teste impede de voltar em silêncio:
//   1. o herói sumir da tela (a cena volta a ser peso morto no bundle);
//   2. 'tarot.subtitle' aparecer DUAS vezes — a pergunta desceu do header pro
//      herói, e deixar as duas é dizer a mesma frase duas vezes na mesma dobra.
test('o Tarô abre com a arte que já existia, e a pergunta aparece UMA vez só', () => {
  const fonte = leia('screens/TarotScreen.js');

  assert.match(fonte, /<HeroiDoTopo/, 'o Tarô voltou a abrir sem arte no terço de cima');
  assert.match(fonte, /fonte=\{CENAS\.taro\}/, 'o herói do Tarô precisa da cena do Tarô, não de outra arte');

  // Sem contar comentários: o cabeçalho explica a mudança citando a chave.
  const codigo = fonte
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  const usos = codigo.match(/t\('tarot\.subtitle'\)/g) || [];
  assert.equal(
    usos.length,
    1,
    `'tarot.subtitle' aparece ${usos.length}x — ela vive no herói agora; no header seria a mesma frase duas vezes`
  );
});

test('a faixa curva é decoração que não rouba toque, mas deixa os filhos vivos', () => {
  const fonte = leia('components/FaixaCurva.js');
  assert.match(fonte, /pointerEvents="box-none"/);
  assert.doesNotMatch(fonte, /pointerEvents="none"[\s\S]{0,40}\{children\}/);
});


// =====================================================================
// A PALETA DAS FAIXAS E DOS CABEÇALHOS — o conserto de 12/09/2026.
//
// POR QUE MEDIR EM TESTE. Os quatro defeitos que o revisor fotografou eram
// todos de COR, e cor é exatamente o que volta sozinho: alguém acha um hex
// "mais bonito", troca, e nenhum teste reclama até o app já estar no ar com
// duas caras. Os limiares abaixo não são gosto — saem das medidas feitas nas
// próprias fotos e estão anotados junto de cada tom em FaixaCurva.js.
// =====================================================================

// Achata rgba sobre o fundo do app e devolve o rgb resultante.
function sobreOFundo(r, g, b, a) {
  const FUNDO = [11, 7, 18]; // colors.background #0B0712
  return [r, g, b].map((c, i) => Math.round(c * a + FUNDO[i] * (1 - a)));
}

function paraLab([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  const X = (lin[0] * 0.4124 + lin[1] * 0.3576 + lin[2] * 0.1805) / 0.95047;
  const Y = lin[0] * 0.2126 + lin[1] * 0.7152 + lin[2] * 0.0722;
  const Z = (lin[0] * 0.0193 + lin[1] * 0.1192 + lin[2] * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

function deltaE(c1, c2) {
  const a = paraLab(c1);
  const b = paraLab(c2);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

// Matiz em graus na roda Lab — é ele que denuncia o sépia.
function matiz(c) {
  const lab = paraLab(c);
  const h = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;
  return h < 0 ? h + 360 : h;
}

function croma(c) {
  const lab = paraLab(c);
  return Math.hypot(lab[1], lab[2]);
}

function doHex(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

// Lê os TONS declarados em FaixaCurva.js direto do arquivo: o teste tem que
// morder o valor de verdade, não uma cópia que alguém esqueceu de atualizar.
function tonsDaFaixa() {
  const fonte = leia('components/FaixaCurva.js');
  const bloco = fonte.slice(fonte.indexOf('const TONS = {'), fonte.indexOf('export const FAIXA_TONS'));
  const tons = {};
  const re = /^[ \t]*(\w+):[ \t]*'rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)'/gm;
  let m;
  while ((m = re.exec(bloco)) !== null) {
    tons[m[1]] = sobreOFundo(+m[2], +m[3], +m[4], +m[5]);
  }
  return tons;
}

test('a faixa noite MUDA O CHÃO — o degrau tem que ser visível, não imperceptível', () => {
  const FUNDO = [11, 7, 18];
  const tons = tonsDaFaixa();
  assert.ok(tons.noite && tons.ameixa, 'não consegui ler os tons de FaixaCurva.js');
  // O valor antigo (rgba(33,25,37,0.82)) dava ΔE 7,6 contra o fundo: o olho
  // lia "a faixa acabou", não "mudou de assunto". A ameixa, que sempre leu
  // bem, marca 19,6 — o piso de 13 fica entre os dois e MORDE o valor antigo.
  const contraFundo = deltaE(tons.noite, FUNDO);
  assert.ok(
    contraFundo >= 13,
    `a faixa noite não muda o chão: ΔE ${contraFundo.toFixed(1)} contra o fundo (o valor recusado em 12/09/2026 dava 7,6; a ameixa dá 19,6)`
  );
  // E não pode resolver isso virando a ameixa: as duas são vizinhas na Home
  // (faixa 1 ameixa, faixa 2 noite) e a virada de assunto é justamente ali.
  const contraAmeixa = deltaE(tons.noite, tons.ameixa);
  assert.ok(
    contraAmeixa >= 12,
    `noite e ameixa viraram o mesmo chão: ΔE ${contraAmeixa.toFixed(1)} — clarear a noite na direção da ameixa não é conserto, é trocar um defeito por outro`
  );
});

test('a faixa noite não lava a tela — fica abaixo do violeta, que já foi medido lavando', () => {
  const FUNDO = [11, 7, 18];
  const tons = tonsDaFaixa();
  assert.ok(
    deltaE(tons.noite, FUNDO) < deltaE(tons.violeta, FUNDO),
    'a noite passou do violeta em distância do fundo — o lote da Home mediu o violeta lavando a tela em faixa longa, e a noite é justamente o tom das faixas longas'
  );
});

test('NENHUM tom de faixa cai no sépia — a paleta é ameixa, não bege', () => {
  // O app inteiro vive entre ~300° e ~360° na roda (ameixa 320°, violeta 310°,
  // rosa 339°). O dourado recusado em 12/09/2026 estava em 61° — amarelo-
  // marrom — e lia como fundo de OUTRO app no meio do roxo.
  const tons = tonsDaFaixa();
  assert.ok(Object.keys(tons).length >= 5, 'faltou tom na leitura');
  for (const nome of Object.keys(tons)) {
    const h = matiz(tons[nome]);
    const dentro = h >= 295 || h <= 5; // a roda dá a volta no vermelho
    assert.ok(
      dentro,
      `o tom ${nome} está em ${h.toFixed(0)}° — fora da família da casa (295°–360°/0°–5°). 61° foi o valor recusado: lê como sépia.`
    );
  }
});

// Os cabeçalhos com gradiente LITERAL na tela — os quatro que o revisor
// fotografou brigando. Quem usa `gradients.*` do theme.js não entra aqui: o
// theme é fonte única e tem os próprios guardas.
const CABECALHOS_LITERAIS = ['screens/BirthChartScreen.js', 'screens/DreamScreen.js'];

function gradienteDoCabecalho(arq) {
  // [\s\S]*? e nao [^>]*: a tag tem onBack={() => ...}, e o '>' da arrow
  // cortava a busca antes de chegar no gradient (pegou na primeira rodada).
  const m = leia(arq).match(/<GradientHeader[\s\S]*?gradient=\{(\[[^\]]*\])\}/);
  assert.ok(m, `${arq}: não achei o gradiente do cabeçalho`);
  const hexes = m[1].match(/#[0-9A-Fa-f]{6}/g) || [];
  assert.ok(hexes.length >= 2, `${arq}: cabeçalho sem gradiente literal`);
  return hexes;
}

test('o cabeçalho não pode ser mais saturado que a paleta — foi assim que o Mapa virou outro app', () => {
  // gradients.hero, o cabeçalho padrão (e o do Horóscopo, que o revisor
  // aprovou), tem croma 19-22. O azul-royal do Mapa tinha 66-75: mesmo matiz,
  // mas saturação de outro produto. O teto de 50 deixa respirar e morde o 66.
  for (const arq of CABECALHOS_LITERAIS) {
    for (const hex of gradienteDoCabecalho(arq)) {
      const c = croma(doHex(hex));
      assert.ok(
        c <= 50,
        `${arq}: ${hex} tem croma ${c.toFixed(0)} — acima do teto 50 da paleta (o azul-royal recusado tinha 66-75)`
      );
    }
  }
});

test('o cabeçalho não pode ser mais CLARO que a paleta — foi assim que o Sonhos virou outro app', () => {
  // O croma sozinho NÃO pega o teal: #5C9E96/#526F8E tem croma 23/20, dentro
  // do teto — provado por mutação, o teste de croma passou com o valor
  // recusado. O que gritava no Sonhos era a LUZ e o MATIZ: L61/L46 contra
  // L4-L18 do gradients.hero, e um giro de h186 -> h264 que sai da roda da
  // casa pelos dois lados.
  //
  // O ACENTO DA FEATURE PODE FICAR — e fica: o verde do Sonhos é identidade,
  // e a regra proíbe uniformizar identidade. Por isso a lei aqui é por
  // GRADIENTE, não por parada: UMA parada pode carregar o acento fora da
  // roda; as demais têm que estar na família, e NENHUMA pode estourar a luz.
  for (const arq of CABECALHOS_LITERAIS) {
    const hexes = gradienteDoCabecalho(arq);
    for (const hex of hexes) {
      const L = paraLab(doHex(hex))[0];
      assert.ok(
        L <= 45,
        `${arq}: ${hex} tem L ${L.toFixed(0)} — o cabeçalho recusado do Sonhos tinha L61, contra L4-L18 do gradients.hero. Cabeçalho claro vira laje de cor.`
      );
    }
    const foraDaRoda = hexes.filter((hex) => {
      const h = matiz(doHex(hex));
      return !(h >= 295 || h <= 5);
    });
    assert.ok(
      foraDaRoda.length <= 1,
      `${arq}: ${foraDaRoda.join(' e ')} estão fora da família (295°–360°/0°–5°). Uma parada pode ser o acento da feature; o gradiente INTEIRO fora é o que fazia a tela parecer de outro app.`
    );
  }
});

test('o canto quente do Tarô saiu do amarelo e entrou na família', () => {
  const m = leia('screens/TarotScreen.js').match(/const TAROT_HEADER_GRADIENT = \[([^\]]*)\]/);
  assert.ok(m, 'não achei TAROT_HEADER_GRADIENT');
  for (const hex of m[1].match(/#[0-9A-Fa-f]{6}/g) || []) {
    const h = matiz(doHex(hex));
    assert.ok(
      h >= 295 || h <= 5,
      `${hex} está em ${h.toFixed(0)}° — o #5A4430 recusado em 12/09/2026 estava em 68°, amarelo-marrom no meio do roxo`
    );
  }
});

test('a faixa pode ficar RASA — estado vazio não leva a mesma entrada de uma seção cheia', () => {
  const fonte = leia('components/FaixaCurva.js');
  assert.match(fonte, /\brasa\b/, 'a peça perdeu o recurso de onda baixa');
  // A altura tem que DEPENDER do prop: uma constante fixa aqui é o defeito
  // que o revisor fotografou (54px de chão liso antes da primeira palavra).
  assert.match(
    fonte,
    /height=\{rasa \?[^}]*ONDA_ALTURA[^}]*\}/,
    'a caixa da onda voltou a ser fixa — a seção fina volta a ser bloco de cor'
  );
});

test('a Home usa a onda rasa JUSTAMENTE quando não tem identidade pra mostrar', () => {
  const fonte = leia('screens/HomeScreen.js');
  const faixa = fonte.slice(fonte.indexOf('tom="ameixa"'), fonte.indexOf('testID="home-faixa-voce-hoje"'));
  assert.match(faixa, /rasa=\{!identidade\}/, 'a faixa 1 parou de acompanhar o conteúdo que tem');
  assert.match(
    faixa,
    /paddingBottom: identidade \? space\.secao : space\.entre/,
    'o degrau de baixo voltou a ser o mesmo com e sem ficha'
  );
});
