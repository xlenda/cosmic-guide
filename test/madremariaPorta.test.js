// A PORTA DA MADRE MARIA — a decisao de rota de abertura.
//
// rotaDeAbertura() e a unica regra de negocio de madremaria/MadreMariaApp.js, e
// e a que decide o caminho (a) e (b) do desenho fechado: quem toca o card
// "Traga seu amor de volta" cai na apresentacao dela (sem perfil) ou no
// tabuleiro de 365 casas (com perfil ja salvo).
//
// O que ela protege: 'tem string gravada' NAO e 'tem perfil'. JSON pela metade,
// onboarding abandonado no meio e envelope vazio abririam as abas e a pessoa
// cairia numa tela de sequencia sem nunca ter feito uma leitura.

const test = require('node:test');
const assert = require('node:assert');

const { rotaDeAbertura, hayPerfil } = require('../madremaria/lib/porta.js');
const RUTAS = require('../madremaria/routes.js').default;
// NOMBRE_ABAS nao pode ser importado de navegacion.js aqui: aquele arquivo
// monta o Tab.Navigator e arrasta react-native inteiro para dentro de node puro.
// O valor e o mesmo RUTAS.TIRADA que navegacion.js:107 exporta como NOMBRE_ABAS —
// e o teste abaixo prova que os dois continuam sendo a MESMA string, lendo o
// texto-fonte. Se alguem trocar a fonte daquele alias, este teste fica vermelho.
const NOMBRE_ABAS = RUTAS.TIRADA;
const { PREGUNTAS, esValida } = require('../madremaria/datos/preguntas.js');

// Um perfil COMPLETO de verdade — montado a partir das perguntas REAIS, e
// conferido com o validador real (esValida) antes de qualquer assercao. Nao e
// um objeto chutado a mao: se uma pergunta nova entrar em datos/preguntas.js,
// ele cresce junto e o teste continua medindo a coisa certa. O assert dentro do
// helper existe para o teste FALHAR na montagem se o formato mudar, em vez de
// falhar depois com "false !== true" e mandar o proximo agente investigar a
// funcao errada.
function perfilCompleto() {
  const respuestas = {};
  for (const p of PREGUNTAS) {
    if (p.tipo === 'opcion') respuestas[p.id] = p.opciones[0].id;
    else if (p.tipo === 'fecha') respuestas[p.id] = '1990-05-10';
    else respuestas[p.id] = 'Ana';
    assert.ok(
      esValida(p.id, respuestas[p.id]),
      `o helper montou resposta invalida para "${p.id}" (tipo ${p.tipo})`
    );
  }
  return JSON.stringify({ respuestas });
}

test('sem perfil salvo, a porta abre na APRESENTACAO da Madre Maria', () => {
  assert.strictEqual(rotaDeAbertura(null, false, NOMBRE_ABAS), RUTAS.APRESENTACAO);
  assert.strictEqual(rotaDeAbertura('', false, NOMBRE_ABAS), RUTAS.APRESENTACAO);
  // O marcador da leitura sozinho NUNCA basta para pular o onboarding: um disco
  // meio apagado abriria a Madre numa pessoa sem respostas.
  assert.strictEqual(rotaDeAbertura(null, true, NOMBRE_ABAS), RUTAS.APRESENTACAO);
});

test('perfil podre nao e perfil — string nao-JSON e JSON incompleto caem na APRESENTACAO', () => {
  assert.strictEqual(rotaDeAbertura('{nao e json', true, NOMBRE_ABAS), RUTAS.APRESENTACAO);
  assert.strictEqual(rotaDeAbertura('{}', true, NOMBRE_ABAS), RUTAS.APRESENTACAO);
  assert.strictEqual(rotaDeAbertura('{"respuestas":{}}', true, NOMBRE_ABAS), RUTAS.APRESENTACAO);
  assert.strictEqual(rotaDeAbertura('null', true, NOMBRE_ABAS), RUTAS.APRESENTACAO);
});

test('COM perfil salvo e leitura de entrada feita, a porta abre no TABULEIRO (as abas)', () => {
  assert.strictEqual(rotaDeAbertura(perfilCompleto(), true, NOMBRE_ABAS), NOMBRE_ABAS);
});

test('com perfil mas SEM a leitura de entrada, a porta abre nas tres cartas', () => {
  assert.strictEqual(rotaDeAbertura(perfilCompleto(), false, NOMBRE_ABAS), RUTAS.LEITURA_ENTRADA);
});

test('hayPerfil aceita os dois formatos que PerfilScreen ja le (cru e envelopado)', () => {
  const envelopado = perfilCompleto();
  const cru = JSON.stringify(JSON.parse(envelopado).respuestas);
  assert.strictEqual(hayPerfil(envelopado), true);
  assert.strictEqual(hayPerfil(cru), true);
});

// A rota-host das abas nao pode colidir com nome nenhum do Cosmic, e o valor
// que a porta devolve tem de ser um nome REGISTRADO neste Stack — replace para
// nome ausente morre em silencio no StackRouter (devolve null, sem log).
test('os tres destinos da porta sao nomes distintos e nenhum colide com o Cosmic', () => {
  const destinos = [RUTAS.APRESENTACAO, RUTAS.LEITURA_ENTRADA, NOMBRE_ABAS];
  assert.strictEqual(new Set(destinos).size, 3);
  const { ROUTES } = require('../routes.js');
  const doCosmic = new Set(Object.values(ROUTES));
  for (const d of destinos) {
    assert.ok(!doCosmic.has(d), `"${d}" colide com uma rota do Cosmic Guide`);
  }
});

// Garante que a constante local deste arquivo nao ficou para tras: se alguem
// apontar o alias de verdade para outra rota, a porta passaria a medir um
// destino que o Stack nao registra — e replace para nome ausente morre em
// silencio no StackRouter, sem erro em lugar nenhum.
//
// 11/09/2026: este portao passou a IMPORTAR o valor em vez de ler o texto-fonte.
// NOMBRE_ABAS saiu de navegacion.js (que monta o Tab.Navigator e por isso nao
// carrega sob `node --test`) para madremaria/navegacion-enlaces.js, que so
// importa strings — entao da para comparar o valor REAL, e nao a grafia de uma
// linha. Ler texto so provava que a linha existia com aquela forma exata; ela
// mudou de arquivo e o portao acusou uma quebra que nao existia, que e
// exatamente o falso positivo que um teste de texto produz.
test('NOMBRE_ABAS continua sendo RUTAS.TIRADA', () => {
  const { NOMBRE_ABAS: aliasReal } = require('../madremaria/navegacion-enlaces');
  assert.equal(aliasReal, RUTAS.TIRADA);
  assert.equal(aliasReal, NOMBRE_ABAS, 'a constante local deste teste divergiu do alias real');

  // navegacion.js continua re-exportando as duas: todo import antigo vale.
  const fs = require('node:fs');
  const path = require('node:path');
  const fonte = fs.readFileSync(
    path.join(__dirname, '..', 'madremaria', 'navegacion.js'),
    'utf8'
  );
  assert.match(fonte, /export \{ ENLACES_ABAS, NOMBRE_ABAS \} from '\.\/navegacion-enlaces'/);
});

/* ===================================================================================
   NENHUM NOME DE ROTA SE REPETE ENTRE OS DOIS APPS.

   Isto e o guarda-corpo do caminho (f) do desenho fechado: components/
   DailyMissionsCard.js:251 do Cosmic faz `navigation.navigate(ROUTES.PROFILE_TAB,
   { screen: ROUTES.LOJA })` — um navigate NU, sem getParent(). Em
   @react-navigation/core, useOnAction.js:79-92, a acao sobe ao pai e, se nenhum
   pai tratar, DESCE para os navegadores filhos ja montados. Com as abas da Madre
   montadas, um nome repetido faria a acao pousar na tela errada EM SILENCIO —
   nao ha erro, nao ha aviso, a pessoa so vai parar noutro lugar.

   Hoje o caminho e seguro por construcao: a rota da Madre chama-se 'MadrePerfil'
   e a do Cosmic 'Perfil'. Este teste existe para que continue assim — e para que
   quem adicionar uma rota nova dos DOIS lados descubra a colisao aqui, e nao num
   relato de usuaria dizendo que o app "abre a tela errada".
   =================================================================================== */
test('nenhum dos 19 nomes de rota da Madre colide com os 55 do Cosmic Guide', () => {
  const { ROUTES } = require('../routes.js');
  const doCosmic = Object.values(ROUTES);
  const daMadre = Object.values(RUTAS);
  const colisoes = daMadre.filter((v) => doCosmic.includes(v));
  assert.deepStrictEqual(
    colisoes,
    [],
    `nome(s) de rota repetido(s) nos dois apps: ${colisoes.join(', ')} — ` +
      'navigate() nu desce para os filhos montados e pousa na tela errada sem erro nenhum'
  );
});

/* CAFE E PALMA SAO UM SO NO APP (decisao do dono, 11/09/2026). As telas da Madre
   nao vieram e os nomes de rota delas foram apagados de madremaria/routes.js. Um
   nome ressuscitado aqui seria um toque morto que nao acusa erro nenhum: rota
   declarada sem tela registrada so imprime um aviso em __DEV__. */
test('a Madre nao declara rota propria de cafe nem de palma', () => {
  const nomes = Object.keys(RUTAS);
  assert.ok(!nomes.includes('RITUAL_CAFE'), 'RITUAL_CAFE voltou a madremaria/routes.js');
  assert.ok(!nomes.includes('RITUAL_MAO'), 'RITUAL_MAO voltou a madremaria/routes.js');
});

/* ===================================================================================
   TODO DESTINO QUE UMA TELA PEDE EXISTE NO NAVEGADOR.

   Este e o teste que o cabecalho de madremaria/routes.js pede em prosa: "rota
   declarada e tela solta no disco sao um toque morto que nao acusa erro nenhum".
   navigation.navigate() para rota nao registrada NAO lanca — so imprime um aviso
   em __DEV__. Em producao o dedo bate, a tela nao muda, e ninguem ve erro.

   A varredura remove COMENTARIOS antes de procurar: cinco arquivos da Madre
   documentam o proprio historico citando chamadas de navegacao que mudaram, e
   sem isso o teste nasceria vermelho por prosa.
   =================================================================================== */
test('toda navegacao da Madre aponta para uma rota registrada (Stack ou aba)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const raiz = path.join(__dirname, '..');
  const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

  const fonteApp = fs.readFileSync(path.join(raiz, 'madremaria', 'MadreMariaApp.js'), 'utf8');
  const registradas = new Set(
    [...semComentarios(fonteApp).matchAll(/<Stack\.Screen\s+name=\{(RUTAS\.[A-Z_]+|NOMBRE_ABAS)\}/g)]
      .map((m) => (m[1] === 'NOMBRE_ABAS' ? NOMBRE_ABAS : RUTAS[m[1].slice(6)]))
  );
  const fonteNav = fs.readFileSync(path.join(raiz, 'madremaria', 'navegacion.js'), 'utf8');
  for (const m of semComentarios(fonteNav).matchAll(/<Tab\.Screen\s+name=\{(RUTAS\.[A-Z_]+)\}/g)) {
    registradas.add(RUTAS[m[1].slice(6)]);
  }

  // Sanidade: se a extracao acima parar de casar (alguem troca a forma da JSX),
  // o conjunto fica vazio e o teste passaria verde sem varrer nada.
  assert.ok(registradas.size >= 18, `so ${registradas.size} rotas extraidas — a varredura quebrou`);

  const mortos = [];
  for (const pasta of ['screens', 'components', 'lib']) {
    const dir = path.join(raiz, 'madremaria', pasta);
    for (const arquivo of fs.readdirSync(dir)) {
      if (!arquivo.endsWith('.js')) continue;
      const src = semComentarios(fs.readFileSync(path.join(dir, arquivo), 'utf8'));
      for (const m of src.matchAll(/(?:navigate|replace|push)\(\s*RUTAS\.([A-Z_]+)/g)) {
        if (!registradas.has(RUTAS[m[1]])) {
          mortos.push(`${pasta}/${arquivo} -> RUTAS.${m[1]} ("${RUTAS[m[1]]}")`);
        }
      }
    }
  }
  assert.deepStrictEqual(
    mortos,
    [],
    `toque morto: navegacao para rota nao registrada (nao lanca, so avisa em __DEV__)\n  ${mortos.join('\n  ')}`
  );
});
