// lib/limiteDiario.js
// Uma leitura grátis por dia. Interface pública em espanhol, comentários em
// português.
//
// ===========================================================================
// ESTE LIMITE É LOCAL E DÁ PARA BURLAR. ISSO ESTÁ ACEITO NO v1.
// ===========================================================================
// Sem rodeio: o contador mora no storage do aparelho. Quem reinstalar o app,
// limpar os dados ou abrir numa aba anônima ganha outra leitura grátis. Não
// existe nada aqui que impeça isso, e nada que possa ser feito sem servidor —
// qualquer "proteção" a mais (fingerprint, hash escondido, chave ofuscada) só
// gastaria código para atrasar em minutos quem já decidiu burlar, e ainda
// quebraria na mão de gente honesta que trocou de aparelho.
//
// A decisão é deliberada: o v1 não tem backend (regra 10 do produto), o custo
// da fraude é uma leitura de tarot local e determinística — zero custo marginal
// — e o público que burla não era o público que assinaria.
//
// QUANDO HOUVER SERVIDOR, esta função vira a FACHADA LOCAL de uma checagem
// remota: `puedeLeerHoy()` passa a perguntar ao servidor (com este contador
// como cache otimista e resposta offline) e `registrarLectura()` passa a
// registrar lá também. A ASSINATURA PÚBLICA NÃO MUDA — as telas continuam
// chamando as mesmas duas funções, e nenhuma delas precisa ser reescrita.
// Por isso as duas já são `async` hoje, mesmo sem precisarem ser.
//
// Disco: chave 'limite' com { dia, cuenta } em JSON. O prefixo 'hr.' é assunto
// do lib/almacen.js — aqui a chave é nua.
// ===========================================================================

import { guardarSeguro, leerSeguro } from './almacen.js';

const CLAVE = 'limite';

/**
 * Quantas leituras grátis cabem num dia. Exportado para que a tela e o paywall
 * não escrevam "1" na mão: se o plano mudar, muda aqui e em nenhum outro lugar.
 */
export const LECTURAS_GRATIS_POR_DIA = 1;

// Duplicado de propósito em lib/hilo.js — os dois motores são independentes e
// nenhum deve quebrar porque o outro mudou. Dia LOCAL, nunca UTC: quem lê às
// 22h de Buenos Aires está no dia dela. Ano com 4 dígitos para a comparação de
// strings continuar válida em qualquer relógio.
function hoyLocal() {
  const d = new Date();
  const pad = (n, largo = 2) => String(n).padStart(largo, '0');
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function esDiaValido(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(anio, mes - 1, dd));
  return t.getUTCFullYear() === anio && t.getUTCMonth() === mes - 1 && t.getUTCDate() === dd;
}

/**
 * O dia que vale para o limite.
 *
 * PROTEÇÃO DE RELÓGIO, e ela é assimétrica de propósito:
 *   dia guardado > hoje → VENCE O GUARDADO. Adiantar o relógio, gastar a
 *     leitura e voltar não devolve a leitura. O contador daquele dia continua
 *     de pé até o calendário real alcançá-lo.
 *   dia guardado < hoje → vence hoje. Dia novo, contador zerado.
 *
 * Note a diferença para o lib/hilo.js: lá o relógio para trás é neutro (nem
 * prêmio nem castigo) porque o nó é um presente para a pessoa. Aqui ele é
 * mantido, porque a leitura grátis é um custo do negócio — e a assimetria é a
 * única coisa que o v1 pode fazer contra a burla mais óbvia de todas.
 *
 * Exportada só para os testes exercitarem a virada de dia sem mexer no relógio
 * da máquina.
 */
export function _diaEfectivo(guardado, hoy) {
  const dia = esDiaValido(hoy) ? hoy : hoyLocal();
  if (!esDiaValido(guardado)) return dia;
  // Ambos são YYYY-MM-DD com ano padronizado: comparação de string é
  // comparação de calendário.
  return guardado > dia ? guardado : dia;
}

function enteroSeguro(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

// Storage é entrada externa: pode vir editado, truncado ou de uma versão
// anterior. Nada aqui lança — ilegível vira "dia sem registro", e o pior que
// acontece é a pessoa ganhar a leitura do dia.
async function leerLimite() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return { dia: null, cuenta: 0 };
  try {
    const obj = JSON.parse(bruto);
    if (!obj || typeof obj !== 'object') return { dia: null, cuenta: 0 };
    const dia = esDiaValido(obj.dia) ? obj.dia : null;
    return { dia, cuenta: dia ? enteroSeguro(obj.cuenta) : 0 };
  } catch {
    return { dia: null, cuenta: 0 };
  }
}

// Quantas leituras já foram feitas no dia que vale. Registro de outro dia
// (anterior) não conta; registro de um dia no futuro conta, por causa da
// proteção de relógio acima.
function cuentaDelDia(guardado, dia) {
  return guardado.dia === dia ? guardado.cuenta : 0;
}

/**
 * A pessoa ainda tem a leitura grátis de hoje? Não escreve nada.
 * Nunca lança: em qualquer dúvida devolve `true`, porque bloquear alguém por
 * causa de um storage quebrado é o pior dos dois erros possíveis.
 * @param {string} [hoy] dia YYYY-MM-DD; só os testes passam isto.
 * @returns {Promise<boolean>}
 */
export async function puedeLeerHoy(hoy) {
  const guardado = await leerLimite();
  const dia = _diaEfectivo(guardado.dia, hoy);
  return cuentaDelDia(guardado, dia) < LECTURAS_GRATIS_POR_DIA;
}

/**
 * Registra que uma leitura aconteceu.
 *
 * NÃO é o portão — é o contador. Ela conta mesmo quando `puedeLeerHoy()` já era
 * false (assinante lendo a quarta do dia, por exemplo): quem decide se a tela
 * abre é o chamador, perguntando antes. Misturar as duas responsabilidades aqui
 * faria a função mentir sobre quantas leituras existiram de fato.
 *
 * @param {string} [hoy] dia YYYY-MM-DD; só os testes passam isto.
 * @returns {Promise<{dia: string, cuenta: number, restantes: number, persistido: boolean}>}
 *   dia        — o dia em que a leitura foi contada (pode ser um dia guardado no
 *                futuro, por causa da proteção de relógio)
 *   cuenta     — total de leituras nesse dia, já incluindo esta
 *   restantes  — quantas grátis ainda sobram (nunca negativo)
 *   persistido — true se foi ao disco; false se ficou só na memória da sessão
 */
export async function registrarLectura(hoy) {
  const guardado = await leerLimite();
  const dia = _diaEfectivo(guardado.dia, hoy);
  const cuenta = cuentaDelDia(guardado, dia) + 1;
  const persistido = await guardarSeguro(CLAVE, JSON.stringify({ dia, cuenta }));
  return {
    dia,
    cuenta,
    restantes: Math.max(0, LECTURAS_GRATIS_POR_DIA - cuenta),
    persistido,
  };
}

export default { LECTURAS_GRATIS_POR_DIA, puedeLeerHoy, registrarLectura };
