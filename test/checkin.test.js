// O ENCANTAMENTO HONESTO — as contas do check-in e do termômetro.
//
// A regra que estes testes protegem: todo número mostrado é CONTA de coisa
// real (respostas da pessoa, dias de presença, avanço astronômico da Lua) —
// nunca previsão, nunca porcentagem de vida. Se um dia alguém "melhorar" o
// termômetro pra prometer sorte, é aqui que quebra primeiro.
import test from 'node:test';
import assert from 'node:assert/strict';
import { resumoDaSemana, termometroDaLunacao, registrarCheckin, lerCheckins, HUMORES, diaISO, comparacaoMensal } from '../lib/checkin.js';

// Uma quarta-feira à tarde: semana atual = seg 03/08 a dom 09/08 de 2026.
const QUARTA = new Date(2026, 7, 5, 15, 0, 0);

test('o placar da semana conta só a semana, e a anterior só a anterior', () => {
  const checkins = {
    '2026-08-03': 'leve',   // seg (semana atual)
    '2026-08-04': 'leve',   // ter
    '2026-08-05': 'pesado', // qua (hoje)
    '2026-07-29': 'leve',   // qua passada
    '2026-07-27': 'neutro', // seg passada
    '2026-07-20': 'leve',   // duas semanas atrás — não entra em nenhum placar
  };
  const r = resumoDaSemana(checkins, QUARTA);
  assert.deepEqual(r.atual, { leve: 2, neutro: 0, pesado: 1, total: 3 });
  assert.deepEqual(r.anterior, { leve: 1, neutro: 1, pesado: 0, total: 2 });
});

test('semana vazia é zero em tudo — nunca inventa placar pra quem não respondeu', () => {
  const r = resumoDaSemana({}, QUARTA);
  assert.equal(r.atual.total, 0);
  assert.equal(r.anterior.total, 0);
});

test('o termômetro mede a lunação REAL — pct cresce com os dias e zera na Lua Nova', () => {
  // Lua Nova real de ago/2026: 12/08 (efeméride conferida na auditoria da
  // lua). Três dias depois, o pct tem que ser baixo; três dias antes da
  // próxima (10/09), alto.
  const comeco = termometroDaLunacao({}, new Date(2026, 7, 15, 12, 0, 0));
  assert.ok(comeco, 'precisa haver lunação corrente');
  assert.ok(comeco.pct >= 5 && comeco.pct <= 20, `3 dias após a Lua Nova deveria dar ~10%, deu ${comeco.pct}%`);

  const fim = termometroDaLunacao({}, new Date(2026, 8, 7, 12, 0, 0));
  assert.ok(fim.pct >= 80 && fim.pct <= 99, `perto da próxima Lua Nova deveria dar >80%, deu ${fim.pct}%`);
});

test('a presença conta só check-ins DENTRO da lunação corrente', () => {
  const hoje = new Date(2026, 7, 20, 12, 0, 0); // lunação aberta em 12/08
  const t = termometroDaLunacao(
    {
      '2026-08-13': 'leve',
      '2026-08-15': 'neutro',
      '2026-08-20': 'leve',
      '2026-08-10': 'leve', // ANTES da Lua Nova de 12/08 — lunação passada
    },
    hoje
  );
  assert.equal(t.diasPresentes, 3, 'o dia 10/08 pertence à lunação anterior');
});

test('registrar valida o humor e poda além de 90 dias', async () => {
  assert.equal(await registrarCheckin('sorte-alta'), null, 'humor fora da lista não entra');

  const hoje = new Date(2026, 7, 5);
  let dados = null;
  // 95 dias seguidos de check-in: os 5 mais velhos têm que cair.
  for (let i = 94; i >= 0; i--) {
    dados = await registrarCheckin('leve', new Date(2026, 7, 5 - i));
  }
  const dias = Object.keys(dados);
  assert.ok(dias.length <= 91, `poda falhou: ${dias.length} dias guardados`);
  assert.ok(dados[diaISO(hoje)], 'o dia de hoje sempre fica');

  const relido = await lerCheckins();
  assert.deepEqual(relido, dados, 'o que se lê é o que se gravou');
});

test('as três respostas têm id único e emoji — e são exatamente três (um toque, não um formulário)', () => {
  assert.equal(HUMORES.length, 3);
  assert.equal(new Set(HUMORES.map((h) => h.id)).size, 3);
  for (const h of HUMORES) assert.ok(h.emoji);
});

test('a comparacao mensal so fala quando tem amostra E melhora de verdade', () => {
  const hoje = new Date(2026, 7, 4);
  const montar = (leves30, leves60, total = 12) => {
    const m = {};
    for (let i = 0; i < total; i++) m[diaISO(new Date(2026, 7, 4 - i * 2))] = i < leves30 ? 'leve' : 'neutro';
    for (let i = 0; i < total; i++) m[diaISO(new Date(2026, 7, 4 - 30 - i * 2))] = i < leves60 ? 'leve' : 'neutro';
    return m;
  };
  // Amostra rala: silencio, nunca numero fraco.
  assert.equal(comparacaoMensal({ '2026-08-01': 'leve' }, hoje), null);
  // Melhora real: direcao 'mais-leve' com os dois placares.
  const melhora = comparacaoMensal(montar(9, 4), hoje);
  assert.equal(melhora.direcao, 'mais-leve');
  assert.ok(melhora.atual.leve > melhora.anterior.leve);
  // Piora NAO vira frase de celebracao — direcao honesta.
  assert.equal(comparacaoMensal(montar(3, 9), hoje).direcao, 'menos-leve');
});
