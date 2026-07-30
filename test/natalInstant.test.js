// UM mapa, UM instante de nascimento.
//
// Contexto (verificação cética de 30/07/2026). Depois que ascendantSign passou
// a converter a hora de parede no instante UTC certo (com horário de verão), o
// resto do mapa continuou fazendo o contrário: moonSign/planetPositions/aspects
// liam `${date}T${time}:00Z`, isto é, tratavam a hora do relógio da maternidade
// como se fosse UTC, para todo mundo do planeta. O mesmo mapa passou a ter dois
// instantes de nascimento — Ascendente às 04:00Z e Lua às 02:00Z.
//
// Dois caminhos discordando é pior que um errado consistente, e o erro tinha
// tamanho medido: varrendo 14.688 nascimentos (1960–2010) por fuso,
//
//   São Paulo  5,15% das Luas natais com SIGNO errado   (deriva até 1,9°)
//   Nova York  8,07%                                    (até 3,2°)
//   Tóquio    16,64%                                    (até 5,8°)
//   Auckland  22,60%                                    (até 8,3°)
//
// e 43,9% das listas de aspectos de nascimento em São Paulo mudavam.
//
// A correção foi um 3º argumento OPCIONAL (`zona`) em moonSign/planetPositions/
// aspects, igual ao 5º de ascendantSign. Ausente = comportamento histórico,
// que é o que o céu-de-hoje da Home e do dailyThought querem de propósito.
const test = require('node:test');
const assert = require('node:assert');

const {
  moonSign,
  planetPositions,
  aspects,
  ascendantSign,
  astrocartographyCities,
} = require('../lib/signs');

const SP = { name: 'São Paulo', lat: -23.5505, lon: -46.6333, utcOffset: -3, timezone: 'America/Sao_Paulo' };
const HONOLULU = { name: 'Honolulu', lat: 21.3069, lon: -157.8583, utcOffset: -10, timezone: 'Pacific/Honolulu' };
const MANAUS = { name: 'Manaus', lat: -3.119, lon: -60.0217, utcOffset: -4, timezone: 'America/Manaus' };

// ---------------------------------------------------------------------------
// CASO PÚBLICO CONFERÍVEL. Barack Obama, 04/08/1961 19:24 em Honolulu — dado de
// nascimento AA (certidão), o mais checado da astrologia moderna. Qualquer
// efeméride séria dá Ascendente em Aquário ~18° e LUA EM GÊMEOS ~3°.
// Conferido fora deste repositório em 30/07/2026 (astro-charts, astrotheme,
// astrostyle, relatório profissional da Astrolabe): ASC Aquário 18°, Lua
// Gêmeos 3°. Este app calcula ASC Aquário 18°03' — e mostrava a Lua em TOURO.
// ---------------------------------------------------------------------------
test('Obama (dado AA): a Lua natal é Gêmeos — sem o fuso este app dizia Touro', () => {
  const semFuso = moonSign('1961-08-04', '19:24');
  const comFuso = moonSign('1961-08-04', '19:24', HONOLULU);

  assert.strictEqual(semFuso.name, 'Touro', 'o comportamento antigo, preservado quando não se passa a cidade');
  assert.strictEqual(comFuso.name, 'Gêmeos', 'o que toda efeméride publica para este nascimento');

  // E o Ascendente, que já estava certo, continua certo — a correção da Lua
  // não move o que não devia se mover.
  assert.strictEqual(ascendantSign('1961-08-04', '19:24', HONOLULU.lat, HONOLULU.lon, HONOLULU).name, 'Aquário');
});

// ---------------------------------------------------------------------------
// COMPATIBILIDADE: sem o 3º argumento, nada muda. É o contrato que mantém a
// Home, o dailyThought e o cosmicSound (que pedem o céu de HOJE ancorado no
// meio-dia UTC, não um nascimento) exatamente como estavam.
// ---------------------------------------------------------------------------
test('sem o 3º argumento, moonSign/planetPositions/aspects são byte a byte o que eram', () => {
  assert.deepStrictEqual(moonSign('2015-01-20', '02:00'), moonSign('2015-01-20', '02:00', undefined));
  assert.deepStrictEqual(planetPositions('2015-01-20'), planetPositions('2015-01-20', undefined, undefined));
  assert.deepStrictEqual(aspects('2015-01-20', null), aspects('2015-01-20', null, undefined));

  // `null` também é "sem fuso" — o Quiz passa `cidade || undefined`, mas o
  // caminho do null precisa ser inofensivo do mesmo jeito.
  assert.deepStrictEqual(moonSign('2015-01-20', '02:00'), moonSign('2015-01-20', '02:00', null));

  // Número puro segue valendo como offset, igual em ascendantSign.
  assert.deepStrictEqual(
    moonSign('2015-01-20', '02:00', -2),
    moonSign('2015-01-20', '04:00'),
    'offset -2 às 02:00 de parede é o mesmo instante que 04:00 UTC'
  );
});

test('a cidade nova (com fuso IANA) resolve o horário de verão também na Lua e nos planetas', () => {
  // 20/01/2015 em São Paulo estava em -2 (horário de verão), não -3.
  const comCidade = planetPositions('2015-01-20', '02:00', SP);
  const emUtcEquivalente = planetPositions('2015-01-20', '04:00');
  assert.deepStrictEqual(comCidade, emUtcEquivalente);

  // Em julho não há horário de verão: -3, e o instante é 05:00Z.
  assert.deepStrictEqual(
    planetPositions('2015-07-20', '02:00', SP),
    planetPositions('2015-07-20', '05:00')
  );
});

test('cidade salva por versão antiga (sem `timezone`) cai no utcOffset fixo e continua funcionando', () => {
  const antiga = { name: 'São Paulo', lat: -23.5505, lon: -46.6333, utcOffset: -3 };
  assert.deepStrictEqual(
    planetPositions('2015-01-20', '02:00', antiga),
    planetPositions('2015-01-20', '05:00'),
    '-3 fixo => 05:00Z; pior que o certo, mas é o comportamento de sempre, nunca uma quebra'
  );
});

// ---------------------------------------------------------------------------
// O BUG INTERNO DA ASTROCARTOGRAFIA. A função calculava os ângulos de cada
// cidade no instante UTC correto e os PLANETAS num instante 2–3h diferente,
// dentro da mesma chamada. Com ANGLE_ORB = 3° e a Lua andando até 1,9° em 3h
// (8,3° em Auckland), a deriva era da ordem do próprio orbe.
//
// O teste é uma equivalência: passar a cidade tem que dar exatamente o mesmo
// que pedir o instante real direto, com offset 0. Antes da correção não dava.
// ---------------------------------------------------------------------------
test('astrocartografia: planetas e ângulos no MESMO instante', () => {
  // 20/01/2015 02:00 em São Paulo (-2) === 04:00 UTC.
  const comCidade = astrocartographyCities('2015-01-20', '02:00', SP);
  const noInstanteReal = astrocartographyCities('2015-01-20', '04:00', 0);
  assert.deepStrictEqual(comCidade, noInstanteReal);

  // Uma data de julho (sem horário de verão) pelo mesmo caminho: -3 => 05:00Z.
  assert.deepStrictEqual(
    astrocartographyCities('1990-07-15', '08:00', SP),
    astrocartographyCities('1990-07-15', '11:00', 0)
  );
});

// ---------------------------------------------------------------------------
// MANAUS. O comentário deste projeto dizia "Manaus nunca teve horário de
// verão" e havia até um teste com esse nome. É falso: o Amazonas participou de
// 1931-33, 1949-53, 1963-68, 1985-88 e 1993-94 (varrido mês a mês, 1900–2025).
// O que é verdade: de 1989 em diante Manaus só voltou a adiantar o relógio em
// 1993 e 1994 — de resto, -4 o ano inteiro. Conferido: varrendo 1989–2025, as
// ÚNICAS datas em que o mapa de Manaus muda são as de janeiro de 1994.
// ---------------------------------------------------------------------------
test('Manaus 2015: o mapa NÃO pode mudar — fuso fixo e fuso IANA dão o mesmo', () => {
  for (const data of ['2015-01-20', '2015-07-20', '2019-02-14', '1995-01-20']) {
    for (const hora of ['00:30', '02:00', '12:00', '23:30']) {
      assert.strictEqual(
        ascendantSign(data, hora, MANAUS.lat, MANAUS.lon, MANAUS).name,
        ascendantSign(data, hora, MANAUS.lat, MANAUS.lon, -4).name,
        `${data} ${hora}`
      );
      assert.deepStrictEqual(moonSign(data, hora, MANAUS), moonSign(data, hora, -4));
    }
  }
});

test('Manaus 1986 e 1994: teve horário de verão, então o -4 fixo ERRA lá também', () => {
  for (const data of ['1986-01-20', '1994-01-20', '1950-01-20']) {
    const fixo = ascendantSign(data, '02:00', MANAUS.lat, MANAUS.lon, -4);
    const certo = ascendantSign(data, '02:00', MANAUS.lat, MANAUS.lon, MANAUS);
    assert.notStrictEqual(certo.name, fixo.name, `${data}: o Amazonas estava em -3, não -4`);
  }
});

// ---------------------------------------------------------------------------
// VERIFICAÇÃO GEOMÉTRICA, sem depender de site nenhum: o Ascendente é, por
// definição, o ponto da eclíptica que está NASCENDO no horizonte leste. Então
// o grau devolvido, convertido para coordenadas equatoriais e jogado no
// Astronomy.Horizon() do próprio motor, tem que dar altitude ~0 e azimute no
// LESTE (0–180). Se o sinal da fórmula estivesse trocado o resultado seria o
// Descendente, e o azimute cairia no oeste.
// ---------------------------------------------------------------------------
test('o Ascendente é mesmo o ponto que nasce no leste (checagem independente da fórmula)', () => {
  let A;
  try {
    A = require('astronomy-engine');
  } catch {
    return; // sem o motor não há o que conferir
  }
  const D = Math.PI / 180;
  const casos = [
    ['2015-01-20', '02:00', SP, -2],
    ['2015-07-20', '02:00', SP, -3],
    ['1961-08-04', '19:24', HONOLULU, -10],
    ['1986-01-20', '02:00', MANAUS, -3],
  ];
  for (const [data, hora, cidade, offsetEsperado] of casos) {
    const utcMs = Date.parse(`${data}T${hora}:00Z`) - offsetEsperado * 3600e3;
    const d = new Date(utcMs);
    const gast = A.SiderealTime(d);
    const eps = A.e_tilt(A.MakeTime(d)).tobl * D;
    const ramc = (((((gast + cidade.lon / 15) * 15) % 360) + 360) % 360) * D;
    const y = Math.cos(ramc);
    const x = -(Math.sin(eps) * Math.tan(cidade.lat * D) + Math.cos(eps) * Math.sin(ramc));
    const grau = (((Math.atan2(y, x) / D) % 360) + 360) % 360;

    // o grau tem que ser o mesmo que ascendantSign usa (mesmo signo)
    const SIGNOS = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
    assert.strictEqual(
      ascendantSign(data, hora, cidade.lat, cidade.lon, cidade).name,
      SIGNOS[Math.floor(grau / 30)],
      `${cidade.name} ${data} ${hora}: offset resolvido tem que ser ${offsetEsperado}`
    );

    // e o ponto tem que estar nascendo no leste
    const lam = grau * D;
    const ra = ((Math.atan2(Math.sin(lam) * Math.cos(eps), Math.cos(lam)) / D / 15) % 24 + 24) % 24;
    const dec = Math.asin(Math.sin(eps) * Math.sin(lam)) / D;
    const h = A.Horizon(d, new A.Observer(cidade.lat, cidade.lon, 0), ra, dec, false);
    assert.ok(Math.abs(h.altitude) < 0.01, `${cidade.name}: altitude ${h.altitude}, devia ser ~0`);
    assert.ok(h.azimuth > 0 && h.azimuth < 180, `${cidade.name}: azimute ${h.azimuth}, devia estar no leste`);
  }
});

// ---------------------------------------------------------------------------
// A HORA QUE NÃO EXISTE E A QUE ACONTECE DUAS VEZES — o app não pode travar
// nem devolver absurdo. Aqui a exigência é dupla: devolver um signo válido E
// devolver um dos DOIS offsets possíveis daquela virada, nunca um terceiro.
// ---------------------------------------------------------------------------
test('viradas do horário de verão: sempre um signo válido, nunca null nem exceção', () => {
  const SIGNOS = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
  const NY = { lat: 40.7128, lon: -74.006, utcOffset: -5, timezone: 'America/New_York' };
  const viradas = [
    // entrada do verão em SP (2014-10-19: 00:00 pulou pra 01:00 — 00:00-00:59 não existiu)
    ['2014-10-18', SP], ['2014-10-19', SP],
    // saída (2015-02-22: 00:00 voltou pra 23:00 do dia 21 — 23:00-23:59 aconteceu 2x)
    ['2015-02-21', SP], ['2015-02-22', SP],
    // EUA, os dois lados
    ['2015-03-08', NY], ['2015-11-01', NY],
  ];
  for (const [data, cidade] of viradas) {
    for (let h = 0; h < 24; h++) {
      for (const m of ['00', '30', '59']) {
        const hora = `${String(h).padStart(2, '0')}:${m}`;
        const asc = ascendantSign(data, hora, cidade.lat, cidade.lon, cidade);
        assert.ok(asc && SIGNOS.includes(asc.name), `${data} ${hora} devolveu ${JSON.stringify(asc)}`);
        const lua = moonSign(data, hora, cidade);
        assert.ok(lua && SIGNOS.includes(lua.name), `lua ${data} ${hora}`);
      }
    }
  }
});
