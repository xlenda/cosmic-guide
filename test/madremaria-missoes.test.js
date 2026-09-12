// Portao das TRES DE HOJE (lib/missoes.js). Teste de MUTACAO: cada bloco existe
// porque quebrar aquela regra deixa o app "funcionando" e mentindo.
//
// As sete regras que este arquivo tranca:
//   1. o sorteio e DETERMINISTICO pela data local — a mesma data devolve sempre
//      as mesmas tres, e datas diferentes nao devolvem sempre as mesmas;
//   2. sao tres, uma por grupo, sem repetir;
//   3. missao inativa NUNCA e sorteada nem aceita conclusao;
//   4. concluir e idempotente e id de fora do sorteio nao grava nada;
//   5. a virada de dia zera as feitas SEM deixar rastro do dia anterior, e o
//      disco nunca guarda mais que a data e os tres ids do dia;
//   6. toda chave de copy existe em datos/textos.js e NENHUMA pede contato com
//      quem esta do outro lado nem promete desfecho;
//   7. a chave 'missoes' esta em CLAVES_HILO_ROJO, senao "Borrar todo" mente.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { _inyectarAlmacenParaTests, leerSeguro } from '../madremaria/lib/almacen.js';
import { existe, t } from '../madremaria/datos/textos.js';
import { hablaDelFuturo, sugiereContacto } from '../madremaria/lib/lectura.js';
import {
  CATALOGO,
  CLAVES_TEXTO_MISSOES,
  GRUPOS,
  MISSOES_POR_DIA,
  MOTIVOS,
  _diaEfetivo,
  completarMissao,
  estadoMissoes,
  missoesDeHoje,
} from '../madremaria/lib/missoes.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

function almacenFalso() {
  const disco = new Map();
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

function limpiar() {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);
  return falso;
}

const HOY = '2026-08-31';
const MANANA = '2026-09-01';

/* ===========================================================================
 * 1 e 2 — O SORTEIO
 * =========================================================================== */

test('a mesma data devolve sempre as mesmas tres', () => {
  const a = missoesDeHoje(HOY).map((m) => m.id);
  const b = missoesDeHoje(HOY).map((m) => m.id);
  assert.deepEqual(a, b);
  assert.equal(a.length, MISSOES_POR_DIA);
});

test('datas diferentes mudam o conjunto — senao o sorteio seria decorativo', () => {
  // Varre um mes: se o hash fosse constante (ou alguem trocasse por uma lista
  // fixa), todos os dias dariam o mesmo trio e este assert cairia.
  const vistos = new Set();
  for (let d = 1; d <= 30; d++) {
    const dia = `2026-09-${String(d).padStart(2, '0')}`;
    vistos.add(missoesDeHoje(dia).map((m) => m.id).join('|'));
  }
  assert.ok(vistos.size > 1, 'o sorteio nao muda com a data');
});

test('uma por grupo, sem repetir', () => {
  for (let d = 1; d <= 30; d++) {
    const dia = `2026-09-${String(d).padStart(2, '0')}`;
    const doDia = missoesDeHoje(dia);
    const ids = doDia.map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length, `missao repetida em ${dia}`);
    const grupos = doDia.map((m) => m.grupo);
    assert.equal(new Set(grupos).size, grupos.length, `dois do mesmo grupo em ${dia}`);
    for (const g of grupos) assert.ok(GRUPOS.includes(g), `grupo desconhecido: ${g}`);
  }
});

test('nenhuma missao inativa e sorteada', () => {
  const inativas = new Set(CATALOGO.filter((m) => !m.activa).map((m) => m.id));
  assert.ok(inativas.size > 0, 'sem entrada inativa este teste nao prova nada');
  for (let d = 1; d <= 60; d++) {
    const dia = new Date(Date.UTC(2026, 8, d));
    const iso = `${dia.getUTCFullYear()}-${String(dia.getUTCMonth() + 1).padStart(2, '0')}-${String(
      dia.getUTCDate()
    ).padStart(2, '0')}`;
    for (const m of missoesDeHoje(iso)) {
      assert.ok(!inativas.has(m.id), `missao inativa sorteada em ${iso}: ${m.id}`);
    }
  }
});

/* ===========================================================================
 * 3 e 4 — CONCLUIR
 * =========================================================================== */

test('concluir marca uma vez so, e a segunda chamada nao e erro', async () => {
  limpiar();
  const id = missoesDeHoje(HOY)[0].id;

  const primeira = await completarMissao(id, HOY);
  assert.equal(primeira.ok, true);
  assert.equal(primeira.novaFeita, true);
  assert.equal(primeira.feitas, 1);

  const segunda = await completarMissao(id, HOY);
  assert.equal(segunda.ok, true, 'remontar a tela nao pode virar erro');
  assert.equal(segunda.novaFeita, false);
  assert.equal(segunda.motivo, MOTIVOS.jaFeita);
  assert.equal(segunda.feitas, 1, 'a mesma missao contada duas vezes');
});

test('id de fora do sorteio de hoje nao grava nada', async () => {
  const falso = limpiar();
  const doDia = new Set(missoesDeHoje(HOY).map((m) => m.id));
  const deFora = CATALOGO.find((m) => !doDia.has(m.id));

  const r = await completarMissao(deFora.id, HOY);
  assert.equal(r.ok, false);
  assert.equal(r.motivo, MOTIVOS.naoSorteada);
  assert.equal(r.feitas, 0);
  assert.equal(falso.disco.size, 0, 'gravou disco para uma missao que nao e de hoje');

  const inventada = await completarMissao('missao-que-nao-existe', HOY);
  assert.equal(inventada.ok, false);
  assert.equal(inventada.motivo, MOTIVOS.naoSorteada);
});

test('as tres fechadas devolvem todasFeitas — e nada mais e entregue', async () => {
  limpiar();
  for (const m of missoesDeHoje(HOY)) await completarMissao(m.id, HOY);
  const estado = await estadoMissoes(HOY);
  assert.equal(estado.feitas, MISSOES_POR_DIA);
  assert.equal(estado.todasFeitas, true);
  // Nao existe moeda, saldo, bonus nem premio nenhum no retorno: se alguem
  // acrescentar um, e aqui que a decisao tem de ser reaberta.
  for (const proibido of ['tokens', 'saldo', 'premio', 'bonus', 'recompensa']) {
    assert.ok(!(proibido in estado), `apareceu economia no retorno: ${proibido}`);
  }
});

/* ===========================================================================
 * 5 — A VIRADA DE DIA E O DISCO
 * =========================================================================== */

test('dia novo comeca em aberto e nao deixa rastro do dia anterior', async () => {
  limpiar();
  for (const m of missoesDeHoje(HOY)) await completarMissao(m.id, HOY);

  const hoje = await estadoMissoes(MANANA);
  assert.equal(hoje.dia, MANANA);
  assert.equal(hoje.feitas, 0, 'as feitas de ontem contaram hoje');
  // E o mais importante: nada no retorno fala do dia que passou. Nao existe
  // "voce faltou", nao existe sequencia de missoes, nao existe divida.
  assert.ok(!('faltou' in hoje) && !('sequencia' in hoje) && !('ontem' in hoje));
});

test('o disco guarda so a data e os ids do dia — nunca cresce', async () => {
  const falso = limpiar();
  for (const m of missoesDeHoje(HOY)) await completarMissao(m.id, HOY);
  await completarMissao(missoesDeHoje(MANANA)[0].id, MANANA);

  const bruto = await leerSeguro('missoes');
  const guardado = JSON.parse(bruto);
  assert.equal(guardado.dia, MANANA);
  assert.ok(Array.isArray(guardado.feitas));
  assert.ok(
    guardado.feitas.length <= MISSOES_POR_DIA,
    'o registro passou de tres ids: o teto de crescimento quebrou'
  );
  assert.equal(falso.disco.size, 1, 'lib/missoes.js gravou mais de uma chave');
});

test('storage sujo nao vira contagem e nao lanca', async () => {
  const falso = limpiar();
  falso.disco.set('mm-hr.missoes', JSON.stringify({ dia: HOY, feitas: ['inventada', 'inventada'] }));
  const estado = await estadoMissoes(HOY);
  assert.equal(estado.feitas, 0);

  falso.disco.set('mm-hr.missoes', '{ nao e json');
  assert.equal((await estadoMissoes(HOY)).feitas, 0);
});

test('relogio para tras mantem o dia guardado, sem recomecar o mesmo dia', () => {
  assert.equal(_diaEfetivo(MANANA, HOY), MANANA);
  assert.equal(_diaEfetivo(HOY, MANANA), MANANA);
  assert.equal(_diaEfetivo(null, HOY), HOY);
  assert.equal(_diaEfetivo('2026-02-31', HOY), HOY, 'data impossivel passou pelo regex');
});

/* ===========================================================================
 * 6 — A COPY
 * =========================================================================== */

test('toda chave de copy das missoes existe em datos/textos.js', () => {
  const mortas = CLAVES_TEXTO_MISSOES.filter((c) => !existe(c));
  assert.deepEqual(mortas, [], `chave morta vira texto cru na tela: ${mortas.join(', ')}`);
  for (const m of CATALOGO) {
    assert.ok(existe(m.claveTitulo), `${m.id} sem titulo`);
    assert.ok(existe(m.clavePista), `${m.id} sem pista`);
  }
});

test('NENHUMA missao pede contato com quem esta do outro lado', () => {
  const achados = CLAVES_TEXTO_MISSOES.filter((c) => sugiereContacto(String(t(c))));
  assert.deepEqual(
    achados,
    [],
    'missao que empurra para fora depende de outra pessoa responder — e missao que '
      + `falha vira culpa: ${achados.join(', ')}`
  );
});

test('NENHUMA missao promete desfecho nem fala do futuro', () => {
  const achados = CLAVES_TEXTO_MISSOES.filter((c) => hablaDelFuturo(String(t(c))));
  assert.deepEqual(achados, [], `copy de missao falando do futuro: ${achados.join(', ')}`);
});

test('NENHUMA missao cobra constancia', () => {
  // A cobranca nao entra por regex de futuro nem de contato: ela entra por
  // frase de divida. Lista fechada, do jeito que ela apareceria de verdade.
  const cobranca = [
    /\bn[ãa]o perca\b/i,
    /\bvoc[êe] faltou\b/i,
    /\bn[ãa]o deixe de\b/i,
    /\btodos os dias\b/i,
    /\bsem falhar\b/i,
    /\bmantenha (a |sua )?sequ[êe]ncia\b/i,
    /\bantes que\b/i,
  ];
  const achados = CLAVES_TEXTO_MISSOES.filter((c) => {
    const texto = String(t(c));
    return cobranca.some((p) => p.test(texto));
  });
  assert.deepEqual(achados, [], `missao cobrando constancia: ${achados.join(', ')}`);
});

/* ===========================================================================
 * 7 — O PORTAO DA PRIVACIDADE
 * =========================================================================== */

test('PORTAO: a chave missoes esta em CLAVES_HILO_ROJO', () => {
  // Lido do FONTE de proposito: importar a tela puxaria react-native para o
  // runner. E o texto do arquivo que prova, e ele basta.
  const ruta = fileURLToPath(new URL('../madremaria/screens/AjustesScreen.js', __RAIZ_URL));
  const fuente = readFileSync(ruta, 'utf8');
  const bloque = fuente.match(/CLAVES_HILO_ROJO\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
  assert.ok(bloque, 'CLAVES_HILO_ROJO sumiu de screens/AjustesScreen.js');
  assert.ok(
    bloque[1].includes("'missoes'"),
    'a chave \'missoes\' ficou de fora de CLAVES_HILO_ROJO: ela sobreviveria ao '
      + '"Borrar todo" e a politica de privacidade da ficha de loja viraria declaracao falsa'
  );
});
