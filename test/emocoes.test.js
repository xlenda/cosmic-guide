// A entrada por emoção — os testes que a seguram.
//
// Quatro trabalhos, e nenhum é enfeite:
//
// 1. TODO ESTADO CHEGA EM ALGUM LUGAR. Cada ponte aponta pra um destino
//    declarado, e cada destino carrega uma rota REAL de routes.js — importada,
//    não copiada. Renomear uma rota tem que quebrar aqui, não quebrar o botão
//    em produção. O Tarô, único fora da aba da Home, tem que vir marcado com
//    `abaPai`, senão o navigate() da tela falha em silêncio.
//
// 2. A PONTE É DE ASSUNTO, NÃO DE TRATAMENTO. Mesma régua de
//    test/rituais.test.js e test/grounding.test.js: vocabulário de SAÚDE,
//    PROMESSA e MECANISMO reprova em qualquer texto visível — mais o verbo
//    "ajudar", que nas outras bibliotecas não precisava de trava e aqui é
//    exatamente a armadilha ("o tarô ajuda com o que você sente" é ponte de
//    tratamento). O risco não é escrever errado hoje: é alguém, daqui a três
//    meses, "melhorar" uma ponte pra converter mais, e a porta virar promessa
//    terapêutica sem ninguém perceber.
//
// 3. SOFRIMENTO PESADO NÃO ENTRA NA LISTA. Luto, desespero, ideação, pânico:
//    a resposta certa pra essa pessoa não é uma feature, e um estado desse
//    peso adicionado aqui reprova o build. É de propósito.
//
// 4. A PONTE NÃO FAZ AFIRMAÇÃO HISTÓRICA. Autor, obra e século moram DENTRO
//    das features (que citam com locus da base docs/tradicao/); a porta só
//    aponta. "séc." ou ano de quatro dígitos numa ponte reprova — é o que
//    impede a citação sem lastro de entrar por aqui.
//
// Falha aqui = não publica.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ROUTES } = require('../routes.js');
const {
  ESTADOS,
  DESTINOS,
  estadoPorId,
  destinoDe,
  alvoDeNavegacao,
  textosVisiveis,
} = require('../lib/emocoes.js');

const RAIZ = path.join(__dirname, '..');
const TELA = fs.readFileSync(path.join(RAIZ, 'screens', 'ComoVoceTaScreen.js'), 'utf8');

const VALORES_DE_ROTA = new Set(Object.values(ROUTES));
const ABAS = new Set([
  ROUTES.HOME_TAB,
  ROUTES.TAROT_TAB,
  ROUTES.COMMUNITY_TAB,
  ROUTES.CHAT_TAB,
  ROUTES.PROFILE_TAB,
]);

// ---------------------------------------------------------------------------
// 1. Estrutura e destinos
// ---------------------------------------------------------------------------

test('a lista tem entre 10 e 14 estados, com ids únicos e fala de chip', () => {
  assert.ok(
    ESTADOS.length >= 10 && ESTADOS.length <= 14,
    `${ESTADOS.length} estados — o briefing pede 10 a 14`
  );
  const vistos = new Set();
  for (const e of ESTADOS) {
    assert.ok(e.id && !vistos.has(e.id), `id repetido ou vazio: ${e.id}`);
    vistos.add(e.id);
    assert.ok(typeof e.fala === 'string' && e.fala.trim().length >= 8, `${e.id}: fala vazia ou curta demais`);
    // Chip grande tocável ainda é chip: fala que não cabe vira parágrafo.
    assert.ok(e.fala.length <= 60, `${e.id}: fala longa demais pra um chip (${e.fala.length} chars)`);
    assert.ok(typeof e.emoji === 'string' && e.emoji.length > 0, `${e.id}: sem emoji de chip`);
  }
});

test('todo estado tem 1-2 pontes, cada uma com destino declarado e texto de verdade', () => {
  for (const e of ESTADOS) {
    assert.ok(Array.isArray(e.pontes) && e.pontes.length >= 1 && e.pontes.length <= 2,
      `${e.id}: ${e.pontes ? e.pontes.length : 0} pontes — o briefing pede 1-2`);
    const destinosDoEstado = new Set();
    for (const p of e.pontes) {
      assert.ok(DESTINOS[p.destino], `${e.id}: ponte pra destino inexistente "${p.destino}"`);
      assert.ok(!destinosDoEstado.has(p.destino), `${e.id}: destino repetido "${p.destino}"`);
      destinosDoEstado.add(p.destino);
      assert.ok(typeof p.texto === 'string' && p.texto.trim().length >= 40,
        `${e.id} → ${p.destino}: texto de ponte curto demais pra descrever o que a leitura cobre`);
    }
  }
});

test('todo destino carrega rota REAL de routes.js — e o Tarô vem marcado com a aba pai', () => {
  for (const [id, d] of Object.entries(DESTINOS)) {
    assert.ok(VALORES_DE_ROTA.has(d.rota), `${id}: rota "${d.rota}" não existe em routes.js`);
    assert.ok(d.rotulo && d.botao, `${id}: sem rótulo ou sem texto de botão`);
    if (d.abaPai !== undefined) {
      assert.ok(ABAS.has(d.abaPai), `${id}: abaPai "${d.abaPai}" não é uma aba do Tab.Navigator`);
    }
  }
  // O único destino fora da stack da Home é o Tarô — sem abaPai, o navigate()
  // da tela procuraria TAROT_MAIN na stack errada e falharia em silêncio.
  assert.equal(DESTINOS.taro.rota, ROUTES.TAROT_MAIN);
  assert.equal(DESTINOS.taro.abaPai, ROUTES.TAROT_TAB);
  for (const [id, d] of Object.entries(DESTINOS)) {
    if (d.rota === ROUTES.TAROT_MAIN) {
      assert.equal(d.abaPai, ROUTES.TAROT_TAB, `${id}: rota do Tarô sem abaPai`);
    }
  }
});

test('nenhum destino declarado está morto — todos são usados por algum estado', () => {
  const usados = new Set();
  for (const e of ESTADOS) for (const p of e.pontes) usados.add(p.destino);
  for (const id of Object.keys(DESTINOS)) {
    assert.ok(usados.has(id), `destino "${id}" declarado e nunca apontado — ou usa, ou tira`);
  }
});

test('os resolvedores fazem a ida e a volta', () => {
  for (const e of ESTADOS) assert.equal(estadoPorId(e.id), e);
  assert.equal(estadoPorId('nao-existe'), null);
  assert.equal(destinoDe('taro'), DESTINOS.taro);
  assert.equal(destinoDe('nao-existe'), null);

  // O Tarô navega pela ABA (navigator pai); o resto, pela rota da stack.
  assert.deepEqual(alvoDeNavegacao(DESTINOS.taro), { viaAbaPai: true, nome: ROUTES.TAROT_TAB });
  assert.deepEqual(alvoDeNavegacao(DESTINOS.horoscopo), { viaAbaPai: false, nome: ROUTES.HOROSCOPE });
  assert.deepEqual(alvoDeNavegacao(DESTINOS.diario), { viaAbaPai: false, nome: ROUTES.DIARY });
  assert.equal(alvoDeNavegacao(null), null);
  assert.equal(alvoDeNavegacao({ rotulo: 'sem rota' }), null);
});

// ---------------------------------------------------------------------------
// 2. A varredura — ponte de assunto, nunca de tratamento
// ---------------------------------------------------------------------------
// As três listas de test/rituais.test.js (SAÚDE, PROMESSA, MECANISMO), mais o
// bloco próprio desta tela: "ajudar" e o verbo de melhora, que aqui são a
// forma mais provável de a ponte escorregar do assunto pro tratamento.

const SAUDE = [
  /\bcur(a|ar|as|am|ativ)/i,
  /\btrata(r|mento)?\b/i,
  /\bregenera/i,
  /\bansiedade\b/i,
  /\bdepress(ão|ao|iva|ivo)\b/i,
  /\bins[oô]nia\b/i,
  /\bdores?\b/i,
  /\bterap[eê]utic/i,
  /\bterapia\b/i,
  /\bimunidade\b/i,
  /\brem[ée]dio\b/i,
  /\bsono\b/i,
  /\bdormir\b/i,
  /\bestresse\b/i,
  /\brelaxa/i,
  /\bacalm/i,
  /\bcalmante\b/i,
  /\btranquiliza/i,
  /\balivi(a|ar|o)\b/i,
  /\bal[ií]vio\b/i,
  /\bharmoniza/i,
  /\bequilibra\b/i,
  /\bbem-estar\b/i,
  /\bsa[uú]de\b/i,
  /\bsistema nervoso\b/i,
  /\benergiza/i,
  /\brevigora/i,
  /\bmelhora o\b/i,
  /\bfaz bem\b/i,
  /\bse sentir melhor\b/i,
  /\besvazi(a|e|ar) a mente\b/i,
];

const PROMESSA = [
  /\batra(i|ir|em|irá|ia)\b/i,
  /\bgarant(e|em|ia|ias|ido|ida|ir)\b/i,
  /\bpromet(e|em|er|ido)\b/i,
  /\bfaz acontecer\b/i,
  /\bmanifesta(r|ção)?\b/i,
  /\babre caminhos?\b/i,
  /\bdestrava\b/i,
  /\bdesbloqueia\b/i,
  /\bafasta\b/i,
  /\bespanta\b/i,
  /\bprotege\b/i,
  /\bblinda\b/i,
  /\bneutraliza\b/i,
  /\belimina\b/i,
  /\bpoderoso\b/i,
  /\binfal[ií]vel\b/i,
  /\bd[áa] sorte\b/i,
  /\btraz sorte\b/i,
  /\btraz de volta\b/i,
  /\bvai dar certo\b/i,
  /\bfunciona mesmo\b/i,
  /\bcontrol(a|ar|e|ando)\b/i,
  // O efeito prometido em cima da pessoa, na forma mais comum dele:
  /\bvai (se sentir|sentir|ficar|melhorar)\b/i,
];

const MECANISMO = [
  /\benergia (negativa|positiva|ruim|pesada)\b/i,
  /\benerg[ée]tic/i,
  /\bvibra[çc][ãa]o\b/i,
  /\bcampo (energ|vibr)/i,
  /\baura\b/i,
  /\bchakra/i,
  /\bmagnetismo\b/i,
  /\bmau-olhado\b/i,
  /\bolho gordo\b/i,
  /\bpurifica/i,
  /\bdescarreg(a|ar)\b/i,
];

// O bloco desta tela: a ponte de tratamento na forma dela mais mansa.
const PONTE_DE_TRATAMENTO = [
  /\bajud(a|e|o|ar|am|ando)\b/i,
  /\bmelhor(a|e|ar|am|ando)\b/i,
  /\balivi/i,
  /\bconforto\b/i,
  /\bconsol(a|o|ar)\b/i,
];

// A palavra banida por docs/tradicao/06 §2 — literal, sem exceção nem entre
// aspas. Mesma trava de test/mitos.test.js e test/quizCosmico.test.js.
const BANIDA = [/\bcigan\w*/iu];

function varrer(regras, rotulo) {
  const violacoes = [];
  for (const [caminho, texto] of textosVisiveis()) {
    for (const re of regras) {
      if (re.test(texto)) violacoes.push(`${caminho} → ${re} (${rotulo})`);
    }
  }
  return violacoes;
}

test('NENHUM texto faz alegação de saúde, nem implícita', () => {
  const violacoes = varrer(SAUDE, 'saúde');
  assert.equal(violacoes.length, 0,
    'A ponte descreve o que a leitura COBRE, nunca efeito sobre corpo ou mente:\n  ' + violacoes.join('\n  '));
});

test('NENHUM texto promete resultado', () => {
  const violacoes = varrer(PROMESSA, 'promessa');
  assert.equal(violacoes.length, 0,
    'A porta aponta pra leitura; o que a leitura devolve não é nosso pra prometer:\n  ' + violacoes.join('\n  '));
});

test('NENHUM texto inventa mecanismo (energia, vibração, limpeza energética)', () => {
  const violacoes = varrer(MECANISMO, 'mecanismo');
  assert.equal(violacoes.length, 0,
    'Nem como imagem poética — mesma decisão de lib/grounding.js e lib/rituais.js:\n  ' + violacoes.join('\n  '));
});

test('NENHUMA ponte vira tratamento ("ajuda", "melhora", "consola")', () => {
  const violacoes = varrer(PONTE_DE_TRATAMENTO, 'ponte de tratamento');
  assert.equal(violacoes.length, 0,
    'A ponte é de ASSUNTO ("o tarô de futuro olha essa pergunta"), não de efeito:\n  ' + violacoes.join('\n  '));
});

test('NENHUM texto usa a palavra banida por docs/tradicao/06 §2', () => {
  const violacoes = varrer(BANIDA, 'palavra banida');
  assert.equal(violacoes.length, 0,
    'A regra é literal: a palavra não entra em nenhum texto do app. Nunca:\n  ' + violacoes.join('\n  '));
});

// ---------------------------------------------------------------------------
// 3. Sofrimento pesado não entra
// ---------------------------------------------------------------------------
// Não é censura de palavra por frescura: é o limite do produto. Quem está em
// luto ou em desespero não precisa de uma feature — e um chip desses na tela
// seria o app se oferecendo pra um papel que ele não tem como cumprir.

const SOFRIMENTO_PESADO = [
  /\bluto\b/i,
  /desesper/i,
  /depress/i,
  /suicid/i,
  /\bp[âa]nico\b/i,
  /\bmorte\b/i,
  /\bmorrer\b/i,
  /\bfalec(eu|imento|ida|ido)\b/i,
  /automutila/i,
  /n[ãa]o aguento( mais)?/i,
  /\bsem sa[íi]da\b/i,
];

test('nenhum estado é de sofrimento pesado — não somos o lugar disso', () => {
  const violacoes = varrer(SOFRIMENTO_PESADO, 'sofrimento pesado');
  assert.equal(violacoes.length, 0,
    'Luto, desespero, ideação e parentes não viram chip. A resposta certa pra essa ' +
    'pessoa não é uma feature:\n  ' + violacoes.join('\n  '));
});

// ---------------------------------------------------------------------------
// 4. A ponte não faz afirmação histórica
// ---------------------------------------------------------------------------
// Afirmação histórica exige obra + autor + século com locus na base
// docs/tradicao/ (regra da tese). A porta não cita ninguém de propósito — a
// fonte mora dentro da feature. Se alguém quiser citar aqui, o caminho é levar
// o texto pra biblioteca da feature, onde o teste dela confere o locus.

test('nenhuma ponte carrega século ou ano — a fonte mora dentro da feature', () => {
  const violacoes = [];
  for (const [caminho, texto] of textosVisiveis()) {
    if (/s[ée]c\./i.test(texto)) violacoes.push(`${caminho} → "séc."`);
    if (/\b(1[0-9]{3}|20[0-9]{2})\b/.test(texto)) violacoes.push(`${caminho} → ano de quatro dígitos`);
  }
  assert.equal(violacoes.length, 0,
    'Citação sem locus conferido não entra — e a porta não é o lugar de citar:\n  ' + violacoes.join('\n  '));
});

// ---------------------------------------------------------------------------
// 5. A tela — só renderiza e navega, sem inventar rota nem storage
// ---------------------------------------------------------------------------

test('a tela consome lib/emocoes e navega pelo resolvedor, nunca por string solta', () => {
  assert.ok(TELA.includes("from '../lib/emocoes'"), 'a tela tem que importar os estados de lib/emocoes');
  assert.ok(TELA.includes('alvoDeNavegacao'), 'a navegação tem que sair do resolvedor puro do lib');
  assert.ok(TELA.includes('getParent'), 'sem getParent() o destino do Tarô (outra aba) quebra em silêncio');
  // navigate('String') hardcoded é exatamente o que routes.js existe pra impedir.
  assert.ok(!/navigate\(\s*['"]/.test(TELA), 'navigate() com string literal — use a rota vinda de lib/emocoes');
});

test('a tela não fala com AsyncStorage nem importa o dicionário direto', () => {
  assert.ok(!TELA.includes('@react-native-async-storage'),
    'AsyncStorage direto é proibido no app inteiro — e esta tela nem persiste nada');
  // Olha o IMPORT, não a prosa: o cabeçalho da tela pode (e deve) explicar a
  // regra citando lib/i18n.js pelo nome — o que não pode é importar dele.
  assert.ok(!/from\s+['"][^'"]*lib\/i18n['"]/.test(TELA) && !/require\(['"][^'"]*lib\/i18n/.test(TELA),
    'o conteúdo desta tela mora nos packs de lib/traducoes, não no dicionário de chrome');
  // A TERCEIRA ASSERÇÃO SAIU EM 31/07/2026, e a razão é que ela envelheceu.
  // Ela dizia "sem useLanguage() NESTA FASE" — era andaime da fase em que os
  // seis construtores trabalhavam em paralelo e só o integrador podia tocar
  // i18n. A fase acabou: a tradução ligou o idioma de verdade, e agora a tela
  // PRECISA do useLanguage pra saber em que língua pedir o conteúdo ao lib.
  // Trocada pela regra que continua valendo — a tela lê o idioma, mas não
  // decide texto nenhum por conta própria.
  assert.ok(TELA.includes('useLanguage'),
    'a tela precisa do useLanguage() pra passar o idioma ao lib/emocoes');
});

test('o chrome da tela também passa nas varreduras (as strings literais da fonte)', () => {
  // Extrai só as strings literais — comentário de código pode citar a palavra
  // proibida pra explicar por que ela é proibida, e isso não é texto de tela.
  const literais = [];
  const re = /'((?:[^'\\\n]|\\.)*)'/g;
  let m;
  while ((m = re.exec(TELA))) {
    if (m[1].length >= 15) literais.push(m[1]);
  }
  assert.ok(literais.length >= 2, 'a extração de strings da tela quebrou — sem strings, a varredura não protege');
  const regras = [...SAUDE, ...PROMESSA, ...MECANISMO, ...PONTE_DE_TRATAMENTO, ...SOFRIMENTO_PESADO, ...BANIDA];
  const violacoes = [];
  for (const s of literais) {
    for (const r of regras) {
      if (r.test(s)) violacoes.push(`"${s}" → ${r}`);
    }
  }
  assert.equal(violacoes.length, 0, 'texto de chrome da tela com vocabulário proibido:\n  ' + violacoes.join('\n  '));
});
