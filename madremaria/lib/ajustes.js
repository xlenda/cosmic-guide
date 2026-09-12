// lib/ajustes.js — AS DUAS PREFERENCIAS DO APARELHO: movimento e vibracao.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE
// ===========================================================================
// Ate hoje `leerAjustes` morava em screens/AjustesScreen.js, com esta nota ao
// lado dela, escrita por quem a colocou la:
//
//   "Exportada daqui porque hoje esta tela e a unica dona destas duas chaves.
//    No dia em que uma segunda tela precisar ler movimiento/haptica, estas
//    quatro funcoes mudam de casa para lib/ajustes.js sem trocar de assinatura."
//
// Esse dia chegou: components/TextoNoRitmo.js precisa saber se a vibracao esta
// ligada antes de dar o toquinho a cada frase nova da leitura profunda. Um
// componente importando uma TELA arrastaria junto o expo-notifications, o Modal
// de "apagar tudo" e a arvore inteira de Ajustes para dentro do carrossel — por
// um booleano. Entao a casa mudou, exatamente como a nota mandou, e as
// assinaturas continuam as mesmas.
//
// screens/AjustesScreen.js segue reexportando `CLAVE_AJUSTES`,
// `AJUSTES_POR_DEFECTO` e `leerAjustes` para nao quebrar quem ja importava de
// la. CLAVES_HILO_ROJO (a lista do "Apagar tudo") NAO se muda: ela continua na
// tela, que e onde cinco arquivos de teste a procuram pelo nome.
//
// ===========================================================================
// CONTRATO
// ===========================================================================
//  · NUNCA lanca. Disco ausente, JSON podre, valor de outro tipo: tudo cai no
//    padrao. Uma preferencia ilegivel nao pode derrubar a tela que a le.
//  · O padrao de `haptica` e LIGADA, e o de `movimiento` e 'sistema'. Quem
//    nunca abriu Ajustes recebe o comportamento normal do aparelho.
//  · `haptica: bruto.haptica !== false` — so o `false` explicito desliga. Um
//    disco antigo, gravado antes de o campo existir, continua com vibracao.
import { guardarSeguro, leerSeguro } from './almacen';

/** A chave NUA (sem o prefixo 'hr.', que lib/almacen.js poe). */
export const CLAVE_AJUSTES = 'ajustes';

/* AS VELOCIDADES DA VOZ (11/09). Tres, e nao um controle continuo: o fecho da
 * leitura profunda tem 4:33, e o que resolve isso e 1,5x (3:02) ou 2x (2:17).
 * Mais opcoes viraria menu, e menu no meio de uma leitura e distracao.
 *
 * 1 vem primeiro porque e o padrao: quem nunca tocou no botao ouve no ritmo em
 * que a voz foi gravada. */
export const VELOCIDADES = Object.freeze([1, 1.5, 2]);

export const AJUSTES_POR_DEFECTO = Object.freeze({ movimiento: 'sistema', haptica: true, velocidade: 1 });

/** A proxima velocidade do ciclo. 2 volta para 1 — o botao nunca trava no fim. */
export function proximaVelocidade(atual) {
  const i = VELOCIDADES.indexOf(normalizarVelocidade(atual));
  return VELOCIDADES[(i + 1) % VELOCIDADES.length];
}

/** So as tres conhecidas. Qualquer outra coisa (disco antigo, lixo) vira 1. */
export function normalizarVelocidade(bruto) {
  const n = Number(bruto);
  return VELOCIDADES.includes(n) ? n : 1;
}

/**
 * Sanitiza o que veio do disco. Puro, sincrono, e nunca devolve o objeto de
 * entrada — a tela pode espalhar o retorno sem medo de escrever no padrao.
 * @param {unknown} bruto
 * @returns {{ movimiento: 'sistema'|'reducido', haptica: boolean, velocidade: number }}
 */
export function normalizarAjustes(bruto) {
  if (!bruto || typeof bruto !== 'object') return { ...AJUSTES_POR_DEFECTO };
  return {
    movimiento: bruto.movimiento === 'reducido' ? 'reducido' : 'sistema',
    haptica: bruto.haptica !== false,
    velocidade: normalizarVelocidade(bruto.velocidade),
  };
}

/** Grava so a velocidade, preservando o resto das preferencias. Nunca lanca. */
export async function guardarVelocidade(valor) {
  const atual = await leerAjustes();
  const novo = { ...atual, velocidade: normalizarVelocidade(valor) };
  try {
    await guardarSeguro(CLAVE_AJUSTES, JSON.stringify(novo));
  } catch {
    /* disco cheio ou negado: a sessao segue na velocidade escolhida */
  }
  return novo.velocidade;
}

/** As preferencias como estao no disco, sanitizadas. Nunca lanca. */
export async function leerAjustes() {
  let bruto = null;
  try {
    bruto = await leerSeguro(CLAVE_AJUSTES);
  } catch {
    return { ...AJUSTES_POR_DEFECTO };
  }
  if (!bruto) return { ...AJUSTES_POR_DEFECTO };
  try {
    return normalizarAjustes(JSON.parse(bruto));
  } catch {
    return { ...AJUSTES_POR_DEFECTO };
  }
}

export default leerAjustes;
