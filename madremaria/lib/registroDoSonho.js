// lib/registroDoSonho.js
// O registro do gesto do sonho — o texto que ela escreve no dia do ritual
// 'sonho', guardado POR DIA.
//
// Nasceu de um bug achado pelo dono em 01/09: o cartao do ritual mandava
// "escreva o que voce lembra" e fechava com "o sonho de hoje esta escrito com
// a data — daqui a um mes ele ainda vai estar aqui"... sem campo nenhum na
// tela. Promessa sem entrega, dupla: nao havia onde escrever, e nao havia
// historico que sustentasse o "daqui a um mes".
//
// FORMATO ('sonho'): { dias: { 'YYYY-MM-DD': 'texto', ... } }.
// HISTORICO de verdade, porque a promessa e de historico. O teto de 90 dias
// cobre "daqui a um mes" com folga tripla; estourou, cai o mais antigo.
import { guardarSeguro, leerSeguro } from './almacen.js';

const CLAVE = 'sonho';
const TETO = 90;
const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;

async function lerTudo() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return {};
  try {
    const dato = JSON.parse(bruto);
    return dato && dato.dias && typeof dato.dias === 'object' ? dato.dias : {};
  } catch (e) {
    return {};
  }
}

/** O sonho escrito naquele dia, ou ''. Nunca lanca. */
export async function lerSonho(dia) {
  const dias = await lerTudo();
  const texto = dias[dia];
  return typeof texto === 'string' ? texto : '';
}

/**
 * Grava o texto do dia. Devolve false quando ficou so na memoria da sessao
 * (o mesmo contrato de guardarSeguro — a tela avisa em vez de fingir).
 * Texto vazio APAGA o dia: ela tem o direito de desescrever um sonho.
 */
export async function guardarSonho(dia, texto) {
  if (!DIA_RE.test(String(dia))) return false;
  const dias = await lerTudo();
  const limpo = typeof texto === 'string' ? texto : '';
  if (limpo.trim()) dias[dia] = limpo;
  else delete dias[dia];

  const chaves = Object.keys(dias).sort();
  while (chaves.length > TETO) delete dias[chaves.shift()];

  return guardarSeguro(CLAVE, JSON.stringify({ dias }));
}

export default { lerSonho, guardarSonho };
