// O ARCO DE 7 DIAS — as contas da constância, e a linha vermelha do texto.
//
// Duas metades, e elas quebram por motivos diferentes:
//
//   1. A CONTA. O bug clássico aqui é o número que se adianta: "você veio
//      todos os dias" aparecendo de manhã, antes de a pessoa ter vindo hoje.
//      Ou o oposto — a contagem zerando porque faltou um dia, transformando
//      medição em castigo. Os dois são mentira sobre o que aconteceu, e é o
//      que a maior parte destes testes protege.
//
//   2. O TEXTO. Um convite de hábito é o lugar mais fácil do app pra escorregar
//      numa promessa: "1 minuto de respiração" vira "1 minuto pra se acalmar"
//      com uma palavra de diferença, e aí virou alegação de saúde. A varredura
//      abaixo roda nos TRÊS idiomas, pela mesma razão de test/grounding.test.js
//      — uma alegação não fica menos alegação por estar em espanhol.
//
// Roda sozinho, sem mock: as funções de conta recebem (estado, hoje) por
// parâmetro, e o único teste que toca disco usa lib/storage.js, que já cai pra
// memória fora do runtime RN. Mesmo desenho de test/checkin.test.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONVITES,
  CATEGORIAS,
  DIAS_DO_ARCO,
  arcoVazio,
  normalizarArco,
  arcoAtivo,
  progressoDoArco,
  podeMarcar,
  escolherNoEstado,
  marcarNoEstado,
  fecharNoEstado,
  abandonarNoEstado,
  lerArco,
  escolherConvite,
  marcarHoje,
  fecharArco,
} from '../lib/arco.js';
import { LANGUAGES, _DICTS_FOR_TESTS } from '../lib/i18n.js';

// Agosto de 2026: dia 1 é sábado. As horas variam de propósito nos fixtures —
// o dia local é o que conta, não o relógio.
const dia = (n, hora = 10) => new Date(2026, 7, n, hora, 0, 0);
const ISO = (n) => `2026-08-${String(n).padStart(2, '0')}`;

// Um arco já em andamento, montado à mão: começou dia 1, com os dias que a
// chamada pedir. Montar o estado direto (em vez de simular sete toques) é o que
// deixa cada teste falar de UMA situação só.
function arcoCom(diasMarcados, conviteId = 'linha') {
  return { conviteId, inicio: ISO(1), dias: diasMarcados.map(ISO), selos: [] };
}

// ---------------------------------------------------------------------------
// 1. O FORMATO DO CONVITE
// ---------------------------------------------------------------------------
test('são de 4 a 6 convites, com id único e as três frentes representadas', () => {
  assert.ok(CONVITES.length >= 4 && CONVITES.length <= 6, `${CONVITES.length} convites — o pedido é de 4 a 6`);
  assert.equal(new Set(CONVITES.map((c) => c.id)).size, CONVITES.length, 'id repetido');
  for (const cat of CATEGORIAS) {
    assert.ok(
      CONVITES.some((c) => c.categoria === cat),
      `nenhum convite da frente "${cat}" — mente, corpo e espírito têm que estar as três`
    );
  }
  for (const c of CONVITES) {
    assert.ok(CATEGORIAS.includes(c.categoria), `${c.id} tem categoria fora da lista: ${c.categoria}`);
  }
  assert.equal(DIAS_DO_ARCO, 7);
});

// ---------------------------------------------------------------------------
// 2. A CONTA — o dia do arco, e a frase que só pode sair quando é verdade
// ---------------------------------------------------------------------------
test('escolher um convite abre o arco em HOJE, com zero dias marcados', () => {
  const novo = escolherNoEstado(arcoVazio(), 'respirar', dia(1));
  assert.equal(novo.conviteId, 'respirar');
  assert.equal(novo.inicio, ISO(1));
  assert.deepEqual(novo.dias, []);
  assert.ok(arcoAtivo(novo));

  assert.equal(escolherNoEstado(arcoVazio(), 'convite-que-nao-existe', dia(1)), null);
});

test('"você veio todos os dias" NÃO aparece antes de a pessoa vir hoje', () => {
  // Marcou dia 1 e dia 2. No dia 3 de manhã, antes de marcar, a contagem é 2
  // de 3 — dizer "todos os dias" aqui seria afirmar por antecipação.
  const p = progressoDoArco(arcoCom([1, 2]), dia(3));
  assert.equal(p.dia, 3);
  assert.equal(p.feitos, 2);
  assert.equal(p.marcouHoje, false);
  assert.equal(p.todosOsDias, false, 'a frase saiu antes do toque de hoje');

  // Marcou. Agora é verdade.
  const depois = progressoDoArco(marcarNoEstado(arcoCom([1, 2]), dia(3)), dia(3));
  assert.equal(depois.feitos, 3);
  assert.equal(depois.marcouHoje, true);
  assert.equal(depois.todosOsDias, true);
});

test('faltar um dia NÃO zera nada — a contagem continua contando o que houve', () => {
  // Dias 1, 2 e 4 marcados: o 3 ficou de fora. No dia 4, a leitura honesta é
  // "dia 4 de 7, 3 dias marcados" — nunca "você perdeu tudo".
  const p = progressoDoArco(arcoCom([1, 2, 4]), dia(4));
  assert.equal(p.dia, 4);
  assert.equal(p.feitos, 3);
  assert.equal(p.todosOsDias, false);
  assert.equal(p.maiorSequencia, 2, 'a maior corrida foi 1→2');
  assert.equal(p.fechado, false);
  // E o arco segue aberto: dá pra marcar o dia 5.
  assert.equal(podeMarcar(arcoCom([1, 2, 4]), dia(5)).ok, true);
});

test('as bolinhas dos 7 dias saem em ordem, com marcado/hoje/futuro certos', () => {
  const p = progressoDoArco(arcoCom([1, 3]), dia(3));
  assert.equal(p.passos.length, 7);
  assert.deepEqual(p.passos.map((x) => x.n), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(p.passos.map((x) => x.marcado), [true, false, true, false, false, false, false]);
  assert.deepEqual(p.passos.map((x) => x.hoje), [false, false, true, false, false, false, false]);
  assert.deepEqual(p.passos.map((x) => x.futuro), [false, false, false, true, true, true, true]);
  assert.equal(p.passos[6].iso, ISO(7), 'o sétimo passo é 7 dias corridos depois do início');
});

test('a maior sequência é a maior CORRIDA da janela, não o total de dias', () => {
  // 1,2,3 seguidos + 6,7 seguidos = 5 marcados, maior corrida 3.
  const p = progressoDoArco(arcoCom([1, 2, 3, 6, 7]), dia(7));
  assert.equal(p.feitos, 5);
  assert.equal(p.maiorSequencia, 3);
});

// ---------------------------------------------------------------------------
// 3. AS TRAVAS — um por dia, dentro da janela
// ---------------------------------------------------------------------------
test('não dá pra marcar duas vezes no mesmo dia', () => {
  const um = marcarNoEstado(arcoCom([]), dia(1, 8));
  assert.deepEqual(um.dias, [ISO(1)]);
  assert.equal(podeMarcar(um, dia(1, 23)).motivo, 'jaMarcouHoje');
  assert.equal(marcarNoEstado(um, dia(1, 23)), null, 'a segunda marcação do dia gravaria duas vezes');
});

test('sem arco escolhido não existe progresso nem marcação', () => {
  assert.equal(progressoDoArco(arcoVazio(), dia(1)), null);
  assert.equal(podeMarcar(arcoVazio(), dia(1)).motivo, 'semArco');
  assert.equal(marcarNoEstado(arcoVazio(), dia(1)), null);
});

test('passada a janela de 7 dias, não se marca mais — o arco virou placar', () => {
  const p = progressoDoArco(arcoCom([1, 2, 3]), dia(9));
  assert.equal(p.expirado, true);
  assert.equal(p.fechado, true);
  assert.equal(p.feitos, 3, 'o placar conta os dias que houve, não os sete');
  assert.equal(podeMarcar(arcoCom([1, 2, 3]), dia(9)).motivo, 'foraDaJanela');
  assert.equal(marcarNoEstado(arcoCom([1, 2, 3]), dia(9)), null);
});

test('marcar o dia 7 fecha o arco na hora', () => {
  const antes = arcoCom([1, 2, 3, 4, 5, 6]);
  assert.equal(progressoDoArco(antes, dia(7)).fechado, false, 'no dia 7 ainda dá pra marcar');
  const depois = marcarNoEstado(antes, dia(7));
  const p = progressoDoArco(depois, dia(7));
  assert.equal(p.fechado, true);
  assert.equal(p.feitos, 7);
  assert.equal(p.todosOsDias, true);
  assert.equal(p.maiorSequencia, 7);
});

test('relógio que anda pra trás não grava dia fora da janela', () => {
  // Fuso, viagem ou ajuste manual: "hoje" ficou ANTES do início do arco.
  // Marcar aqui gravaria um dia que a janela não contém — e a contagem
  // passaria a somar coisa que ela mesma descarta na leitura seguinte.
  const estado = arcoCom([]);
  const p = progressoDoArco(estado, dia(1 - 3));
  assert.equal(p.dia, 1, 'o dia do arco nunca é zero nem negativo');
  assert.equal(podeMarcar(estado, dia(1 - 3)).motivo, 'foraDaJanela');
  assert.equal(marcarNoEstado(estado, dia(1 - 3)), null);
});

// ---------------------------------------------------------------------------
// 4. O SELO — e o placar que ele carrega junto
// ---------------------------------------------------------------------------
test('fechar o arco guarda o selo COM o placar, e libera pra escolher outro', () => {
  const cheio = { ...arcoCom([1, 2, 3, 4, 5, 6, 7], 'agua'), selos: [] };
  const depois = fecharNoEstado(cheio, dia(7));
  assert.equal(depois.conviteId, null, 'o arco fechado sai de cena — dá pra escolher outro convite');
  assert.deepEqual(depois.dias, []);
  assert.equal(depois.selos.length, 1);
  assert.deepEqual(depois.selos[0], {
    conviteId: 'agua',
    inicio: ISO(1),
    feitos: 7,
    maiorSequencia: 7,
  });
});

test('selo de arco incompleto guarda o número VERDADEIRO, não sete', () => {
  const meio = arcoCom([1, 2, 5]);
  const depois = fecharNoEstado(meio, dia(10));
  assert.equal(depois.selos[0].feitos, 3, 'o selo não pode arredondar o placar pra cima');
  assert.equal(depois.selos[0].maiorSequencia, 2);
});

test('não se fecha arco que ainda está correndo', () => {
  assert.equal(fecharNoEstado(arcoCom([1, 2]), dia(3)), null);
});

test('trocar de convite no meio NÃO vira selo, e não apaga os selos antigos', () => {
  const comSelo = { ...arcoCom([1, 2]), selos: [{ conviteId: 'ceu', inicio: ISO(1), feitos: 5, maiorSequencia: 3 }] };
  const depois = abandonarNoEstado(comSelo);
  assert.equal(depois.conviteId, null);
  assert.equal(depois.selos.length, 1, 'selo conquistado é registro do que aconteceu — não se apaga');
  assert.equal(depois.selos[0].feitos, 5);
});

// ---------------------------------------------------------------------------
// 5. LIXO NO DISCO NÃO VIRA NÚMERO ERRADO
// ---------------------------------------------------------------------------
test('estado corrompido degrada pro arco vazio, sem envenenar a contagem', () => {
  assert.deepEqual(normalizarArco(null), arcoVazio());
  assert.deepEqual(normalizarArco('não sou objeto'), arcoVazio());
  assert.deepEqual(normalizarArco({ conviteId: 'inventado', inicio: ISO(1) }), arcoVazio());
  assert.deepEqual(normalizarArco({ conviteId: 'linha', inicio: 'ontem' }), arcoVazio());

  // Dias fora da janela (antes do início ou depois do sétimo) caem fora, e o
  // repetido entra uma vez só — senão `feitos` passaria de 7.
  const sujo = normalizarArco({
    conviteId: 'linha',
    inicio: ISO(10),
    dias: [ISO(9), ISO(10), ISO(10), ISO(16), ISO(17), 'lixo', null],
    selos: [],
  });
  assert.deepEqual(sujo.dias, [ISO(10), ISO(16)]);
  assert.equal(progressoDoArco(sujo, dia(16)).feitos, 2);

  // Convite inválido derruba o arco, mas os selos sobrevivem.
  const comSelos = normalizarArco({
    conviteId: null,
    inicio: null,
    selos: [{ conviteId: 'ceu', inicio: ISO(1), feitos: 4, maiorSequencia: 2 }],
  });
  assert.equal(arcoAtivo(comSelos), false);
  assert.equal(comSelos.selos.length, 1);
});

// ---------------------------------------------------------------------------
// 6. O DISCO — ida e volta pela lib/storage.js
// ---------------------------------------------------------------------------
test('escolher, marcar e fechar sobrevivem ao disco', async () => {
  await escolherConvite('silencio', dia(1));
  let lido = await lerArco();
  assert.equal(lido.conviteId, 'silencio');

  await marcarHoje(dia(1));
  await marcarHoje(dia(1, 22)); // segunda tentativa no mesmo dia: não grava
  lido = await lerArco();
  assert.deepEqual(lido.dias, [ISO(1)]);

  for (let n = 2; n <= 7; n += 1) await marcarHoje(dia(n));
  lido = await lerArco();
  assert.equal(progressoDoArco(lido, dia(7)).feitos, 7);

  await fecharArco(dia(7));
  lido = await lerArco();
  assert.equal(arcoAtivo(lido), false, 'o arco fechado não volta do disco como ativo');
  assert.equal(lido.selos.length, 1);
  assert.equal(lido.selos[0].feitos, 7);
});

// ---------------------------------------------------------------------------
// 7. A LINHA VERMELHA — nos três idiomas
// ---------------------------------------------------------------------------
// Promessa de efeito sobre corpo, mente ou sorte. Mesma régua de
// test/grounding.test.js e test/cosmicSound.test.js.
//
// O que NÃO entra na lista, e o motivo importa: `dormir` / `bed` são MOMENTO do
// dia ("escrever 1 linha antes de dormir"), não alegação. O que é banido é o
// substantivo que vira promessa — sono, sueño, sleep. A régua da feature é
// gesto sim, efeito não.
const PROMESSAS = [
  // pt
  /\bcur(a|ar|am|as|ativ)/i, /\btrata(r|mento)?\b/i, /\bmelhora(r|m)?\b/i,
  /\bacalma/i, /\brelaxa/i, /\balivi(a|ar|o)\b/i, /\bharmoniza/i, /\bequilibra/i,
  /\bansiedade\b/i, /\bdepress(ão|ao|iva|ivo)\b/i, /\bins[oô]nia\b/i,
  /\bsono\b/i, /\bestresse\b/i, /\bsaúde\b/i, /\bbem-estar\b/i, /\bsorte\b/i,
  /\bgarant(e|ia|ido)\b/i, /\bpromete\b/i, /\bresultados?\b/i, /\bvai (te )?\w+ar\b/i,
  // es
  /\bcura/i, /\btrata(miento)?\b/i, /\bmejora/i, /\bcalma\b/i, /\brelaja/i,
  /\balivia/i, /\barmoniza/i, /\bansiedad\b/i, /\bdepresión\b/i, /\binsomnio\b/i,
  /\bsueño\b/i, /\bestrés\b/i, /\bsalud\b/i, /\bbienestar\b/i, /\bsuerte\b/i,
  /\bgarantiza\b/i, /\bresultados?\b/i,
  // en
  /\bcure[sd]?\b/i, /\bheal(s|ing|ed)?\b/i, /\btreat(s|ment|ing)?\b/i,
  /\bimprove/i, /\bbetter\b/i, /\bcalm/i, /\brelax/i, /\brelieve/i,
  /\banxiety\b/i, /\bdepression\b/i, /\binsomnia\b/i, /\bsleep\b/i, /\bstress\b/i,
  /\bhealth\b/i, /\bwell-?being\b/i, /\bwellness\b/i, /\bluck(y|ier)?\b/i,
  /\bguarantee/i, /\bpromise/i, /\bresults?\b/i,
];

function entradasDoArco(lang) {
  const dict = _DICTS_FOR_TESTS[lang];
  return Object.keys(dict)
    .filter((k) => k.startsWith('arco.'))
    .map((k) => [k, dict[k]]);
}

function varrer(entradas) {
  const violacoes = [];
  for (const [k, v] of entradas) {
    for (const re of PROMESSAS) if (re.test(v)) violacoes.push(`${k} → ${re}`);
  }
  return violacoes;
}

test('nenhum texto do Arco promete efeito sobre corpo, mente ou sorte (pt, es, en)', () => {
  const violacoes = [];
  for (const lang of LANGUAGES) {
    for (const v of varrer(entradasDoArco(lang))) violacoes.push(`${lang} ${v}`);
  }
  assert.equal(
    violacoes.length,
    0,
    'O hábito é CONVITE, e o número é contagem do que a pessoa fez. Estas frases ' +
      'prometem efeito e não podem existir — descreva o GESTO ("escrever 1 linha", ' +
      '"beber 1 copo d\'água"), nunca o que ele causaria:\n  ' + violacoes.join('\n  ')
  );
});

test('a varredura MORDE — frase proibida plantada é pega nos três idiomas', () => {
  // Sem isto, uma lista de regex quebrada passaria verde pra sempre e o teste
  // acima viraria decoração.
  const plantadas = [
    ['arco.convite.plantado', 'Respirar 1 minuto pra acalmar a ansiedade'],
    ['arco.convite.plantado', 'Respirar 1 minuto para calmar la ansiedad'],
    ['arco.convite.plantado', 'Breathe for 1 minute to relieve stress'],
    ['arco.selo.plantado', 'Sete dias seguidos vai melhorar o seu sono'],
  ];
  for (const par of plantadas) {
    assert.ok(varrer([par]).length > 0, `a varredura deixou passar: "${par[1]}"`);
  }
});

test('todo convite e toda categoria têm rótulo nos três idiomas', () => {
  const faltando = [];
  const chaves = [
    ...CONVITES.map((c) => `arco.convite.${c.id}`),
    ...CATEGORIAS.map((c) => `arco.categoria.${c}`),
  ];
  for (const lang of LANGUAGES) {
    for (const chave of chaves) {
      const v = _DICTS_FOR_TESTS[lang][chave];
      if (typeof v !== 'string' || v.trim() === '') faltando.push(`${lang}: ${chave}`);
    }
  }
  assert.deepEqual(
    faltando,
    [],
    `a tela mostraria o nome da chave crua:\n  ${faltando.join('\n  ')}`
  );
});

test('não sobra rótulo de convite órfão no dicionário', () => {
  // O contrário do teste acima: uma chave arco.convite.* sem convite
  // correspondente é convite que foi removido do motor e ficou de resto no
  // dicionário — ou pior, convite que alguém escreveu e esqueceu de ligar.
  const ids = new Set(CONVITES.map((c) => c.id));
  const orfas = Object.keys(_DICTS_FOR_TESTS.pt)
    .filter((k) => k.startsWith('arco.convite.'))
    .filter((k) => !ids.has(k.slice('arco.convite.'.length)));
  assert.deepEqual(orfas, [], `rótulo sem convite no motor: ${orfas.join(', ')}`);
});
