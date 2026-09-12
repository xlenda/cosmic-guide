// lib/fraseDoDia.js
// A FRASE DO DIA — a mesma para todo mundo no mesmo dia, sem rede, mudando a
// meia-noite local.
//
// Portada em espirito do Cosmic Guide (lib/lovePhrase.js), cujo comentario
// batiza a mecanica de "retencao dupla": um motivo para abrir o app todo dia,
// e um share que traz gente nova quando ela manda a frase para alguem.
//
// Deterministica pelo DIA ABSOLUTO (dias desde 1970 sobre os campos locais),
// a mesma aritmetica do rodizio: mesma frase em qualquer aparelho no mesmo
// dia, e "a frase de amanha" simplesmente nao existe ate amanha.
import { FRASES } from '../datos/frases.js';

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;

function diaAbsoluto(dia) {
  const [a, m, d] = String(dia).split('-').map(Number);
  return Math.floor(Date.UTC(a, m - 1, d) / 86400000);
}

/** A frase daquele dia, ou null para dia invalido / banco vazio. */
export function fraseDoDia(dia) {
  if (!DIA_RE.test(String(dia)) || !FRASES.length) return null;
  return FRASES[diaAbsoluto(dia) % FRASES.length];
}

export default { fraseDoDia };
