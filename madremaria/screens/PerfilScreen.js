// screens/PerfilScreen.js — a terceira zona da barra do Heat Game: o "avatar".
//
// ===========================================================================
// O QUE ESTA TELA E, E O QUE ELA SE RECUSA A SER
// ===========================================================================
// No molde, a direita da barra e vaidade: nivel, ranking, pontos, medalha. Nada
// disso e medido — sao numeros inventados para a pessoa se comparar com uma
// media que nao existe. Aqui a mesma posicao mostra uma FICHA, e a ficha tem
// exatamente tres fontes, todas verificaveis dentro do aparelho:
//
//   1. o que ELA escreveu   -> a chave 'perfil' (as 5 respostas do onboarding)
//   2. o que ELA fez        -> lib/hilo.js (nudos, recorde, dias com lectura)
//   3. o que ELA comprou    -> lib/suscripcion.estaSuscrito()
//
// Fora dessas tres, esta tela nao exibe numero nenhum. Nao ha "nivel", nao ha
// "ranking", nao ha "puntos", nao ha porcentagem, nao ha barra de progresso de
// nada que o app nao consiga contar. Um numero que a tela nao consegue apontar
// de onde saiu e uma mentira pequena hoje e uma resenha de uma estrela amanha.
//
// O ESPELHO. O unico "espelho" permitido no app e este: devolver a resposta da
// usuaria com as palavras dela — os textos das opcoes de datos/preguntas.js,
// copiados, nao reescritos. E o oposto do horoscopo de perfil ("tu eres uma
// pessoa que..."), porque nao interpreta nada: mostra o que esta guardado. Por
// isso a linha `perfil.espejo.pie` fica logo abaixo, dizendo isso na cara.
//
// REHACER NAO E RECOMECAR. O botao "Rehacer mis respuestas" leva de volta ao
// onboarding e NAO TOCA NO HILO. Isso e regra de produto, nao detalhe: os nudos
// foram conquistados vindo ler, e nao respondendo o quiz — apagar a sequencia
// porque a pessoa mudou uma resposta seria punir exatamente o gesto que o app
// quer que ela faca (contar a verdade de hoje, e nao a de tres meses atras).
// Por isso este arquivo NAO importa borrarSeguro: nao ha como ele apagar nada,
// nem por acidente, nem num refactor futuro distraido. Ele tambem nao apaga
// 'perfil': quem sobrescreve as respostas e o onboarding, no fim das cinco
// perguntas. Sair do quiz no meio do caminho deixa tudo como estava.
//
// ===========================================================================
// CONTRATOS QUE ESTE ARQUIVO CUMPRE
// ===========================================================================
//  · Regra 8 — nenhum hex e nenhum rgba() escrito aqui; toda cor sai de theme.js.
//  · Regra 9 — colores.hilo so como traco, ponto e borda. Nunca como texto.
//  · Toda string visivel vem de t() (datos/textos.js). Nao ha texto solto.
//  · Toda tipografia vem dos wrappers de components/Texto.js: nenhum fontSize,
//    nenhum fontFamily, nenhuma cor de texto escrita na mao.
//  · Nenhum Alert.alert: no react-native-web ele e no-op silencioso. O retorno
//    de cada acao aparece como TEXTO na propria tela (o estado `aviso`).
//  · Nenhuma biblioteca nova: React Native puro + o que ja esta no package.json.
//
// ===========================================================================
// CONTRATO DE ENTRADA
// ===========================================================================
// props.navigation — o objeto padrao do React Navigation. E opcional: sem ele a
// tela desenha inteira e os toques viram um aviso de __DEV__ em vez de crash.
// Isso importa porque o navigator ainda nao existe (App.js e um andaime) e
// porque esta tela precisa poder ser montada sozinha para screenshot da loja.
//
// A tela recarrega no 'focus' quando ha navigation: voltar de Ajustes, do
// paywall ou do onboarding tem de mostrar o dado novo, e nao o do primeiro
// mount. Sem navigation, carrega uma vez e pronto.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import BotonPrimario from '../components/BotonPrimario';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, Sobreceja, Titulo } from '../components/Texto';
/* `pregunta()` e nao `getPregunta()`: o espelho do Perfil devolve a resposta dela
 * com as PALAVRAS DELA, e as palavras dela estao no idioma em que ela respondeu
 * — getPregunta() traria o portugues sempre. */
import { esValida, pregunta as preguntaAtiva } from '../datos/preguntas';
import { TOTAL_PROFUNDA } from '../datos/profunda';
import { t } from '../datos/textos';
import { leerSeguro } from '../lib/almacen';
import { resumenHilo } from '../lib/hilo';
import { completarMissao } from '../lib/missoes';
// O progresso do carrossel da leitura profunda. Esta tela so LE: a chave
// 'profunda' tem um dono so (lib/profunda.js), e quem escreve e o carrossel.
import { lerProfunda } from '../lib/profunda';
// O CIRCULO (comunidade) FICA DE FORA da copia para dentro do Cosmic Guide
// — decisao do dono, 11/09/2026. lib/circulo.js nao foi copiado, entao o
// import, o estado, os handlers e o cartao inteiro sairam daqui. O Madre
// Maria autonomo (madre-maria.vercel.app) continua com o recurso.
// (diaLocal saiu junto com o Circulo — 11/09/2026: era o unico uso aqui.)
import { ACCESO_LIBRE, MOTIVO_SIN_BACKEND, estaSuscrito, restaurar } from '../lib/suscripcion';
import RUTAS from '../routes';
/* As rotas do COSMIC GUIDE — so para a leitura da mao, que virou UMA SO no app
 * (decisao do dono, 11/09/2026). Ver o ★ da lista de acessos, abaixo. */
import { ROUTES } from '../../routes';
import { colores, espacio, radio } from '../theme';

/* ===================================================================================
   DISCO
   A chave e NUA ('perfil'): lib/almacen.js aplica o prefixo 'hr.' sozinho, e nenhum
   chamador deste projeto escreve 'hr.' a mao.
   =================================================================================== */
const CLAVE_PERFIL = 'perfil';

/**
 * As 5 respostas do onboarding, como estao no disco. Nunca lanca: entrada
 * ilegivel vira objeto vazio, e a tela mostra o estado "todavia no hay
 * respuestas" em vez de tela branca.
 *
 * Aceita as DUAS formas possiveis de gravacao, porque a tela do onboarding
 * ainda esta sendo escrita e nao ha por que amarrar uma na outra:
 *   { nombre, corte, cuando, hoy, intencion }          — as respostas cruas
 *   { respuestas: { ... }, ...cualquier otra cosa }    — envelopadas
 * Qualquer campo extra que exista no envelope e ignorado aqui de proposito:
 * esta tela le respostas, nao um documento de perfil.
 *
 * Exportada porque e a unica leitura de disco do arquivo — testar isto sem
 * montar a tela inteira e o que mantem o teste barato.
 */
export async function leerRespuestas() {
  const bruto = await leerSeguro(CLAVE_PERFIL);
  if (!bruto) return {};
  let dato;
  try {
    dato = JSON.parse(bruto);
  } catch {
    return {};
  }
  if (!dato || typeof dato !== 'object') return {};
  const fuente = dato.respuestas && typeof dato.respuestas === 'object' ? dato.respuestas : dato;
  return fuente;
}

/**
 * O nome como se escreve na tela, ou null.
 * Mesma sanitizacao de lib/lectura.js (chaves fora, espacos colapsados) e o
 * mesmo portao: esValida('nombre', ...) de datos/preguntas.js. Quem nao passa no
 * portao do onboarding tambem nao aparece aqui — o app nunca inventa um nome.
 */
export function nombreDe(respuestas) {
  const crudo = respuestas && respuestas.nombre;
  if (!esValida('nombre', crudo)) return null;
  const limpio = String(crudo).replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  return limpio || null;
}

/** O texto VISIVEL da opcao que ela escolheu, copiado de datos/preguntas.js. */
function textoDeRespuesta(idPregunta, valor) {
  const pregunta = preguntaAtiva(idPregunta);
  if (!pregunta || !Array.isArray(pregunta.opciones)) return null;
  const opcion = pregunta.opciones.find((o) => o.id === valor);
  return opcion ? opcion.texto : null;
}

/**
 * O espelho, em uma linha: o corte (P2), ha quanto tempo (P3) e como esta o
 * contato hoje (P4), nesta ordem, com as palavras dela.
 *
 * Resposta que falta simplesmente nao entra — a linha encurta em vez de
 * aparecer com um buraco ou com um "no respondido" que ninguem pediu. Sem
 * nenhuma das tres, devolve null e a tela mostra `perfil.espejo.vacio`.
 */
export function espejoDe(respuestas) {
  const partes = ['corte', 'cuando', 'hoy']
    .map((id) => textoDeRespuesta(id, respuestas ? respuestas[id] : null))
    .filter(Boolean);
  return partes.length ? partes.join(t('perfil.espejo.separador')) : null;
}

/* ===================================================================================
   TIENDA
   "Gestionar" abre a conta da loja, que e o UNICO lugar onde uma assinatura se
   troca ou se cancela de verdade. Na web nao ha loja nenhuma para abrir: em vez
   de mandar quem comprou no iPhone para uma pagina do Google Play, a tela mostra
   a linha `perfil.suscripcion.gestionarWeb` e nao desenha botao.
   Nao ha hex aqui: sao URLs, nao cores.
   =================================================================================== */
const URL_TIENDA = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
  default: null,
});

/* ===================================================================================
   ACESSOS
   Lista fechada e declarada uma vez. A rota vem de routes.js — nenhuma string de
   navegacao digitada na mao. Enquanto a tela do outro lado nao existir, o toque
   vira um aviso de __DEV__ (ver `abrir`), nunca um crash.
   =================================================================================== */
const ACCESOS = Object.freeze([
  /* AS TRES CARTAS abrem a lista, e por um motivo de produto: o que segura a
     lead no WhatsApp nao e o texto nem a arte, sao os tres audios de ~28
     segundos com a voz do dono, e as pessoas VOLTAM neles. Sem esta linha a voz
     que faz o app inteiro funcionar ficaria trancada atras de uma URL.

     A ROTA MUDOU EM 01/09, E ISSO NAO E DETALHE. Ela apontava para
     RUTAS.LEITURA_ENTRADA — a propria tela da leitura, hoje com a mesa dos seis
     versos onde a pessoa toca em tres. A leitura de entrada passou a acontecer
     UMA VEZ NA VIDA, e o cabecalho de screens/LeituraDeEntradaScreen.js explica
     por que a tranca do "uma vez" e o que sustenta aquela mesa: quem refaz a
     leitura tem duas para comparar, e duas leituras mostram que os seis versos
     escondem sempre as mesmas tres cartas.

     Esta linha era a UNICA porta pela qual alguem chegava la uma segunda vez.
     Ela agora leva a RUTAS.REOUVIR_ENTRADA (screens/ReouvirTresCartasScreen.js):
     as mesmas tres cartas ja abertas, com o audio e o texto, sem escolha e sem
     raspagem. A voz continua a um toque de distancia; a escolha nao volta.

     Aquela tela tambem nao grava nada: nem o marcador, nem a ancora do ano — quem
     reouve no mes 7 continua no mes 7. */
  Object.freeze({ clave: 'perfil.acceso.entrada', ruta: RUTAS.REOUVIR_ENTRADA }),
  /* A LEITURA PROFUNDA — os cinco audios que vem depois das tres cartas. Ela
     entra logo abaixo da leitura de entrada porque e a continuacao dela, e nao
     um item de menu qualquer.
     Esta e a linha que a REGRA DO "PULAR" exige: o carrossel tem "Pular" desde o
     primeiro card, porque os 6,7 minutos entre a leitura e a primeira tela do
     app sao onde mais gente sai. Sem esta porta, quem pulou perderia os cinco
     audios para sempre — e ai o "Pular" deixaria de ser uma saida e viraria uma
     armadilha. A nota da direita (ver `notaDoAcesso`) diz o que ficou pendente,
     sem cobrar nada. */
  Object.freeze({ clave: 'perfil.acceso.profunda', ruta: RUTAS.LEITURA_PROFUNDA }),
  /* O RITUAL, o outro item de conteudo da lista (o resto e ajuste ou documento).
     Ele entra aqui porque esta e a porta que routes.js e screens/RitualScreen.js
     ja declaravam ("quem chama e a tela do fio e a lista do Perfil") e que nao
     existia — a rota estava registrada no Stack e ninguem navegava para ela,
     entao o ritual inteiro so era alcancavel digitando '/ritual' na barra de
     enderecos da web. Tela registrada sem entrada e o mesmo toque morto que uma
     rota sem tela, so que mais caro: o motor, o conteudo dos sete dias e os
     testes ja existiam. */
  Object.freeze({ clave: 'perfil.acceso.ritual', ruta: RUTAS.RITUAL }),
  /* O ALBUM das 78, pelo mesmo motivo do ritual: e conteudo, nao ajuste, e sem
     uma entrada declarada aqui a tela so seria alcancavel digitando '/album' na
     barra de enderecos da web. */
  /* O ALBUM foi DESLIGADO em 31/08 por decisao do dono: o app abre com tres
   * cartas fixas e segue no plano do dia, e uma colecao de 78 seria uma
   * segunda porta competindo com a principal — a doenca que o dossie do
   * Cosmic Guide diagnostica como 'excesso de oferta simultanea'. A tela e o
   * motor continuam no repositorio; religar e voltar esta linha.
   * Object.freeze({ clave: 'perfil.acceso.album', ruta: RUTAS.ALBUM }), */
  /* O FIO perdeu a zona na barra quando o MAPA virou a entrada (01/09) — a
     porta visivel dele agora e esta. Sem esta linha a tela so seria alcancavel
     digitando '/hilo' na web, o mesmo toque morto do ritual e do album. */
  Object.freeze({ clave: 'perfil.acceso.hilo', ruta: RUTAS.HILO }),
  /* ★ A SOLDA — A MAO (11/09/2026). FEITA.
     A leitura da palma virou UMA SO no app: e a tela do Cosmic Guide
     (ROUTES.PALM), e screens/RitualMaoScreen.js nao veio na copia. Esta porta
     permanente e necessaria desde que a mao virou gesto de ESTREIA em 01/09 —
     quem passou do primeiro dia nunca mais a ve no plano, e sem esta linha a
     leitura da mao ficaria alcancavel so por acaso.

     `abrir()` faz navigate() nu e isso BASTA: o nome sobe sozinho das abas da
     Madre para o HomeStack do Cosmic, que e onde PALM mora. O porque medido, com
     arquivo e linha do node_modules, esta escrito uma vez so — no bloco ★ de
     screens/PlanoScreen.js, que e o irmao desta linha. */
  Object.freeze({ clave: 'perfil.acceso.mao', ruta: ROUTES.PALM }),
  Object.freeze({ clave: 'perfil.acceso.ajustes', ruta: RUTAS.AJUSTES }),
  Object.freeze({ clave: 'perfil.acceso.metodo', ruta: RUTAS.METODO }),
  Object.freeze({ clave: 'perfil.acceso.ayuda', ruta: RUTAS.AYUDA }),
  Object.freeze({ clave: 'perfil.acceso.privacidad', ruta: RUTAS.PRIVACIDAD }),
  Object.freeze({ clave: 'perfil.acceso.terminos', ruta: RUTAS.TERMINOS }),
]);

/* ===================================================================================
   PECAS DA TELA
   =================================================================================== */

/** O cartao padrao: penumbra, canto md, borda suave. So isso. */
function Tarjeta({ children, style }) {
  return <View style={[estilos.tarjeta, style]}>{children}</View>;
}

/**
 * O que ocupa o lugar de um numero que HOJE nao tem o que afirmar.
 *
 * E um travessao, e nao uma frase: por isso ele nao mora em datos/textos.js —
 * pontuacao nao se traduz, pelo mesmo motivo que as iniciais do calendario da
 * HiloScreen nao moram la. E ele nunca substitui um numero medido: so entra na
 * coluna da sequencia viva quando o fio esta parado. Ver o comentario do bloco
 * MI HILO, mais abaixo.
 */
const SIN_MEDIDA = '—';

/**
 * Um numero medido e o que ele significa. O numero vai em <Titulo> com a cor
 * `aguja` (o token de numero e destaque do tema) e com digitos tabulares, para
 * a coluna nao tremer quando 9 vira 10.
 */
function Estadistica({ valor, etiqueta }) {
  return (
    <View style={estilos.estadistica}>
      <Titulo tabular style={estilos.numero} accessible={false}>
        {valor}
      </Titulo>
      <Micro style={estilos.etiqueta}>{etiqueta}</Micro>
    </View>
  );
}

/**
 * A seta da direita de cada acesso. E uma View rotacionada e nao um caractere:
 * glifo dependeria da fonte carregada e apareceria como quadrado no primeiro
 * frame frio. Fora da arvore de acessibilidade — quem le a linha ja sabe que
 * ela abre algo, porque o Pressable tem role de botao.
 */
function Flecha() {
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no"
      style={estilos.flecha}
    />
  );
}

/**
 * Uma linha da lista. `nota` e opcional e some quando nao ha o que dizer: linha
 * com subtitulo vazio abre um buraco de altura que ninguem entende.
 *
 * A nota entra no accessibilityLabel junto do rotulo, e nao como um segundo
 * texto solto: quem usa leitor de tela ouve "A leitura profunda, em cinco
 * partes. Voce ainda nao ouviu esta" numa tacada, que e como a linha se le com
 * os olhos.
 */
function FilaAcceso({ etiqueta, nota, onPress, primera }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={nota ? `${etiqueta}. ${nota}` : etiqueta}
      style={({ pressed }) => [
        estilos.fila,
        primera ? null : estilos.filaConBorde,
        pressed ? estilos.filaPresionada : null,
      ]}
    >
      <View style={estilos.filaColumna}>
        <Cuerpo>{etiqueta}</Cuerpo>
        {nota ? <Micro style={estilos.filaNota}>{nota}</Micro> : null}
      </View>
      <Flecha />
    </Pressable>
  );
}

/**
 * A nota de uma linha da lista, ou null.
 *
 * Hoje so a leitura profunda tem uma, e ela existe por uma razao de produto: o
 * carrossel pode ser pulado, e uma lista que nao diz o que ficou pendente
 * esconde justamente o que a pessoa pulou. As tres saidas possiveis:
 *
 *   · nenhum audio tocado  -> "voce ainda nao ouviu esta"
 *   · ouviu e parou no meio -> onde ela parou, em numero
 *   · saiu pelo convite do ultimo card -> nota nenhuma, nao ha o que lembrar
 *
 * Nenhuma delas cobra, nenhuma anuncia perda e nenhuma inventa: `ouvidos` e o
 * que ela de fato TOCOU (lib/profunda.js), nao o que passou pela tela.
 */
export function notaDoAcesso(clave, profunda) {
  if (clave !== 'perfil.acceso.profunda' || !profunda) return null;
  if (profunda.fim === true) return null;
  if (!profunda.ouvidos || profunda.ouvidos.length === 0) {
    return t('perfil.acceso.profunda.naoOuvida');
  }
  return t('perfil.acceso.profunda.parou', {
    n: Math.min(profunda.visto + 1, TOTAL_PROFUNDA),
    total: TOTAL_PROFUNDA,
  });
}

/**
 * A missao que ESTA tela comprova, e a unica escrita de gamificacao do arquivo.
 *
 * O id e o de lib/missoes.js, onde o `prova` daquela entrada aponta este arquivo
 * em texto — e o portao de test/gamificacao.test.js abre o arquivo nomeado ali e
 * exige achar este id junto de `completarMissao`. Sem essa chamada a missao
 * aparece na lista das tres de hoje e nunca fecha, que e o bug que o missions.js
 * do Cosmic Guide registrou.
 */
const MISSAO_DESTA_TELA = 'reler-suas-respostas';

/* ===================================================================================
   A TELA
   =================================================================================== */
export default function PerfilScreen({ navigation }) {
  // Um estado so, trocado de uma vez: tres pedacos independentes viravam tres
  // renders e um piscar de "sin nombre" antes do nome real aparecer.
  const [datos, setDatos] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [restaurando, setRestaurando] = useState(false);

  /* O CIRCULO saiu (decisao do dono, 11/09/2026) — estado e handlers removidos junto. */

  // O componente pode sair da arvore no meio de um await (a pessoa toca no
  // centro da barra e vai para a leitura). Sem esta guarda, o setState de
  // depois e um vazamento e um warning.
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const cargar = useCallback(async () => {
    const [respuestas, hilo, suscrito, profunda] = await Promise.all([
      leerRespuestas(),
      resumenHilo(),
      estaSuscrito(),
      lerProfunda(),
    ]);
    if (!montado.current) return;
    setDatos({ respuestas, hilo, suscrito, profunda });

    /* A missao desta tela — ver MISSAO_DESTA_TELA la em cima.
     *
     * Depois da leitura e SO com respostas na mao: a ficha vazia (quem apagou
     * tudo, quem ainda nao passou pelo onboarding) nao releu coisa nenhuma, e
     * marcar ali seria a missao fechando por uma tela que nao mostrou nada.
     *
     * Disparada e esquecida: nao trava a tela, nao tem ramo de erro e nao
     * aparece em lugar nenhum daqui. `completarMissao` e idempotente no dia e
     * ignora id fora do sorteio de hoje, entao o `focus` recarregando a cada
     * volta nao marca nada duas vezes. */
    if (respuestas) completarMissao(MISSAO_DESTA_TELA);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Voltar de outra tela tem de trazer o dado novo (assinou no paywall, refez as
  // respostas, atou o nudo de hoje). addListener devolve a propria funcao de
  // limpeza no React Navigation 6.
  useEffect(() => {
    if (!navigation || typeof navigation.addListener !== 'function') return undefined;
    return navigation.addListener('focus', cargar);
  }, [navigation, cargar]);

  const abrir = useCallback(
    (ruta, params) => {
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate(ruta, params);
        return;
      }
      if (__DEV__) {
        console.warn(`[PerfilScreen] Sem navigation: a rota "${ruta}" nao foi aberta.`);
      }
    },
    [navigation]
  );

  const alRestaurar = useCallback(async () => {
    setAviso(null);
    setRestaurando(true);
    const r = await restaurar();
    if (!montado.current) return;
    setRestaurando(false);
    if (r && r.ok === true) {
      setAviso(t('perfil.restaurar.ok'));
      cargar();
      return;
    }
    // 'sin-backend' nao e erro: e o v1 dizendo que ainda nao ha loja ligada.
    // Qualquer outro motivo, sim — e ai a mensagem generica e honesta.
    setAviso(
      r && r.motivo === MOTIVO_SIN_BACKEND
        ? t('perfil.restaurar.sinTienda')
        : t('errores.generico')
    );
  }, [cargar]);

  const alGestionar = useCallback(async () => {
    setAviso(null);
    try {
      await Linking.openURL(URL_TIENDA);
    } catch {
      if (montado.current) setAviso(t('perfil.suscripcion.gestionarError'));
    }
  }, []);

  const alRehacer = useCallback(() => {
    // Nada e apagado aqui. O onboarding sobrescreve 'perfil' quando ela chegar
    // ao fim das cinco; desistir no meio deixa as respostas de hoje intactas.
    // O flag serve para o onboarding saber que nao e a primeira vez e comecar
    // pela P1 em vez da tela zero.
    abrir(RUTAS.ONBOARDING, { rehacer: true });
  }, [abrir]);

  const respuestas = datos ? datos.respuestas : null;
  const nombre = useMemo(() => nombreDe(respuestas), [respuestas]);
  const espejo = useMemo(() => espejoDe(respuestas), [respuestas]);
  const inicial = nombre ? Array.from(nombre)[0].toUpperCase() : null;

  /* --- Carregando ---------------------------------------------------------------
   * A tela nao desenha "0 nudos" nem "Todavía sin nombre" enquanto o disco nao
   * respondeu: um zero que ainda nao foi medido e exatamente o tipo de numero
   * que esta tela existe para nao mostrar. */
  if (!datos) {
    return (
      <View style={estilos.pantalla}>
        <HiloFondo variante="quieto" />
        <SafeAreaView style={estilos.seguro}>
          <View style={estilos.cargando}>
            <Sobreceja>{t('perfil.sobreceja')}</Sobreceja>
            <Micro style={estilos.cargandoTexto}>{t('perfil.cargando')}</Micro>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const { hilo, suscrito } = datos;

  return (
    <View style={estilos.pantalla}>
      <HiloFondo variante="quieto" />

      <SafeAreaView style={estilos.seguro}>
        <ScrollView
          contentContainerStyle={estilos.contenido}
          showsVerticalScrollIndicator={false}
        >
          {/* --- CABECERA: o avatar honesto --------------------------------------
              O circulo mostra a inicial DELA. Sem nome ainda, mostra o nudo do
              fio — um ponto, nao uma silhueta generica de pessoa. */}
          <View style={estilos.cabecera}>
            <View style={estilos.avatar}>
              {inicial ? (
                <Titulo style={estilos.inicial} accessible={false}>
                  {inicial}
                </Titulo>
              ) : (
                <View style={estilos.nudoVacio} />
              )}
            </View>

            <View style={estilos.cabeceraTexto}>
              <Sobreceja>{t('perfil.sobreceja')}</Sobreceja>
              <Titulo accessibilityRole="header" style={estilos.nombre}>
                {nombre || t('perfil.sinNombre')}
              </Titulo>
            </View>
          </View>

          {/* --- ESPELHO: a resposta dela, com as palavras dela ------------------ */}
          <Tarjeta style={estilos.bloque}>
            <Sobreceja>{t('perfil.espejo.sobreceja')}</Sobreceja>
            {espejo ? (
              <>
                <View style={estilos.riscoFila}>
                  <View style={estilos.risco} />
                </View>
                <Cuerpo style={estilos.espejo}>{espejo}</Cuerpo>
                <Micro style={estilos.pieTarjeta}>{t('perfil.espejo.pie')}</Micro>
              </>
            ) : (
              <Cuerpo style={estilos.espejo}>{t('perfil.espejo.vacio')}</Cuerpo>
            )}
          </Tarjeta>

          {/* --- MI HILO: tres numeros medidos, e so tres ------------------------
              `actual` e a sequencia VIVA (resumenHilo ja zera quando o dia
              passou), `record` nunca desce e `total` sao dias com lectura — por
              isso a etiqueta diz "Días con lectura" e nao "lecturas".

              O ZERO DE `actual` NAO E IMPRESSO COM O FIO PARADO, e essa e a
              mesma correcao que a HiloScreen ja tinha feito no cartao dela. Com
              o fio quieto esta coluna mostrava "0" no maior tipo do bloco, em
              `aguja` (o token de destaque), tres linhas acima de "El hilo no se
              rompió. Se quedó quieto." — o texto dizia que nada se perdeu e o
              numero anunciava a perda na mesma respiracao. Nenhuma palavra
              proibida aparecia: o castigo era o zero, e ele era o unico numero
              da tela que andava para tras.

              No lugar dele vai um traco, que e a ausencia de afirmacao — nao ha
              sequencia viva hoje, e a tela nao finge que ha nem transforma isso
              em placar. `record` e `total` continuam impressos como estao: eles
              so sobem, e no telefone novo os tres zeros sao verdade sobre um
              comeco, nao sobre uma queda (e 'hilo.vacio', logo abaixo, ja diz
              isso em palavras). */}
          <Tarjeta style={estilos.bloque}>
            <Sobreceja>{t('perfil.hilo.sobreceja')}</Sobreceja>

            <View style={estilos.estadisticas}>
              <Estadistica
                valor={hilo.quieto ? SIN_MEDIDA : String(hilo.actual)}
                etiqueta={t('perfil.hilo.actual')}
              />
              <Estadistica valor={String(hilo.record)} etiqueta={t('perfil.hilo.record')} />
              <Estadistica valor={String(hilo.total)} etiqueta={t('perfil.hilo.total')} />
            </View>

            {/* Uma linha de estado, nunca duas. Quieto NAO pune: e constatacao
                mais o recorde intacto, exatamente como manda lib/hilo.js. */}
            {hilo.vacio ? (
              <Micro style={estilos.estado}>{t('hilo.vacio')}</Micro>
            ) : hilo.quieto ? (
              <Micro style={estilos.estado}>
                {`${t('hilo.rachaRota')} ${t('hilo.record', { n: hilo.record })}`}
              </Micro>
            ) : hilo.hoyAtado ? (
              <Micro style={estilos.estado}>{t('hilo.hoyListo')}</Micro>
            ) : null}

            <Micro style={estilos.pieTarjeta}>{t('perfil.hilo.nota')}</Micro>

            <BotonPrimario
              titulo={t('perfil.hilo.ver')}
              variante="fantasma"
              onPress={() => abrir(RUTAS.HILO)}
              style={estilos.botonTarjeta}
            />
          </Tarjeta>

          {/* O CIRCULO (cartao da comunidade) saiu — decisao do dono, 11/09/2026. */}

          {/* --- SUSCRIPCION ---------------------------------------------------- */}
          <Tarjeta style={estilos.bloque}>
            <Sobreceja>{t('perfil.suscripcion.sobreceja')}</Sobreceja>
            <Cuerpo style={estilos.estadoSuscripcion}>
              {/* Com o acesso livre ligado, "assinatura ativa" seria mentira —
                  ninguem comprou nada. O estado proprio diz a verdade. */}
              {ACCESO_LIBRE
                ? t('perfil.suscripcion.livre')
                : suscrito
                  ? t('perfil.suscripcion.activa')
                  : t('perfil.suscripcion.inactiva')}
            </Cuerpo>

            {suscrito && !ACCESO_LIBRE ? (
              <>
                {URL_TIENDA ? (
                  <>
                    <BotonPrimario
                      titulo={t('perfil.suscripcion.gestionar')}
                      variante="fantasma"
                      onPress={alGestionar}
                      style={estilos.botonTarjeta}
                    />
                    <Micro style={estilos.pieTarjeta}>
                      {t('perfil.suscripcion.gestionarNota')}
                    </Micro>
                  </>
                ) : (
                  <Micro style={estilos.pieTarjeta}>{t('perfil.suscripcion.gestionarWeb')}</Micro>
                )}

                <BotonPrimario
                  titulo={t('paywall.restaurar')}
                  variante="fantasma"
                  cargando={restaurando}
                  onPress={alRestaurar}
                  style={estilos.botonTarjeta}
                />
              </>
            ) : (
              <>
                {/* O convite e discreto de proposito: fantasma, com o rotulo
                    dizendo o que se ABRE — nunca o que vai acontecer na vida
                    dela. E logo abaixo, a linha de saida do paywall, que
                    continua verdadeira com ou sem assinatura. */}
                <BotonPrimario
                  titulo={t('perfil.suscripcion.ver')}
                  variante="fantasma"
                  onPress={() => abrir(RUTAS.PAYWALL)}
                  style={estilos.botonTarjeta}
                />
                <Micro style={estilos.pieTarjeta}>{t('paywall.salida')}</Micro>
              </>
            )}

            {/* O retorno de restaurar/gestionar vira TEXTO aqui. Alert.alert
                seria no-op silencioso no react-native-web. */}
            {aviso ? (
              <Micro accessibilityLiveRegion="polite" style={estilos.aviso}>
                {aviso}
              </Micro>
            ) : null}
          </Tarjeta>

          {/* --- ACCESOS -------------------------------------------------------- */}
          <Tarjeta style={[estilos.bloque, estilos.tarjetaLista]}>
            <Sobreceja style={estilos.sobrecejaLista}>{t('perfil.accesos.sobreceja')}</Sobreceja>
            {ACCESOS.map((acceso, indice) => (
              <FilaAcceso
                key={acceso.clave}
                etiqueta={t(acceso.clave)}
                nota={notaDoAcesso(acceso.clave, datos.profunda)}
                primera={indice === 0}
                onPress={() => abrir(acceso.ruta)}
              />
            ))}
          </Tarjeta>

          {/* --- REHACER --------------------------------------------------------
              Fantasma, no fim e com a nota embaixo: nao e a acao principal da
              tela, e nao pode parecer perigosa — porque nao e. */}
          <BotonPrimario
            titulo={t('perfil.rehacer')}
            variante="fantasma"
            onPress={alRehacer}
            style={estilos.bloque}
          />
          <Micro style={estilos.notaRehacer}>{t('perfil.rehacer.nota')}</Micro>

          {/* A mesma promessa da tela zero do onboarding, repetida onde ela pesa:
              na tela que junta tudo o que o app sabe sobre ela. */}
          <Micro style={estilos.pie}>{t('onboarding.privacidad')}</Micro>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ===================================================================================
   ESTILOS
   Nenhum hex, nenhum rgba, nenhum numero de fonte. Medidas de layout saem de
   `espacio` e `radio`; as duas constantes proprias (tamanho do avatar e do risco)
   sao geometria de desenho, nao cor nem tipografia.
   =================================================================================== */
const LADO_AVATAR = 64;
const GROSOR = 1;
const LADO_FLECHA = 8;
const LADO_NUDO = 10;

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  seguro: {
    flex: 1,
  },

  cargando: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: espacio.xl,
  },
  cargandoTexto: {
    marginTop: espacio.sm,
  },

  contenido: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.xl,
    // Folga generosa no fim: a barra de 3 zonas do Heat Game fica por cima
    // desta tela, e o ultimo texto nao pode nascer debaixo dela.
    paddingBottom: espacio.xxxl * 2,
    // Em tablet e na web a coluna para de crescer: linha de 16px com mais de
    // ~600px de largura fica dificil de ler.
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },

  /* --- cabecera --- */
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // A borda em hilo e traco, nao texto: e o uso permitido da cor da marca.
  avatar: {
    width: LADO_AVATAR,
    height: LADO_AVATAR,
    borderRadius: LADO_AVATAR / 2,
    borderWidth: GROSOR,
    borderColor: colores.bordeHilo,
    backgroundColor: colores.penumbra,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    // So cor e alinhamento: tamanho e familia sao de <Titulo>.
    color: colores.papel,
    textAlign: 'center',
  },
  nudoVacio: {
    width: LADO_NUDO,
    height: LADO_NUDO,
    borderRadius: LADO_NUDO / 2,
    backgroundColor: colores.hilo,
  },
  cabeceraTexto: {
    flex: 1,
    marginLeft: espacio.lg,
  },
  nombre: {
    marginTop: espacio.xs,
  },

  /* --- cartoes --- */
  tarjeta: {
    backgroundColor: colores.penumbra,
    borderRadius: radio.md,
    borderWidth: GROSOR,
    borderColor: colores.bordeSuave,
    padding: espacio.lg,
  },
  bloque: {
    marginTop: espacio.xl,
  },
  botonTarjeta: {
    marginTop: espacio.lg,
  },
  pieTarjeta: {
    marginTop: espacio.md,
  },
  aviso: {
    marginTop: espacio.md,
  },

  /* --- espelho --- */
  riscoFila: {
    flexDirection: 'row',
    marginTop: espacio.md,
  },
  risco: {
    width: espacio.xxl,
    height: GROSOR,
    backgroundColor: colores.hilo,
  },
  espejo: {
    marginTop: espacio.md,
  },

  /* --- estatisticas --- */
  estadisticas: {
    flexDirection: 'row',
    marginTop: espacio.md,
  },
  estadistica: {
    flex: 1,
    paddingRight: espacio.sm,
  },
  numero: {
    color: colores.aguja,
  },
  etiqueta: {
    marginTop: espacio.xs,
  },
  estado: {
    marginTop: espacio.lg,
    color: colores.papel,
  },

  /* --- suscripcion --- */
  estadoSuscripcion: {
    marginTop: espacio.md,
  },

  /* --- accesos ---
     A lista respira nas bordas do cartao: o padding horizontal sai do cartao e
     volta em cada fila, para o realce do toque cobrir a largura inteira. */
  tarjetaLista: {
    paddingHorizontal: 0,
    paddingVertical: espacio.sm,
  },
  sobrecejaLista: {
    paddingHorizontal: espacio.lg,
    paddingVertical: espacio.sm,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espacio.lg,
    // 52 e a altura minima de alvo de toque do projeto (a mesma de
    // BotonPrimario): 16 + 16 de padding sobre uma linha de 25 chega la.
    paddingVertical: espacio.lg,
  },
  filaConBorde: {
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
  },
  filaPresionada: {
    backgroundColor: colores.bordeSuave,
  },
  // A coluna existe para a linha poder ter duas alturas: rotulo sozinho, ou
  // rotulo com nota embaixo. O `flex: 1` mora aqui agora, e nao no texto, senao
  // a nota nao caberia e a seta seria empurrada para fora.
  filaColumna: {
    flex: 1,
    paddingRight: espacio.md,
  },
  filaNota: { marginTop: espacio.xs },
  flecha: {
    width: LADO_FLECHA,
    height: LADO_FLECHA,
    borderTopWidth: GROSOR,
    borderRightWidth: GROSOR,
    borderColor: colores.ceniza,
    transform: [{ rotate: '45deg' }],
  },

  /* --- pe da tela --- */
  notaRehacer: {
    marginTop: espacio.md,
  },
  pie: {
    marginTop: espacio.xl,
  },
});
