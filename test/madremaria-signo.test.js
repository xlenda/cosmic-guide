// Portao do SIGNO SOLAR — lib/signo.js.
//
// ===========================================================================
// O QUE ESTE ARQUIVO VIGIA, E POR QUE ELE E DIFERENTE DOS OUTROS PORTOES
// ===========================================================================
// O signo nao e perguntado: ele e DERIVADO da data de nascimento (P6 do
// onboarding). Isso quer dizer que ninguem confere o resultado antes de ele
// chegar na tela — se a conta errar, a pessoa recebe um signo que nao e o dela e
// o app nao tem como saber. Errar aqui e errar a UNICA coisa que a usuaria ja
// sabia antes de instalar.
//
// A armadilha esta registrada no Cosmic Guide, de onde o calculo foi portado, e
// custou caro la: a tabela de datas fixas ("21/03 a 19/04 e Aries") errava 248 de
// 22.280 datas — 1,11% —, SEMPRE na cuspide e SEMPRE um signo a frente, porque as
// cuspides andam quase um dia a cada quatro anos por causa dos bissextos.
//
// Por isso este arquivo tem tres camadas, e nenhuma delas confia na outra:
//
//   1. CUSPIDES LITERAIS — os 12 pares de virada, escritos a mao neste arquivo.
//      Se a conta mudar, eles caem antes de qualquer coisa chegar na tela.
//   2. A TABELA INGENUA AINDA ERRA — a mesma tabela de datas fixas esta escrita
//      aqui embaixo e e medida contra as cuspides literais. Se um dia ela passar
//      a acertar tudo, e porque alguem trocou o calculo POR ela.
//   3. OS DOIS CAMINHOS CONCORDAM — a formula do USNO (a reserva, que e o
//      caminho que roda aqui em Node) e comparada com o astronomy-engine (o
//      caminho que roda no aparelho) em 36.890 datas, dia a dia.
//
// NOTA SOBRE QUAL CAMINHO ESTE TESTE EXERCITA: em Node ESM, `require` nao existe,
// entao getAstronomia() de lib/signo.js cai no catch e signoFromDate() usa a
// formula do USNO. E de proposito — a reserva e o caminho MENOS visto, e por isso
// o que mais precisa de portao. A camada 3 amarra ela ao motor de verdade.
import assert from 'node:assert/strict';
import test from 'node:test';

import * as Astronomy from 'astronomy-engine';

import {
  SIGNOS,
  esFechaReal,
  idadeEm,
  nomeDoSigno,
  partesDaFecha,
  signoFromDate,
  signoInfoFromDate,
} from '../madremaria/lib/signo.js';

/* =================================================================================
 * O MOTOR DE REFERENCIA — a mesma conta que o aparelho faz, montada aqui a mao.
 * Nao importa nada de lib/signo.js alem da lista de signos: se ela chamasse a
 * funcao sob teste, nao mediria nada.
 * ================================================================================= */
function signoPeloMotor(dateStr) {
  const [ano, mes, dia] = dateStr.split('-').map(Number);
  const instante = new Date(Date.UTC(ano, mes - 1, dia, 12));
  const sol = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, instante, true));
  const lon = ((sol.elon % 360) + 360) % 360;
  return SIGNOS[Math.floor(lon / 30)].nome;
}

/* =================================================================================
 * 1. AS CUSPIDES DOS DOZE SIGNOS
 * =================================================================================
 * Cada par e o ULTIMO dia de um signo e o PRIMEIRO do seguinte, no mesmo ano.
 * Sao os dias em que a conta pode errar — no meio de um signo qualquer tabela
 * acerta, e por isso testar 15 de agosto nao prova nada.
 *
 * O ano de 2024 cobre os doze; os quatro casos soltos no fim sao os que a tabela
 * de datas fixas erra de verdade, incluindo os dois que estao escritos na
 * doutrina do Cosmic Guide (23/10/2010 e 20/01/1988).
 * ================================================================================= */
const CUSPIDES = Object.freeze([
  // ano 2024 — os doze pares, na ordem do zodiaco
  ['2024-01-20', 'Capricórnio'], ['2024-01-21', 'Aquário'],
  ['2024-02-18', 'Aquário'], ['2024-02-19', 'Peixes'],
  ['2024-03-19', 'Peixes'], ['2024-03-20', 'Áries'],
  ['2024-04-19', 'Áries'], ['2024-04-20', 'Touro'],
  ['2024-05-20', 'Touro'], ['2024-05-21', 'Gêmeos'],
  ['2024-06-20', 'Gêmeos'], ['2024-06-21', 'Câncer'],
  ['2024-07-21', 'Câncer'], ['2024-07-22', 'Leão'],
  ['2024-08-22', 'Leão'], ['2024-08-23', 'Virgem'],
  ['2024-09-22', 'Virgem'], ['2024-09-23', 'Libra'],
  ['2024-10-22', 'Libra'], ['2024-10-23', 'Escorpião'],
  ['2024-11-21', 'Escorpião'], ['2024-11-22', 'Sagitário'],
  ['2024-12-20', 'Sagitário'], ['2024-12-21', 'Capricórnio'],

  // Os casos escritos na doutrina: aqui a tabela de datas fixas diz o signo
  // SEGUINTE, e o Sol diz este.
  ['2010-10-23', 'Libra'],
  ['1988-01-20', 'Capricórnio'],
  ['2010-01-20', 'Aquário'],
  ['2010-03-21', 'Áries'],
]);

test('as cuspides dos doze signos', () => {
  const errados = CUSPIDES.filter(([data, esperado]) => signoFromDate(data) !== esperado).map(
    ([data, esperado]) => `${data}: esperado ${esperado}, veio ${signoFromDate(data)}`
  );
  assert.deepEqual(
    errados,
    [],
    'Signo errado numa data de virada. E exatamente onde a tabela de datas fixas '
      + `errava, e e quem nasceu ai que mais repara.\n  ${errados.join('\n  ')}`
  );
});

test('os doze signos aparecem, e na ordem do zodiaco', () => {
  assert.equal(SIGNOS.length, 12);
  assert.deepEqual(
    SIGNOS.map((s) => s.nome),
    [
      'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
      'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
    ],
    'A ordem E o contrato: o indice de cada signo e Math.floor(longitude / 30).'
  );
  // Todos os doze sao alcancaveis por uma data real — nenhum e decorativo.
  const vistos = new Set();
  for (let mes = 1; mes <= 12; mes += 1) {
    for (const dia of [5, 15, 25]) {
      vistos.add(signoFromDate(`2024-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`));
    }
  }
  assert.equal(vistos.size, 12, 'ha signo que nenhuma data de 2024 alcanca');
});

/* =================================================================================
 * 2. A TABELA INGENUA CONTINUA ERRANDO — o teste que impede a volta dela
 * =================================================================================
 * Esta e a tabela de datas fixas que qualquer um escreveria em cinco minutos, e
 * que ja morou no codigo do outro projeto. Ela esta aqui para ser REPROVADA: o
 * teste exige que ela discorde do calculo em pelo menos uma das cuspides acima.
 *
 * Se um dia alguem "simplificar" lib/signo.js trocando a conta por uma tabela
 * assim, este teste fica verde por acidente — por isso ele nao mede so a tabela,
 * mede a DISCORDANCIA entre ela e a funcao. Zero discordancia = alarme.
 * ================================================================================= */
const TABELA_INGENUA = Object.freeze([
  ['Capricórnio', 12, 22], ['Aquário', 1, 20], ['Peixes', 2, 19], ['Áries', 3, 21],
  ['Touro', 4, 20], ['Gêmeos', 5, 21], ['Câncer', 6, 21], ['Leão', 7, 23],
  ['Virgem', 8, 23], ['Libra', 9, 23], ['Escorpião', 10, 23], ['Sagitário', 11, 22],
]);

function signoPelaTabela(dateStr) {
  const [, mes, dia] = dateStr.split('-').map(Number);
  let achado = 'Capricórnio';
  for (const [nome, m, d] of TABELA_INGENUA) {
    if (mes === m && dia >= d) achado = nome;
    else if (mes === m && dia < d) {
      const i = TABELA_INGENUA.findIndex((x) => x[0] === nome);
      achado = TABELA_INGENUA[(i - 1 + TABELA_INGENUA.length) % TABELA_INGENUA.length][0];
    }
  }
  return achado;
}

test('a tabela de datas fixas ainda erra as cuspides — e por isso ela nao voltou', () => {
  const divergentes = CUSPIDES.filter(([data, esperado]) => signoPelaTabela(data) !== esperado);
  assert.ok(
    divergentes.length > 0,
    'A tabela de datas fixas passou a concordar com o calculo em TODAS as cuspides. '
      + 'Ou as cuspides deste teste deixaram de ser cuspides, ou alguem trocou o '
      + 'calculo do Sol por uma tabela. Nos dois casos, ler lib/signo.js antes de mexer aqui.'
  );
});

/* =================================================================================
 * 3. OS DOIS CAMINHOS CONCORDAM — a reserva medida contra o motor de verdade
 * =================================================================================
 * lib/signo.js tem dois caminhos: o astronomy-engine (aparelho) e a formula do
 * Astronomical Almanac (reserva, e o que roda aqui). Se eles divergirem, o app
 * passa a ter DUAS definicoes de signo dentro de si — e a que a usuaria ve depende
 * de o require ter resolvido ou nao, que e a pior forma de bug: invisivel em
 * teste e visivel na mao dela.
 *
 * O numero medido em 01/09 sobre 1930-2030: 4 divergencias em 36.890 datas
 * (0,011%), todas a menos de meio grau da cuspide exata. O teto de 8 e o dobro
 * disso — margem para a efemeride do pacote mudar de casa decimal numa
 * atualizacao, e apertado o bastante para acusar qualquer troca de formula.
 * ================================================================================= */
test('a formula de reserva concorda com o astronomy-engine em 36.890 datas', () => {
  const p = (n) => String(n).padStart(2, '0');
  const divergencias = [];
  let total = 0;

  for (let ano = 1930; ano <= 2030; ano += 1) {
    for (let mes = 1; mes <= 12; mes += 1) {
      for (let dia = 1; dia <= 31; dia += 1) {
        const d = new Date(Date.UTC(ano, mes - 1, dia, 12));
        if (d.getUTCMonth() + 1 !== mes || d.getUTCDate() !== dia) continue;
        total += 1;
        const data = `${ano}-${p(mes)}-${p(dia)}`;
        const reserva = signoFromDate(data);
        const motor = signoPeloMotor(data);
        if (reserva !== motor) divergencias.push(`${data}: reserva=${reserva} motor=${motor}`);
      }
    }
  }

  assert.ok(total > 36000, `a varredura cobriu so ${total} datas`);
  assert.ok(
    divergencias.length <= 8,
    `${divergencias.length} divergencias entre a reserva e o motor em ${total} datas `
      + `(o teto e 8):\n  ${divergencias.slice(0, 20).join('\n  ')}`
  );
});

/* =================================================================================
 * 4. NUNCA FABRICAR: data que nao existe nao vira signo
 * ================================================================================= */
test('data invalida devolve null, nunca um signo chutado', () => {
  const lixo = [
    null, undefined, '', '   ', 42, {}, [],
    '2024-13-01',   // mes 13
    '2024-00-10',   // mes 0
    '2024-02-30',   // fevereiro nunca tem 30
    '2023-02-29',   // 2023 nao e bissexto
    '2024-04-31',   // abril tem 30
    '24-01-01',     // ano de dois digitos
    '2024/01/01',   // separador errado
    '2024-1-1',     // sem zero a esquerda
    'ontem',
  ];
  for (const valor of lixo) {
    assert.equal(signoFromDate(valor), null, `${JSON.stringify(valor)} virou signo`);
    assert.equal(esFechaReal(valor), false, `${JSON.stringify(valor)} passou por data real`);
    assert.equal(partesDaFecha(valor), null);
    assert.equal(signoInfoFromDate(valor), null);
  }
});

test('29 de fevereiro so existe em ano bissexto', () => {
  assert.ok(esFechaReal('2024-02-29'));
  assert.ok(esFechaReal('2000-02-29')); // secular divisivel por 400: e bissexto
  assert.equal(esFechaReal('1900-02-29'), false); // secular nao divisivel por 400
  assert.equal(esFechaReal('2023-02-29'), false);
  assert.equal(signoFromDate('2024-02-29'), 'Peixes');
});

test('signoInfoFromDate devolve o objeto inteiro do signo', () => {
  const info = signoInfoFromDate('2024-08-15');
  assert.equal(info.nome, 'Leão');
  assert.equal(info.id, 'leao');
  assert.equal(info.elemento, 'fogo');
  assert.equal(typeof info.emoji, 'string');
});

/* =================================================================================
 * 5. nomeDoSigno — normaliza, e nao deixa lixo passar por signo
 * ================================================================================= */
test('nomeDoSigno aceita id, nome, sem acento e em qualquer caixa', () => {
  assert.equal(nomeDoSigno('leao'), 'Leão');
  assert.equal(nomeDoSigno('LEÃO'), 'Leão');
  assert.equal(nomeDoSigno('Leão'), 'Leão');
  assert.equal(nomeDoSigno('  capricornio '), 'Capricórnio');
  assert.equal(nomeDoSigno('escorpiao'), 'Escorpião');
  assert.equal(nomeDoSigno('gemeos'), 'Gêmeos');
  // Todos os doze fazem a volta completa pelo proprio nome e pelo proprio id.
  for (const s of SIGNOS) {
    assert.equal(nomeDoSigno(s.nome), s.nome);
    assert.equal(nomeDoSigno(s.id), s.nome);
  }
});

test('nomeDoSigno devolve null para o que nao e signo', () => {
  for (const valor of [null, undefined, '', 'Ofiúco', 'Leao da Serra', 42, {}]) {
    assert.equal(nomeDoSigno(valor), null, `${JSON.stringify(valor)} passou por signo`);
  }
});

/* =================================================================================
 * 6. IDADE — por aniversario, nunca por divisao de milissegundos
 * ================================================================================= */
test('idadeEm conta anos completos pelo aniversario', () => {
  const hoje = new Date(2026, 8, 1); // 01/09/2026, hora local
  assert.equal(idadeEm('1990-09-01', hoje), 36, 'no proprio aniversario ja conta o ano');
  assert.equal(idadeEm('1990-09-02', hoje), 35, 'um dia antes do aniversario ainda nao conta');
  assert.equal(idadeEm('1990-08-31', hoje), 36);
  assert.equal(idadeEm('2026-09-01', hoje), 0, 'nascido hoje tem zero, nao null');
  assert.equal(idadeEm('2026-09-02', hoje), null, 'data no futuro nao tem idade');
  assert.equal(idadeEm('nao-e-data', hoje), null);
  assert.equal(idadeEm(null, hoje), null);
});

test('idadeEm nao erra no 29 de fevereiro', () => {
  // Quem nasceu em 29/02 faz aniversario em 01/03 nos anos comuns: em 28/02 de um
  // ano comum ainda nao fez. A conta por divisao de 365,25 erra exatamente aqui.
  assert.equal(idadeEm('2000-02-29', new Date(2025, 1, 28)), 24);
  assert.equal(idadeEm('2000-02-29', new Date(2025, 2, 1)), 25);
});

/* =================================================================================
 * 7. O CONTRATO DAS DUAS PERGUNTAS NOVAS (P6 e P7)
 * =================================================================================
 * Mora aqui, e nao num arquivo proprio, porque as duas existem pelo mesmo motivo
 * que lib/signo.js existe: a data de nascimento so entrou no app para virar signo
 * e idade, e o genero so entrou para o fechamento falar COM ela. Testar as tres
 * coisas no mesmo lugar e o que faz a proxima pessoa ler as tres juntas.
 * ================================================================================= */
import {
  GENERO_NEUTRO,
  IDS_GENERO,
  PREGUNTAS,
  esValida,
  fechaDeNacimientoPlausible,
  generoDe,
  getPregunta,
  idadeDe,
  onboardingCompleto,
  signoDe,
} from '../madremaria/datos/preguntas.js';

/** As sete respostas validas. Cada teste troca so o campo que lhe interessa. */
const RESPOSTAS = Object.freeze({
  nombre: 'Ana',
  corte: 'pelea',
  cuando: 'dias',
  hoy: 'hablamos',
  intencion: 'entender-mi-parte',
  nacimiento: '1994-03-21',
  genero: 'mulher',
});

test('toda pergunta diz para que serve — as sete, nao so as antigas', () => {
  const mudas = PREGUNTAS.filter(
    (p) => typeof p.microcopy !== 'string' || p.microcopy.trim().length < 40
  ).map((p) => p.id);
  assert.deepEqual(
    mudas,
    [],
    'Campo que nao consegue escrever a propria justificativa nao existe. '
      + `Sem microcopy: ${mudas.join(', ')}`
  );
});

test('P6 pede a data, e o signo NAO e perguntado', () => {
  const p6 = getPregunta('nacimiento');
  assert.equal(p6.tipo, 'fecha');
  assert.deepEqual(p6.campos.map((c) => c.id), ['dia', 'mes', 'ano']);
  // Nenhuma pergunta pode oferecer uma lista de signos: isso seria pedir duas
  // vezes o mesmo dado, e abriria a porta para os dois se contradizerem.
  const comSignos = PREGUNTAS.filter(
    (p) => Array.isArray(p.opciones) && p.opciones.some((o) => nomeDoSigno(o.texto))
  ).map((p) => p.id);
  assert.deepEqual(comSignos, [], 'ha uma lista de signos no onboarding');
  // E nao se pede hora nem lugar: sem eles nao ha mapa, e o app nao finge ter um.
  assert.deepEqual(
    PREGUNTAS.filter((p) => /hora|nasceu onde|cidade/i.test(p.texto)).map((p) => p.id),
    []
  );
});

test('a data de nascimento so passa quando e uma data possivel', () => {
  const hoje = new Date(2026, 8, 1);
  assert.ok(esValida('nacimiento', '1994-03-21'));
  assert.ok(fechaDeNacimientoPlausible('1994-03-21', hoje));

  for (const ruim of ['1994-02-31', '1899-12-31', '', null, '21/03/1994', '1994-3-21']) {
    assert.equal(esValida('nacimiento', ruim), false, `${JSON.stringify(ruim)} passou`);
  }
  // O futuro e o velho demais so caem na trava que conhece o dia de hoje.
  assert.equal(fechaDeNacimientoPlausible('2030-01-01', hoje), false, 'data no futuro passou');
  assert.equal(fechaDeNacimientoPlausible('1850-01-01', hoje), false, 'idade impossivel passou');
});

test('esValida continua PURA: nao le o relogio', () => {
  /* Ela roda dentro de lib/lectura.js, que e puro por contrato. Se um dia
   * alguem mudar de ideia e trouxer `new Date()` para dentro de esValida, o
   * motor de leitura passa a depender do relogio — e a mesma entrada deixa de
   * dar a mesma saida. A prova: uma data no futuro e ESTRUTURALMENTE valida. */
  assert.ok(esValida('nacimiento', '2090-05-05'), 'esValida passou a julgar o futuro');
});

test('P7 tem as tres opcoes, e a terceira e uma resposta inteira', () => {
  const p7 = getPregunta('genero');
  assert.deepEqual(p7.opciones.map((o) => o.id), ['mulher', 'homem', 'prefiro-nao-dizer']);
  assert.deepEqual([...IDS_GENERO], p7.opciones.map((o) => o.id));
  assert.ok(IDS_GENERO.includes(GENERO_NEUTRO));

  // O app inteiro tem de funcionar com ela: o onboarding fecha igual.
  for (const genero of IDS_GENERO) {
    assert.ok(
      onboardingCompleto({ ...RESPOSTAS, genero }),
      `o onboarding nao fecha com genero='${genero}'`
    );
  }
});

test('generoDe nunca chuta: sem resposta, neutro', () => {
  assert.equal(generoDe({ genero: 'homem' }), 'homem');
  assert.equal(generoDe({ genero: 'mulher' }), 'mulher');
  assert.equal(generoDe({ genero: 'prefiro-nao-dizer' }), GENERO_NEUTRO);
  // Ausente, corrompido, ou gravado por uma versao velha do app.
  for (const respostas of [{}, null, undefined, { genero: '' }, { genero: 'ella' }]) {
    assert.equal(
      generoDe(respostas),
      GENERO_NEUTRO,
      'sem resposta o padrao tem de ser o neutro, nunca um palpite sobre ela'
    );
  }
});

test('o onboarding so fecha com as sete', () => {
  assert.ok(onboardingCompleto(RESPOSTAS));
  for (const id of Object.keys(RESPOSTAS)) {
    const faltando = { ...RESPOSTAS };
    delete faltando[id];
    assert.equal(onboardingCompleto(faltando), false, `fechou sem '${id}'`);
  }
});

test('signoDe e idadeDe leem a resposta de P6, e nunca inventam', () => {
  assert.equal(signoDe(RESPOSTAS), 'Áries');
  assert.equal(idadeDe(RESPOSTAS, new Date(2026, 8, 1)), 32);
  for (const respostas of [{}, null, { nacimiento: '1994-02-31' }]) {
    assert.equal(signoDe(respostas), null);
    assert.equal(idadeDe(respostas), null);
  }
});
