// lib/enlaces.js
// A regra que mantem OBJETO fora da barra de enderecos.
// Interface publica em espanhol, comentarios em portugues.
//
// ===========================================================================
// O BUG (medido no navegador, nao suposto)
// ===========================================================================
// Enquanto cada rota do `linking` foi declarada como string simples
// (Sintesis: 'sintesis'), o React Navigation serializou TODOS os params que nao
// estao no caminho como query string, e o serializador e String(valor). Objeto
// vira "[object Object]". A URL real capturada era esta:
//
//   /sintesis?respuestas=%5Bobject%20Object%5D&tirada=%5Bobject%20Object%5D...
//
// Duas consequencias, e a segunda e a grave:
//   (a) a URL fica impresentavel — ninguem compartilha, ninguem cola em lugar
//       nenhum, e qualquer print do produto sai com lixo na barra;
//   (b) RECARREGAR a pagina devolve os params como a STRING LITERAL
//       "[object Object]". A tela nao recebe "nada": recebe lixo com cara de
//       dado, e qualquer `if (params.lectura)` passa a ser verdadeiro sobre uma
//       string. Essa e a diferenca entre uma tela vazia e uma tela errada.
//
// ===========================================================================
// A CORRECAO, E POR QUE ELA E ESTA STRING E NAO OUTRA
// ===========================================================================
// A forma de objeto do linking config ({ path, stringify }) deixa escolher como
// cada param vira texto. O que se quer aqui, porem, nao e "virar texto melhor":
// e NAO ENTRAR na URL.
//
// getPathFromState (@react-navigation/core) tem exatamente um jeito de dizer
// isso, e ele nao esta na documentacao — esta no codigo, e por isso fica escrito
// aqui: pouco antes de montar a query, a funcao apaga todo param cujo valor JA
// serializado seja a string 'undefined'.
//
//     for (let param in focusedParams) {
//       if (focusedParams[param] === 'undefined') delete focusedParams[param];
//     }
//
// A linha existe porque String(undefined) === 'undefined', e devolver a mesma
// string do `stringify` cai no mesmo lugar: o param some da URL inteira.
//
// Devolver '' NAO serve e e a armadilha obvia: query-string escreve a chave nua
// e a URL vira '/sintesis?respuestas=&tirada=' — mais limpa, igualmente errada,
// e ainda entrega uma string vazia para a tela no reload.
//
// ===========================================================================
// O QUE ISTO NAO RESOLVE (e quem resolve)
// ===========================================================================
// Tirar o objeto da URL nao faz o objeto sobreviver a um F5: recarregar remonta
// o app do zero e a rota nasce sem params. Quem cobre isso e a TELA, e as duas
// que recebem objeto ja cobrem — a Tirada relendo 'respuestas'/'perfil' do disco
// e a Sintesis relendo lib/ultimaLectura.js, com saida para as abas quando nao
// ha nada a restaurar. As duas metades andam juntas: esta so limpa a URL.

/* O valor que faz getPathFromState apagar o param. Constante nomeada de
 * proposito: escrito solto no meio de um objeto de configuracao, 'undefined'
 * parece erro de digitacao e a proxima pessoa "conserta" para undefined puro —
 * que devolveria a string "undefined" na URL, porque o stringify so e chamado
 * quando ha valor e o retorno dele nao e checado. */
const FUERA_DE_LA_URL = 'undefined';

/** A funcao de serializacao que remove o param. Uma so instancia para todas as
 *  chaves: ela ignora o valor de proposito. */
export function sinURL() {
  return FUERA_DE_LA_URL;
}

/**
 * Monta o `stringify` do linking para os params que nunca devem aparecer na URL.
 *
 * @example
 *   [RUTAS.SINTESIS]: { path: 'sintesis', stringify: sacarDeLaURL('lectura', 'hilo') }
 *
 * @param {...string} nombres os params a esconder
 * @returns {Record<string, () => string>} congelado, para ninguem o editar em uso
 */
export function sacarDeLaURL(...nombres) {
  const mapa = {};
  for (const nombre of nombres) {
    if (typeof nombre === 'string' && nombre) mapa[nombre] = sinURL;
  }
  return Object.freeze(mapa);
}

export default sacarDeLaURL;
