// madremaria/lib/porta.js — A PORTA. Por onde a Madre Maria abre.
//
// Isto vivia dentro do App.js do Madre Maria (hayPerfil + o Promise.all da
// Raiz). Aqui e um modulo proprio por um motivo pratico: MadreMariaApp.js tem
// JSX, e a suite do Cosmic roda em node puro (node --test), que nao o parseia.
// Regra de negocio dentro de arquivo com JSX e regra que nenhum teste executa —
// ela so poderia ser conferida por leitura de texto-fonte, que e o que o
// briefing chama de "teste que sempre passa".
//
// Zero import de React. Zero import de navegacion.js (que traz o Tab.Navigator
// inteiro junto): o nome da rota-host chega por ARGUMENTO. Assim este arquivo
// carrega em node sem tocar em react-native.

import { onboardingCompleto } from '../datos/preguntas.js';
import RUTAS from '../routes.js';

/* A chave que decide por onde a Madre abre. Chave NUA: lib/almacen.js aplica o
 * prefixo sozinho e sempre ('mm-hr.' dentro do Cosmic). Escrever 'mm-hr.perfil'
 * aqui geraria 'mm-hr.mm-hr.perfil' e a Madre abriria no onboarding para
 * sempre, sem erro nenhum. Mesma constante de screens/PerfilScreen.js. */
export const CLAVE_PERFIL = 'perfil';

/**
 * Ja existe perfil no disco?
 *
 * "Tem string gravada" NAO basta. String podre, JSON pela metade ou onboarding
 * abandonado no meio abririam as abas e a pessoa cairia numa tela de sequencia
 * sem nunca ter feito uma leitura. O portao e o mesmo do onboarding —
 * onboardingCompleto() de datos/preguntas.js — para que nao existam duas
 * definicoes de "pronta" no projeto.
 *
 * Aceita os dois formatos que screens/PerfilScreen.js ja le: as respostas cruas
 * e o envelope { respuestas: {...} }. Nunca lanca: qualquer duvida vira `false`,
 * e o pior caso e a pessoa reencontrar a apresentacao, nunca uma tela quebrada.
 *
 * @param {string|null} bruto  o que voltou de leerSeguro('perfil')
 * @returns {boolean}
 */
export function hayPerfil(bruto) {
  if (typeof bruto !== 'string' || !bruto.trim()) return false;
  let dato;
  try {
    dato = JSON.parse(bruto);
  } catch {
    return false;
  }
  if (!dato || typeof dato !== 'object') return false;
  const respuestas = dato.respuestas && typeof dato.respuestas === 'object' ? dato.respuestas : dato;
  return onboardingCompleto(respuestas);
}

/**
 * Qual rota a Madre abre, dados os dois sinais do disco.
 *
 * O FUNIL TEM TRES PASSOS, e esta e a unica linha de codigo que enxerga os tres:
 *
 *   sem perfil ................................. APRESENTACAO (a Madre Maria se
 *                                                apresenta, depois as 5 perguntas)
 *   com perfil, sem leitura de entrada ......... LEITURA_ENTRADA (as 3 cartas)
 *   com os dois ................................ as ABAS (o tabuleiro de 365 casas)
 *
 * A ORDEM DOS DOIS TESTES E DELIBERADA. Perfil primeiro: sem as cinco respostas
 * a leitura de entrada perde o nome na abertura e o filtro do contato duro nos
 * convites, e mandar alguem para ela antes do onboarding seria entregar a
 * leitura pela metade. E o marcador da leitura sozinho NUNCA basta para pular o
 * onboarding — um disco meio apagado abriria a Madre numa pessoa sem respostas,
 * que e a tela de sequencia vazia que hayPerfil() existe para impedir.
 *
 * @param {string|null} perfilBruto  o que voltou de leerSeguro('perfil')
 * @param {boolean} entradaFeita     jaFezLeituraDeEntrada()
 * @param {string} nombreAbas        NOMBRE_ABAS de navegacion.js. Chega por
 *   argumento e nao por import para este modulo nao arrastar o Tab.Navigator
 *   (e com ele react-native inteiro) para dentro de um teste de node puro.
 * @returns {string} nome de rota do Stack de MadreMariaApp.js
 */
export function rotaDeAbertura(perfilBruto, entradaFeita, nombreAbas) {
  if (!hayPerfil(perfilBruto)) return RUTAS.APRESENTACAO;
  return entradaFeita ? nombreAbas : RUTAS.LEITURA_ENTRADA;
}

export default { CLAVE_PERFIL, hayPerfil, rotaDeAbertura };
