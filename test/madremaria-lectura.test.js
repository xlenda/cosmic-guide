// Portao do MOTOR DE LEITURA (lib/lectura.js).
//
// test/contenido.test.js trava o que esta guardado em disco e test/copy.test.js
// trava o que esta escrito nos arquivos. Nenhum dos dois olha o que o motor
// COMPOE em tempo de execucao — e a leitura que a usuaria le nao esta em arquivo
// nenhum: ela nasce da combinacao de 5 respostas com 78 cartas em 2 orientacoes.
// E ai que este arquivo entra.
//
// O que este arquivo impede:
//  - uma posicao sumir ou trocar de ordem (a tela casa tirada e texto por INDICE:
//    0/1/2. Ordem trocada = carta certa com texto da posicao errada, sem erro);
//  - TU EXTREMO falar do futuro ou pela outra pessoa — a unica posicao que o
//    produto promete que fala so da usuaria;
//  - o filtro duro de P4 nao filtrar: a usuaria diz "escrevi e ninguem
//    respondeu" e a leitura responde "escrevile". E o pior dano possivel aqui;
//  - LIMITES chegar quebrado a uma tela que e OBRIGADA a renderiza-lo;
//  - qualquer combinacao devolver undefined ou string vazia, que na tela vira
//    bloco em branco ou o literal "undefined".
//
// ===========================================================================
// POR QUE CADA REGRA TEM UM CONTROLE DE MUTACAO
// ===========================================================================
// Varrer o baralho real e necessario mas NAO e suficiente: datos/cartas.json
// hoje esta limpo, entao uma varredura sozinha passaria mesmo com a guarda
// arrancada do motor. Isso e assercao decorativa — o teste ficaria verde
// enquanto o produto quebra.
//
// Por isso cada regra roda duas vezes:
//   (a) sobre o conteudo real, para provar que o produto de hoje esta correto;
//   (b) sobre uma CARTA VENENO montada aqui, cujo consejo diz exatamente a frase
//       proibida, para provar que quem remove a guarda derruba o teste.
// Os testes (b) sao a prova por mutacao: se alguem apagar PATRONES_CONTACTO ou
// desligar a guarda do extremo, eles ficam vermelhos na hora.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  ALTERNATIVAS,
  CLAVES_POSICION,
  LIMITES,
  componerLectura,
  esContactoDuro,
  guardaContacto,
  guardaFuturo,
  hablaDelFuturo,
  sugiereContacto,
} from '../madremaria/lib/lectura.js';
import { IDS_CONTACTO_DURO, PREGUNTAS, getPregunta } from '../madremaria/datos/preguntas.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

/* FUSAO COSMIC GUIDE: a raiz do app da Madre deixou de ser a raiz do repo —
 * ela agora mora em madremaria/. Tudo que este arquivo le por RAIZ (lib/,
 * datos/, screens/) esta la dentro. */
const RAIZ = join(__dirname, '..', 'madremaria');
const CARTAS = JSON.parse(readFileSync(join(RAIZ, 'datos', 'cartas.json'), 'utf8'));

/* Os ids saem de datos/preguntas.js, nunca digitados a mao: se alguem renomear
 * uma opcao la, este arquivo acompanha em vez de testar um id que nao existe
 * mais — e um id inexistente cai na entrada 'generica' de toda tabela do motor,
 * ou seja, o teste continuaria verde testando o fallback. */
const opcionesDe = (id) => getPregunta(id).opciones.map((o) => o.id);
const CORTES = opcionesDe('corte');
const CUANDOS = opcionesDe('cuando');
const HOYS = opcionesDe('hoy');
const INTENCIONES = opcionesDe('intencion');

/* =================================================================================
 * PADROES VIGIADOS
 * ================================================================================= */

/* Empurrar a usuaria para fora. Formas acentuadas E secas: o teclado do celular
 * sem layout espanhol produz "escribele", e a frase machuca igual. */
const CONTACTO_PROIBIDO = [
  /\bescr[ií]bele\b/i,
  /\bll[aá]malo\b/i,
  /\bll[aá]mala\b/i,
  /\bb[uú]scalo\b/i,
  /\bb[uú]scala\b/i,
  /\bm[aá]ndale\b/i,
  /\binsiste\b/i,
];

/* Futuro sobre a outra pessoa, ou referencia a ela. So valem em TU EXTREMO:
 * as duas primeiras posicoes PODEM descrever o que aconteceu com as duas
 * pessoas — a promessa de falar so da usuaria e da terceira. */
const EXTREMO_PROIBIDO = [
  /\bvolver[aá]\b/i,
  /\bregresar[aá]\b/i,
  /\bva a volver\b/i,
  /\b[eé]l te\b/i,
  /\bella te\b/i,
  /\besa persona va\b/i,
];

const casa = (texto, padroes) => {
  for (const p of padroes) {
    const m = String(texto).match(p);
    if (m) return m[0];
  }
  return null;
};

/* =================================================================================
 * CARTAS VENENO — o controle de mutacao.
 *
 * Nao saem do baralho: sao montadas aqui de proposito, com a frase proibida
 * inteira no consejo/consejoInv, para forcar as guardas a trabalhar. Se um dia
 * uma destas frases sobreviver ate a tela, o teste que a usa fica vermelho.
 *
 * `amor` vem limpo de proposito nas duas: a lente e citacao e vai VERBATIM por
 * contrato, entao envenena-la testaria uma guarda que o motor nunca prometeu.
 * O que a lente suja dispara e o `aviso`, coberto no seu proprio teste.
 * ================================================================================= */

const VENENO_CONTACTO = Object.freeze({
  id: 'test-veneno-contacto',
  nombre: 'La Prueba',
  escena: 'Una carta que no existe en el mazo.',
  amor: 'Esta lente describe la espera y lo que quedó sin nombre, sin pedirle nada a nadie ni prometer nada.',
  consejo: 'Escríbele hoy mismo y mándale un audio largo. Llámalo por la noche e insiste hasta que conteste.',
  consejoInv: 'Búscala donde sea y llámala de nuevo. Insiste, mándale otro mensaje y no dejes de escribir.',
  claves: ['prueba'],
});

const VENENO_EXTREMO = Object.freeze({
  id: 'test-veneno-extremo',
  nombre: 'La Prueba Dos',
  escena: 'Otra carta que no existe en el mazo.',
  amor: 'Esta lente describe la espera y lo que quedó sin nombre, sin pedirle nada a nadie ni prometer nada.',
  /* Tres coisas diferentes na mesma carta, de proposito, porque cada uma so cai
   * numa guarda:
   *  1. "va a volver" / "Volverá"  -> locucao e futuro acentuado;
   *  2. "El te buscara" / "dira"   -> futuro SEM acento, que passava pela regra
   *     morfologica do motor porque ela exigia o acento;
   *  3. "Él te extraña todavía"    -> nao e futuro e nao pede contato nenhum.
   *     Fala PELA outra pessoa e assume o genero dela. Nenhuma guarda de futuro
   *     pega isso: e o caso que so o padrao de referencia de terceira pessoa
   *     cobre, e e uma quebra direta da regra 4 do contrato de produto. */
  consejo: 'Esa persona va a volver cuando quiera. Él te extraña todavía, aunque no lo diga. Volverá.',
  consejoInv: 'Esa persona va a regresar sola. El te buscara y ella te dira que si. Ella te piensa cada noche. Volvera.',
  claves: ['prueba'],
});

/* Respostas validas por default. Cada teste troca so o campo que lhe interessa. */
const RESPUESTAS_BASE = Object.freeze({
  nombre: 'Ana',
  corte: 'pelea',
  cuando: 'dias',
  hoy: 'hablamos',
  intencion: 'entender-mi-parte',
  /* P6 e P7 entraram em 01/09. O motor de leitura NAO le nenhuma das duas — a
   * data de nascimento e o genero alimentam o plano e o fechamento da leitura
   * profunda, nao as tres cartas. Elas estao aqui porque onboardingCompleto()
   * varre TODAS as perguntas, e e ele quem decide o campo `completa`. */
  nacimiento: '1994-03-21',
  genero: 'mulher',
});

const tresIguais = (carta, invertida) => [
  { carta, invertida },
  { carta, invertida },
  { carta, invertida },
];

const leer = (respuestas, tirada) =>
  componerLectura({ respuestas: { ...RESPUESTAS_BASE, ...respuestas }, tirada });

/* =================================================================================
 * 1. AS TRES POSICOES, SEMPRE, NESTA ORDEM
 * ================================================================================= */

test('1a. toda leitura completa devolve 3 posicoes na ordem NUDO / TENSION / EXTREMO', () => {
  /* Nao basta conferir uma tirada: a ordem tem de sobreviver a qualquer resposta.
   * Percorre as 5 opcoes de cada uma das 4 perguntas de opcao. */
  for (const corte of CORTES) {
    for (const cuando of CUANDOS) {
      for (const hoy of HOYS) {
        for (const intencion of INTENCIONES) {
          const r = leer({ corte, cuando, hoy, intencion }, [
            { carta: CARTAS[0], invertida: false },
            { carta: CARTAS[30], invertida: true },
            { carta: CARTAS[60], invertida: false },
          ]);
          const contexto = `${corte}/${cuando}/${hoy}/${intencion}`;

          assert.equal(r.posiciones.length, 3, `${contexto}: nao vieram 3 posicoes`);
          assert.deepEqual(
            r.posiciones.map((p) => p.clave),
            ['nudo', 'tension', 'extremo'],
            `${contexto}: ordem das posicoes trocada`
          );
          /* `indice` e o que a tela usa para casar posicao com a tirada original
           * de sacarTres() — se ele nao for 0,1,2 a carta desenhada nao e a carta
           * lida, e nada na tela denuncia isso. */
          assert.deepEqual(r.posiciones.map((p) => p.indice), [0, 1, 2], `${contexto}: indices fora de ordem`);
          assert.equal(r.completa, true, `${contexto}: completa deveria ser true`);
        }
      }
    }
  }
});

test('1b. a ordem e a de CLAVES_POSICION, nao a ordem em que a tirada chegou', () => {
  /* Se alguem trocar CLAVES_POSICION por engano, este teste cai junto com a tela. */
  assert.deepEqual([...CLAVES_POSICION], ['nudo', 'tension', 'extremo']);

  const r = leer({}, [
    { carta: CARTAS[5], invertida: false },
    { carta: CARTAS[6], invertida: false },
    { carta: CARTAS[7], invertida: false },
  ]);
  assert.equal(r.posiciones[0].carta.id, CARTAS[5].id, 'a 1a carta da tirada tem de ser EL NUDO');
  assert.equal(r.posiciones[1].carta.id, CARTAS[6].id, 'a 2a carta da tirada tem de ser LA TENSION');
  assert.equal(r.posiciones[2].carta.id, CARTAS[7].id, 'a 3a carta da tirada tem de ser TU EXTREMO');
});

test('1c. tirada quebrada nao inventa posicao nem troca a ordem das que sobraram', () => {
  /* Contrato do motor: entrada quebrada devolve MENOS posicoes e completa=false —
   * nunca uma posicao de enchimento. A tela precisa poder confiar nisso para
   * decidir se manda a usuaria de volta ao onboarding. */
  const r = leer({}, [null, { carta: CARTAS[0], invertida: false }, undefined]);
  assert.deepEqual(r.posiciones.map((p) => p.clave), ['tension']);
  assert.equal(r.posiciones[0].indice, 1, 'a posicao que sobrou tem de manter o indice original');
  assert.equal(r.completa, false);

  const vazia = componerLectura({});
  assert.equal(vazia.posiciones.length, 0);
  assert.equal(vazia.completa, false);
  assert.ok(vazia.limites, 'LIMITES sai mesmo com entrada vazia — a tela nao pode ficar sem eles');
  assert.equal(vazia.sintesis.bloques.length, 3, 'a sintese mantem o formato mesmo sem cartas');
});

/* =================================================================================
 * 2. TU EXTREMO NAO FALA DO FUTURO NEM DA OUTRA PESSOA
 * ================================================================================= */

test('2a. TU EXTREMO nunca fala do futuro nem da outra pessoa — 78 cartas x 2 orientacoes x 5 intencoes', () => {
  for (const carta of CARTAS) {
    for (const invertida of [false, true]) {
      for (const intencion of INTENCIONES) {
        const r = leer({ intencion }, tresIguais(carta, invertida));
        const extremo = r.posiciones[2];
        assert.ok(extremo, `${carta.id}: TU EXTREMO nao saiu`);

        const achado = casa(extremo.texto, EXTREMO_PROIBIDO);
        assert.equal(
          achado,
          null,
          `${carta.id} ${invertida ? 'invertida' : 'derecha'} / ${intencion}: ` +
            `TU EXTREMO contem "${achado}".\n---\n${extremo.texto}\n---`
        );
      }
    }
  }
});

test('2b. CONTROLE DE MUTACAO: um consejo cheio de futuro e de "el te" nao chega a TU EXTREMO', () => {
  /* Este e o teste que fica vermelho se a guarda for removida. A carta veneno
   * diz, com todas as letras, as seis coisas que a regra 2 proibe. */
  for (const invertida of [false, true]) {
    const consejo = invertida ? VENENO_EXTREMO.consejoInv : VENENO_EXTREMO.consejo;

    /* Primeiro: a frase proibida existe MESMO na entrada. Sem esta assercao o
     * teste passaria mesmo se a carta veneno fosse editada e virasse inocua. */
    assert.ok(casa(consejo, EXTREMO_PROIBIDO), `a carta veneno perdeu a frase proibida (${invertida})`);

    const r = leer({}, tresIguais(VENENO_EXTREMO, invertida));
    const extremo = r.posiciones[2];
    const achado = casa(extremo.texto, EXTREMO_PROIBIDO);
    assert.equal(
      achado,
      null,
      `a guarda deixou passar "${achado}" para TU EXTREMO.\n---\n${extremo.texto}\n---`
    );
    assert.equal(r.filtros.futuroAplicado, true, 'filtros.futuroAplicado tinha de acusar a filtragem');
    /* O paragrafo nao pode simplesmente sumir: sai a frase, entra a alternativa. */
    assert.ok(
      extremo.texto.includes(ALTERNATIVAS.futuro.extremo) ||
        extremo.texto.includes(ALTERNATIVAS.contacto.extremo),
      'a frase saiu mas nenhuma alternativa entrou no lugar'
    );
  }
});

test('2c. o detector de futuro reconhece a forma seca, nao so a acentuada', () => {
  /* Regra morfologica do espanhol: RAIZ + r + terminacao acentuada. Quem escreve
   * sem acento produz a mesma promessa — e era por ai que ela passava. */
  for (const frase of [
    'Volverá pronto.',
    'Volvera pronto.',
    'Esa persona regresará.',
    'Esa persona regresara.',
    'Ella te dirá que sí.',
    'Ella te dira que si.',
    'Él te buscará.',
    'El te buscara.',
    'Con el tiempo se sabrá.',
    'Con el tiempo se sabra.',
    'Va a volver.',
    'Vas a buscarte una respuesta.',
  ]) {
    assert.equal(hablaDelFuturo(frase), true, `futuro nao reconhecido: "${frase}"`);
  }
});

test('2d. o detector de futuro nao confunde palavra comum com verbo no futuro', () => {
  /* O outro lado da moeda: uma guarda gananciosa apaga frase boa em silencio,
   * e a usuaria le uma leitura com buraco no lugar do melhor conselho. */
  for (const frase of [
    'Un paso atrás y miras el nudo entero.',
    'Lo que quedó detrás ya no tira del hilo.',
    'Es la primera vez que lo miras así.',
    'No es la manera de mirarlo.',
    'Mira la carta sin apuro.',
    'Espera a que baje el ruido.',
    'Esto es para ti y para nadie más.',
  ]) {
    assert.equal(hablaDelFuturo(frase), false, `falso positivo de futuro: "${frase}"`);
  }
});

/* =================================================================================
 * 3. O FILTRO DURO DE P4 REALMENTE FILTRA
 * ================================================================================= */

test('3a. os ids do filtro duro sao os de datos/preguntas.js, e o motor os reconhece', () => {
  /* Se este teste cair, os dois arquivos deixaram de falar do mesmo id — e o
   * filtro simplesmente nunca liga, em silencio absoluto. */
  assert.deepEqual([...IDS_CONTACTO_DURO], ['le-escribi-no-responde', 'cero-contacto']);
  for (const hoy of HOYS) {
    const esperado = IDS_CONTACTO_DURO.includes(hoy);
    assert.equal(esContactoDuro({ hoy }), esperado, `esContactoDuro errou para hoy='${hoy}'`);
    assert.equal(
      leer({ hoy }, tresIguais(CARTAS[0], false)).filtros.contactoDuro,
      esperado,
      `filtros.contactoDuro errou para hoy='${hoy}'`
    );
  }
});

test('3b. com filtro duro, nenhuma das 3 posicoes empurra contato — 78 cartas x 2 orientacoes x 2 ids', () => {
  for (const hoy of IDS_CONTACTO_DURO) {
    for (const carta of CARTAS) {
      for (const invertida of [false, true]) {
        const r = leer({ hoy }, tresIguais(carta, invertida));
        for (const p of r.posiciones) {
          const achado = casa(p.texto, CONTACTO_PROIBIDO);
          assert.equal(
            achado,
            null,
            `hoy='${hoy}' ${carta.id} ${invertida ? 'invertida' : 'derecha'}: ` +
              `${p.clave} contem "${achado}".\n---\n${p.texto}\n---`
          );
        }
      }
    }
  }
});

test('3c. CONTROLE DE MUTACAO: com filtro duro, "escríbele / llámalo / mándale" some das 3 posicoes', () => {
  for (const hoy of IDS_CONTACTO_DURO) {
    for (const invertida of [false, true]) {
      const consejo = invertida ? VENENO_CONTACTO.consejoInv : VENENO_CONTACTO.consejo;
      assert.ok(casa(consejo, CONTACTO_PROIBIDO), `a carta veneno perdeu a frase proibida (${invertida})`);

      const r = leer({ hoy }, tresIguais(VENENO_CONTACTO, invertida));
      assert.equal(r.posiciones.length, 3, 'a filtragem nao pode fazer uma posicao sumir');
      for (const p of r.posiciones) {
        const achado = casa(p.texto, CONTACTO_PROIBIDO);
        assert.equal(
          achado,
          null,
          `hoy='${hoy}': a guarda deixou "${achado}" em ${p.clave}.\n---\n${p.texto}\n---`
        );
        /* Filtrado nunca se apresenta entre comilhas: texto entre « » passa por
         * palavra da carta, e palavra da carta e o que o motor promete citar
         * verbatim. Se a alternativa entrasse citada, o app estaria mentindo. */
        assert.ok(
          !p.texto.includes(`«${consejo}»`),
          `${p.clave}: o consejo filtrado voltou citado entre comilhas`
        );
      }
      assert.equal(r.filtros.contactoAplicado, true, 'filtros.contactoAplicado tinha de acusar a filtragem');
    }
  }
});

test('3d. CONTROLE DE MUTACAO: SEM filtro duro a guarda so protege TU EXTREMO', () => {
  /* A contraprova do 3c. Se este teste passar a acusar filtragem nas tres
   * posicoes, alguem ligou a guarda dura para todo mundo — e ai a resposta de P4
   * deixou de significar qualquer coisa, que e o mesmo que nao existir. */
  const r = leer({ hoy: 'hablamos' }, tresIguais(VENENO_CONTACTO, false));
  assert.equal(r.filtros.contactoDuro, false);

  const [nudo, tension, extremo] = r.posiciones;
  assert.ok(casa(nudo.texto, CONTACTO_PROIBIDO), 'sem filtro duro, EL NUDO cita a carta como ela e');
  assert.ok(casa(tension.texto, CONTACTO_PROIBIDO), 'sem filtro duro, LA TENSION cita a carta como ela e');
  assert.equal(
    casa(extremo.texto, CONTACTO_PROIBIDO),
    null,
    'TU EXTREMO tem a guarda de contato LIGADA SEMPRE, com filtro duro ou sem ele'
  );
});

test('3e. a acao da sintese passa pelas duas guardas, sempre', () => {
  /* 'sintesis.accionNota' promete que a acao se completa sozinha. Se a acao
   * pedir para escrever a alguem, a promessa vira mentira na mesma tela. */
  for (const hoy of HOYS) {
    for (const intencion of INTENCIONES) {
      const r = leer({ hoy, intencion }, tresIguais(VENENO_CONTACTO, false));
      const { texto } = r.sintesis.accion;
      assert.equal(casa(texto, CONTACTO_PROIBIDO), null, `acao pede contato (${hoy}/${intencion}): ${texto}`);
      assert.equal(casa(texto, EXTREMO_PROIBIDO), null, `acao fala do futuro (${hoy}/${intencion}): ${texto}`);
      assert.ok(texto.trim().length > 0, 'a acao nunca pode sair vazia');
    }
  }
});

test('3f. a lente suja nao e reescrita: ganha o aviso que a neutraliza na mesma tela', () => {
  /* A lente (carta.amor) vai VERBATIM por contrato — as guardas nao a tocam.
   * O que o motor promete e o `aviso`. Sem esta cobertura, alguem "consertaria"
   * o motor reescrevendo a lente e quebraria o contrato de conteudo. */
  const lenteSuja = { ...VENENO_CONTACTO, amor: 'La carta te pide algo simple: escríbele hoy y mándale lo que no dijiste.' };
  assert.ok(sugiereContacto(lenteSuja.amor), 'a lente de teste precisa mesmo insinuar contato');

  const r = leer({ hoy: 'cero-contacto' }, tresIguais(lenteSuja, false));
  assert.equal(r.filtros.lenteMarcada, true, 'filtros.lenteMarcada tinha de acusar a lente');
  for (const p of r.posiciones) {
    assert.equal(p.cuerpo, lenteSuja.amor, `${p.clave}: a lente foi reescrita — ela e citacao, vai verbatim`);
    assert.equal(p.aviso, ALTERNATIVAS.aviso, `${p.clave}: a lente suja saiu sem aviso ao lado`);
    /* O aviso tem de estar na mesma tela que a lente, nao num campo que a tela
     * possa esquecer de renderizar. */
    assert.ok(p.parrafos.includes(p.aviso), `${p.clave}: o aviso ficou fora de parrafos`);
  }
});

test('3g. as alternativas nao casam com os proprios padroes que substituem', () => {
  /* Se a frase de seguranca casasse com o padrao, uma segunda passada da guarda
   * a apagaria — e a posicao ficaria com um buraco onde deveria estar a protecao. */
  for (const [clave, texto] of Object.entries(ALTERNATIVAS.contacto)) {
    assert.equal(sugiereContacto(texto), false, `ALTERNATIVAS.contacto.${clave} casa com PATRONES_CONTACTO`);
  }
  for (const [clave, texto] of Object.entries(ALTERNATIVAS.futuro)) {
    assert.equal(hablaDelFuturo(texto), false, `ALTERNATIVAS.futuro.${clave} casa com PATRONES_FUTURO`);
  }
  assert.equal(sugiereContacto(ALTERNATIVAS.aviso), false, 'ALTERNATIVAS.aviso casa com PATRONES_CONTACTO');
  assert.equal(hablaDelFuturo(ALTERNATIVAS.aviso), false, 'ALTERNATIVAS.aviso casa com PATRONES_FUTURO');
});

test('3h. as guardas exportadas devolvem o formato documentado e nao mutam a entrada', () => {
  const sujo = 'Escríbele hoy mismo. Mira el nudo sin apuro.';
  const g = guardaContacto(sujo);
  assert.equal(g.filtrado, true);
  assert.equal(g.retiradas.length, 1);
  assert.ok(g.texto.includes('Mira el nudo sin apuro.'), 'a frase limpa tinha de sobreviver');
  assert.equal(casa(g.texto, CONTACTO_PROIBIDO), null);
  assert.equal(sujo, 'Escríbele hoy mismo. Mira el nudo sin apuro.', 'a entrada foi mutada');

  const limpo = guardaContacto('Mira el nudo sin apuro.');
  assert.equal(limpo.filtrado, false);
  assert.equal(limpo.texto, 'Mira el nudo sin apuro.', 'texto limpo nao pode ser reescrito');

  const f = guardaFuturo('Volvera pronto. Hoy tienes esto en la mano.');
  assert.equal(f.filtrado, true);
  assert.ok(f.texto.includes('Hoy tienes esto en la mano.'));

  /* Nenhum padrao pode carregar a flag /g: com /g, .test() guarda lastIndex e
   * passa a alternar true/false a cada chamada. E o bug mais caro deste arquivo
   * porque ele so aparece na segunda leitura da sessao. */
  for (let i = 0; i < 5; i += 1) {
    assert.equal(sugiereContacto('Escríbele hoy mismo.'), true, `sugiereContacto virou na ${i + 1}a chamada`);
    assert.equal(hablaDelFuturo('Volverá pronto.'), true, `hablaDelFuturo virou na ${i + 1}a chamada`);
  }
});

/* =================================================================================
 * 4. LIMITES
 * ================================================================================= */

test('4a. LIMITES tem exatamente 3 linhas, todas nao vazias, e titulo e pe com texto', () => {
  assert.ok(Array.isArray(LIMITES.lineas), 'limites.lineas tem de ser array');
  assert.equal(LIMITES.lineas.length, 3, 'LIMITES precisa de exatamente 3 linhas');
  LIMITES.lineas.forEach((linha, i) => {
    assert.equal(typeof linha, 'string', `linha ${i} nao e string`);
    assert.ok(linha.trim().length > 0, `linha ${i} esta vazia`);
    /* Chave inexistente em datos/textos.js volta como a propria chave. Uma linha
     * que ainda e 'limites.lineas' apareceria crua na tela sem erro nenhum. */
    assert.ok(!/^limites\./.test(linha.trim()), `linha ${i} e a chave crua, nao o texto`);
  });
  for (const campo of ['titulo', 'pie']) {
    assert.equal(typeof LIMITES[campo], 'string', `limites.${campo} nao e string`);
    assert.ok(LIMITES[campo].trim().length > 0, `limites.${campo} esta vazio`);
    assert.ok(!/^limites\./.test(LIMITES[campo].trim()), `limites.${campo} e a chave crua`);
  }
});

test('4b. LIMITES sai em TODO retorno, inclusive com entrada quebrada', () => {
  /* A tela e obrigada a renderizar os limites ANTES do resultado. Se em algum
   * caminho eles vierem vazios, a tela mostra o resultado sem o enquadre honesto
   * que da autoridade a leitura inteira. */
  const entradas = [
    undefined,
    {},
    { respuestas: null, tirada: null },
    { respuestas: RESPUESTAS_BASE, tirada: [] },
    { respuestas: RESPUESTAS_BASE, tirada: tresIguais(CARTAS[0], false) },
  ];
  for (const entrada of entradas) {
    const r = componerLectura(entrada);
    assert.equal(r.limites.lineas.length, 3, `limites quebrado para ${JSON.stringify(entrada)}`);
    assert.ok(r.limites.titulo.trim(), 'limites.titulo vazio');
    assert.ok(r.limites.pie.trim(), 'limites.pie vazio');
  }
});

/* =================================================================================
 * 5. COBERTURA CRUZADA
 *
 * As 5 opcoes de P2 x as 5 de P4 x as 78 cartas x 2 orientacoes = 3.900 leituras.
 * NAO e amostragem: o produto cartesiano inteiro do que foi pedido roda aqui.
 * P3 e P5 giram por indice (deterministico, sem Math.random) para que as 5
 * opcoes de cada uma tambem entrem — o teste confere no fim que todas entraram.
 * ================================================================================= */

test('5. cobertura cruzada: 5 (P2) x 5 (P4) x 78 cartas x 2 orientacoes = 3.900 leituras sem buraco', () => {
  /* Campos que a tela renderiza direto: string vazia vira bloco em branco e
   * undefined vira o literal "undefined" no meio da leitura. */
  const OBRIGATORIOS = ['clave', 'rotulo', 'sub', 'orientacion', 'cuerpo', 'texto'];
  /* Campos que PODEM ser null por contrato (a guarda esvaziou a parte porque a
   * alternativa desta posicao ja foi gasta) — mas nunca undefined nem ''. */
  const OPCIONAIS = ['pregunta', 'linea', 'frase', 'aviso'];

  const vistos = { cuando: new Set(), intencion: new Set() };
  let leituras = 0;

  for (let ci = 0; ci < CORTES.length; ci += 1) {
    for (let hi = 0; hi < HOYS.length; hi += 1) {
      for (let k = 0; k < CARTAS.length; k += 1) {
        for (const invertida of [false, true]) {
          const cuando = CUANDOS[(k + ci) % CUANDOS.length];
          const intencion = INTENCIONES[(k + hi) % INTENCIONES.length];
          vistos.cuando.add(cuando);
          vistos.intencion.add(intencion);

          const respuestas = { corte: CORTES[ci], cuando, hoy: HOYS[hi], intencion };
          /* Tres cartas DIFERENTES, como sacarTres() entrega: os saltos de 26 e 52
           * varrem o baralho inteiro nas tres posicoes sem repetir carta. */
          const tirada = [
            { carta: CARTAS[k], invertida },
            { carta: CARTAS[(k + 26) % CARTAS.length], invertida: !invertida },
            { carta: CARTAS[(k + 52) % CARTAS.length], invertida },
          ];
          const r = leer(respuestas, tirada);
          leituras += 1;
          const ctx = `${respuestas.corte}/${cuando}/${respuestas.hoy}/${intencion} carta=${CARTAS[k].id} inv=${invertida}`;

          assert.equal(r.posiciones.length, 3, `${ctx}: nao vieram 3 posicoes`);

          for (const p of r.posiciones) {
            for (const campo of OBRIGATORIOS) {
              assert.equal(typeof p[campo], 'string', `${ctx}: ${p.clave}.${campo} nao e string`);
              assert.ok(p[campo].trim().length > 0, `${ctx}: ${p.clave}.${campo} vazio`);
            }
            for (const campo of OPCIONAIS) {
              const v = p[campo];
              assert.ok(
                v === null || (typeof v === 'string' && v.trim().length > 0),
                `${ctx}: ${p.clave}.${campo} tem de ser null ou string com texto, veio ${JSON.stringify(v)}`
              );
            }
            /* Marcador nao interpolado de datos/textos.js: t() deixa "{x}" na tela
             * de proposito, para o QA ver. Aqui isso e falha. */
            assert.ok(!/\{[a-z]+\}/i.test(p.texto), `${ctx}: ${p.clave} tem marcador nao interpolado`);
            assert.ok(p.parrafos.length >= 2, `${ctx}: ${p.clave} saiu com menos de 2 paragrafos`);
            assert.equal(p.texto, p.parrafos.join('\n\n'), `${ctx}: ${p.clave}.texto nao bate com parrafos`);
            assert.equal(typeof p.invertida, 'boolean', `${ctx}: ${p.clave}.invertida nao e boolean`);
            assert.ok(p.carta.id && p.carta.nombre, `${ctx}: ${p.clave} sem id ou nome de carta`);
            assert.ok(Array.isArray(p.carta.claves), `${ctx}: ${p.clave}.carta.claves nao e array`);
          }

          const s = r.sintesis;
          for (const campo of ['titulo', 'saludo', 'metodo']) {
            assert.equal(typeof s[campo], 'string', `${ctx}: sintesis.${campo} nao e string`);
            assert.ok(s[campo].trim().length > 0, `${ctx}: sintesis.${campo} vazio`);
          }
          assert.equal(s.bloques.length, 3, `${ctx}: a sintese precisa dos 3 blocos`);
          for (const b of s.bloques) {
            assert.ok(b.rotulo.trim().length > 0, `${ctx}: bloco ${b.clave} sem rotulo`);
            assert.ok(b.texto.trim().length > 0, `${ctx}: bloco ${b.clave} sem texto`);
            assert.ok(!/\{[a-z]+\}/i.test(b.texto), `${ctx}: bloco ${b.clave} com marcador nao interpolado`);
          }
          assert.ok(s.accion.nota.trim().length > 0, `${ctx}: a acao saiu sem nota`);

          for (const chave of ['contactoDuro', 'contactoAplicado', 'futuroAplicado', 'lenteMarcada']) {
            assert.equal(typeof r.filtros[chave], 'boolean', `${ctx}: filtros.${chave} nao e boolean`);
          }
        }
      }
    }
  }

  assert.equal(leituras, CORTES.length * HOYS.length * CARTAS.length * 2, 'contagem de leituras errada');
  assert.equal(leituras, 3900, 'o produto cartesiano mudou de tamanho');
  /* P3 e P5 giram por indice: se o giro parar de cobrir as 5 opcoes, metade das
   * tabelas do motor deixa de ser testada sem ninguem perceber. */
  assert.equal(vistos.cuando.size, CUANDOS.length, 'o giro de P3 nao cobriu as 5 opcoes');
  assert.equal(vistos.intencion.size, INTENCIONES.length, 'o giro de P5 nao cobriu as 5 opcoes');
});

/* =================================================================================
 * 6. INVARIANTES DE PRODUTO QUE SO O MOTOR PODE QUEBRAR
 * ================================================================================= */

test('6a. o nome da usuaria aparece exatamente UMA vez em toda a leitura', () => {
  /* O contrato diz uma aparicao, no saludo. Se o motor emitir o nome em outro
   * campo, a tela vai reimprimi-lo e a leitura vira mala direta. */
  const NOME = 'Zorayda';
  const r = leer({ nombre: NOME }, tresIguais(CARTAS[3], false));
  const inteiro = JSON.stringify(r);
  const ocorrencias = inteiro.split(NOME).length - 1;
  assert.equal(ocorrencias, 1, `o nome aparece ${ocorrencias} vezes no retorno inteiro`);
  assert.ok(r.sintesis.saludo.includes(NOME), 'o nome tem de estar no saludo');
  assert.equal(r.nombre, undefined, 'nao pode haver campo `nombre` solto para a tela reimprimir');
});

test('6b. sem nome valido, o saludo nao vira uma virgula solta', () => {
  for (const nombre of [undefined, null, '', '   ', 42, 'a'.repeat(25)]) {
    const r = leer({ nombre }, tresIguais(CARTAS[3], false));
    assert.ok(r.sintesis.saludo.trim().length > 0, `saludo vazio para ${JSON.stringify(nombre)}`);
    assert.ok(
      !/^\s*[,.]/.test(r.sintesis.saludo),
      `saludo comeca com pontuacao (nome interpolado vazio) para ${JSON.stringify(nombre)}`
    );
    assert.ok(!/\{nombre\}/.test(r.sintesis.saludo), 'o marcador {nombre} vazou para a tela');
  }
});

test('6c. o motor e puro: mesma entrada, mesma saida, e a entrada nao e mutada', () => {
  const respuestas = { ...RESPUESTAS_BASE, hoy: 'cero-contacto' };
  const copia = JSON.parse(JSON.stringify(respuestas));
  const tirada = tresIguais(CARTAS[11], true);

  const a = componerLectura({ respuestas, tirada });
  const b = componerLectura({ respuestas, tirada });
  assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), 'o motor nao e deterministico');
  assert.deepEqual(respuestas, copia, 'o motor mutou as respostas recebidas');
});

test('6d. o retorno vem congelado: a tela nao consegue reescrever a leitura por engano', () => {
  const r = leer({}, tresIguais(CARTAS[0], false));
  assert.ok(Object.isFrozen(r), 'o retorno nao esta congelado');
  assert.ok(Object.isFrozen(r.posiciones), 'posiciones nao esta congelado');
  assert.ok(Object.isFrozen(r.posiciones[0]), 'a posicao nao esta congelada');
  assert.ok(Object.isFrozen(r.sintesis), 'sintesis nao esta congelada');
});

test('6e. id de resposta desconhecido cai na entrada generica, sem quebrar e sem buraco', () => {
  /* Toda tabela do motor tem 'generica'. Uma tela que gravar um id errado entrega
   * a leitura mais fraca — nunca uma tela em branco. */
  const r = leer(
    { corte: 'nao-existe', cuando: 'nao-existe', hoy: 'nao-existe', intencion: 'nao-existe' },
    tresIguais(CARTAS[0], false)
  );
  assert.equal(r.posiciones.length, 3);
  assert.equal(r.completa, false, 'id invalido nao pode contar como onboarding completo');
  for (const p of r.posiciones) {
    assert.ok(p.texto.trim().length > 0, `${p.clave} vazio com id desconhecido`);
  }
  assert.ok(r.sintesis.accion.texto.trim().length > 0, 'acao vazia com id desconhecido');
});

test('6f. as 7 perguntas do onboarding continuam sendo as que o motor le', () => {
  /* Amarra o motor ao contrato de datos/preguntas.js. Se alguem acrescentar ou
   * renomear uma pergunta, este teste avisa antes de a leitura silenciosamente
   * passar a ler o fallback generico.
   *
   * As DUAS ULTIMAS entraram em 01/09 e o motor de leitura nao le nenhuma delas:
   * 'nacimiento' vira signo e idade (lib/signo.js) para o plano, e 'genero'
   * escolhe a versao do fechamento da leitura profunda. Elas aparecem aqui
   * porque a lista e o contrato do ARQUIVO, e porque onboardingCompleto() — que
   * decide `completa` — varre todas. */
  assert.deepEqual(PREGUNTAS.map((p) => p.id), [
    'nombre', 'corte', 'cuando', 'hoy', 'intencion', 'nacimiento', 'genero',
  ]);
  for (const ids of [CORTES, CUANDOS, HOYS, INTENCIONES]) {
    assert.equal(ids.length, 5, 'cada pergunta de opcao tem 5 opcoes');
  }
});
