// madremaria/MadreMariaApp.js — A MADRE MARIA INTEIRA, COMO UMA SO TELA DO COSMIC.
//
// Este arquivo substitui C:/tmp/hilo-rojo/App.js dentro do Cosmic Guide. Ele e
// montado como UMA <Stack.Screen> do HomeStack (App.js do Cosmic), e a arvore
// final fica:
//
//     Tab(Cosmic) > Stack(Home) > [ESTE Stack] > Tab(Madre) > tela
//
// ===========================================================================
// AS CINCO RESPONSABILIDADES DO App.js DE LA, UMA A UMA
// ===========================================================================
// O App.js original declarava fazer cinco coisas. Tres vem, duas nao:
//
//   1. SEGURAR A ARVORE ATE AS 9 FACES — VEM, mas mudou de forma. Ver o bloco
//      FONTES abaixo: aqui elas sao pedidas no mesmo frame em que a tela monta,
//      e a arvore NAO e segurada por um segundo spinner.
//   2. DECIDIR A ROTA INICIAL LENDO O DISCO — VEM, identico (as duas chaves,
//      'perfil' e o marcador de lib/entrada.js, na mesma ordem deliberada).
//   3. MOLDURA DE TELEFONE — NAO VEM. O Cosmic ja tem a dele, e ela e CSS:
//      public/index.html:78-83 (`@media (min-width:600px){ #root{max-width:480px;
//      box-shadow:...} }`). Por ser CSS, um grep por MarcoTelefono em components/
//      do Cosmic nao acha nada e leva a concluir errado que nao existe.
//      Montar components/MarcoTelefono.js aqui daria um cartao de 390px com borda
//      DENTRO de uma coluna de 480px com sombra — duas molduras, duas sombras, e
//      o maxHeight:844 fixo dele cortando o conteudo das telas longas.
//   4. OS PROVEDORES + O PORTAO + AS ABAS + OS DESTINOS — so a segunda metade vem.
//      NavigationContainer, GestureHandlerRootView, SafeAreaProvider e StatusBar
//      ja sao montados pelo Cosmic (App.js do Cosmic: GestureHandlerRootView na
//      linha do return de App(), SafeAreaProvider dentro dele, StatusBar logo
//      abaixo, e o NavigationContainer dentro de Gate()). Montar de novo qualquer
//      um deles e erro: dois NavigationContainer aninhados quebram o linking e o
//      voltar do Android; dois GestureHandlerRootView empilham raizes de gesto.
//      O que VEM e o Stack.Navigator com o portao, as abas e os destinos.
//   5. ISOLAR ERRO DE RENDER — VEM, e e obrigatorio: uma tela da Madre quebrando
//      nao pode derrubar o Cosmic Guide inteiro. Ver LimiteDeErro abaixo.
//
// O `import './lib/camaraExpo'` que abria o App.js de la NAO vem: a camera saiu
// junto com as telas de cafe e palma (que sao UM SO no app — as do Cosmic).
// react-native-gesture-handler ja e o primeiro import do App.js do Cosmic.
//
// ===========================================================================
// LINKING: o CONTAINER e do Cosmic, o MAPA sai daqui
// ===========================================================================
// O `linking` do Madre morria no NavigationContainer dele, e aqui o container e
// o do Cosmic — entao esta tela nao monta linking nenhum. Mas o MAPA (que rota
// tem qual caminho) mora junto das <Stack.Screen> que ele descreve, exportado
// como ENLACES_MADRE la embaixo, e o App.js do Cosmic so o aninha sob 'amor'.
//
// Por que o mapa fica aqui e nao la: rota sem caminho vira '/' na web, e ai o F5
// joga a pessoa na Home do Cosmic e ela perde o lugar — silenciosamente. Quem
// acrescenta uma <Stack.Screen> nova tem de ver a lista de URLs na mesma tela em
// que esta editando; num arquivo distante, esquecer e o caso comum.

import { Component, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';

import BotonPrimario from './components/BotonPrimario';
import { Cuerpo, Titulo, FUENTES } from './components/Texto';
import { CLAVE_PERFIL, rotaDeAbertura } from './lib/porta';
import { IDIOMA_PADRAO, setIdiomaMadre, t } from './datos/textos';
import { useLanguage } from '../context/LanguageContext';
import { leerSeguro } from './lib/almacen';
import { jaFezLeituraDeEntrada } from './lib/entrada';
import Abas, { ENLACES_ABAS, NOMBRE_ABAS } from './navegacion';
import RUTAS from './routes';

// O PORTAO — sem barra, uma vez na vida.
import ApresentacaoScreen from './screens/ApresentacaoScreen';
import OnboardingScreen from './screens/OnboardingScreen';

// OS DESTINOS — idas que abrem POR CIMA das abas e se fecham voltando.
import AjustesScreen from './screens/AjustesScreen';
import AyudaScreen from './screens/AyudaScreen';
import LeituraDeEntradaScreen from './screens/LeituraDeEntradaScreen';
import LeituraProfundaScreen from './screens/LeituraProfundaScreen';
import MetodoScreen from './screens/MetodoScreen';
import PaywallScreen from './screens/PaywallScreen';
import PrivacidadScreen from './screens/PrivacidadScreen';
import ReouvirTresCartasScreen from './screens/ReouvirTresCartasScreen';
import RitualScreen from './screens/RitualScreen';
import SintesisScreen from './screens/SintesisScreen';
import TerminosScreen from './screens/TerminosScreen';

import { colores, espacio } from './theme';

/* ===================================================================================
   FONTES — as 9 faces, carregadas JUNTO com a tela, sem segunda barreira.

   O App.js de la segurava a arvore inteira num `if (!fuentesListas) return <espera/>`.
   Aqui isso seria a SEGUNDA barreira de loading que a pessoa ve: ela ja esperou o
   Suspense do HomeStack baixar o chunk desta rota. Duas esperas seguidas, com o
   mesmo fundo preto, parecem um app travado.

   useFonts() dispara o carregamento na montagem e NAO bloqueia: enquanto as faces
   nao chegam, o React Native desenha na fonte do sistema e repinta quando elas
   entram. E o mesmo custo que `useFuentesListas()` ja aceitava quando o
   carregamento FALHA (ele devolve true nesse caso, deliberadamente — ver o
   comentario dele em components/Texto.js). A diferenca de esperar e um flash de
   fonte; a diferenca de nao esperar e o app abrir.

   Por que AQUI e nao no App.js do Cosmic: as 9 faces pesam 3,99 MB de .ttf. O
   Cosmic nao carrega fonte custom nenhuma hoje (stack de sistema via
   Platform.select). Pendurar isto la faria todo visitante da Home pagar 4 MB
   antes da primeira palavra, por uma tipografia que so esta rota usa.

   FUENTES vem de components/Texto.js — a MESMA constante que useFuentesListas()
   consome. Uma segunda lista de 9 faces aqui seria a chance de as duas divergirem.
   =================================================================================== */
import { useFonts } from 'expo-font';

/* ===================================================================================
   A PORTA — hayPerfil() e rotaDeAbertura() moram em lib/porta.js.

   Elas sairam deste arquivo por um motivo pratico: este tem JSX, e a suite do
   Cosmic roda em node puro (`node --test`), que nao parseia JSX. Regra de
   negocio dentro de arquivo com JSX e regra que nenhum teste EXECUTA — so da
   para conferi-la lendo o texto-fonte, que e o teste que nunca falha.

   Em lib/porta.js elas sao funcoes puras, sem React e sem navegacion.js, e
   test/madremariaPorta.test.js as roda de verdade. A decisao inteira (a ordem
   dos dois testes, por que 'tem string gravada' nao e 'tem perfil') esta
   documentada la.
   =================================================================================== */

/* ===================================================================================
   OPCOES DO STACK — herdadas do App.js de la. Cada linha esta aqui por um defeito
   medido, e por acaso sao as MESMAS decisoes do TRANSICAO_STACK/GESTO_STACK do
   Cosmic (App.js:247 e :255-...): mesmo preset, mesmo gestureEnabled na web,
   mesmo `flex:1` obrigatorio junto do backgroundColor. Nao sao importadas de la
   de proposito — a unica diferenca e a COR de fundo, que aqui e a da Madre, e um
   import que so serve para ser sobrescrito nao economiza nada.
   =================================================================================== */
const OPCIONES_PANTALLA = {
  // Nem a Madre nem o Cosmic tem header: cada tela desenha o proprio topo.
  headerShown: false,

  // A ordem importa: o preset entra ANTES para que as linhas abaixo o corrijam.
  ...TransitionPresets.SlideFromRightIOS,

  // Na web o swipe-back do stack captura o touchmove e MATA a rolagem por dedo
  // em todas as telas. O mouse continua rolando — por isso o teste de desktop
  // nunca pega, e so aparece no celular real.
  gestureEnabled: Platform.OS !== 'web',

  // O stack v6 nasce sem animacao na web.
  animationEnabled: true,

  // `flex: 1` e obrigatorio junto do backgroundColor. So a cor faz o card virar
  // altura-de-conteudo: a tela para de esticar, o que passa da dobra fica
  // inalcancavel e o botao do rodape some sem que nada acuse erro.
  cardStyle: { flex: 1, backgroundColor: colores.noche },
};

const Stack = createStackNavigator();

/* ===================================================================================
   LIMITE DE ERRO — a Madre falha sozinha.

   O Cosmic ja tem um ErrorBoundary, mas ele e a RAIZ: envolve o <App/> inteiro.
   Um erro de render numa tela da Madre subiria ate la e derrubaria o Cosmic Guide
   com ele — a pessoa que tocou "Traga seu amor de volta" perderia o app inteiro,
   inclusive a Home para onde ela voltaria.

   Este boundary para a queda AQUI. A pessoa ve uma tela sobria, no idioma da
   Madre, com uma saida que a devolve para o Cosmic — nunca um stack trace (vazar
   caminho de arquivo e nome de funcao para quem so queria uma leitura).

   Toda a copy sai de datos/textos.js: nenhuma palavra nasce dentro deste arquivo.

   A SAIDA NAO PRECISA DE getParent(). Este componente E a tela do HomeStack: o
   `navigation` que MadreMariaApp recebe por prop e o do Stack DE FORA (o
   HomeStack do Cosmic), nao o de dentro — o Stack da Madre so nasce como filho,
   abaixo daqui. goBack() nele pop-a a rota da Madre inteira e devolve a Home.

   Nao e um reload de pagina como o boundary de la fazia: recarregar levaria o
   Cosmic Guide junto, que e exatamente o que este componente existe para impedir.
   =================================================================================== */
class LimiteDeErro extends Component {
  constructor(props) {
    super(props);
    this.state = { fallo: false };
  }

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error, info) {
    // O detalhe vai para o console do desenvolvedor, nunca para a tela.
    if (__DEV__) {
      console.error('[MadreMaria] Erro nao capturado na arvore:', error, info && info.componentStack);
    }
  }

  sair = () => {
    // Zerar o boundary ANTES de sair: sem isso, voltar a entrar pelo card da
    // Home remontaria esta tela ja com `fallo: true` e a pessoa cairia direto no
    // erro de novo, sem nunca ver a Madre.
    this.setState({ fallo: false });
    const { navigation } = this.props;
    if (typeof navigation?.goBack === 'function') navigation.goBack();
  };

  render() {
    if (!this.state.fallo) return this.props.children;

    return (
      <View style={estilos.fallo}>
        <View style={estilos.falloCaja}>
          <Titulo>{t('app.nombre')}</Titulo>
          <Cuerpo style={estilos.falloCuerpo}>{t('errores.generico')}</Cuerpo>
          <BotonPrimario
            titulo={t('comunes.volver')}
            onPress={this.sair}
            style={estilos.falloBoton}
          />
        </View>
      </View>
    );
  }
}

/* ===================================================================================
   A ARVORE. Separada de MadreMariaApp() de proposito, exatamente como Raiz() era
   la: quando o boundary e zerado, este componente inteiro remonta e refaz a
   pergunta de abertura (ja existe perfil?) do zero.
   =================================================================================== */
function ArvoreDaMadre() {
  // Dispara o carregamento das 9 faces e NAO bloqueia (ver o bloco FONTES).
  // O retorno e ignorado de proposito: a arvore desenha na fonte do sistema
  // enquanto as faces nao chegam, e repinta sozinha quando chegam.
  useFonts(FUENTES);

  // null = ainda decidindo. Nunca montar o Stack com um palpite: `initialRouteName`
  // so e lido na montagem, e trocar depois nao move ninguem — a pessoa ficaria
  // presa no onboarding que ja tinha respondido.
  const [rotaInicial, setRotaInicial] = useState(null);

  useEffect(() => {
    let vivo = true;
    /* AS DUAS PERGUNTAS DE ABERTURA, e elas sao independentes — dai o Promise.all
     * e nao dois awaits em sequencia: uma nao decide a outra, e ler as duas de uma
     * vez tira uma ida ao disco do caminho mais quente. Quem decide o que fazer
     * com as respostas e rotaDeAbertura(), la em cima. */
    Promise.all([leerSeguro(CLAVE_PERFIL), jaFezLeituraDeEntrada()])
      .then(([bruto, entradaFeita]) => {
        if (!vivo) return;
        setRotaInicial(rotaDeAbertura(bruto, entradaFeita, NOMBRE_ABAS));
      })
      .catch(() => {
        // Nenhuma das duas lanca por contrato; o catch existe para que uma
        // promessa rejeitada por qualquer outro motivo nunca deixe a tela parada
        // para sempre na espera. A APRESENTACAO e o fallback (e nao ONBOARDING,
        // como era la): dentro do Cosmic ela e a PORTA da feature, e quem chegou
        // aqui por um disco ilegivel merece ver a Madre se apresentar antes de
        // levar cinco perguntas na cara.
        if (vivo) setRotaInicial(RUTAS.APRESENTACAO);
      });
    return () => {
      vivo = false;
    };
  }, []);

  // A unica espera desta tela, e ela e curta (uma leitura de AsyncStorage).
  // Fundo `noche`, sem texto: escrever antes de as faces chegarem faz a palavra
  // nascer na fonte do sistema e PULAR de tamanho quando a face real entra.
  if (rotaInicial === null) return <View style={estilos.espera} />;

  return (
    <Stack.Navigator initialRouteName={rotaInicial} screenOptions={OPCIONES_PANTALLA}>
      {/* A APRESENTACAO — a Madre Maria antes de tudo. Sai por replace para o
          portao; sem barra, como ele. */}
      <Stack.Screen name={RUTAS.APRESENTACAO} component={ApresentacaoScreen} />

      {/* O PORTAO — as cinco perguntas, sem barra, uma vez na vida. */}
      <Stack.Screen name={RUTAS.ONBOARDING} component={OnboardingScreen} />

      {/* A LEITURA DE ENTRADA — as tres cartas com a voz gravada. Fora das abas
          pelo mesmo motivo do portao: a barra nao pode aparecer antes de a
          pessoa ter recebido a leitura que a trouxe ate aqui. Sai por `replace`
          para as abas, entao nao ha volta e nao ha tela empilhada atras. */}
      <Stack.Screen name={RUTAS.LEITURA_ENTRADA} component={LeituraDeEntradaScreen} />

      {/* A LEITURA PROFUNDA — os cinco audios. Tambem fora das abas. Sai por
          `replace` no caminho do funil e por `goBack` quando aberta pelo Perfil. */}
      <Stack.Screen name={RUTAS.LEITURA_PROFUNDA} component={LeituraProfundaScreen} />

      {/* REOUVIR AS TRES CARTAS — as mesmas tres, ja abertas, com audio e texto.
          E a porta do Perfil para a voz, e existe para que "Ouvir de novo as tres
          cartas" NUNCA leve a tela da escolha: a leitura de entrada acontece uma
          vez na vida. */}
      <Stack.Screen name={RUTAS.REOUVIR_ENTRADA} component={ReouvirTresCartasScreen} />

      {/* AS TRES ZONAS, em um unico registro: o Mapa do Ano, o Fio, o Plano e o
          Perfil, com a barra inferior desenhada por baixo delas. Tudo o que ha
          para saber sobre este nome de rota esta no cabecalho de navegacion.js.

          E ESTE REGISTRO que faz os replaces do funil funcionarem: o StackRouter
          so trata REPLACE para um nome que esteja na lista de rotas DELE, e este
          Stack tem NOMBRE_ABAS na dele. (Fora disso ele devolve null, e null ali
          nao e erro: e "nao tratei" — a acao morre em silencio.) */}
      <Stack.Screen name={NOMBRE_ABAS} component={Abas} />

      {/* OS DESTINOS, na ordem em que a pessoa esbarra neles: primeiro o fim da
          leitura, depois a lista "MAS" do Perfil.

          CAFE E PALMA NAO ESTAO AQUI, e e de proposito (decisao do dono,
          11/09/2026): sao UM SO no app — a Madre usa o Ritual do Cafe e a
          leitura da palma que o Cosmic Guide ja tem. Quem liga os dois e o
          ★ PONTO DE SOLDA de screens/PlanoScreen.js. */}
      <Stack.Screen name={RUTAS.SINTESIS} component={SintesisScreen} />
      <Stack.Screen name={RUTAS.PAYWALL} component={PaywallScreen} />
      <Stack.Screen name={RUTAS.RITUAL} component={RitualScreen} />
      <Stack.Screen name={RUTAS.AJUSTES} component={AjustesScreen} />
      <Stack.Screen name={RUTAS.METODO} component={MetodoScreen} />
      <Stack.Screen name={RUTAS.AYUDA} component={AyudaScreen} />
      <Stack.Screen name={RUTAS.PRIVACIDAD} component={PrivacidadScreen} />
      <Stack.Screen name={RUTAS.TERMINOS} component={TerminosScreen} />
    </Stack.Navigator>
  );
}



/**
 * A Madre Maria inteira, pronta para ser uma <Stack.Screen> do HomeStack:
 *
 *   <Stack.Screen name={ROUTES.MADRE_MARIA} component={MadreMariaApp} />
 *
 * Recebe `navigation` do HomeStack por prop (React Navigation entrega a toda
 * tela registrada) — e e so por isso que o boundary consegue devolver a pessoa
 * para a Home do Cosmic quando algo quebra aqui dentro.
 */
export default function MadreMariaApp({ navigation }) {
  /* ===================================================================================
     O IDIOMA — a Madre acompanha o seletor do Cosmic (PT/ES/EN)
     ===================================================================================
     O dicionario da Madre e o dela (datos/textos.js), mas o IDIOMA e um so no app
     inteiro: quem escolhe e o seletor do Perfil do Cosmic, que grava em
     'app-language' e publica por context/LanguageContext.js.

     DUAS LINHAS, e cada uma resolve metade do problema:

       1. setIdiomaMadre(lang) empurra o idioma para datos/textos.js. Tem de ser
          SINCRONO, aqui no corpo do render e nao num useEffect: efeito roda DEPOIS
          da primeira pintura, e a primeira tela da Madre sairia em portugues e
          repintaria — flash de idioma na tela de quem abriu em espanhol.
          Ele e idempotente e barato (um includes e uma atribuicao), entao rodar a
          cada render nao custa nada e evita a janela de um frame.

       2. key={lang} e o REDESENHO. t() e uma funcao de modulo lida dentro do render
          de 19 telas; React nao observa variavel de modulo, e trocar o espelho nao
          invalida render nenhum. A key troca quando o idioma troca, e a arvore
          inteira da Madre e descartada e remontada com todo t() reavaliado.
          O motivo inteiro de ser remontagem e nao memo por tela esta no bloco
          REDESENHO de datos/textos.js.

     O `lang` vem de useLanguage(). O hook nunca e nulo aqui: esta tela so existe
     dentro do <LanguageProvider> do App.js do Cosmic (App.js:945) — mas a leitura
     e defensiva de todo jeito, porque uma tela que quebra o app inteiro por causa
     de um provider ausente nao combina com o LimiteDeErro logo abaixo.
     =================================================================================== */
  const idioma = useLanguage();
  const lang = idioma?.lang || IDIOMA_PADRAO;
  setIdiomaMadre(lang);

  return (
    <LimiteDeErro navigation={navigation}>
      <ArvoreDaMadre key={lang} />
    </LimiteDeErro>
  );
}

const estilos = StyleSheet.create({
  espera: { flex: 1, backgroundColor: colores.noche },

  fallo: {
    flex: 1,
    backgroundColor: colores.noche,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.xl,
    paddingVertical: espacio.xxxl,
  },
  falloCaja: { width: '100%', maxWidth: 420 },
  falloCuerpo: { marginTop: espacio.md },
  falloBoton: { marginTop: espacio.xl },
});
