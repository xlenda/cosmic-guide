// A MADRE MARIA ESTA MONTADA — e a porta dela e o card da Home.
//
// Este teste guarda a SOLDA ELETRICA da fusao (11/09/2026). Cada afirmacao
// abaixo pode quebrar EM SILENCIO: nome de rota errado nunca lanca (o router
// devolve null e a acao morre), lazy() no lugar errado nao da erro (so desmonta
// a tela a cada troca de aba), e um card apontando para rota inexistente e um
// toque que nao faz nada.
//
// Os quatro ELOS da corrente, na ordem em que a pessoa os percorre:
//   1. o card da Home chama ROUTES.MADRE_MARIA
//   2. ROUTES.MADRE_MARIA existe em routes.js
//   3. App.js registra essa rota como <Stack.Screen> DENTRO do HomeStack
//   4. o componente dela e lazy() no escopo de MODULO (o chunk)
// Um elo solto = card morto.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const ler = (p) => fs.readFileSync(path.join(RAIZ, p), 'utf8');

// Comentario nao e codigo: varios arquivos do repo CITAM chamadas antigas em
// prosa para documentar o proprio historico. Sem remover, o teste leria prosa.
function semComentarios(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

test('ROUTES.MADRE_MARIA existe e nao colide com nenhum outro nome de rota', () => {
  const routes = semComentarios(ler('routes.js'));
  const m = /MADRE_MARIA:\s*'([^']+)'/.exec(routes);
  assert.ok(m, 'routes.js nao declara MADRE_MARIA');

  const valores = [...routes.matchAll(/^\s*[A-Z_0-9]+:\s*'([^']+)'/gm)].map((a) => a[1]);
  const repetidos = valores.filter((v, i) => valores.indexOf(v) !== i);
  assert.deepEqual(repetidos, [], `nome(s) de rota repetido(s) no Cosmic: ${repetidos.join(', ')}`);
});

test('o card "tarotAmor" da Home abre a Madre Maria, com navigate() NU', () => {
  const home = semComentarios(ler('screens/HomeScreen.js'));
  const linha = home.split('\n').find((l) => l.includes("key: 'tarotAmor'"));
  assert.ok(linha, "o card 'tarotAmor' sumiu da Home");

  assert.match(
    linha,
    /onPress:\s*\(\)\s*=>\s*navigation\.navigate\(ROUTES\.MADRE_MARIA\)/,
    'o card precisa chamar navigate(ROUTES.MADRE_MARIA) — sem getParent(): a Madre e irma da Home na MESMA stack, e mandar a acao pro Tab pai so funciona por acidente',
  );

  // A key e o que amarra destaque, ordem e ilustracao. Trocar a key apaga as
  // tres sem erro nenhum — por isso ela e travada aqui junto.
  assert.match(home, /CARDS_DESTAQUE[\s\S]{0,400}'tarotAmor'/, "'tarotAmor' saiu de CARDS_DESTAQUE");
  assert.match(home, /ORDEM_TOPO\s*=\s*\[[^\]]*'tarotAmor'/, "'tarotAmor' saiu de ORDEM_TOPO");
  assert.match(semComentarios(ler('lib/ilustracoes.js')), /\btarotAmor:/, "'tarotAmor' perdeu a ilustracao");
});

test('App.js registra a Madre no HomeStack, e o componente e lazy de MODULO', () => {
  const app = semComentarios(ler('App.js'));

  // lazy() no escopo de MODULO: a linha nao pode estar indentada dentro de
  // funcao. lazy() dentro do corpo de HomeStack cria um componente NOVO a cada
  // render e desmonta a tela a cada troca de aba — a armadilha que o proprio
  // App.js documenta.
  assert.match(
    app,
    /^const MadreMariaScreen = lazy\(\(\) => import\('\.\/madremaria\/MadreMariaApp'\)\);$/m,
    'MadreMariaScreen precisa ser lazy() no escopo de MODULO (coluna 0)',
  );

  // Registrada DENTRO de HomeStack, nao em outra stack: e o que faz o
  // navigate() nu do card funcionar e o que poe COFFEE/PALM como irmas dela
  // (a solda do ritual do dia sobe um nivel e pousa nelas).
  const homeStack = app.slice(app.indexOf('function HomeStack('));
  const corpo = homeStack.slice(0, homeStack.indexOf('\n}'));
  assert.match(
    corpo,
    /<Stack\.Screen name=\{ROUTES\.MADRE_MARIA\} component=\{MadreMariaScreen\} \/>/,
    'a Madre precisa ser <Stack.Screen> DENTRO de HomeStack',
  );
  for (const irma of ['ROUTES.COFFEE', 'ROUTES.PALM']) {
    assert.ok(
      corpo.includes(`name={${irma}}`),
      `${irma} precisa continuar no MESMO HomeStack — a solda do ritual da Madre conta com isso`,
    );
  }
});

test('o titulo e o subtitulo do card existem nos tres idiomas e nao prometem resultado', () => {
  const i18n = ler('lib/i18n.js');
  const titulos = [...i18n.matchAll(/'home\.card\.tarotAmor\.title':\s*'([^']+)'/g)].map((a) => a[1]);
  const subs = [...i18n.matchAll(/'home\.card\.tarotAmor\.subtitle':\s*'([^']+)'/g)].map((a) => a[1]);
  assert.equal(titulos.length, 3, 'o titulo precisa existir em PT, ES e EN');
  assert.equal(subs.length, 3, 'o subtitulo precisa existir em PT, ES e EN');

  /* O TITULO ENTRA NA VARREDURA (11/09/2026, apontado pelo revisor adversarial).
   *
   * Este portao extraia `titulos` e varria so `subs` — ou seja, o guarda estava
   * parado exatamente ao lado da linha que podia violar. E violou: o titulo
   * "Traga seu amor de volta" (e "Trae a tu amor de vuelta" / "Bring your love
   * back") promete o que uma TERCEIRA PESSOA vai fazer, que e o que a doutrina
   * do proprio modulo proibe — madremaria/theme.js:80, "nunca um desfecho, nunca
   * uma promessa sobre o que a outra pessoa vai fazer". O dono trocou pelo
   * titulo atual em 11/09/2026 ao ver o apontamento: fala do comeco DELA.
   *
   * O subtitulo antigo ('Tres cartas · relacao') descrevia o Taro do Cosmic e
   * nao a Madre; o de hoje diz o que a pessoa vai encontrar la dentro. */
  /* A regex pega a PROMESSA, nao a palavra. "comeback"/"reconquista" nomeiam o
   * que a PESSOA faz e sao o assunto do produto; o que nao pode e garantir o
   * desfecho — "traga de volta", "vai voltar", "will come back". Dai o \b antes
   * de back e o de volta/de vuelta como locucao, e nao 'back' solto: uma regex
   * que proibisse a palavra reprovaria o proprio titulo honesto e empurraria
   * quem vier depois a afrouxar o portao inteiro para passar. */
  const PROMESSA = /\bvoltar[aá]?\b|\bde volta\b|\bvolver[aá]\b|\bde vuelta\b|\b(?:come|bring|win|get)s?\b[^.]{0,12}\bback\b|garant|assegur|\d+\s*%/i;
  for (const texto of [...titulos, ...subs]) {
    assert.ok(!PROMESSA.test(texto), `o card promete resultado: "${texto}"`);
  }
});

test('a Madre defere o paywall ao Cosmic — um interruptor so', () => {
  const folha = semComentarios(ler('lib/paywallGlobal.js'));
  assert.match(folha, /export const TUDO_LIBERADO = (true|false);/, 'lib/paywallGlobal.js precisa declarar TUDO_LIBERADO');

  // Nenhum dos dois pode voltar a declarar o proprio valor: dois interruptores
  // para a mesma pergunta e exatamente o que o dono recusou.
  const cosmic = semComentarios(ler('context/CoupleContext.js'));
  assert.match(cosmic, /import \{ TUDO_LIBERADO \} from '\.\.\/lib\/paywallGlobal'/, 'CoupleContext precisa LER a folha');
  assert.ok(!/^const TUDO_LIBERADO\s*=/m.test(cosmic), 'CoupleContext voltou a declarar o proprio TUDO_LIBERADO');

  const madre = semComentarios(ler('madremaria/lib/suscripcion.js'));
  assert.match(madre, /import \{ TUDO_LIBERADO \} from '\.\.\/\.\.\/lib\/paywallGlobal\.js'/, 'suscripcion precisa LER a folha');
  assert.match(madre, /export const ACCESO_LIBRE = TUDO_LIBERADO;/, 'ACCESO_LIBRE precisa vir da folha, nao de um true fixo');

  // A FORMA do retorno nao pode mudar: as 6 telas da Madre esperam
  // Promise<boolean> de estaSuscrito(). Trocar por {ok,motivo} renderizaria
  // tela vazia SEM erro.
  assert.match(madre, /if \(ACCESO_LIBRE\) return true;/, 'estaSuscrito precisa continuar devolvendo boolean');
});

test('a folha do paywall e FOLHA mesmo — sem React, sem react-native', () => {
  // Se ela importar o contexto ou react-native, a lib da Madre passa a arrastar
  // a arvore de providers do Cosmic para dentro do `node --test`.
  const folha = ler('lib/paywallGlobal.js');
  assert.ok(!/\bimport\b|\brequire\(/.test(folha), 'lib/paywallGlobal.js nao pode importar nada');
});
