const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const ROOT = path.join(__dirname, '..');
const COMPONENT_PATH = path.join(ROOT, 'components', 'community', 'CommunityDiscovery.js');
const presses = new Map();

function host(tagName) {
  return function MockHost({
    children,
    testID,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
  }) {
    return React.createElement(tagName, {
      'data-testid': testID,
      'data-label': accessibilityLabel,
      'data-role': accessibilityRole,
      'data-selected': accessibilityState?.selected,
    }, children);
  };
}

function MockPressable({
  children,
  onPress,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
}) {
  if (testID) presses.set(testID, onPress);
  const content = typeof children === 'function' ? children({ pressed: false }) : children;
  return React.createElement('button', {
    type: 'button',
    'data-testid': testID,
    'data-label': accessibilityLabel,
    'data-role': accessibilityRole,
    'data-selected': accessibilityState?.selected,
  }, content);
}

function MockFlatList({ data = [], renderItem, keyExtractor, testID }) {
  return React.createElement('div', { 'data-testid': testID }, data.map((item, index) => (
    React.createElement(
      React.Fragment,
      { key: keyExtractor ? keyExtractor(item, index) : String(index) },
      renderItem({ item, index })
    )
  )));
}

const reactNativeMock = {
  FlatList: MockFlatList,
  Platform: { select: (choices) => choices.web || choices.default },
  Pressable: MockPressable,
  StyleSheet: { create: (styles) => styles },
  Text: host('span'),
  View: host('div'),
};

const originalLoad = Module._load;
Module._load = function mockNativeModules(request, parent, isMain) {
  if (request === 'react-native') return reactNativeMock;
  if (request === '@expo/vector-icons/Ionicons') {
    return function MockIonicon({ name }) {
      return React.createElement('i', { 'data-icon': name });
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

let CommunityDiscovery;
try {
  delete require.cache[require.resolve(COMPONENT_PATH)];
  CommunityDiscovery = require(COMPONENT_PATH).default;
} finally {
  Module._load = originalLoad;
}

const ARIES = { id: 'aries', emoji: '♈', nameKey: 'community.sign.aries' };
const LEO = { id: 'leo', emoji: '♌', nameKey: 'community.sign.leo' };
const LIBRA = { id: 'libra', emoji: '♎', nameKey: 'community.sign.libra' };

const ROOMS = [
  {
    id: 'plaza',
    icon: 'sparkles-outline',
    titleKey: 'community.room.plaza.title',
    descriptionKey: 'community.room.plaza.desc',
  },
  {
    id: 'bridges',
    icon: 'git-compare-outline',
    titleKey: 'community.room.bridges.title',
    descriptionKey: 'community.room.bridges.desc',
  },
];

const SUGGESTIONS = [
  {
    signA: ARIES,
    signB: LEO,
    relationKey: 'community.relation.trigono',
    roomId: 'bridges',
  },
  {
    signA: ARIES,
    signB: LIBRA,
    relationKey: 'community.relation.oposicao',
    roomId: 'poles',
  },
];

function render(overrides = {}) {
  presses.clear();
  const translated = [];
  const t = (key) => {
    translated.push(key);
    return `translated:${key}`;
  };
  const props = {
    t,
    rooms: ROOMS,
    selectedRoomId: 'bridges',
    onSelectRoom: () => {},
    publicSign: ARIES,
    suggestions: SUGGESTIONS,
    selectedTargetId: 'leo',
    onSelectTarget: () => {},
    onOpenFollowing: () => {},
    onCompose: () => {},
    loading: false,
    empty: false,
    ...overrides,
  };
  return {
    markup: renderToStaticMarkup(React.createElement(CommunityDiscovery, props)),
    translated,
  };
}

test('descoberta traduz dados reais e encaminha seleções sem buscar nada', () => {
  const selectedRooms = [];
  const selectedTargets = [];
  let followingOpens = 0;
  let composeOpens = 0;

  const { markup, translated } = render({
    empty: true,
    onSelectRoom: (id) => selectedRooms.push(id),
    onSelectTarget: (id) => selectedTargets.push(id),
    onOpenFollowing: () => { followingOpens += 1; },
    onCompose: () => { composeOpens += 1; },
  });

  assert.match(markup, /translated:community\.discovery\.title/);
  assert.match(markup, /translated:community\.room\.bridges\.title/);
  assert.match(markup, /translated:community\.room\.bridges\.desc/);
  assert.match(markup, /translated:community\.sign\.leo/);
  assert.match(markup, /translated:community\.relation\.trigono/);
  assert.match(markup, /data-testid="community-room-bridges"[^>]*data-selected="true"/);
  assert.match(markup, /data-testid="community-target-leo"[^>]*data-selected="true"/);
  assert.ok(translated.every((key) => key.startsWith('community.')));

  presses.get('community-room-plaza')();
  presses.get('community-target-libra')();
  presses.get('community-open-following')();
  presses.get('community-compose')();
  presses.get('community-empty-compose')();

  assert.deepEqual(selectedRooms, ['plaza']);
  assert.deepEqual(selectedTargets, ['libra']);
  assert.equal(followingOpens, 1);
  assert.equal(composeOpens, 2);
});

test('carregamento é estático, honesto e não renderiza salas ou atividade falsa', () => {
  const { markup } = render({ loading: true, empty: true });

  assert.match(markup, /data-testid="community-discovery-loading"/);
  assert.match(markup, /translated:community\.discovery\.loading/);
  assert.doesNotMatch(markup, /translated:community\.room\.plaza\.title/);
  assert.doesNotMatch(markup, /community-target-leo/);
  assert.doesNotMatch(markup, /community-discovery-empty/);
  assert.equal(presses.has('community-room-plaza'), false);
});

test('sem signo público mantém as salas abertas e omite sugestões personalizadas', () => {
  const { markup, translated } = render({ publicSign: null, selectedTargetId: null });

  assert.match(markup, /translated:community\.discovery\.noSignTitle/);
  assert.match(markup, /translated:community\.discovery\.noSignBody/);
  assert.match(markup, /translated:community\.room\.plaza\.title/);
  assert.doesNotMatch(markup, /community-suggestion-list/);
  assert.equal(translated.includes('community.sign.leo'), false);
});

test('camada de apresentação permanece passiva, virtualizada e sem movimento obrigatório', () => {
  const source = fs.readFileSync(COMPONENT_PATH, 'utf8');

  assert.match(source, /\bFlatList\b/);
  assert.match(source, /\bPressable\b/);
  assert.doesNotMatch(source, /\bTouchable(?:Opacity|Highlight)\b/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /socialClient/);
  assert.doesNotMatch(source, /Animated\.(?:loop|timing|spring)/);
});
