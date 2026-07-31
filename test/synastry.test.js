// test/synastry.test.js
// A COMPATIBILIDADE, MEDIDA — não descrita.
//
// Este arquivo existe porque o defeito anterior era invisível lendo o código e
// óbvio rodando os 144 pares. `lib/signs.js` tinha uma tabela `PCT` chaveada
// por PAR DE ELEMENTOS, e ninguém nunca cruzou ela com a distância zodiacal.
// Quando se cruza:
//
//   • menor nota 74, maior 92, média 83,5, ZERO pares abaixo de 70 — todo mundo
//     combinava com todo mundo, que foi o que o dono percebeu sozinho;
//   • os 12 pares em OPOSIÇÃO recebiam 91–92, a faixa MAIS ALTA da tabela.
//     Áries+Libra = 92 era a nota máxima do app inteiro, e oposição é o aspecto
//     mais duro que a tradição tem;
//   • os 48 pares em AVERSÃO recebiam 74–80, a MESMA faixa da quadratura —
//     apagando a única distinção que Ptolomeu faz questão de fazer (I.16);
//   • trígono e mesmo signo colapsavam juntos em 87–90.
//
// Sete relações da tradição viravam três faixas, com a ordem invertida no topo.
// Os testes abaixo são o portão que impede isso de voltar. Nenhum deles confere
// "o texto está bonito": todos medem a DISTRIBUIÇÃO dos 144 pares, a ORDEM entre
// os aspectos, e a presença da fonte — as três coisas que quebraram.
//
// Falha aqui = não pode publicar. É de propósito.

const test = require('node:test');
const assert = require('node:assert/strict');

const { SIGNS, compatibility } = require('../lib/signs.js');
const S = require('../lib/synastry.js');

// ---------------------------------------------------------------------------
// Os 144 pares, calculados uma vez e reusados por todo o arquivo.
// ---------------------------------------------------------------------------
const PARES = [];
for (let i = 0; i < 12; i++) {
  for (let j = 0; j < 12; j++) {
    PARES.push({
      i,
      j,
      a: SIGNS[i].name,
      b: SIGNS[j].name,
      leitura: compatibility(SIGNS[i].name, SIGNS[j].name),
    });
  }
}

const RELACOES = ['copresenca', 'aversao30', 'sextil', 'quadratura', 'trigono', 'aversao150', 'oposicao'];

function porId(id) {
  return PARES.filter((p) => p.leitura.id === id);
}

function corpo(leitura) {
  return [leitura.resumo, leitura.texto, leitura.forte, leitura.cuidado].join(' \n ');
}

// ===========================================================================
// 1. A DISTRIBUIÇÃO — os 144 pares pelas 7 relações
// ===========================================================================

test('a distância em signos é a do caminho mais curto, simétrica, de 0 a 6', () => {
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      const d = S.distanciaEmSignos(i, j);
      assert.equal(d, S.distanciaEmSignos(j, i), `${i}↔${j} não é simétrica`);
      assert.ok(d >= 0 && d <= 6, `${i}→${j} deu ${d}`);
      // A conta que o app promete, escrita de outro jeito de propósito: se as
      // duas fórmulas divergirem, uma das duas está errada.
      let esperado = Math.abs(i - j);
      if (esperado > 6) esperado = 12 - esperado;
      assert.equal(d, esperado, `${i}→${j}`);
    }
  }
});

test('os 144 pares se distribuem pelas 7 relações, e nas contagens que a geometria exige', () => {
  const contagem = {};
  for (const p of PARES) contagem[p.leitura.id] = (contagem[p.leitura.id] || 0) + 1;

  // 12 signos: cada um tem 1 par a distância 0 e 1 a distância 6 (12 cada), e
  // 2 pares em cada distância de 1 a 5 (24 cada). Soma 144, sem sobra.
  assert.deepEqual(contagem, {
    copresenca: 12,
    aversao30: 24,
    sextil: 24,
    quadratura: 24,
    trigono: 24,
    aversao150: 24,
    oposicao: 12,
  });
  assert.equal(Object.values(contagem).reduce((a, b) => a + b, 0), 144);
});

test('nenhum par cai num default: as 7 relações estão todas ocupadas e nenhuma oitava aparece', () => {
  const ids = new Set(PARES.map((p) => p.leitura.id));
  assert.deepEqual([...ids].sort(), [...RELACOES].sort());
});

test('as 7 relações são DISTINGUÍVEIS no resultado — nenhuma compartilha texto com outra', () => {
  // O defeito antigo era exatamente este: Áries+Libra (oposição) e Áries+Gêmeos
  // (sextil) recebiam a MESMA frase, porque as duas eram "ar+fogo".
  const amostra = new Map();
  for (const id of RELACOES) {
    const p = porId(id)[0];
    amostra.set(id, { aspecto: p.leitura.aspecto, distancia: p.leitura.distancia, graus: p.leitura.graus });
  }
  // aversao30 e aversao150 partilham o NOME do aspecto (na fonte é o mesmo), e
  // é por isso que a distinção tem que aparecer na distância e no texto.
  for (const [idA, va] of amostra) {
    for (const [idB, vb] of amostra) {
      if (idA >= idB) continue;
      assert.notEqual(va.distancia, vb.distancia, `${idA} e ${idB} com a mesma distância`);
      assert.notEqual(va.graus, vb.graus, `${idA} e ${idB} com os mesmos graus`);
    }
  }

  // E o corpo do texto: nenhuma leitura de uma relação pode aparecer em outra.
  const textosPorId = new Map(RELACOES.map((id) => [id, new Set(porId(id).map((p) => p.leitura.texto))]));
  for (const idA of RELACOES) {
    for (const idB of RELACOES) {
      if (idA >= idB) continue;
      for (const t of textosPorId.get(idA)) {
        assert.ok(!textosPorId.get(idB).has(t), `texto idêntico entre ${idA} e ${idB}`);
      }
    }
  }
});

test('o par exato que o dono pegou: Áries+Libra e Áries+Gêmeos deixaram de ser a mesma coisa', () => {
  const oposicao = compatibility('Áries', 'Libra');
  const sextil = compatibility('Áries', 'Gêmeos');
  assert.equal(oposicao.id, 'oposicao');
  assert.equal(sextil.id, 'sextil');
  assert.notEqual(oposicao.texto, sextil.texto);
  assert.notEqual(oposicao.categoria, sextil.categoria);
  // E os dois eram 92 — a nota MÁXIMA do app — porque os dois são "ar+fogo".
  assert.equal(oposicao.elementoA, sextil.elementoA);
});

test('cada signo tem, entre os outros 11, o mapa completo de relações da tradição', () => {
  for (let i = 0; i < 12; i++) {
    const meus = PARES.filter((p) => p.i === i && p.j !== i).map((p) => p.leitura.id);
    const contagem = {};
    for (const id of meus) contagem[id] = (contagem[id] || 0) + 1;
    assert.deepEqual(
      contagem,
      { aversao30: 2, sextil: 2, quadratura: 2, trigono: 2, aversao150: 2, oposicao: 1 },
      `${SIGNS[i].name} não vê as seis relações`
    );
  }
});

test('a leitura é simétrica: A com B lê o mesmo aspecto que B com A', () => {
  for (const p of PARES) {
    const inversa = compatibility(p.b, p.a);
    assert.equal(inversa.id, p.leitura.id, `${p.a}+${p.b}`);
    assert.equal(inversa.grau, p.leitura.grau);
    assert.equal(inversa.categoria, p.leitura.categoria);
  }
});

// ===========================================================================
// 2. A ORDEM — a oposição NÃO pode ficar na faixa mais alta
// ===========================================================================

test('A OPOSIÇÃO NÃO ESTÁ NO TOPO — o defeito central da tabela antiga', () => {
  const oposicao = porId('oposicao')[0].leitura;
  const trigono = porId('trigono')[0].leitura;
  const sextil = porId('sextil')[0].leitura;
  const copresenca = porId('copresenca')[0].leitura;

  // Grau maior = mais para o fundo da escala de IV.7.
  assert.ok(oposicao.grau > trigono.grau, 'oposição não pode estar acima do trígono');
  assert.ok(oposicao.grau > sextil.grau, 'oposição não pode estar acima do sextil');
  assert.ok(oposicao.grau > copresenca.grau, 'oposição não pode estar acima do mesmo signo');

  // E a oposição tem que estar no PIOR grau existente, junto da aversão — é
  // onde Tetrabiblos IV.7 a põe, literalmente ("disjunct signs or opposite
  // signs... the deepest enmities").
  const piorGrau = Math.max(...PARES.map((p) => p.leitura.grau));
  assert.equal(oposicao.grau, piorGrau);
  assert.equal(oposicao.categoria, S.CATEGORIAS.desarmonico);

  // Nenhum par em oposição pode compartilhar grau com um par harmônico.
  const grausHarmonicos = new Set(
    PARES.filter((p) => p.leitura.categoriaId === 'harmonico').map((p) => p.leitura.grau)
  );
  for (const p of porId('oposicao')) {
    assert.ok(!grausHarmonicos.has(p.leitura.grau), `${p.a}+${p.b} empata com um harmônico`);
  }
});

test('a escala inteira respeita Tetrabiblos IV.7, degrau por degrau', () => {
  // mesmo signo (1) < trígono/sextil (2) < quadratura (3) < aversão/oposição (4)
  const grau = (id) => porId(id)[0].leitura.grau;
  assert.equal(grau('copresenca'), 1);
  assert.equal(grau('trigono'), 2);
  assert.equal(grau('sextil'), 2);
  assert.equal(grau('quadratura'), 3);
  assert.equal(grau('aversao30'), 4);
  assert.equal(grau('aversao150'), 4);
  assert.equal(grau('oposicao'), 4);

  // O trígono NÃO é o melhor vínculo possível: o mesmo signo está acima dele.
  // É o item 8 da lista do que a internet repete e a fonte não sustenta.
  assert.ok(grau('copresenca') < grau('trigono'));
});

test('a QUADRATURA é a antipatia menor — está acima da aversão e da oposição, não junto', () => {
  const quadratura = porId('quadratura')[0].leitura;
  const aversao = porId('aversao30')[0].leitura;
  const oposicao = porId('oposicao')[0].leitura;
  assert.ok(quadratura.grau < aversao.grau, 'quadratura não pode empatar com a aversão');
  assert.ok(quadratura.grau < oposicao.grau, 'quadratura não pode empatar com a oposição');
});

// ===========================================================================
// 3. AVERSÃO — distinguível da quadratura, e é ela que abre a faixa de baixo
// ===========================================================================

test('AVERSÃO É DISTINGUÍVEL DE QUADRATURA em tudo que a tela mostra', () => {
  for (const idAversao of ['aversao30', 'aversao150']) {
    const av = porId(idAversao)[0].leitura;
    const qd = porId('quadratura')[0].leitura;
    assert.notEqual(av.id, qd.id);
    assert.notEqual(av.aspecto, qd.aspecto);
    assert.notEqual(av.categoria, qd.categoria);
    assert.notEqual(av.grau, qd.grau);
    assert.notEqual(av.texto, qd.texto);
    // A diferença de fundo: quadratura É aspecto, aversão NÃO É.
    assert.equal(qd.categoriaId, 'desarmonico');
    assert.equal(av.categoriaId, 'semAspecto');
  }
});

test('as duas aversões (30° e 150°) são leituras diferentes uma da outra', () => {
  const a30 = porId('aversao30')[0].leitura;
  const a150 = porId('aversao150')[0].leitura;
  assert.equal(a30.familia, 'aversao');
  assert.equal(a150.familia, 'aversao');
  assert.notEqual(a30.id, a150.id);
  assert.equal(a30.graus, 30);
  assert.equal(a150.graus, 150);
  assert.notEqual(a30.texto, a150.texto);
});

test('os 48 pares em aversão são os únicos "sem aspecto", e são 1/3 dos 144', () => {
  const semAspecto = PARES.filter((p) => p.leitura.categoriaId === 'semAspecto');
  assert.equal(semAspecto.length, 48);
  for (const p of semAspecto) {
    assert.ok(p.leitura.distancia === 1 || p.leitura.distancia === 5, `${p.a}+${p.b}`);
  }
  // Contrapartida: NENHUM par em aspecto pode ser marcado "sem aspecto".
  for (const p of PARES) {
    const emAspecto = [2, 3, 4, 6].includes(p.leitura.distancia);
    if (emAspecto) assert.notEqual(p.leitura.categoriaId, 'semAspecto', `${p.a}+${p.b}`);
  }
});

test('a aversão diz que este é o "não combina" da tradição, e que não é a quadratura', () => {
  for (const p of PARES.filter((x) => x.leitura.familia === 'aversao')) {
    const t = corpo(p.leitura);
    assert.match(t, /não combina/, `${p.a}+${p.b}`);
    assert.match(t, /disjuntos e alheios|desviados/, `${p.a}+${p.b}`);
  }
});

// ===========================================================================
// 4. A DISTRIBUIÇÃO NÃO TEM MAIS PISO — a queixa do dono, medida
// ===========================================================================

test('NINGUÉM MAIS COMBINA COM TODO MUNDO: as quatro categorias são todas alcançáveis', () => {
  const contagem = {};
  for (const p of PARES) contagem[p.leitura.categoriaId] = (contagem[p.leitura.categoriaId] || 0) + 1;

  assert.deepEqual(contagem, {
    harmonico: 48, // trígono 24 + sextil 24
    desarmonico: 36, // quadratura 24 + oposição 12
    semAspecto: 48, // aversão 24 + 24
    copresenca: 12,
  });

  // O que o app antigo não conseguia dizer de jeito nenhum: que existe par sem
  // afinidade. 48 de 144 — um terço — agora recebem "sem aspecto". Antes eram
  // ZERO, porque a nota mais baixa possível era 74.
  assert.ok(contagem.semAspecto > 0, 'sem isto, a queixa do dono não foi resolvida');
  const naoHarmonicos = contagem.desarmonico + contagem.semAspecto;
  assert.ok(naoHarmonicos > contagem.harmonico, 'a maioria dos pares não pode ser harmônica');
});

test('a MANCHETE da tela de Compatibilidade cobre as quatro categorias — sem ramo morto', () => {
  // A versão antiga ramificava em >= 80 / >= 60 / resto, e como o piso da tabela
  // era 74 o TERCEIRO RAMO NUNCA EXECUTAVA. Este teste garante que toda
  // categoria produzida pelo motor tem manchete na tela, e que a tela não tem
  // manchete sem categoria que a alcance.
  const fs = require('node:fs');
  const path = require('node:path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'screens', 'CompatibilityScreen.js'), 'utf8');
  const bloco = src.slice(src.indexOf('const MANCHETE'), src.indexOf('export default'));
  const declaradas = [...bloco.matchAll(/^\s{2}(\w+):\s*'/gm)].map((m) => m[1]);
  const produzidas = [...new Set(PARES.map((p) => p.leitura.categoriaId))];
  assert.deepEqual(declaradas.sort(), produzidas.sort());
});

// ===========================================================================
// 5. NENHUM PAR VIRA "VOCÊS NÃO DÃO CERTO" — a regra 2 de lib/synastry.js
// ===========================================================================

// Fatalismo é fácil de escrever sem perceber. A lista abaixo é de FORMAS, não de
// palavras soltas: "acaba" sozinho aparece em frase inocente, "essa relação
// acaba" não. Cada entrada tem o motivo de estar aqui.
const FATALISMO = [
  [/não d(ão|á|ao) certo/i, 'o veredito que o app não pode dar'],
  [/não vai (dar|funcionar|durar)/i, 'futuro decretado'],
  [/vão? se separar|vai acabar|acaba mal|está condenad/i, 'desfecho decretado'],
  [/não tem (futuro|jeito|salvação|conserto)/i, 'porta fechada'],
  [/procure outr|melhor (desistir|terminar)|termine (a|essa|o)/i, 'imperativo sobre a vida da pessoa'],
  [/vocês não combinam|incompatíveis/i, 'o rótulo que a fonte não autoriza'],
  [/impossível (dar certo|amar|ficar)/i, 'impossibilidade afirmada'],
];

test('NENHUMA das 144 leituras decreta o desfecho do casal', () => {
  for (const p of PARES) {
    const t = corpo(p.leitura);
    for (const [re, motivo] of FATALISMO) {
      assert.ok(!re.test(t), `${p.a}+${p.b} (${p.leitura.id}) — ${motivo}: ${t.match(re)}`);
    }
  }
});

test('a tela de Compatibilidade também não decreta — as manchetes passam pelo mesmo filtro', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'screens', 'CompatibilityScreen.js'), 'utf8');
  const bloco = src.slice(src.indexOf('const MANCHETE'), src.indexOf('};', src.indexOf('const MANCHETE')));
  for (const [re, motivo] of FATALISMO) {
    assert.ok(!re.test(bloco), `manchete da tela — ${motivo}`);
  }
});

test('TODA leitura de aspecto duro carrega a nuance de IV.5 que impede a sentença', () => {
  // "the beneficent planets... do not completely terminate the marriages, but
  // bring about renewals and recollections, which preserve kindness and
  // affection." Sem isto, quadratura e oposição viram condenação.
  const duros = PARES.filter((p) => p.leitura.categoriaId === 'desarmonico');
  assert.equal(duros.length, 36);
  for (const p of duros) {
    const temModificador = p.leitura.verbatins.some((v) => v.texto === S.VERBATIM.modificador.texto);
    assert.ok(temModificador, `${p.a}+${p.b} sem o modificador de IV.5`);
    assert.match(corpo(p.leitura), /recomeços e lembranças/, `${p.a}+${p.b}`);
  }
});

test('a leitura mais dura de todas — aversão — descreve o começo, e não o fim', () => {
  for (const p of PARES.filter((x) => x.leitura.familia === 'aversao')) {
    assert.match(corpo(p.leitura), /descreve o começo, não o fim/, `${p.a}+${p.b}`);
  }
});

// ===========================================================================
// 6. A CITAÇÃO DA FONTE, PRESENTE EM CADA TIPO DE LEITURA
// ===========================================================================

test('cada uma das 7 relações traz verbatim COM locus, e nenhum locus é vago', () => {
  for (const id of RELACOES) {
    const l = porId(id)[0].leitura;
    assert.ok(Array.isArray(l.verbatins) && l.verbatins.length >= 2, `${id} sem verbatim`);
    for (const v of l.verbatins) {
      assert.ok(v.texto && v.texto.length > 40, `${id}: verbatim curto demais pra ser citação`);
      assert.match(v.locus, /Tetrabiblos [IV]+\.\d+/, `${id}: locus sem capítulo — "${v.locus}"`);
      assert.match(v.locus, /Robbins, 1940/, `${id}: citação sem edição`);
    }
    assert.ok(Array.isArray(l.fontes) && l.fontes.length >= 3, `${id} com bibliografia magra`);
  }
});

test('os 144 pares, sem exceção, saem com fonte — nenhum cai num caminho sem citação', () => {
  for (const p of PARES) {
    assert.ok(p.leitura.verbatins.length >= 2, `${p.a}+${p.b}`);
    assert.ok(p.leitura.fontes.length >= 3, `${p.a}+${p.b}`);
  }
});

test('cada relação cita o capítulo CERTO, e não um capítulo genérico', () => {
  const esperado = {
    // harmônicos: I.13 é onde "trine and sextile are called harmonious" está
    trigono: /I\.13/,
    sextil: /I\.13/,
    // desarmônicos: também I.13 ("quartile and opposition are disharmonious")
    quadratura: /I\.13/,
    oposicao: /I\.13/,
    // aversão: I.16, "Of Disjunct Signs" — e é ESTE o capítulo que o mercado
    // inteiro ignora
    aversao30: /I\.16/,
    aversao150: /I\.16/,
    // mesmo signo: a enumeração dos quatro aspectos, pra mostrar que a
    // conjunção não está nela
    copresenca: /I\.1[36]/,
  };
  for (const [id, re] of Object.entries(esperado)) {
    const l = porId(id)[0].leitura;
    const loci = l.verbatins.map((v) => v.locus).join(' | ');
    assert.match(loci, re, `${id} não cita o capítulo esperado — ${loci}`);
  }
});

test('TODA leitura cita IV.7, que é de onde vem o grau — grau sem fonte não sai daqui', () => {
  for (const p of PARES) {
    const loci = p.leitura.verbatins.map((v) => v.locus).join(' | ');
    assert.match(loci, /IV\.7/, `${p.a}+${p.b} mostra grau ${p.leitura.grau} sem citar IV.7`);
  }
});

test('os verbatins são o inglês de Robbins, sem tradução por cima', () => {
  // Traduzir citação é falsificá-la (regra 1 do cabeçalho de lib/synastry.js).
  // Marcador barato e confiável: o texto tem que estar em inglês.
  for (const chave of Object.keys(S.VERBATIM)) {
    const v = S.VERBATIM[chave];
    assert.match(v.texto, /\b(the|and|of|are|which)\b/, `VERBATIM.${chave} não parece inglês`);
    assert.ok(!/\b(que|são|não|dos|uma)\b/.test(v.texto), `VERBATIM.${chave} tem português dentro da citação`);
  }
});

// ===========================================================================
// 7. O QUE CADA RELAÇÃO DIZ — fidelidade ao que a fonte sustenta
// ===========================================================================

test('trígono e sextil são harmônicos, e o texto diz POR QUE (mesma espécie de signo)', () => {
  for (const id of ['trigono', 'sextil']) {
    for (const p of porId(id)) {
      assert.equal(p.leitura.categoriaId, 'harmonico');
      assert.match(corpo(p.leitura), /harmônic/i, `${p.a}+${p.b}`);
      const temI13 = p.leitura.verbatins.some((v) => /signs of the same kind/.test(v.texto));
      assert.ok(temI13, `${p.a}+${p.b} sem o verbatim que fundamenta a harmonia`);
    }
  }
  // O trígono é o mais forte dos dois harmônicos, e é do mesmo elemento.
  for (const p of porId('trigono')) {
    assert.equal(p.leitura.elementoA, p.leitura.elementoB, `${p.a}+${p.b}`);
  }
  // O sextil compartilha UMA qualidade, nunca o elemento inteiro.
  for (const p of porId('sextil')) {
    assert.notEqual(p.leitura.elementoA, p.leitura.elementoB, `${p.a}+${p.b}`);
    assert.equal(p.leitura.qualidadesEmComum.length, 1, `${p.a}+${p.b}`);
  }
});

test('a quadratura é desarmônica, de mesma modalidade, e nomeia os gêneros opostos', () => {
  for (const p of porId('quadratura')) {
    assert.equal(p.leitura.categoriaId, 'desarmonico');
    assert.equal(p.leitura.modalidadeA, p.leitura.modalidadeB, `${p.a}+${p.b} não é mesma modalidade`);
    assert.match(corpo(p.leitura), /tipos opostos/, `${p.a}+${p.b}`);
    assert.match(corpo(p.leitura), /90 graus/, `${p.a}+${p.b}`);
  }
  // Os dois casos que a física de Aristóteles separa — e os dois têm que
  // aparecer, senão a distinção existe só no comentário.
  const contrarios = porId('quadratura').filter((p) => p.leitura.qualidadesEmComum.length === 0);
  const umFio = porId('quadratura').filter((p) => p.leitura.qualidadesEmComum.length === 1);
  assert.equal(contrarios.length + umFio.length, 24);
  assert.ok(contrarios.length > 0 && umFio.length > 0);
  // Mas a graduação NÃO muda o degrau: ela é leitura do app, e está declarada
  // como tal em NAO_ACHADO.
  assert.equal(new Set(porId('quadratura').map((p) => p.leitura.grau)).size, 1);
});

test('A OPOSIÇÃO NÃO É EXPLICADA POR "ELEMENTOS INCOMPATÍVEIS" — seria falso', () => {
  // O furo que a pesquisa achou sozinha: signos opostos são do MESMO gênero, e
  // os elementos que a oposição junta (fogo-ar, terra-água) são os mesmos que o
  // sextil junta. A tensão é AXIAL, não elemental. Qualquer texto que explique a
  // oposição por elemento está mentindo com aparência de erudição.
  for (const p of porId('oposicao')) {
    const t = corpo(p.leitura);
    assert.ok(!/elementos incompatíveis|elementos que não combinam/i.test(t), `${p.a}+${p.b}`);
    assert.match(t, /não é de elemento, é de posição/, `${p.a}+${p.b} não nomeia o eixo`);
    // E a prova aritmética: sempre há UMA qualidade em comum.
    assert.equal(p.leitura.qualidadesEmComum.length, 1, `${p.a}+${p.b}`);
  }

  // A confirmação estrutural: os pares de ELEMENTO da oposição são exatamente
  // os mesmos do sextil. Se algum dia divergirem, a frase acima virou falsa.
  const chave = (p) => [p.leitura.elementoA, p.leitura.elementoB].sort().join('+');
  const elemOposicao = new Set(porId('oposicao').map(chave));
  const elemSextil = new Set(porId('sextil').map(chave));
  assert.deepEqual([...elemOposicao].sort(), [...elemSextil].sort());
});

test('mesmo signo é CO-PRESENÇA e o texto diz que isto não é aspecto', () => {
  for (const p of porId('copresenca')) {
    assert.equal(p.i, p.j);
    assert.equal(p.leitura.categoriaId, 'copresenca');
    assert.equal(p.leitura.graus, 0);
    assert.match(corpo(p.leitura), /NÃO é um aspecto/, `${p.a}+${p.b}`);
    assert.match(corpo(p.leitura), /Ptolomeu enumera quatro/, `${p.a}+${p.b}`);
    // Ptolomeu enumera QUATRO. Se algum texto do app disser cinco, é erro.
    assert.ok(!/cinco aspectos/i.test(corpo(p.leitura)));
  }
  // E a palavra "conjunção" não pode ser usada como nome do aspecto.
  for (const p of porId('copresenca')) {
    assert.notEqual(p.leitura.aspecto, 'Conjunção');
  }
});

test('o resumo (o que a Home mostra) é curto, nomeia os signos e passa pelas mesmas regras', () => {
  // A Home tem espaço pra uma linha. Se o resumo crescer, ele vira o texto
  // longo cortado no meio — que é pior que não ter resumo nenhum.
  for (const p of PARES) {
    assert.ok(p.leitura.resumo, `${p.a}+${p.b} sem resumo`);
    assert.ok(p.leitura.resumo.length <= 180, `${p.a}+${p.b}: resumo com ${p.leitura.resumo.length} caracteres`);
    assert.match(p.leitura.resumo, new RegExp(p.a), `${p.a}+${p.b}`);
    if (p.i !== p.j) assert.match(p.leitura.resumo, new RegExp(p.b), `${p.a}+${p.b}`);
    for (const [re, motivo] of FATALISMO) {
      assert.ok(!re.test(p.leitura.resumo), `resumo de ${p.a}+${p.b} — ${motivo}`);
    }
    assert.ok(!p.leitura.resumo.includes('%'));
  }
  // E o resumo distingue as 7 relações, igual ao texto longo.
  const porRelacao = new Map(RELACOES.map((id) => [id, new Set(porId(id).map((x) => x.leitura.resumo))]));
  for (const idA of RELACOES) {
    for (const idB of RELACOES) {
      if (idA >= idB) continue;
      for (const r of porRelacao.get(idA)) assert.ok(!porRelacao.get(idB).has(r), `resumo repetido: ${idA}/${idB}`);
    }
  }
});

test('cada leitura fala dos SIGNOS DAQUELE PAR, não de um molde com o miolo trocado', () => {
  // O defeito antigo: 10 textos para 144 pares. Agora cada texto nomeia os dois
  // signos, e pares diferentes da MESMA relação têm textos diferentes.
  for (const p of PARES) {
    if (p.i === p.j) {
      assert.match(p.leitura.texto, new RegExp(p.a), `${p.a}+${p.b}`);
      continue;
    }
    assert.match(p.leitura.texto, new RegExp(p.a), `${p.a}+${p.b} não nomeia ${p.a}`);
    assert.match(p.leitura.texto, new RegExp(p.b), `${p.a}+${p.b} não nomeia ${p.b}`);
  }
  // Contagem grosseira, mas é a que teria pegado o defeito: quantos textos
  // DISTINTOS os 144 pares produzem. Eram 10.
  const distintos = new Set(PARES.map((p) => p.leitura.texto));
  assert.ok(distintos.size >= 100, `só ${distintos.size} textos distintos em 144 pares`);
});

// ===========================================================================
// 8. A PORCENTAGEM SAIU — e não pode voltar por descuido
// ===========================================================================

test('compatPercent() não existe mais em lib/signs.js', () => {
  const signs = require('../lib/signs.js');
  assert.equal(signs.compatPercent, undefined, 'a porcentagem voltou pela porta dos fundos');
});

test('nenhuma leitura carrega nota, índice ou qualquer número de 0 a 100', () => {
  for (const p of PARES) {
    assert.equal(p.leitura.indice, undefined, `${p.a}+${p.b} tem índice`);
    assert.equal(p.leitura.overall, undefined, `${p.a}+${p.b} tem overall`);
    assert.equal(p.leitura.pct, undefined, `${p.a}+${p.b} tem pct`);
    // O único número que a leitura expõe é geometria: graus (0..180),
    // distância (0..6) e grau ordinal (1..4). Nada disso é nota.
    assert.ok(p.leitura.graus % 30 === 0 && p.leitura.graus <= 180);
    assert.ok(p.leitura.grau >= 1 && p.leitura.grau <= 4);
  }
});

test('nenhum texto exibido ao usuário contém "%"', () => {
  for (const p of PARES) {
    const tudo = [corpo(p.leitura), p.leitura.notaEscala, p.leitura.notaGrau, p.leitura.ressalvaSignoSolar].join(' ');
    assert.ok(!tudo.includes('%'), `${p.a}+${p.b} ainda mostra porcentagem`);
  }
});

// Os comentários dessas telas CITAM o código antigo de propósito — é assim que
// a próxima pessoa entende por que a porcentagem sumiu. Então a varredura olha
// só o código executável: tira `//…` até o fim da linha e os blocos `/* … */`
// (que cobrem também os comentários JSX `{/* … */}`). Tirar demais só produz
// falso NEGATIVO, nunca falso positivo — e o que se está procurando é presença.
function semComentarios(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

test('as três telas que liam a porcentagem não a importam mais', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  for (const tela of ['CompatibilityScreen.js', 'HomeScreen.js', 'QuizScreen.js']) {
    const src = semComentarios(fs.readFileSync(path.join(__dirname, '..', 'screens', tela), 'utf8'));
    assert.ok(!/\bcompatPercent\b/.test(src), `${tela} ainda chama compatPercent`);
    // E nenhuma delas pode renderizar `{...}%` a partir do resultado.
    assert.ok(!/\{\s*(pct|result\.overall)\s*\}\s*%/.test(src), `${tela} ainda desenha porcentagem`);
    // Nem reintroduzir a nota por outro nome.
    assert.ok(!/\bresult\.(overall|indice|nota)\b/.test(src), `${tela} voltou a exibir uma nota`);
  }
});

test('a ressalva que explica a AUSÊNCIA da porcentagem acompanha toda leitura', () => {
  for (const p of PARES) {
    assert.match(p.leitura.notaEscala, /não tem porcentagem/i, `${p.a}+${p.b}`);
    assert.match(p.leitura.notaEscala, /Lilly/, 'sem o único sistema de pontos que É tradicional, a ressalva fica vaga');
    assert.match(p.leitura.notaGrau, /ordem, não medida/, `${p.a}+${p.b}`);
  }
});

test('toda leitura admite que comparar signo solar com signo solar é recorte de 1930', () => {
  for (const p of PARES) {
    assert.match(p.leitura.ressalvaSignoSolar, /Naylor/, `${p.a}+${p.b}`);
    assert.match(p.leitura.ressalvaSignoSolar, /1930/, `${p.a}+${p.b}`);
  }
});

// ===========================================================================
// 9. AS RESSALVAS ESTRUTURAIS DO MÓDULO
// ===========================================================================

test('NAO_ACHADO continua registrando a lacuna da porcentagem — não foi preenchida por dedução', () => {
  const ids = S.NAO_ACHADO.map((n) => n.id);
  assert.ok(ids.includes('percentual'));
  assert.ok(ids.includes('graduacaoQuadraturas'));
  for (const n of S.NAO_ACHADO) {
    assert.ok(n.texto.length > 80, `${n.id} com justificativa curta demais pra servir de aviso`);
  }
});

test('nenhuma leitura faz alegação de saúde', () => {
  const SAUDE = /\b(cura|curar|sarar|alivia|aliviar|tratamento|remédio|terapêutic|faz bem à saúde)\b/i;
  for (const p of PARES) {
    assert.ok(!SAUDE.test(corpo(p.leitura)), `${p.a}+${p.b}`);
  }
});

test('o que é leitura do app está rotulado como leitura do app', () => {
  // Regra 5 do cabeçalho. Onde o app extrapola a fonte, ele avisa. O trígono é
  // o caso mais claro: "facilidade não empurra ninguém" não está em Ptolomeu.
  const trigono = porId('trigono')[0].leitura;
  assert.match(corpo(trigono), /leitura do app/i);
});

test('as chaves de tradução cobrem exatamente as famílias e categorias que o motor produz', () => {
  const familias = new Set(PARES.map((p) => p.leitura.familia));
  const categorias = new Set(PARES.map((p) => p.leitura.categoriaId));
  for (const f of familias) {
    assert.ok(S.CHAVES_DE_TRADUCAO.aspecto[f], `família ${f} sem chave de tradução`);
  }
  for (const c of categorias) {
    assert.ok(S.CHAVES_DE_TRADUCAO.categoria[c], `categoria ${c} sem chave de tradução`);
  }
  // E o inverso: chave sem uso é chave que sobrou de uma refatoração.
  for (const f of Object.keys(S.CHAVES_DE_TRADUCAO.aspecto)) assert.ok(familias.has(f), `chave órfã: ${f}`);
  for (const c of Object.keys(S.CHAVES_DE_TRADUCAO.categoria)) assert.ok(categorias.has(c), `chave órfã: ${c}`);
});

test('os rótulos de aspecto e categoria existem nos três idiomas', () => {
  const { _DICTS_FOR_TESTS, LANGUAGES } = require('../lib/i18n.js');
  const chaves = [
    ...Object.values(S.CHAVES_DE_TRADUCAO.aspecto),
    ...Object.values(S.CHAVES_DE_TRADUCAO.categoria),
  ];
  for (const lang of LANGUAGES) {
    for (const k of chaves) {
      assert.ok(_DICTS_FOR_TESTS[lang][k], `${k} falta em ${lang}`);
    }
  }
});

test('nenhuma string do dicionário promete mais "% de compatibilidade"', () => {
  // A chave antiga (home.compatPercent) foi reescrita, não abandonada — chave
  // morta continua indo no bundle, e um "%" esquecido é o que a próxima tela
  // reaproveita sem perceber.
  const { _DICTS_FOR_TESTS, LANGUAGES } = require('../lib/i18n.js');
  for (const lang of LANGUAGES) {
    for (const [k, v] of Object.entries(_DICTS_FOR_TESTS[lang])) {
      if (!/compat/i.test(k)) continue;
      assert.ok(!v.includes('%'), `${lang}/${k} ainda promete porcentagem: "${v}"`);
      assert.ok(!/\{pct\}/.test(v), `${lang}/${k} ainda interpola {pct}`);
    }
  }
});

// ===========================================================================
// 10. A GEOMETRIA — os fatos que sustentam as frases
// ===========================================================================

test('a modalidade é aritmética do zodíaco, e as frases que dependem dela batem', () => {
  // quadratura e oposição: SEMPRE mesma modalidade. aversão: NUNCA.
  for (const p of PARES) {
    if (['quadratura', 'oposicao', 'copresenca'].includes(p.leitura.familia)) {
      assert.equal(p.leitura.modalidadeA, p.leitura.modalidadeB, `${p.a}+${p.b} (${p.leitura.familia})`);
    }
    if (p.leitura.familia === 'aversao') {
      assert.notEqual(p.leitura.modalidadeA, p.leitura.modalidadeB, `${p.a}+${p.b}`);
      assert.notEqual(p.leitura.elementoA, p.leitura.elementoB, `${p.a}+${p.b}`);
    }
  }
});

test('as qualidades dos elementos são as de Aristóteles, e só existem quatro combinações', () => {
  assert.deepEqual(S.QUALIDADES.fogo, ['quente', 'seco']);
  assert.deepEqual(S.QUALIDADES.ar, ['quente', 'úmido']);
  assert.deepEqual(S.QUALIDADES.água, ['frio', 'úmido']);
  assert.deepEqual(S.QUALIDADES.terra, ['frio', 'seco']);
  // Contrários absolutos: só dois pares no zodíaco inteiro.
  assert.deepEqual(S.qualidadesEmComum('fogo', 'água'), []);
  assert.deepEqual(S.qualidadesEmComum('ar', 'terra'), []);
  assert.deepEqual(S.qualidadesEmComum('fogo', 'terra'), ['seco']);
  assert.deepEqual(S.qualidadesEmComum('ar', 'água'), ['úmido']);
});

test('as chaves de QUALIDADES casam byte a byte com o campo element de SIGNS', () => {
  // Se divergirem, qualidadesEmComum() devolve [] em silêncio e toda quadratura
  // vira "contrários absolutos" sem ninguém notar.
  for (const s of SIGNS) {
    assert.ok(S.QUALIDADES[s.element], `elemento "${s.element}" de ${s.name} não existe em QUALIDADES`);
  }
});

// ===========================================================================
// 11. ATRIBUIÇÃO — a fonte certa, no autor certo
// ===========================================================================
// Fonte errada é pior que fonte ausente (regra do docs/tradicao/02). Estes
// quatro testes fecham as três atribuições que a auditoria pegou soltas.

test('a OPOSIÇÃO carrega o furo da justificativa de I.13 — signos opostos são do MESMO gênero', () => {
  // Ptolomeu diz que quadratura e oposição são desarmônicas "porque são
  // compostas de signos de tipos opostos". Os tipos são os gêneros de I.12, que
  // alternam um a um: a SEIS signos de distância o gênero é sempre o mesmo. A
  // razão vale pra quadratura e não vale pra oposição — e o app não pode
  // repetir a frase como se fechasse.
  for (const p of porId('oposicao')) {
    const t = corpo(p.leitura);
    assert.match(t, /MESMO gênero/, `${p.a}+${p.b} repete a justificativa sem registrar o furo`);
    assert.match(t, /I\.12/, `${p.a}+${p.b} não cita onde está a alternância de gênero`);
    // E não pode afirmar o contrário do que a aritmética mostra.
    assert.ok(!/gêneros opostos/i.test(t), `${p.a}+${p.b} afirma gêneros opostos, que é falso na oposição`);
    const fontes = p.leitura.fontes.join(' | ');
    assert.match(fontes, /I\.12/, `${p.a}+${p.b} usa I.12 no texto e não a lista nas fontes`);
  }
  // A quadratura, essa sim, pode usar a justificativa — é onde ela fecha.
  for (const p of porId('quadratura')) {
    assert.match(corpo(p.leitura), /tipos opostos/, `${p.a}+${p.b}`);
  }
});

test('a ordem entre TRÍGONO e SEXTIL é de Lilly (1647), não de Ptolomeu', () => {
  // I.13 chama os dois de harmônicos sem hierarquia, e IV.7 põe os dois no
  // MESMO degrau. Quem ordena é Lilly, p. 106: "the Trine is more forcible".
  for (const id of ['trigono', 'sextil']) {
    for (const p of porId(id)) {
      const t = corpo(p.leitura);
      assert.match(t, /Lilly/, `${p.a}+${p.b} ordena os harmônicos sem dizer de quem é a ordem`);
      assert.ok(
        !/mais harmônico dos (quatro )?aspectos|menor dos dois harmônicos/i.test(t),
        `${p.a}+${p.b} atribui a Ptolomeu uma hierarquia que ele não escreve`
      );
      assert.match(p.leitura.fontes.join(' | '), /Lilly/, `${p.a}+${p.b} cita Lilly no texto e não nas fontes`);
    }
  }
  // E a hierarquia de Lilly NÃO pode vazar pro degrau, que é de IV.7.
  assert.equal(porId('trigono')[0].leitura.grau, porId('sextil')[0].leitura.grau);
});

test('o sétimo lugar da união se conta do ASCENDENTE — e o atalho está admitido como atalho', () => {
  // O Descendente é o sétimo LUGAR a partir do Ascendente. Ler o sétimo SIGNO a
  // partir do Sol é técnica de carta solar, não doutrina helenística.
  for (const p of porId('oposicao')) {
    const t = corpo(p.leitura);
    assert.match(t, /a partir do Ascendente/, `${p.a}+${p.b}`);
    assert.match(t, /atalho deste app/, `${p.a}+${p.b} não admite o atalho`);
    assert.ok(
      !/sétimo signo a partir do seu/i.test(t),
      `${p.a}+${p.b} conta o lugar da união a partir do signo solar`
    );
  }
});

test('a ressalva de signo solar nomeia os QUATRO lugares de IV.7, que é de onde vem o grau', () => {
  // A tela mostra o grau de IV.7. IV.7 compara Sol, Lua, Ascendente e Parte da
  // Fortuna das duas cartas — mostrar a escala sem dizer isso é usar a
  // autoridade do capítulo escondendo o que ele de fato compara.
  const r = PARES[0].leitura.ressalvaSignoSolar;
  assert.match(r, /IV\.7/);
  assert.match(r, /Parte da Fortuna/);
  assert.match(r, /Ascendente/);
  // E o verbatim de IV.7 não pode elidir justamente essa parte.
  assert.match(S.VERBATIM.escala.texto, /the sun, the moon, the horoscope, and the Lot of Fortune/);
  // Mas continua elidindo o trecho dos 17°, que a pesquisa marca como
  // textualmente suspeito — citação disputada não vai pra tela.
  assert.ok(!/17/.test(S.VERBATIM.escala.texto), 'o trecho disputado dos 17° voltou pra citação');
});

test('entrada inválida devolve null, nunca uma leitura fabricada', () => {
  assert.equal(compatibility('Não Existe', 'Áries'), null);
  assert.equal(compatibility('Áries', 'Não Existe'), null);
  assert.equal(compatibility(null, 'Áries'), null);
  assert.equal(S.sinastria(null, null), null);
  assert.equal(S.sinastria({ index: 0 }, { name: 'x' }), null);
});
