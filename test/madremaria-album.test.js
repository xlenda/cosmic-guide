// Portao do ALBUM DAS 78. Como o test/almacen.test.js, e um teste de MUTACAO:
// cada bloco existe porque quebrar aquela regra deixa o app "funcionando" e
// mentindo, e nenhum caminho feliz denunciaria.
//
// As seis regras que este arquivo tranca:
//   1. so entra carta que apareceu numa tirada REAL — nao ha porta de brinde;
//   2. a ocorrencia e idempotente: toque duplo e remontagem nao inflam o album;
//   3. o REPARO existe — evento gravado com a carta ausente nao deixa a carta
//      eternamente oculta;
//   4. tres cartas registradas EM PARALELO nao se perdem (a fila de escrita);
//   5. nada do que a tela recebe nomeia carta ainda oculta;
//   6. a chave 'album' esta em CLAVES_HILO_ROJO, senao "Borrar todo" mente.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { _inyectarAlmacenParaTests, leerSeguro } from '../madremaria/lib/almacen.js';
import { MAZO } from '../madremaria/lib/mazo.js';
import {
  GRUPOS,
  TECHO_EVENTOS,
  TOTAL_CARTAS,
  cartasEncontradas,
  estaEncontrada,
  fueEncontrada,
  leerAlbum,
  registrarEncuentro,
  registrarTirada,
  resumenAlbum,
} from '../madremaria/lib/album.js';

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

const IDS = MAZO.map((c) => c.id);
const IDS_MAYORES = IDS.filter((id) => id.startsWith('major-'));

test('o album nasce vazio e ja conhece as 78 casas', async () => {
  limpiar();
  assert.equal(TOTAL_CARTAS, 78);
  const r = resumenAlbum(await leerAlbum());
  assert.equal(r.total, 78);
  assert.equal(r.encontradas, 0);
  // O desejo visivel do Heat Game: as casas existem desde o primeiro dia, e a
  // grade sabe quantas faltam em cada grupo sem saber QUAIS.
  assert.equal(r.grupos.length, GRUPOS.length);
  assert.equal(
    r.grupos.reduce((s, g) => s + g.total, 0),
    78
  );
  assert.deepEqual(await cartasEncontradas(), []);
});

test('MUTACAO: so entra carta que apareceu numa tirada real', async () => {
  const falso = limpiar();
  // A unica porta de entrada e registrarEncuentro, e ela exige uma carta do
  // MAZO. Id inventado nao escreve NADA no disco: nem evento, nem indice.
  const r = await registrarEncuentro({ cartaId: 'carta-inventada', ocurrenciaId: 'x1' });
  assert.equal(r.ok, false);
  assert.equal(r.motivo, 'carta');
  assert.equal(falso.disco.has('mm-hr.album'), false);
  assert.equal(await fueEncontrada('carta-inventada'), false);

  // E o modulo nao expoe nenhum atalho de desbloqueio. Se um aparecer, este
  // teste fica vermelho antes de o commit sair da maquina.
  const modulo = await import('../madremaria/lib/album.js');
  const proibidos = Object.keys(modulo).filter((k) =>
    /desbloq|marcar|revelar|todas|regalo|premi/i.test(k)
  );
  assert.deepEqual(proibidos, []);
});

test('um encontro real entra, com orientacao e datas medidas neste aparelho', async () => {
  limpiar();
  const r = await registrarEncuentro({
    cartaId: 'copas-07',
    ocurrenciaId: 'tirada-1',
    invertida: true,
    dia: '2026-08-31',
  });
  assert.equal(r.ok, true);
  assert.equal(r.nuevo, true);
  assert.equal(r.veces, 1);

  const estado = await leerAlbum();
  assert.deepEqual(estado.cartas['copas-07'], {
    veces: 1,
    derechas: 0,
    invertidas: 1,
    primera: '2026-08-31',
    ultima: '2026-08-31',
    legado: false,
  });
  assert.equal(estaEncontrada(estado, 'copas-07'), true);
  assert.equal(await fueEncontrada('copas-07'), true);
  assert.deepEqual(await cartasEncontradas(), ['copas-07']);
});

test('MUTACAO: a mesma ocorrencia dez vezes conta UM encontro', async () => {
  limpiar();
  for (let i = 0; i < 10; i += 1) {
    const r = await registrarEncuentro({
      cartaId: 'major-00',
      ocurrenciaId: 'sorteo-abc',
      dia: '2026-08-31',
    });
    assert.equal(r.ok, true);
    if (i > 0) assert.equal(r.duplicado, true);
  }
  // Trocar o id de ocorrencia por um valor novo a cada chamada faz isto virar 10.
  assert.equal((await leerAlbum()).cartas['major-00'].veces, 1);
});

test('sem ocurrenciaId o id e DERIVADO de (dia + carta + posicion)', async () => {
  limpiar();
  // Mesmo dia, mesma carta, mesma posicao: um encontro, quantas vezes se chame.
  await registrarEncuentro({ cartaId: 'espadas-03', dia: '2026-08-31', posicion: 0 });
  await registrarEncuentro({ cartaId: 'espadas-03', dia: '2026-08-31', posicion: 0 });
  assert.equal((await leerAlbum()).cartas['espadas-03'].veces, 1);

  // Posicao diferente e dia diferente sao encontros diferentes.
  await registrarEncuentro({ cartaId: 'espadas-03', dia: '2026-08-31', posicion: 2 });
  await registrarEncuentro({ cartaId: 'espadas-03', dia: '2026-09-01', posicion: 0 });
  const carta = (await leerAlbum()).cartas['espadas-03'];
  assert.equal(carta.veces, 3);
  assert.equal(carta.primera, '2026-08-31');
  assert.equal(carta.ultima, '2026-09-01');
});

test('MUTACAO: o reparo devolve a carta presa fora do album', async () => {
  const falso = limpiar();
  // O app caiu depois de gravar o evento e antes de a carta entrar no indice.
  falso.disco.set('mm-hr.album', JSON.stringify({ cartas: {}, eventos: ['sorteo-xyz#0'] }));

  const r = await registrarEncuentro({ cartaId: 'ouros-04', ocurrenciaId: 'sorteo-xyz#0' });
  assert.equal(r.reparado, true);
  assert.equal(r.nuevo, true);
  assert.equal(r.veces, 1);
  assert.equal(await fueEncontrada('ouros-04'), true);
  // O reparo NAO consome um evento novo: o total nunca infla.
  assert.deepEqual((await leerAlbum()).eventos, ['sorteo-xyz#0']);
});

test('MUTACAO: uma tirada de tres nao perde cartas', async () => {
  limpiar();
  const tirada = [
    { carta: { id: 'major-01' }, invertida: false },
    { carta: { id: 'paus-05' }, invertida: true },
    { carta: { id: 'ouros-09' }, invertida: false },
  ];
  await registrarTirada(tirada, 'sorteo-1', '2026-08-31');
  assert.deepEqual((await cartasEncontradas()).sort(), ['major-01', 'ouros-09', 'paus-05']);

  // Remontar a sintese e registrar de novo NAO conta seis cartas.
  await registrarTirada(tirada, 'sorteo-1', '2026-08-31');
  const estado = await leerAlbum();
  assert.equal(estado.cartas['major-01'].veces, 1);
  assert.equal(estado.cartas['paus-05'].veces, 1);
  assert.equal(estado.cartas['ouros-09'].veces, 1);
});

test('MUTACAO: tres encontros EM PARALELO nao se atropelam', async () => {
  limpiar();
  // Sem a fila de escrita os tres read-modify-write se cruzam e so o ultimo
  // sobrevive — o sintoma seria "so a terceira carta entrou no album".
  await Promise.all([
    registrarEncuentro({ cartaId: 'major-02', ocurrenciaId: 's#0', dia: '2026-08-31' }),
    registrarEncuentro({ cartaId: 'copas-05', ocurrenciaId: 's#1', dia: '2026-08-31' }),
    registrarEncuentro({ cartaId: 'espadas-09', ocurrenciaId: 's#2', dia: '2026-08-31' }),
  ]);
  assert.equal(resumenAlbum(await leerAlbum()).encontradas, 3);
});

test('o resumo NUNCA nomeia uma carta ainda oculta', async () => {
  limpiar();
  await registrarEncuentro({ cartaId: 'copas-01', ocurrenciaId: 'u1', dia: '2026-08-31' });
  const resumen = JSON.stringify(resumenAlbum(await leerAlbum()));
  for (const id of IDS.filter((x) => x !== 'copas-01')) {
    assert.ok(!resumen.includes(id), `o resumo vazou o id oculto ${id}`);
  }
  // O que a grade recebe da casa oculta e uma CONTAGEM, e so.
  const copas = resumenAlbum(await leerAlbum()).grupos.find((g) => g.clave === 'copas');
  assert.equal(copas.encontradas, 1);
  assert.ok(copas.total > 1);
  assert.equal(copas.completo, false);
});

test('fechar um grupo e uma marca derivada, nunca uma recompensa guardada', async () => {
  limpiar();
  for (let i = 0; i < IDS_MAYORES.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await registrarEncuentro({ cartaId: IDS_MAYORES[i], ocurrenciaId: `m${i}`, dia: '2026-08-31' });
  }
  const r = resumenAlbum(await leerAlbum());
  assert.equal(r.grupos.find((g) => g.clave === 'major').completo, true);
  assert.equal(r.encontradas, IDS_MAYORES.length);

  // Nenhuma chave de recompensa nasceu: "completo" e funcao pura sobre as
  // cartas, calculada na hora. Sem estado proprio nao ha o que divergir, o que
  // migrar, nem uma segunda chave para lembrar de apagar.
  const guardado = JSON.parse(await leerSeguro('album'));
  assert.deepEqual(Object.keys(guardado).sort(), ['cartas', 'eventos']);
});

test('storage sujo nunca vira progresso falso', async () => {
  const falso = limpiar();
  falso.disco.set(
    'mm-hr.album',
    JSON.stringify({
      cartas: {
        // Id de uma versao anterior do baralho: descartado na leitura, e por
        // isso a contagem nunca passa de 78.
        'arcano-99': { veces: 5 },
        // Contagem incoerente: corrige para CIMA, como lib/hilo.js. Album que
        // encolhe e album que mente.
        'paus-01': { veces: 1, derechas: 2, invertidas: 1, primera: '2026-01-02' },
      },
      eventos: 'nao e uma lista',
    })
  );
  const estado = await leerAlbum();
  assert.deepEqual(Object.keys(estado.cartas), ['paus-01']);
  assert.deepEqual(estado.eventos, []);
  assert.equal(estado.cartas['paus-01'].veces, 3);
  assert.equal(resumenAlbum(estado).encontradas, 1);
});

test('carta de legado nao ganha data inventada', async () => {
  const falso = limpiar();
  // Forma antiga do disco: "esta carta ja apareceu", sem quando.
  falso.disco.set('mm-hr.album', JSON.stringify({ cartas: { 'major-13': true }, eventos: [] }));
  const antes = (await leerAlbum()).cartas['major-13'];
  assert.equal(antes.legado, true);
  assert.equal(antes.primera, null);

  // O primeiro encontro medido da a primeira data que de fato conhecemos, e a
  // marca de legado continua de pe para a tela poder dizer que o historico
  // detalhado comeca aqui.
  await registrarEncuentro({ cartaId: 'major-13', ocurrenciaId: 'l1', dia: '2026-08-31' });
  const depois = (await leerAlbum()).cartas['major-13'];
  assert.equal(depois.primera, '2026-08-31');
  assert.equal(depois.legado, true);
});

test('a janela de eventos tem teto', async () => {
  limpiar();
  const extra = 20;
  for (let i = 0; i < TECHO_EVENTOS + extra; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await registrarEncuentro({ cartaId: 'copas-03', ocurrenciaId: `e${i}`, dia: '2026-08-31' });
  }
  const estado = await leerAlbum();
  assert.equal(estado.eventos.length, TECHO_EVENTOS);
  assert.equal(estado.cartas['copas-03'].veces, TECHO_EVENTOS + extra);
});

test('PORTAO: a chave album esta em CLAVES_HILO_ROJO', () => {
  // Sem importar a tela (React Native nao roda em node:test): o portao le o
  // arquivo. Chave fora daquela lista sobrevive ao "Borrar todo", e a politica
  // de privacidade da ficha de loja vira declaracao falsa.
  const ruta = fileURLToPath(new URL('../madremaria/screens/AjustesScreen.js', __RAIZ_URL));
  const fuente = readFileSync(ruta, 'utf8');
  const bloque = fuente.split('CLAVES_HILO_ROJO = Object.freeze([')[1];
  assert.ok(bloque, 'CLAVES_HILO_ROJO nao foi encontrada em screens/AjustesScreen.js');
  const lista = bloque.split(']);')[0];
  assert.ok(lista.includes("'album'"), "a chave 'album' nao esta em CLAVES_HILO_ROJO");
});
