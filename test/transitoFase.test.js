// test/transitoFase.test.js
// APLICATIVO × SEPARATIVO — as travas que impedem esta feature de virar
// invenção.
//
// Este arquivo guarda sete leis:
//
//   1. A DIREÇÃO ESTÁ CERTA, E O SINAL NÃO PODE INVERTER. O resíduo assinado é
//      conferido contra o instante EXATO do aspecto, achado por bisseção na
//      efeméride real — outro caminho inteiro. Uma inversão de sinal aqui
//      trocaria "está chegando" por "já passou" na cara do usuário, todo dia,
//      sem ninguém perceber. E o caso que a comparação de módulos de
//      personalSky.js erra — o aspecto que perfaz DENTRO das próximas 24 horas
//      — tem teste próprio, porque é o motivo de o módulo existir.
//   2. RETRÓGRADO INVERTE TUDO. É o caso que mais se erra: a definição de
//      Ptolomeu I.24 é posicional e supõe marcha direta; a de Valente IX.3
//      olha o movimento. Onde discordam, o app segue Valente — e o teste
//      trava as duas leituras lado a lado.
//   3. NUNCA FABRICAR CÉU. Sem data, sem efeméride ou sem aspecto
//      reconhecível, a função declara indisponível, diz o que falta e diz ONDE
//      informar. E há uma recusa medida: aspecto ao natal da LUA sem hora de
//      nascimento não recebe fase nenhuma, porque meio-dia e meia-noite dão
//      respostas opostas.
//   4. PARIDADE DOS TRÊS PACKS. Mesma forma, mesmas chaves, nenhum valor
//      vazio, nenhum placeholder por interpolar, nenhum vazamento de PT em
//      es/en. E `lang` ausente é o `lang='pt'`.
//   5. LINHA VERMELHA nos três idiomas: nada de saúde nem seus primos, nada de
//      veredito, nada de promessa, nada de porcentagem, e nada de aviso
//      defensivo (foram removidos de propósito do app — escrever um novo é bug).
//   6. PRENDE PRIMEIRO, FONTE DEPOIS. A chamada e o primeiro parágrafo da
//      leitura abrem na vida real: nenhum nome próprio, nenhum capítulo,
//      nenhum termo técnico. O recibo vem depois, e o termo técnico ganha
//      glosa na primeira aparição.
//   7. A FONTE, E SÓ A FONTE. O verbatim inglês é idêntico nos três packs; todo
//      locus carrega obra, autor e século; a datação passa por
//      lib/traducoes/datacao.js; e — a trava mais importante desta feature —
//      NENHUM texto diz que o aspecto aplicativo vale mais que o separativo,
//      porque a base não achou a linha antiga que autorize isso.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const T = require('../lib/transitoFase.js');
const PT = require('../lib/traducoes/transitoFase.pt.js').PACK;
const ES = require('../lib/traducoes/transitoFase.es.js').PACK;
const EN = require('../lib/traducoes/transitoFase.en.js').PACK;
const { planetPositions } = require('../lib/signs.js');
const { traduzirAutor, traduzirQuando } = require('../lib/traducoes/datacao.js');
const A = require('astronomy-engine');

const LANGS = { pt: PT, es: ES, en: EN };
const IDIOMAS = ['pt', 'es', 'en'];

const SP = { id: 'sao-paulo-br', name: 'São Paulo', lat: -23.5505, lon: -46.6333, utcOffset: -3, timezone: 'America/Sao_Paulo' };

// Nascimento de referência, com hora e cidade — o caso completo.
const BIRTH = { date: '1990-06-15', time: '14:30', city: SP };
// O mesmo nascimento sem hora e sem cidade: getAnyBirthData pode devolver os
// dois como null, e a feature tem que se virar (ou recusar, no caso da Lua).
const BIRTH_SO_DATA = { date: '1990-06-15', time: null, city: null };

// Dias fixos, para o teste não depender de quando roda.
const HOJE = '2026-08-01';
const HOJE_PARADO = '2026-03-10'; // Júpiter estacionário, achado por varredura

// Casos reais deste nascimento nestes dias — conferidos um a um na varredura.
const CASOS = {
  aplicativo: { transitPlanet: 'Sol', natalPlanet: 'Marte', aspectType: 'Trígono' },
  separativo: { transitPlanet: 'Vênus', natalPlanet: 'Sol', aspectType: 'Quadratura' },
  aplicativoRetrogrado: { transitPlanet: 'Saturno', natalPlanet: 'Netuno', aspectType: 'Quadratura' },
  separativoRetrogrado: { transitPlanet: 'Saturno', natalPlanet: 'Júpiter', aspectType: 'Quadratura' },
  foraDoHorizonte: { transitPlanet: 'Mercúrio', natalPlanet: 'Saturno', aspectType: 'Oposição' },
  exatoHoje: { transitPlanet: 'Lua', natalPlanet: 'Netuno', aspectType: 'Sextil' },
  luaNatal: { transitPlanet: 'Mercúrio', natalPlanet: 'Lua', aspectType: 'Trígono' },
};
const CASO_PARADO = { transitPlanet: 'Júpiter', natalPlanet: 'Júpiter', aspectType: 'Conjunção' };

function ler(caso, lang = 'pt', hoje = HOJE, birth = BIRTH) {
  return T.faseDoTransito(caso, birth, lang, { hoje });
}

// Uma leitura de cada fase, em cada idioma — é este conjunto que as varreduras
// de linha vermelha e de jargão percorrem.
const AMOSTRA = {};
for (const lang of IDIOMAS) {
  AMOSTRA[lang] = [
    ler(CASOS.aplicativo, lang),
    ler(CASOS.separativo, lang),
    ler(CASOS.aplicativoRetrogrado, lang),
    ler(CASOS.separativoRetrogrado, lang),
    ler(CASOS.foraDoHorizonte, lang),
    ler(CASOS.exatoHoje, lang),
    ler(CASO_PARADO, lang, HOJE_PARADO),
  ];
}

// ===========================================================================
// 1. A DIREÇÃO — o sinal, conferido por outro caminho 📐
// ===========================================================================

const BODIES = {
  'Sol': null, 'Lua': null, 'Mercúrio': 'Mercury', 'Vênus': 'Venus', 'Marte': 'Mars',
  'Júpiter': 'Jupiter', 'Saturno': 'Saturn', 'Urano': 'Uranus', 'Netuno': 'Neptune', 'Plutão': 'Pluto',
};

function longitudeReal(nome, date) {
  if (nome === 'Sol') return ((A.SunPosition(date).elon % 360) + 360) % 360;
  if (nome === 'Lua') return ((A.EclipticGeoMoon(date).lon % 360) + 360) % 360;
  return ((A.Ecliptic(A.GeoVector(A.Body[BODIES[nome]], date, true)).elon % 360) + 360) % 360;
}

function n180(x) {
  return ((((x + 180) % 360) + 360) % 360) - 180;
}

// O instante exato do aspecto, achado por bisseção na efeméride — o caminho
// independente. Devolve dias a partir de t0Ms, ou null se não houver raiz na
// janela (o planeta parou e voltou antes de chegar lá, que é caso real).
function raizReal(nome, t0Ms, natalLon, angulo, lado, dir, maxDias) {
  const DIA = 86400000;
  const passo = (nome === 'Lua' ? 0.02 : 0.25) * dir;
  const residuo = (t) => n180(longitudeReal(nome, new Date(t)) - natalLon - lado * angulo);
  let tA = t0Ms;
  let rA = residuo(tA);
  for (let i = 1; i * Math.abs(passo) <= maxDias; i++) {
    const tB = t0Ms + i * passo * DIA;
    const rB = residuo(tB);
    if (Math.abs(rA) < 30 && Math.abs(rB) < 30 && Math.sign(rA) !== Math.sign(rB)) {
      let lo = tA;
      let hi = tB;
      let rlo = rA;
      for (let k = 0; k < 45; k++) {
        const mid = (lo + hi) / 2;
        const rm = residuo(mid);
        if (Math.sign(rm) === Math.sign(rlo)) {
          lo = mid;
          rlo = rm;
        } else {
          hi = mid;
        }
      }
      return ((lo + hi) / 2 - t0Ms) / DIA;
    }
    tA = tB;
    rA = rB;
  }
  return null;
}

test('📐 a direção calculada por hoje-vs-amanhã bate com o instante exato achado na efeméride', () => {
  const DIA = 86400000;
  const base = Date.UTC(2026, 0, 1, 12, 0, 0);
  const ANGULOS = Object.values(T.ANGULO_DO_ASPECTO);
  let conferidos = 0;
  let divergencias = 0;

  for (const nome of Object.keys(BODIES)) {
    for (let d = 0; d < 400; d += nome === 'Lua' ? 5 : 23) {
      const t0 = base + d * DIA;
      const hoje = longitudeReal(nome, new Date(t0));
      const amanha = longitudeReal(nome, new Date(t0 + DIA));
      for (let natalLon = 0; natalLon < 360; natalLon += 17) {
        for (const angulo of ANGULOS) {
          const f = T.faseDoAspecto(hoje, amanha, natalLon, angulo);
          assert.ok(f, `${nome} ${angulo}: faseDoAspecto devolveu null com entrada boa`);
          if (f.fase === 'estacionario') continue;
          // Só vale conferir o que estaria em orbe numa tela de verdade.
          if (f.residuoGraus > 6) continue;
          const dir = f.fase === 'aplicativo' ? 1 : -1;
          const real = raizReal(nome, t0, natalLon, angulo, f.lado, dir, 200);
          if (real === null) continue; // o planeta parou e voltou: não há raiz
          conferidos++;
          if (Math.sign(real) !== dir) divergencias++;
        }
      }
    }
  }

  assert.ok(conferidos > 900, `varredura magra demais: ${conferidos} casos`);
  assert.equal(
    divergencias,
    0,
    `${divergencias} de ${conferidos} direções divergiram do instante real — isso é sinal invertido, não borda`
  );
});

test('o caso que a comparação de MÓDULOS erra: o aspecto que perfaz dentro de 24 horas', () => {
  // A Lua a 0,5° do exato hoje está a ~12° do OUTRO lado amanhã. Comparar
  // |resíduo de hoje| com |resíduo de amanhã| diria "separativo" — e o aspecto
  // fecha em uma hora. É exatamente o bug que este módulo existe para corrigir.
  const natal = 100;
  const hoje = 99.5; // 0,5° antes da conjunção
  const amanha = hoje + 12.8; // a Lua atravessa e sai do outro lado
  assert.ok(Math.abs(amanha - natal) > Math.abs(hoje - natal), 'o cenário precisa ter |amanhã| > |hoje|');

  const f = T.faseDoAspecto(hoje, amanha, natal, 0);
  assert.equal(f.fase, 'aplicativo');
  assert.ok(f.diasParaExato > 0 && f.diasParaExato < 0.05, `esperava fechar em ~1h, veio ${f.diasParaExato}`);
  assert.equal(f.exatoNoDia, true);
});

test('mesmo orbe, fases opostas — é o sinal, não o módulo, que decide', () => {
  // personalSky.js entrega os dois com o MESMO `orb`. Aqui eles se separam.
  const chegando = T.faseDoAspecto(88, 89, 0, 90); // 2° antes da quadratura, indo pra lá
  const indo = T.faseDoAspecto(92, 93, 0, 90); // 2° depois, se afastando
  assert.equal(chegando.residuoGraus.toFixed(6), indo.residuoGraus.toFixed(6));
  assert.equal(chegando.fase, 'aplicativo');
  assert.equal(indo.fase, 'separativo');
});

test('retrógrado inverte a fase — o caso de Valente IX.3', () => {
  // Mesmas posições; só o sentido do movimento muda.
  const direto = T.faseDoAspecto(92, 93, 0, 90);
  const retro = T.faseDoAspecto(92, 91, 0, 90);
  assert.equal(direto.retrogrado, false);
  assert.equal(retro.retrogrado, true);
  assert.equal(direto.fase, 'separativo');
  assert.equal(retro.fase, 'aplicativo', 'planeta retrógrado atrás do exato está VOLTANDO para ele');
  // E o outro lado: o que estava chegando passa a ir embora.
  assert.equal(T.faseDoAspecto(88, 89, 0, 90).fase, 'aplicativo');
  assert.equal(T.faseDoAspecto(88, 87, 0, 90).fase, 'separativo');
});

test('o app leva a marcha retrógrada até o texto, e cita quem resolveu o caso', () => {
  const r = ler(CASOS.aplicativoRetrogrado);
  assert.equal(r.disponivel, true);
  assert.equal(r.retrogrado, true);
  assert.ok(r.movimentoDiario < 0);
  assert.equal(r.fase, 'aplicativo', 'Saturno retrógrado se aproximando: aplicativo, não separativo');
  assert.match(r.notaMarcha, /retrógrada/);
  assert.match(r.notaMarcha, /Anthologiae IX\.3/);
  assert.match(r.notaMarcha, /Anthologiae IV\.14/);
  // E o direto não recebe a nota de retrógrado.
  const direto = ler(CASOS.aplicativo);
  assert.equal(direto.retrogrado, false);
  assert.match(direto.notaMarcha, /marcha direta/);
});

test('as bordas do círculo: conjunção em 0/360 e oposição em ±180', () => {
  // Conjunção com o natal a 1°, planeta a 359° andando para a frente: aplica.
  const conj = T.faseDoAspecto(359, 0.5, 1, 0);
  assert.equal(conj.fase, 'aplicativo');
  assert.ok(conj.residuoGraus > 1.9 && conj.residuoGraus < 2.1, conj.residuoGraus);
  // Oposição: natal a 10°, planeta a 189° indo para 190°.
  const opo = T.faseDoAspecto(189, 190, 10, 180);
  assert.equal(opo.fase, 'aplicativo');
  assert.ok(opo.residuoGraus > 0.9 && opo.residuoGraus < 1.1, opo.residuoGraus);
  // E o mesmo par depois de passar.
  assert.equal(T.faseDoAspecto(191, 192, 10, 180).fase, 'separativo');
});

test('sextil, quadratura e trígono valem dos DOIS lados do natal', () => {
  for (const angulo of [60, 90, 120]) {
    const direita = T.faseDoAspecto(200 + angulo - 2, 200 + angulo - 1, 200, angulo);
    const esquerda = T.faseDoAspecto(200 - angulo + 2, 200 - angulo + 1, 200, angulo);
    assert.equal(direita.lado, 1, `${angulo} à frente`);
    assert.equal(esquerda.lado, -1, `${angulo} atrás`);
    assert.equal(direita.fase, 'aplicativo', `${angulo} à frente`);
    assert.equal(esquerda.fase, 'aplicativo', `${angulo} atrás`);
    assert.ok(Math.abs(direita.residuoGraus - 2) < 1e-9);
    assert.ok(Math.abs(esquerda.residuoGraus - 2) < 1e-9);
  }
});

test('planeta parado não recebe verbo: nem chegando, nem indo embora', () => {
  const parado = T.faseDoAspecto(100, 100 + T.LIMIAR_PARADO_GRAUS_POR_DIA / 2, 98, 0);
  assert.equal(parado.fase, 'estacionario');
  assert.equal(parado.diasParaExato, null);
  assert.equal(parado.dentroDoHorizonte, false);
  assert.ok(parado.residuoGraus > 0, 'o grau continua, porque grau é medida');
  // E o caso real, achado por varredura: Júpiter estacionário em 10/03/2026.
  const real = ler(CASO_PARADO, 'pt', HOJE_PARADO);
  assert.equal(real.disponivel, true);
  assert.equal(real.fase, 'estacionario');
  assert.equal(real.diasParaExato, null);
  assert.ok(Math.abs(real.movimentoDiario) < T.LIMIAR_PARADO_GRAUS_POR_DIA);
  assert.match(real.prazo, /Sem prazo/);
});

test('o prazo em dias tem HORIZONTE, e fora dele o app diz grau em vez de data', () => {
  const dentro = ler(CASOS.aplicativo);
  assert.equal(dentro.dentroDoHorizonte, true);
  assert.ok(dentro.diasParaExato > 0 && dentro.diasParaExato <= T.HORIZONTE_DO_PRAZO_DIAS);
  assert.equal(dentro.notaHorizonte, null);

  const fora = ler(CASOS.foraDoHorizonte);
  assert.equal(fora.dentroDoHorizonte, false);
  assert.equal(fora.diasParaExato, null, 'fora do horizonte não pode sair número de dias');
  assert.ok(fora.residuoGraus > 0, 'mas o grau continua: é medida, não projeção');
  assert.ok(fora.notaHorizonte.length > 150);
  assert.match(fora.notaHorizonte, /3\.735/, 'a nota tem que dizer em quantos aspectos isso foi medido');
  assert.match(fora.linhaCurta, /graus/);
  assert.ok(!/\bdias?\b/.test(fora.linhaCurta), `a linha curta fora do horizonte não pode falar em dias: ${fora.linhaCurta}`);
});

test('o sinal de diasParaExato é a feature: positivo no futuro, negativo no passado', () => {
  assert.ok(ler(CASOS.aplicativo).diasParaExato > 0);
  assert.ok(ler(CASOS.separativo).diasParaExato < 0);
  assert.equal(ler(CASOS.exatoHoje).exatoNoDia, true);
  assert.match(ler(CASOS.exatoHoje).prazo, /hoje/);
});

test('faseDoAspecto recusa entrada que não é número, e ângulo que não é aspecto', () => {
  assert.equal(T.faseDoAspecto(null, 1, 2, 0), null);
  assert.equal(T.faseDoAspecto(1, undefined, 2, 0), null);
  assert.equal(T.faseDoAspecto(1, 2, NaN, 0), null);
  assert.equal(T.faseDoAspecto(1, 2, 3, Infinity), null);
  assert.equal(T.faseDoAspecto(1, 2, 3, 45), null, '45° não é um dos cinco ângulos do app');
  assert.equal(T.faseDoAspecto('100', 101, 0, 0), null);
});

// ===========================================================================
// 2. NUNCA FABRICAR CÉU
// ===========================================================================

const NOME_DA_TELA = { pt: 'Mapa Astral', es: 'Carta Astral', en: 'Birth Chart' };

test('sem data, com data impossível ou sem aspecto: declara indisponível, nunca chuta', () => {
  const casos = [
    [T.faseDoTransito(CASOS.aplicativo, null, 'pt', { hoje: HOJE }), 'data'],
    [T.faseDoTransito(CASOS.aplicativo, {}, 'pt', { hoje: HOJE }), 'data'],
    [T.faseDoTransito(CASOS.aplicativo, { date: '1990-02-30' }, 'pt', { hoje: HOJE }), 'data'],
    [T.faseDoTransito(CASOS.aplicativo, { date: '15/06/1990' }, 'pt', { hoje: HOJE }), 'data'],
    [T.faseDoTransito(null, BIRTH, 'pt', { hoje: HOJE }), 'aspecto'],
    [T.faseDoTransito({}, BIRTH, 'pt', { hoje: HOJE }), 'aspecto'],
    [T.faseDoTransito({ transitPlanet: 'Quíron', natalPlanet: 'Sol', aspectType: 'Trígono' }, BIRTH, 'pt', { hoje: HOJE }), 'aspecto'],
    [T.faseDoTransito({ transitPlanet: 'Sol', natalPlanet: 'Sol', aspectType: 'Quincunce' }, BIRTH, 'pt', { hoje: HOJE }), 'aspecto'],
  ];
  for (const [r, motivo] of casos) {
    assert.equal(r.disponivel, false, motivo);
    assert.equal(r.fase, null);
    assert.equal(r.chamada, null);
    assert.equal(r.diasParaExato, null);
    assert.equal(r.residuoGraus, null);
    assert.deepEqual(r.falta, [motivo]);
    assert.ok(r.leitura.length > 80, 'a explicação do que falta não pode ser um rótulo seco');
    assert.ok(r.comoResolver.length > 20);
    // A fonte continua junto: a doutrina não some porque falta um campo.
    assert.equal(r.fonte.length, 6);
    assert.equal(r.verbatins.length, 3);
  }
});

test('RECUSA MEDIDA: aspecto ao natal da Lua sem hora de nascimento não recebe fase', () => {
  const semHora = T.faseDoTransito(CASOS.luaNatal, BIRTH_SO_DATA, 'pt', { hoje: HOJE });
  assert.equal(semHora.disponivel, false);
  assert.equal(semHora.motivo, 'horaParaLuaNatal');
  assert.equal(semHora.fase, null);
  assert.match(semHora.leitura, /7,69/, 'a recusa tem que trazer o número que a justifica');
  assert.match(semHora.leitura, /6\.334|12\.668/);
  assert.match(semHora.comoResolver, /hora de nascimento/);
  assert.match(semHora.comoResolver, /Mapa Astral/);

  // Com a hora, o mesmo aspecto responde normalmente.
  const comHora = T.faseDoTransito(CASOS.luaNatal, BIRTH, 'pt', { hoje: HOJE });
  assert.equal(comHora.disponivel, true);
  assert.ok(['aplicativo', 'separativo', 'estacionario'].includes(comHora.fase));
});

test('hora e cidade podem faltar — só a Lua natal é recusada, o resto responde', () => {
  for (const chave of ['aplicativo', 'separativo', 'foraDoHorizonte']) {
    const r = T.faseDoTransito(CASOS[chave], BIRTH_SO_DATA, 'pt', { hoje: HOJE });
    assert.equal(r.disponivel, true, `${chave} sem hora/cidade deveria responder`);
    assert.ok(r.leitura.length > 900);
  }
  // A Lua EM TRÂNSITO não é problema: quem é aproximada sem hora é a natal.
  const luaTransito = T.faseDoTransito(CASOS.exatoHoje, BIRTH_SO_DATA, 'pt', { hoje: HOJE });
  assert.equal(luaTransito.disponivel, true);
});

test('o que falta vem sempre com ONDE resolver, e o nome da tela é o do idioma', () => {
  for (const lang of IDIOMAS) {
    for (const motivo of ['data', 'aspecto', 'efemeride', 'horaParaLuaNatal']) {
      const f = LANGS[lang].falta[motivo];
      assert.ok(f.texto.trim().length > 100, `${lang}/${motivo}`);
      assert.ok(
        f.comoResolver.includes(NOME_DA_TELA[lang]),
        `${lang}/${motivo} não diz onde informar: ${f.comoResolver}`
      );
    }
  }
});

test('lib/transitoFase.js não fala com AsyncStorage nem com a rede', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'transitoFase.js'), 'utf8');
  assert.ok(!/AsyncStorage/.test(src), 'storage aqui só via lib/storage.js — e esta feature não precisa de storage nenhum');
  assert.ok(!/@react-native-async-storage/.test(src));
  assert.ok(!/\bfetch\(/.test(src), 'zero rede: a conta é local');
});

test('posicoesDoDia nunca inventa, e hoje e amanhã ficam a exatamente 24 horas', () => {
  assert.equal(T.posicoesDoDia(null, HOJE), null);
  assert.equal(T.posicoesDoDia({ date: '1990-02-30' }, HOJE), null);
  const p = T.posicoesDoDia(BIRTH, HOJE);
  assert.equal(p.diaHoje, HOJE);
  assert.equal(p.diaAmanha, '2026-08-02');
  assert.equal(p.natal.length, 10);
  assert.equal(p.hoje.length, 10);
  assert.equal(p.amanha.length, 10);
  assert.equal(T.diaSeguinte('2026-12-31'), '2027-01-01');
  assert.equal(T.diaSeguinte('2028-02-28'), '2028-02-29');
  assert.equal(T.diaSeguinte('lixo'), null);
});

// ===========================================================================
// 3. PARIDADE DOS TRÊS PACKS
// ===========================================================================

function forma(v) {
  if (typeof v === 'function') return 'fn';
  if (Array.isArray(v)) return v.map(forma);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = forma(v[k]);
    return o;
  }
  return typeof v;
}

function varrerStrings(v, caminho, cb) {
  if (typeof v === 'string') return cb(caminho, v);
  if (Array.isArray(v)) return v.forEach((x, i) => varrerStrings(x, `${caminho}[${i}]`, cb));
  if (v && typeof v === 'object') for (const k of Object.keys(v)) varrerStrings(v[k], `${caminho}.${k}`, cb);
}

test('es e en têm EXATAMENTE a mesma forma do pt — mesmas chaves, mesmos tipos', () => {
  const formaPt = forma(PT);
  assert.deepEqual(forma(ES), formaPt, 'o pack es divergiu da forma do pt');
  assert.deepEqual(forma(EN), formaPt, 'o pack en divergiu da forma do pt');
});

test('as CHAVES de planeta e de aspecto são as mesmas nos três packs, e são as do motor', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.deepEqual(Object.keys(pack.planetas).sort(), [...T.ORDEM_DOS_PLANETAS].sort(), lang);
    assert.deepEqual(Object.keys(pack.planetasFrase).sort(), [...T.ORDEM_DOS_PLANETAS].sort(), lang);
    assert.deepEqual(Object.keys(pack.aspectos).sort(), [...T.ORDEM_DOS_ASPECTOS].sort(), lang);
    assert.deepEqual(Object.keys(pack.faseNome).sort(), ['aplicativo', 'estacionario', 'separativo']);
    assert.deepEqual(Object.keys(pack.chamada).sort(), ['aplicativo', 'estacionario', 'separativo']);
    assert.deepEqual(Object.keys(pack.leitura).sort(), ['aplicativo', 'estacionario', 'separativo']);
    assert.deepEqual(Object.keys(pack.linhaCurta).sort(), ['aplicativo', 'estacionario', 'separativo']);
  }
  assert.deepEqual(Object.keys(T.ANGULO_DO_ASPECTO).sort(), [...T.ORDEM_DOS_ASPECTOS].sort());
});

test('nenhum valor de nenhum pack é vazio', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    varrerStrings(pack, lang, (caminho, s) => assert.ok(s.trim().length > 0, `${caminho} está vazio`));
  }
});

// Tudo que o usuário lê numa leitura, num idioma.
function corpus(r) {
  return [
    r.chamada, r.leitura, r.prazo, r.linhaCurta, r.faseNome, r.faseTermo,
    r.transitoNome, r.natalNome, r.transitoRotulo, r.natalRotulo, r.aspectoNome,
    r.notaMarcha, r.notaHorizonte, r.notaOrbe, r.notaLeituraDoApp, r.notaDataDeEvento,
    r.comoResolver,
    ...r.verbatins.map((v) => `${v.texto} ${v.parafrase} ${v.locus}`),
    ...r.fonte,
  ]
    .filter(Boolean)
    .join(' \n ');
}

test('a leitura sai INTEIRA nos três idiomas — nenhum campo perdido, nada por interpolar', () => {
  const CAMPOS = [
    'fase', 'faseNome', 'faseTermo', 'chamada', 'leitura', 'prazo', 'linhaCurta',
    'notaMarcha', 'notaOrbe', 'notaLeituraDoApp', 'notaDataDeEvento',
    'transitoNome', 'natalNome', 'transitoRotulo', 'natalRotulo', 'aspectoNome',
  ];
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      assert.equal(r.disponivel, true, lang);
      for (const campo of CAMPOS) assert.ok(r[campo], `${lang} perdeu ${campo}`);
      assert.equal(r.fonte.length, 6, lang);
      assert.equal(r.verbatins.length, 3, lang);
      const c = corpus(r);
      assert.ok(!c.includes('undefined'), `${lang} vazou "undefined"`);
      assert.ok(!c.includes('[object Object]'), `${lang} vazou objeto`);
      assert.ok(!c.includes('NaN'), `${lang} vazou NaN`);
      assert.ok(!c.includes('null'), `${lang} vazou null`);
      assert.ok(!/\$\{|\{\w+\}/.test(c), `${lang} vazou placeholder sem interpolar`);
      assert.ok(r.leitura.length > 1500, `${lang} leitura curta demais: ${r.leitura.length}`);
      assert.ok(r.chamada.length > 150 && r.chamada.length < 500, `${lang} chamada com ${r.chamada.length}`);
      assert.ok(r.linhaCurta.length > 30 && r.linhaCurta.length < 200, `${lang} linhaCurta com ${r.linhaCurta.length}`);
    }
  }
});

test('as três fases saem, com texto, nos três idiomas', () => {
  for (const lang of IDIOMAS) {
    const fases = new Set(AMOSTRA[lang].map((r) => r.fase));
    assert.deepEqual([...fases].sort(), ['aplicativo', 'estacionario', 'separativo'], lang);
    // E o verbo é diferente nos três estados — a feature inteira é o verbo.
    const verbos = new Set(AMOSTRA[lang].map((r) => r.faseNome));
    assert.equal(verbos.size, 3, `${lang}: os três estados precisam de três verbos distintos`);
  }
});

test('es e en não vazam português, e não repetem o pt', () => {
  const PT_MARCADO = /\bvocê\b|\bnão\b|\bmapa\b|\bgraus\b|\bhoje\b|\bseu\b|Vênus|\bLua\b|Mercúrio|Plutão|Netuno|\bconta\b/i;
  for (const lang of ['es', 'en']) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      assert.ok(!PT_MARCADO.test(s), `${caminho} vazou português: ${s.match(PT_MARCADO)}`);
    });
    for (let i = 0; i < AMOSTRA.pt.length; i++) {
      assert.notEqual(AMOSTRA[lang][i].chamada, AMOSTRA.pt[i].chamada, `${lang} chamada igual ao pt`);
      assert.notEqual(AMOSTRA[lang][i].leitura, AMOSTRA.pt[i].leitura, `${lang} leitura igual ao pt`);
      assert.notEqual(AMOSTRA[lang][i].linhaCurta, AMOSTRA.pt[i].linhaCurta, `${lang} linhaCurta igual ao pt`);
    }
  }
});

test('a conta não muda com o idioma — fase, graus, movimento e prazo são os mesmos', () => {
  for (let i = 0; i < AMOSTRA.pt.length; i++) {
    const pt = AMOSTRA.pt[i];
    for (const lang of ['es', 'en']) {
      const outro = AMOSTRA[lang][i];
      assert.equal(outro.fase, pt.fase);
      assert.equal(outro.residuoGraus, pt.residuoGraus);
      assert.equal(outro.movimentoDiario, pt.movimentoDiario);
      assert.equal(outro.diasParaExato, pt.diasParaExato);
      assert.equal(outro.retrogrado, pt.retrogrado);
      assert.equal(outro.dentroDoHorizonte, pt.dentroDoHorizonte);
    }
  }
});

test("lang ausente e lang='pt' são a MESMA leitura; idioma desconhecido cai no PT", () => {
  const semLang = T.faseDoTransito(CASOS.aplicativo, BIRTH, undefined, { hoje: HOJE });
  const comPt = T.faseDoTransito(CASOS.aplicativo, BIRTH, 'pt', { hoje: HOJE });
  assert.deepEqual(semLang, comPt);
  for (const lang of [null, 'fr', 'de-DE', 42, {}]) {
    assert.deepEqual(T.faseDoTransito(CASOS.aplicativo, BIRTH, lang, { hoje: HOJE }), comPt, String(lang));
  }
  // Também no caminho indisponível.
  assert.deepEqual(
    T.faseDoTransito(CASOS.aplicativo, null, 'fr', { hoje: HOJE }),
    T.faseDoTransito(CASOS.aplicativo, null, 'pt', { hoje: HOJE })
  );
});

test('as três durações formatam certo em cada idioma, incluindo o singular', () => {
  const esperado = {
    pt: ['menos de uma hora', 'cerca de 2 horas', 'cerca de um dia', 'cerca de 2 dias e 12 horas'],
    es: ['menos de una hora', 'cerca de 2 horas', 'cerca de un día', 'cerca de 2 días y 12 horas'],
    en: ['less than an hour', 'about 2 hours', 'about a day', 'about 2 days and 12 hours'],
  };
  for (const lang of IDIOMAS) {
    const d = LANGS[lang].duracao;
    assert.equal(d(0.01), esperado[lang][0], lang);
    assert.equal(d(2 / 24), esperado[lang][1], lang);
    assert.equal(d(1), esperado[lang][2], lang);
    assert.equal(d(2.5), esperado[lang][3], lang);
    // Negativo é o mesmo texto: quem diz "faz" ou "falta" é a frase, não o número.
    assert.equal(d(-2.5), esperado[lang][3], lang);
  }
  assert.equal(PT.graus(1), '1 grau');
  assert.equal(ES.graus(1), '1 grado');
  assert.equal(EN.graus(1), '1 degree');
  assert.equal(PT.graus(3.456), '3,46 graus');
  assert.equal(EN.graus(3.456), '3.46 degrees');
  assert.equal(PT.graus(-0.5), '0,50 graus', 'o sinal quem conta é o texto, não o número');
});

// ===========================================================================
// 4. A LINHA VERMELHA, NOS TRÊS IDIOMAS
// ===========================================================================
// Lista de PALAVRA, não de intenção: se a palavra passa hoje numa frase
// inocente, amanhã passa numa frase que promete tratamento.

const SAUDE = {
  pt: [
    /\b(alivi\w*|acalm\w*|cur(a|as|ar|am|ando)|sar(a|ar|am)|trat(a|am|ar|amento|amentos)|energiz\w*|terapia|terap[êe]utic\w*|rem[ée]dio)\b/i,
    /\bfertilidade\b|\bf[ée]rtil\b|engravidar|gravidez|ansiedade|depress[ãa]o|ins[ôo]nia/i,
  ],
  es: [
    /\b(alivi\w*|calm\w*|san(a|an|ar|aci[óo]n)|cur(a|an|ar|aci[óo]n)|trat(a|an|ar|amiento|amientos)|energiz\w*|terapia|terap[ée]utic\w*|remedio)\b/i,
    /\bfertilidad\b|\bf[ée]rtil\b|embarazo|embarazada|ansiedad|depresi[óo]n|insomnio/i,
  ],
  en: [
    /\b(relieve[sd]?|relief|sooth\w*|calm\w*|heal\w*|cure[sd]?|curing|treat(s|ed|ing|ment|ments)?|energiz\w*|therapy|therapeutic|remedy|remedies)\b/i,
    /\bfertility\b|\bfertile\b|pregnan\w*|anxiety|depression|insomnia/i,
  ],
};

const PROMESSA = {
  pt: [/\bvocê vai\b/i, /\bvai (ter|conseguir|ganhar|dar certo|acontecer)\b/i, /garant\w+/i, /com certeza você/i, /sorte grande/i, /destino selado/i],
  es: [/\bvas a (tener|lograr|conseguir|ganar)\b/i, /garantiz\w+/i, /suerte grande/i, /destino sellado/i],
  en: [/\byou will\b/i, /\byou'?re going to\b/i, /guarantee\w*/i, /destined to/i, /\bfated to\b/i],
};

// Avisos defensivos foram removidos do app de propósito. Escrever um novo é bug.
const AVISO_DEFENSIVO = {
  pt: [/n[ãa]o garante resultado/i, /apenas entretenimento/i, /fins de entretenimento/i, /n[ãa]o substitui/i],
  es: [/no garantiza resultado/i, /solo entretenimiento/i, /fines de entretenimiento/i, /no sustituye/i],
  en: [/entertainment purposes/i, /does not guarantee/i, /no substitute for/i],
};

test('nenhuma leitura, em nenhum idioma, usa linguagem de saúde ou seus primos', () => {
  for (const [lang, regexes] of Object.entries(SAUDE)) {
    for (const r of AMOSTRA[lang]) {
      const c = corpus(r);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — linha vermelha na leitura: ${c.match(re)}`);
    }
    // E o pack inteiro, inclusive o que nenhuma leitura exercita por acaso.
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — linha vermelha: ${s.match(re)}`);
    });
  }
  // Contrapartida: varredura que não morde não protege ninguém.
  assert.ok(SAUDE.pt.some((re) => re.test('isso alivia a ansiedade')));
  assert.ok(SAUDE.es.some((re) => re.test('esto calma y sana')));
  assert.ok(SAUDE.en.some((re) => re.test('this will heal and soothe you')));
});

test('nenhuma leitura promete resultado nem decreta desfecho', () => {
  for (const [lang, regexes] of Object.entries(PROMESSA)) {
    for (const r of AMOSTRA[lang]) {
      const c = corpus(r);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — promessa: ${c.match(re)}`);
    }
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — promessa: ${s.match(re)}`);
    });
  }
  assert.ok(PROMESSA.pt.some((re) => re.test('você vai conseguir tudo')));
  assert.ok(PROMESSA.en.some((re) => re.test('you will get the job')));
});

test('nenhum aviso defensivo novo — eles foram removidos do app de propósito', () => {
  for (const [lang, regexes] of Object.entries(AVISO_DEFENSIVO)) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — aviso defensivo: ${s.match(re)}`);
    });
  }
});

test('não existe porcentagem, nota nem score em lugar nenhum', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      assert.ok(!corpus(r).includes('%'), `${lang} mostra porcentagem`);
      assert.equal(r.pct, undefined);
      assert.equal(r.nota, undefined);
      assert.equal(r.score, undefined);
      assert.equal(r.forca, undefined);
    }
    varrerStrings(LANGS[lang], lang, (caminho, s) => assert.ok(!s.includes('%'), `${caminho} tem porcentagem`));
  }
});

// ===========================================================================
// 5. PRENDE PRIMEIRO, FONTE DEPOIS
// ===========================================================================

const JARGAO = [
  /Ptolomeu|Ptolomeo|Ptolemy|Valente|Valens|Tetrabiblos|Anthologiae|Robbins|Riley|Lilly/i,
  /\b[IVX]+\.\d+\b/,
  /aplicativ\w*|separativ\w*|\bapplying\b|\bseparating\b/i,
  /\baspecto?s?\b|\borbe?s?\b|efem[ée]ride|ephemeris|longitude/i,
  /\btr[âá]nsito\b|\btransits?\b|retr[óo]grad\w*|\bretrograde\b|estacion[áa]ri\w*|\bstationary\b/i,
  /\bAscendente\b|\bAscendant\b|\bec[lí]iptic\w*\b/i,
  /s[ée]c\.|\bsiglo\b|\bcentury\b|\d{4}/i,
];

test('a CHAMADA abre na vida real: nenhum nome próprio, nenhum capítulo, nenhum termo técnico', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      for (const re of JARGAO) {
        assert.ok(!re.test(r.chamada), `${lang}: a chamada abriu com jargão — ${r.chamada.match(re)}`);
      }
    }
  }
});

test('o PRIMEIRO parágrafo da leitura também é vida real; a fonte vem DEPOIS', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      const paragrafos = r.leitura.split('\n\n');
      assert.ok(paragrafos.length >= 5, `${lang}: a leitura tem ${paragrafos.length} parágrafos`);
      for (const re of JARGAO) {
        assert.ok(!re.test(paragrafos[0]), `${lang}: a abertura vazou jargão — ${paragrafos[0].match(re)}`);
      }
      // E o recibo está lá, mais adiante.
      assert.match(r.leitura, /Tetrabiblos I\.24/);
      assert.match(r.leitura, /Anthologiae IX\.3/);
      assert.ok(r.leitura.indexOf('Tetrabiblos') > paragrafos[0].length, `${lang}: a fonte abriu a leitura`);
    }
  }
});

test('o termo técnico ganha glosa na primeira aparição', () => {
  assert.match(AMOSTRA.pt[0].leitura, /aplicativo, o ângulo que ainda vai fechar/);
  assert.match(AMOSTRA.es[0].leitura, /aplicativo, el ángulo que todavía va a cerrarse/);
  assert.match(AMOSTRA.en[0].leitura, /applying, the angle that has yet to close/);
  for (const lang of IDIOMAS) {
    assert.match(LANGS[lang].faseTermo.aplicativo, /\(/, `${lang}: o termo técnico anda sempre com a glosa`);
    assert.match(LANGS[lang].faseTermo.separativo, /\(/);
    assert.match(LANGS[lang].faseTermo.estacionario, /\(/);
  }
});

// ===========================================================================
// 6. A FONTE, E SÓ A FONTE
// ===========================================================================

test('o verbatim inglês é IDÊNTICO nos três packs — traduzir citação é falsificá-la', () => {
  for (const chave of ['ptolomeuI24', 'valenteJupiterRetrogrado', 'valenteEstacoes']) {
    assert.equal(ES.verbatim[chave].texto, PT.verbatim[chave].texto, chave);
    assert.equal(EN.verbatim[chave].texto, PT.verbatim[chave].texto, chave);
    // A paráfrase, ao contrário, é do app e muda em cada idioma.
    assert.notEqual(ES.verbatim[chave].parafrase, PT.verbatim[chave].parafrase, chave);
    assert.notEqual(EN.verbatim[chave].parafrase, PT.verbatim[chave].parafrase, chave);
  }
  // E o texto é o que está na fonte, não uma reescrita nossa.
  assert.match(PT.verbatim.ptolomeuI24.texto, /those which precede are said to 'apply' to those which follow/);
  assert.match(PT.verbatim.valenteJupiterRetrogrado.texto, /it is being carried towards the position of the Ascendant/);
  assert.match(PT.verbatim.valenteEstacoes.texto, /they cancel any delay and reinstate the same activities/);
});

test('todo locus carrega OBRA, AUTOR e SÉCULO, nos três idiomas', () => {
  const AUTOR = { pt: /Ptolomeu/, es: /Ptolomeo/, en: /Ptolemy/ };
  const VALENS = { pt: /Vétio Valente/, es: /Vetio Valente/, en: /Vettius Valens/ };
  const SECULO = { pt: /séc\. II/, es: /siglo II/, en: /2nd c\./ };
  for (const lang of IDIOMAS) {
    const p = LANGS[lang];
    assert.match(p.verbatim.ptolomeuI24.locus, AUTOR[lang], lang);
    assert.match(p.verbatim.ptolomeuI24.locus, /Tetrabiblos I\.24/, lang);
    assert.match(p.verbatim.ptolomeuI24.locus, SECULO[lang], lang);
    assert.match(p.verbatim.valenteJupiterRetrogrado.locus, VALENS[lang], lang);
    assert.match(p.verbatim.valenteJupiterRetrogrado.locus, /Anthologiae IX\.3/, lang);
    assert.match(p.verbatim.valenteJupiterRetrogrado.locus, SECULO[lang], lang);
    assert.match(p.verbatim.valenteEstacoes.locus, /Anthologiae IV\.14/, lang);
    assert.match(p.verbatim.valenteEstacoes.locus, SECULO[lang], lang);
    // A bibliografia inteira: seis linhas, todas com obra e datação.
    assert.equal(p.fontes.length, 6, lang);
    for (const f of p.fontes) {
      assert.ok(/Tetrabiblos|Anthologiae|Christian Astrology/.test(f), `${lang}: fonte sem obra — ${f}`);
      assert.ok(SECULO[lang].test(f) || /1647/.test(f), `${lang}: fonte sem datação — ${f}`);
    }
  }
});

test('a datação passa por lib/traducoes/datacao.js — a obra não traduz, o autor e o século sim', () => {
  // A regra, conferida na própria datacao.js.
  assert.equal(traduzirAutor('Ptolomeu', 'es'), 'Ptolomeo');
  assert.equal(traduzirAutor('Ptolomeu', 'en'), 'Ptolemy');
  assert.equal(traduzirAutor('Vétio Valente', 'en'), 'Vettius Valens');
  assert.equal(traduzirQuando('séc. II', 'es'), 'siglo II');
  assert.equal(traduzirQuando('séc. II', 'en'), '2nd c.');

  // E o que o motor devolve para a tela.
  const pt = T.datacaoDasFontes('pt');
  const es = T.datacaoDasFontes('es');
  const en = T.datacaoDasFontes('en');
  assert.equal(pt.length, 5);
  for (let i = 0; i < pt.length; i++) {
    assert.equal(es[i].obra, pt[i].obra, 'a OBRA nunca traduz');
    assert.equal(en[i].obra, pt[i].obra, 'a OBRA nunca traduz');
  }
  assert.equal(pt[0].autor, 'Ptolomeu');
  assert.equal(es[0].autor, 'Ptolomeo');
  assert.equal(en[0].autor, 'Ptolemy');
  assert.equal(pt[0].quando, 'séc. II');
  assert.equal(es[0].quando, 'siglo II');
  assert.equal(en[0].quando, '2nd c.');
  assert.equal(en[4].quando, '1647', 'ano solto não se traduz');
  assert.equal(en[4].obra, 'Christian Astrology I, p. 107');
});

test('NÃO COMPLETAR A LACUNA: nenhum texto diz que o aplicativo vale mais que o separativo', () => {
  const HIERARQUIA = {
    pt: [/mais forte que/i, /pesa mais que/i, /mais poderoso que/i, /mais important\w* que/i, /vale mais que/i],
    es: [/más fuerte que/i, /pesa más que/i, /más poderoso que/i, /más important\w* que/i, /val\w+ más que/i],
    en: [/stronger than/i, /outweighs?\b/i, /more powerful than/i, /more important than/i, /carries more weight/i],
  };
  for (const lang of IDIOMAS) {
    const pack = LANGS[lang];
    // A varredura pula notaLeituraDoApp de propósito: é lá que mora a NEGAÇÃO.
    const { notaLeituraDoApp, ...resto } = pack;
    varrerStrings(resto, lang, (caminho, s) => {
      for (const re of HIERARQUIA[lang]) {
        assert.ok(!re.test(s), `${caminho} afirmou hierarquia entre as fases: ${s.match(re)}`);
      }
    });
    for (const r of AMOSTRA[lang]) {
      const semNota = corpus({ ...r, notaLeituraDoApp: null });
      for (const re of HIERARQUIA[lang]) {
        assert.ok(!re.test(semNota), `${lang} afirmou hierarquia: ${semNota.match(re)}`);
      }
    }
  }
  // E a recusa está escrita, em cada idioma.
  assert.match(PT.notaLeituraDoApp, /o que o app NÃO diz/);
  assert.match(ES.notaLeituraDoApp, /lo que la app NO dice/);
  assert.match(EN.notaLeituraDoApp, /what the app does NOT say/);
  // A lacuna está declarada no motor, para quem for editar depois.
  const ids = T.NAO_ACHADO.map((x) => x.id);
  assert.ok(ids.includes('hierarquiaEntreOsDois'));
  assert.ok(ids.includes('orbeParaAplicacao'));
  assert.ok(ids.includes('retrogradoEmPtolomeu'));
  for (const item of T.NAO_ACHADO) assert.ok(item.texto.length > 120, item.id);
});

test('o orbe é declarado como convenção do app, com a fonte que mostra que não é antigo', () => {
  for (const lang of IDIOMAS) {
    const n = LANGS[lang].notaOrbe;
    assert.ok(n.length > 200, lang);
    assert.match(n, /Tetrabiblos I\.13/, lang);
    assert.match(n, /Lilly/, lang);
    assert.match(n, /1647/, lang);
    assert.match(n, /I\.24/, lang);
  }
});

test('a promessa de "trânsito exato = acontecimento no dia" é datada como invenção recente', () => {
  const SEC_XX = { pt: /séc\. XX/, es: /siglo XX/, en: /20th c\./ };
  for (const lang of IDIOMAS) {
    const n = LANGS[lang].notaDataDeEvento;
    assert.match(n, SEC_XX[lang], lang);
    assert.match(n, /Anthologiae IX\.3/, lang);
    // E ela aparece na leitura, não só num campo que a tela pode esquecer.
    for (const r of AMOSTRA[lang]) assert.match(r.leitura, SEC_XX[lang], lang);
  }
});

test('o registro de pesquisa guarda o que esta frente corrigiu na base', () => {
  const ids = T.REGISTRO_DE_PESQUISA.map((x) => x.id);
  assert.ok(ids.includes('ptolomeuI24Existe'), 'o doc 99 registra I.24 como buraco em aberto; ele foi achado');
  assert.ok(ids.includes('valenteRetrogradoEhIV14'));
  for (const item of T.REGISTRO_DE_PESQUISA) assert.ok(item.texto.length > 120, item.id);
  assert.equal(T.FONTES, PT.fontes);
});

// ===========================================================================
// 7. A INTEGRAÇÃO COM O CÉU DE HOJE
// ===========================================================================

test('fasesDoCeuPessoal devolve a MESMA lista, na MESMA ordem, para a tela casar um a um', () => {
  const lista = [CASOS.aplicativo, CASOS.separativo, CASOS.foraDoHorizonte];
  const fases = T.fasesDoCeuPessoal(lista, BIRTH, 'pt', { hoje: HOJE });
  assert.equal(fases.length, lista.length);
  for (let i = 0; i < lista.length; i++) {
    assert.equal(fases[i].transito, lista[i].transitPlanet);
    assert.equal(fases[i].natal, lista[i].natalPlanet);
    assert.equal(fases[i].aspecto, lista[i].aspectType);
    assert.deepEqual(fases[i], T.faseDoTransito(lista[i], BIRTH, 'pt', { hoje: HOJE }));
  }
  assert.equal(T.fasesDoCeuPessoal(null, BIRTH), null);
  assert.deepEqual(T.fasesDoCeuPessoal([], BIRTH, 'pt', { hoje: HOJE }), []);
});

test('a lista inteira do Céu de Hoje deste nascimento recebe fase, e as duas aparecem', () => {
  // Reproduz a tabela de lib/personalSky.js para achar os aspectos reais do dia
  // — se este teste quebrar porque a tabela de lá mudou, é sinal para conferir.
  const TABELA = [
    ['Conjunção', 0, 6], ['Sextil', 60, 4], ['Quadratura', 90, 6], ['Trígono', 120, 6], ['Oposição', 180, 6],
  ];
  const FATOR = { Lua: 1, Sol: 0.8, 'Mercúrio': 0.8, 'Vênus': 0.8, Marte: 0.8, 'Júpiter': 0.5, Saturno: 0.5, Urano: 0.25, Netuno: 0.25, 'Plutão': 0.25 };
  const separacao = (a, b) => (Math.abs(a - b) > 180 ? 360 - Math.abs(a - b) : Math.abs(a - b));

  const natal = planetPositions(BIRTH.date, BIRTH.time, BIRTH.city);
  const hoje = planetPositions(HOJE);
  const aspectos = [];
  for (const t of hoje) {
    for (const n of natal) {
      for (const [type, angle, orb] of TABELA) {
        if (Math.abs(separacao(t.longitude, n.longitude) - angle) <= orb * FATOR[t.planet]) {
          aspectos.push({ transitPlanet: t.planet, natalPlanet: n.planet, aspectType: type });
          break;
        }
      }
    }
  }
  assert.ok(aspectos.length >= 10, `esperava vários aspectos, achei ${aspectos.length}`);

  const fases = T.fasesDoCeuPessoal(aspectos, BIRTH, 'pt', { hoje: HOJE });
  const vistas = new Set();
  for (let i = 0; i < aspectos.length; i++) {
    const f = fases[i];
    assert.equal(f.disponivel, true, `${aspectos[i].transitPlanet} × ${aspectos[i].natalPlanet}`);
    vistas.add(f.fase);
    // O orbe que este módulo mede é o mesmo que personalSky mostra.
    assert.ok(f.residuoGraus <= 6.001, `${f.transito}: resíduo ${f.residuoGraus} fora de qualquer orbe da tela`);
  }
  assert.ok(vistas.has('aplicativo'), 'nenhum aspecto aplicativo no dia — improvável, confira a conta');
  assert.ok(vistas.has('separativo'), 'nenhum aspecto separativo no dia — improvável, confira a conta');
});

test('o mesmo aspecto lido em dias seguidos atravessa o exato e troca de verbo', () => {
  // A prova de que a distinção é temporal e não um rótulo fixo: a Lua fecha o
  // sextil com Netuno natal em poucas horas, então amanhã ele já se desfez.
  const antes = ler(CASOS.exatoHoje, 'pt', HOJE);
  const depois = ler(CASOS.exatoHoje, 'pt', '2026-08-02');
  assert.equal(antes.fase, 'aplicativo');
  assert.equal(depois.fase, 'separativo');
  assert.notEqual(antes.linhaCurta, depois.linhaCurta);
  assert.match(antes.linhaCurta, /formando/);
  assert.match(depois.linhaCurta, /desfazendo/);
});
