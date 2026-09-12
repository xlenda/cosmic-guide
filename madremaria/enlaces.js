// madremaria/enlaces.js — O MAPA DE URL DA MADRE MARIA.
//
// Uma entrada por <Stack.Screen> de MadreMariaApp.js, mais as abas. O App.js do
// Cosmic aninha este objeto sob o path 'amor':
//
//     [ROUTES.MADRE_MARIA]: { path: 'amor', screens: ENLACES_MADRE }
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE SEPARADO (leia antes de mover o mapa de volta)
// ===========================================================================
// O mapa pertence, por clareza, ao lado das <Stack.Screen> que ele descreve —
// mas nao PODE morar la, e o motivo e a razao de este arquivo existir:
//
//   · MadreMariaApp.js entra no Cosmic por `lazy(() => import(...))`, de
//     proposito: a Madre so baixa quando alguem toca o card. Importar o mapa
//     de la no App.js resolveria o modulo na hora, o `lazy` viraria decoracao
//     e a Madre inteira (21 telas, o baralho, a tipografia) entraria no chunk
//     da Home — que todo visitante paga.
//   · O `linking` e lido pelo NavigationContainer ANTES de qualquer tela
//     montar. Ele nao pode esperar um chunk preguicoso: um mapa que chega
//     depois e um mapa que nao existiu quando a URL foi resolvida.
//
// Este arquivo resolve os dois: ele importa SO `routes.js` (strings) e o mapa
// das abas. Zero React, zero tela, zero react-native — custo desprezivel no
// chunk principal, e o `lazy` da tela continua valendo.
//
// A REGRA PARA QUEM ACRESCENTAR TELA: rota sem entrada aqui nao muda a URL na
// web. Nao ha link compartilhavel, o F5 devolve a pessoa para a Home do Cosmic
// e o Voltar do navegador SAI DO APP — tudo isso sem erro nenhum em lugar
// nenhum, que e o jeito mais silencioso de perder alguem no meio do funil.
// test/madremaria-apresentacao.test.js vigia a entrada da porta.

import { ENLACES_ABAS, NOMBRE_ABAS } from './navegacion-enlaces';
import RUTAS from './routes';

/**
 * O mapa, na ordem em que as telas aparecem no Stack de MadreMariaApp.js.
 *
 * A APRESENTACAO e string vazia de proposito: e a porta da feature, e a porta
 * merece a URL curta (/cosmic-guide/amor). Os caminhos sao em portugues porque
 * aparecem na barra de enderecos de quem usa; os NOMES DE ROTA continuam sendo
 * os tecnicos, sem acento, como manda routes.js.
 */
export const ENLACES_MADRE = Object.freeze({
  [RUTAS.APRESENTACAO]: '',
  [RUTAS.ONBOARDING]: 'perguntas',
  [RUTAS.LEITURA_ENTRADA]: 'leitura',
  [RUTAS.LEITURA_PROFUNDA]: 'leitura-profunda',
  [RUTAS.REOUVIR_ENTRADA]: 'reouvir',

  // As abas trazem o proprio mapa: quem acrescentar uma aba edita um lugar so.
  [NOMBRE_ABAS]: { screens: ENLACES_ABAS },

  [RUTAS.SINTESIS]: 'sintese',
  [RUTAS.PAYWALL]: 'assinar',
  [RUTAS.RITUAL]: 'ritual',
  [RUTAS.AJUSTES]: 'ajustes',
  [RUTAS.METODO]: 'metodo',
  [RUTAS.AYUDA]: 'ajuda',
  [RUTAS.PRIVACIDAD]: 'privacidade',
  [RUTAS.TERMINOS]: 'termos',
});

export default ENLACES_MADRE;
