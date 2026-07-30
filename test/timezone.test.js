// Testes de lib/timezone.js — o cálculo de fuso COM horário de verão.
//
// POR QUE ESTE ARQUIVO EXISTE: até 29/07/2026 o app convertia hora local em
// UTC usando um offset FIXO por cidade (São Paulo = -3, sempre), ignorando que
// o Brasil teve horário de verão até 2019. Como o Ascendente muda de signo a
// cada ~2h, 1h de erro é meio signo errado — e metade dos nascimentos do
// período de verão saía com o signo errado (a prova numérica disso está em
// test/signsTimezone.test.js).
//
// Os casos abaixo são todos VERIFICÁVEIS por fora, contra a tzdata pública:
//   São Paulo jan/2015 = -2 (verão)  vs  jul/2015 = -3 (padrão)
//   Nova York jul = -4 (EDT)         vs  jan = -5 (EST)
//   Manaus = -4 sempre (o Amazonas nunca aderiu ao horário de verão)
//   Bahia = -2 em jan/2012 (aderiu em 2011-2012) e -3 em jan/2015 (saiu)
//   Índia = +5:30 (fuso quebrado: prova que a conta é em MINUTOS)
const test = require('node:test');
const assert = require('node:assert');

const tz = require('../lib/timezone');

// ---------------------------------------------------------------------------
// O caso brasileiro — o motivo de tudo isto existir
// ---------------------------------------------------------------------------
test('São Paulo: janeiro/2015 estava em horário de verão (-2), julho não (-3)', () => {
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '2015-01-20', '14:30'), -2);
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '2015-07-20', '14:30'), -3);
});

test('São Paulo: o app antigo usaria -3 nos dois casos — a diferença é de 1 hora inteira', () => {
  const verao = tz.offsetHoursFor('America/Sao_Paulo', '2015-01-20', '14:30');
  const inverno = tz.offsetHoursFor('America/Sao_Paulo', '2015-07-20', '14:30');
  assert.strictEqual(verao - inverno, 1);
});

test('Manaus nunca teve horário de verão: -4 em qualquer época', () => {
  assert.strictEqual(tz.offsetHoursFor('America/Manaus', '2015-01-20', '14:30'), -4);
  assert.strictEqual(tz.offsetHoursFor('America/Manaus', '2015-07-20', '14:30'), -4);
  assert.strictEqual(tz.offsetHoursFor('America/Manaus', '1995-01-20', '03:00'), -4);
});

test('Bahia: -2 em janeiro/2012 (aderiu em 2011-2012) e -3 em janeiro/2015 (já tinha saído)', () => {
  assert.strictEqual(tz.offsetHoursFor('America/Bahia', '2012-01-20', '14:30'), -2);
  assert.strictEqual(tz.offsetHoursFor('America/Bahia', '2015-01-20', '14:30'), -3);
});

test('Fortaleza não participou dos ciclos recentes: -3 em janeiro/2015', () => {
  assert.strictEqual(tz.offsetHoursFor('America/Fortaleza', '2015-01-20', '14:30'), -3);
});

// ---------------------------------------------------------------------------
// O mundo — onde o horário de verão ainda existe HOJE
// ---------------------------------------------------------------------------
test('Nova York: julho é -4 (EDT) e janeiro é -5 (EST)', () => {
  assert.strictEqual(tz.offsetHoursFor('America/New_York', '2015-07-20', '14:30'), -4);
  assert.strictEqual(tz.offsetHoursFor('America/New_York', '2015-01-20', '14:30'), -5);
});

test('Lisboa: verão +1, inverno 0', () => {
  assert.strictEqual(tz.offsetHoursFor('Europe/Lisbon', '2015-07-20', '14:30'), 1);
  assert.strictEqual(tz.offsetHoursFor('Europe/Lisbon', '2015-01-20', '14:30'), 0);
});

test('Índia é +5:30 o ano inteiro — o cálculo é em minutos, não em horas cheias', () => {
  assert.strictEqual(tz.offsetHoursFor('Asia/Kolkata', '1995-05-05', '10:00'), 5.5);
  assert.strictEqual(
    tz.offsetMinutesAtWallTime('Asia/Kolkata', 1995, 5, 5, 10, 0),
    330
  );
});

// ---------------------------------------------------------------------------
// Nascimentos antigos — a faixa que o app precisa cobrir (1940 até hoje)
// ---------------------------------------------------------------------------
test('cobre nascimentos de 1940 em diante, inclusive os ciclos antigos de verão', () => {
  // 1949-1953 e 1963-1968 tiveram horário de verão no Sudeste.
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '1963-10-25', '12:00'), -2);
  // Fora dos ciclos, o padrão.
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '1975-06-10', '08:15'), -3);
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '1940-05-10', '08:15'), -3);
  // E o ciclo longo de 1985-2019.
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '1985-11-10', '12:00'), -2);
});

test('fora da faixa 1900-2100 devolve null (quem chama cai no offset fixo da cidade)', () => {
  assert.strictEqual(tz.offsetMinutesAtWallTime('America/Sao_Paulo', 1850, 1, 1, 12, 0), null);
  assert.strictEqual(tz.offsetMinutesAtWallTime('America/Sao_Paulo', 2200, 1, 1, 12, 0), null);
});

// ---------------------------------------------------------------------------
// As horas da virada — a regra decidida e documentada no cabeçalho do módulo
// ---------------------------------------------------------------------------
test('hora que NUNCA existiu (salto da primavera) é lida como se o relógio já tivesse pulado', () => {
  // 19/10/2014 em São Paulo: o relógio foi de 00:00 direto pra 01:00.
  // 00:30 daquele dia não existiu. Regra adotada: offset DEPOIS da transição.
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '2014-10-19', '00:30'), -2);
  // A hora anterior à transição continua no padrão.
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '2014-10-18', '23:30'), -3);
});

test('hora AMBÍGUA (volta do outono) escolhe a primeira ocorrência, ainda no horário de verão', () => {
  // 22/02/2015 em São Paulo: 00:00 voltou pra 23:00 do dia 21.
  // 23:30 do dia 21 aconteceu duas vezes; escolhemos a primeira (-2).
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '2015-02-21', '23:30'), -2);
  // Depois da virada consolidada, padrão.
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '2015-02-22', '12:00'), -3);
});

// ---------------------------------------------------------------------------
// Entradas ruins nunca podem derrubar a tela de nascimento
// ---------------------------------------------------------------------------
test('fuso desconhecido, data inválida e argumentos absurdos devolvem null sem lançar', () => {
  assert.strictEqual(tz.offsetHoursFor('Nao/Existe', '2015-01-20', '14:30'), null);
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '20/01/2015', '14:30'), null);
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '2015-01-20', '25:99'), null);
  assert.strictEqual(tz.offsetHoursFor(null, '2015-01-20', '14:30'), null);
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', null, null), null);
  assert.strictEqual(tz.offsetMinutesAtInstant('America/Sao_Paulo', NaN), null);
});

test('sem hora informada assume meio-dia (o ponto mais longe das duas transições)', () => {
  const semHora = tz.parseBirthMoment('2015-01-20', null);
  assert.deepStrictEqual(semHora, { ano: 2015, mes: 1, dia: 20, hora: 12, minuto: 0 });
  assert.strictEqual(tz.offsetHoursFor('America/Sao_Paulo', '2015-01-20', ''), -2);
});

test('timeZoneSupported detecta o suporte de verdade, perguntando pelo fuso', () => {
  assert.strictEqual(tz.timeZoneSupported('America/Sao_Paulo'), true);
  assert.strictEqual(tz.timeZoneSupported('Nao/Existe'), false);
  assert.strictEqual(tz.timeZoneSupported(''), false);
  assert.strictEqual(tz.timeZoneSupported(undefined), false);
});

// ---------------------------------------------------------------------------
// resolveOffsetHours — a ponte que mantém a assinatura antiga de lib/signs.js
// ---------------------------------------------------------------------------
test('resolveOffsetHours: número entra e sai igual (compatibilidade com quem já tem mapa salvo)', () => {
  assert.strictEqual(tz.resolveOffsetHours(-3, '2015-01-20', '14:30'), -3);
  assert.strictEqual(tz.resolveOffsetHours(0, '2015-01-20', '14:30'), 0);
  assert.strictEqual(tz.resolveOffsetHours(5.5, '2015-01-20', '14:30'), 5.5);
});

test('resolveOffsetHours: string IANA resolve o horário de verão', () => {
  assert.strictEqual(tz.resolveOffsetHours('America/Sao_Paulo', '2015-01-20', '14:30'), -2);
  assert.strictEqual(tz.resolveOffsetHours('America/Sao_Paulo', '2015-07-20', '14:30'), -3);
});

test('resolveOffsetHours: string numérica é offset, não fuso', () => {
  assert.strictEqual(tz.resolveOffsetHours('-3', '2015-01-20', '14:30'), -3);
});

test('resolveOffsetHours: objeto de cidade usa o fuso e cai no utcOffset quando o fuso é desconhecido', () => {
  const comFuso = { timezone: 'America/Sao_Paulo', utcOffset: -3 };
  assert.strictEqual(tz.resolveOffsetHours(comFuso, '2015-01-20', '14:30'), -2);

  const fusoQuebrado = { timezone: 'Nao/Existe', utcOffset: -3 };
  assert.strictEqual(tz.resolveOffsetHours(fusoQuebrado, '2015-01-20', '14:30'), -3);

  const semFuso = { utcOffset: -4 };
  assert.strictEqual(tz.resolveOffsetHours(semFuso, '2015-01-20', '14:30'), -4);

  assert.strictEqual(tz.resolveOffsetHours(null, '2015-01-20', '14:30'), null);
  assert.strictEqual(tz.resolveOffsetHours({}, '2015-01-20', '14:30'), null);
});

test('resolveOffsetHours: utcOffsetAt do servidor é usado quando o cálculo local não dá', () => {
  const doServidor = { timezone: 'Nao/Existe', utcOffsetAt: -2, utcOffset: -3 };
  assert.strictEqual(tz.resolveOffsetHours(doServidor, '2015-01-20', '14:30'), -2);
});

test('isDstAt diz quando o nascimento caiu em horário de verão', () => {
  assert.strictEqual(tz.isDstAt('America/Sao_Paulo', '2015-01-20', '14:30', -3), true);
  assert.strictEqual(tz.isDstAt('America/Sao_Paulo', '2015-07-20', '14:30', -3), false);
  assert.strictEqual(tz.isDstAt('America/Manaus', '2015-01-20', '14:30', -4), false);
});

test('formatOffset escreve o fuso como a tela mostra', () => {
  assert.strictEqual(tz.formatOffset(-2), '-02:00');
  assert.strictEqual(tz.formatOffset(-3), '-03:00');
  assert.strictEqual(tz.formatOffset(5.5), '+05:30');
  assert.strictEqual(tz.formatOffset(0), '+00:00');
  assert.strictEqual(tz.formatOffset(null), '');
});
