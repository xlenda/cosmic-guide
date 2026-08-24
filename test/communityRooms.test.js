const test = require('node:test');
const assert = require('node:assert/strict');

const {
  COMMUNITY_SIGNS,
  COMMUNITY_ROOMS,
  normalizeCommunitySignId,
  classifyCommunityPair,
  communitySuggestionsFor,
} = require('../lib/communityRooms.js');

const EXPECTED_ROOMS_PER_SIGN = {
  mirrors: 1,
  bridges: 4,
  sparks: 2,
  poles: 1,
  between: 4,
};

test('a Comunidade usa doze IDs estáveis e seis salas densas', () => {
  assert.equal(COMMUNITY_SIGNS.length, 12);
  assert.deepEqual(COMMUNITY_ROOMS.map((room) => room.id), [
    'plaza', 'mirrors', 'bridges', 'sparks', 'poles', 'between',
  ]);
  assert.equal(new Set(COMMUNITY_SIGNS.map((sign) => sign.id)).size, 12);
});
test('normaliza nome português e ID público sem aceitar qualquer texto', () => {
  assert.equal(normalizeCommunitySignId('Áries'), 'aries');
  assert.equal(normalizeCommunitySignId('  GÊMEOS '), 'gemini');
  assert.equal(normalizeCommunitySignId({ name: 'Capricórnio' }), 'capricorn');
  assert.equal(normalizeCommunitySignId({ id: 'aquarius' }), 'aquarius');
  assert.equal(normalizeCommunitySignId('ofiuco'), null);
  assert.equal(normalizeCommunitySignId(null), null);
});

test('classifica exemplos documentados sem porcentagem ou veredito', () => {
  assert.deepEqual(
    ['Leão', 'Câncer', 'Libra', 'Touro'].map((other) => {
      const pair = classifyCommunityPair('Áries', other);
      return [pair.relation, pair.roomId, pair.degrees];
    }),
    [
      ['trigono', 'bridges', 120],
      ['quadratura', 'sparks', 90],
      ['oposicao', 'poles', 180],
      ['alheio30', 'between', 30],
    ]
  );

  const shape = JSON.stringify(classifyCommunityPair('Áries', 'Leão'));
  assert.doesNotMatch(shape, /percent|porcent|score|match/i);
});

test('os 144 pares são válidos, simétricos e caem em uma sala relacional', () => {
  let total = 0;
  for (const a of COMMUNITY_SIGNS) {
    for (const b of COMMUNITY_SIGNS) {
      const forward = classifyCommunityPair(a, b);
      const reverse = classifyCommunityPair(b, a);
      assert.ok(forward);
      assert.notEqual(forward.roomId, 'plaza');
      assert.equal(forward.roomId, reverse.roomId, `${a.id}/${b.id}`);
      assert.equal(forward.relation, reverse.relation, `${a.id}/${b.id}`);
      assert.equal(forward.distance, reverse.distance, `${a.id}/${b.id}`);
      total += 1;
    }
  }
  assert.equal(total, 144);
});

test('cada signo recebe todos os doze encontros sem ranking ou exclusão', () => {
  for (const sign of COMMUNITY_SIGNS) {
    const suggestions = communitySuggestionsFor(sign);
    assert.equal(suggestions.length, 12, sign.id);
    const counts = Object.fromEntries(
      Object.keys(EXPECTED_ROOMS_PER_SIGN).map((roomId) => [
        roomId,
        suggestions.filter((item) => item.roomId === roomId).length,
      ])
    );
    assert.deepEqual(counts, EXPECTED_ROOMS_PER_SIGN, sign.id);
  }
});
