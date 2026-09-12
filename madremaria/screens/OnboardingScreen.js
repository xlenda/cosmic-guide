// screens/OnboardingScreen.js — TELA 1, a mais importante do funil.
//
// ===========================================================================
// O QUE ESTA TELA E
// ===========================================================================
// Uma UNICA rota que roda seis passos sem navegar nenhuma vez. Sair daqui e
// uma decisao, nunca um acidente de navegacao — por isso a maquina de estado e
// local e o unico `navigation` deste arquivo e o replace do fim.
//
//   0            PANTALLA_CERO  — a promessa. Zero campos: quem le e desiste
//                                 nao deixou dado nenhum para tras.
//   1..7         as 7 perguntas — uma por tela, opcoes em cascata, botao que
//                                 nasce apagado e ACENDE quando a resposta vale.
//                                 A ultima NAO avanca para outro passo: ela
//                                 fecha o quiz e vai para a leitura de entrada.
//
// ===========================================================================
// A CARTA-SURPRESA SAIU DAQUI EM 31/08 — e ela nao sumiu, mudou de lugar
// ===========================================================================
// Havia mais dois passos. O 6 (SORPRESA) sorteava uma das 22 cartas Maiores do
// taro com sacarMayor() e a entregava para raspar aos ~22 segundos; o 7 (HECHO)
// subia o ano ate um fato historico (ContadorAnio + datos/hechos.js).
//
// POR QUE SAIU: decisao do dono em 31/08 — as tres cartas ciganas de
// datos/lenormand.js (O Coracao, As Nuvens, O Cavaleiro, cada uma com o audio
// gravado na voz dele) sao as UNICAS cartas do app. Uma carta de taro sorteada
// aqui seria uma quarta carta, de outro baralho, dez segundos antes das tres
// que importam — e a primeira coisa que a usuaria veria seria justamente a que
// o produto nao usa mais.
//
// O QUE SE PERDE, E E PARA PERDER DE PROPOSITO: a recompensa aos ~22 segundos.
// Ela nao sumiu do produto: MUDOU DE LUGAR. Agora e a primeira das tres cartas
// ciganas, logo depois desta ultima pergunta, e vem com a voz dele — que e mais
// forte do que qualquer raspadinha de carta sorteada.
//
// COMO RELIGAR: devolver PASO_SORPRESA/PASO_HECHO a maquina de estado (os dois
// eram derivados de TOTAL_PREGUNTAS), os imports de CartaHilo, ContadorAnio,
// sacarMayor e hechoDeCarta, o bloco de JSX dos dois passos e os estilos
// `carta`, `bloqueHecho` e vizinhos. Nada foi apagado: components/CartaHilo.js,
// components/ContadorAnio.js, datos/hechos.js e lib/mazo.js continuam inteiros
// e testados no repositorio.
//
// Diagramacao: docs/DIAGRAMACION.md, secao 1 (o quiz). As secoes 2 (a surpresa)
// e 3 (o dado historico) descrevem os dois passos desligados acima. A ORDEM dos
// elementos de cada passo vem de la; a mecanica, do molde Heat Game.
//
// ===========================================================================
// O MOLDE (Heat Game) E AS TRES COISAS QUE MUDAM
// ===========================================================================
// Do molde vem o ritmo: perguntas curtas, uma por tela, cascata, botao que
// acende, recompensa antes do cadastro. O que muda:
//
//  1. Existe PANTALLA_CERO. O molde abre pedindo dado; aqui a promessa vem
//     primeiro e a coleta depois.
//  2. Nao ha cadastro nenhum no v1 — a recompensa nao e a isca de um formulario,
//     ela e a coisa em si.
//  3. O "EITA! 92% dos usuarios" virava ContadorAnio + datos/hechos.js — o
//     MESMO movimento de numero subindo, so que sobre um ano conferivel na
//     fonte impressa logo abaixo. Saiu junto com o passo 7 em 31/08 (ver o
//     bloco acima). A Regra 2 do produto — nada de prova social inventada —
//     continua valendo: o que este arquivo faz hoje e simplesmente nao afirmar
//     nada sobre "os outros usuarios".
//
// ===========================================================================
// DECISOES QUE PARECEM DETALHE E NAO SAO
// ===========================================================================
// · NAO existe texto de erro embaixo de campo. O BotonPrimario acendendo E a
//   mensagem — e por isso t('onboarding.errorNombre') existe em textos.js mas
//   nao e consumido aqui de proposito. A usuaria nunca le "campo obrigatorio",
//   ela VE o botao ligar.
//   A UNICA EXCECAO, e ela e de outra natureza: a DATA DE NASCIMENTO (P6). Um
//   nome so pode estar vazio, e botao apagado ja diz "falta escrever". Uma data
//   pode estar ERRADA de um jeito que a usuaria nao enxerga — 31 de fevereiro,
//   1899, um ano que ainda nao chegou. Ali o botao apagado nao informa nada, e
//   quem nao entende por que nao avanca fecha o app no ultimo passo do funil.
//   Por isso t('onboarding.errorFecha') aparece, e SO com os tres campos cheios.
// · As opcoes NAO sao BotonPrimario, por mais tentador que pareca. O rotulo
//   dele e tipo.rotulo, que carrega textTransform 'uppercase' e texto
//   centralizado: "Una discusion fuerte y todo se rompio ahi" sairia EM CAIXA
//   ALTA e centralizada, como se fosse um comando. Opcao de leitura longa e
//   <Cuerpo> alinhado a esquerda; o estado escolhido e um ponto de colores.hilo
//   — nao um segundo botao aceso competindo com o que de fato avanca.
// · O botao mora num rodape FIXO, fora do ScrollView. Numa tela com microcopy
//   longa ele sairia do campo de visao justo no instante em que acende, que e o
//   unico instante em que ele precisa ser visto.
// · As respostas viajam por PARAMETRO DE ROTA e sao gravadas em 'perfil' como
//   espelho. Nenhum motor do projeto persiste as respostas: quem grava e esta
//   tela, e quem le depois nao pode depender so do disco.
//
// REGRAS DO PROJETO CUMPRIDAS AQUI
// · Nenhum hex literal: toda cor sai de theme.js.
// · colores.hilo nunca e cor de texto — aqui ele e barra de progresso, marca de
//   opcao escolhida, cursor do campo e fundo de botao. Nunca letra.
// · Nenhuma palavra escrita a mao: tudo sai de datos/textos.js e datos/preguntas.js.
// · Todo movimento respeita useReducedMotion, e `null` conta como reduzido.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

// Os imports de CartaHilo, ContadorAnio e hechoDeCarta sairam com os passos 6 e
// 7 em 31/08. Import morto e o que faz o proximo leitor achar que a feature
// ainda existe — por isso eles nao ficaram aqui comentados. O bloco do
// cabecalho diz o que voltar a importar no dia de religar.
import BotonPrimario from '../components/BotonPrimario';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, Sobreceja, Titulo } from '../components/Texto';
/* `pantallaCero()` e `preguntas()`, nao as constantes: as constantes de
 * datos/preguntas.js sao o PORTUGUES, e ler elas aqui deixaria o onboarding em
 * portugues com o app em "es"/"en". As funcoes resolvem pelo idioma ativo com
 * fallback por campo, e devolvem os MESMOS ids, tipos e ordem. */
import {
  TOTAL_PREGUNTAS,
  esValida,
  fechaDeNacimientoPlausible,
  onboardingCompleto,
  pantallaCero,
  preguntas,
} from '../datos/preguntas';
import { t } from '../datos/textos';
import useReducedMotion from '../../hooks/useReducedMotion';
import { guardarSeguro } from '../lib/almacen';
import { RUTAS } from '../routes';
import { colores, espacio, radio, sombra, tipo } from '../theme';

const enDesarrollo = typeof __DEV__ !== 'undefined' && __DEV__;

// A chave nua. lib/almacen aplica o prefixo 'hr.' sozinho — escrever 'hr.perfil'
// aqui geraria a chave 'hr.hr.perfil'.
const CLAVE_PERFIL = 'perfil';

// Os seis passos. O ULTIMO sai de TOTAL_PREGUNTAS em vez de ser digitado: se um
// dia entrar ou sair uma pergunta, a maquina continua inteira.
//
// Aqui moravam PASO_SORPRESA (= PASO_PRIMERA + TOTAL_PREGUNTAS) e PASO_HECHO
// (= PASO_SORPRESA + 1). Com os dois fora, o teto da maquina passou a ser a
// ULTIMA PERGUNTA — e esse limite tinha de mudar junto: mantido o teto antigo, o
// quiz terminaria num passo que nao existe mais e a tela ficaria em branco, sem
// erro nenhum no console.
const PASO_CERO = 0;
const PASO_PRIMERA = 1;
const PASO_ULTIMA = PASO_PRIMERA + TOTAL_PREGUNTAS - 1;

// Entrada em cascata, ~60ms entre opcoes (docs/DIAGRAMACION.md, secao 1, item 4):
// rapido o bastante para as cinco terminarem antes de o polegar chegar, lento o
// bastante para o olho ver que entraram uma a uma — que e o que faz a lista
// parecer viva em vez de aparecer pronta.
const RETARDO_CASCADA_MS = 60;
const DURACION_ENTRADA_MS = 260;
const DESPLAZAMIENTO_ENTRADA = 14;
const DURACION_BARRA_MS = 320;

// Geometria do no que corre na ponta da barra de progresso (secao 1, item 1:
// a barra do molde carrega uma marca; aqui a marca e um no do fio).
const ALTURA_RIEL = 3;
const TAMANO_NUDO = 10;

// opacity e transform existem no driver nativo; na web o react-native-web nao
// tem driver nativo e o pedido cai num aviso de console a cada animacao.
const USA_DRIVER_NATIVO = Platform.OS !== 'web';

/**
 * Entrada de um bloco: sobe um pouco e aparece. Usada nas opcoes (com retardo
 * crescente) e nos blocos que nascem depois de um evento.
 *
 * O disparo acontece UMA vez por montagem, guardado por `iniciado`. Sem essa
 * trava, a resposta assincrona de useReducedMotion no nativo chegaria depois do
 * primeiro frame e re-dispararia a animacao de tudo que ja estava na tela.
 */
function Aparecer({ retardo = 0, sinMovimiento, style, children }) {
  const valor = useRef(new Animated.Value(sinMovimiento ? 1 : 0)).current;
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return undefined;
    iniciado.current = true;

    if (sinMovimiento) {
      valor.setValue(1);
      return undefined;
    }

    const animacion = Animated.timing(valor, {
      toValue: 1,
      duration: DURACION_ENTRADA_MS,
      delay: retardo,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USA_DRIVER_NATIVO,
    });
    animacion.start();
    return () => animacion.stop();
  }, [retardo, sinMovimiento, valor]);

  const desplazamiento = valor.interpolate({
    inputRange: [0, 1],
    outputRange: [DESPLAZAMIENTO_ENTRADA, 0],
  });

  return (
    <Animated.View
      style={[style, { opacity: valor, transform: [{ translateY: desplazamiento }] }]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Uma opcao da lista. Pressable proprio em vez de um botao do design system
 * porque BotonPrimario nao aceita estado "escolhido" nem accessibilityRole de
 * radio — e escolher nao e a acao principal da tela, avancar e.
 */
function Opcion({ opcion, elegida, alElegir, retardo, sinMovimiento }) {
  return (
    <Aparecer retardo={retardo} sinMovimiento={sinMovimiento} style={estilos.envolturaOpcion}>
      <Pressable
        onPress={alElegir}
        accessibilityRole="radio"
        accessibilityState={{ checked: elegida, selected: elegida }}
        accessibilityLabel={opcion.texto}
        style={({ pressed }) => [
          estilos.opcion,
          elegida ? estilos.opcionElegida : null,
          pressed ? estilos.opcionPresionada : null,
        ]}
      >
        {/* A marca e um ponto de colores.hilo: cor como ICONE, nunca como letra. */}
        <View style={[estilos.marca, elegida ? estilos.marcaElegida : null]} />
        <Cuerpo style={estilos.textoOpcion}>{opcion.texto}</Cuerpo>
      </Pressable>
    </Aparecer>
  );
}

/* ===================================================================================
 * A DATA DE NASCIMENTO (P6) — tres campos, um valor so
 * ===================================================================================
 * O valor que sai daqui e SEMPRE 'YYYY-MM-DD' ou string vazia. Nunca um formato
 * intermediario: quem le do outro lado (datos/preguntas.js, lib/signo.js, o
 * espelho do Perfil) le uma coisa so.
 *
 * POR QUE TRES CAMPOS E NAO UM SELETOR DE DATA. O DateTimePicker nativo pediria
 * uma dependencia nova (a regra do projeto e "nenhuma biblioteca nova") e abre
 * num calendario do MES ATUAL — quem nasceu em 1994 rola 380 telas. Tres campos
 * numericos sao o gesto de quem ja sabe a resposta de cor.
 *
 * O DIGITO E O UNICO CARACTERE ACEITO: o teclado numerico do iOS ainda traz
 * espaco, ponto e sinal, e um "1 990" no ano viraria data invalida sem a usuaria
 * ver o que fez de errado. O filtro acontece na digitacao, nao na validacao.
 * =================================================================================== */

/** '1994-03-21' -> { dia: '21', mes: '03', ano: '1994' }. Lixo -> tudo vazio. */
function partirFecha(valor) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof valor === 'string' ? valor : '');
  return m ? { ano: m[1], mes: m[2], dia: m[3] } : { ano: '', mes: '', dia: '' };
}

/** { dia:'21', mes:'3', ano:'1994' } -> '1994-03-21'. Incompleto -> ''. */
function juntarFecha({ dia, mes, ano }) {
  if (!dia || !mes || !ano || ano.length < 4) return '';
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function CampoFecha({ pregunta, valor, alResponder, sinMovimiento, mostrarErro }) {
  // Estado local so do que esta DIGITADO: '2' no mes ainda nao e uma data, e nao
  // pode virar uma no meio do caminho. A fonte da verdade continua sendo o valor
  // composto que sobe por alResponder.
  const [bruto, setBruto] = useState(() => partirFecha(valor));

  const cambiar = (idCampo, texto, largo) => {
    const soDigitos = String(texto).replace(/\D/g, '').slice(0, largo);
    const siguiente = { ...bruto, [idCampo]: soDigitos };
    setBruto(siguiente);
    alResponder(juntarFecha(siguiente));
  };

  return (
    <Aparecer
      retardo={RETARDO_CASCADA_MS}
      sinMovimiento={sinMovimiento}
      style={estilos.envolturaCampo}
    >
      <View style={estilos.filaFecha}>
        {pregunta.campos.map((campo, i) => (
          <View
            key={campo.id}
            style={[estilos.celdaFecha, campo.id === 'ano' ? estilos.celdaFechaAno : null]}
          >
            <Micro style={estilos.rotuloFecha}>{campo.rotulo}</Micro>
            <TextInput
              value={bruto[campo.id]}
              onChangeText={(texto) => cambiar(campo.id, texto, campo.largo)}
              placeholder={campo.placeholder}
              placeholderTextColor={colores.ceniza}
              maxLength={campo.largo}
              keyboardType="number-pad"
              inputMode="numeric"
              autoFocus={i === 0}
              returnKeyType="done"
              selectionColor={colores.hilo}
              accessibilityLabel={`${pregunta.texto} ${campo.rotulo}`}
              style={[
                estilos.campo,
                estilos.campoFecha,
                bruto[campo.id].length === campo.largo ? estilos.campoVivo : null,
              ]}
            />
          </View>
        ))}
      </View>

      {/* A UNICA mensagem de erro da tela, e a excecao esta explicada no
          cabecalho: um nome so pode estar VAZIO, e para isso o botao apagado ja
          e a mensagem. Uma data pode estar ERRADA de um jeito que a usuaria nao
          enxerga (31 de fevereiro, 1899, o ano que ainda nao chegou) — deixa-la
          diante de um botao que nunca acende, sem dizer por que, e perde-la no
          ultimo passo do onboarding. So aparece com os tres campos cheios. */}
      {mostrarErro ? <Micro style={estilos.erroFecha}>{t('onboarding.errorFecha')}</Micro> : null}
    </Aparecer>
  );
}

/**
 * OnboardingScreen — a sequencia inteira, de PANTALLA_CERO ao fato historico.
 *
 * @param {object}   props
 * @param {object}   props.navigation  o do Stack. O unico uso e o replace final.
 */
export default function OnboardingScreen({ navigation }) {
  const [paso, setPaso] = useState(PASO_CERO);
  const [respuestas, setRespuestas] = useState({});
  const [guardando, setGuardando] = useState(false);

  const movimientoReducido = useReducedMotion();
  // `null` (ainda nao sabemos) conta como reduzido: ninguem leva um primeiro
  // frame animado antes de o sistema responder.
  const sinMovimiento = movimientoReducido !== false;

  const scrollRef = useRef(null);
  const montado = useRef(true);
  const saliendo = useRef(false);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // Aqui viviam `sorpresa` (sacarMayor(), sorteado uma vez na montagem), `hecho`
  // (hechoDeCarta) e `antiguedad` (o ano absoluto de hechos.js virado idade).
  // Sairam com os passos 6 e 7 em 31/08 — ver o cabecalho.

  const enPreguntas = paso >= PASO_PRIMERA && paso <= PASO_ULTIMA;
  const indice = paso - PASO_PRIMERA;
  /* Uma chamada por render: a lista e montada do PT + traducao na hora, e o
   * idioma so muda com a arvore remontando (key={lang} em MadreMariaApp.js). */
  const pregunta = enPreguntas ? preguntas()[indice] : null;
  const cero = pantallaCero();
  const valorActual = pregunta ? respuestas[pregunta.id] : undefined;
  /* A data leva a segunda trava junto: esValida() e pura de proposito (ela roda
   * dentro do motor de leitura, que nao pode ler relogio), entao quem confere o
   * "nao pode estar no futuro" e a tela — aqui, uma vez, no unico lugar por onde
   * a data entra no app. Ver a nota em datos/preguntas.js. */
  const respuestaValida = pregunta
    ? esValida(pregunta.id, valorActual)
      && (pregunta.tipo !== 'fecha' || fechaDeNacimientoPlausible(valorActual))
    : false;

  /* Os tres campos estao cheios (uma data completa tem 10 caracteres) e mesmo
   * assim nao passa: e o unico caso da tela em que a usuaria precisa ouvir o
   * porque em vez de olhar um botao apagado. */
  const fechaImposible =
    !!pregunta
    && pregunta.tipo === 'fecha'
    && typeof valorActual === 'string'
    && valorActual.length === 10
    && !respuestaValida;

  /* ---------------------------------------------------------------------- *
   * BARRA DE PROGRESSO
   * Percentual interpolado, entao o preenchimento acompanha qualquer largura
   * de tela sem medir nada. useNativeDriver: false porque `width` nao existe
   * no driver nativo — so opacity e transform existem la.
   * ---------------------------------------------------------------------- */
  const avance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enPreguntas) return undefined;
    const destino = (indice + 1) / TOTAL_PREGUNTAS;

    if (sinMovimiento) {
      avance.setValue(destino);
      return undefined;
    }

    const animacion = Animated.timing(avance, {
      toValue: destino,
      duration: DURACION_BARRA_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animacion.start();
    return () => animacion.stop();
  }, [avance, enPreguntas, indice, sinMovimiento]);

  const anchoBarra = useMemo(
    () => avance.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    [avance]
  );

  /* ---------------------------------------------------------------------- *
   * MAQUINA DE ESTADO
   * ---------------------------------------------------------------------- */

  // Cada passo comeca do topo. Sem isto, sair de uma pergunta com microcopy
  // longa deixa a proxima aberta no meio do texto.
  //
  // Havia aqui uma excecao para o PASO_HECHO, onde quem mandava no scroll era o
  // `alRevelar` da carta. Com os dois passos fora nao ha mais ninguem disputando
  // a barra de rolagem, e a regra passou a valer para todos os passos.
  useEffect(() => {
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  }, [paso]);

  const responder = useCallback((id, valor) => {
    setRespuestas((anteriores) => ({ ...anteriores, [id]: valor }));
  }, []);

  // Voltar so existe dentro das perguntas — e agora as perguntas sao o fim da
  // tela, entao voltar existe ate a ultima delas. Antes o teto era
  // PASO_SORPRESA, porque depois da carta sorteada nao havia volta: refazer o
  // quiz para tirar outra carta transformaria a surpresa numa maquininha de
  // tentar de novo. Sem a carta, esse teto deixou de ter dono.
  const retroceder = useCallback(() => {
    setPaso((actual) => (actual > PASO_CERO && actual <= PASO_ULTIMA ? actual - 1 : actual));
  }, []);

  const puedeRetroceder = paso > PASO_CERO && paso <= PASO_ULTIMA;

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const alVolverHardware = () => {
      if (puedeRetroceder) {
        retroceder();
        return true;
      }
      // Na PANTALLA_CERO o botao fisico faz o que sempre fez fora do app: sai.
      // Ninguem ainda respondeu nada, entao nao ha o que proteger. (O ramo que
      // engolia o back durante a surpresa e o fato saiu com os dois passos.)
      return false;
    };

    const suscripcion = BackHandler.addEventListener('hardwareBackPress', alVolverHardware);
    return () => {
      if (suscripcion?.remove) suscripcion.remove();
      else BackHandler.removeEventListener?.('hardwareBackPress', alVolverHardware);
    };
  }, [paso, puedeRetroceder, retroceder]);

  // Aqui vivia `alRevelar`: a carta do passo 6 abria, o passo virava PASO_HECHO
  // e um requestAnimationFrame descia a tela ate o fato. Saiu com os dois
  // passos em 31/08 — ver o cabecalho.

  /* PARA ONDE O ONBOARDING SAI.
   *
   * Ate aqui saia direto para as abas (RUTAS.TIRADA). Agora sai para a LEITURA
   * DE ENTRADA, que e o segundo dos tres passos que o dono definiu para o funil:
   *
   *   1. as cinco perguntas  — esta tela
   *   2. as tres cartas com a voz dele, uma de cada vez
   *   3. o app, com o plano do ano
   *
   * A ordem nao e enfeite: no WhatsApp, o que faz a lead ficar sao os tres
   * audios logo depois das perguntas. Mandar quem acabou de responder direto
   * para as abas seria pular justamente a parte que converte.
   *
   * As respostas seguem no parametro, como sempre; a leitura de entrada as
   * repassa para as abas quando terminar. */
  const irALaLeitura = useCallback(
    (datos) => {
      const parametros = { respuestas: datos };
      if (typeof navigation?.replace === 'function') {
        // replace e nao navigate: o botao voltar do sistema nao pode devolver a
        // usuaria ao quiz que ela acabou de terminar.
        navigation.replace(RUTAS.LEITURA_ENTRADA, parametros);
        return;
      }
      if (typeof navigation?.navigate === 'function') {
        navigation.navigate(RUTAS.LEITURA_ENTRADA, parametros);
        return;
      }
      if (enDesarrollo) {
        console.warn(
          '[OnboardingScreen] Nao ha navigator montado: o onboarding terminou e nao ha '
            + `para onde ir. Registre a rota ${RUTAS.LEITURA_ENTRADA} no Stack.`
        );
      }
    },
    [navigation]
  );

  const finalizar = useCallback(async () => {
    if (saliendo.current) return;

    // Rede de seguranca: se alguma resposta se perdeu, a tela volta para a
    // primeira invalida em vez de mandar um perfil incompleto para a tirada.
    if (!onboardingCompleto(respuestas)) {
      const faltante = preguntas().findIndex((p) => !esValida(p.id, respuestas[p.id]));
      setPaso(PASO_PRIMERA + (faltante < 0 ? 0 : faltante));
      return;
    }

    saliendo.current = true;
    setGuardando(true);

    // O espelho no disco e um bonus, nao o caminho principal: as respostas vao
    // junto no parametro da rota. Por isso guardarSeguro devolvendo false (disco
    // quebrado, sessao so em memoria) nao vira aviso vermelho nem impede a
    // leitura — nada foi perdido.
    await guardarSeguro(CLAVE_PERFIL, JSON.stringify(respuestas));

    if (montado.current) setGuardando(false);
    irALaLeitura(respuestas);
  }, [irALaLeitura, respuestas]);

  /* AVANZAR — e o FIM DA TELA quando ja nao ha proximo passo.
   *
   * Fica DEPOIS de `finalizar` de proposito: ele passou a depender dela. Antes
   * avanzar era so um incremento com teto em PASO_SORPRESA e quem chamava
   * `finalizar` era o botao do PASO_HECHO. Com os dois passos fora, a ultima
   * pergunta e o ultimo passo: incrementar aqui levaria a maquina para um numero
   * sem tela e a usuaria ficaria olhando um lienzo vazio, sem erro nenhum. */
  const avanzar = useCallback(() => {
    if (paso >= PASO_ULTIMA) {
      finalizar();
      return;
    }
    setPaso((actual) => (actual >= PASO_ULTIMA ? actual : actual + 1));
  }, [finalizar, paso]);

  /* ---------------------------------------------------------------------- *
   * RODAPE — o botao que acende, sempre visivel
   * ---------------------------------------------------------------------- */
  const enUltimaPregunta = paso === PASO_ULTIMA;

  let pie = null;
  if (paso === PASO_CERO) {
    pie = <BotonPrimario titulo={cero.boton} onPress={avanzar} />;
  } else if (enPreguntas) {
    // Na ultima pergunta o rotulo deixa de ser "seguinte": nao ha seguinte, ha
    // a leitura. 'comunes.empezar' e o mesmo texto que fechava o PASO_HECHO —
    // a palavra nao mudou de significado, so de lugar. E o `cargando` viaja com
    // ela, porque e este toque que grava o perfil e navega.
    pie = (
      <BotonPrimario
        titulo={enUltimaPregunta ? t('comunes.empezar') : t('comunes.siguiente')}
        habilitado={respuestaValida}
        cargando={enUltimaPregunta ? guardando : false}
        onPress={avanzar}
      />
    );
  }

  return (
    <View style={estilos.raiz}>
      <StatusBar barStyle="light-content" backgroundColor={colores.noche} />

      {/* HiloFondo e IRMAO, nunca pai: ele nao renderiza children e tem
          pointerEvents 'none' — envolver a tela com ele daria uma tela vazia
          e intocavel, sem erro nenhum. */}
      {/* 'tenso' era a variante da surpresa e do fato. Sem esses dois passos o
          onboarding inteiro e conversa: o fundo fica quieto do comeco ao fim, e
          a tensao estreia na leitura de entrada, onde ela tem o que anunciar. */}
      <HiloFondo variante="quieto" />

      <SafeAreaView style={estilos.seguro}>
        <KeyboardAvoidingView
          style={estilos.seguro}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {enPreguntas ? (
            <View style={estilos.cabecera}>
              <View style={estilos.filaCabecera}>
                {puedeRetroceder ? (
                  <Pressable
                    onPress={retroceder}
                    accessibilityRole="button"
                    accessibilityLabel={t('comunes.volver')}
                    hitSlop={espacio.md}
                    style={estilos.volver}
                  >
                    <Micro style={estilos.textoVolver}>{t('comunes.volver')}</Micro>
                  </Pressable>
                ) : (
                  <View />
                )}
                <Micro tabular>
                  {t('onboarding.progreso', { n: indice + 1, total: TOTAL_PREGUNTAS })}
                </Micro>
              </View>

              <View
                style={estilos.pistaBarra}
                accessibilityRole="progressbar"
                accessibilityLabel={t('onboarding.progreso', {
                  n: indice + 1,
                  total: TOTAL_PREGUNTAS,
                })}
                accessibilityValue={{ min: 0, max: TOTAL_PREGUNTAS, now: indice + 1 }}
              >
                <View style={estilos.riel} />
                {/* O no do fio viaja na ponta do preenchimento: e a marca que a
                    barra do molde carrega no meio, aqui virada em progresso. */}
                <Animated.View style={[estilos.relleno, { width: anchoBarra }]}>
                  <View style={estilos.lineaLlena} />
                  <View style={estilos.nudo} />
                </Animated.View>
              </View>
            </View>
          ) : null}

          <ScrollView
            ref={scrollRef}
            style={estilos.seguro}
            contentContainerStyle={estilos.lienzo}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* ---------------- PASSO 0 — a promessa ---------------- */}
            {paso === PASO_CERO ? (
              <Aparecer sinMovimiento={sinMovimiento}>
                <Sobreceja>{t('app.nombre')}</Sobreceja>
                <Titulo style={estilos.tituloCero}>{cero.titulo}</Titulo>
                <Cuerpo style={estilos.cuerpoCero}>{cero.cuerpo}</Cuerpo>

                <View style={estilos.cajaHonesta}>
                  <Micro>{t('onboarding.datosNo')}</Micro>
                  <Micro style={estilos.lineaPrivacidad}>{t('onboarding.privacidad')}</Micro>
                </View>
              </Aparecer>
            ) : null}

            {/* ---------------- PASSOS 1..7 — as perguntas ---------------- */}
            {pregunta ? (
              // A key remonta o bloco inteiro a cada pergunta: e o que faz a
              // cascata acontecer de novo em vez de so trocar o texto no lugar.
              <View key={pregunta.id}>
                <Aparecer sinMovimiento={sinMovimiento}>
                  <Titulo>{pregunta.texto}</Titulo>
                  <Micro style={estilos.microcopy}>{pregunta.microcopy}</Micro>
                </Aparecer>

                {pregunta.tipo === 'texto' ? (
                  <Aparecer
                    retardo={RETARDO_CASCADA_MS}
                    sinMovimiento={sinMovimiento}
                    style={estilos.envolturaCampo}
                  >
                    <TextInput
                      value={typeof valorActual === 'string' ? valorActual : ''}
                      onChangeText={(texto) => responder(pregunta.id, texto)}
                      placeholder={pregunta.placeholder}
                      placeholderTextColor={colores.ceniza}
                      maxLength={pregunta.maxLargo}
                      autoFocus
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        if (esValida(pregunta.id, valorActual)) avanzar();
                      }}
                      // hilo como cursor e selecao: cor de traco, nunca de letra.
                      selectionColor={colores.hilo}
                      accessibilityLabel={pregunta.texto}
                      style={[estilos.campo, respuestaValida ? estilos.campoVivo : null]}
                    />
                  </Aparecer>
                ) : pregunta.tipo === 'fecha' ? (
                  <CampoFecha
                    pregunta={pregunta}
                    valor={valorActual}
                    alResponder={(fecha) => responder(pregunta.id, fecha)}
                    sinMovimiento={sinMovimiento}
                    mostrarErro={fechaImposible}
                  />
                ) : (
                  <View
                    accessibilityRole="radiogroup"
                    accessibilityLabel={pregunta.texto}
                    style={estilos.listaOpciones}
                  >
                    {pregunta.opciones.map((opcion, i) => (
                      <Opcion
                        key={opcion.id}
                        opcion={opcion}
                        elegida={valorActual === opcion.id}
                        alElegir={() => responder(pregunta.id, opcion.id)}
                        retardo={i * RETARDO_CASCADA_MS}
                        sinMovimiento={sinMovimiento}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : null}

            {/* ---------------- PASSOS 6 e 7 — DESLIGADOS EM 31/08 -------------
                Aqui viviam a CARTA-SURPRESA (t('sorpresa.titulo'), a CartaHilo
                com sacarMayor(), t('scratch.label') e t('sorpresa.pie')) e o
                FATO HISTORICO (t('hecho.*') + ContadorAnio + datos/hechos.js).

                POR QUE SAIU: decisao do dono — as tres cartas ciganas sao as
                unicas cartas do app, e uma carta de taro sorteada aqui seria uma
                quarta carta, de outro baralho, dez segundos antes delas.

                O QUE SE PERDE, DE PROPOSITO: a recompensa aos ~22 segundos. Ela
                mudou de lugar — agora e a primeira das tres ciganas, com o audio
                na voz do dono, logo depois da ultima pergunta.

                COMO RELIGAR: ver o bloco no cabecalho deste arquivo. As chaves
                de texto continuam em datos/textos.js e os componentes no lugar.
            ------------------------------------------------------------------ */}
          </ScrollView>

          {pie ? <View style={estilos.rodape}>{pie}</View> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  seguro: {
    flex: 1,
  },

  /* --- cabecera e barra de progresso --- */
  cabecera: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.lg,
    paddingBottom: espacio.md,
  },
  filaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
    marginBottom: espacio.sm,
  },
  volver: {
    paddingVertical: espacio.xs,
    paddingRight: espacio.md,
  },
  textoVolver: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  // A pista tem a altura do NO, nao a do trilho: assim o no cabe inteiro sem
  // overflow e o trilho fica centrado atras dele.
  pistaBarra: {
    height: TAMANO_NUDO,
    justifyContent: 'center',
  },
  riel: {
    height: ALTURA_RIEL,
    borderRadius: radio.sm,
    backgroundColor: colores.bordeSuave,
  },
  // hilo como BARRA e como NO: permitido pela regra travada. Como letra, nunca.
  relleno: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // `top` calculado em vez de alignSelf: filho absoluto com alinhamento
  // implicito e o tipo de coisa que centraliza em uma plataforma e nao na
  // outra. Aqui a conta e a mesma nas tres.
  lineaLlena: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (TAMANO_NUDO - ALTURA_RIEL) / 2,
    height: ALTURA_RIEL,
    borderRadius: radio.sm,
    backgroundColor: colores.hilo,
  },
  nudo: {
    width: TAMANO_NUDO,
    height: TAMANO_NUDO,
    borderRadius: TAMANO_NUDO / 2,
    // Sem isto o no se achata quando o preenchimento e mais estreito que ele.
    flexShrink: 0,
    backgroundColor: colores.hilo,
    ...sombra.nudo,
  },

  /* --- lienzo --- */
  lienzo: {
    flexGrow: 1,
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.lg,
    paddingBottom: espacio.xxl,
  },

  /* --- passo 0 --- */
  tituloCero: {
    marginTop: espacio.sm,
  },
  cuerpoCero: {
    marginTop: espacio.lg,
  },
  cajaHonesta: {
    marginTop: espacio.xxl,
    padding: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
  },
  lineaPrivacidad: {
    marginTop: espacio.sm,
  },

  /* --- perguntas --- */
  microcopy: {
    marginTop: espacio.md,
  },
  envolturaCampo: {
    marginTop: espacio.xl,
  },
  campo: {
    ...tipo.cuerpo,
    minHeight: 52,
    paddingHorizontal: espacio.lg,
    paddingVertical: espacio.md,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.penumbra,
  },
  campoVivo: {
    borderColor: colores.bordeHilo,
  },

  /* --- A DATA DE NASCIMENTO -------------------------------------------------
   * Tres celdas na mesma linha. O ano leva o dobro da largura porque leva o
   * dobro de digitos: campos do mesmo tamanho para conteudos de tamanhos
   * diferentes fazem o "1994" ficar apertado ao lado de um "03" com sobra. */
  filaFecha: {
    flexDirection: 'row',
  },
  celdaFecha: {
    flex: 1,
    marginRight: espacio.md,
  },
  celdaFechaAno: {
    flex: 2,
    marginRight: 0,
  },
  rotuloFecha: {
    marginBottom: espacio.sm,
  },
  // O numero centralizado: com tres caixas lado a lado, texto a esquerda faz os
  // digitos brigarem com a borda do vizinho.
  campoFecha: {
    textAlign: 'center',
  },
  erroFecha: {
    marginTop: espacio.md,
  },
  listaOpciones: {
    marginTop: espacio.xl,
  },
  envolturaOpcion: {
    marginBottom: espacio.md,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: espacio.md,
    paddingHorizontal: espacio.lg,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.penumbra,
  },
  opcionElegida: {
    borderColor: colores.bordeHilo,
    ...sombra.nudo,
  },
  opcionPresionada: {
    borderColor: colores.nudo,
  },
  marca: {
    width: 10,
    height: 10,
    borderRadius: radio.sm,
    marginRight: espacio.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.transparente,
  },
  marcaElegida: {
    borderColor: colores.hilo,
    backgroundColor: colores.hilo,
  },
  textoOpcion: {
    flex: 1,
  },

  /* --- surpresa e fato --- */
  carta: {
    marginTop: espacio.xl,
  },
  comandoRaspar: {
    marginTop: espacio.lg,
    textAlign: 'center',
  },
  nombreBloque: {
    marginTop: espacio.lg,
  },
  orientacion: {
    marginTop: espacio.xs,
    textAlign: 'center',
  },
  pieSorpresa: {
    marginTop: espacio.lg,
    textAlign: 'center',
  },
  bloqueHecho: {
    marginTop: espacio.xxl,
    padding: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
  },
  centrado: {
    textAlign: 'center',
  },
  anio: {
    alignSelf: 'center',
    marginTop: espacio.sm,
    textAlign: 'center',
  },
  titular: {
    marginTop: espacio.lg,
  },
  cuerpoHecho: {
    marginTop: espacio.md,
  },
  fuente: {
    marginTop: espacio.md,
  },
  divisor: {
    height: 1,
    marginVertical: espacio.lg,
    backgroundColor: colores.bordeSuave,
  },
  listo: {
    marginTop: espacio.md,
    color: colores.papel,
  },

  /* --- rodape fixo --- */
  rodape: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.md,
    paddingBottom: espacio.xl,
    backgroundColor: colores.noche,
    borderTopWidth: 1,
    borderTopColor: colores.bordeSuave,
  },
});
