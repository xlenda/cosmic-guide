// test/calendarioCosmico.test.js
//
// O que este arquivo protege, em ordem de gravidade:
//
//   1. A LINHA DE SAÚDE E DE PROMESSA. Um calendário de eventos celestes é o
//      lugar mais fácil do app pra escorregar em "aproveite a Lua Cheia pra
//      recarregar as energias". Se escorregar, o build cai.
//   2. A ORDEM DO TEXTO. O dono pediu povão primeiro, recibo depois. Aqui isso
//      não é estilo, é contrato verificado: o parágrafo é cortado no marcador
//      MARCA_RECIBO, a primeira metade não pode ter autor nem século e a
//      segunda tem que ter os dois.
//   3. A DATA. Um calendário que erra data não serve pra nada, e este é
//      conferível contra efeméride pública. Luas de janeiro/2024 (as mesmas
//      já usadas em test/lunarCalendar.test.js), equinócios e solstícios de
//      2024, e os quatro períodos retrógrados de Mercúrio de 2024.
//   4. O "NUNCA FABRICA". Sem efeméride, lista vazia — não estimativa.
//
// Ver skills/new-app-playbook/sensitive-calculations.md, Regra 1: nunca
// confiar em "rodou sem erro"; validar contra caso conhecido.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  calendarioCosmico,
  calendarioCosmicoDoMesAtual,
  MARCA_RECIBO,
  SEM_FONTE_ANTIGA,
  PLANETAS_DO_ASPECTO,
  ANGULO_DO_ASPECTO,
} = require('../lib/calendarioCosmico.js');
const { aspects } = require('../lib/signs.js');
const { localDayStr } = require('../lib/localDay.js');

// ---------------------------------------------------------------------------
// Utilitários do teste
// ---------------------------------------------------------------------------

// Todo texto visível de um evento, num array só.
function textosDe(evento) {
  const out = [evento.titulo, evento.paragrafo, evento.fonte];
  if (evento.avisoDeIdade) out.push(evento.avisoDeIdade);
  if (evento.tradicao) {
    out.push(evento.tradicao.texto, evento.tradicao.obra, evento.tradicao.autor, evento.tradicao.seculo);
  }
  return out.filter((t) => typeof t === 'string' && t.length > 0);
}

// Um evento distinto de cada tipo/título, varrendo dois anos — é o corpus que
// as varreduras de vocabulário usam. Dois anos cobrem os doze ingressos, os
// quatro marcos lunares, os dois eventos de Mercúrio e os cinco aspectos.
function corpusDeEventos(deAno = 2024, ateAno = 2025) {
  const vistos = new Map();
  for (let ano = deAno; ano <= ateAno; ano++) {
    for (let mes = 1; mes <= 12; mes++) {
      for (const e of calendarioCosmico(ano, mes).eventos) {
        const chave = `${e.tipo}|${e.titulo}`;
        if (!vistos.has(chave)) vistos.set(chave, e);
      }
    }
  }
  return [...vistos.values()];
}

const CORPUS = corpusDeEventos();

// Minutos de diferença entre um ISO e uma data esperada.
function minutosDeDiferenca(iso, esperadoIso) {
  return Math.abs(new Date(iso).getTime() - new Date(esperadoIso).getTime()) / 60000;
}

function eventosDoTipo(resultado, tipo) {
  return resultado.eventos.filter((e) => e.tipo === tipo);
}

// ---------------------------------------------------------------------------
// (a) AS DATAS, CONFERIDAS CONTRA O CÉU REAL
// ---------------------------------------------------------------------------

test('as luas de janeiro/2024 batem com as luas reais já usadas em test/lunarCalendar.test.js', () => {
  // Mesmos dois instantes de referência do cabeçalho de lib/lunarCalendar.js:
  // nova em 11/jan/2024 11:57 UTC, cheia em 25/jan/2024 17:54 UTC.
  const r = calendarioCosmico(2024, 1);
  assert.equal(r.ceuDisponivel, true, 'astronomy-engine precisa estar disponível pro teste rodar');

  const novas = eventosDoTipo(r, 'luaNova');
  const cheias = eventosDoTipo(r, 'luaCheia');
  assert.equal(novas.length, 1, 'janeiro de 2024 tem exatamente uma Lua Nova');
  assert.equal(cheias.length, 1, 'janeiro de 2024 tem exatamente uma Lua Cheia');

  assert.ok(
    minutosDeDiferenca(novas[0].dataISO, '2024-01-11T11:57:00Z') <= 5,
    `Lua Nova saiu em ${novas[0].dataISO}, esperado 2024-01-11T11:57Z`
  );
  assert.ok(
    minutosDeDiferenca(cheias[0].dataISO, '2024-01-25T17:54:00Z') <= 5,
    `Lua Cheia saiu em ${cheias[0].dataISO}, esperado 2024-01-25T17:54Z`
  );

  // E a iluminação lida no instante confirma que é o marco, não a vizinhança.
  assert.ok(novas[0].detalhe.iluminacao <= 1, `Lua Nova com ${novas[0].detalhe.iluminacao}% de luz`);
  assert.ok(cheias[0].detalhe.iluminacao >= 99, `Lua Cheia com ${cheias[0].detalhe.iluminacao}% de luz`);
});

test('os quatro marcos lunares aparecem e vêm com instante, não com faixa de dias', () => {
  // A armadilha documentada em lib/lunarCalendar.js: o RÓTULO "Lua Cheia"
  // cobre uma fatia de 45° (~3,7 dias). Se este calendário estivesse datando
  // marco por rótulo, apareceriam vários "Lua Cheia" seguidos no mesmo mês.
  const r = calendarioCosmico(2026, 7);
  for (const tipo of ['luaNova', 'luaCheia', 'quartoCrescente', 'quartoMinguante']) {
    const achados = eventosDoTipo(r, tipo);
    assert.ok(achados.length >= 1, `julho/2026 deveria ter pelo menos um ${tipo}`);
    for (const e of achados) {
      assert.equal(e.precisao, 'instante');
      // Instante de verdade não cai redondo no meio-dia UTC.
      const d = new Date(e.dataISO);
      assert.ok(
        !(d.getUTCHours() === 12 && d.getUTCMinutes() === 0),
        `${tipo} caiu exatamente no meio-dia UTC — cheira a data derivada de rótulo diário`
      );
    }
  }
  // Julho/2026: a Cheia real é em 29/07 às 14:36 UTC (o próprio cabeçalho de
  // lib/lunarCalendar.js cita este caso, em que os dias 28 a 31 são todos
  // ROTULADOS "Lua Cheia").
  const cheia = eventosDoTipo(r, 'luaCheia')[0];
  assert.ok(
    minutosDeDiferenca(cheia.dataISO, '2026-07-29T14:36:00Z') <= 10,
    `Lua Cheia de julho/2026 saiu em ${cheia.dataISO}, esperado 2026-07-29T14:36Z`
  );
});

test('os ingressos do Sol batem com equinócios e solstícios reais de 2024', () => {
  // Efeméride pública: equinócio de março 20/03 03:06 UTC, solstício de junho
  // 20/06 20:51 UTC, equinócio de setembro 22/09 12:44 UTC, solstício de
  // dezembro 21/12 09:20 UTC. A bissecção devolve o PRIMEIRO minuto já no
  // signo novo, então até 2 minutos de folga é o esperado, não erro.
  const esperado = [
    [2024, 3, 'Áries', '2024-03-20T03:06:00Z'],
    [2024, 6, 'Câncer', '2024-06-20T20:51:00Z'],
    [2024, 9, 'Libra', '2024-09-22T12:44:00Z'],
    [2024, 12, 'Capricórnio', '2024-12-21T09:20:00Z'],
  ];
  for (const [ano, mes, signo, iso] of esperado) {
    const ingressos = eventosDoTipo(calendarioCosmico(ano, mes), 'ingressoSolar');
    assert.equal(ingressos.length, 1, `${ano}-${mes} deveria ter um ingresso solar`);
    const e = ingressos[0];
    assert.equal(e.detalhe.signoNovo, signo);
    assert.equal(e.detalhe.cardinal, true, `${signo} é signo cardinal — o texto precisa citar o equinócio/solstício`);
    assert.ok(
      minutosDeDiferenca(e.dataISO, iso) <= 2,
      `ingresso em ${signo} saiu em ${e.dataISO}, esperado ${iso}`
    );
  }
});

test('o ingresso NÃO vem de tabela de calendário: a mesma virada muda de dia entre anos', () => {
  // É a proposição 1 da tese em forma de teste. A tabela fixa dizia "Áries
  // começa em 21/03"; a efeméride diz 20/03 em 2024 e 20/03 em 2025, mas 21/03
  // em 2003 — e é a variação que prova que ninguém está lendo tabela aqui.
  const dias = new Set();
  for (const ano of [2003, 2011, 2024, 2025]) {
    const ingresso = eventosDoTipo(calendarioCosmico(ano, 3), 'ingressoSolar')
      .find((e) => e.detalhe.signoNovo === 'Áries');
    assert.ok(ingresso, `${ano}: o Sol entra em Áries em março`);
    dias.add(ingresso.dia);
  }
  assert.ok(dias.size >= 2, `o dia do equinócio ficou fixo em ${[...dias]} — isso é tabela, não efeméride`);
});

test('Mercúrio retrógrado: os quatro marcos de 2024 caem nos dias reais', () => {
  // Estações reais de 2024 (mesma fonte já citada em lib/signs.js, validada em
  // test/signs.test.js): direto em 01/01, retrógrado 01/04–25/04,
  // 05/08–28/08, e retrógrado de novo a partir de 25/11 até 15/12.
  // Convenção do FIM aqui é a de lib/celestialSeasons.js: ÚLTIMO dia ainda
  // retrógrado, nunca o primeiro dia já direto.
  const casos = [
    [2024, 1, 'mercurioRetrogradoFim', 1],
    [2024, 4, 'mercurioRetrogradoInicio', 2],
    [2024, 4, 'mercurioRetrogradoFim', 25],
    [2024, 8, 'mercurioRetrogradoInicio', 5],
    [2024, 8, 'mercurioRetrogradoFim', 28],
    [2024, 11, 'mercurioRetrogradoInicio', 26],
    [2024, 12, 'mercurioRetrogradoFim', 15],
  ];
  for (const [ano, mes, tipo, dia] of casos) {
    const achados = eventosDoTipo(calendarioCosmico(ano, mes), tipo);
    assert.equal(achados.length, 1, `${ano}-${mes}: esperado um ${tipo}`);
    assert.ok(
      Math.abs(achados[0].dia - dia) <= 1,
      `${ano}-${mes} ${tipo} saiu no dia ${achados[0].dia}, esperado ~${dia}`
    );
  }
  // Junho de 2024 está fora dos três períodos: não pode haver marco nenhum.
  const junho = calendarioCosmico(2024, 6);
  assert.equal(eventosDoTipo(junho, 'mercurioRetrogradoInicio').length, 0);
  assert.equal(eventosDoTipo(junho, 'mercurioRetrogradoFim').length, 0);
});

test('Mercúrio retrógrado se declara com precisão de DIA, não de hora fingida', () => {
  // isMercuryRetrograde() compara a longitude a ±2 dias: a resolução real é de
  // um dia. Publicar "14:37 UTC" aqui seria fabricar precisão.
  const abril = calendarioCosmico(2024, 4);
  for (const e of abril.eventos.filter((x) => x.tipo.startsWith('mercurioRetrogrado'))) {
    assert.equal(e.precisao, 'dia');
    const d = new Date(e.dataISO);
    assert.equal(d.getUTCHours(), 12, 'o marco de dia é ancorado ao meio-dia UTC de propósito');
    assert.equal(d.getUTCMinutes(), 0);
  }
});

test('o aspecto publicado é exato de verdade: o ângulo confere na hora anunciada', () => {
  // Nada de "quase": o evento só existe se, no instante publicado, aspects()
  // de lib/signs.js devolver aquele par com orbe residual desprezível. É a
  // checagem cruzada — o calendário afirma, e a função original confirma.
  let conferidos = 0;
  for (let mes = 1; mes <= 12; mes++) {
    for (const e of eventosDoTipo(calendarioCosmico(2024, mes), 'aspectoExato')) {
      const d = new Date(e.dataISO);
      const iso = d.toISOString();
      const lista = aspects(iso.slice(0, 10), iso.slice(11, 16));
      const achado = lista.find(
        (a) => a.planetA === e.detalhe.planetA && a.planetB === e.detalhe.planetB && a.aspectType === e.detalhe.aspecto
      );
      assert.ok(achado, `${e.titulo} em ${e.dataISO}: aspects() não vê esse par nesse instante`);
      assert.ok(
        achado.orb <= 0.02,
        `${e.titulo} em ${e.dataISO}: orbe ${achado.orb.toFixed(4)}° — isso é "quase", não "exato"`
      );
      assert.ok(
        Math.abs(achado.exactAngle - ANGULO_DO_ASPECTO[e.detalhe.aspecto]) <= 0.02,
        `${e.titulo}: separação ${achado.exactAngle.toFixed(3)}° não bate com o ângulo canônico`
      );
      conferidos++;
    }
  }
  assert.ok(conferidos >= 12, `só ${conferidos} aspectos exatos em 2024 inteiro — a varredura quebrou`);
});

test('ANGULO_DO_ASPECTO não desanda se lib/signs.js mudar a tabela de orbes', () => {
  // Esta constante espelha uma tabela privada de lib/signs.js. Espelho sem
  // trava vira mentira silenciosa, então a trava é esta: para toda saída real
  // de aspects(), orb tem que ser |exactAngle - ângulo canônico|.
  let vistos = 0;
  for (const dia of ['2024-01-15', '2024-05-09', '2024-11-03', '2025-07-21']) {
    for (const a of aspects(dia) || []) {
      if (!(a.aspectType in ANGULO_DO_ASPECTO)) {
        assert.fail(`aspects() devolveu o tipo "${a.aspectType}", que ANGULO_DO_ASPECTO não conhece`);
      }
      assert.ok(
        Math.abs(Math.abs(a.exactAngle - ANGULO_DO_ASPECTO[a.aspectType]) - a.orb) < 1e-6,
        `${a.aspectType}: orb ${a.orb} não é |${a.exactAngle} - ${ANGULO_DO_ASPECTO[a.aspectType]}|`
      );
      vistos++;
    }
  }
  assert.ok(vistos > 20, 'amostra pequena demais pra valer como trava');
});

test('a Lua fica fora da varredura de aspectos — os aspectos dela com o Sol JÁ são as quatro luas', () => {
  assert.deepEqual(PLANETAS_DO_ASPECTO, ['Sol', 'Mercúrio', 'Vênus', 'Marte']);
  for (let mes = 1; mes <= 12; mes++) {
    for (const e of eventosDoTipo(calendarioCosmico(2025, mes), 'aspectoExato')) {
      assert.notEqual(e.detalhe.planetA, 'Lua', `${e.titulo}: a Lua entrou na lista de aspectos`);
      assert.notEqual(e.detalhe.planetB, 'Lua', `${e.titulo}: a Lua entrou na lista de aspectos`);
    }
  }
});

// ---------------------------------------------------------------------------
// (b) O TAMANHO DO MÊS
// ---------------------------------------------------------------------------

test('todo mês com efeméride devolve entre 4 e 20 eventos — nunca zero', () => {
  let minimo = Infinity;
  let maximo = 0;
  let piorMes = null;
  for (let ano = 2024; ano <= 2026; ano++) {
    for (let mes = 1; mes <= 12; mes++) {
      const r = calendarioCosmico(ano, mes);
      assert.equal(r.ceuDisponivel, true, `${ano}-${mes}: efeméride sumiu no meio da varredura`);
      const n = r.eventos.length;
      assert.ok(n > 0, `${ano}-${mes} devolveu ZERO eventos — todo mês tem pelo menos as quatro luas`);
      assert.ok(n >= 4, `${ano}-${mes} devolveu só ${n} eventos`);
      assert.ok(n <= 20, `${ano}-${mes} devolveu ${n} eventos — a lista virou enxurrada`);
      if (n < minimo) { minimo = n; piorMes = `${ano}-${mes}`; }
      if (n > maximo) maximo = n;
    }
  }
  // O piso real medido nesta base é 5 (as 4 luas + 1 ingresso). Se cair para 4,
  // é porque um ingresso ou uma lua deixou de ser encontrado.
  assert.ok(minimo >= 5, `o mês mais magro (${piorMes}) caiu para ${minimo} eventos`);
  assert.ok(maximo >= 8, `o mês mais cheio teve só ${maximo} eventos — a varredura encolheu`);
});

test('todo mês tem as quatro luas e exatamente um ingresso do Sol', () => {
  for (let ano = 2024; ano <= 2025; ano++) {
    for (let mes = 1; mes <= 12; mes++) {
      const r = calendarioCosmico(ano, mes);
      for (const tipo of ['luaNova', 'luaCheia', 'quartoCrescente', 'quartoMinguante']) {
        assert.ok(eventosDoTipo(r, tipo).length >= 1, `${ano}-${mes}: faltou ${tipo}`);
      }
      assert.equal(
        eventosDoTipo(r, 'ingressoSolar').length,
        1,
        `${ano}-${mes}: o Sol muda de signo uma vez por mês de calendário`
      );
    }
  }
});

test('os eventos saem ordenados por data e dentro do mês pedido', () => {
  for (const [ano, mes] of [[2024, 2], [2025, 8], [2026, 12]]) {
    const r = calendarioCosmico(ano, mes);
    let anterior = -Infinity;
    for (const e of r.eventos) {
      const ms = new Date(e.dataISO).getTime();
      assert.ok(ms >= anterior, `${ano}-${mes}: ${e.titulo} está fora de ordem`);
      anterior = ms;
      const d = new Date(e.dataISO);
      assert.equal(d.getUTCFullYear(), ano, `${e.titulo} vazou pro ano errado`);
      assert.equal(d.getUTCMonth() + 1, mes, `${e.titulo} vazou pro mês errado`);
      assert.equal(e.dia, d.getUTCDate(), `${e.titulo}: campo dia não bate com a data`);
      // O campo que a TELA consome é o local — e ele tem que sair de
      // lib/localDay.js, que é a convenção única do app. Caso medido:
      // 2026-07-13T01:28Z é 12/07 no Brasil, e `dia` (UTC) dizia 13.
      assert.equal(e.diaLocal, d.getDate(), `${e.titulo}: diaLocal não é o dia civil do aparelho`);
      assert.equal(e.dataLocal, localDayStr(d), `${e.titulo}: dataLocal não veio de localDayStr`);
    }
  }
});

test('o rótulo de dia é LOCAL e o instante é UTC — os dois campos existem e não se confundem', () => {
  // A convenção do app (lib/localDay.js) é "o dia LOCAL do aparelho, nunca
  // UTC". A efeméride é UTC e tem que continuar sendo. Por isso os dois.
  const r = calendarioCosmico(2026, 7);
  assert.ok(r.eventos.length > 0);
  for (const e of r.eventos) {
    const d = new Date(e.dataISO);
    assert.equal(typeof e.diaLocal, 'number', `${e.titulo}: sem diaLocal`);
    assert.match(e.dataLocal, /^\d{4}-\d{2}-\d{2}$/, `${e.titulo}: dataLocal fora do formato`);
    assert.equal(e.dataLocal.slice(8), String(e.diaLocal).padStart(2, '0'));
    // Diferença máxima de um dia entre o rótulo UTC e o local — mais que isso
    // seria erro de conversão, não fuso.
    assert.ok(Math.abs(e.dia - e.diaLocal) <= 1 || Math.abs(e.dia - e.diaLocal) >= 27, `${e.titulo}: dia e diaLocal divergem demais`);
    assert.equal(d.getTime(), e.data.getTime(), `${e.titulo}: dataISO não é o mesmo instante de data`);
  }
});

test('mês ou ano inválido não inventa nada — devolve vazio e diz por quê', () => {
  for (const [ano, mes] of [[2024, 0], [2024, 13], [2024, 1.5], [NaN, 5], [2024, null], ['2024', 5]]) {
    const r = calendarioCosmico(ano, mes);
    assert.equal(r.ceuDisponivel, false, `${ano}-${mes} deveria ser recusado`);
    assert.deepEqual(r.eventos, []);
    assert.ok(r.motivoIndisponivel && r.motivoIndisponivel.length > 20);
    assert.ok(r.mensagem && r.mensagem.length > 20, `${ano}-${mes}: sem mensagem de tela`);
  }
});

test('o mês repetido sai do cache e é o MESMO resultado — sem recalcular a efeméride', () => {
  // calendarioCosmico() é caro (138 ms na primeira chamada de um mês nesta
  // máquina; o grosso é a varredura de aspecto exato). O resultado é
  // determinístico, então navegar mês a mês e voltar não pode recalcular tudo.
  const a = calendarioCosmico(2027, 3);
  const b = calendarioCosmico(2027, 3);
  assert.equal(a, b, 'o mesmo mês devolveu objetos diferentes — o cache não pegou');
  assert.deepEqual(
    a.eventos.map((e) => e.dataISO),
    b.eventos.map((e) => e.dataISO)
  );
});

test('o atalho do mês atual devolve o mês atual e o mesmo formato', () => {
  const agora = new Date('2025-04-17T09:00:00Z');
  const r = calendarioCosmicoDoMesAtual(agora);
  assert.equal(r.ano, agora.getFullYear());
  assert.equal(r.mes, agora.getMonth() + 1);
  assert.equal(r.ceuDisponivel, true);
  assert.ok(r.eventos.length >= 4);
});

// ---------------------------------------------------------------------------
// (c) SEM EFEMÉRIDE, NÃO INVENTA
// ---------------------------------------------------------------------------

test('sem efeméride o calendário devolve lista vazia e o sinalizador — nunca uma data estimada', () => {
  // Mesma simulação de test/cosmicSound.test.js: derruba getMoonPhase, que é a
  // sonda única de disponibilidade. Mesmo contrato de ceuDisponivel.
  const lunar = require('../lib/lunarCalendar.js');
  const original = Object.getOwnPropertyDescriptor(lunar, 'getMoonPhase');
  Object.defineProperty(lunar, 'getMoonPhase', { value: () => null, configurable: true });
  try {
    const r = calendarioCosmico(2024, 1);
    assert.equal(r.ceuDisponivel, false);
    assert.deepEqual(r.eventos, [], 'sem efeméride não existe evento nenhum — nem aproximado');
    assert.equal(r.ano, 2024);
    assert.equal(r.mes, 1);
    // `motivoIndisponivel` é o campo TÉCNICO, de log: é ele que carrega
    // "efeméride" e o nome do pacote.
    assert.match(
      r.motivoIndisponivel,
      /efeméride/i,
      'o log precisa poder dizer POR QUE o calendário está vazio'
    );
    assert.doesNotMatch(
      r.motivoIndisponivel,
      /aproximad|estimad|provavelmente|por volta de/i,
      'o motivo não pode oferecer estimativa como consolo'
    );
    // `mensagem` é o campo de TELA. Se o usuário lê o nome de um pacote npm, o
    // app está vazando bancada de desenvolvedor pra dentro do produto.
    assert.ok(r.mensagem && r.mensagem.length > 20, 'sem mensagem de tela');
    assert.doesNotMatch(r.mensagem, /efem[ée]ride|astronomy-engine|npm|null|undefined/i);
    assert.doesNotMatch(
      r.mensagem,
      /aproximad|estimad|provavelmente|por volta de/i,
      'a mensagem não pode oferecer estimativa como consolo'
    );
  } finally {
    if (original) Object.defineProperty(lunar, 'getMoonPhase', original);
  }
  // E volta ao normal depois — o teste não pode envenenar os que vierem depois.
  assert.equal(calendarioCosmico(2024, 1).ceuDisponivel, true);
});

// ---------------------------------------------------------------------------
// (d) VARREDURA DE ALEGAÇÃO DE SAÚDE
// ---------------------------------------------------------------------------

test('nenhum texto do calendário toca saúde, corpo, sono ou humor', () => {
  // Mesma linha vermelha de test/grounding.test.js, test/zodiacBody.test.js e
  // test/dailyHoroscope.test.js — e a mesma busca POR INÍCIO DE PALAVRA, pelo
  // motivo já documentado lá: "cura" solto acusaria "secura", que é Ptolomeu
  // (Tetrabiblos I.8) descrevendo qualidade elementar e está no texto deste
  // arquivo de propósito. Falso positivo corrói a confiança no teste até
  // alguém desligá-lo, que é o pior desfecho para um teste que guarda a linha
  // de saúde.
  const PROIBIDO = [
    'saúde', 'salud', 'health', 'cura', 'curar', 'curativ', 'heal', 'tratamento', 'tratar', 'terapia', 'terapêut',
    'remédio', 'medicine', 'sintoma', 'symptom', 'diagnóstic', 'diagnos', 'doença',
    'ansiedade', 'anxiety', 'estresse', 'stress', 'depress', 'insônia', 'insomnia',
    'imunidade', 'immunity', 'cortisol', 'hormôni', 'pressão arterial', 'blood pressure',
    'fertilidade', 'fertility', 'menstrua', 'gravidez', 'pregnan', 'sono ', 'dormir', 'descanse',
    'acalma', 'acalmar', 'calmante', 'relaxa', 'relaxar', 'alivia', 'aliviar', 'energiza', 'revigora',
    'recarrega', 'recarregar', 'equilibra o corpo', 'limpeza energética', 'bem-estar', 'wellness',
    'chakra', 'aura', 'vibração', 'frequência vibracional', 'cristal', 'cristais',
  ];
  const LETRA = 'a-záàâãäéèêëíìîïóòôõöúùûüçñ';
  for (const evento of CORPUS) {
    for (const texto of textosDe(evento)) {
      const alvo = texto.toLowerCase();
      for (const palavra of PROIBIDO) {
        const re = new RegExp(`(^|[^${LETRA}])${palavra}`);
        assert.ok(
          !re.test(alvo),
          `${evento.tipo} / "${evento.titulo}" usa "${palavra}" — o calendário não fala de saúde, nem por metáfora.\nTrecho: ${texto.slice(0, 160)}`
        );
      }
    }
  }
});

test('nenhum texto promete resultado', () => {
  // Promessa é a outra metade da linha vermelha: o céu é medido, o que
  // acontece com a vida de quem lê não é nosso para afirmar (00-tese.md,
  // proposição 1 e regra operacional 1).
  const PROMESSAS = [
    /vai atrair/i,
    /vai trazer/i,
    /vai acontecer/i,
    /garant(e|ido|ia de)/i,
    /assegur(a|ado)/i,
    /favorece/i,
    /propíci[oa]/i,
    /ideal para/i,
    /melhor momento/i,
    /bom momento/i,
    /boa hora para/i,
    /momento certo para/i,
    /aproveit(e|ar) para/i,
    /traz sorte/i,
    /dá sorte/i,
    /abre caminhos/i,
    /manifesta(r|ção) (o|a|seu|sua)/i,
    /atrai (dinheiro|amor|prosperidade)/i,
    // As três telas (rituais, jornada, calendário) declaram a MESMA linha
    // vermelha e aplicavam três listas diferentes. "Destrava" estava proibido no
    // cabeçalho de lib/rituais.js e em test/rituais.test.js, e não aqui — por
    // essa fresta passou "demora, revisita, contradiz, destrava" num campo que
    // a tela mostra ao lado de uma DATA. Vira "no dia 23 as coisas destravam".
    /destrava/i,
    /desbloqueia/i,
  ];
  for (const evento of CORPUS) {
    for (const texto of textosDe(evento)) {
      for (const re of PROMESSAS) {
        assert.doesNotMatch(
          texto,
          re,
          `${evento.tipo} / "${evento.titulo}" promete resultado (${re}).\nTrecho: ${texto.slice(0, 160)}`
        );
      }
    }
  }
});

// ---------------------------------------------------------------------------
// (e) NENHUMA INSTRUÇÃO AO LEITOR — E MUITO MENOS AO CORPO DELE
// ---------------------------------------------------------------------------

test('nenhum texto dá instrução ao corpo de quem lê', () => {
  // A regra da proposição 6 da tese: o app descreve o que a tradição
  // acreditava; não prescreve nada ao corpo de ninguém. Aqui a lista é de
  // VERBOS DE AÇÃO dirigidos ao leitor — o teste de lib/grounding.js olha a
  // preposição de finalidade; este olha a pessoa do verbo.
  const INSTRUCOES_AO_CORPO = [
    /\brespire\b/i, /\binspire\b/i, /\bexpire\b/i, /\bsegure a respiração\b/i,
    /\brelaxe\b/i, /\bdurma\b/i, /\bdescanse\b/i, /\bdeite\b/i, /\bsente-se\b/i,
    /\bfeche os olhos\b/i, /\balongue\b/i, /\bmedite\b/i, /\bjejue\b/i,
    /\btome\b/i, /\bbeba\b/i, /\bcoma\b/i, /\bevite comer\b/i,
    /\bbanho de\b/i, /\bchá de\b/i, /\bacenda\b/i, /\bcorte o cabelo\b/i,
    /\bcolo(que|car) (a mão|o corpo|os pés)\b/i,
  ];
  for (const evento of CORPUS) {
    for (const texto of textosDe(evento)) {
      for (const re of INSTRUCOES_AO_CORPO) {
        assert.doesNotMatch(
          texto,
          re,
          `${evento.tipo} / "${evento.titulo}" manda o leitor fazer algo com o corpo (${re}).\nTrecho: ${texto.slice(0, 160)}`
        );
      }
    }
  }
});

test('nenhum texto dá instrução de agenda ao leitor — nem imperativo, nem "você"', () => {
  // A variante de gravata da instrução ao corpo: "não assine contratos hoje",
  // "anote suas intenções". Também proíbe a segunda pessoa, que é o degrau
  // anterior a qualquer prescrição.
  const IMPERATIVOS = [
    /\bvocê\b/i, /\bvocês\b/i, /\bteu\b/i, /\btua\b/i,
    /\banote\b/i, /\bescreva\b/i, /\bpergunte\b/i, /\bfaça\b/i, /\bcomece\b/i,
    /\bassine\b/i, /\bnão assine\b/i, /\bevite\b/i, /\bprocure\b/i, /\bplante\b/i,
    /\bcolha\b/i, /\bsolte o que\b/i, /\bpeça\b/i, /\bdedique\b/i, /\bsepare\b/i,
    /\bpense (em|no|na)\b/i, /\breserve\b/i,
  ];
  for (const evento of CORPUS) {
    for (const texto of textosDe(evento)) {
      for (const re of IMPERATIVOS) {
        assert.doesNotMatch(
          texto,
          re,
          `${evento.tipo} / "${evento.titulo}" instrui o leitor (${re}).\nTrecho: ${texto.slice(0, 160)}`
        );
      }
    }
  }
});

test('a tradição é sempre contada no PASSADO e com dono', () => {
  // "a lavoura romana plantava X", nunca "plante X". A marca de imperfeito
  // (-ava / -ia / era / eram) é o sinal que o teste procura, e obra, autor e
  // século são obrigatórios em cada bloco.
  let comTradicao = 0;
  for (const evento of CORPUS) {
    if (!evento.tradicao) continue;
    comTradicao++;
    const { texto, obra, autor, seculo } = evento.tradicao;
    assert.ok(texto && texto.length > 60, `${evento.titulo}: bloco de tradição curto demais pra explicar algo`);
    assert.ok(obra && obra.length > 3, `${evento.titulo}: tradição sem obra`);
    assert.ok(autor && autor.length > 3, `${evento.titulo}: tradição sem autor`);
    assert.match(seculo || '', /séc\.|\d{4}/, `${evento.titulo}: tradição sem século`);
    assert.match(
      texto,
      /\w{3,}(ava|avam|iam)\b|\w{4,}ia\b|\b(era|eram|foi|foram|havia)\b/,
      `${evento.titulo}: o bloco de tradição não está no passado.\nTrecho: ${texto.slice(0, 160)}`
    );
  }
  assert.ok(comTradicao >= 6, `só ${comTradicao} eventos distintos trazem tradição — a camada 2 encolheu`);
});

// ---------------------------------------------------------------------------
// A FORMA DO TEXTO: POVÃO ABRE, RECIBO FECHA
// ---------------------------------------------------------------------------

const MARCAS_DE_CITACAO = [
  'Ptolomeu', 'Tetrabiblos', 'Valente', 'Valens', 'Anthologiae', 'Plínio', 'Naturalis',
  'Columela', 'De Re Rustica', 'Catão', 'De Agri Cultura', 'Hesíodo', 'Rudhyar', 'Lilly',
  'séc.', 'd.C.', 'a.C.',
];

test('todo parágrafo abre em língua de gente e só depois mostra o recibo', () => {
  for (const evento of CORPUS) {
    const p = evento.paragrafo;
    assert.ok(typeof p === 'string' && p.length > 150, `${evento.titulo}: parágrafo curto demais`);
    const corte = p.indexOf(MARCA_RECIBO);
    assert.ok(corte > 0, `${evento.titulo}: parágrafo sem o marcador "${MARCA_RECIBO}"`);

    const conversa = p.slice(0, corte);
    const recibo = p.slice(corte);

    assert.ok(conversa.length >= 120, `${evento.titulo}: a parte em língua de gente ficou curta demais (${conversa.length} caracteres)`);
    for (const marca of MARCAS_DE_CITACAO) {
      assert.ok(
        !conversa.includes(marca),
        `${evento.titulo}: "${marca}" apareceu ANTES do recibo — a ordem pedida é povão primeiro, fonte depois.\nAbertura: ${conversa.slice(0, 160)}`
      );
    }
    assert.match(recibo, /séc\. [IVXL]+ (a|d)\.C\.|\b1[6-9]\d{2}\b|\b19\d{2}\b/, `${evento.titulo}: o recibo não diz o século`);
    assert.ok(
      MARCAS_DE_CITACAO.some((m) => recibo.includes(m) && m !== 'séc.' && m !== 'd.C.' && m !== 'a.C.'),
      `${evento.titulo}: o recibo não nomeia obra nem autor`
    );
  }
});

// ---------------------------------------------------------------------------
// A BASE, ABERTA DE VERDADE — o mecanismo de test/jornada.test.js, portado
// ---------------------------------------------------------------------------
// Este arquivo não lia docs/tradicao/ em ponto nenhum: MARCAS_DE_CITACAO só
// conferia que EXISTE uma string com cara de citação. Um capítulo inventado, um
// autor trocado ou um ano errado passavam verdes. Agora cada evento declara
// `lastro: { doc, provas }` e o teste abre o arquivo e procura cada prova.
const BASE = path.join(__dirname, '..', 'docs', 'tradicao');
const _docs = {};
function lerDoc(arquivo) {
  if (!_docs[arquivo]) _docs[arquivo] = fs.readFileSync(path.join(BASE, arquivo), 'utf8');
  return _docs[arquivo];
}

test('todo evento declara lastro, e TODA prova aparece literalmente no documento da base', () => {
  const faltando = [];
  for (const evento of CORPUS) {
    assert.ok(evento.lastro && evento.lastro.doc, `${evento.titulo}: sem lastro na base`);
    assert.ok(
      Array.isArray(evento.lastro.provas) && evento.lastro.provas.length >= 2,
      `${evento.titulo}: menos de 2 provas — sem prova literal o \`doc\` é só um caminho bonito`
    );
    const alvo = path.join(BASE, evento.lastro.doc);
    assert.ok(fs.existsSync(alvo), `${evento.titulo}: lastro aponta pra ${evento.lastro.doc}, que não existe`);
    const texto = lerDoc(evento.lastro.doc);
    for (const prova of evento.lastro.provas) {
      if (!texto.includes(prova)) {
        faltando.push(`${evento.titulo} → ${evento.lastro.doc} não contém ${JSON.stringify(prova)}`);
      }
    }
  }
  assert.deepEqual(faltando, [], `lastro sem prova na base:\n${faltando.join('\n')}`);
});

test('nenhuma data solta — todo século e todo ano da prosa pertencem a um lastro declarado', () => {
  // A varredura no sentido contrário, que só test/jornada.test.js fazia. As
  // provas garantem que o que está na TABELA existe na base; esta garante que o
  // que está no TEXTO existe na tabela.
  const palheiro = CORPUS.flatMap((e) => [
    e.fonte,
    e.tradicao ? `${e.tradicao.obra} ${e.tradicao.autor} ${e.tradicao.seculo}` : '',
    ...((e.lastro && e.lastro.provas) || []),
  ]).join(' || ');

  const soltas = [];
  for (const evento of CORPUS) {
    for (const texto of textosDe(evento)) {
      const achados = new Set();
      for (const m of texto.matchAll(/\b(1[0-9]{3}|20[0-9]{2})\b/g)) achados.add(m[1]);
      for (const m of texto.matchAll(/s[ée]c\.\s*[IVXL]+/gi)) achados.add(m[0]);
      for (const achado of achados) {
        if (!palheiro.includes(achado)) {
          soltas.push(`${evento.tipo} / "${evento.titulo}": "${achado}" não pertence a lastro nenhum`);
        }
      }
    }
  }
  assert.deepEqual(soltas, [], `data sem dono no texto:\n${soltas.join('\n')}`);
});

test('todo evento traz o campo fonte com obra, autor e século', () => {
  for (const evento of CORPUS) {
    assert.ok(evento.fonte && evento.fonte.length > 20, `${evento.titulo}: sem campo fonte`);
    assert.match(evento.fonte, /séc\.|\d{4}/, `${evento.titulo}: fonte sem século — "${evento.fonte}"`);
    assert.ok(
      MARCAS_DE_CITACAO.some((m) => evento.fonte.includes(m)),
      `${evento.titulo}: fonte sem obra nem autor — "${evento.fonte}"`
    );
  }
});

test('todo evento tem a forma completa que a tela espera', () => {
  const TIPOS = new Set([
    'luaNova', 'luaCheia', 'quartoCrescente', 'quartoMinguante',
    'ingressoSolar', 'mercurioRetrogradoInicio', 'mercurioRetrogradoFim', 'aspectoExato',
  ]);
  const vistos = new Set();
  for (const evento of CORPUS) {
    assert.ok(TIPOS.has(evento.tipo), `tipo desconhecido: ${evento.tipo}`);
    vistos.add(evento.tipo);
    assert.ok(evento.data instanceof Date && !Number.isNaN(evento.data.getTime()), `${evento.titulo}: data inválida`);
    assert.ok(evento.titulo.length > 3 && evento.titulo.length <= 60, `${evento.titulo}: título fora do tamanho de cartão`);
    assert.ok(evento.emoji && evento.emoji.length <= 4, `${evento.titulo}: sem emoji`);
    assert.ok(['instante', 'dia'].includes(evento.precisao), `${evento.titulo}: precisão não declarada`);
    assert.ok(evento.detalhe && typeof evento.detalhe === 'object', `${evento.titulo}: sem detalhe calculado`);
  }
  assert.equal(vistos.size, TIPOS.size, `faltaram tipos no corpus: ${[...TIPOS].filter((t) => !vistos.has(t))}`);
});

// ---------------------------------------------------------------------------
// IDADE DECLARADA — a proposição 3 da tese em forma de teste
// ---------------------------------------------------------------------------

test('nada é vendido como mais antigo do que é', () => {
  // A EXCEÇÃO, e ela é a mesma já documentada em lib/grounding.js para
  // "earthing": o texto PODE escrever o clichê entre aspas quando existe
  // justamente para desmenti-lo — se não pudesse escrever a frase, não poderia
  // negá-la. Então a varredura roda no texto COM AS ASPAS APAGADAS, e o que
  // aparecia dentro delas precisa vir acompanhado de um desmentido explícito.
  const CLICHES = [
    [/tradição milenar/i, '"tradição milenar" sem dono nem data'],
    [/conhecimento milenar/i, '"conhecimento milenar" sem dono nem data'],
    [/sabedoria ancestral/i, '"sabedoria ancestral" sem dono nem data'],
    [/desde a antiguidade, (os|as) /i, 'antiguidade genérica sem fonte'],
    [/os antigos (sabiam|diziam|acreditavam) que/i, '"os antigos" não é autor'],
  ];
  const DESMENTIDO = /não tem|não está|não é|credita|folclore|contemporân|moderna|convenção|sem fonte antiga|inverte a fonte/i;

  for (const evento of CORPUS) {
    for (const texto of textosDe(evento)) {
      const foraDeAspas = texto.replace(/"[^"]*"/g, '" "');
      for (const [re, queixa] of CLICHES) {
        assert.doesNotMatch(foraDeAspas, re, `${evento.titulo}: ${queixa}.\nTrecho: ${texto.slice(0, 160)}`);
        if (re.test(texto)) {
          assert.match(
            texto,
            DESMENTIDO,
            `${evento.titulo}: citou o clichê entre aspas mas não o desmentiu.\nTrecho: ${texto.slice(0, 200)}`
          );
        }
      }
    }
  }
});

test('onde a prática é moderna, o texto usa a frase exata de "sem fonte antiga"', () => {
  // A Lua Nova é o caso: "plantar uma intenção" é leitura contemporânea. O
  // texto não pode amenizar isso em dez variações — a frase é constante.
  const luaNova = CORPUS.find((e) => e.tipo === 'luaNova');
  assert.ok(luaNova.avisoDeIdade.includes(SEM_FONTE_ANTIGA), 'a Lua Nova parou de datar a leitura contemporânea');
  assert.equal(SEM_FONTE_ANTIGA, 'prática popular contemporânea, sem fonte antiga localizada');
});

test('as oito fases continuam creditadas a Rudhyar, e o retrógrado continua desmontado', () => {
  // Os dois lugares onde o mercado inteiro erra e onde este app já pagou o
  // preço de errar junto (docs/tradicao/04 §3.1 e 11 §8.5).
  const quarto = CORPUS.find((e) => e.tipo === 'quartoCrescente');
  assert.match(quarto.paragrafo, /Rudhyar/, 'o quarto crescente deixou de datar a moldura de oito fases');
  assert.match(quarto.paragrafo, /1967/, 'sumiu o ano de Rudhyar');

  const cheia = CORPUS.find((e) => e.tipo === 'luaCheia');
  assert.match(
    cheia.tradicao.texto + cheia.avisoDeIdade,
    /minguante/i,
    'a Lua Cheia voltou a se vender como fase da colheita, contra Plínio XVIII.321'
  );

  const retro = CORPUS.find((e) => e.tipo === 'mercurioRetrogradoInicio');
  assert.match(retro.paragrafo, /ilusão de perspectiva/i, 'sumiu a explicação de que o movimento é aparente');
  assert.match(retro.avisoDeIdade, /1996/, 'sumiu a data em que a expressão entra na imprensa geral');
  assert.match(retro.paragrafo, /Valente/, 'o retrógrado ficou sem a fonte que o reduz a "atraso"');
});

test('a conjunção é declarada como NÃO sendo aspecto em Ptolomeu', () => {
  // I.13 tem quatro aspectos e a conjunção não é um deles — ela é "bodily
  // application" em I.24. É a correção que o app faz e o mercado não.
  const conj = CORPUS.find((e) => e.tipo === 'aspectoExato' && e.detalhe.aspecto === 'Conjunção');
  assert.ok(conj, 'nenhuma conjunção exata no corpus de dois anos');
  assert.match(conj.paragrafo, /NÃO é um aspecto/, 'a conjunção voltou a ser vendida como aspecto ptolomaico');
  assert.match(conj.paragrafo, /I\.24/, 'sumiu a referência ao capítulo onde a conjunção realmente aparece');
});

test('o orbe é declarado como convenção moderna de software, não como tradição', () => {
  const aspecto = CORPUS.find((e) => e.tipo === 'aspectoExato');
  assert.match(aspecto.avisoDeIdade, /convenção moderna/i, 'o orbe voltou a passar por doutrina antiga');
  assert.match(aspecto.avisoDeIdade, /não existe tabela de orbe/i, 'sumiu a afirmação de que o Tetrabiblos não tem orbe');
});

test('o ingresso separa signo de constelação e data a fronteira da IAU', () => {
  const ingresso = CORPUS.find((e) => e.tipo === 'ingressoSolar');
  assert.match(ingresso.paragrafo, /não é a constelação/i, 'o ingresso parou de separar signo de constelação');
  assert.match(ingresso.avisoDeIdade, /1930/, 'sumiu a data dos limites de constelação da IAU');
  assert.match(ingresso.paragrafo, /I\.22/, 'sumiu o capítulo que sustenta o zodíaco trópico');
});

test('a concordância do título de aspecto não sai "conjunção exato"', () => {
  // Detalhe de português que faz o leitor desconfiar do resto — e o resto aqui
  // é efeméride conferível.
  const femininos = ['conjunção', 'quadratura', 'oposição'];
  for (const e of CORPUS.filter((x) => x.tipo === 'aspectoExato')) {
    const feminino = femininos.some((f) => e.titulo.includes(f));
    assert.match(
      e.titulo,
      feminino ? /exata$/ : /exato$/,
      `título com concordância errada: "${e.titulo}"`
    );
  }
});
