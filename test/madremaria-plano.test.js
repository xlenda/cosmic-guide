// Portao do PLANO DO DIA — motor (lib/plano.js), ceu (lib/ceu.js), conteudo
// (datos/plano.js) e a copy de tela (o bloco `plano.*` de datos/textos.js).
//
// E teste de MUTACAO, no molde de test/almacen.test.js e test/ritual.test.js:
// a efemeride e INJETADA (inclusive ausente), as datas sao passadas na mao, e
// cada assercao foi escolhida para que uma regra quebrada de verdade derrube o
// teste. Assercao que continua verde com a regra quebrada nao entra aqui.
//
// AS SETE TRAVAS:
//   1. CEU INDISPONIVEL — com a efemeride fora do ar, planoDoDia AINDA devolve
//      plano completo (ritual + reflexao + afirmacao) e SEM uma linha de ceu.
//      O dia nunca depende do ceu.
//   2. NUNCA FABRICAR — nenhuma aproximacao ("por volta", "aproximadamente",
//      "cerca de", "estimad", "mais ou menos") em campo de ceu. Nem com ceu, nem
//      sem ceu.
//   3. CONTATO DURO — com 'cero-contacto' e 'le-escribi-no-responde', NENHUM
//      campo do plano sugere escrever, ligar, procurar, aparecer ou insistir.
//      Rodado contra os 5 rituais x 7 dias da semana x as 5 respostas de P2.
//   4. CONTATO DURO TRAVA O ENCONTRO — o bloco vem 'travado' com motivo, nunca
//      em 'acao', e sem carregar pedaco nenhum da acao guardado em campo lateral.
//   5. CONTATO ATIVO DESTRAVA — e mesmo destravado, nenhuma frase promete
//      desfecho.
//   6. DETERMINISMO — mesmo dia + mesmas respostas = mesmo plano; zero
//      Math.random nos modulos novos (varrido no fonte).
//   7. ROTACAO — o mesmo ritual nao cai dois dias seguidos e o de camera nao cai
//      todo dia, medido em 60 dias corridos.
//
// A trava 3 usa sugiereContacto() de lib/lectura.js — a MESMA guarda do motor de
// leitura, nao uma copia. Se a doutrina apertar la, ela aperta aqui no mesmo
// commit; uma copia local envelheceria em silencio, que e exatamente como um
// portao para de proteger sem nunca ficar vermelho.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import * as CONTENIDO from '../madremaria/datos/plano.js';
import { AFIRMACOES, ENCONTROS, REFLEXOES, RITUAIS } from '../madremaria/datos/plano.js';
import { IDS_CONTACTO_DURO, PREGUNTAS, getPregunta } from '../madremaria/datos/preguntas.js';
import { RITUAIS as RITUAIS_ROTATIVOS } from '../madremaria/datos/rituais.js';
import { T, existe } from '../madremaria/datos/textos.js';
import {
  FASES,
  _inyectarMotorParaTests,
  _reiniciarCieloParaTests,
  diaDaSemana,
  diasDesdeEpoca,
} from '../madremaria/lib/ceu.js';
import { sugiereContacto } from '../madremaria/lib/lectura.js';
import {
  CLAVES_TEXTO_PLANO,
  ESTADOS_ENCONTRO,
  HORIZONTE_DO_MARCO_DIAS,
  ID_BLOQUEIO,
  MOTIVOS_ENCONTRO,
  _rotacaoDe,
  planoDoDia,
  precisaDeRede,
  ritualSeguroDoDia,
} from '../madremaria/lib/plano.js';
import { ESCALA, FORA_DO_GIRO, TAMANHO_CICLO } from '../madremaria/lib/rituaisRotativos.js';

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

/* SEM EFEMERIDE. `_inyectarMotorParaTests(false)` e o unico jeito de exercitar o
 * caminho que E o produto deste modulo: hoje astronomy-engine esta instalado, e
 * sem este assento o ramo de indisponibilidade nunca rodaria em teste nenhum —
 * apodreceria verde ate o dia em que alguem instalasse um app sem o pacote. */
function semCeu() {
  _inyectarMotorParaTests(false);
}

function comCeuReal() {
  _reiniciarCieloParaTests();
}

/* Percorre qualquer forma — objeto, array, string — e devolve { ruta, texto }.
 * Recursivo de proposito: o formato do plano ainda esta se assentando (ritual,
 * encaixe, ceu, encontro, e o que vier depois) e um portao que listasse campos na
 * mao pararia de varrer o campo NOVO no dia em que ele nascesse, continuando
 * verde. A varredura tem de alcancar campo que ainda nao existe. */
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

/** Todo texto de um plano, venha do campo que vier. */
function cadenasDelPlano(plano, etiqueta) {
  return cadenas(plano, etiqueta || 'plano');
}

/** Todo texto exportado por datos/plano.js. */
function cadenasDelContenido() {
  const salida = [];
  for (const nombre of Object.keys(CONTENIDO)) {
    if (nombre === 'default') continue;
    if (typeof CONTENIDO[nombre] === 'function') continue;
    cadenas(CONTENIDO[nombre], nombre, salida);
  }
  return salida;
}

/** A copy DAS TELAS do plano: o bloco `plano.*`, pela lista fechada do motor. */
function cadenasDeTelas() {
  const salida = [];
  for (const clave of CLAVES_TEXTO_PLANO) cadenas(T[clave], `textos.js:${clave}`, salida);
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

/** Fonte de um modulo sem as linhas de comentario (onde a regra esta escrita). */
function fuenteDe(...partes) {
  return readFileSync(join(RAIZ, ...partes), 'utf8')
    .split('\n')
    .filter((l) => {
      const t = l.trim();
      return !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*');
    })
    .join('\n');
}

/** As cinco respostas do onboarding, com P4 trocavel. */
function respostas(idContato, corte = 'pelea') {
  return {
    nombre: 'Ana',
    corte,
    cuando: 'meses-1-3',
    hoy: idContato,
    intencion: 'entender-que-paso',
  };
}

const IDS_P2 = getPregunta('corte').opciones.map((o) => o.id);
const IDS_P4 = getPregunta('hoy').opciones.map((o) => o.id);

/** 'YYYY-MM-DD' de N dias depois de um dia local, sem passar por Date local. */
function maisDias(dia, n) {
  const [a, m, d] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(a, m - 1, d + n));
  const pad = (x, largo = 2) => String(x).padStart(largo, '0');
  return `${pad(t.getUTCFullYear(), 4)}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/* Uma semana inteira que comeca num domingo, para cobrir os 7 dias da semana. */
const DOMINGO = '2026-09-06';
const SEMANA = Array.from({ length: 7 }, (_, i) => maisDias(DOMINGO, i));

/* =================================================================================
 * 1. CEU INDISPONIVEL — O DIA NUNCA DEPENDE DO CEU.
 *
 * MUTACAO que este teste pega, e e a mais provavel de todas: fazer o plano sair
 * pela porta dos fundos quando falta efemeride (`if (!ceu) return null`), ou
 * amarrar a escolha do ritual a fase da lua. Qualquer uma das duas deixa o
 * aparelho sem astronomy-engine com um dia VAZIO — e a dependencia e opcional
 * justamente porque o produto nao pode depender dela.
 * ================================================================================= */
test('sem efemeride o plano sai inteiro: ritual, reflexao e afirmacao', () => {
  semCeu();
  const p = planoDoDia(respostas('hablamos'), { hoy: '2026-09-11' });

  assert.equal(typeof p.ritual.id, 'string');
  assert.ok(p.ritual.titulo.trim().length > 0, 'o ritual do dia tem de existir sem ceu');
  assert.ok(p.ritual.acao.trim().length > 0, 'a acao concreta tem de existir sem ceu');
  assert.ok(p.reflexao.trim().length > 0, 'a reflexao tem de existir sem ceu');
  assert.ok(p.afirmacao.trim().length > 0, 'a afirmacao tem de existir sem ceu');

  // O que NAO depende de efemeride continua verdadeiro: dia da semana e regente
  // sao aritmetica de calendario. E e por isso que o plano sobrevive.
  assert.equal(p.diaSemana, diaDaSemana('2026-09-11'));
  assert.equal(p.regente, 'Vênus', '11/09/2026 e uma sexta, dia de Venus');
  assert.equal(p.nomeDiaSemana, 'sexta-feira');
});

test('sem efemeride NAO existe linha de ceu — nem vazia, nem plausivel', () => {
  semCeu();
  const p = planoDoDia(respostas('hablamos'), { hoy: '2026-09-11' });

  // null quer dizer "nao desenhe o card", nunca "desenhe um card de erro".
  assert.equal(p.ceu, null);
  // E o motivo TECNICO existe para log e teste — e so.
  assert.equal(typeof p.ceuMotivoTecnico, 'string');
  assert.ok(p.ceuMotivoTecnico.length > 0);

  // A varredura completa: nenhum nome de fase aparece em lugar nenhum do plano
  // quando a fase nao foi medida. Um `|| 'Lua Cheia'` escondido em qualquer campo
  // — inclusive num campo que ainda nao existe — cai aqui.
  const textos = cadenasDelPlano(p);
  const achados = [];
  for (const { ruta, texto } of textos) {
    for (const fase of FASES) {
      if (texto.includes(fase)) achados.push(`${ruta}: "${fase}"`);
    }
  }
  assert.deepEqual(achados, [], `Nome de fase num plano sem efemeride:\n  ${achados.join('\n  ')}`);
});

test('o motivo tecnico NUNCA e o texto que a pessoa le', () => {
  semCeu();
  const p = planoDoDia(respostas('hablamos'), { hoy: '2026-09-11' });

  // A separacao e doutrina: log honesto e copy honesta querem coisas diferentes.
  // Nome de pacote npm e a palavra "efemeride" nao entram na tela.
  const naTela = cadenasDelPlano(p).filter((c) => c.ruta !== 'plano.ceuMotivoTecnico');
  varrer(
    naTela,
    [/astronomy-engine/i, /efem[eé]ride/i, /undefined/, /\bnull\b/, /\bNaN\b/],
    'Vocabulario tecnico vazando para um campo de tela.'
  );
});

test('o encaixe do ritual CALA sobre a fase quando a fase nao foi medida', () => {
  semCeu();
  // 'caminho-de-volta' declara SO fase e nenhum dia da semana. Sem efemeride, o
  // honesto e nao se pronunciar — nem "bate", nem "nao bate".
  const dia = diaDoRitual('caminho-de-volta');
  const p = planoDoDia(respostas('hablamos'), { hoy: dia });

  assert.equal(p.ritual.id, 'caminho-de-volta');
  assert.equal(
    p.ritual.encaixe.fase,
    null,
    'fase nao medida tem de ser null (nao sei), nunca false (medi e nao bate)'
  );
  const achados = [];
  for (const fase of FASES) {
    if (p.ritual.encaixe.motivo.includes(fase)) achados.push(fase);
  }
  assert.deepEqual(achados, [], 'o motivo do encaixe citou uma fase que ninguem mediu');
});

/* -----------------------------------------------------------------------------
 * O BUG QUE ESTE PORTAO ENCONTROU, e a razao de ele existir com esta forma.
 *
 * "Nao fabricar ceu" tem duas metades, e o motor so cumpria uma. Sem efemeride:
 *   · um ritual que declara SO fase caia em `naoDeclara` e a tela afirmava "Este
 *     gesto nao pede dia nem fase" — o app inventando a AUSENCIA de criterio;
 *   · dia batendo com fase nao medida caia em `parcial` ("Hoje bate em parte"),
 *     que faz entender que a outra metade foi conferida e reprovou.
 * Nenhuma das duas frases tinha lastro, e as duas passavam por qualquer teste
 * que so olhasse `encaixe.fase === null`. Dai `semMedida`, `parcialSemMedida` e
 * o array `falta`.
 * --------------------------------------------------------------------------- */
test('sem efemeride, o encaixe nunca afirma que o gesto NAO pede fase', () => {
  semCeu();
  const achados = [];
  for (let i = 0; i < 40; i += 1) {
    const dia = maisDias(DOMINGO, i);
    const p = planoDoDia(respostas('hablamos'), { hoy: dia });
    const declaraFase = RITUAIS.find((r) => r.id === p.ritual.id).momento.fasesLua.length > 0;
    if (!declaraFase) continue;

    // Declara fase e a fase nao foi medida: a fase TEM de estar em `falta`, e o
    // tipo nao pode ser nenhum dos quatro que falam como quem conferiu.
    assert.deepEqual(
      p.ritual.encaixe.falta,
      ['fase'],
      `${p.ritual.id} em ${dia}: declara fase, nao mediu, e nao registrou a falta`
    );
    /* OS QUATRO que falam como quem conferiu — e a lista tinha DOIS.
     * 'nenhum' e 'parcial' ficavam de fora, e 'nenhum' era alcancavel de
     * verdade: sem efemeride, 'mesa-posta' e 'linha-no-papel' (os dois que
     * declaram dia E fase) caiam nele em todo dia da semana que nao fosse o
     * declarado, e a tela dizia "Hoje nao e o dia mais obvio deste gesto" sobre
     * uma fase que ninguem olhou. Veredito negativo sem medida e a mesma
     * afirmacao sem lastro que inventar a Lua, com o sinal trocado — e ficava
     * verde porque a lista deste `if` nao batia com o comentario acima dele. */
    if (['naoDeclara', 'exato', 'parcial', 'nenhum'].indexOf(p.ritual.encaixe.tipo) !== -1) {
      achados.push(`${dia} ${p.ritual.id}: tipo "${p.ritual.encaixe.tipo}" — ${p.ritual.encaixe.motivo}`);
    }
  }
  assert.deepEqual(
    achados,
    [],
    `Encaixe afirmando sobre uma fase que ninguem mediu:\n  ${achados.join('\n  ')}`
  );
});

test('com efemeride, `falta` fica vazio e os tipos de nao-medida somem', () => {
  comCeuReal();
  for (let i = 0; i < 40; i += 1) {
    const dia = maisDias(DOMINGO, i);
    const e = planoDoDia(respostas('hablamos'), { hoy: dia }).ritual.encaixe;
    assert.deepEqual(e.falta, [], `${dia}: com efemeride nao ha o que faltar`);
    assert.ok(
      ['exato', 'parcial', 'nenhum', 'naoDeclara'].indexOf(e.tipo) !== -1,
      `${dia}: tipo de nao-medida (${e.tipo}) com a efemeride no ar`
    );
  }
});

test('cada tipo de encaixe tem a sua propria frase, e nenhuma serve para duas', () => {
  // Se duas chaves tiverem o mesmo texto, os dois estados viram um so na tela e
  // a distincao que o bug acima custou desaparece sem nada ficar vermelho.
  const tipos = [
    'exato', 'parcial', 'nenhum', 'naoDeclara',
    'semMedida', 'parcialSemMedida', 'nenhumSemMedida',
  ];
  const frases = tipos.map((x) => T[`plano.encaixe.${x}`]);
  frases.forEach((f, i) => assert.ok(f && f.trim().length > 0, `plano.encaixe.${tipos[i]} vazia`));
  assert.equal(new Set(frases).size, tipos.length, 'duas frases de encaixe iguais');
});

/* Acha o primeiro dia da janela em que a rotacao cai num ritual dado. Existe para
 * que os testes falem do ritual pelo NOME e nao por um dia magico escrito na mao,
 * que envelheceria no primeiro dia em que o catalogo mudasse de tamanho. */
function diaDoRitual(id, desde = '2026-09-06', limite = 40) {
  for (let i = 0; i < limite; i += 1) {
    const dia = maisDias(desde, i);
    if (RITUAIS[_rotacaoDe(dia).ritual].id === id) return dia;
  }
  throw new Error(`ritual ${id} nao apareceu em ${limite} dias a partir de ${desde}`);
}

/* =================================================================================
 * 2. NUNCA FABRICAR — nenhuma aproximacao em campo de ceu.
 *
 * O padrao inclui "estimad" e "mais ou menos" alem dos tres pedidos: sao as
 * outras duas formas em que a mesma frase reaparece quando alguem quer preencher
 * um dia sem dado. Roda com efemeride e sem, porque o "por volta de" tanto entra
 * para tapar um buraco quanto para "suavizar" um numero medido.
 * ================================================================================= */
const APROXIMACAO = [
  /\bpor volta d[eoa]\b/i,
  /\baproximadamente\b/i,
  /\bcerca de\b/i,
  /\bmais ou menos\b/i,
  /\bestimad[ao]s?\b/i,
  /\bem torno de\b/i,
  /~\s*\d/,
];

test('nenhuma aproximacao em campo de ceu — com efemeride', () => {
  comCeuReal();
  const entradas = [];
  for (let i = 0; i < 60; i += 1) {
    const dia = maisDias('2026-09-01', i);
    const p = planoDoDia(respostas('hablamos'), { hoy: dia });
    if (p.ceu) entradas.push(...cadenas(p.ceu, `${dia}.ceu`));
  }
  assert.ok(entradas.length > 0, 'a efemeride real tinha de ter produzido ceu em 60 dias');
  varrer(entradas, APROXIMACAO, 'Aproximacao num campo de ceu. Sem medida, o campo nao renderiza.');
});

test('nenhuma aproximacao na copy de tela nem no conteudo', () => {
  varrer(
    [...cadenasDeTelas(), ...cadenasDelContenido()],
    APROXIMACAO,
    'Aproximacao na copy. O app declara indisponivel; nao arredonda o ceu.'
  );
});

test('a copy do plano existe inteira e nao tem marcador sem valor', () => {
  const faltando = CLAVES_TEXTO_PLANO.filter((c) => !existe(c));
  assert.deepEqual(faltando, [], 'chave emitida pelo motor que nao existe em datos/textos.js');

  comCeuReal();
  // {fase}, {criterios}, {quando} nao interpolados vazariam para a tela.
  for (let i = 0; i < 30; i += 1) {
    const dia = maisDias('2026-09-01', i);
    const p = planoDoDia(respostas('hablamos'), { hoy: dia });
    varrer(cadenasDelPlano(p, dia), [/\{\w+\}/], 'Marcador de interpolacao vazando para a tela.');
  }
});

test('os nomes de fase declarados pelos rituais casam byte a byte com lib/ceu.js', () => {
  // Nome canonico e DADO, nao texto. 'Gibosa Minguante' em vez de 'Lua Gibosa
  // Minguante' nao quebra nada — so faz o ritual parar de casar com a fase, EM
  // SILENCIO, para sempre. Este teste e a unica coisa entre isso e producao.
  const invalidos = [];
  for (const r of RITUAIS) {
    for (const f of r.momento.fasesLua) {
      if (FASES.indexOf(f) === -1) invalidos.push(`${r.id}: "${f}"`);
    }
    for (const d of r.momento.diasSemana) {
      if (!Number.isInteger(d) || d < 0 || d > 6) invalidos.push(`${r.id}: diaSemana ${d}`);
    }
  }
  assert.deepEqual(invalidos, [], `Criterio de momento que nunca vai casar:\n  ${invalidos.join('\n  ')}`);
});

/* =================================================================================
 * 3. CONTATO DURO — nenhum campo empurra para fora.
 *
 * A matriz e 5 rituais x 7 dias da semana x 5 respostas de P2, com os dois ids de
 * contato duro. Nao e zelo: a acao de encontro, o encaixe e a copy travada sao
 * montados por caminhos diferentes, e uma frase de contato pode entrar por
 * qualquer um deles. A varredura e RECURSIVA sobre o plano inteiro, entao ela
 * alcanca campo que ainda nao existe — inclusive um campo lateral onde alguem
 * "guardasse" a acao para quando destravar.
 *
 * A guarda e sugiereContacto() de lib/lectura.js, importada. Copiar os padroes
 * para ca faria este portao envelhecer sozinho.
 * ================================================================================= */
test('contato duro: nenhum campo do plano sugere contato — 5 rituais x 7 dias x 5 respostas de P2', () => {
  semCeu();
  const achados = [];
  let combinacoes = 0;
  const ritaisVistos = new Set();

  for (const idDuro of IDS_CONTACTO_DURO) {
    for (const corte of IDS_P2) {
      // 35 dias corridos a partir de um domingo: cobre os 7 dias da semana e da
      // sete voltas completas no catalogo de 5 rituais.
      for (let i = 0; i < 35; i += 1) {
        const dia = maisDias(DOMINGO, i);
        const p = planoDoDia(respostas(idDuro, corte), { hoy: dia });
        ritaisVistos.add(p.ritual.id);
        combinacoes += 1;
        for (const { ruta, texto } of cadenasDelPlano(p, `${idDuro}/${corte}/${dia}`)) {
          if (sugiereContacto(texto)) achados.push(`${ruta}: "${texto}"`);
        }
      }
    }
  }

  assert.equal(combinacoes, 2 * 5 * 35);
  assert.equal(ritaisVistos.size, RITUAIS.length, 'a matriz tem de ter passado pelos 5 rituais');
  assert.deepEqual(
    achados,
    [],
    'Campo do plano empurrando para fora com o contato duro ligado.\n  ' + achados.join('\n  ')
  );
});

test('contato duro com efemeride tambem nao empurra — o ceu nao e porta dos fundos', () => {
  comCeuReal();
  const achados = [];
  for (const idDuro of IDS_CONTACTO_DURO) {
    for (let i = 0; i < 40; i += 1) {
      const dia = maisDias('2026-09-01', i);
      const p = planoDoDia(respostas(idDuro), { hoy: dia });
      for (const { ruta, texto } of cadenasDelPlano(p, `${idDuro}/${dia}`)) {
        if (sugiereContacto(texto)) achados.push(`${ruta}: "${texto}"`);
      }
    }
  }
  assert.deepEqual(achados, [], 'Com a lua na mao o plano passou a empurrar contato.\n  ' + achados.join('\n  '));
});

test('as frases de encontro NUNCA aparecem num plano de contato duro', () => {
  // A assercao anterior e sobre a doutrina; esta e sobre o vazamento concreto.
  // Se alguem guardar a acao num campo lateral ('paraQuandoDestravar'), a
  // varredura recursiva encontra a string literal aqui.
  semCeu();
  const achados = [];
  for (const idDuro of IDS_CONTACTO_DURO) {
    for (let i = 0; i < 20; i += 1) {
      const dia = maisDias(DOMINGO, i);
      const p = planoDoDia(respostas(idDuro), { hoy: dia });
      const inteiro = cadenasDelPlano(p).map((c) => c.texto).join('  ');
      for (const frase of ENCONTROS) {
        if (inteiro.includes(frase)) achados.push(`${idDuro}/${dia}: "${frase}"`);
      }
    }
  }
  assert.deepEqual(achados, [], `Acao de encontro vazada para quem nao tem contato:\n  ${achados.join('\n  ')}`);
});

/* -----------------------------------------------------------------------------
 * A REDE DE RUNTIME TEM DE ESTAR LIGADA.
 *
 * lib/plano.js tem `varrer()`, que passa o texto composto pelas guardas de
 * lib/lectura.js quando o contato e duro — e tem trinta linhas de comentario
 * explicando por que ela existe. Ela nasceu DESLIGADA: a funcao estava escrita,
 * documentada e nunca chamada; `planoDoDia` devolvia acao, porque, reflexao e
 * afirmacao crus. Uma rede que nao esta embaixo do trapezio nao e uma rede, e
 * nada ficava vermelho por causa disso, porque o catalogo de hoje esta limpo.
 *
 * Por isso a checagem e no FONTE. Comportamento nao consegue provar a fiacao com
 * o catalogo limpo (nao ha o que filtrar), e um catalogo envenenado nao da para
 * plantar: RITUAIS esta congelado. O que da para exigir e que cada campo de texto
 * que sai do plano passe pela rede — e e essa linha que uma refatoracao distraida
 * apaga.
 * --------------------------------------------------------------------------- */
test('todo campo de texto do plano passa pela rede antes de sair', () => {
  const fuente = fuenteDe('lib', 'plano.js');
  const faltando = [];
  for (const campo of ['acao', 'porque', 'reflexao', 'afirmacao']) {
    if (!new RegExp(`${campo}:\\s*passar\\(`).test(fuente)) faltando.push(campo);
  }
  assert.deepEqual(
    faltando,
    [],
    `Campo saindo do plano sem passar pela guarda de contato: ${faltando.join(', ')}. `
      + 'A rede so protege o que passa por ela.'
  );
  assert.match(fuente, /guardaContacto\(/, 'a rede tem de usar a guarda de lib/lectura.js');
});

test('a rede reporta o que filtrou — e hoje nao precisa filtrar nada', () => {
  semCeu();
  const p = planoDoDia(respostas('cero-contacto'), { hoy: DOMINGO });
  // Guarda que dispara em silencio e guarda que ninguem conserta: se um dia esta
  // lista vier cheia, alguem escreveu no catalogo uma frase que nao devia existir
  // e o conserto e no catalogo, nao aqui.
  assert.deepEqual(p.guardasDisparadas, [], `a rede teve de filtrar: ${p.guardasDisparadas}`);
  // O gesto de contencao existe SO no estado duro.
  assert.ok(p.contencao && p.contencao.length > 20);
  assert.equal(planoDoDia(respostas('hablamos'), { hoy: DOMINGO }).contencao, null);
});

/* =================================================================================
 * 4. CONTATO DURO TRAVA O ENCONTRO — travado, com motivo, e visivel.
 * ================================================================================= */
test('contato duro: o encontro vem travado com motivo, nunca em acao', () => {
  semCeu();
  for (const idDuro of IDS_CONTACTO_DURO) {
    for (let i = 0; i < 10; i += 1) {
      const dia = maisDias(DOMINGO, i);
      const p = planoDoDia(respostas(idDuro), { hoy: dia });
      assert.equal(p.encontro.estado, ESTADOS_ENCONTRO.TRAVADO, `${idDuro} em ${dia}`);
      assert.equal(p.encontro.motivo, MOTIVOS_ENCONTRO.CONTATO_DURO);
      assert.equal(p.contatoDuro, true);
      // Travado e VISIVEL: o bloco aparece com o motivo escrito. Esconder
      // ensinaria que o app tem um andar secreto.
      assert.ok(p.encontro.titulo.trim().length > 0);
      assert.ok(p.encontro.texto.trim().length > 20, 'travado sem explicacao e so uma porta fechada');
      // E nao carrega ancora de dia nenhuma. O campo `quando` foi REMOVIDO do
      // bloco (ver o teste dedicado abaixo): esta linha e o alarme para o dia em
      // que alguem o reintroduzir por um caminho lateral.
      assert.equal(p.encontro.quando, undefined, 'o bloco de encontro voltou a ter ancora de dia');
    }
  }
});

test('bloqueio tambem trava, e com motivo proprio', () => {
  semCeu();
  const p = planoDoDia(respostas(ID_BLOQUEIO), { hoy: DOMINGO });
  assert.equal(p.encontro.estado, ESTADOS_ENCONTRO.TRAVADO);
  assert.equal(p.encontro.motivo, MOTIVOS_ENCONTRO.BLOQUEIO);
  // 'bloqueo' NAO esta em IDS_CONTACTO_DURO (aquela lista e do motor de leitura):
  // travar aqui e decisao deste modulo, e a flag continua dizendo a verdade.
  assert.equal(p.contatoDuro, false, 'contatoDuro espelha P4, e nao a decisao do encontro');
});

test('a matriz inteira de P4: quem trava e quem abre', () => {
  semCeu();
  const mapa = {};
  for (const id of IDS_P4) {
    mapa[id] = planoDoDia(respostas(id), { hoy: DOMINGO }).encontro.estado;
  }
  // Lista fechada: uma opcao nova em P4 obriga a passar por aqui, e o lugar de
  // decidir se ela empurra alguem para um encontro e a revisao deste teste.
  assert.deepEqual(mapa, {
    hablamos: ESTADOS_ENCONTRO.ACAO,
    'le-escribi-no-responde': ESTADOS_ENCONTRO.TRAVADO,
    'cero-contacto': ESTADOS_ENCONTRO.TRAVADO,
    'me-escribe-a-veces': ESTADOS_ENCONTRO.ACAO,
    bloqueo: ESTADOS_ENCONTRO.TRAVADO,
  });
});

test('resposta ausente ou inventada nao abre o encontro por acidente', () => {
  semCeu();
  // Sem respostas nenhuma o encontro ainda pode existir (a pessoa nao declarou
  // contato duro), mas o motor nao pode LANCAR nem devolver plano quebrado: uma
  // tela que renderiza antes do onboarding terminar e caso real.
  for (const entrada of [undefined, null, {}, { hoy: null }, { hoy: 'inventado' }, 'texto']) {
    const p = planoDoDia(entrada, { hoy: DOMINGO });
    assert.ok(p.ritual.acao.length > 0);
    assert.equal(p.contatoDuro, false);
    assert.ok([ESTADOS_ENCONTRO.ACAO, ESTADOS_ENCONTRO.TRAVADO].indexOf(p.encontro.estado) !== -1);
  }
});

/* =================================================================================
 * 5. CONTATO ATIVO DESTRAVA — e mesmo assim nao promete desfecho.
 * ================================================================================= */
const PROMESSA = [
  /\bvoltar[aá]\b/i,
  /\bvai voltar\b/i,
  /\bvai te (procurar|buscar|chamar|ligar|escrever)\b/i,
  /\bvai (voltar|responder|aparecer|perdoar)\b/i,
  /\bgarant(e|imos|ido|ia)\b/i,
  /\bcom certeza (volta|vai)\b/i,
  /\bvai dar certo\b/i,
  /\bvolver[aá]\b/i,
  /\bregresar[aá]\b/i,
];

test('contato ativo: o encontro sai em acao, com uma acao de verdade', () => {
  semCeu();
  const p = planoDoDia(respostas('hablamos'), { hoy: DOMINGO });
  assert.equal(p.encontro.estado, ESTADOS_ENCONTRO.ACAO);
  assert.equal(p.encontro.motivo, null);
  assert.ok(ENCONTROS.indexOf(p.encontro.texto) !== -1, 'a acao tem de vir do catalogo');
});

test('contato ativo: nenhuma frase promete desfecho — 60 dias, com ceu e sem', () => {
  const entradas = [];
  for (const ceuLigado of [false, true]) {
    if (ceuLigado) comCeuReal();
    else semCeu();
    for (const id of ['hablamos', 'me-escribe-a-veces']) {
      for (let i = 0; i < 60; i += 1) {
        const dia = maisDias('2026-09-01', i);
        entradas.push(...cadenasDelPlano(planoDoDia(respostas(id), { hoy: dia }), `${ceuLigado ? 'ceu' : 'sem'}/${id}/${dia}`));
      }
    }
  }
  varrer(entradas, PROMESSA, 'Promessa de desfecho num plano com contato ativo.');
});

/* -----------------------------------------------------------------------------
 * O SEGUNDO BUG QUE ESTE PORTAO PASSOU A PEGAR — CEU FABRICADO POR MONTAGEM.
 *
 * O bloco de encontro tinha um campo `quando`:
 *   "Se for para escolher o dia: Lua Nova cai na sexta-feira, dia 11"
 * desenhado DENTRO do cartao, colado em "Ofereca uma mesa e um horario".
 *
 * Cada metade passava em tudo que ja existia aqui: a data e medida (nao ha
 * aproximacao), a acao vem do catalogo (nao promete desfecho, nao empurra
 * contato) e nao ha uma unica palavra proibida nas duas frases. O que nenhum
 * teste olhava era a MONTAGEM: encostadas, elas afirmam uma terceira coisa que
 * campo nenhum de lib/ceu.js mede — que a Lua e criterio para escolher o dia de
 * um encontro com outra pessoa. E previsao vestida de descricao, e e a forma
 * mais dificil de pegar por varredura de palavra, porque nao ha palavra.
 *
 * A regra ja estava escrita em datos/textos.js, no bloco `ano.virada.*`: data
 * medida a dois centimetros de um texto sobre reconciliacao deixa de ser medida.
 *
 * O portao e ESTRUTURAL de proposito: nenhum texto do bloco de encontro pode
 * conter nome de fase, nome de dia da semana ou numero de dia. Uma frase nova
 * que reabra a costura por outro caminho cai aqui.
 * --------------------------------------------------------------------------- */
test('o bloco de encontro NUNCA carrega ancora de ceu — 60 dias, com efemeride, os 5 ids de P4', () => {
  comCeuReal();
  const achados = [];
  const diasSemana = T['plano.semana.nomes'];
  for (const id of IDS_P4) {
    for (let i = 0; i < 60; i += 1) {
      const dia = maisDias('2026-09-01', i);
      const e = planoDoDia(respostas(id), { hoy: dia }).encontro;

      // Forma fechada: o bloco tem exatamente estes quatro campos. Um campo novo
      // (`quando`, `marco`, `sugestaoDeDia`...) e onde a costura voltaria.
      assert.deepEqual(
        Object.keys(e).sort(),
        ['estado', 'motivo', 'texto', 'titulo'],
        `${id}/${dia}: campo novo no bloco de encontro`
      );

      for (const { ruta, texto } of cadenas(e, `${id}/${dia}.encontro`)) {
        for (const fase of FASES) {
          if (texto.includes(fase)) achados.push(`${ruta}: fase "${fase}" em "${texto}"`);
        }
        for (const nome of diasSemana) {
          if (texto.includes(nome)) achados.push(`${ruta}: dia da semana "${nome}" em "${texto}"`);
        }
        if (/\bdia \d/.test(texto)) achados.push(`${ruta}: numero de dia em "${texto}"`);
      }
    }
  }
  assert.deepEqual(
    achados,
    [],
    'Marco de ceu dentro do bloco de encontro. O ceu descreve o DIA, no alto da '
      + `tela; ele nao escolhe a data de nada:\n  ${achados.join('\n  ')}`
  );
});

test('o ceu descreve o DIA, nunca a decisao de ninguem', () => {
  // "Lua Cheia fecha ciclo" e legitimo; "com a lua cheia ela vai te procurar" e
  // alegacao sobre terceiro. Varre a copy de tela e o conteudo, que e onde a
  // frase seria escrita.
  varrer(
    [...cadenasDeTelas(), ...cadenasDelContenido()],
    [
      /\b(ele|ela|essa pessoa|esa persona)\s+(vai|volta|responde|procura|aparece|sente|pensa)\b/i,
      /\b(lua|c[eé]u|marte|v[eê]nus|merc[uú]rio)\b[^.!?]{0,40}\b(faz|leva|obriga|traz de volta)\b[^.!?]{0,20}\b(ele|ela|essa pessoa)\b/i,
      /\b(ele|ela)\s+te\b/i,
    ],
    'O ceu (ou o ritual) sendo apresentado como agindo sobre outra pessoa.'
  );
});

/* =================================================================================
 * 6. DETERMINISMO
 * ================================================================================= */
test('mesmo dia + mesmas respostas = mesmo plano, byte a byte', () => {
  semCeu();
  const a = planoDoDia(respostas('hablamos'), { hoy: '2026-09-11' });
  const b = planoDoDia(respostas('hablamos'), { hoy: '2026-09-11' });
  assert.deepEqual(b, a);

  comCeuReal();
  const c = planoDoDia(respostas('hablamos'), { hoy: '2026-09-11' });
  const d = planoDoDia(respostas('hablamos'), { hoy: '2026-09-11' });
  assert.deepEqual(d, c, 'com efemeride tambem: a mesma data devolve o mesmo ceu');
});

test('o mesmo instante dado de tres jeitos da o mesmo plano', () => {
  semCeu();
  const porString = planoDoDia(respostas('hablamos'), { hoy: '2026-09-11' });
  const porData = planoDoDia(respostas('hablamos'), { agora: new Date(2026, 8, 11, 22, 40) });
  const porDataCedo = planoDoDia(respostas('hablamos'), { agora: new Date(2026, 8, 11, 0, 5) });

  // As 22h40 o dia UTC ja e 12/09 em boa parte do Brasil. O plano e do dia LOCAL.
  assert.deepEqual(porData, porString, 'as 22h40 o plano ainda e o de hoje');
  assert.deepEqual(porDataCedo, porString, 'as 00h05 tambem');
});

test('zero Math.random e zero Date.now nos modulos do plano', () => {
  const arquivos = [
    ['lib', 'plano.js'],
    ['lib', 'ceu.js'],
    ['datos', 'plano.js'],
  ];
  const achados = [];
  for (const partes of arquivos) {
    const fuente = fuenteDe(...partes);
    for (const padrao of [/Math\.random/, /Date\.now\s*\(/, /\bcrypto\./, /performance\.now/]) {
      const m = fuente.match(padrao);
      if (m) achados.push(`${partes.join('/')}: "${m[0]}"`);
    }
  }
  assert.deepEqual(
    achados,
    [],
    `Fonte de nao-determinismo no plano. A rotacao e aritmetica de dia:\n  ${achados.join('\n  ')}`
  );
});

test('data invalida nao derruba o plano e nao devolve undefined', () => {
  semCeu();
  // '2026-02-30' passa em /^\d{4}-\d{2}-\d{2}$/ e nao existe no calendario: e
  // exatamente o caso que new Date() aceitaria rolando para 02/03 em silencio.
  for (const ruim of ['2026-02-30', '2026-13-01', 'ontem', '', null, undefined, 12345]) {
    const p = planoDoDia(respostas('hablamos'), { hoy: ruim });
    assert.match(p.dia, /^\d{4}-\d{2}-\d{2}$/, `dia invalido (${ruim}) tinha de cair para hoje`);
    assert.ok(p.ritual.acao.length > 0);
    assert.ok(REFLEXOES.indexOf(p.reflexao) !== -1);
    assert.ok(AFIRMACOES.indexOf(p.afirmacao) !== -1);
  }
});

/* =================================================================================
 * 7. ROTACAO — 60 dias corridos.
 *
 * MUTACAO que este teste pega: trocar a contagem continua de dias pelo DIA DO ANO.
 * Com dia-do-ano, 31/12 e 01/01 de um ano bissexto caem no mesmo indice (365 % 5
 * === 0) e o mesmo ritual sai dois dias seguidos — uma vez por ano, no unico dia
 * em que a rotacao promete nao repetir. Por isso a virada de ano tem teste proprio.
 * ================================================================================= */
test('o mesmo ritual nao cai dois dias seguidos — 60 dias corridos', () => {
  semCeu();
  const seq = [];
  for (let i = 0; i < 60; i += 1) {
    seq.push(planoDoDia(respostas('hablamos'), { hoy: maisDias('2026-09-01', i) }).ritual.id);
  }
  const repetidos = [];
  for (let i = 1; i < seq.length; i += 1) {
    if (seq[i] === seq[i - 1]) repetidos.push(`${maisDias('2026-09-01', i)}: ${seq[i]}`);
  }
  assert.deepEqual(repetidos, [], `Ritual repetido em dias seguidos:\n  ${repetidos.join('\n  ')}`);
  assert.equal(new Set(seq).size, RITUAIS.length, 'em 60 dias os cinco rituais tem de aparecer');
});

test('a virada de ano bissexto nao repete o ritual', () => {
  semCeu();
  // 2028 e bissexto: 366 dias. Com indice por dia-do-ano, 31/12/2028 e 01/01/2029
  // colidem. Com contagem continua, nao.
  const anterior = planoDoDia(respostas('hablamos'), { hoy: '2028-12-31' }).ritual.id;
  const seguinte = planoDoDia(respostas('hablamos'), { hoy: '2029-01-01' }).ritual.id;
  assert.notEqual(seguinte, anterior, 'a rotacao repetiu na virada do ano bissexto');
});

test('o ritual de camera nao cai todo dia', () => {
  semCeu();
  let comCamera = 0;
  for (let i = 0; i < 60; i += 1) {
    if (planoDoDia(respostas('hablamos'), { hoy: maisDias('2026-09-01', i) }).ritual.camera) {
      comCamera += 1;
    }
  }
  assert.ok(comCamera > 0, 'o ritual de camera tem de aparecer em 60 dias');
  assert.ok(
    comCamera <= 60 / 3,
    `o ritual de camera caiu em ${comCamera} dos 60 dias: foto todo dia vira tarefa, e tarefa e a primeira coisa que se abandona`
  );
  // Um so ritual de camera no catalogo: se nascer um segundo, esta conta muda e a
  // decisao passa por aqui em vez de passar despercebida.
  assert.equal(RITUAIS.filter((r) => r.camera).length, 1);
});

test('reflexao e afirmacao tambem rodam, e o DIA INTEIRO nao se repete', () => {
  semCeu();
  const reflexoes = new Set();
  const afirmacoes = new Set();
  const pares = new Set();
  const dias = new Set();
  for (let i = 0; i < 60; i += 1) {
    const p = planoDoDia(respostas('hablamos'), { hoy: maisDias('2026-09-01', i) });
    reflexoes.add(p.reflexao);
    afirmacoes.add(p.afirmacao);
    pares.add(`${p.ritual.id}|${p.reflexao}`);
    dias.add(`${p.ritual.id}|${p.reflexao}|${p.afirmacao}`);
  }
  assert.equal(reflexoes.size, REFLEXOES.length, 'em 60 dias as 7 reflexoes tem de aparecer');
  assert.equal(afirmacoes.size, AFIRMACOES.length, 'em 60 dias as 11 afirmacoes tem de aparecer');

  /* O invariante que interessa e o do DIA INTEIRO: 5, 7 e 11 sao primos entre si,
   * entao a trinca so volta a se repetir depois de 385 dias e nenhum dos 60 se
   * repete. O PAR ritual+reflexao, esse repete a cada mmc(5,7) = 35 dias — e nao
   * e defeito, e a consequencia aritmetica de tres rotacoes num indice so. Fica
   * medido aqui para que ninguem "conserte" o que nao esta quebrado, e para que
   * encurtar um catalogo (5 e 7 deixarem de ser primos entre si) apareca. */
  assert.equal(dias.size, 60, 'o dia inteiro se repetiu dentro de 60 dias');
  assert.equal(pares.size, 35, 'o par ritual+reflexao devia repetir a cada mmc(5,7) = 35 dias');
});

test('a rotacao anda um passo por dia, sempre para a frente', () => {
  // O indice e a contagem continua de dias: sem virada, sem buraco, sem storage.
  for (let i = 0; i < 400; i += 1) {
    const dia = maisDias('2026-01-01', i);
    assert.equal(_rotacaoDe(dia).giro, diasDesdeEpoca(dia));
  }
});

/* =================================================================================
 * O CONTEUDO — as regras gerais do app aplicadas ao material do plano.
 * ================================================================================= */
test('nenhum gesto do plano empurra para fora', () => {
  const achados = [];
  for (const r of RITUAIS) {
    for (const { ruta, texto } of cadenas({ acao: r.acao, porque: r.porque }, r.id)) {
      if (sugiereContacto(texto)) achados.push(`${ruta}: "${texto}"`);
    }
  }
  for (const [i, texto] of REFLEXOES.entries()) {
    if (sugiereContacto(texto)) achados.push(`REFLEXOES[${i}]: "${texto}"`);
  }
  for (const [i, texto] of AFIRMACOES.entries()) {
    if (sugiereContacto(texto)) achados.push(`AFIRMACOES[${i}]: "${texto}"`);
  }
  assert.deepEqual(achados, [], `Gesto do plano empurrando para fora:\n  ${achados.join('\n  ')}`);
});

test('o catalogo esta bem formado', () => {
  const ids = RITUAIS.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, 'id de ritual duplicado');
  for (const r of RITUAIS) {
    assert.match(r.id, /^[a-z0-9-]+$/, `id tecnico com maiuscula ou acento: ${r.id}`);
    assert.ok(r.titulo.trim().length > 0, `${r.id} sem titulo`);
    assert.ok(r.acao.trim().length > 0, `${r.id} sem acao`);
    assert.ok(r.porque.trim().length > 0, `${r.id} sem porque`);
    assert.equal(typeof r.camera, 'boolean', `${r.id} sem flag de camera`);
    assert.ok(Array.isArray(r.momento.fasesLua) && Array.isArray(r.momento.diasSemana));
  }
  assert.equal(new Set(REFLEXOES).size, REFLEXOES.length, 'reflexao duplicada');
  assert.equal(new Set(AFIRMACOES).size, AFIRMACOES.length, 'afirmacao duplicada');
  assert.equal(new Set(ENCONTROS).size, ENCONTROS.length, 'acao de encontro duplicada');
});

test('o plano nao cria chave de storage — e por isso nada falta em CLAVES_HILO_ROJO', () => {
  // Regra de integracao que ja custou caro: chave nova que nao entra na lista de
  // AjustesScreen sobrevive ao "Apagar tudo" e a politica de privacidade vira
  // declaracao falsa numa ficha de loja. O plano e PURO — este teste e o que
  // impede alguem de dar a ele um cache silencioso sem passar por aquela lista.
  for (const partes of [['lib', 'plano.js'], ['datos', 'plano.js']]) {
    const fuente = fuenteDe(...partes);
    const achados = [];
    for (const padrao of [/guardarSeguro/, /leerSeguro/, /borrarSeguro/, /AsyncStorage/, /almacen/]) {
      const m = fuente.match(padrao);
      if (m) achados.push(`${partes.join('/')}: "${m[0]}"`);
    }
    assert.deepEqual(
      achados,
      [],
      `O plano passou a gravar. Se isso for intencional, a chave TEM de entrar em `
        + `CLAVES_HILO_ROJO (screens/AjustesScreen.js) no mesmo commit:\n  ${achados.join('\n  ')}`
    );
  }
});

test('P4 continua com as cinco opcoes que este portao conhece', () => {
  // Se P4 ganhar ou perder uma opcao, a matriz de travas acima deixa de cobrir o
  // produto — e ficaria verde sem cobrir. Esta linha e o alarme.
  assert.deepEqual(IDS_P4.slice().sort(), [
    'bloqueo',
    'cero-contacto',
    'hablamos',
    'le-escribi-no-responde',
    'me-escribe-a-veces',
  ]);
  assert.deepEqual(IDS_CONTACTO_DURO.slice().sort(), ['cero-contacto', 'le-escribi-no-responde']);
  // 7 desde 01/09: entraram 'nacimiento' (P6) e 'genero' (P7).
  assert.equal(PREGUNTAS.length, 7);
  _reiniciarCieloParaTests();
});

/* =================================================================================
 * 8. O RITUAL QUE A TELA REALMENTE DESENHA
 * =================================================================================
 * O BUG QUE ESTA SECAO EXISTE PARA NAO DEIXAR VOLTAR.
 *
 * Ate esta revisao, o portao inteiro acima varria `planoDoDia`, e `plano.ritual`
 * sai de datos/plano.js. So que screens/PlanoScreen.js NAO DESENHA aquele ritual:
 * ela desenha o ROTATIVO de datos/rituais.js (`gesto`, `abertura`, `comoFazer[]`,
 * `fecho`), escolhido por lib/rituaisRotativos.js. Havia dois catalogos de ritual,
 * a rede de runtime estava ligada no que a tela ignora e o portao media o mesmo
 * catalogo ignorado — verde dos dois lados, e cru na tela.
 *
 * O que estava cru: tres passos comecando por "Escreva" (cafe, mao, sonho), que e
 * imperativo de saida em PATRONES_CONTACTO. Chegavam inteiros a tela de quem
 * respondeu 'cero-contacto', no cartao de maior hierarquia da pagina.
 *
 * Por isso as travas daqui medem O QUE A TELA MOSTRA, e nao o que o motor emite:
 *   8.1 o catalogo rotativo inteiro passa por sugiereContacto();
 *   8.2 a saida de ritualSeguroDoDia() passa, nos tres estados travados, no ciclo
 *       inteiro de 12 dias da ESCALA;
 *   8.3 a rede REALMENTE roda ali (e nao so a tabela foi escolhida com cuidado);
 *   8.4 a tela importa a versao protegida, e nao a crua;
 *   8.5 a copy de tela `plano.tela.*` — que nao esta em CLAVES_TEXTO_PLANO e por
 *       isso nunca foi varrida por ninguem — tambem passa.
 * ================================================================================= */

/** Os tres ids de P4 em que nenhum campo pode empurrar para fora. */
const IDS_TRAVADOS = [...IDS_CONTACTO_DURO, ID_BLOQUEIO];

test('8.1 o catalogo rotativo (datos/rituais.js) nao tem uma linha que empurre para fora', () => {
  // Varre TODA string dos cinco rituais — gesto, abertura, passos, fecho, recibo.
  // Recursiva de proposito: campo novo no catalogo entra na varredura sozinho.
  const achados = [];
  for (const r of RITUAIS_ROTATIVOS) {
    for (const { ruta, texto } of cadenas(r, `rituais:${r.id}`)) {
      if (sugiereContacto(texto)) achados.push(`${ruta}: "${texto}"`);
    }
  }
  assert.deepEqual(
    achados,
    [],
    'Texto do ritual que a tela desenha empurrando para fora. O verbo de registro '
      + 'aqui e "anote", nunca "escreva":\n  ' + achados.join('\n  ')
  );
});

test('8.2 contato duro e bloqueio: o ritual do dia nao empurra — o ciclo inteiro de 12 dias', () => {
  const achados = [];
  const idsVistos = new Set();
  for (const id of IDS_TRAVADOS) {
    // TAMANHO_CICLO dias corridos cobrem a ESCALA inteira: os cinco rituais e
    // todas as posicoes. Menos que isso deixaria uma posicao fora da varredura.
    for (let i = 0; i < TAMANHO_CICLO; i += 1) {
      const dia = maisDias(DOMINGO, i);
      const r = ritualSeguroDoDia(dia, respostas(id));
      idsVistos.add(r.id);
      /* A rede tem de estar OCIOSA no ciclo inteiro, e nao so no dia de teste que
       * calhou de cair num ritual limpo: se ela disparou, alguem escreveu em
       * datos/rituais.js uma frase que nao devia existir e o conserto e la. A
       * varredura abaixo ficaria verde nesse caso — porque a rede consertou a
       * saida —, e uma guarda que salva em silencio e uma guarda que ninguem
       * conserta. Por isso esta assercao vem ANTES. */
      assert.deepEqual(
        r.guardasDisparadas,
        [],
        `${id}/${dia} (${r.id}): a rede precisou filtrar o ritual — conserte datos/rituais.js`
      );
      for (const { ruta, texto } of cadenas(r, `${id}/${dia}`)) {
        if (sugiereContacto(texto)) achados.push(`${ruta}: "${texto}"`);
      }
    }
  }
  /* Desde 01/09 o catalogo e maior que o giro: 'mao' (estreia) e 'cartas'
   * (aposentada do giro) existem sem cair na escala. O ciclo de 12 dias tem de
   * cobrir exatamente os ids DA ESCALA — e nunca tocar num fora-do-giro, que e
   * o guarda novo que a mudanca comprou. */
  const idsDaEscala = new Set(ESCALA);
  assert.equal(idsVistos.size, idsDaEscala.size, 'o ciclo tinha de passar por todos os rituais da escala');
  for (const fora of FORA_DO_GIRO) {
    assert.ok(!idsVistos.has(fora), `'${fora}' esta fora do giro e apareceu no ciclo`);
  }
  assert.deepEqual(
    achados,
    [],
    `Ritual do dia empurrando para fora com o contato travado:\n  ${achados.join('\n  ')}`
  );
});

/* -----------------------------------------------------------------------------
 * 8.3 A REDE TEM DE ESTAR LIGADA NO RITUAL — nao basta a tabela estar limpa.
 *
 * Mesma logica do teste 'todo campo de texto do plano passa pela rede': com o
 * catalogo limpo, comportamento nao consegue provar fiacao (nao ha o que filtrar)
 * e RITUAIS esta congelado, entao nao da para plantar veneno. O que DA para exigir
 * sao duas coisas verificaveis:
 *
 *  · comportamento: com contato travado a funcao entra no ramo da rede, e isso se
 *    ve num campo que so aquele ramo cria (`guardasDisparadas`). Sem contato
 *    travado ela devolve a entrada do catalogo, que nao tem esse campo. Se alguem
 *    transformar `ritualSeguroDoDia` num alias de `ritualDoDia`, esta assercao
 *    fica vermelha na hora;
 *  · fonte: os quatro campos visiveis passam pela varredura.
 * --------------------------------------------------------------------------- */
test('8.3 a rede roda mesmo sobre o ritual — e hoje nao precisa filtrar nada', () => {
  for (const id of IDS_TRAVADOS) {
    const r = ritualSeguroDoDia(DOMINGO, respostas(id));
    assert.ok(
      Array.isArray(r.guardasDisparadas),
      `${id}: ritualSeguroDoDia devolveu o catalogo cru — a rede nao rodou`
    );
    assert.deepEqual(r.guardasDisparadas, [], `a rede teve de filtrar: ${r.guardasDisparadas}`);
    // O gesto e os passos continuam existindo: rede nao pode esvaziar o dia.
    assert.ok(r.gesto.trim().length > 0, `${id}: ritual sem gesto`);
    assert.ok(r.comoFazer.length > 0, `${id}: ritual sem passo nenhum`);
    assert.equal(r.comoFazerTexto, r.comoFazer.join(' '), 'comoFazerTexto fora de sincronia');
  }

  // Sem contato travado, o catalogo sai intacto — reescrever texto bom seria dano
  // gratuito, e a ausencia do campo tecnico e o que marca esse caminho.
  const livre = ritualSeguroDoDia(DOMINGO, respostas('hablamos'));
  assert.equal(livre.guardasDisparadas, undefined);
  assert.equal(precisaDeRede(respostas('hablamos')), false);
  assert.equal(precisaDeRede(respostas('me-escribe-a-veces')), false);
  for (const id of IDS_TRAVADOS) assert.equal(precisaDeRede(respostas(id)), true, id);
  // Entrada quebrada nao liga a rede por acidente nem derruba a funcao.
  for (const entrada of [undefined, null, {}, 'texto', { hoy: 'inventado' }]) {
    assert.equal(precisaDeRede(entrada), false);
    assert.ok(ritualSeguroDoDia(DOMINGO, entrada).gesto.length > 0);
  }

  const fuente = fuenteDe('lib', 'plano.js');
  const faltando = [];
  for (const campo of ['gesto', 'abertura', 'fecho']) {
    if (!new RegExp(`const ${campo} = campo\\(`).test(fuente)) faltando.push(campo);
  }
  if (!/varrerPasso\(paso, livro\)/.test(fuente)) faltando.push('comoFazer');
  // O bloco de encontro tambem: o cabecalho do modulo promete que ele passa, e
  // durante um tempo o codigo devolvia `encontroDoDia()` cru.
  if (!/passar\('encontro\.texto'/.test(fuente)) faltando.push('encontro.texto');
  assert.deepEqual(
    faltando,
    [],
    `Campo visivel saindo sem passar pela rede: ${faltando.join(', ')}. `
      + 'A rede so protege o que passa por ela.'
  );

  /* E o INTERRUPTOR da rede tem de ser `precisaDeRede`, nao uma condicao escrita
   * na mao. Com `const rede = duro` o plano volta a deixar o bloqueio de fora da
   * varredura, e nada mais neste arquivo nota: o catalogo esta limpo, entao os
   * dois caminhos produzem o mesmo texto ate o dia em que nao produzem. A unica
   * coisa verificavel enquanto o catalogo esta limpo e QUAL condicao liga a rede. */
  assert.match(
    fuente,
    /const rede = precisaDeRede\(respuestas\);/,
    'a rede de planoDoDia parou de usar precisaDeRede(): duas condicoes escritas na '
      + 'mao acabam discordando, e o estado que sobrar de fora fica sem varredura'
  );
  assert.match(fuente, /if \(!rede\) return texto;/, 'o `passar` do plano nao consulta mais `rede`');
  assert.match(
    fuente,
    /if \(!precisaDeRede\(respuestas\)\) return base;/,
    'ritualSeguroDoDia parou de usar precisaDeRede()'
  );
});

test('8.4 a tela importa o ritual PROTEGIDO, nunca o cru', () => {
  // Uma linha de import e tudo o que separa a tela protegida da tela crua, e a
  // troca nao muda nada visivel: nenhum teste de layout pegaria.
  const fuente = fuenteDe('screens', 'PlanoScreen.js');
  assert.match(
    fuente,
    /ritualSeguroDoDia/,
    'screens/PlanoScreen.js tem de pegar o ritual por ritualSeguroDoDia (lib/plano.js)'
  );
  assert.doesNotMatch(
    fuente,
    /from '\.\.\/lib\/rituaisRotativos'/,
    'a tela voltou a importar lib/rituaisRotativos direto: o ritual do dia chega sem a rede de contato'
  );
  assert.doesNotMatch(fuente, /\britualDoDia\s*\(/, 'a tela chamou ritualDoDia() cru');
});

test('8.5 nenhuma linha da copy do plano empurra para fora — inclusive `plano.tela.*`', () => {
  /* CLAVES_TEXTO_PLANO so lista o que o MOTOR emite; `plano.tela.*` (rotulos,
   * botoes, notas, o aviso do card) ficava fora de toda varredura de contato.
   * Aqui a regra passa a ser por PREFIXO: chave nova no bloco entra sozinha, sem
   * ninguem precisar lembrar de acrescenta-la em lista nenhuma. */
  const achados = [];
  for (const clave of Object.keys(T)) {
    if (!clave.startsWith('plano.')) continue;
    for (const { ruta, texto } of cadenas(T[clave], `textos.js:${clave}`)) {
      if (sugiereContacto(texto)) achados.push(`${ruta}: "${texto}"`);
    }
  }
  assert.deepEqual(
    achados,
    [],
    'Copy do plano empurrando para fora. Vale tambem para a frase que NEGA ("propor '
      + 'um encontro seria..."): a guarda nao le negacao, e o texto travado e lido por '
      + `quem nao pode receber a sugestao:\n  ${achados.join('\n  ')}`
  );
});

test('8.6 o card compartilhavel do dia travado tambem sai limpo', () => {
  /* O card leva o gesto do ritual e a afirmacao para fora do app. Se o gesto
   * chegasse cru aqui, a frase que a tela filtrou sairia inteira no print. */
  semCeu();
  const achados = [];
  for (const id of IDS_TRAVADOS) {
    for (let i = 0; i < TAMANHO_CICLO; i += 1) {
      const dia = maisDias(DOMINGO, i);
      const p = planoDoDia(respostas(id), { hoy: dia });
      const r = ritualSeguroDoDia(dia, respostas(id));
      const card = [r.nome, r.gesto, r.comoFazerTexto, p.afirmacao, p.reflexao].join('\n');
      if (sugiereContacto(card)) achados.push(`${id}/${dia}: "${card}"`);
    }
  }
  assert.deepEqual(achados, [], `Card do dia empurrando para fora:\n  ${achados.join('\n  ')}`);
  _reiniciarCieloParaTests();
});

test('8.7 o bloqueio recebe a mesma rede que o contato duro', () => {
  semCeu();
  const p = planoDoDia(respostas(ID_BLOQUEIO), { hoy: DOMINGO });
  // A rede de `planoDoDia` rodava so em IDS_CONTACTO_DURO; canal fechado ficava
  // com o bloco travado e sem varredura nenhuma sobre o resto do plano.
  assert.equal(precisaDeRede(respostas(ID_BLOQUEIO)), true);
  assert.deepEqual(p.guardasDisparadas, []);
  const achados = [];
  for (const { ruta, texto } of cadenasDelPlano(p, ID_BLOQUEIO)) {
    if (sugiereContacto(texto)) achados.push(`${ruta}: "${texto}"`);
  }
  assert.deepEqual(achados, [], `Plano de quem esta bloqueada empurrando para fora:\n  ${achados.join('\n  ')}`);
  // E a ESCALA continua sendo a fila que o ciclo de 8.2 percorre.
  assert.equal(ESCALA.length, TAMANHO_CICLO);
  _reiniciarCieloParaTests();
});
