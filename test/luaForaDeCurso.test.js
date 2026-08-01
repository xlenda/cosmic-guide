// test/luaForaDeCurso.test.js
// A LUA FORA DE CURSO — o que este arquivo segura.
//
// A feature é sobre uma DIVERGÊNCIA entre duas definições de séculos diferentes,
// e o valor dela depende de a conta estar certa nas duas. Por isso o teste não
// se contenta em conferir formato: ele REIMPLEMENTA a definição, na força bruta,
// e compara.
//
//   1. O CÉU É MEDIDO, NÃO INVENTADO. Varredura independente de 2 em 2 minutos
//      sobre datas reais acha os ângulos exatos por conta própria; o motor tem
//      que dar os mesmos, e o estado fora-de-curso tem que bater instante a
//      instante, NAS DUAS definições. Nada aqui usa a lógica de
//      lib/luaForaDeCurso.js para se validar — seria conferir a prova com o
//      gabarito do próprio aluno.
//   2. AS DUAS DEFINIÇÕES, E A RELAÇÃO ENTRE ELAS. Porfírio implica fronteira de
//      signo, nunca o contrário (é aritmética: o arco que falta até a troca de
//      signo nunca passa de 30°). E as duas TÊM que divergir em datas reais —
//      se um dia pararem de divergir, ou a conta quebrou ou a feature perdeu o
//      motivo de existir.
//   3. OS NÚMEROS QUE O TEXTO PUBLICA SÃO REFEITOS AQUI. O pack afirma 159
//      janelas em 2026 pela régua moderna e 5 pela de Porfírio. O teste
//      recalcula. Texto que afirma número medido e não é refeito por teste vira
//      folclore na terceira refatoração.
//   4. NUNCA FABRICAR. Data inválida e falta de convergência declaram
//      indisponível, com motivo — jamais um horário estimado.
//   5. O PT É OURO, byte a byte, em três instantes fixos.
//   6. PARIDADE dos três packs: mesma forma, nada vazio, nada de placeholder
//      vazado, nada de português dentro do es/en.
//   7. A LINHA VERMELHA nos três idiomas: nenhuma palavra de saúde, e — o mais
//      importante nesta feature — NENHUMA ORDEM na voz do app. A varredura de
//      imperativo roda sobre o texto COM AS CITAÇÕES REMOVIDAS: o app pode
//      (e deve) citar o «não assine nada agora» que circula por aí, desde que
//      seja citação de terceiro entre aspas e não conselho dele.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const L = require('../lib/luaForaDeCurso.js');
const PT = require('../lib/traducoes/luaForaDeCurso.pt.js').PACK;
const ES = require('../lib/traducoes/luaForaDeCurso.es.js').PACK;
const EN = require('../lib/traducoes/luaForaDeCurso.en.js').PACK;
const { moonSign } = require('../lib/signs.js');
const { nextExactMoonPhase } = require('../lib/lunarCalendar.js');
const A = require('astronomy-engine');

const LANGS = { pt: PT, es: ES, en: EN };
const MS_DIA = 86400000;

// ===========================================================================
// A REIMPLEMENTAÇÃO INDEPENDENTE — força bruta, sem olhar para o motor
// ===========================================================================
const CORPOS_AE = { 'Sol': 'Sun', 'Mercúrio': 'Mercury', 'Vênus': 'Venus', 'Marte': 'Mars', 'Júpiter': 'Jupiter', 'Saturno': 'Saturn' };
const ALVOS = [0, 60, 90, 120, 180, 240, 270, 300];
const n360 = (x) => ((x % 360) + 360) % 360;

function lonLua(ms) {
  return n360(A.EclipticGeoMoon(new Date(ms)).lon);
}

function lonCorpo(id, ms) {
  const d = new Date(ms);
  if (id === 'Sol') return n360(A.SunPosition(d).elon);
  return n360(A.Ecliptic(A.GeoVector(A.Body[CORPOS_AE[id]], d, true)).elon);
}

function elong(id, ms) {
  return n360(lonLua(ms) - lonCorpo(id, ms));
}

// Varre de PASSO em PASSO e devolve todo ângulo exato do intervalo, com a
// resolução do passo. Burro de propósito: é o contraponto ao Newton do motor.
const PASSO = 2 * 60000;
function aspectosBrutos(de, ate) {
  const achados = [];
  const ant = {};
  for (const id of Object.keys(CORPOS_AE)) ant[id] = elong(id, de);
  for (let ms = de + PASSO; ms <= ate; ms += PASSO) {
    for (const id of Object.keys(CORPOS_AE)) {
      const e = elong(id, ms);
      for (const alvo of ALVOS) {
        const antes = n360(alvo - ant[id]);
        const depois = n360(alvo - e);
        if (antes > 0 && antes < 5 && (depois === 0 || depois > 355)) {
          achados.push({ corpoId: id, alvo, ms: ms - PASSO / 2 });
        }
      }
      ant[id] = e;
    }
  }
  return achados.sort((x, y) => x.ms - y.ms);
}

// Instante da próxima troca de signo, por bisseção sobre a longitude da Lua —
// outra implementação, não a do motor.
function ingressoBruto(ms) {
  const alvo = n360((Math.floor(lonLua(ms) / 30) + 1) * 30);
  let lo = ms;
  let hi = ms + 3 * MS_DIA;
  const falta = (t) => n360(alvo - lonLua(t));
  for (let i = 0; i < 60; i++) {
    const meio = (lo + hi) / 2;
    if (falta(meio) > 180) hi = meio;
    else lo = meio;
  }
  return hi;
}

function foraDeCursoBruto(ms, defId, aspectos) {
  const proximo = aspectos.find((a) => a.ms > ms);
  if (!proximo) return null;
  if (defId === 'porfirio') return n360(lonLua(proximo.ms) - lonLua(ms)) > 30;
  return ingressoBruto(ms) < proximo.ms;
}

// Janela de 10 dias reais, varrida UMA vez e reaproveitada por todos os testes.
const JANELA_DE = Date.UTC(2026, 6, 25);
const JANELA_ATE = Date.UTC(2026, 7, 4);
const ASPECTOS_BRUTOS = aspectosBrutos(JANELA_DE, JANELA_ATE + 3 * MS_DIA);

// ===========================================================================
// 1. O CÉU É MEDIDO — o motor contra a varredura burra
// ===========================================================================

test('a varredura independente acha ângulos exatos suficientes para valer como controle', () => {
  const dentro = ASPECTOS_BRUTOS.filter((a) => a.ms <= JANELA_ATE);
  assert.ok(dentro.length >= 12, `só ${dentro.length} ângulos exatos em 10 dias — controle fraco demais`);
});

test('o motor reproduz TODOS os ângulos exatos da varredura, dentro da resolução dela', () => {
  for (const bruto of ASPECTOS_BRUTOS.filter((a) => a.ms <= JANELA_ATE)) {
    const r = L.luaForaDeCurso(new Date(bruto.ms - 3 * 60000));
    assert.equal(r.disponivel, true);
    const erroMin = Math.abs(r.proximoAspecto.quando.getTime() - bruto.ms) / 60000;
    assert.ok(
      erroMin <= 1.5,
      `${new Date(bruto.ms).toISOString()} ${bruto.corpoId}/${bruto.alvo}: motor deu ${r.proximoAspecto.planetaId} em ${r.proximoAspecto.quando.toISOString()} (${erroMin.toFixed(2)} min de diferença)`
    );
  }
});

test('no instante que o motor chama de exato, o ângulo É exato — nas duas pontas', () => {
  for (let ms = JANELA_DE; ms < JANELA_ATE; ms += 17 * 3600000) {
    const r = L.luaForaDeCurso(new Date(ms));
    for (const enc of [r.proximoAspecto, r.aspectoAnterior]) {
      const sep = Math.abs(n360(elong(enc.planetaId, enc.quando.getTime())));
      const desvio = Math.min(Math.abs(sep - enc.angulo), Math.abs(360 - sep - enc.angulo));
      assert.ok(desvio < 1e-4, `${enc.planetaId} ${enc.aspectoId}: desvio de ${desvio}°`);
    }
  }
});

test('o fim da janela moderna é a troca de signo de verdade — longitude múltipla de 30°', () => {
  const janelas = L.janelasForaDeCurso(new Date(JANELA_DE), new Date(JANELA_ATE), 'moderna');
  assert.ok(janelas && janelas.length >= 3, 'poucas janelas para conferir');
  for (const j of janelas) {
    const lon = lonLua(j.ate.getTime());
    const resto = Math.min(lon % 30, 30 - (lon % 30));
    assert.ok(resto < 1e-4, `fim da janela em ${j.ate.toISOString()} tem a Lua a ${lon}°, que não é fronteira`);
  }
});

test('o fim da janela de Porfírio é exatamente 30° de caminho antes do encontro seguinte', () => {
  const janelas = L.janelasForaDeCurso(new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 0, 25)), 'porfirio');
  assert.ok(janelas && janelas.length >= 2, 'esperava pelo menos duas janelas de Porfírio em janeiro/2026');
  for (const j of janelas) {
    const viagem = n360(lonLua(j.proximoAspecto.quando.getTime()) - lonLua(j.ate.getTime()));
    assert.ok(Math.abs(viagem - 30) < 1e-3, `janela terminou a ${viagem}° do encontro, não a 30°`);
  }
});

test('o signo da Lua é o mesmo que lib/signs.js calcula — o app não pode ter dois céus', () => {
  for (let ms = JANELA_DE; ms < JANELA_ATE; ms += 19 * 3600000) {
    const d = new Date(ms);
    const r = L.luaForaDeCurso(d);
    const iso = d.toISOString();
    const pelaSigns = moonSign(iso.slice(0, 10), iso.slice(11, 16));
    assert.equal(r.lua.signoId, pelaSigns.name, iso);
  }
});

test('Lua Nova é a conjunção Sol–Lua e Lua Cheia é a oposição: bate com SearchMoonPhase', () => {
  // A diferença NÃO é zero e o motivo está medido no cabeçalho de
  // lib/luaForaDeCurso.js: SearchMoonPhase usa PairLongitude, que chama
  // GeoVector com aberração DESLIGADA; este arquivo usa SunPosition, com
  // aberração, que é o Sol do resto do app. A aberração do Sol vale 21,2" e,
  // a 12,2°/dia de movimento relativo, dá ~41 s. Tolerância de 2 min.
  for (const [alvoFase, aspectoId] of [[0, 'conjuncao'], [180, 'oposicao']]) {
    for (const inicio of ['2026-01-03', '2026-05-10', '2026-11-24']) {
      const exato = nextExactMoonPhase(alvoFase, new Date(`${inicio}T00:00:00Z`));
      assert.ok(exato instanceof Date, 'lunarCalendar não devolveu instante');
      const r = L.luaForaDeCurso(new Date(exato.getTime() - 5 * 60000));
      assert.equal(r.proximoAspecto.planetaId, 'Sol', `${inicio}/${alvoFase}`);
      assert.equal(r.proximoAspecto.aspectoId, aspectoId, `${inicio}/${alvoFase}`);
      const seg = Math.abs(r.proximoAspecto.quando.getTime() - exato.getTime()) / 1000;
      assert.ok(seg < 120, `${inicio}/${alvoFase}: ${seg.toFixed(1)} s de diferença`);
    }
  }
});

// ===========================================================================
// 2. AS DUAS DEFINIÇÕES
// ===========================================================================

test('o estado fora-de-curso bate com a força bruta, instante a instante, nas duas definições', () => {
  let n = 0;
  for (let ms = JANELA_DE + 3600000; ms < JANELA_ATE; ms += 151 * 60000) {
    for (const def of ['moderna', 'porfirio']) {
      const r = L.luaForaDeCurso(new Date(ms), def);
      const bruto = foraDeCursoBruto(ms, def, ASPECTOS_BRUTOS);
      assert.notEqual(bruto, null, 'a varredura ficou sem próximo aspecto — aumente a margem');
      assert.equal(r.foraDeCurso, bruto, `${def} em ${new Date(ms).toISOString()}`);
      n++;
    }
  }
  assert.ok(n >= 100, `só ${n} conferências`);
});

test('Porfírio implica fronteira de signo, e nunca o contrário', () => {
  // Aritmética: o arco que falta até a troca de signo nunca passa de 30°, então
  // "nada nos próximos 30°" já garante "nada até trocar de signo". Se este teste
  // cair, uma das duas contas está errada.
  let vazioPorfirio = 0;
  for (let ms = JANELA_DE; ms < JANELA_ATE; ms += 157 * 60000) {
    const m = L.luaForaDeCurso(new Date(ms), 'moderna');
    const p = L.luaForaDeCurso(new Date(ms), 'porfirio');
    assert.ok(!(p.foraDeCurso && !m.foraDeCurso), `Porfírio sem moderna em ${new Date(ms).toISOString()}`);
    if (p.foraDeCurso) vazioPorfirio++;
    // e o campo `ambas` diz a mesma coisa que as duas chamadas separadas
    assert.equal(m.ambas.porfirio.foraDeCurso, p.foraDeCurso);
    assert.equal(p.ambas.moderna.foraDeCurso, m.foraDeCurso);
    assert.equal(m.divergem, m.foraDeCurso !== p.foraDeCurso);
  }
  assert.equal(vazioPorfirio, 0, 'em 25/07–04/08/2026 a régua de Porfírio não vê vazio nenhum — se viu, a conta mudou');
});

test('as duas réguas DIVERGEM em datas reais — é este o motivo da feature existir', () => {
  let divergentes = 0;
  let total = 0;
  for (let ms = JANELA_DE; ms < JANELA_ATE; ms += 89 * 60000) {
    total++;
    if (L.luaForaDeCurso(new Date(ms)).divergem) divergentes++;
  }
  assert.ok(divergentes > 0, 'nenhuma divergência em 10 dias: ou a conta quebrou ou as duas definições viraram uma');
  assert.ok(divergentes / total > 0.1, `divergência de só ${((100 * divergentes) / total).toFixed(1)}%`);
});

test('📐 os números que o pack PUBLICA sobre 2026 são refeitos aqui', () => {
  // O texto `oQuantoIssoMuda` afirma: 159 janelas e 23,6% do ano pela régua
  // moderna, 5 janelas e 0,65% por Porfírio. Número publicado sem teste que o
  // refaça vira folclore.
  const de = Date.UTC(2026, 0, 1);
  const ate = Date.UTC(2027, 0, 1);
  const medido = {};
  for (const def of ['moderna', 'porfirio']) {
    const janelas = L.janelasForaDeCurso(new Date(de), new Date(ate), def);
    assert.ok(Array.isArray(janelas), `${def}: varredura do ano devolveu null`);
    let soma = 0;
    for (const j of janelas) {
      soma += Math.min(j.ate.getTime(), ate) - Math.max(j.desde.getTime(), de);
    }
    medido[def] = { janelas: janelas.length, pct: (100 * soma) / (ate - de) };
  }
  assert.equal(medido.moderna.janelas, 159, 'o número de janelas mudou — atualize o texto dos TRÊS packs');
  assert.equal(medido.porfirio.janelas, 5, 'o número de janelas mudou — atualize o texto dos TRÊS packs');
  assert.equal(medido.moderna.pct.toFixed(1), '23.6', 'a fração do ano mudou — atualize o texto dos TRÊS packs');
  assert.equal(medido.porfirio.pct.toFixed(2), '0.65', 'a fração do ano mudou — atualize o texto dos TRÊS packs');
  for (const pack of Object.values(LANGS)) {
    assert.ok(pack.oQuantoIssoMuda.includes('159'), `${pack.lang} não cita as 159 janelas`);
    assert.ok(/\b5\b/.test(pack.oQuantoIssoMuda), `${pack.lang} não cita as 5 janelas`);
  }
});

test('as janelas e o instante contam a MESMA história', () => {
  for (const def of ['moderna', 'porfirio']) {
    const janelas = L.janelasForaDeCurso(new Date(JANELA_DE), new Date(JANELA_ATE), def);
    assert.ok(Array.isArray(janelas));
    for (let ms = JANELA_DE; ms < JANELA_ATE; ms += 167 * 60000) {
      const dentroDaLista = janelas.some((j) => ms >= j.desde.getTime() && ms < j.ate.getTime());
      const r = L.luaForaDeCurso(new Date(ms), def);
      assert.equal(r.foraDeCurso, dentroDaLista, `${def} em ${new Date(ms).toISOString()}`);
      if (r.foraDeCurso) {
        const j = janelas.find((x) => ms >= x.desde.getTime() && ms < x.ate.getTime());
        // Tolerância de 100 ms: as duas chamadas partem de chutes iniciais
        // diferentes e o Newton fecha em 1e-7° (~0,6 ms), então a última casa
        // pode discordar. Qualquer coisa maior que isso é bug de verdade.
        assert.ok(Math.abs(r.desde.getTime() - j.desde.getTime()) < 100, `${def}: início divergente`);
        assert.ok(Math.abs(r.ate.getTime() - j.ate.getTime()) < 100, `${def}: fim divergente`);
      }
    }
  }
});

test('as janelas não se sobrepõem, têm duração positiva e vêm em ordem', () => {
  for (const def of ['moderna', 'porfirio']) {
    const janelas = L.janelasForaDeCurso(new Date(Date.UTC(2026, 0, 1)), new Date(Date.UTC(2026, 1, 1)), def);
    let anterior = null;
    for (const j of janelas) {
      assert.ok(j.ate > j.desde, `${def}: janela de duração não positiva`);
      assert.ok(
        Math.abs(j.duracaoHoras - (j.ate - j.desde) / 3600000) < 1e-9,
        `${def}: duracaoHoras não confere com as duas Datas`
      );
      if (anterior) assert.ok(j.desde >= anterior.ate, `${def}: janelas sobrepostas`);
      anterior = j;
    }
  }
});

test('a definição usada é declarada, com autor, século e locus — e a outra vem junto', () => {
  for (const def of L.DEFINICOES) {
    const r = L.luaForaDeCurso(new Date('2026-03-15T09:00:00Z'), def);
    assert.equal(r.definicaoUsada.id, def);
    for (const campo of ['nome', 'criterio', 'autor', 'seculo', 'locus', 'quemUsa', 'porQueEssa']) {
      assert.ok(r.definicaoUsada[campo] && r.definicaoUsada[campo].length > 3, `${def}.${campo}`);
    }
    assert.match(r.definicaoUsada.locus, /16\d\d|s[ée]c|century|siglo/i, `${def} sem datação no locus`);
    assert.deepEqual(Object.keys(r.ambas).sort(), ['moderna', 'porfirio']);
    assert.ok(r.fonte.length >= 6, 'bibliografia magra');
  }
  // Lilly na moderna, Porfírio e Antíoco na antiga: a atribuição não se inverte.
  assert.match(L.luaForaDeCurso(new Date(), 'moderna').definicaoUsada.locus, /Lilly.*1647.*112/);
  assert.match(L.luaForaDeCurso(new Date(), 'porfirio').definicaoUsada.locus, /Porf[íi]rio|Porphyry/);
  assert.match(L.luaForaDeCurso(new Date(), 'porfirio').definicaoUsada.locus, /Ant[íi]oco|Antiochus/);
});

test('só os SETE entram na conta — Urano, Netuno e Plutão ficam de fora, e isso está dito', () => {
  assert.deepEqual(L.CLASSICOS, ['Sol', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno']);
  for (let ms = JANELA_DE; ms < JANELA_ATE; ms += 13 * 3600000) {
    const r = L.luaForaDeCurso(new Date(ms));
    assert.ok(L.CLASSICOS.includes(r.proximoAspecto.planetaId));
    assert.ok(L.CLASSICOS.includes(r.aspectoAnterior.planetaId));
  }
  for (const pack of Object.values(LANGS)) {
    assert.deepEqual(Object.keys(pack.planetas).sort(), [...L.CLASSICOS].sort(), `${pack.lang}`);
    assert.match(pack.osSeteEOsTres, /1781/, `${pack.lang} não data a descoberta de Urano`);
  }
});

test('os cinco ângulos maiores, e a ressalva de que Ptolomeu enumera quatro', () => {
  assert.deepEqual(L.ASPECTOS_MAIORES.map((a) => a.id), ['conjuncao', 'sextil', 'quadratura', 'trigono', 'oposicao']);
  assert.deepEqual(L.ASPECTOS_MAIORES.map((a) => a.angulo), [0, 60, 90, 120, 180]);
  for (const pack of Object.values(LANGS)) {
    assert.match(pack.notaConjuncao, /Ptolom|Ptolemy/, `${pack.lang}`);
    assert.deepEqual(Object.keys(pack.aspectos).sort(), L.ASPECTOS_MAIORES.map((a) => a.id).sort());
  }
});

// ===========================================================================
// 3. NUNCA FABRICAR
// ===========================================================================

test('data inválida declara indisponível, com motivo e texto — e nada de horário', () => {
  // `undefined` fica FORA da lista de propósito: é o valor que dispara o
  // default do parâmetro, e o default é "agora" — comportamento legítimo,
  // conferido no teste seguinte.
  for (const entrada of ['não é data', new Date('x'), NaN, null, {}, [], true]) {
    const r = L.luaForaDeCurso(entrada);
    assert.equal(r.disponivel, false, String(entrada));
    assert.equal(r.motivo, 'dataInvalida');
    assert.equal(r.foraDeCurso, null);
    assert.equal(r.desde, null);
    assert.equal(r.ate, null);
    assert.equal(r.proximoAspecto, null);
    assert.ok(r.textos.indisponivel.length > 40);
    assert.ok(r.fonte.length >= 6, 'a bibliografia continua disponível mesmo sem céu');
    assert.ok(r.definicaoUsada.locus.length > 10);
  }
});

test('sem argumento nenhum, a leitura é a de AGORA — e sai inteira', () => {
  for (const chamada of [L.luaForaDeCurso(), L.luaForaDeCurso(undefined)]) {
    assert.equal(chamada.disponivel, true);
    assert.equal(typeof chamada.foraDeCurso, 'boolean');
    assert.ok(Math.abs(chamada.instante.getTime() - Date.now()) < 60000);
    assert.equal(chamada.definicaoUsada.id, 'moderna');
    assert.equal(chamada.textos.abertura, L.luaForaDeCurso(chamada.instante).textos.abertura);
  }
});

test('intervalo inválido em janelasForaDeCurso devolve null, nunca lista inventada', () => {
  assert.equal(L.janelasForaDeCurso('banana', new Date()), null);
  assert.equal(L.janelasForaDeCurso(new Date('2026-01-02'), new Date('2026-01-01')), null);
});

test('definição desconhecida cai na moderna; idioma desconhecido cai no PT', () => {
  const d = new Date('2026-07-28T12:00:00Z');
  assert.equal(L.luaForaDeCurso(d, 'inventada').definicaoUsada.id, 'moderna');
  assert.equal(L.luaForaDeCurso(d, undefined).definicaoUsada.id, 'moderna');
  const pt = L.luaForaDeCurso(d);
  for (const lang of ['fr', undefined, null, 'PT']) {
    assert.deepEqual(L.luaForaDeCurso(d, 'moderna', lang).textos, pt.textos, `lang=${lang}`);
  }
});

test('a feature não pede hora nem cidade, e diz isso', () => {
  const r = L.luaForaDeCurso(new Date('2026-07-28T12:00:00Z'));
  assert.equal(r.precisaDeDadoPessoal, false);
  for (const pack of Object.values(LANGS)) {
    assert.ok(pack.semDadoPessoal.length > 80, `${pack.lang}`);
  }
});

test('o módulo não fala com AsyncStorage — nem direto, nem por baixo do pano', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'luaForaDeCurso.js'), 'utf8');
  assert.ok(!/AsyncStorage/.test(src));
  assert.ok(!/async-storage/.test(src));
});

test('o motor não devolve um horário quando a busca não converge', () => {
  // Datas absurdas (fora do alcance útil da efeméride) não podem virar leitura.
  const r = L.luaForaDeCurso(new Date('1500-01-01T00:00:00Z'));
  if (!r.disponivel) {
    assert.ok(['semEfemeride', 'buscaNaoConvergiu', 'dataInvalida'].includes(r.motivo));
    assert.equal(r.desde, null);
  } else {
    // Se convergiu, então tem que estar CERTO: o ângulo é exato de verdade.
    const enc = r.proximoAspecto;
    const sep = n360(elong(enc.planetaId, enc.quando.getTime()));
    const desvio = Math.min(Math.abs(sep - enc.angulo), Math.abs(360 - sep - enc.angulo));
    assert.ok(desvio < 1e-4, `ângulo de 1500 com desvio de ${desvio}°`);
  }
});

// ===========================================================================
// 4. O PT É OURO — byte a byte, em instantes fixos
// ===========================================================================

const GOLDEN = {
  vaziaDivergente: {
    quando: '2026-07-28T12:00:00Z',
    definicao: 'moderna',
    foraDeCurso: true,
    divergem: true,
    desde: '2026-07-28T06:10:56Z',
    ate: '2026-07-29T01:46:02Z',
    signo: 'Capricórnio',
    proximo: 'Júpiter/oposicao',
    anterior: 'Vênus/trigono',
    textos: {
      abertura:
        'Sabe aquele print que aparece toda semana — «não assine nada agora, a Lua está fora de curso»? Ele nasce desta conta. Neste momento a Lua atravessa o resto de Capricórnio sem fechar mais nenhum ângulo exato com nenhum dos outros seis corpos que a astrologia antiga acompanhava: um trecho de caminho sem encontro marcado. Os gregos chamavam isso de kenodromia — correr no vazio.',
      estado:
        'Leitura do app, pela régua da fronteira de signo: a Lua está fora de curso. O trecho começou 5h49 atrás, quando ela fechou um trígono exato com Vênus, e segue até ela entrar em Aquário — mais 13h46.',
      janela:
        'A janela inteira dura 19h35: vai do encontro com Vênus até a entrada em Aquário. Assim que ela troca de signo, a conta recomeça do zero.',
      proximoEncontro:
        'O próximo ângulo exato é uma oposição (180°, um bem em frente ao outro) com Júpiter: daqui a 26h27, depois de mais 13,4° de caminho da Lua. Ele só se fecha depois que ela entra em Aquário. E é justamente esse detalhe que faz as duas réguas discordarem agora.',
      divergencia:
        'Neste instante as duas réguas discordam: a régua da fronteira de signo diz que a Lua está fora de curso, e a régua dos 30° seguintes diz que não. Não é erro de conta — são dois critérios com uns 1.400 anos entre um e outro, recortando o mesmo dia de jeitos diferentes. A relação entre elas é fixa e dá pra conferir: tudo que a régua dos 30° chama de vazio, a de fronteira de signo também chama — nunca o contrário, porque o pedaço que falta até a troca de signo nunca passa de 30°. É por isso que a mesma noite aparece como «dia livre» num app e como noite comum em outro.',
    },
  },
  vaziaPorfirio: {
    quando: '2026-01-04T18:00:00Z',
    definicao: 'porfirio',
    foraDeCurso: true,
    divergem: false,
    desde: '2026-01-04T07:44:10Z',
    ate: '2026-01-05T03:46:44Z',
    signo: 'Leão',
    proximo: 'Mercúrio/trigono',
    anterior: 'Saturno/trigono',
    textos: {
      abertura:
        'Sabe aquele print que aparece toda semana — «não assine nada agora, a Lua está fora de curso»? Ele nasce desta conta. Neste momento a Lua tem 30° inteiros de caminho pela frente, de Leão em diante, sem fechar mais nenhum ângulo exato com nenhum dos outros seis corpos que a astrologia antiga acompanhava: um trecho de caminho sem encontro marcado. Os gregos chamavam isso de kenodromia — correr no vazio.',
      estado:
        'Leitura do app, pela régua dos 30° seguintes: a Lua está fora de curso. O trecho começou 10h16 atrás, quando ela fechou um trígono exato com Saturno, e segue até faltarem 30° de caminho para o próximo encontro — mais 9h47.',
      janela:
        'A janela inteira dura 20h03: vai do encontro com Saturno até o ponto em que faltam 30° de caminho para o próximo. Onde a Lua troca de signo no meio disso não importa aqui — Porfírio não fala de signo nenhum.',
      proximoEncontro:
        'O próximo ângulo exato é um trígono (120° entre os dois) com Mercúrio: daqui a 62h02, depois de mais 35,9° de caminho da Lua. Ele só se fecha depois que ela entra em Virgem.',
      divergencia:
        'Neste instante as duas réguas dizem a mesma coisa: as duas veem a Lua correndo no vazio. A relação entre elas é fixa e dá pra conferir: tudo que a régua dos 30° chama de vazio, a de fronteira de signo também chama — nunca o contrário, porque o pedaço que falta até a troca de signo nunca passa de 30°.',
    },
  },
  cheiaDeEncontros: {
    quando: '2026-07-31T15:00:00Z',
    definicao: 'moderna',
    foraDeCurso: false,
    divergem: false,
    desde: null,
    ate: null,
    signo: 'Peixes',
    proximo: 'Mercúrio/trigono',
    anterior: 'Marte/trigono',
    textos: {
      abertura:
        'Sabe aquele print que aparece toda semana — «não assine nada agora, a Lua está fora de curso»? Ele nasce desta conta, e neste momento ela dá o contrário: a Lua tem encontro marcado. Daqui a 35h58 ela fecha um trígono exato com Mercúrio, antes de trocar de signo. Enquanto há encontro à frente, ela não está correndo no vazio — que é o que os gregos chamavam de kenodromia.',
      estado:
        'Leitura do app, pela régua da fronteira de signo: a Lua não está fora de curso agora. O último encontro dela foi um trígono exato com Marte, 17h33 atrás, e o próximo chega antes de ela trocar de signo.',
      janela: 'Agora não há janela aberta. A próxima começa daqui a 45h33 e dura 8h04.',
      proximoEncontro:
        'O próximo ângulo exato é um trígono (120° entre os dois) com Mercúrio: daqui a 35h58, depois de mais 19,0° de caminho da Lua. Ele se fecha ainda em Peixes.',
      divergencia:
        'Neste instante as duas réguas dizem a mesma coisa: nenhuma das duas vê vazio agora. A relação entre elas é fixa e dá pra conferir: tudo que a régua dos 30° chama de vazio, a de fronteira de signo também chama — nunca o contrário, porque o pedaço que falta até a troca de signo nunca passa de 30°.',
    },
  },
};

// Os instantes são conferidos ao SEGUNDO, não ao milissegundo: Math.sin e
// Math.cos não são bit-a-bit iguais entre plataformas, e um golden preso na
// última casa quebraria em outra máquina sem que nada de verdade tivesse
// mudado. Ao segundo já é uma trava fortíssima — a Lua anda 0,00015° por
// segundo.
const aoSegundo = (d) => (d ? d.toISOString().slice(0, 19) + 'Z' : null);

test('GOLDEN: o PT sai byte a byte como está escrito no pack, nos três instantes fixos', () => {
  for (const [nome, g] of Object.entries(GOLDEN)) {
    const r = L.luaForaDeCurso(new Date(g.quando), g.definicao);
    assert.equal(r.foraDeCurso, g.foraDeCurso, nome);
    assert.equal(r.divergem, g.divergem, nome);
    assert.equal(aoSegundo(r.desde), g.desde, nome);
    assert.equal(aoSegundo(r.ate), g.ate, nome);
    assert.equal(r.lua.signoId, g.signo, nome);
    assert.equal(`${r.proximoAspecto.planetaId}/${r.proximoAspecto.aspectoId}`, g.proximo, nome);
    assert.equal(`${r.aspectoAnterior.planetaId}/${r.aspectoAnterior.aspectoId}`, g.anterior, nome);
    for (const [chave, esperado] of Object.entries(g.textos)) {
      assert.equal(r.textos[chave], esperado, `${nome}.${chave} mudou de byte`);
    }
  }
});

test('GOLDEN: o resumo da janela do dia 28/07/2026 é o mesmo de sempre', () => {
  const janelas = L.janelasForaDeCurso(new Date('2026-07-28T00:00:00Z'), new Date('2026-07-29T00:00:00Z'));
  assert.equal(janelas.length, 1);
  assert.equal(janelas[0].resumo, 'Fora de curso por 19h35, de trígono com Vênus até a entrada em Aquário.');
  assert.equal(aoSegundo(janelas[0].desde), '2026-07-28T06:10:56Z');
  assert.equal(aoSegundo(janelas[0].ate), '2026-07-29T01:46:02Z');
});

// ===========================================================================
// 5. PARIDADE DOS PACKS
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
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) varrerStrings(v[k], `${caminho}.${k}`, cb);
  }
}

// Um punhado de instantes que exercita os dois estados, as duas definições e os
// três idiomas: é o corpus de todos os testes de texto daqui pra baixo.
const INSTANTES = [
  '2026-07-28T12:00:00Z', '2026-07-31T15:00:00Z', '2026-01-04T18:00:00Z',
  '2026-01-13T17:40:00Z', '2026-08-13T14:00:00Z', '2026-03-15T09:00:00Z',
  '2026-11-02T23:30:00Z', '2026-05-20T06:00:00Z',
];

const LEITURAS = [];
for (const lang of ['pt', 'es', 'en']) {
  for (const def of ['moderna', 'porfirio']) {
    for (const iso of INSTANTES) {
      LEITURAS.push({ lang, def, iso, r: L.luaForaDeCurso(new Date(iso), def, lang) });
    }
  }
}

function corpus(r) {
  return [
    ...Object.values(r.textos),
    r.definicaoUsada.nome, r.definicaoUsada.criterio, r.definicaoUsada.quemUsa, r.definicaoUsada.porQueEssa,
    ...r.verbatins.map((v) => v.parafrase),
    ...r.verbatins.map((v) => v.texto),
    ...r.fonte,
  ].join(' \n ');
}

test('es e en têm EXATAMENTE a mesma forma do pt', () => {
  const formaPt = forma(PT);
  assert.deepEqual(forma(ES), formaPt, 'o pack es divergiu da forma do pt');
  assert.deepEqual(forma(EN), formaPt, 'o pack en divergiu da forma do pt');
});

test('nenhum valor de nenhum pack é vazio', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    varrerStrings(pack, lang, (caminho, s) => {
      assert.ok(s.trim().length > 0, `${caminho} está vazio`);
    });
  }
});

test('as leituras saem inteiras nos três idiomas, sem placeholder nem undefined vazado', () => {
  for (const { lang, def, iso, r } of LEITURAS) {
    const onde = `${lang}/${def}/${iso}`;
    assert.equal(r.disponivel, true, onde);
    for (const chave of ['abertura', 'estado', 'janela', 'proximoEncontro', 'divergencia', 'recibo', 'aOutraRegua',
      'oQuantoIssoMuda', 'comoOMercadoUsa', 'oQueNaoSeAchou', 'osSeteEOsTres', 'notaConjuncao', 'comoFoiCalculado',
      'leituraDoApp', 'semDadoPessoal', 'glosa']) {
      const t = r.textos[chave];
      assert.ok(typeof t === 'string' && t.trim().length >= 40, `${onde}: texto ${chave} curto ou ausente`);
    }
    const c = corpus(r);
    assert.ok(!c.includes('undefined'), `${onde} vazou "undefined"`);
    assert.ok(!c.includes('null'), `${onde} vazou "null"`);
    assert.ok(!c.includes('[object Object]'), `${onde} vazou objeto`);
    assert.ok(!/\$\{|\{\w+\}/.test(c), `${onde} vazou placeholder`);
    assert.ok(!/NaN/.test(c), `${onde} vazou NaN`);
  }
});

test('a geometria não muda com o idioma — só o texto muda', () => {
  for (const def of ['moderna', 'porfirio']) {
    for (const iso of INSTANTES) {
      const pt = L.luaForaDeCurso(new Date(iso), def, 'pt');
      for (const lang of ['es', 'en']) {
        const o = L.luaForaDeCurso(new Date(iso), def, lang);
        assert.equal(o.foraDeCurso, pt.foraDeCurso, `${lang}/${def}/${iso}`);
        assert.equal(String(o.desde), String(pt.desde));
        assert.equal(String(o.ate), String(pt.ate));
        assert.equal(o.proximoAspecto.planetaId, pt.proximoAspecto.planetaId);
        assert.equal(o.proximoAspecto.aspectoId, pt.proximoAspecto.aspectoId);
        assert.equal(o.proximoAspecto.quando.getTime(), pt.proximoAspecto.quando.getTime());
        assert.equal(o.lua.longitude, pt.lua.longitude);
        assert.equal(o.divergem, pt.divergem);
      }
    }
  }
});

test('nomes localizam de verdade, e o português não vaza para es/en', () => {
  // A lista é POR IDIOMA porque português e espanhol compartilham nomes:
  // Júpiter, Marte, Saturno, Sol e Libra se escrevem igual nos dois, e cobrá-los
  // do pack es seria cobrar um erro que não existe.
  const NOMES_PT = {
    es: /Áries|Gêmeos|Câncer|Leão|Virgem|Escorpião|Sagitário|Capricórnio|Aquário|Peixes|Mercúrio|Vênus|\bTouro\b/,
    en: /Áries|Gêmeos|Câncer|Leão|Virgem|Escorpião|Sagitário|Capricórnio|Aquário|Peixes|Mercúrio|Vênus|Júpiter|\bTouro\b|\bMarte\b|\bSaturno\b/,
  };
  const PALAVRAS_PT = {
    es: /\bvocê\b|\bnão\b|\br[ée]guas?\b|\bencontro\b|\bcaminho\b|\bfronteira\b|\bvazio\b/,
    en: /\bvocê\b|\bnão\b|\br[ée]guas?\b|\bsigno\b|\bencontro\b|\bcaminho\b|\bfronteira\b/,
  };
  for (const { lang, def, iso, r } of LEITURAS) {
    if (lang === 'pt') continue;
    const c = corpus(r);
    assert.ok(!NOMES_PT[lang].test(c), `${lang}/${def}/${iso} vazou nome PT: ${c.match(NOMES_PT[lang])}`);
    assert.ok(!PALAVRAS_PT[lang].test(c), `${lang}/${def}/${iso} vazou português: ${c.match(PALAVRAS_PT[lang])}`);
  }
  assert.match(L.luaForaDeCurso(new Date('2026-07-28T12:00:00Z'), 'moderna', 'en').textos.estado, /Aquarius/);
  assert.match(L.luaForaDeCurso(new Date('2026-07-28T12:00:00Z'), 'moderna', 'es').textos.estado, /Acuario/);
});

test('a citação de Lilly é BYTE A BYTE a mesma nos três packs, e o locus não muda de página', () => {
  const lilly = 'A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other.';
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.equal(pack.verbatim.lilly.texto, lilly, `${lang} mexeu na citação de Lilly`);
    assert.match(pack.verbatim.lilly.locus, /Christian Astrology/, lang);
    assert.match(pack.verbatim.lilly.locus, /1647/, lang);
    assert.match(pack.verbatim.lilly.locus, /112/, lang);
    assert.equal(pack.verbatim.morrison.texto, PT.verbatim.morrison.texto, `${lang} mexeu na citação de Morrison`);
    assert.match(pack.verbatim.morrison.locus, /1970/, lang);
    // a paráfrase existe, é do idioma, e nunca é a própria citação
    for (const chave of ['lilly', 'morrison']) {
      assert.ok(pack.verbatim[chave].parafrase.length > 60, `${lang}/${chave}`);
      assert.notEqual(pack.verbatim[chave].parafrase, pack.verbatim[chave].texto, `${lang}/${chave}`);
    }
  }
  // A citação de Morrison está CORTADA de propósito, e o corte é declarado.
  assert.match(PT.verbatim.morrison.texto, /…$/);
  assert.match(PT.verbatim.morrison.parafrase, /cortada de propósito/);
  assert.match(ES.verbatim.morrison.parafrase, /recortada a propósito/);
  assert.match(EN.verbatim.morrison.parafrase, /cut on purpose/);
});

test('a datação anda junto da afirmação histórica, nos três idiomas', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.match(pack.recibo.moderna, /1647/, `${lang}: a régua moderna sem a data de Lilly`);
    assert.match(pack.recibo.porfirio, /Porf[íi]rio|Porphyry/, lang);
    assert.match(pack.recibo.porfirio, /Ant[íi]oco|Antiochus/, lang);
    assert.match(pack.comoOMercadoUsa, /1970/, `${lang}: o conselho de agenda sem a data de Morrison`);
    assert.match(pack.comoOMercadoUsa, /Morrison/, lang);
    assert.match(pack.comoOMercadoUsa, /Lilly/, lang);
    assert.match(pack.comoOMercadoUsa, /Louis/, lang);
    // o que não se achou continua declarado como não achado
    assert.match(pack.oQueNaoSeAchou, /F[íi]rmico|Firmicus/, lang);
    assert.match(pack.oQueNaoSeAchou, /Ma'?shar/, lang);
    assert.match(pack.glosa, /κενοδρομία/, `${lang}: a glosa perdeu o grego`);
  }
});

test('o registro de pesquisa NAO_ACHADO existe e cobre as lacunas conhecidas', () => {
  const ids = L.NAO_ACHADO.map((x) => x.id);
  for (const id of ['quemTrocouOCriterio', 'antigosEAgenda', 'lillyVersusMorrison', 'morrisonEOsTresModernos', 'variante13Graus']) {
    assert.ok(ids.includes(id), `NAO_ACHADO sem a lacuna ${id}`);
  }
  for (const item of L.NAO_ACHADO) assert.ok(item.texto.length > 80, item.id);
});

// ===========================================================================
// 6. A LINHA VERMELHA, NOS TRÊS IDIOMAS
// ===========================================================================

const SAUDE = {
  pt: [/\b(cura|curar|curam|sarar|sara|alivia|aliviar|al[íi]vio|acalma|acalmar|tratar|trata|tratamento|rem[ée]dio|terap[êe]utic\w*|terapia|energiz\w*)\b/i],
  es: [/\b(alivia|aliviar|alivio|calma|calmar|calmante|sana|sanar|sanaci[óo]n|cura|curar|curaci[óo]n|trata|tratar|tratamiento|energiz\w*|terapia|terap[ée]utic\w*|remedio)\b/i],
  en: [/\b(relieve[sd]?|relief|sooth\w*|calm\w*|heal\w*|cure[sd]?|curing|treat(s|ed|ing|ment|ments)?|energiz\w*|therapy|therapeutic|remedy|remedies)\b/i],
};

test('nenhuma palavra de saúde entra, em nenhum pack e em nenhuma leitura', () => {
  for (const [lang, regexes] of Object.entries(SAUDE)) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — linha vermelha: ${s.match(re)}`);
    });
  }
  for (const { lang, def, iso, r } of LEITURAS) {
    const c = corpus(r);
    for (const re of SAUDE[lang]) assert.ok(!re.test(c), `${lang}/${def}/${iso} — linha vermelha: ${c.match(re)}`);
  }
  // Contraprova: se a varredura não morde, ela não protege ninguém.
  assert.ok(SAUDE.pt[0].test('este período acalma a ansiedade'));
  assert.ok(SAUDE.es[0].test('este período calma la ansiedad'));
  assert.ok(SAUDE.en[0].test('this window soothes anxiety'));
});

// Tira TUDO que está entre aspas ou guilhemets: o que sobra é a voz do app.
// É nesse resto que imperativo e veredito são proibidos — citar o slogan alheio
// («não assine nada agora») é justamente o assunto da tela.
function vozDoApp(texto) {
  return texto.replace(/«[^»]*»/g, ' ').replace(/"[^"]*"/g, ' ');
}

// A lista é de CONSTRUÇÃO DE CONSELHO, não de morfologia de verbo. Em espanhol
// «empieza» é ao mesmo tempo indicativo ("ela começa") e imperativo ("comece"),
// e em inglês «sign» aparece dentro de "sign-boundary": varredura por forma
// verbal solta acusa frase inocente e, pior, ensina a próxima pessoa a
// contornar o teste em vez de respeitar a regra.
// Cuidado de implementação que custou um teste vermelho: `\b` é ASCII em
// JavaScript, então `\bé um bom momento\b` NUNCA casa — a fronteira antes do
// «é» não existe. Onde a expressão começa ou termina em letra acentuada, o
// grupo vai sem `\b`.
const ORDENS = {
  pt: [
    /\b(não assine|assine|evite|adie|descanse|medite)\b/i,
    /(aproveite para|espere at[ée]|é um bom momento para|melhor não|recomendamos|aconselhamos|você deve|voc[êe] precisa)/i,
    /\b(garantido|garantia de)\b|com certeza vai|vai dar (certo|errado)/i,
  ],
  es: [
    /\b(no firmes|evita|evite|posterga|descansa|medita)\b/i,
    /(firma esto|aprovecha para|es (un )?buen momento para|mejor no|recomendamos|aconsejamos|deber[íi]as|ten[ée]s que|tienes que)/i,
    /\bgarantizado\b|seguro que va a|va a salir (bien|mal)/i,
  ],
  en: [
    /\b(don'?t sign|avoid|postpone|put off|make sure to|be sure to|use this time to)\b/i,
    /\b(a good time to|better not|we recommend|you should|you must|you need to)\b/i,
    /\b(guaranteed|is sure to|will turn out)\b/i,
  ],
};

test('a VOZ DO APP nunca dá ordem nem veredito — só as citações podem', () => {
  for (const { lang, def, iso, r } of LEITURAS) {
    const c = vozDoApp(corpus(r));
    for (const re of ORDENS[lang]) {
      assert.ok(!re.test(c), `${lang}/${def}/${iso} — ordem na voz do app: "${c.match(re)}"`);
    }
  }
  for (const [lang, regexes] of Object.entries(ORDENS)) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      const limpo = vozDoApp(s);
      for (const re of regexes) assert.ok(!re.test(limpo), `${caminho} — ordem na voz do app: "${limpo.match(re)}"`);
    });
  }
  // Contraprova dos dois lados: a varredura morde ordem de verdade...
  assert.ok(ORDENS.pt.some((re) => re.test('evite assinar contrato hoje')));
  assert.ok(ORDENS.pt.some((re) => re.test('é um bom momento para decidir')));
  assert.ok(ORDENS.en.some((re) => re.test('avoid signing anything today')));
  assert.ok(ORDENS.en.some((re) => re.test('a good time to sign')));
  assert.ok(ORDENS.es.some((re) => re.test('evita firmar hoy')));
  assert.ok(ORDENS.es.some((re) => re.test('deberías esperar')));
  // ...e NÃO morde a mesma frase quando ela está entre aspas, que é como o app
  // cita o print que circula por aí.
  assert.ok(!ORDENS.pt.some((re) => re.test(vozDoApp('o print diz «evite assinar contrato hoje» e não é antigo'))));
});

test('a abertura cita o slogan do mercado entre aspas — e o desmonta em seguida', () => {
  for (const { lang, r } of LEITURAS) {
    const marca = { pt: /«[^»]*»/, es: /«[^»]*»/, en: /"[^"]*"/ }[lang];
    assert.match(r.textos.abertura, marca, `${lang}: a abertura perdeu as aspas do slogan citado`);
  }
  // e o desmonte tem endereço: Morrison, ~1970, e a horária de Lilly
  for (const pack of Object.values(LANGS)) {
    assert.match(pack.comoOMercadoUsa, /(hor[áa]ri|horary)/i, pack.lang);
  }
});

test('nenhuma leitura promete resultado nem trata o vazio como sentença', () => {
  const PROMESSA = {
    pt: [/dia livre/i, /excelente para/i, /ideal para/i, /perfeito para/i],
    es: [/d[íi]a libre/i, /excelente para/i, /ideal para/i, /perfecto para/i],
    en: [/free day/i, /excellent for/i, /ideal for/i, /perfect for/i],
  };
  for (const { lang, def, iso, r } of LEITURAS) {
    const c = vozDoApp(corpus(r));
    for (const re of PROMESSA[lang]) {
      assert.ok(!re.test(c), `${lang}/${def}/${iso} — promessa na voz do app: "${c.match(re)}"`);
    }
  }
});

test('o texto declara o que é medição do app e o que é fonte', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    const marca = { pt: /medição deste app/i, es: /medición de esta app/i, en: /measurement by this app/i }[lang];
    assert.match(pack.oQuantoIssoMuda, marca, `${lang}: a medição não está rotulada como do app`);
    assert.ok(pack.leituraDoApp.length > 80, lang);
  }
  for (const { lang, r } of LEITURAS) {
    const marca = { pt: /Leitura do app/, es: /Lectura de la app/, en: /App reading/ }[lang];
    assert.match(r.textos.estado, marca, `${lang}: o estado não se declara leitura do app`);
  }
});
