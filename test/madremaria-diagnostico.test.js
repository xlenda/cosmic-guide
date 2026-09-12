// Portao do diagnostico — o cruzamento que substituiu as 78 cartas.
//
// O que este arquivo impede, e sao tres coisas que a tela nao denuncia sozinha:
//   1. o app falar de dado que ela NAO deu (o palpite disfarcado de leitura);
//   2. o app falar da OUTRA pessoa, de quem ele nao coleta nada;
//   3. o signo virar causa ("Peixes e assim") em vez de vocabulario.
//
// Padrao da casa: teste de MUTACAO. Quebrar a regra no codigo tem de deixar isto
// vermelho — ver test/ritual.test.js e test/almacen.test.js.
import assert from 'node:assert/strict';
import test from 'node:test';

import { DADOS, ORDEM_DOS_DADOS, diagnosticoDe } from '../madremaria/lib/diagnostico.js';

/** Uma resposta completa, com os ids REAIS de datos/preguntas.js. */
function completa(troca = {}) {
  return {
    respostas: {
      nombre: 'Ana',
      corte: 'distancia',
      cuando: 'meses-3-12',
      hoy: 'cero-contacto',
      intencion: 'decidir-insistir-o-soltar',
      nacimiento: '1994-03-12',
      genero: 'mulher',
      ...troca,
    },
  };
}

const textoDe = (l) => String(typeof l === 'string' ? l : l.texto || '');
const tudo = (r) => (r.linhas || []).map(textoDe).join(' \n ');

test('com os dados completos, o cruzamento acontece', () => {
  const r = diagnosticoDe(completa());
  assert.ok(r.linhas.length >= 3, `esperava ao menos 3 linhas, veio ${r.linhas.length}`);
  assert.equal(r.signo, 'Peixes');
  assert.equal(r.elemento, 'água');
  assert.ok(Number.isInteger(r.idade), 'a idade tem de sair da data');
});

// A regra central: cada linha CRUZA. Uma linha que usa um dado so nao e
// diagnostico, e a resposta dela repetida de volta.
test('toda linha declara os dados que usou, e cruza pelo menos dois', () => {
  const r = diagnosticoDe(completa());
  for (const l of r.linhas) {
    assert.ok(Array.isArray(l.usados), 'linha sem a lista de dados usados');
    assert.ok(l.usados.length >= 2, `linha com um dado so: "${textoDe(l).slice(0, 60)}"`);
    for (const d of l.usados) {
      assert.ok(ORDEM_DOS_DADOS.includes(d), `dado desconhecido declarado: ${d}`);
    }
  }
});

// MUTACAO: faca uma linha aparecer sem o dado dela e este teste cai.
test('dado que falta nao vira linha — sem nascimento, nada de signo nem idade', () => {
  const r = diagnosticoDe(completa({ nacimiento: undefined }));
  assert.equal(r.signo, null, 'signo sem data de nascimento e palpite');
  assert.equal(r.idade, null, 'idade sem data de nascimento e palpite');
  for (const l of r.linhas) {
    assert.ok(
      !l.usados.includes(DADOS.SIGNO) && !l.usados.includes(DADOS.IDADE),
      `linha usa dado ausente: "${textoDe(l).slice(0, 60)}"`
    );
  }
});

test('sem resposta nenhuma, devolve vazio em vez de inventar', () => {
  const r = diagnosticoDe({});
  assert.deepEqual(r.linhas, []);
  assert.ok(Array.isArray(r.faltando) && r.faltando.length > 0);
});

test('entrada quebrada nao lanca', () => {
  for (const entrada of [null, undefined, 'texto', 42, [], { respostas: null }]) {
    assert.doesNotThrow(() => diagnosticoDe(entrada), `estourou com ${JSON.stringify(entrada)}`);
  }
});

// O app nao coleta NADA da outra pessoa. Uma linha que fale dela e invencao.
test('nenhuma linha fala da outra pessoa', () => {
  const PROIBIDO = [
    /\bele (te|ainda|vai|sente|pensa)/i,
    /\bela (te|ainda|vai|sente|pensa)/i,
    /\bessa pessoa (sente|pensa|quer|vai|ama)/i,
    /\bo que essa pessoa\b/i,
    /\bo namorado dela\b/i,
    /\ba namorada dele\b/i,
  ];
  for (const troca of [{}, { hoy: 'hablamos' }, { hoy: 'bloqueo' }, { corte: 'ruptura' }]) {
    const texto = tudo(diagnosticoDe(completa(troca)));
    for (const p of PROIBIDO) {
      assert.ok(!p.test(texto), `fala da outra pessoa (${p}): ${texto.slice(0, 90)}`);
    }
  }
});

test('nenhuma linha preve nem promete desfecho', () => {
  const PROIBIDO = [
    /\bvoltar[aá]\b/i,
    /\bvai voltar\b/i,
    /\bvai te (procurar|buscar|chamar)\b/i,
    /\bcom certeza\b/i,
    /\bvai dar certo\b/i,
    /\bgarante\b/i,
  ];
  for (const troca of [{}, { intencion: 'entender-que-paso' }, { cuando: 'dias' }]) {
    const texto = tudo(diagnosticoDe(completa(troca)));
    for (const p of PROIBIDO) {
      assert.ok(!p.test(texto), `preve ou promete (${p}): ${texto.slice(0, 90)}`);
    }
  }
});

// O signo e VOCABULARIO, nunca causa. "Peixes e assim" seria astrologia de
// revista; "agua e a imagem com que o plano fala disso" e uma escolha de palavra.
test('o signo entra como imagem, e a linha diz que nao e causa', () => {
  const r = diagnosticoDe(completa());
  const doSigno = r.linhas.filter((l) => l.usados.includes(DADOS.SIGNO));
  assert.ok(doSigno.length > 0, 'nenhuma linha usou o signo');
  const texto = doSigno.map(textoDe).join(' ');
  assert.match(
    texto,
    /n[ãa]o (decide|determina|causa|manda)|vocabul[áa]rio|imagem/i,
    'a linha do signo precisa declarar que nao e causa'
  );
  const DETERMINISTA = [
    /\bpessoas de \w+ s[ãa]o\b/i,
    /\bpor ser de \w+, voc[êe]\b/i,
    /\bseu signo faz voc[êe]\b/i,
    /\bpeixes? (é|e) assim\b/i,
  ];
  for (const p of DETERMINISTA) {
    assert.ok(!p.test(texto), `signo virou causa (${p})`);
  }
});

test('o modulo e puro: mesma entrada, mesma saida, e a entrada nao e mutada', () => {
  const entrada = completa();
  const copia = JSON.parse(JSON.stringify(entrada));
  const a = diagnosticoDe(entrada);
  const b = diagnosticoDe(entrada);
  assert.deepEqual(entrada, copia, 'a entrada foi mutada');
  assert.deepEqual(tudo(a), tudo(b), 'duas chamadas iguais deram textos diferentes');
});

// CONTROLE DE MUTACAO: prova que os varredores acima nao passam qualquer coisa.
// Se este teste falhar, os de cima estao cegos.
test('CONTROLE: os padroes pegam quando a frase proibida existe de verdade', () => {
  const suja = 'Ela ainda pensa em você e essa pessoa vai voltar, com certeza.';
  assert.match(suja, /\bela (te|ainda|vai|sente|pensa)/i);
  assert.match(suja, /\bvai voltar\b/i);
  assert.match(suja, /\bcom certeza\b/i);
});
