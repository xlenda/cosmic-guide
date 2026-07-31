// test/pensamentoIdiomas.test.js
// O PENSAMENTO CÓSMICO DO DIA E O PAPEL DE PAREDE EM TRÊS IDIOMAS.
//
// Por que este arquivo é o mais nervoso da leva: o Pensamento Cósmico é o
// conteúdo nº 1 da Home — todo mundo abre o app e lê ele, todo dia. Errar aqui
// não é um card feio numa tela interna; é a primeira frase que a pessoa lê.
//
// Cinco trabalhos, em ordem de importância:
//
// (1) O OURO. O português é a fonte de verdade e NÃO PODE mudar um byte.
//     test/golden/pensamento.pt.golden.json guarda a saída dos dois motores
//     com datas fixas (31/07/2026). O teste prova que a chamada SEM lang e a
//     chamada com lang='pt' devolvem exatamente aquilo. Se este bloco quebrar,
//     o PT mudou — isso é falha, nunca melhoria, e o diff contra o golden é o
//     primeiro lugar pra olhar.
//     O QUE ESTE ARQUIVO É, COM PRECISÃO: ele nasceu junto com a parcela de
//     idiomas, então é TRAVA DAQUI PRA FRENTE, não recibo retroativo — um
//     golden escrito no mesmo commit que o refactor não pode provar a si mesmo.
//     A prova retroativa do chrome é outra: o literal TELA_ANTES lá embaixo,
//     copiado à mão do `T` de screens/WallpaperScreen.js, que existia antes e
//     não passou por aqui (mesmo padrão de CHROME_ANTES em
//     test/mitosIdiomas.test.js, cujo golden esse sim é pré-refatoração).
//
// (2) O MOTOR NÃO MUDA COM O IDIOMA. Mesmo dia + mesmo signo = MESMO
//     pensamento nos três: a mesma fase, o mesmo regente, o mesmo aspecto, a
//     mesma posição da relação de signo, a mesma frase do pool do papel de
//     parede. O que muda é só a língua. É isto que separa "traduzido" de
//     "outro app em outra língua".
//
// (3) A PARIDADE DE FORMA. Os três pacotes (pt derivado do motor, es e en dos
//     packs) têm exatamente as mesmas chaves, os mesmos tamanhos de array e os
//     mesmos placeholders — com uma exceção declarada e testada: a data por
//     extenso do inglês põe o mês antes do dia.
//
// (4) A LINHA VERMELHA NOS TRÊS. pt aliviar/acalmar/curar/tratar/energizar;
//     es aliviar/calmar/sanar/curar/tratar/energizar; en relieve/soothe/calm/
//     heal/cure/treat/energize. Mais: nada de promessa de resultado, nada de
//     veredito, nada de aviso defensivo, nada de prova social inventada, nada
//     de mecanismo pseudocientífico. Nos três idiomas, em todo texto visível.
//
// (5) O QUE NUNCA SE TRADUZ. As CHAVES canônicas (signo, planeta, fase,
//     aspecto) — são a junta com o cálculo; os números e o locus (Tetrabiblos
//     I.8, Naturalis Historia XVIII.321); a marca cosmicguide.cloud. E o
//     recibo continua dentro da frase: autor citado traz o século junto, nos
//     três idiomas.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DT = require('../lib/dailyThought.js');
const W = require('../lib/wallpaper.js');
const { SIGNS, aspects } = require('../lib/signs.js');
const { getMoonPhase } = require('../lib/lunarCalendar.js');
const { translate } = require('../lib/i18n.js');
const GOLDEN = require('./golden/pensamento.pt.golden.json');

const IDIOMAS = ['pt', 'es', 'en'];
const IDIOMAS_PACK = ['es', 'en'];

// Meio-dia LOCAL de propósito (mesma convenção de test/wallpaper.test.js e
// test/cosmicSound.test.js): 12:00 cai no mesmo dia civil em qualquer fuso.
const noon = (iso) => new Date(`${iso}T12:00:00`);
const diaAs = (hora, minuto = 0) => new Date(2024, 0, 25, hora, minuto, 0);

const TOURO = { name: 'Touro', icon: '♉' };
const CAPRI = { name: 'Capricórnio', icon: '♑' };

const PACOTES_PENSAMENTO = Object.fromEntries(IDIOMAS.map((l) => [l, DT.pacoteDoIdioma(l)]));
const PACOTES_WALLPAPER = Object.fromEntries(IDIOMAS.map((l) => [l, W.pacoteDoIdioma(l)]));

// ===========================================================================
// (1) O OURO — o PT de antes da refatoração, byte a byte
// ===========================================================================

test('OURO: sem lang e com lang="pt", o pensamento do dia é byte a byte o de antes', () => {
  const g = GOLDEN.dailyThought;
  assert.deepEqual(DT.ABERTURA_POR_PERIODO, g.ABERTURA_POR_PERIODO, 'as aberturas por período mudaram');
  assert.deepEqual(DT.RULER_BY_WEEKDAY, g.RULER_BY_WEEKDAY, 'a tabela de regentes mudou');

  for (const [iso, esperado] of Object.entries(g.getThoughtForDate)) {
    const casos = [
      ['semSigno', null, esperado.semSigno],
      ['touro', TOURO, esperado.touro],
      ['capricornio', CAPRI, esperado.capricornio],
    ];
    for (const [rotulo, signo, texto] of casos) {
      // Os dois caminhos antigos: 2 argumentos (como a Home chamava) e o
      // explícito com 'pt'.
      assert.equal(DT.getThoughtForDate(noon(iso), signo), texto, `${iso}/${rotulo}: PT mudou (2 args)`);
      assert.equal(DT.getThoughtForDate(noon(iso), signo, 'pt'), texto, `${iso}/${rotulo}: PT mudou (lang='pt')`);
    }
  }

  for (const [hora, esperado] of Object.entries(g.getTodaysThought)) {
    const quando = diaAs(Number(hora));
    assert.equal(DT.getTodaysThought(null, quando), esperado.semSigno, `${hora}h: PT mudou (2 args)`);
    assert.equal(DT.getTodaysThought(null, quando, 'pt'), esperado.semSigno, `${hora}h: PT mudou (lang='pt')`);
    assert.equal(DT.getTodaysThought(TOURO, quando), esperado.touro, `${hora}h/touro: PT mudou`);
    assert.equal(DT.getTodaysThought(TOURO, quando, 'pt'), esperado.touro, `${hora}h/touro: PT mudou (lang='pt')`);
  }
});

// Os campos que o desenho do papel de parede sempre teve. Os três `*Texto`
// nasceram nesta parcela e são conferidos à parte (em PT eles têm que ser
// iguais aos canônicos — é o que prova que o desenho português não mexeu).
const CAMPOS_WALLPAPER = [
  'dia', 'ceuDisponivel', 'gradiente', 'glifo', 'signoLua', 'fase',
  'iluminacao', 'regente', 'frase', 'dataFormatada', 'marca',
];

function conferirWallpaperPt(atual, esperado, onde) {
  for (const campo of CAMPOS_WALLPAPER) {
    assert.deepEqual(atual[campo], esperado[campo], `${onde}.${campo}: o PT mudou`);
  }
  assert.equal(atual.faseTexto, esperado.fase, `${onde}: em PT faseTexto tem que ser o canônico`);
  assert.equal(atual.signoLuaTexto, esperado.signoLua, `${onde}: em PT signoLuaTexto tem que ser o canônico`);
  assert.equal(atual.regenteTexto, esperado.regente, `${onde}: em PT regenteTexto tem que ser o canônico`);
}

// As duas entradas fixas do golden de montarWallpaper, na forma que o motor
// recebe (o golden guarda a SAÍDA; estas são as ENTRADAS que a produziram).
const ENTRADAS_WALLPAPER = {
  semCeu: {
    dia: '2026-07-31', ceuDisponivel: false, regente: 'Vênus',
    fase: null, iluminacao: null, signoLua: null,
  },
  faseDesconhecida: {
    dia: '2026-07-31', ceuDisponivel: true, regente: 'Vênus',
    fase: 'Lua Renomeada', iluminacao: 80, signoLua: 'Peixes',
  },
};

test('OURO: sem lang e com lang="pt", o papel de parede é byte a byte o de antes', () => {
  const g = GOLDEN.wallpaper;
  assert.equal(W.MARCA, g.MARCA);
  assert.deepEqual(W.FRASES_POR_FASE, g.FRASES_POR_FASE, 'as frases PT do desenho mudaram');
  assert.deepEqual(W.FRASES_SEM_CEU, g.FRASES_SEM_CEU);
  assert.deepEqual(W.FRASES_GENERICAS, g.FRASES_GENERICAS);
  assert.deepEqual(W.GRADIENTE_POR_FASE, g.GRADIENTE_POR_FASE, 'o gradiente não tem idioma — não podia mudar');
  assert.deepEqual(W.GLIFO_POR_SIGNO, g.GLIFO_POR_SIGNO, 'o glifo não tem idioma — não podia mudar');

  for (const [iso, esperado] of Object.entries(g.formatarDataLonga)) {
    assert.equal(W.formatarDataLonga(iso), esperado, `formatarDataLonga(${iso}) mudou`);
    assert.equal(W.formatarDataLonga(iso, 'pt'), esperado, `formatarDataLonga(${iso}, 'pt') mudou`);
  }

  for (const [iso, esperado] of Object.entries(g.getWallpaperData)) {
    conferirWallpaperPt(W.getWallpaperData(noon(iso)), esperado, `getWallpaperData ${iso}`);
    conferirWallpaperPt(W.getWallpaperData(noon(iso), 'pt'), esperado, `getWallpaperData ${iso} (pt)`);
  }

  for (const [nome, entrada] of Object.entries(ENTRADAS_WALLPAPER)) {
    conferirWallpaperPt(W.montarWallpaper(entrada), g.montarWallpaper[nome], `montarWallpaper ${nome}`);
    conferirWallpaperPt(W.montarWallpaper(entrada, 'pt'), g.montarWallpaper[nome], `montarWallpaper ${nome} (pt)`);
  }

  // O chrome da tela veio de screens/WallpaperScreen.js sem mudar de palavra.
  // As doze strings estão escritas AQUI à mão, copiadas do `T` que morava em
  // screens/WallpaperScreen.js antes da mudança de casa (mesmo padrão de
  // CHROME_ANTES em test/mitosIdiomas.test.js). Comparar TELA_PT com ela mesma
  // — `textosDaTela('pt') === W.TELA_PT` — não prova nada: a trava tem que ser
  // um literal independente do módulo sob teste.
  const TELA_ANTES = {
    titulo: 'Papel de Parede',
    subtitulo: 'O céu de hoje na sua tela',
    baixar: 'BAIXAR PAPEL DE PAREDE',
    baixado: 'Baixado. Agora é só definir como papel de parede nas configurações do celular.',
    falhou: 'Não deu pra gerar a imagem agora. Tenta de novo.',
    tamanho: '1080 × 1920 — cabe em qualquer tela de celular.',
    amanha: 'Amanhã o céu muda — e o desenho muda junto. Volta aqui.',
    soWeb: 'Baixar a imagem é da versão web por enquanto. Abre cosmicguide.cloud no navegador do celular que o botão aparece.',
    semCeu: 'A posição da Lua não pôde ser calculada agora — o desenho de hoje é neutro e diz isso na própria frase.',
    luaEm: 'LUA EM',
    diaDe: 'DIA DE',
    iluminada: 'iluminada',
  };
  assert.deepEqual(W.TELA_PT, TELA_ANTES, 'o chrome PT do papel de parede mudou');
  assert.deepEqual(W.textosDaTela(), TELA_ANTES, 'textosDaTela() sem lang divergiu do chrome de antes');
  assert.deepEqual(W.textosDaTela('pt'), TELA_ANTES, "textosDaTela('pt') divergiu do chrome de antes");
});

test('idioma desconhecido cai no PT — nunca inventa e nunca esvazia a tela', () => {
  for (const bobagem of ['fr', 'PT', '', null, undefined, 42]) {
    assert.equal(
      DT.getThoughtForDate(noon('2024-01-25'), TOURO, bobagem),
      GOLDEN.dailyThought.getThoughtForDate['2024-01-25'].touro,
      `lang=${String(bobagem)} tinha que cair no PT`
    );
    assert.equal(W.formatarDataLonga('2026-07-31', bobagem), GOLDEN.wallpaper.formatarDataLonga['2026-07-31']);
    assert.equal(W.textosDaTela(bobagem).titulo, W.TELA_PT.titulo);
  }
});

// ===========================================================================
// (2) O MOTOR NÃO MUDA COM O IDIOMA
// ===========================================================================
// A prova mais forte da parcela: a MESMA conta nos três, só com outra língua.

const DATAS_DE_PROVA = ['2024-01-11', '2024-01-25', '2024-03-10', '2024-04-15', '2024-06-01', '2026-08-02'];

test('mesmo dia + mesmo signo = mesmo pensamento nos três idiomas (só as palavras mudam)', () => {
  for (const iso of DATAS_DE_PROVA) {
    const data = noon(iso);
    const ptTexto = DT.getThoughtForDate(data, CAPRI, 'pt');

    // Qual posição da relação de signo o PT usou? É essa a conta que os outros
    // dois idiomas têm que reproduzir.
    const idxRelacao = PACOTES_PENSAMENTO.pt.relacaoSigno.findIndex((frase) => ptTexto.includes(frase));
    assert.notEqual(idxRelacao, -1, `${iso}: o PT não trouxe nenhuma frase de relação de signo`);

    // A fase do dia, pelo mesmo motor do Calendário Lunar.
    const fasePt = getMoonPhase(new Date(`${iso}T12:00:00Z`), 'pt');

    for (const lang of IDIOMAS_PACK) {
      const P = PACOTES_PENSAMENTO[lang];
      const texto = DT.getThoughtForDate(data, CAPRI, lang);

      assert.ok(
        texto.includes(P.relacaoSigno[idxRelacao]),
        `${iso}/${lang}: a relação de signo caiu em outra posição — a conta mudou com o idioma`
      );

      // Mesmo dia da semana, mesmo regente, mesmo tema e mesma ponte.
      const diaSemana = data.getDay();
      assert.ok(texto.includes(P.regentes[diaSemana].tema), `${iso}/${lang}: tema do regente errado`);
      assert.ok(texto.includes(P.regentes[diaSemana].ponte), `${iso}/${lang}: ponte pro dia seguinte errada`);

      // Mesma fase da Lua, com o nome que lib/lunarCalendar.js dá nesse idioma
      // (uma fonte de verdade só pro nome da fase em todo o app).
      const faseLang = getMoonPhase(new Date(`${iso}T12:00:00Z`), lang);
      assert.ok(texto.includes(faseLang.name), `${iso}/${lang}: nome da fase fora do motor lunar`);
      assert.ok(texto.includes(fasePt.emoji), `${iso}/${lang}: o emoji da fase não tem idioma e sumiu`);

      // Mesmo status de Mercúrio retrógrado: ou os três têm o trecho, ou nenhum.
      assert.equal(
        texto.includes(P.retrogrado),
        ptTexto.includes(PACOTES_PENSAMENTO.pt.retrogrado),
        `${iso}/${lang}: o retrógrado apareceu num idioma e não no outro`
      );
    }
  }
});

test('o aspecto do dia é o MESMO nos três — mesmo par, mesmo tipo, mesmo "hoje"', () => {
  for (const iso of DATAS_DE_PROVA) {
    const ptTexto = DT.getThoughtForDate(noon(iso), null, 'pt');
    // Qual tipo de aspecto o PT anunciou? (a chave canônica, não a tradução)
    const tipoPt = Object.keys(PACOTES_PENSAMENTO.pt.aspectos).find((tipo) =>
      ptTexto.includes(PACOTES_PENSAMENTO.pt.aspectos[tipo].tom)
    );
    const disseHoje = ptTexto.includes(`${PACOTES_PENSAMENTO.pt.aspectoQuando.hoje} —`);

    for (const lang of IDIOMAS_PACK) {
      const P = PACOTES_PENSAMENTO[lang];
      const texto = DT.getThoughtForDate(noon(iso), null, lang);
      if (!tipoPt) {
        // Sem aspecto usável no PT: nenhum idioma pode inventar um.
        for (const info of Object.values(P.aspectos)) {
          assert.ok(!texto.includes(info.tom), `${iso}/${lang}: aspecto inventado num idioma só`);
        }
        continue;
      }
      assert.ok(
        texto.includes(P.aspectos[tipoPt].nome),
        `${iso}/${lang}: o tipo de aspecto mudou de "${tipoPt}" pra outro`
      );
      assert.ok(texto.includes(P.aspectos[tipoPt].tom), `${iso}/${lang}: o tom do aspecto não veio do pack`);
      assert.equal(
        texto.includes(`${P.aspectoQuando.hoje} —`),
        disseHoje,
        `${iso}/${lang}: "hoje" x "neste período" divergiu entre idiomas`
      );
    }
  }
});

test('a abertura por período é a mesma faixa de hora nos três idiomas', () => {
  for (const hora of [4, 5, 8, 11, 12, 14, 17, 18, 21, 23]) {
    const quando = diaAs(hora);
    const periodo = DT.periodoDoDia(quando);
    for (const lang of IDIOMAS) {
      const abertura = PACOTES_PENSAMENTO[lang].aberturas[periodo];
      assert.ok(
        DT.getTodaysThought(TOURO, quando, lang).startsWith(abertura),
        `${hora}h/${lang}: não abriu com a frase de "${periodo}"`
      );
    }
  }
});

test('o papel de parede escolhe a MESMA frase do pool nos três idiomas', () => {
  // 45 dias corridos > 1 ciclo sinódico: passa pelas 8 fases.
  for (let i = 0; i < 45; i++) {
    const d = noon('2026-07-01');
    d.setDate(d.getDate() + i);
    const pt = W.getWallpaperData(d, 'pt');
    const pool = W.FRASES_POR_FASE[pt.fase];
    assert.ok(pool, `${pt.dia}: fase "${pt.fase}" sem pool PT`);
    const indice = pool.indexOf(pt.frase);
    assert.notEqual(indice, -1, `${pt.dia}: a frase PT não veio do pool da fase`);

    for (const lang of IDIOMAS_PACK) {
      const w = W.getWallpaperData(d, lang);
      // O desenho é o MESMO: gradiente, glifo e a POSIÇÃO da frase no pool.
      assert.deepEqual(w.gradiente, pt.gradiente, `${pt.dia}/${lang}: gradiente mudou com o idioma`);
      assert.equal(w.glifo, pt.glifo, `${pt.dia}/${lang}: glifo mudou com o idioma`);
      assert.equal(w.fase, pt.fase, `${pt.dia}/${lang}: a fase canônica tem que ficar em português`);
      assert.equal(w.signoLua, pt.signoLua, `${pt.dia}/${lang}: o signo canônico tem que ficar em português`);
      assert.equal(w.iluminacao, pt.iluminacao, `${pt.dia}/${lang}: iluminação não tem idioma`);
      assert.equal(
        w.frase,
        PACOTES_WALLPAPER[lang].frases[pt.fase][indice],
        `${pt.dia}/${lang}: caiu em outra posição do pool — o desenho deixou de ser o mesmo céu`
      );
    }
  }
});

test('o fallback sem céu confessa a ausência nos três — e nunca nomeia fase nem signo', () => {
  for (const lang of IDIOMAS) {
    const P = PACOTES_WALLPAPER[lang];
    const w = W.montarWallpaper(ENTRADAS_WALLPAPER.semCeu, lang);
    assert.equal(w.ceuDisponivel, false);
    assert.deepEqual(w.gradiente, W.GRADIENTE_NEUTRO, `${lang}: gradiente do fallback mudou`);
    assert.equal(w.glifo, W.GLIFO_NEUTRO, `${lang}: o glifo neutro não pode virar signo`);
    assert.ok(P.frasesSemCeu.includes(w.frase), `${lang}: a frase do fallback não veio do pool que confessa`);
    // O regente atravessa o fallback (é aritmética de semana, não efeméride) —
    // e aparece traduzido, com o canônico intacto ao lado.
    assert.equal(w.regente, 'Vênus', `${lang}: o regente canônico tem que ficar em português`);
    assert.equal(w.regenteTexto, P.planetas['Vênus'], `${lang}: o regente não saiu no idioma`);

    // Nenhuma frase de "sem céu" pode nomear uma fase ou um signo — DAQUELE
    // idioma, que é o que a pessoa leria como céu inventado.
    const proibidos = [...Object.values(P.fases), ...Object.values(P.signos)];
    for (const frase of P.frasesSemCeu) {
      for (const nome of proibidos) {
        assert.ok(!frase.includes(nome), `${lang}: "${frase}" nomeia "${nome}" num desenho sem céu`);
      }
    }
  }
});

test('fase renomeada no futuro cai na frase genérica do idioma, nunca na de "sem céu"', () => {
  for (const lang of IDIOMAS) {
    const P = PACOTES_WALLPAPER[lang];
    const w = W.montarWallpaper(ENTRADAS_WALLPAPER.faseDesconhecida, lang);
    assert.ok(!P.frasesSemCeu.includes(w.frase), `${lang}: dizer "sem céu" com céu calculado é mentira`);
    assert.ok(P.frasesGenericas.includes(w.frase), `${lang}: não caiu na genérica`);
    // O signo É conhecido: o glifo e o nome traduzido continuam de pé.
    assert.equal(w.glifo, W.GLIFO_POR_SIGNO['Peixes']);
    assert.equal(w.signoLuaTexto, P.signos['Peixes'], `${lang}: signo conhecido saiu sem tradução`);
    // A fase é desconhecida: o nome sai como veio, nunca vira outra fase.
    assert.equal(w.faseTexto, 'Lua Renomeada', `${lang}: nome de fase desconhecida não pode ser inventado`);
  }
});

test('lixo na entrada não derruba a tela em nenhum idioma', () => {
  for (const lang of IDIOMAS) {
    for (const entrada of [null, undefined, {}, { dia: 'não-é-data' }, 42]) {
      const w = W.montarWallpaper(entrada, lang);
      assert.equal(w.ceuDisponivel, false);
      assert.deepEqual(w.gradiente, W.GRADIENTE_NEUTRO);
      assert.equal(w.glifo, W.GLIFO_NEUTRO);
      assert.ok(PACOTES_WALLPAPER[lang].frasesSemCeu.includes(w.frase));
      assert.match(w.dia, /^\d{4}-\d{2}-\d{2}$/, `${lang}: sem dia válido usa o dia local — nunca NaN`);
      assert.ok(w.dataFormatada.length > 0, `${lang}: data por extenso vazia`);
      assert.equal(w.faseTexto, null);
      assert.equal(w.signoLuaTexto, null);
    }
  }
});

// ===========================================================================
// (3) PARIDADE DE FORMA — mesmas chaves, mesmos tamanhos, mesmos placeholders
// ===========================================================================

function placeholders(s) {
  return [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

test('PARIDADE: os três pacotes do pensamento têm a mesma forma, sem valor vazio', () => {
  const pt = PACOTES_PENSAMENTO.pt;
  for (const lang of IDIOMAS_PACK) {
    const P = PACOTES_PENSAMENTO[lang];
    assert.deepEqual(Object.keys(P).sort(), Object.keys(pt).sort(), `${lang}: chaves do pacote ≠ PT`);

    for (const chave of ['carregando', 'saudacao', 'luaEm', 'regenteFrase', 'aspectoFrase', 'retrogrado']) {
      assert.ok(typeof P[chave] === 'string' && P[chave].trim(), `${lang}.${chave} vazio`);
    }
    // Os moldes: mesmos placeholders, nem um a mais nem um a menos.
    for (const molde of ['saudacao', 'luaEm', 'regenteFrase', 'aspectoFrase']) {
      assert.deepEqual(
        placeholders(P[molde]),
        placeholders(pt[molde]),
        `${lang}.${molde}: placeholders divergem do PT`
      );
    }
    // O espaço final de `saudacao` e `luaEm` é parte do contrato: sem ele o
    // texto cola ("♉ TauroLa Luna está...").
    for (const molde of ['saudacao', 'luaEm']) {
      assert.ok(P[molde].endsWith(' '), `${lang}.${molde}: perdeu o espaço final e o texto vai colar`);
    }

    assert.deepEqual(Object.keys(P.aberturas).sort(), ['manha', 'noite', 'tarde']);
    for (const [periodo, frase] of Object.entries(P.aberturas)) {
      assert.ok(frase && frase.trim(), `${lang}.aberturas.${periodo} vazia`);
    }
    // As três aberturas são distintas entre si — senão o card não muda de
    // manhã pra noite e a feature inteira some.
    assert.equal(new Set(Object.values(P.aberturas)).size, 3, `${lang}: aberturas repetidas`);

    assert.equal(P.relacaoSigno.length, 7, `${lang}: relacaoSigno tem que ter 7 posições (0 = mesmo signo, 6 = oposto)`);
    assert.equal(new Set(P.relacaoSigno).size, 7, `${lang}: duas relações de signo iguais`);
    P.relacaoSigno.forEach((f, i) => assert.ok(f && f.trim(), `${lang}.relacaoSigno[${i}] vazia`));

    assert.equal(P.regentes.length, 7, `${lang}: regentes tem que ter os 7 dias`);
    P.regentes.forEach((r, i) => {
      assert.deepEqual(Object.keys(r).sort(), ['ponte', 'tema'], `${lang}.regentes[${i}]: campos errados`);
      assert.ok(r.tema && r.tema.trim(), `${lang}.regentes[${i}].tema vazio`);
      assert.ok(r.ponte && r.ponte.trim(), `${lang}.regentes[${i}].ponte vazia`);
    });

    assert.deepEqual(Object.keys(P.aspectoQuando).sort(), ['hoje', 'periodo']);
    assert.notEqual(P.aspectoQuando.hoje, P.aspectoQuando.periodo, `${lang}: "hoje" e "neste período" iguais`);

    assert.deepEqual(Object.keys(P.aspectos).sort(), Object.keys(pt.aspectos).sort(), `${lang}: tipos de aspecto ≠ PT`);
    for (const [tipo, info] of Object.entries(P.aspectos)) {
      assert.ok(info.nome && info.nome.trim(), `${lang}.aspectos.${tipo}.nome vazio`);
      assert.ok(info.tom && info.tom.trim(), `${lang}.aspectos.${tipo}.tom vazio`);
      assert.equal(info.nome, info.nome.toLowerCase(), `${lang}.aspectos.${tipo}.nome cai no meio da frase — vai minúsculo`);
    }

    assert.deepEqual(Object.keys(P.signos).sort(), Object.keys(pt.signos).sort(), `${lang}: signos ≠ PT`);
    assert.deepEqual(Object.keys(P.planetas).sort(), Object.keys(pt.planetas).sort(), `${lang}: planetas ≠ PT`);
    for (const [k, v] of Object.entries({ ...P.signos, ...P.planetas })) {
      assert.ok(typeof v === 'string' && v.trim(), `${lang}: "${k}" sem nome de exibição`);
    }
  }
});

test('PARIDADE: os três pacotes do papel de parede têm a mesma forma', () => {
  const pt = PACOTES_WALLPAPER.pt;
  for (const lang of IDIOMAS_PACK) {
    const P = PACOTES_WALLPAPER[lang];
    assert.deepEqual(Object.keys(P).sort(), Object.keys(pt).sort(), `${lang}: chaves do pacote ≠ PT`);

    // Os pools: mesmas fases, MESMO tamanho. Tamanho diferente = o hash do dia
    // aponta pra outra frase e o desenho deixa de ser o mesmo céu.
    assert.deepEqual(Object.keys(P.frases).sort(), Object.keys(pt.frases).sort(), `${lang}: fases do pool ≠ PT`);
    for (const [fase, pool] of Object.entries(P.frases)) {
      assert.equal(pool.length, pt.frases[fase].length, `${lang}: pool de "${fase}" com ${pool.length} frases, PT tem ${pt.frases[fase].length}`);
      pool.forEach((f, i) => {
        assert.ok(f && f.trim(), `${lang}.frases["${fase}"][${i}] vazia`);
        assert.ok(f.length <= 140, `${lang}.frases["${fase}"][${i}]: ${f.length} caracteres — papel de parede não é artigo`);
      });
      assert.equal(new Set(pool).size, pool.length, `${lang}: "${fase}" tem frase repetida — o dia não variaria`);
    }
    assert.equal(P.frasesSemCeu.length, pt.frasesSemCeu.length, `${lang}: pool "sem céu" de outro tamanho`);
    assert.equal(P.frasesGenericas.length, pt.frasesGenericas.length, `${lang}: pool genérico de outro tamanho`);
    for (const f of [...P.frasesSemCeu, ...P.frasesGenericas]) {
      assert.ok(f && f.trim(), `${lang}: frase de fallback vazia`);
      assert.ok(f.length <= 140, `${lang}: frase de fallback longa demais (${f.length})`);
    }

    assert.deepEqual(Object.keys(P.fases).sort(), Object.keys(pt.fases).sort(), `${lang}: nomes de fase ≠ PT`);
    assert.deepEqual(Object.keys(P.signos).sort(), Object.keys(pt.signos).sort(), `${lang}: signos ≠ PT`);
    assert.deepEqual(Object.keys(P.planetas).sort(), Object.keys(pt.planetas).sort(), `${lang}: regentes ≠ PT`);

    assert.equal(P.diasSemana.length, 7, `${lang}: diasSemana precisa dos 7`);
    assert.equal(P.meses.length, 12, `${lang}: meses precisa dos 12`);
    // A ORDEM das palavras é do idioma (o inglês põe o mês antes do dia), mas
    // os TRÊS pedaços têm que estar todos lá — perder um deixa a data manca.
    assert.deepEqual(placeholders(P.dataLonga), ['dia', 'diaSemana', 'mes'], `${lang}.dataLonga: placeholders errados`);

    assert.deepEqual(Object.keys(P.tela).sort(), Object.keys(pt.tela).sort(), `${lang}: chaves do chrome ≠ PT`);
    for (const [k, v] of Object.entries(P.tela)) {
      assert.ok(typeof v === 'string' && v.trim(), `${lang}.tela.${k} vazio`);
    }
  }
});

// ===========================================================================
// (4) A LINHA VERMELHA — nos TRÊS idiomas, em todo texto visível
// ===========================================================================

const PROIBIDO = {
  pt: [
    // saúde (a regra de PALAVRA do app)
    /\balivi(a|ar|o|e)\b/i, /\bacalma/i, /\bcur(a|ar|am|ativ)/i, /\btrata(r|mento)?\b/i,
    /\benergiza/i, /\brelaxa/i, /\bansiedade\b/i, /\bdepress(ão|ao|iva|ivo)\b/i,
    /\bins[oô]nia\b/i, /\bterap[eê]utic/i, /\bimunidade\b/i, /\brem[ée]dio\b/i,
    /\bsa[uú]de\b/i, /\bbem-estar\b/i,
    // promessa / veredito
    /\batra(i|ir|em|irá)\b/i, /\bgarant(e|em|ia|ido|ir)\b/i, /\bpromet(e|em|er|ido)\b/i,
    /\bmanifesta(r|ção)?\b/i, /\babre caminhos?\b/i, /\bdestrava\b/i, /\bafasta\b/i,
    /\bprotege\b/i, /\bd[áa] sorte\b/i, /\bvai dar certo\b/i, /\bcom certeza\b/i,
    // mecanismo pseudocientífico
    /\benerg[ée]tic/i, /\benergia (negativa|positiva|ruim|pesada)\b/i, /\bvibra[çc][ãa]o\b/i,
    /\baura\b/i, /\bchakra/i, /\bpurifica/i,
    // prova social inventada
    /\bmilhares de\b/i, /\bmilh[õo]es de pessoas\b/i, /\bcomprovad/i, /\bestudos? (mostra|prova)/i,
  ],
  es: [
    /\balivi/i, /\bcalm/i, /\bsana(r|s|n)?\b/i, /\bcur(a|ar|ación|ativ)/i,
    /\btrat(a|ar|e|en|amiento)\b/i, /\benergiz/i, /\brelaj/i, /\btranquiliz/i,
    /\bansiedad/i, /\bestr[eé]s\b/i, /\binsomnio\b/i, /\bsalud\b/i, /\bbienestar\b/i,
    /\bterap[eé]utic/i, /\bdesintoxic/i, /\bsistema nervioso\b/i,
    /\batra(e|er|iga|cci[óo]n)/i, /\bgarant/i, /\bpromet/i, /\bmanifest/i,
    /\babre camino/i, /\bdesbloque/i, /\bdestrab/i, /\bahuyent/i, /\bespant/i,
    /\bproteg/i, /\bblinda/i, /\bneutraliz/i, /\bpoderos/i, /\binfalible/i,
    /\b(da|trae) suerte\b/i, /\bcon (toda )?seguridad\b/i, /\bsin duda\b/i,
    /\benerg[íi]a\b/i, /\benerg[ée]tic/i, /\bvibraci/i, /\baura\b/i, /\bchakra/i,
    /\bmagnetismo\b/i, /\bpurific/i,
    /\bmiles de\b/i, /\bmillones de personas\b/i, /\bcomprobad/i, /\bestudios? (muestra|prueba)/i,
  ],
  en: [
    /\bheal/i, /\bcur(e|es|ing|ative)\b/i, /\btreat/i, /\brelie(f|ve|ving)/i, /\bsooth/i,
    /\bcalm/i, /\benergi[sz]e/i, /\brelax/i, /\banxiety\b/i, /\bstress\b/i,
    /\binsomnia\b/i, /\bwell-?being\b/i, /\btherapeutic/i, /\bdetox/i,
    /\bnervous system\b/i, /\bimmun/i, /\binvigorat/i, /\bharmoniz/i,
    /\battract/i, /\bguarantee/i, /\bmanifest/i, /\bunblock/i, /\bward(s|ing)? off/i,
    /\bbanish/i, /\brepel/i, /\bprotect/i, /\bopens? (the )?(path|road|way)/i,
    /\bpowerful\b/i, /\binfallible\b/i, /\bbrings? luck\b/i, /\bgood luck\b/i,
    /\bfor sure\b/i, /\bno doubt\b/i,
    /\benergy\b/i, /\benergetic/i, /\bvibration/i, /\b(high|low) frequency\b/i,
    /\baura\b/i, /\bchakra/i, /\bpurif/i, /\bnegative energy\b/i,
    /\bthousands of\b/i, /\bmillions of people\b/i, /\bproven\b/i, /\bstudies? (show|prove)/i,
  ],
};

// A palavra banida por docs/tradicao/06 §2 — literal, sem exceção, em qualquer
// idioma. Mesma trava de test/wallpaper.test.js e test/mitos.test.js.
const BANIDA = [/\bcigan\w*/iu, /\bgyps\w*/iu, /\bgitan\w*/iu];

// Todo texto VISÍVEL de um idioma, com o caminho de onde veio — é a coleta que
// as duas varreduras abaixo usam.
function textosVisiveis(lang) {
  const saida = [];
  const P = PACOTES_PENSAMENTO[lang];
  for (const [periodo, f] of Object.entries(P.aberturas)) saida.push([`${lang}.pensamento.abertura.${periodo}`, f]);
  saida.push([`${lang}.pensamento.carregando`, P.carregando]);
  saida.push([`${lang}.pensamento.retrogrado`, P.retrogrado]);
  saida.push([`${lang}.pensamento.luaEm`, P.luaEm]);
  saida.push([`${lang}.pensamento.regenteFrase`, P.regenteFrase]);
  saida.push([`${lang}.pensamento.aspectoFrase`, P.aspectoFrase]);
  P.relacaoSigno.forEach((f, i) => saida.push([`${lang}.pensamento.relacaoSigno[${i}]`, f]));
  P.regentes.forEach((r, i) => {
    saida.push([`${lang}.pensamento.regentes[${i}].tema`, r.tema]);
    saida.push([`${lang}.pensamento.regentes[${i}].ponte`, r.ponte]);
  });
  for (const [tipo, info] of Object.entries(P.aspectos)) {
    saida.push([`${lang}.pensamento.aspectos.${tipo}.nome`, info.nome]);
    saida.push([`${lang}.pensamento.aspectos.${tipo}.tom`, info.tom]);
  }

  const Q = PACOTES_WALLPAPER[lang];
  for (const [fase, pool] of Object.entries(Q.frases)) {
    pool.forEach((f, i) => saida.push([`${lang}.wallpaper.frases["${fase}"][${i}]`, f]));
  }
  Q.frasesSemCeu.forEach((f, i) => saida.push([`${lang}.wallpaper.frasesSemCeu[${i}]`, f]));
  Q.frasesGenericas.forEach((f, i) => saida.push([`${lang}.wallpaper.frasesGenericas[${i}]`, f]));
  for (const [k, v] of Object.entries(Q.tela)) saida.push([`${lang}.wallpaper.tela.${k}`, v]);
  return saida;
}

test('LINHA VERMELHA: nenhuma palavra proibida em NENHUM dos três idiomas', () => {
  const violacoes = [];
  for (const lang of IDIOMAS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      for (const re of PROIBIDO[lang]) {
        if (re.test(texto)) violacoes.push(`${onde} → ${re}`);
      }
    }
  }
  assert.deepEqual(
    violacoes,
    [],
    'Alegação de saúde, promessa, veredito, mecanismo ou prova social em texto visível. ' +
      'Reescreva por SENTIDO, sem o vocabulário — a régua vale nos três idiomas:\n  ' +
      violacoes.join('\n  ')
  );
});

test('LINHA VERMELHA: a palavra banida por docs/tradicao/06 §2 não entra em idioma nenhum', () => {
  const violacoes = [];
  for (const lang of IDIOMAS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      for (const re of BANIDA) if (re.test(texto)) violacoes.push(`${onde} → ${re}`);
    }
  }
  assert.deepEqual(violacoes, [], 'A regra é literal — a palavra não entra em nenhum texto do app:\n  ' + violacoes.join('\n  '));
});

test('nenhum texto vira aviso defensivo — o app afirma o que é, não se desculpa', () => {
  const DEFENSIVO = [
    /não garante/i, /sem (nenhuma )?promessa/i, /não promete/i, /apenas entretenimento/i,
    /no garantiza/i, /sin (ninguna )?promesa/i, /no promete/i, /solo entretenimiento/i,
    /aviso legal/i, /does not (guarantee|promise)/i, /no promise/i,
    /for entertainment (purposes )?only/i, /disclaimer/i, /legal notice/i,
  ];
  const violacoes = [];
  for (const lang of IDIOMAS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      for (const re of DEFENSIVO) if (re.test(texto)) violacoes.push(`${onde} → ${re}`);
    }
  }
  assert.deepEqual(violacoes, [], 'Ressalva defensiva não é honestidade — é medo:\n  ' + violacoes.join('\n  '));
});

test('o texto de saída inteiro passa na varredura, nos três idiomas e ao longo de um mês', () => {
  const violacoes = [];
  for (let i = 0; i < 31; i++) {
    const d = noon('2026-07-01');
    d.setDate(d.getDate() + i);
    for (const lang of IDIOMAS) {
      const textos = [
        DT.getTodaysThought(TOURO, d, lang),
        DT.getThoughtForDate(d, CAPRI, lang),
        W.getWallpaperData(d, lang).frase,
      ];
      for (const texto of textos) {
        for (const re of [...PROIBIDO[lang], ...BANIDA]) {
          if (re.test(texto)) violacoes.push(`${lang} ${W.formatarDataLonga(W.getWallpaperData(d, 'pt').dia)} → ${re}`);
        }
      }
    }
  }
  assert.deepEqual(violacoes, [], 'A saída montada tropeçou onde os pedaços passavam:\n  ' + violacoes.join('\n  '));
});

// ===========================================================================
// (5) O QUE NUNCA SE TRADUZ
// ===========================================================================

test('as CHAVES canônicas ficam em português nos três — é a junta com o cálculo', () => {
  const nomesDeSigno = SIGNS.map((s) => s.name).sort();
  for (const lang of IDIOMAS) {
    assert.deepEqual(Object.keys(PACOTES_PENSAMENTO[lang].signos).sort(), nomesDeSigno, `${lang}: chaves de signo ≠ lib/signs.js`);
    assert.deepEqual(Object.keys(PACOTES_WALLPAPER[lang].signos).sort(), nomesDeSigno, `${lang}: chaves de signo do wallpaper ≠ lib/signs.js`);
    assert.deepEqual(
      Object.keys(PACOTES_WALLPAPER[lang].fases).sort(),
      Object.keys(W.GRADIENTE_POR_FASE).sort(),
      `${lang}: chaves de fase ≠ as do gradiente (o desenho ficaria sem cor)`
    );
    assert.deepEqual(
      Object.keys(PACOTES_WALLPAPER[lang].frases).sort(),
      Object.keys(W.FRASES_POR_FASE).sort(),
      `${lang}: chaves do pool de frases ≠ as do PT`
    );
  }
});

test('PLANETAS_CANONICOS bate com os nomes que aspects() devolve de verdade num ano', () => {
  const vistos = new Set();
  for (let i = 0; i < 365; i += 7) {
    const d = new Date(Date.UTC(2026, 0, 1));
    d.setUTCDate(d.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    for (const a of aspects(iso) || []) {
      vistos.add(a.planetA);
      vistos.add(a.planetB);
    }
  }
  assert.ok(vistos.size > 0, 'nenhum aspecto num ano inteiro — o motor astronômico não rodou');
  for (const nome of vistos) {
    assert.ok(
      DT.PLANETAS_CANONICOS.includes(nome),
      `aspects() devolve "${nome}" e PLANETAS_CANONICOS não conhece — o pensamento sairia com o nome cru`
    );
    for (const lang of IDIOMAS) {
      assert.ok(PACOTES_PENSAMENTO[lang].planetas[nome], `${lang}: planeta "${nome}" sem tradução`);
    }
  }
});

test('REGENTES_CANONICOS bate com rulerOfDay, dia a dia da semana', () => {
  for (let dia = 0; dia < 7; dia++) {
    // 04/01/2026 é um domingo — a semana inteira a partir dele.
    const d = new Date(2026, 0, 4 + dia, 12, 0, 0);
    const planeta = DT.rulerOfDay(d).planet;
    assert.ok(
      W.REGENTES_CANONICOS.includes(planeta),
      `rulerOfDay devolve "${planeta}" e REGENTES_CANONICOS não conhece`
    );
    for (const lang of IDIOMAS) {
      assert.ok(PACOTES_WALLPAPER[lang].planetas[planeta], `${lang}: regente "${planeta}" sem tradução no wallpaper`);
    }
  }
});

test('o nome da fase é o MESMO de lib/lunarCalendar.js — uma fonte de verdade só', () => {
  // Se o papel de parede escrevesse "Luna Llena" e o Calendário Lunar
  // "Luna Plena", o app estaria falando duas línguas sobre o mesmo céu.
  for (let i = 0; i < 45; i++) {
    const d = noon('2026-07-01');
    d.setDate(d.getDate() + i);
    const canonica = W.getWallpaperData(d, 'pt').fase;
    for (const lang of IDIOMAS) {
      const doMotor = getMoonPhase(new Date(`${W.getWallpaperData(d, 'pt').dia}T12:00:00Z`), lang);
      assert.equal(
        PACOTES_WALLPAPER[lang].fases[canonica],
        doMotor.name,
        `${lang}: "${canonica}" tem dois nomes diferentes no app`
      );
      assert.equal(W.getWallpaperData(d, lang).faseTexto, doMotor.name, `${lang}: faseTexto fora do motor lunar`);
    }
  }
});

test('o glifo do papel de parede continua sendo o de lib/signs.js, em qualquer idioma', () => {
  for (const s of SIGNS) {
    assert.equal(W.GLIFO_POR_SIGNO[s.name], s.emoji, `glifo de ${s.name} divergiu de lib/signs.js`);
  }
  assert.ok(!Object.values(W.GLIFO_POR_SIGNO).includes(W.GLIFO_NEUTRO), 'o glifo neutro não pode ser um signo');
});

test('a marca é a MESMA nos três idiomas e nunca vira texto traduzido', () => {
  for (const lang of IDIOMAS) {
    const w = W.getWallpaperData(noon('2026-07-31'), lang);
    assert.equal(w.marca, 'cosmicguide.cloud', `${lang}: a marca mudou`);
    assert.ok(
      PACOTES_WALLPAPER[lang].tela.soWeb.includes('cosmicguide.cloud'),
      `${lang}: o endereço saiu traduzido do aviso de web`
    );
    assert.ok(
      PACOTES_WALLPAPER[lang].tela.tamanho.includes('1080') && PACOTES_WALLPAPER[lang].tela.tamanho.includes('1920'),
      `${lang}: 1080 × 1920 é a medida do arquivo, não figura de estilo`
    );
  }
});

test('número, data e locus do PT aparecem literais na tradução da mesma frase', () => {
  // Todo numeral arábico e todo locus romano (XVIII.321, I.8) que existe no
  // pool PT tem que existir no pool traduzido da MESMA fase e posição.
  function tokens(texto) {
    const t = new Set();
    for (const m of String(texto).matchAll(/\b[IVXLCDM]+\.\d+(?:[.-]\d+)*\b/g)) t.add(m[0]);
    for (const m of String(texto).matchAll(/\b\d+(?:\.\d+)*\b/g)) t.add(m[0]);
    return [...t];
  }
  const faltando = [];
  for (const lang of IDIOMAS_PACK) {
    for (const [fase, pool] of Object.entries(W.FRASES_POR_FASE)) {
      pool.forEach((ptFrase, i) => {
        const traduzida = PACOTES_WALLPAPER[lang].frases[fase][i];
        for (const token of tokens(ptFrase)) {
          if (!traduzida.includes(token)) faltando.push(`${lang}.frases["${fase}"][${i}] perdeu "${token}"`);
        }
      });
    }
  }
  assert.deepEqual(faltando, [], `Número ou locus sumiu na tradução:\n  ${faltando.join('\n  ')}`);
});

test('frase que cita autor traz o século junto — recibo na própria frase, nos três', () => {
  // Regra da tese (docs/tradicao/00-tese.md): afirmação histórica tem dono e
  // data. Numa tela de bloqueio o recibo é curto, mas existe.
  const AUTORES = /Plínio|Plinio|Pliny|Columela|Columella|Ptolomeu|Ptolomeo|Ptolemy|Rudhyar/i;
  const SECULO = {
    pt: /séc\.\s*[IVX]+|\b1[0-9]{3}\b/,
    es: /siglos?\s*[IVX]+|\b1[0-9]{3}\b/,
    en: /\b\d+(st|nd|rd|th) century\b|\b1[0-9]{3}\b/,
  };
  for (const lang of IDIOMAS) {
    const Q = PACOTES_WALLPAPER[lang];
    const todas = [
      ...Object.entries(Q.frases).flatMap(([fase, pool]) => pool.map((f, i) => [`${fase}[${i}]`, f])),
      ...Q.frasesSemCeu.map((f, i) => [`semCeu[${i}]`, f]),
      ...Q.frasesGenericas.map((f, i) => [`genericas[${i}]`, f]),
    ];
    for (const [onde, f] of todas) {
      if (AUTORES.test(f)) {
        assert.match(f, SECULO[lang], `${lang}.${onde}: autor citado sem século — "${f}"`);
      }
    }
  }
});

test('nenhuma tradução vaza português — o card não pode sair bilíngue', () => {
  // As marcas mais óbvias do PT no texto montado. Uma delas aparecendo em
  // es/en significa que algum pedaço ficou sem pack e a Home vira mistura.
  const MARCAS_PT = [
    'Hoje é dia de', 'A Lua está em', 'Amanhã', 'deixa espaço pra',
    'O dia está', 'Metade do dia', 'estão em', 'neste período',
    'Mercúrio retrógrado',
  ];
  for (const lang of IDIOMAS_PACK) {
    for (let i = 0; i < 31; i++) {
      const d = noon('2026-07-01');
      d.setDate(d.getDate() + i);
      const texto = DT.getTodaysThought(CAPRI, d, lang);
      for (const marca of MARCAS_PT) {
        assert.ok(!texto.includes(marca), `${lang}: sobrou "${marca}" no pensamento de ${W.getWallpaperData(d, 'pt').dia}`);
      }
      const w = W.getWallpaperData(d, lang);
      for (const marca of ['Lua Nova', 'Lua Cheia', 'Quarto Crescente', 'Quarto Minguante']) {
        assert.ok(!w.frase.includes(marca), `${lang}: frase do desenho com nome de fase em português`);
      }
    }
  }
});

// ===========================================================================
// (6) A TELA — varredura do fonte de screens/WallpaperScreen.js
// ===========================================================================
// Mesma varredura que test/quizCosmico.test.js faz em QuizCosmicoScreen.js e
// test/emocoes.test.js em ComoVoceTaScreen.js. Existe por causa de uma
// armadilha nova: montarWallpaper devolve o CANÔNICO e o TRADUZIDO lado a lado
// (fase/faseTexto, signoLua/signoLuaTexto, regente/regenteTexto). Imprimir o
// canônico sai em português dentro do desenho inglês — e nenhum teste de dados
// reclamaria, porque os dados estão certos: quem erra é a tela.

const FONTE_WALLPAPER = fs.readFileSync(
  path.join(__dirname, '..', 'screens', 'WallpaperScreen.js'),
  'utf8'
);

test('a tela do papel de parede imprime os campos *Texto, nunca os canônicos', () => {
  const CANONICO_IMPRESSO = /dados\.(fase|signoLua|regente)(?!Texto)/g;
  const achados = FONTE_WALLPAPER.match(CANONICO_IMPRESSO) || [];
  assert.deepEqual(
    achados,
    [],
    'screens/WallpaperScreen.js está lendo um campo CANÔNICO do wallpaper. ' +
      '`fase`, `signoLua` e `regente` saem SEMPRE em português (são as chaves de ' +
      'GRADIENTE_POR_FASE / GLIFO_POR_SIGNO / FRASES_POR_FASE); o que se imprime são ' +
      '`faseTexto`, `signoLuaTexto` e `regenteTexto`:\n  ' + achados.join('\n  ')
  );
});

test('a tela do papel de parede pega o idioma do contexto e o chrome do lib', () => {
  assert.ok(
    /useLanguage/.test(FONTE_WALLPAPER),
    'a tela precisa do useLanguage() pra saber em que idioma pedir o desenho'
  );
  assert.ok(
    /textosDaTela\(\s*lang\s*\)/.test(FONTE_WALLPAPER),
    'o chrome da tela sai de textosDaTela(lang) em lib/wallpaper.js — não de constante literal aqui'
  );
});

test('o nome da feature é um só por idioma — o chrome bate com o card da Home', () => {
  // 'home.card.wallpaper.*' em lib/i18n.js é o que a pessoa clica; o header da
  // tela tem que dizer a mesma coisa, senão parecem duas features.
  for (const lang of IDIOMAS) {
    const tela = PACOTES_WALLPAPER[lang].tela;
    assert.equal(tela.titulo, translate(lang, 'home.card.wallpaper.title'), `${lang}: título da tela ≠ título do card`);
    assert.equal(tela.subtitulo, translate(lang, 'home.card.wallpaper.subtitle'), `${lang}: subtítulo da tela ≠ o do card`);
  }
});
