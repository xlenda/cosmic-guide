// test/jornadaIdiomas.test.js — o i18n de CONTEÚDO da Jornada Guiada.
//
// Quatro contratos, nesta ordem de importância:
//
//   1. OURO: o PT não mudou um byte com a chegada dos packs. As saídas
//      douradas foram capturadas RODANDO o motor antes do refactor (dia 1 e
//      dia 7 de "7 dias de Lua" + as seis medalhas) e estão coladas aqui como
//      literais. Se qualquer literal divergir, o refactor alterou o PT — isso
//      é falha, não melhoria.
//
//   2. PARIDADE: os packs es/en têm EXATAMENTE as mesmas chaves do pack pt
//      (que é derivado das tabelas canônicas por packDeTextos), nenhum valor
//      vazio, e os mesmos placeholders {x} em cada valor.
//
//   3. FORMA: a estrutura localizada preserva tudo que não é texto (feature,
//      fontes, numeração), toda leitura FECHA no recibo ("Recibo:"/"Receipt:"),
//      e o que nunca se traduz — obra, locus, verbatim latino, o inglês de
//      Robbins, números e datas — sobrevive nos três idiomas.
//
//   4. LINHA VERMELHA NOS TRÊS IDIOMAS: alegação de saúde, promessa de
//      resultado e prova social inventada são varridas em pt, es e en — e a
//      varredura MORDE (testada contra frases proibidas de propósito).
//
// Mock de AsyncStorage por require-cache, mesmo esquema de test/jornada.test.js
// — e pela mesma razão: o fake entra ANTES do require de lib/jornada.js.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const mem = new Map();
const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return mem.has(k) ? mem.get(k) : null;
    },
    async setItem(k, v) {
      mem.set(k, String(v));
    },
    async removeItem(k) {
      mem.delete(k);
    },
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return originalLoad.call(this, request, parent, isMain);
};

const jornada = require('../lib/jornada.js');
const storageLib = require('../lib/storage.js');
const {
  TRILHAS,
  MEDALHAS,
  MEDALHAS_JORNADA,
  packDeTextos,
  trilhasParaIdioma,
  medalhasParaIdioma,
  medalhasJornadaParaIdioma,
  trilhaPorId,
  diaDaTrilha,
  medalhasPara,
  proximaMedalha,
  medalhasDaJornada,
  carregarJornada,
  passoDeHoje,
  concluirDia,
} = jornada;

const IDIOMAS_NOVOS = ['es', 'en'];
const DIA_1 = new Date(2026, 6, 31, 12, 0, 0); // meio-dia local, mesma razão de jornada.test.js

function reset() {
  mem.clear();
  storageLib._reiniciarStorageParaTestes();
}

// Todos os textos de um pack, achatados em [chave, valor].
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
// Capturado ANTES do refactor, rodando lib/jornada.js com entradas fixas.
const GOLDEN_PT = {
  nome: '7 dias de Lua',
  subtitulo: 'O que a lavoura antiga fazia em cada fase — e o que é invenção de ontem',
  dia1: {
    titulo: 'A lua que ninguém vê',
    leitura:
      'Lua Nova é a única fase que você não enxerga. Ela está lá em cima, do lado do Sol, com a cara escura virada pra gente. Os romanos chamavam isso de luna silente — a lua muda. E era justamente aí que se plantava: figueira, macieira, oliveira, pereira e videira, no fim da tarde. A lógica é de roça, não de mistério — o que vai crescer entra na terra quando a Lua vai crescer junto. Recibo: Catão, o Velho, De Agri Cultura 40.1, séc. II a.C.',
    pergunta: 'O que você está começando agora que ainda não dá pra mostrar pra ninguém?',
    acaoTexto: 'Abra o Calendário Lunar e veja em que fase a Lua está hoje de verdade.',
    acaoFeature: 'calendarioLunar',
    fontes: ['catoPlantio'],
  },
  dia7: {
    titulo: 'O calendário que veio antes das fases',
    leitura:
      'Fecha a trilha com a parte que quase todo mundo pula. Antes de existir "Lua Gibosa Crescente", existia contagem: primeiro dia da Lua, segundo, terceiro, até o trigésimo. Hesíodo tem um calendário dia a dia — o quarto e o sétimo são sagrados. Virgílio manda fugir do quinto e diz que o décimo sétimo é feliz para plantar a vinha e domar bois. Ou seja: o esquema antigo é de DIAS NUMERADOS, não de oito fases com nome. Quem transpõe um pro outro está inventando uma equivalência que a fonte não faz — e agora você sabe disso antes de todo mundo. Recibo: Hesíodo, Os Trabalhos e os Dias, vv. 765–828, séc. VII a.C.; Virgílio, Geórgicas I.276–286, séc. I a.C.',
    pergunta: 'Depois destes sete dias, o que você olha no céu de um jeito diferente?',
    acaoTexto: 'Volte ao Calendário Lunar e confira quantos dias faltam para a próxima Lua Nova.',
    acaoFeature: 'calendarioLunar',
    fontes: ['hesiodoDias', 'virgilioDias'],
  },
  medalhas: [
    ['primeiraLuz', 'Primeira Luz', 'Você abriu a trilha. Dia 1 de 7.'],
    ['andarilhoDoZodiaco', 'Andarilho do Zodíaco', 'Três dias seguidos. Você voltou duas vezes depois do primeiro.'],
    [
      'guardiaoDaEfemeride',
      'Guardião da Efeméride',
      'Cinco dias, cinco recibos lidos — obra, autor e século em cada um. Efeméride é a tabela que diz onde cada planeta estava.',
    ],
    ['desbravadorDoCeu', 'Desbravador do Céu', 'Trilha inteira, do primeiro ao sétimo dia.'],
  ],
  medalhasJornada: [
    ['leitorDeFontes', 'Leitor de Fontes', 'Duas trilhas fechadas: catorze dias e catorze recibos.'],
    ['cartografoDoCeu', 'Cartógrafo do Céu', 'Todas as trilhas concluídas. A Jornada inteira, do começo ao fim.'],
  ],
};

test('OURO: dia 1 e dia 7 de "7 dias de Lua" em PT são idênticos ao capturado antes do refactor', () => {
  for (const lang of [undefined, 'pt']) {
    const rotulo = lang === undefined ? 'sem lang' : "lang='pt'";
    const t = lang === undefined ? trilhaPorId('luaSeteDias') : trilhaPorId('luaSeteDias', lang);
    assert.equal(t.nome, GOLDEN_PT.nome, `${rotulo}: nome da trilha mudou`);
    assert.equal(t.subtitulo, GOLDEN_PT.subtitulo, `${rotulo}: subtítulo mudou`);

    for (const [num, g] of [[1, GOLDEN_PT.dia1], [7, GOLDEN_PT.dia7]]) {
      const d = lang === undefined ? diaDaTrilha('luaSeteDias', num) : diaDaTrilha('luaSeteDias', num, lang);
      assert.equal(d.titulo, g.titulo, `${rotulo}: título do dia ${num} mudou`);
      assert.equal(d.leitura, g.leitura, `${rotulo}: leitura do dia ${num} mudou`);
      assert.equal(d.pergunta, g.pergunta, `${rotulo}: pergunta do dia ${num} mudou`);
      assert.equal(d.acao.texto, g.acaoTexto, `${rotulo}: ação do dia ${num} mudou`);
      assert.equal(d.acao.feature, g.acaoFeature, `${rotulo}: feature do dia ${num} mudou`);
      assert.deepEqual(d.fontes, g.fontes, `${rotulo}: fontes do dia ${num} mudaram`);
    }
  }
});

test('OURO: as seis medalhas em PT são idênticas ao capturado antes do refactor', () => {
  assert.deepEqual(
    MEDALHAS.map((m) => [m.id, m.nome, m.legenda]),
    GOLDEN_PT.medalhas,
    'MEDALHAS PT mudou'
  );
  assert.deepEqual(
    MEDALHAS_JORNADA.map((m) => [m.id, m.nome, m.legenda]),
    GOLDEN_PT.medalhasJornada,
    'MEDALHAS_JORNADA PT mudou'
  );
});

test('OURO: o caminho PT é IDENTIDADE — mesma referência, não cópia', () => {
  // A garantia mais forte possível de que o refactor não tocou o PT: para
  // 'pt' (e para idioma desconhecido) o motor devolve as PRÓPRIAS tabelas.
  assert.equal(trilhasParaIdioma(), TRILHAS);
  assert.equal(trilhasParaIdioma('pt'), TRILHAS);
  assert.equal(trilhasParaIdioma('fr'), TRILHAS, 'idioma desconhecido não caiu em PT');
  assert.equal(medalhasParaIdioma('pt'), MEDALHAS);
  assert.equal(medalhasJornadaParaIdioma('pt'), MEDALHAS_JORNADA);
  assert.equal(trilhaPorId('luaSeteDias'), trilhaPorId('luaSeteDias', 'pt'));
  assert.equal(diaDaTrilha('luaSeteDias', 3), diaDaTrilha('luaSeteDias', 3, 'pt'));
  assert.deepEqual(medalhasPara(3), medalhasPara(3, 'pt'));
  assert.deepEqual(medalhasDaJornada(2), medalhasDaJornada(2, 'pt'));
});

// ===========================================================================
// 2. PARIDADE — mesmas chaves, nenhum valor vazio, mesmos placeholders
// ===========================================================================

test('os packs es e en têm exatamente as mesmas chaves do pack pt', () => {
  const pt = achatar(packDeTextos('pt'));
  const chavesPt = pt.map(([k]) => k).sort();
  for (const lang of IDIOMAS_NOVOS) {
    const pack = packDeTextos(lang);
    assert.ok(pack, `packDeTextos('${lang}') não existe`);
    const chaves = achatar(pack).map(([k]) => k).sort();
    assert.deepEqual(chaves, chavesPt, `chaves do pack ${lang} divergem do pt`);
  }
});

test('nenhum valor vazio e nenhum placeholder divergente em nenhum idioma', () => {
  const pt = new Map(achatar(packDeTextos('pt')));
  for (const lang of ['pt', ...IDIOMAS_NOVOS]) {
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

test('as leituras localizadas têm corpo de leitura, não de legenda', () => {
  // Mesmo piso do PT (test/jornada.test.js): uma leitura de menos de 200
  // caracteres não abre no povão E fecha com recibo.
  for (const lang of IDIOMAS_NOVOS) {
    for (const t of trilhasParaIdioma(lang)) {
      for (const d of t.dias) {
        assert.ok(
          d.leitura.trim().length >= 200,
          `${lang} ${t.id} dia ${d.dia}: leitura com ${d.leitura.trim().length} caracteres`
        );
        assert.ok(d.pergunta.trim().endsWith('?'), `${lang} ${t.id} dia ${d.dia}: pergunta sem interrogação`);
        assert.ok(d.acao.texto.trim().length >= 20, `${lang} ${t.id} dia ${d.dia}: ação curta demais`);
      }
    }
  }
});

// ===========================================================================
// 3. FORMA — estrutura intacta, recibo no fim, intraduzíveis preservados
// ===========================================================================

test('a estrutura localizada preserva tudo que não é texto', () => {
  for (const lang of IDIOMAS_NOVOS) {
    const locais = trilhasParaIdioma(lang);
    assert.deepEqual(
      locais.map((t) => t.id),
      TRILHAS.map((t) => t.id),
      `${lang}: ids ou ordem das trilhas mudaram`
    );
    for (let i = 0; i < TRILHAS.length; i += 1) {
      const pt = TRILHAS[i];
      const loc = locais[i];
      assert.equal(loc.duracao, pt.duracao, `${lang} ${pt.id}: duração mudou`);
      assert.deepEqual(
        loc.dias.map((d) => d.dia),
        pt.dias.map((d) => d.dia),
        `${lang} ${pt.id}: numeração dos dias mudou`
      );
      for (let j = 0; j < pt.dias.length; j += 1) {
        assert.equal(
          loc.dias[j].acao.feature,
          pt.dias[j].acao.feature,
          `${lang} ${pt.id} dia ${pt.dias[j].dia}: a feature da ação mudou com o idioma`
        );
        assert.deepEqual(
          loc.dias[j].fontes,
          pt.dias[j].fontes,
          `${lang} ${pt.id} dia ${pt.dias[j].dia}: as fontes mudaram com o idioma`
        );
      }
    }
  }
});

test('toda leitura FECHA no recibo, no idioma certo e depois da metade do texto', () => {
  const MARCADOR = { es: 'Recibo:', en: 'Receipt:' };
  for (const lang of IDIOMAS_NOVOS) {
    for (const t of trilhasParaIdioma(lang)) {
      for (const d of t.dias) {
        const onde = `${lang} ${t.id} dia ${d.dia}`;
        const txt = d.leitura.trim();
        const marca = MARCADOR[lang];
        assert.ok(txt.includes(marca), `${onde}: leitura sem "${marca}"`);
        assert.ok(
          txt.indexOf(marca) > txt.length * 0.55,
          `${onde}: o recibo aparece cedo demais — abra na conversa, feche na fonte`
        );
      }
    }
  }
});

test('o que nunca se traduz sobrevive nos três idiomas: obra, locus, latim, Robbins e datas', () => {
  const casos = [
    // [trilha, dia, string que TEM que existir em pt, es e en]
    ['luaSeteDias', 1, 'De Agri Cultura 40.1'],
    ['luaSeteDias', 1, 'luna silente'],
    ['luaSeteDias', 2, 'omnia quae seruntur crescente luna'],
    ['luaSeteDias', 2, 'Opus Agriculturae I.6.12'],
    ['luaSeteDias', 3, 'Tetrabiblos I.8'],
    ['luaSeteDias', 3, '1967'],
    ['luaSeteDias', 5, 'Naturalis Historia XVIII.321'],
    ['luaSeteDias', 6, 'interlunium'],
    ['mapaSeteDias', 1, 'Tetrabiblos I.22'],
    ['mapaSeteDias', 3, 'oíax'],
    ['mapaSeteDias', 7, '1650'],
    ['taroVinteDois', 2, '1781'],
    ['taroVinteDois', 2, '1822'],
    ['taroVinteDois', 6, '1909'],
    ['taroVinteDois', 7, '1911'],
    // O verbatim de Robbins fica em INGLÊS nos três: no EN é o próprio texto,
    // no ES é citação com paráfrase ao lado, no PT já era assim.
    ['ceuDosAntigos', 5, 'deepest enmities'],
    ['ceuDosAntigos', 7, '1914'],
  ];
  for (const [trilhaId, dia, prova] of casos) {
    for (const lang of ['pt', ...IDIOMAS_NOVOS]) {
      const d = diaDaTrilha(trilhaId, dia, lang);
      assert.ok(
        d.leitura.includes(prova),
        `${lang} ${trilhaId} dia ${dia}: perdeu ${JSON.stringify(prova)} na tradução`
      );
    }
  }
});

test('a marca de transposição do dia 2 existe traduzida — a regra da lavoura não vira regra de vida sem aviso', () => {
  // Espelho de SEM_FONTE_ANTIGA (test/jornada.test.js cobra a frase literal no
  // PT); aqui cobramos o equivalente de sentido em cada idioma.
  assert.ok(
    diaDaTrilha('luaSeteDias', 2, 'es').leitura.includes('práctica popular contemporánea, sin fuente antigua localizada'),
    'es: a marca de transposição sumiu do dia 2'
  );
  assert.ok(
    diaDaTrilha('luaSeteDias', 2, 'en').leitura.includes('contemporary popular practice, with no ancient source located'),
    'en: a marca de transposição sumiu do dia 2'
  );
});

test('nenhum texto es/en vazou português (ã, õ e ç não existem em espanhol nem em inglês)', () => {
  const vazados = [];
  for (const lang of IDIOMAS_NOVOS) {
    for (const [chave, valor] of achatar(packDeTextos(lang))) {
      if (/[ãõç]/i.test(valor)) vazados.push(`${lang}:${chave}`);
    }
  }
  assert.deepEqual(vazados, [], `texto com cara de português nos packs:\n${vazados.join('\n')}`);
});

// ===========================================================================
// 4. LINHA VERMELHA NOS TRÊS IDIOMAS
// ===========================================================================
// As palavras proibidas têm primos em cada idioma. Nenhum entra — nem como
// promessa, nem como veredito, nem como aviso defensivo. Mesma régua de
// test/jornada.test.js, agora com uma lista por idioma.
const LINHA_VERMELHA = {
  pt: {
    saude: [
      /\bcur(a|ar|as|am|ativ)/i,
      /\btrata(r|mento)?\b/i,
      /\bansiedade\b/i,
      /\bins[oô]nia\b/i,
      /\bsono\b/i,
      /\bdormir\b/i,
      /\bestresse\b/i,
      /\brelaxa/i,
      /\bacalma\b/i,
      /\balivi(a|ar|o)\b/i,
      /\bharmoniza/i,
      /\bequilibra/i,
      /\bbem-estar\b/i,
      /\bsa[úu]de\b/i,
      /\bener?giza/i,
    ],
    resultado: [
      /\bvai (atrair|trazer|mudar|acontecer|resolver|melhorar)/i,
      /\bgarant(e|em|ia|ido|ida|ir)\b/i,
      /\batrai(r|rá|rão)?(?!\p{L})/iu,
      /\bmanifesta(r|ção|çao)\b/i,
      /\bfaz acontecer\b/i,
      /\bmuda (sua|a tua) vida\b/i,
      /\bpoder(oso|osa)\b/i,
      /no s[ée]timo dia voc[êe](?!\p{L})/iu,
    ],
    social: [/menos gente/i, /poucos? (chegam|conseguem|fazem)/i, /muita gente/i, /a maioria (das|dos) (pessoas|usuári)/i, /milhares/i],
  },
  es: {
    saude: [
      /\bcur(a|ar|e|en|ación|ativ)/i,
      /\btrat(a|ar|e|en|amiento)\b/i,
      /\bsan(a|ar|e|en)\b/i,
      /\bansiedad\b/i,
      /\binsomnio\b/i,
      /\bsue[ñn]o\b/i,
      /\bdormir\b/i,
      /\bestr[eé]s\b/i,
      /\brelaj/i,
      /\bcalm(a|ar|e|en)\b/i,
      /\balivi(a|ar|e|en|o)\b/i,
      /\barmoniz/i,
      /\bequilibr/i,
      /\bbienestar\b/i,
      /\bsalud\b/i,
      /\benergiz/i,
      /\benergía (positiva|negativa|vital)\b/i,
    ],
    resultado: [
      /\bva a (atraer|traer|cambiar|suceder|resolver|mejorar)/i,
      /\bgarantiz/i,
      /\batrae(r|rá|rán)?(?!\p{L})/iu,
      /\bmanifest(ar|ación|iesta)\b/i,
      /\bhace que (pase|suceda)\b/i,
      /\brealiza (tus|sus) sueños\b/i,
      /\bcambia (tu|la) vida\b/i,
      /\bpoderos[oa]s?\b/i,
      /al s[eé]ptimo día (vas|sentirás)(?!\p{L})/iu,
    ],
    social: [/menos gente/i, /pocos? (llegan|logran|hacen|terminan)/i, /mucha gente/i, /la mayoría de (las personas|los usuarios|la gente)/i, /\bmiles\b/i],
  },
  en: {
    saude: [
      /\brelie(ve|ves|ved|f)\b/i,
      /\bsooth/i,
      /\bcalm/i,
      /\bheal(s|ing|ed|er)?\b/i,
      /\bcure(s|d)?\b/i,
      /\bcurative/i,
      /\btreat(s|ed|ing|ment)?\b/i,
      /\benergi[sz]e/i,
      /\banxiety\b/i,
      /\binsomnia\b/i,
      /\bsleep\b/i,
      /\bstress\b/i,
      /\brelax/i,
      /\bwell-?being\b/i,
      /\bimmun/i,
      /\bpain(s|ful)?\b/i,
    ],
    resultado: [
      /\bwill (attract|bring|change|fix|improve|transform)\b/i,
      /\bguarantee/i,
      /\battract(s|ing|ed)?\b/i,
      /\bmanifest/i,
      /\bmakes? it happen\b/i,
      /\bchanges? your life\b/i,
      /\bpowerful\b/i,
      /on the seventh day you('| will| are)/i,
    ],
    social: [/fewer people/i, /few (make it|get here|finish|manage)/i, /most people/i, /\bthousands\b/i],
  },
};

test('nenhum texto da Jornada, em NENHUM idioma, faz alegação de saúde, promete resultado ou inventa prova social', () => {
  const violacoes = [];
  for (const lang of ['pt', ...IDIOMAS_NOVOS]) {
    const listas = LINHA_VERMELHA[lang];
    const regras = [...listas.saude, ...listas.resultado, ...listas.social];
    for (const [chave, texto] of achatar(packDeTextos(lang))) {
      for (const re of regras) {
        const m = String(texto).match(re);
        if (m) violacoes.push(`${lang}:${chave}: "${m[0]}" (${re})`);
      }
    }
  }
  assert.deepEqual(violacoes, [], `linha vermelha cruzada:\n${violacoes.join('\n')}`);
});

test('as varreduras es/en MORDEM — cada lista pega a frase proibida que existe pra pegar', () => {
  // Varredura que nunca pega nada é decorativa (lição literal de
  // test/jornada.test.js, que descobriu o \b ASCII assim).
  const DEVE_PEGAR = {
    es: {
      saude: [
        'alivia la tensión',
        'calma la mente',
        'sana el cuerpo',
        'cura el alma',
        'esto trata el insomnio',
        'energiza el cuerpo',
        'reduce la ansiedad',
        'te ayuda a dormir mejor',
        'equilibra los chakras',
        'bueno para el bienestar',
      ],
      resultado: [
        'esto va a atraer dinero',
        'garantiza resultados',
        'cambia tu vida en una semana',
        'hace que suceda',
        'un gesto poderoso',
        'realiza tus sueños',
        'al séptimo día vas a sentir la diferencia',
      ],
      social: [
        'pocos llegan hasta aquí',
        'mucha gente se rinde a la mitad',
        'la mayoría de las personas no termina',
        'miles de personas ya lo hicieron',
      ],
    },
    en: {
      saude: [
        'relieves the tension',
        'soothes the mind',
        'it calms you down',
        'heals the body',
        'cures anxiety',
        'treats insomnia',
        'energizes the body',
        'helps you sleep better',
        'reduces stress',
        'good for your well-being',
      ],
      resultado: [
        'this will attract money',
        'guarantees results',
        'changes your life in a week',
        'makes it happen',
        'a powerful gesture',
        'on the seventh day you will feel the difference',
      ],
      social: [
        'few make it this far',
        'most people never finish',
        'thousands of people already did it',
      ],
    },
  };

  for (const lang of IDIOMAS_NOVOS) {
    for (const [lista, frases] of Object.entries(DEVE_PEGAR[lang])) {
      for (const frase of frases) {
        assert.ok(
          LINHA_VERMELHA[lang][lista].some((re) => re.test(frase)),
          `a varredura ${lang}/${lista} deixou passar: "${frase}"`
        );
      }
    }
  }

  // E o contrário: o vocabulário LEGÍTIMO da feature não pode disparar, senão
  // a varredura vira ruído e alguém a desliga.
  const NAO_PODE_PEGAR = {
    es: [
      'abre el Calendario Lunar y mira la fase de hoy',
      'la cosecha sufre menos daño con la luna menguante',
      'el retrato de la época era otro', // "retrato" não é "trata"
      'la práctica corriente del siglo II',
      'no necesariamente la mayoría',
      'el dibujo tiene milenios',
      'tradujo la astrología griega al sánscrito',
    ],
    en: [
      'open the Moon Calendar and see which phase the Moon is in today',
      'the harvest takes less harm with the moon waning',
      'the Ascendant is the helm', // "helm" não é "heal"
      'a trick-taking game with a winner every round',
      'the drawing is millennia old',
      'the Maine Farmers\' Almanac published its lists',
    ],
  };
  for (const lang of IDIOMAS_NOVOS) {
    const regras = [
      ...LINHA_VERMELHA[lang].saude,
      ...LINHA_VERMELHA[lang].resultado,
      ...LINHA_VERMELHA[lang].social,
    ];
    for (const frase of NAO_PODE_PEGAR[lang]) {
      const pego = regras.find((re) => re.test(frase));
      assert.equal(pego, undefined, `${lang}: falso positivo em "${frase}" pela regra ${pego}`);
    }
  }
});

test('medalhas es/en premiam o FEITO e continuam com nome de printar', () => {
  // Mesmas duas travas do PT: nada de "o que a pessoa virou" e nada de nome
  // genérico de gamificação. A tradução é de produto, não de dicionário.
  const VIROU = {
    es: [/iluminad/i, /sanad/i, /curad/i, /transformad/i, /despert/i, /elevad/i, /purificad/i],
    en: [/enlighten/i, /healed/i, /cured/i, /transformed/i, /awaken/i, /elevated/i, /purified/i],
  };
  for (const lang of IDIOMAS_NOVOS) {
    for (const grupo of ['medalhas', 'medalhasJornada']) {
      for (const [id, m] of Object.entries(packDeTextos(lang)[grupo])) {
        assert.ok(m.nome && m.nome.length >= 4, `${lang} medalha ${id} sem nome`);
        assert.ok(m.legenda && m.legenda.length >= 15, `${lang} medalha ${id} sem legenda`);
        assert.doesNotMatch(
          m.nome,
          /^(n[íi]vel|level|badge|medalha|medalla|insignia)\s*\d*$/i,
          `${lang} medalha ${id}: nome genérico`
        );
        for (const re of VIROU[lang]) {
          assert.doesNotMatch(m.nome, re, `${lang} medalha ${id}: o NOME promete transformação`);
          assert.doesNotMatch(m.legenda, re, `${lang} medalha ${id}: a LEGENDA promete transformação`);
        }
      }
    }
  }
});

// ===========================================================================
// 5. O FIO INTEIRO — o motor entrega o idioma pedido, e só o texto muda
// ===========================================================================

test('concluirDia sem opções continua devolvendo medalha em PT (compatibilidade total)', async () => {
  reset();
  const r = await concluirDia('luaSeteDias', 1, DIA_1);
  assert.equal(r.ok, true);
  assert.equal(r.medalhasNovas[0].nome, 'Primeira Luz');
});

test('concluirDia com lang devolve a medalha traduzida — e a gravação é a mesma', async () => {
  reset();
  const r = await concluirDia('luaSeteDias', 1, DIA_1, { lang: 'en' });
  assert.equal(r.ok, true);
  assert.equal(r.medalhasNovas[0].nome, 'First Light');
  assert.equal(r.medalhasNovas[0].id, 'primeiraLuz', 'o id não pode mudar com o idioma');
  // O estado gravado não sabe de idioma: reler em es dá o mesmo progresso.
  const emEs = await carregarJornada('es');
  assert.deepEqual(emEs.trilhas.luaSeteDias.diasConcluidos, [1]);
});

test('passoDeHoje e as medalhas-alvo saem no idioma pedido', async () => {
  reset();
  const passoEn = await passoDeHoje('luaSeteDias', 'en');
  assert.equal(passoEn.titulo, 'The moon nobody sees');
  const passoEs = await passoDeHoje('luaSeteDias', 'es');
  assert.equal(passoEs.titulo, 'La luna que nadie ve');
  const passoPt = await passoDeHoje('luaSeteDias');
  assert.equal(passoPt.titulo, 'A lua que ninguém vê');

  assert.equal(proximaMedalha(0, 'en').nome, 'First Light');
  assert.equal(proximaMedalha(6, 'en').nome, 'Sky Trailblazer');
  assert.equal(proximaMedalha(6, 'es').nome, 'Pionero del Cielo');
  assert.equal(proximaMedalha(7, 'en'), null);
  assert.equal(medalhasDaJornada(2, 'es')[0].nome, 'Cazador de Fuentes');
  assert.equal(medalhasDaJornada(2, 'en')[0].nome, 'Source Hunter');
});
