// O PORTAO DA GAMIFICACAO — album, missoes, fichas e conquistas.
//
// E um teste de MUTACAO, no molde de test/almacen.test.js: o storage e injetado
// e programado para estourar, e cada bloco existe porque a regra que ele trava
// e daquele tipo que continua "funcionando" depois de quebrada. Um teste que
// so exercita o caminho feliz passa com as oito regras furadas — e as oito sao
// exatamente as que a gamificacao de app de tarot costuma furar:
//
//   ALBUM      1. encontro repetido nao conta duas vezes
//              2. nao existe caminho de desbloqueio que nao seja uma tiragem
//   MISSOES    3. o sorteio e deterministico pela data (zero Math.random)
//              4. nenhuma missao empurra a usuaria para a outra pessoa
//   FICHAS     5. gasto maior que o saldo nao fica negativo e nao entrega
//              6. cobranca que nao foi gravada nao entrega (transacional)
//   CONQUISTAS 7. o modulo nao grava nada — zero escritas, zero chave
//              8. "voltar depois de faltar" so acende com falta E retorno, e
//                 nunca vira conquista de punicao
//
// E o item 9, que nao estava na lista e que este arquivo passou a travar
// porque a regra ja custou caro aqui: toda chave nova de storage tem de estar
// em CLAVES_HILO_ROJO, senao ela sobrevive ao "Apagar tudo" e a politica de
// privacidade vira declaracao falsa numa ficha de loja.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import * as album from '../madremaria/lib/album.js';
import {
  _inyectarAlmacenParaTests,
  _reiniciarParaTests,
} from '../madremaria/lib/almacen.js';
import { CONQUISTAS, calcularConquistas } from '../madremaria/lib/conquistas.js';
import {
  FALLA_SEM_SALDO,
  FICHAS_ACTIVAS,
  GASTO_LEITURA_EXTRA,
  PRECO_LEITURA_EXTRA,
  abonar,
  gastar,
  gastarFichas,
  leerSaldo,
} from '../madremaria/lib/fichas.js';
import { hablaDelFuturo, sugiereContacto } from '../madremaria/lib/lectura.js';
import { CATALOGO, missoesDeHoje } from '../madremaria/lib/missoes.js';
import { MAZO } from '../madremaria/lib/mazo.js';
import { existe, t } from '../madremaria/datos/textos.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

/* FUSAO COSMIC GUIDE: a raiz do app da Madre deixou de ser a raiz do repo —
 * ela agora mora em madremaria/. Tudo que este arquivo le por RAIZ (lib/,
 * datos/, screens/) esta la dentro. */
const RAIZ = join(__dirname, '..', 'madremaria');

// CLAVES_HILO_ROJO e lida do FONTE, nao importada: screens/AjustesScreen.js e
// JSX, e `node --test` roda ESM de verdade — o import morre no primeiro '<'.
// Mesma tecnica de test/ritual.test.js.
//
// A ENTRADA ESCRITA COMO CONSTANTE. Duas das linhas da lista nao sao string, sao
// identificador: `CLAVE_RECORDATORIO` e `CLAVE_AJUSTES`. A versao anterior desta
// funcao devolvia o identificador CRU — a lista saia daqui com a string
// "CLAVE_RECORDATORIO" dentro dela — e o comentario que estava aqui afirmava o
// contrario ("o teste enxerga tambem a chave escrita como constante"). Enxergava
// o NOME, nunca o valor: para todo portao que usa esta funcao, a chave de disco
// 'recordatorio' simplesmente nao estava na lista. Agora o identificador e
// RESOLVIDO contra o `export const CLAVE_X = '...'` do mesmo arquivo, e um nome
// que nao resolve derruba o teste em vez de virar uma chave fantasma que nunca
// bate com nada.
function clavesDeBorrarTodo() {
  const fonte = readFileSync(join(RAIZ, 'screens', 'AjustesScreen.js'), 'utf8');
  const bloque = fonte.match(/CLAVES_HILO_ROJO\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
  assert.ok(bloque, 'CLAVES_HILO_ROJO sumiu de screens/AjustesScreen.js');

  // As constantes de chave: nome -> valor.
  //
  // A busca comeca no proprio arquivo e SEGUE OS IMPORTS LOCAIS dele. O motivo e
  // concreto: 'ajustes' morava aqui e mudou para lib/ajustes.js no dia em que a
  // leitura profunda passou a precisar do campo `haptica` (um componente nao
  // pode importar uma tela inteira por um booleano). CLAVES_HILO_ROJO continua
  // listando `CLAVE_AJUSTES`, mas a declaracao saiu do arquivo — e um resolvedor
  // que so olhasse aqui reprovaria uma mudanca CORRETA, empurrando quem viesse
  // depois a duplicar a string 'ajustes' nos dois lugares. Duas fontes para a
  // mesma chave e exatamente como uma delas fica para tras.
  //
  // Um nivel de profundidade basta: a chave mora no modulo que a exporta, nunca
  // atras de uma cadeia de reexportacoes.
  const constantes = new Map();
  const registrar = (texto) => {
    for (const m of texto.matchAll(/const\s+(CLAVE\w*)\s*=\s*['"]([^'"]+)['"]/g)) {
      if (!constantes.has(m[1])) constantes.set(m[1], m[2]);
    }
  };

  registrar(fonte);
  for (const m of fonte.matchAll(/from\s+'(\.\.?\/[^']+)'/g)) {
    const destino = join(RAIZ, 'screens', m[1]).replace(/\.js$/, '');
    if (existsSync(`${destino}.js`)) registrar(readFileSync(`${destino}.js`, 'utf8'));
  }

  return bloque[1]
    .split(',')
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((item) => {
      const literal = item.match(/^['"`]([^'"`]+)['"`]$/);
      if (literal) return literal[1];
      assert.ok(
        constantes.has(item),
        `CLAVES_HILO_ROJO tem a entrada '${item}', que nao e uma string nem uma `
          + 'constante declarada em screens/AjustesScreen.js. Uma entrada que o teste '
          + 'nao consegue resolver e uma chave que ele nao consegue vigiar.'
      );
      return constantes.get(item);
    });
}

/* =================================================================================
 * FERRAMENTAS
 * ================================================================================= */

// O mesmo storage falso de test/almacen.test.js, com um terceiro botao: aqui
// interessa tambem PROVAR QUE NINGUEM TOCOU no disco (item 7), e para isso ele
// registra toda chave que passa por getItem, setItem e removeItem separadamente.
function almacenFalso({ fallaLectura = false, fallaEscritura = false } = {}) {
  const disco = new Map();
  const leituras = [];
  const escritas = [];
  return {
    disco,
    leituras,
    escritas,
    async getItem(k) {
      leituras.push(k);
      if (fallaLectura) throw new Error('SecurityError simulado');
      return disco.has(k) ? disco.get(k) : null;
    },
    async setItem(k, v) {
      escritas.push(k);
      if (fallaEscritura) throw new Error('QuotaExceededError simulado');
      disco.set(k, v);
    },
    async removeItem(k) {
      escritas.push(k);
      if (fallaEscritura) throw new Error('QuotaExceededError simulado');
      disco.delete(k);
    },
  };
}

// Le o fonte SEM as linhas de comentario. E indispensavel: os proprios modulos
// escrevem "nenhum caminho deste modulo chama Math.random" no cabecalho, e uma
// varredura ingenua acusaria a documentacao da regra em vez da violacao dela.
// Mesma tecnica de test/copy.test.js.
function fonteSemComentarios(relativo) {
  return readFileSync(join(RAIZ, relativo), 'utf8')
    .split('\n')
    .filter((linha) => {
      const l = linha.trim();
      return !l.startsWith('//') && !l.startsWith('*') && !l.startsWith('/*');
    })
    .join('\n');
}

const CARTA_A = MAZO[0].id;
const CARTA_B = MAZO[40].id;
const DIA = '2026-03-14';

/* =================================================================================
 * 1 · ALBUM — o mesmo encontro nao conta duas vezes
 *
 * MUTACAO: apague a checagem de `yaRegistrado` em lib/album.js (ou pare de
 * gravar o id da ocorrencia na janela) e este teste falha com veces === 2.
 *
 * Nao e cenario de laboratorio: toque duplo no botao, a tela da sintese
 * remontando e a pessoa voltando e reabrindo a leitura sao os tres caminhos
 * normais do app, e os tres chamam este registro com os MESMOS argumentos.
 * ================================================================================= */
test('ALBUM: o mesmo encontro registrado duas vezes conta UMA', async () => {
  _inyectarAlmacenParaTests(almacenFalso());

  const args = { cartaId: CARTA_A, ocurrenciaId: 'tirada-abc#0', invertida: false, dia: DIA };

  const primero = await album.registrarEncuentro(args);
  const segundo = await album.registrarEncuentro(args);

  assert.equal(primero.nuevo, true, 'a primeira vez tem de entrar');
  assert.equal(primero.veces, 1);
  assert.equal(segundo.duplicado, true, 'a segunda tem de ser reconhecida como repetida');
  assert.equal(segundo.nuevo, false);
  assert.equal(segundo.veces, 1, 'toque duplo nao pode virar dois encontros');

  const estado = await album.leerAlbum();
  assert.equal(estado.cartas[CARTA_A].veces, 1, 'o disco tambem so pode ter um');
  assert.equal(album.resumenAlbum(estado).encontradas, 1);
});

test('ALBUM: uma tirada remontada nao vira seis cartas', async () => {
  _inyectarAlmacenParaTests(almacenFalso());

  const tirada = [
    { carta: MAZO[1], invertida: false },
    { carta: MAZO[2], invertida: true },
    { carta: MAZO[3], invertida: false },
  ];

  await album.registrarTirada(tirada, 'tirada-xyz', DIA);
  await album.registrarTirada(tirada, 'tirada-xyz', DIA); // a tela remontou

  const resumen = album.resumenAlbum(await album.leerAlbum());
  assert.equal(resumen.encontradas, 3, 'a mesma tirada duas vezes sao tres cartas, nao seis');
});

// O outro lado da idempotencia, e ele NAO pode ser esquecido junto: se o app
// morreu entre gravar o evento e gravar o indice, a carta ficaria oculta para
// sempre num album que a pessoa jura ter visto. O ramo de reparo conserta o
// indice SEM consumir um encontro novo.
test('ALBUM: evento conhecido com a carta faltando no indice repara, e nao conta de novo', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  // Disco de um app que caiu no meio: o evento ficou, a carta nao.
  falso.disco.set('mm-hr.album', JSON.stringify({ cartas: {}, eventos: ['tirada-rota#1'] }));

  const r = await album.registrarEncuentro({
    cartaId: CARTA_B,
    ocurrenciaId: 'tirada-rota#1',
    dia: DIA,
  });

  assert.equal(r.reparado, true);
  assert.equal(r.veces, 1, 'o reparo repoe UM encontro, nunca dois');
  assert.equal(album.resumenAlbum(await album.leerAlbum()).encontradas, 1);
});

/* =================================================================================
 * 2 · ALBUM — carta nunca sorteada nao aparece como encontrada
 *
 * Duas travas, e a segunda e a que importa a longo prazo. A primeira mede o
 * comportamento de hoje. A segunda trava a SUPERFICIE do modulo: album inflado
 * mata a graca de colecionar, e a forma como isso acontece nunca e alguem
 * decidindo "vou mentir" — e alguem acrescentando um `desbloquearTodo` para
 * testar uma tela, ou um `marcarGrupo` para o onboarding "comecar bonito".
 * Congelar a lista de exports faz esse commit ficar vermelho.
 * ================================================================================= */
test('ALBUM: carta que nunca foi sorteada NAO aparece como encontrada', async () => {
  _inyectarAlmacenParaTests(almacenFalso());

  await album.registrarEncuentro({ cartaId: CARTA_A, ocurrenciaId: 'so-esta', dia: DIA });

  const estado = await album.leerAlbum();
  assert.equal(album.estaEncontrada(estado, CARTA_A), true);

  const outras = MAZO.map((c) => c.id).filter((id) => id !== CARTA_A);
  const vazadas = outras.filter((id) => album.estaEncontrada(estado, id));
  assert.deepEqual(vazadas, [], 'nenhuma outra das 78 pode ter entrado sozinha');

  assert.equal(album.resumenAlbum(estado).encontradas, 1);
  assert.deepEqual(await album.cartasEncontradas(), [CARTA_A]);
  assert.equal(await album.fueEncontrada(CARTA_B), false);
});

test('ALBUM: a superficie do modulo nao tem porta de desbloqueio', () => {
  // Se voce esta aqui porque acrescentou uma funcao: a pergunta nao e "posso
  // por na lista?", e "essa funcao marca carta que nao veio numa leitura?". Se
  // marcar, ela nao entra no modulo — nem atras de flag, nem "so em dev".
  const esperado = [
    'GRUPOS',
    'TECHO_EVENTOS',
    'TOTAL_CARTAS',
    'cartasEncontradas',
    'default',
    'estaEncontrada',
    'fueEncontrada',
    'leerAlbum',
    'registrarEncuentro',
    'registrarTirada',
    'resumenAlbum',
  ];
  assert.deepEqual(Object.keys(album).sort(), esperado);

  // E, no fonte, nenhum verbo de desbloqueio em massa.
  const fonte = fonteSemComentarios('lib/album.js');
  for (const proibido of [
    /\bdesbloquear/i,
    /\bdesbloquea/i,
    /\bmarcarTodas?\b/i,
    /\brevelarTodo/i,
    /\bcompletarAlbum/i,
  ]) {
    assert.equal(proibido.test(fonte), false, `porta de desbloqueio no fonte: ${proibido}`);
  }
});

// A carta so entra pela tiragem, e a tiragem tem de ser de uma carta que existe.
test('ALBUM: id que nao e do baralho nao entra, nem por engano', async () => {
  _inyectarAlmacenParaTests(almacenFalso());

  const r = await album.registrarEncuentro({ cartaId: 'major-99', ocurrenciaId: 'x', dia: DIA });
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'carta');
  assert.equal(album.resumenAlbum(await album.leerAlbum()).encontradas, 0);
});

/* =================================================================================
 * 3 · MISSOES — o sorteio e deterministico pela data
 *
 * MUTACAO: troque o hash por Math.random em lib/missoes.js e este teste falha.
 *
 * Nao e preciosismo: com sorteio instavel, cada render da tela troca as tres
 * missoes. A pessoa completa uma e ela some da lista — o app parece estar
 * tirando dela o que ela acabou de fazer.
 * ================================================================================= */
test('MISSOES: a mesma data devolve sempre as mesmas tres', () => {
  const ids = (dia) => missoesDeHoje(dia).map((m) => m.id);

  const primeira = ids('2026-04-01');
  assert.equal(primeira.length, 3);

  for (let i = 0; i < 20; i += 1) {
    assert.deepEqual(ids('2026-04-01'), primeira, 'o sorteio mudou entre duas chamadas');
  }
});

test('MISSOES: datas diferentes nao devolvem sempre o mesmo conjunto', () => {
  const ids = (dia) => missoesDeHoje(dia).map((m) => m.id).join('|');

  const dias = [];
  for (let d = 1; d <= 28; d += 1) {
    dias.push(`2026-05-${String(d).padStart(2, '0')}`);
  }
  const conjuntos = new Set(dias.map(ids));

  assert.ok(
    conjuntos.size > 1,
    `o sorteio devolveu o mesmo trio em 28 dias seguidos (${conjuntos.size} conjunto). `
      + 'Isso e um hash que ignora a data, nao um sorteio.'
  );
});

test('MISSOES: zero Math.random no fonte do modulo', () => {
  const fonte = fonteSemComentarios('lib/missoes.js');
  assert.equal(
    /Math\s*\.\s*random/.test(fonte),
    false,
    'Math.random em lib/missoes.js: as tres de hoje trocariam a cada render.'
  );
  // Date.now/new Date tambem nao pode entrar no SORTEIO — a data ja chega por
  // parametro. O modulo tem um hojeLocal() legitimo para o fallback, entao o
  // que se trava aqui e o sorteio nao depender de HORA: nada de getHours.
  assert.equal(/get(Hours|Minutes|Seconds|Time)\s*\(/.test(fonte), false);
});

/* =================================================================================
 * 4 · MISSOES — nenhuma empurra a usuaria para a outra pessoa
 *
 * A copy da missao passa pela MESMA peneira da copy da leitura. Nao ha razao
 * para a leitura ser protegida de "escreva pra essa pessoa" e a missao do dia
 * poder dizer a mesma coisa duas telas depois — e a missao e pior, porque ela
 * se apresenta como tarefa a cumprir.
 *
 * A varredura roda sobre o TEXTO RESOLVIDO em datos/textos.js, nao sobre a
 * chave: a chave nunca vai para a tela, e varrer a chave seria um portao verde
 * vigiando o lado errado do dicionario.
 * ================================================================================= */
test('MISSOES: toda chave de texto do catalogo existe em textos.js', () => {
  const mortas = [];
  for (const m of CATALOGO) {
    for (const clave of [m.claveTitulo, m.clavePista]) {
      if (!existe(clave)) mortas.push(`${m.id}: ${clave}`);
    }
  }
  assert.deepEqual(mortas, [], `Chave morta vira texto cru na tela:\n  ${mortas.join('\n  ')}`);
});

test('MISSOES: nenhuma missao do catalogo pede contato com a outra pessoa', () => {
  const achados = [];
  for (const m of CATALOGO) {
    for (const clave of [m.claveTitulo, m.clavePista]) {
      const texto = t(clave);
      if (sugiereContacto(texto)) achados.push(`${m.id} · ${clave}: "${texto}"`);
    }
  }
  assert.deepEqual(
    achados,
    [],
    'Missao empurrando para fora. A missao nomeia o que a pessoa ja faz DENTRO do '
      + `app; ela nunca manda procurar, escrever ou esperar resposta:\n  ${achados.join('\n  ')}`
  );
});

test('MISSOES: nenhuma missao promete ou fala do futuro', () => {
  const achados = [];
  for (const m of CATALOGO) {
    for (const clave of [m.claveTitulo, m.clavePista]) {
      const texto = t(clave);
      if (hablaDelFuturo(texto)) achados.push(`${m.id} · ${clave}: "${texto}"`);
    }
  }
  assert.deepEqual(achados, [], `Missao falando do futuro:\n  ${achados.join('\n  ')}`);
});

// A missao inativa continua no catalogo (com o custo de ligar escrito nela),
// mas nao pode ser sorteada nem chegar a tela — nem como "em breve".
test('MISSOES: missao inativa nunca e sorteada', () => {
  const inativas = CATALOGO.filter((m) => !m.activa).map((m) => m.id);
  if (inativas.length === 0) return;

  const vistas = new Set();
  for (let d = 1; d <= 28; d += 1) {
    for (const m of missoesDeHoje(`2026-06-${String(d).padStart(2, '0')}`)) vistas.add(m.id);
  }
  const vazadas = inativas.filter((id) => vistas.has(id));
  assert.deepEqual(vazadas, [], 'missao desligada apareceu no sorteio');
});

/* =================================================================================
 * 4-bis · MISSOES — TODA MISSAO ATIVA TEM UMA TELA QUE A MARCA
 *
 * O teste que faltava, e a falta dele custou o app inteiro por um dia.
 *
 * Em 31/08 o catalogo tinha OITO missoes ativas e UMA tela chamando
 * `completarMissao`. O campo `prova` de cada entrada nomeava, em prosa correta e
 * confiante, uma tela que nao marcava nada. Como o sorteio pega uma missao por
 * grupo, em dois dias de cada tres NENHUMA das tres do dia podia fechar: a tela
 * do fio mostrava "0 de 3" para sempre, com tres tarefas em cima. Nao havia erro,
 * nao havia excecao, nao havia teste vermelho — havia um numero que mente.
 *
 * E exatamente o bug que o missions.js do Cosmic Guide registrou (duas missoes
 * impossiveis porque verificavam acao que nenhuma tela gravava), reproduzido
 * inteiro num modulo cujo cabecalho jurava evita-lo. A licao nao e "escrever
 * melhor o comentario": e que COMENTARIO NAO RODA. Por isso `archivoProva` existe
 * como campo, e por isso este teste abre o arquivo.
 *
 * MUTACAO: apague a chamada de `completarMissao` de qualquer tela, ou ligue uma
 * missao nova sem fiar a tela dela, e este teste fica vermelho.
 * ================================================================================= */
test('MISSOES: toda missao ATIVA e marcada por uma tela de verdade', () => {
  const quebradas = [];

  for (const m of CATALOGO.filter((x) => x.activa)) {
    if (typeof m.archivoProva !== 'string' || !m.archivoProva) {
      quebradas.push(`${m.id}: ativa sem archivoProva. Qual tela chama completarMissao?`);
      continue;
    }

    let fonte;
    try {
      fonte = readFileSync(join(RAIZ, m.archivoProva), 'utf8');
    } catch {
      quebradas.push(`${m.id}: archivoProva aponta para '${m.archivoProva}', que nao existe`);
      continue;
    }

    // As duas metades sao necessarias e nenhuma basta sozinha: o arquivo pode
    // importar completarMissao e nunca citar este id (foi so a fiacao de outra
    // missao), e pode citar o id num comentario sem chamar nada.
    if (!/\bcompletarMissao\s*\(/.test(fonte)) {
      quebradas.push(`${m.id}: ${m.archivoProva} nao chama completarMissao()`);
      continue;
    }
    if (!fonte.includes(`'${m.id}'`)) {
      quebradas.push(`${m.id}: ${m.archivoProva} nao cita o id '${m.id}'`);
    }
  }

  assert.deepEqual(
    quebradas,
    [],
    'Missao ativa que NENHUMA tela consegue fechar. Ela e sorteada, aparece nas tres '
      + 'de hoje e fica pendente para sempre — e o contador "{n} de {total}" ao lado '
      + `vira um numero que mente:\n  ${quebradas.join('\n  ')}`
  );
});

// O outro lado: missao desligada nao pode fingir que tem tela. Se ela ganhar um
// `archivoProva`, alguem esta a um `activa: true` de distancia de ligar uma
// missao sem ter lido por que ela foi desligada.
test('MISSOES: missao inativa nao declara archivoProva', () => {
  const erradas = CATALOGO.filter((m) => !m.activa && m.archivoProva).map((m) => m.id);
  assert.deepEqual(erradas, [], 'missao desligada com arquivo de prova declarado');
});

/* =================================================================================
 * 4-ter · ALBUM — ALGUMA TELA PRECISA ENCHER O ALBUM
 *
 * O modulo do album estava impecavel e completamente desligado: nenhuma tela
 * chamava `registrarTirada` nem `registrarEncuentro`. As consequencias eram todas
 * numeros na cara da usuaria, e nenhuma aparecia como bug:
 *
 *   · 'album.conteo' ("{n} de 78") ficava em 0 para sempre, com o denominador
 *     certo e o numerador morto;
 *   · SEIS das doze conquistas (a primeira invertida, dez cartas, um grupo, a
 *     carta que volta, meio baralho, o baralho inteiro) eram estruturalmente
 *     inalcancaveis — a faixa da AlbumScreen mostrava "a proxima" apontando para
 *     uma marca que nenhuma leitura podia acender;
 *   · e a tira de miniaturas da HiloScreen nunca teria uma carta.
 *
 * MUTACAO: tire `registrarTirada` do fecho da TiradaScreen e este teste falha.
 * ================================================================================= */
/* O QUE ESTE PORTAO PASSOU A GUARDAR (fusao Cosmic Guide, 11/09/2026), e por que
 * a regra antiga precisou mudar em vez de ser afrouxada:
 *
 * A regra antiga — "alguma tela tem de chamar registrarTirada" — ja era
 * DECORACAO no proprio Fio Vermelho, e o teste nao tinha como saber. A unica
 * chamadora era a TiradaScreen, e o dono tirou a Tirada das abas em 01/09
 * ("nao tem mais cartas dentro do aplicativo"): desde esse dia a tela existia no
 * disco mas nao estava registrada em navegador nenhum. Como este portao le o
 * codigo-fonte e nao a arvore de navegacao, ele continuava VERDE la (33/33 hoje)
 * vigiando uma porta que ja estava lacrada. Na fusao a tela morta nao veio, e so
 * entao o portao acusou — um alarme atrasado em dez dias.
 *
 * Entao a pergunta certa deixou de ser "alguem enche o album?" (ninguem enche, de
 * proposito) e passou a ser a que ainda pode machucar a usuaria: se o album NAO e
 * alimentado, ele NAO pode aparecer na tela dizendo "0 de 78" nem exibir
 * conquistas de baralho que nenhuma leitura consegue acender. Motor desligado e
 * decisao; painel aceso marcando zero para sempre e mentira.
 *
 * MUTACAO: registre AlbumScreen no Stack de MadreMariaApp.js, ou faca a
 * HiloScreen renderizar a tira de miniaturas do album, e este teste falha. */
test('ALBUM: motor desligado nao aparece na tela mentindo "0 de 78"', () => {
  const telas = readdirSync(join(RAIZ, 'screens')).filter((f) => f.endsWith('.js'));

  const registram = telas.filter((f) => {
    const fonte = readFileSync(join(RAIZ, 'screens', f), 'utf8');
    return /\b(registrarTirada|registrarEncuentro)\s*\(/.test(fonte);
  });

  if (registram.length > 0) return; // o album voltou a ser alimentado: nada a vigiar aqui

  // Ninguem enche o album. Entao ninguem pode MOSTRA-LO.
  const navegador = readFileSync(join(RAIZ, 'MadreMariaApp.js'), 'utf8');
  assert.ok(
    !/AlbumScreen/.test(navegador),
    'o album nao e alimentado por tela nenhuma, mas AlbumScreen esta registrada no '
      + 'navegador: a pessoa abre e le "0 de 78" para sempre, com seis conquistas '
      + 'impossiveis. Ou volte a chamar registrarTirada em alguma tela, ou nao '
      + 'ofereca a porta.'
  );

  /* LER o album desligado e legitimo — a HiloScreen le e mostra o convite
   * 'hilo.panel.albumVazio' ("O album comeca na sua primeira leitura"), que e a
   * resposta honesta para um cofre vazio. O que NAO pode e desenhar o numero:
   * 'album.conteo' e o "{n} de 78", e com o motor desligado esse n e zero para
   * sempre — o mesmo zero que o cabecalho da HiloScreen ja condena no contador
   * de nos, "um numero que anuncia o buraco no maior tipo da tela".
   * Portanto o portao vigia a CONTAGEM, nao a leitura. */
  const mostramContagem = telas.filter((f) => {
    const fonte = readFileSync(join(RAIZ, 'screens', f), 'utf8');
    return /album\.conteo|album\.contador/.test(fonte);
  });
  assert.deepEqual(
    mostramContagem,
    [],
    'o album nao e alimentado, mas estas telas desenham a contagem "{n} de 78" — '
      + `com o motor desligado o n e zero para sempre: ${mostramContagem.join(', ')}. `
      + 'Album vazio mostra o convite (hilo.panel.albumVazio), nunca o numero.'
  );
});

/* =================================================================================
 * 4-quater · CONQUISTAS — nenhuma das doze depende de um motor desligado
 *
 * A conquista sai de um retrato que a tela monta; se o motor que alimenta um
 * campo do retrato nunca for chamado, aquele campo fica em zero para sempre e a
 * conquista vira decoracao. Este teste amarra as duas pontas que a AlbumScreen
 * cruza: as conquistas do grupo `baralho` so valem alguma coisa se o album for
 * escrito por alguem.
 * ================================================================================= */
test('CONQUISTAS: as do baralho dependem de um album que alguma tela enche', () => {
  const doBaralho = CONQUISTAS.filter((c) => c.grupo === 'baralho').map((c) => c.id);
  assert.ok(doBaralho.length > 0, 'sumiram as conquistas de baralho');

  // Com o album cheio elas acendem — prova de que o criterio e alcancavel e nao
  // depende de um campo que ninguem calcula.
  const cheio = calcularConquistas({
    album: {
      encontradas: MAZO.length,
      total: MAZO.length,
      gruposCerrados: 5,
      invertidas: 3,
      repeticionMaxima: 3,
    },
  });
  const apagadas = doBaralho.filter((id) => !cheio.find((c) => c.id === id).lograda);
  assert.deepEqual(
    apagadas,
    [],
    `Conquista de baralho que nem com as ${MAZO.length} cartas encontradas acende: `
      + `o criterio le um campo que ninguem preenche:\n  ${apagadas.join('\n  ')}`
  );
});

/* =================================================================================
 * 5 · FICHAS — gasto maior que o saldo
 *
 * MUTACAO: troque `if (saldo < monto) return` por uma subtracao direta e este
 * teste falha em dois lugares ao mesmo tempo — o saldo fica negativo e o
 * beneficio sai de graca.
 * ================================================================================= */
test('FICHAS: gasto maior que o saldo nao fica negativo e NAO entrega', async () => {
  _inyectarAlmacenParaTests(almacenFalso());
  await abonar(2);

  let entregas = 0;
  const r = await gastar(5, async () => {
    entregas += 1;
    return 'beneficio';
  });

  assert.equal(entregas, 0, 'a entrega nem pode ter sido tentada');
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'saldo');
  assert.equal(r.entregado, false);
  assert.equal(r.saldo, 2, 'o saldo tem de ficar exatamente como estava');

  const saldo = await leerSaldo();
  assert.equal(saldo, 2);
  assert.ok(saldo >= 0, 'nao existe saldo negativo em caminho nenhum');
});

test('FICHAS: gasto exato zera sem passar do zero, e entrega', async () => {
  _inyectarAlmacenParaTests(almacenFalso());
  await abonar(3);

  const r = await gastar(3, async () => 'leitura extra');
  assert.equal(r.ok, true);
  assert.equal(r.entregado, true);
  assert.equal(await leerSaldo(), 0);

  // E do zero nao se tira mais nada.
  const depois = await gastar(1, async () => 'de novo');
  assert.equal(depois.motivo, 'saldo');
  assert.equal(await leerSaldo(), 0);
});

// A camada de cima (`gastarFichas`) e a que as telas chamam, e hoje ela delega
// para o primitivo. Este teste existe para o dia em que alguem "simplificar"
// fazendo a conta ali mesmo: a guarda de saldo passaria a ter duas
// implementacoes, e a segunda nasceria sem nenhuma das defesas desta secao.
test('FICHAS: a camada de cima tambem nao deixa o saldo negativo', async () => {
  _inyectarAlmacenParaTests(almacenFalso());
  await abonar(3);

  const r = await gastarFichas(PRECO_LEITURA_EXTRA, GASTO_LEITURA_EXTRA);

  assert.equal(r.ok, false);
  assert.equal(r.falla, FALLA_SEM_SALDO);
  assert.equal(r.gasto, 0);
  assert.equal(r.saldo, 3);
  assert.ok((await leerSaldo()) >= 0);
});

/* =================================================================================
 * 6 · FICHAS — cobranca que nao foi gravada nao entrega
 *
 * O caso real: quota estourada, storage particionado, aparelho sem espaco. Se o
 * beneficio sair mesmo assim, no proximo boot o saldo volta cheio e a pessoa
 * levou de graca; se o estorno faltar, ela paga e nao recebe. As duas metades
 * sao testadas aqui.
 *
 * MUTACAO A: mova a entrega para ANTES da checagem de `persistido` — o teste
 *            falha em `entregas === 0`.
 * MUTACAO B: apague o estorno do ramo de disco — o teste falha no saldo, que
 *            fica em 6 depois de uma compra que nunca aconteceu.
 * ================================================================================= */
test('FICHAS: com o disco estourando na escrita, o beneficio NAO e concedido', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  await abonar(10); // disco saudavel
  assert.equal(await leerSaldo(), 10);

  falso.setItem = async () => {
    throw new Error('QuotaExceededError simulado');
  };

  let entregas = 0;
  const r = await gastar(4, async () => {
    entregas += 1;
    return 'leitura extra';
  });

  assert.equal(entregas, 0, 'cobranca que nao ficou registrada nao pode virar entrega');
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'disco');
  assert.equal(r.entregado, false);
  assert.equal(await leerSaldo(), 10, 'o debito tem de ter sido desfeito');
});

test('FICHAS: entrega que falha estorna a ficha', async () => {
  _inyectarAlmacenParaTests(almacenFalso());
  await abonar(6);

  const r = await gastar(4, async () => null); // a entrega desistiu
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'entrega');
  assert.equal(r.entregado, false);
  assert.equal(await leerSaldo(), 6, 'ficha cobrada sem entrega tem de voltar');

  // E o mesmo vale para a entrega que LANCA, que e o caso mais comum de todos.
  const explodiu = await gastar(4, async () => {
    throw new Error('a tela quebrou no meio');
  });
  assert.equal(explodiu.entregado, false);
  assert.equal(await leerSaldo(), 6);
});

/* =================================================================================
 * 6-bis · FICHAS — A FLAG SO PODE SER LIGADA COM O EFEITO IMPLEMENTADO
 *
 * "Recompensa que nao existe nao entra no catalogo" — a regra herdada do
 * brindes.js do Cosmic Guide. Ela vale tambem para a recompensa que EXISTE no
 * catalogo e nao tem EFEITO, que e o caso de hoje:
 *
 *   · 'hilo.panel.fichasPara' promete "abrem mais uma leitura no mesmo dia";
 *   · `gastarFichas` delega a `gastar(quanto, () => true)` — uma entrega que
 *     devolve true sem abrir coisa alguma;
 *   · lib/limiteDiario.js nao tem, e nunca teve, funcao que reabra o dia:
 *     `puedeLeerHoy` e `registrarLectura` sao tudo.
 *
 * Somadas: a cobranca tiraria 12 fichas e entregaria nada. Hoje ninguem chega la
 * porque FICHAS_ACTIVAS e false — e e essa flag, e so ela, que separa o app de
 * cobrar por uma coisa que nao entrega, que e a unica desonestidade que este
 * produto ainda podia cometer.
 *
 * Este teste faz a flag valer alguma coisa. Enquanto ela for false, ele exige
 * que nada no app credite, gaste ou mostre ficha. Quando alguem a ligar, ele
 * passa a exigir o efeito de verdade.
 *
 * MUTACAO: troque FICHAS_ACTIVAS para true sem implementar a reabertura do dia e
 * este teste fica vermelho.
 * ================================================================================= */
test('FICHAS: com a flag desligada, nenhuma tela credita, gasta ou mostra saldo', () => {
  if (FICHAS_ACTIVAS) return; // o outro teste cuida do caso ligado

  const telas = readdirSync(join(RAIZ, 'screens')).filter((f) => f.endsWith('.js'));
  const vazamentos = [];

  for (const f of telas) {
    const fonte = fonteSemComentarios(join('screens', f));
    // Ler o saldo atras da propria flag e permitido (a HiloScreen faz isso); o
    // que nao pode e mover ficha ou desenhar numero sem a guarda.
    for (const proibido of [/\bganharFichas\s*\(/, /\bgastarFichas\s*\(/, /\babonar\s*\(/]) {
      if (proibido.test(fonte)) vazamentos.push(`screens/${f}: ${proibido}`);
    }
    if (/\bleerFichas\s*\(/.test(fonte) && !/FICHAS_ACTIVAS/.test(fonte)) {
      vazamentos.push(`screens/${f}: le o saldo sem checar FICHAS_ACTIVAS`);
    }
  }

  assert.deepEqual(
    vazamentos,
    [],
    'Com FICHAS_ACTIVAS false nenhuma ficha pode se mexer. A moeda so existe para '
      + 'gastar num beneficio, e o beneficio ainda nao esta implementado:\n  '
      + vazamentos.join('\n  ')
  );
});

test('FICHAS: ligar a flag exige que a leitura extra exista de verdade', () => {
  if (!FICHAS_ACTIVAS) return; // desligada: o teste de cima e o que vale

  // O efeito prometido por 'hilo.panel.fichasPara' e "mais uma leitura hoje".
  // Quem entrega isso teria de ser lib/limiteDiario.js, reabrindo o dia — e
  // alguma tela teria de cobrar antes de abrir.
  const limite = fonteSemComentarios('lib/limiteDiario.js');
  assert.ok(
    /export\s+(async\s+)?function\s+\w*(reabrir|liberar|devolver)/i.test(limite),
    'FICHAS_ACTIVAS foi ligada, mas lib/limiteDiario.js continua sem funcao que '
      + 'reabra o dia. A ficha seria cobrada e nada seria entregue — exatamente o '
      + 'que a regra "recompensa que nao existe nao entra no catalogo" proibe.'
  );

  const telas = readdirSync(join(RAIZ, 'screens')).filter((f) => f.endsWith('.js'));
  const cobra = telas.some((f) =>
    /\bgastarFichas\s*\(/.test(fonteSemComentarios(join('screens', f)))
  );
  assert.ok(
    cobra,
    'FICHAS_ACTIVAS foi ligada e nenhuma tela chama gastarFichas: o saldo aparece, '
      + 'sobe, e nao compra nada. Saldo que nao se gasta e placar — e placar e o '
      + 'numero decorativo que este app inteiro se recusa a mostrar.'
  );
});

/* =================================================================================
 * 7 · CONQUISTAS — o modulo nao grava nada
 *
 * MUTACAO: faca lib/conquistas.js importar guardarSeguro e persistir qualquer
 * coisa (um carimbo de "ja mostrei esta") e este teste falha.
 *
 * O valor da regra e estrutural: sem estado proprio nao existe conquista
 * perdida, nao existe migracao, nao existe chave nova para lembrar de
 * acrescentar em CLAVES_HILO_ROJO, e nao existe como a conquista divergir do
 * numero que a outra tela mostra.
 * ================================================================================= */
test('CONQUISTAS: com storage falso injetado, o modulo nao le nem escreve NADA', () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  calcularConquistas({
    hilo: { total: 12, record: 7, actual: 3 },
    album: { vistas: 40, invertidas: 9, gruposCerrados: 1, repeticionMaxima: 4 },
    ritual: { dias: 7, completo: true },
  });
  calcularConquistas();
  calcularConquistas(null);

  assert.deepEqual(falso.escritas, [], 'conquista nao grava — nem um byte');
  assert.deepEqual(falso.leituras, [], 'conquista tambem nao le disco: e 100% funcao pura');
});

test('CONQUISTAS: o fonte nao importa o armazenamento', () => {
  const fonte = fonteSemComentarios('lib/conquistas.js');
  assert.equal(/almacen/.test(fonte), false, 'lib/conquistas.js nao pode conhecer o disco');
  assert.equal(/guardarSeguro|leerSeguro|borrarSeguro/.test(fonte), false);
  // Sem Date e sem sorteio: o mesmo retrato tem de dar sempre a mesma resposta.
  assert.equal(/Math\s*\.\s*random/.test(fonte), false);
  assert.equal(/new\s+Date|Date\s*\.\s*now/.test(fonte), false);
});

test('CONQUISTAS: o mesmo retrato devolve sempre o mesmo resultado', () => {
  const retrato = { hilo: { total: 9, record: 4 }, album: { vistas: 11 } };
  const a = JSON.stringify(calcularConquistas(retrato));
  const b = JSON.stringify(calcularConquistas(retrato));
  assert.equal(a, b);
});

/* =================================================================================
 * 8 · CONQUISTAS — "voltar depois de faltar"
 *
 * A conquista mais escorregadia do app, e a mais facil de transformar em
 * punicao sem perceber. Ela tem de exigir AS DUAS METADES: houve uma
 * interrupcao E a pessoa voltou depois dela. Metade sozinha ("houve
 * interrupcao") seria um selo que aparece para constatar que alguem sumiu.
 *
 * A medida e `total > record`: o total conta os dias em que ela veio, o recorde
 * conta a maior fileira seguida. Um total maior que o recorde so e possivel com
 * pelo menos duas fileiras — ou seja, um buraco no meio E dias depois dele.
 *
 * MUTACAO A: troque para `total > actual` e o teste falha no cenario "voltou
 *            ontem e ainda nao veio hoje" — que passaria a acender a conquista
 *            para quem NUNCA faltou.
 * MUTACAO B: troque para `record < total || record === 0` (ou qualquer coisa
 *            que acenda sem o retorno) e o teste falha no fio virgem.
 * ================================================================================= */
function volta(retrato) {
  return calcularConquistas(retrato).find((c) => c.id === 'a-volta');
}

test('CONQUISTAS: "a volta" NAO acende para quem nunca faltou', () => {
  assert.equal(volta({ hilo: { total: 0, record: 0, actual: 0 } }).lograda, false, 'fio virgem');
  assert.equal(volta({ hilo: { total: 1, record: 1, actual: 1 } }).lograda, false, 'um dia so');
  assert.equal(
    volta({ hilo: { total: 5, record: 5, actual: 5 } }).lograda,
    false,
    'cinco dias seguidos sem buraco nenhum'
  );
  assert.equal(
    volta({ hilo: { total: 5, record: 5, actual: 0 } }).lograda,
    false,
    'PAROU hoje, mas nunca voltou de nada: o fio parado sozinho NAO e conquista '
      + '— seria a conquista de ter sumido'
  );
});

test('CONQUISTAS: "a volta" acende quando houve falta E retorno', () => {
  assert.equal(
    volta({ hilo: { total: 6, record: 5, actual: 1 } }).lograda,
    true,
    'cinco seguidos, um buraco, e voltou'
  );
  assert.equal(
    volta({ hilo: { total: 12, record: 4, actual: 2 } }).lograda,
    true,
    'varias idas e vindas'
  );
});

test('CONQUISTAS: "a volta" nao se perde depois de alcancada', () => {
  // Ela voltou (total 6 > record 5) e depois parou de novo. A marca fica: o que
  // aconteceu aconteceu, e conquista que some e punicao com atraso.
  assert.equal(volta({ hilo: { total: 6, record: 5, actual: 0 } }).lograda, true);
});

test('CONQUISTAS: nenhuma conquista e escrita como punicao', () => {
  // O texto tem de falar do que ela FEZ. No instante em que ele nomear a falta
  // ("voce ficou X dias fora", "voce perdeu"), a conquista deixou de celebrar e
  // passou a cobrar — e e exatamente essa a linha que o app nao atravessa.
  const PUNICAO = [
    /\bvoc[eê] perdeu\b/i,
    /\bvoc[eê] sumiu\b/i,
    /\bvoc[eê] faltou\b/i,
    /\bdias? (fora|perdidos?|sem vir)\b/i,
    /\bficou \d+ dias?\b/i,
    /\bsua? (sequ[eê]ncia|fio) (quebrou|se rompeu|acabou)\b/i,
    /\bcomecar do zero\b/i,
    /\bcome[çc]ar do zero\b/i,
    /\brecuperar (a sua|sua|o seu|seu)\b/i,
    /\bnao desista\b/i,
    /\bn[aã]o desista\b/i,
  ];

  const achados = [];
  for (const c of CONQUISTAS) {
    for (const clave of [c.claveTitulo, c.claveTexto]) {
      if (!existe(clave)) {
        achados.push(`${c.id}: chave morta ${clave}`);
        continue;
      }
      const texto = t(clave);
      for (const p of PUNICAO) {
        if (p.test(texto)) achados.push(`${c.id} · ${clave}: "${texto}" (${p})`);
      }
      // E nenhuma conquista pode empurrar para a outra pessoa, pelo mesmo
      // motivo das missoes.
      if (sugiereContacto(texto)) achados.push(`${c.id} · ${clave}: pede contato — "${texto}"`);
    }
  }
  assert.deepEqual(achados, [], `Conquista que pune ou empurra:\n  ${achados.join('\n  ')}`);
});

/* =================================================================================
 * 9 · A CHAVE NOVA ENTRA NA LISTA DO "APAGAR TUDO"
 *
 * Esta regra ja custou caro aqui, e ela e a unica do arquivo cuja violacao nao
 * aparece em NENHUM comportamento observavel do app: a chave orfa continua
 * gravando, continua lendo, e so vaza no dia em que alguem aperta "Apagar tudo"
 * e o dado fica. A partir dai a politica de privacidade da ficha de loja e uma
 * declaracao falsa.
 *
 * Por isso o teste nao confere uma lista escrita a mao: ele VARRE lib/ atras de
 * `const CLAVE = '...'` e exige que cada uma esteja em CLAVES_HILO_ROJO.
 *
 * E ele ja falhou em fazer isso. Ate agora o "varredor" era um array de seis
 * caminhos digitados aqui — uma lista escrita a mao com o comentario acima
 * dizendo que nao era. lib/ultimaLectura.js nunca esteve nesse array, entao a
 * chave 'ultimaLectura' (que guarda as cinco respostas do onboarding junto da
 * leitura do dia) ficou fora de CLAVES_HILO_ROJO com o portao VERDE. Um portao
 * que enumera o que vai vigiar so vigia o passado: a chave nova nasce justamente
 * fora da lista. Agora o modulo entra na varredura por EXISTIR em lib/, e a
 * unica forma de escapar e nao ser um arquivo.
 * ================================================================================= */
test('APAGAR TUDO: toda chave de storage de lib/ esta em CLAVES_HILO_ROJO', () => {
  const CLAVES_HILO_ROJO = clavesDeBorrarTodo();
  // readdirSync, nunca um array digitado: e a diferenca entre varrer e listar.
  const modulos = readdirSync(join(RAIZ, 'lib'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => `lib/${f}`);

  assert.ok(modulos.length >= 10, `a varredura de lib/ achou so ${modulos.length} modulos`);

  const faltando = [];
  for (const relativo of modulos) {
    const fonte = fonteSemComentarios(relativo);
    const achados = fonte.match(/const\s+CLAVE\w*\s*=\s*'([^']+)'/g) || [];
    for (const bruto of achados) {
      const chave = bruto.match(/'([^']+)'/)[1];
      // So o que parece chave de disco: nomes com ponto ou espaco sao outra coisa.
      if (/[^a-zA-Z0-9_-]/.test(chave)) continue;
      if (!CLAVES_HILO_ROJO.includes(chave)) faltando.push(`${relativo}: '${chave}'`);
    }
  }

  assert.deepEqual(
    faltando,
    [],
    'Chave de storage fora de CLAVES_HILO_ROJO. Ela sobrevive ao "Apagar tudo" e a '
      + `tela de privacidade passa a mentir:\n  ${faltando.join('\n  ')}`
  );
});

test('APAGAR TUDO: a lista nao tem repetida nem buraco', () => {
  const CLAVES_HILO_ROJO = clavesDeBorrarTodo();
  assert.equal(
    new Set(CLAVES_HILO_ROJO).size,
    CLAVES_HILO_ROJO.length,
    'chave repetida na lista'
  );
  for (const chave of ['album', 'fichas', 'missoes']) {
    assert.ok(CLAVES_HILO_ROJO.includes(chave), `a chave '${chave}' tem de estar na lista`);
  }
  _reiniciarParaTests();
});
