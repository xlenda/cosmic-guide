// lib/profunda.js
// O PROGRESSO DO CARROSSEL DA LEITURA PROFUNDA — e so ele.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE
// ===========================================================================
// Pelo mesmo motivo de lib/entrada.js: tres arquivos precisam falar da MESMA
// chave de disco, e tres copias de uma string nua em tres arquivos e como nasce
// a chave que o "Apagar tudo" nao apaga.
//
//   · screens/LeituraProfundaScreen.js  ESCREVE (qual card ela viu, o que ouviu);
//   · screens/PerfilScreen.js           LE, para dizer se a leitura ficou pendente;
//   · screens/AjustesScreen.js          LISTA, para o "Apagar tudo" apagar.
//
// A chave 'profunda' esta em CLAVES_HILO_ROJO. Sem essa linha ela sobrevive ao
// "Apagar tudo" e a politica de privacidade da ficha de loja vira declaracao
// falsa — e test/madremaria-gamificacao.test.js varre este diretorio exatamente atras
// disso: toda `const CLAVE... = '...'` de lib/ tem de estar naquela lista.
//
// ===========================================================================
// O QUE SE GUARDA, E O QUE NAO
// ===========================================================================
//   { visto: 0..4, ouvidos: ['profunda-7', ...], fim: true|false }
//
//   visto    o card MAIS LONGE que ela alcancou. Nunca anda para tras: voltar
//            para o card 1 nao apaga que ela chegou no 4.
//   ouvidos  os blocos cujo audio ela de fato TOCOU. E o unico dado que permite
//            ao Perfil dizer "voce ainda nao ouviu" sem mentir — ter visto o
//            card e ter ouvido a voz sao coisas diferentes, e a diferenca e o
//            produto inteiro.
//   fim      ela saiu pelo botao do ultimo card ("a sua primeira lua comeca
//            agora"), e nao pelo "Pular".
//
// NAO se guarda tempo de escuta, posicao do audio, nem nada do que ela escreve:
// o carrossel nao pede nada escrito.
//
// ===========================================================================
// A ANCORA DO ANO NAO SE TOCA AQUI
// ===========================================================================
// Este modulo NUNCA escreve na chave 'ano'. A ancora do dia 1 das treze luas
// nasce uma vez so, na conclusao das tres cartas (lib/entrada.js explica por
// que), e quem reouve a leitura profunda no mes 7 nao pode ser devolvida a
// lunacao 1. Se um dia este arquivo precisar do inicio da jornada, ele LE de
// lib/entrada.js — nunca grava.
//
// ===========================================================================
// CHAVE NUA
// ===========================================================================
// 'profunda', sem prefixo. lib/almacen.js aplica 'hr.' sozinho e SEMPRE:
// escrever 'hr.profunda' aqui gravaria 'hr.hr.profunda', a leitura voltaria
// vazia para sempre e o progresso nunca seria encontrado — sem erro nenhum.

import { guardarSeguro, leerSeguro } from './almacen.js';

/** O progresso do carrossel. Chave NUA, ja listada em CLAVES_HILO_ROJO. */
export const CLAVE_PROFUNDA = 'profunda';

/** O estado de quem ainda nao abriu o carrossel nenhuma vez. */
export const PROFUNDA_VAZIA = Object.freeze({ visto: 0, ouvidos: [], fim: false });

/* Saneia o que veio do disco. Disco podre, JSON pela metade, campo com o tipo
 * errado: tudo vira o estado vazio, do mesmo jeito que lib/entrada.js trata o
 * marcador. O pior caso de um estado vazio errado e o Perfil dizer "voce ainda
 * nao ouviu" para quem ouviu; o pior caso do contrario e esconder a leitura de
 * quem nunca a recebeu. */
function sanear(bruto) {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return { ...PROFUNDA_VAZIA };
  const visto = Number(bruto.visto);
  return {
    visto: Number.isInteger(visto) && visto > 0 ? visto : 0,
    ouvidos: Array.isArray(bruto.ouvidos)
      ? [...new Set(bruto.ouvidos.filter((id) => typeof id === 'string' && id.trim()))]
      : [],
    fim: bruto.fim === true,
  };
}

/* A FILA DE ESCRITA.
 *
 * Toda gravacao aqui e um ciclo ler-modificar-escrever, e a tela dispara duas
 * delas quase juntas: marcar o card visto (ao deslizar) e marcar o audio ouvido
 * (ao tocar). Sem fila, as duas leem o mesmo estado antigo e a segunda escrita
 * apaga a primeira — a falha e MUDA e so aparece como "o Perfil disse que eu nao
 * ouvi". A fila serializa as gravacoes deste modulo dentro da sessao.
 *
 * O `.then(tarefa, tarefa)` roda a proxima tarefa mesmo depois de uma falha: uma
 * gravacao que estourou nao pode travar a fila para sempre. */
let fila = Promise.resolve();

function enfileirar(tarefa) {
  const proxima = fila.then(tarefa, tarefa);
  fila = proxima.catch(() => {});
  return proxima;
}

/**
 * O progresso como esta no disco, saneado. Nunca lanca.
 *
 * @returns {Promise<{visto: number, ouvidos: string[], fim: boolean}>}
 */
export async function lerProfunda() {
  const bruto = await leerSeguro(CLAVE_PROFUNDA);
  if (typeof bruto !== 'string' || !bruto.trim()) return { ...PROFUNDA_VAZIA };
  try {
    return sanear(JSON.parse(bruto));
  } catch {
    return { ...PROFUNDA_VAZIA };
  }
}

/* O unico ponto de escrita. Recebe o estado atual e devolve o proximo; quem
 * chama nunca monta o objeto inteiro na mao. */
function atualizar(mudanca) {
  return enfileirar(async () => {
    const atual = await lerProfunda();
    const proximo = mudanca(atual);
    await guardarSeguro(CLAVE_PROFUNDA, JSON.stringify(proximo));
    return proximo;
  });
}

/**
 * Marca que ela chegou ate este card. Nunca anda para tras.
 *
 * @param {number} indice  o card, base 0
 */
export function marcarCardVisto(indice) {
  const n = Number(indice);
  if (!Number.isInteger(n) || n < 0) return Promise.resolve(null);
  return atualizar((atual) => ({ ...atual, visto: Math.max(atual.visto, n) }));
}

/**
 * Marca que ela TOCOU o audio deste bloco. Chamado pelo callback do botao de
 * ouvir — nao por ter visto o card.
 *
 * @param {string} id  o id do bloco em datos/profunda.js
 */
export function marcarOuvido(id) {
  if (typeof id !== 'string' || !id.trim()) return Promise.resolve(null);
  return atualizar((atual) =>
    (atual.ouvidos.includes(id) ? atual : { ...atual, ouvidos: [...atual.ouvidos, id] })
  );
}

/**
 * Ela saiu pelo botao do ultimo card, e nao pelo "Pular". `fim` nunca volta a
 * ser false: uma segunda passada pelo carrossel nao desfaz a primeira.
 */
export function marcarFimDaProfunda() {
  return atualizar((atual) => (atual.fim ? atual : { ...atual, fim: true }));
}

/**
 * Ela ja ouviu alguma coisa desta leitura? E a pergunta que o Perfil faz para
 * decidir se marca a linha como pendente.
 *
 * @returns {Promise<boolean>}
 */
export async function jaOuviuAlgoDaProfunda() {
  const estado = await lerProfunda();
  return estado.ouvidos.length > 0;
}

export default {
  CLAVE_PROFUNDA,
  PROFUNDA_VAZIA,
  lerProfunda,
  marcarCardVisto,
  marcarOuvido,
  marcarFimDaProfunda,
  jaOuviuAlgoDaProfunda,
};
