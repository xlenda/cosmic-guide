// test/dailyHoroscope.test.js
//
// O horóscopo diário era efeito Barnum: 8 textos por aba sorteados por hash,
// notas fixas ({ Amor: 62, Trabalho: 74… }) desenhadas como medida, e frases
// que AFIRMAVAM posição planetária que o app nunca calculou.
//
// Estes testes existem para que isso não volte. Eles cobram três coisas que o
// dono do app pediu por escrito, e uma quarta que a base de tradição impõe:
//
//   1. dois signos diferentes recebem leituras diferentes no MESMO dia;
//   2. o mesmo signo recebe leituras diferentes em dias de céu diferente, e a
//      diferença tem motivo real (a efeméride mudou);
//   3. nenhuma frase afirma posição planetária sem cálculo por trás — provado
//      estruturalmente: nenhum template do dicionário contém nome de signo, todo
//      nome de signo chega por interpolação de valor calculado;
//   4. nenhuma nota, porcentagem ou barra de área da vida — a mesma regra que o
//      prompt do assistente do app já impunha ao chat.
//
// Falha aqui = não pode publicar. É de propósito.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  horoscopeFor,
  assinatura,
  resumoDoDia,
  ceuDoDia,
  dignidadeDe,
  relacaoSignoInteiro,
  quartoLunar,
  planetaRetrogrado,
  aspectoDoRegente,
  DOMICILIO_POR_SIGNO,
  EXALTACAO_POR_SIGNO,
  REGENTE_POR_DIA,
  SKY_PREFIX,
} = require('../lib/dailyHoroscope.js');
const { SIGNS, isMercuryRetrograde } = require('../lib/signs.js');
const { _DICTS_FOR_TESTS } = require('../lib/i18n.js');

const NOMES_SIGNOS = SIGNS.map((s) => s.name);
const IDIOMAS = ['pt', 'es', 'en'];

function utc(y, m, d) {
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

// ---------------------------------------------------------------------------
// 1. AS TABELAS DE TRADIÇÃO BATEM COM A FONTE
// ---------------------------------------------------------------------------

test('os domicílios são os doze de Ptolomeu, Tetrabiblos I.17 — e só os sete clássicos regem', () => {
  assert.equal(Object.keys(DOMICILIO_POR_SIGNO).length, 12, 'todo signo precisa de regente');
  const setePlanetas = new Set(['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno']);
  for (const [signo, planeta] of Object.entries(DOMICILIO_POR_SIGNO)) {
    assert.ok(NOMES_SIGNOS.includes(signo), `${signo} não é signo de lib/signs.js`);
    assert.ok(
      setePlanetas.has(planeta),
      `${signo} recebeu ${planeta} — Urano, Netuno e Plutão foram descobertos em 1781, 1846 e 1930 e não podem reger nada numa tabela atribuída a Ptolomeu`
    );
  }
  // Os dois luminares regem um signo cada; os cinco planetas, dois cada.
  assert.equal(DOMICILIO_POR_SIGNO['Leão'], 'Sol');
  assert.equal(DOMICILIO_POR_SIGNO['Câncer'], 'Lua');
  assert.equal(DOMICILIO_POR_SIGNO['Áries'], 'Marte');
  assert.equal(DOMICILIO_POR_SIGNO['Escorpião'], 'Marte');
  assert.equal(DOMICILIO_POR_SIGNO['Touro'], 'Vênus');
  assert.equal(DOMICILIO_POR_SIGNO['Libra'], 'Vênus');
  assert.equal(DOMICILIO_POR_SIGNO['Gêmeos'], 'Mercúrio');
  assert.equal(DOMICILIO_POR_SIGNO['Virgem'], 'Mercúrio');
  assert.equal(DOMICILIO_POR_SIGNO['Sagitário'], 'Júpiter');
  assert.equal(DOMICILIO_POR_SIGNO['Peixes'], 'Júpiter');
  assert.equal(DOMICILIO_POR_SIGNO['Capricórnio'], 'Saturno');
  assert.equal(DOMICILIO_POR_SIGNO['Aquário'], 'Saturno');
});

test('as exaltações são as sete de Tetrabiblos I.19 — e cinco signos não exaltam ninguém', () => {
  assert.deepEqual(EXALTACAO_POR_SIGNO, {
    'Áries': 'Sol',
    'Touro': 'Lua',
    'Câncer': 'Júpiter',
    'Virgem': 'Mercúrio',
    'Libra': 'Saturno',
    'Capricórnio': 'Marte',
    'Peixes': 'Vênus',
  });
  for (const semExaltacao of ['Gêmeos', 'Leão', 'Escorpião', 'Sagitário', 'Aquário']) {
    assert.equal(
      EXALTACAO_POR_SIGNO[semExaltacao],
      undefined,
      `${semExaltacao} não exalta ninguém em Ptolomeu — preencher a lacuna é inventar`
    );
  }
});

test('dignidade essencial: domicílio, exaltação, exílio, queda e peregrino saem certos', () => {
  assert.equal(dignidadeDe('Lua', 'Câncer'), 'domicilio');
  assert.equal(dignidadeDe('Marte', 'Capricórnio'), 'exaltacao');
  assert.equal(dignidadeDe('Sol', 'Aquário'), 'exilio', 'Aquário é oposto a Leão');
  assert.equal(dignidadeDe('Saturno', 'Áries'), 'queda', 'Áries é oposto a Libra, exaltação de Saturno');
  assert.equal(dignidadeDe('Lua', 'Escorpião'), 'queda', 'Escorpião é oposto a Touro');
  assert.equal(dignidadeDe('Marte', 'Gêmeos'), 'peregrino');
});

test('relação por signo inteiro segue Ptolomeu I.13 e I.16 — 30° e 150° NÃO são aspecto', () => {
  assert.equal(relacaoSignoInteiro('Áries', 'Áries'), 'copresenca');
  assert.equal(relacaoSignoInteiro('Áries', 'Touro'), 'alheio30');
  assert.equal(relacaoSignoInteiro('Áries', 'Gêmeos'), 'sextil');
  assert.equal(relacaoSignoInteiro('Áries', 'Câncer'), 'quadratura');
  assert.equal(relacaoSignoInteiro('Áries', 'Leão'), 'trigono');
  assert.equal(relacaoSignoInteiro('Áries', 'Virgem'), 'alheio150');
  assert.equal(relacaoSignoInteiro('Áries', 'Libra'), 'oposicao');
  // simétrico nos dois sentidos da roda
  assert.equal(relacaoSignoInteiro('Áries', 'Peixes'), 'alheio30');
  assert.equal(relacaoSignoInteiro('Áries', 'Aquário'), 'sextil');
});

test('o quarto lunar é o de Ptolomeu I.8 (quatro), não a fase de oito de Rudhyar', () => {
  assert.deepEqual(quartoLunar(0), { id: 'q1', metade: 'crescente' });
  assert.deepEqual(quartoLunar(89), { id: 'q1', metade: 'crescente' });
  assert.deepEqual(quartoLunar(90), { id: 'q2', metade: 'crescente' });
  assert.deepEqual(quartoLunar(179), { id: 'q2', metade: 'crescente' });
  assert.deepEqual(quartoLunar(180), { id: 'q3', metade: 'minguante' });
  assert.deepEqual(quartoLunar(270), { id: 'q4', metade: 'minguante' });
  assert.deepEqual(quartoLunar(359), { id: 'q4', metade: 'minguante' });
  assert.equal(quartoLunar(null), null);
});

test('a ordem caldaica dos regentes dos dias bate com o calendário real', () => {
  // Índice = getUTCDay(). 07/jan/2024 foi domingo.
  assert.equal(REGENTE_POR_DIA[new Date('2024-01-07T12:00:00Z').getUTCDay()], 'Sol');
  assert.equal(REGENTE_POR_DIA[new Date('2024-01-08T12:00:00Z').getUTCDay()], 'Lua');
  assert.equal(REGENTE_POR_DIA[new Date('2024-01-09T12:00:00Z').getUTCDay()], 'Marte');
  assert.equal(REGENTE_POR_DIA[new Date('2024-01-10T12:00:00Z').getUTCDay()], 'Mercúrio');
  assert.equal(REGENTE_POR_DIA[new Date('2024-01-11T12:00:00Z').getUTCDay()], 'Júpiter');
  assert.equal(REGENTE_POR_DIA[new Date('2024-01-12T12:00:00Z').getUTCDay()], 'Vênus');
  assert.equal(REGENTE_POR_DIA[new Date('2024-01-13T12:00:00Z').getUTCDay()], 'Saturno');
});

// ---------------------------------------------------------------------------
// 2. O CÉU É CALCULADO, NÃO ESCRITO
// ---------------------------------------------------------------------------

test('o céu de datas de efeméride conhecidas bate com a realidade', () => {
  // As mesmas duas datas já validadas em test/lunarCalendar.test.js.
  assert.equal(ceuDoDia('2024-01-25').faseNome, 'Lua Cheia');
  assert.equal(ceuDoDia('2024-01-11').faseNome, 'Lua Nova');
});

test('data impossível não produz céu inventado — devolve indisponível', () => {
  assert.equal(ceuDoDia('2023-02-30'), null);
  const h = horoscopeFor('Áries', '2023-02-30');
  assert.equal(h.available, false);
  assert.deepEqual(h.blocks, []);
  assert.equal(h.facts, null);
  assert.equal(resumoDoDia('Áries', '2023-02-30'), null);
});

test('planetaRetrogrado concorda com isMercuryRetrograde de lib/signs.js', () => {
  // 15/abr/2024 cai num período retrógrado real de Mercúrio; 01/jun/2024 não.
  for (const dia of ['2024-04-15', '2024-06-01', '2024-08-20', '2024-12-01']) {
    assert.equal(
      planetaRetrogrado('Mercúrio', dia),
      isMercuryRetrograde(dia),
      `divergência em ${dia}: as duas definições precisam ser a mesma`
    );
  }
  assert.equal(planetaRetrogrado('Sol', '2024-04-15'), false, 'o Sol nunca retrograda');
  assert.equal(planetaRetrogrado('Lua', '2024-04-15'), false, 'a Lua nunca retrograda');
});

test('o aspecto do regente só usa os sete clássicos — nada de aspecto geracional', () => {
  const transpessoais = new Set(['Urano', 'Netuno', 'Plutão']);
  for (let i = 0; i < 40; i++) {
    const d = utc(2026, 1, 1 + i * 9);
    for (const signo of NOMES_SIGNOS) {
      const a = aspectoDoRegente(DOMICILIO_POR_SIGNO[signo], d.toISOString().slice(0, 10));
      if (!a) continue;
      assert.ok(!transpessoais.has(a.planetA) && !transpessoais.has(a.planetB), JSON.stringify(a));
      assert.equal(
        a.ptolomaico,
        a.aspectType !== 'Conjunção',
        'conjunção não é aspecto em Ptolomeu (Tetrabiblos I.24) e precisa entrar marcada'
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 3. FIM DO EFEITO BARNUM — as três exigências do dono, verificadas
// ---------------------------------------------------------------------------

test('dois signos diferentes recebem leituras diferentes no mesmo dia (os doze, distintos)', () => {
  for (const dia of [utc(2026, 2, 14), utc(2026, 5, 3), utc(2026, 8, 5), utc(2026, 11, 22)]) {
    const vistos = new Map();
    for (const signo of NOMES_SIGNOS) {
      const a = assinatura(signo, dia);
      const jaVisto = vistos.get(a);
      assert.equal(
        jaVisto,
        undefined,
        `${signo} e ${jaVisto} recebem a MESMA leitura em ${dia.toISOString().slice(0, 10)} — é o Barnum de volta`
      );
      vistos.set(a, signo);
    }
    assert.equal(vistos.size, 12);
  }
});

test('o texto de hoje difere do de amanhã, dia após dia, por um ano inteiro', () => {
  for (const signo of ['Áries', 'Câncer', 'Libra', 'Capricórnio']) {
    let anterior = null;
    let repetidos = 0;
    for (let i = 0; i < 365; i++) {
      const atual = assinatura(signo, utc(2026, 1, 1 + i));
      if (atual === anterior) repetidos++;
      anterior = atual;
    }
    assert.equal(
      repetidos,
      0,
      `${signo} repetiu a leitura em ${repetidos} pares de dias consecutivos de 2026`
    );
  }
});

test('a diferença entre dois dias tem MOTIVO REAL, e o motivo aparece escrito', () => {
  // Percorre um mês e confere que, sempre que a Lua troca de signo, o primeiro
  // bloco é justamente o que explica a troca — e que ele nomeia os dois signos.
  let trocasDeSigno = 0;
  for (let i = 1; i < 60; i++) {
    const hoje = utc(2026, 6, i);
    const ontem = utc(2026, 6, i - 1);
    const cHoje = ceuDoDia(hoje.toISOString().slice(0, 10));
    const cOntem = ceuDoDia(ontem.toISOString().slice(0, 10));
    if (!cHoje || !cOntem || cHoje.luaSigno === cOntem.luaSigno) continue;
    trocasDeSigno++;
    const h = horoscopeFor('Áries', hoje);
    assert.equal(h.blocks[0].id, 'change');
    const linha = h.blocks[0].lines[0];
    assert.equal(linha.key, 'horoscope.sky.change.moonSign');
    assert.equal(linha.vars.novo, cHoje.luaSigno);
    assert.equal(linha.vars.velho, cOntem.luaSigno);
  }
  assert.ok(trocasDeSigno >= 15, `esperava ~26 trocas de signo lunar em 60 dias, achei ${trocasDeSigno}`);
});

test('a leitura de um signo muda quando o regente dele muda de signo, e não antes', () => {
  // Marte rege Áries e leva ~6 semanas por signo. Ao longo de 2026, o bloco do
  // regente tem que mudar de conteúdo junto com Marte — nunca por sorteio.
  const porSignoDeMarte = new Map();
  for (let i = 0; i < 365; i += 3) {
    const dia = utc(2026, 1, 1 + i);
    const h = horoscopeFor('Áries', dia);
    const bloco = h.blocks.find((b) => b.id === 'ruler');
    assert.ok(bloco, 'Áries sempre tem bloco de regente');
    const posicao = bloco.lines.find((l) => l.key === 'horoscope.sky.ruler.position');
    assert.equal(
      posicao.vars.signoPlaneta,
      h.facts.signoDoRegente,
      'a posição escrita tem que ser a posição calculada, sempre'
    );
    const chaveDignidade = bloco.lines.find((l) => l.key.startsWith('horoscope.sky.ruler.dignity.'));
    const anterior = porSignoDeMarte.get(h.facts.signoDoRegente);
    if (anterior) {
      assert.equal(anterior, chaveDignidade.key, 'mesma posição de Marte = mesma dignidade, sempre');
    }
    porSignoDeMarte.set(h.facts.signoDoRegente, chaveDignidade.key);
  }
  assert.ok(
    porSignoDeMarte.size >= 5,
    `Marte precisa atravessar vários signos em 2026, achei ${porSignoDeMarte.size}`
  );
});

test('a mesma data devolve sempre a mesma leitura (determinístico, sem Math.random)', () => {
  const a = horoscopeFor('Virgem', utc(2026, 3, 10));
  const b = horoscopeFor('Virgem', utc(2026, 3, 10));
  assert.deepEqual(a, b);
});

// ---------------------------------------------------------------------------
// 4. NENHUMA FRASE AFIRMA POSIÇÃO PLANETÁRIA SEM CÁLCULO
// ---------------------------------------------------------------------------
// A prova é estrutural, e é a mais forte que dá pra fazer: se NENHUM template
// do dicionário contém nome de signo, então todo nome de signo que o leitor vê
// entrou por interpolação — e a única fonte de interpolação é a efeméride.
// Foi exatamente assim que `horoscope.reading.ontem.1` mentia: "A Lua minguante
// favoreceu o encerramento de ciclos" estava CRAVADO no dicionário, e saía em
// dia de Lua crescente.

function chavesSky(lang) {
  return Object.keys(_DICTS_FOR_TESTS[lang]).filter((k) => k.startsWith(SKY_PREFIX));
}

test('nenhum template do horóscopo crava nome de signo — todo signo chega calculado', () => {
  for (const lang of IDIOMAS) {
    for (const chave of chavesSky(lang)) {
      const valor = _DICTS_FOR_TESTS[lang][chave];
      for (const signo of NOMES_SIGNOS) {
        assert.ok(
          !valor.includes(signo),
          `${lang}/${chave} crava o signo "${signo}" no texto. Nome de signo só pode entrar por {interpolação} de valor calculado.`
        );
      }
    }
  }
});

test('nenhum template crava fase lunar fora da família de quarto (que é calculada)', () => {
  const FASES = ['Lua Cheia', 'Lua Nova', 'minguante', 'crescente', 'Minguante', 'Crescente',
    'Luna Llena', 'Luna Nueva', 'menguante', 'creciente', 'Menguante', 'Creciente',
    'Full Moon', 'New Moon', 'waning', 'waxing', 'Waning', 'Waxing'];
  for (const lang of IDIOMAS) {
    for (const chave of chavesSky(lang)) {
      // horoscope.sky.quarter* é selecionada PELO quarto calculado, então pode
      // (e deve) nomear os marcos que delimitam aquele quarto.
      if (chave.startsWith('horoscope.sky.quarter')) continue;
      const valor = _DICTS_FOR_TESTS[lang][chave];
      for (const fase of FASES) {
        assert.ok(
          !valor.includes(fase),
          `${lang}/${chave} afirma a fase "${fase}" num texto que não é escolhido pela fase calculada`
        );
      }
    }
  }
});

test('toda chave que o módulo pode produzir existe nos três idiomas', () => {
  const usadas = new Set();
  // Varre um ano inteiro com os doze signos: cobre todo quarto lunar, toda
  // dignidade, toda relação lunar, todo dia da semana, retrógrado e não
  // retrógrado, com e sem aspecto.
  for (let i = 0; i < 365; i += 2) {
    const dia = utc(2026, 1, 1 + i);
    for (const signo of NOMES_SIGNOS) {
      const h = horoscopeFor(signo, dia);
      if (!h.available) continue;
      for (const bloco of h.blocks) {
        usadas.add(bloco.titleKey);
        for (const l of bloco.lines) {
          usadas.add(l.key);
          if (!l.vars) continue;
          for (const v of Object.values(l.vars)) if (v && v.i18n) usadas.add(v.i18n);
        }
      }
    }
  }
  // As chaves que só a tela usa (fatos, rodapé, indisponível) entram à mão,
  // porque o módulo não as produz.
  for (const extra of [
    'horoscope.sky.unavailable',
    'horoscope.sky.factsTitle',
    'horoscope.sky.fact.moon',
    'horoscope.sky.fact.phase',
    'horoscope.sky.fact.dayRuler',
    'horoscope.sky.fact.illum',
    'horoscope.sky.footer.tropical',
    'horoscope.sky.footer.noScores',
  ]) {
    usadas.add(extra);
  }

  assert.ok(usadas.size > 45, `esperava a família inteira, varri só ${usadas.size} chaves`);
  const faltando = [];
  for (const lang of IDIOMAS) {
    for (const chave of usadas) {
      if (!_DICTS_FOR_TESTS[lang][chave]) faltando.push(`${lang}: ${chave}`);
    }
  }
  assert.deepEqual(faltando, [], `chaves ausentes:\n  ${faltando.join('\n  ')}`);
});

test('toda variável {…} do template recebe valor — nenhum {placeholder} vaza pra tela', () => {
  for (let i = 0; i < 365; i += 5) {
    const dia = utc(2026, 1, 1 + i);
    for (const signo of NOMES_SIGNOS) {
      const h = horoscopeFor(signo, dia);
      if (!h.available) continue;
      for (const bloco of h.blocks) {
        for (const l of bloco.lines) {
          for (const lang of IDIOMAS) {
            const tpl = _DICTS_FOR_TESTS[lang][l.key];
            const marcadores = (tpl.match(/\{([a-zA-Z]+)\}/g) || []).map((m) => m.slice(1, -1));
            for (const m of marcadores) {
              assert.ok(
                l.vars && Object.prototype.hasOwnProperty.call(l.vars, m),
                `${lang}/${l.key} pede {${m}} e o módulo não manda esse valor`
              );
            }
          }
        }
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 5. NADA DE NOTA, PORCENTAGEM OU SORTE — e nada de saúde
// ---------------------------------------------------------------------------

test('a tela não tem mais pool de frases, nota nem sorte sorteada', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'screens', 'HoroscopeScreen.js'),
    'utf8'
  );
  // Só a parte de código: os comentários EXPLICAM o que foi removido e citam os
  // nomes antigos de propósito, para quem for mexer entender por quê.
  const codigo = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');
  for (const proibido of ['READING_POOL', 'SCORE_POOL', 'LUCK_COLORS', 'LUCK_NUMBERS', 'LUCK_HOURS', 'ScoreBar', 'hashStr']) {
    assert.ok(!codigo.includes(proibido), `${proibido} voltou para screens/HoroscopeScreen.js`);
  }
  for (const chaveMorta of ['horoscope.reading.', 'horoscope.area.', 'horoscope.luck.']) {
    assert.ok(
      !codigo.includes(chaveMorta),
      `a tela voltou a usar ${chaveMorta}* — esse conteúdo é sorteado e não sai de cálculo nenhum`
    );
  }
});

test('nenhum texto do horóscopo dá porcentagem, exceto a iluminação real da Lua', () => {
  // phase_fraction é medida astronômica de verdade, calculada por
  // astronomy-engine. Qualquer OUTRO número percentual nesta família seria uma
  // nota inventada — o mesmo que o prompt do assistente do app proíbe.
  for (const lang of IDIOMAS) {
    for (const chave of chavesSky(lang)) {
      if (chave === 'horoscope.sky.fact.illum') continue;
      const valor = _DICTS_FOR_TESTS[lang][chave];
      assert.ok(
        !/\d\s*%/.test(valor) && !/\{pct\}/.test(valor),
        `${lang}/${chave} exibe porcentagem: "${valor}"`
      );
    }
  }
});

test('nenhum texto do horóscopo toca saúde, corpo, sono ou humor', () => {
  // Mesma linha vermelha de test/grounding.test.js e test/zodiacBody.test.js.
  //
  // A busca é por INÍCIO DE PALAVRA, não por substring solta: a primeira versão
  // deste teste usava includes() e acusou "produtora de secura" (Ptolomeu,
  // Tetrabiblos I.8) por conter "cura". Falso positivo desse tipo corrói a
  // confiança no teste até alguém desligá-lo — que é o pior desfecho possível
  // para um teste que existe para proteger a linha de saúde. Ficou por prefixo,
  // que ainda pega "curar", "curas" e "diagnóstico" sem pegar "secura".
  const PROIBIDO = [
    'saúde', 'salud', 'health', 'cura', 'curar', 'heal', 'tratamento', 'tratar',
    'remédio', 'remedio', 'medicine', 'sintoma', 'symptom', 'diagnóstic', 'diagnos',
    'ansiedade', 'ansiedad', 'anxiety', 'depress', 'insônia', 'insomnio', 'insomnia',
    'imunidade', 'inmunidad', 'immunity', 'cortisol', 'pressão arterial', 'blood pressure',
    'fertilidade', 'fertilidad', 'fertility', 'menstrua', 'gravidez', 'embarazo', 'pregnan',
  ];
  const LETRA = 'a-záàâãäéèêëíìîïóòôõöúùûüçñ';
  for (const lang of IDIOMAS) {
    for (const chave of chavesSky(lang)) {
      const valor = _DICTS_FOR_TESTS[lang][chave].toLowerCase();
      for (const palavra of PROIBIDO) {
        const re = new RegExp(`(^|[^${LETRA}])${palavra}`);
        assert.ok(
          !re.test(valor),
          `${lang}/${chave} usa "${palavra}" — o horóscopo não fala de saúde, nem por metáfora`
        );
      }
    }
  }
});

test('toda afirmação de tradição carrega a fonte — as famílias doutrinárias citam locus', () => {
  // As linhas que AFIRMAM doutrina precisam nomear onde ela está escrita. As de
  // fato calculado (posição, mudança, rótulos) não precisam, porque não afirmam
  // tradição nenhuma.
  const LOCUS = ['Tetrabiblos', 'Anthologiae', 'Naturalis Historia', 'Opus Agriculturae',
    'De Agri Cultura', 'Columela', 'Columella', 'Dião Cássio', 'Dión Casio', 'Cassius Dio',
    'Rudhyar', 'Ptolomeu', 'Ptolomeo', 'Ptolemy', 'Valens'];
  const FAMILIAS = ['horoscope.sky.ruler.dignity.', 'horoscope.sky.moon.rel.',
    'horoscope.sky.moon.dignity.', 'horoscope.sky.quarter.', 'horoscope.sky.retro.'];
  for (const lang of IDIOMAS) {
    for (const chave of chavesSky(lang)) {
      if (!FAMILIAS.some((f) => chave.startsWith(f))) continue;
      if (chave.startsWith('horoscope.sky.quarterShort.')) continue;
      const valor = _DICTS_FOR_TESTS[lang][chave];
      assert.ok(
        LOCUS.some((l) => valor.includes(l)),
        `${lang}/${chave} afirma tradição sem dizer de onde ela vem`
      );
    }
  }
});

test('o resumo do Diário sai do céu calculado, não de frase pronta', () => {
  const r = resumoDoDia('Áries', utc(2024, 1, 25));
  assert.ok(r.includes('Lua Cheia'), r);
  assert.ok(r.includes('Lua em '), r);
  assert.ok(r.includes('Marte (regente de Áries)'), r);
  // Dois signos com regentes diferentes produzem resumos diferentes no mesmo dia.
  assert.notEqual(r, resumoDoDia('Gêmeos', utc(2024, 1, 25)));
});
