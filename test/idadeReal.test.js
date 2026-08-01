// test/idadeReal.test.js
// A IDADE REAL DE CADA COISA — os testes que seguram a tabela.
//
// Nove trabalhos, e nenhum é enfeite:
//
// (a) O CATÁLOGO: 30 entradas, ids únicos em kebab-case, tema e grau dentro do
//     vocabulário do motor, e `anoOrigem` COERENTE com o campo `quando`. Este
//     último é o teste que impede o pior erro possível aqui: alguém trocar o
//     texto da data e esquecer o número, e a tela passar a imprimir uma idade
//     que não bate com a fonte impressa embaixo dela.
//
// (b) ENDEREÇO NA BASE: cada entrada aponta um arquivo REAL de docs/tradicao/
//     com locus. O teste abre o caminho — afirmação histórica sem endereço
//     verificável não entra (regra de ouro nº 1 da base).
//
// (c) O OURO: o português é a fonte de verdade e não pode ter mudado um byte.
//     O golden mora em test/golden/idadeReal.pt.golden.json, com o ano de
//     referência CRAVADO em 2026 para a fotografia não envelhecer. Ele trava os
//     30 itens campo a campo, as três ordenações, o chrome, os rótulos e os 30
//     compartilháveis. Se quebrar, o PT mudou: isso é falha, não melhoria, e
//     NÃO se conserta regenerando o golden.
//
// (d) A CONTA DA IDADE. A idade é calculada contra o ano corrente e arredondada
//     pelo passo da entrada — nunca tabelada (proposição 1 da tese, a mesma
//     regra que existe para efeméride). O teste prova a conta, prova que ela
//     ANDA quando o ano anda, e prova que "sem data" devolve `null` e não zero.
//
// (e) A PARIDADE dos três packs: mesmos 30 ids, mesmos campos, mesmas chaves de
//     chrome com os mesmos placeholders, nada vazio. Pack capenga = tela meio
//     traduzida em silêncio, que é o pior dos mundos porque ninguém reclama.
//
// (f) A LINHA VERMELHA NOS TRÊS IDIOMAS: saúde, promessa, mecanismo, veredito,
//     prova social inventada e aviso defensivo. As listas são as mesmas de
//     test/mitosIdiomas.test.js — a régua é do app, não da feature.
//
// (g) O QUE NUNCA SE TRADUZ (número, data, locus, título de obra) × O QUE TEM
//     que traduzir (nome consagrado, a palavra "século").
//
// (h) O TOM: prende primeiro, fonte depois, nos três idiomas; 2–3 frases,
//     tamanho de card; e termo técnico com glosa na primeira aparição.
//
// (i) NÃO DUPLICAR lib/mitos.js. Os dois catálogos compartilham ITENS de
//     propósito (Superlua está nos dois), mas não podem compartilhar PROSA: o
//     teste corta os textos em sequências de oito palavras e reprova qualquer
//     coincidência. O recibo (`fonte`) fica de fora da comparação nos dois
//     lados — citação idêntica é o que uma citação deve ser.
//
// Por que teste e não revisão: o risco não é errar hoje, é alguém daqui a três
// meses "melhorar" uma linha para converter mais, e a tabela que existe para
// datar o mercado virar a mesma sopa sem fonte que ela desmente.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

// --- fake do AsyncStorage, injetado ANTES do módulo sob teste ---------------
// lib/idadeReal.js grava o progresso via lib/storage.js, e lib/storage.js
// memoriza o módulo na primeira chamada — mesma armadilha documentada em
// test/mitos.test.js. E o fake sabe QUEBRAR: o cenário que interessa não é
// "não tem storage" e sim "a chamada estoura".
const memStorage = new Map();
let storageQuebrado = false;

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      if (storageQuebrado) throw new Error('SecurityError: storage access denied');
      return memStorage.has(k) ? memStorage.get(k) : null;
    },
    async setItem(k, v) {
      if (storageQuebrado) throw new Error('QuotaExceededError');
      memStorage.set(k, String(v));
    },
    async removeItem(k) {
      if (storageQuebrado) throw new Error('SecurityError: storage access denied');
      memStorage.delete(k);
    },
  },
};

const carregarOriginal = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return carregarOriginal.call(this, request, parent, isMain);
};

const M = require('../lib/idadeReal.js');
const MITOS = require('../lib/mitos.js');
const storageLib = require('../lib/storage.js');

const PACKS = {
  pt: require('../lib/traducoes/idadeReal.pt.js').default,
  es: require('../lib/traducoes/idadeReal.es.js').default,
  en: require('../lib/traducoes/idadeReal.en.js').default,
};
const PACKS_MITOS = {
  es: require('../lib/traducoes/mitos.es.js').default,
  en: require('../lib/traducoes/mitos.en.js').default,
};
const IDIOMAS = ['pt', 'es', 'en'];
const TRADUZIDOS = ['es', 'en'];

const RAIZ = path.join(__dirname, '..');

// O golden foi capturado com o ano CRAVADO — é o que faz a fotografia não
// envelhecer sozinha em 1º de janeiro.
const GOLDEN = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'golden', 'idadeReal.pt.golden.json'), 'utf8')
);
const ANO_GOLDEN = GOLDEN.anoRef;

const CAMPOS_DE_TEXTO = ['coisa', 'oQuePensam', 'quemInventou', 'quando', 'fonte', 'detalhe'];
// A comparação com lib/mitos.js roda só na PROSA — `fonte`, `quando` e
// `quemInventou` são recibo, e recibo igual é o objetivo de um recibo.
const CAMPOS_DE_PROSA = ['coisa', 'oQuePensam', 'detalhe'];

// ---------------------------------------------------------------------------
// (a) O CATÁLOGO
// ---------------------------------------------------------------------------
test('há 30 entradas, com ids únicos em kebab-case', () => {
  assert.equal(M.IDADE_REAL.length, 30, `o catálogo tem ${M.IDADE_REAL.length} entradas — o briefing pede 30`);
  const ids = M.IDADE_REAL.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, 'id duplicado no catálogo');
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, `id fora do padrão kebab-case: "${id}"`);
});

test('tema, grau e passo de arredondamento estão dentro do vocabulário do motor', () => {
  for (const e of M.IDADE_REAL) {
    assert.ok(M.TEMAS.includes(e.tema), `${e.id}: tema desconhecido "${e.tema}"`);
    assert.ok(M.GRAUS.includes(e.grau), `${e.id}: grau desconhecido "${e.grau}"`);
    assert.ok([1, 5, 10, 50].includes(e.arredondar), `${e.id}: passo de arredondamento estranho: ${e.arredondar}`);
    if (e.anoOrigem !== null) {
      assert.ok(
        Number.isInteger(e.anoOrigem) && e.anoOrigem > -3000 && e.anoOrigem <= 2100,
        `${e.id}: anoOrigem fora de faixa: ${e.anoOrigem}`
      );
    }
  }
  // Todo tema declarado tem pelo menos uma entrada — tema vazio é seção fantasma.
  for (const tema of M.TEMAS) {
    assert.ok(M.IDADE_REAL.some((e) => e.tema === tema), `tema "${tema}" não tem nenhuma entrada`);
  }
});

test('anoOrigem BATE com os anos escritos no campo `quando` (o erro que arruinaria a tela)', () => {
  // Se `quando` diz "1650" e `anoOrigem` diz 1750, a tela imprime uma idade que
  // contradiz o recibo impresso três linhas abaixo. A tolerância de 10 existe
  // para as décadas ("anos 1930" → 1935 é o meio da década).
  const erros = [];
  for (const e of M.IDADE_REAL) {
    const quando = PACKS.pt.itens[e.id].quando;
    const anos = [...quando.matchAll(/\b(1[0-9]{3}|20[0-9]{2})\b/g)].map((m) => Number(m[1]));
    if (!anos.length) {
      // Sem ano de quatro dígitos no texto: é período antigo ("séc. IX",
      // "c. 450–400 a.C.") ou entrada sem data. Nos dois casos o número não é
      // conferível aqui — mas "sem data exata" TEM que ter anoOrigem null.
      if (/sem data/i.test(quando) && e.anoOrigem !== null) {
        erros.push(`${e.id}: quando diz "sem data" mas anoOrigem é ${e.anoOrigem}`);
      }
      continue;
    }
    if (e.anoOrigem === null) {
      erros.push(`${e.id}: quando traz ano (${anos.join(', ')}) mas anoOrigem é null`);
      continue;
    }
    const min = Math.min(...anos) - 10;
    const max = Math.max(...anos) + 10;
    if (e.anoOrigem < min || e.anoOrigem > max) {
      erros.push(`${e.id}: anoOrigem ${e.anoOrigem} fora de "${quando}" (faixa tolerada ${min}–${max})`);
    }
  }
  assert.deepEqual(erros, [], `anoOrigem divergindo do texto da data:\n  ${erros.join('\n  ')}`);
});

test('as três entradas sem data dizem isso, e dizem nos três idiomas', () => {
  const semData = M.IDADE_REAL.filter((e) => e.anoOrigem === null).map((e) => e.id);
  assert.deepEqual(
    semData.sort(),
    ['frequencias-hz', 'mercurio-retrogrado', 'porcentagem-compatibilidade'],
    'mudou o conjunto de entradas sem data — se a pesquisa achou a fonte, o item ganha data; se perdeu, o teste é aqui'
  );
  for (const lang of IDIOMAS) {
    for (const id of semData) {
      const item = M.idadeRealPorId(id, lang, ANO_GOLDEN);
      assert.equal(item.anosAtras, null, `${lang}:${id}: idade deveria ser null (ausência), não ${item.anosAtras}`);
      assert.equal(item.idadeReal, PACKS[lang].tela.semData, `${lang}:${id}: rótulo de "sem data" errado`);
      // E o texto declara a ausência em vez de disfarçar.
      assert.match(
        item.quemInventou,
        lang === 'pt' ? /sem autor identificado/i : lang === 'es' ? /sin autor identificado/i : /no author identified/i,
        `${lang}:${id}: quemInventou não declara que a pesquisa não achou`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// (b) O ENDEREÇO NA BASE DE TRADIÇÃO
// ---------------------------------------------------------------------------
test('toda entrada aponta um arquivo REAL de docs/tradicao/ com locus', () => {
  for (const e of M.IDADE_REAL) {
    assert.ok(e.base && typeof e.base === 'object', `${e.id}: sem campo base`);
    assert.match(
      e.base.arquivo || '',
      /^docs\/tradicao\//,
      `${e.id}: base.arquivo fora de docs/tradicao/: "${e.base.arquivo}"`
    );
    assert.ok(fs.existsSync(path.join(RAIZ, e.base.arquivo)), `${e.id}: arquivo da base não existe: ${e.base.arquivo}`);
    assert.ok(
      typeof e.base.locus === 'string' && e.base.locus.trim().length > 0,
      `${e.id}: base.locus vazio — endereço sem número de porta`
    );
  }
  // A tabela do doc 10 §13 é a fonte da feature: a maioria das entradas tem que
  // apontar para lá. Se um dia isso deixar de valer, a feature virou outra.
  const doDoc10 = M.IDADE_REAL.filter((e) => /§13/.test(e.base.locus)).length;
  assert.ok(doDoc10 >= 25, `só ${doDoc10} entradas citam a tabela §13 — a feature perdeu a espinha`);
});

// ---------------------------------------------------------------------------
// (c) O OURO — o PT de hoje é byte a byte o PT do golden
// ---------------------------------------------------------------------------
test('OURO: as 30 entradas em PT são byte a byte as do golden', () => {
  assert.equal(M.LINK_COMPARTILHAR, GOLDEN.LINK_COMPARTILHAR, 'o link mudou');
  assert.equal(M.CHAVE_IDADE_VISTAS, GOLDEN.CHAVE_IDADE_VISTAS, 'a chave de storage mudou');
  assert.deepEqual(M.TEMAS, GOLDEN.TEMAS, 'a lista/ordem de temas mudou');
  assert.deepEqual(M.GRAUS, GOLDEN.GRAUS, 'a lista de graus mudou');
  assert.deepEqual(
    M.IDADE_REAL.map((e) => e.id),
    GOLDEN.ordemCanonica,
    'a ORDEM canônica do catálogo mudou — ela é o desempate de toda ordenação'
  );

  for (const id of GOLDEN.ordemCanonica) {
    const g = GOLDEN.itens[id];
    // Os dois caminhos da chamada antiga: sem idioma e com 'pt'.
    for (const modo of [undefined, 'pt']) {
      const item = M.idadeRealPorId(id, modo, ANO_GOLDEN);
      assert.ok(item, `${id} sumiu do catálogo`);
      for (const campo of [...CAMPOS_DE_TEXTO, 'idadeReal', 'tema', 'grau', 'anoOrigem', 'arredondar', 'anosAtras']) {
        assert.deepEqual(item[campo], g[campo], `${id}/${modo}: ${campo} mudou`);
      }
      assert.deepEqual(item.base, g.base, `${id}/${modo}: base mudou`);
      assert.equal(M.textoCompartilhavel(id, modo, ANO_GOLDEN), g.compartilhar, `${id}/${modo}: compartilhar mudou`);
      assert.equal(M.textoCompartilhavel(item, modo, ANO_GOLDEN), g.compartilhar, `${id}/${modo}: compartilhar por objeto mudou`);
    }
  }
});

test('OURO: as três ordenações da tela são as do golden', () => {
  const lista = M.idadesReais('pt', ANO_GOLDEN);
  assert.deepEqual(M.ordenarPorIdade(lista).map((x) => x.id), GOLDEN.ordemMaisNovoPrimeiro);
  assert.deepEqual(M.ordenarPorIdade(lista, { crescente: false }).map((x) => x.id), GOLDEN.ordemMaisAntigoPrimeiro);
  assert.deepEqual(
    M.agruparPorTema(lista, 'pt').map((g) => ({ tema: g.tema, nome: g.nome, itens: g.itens.map((i) => i.id) })),
    GOLDEN.gruposPorTema
  );
  // A tela ABRE pela mais nova, e a mais nova é a piada boa da feature: o
  // próprio gênero "app de astrologia".
  assert.equal(GOLDEN.ordemMaisNovoPrimeiro[0], 'app-astrologia');
  assert.equal(GOLDEN.ordemMaisAntigoPrimeiro[0], 'zodiaco-12');
});

test('OURO: o chrome, os temas, os graus e os rótulos em PT são os do golden', () => {
  assert.deepEqual(M.chromeDaTela(), GOLDEN.tela);
  assert.deepEqual(M.chromeDaTela('pt'), GOLDEN.tela);
  assert.deepEqual(PACKS.pt.formato, GOLDEN.formato);
  assert.deepEqual(PACKS.pt.temas, GOLDEN.temas);
  assert.deepEqual(PACKS.pt.graus, GOLDEN.graus);
  assert.deepEqual(PACKS.pt.compartilhar, GOLDEN.rotulosCompartilhar);
  assert.deepEqual(
    M.temasParaIdioma('pt'),
    M.TEMAS.map((id) => ({ id, nome: GOLDEN.temas[id] }))
  );
  assert.deepEqual(M.grauParaIdioma('FP', 'pt'), GOLDEN.graus.FP);
  assert.equal(M.grauParaIdioma('XX', 'pt'), null, 'grau desconhecido tem que devolver null, não estourar');

  // Os moldes com contagem, preenchidos.
  assert.equal(M.preencher(GOLDEN.tela.progresso, { n: 7, total: 30 }), 'Você já abriu 7 de 30.');
  assert.equal(
    M.preencher(GOLDEN.tela.comoContamos, { ano: 2026 }),
    'A idade aqui é conta, não tabela: 2026 menos o ano que a fonte dá. Por isso ela vira sozinha na virada do ano.'
  );
  // Chave que falta fica à vista no card, nunca vira "undefined" no meio da
  // frase — erro de moldura tem que parecer erro.
  assert.equal(M.preencher('{n} de {total}', { n: 3 }), '3 de {total}');
});

test('idioma desconhecido cai no PT — nunca numa tradução inventada na hora', () => {
  assert.deepEqual(M.chromeDaTela('fr'), GOLDEN.tela);
  assert.deepEqual(
    M.idadeRealPorId('superlua', 'fr', ANO_GOLDEN),
    M.idadeRealPorId('superlua', 'pt', ANO_GOLDEN)
  );
  assert.equal(M.idadeRealPorId('nao-existe'), null);
  assert.equal(M.textoCompartilhavel('nao-existe'), '');
  assert.equal(M.textoCompartilhavel(null), '');
});

// ---------------------------------------------------------------------------
// (d) A CONTA DA IDADE — calculada, nunca tabelada
// ---------------------------------------------------------------------------
test('a idade é ano de referência menos ano de origem, arredondado pelo passo da entrada', () => {
  for (const e of M.IDADE_REAL) {
    if (e.anoOrigem === null) {
      assert.equal(M.idadeEmAnos(e, ANO_GOLDEN), null, `${e.id}: sem data tem que devolver null, não número`);
      continue;
    }
    const cru = ANO_GOLDEN - e.anoOrigem;
    const esperado = e.arredondar <= 1 ? cru : Math.round(cru / e.arredondar) * e.arredondar;
    assert.equal(M.idadeEmAnos(e, ANO_GOLDEN), esperado, `${e.id}: a conta não fecha`);
    assert.equal(M.idadeEmAnos(e.id, ANO_GOLDEN), esperado, `${e.id}: a conta por id não fecha`);
  }
  // Os números que a base imprime, conferidos um a um nos casos cravados.
  assert.equal(M.idadeEmAnos('superlua', 2026), 47);
  assert.equal(M.idadeEmAnos('horoscopo-jornal', 2026), 96);
  assert.equal(M.idadeEmAnos('oito-fases', 2026), 90);
  assert.equal(M.idadeEmAnos('saturno-mestre', 2026), 50);
  assert.equal(M.idadeEmAnos('astrologia-tradicional', 2026), 33);
  assert.equal(M.idadeEmAnos('app-astrologia', 2026), 9);
  assert.equal(M.idadeEmAnos('zodiaco-12', 2026), 2450);
  assert.equal(M.idadeEmAnos('taro-divinatorio', 2026), 245);
  assert.equal(M.idadeEmAnos('aspectos-menores', 2026), 400);
});

test('a idade ANDA com o ano — é conta, não tabela (proposição 1 da tese)', () => {
  // Este é o teste que impede alguém de "simplificar" gravando a idade como
  // string no pack. Em 2027 a Superlua tem 48; se continuar 47, virou tabela.
  assert.equal(M.idadeEmAnos('superlua', 2027), 48);
  assert.equal(M.idadeEmAnos('superlua', 2050), 71);
  assert.equal(M.rotuloDeIdade('superlua', 'pt', 2027), '48 anos');
  assert.equal(M.rotuloDeIdade('superlua', 'en', 2027), '48 years');
  // E o passo de arredondamento continua valendo em qualquer ano.
  assert.equal(M.idadeEmAnos('zodiaco-12', 2074), 2500);
  // anoAtual() é função e lê o ano do relógio que recebe.
  assert.equal(M.anoAtual(new Date(2031, 4, 9)), 2031);
  assert.equal(typeof M.anoAtual(), 'number');
});

test('o rótulo separa o cravado do aproximado, e formata o milhar no idioma', () => {
  // Data cravada sai sem "cerca de": a diferença entre o que a fonte crava e o
  // que ela estima é conteúdo, não estilo.
  assert.equal(M.rotuloDeIdade('superlua', 'pt', 2026), '47 anos');
  assert.equal(M.rotuloDeIdade('placidus', 'pt', 2026), 'cerca de 380 anos');
  assert.equal(M.rotuloDeIdade('zodiaco-12', 'pt', 2026), 'cerca de 2.450 anos');
  assert.equal(M.rotuloDeIdade('zodiaco-12', 'es', 2026), 'cerca de 2.450 años');
  assert.equal(M.rotuloDeIdade('zodiaco-12', 'en', 2026), 'about 2,450 years');
  assert.equal(M.rotuloDeIdade('porcentagem-compatibilidade', 'pt', 2026), 'sem data');
  assert.equal(M.rotuloDeIdade('porcentagem-compatibilidade', 'en', 2026), 'no date');
  assert.equal(M.rotuloDeIdade('nao-existe', 'pt', 2026), '');
});

// ---------------------------------------------------------------------------
// AS ORDENAÇÕES — sem mutar, com ausência no fim e desempate estável
// ---------------------------------------------------------------------------
test('ordenar não mexe na lista recebida, e a ausência vai para o fim nas duas direções', () => {
  const lista = M.idadesReais('pt', ANO_GOLDEN);
  const antes = lista.map((x) => x.id);
  const crescente = M.ordenarPorIdade(lista);
  const decrescente = M.ordenarPorIdade(lista, { crescente: false });
  assert.deepEqual(lista.map((x) => x.id), antes, 'ordenarPorIdade mutou o array recebido');

  const semDataNoFim = (ordenada) => ordenada.slice(-3).every((x) => x.anosAtras === null);
  assert.ok(semDataNoFim(crescente), 'as entradas sem data não ficaram no fim da ordem crescente');
  assert.ok(semDataNoFim(decrescente), 'as entradas sem data não ficaram no fim da ordem decrescente');

  const comData = (l) => l.filter((x) => x.anosAtras !== null).map((x) => x.anosAtras);
  const asc = comData(crescente);
  const desc = comData(decrescente);
  for (let i = 1; i < asc.length; i++) assert.ok(asc[i] >= asc[i - 1], 'ordem crescente quebrada');
  for (let i = 1; i < desc.length; i++) assert.ok(desc[i] <= desc[i - 1], 'ordem decrescente quebrada');

  // Empate desempata pela ordem canônica — a lista não pode dançar entre dois
  // carregamentos, e há empates de verdade (três itens com 90, dois com 2.150).
  const posicao = new Map(M.IDADE_REAL.map((e, i) => [e.id, i]));
  for (let i = 1; i < crescente.length; i++) {
    if (crescente[i].anosAtras === crescente[i - 1].anosAtras) {
      assert.ok(
        posicao.get(crescente[i - 1].id) < posicao.get(crescente[i].id),
        `empate desempatado fora da ordem canônica: ${crescente[i - 1].id} / ${crescente[i].id}`
      );
    }
  }
  assert.ok(
    new Set(asc).size < asc.length,
    'não há mais nenhum empate de idade — o desempate deixou de ser testado de verdade'
  );
});

test('agrupar por tema cobre todo mundo, uma vez só, e na ordem de TEMAS', () => {
  for (const lang of IDIOMAS) {
    const lista = M.idadesReais(lang, ANO_GOLDEN);
    const grupos = M.agruparPorTema(lista, lang);
    assert.deepEqual(
      grupos.map((g) => g.tema),
      M.TEMAS.filter((t) => lista.some((x) => x.tema === t)),
      `${lang}: a ordem dos grupos não é a de TEMAS`
    );
    const todos = grupos.flatMap((g) => g.itens.map((i) => i.id));
    assert.equal(todos.length, lista.length, `${lang}: item sumiu ou apareceu duas vezes no agrupamento`);
    assert.equal(new Set(todos).size, lista.length, `${lang}: item duplicado entre grupos`);
    for (const g of grupos) {
      assert.ok(g.nome && g.nome.trim().length > 0, `${lang}: grupo ${g.tema} sem nome`);
      assert.ok(g.itens.length > 0, `${lang}: grupo ${g.tema} vazio virou seção`);
    }
  }
});

// ---------------------------------------------------------------------------
// (e) PARIDADE — mesma forma nos três, sem valor vazio
// ---------------------------------------------------------------------------
function placeholders(s) {
  return [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

test('PARIDADE: os três packs têm os 30 ids, os seis campos e o mesmo chrome', () => {
  const idsMotor = M.IDADE_REAL.map((e) => e.id).sort();
  for (const lang of IDIOMAS) {
    const pack = PACKS[lang];
    assert.ok(pack && typeof pack === 'object', `pack ${lang} não carregou`);
    assert.deepEqual(
      Object.keys(pack.itens).sort(),
      idsMotor,
      `${lang}: ids do pack ≠ ids do motor — entrada nova entrou sem tradução`
    );
    for (const id of idsMotor) {
      const tr = pack.itens[id];
      assert.deepEqual(
        Object.keys(tr).sort(),
        [...CAMPOS_DE_TEXTO].sort(),
        `${lang}:${id}: campos do pack ≠ forma aprovada`
      );
      for (const campo of CAMPOS_DE_TEXTO) {
        assert.ok(
          typeof tr[campo] === 'string' && tr[campo].trim().length > 0,
          `${lang}:${id}.${campo} vazio`
        );
      }
      // O recibo continua sendo recibo: ano ou século, nunca etiqueta.
      assert.ok(
        /\d{3,4}|séc\.|siglo|century/i.test(tr.fonte),
        `${lang}:${id}: fonte sem ano nem século: "${tr.fonte}"`
      );
    }

    // Chrome: mesmas chaves de PT, mesmos placeholders, nada vazio.
    assert.deepEqual(Object.keys(pack.tela).sort(), Object.keys(PACKS.pt.tela).sort(), `${lang}: chaves de tela ≠ PT`);
    for (const [chave, valor] of Object.entries(pack.tela)) {
      assert.ok(typeof valor === 'string' && valor.trim().length > 0, `${lang}: tela.${chave} vazio`);
      assert.deepEqual(
        placeholders(valor),
        placeholders(PACKS.pt.tela[chave]),
        `${lang}: tela.${chave} perdeu ou inventou placeholder`
      );
    }
    // O domínio não se traduz — é endereço, igual ao link.
    assert.equal(pack.tela.marca, PACKS.pt.tela.marca, `${lang}: a marca d'água virou tradução`);
    // A assinatura visual do título (o ×) some fácil numa tradução distraída.
    assert.ok(pack.tela.subtitulo.includes('×'), `${lang}: o subtítulo perdeu o ×`);

    // Temas, graus, formato e rótulos.
    assert.deepEqual(Object.keys(pack.temas).sort(), [...M.TEMAS].sort(), `${lang}: temas ≠ TEMAS`);
    assert.deepEqual(Object.keys(pack.graus).sort(), [...M.GRAUS].sort(), `${lang}: graus ≠ GRAUS`);
    for (const sigla of M.GRAUS) {
      const g = pack.graus[sigla];
      assert.deepEqual(Object.keys(g).sort(), ['glosa', 'nome'], `${lang}: grau ${sigla} fora da forma`);
      for (const v of Object.values(g)) assert.ok(v.trim().length > 0, `${lang}: grau ${sigla} com campo vazio`);
    }
    assert.ok(
      typeof pack.formato.separadorMilhar === 'string' && pack.formato.separadorMilhar.length === 1,
      `${lang}: separadorMilhar fora de forma`
    );
    assert.deepEqual(
      Object.keys(pack.compartilhar).sort(),
      [...M.ROTULOS_COMPARTILHAR_CHAVES].sort(),
      `${lang}: rótulos do compartilhável ≠ contrato`
    );
    for (const [chave, valor] of Object.entries(pack.compartilhar)) {
      assert.ok(typeof valor === 'string' && valor.trim().length > 0, `${lang}: compartilhar.${chave} vazio`);
      assert.ok(valor.trim().endsWith(':'), `${lang}: compartilhar.${chave} sem os dois pontos`);
    }
  }
});

test('com lang, SÓ o texto troca: id, tema, grau, ano e base ficam canônicos', () => {
  for (const lang of TRADUZIDOS) {
    const lista = M.idadesReais(lang, ANO_GOLDEN);
    assert.equal(lista.length, M.IDADE_REAL.length);
    lista.forEach((item, i) => {
      const base = M.IDADE_REAL[i];
      // O id é a chave do storage: traduzi-lo apagaria o progresso de quem
      // trocasse de idioma.
      assert.equal(item.id, base.id, `${lang}: o id foi traduzido`);
      assert.equal(item.tema, base.tema, `${lang}:${base.id}: o tema foi traduzido (é código, não texto)`);
      assert.equal(item.grau, base.grau, `${lang}:${base.id}: a sigla do grau foi traduzida`);
      assert.equal(item.anoOrigem, base.anoOrigem, `${lang}:${base.id}: o ano de origem mudou com o idioma`);
      assert.deepEqual(item.base, base.base, `${lang}:${base.id}: a base (docs/tradicao) foi traduzida`);
      for (const campo of CAMPOS_DE_TEXTO) {
        assert.equal(item[campo], PACKS[lang].itens[base.id][campo], `${lang}:${base.id}: ${campo} não veio do pack`);
      }
      // A idade é a MESMA nos três — é conta, não opinião. Só o rótulo traduz.
      assert.equal(item.anosAtras, M.idadeEmAnos(base, ANO_GOLDEN), `${lang}:${base.id}: a idade mudou com o idioma`);
    });
  }
});

test('o compartilhável sai inteiro no idioma, é idempotente e fecha no MESMO link', () => {
  for (const id of M.IDADE_REAL.map((e) => e.id)) {
    for (const lang of IDIOMAS) {
      const pack = PACKS[lang];
      const item = M.idadeRealPorId(id, lang, ANO_GOLDEN);
      const txt = M.textoCompartilhavel(id, lang, ANO_GOLDEN);
      const linhas = txt.split('\n');
      assert.equal(linhas.length, 6, `${lang}:${id}: o compartilhável deixou de ter seis linhas`);
      assert.equal(linhas[0], item.coisa, `${lang}:${id}: a primeira linha não é a coisa`);
      assert.ok(linhas[1].startsWith(pack.compartilhar.idade), `${lang}:${id}: rótulo de idade fora`);
      assert.ok(linhas[2].startsWith(pack.compartilhar.pensam), `${lang}:${id}: rótulo do que pensam fora`);
      assert.ok(linhas[3].startsWith(pack.compartilhar.quem), `${lang}:${id}: rótulo de quem inventou fora`);
      assert.ok(linhas[4].startsWith(pack.compartilhar.recibo), `${lang}:${id}: rótulo do recibo fora`);
      assert.equal(linhas[5], M.LINK_COMPARTILHAR, `${lang}:${id}: não termina no link`);
      assert.ok(txt.includes(item.fonte), `${lang}:${id}: compartilhável sem o recibo`);
      // Ponto duplo: "c. 450–400 a.C." já termina em ponto.
      assert.ok(!/\.\.$/m.test(txt), `${lang}:${id}: ponto duplo no fim de uma linha`);
      // Passar o item JÁ LOCALIZADO dá o mesmo resultado — o id manda.
      assert.equal(M.textoCompartilhavel(item, lang, ANO_GOLDEN), txt, `${lang}:${id}: não é idempotente`);
    }
    // O link é literal e o mesmo nos três — endereço não se traduz.
    for (const lang of IDIOMAS) {
      assert.ok(M.textoCompartilhavel(id, lang, ANO_GOLDEN).endsWith('https://cosmicguide.cloud/cosmic-guide/'));
    }
  }
});

// ---------------------------------------------------------------------------
// (f) A LINHA VERMELHA — saúde, promessa, veredito e prova social, nos TRÊS
// ---------------------------------------------------------------------------
// Mesmas listas de test/mitosIdiomas.test.js: a régua é do app, não da feature.
const PROIBIDO = {
  pt: [
    /\balivi\w*/iu, /\bacalm\w*/iu, /\bcur(?:a|ar|am|ou|ando|ada?s?|ado?s?)\b/iu,
    /\btrat(?:a|ar|am|ou|ando|amentos?)\b/iu, /\benergiz\w*/iu, /\brelax\w*/iu,
    /\bequilibr\w*/iu, /\bharmoniz\w*/iu, /\bgarant\w*/iu, /\bdestrav\w*/iu,
    /\bproteg\w*/iu, /\bafast\w*/iu, /\benergia\b/iu, /\bvibra\w*/iu, /\bcigan\w*/iu,
    /\bfals[oa]\b/iu, /\bmentira\b/iu, /\bburr\w*/iu, /\bingênu\w*/iu, /\benganad\w*/iu,
    /\bcharlat\w*/iu, /\bpicaret\w*/iu, /\bgolpe\b/iu,
  ],
  es: [
    /\balivi/i, /\bcalm/i, /\bsana(r|s|n)?\b/i, /\bcur(a|ar|ación|ativ)/i,
    /\btrat(a|ar|e|en|amiento)\b/i, /\benergiz/i, /\brelaj/i, /\btranquiliz/i,
    /\bansiedad/i, /\bestr[eé]s\b/i, /\binsomnio\b/i, /\bsalud\b/i, /\bbienestar\b/i,
    /\bterap[eé]utic/i, /\bequilibr/i, /\barmoniz/i, /\bdesintoxic/i, /\bcortisol\b/i,
    /\bsistema nervioso\b/i, /\batra(e|er|iga|cci[óo]n)/i, /\bgarant/i, /\bpromet/i,
    /\bmanifest/i, /\babre camino/i, /\bdesbloque/i, /\bdestrab/i, /\bahuyent/i,
    /\bespant/i, /\bproteg/i, /\bblinda/i, /\bneutraliz/i, /\bpoderos/i, /\binfalible/i,
    /\b(da|trae) suerte\b/i, /\bcontrol(a|ar|e)\b/i, /\benerg[íi]a\b/i, /\benerg[ée]tic/i,
    /\bvibraci/i, /\baura\b/i, /\bchakra/i, /\bmagnetismo\b/i, /\bmal de ojo\b/i,
    /\bpurific/i, /\bfals[oa]\b/i, /\bmentira\b/i, /\bengañad/i, /\bingenu/i,
    /\btont[oa]\b/i, /\bcharlat/i, /\bestaf/i, /\bmiles de personas\b/i,
    /\bmillones de (personas|usuarios)\b/i, /\bcigan/i, /\bgitan/i,
    /no garantiza/i, /sin (ninguna )?promesa/i, /no promete/i, /sin garant[íi]a/i, /aviso legal/i,
  ],
  en: [
    /\bheal/i, /\bcur(e|ing|ative)/i, /\btreat/i, /\brelie(f|ve|ving)/i, /\bsooth/i,
    /\bcalm/i, /\benergi[sz]e/i, /\brelax/i, /\banxiety\b/i, /\bstress\b/i,
    /\binsomnia\b/i, /\bwell-?being\b/i, /\btherapeutic/i, /\bdepress/i, /\bdetox/i,
    /\bcortisol\b/i, /\bnervous system\b/i, /\bimmun/i, /\binvigorat/i, /\bharmoniz/i,
    /\bbalanc/i, /\battract/i, /\bguarantee/i, /\bmanifest/i, /\bunblock/i, /\bunlock/i,
    /\bward(s|ing)? off/i, /\bbanish/i, /\brepel/i, /\bprotect/i,
    /\bopens? (the )?(path|road|way)/i, /\bpowerful\b/i, /\binfallible\b/i,
    /\bbrings? luck\b/i, /\bgood luck\b/i, /\bmakes? it happen\b/i, /\bdominate/i,
    /\benergy\b/i, /\benergetic/i, /\bvibration/i, /\bvibe\b/i, /\baura\b/i,
    /\bchakra/i, /\bmagnetism\b/i, /\bevil eye\b/i, /\bpurif/i, /\bcleans(e|ing)\b/i,
    /\bfake\b/i, /\bbogus\b/i, /\bnonsense\b/i, /\bgullible\b/i, /\bstupid\b/i,
    /\bdumb\b/i, /\bsucker/i, /\bscam/i, /\bcharlatan/i, /\bhoax\b/i, /\bdebunk/i,
    /\bthousands of (people|readers|users)\b/i, /\bmillions of (people|readers|users)\b/i,
    /\bgypsy\b/i, /\bgypsies\b/i,
    /not? guarantee/i, /no promise/i, /does not promise/i, /disclaimer/i, /legal notice/i,
  ],
};

// Tudo que a pessoa pode ler num idioma: os seis campos das 30 entradas, o
// chrome, os temas, os graus, os rótulos e o compartilhável montado.
function textosVisiveis(lang) {
  const saida = [];
  const pack = PACKS[lang];
  for (const [k, v] of Object.entries(pack.tela)) saida.push([`${lang}.tela.${k}`, v]);
  for (const [k, v] of Object.entries(pack.temas)) saida.push([`${lang}.tema.${k}`, v]);
  for (const [k, v] of Object.entries(pack.graus)) {
    saida.push([`${lang}.grau.${k}.nome`, v.nome]);
    saida.push([`${lang}.grau.${k}.glosa`, v.glosa]);
  }
  for (const [k, v] of Object.entries(pack.compartilhar)) saida.push([`${lang}.rotulo.${k}`, v]);
  for (const item of M.idadesReais(lang, ANO_GOLDEN)) {
    for (const campo of CAMPOS_DE_TEXTO) saida.push([`${lang}.${item.id}.${campo}`, item[campo]]);
    saida.push([`${lang}.${item.id}.idadeReal`, item.idadeReal]);
    saida.push([`${lang}.${item.id}.compartilhar`, M.textoCompartilhavel(item, lang, ANO_GOLDEN)]);
  }
  return saida;
}

test('LINHA VERMELHA: nenhuma palavra proibida em NENHUM dos três idiomas', () => {
  const violacoes = [];
  for (const lang of IDIOMAS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      for (const re of PROIBIDO[lang]) {
        const achou = String(texto).match(re);
        if (achou) violacoes.push(`${onde}: "${achou[0]}" (${re})`);
      }
    }
  }
  assert.deepEqual(
    violacoes,
    [],
    'Palavra proibida (saúde, promessa, mecanismo, veredito ou prova social) em texto ' +
      'visível. Reescreva por SENTIDO, sem o vocabulário — a régua vale nos três ' +
      'idiomas:\n  ' + violacoes.join('\n  ')
  );
});

test('a varredura MORDE — ela pega a frase que existe para ser pega', () => {
  // Varredura que nunca acha nada passa a vida verde e não protege ninguém.
  const DEVE_PEGAR = {
    pt: ['Isso acalma a mente e trata a ansiedade.', 'Quem acredita nisso é ingênuo.'],
    es: ['Esto calma la mente y trata la ansiedad.', 'El mercado te miente, es falso.'],
    en: ['This calms the mind and treats anxiety.', 'The whole thing is a scam, pure nonsense.'],
  };
  for (const lang of IDIOMAS) {
    for (const frase of DEVE_PEGAR[lang]) {
      assert.ok(
        PROIBIDO[lang].some((re) => re.test(frase)),
        `${lang}: a varredura deixou passar "${frase}"`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// (g) O QUE NUNCA SE TRADUZ × O QUE TEM QUE TRADUZIR
// ---------------------------------------------------------------------------
// Separador de milhar muda de idioma (2.450 → 2,450): normalize antes de
// extrair. Locus com numeral romano (I.13, II.453–465) e número simples têm que
// reaparecer LITERAIS.
function normalizarMilhar(texto) {
  return String(texto).replace(/(\d)[.,](\d{3})\b/g, '$1$2');
}

function tokensQueNaoTraduzem(texto) {
  const t = new Set();
  const limpo = normalizarMilhar(texto);
  for (const m of limpo.matchAll(/\b[IVXLCDM]+\.\d+(?:[.:–\-]\d+)*\b/g)) t.add(m[0]);
  for (const m of limpo.matchAll(/\b\d+(?:[.:]\d+)*\b/g)) t.add(m[0]);
  return [...t];
}

test('números, datas e locus do PT aparecem literais em cada campo traduzido', () => {
  const faltando = [];
  for (const lang of TRADUZIDOS) {
    for (const e of M.IDADE_REAL) {
      for (const campo of CAMPOS_DE_TEXTO) {
        const trVal = normalizarMilhar(PACKS[lang].itens[e.id][campo]);
        for (const token of tokensQueNaoTraduzem(PACKS.pt.itens[e.id][campo])) {
          if (!trVal.includes(token)) faltando.push(`${lang}:${e.id}.${campo} perdeu "${token}"`);
        }
      }
    }
  }
  assert.deepEqual(faltando, [], `Número/data/locus sumiu na tradução:\n  ${faltando.join('\n  ')}`);
});

test('título de obra e locus ficam intactos nos dois packs', () => {
  const OBRAS = [
    ['homem-zodiacal', 'Astronomica II.453–465'],
    ['aspectos-maiores', 'Tetrabiblos I.13'],
    ['urano-aquario', 'Tetrabiblos I.17'],
    ['porcentagem-compatibilidade', 'Tetrabiblos IV.7'],
    ['aspectos-menores', 'Harmonice Mundi'],
    ['taro-divinatorio', 'Le Monde primitif'],
    ['taro-divinatorio', 'Du Jeu des Tarots'],
    ['rider-waite', 'The Pictorial Key to the Tarot'],
    ['oito-fases', 'The Astrology of Personality'],
    ['oito-fases', 'The Lunation Cycle'],
    ['potencial-psicologico', 'The Astrology of Personality'],
    ['retratos-goodman', 'Sun Signs'],
    ['nodos-missao', 'Karmic Astrology'],
    ['lua-de-sangue', 'Four Blood Moons'],
    ['luas-cheias-nomes', "Maine Farmers' Almanac"],
    ['simbolos-borra-cafe', 'Tea-Cup Reading'],
    ['simbolos-borra-cafe', 'A Highland Seer'],
    ['superlua', 'Dell Horoscope'],
    ['horoscopo-jornal', 'Sunday Express'],
    ['horoscopo-jornal', '24/08/1930'],
    ['placidus', 'Swiss Ephemeris'],
    ['astrologia-tradicional', 'Project Hindsight'],
    ['app-astrologia', 'Co-Star'],
    ['app-astrologia', 'The Pattern'],
    ['casas-inteiras', 'Brennan'],
  ];
  const faltando = [];
  for (const lang of TRADUZIDOS) {
    for (const [id, obra] of OBRAS) {
      const tudo = CAMPOS_DE_TEXTO.map((c) => PACKS[lang].itens[id][c]).join(' | ');
      if (!tudo.includes(obra)) faltando.push(`${lang}:${id} perdeu "${obra}"`);
    }
  }
  assert.deepEqual(faltando, [], `Obra ou locus traduzido/sumido:\n  ${faltando.join('\n  ')}`);
});

test('nome consagrado TRADUZ — Ptolomeu vira Ptolomeo e Ptolemy, não fica em português', () => {
  // O outro lado da regra: o que não se traduz fica; o que se traduz TEM que
  // mudar. Nome em português dentro do pack em inglês é tradução pela metade —
  // e passa despercebido porque "Ptolomeu" parece nome próprio.
  const NOMES = [
    ['homem-zodiacal', 'Ptolomeu', 'Ptolomeo', 'Ptolemy'],
    ['homem-zodiacal', 'Manílio', 'Manilio', 'Manilius'],
    ['homem-zodiacal', 'Vétio Valente', 'Vetio Valente', 'Vettius Valens'],
    ['porcentagem-compatibilidade', 'Doroteu', 'Doroteo', 'Dorotheus'],
    ['karma-mapa', 'Teosofia', 'Teosofía', 'Theosophy'],
    ['zodiaco-12', 'Babilônia', 'Babilonia', 'Babylon'],
  ];
  const erros = [];
  for (const [id, formaPt, esperadoEs, esperadoEn] of NOMES) {
    const esperado = { es: esperadoEs, en: esperadoEn };
    for (const lang of TRADUZIDOS) {
      const doItem = CAMPOS_DE_TEXTO.map((c) => PACKS[lang].itens[id][c]).join(' | ');
      if (!doItem.includes(esperado[lang])) erros.push(`${lang}:${id} não traz "${esperado[lang]}"`);
      // A forma portuguesa não pode sobrar em NENHUMA entrada do pack, não só
      // nesta: o vazamento acontece na entrada em que ninguém foi conferir.
      for (const [outroId, tr] of Object.entries(PACKS[lang].itens)) {
        const tudo = CAMPOS_DE_TEXTO.map((c) => tr[c]).join(' | ');
        if (tudo.includes(formaPt)) erros.push(`${lang}:${outroId} ficou com a forma portuguesa "${formaPt}"`);
      }
    }
  }
  assert.deepEqual(erros, [], `Nome consagrado sem tradução:\n  ${erros.join('\n  ')}`);
});

test('o século sai no idioma: "séc." e "anos" não sobrevivem em es nem en', () => {
  for (const lang of TRADUZIDOS) {
    for (const e of M.IDADE_REAL) {
      for (const campo of CAMPOS_DE_TEXTO) {
        const v = PACKS[lang].itens[e.id][campo];
        assert.ok(!/séc\./.test(v), `${lang}:${e.id}.${campo} ficou com "séc."`);
        assert.ok(!/\banos\b/.test(v), `${lang}:${e.id}.${campo} ficou com "anos"`);
      }
    }
    const tudo = Object.values(PACKS[lang].itens)
      .map((tr) => CAMPOS_DE_TEXTO.map((c) => tr[c]).join(' '))
      .join(' ');
    assert.match(tudo, lang === 'es' ? /siglo/i : /century/i, `${lang}: nenhum século no idioma`);
  }
  // E o rótulo em inglês não é a tradução literal do português: o card de um
  // app americano chama a caixa de citação de RECEIPTS, que é a palavra que a
  // internet em inglês já usa para "prova".
  assert.match(PACKS.en.tela.recibo, /receipt/i, 'en: o recibo perdeu "receipts"');
  assert.match(PACKS.en.compartilhar.recibo, /receipt/i, 'en: o rótulo do compartilhável perdeu "receipts"');
  assert.match(PACKS.es.compartilhar.pensam, /cre/i, 'es: o rótulo perdeu a voz de conversa');
});

// ---------------------------------------------------------------------------
// (h) O TOM — prende primeiro, tamanho de card, e glosa de termo técnico
// ---------------------------------------------------------------------------
// Contagem de frases tolerante às abreviações da casa (séc., a.C., d.C., c. de
// circa, vol. e iniciais de autor) — sem isso "410 a.C." viraria duas frases.
function contarFrases(texto) {
  const limpo = String(texto)
    .replace(/\ba\.C\./g, 'aC')
    .replace(/\bd\.C\./g, 'dC')
    .replace(/\bs[ée]c\./g, 'sec')
    .replace(/\bvol\./gi, 'vol')
    .replace(/\bc\.\s/g, 'c ')
    .replace(/\b[A-Z]\.\s?/g, 'X');
  return limpo.split(/[.!?…]+(?:\s+|$)/).filter((f) => f.trim().length > 0).length;
}

test('TOM: o detalhe abre na vida real — sem ano nem século nos 60 primeiros, nos três', () => {
  const erros = [];
  for (const lang of IDIOMAS) {
    const palavraSeculo = lang === 'pt' ? /séc\./ : lang === 'es' ? /siglo/i : /century/i;
    for (const e of M.IDADE_REAL) {
      const abertura = PACKS[lang].itens[e.id].detalhe.slice(0, 60);
      if (/\b1[0-9]{3}\b|\b20[0-2][0-9]\b/.test(abertura)) erros.push(`${lang}:${e.id} abre com ano: "${abertura}…"`);
      if (palavraSeculo.test(abertura)) erros.push(`${lang}:${e.id} abre com século: "${abertura}…"`);
    }
  }
  assert.deepEqual(erros, [], `Detalhe abrindo no recibo em vez da vida real:\n  ${erros.join('\n  ')}`);
});

test('TOM: o detalhe tem 2–3 frases e tamanho de card, nos três', () => {
  for (const lang of IDIOMAS) {
    for (const e of M.IDADE_REAL) {
      const d = PACKS[lang].itens[e.id].detalhe;
      const n = contarFrases(d);
      assert.ok(n >= 2 && n <= 3, `${lang}:${e.id}: detalhe com ${n} frase(s) — o card pede 2 a 3`);
      assert.ok(d.length <= 500, `${lang}:${e.id}: detalhe com ${d.length} chars — longo demais pra card`);
      // E o que a pessoa vê fechado tem que caber numa linha e meia.
      assert.ok(
        PACKS[lang].itens[e.id].coisa.length <= 90,
        `${lang}:${e.id}: "coisa" com ${PACKS[lang].itens[e.id].coisa.length} chars — não cabe na linha do card`
      );
    }
  }
});

// A glosa: na PRIMEIRA vez que um termo técnico aparece dentro de uma PEÇA, ele
// vem seguido de tradução. O padrão é o de lib/lunarCalendar.js e a régua é a
// de test/glossario.test.js — aqui a peça é UMA entrada, na ordem em que a tela
// a mostra, porque quem abre o card do Placidus não abriu o do zodíaco.
const JANELA_GLOSA = 120;
const MARCA_DE_GLOSA =
  /—|–|\(|,\s|:|\bquer dizer\b|\bquiere decir\b|\bmeans\b|\b[ée]\b|\bera\b|\bs[ãa]o\b|\bes\b|\bson\b|\bis\b|\bare\b/i;

const TERMOS_TECNICOS = {
  pt: [
    ['eclíptica', /ecl[íi]ptica/i],
    ['domicílio', /domic[íi]lio/i],
    ['seita', /\bseita\b/i],
    ['lote', /\blotes?\b/i],
    ['perigeu-sizígia', /perigeu-siz[íi]gia/i],
    ['jyotish', /jyotish/i],
  ],
  es: [
    ['eclíptica', /ecl[íi]ptica/i],
    ['domicilio', /domicilio/i],
    ['secta', /\bsecta\b/i],
    ['lote', /\blotes?\b/i],
    ['perigeo-sicigia', /perigeo-sicigia/i],
    ['jyotish', /jyotish/i],
  ],
  en: [
    ['ecliptic', /\becliptic\b/i],
    ['domicile', /\bdomicile\b/i],
    ['sect', /\bsect\b/i],
    ['lot', /\blots?\b/i],
    ['perigee syzygy', /perigee syzygy/i],
    ['jyotish', /jyotish/i],
  ],
};

function conferirPeca(onde, textos, termos, erros) {
  const inteiro = textos.filter((t) => typeof t === 'string' && t.length).join(' \n ');
  for (const [nome, padrao] of termos) {
    const m = inteiro.match(padrao);
    if (!m) continue;
    const fim = m.index + m[0].length;
    const janela = inteiro.slice(fim, fim + JANELA_GLOSA);
    if (!(MARCA_DE_GLOSA.test(janela) && janela.trim().length > 6)) {
      erros.push(`${onde}: "${nome}" aparece sem tradução nos ${JANELA_GLOSA} caracteres seguintes`);
    }
  }
}

test('nenhum termo técnico chega à tela sem glosa na primeira vez que aparece na entrada', () => {
  const erros = [];
  for (const lang of IDIOMAS) {
    for (const item of M.idadesReais(lang, ANO_GOLDEN)) {
      // A ordem é a da tela: título, o que pensam, quem/quando, a história, o
      // recibo por último.
      conferirPeca(
        `${lang}:${item.id}`,
        [item.coisa, item.oQuePensam, item.quemInventou, item.quando, item.detalhe, item.fonte],
        TERMOS_TECNICOS[lang],
        erros
      );
    }
  }
  assert.deepEqual(
    erros,
    [],
    'Termo técnico sem glosa. O padrão está em lib/lunarCalendar.js ("é isso que ' +
      '«gibosa» quer dizer: …"): traduza inline, com travessão, parênteses ou ' +
      '"quer dizer".\n  ' + erros.join('\n  ')
  );
  // E a régua MORDE: o termo cru, sozinho, é pego.
  const teste = [];
  conferirPeca('teste', ['Os gregos chamavam de lotes.'], TERMOS_TECNICOS.pt, teste);
  assert.equal(teste.length, 1, 'a varredura de glosa deixou passar o termo cru');
});

// ---------------------------------------------------------------------------
// (i) NÃO DUPLICAR lib/mitos.js
// ---------------------------------------------------------------------------
// Os dois catálogos compartilham ITENS de propósito — Superlua, karma, o
// horóscopo de jornal. O que eles NÃO podem compartilhar é prosa: são formatos
// diferentes (card viral × tabela de idades) e quem abrir os dois não pode ler
// a mesma frase duas vezes. O recibo fica de fora nos dois lados: citação
// idêntica é o que uma citação deve ser.
function shingles(texto, k = 8) {
  const palavras = String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const saida = new Set();
  for (let i = 0; i + k <= palavras.length; i++) saida.add(palavras.slice(i, i + k).join(' '));
  return saida;
}

test('nenhuma sequência de oito palavras é igual à de lib/mitos.js, nos três idiomas', () => {
  const CAMPOS_MITOS = ['oQueTeContaram', 'oQueAFonteDiz', 'detalhe'];
  const repetidas = [];
  for (const lang of IDIOMAS) {
    const doMitos = new Set();
    const fonteMitos =
      lang === 'pt' ? MITOS.MITOS : Object.values(PACKS_MITOS[lang].mitos);
    for (const m of fonteMitos) {
      for (const campo of CAMPOS_MITOS) for (const s of shingles(m[campo])) doMitos.add(s);
    }
    assert.ok(doMitos.size > 200, `${lang}: o corpus de mitos não montou — o teste perderia o sentido`);
    for (const [id, tr] of Object.entries(PACKS[lang].itens)) {
      for (const campo of CAMPOS_DE_PROSA) {
        for (const s of shingles(tr[campo])) {
          if (doMitos.has(s)) repetidas.push(`${lang}:${id}.${campo}: "${s}"`);
        }
      }
    }
  }
  assert.deepEqual(
    repetidas,
    [],
    'Prosa repetida de lib/mitos.js. Os dois catálogos podem falar da MESMA coisa ' +
      '(o formato é outro), mas não com as mesmas frases:\n  ' + repetidas.join('\n  ')
  );
});

// ---------------------------------------------------------------------------
// A TELA — varredura do fonte de screens/IdadeRealScreen.js
// ---------------------------------------------------------------------------
// Mesma varredura que test/mitosIdiomas.test.js faz em MitosScreen.js. Existe
// por causa da armadilha do molde: escrever {UI.progresso} direto no JSX
// imprime "Você já abriu {n} de {total}." na cara da pessoa, e nenhum teste de
// pack pega isso, porque o pack está certo.
const FONTE_TELA = fs.readFileSync(path.join(RAIZ, 'screens', 'IdadeRealScreen.js'), 'utf8');

test('todo molde da tela passa por preencher(), e o idioma vem do useLanguage()', () => {
  const MOLDES = ['progresso', 'comoContamos'];
  for (const chave of MOLDES) {
    const usos = FONTE_TELA.match(new RegExp(`UI\\.${chave}\\b`, 'g')) || [];
    const preenchidos = FONTE_TELA.match(new RegExp(`preencher\\(\\s*UI\\.${chave}\\b`, 'g')) || [];
    assert.ok(usos.length > 0, `a tela deixou de usar UI.${chave} — o molde ficou órfão no pack`);
    assert.equal(
      usos.length,
      preenchidos.length,
      `screens/IdadeRealScreen.js usa UI.${chave} ${usos.length} vez(es) e só ${preenchidos.length} ` +
        'passa(m) por preencher(). Molde renderizado direto imprime a chave crua na tela.'
    );
  }
  assert.ok(/useLanguage/.test(FONTE_TELA), 'a tela não pega o idioma do useLanguage()');
  assert.ok(/chromeDaTela\(\s*lang\s*\)/.test(FONTE_TELA), 'o chrome não sai de chromeDaTela(lang)');
  assert.ok(/idadesReais\(\s*lang\s*,/.test(FONTE_TELA), 'o conteúdo não sai de idadesReais(lang, …)');
});

// Chave de chrome que ninguém consome é dívida: alguém traduz três vezes uma
// string que não aparece em lugar nenhum, e a próxima pessoa não sabe se pode
// apagar. Cada chave tem que ser lida pela TELA (UI.chave) ou pelo MOTOR
// (tela.chave) — as três de idade são montadas em lib/idadeReal.js.
const FONTE_MOTOR = fs.readFileSync(path.join(RAIZ, 'lib', 'idadeReal.js'), 'utf8');

test('nenhuma chave do chrome está morta — toda uma é lida pela tela ou pelo motor', () => {
  const orfas = [];
  for (const chave of Object.keys(PACKS.pt.tela)) {
    const naTela = new RegExp(`UI\\.${chave}\\b`).test(FONTE_TELA);
    const noMotor = new RegExp(`tela\\.${chave}\\b`).test(FONTE_MOTOR);
    if (!naTela && !noMotor) orfas.push(chave);
  }
  assert.deepEqual(
    orfas,
    [],
    `chave de chrome traduzida três vezes e consumida zero: ${orfas.join(', ')}. ` +
      'Ou a tela passa a usar, ou ela sai dos três packs.'
  );
});

test('a tela não fala com o AsyncStorage nem redige conteúdo', () => {
  assert.ok(
    !/async-storage/.test(FONTE_TELA),
    'a tela importou AsyncStorage direto — storage só via lib/storage.js, através de lib/idadeReal.js'
  );
  // Nenhum `detalhe` do catálogo pode estar escrito dentro da tela: a tela é
  // vitrine, o conteúdo mora no pack.
  const vazando = [];
  for (const lang of IDIOMAS) {
    for (const [id, tr] of Object.entries(PACKS[lang].itens)) {
      const pedaco = tr.detalhe.slice(0, 40);
      if (FONTE_TELA.includes(pedaco)) vazando.push(`${lang}:${id}`);
    }
  }
  assert.deepEqual(vazando, [], `conteúdo escrito dentro da tela em vez do pack: ${vazando.join(', ')}`);
});

// ---------------------------------------------------------------------------
// O PROGRESSO — leitura limpa, deduplicação e disco quebrado
// ---------------------------------------------------------------------------
test.beforeEach(() => {
  memStorage.clear();
  storageQuebrado = false;
  storageLib._reiniciarStorageParaTestes();
});

test('marcarIdadeVista acumula, deduplica e ignora id desconhecido', async () => {
  assert.deepEqual(await M.lerIdadesVistas(), []);
  await M.marcarIdadeVista(M.IDADE_REAL[0].id);
  await M.marcarIdadeVista(M.IDADE_REAL[1].id);
  await M.marcarIdadeVista(M.IDADE_REAL[0].id); // repetido — não conta duas vezes
  await M.marcarIdadeVista('coisa-que-nao-existe'); // desconhecido — não grava
  assert.deepEqual(await M.lerIdadesVistas(), [M.IDADE_REAL[0].id, M.IDADE_REAL[1].id]);
});

test('leitura suja volta limpa: JSON inválido e ids que saíram do catálogo', async () => {
  memStorage.set(M.CHAVE_IDADE_VISTAS, 'isto nunca foi JSON');
  assert.deepEqual(await M.lerIdadesVistas(), []);
  memStorage.set(
    M.CHAVE_IDADE_VISTAS,
    JSON.stringify([M.IDADE_REAL[2].id, 'id-removido-em-versao-antiga', M.IDADE_REAL[2].id, 42])
  );
  assert.deepEqual(await M.lerIdadesVistas(), [M.IDADE_REAL[2].id]);
});

test('disco quebrado não lança nem perde a marca da sessão', async () => {
  storageQuebrado = true;
  const lista = await M.marcarIdadeVista(M.IDADE_REAL[3].id);
  assert.deepEqual(lista, [M.IDADE_REAL[3].id]);
  assert.deepEqual(await M.lerIdadesVistas(), [M.IDADE_REAL[3].id]);
});
