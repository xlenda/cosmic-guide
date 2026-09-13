// O PORTÃO DAS MISSÕES DIÁRIAS (13/09/2026).
//
// Três defeitos moravam juntos em lib/missions.js + components/DailyMissionsCard.js,
// e os três tinham a mesma assinatura: FALHAM EM SILÊNCIO. Nada estoura no
// console, nada quebra o build, nenhum teste ficava vermelho — a pessoa é que
// via o app errado:
//
// 1. TOQUE MORTO. As três missões fixas de 10/09 ('ceu-de-hoje',
//    'proximos-dias', 'ver-compatibilidade') entraram no pool e não entraram
//    em MISSION_ROUTE. `MISSION_ROUTE[id]` devolvia undefined e o `if (route)`
//    engolia. Como são FIXAS, apareciam pra todo mundo, todo dia: três linhas
//    que não fazem nada ao toque.
//
// 2. MISSÃO IMPOSSÍVEL. As duas que verificam por { kind: 'action' } apontavam
//    pra chaves que NENHUMA tela gravava. Sem evidência, completeMission()
//    recusa pra sempre — e como claimDailyBonus() exige TODAS as do dia, o
//    bônus de 3/3 ficava inalcançável enquanto elas estivessem na lista.
//
// 3. PORTUGUÊS EM ESPANHOL E INGLÊS. Doze das treze missões tinham title/desc
//    cravados em PT, e a décima-terceira declarava titleKey/descKey que
//    getTodaysMissions() nem repassava. Nos três idiomas saía português.
//
// O que este arquivo segura, então: para CADA id do pool existe rota (ou o
// caminho especial que não navega), existe evidência possível, e existe
// tradução nos TRÊS idiomas. Missão nova sem qualquer uma das três não passa.
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

// Mesmo esquema de mock por require-cache dos outros testes de missões.
const mem = new Map();
const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) { return mem.has(k) ? mem.get(k) : null; },
    async setItem(k, v) { mem.set(k, String(v)); },
    async removeItem(k) { mem.delete(k); },
    async multiRemove(keys) { keys.forEach((k) => mem.delete(k)); },
  },
};
const reactNativeMock = { __esModule: true, Platform: { OS: 'test' } };
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'react-native') return reactNativeMock;
  return originalLoad.call(this, request, parent, isMain);
};

const {
  MISSION_POOL,
  MISSION_ACTIONS,
  getTodaysMissions,
  recordMissionAction,
  completeMission,
  getMissionProgress,
} = require('../lib/missions.js');
const { _DICTS_FOR_TESTS: DICTS } = require('../lib/i18n.js');

const RAIZ = path.join(__dirname, '..');
const CARD = fs.readFileSync(path.join(RAIZ, 'components/DailyMissionsCard.js'), 'utf8');

// Lê um mapa `const NOME = { 'chave': VALOR, … }` do texto do card. Ler o
// texto (em vez de importar) é o que permite testar um componente React sem
// arrastar react-navigation e o resto do mundo pra dentro do runner.
function mapaDoCard(nome) {
  const inicio = CARD.indexOf(`const ${nome} = {`);
  assert.ok(inicio > -1, `${nome} sumiu de components/DailyMissionsCard.js`);
  const fim = CARD.indexOf('};', inicio);
  const bloco = CARD.slice(inicio, fim);
  const chaves = new Set();
  for (const m of bloco.matchAll(/'([^']+)':/g)) chaves.add(m[1]);
  return chaves;
}

test('toda missão do pool tem destino ao toque — nenhuma linha morta', () => {
  const rotas = mapaDoCard('MISSION_ROUTE');
  // 'compartilhar-frase' é a única que NÃO navega: abre a folha de
  // compartilhar ali mesmo (goDo trata antes de consultar o mapa). Ela está
  // no mapa mesmo assim, como fallback de navegador sem navigator.share.
  for (const m of MISSION_POOL) {
    assert.ok(
      rotas.has(m.id),
      `missão '${m.id}' não está em MISSION_ROUTE: o toque não faz NADA e ninguém vê erro`,
    );
  }
});

test('toda missão verificada por ação tem quem grave a evidência', () => {
  const noToque = mapaDoCard('MISSION_ACTION_ON_TAP');
  // Chaves gravadas por alguma TELA (grep manual, conferido em 13/09/2026).
  const porTela = new Set([
    MISSION_ACTIONS.PENSAMENTO_LIDO,
    MISSION_ACTIONS.FRASE_COMPARTILHADA,
    MISSION_ACTIONS.CHAT_MENSAGEM_ENVIADA,
  ]);
  const porToque = new Set(
    [...noToque].map((id) => {
      const bloco = CARD.slice(CARD.indexOf('const MISSION_ACTION_ON_TAP'));
      const m = bloco.match(new RegExp(`'${id}':\\s*MISSION_ACTIONS\\.(\\w+)`));
      assert.ok(m, `'${id}' em MISSION_ACTION_ON_TAP sem MISSION_ACTIONS.*`);
      return MISSION_ACTIONS[m[1]];
    }),
  );

  for (const m of MISSION_POOL) {
    if (m.verify.kind !== 'action') continue;
    assert.ok(
      porTela.has(m.verify.action) || porToque.has(m.verify.action),
      `missão '${m.id}' espera a ação '${m.verify.action}', e NINGUÉM a grava: ` +
        'impossível de completar, e o bônus de 3/3 fica inalcançável junto',
    );
  }
});

test('as 13 missões têm título e descrição nos TRÊS idiomas', async () => {
  const idiomas = ['pt', 'es', 'en'];
  for (const m of MISSION_POOL) {
    for (const lang of idiomas) {
      for (const campo of ['title', 'desc']) {
        const chave = `missions.${m.id}.${campo}`;
        const texto = DICTS[lang][chave];
        assert.ok(texto, `falta '${chave}' em ${lang.toUpperCase()}`);
        assert.notStrictEqual(texto, chave, `'${chave}' em ${lang} devolve a própria chave`);
      }
    }
  }
  // ES e EN não podem ser cópia carbono do PT: era exatamente esse o defeito
  // (português servido nos três idiomas). Pelo menos os títulos têm de diferir.
  for (const m of MISSION_POOL) {
    const k = `missions.${m.id}.title`;
    assert.notStrictEqual(DICTS.es[k], DICTS.pt[k], `'${k}' em ES ainda é o texto PT`);
    assert.notStrictEqual(DICTS.en[k], DICTS.pt[k], `'${k}' em EN ainda é o texto PT`);
  }
  // E o motor precisa REPASSAR a chave: até 13/09 getTodaysMissions() montava
  // o objeto sem titleKey/descKey, então a tela caía no fallback PT mesmo
  // havendo tradução no dicionário. Esta parte segura o repasse.
  const hoje = await getTodaysMissions();
  assert.ok(hoje.length > 0, 'getTodaysMissions devolveu lista vazia');
  for (const m of hoje) {
    assert.strictEqual(m.titleKey, `missions.${m.id}.title`);
    assert.strictEqual(m.descKey, `missions.${m.id}.desc`);
  }
});

test('a linha da missão concluída passa pelo dicionário, não por string crua', () => {
  assert.ok(
    CARD.includes("t('missions.done')"),
    'o texto de missão concluída voltou a ser string crava no JSX',
  );
  for (const lang of ['pt', 'es', 'en']) {
    assert.ok(DICTS[lang]['missions.done'], `falta 'missions.done' em ${lang.toUpperCase()}`);
  }
});

// A PROVA DE PONTA A PONTA: o bônus diário volta a ser alcançável.
//
// Este é o efeito que o usuário sente. Enquanto 'ceu-de-hoje' e 'proximos-dias'
// esperavam um marcador que ninguém gravava, completeMission() as recusava para
// sempre — e como claimDailyBonus() exige done === defs.length, o bônus ficava
// inalcançável TODO DIA, para TODA pessoa. O contador travava no melhor caso.
test('as missões de ação de hoje completam, e o bônus deixa de ser inalcançável', async () => {
  mem.clear();

  const missoes = await getTodaysMissions();
  const deAcao = missoes.filter((m) => m.verify.kind === 'action');
  assert.ok(deAcao.length > 0, 'esperava pelo menos uma missão de ação no dia');

  // Grava a evidência que a tela grava (recordMissionAction no toque) e conclui.
  for (const m of deAcao) await recordMissionAction(m.verify.action);
  for (const m of deAcao) {
    const r = await completeMission(m.id);
    assert.strictEqual(
      r.ok,
      true,
      `missão '${m.id}' recusou completar (motivo: ${r.reason}) — é o bug do bônus inalcançável`,
    );
  }

  const depois = await getTodaysMissions();
  for (const m of depois.filter((x) => x.verify.kind === 'action')) {
    assert.strictEqual(m.done, true, `'${m.id}' continua pendente depois de concluída`);
  }

  const progresso = await getMissionProgress();
  assert.ok(
    progresso.done >= deAcao.length,
    `o contador travou em ${progresso.done}/${progresso.total}`,
  );
});
