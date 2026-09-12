// lib/sinastria.js
// O MOTOR do ritmo dos dois: dois signos solares entram, a leitura do par sai.
// O conteudo (os textos) mora em datos/sinastria.js; aqui e so calculo,
// resolucao de placeholder e a persistencia do signo que ela deu.
//
// ===================================================================================
// O CALCULO, E DE ONDE ELE VEM (portado do Cosmic Guide em 01/09/2026)
// ===================================================================================
// A distancia entre dois signos e o caminho MAIS CURTO no zodiaco: 0..6, sem
// direcao. Cada distancia e uma figura, e a tabela e de Ptolomeu:
//
//   0 copresenca  · 1 aversao30 · 2 sextil · 3 quadratura
//   4 trigono     · 5 aversao150 · 6 oposicao
//
// DUAS armadilhas herdadas de la, ja pagas uma vez naquele codigo:
//   · d=0 NAO e "conjuncao": Ptolomeu enumera quatro aspectos e conjuncao nao
//     esta entre eles. O nome da casa e copresenca.
//   · aversao30 e aversao150 sao a MESMA familia e leituras DIFERENTES
//     (Tetrabiblos I.16); colapsar as duas num texto so e proibido.
//
// ===================================================================================
// O QUE ESTE MODULO SE RECUSA A FAZER, por doutrina
// ===================================================================================
//   · Nota, placar, porcentagem ou ranking de par — a tradicao que este app
//     cita (Goodman, 1968/78) e PROSA SEM PERCENTUAL, e numero aqui viraria
//     veredito.
//   · Afirmar o que a outra pessoa sente ou fara. Os textos falam do RITMO
//     entre dois signos, nunca da vontade de alguem.
//   · Pedir mais que o signo. Um signo solar e 1 em 12 — nao identifica
//     ninguem, e e por isso que o pedido e aceitavel na tela de privacidade.

/* `tabela(nome)` e nao as seis constantes: as constantes de datos/sinastria.js sao
 * o PORTUGUES, e ler elas aqui congelaria o ritmo do par em portugues nos tres
 * idiomas. `tabela` resolve pelo idioma ativo com fallback por chave para o PT.
 * Os portoes de doutrina continuam importando as constantes direto de lá — e e
 * assim que eles varrem a copy PT, que e onde a regra nasce. */
import { tabela } from '../datos/sinastria.js';
import { borrarSeguro, guardarSeguro, leerSeguro } from './almacen.js';
/* O ROTULO do signo, so para o que entra DENTRO da frase. SIGNOS abaixo continua
 * congelado em portugues porque e indice do zodiaco (a distancia depende dele),
 * chave de `indiceDoSigno` e valor gravado no disco por `guardarSignoDaPessoa`.
 * Sem isto, `resolver()` injetava 'Touro' cru num texto ingles ja traduzido:
 * "{el:terra} wants it done well" virava "Touro wants it done well". */
import { rotuloDoSigno } from './nomesDoCeu.js';

/* A ordem zodiacal e a unica ordem que o calculo aceita: a distancia depende do
 * INDICE, e um sort alfabetico daria quadratura onde ha trigono. */
export const SIGNOS = Object.freeze([
  'Áries',
  'Touro',
  'Gêmeos',
  'Câncer',
  'Leão',
  'Virgem',
  'Libra',
  'Escorpião',
  'Sagitário',
  'Capricórnio',
  'Aquário',
  'Peixes',
]);

/* Elemento por indice zodiacal: fogo, terra, ar, agua, repetindo. A chave e SEM
 * acento ('agua') de proposito — ver o cabecalho de datos/sinastria.js. */
const ELEMENTOS = Object.freeze(['fogo', 'terra', 'ar', 'agua']);

const ID_POR_DISTANCIA = Object.freeze([
  'copresenca',
  'aversao30',
  'sextil',
  'quadratura',
  'trigono',
  'aversao150',
  'oposicao',
]);

/** O indice zodiacal do signo, ou -1. Aceita o nome exatamente como SIGNOS o
 *  escreve — quem normaliza entrada de tela e a tela, nao o motor. */
export function indiceDoSigno(nome) {
  return SIGNOS.indexOf(nome);
}

/** 'fogo' | 'terra' | 'ar' | 'agua', ou null para nome desconhecido. */
export function elementoDoSigno(nome) {
  const i = indiceDoSigno(nome);
  return i === -1 ? null : ELEMENTOS[i % 4];
}

/** A distancia mais curta entre dois signos no zodiaco: 0..6, sem direcao. */
export function distanciaEntre(signoA, signoB) {
  const a = indiceDoSigno(signoA);
  const b = indiceDoSigno(signoB);
  if (a === -1 || b === -1) return null;
  const d = (((b - a) % 12) + 12) % 12;
  return d > 6 ? 12 - d : d;
}

/** O id da figura entre os dois signos, ou null. */
export function aspectoEntre(signoA, signoB) {
  const d = distanciaEntre(signoA, signoB);
  return d === null ? null : ID_POR_DISTANCIA[d];
}

/* A chave do par de elementos, na MESMA ordem em que datos/sinastria.js a
 * escreveu (alfabetica): 'agua+fogo', nunca 'fogo+agua'. */
function chaveDoPar(elA, elB) {
  return [elA, elB].sort().join('+');
}

/* Resolve {el:fogo} etc. pelo NOME do signo daquele lado. Nos pares mistos
 * exatamente um lado tem cada elemento, entao a resolucao nunca e ambigua; nos
 * pares iguais o texto nao tem placeholder e sai intacto. */
function resolver(texto, signoA, signoB) {
  if (!texto) return null;
  return texto.replace(/\{el:(fogo|terra|ar|agua)\}/g, (tudo, el) => {
    /* A COMPARACAO usa o canonico (elementoDoSigno indexa SIGNOS por nome
     * portugues); o que SUBSTITUI e o rotulo do idioma ativo. */
    if (elementoDoSigno(signoA) === el) return rotuloDoSigno(signoA);
    if (elementoDoSigno(signoB) === el) return rotuloDoSigno(signoB);
    return tudo; // nao deveria acontecer; deixar o placeholder a vista e melhor que inventar
  });
}

/**
 * A leitura inteira do par, ou null se algum signo nao existe.
 *
 * `dela` e o signo de quem usa o app; `daPessoa` e o que ela digitou. A ordem
 * nao muda o calculo (a distancia nao tem direcao), mas muda a resolucao dos
 * placeholders — e por isso os dois entram separados.
 */
export function ritmoDoPar(dela, daPessoa) {
  const aspecto = aspectoEntre(dela, daPessoa);
  if (!aspecto) return null;
  const elDela = elementoDoSigno(dela);
  const elPessoa = elementoDoSigno(daPessoa);
  const par = chaveDoPar(elDela, elPessoa);
  return {
    aspecto,
    nomeAspecto: tabela('NOME_DO_ASPECTO')[aspecto],
    cama: resolver(tabela('CAMA_POR_ELEMENTOS')[par], dela, daPessoa),
    camaFigura: tabela('CAMA_POR_ASPECTO')[aspecto],
    conversa: resolver(tabela('CONVERSA_POR_ELEMENTOS')[par], dela, daPessoa),
    briga: resolver(tabela('BRIGA_POR_ELEMENTOS')[par], dela, daPessoa),
    comoFalar: tabela('FALAR_POR_ELEMENTO')[elPessoa],
  };
}

/* ===================================================================================
   PERSISTENCIA — o signo que ela deu, e nada alem dele.
   A chave esta em CLAVES_HILO_ROJO (screens/AjustesScreen.js): o "Apagar tudo"
   leva isto junto, senao a tela de privacidade mente.
   =================================================================================== */
const CLAVE = 'sinastria';

/** Grava o signo da pessoa amada. Nome fora de SIGNOS nao grava e devolve false. */
export async function guardarSignoDaPessoa(signo) {
  if (indiceDoSigno(signo) === -1) return false;
  await guardarSeguro(CLAVE, JSON.stringify({ signo }));
  return true;
}

/** O signo guardado, ou null (nunca lanca; lixo no disco vira null). */
export async function lerSignoDaPessoa() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return null;
  try {
    const dato = JSON.parse(bruto);
    return dato && indiceDoSigno(dato.signo) !== -1 ? dato.signo : null;
  } catch (e) {
    return null;
  }
}

/** Apaga so o signo — o botao "trocar" da tela usa isto. */
export async function apagarSignoDaPessoa() {
  await borrarSeguro(CLAVE);
}

export default {
  SIGNOS,
  indiceDoSigno,
  elementoDoSigno,
  distanciaEntre,
  aspectoEntre,
  ritmoDoPar,
  guardarSignoDaPessoa,
  lerSignoDaPessoa,
  apagarSignoDaPessoa,
};
