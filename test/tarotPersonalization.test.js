import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TAROT_PERSONALIZATION_OUTCOMES,
  buildPublicTarotBody,
  buildTarotSynthesisModel,
  normalizeTarotQuestion,
  resolveTarotOutcome,
} from '../lib/tarotPersonalization.js';

const cards = [
  { name: 'A Lua', canonicalMeaning: 'Trecho canonico da primeira carta.' },
  { name: 'A Justica', canonicalMeaning: 'Trecho canonico da segunda carta.' },
  { name: 'O Sol', canonicalMeaning: 'Trecho canonico da terceira carta.' },
];

test('normaliza espacos e limita a pergunta a 220 caracteres Unicode', () => {
  assert.equal(normalizeTarotQuestion('  O que   merece\n minha atencao?  '), 'O que merece minha atencao?');
  assert.equal(normalizeTarotQuestion('   '), null);
  assert.equal(normalizeTarotQuestion(null), null);

  const long = `${'a'.repeat(219)}🔮fim`;
  const normalized = normalizeTarotQuestion(long);
  assert.equal(Array.from(normalized).length, 220);
  assert.equal(normalized.endsWith('🔮'), true, 'o limite nao pode partir o emoji em dois');
});

test('resolve os quatro outcomes validos e usa clarity como fallback seguro', () => {
  for (const outcome of TAROT_PERSONALIZATION_OUTCOMES) {
    assert.equal(resolveTarotOutcome({ outcome }), outcome);
    assert.equal(resolveTarotOutcome(JSON.stringify({ outcome })), outcome);
  }
  assert.equal(resolveTarotOutcome({ outcome: 'prever-o-futuro' }), 'clarity');
  assert.equal(resolveTarotOutcome({}), 'clarity');
  assert.equal(resolveTarotOutcome('{invalido'), 'clarity');
  assert.equal(resolveTarotOutcome(null), 'clarity');
});

test('perguntas diferentes mudam somente o contexto, nunca cartas ou significados', () => {
  const base = { themeLabel: 'Amor', profile: { outcome: 'patterns' }, cards };
  const first = buildTarotSynthesisModel({ ...base, question: 'O que eu repito?' });
  const second = buildTarotSynthesisModel({ ...base, question: 'Qual limite preciso observar?' });

  assert.notEqual(first.question, second.question);
  assert.deepEqual(first.cardNames, second.cardNames);
  assert.deepEqual(first.canonicalMeanings, second.canonicalMeanings);
  assert.deepEqual(first.cardNames, ['A Lua', 'A Justica', 'O Sol']);
  assert.deepEqual(first.canonicalMeanings, cards.map((card) => card.canonicalMeaning));
  assert.deepEqual(first.bridgeVars, {
    firstCardName: 'A Lua',
    secondCardName: 'A Justica',
    thirdCardName: 'O Sol',
  });
  assert.equal(first.contextVars.hasQuestion, true);
});

test('modelo vazio mantem contrato de tres cartas sem inventar conteudo', () => {
  const model = buildTarotSynthesisModel({ profile: { outcome: 'invalido' } });
  assert.equal(model.question, null);
  assert.equal(model.themeLabel, null);
  assert.equal(model.outcome, 'clarity');
  assert.deepEqual(model.cardNames, [null, null, null]);
  assert.deepEqual(model.canonicalMeanings, [null, null, null]);
  assert.deepEqual(model.contextVars, {
    question: null,
    themeLabel: null,
    outcome: 'clarity',
    hasQuestion: false,
  });
});

test('modelo e corpo publico sao neutros: textos pt, es e en vem integralmente do chamador', () => {
  const samples = [
    { theme: 'Amor', names: ['A Lua', 'A Justica', 'O Sol'], snippets: ['Primeiro.', 'Segundo.', 'Terceiro.'] },
    { theme: 'Amor', names: ['La Luna', 'La Justicia', 'El Sol'], snippets: ['Primero.', 'Segundo.', 'Tercero.'] },
    { theme: 'Love', names: ['The Moon', 'Justice', 'The Sun'], snippets: ['First.', 'Second.', 'Third.'] },
  ];

  for (const sample of samples) {
    const model = buildTarotSynthesisModel({
      themeLabel: sample.theme,
      cards: sample.names,
      canonicalMeanings: sample.snippets,
    });
    assert.deepEqual(model.cardNames, sample.names);
    assert.deepEqual(model.canonicalMeanings, sample.snippets);

    const body = buildPublicTarotBody({
      themeLabel: model.themeLabel,
      cardNames: model.cardNames,
      canonicalSnippets: model.canonicalMeanings,
    });
    for (const value of [sample.theme, ...sample.names, ...sample.snippets]) {
      assert.ok(body.includes(value));
    }
  }
});

test('corpo publico ignora pergunta, reflexao e campos privados por construcao', () => {
  const privateQuestion = 'SEGREDO-PERGUNTA-9472';
  const privateReflection = 'SEGREDO-REFLEXAO-5831';
  const privateNote = 'SEGREDO-NOTA-2604';
  const body = buildPublicTarotBody({
    themeLabel: 'Energia',
    cardNames: cards.map((card) => card.name),
    canonicalSnippets: cards.map((card) => card.canonicalMeaning),
    question: privateQuestion,
    reflection: privateReflection,
    privateFields: { note: privateNote },
  });

  assert.equal(body, [
    'Energia',
    'A Lua\nTrecho canonico da primeira carta.',
    'A Justica\nTrecho canonico da segunda carta.',
    'O Sol\nTrecho canonico da terceira carta.',
  ].join('\n\n'));
  assert.equal(body.includes(privateQuestion), false);
  assert.equal(body.includes(privateReflection), false);
  assert.equal(body.includes(privateNote), false);
});
