// test/artemidoro.test.js
// AS CINCO ESPÉCIES DE SONHO — e as travas que impedem esta feature de virar
// dicionário de símbolos, que é exatamente o que a fonte dela combate.
//
// Este arquivo guarda seis leis:
//
//   1. A FONTE, E SÓ A FONTE. As cinco espécies são as de Oneirocritica
//      1.2.45–55, com o grego, a transliteração e o parágrafo de cada uma. O
//      vocabulário é o de 1.1–1.2. O checklist é o de 1.9 — com SEIS itens, e
//      o sexto declarado como citado-e-não-usado, nunca sumido em silêncio.
//   2. NUNCA CHUTAR. Sem resposta, com resposta pela metade ou com resposta
//      fora das opções, classificarSonho declara indisponível, diz qual
//      pergunta falta e diz onde respondê-la. Nada de espécie por eliminação.
//   3. A PERGUNTA DO APP NÃO DECIDE. "O sonho continuou depois de acordar?" é
//      nossa e não tem fonte antiga. Quando ela discorda da pergunta de
//      Artemidoro, a camada NÃO muda — a discordância fica registrada.
//   4. PARIDADE DOS TRÊS PACKS. Mesma forma, mesmas chaves, nenhum valor
//      vazio, nenhum placeholder por interpolar, nenhum vazamento de PT em
//      es/en. E `lang` ausente é a mesma saída de `lang='pt'`.
//   5. LINHA VERMELHA nos três idiomas: nada de saúde nem seus primos, nada de
//      promessa, nada de veredito sobre a vida de quem leu, nada de nota.
//   6. PRENDE PRIMEIRO, FONTE DEPOIS. A chamada e o primeiro parágrafo abrem
//      na vida real — sem nome próprio, sem parágrafo de obra, sem grego. O
//      recibo vem depois, e vem sempre.
//
// Roda sozinho:
//   node --test --max-old-space-size=4096 --require ./test/setup.js test/artemidoro.test.js

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const A = require('../lib/artemidoro.js');
const PT = require('../lib/traducoes/artemidoro.pt.js').PACK;
const ES = require('../lib/traducoes/artemidoro.es.js').PACK;
const EN = require('../lib/traducoes/artemidoro.en.js').PACK;

const LANGS = { pt: PT, es: ES, en: EN };
const IDIOMAS = ['pt', 'es', 'en'];
const NOME_DA_TELA = { pt: 'Sonhos', es: 'Sueños', en: 'Dreams' };

// As seis combinações que a tela pode produzir, em qualquer idioma.
const CASOS = {
  residuoDoDia: { diaAnterior: 'sim', quemApareceu: 'so-voce', aindaComVoce: 'nao' },
  soVoce: { diaAnterior: 'nao', quemApareceu: 'so-voce', aindaComVoce: 'sim' },
  outraConhecida: { diaAnterior: 'nao', quemApareceu: 'outra-pessoa', conheceQuemApareceu: 'sim', aindaComVoce: 'sim' },
  outraDesconhecida: { diaAnterior: 'nao', quemApareceu: 'outra-pessoa', conheceQuemApareceu: 'nao', aindaComVoce: 'sim' },
  osDois: { diaAnterior: 'nao', quemApareceu: 'voce-e-outra', aindaComVoce: 'sim' },
  aCidade: { diaAnterior: 'nao', quemApareceu: 'a-cidade', aindaComVoce: 'sim' },
  oMundo: { diaAnterior: 'nao', quemApareceu: 'o-mundo', aindaComVoce: 'sim' },
  foraDaLista: { diaAnterior: 'nao', quemApareceu: 'nada-disso', aindaComVoce: 'sim' },
  discordante: { diaAnterior: 'sim', quemApareceu: 'so-voce', aindaComVoce: 'sim' },
};

const AMOSTRA = {};
for (const lang of IDIOMAS) {
  AMOSTRA[lang] = Object.values(CASOS).map((r) => A.classificarSonho(r, lang));
}

// Tudo que o usuário lê numa classificação, num idioma.
function corpus(r) {
  return [
    r.chamada, r.explicacao, r.camadaNome, r.camadaTexto, r.camadaRecibo,
    r.especieNome, r.especieTexto, r.especieRecibo, r.textoSemEspecie,
    r.porque, r.notaDiscordancia, r.notaSubespecie, r.notaNaoEDicionario,
    r.notaLeituraDoApp, r.comoResolver,
    r.checklist.intro, r.checklist.recibo,
    ...r.checklist.itens.map((i) => i.texto),
    ...r.verbatins.map((v) => `${v.texto} ${v.parafrase} ${v.locus} ${v.elisao || ''}`),
    ...r.fonte,
  ]
    .filter(Boolean)
    .join(' \n ');
}

function varrerStrings(v, caminho, cb) {
  if (typeof v === 'string') return cb(caminho, v);
  if (Array.isArray(v)) return v.forEach((x, i) => varrerStrings(x, `${caminho}[${i}]`, cb));
  if (v && typeof v === 'object') for (const k of Object.keys(v)) varrerStrings(v[k], `${caminho}.${k}`, cb);
}

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

// ===========================================================================
// 1. A FONTE, E SÓ A FONTE
// ===========================================================================

test('as cinco espécies são as de 1.2.45–55, com o grego e o parágrafo de cada uma', () => {
  assert.deepEqual(A.ORDEM_DAS_ESPECIES, ['idioi', 'allotrioi', 'koina', 'demosia', 'kosmika']);
  const porId = Object.fromEntries(A.ESPECIES.map((e) => [e.id, e]));
  assert.equal(porId.idioi.grego, 'ἴδιοι');
  assert.equal(porId.allotrioi.grego, 'ἀλλότριοι');
  assert.equal(porId.koina.grego, 'κοινά');
  assert.equal(porId.demosia.grego, 'δημόσια');
  assert.equal(porId.kosmika.grego, 'κοσμικά');
  assert.equal(porId.idioi.locus, '1.2.45');
  assert.equal(porId.allotrioi.locus, '1.2.45');
  assert.equal(porId.koina.locus, '1.2.50');
  assert.equal(porId.demosia.locus, '1.2.50');
  assert.equal(porId.kosmika.locus, '1.2.55');
  // O grego e a transliteração NÃO mudam de idioma — são dados.
  for (const lang of IDIOMAS) {
    assert.deepEqual(A.especies(lang).map((e) => e.grego), A.ESPECIES.map((e) => e.grego), lang);
    assert.deepEqual(A.especies(lang).map((e) => e.transliteracao), A.ORDEM_DAS_ESPECIES, lang);
  }
});

test('cada espécie sai com nome de conversa, exemplo de vida real e recibo com obra, autor e século', () => {
  const FIM = { pt: /séc\. II d\.C\.$/, es: /siglo II d\.C\.$/, en: /2nd c\. AD$/ };
  const AUTOR = { pt: /^Artemidoro de Daldis, /, es: /^Artemidoro de Daldis, /, en: /^Artemidorus of Daldis, / };
  for (const lang of IDIOMAS) {
    for (const e of A.especies(lang)) {
      assert.ok(e.nome.length > 3, `${lang}/${e.id} sem nome`);
      assert.ok(e.oQueE.length > 60, `${lang}/${e.id} descrição curta`);
      assert.ok(e.exemplo.length > 40, `${lang}/${e.id} sem exemplo de vida real`);
      assert.match(e.recibo, AUTOR[lang], `${lang}/${e.id} recibo sem autor na forma da língua`);
      assert.match(e.recibo, new RegExp(`Oneirocritica ${e.locus.replace('.', '\\.')}`), `${lang}/${e.id} recibo sem locus`);
      assert.match(e.recibo, FIM[lang], `${lang}/${e.id} recibo sem a datação na forma da língua`);
    }
  }
  assert.equal(A.especiePorId('naoexiste'), null);
  assert.equal(A.especiePorId(null), null);
  assert.equal(A.especiePorId('koina').transliteracao, 'koina');
});

test('a datação passa por traduzirQuando/traduzirAutor — nada de datação em português no es/en', () => {
  const porId = (lang) => Object.fromEntries(A.datacoesDaFeature(lang).map((d) => [d.id, d]));
  const pt = porId('pt');
  const es = porId('es');
  const en = porId('en');

  assert.equal(pt.oneirocritica.quando, 'séc. II d.C.');
  assert.equal(es.oneirocritica.quando, 'siglo II d.C.');
  assert.equal(en.oneirocritica.quando, '2nd c. AD');
  assert.equal(en.ziqiqu.quando, '7th c. BC');
  assert.equal(es.ziqiqu.quando, 'siglo VII a.C.');
  assert.equal(en.chesterBeatty.quando, 'c. 1220 BC');
  assert.equal(en.macrobio.quando, 'c. 430 AD');

  // A OBRA nunca traduz; o AUTOR ganha a forma consagrada de cada língua.
  for (const lang of IDIOMAS) {
    assert.equal(porId(lang).oneirocritica.obra, 'Oneirocritica');
    assert.equal(porId(lang).macrobio.obra, 'Commentarii in Somnium Scipionis');
  }
  assert.equal(pt.oneirocritica.autor, 'Artemidoro de Daldis');
  assert.equal(en.oneirocritica.autor, 'Artemidorus of Daldis');
  assert.equal(en.macrobio.autor, 'Macrobius');
  assert.equal(es.macrobio.autor, 'Macrobio');
  assert.equal(en.hammondThonemann.autor, 'Martin Hammond and Peter Thonemann');
  // Obra sem autor continua sem autor — não se inventa um.
  assert.equal(pt.chesterBeatty.autor, null);
});

test('o vocabulário é o de 1.1–1.2, e o que não foi lido inteiro vem marcado', () => {
  const ids = A.VOCABULARIO.map((v) => v.id);
  assert.deepEqual(ids, ['enhypnion', 'oneiros', 'theorematikoi', 'allegorikoi', 'horama', 'chrematismos', 'phantasma']);
  const naoVerificados = A.VOCABULARIO.filter((v) => !v.verificado).map((v) => v.id);
  assert.deepEqual(naoVerificados, ['horama', 'chrematismos', 'phantasma']);
  for (const lang of IDIOMAS) {
    for (const v of A.vocabulario(lang)) {
      assert.ok(v.nome && v.oQueE.length > 50, `${lang}/${v.id}`);
      assert.match(v.recibo, /Oneirocritica 1\./, `${lang}/${v.id} sem locus`);
    }
    // horama declara que a definição não chegou inteira, em vez de completar.
    const horama = A.vocabulario(lang).find((v) => v.id === 'horama');
    assert.match(horama.oQueE, /não chegou clara|no llegó clara|did not survive clearly/, lang);
  }
});

test('o checklist de 1.9 tem SEIS itens, e o do corpo vem citado e declarado como não usado', () => {
  assert.equal(A.CHECKLIST_1_9.length, 6);
  assert.deepEqual(A.CHECKLIST_1_9.filter((c) => c.foraDoApp).map((c) => c.id), ['corpo']);
  for (const lang of IDIOMAS) {
    const c = A.checklistDoSonhador(lang);
    assert.equal(c.itens.length, 6, lang);
    assert.match(c.recibo, /Oneirocritica 1\.9/, lang);
    const corpo = c.itens.find((i) => i.id === 'corpo');
    assert.equal(corpo.foraDoApp, true);
    assert.ok(corpo.texto.length > 80, `${lang}: o item elidido foi citado de qualquer jeito`);
    for (const i of c.itens) assert.ok(i.texto.trim().length > 8, `${lang}/${i.id}`);
  }
  // E a citação diz que tem elisão, e diz qual.
  for (const lang of IDIOMAS) {
    const v = LANGS[lang].verbatim.checklist19;
    assert.ok(v.texto.includes('…'), `${lang}: a citação foi cortada sem marcar`);
    assert.ok(v.elisao && v.elisao.length > 120, `${lang}: elisão não declarada`);
    assert.match(v.elisao, /1\.9/, `${lang}: a elisão não diz onde conferir a lista inteira`);
  }
  // Verbatim sem corte não finge ter elisão.
  for (const lang of IDIOMAS) {
    assert.equal(LANGS[lang].verbatim.definicao11.elisao, null);
    assert.equal(LANGS[lang].verbatim.prefacio.elisao, null);
  }
});

test('o verbatim é BYTE A BYTE o mesmo nos três packs — citação não se traduz', () => {
  for (const chave of Object.keys(PT.verbatim)) {
    assert.equal(ES.verbatim[chave].texto, PT.verbatim[chave].texto, `es/${chave} mexeu na citação`);
    assert.equal(EN.verbatim[chave].texto, PT.verbatim[chave].texto, `en/${chave} mexeu na citação`);
    for (const lang of IDIOMAS) {
      const v = LANGS[lang].verbatim[chave];
      assert.ok(v.parafrase.length > 60, `${lang}/${chave} sem paráfrase`);
      assert.notEqual(v.parafrase, v.texto, `${lang}/${chave} paráfrase igual à citação`);
      assert.match(v.locus, /Oneirocritica/, `${lang}/${chave} sem obra no locus`);
      assert.match(v.locus, /attalus\.org/, `${lang}/${chave} sem onde ler`);
    }
  }
  assert.equal(
    PT.verbatim.definicao11.texto,
    'A dream differs from a vision in that the one is indicative of what is to come, the other of what is.'
  );
  assert.match(PT.verbatim.prefacio.texto, /testimony of actual dream-fulfillments/);
  // Nome consagrado TRADUZ, e é assim que o locus fala a língua de quem lê.
  assert.match(PT.verbatim.definicao11.locus, /^Artemidoro de Daldis/);
  assert.match(EN.verbatim.definicao11.locus, /^Artemidorus of Daldis/);
});

test('o que a pesquisa não achou continua não achado, e está escrito', () => {
  assert.deepEqual(A.NAO_ACHADO.map((x) => x.id).sort(), [
    'demaisCasosDoLivroV', 'diretoOuAlegorico', 'foraDasCincoEspecies',
    'perguntaDaPersistencia', 'pessoaDesconhecida', 'termosDeMacrobio',
  ]);
  for (const x of A.NAO_ACHADO) assert.ok(x.texto.length > 120, `${x.id} declarado de qualquer jeito`);
  assert.match(A.NAO_ACHADO.find((x) => x.id === 'perguntaDaPersistencia').texto, /operacionalização DESTE APP/);
  assert.match(A.NAO_ACHADO.find((x) => x.id === 'pessoaDesconhecida').texto, /conhecida de quem sonhou/);
  assert.match(A.NAO_ACHADO.find((x) => x.id === 'termosDeMacrobio').texto, /Macróbio/);
});

test('a segunda taxonomia quíntupla é nomeada como de OUTRO autor, e os termos dela não são listados', () => {
  const TERMOS_DE_MACROBIO = /\bsomnium\b|\bvisio\b|\boraculum\b|\binsomnium\b|\bvisum\b/i;
  for (const lang of IDIOMAS) {
    let achou = false;
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      if (/Macr[óo]bi|Macrobius/.test(s)) achou = true;
      // "Somnium Scipionis" é o título da obra e é a única aparição legítima.
      const semTitulo = s.replace(/Somnium Scipionis/g, '');
      assert.ok(!TERMOS_DE_MACROBIO.test(semTitulo), `${caminho} listou termo de Macróbio como verificado: ${semTitulo.match(TERMOS_DE_MACROBIO)}`);
    });
    assert.ok(achou, `${lang} não nomeia a confusão das duas taxonomias`);
  }
});

// ===========================================================================
// 2. NUNCA CHUTAR
// ===========================================================================

test('sem resposta, com meia resposta ou com lixo: declara o que falta e não escolhe espécie', () => {
  const casos = [
    [A.classificarSonho(), ['diaAnterior', 'quemApareceu']],
    [A.classificarSonho(null), ['diaAnterior', 'quemApareceu']],
    [A.classificarSonho({}), ['diaAnterior', 'quemApareceu']],
    [A.classificarSonho('sonhei com o mar'), ['diaAnterior', 'quemApareceu']],
    [A.classificarSonho({ diaAnterior: 'talvez', quemApareceu: 'so-voce' }), ['diaAnterior']],
    [A.classificarSonho({ diaAnterior: 'sim' }), ['quemApareceu']],
    [A.classificarSonho({ diaAnterior: 'nao', quemApareceu: 'outra-pessoa' }), ['conheceQuemApareceu']],
    [A.classificarSonho({ diaAnterior: 'nao', quemApareceu: 'quem sabe' }), ['quemApareceu']],
  ];
  for (const [r, faltam] of casos) {
    assert.equal(r.disponivel, false, faltam.join('+'));
    assert.deepEqual(r.faltam, faltam);
    assert.equal(r.camada, null);
    assert.equal(r.especie, null);
    assert.equal(r.especieTexto, null);
    assert.equal(r.porque, null);
    assert.ok(r.explicacao.length > 200, 'o que falta não pode ser um rótulo seco');
    assert.ok(r.comoResolver.includes('Sonhos'), r.comoResolver);
    assert.equal(r.perguntaQueFalta.id, faltam[0]);
    assert.ok(r.perguntaQueFalta.opcoes.length >= 2);
    // A fonte continua junto: a doutrina não some porque falta um campo.
    assert.equal(r.fonte.length, 7);
    assert.ok(r.chamada.length > 100);
  }
});

test('a pergunta condicional só é cobrada quando a fonte a pede', () => {
  // 1.2.45 define allotrioi como "outra pessoa CONHECIDA" — só aí a pergunta
  // vale. Para koina a fonte não pede, então o app não cobra.
  const semConhece = A.classificarSonho({ diaAnterior: 'nao', quemApareceu: 'voce-e-outra' });
  assert.equal(semConhece.disponivel, true);
  assert.equal(semConhece.especie, 'koina');
  const cobrada = A.classificarSonho({ diaAnterior: 'nao', quemApareceu: 'outra-pessoa' });
  assert.deepEqual(cobrada.faltam, ['conheceQuemApareceu']);
  const p = A.perguntas('pt').find((x) => x.id === 'conheceQuemApareceu');
  assert.deepEqual(p.soQuando, { quemApareceu: ['outra-pessoa'] });
});

test('pessoa desconhecida NÃO vira allotrioi à força, e o motivo é dito', () => {
  for (const lang of IDIOMAS) {
    const r = A.classificarSonho(CASOS.outraDesconhecida, lang);
    assert.equal(r.disponivel, true, lang);
    assert.equal(r.especie, null, lang);
    assert.equal(r.motivoSemEspecie, 'pessoaDesconhecida', lang);
    assert.ok(r.textoSemEspecie.length > 150, lang);
    assert.match(r.textoSemEspecie, /1\.2\.45/, `${lang} não citou a definição que trava a resposta`);
    // A camada continua respondida: uma coisa não derruba a outra.
    assert.equal(r.camada, 'oneiros', lang);
  }
});

test('relato que não cai em nenhuma das cinco fica sem espécie, e a lista não ganha uma sexta gaveta', () => {
  for (const lang of IDIOMAS) {
    const r = A.classificarSonho(CASOS.foraDaLista, lang);
    assert.equal(r.especie, null, lang);
    assert.equal(r.motivoSemEspecie, 'foraDaLista', lang);
    assert.match(r.textoSemEspecie, /1\.2\.45–55/, lang);
  }
  assert.ok(A.NAO_ACHADO.some((x) => x.id === 'foraDasCincoEspecies'));
});

test('lib/artemidoro.js não fala com storage nem finge calcular céu', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'artemidoro.js'), 'utf8');
  assert.ok(!/AsyncStorage|@react-native-async-storage/.test(src), 'storage aqui só via lib/storage.js — e esta feature não precisa de nenhum');
  assert.ok(!/astronomy-engine|planetPositions|ascendantSign/.test(src), 'esta feature classifica relato, não calcula efeméride');
});

// ===========================================================================
// 3. A ROTA DAS CINCO — cada resposta cai onde a fonte manda
// ===========================================================================

test('cada resposta de "de quem é o sonho" cai na espécie que 1.2.45–55 define', () => {
  const esperado = {
    'so-voce': 'idioi',
    'voce-e-outra': 'koina',
    'a-cidade': 'demosia',
    'o-mundo': 'kosmika',
  };
  for (const lang of IDIOMAS) {
    for (const [resposta, especie] of Object.entries(esperado)) {
      const r = A.classificarSonho({ diaAnterior: 'nao', quemApareceu: resposta }, lang);
      assert.equal(r.especie, especie, `${lang}/${resposta}`);
      assert.equal(r.especieTransliteracao, especie);
      assert.ok(r.especieTexto.includes(r.especieGrego), `${lang}/${especie} não mostrou o grego`);
      assert.match(r.especieRecibo, /Oneirocritica 1\.2\./, `${lang}/${especie}`);
      assert.ok(r.porque.length > 120, `${lang}/${especie} porquê curto demais`);
    }
    const conhecida = A.classificarSonho(CASOS.outraConhecida, lang);
    assert.equal(conhecida.especie, 'allotrioi', lang);
  }
});

test('a camada sai da pergunta da FONTE: dia dentro é enhypnion, dia fora é oneiros', () => {
  for (const lang of IDIOMAS) {
    const dentro = A.classificarSonho({ diaAnterior: 'sim', quemApareceu: 'so-voce' }, lang);
    const fora = A.classificarSonho({ diaAnterior: 'nao', quemApareceu: 'so-voce' }, lang);
    assert.equal(dentro.camada, 'enhypnion', lang);
    assert.equal(fora.camada, 'oneiros', lang);
    assert.equal(dentro.camadaTransliteracao, 'enhypnion');
    assert.equal(fora.camadaGrego, 'ὄνειρος');
    assert.notEqual(dentro.chamada, fora.chamada, `${lang}: a chamada não reagiu à camada`);
    assert.notEqual(dentro.explicacao, fora.explicacao, `${lang}: a explicação não reagiu à camada`);
    assert.match(dentro.camadaRecibo, /Oneirocritica 1\.2/, lang);
  }
});

test('o app nunca decreta que o sonho é alegórico — a nota de subespécie vai em toda classificação', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      assert.match(r.notaSubespecie, /1\.2\.1/, lang);
      assert.ok(r.notaSubespecie.length > 300, lang);
    }
  }
  assert.ok(A.NAO_ACHADO.some((x) => x.id === 'diretoOuAlegorico'));
});

// ===========================================================================
// 4. A PERGUNTA DO APP NÃO DECIDE
// ===========================================================================

test('a pergunta da persistência é declarada como do app e não troca a camada', () => {
  const p = A.PERGUNTAS.find((x) => x.id === 'aindaComVoce');
  assert.equal(p.doApp, true);
  assert.equal(p.obrigatoria, false);
  assert.equal(p.locus, null, 'pergunta sem fonte não pode ganhar um locus emprestado');

  for (const lang of IDIOMAS) {
    const naTela = A.perguntas(lang).find((x) => x.id === 'aindaComVoce');
    assert.equal(naTela.nota, LANGS[lang].perguntaDoApp, `${lang}: a pergunta do app não se declara na tela`);
    // As da fonte trazem recibo em vez de aviso.
    for (const outra of A.perguntas(lang).filter((x) => !x.doApp)) {
      assert.match(outra.nota, /Oneirocritica/, `${lang}/${outra.id}`);
    }

    // Mesma resposta de Artemidoro, respostas opostas na nossa: a camada é a mesma.
    const a = A.classificarSonho({ diaAnterior: 'sim', quemApareceu: 'so-voce', aindaComVoce: 'sim' }, lang);
    const b = A.classificarSonho({ diaAnterior: 'sim', quemApareceu: 'so-voce', aindaComVoce: 'nao' }, lang);
    assert.equal(a.camada, 'enhypnion', lang);
    assert.equal(b.camada, 'enhypnion', lang);
    assert.equal(a.especie, b.especie);
    assert.equal(a.sinaisDiscordam, true, lang);
    assert.equal(b.sinaisDiscordam, false, lang);
    assert.ok(a.notaDiscordancia.length > 150, lang);
    assert.equal(b.notaDiscordancia, null, lang);

    const c = A.classificarSonho({ diaAnterior: 'nao', quemApareceu: 'so-voce', aindaComVoce: 'nao' }, lang);
    assert.equal(c.camada, 'oneiros', lang);
    assert.equal(c.sinaisDiscordam, true, lang);
    assert.notEqual(c.notaDiscordancia, a.notaDiscordancia, `${lang}: a nota não distingue os dois jeitos de discordar`);
  }
  assert.ok(A.NAO_ACHADO.some((x) => x.id === 'perguntaDaPersistencia'));
});

test('a nota de "o que é fonte e o que é app" declara a pergunta nossa em todos os idiomas', () => {
  const MARCA = { pt: /não decide nada/, es: /no decide nada/, en: /decides nothing/ };
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      assert.match(r.notaLeituraDoApp, /1\.2\.45–55/, lang);
      assert.match(r.notaLeituraDoApp, /1\.9/, lang);
      assert.match(r.notaLeituraDoApp, MARCA[lang], lang);
    }
  }
});

// ===========================================================================
// 5. PARIDADE DOS TRÊS PACKS
// ===========================================================================

test('es e en têm EXATAMENTE a mesma forma do pt — mesmas chaves, mesmos tipos', () => {
  const formaPt = forma(PT);
  assert.deepEqual(forma(ES), formaPt, 'o pack es divergiu da forma do pt');
  assert.deepEqual(forma(EN), formaPt, 'o pack en divergiu da forma do pt');
});

test('as CHAVES de conteúdo são as mesmas nos três packs, e são as do motor', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.deepEqual(Object.keys(pack.especies).sort(), [...A.ORDEM_DAS_ESPECIES].sort(), lang);
    assert.deepEqual(Object.keys(pack.vocabulario).sort(), A.VOCABULARIO.map((v) => v.id).sort(), lang);
    assert.deepEqual(Object.keys(pack.checklist).sort(), A.CHECKLIST_1_9.map((c) => c.id).sort(), lang);
    assert.deepEqual(Object.keys(pack.perguntas).sort(), A.PERGUNTAS.map((p) => p.id).sort(), lang);
    for (const p of A.PERGUNTAS) {
      assert.deepEqual(Object.keys(pack.perguntas[p.id].opcoes).sort(), [...p.opcoes].sort(), `${lang}/${p.id}`);
    }
    assert.equal(pack.fontes.length, 7, lang);
    assert.equal(pack.tela, NOME_DA_TELA[lang]);
  }
});

test('nenhum valor de nenhum pack é vazio', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    varrerStrings(pack, lang, (caminho, s) => assert.ok(s.trim().length > 0, `${caminho} está vazio`));
  }
});

test('a classificação sai INTEIRA nos três idiomas — nada perdido, nada por interpolar', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      assert.equal(r.disponivel, true, lang);
      for (const campo of ['chamada', 'explicacao', 'camada', 'camadaNome', 'camadaTexto', 'camadaRecibo', 'porque', 'notaSubespecie', 'notaNaoEDicionario', 'notaLeituraDoApp']) {
        assert.ok(r[campo], `${lang} perdeu ${campo}`);
      }
      assert.equal(r.verbatins.length, 3, lang);
      assert.equal(r.fonte.length, 7, lang);
      assert.equal(r.checklist.itens.length, 6, lang);
      const c = corpus(r);
      assert.ok(!c.includes('undefined'), `${lang} vazou "undefined"`);
      assert.ok(!c.includes('[object Object]'), `${lang} vazou objeto`);
      assert.ok(!c.includes('null'), `${lang} vazou null`);
      assert.ok(!/\$\{|\{\w+\}/.test(c), `${lang} vazou placeholder sem interpolar`);
      assert.ok(r.explicacao.length > 900, `${lang} explicação curta demais: ${r.explicacao.length}`);
      assert.ok(r.chamada.length > 150 && r.chamada.length < 420, `${lang} chamada com ${r.chamada.length}`);
    }
  }
});

test('es e en não vazam português, e não repetem o pt', () => {
  const PT_MARCADO = /\bvocê\b|\bnão\b|\bsonho\b|\bsonhos\b|\bpergunta\b|\bpessoa\b|\bcidade\b|\bc[ée]u\b|\bespécies\b|\bgaveta\b|\bs[ée]c\.\s*[IVX]/i;
  for (const lang of ['es', 'en']) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      assert.ok(!PT_MARCADO.test(s), `${caminho} vazou português: ${s.match(PT_MARCADO)}`);
    });
    for (let i = 0; i < AMOSTRA.pt.length; i++) {
      assert.notEqual(AMOSTRA[lang][i].chamada, AMOSTRA.pt[i].chamada, `${lang} chamada igual ao pt`);
      assert.notEqual(AMOSTRA[lang][i].explicacao, AMOSTRA.pt[i].explicacao, `${lang} explicação igual ao pt`);
      assert.notEqual(AMOSTRA[lang][i].porque, AMOSTRA.pt[i].porque, `${lang} porquê igual ao pt`);
    }
  }
});

test('a classificação não muda com o idioma — camada, espécie e motivo são os mesmos', () => {
  for (let i = 0; i < AMOSTRA.pt.length; i++) {
    const pt = AMOSTRA.pt[i];
    for (const lang of ['es', 'en']) {
      const outro = AMOSTRA[lang][i];
      assert.equal(outro.camada, pt.camada);
      assert.equal(outro.especie, pt.especie);
      assert.equal(outro.motivoSemEspecie, pt.motivoSemEspecie);
      assert.equal(outro.sinaisDiscordam, pt.sinaisDiscordam);
      assert.deepEqual(outro.respostas, pt.respostas);
    }
  }
});

test("lang ausente e lang='pt' são a MESMA saída; idioma desconhecido cai no PT", () => {
  const semLang = JSON.stringify(A.classificarSonho(CASOS.outraConhecida));
  for (const lang of [undefined, null, 'pt', 'fr', 'de-DE', 42]) {
    assert.equal(JSON.stringify(A.classificarSonho(CASOS.outraConhecida, lang)), semLang, String(lang));
  }
  assert.deepEqual(A.especies('fr'), A.especies('pt'));
  assert.deepEqual(A.perguntas(), A.perguntas('pt'));
  assert.deepEqual(A.checklistDoSonhador('xx'), A.checklistDoSonhador('pt'));
});

test('a forma da resposta é a mesma com dado e sem dado — a tela não precisa de dois renderizadores', () => {
  const cheia = Object.keys(A.classificarSonho(CASOS.soVoce)).sort();
  const vazia = Object.keys(A.classificarSonho({})).sort();
  assert.deepEqual(vazia, cheia);
  // O eco das respostas nunca inventa: lixo entra, null sai.
  assert.deepEqual(A.classificarSonho({ diaAnterior: 'talvez', quemApareceu: 'so-voce' }).respostas, {
    diaAnterior: null, quemApareceu: 'so-voce', conheceQuemApareceu: null, aindaComVoce: null,
  });
});

// ===========================================================================
// 6. A LINHA VERMELHA, NOS TRÊS IDIOMAS
// ===========================================================================
// Lista de PALAVRA, não de intenção: se a palavra passa hoje numa frase
// inocente, amanhã passa numa frase que promete tratamento. A mesma lista de
// test/seita.test.js — e é por causa dela que a lista de 1.9 vira citação com
// elisão declarada em vez de citação com o item do corpo.

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

// Veredito é o pecado específico DESTA feature: classificar não é interpretar.
const VEREDITO = {
  pt: [/significa que voc[êe]/i, /quer dizer que voc[êe] (é|est[áa]|tem)/i, /seu sonho significa/i, /isso mostra que voc[êe]/i],
  es: [/significa que (t[úu]|eres|est[áa]s)/i, /quiere decir que (t[úu]|eres)/i, /tu sue[ñn]o significa/i],
  en: [/means that you\b/i, /your dream means/i, /this shows that you\b/i, /it means you\b/i],
};

test('nenhuma classificação, em nenhum idioma, usa linguagem de saúde ou seus primos', () => {
  for (const [lang, regexes] of Object.entries(SAUDE)) {
    for (const r of AMOSTRA[lang]) {
      const c = corpus(r);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — linha vermelha na saída: ${c.match(re)}`);
    }
    // E o pack inteiro, inclusive o que nenhuma saída exercita por acaso.
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — linha vermelha: ${s.match(re)}`);
    });
  }
  // Contrapartida: varredura que não morde não protege ninguém.
  assert.ok(SAUDE.pt.some((re) => re.test('isso alivia a ansiedade')));
  assert.ok(SAUDE.es.some((re) => re.test('esto calma y sana')));
  assert.ok(SAUDE.en.some((re) => re.test('this will heal and soothe you')));
});

test('nenhuma classificação promete resultado nem decreta desfecho', () => {
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

test('CLASSIFICAR NÃO É INTERPRETAR: em lugar nenhum sai "seu sonho significa que…"', () => {
  for (const [lang, regexes] of Object.entries(VEREDITO)) {
    for (const r of AMOSTRA[lang]) {
      const c = corpus(r);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — veredito: ${c.match(re)}`);
    }
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — veredito: ${s.match(re)}`);
    });
  }
  assert.ok(VEREDITO.pt.some((re) => re.test('seu sonho significa que você vai mudar de casa')));
  assert.ok(VEREDITO.en.some((re) => re.test('your dream means a move')));
});

test('não existe porcentagem, nota nem score em lugar nenhum', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      assert.ok(!corpus(r).includes('%'), `${lang} mostra porcentagem`);
      assert.equal(r.pct, undefined);
      assert.equal(r.nota, undefined);
      assert.equal(r.score, undefined);
    }
  }
});

// ===========================================================================
// 7. PRENDE PRIMEIRO, FONTE DEPOIS
// ===========================================================================

const JARGAO = [
  /Artemidor|Oneirocritica|Macr[óo]bi|Macrobius|attalus|Jung|Ptolo/i,
  /enhypnion|oneiros|theorematikoi|allegorikoi|idioi|allotrioi|koina|demosia|kosmika/i,
  /\b\d\.\d/,
  /s[ée]c\.\s*[IVX]|siglo\s+[IVX]|\d(st|nd|rd|th) c\.|century/i,
];

test('a CHAMADA abre na vida real: nenhum nome próprio, nenhum parágrafo, nenhum grego', () => {
  for (const lang of IDIOMAS) {
    for (const chave of ['neutra', 'enhypnion', 'oneiros']) {
      const s = LANGS[lang].chamada[chave];
      for (const re of JARGAO) assert.ok(!re.test(s), `${lang}/${chave}: a chamada abriu com jargão — ${s.match(re)}`);
    }
  }
});

test('o PRIMEIRO parágrafo da explicação também é vida real; a fonte vem DEPOIS', () => {
  for (const lang of IDIOMAS) {
    for (const chave of ['neutra', 'enhypnion', 'oneiros']) {
      const texto = LANGS[lang].explicacao[chave];
      const paragrafos = texto.split('\n\n');
      assert.ok(paragrafos.length >= 4, `${lang}/${chave}: só ${paragrafos.length} parágrafos`);
      for (const re of JARGAO) {
        assert.ok(!re.test(paragrafos[0]), `${lang}/${chave}: a abertura vazou jargão — ${paragrafos[0].match(re)}`);
      }
      // E o recibo está lá, mais adiante.
      assert.match(texto, /Oneirocritica/);
      assert.ok(texto.indexOf('Oneirocritica') > paragrafos[0].length, `${lang}/${chave}: a fonte abriu a leitura`);
    }
  }
});

test('o termo grego ganha glosa na primeira aparição', () => {
  assert.match(PT.explicacao.enhypnion, /enhypnion \(no grego — o sonho que espelha o que a pessoa está vivendo\)/);
  assert.match(ES.explicacao.enhypnion, /enhypnion \(en griego — el sueño que refleja lo que la persona está viviendo\)/);
  assert.match(EN.explicacao.enhypnion, /enhypnion \(in Greek — the dream that mirrors what the person is living through\)/);
  assert.match(PT.explicacao.oneiros, /oneiros \(no grego —/);
  assert.match(EN.explicacao.oneiros, /oneiros \(in Greek —/);
});

test('toda espécie e todo exemplo abrem em cena de vida real, não em erudição', () => {
  for (const lang of IDIOMAS) {
    for (const e of A.especies(lang)) {
      for (const re of JARGAO.slice(0, 2)) {
        assert.ok(!re.test(e.oQueE), `${lang}/${e.id}: a descrição virou aula — ${e.oQueE.match(re)}`);
        assert.ok(!re.test(e.exemplo), `${lang}/${e.id}: o exemplo virou aula — ${e.exemplo.match(re)}`);
      }
    }
  }
});

test('o app diz por que aqui não tem dicionário de símbolos, e cita o caso que prova', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      assert.match(r.notaNaoEDicionario, /5\.91/, lang);
      assert.match(r.notaNaoEDicionario, /1\.79/, lang);
      assert.ok(r.notaNaoEDicionario.length > 500, lang);
    }
  }
  assert.ok(A.NAO_ACHADO.some((x) => x.id === 'demaisCasosDoLivroV'));
});
