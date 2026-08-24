const test = require('node:test');
const assert = require('node:assert/strict');

const client = require('../lib/communityRooms.js');
const server = require('../server-patches/src/application/communityRooms.js');

test('cliente e servidor usam os mesmos IDs públicos de signo e sala', () => {
  assert.deepEqual(client.COMMUNITY_SIGNS.map((sign) => sign.id), [...server.SIGN_IDS]);
  assert.deepEqual(client.COMMUNITY_ROOMS.map((room) => room.id), [...server.ROOM_IDS]);
});
test('cliente e servidor classificam todos os 144 pares do mesmo modo', () => {
  for (const a of server.SIGN_IDS) {
    for (const b of server.SIGN_IDS) {
      const fromClient = client.classifyCommunityPair(a, b);
      const fromServer = server.classifyPair(a, b);
      assert.deepEqual(
        {
          signA: fromClient.signA.id,
          signB: fromClient.signB.id,
          distance: fromClient.distance,
          degrees: fromClient.degrees,
          relation: fromClient.relation,
          roomId: fromClient.roomId,
        },
        fromServer,
        `${a}/${b}`
      );
    }
  }
});

test('servidor recusa signo e sala fora da allowlist', () => {
  assert.equal(server.normalizeSignId('ofiuco'), null);
  assert.equal(server.normalizeRoomId('match-perfeito'), null);
  assert.equal(server.classifyPair('aries', 'ofiuco'), null);
});
