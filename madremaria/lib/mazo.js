// lib/mazo.js
// O baralho do Fio Vermelho: carrega as 78 cartas e as serve sorteadas.
// Interface pública em espanhol, comentários em português.
//
// ===========================================================================
// REGRA QUE É CONTRATO COM A USUÁRIA — leia antes de mexer em qualquer coisa
// ===========================================================================
// O sorteio NÃO pode ser influenciado pelas respostas do onboarding, nem por
// semente derivada do usuário, nem por hora, nome, resposta de pergunta ou
// qualquer outro dado da sessão. O app diz à usuária que as cartas são
// sorteadas — e isso tem de ser verdade no código, não só no texto da tela.
//
// Por isso este módulo:
//   1. usa Math.random() direto, e nada mais;
//   2. NÃO aceita função de aleatoriedade por parâmetro, NÃO aceita semente e
//      NÃO exporta nenhum ponto de injeção. Um parâmetro `azar` ou `semilla`
//      aqui seria um convite aberto para a próxima onda passar o nome da
//      pessoa ou o id da resposta "para ficar mais personalizado" — e no dia
//      em que isso acontecer o app estará mentindo. A ausência do parâmetro é
//      a defesa;
//   3. não guarda nada, não lê nada, não sabe quem está usando. Duas chamadas
//      seguidas com o mesmo onboarding dão tiradas diferentes, e isso é o
//      comportamento correto, não um bug a ser "consertado" com cache.
//
// Quem quiser testar determinismo troca o global Math.random no teste — que é
// o único lugar onde essa troca é legítima.
//
// ===========================================================================
// COMO O JSON ENTRA AQUI (não troque a forma do import sem ler isto)
// ===========================================================================
// `import ... with { type: 'json' }` é a única forma que atende os dois
// runtimes deste projeto ao mesmo tempo:
//   - Node (npm test): datos/cartas.json é ESM detectado como módulo; sem o
//     atributo `with`, o Node recusa com ERR_IMPORT_ATTRIBUTE_MISSING;
//   - Metro/Expo: babel-preset-expo compila esta linha para
//     require('../datos/cartas.json'), que o Metro resolve nativamente.
// `require()` nu não serve: em Node 22 não existe `require` no escopo de um
// módulo ESM. `readFileSync` também não serve: 'node:fs' não existe no bundle
// do React Native.
// ===========================================================================

import CARTAS from '../datos/cartas.json' with { type: 'json' };

// ~30% de cartas invertidas. Não é regra de tarô canônico — é decisão de
// produto: invertida demais e a leitura fica pesada; de menos e o `consejoInv`
// de cada carta (metade do conteúdo escrito) quase nunca aparece.
export const PROBABILIDAD_INVERTIDA = 0.3;

const PREFIJO_MAYOR = 'major-';

// Congela em profundidade para que nenhuma tela consiga editar uma carta em
// memória. Sem isto, um `sacada.carta.nombre = ...` numa tela contaminaria
// TODAS as tiradas seguintes da sessão, porque o objeto é compartilhado — bug
// que só aparece na segunda tirada e que ninguém liga à tela culpada.
// Em modo estrito (todo módulo ESM é estrito) a tentativa passa a lançar, ou
// seja: o erro estoura em quem escreveu, na hora, e não na tirada seguinte.
function congelarProfundo(carta) {
  if (Array.isArray(carta.claves)) Object.freeze(carta.claves);
  return Object.freeze(carta);
}

/** As 78 cartas, na ordem do arquivo. Congelada. */
export const MAZO = Object.freeze(CARTAS.map(congelarProfundo));

/** Só os 22 Arcanos Maiores ('major-00'..'major-21'). Congelada. */
export const MAYORES = Object.freeze(MAZO.filter((c) => c.id.startsWith(PREFIJO_MAYOR)));

// Map, e não objeto literal: objeto literal herda o prototype, e aí
// cartaPorId('toString') devolveria uma função em vez de null.
const POR_ID = new Map(MAZO.map((c) => [c.id, c]));

/**
 * Busca uma carta pelo id ('major-00', 'copas-07', ...).
 * Devolve null para id desconhecido, valor não-string, null ou undefined.
 * Nunca lança — a tela trata "não achei", não "quebrou".
 */
export function cartaPorId(id) {
  if (typeof id !== 'string') return null;
  return POR_ID.get(id) ?? null;
}

// Fisher-Yates parcial. É o MESMO algoritmo do embaralhamento completo, parado
// depois de `cuantas` posições: cada passo escolhe uniformemente entre as
// cartas ainda não sorteadas e a troca para fora do saco. Duas consequências
// que importam:
//   - a distribuição é uniforme de verdade (não é o `sort(() => Math.random()
//     - 0.5)`, que é enviesado e ainda depende do algoritmo de ordenação);
//   - as cartas saem necessariamente DISTINTAS, porque cada índice sorteado sai
//     do saco no mesmo passo. Não existe laço de "sorteia de novo se repetir",
//     que é onde a versão ingênua costuma travar ou perder a uniformidade.
// Embaralhar as 78 inteiras para tirar 3 daria o mesmo resultado e faria 75
// trocas a mais.
function repartir(lista, cuantas) {
  const indices = lista.map((_, i) => i);
  const total = Math.min(cuantas, indices.length);
  const sacadas = [];

  for (let i = 0; i < total; i += 1) {
    const j = i + Math.floor(Math.random() * (indices.length - i));
    const guardado = indices[i];
    indices[i] = indices[j];
    indices[j] = guardado;
    sacadas.push(sacar(lista[indices[i]]));
  }

  return sacadas;
}

// A orientação é sorteada por carta, independente das outras: numa tirada de
// três, sair nenhuma ou as três invertidas é resultado possível e legítimo.
// O objeto devolvido NÃO é congelado de propósito — ele é novo a cada chamada
// e pertence a quem chamou, que pode querer anexar a posição da tirada. O que
// é congelado é `carta`, que é compartilhada com o baralho.
function sacar(carta) {
  return { carta, invertida: Math.random() < PROBABILIDAD_INVERTIDA };
}

/**
 * A tirada de três. Devolve exatamente 3 cartas DISTINTAS, sorteadas entre as
 * 78 com distribuição uniforme, cada uma como { carta, invertida }.
 *
 * A ordem do array é a ordem das três posições da leitura (0, 1, 2). Este
 * módulo não conhece o nome das posições — quem nomeia é datos/textos.js.
 * Lembrete de doutrina para quem for montar a tela: a terceira posição fala só
 * da usuária e nunca do futuro.
 */
export function sacarTres() {
  return repartir(MAZO, 3);
}

/**
 * Sorteia UMA carta entre os 22 Arcanos Maiores, no mesmo formato
 * { carta, invertida } de cada item de sacarTres() — assim o componente de
 * revelação recebe uma forma só e serve às duas telas.
 *
 * É o que alimenta a carta-surpresa do onboarding: restringir aos Maiores
 * garante que sempre exista fato histórico para mostrar, porque
 * datos/hechos.js cobre exatamente os 22 Maiores e mais nenhum id. Trocar isto
 * por um sorteio entre as 78 faria hechoDeCarta() devolver null em 56 dos 78
 * casos e a tela ficaria sem o bloco DATO VERIFICABLE — que é justamente o
 * substituto honesto da prova social inventada.
 */
export function sacarMayor() {
  return repartir(MAYORES, 1)[0];
}

export default MAZO;
