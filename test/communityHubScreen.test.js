const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const ROOT = path.join(__dirname, '..');
const SCREEN_PATH = path.join(ROOT, 'screens', 'CommunityHubScreen.js');
const presses = new Map();
let discoveryProps = null;

function host(tagName) {
  return function MockHost({
    children,
    testID,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
    value,
  }) {
    return React.createElement(tagName, {
      'data-testid': testID,
      'data-label': accessibilityLabel,
      'data-role': accessibilityRole,
      'data-selected': accessibilityState?.selected,
      'data-checked': accessibilityState?.checked,
      'data-disabled': accessibilityState?.disabled,
      'data-value': value,
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
    'data-checked': accessibilityState?.checked,
    'data-disabled': accessibilityState?.disabled,
  }, content);
}

function MockFlatList({ data = [], renderItem, keyExtractor, ListHeaderComponent, testID }) {
  const header = typeof ListHeaderComponent === 'function'
    ? React.createElement(ListHeaderComponent)
    : ListHeaderComponent;
  return React.createElement('div', { 'data-testid': testID }, [
    React.createElement(React.Fragment, { key: 'header' }, header),
    ...data.map((item, index) => React.createElement(
      React.Fragment,
      { key: keyExtractor ? keyExtractor(item, index) : String(index) },
      renderItem({ item, index })
    )),
  ]);
}

function MockModal({ visible, children }) {
  return visible ? React.createElement('div', { 'data-modal': 'true' }, children) : null;
}

const reactNativeMock = {
  ActivityIndicator: host('progress'),
  FlatList: MockFlatList,
  KeyboardAvoidingView: host('div'),
  Modal: MockModal,
  Platform: {
    OS: 'web',
    select: (choices) => choices.web || choices.default,
  },
  Pressable: MockPressable,
  RefreshControl: () => null,
  ScrollView: host('div'),
  StyleSheet: {
    absoluteFill: {},
    create: (styles) => styles,
  },
  Text: host('span'),
  TextInput: host('input'),
  View: host('div'),
};

const originalLoad = Module._load;
Module._load = function mockNativeModules(request, parent, isMain) {
  if (request === 'react-native') return reactNativeMock;
  if (request === '@react-navigation/native') {
    return {
      useFocusEffect: () => {},
      useNavigation: () => ({ navigate: () => {} }),
    };
  }
  if (request === '@expo/vector-icons/Ionicons') {
    return function MockIonicon({ name }) {
      return React.createElement('i', { 'data-icon': name });
    };
  }
  if (request === '../components/GradientHeader') {
    return function MockHeader({ title, subtitle }) {
      return React.createElement('header', null, title, subtitle);
    };
  }
  if (request === '../components/community/CommunityDiscovery') {
    return function MockDiscovery(props) {
      discoveryProps = props;
      return React.createElement('section', {
        'data-testid': 'mock-community-discovery',
        'data-room': props.selectedRoomId,
        'data-suggestions': props.suggestions?.length,
        'data-empty': props.empty,
      });
    };
  }
  if (request === '../context/AuthContext') {
    return { useAuth: () => ({ user: null, loading: false }) };
  }
  if (request === '../context/LanguageContext') {
    return { useLanguage: () => ({ t: (key) => key }) };
  }
  if (request === '../lib/socialClient') {
    return {
      acceptCommunityGuidelines: async () => ({}),
      addSocialComment: async () => ({}),
      blockSocialUser: async () => ({}),
      createCommunityPost: async () => ({}),
      deleteSocialComment: async () => ({}),
      deleteSocialPost: async () => ({}),
      getCommunityRoomFeed: async () => ({ posts: [], meta: {} }),
      getMySocialProfile: async () => null,
      getSocialComments: async () => [],
      likeSocialPost: async () => ({}),
      reportContent: async () => ({}),
      unlikeSocialPost: async () => ({}),
      unblockSocialUser: async () => ({}),
      updateCommunityProfile: async () => null,
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

let screen;
try {
  delete require.cache[require.resolve(SCREEN_PATH)];
  screen = require(SCREEN_PATH);
} finally {
  Module._load = originalLoad;
}

const {
  CommunityHubState,
  ConversationThreadModal,
  ConversationComposerModal,
  FeedPost,
  GuidelinesConsentModal,
  SignConsentModal,
  buildCommunityPostPayload,
  communityErrorKey,
  hasAcceptedCommunityGuidelines,
  hasPublicCommunitySign,
  isCommunitySuspendedError,
  removeUserContent,
  updatePostCommentCount,
  updatePostLikeState,
} = screen;

const t = (key, vars) => {
  if (!vars) return key;
  return `${key}:${JSON.stringify(vars)}`;
};

function render(element) {
  presses.clear();
  discoveryProps = null;
  return renderToStaticMarkup(element);
}

function baseHubProps(overrides = {}) {
  return {
    t,
    user: { id: 'user-1' },
    authLoading: false,
    profile: {
      user_id: 'user-1',
      show_zodiac_sign: 1,
      zodiac_sign: 'aries',
    },
    profileLoading: false,
    profileError: false,
    posts: [],
    feedLoading: false,
    feedError: false,
    refreshing: false,
    selectedRoomId: 'plaza',
    selectedTargetId: null,
    publicSign: { id: 'aries', emoji: 'â™ˆ', nameKey: 'community.sign.aries' },
    suggestions: [],
    noticeKey: null,
    operationErrorKey: null,
    onLogin: () => {},
    onCreateProfile: () => {},
    onRetryProfile: () => {},
    onRetryFeed: () => {},
    onRefresh: () => {},
    onOpenSign: () => {},
    onSelectRoom: () => {},
    onSelectTarget: () => {},
    onOpenFollowing: () => {},
    onCompose: () => {},
    ...overrides,
  };
}

test('payload da PraÃ§a nunca envia signo e sala relacional envia somente o alvo', () => {
  assert.deepEqual(buildCommunityPostPayload({
    roomId: 'plaza',
    targetSign: 'leo',
    title: '  Pergunta  ',
    body: '  Corpo real  ',
  }), {
    roomId: 'plaza',
    targetSign: null,
    title: 'Pergunta',
    body: 'Corpo real',
  });

  assert.deepEqual(buildCommunityPostPayload({
    roomId: 'bridges',
    targetSign: 'leo',
    title: 'Pontes',
    body: 'Uma experiÃªncia',
  }), {
    roomId: 'bridges',
    targetSign: 'leo',
    title: 'Pontes',
    body: 'Uma experiÃªncia',
  });
});

test('consentimento pÃºblico e aceite sÃ³ existem com os campos explÃ­citos do perfil', () => {
  assert.equal(hasPublicCommunitySign({ show_zodiac_sign: 1, zodiac_sign: 'aries' }), true);
  assert.equal(hasPublicCommunitySign({ show_zodiac_sign: 0, zodiac_sign: 'aries' }), false);
  assert.equal(hasPublicCommunitySign({ show_zodiac_sign: 1, zodiac_sign: 'invalid' }), false);
  assert.equal(hasAcceptedCommunityGuidelines({
    community_guidelines_version: '2026-08-24',
    community_guidelines_accepted_at: '2026-08-24T12:00:00.000Z',
  }), true);
  assert.equal(hasAcceptedCommunityGuidelines({ community_guidelines_version: '2026-08-24' }), false);
});

test('cÃ³digos estÃ¡veis do servidor escolhem traduÃ§Ãµes sem exibir a mensagem dele', () => {
  assert.equal(
    communityErrorKey({ code: 'public_zodiac_sign_required', message: 'servidor em portuguÃªs' }),
    'community.error.community_public_sign_required'
  );
  assert.equal(
    communityErrorKey({ code: 'room_mismatch' }),
    'community.error.community_room_mismatch'
  );
  assert.equal(
    communityErrorKey({ code: 'community_guidelines_required' }),
    'community.error.community_guidelines_required'
  );
  assert.equal(
    communityErrorKey({ code: 'community_suspended' }),
    'community.error.community_suspended'
  );
  assert.equal(
    communityErrorKey({ code: 'community_content_rejected' }),
    'community.error.community_content_rejected'
  );
  assert.equal(communityErrorKey({ code: 'unknown_new_code' }), 'community.error.generic');
});

test('participação suspensa mostra o motivo específico sem oferecer retry inútil', () => {
  const markup = render(React.createElement(CommunityHubState, baseHubProps({
    profile: undefined,
    profileError: 'community.error.community_suspended',
  })));

  assert.match(markup, /community\.error\.community_suspended/);
  assert.doesNotMatch(markup, /data-testid="community-retry"/);
  assert.equal(presses.has('community-retry'), false);
});

test('participação suspensa prevalece sobre perfil e feed mantidos em cache', () => {
  const markup = render(React.createElement(CommunityHubState, baseHubProps({
    profileLoading: true,
    profileError: 'community.error.community_suspended',
    posts: [{
      id: 91,
      title: 'Conteúdo antigo em cache',
      body: 'Este feed não pode continuar visível.',
    }],
  })));

  assert.match(markup, /community\.error\.community_suspended/);
  assert.doesNotMatch(markup, /data-testid="community-hub-authenticated"/);
  assert.doesNotMatch(markup, /Conteúdo antigo em cache/);
  assert.doesNotMatch(markup, /data-testid="community-retry"/);
  assert.equal(presses.has('community-retry'), false);
});

test('detector de suspensão aceita somente o código estável do servidor', () => {
  assert.equal(isCommunitySuspendedError({ code: 'community_suspended' }), true);
  assert.equal(isCommunitySuspendedError({ code: 'community_guidelines_required' }), false);
  assert.equal(isCommunitySuspendedError({ message: 'community_suspended' }), false);
  assert.equal(isCommunitySuspendedError(null), false);
});

test('handler central de suspensão invalida requests e limpa todo cache social visível', () => {
  const source = fs.readFileSync(SCREEN_PATH, 'utf8');
  const start = source.indexOf('const handleCommunitySuspension = useCallback');
  const end = source.indexOf('const loadRoom = useCallback', start);
  const handler = source.slice(start, end);

  assert.ok(start >= 0 && end > start, 'handler central não encontrado');
  assert.equal((source.match(/const handleCommunitySuspension = useCallback/g) || []).length, 1);
  for (const contract of [
    "if (!isCommunitySuspendedError(error)) return false",
    'profileRequestRef.current += 1',
    'feedRequestRef.current += 1',
    'commentsRequestRef.current += 1',
    'likingPostIdsRef.current.clear()',
    "selectedRoomRef.current = 'plaza'",
    'setProfile(undefined)',
    'setProfileLoading(false)',
    'setProfileError(COMMUNITY_SUSPENDED_ERROR_KEY)',
    'setPosts([])',
    'setFeedLoading(false)',
    'setFeedError(false)',
    'setRefreshing(false)',
    "setSelectedRoomId('plaza')",
    'setSelectedTargetId(null)',
    'setNoticeKey(null)',
    'setOperationErrorKey(null)',
    'setSignModalVisible(false)',
    'setSignDraft(null)',
    'setComposerVisible(false)',
    "setComposerTitle('')",
    "setComposerBody('')",
    'setGuidelinesVisible(false)',
    'setGuidelinesChecked(false)',
    'setPendingPost(null)',
    'setPendingComment(null)',
    'setOperationBusy(false)',
    'setActivePost(null)',
    'setComments(null)',
    'setCommentsLoading(false)',
    "setCommentText('')",
    'setThreadBusy(false)',
    'setThreadErrorKey(null)',
    'setThreadNoticeKey(null)',
    'return true',
  ]) {
    assert.match(handler, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), contract);
  }
});

test('toda família de chamada social encaminha community_suspended ao handler central', () => {
  const source = fs.readFileSync(SCREEN_PATH, 'utf8');
  const contracts = [
    ['const loadRoom = useCallback', 'const loadHub = useCallback', 1],
    ['const loadHub = useCallback', 'useFocusEffect(', 1],
    ['const savePublicSign = useCallback', 'const hidePublicSign = useCallback', 1],
    ['const hidePublicSign = useCallback', 'const openComposer = useCallback', 1],
    ['const loadComments = useCallback', 'const openThread = useCallback', 1],
    ['const togglePostLike = useCallback', 'const deletePost = useCallback', 1],
    ['const deletePost = useCallback', 'const deleteComment = useCallback', 1],
    ['const deleteComment = useCallback', 'const submitComment = useCallback', 1],
    ['const submitComment = useCallback', 'const beginComment = useCallback', 2],
    ['const moderateContent = useCallback', 'const finishPublishedPost = useCallback', 3],
    ['const publishPayload = useCallback', 'const beginPublish = useCallback', 1],
    ['const acceptAndPublish = useCallback', 'const closeGuidelines = useCallback', 2],
  ];

  for (const [startMarker, endMarker, minimum] of contracts) {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker, start);
    assert.ok(start >= 0 && end > start, `bloco ausente: ${startMarker}`);
    const block = source.slice(start, end);
    const routes = block.match(/handleCommunitySuspension\((?:error|reloadError)\)/g) || [];
    assert.ok(routes.length >= minimum, `${startMarker} tem ${routes.length}/${minimum} rotas de suspensão`);
  }
});

test('visitante vÃª proposta honesta e login; pessoa sem perfil recebe criaÃ§Ã£o real', () => {
  let logins = 0;
  let profileCreates = 0;
  let markup = render(React.createElement(CommunityHubState, baseHubProps({
    user: null,
    profile: undefined,
    onLogin: () => { logins += 1; },
  })));
  assert.match(markup, /data-testid="community-logged-out"/);
  assert.match(markup, /community\.discovery\.conversationsHint/);
  assert.doesNotMatch(markup, /mock-community-discovery/);
  presses.get('community-login')();
  assert.equal(logins, 1);

  markup = render(React.createElement(CommunityHubState, baseHubProps({
    profile: null,
    onCreateProfile: () => { profileCreates += 1; },
  })));
  assert.match(markup, /data-testid="community-profile-required"/);
  assert.match(markup, /social\.createProfile\.desc/);
  presses.get('community-create-profile')();
  assert.equal(profileCreates, 1);
});

test('perfil real alimenta descoberta e lista apenas publicaÃ§Ãµes reais recebidas', () => {
  let signOpens = 0;
  const posts = [{
    id: 17,
    display_name: 'CÃ©u Real',
    username: 'ceu_real',
    avatar_emoji: 'âœ¨',
    title: 'O que aprendi hoje',
    body: 'Uma conversa que veio do servidor.',
    created_at: '2026-08-24T12:00:00.000Z',
    like_count: 3,
    comment_count: 1,
  }];
  const suggestions = [{
    signA: { id: 'aries' },
    signB: { id: 'leo' },
    roomId: 'bridges',
  }];
  const markup = render(React.createElement(CommunityHubState, baseHubProps({
    posts,
    suggestions,
    onOpenSign: () => { signOpens += 1; },
  })));

  assert.match(markup, /data-testid="community-hub-authenticated"/);
  assert.match(markup, /data-testid="mock-community-discovery"/);
  assert.match(markup, /data-testid="community-post-17"/);
  assert.match(markup, /O que aprendi hoje/);
  assert.match(markup, />3</);
  assert.equal(discoveryProps.suggestions, suggestions);
  assert.equal(discoveryProps.empty, false);
  presses.get('community-open-sign-consent')();
  assert.equal(signOpens, 1);

  render(React.createElement(CommunityHubState, baseHubProps({
    posts: [],
    publicSign: null,
    suggestions,
  })));
  assert.deepEqual(discoveryProps.suggestions, []);
  assert.equal(discoveryProps.empty, true);
});

test('overlay do signo oferece 12 escolhas manuais, salvar e apagar consentimento', () => {
  const selected = [];
  let saves = 0;
  let hides = 0;
  const markup = render(React.createElement(SignConsentModal, {
    visible: true,
    t,
    selectedSignId: 'aries',
    hasPublicSign: true,
    busy: false,
    errorKey: null,
    onSelect: (id) => selected.push(id),
    onSave: () => { saves += 1; },
    onHide: () => { hides += 1; },
    onClose: () => {},
  }));

  assert.match(markup, /community\.signConsent\.privacy/);
  assert.match(markup, /data-testid="community-consent-sign-aries"[^>]*data-selected="true"/);
  assert.equal((markup.match(/data-testid="community-consent-sign-/g) || []).length, 12);
  presses.get('community-consent-sign-pisces')();
  presses.get('community-consent-save')();
  presses.get('community-consent-hide')();
  assert.deepEqual(selected, ['pisces']);
  assert.equal(saves, 1);
  assert.equal(hides, 1);
});

test('composer e portÃ£o das diretrizes expÃµem as aÃ§Ãµes explÃ­citas do fluxo', () => {
  let publishes = 0;
  let guidelineOpens = 0;
  let accepts = 0;
  let checks = 0;
  let markup = render(React.createElement(ConversationComposerModal, {
    visible: true,
    t,
    room: { id: 'bridges', titleKey: 'community.room.bridges.title' },
    targetSign: { id: 'leo', emoji: 'â™Œ', nameKey: 'community.sign.leo' },
    title: 'Uma ponte',
    body: 'Quero ouvir outra perspectiva.',
    busy: false,
    errorKey: null,
    onChangeTitle: () => {},
    onChangeBody: () => {},
    onPublish: () => { publishes += 1; },
    onClose: () => {},
  }));
  assert.match(markup, /community\.room\.bridges\.title/);
  assert.match(markup, /community\.sign\.leo/);
  presses.get('community-composer-publish')();
  assert.equal(publishes, 1);

  markup = render(React.createElement(GuidelinesConsentModal, {
    visible: true,
    t,
    checked: true,
    busy: false,
    errorKey: null,
    onToggle: () => { checks += 1; },
    onOpenGuidelines: () => { guidelineOpens += 1; },
    onAccept: () => { accepts += 1; },
    onClose: () => {},
  }));
  assert.match(markup, /data-testid="community-guidelines-check"[^>]*data-checked="true"/);
  assert.match(markup, /community\.guidelines\.accept\.body/);
  presses.get('community-guidelines-check')();
  presses.get('community-guidelines-open')();
  presses.get('community-guidelines-accept')();
  assert.equal(checks, 1);
  assert.equal(guidelineOpens, 1);
  assert.equal(accepts, 1);
});

test('integraÃ§Ã£o da tela nÃ£o lÃª dados natais, contexto de casal ou mensagens privadas', () => {
  const source = fs.readFileSync(SCREEN_PATH, 'utf8');

  assert.match(source, /\bCommunityDiscovery\b/);
  assert.match(source, /\bgetMySocialProfile\b/);
  assert.match(source, /\bgetCommunityRoomFeed\b/);
  assert.match(source, /\bupdateCommunityProfile\b/);
  assert.match(source, /\bacceptCommunityGuidelines\b/);
  assert.match(source, /\bcreateCommunityPost\b/);
  assert.match(source, /navigation\.navigate\(ROUTES\.COMMUNITY_GUIDELINES\)/);
  assert.match(source, /showZodiacSign:\s*false/);
  assert.match(source, /zodiacSign:\s*null/);
  assert.doesNotMatch(source, /\b(?:birthDate|birthTime|birthCity|coupleData|diaryData)\b/);
  assert.doesNotMatch(source, /\bTouchable(?:Opacity|Highlight)\b/);

  const acceptIndex = source.indexOf('await acceptCommunityGuidelines()');
  const createAfterAcceptIndex = source.indexOf('await createCommunityPost(pendingPost)', acceptIndex);
  assert.ok(acceptIndex >= 0 && createAfterAcceptIndex > acceptIndex);
});

test('estado local de curtidas, contagens e bloqueio acompanha o resultado real das APIs', () => {
  const original = { id: 7, user_id: 'other', liked_by_me: false, like_count: 2, comment_count: 4 };
  const liked = updatePostLikeState(original, true);
  assert.equal(liked.liked_by_me, true);
  assert.equal(liked.like_count, 3);
  assert.deepEqual(updatePostLikeState(liked, true), liked);
  assert.equal(updatePostLikeState({ ...liked, like_count: 0 }, false).like_count, 0);
  assert.equal(updatePostCommentCount(original, 9).comment_count, 9);
  assert.deepEqual(
    removeUserContent([original, { id: 8, user_id: 'keep' }], 'other'),
    [{ id: 8, user_id: 'keep' }]
  );
});

test('cartÃ£o abre a conversa e expÃµe curtir, apagar prÃ³prio ou moderar alheio', () => {
  const calls = [];
  const mine = {
    id: 31,
    user_id: 'user-1',
    display_name: 'Lua',
    username: 'lua',
    title: 'Uma pergunta',
    body: 'Quero conversar.',
    created_at: '2026-08-24T12:00:00.000Z',
    liked_by_me: false,
    like_count: 1,
    comment_count: 2,
  };
  let markup = render(React.createElement(FeedPost, {
    post: mine,
    t,
    myUserId: 'user-1',
    onOpen: (post) => calls.push(['open', post.id]),
    onToggleLike: (post) => calls.push(['like', post.id]),
    onDelete: (post) => calls.push(['delete', post.id]),
    onModerate: (...args) => calls.push(['moderate', ...args]),
  }));
  assert.match(markup, /data-testid="community-open-post-31"/);
  assert.match(markup, /data-testid="community-delete-post-31"/);
  presses.get('community-open-post-31')();
  presses.get('community-like-post-31')();
  presses.get('community-delete-post-31')();
  assert.deepEqual(calls, [['open', 31], ['like', 31], ['delete', 31]]);

  calls.length = 0;
  markup = render(React.createElement(FeedPost, {
    post: { ...mine, id: 32, user_id: 'other' },
    t,
    myUserId: 'user-1',
    onOpen: () => {},
    onToggleLike: () => {},
    onDelete: () => {},
    onModerate: (...args) => calls.push(args),
  }));
  assert.match(markup, /data-testid="community-moderate-post-32"/);
  presses.get('community-moderate-post-32')();
  assert.deepEqual(calls, [['post', 32, 'other']]);
});

test('conversa aberta permite responder, reagir e agir sobre comentÃ¡rios prÃ³prios ou alheios', () => {
  const calls = [];
  const post = {
    id: 44,
    user_id: 'other-post-author',
    display_name: 'CÃ©u',
    username: 'ceu',
    title: 'Conversa aberta',
    body: 'Texto completo sem corte.',
    created_at: '2026-08-24T12:00:00.000Z',
    liked_by_me: true,
    like_count: 5,
  };
  const markup = render(React.createElement(ConversationThreadModal, {
    visible: true,
    t,
    post,
    myUserId: 'user-1',
    comments: [
      { id: 1, user_id: 'user-1', display_name: 'Eu', username: 'eu', body: 'Minha fala' },
      { id: 2, user_id: 'other-commenter', display_name: 'Outra', username: 'outra', body: 'Outra fala' },
    ],
    commentsLoading: false,
    errorKey: null,
    noticeKey: null,
    text: 'Resposta real',
    busy: false,
    onChangeText: () => {},
    onSend: () => calls.push(['send']),
    onRetry: () => calls.push(['retry']),
    onClose: () => calls.push(['close']),
    onToggleLike: (item) => calls.push(['like', item.id]),
    onDeletePost: () => calls.push(['delete-post']),
    onDeleteComment: (item) => calls.push(['delete-comment', item.id]),
    onModerate: (...args) => calls.push(['moderate', ...args]),
  }));

  assert.match(markup, /data-testid="community-thread-modal"/);
  assert.match(markup, /Texto completo sem corte/);
  assert.match(markup, /data-testid="community-delete-comment-1"/);
  assert.match(markup, /data-testid="community-moderate-comment-2"/);
  presses.get('community-thread-like')();
  presses.get('community-comment-send')();
  presses.get('community-delete-comment-1')();
  presses.get('community-moderate-comment-2')();
  presses.get('community-thread-close')();
  assert.deepEqual(calls, [
    ['like', 44],
    ['send'],
    ['delete-comment', 1],
    ['moderate', 'comment', 2, 'other-commenter'],
    ['close'],
  ]);
});

test('comentÃ¡rio rejeitado pelas diretrizes preserva o texto e sÃ³ reenvia depois do aceite', () => {
  const source = fs.readFileSync(SCREEN_PATH, 'utf8');
  const rejectedIndex = source.indexOf("error?.code === 'community_guidelines_required'");
  const pendingIndex = source.indexOf('setPendingComment({ postId, body })', rejectedIndex);
  const acceptIndex = source.indexOf('await acceptCommunityGuidelines()', pendingIndex);
  const retryIndex = source.indexOf(
    'await addSocialComment(pendingComment.postId, pendingComment.body)',
    acceptIndex
  );
  const successIndex = source.indexOf("setThreadNoticeKey('community.success.guidelinesAccepted')", retryIndex);

  assert.ok(rejectedIndex >= 0);
  assert.ok(pendingIndex > rejectedIndex);
  assert.ok(acceptIndex > pendingIndex);
  assert.ok(retryIndex > acceptIndex);
  assert.ok(successIndex > retryIndex);
});
