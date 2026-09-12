/* ===================================================================================
   A LUA NO SIGNO DELA — o dia especial do mês (04/09).

   A Lua percorre o zodíaco em ~27,3 dias e passa 2-3 dias em cada signo.
   Quando ela passa pelo signo DELA, o app marca: etiqueta "SEU DIA" no
   tabuleiro, glifo do signo na casa e uma linha no cabeçalho do dia.

   HONESTIDADE ASTRONÔMICA: isto é TRÂNSITO MEDIDO (astronomy-engine, a
   mesma régua das lunações de lib/ano.js), no zodíaco tropical — o mesmo
   dos signos do app. Descreve o céu; não promete NADA sobre o dia. A copy
   que consumir isto diz "o céu está no seu signo", nunca "dia de sorte".

   Determinístico e barato: longitude eclíptica da Lua ao meio-dia LOCAL do
   dia civil (lib/ceu.meioDiaLocal — a âncora única do app para "o dia X"),
   com cache por dia (o tabuleiro pergunta 365 vezes por render).
   =================================================================================== */
import * as MOTOR from 'astronomy-engine';

import { esDiaValido, meioDiaLocal } from './ceu.js';
import { SIGNOS } from './signo.js';

const CACHE = new Map();

/** O signo (tropical) em que a Lua está ao meio-dia local do dia. Nunca lança. */
export function signoDaLuaEm(dia) {
  if (CACHE.has(dia)) return CACHE.get(dia);
  let nome = null;
  try {
    if (esDiaValido(dia)) {
      const instante = meioDiaLocal(dia);
      const { lon } = MOTOR.EclipticGeoMoon(instante);
      const idx = Math.floor((((lon % 360) + 360) % 360) / 30);
      nome = SIGNOS[idx] ? SIGNOS[idx].nome : null;
    }
  } catch {
    nome = null;
  }
  CACHE.set(dia, nome);
  return nome;
}

/** true quando a Lua transita o signo dela naquele dia. Sem signo, false. */
export function luaNoSignoDela(dia, signoDela) {
  if (!signoDela) return false;
  return signoDaLuaEm(dia) === signoDela;
}

/** O glifo zodiacal do signo (♈…♓), do catálogo único de lib/signo.js. */
export function glifoDoSigno(nome) {
  const s = SIGNOS.find((x) => x.nome === nome);
  return s ? s.emoji : null;
}
