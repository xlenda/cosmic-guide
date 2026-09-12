// lib/nomesDoCeu.js
// O ROTULO VISIVEL dos nomes proprios do ceu, nos tres idiomas.
//
// ===================================================================================
// O DEFEITO QUE ESTE ARQUIVO EXISTE PARA FECHAR
// ===================================================================================
// FASES e REGENTE_POR_DIA (lib/ceu.js) e SIGNOS (lib/sinastria.js e lib/signo.js)
// sao CONGELADOS em portugues de proposito: sao identificadores, casam byte a byte
// com datos/rituais.js (`momento.fasesLua`), com GLIFO_POR_PLANETA, com o que
// `guardarSignoDaPessoa` grava no disco e com o indice do zodiaco. Traduzir o
// VALOR faria o casamento parar em silencio — o cabecalho de ceu.js ja avisa isso.
//
// So que esses mesmos valores entram por INTERPOLACAO em chaves que os tradutores
// traduziram certo ({fase}, {regente}, {dela}, {daPessoa}, {signo}), e o resultado
// na tela de quem le em ingles era frase hibrida:
//
//   "Today's Moon is in Lua Cheia."        (plano.ceu.fase)
//   "Friday, day of Venus[PT]"             (plano.encaixe.criterio.dia)
//   "Aries[PT] and Touro - opposition."    (plano.ritmo.par)
//
// Pior que nao traduzir, porque parece defeito do app.
//
// ===================================================================================
// A FORMA: VALOR TECNICO EM PT, ROTULO POR IDIOMA
// ===================================================================================
// NADA aqui troca o valor canonico. `rotuloDaFase('Lua Cheia')` devolve o que a
// PESSOA le; 'Lua Cheia' continua sendo o que o CODIGO compara. Os dois vivem
// juntos e nunca se misturam: quem compara usa o valor, quem desenha usa o rotulo.
//
// POR QUE AQUI E NAO EM datos/textos.js (que seria o lugar obvio, via lista()):
// lista() resolve array por POSICAO, e posicao e exatamente o que nao se pode
// confiar a um arquivo de traducao editado a mao — uma linha a mais no ES e a lua
// cheia de hoje vira quarto minguante, sem erro e sem log, com o app desenhando
// normalmente. Aqui a tabela e indexada pelo PROPRIO NOME CANONICO: chave errada
// nao desloca nada, cai no fallback e o portao de tres idiomas reclama.
//
// O FALLBACK e o mesmo de t(): idioma ativo -> PT -> o valor canonico cru. Nome
// que este arquivo nao conhece sai em portugues na tela (honesto e visivel),
// nunca vazio e nunca undefined.
//
// ===================================================================================
// AS FORMAS CONSAGRADAS, E DE ONDE ELAS VEM
// ===================================================================================
// Nome astronomico nao se traduz ao pe da letra: tem forma corrente em cada
// idioma, e e ela que entra aqui.
//   · fases: as oito da nomenclatura usual de almanaque. 'Lua Gibosa Crescente'
//     e "Waxing Gibbous" / "Luna Gibosa Creciente" — "gibbous" e o termo tecnico
//     em ingles, nao "bulging".
//   · 'Lua Crescente' (a fase 1, o fio fino) e "Waxing Crescent" / "Luna
//     Creciente"; 'Quarto Crescente' (a fase 2, meia lua) e "First Quarter" /
//     "Cuarto Creciente". As duas sao DIFERENTES e em ingles nao compartilham
//     palavra nenhuma — colapsar as duas em "Crescent" apagaria a meia lua.
//   · planetas: os sete classicos. Em ingles perdem o acento e Lua/Sol viram
//     Moon/Sun; em espanhol mantem a forma latina (Mercurio SEM acento, que e a
//     grafia castelhana, e Jupiter COM ele).
//   · signos: os doze latinos. Em ingles sao os nomes latinos crus (Aries,
//     Taurus, Gemini...), nao traducao — "Bull" e "Twins" nao existem em
//     astrologia de lingua inglesa; em espanhol a forma castelhana corrente.
// ===================================================================================

import { idiomaMadre } from '../datos/textos.js';
import { FASES, REGENTE_POR_DIA } from './ceu.js';
import { SIGNOS } from './sinastria.js';

/* As oito fases, nas chaves de FASES — e a ordem nao importa aqui de proposito:
 * a tabela e um mapa por NOME, nao um array por posicao. O portao confere chave
 * por chave contra FASES em vez de confiar nesta escrita. */
const FASE = Object.freeze({
  es: Object.freeze({
    'Lua Nova': 'Luna Nueva',
    'Lua Crescente': 'Luna Creciente',
    'Quarto Crescente': 'Cuarto Creciente',
    'Lua Gibosa Crescente': 'Luna Gibosa Creciente',
    'Lua Cheia': 'Luna Llena',
    'Lua Gibosa Minguante': 'Luna Gibosa Menguante',
    'Quarto Minguante': 'Cuarto Menguante',
    'Lua Minguante': 'Luna Menguante',
  }),
  en: Object.freeze({
    'Lua Nova': 'New Moon',
    'Lua Crescente': 'Waxing Crescent',
    'Quarto Crescente': 'First Quarter',
    'Lua Gibosa Crescente': 'Waxing Gibbous',
    'Lua Cheia': 'Full Moon',
    'Lua Gibosa Minguante': 'Waning Gibbous',
    'Quarto Minguante': 'Last Quarter',
    'Lua Minguante': 'Waning Crescent',
  }),
});

/* Os sete da semana planetaria, nas chaves de REGENTE_POR_DIA — COM acento, que e
 * como ceu.js as escreve ('Mercúrio', 'Júpiter', 'Vênus'). */
const PLANETA = Object.freeze({
  es: Object.freeze({
    Sol: 'Sol',
    Lua: 'Luna',
    Marte: 'Marte',
    'Mercúrio': 'Mercurio',
    'Júpiter': 'Júpiter',
    'Vênus': 'Venus',
    Saturno: 'Saturno',
  }),
  en: Object.freeze({
    Sol: 'Sun',
    Lua: 'Moon',
    Marte: 'Mars',
    'Mercúrio': 'Mercury',
    'Júpiter': 'Jupiter',
    'Vênus': 'Venus',
    Saturno: 'Saturn',
  }),
});

/* Os doze, nas chaves de SIGNOS. A MESMA tabela serve lib/signo.js, que escreve
 * os mesmos doze nomes no campo `.nome` — e o portao confere que os dois
 * catalogos continuam batendo um com o outro. */
const SIGNO = Object.freeze({
  es: Object.freeze({
    'Áries': 'Aries',
    Touro: 'Tauro',
    'Gêmeos': 'Géminis',
    'Câncer': 'Cáncer',
    'Leão': 'Leo',
    Virgem: 'Virgo',
    Libra: 'Libra',
    'Escorpião': 'Escorpio',
    'Sagitário': 'Sagitario',
    'Capricórnio': 'Capricornio',
    'Aquário': 'Acuario',
    Peixes: 'Piscis',
  }),
  en: Object.freeze({
    'Áries': 'Aries',
    Touro: 'Taurus',
    'Gêmeos': 'Gemini',
    'Câncer': 'Cancer',
    'Leão': 'Leo',
    Virgem: 'Virgo',
    Libra: 'Libra',
    'Escorpião': 'Scorpio',
    'Sagitário': 'Sagittarius',
    'Capricórnio': 'Capricorn',
    'Aquário': 'Aquarius',
    Peixes: 'Pisces',
  }),
});

/* O fallback honesto, no mesmo molde de valorDe() em datos/textos.js: ramo do
 * idioma ativo -> PT (que e o proprio nome canonico) -> o nome cru como veio.
 * `=== undefined` e nao `||` pelo mesmo motivo de la: rotulo vazio e defeito de
 * traducao e tem de aparecer, nao cair escondido no portugues. */
function rotular(tabela, nome) {
  if (typeof nome !== 'string' || nome === '') return nome;
  const ramo = tabela[idiomaMadre()];
  if (!ramo) return nome; // 'pt' nao tem ramo: o canonico JA e o portugues
  const rotulo = ramo[nome];
  return rotulo === undefined ? nome : rotulo;
}

/** O rotulo visivel de uma fase da lua ('Lua Cheia' -> 'Full Moon'). */
export function rotuloDaFase(nome) {
  return rotular(FASE, nome);
}

/** O rotulo visivel de um planeta ('Venus' -> 'Venus', 'Lua' -> 'Moon'). */
export function rotuloDoPlaneta(nome) {
  return rotular(PLANETA, nome);
}

/** O rotulo visivel de um signo ('Touro' -> 'Taurus'). */
export function rotuloDoSigno(nome) {
  return rotular(SIGNO, nome);
}

/** So para o portao: os tres catalogos crus, para conferir chave por chave contra
 *  FASES, REGENTE_POR_DIA e SIGNOS. Nenhuma tela le isto. */
export const _TABELAS_PARA_TESTE = Object.freeze({
  fase: FASE,
  planeta: PLANETA,
  signo: SIGNO,
  canonicos: Object.freeze({ fase: FASES, planeta: REGENTE_POR_DIA, signo: SIGNOS }),
});

export default Object.freeze({ rotuloDaFase, rotuloDoPlaneta, rotuloDoSigno });
