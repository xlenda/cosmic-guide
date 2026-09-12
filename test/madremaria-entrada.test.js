// Portao da LEITURA DE ENTRADA — o marcador e a ancora do ano das treze luas.
//
// Os quatro comportamentos abaixo sao os que uma refatoracao futura desfaz sem
// perceber, porque o app continua abrindo e nada estoura:
//   1. a ancora do ano NUNCA e reescrita (reouvir os audios nao volta ao mes 1);
//   2. a gravacao da ancora e um MERGE (nao apaga o que ela escreveu por lunacao);
//   3. o marcador so vale quando `feita === true` — disco podre nao conta como
//      leitura recebida, e o pior caso e ela reouvir tres audios;
//   4. a chave do marcador esta na lista que o "Apagar tudo" percorre.
//
// O (4) e o que transforma a politica de privacidade da ficha de loja em
// declaracao falsa quando falha, e e o unico que nao se ve rodando o app.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  _inyectarAlmacenParaTests,
  _reiniciarParaTests,
  leerSeguro,
} from '../madremaria/lib/almacen.js';
import { tirarTresLenormand } from '../madremaria/datos/lenormand.js';
import {
  CLAVE_ANO,
  CLAVE_ENTRADA,
  inicioDaJornada,
  jaFezLeituraDeEntrada,
  marcarLeituraDeEntrada,
} from '../madremaria/lib/entrada.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

/* A fonte de uma tela, como texto. As telas tem JSX e nao carregam sob
 * `node --test`: a mesma tecnica dos portoes de test/madremaria-profunda.test.js
 * e test/madremaria-gamificacao.test.js.
 *
 * FUSAO COSMIC GUIDE: a raiz da Madre deixou de ser a raiz do repo — o app dela
 * mora em madremaria/, e a raiz aqui e o Cosmic inteiro. Sem o segmento, cada
 * leitura cai num screens/ que e do Cosmic (ou em arquivo nenhum). */
function fonte(caminho) {
  return readFileSync(new URL(`../madremaria/${caminho}`, __RAIZ_URL), 'utf8');
}

/* A mesma fonte, SEM comentario — a copia de test/profunda.test.js, e pelo mesmo
 * motivo: os cabecalhos deste projeto citam pelo nome o que a tela nao pode
 * fazer ("a tela de reouvir nao chama marcarLeituraDeEntrada"), e um portao que
 * le comentario acusa a documentacao da propria regra. */
const codigo = (relativo) =>
  fonte(relativo)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((linha) => {
      const l = linha.trim();
      return !l.startsWith('//') && !l.startsWith('*');
    })
    .join('\n');

/* Storage falso, o mesmo espirito de test/almacen.test.js: um Map que aceita o
 * require e responde como o AsyncStorage real. As chaves ficam visiveis para o
 * teste poder conferir o ENDERECO gravado, e nao so o valor. */
function almacenFalso(inicial = {}) {
  const disco = new Map(Object.entries(inicial));
  return {
    disco,
    async getItem(k) {
      return disco.has(k) ? disco.get(k) : null;
    },
    async setItem(k, v) {
      disco.set(k, v);
    },
    async removeItem(k) {
      disco.delete(k);
    },
  };
}

test('a primeira conclusao marca a leitura e ancora o dia 1 do ano', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  assert.equal(await jaFezLeituraDeEntrada(), false, 'antes de concluir, nao ha leitura');
  assert.equal(await inicioDaJornada(), null, 'antes de concluir, nao ha jornada');

  const r = await marcarLeituraDeEntrada(new Date('2026-03-03T10:00:00.000Z'));

  assert.equal(r.ancoraNova, true);
  assert.equal(r.ancora, '2026-03-03T10:00:00.000Z');
  assert.equal(await jaFezLeituraDeEntrada(), true);
  assert.equal(await inicioDaJornada(), '2026-03-03T10:00:00.000Z');

  _reiniciarParaTests();
});

test('a chave nua vira endereco prefixado uma vez so, nunca mm-hr.mm-hr.', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  await marcarLeituraDeEntrada(new Date('2026-03-03T10:00:00.000Z'));

  const enderecos = [...falso.disco.keys()];
  assert.ok(enderecos.includes('mm-hr.leituraEntrada'), `enderecos gravados: ${enderecos}`);
  assert.ok(enderecos.includes('mm-hr.ano'), `enderecos gravados: ${enderecos}`);
  for (const e of enderecos) {
    assert.ok(!e.startsWith('mm-hr.mm-hr.'), `prefixo duplicado em ${e}`);
  }

  _reiniciarParaTests();
});

test('REOUVIR NAO REANCORA: a segunda conclusao mantem o inicio da jornada', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  await marcarLeituraDeEntrada(new Date('2026-03-03T10:00:00.000Z'));
  // Sete meses depois ela volta pelo Perfil so para reouvir os audios.
  const r = await marcarLeituraDeEntrada(new Date('2026-10-11T22:30:00.000Z'));

  assert.equal(r.ancoraNova, false, 'a ancora nao pode nascer de novo');
  assert.equal(r.ancora, '2026-03-03T10:00:00.000Z');
  assert.equal(
    await inicioDaJornada(),
    '2026-03-03T10:00:00.000Z',
    'reouvir a leitura devolveria a pessoa a lunacao 1'
  );

  _reiniciarParaTests();
});

test('a ancora nao apaga o que ela escreveu por lunacao na mesma chave', async () => {
  // A chave 'ano' e compartilhada: ancora + texto por lunacao. Um overwrite cru
  // apagaria doze meses de texto intimo na primeira reabertura pelo Perfil.
  const falso = almacenFalso({
    'mm-hr.ano': JSON.stringify({ lunacoes: { 1: 'o que aconteceu, na minha letra' } }),
  });
  _inyectarAlmacenParaTests(falso);

  await marcarLeituraDeEntrada(new Date('2026-03-03T10:00:00.000Z'));

  const guardado = JSON.parse(await leerSeguro(CLAVE_ANO));
  assert.equal(guardado.inicio, '2026-03-03T10:00:00.000Z');
  assert.equal(
    guardado.lunacoes[1],
    'o que aconteceu, na minha letra',
    'o texto dela sobreviveu a gravacao da ancora'
  );

  _reiniciarParaTests();
});

test('marcador podre nao conta como leitura recebida', async () => {
  for (const podre of ['', '   ', 'null', '"sim"', '{', '[]', '{"feita":"sim"}', '{"feita":false}']) {
    _inyectarAlmacenParaTests(almacenFalso({ 'mm-hr.leituraEntrada': podre }));
    assert.equal(
      await jaFezLeituraDeEntrada(),
      false,
      `"${podre}" nao pode passar por leitura concluida`
    );
    _reiniciarParaTests();
  }
});

test('ancora podre nao vira jornada inventada', async () => {
  for (const podre of ['{}', '{"inicio":""}', '{"inicio":123}', '[]', 'nao é json']) {
    _inyectarAlmacenParaTests(almacenFalso({ 'mm-hr.ano': podre }));
    assert.equal(await inicioDaJornada(), null, `"${podre}" nao pode virar inicio de jornada`);
    _reiniciarParaTests();
  }
});

/* ===========================================================================
 * A MESA DOS SEIS VERSOS, E A TRANCA QUE A SUSTENTA
 * ===========================================================================
 * A tela mostra seis versos e a usuaria toca em tres. A escolha dela e de
 * POSICAO, nao de carta: as tres reveladas sao sempre as mesmas, na ordem em que
 * ela tocou (screens/LeituraDeEntradaScreen.js explica inteiro no cabecalho).
 *
 * Isso so se sustenta porque a leitura acontece UMA VEZ NA VIDA — quem nao
 * refaz a leitura nunca tem duas para comparar. Os tres testes abaixo vigiam as
 * duas metades juntas, porque afrouxar uma sem a outra e o unico jeito de a
 * grade virar encenacao descoberta pela propria usuaria.
 * =========================================================================== */

test('as tres cartas continuam fixas, na ordem que a voz gravada narra', () => {
  const tiragem = tirarTresLenormand();
  assert.deepEqual(
    tiragem.map((t) => t.carta.id),
    ['lenormand-24', 'lenormand-06', 'lenormand-01'],
    'A voz gravada diz "vossa PRIMEIRA carta", "a sua SEGUNDA", "a sua TERCEIRA e '
      + 'ultima". Sortear aqui faria a narracao falar de uma carta que a tela nao mostra.'
  );
  assert.deepEqual(tiragem.map((t) => t.posicao), [1, 2, 3]);
});

test('a tela da escolha expulsa quem ja fez a leitura', () => {
  const tela = codigo('screens/LeituraDeEntradaScreen.js');

  assert.ok(
    tela.includes('jaFezLeituraDeEntrada'),
    'a leitura de entrada deixou de perguntar se ja aconteceu: quem digitar "/leitura" '
      + 'na barra de enderecos escolhe as tres cartas de novo — e duas leituras lado a '
      + 'lado mostram que os seis versos escondem sempre as mesmas tres'
  );
  assert.match(
    tela,
    /navigation\.replace\(NOMBRE_ABAS\)/,
    'quem ja fez tem de sair por REPLACE para as abas. Um navigate empilharia a leitura '
      + 'de entrada atras do app, e o botao voltar do Android a traria de volta'
  );
});

test('o Perfil leva para a leitura, nunca para a tela da escolha', () => {
  const perfil = codigo('screens/PerfilScreen.js');

  assert.ok(
    perfil.includes('RUTAS.REOUVIR_ENTRADA'),
    '"Ouvir de novo as tres cartas" perdeu o destino: as pessoas VOLTAM nos audios, e '
      + 'sem esta linha a voz que faz o app funcionar fica trancada atras de uma URL'
  );
  /* Sem comentario de proposito (ver `codigo`): o comentario daquela lista CITA
   * a rota antiga para explicar por que ela saiu, e um portao que lesse o
   * comentario acusaria a documentacao da propria regra. O que nao pode existir
   * e a rota dentro do Object.freeze da lista de acessos. */
  const lista = perfil.match(/const ACCESOS\s*=\s*Object\.freeze\(\[([\s\S]*?)\n\]\)/);
  assert.ok(lista, 'ACCESOS sumiu de screens/PerfilScreen.js');
  const rotas = [...lista[1].matchAll(/ruta:\s*RUTAS\.([A-Z_]+)/g)].map((m) => m[1]);
  assert.ok(
    !rotas.includes('LEITURA_ENTRADA'),
    'o Perfil voltou a apontar para a tela da escolha. Era a UNICA porta pela qual '
      + `alguem chegava la uma segunda vez. Rotas na lista: ${rotas.join(', ')}`
  );

  // A tela do outro lado tem de existir e estar registrada: navigate() para rota
  // nao registrada nao lanca, so avisa em __DEV__ — o dedo bate e nada acontece.
  assert.match(codigo('routes.js'), /REOUVIR_ENTRADA:\s*'ReouvirEntrada'/);
  /* FUSAO: o App.js da Madre virou MadreMariaApp.js — a arvore dela e um
   * navegador ANINHADO dentro do HomeStack do Cosmic, e o App.js da raiz e o do
   * Cosmic. O que este portao guarda nao mudou: a tela registrada no Stack DELA. */
  const app = codigo('MadreMariaApp.js');
  assert.ok(app.includes('name={RUTAS.REOUVIR_ENTRADA}'), 'a tela nao esta no Stack de MadreMariaApp.js');
  assert.ok(app.includes('ReouvirTresCartasScreen'), 'MadreMariaApp.js nao importa a tela');

  // E ela nao pode gravar nada: reouvir no mes 7 nao pode devolver ninguem a
  // lunacao 1, e o jeito seguro de garantir isso e nao chamar a gravacao.
  assert.ok(
    !codigo('screens/ReouvirTresCartasScreen.js').includes('marcarLeituraDeEntrada'),
    'a tela de reouvir escreve no disco. A ancora do ano so nasce na leitura de verdade'
  );
});

/* A lista sai da FONTE de screens/AjustesScreen.js, e nao de um import: aquela
 * tela tem JSX e nao carrega sob `node --test`. Mesma tecnica do portao de
 * test/gamificacao.test.js — e e por isso que a entrada la e um literal e nao o
 * CLAVE_ENTRADA importado: o parser so resolve string. Este teste e a ponte que
 * amarra o literal ao dono da chave, e renomear em um lado sem o outro falha. */
test('as chaves da leitura de entrada estao na lista que o "Borrar todo" percorre', () => {
  const fonte = readFileSync(
    new URL('../madremaria/screens/AjustesScreen.js', __RAIZ_URL),
    'utf8'
  );
  const bloco = fonte.match(/CLAVES_HILO_ROJO\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
  assert.ok(bloco, 'CLAVES_HILO_ROJO sumiu de screens/AjustesScreen.js');

  const literais = [...bloco[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);

  assert.ok(
    literais.includes(CLAVE_ENTRADA),
    `'${CLAVE_ENTRADA}' nao esta em CLAVES_HILO_ROJO. Sem esta linha, "Apagar tudo" `
      + 'deixa o marcador no aparelho e o app PULA a leitura de entrada de uma pessoa '
      + `que mandou apagar tudo. Literais encontrados: ${literais.join(', ')}`
  );
  assert.ok(
    literais.includes(CLAVE_ANO),
    `'${CLAVE_ANO}' nao esta em CLAVES_HILO_ROJO: a ancora da jornada e o que ela `
      + 'escreve por lunacao sobreviveriam ao "Apagar tudo"'
  );
});
