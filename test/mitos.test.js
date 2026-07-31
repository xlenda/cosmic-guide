// O catálogo Mito × Fonte — os testes que o seguram.
//
// Cinco trabalhos, e nenhum é enfeite:
//
// (a) CATÁLOGO MÍNIMO: 20+ mitos, ids únicos, todos os campos preenchidos e
//     fonte não-vazia com ano ou século — mito sem recibo é exatamente o que
//     esta feature existe pra combater.
//
// (b) ENDEREÇO NA BASE: cada mito aponta um arquivo REAL de docs/tradicao/
//     com locus. O teste abre o caminho — afirmação histórica sem endereço
//     verificável não entra (regra de ouro nº 1 da base).
//
// (c) VARREDURA DE VOCABULÁRIO PROIBIDO em todo texto visível, incluindo o
//     compartilhável: alegação de saúde (regra de PALAVRA — "aliviar",
//     "acalmar", "curar", "tratar", "energizar" e vizinhos), promessa de
//     resultado, mecanismo pseudocientífico, aviso defensivo ("não garante")
//     e a palavra banida por docs/tradicao/06 §2 ("cigana" não entra em texto
//     nenhum do app). Falha aqui = não publica.
//
// (d) PRENDE PRIMEIRO, FONTE DEPOIS: os primeiros 60 caracteres de `detalhe`
//     não podem conter ano de quatro dígitos nem "séc." — mesma régua de
//     lib/rituais.js. E o detalhe tem 2–3 frases, tamanho de card, não de
//     artigo.
//
// (e) OS DOIS CONTRATOS DA TELA: o texto compartilhável TERMINA no link
//     (cosmicguide.cloud), e o mito do dia é DETERMINÍSTICO — mesmo dia,
//     mesmo mito, em qualquer hora e qualquer aparelho.
//
// Por que teste e não revisão: o risco não é errar hoje, é alguém daqui a
// três meses "melhorar" um card pra converter mais e o catálogo virar a
// mesma sopa sem fonte que ele existe pra desmentir.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

// --- fake do AsyncStorage, injetado ANTES do módulo sob teste ---------------
// lib/mitos.js guarda os mitos vistos via lib/storage.js, e lib/storage.js
// memoriza o módulo na primeira chamada — mesma armadilha documentada em
// test/rituais.test.js e test/jornada.test.js. E o fake sabe QUEBRAR: o
// cenário que interessa não é "não tem storage" e sim "a chamada estoura".
const memStorage = new Map();
let storageQuebrado = false;

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      if (storageQuebrado) throw new Error('SecurityError: storage access denied');
      return memStorage.has(k) ? memStorage.get(k) : null;
    },
    async setItem(k, v) {
      if (storageQuebrado) throw new Error('QuotaExceededError');
      memStorage.set(k, String(v));
    },
    async removeItem(k) {
      if (storageQuebrado) throw new Error('SecurityError: storage access denied');
      memStorage.delete(k);
    },
  },
};

const carregarOriginal = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return carregarOriginal.call(this, request, parent, isMain);
};

const {
  MITOS,
  LINK_COMPARTILHAR,
  CHAVE_MITOS_VISTOS,
  mitoPorId,
  indiceDoMitoDoDia,
  mitoDoDia,
  textoCompartilhavel,
  lerMitosVistos,
  marcarMitoVisto,
} = require('../lib/mitos.js');

// Mesma instância de lib/storage.js que lib/mitos.js carregou — necessária pra
// baixar a flag `_semDisco`, que é de sessão de propósito.
const storageLib = require('../lib/storage.js');

const RAIZ = path.join(__dirname, '..');

// ---------------------------------------------------------------------------
// (a) O catálogo mínimo
// ---------------------------------------------------------------------------
test('há no mínimo 20 mitos, com ids únicos', () => {
  assert.ok(MITOS.length >= 20, `só ${MITOS.length} mitos — o mínimo do briefing é 20`);
  const ids = MITOS.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, 'id duplicado no catálogo');
  for (const id of ids) {
    assert.match(id, /^[a-z0-9-]+$/, `id fora do padrão kebab-case: "${id}"`);
  }
});

test('todo mito tem os campos obrigatórios preenchidos', () => {
  for (const m of MITOS) {
    for (const campo of ['id', 'oQueTeContaram', 'oQueAFonteDiz', 'fonte', 'detalhe']) {
      assert.ok(
        typeof m[campo] === 'string' && m[campo].trim().length > 0,
        `${m.id || '(sem id)'}: campo "${campo}" vazio ou ausente`
      );
    }
  }
});

test('toda fonte é não-vazia e traz ano ou século — recibo de verdade, não etiqueta', () => {
  for (const m of MITOS) {
    assert.ok(m.fonte.trim().length >= 10, `${m.id}: fonte curta demais pra ser um recibo`);
    assert.ok(
      /\d{3,4}|séc\./.test(m.fonte),
      `${m.id}: fonte sem ano nem século: "${m.fonte}"`
    );
  }
});

// ---------------------------------------------------------------------------
// (b) O endereço na base de tradição
// ---------------------------------------------------------------------------
test('todo mito aponta um arquivo REAL de docs/tradicao/ com locus', () => {
  for (const m of MITOS) {
    assert.ok(m.base && typeof m.base === 'object', `${m.id}: sem campo base`);
    assert.match(
      m.base.arquivo || '',
      /^docs\/tradicao\//,
      `${m.id}: base.arquivo fora de docs/tradicao/: "${m.base.arquivo}"`
    );
    const caminho = path.join(RAIZ, m.base.arquivo);
    assert.ok(fs.existsSync(caminho), `${m.id}: arquivo da base não existe: ${m.base.arquivo}`);
    assert.ok(
      typeof m.base.locus === 'string' && m.base.locus.trim().length > 0,
      `${m.id}: base.locus vazio — endereço sem número de porta`
    );
  }
});

// ---------------------------------------------------------------------------
// (c) A linha vermelha — vocabulário proibido, regra de PALAVRA
// ---------------------------------------------------------------------------
// Saúde (as cinco palavras nomeadas na regra, mais os vizinhos que a régua de
// lib/rituais.js já proíbe), promessa de resultado, mecanismo pseudocientífico,
// aviso defensivo e a palavra banida de docs/tradicao/06 §2.
const PROIBIDOS = [
  [/\balivi\w*/iu, 'alegação de saúde (aliviar)'],
  [/\bacalm\w*/iu, 'alegação de saúde (acalmar)'],
  [/\bcur(?:a|ar|am|ou|ando|ada?s?|ado?s?)\b/iu, 'alegação de saúde (curar)'],
  [/\btrat(?:a|ar|am|ou|ando|amentos?)\b/iu, 'alegação de saúde (tratar)'],
  [/\benergiz\w*/iu, 'alegação de saúde (energizar)'],
  [/\brelax\w*/iu, 'alegação de saúde (relaxar)'],
  [/\bequilibr\w*/iu, 'alegação de saúde (equilibrar)'],
  [/\bharmoniz\w*/iu, 'alegação de saúde (harmonizar)'],
  [/\bgarant\w*/iu, 'promessa ou aviso defensivo (garantir/não garante)'],
  [/vai atrair/iu, 'promessa de resultado'],
  [/abre caminhos/iu, 'promessa de resultado'],
  [/\bdestrav\w*/iu, 'promessa de resultado'],
  [/\bproteg\w*/iu, 'promessa de resultado (proteger)'],
  [/\bafast\w*/iu, 'promessa de resultado (afastar)'],
  [/\benergia\b/iu, 'mecanismo pseudocientífico'],
  [/\bvibra\w*/iu, 'mecanismo pseudocientífico'],
  [/\bcigan\w*/iu, 'palavra banida por docs/tradicao/06 §2 — não entra em texto nenhum'],
];

// Tudo que a pessoa pode ler: os quatro campos de texto de cada mito e o
// texto compartilhável (que inclui o recibo montado).
function todoTextoVisivel() {
  const saida = [];
  for (const m of MITOS) {
    saida.push([`${m.id}.oQueTeContaram`, m.oQueTeContaram]);
    saida.push([`${m.id}.oQueAFonteDiz`, m.oQueAFonteDiz]);
    saida.push([`${m.id}.fonte`, m.fonte]);
    saida.push([`${m.id}.detalhe`, m.detalhe]);
    saida.push([`${m.id}.compartilhar`, textoCompartilhavel(m)]);
  }
  return saida;
}

test('nenhum texto visível usa palavra proibida — saúde, promessa, mecanismo, veredito', () => {
  const violacoes = [];
  for (const [origem, texto] of todoTextoVisivel()) {
    for (const [re, motivo] of PROIBIDOS) {
      const m = texto.match(re);
      if (m) violacoes.push(`${origem}: "${m[0]}" (${motivo})`);
    }
  }
  assert.deepEqual(violacoes, [], `vocabulário proibido:\n${violacoes.join('\n')}`);
});

// ---------------------------------------------------------------------------
// (d) Prende primeiro, fonte depois
// ---------------------------------------------------------------------------
test('os primeiros 60 caracteres do detalhe não trazem ano nem século', () => {
  for (const m of MITOS) {
    const abertura = m.detalhe.slice(0, 60);
    assert.ok(
      !/séc\.|\b1[0-9]{3}\b|\b20[0-2][0-9]\b/.test(abertura),
      `${m.id}: o detalhe abre no recibo em vez de abrir na vida real: "${abertura}..."`
    );
  }
});

// Contagem de frases tolerante às abreviações da casa (séc., a.C., d.C., c.
// de circa e iniciais de autor) — sem isso "410 a.C." viraria duas frases.
function contarFrases(texto) {
  const limpo = texto
    .replace(/\ba\.C\./g, 'aC')
    .replace(/\bd\.C\./g, 'dC')
    .replace(/\bséc\./g, 'séc')
    .replace(/\bc\.\s/g, 'c ')
    .replace(/\b[A-Z]\.\s?/g, 'X');
  return limpo.split(/[.!?…]+(?:\s+|$)/).filter((f) => f.trim().length > 0).length;
}

test('o detalhe tem 2–3 frases — tamanho de card, não de artigo', () => {
  for (const m of MITOS) {
    const n = contarFrases(m.detalhe);
    assert.ok(n >= 2 && n <= 3, `${m.id}: detalhe com ${n} frase(s) — o card pede 2 a 3`);
    assert.ok(m.detalhe.length <= 500, `${m.id}: detalhe com ${m.detalhe.length} chars — longo demais pra card`);
  }
});

// ---------------------------------------------------------------------------
// (e.1) O texto compartilhável termina no link
// ---------------------------------------------------------------------------
test('todo texto compartilhável termina no link cosmicguide.cloud', () => {
  assert.ok(
    typeof LINK_COMPARTILHAR === 'string' && LINK_COMPARTILHAR.includes('cosmicguide.cloud'),
    'LINK_COMPARTILHAR não aponta pra cosmicguide.cloud'
  );
  for (const m of MITOS) {
    const texto = textoCompartilhavel(m);
    assert.ok(texto.endsWith(LINK_COMPARTILHAR), `${m.id}: compartilhável não termina no link`);
    // E o mito precisa estar reconhecível no texto — compartilhar só o link é spam.
    assert.ok(texto.includes(m.oQueTeContaram), `${m.id}: compartilhável sem o mito`);
    assert.ok(texto.includes(m.fonte), `${m.id}: compartilhável sem o recibo`);
  }
});

test('textoCompartilhavel aceita id e devolve vazio pra mito inexistente', () => {
  const porId = textoCompartilhavel(MITOS[0].id);
  const porObjeto = textoCompartilhavel(MITOS[0]);
  assert.equal(porId, porObjeto);
  assert.equal(textoCompartilhavel('nao-existe'), '');
  assert.equal(textoCompartilhavel(null), '');
});

// ---------------------------------------------------------------------------
// (e.2) Mito do dia determinístico
// ---------------------------------------------------------------------------
test('mesmo dia = mesmo mito, em qualquer hora do dia', () => {
  const manha = new Date(2026, 6, 31, 6, 12);
  const noite = new Date(2026, 6, 31, 23, 58);
  assert.equal(mitoDoDia(manha).id, mitoDoDia(noite).id);
  // E chamadas repetidas com a mesma data não mudam nada.
  assert.equal(mitoDoDia(manha).id, mitoDoDia(new Date(2026, 6, 31)).id);
});

test('ao longo de um ano, o índice fica no intervalo e o rodízio varia de verdade', () => {
  const distintos = new Set();
  for (let i = 0; i < 366; i++) {
    const d = new Date(2026, 0, 1 + i);
    const idx = indiceDoMitoDoDia(d);
    assert.ok(Number.isInteger(idx) && idx >= 0 && idx < MITOS.length, `índice fora do catálogo em ${d}`);
    distintos.add(idx);
  }
  // Sem exigir distribuição perfeita — só que não seja o mesmo card o ano todo.
  assert.ok(distintos.size >= 10, `só ${distintos.size} mitos distintos em 366 dias — o hash degenerou`);
});

test('mitoDoDia() sem argumento devolve um mito do catálogo', () => {
  const m = mitoDoDia();
  assert.ok(m && mitoPorId(m.id), 'mitoDoDia() devolveu algo fora do catálogo');
});

// ---------------------------------------------------------------------------
// Mitos vistos — leitura limpa, deduplicação e disco quebrado
// ---------------------------------------------------------------------------
test.beforeEach(() => {
  memStorage.clear();
  storageQuebrado = false;
  storageLib._reiniciarStorageParaTestes();
});

test('marcarMitoVisto acumula, deduplica e ignora id desconhecido', async () => {
  assert.deepEqual(await lerMitosVistos(), []);
  await marcarMitoVisto(MITOS[0].id);
  await marcarMitoVisto(MITOS[1].id);
  await marcarMitoVisto(MITOS[0].id); // repetido — não conta duas vezes
  await marcarMitoVisto('mito-que-nao-existe'); // desconhecido — não grava
  const vistos = await lerMitosVistos();
  assert.deepEqual(vistos, [MITOS[0].id, MITOS[1].id]);
});

test('leitura suja volta limpa: JSON inválido e ids que saíram do catálogo', async () => {
  memStorage.set(CHAVE_MITOS_VISTOS, 'isto nunca foi JSON');
  assert.deepEqual(await lerMitosVistos(), []);
  memStorage.set(
    CHAVE_MITOS_VISTOS,
    JSON.stringify([MITOS[2].id, 'id-removido-em-versao-antiga', MITOS[2].id, 42])
  );
  assert.deepEqual(await lerMitosVistos(), [MITOS[2].id]);
});

test('disco quebrado não lança nem perde a marca da sessão', async () => {
  storageQuebrado = true;
  // Nunca lança — lib/storage.js cai pra memória de sessão.
  const lista = await marcarMitoVisto(MITOS[3].id);
  assert.deepEqual(lista, [MITOS[3].id]);
  // E a leitura seguinte, na mesma sessão, ainda enxerga a marca.
  assert.deepEqual(await lerMitosVistos(), [MITOS[3].id]);
});
