// O log das rotas de IA precisa carregar o STATUS HTTP da Anthropic.
//
// Defeito real de produção (13/09/2026): /api/chat e /api/dream devolviam 500
// e o log só dizia `err.message`. Sem o status não dá pra distinguir chave
// revogada (401) de saldo zerado (400/403) de sobrecarga (529) — o dono ficou
// sem saber o que consertar durante uma queda de TODAS as rotas de IA.
//
// Este teste NÃO sobe o Express (server.js abre porta e banco no import): ele
// confere a invariante no texto da fonte, do mesmo jeito que
// assetsDaBuild.test.js confere a invariante da build. O que ele protege é
// exatamente o que regrediria: alguém voltar uma rota pro console.error cru,
// ou o helper parar de imprimir o status.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SERVER = path.join(__dirname, '..', 'server-patches', 'src', 'http', 'server.js');
const fonte = fs.readFileSync(SERVER, 'utf8');

// As 10 rotas que chamam a Anthropic. Se uma rota nova de IA aparecer, ela
// entra aqui — é de propósito que a lista seja explícita.
const ROTAS_IA = [
  'api/chat',
  'api/palm',
  'api/coffee',
  'api/moles',
  'api/foot',
  'api/face',
  'api/dream',
  'api/enhance-insight',
  'api/coffee-weekly-summary',
  'api/weekly-insight',
];

test('toda rota de IA loga pelo helper, nunca pelo console.error cru', () => {
  for (const rota of ROTAS_IA) {
    assert.ok(
      fonte.includes(`logErroIA("${rota}", err)`),
      `${rota} não usa logErroIA — o status HTTP da Anthropic se perde no log`
    );
    assert.ok(
      !fonte.includes(`console.error("[${rota}] erro:", err.message)`),
      `${rota} voltou pro console.error cru, que descarta o status`
    );
  }
});

test('o helper existe e imprime o status HTTP', () => {
  assert.ok(fonte.includes('function logErroIA(rota, err)'), 'helper logErroIA sumiu');
  const corpo = fonte.slice(fonte.indexOf('function logErroIA(rota, err)'));
  const fim = corpo.indexOf('\n}');
  const helper = corpo.slice(0, fim);
  // Tem que ler o status das duas formas que o SDK da Anthropic usa.
  assert.ok(/err\.status/.test(helper), 'o helper não lê err.status');
  assert.ok(/statusCode/.test(helper), 'o helper não lê err.statusCode');
  assert.ok(/HTTP/.test(helper), 'o helper não imprime o status no log');
});

// A resposta ao USUÁRIO não pode passar a vazar detalhe de infra (item 17 do
// checklist de lançamento: cortar resposta da API). O corpo continua genérico.
test('a resposta ao usuário continua genérica (não vaza status nem mensagem da Anthropic)', () => {
  assert.ok(
    fonte.includes('res.status(500).json({ error: "falha ao gerar resposta" })'),
    'o 500 de /api/chat deixou de ser genérico'
  );
  const corpo = fonte.slice(fonte.indexOf('function logErroIA(rota, err)'));
  const helper = corpo.slice(0, corpo.indexOf('\n}'));
  assert.ok(!/res\b/.test(helper), 'o helper não pode tocar na resposta — ele só escreve no log');
});
