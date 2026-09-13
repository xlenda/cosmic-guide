// lib/ritual.js
// O MOTOR DO RITUAL DE SETE DIAS. Interface publica em espanhol, comentarios em
// portugues (mesma convencao de lib/hilo.js e lib/almacen.js).
//
// ===========================================================================
// O QUE ESTE MODULO E
// ===========================================================================
// Sete passos, um por dia, com fim marcado. O conteudo mora em datos/ritual.js;
// aqui vive so o progresso: quais dias foram feitos, em que data, e a linha que
// ela deixou em cada um.
//
// Tres decisoes de PRODUTO — nao de codigo — sustentam o arquivo. Quebrar
// qualquer uma passa no compilador e estraga o app:
//
//   1. UM PASSO POR DIA LOCAL. Concluir o dia 3 nao libera o dia 4 na mesma
//      noite. Uma trilha de sete dias lida em vinte minutos nao e uma trilha, e
//      uma pagina de texto: o valor do formato esta em voltar amanha. A trava
//      vem LIGADA por omissao; `unoPorDia: false` existe so para QA, porque o
//      padrao nunca e o permissivo.
//
//   2. FALTAR NAO PUNE, E O RETORNO E MUDO. Nao existe neste arquivo uma unica
//      referencia a "dias desde a ultima conclusao". Quem sumiu tres semanas
//      volta exatamente no dia em que parou: nada zera, nada expira, nao ha
//      "recuperar" (nem pago nem de brinde) e nao ha aviso de ausencia nenhum.
//      Isso e OMISSAO DELIBERADA, e test/madremaria-ritual.test.js cobre a omissao para
//      que ninguem "melhore" a tela depois. Mesma doutrina de lib/hilo.js.
//
//   3. O QUE ELA ESCREVEU NAO SE TOCA. A nota do dia 1 e o dado mais sensivel
//      do app inteiro e e o que o dia 7 devolve. Ela e gravada VERBATIM: sem
//      trim, sem corte no limite, sem normalizacao, sem passar por guarda de
//      copy — as guardas existem para o que o APP diz, nunca para o que ela
//      diz. Truncar o texto dela e reescrever o texto dela.
//
// ===========================================================================
// FORMA NO DISCO — uma chave so, versionada
// ===========================================================================
//   'ritual' -> { "v":1, "hechos":[ { "dia":1, "fecha":"2026-08-31", "nota":"..." } ] }
//
// Guardamos o MAPA DOS DIAS (quais, com data), nao um contador. Contador e uma
// afirmacao sem prova: com ele nao da para desenhar QUAIS sete dias, nao da
// para dizer "dia 3 feito em 12/09" e nao da para devolver, no dia 7, a linha
// do dia 1 com a data. O mapa e auditavel; tudo o mais e DERIVADO dele.
//
// Por isso nao existe campo `diaActual` no disco (e `diaActual` = feitos + 1),
// e nao existe campo `ultimaConclusion` separado: dois campos que podem
// discordar acabam discordando, e foi assim que nasceu, no app que serviu de
// molde, o bug "conclui o dia 3 e ele voltou pro 2".
//
// TAMANHO: o registro e limitado por construcao — no maximo sete entradas —,
// entao nao ha poda a fazer aqui. O unico crescimento livre e o texto dela, e
// quem limita isso e a tela (MAX_NOTA), no campo, antes de gravar.
//
// ATENCAO: 'ritual' TEM de estar em CLAVES_HILO_ROJO (screens/AjustesScreen.js).
// Fora daquela lista, esta chave sobrevive ao "Borrar todo" — e ela guarda
// texto livre sobre a vida amorosa da usuaria, o que transformaria a politica
// de privacidade da ficha de loja em declaracao falsa.
// ===========================================================================

/* Constantes (DIAS, NUDOS, CIERRE) SO para reexportar e para contar: elas sao o
 * PT e sao avaliadas no import. Quem produz texto para a tela usa as FUNCOES —
 * cierre() e nudos() —, que leem o idioma ativo na hora da chamada. Ver OS TRES
 * IDIOMAS em datos/ritual.js. */
import { CIERRE, DIAS, DURACION, NUDOS, cierre, getDia, nudos } from '../datos/ritual.js';
import { borrarSeguro, guardarSeguro, leerSeguro } from './almacen.js';

const CLAVE = 'ritual';

/** A chave nua. Importada por screens/AjustesScreen.js — nunca digitada la. */
export const CLAVE_RITUAL = CLAVE;

/** Teto do campo de texto na TELA. O disco grava o que vier, sem cortar. */
export const MAX_NOTA = 600;

export { DURACION };

/* =================================================================================
 * CLAVES_TEXTO_RITUAL — a lista fechada da copy DAS TELAS do ritual.
 *
 * POR QUE ELA EXISTE, e por que a falta dela era um buraco e nao um detalhe:
 * datos/ritual.js (os sete dias) ja era varrido pelo portao de test/madremaria-ritual.test.js
 * com sugiereContacto(), hablaDelFuturo() e a lista de culpa condicional. As
 * frases que a usuaria mais le — 'O dia {n} abre amanha', o rodape do espelho, o
 * fim do ritual — nao moram la: moram no bloco `ritual.*` de datos/textos.js, que
 * o comentario daquele bloco chama, com todas as letras, de "o lugar onde e facil
 * escorregar para o castigo". Esse bloco nao era varrido por nada: test/copy-promessa-app-inteiro.test.js
 * cobre o repositorio inteiro, mas so com padroes de desfecho, genero, saude,
 * streak e prova social — nenhum deles pega "so faltam tres dias", "voce
 * interrompeu" ou "nao desista agora".
 *
 * Ou seja: a regra estava escrita em comentario nos dois arquivos e nao existia
 * em lugar nenhum como portao. Agora existe. Chave nova no bloco `ritual.*` de
 * datos/textos.js entra AQUI no mesmo commit — senao ela nasce sem varredura.
 *
 * (Mesmo papel de CLAVES_TEXTO_MISSOES em lib/missoes.js, que ja citava esta
 * constante pelo nome antes de ela existir.)
 * ================================================================================= */
export const CLAVES_TEXTO_RITUAL = Object.freeze([
  'ritual.sobreceja',
  'ritual.titulo',
  'ritual.cargando',
  'ritual.carta.rotulo',
  'ritual.carta.sinContacto',
  'ritual.carta.sinFuturo',
  'ritual.carta.nota',
  'ritual.pregunta.rotulo',
  'ritual.campo.placeholder',
  'ritual.campo.nota',
  'ritual.gesto.rotulo',
  'ritual.gesto.nota',
  'ritual.cerrar',
  'ritual.hecho.rotulo',
  'ritual.hecho.proximo',
  'ritual.hecho.porque',
  'ritual.hecho.escrito',
  'ritual.hecho.sinTexto',
  'ritual.espejo.rotulo',
  'ritual.espejo.fecha',
  'ritual.espejo.pie',
  'ritual.espejo.sinTexto',
  'ritual.fin.sobreceja',
  'ritual.fin.titulo',
  'ritual.fin.cuerpo',
  'ritual.fin.guardado',
  'ritual.fin.reiniciar',
  'ritual.fecha',
  'ritual.meses',
]);

/* =================================================================================
 * DATA — as mesmas dez linhas de lib/hilo.js e lib/limiteDiario.js, de proposito.
 *
 * Sao tres motores independentes e nenhum deve quebrar porque o outro mudou; um
 * quarto modulo de data custaria mais em acoplamento do que economiza. Dia
 * LOCAL, nunca UTC: as 22h no Brasil o dia UTC ja e amanha, e a trava de um
 * passo por dia abriria sozinha para quem le de noite — que e o horario deste
 * app.
 * ================================================================================= */

function hoyLocal() {
  const d = new Date();
  const pad = (n, largo = 2) => String(n).padStart(largo, '0');
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* As duas linhas que TODA funcao publica repete, num lugar so.
 *
 * Encontrado por teste de mutacao: o default de `unoPorDia` estava escrito
 * quatro vezes (na funcao pura e nos tres wrappers). Trocar o da funcao pura
 * para `false` — a mutacao obvia, e a que um refactor distraido faria — nao
 * derrubava teste nenhum, porque os wrappers passavam o valor deles por cima.
 * Um default duplicado e um default que nao existe: quem le acredita nele, e
 * ele nao decide nada. Agora ha um so, e mexer nele quebra o portao na hora. */
const conUnoPorDia = (opciones) => opciones.unoPorDia !== false;
const conHoy = (opciones) => (esDiaValido(opciones.hoy) ? opciones.hoy : hoyLocal());

// Round-trip, nao regex: /^\d{4}-\d{2}-\d{2}$/ aceita '2026-13-45', que nunca e
// igual a hoje — e uma data assim no disco abriria a trava de um-por-dia para
// sempre, em silencio.
function esDiaValido(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(anio, mes - 1, dd));
  return t.getUTCFullYear() === anio && t.getUTCMonth() === mes - 1 && t.getUTCDate() === dd;
}

// Diferenca em dias de calendario, ancorada em UTC: as strings ja sao dias
// locais, e montar Date local aqui faria o horario de verao devolver 0,96 dia.
export function _diasEntre(desde, hasta) {
  if (!esDiaValido(desde) || !esDiaValido(hasta)) return null;
  const [a1, m1, d1] = desde.split('-').map(Number);
  const [a2, m2, d2] = hasta.split('-').map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000);
}

/* =================================================================================
 * MOTIVOS — a resposta de `puedeConcluir` e { ok, motivo }, nunca uma excecao.
 *
 * A tela precisa do MOTIVO para escrever a frase certa, e as frases sao muito
 * diferentes entre si: 'yaHechoHoy' e uma constatacao serena ("o passo de hoje
 * ja esta feito"), 'diaAdelante' e um limite do formato, 'ritualConcluido' e a
 * medalha. Lancar excecao apagaria essa diferenca e a tela cairia num catch
 * generico com uma frase que serve para tudo — ou seja, para nada.
 *
 * O que NENHUMA destas frases pode dizer: "volte amanha para nao perder". No
 * instante em que a tela do dia bloqueado insinuar perda, a doutrina caiu.
 * ================================================================================= */
export const MOTIVOS = Object.freeze({
  DIA_INVALIDO: 'diaInvalido',
  DIA_ADELANTE: 'diaAdelante',
  YA_CONCLUIDO: 'yaConcluido',
  YA_HECHO_HOY: 'yaHechoHoy',
  RITUAL_CONCLUIDO: 'ritualConcluido',
});

const VACIO = Object.freeze({ v: 1, hechos: Object.freeze([]) });

/* =================================================================================
 * SANEAMENTO NA LEITURA, nunca na escrita.
 *
 * Storage e entrada externa: pode ter sido editado a mao no devtools, ter
 * sobrado de uma versao anterior ou ter vindo truncado. Nada aqui lanca.
 *
 * A lista e reduzida ao maior PREFIXO CONTIGUO comecando em 1: {1,2,5} vira
 * {1,2}. Nao se pula dia neste ritual, entao um estado que diga o contrario
 * esta errado, e o erro se corrige PARA BAIXO — o 5 nao podia existir. O que
 * ela fez de verdade (1 e 2, com as datas e as notas) continua intocado.
 * ================================================================================= */
function normalizar(bruto) {
  if (!bruto || typeof bruto !== 'object' || !Array.isArray(bruto.hechos)) return VACIO;

  const porDia = new Map();
  for (const item of bruto.hechos) {
    if (!item || typeof item !== 'object') continue;
    const dia = Number(item.dia);
    if (!Number.isInteger(dia) || dia < 1 || dia > DURACION) continue;
    if (!esDiaValido(item.fecha)) continue;
    // Primeira ocorrencia vence: um disco com o dia 1 duplicado nao pode ter a
    // nota original sobrescrita por uma copia mais nova.
    if (porDia.has(dia)) continue;
    porDia.set(dia, {
      dia,
      fecha: item.fecha,
      // A nota so pode ser string ou null. Verbatim: nem trim, nem corte.
      nota: typeof item.nota === 'string' && item.nota.trim().length > 0 ? item.nota : null,
    });
  }

  const hechos = [];
  for (let d = 1; d <= DURACION; d += 1) {
    if (!porDia.has(d)) break; // o prefixo contiguo termina aqui
    hechos.push(Object.freeze(porDia.get(d)));
  }
  return Object.freeze({ v: 1, hechos: Object.freeze(hechos) });
}

/**
 * O estado como esta no disco, sanitizado. Nunca escreve e nunca lanca.
 * @returns {Promise<{v: number, hechos: ReadonlyArray<{dia:number,fecha:string,nota:string|null}>}>}
 */
export async function leerRitual() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return VACIO;
  try {
    return normalizar(JSON.parse(bruto));
  } catch {
    return VACIO;
  }
}

/* =================================================================================
 * DERIVADOS — funcoes PURAS sobre o estado. Sem disco, sem Date.now() escondido.
 * E o que as faz testaveis em node:test sem mock, e o que garante que duas telas
 * nunca contem a mesma coisa de dois jeitos: um app que se contradiz sozinho e
 * pior que um que erra junto.
 * ================================================================================= */

/** Quantos passos ela ja deu. */
export function diasHechos(estado) {
  return estado && Array.isArray(estado.hechos) ? estado.hechos.length : 0;
}

/** O passo de hoje: feitos + 1. NUNCA e guardado no disco. null quando acabou. */
export function diaActual(estado) {
  const n = diasHechos(estado);
  return n >= DURACION ? null : n + 1;
}

/** A data do ultimo passo, ou null. Derivada — nao existe campo com este nome. */
export function ultimaFecha(estado) {
  const n = diasHechos(estado);
  return n ? estado.hechos[n - 1].fecha : null;
}

/** As datas reais dos passos, em ordem. E o que a tela do dia 7 desenha. */
export function fechasHechas(estado) {
  return diasHechos(estado) ? estado.hechos.map((h) => h.fecha) : [];
}

/* Nos: concessao 100% DERIVADA da contagem. Nada de no e gravado, entao nao
 * existe no dessincronizado do progresso — nem para mais, nem para menos. */
export function nudosPara(n) {
  return nudos().filter((nudo) => n >= nudo.marco);
}

/**
 * O proximo no ainda nao atado, ou null no fim.
 *
 * NAO E, E NAO PODE VIRAR, UM "FALTAM X NOITES". Esta linha de doc dizia
 * exatamente isso — "e o 'faltam X noites' da tela" — e era a unica frase do
 * modulo que mandava desenhar uma contagem regressiva. Contagem regressiva e a
 * forma mais barata de transformar acompanhar em cobrar: ela mede a pessoa pelo
 * que ainda NAO fez, todo dia, sem que ela tenha pedido. A mesma regra ja esta
 * escrita em datos/textos.js para as conquistas ("nao existe 'faltam 12 cartas',
 * nao existe porcentagem e nao existe contagem regressiva") e vale igual aqui.
 *
 * O uso legitimo e um so: saber o NOME do proximo marco (para uma tela que queira
 * dize-lo sem numero) e, principalmente, alimentar a diferenca que produz
 * `nudosNuevos` em concluirDia — o no que acabou de ser atado, que se comemora
 * uma vez. O que ela FEZ, nunca o que falta.
 */
export function proximoNudo(n) {
  return nudos().find((nudo) => n < nudo.marco) || null;
}

/**
 * As duas travas, puras, com o motivo NOMEADO.
 * @param {boolean} unoPorDia true por omissao. false so em QA.
 */
export function puedeConcluirCon(estado, dia, hoy, unoPorDia = true) {
  const hechos = diasHechos(estado);
  if (!Number.isInteger(dia) || dia < 1 || dia > DURACION) {
    return { ok: false, motivo: MOTIVOS.DIA_INVALIDO };
  }
  if (hechos >= DURACION) return { ok: false, motivo: MOTIVOS.RITUAL_CONCLUIDO };
  if (dia <= hechos) return { ok: false, motivo: MOTIVOS.YA_CONCLUIDO };
  // TRAVA 1 — so o dia atual pode ser concluido. Nao se pula para a frente.
  if (dia > hechos + 1) return { ok: false, motivo: MOTIVOS.DIA_ADELANTE };

  // TRAVA 2 — um passo por dia LOCAL.
  //
  // A comparacao e por diferenca de dias, e nao por igualdade de string, por
  // causa do RELOGIO PARA TRAS: com `ultima === hoy` uma data guardada no
  // FUTURO (relogio adiantado, leitura, relogio corrigido) nao casaria com
  // nada, a trava abriria sozinha e ela faria varios passos numa noite. Aqui
  // `diff <= 0` cobre os dois casos — mesmo dia e dia guardado no futuro — e o
  // estado nao anda. Tambem nao REGRIDE: nada e apagado e nenhuma data e
  // reancorada, porque reancorar seria reescrever a data de um passo que ela
  // ja deu, e essa data e justamente o que o dia 7 devolve. Nao se corrige o
  // relogio da pessoa mexendo na memoria dela.
  if (unoPorDia) {
    const ultima = ultimaFecha(estado);
    const diff = ultima ? _diasEntre(ultima, hoy) : null;
    if (diff !== null && diff <= 0) return { ok: false, motivo: MOTIVOS.YA_HECHO_HOY };
  }

  return { ok: true, motivo: null };
}

/* =================================================================================
 * LEITURA/ESCRITA — o disco so nas bordas.
 * ================================================================================= */

/**
 * @param {number} dia
 * @param {{hoy?: string, unoPorDia?: boolean}} [opciones]
 * @returns {Promise<{ok: boolean, motivo: string|null}>}
 */
export async function puedeConcluir(dia, opciones = {}) {
  const hoy = conHoy(opciones);
  const unoPorDia = conUnoPorDia(opciones);
  return puedeConcluirCon(await leerRitual(), dia, hoy, unoPorDia);
}

/**
 * O resumo que a tela do ritual mostra. Nao escreve nada.
 *
 * `bloqueadoHoy` e a unica coisa que a tela precisa saber sobre a trava, e o
 * texto que ela desenha ai e uma constatacao — nunca "volte amanha para nao
 * perder", nunca contagem regressiva.
 */
export async function resumenRitual(opciones = {}) {
  const hoy = conHoy(opciones);
  const unoPorDia = conUnoPorDia(opciones);
  const estado = await leerRitual();
  const hechos = diasHechos(estado);
  const actual = diaActual(estado);
  const permiso = actual === null
    ? { ok: false, motivo: MOTIVOS.RITUAL_CONCLUIDO }
    : puedeConcluirCon(estado, actual, hoy, unoPorDia);

  return {
    estado,
    diasHechos: hechos,
    diaActual: actual,
    paso: actual === null ? null : getDia(actual),
    completo: hechos >= DURACION,
    empezado: hechos > 0,
    bloqueadoHoy: !permiso.ok && permiso.motivo === MOTIVOS.YA_HECHO_HOY,
    motivo: permiso.motivo,
    ultimaFecha: ultimaFecha(estado),
    fechas: fechasHechas(estado),
    nudos: nudosPara(hechos),
    proximoNudo: proximoNudo(hechos),
  };
}

/**
 * Conclui UM passo. E a unica funcao deste arquivo que escreve.
 *
 * @param {number} dia
 * @param {{nota?: string, hoy?: string, unoPorDia?: boolean}} [opciones]
 * @returns {Promise<{ok: boolean, motivo: string|null, estado: object,
 *   nudosNuevos: Array, persistido: boolean}>}
 *
 * A forma do retorno e SEMPRE a mesma, com ou sem sucesso, para a tela nao ter
 * dois caminhos de render.
 *
 * `nudosNuevos` sai da DIFERENCA por id entre antes e depois — recalcular a
 * lista inteira faria a tela comemorar "Uma noite" outra vez no dia 4. Comparar
 * por id (e nao por rotulo) faz com que trocar o idioma no meio do ritual nao
 * recomemore nada.
 */
export async function concluirDia(dia, opciones = {}) {
  const hoy = conHoy(opciones);
  const unoPorDia = conUnoPorDia(opciones);
  const estado = await leerRitual();

  const permiso = puedeConcluirCon(estado, dia, hoy, unoPorDia);
  if (!permiso.ok) {
    // Nada e gravado: o disco fica byte a byte como estava.
    return { ok: false, motivo: permiso.motivo, estado, nudosNuevos: [], persistido: false };
  }

  const antes = new Set(nudosPara(diasHechos(estado)).map((n) => n.id));
  const siguiente = normalizar({
    v: 1,
    hechos: [
      ...estado.hechos,
      {
        dia,
        fecha: hoy,
        // VERBATIM. O unico julgamento e "tem alguma coisa escrita?"; o texto
        // em si entra como veio, com espacos, quebras de linha e acentos.
        nota: typeof opciones.nota === 'string' ? opciones.nota : null,
      },
    ],
  });

  const persistido = await guardarSeguro(CLAVE, JSON.stringify(siguiente));
  const nudosNuevos = nudosPara(diasHechos(siguiente)).filter((n) => !antes.has(n.id));

  return { ok: true, motivo: null, estado: siguiente, nudosNuevos, persistido };
}

/**
 * O ESPELHO — a linha do dia 1, com a data em que foi deixada.
 *
 * Devolve { texto, fecha } ou null. `texto` e exatamente o que ela gravou: este
 * modulo nao corta, nao completa, nao adjetiva e NAO COMPARA com nada. No
 * instante em que esta funcao devolver um veredito ("voce estava assim, agora
 * esta assim"), o app vira o funil com voz de terapeuta.
 *
 * null tem dois significados que a tela trata igual — nao chegou ao dia 1, ou
 * chegou e nao escreveu nada. Nos dois casos o dia 7 usa CIERRE.sinEspejo, para
 * que a melhor cena do produto nao quebre justo para quem so tocou nos botoes.
 */
export async function espejoDelDia1() {
  const estado = await leerRitual();
  const primero = estado.hechos[0];
  if (!primero || primero.dia !== 1 || typeof primero.nota !== 'string') return null;
  return { texto: primero.nota, fecha: primero.fecha };
}

/** O molde do dia 7 ja escolhido: com espelho ou sem. A tela so desenha. */
export async function cierreDelRitual() {
  const espejo = await espejoDelDia1();
  return espejo
    ? { conEspejo: true, plantilla: cierre().conEspejo, fecha: espejo.fecha, texto: espejo.texto }
    : { conEspejo: false, plantilla: cierre().sinEspejo, fecha: null, texto: null };
}

/**
 * Zera o ritual inteiro. Existe por UM motivo: quem terminou os sete dias e
 * quer refazer. NAO e, e nao pode virar, uma funcao de "recuperar" — nao ha o
 * que recuperar, porque faltar nao tira nada de ninguem.
 */
export async function reiniciarRitual() {
  return borrarSeguro(CLAVE);
}

export default {
  CLAVE_RITUAL,
  DURACION,
  MOTIVOS,
  leerRitual,
  resumenRitual,
  puedeConcluir,
  concluirDia,
  espejoDelDia1,
  cierreDelRitual,
  reiniciarRitual,
};

// Reexportado para as telas nao importarem de dois lugares para desenhar um dia.
export { DIAS, NUDOS, CIERRE, getDia };
