// lib/escada.js — EM QUE DEGRAU DO DEGELO ELA ESTA.
//
// ===========================================================================
// O QUE E
// ===========================================================================
// As 105 missoes que pedem acao com a outra pessoa estao ordenadas em nove
// degraus (datos/escada.js), do mais leve — uma frase gentil num post, onde
// nao existe recusa possivel — ao de coragem real: o convite com hora e lugar,
// o erro assumido por inteiro.
//
// Este arquivo guarda UM numero: a altura em que ela esta. O motor do dia
// (lib/missaoDoDia.js) usa esse numero como TETO — nada acima sai.
//
// ===========================================================================
// COMO SOBE, E POR QUE NAO E O CALENDARIO QUE MANDA
// ===========================================================================
// Sobe quando ela CUMPRE uma missao daquele degrau. Nao sobe por tempo, nao
// sobe por login, e nunca sobe duas vezes no mesmo dia: quem cumpriu hoje sobe
// hoje, e o proximo degrau comeca amanha.
//
// O que faz subir e SEMPRE um ato dela — enviou, perguntou, entregou,
// convidou. Nunca uma resposta que chegou. Isso e deliberado: a escada nao
// pode transformar o silencio da outra pessoa em fracasso dela.
//
// NAO EXISTE DESCER POR CASTIGO. Um dia sem cumprir nao derruba nada; a altura
// fica onde esta e a missao do dia seguinte vem do mesmo degrau, com outro
// gesto. A unica descida possivel e a que ELA pede (`recuar`), para quando o
// passo pesou mais do que ela aguentava hoje.
//
// ===========================================================================
// DISCO
// ===========================================================================
// Chave 'escada' (prefixo hr. em lib/almacen.js), no formato
// `{ degrau: 1..9, em: 'YYYY-MM-DD' }`. `em` e o dia da ultima subida, e existe
// so para impedir duas subidas no mesmo dia.
//
// A chave entra em CLAVES_HILO_ROJO (o Apagar tudo) e na Privacidade no MESMO
// commit — e a regra da casa para toda chave nova.
//
// NUNCA LANCA: disco ausente, JSON podre, numero fora da faixa, tudo cai no
// degrau 1. Uma preferencia ilegivel nao pode tirar a missao do dia de ninguem.
import { guardarSeguro, leerSeguro } from './almacen.js';
import { DEGRAUS_DA_ESCADA, degrauDaMissao } from '../datos/escada.js';

const CLAVE = 'escada';
const PRIMEIRO = 1;

/** Um degrau valido, sempre. Lixo vira o primeiro. */
export function normalizarDegrau(bruto) {
  const n = Math.round(Number(bruto));
  if (!Number.isFinite(n)) return PRIMEIRO;
  return Math.min(DEGRAUS_DA_ESCADA, Math.max(PRIMEIRO, n));
}

/** O estado gravado, sanitizado. `{ degrau, em }`. Nunca lanca. */
export async function lerEscada() {
  let bruto = null;
  try {
    bruto = await leerSeguro(CLAVE);
  } catch {
    return { degrau: PRIMEIRO, em: null };
  }
  if (!bruto) return { degrau: PRIMEIRO, em: null };
  try {
    const d = JSON.parse(bruto);
    return {
      degrau: normalizarDegrau(d?.degrau),
      em: typeof d?.em === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.em) ? d.em : null,
    };
  } catch {
    return { degrau: PRIMEIRO, em: null };
  }
}

/** O numero que o motor do dia usa como teto. */
export async function degrauDeHoje() {
  const { degrau } = await lerEscada();
  return degrau;
}

async function gravar(estado) {
  try {
    await guardarSeguro(CLAVE, JSON.stringify(estado));
  } catch {
    /* disco negado: a sessao segue no degrau que ela ja viu na tela */
  }
  return estado;
}

/**
 * Ela cumpriu a missao do dia. Se a missao era do degrau atual, sobe um — uma
 * vez por dia, e nunca alem do ultimo.
 *
 * Missao sem degrau (as que se completam sozinhas) nao move a escada: o
 * trabalho interno continua sendo metade do caminho, mas nao e o que abre a
 * proxima porta.
 *
 * @param {string} dia 'YYYY-MM-DD'
 * @param {object} missao a missao cumprida
 * @returns {Promise<{degrau:number, em:string|null, subiu:boolean}>}
 */
export async function cumpriuNaEscada(dia, missao) {
  const atual = await lerEscada();
  const d = degrauDaMissao(missao);
  const subiu = d > 0 && d >= atual.degrau && atual.em !== dia && atual.degrau < DEGRAUS_DA_ESCADA;
  if (!subiu) return { ...atual, subiu: false };
  const novo = { degrau: atual.degrau + 1, em: dia };
  await gravar(novo);
  return { ...novo, subiu: true };
}

/**
 * Ela pede para voltar um degrau — o passo pesou mais do que aguentava hoje.
 * E o unico caminho de descida, e ele e dela: o app nunca rebaixa ninguem.
 */
export async function recuar() {
  const atual = await lerEscada();
  if (atual.degrau <= PRIMEIRO) return { ...atual, recuou: false };
  const novo = { degrau: atual.degrau - 1, em: atual.em };
  await gravar(novo);
  return { ...novo, recuou: true };
}

export default lerEscada;
