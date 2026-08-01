// test/profeccoes.test.js
// AS TRAVAS DAS PROFECÇÕES ANUAIS E MENSAIS (lib/profeccoes.js).
//
// Sete trabalhos, na ordem de importância:
//
// (1) A ARITMÉTICA DA TRADIÇÃO. `casa = (idade % 12) + 1`, a roda de doze, e a
//     tabela de domicílios de Ptolomeu I.17 que dá o Senhor do Ano. O exemplo
//     de Ascendente em Virgem publicado em docs/tradicao/13 §7.5 é conferido
//     linha por linha — se o motor divergir da tabela da base, é o motor que
//     está errado.
//
// (2) A IDADE SAI DO RETORNO SOLAR, NÃO DO CALENDÁRIO. Este é o teste que
//     justifica a feature existir do jeito que existe. A base mediu três
//     instantes de virada para o nascimento 1990-03-14 09:30 UTC
//     (doc 13 §7.4) e um deles cai UM DIA ANTES do aniversário. O motor tem
//     que reproduzir os três, ao minuto. Uma implementação por diferença de
//     datas erraria o Senhor do Ano justamente na véspera do aniversário —
//     que é quando o usuário mais olha.
//
// (3) NUNCA FABRICAR CÉU, NUNCA DEIXAR BECO SEM SAÍDA. Sem data, com data
//     impossível, com "hoje" anterior ao nascimento → `disponivel: false` com
//     motivo e texto. E sem hora/cidade a feature EXISTE (profecção do Sol,
//     Ptolomeu IV.10) e diz o que falta em `melhoraCom`.
//
// (4) O GOLDEN DO PORTUGUÊS. O PT é a fonte de verdade e não muda um byte. Os
//     textos abaixo foram capturados do motor com entradas fixas; se este
//     teste quebrar, alguém alterou o conteúdo — isso é falha, não melhoria.
//     Os INSTANTES são comparados ao MINUTO de propósito: eles saem da
//     efeméride (astronomy-engine), e milissegundo não é contrato.
//
// (5) A PARIDADE DOS TRÊS PACKS. Mesmas chaves em toda profundidade, nenhum
//     valor vazio, mesmos placeholders {x}, mesmos tamanhos de array.
//
// (6) A LINHA VERMELHA NOS TRÊS IDIOMAS. Nenhuma alegação de saúde nem
//     implícita (pt aliviar/acalmar/curar/tratar/energizar · es aliviar/
//     calmar/sanar/curar/tratar · en relieve/soothe/calm/heal/cure/treat),
//     nenhuma promessa de resultado, nenhum veredito, nenhum mecanismo
//     pseudocientífico, nenhum aviso defensivo. Fírmico e Valente listam
//     doença sob as casas 6 e 12 e sob Saturno: isso só pode aparecer como
//     registro histórico com dono e século, e o teste confere que aparece
//     apenas nos campos de fonte, nunca na abertura.
//
// (7) PRENDE PRIMEIRO, FONTE DEPOIS. Toda abertura (`prende`, `mes`, `curto`,
//     `comoFunciona`) abre na vida real: nos primeiros 70 caracteres não pode
//     haver ano de quatro dígitos, marcador de século nem nome de autor.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

// --- fake do AsyncStorage, injetado ANTES do módulo sob teste ---------------
// lib/profeccoes.js é puro e não toca storage, mas ele importa lib/signs.js,
// que puxa lib/synastry.js. O fake existe para o teste nunca depender do que
// essa cadeia venha a importar amanhã. Mesma armadilha documentada em
// test/rituais.test.js: lib/storage.js memoriza o módulo na primeira chamada.
const memStorage = new Map();
const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return memStorage.has(k) ? memStorage.get(k) : null;
    },
    async setItem(k, v) {
      memStorage.set(k, String(v));
    },
    async removeItem(k) {
      memStorage.delete(k);
    },
  },
};
const carregarOriginal = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return carregarOriginal.call(this, request, parent, isMain);
};

const P = require('../lib/profeccoes.js');
const { DOMICILIO_POR_SIGNO: DOMICILIO_HOROSCOPO } = require('../lib/dailyHoroscope.js');
const { SIGNS } = require('../lib/signs.js');

const PACKS = {
  pt: require('../lib/traducoes/profeccoes.pt.js').PACK,
  es: require('../lib/traducoes/profeccoes.es.js').PACK,
  en: require('../lib/traducoes/profeccoes.en.js').PACK,
};
const IDIOMAS = ['pt', 'es', 'en'];

const RAIZ = path.resolve(__dirname, '..');

// Cidade de teste — o mesmo formato que lib/cities.js entrega e que
// screens/BirthChartScreen.js já passa para ascendantSign/houses.
const SP = {
  name: 'São Paulo',
  lat: -23.5505,
  lon: -46.6333,
  timezone: 'America/Sao_Paulo',
  utcOffset: -3,
};

const ateOMinuto = (iso) => String(iso).slice(0, 16);

// ---------------------------------------------------------------------------
// (1) A ARITMÉTICA DA TRADIÇÃO
// ---------------------------------------------------------------------------

test('casa = (idade % 12) + 1 — a conta inteira de Ptolomeu IV.10', () => {
  assert.equal(P.casaDaIdade(0), 1);
  assert.equal(P.casaDaIdade(1), 2);
  assert.equal(P.casaDaIdade(11), 12);
  assert.equal(P.casaDaIdade(12), 1); // a roda fecha e recomeça
  assert.equal(P.casaDaIdade(24), 1);
  assert.equal(P.casaDaIdade(36), 1);
  for (let idade = 0; idade <= 120; idade++) {
    const casa = P.casaDaIdade(idade);
    assert.ok(casa >= 1 && casa <= 12, `idade ${idade} caiu fora da roda`);
    assert.equal(casa, (idade % 12) + 1);
  }
  // Nunca fabrica: idade impossível não vira casa.
  assert.equal(P.casaDaIdade(-1), null);
  assert.equal(P.casaDaIdade(NaN), null);
});

test('a roda anda um signo por ano, na ordem dos signos, e volta em doze', () => {
  assert.deepEqual(P.ORDEM_SIGNOS, SIGNS.map((s) => s.name));
  assert.equal(P.signoDeslocado('Virgem', 0), 'Virgem');
  assert.equal(P.signoDeslocado('Virgem', 1), 'Libra');
  assert.equal(P.signoDeslocado('Virgem', 12), 'Virgem');
  assert.equal(P.signoDeslocado('Peixes', 1), 'Áries'); // cruza o fim da roda
  assert.equal(P.signoDeslocado('não é signo', 3), null);
});

test('a tabela de domicílios é a de Ptolomeu I.17 — 12 signos, 7 planetas', () => {
  assert.equal(Object.keys(P.DOMICILIO_POR_SIGNO).length, 12);
  for (const signo of P.ORDEM_SIGNOS) {
    assert.ok(P.DOMICILIO_POR_SIGNO[signo], `${signo} ficou sem regente`);
  }
  const planetas = new Set(Object.values(P.DOMICILIO_POR_SIGNO));
  assert.deepEqual(
    [...planetas].sort(),
    ['jupiter', 'lua', 'marte', 'mercurio', 'saturno', 'sol', 'venus']
  );
  // Os luminares regem um signo só; os cinco restantes regem dois. É a
  // dedução de Ptolomeu I.17 (semicírculo solar Leão→Capricórnio, lunar
  // Aquário→Câncer) e não uma lista arbitrária.
  const conta = {};
  for (const p of Object.values(P.DOMICILIO_POR_SIGNO)) conta[p] = (conta[p] || 0) + 1;
  assert.equal(conta.sol, 1);
  assert.equal(conta.lua, 1);
  for (const p of ['mercurio', 'venus', 'marte', 'jupiter', 'saturno']) {
    assert.equal(conta[p], 2, `${p} deveria ter dois domicílios`);
  }
  assert.equal(P.DOMICILIO_POR_SIGNO['Leão'], 'sol');
  assert.equal(P.DOMICILIO_POR_SIGNO['Câncer'], 'lua');
  assert.equal(P.DOMICILIO_POR_SIGNO['Escorpião'], 'marte'); // NÃO Plutão (1930)
  assert.equal(P.DOMICILIO_POR_SIGNO['Aquário'], 'saturno'); // NÃO Urano (1781)
  assert.equal(P.DOMICILIO_POR_SIGNO['Peixes'], 'jupiter'); // NÃO Netuno (1846)
});

test('a tabela bate com a de lib/dailyHoroscope.js — duas cópias não podem divergir', () => {
  // O app não pode ter duas tabelas de regência discordando entre si. Esta
  // usa ids canônicos ('venus'); a de lá usa nomes de tela ('Vênus').
  const nomePorId = {
    sol: 'Sol',
    lua: 'Lua',
    mercurio: 'Mercúrio',
    venus: 'Vênus',
    marte: 'Marte',
    jupiter: 'Júpiter',
    saturno: 'Saturno',
  };
  for (const [signo, id] of Object.entries(P.DOMICILIO_POR_SIGNO)) {
    assert.equal(
      nomePorId[id],
      DOMICILIO_HOROSCOPO[signo],
      `${signo}: profeccoes diz ${id}, dailyHoroscope diz ${DOMICILIO_HOROSCOPO[signo]}`
    );
  }
});

test('o exemplo de Ascendente em Virgem publicado na base (doc 13 §7.5) confere', () => {
  // | Idade | Casa | Signo | Senhor do Ano |
  const tabelaDaBase = [
    [0, 1, 'Virgem', 'mercurio'],
    [1, 2, 'Libra', 'venus'],
    [12, 1, 'Virgem', 'mercurio'],
    [24, 1, 'Virgem', 'mercurio'],
    [29, 6, 'Aquário', 'saturno'],
    [30, 7, 'Peixes', 'jupiter'],
    [41, 6, 'Aquário', 'saturno'],
  ];
  for (const [idade, casa, signo, senhor] of tabelaDaBase) {
    assert.equal(P.casaDaIdade(idade), casa, `idade ${idade}: casa`);
    assert.equal(P.signoDeslocado('Virgem', idade), signo, `idade ${idade}: signo`);
    assert.equal(P.senhorDoSigno(signo), senhor, `idade ${idade}: senhor do ano`);
  }
});

// ---------------------------------------------------------------------------
// (2) A IDADE SAI DO RETORNO SOLAR — o teste que justifica a feature
// ---------------------------------------------------------------------------

test('a virada do ano reproduz os três instantes medidos na base (doc 13 §7.4)', () => {
  // Nascimento 1990-03-14 09:30 UTC. A base publicou:
  //   29 → 2019-03-14 10:10 UTC
  //   30 → 2020-03-13 16:04 UTC  ← UM DIA ANTES do aniversário
  //   31 → 2021-03-13 21:54 UTC
  const nasc = { date: '1990-03-14', time: '09:30' };
  const esperado = {
    29: '2019-03-14T10:10',
    30: '2020-03-13T16:04',
    31: '2021-03-13T21:54',
  };
  for (const [idade, instante] of Object.entries(esperado)) {
    // Um instante seguramente dentro do ano de vida em questão.
    const dentro = new Date(new Date(instante + ':00Z').getTime() + 30 * 86400000);
    const r = P.profeccaoAnual(nasc, dentro);
    assert.equal(r.disponivel, true);
    assert.equal(r.idade, Number(idade), `idade em ${instante}`);
    assert.equal(ateOMinuto(r.viradaDoAno), instante, `virada do ano ${idade}`);
  }
});

test('no dia 13/03/2020 o ano JÁ virou — o erro que a diferença de datas cometeria', () => {
  const nasc = { date: '1990-03-14', time: '09:30' };
  // 13/03/2020 às 18:00Z: o aniversário do calendário é só amanhã, mas o Sol
  // já voltou ao grau natal às 16:04Z. Quem contasse "já fez aniversário?"
  // diria 29 anos e daria Saturno como Senhor do Ano; a fonte diz 30.
  const depois = P.profeccaoAnual(nasc, '2020-03-13T18:00:00Z');
  assert.equal(depois.idade, 30);
  assert.equal(depois.casaProfectada, 7);

  const antes = P.profeccaoAnual(nasc, '2020-03-13T12:00:00Z');
  assert.equal(antes.idade, 29);
  assert.equal(antes.casaProfectada, 6);

  // E as duas leituras dão Senhores do Ano DIFERENTES — é por isso que a
  // precisão importa e não é preciosismo.
  assert.notEqual(antes.senhorDoAnoId, depois.senhorDoAnoId);
});

test('o ano profectado tem exatamente um retorno solar de duração', () => {
  const r = P.profeccaoAnual('1990-03-14', '2026-07-31');
  const dur = new Date(r.proximaVirada).getTime() - new Date(r.viradaDoAno).getTime();
  const dias = dur / 86400000;
  assert.ok(dias > 365.0 && dias < 365.5, `ano profectado com ${dias} dias`);
});

test('a idade avança de um em um, sem buraco e sem repetição, ao longo de 40 anos', () => {
  const nasc = { date: '1990-03-14', time: '09:30' };
  let anterior = null;
  for (let ano = 1991; ano <= 2030; ano++) {
    const r = P.profeccaoAnual(nasc, `${ano}-06-15`);
    assert.equal(r.disponivel, true);
    assert.equal(r.idade, ano - 1990, `em ${ano}`);
    if (anterior !== null) assert.equal(r.idade, anterior + 1);
    anterior = r.idade;
  }
});

// ---------------------------------------------------------------------------
// (3) NUNCA FABRICAR CÉU, NUNCA DEIXAR BECO SEM SAÍDA
// ---------------------------------------------------------------------------

test('sem data, com data impossível ou antes do nascimento: declara indisponível', () => {
  for (const fn of [P.profeccaoAnual, P.profeccaoMensal]) {
    const semData = fn(null);
    assert.equal(semData.disponivel, false);
    assert.equal(semData.motivo, 'semData');
    assert.ok(semData.texto.length > 20);

    assert.equal(fn('1990-02-30').motivo, 'dataInvalida'); // fevereiro não tem 30
    assert.equal(fn('1990-13-01').motivo, 'dataInvalida');
    assert.equal(fn('14/03/1990').motivo, 'dataInvalida'); // formato errado
    assert.equal(fn({ nada: true }).motivo, 'semData');
    assert.equal(fn('1990-03-14', '1989-01-01').motivo, 'antesDoNascimento');

    // O indisponível nunca inventa casa, signo ou senhor.
    for (const chave of ['idade', 'casaProfectada', 'signoDoAno', 'senhorDoAno']) {
      assert.equal(semData[chave], undefined, `indisponível vazou ${chave}`);
    }
  }
});

test('o texto de indisponível diz o que fazer, nos três idiomas', () => {
  for (const lang of IDIOMAS) {
    for (const motivo of ['semData', 'dataInvalida', 'semEfemeride', 'antesDoNascimento']) {
      const t = PACKS[lang].indisponivel[motivo];
      assert.equal(typeof t, 'string');
      assert.ok(t.trim().length > 30, `${lang}/${motivo} curto demais`);
    }
  }
});

test('só com a data a feature EXISTE — profecção do Sol, e diz o que falta', () => {
  const r = P.profeccaoAnual('1990-03-14', '2026-07-31');
  assert.equal(r.disponivel, true);
  assert.equal(r.origem, 'sol');
  assert.equal(r.signoDePartidaId, 'Peixes'); // o Sol de 14/03/1990
  assert.ok(r.melhoraCom, 'sem hora e sem cidade tem que haver caminho de saída');
  assert.deepEqual(r.melhoraCom.falta, ['hora', 'cidade']);
  assert.match(r.melhoraCom.texto, /Mapa Astral/);
  // E a fonte primária da escolha vem junto, não é modo degradado inventado.
  assert.match(r.origemTexto, /Ptolomeu/);
  assert.match(r.origemGlosa, /dignidades/);
  assert.match(P.VERBATIM.prorrogativos.texto, /that from the sun to dignities and glory/);
});

test('com hora mas sem cidade, falta só a cidade', () => {
  const r = P.profeccaoAnual({ date: '1990-03-14', time: '09:30' }, '2026-07-31');
  assert.equal(r.origem, 'sol');
  assert.deepEqual(r.melhoraCom.falta, ['cidade']);
});

test('com hora e cidade a contagem sai do Ascendente e não há mais o que faltar', () => {
  const r = P.profeccaoAnual({ date: '1990-03-14', time: '09:30', city: SP }, '2026-07-31');
  assert.equal(r.origem, 'ascendente');
  assert.equal(r.signoDePartidaId, 'Touro');
  assert.equal(r.melhoraCom, null);
  assert.equal(r.precisao, 'exata');
  assert.match(r.origemRotulo, /Ascendente/);
  // O ponto de partida muda o resultado inteiro — é por isso que vale pedir.
  const semHora = P.profeccaoAnual('1990-03-14', '2026-07-31');
  assert.notEqual(r.signoDoAnoId, semHora.signoDoAnoId);
});

test('a cidade também é aceita com latitude/longitude por extenso', () => {
  const cidade = { latitude: -23.5505, longitude: -46.6333, timezone: 'America/Sao_Paulo' };
  const r = P.profeccaoAnual({ date: '1990-03-14', time: '09:30', city: cidade }, '2026-07-31');
  assert.equal(r.origem, 'ascendente');
});

// ---------------------------------------------------------------------------
// A CAMADA MENSAL — 28 dias por signo (Ptolomeu IV.10)
// ---------------------------------------------------------------------------

test('a camada mensal usa 28 dias por signo, contados do retorno solar', () => {
  assert.equal(P.DIAS_POR_SIGNO_MENSAL, 28);
  const nasc = { date: '1990-03-14', time: '09:30', city: SP };
  const ano = P.profeccaoAnual(nasc, '2026-07-31');
  const virada = new Date(ano.viradaDoAno).getTime();

  const primeiro = P.profeccaoMensal(nasc, virada + 3600000);
  assert.equal(primeiro.segmento, 0);
  assert.equal(primeiro.mes, 1);
  // O primeiro trecho começa no signo DO ANO — "starting from the places that
  // govern the year", Ptolomeu IV.10.
  assert.equal(primeiro.signoDoMesId, ano.signoDoAnoId);
  assert.equal(primeiro.casaDoMes, ano.casaProfectada);

  const segundo = P.profeccaoMensal(nasc, virada + 28 * 86400000 + 3600000);
  assert.equal(segundo.segmento, 1);
  assert.equal(segundo.signoDoMesId, P.signoDeslocado(ano.signoDoAnoId, 1));

  // A janela de cada trecho tem 28 dias cravados (menos o último, que é
  // aparado pela virada do ano seguinte).
  const dur = new Date(segundo.fim).getTime() - new Date(segundo.inicio).getTime();
  assert.equal(dur, 28 * 86400000);
});

test('treze mudanças de signo dentro de um ano profectado — nem doze, nem catorze', () => {
  const nasc = { date: '1990-03-14', time: '09:30', city: SP };
  const ano = P.profeccaoAnual(nasc, '2026-07-31');
  const virada = new Date(ano.viradaDoAno).getTime();
  const fim = new Date(ano.proximaVirada).getTime();

  const trechos = [];
  for (let t = virada + 3600000; t < fim; t += 6 * 3600000) {
    const r = P.profeccaoMensal(nasc, t);
    const chave = `${r.segmento}:${r.signoDoMesId}`;
    if (trechos[trechos.length - 1] !== chave) trechos.push(chave);
  }
  // 13 × 28 = 364 dias; o resto do ano tropical cabe no trecho 13. Catorze
  // trechos, treze mudanças — é exatamente o que a base descreve.
  assert.equal(trechos.length, 14, trechos.join(' | '));
  assert.equal(trechos.length - 1, 13);
  assert.equal(trechos[0], `0:${ano.signoDoAnoId}`);
  assert.equal(trechos[12], `12:${ano.signoDoAnoId}`); // a roda mensal fecha
});

test('o mensal carrega o ano junto — a tela precisa das duas camadas', () => {
  const r = P.profeccaoMensal({ date: '1990-03-14', time: '09:30', city: SP }, '2026-07-31');
  assert.equal(r.idade, 36);
  assert.equal(r.casaProfectada, 1);
  assert.equal(r.signoDoAnoId, 'Touro');
  assert.ok(r.casaDoMes >= 1 && r.casaDoMes <= 12);
  assert.equal(P.senhorDoSigno(r.signoDoMesId), r.senhorDoMesId);
});

// ---------------------------------------------------------------------------
// (4) O GOLDEN DO PORTUGUÊS — byte a byte
// ---------------------------------------------------------------------------
// NÃO reescreva estes textos a partir do pack "pra ficar igual": o valor deles
// é serem a fotografia do que foi escrito. Se divergirem, o PT mudou.

const GOLDEN = {
  anualSoData: {
    idade: 36,
    casaProfectada: 1,
    signoDoAno: 'Peixes',
    senhorDoAno: 'Júpiter',
    senhorDoAnoId: 'jupiter',
    nomeAntigoDaCasa: 'Horoskopos — "o leme"',
    titulo: 'Ano 36 · casa 1 · Peixes',
    texto:
      'A pergunta do ano volta pra você: o corpo, o nome, o jeito de aparecer na porta. Coisa que estava no colo dos outros volta pro seu. É a volta da roda ao ponto de partida — de doze em doze anos ela cai aqui.\n\nQuem está com a chave do ano é Júpiter. O ano abre espaço: o cargo que alguém oferece, o acordo que destrava, a papelada que enfim anda. Também é ano de filho, de herança e de assinar em nome de outro.',
    fonte:
      'Ptolomeu, Tetrabiblos IV.10 (séc. II) · Paulo de Alexandria, cap. 24 · Fírmico Materno, Mathesis II.XIX.2 (séc. IV) · Vétio Valente, Anthologiae I.1 (séc. II) · Ptolomeu, Tetrabiblos I.5',
    viradaDoAno: '2026-03-14T05:33',
    proximaVirada: '2027-03-14T11:08',
  },
  anualVirada2020: {
    idade: 30,
    casaProfectada: 7,
    signoDoAno: 'Virgem',
    senhorDoAno: 'Mercúrio',
    nomeAntigoDaCasa: 'Dýsis — o Poente',
    titulo: 'Ano 30 · casa 7 · Virgem',
    texto:
      'Ano do outro: quem senta na sua frente. Casamento, sociedade, contrato, e também a briga que só existe porque tem duas pessoas nela. Pouca coisa se resolve sozinho num ano desses.\n\nQuem está com a chave do ano é Mercúrio. O ano fica falante: proposta, mensagem, conta pra fechar, papel pra assinar. Muita coisa se resolve por texto e por conversa — e muda de figura no meio do caminho.',
    fonte:
      'Ptolomeu, Tetrabiblos IV.10 (séc. II) · Fírmico Materno, Mathesis II.XIX.8 (séc. IV) · Paulo de Alexandria, cap. 24 · Vétio Valente, Anthologiae I.1 (séc. II)',
    viradaDoAno: '2020-03-13T16:04',
    proximaVirada: '2021-03-13T21:54',
  },
  anualAscendente: {
    idade: 36,
    casaProfectada: 1,
    signoDoAno: 'Touro',
    senhorDoAno: 'Vênus',
    titulo: 'Ano 36 · casa 1 · Touro',
    texto:
      'A pergunta do ano volta pra você: o corpo, o nome, o jeito de aparecer na porta. Coisa que estava no colo dos outros volta pro seu. É a volta da roda ao ponto de partida — de doze em doze anos ela cai aqui.\n\nQuem está com a chave do ano é Vênus. O assunto do ano é gente que você quer por perto: o acordo, o pedido, a reconciliação, o convite. E gastar com o que é bonito e achar que valeu.',
    viradaDoAno: '2026-03-14T06:03',
  },
  mensalSoData: {
    mes: 5,
    segmento: 4,
    casaDoMes: 5,
    signoDoMes: 'Câncer',
    senhorDoMes: 'Lua',
    nomeAntigoDaCasaDoMes: 'Boa Fortuna',
    titulo: 'Mês 5 do ano · casa 5 · Câncer',
    texto:
      'O que se faz por gosto — e a conversa sobre filho.\n\nNestes 28 dias quem segura a chave é a Lua. A Lua puxa o assunto pro que é de casa.',
    inicio: '2026-07-04T05:33',
    fim: '2026-08-01T05:33',
  },
};

test('GOLDEN PT — profecção anual só com a data', () => {
  const r = P.profeccaoAnual('1990-03-14', '2026-07-31');
  const g = GOLDEN.anualSoData;
  assert.equal(r.idade, g.idade);
  assert.equal(r.casaProfectada, g.casaProfectada);
  assert.equal(r.signoDoAno, g.signoDoAno);
  assert.equal(r.senhorDoAno, g.senhorDoAno);
  assert.equal(r.senhorDoAnoId, g.senhorDoAnoId);
  assert.equal(r.nomeAntigoDaCasa, g.nomeAntigoDaCasa);
  assert.equal(r.titulo, g.titulo);
  assert.equal(r.texto, g.texto);
  assert.equal(r.fonte, g.fonte);
  assert.equal(ateOMinuto(r.viradaDoAno), g.viradaDoAno);
  assert.equal(ateOMinuto(r.proximaVirada), g.proximaVirada);
});

test('GOLDEN PT — a virada de 2020, um dia antes do aniversário', () => {
  const r = P.profeccaoAnual({ date: '1990-03-14', time: '09:30' }, '2020-03-13T18:00:00Z');
  const g = GOLDEN.anualVirada2020;
  assert.equal(r.idade, g.idade);
  assert.equal(r.casaProfectada, g.casaProfectada);
  assert.equal(r.signoDoAno, g.signoDoAno);
  assert.equal(r.senhorDoAno, g.senhorDoAno);
  assert.equal(r.nomeAntigoDaCasa, g.nomeAntigoDaCasa);
  assert.equal(r.titulo, g.titulo);
  assert.equal(r.texto, g.texto);
  assert.equal(r.fonte, g.fonte);
  assert.equal(ateOMinuto(r.viradaDoAno), g.viradaDoAno);
  assert.equal(ateOMinuto(r.proximaVirada), g.proximaVirada);
});

test('GOLDEN PT — profecção anual pelo Ascendente', () => {
  const r = P.profeccaoAnual({ date: '1990-03-14', time: '09:30', city: SP }, '2026-07-31');
  const g = GOLDEN.anualAscendente;
  assert.equal(r.idade, g.idade);
  assert.equal(r.casaProfectada, g.casaProfectada);
  assert.equal(r.signoDoAno, g.signoDoAno);
  assert.equal(r.senhorDoAno, g.senhorDoAno);
  assert.equal(r.titulo, g.titulo);
  assert.equal(r.texto, g.texto);
  assert.equal(ateOMinuto(r.viradaDoAno), g.viradaDoAno);
});

test('GOLDEN PT — profecção mensal', () => {
  const r = P.profeccaoMensal('1990-03-14', '2026-07-31');
  const g = GOLDEN.mensalSoData;
  assert.equal(r.mes, g.mes);
  assert.equal(r.segmento, g.segmento);
  assert.equal(r.casaDoMes, g.casaDoMes);
  assert.equal(r.signoDoMes, g.signoDoMes);
  assert.equal(r.senhorDoMes, g.senhorDoMes);
  assert.equal(r.nomeAntigoDaCasaDoMes, g.nomeAntigoDaCasaDoMes);
  assert.equal(r.titulo, g.titulo);
  assert.equal(r.texto, g.texto);
  assert.equal(ateOMinuto(r.inicio), g.inicio);
  assert.equal(ateOMinuto(r.fim), g.fim);
});

test('chamada sem `lang` é idêntica a lang="pt" — compatibilidade do default', () => {
  const semLang = P.profeccaoAnual('1990-03-14', '2026-07-31');
  const comPt = P.profeccaoAnual('1990-03-14', '2026-07-31', 'pt');
  assert.equal(semLang.texto, comPt.texto);
  assert.equal(semLang.fonte, comPt.fonte);
  assert.equal(semLang.titulo, comPt.titulo);
  // Idioma desconhecido cai no PT — nunca numa tradução inventada na hora.
  const desconhecido = P.profeccaoAnual('1990-03-14', '2026-07-31', 'fr');
  assert.equal(desconhecido.texto, comPt.texto);
});

test('a saída em es e en muda o texto e NÃO muda a conta', () => {
  const pt = P.profeccaoAnual('1990-03-14', '2026-07-31', 'pt');
  for (const lang of ['es', 'en']) {
    const r = P.profeccaoAnual('1990-03-14', '2026-07-31', lang);
    assert.equal(r.idade, pt.idade);
    assert.equal(r.casaProfectada, pt.casaProfectada);
    assert.equal(r.signoDoAnoId, pt.signoDoAnoId);
    assert.equal(r.senhorDoAnoId, pt.senhorDoAnoId);
    assert.equal(r.viradaDoAno, pt.viradaDoAno);
    assert.notEqual(r.texto, pt.texto);
    assert.ok(r.texto.length > 100, `${lang}: texto curto demais`);
  }
});

// ---------------------------------------------------------------------------
// (5) A PARIDADE DOS TRÊS PACKS
// ---------------------------------------------------------------------------

function caminhosDe(valor, prefixo = '', saida = new Map()) {
  if (typeof valor === 'string' || typeof valor === 'number' || typeof valor === 'boolean') {
    saida.set(prefixo, typeof valor);
    return saida;
  }
  if (Array.isArray(valor)) {
    saida.set(prefixo, `array:${valor.length}`);
    valor.forEach((v, i) => caminhosDe(v, `${prefixo}[${i}]`, saida));
    return saida;
  }
  if (valor && typeof valor === 'object') {
    saida.set(prefixo, 'object');
    for (const k of Object.keys(valor).sort()) caminhosDe(valor[k], `${prefixo}.${k}`, saida);
    return saida;
  }
  saida.set(prefixo, String(valor));
  return saida;
}

test('os três packs têm exatamente a mesma FORMA — chaves, tipos e tamanhos', () => {
  const base = caminhosDe(PACKS.pt);
  for (const lang of ['es', 'en']) {
    const outro = caminhosDe(PACKS[lang]);
    const faltando = [...base.keys()].filter((k) => !outro.has(k));
    const sobrando = [...outro.keys()].filter((k) => !base.has(k));
    assert.deepEqual(faltando, [], `${lang} não tem: ${faltando.slice(0, 8).join(', ')}`);
    assert.deepEqual(sobrando, [], `${lang} tem a mais: ${sobrando.slice(0, 8).join(', ')}`);
    for (const [k, tipo] of base) {
      // `idioma` é o único campo que MUDA de valor por definição.
      if (k === '.idioma') continue;
      assert.equal(outro.get(k), tipo, `${lang}${k}: tipo/tamanho diferente`);
    }
  }
});

test('nenhum valor de texto vem vazio em nenhum idioma', () => {
  for (const lang of IDIOMAS) {
    for (const [caminho, tipo] of caminhosDe(PACKS[lang])) {
      if (tipo !== 'string') continue;
      const valor = caminho
        .split(/[.[\]]/)
        .filter(Boolean)
        .reduce((o, k) => o[k], PACKS[lang]);
      assert.ok(String(valor).trim().length > 0, `${lang}${caminho} está vazio`);
    }
  }
});

test('mesmos placeholders {x} nos três idiomas', () => {
  const placeholders = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(',');
  for (const [caminho, tipo] of caminhosDe(PACKS.pt)) {
    if (tipo !== 'string') continue;
    const ler = (pack) =>
      caminho
        .split(/[.[\]]/)
        .filter(Boolean)
        .reduce((o, k) => o[k], pack);
    const esperado = placeholders(ler(PACKS.pt));
    for (const lang of ['es', 'en']) {
      assert.equal(placeholders(ler(PACKS[lang])), esperado, `${lang}${caminho}: placeholders`);
    }
  }
});

test('preencher() troca o que conhece e deixa intacto o que não conhece', () => {
  assert.equal(P.preencher('quem manda é {planeta}', { planeta: 'Vênus' }), 'quem manda é Vênus');
  assert.equal(P.preencher('sobrou {x}', {}), 'sobrou {x}');
  assert.equal(P.preencher(null), '');
});

// ---------------------------------------------------------------------------
// O CANÔNICO NÃO SE TRADUZ
// ---------------------------------------------------------------------------

test('o verbatim de Robbins é idêntico nos três packs — citação não se traduz', () => {
  assert.deepEqual(PACKS.es.verbatim, PACKS.pt.verbatim);
  assert.deepEqual(PACKS.en.verbatim, PACKS.pt.verbatim);
  assert.match(PACKS.pt.verbatim.anual.texto, /one year to each sign/);
  assert.match(PACKS.pt.verbatim.mensal.texto, /twenty-eight days to a sign/);
  assert.match(PACKS.pt.verbatim.anual.obra, /Tetrabiblos IV\.10/);
  assert.match(PACKS.pt.verbatim.anual.obra, /Robbins/);
});

test('os endereços na base são iguais nos três packs e os arquivos existem', () => {
  assert.deepEqual(PACKS.es.base, PACKS.pt.base);
  assert.deepEqual(PACKS.en.base, PACKS.pt.base);
  assert.ok(PACKS.pt.base.length >= 4);
  for (const { arquivo, locus } of PACKS.pt.base) {
    assert.ok(fs.existsSync(path.join(RAIZ, arquivo)), `não existe: ${arquivo}`);
    assert.ok(String(locus).trim().length > 0);
  }
});

test('ids e chaves canônicas não se traduzem', () => {
  for (const lang of IDIOMAS) {
    assert.deepEqual(Object.keys(PACKS[lang].signos), P.ORDEM_SIGNOS);
    assert.deepEqual(
      Object.keys(PACKS[lang].planetas).sort(),
      ['jupiter', 'lua', 'marte', 'mercurio', 'saturno', 'sol', 'venus']
    );
    assert.deepEqual(
      Object.keys(PACKS[lang].planetasNaFrase).sort(),
      Object.keys(PACKS[lang].planetas).sort()
    );
    assert.deepEqual(
      Object.keys(PACKS[lang].casas).map(Number).sort((a, b) => a - b),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    );
  }
});

test('o locus de cada casa e de cada planeta é o MESMO nos três idiomas', () => {
  // "Mathesis II.XIX.7" e "Anthologiae I.1" são endereços, não prosa: eles não
  // podem mudar quando a língua muda.
  const loci = (s) => (String(s).match(/\b[IVX]+\.(?:[IVX]+(?:\.\d+)?|\d+)\b/g) || []).sort().join(',');
  for (const n of Object.keys(PACKS.pt.casas)) {
    const esperado = loci(PACKS.pt.casas[n].fonte);
    assert.ok(esperado.length > 0, `casa ${n} sem locus na fonte`);
    for (const lang of ['es', 'en']) {
      assert.equal(loci(PACKS[lang].casas[n].fonte), esperado, `casa ${n} em ${lang}`);
    }
  }
  for (const id of Object.keys(PACKS.pt.senhores)) {
    const esperado = loci(PACKS.pt.senhores[id].fonte);
    assert.ok(esperado.length > 0, `senhor ${id} sem locus na fonte`);
    for (const lang of ['es', 'en']) {
      assert.equal(loci(PACKS[lang].senhores[id].fonte), esperado, `senhor ${id} em ${lang}`);
    }
  }
});

test('o nome antigo grego/latino do lugar sobrevive à tradução', () => {
  const semAcento = (s) =>
    String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const termos = {
    1: 'horoskopos',
    4: 'hypogeion',
    7: 'dysis',
    8: 'epicatafora',
    10: 'mesouranema',
    11: 'agathos daimon',
    12: 'cacodaemon',
  };
  for (const [n, termo] of Object.entries(termos)) {
    for (const lang of IDIOMAS) {
      assert.ok(
        semAcento(PACKS[lang].casas[n].nomeAntigo).includes(termo),
        `casa ${n} em ${lang} perdeu "${termo}": ${PACKS[lang].casas[n].nomeAntigo}`
      );
    }
  }
});

test('toda tradição carrega obra/autor E século — a lei do locus', () => {
  const AUTOR = /Ptolo|Ptolemy|Fírmico|Firmico|Firmicus|Valente|Valens|Paulo|Paul |Ward|Brennan|Lilly|Rudhyar|Leo\b|Sasportas|Greene/;
  const SECULO = /séc\.\s*[IVX]+|s\.\s*[IVX]+|\d(?:st|nd|rd|th)\s+c\.|\b1\d{3}\b|\b20\d{2}\b|século|siglo|century/;
  for (const lang of IDIOMAS) {
    for (const n of Object.keys(PACKS[lang].casas)) {
      const c = PACKS[lang].casas[n];
      assert.match(c.tradicao, AUTOR, `${lang}/casa ${n}: tradição sem autor`);
      assert.match(c.tradicao, SECULO, `${lang}/casa ${n}: tradição sem século`);
      assert.match(c.moderno, SECULO, `${lang}/casa ${n}: camada moderna sem data`);
      assert.match(c.fonte, AUTOR, `${lang}/casa ${n}: fonte sem autor`);
    }
    for (const id of Object.keys(PACKS[lang].senhores)) {
      const s = PACKS[lang].senhores[id];
      assert.match(s.tradicao, AUTOR, `${lang}/senhor ${id}: tradição sem autor`);
      assert.match(s.tradicao, SECULO, `${lang}/senhor ${id}: tradição sem século`);
      assert.match(s.moderno, SECULO, `${lang}/senhor ${id}: camada moderna sem data`);
      assert.match(s.fonte, AUTOR, `${lang}/senhor ${id}: fonte sem autor`);
    }
    assert.match(PACKS[lang].deOndeVem, /Tetrabiblos IV\.10/);
  }
});

test('o que a pesquisa não achou está declarado, nos três idiomas', () => {
  for (const lang of IDIOMAS) {
    const lista = PACKS[lang].naoAchado;
    assert.equal(lista.length, 3);
    const junto = lista.join(' ');
    assert.match(junto, /31/); // Paulo de Alexandria, cap. 31 — de segunda mão
    assert.match(junto, /IV\.1/); // Doroteu, Carmen Astrologicum IV.1 — não verificado
    assert.match(junto, /profectio/); // não há nome grego para a técnica
  }
});

// ---------------------------------------------------------------------------
// (6) A LINHA VERMELHA NOS TRÊS IDIOMAS
// ---------------------------------------------------------------------------

const PROIBIDO = {
  pt: [
    /\balivi(a|am|ar|o|os)\b/i,
    /\bacalm(a|am|ar)\b/i,
    /\bcur(a|as|ar|am|ou|ado|ada)\b/i,
    /\btrat(a|am|ar|ando|amento|amentos)\b/i,
    /\benergiz(a|am|ar)\b/i,
    /\benergia\b/i,
    /\bvibraç/i,
    /\bremédio/i,
    /\bsintoma/i,
    /\bdiagnóstic/i,
    /\bansiedade\b/i,
    /\binsônia\b/i,
    /\bimunidade\b/i,
    /desintoxic/i,
    /\btendência a\b/i,
    /predisposiç/i,
    /\bponto fraco\b/i,
    /garantid/i,
    /\bcom certeza\b/i,
    /não substitui/i,
    /consulte um/i,
    /\bcigana\b/i,
  ],
  es: [
    /\balivi(a|an|ar|o)\b/i,
    /\bcalm(a|an|ar)\b/i,
    /\bsan(a|an|ar)\b/i,
    /\bcur(a|as|an|ar)\b/i,
    /\btrat(a|an|ar|amiento|amientos)\b/i,
    /\benergía\b/i,
    /vibraci/i,
    /\bremedio\b/i,
    /síntoma/i,
    /diagnóstic/i,
    /\bansiedad\b/i,
    /\binsomnio\b/i,
    /desintoxic/i,
    /predisposici/i,
    /garantiz/i,
    /no sustituye/i,
    /consulte a un/i,
    /\bgitana\b/i,
  ],
  en: [
    /\brelieve(s|d)?\b/i,
    /\brelieving\b/i,
    /\bsooth(e|es|ed|ing)\b/i,
    /\bcalm(s|ed|ing)?\b/i,
    /\bheal(s|ed|ing)?\b/i,
    /\bcure(s|d)?\b/i,
    /\bcuring\b/i,
    /\btreat(s|ed|ing|ment|ments)?\b/i,
    /\benergy\b/i,
    /\bvibration/i,
    /\bremedy\b/i,
    /\bsymptom/i,
    /\bdiagnos/i,
    /\banxiety\b/i,
    /\binsomnia\b/i,
    /\bdetox/i,
    /\bguarantee/i,
    /does not replace/i,
    /consult a\b/i,
    /\bgypsy\b/i,
  ],
};

function todasAsStrings(valor, prefixo = '', saida = []) {
  if (typeof valor === 'string') {
    saida.push([prefixo, valor]);
    return saida;
  }
  if (Array.isArray(valor)) {
    valor.forEach((v, i) => todasAsStrings(v, `${prefixo}[${i}]`, saida));
    return saida;
  }
  if (valor && typeof valor === 'object') {
    for (const k of Object.keys(valor)) todasAsStrings(valor[k], `${prefixo}.${k}`, saida);
  }
  return saida;
}

test('LINHA VERMELHA — nenhuma alegação de saúde, promessa ou aviso defensivo', () => {
  for (const lang of IDIOMAS) {
    for (const [caminho, texto] of todasAsStrings(PACKS[lang])) {
      // O verbatim de Robbins é idêntico nos três packs e está em inglês; ele
      // é conferido pela regra do inglês, uma vez só.
      if (caminho.startsWith('.verbatim') && lang !== 'en') continue;
      for (const re of PROIBIDO[lang]) {
        assert.ok(
          !re.test(texto),
          `${lang}${caminho} bate em ${re}:\n${texto.slice(0, 200)}`
        );
      }
    }
  }
});

test('LINHA VERMELHA — doença só aparece como registro histórico, nunca na abertura', () => {
  const DOENCA = /enfermidade|dolencia|dolencias|infirmit|doença|enfermedad/i;
  for (const lang of IDIOMAS) {
    for (const n of Object.keys(PACKS[lang].casas)) {
      const c = PACKS[lang].casas[n];
      assert.ok(!DOENCA.test(c.prende), `${lang}/casa ${n}: doença na abertura`);
      assert.ok(!DOENCA.test(c.mes), `${lang}/casa ${n}: doença na linha mensal`);
      if (DOENCA.test(c.tradicao)) {
        // Se aparece, tem dono e século na mesma frase — é registro, não conselho.
        assert.match(c.tradicao, /Fírmico|Firmico|Firmicus|Valente|Valens/, `${lang}/casa ${n}`);
      }
    }
    for (const id of Object.keys(PACKS[lang].senhores)) {
      const s = PACKS[lang].senhores[id];
      assert.ok(!DOENCA.test(s.prende), `${lang}/senhor ${id}: doença na abertura`);
      assert.ok(!DOENCA.test(s.curto), `${lang}/senhor ${id}: doença na linha curta`);
    }
  }
});

test('LINHA VERMELHA — o texto montado pelo motor também passa, nos três idiomas', () => {
  const entradas = [
    '1990-03-14',
    { date: '1990-03-14', time: '09:30' },
    { date: '1990-03-14', time: '09:30', city: SP },
  ];
  for (const lang of IDIOMAS) {
    for (const entrada of entradas) {
      // varre um ano inteiro de saídas: doze casas × treze trechos mensais
      for (let ano = 1991; ano <= 2030; ano++) {
        for (const mesDia of ['-02-05', '-06-15', '-11-20']) {
          for (const fn of [P.profeccaoAnual, P.profeccaoMensal]) {
            const r = fn(entrada, `${ano}${mesDia}`, lang);
            assert.equal(r.disponivel, true);
            for (const re of PROIBIDO[lang]) {
              assert.ok(!re.test(r.texto), `${lang} ${ano}${mesDia} bate em ${re}`);
              assert.ok(!re.test(r.fonte), `${lang} fonte ${ano}${mesDia} bate em ${re}`);
            }
          }
        }
      }
    }
  }
});

// ---------------------------------------------------------------------------
// (7) PRENDE PRIMEIRO, FONTE DEPOIS
// ---------------------------------------------------------------------------

const ABERTURA = 70;
const RECIBO =
  /\b\d{4}\b|séc\.|\bs\.\s*[IVX]+|\d(?:st|nd|rd|th)\s+c\.|Ptolo|Ptolemy|Fírmico|Firmicus|Valente|Valens|Paulo de|Paul of|Brennan|Rudhyar|Lilly|Tetrabiblos|Mathesis|Anthologiae/;

test('PRENDE PRIMEIRO — a abertura de cada texto é vida real, sem recibo', () => {
  for (const lang of IDIOMAS) {
    const aberturas = [];
    for (const n of Object.keys(PACKS[lang].casas)) {
      aberturas.push([`casa ${n} prende`, PACKS[lang].casas[n].prende]);
      aberturas.push([`casa ${n} mes`, PACKS[lang].casas[n].mes]);
    }
    for (const id of Object.keys(PACKS[lang].senhores)) {
      aberturas.push([`senhor ${id} prende`, PACKS[lang].senhores[id].prende]);
      aberturas.push([`senhor ${id} curto`, PACKS[lang].senhores[id].curto]);
    }
    aberturas.push(['comoFunciona', PACKS[lang].comoFunciona]);
    for (const [nome, texto] of aberturas) {
      const inicio = texto.slice(0, ABERTURA);
      assert.ok(!RECIBO.test(inicio), `${lang}/${nome}: recibo na abertura → "${inicio}"`);
      assert.ok(texto.trim().length > 25, `${lang}/${nome}: curto demais`);
    }
  }
});

test('PRENDE PRIMEIRO — o texto montado abre pela casa, e o senhor vem depois', () => {
  for (const lang of IDIOMAS) {
    const r = P.profeccaoAnual({ date: '1990-03-14', time: '09:30', city: SP }, '2026-07-31', lang);
    const partes = r.texto.split('\n\n');
    assert.equal(partes.length, 2, `${lang}: o texto anual tem duas partes`);
    assert.equal(partes[0], r.detalhe.casaPrende);
    assert.ok(partes[1].includes(r.detalhe.senhorPrende));
    assert.ok(!RECIBO.test(partes[0].slice(0, ABERTURA)), `${lang}: recibo na abertura`);
    // O recibo existe — só não abre o texto.
    assert.match(r.fonte, /Tetrabiblos IV\.10/);
    assert.match(r.detalhe.casaTradicao, RECIBO);
  }
});

test('a camada moderna vem sempre separada e datada — a proposição 3 da tese', () => {
  for (const lang of IDIOMAS) {
    const r = P.profeccaoAnual('1990-03-14', '2026-07-31', lang);
    assert.ok(r.detalhe.casaModerno.length > 30);
    assert.ok(r.detalhe.senhorModerno.length > 30);
    // e ela NUNCA entra no texto principal, que é a leitura antiga
    assert.ok(!r.texto.includes(r.detalhe.casaModerno));
  }
});

// ---------------------------------------------------------------------------
// O CONTRATO DE SAÍDA — o que a tela pode contar que sempre vem
// ---------------------------------------------------------------------------

test('a profecção anual devolve o contrato inteiro em qualquer combinação', () => {
  const entradas = [
    '1990-03-14',
    { date: '2001-12-31', time: null, city: null },
    { date: '2001-12-31', time: '23:59', city: SP },
    { date: '1960-01-01', time: '00:00', city: SP },
  ];
  const obrigatorios = [
    'disponivel',
    'origem',
    'idade',
    'casaProfectada',
    'signoDoAno',
    'senhorDoAno',
    'texto',
    'fonte',
    'viradaDoAno',
    'proximaVirada',
    'precisao',
    'comoFunciona',
    'deOndeVem',
    'naoAchado',
    'fontes',
  ];
  for (const entrada of entradas) {
    const r = P.profeccaoAnual(entrada, '2026-07-31');
    for (const chave of obrigatorios) {
      assert.notEqual(r[chave], undefined, `faltou ${chave}`);
    }
    assert.ok(P.ORDEM_SIGNOS.includes(r.signoDoAnoId));
    assert.equal(P.senhorDoSigno(r.signoDoAnoId), r.senhorDoAnoId);
    assert.equal(r.casaProfectada, P.casaDaIdade(r.idade));
    assert.equal(r.signoDoAnoId, P.signoDeslocado(r.signoDePartidaId, r.idade));
  }
});

test('o Senhor do Ano nunca é um planeta moderno — Urano, Netuno e Plutão ficam fora', () => {
  const modernos = /Urano|Netuno|Plutão|Uranus|Neptune|Pluto/;
  for (let ano = 1991; ano <= 2035; ano++) {
    const r = P.profeccaoAnual('1990-03-14', `${ano}-06-15`);
    assert.ok(!modernos.test(r.senhorDoAno), `${ano}: ${r.senhorDoAno}`);
    assert.ok(
      ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno'].includes(r.senhorDoAnoId)
    );
  }
});
