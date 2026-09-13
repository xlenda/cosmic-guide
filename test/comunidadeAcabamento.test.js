// A COMUNIDADE PARAVA DE PARECER O MESMO APP (12/09/2026).
//
// O dono navegou da Home pra cá e a troca foi violenta. Este teste guarda as
// QUATRO causas que ele apontou, cada uma com a prova de que a correção
// continua no lugar. Segue o padrão do repo: lê o TEXTO do arquivo (não há
// react-test-renderer aqui) e afirma sobre a decisão de estilo, não sobre pixel.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const ler = (p) => fs.readFileSync(path.join(raiz, p), 'utf8');

const hub = ler('screens/CommunityHubScreen.js');
const discovery = ler('components/community/CommunityDiscovery.js');
const social = ler('screens/SocialScreen.js');
const i18n = ler('lib/i18n.js');

// =====================================================================
// 1. A SERIFA É ACENTO, NÃO SEGUNDA TIPOGRAFIA
// =====================================================================
// A serifa FICA — é identidade deliberada da Comunidade. O defeito era a
// DOSE: seis estilos vestidos de Georgia num app que é todo sem serifa. Um
// título de serifa é um acento; a moldura inteira em serifa é outro app.
// Regra: no MÁXIMO um uso por arquivo, e só no título do herói de cada estado
// (guestTitle no deslogado, title no logado).

test('a serifa da Comunidade veste UM título por estado, nunca a moldura', () => {
  const usosNoHub = hub.match(/fontFamily: DISPLAY_FONT/g) || [];
  assert.equal(
    usosNoHub.length,
    1,
    'CommunityHubScreen: a serifa é o acento de UM título (guestTitle). Espalhar '
      + 'pro feed/modal/conversa é o que fez a aba parecer outro app.',
  );
  // e é o título do herói, não um subtítulo qualquer que passou a herdá-la
  assert.match(
    hub,
    /guestTitle: \{[^}]*fontFamily: DISPLAY_FONT/,
    'o único uso da serifa no hub tem de ser o guestTitle (o herói do deslogado)',
  );

  const usosNoDiscovery = discovery.match(/fontFamily: DISPLAY_FONT/g) || [];
  assert.equal(
    usosNoDiscovery.length,
    1,
    'CommunityDiscovery: mesma regra — só o title do herói logado.',
  );
  assert.match(
    discovery,
    /\n {2}title: \{[^}]*fontFamily: DISPLAY_FONT/,
    'o único uso da serifa no Discovery tem de ser o `title` (o herói do logado)',
  );
});

// =====================================================================
// 2. O TÍTULO DE QUATRO LINHAS
// =====================================================================
// `display` (32/40) num cartão de ~310px úteis quebrava a frase em QUATRO
// linhas: parede, não título. O degrau certo é `titulo` (24/30) — o texto
// continua inteiro (é informação, não enfeite) e cabe em três linhas.

test('o título do herói deslogado usa `titulo`, não `display` — 4 linhas é parede', () => {
  const bloco = hub.match(/\n {2}guestTitle: \{[\s\S]*?\n {2}\},/);
  assert.ok(bloco, 'guestTitle sumiu do CommunityHubScreen');
  assert.match(bloco[0], /\.\.\.type\.titulo,/, 'guestTitle tem de vir do degrau `titulo`');
  assert.doesNotMatch(
    bloco[0],
    /\.\.\.type\.display,/,
    'voltar pra `display` devolve as quatro linhas que o dono chamou de parede',
  );
  // O degrau manda no tamanho: nada de fontSize/lineHeight solto depois do
  // spread, senão a escala deixa de governar a tela.
  assert.doesNotMatch(bloco[0], /fontSize:|lineHeight:/, 'o tamanho vem do degrau, não de px solto');
});

// =====================================================================
// 3. A SETA DUPLICADA
// =====================================================================
// Doutrina da casa (ver o comentário de onboarding.*.cta em lib/i18n.js):
// quem desenha a seta é o Ionicons ao lado — "→" no texto MAIS o ícone sai
// "Fazer login →  →". A chave é compartilhada por DUAS telas, então a
// correção mora na chave (raiz) e não no consumidor que reclamou.

test('social.loginCta não carrega "→": quem desenha a seta é o ícone', () => {
  const linhas = i18n.match(/'social\.loginCta': '[^']*'/g) || [];
  assert.equal(linhas.length, 3, 'a chave existe nos três idiomas (pt/es/en)');
  for (const linha of linhas) {
    assert.doesNotMatch(
      linha,
      /→/,
      `${linha} — o texto do botão não desenha seta; o Ionicons ao lado desenha.`,
    );
  }
});

test('os dois consumidores de social.loginCta desenham a seta com ícone', () => {
  // Sem isto, tirar o "→" do texto roubaria a affordance do botão em vez de
  // consertar o defeito.
  for (const [nome, fonte] of [['CommunityHubScreen', hub], ['SocialScreen', social]]) {
    const botao = fonte.match(
      /<Text[^>]*>\{t\('social\.loginCta'\)\}<\/Text>\s*\n\s*<Ionicons name="arrow-forward"/,
    );
    assert.ok(botao, `${nome}: o botão de login perdeu o Ionicons arrow-forward ao lado do rótulo`);
  }
});

// =====================================================================
// 4. O CARTÃO AMPUTADO
// =====================================================================
// justifyContent:'center' num ScrollView cujo filho é MAIOR que a janela
// empurra o excedente pros dois lados — e o de cima não volta com scroll
// nenhum. O cartão (overflow:'hidden') aparecia sem a borda de baixo, sem o
// padding e sem nada depois do botão. Lei da casa: bloco que sai da primeira
// dobra DESCE (e rola), não some.

test('o estado deslogado começa no topo e ROLA — centrar amputa o cartão', () => {
  const bloco = hub.match(/\n {2}guestContent: \{[\s\S]*?\n {2}\},/);
  assert.ok(bloco, 'guestContent sumiu do CommunityHubScreen');
  assert.doesNotMatch(
    bloco[0],
    /justifyContent: 'center'/,
    'centrar um filho maior que a janela corta a borda de baixo do cartão e o topo '
      + 'fica inalcançável por scroll',
  );
  assert.match(bloco[0], /justifyContent: 'flex-start'/);
  assert.match(bloco[0], /flexGrow: 1/, 'flexGrow:1 continua: é ele que dá chão à tela curta');
});
