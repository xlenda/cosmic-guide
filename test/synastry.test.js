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

// TUDO que a tela mostra como leitura, os dois blocos juntos. A varredura de
// veredito, de saúde e de porcentagem morde este texto inteiro — o bloco quente
// não ganha licença nenhuma por ser quente (regra 7 de lib/synastry.js).
// O `caminho` (04/08/2026) entra aqui de propósito, e não numa varredura
// separada: é texto de tela como qualquer outro, e conselho é justamente onde a
// promessa, o veredito e a linguagem de saúde entram fantasiados de gentileza.
// Pondo-o no corpo, toda regra que este arquivo já tem passa a valer pra ele —
// e toda regra que ele ganhar amanhã também, sem ninguém precisar lembrar.
// (`|| ''` porque ele é null nas leituras não tensas: só quadratura, oposição e
// as duas aversões recebem caminho.)
function corpo(leitura) {
  return [leitura.resumo, leitura.texto, leitura.forte, leitura.cuidado, leitura.caminho || '', ...vidaReal(leitura)].join(' \n ');
}

// Só o BLOCO 1, na ordem em que a tela desenha, com a chamada na frente.
function vidaReal(leitura) {
  return [leitura.chamada, ...S.DIMENSOES_VIDA_REAL.map((d) => leitura.vidaReal[d.id])];
}

function blocoUm(leitura) {
  return vidaReal(leitura).join(' \n ');
}

// Conta frases pelo que termina frase. O bloco 1 é escrito sem abreviação e
// sem número decimal exatamente pra esta contagem ser confiável.
function frases(texto) {
  return (texto.match(/[.!?](\s|$)/g) || []).length;
}

// Troca os nomes dos doze signos por um curinga. Serve pra provar que a
// variação entre pares NÃO vem só de interpolar nome — que é o defeito que
// este arquivo inteiro existe pra impedir.
const NOMES_DOS_SIGNOS = SIGNS.map((s) => s.name);
function semNomes(texto) {
  let t = texto;
  for (const n of NOMES_DOS_SIGNOS) t = t.split(n).join('◆');
  return t;
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
  // Previsão de FREQUÊNCIA de conflito é desfecho, não natureza (regra 2):
  // "briga feia aqui é rara" afirma quantas vezes o casal briga — a fonte só
  // sustenta "harmônico" (I.13) e, atribuído, "costumam durar" (IV.5).
  [/briga[^.!?]*rara/i, 'previsão de frequência de conflito'],
  [/nunca brigam/i, 'previsão de frequência de conflito'],
  // ACRÉSCIMOS DO BLOCO 1 (31/07/2026). O texto quente é onde o veredito entra
  // sem pedir licença: quem escreve "prende atenção" escreve "almas gêmeas" no
  // parágrafo seguinte sem perceber. Estas formas são as do lado POSITIVO, que
  // a lista original não cobria — e um veredito de casamento perfeito é tão
  // veredito quanto um de separação.
  [/alma[s]? g[êe]mea/i, 'o veredito positivo que a fonte não autoriza'],
  [/(casamento|casal|par|rela[çc][ãa]o|combina[çc][ãa]o|amor) (perfeit|ideal)/i, 'veredito positivo'],
  [/feito[s]? um (pro|para o) outro/i, 'veredito positivo'],
  [/foi feito pra (dar certo|durar)|nasceu pra dar certo/i, 'desfecho decretado'],
  [/\bfuja[mo]?\b|\bcorra enquanto\b/i, 'conselho de terminar'],
  [/vale a pena (ficar|continuar|insistir|tentar)|deveriam? (ficar|terminar|se separar|continuar)/i, 'conselho sobre a relação'],
  [/garantia de|garantido|garantimos|prometemos|com certeza v[ãa]o/i, 'promessa de resultado'],
  [/\bsempre vai\b|\bnunca vai\b|\bvai ser (feliz|eterno)\b/i, 'futuro decretado'],
];

// SAÚDE. A regra 4 de lib/synastry.js não tem exceção e não aceita metáfora, e
// o bloco 1 fala de cama — que é exatamente onde a linguagem de saúde entra
// disfarçada de elogio ("faz bem", "cura o outro", "melhora a libido"). Os dois
// últimos grupos são os que o dono nomeou de fora: nada de fertilidade, nada de
// gravidez, e nada de emprestar vocabulário de consultório.
const SAUDE = [
  [/\b(cura|curar|curam|sarar|sara|alivia|aliviar|tratamento|rem[ée]dio|terap[êe]utic|terapia)\b/i, 'linguagem de tratamento'],
  [/faz bem (à|a) sa[úu]de|faz bem pro corpo|melhora a sa[úu]de|é saud[áa]vel pra/i, 'alegação de benefício à saúde'],
  [/\bfertilidade\b|\bf[ée]rtil\b|engravidar|gravidez|gesta[çc][ãa]o|concep[çc][ãa]o/i, 'fertilidade e gravidez'],
  [/\blibido\b|\bhorm[ôo]n|\bdepress[ãa]o\b|\bansiedade\b|\bautoestima cl[íi]nic/i, 'vocabulário de consultório'],
];

// O bloco 1 fala de desejo. A licença é de coluna de revista boa, não de
// conteúdo adulto: o app tem classificação livre. A lista é de EXPLÍCITO e de
// anatomia, não de "sexo" — a palavra não é o problema, a cena é.
const EXPLICITO = [
  /\bp[êe]nis\b|\bvagina\b|\bgenital|\bpenetra|\bfelaç|\borgasm|\bmasturb|\bejacul/i,
  /\bbunda\b|\bpeito(s|nes)?\b|\bcoxas?\b|\bn[uú]a?s?\b(?! e crua)/i,
  /\btransar\b|\btransam\b|\bfoder|\btrepar\b|\bgozar\b|\bputaria\b|\bsafad/i,
  /\bposi[çc][ãa]o sexual|\bfetich|\bp[oó]rn/i,
];

test('NENHUMA das 144 leituras decreta o desfecho do casal', () => {
  for (const p of PARES) {
    const t = corpo(p.leitura);
    for (const [re, motivo] of FATALISMO) {
      assert.ok(!re.test(t), `${p.a}+${p.b} (${p.leitura.id}) — ${motivo}: ${t.match(re)}`);
    }
  }
});

test('a tela de Compatibilidade também não decreta — manchetes E subtítulo passam pelo mesmo filtro', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const src = fs.readFileSync(path.join(__dirname, '..', 'screens', 'CompatibilityScreen.js'), 'utf8');
  const bloco = src.slice(src.indexOf('const MANCHETE'), src.indexOf('};', src.indexOf('const MANCHETE')));
  for (const [re, motivo] of FATALISMO) {
    assert.ok(!re.test(bloco), `manchete da tela — ${motivo}`);
  }
  // O subtítulo do header também é texto de tela — e foi onde a promessa de
  // resultado sobreviveu mais tempo ("Encontre seu par celestial" prometia a
  // máquina de veredito que o resto da tela desmonta). O header descreve o que
  // a tela FAZ; prometer O par é decretar desfecho.
  const subtitle = (src.match(/subtitle="([^"]+)"/) || [])[1] || '';
  assert.ok(subtitle.length > 0, 'subtitle do GradientHeader não encontrado na tela');
  for (const [re, motivo] of FATALISMO) {
    assert.ok(!re.test(subtitle), `subtítulo da tela — ${motivo}`);
  }
  assert.ok(
    !/encontre (seu|o) par|par celestial|par ideal|par perfeito|alma gêmea|feitos um pro outro/i.test(subtitle),
    `o subtítulo promete desfecho: "${subtitle}"`
  );
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
  // A lista mora no topo do arquivo desde 31/07/2026, porque o bloco 1 fala de
  // cama e é ali que a linguagem de saúde entra disfarçada de elogio.
  for (const p of PARES) {
    const t = corpo(p.leitura);
    for (const [re, motivo] of SAUDE) {
      assert.ok(!re.test(t), `${p.a}+${p.b} (${p.leitura.id}) — ${motivo}: ${t.match(re)}`);
    }
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
    // O corpo virou conversa (regra 6): registra o furo em português de gente
    // ("nem fecha direito pra este caso") e manda a derivação dos gêneros pras
    // fontes — que é onde MESMO gênero e I.12 têm que continuar, por extenso.
    assert.match(t, /nem fecha direito/, `${p.a}+${p.b} repete a justificativa sem registrar o furo`);
    assert.match(t, /de posição, não de temperamento|não é de elemento, é de posição/, `${p.a}+${p.b} não diz de onde vem a dureza`);
    // E não pode afirmar o contrário do que a aritmética mostra.
    assert.ok(!/gêneros opostos/i.test(t), `${p.a}+${p.b} afirma gêneros opostos, que é falso na oposição`);
    const fontes = p.leitura.fontes.join(' | ');
    assert.match(fontes, /MESMO gênero/, `${p.a}+${p.b} tirou a aritmética do corpo e não a pôs nas fontes`);
    assert.match(fontes, /I\.12/, `${p.a}+${p.b} não cita onde está a alternância de gênero`);
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

// ===========================================================================
// 12. O BLOCO 1 — "COMO É NA VIDA REAL"
// ===========================================================================
// Segundo feedback do dono na mesma tela, 31/07/2026: "tá muito científico
// ainda, cada as coisas que o povão gosta de ler, fala de sexo entre eles, de
// conversa, de harmonia, de brigas, se vai ser quente na cama, no início tem
// que ser algo que prenda atenção. Depois a parte científica."
//
// O risco de uma mudança dessas é conhecido e é duplo: (a) o texto quente vira
// veredito, porque escrever bonito puxa pra "almas gêmeas" e pra "não vai dar
// certo"; e (b) o texto quente vira molde com o miolo trocado — sete parágrafos
// para 144 pares, que é EXATAMENTE o defeito que este arquivo existe pra
// impedir e que já aconteceu uma vez neste app. Os testes abaixo medem os dois.

const DIMS = S.DIMENSOES_VIDA_REAL.map((d) => d.id);

test('as cinco dimensões existem, na ordem, e a tela não inventa nenhuma', () => {
  assert.deepEqual(DIMS, ['quimica', 'conversa', 'briga', 'convivencia', 'longoPrazo']);
  for (const d of S.DIMENSOES_VIDA_REAL) {
    assert.match(d.chaveTitulo, /^compat\.dim\./, `${d.id} sem chave de título`);
    assert.ok(d.icone && d.icone.length > 2, `${d.id} sem ícone`);
  }
});

test('TODA relação tem as CINCO dimensões preenchidas, nos 144 pares', () => {
  // O jeito de esta feature apodrecer em silêncio é uma dimensão voltar string
  // vazia num aspecto que ninguém testou à mão — a tela renderiza o título com
  // nada embaixo e passa verde.
  for (const p of PARES) {
    assert.ok(p.leitura.vidaReal, `${p.a}+${p.b} sem bloco 1`);
    assert.deepEqual(Object.keys(p.leitura.vidaReal).sort(), [...DIMS].sort(), `${p.a}+${p.b}`);
    for (const d of DIMS) {
      const t = p.leitura.vidaReal[d];
      assert.equal(typeof t, 'string', `${p.a}+${p.b}/${d} não é texto`);
      assert.ok(t.trim().length >= 200, `${p.a}+${p.b}/${d} com ${t.length} caracteres — curto demais pra ser leitura`);
      // "cada uma com 2 a 4 frases" é literal no pedido do dono. Menos que 2
      // é bullet, mais que 4 é ensaio — e ensaio foi o que a tela já era.
      const n = frases(t);
      assert.ok(n >= 2 && n <= 4, `${p.a}+${p.b}/${d} tem ${n} frases`);
      // E cada dimensão fala DAQUELE par, com os dois nomes na mesa.
      assert.match(t, new RegExp(p.a), `${p.a}+${p.b}/${d} não nomeia ${p.a}`);
      if (p.i !== p.j) assert.match(t, new RegExp(p.b), `${p.a}+${p.b}/${d} não nomeia ${p.b}`);
    }
  }
});

test('a chamada abre a leitura: curta, dos dois signos, e distinta por relação', () => {
  for (const p of PARES) {
    assert.ok(p.leitura.chamada, `${p.a}+${p.b} sem chamada`);
    assert.ok(p.leitura.chamada.length <= 200, `${p.a}+${p.b}: chamada com ${p.leitura.chamada.length} caracteres`);
    assert.match(p.leitura.chamada, new RegExp(p.a), `${p.a}+${p.b}`);
    if (p.i !== p.j) assert.match(p.leitura.chamada, new RegExp(p.b), `${p.a}+${p.b}`);
    assert.ok(!p.leitura.chamada.includes('%'));
  }
  const porRelacao = new Map(RELACOES.map((id) => [id, new Set(porId(id).map((x) => x.leitura.chamada))]));
  for (const idA of RELACOES) {
    for (const idB of RELACOES) {
      if (idA >= idB) continue;
      for (const ch of porRelacao.get(idA)) {
        assert.ok(!porRelacao.get(idB).has(ch), `chamada repetida entre ${idA} e ${idB}`);
      }
    }
  }
});

test('OS 144 PARES CONTINUAM DISTINTOS — e não só por trocar o nome do signo', () => {
  // Com nome: 144 de 144, sem exceção.
  const comNome = new Set(PARES.map((p) => blocoUm(p.leitura)));
  assert.equal(comNome.size, 144, `só ${comNome.size} blocos distintos em 144 pares`);

  // SEM nome: é aqui que o molde com o miolo trocado aparece. Se o bloco 1
  // fosse sete textos com os signos interpolados, este número cairia para 7.
  // Ele fica em 139 porque os cinco pares que dividem o MESMO planeta de casa
  // (Áries/Escorpião, Touro/Libra, Gêmeos/Virgem, Sagitário/Peixes,
  // Capricórnio/Aquário) descrevem os dois lados com uma frase só — e aí A+B e
  // B+A ficam simétricos depois de apagar os nomes. É a colisão certa, e são
  // exatamente cinco.
  const semNome = new Set(PARES.map((p) => semNomes(blocoUm(p.leitura))));
  assert.ok(semNome.size >= 130, `só ${semNome.size} formas distintas depois de apagar os nomes`);

  // E dentro de CADA relação: os pares de uma mesma figura não podem ler igual.
  // É o teste que teria pegado o defeito histórico — Áries+Leão, Áries+Sagitário
  // e Leão+Sagitário recebiam a MESMA frase por serem os três trígonos de fogo.
  for (const id of RELACOES) {
    const grupo = porId(id);
    const formas = new Set(grupo.map((p) => semNomes(blocoUm(p.leitura))));
    assert.ok(formas.size >= grupo.length / 2, `${id}: ${grupo.length} pares e só ${formas.size} formas`);
  }

  const trigonosDeFogo = [
    compatibility('Áries', 'Leão'),
    compatibility('Áries', 'Sagitário'),
    compatibility('Leão', 'Sagitário'),
  ];
  for (const l of trigonosDeFogo) assert.equal(l.id, 'trigono');
  assert.equal(
    new Set(trigonosDeFogo.map((l) => semNomes(blocoUm(l)))).size,
    3,
    'os três trígonos de fogo voltaram a ler igual'
  );

  // As duas oposições que o dono citou: mesma figura, textos que não se parecem.
  const arieslibra = compatibility('Áries', 'Libra');
  const touroescorpiao = compatibility('Touro', 'Escorpião');
  assert.equal(arieslibra.id, 'oposicao');
  assert.equal(touroescorpiao.id, 'oposicao');
  assert.notEqual(semNomes(blocoUm(arieslibra)), semNomes(blocoUm(touroescorpiao)));
});

test('o bloco 1 não decreta, não promete e não fala de saúde', () => {
  for (const p of PARES) {
    const t = blocoUm(p.leitura);
    for (const [re, motivo] of FATALISMO) {
      assert.ok(!re.test(t), `bloco 1 de ${p.a}+${p.b} — ${motivo}: ${t.match(re)}`);
    }
    for (const [re, motivo] of SAUDE) {
      assert.ok(!re.test(t), `bloco 1 de ${p.a}+${p.b} — ${motivo}: ${t.match(re)}`);
    }
  }
});

test('o bloco 1 é adulto e direto sem ser explícito — o app tem classificação livre', () => {
  for (const p of PARES) {
    const t = blocoUm(p.leitura);
    for (const re of EXPLICITO) {
      assert.ok(!re.test(t), `bloco 1 de ${p.a}+${p.b} passou do ponto: ${t.match(re)}`);
    }
  }
  // Contrapartida: se a varredura não morde, ela não protege ninguém.
  assert.ok(EXPLICITO.some((re) => re.test('vão transar na primeira noite')));
  assert.ok(!EXPLICITO.some((re) => re.test('o desejo entre os dois esquenta rápido e esfria na rotina')));
});

test('o bloco 1 NÃO usa jargão — ele é o texto que abre, e quem abre não explica capítulo', () => {
  // A regra 6 mandava glosar o termo técnico na primeira aparição. A regra 7 vai
  // além: no bloco 1 o termo técnico simplesmente não entra, porque ele tem um
  // lugar próprio logo abaixo. Nome de aspecto, nome de autor e locus ficam no
  // bloco 2 — inteiros, e é por isso que dá pra tirá-los daqui.
  const JARGAO = [
    /tr[íi]gono|sextil|quadratura|oposi[çc][ãa]o|avers[ãa]o|co-presen[çc]a|conjun[çc][ãa]o/i,
    /Ptolomeu|Tetrabiblos|Robbins|Arist[óo]teles|Lilly|Man[íi]lio|Naylor|Goodman|Alan Leo/i,
    /\b[IVX]+\.\d+\b/,
    /harm[ôo]nic|desarm[ôo]nic|disjunt|alheios/i,
    /modalidade|cardeal|mut[áa]vel|bicorp[óo]re|solsticial|equinocial/i,
    /regente|reg[êe]ncia|kathuperter|supera[çc][ãa]o|verbatim|par[áa]frase/i,
    /\d+\s*graus|°|\bgrau \d/i,
  ];
  for (const p of PARES) {
    const t = blocoUm(p.leitura);
    for (const re of JARGAO) {
      assert.ok(!re.test(t), `bloco 1 de ${p.a}+${p.b} vazou jargão: ${t.match(re)}`);
    }
  }
});

test('TODA leitura dura carrega, JÁ NO BLOCO 1, a nuance de IV.5 que impede a sentença', () => {
  // No bloco 2 isso já era exigido (verbatim do modificador + "recomeços e
  // lembranças"). Mas o bloco 2 nasce recolhido: quem lê só o bloco quente
  // levaria embora uma condenação que a fonte não dá. Então a nuance aparece
  // nos dois lugares, em duas línguas.
  const duros = PARES.filter((p) => p.leitura.categoriaId === 'desarmonico');
  assert.equal(duros.length, 36);
  for (const p of duros) {
    assert.match(p.leitura.vidaReal.longoPrazo, /atrito não é sentença/i, `${p.a}+${p.b}`);
    assert.match(p.leitura.vidaReal.longoPrazo, /não termina/i, `${p.a}+${p.b}`);
  }
  // E o bloco 1 da aversão diz que descreve o começo, não o fim — mesma
  // disciplina do bloco 2, que já era testada.
  for (const p of PARES.filter((x) => x.leitura.familia === 'aversao')) {
    assert.match(p.leitura.vidaReal.longoPrazo, /descreve o começo de vocês, não o fim/i, `${p.a}+${p.b}`);
  }
  // E nenhuma das quatro categorias fica sem fecho.
  assert.equal(new Set(PARES.map((p) => p.leitura.categoriaId)).size, 4);
});

test('QUEM PUXA é dito em todo par, e na oposição e no mesmo signo ninguém puxa', () => {
  // A superação (kathuperterisis) responde "quem puxa a relação" — pergunta que
  // nota nenhuma responde, e que nenhum app do mercado usa. Onde ela NÃO se
  // aplica, o texto diz que não se aplica em vez de inventar um líder.
  // ONDE o teste olha mudou em 31/07/2026, e a razão é de produto, não de
  // teste: "quem puxa" saiu da dimensão `quimica` e foi pra `chamada`. Medido
  // no motor: em 60 dos 78 pares as DUAS primeiras frases da tela diziam a
  // mesma coisa — a chamada terminava em "quem dá o primeiro passo quase
  // sempre é Áries" e a linha logo abaixo repetia "quem costuma dar o primeiro
  // passo é Áries". O leitor gastava a atenção da abertura relendo um fato.
  //
  // O PROPÓSITO do guarda não mudou nada: todo par diz quem puxa, e onde a
  // superação não se aplica o texto diz isso em vez de inventar um líder. Só o
  // campo inspecionado é outro — e o teste passa a aceitar as três formas que
  // o motor usa, em vez de exigir uma frase única (frase única na abertura de
  // 144 pares é o "enrolar linguiça" que a reescrita veio matar).
  const NOME = '(Áries|Touro|Gêmeos|Câncer|Leão|Virgem|Libra|Escorpião|Sagitário|Capricórnio|Aquário|Peixes)';
  // CINCO formas, e a variedade é de propósito: uma frase única no fecho da
  // abertura dos 144 pares é exatamente o "enrolar linguiça" que a reescrita
  // veio matar. O guarda tem que entender o motor, não engessá-lo — o que ele
  // exige é que o LÍDER seja dito, não que seja dito sempre igual.
  const FORMAS = [
    new RegExp(`quem dá o primeiro passo quase sempre é ${NOME}`),
    new RegExp(`quem empurra a relação pra frente é ${NOME}`),
    new RegExp(`a ponte costuma ser levantada por ${NOME}`),
    new RegExp(`${NOME} dá o primeiro passo`),
    new RegExp(`${NOME} puxa, ${NOME} acompanha`),
  ];
  const lider = (t) => {
    const s = String(t || '');
    for (const re of FORMAS) {
      const m = s.match(re);
      if (m) return m[1];
    }
    return 'nenhum';
  };
  for (const p of PARES) {
    const c = p.leitura.chamada;
    assert.ok(c, `${p.a}+${p.b} sem chamada`);
    if (p.leitura.distancia === 0 || p.leitura.distancia === 6) {
      // Sem superação a invocar: no mesmo signo não há dois lugares, e na
      // oposição os dois se olham de igual pra igual.
      assert.equal(lider(c), 'nenhum', `${p.a}+${p.b} inventou um líder onde não há`);
    } else {
      assert.notEqual(lider(c), 'nenhum', `${p.a}+${p.b}: a chamada não diz quem puxa — "${c}"`);
    }
  }
  // E o líder é o MESMO nos dois sentidos de leitura: é propriedade do par, não
  // da ordem em que a tela recebeu os signos.
  for (const p of PARES) {
    if (p.i === p.j) continue;
    const inversa = compatibility(p.b, p.a);
    assert.equal(
      lider(inversa.chamada),
      lider(p.leitura.chamada),
      `${p.a}+${p.b}: o líder muda quando se inverte a ordem`
    );
  }
  // Confere a doutrina numa carta conhecida: o décimo signo a partir de Câncer
  // é Áries, e é Áries que predomina (Pórfiro, via docs/tradicao/02 §2.4).
  assert.equal(lider(compatibility('Câncer', 'Áries').chamada), 'Áries');
  assert.equal(lider(compatibility('Áries', 'Câncer').chamada), 'Áries');
  // E na quadratura do outro lado: o décimo a partir de Áries é Capricórnio.
  assert.equal(lider(compatibility('Áries', 'Capricórnio').chamada), 'Capricórnio');
});

test('as regências são as casas de Tetrabiblos I.17, e não movem a conta', () => {
  assert.deepEqual(Object.keys(S.REGENTES).sort(), SIGNS.map((s) => s.name).sort());
  assert.equal(S.REGENTES['Áries'], 'Marte');
  assert.equal(S.REGENTES['Escorpião'], 'Marte');
  assert.equal(S.REGENTES['Touro'], 'Vênus');
  assert.equal(S.REGENTES['Libra'], 'Vênus');
  assert.equal(S.REGENTES['Câncer'], 'Lua');
  assert.equal(S.REGENTES['Leão'], 'Sol');
  assert.equal(S.REGENTES['Capricórnio'], 'Saturno');
  assert.equal(S.REGENTES['Aquário'], 'Saturno');
  // Sete planetas e só sete: nada de Urano, Netuno ou Plutão numa doutrina do
  // séc. II. É o mesmo cuidado de lib/zodiacBody.js.
  const planetas = new Set(Object.values(S.REGENTES));
  assert.deepEqual([...planetas].sort(), ['Júpiter', 'Lua', 'Marte', 'Mercúrio', 'Saturno', 'Sol', 'Vênus'].sort());
  // E a regência NÃO move a conta: pares com regentes completamente diferentes
  // têm o mesmo grau quando têm a mesma figura. NAO_ACHADO.regentesInimigos
  // registra por quê — não existe fonte antiga que autorize o contrário.
  for (const id of RELACOES) {
    assert.equal(new Set(porId(id).map((p) => p.leitura.grau)).size, 1, `${id} tem grau variável`);
  }
  assert.match(
    S.NAO_ACHADO.find((n) => n.id === 'regentesInimigos').texto,
    /não move o grau, a categoria nem a figura/,
    'a lacuna dos regentes não registra que a regência entrou só como vocabulário'
  );
});

// ===========================================================================
// 13. O BLOCO 2 NÃO PERDEU NADA — a reordenação não pode virar amputação
// ===========================================================================

// Inventário congelado do que cada relação citava ANTES do bloco 1 existir
// (medido em 31/07/2026, rodando os 144 pares). Se uma fonte sumir na próxima
// refatoração, é aqui que o build para.
const FONTES_ESPERADAS = {
  copresenca: {
    verbatins: ['quatroAspectos', 'disjuntos', 'escala'],
    fontes: ['Tetrabiblos I.13', 'Tetrabiblos I.16', 'William Lilly, Christian Astrology, Londres, 1647', 'Da Geração e Corrupção II.3', 'Tetrabiblos I.11'],
  },
  aversao30: {
    verbatins: ['disjuntos', 'separacao', 'escala'],
    fontes: ['Tetrabiblos I.16', 'Tetrabiblos IV.5', 'Da Geração e Corrupção II.3', 'Tetrabiblos I.11'],
  },
  aversao150: {
    verbatins: ['disjuntos', 'separacao', 'escala'],
    fontes: ['Tetrabiblos I.16', 'Tetrabiblos IV.5', 'Da Geração e Corrupção II.3', 'Tetrabiblos I.11'],
  },
  sextil: {
    verbatins: ['harmonicos', 'duradouro', 'escala'],
    fontes: ['Tetrabiblos I.13', 'Tetrabiblos I.12', 'Tetrabiblos IV.7', 'William Lilly, Christian Astrology, Londres, 1647', 'Tetrabiblos IV.5', 'Da Geração e Corrupção II.3'],
  },
  trigono: {
    verbatins: ['harmonicos', 'duradouro', 'escala'],
    fontes: ['Tetrabiblos I.13', 'Tetrabiblos IV.7', 'William Lilly, Christian Astrology, Londres, 1647', 'Tetrabiblos IV.5', 'Da Geração e Corrupção II.3'],
  },
  quadratura: {
    verbatins: ['harmonicos', 'modificador', 'escala'],
    fontes: ['Tetrabiblos I.13', 'Tetrabiblos IV.5', 'Da Geração e Corrupção II.3', 'Tetrabiblos I.11'],
  },
  oposicao: {
    verbatins: ['harmonicos', 'modificador', 'escala'],
    fontes: ['Tetrabiblos I.13', 'Tetrabiblos I.12', 'Tetrabiblos I.17', 'Tetrabiblos IV.5', 'Da Geração e Corrupção II.3', 'Julius Firmicus Maternus, Mathesis'],
  },
};

test('O BLOCO 2 NÃO PERDEU NENHUMA FONTE que existia antes da reordenação', () => {
  const chaveDoVerbatim = (v) => Object.keys(S.VERBATIM).find((k) => S.VERBATIM[k].texto === v.texto);
  for (const [id, esperado] of Object.entries(FONTES_ESPERADAS)) {
    const pares = porId(id);
    assert.ok(pares.length > 0, `${id} não produz nenhum par`);
    for (const p of pares) {
      const chaves = p.leitura.verbatins.map(chaveDoVerbatim);
      assert.deepEqual(chaves, esperado.verbatins, `${p.a}+${p.b}: os verbatins de ${id} mudaram`);
      const bibliografia = p.leitura.fontes.join(' || ');
      for (const marca of esperado.fontes) {
        assert.ok(bibliografia.includes(marca), `${p.a}+${p.b} (${id}) perdeu a fonte "${marca}"`);
      }
      assert.equal(p.leitura.fontes.length, esperado.fontes.length, `${p.a}+${p.b} (${id}): a bibliografia mudou de tamanho`);
    }
  }
});

test('todo campo do bloco 2 continua saindo do motor, nos 144 pares', () => {
  // A lista é exaustiva de propósito: é o contrato entre o motor e a tela, e a
  // reordenação de 31/07/2026 é exatamente o tipo de mudança em que um campo
  // deixa de ser lido e ninguém percebe por semanas.
  const CAMPOS = [
    'aspecto', 'natureza', 'categoria', 'categoriaId', 'resumo', 'texto', 'forte', 'cuidado',
    'grau', 'grauNome', 'distancia', 'graus', 'elementoA', 'elementoB', 'modalidadeA', 'modalidadeB',
    'notaEscala', 'notaGrau', 'ressalvaSignoSolar', 'notaCaracterologia',
  ];
  for (const p of PARES) {
    for (const campo of CAMPOS) {
      const v = p.leitura[campo];
      assert.ok(v !== undefined && v !== null && v !== '', `${p.a}+${p.b} perdeu o campo ${campo}`);
    }
    assert.ok(Array.isArray(p.leitura.verbatins) && p.leitura.verbatins.length >= 3, `${p.a}+${p.b}`);
    assert.ok(Array.isArray(p.leitura.qualidadesA) && p.leitura.qualidadesA.length === 2, `${p.a}+${p.b}`);
  }
});

test('a DECLARAÇÃO de caracterologia acompanha toda leitura e nomeia o século e o autor', () => {
  // A tese (docs/tradicao/00-tese.md, prop. 3) põe "ariano é impulsivo" na mesma
  // tabela do tarô egípcio: coisa do séc. XX vendida como antiga. Escrever o
  // bloco 1 sem esta declaração seria o app cometendo o erro que ele cataloga.
  for (const p of PARES) {
    assert.equal(p.leitura.notaCaracterologia, S.NOTA_CARACTEROLOGIA, `${p.a}+${p.b}`);
  }
  const n = S.NOTA_CARACTEROLOGIA;
  assert.match(n, /caracterologia contempor[âa]nea/i);
  assert.match(n, /Alan Leo/);
  assert.match(n, /s[ée]culo XX/i);
  assert.match(n, /não está em Ptolomeu/i);
  // E ela tem que dizer o que VEM da fonte, senão vira autodepreciação vazia.
  assert.match(n, /I\.13/);
  assert.match(n, /I\.11/);
  assert.match(n, /I\.17/);
  assert.match(n, /Da Geração e Corrupção II\.3/);
  // Mais o recibo da leitura moderna de modalidade, que a seção 2 do motor
  // proíbe no bloco 2 e o bloco 1 usa — a contradição aparente precisa estar
  // resolvida por escrito, e está.
  assert.match(n, /leitura deste app/i);
  assert.ok(n.length > 900, 'a declaração encolheu a ponto de não declarar nada');
});

// ===========================================================================
// 14. A TELA — o bloco quente abre, o bloco da fonte fica atrás de um toque
// ===========================================================================

function fonteDaTela() {
  const fs = require('node:fs');
  const path = require('node:path');
  return fs.readFileSync(path.join(__dirname, '..', 'screens', 'CompatibilityScreen.js'), 'utf8');
}

test('a tela desenha o BLOCO 1 ANTES do bloco 2 — a ordem é o pedido inteiro', () => {
  const src = semComentarios(fonteDaTela());
  const bloco1 = src.indexOf('DIMENSOES_VIDA_REAL.map');
  const toggle = src.indexOf('setShowSource');
  const bloco2 = src.indexOf('result.verbatins.map');
  assert.ok(bloco1 > 0, 'a tela não itera as dimensões do motor');
  assert.ok(toggle > 0, 'a tela não tem o recolhimento do bloco 2');
  assert.ok(bloco1 < bloco2, 'o bloco da fonte voltou pra frente do bloco quente');
  const chamada = src.indexOf('result.chamada');
  assert.ok(chamada > 0 && chamada < bloco2, 'a chamada não abre a leitura');
  // E o bloco 2 tem que estar de fato atrás do toggle, não só depois dele.
  assert.match(src, /\{result && showSource && \(/, 'o bloco 2 não está condicionado ao toque');
});

test('a tela não escreve o conteúdo do bloco 1 à mão — ela itera o motor', () => {
  // Se um dia alguém copiar as cinco dimensões para dentro do JSX, elas param
  // de acompanhar lib/synastry.js e a próxima dimensão nasce invisível.
  const src = semComentarios(fonteDaTela());
  assert.match(src, /DIMENSOES_VIDA_REAL\.map\(/);
  assert.match(src, /result\.vidaReal\[d\.id\]/);
  assert.match(src, /t\(d\.chaveTitulo\)/);
  for (const titulo of ['Química e cama', 'Convivência', 'O que segura a longo prazo']) {
    assert.ok(!src.includes(titulo), `o título "${titulo}" foi escrito à mão na tela em vez de vir do dicionário`);
  }
});

test('a tela continua renderizando TODA peça do bloco 2 — nada foi recolhido para o nada', () => {
  const src = semComentarios(fonteDaTela());
  const PECAS = [
    ['result.aspecto', 'o nome do aspecto'],
    ['result.graus', 'a geometria em graus'],
    ['result.distancia', 'a distância em signos'],
    ['result.categoria', 'a categoria da fonte'],
    ['MANCHETE[result.categoriaId]', 'a manchete da categoria'],
    ['result.texto', 'a leitura longa'],
    ['result.forte', 'o ponto forte'],
    ['result.cuidado', 'a atenção'],
    ['result.caminho', 'o caminho prático que acompanha a atenção'],
    ['result.verbatins.map', 'os verbatins de Robbins'],
    ['v.parafrase', 'a paráfrase em português'],
    ['v.texto', 'o inglês de Robbins'],
    ['v.locus', 'o locus da citação'],
    ["t('compat.paraphrase.label')", 'o rótulo que impede a paráfrase de virar citação'],
    ['result.grau', 'o grau de IV.7'],
    ['result.grauNome', 'o nome do degrau'],
    ['result.notaGrau', 'a ressalva do grau'],
    ['result.notaEscala', 'a ressalva da porcentagem ausente'],
    ['result.ressalvaSignoSolar', 'a ressalva do signo solar'],
    ['result.notaCaracterologia', 'a declaração de caracterologia'],
  ];
  for (const [peca, oque] of PECAS) {
    assert.ok(src.includes(peca), `a tela deixou de mostrar ${oque} (${peca})`);
  }
  // O aspecto e a categoria continuam visíveis com o bloco 2 FECHADO: recolher
  // a fonte é tirá-la da abertura, não escondê-la.
  const linhaDoToggle = src.slice(src.indexOf('sourceToggle'), src.indexOf('result && showSource'));
  assert.match(linhaDoToggle, /result\.aspecto/, 'com o bloco fechado, o nome do aspecto some da tela');
  assert.match(linhaDoToggle, /result\.categoria/, 'com o bloco fechado, a categoria some da tela');
});

test('os rótulos dos dois blocos existem nos três idiomas', () => {
  const { _DICTS_FOR_TESTS, LANGUAGES } = require('../lib/i18n.js');
  const chaves = [
    ...S.DIMENSOES_VIDA_REAL.map((d) => d.chaveTitulo),
    'compat.real.kicker',
    'compat.real.title',
    'compat.real.footnote',
    'compat.source.toggle',
    'compat.source.caracterologia',
  ];
  for (const lang of LANGUAGES) {
    for (const k of chaves) {
      const v = _DICTS_FOR_TESTS[lang][k];
      assert.ok(typeof v === 'string' && v.trim() !== '', `${k} falta em ${lang}`);
      assert.ok(!v.includes('%'), `${lang}/${k} trouxe porcentagem de volta`);
      for (const [re, motivo] of FATALISMO) assert.ok(!re.test(v), `${lang}/${k} — ${motivo}`);
    }
  }
});

// ===========================================================================
// 15. O CAMINHO — o par difícil sai com o que fazer, e não só com o diagnóstico
// ===========================================================================
// Feedback do dono, 04/08/2026: "nos pares difíceis o app já fala a real
// (mantém!) — mas agora TODO par difícil precisa sair com um caminho prático de
// convivência". O `cuidado` da quadratura é um dos melhores textos do app e
// termina em "este app não decide por você" — verdadeiro, e ainda assim uma
// porta fechada: a pessoa fecha a tela sabendo exatamente onde dói e nada sobre
// o que fazer na terça-feira. Estes testes travam as duas metades da correção:
// que o caminho EXISTE em todo par tenso, e que ele não virou promessa no
// caminho (que é como conselho honesto apodrece).

test('TODO par tenso tem caminho, e nenhum par sem atrito recebe conselho que não pediu', () => {
  const tensos = PARES.filter((p) => S.CATEGORIAS_COM_CAMINHO.includes(p.leitura.categoriaId));
  // 24 quadraturas + 12 oposições + 48 aversões = 84 dos 144. A conta está aqui
  // porque "difícil" é uma DEFINIÇÃO, e definição que muda em silêncio é como a
  // tabela antiga colocou a oposição no topo sem ninguém notar.
  assert.equal(tensos.length, 84);
  assert.deepEqual(
    [...new Set(tensos.map((p) => p.leitura.id))].sort(),
    ['aversao150', 'aversao30', 'oposicao', 'quadratura']
  );
  for (const p of tensos) {
    const c = p.leitura.caminho;
    assert.equal(typeof c, 'string', `${p.a}+${p.b} (${p.leitura.id}) sem caminho`);
    assert.ok(c.trim().length >= 200, `${p.a}+${p.b}: caminho com ${c.length} caracteres`);
    const n = frases(c);
    assert.ok(n >= 2 && n <= 4, `${p.a}+${p.b}: caminho com ${n} frases — ${n < 2 ? 'bullet' : 'ensaio'}`);
  }
  for (const p of PARES.filter((x) => !S.CATEGORIAS_COM_CAMINHO.includes(x.leitura.categoriaId))) {
    assert.equal(p.leitura.caminho, null, `${p.a}+${p.b} (${p.leitura.categoriaId}) ganhou caminho sem ter atrito`);
  }
  // E o motor tem que declarar quais categorias são tensas — se a tela ou o
  // teste tiverem que adivinhar, um dia adivinham diferente.
  assert.deepEqual([...S.CATEGORIAS_COM_CAMINHO].sort(), ['desarmonico', 'semAspecto']);
});

// A linha vermelha DO CAMPO. Mesma forma das listas do topo do arquivo: cada
// entrada com o motivo de estar aqui. O tom pedido é "costuma ajudar", "vale
// tentar" — nunca "vai resolver". A diferença entre os dois é a diferença entre
// descrever um gesto e vender um resultado, e é ela que este bloco protege.
const PROMESSA = [
  [/\b(vai|vão|irá|irão) (resolver|consertar|salvar|acabar com|dar certo|funcionar|melhorar)\b/i, 'futuro garantido'],
  [/\bgarant(e|em|ido|ida|ia)\b|\bprometemos\b|\bcom certeza\b/i, 'garantia explícita'],
  [/\bbasta (fazer|dizer|combinar|marcar)\b|\bé só (fazer|dizer|combinar|marcar)\b/i, 'promessa de suficiência'],
  [/\bsempre funciona\b|\bnunca falha\b|\bresolve o problema\b/i, 'infalibilidade'],
  [/\bdeixa de ser (um )?problema\b|\bo atrito (some|acaba|passa)\b/i, 'o atrito prometido como extinto'],
];

test('nenhum caminho promete — o gesto é descrito, o resultado nunca é vendido', () => {
  for (const p of PARES.filter((x) => x.leitura.caminho)) {
    for (const [re, motivo] of PROMESSA) {
      assert.ok(!re.test(p.leitura.caminho), `${p.a}+${p.b} — ${motivo}: ${p.leitura.caminho.match(re)}`);
    }
    // E toda proposta vem ressalvada: sem hedge, gesto vira receita.
    assert.match(p.leitura.caminho, /\bcostum(a|am)\b|\braramente\b|\bquase nunca\b/i, `${p.a}+${p.b}: caminho sem ressalva`);
  }
  // Contrapartida: se a varredura não morde, ela não protege ninguém.
  assert.ok(PROMESSA.some(([re]) => re.test('combinar isso antes vai resolver a briga')));
  assert.ok(PROMESSA.some(([re]) => re.test('basta combinar quem decide o quê')));
  assert.ok(PROMESSA.some(([re]) => re.test('depois disso o atrito some')));
  // E não morde o tom que o app de fato usa.
  assert.ok(!PROMESSA.some(([re]) => re.test('combinar antes quem decide o quê costuma render mais do que acertar no calor da hora')));
});

test('o caminho é CONCRETO — propõe um gesto, não um adjetivo', () => {
  // "aprendam a se comunicar" não é caminho, é elogio ao problema. O teste não
  // consegue medir concretude, mas consegue medir o oposto: a lista abaixo é do
  // vocabulário de autoajuda que aparece quando ninguém teve o que dizer.
  const VAZIO = [
    [/aprend(er|am?) a se comunicar|melhor(ar|em?) a comunicação/i, 'adjetivo com cara de conselho'],
    [/ten(ha|ham|ho) mais paciência|sejam? mais (compreensiv|tolerant|paciente)/i, 'conselho que não descreve gesto nenhum'],
    [/o amor vence|com amor tudo|se amarem de verdade/i, 'clichê no lugar do gesto'],
    [/trabalhem? a relação|invistam? na relação/i, 'verbo de palestra'],
  ];
  for (const p of PARES.filter((x) => x.leitura.caminho)) {
    for (const [re, motivo] of VAZIO) {
      assert.ok(!re.test(p.leitura.caminho), `${p.a}+${p.b} — ${motivo}: ${p.leitura.caminho.match(re)}`);
    }
  }
  assert.ok(VAZIO.some(([re]) => re.test('vocês precisam aprender a se comunicar')));
});

test('o caminho da quadratura usa Lilly — a melhor fonte da tradição pra isso, e o app não a usava', () => {
  // docs/tradicao/02-aspectos-e-sinastria.md §2.4: Lilly chama a quadratura de
  // "imperfect enmity" e, no exemplo horário da MESMA página, tira daí que "the
  // matter is not yet so farre gone, but there may be hopes of reconciliation
  // betwixt them". Briga com conserto possível, dito em 1647 — e até 04/08/2026
  // o app citava Lilly só pra ordenar trígono e sextil. A citação fica em inglês
  // (regra 1: traduzir citação é falsificá-la) com a glosa ao lado.
  for (const p of porId('quadratura')) {
    const c = p.leitura.caminho;
    assert.match(c, /imperfect enmity/, `${p.a}+${p.b} perdeu o verbatim de Lilly`);
    assert.match(c, /inimizade imperfeita/, `${p.a}+${p.b} deixou o inglês sem glosa`);
    assert.match(c, /Christian Astrology, Londres, 1647, p\. 106/, `${p.a}+${p.b} citou Lilly sem o locus completo`);
    assert.match(c, /reconciliação possível/, `${p.a}+${p.b} não diz o que a citação implica`);
  }
  // A quadratura de contrários absolutos e a de fio em comum não recebem o mesmo
  // caminho: o terreno neutro existe numa e não existe na outra, e é justamente
  // isso que muda o que dá pra fazer.
  const contrarios = porId('quadratura').filter((p) => p.leitura.qualidadesEmComum.length === 0);
  const comFio = porId('quadratura').filter((p) => p.leitura.qualidadesEmComum.length === 1);
  assert.ok(contrarios.length > 0 && comFio.length > 0);
  assert.notEqual(contrarios[0].leitura.caminho, comFio[0].leitura.caminho);
  assert.match(comFio[0].leitura.caminho, /fio em comum/, 'a quadratura com qualidade em comum não nomeia o fio');
});

test('o caminho da oposição parte do eixo, e da qualidade que os dois COMPARTILHAM', () => {
  // O erro que este arquivo inteiro existe pra impedir seria voltar aqui: propor
  // "convivência" pra oposição explicando-a por elementos incompatíveis. Signos
  // opostos compartilham uma qualidade — é aritmética, está no teste da seção 4,
  // e é o único terreno comum conferível que este par tem.
  for (const p of porId('oposicao')) {
    const c = p.leitura.caminho;
    assert.match(c, /eixo/, `${p.a}+${p.b}: o caminho da oposição não parte do eixo`);
    assert.match(c, /compartilham o /, `${p.a}+${p.b}: o caminho não usa a qualidade em comum`);
    assert.match(c, new RegExp(p.leitura.qualidadesEmComum[0]), `${p.a}+${p.b}: nomeia outra qualidade que não a do par`);
    assert.match(c, /leitura deste app/, `${p.a}+${p.b}: usa Aristóteles sem admitir que a aplicação é nossa`);
  }
});

test('as duas aversões têm caminhos DIFERENTES — 30° e 150° não colapsam nem no conselho', () => {
  // ID_POR_DISTANCIA separa aversao30 de aversao150 justamente porque a tabela
  // antiga as colapsava. O campo novo não pode reabrir a porta.
  const a30 = porId('aversao30')[0].leitura.caminho;
  const a150 = porId('aversao150')[0].leitura.caminho;
  assert.notEqual(a30, a150);
  // O vizinho de 30° não tem assunto pronto — o caminho é explicitar o que
  // ficaria subentendido. O de 150° não tem encontro nenhum — o caminho é criar
  // o ponto de encontro. São problemas diferentes e saídas diferentes.
  assert.match(a30, /subentendido/);
  assert.match(a150, /ponto fixo na semana/);
  // E os dois se apoiam na fonte: IV.7 (o laço tem tipo) e I.16 (não há
  // familiaridade), com a aplicação prática assinada como nossa.
  assert.match(a30, /Tetrabiblos IV\.7/);
  assert.match(a150, /Tetrabiblos I\.16/);
  for (const c of [a30, a150]) assert.match(c, /leitura deste app/);
});

test('a tela põe o caminho COLADO na atenção, e só onde ele existe', () => {
  const src = semComentarios(fonteDaTela());
  const cuidado = src.indexOf('result.cuidado');
  // A PARTIR da atenção, e não do começo do arquivo: desde o eco (04/08/2026,
  // tarde) `result.caminho` aparece DUAS vezes na tela — a primeira no bloco 1,
  // que é a correção nova, e a segunda aqui embaixo. Medir a primeira faria este
  // teste acusar o eco de ter "subido o caminho pra antes da atenção", que é
  // exatamente o contrário do que aconteceu: o caminho não saiu do lugar.
  const caminho = src.indexOf('result.caminho', cuidado);
  assert.ok(caminho > 0, 'a tela não mostra o caminho no bloco 2');
  assert.ok(caminho > cuidado, 'o caminho saiu de dentro do card da atenção');
  // Entre um e outro não pode entrar outro card: a saída tem que ler como
  // continuação da atenção, não como bloco solto lá embaixo.
  const entre = src.slice(cuidado, caminho);
  assert.ok(!entre.includes('styles.traitCard'), 'o caminho caiu num card separado da atenção');
  assert.ok(!entre.includes('styles.noteCard'), 'o caminho ficou depois das ressalvas');
  // E é condicional: trígono e co-presença não têm caminho, e a tela não pode
  // renderizar um <Text> vazio no lugar. Vale pras DUAS aparições.
  const guardas = (src.match(/\{!!result\.caminho &&/g) || []).length;
  assert.equal(guardas, 2, 'alguma aparição do caminho na tela ficou sem checar se ele existe');
  // O texto vem do motor, não da tela — senão sai em português pro mundo todo.
  assert.ok(!/caminho[A-Za-z]*\s*=\s*['"]/.test(src), 'a tela escreveu caminho à mão');
});

// ---------------------------------------------------------------------------
// O ECO — a saída também aparece no bloco que ABRE
// ---------------------------------------------------------------------------
// O defeito que este bloco trava é de ALCANCE, não de conteúdo: o caminho estava
// escrito, testado nos três idiomas e renderizado — dentro do bloco 2, que nasce
// recolhido. Quem não toca em "De onde vem isso" lia o diagnóstico inteiro e
// nunca via a saída. É o mesmo padrão que test/quentePrimeiroNasTelas.test.js
// existe pra pegar: o motor conforme, a tela escondendo.

test('o ECO do caminho abre no bloco 1, e só nos pares que têm caminho', () => {
  const src = semComentarios(fonteDaTela());
  const dimensoes = src.indexOf('DIMENSOES_VIDA_REAL.map');
  const eco = src.indexOf('ecoDoCaminho(result.caminho');
  const toggle = src.indexOf('styles.sourceToggle');
  const cuidado = src.indexOf('result.cuidado');
  assert.ok(eco > 0, 'o eco do caminho sumiu do bloco 1 — o par difícil voltou a sair sem saída visível');
  assert.ok(eco > dimensoes, 'o eco vem antes das cinco dimensões — conselho antes do diagnóstico');
  assert.ok(eco < toggle, 'o eco caiu para fora do bloco 1, depois do ponteiro pro bloco 2');
  assert.ok(eco < cuidado, 'o eco não está no bloco quente: ele nasceu justamente pra não depender do toque');
  // Condicional pelo MOTOR: par harmônico não recebe mini-card de conselho.
  // A âncora é a guarda imediatamente antes do eco no código.
  const antesDoEco = src.slice(dimensoes, eco);
  assert.match(antesDoEco, /\{!!result\.caminho &&/, 'o eco é renderizado sem checar se o par tem caminho');
  // Rótulo e recorte vêm do motor. Escrever qualquer um dos dois na tela é
  // reabrir o defeito que a extração de 31/07 fechou: português pro mundo todo.
  assert.match(src, /rotuloDoCaminho\(lang\)/, 'o rótulo do eco não vem do pack do idioma');
  assert.match(src, /ecoDoCaminho\(result\.caminho, lang\)/, 'o eco não é recortado pelo motor, no idioma da leitura');
  assert.match(
    src,
    /import \{[^}]*ecoDoCaminho[^}]*rotuloDoCaminho[^}]*\} from '\.\.\/lib\/synastry\.js'/,
    'a tela não importa o eco do motor'
  );
});

test('o eco é PORTA, não resumo — o toque abre o bloco 2 e vai até o caminho inteiro', () => {
  // Um eco que só mostra a primeira frase e não leva a lugar nenhum troca um
  // problema por outro: a pessoa passa a saber que existe mais e não acha.
  const src = semComentarios(fonteDaTela());
  assert.match(src, /onPress=\{abrirOCaminho\}/, 'o eco não é tocável');
  const handler = src.slice(src.indexOf('const abrirOCaminho'), src.indexOf('if (!hasAccess && locked && !result)'));
  assert.ok(handler.length > 100, 'o parser do handler do eco quebrou');
  assert.match(handler, /setShowSource\(true\)/, 'o toque no eco não abre o bloco 2');
  assert.match(handler, /rolarAteOCaminho\(\)/, 'o toque no eco abre o bloco 2 mas larga a pessoa longe do caminho');
  // E a rolagem mira o card da ATENÇÃO, que é onde o caminho mora — medido no
  // onLayout dele, porque a altura muda com o par, o idioma e a tela.
  assert.match(src, /onLayout=\{\(e\) => \{/, 'a tela não mede onde o caminho está');
  assert.match(src, /caminhoY\.current = e\.nativeEvent\.layout\.y/, 'a medida do caminho sumiu');
  assert.match(src, /scrollRef\.current\.scrollTo\(/, 'a tela não rola até o caminho');
  assert.match(src, /<ScrollView ref=\{scrollRef\}/, 'o rolo da tela não tem referência — o scrollTo nunca acontece');
});

test('o motor entrega o eco só onde há caminho, e ele é recorte do caminho — nunca texto novo', () => {
  // A regra do eco é a mesma do caminho, e ela mora no motor: 84 dos 144 pares.
  // O que o eco NÃO pode ser é um texto próprio — nesse dia o app passaria a ter
  // duas versões do mesmo conselho, e a segunda sem nenhum dos testes da seção.
  const comEco = PARES.filter((p) => S.ecoDoCaminho(p.leitura.caminho) !== null);
  assert.equal(comEco.length, 84, 'a contagem de pares com eco divergiu da de pares com caminho');
  for (const p of comEco) {
    const eco = S.ecoDoCaminho(p.leitura.caminho);
    assert.ok(p.leitura.caminho.includes(eco), `${p.a}+${p.b}: o eco não é um trecho do caminho`);
    assert.equal(frases(eco), 1, `${p.a}+${p.b}: o eco tem ${frases(eco)} frases — é a PRIMEIRA, não o caminho inteiro`);
    assert.ok(eco.length >= 100, `${p.a}+${p.b}: o eco com ${eco.length} caracteres virou etiqueta`);
    assert.ok(eco.length < p.leitura.caminho.length, `${p.a}+${p.b}: o eco engoliu o caminho inteiro`);
    // A abertura sai do corpo porque ela É o rótulo do card — dizer duas vezes
    // na mesma dobra é o que o recorte existe pra impedir.
    assert.ok(!eco.startsWith(S.rotuloDoCaminho()), `${p.a}+${p.b}: o eco repete o rótulo do card`);
    assert.ok(!eco.includes('Por onde começar'), `${p.a}+${p.b}: a abertura ficou no corpo do eco`);
    // E o eco carrega a ressalva: sem ela, a frase que abre o bloco quente vira
    // receita — que é o modo como conselho honesto apodrece.
    assert.match(eco, /\bcostum(a|am)\b|\braramente\b|\bquase nunca\b/i, `${p.a}+${p.b}: o eco perdeu a ressalva do caminho`);
  }
  // Par sem atrito não recebe eco, pelo mesmo motivo que não recebe caminho.
  for (const p of PARES.filter((x) => !S.CATEGORIAS_COM_CAMINHO.includes(x.leitura.categoriaId))) {
    assert.equal(S.ecoDoCaminho(p.leitura.caminho), null, `${p.a}+${p.b} (${p.leitura.categoriaId}) ganhou eco sem ter atrito`);
  }
  assert.equal(S.ecoDoCaminho(null), null);
  assert.equal(S.ecoDoCaminho(''), null);
});

test('o Diário Cósmico passa a guardar o BLOCO 1, que é o que a pessoa leu', () => {
  // Guardar o verbatim de Robbins no diário do usuário seria arquivar a nota de
  // rodapé e jogar fora a leitura. O título continua com o aspecto — é o que o
  // app calcula de fato e não envelhece quando a escala mudar.
  const src = semComentarios(fonteDaTela());
  // O corte tem que ancorar na CHAMADA de markFeatureUsedOnce, não no import
  // dela lá em cima — senão a fatia sai vazia e o teste passa verde sem olhar
  // nada (achado rodando a primeira versão deste próprio teste).
  const bloco = src.slice(src.indexOf('recordReadingCompletion({'), src.indexOf('markFeatureUsedOnce(FEATURE_KEY)'));
  assert.ok(bloco.length > 100, 'o parser do bloco do Diário quebrou');
  assert.match(bloco, /compat\.chamada/, 'o diário não guarda a chamada');
  assert.match(bloco, /compat\.vidaReal\[d\.id\]/, 'o diário não guarda as cinco dimensões');
  assert.match(bloco, /compat\.aspecto/, 'o título do diário perdeu o aspecto');
});
