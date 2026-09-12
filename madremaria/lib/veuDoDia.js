// lib/veuDoDia.js
// A memoria do veu: QUAIS dias ja foram raspados, e quais ainda aceitam o dedo.
//
// ===================================================================================
// AS DUAS REGRAS, dadas pelo dono em 01/09
// ===================================================================================
// 1. UMA CARTA POR DIA. O dia mostrado no plano so abre raspando, e o raspado e
//    daquele dia — no seguinte, o veu volta.
// 2. ONTEM PERDOA, ANTEONTEM NAO. Quem esqueceu um dia pode voltar UM passo e
//    raspar o de ontem; dois para tras esta fechado de vez. E perdao de
//    esquecimento, nao maquina do tempo — e por isso quem decide o que e
//    "ontem" e sempre o relogio, nunca um parametro solto.
//
// O QUE ESTE ARQUIVO NAO FAZ: culpa. lib/ano.js e explicito ("sumir tres
// semanas nao atrasa o ano") e o portao de copy proibe streak que pune. Um dia
// nao raspado do passado e um fato contavel, nunca uma divida.
//
// FORMATO NO DISCO ('planoRaspado'): { dias: ['YYYY-MM-DD', ...] }.
// O formato NASCEU como { dia: 'YYYY-MM-DD' } (so o ultimo) e migra na leitura:
// um disco antigo vira lista de um item, sem perder o dia ja raspado.
import { guardarSeguro, leerSeguro } from './almacen.js';

const CLAVE = 'planoRaspado';

/* O teto da lista. Um ano tem 365 dias; 400 cobre o ano com folga e impede que
 * um laco defeituoso transforme a chave num arquivo sem fim. Estourou, cai o
 * MAIS ANTIGO: o mapa do ano vivo olha para tras no maximo um ano. */
const TETO = 400;

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizar(bruto) {
  if (!bruto) return [];
  try {
    const dato = JSON.parse(bruto);
    if (dato && Array.isArray(dato.dias)) {
      return dato.dias.filter((d) => DIA_RE.test(String(d)));
    }
    // o formato antigo: { dia } — migra para lista de um
    if (dato && DIA_RE.test(String(dato.dia))) return [dato.dia];
  } catch (e) {
    /* lixo no disco = lista vazia; raspar de novo custa dois segundos */
  }
  return [];
}

/** Todos os dias raspados, em ordem de gravacao. Nunca lanca. */
export async function diasRaspados() {
  return normalizar(await leerSeguro(CLAVE));
}

/** Ela ja raspou ESTE dia? */
export async function jaRaspou(dia) {
  const dias = await diasRaspados();
  return dias.indexOf(dia) !== -1;
}

/** Marca o dia como raspado. Data fora do formato nao grava e devolve false. */
export async function marcarRaspado(dia) {
  if (!DIA_RE.test(String(dia))) return false;
  const dias = await diasRaspados();
  if (dias.indexOf(dia) !== -1) return true;
  dias.push(dia);
  while (dias.length > TETO) dias.shift();
  /* O retorno de guardarSeguro PROPAGA: engolir um false aqui fazia o dia
   * parecer raspado num disco que nao gravou — e o veu voltava amanha num dia
   * que ela ja tinha aberto (achado do /code-review de 01/09). */
  return guardarSeguro(CLAVE, JSON.stringify({ dias }));
}

/** O dia local anterior a um 'YYYY-MM-DD', sem passar por fuso nenhum. */
export function diaAnterior(dia) {
  if (!DIA_RE.test(String(dia))) return null;
  const [a, m, d] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(a, m - 1, d - 1));
  const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(t.getUTCDate()).padStart(2, '0');
  return `${t.getUTCFullYear()}-${mm}-${dd}`;
}

/**
 * Este dia ainda aceita o dedo HOJE?
 * So dois aceitam: o proprio hoje, e o ontem — a regra 2 la de cima.
 * Futuro nunca; anteontem para tras nunca.
 */
export function diaAindaAbre(dia, hoje) {
  if (!DIA_RE.test(String(dia)) || !DIA_RE.test(String(hoje))) return false;
  return dia === hoje || dia === diaAnterior(hoje);
}

export default { diasRaspados, jaRaspou, marcarRaspado, diaAnterior, diaAindaAbre };
