// madremaria/navegacion-enlaces.js — as DUAS CONSTANTES das abas, sem o peso.
//
// Estas duas viviam em navegacion.js, ao lado das <Tab.Screen> que descrevem, e
// era o lugar certo. Saíram por uma razao so, medida e nao suposta: navegacion.js
// importa QUATRO TELAS (HiloScreen, MapaDoAnoScreen, PerfilScreen, PlanoScreen) e
// a barra inferior. Quem precisa destas duas strings no arranque do app —
// madremaria/enlaces.js, montando o mapa de URL que o NavigationContainer do
// Cosmic le ANTES de qualquer tela existir — arrastaria a Madre Maria inteira
// para dentro do chunk principal e anularia o `lazy()` que a mantem fora da Home.
//
// Este arquivo nao importa nada alem de routes.js (strings puras).
// navegacion.js re-exporta as duas, entao nenhum consumidor antigo quebrou e
// continua valendo importa-las de la.

import { RUTAS } from './routes';

/**
 * O nome da rota do Stack que hospeda as abas.
 *
 * Vale 'MadreAbas' (RUTAS.TIRADA), e esse nome e CONTRATO com o replace que
 * fecha o funil — o bloco grande no topo de navegacion.js conta a historia
 * inteira. Nao trocar sem ler aquilo antes.
 */
export const NOMBRE_ABAS = RUTAS.TIRADA;

/**
 * O pedaco de `linking.config.screens` que descreve o INTERIOR das abas.
 *
 * Quem adicionar uma aba acrescenta a URL dela aqui: na web, rota sem caminho
 * mapeado vira '/', e recarregar a pagina joga a pessoa de volta ao comeco —
 * sem erro nenhum, que e o que torna esse defeito dificil de achar.
 */
export const ENLACES_ABAS = Object.freeze({
  [RUTAS.MAPA_ANO]: 'mapa',
  [RUTAS.HILO]: 'hilo',

  // O plano do dia — a zona do centro, o que o FAB abre.
  [RUTAS.PLANO]: 'plano',

  /* A aba da Tirada saiu em 01/09 junto com a TiradaScreen — nenhuma carta
   * dentro do app. A URL '/tirada' de um favorito antigo cai no fallback. */

  [RUTAS.PERFIL]: 'perfil',
});

export default { NOMBRE_ABAS, ENLACES_ABAS };
