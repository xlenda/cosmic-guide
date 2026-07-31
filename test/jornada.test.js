// Testes de lib/jornada.js — a Jornada Guiada.
//
// A feature tem duas metades que quebram por motivos completamente diferentes,
// e os testes estão separados assim:
//
//   1. A MÁQUINA DE PROGRESSO. Os bugs aqui são os clássicos de trilha: pular
//      dia, perder o que foi feito ao reabrir o app, e a virada de dia às 21h
//      no Brasil (dia UTC ≠ dia local) deixando a pessoa fazer dois passos
//      numa noite. Mock de AsyncStorage por require-cache, mesmo esquema de
//      test/missions.test.js.
//
//   2. O CONTEÚDO. Aqui o bug não trava o app — ele vaza para a loja. Uma
//      alegação de saúde num texto de 7 dias é problema jurídico, e uma data
//      inventada é problema de tese: docs/tradicao/00-tese.md exige obra,
//      autor e século, e exige que a coisa EXISTA na base. Então a varredura
//      abre os arquivos de docs/tradicao/ e confere prova por prova. Este
//      teste é lento de propósito — ele lê disco. Vale o preço.
//
// Ordem importa num ponto: o fake do AsyncStorage entra ANTES do require de
// lib/jornada.js, porque getStorage() lá memoriza o módulo na primeira chamada
// (mesma armadilha documentada em test/cosmicSound.test.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

// --- fake do AsyncStorage, injetado antes do módulo sob teste ---------------
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
const {
  TRILHAS,
  DATACOES,
  FEATURES,
  MEDALHAS,
  MEDALHAS_JORNADA,
  CHAVE_JORNADA,
  medalhasPara,
  proximaMedalha,
  medalhasDaJornada,
  trilhaPorId,
  diaDaTrilha,
  fontesDoDia,
  normalizarProgresso,
  podeConcluir,
  carregarJornada,
  progressoDaTrilha,
  passoDeHoje,
  concluirDia,
  reiniciarTrilha,
} = jornada;
const { ROUTES } = require('../routes.js');

// Meio-dia local de propósito em todas as datas: localDayStr() usa os getters
// locais, então 12:00 cai no mesmo dia civil em qualquer fuso do planeta. Com
// 00:30 ou 23:30 o teste passaria aqui e quebraria no CI em outro fuso.
const DIA_1 = new Date(2026, 6, 31, 12, 0, 0);
const DIA_2 = new Date(2026, 7, 1, 12, 0, 0);
const DIA_3 = new Date(2026, 7, 2, 12, 0, 0);
const DIA_4 = new Date(2026, 7, 3, 12, 0, 0);
const DIA_5 = new Date(2026, 7, 4, 12, 0, 0);
const DIA_6 = new Date(2026, 7, 5, 12, 0, 0);
const DIA_7 = new Date(2026, 7, 6, 12, 0, 0);
const DIAS_SEGUIDOS = [DIA_1, DIA_2, DIA_3, DIA_4, DIA_5, DIA_6, DIA_7];

function reset() {
  mem.clear();
}

// Avança uma trilha até `ate` dias, um por dia local, como o app real faria.
async function avancar(trilhaId, ate) {
  const resultados = [];
  for (let d = 1; d <= ate; d += 1) {
    resultados.push(await concluirDia(trilhaId, d, DIAS_SEGUIDOS[d - 1]));
  }
  return resultados;
}

// Todos os campos de texto que vão parar na tela, achatados. É o que as
// varreduras de conteúdo mordem.
function textosDeConteudo() {
  const out = [];
  for (const t of TRILHAS) {
    out.push([`${t.id}.nome`, t.nome], [`${t.id}.subtitulo`, t.subtitulo]);
    for (const d of t.dias) {
      const base = `${t.id}.dia${d.dia}`;
      out.push(
        [`${base}.titulo`, d.titulo],
        [`${base}.leitura`, d.leitura],
        [`${base}.pergunta`, d.pergunta],
        [`${base}.acao`, d.acao.texto]
      );
    }
  }
  for (const m of [...MEDALHAS, ...MEDALHAS_JORNADA]) {
    out.push([`medalha.${m.id}.nome`, m.nome], [`medalha.${m.id}.legenda`, m.legenda]);
  }
  return out;
}

// ===========================================================================
// 1. ESTRUTURA — o mínimo que a tela pode assumir
// ===========================================================================

test('há pelo menos 4 trilhas, todas de 7 dias, com id único', () => {
  assert.ok(TRILHAS.length >= 4, `só ${TRILHAS.length} trilhas`);
  const ids = TRILHAS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, 'id de trilha repetido');
  for (const t of TRILHAS) {
    assert.equal(t.duracao, 7, `${t.id}: trilha não tem 7 dias`);
    assert.equal(t.dias.length, 7, `${t.id}: ${t.dias.length} dias no array`);
    assert.deepEqual(
      t.dias.map((d) => d.dia),
      [1, 2, 3, 4, 5, 6, 7],
      `${t.id}: os dias não estão numerados de 1 a 7 em ordem`
    );
    assert.ok(t.nome && t.nome.length > 3, `${t.id}: trilha sem nome bonito`);
    assert.ok(t.subtitulo && t.subtitulo.length > 15, `${t.id}: subtítulo curto demais`);
  }
});

// (c) do enunciado — o teste que impede a trilha de nascer pela metade.
test('TODO dia de TODA trilha tem os quatro campos: título, leitura, pergunta e ação', () => {
  for (const t of TRILHAS) {
    for (const d of t.dias) {
      const onde = `${t.id} dia ${d.dia}`;

      assert.equal(typeof d.titulo, 'string', `${onde}: sem título`);
      assert.ok(d.titulo.trim().length >= 8, `${onde}: título vazio ou curto demais`);

      assert.equal(typeof d.leitura, 'string', `${onde}: sem leitura`);
      assert.ok(
        d.leitura.trim().length >= 200,
        `${onde}: leitura com ${d.leitura.trim().length} caracteres — curta demais pra abrir no povão e ainda fechar com recibo`
      );

      assert.equal(typeof d.pergunta, 'string', `${onde}: sem pergunta de diário`);
      assert.ok(d.pergunta.trim().endsWith('?'), `${onde}: a pergunta de diário não é pergunta`);

      assert.ok(d.acao && typeof d.acao === 'object', `${onde}: sem ação`);
      assert.ok(d.acao.texto && d.acao.texto.trim().length >= 20, `${onde}: ação vazia`);
      assert.ok(
        Object.prototype.hasOwnProperty.call(FEATURES, d.acao.feature),
        `${onde}: ação aponta pra feature inexistente "${d.acao.feature}"`
      );

      assert.ok(Array.isArray(d.fontes) && d.fontes.length > 0, `${onde}: dia sem fonte`);
    }
  }
});

test('toda ação aponta pra uma feature que já existe no app', () => {
  // O ponto é evitar botão que navega pra lugar nenhum. `rota` vem de
  // routes.js importado — renomear rota lá quebra AQUI, não em produção.
  const rotasReais = new Set(Object.values(ROUTES));
  for (const [id, f] of Object.entries(FEATURES)) {
    assert.ok(f.rotulo && f.rotulo.length > 2, `feature ${id} sem rótulo`);
    if (f.rota === null) {
      // Exceção única e consciente: o Som do Céu é o <CosmicSoundPlayer>
      // montado global em App.js, não é destino de navegação.
      assert.equal(id, 'som', `feature ${id} está sem rota e não é o Som do Céu`);
      continue;
    }
    assert.ok(rotasReais.has(f.rota), `feature ${id}: rota "${f.rota}" não existe em routes.js`);
  }

  // E as cinco features que o produto pediu têm que estar todas em uso —
  // trilha que só manda a pessoa pro Tarô não é jornada, é funil.
  const usadas = new Set();
  for (const t of TRILHAS) for (const d of t.dias) usadas.add(d.acao.feature);
  for (const obrigatoria of ['taro', 'mapa', 'calendarioLunar', 'som', 'aterramento']) {
    assert.ok(usadas.has(obrigatoria), `nenhuma ação aponta para "${obrigatoria}"`);
  }
});

test('as quatro trilhas pedidas existem, com o nome combinado', () => {
  const nomes = TRILHAS.map((t) => t.nome);
  for (const esperado of ['7 dias de Lua', 'Conhecendo seu Mapa', 'As 22 do Tarô', 'O Céu dos Antigos']) {
    assert.ok(nomes.includes(esperado), `trilha "${esperado}" sumiu`);
  }
});

// ===========================================================================
// 2. TOM — povão primeiro, recibo depois
// ===========================================================================

test('toda leitura FECHA com o recibo, e nenhuma ABRE com data ou nome de autor', () => {
  // Esta é a régua literal do dono ("mesclar para o povão entender e deixar
  // científico também") virada em teste. A ordem é o produto: recibo no fim é
  // prêmio, recibo no começo é pedágio.
  const ABERTURA_ACADEMICA = [
    /^s[ée]c(ulo|\.)/i,
    /^\d{3,4}/,
    /^(segundo|conforme|de acordo com)\b/i,
    /^(Ptolomeu|Pl[íi]nio|Columela|Pal[áa]dio|Cat[ãa]o|Hes[íi]odo|Virg[íi]lio|Waite|Etteilla|F[íi]rmico|Paulo de Alexandria|Rudhyar|Valente)\b/,
  ];
  for (const t of TRILHAS) {
    for (const d of t.dias) {
      const onde = `${t.id} dia ${d.dia}`;
      const txt = d.leitura.trim();

      const recibo = txt.slice(txt.lastIndexOf('Recibo:'));
      assert.ok(txt.includes('Recibo:'), `${onde}: leitura sem recibo`);
      assert.ok(
        txt.indexOf('Recibo:') > txt.length * 0.55,
        `${onde}: o recibo aparece cedo demais — abra na conversa, feche na fonte`
      );
      assert.ok(recibo.length > 25, `${onde}: recibo curto demais pra carregar obra e século`);

      for (const re of ABERTURA_ACADEMICA) {
        assert.doesNotMatch(txt, re, `${onde}: a leitura ABRE em registro acadêmico`);
      }
    }
  }
});

test('o recibo de cada dia nomeia obra, autor e século da fonte principal', () => {
  for (const t of TRILHAS) {
    for (const d of t.dias) {
      const onde = `${t.id} dia ${d.dia}`;
      const principal = DATACOES[d.fontes[0]];
      assert.ok(principal, `${onde}: fonte "${d.fontes[0]}" não existe em DATACOES`);
      for (const campo of ['obra', 'autor', 'quando', 'doc', 'provas']) {
        assert.ok(principal[campo], `${onde}: DATACOES.${d.fontes[0]} sem ${campo}`);
      }
    }
  }
});

// ===========================================================================
// 3. VARREDURA DE ALEGAÇÃO DE SAÚDE E DE PROMESSA
// ===========================================================================
// (d) do enunciado. Mesma régua de test/grounding.test.js e
// test/cosmicSound.test.js — a lista foi copiada de lá de propósito, pra que
// as três telas tenham UMA definição de "proibido" e não três parecidas.
//
// Só em português: este arquivo ainda não passou pelo i18n (ver o TODO no topo
// de lib/jornada.js). Quando as strings migrarem, esta varredura tem que
// passar a rodar nos três idiomas — uma alegação de saúde em espanhol não é
// menos ilegal por estar em espanhol.
const PROMESSAS_DE_SAUDE = [
  /\bcur(a|ar|as|am|ativ)/i,
  /\btrata(r|mento)?\b/i,
  /\bregenera/i,
  /\bansiedade\b/i,
  /\bdepress(ão|ao|iva|ivo)\b/i,
  /\bins[oô]nia\b/i,
  /\bdores?\b/i,
  /\bterap[eê]utic/i,
  /\bimunidade\b/i,
  /\brem[ée]dio\b/i,
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
  /\bcortisol\b/i,
  /\bpressão arterial\b/i,
  /\bsistema nervoso\b/i,
  /\bener?giza/i,
  /\benergia (positiva|negativa|vital)\b/i,
];

// O outro lado da linha vermelha, e o específico DESTE formato: trilha de 7
// dias é onde a promessa de resultado se disfarça de encorajamento.
//
// ARMADILHA que este arquivo já pisou: `\b` em JavaScript é ASCII. Depois de
// uma letra acentuada ele NUNCA casa, porque "ê" não conta como caractere de
// palavra — /no sétimo dia você\b/ não pega "no sétimo dia você vai sentir".
// Toda regra que possa terminar em acento usa `(?!\p{L})` com flag `u`, que é
// a fronteira de verdade. Descoberto rodando as regras contra frases proibidas
// de propósito; sem esse teste de mutação, a trava teria ficado decorativa.
const PROMESSAS_DE_RESULTADO = [
  /\bvai (atrair|trazer|mudar|acontecer|resolver|melhorar|se transformar)/i,
  /\bgarant(e|em|ia|ido|ida|ir)\b/i,
  /\batrai(r|rá|rão)?(?!\p{L})/iu,
  /\bmanifesta(r|ção|çao)\b/i,
  /\bfaz acontecer\b/i,
  /\brealiza (seus?|teus?) (sonhos?|desejos?)\b/i,
  /\bmuda (sua|a tua) vida\b/i,
  /\bpoder(oso|osa)\b/i,
  /\bcertamente (vai|voc[êe])(?!\p{L})/iu,
  /no s[ée]timo dia voc[êe](?!\p{L})/iu,
];

test('nenhum texto da Jornada faz alegação de saúde, nem por implicação', () => {
  const violacoes = [];
  for (const [chave, texto] of textosDeConteudo()) {
    for (const re of PROMESSAS_DE_SAUDE) {
      const m = texto.match(re);
      if (m) violacoes.push(`${chave}: "${m[0]}"`);
    }
  }
  assert.deepEqual(violacoes, [], `alegação de saúde no conteúdo da Jornada:\n${violacoes.join('\n')}`);
});

test('nenhum texto da Jornada promete resultado', () => {
  const violacoes = [];
  for (const [chave, texto] of textosDeConteudo()) {
    for (const re of PROMESSAS_DE_RESULTADO) {
      const m = texto.match(re);
      if (m) violacoes.push(`${chave}: "${m[0]}"`);
    }
  }
  assert.deepEqual(violacoes, [], `promessa de resultado no conteúdo da Jornada:\n${violacoes.join('\n')}`);
});

test('as varreduras MORDEM — cada regra pega a frase proibida que ela existe pra pegar', () => {
  // Uma varredura que nunca pega nada passa a vida inteira verde e não protege
  // ninguém. Este teste é o antídoto: roda as listas contra frases proibidas
  // escritas de propósito e exige que cada uma seja pega.
  //
  // Ele já pagou por si: foi aqui que apareceu o `\b` ASCII depois de "você",
  // que deixava /no sétimo dia você\b/ sem casar com nada.
  const DEVE_PEGAR_SAUDE = [
    'melhora o sono',
    'ajuda a dormir melhor',
    'acalma quem está agitado',
    'reduz a ansiedade do dia',
    'faz bem para a saúde',
    'alivia a tensão',
    'equilibra os chakras',
    'energiza o corpo',
    'harmoniza o ambiente',
    'bom para o bem-estar',
  ];
  for (const frase of DEVE_PEGAR_SAUDE) {
    assert.ok(
      PROMESSAS_DE_SAUDE.some((re) => re.test(frase)),
      `a varredura de saúde deixou passar: "${frase}"`
    );
  }

  const DEVE_PEGAR_RESULTADO = [
    'isso vai atrair oportunidades',
    'este ritual atrairá dinheiro',
    'garante que dá certo',
    'faz acontecer na sua vida',
    'muda sua vida em uma semana',
    'no sétimo dia você vai sentir a diferença',
    'um gesto poderoso',
    'realiza seus sonhos',
  ];
  for (const frase of DEVE_PEGAR_RESULTADO) {
    assert.ok(
      PROMESSAS_DE_RESULTADO.some((re) => re.test(frase)),
      `a varredura de promessa deixou passar: "${frase}"`
    );
  }

  // E o contrário: o vocabulário LEGÍTIMO da feature não pode disparar, senão
  // a varredura vira ruído e alguém a desliga.
  const NAO_PODE_PEGAR = [
    'abra o Calendário Lunar e veja a fase de hoje',
    'inspire contando até quatro',
    'Plínio escreveu que a colheita sofre menos dano na minguante',
    'o que você está começando agora?',
    'a Lua vai crescer nos próximos dias',
  ];
  for (const frase of NAO_PODE_PEGAR) {
    const pego = [...PROMESSAS_DE_SAUDE, ...PROMESSAS_DE_RESULTADO].find((re) => re.test(frase));
    assert.equal(pego, undefined, `falso positivo em "${frase}" pela regra ${pego}`);
  }
});

test('a pergunta de diário é sobre a vida de quem lê — nunca uma afirmação sobre ela', () => {
  // Camada 3 da tese: a vida de quem lê é dela, nunca nossa para afirmar. Uma
  // "pergunta" que na verdade afirma ("Você é intenso demais, né?") é a camada
  // 3 sendo fabricada com ponto de interrogação no fim.
  // Mesma armadilha do `\b` ASCII documentada acima em PROMESSAS_DE_RESULTADO.
  const AFIRMACOES_DISFARCADAS = [
    /^voc[êe] [ée](?!\p{L})/iu,
    /^voc[êe] tem\b/iu,
    /não é mesmo\?$/i,
    /\bné\?$/i,
    /\bconcorda\?$/i,
  ];
  for (const t of TRILHAS) {
    for (const d of t.dias) {
      for (const re of AFIRMACOES_DISFARCADAS) {
        assert.doesNotMatch(
          d.pergunta,
          re,
          `${t.id} dia ${d.dia}: a pergunta afirma coisa sobre quem lê em vez de perguntar`
        );
      }
    }
  }
});

test('as medalhas premiam o que a pessoa FEZ, não o que ela virou', () => {
  const VIROU = [/iluminad/i, /curad/i, /transformad/i, /desperta/i, /elevad/i, /purificad/i];
  for (const m of [...MEDALHAS, ...MEDALHAS_JORNADA]) {
    for (const re of VIROU) {
      assert.doesNotMatch(m.nome, re, `medalha ${m.id}: o NOME promete uma transformação`);
      assert.doesNotMatch(m.legenda, re, `medalha ${m.id}: a LEGENDA promete uma transformação`);
    }
  }
});

// ===========================================================================
// 4. AS DATAÇÕES BATEM COM A BASE
// ===========================================================================
// (e) do enunciado, e é o teste que a tese pede em
// docs/tradicao/00-tese.md ("toda afirmação histórica precisa de obra + autor
// + século, e precisa EXISTIR na base docs/tradicao/").
const BASE = path.join(__dirname, '..', 'docs', 'tradicao');
const _docs = {};
function lerDoc(arquivo) {
  if (!_docs[arquivo]) _docs[arquivo] = fs.readFileSync(path.join(BASE, arquivo), 'utf8');
  return _docs[arquivo];
}

test('todo documento citado por DATACOES existe em docs/tradicao/', () => {
  for (const [id, d] of Object.entries(DATACOES)) {
    const alvo = path.join(BASE, d.doc);
    assert.ok(fs.existsSync(alvo), `DATACOES.${id} aponta pra ${d.doc}, que não existe na base`);
  }
});

test('cada datação tem obra, autor e século — e o século não é chute', () => {
  for (const [id, d] of Object.entries(DATACOES)) {
    assert.ok(d.obra && d.obra.length > 3, `DATACOES.${id}: sem obra`);
    assert.ok(d.autor && d.autor.length > 3, `DATACOES.${id}: sem autor`);
    assert.ok(d.quando && d.quando.length > 3, `DATACOES.${id}: sem datação`);
    // Ou tem data/século, ou declara a ausência com a frase exata que a tese
    // manda usar. Não existe terceira opção — é aqui que a antiguidade
    // inventada entraria.
    const temData = /\d|s[ée]c\.|séc|XIX|XVIII|XVII|XVI|XV\b/.test(d.quando);
    const declaraAusencia = /sem data|sem fonte antiga localizada|sem datação consensual/i.test(d.quando);
    assert.ok(
      temData || declaraAusencia,
      `DATACOES.${id}: "${d.quando}" não é datação nem declaração honesta de ausência`
    );
    assert.ok(Array.isArray(d.provas) && d.provas.length >= 2, `DATACOES.${id}: menos de 2 provas`);
  }
});

test('TODA prova de TODA datação aparece literalmente no documento da base', () => {
  // Este é o coração do teste (e). Se alguém inventar um capítulo, um ano ou
  // um autor, a string simplesmente não vai estar no arquivo de pesquisa.
  const faltando = [];
  for (const [id, d] of Object.entries(DATACOES)) {
    const texto = lerDoc(d.doc);
    for (const prova of d.provas) {
      if (!texto.includes(prova)) faltando.push(`${id} → ${d.doc} não contém ${JSON.stringify(prova)}`);
    }
  }
  assert.deepEqual(faltando, [], `datação sem lastro na base:\n${faltando.join('\n')}`);
});

test('nenhuma data solta na prosa — toda data citada pertence a uma datação declarada', () => {
  // A varredura no sentido contrário. As provas garantem que o que está na
  // TABELA existe na base; esta garante que o que está no TEXTO está na
  // tabela. Sem ela, dava pra escrever "desde 3000 a.C." numa leitura e passar
  // por todos os outros testes.
  const palheiro = Object.values(DATACOES)
    .map((d) => [d.obra, d.autor, d.quando, ...d.provas].join(' | '))
    .join(' || ')
    .replace(/s[ée]culo/gi, 'séc.');

  const soltas = [];
  for (const t of TRILHAS) {
    for (const d of t.dias) {
      const txt = [d.titulo, d.leitura, d.pergunta, d.acao.texto].join(' ').replace(/s[ée]culo/gi, 'séc.');
      const achados = new Set();
      for (const m of txt.matchAll(/\b(1[0-9]{3}|20[0-9]{2})\b/g)) achados.add(m[1]);
      for (const m of txt.matchAll(/\b\d{1,4}\s*(?:a\.C\.|d\.C\.)/g)) achados.add(m[0]);
      for (const m of txt.matchAll(/s[ée]c\.\s+[IVXL]+/gi)) achados.add(m[0]);
      for (const achado of achados) {
        if (!palheiro.includes(achado)) {
          soltas.push(`${t.id} dia ${d.dia}: "${achado}" não pertence a nenhuma entrada de DATACOES`);
        }
      }
    }
  }
  assert.deepEqual(soltas, [], `data sem dono no texto:\n${soltas.join('\n')}`);
});

test('a datação do tarô é 1781 e 1911 — a honesta, não a egípcia', () => {
  // Trava específica porque é a correção de maior valor competitivo do app, e
  // é a primeira coisa que um redator bem-intencionado "melhora" de volta.
  const taro = trilhaPorId('taroVinteDois');
  const tudo = taro.dias.map((d) => d.leitura).join(' ');
  assert.match(tudo, /1781/, 'a trilha do tarô perdeu a data de Court de Gébelin');
  assert.match(tudo, /1911/, 'a trilha do tarô perdeu a data do Pictorial Key');
  assert.match(tudo, /1909/, 'a trilha do tarô perdeu a data do baralho');
  // O mito pode ser NOMEADO (é o que a trilha desmonta), mas nunca afirmado.
  assert.doesNotMatch(tudo, /vem do Egito antigo/i, 'o mito egípcio voltou como afirmação');
  assert.doesNotMatch(tudo, /Livro de Thoth\b(?!")/i, 'o Livro de Thoth aparece sem aspas de menção');
});

test('fontesDoDia devolve o recibo montado, pronto pra tela', () => {
  const fontes = fontesDoDia('luaSeteDias', 1);
  assert.equal(fontes.length, 1);
  assert.equal(fontes[0].id, 'catoPlantio');
  assert.match(fontes[0].quando, /a\.C\./);
  assert.ok(fontes[0].obra.includes('De Agri Cultura'));
  assert.deepEqual(fontesDoDia('naoExiste', 1), []);
});

// ===========================================================================
// 5. PROGRESSO — persiste, retoma, e não deixa pular
// ===========================================================================

test('trilha nova começa zerada, no dia 1', async () => {
  reset();
  const p = await progressoDaTrilha('luaSeteDias');
  assert.deepEqual(p.diasConcluidos, []);
  assert.equal(p.diaAtual, 1);
  assert.equal(p.ultimaConclusao, null);
  assert.equal(p.concluida, false);
  assert.equal(p.total, 7);
});

// (a) do enunciado — persiste e retoma.
test('progresso persiste no storage e retoma de onde parou', async () => {
  reset();
  await concluirDia('luaSeteDias', 1, DIA_1);
  await concluirDia('luaSeteDias', 2, DIA_2);

  // Chegou ao disco de verdade, não só ao objeto em memória.
  assert.ok(mem.has(CHAVE_JORNADA), 'nada foi gravado no AsyncStorage');
  const cru = JSON.parse(mem.get(CHAVE_JORNADA));
  assert.deepEqual(cru.trilhas.luaSeteDias.diasConcluidos, [1, 2]);
  assert.equal(cru.trilhas.luaSeteDias.ultimaConclusao, '2026-08-01');

  // E relendo (o que o app faz ao reabrir), a trilha retoma no 3 — não no 1.
  const p = await progressoDaTrilha('luaSeteDias');
  assert.deepEqual(p.diasConcluidos, [1, 2]);
  assert.equal(p.diaAtual, 3);
  assert.equal(p.ultimaConclusao, '2026-08-01');

  const passo = await passoDeHoje('luaSeteDias');
  assert.equal(passo.dia, 3, 'passoDeHoje não retomou onde a pessoa parou');
  assert.equal(passo.titulo, diaDaTrilha('luaSeteDias', 3).titulo);
});

test('o progresso de uma trilha não contamina o das outras', async () => {
  reset();
  await avancar('luaSeteDias', 3);
  await concluirDia('taroVinteDois', 1, DIA_1);

  const jornada2 = await carregarJornada();
  assert.deepEqual(jornada2.trilhas.luaSeteDias.diasConcluidos, [1, 2, 3]);
  assert.deepEqual(jornada2.trilhas.taroVinteDois.diasConcluidos, [1]);
  assert.deepEqual(jornada2.trilhas.mapaSeteDias.diasConcluidos, []);
  assert.equal(jornada2.diasConcluidosTotal, 4);
});

// (b) do enunciado — não deixa pular dia.
test('não deixa pular dia: o dia 5 é recusado enquanto a pessoa está no 3', async () => {
  reset();
  await avancar('luaSeteDias', 2);

  const salto = await concluirDia('luaSeteDias', 5, DIA_3);
  assert.equal(salto.ok, false);
  assert.equal(salto.motivo, 'diaAFrente');
  assert.deepEqual(salto.progresso.diasConcluidos, [1, 2], 'o salto sujou o progresso');

  // E nada foi gravado por engano.
  const cru = JSON.parse(mem.get(CHAVE_JORNADA));
  assert.deepEqual(cru.trilhas.luaSeteDias.diasConcluidos, [1, 2]);

  // O dia certo continua aceito logo em seguida.
  const certo = await concluirDia('luaSeteDias', 3, DIA_3);
  assert.equal(certo.ok, true);
  assert.deepEqual(certo.progresso.diasConcluidos, [1, 2, 3]);
});

test('não deixa refazer um dia já concluído, nem aceita dia fora do intervalo', async () => {
  reset();
  await avancar('luaSeteDias', 2);

  const repetido = await concluirDia('luaSeteDias', 1, DIA_3);
  assert.equal(repetido.ok, false);
  assert.equal(repetido.motivo, 'jaConcluido');

  for (const invalido of [0, -1, 8, 99, 2.5, 'dois', null, undefined, NaN]) {
    const r = await concluirDia('luaSeteDias', invalido, DIA_3);
    assert.equal(r.ok, false, `dia ${String(invalido)} foi aceito`);
    assert.equal(r.motivo, 'diaInvalido', `dia ${String(invalido)}: motivo errado`);
  }

  const fantasma = await concluirDia('trilhaQueNaoExiste', 1, DIA_1);
  assert.equal(fantasma.ok, false);
  assert.equal(fantasma.motivo, 'trilhaDesconhecida');
});

test('um passo por dia local — e a trava usa o dia LOCAL, não o UTC', async () => {
  reset();
  await concluirDia('luaSeteDias', 1, DIA_1);

  // Mesmo dia civil, algumas horas depois: recusado.
  const segundaVezHoje = await concluirDia('luaSeteDias', 2, new Date(2026, 6, 31, 18, 30, 0));
  assert.equal(segundaVezHoje.ok, false);
  assert.equal(segundaVezHoje.motivo, 'jaFezHoje');

  // 22h no Brasil já é o dia seguinte em UTC. Se a trava usasse toISOString,
  // ESTA chamada passaria e a pessoa faria dois passos na mesma noite. É o
  // mesmo bug que lib/localDay.js documenta pro streak.
  const mesmaNoiteTarde = await concluirDia('luaSeteDias', 2, new Date(2026, 6, 31, 22, 0, 0));
  assert.equal(mesmaNoiteTarde.ok, false, 'a virada de dia UTC furou a trava de um passo por dia');
  assert.equal(mesmaNoiteTarde.motivo, 'jaFezHoje');

  // No dia seguinte, libera.
  const amanha = await concluirDia('luaSeteDias', 2, DIA_2);
  assert.equal(amanha.ok, true);
  assert.deepEqual(amanha.progresso.diasConcluidos, [1, 2]);
});

test('a trava de um passo por dia pode ser desligada explicitamente, e o padrão é a trava ligada', async () => {
  reset();
  await concluirDia('luaSeteDias', 1, DIA_1);

  const semTrava = await concluirDia('luaSeteDias', 2, DIA_1, { umPorDia: false });
  assert.equal(semTrava.ok, true, 'o escape hatch não funciona');

  // Mas desligar a trava do calendário NÃO destrava a ordem — continua sendo
  // proibido pular. As duas travas são independentes de propósito.
  const aindaNaoPula = await concluirDia('luaSeteDias', 7, DIA_1, { umPorDia: false });
  assert.equal(aindaNaoPula.ok, false);
  assert.equal(aindaNaoPula.motivo, 'diaAFrente');
});

test('trilha inteira concluída fecha e não oferece um oitavo dia', async () => {
  reset();
  const resultados = await avancar('ceuDosAntigos', 7);
  assert.ok(resultados.every((r) => r.ok), 'algum dos sete dias foi recusado');

  const p = await progressoDaTrilha('ceuDosAntigos');
  assert.equal(p.concluida, true);
  assert.equal(p.diaAtual, null);
  assert.deepEqual(p.diasConcluidos, [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(await passoDeHoje('ceuDosAntigos'), null, 'ofereceu um oitavo dia');

  const depois = await concluirDia('ceuDosAntigos', 7, DIAS_SEGUIDOS[6]);
  assert.equal(depois.ok, false);
  assert.equal(depois.motivo, 'trilhaConcluida');
});

test('reiniciar uma trilha zera só ela', async () => {
  reset();
  await avancar('luaSeteDias', 3);
  await concluirDia('taroVinteDois', 1, DIA_1);

  const zerada = await reiniciarTrilha('luaSeteDias');
  assert.deepEqual(zerada.diasConcluidos, []);
  assert.equal(zerada.diaAtual, 1);

  const j = await carregarJornada();
  assert.deepEqual(j.trilhas.luaSeteDias.diasConcluidos, []);
  assert.deepEqual(j.trilhas.taroVinteDois.diasConcluidos, [1], 'reiniciar uma trilha derrubou a outra');
});

// ===========================================================================
// 6. ESTADO CORROMPIDO — o storage é do usuário, não nosso
// ===========================================================================

test('estado com dia pulado gravado à mão vira o maior prefixo válido', () => {
  // {1,2,5} não podia existir. Vira {1,2}: a pessoa não perde o que fez, e o
  // 5 (que a regra proíbe) some — em vez de virar "diaAtual 6" e pular três.
  const p = normalizarProgresso('luaSeteDias', {
    diasConcluidos: [1, 2, 5],
    ultimaConclusao: '2026-08-01',
  });
  assert.deepEqual(p.diasConcluidos, [1, 2]);
  assert.equal(p.diaAtual, 3);
});

test('estado corrompido não derruba nem inventa progresso', async () => {
  reset();
  mem.set(CHAVE_JORNADA, '{isso não é json');
  const p = await progressoDaTrilha('luaSeteDias');
  assert.deepEqual(p.diasConcluidos, [], 'JSON quebrado virou progresso fantasma');
  assert.equal(p.diaAtual, 1);

  // E dá pra escrever por cima sem drama.
  const r = await concluirDia('luaSeteDias', 1, DIA_1);
  assert.equal(r.ok, true);

  for (const lixo of [null, undefined, 42, 'texto', [], { diasConcluidos: 'x' }]) {
    const n = normalizarProgresso('luaSeteDias', lixo);
    assert.deepEqual(n.diasConcluidos, [], `lixo ${JSON.stringify(lixo)} virou progresso`);
    assert.equal(n.diaAtual, 1);
  }

  // Dias fora do intervalo e repetidos, tudo junto.
  const bagunca = normalizarProgresso('luaSeteDias', {
    diasConcluidos: [2, 1, 1, 0, -3, 99, 3],
    ultimaConclusao: 'ontem',
  });
  assert.deepEqual(bagunca.diasConcluidos, [1, 2, 3]);
  assert.equal(bagunca.ultimaConclusao, null, 'data inválida sobreviveu ao saneamento');
});

test('sem nenhum dia concluído não sobra data de última conclusão', () => {
  const p = normalizarProgresso('luaSeteDias', { diasConcluidos: [], ultimaConclusao: '2026-08-01' });
  assert.equal(p.ultimaConclusao, null);
});

test('podeConcluir é puro e devolve motivo — a tela precisa do motivo, não de uma exceção', () => {
  const base = normalizarProgresso('luaSeteDias', { diasConcluidos: [1, 2], ultimaConclusao: '2026-08-01' });
  assert.deepEqual(podeConcluir(base, 3, DIA_3), { ok: true, motivo: null });
  assert.equal(podeConcluir(base, 4, DIA_3).motivo, 'diaAFrente');
  assert.equal(podeConcluir(base, 2, DIA_3).motivo, 'jaConcluido');
  assert.equal(podeConcluir(base, 3, DIA_2).motivo, 'jaFezHoje');
  assert.equal(podeConcluir(base, 3, DIA_2, { umPorDia: false }).ok, true);
});

// ===========================================================================
// 7. MEDALHAS
// ===========================================================================

test('cada medalha tem nome, legenda e marco — e os marcos sobem sem repetir', () => {
  const marcos = MEDALHAS.map((m) => m.marco);
  assert.deepEqual([...marcos].sort((a, b) => a - b), marcos, 'MEDALHAS fora de ordem de marco');
  assert.equal(new Set(marcos).size, marcos.length, 'dois marcos iguais');
  assert.equal(new Set(MEDALHAS.map((m) => m.id)).size, MEDALHAS.length, 'id de medalha repetido');
  for (const m of [...MEDALHAS, ...MEDALHAS_JORNADA]) {
    assert.ok(m.nome && m.nome.length >= 4, `medalha ${m.id} sem nome`);
    assert.ok(m.legenda && m.legenda.length >= 20, `medalha ${m.id} sem legenda`);
    // Nome que dá vontade de printar não é "Nível 3".
    assert.doesNotMatch(m.nome, /^(n[íi]vel|level|badge|medalha)\s*\d*$/i, `medalha ${m.id}: nome genérico`);
  }
  // A última medalha da trilha cai exatamente no fim dela.
  assert.equal(MEDALHAS[MEDALHAS.length - 1].marco, 7, 'a medalha final não coincide com o fim da trilha');
  assert.equal(MEDALHAS_JORNADA[MEDALHAS_JORNADA.length - 1].trilhas, TRILHAS.length);
});

test('medalhasPara e proximaMedalha acompanham o progresso', () => {
  assert.deepEqual(medalhasPara(0), []);
  assert.deepEqual(medalhasPara(1).map((m) => m.id), ['primeiraLuz']);
  assert.deepEqual(medalhasPara(4).map((m) => m.id), ['primeiraLuz', 'andarilhoDoZodiaco']);
  assert.deepEqual(medalhasPara(7).map((m) => m.id), MEDALHAS.map((m) => m.id));

  assert.equal(proximaMedalha(0).marco, 1);
  assert.equal(proximaMedalha(1).marco, 3);
  assert.equal(proximaMedalha(6).marco, 7);
  assert.equal(proximaMedalha(7), null, 'ainda oferece medalha depois do último dia');
});

test('a medalha é entregue uma vez só, no dia em que foi conquistada', async () => {
  reset();
  const r1 = await concluirDia('luaSeteDias', 1, DIA_1);
  assert.deepEqual(r1.medalhasNovas.map((m) => m.id), ['primeiraLuz']);

  const r2 = await concluirDia('luaSeteDias', 2, DIA_2);
  assert.deepEqual(r2.medalhasNovas, [], 'comemorou a Primeira Luz de novo no dia 2');

  const r3 = await concluirDia('luaSeteDias', 3, DIA_3);
  assert.deepEqual(r3.medalhasNovas.map((m) => m.id), ['andarilhoDoZodiaco']);

  await concluirDia('luaSeteDias', 4, DIA_4);
  const r5 = await concluirDia('luaSeteDias', 5, DIA_5);
  assert.deepEqual(r5.medalhasNovas.map((m) => m.id), ['guardiaoDaEfemeride']);

  await concluirDia('luaSeteDias', 6, DIA_6);
  const r7 = await concluirDia('luaSeteDias', 7, DIA_7);
  assert.deepEqual(r7.medalhasNovas.map((m) => m.id), ['desbravadorDoCeu']);
});

test('medalhas de jornada dependem de trilhas inteiras, não de dias soltos', async () => {
  reset();
  assert.deepEqual(medalhasDaJornada(0), []);
  assert.deepEqual(medalhasDaJornada(2).map((m) => m.id), ['leitorDeFontes']);
  assert.deepEqual(medalhasDaJornada(TRILHAS.length).map((m) => m.id), ['leitorDeFontes', 'cartografoDoCeu']);

  await avancar('luaSeteDias', 7);
  const j1 = await carregarJornada();
  assert.equal(j1.trilhasConcluidas, 1);
  assert.deepEqual(j1.medalhasJornada, []);

  await avancar('mapaSeteDias', 6);
  const quaseLa = await carregarJornada();
  assert.equal(quaseLa.trilhasConcluidas, 1, 'seis dias de uma trilha contaram como trilha inteira');

  const fecha = await concluirDia('mapaSeteDias', 7, DIAS_SEGUIDOS[6]);
  assert.deepEqual(fecha.medalhasJornadaNovas.map((m) => m.id), ['leitorDeFontes']);

  const j2 = await carregarJornada();
  assert.equal(j2.trilhasConcluidas, 2);
  assert.deepEqual(j2.medalhasJornada.map((m) => m.id), ['leitorDeFontes']);
});

// ===========================================================================
// 8. SEM AsyncStorage — degrada, não quebra
// ===========================================================================

test('sem AsyncStorage a Jornada continua funcionando na memória da sessão', async () => {
  // Recarrega o módulo com o require do AsyncStorage estourando, que é o que
  // acontece fora do app (web sem polyfill, script de build). O contrato é
  // degradar pra memória — nunca derrubar a tela.
  reset();
  const chaveModulo = require.resolve('../lib/jornada.js');
  delete require.cache[chaveModulo];

  const loadAnterior = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === '@react-native-async-storage/async-storage') {
      throw new Error('window is not defined');
    }
    return loadAnterior.call(this, request, parent, isMain);
  };

  // O loader tem que continuar estourando durante as CHAMADAS, não só durante
  // o require: getStorage() é preguiçoso e só toca no AsyncStorage no primeiro
  // concluirDia. Restaurar o loader antes disso faria o módulo achar o mock
  // bom e o teste passaria testando a coisa errada — que foi exatamente o que
  // aconteceu na primeira versão deste teste.
  let semStorage;
  let r;
  let p;
  try {
    semStorage = require('../lib/jornada.js');
    r = await semStorage.concluirDia('luaSeteDias', 1, DIA_1);
    p = await semStorage.progressoDaTrilha('luaSeteDias');
  } finally {
    Module._load = loadAnterior;
  }

  assert.equal(r.ok, true, 'a Jornada quebrou sem AsyncStorage');
  assert.deepEqual(p.diasConcluidos, [1], 'perdeu o progresso da sessão');

  // E não escreveu em storage nenhum — ficou tudo na memória do módulo.
  assert.equal(mem.size, 0, 'gravou no AsyncStorage mesmo com ele indisponível');

  // Devolve o cache pro módulo original pra não contaminar quem rodar depois.
  delete require.cache[chaveModulo];
  require('../lib/jornada.js');
});
