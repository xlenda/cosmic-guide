// O quiz "Você sabia?" — os testes que o seguram.
//
// Cinco trabalhos, e nenhum é enfeite:
//
// (a) VOLUME E ESTRUTURA: 30+ perguntas, cada uma com EXATAMENTE 4 opções
//     distintas e uma única certa (certaIdx válido), explicação e fonte
//     não-vazias, e `base` apontando pra um arquivo REAL de docs/tradicao/ —
//     fato sem endereço na base de pesquisa não entra.
//
// (b) PRENDE PRIMEIRO, FONTE DEPOIS: a explicação abre em conversa; "séc." e
//     ano de quatro dígitos não podem aparecer nos primeiros 40 caracteres.
//     O recibo mora no campo `fonte`, que a tela mostra depois — e ele tem
//     que estar DATADO (dígito ou "séc."), porque recibo sem data não recibo.
//
// (c) VARREDURA DE VOCABULÁRIO PROIBIDO em todo texto visível — as três
//     listas de lib/rituais.js (saúde, promessa de resultado, mecanismo
//     pseudocientífico), que já cobrem as cinco palavras da linha vermelha
//     do briefing (aliviar, acalmar, curar, tratar, energizar). E a varredura
//     passa TAMBÉM no código-fonte inteiro da tela, pra fechar a porta dos
//     fundos de escrever conteúdo no JSX.
//
// (d) DETERMINISMO DA RODADA: mesmo dia = mesmas 7 perguntas, sempre. É o que
//     permite retomar a rodada no meio sem gravar a lista, e é decisão de
//     produto documentada no cabeçalho de lib/quizCosmico.js.
//
// (e) PROGRESSO QUE NÃO SE PERDE E NÃO SE CORROMPE: fluxo completo de 7
//     respostas, idempotência depois da rodada fechada, JSON corrompido e
//     storage que ESTOURA NA CHAMADA (a armadilha documentada em
//     lib/storage.js) — tudo tem que degradar pra estado utilizável, nunca
//     pra crash nem pra estrutura meio-quebrada.
//
// E um trabalho de fronteira: o placar NÃO pode falar em medalha. O único
// sistema de medalhas do app é o da Jornada (lib/jornada.js); frase de placar
// que inventasse medalha nova criaria o sistema paralelo que o dono vetou.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

// --- fake do AsyncStorage, injetado ANTES do módulo sob teste ---------------
// Mesma armadilha documentada em test/rituais.test.js e test/jornada.test.js:
// lib/storage.js memoriza o módulo na primeira chamada, então o mock precisa
// entrar antes do require. E ele sabe QUEBRAR — o cenário que interessa não é
// "não tem storage" e sim "a chamada estoura" (window ausente fora do RN,
// SecurityError em iframe, cota cheia).
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

const {
  PERGUNTAS,
  TAMANHO_RODADA,
  TEMA_ROTULOS,
  CHAVE_QUIZ_COSMICO,
  FAIXAS_PLACAR,
  perguntaPorId,
  rodadaDoDia,
  fraseDoPlacar,
  estadoInicialQuiz,
  normalizarQuiz,
  carregarQuizCosmico,
  salvarQuizCosmico,
  rodadaFeita,
  comecarRodada,
  aplicarResposta,
} = require('../lib/quizCosmico.js');

// Mesma instância de lib/storage.js que lib/quizCosmico.js acabou de carregar
// — necessária pra baixar a flag `_semDisco`, que é de sessão de propósito.
const storageLib = require('../lib/storage.js');

const { localDayStr } = require('../lib/localDay.js');

const RAIZ = path.join(__dirname, '..');
const TEMAS_VALIDOS = Object.keys(TEMA_ROTULOS);

// ---------------------------------------------------------------------------
// (a) VOLUME E ESTRUTURA
// ---------------------------------------------------------------------------

test('o quiz tem 30+ perguntas, com id e enunciado únicos', () => {
  assert.ok(
    PERGUNTAS.length >= 30,
    `o quiz encolheu para ${PERGUNTAS.length} perguntas — o mínimo aprovado é 30`
  );
  const ids = new Set();
  const enunciados = new Set();
  for (const p of PERGUNTAS) {
    assert.ok(typeof p.id === 'string' && p.id.length > 3, `pergunta sem id: ${p.pergunta}`);
    assert.ok(!ids.has(p.id), `id repetido: ${p.id}`);
    assert.ok(!enunciados.has(p.pergunta), `enunciado repetido: ${p.pergunta}`);
    ids.add(p.id);
    enunciados.add(p.pergunta);
    assert.equal(perguntaPorId(p.id).id, p.id);
  }
  assert.equal(perguntaPorId('nao-existe'), null, 'perguntaPorId nunca pode chutar uma pergunta');
});

test('toda pergunta tem exatamente 4 opções distintas e UMA certa válida', () => {
  for (const p of PERGUNTAS) {
    assert.ok(Array.isArray(p.opcoes), `${p.id}: opcoes não é lista`);
    assert.equal(p.opcoes.length, 4, `${p.id}: precisa de exatamente 4 opções, tem ${p.opcoes.length}`);
    const distintas = new Set(p.opcoes.map((o) => String(o).trim()));
    assert.equal(distintas.size, 4, `${p.id}: opções repetidas — duas alternativas iguais somem uma na outra`);
    p.opcoes.forEach((o, i) =>
      assert.ok(typeof o === 'string' && o.trim().length >= 3, `${p.id}: opção ${i} vazia`)
    );
    assert.ok(
      Number.isInteger(p.certaIdx) && p.certaIdx >= 0 && p.certaIdx <= 3,
      `${p.id}: certaIdx inválido (${p.certaIdx}) — tem que apontar UMA das 4 opções`
    );
    assert.ok(typeof p.pergunta === 'string' && p.pergunta.trim().length >= 15, `${p.id}: enunciado curto demais`);
    assert.ok(TEMAS_VALIDOS.includes(p.tema), `${p.id}: tema "${p.tema}" não existe em TEMA_ROTULOS`);
  }
});

test('a resposta certa não mora sempre na mesma posição', () => {
  // Se todas as certas caíssem no mesmo índice, o quiz viraria padrão de
  // clique e pararia de ensinar. Exige presença nos 4 índices.
  const usados = new Set(PERGUNTAS.map((p) => p.certaIdx));
  assert.equal(usados.size, 4, `certaIdx só usa os índices ${[...usados].join(', ')} — espalhe as certas`);
});

test('explicação ensina (2-3 frases) e fonte é recibo datado', () => {
  for (const p of PERGUNTAS) {
    assert.ok(typeof p.explicacao === 'string' && p.explicacao.trim().length >= 100,
      `${p.id}: explicação curta demais pra ensinar alguma coisa`);
    assert.ok(p.explicacao.trim().length <= 600, `${p.id}: explicação virou aula — o formato é 2-3 frases`);
    const frases = p.explicacao.split('.').filter((s) => s.trim().length > 0);
    assert.ok(frases.length >= 2, `${p.id}: explicação com menos de 2 frases`);

    assert.ok(typeof p.fonte === 'string' && p.fonte.trim().length >= 10, `${p.id}: sem fonte`);
    assert.ok(
      /\d/.test(p.fonte) || /séc\./.test(p.fonte),
      `${p.id}: fonte sem data nem século — recibo sem data não é recibo: "${p.fonte}"`
    );
  }
});

test('toda pergunta aponta pra um arquivo REAL de docs/tradicao/', () => {
  for (const p of PERGUNTAS) {
    assert.ok(typeof p.base === 'string' && p.base.startsWith('docs/tradicao/'),
      `${p.id}: base fora de docs/tradicao/ — fato sem endereço na pesquisa não entra`);
    const arquivo = p.base.split('§')[0].split(',')[0].trim();
    assert.ok(
      fs.existsSync(path.join(RAIZ, arquivo)),
      `${p.id}: base aponta pra arquivo que não existe: ${arquivo}`
    );
  }
});

// ---------------------------------------------------------------------------
// (b) PRENDE PRIMEIRO, FONTE DEPOIS
// ---------------------------------------------------------------------------

test('a explicação abre em conversa — sem "séc." nem ano nos primeiros 40 caracteres', () => {
  const violacoes = [];
  for (const p of PERGUNTAS) {
    const abertura = p.explicacao.slice(0, 40);
    if (/séc\./.test(abertura) || /\b1[0-9]{3}\b/.test(abertura) || /\b20[0-2][0-9]\b/.test(abertura)) {
      violacoes.push(`${p.id} → "${abertura}..."`);
    }
  }
  assert.equal(
    violacoes.length,
    0,
    'PRENDE PRIMEIRO, FONTE DEPOIS: a explicação começa na história, o recibo vem depois ' +
      '(regra de lib/rituais.js e docs/tradicao/00-tese.md):\n  ' +
      violacoes.join('\n  ')
  );
});

// ---------------------------------------------------------------------------
// (c) A VARREDURA — saúde, promessa, mecanismo
// ---------------------------------------------------------------------------
// Mesmas três listas de test/rituais.test.js. Elas já contêm as cinco
// palavras da linha vermelha do briefing: aliviar (/\balivi/), acalmar
// (/\bacalma\b/), curar (/\bcur.../), tratar (/\btrata.../) e energizar
// (/\benergiza/). A regra é DE PALAVRA, não de intenção — se tropeçar,
// reescreve-se o texto, nunca a lista.

const SAUDE = [
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
  /\bcalmante\b/i,
  /\btranquiliza/i,
  /\balivi(a|ar|o)\b/i,
  /\bal[ií]vio\b/i,
  /\bharmoniza/i,
  /\bequilibra\b/i,
  /\bbem-estar\b/i,
  /\bsa[uú]de\b/i,
  /\bcortisol\b/i,
  /\bpress[ãa]o arterial\b/i,
  /\bsistema nervoso\b/i,
  /\benergiza/i,
  /\brevigora/i,
  /\bdesintoxica/i,
  /\bimuniza/i,
  /\bmelhora o\b/i,
  /\bfaz bem\b/i,
  /\bse sentir melhor\b/i,
  /\bsolt(a|e|ar) a tens[ãa]o\b/i,
  /\besvazi(a|e|ar) a mente\b/i,
];

const PROMESSA = [
  /\batra(i|ir|em|irá|ia)\b/i,
  /\batra[çc][ãa]o\b/i,
  /\bgarant(e|em|ia|ias|ido|ida|ir)\b/i,
  /\bpromet(e|em|er|ido)\b/i,
  /\bfaz acontecer\b/i,
  /\bmanifesta(r|ção)?\b/i,
  /\babre caminhos?\b/i,
  /\bdestrava\b/i,
  /\bdesbloqueia\b/i,
  /\bafasta\b/i,
  /\bespanta\b/i,
  /\bprotege\b/i,
  /\bproteger[áa]\b/i,
  /\bblinda\b/i,
  /\bneutraliza\b/i,
  /\belimina\b/i,
  /\bpoderoso\b/i,
  /\binfal[ií]vel\b/i,
  /\bd[áa] sorte\b/i,
  /\btraz sorte\b/i,
  /\btraz de volta\b/i,
  /\bvai dar certo\b/i,
  /\bresultado garantido\b/i,
  /\bfunciona mesmo\b/i,
  /\bcontrol(a|ar|e|ando)\b/i,
  /\bdomina(r)?\b/i,
  /\bfaça (na|com|no) (lua|quarto)/i,
];

const MECANISMO = [
  /\benergia (negativa|positiva|ruim|pesada)\b/i,
  /\benerg[ée]tic/i,
  /\bvibra[çc][ãa]o\b/i,
  /\bfrequ[êe]ncia (alta|baixa|vibracional)\b/i,
  /\bcampo (energ|vibr)/i,
  /\baura\b/i,
  /\bchakra/i,
  /\bmagnetismo\b/i,
  /\bfluido (vital|energ)/i,
  /\bmau-olhado\b/i,
  /\bolho gordo\b/i,
  /\bpurifica/i,
  /\bdescarreg(a|ar)\b/i,
  /\bel[ée]tron/i,
];

// A palavra banida por docs/tradicao/06 §2 — regra literal, sem exceção nem
// pra opção errada de quiz nem pra citação do engano ("a palavra não entra em
// nenhum texto do app. Nunca."). Duas opções de distrator já tropeçaram nela
// (taro-waite-refuta e taro-invertidas) e passaram porque esta varredura não
// existia — agora a regra fica trancada por palavra, como as demais.
const BANIDA = [/\bcigan\w*/iu];

// Todo texto que a pessoa pode ler: enunciados, as 4 opções (as ERRADAS
// inclusive — opção errada com promessa continua sendo promessa na tela),
// explicações, fontes e as frases de placar.
function todoTextoVisivel() {
  const saida = [];
  for (const p of PERGUNTAS) {
    saida.push([`${p.id}.pergunta`, p.pergunta]);
    p.opcoes.forEach((o, i) => saida.push([`${p.id}.opcao[${i}]`, o]));
    saida.push([`${p.id}.explicacao`, p.explicacao]);
    saida.push([`${p.id}.fonte`, p.fonte]);
  }
  FAIXAS_PLACAR.forEach((f, i) => saida.push([`placar[${i}]`, f.frase]));
  return saida;
}

function varrer(regras, rotulo) {
  const violacoes = [];
  for (const [caminho, texto] of todoTextoVisivel()) {
    for (const re of regras) {
      if (re.test(texto)) violacoes.push(`${caminho} → ${re} (${rotulo})`);
    }
  }
  return violacoes;
}

test('NENHUM texto do quiz faz alegação de saúde, nem implícita', () => {
  const violacoes = varrer(SAUDE, 'saúde');
  assert.equal(violacoes.length, 0,
    'Linha vermelha absoluta — a regra é de palavra, não de intenção. Reescreva o texto:\n  ' +
      violacoes.join('\n  '));
});

test('NENHUM texto do quiz promete resultado', () => {
  const violacoes = varrer(PROMESSA, 'promessa');
  assert.equal(violacoes.length, 0,
    'O quiz ensina história com fonte; não promete nada a ninguém:\n  ' + violacoes.join('\n  '));
});

test('NENHUM texto do quiz inventa mecanismo pseudocientífico', () => {
  const violacoes = varrer(MECANISMO, 'mecanismo');
  assert.equal(violacoes.length, 0,
    'Nem como imagem poética — mesma decisão de lib/grounding.js e lib/rituais.js:\n  ' +
      violacoes.join('\n  '));
});

test('NENHUM texto do quiz usa a palavra banida por docs/tradicao/06 §2', () => {
  const violacoes = varrer(BANIDA, 'palavra banida');
  assert.equal(violacoes.length, 0,
    'A regra é literal e não tem exceção pra distrator nem pra aspas — reescreva a opção:\n  ' +
      violacoes.join('\n  '));
});

// ---------------------------------------------------------------------------
// A TELA — varredura no fonte inteiro + regras estáticas de fronteira
// ---------------------------------------------------------------------------

const FONTE_TELA = fs.readFileSync(path.join(RAIZ, 'screens', 'QuizCosmicoScreen.js'), 'utf8');

test('o código-fonte da tela passa inteiro na varredura (comentários incluídos)', () => {
  const violacoes = [];
  for (const re of [...SAUDE, ...PROMESSA, ...MECANISMO, ...BANIDA]) {
    if (re.test(FONTE_TELA)) violacoes.push(String(re));
  }
  assert.equal(violacoes.length, 0,
    'screens/QuizCosmicoScreen.js tropeça em padrão proibido — conteúdo escrito na tela é ' +
      'a porta dos fundos que esta varredura fecha:\n  ' + violacoes.join('\n  '));
});

test('a tela respeita as fronteiras: storage via lib, sem dicionário, sem o quiz do casal', () => {
  assert.ok(
    !/@react-native-async-storage/.test(FONTE_TELA),
    'AsyncStorage direto na tela — SEMPRE via lib/storage.js (o fallback errado apagava progresso)'
  );
  // Só linhas de IMPORT contam — o cabeçalho da tela tem todo direito de
  // EXPLICAR por que não importa i18n, e a explicação cita o nome do arquivo.
  assert.ok(
    !/from\s+['"][^'"]*lib\/i18n['"]/.test(FONTE_TELA) && !/require\(['"][^'"]*lib\/i18n/.test(FONTE_TELA),
    'o texto desta tela mora nos packs de lib/traducoes/quiz.<lang>.js, não no dicionário de chrome'
  );
  // ESTA ASSERÇÃO MUDOU EM 31/07/2026, e a razão é que a antiga envelheceu.
  // Ela proibia LanguageContext junto com i18n — andaime da fase em que só o
  // integrador podia ligar idioma. A fase acabou: o quiz fala três línguas, e a
  // tela PRECISA do useLanguage() pra saber em qual pedir o conteúdo ao motor.
  // O que continua proibido é ela ESCREVER texto: chrome, pergunta, opção,
  // explicação e recibo saem todos de lib/quizCosmico.js.
  assert.ok(
    /useLanguage/.test(FONTE_TELA),
    'a tela precisa do useLanguage() pra passar o idioma ao lib/quizCosmico'
  );
  // A guarda é de CONTEÚDO, não de NOME: proibir literalmente `const TXT = {`
  // seria contornável renomeando a constante pra TEXTOS, L ou COPIA, e o chrome
  // voltaria pra tela com o teste verde. O que se proíbe é a FORMA: (a) texto
  // corrido escrito dentro de <Text> no JSX e (b) qualquer objeto literal de
  // chrome (o tell é a chave `titulo:` com string logo em seguida).
  const TEXTO_SOLTO_NO_JSX = FONTE_TELA.match(/<Text[^>]*>\s*[A-Za-zÀ-ÿ]{4,}/g) || [];
  assert.deepEqual(
    TEXTO_SOLTO_NO_JSX,
    [],
    'a tela voltou a ESCREVER texto no JSX — toda string visível sai de ' +
      'chromeDaTela()/perguntasParaIdioma() em lib/quizCosmico.js:\n  ' +
      TEXTO_SOLTO_NO_JSX.join('\n  ')
  );
  assert.ok(
    !/const\s+\w+\s*=\s*\{[^}]*titulo:\s*['"`]/.test(FONTE_TELA),
    'o chrome voltou a ser constante literal na tela (com outro nome, dá no mesmo) — ' +
      'ele mora em CHROME_TELA/packs desde a tradução'
  );
  assert.ok(
    /from '\.\.\/lib\/quizCosmico'/.test(FONTE_TELA),
    'a tela tem que consumir lib/quizCosmico.js — o conteúdo mora no motor, não no JSX'
  );
  // Idem: o cabeçalho AVISA para não confundir com o quiz do casal, e o aviso
  // precisa poder dizer o nome do arquivo. O que não pode existir é IMPORT.
  assert.ok(
    !/from\s+['"][^'"]*\/QuizScreen['"]/.test(FONTE_TELA),
    'a tela não pode importar screens/QuizScreen.js — aquele é o quiz do CASAL, outra feature'
  );
});

// ---------------------------------------------------------------------------
// (d) DETERMINISMO DA RODADA
// ---------------------------------------------------------------------------

test('mesmo dia = mesmas 7 perguntas, na mesma ordem', () => {
  for (const dia of ['2026-07-31', '2026-01-01', '2027-12-31']) {
    const a = rodadaDoDia(dia).map((p) => p.id);
    const b = rodadaDoDia(dia).map((p) => p.id);
    assert.deepEqual(a, b, `rodada de ${dia} mudou entre duas chamadas — quebraria a retomada no meio`);
    assert.equal(a.length, TAMANHO_RODADA, `rodada de ${dia} com ${a.length} perguntas`);
    assert.equal(new Set(a).size, TAMANHO_RODADA, `rodada de ${dia} repetiu pergunta`);
  }
});

test('toda pergunta da rodada vem do banco, e dias diferentes variam', () => {
  const idsValidos = new Set(PERGUNTAS.map((p) => p.id));
  const rodadas = [];
  for (let d = 1; d <= 10; d += 1) {
    const dia = `2026-08-${String(d).padStart(2, '0')}`;
    const ids = rodadaDoDia(dia).map((p) => p.id);
    for (const id of ids) assert.ok(idsValidos.has(id), `${dia}: pergunta fantasma ${id}`);
    rodadas.push(ids.join(','));
  }
  assert.ok(
    new Set(rodadas).size >= 2,
    'dez dias seguidos com a mesmíssima rodada — o embaralhamento por dia não está funcionando'
  );
});

test('sem argumento, a rodada é a do dia local de hoje', () => {
  assert.deepEqual(
    rodadaDoDia().map((p) => p.id),
    rodadaDoDia(localDayStr()).map((p) => p.id),
    'rodadaDoDia() tem que usar o dia LOCAL (lib/localDay.js), nunca UTC — depois das 21h no Brasil isso diverge'
  );
});

// ---------------------------------------------------------------------------
// O PLACAR
// ---------------------------------------------------------------------------

test('todo placar possível (0..7) tem frase, e nenhuma inventa medalha', () => {
  const frases = new Set();
  for (let acertos = 0; acertos <= TAMANHO_RODADA; acertos += 1) {
    const frase = fraseDoPlacar(acertos, TAMANHO_RODADA);
    assert.ok(typeof frase === 'string' && frase.trim().length >= 20, `placar ${acertos}/7 sem frase`);
    assert.ok(
      !/medalha/i.test(frase),
      `placar ${acertos}/7 fala em medalha — o único sistema de medalhas do app é o da Jornada (lib/jornada.js)`
    );
    frases.add(frase);
  }
  assert.ok(frases.size >= 3, 'as faixas de placar colapsaram numa frase só — a frase por faixa é o formato aprovado');
  assert.notEqual(
    fraseDoPlacar(0, TAMANHO_RODADA),
    fraseDoPlacar(TAMANHO_RODADA, TAMANHO_RODADA),
    'zerar e gabaritar recebem a mesma frase'
  );
});

// ---------------------------------------------------------------------------
// (e) PROGRESSO — fluxo, idempotência e corrupção
// ---------------------------------------------------------------------------

test('sete respostas fecham a rodada, com totais certos e emAndamento zerado', () => {
  const dia = '2026-07-31';
  let e = estadoInicialQuiz();
  const acertosPlano = [true, false, true, true, false, true, false]; // 4 acertos

  for (let i = 0; i < TAMANHO_RODADA; i += 1) {
    e = aplicarResposta(e, dia, acertosPlano[i]);
    if (i < TAMANHO_RODADA - 1) {
      assert.equal(e.emAndamento.dia, dia);
      assert.equal(e.emAndamento.respondidas, i + 1);
      assert.equal(rodadaFeita(e, dia), null, `rodada fechou cedo demais, na resposta ${i + 1}`);
    }
  }

  assert.equal(e.emAndamento, null, 'emAndamento tinha que zerar quando a rodada fecha');
  assert.deepEqual(rodadaFeita(e, dia), { acertos: 4, total: TAMANHO_RODADA });
  assert.deepEqual(e.totais, { respondidas: 7, acertos: 4 });

  // Idempotência: responder de novo no mesmo dia não muda NADA.
  const depois = aplicarResposta(e, dia, true);
  assert.deepEqual(depois, e, 'resposta depois da rodada fechada alterou o estado');
});

test('rodada de ontem abandonada no meio não vaza pra hoje', () => {
  let e = estadoInicialQuiz();
  e = aplicarResposta(e, '2026-07-30', true);
  e = aplicarResposta(e, '2026-07-30', true);
  assert.equal(e.emAndamento.respondidas, 2);

  // Virou o dia: a rodada nova começa do zero (as perguntas de hoje são
  // outras), mas as duas respostas já contadas ficam nos totais da vida.
  const hoje = comecarRodada(e, '2026-07-31');
  assert.deepEqual(hoje.emAndamento, { dia: '2026-07-31', respondidas: 0, acertos: 0 });
  assert.deepEqual(hoje.totais, { respondidas: 2, acertos: 2 });
  assert.equal(rodadaFeita(hoje, '2026-07-30'), null, 'rodada incompleta de ontem não pode virar rodada feita');
});

test('salvar e carregar devolvem o mesmo estado (round-trip pelo storage)', async () => {
  storageQuebrado = false;
  memStorage.clear();
  storageLib._reiniciarStorageParaTestes();

  let e = estadoInicialQuiz();
  for (let i = 0; i < TAMANHO_RODADA; i += 1) e = aplicarResposta(e, '2026-07-31', i % 2 === 0);
  e = aplicarResposta(e, '2026-08-01', true); // e uma rodada nova começada

  await salvarQuizCosmico(e);
  const lido = await carregarQuizCosmico();
  assert.deepEqual(lido, e);
  assert.ok(memStorage.has(CHAVE_QUIZ_COSMICO), 'gravou em chave errada');
});

test('JSON corrompido no disco degrada pra estado inicial, nunca pra crash', async () => {
  storageQuebrado = false;
  storageLib._reiniciarStorageParaTestes();
  memStorage.set(CHAVE_QUIZ_COSMICO, '{historico: quebrado');

  const lido = await carregarQuizCosmico();
  assert.deepEqual(lido, estadoInicialQuiz());
});

test('storage que ESTOURA na chamada degrada pra estado inicial, nunca pra crash', async () => {
  storageLib._reiniciarStorageParaTestes();
  storageQuebrado = true;
  try {
    const lido = await carregarQuizCosmico();
    assert.deepEqual(lido, estadoInicialQuiz());
    // E salvar não lança — devolve false (ficou só em memória), como todo o app.
    const foiAoDisco = await salvarQuizCosmico(lido);
    assert.equal(foiAoDisco, false);
  } finally {
    // A flag _semDisco é de sessão de propósito — sem este reset, os testes
    // seguintes do arquivo herdariam um disco "quebrado".
    storageQuebrado = false;
    memStorage.clear();
    storageLib._reiniciarStorageParaTestes();
  }
});

test('normalizarQuiz rejeita contagem impossível e tipo errado, campo a campo', () => {
  // acertos > respondidas é impossível; emAndamento com respondidas >= 7
  // também (a 7ª resposta fecha a rodada e zera o emAndamento).
  const sujo = JSON.stringify({
    versao: 1,
    historico: {
      '2026-07-30': { acertos: 9, total: 7 }, // impossível → fora
      '2026-07-29': { acertos: 5, total: 7 }, // válido → fica
      '2026-07-28': 'gabaritei', // tipo errado → fora
    },
    emAndamento: { dia: '2026-07-31', respondidas: 7, acertos: 7 }, // impossível → fora
    totais: { respondidas: 3, acertos: 11 }, // impossível → zera
  });
  const limpo = normalizarQuiz(sujo);
  assert.deepEqual(limpo.historico, { '2026-07-29': { acertos: 5, total: 7 } });
  assert.equal(limpo.emAndamento, null);
  assert.deepEqual(limpo.totais, { respondidas: 0, acertos: 0 });

  assert.deepEqual(normalizarQuiz(null), estadoInicialQuiz());
  assert.deepEqual(normalizarQuiz('"uma string"'), estadoInicialQuiz());
});
