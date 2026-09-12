// navegacion.js — AS TRES ABAS, e o contrato entre elas e o Stack.
//
// ===========================================================================
// A FORMA DA NAVEGACAO
// ===========================================================================
// Ate aqui o app era um Stack raso: onze telas empilhadas, todas do mesmo peso.
// A partir daqui existem DOIS niveis, e a diferenca entre eles e a razao de este
// arquivo existir:
//
//   ZONAS (as abas)      — Mi Hilo, o PLANO DO DIA e o Perfil. Sao LUGARES: a
//                          pessoa mora neles, alterna entre eles a qualquer
//                          momento e a barra fica visivel o tempo todo.
//                          (A Tirada tambem e uma <Tab.Screen>, mas nao e uma
//                          zona: ela nao tem icone na barra. O porque esta na
//                          <Tab.Screen> dela, la embaixo.)
//   DESTINOS (o Stack)   — Sintesis, Paywall, Ajustes, Ayuda, Privacidad,
//                          Terminos, Metodo. Sao IDAS: abrem POR CIMA das abas,
//                          cobrem a barra e se fecham voltando de onde vieram.
//
// O Onboarding nao e nem um nem outro: e o portao. Fica fora das abas porque
// durante ele a barra NAO pode aparecer — mostrar as tres zonas para quem ainda
// nao fez uma leitura e oferecer um mapa de uma cidade onde ela nunca esteve. E
// exatamente o que o molde faz: a barra so nasce depois.
//
// ===========================================================================
// O NOME DA ROTA-HOST DAS ABAS (leia antes de renomear) — ATUALIZADO 11/09/2026
// ===========================================================================
// Ate 11/09 esta rota se chamava RUTAS.TIRADA, e o bloco que ficava aqui
// justificava o nome com um replace que HOJE NAO EXISTE MAIS. Ele dizia que o
// OnboardingScreen terminava em `navigation.replace(RUTAS.TIRADA, ...)` e que
// renomear a host mataria o fim do onboarding em silencio. Duas coisas mudaram:
//
//   1. OnboardingScreen.js:492 hoje faz `replace(RUTAS.LEITURA_ENTRADA, ...)`.
//      O proprio comentario da linha 473 de la registra a troca.
//   2. A <Tab.Screen> chamada RUTAS.TIRADA saiu em 01/09 (ver abaixo), entao o
//      par de nomes aninhados que o aviso defendia nem pode mais acontecer.
//
// Documentacao que mente e pior que documentacao ausente, entao o bloco foi
// reescrito em vez de copiado. Dentro do Cosmic Guide o VALOR e 'MadreAbas'
// (routes.js), porque o app hospedeiro tem 55 nomes de rota proprios e o nome
// antigo nao descrevia mais nada.
//
// ---------------------------------------------------------------------------
// O QUE CONTINUA VALENDO, E E O UNICO PONTO QUE IMPORTA
// ---------------------------------------------------------------------------
// O mecanismo que o bloco antigo descrevia e REAL e nao mudou:
//
//   · REPLACE so e tratado pelo StackRouter, e so para um nome que esteja na
//     lista de rotas DELE. Fora disso ele devolve `null` — e `null` aqui nao e
//     erro, e "nao tratei": a acao morre em silencio, sem log e sem tela
//     vermelha. (@react-navigation/routers, StackRouter.js:
//     `if (!state.routeNames.includes(name)) return null`.)
//   · O TabRouter nao tem `case 'REPLACE'` nenhum: ele cai no default do
//     BaseRouter, que nao conhece a acao.
//
// Portanto a DISCIPLINA e esta, e ela nao muda nunca:
//
//     TODO replace para as abas vai por NOMBRE_ABAS. NUNCA por string literal.
//
// Assim o VALOR da rota pode mudar (e mudou) sem que nenhuma tela precise ser
// tocada — os 7 call sites importam o alias, nao o texto.
//
// ---------------------------------------------------------------------------
// ANINHADO DENTRO DO COSMIC GUIDE
// ---------------------------------------------------------------------------
// Este Tab.Navigator inteiro e montado como UMA <Stack.Screen> do HomeStack do
// Cosmic (ver madremaria/MadreMariaApp.js). A profundidade fica:
//
//     Tab(Cosmic) > Stack(Home) > Stack(Madre) > Tab(Madre) > tela
//
// O Stack(Madre) e o que garante que os replaces acima continuem encontrando a
// host: ele tem NOMBRE_ABAS na propria lista de rotas. Nada aqui precisou mudar
// para isso funcionar — este arquivo ja era um componente puro que recebe
// { route }.
//
// ===========================================================================
// COMO OS PARAMETROS DA PRIMEIRA LEITURA CHEGAM ATE A TELA
// ===========================================================================
// Aquele replace carrega { respuestas }. Como ele endereca a rota HOSPEDEIRA, os
// parametros pousam nela, e nao na aba. Duas linhas resolvem, e as duas estao em
// Abas() abaixo:
//   1. `initialParams={route.params}` repassa o pacote para a aba da Tirada;
//   2. a presenca de `respuestas` decide qual aba abre primeiro — a Tirada, que e
//      a leitura que a pessoa acabou de destravar, e nao o Mi Hilo vazio.
// Sem (2) a usuaria terminaria o onboarding e cairia numa tela de racha com zero
// nos, o que e o anticlimax perfeito.
//
// (A TiradaScreen ainda sabe se virar sem parametro nenhum — ela le 'respuestas'
// e 'perfil' do disco. Isto aqui e o caminho rapido, nao a unica rota.)

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BarraInferior from './components/BarraInferior';
import { RUTAS } from './routes';
import HiloScreen from './screens/HiloScreen';
import MapaDoAnoScreen from './screens/MapaDoAnoScreen';
import PerfilScreen from './screens/PerfilScreen';
import PlanoScreen from './screens/PlanoScreen';
import { colores } from './theme';

const Tab = createBottomTabNavigator();
/* AS DUAS CONSTANTES DE LINKING MUDARAM DE ARQUIVO (11/09/2026, fusao Cosmic).
 * NOMBRE_ABAS e ENLACES_ABAS agora nascem em ./navegacion-enlaces.js e sao
 * RE-EXPORTADAS daqui — todo import antigo continua valendo.
 *
 * Por que sairam: madremaria/enlaces.js precisa delas para montar o mapa de URL
 * que o NavigationContainer do Cosmic le no arranque, e ESTE arquivo importa
 * quatro telas. Importa-lo do App.js arrastaria a Madre inteira para o chunk da
 * Home e anularia o lazy() que a mantem fora dele. A documentacao das duas foi
 * junto com elas; o bloco grande no topo deste arquivo, sobre o nome da rota ser
 * contrato com o replace do funil, continua valendo e e leitura obrigatoria
 * antes de trocar o valor. */
export { ENLACES_ABAS, NOMBRE_ABAS } from './navegacion-enlaces';

const OPCIONES_ABA = {
  // Cada tela ja desenha o proprio topo (sobreceja + titulo), como no Stack.
  headerShown: false,

  // O teclado do onboarding nao existe aqui, mas o campo de nome do Perfil sim:
  // sem isto a barra sobe empurrada pelo teclado no Android e o FAB fica boiando
  // no meio da tela.
  tabBarHideOnKeyboard: true,
};

// A cena das abas repete o fundo do app. Sem isto sobra o fundo do container do
// navegador entre a tela e a barra durante a troca de aba — uma fresta clara de um
// frame, o oposto do "preto + fio" da marca.
const ESTILO_ESCENA = { backgroundColor: colores.noche };

/**
 * O navegador de abas inteiro, pronto para ser uma <Stack.Screen>.
 *
 * @param {object}  props
 * @param {object} [props.route]  a rota hospedeira; `route.params` vem do replace
 *                                do onboarding quando existe.
 */
export default function Abas({ route }) {
  const parametros = route && route.params ? route.params : undefined;

  // `initialRouteName` so e lido na montagem — e isso e desejado: a decisao vale
  // para o momento em que as abas nascem e nunca move a pessoa depois.
  //
  // SEMPRE O MAPA — a segunda decisao do dono no mesmo dia 01/09 superou a
  // primeira ("dentro do app e o plano"): "o lead tem que ver INTEIRO o mapa
  // dos 365 dias e sua evolucao, igual um jogo de tabuleiro". Quem entra ve o
  // tabuleiro do ano; a casa de hoje leva ao plano, e o FAB continua abrindo o
  // plano direto para quem ja sabe o caminho.
  const abaInicial = RUTAS.MAPA_ANO;

  return (
    <Tab.Navigator
      initialRouteName={abaInicial}
      // 'initialRoute': o voltar do Android sai de qualquer aba para a de entrada e,
      // de la, fecha o app. 'history' criaria uma trilha de abas que a pessoa teria
      // de desfazer toque a toque para conseguir sair.
      backBehavior="initialRoute"
      screenOptions={OPCIONES_ABA}
      sceneContainerStyle={ESTILO_ESCENA}
      // A barra padrao do bottom-tabs nao serve: ela e uma fileira de tres iguais e
      // nao tem o FAB que quebra a linha por cima. A nossa desenha as tres zonas do
      // molde e recebe { state, descriptors, navigation, insets } aqui.
      tabBar={(props) => <BarraInferior {...props} />}
    >
      {/* A ordem aqui e a ordem da PILHA de abas, nao a ordem visual: quem decide
          onde cada zona aparece na barra e components/BarraInferior.js, que procura
          as rotas pelo nome. Mi Hilo vem primeiro por ser a aba de entrada. */}
      {/* O MAPA e a aba de entrada e a zona esquerda da barra. */}
      <Tab.Screen name={RUTAS.MAPA_ANO} component={MapaDoAnoScreen} />

      {/* O FIO virou aba SEM zona na barra (o mesmo estatuto que a Tirada teve):
          continua montado, com URL propria, e a porta visivel e o acesso no
          Perfil. Tirar a tela inteira apagaria o registro dos dias dela. */}
      <Tab.Screen name={RUTAS.HILO} component={HiloScreen} />

      {/* O PLANO e a zona do centro: e ele que o FAB abre. */}
      <Tab.Screen name={RUTAS.PLANO} component={PlanoScreen} />

      {/* A TIRADA SAIU DAS ABAS — decisao do dono, 01/09: "nao tem mais cartas
          dentro do aplicativo". As tres cartas com voz vivem no funil e voltam
          por RUTAS.REOUVIR_ENTRADA (a leitura dela, guardada); baralho novo nao
          se tira em lugar nenhum. A rota-Stack HOSPEDEIRA continua se chamando
          RUTAS.TIRADA — aquele nome e contrato (o bloco grande la em cima) — e
          o replace do fim do funil continua enderecando ela normalmente. */}
      <Tab.Screen name={RUTAS.PERFIL} component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export { Abas };
