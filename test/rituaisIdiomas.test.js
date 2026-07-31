// test/rituaisIdiomas.test.js
// A SEGUNDA PARCELA DO i18n DE RITUAIS — os packs es/en e o parâmetro `lang`.
//
// Quatro trabalhos, na ordem de importância:
//
// (1) O OURO. O português é a fonte de verdade e NÃO PODE mudar um byte com a
//     refatoração. Os goldens abaixo foram capturados RODANDO o motor ANTES da
//     mudança (31/07/2026), com entradas fixas — dois rituais inteiros, o
//     aviso ético, o texto de compartilhar e o resumo do momento. O teste
//     prova que sem `lang` E com lang='pt' a saída é IDÊNTICA à de então.
//     Se este teste quebrar, a refatoração alterou o PT — isso é falha, não
//     melhoria.
//
// (2) A PARIDADE. Os packs es/en têm exatamente os mesmos ids e campos do PT,
//     nenhum valor vazio, mesmos tamanhos de array e mesmos placeholders {x}.
//     Pack capenga = tela meio traduzida em silêncio.
//
// (3) A LINHA VERMELHA NOS TRÊS IDIOMAS. As palavras proibidas do PT têm
//     primos — es: aliviar/calmar/sanar/curar/tratar/energizar; en: relieve/
//     soothe/calm/heal/cure/treat/energize — e nenhum entra. Nem promessa de
//     resultado, nem mecanismo pseudocientífico, nem aviso defensivo.
//
// (4) O CANÔNICO NÃO SE TRADUZ. Ids, categorias, fases da Lua (a chave do
//     casamento com lib/lunarCalendar.js), dias, ids de fonte, números, datas
//     e locus (Tetrabiblos I.4, Naturalis Historia XVIII.321-322) ficam
//     idênticos nos três idiomas. E o link de compartilhar é o MESMO nos três.

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

// --- fake do AsyncStorage, injetado ANTES do módulo sob teste ---------------
// Mesma armadilha documentada em test/rituais.test.js: lib/storage.js memoriza
// o módulo na primeira chamada.
const memStorage = new Map();
const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return memStorage.has(k) ? memStorage.get(k) : null;
    },
    async setItem(k, v) {
      memStorage.set(k, String(v));
    },
    async removeItem(k) {
      memStorage.delete(k);
    },
  },
};
const carregarOriginal = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return carregarOriginal.call(this, request, parent, isMain);
};

const R = require('../lib/rituais.js');
const { translate, LANGUAGES } = require('../lib/i18n.js');

// Os packs, direto da fonte — o teste de paridade compara a FORMA deles com a
// forma derivada do motor PT.
const PACKS = {
  es: require('../lib/traducoes/rituais.es.js').default,
  en: require('../lib/traducoes/rituais.en.js').default,
};
const IDIOMAS_PACK = ['es', 'en'];

function tDe(lang) {
  return (key, vars) => translate(lang, key, vars);
}

// ---------------------------------------------------------------------------
// (1) O OURO — capturado do motor ANTES da refatoração, com entradas fixas
// ---------------------------------------------------------------------------
// NÃO reescreva estes textos a partir de lib/rituais.js "pra ficar igual": o
// valor deles é serem a fotografia de ANTES. Se divergirem, o PT mudou.
const GOLDEN = {
  AVISO_ETICO:
    'Estes rituais são gestos de intenção, feitos com a própria mão e sobre a própria vida. Sobre vontade alheia não se mexe.',
  SEM_FONTE_ANTIGA: 'prática popular contemporânea, sem fonte antiga localizada',
  LINK_COMPARTILHAR: 'https://cosmicguide.cloud/cosmic-guide/',
  rituais: {
    'amor-carta-que-nao-se-envia': {
      titulo: 'A carta que não se envia',
      intencao:
        'É pra você colocar no papel o que sente por alguém, ler em voz alta uma vez e guardar. O destino da carta é a gaveta, não a pessoa — o que se faz aqui é ficar com o que é seu, sem mexer com quem está do outro lado. Escrever afeto para si mesmo é prática popular contemporânea, sem fonte antiga localizada.',
      materiais: [
        'Uma folha de papel e uma caneta',
        'Um envelope',
        'Uma vela branca, se você quiser (é opcional e não muda nada do que está escrito aqui)',
      ],
      passos: [
        'Sente numa mesa, celular em outro cômodo, e escreva no alto da folha a data de hoje — sem o nome da pessoa.',
        'Escreva em primeira pessoa: o que você sente, o que gostaria de ter dito, o que você não vai dizer.',
        'Leia o texto em voz alta, uma vez só, do começo ao fim.',
        'Dobre a folha, coloque no envelope e escreva a data de hoje por fora.',
        'Guarde o envelope num lugar seu. Se acender a vela, apague antes de sair do cômodo.',
      ],
      momentoTexto:
        "Sexta é o dia em que dá pra parar e olhar o que você sente sem a semana empurrando. E o nome do dia carrega Vênus desde a Antiguidade: ele sai da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido —, de onde a sequência dos dias é derivada pulando três posições a cada volta de 24 horas. Vênus aparece mesmo em juízo antigo sobre casal: Māshā'allāh, Book of Aristotle III.7.11, séc. VIII, olha Vênus e a Lua no mesmo signo. A Lua Nova entra como começo do mês lunar, que é marcação de calendário antiga de verdade. Quem registra a fila dos dias é Dião Cássio, História Romana 37.18-19, séc. III — e ele mesmo diz que o costume era novidade no tempo dele —; quem conta o mês lunar dia a dia é Hesíodo, Os Trabalhos e os Dias, vv. 765-828, séc. VII a.C.",
      fasesLua: ['Lua Nova', 'Lua Crescente'],
      diasSemana: [5],
      cuidados:
        'Este ritual é sobre o que você sente, e para aí. Não escreva o nome de ninguém no papel: com nome, o exercício deixa de ser sobre o que você sente e vira gesto dirigido a outra pessoa. Não escreva pedindo que a outra pessoa mude de ideia, não mande a carta depois e não use o nome de ninguém como alvo. Se o assunto envolve alguém que pediu distância, respeite a distância. Estes rituais são gestos de intenção, feitos com a própria mão e sobre a própria vida. Sobre vontade alheia não se mexe.',
      aviso:
        'Estes rituais são gestos de intenção, feitos com a própria mão e sobre a própria vida. Sobre vontade alheia não se mexe.',
      naoTemFonte: [
        'Acender vela num gesto de afeto, de qualquer cor, inclusive branca: prática popular contemporânea, sem fonte antiga localizada.',
        'Escrever uma carta para não enviar: prática popular contemporânea, sem fonte antiga localizada.',
      ],
      compartilhar:
        'A carta que não se envia — ritual de Amor, do Cosmic Guide.\nMomento ideal: Lua Nova ou Lua Crescente · sexta-feira.\nEstes rituais são gestos de intenção, feitos com a própria mão e sobre a própria vida. Sobre vontade alheia não se mexe.\nhttps://cosmicguide.cloud/cosmic-guide/',
      resumo: 'Lua Nova ou Lua Crescente · sexta-feira',
    },
    'limpeza-cortar-o-que-ja-secou': {
      titulo: 'Cortar o que já secou',
      intencao:
        'É escolher uma coisa que claramente acabou — uma assinatura que você não usa, um grupo que só ocupa espaço, uma pilha de papel velho — e encerrar de fato, hoje. O que se faz aqui é o corte, em vez do adiamento. E o gesto de cortar na Lua minguante tem fonte: Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I, escreve que tudo que se corta, se colhe e se tosquia sofre menos dano com a lua decrescente.',
      materiais: [
        'Uma lista das coisas que você vem adiando encerrar',
        'Celular ou computador, se o cancelamento for online',
        'Um saco de lixo ou uma caixa de doação, se for coisa física',
      ],
      passos: [
        'Escolha UMA coisa. Só uma.',
        'Escreva o nome dela num papel.',
        'Faça o encerramento agora: cancele, saia do grupo, jogue fora, doe.',
        'Risque o nome no papel.',
        'Guarde o papel riscado até a próxima Lua minguante e escolha a próxima.',
      ],
      momentoTexto:
        'Este é o ritual com a fonte mais direta da biblioteca inteira, e vale dizer por quê: a lavoura antiga TIRA na minguante, e isso está escrito, não é folclore. Tudo que se corta, se colhe e se tosquia sofria menos dano com a lua decrescente, e a uva para passa era colhida na minguante. Transpor "podar galho" para "cancelar assinatura" é nosso, contemporâneo: prática popular contemporânea, sem fonte antiga localizada. Quem escreve as duas coisas é Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I, e Columela, De Re Rustica XII.16.1, séc. I.',
      fasesLua: ['Lua Gibosa Minguante', 'Quarto Minguante', 'Lua Minguante'],
      diasSemana: [],
      cuidados:
        'Encerre só o que é seu para encerrar. Não cancele, não jogue fora e não apague coisa de outra pessoa. E se a vontade de cortar estiver mirando um vínculo com gente, espere um dia antes de fazer qualquer coisa. Estes rituais são gestos de intenção, feitos com a própria mão e sobre a própria vida. Sobre vontade alheia não se mexe.',
      aviso:
        'Estes rituais são gestos de intenção, feitos com a própria mão e sobre a própria vida. Sobre vontade alheia não se mexe.',
      naoTemFonte: [
        'Aplicar a regra da minguante a assinatura, grupo ou compromisso: prática popular contemporânea, sem fonte antiga localizada.',
      ],
      compartilhar:
        'Cortar o que já secou — ritual de Limpeza, do Cosmic Guide.\nMomento ideal: Lua Gibosa Minguante ou Quarto Minguante ou Lua Minguante.\nEstes rituais são gestos de intenção, feitos com a própria mão e sobre a própria vida. Sobre vontade alheia não se mexe.\nhttps://cosmicguide.cloud/cosmic-guide/',
      resumo: 'Lua Gibosa Minguante ou Quarto Minguante ou Lua Minguante',
    },
  },
};

test('OURO: sem lang e com lang="pt", o PT é byte a byte o de antes da refatoração', () => {
  assert.equal(R.AVISO_ETICO, GOLDEN.AVISO_ETICO);
  assert.equal(R.avisoEtico(), GOLDEN.AVISO_ETICO);
  assert.equal(R.avisoEtico('pt'), GOLDEN.AVISO_ETICO);
  assert.equal(R.SEM_FONTE_ANTIGA, GOLDEN.SEM_FONTE_ANTIGA);
  assert.equal(R.LINK_COMPARTILHAR, GOLDEN.LINK_COMPARTILHAR);

  for (const [id, g] of Object.entries(GOLDEN.rituais)) {
    for (const modo of [undefined, 'pt']) {
      const r = R.ritualPorId(id, modo);
      assert.ok(r, `${id} sumiu do catálogo`);
      assert.equal(r.titulo, g.titulo, `${id}/${modo}: titulo mudou`);
      assert.equal(r.intencao, g.intencao, `${id}/${modo}: intencao mudou`);
      assert.deepEqual(r.materiais, g.materiais, `${id}/${modo}: materiais mudaram`);
      assert.deepEqual(r.passos, g.passos, `${id}/${modo}: passos mudaram`);
      assert.equal(r.momento.texto, g.momentoTexto, `${id}/${modo}: momento.texto mudou`);
      assert.deepEqual(r.momento.fasesLua, g.fasesLua, `${id}/${modo}: fasesLua mudaram`);
      assert.deepEqual(r.momento.diasSemana, g.diasSemana, `${id}/${modo}: diasSemana mudaram`);
      assert.equal(r.cuidados, g.cuidados, `${id}/${modo}: cuidados mudaram`);
      assert.equal(r.aviso, g.aviso, `${id}/${modo}: aviso mudou`);
      assert.deepEqual(r.naoTemFonte, g.naoTemFonte, `${id}/${modo}: naoTemFonte mudou`);
      assert.equal(R.textoCompartilhavel(r), g.compartilhar, `${id}/${modo}: compartilhar mudou`);
      assert.equal(R.resumoDoMomento(r), g.resumo, `${id}/${modo}: resumo mudou`);
    }
    // Por id, sem lang — o caminho da chamada antiga.
    assert.equal(R.textoCompartilhavel(id), g.compartilhar);
  }

  // E sem lang, ritualPorId devolve O MESMO objeto de RITUAIS — zero cópia,
  // zero chance de divergência.
  const primeiro = R.RITUAIS[0];
  assert.equal(R.ritualPorId(primeiro.id), primeiro);
  assert.equal(R.ritualPorId(primeiro.id, 'pt'), primeiro);

  // O lastro e o recibo, iguais aos de sempre.
  assert.equal(R.lastroMomentoIdeal(), R.LASTRO_MOMENTO_IDEAL);
  assert.equal(R.lastroMomentoIdeal('pt'), R.LASTRO_MOMENTO_IDEAL);
  assert.equal(R.recibo(['columelaFava']), 'Columela, De Re Rustica XI.2.85, séc. I');

  // O motivo do encaixe, com o formato PT literal de sempre.
  const quando = new Date(2026, 6, 31, 10, 0, 0); // sexta-feira
  const hoje = R.rituaisDeHoje(quando);
  assert.equal(hoje.diaNome, 'sexta-feira');
  assert.equal(hoje.planetaDoDia, 'Vênus');
  const comDia = [...hoje.rituais, ...hoje.parciais].find((r) =>
    (r.momento.diasSemana || []).includes(5)
  );
  assert.ok(comDia, 'sexta sem nenhum ritual de dia 5');
  assert.match(comDia.motivo, /sexta-feira \(dia de Vênus\)/);
});

// ---------------------------------------------------------------------------
// (2) PARIDADE — mesma forma, nenhum valor vazio, mesmos placeholders
// ---------------------------------------------------------------------------
const CAMPOS_DE_RITUAL = ['titulo', 'intencao', 'materiais', 'passos', 'momentoTexto', 'cuidados', 'naoTemFonte'];

function placeholders(s) {
  return [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

// A forma PT derivada do motor: é contra ELA que os packs são medidos, então
// ritual novo no motor cobra tradução nova automaticamente.
function formaPt() {
  const out = {};
  for (const r of R.RITUAIS) {
    out[r.id] = {
      titulo: r.titulo,
      intencao: r.intencao,
      materiais: r.materiais,
      passos: r.passos,
      momentoTexto: r.momento.texto,
      // No motor o aviso já vem colado; no pack o campo é SÓ o cuidado
      // específico (o motor cola o aviso do idioma). A forma PT comparável é o
      // cuidado sem o aviso.
      cuidados: r.cuidados.slice(0, r.cuidados.length - R.AVISO_ETICO.length).trim(),
      naoTemFonte: r.naoTemFonte,
    };
  }
  return out;
}

test('PARIDADE: os packs es/en têm exatamente as chaves do PT, sem valor vazio', () => {
  const pt = formaPt();
  const idsPt = Object.keys(pt).sort();

  for (const lang of IDIOMAS_PACK) {
    const pack = PACKS[lang];
    assert.ok(pack && typeof pack === 'object', `pack ${lang} não carregou`);

    // Topo do pack.
    for (const campo of ['avisoEtico', 'semFonteAntiga', 'motivoDia']) {
      assert.ok(
        typeof pack[campo] === 'string' && pack[campo].trim().length > 0,
        `${lang}: ${campo} vazio`
      );
    }
    assert.deepEqual(placeholders(pack.motivoDia), ['dia', 'planeta'], `${lang}: motivoDia sem os placeholders`);

    // Os 21 rituais, id a id.
    assert.deepEqual(Object.keys(pack.rituais).sort(), idsPt, `${lang}: ids do pack ≠ ids do motor`);
    for (const id of idsPt) {
      const g = pt[id];
      const tr = pack.rituais[id];
      assert.deepEqual(
        Object.keys(tr).sort(),
        [...CAMPOS_DE_RITUAL].sort(),
        `${lang}:${id}: campos do pack ≠ forma aprovada`
      );
      for (const campo of ['titulo', 'intencao', 'momentoTexto', 'cuidados']) {
        assert.ok(typeof tr[campo] === 'string' && tr[campo].trim().length > 0, `${lang}:${id}.${campo} vazio`);
        assert.deepEqual(
          placeholders(tr[campo]),
          placeholders(g[campo]),
          `${lang}:${id}.${campo}: placeholders divergem do PT`
        );
      }
      for (const campo of ['materiais', 'passos', 'naoTemFonte']) {
        assert.ok(Array.isArray(tr[campo]), `${lang}:${id}.${campo} não é lista`);
        assert.equal(
          tr[campo].length,
          g[campo].length,
          `${lang}:${id}.${campo}: ${tr[campo].length} itens, PT tem ${g[campo].length}`
        );
        tr[campo].forEach((v, i) => {
          assert.ok(typeof v === 'string' && v.trim().length > 0, `${lang}:${id}.${campo}[${i}] vazio`);
          assert.deepEqual(
            placeholders(v),
            placeholders(g[campo][i]),
            `${lang}:${id}.${campo}[${i}]: placeholders divergem do PT`
          );
        });
      }
      // Toda linha de "o que não tem fonte" termina na frase literal do idioma.
      for (const linha of tr.naoTemFonte) {
        assert.ok(
          linha.trim().endsWith(`${pack.semFonteAntiga}.`),
          `${lang}:${id}: "${linha}" não termina na frase literal do idioma`
        );
      }
    }

    // Os três blocos de lastro, com o mesmo número de ressalvas.
    assert.deepEqual(
      Object.keys(pack.momentoIdeal).sort(),
      Object.keys(R.LASTRO_MOMENTO_IDEAL).sort(),
      `${lang}: blocos de lastro divergem`
    );
    for (const [chave, bloco] of Object.entries(R.LASTRO_MOMENTO_IDEAL)) {
      const tb = pack.momentoIdeal[chave];
      assert.ok(tb.titulo && tb.titulo.trim(), `${lang}: lastro.${chave}.titulo vazio`);
      assert.ok(tb.texto && tb.texto.trim(), `${lang}: lastro.${chave}.texto vazio`);
      assert.equal(
        (tb.ressalvas || []).length,
        (bloco.ressalvas || []).length,
        `${lang}: lastro.${chave} perdeu ressalva na tradução`
      );
      tb.ressalvas.forEach((rr, i) => assert.ok(rr && rr.trim(), `${lang}: lastro.${chave}.ressalvas[${i}] vazia`));
    }

    // As fontes: mesmos ids, recibo completo (autor + obra + século).
    assert.deepEqual(
      Object.keys(pack.fontes).sort(),
      Object.keys(R.FONTES_TRADICAO).sort(),
      `${lang}: ids de fonte divergem de FONTES_TRADICAO`
    );
    for (const [id, f] of Object.entries(pack.fontes)) {
      for (const campo of ['autor', 'obra', 'seculo']) {
        assert.ok(
          typeof f[campo] === 'string' && f[campo].trim().length > 0,
          `${lang}: fonte ${id} sem ${campo}`
        );
      }
    }
  }
});

// ---------------------------------------------------------------------------
// (4) O CANÔNICO — o que fica idêntico nos três idiomas
// ---------------------------------------------------------------------------

test('com lang, só o TEXTO troca: id, categoria, fases, dias e fontes ficam canônicos', () => {
  for (const lang of IDIOMAS_PACK) {
    const pack = PACKS[lang];
    for (const base of R.RITUAIS) {
      const r = R.ritualPorId(base.id, lang);
      const tr = pack.rituais[base.id];
      assert.equal(r.titulo, tr.titulo, `${lang}:${base.id}: titulo não veio do pack`);
      assert.equal(r.intencao, tr.intencao);
      assert.deepEqual(r.materiais, tr.materiais);
      assert.deepEqual(r.passos, tr.passos);
      assert.equal(r.momento.texto, tr.momentoTexto);
      // O canônico: é isso que casa com lib/lunarCalendar.js e com o matcher.
      assert.equal(r.id, base.id);
      assert.equal(r.categoria, base.categoria);
      assert.deepEqual(r.momento.fasesLua, base.momento.fasesLua, `${lang}:${base.id}: fases traduzidas — o casamento com o céu quebraria em silêncio`);
      assert.deepEqual(r.momento.diasSemana, base.momento.diasSemana);
      assert.deepEqual(r.fontes, base.fontes);
      // O aviso do idioma fecha `cuidados` — mesma amarração do PT.
      assert.equal(r.aviso, pack.avisoEtico);
      assert.ok(r.cuidados.trim().endsWith(pack.avisoEtico), `${lang}:${base.id}: cuidados não fecha no aviso`);
      assert.equal(r.cuidados, `${tr.cuidados} ${pack.avisoEtico}`);
    }
    // Idioma desconhecido nunca inventa: cai no PT.
    assert.equal(R.ritualPorId(R.RITUAIS[0].id, 'fr'), R.RITUAIS[0]);
  }
});

test('o texto de compartilhar sai inteiro no idioma — e o link é o MESMO nos três', () => {
  const id = 'amor-carta-que-nao-se-envia';
  const textos = { pt: R.textoCompartilhavel(id, tDe('pt'), 'pt') };
  for (const lang of IDIOMAS_PACK) {
    const pack = PACKS[lang];
    const txt = R.textoCompartilhavel(id, tDe(lang), lang);
    textos[lang] = txt;
    assert.ok(txt.includes(pack.rituais[id].titulo), `${lang}: título do pack não entrou:\n${txt}`);
    assert.ok(txt.includes(pack.avisoEtico), `${lang}: aviso ético do idioma não entrou:\n${txt}`);
    assert.ok(!txt.includes(R.AVISO_ETICO), `${lang}: o aviso saiu em português:\n${txt}`);
    assert.ok(txt.trim().endsWith(R.LINK_COMPARTILHAR), `${lang}: não termina no link:\n${txt}`);
    assert.ok(txt.length <= 460, `${lang}: compartilhar longo demais (${txt.length})`);
    // Passar o ritual JÁ LOCALIZADO dá o mesmo resultado (idempotência).
    assert.equal(R.textoCompartilhavel(R.ritualPorId(id, lang), tDe(lang), lang), txt);
  }
  for (const lang of Object.keys(textos)) {
    assert.ok(textos[lang].includes(GOLDEN.LINK_COMPARTILHAR), `${lang}: o link mudou`);
  }
});

test('rituaisDeHoje com lang devolve conteúdo do pack e motivo no idioma', () => {
  const quando = new Date(2026, 6, 31, 10, 0, 0); // sexta-feira
  for (const lang of IDIOMAS_PACK) {
    const hoje = R.rituaisDeHoje(quando, lang, tDe(lang));
    const todos = [...hoje.rituais, ...hoje.parciais];
    assert.ok(todos.length > 0, `${lang}: sexta sem sugestão nenhuma`);
    for (const r of todos) {
      assert.equal(r.titulo, PACKS[lang].rituais[r.id].titulo, `${lang}:${r.id}: veio sem pack`);
      assert.ok(!/\(dia de /.test(r.motivo), `${lang}:${r.id}: motivo em português — "${r.motivo}"`);
    }
    const comDia = todos.find((r) => (r.momento.diasSemana || []).includes(5));
    assert.ok(comDia, `${lang}: nenhum ritual de sexta`);
    const diaEsperado = translate(lang, 'rituais.dia.5');
    assert.ok(
      comDia.motivo.includes(diaEsperado),
      `${lang}: motivo "${comDia.motivo}" não traz o dia traduzido "${diaEsperado}"`
    );
  }
});

test('lastroMomentoIdeal(lang) e recibo(ids, lang) trocam texto e preservam estrutura', () => {
  for (const lang of IDIOMAS_PACK) {
    const lastro = R.lastroMomentoIdeal(lang);
    for (const [chave, bloco] of Object.entries(lastro)) {
      assert.equal(bloco.titulo, PACKS[lang].momentoIdeal[chave].titulo);
      assert.deepEqual(bloco.fontes, R.LASTRO_MOMENTO_IDEAL[chave].fontes, `${lang}: ids de fonte do lastro mudaram`);
    }
  }
  assert.equal(R.recibo(['columelaFava'], 'en'), 'Columella, De Re Rustica XI.2.85, 1st century');
  assert.equal(R.recibo(['columelaFava'], 'es'), 'Columela, De Re Rustica XI.2.85, siglo I');
  assert.equal(R.recibo(['id-que-nao-existe'], 'en'), '');
});

// ---------------------------------------------------------------------------
// (3) A LINHA VERMELHA — saúde, promessa e mecanismo NOS TRÊS IDIOMAS
// ---------------------------------------------------------------------------
// Os primos das palavras proibidas do PT. As listas PT completas moram em
// test/rituais.test.js e continuam varrendo o motor; aqui entra uma amostra PT
// (pra este arquivo cobrir os TRÊS idiomas sozinho) e as listas es/en inteiras.
const PROIBIDO = {
  pt: [
    /\bacalma\b/i, /\balivi(a|ar|o)\b/i, /\bcur(a|ar|ativ)/i, /\btrata(r|mento)?\b/i,
    /\benergiza/i, /\brelaxa/i, /\bansiedade\b/i, /\bgarant(e|ia|ido)/i, /\batra(i|ir|em)\b/i,
    /\bmanifesta(r|ção)?\b/i, /\bprotege\b/i, /\benerg[ée]tic/i, /\bvibra[çc][ãa]o\b/i,
  ],
  es: [
    // saúde
    /\balivi/i, /\bcalm/i, /\bsana(r|s|n)?\b/i, /\bcur(a|ar|ación|ativ)/i, /\btrat(a|ar|e|en|amiento)\b/i,
    /\benergiz/i, /\brelaj/i, /\btranquiliz/i, /\bansiedad/i, /\bestr[eé]s\b/i, /\binsomnio\b/i,
    /\bdormir\b/i, /\bsueño\b/i, /\bsalud\b/i, /\bbienestar\b/i, /\bterap[eé]utic/i,
    /\bequilibr/i, /\barmoniz/i, /\bdesintoxic/i, /\bcortisol\b/i, /\bsistema nervioso\b/i,
    // promessa
    /\batra(e|er|iga|cci[óo]n)/i, /\bgarant/i, /\bpromet/i, /\bmanifest/i, /\babre camino/i,
    /\bdesbloque/i, /\bdestrab/i, /\baleja\b/i, /\bahuyent/i, /\bespant/i, /\bproteg/i,
    /\bblinda/i, /\bneutraliz/i, /\bpoderos/i, /\binfalible/i, /\b(da|trae) suerte\b/i,
    /\bcontrol(a|ar|e)\b/i, /\bdomina(r)?\b/i,
    // mecanismo
    /\benerg[íi]a\b/i, /\benerg[ée]tic/i, /\bvibraci/i, /\bfrecuencia (alta|baja|vibracional)/i,
    /\baura\b/i, /\bchakra/i, /\bmagnetismo\b/i, /\bmal de ojo\b/i, /\bpurific/i,
  ],
  en: [
    // saúde (heal pega health/healing; treat pega treatment)
    /\bheal/i, /\bcur(e|ing|ative)/i, /\btreat/i, /\brelie(f|ve|ving)/i, /\bsooth/i, /\bcalm/i,
    /\benergi[sz]e/i, /\brelax/i, /\banxiety\b/i, /\bstress\b/i, /\binsomnia\b/i, /\bsleep\b/i,
    /\bwell-?being\b/i, /\btherapeutic/i, /\bdepress/i, /\bdetox/i, /\bcortisol\b/i,
    /\bnervous system\b/i, /\bimmun/i, /\binvigorat/i, /\bharmoniz/i, /\bbalanc/i,
    // promessa
    /\battract/i, /\bguarantee/i, /\bmanifest/i, /\bunblock/i, /\bunlock/i, /\bward(s|ing)? off/i,
    /\bbanish/i, /\brepel/i, /\bprotect/i, /\bopens? (the )?(path|road|way)/i, /\bpowerful\b/i,
    /\binfallible\b/i, /\bbrings? luck\b/i, /\bgood luck\b/i, /\bmakes? it happen\b/i,
    /\bcontrol(s|led|ling)?\b/i, /\bdominate/i,
    // mecanismo
    /\benergy\b/i, /\benergetic/i, /\bvibration/i, /\bvibe/i, /\b(high|low) frequency\b/i,
    /\baura\b/i, /\bchakra/i, /\bmagnetism\b/i, /\bevil eye\b/i, /\bpurif/i, /\bcleans(e|ing)\b/i,
    /\bnegative energy\b/i,
  ],
};

// Coleta todo texto visível de um pack (rituais + lastro + aviso + frase de
// ausência + fontes) com o caminho de onde veio.
function textosDoPack(lang) {
  const pack = PACKS[lang];
  const saida = [
    [`${lang}.avisoEtico`, pack.avisoEtico],
    [`${lang}.semFonteAntiga`, pack.semFonteAntiga],
    [`${lang}.motivoDia`, pack.motivoDia],
  ];
  for (const [id, tr] of Object.entries(pack.rituais)) {
    for (const campo of CAMPOS_DE_RITUAL) {
      const v = tr[campo];
      if (Array.isArray(v)) v.forEach((s, i) => saida.push([`${lang}.${id}.${campo}[${i}]`, s]));
      else saida.push([`${lang}.${id}.${campo}`, v]);
    }
  }
  for (const [chave, b] of Object.entries(pack.momentoIdeal)) {
    saida.push([`${lang}.lastro.${chave}.titulo`, b.titulo]);
    saida.push([`${lang}.lastro.${chave}.texto`, b.texto]);
    (b.ressalvas || []).forEach((rr, i) => saida.push([`${lang}.lastro.${chave}.ressalvas[${i}]`, rr]));
  }
  for (const [id, f] of Object.entries(pack.fontes)) {
    saida.push([`${lang}.fonte.${id}`, `${f.autor}, ${f.obra}, ${f.seculo}`]);
  }
  return saida;
}

test('LINHA VERMELHA: nenhuma palavra proibida em NENHUM dos três idiomas', () => {
  const violacoes = [];

  // PT: o motor inteiro, pela mesma coleta que a tela usa.
  for (const r of R.RITUAIS) {
    for (const texto of R.textosVisiveis(r)) {
      for (const re of PROIBIDO.pt) {
        if (re.test(texto)) violacoes.push(`pt ritual:${r.id} → ${re}`);
      }
    }
  }

  // ES e EN: todo o pack.
  for (const lang of IDIOMAS_PACK) {
    for (const [onde, texto] of textosDoPack(lang)) {
      for (const re of PROIBIDO[lang]) {
        if (re.test(texto)) violacoes.push(`${onde} → ${re}`);
      }
    }
  }

  assert.deepEqual(
    violacoes,
    [],
    'Palavra proibida (saúde, promessa ou mecanismo) em texto visível. Reescreva por ' +
      'SENTIDO, sem o vocabulário — a régua vale nos três idiomas:\n  ' +
      violacoes.join('\n  ')
  );
});

test('o aviso ético traduzido mantém a força e NÃO vira ressalva defensiva', () => {
  const DEFENSIVO = [
    /no garantiza/i, /sin (ninguna )?promesa/i, /no promete/i, /sin garant[íi]a/i,
    /not? guarantee/i, /no promise/i, /does not promise/i, /without (any )?promise/i,
    /disclaimer/i, /aviso legal/i, /legal notice/i,
  ];
  for (const lang of IDIOMAS_PACK) {
    const aviso = PACKS[lang].avisoEtico;
    for (const re of DEFENSIVO) {
      assert.ok(!re.test(aviso), `${lang}: o aviso virou defensivo (${re}): "${aviso}"`);
    }
    // Duas frases, como o original: o que o ritual É + o limite de conduta.
    assert.ok(aviso.split('.').filter((s) => s.trim()).length >= 2, `${lang}: o aviso perdeu uma das duas frases`);
    // E a varredura da linha vermelha do idioma também passa nele (já coberto
    // acima, mas o aviso é o texto mais repetido do app — merece o registro).
    for (const re of PROIBIDO[lang]) assert.ok(!re.test(aviso), `${lang}: aviso tropeça em ${re}`);
  }
});

// ---------------------------------------------------------------------------
// O QUE NUNCA SE TRADUZ — números, datas e locus idênticos nos três idiomas
// ---------------------------------------------------------------------------
// Todo número arábico e todo locus com numeral romano (XVIII.321, I.6.12) que
// existe no PT tem que aparecer LITERAL na tradução do mesmo campo. É o que
// impede "762" de virar outra data e "XI.2.85" de perder o endereço.
function tokensQueNaoTraduzem(texto) {
  const t = new Set();
  for (const m of String(texto).matchAll(/\b[IVXLCDM]+\.\d+(?:[.-]\d+)*\b/g)) t.add(m[0]);
  for (const m of String(texto).matchAll(/\b\d+(?:\.\d+)*\b/g)) t.add(m[0]);
  return [...t];
}

test('números, datas e locus do PT aparecem literais em cada campo traduzido', () => {
  const pt = formaPt();
  const faltando = [];
  for (const lang of IDIOMAS_PACK) {
    for (const [id, g] of Object.entries(pt)) {
      const tr = PACKS[lang].rituais[id];
      for (const campo of CAMPOS_DE_RITUAL) {
        const ptVal = Array.isArray(g[campo]) ? g[campo].join('\n') : g[campo];
        const trVal = Array.isArray(tr[campo]) ? tr[campo].join('\n') : tr[campo];
        for (const token of tokensQueNaoTraduzem(ptVal)) {
          if (!String(trVal).includes(token)) faltando.push(`${lang}:${id}.${campo} perdeu "${token}"`);
        }
      }
    }
    for (const [chave, bloco] of Object.entries(R.LASTRO_MOMENTO_IDEAL)) {
      const tb = PACKS[lang].momentoIdeal[chave];
      const ptVal = [bloco.texto, ...(bloco.ressalvas || [])].join('\n');
      const trVal = [tb.texto, ...(tb.ressalvas || [])].join('\n');
      for (const token of tokensQueNaoTraduzem(ptVal)) {
        if (!trVal.includes(token)) faltando.push(`${lang}:lastro.${chave} perdeu "${token}"`);
      }
    }
  }
  assert.deepEqual(faltando, [], `Número/locus sumiu na tradução:\n  ${faltando.join('\n  ')}`);
});

test('os títulos latinos das obras ficam intactos nos packs', () => {
  const LATINAS = ['Tetrabiblos', 'Naturalis Historia', 'De Re Rustica', 'De Agri Cultura', 'Opus Agriculturae', 'Carmen Astrologicum'];
  for (const lang of IDIOMAS_PACK) {
    const obras = Object.values(PACKS[lang].fontes).map((f) => f.obra).join(' | ');
    for (const titulo of LATINAS) {
      assert.ok(obras.includes(titulo), `${lang}: a obra latina "${titulo}" foi traduzida ou sumiu`);
    }
  }
});

test('o verbatim em inglês da fonte fica em inglês também no espanhol', () => {
  // "comparatively recent" é citação da tradução de Cary (LacusCurtius) — no
  // PT ela já aparece entre aspas em inglês, e a regra vale para o ES: cita-se
  // o verbatim e parafraseia-se em volta, nunca se traduz a citação.
  assert.match(PACKS.es.momentoIdeal.semana.ressalvas[0], /"comparatively recent"/);
  assert.match(PACKS.en.momentoIdeal.semana.ressalvas[0], /"comparatively recent"/);
});

// ---------------------------------------------------------------------------
// O TOM NAS TRADUÇÕES — abre em conversa, fecha no recibo (mesma régua do PT)
// ---------------------------------------------------------------------------
function abreEmConversa(texto, lang) {
  const abertura = String(texto).slice(0, 60);
  if (/\d{4}/.test(abertura)) return false;
  if (lang === 'en' && /century/i.test(abertura)) return false;
  if (lang === 'es' && /siglo/i.test(abertura)) return false;
  const autores = Object.values(PACKS[lang].fontes).map((f) => f.autor);
  return !autores.some((a) => abertura.includes(a));
}

function fechaNoRecibo(texto, lang) {
  const pack = PACKS[lang];
  // Autor E obra contam como recibo: na prosa a obra às vezes aparece sem o
  // aposto do catálogo ("Chronology of Ancient Nations" sem o "(al-Āthār
  // al-bāqiya)"), mas o autor vem junto sempre.
  const tokens = [
    ...Object.values(pack.fontes).map((f) => f.obra),
    ...Object.values(pack.fontes).map((f) => f.autor),
    pack.semFonteAntiga,
  ];
  const posicoes = tokens.map((t) => String(texto).lastIndexOf(t)).filter((i) => i >= 0);
  if (posicoes.length === 0) return false;
  return Math.max(...posicoes) >= String(texto).length / 2;
}

test('a tradução mantém a ordem do PT: prende primeiro, recibo depois', () => {
  const erros = [];
  for (const lang of IDIOMAS_PACK) {
    for (const [id, tr] of Object.entries(PACKS[lang].rituais)) {
      for (const campo of ['intencao', 'momentoTexto']) {
        if (!abreEmConversa(tr[campo], lang)) erros.push(`${lang}:${id}.${campo} abre com fonte`);
        if (!fechaNoRecibo(tr[campo], lang)) erros.push(`${lang}:${id}.${campo} não fecha no recibo`);
      }
    }
    for (const [chave, tb] of Object.entries(PACKS[lang].momentoIdeal)) {
      if (!abreEmConversa(tb.texto, lang)) erros.push(`${lang}:lastro.${chave} abre com fonte`);
      if (!fechaNoRecibo(tb.texto, lang)) erros.push(`${lang}:lastro.${chave} não fecha no recibo`);
    }
  }
  assert.deepEqual(erros, [], `Tom fora da regra do app:\n  ${erros.join('\n  ')}`);
});

// A moldura do compartilhar nos três idiomas continua existindo no dicionário
// (as chaves são do chrome, mas o conteúdo desta frente depende delas).
test('as chaves de moldura do compartilhar existem nos três idiomas', () => {
  for (const lang of LANGUAGES) {
    for (const chave of ['rituais.share.line1', 'rituais.share.line2', 'rituais.momento.ou']) {
      const v = translate(lang, chave);
      assert.ok(v && v !== chave, `${lang}: ${chave} sem tradução`);
    }
  }
});
