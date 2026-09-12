// Portao do RITUAL DE SETE DIAS — motor (lib/ritual.js) e conteudo (datos/ritual.js).
//
// E teste de MUTACAO, no molde de test/almacen.test.js: storage injetado, datas
// passadas na mao, e cada assercao escolhida para que uma regra quebrada de
// verdade derrube o teste. Teste que passa com a regra quebrada nao serve aqui,
// e neste arquivo em particular as "regras" nao sao detalhe de implementacao —
// sao o produto:
//
//   1. um passo por dia local, ligado por omissao;
//   2. faltar nao pune, e o retorno de quem sumiu e MUDO;
//   3. relogio para tras nao anda e nao regride;
//   4. o dia 7 devolve a linha do dia 1 VERBATIM, sem reescrever;
//   5. nenhum gesto empurra a usuaria para fora (procurar, escrever, ligar);
//   6. nenhum texto promete desfecho nem fala do futuro da outra pessoa.
//
// As guardas 5 e 6 usam sugiereContacto() e hablaDelFuturo() de lib/lectura.js —
// as MESMAS do motor de leitura, e nao uma copia. Se a doutrina apertar la, ela
// aperta aqui no mesmo commit; uma copia local envelheceria em silencio, que e
// exatamente como um portao para de proteger sem nunca ficar vermelho.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import * as CONTENIDO from '../madremaria/datos/ritual.js';
import { PREGUNTAS } from '../madremaria/datos/preguntas.js';
import { T, existe } from '../madremaria/datos/textos.js';
import { _inyectarAlmacenParaTests, _reiniciarParaTests } from '../madremaria/lib/almacen.js';
import { hablaDelFuturo, sugiereContacto } from '../madremaria/lib/lectura.js';
import {
  CLAVES_TEXTO_RITUAL,
  CLAVE_RITUAL,
  DURACION,
  MOTIVOS,
  cierreDelRitual,
  concluirDia,
  diaActual,
  diasHechos,
  espejoDelDia1,
  fechasHechas,
  leerRitual,
  puedeConcluir,
  reiniciarRitual,
  resumenRitual,
} from '../madremaria/lib/ritual.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

/* FUSAO COSMIC GUIDE: a raiz do app da Madre deixou de ser a raiz do repo —
 * ela agora mora em madremaria/. Tudo que este arquivo le por RAIZ (lib/,
 * datos/, screens/) esta la dentro. */
const RAIZ = join(__dirname, '..', 'madremaria');

/* =================================================================================
 * FERRAMENTAS
 * ================================================================================= */

// Mesmo storage falso de test/almacen.test.js: um Map com o disco a vista. Aqui
// ele serve para duas coisas que um mock generico nao daria — ler a string CRUA
// gravada (e provar que uma tentativa bloqueada nao escreveu nada) e plantar um
// estado corrompido antes de o motor abrir os olhos.
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

const CLAVE_DISCO = `mm-hr.${CLAVE_RITUAL}`;

function nuevoDisco() {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);
  return falso;
}

function plantar(falso, estado) {
  falso.disco.set(CLAVE_DISCO, JSON.stringify(estado));
}

/* Percorre qualquer forma — objeto, array, string — e devolve { ruta, texto }.
 * E recursivo de proposito: o formato de um dia ainda esta se assentando
 * (`lectura`/`abertura`, `gesto.texto`/`gesto.cuerpo`, `cierre`, `placeholder`)
 * e um portao que listasse campos na mao pararia de varrer o campo novo no dia
 * em que ele nascesse — sem ninguem perceber, porque continuaria verde. */
function cadenas(valor, ruta, salida = []) {
  if (typeof valor === 'string') {
    if (valor.trim()) salida.push({ ruta, texto: valor });
    return salida;
  }
  if (Array.isArray(valor)) {
    valor.forEach((v, i) => cadenas(v, `${ruta}[${i}]`, salida));
    return salida;
  }
  if (valor && typeof valor === 'object') {
    for (const k of Object.keys(valor)) cadenas(valor[k], `${ruta}.${k}`, salida);
    return salida;
  }
  return salida;
}

/** Todo texto exportado por datos/ritual.js, venha do campo que vier. */
function cadenasDelContenido() {
  const salida = [];
  for (const nombre of Object.keys(CONTENIDO)) {
    if (nombre === 'default') continue; // e o mesmo objeto de RITUAL
    if (typeof CONTENIDO[nombre] === 'function') continue;
    cadenas(CONTENIDO[nombre], nombre, salida);
  }
  return salida;
}

/* A copy DAS TELAS do ritual: o bloco `ritual.*` de datos/textos.js, pela lista
 * fechada que lib/ritual.js exporta.
 *
 * ESTE ERA O BURACO DO PORTAO, e ele era grande: ate aqui todas as varreduras
 * deste arquivo liam so datos/ritual.js (os sete dias). As frases que a usuaria
 * mais le — 'O dia {n} abre amanha', o porque da trava, o rodape do espelho, o
 * fim do ritual — moram no OUTRO arquivo, aquele cujo proprio comentario avisa
 * ser "o lugar onde e facil escorregar para o castigo". Nada varria aquele bloco:
 * test/copy.test.js passa por datos/textos.js, mas so com padroes de desfecho,
 * genero, saude, streak e prova social — nenhum deles pega "so faltam tres dias",
 * "voce interrompeu" ou "nao desista agora". A regra existia em comentario nos
 * dois arquivos e em portao nenhum. */
function cadenasDeTelas() {
  const salida = [];
  for (const clave of CLAVES_TEXTO_RITUAL) {
    cadenas(T[clave], `textos.js:${clave}`, salida);
  }
  return salida;
}

/** Tudo o que o ritual escreve: os sete dias E a copy das telas. */
function todasLasCadenas() {
  return [...cadenasDelContenido(), ...cadenasDeTelas()];
}

/** So os gestos dos sete dias — o campo que manda a usuaria fazer alguma coisa. */
function cadenasDeGestos() {
  const salida = [];
  CONTENIDO.DIAS.forEach((dia) => {
    cadenas(dia.gesto, `DIAS[dia ${dia.dia}].gesto`, salida);
  });
  return salida;
}

function varrer(entradas, padroes, mensagem) {
  const achados = [];
  for (const { ruta, texto } of entradas) {
    for (const padrao of padroes) {
      const m = texto.match(padrao);
      if (m) achados.push(`${ruta}: "${m[0]}" (${padrao})`);
    }
  }
  assert.deepEqual(achados, [], `${mensagem}\n  ${achados.join('\n  ')}`);
}

/* =================================================================================
 * 1. UM PASSO POR DIA — concluir o dia 3 nao libera o dia 4 na mesma noite.
 *
 * MUTACAO que este teste pega: trocar o default de `unoPorDia` para false;
 * comparar a data com `>=` em vez de `<= 0`; ou "sanar" a trava deixando passar
 * quando o dia pedido e o proximo. Sem esta trava, os sete dias sao lidos em
 * vinte minutos e o formato inteiro deixa de existir.
 * ================================================================================= */
test('um passo por dia: concluir o dia 3 nao libera o dia 4 no mesmo dia', async () => {
  const falso = nuevoDisco();

  assert.equal((await concluirDia(1, { hoy: '2026-09-01', nota: 'a linha do dia 1' })).ok, true);
  assert.equal((await concluirDia(2, { hoy: '2026-09-02' })).ok, true);
  assert.equal((await concluirDia(3, { hoy: '2026-09-03' })).ok, true);

  // A trava vem LIGADA sem ninguem pedir: nenhuma opcao foi passada aqui.
  assert.deepEqual(await puedeConcluir(4, { hoy: '2026-09-03' }), {
    ok: false,
    motivo: MOTIVOS.YA_HECHO_HOY,
  });

  const bloqueado = await concluirDia(4, { hoy: '2026-09-03', nota: 'TENTATIVA-NO-MESMO-DIA' });
  assert.equal(bloqueado.ok, false);
  assert.equal(bloqueado.motivo, MOTIVOS.YA_HECHO_HOY);

  // Bloqueado quer dizer que NADA foi gravado — nem o passo, nem a nota. Um
  // motor que escrevesse antes de checar passaria na assercao de cima e mesmo
  // assim teria sujado o disco.
  const estado = await leerRitual();
  assert.equal(diasHechos(estado), 3);
  assert.equal(diaActual(estado), 4);
  assert.equal(falso.disco.get(CLAVE_DISCO).includes('TENTATIVA-NO-MESMO-DIA'), false);

  // No dia seguinte abre sozinho. Nao ha nada a "destravar", nada a comprar.
  const manana = await concluirDia(4, { hoy: '2026-09-04' });
  assert.equal(manana.ok, true);
  assert.equal(diasHechos(manana.estado), 4);
});

test('o dia de amanha tambem nao se antecipa: nao se pula para a frente', async () => {
  nuevoDisco();
  await concluirDia(1, { hoy: '2026-09-01' });

  // Dia seguinte no calendario, mas passo 3 quando o passo de hoje e o 2.
  assert.deepEqual(await puedeConcluir(3, { hoy: '2026-09-02' }), {
    ok: false,
    motivo: MOTIVOS.DIA_ADELANTE,
  });
  assert.equal(diasHechos(await leerRitual()), 1);
});

test('o flag permissivo existe so para QA, e nunca e o padrao', async () => {
  nuevoDisco();
  await concluirDia(1, { hoy: '2026-09-01' });

  // Com o flag explicito, o mesmo dia passa...
  assert.equal((await concluirDia(2, { hoy: '2026-09-01', unoPorDia: false })).ok, true);
  // ...e sem ele, nao. Se o default virar permissivo, esta linha cai.
  assert.equal((await concluirDia(3, { hoy: '2026-09-01' })).motivo, MOTIVOS.YA_HECHO_HOY);
});

/* =================================================================================
 * 2. FALTAR NAO PUNE — e o retorno e MUDO.
 *
 * A parte dificil deste teste nao e provar que o progresso sobrevive: e provar
 * a OMISSAO. O app nao pode ganhar, meses depois, um "voce ficou 3 dias fora",
 * um badge, um aviso ou um reset. Por isso o teste compara o resumo de quem
 * voltou depois de UM dia com o de quem voltou depois de TRINTA: fora as datas,
 * tem de ser o mesmo objeto. Qualquer campo novo que reaja a ausencia — um
 * contador, uma flag, um motivo diferente — quebra aqui.
 * ================================================================================= */
test('faltar tres dias retoma no dia seguinte ao ultimo feito, e nao zera nada', async () => {
  nuevoDisco();
  const NOTA = 'no dia 1 eu escrevi isto';

  await concluirDia(1, { hoy: '2026-09-01', nota: NOTA });
  await concluirDia(2, { hoy: '2026-09-02' });
  // 03, 04 e 05 passam em branco.

  const resumo = await resumenRitual({ hoy: '2026-09-06' });
  assert.equal(resumo.diasHechos, 2, 'o que ela fez continua feito');
  assert.equal(resumo.diaActual, 3, 'retoma no 3, nunca no 1');
  assert.equal(resumo.paso.dia, 3);
  assert.equal(resumo.bloqueadoHoy, false);
  assert.equal(resumo.motivo, null, 'voltar depois de sumir nao e um estado de erro');

  const r = await concluirDia(3, { hoy: '2026-09-06' });
  assert.equal(r.ok, true);
  assert.deepEqual(fechasHechas(r.estado), ['2026-09-01', '2026-09-02', '2026-09-06']);
  assert.equal((await espejoDelDia1()).texto, NOTA, 'a linha do dia 1 atravessou a ausencia');
});

test('o retorno e mudo: sumir um dia e sumir trinta dao o mesmo resumo', async () => {
  const sinFechas = (r) => {
    const { ultimaFecha, fechas, estado, ...resto } = r;
    return resto;
  };

  nuevoDisco();
  await concluirDia(1, { hoy: '2026-09-01' });
  const volviendoAlDiaSiguiente = sinFechas(await resumenRitual({ hoy: '2026-09-02' }));

  nuevoDisco();
  await concluirDia(1, { hoy: '2026-09-01' });
  const volviendoUnMesDespues = sinFechas(await resumenRitual({ hoy: '2026-10-01' }));

  assert.deepEqual(
    volviendoUnMesDespues,
    volviendoAlDiaSiguiente,
    'quem sumiu um mes tem de encontrar exatamente a mesma tela de quem voltou no dia seguinte: '
      + 'nenhum contador de ausencia, nenhum aviso, nenhum motivo diferente'
  );
});

test('o resumo nao tem campo nenhum sobre ausencia', async () => {
  nuevoDisco();
  await concluirDia(1, { hoy: '2026-09-01' });
  const resumo = await resumenRitual({ hoy: '2026-10-01' });

  // Lista fechada de propriedades: um campo novo obriga a passar por aqui, e o
  // lugar de decidir se ele pune a falta e a revisao deste teste, nao o render.
  assert.deepEqual(Object.keys(resumo).sort(), [
    'bloqueadoHoy',
    'completo',
    'diaActual',
    'diasHechos',
    'empezado',
    'estado',
    'fechas',
    'motivo',
    'nudos',
    'paso',
    'proximoNudo',
    'ultimaFecha',
  ]);
});

test('nao existe funcao de recuperar o que passou em branco', () => {
  const fuente = readFileSync(join(RAIZ, 'lib', 'ritual.js'), 'utf8')
    .split('\n')
    .filter((l) => {
      const t = l.trim();
      return !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
    })
    .join('\n');

  // `reiniciarRitual` (refazer do zero, para quem terminou) e legitimo e passa.
  // O que nao pode existir e escudo, resgate, recuperacao ou expiracao — o
  // "recuperar sequencia pagando" do app que serviu de molde, que aqui esta
  // vetado por escrito desde lib/hilo.js.
  varrer(
    [{ ruta: 'lib/ritual.js', texto: fuente }],
    [/\bescudo\b/i, /\brescatar\b/i, /\brecuperar\b/i, /\bexpirar?\b/i, /\bcaduc/i, /\bpenaliza/i],
    'Mecanica de punicao ou de resgate no motor do ritual.'
  );
});

/* =================================================================================
 * 3. RELOGIO PARA TRAS — nem anda, nem regride.
 *
 * MUTACAO que este teste pega, e e a mais provavel de todas: trocar a
 * comparacao de datas por igualdade de string (`ultima === hoy`). Com igualdade,
 * uma data guardada no FUTURO nao casa com nada, a trava abre sozinha e a pessoa
 * faz varios passos numa noite. Pega tambem o "conserto" oposto — reancorar a
 * data para hoje —, que reescreveria a data de um passo que ela ja deu, que e
 * justamente o dado que o dia 7 devolve.
 * ================================================================================= */
test('data salva no futuro: o estado nao anda nem regride', async () => {
  const falso = nuevoDisco();
  plantar(falso, {
    v: 1,
    hechos: [{ dia: 1, fecha: '2026-09-10', nota: 'linha escrita com o relogio adiantado' }],
  });
  const discoAntes = falso.disco.get(CLAVE_DISCO);

  const resumo = await resumenRitual({ hoy: '2026-09-01' });
  assert.equal(resumo.diasHechos, 1, 'nao regride: o passo dado continua dado');
  assert.equal(resumo.diaActual, 2);
  assert.equal(resumo.bloqueadoHoy, true, 'e nao anda: a trava de um-por-dia vale');

  const r = await concluirDia(2, { hoy: '2026-09-01', nota: 'TENTATIVA-COM-RELOGIO-ATRASADO' });
  assert.equal(r.ok, false);
  assert.equal(r.motivo, MOTIVOS.YA_HECHO_HOY);

  assert.equal(
    falso.disco.get(CLAVE_DISCO),
    discoAntes,
    'o disco tem de ficar byte a byte como estava: nem passo novo, nem data reancorada'
  );
  assert.equal((await espejoDelDia1()).fecha, '2026-09-10', 'a data dela nao se reescreve');
});

test('disco corrompido se corrige para baixo, sem apagar o que ela fez', async () => {
  const falso = nuevoDisco();
  plantar(falso, {
    v: 1,
    hechos: [
      { dia: 1, fecha: '2026-09-01', nota: 'primeira' },
      { dia: 2, fecha: '2026-09-02', nota: 'segunda' },
      { dia: 5, fecha: '2026-09-05', nota: 'ESTE DIA NAO PODIA EXISTIR' },
      { dia: 3, fecha: '2026-13-45', nota: 'data impossivel' },
    ],
  });

  const estado = await leerRitual();
  assert.equal(diasHechos(estado), 2, '{1,2,5} vira {1,2}: nao se pula dia neste ritual');
  assert.deepEqual(fechasHechas(estado), ['2026-09-01', '2026-09-02']);
  assert.equal(JSON.stringify(estado).includes('ESTE DIA NAO PODIA EXISTIR'), false);
  assert.equal((await espejoDelDia1()).texto, 'primeira', 'e o que ela fez de verdade fica');
});

test('estado ilegivel nao lanca e nao trava a tela', async () => {
  const falso = nuevoDisco();
  falso.disco.set(CLAVE_DISCO, '{isto nao e json');

  const resumo = await resumenRitual({ hoy: '2026-09-01' });
  assert.equal(resumo.diasHechos, 0);
  assert.equal(resumo.diaActual, 1);
  assert.equal(await espejoDelDia1(), null);
});

/* =================================================================================
 * 4. O ESPELHO DO DIA 7 — verbatim, sem reescrever.
 *
 * A cena mais forte do produto e tambem a mais facil de estragar: basta alguem
 * "limpar" o texto no caminho. Por isso a nota deste teste traz espaco na borda,
 * quebra de linha, aspas, travessao, emoji, acento — e, de proposito, frases que
 * as guardas de copy do app reprovariam. As guardas existem para o que o APP
 * diz; o que ELA diz nunca passa por filtro. Editar a palavra dela e a versao
 * silenciosa de mentir sobre o passado dela.
 * ================================================================================= */
const NOTA_DIA_1 =
  '  Ele disse que ia voltar em janeiro.\n"Depois a gente conversa" — foi isso. 🧵\n\tE eu ainda espero.  ';

test('o dia 7 devolve exatamente o texto gravado no dia 1', async () => {
  nuevoDisco();

  await concluirDia(1, { hoy: '2026-09-01', nota: NOTA_DIA_1 });
  for (let d = 2; d <= DURACION; d += 1) {
    const r = await concluirDia(d, { hoy: `2026-09-0${d}`, nota: `nota do dia ${d}` });
    assert.equal(r.ok, true, `o dia ${d} devia ter passado`);
  }

  const estado = await leerRitual();
  assert.equal(diasHechos(estado), DURACION);
  assert.equal(diaActual(estado), null, 'no oitavo dia nao ha oitavo dia');

  const espejo = await espejoDelDia1();
  // strictEqual e nao includes: trim, normalizacao de espaco, corte no limite e
  // troca de aspas passariam por um includes e sao exatamente o que se proibe.
  assert.strictEqual(espejo.texto, NOTA_DIA_1);
  assert.strictEqual(espejo.fecha, '2026-09-01', 'a data e a do dia 1, nao a de hoje');

  const cierre = await cierreDelRitual();
  assert.equal(cierre.conEspejo, true);
  assert.strictEqual(cierre.texto, NOTA_DIA_1);
  assert.strictEqual(cierre.fecha, '2026-09-01');
  assert.equal(cierre.plantilla.includes('{fecha}'), true, 'a data entra por interpolacao');
});

test('nota longa nao e truncada: cortar o texto dela e reescrever o texto dela', async () => {
  nuevoDisco();
  const LARGA = `${'a'.repeat(1200)} fim`;
  await concluirDia(1, { hoy: '2026-09-01', nota: LARGA });
  assert.strictEqual((await espejoDelDia1()).texto, LARGA);
});

test('sem linha no dia 1, o dia 7 tem versao propria em vez de quebrar', async () => {
  nuevoDisco();
  // So tocou nos botoes: nenhuma nota, e uma so de espaco em branco.
  await concluirDia(1, { hoy: '2026-09-01', nota: '   \n  ' });
  for (let d = 2; d <= DURACION; d += 1) await concluirDia(d, { hoy: `2026-09-0${d}` });

  assert.equal(await espejoDelDia1(), null);
  const cierre = await cierreDelRitual();
  assert.equal(cierre.conEspejo, false);
  assert.equal(typeof cierre.plantilla, 'string');
  assert.equal(cierre.plantilla.trim().length > 0, true, 'a melhor cena nao pode sair vazia');
  assert.equal(fechasHechas(await leerRitual()).length, DURACION, 'as sete datas continuam la');
});

test('reiniciar apaga o ritual inteiro, inclusive o texto dela', async () => {
  const falso = nuevoDisco();
  await concluirDia(1, { hoy: '2026-09-01', nota: NOTA_DIA_1 });
  await reiniciarRitual();

  assert.equal(falso.disco.has(CLAVE_DISCO), false);
  assert.equal(await espejoDelDia1(), null);
  assert.equal(diasHechos(await leerRitual()), 0);
});

test('a chave do ritual esta na lista que o "Borrar todo" percorre', () => {
  const fuente = readFileSync(join(RAIZ, 'screens', 'AjustesScreen.js'), 'utf8');
  const bloque = fuente.match(/CLAVES_HILO_ROJO\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/);
  assert.ok(bloque, 'CLAVES_HILO_ROJO sumiu de screens/AjustesScreen.js');
  assert.equal(
    new RegExp(`['"\`]${CLAVE_RITUAL}['"\`]|CLAVE_RITUAL`).test(bloque[1]),
    true,
    `A chave '${CLAVE_RITUAL}' guarda texto livre sobre a vida amorosa da usuaria. Fora de `
      + 'CLAVES_HILO_ROJO ela sobrevive ao "Borrar todo", e a politica de privacidade da ficha '
      + 'de loja vira declaracao falsa.'
  );
});

/* =================================================================================
 * 5. OS GESTOS NAO EMPURRAM PARA FORA
 *
 * O gesto herdado do funil ("evite enviar mensagens") e a peca mais eficaz e a
 * mais escorregadia do formato: dito como regra vira proibicao e culpa, e
 * insinua que nao procurar age sobre a outra pessoa. So passa como convite
 * reversivel e sobre ela.
 * ================================================================================= */
test('nenhum gesto sugere procurar, escrever, ligar ou insistir', () => {
  const gestos = cadenasDeGestos();
  assert.equal(
    CONTENIDO.DIAS.length,
    DURACION,
    'o ritual tem de ter os sete dias escritos ANTES de existir tela'
  );
  assert.equal(gestos.length >= DURACION, true, 'cada um dos sete dias precisa de um gesto');

  const achados = gestos
    .filter(({ texto }) => sugiereContacto(texto))
    .map(({ ruta, texto }) => `${ruta}: "${texto}"`);

  assert.deepEqual(
    achados,
    [],
    'Gesto que empurra a usuaria para fora. O gesto do dia depende SO dela — gesto que '
      + 'depende de terceiro pode "falhar", e ritual que falha vira culpa.\n  '
      + achados.join('\n  ')
  );
});

test('nenhum texto do ritual fala pela outra pessoa nem pede contato', () => {
  const achados = todasLasCadenas()
    .filter(({ texto }) => sugiereContacto(texto))
    .map(({ ruta, texto }) => `${ruta}: "${texto}"`);
  assert.deepEqual(achados, [], `Pedido de contato no conteudo do ritual.\n  ${achados.join('\n  ')}`);
});

/* =================================================================================
 * 6. NENHUMA PROMESSA DE DESFECHO, NENHUM FUTURO DA OUTRA PESSOA
 * ================================================================================= */
test('nenhum texto do ritual fala do futuro', () => {
  const achados = todasLasCadenas()
    .filter(({ texto }) => hablaDelFuturo(texto))
    .map(({ ruta, texto }) => `${ruta}: "${texto}"`);
  assert.deepEqual(
    achados,
    [],
    `O ritual descreve o dia de hoje e devolve um gesto. Nunca o que vem depois.\n  ${achados.join('\n  ')}`
  );
});

test('nenhum texto promete desfecho', () => {
  varrer(
    todasLasCadenas(),
    [
      /\bvoltar[aá]\b/i,
      /\bvai voltar\b/i,
      /\bvai te (procurar|buscar|chamar|ligar)\b/i,
      /\bcom certeza (volta|vai)\b/i,
      /\bvai dar certo\b/i,
      /\bgarante(mos)? que\b/i,
      /\bfuncion(a|ou) (mesmo|de verdade)\b/i,
    ],
    'Promessa de desfecho no ritual. O desejo dela e legitimo e o app nao o nega — mas nao o promete.'
  );
});

test('o ritual nunca age sobre a outra pessoa', () => {
  varrer(
    todasLasCadenas(),
    [
      /\b(atrai|atrair|chamar de volta|amarra|amarrar|aproxima|aproximar)\b/i,
      /\bfaz? (com que )?(ele|ela|essa pessoa)\b/i,
      /\bpara que (ele|ela|essa pessoa)\b/i,
      /\benergia (dele|dela|de volta)\b/i,
      /\btrabalho espiritual\b/i,
    ],
    'O ritual passou a agir sobre alguem. Ele e sobre ela: clareza, decisao, o que esta nas maos dela.'
  );
});

test('faltar um dia nao estraga nada, e o texto nao diz o contrario', () => {
  varrer(
    todasLasCadenas(),
    [
      /\bn[ãa]o perca\b/i,
      /\bvoc[êe] perde(u)?\b/i,
      /\bestraga\b/i,
      /\bfundamental para o (sucesso|resultado)\b/i,
      /\bse (voc[êe] )?falhar\b/i,
      /\bcomece de novo do (dia 1|zero)\b/i,
      /\bvolte amanh[ãa] para n[ãa]o\b/i,
    ],
    'Culpa condicional. Faltar um dia nao tira nada de ninguem, e o texto nao pode insinuar que tira.'
  );
});

/* =================================================================================
 * A SEGUNDA FORMA DE VIRAR O FUNIL: CULPA E PRESSAO
 *
 * A primeira forma e a promessa ("ele vai voltar"), e ela ja tem portao. A
 * segunda nao tinha nenhum, e e a que sobrevive a qualquer revisao de vocabulario
 * magico: um app que nunca promete nada, mas que mede a pessoa todo dia pelo que
 * ela ainda NAO fez. Sao quatro familias, e cada uma esta aqui porque e barata de
 * escrever e cara de desfazer:
 *
 *   1. FALTA COM TOM DE CASTIGO — "voce interrompeu", "voce faltou", "comece de
 *      novo". Faltar aqui nao tira nada de ninguem; texto que diga o contrario
 *      esta mentindo sobre o proprio motor (lib/ritual.js retoma no dia em que
 *      ela parou, e nada zera).
 *   2. CONTAGEM REGRESSIVA — "so faltam tres dias", "faltam 2 noites". Mede pelo
 *      que ainda nao existe. Ja proibida por escrito para as conquistas em
 *      datos/textos.js; a mesma regra vale para os sete dias, e o doc de
 *      proximoNudo em lib/ritual.js chegou a prescrever exatamente isso.
 *   3. URGENCIA FABRICADA — prazo, vaga, janela que fecha, ultima chance. Nao ha
 *      nenhum prazo real neste produto: o ritual espera parado por tempo
 *      indeterminado, entao qualquer relogio na tela seria inventado.
 *   4. COBRANCA DE CONSTANCIA — "nao desista", "todos os dias sem falhar". O app
 *      acompanha; nao cobra.
 *
 * A varredura cobre os sete dias E a copy das telas (ver cadenasDeTelas). O
 * portao antigo lia so datos/ritual.js, e nenhuma destas frases jamais nasceria
 * la: elas nascem no bloco `ritual.*` de datos/textos.js, que ate agora nenhum
 * teste do repositorio olhava com estes olhos.
 * ================================================================================= */
test('nenhuma culpa e nenhuma pressao: nem falta punida, nem contagem, nem prazo', () => {
  varrer(
    todasLasCadenas(),
    [
      // 1. a falta com tom de castigo
      /\bvoc[êe] (faltou|interrompeu|abandonou|desistiu|parou)\b/i,
      /\bdias? (fora|sem vir|perdidos?|em falta)\b/i,
      /\bficou (tempo )?sem vir\b/i,
      /\bcomece (tudo )?de novo\b/i,
      /\bdo zero\b/i,
      /\bperdeu o (dia|passo|progresso)\b/i,
      /\bficou para tr[áa]s\b/i,
      // 2. a contagem regressiva
      /\bs[óo] faltam?\b/i,
      /\bfaltam? \d/i,
      /\bfaltam? (um|dois|tr[êe]s|quatro|cinco|seis|sete) (dias?|noites?|passos?)\b/i,
      /\brestam?\b/i,
      /\bcontagem regressiva\b/i,
      // 3. a urgencia fabricada
      /\b[úu]ltima chance\b/i,
      /\b[úu]ltimas? vagas?\b/i,
      /\bexpira/i,
      /\bcaduca/i,
      /\bprazo\b/i,
      /\bantes que (feche|acabe|termine)\b/i,
      /\bagora ou\b/i,
      /\bcorra\b/i,
      // 4. a cobranca de constancia
      /\bn[ãa]o desista\b/i,
      /\bn[ãa]o pule\b/i,
      /\bsem falhar\b/i,
      /\btodos os dias sem\b/i,
      /\bmantenha (a sua|sua|o seu|seu) (sequ[êe]ncia|constancia|const[âa]ncia|ritmo)\b/i,
      /\bpara (isso )?(dar|funcionar|valer) (certo )?voc[êe] precisa\b/i,
    ],
    'Culpa ou pressao no ritual. O app ACOMPANHA: ele conta o que ela fez, e nunca o que '
      + 'falta, nunca o que ela deixou de fazer e nunca um relogio que nao existe.'
  );
});

/* Chave morta vira texto cru na tela — e, pior neste caso, tira a frase da
 * varredura acima sem que nada fique vermelho. */
test('a lista de copy das telas do ritual aponta so para chaves que existem', () => {
  const mortas = CLAVES_TEXTO_RITUAL.filter((clave) => !existe(clave));
  assert.deepEqual(mortas, [], `Chaves de datos/textos.js que nao existem: ${mortas.join(', ')}`);

  // E o contrario: chave `ritual.*` que nasceu em datos/textos.js e ficou de fora
  // da lista nao seria varrida por nada.
  const fora = Object.keys(T).filter(
    (clave) => clave.startsWith('ritual.') && !CLAVES_TEXTO_RITUAL.includes(clave)
  );
  assert.deepEqual(
    fora,
    [],
    'Chave do bloco `ritual.*` fora de CLAVES_TEXTO_RITUAL (lib/ritual.js): ela e desenhada '
      + `na tela e nao passa por portao nenhum.\n  ${fora.join('\n  ')}`
  );
});

test('nenhuma alegacao de saude — nem o efeito do gesto', () => {
  varrer(
    todasLasCadenas(),
    [
      /\bacalma/i,
      /\balivia/i,
      /\bcura(r|ndo)?\b/i,
      /\bansiedade\b/i,
      /\bdepress[ãa]o\b/i,
      /\bte deixa mais (calm|leve|tranquil)/i,
      /\bmelhora (a sua|sua|o seu|seu)\b/i,
    ],
    'Alegacao de saude. Descrever o gesto e permitido; descrever o que ele faz no corpo ou na '
      + 'mente, nao. O revisor da loja le a ficha, nao so o app.'
  );
});

/* =================================================================================
 * O NOME DO NO E FATO CONTAVEL
 *
 * E aqui que a promessa entra sem usar nenhuma palavra proibida, e um lint por
 * lista de palavras nao pega: "Livre", "Renascida", "Pronta", "Voce ja nao
 * espera mais" passam por qualquer regex de vocabulario e afirmam, todos, o que
 * ela VIROU. A armadilha e gramatical, nao lexical.
 * ================================================================================= */
test('todo rotulo de no conta uma coisa contavel, e nunca o que ela virou', () => {
  assert.equal(CONTENIDO.NUDOS.length > 0, true);

  const achados = [];
  for (const nudo of CONTENIDO.NUDOS) {
    assert.equal(Number.isInteger(nudo.marco) && nudo.marco >= 1, true, `marco invalido em ${nudo.id}`);
    assert.equal(nudo.marco <= DURACION, true, `no inalcancavel: ${nudo.id}`);

    const rotulo = String(nudo.rotulo);
    // Estado no lugar de fato: participio de transformacao, ou uma frase que
    // declara o que ela e agora.
    const estado = [
      /\b(curad|livre|liberad|renascid|transformad|iluminad|superad|pronta|nova mulher|outra pessoa)\b/i,
      /\bvoc[êe]\s+(j[áa]\s+)?(n[ãa]o\s+)?(é|e|virou|ficou|se tornou|esta|est[áa])\b/i,
      /\bj[áa] n[ãa]o\b/i,
    ];
    if (estado.some((p) => p.test(rotulo))) achados.push(`${nudo.id}: "${rotulo}"`);
    // E o fato tem de estar la: numero ou quantidade escrita.
    const contavel = /\b(um|uma|dois|duas|tr[êe]s|quatro|cinco|seis|sete|\d+)\b/i.test(rotulo);
    if (!contavel) achados.push(`${nudo.id}: "${rotulo}" nao conta nada (dias, noites, nos)`);
  }

  assert.deepEqual(
    achados,
    [],
    'O no premia o que ela FEZ (voltou, leu, terminou), nunca o que ela virou.\n  '
      + achados.join('\n  ')
  );
});

test('os nos sao derivados da contagem, e nao comemoram duas vezes', async () => {
  nuevoDisco();
  const r1 = await concluirDia(1, { hoy: '2026-09-01' });
  assert.equal(r1.nudosNuevos.length, 1, 'o primeiro no e do dia 1');

  const r2 = await concluirDia(2, { hoy: '2026-09-02' });
  assert.deepEqual(r2.nudosNuevos, [], 'o dia 2 nao recomemora o no do dia 1');

  const r3 = await concluirDia(3, { hoy: '2026-09-03' });
  assert.equal(r3.nudosNuevos.length, 1);

  // Nenhum no e gravado: o disco so tem os dias e as datas.
  const cru = JSON.parse(await (async () => JSON.stringify(await leerRitual()))());
  assert.deepEqual(Object.keys(cru).sort(), ['hechos', 'v']);
});

/* =================================================================================
 * CONTRATO DO CONTEUDO — o dia 7 aponta para a fonte DELA
 * ================================================================================= */
test('cada dia espelha uma pergunta que existe no onboarding', () => {
  const ids = PREGUNTAS.map((p) => p.id);
  const achados = CONTENIDO.DIAS.filter((d) => !ids.includes(d.espeja)).map(
    (d) => `dia ${d.dia}: espeja '${d.espeja}'`
  );
  assert.deepEqual(
    achados,
    [],
    'O analogo do "recibo" aqui e a resposta DELA. Um id que nao existe em datos/preguntas.js '
      + `nao aponta para fonte nenhuma.\n  ${achados.join('\n  ')}`
  );
});

test('os sete dias estao numerados 1..7, sem numero no titulo', () => {
  assert.deepEqual(
    CONTENIDO.DIAS.map((d) => d.dia),
    [1, 2, 3, 4, 5, 6, 7]
  );
  const comNumero = CONTENIDO.DIAS.filter((d) => /\d/.test(d.titulo)).map((d) => d.titulo);
  assert.deepEqual(comNumero, [], 'o numero do dia e DADO; a UI o escreve, o titulo nao');

  _reiniciarParaTests();
});
