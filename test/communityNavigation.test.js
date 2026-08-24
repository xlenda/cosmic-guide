// Contrato estrutural da quarta aba. Este teste analisa a AST de App.js em vez
// de procurar um texto solto: a rota precisa ser filha direta do Tab.Navigator,
// apontar para a stack certa e permanecer sem `tabBarButton: null`.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');

const { ROUTES } = require('../routes.js');

const APP_SOURCE = fs.readFileSync(path.join(__dirname, '..', 'App.js'), 'utf8');
const HOME_SOURCE = fs.readFileSync(path.join(__dirname, '..', 'screens', 'HomeScreen.js'), 'utf8');
const TAROT_SOURCE = fs.readFileSync(path.join(__dirname, '..', 'screens', 'TarotScreen.js'), 'utf8');
const DIARY_SOURCE = fs.readFileSync(path.join(__dirname, '..', 'screens', 'DiaryScreen.js'), 'utf8');
const APP_AST = parser.parse(APP_SOURCE, {
  sourceType: 'module',
  plugins: ['jsx'],
});

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visit);
    } else if (value && typeof value === 'object' && typeof value.type === 'string') {
      walk(value, visit);
    }
  }
}

function findAll(root, predicate) {
  const found = [];
  walk(root, (node) => {
    if (predicate(node)) found.push(node);
  });
  return found;
}

function findFunction(name) {
  const matches = findAll(
    APP_AST,
    (node) => node.type === 'FunctionDeclaration' && node.id?.name === name
  );
  assert.equal(matches.length, 1, `esperava uma função ${name}, achei ${matches.length}`);
  return matches[0];
}

function jsxName(name) {
  if (!name) return null;
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXMemberExpression') return `${jsxName(name.object)}.${jsxName(name.property)}`;
  return null;
}

function jsxAttribute(opening, name) {
  return opening.attributes.find(
    (attr) => attr.type === 'JSXAttribute' && attr.name?.name === name
  );
}

function expressionFromAttribute(attr) {
  return attr?.value?.type === 'JSXExpressionContainer' ? attr.value.expression : null;
}

function isRoutesMember(node, property) {
  return Boolean(
    node &&
      node.type === 'MemberExpression' &&
      !node.computed &&
      node.object?.type === 'Identifier' &&
      node.object.name === 'ROUTES' &&
      node.property?.type === 'Identifier' &&
      node.property.name === property
  );
}

function routeFromScreen(screen) {
  const expression = expressionFromAttribute(jsxAttribute(screen.openingElement, 'name'));
  assert.ok(
    expression && isRoutesMember(expression, expression.property?.name),
    'Tab.Screen sem name centralizado em ROUTES'
  );
  return expression.property.name;
}

function objectProperty(object, name) {
  if (!object || object.type !== 'ObjectExpression') return null;
  return object.properties.find(
    (property) =>
      property.type === 'ObjectProperty' &&
      !property.computed &&
      ((property.key.type === 'Identifier' && property.key.name === name) ||
        (property.key.type === 'StringLiteral' && property.key.value === name))
  );
}

function computedRouteProperty(object, routeName) {
  if (!object || object.type !== 'ObjectExpression') return null;
  return object.properties.find(
    (property) =>
      property.type === 'ObjectProperty' &&
      property.computed &&
      isRoutesMember(property.key, routeName)
  );
}

test('a rota da Comunidade é um identificador próprio e não colide com as outras abas', () => {
  assert.equal(ROUTES.COMMUNITY_TAB, 'Comunidade');
  const tabs = [
    ROUTES.HOME_TAB,
    ROUTES.TAROT_TAB,
    ROUTES.COMMUNITY_TAB,
    ROUTES.CHAT_TAB,
    ROUTES.PROFILE_TAB,
  ];
  assert.equal(new Set(tabs).size, tabs.length, 'duas abas compartilham o mesmo nome interno');
});

test('CommunityStack nasce no hub e preserva conversa, regras e destinos internos', () => {
  const communityStack = findFunction('CommunityStack');
  const homeStackUses = findAll(
    communityStack,
    (node) => node.type === 'JSXElement' && jsxName(node.openingElement.name) === 'HomeStack'
  );
  assert.equal(homeStackUses.length, 0, 'CommunityStack não deve carregar todo o grafo da Home');

  const stackScreens = findAll(
    communityStack,
    (node) => node.type === 'JSXElement' && jsxName(node.openingElement.name) === 'Stack.Screen'
  );
  const routeNames = stackScreens.map(routeFromScreen);
  assert.equal(routeNames[0], 'COMMUNITY_MAIN', 'o hub precisa ser a raiz da aba');
  const routes = new Set(routeNames);
  for (const required of ['COMMUNITY_MAIN', 'SOCIAL', 'COMMUNITY_GUIDELINES', 'DIARY', 'LOGIN']) {
    assert.ok(routes.has(required), `CommunityStack perderia o destino interno ${required}`);
  }

  const hub = stackScreens.find((screen) => routeFromScreen(screen) === 'COMMUNITY_MAIN');
  const hubComponent = expressionFromAttribute(jsxAttribute(hub.openingElement, 'component'));
  assert.equal(hubComponent?.type, 'Identifier');
  assert.equal(hubComponent?.name, 'CommunityHubScreen');

  const social = stackScreens.find((screen) => routeFromScreen(screen) === 'SOCIAL');
  const component = expressionFromAttribute(jsxAttribute(social.openingElement, 'component'));
  assert.equal(component?.type, 'Identifier');
  assert.equal(component?.name, 'SocialScreen', 'o feed Seguindo deixou de reutilizar a tela social existente');
});

test('Comunidade é a quarta aba visível e incondicional do navegador principal', () => {
  const tabNavigators = findAll(
    APP_AST,
    (node) => node.type === 'JSXElement' && jsxName(node.openingElement.name) === 'Tab.Navigator'
  );
  assert.equal(tabNavigators.length, 1, 'o contrato espera um único Tab.Navigator principal');

  // Somente filhos JSX diretos contam. Se a aba entrar dentro de `condicao &&`
  // ou de um ternário de modo/autenticação, ela deixa de aparecer nesta lista.
  const screens = tabNavigators[0].children
    .filter((child) => child.type === 'JSXElement')
    .filter((child) => jsxName(child.openingElement.name) === 'Tab.Screen');
  const routeNames = screens.map(routeFromScreen);
  assert.deepEqual(routeNames, [
    'HOME_TAB',
    'TAROT_TAB',
    'COMMUNITY_TAB',
    'CHAT_TAB',
    'PROFILE_TAB',
  ]);

  const community = screens.find((screen) => routeFromScreen(screen) === 'COMMUNITY_TAB');
  const component = expressionFromAttribute(jsxAttribute(community.openingElement, 'component'));
  assert.equal(component?.type, 'Identifier');
  assert.equal(component?.name, 'CommunityStack');

  const options = expressionFromAttribute(jsxAttribute(community.openingElement, 'options'));
  assert.equal(options?.type, 'ObjectExpression');
  assert.equal(objectProperty(options, 'tabBarButton'), undefined, 'a aba Comunidade foi escondida');

  const label = objectProperty(options, 'tabBarLabel')?.value;
  assert.equal(label?.type, 'CallExpression');
  assert.equal(label?.callee?.type, 'Identifier');
  assert.equal(label?.callee?.name, 't');
  assert.equal(label?.arguments?.[0]?.value, 'tab.community');

  const chat = screens.find((screen) => routeFromScreen(screen) === 'CHAT_TAB');
  const chatOptions = expressionFromAttribute(jsxAttribute(chat.openingElement, 'options'));
  assert.ok(objectProperty(chatOptions, 'tabBarButton'), 'o Chat contextual voltou a ficar visível');
});

test('a aba Comunidade tem URLs estáveis para hub, Seguindo e diretrizes', () => {
  const linking = findAll(
    APP_AST,
    (node) => node.type === 'VariableDeclarator' && node.id?.name === 'linking'
  );
  assert.equal(linking.length, 1);

  const config = objectProperty(linking[0].init, 'config')?.value;
  const screens = objectProperty(config, 'screens')?.value;
  const community = computedRouteProperty(screens, 'COMMUNITY_TAB')?.value;
  assert.equal(objectProperty(community, 'path')?.value?.value, 'comunidade');

  const nestedScreens = objectProperty(community, 'screens')?.value;
  assert.equal(computedRouteProperty(nestedScreens, 'COMMUNITY_MAIN')?.value?.value, '');
  assert.equal(computedRouteProperty(nestedScreens, 'SOCIAL')?.value?.value, 'seguindo');
  assert.equal(computedRouteProperty(nestedScreens, 'COMMUNITY_GUIDELINES')?.value?.value, 'diretrizes');
});

test('a Comunidade recebe um ícone próprio nos estados ativo e inativo', () => {
  const gate = findFunction('Gate');
  const matchingIfs = findAll(
    gate,
    (node) =>
      node.type === 'IfStatement' &&
      findAll(node.test, (part) => isRoutesMember(part, 'COMMUNITY_TAB')).length === 1
  );
  assert.equal(matchingIfs.length, 1);
  const iconNames = findAll(
    matchingIfs[0].consequent,
    (node) => node.type === 'StringLiteral' && ['people', 'people-outline'].includes(node.value)
  ).map((node) => node.value);
  assert.deepEqual(iconNames.sort(), ['people', 'people-outline'].sort());
});

test('os atalhos de Home, Tarô e Diário convergem para a aba Comunidade', () => {
  assert.match(
    HOME_SOURCE,
    /key: 'social'[\s\S]*?ROUTES\.COMMUNITY_TAB,[\s\S]*?\{ screen: ROUTES\.COMMUNITY_MAIN \}/,
    'o card da Home voltou a abrir o feed legado dentro da pilha da Home'
  );
  assert.match(
    TAROT_SOURCE,
    /navigateFromTab\(ROUTES\.COMMUNITY_TAB, \{ screen: ROUTES\.SOCIAL \}\)/,
    'o Tarô não troca para a aba Comunidade depois de compartilhar'
  );
  assert.match(
    DIARY_SOURCE,
    /ROUTES\.COMMUNITY_TAB,[\s\S]*?\{ screen: ROUTES\.SOCIAL \}/,
    'o Diário não troca para a aba Comunidade depois de compartilhar'
  );
  assert.match(HOME_SOURCE, /const SOLO_ONLY = \[\]/, 'a Comunidade sumiu no modo casal');
});

test('o feed Seguindo existe apenas dentro da pilha da Comunidade', () => {
  const homeStack = findFunction('HomeStack');
  const homeRoutes = findAll(
    homeStack,
    (node) => node.type === 'JSXElement' && jsxName(node.openingElement.name) === 'Stack.Screen'
  ).map(routeFromScreen);
  assert.ok(!homeRoutes.includes('SOCIAL'), 'HomeStack ainda carrega o feed social legado');

  const communityStack = findFunction('CommunityStack');
  const communityRoutes = findAll(
    communityStack,
    (node) => node.type === 'JSXElement' && jsxName(node.openingElement.name) === 'Stack.Screen'
  ).map(routeFromScreen);
  assert.ok(communityRoutes.includes('SOCIAL'));
});
