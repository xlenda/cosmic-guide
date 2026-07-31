// test/emocoesIdiomas.test.js — os três idiomas da entrada por emoção.
//
// A tela "Como você tá?" é uma PORTA: a pessoa diz como está e o app aponta a
// leitura que cobre aquele assunto. Traduzir uma porta é mais delicado do que
// traduzir conteúdo, porque o texto aqui imita FALA — e fala mal traduzida
// vira formulário. As cinco leis deste arquivo:
//
//   1. O PT É OURO. test/golden/emocoes.pt.golden.json foi capturado RODANDO
//      lib/emocoes.js antes da extração dos packs (mais o chrome PT que morava
//      dentro de screens/ComoVoceTaScreen.js). `lang='pt'` e a chamada SEM
//      lang têm que devolver exatamente aquilo, byte a byte. Texto PT que
//      mudou é falha, nunca melhoria — e para 'pt' o motor devolve a PRÓPRIA
//      referência das tabelas, que é a prova mais forte de que o caminho
//      antigo não passou pelo refactor.
//
//   2. PARIDADE E FORMA. Os packs es/en têm as mesmas chaves do pack pt
//      (derivado das tabelas), nenhum valor vazio, e o que NÃO é texto — id,
//      emoji, destino, rota, abaPai, ordem — sobrevive idêntico. Em especial:
//      trocar de idioma não pode mover um botão de lugar. O alvo de navegação
//      é comparado nos três. E o nome que a ponte CITA — a prateleira dos
//      Rituais, o nome da feature — é conferido contra lib/i18n.js no idioma:
//      uma porta que manda pro "estante de Limpieza" num app que chama aquilo
//      de outra coisa manda a pessoa procurar o que não existe.
//
//   3. A FALA É DESABAFO, NÃO FORMULÁRIO. Esta é a lei que o briefing pede em
//      letras maiúsculas e a única que não sai de graça da paridade: "Tô
//      ansiosa com o futuro" vira "I keep worrying about what's next", nunca
//      "I am anxious about the future". A régua testável é a abertura de
//      cópula formal — "Estou/Estoy/I am" é ficha de cadastro; "Tô/Me tiene/
//      I keep" é gente falando. O teste reprova a formal e prova, com as
//      frases-robô do próprio briefing, que reprovaria mesmo.
//
//   4. A PONTE É DE ASSUNTO, NOS TRÊS. A ponte diz o que a leitura COBRE,
//      jamais o que ela faz com a pessoa. Por isso "ajudar/ayudar/help" é
//      linha vermelha aqui e não era nas outras bibliotecas: "isso ajuda com o
//      que você tá sentindo" é exatamente a ponte de tratamento que esta tela
//      não faz.
//
//   5. LINHA VERMELHA TRILÍNGUE. Saúde, promessa, mecanismo, sofrimento
//      pesado, a palavra banida por docs/tradicao/06 §2 e afirmação histórica:
//      varridos em pt, es E en. As varreduras são testadas dos dois lados —
//      MORDEM a frase proibida e NÃO mordem o vocabulário legítimo da feature
//      (senão viram ruído e alguém as desliga).
//
// A ASSIMETRIA DE PROPÓSITO, porque ela parece bug e não é: a pessoa PODE se
// dizer ansiosa — é o estado dela, dito por ela, e calar isso mataria a
// mecânica inteira da tela. Por isso a varredura pega o SUBSTANTIVO clínico
// ("ansiedade", "ansiedad", "anxiety") e deixa passar o adjetivo com que a
// pessoa se descreve. Quem trata é a RESPOSTA do app, e é a resposta que está
// sob vigilância aqui.
//
// Falha aqui = não publica.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { ROUTES } = require('../routes.js');
const {
  ESTADOS,
  DESTINOS,
  CHROME_TELA,
  packDeTextos,
  estadosParaIdioma,
  destinosParaIdioma,
  chromeDaTela,
  estadoPorId,
  destinoDe,
  alvoDeNavegacao,
  textosVisiveis,
} = require('../lib/emocoes.js');

const RAIZ = path.join(__dirname, '..');
const TELA = fs.readFileSync(path.join(RAIZ, 'screens', 'ComoVoceTaScreen.js'), 'utf8');

// O CÓDIGO da tela, sem os comentários. Existe porque o cabeçalho da tela
// PRECISA poder citar CHROME_TELA e ESTADOS pelo nome pra explicar por que ela
// não os usa — mesma razão de test/emocoes.test.js olhar o import e não a
// prosa. Varrer o arquivo cru transformaria a documentação em erro.
function semComentarios(src) {
  let out = '';
  let i = 0;
  let aspas = null; // ' " ` quando dentro de string
  while (i < src.length) {
    const c = src[i];
    const d = src[i + 1];
    if (aspas) {
      if (c === '\\') {
        out += c + (d || '');
        i += 2;
        continue;
      }
      if (c === aspas) aspas = null;
      out += c;
      i += 1;
      continue;
    }
    if (c === '/' && d === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (c === '/' && d === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') aspas = c;
    out += c;
    i += 1;
  }
  return out;
}

const TELA_CODIGO = semComentarios(TELA);
const GOLDEN = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden', 'emocoes.pt.golden.json'), 'utf8'));

const IDIOMAS_NOVOS = ['es', 'en'];
const TODOS = ['pt', ...IDIOMAS_NOVOS];

// Todos os textos de um pack, achatados em [chave, valor] — arrays viram
// índice na chave, então a paridade de contagem de pontes sai de graça.
function achatar(obj, prefixo = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const chave = prefixo ? `${prefixo}.${k}` : k;
    if (v && typeof v === 'object') achatar(v, chave, out);
    else out.push([chave, v]);
  }
  return out;
}

function placeholders(s) {
  return (String(s).match(/\{[a-zA-Z0-9_]+\}/g) || []).sort();
}

// ===========================================================================
// 1. OURO — o PT de hoje é o PT de ontem, byte a byte
// ===========================================================================

test('OURO: textosVisiveis() em PT é idêntico ao capturado antes do refactor', () => {
  for (const lang of [undefined, 'pt']) {
    const rotulo = lang === undefined ? 'sem lang' : "lang='pt'";
    const atual = lang === undefined ? textosVisiveis() : textosVisiveis(lang);
    assert.equal(
      atual.length,
      GOLDEN.textosVisiveis.length,
      `${rotulo}: a lista de textos visíveis mudou de tamanho`
    );
    for (let i = 0; i < GOLDEN.textosVisiveis.length; i += 1) {
      const [chaveG, textoG] = GOLDEN.textosVisiveis[i];
      const [chaveA, textoA] = atual[i];
      assert.equal(chaveA, chaveG, `${rotulo}: a chave ${i} mudou`);
      assert.equal(
        textoA,
        textoG,
        `${rotulo}: O TEXTO PT MUDOU em ${chaveG}. É exatamente o que o refactor de idiomas proíbe — ` +
          'compare com test/golden/emocoes.pt.golden.json antes de qualquer outra coisa.'
      );
    }
  }
});

test('OURO: as tabelas ESTADOS e DESTINOS conferem inteiras contra a captura', () => {
  assert.deepEqual(
    ESTADOS.map((e) => ({
      id: e.id,
      emoji: e.emoji,
      fala: e.fala,
      pontes: e.pontes.map((p) => ({ destino: p.destino, texto: p.texto })),
    })),
    GOLDEN.estados,
    'ESTADOS divergiu do golden'
  );
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(DESTINOS).map(([id, d]) => [
        id,
        d.abaPai === undefined
          ? { rotulo: d.rotulo, botao: d.botao, rota: d.rota }
          : { rotulo: d.rotulo, botao: d.botao, rota: d.rota, abaPai: d.abaPai },
      ])
    ),
    GOLDEN.destinos,
    'DESTINOS divergiu do golden'
  );
});

test('OURO: o chrome da tela em PT confere — as quatro frases mudaram de casa, não de conteúdo', () => {
  // Elas viviam como constantes locais dentro de screens/ComoVoceTaScreen.js e
  // vieram pra CHROME_TELA sem um caractere de diferença.
  assert.deepEqual(CHROME_TELA, GOLDEN.chromeTela, 'CHROME_TELA divergiu do golden');
  assert.deepEqual(chromeDaTela(), GOLDEN.chromeTela, 'chromeDaTela() sem lang divergiu');
  assert.deepEqual(chromeDaTela('pt'), GOLDEN.chromeTela, "chromeDaTela('pt') divergiu");
});

test('OURO: os alvos de navegação conferem contra a captura', () => {
  const atual = {};
  for (const id of Object.keys(DESTINOS)) atual[id] = alvoDeNavegacao(destinoDe(id));
  assert.deepEqual(atual, GOLDEN.alvos, 'algum destino passou a navegar pra outro lugar');
});

test('OURO: o caminho PT é IDENTIDADE — mesma referência, não cópia', () => {
  // A garantia mais forte de que o PT não passou pelo refactor: para 'pt' (e
  // para idioma desconhecido) o motor devolve as PRÓPRIAS tabelas.
  assert.equal(estadosParaIdioma(), ESTADOS);
  assert.equal(estadosParaIdioma('pt'), ESTADOS);
  assert.equal(estadosParaIdioma('fr'), ESTADOS, 'idioma desconhecido não caiu em PT');
  assert.equal(destinosParaIdioma(), DESTINOS);
  assert.equal(destinosParaIdioma('pt'), DESTINOS);
  assert.equal(destinosParaIdioma('fr'), DESTINOS, 'idioma desconhecido não caiu em PT');
  assert.equal(chromeDaTela('fr'), CHROME_TELA, 'idioma desconhecido não caiu em PT');

  for (const e of ESTADOS) {
    assert.equal(estadoPorId(e.id), e, `${e.id}: estadoPorId sem lang deixou de ser a própria referência`);
    assert.equal(estadoPorId(e.id, 'pt'), e, `${e.id}: estadoPorId('pt') deixou de ser a própria referência`);
  }
  for (const id of Object.keys(DESTINOS)) {
    assert.equal(destinoDe(id), DESTINOS[id], `${id}: destinoDe sem lang deixou de ser a própria referência`);
    assert.equal(destinoDe(id, 'pt'), DESTINOS[id], `${id}: destinoDe('pt') deixou de ser a própria referência`);
  }
  assert.equal(estadoPorId('nao-existe', 'en'), null, 'estado inexistente tem que dar null em qualquer idioma');
  assert.equal(destinoDe('nao-existe', 'en'), null, 'destino inexistente tem que dar null em qualquer idioma');
});

// ===========================================================================
// 2. PARIDADE E FORMA
// ===========================================================================

test('os packs es e en têm exatamente as mesmas chaves do pack pt', () => {
  const chavesPt = achatar(packDeTextos('pt')).map(([k]) => k).sort();
  for (const lang of IDIOMAS_NOVOS) {
    const pack = packDeTextos(lang);
    assert.ok(pack, `packDeTextos('${lang}') não existe`);
    assert.deepEqual(
      achatar(pack).map(([k]) => k).sort(),
      chavesPt,
      `chaves do pack ${lang} divergem do pt — estado, ponte ou destino faltando/sobrando`
    );
  }
  assert.equal(packDeTextos('fr'), null, 'idioma sem pack tem que devolver null, não um pack vazio');
});

test('nenhum valor vazio e nenhum placeholder divergente em nenhum idioma', () => {
  const pt = new Map(achatar(packDeTextos('pt')));
  for (const lang of TODOS) {
    for (const [chave, valor] of achatar(packDeTextos(lang))) {
      assert.equal(typeof valor, 'string', `${lang}:${chave} não é string`);
      assert.ok(valor.trim().length > 0, `${lang}:${chave} está vazio`);
      assert.deepEqual(
        placeholders(valor),
        placeholders(pt.get(chave)),
        `${lang}:${chave} tem placeholders diferentes do pt`
      );
    }
  }
});

test('a estrutura localizada preserva tudo que NÃO é texto', () => {
  for (const lang of IDIOMAS_NOVOS) {
    const locais = estadosParaIdioma(lang);
    assert.deepEqual(
      locais.map((e) => e.id),
      ESTADOS.map((e) => e.id),
      `${lang}: ids ou ordem dos estados mudaram`
    );
    for (let i = 0; i < ESTADOS.length; i += 1) {
      const pt = ESTADOS[i];
      const loc = locais[i];
      assert.equal(loc.emoji, pt.emoji, `${lang} ${pt.id}: o emoji mudou com o idioma`);
      assert.deepEqual(
        loc.pontes.map((p) => p.destino),
        pt.pontes.map((p) => p.destino),
        `${lang} ${pt.id}: a ponte passou a apontar pra outro destino`
      );
    }

    const dest = destinosParaIdioma(lang);
    assert.deepEqual(Object.keys(dest), Object.keys(DESTINOS), `${lang}: ids dos destinos mudaram`);
    for (const [id, d] of Object.entries(DESTINOS)) {
      assert.equal(dest[id].rota, d.rota, `${lang} ${id}: a ROTA mudou com o idioma`);
      assert.equal(dest[id].abaPai, d.abaPai, `${lang} ${id}: a abaPai mudou com o idioma`);
    }
  }
});

test('trocar de idioma NUNCA move um botão de lugar', () => {
  // O texto do botão muda; o lugar aonde ele leva, não. Esta é a asserção que
  // permite a tela navegar pela tabela canônica sem passar `lang`.
  for (const id of Object.keys(DESTINOS)) {
    const base = alvoDeNavegacao(destinoDe(id, 'pt'));
    for (const lang of IDIOMAS_NOVOS) {
      assert.deepEqual(
        alvoDeNavegacao(destinoDe(id, lang)),
        base,
        `${lang} ${id}: o alvo de navegação mudou com o idioma`
      );
    }
  }
  // E o Tarô, único fora da aba da Home, continua marcado nos três.
  for (const lang of TODOS) {
    assert.deepEqual(alvoDeNavegacao(destinoDe('taro', lang)), { viaAbaPai: true, nome: ROUTES.TAROT_TAB });
  }
});

test('a fala continua cabendo num chip, e a ponte continua tendo corpo, nos três idiomas', () => {
  for (const lang of TODOS) {
    for (const e of estadosParaIdioma(lang)) {
      assert.ok(e.fala.trim().length >= 8, `${lang} ${e.id}: fala curta demais`);
      assert.ok(e.fala.length <= 60, `${lang} ${e.id}: fala longa demais pra um chip (${e.fala.length} chars)`);
      for (const p of e.pontes) {
        assert.ok(
          p.texto.trim().length >= 40,
          `${lang} ${e.id} → ${p.destino}: ponte curta demais pra descrever o que a leitura cobre`
        );
      }
    }
    for (const [id, d] of Object.entries(destinosParaIdioma(lang))) {
      assert.ok(d.rotulo.trim().length > 0, `${lang} ${id}: sem rótulo`);
      assert.ok(d.botao.trim().length > 0, `${lang} ${id}: sem texto de botão`);
    }
    const t = chromeDaTela(lang);
    for (const k of ['titulo', 'subtitulo', 'intro', 'overlinePontes']) {
      assert.ok(t[k] && t[k].trim().length > 0, `${lang}: chrome sem ${k}`);
    }
  }
});

// O português vaza de três jeitos, e os três têm cara diferente: o acento que
// só existe em PT, a palavra que se parece com a espanhola mas não é, e a
// linha que ninguém traduziu (ficou o PT inteiro). Um detector só pega um
// terço — "Dividida entre duas pessoas" não tem ã, õ nem ç e passaria batido.
const CARA_DE_PORTUGUES = [
  /[ãõç]/i,
  /\bvoc[êe]\b/i,
  /\bduas\b/i,
  /\bpessoas?\b/i,
  /\bassunto\b/i,
  /\bleitura\b/i,
  /\bsonhos?\b/i,
  /\bc[ée]u\b/i,
  /\bhoje\b/i,
  /\bmuito\b/i,
  /\bdinheiro\b/i,
  /\bpra\b/i,
  /\bcom\b/i, // PT "com"; o espanhol é "con" e o inglês não tem a palavra
  /\bt[ô]\b/i, // "Tô" — com circunflexo, senão pegaria o "to" do inglês
  /\bdiário\b/i, // COM acento agudo: "Diario Cósmico" é o espanhol CERTO
];

test('nenhum texto es/en vazou português — acento, palavra parecida ou linha inteira', () => {
  const vazados = [];
  for (const lang of IDIOMAS_NOVOS) {
    for (const [chave, valor] of achatar(packDeTextos(lang))) {
      for (const re of CARA_DE_PORTUGUES) {
        const m = String(valor).match(re);
        if (m) vazados.push(`${lang}:${chave} → "${m[0]}" em ${JSON.stringify(valor)}`);
      }
    }
  }
  assert.deepEqual(vazados, [], `texto com cara de português nos packs:\n${vazados.join('\n')}`);
});

test('nenhum valor es/en é uma CÓPIA do pt — linha não traduzida é linha esquecida', () => {
  // Hoje não há um único valor igual ao PT nos dois packs, e não deve haver:
  // não existe termo intraduzível nesta biblioteca (a porta não cita obra nem
  // locus, de propósito). Se um dia existir, esta é a asserção que obriga a
  // decisão a ser consciente em vez de acidental.
  const pt = new Map(achatar(packDeTextos('pt')));
  const copiados = [];
  for (const lang of IDIOMAS_NOVOS) {
    for (const [chave, valor] of achatar(packDeTextos(lang))) {
      if (valor === pt.get(chave)) copiados.push(`${lang}:${chave} → ${JSON.stringify(valor)}`);
    }
  }
  assert.deepEqual(copiados, [], `valor colado do pt sem tradução:\n${copiados.join('\n')}`);
});

test('o detector de português MORDE — inclusive o vazamento sem acento', () => {
  const VAZAMENTOS = [
    'Dividida entre duas pessoas', // o buraco real: nenhum ã, õ ou ç
    'Tô ansiosa com o futuro',
    'A leitura de compatibilidade nomeia a relação',
    'O horóscopo de hoje descreve o céu do seu dia',
    'pra onde o assunto aponta',
    'um tema só de dinheiro',
    'a leitura de sonhos parte da imagem',
  ];
  for (const frase of VAZAMENTOS) {
    assert.ok(
      CARA_DE_PORTUGUES.some((re) => re.test(frase)),
      `o detector deixou passar português puro: "${frase}"`
    );
  }
  // E não pode acusar espanhol nem inglês legítimos destes packs.
  const LEGITIMOS = [
    'La lectura de sueños parte de la imagen que quedó',
    'El horóscopo de hoy describe el cielo de tu día, para tu signo',
    'Dividida entre dos personas',
    'El tarot tiene un tema solo de dinero',
    "Today's horoscope describes the sky over your day, for your sign",
    'The dream reading starts from the image that stayed with you',
    'Torn between two people',
    'El diario guarda lo que extrañas, con fecha', // "diario"/"con" em espanhol são o espanhol certo
    'Escribir en el Diario Cósmico',
  ];
  for (const frase of LEGITIMOS) {
    const pego = CARA_DE_PORTUGUES.find((re) => re.test(frase));
    assert.equal(pego, undefined, `falso positivo de "português" em "${frase}" pela regra ${pego}`);
  }
});

// ---------------------------------------------------------------------------
// A porta tem que apontar pra um nome que existe DAQUELE lado
// ---------------------------------------------------------------------------
// Este é o bug que só aparece traduzido: a ponte diz "no estante de Limpieza
// de los Rituales" e o app espanhol chama aquela prateleira de outra coisa. A
// pessoa abre os Rituais e procura um nome que não está lá. Os packs de
// emoções afirmam, no cabeçalho, herdar a terminologia de lib/i18n.js — esta é
// a asserção que cobra a afirmação. (A tela não importa i18n; o teste, sim: o
// contrato é entre as duas bibliotecas, e é aqui que ele se prova.)
const { translate } = require('../lib/i18n.js');

// O nome da prateleira tem que aparecer SOZINHO, grudado no conector do
// idioma. Só procurar o nome solto no meio da frase deixaria passar "estante
// de Limpieza Profunda", que cita uma prateleira que não existe usando o nome
// de uma que existe. Se um dia a ponte for reescrita com outro conector, é
// aqui que se atualiza — o que o teste protege é o nome ficar intacto, não a
// frase ficar congelada.
const CONECTOR_DA_PRATELEIRA = {
  pt: (nome) => `prateleira de ${nome} dos Rituais`,
  es: (nome) => `estante de ${nome} de los Rituales`,
  en: (nome) => `${nome} shelf`,
};

test('as prateleiras citadas nas pontes existem com ESSE nome em cada idioma', () => {
  const CITACOES = [
    ['saudadeDeAlguem', 0, 'rituais.cat.amor'],
    ['querendoRecomecar', 1, 'rituais.cat.limpeza'],
    ['granaApertada', 1, 'rituais.cat.prosperidade'],
  ];
  for (const lang of TODOS) {
    for (const [estadoId, i, chave] of CITACOES) {
      const nome = translate(lang, chave);
      assert.notEqual(nome, chave, `${lang}: a chave ${chave} sumiu de lib/i18n.js`);
      const esperado = CONECTOR_DA_PRATELEIRA[lang](nome);
      const ponte = estadoPorId(estadoId, lang).pontes[i].texto;
      assert.ok(
        ponte.includes(esperado),
        `${lang} ${estadoId}: a ponte não cita "${esperado}" — os Rituais não têm essa prateleira com esse nome.\n  ${JSON.stringify(ponte)}`
      );
    }
  }
});

test('o rótulo do destino é o nome que o app dá à feature, no mesmo idioma', () => {
  // Só os quatro cujo rótulo é o nome do produto inteiro. Os outros cinco são
  // expansões descritivas de propósito ("Horóscopo do dia", "Leitura de
  // sonhos") ou não têm uma chave única em lib/i18n.js — cobrar igualdade
  // neles seria cobrar uma coisa que o desenho não promete.
  const IGUAIS = [
    ['rituais', 'home.card.rituais.title'],
    ['aterramento', 'home.card.grounding.title'],
    ['diario', 'home.card.diary.title'],
    ['jornada', 'home.card.jornada.title'],
  ];
  for (const lang of TODOS) {
    for (const [id, chave] of IGUAIS) {
      const esperado = translate(lang, chave);
      assert.notEqual(esperado, chave, `${lang}: a chave ${chave} sumiu de lib/i18n.js`);
      assert.equal(
        destinoDe(id, lang).rotulo,
        esperado,
        `${lang} ${id}: a porta chama a feature de um jeito e o app, de outro`
      );
    }
  }
});

// ===========================================================================
// 3. A FALA É DESABAFO, NÃO FORMULÁRIO
// ===========================================================================
// A régua: abertura de cópula FORMAL é ficha de cadastro. "Estou ansiosa" é o
// que se escreve num formulário; "Tô ansiosa" é o que se diz pra uma amiga —
// e o app inteiro nasceu do segundo. O PT canônico já respeita isso (usa "Tô",
// nunca "Estou"), então a régua não é invenção da tradução: é o padrão do PT
// cobrado também de es e en.

const ABERTURA_DE_FORMULARIO = {
  pt: [/^\s*(eu\s+)?estou\s/i, /^\s*(eu\s+)?me\s+sinto\s/i, /^\s*(eu\s+)?tenho\s+sentido\s/i],
  es: [/^\s*(yo\s+)?estoy\s/i, /^\s*(yo\s+)?me\s+siento\s/i, /^\s*(yo\s+)?tengo\s+ansiedad\b/i],
  en: [/^\s*i\s+am\s/i, /^\s*i\s+feel\s/i, /^\s*i\s+am\s+feeling\s/i],
};

test('NENHUMA fala abre como formulário — nos três idiomas', () => {
  const violacoes = [];
  for (const lang of TODOS) {
    for (const e of estadosParaIdioma(lang)) {
      for (const re of ABERTURA_DE_FORMULARIO[lang]) {
        if (re.test(e.fala)) violacoes.push(`${lang} ${e.id}: ${JSON.stringify(e.fala)} (${re})`);
      }
    }
  }
  assert.deepEqual(
    violacoes,
    [],
    'A fala é desabafo, não campo de cadastro — "Tô ansiosa com o futuro", nunca ' +
      '"Estou ansiosa com o futuro":\n' + violacoes.join('\n')
  );
});

test('a régua do desabafo MORDE — as frases-robô do briefing seriam reprovadas', () => {
  const ROBO = {
    pt: ['Estou ansiosa com o futuro', 'Eu estou ansiosa com o futuro', 'Me sinto ansiosa com o futuro'],
    es: ['Estoy ansiosa por el futuro', 'Yo estoy ansiosa por el futuro', 'Me siento ansiosa por el futuro'],
    en: ['I am anxious about the future', 'I feel anxious about the future', 'I am feeling anxious'],
  };
  for (const lang of TODOS) {
    for (const frase of ROBO[lang]) {
      assert.ok(
        ABERTURA_DE_FORMULARIO[lang].some((re) => re.test(frase)),
        `a régua ${lang} deixaria passar a frase-robô: "${frase}"`
      );
    }
  }
  // E não pode reprovar a fala de gente: as falas reais dos três packs já
  // passaram no teste acima, mas estas são as construções coloquiais que a
  // régua tem que aceitar de propósito.
  const GENTE = {
    pt: ['Tô ansiosa com o futuro', 'Cabeça cheia, pensamento que não desliga'],
    es: ['Me tiene inquieta lo que viene', 'La cabeza a mil, pensamientos que no paran'],
    en: ["I keep worrying about what's next", "I'm already dreaming big", "My mind won't shut off"],
  };
  for (const lang of TODOS) {
    for (const frase of GENTE[lang]) {
      const pego = ABERTURA_DE_FORMULARIO[lang].find((re) => re.test(frase));
      assert.equal(pego, undefined, `${lang}: a régua reprovou fala de gente — "${frase}" por ${pego}`);
    }
  }
});

test('a fala não termina em ponto final nem carrega dois-pontos — chip é fala, não rótulo de campo', () => {
  for (const lang of TODOS) {
    for (const e of estadosParaIdioma(lang)) {
      assert.ok(!/\.\s*$/.test(e.fala), `${lang} ${e.id}: fala terminando em ponto final`);
      assert.ok(!e.fala.includes(':'), `${lang} ${e.id}: dois-pontos em fala é cara de formulário`);
    }
  }
});

// ===========================================================================
// 4. LINHA VERMELHA TRILÍNGUE
// ===========================================================================
// PT herdado literalmente de test/emocoes.test.js (que continua sendo o dono
// do PT); es e en são os primos de cada lista. Observe a ausência deliberada
// de /ansios/, /ansios[oa]/ e /anxious/: o SUBSTANTIVO clínico é proibido, o
// adjetivo com que a pessoa se descreve é a mecânica da tela.

const LINHA_VERMELHA = {
  pt: {
    saude: [
      /\bcur(a|ar|as|am|ativ)/i,
      /\btrata(r|mento)?\b/i,
      /\bansiedade\b/i,
      /\bdepress(ão|ao|iva|ivo)\b/i,
      /\bins[oô]nia\b/i,
      /\bterap[eê]utic/i,
      /\bterapia\b/i,
      /\brem[ée]dio\b/i,
      /\bsono\b/i,
      /\bdormir\b/i,
      /\bestresse\b/i,
      /\brelaxa/i,
      /\bacalm/i,
      /\btranquiliza/i,
      /\balivi(a|ar|o)\b/i,
      /\bharmoniza/i,
      /\bequilibra\b/i,
      /\bbem-estar\b/i,
      /\bsa[uú]de\b/i,
      /\bsistema nervoso\b/i,
      /\benergiza/i,
      /\bfaz bem\b/i,
      /\bse sentir melhor\b/i,
      /\besvazi(a|e|ar) a mente\b/i,
    ],
    promessa: [
      /\batra(i|ir|em|irá|ia)\b/i,
      /\bgarant(e|em|ia|ias|ido|ida|ir)\b/i,
      /\bpromet(e|em|er|ido)\b/i,
      /\bfaz acontecer\b/i,
      /\bmanifesta(r|ção)?\b/i,
      /\babre caminhos?\b/i,
      /\bafasta\b/i,
      /\bprotege\b/i,
      /\bblinda\b/i,
      /\belimina\b/i,
      /\bpoderos[oa]\b/i,
      /\bd[áa] sorte\b/i,
      /\btraz sorte\b/i,
      /\bvai dar certo\b/i,
      /\bvai (se sentir|sentir|ficar|melhorar)\b/i,
      /\bmuda (a )?sua vida\b/i,
    ],
    mecanismo: [
      /\benergia (negativa|positiva|ruim|pesada)\b/i,
      /\benerg[ée]tic/i,
      /\bvibra[çc][ãa]o\b/i,
      /\baura\b/i,
      /\bchakra/i,
      /\bmau-olhado\b/i,
      /\bpurifica/i,
      /\bdescarreg(a|ar)\b/i,
    ],
    // O bloco próprio DESTA tela: a ponte de tratamento na forma mais mansa.
    tratamento: [/\bajud(a|e|o|ar|am|ando)\b/i, /\bmelhor(a|e|ar|am|ando)\b/i, /\balivi/i, /\bconforto\b/i, /\bconsol(a|o|ar)\b/i],
    pesado: [/\bluto\b/i, /desesper/i, /depress/i, /suicid/i, /\bp[âa]nico\b/i, /\bmorte\b/i, /\bmorrer\b/i, /automutila/i, /n[ãa]o aguento( mais)?/i, /\bsem sa[íi]da\b/i],
    banida: [/\bcigan\w*/iu],
    historia: [/s[ée]c\./i, /\bs[ée]culo\b/i, /\b(1[0-9]{3}|20[0-9]{2})\b/],
  },
  es: {
    saude: [
      /\bcur(a|ar|e|en|ación|ativ)/i,
      /\btrat(a|ar|e|en|amiento)\b/i,
      /\bsan(a|ar|e|en)\b/i,
      /\bansiedad\b/i,
      /\bdepresi[óo]n\b/i,
      /\binsomnio\b/i,
      /\bterap/i,
      /\bsue[ñn]o\b/i,
      /\bdormir\b/i,
      /\bestr[eé]s\b/i,
      /\brelaj/i,
      /\bcalm(a|ar|e|en|ante)\b/i,
      /\btranquiliz/i,
      /\balivi(a|ar|e|en|o)\b/i,
      /\barmoniz/i,
      /\bequilibr(a|ar|e|en)\b/i,
      /\bbienestar\b/i,
      /\bsalud\b/i,
      /\bsistema nervioso\b/i,
      /\benergiz/i,
      /\bhace bien\b/i,
      /\bsentirte mejor\b/i,
      /\bvaciar la mente\b/i,
    ],
    promessa: [
      /\batrae(r|rá|rán)?\b/i,
      /\bgarantiz/i,
      /\bpromet(e|en|er|ido)\b/i,
      /\bhace que (pase|suceda)\b/i,
      /\bmanifest(ar|ación|iesta)\b/i,
      /\babre caminos?\b/i,
      /\baleja\b/i,
      /\bprotege\b/i,
      /\bblinda\b/i,
      /\belimina\b/i,
      /\bpoderos[oa]s?\b/i,
      /\bda suerte\b/i,
      /\btrae suerte\b/i,
      /\bva a (salir bien|funcionar)\b/i,
      /\bvas a (sentirte|estar|mejorar)\b/i,
      /\bcambia (tu|la) vida\b/i,
    ],
    mecanismo: [
      /\benergía (negativa|positiva|mala|pesada|vital)\b/i,
      /\benerg[ée]tic/i,
      /\bvibraci[óo]n\b/i,
      /\baura\b/i,
      /\bchakra/i,
      /\bmal de ojo\b/i,
      /\bpurific/i,
      /\bdescarg(a|ar) (la|las) energ/i,
    ],
    tratamento: [/\bayud(a|e|o|ar|an|ando)\b/i, /\bmejor(a|e|ar|an|ando)\b/i, /\balivi/i, /\bconsuelo\b/i, /\bconsol(a|ar|e)\b/i, /\bconfort/i],
    pesado: [/\bduelo\b/i, /desesper/i, /depresi/i, /suicid/i, /\bp[áa]nico\b/i, /\bmuerte\b/i, /\bmorir\b/i, /automutil/i, /no aguanto m[áa]s/i, /\bsin salida\b/i],
    banida: [/\bgitan\w*/iu],
    historia: [/\bsiglo\b/i, /\bs\.\s?[ivxlc]+\b/i, /\b(1[0-9]{3}|20[0-9]{2})\b/],
  },
  en: {
    saude: [
      /\bcure(s|d)?\b/i,
      /\bcurative\b/i,
      /\btreat(s|ed|ing|ment)?\b/i,
      /\bheal(s|ing|ed|er)?\b/i,
      /\bhealth\b/i,
      /\banxiety\b/i,
      /\bdepression\b/i,
      /\binsomnia\b/i,
      /\btherap/i,
      /\bsleep\b/i,
      /\bstress\b/i,
      /\brelax/i,
      /\brelie(ve|ves|ved|f)\b/i,
      /\bsooth/i,
      /\bcalm/i,
      /\bwell-?being\b/i,
      /\bimmun/i,
      /\bnervous system\b/i,
      /\benergi[sz]e/i,
      /\bgood for you\b/i,
      /\bfeel(s|ing)? better\b/i,
      /\bempty(ing)? your mind\b/i,
    ],
    promessa: [
      /\battract(s|ing|ed)?\b/i,
      /\bguarantee/i,
      /\bpromises?\b/i,
      /\bmakes? it happen\b/i,
      /\bmanifest/i,
      /\bopens? (up )?(new )?paths?\b/i,
      /\bwards? off\b/i,
      /\bprotects?\b/i,
      /\bshields?\b/i,
      /\beliminates?\b/i,
      /\bpowerful\b/i,
      /\bbrings? (you )?luck\b/i,
      /\bwill (work out|be fine|attract|bring|change|fix|improve)\b/i,
      /\byou will (feel|be|get)\b/i,
      /\bchanges? your life\b/i,
    ],
    mecanismo: [
      /\b(negative|positive|bad|heavy|vital) energy\b/i,
      /\benergetic field\b/i,
      /\bvibration\b/i,
      /\baura\b/i,
      /\bchakra/i,
      /\bevil eye\b/i,
      /\bpurif/i,
      /\bcleanses? (the|your) energy\b/i,
    ],
    tratamento: [/\bhelps?\b/i, /\bhelping\b/i, /\bimproves?\b/i, /\bcomfort/i, /\bconsol(e|es|ing|ation)\b/i, /\bmakes? you feel\b/i],
    pesado: [/\bgrief\b/i, /\bgrieving\b/i, /\bmourning\b/i, /despair/i, /\bdepress/i, /suicid/i, /\bpanic\b/i, /\bdeath\b/i, /\bdying\b/i, /self-harm/i, /can'?t take it (any ?more)?/i, /\bno way out\b/i],
    banida: [/\bg[iy]ps(y|ies)\b/iu, /\bgipsy\b/iu],
    historia: [/\bcentury\b/i, /\b[0-9]{1,2}(st|nd|rd|th) c\.\b/i, /\b(1[0-9]{3}|20[0-9]{2})\b/],
  },
};

// Todo texto que a pessoa LÊ, no idioma pedido — conteúdo (via textosVisiveis,
// que anda sozinho quando alguém adiciona estado) mais o chrome da tela, que
// fica fora daquela lista de propósito pra não sujar o golden.
function tudoQueSeLe(lang) {
  const saida = textosVisiveis(lang).slice();
  const t = chromeDaTela(lang);
  for (const [k, v] of Object.entries(t)) saida.push([`tela.${k}`, v]);
  return saida;
}

test('a varredura enxerga TUDO — conteúdo e chrome, nos três idiomas', () => {
  // Varredura que não cobre o texto todo é decoração. Este teste é o que
  // impede alguém de traduzir um campo novo e ele nascer sem vigilância.
  for (const lang of TODOS) {
    const chaves = tudoQueSeLe(lang).map(([k]) => k);
    const esperadas = achatar(packDeTextos(lang)).length;
    assert.equal(
      chaves.length,
      esperadas,
      `${lang}: a varredura vê ${chaves.length} textos, mas o pack tem ${esperadas} — ` +
        'algum campo traduzido ficou fora da vigilância'
    );
  }
});

for (const grupo of ['saude', 'promessa', 'mecanismo', 'tratamento', 'pesado', 'banida']) {
  test(`NENHUM texto, em NENHUM idioma, cruza a linha vermelha de "${grupo}"`, () => {
    const violacoes = [];
    for (const lang of TODOS) {
      for (const [chave, texto] of tudoQueSeLe(lang)) {
        for (const re of LINHA_VERMELHA[lang][grupo]) {
          const m = String(texto).match(re);
          if (m) violacoes.push(`${lang}:${chave}: "${m[0]}" (${re})`);
        }
      }
    }
    assert.deepEqual(violacoes, [], `linha vermelha "${grupo}" cruzada:\n${violacoes.join('\n')}`);
  });
}

test('NENHUMA ponte faz afirmação histórica — a fonte mora dentro da feature, nos três idiomas', () => {
  // A porta não cita ninguém, de propósito: afirmação histórica exige obra,
  // autor e locus conferido na base docs/tradicao/, e quem entrega isso é a
  // feature que recebe a pessoa. Não há locus pra preservar aqui — há locus
  // pra NÃO deixar entrar.
  const violacoes = [];
  for (const lang of TODOS) {
    for (const [chave, texto] of tudoQueSeLe(lang)) {
      for (const re of LINHA_VERMELHA[lang].historia) {
        const m = String(texto).match(re);
        if (m) violacoes.push(`${lang}:${chave}: "${m[0]}" (${re})`);
      }
    }
  }
  assert.deepEqual(violacoes, [], `citação sem lastro na porta:\n${violacoes.join('\n')}`);
});

test('as varreduras es/en MORDEM — cada lista pega a frase proibida que existe pra pegar', () => {
  const DEVE_PEGAR = {
    es: {
      saude: [
        'esta lectura te calma',
        'alivia la tensión del día',
        'sana lo que duele',
        'cura la ansiedad',
        'trata el insomnio',
        'energiza el cuerpo',
        'te va a hacer dormir mejor',
        'bueno para tu bienestar',
        'equilibra el sistema nervioso',
      ],
      promessa: [
        'esto atrae dinero',
        'garantiza el resultado',
        'un ritual poderoso',
        'hace que suceda',
        'aleja lo malo',
        'te protege de la mala suerte',
        'vas a sentirte diferente',
        'cambia tu vida en una semana',
      ],
      mecanismo: [
        'limpia la energía negativa',
        'sube tu vibración',
        'trabaja el aura',
        'abre los chakras',
        'te protege del mal de ojo',
      ],
      tratamento: [
        'esto te ayuda con lo que sientes',
        'mejora tu día',
        'sirve de consuelo',
        'te da confort',
      ],
      pesado: ['estoy en duelo', 'siento desesperación', 'ataque de pánico', 'no aguanto más', 'me siento sin salida'],
    },
    en: {
      saude: [
        'this reading calms you down',
        'it soothes the mind',
        'relieves the tension',
        'heals what hurts',
        'cures anxiety',
        'treats insomnia',
        'energizes the body',
        'helps you sleep better',
        'good for your well-being',
      ],
      promessa: [
        'this attracts money',
        'guarantees the result',
        'a powerful ritual',
        'makes it happen',
        'wards off bad luck',
        'it protects you',
        'you will feel different',
        'changes your life in a week',
      ],
      mecanismo: [
        'clears the negative energy',
        'raises your vibration',
        'works on your aura',
        'opens the chakras',
        'keeps away the evil eye',
      ],
      tratamento: [
        'this helps with how you feel',
        'it improves your day',
        'a bit of comfort',
        'makes you feel held',
      ],
      pesado: ['I am grieving', 'deep despair', 'a panic attack', "I can't take it anymore", 'there is no way out'],
    },
  };

  for (const lang of IDIOMAS_NOVOS) {
    for (const [grupo, frases] of Object.entries(DEVE_PEGAR[lang])) {
      for (const frase of frases) {
        assert.ok(
          LINHA_VERMELHA[lang][grupo].some((re) => re.test(frase)),
          `a varredura ${lang}/${grupo} deixou passar: "${frase}"`
        );
      }
    }
  }
});

test('as varreduras NÃO mordem o vocabulário legítimo — senão viram ruído e alguém as desliga', () => {
  const NAO_PODE_PEGAR = {
    pt: [
      'Tô ansiosa com o futuro', // a pessoa PODE se descrever — é a mecânica
      'O Assentar é respiração contada: quatro tempos',
      'A leitura de sonhos parte da imagem que ficou',
      'A prateleira de Limpeza dos Rituais é toda de encerramento',
      'o retrato do céu na véspera',
    ],
    es: [
      'Me tiene inquieta lo que viene',
      'Asentar es respiración contada: cuatro tiempos',
      'La lectura de sueños parte de la imagen que quedó', // plural, no es la palabra de dormir
      'el retrato del cielo en la víspera', // "retrato" no es "trata"
      'El estante de Limpieza de los Rituales es todo de cierre',
      'la carta que no se envía',
      'un porcentaje suelto',
    ],
    en: [
      "I keep worrying about what's next",
      'Settle is counted breathing: four counts', // "Settle" não é "soothe"
      'to reread once the dust settles',
      'The dream reading starts from the image that stayed with you', // dream ≠ sleep
      "the exact Moon phase, the Sun's ingress, retrogrades",
      'a relationship with a name, not a loose percentage',
      'The Clearing out shelf in the Rituals is all endings',
    ],
  };
  for (const lang of TODOS) {
    const regras = [
      ...LINHA_VERMELHA[lang].saude,
      ...LINHA_VERMELHA[lang].promessa,
      ...LINHA_VERMELHA[lang].mecanismo,
      ...LINHA_VERMELHA[lang].tratamento,
      ...LINHA_VERMELHA[lang].pesado,
      ...LINHA_VERMELHA[lang].banida,
    ];
    for (const frase of NAO_PODE_PEGAR[lang]) {
      const pego = regras.find((re) => re.test(frase));
      assert.equal(pego, undefined, `${lang}: falso positivo em "${frase}" pela regra ${pego}`);
    }
  }
});

// ===========================================================================
// 5. O FIO DA TELA — o idioma chega em TODOS os acessores
// ===========================================================================

test('a tela passa `lang` para os três acessores de texto', () => {
  assert.match(TELA_CODIGO, /chromeDaTela\(\s*lang\s*\)/, 'o chrome da tela não está pedindo o idioma');
  assert.match(TELA_CODIGO, /estadosParaIdioma\(\s*lang\s*\)/, 'os estados não estão pedindo o idioma');
  assert.match(TELA_CODIGO, /estadoPorId\([^)]*,\s*lang\s*\)/, 'o estado escolhido não está pedindo o idioma');
  assert.match(
    TELA_CODIGO,
    /destinoDe\(\s*p\.destino\s*,\s*lang\s*\)/,
    'REGRESSÃO: o card da ponte voltou a pedir o destino sem idioma — o rótulo e o botão saem em português no meio do texto traduzido'
  );
  assert.ok(TELA_CODIGO.includes('useLanguage'), 'sem useLanguage() não existe idioma nenhum pra passar');
});

test('a tela renderiza a lista JÁ TRADUZIDA, nunca a tabela canônica', () => {
  // REGRESSÃO REAL, corrigida em 31/07/2026: o refactor de idiomas trocou o
  // import de ESTADOS por estadosParaIdioma(), mas o JSX continuou escrito
  // `ESTADOS.map(...)`. Como ESTADOS não era mais importado, a tela quebrava
  // com ReferenceError na primeira renderização — em TODOS os idiomas,
  // português inclusive. Nenhum teste de texto pega isso; este pega.
  assert.match(TELA_CODIGO, /\{\s*estados\.map\(/, 'a lista de chips tem que sair de estadosParaIdioma(lang)');
  assert.ok(
    !/\bESTADOS\b/.test(TELA_CODIGO),
    'a tela referencia a tabela canônica ESTADOS — ou está sem tradução, ou está sem import (ReferenceError)'
  );
  assert.ok(
    !/\bDESTINOS\b/.test(TELA_CODIGO),
    'a tela referencia a tabela canônica DESTINOS — o destino tem que vir de destinoDe(id, lang)'
  );
  assert.ok(
    !/\bCHROME_TELA\b/.test(TELA_CODIGO),
    'a tela referencia CHROME_TELA direto — o chrome tem que vir de chromeDaTela(lang)'
  );

  // Todo identificador importado de lib/emocoes tem que ser realmente usado, e
  // todo acessor usado tem que ser realmente importado: é o par de checagens
  // que teria pego o ReferenceError acima na revisão.
  const m = TELA_CODIGO.match(/import\s*\{([^}]+)\}\s*from\s*'\.\.\/lib\/emocoes'/);
  assert.ok(m, 'a tela precisa importar de lib/emocoes');
  const importados = m[1].split(',').map((s) => s.trim()).filter(Boolean);
  const corpo = TELA_CODIGO.slice(TELA_CODIGO.indexOf('export default'));
  for (const nome of importados) {
    assert.ok(
      new RegExp(`\\b${nome}\\s*\\(`).test(corpo),
      `${nome} é importado de lib/emocoes e nunca usado — import morto`
    );
  }
});

test('a tela continua sem inventar rota, sem AsyncStorage e sem o dicionário de chrome', () => {
  assert.ok(!/navigate\(\s*['"]/.test(TELA_CODIGO), 'navigate() com string literal — use a rota vinda de lib/emocoes');
  assert.ok(TELA_CODIGO.includes('getParent'), 'sem getParent() o destino do Tarô (outra aba) quebra em silêncio');
  assert.ok(!TELA_CODIGO.includes('@react-native-async-storage'), 'esta tela não persiste nada');
  assert.ok(
    !/from\s+['"][^'"]*lib\/i18n['"]/.test(TELA_CODIGO) && !/require\(['"][^'"]*lib\/i18n/.test(TELA_CODIGO),
    'o conteúdo desta tela mora nos packs de lib/traducoes, não no dicionário de chrome'
  );
});
