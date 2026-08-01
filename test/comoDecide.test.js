// test/comoDecide.test.js
// COMO ESTE APP DECIDE — as travas do card de transparência.
//
// Um card que descreve o app errado é pior que card nenhum: é a falha que ele
// existe pra corrigir, com selo de honestidade em cima. Por isso este arquivo
// guarda seis leis, e duas delas não existem em nenhum outro teste do repo:
//
//   1. O CARD NÃO PODE MENTIR SOBRE O CÓDIGO. As declarações que dá pra checar
//      em máquina são checadas contra o código de verdade: as regências são as
//      dos sete (Escorpião → Marte, Aquário → Saturno) em lib/dailyHoroscope,
//      as casas são Inteiras em lib/signs, a sinastria não tem nota nenhuma em
//      lib/synastry e o baralho tem 78 cartas em lib/tarotDeck. Se alguém
//      trocar qualquer uma dessas coisas no app e esquecer do card, o build cai.
//   2. TODA AFIRMAÇÃO HISTÓRICA TEM OBRA, AUTOR E SÉCULO — ou declara que não
//      tem. Item sem fonte primária lida é obrigado a ter entrada em
//      NAO_ACHADO com o mesmo id, e o recibo dele é a marca de "sem fonte".
//   3. A DATAÇÃO PASSA POR datacao.js. A obra nunca traduz, o autor ganha a
//      forma consagrada, a datação ganha a forma da língua.
//   4. PARIDADE DOS TRÊS PACKS: mesma forma, mesmas chaves, nada vazio, nada
//      por interpolar, nenhum vazamento de PT em es/en, e `lang` ausente é byte
//      a byte o `lang='pt'`.
//   5. LINHA VERMELHA nos três idiomas: nada de saúde nem seus primos, nada de
//      promessa, nada de porcentagem — nem para citar a que o app não usa.
//   6. PRENDE PRIMEIRO: toda chamada abre na vida real, sem nome próprio, sem
//      capítulo, sem termo técnico. Numa tela sobre método, esta é a que mais
//      escorrega.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const C = require('../lib/comoDecide.js');
const PT = require('../lib/traducoes/comoDecide.pt.js').PACK;
const ES = require('../lib/traducoes/comoDecide.es.js').PACK;
const EN = require('../lib/traducoes/comoDecide.en.js').PACK;
const { traduzirAutor, traduzirQuando } = require('../lib/traducoes/datacao.js');

const { DOMICILIO_POR_SIGNO } = require('../lib/dailyHoroscope.js');
const { houses, SIGNS, ascendantSign } = require('../lib/signs.js');
const { sinastria } = require('../lib/synastry.js');
const { TAROT_DECK } = require('../lib/tarotDeck.js');

const LANGS = { pt: PT, es: ES, en: EN };
const IDIOMAS = ['pt', 'es', 'en'];

const NASCIMENTO_COMPLETO = { date: '1990-06-15', time: '14:30', city: { lat: -23.5505, lon: -46.6333, timezone: 'America/Sao_Paulo' } };
const NASCIMENTO_SO_DATA = { date: '1990-06-15', time: null, city: null };

const CARD = {};
for (const lang of IDIOMAS) CARD[lang] = C.cardComoDecide(lang);

// Tudo que o usuário lê numa feature, num idioma.
function corpusDaFeature(d) {
  return [
    d.nome,
    d.tela,
    d.chamada,
    ...d.calculado.map((x) => `${x.texto} ${x.aviso || ''}`),
    ...d.tradicao.map((x) => `${x.texto} ${x.recibo}`),
    ...d.leituraDoApp.map((x) => x.texto),
    ...d.naoFaz.map((x) => x.texto),
    ...d.verbatins.map((v) => `${v.parafrase} ${v.locus}`),
  ]
    .filter(Boolean)
    .join(' \n ');
}

function corpusDoCard(card) {
  return [
    card.titulo,
    card.chamada,
    card.explicacao,
    ...Object.values(card.rotulos),
    ...card.convencoes.map((c) => `${c.nome} ${c.chamada} ${c.texto} ${c.fontes.join(' ')} ${c.verbatins.map((v) => `${v.parafrase} ${v.locus}`).join(' ')}`),
    ...card.decisoes.map(corpusDaFeature),
    ...card.fontes,
  ].join(' \n ');
}

function varrerStrings(v, caminho, cb) {
  if (typeof v === 'string') return cb(caminho, v);
  if (Array.isArray(v)) return v.forEach((x, i) => varrerStrings(x, `${caminho}[${i}]`, cb));
  if (v && typeof v === 'object') for (const k of Object.keys(v)) varrerStrings(v[k], `${caminho}.${k}`, cb);
}

// ===========================================================================
// 1. O CARD NÃO PODE MENTIR SOBRE O CÓDIGO
// ===========================================================================

test('a declaração de regências bate com a tabela que o app usa de verdade', () => {
  // O card diz, em três idiomas, que Escorpião é de Marte e Aquário é de
  // Saturno, e que os modernos ficam de fora. Se o app mudar, o card mente.
  assert.equal(DOMICILIO_POR_SIGNO['Escorpião'], 'Marte');
  assert.equal(DOMICILIO_POR_SIGNO['Aquário'], 'Saturno');
  assert.equal(DOMICILIO_POR_SIGNO['Peixes'], 'Júpiter');
  const usados = new Set(Object.values(DOMICILIO_POR_SIGNO));
  for (const moderno of ['Urano', 'Netuno', 'Plutão']) {
    assert.ok(!usados.has(moderno), `${moderno} entrou na tabela e o card diz que não entra`);
  }
  assert.equal(usados.size, 7, 'o card promete os SETE clássicos');
  // E o texto de cada idioma nomeia os dois casos que geram a dúvida.
  for (const lang of IDIOMAS) {
    const t = LANGS[lang].convencoes.regencias.texto + LANGS[lang].convencoes.regencias.chamada;
    assert.ok(/1781/.test(t) && /1846/.test(t) && /1930/.test(t), `${lang}: a convenção de regências não datou os três modernos`);
  }
});

test('a declaração de casas bate com houses(): Casa 1 é o signo INTEIRO do Ascendente', () => {
  const doze = houses('1990-06-15', '14:30', -23.5505, -46.6333, -3);
  assert.equal(doze.length, 12);
  assert.equal(doze[0].houseNumber, 1);
  assert.equal(doze[0].sign.name, ascendantSign('1990-06-15', '14:30', -23.5505, -46.6333, -3).name);
  // Casas Inteiras = uma casa por signo, na ordem da roda, sem repetir.
  const nomes = doze.map((h) => h.sign.name);
  assert.equal(new Set(nomes).size, 12);
  const i0 = SIGNS.findIndex((s) => s.name === nomes[0]);
  for (let n = 0; n < 12; n++) assert.equal(nomes[n], SIGNS[(i0 + n) % 12].name);
  // E sem hora não existe casa nenhuma — que é o que o card promete.
  assert.equal(houses('1990-06-15', null, -23.5505, -46.6333, -3), null);
});

test('a declaração "não existe nota" bate com lib/synastry.js', () => {
  const a = { ...SIGNS[0], index: 0 };
  const b = { ...SIGNS[6], index: 6 };
  const leitura = sinastria(a, b);
  assert.equal(leitura.pct, undefined);
  assert.equal(leitura.nota, undefined);
  assert.equal(leitura.score, undefined);
  assert.ok(!JSON.stringify(leitura).includes('%'), 'a sinastria voltou a mostrar porcentagem e o card diz que não existe');
});

// O código do motor sem os comentários — é o que roda, e é o que estas travas
// olham. Os comentários CITAM os símbolos de propósito (é lá que está escrito
// de onde cada linha do card foi conferida), e citar não é chamar.
const CODIGO_DO_MOTOR = fs
  .readFileSync(path.join(__dirname, '..', 'lib', 'comoDecide.js'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

test('a declaração do tarô bate com o baralho: 78 cartas e nenhum céu no sorteio', () => {
  assert.equal(TAROT_DECK.length, 78);
  assert.ok(!/planetPositions|astronomy-engine|Math\.random/.test(CODIGO_DO_MOTOR), 'este módulo é conteúdo puro: não calcula céu e não sorteia nada');
  for (const lang of IDIOMAS) {
    assert.match(LANGS[lang].features.taro.textos.sorteio, /78/);
  }
});

test('lib/comoDecide.js não fala com AsyncStorage — a tela passa o dado, o motor não busca', () => {
  assert.ok(!/AsyncStorage/.test(CODIGO_DO_MOTOR));
  assert.ok(!/@react-native-async-storage/.test(CODIGO_DO_MOTOR));
  assert.ok(!/getAnyBirthData/.test(CODIGO_DO_MOTOR), 'o motor não lê birthData: recebe pronto');
  // E só importa o que precisa: os três packs e a datação.
  const imports = CODIGO_DO_MOTOR.match(/^import .*$/gm) || [];
  assert.equal(imports.length, 4, `imports demais no motor: ${imports.join(' | ')}`);
});

// ===========================================================================
// 2. TODA AFIRMAÇÃO HISTÓRICA TEM OBRA, AUTOR E SÉCULO — OU DECLARA QUE NÃO
// ===========================================================================

test('todo item de tradição tem obra e datação, e o recibo sai montado', () => {
  for (const lang of IDIOMAS) {
    for (const d of CARD[lang].decisoes) {
      assert.ok(d.tradicao.length > 0, `${lang}/${d.id} não tem camada de tradição`);
      for (const t of d.tradicao) {
        assert.ok(t.texto && t.texto.length > 60, `${lang}/${d.id}/${t.id} sem texto de verdade`);
        if (t.semFontePrimaria) {
          assert.equal(t.obra, null);
          assert.equal(t.recibo, LANGS[lang].semFonte, `${lang}/${d.id}/${t.id} deveria carregar a marca de sem fonte`);
          assert.ok(C.lacunaDeclarada(t.id), `${d.id}/${t.id} está sem fonte e NÃO está declarado em NAO_ACHADO`);
        } else {
          assert.ok(t.obra && t.obra.length > 2, `${lang}/${d.id}/${t.id} sem obra`);
          assert.ok(t.quando && t.quando.length > 2, `${lang}/${d.id}/${t.id} sem datação`);
          assert.ok(t.recibo.includes(t.obra), `${lang}/${d.id}/${t.id}: o recibo perdeu a obra`);
          assert.ok(t.recibo.includes(t.quando), `${lang}/${d.id}/${t.id}: o recibo perdeu a datação`);
          if (t.autor) assert.ok(t.recibo.includes(t.autor), `${lang}/${d.id}/${t.id}: o recibo perdeu o autor`);
        }
      }
    }
  }
});

test('os dois itens sem fonte primária são exatamente os declarados, e a declaração é longa', () => {
  assert.deepEqual([...C.IDS_SEM_FONTE_PRIMARIA].sort(), ['istambul', 'rostoEPe']);
  for (const x of C.NAO_ACHADO) {
    assert.ok(x.texto.length > 150, `${x.id} declarado de qualquer jeito`);
  }
  const ids = C.NAO_ACHADO.map((x) => x.id);
  for (const obrigatorio of ['autorDaRegenciaModerna', 'significadoDeCasa', 'tabelaDePintas', 'camadaModernaDoSonho', 'anoDeCicelyKent']) {
    assert.ok(ids.includes(obrigatorio), `NAO_ACHADO perdeu ${obrigatorio}`);
  }
});

test('a bibliografia não repete obra e não inclui o que não foi lido', () => {
  for (const lang of IDIOMAS) {
    const b = C.bibliografia(lang);
    assert.ok(b.length >= 20, `${lang}: bibliografia magra demais (${b.length})`);
    assert.equal(new Set(b).size, b.length, `${lang}: obra repetida na bibliografia`);
    for (const linha of b) assert.ok(!linha.includes(LANGS[lang].semFonte), `${lang}: pendência entrou na bibliografia`);
  }
  assert.deepEqual(C.FONTES, C.bibliografia('pt'));
});

// ===========================================================================
// 3. A DATAÇÃO PASSA POR datacao.js
// ===========================================================================

test('a OBRA nunca traduz — é byte a byte a mesma nos três idiomas', () => {
  for (const d of C.DECISOES) {
    for (const t of d.tradicao) {
      if (!t.fonte) continue;
      const saidas = IDIOMAS.map((lang) => C.comoDecide(d.id, lang).tradicao.find((x) => x.id === t.id).obra);
      assert.deepEqual(saidas, [t.fonte.obra, t.fonte.obra, t.fonte.obra], `${d.id}/${t.id}: alguém traduziu a obra`);
    }
  }
});

test('o AUTOR ganha a forma consagrada de cada língua, e quem manda é datacao.js', () => {
  // O que datacao.js já sabe.
  assert.equal(C.autorNoIdioma('Ptolomeu', 'en'), 'Ptolemy');
  assert.equal(C.autorNoIdioma('Ptolomeu', 'es'), 'Ptolomeo');
  assert.equal(C.autorNoIdioma('Catão, o Velho', 'en'), 'Cato the Elder');
  assert.equal(C.autorNoIdioma('Catão, o Velho', 'es'), 'Catón el Viejo');
  assert.equal(C.autorNoIdioma('Plínio, o Velho', 'en'), 'Pliny the Elder');
  assert.equal(C.autorNoIdioma('Paulo de Alexandria', 'en'), 'Paulus Alexandrinus');
  assert.equal(C.autorNoIdioma('Vétio Valente', 'en'), traduzirAutor('Vétio Valente', 'en'));
  // O que ele ainda não sabe, e o pack completa sem editar arquivo compartilhado.
  for (const nome of ['Manílio', 'Artemidoro', 'Dião Cássio', 'Aristóteles']) {
    assert.equal(traduzirAutor(nome, 'en'), nome, `datacao.js passou a conhecer ${nome}: o complemento do pack pode sair`);
    assert.equal(C.autorNoIdioma(nome, 'en'), EN.autores[nome]);
    assert.equal(C.autorNoIdioma(nome, 'es'), ES.autores[nome]);
  }
  assert.equal(C.autorNoIdioma('Aristóteles', 'en'), 'Aristotle');
  assert.equal(C.autorNoIdioma('Manílio', 'en'), 'Manilius');
  assert.equal(C.autorNoIdioma(null, 'en'), null);
  assert.equal(C.autorNoIdioma('Ptolomeu', 'pt'), 'Ptolomeu');
});

test('a DATAÇÃO ganha a forma da língua, e é a mesma de traduzirQuando', () => {
  const recibo = (lang) => C.comoDecide('rituais', lang).tradicao.find((t) => t.id === 'catao');
  assert.equal(recibo('pt').quando, 'séc. II a.C.');
  assert.equal(recibo('es').quando, 'siglo II a.C.');
  assert.equal(recibo('en').quando, '2nd c. BC');
  assert.match(recibo('en').recibo, /Cato the Elder, De Agri Cultura 40\.1 — 2nd c\. BC/);
  assert.match(recibo('es').recibo, /Catón el Viejo, De Agri Cultura 40\.1 — siglo II a\.C\./);
  // A forma de século e a de ano solto, conferidas contra a própria datacao.js.
  for (const lang of IDIOMAS) {
    for (const d of C.DECISOES) {
      for (const t of d.tradicao) {
        if (!t.fonte) continue;
        const saiu = C.comoDecide(d.id, lang).tradicao.find((x) => x.id === t.id).quando;
        assert.equal(saiu, traduzirQuando(t.fonte.quando, lang), `${lang}/${d.id}/${t.id} não passou por traduzirQuando`);
      }
    }
  }
  // Ano não se traduz; século sim.
  assert.equal(C.comoDecide('taro', 'en').tradicao.find((t) => t.id === 'waite').quando, '1911');
  assert.equal(C.comoDecide('lua', 'en').tradicao.find((t) => t.id === 'nomesDeLua').quando, '1930s');
  assert.equal(C.comoDecide('lua', 'es').tradicao.find((t) => t.id === 'nomesDeLua').quando, 'años 1930');
});

test('obra sem autor conhecido usa a outra forma de recibo, e não inventa autor', () => {
  const almanaque = C.comoDecide('lua', 'en').tradicao.find((t) => t.id === 'nomesDeLua');
  assert.equal(almanaque.autor, null);
  assert.match(almanaque.recibo, /Maine Farmers' Almanac/);
  // A datação chega pontuada do motor, e é por isso que o recibo não termina
  // em "1930s Work" nem em "d.C.." — as duas formas passam pelo mesmo lugar.
  assert.equal(almanaque.recibo, EN.reciboSemAutor({ obra: "Maine Farmers' Almanac", quando: '1930s.' }));
  assert.ok(!almanaque.recibo.includes('..'));
  for (const lang of IDIOMAS) {
    for (const linha of C.bibliografia(lang)) {
      assert.ok(!linha.includes('..'), `${lang}: ponto duplicado no recibo — ${linha}`);
      assert.ok(linha.trim().endsWith('.'), `${lang}: recibo sem ponto final — ${linha}`);
    }
  }
});

// ===========================================================================
// 4. PARIDADE DOS TRÊS PACKS
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

test('es e en têm EXATAMENTE a mesma forma do pt — mesmas chaves, mesmos tipos', () => {
  const formaPt = forma(PT);
  assert.deepEqual(forma(ES), formaPt, 'o pack es divergiu da forma do pt');
  assert.deepEqual(forma(EN), formaPt, 'o pack en divergiu da forma do pt');
});

test('as chaves de feature, de convenção e de item são as do motor, nos três packs', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.deepEqual(Object.keys(pack.features).sort(), [...C.IDS_DE_FEATURE].sort(), lang);
    assert.deepEqual(Object.keys(pack.convencoes).sort(), [...C.IDS_DE_CONVENCAO].sort(), lang);
    for (const d of C.DECISOES) {
      const esperado = [
        ...d.calculado.map((x) => x.id),
        ...d.tradicao.map((x) => x.id),
        ...d.leituraDoApp,
        ...d.naoFaz,
      ].sort();
      assert.deepEqual(Object.keys(pack.features[d.id].textos).sort(), esperado, `${lang}/${d.id}: textos fora de sincronia com o motor`);
    }
  }
});

test('nenhum valor de nenhum pack é vazio', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    varrerStrings(pack, lang, (caminho, s) => assert.ok(s.trim().length > 0, `${caminho} está vazio`));
  }
});

test('o card sai INTEIRO nos três idiomas — nada perdido, nada por interpolar', () => {
  for (const lang of IDIOMAS) {
    const card = CARD[lang];
    assert.equal(card.idioma, lang);
    assert.ok(card.titulo && card.chamada && card.explicacao);
    assert.ok(card.explicacao.split('\n\n').length >= 5, `${lang}: a abertura perdeu a separação das três camadas`);
    assert.equal(card.convencoes.length, 6, lang);
    assert.equal(card.decisoes.length, 13, lang);
    const c = corpusDoCard(card);
    assert.ok(!c.includes('undefined'), `${lang} vazou "undefined"`);
    assert.ok(!c.includes('null'), `${lang} vazou "null"`);
    assert.ok(!c.includes('[object Object]'), `${lang} vazou objeto`);
    assert.ok(!c.includes('NaN'), `${lang} vazou NaN`);
    assert.ok(!/\$\{|\{\w+\}/.test(c), `${lang} vazou placeholder sem interpolar`);
    for (const d of card.decisoes) {
      assert.ok(d.nome && d.tela && d.chamada, `${lang}/${d.id} sem cabeçalho`);
      assert.ok(d.chamada.length > 100, `${lang}/${d.id}: chamada curta demais`);
      assert.ok(d.calculado.length >= 1 && d.leituraDoApp.length >= 1 && d.naoFaz.length >= 1, `${lang}/${d.id} com bloco vazio`);
      assert.equal(d.blocos.length, 4);
      assert.deepEqual(d.blocos.map((b) => b.tipo), ['calculado', 'tradicao', 'leituraDoApp', 'naoFaz']);
      for (const b of d.blocos) assert.ok(b.titulo && b.itens.length > 0, `${lang}/${d.id}/${b.tipo}`);
    }
    for (const conv of card.convencoes) {
      assert.ok(conv.texto.length > 400, `${lang}/${conv.id}: convenção curta demais`);
      assert.ok(conv.texto.split('\n\n').length >= 2, `${lang}/${conv.id}: convenção sem segundo parágrafo`);
    }
  }
});

test('es e en não vazam português, e não repetem o pt', () => {
  const PT_MARCADO = /\bvocê\b|\bnão\b|\bsão\b|\bcéu\b|\bconta que\b|\bescolha nossa\b|\bmilenar\b|\bséc\.\s/i;
  for (const lang of ['es', 'en']) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      // O verbatim inglês é o mesmo nos três — e não é português.
      assert.ok(!PT_MARCADO.test(s), `${caminho} vazou português: ${s.match(PT_MARCADO)}`);
    });
    for (let i = 0; i < CARD.pt.decisoes.length; i++) {
      assert.notEqual(CARD[lang].decisoes[i].chamada, CARD.pt.decisoes[i].chamada, `${lang} chamada igual ao pt`);
    }
    for (let i = 0; i < CARD.pt.convencoes.length; i++) {
      assert.notEqual(CARD[lang].convencoes[i].texto, CARD.pt.convencoes[i].texto, `${lang} convenção igual ao pt`);
    }
    assert.notEqual(CARD[lang].explicacao, CARD.pt.explicacao);
  }
});

test("lang ausente e lang='pt' são a MESMA saída; idioma desconhecido cai no PT", () => {
  assert.deepEqual(C.comoDecide('mapa'), C.comoDecide('mapa', 'pt'));
  for (const lang of ['fr', 'de-DE', null, undefined, 42]) {
    assert.deepEqual(C.comoDecide('mapa', lang), C.comoDecide('mapa', 'pt'), String(lang));
  }
  assert.deepEqual(C.convencoesDoApp(), C.convencoesDoApp('pt'));
  assert.deepEqual(C.bibliografia('fr'), C.bibliografia('pt'));
});

test('id desconhecido devolve null em vez de um card vazio', () => {
  assert.equal(C.comoDecide('nao-existe'), null);
  assert.equal(C.comoDecide(''), null);
  assert.equal(C.comoDecide(null), null);
  assert.equal(C.convencao('nao-existe'), null);
  assert.equal(C.todasAsDecisoes().length, C.DECISOES.length);
});

// ===========================================================================
// 5. O DADO DE NASCIMENTO — dizer o que falta, nunca preencher
// ===========================================================================

test('sem o dado de nascimento, a disponibilidade é NULA (o app não sabe), nunca falsa', () => {
  for (const lang of IDIOMAS) {
    const mapa = C.comoDecide('mapa', lang);
    const asc = mapa.calculado.find((x) => x.id === 'ascendente');
    assert.deepEqual(asc.exige, ['data', 'hora', 'cidade']);
    assert.equal(asc.disponivelParaVoce, null);
    assert.deepEqual(asc.falta, []);
    assert.ok(asc.aviso.length > 20, `${lang}: o aviso do que a conta precisa sumiu`);
    assert.ok(asc.comoResolver.includes({ pt: 'Mapa Astral', es: 'Carta Astral', en: 'Birth Chart' }[lang]), `${lang}: não diz ONDE informar`);
    // Conta que não depende de nada de quem lê não inventa exigência.
    const sorteio = C.comoDecide('taro', lang).calculado.find((x) => x.id === 'sorteio');
    assert.deepEqual(sorteio.exige, []);
    assert.equal(sorteio.disponivelParaVoce, null);
    assert.equal(sorteio.aviso, null);
  }
});

test('com dado completo a conta roda; faltando hora e cidade, o app diz exatamente o que falta', () => {
  const completo = C.comoDecide('mapa', 'pt', NASCIMENTO_COMPLETO);
  const ascOk = completo.calculado.find((x) => x.id === 'ascendente');
  assert.equal(ascOk.disponivelParaVoce, true);
  assert.deepEqual(ascOk.falta, []);
  assert.equal(ascOk.aviso, PT.exigencia.pronto);
  assert.equal(ascOk.comoResolver, null);

  const soData = C.comoDecide('mapa', 'pt', NASCIMENTO_SO_DATA);
  const ascFalta = soData.calculado.find((x) => x.id === 'ascendente');
  assert.equal(ascFalta.disponivelParaVoce, false);
  assert.deepEqual(ascFalta.falta, ['hora', 'cidade']);
  assert.match(ascFalta.aviso, /hora de nascimento/);
  assert.match(ascFalta.aviso, /cidade de nascimento/);
  assert.match(ascFalta.comoResolver, /Mapa Astral/);
  // O Sol continua rodando: ele só precisa da data.
  assert.equal(soData.calculado.find((x) => x.id === 'sol').disponivelParaVoce, true);
  // E hora em branco não vale como hora.
  const horaVazia = C.comoDecide('mapa', 'pt', { date: '1990-06-15', time: '   ', city: null });
  assert.deepEqual(horaVazia.calculado.find((x) => x.id === 'ascendente').falta, ['hora', 'cidade']);
});

test('o dado de nascimento não muda nem uma vírgula do que é conteúdo', () => {
  for (const lang of IDIOMAS) {
    const sem = C.comoDecide('mapa', lang);
    const com = C.comoDecide('mapa', lang, NASCIMENTO_COMPLETO);
    assert.equal(com.chamada, sem.chamada);
    assert.deepEqual(com.tradicao, sem.tradicao);
    assert.deepEqual(com.naoFaz, sem.naoFaz);
    assert.deepEqual(com.calculado.map((x) => x.texto), sem.calculado.map((x) => x.texto));
  }
});

// ===========================================================================
// 6. A LINHA VERMELHA, NOS TRÊS IDIOMAS
// ===========================================================================
// Lista de PALAVRA, não de intenção — a mesma régua de test/seita.test.js.

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
  pt: [/\bvocê vai\b/i, /\bvai (ter|conseguir|ganhar|dar certo|acontecer)\b/i, /garant\w+/i, /sorte grande/i, /destino selado/i],
  es: [/\bvas a (tener|lograr|conseguir|ganar)\b/i, /garantiz\w+/i, /suerte grande/i, /destino sellado/i],
  en: [/\byou will\b/i, /\byou'?re going to\b/i, /guarantee\w*/i, /destined to/i, /\bfated to\b/i],
};

test('nenhum texto, em nenhum idioma, usa linguagem de saúde ou seus primos', () => {
  for (const [lang, regexes] of Object.entries(SAUDE)) {
    const c = corpusDoCard(CARD[lang]);
    for (const re of regexes) assert.ok(!re.test(c), `${lang} — linha vermelha no card: ${c.match(re)}`);
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — linha vermelha: ${s.match(re)}`);
    });
  }
  // E o registro de pesquisa, que é PT e não vai pra tela, segue a mesma régua.
  for (const x of C.NAO_ACHADO) {
    for (const re of SAUDE.pt) assert.ok(!re.test(x.texto), `NAO_ACHADO.${x.id}: ${x.texto.match(re)}`);
  }
  // Contrapartida: varredura que não morde não protege ninguém.
  assert.ok(SAUDE.pt.some((re) => re.test('isso alivia a ansiedade')));
  assert.ok(SAUDE.es.some((re) => re.test('esto calma y sana')));
  assert.ok(SAUDE.en.some((re) => re.test('this will heal and soothe you')));
});

test('nenhum texto promete resultado nem decreta desfecho', () => {
  for (const [lang, regexes] of Object.entries(PROMESSA)) {
    const c = corpusDoCard(CARD[lang]);
    for (const re of regexes) assert.ok(!re.test(c), `${lang} — promessa: ${c.match(re)}`);
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — promessa: ${s.match(re)}`);
    });
  }
  assert.ok(PROMESSA.pt.some((re) => re.test('você vai conseguir tudo')));
  assert.ok(PROMESSA.en.some((re) => re.test('you will get the job')));
});

test('não existe porcentagem em lugar nenhum — nem para citar a que o app não usa', () => {
  for (const lang of IDIOMAS) {
    assert.ok(!corpusDoCard(CARD[lang]).includes('%'), `${lang} mostra porcentagem`);
    varrerStrings(LANGS[lang], lang, (caminho, s) => assert.ok(!s.includes('%'), `${caminho} tem símbolo de porcentagem`));
  }
  // E o card diz isso com todas as letras, nos três.
  const MARCA = { pt: /porcentagem/i, es: /porcentaje/i, en: /percentage/i };
  for (const lang of IDIOMAS) {
    assert.match(LANGS[lang].features.compatibilidade.textos.semNota, MARCA[lang]);
  }
});

test('nenhum aviso defensivo volta pro app — eles foram removidos de propósito', () => {
  const DEFENSIVO = {
    pt: [/apenas entretenimento/i, /não garante resultados/i, /fins recreativos/i, /consulte um profissional/i],
    es: [/solo entretenimiento/i, /no garantiza resultados/i, /fines recreativos/i, /consulte a un profesional/i],
    en: [/for entertainment purposes/i, /does not guarantee results/i, /consult a professional/i],
  };
  for (const [lang, regexes] of Object.entries(DEFENSIVO)) {
    const c = corpusDoCard(CARD[lang]);
    for (const re of regexes) assert.ok(!re.test(c), `${lang} — aviso defensivo de volta: ${c.match(re)}`);
  }
});

// ===========================================================================
// 7. PRENDE PRIMEIRO, FONTE DEPOIS
// ===========================================================================

const JARGAO = [
  /Ptolomeu|Ptolomeo|Ptolemy|Manílio|Manilio|Manilius|Artemidoro|Artemidorus|Valente|Valens|Waite|Culpeper|Hesíodo|Hesiod|Plínio|Plinio|Pliny|Columela|Columella/i,
  /Tetrabiblos|Anthologiae|Astronomica|Oneirocritica|Naturalis Historia|De Agri Cultura|De Re Rustica|Mathesis|Eisagogika|Historia Animalium|Historia Romana|Yavana/i,
  /\b[IVX]+\.\d+\b/,
  /trad\.\s|trans\.\s|Robbins|Cary|Loeb/i,
  /efem[ée]ride|ephemeris|longitude ecl[íi]ptica|ecliptic longitude|bisse[cç]|bisection/i,
];

test('a CHAMADA de cada feature abre na vida real: sem nome próprio, sem capítulo, sem termo técnico', () => {
  for (const lang of IDIOMAS) {
    for (const d of CARD[lang].decisoes) {
      for (const re of JARGAO) {
        assert.ok(!re.test(d.chamada), `${lang}/${d.id}: a chamada abriu com jargão — ${d.chamada.match(re)}`);
      }
    }
  }
});

test('a CHAMADA de cada convenção também abre na vida real', () => {
  for (const lang of IDIOMAS) {
    for (const conv of CARD[lang].convencoes) {
      for (const re of JARGAO) {
        assert.ok(!re.test(conv.chamada), `${lang}/${conv.id}: a chamada abriu com jargão — ${conv.chamada.match(re)}`);
      }
    }
  }
});

test('a abertura do card inteiro abre na vida real, e a fonte vem depois', () => {
  for (const lang of IDIOMAS) {
    for (const re of JARGAO) {
      assert.ok(!re.test(CARD[lang].chamada), `${lang}: a abertura vazou jargão — ${CARD[lang].chamada.match(re)}`);
    }
    // A explicação separa as três camadas em voz alta.
    const MARCA = {
      pt: [/CALCULOU/, /LEU/, /LEITURA DO APP/],
      es: [/CALCULÓ/, /LEYÓ/, /LECTURA DE LA APP/],
      en: [/CALCULATED/, /READ/, /READING/],
    };
    for (const re of MARCA[lang]) assert.match(CARD[lang].explicacao, re, `${lang}: a abertura não separou as camadas`);
  }
});

test('o recibo aparece DEPOIS do texto, nunca dentro dele — a fonte não abre frase', () => {
  // Nenhum texto de pack escreve obra + século à mão: isso é trabalho do
  // recibo, e duplicar cria duas verdades sobre a mesma fonte.
  const OBRAS = Object.values(C.FONTES_CANONICAS).map((f) => f.obra);
  for (const [lang, pack] of Object.entries(LANGS)) {
    for (const d of C.DECISOES) {
      for (const [id, texto] of Object.entries(pack.features[d.id].textos)) {
        for (const obra of OBRAS) {
          assert.ok(!texto.includes(obra), `${lang}/${d.id}/${id} escreveu a obra à mão: ${obra}`);
        }
      }
    }
  }
  // O único lugar em que o nome da obra aparece é o recibo montado — que vem
  // depois do texto, no campo ao lado, e nunca dentro da frase.
  for (const lang of IDIOMAS) {
    for (const d of CARD[lang].decisoes) {
      for (const t of d.tradicao) {
        if (!t.obra) continue;
        assert.ok(t.recibo.includes(t.obra), `${lang}/${d.id}/${t.id}: o recibo perdeu a obra`);
        assert.ok(!t.texto.includes(t.obra), `${lang}/${d.id}/${t.id}: a obra vazou para dentro do texto`);
      }
    }
  }
});

// ===========================================================================
// 8. O VERBATIM — citação não se traduz
// ===========================================================================

test('o verbatim é BYTE A BYTE o mesmo nos três packs, e o locus fala a língua do leitor', () => {
  for (const chave of Object.keys(PT.verbatim)) {
    assert.equal(ES.verbatim[chave].texto, PT.verbatim[chave].texto, `es/${chave} mexeu na citação`);
    assert.equal(EN.verbatim[chave].texto, PT.verbatim[chave].texto, `en/${chave} mexeu na citação`);
    for (const [lang, pack] of Object.entries(LANGS)) {
      assert.ok(pack.verbatim[chave].parafrase.length > 60, `${lang}/${chave} sem paráfrase`);
      assert.notEqual(pack.verbatim[chave].parafrase, pack.verbatim[chave].texto, `${lang}/${chave}`);
    }
  }
  assert.equal(PT.verbatim.ptolomeuZodiaco.texto, 'and from no other source');
  assert.equal(
    PT.verbatim.ptolomeuAversao.texto,
    'if they are in disjunct signs or opposite signs, they produce the deepest enmities and lasting contentions'
  );
  assert.match(PT.verbatim.ptolomeuZodiaco.locus, /^Ptolomeu/);
  assert.match(ES.verbatim.ptolomeuZodiaco.locus, /^Ptolomeo/);
  assert.match(EN.verbatim.ptolomeuZodiaco.locus, /^Ptolemy/);
  assert.match(EN.verbatim.dioCassio.locus, /^Cassius Dio/);
  for (const pack of Object.values(LANGS)) {
    assert.match(pack.verbatim.ptolomeuZodiaco.locus, /Tetrabiblos I\.22/);
    assert.match(pack.verbatim.ptolomeuAversao.locus, /Tetrabiblos IV\.7/);
    assert.match(pack.verbatim.dioCassio.locus, /Historia Romana 37\.18/);
  }
});

test('o verbatim aparece onde ele decide a leitura, e não pendurado em tudo', () => {
  for (const lang of IDIOMAS) {
    const porId = Object.fromEntries(CARD[lang].decisoes.map((d) => [d.id, d]));
    assert.equal(porId.compatibilidade.verbatins.length, 1);
    assert.equal(porId.compatibilidade.verbatins[0].texto, PT.verbatim.ptolomeuAversao.texto);
    assert.equal(porId.rituais.verbatins[0].texto, PT.verbatim.dioCassio.texto);
    assert.equal(porId.mapa.verbatins[0].texto, PT.verbatim.ptolomeuZodiaco.texto);
    assert.equal(porId.taro.verbatins.length, 0);
    const zodiaco = CARD[lang].convencoes.find((c) => c.id === 'zodiaco');
    assert.equal(zodiaco.verbatins[0].texto, 'and from no other source');
  }
});

// ===========================================================================
// 9. COBERTURA — o card fala das telas que existem
// ===========================================================================

test('as treze features do card correspondem a telas que existem no app', () => {
  const TELAS = {
    horoscopo: 'HoroscopeScreen.js',
    mapa: 'BirthChartScreen.js',
    ceu: 'HomeScreen.js',
    taro: 'TarotScreen.js',
    compatibilidade: 'CompatibilityScreen.js',
    lua: 'LunarCalendarScreen.js',
    calendario: 'CalendarioCosmicoScreen.js',
    rituais: 'RituaisScreen.js',
    sonhos: 'DreamScreen.js',
    corpo: 'ZodiacBodyScreen.js',
    fotos: 'PalmScreen.js',
    cafe: 'CoffeeScreen.js',
    chat: 'ChatScreen.js',
  };
  assert.deepEqual(Object.keys(TELAS).sort(), [...C.IDS_DE_FEATURE].sort());
  for (const [id, arquivo] of Object.entries(TELAS)) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'screens', arquivo)), `${id}: ${arquivo} não existe`);
  }
});

test('as três declarações que o roadmap pediu estão lá, mais as que o app precisava declarar', () => {
  for (const obrigatoria of ['regencias', 'casas', 'zodiaco']) {
    assert.ok(C.IDS_DE_CONVENCAO.includes(obrigatoria), `faltou declarar ${obrigatoria}`);
  }
  assert.deepEqual(C.IDS_DE_CONVENCAO, ['zodiaco', 'efemeride', 'regencias', 'casas', 'semNota', 'ia']);
});
