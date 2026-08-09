// test/proximosEventos.test.js
// O CÉU NOS PRÓXIMOS DIAS — o que este arquivo segura.
//
// lib/proximosEventos.js não calcula astronomia: ele recorta a saída de
// lib/calendarioCosmico.js (que tem suíte própria) pro card de countdown da
// Home. Então o que se testa aqui é o RECORTE, com `agora` sempre INJETADO —
// nada de Date.now() implícito, senão a suíte passaria ou quebraria conforme
// o dia em que roda:
//
//   1. o passado não volta: nenhum evento devolvido fica antes do dia local
//      de `agora` — e o teste prova que HAVIA passado a filtrar;
//   2. evento do próprio dia é faltamDias 0, e é o primeiro da lista;
//   3. ordenação e `max` respeitados;
//   4. virada de mês E de ano: no último dia do mês, o mês seguinte já
//      abastece o card — a razão de a coleta ser sempre dois meses;
//   5. `lang` é repassado: mesmos eventos, títulos em idiomas diferentes;
//   6. NUNCA FABRICA: fora do intervalo do motor, null — e null significa
//      "card não renderiza", nunca um estado de erro desenhado.
//
// As datas fixas são de jan/2026 — o mesmo mês de referência do inventário em
// test/i18nKeysExist.test.js: determinístico, representativo e barato.
// As expectativas de dia saem do PRÓPRIO calendário na MESMA máquina, então o
// fuso local do runner não muda o resultado da comparação.

const test = require('node:test');
const assert = require('node:assert/strict');

const { proximosEventos } = require('../lib/proximosEventos.js');
const { calendarioCosmico } = require('../lib/calendarioCosmico.js');
const { localDayStr } = require('../lib/localDay.js');

// Meio-dia local do dia 15: longe das duas meias-noites, pra nenhuma
// conversão de fuso mudar o dia da âncora.
const AGORA_MEIO_DO_MES = new Date(2026, 0, 15, 12, 0, 0);

test('filtra o passado: nada antes do dia local de `agora`, e havia passado a filtrar', () => {
  const hoje = localDayStr(AGORA_MEIO_DO_MES);

  // Prova de que o filtro teve trabalho: jan/2026 tem evento antes do dia 15
  // (as quatro luas sozinhas garantem uma a cada ~7,4 dias).
  const mes = calendarioCosmico(2026, 1, 'pt');
  assert.ok(mes.ceuDisponivel, 'sem efeméride este teste não mede nada');
  assert.ok(
    mes.eventos.some((e) => e.dataLocal < hoje),
    'jan/2026 deveria ter evento antes do dia 15 — sem passado, o teste do filtro é vazio'
  );

  const lista = proximosEventos(AGORA_MEIO_DO_MES, 'pt', 10);
  assert.ok(Array.isArray(lista) && lista.length > 0, 'meio de mês com efeméride tem que ter próximos eventos');
  for (const ev of lista) {
    assert.ok(ev.dataLocal >= hoje, `evento no passado vazou pro card: ${ev.dataLocal} < ${hoje} (${ev.titulo})`);
    assert.ok(ev.faltamDias >= 0, `faltamDias negativo: ${ev.faltamDias} (${ev.titulo})`);
  }
});

test('evento do próprio dia sai com faltamDias 0 e abre a lista', () => {
  // A âncora vem do MOTOR: pega um evento real de jan/2026 e finge que "hoje"
  // é o dia local dele — assim o teste não depende de efeméride decorada.
  const mes = calendarioCosmico(2026, 1, 'pt');
  const alvo = mes.eventos[Math.floor(mes.eventos.length / 2)];
  const [y, m, d] = alvo.dataLocal.split('-').map(Number);
  const agora = new Date(y, m - 1, d, 0, 30, 0); // começo do dia local: o instante do evento pode já ter passado

  const lista = proximosEventos(agora, 'pt', 10);
  assert.ok(Array.isArray(lista) && lista.length > 0);
  assert.equal(lista[0].faltamDias, 0, 'o evento de hoje tem que abrir a lista com faltamDias 0');
  assert.ok(
    lista.some((e) => e.faltamDias === 0 && e.dataLocal === alvo.dataLocal && e.titulo === alvo.titulo),
    `o evento usado como âncora (${alvo.titulo} em ${alvo.dataLocal}) não apareceu como "hoje"`
  );
});

test('ordena do mais próximo pro mais distante e respeita max', () => {
  const um = proximosEventos(AGORA_MEIO_DO_MES, 'pt', 1);
  const tres = proximosEventos(AGORA_MEIO_DO_MES, 'pt', 3);

  assert.equal(um.length, 1, 'max=1 tem que devolver exatamente 1');
  assert.ok(tres.length >= 2 && tres.length <= 3, `max=3 devolveu ${tres.length}`);
  assert.equal(um[0].titulo, tres[0].titulo, 'o primeiro item não pode depender do max');

  for (let i = 1; i < tres.length; i++) {
    assert.ok(
      tres[i].data.getTime() >= tres[i - 1].data.getTime(),
      `fora de ordem: ${tres[i - 1].titulo} depois ${tres[i].titulo}`
    );
    assert.ok(tres[i].faltamDias >= tres[i - 1].faltamDias, 'faltamDias tem que acompanhar a ordem das datas');
  }
});

test('virada de mês: no último dia do mês, o mês seguinte abastece o card', () => {
  // 31/01 ao meio-dia local: o que resta de janeiro é quase nada, e o card só
  // não fica vazio porque a coleta é sempre mês atual + seguinte.
  const lista = proximosEventos(new Date(2026, 0, 31, 12, 0, 0), 'pt', 6);
  assert.ok(Array.isArray(lista) && lista.length > 0, 'último dia do mês não pode deixar o card vazio');
  assert.ok(
    lista.some((e) => e.dataLocal.startsWith('2026-02')),
    'nenhum evento de fevereiro apareceu — a coleta do mês seguinte quebrou'
  );
});

test('virada de ano: 31/12 enxerga janeiro do ano seguinte', () => {
  const lista = proximosEventos(new Date(2026, 11, 31, 12, 0, 0), 'pt', 6);
  assert.ok(Array.isArray(lista) && lista.length > 0, 'último dia do ano não pode deixar o card vazio');
  assert.ok(
    lista.some((e) => e.dataLocal.startsWith('2027-01')),
    'nenhum evento de jan/2027 apareceu — a virada de ano da coleta quebrou'
  );
});

test('lang é repassado: mesmos eventos, título traduzido', () => {
  const pt = proximosEventos(AGORA_MEIO_DO_MES, 'pt', 3);
  const en = proximosEventos(AGORA_MEIO_DO_MES, 'en', 3);

  assert.equal(pt.length, en.length, 'o idioma não pode mudar QUAIS eventos saem');
  assert.deepEqual(
    pt.map((e) => e.tipo),
    en.map((e) => e.tipo),
    'mesmos eventos na mesma ordem, independente do idioma'
  );
  assert.deepEqual(
    pt.map((e) => e.dataLocal),
    en.map((e) => e.dataLocal),
    'as datas são efeméride — não têm idioma'
  );
  assert.ok(
    pt.some((e, i) => e.titulo !== en[i].titulo),
    'nenhum título mudou entre pt e en — o lang não está chegando no pack do calendário'
  );
});

test('fora do intervalo do motor devolve null — nunca fabrica, nunca erra na tela', () => {
  // Ano 2500 está além do teto do calendário (1700-2400) nos DOIS meses da
  // coleta: o motor declara indisponível e o recorte devolve null — que a
  // Home traduz em "não desenha o card", sem estado de erro.
  assert.equal(proximosEventos(new Date(2500, 0, 15, 12, 0, 0), 'pt', 3), null);
});
