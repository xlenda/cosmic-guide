// screens/SintesisScreen.js
// TELA 3 — "Tu hilo, hoy". E aqui que a leitura fecha.
//
// ===========================================================================
// A ORDEM DA TELA E CONTRATO, NAO GOSTO
// ===========================================================================
// De cima para baixo, e nesta ordem exata:
//
//   1. titulo ....................... t('sintesis.titulo')
//   2. saludo ....................... a UNICA aparicao do nome em todo o app
//   3. CajaLimites .................. ANTES do resultado, nunca depois
//   4. os tres blocos ............... lectura / tu parte / accion
//   5. o paragrafo de metodo ........ t('sintesis.metodo'), nao removivel
//   6. a tarjeta compartible ........ a View local que a captura fotografa
//   7. os dois botoes ............... guardar (vai ao Hilo) e compartir
//   8. o convite ao paywall ......... so depois de a leitura ser rolada ate o fim
//
// Os itens 3 e 5 nao sao decoracao e nao tem estado: sao o que separa este app
// de um funil de WhatsApp que promete desfecho. CajaLimites vem antes do
// resultado porque dizer na cara as tres coisas que uma carta nao entrega e o
// que da valor ao que vem em seguida — e porque essa caixa e o que a revisao
// das lojas procura numa ficha da categoria adivinhacao. O paragrafo de metodo
// fecha do outro lado: declara que isto e leitura simbolica e nao previsao.
//
// ===========================================================================
// O NOME APARECE UMA VEZ SO
// ===========================================================================
// lib/lectura.js ja devolve `sintesis.saludo` com o nome interpolado, e o motor
// deliberadamente NAO emite 'sintesis.cierre' (que tambem tem {nombre}). Esta
// tela nao chama essa chave e nao reimprime o nome em lugar nenhum — nem no
// card que se compartilha, que sai do telefone e vai para gente que nao pediu
// para saber como ela se chama.
//
// ===========================================================================
// O PAYWALL SO PODE APARECER DEPOIS DA LEITURA INTEIRA
// ===========================================================================
// Nunca antes, nunca por cima. Nao existe modal aqui, nao existe folha que
// sobe, nao existe conteudo escondido atras de compra: a leitura de hoje ja
// foi entregue inteira e de graca antes de qualquer convite. O convite e um
// rodape discreto (botao fantasma) que so monta quando duas condicoes valem:
//   · o ScrollView chegou ao fim (a leitura foi rolada ate o ultimo pixel);
//   · estaSuscrito() disse que ela ainda nao assina.
// Junto do convite fica t('paywall.salida') — "o que voce ja abriu continua
// seu" —, que fecha o convite sem prometer que o resto tambem sera de graça.
//
// ===========================================================================
// COMPARTIR: IMAGEM SE DER, TEXTO SEMPRE
// ===========================================================================
// Nao existe captura de View no nucleo do React Native e o projeto nao instala
// biblioteca nova. Um `require('react-native-view-shot')` dentro de try/catch
// NAO resolveria: o Metro resolve import estatico em tempo de bundle e quebraria
// o app inteiro antes de qualquer catch rodar. Por isso a tela PROCURA, em tempo
// de execucao, um capturador que o app tenha registrado em
// globalThis.__HILO_CAPTURAR__ (assinatura (ref, opciones) => Promise<uri>, que
// e a de captureRef). Sem capturador registrado, com capturador que falha, que
// demora demais ou que devolve lixo, o caminho e o mesmo: compartilha TEXTO.
// A usuaria nunca ve stack, nunca ve nome de modulo e nunca ve a tela quebrar.
//
// ===========================================================================
// RECARREGAR A PAGINA NAO PODE ENTREGAR UMA LEITURA VAZIA
// ===========================================================================
// A leitura chega por PARAMETRO DE ROTA, e parametro de rota nao sobrevive a um
// F5: na web o app remonta do zero e o React Navigation reconstroi a rota a
// partir do CAMINHO, que nao carrega objeto nenhum. (Antes ele carregava lixo:
// os objetos viravam "[object Object]" na query string. Corrigido no `stringify`
// do linking — ver lib/enlaces.js — e por isso hoje eles simplesmente somem.)
//
// Com params ausentes, componerLectura() devolve o formato inteiro com as
// tabelas genericas e ZERO cartas. Nao quebra, o que e pior: a tela mostraria
// titulo, saudacao sem nome, os tres blocos genericos e uma tarjeta sem carta
// nenhuma. Parece uma leitura, e nao e a leitura dela.
//
// Por isso esta tela tem TRES entradas, nesta ordem, e nunca renderiza a
// leitura generica:
//   1. a leitura pronta (prop `lectura` ou route.params.lectura);
//   2. os params crus { respuestas, tirada } — o caminho normal, vindo da Tirada;
//   3. o disco (lib/ultimaLectura.js), que guarda as respostas e os tres ids do
//      dia. componerLectura e pura e deterministica: a mesma entrada devolve a
//      mesma leitura, palavra por palavra.
// Sem nenhuma das tres — nao ha leitura hoje, ou o dia virou — a tela nao
// inventa: manda a pessoa de volta para as abas, que e um estado valido.
//
// Contrato de copy respeitado: nenhuma promessa de desfecho, nenhum genero
// assumido, nenhuma prova social, nenhum hex (toda cor vem de theme.js) e
// colores.hilo so como TRACO e FUNDO DE BOTAO, nunca como cor de texto.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';

import BotonPrimario from '../components/BotonPrimario';
import CajaLimites from '../components/CajaLimites';
import ColunaLeitura from '../../components/ColunaLeitura';
import FaixaCurva from '../../components/FaixaCurva';
import { space } from '../../theme';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Fuente, Micro, NombreCarta, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { existe, t } from '../datos/textos';
import useReducedMotion from '../../hooks/useReducedMotion';
import { atarNudo } from '../lib/hilo';
import { componerLectura } from '../lib/lectura';
import { completarMissao } from '../lib/missoes';
import { estaSuscrito } from '../lib/suscripcion';
import { leerUltimaLectura } from '../lib/ultimaLectura';
import { RUTAS } from '../routes';
import { colores, espacio, radio } from '../theme';

/** Largura de leitura. Acima disto a linha fica longa demais e o olho se perde
 *  ao voltar para a esquerda. Mesma medida de PrivacidadScreen. */
const ANCHO_LECTURA = 560;

/** Espessura de traco. Mesmo 1px de CajaLimites e de PrivacidadScreen. */
const GROSOR = 1;

/** Folga, em pixels, para considerar o fim do scroll alcancado. Sem ela, um
 *  arredondamento de meio pixel no Android faria a leitura nunca "terminar" e o
 *  convite nunca apareceria. */
const MARGEN_FINAL = 24;

/** Duracao do fade do convite. So roda quando o sistema NAO pede movimento
 *  reduzido; ver o efeito la embaixo. */
const MS_CONVITE = 260;

/** Teto para a captura. Um capturador travado nao pode deixar o botao girando
 *  para sempre: passou disto, a tela segue com texto. */
const MS_CAPTURA = 4000;

/** Onde o app pode registrar o capturador de View. Ver o cabecalho: a busca e
 *  por global e nunca por import, porque import de modulo ausente quebra o
 *  bundle antes de qualquer try/catch. */
const NOMBRE_CAPTURADOR = '__HILO_CAPTURAR__';

/** Repassadas ao capturador. Quem nao entender simplesmente ignora. */
const OPCIONES_CAPTURA = Object.freeze({ format: 'png', quality: 1, result: 'tmpfile' });

/** Identidade estavel para route.params ausente: sem isto o useMemo da leitura
 *  recomporia a cada render, porque `{}` novo nunca e igual a `{}` anterior. */
const SIN_PARAMETROS = Object.freeze({});

/* =================================================================================
 * AS TRES MISSOES QUE ESTA TELA COMPROVA
 *
 * Os ids sao os de lib/missoes.js, e o campo `prova` de cada entrada de la aponta
 * este arquivo em texto. O portao de test/madremaria-gamificacao.test.js abre o arquivo
 * nomeado no `prova` e exige encontrar o id junto de `completarMissao` — porque
 * missao ativa sem tela que a prove e o bug que o missions.js do Cosmic Guide
 * registrou, e ele nao aparece como erro: aparece como uma lista de tarefas que
 * nunca fecha e um "0 de 3" que nunca anda.
 *
 * Cada uma sai de um dado que esta tela JA media antes de existir missao nenhuma
 * — e por isso nenhuma delas inventa medicao:
 *   leitura-do-dia  ← a leitura foi entregue (o mesmo instante em que o no e atado)
 *   ler-ate-o-fim   ← `finLeido`, o scroll chegou ao ultimo pixel
 *   voltar-a-leitura← `rescate`, a leitura veio do disco em vez da rota: e a
 *                     SEGUNDA abertura do dia, que e exatamente o que a missao diz
 * ================================================================================= */
const MISSAO_LEITURA = 'leitura-do-dia';
const MISSAO_FIM = 'ler-ate-o-fim';
const MISSAO_VOLTAR = 'voltar-a-leitura';

/* =================================================================================
 * O rotulo do botao de guardar.
 *
 * Nao existe hoje uma chave 'sintesis.guardarEnHilo' em datos/textos.js, e esta
 * tela nao inventa palavra em espanhol na mao — toda copy sai do dicionario. Ate
 * a chave existir, o rotulo e composto de duas chaves reais; no dia em que ela
 * for adicionada, existe() a encontra e a composicao sai de cena sozinha, sem
 * ninguem precisar lembrar de voltar aqui.
 * ================================================================================= */
const CLAVE_GUARDAR = 'sintesis.guardarEnHilo';
const ROTULO_GUARDAR = existe(CLAVE_GUARDAR)
  ? t(CLAVE_GUARDAR)
  : `${t('comunes.guardar')} · ${t('hilo.titulo')}`;

/* =================================================================================
 * CAPTURA
 * ================================================================================= */

/** Procura o capturador registrado pelo app. Aceita a funcao direta ou um modulo
 *  que exponha `captureRef`. Nunca lanca; sem nada registrado devolve null. */
function obtenerCapturador() {
  const raiz = typeof globalThis === 'object' && globalThis ? globalThis : null;
  if (!raiz) return null;

  const registrado = raiz[NOMBRE_CAPTURADOR];
  if (typeof registrado === 'function') return registrado;
  if (registrado && typeof registrado.captureRef === 'function') return registrado.captureRef;
  return null;
}

/**
 * Fotografa a tarjeta. Devolve a uri da imagem ou null — e null nao e erro, e o
 * caminho normal quando nao ha capturador neste build.
 *
 * @param {{ current: any }} referencia ref da View da tarjeta
 * @returns {Promise<string|null>}
 */
async function capturarTarjeta(referencia) {
  const capturar = obtenerCapturador();
  if (!capturar || !referencia || !referencia.current) return null;

  let temporizador = null;
  try {
    // O .catch aqui e obrigatorio: sem ele, uma captura que rejeita DEPOIS de o
    // relogio ter vencido a corrida vira unhandled rejection no console.
    const captura = Promise.resolve(capturar(referencia.current, OPCIONES_CAPTURA)).catch(
      () => null
    );
    const reloj = new Promise((resolver) => {
      temporizador = setTimeout(() => resolver(null), MS_CAPTURA);
    });

    const uri = await Promise.race([captura, reloj]);
    return typeof uri === 'string' && uri.length > 0 ? uri : null;
  } catch {
    return null;
  } finally {
    if (temporizador) clearTimeout(temporizador);
  }
}

/** Abre a folha do sistema. Devolve true/false em vez de lancar: cancelar nao e
 *  falha (o proprio Share resolve com dismissedAction), entao so um erro de
 *  verdade chega ao catch. */
async function intentarCompartir(contenido) {
  try {
    await Share.share(contenido);
    return true;
  } catch {
    return false;
  }
}

/* =================================================================================
 * CONTEUDO
 * ================================================================================= */

/**
 * O texto que viaja quando a imagem nao existe — e que acompanha a imagem quando
 * ela existe. Sai inteiro da leitura e do dicionario: nenhuma frase nova nasce
 * aqui. Sem o nome, de proposito (ver cabecalho), e com a linha que impede o
 * print de virar promessa na conversa de outra pessoa.
 */
function textoParaCompartir(lectura) {
  const posiciones = Array.isArray(lectura.posiciones) ? lectura.posiciones : [];
  const accion = lectura.sintesis.accion;

  return [
    t('app.nombre'),
    lectura.sintesis.titulo,
    '',
    ...posiciones.map((p) => `${p.rotulo} · ${p.carta.nombre} (${p.orientacion})`),
    '',
    accion.rotulo,
    accion.texto,
    '',
    t('tirada.avisoOtraPersona'),
    t('app.tagline'),
  ]
    .filter((linea) => typeof linea === 'string')
    .join('\n')
    .trim();
}

/** Um dos tres blocos da sintese: cabecalho, texto e a nota da acao quando ela
 *  existe (so o bloco 'accion' traz `nota`).
 *
 *  DIAGRAMACAO (12/09/2026). Estes tres blocos SAO a leitura — e a razao de a
 *  pessoa estar nesta tela. Antes corriam no mesmo chao, separados por 32px de
 *  margem, entre a caixa de limites em cima e a caixa de metodo embaixo: cinco
 *  blocos de texto seguidos, todos com a mesma cara. Agora cada um tem CHAO
 *  PROPRIO e a borda de cima e uma onda.
 *
 *  O TOM ALTERNA pelo INDICE e nao por nome fixo, porque a lista vem do motor
 *  (lectura.sintesis.bloques) e a tela nao decide quantos blocos existem. Par
 *  vai de `noite`, impar de `ameixa` — assim nunca ha dois chaos iguais
 *  encostados, com qualquer quantidade de blocos.
 *
 *  A SEMENTE E A CHAVE DO BLOCO: onda diferente por bloco, e a mesma onda
 *  sempre que a mesma leitura reabrir (a semente e deterministica).
 *
 *  SEM `style` na faixa: o corpo dela ja traz `secao` em cima e embaixo e
 *  `tela` nos lados. Passar padding aqui insetaria o desenho inteiro e o chao
 *  viraria card — medido e consertado em 12/09/2026 na PerfilScreen. */
function Bloque({ bloque, indice }) {
  return (
    <FaixaCurva
      tom={indice % 2 === 0 ? 'noite' : 'ameixa'}
      semente={bloque.clave}
      grude={indice > 0}
    >
      <ColunaLeitura>
        <Rotulo accessibilityRole="header">{bloque.rotulo}</Rotulo>
        <Cuerpo style={estilos.bloqueTexto}>{bloque.texto}</Cuerpo>
        {bloque.nota ? <Micro style={estilos.bloqueNota}>{bloque.nota}</Micro> : null}
      </ColunaLeitura>
    </FaixaCurva>
  );
}

/* =================================================================================
 * TELA
 * ================================================================================= */

/**
 * @param {object} props
 * @param {object} [props.navigation] objeto do Stack. Sem ele os botoes existem
 *        e nao navegam — melhor que estourar em runtime na tela que fecha a leitura.
 * @param {object} [props.route] route.params espera { respuestas, tirada } — o
 *        que a TiradaScreen empilha — e aceita tambem { lectura } ja composta.
 * @param {object} [props.lectura] a leitura pronta, para teste ou para montar
 *        esta tela dentro de outra sem passar por rota.
 * @param {() => void} [props.onGuardar] saida alternativa do botao de guardar.
 * @param {() => void} [props.onPaywall] saida alternativa do convite do rodape.
 */
export default function SintesisScreen({
  navigation,
  route,
  lectura: lecturaProp,
  onGuardar,
  onPaywall,
}) {
  const parametros = (route && route.params) || SIN_PARAMETROS;

  /* ENTRADAS 1 e 2 — a leitura que veio pela rota (ou pela prop).
   *
   * `tirada` so vale como Array: depois de um reload o param pode chegar como a
   * string "[object Object]" de uma URL antiga guardada no historico, e
   * componerLectura sobre isso devolveria a leitura generica sem reclamar de
   * nada. null aqui significa "nao ha leitura na rota" — e e o que liga a
   * terceira entrada. */
  const lecturaDeRuta = useMemo(() => {
    const candidata = lecturaProp || parametros.lectura;
    if (candidata && typeof candidata === 'object' && candidata.sintesis) return candidata;
    if (!Array.isArray(parametros.tirada)) return null;
    return componerLectura({ respuestas: parametros.respuestas, tirada: parametros.tirada });
  }, [lecturaProp, parametros]);

  /* ENTRADA 3 — o disco.
   * null  = ainda procurando (a tela espera, sem desenhar leitura nenhuma)
   * false = procurou e nao ha nada de hoje  -> saida para as abas
   * objeto = a leitura recomposta */
  const [rescate, setRescate] = useState(null);

  useEffect(() => {
    if (lecturaDeRuta) return undefined;
    let vivo = true;
    leerUltimaLectura()
      .then((guardada) => {
        if (!vivo) return;
        setRescate(guardada ? componerLectura(guardada) : false);
      })
      .catch(() => {
        // leerUltimaLectura nao lanca por contrato; o catch existe para que uma
        // promessa rejeitada por outro motivo nao deixe a tela esperando para
        // sempre — sem leitura, a saida e a mesma.
        if (vivo) setRescate(false);
      });
    return () => {
      vivo = false;
    };
  }, [lecturaDeRuta]);

  const lectura = lecturaDeRuta || (rescate && typeof rescate === 'object' ? rescate : null);

  const posiciones = lectura && Array.isArray(lectura.posiciones) ? lectura.posiciones : [];

  const [nudo, setNudo] = useState(null);
  const [suscrita, setSuscrita] = useState(false);
  const [finLeido, setFinLeido] = useState(false);
  const [compartiendo, setCompartiendo] = useState(false);
  const [falloCompartir, setFalloCompartir] = useState(false);

  const refTarjeta = useRef(null);
  const altoVista = useRef(0);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  /* O no do dia.
   *
   * A TiradaScreen ja ata o no antes de empilhar esta tela e manda o resultado
   * em route.params.hilo — entao o caminho normal aqui e so LER esse resultado,
   * sem escrever de novo. O atarNudo() abaixo existe para quem chega por fora
   * desse caminho (teste, deep link, esta tela montada dentro de outra): a
   * funcao e idempotente dentro do mesmo dia, entao nem esse caso ata um no a
   * mais. Roda na ENTREGA da leitura e nao no toque do botao, porque o no marca
   * o dia em que ela veio ler — e ela ja veio.
   *
   * SO com leitura na mao: sem ela esta tela e uma passagem para as abas, e atar
   * um no ali marcaria um dia de leitura que nao aconteceu. */
  useEffect(() => {
    if (!lectura) return undefined;
    if (parametros.hilo && typeof parametros.hilo === 'object') {
      setNudo(parametros.hilo);
      return undefined;
    }
    let vivo = true;
    atarNudo().then((resultado) => {
      if (vivo && resultado) setNudo(resultado);
    });
    return () => {
      vivo = false;
    };
  }, [lectura, parametros]);

  /* AS MISSOES DESTA TELA — ver o bloco de constantes la em cima.
   *
   * Todas as tres sao disparadas e ESQUECIDAS: nenhuma trava a leitura, nenhuma
   * tem ramo de erro e nenhuma aparece na tela. `completarMissao` e idempotente
   * no dia e ignora id que nao esta no sorteio de hoje, entao remontar a tela,
   * voltar e reabrir, ou o efeito rodar duas vezes em dev nao marcam nada duas
   * vezes nem escrevem nada a toa.
   *
   * 1 e 2 · A leitura foi entregue, e de que porta ela veio.
   *
   * `rescate` como objeto significa que a leitura NAO veio da rota: veio do
   * disco, por lib/ultimaLectura.js, que so devolve o registro quando ele e do
   * dia corrente. Isso e, por construcao, a segunda abertura de hoje — a missao
   * 'voltar-a-leitura' inteira, medida sem guardar um contador para ela. */
  const restaurada = rescate && typeof rescate === 'object';
  useEffect(() => {
    if (!lectura) return;
    completarMissao(MISSAO_LEITURA);
    if (restaurada) completarMissao(MISSAO_VOLTAR);
  }, [lectura, restaurada]);

  /* Quem ja assina nao ve convite nenhum. */
  useEffect(() => {
    let vivo = true;
    estaSuscrito().then((activa) => {
      if (vivo) setSuscrita(activa === true);
    });
    return () => {
      vivo = false;
    };
  }, []);

  /* 3 · O fim da leitura.
   *
   * Pendurada em `finLeido` e nao dentro de `marcarFin` de proposito: `finLeido`
   * vira true por DOIS caminhos (o scroll chegando ao fim e o conteudo mais
   * curto que a tela, em `medirContenido`), e um efeito sobre o estado cobre os
   * dois sem duplicar a chamada em cada um deles. */
  useEffect(() => {
    if (finLeido && lectura) completarMissao(MISSAO_FIM);
  }, [finLeido, lectura]);

  const marcarFin = useCallback(() => {
    setFinLeido(true);
  }, []);

  const alDesplazar = useCallback(
    (evento) => {
      if (finLeido) return;
      const datos = evento && evento.nativeEvent;
      if (!datos) return;
      const { contentSize, contentOffset, layoutMeasurement } = datos;
      if (!contentSize || !contentOffset || !layoutMeasurement) return;
      const restante = contentSize.height - contentOffset.y - layoutMeasurement.height;
      if (restante <= MARGEN_FINAL) marcarFin();
    },
    [finLeido, marcarFin]
  );

  const medirVista = useCallback((evento) => {
    altoVista.current = evento.nativeEvent.layout.height;
  }, []);

  /* Conteudo mais curto que a tela nunca dispara onScroll: sem isto, num tablet
   * ou numa leitura curta o convite nunca apareceria — e nao por doutrina, por
   * bug. */
  const medirContenido = useCallback(
    (_ancho, alto) => {
      if (altoVista.current > 0 && alto <= altoVista.current + MARGEN_FINAL) marcarFin();
    },
    [marcarFin]
  );

  const irAlHilo = useCallback(() => {
    if (typeof onGuardar === 'function') return onGuardar();
    if (navigation && typeof navigation.navigate === 'function') {
      return navigation.navigate(RUTAS.HILO);
    }
    return undefined;
  }, [navigation, onGuardar]);

  /* Sem parametro de retorno de proposito. A PaywallScreen aceita um, mas o nome
   * dessa chave cai no padrao de promessa de desfecho do test/copy-promessa-app-inteiro.test.js e
   * escreve-la aqui abortaria o build. Nao faz falta: o paywall e EMPILHADO por
   * cima desta tela, entao a saida dele volta para a leitura por goBack() sem
   * ninguem precisar dizer para onde. */
  const irAlPaywall = useCallback(() => {
    if (typeof onPaywall === 'function') return onPaywall();
    if (navigation && typeof navigation.navigate === 'function') {
      return navigation.navigate(RUTAS.PAYWALL);
    }
    return undefined;
  }, [navigation, onPaywall]);

  /* Imagem se der, texto sempre. Duas tentativas no maximo: com uri e sem uri.
   * Cancelar a folha do sistema NAO conta como falha, entao a segunda tentativa
   * so acontece quando a primeira deu erro de verdade. */
  const compartir = useCallback(async () => {
    if (compartiendo || !lectura) return;
    setCompartiendo(true);
    setFalloCompartir(false);

    const texto = textoParaCompartir(lectura);
    const uri = await capturarTarjeta(refTarjeta);

    const conImagen = uri ? await intentarCompartir({ message: texto, url: uri }) : false;
    const listo = conImagen || (await intentarCompartir({ message: texto }));

    if (!montado.current) return;
    setCompartiendo(false);
    setFalloCompartir(!listo);
  }, [compartiendo, lectura]);

  /* --- o convite: monta so no fim da leitura, e some para quem ja assina ------ */
  const mostrarConvite = finLeido && !suscrita;
  const reducido = useReducedMotion();
  const opacidad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!mostrarConvite) return undefined;
    // reducido === null e o intervalo antes de o sistema responder: conta como
    // movimento reduzido, para ninguem receber um frame de animacao adiantado.
    if (reducido !== false) {
      opacidad.setValue(1);
      return undefined;
    }
    const animacion = Animated.timing(opacidad, {
      toValue: 1,
      duration: MS_CONVITE,
      useNativeDriver: true,
    });
    animacion.start();
    return () => animacion.stop();
  }, [mostrarConvite, reducido, opacidad]);

  /* --- a saida quando nao ha leitura ----------------------------------------
   * Chegou aqui sem params e sem nada no disco de hoje: URL colada, favorito
   * antigo, recarga no dia seguinte. Nao ha leitura a mostrar e inventar uma
   * generica seria pior do que nao mostrar nada.
   *
   * `replace` e nao `navigate`: um /sintesis aberto direto no navegador nasce
   * como a UNICA rota da pilha (nao ha tela por baixo para voltar), e navigate
   * deixaria essa tela morta no historico, esperando um goBack que a traria de
   * volta vazia. RUTAS.TIRADA aqui e a rota do Stack que HOSPEDA as abas — ver o
   * cabecalho de navegacion.js —, entao a pessoa cai nas abas, com barra, em Mi
   * Hilo. Nao ha replace no navegador de abas, entao navigate fica como reserva.
   *
   * Quem monta esta tela dentro de outra (onGuardar/onPaywall proprios) nao e
   * levado a lugar nenhum: naquele uso a navegacao e do dono da tela. */
  const sinLectura = !lectura && rescate === false;

  useEffect(() => {
    if (!sinLectura) return undefined;
    if (typeof onGuardar === 'function' || typeof onPaywall === 'function') return undefined;
    if (!navigation) return undefined;
    if (typeof navigation.replace === 'function') navigation.replace(RUTAS.TIRADA);
    else if (typeof navigation.navigate === 'function') navigation.navigate(RUTAS.TIRADA);
    return undefined;
  }, [navigation, onGuardar, onPaywall, sinLectura]);

  /* --- a linha de estado sob os botoes ---------------------------------------
   * Uma so, e nesta prioridade: a falha de compartilhar e a mais recente e a que
   * a usuaria acabou de provocar; a falha de disco so vale avisar quando o no de
   * hoje era novo (guardar de novo o mesmo dia nao perdeu nada). */
  let estado = null;
  if (falloCompartir) estado = t('errores.compartir');
  else if (nudo && nudo.nuevoNudo && nudo.persistido === false) estado = t('errores.guardado');
  else if (nudo && nudo.persistido) estado = t('sintesis.guardada');

  /* --- sem leitura: a espera, e a passagem -----------------------------------
   * Dois momentos caem aqui e os dois sao curtos: o disco sendo consultado
   * (milissegundos) e o frame entre decidir a saida e o navegador trocar de
   * tela. Sem texto de proposito — escrever "cargando" so para piscar, ou
   * anunciar um erro que ninguem cometeu, e ruido. O fundo e o mesmo `noche` de
   * sempre, entao a emenda com a tela seguinte e invisivel. */
  if (!lectura) {
    return (
      <View style={estilos.pantalla} testID="pantalla-sintesis">
        <HiloFondo variante="quieto" />
        <SafeAreaView style={estilos.espera}>
          <ActivityIndicator color={colores.ceniza} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={estilos.pantalla} testID="pantalla-sintesis">
      <HiloFondo variante="quieto" />

      <SafeAreaView style={estilos.segura}>
        <ScrollView
          style={estilos.scroll}
          contentContainerStyle={estilos.contenido}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={alDesplazar}
          onLayout={medirVista}
          onContentSizeChange={medirContenido}
        >
          <View style={estilos.columna}>
            <Sobreceja>{t('app.nombre')}</Sobreceja>
            <Titulo accessibilityRole="header" style={estilos.titulo}>
              {lectura.sintesis.titulo}
            </Titulo>

            {/* A unica vez que o nome dela aparece no app inteiro. Vem do motor
                ja interpolado; a tela nunca o remonta e nunca o repete. */}
            <Cuerpo style={estilos.saludo}>{lectura.sintesis.saludo}</Cuerpo>

            {/* ANTES do resultado. Nao removivel, nao condicional, sem prop de
                conteudo: quem renderiza o componente renderiza a declaracao
                inteira. O pe dela nao se repete fora daqui. */}
            <CajaLimites style={estilos.limites} />

          </View>

          {/* OS BLOCOS FICAM FORA DA `columna` de proposito: a faixa precisa
              SANGRAR de ponta a ponta pra ser chao, e a columna a capava em
              560px com recuo dos dois lados — que e o card gigante que o guia
              proibe. A largura de leitura nao se perdeu: cada bloco traz a
              propria ColunaLeitura por dentro, que e onde ela deve morar (e la
              ela e calculada em CARACTERES POR LINHA, entao acompanha a fonte,
              coisa que o 560 fixo nao faz). */}
          {lectura.sintesis.bloques.map((bloque, indice) => (
            <Bloque key={bloque.clave} bloque={bloque} indice={indice} />
          ))}

          <View style={estilos.columna}>

            {/* O paragrafo de metodo. Fecha a leitura declarando o que ela e:
                simbolica, e nao previsao. Fica em caixa propria para nao ser
                lido como mais um bloco da leitura. */}
            <View style={estilos.metodo}>
              <Micro>{lectura.sintesis.metodo}</Micro>
            </View>

            {/* --- a tarjeta: a View local que a captura fotografa --------------
                Ela e visivel de proposito. Se nao houver capturador neste build,
                a usuaria ainda ganha o resumo bonito na tela e compartilha o
                texto — a tela nao fica com um retangulo morto escondido fora do
                viewport so para servir a uma funcao que talvez nao exista.
                Sem o nome dela: isto sai do telefone. */}
            <View ref={refTarjeta} collapsable={false} style={estilos.tarjeta}>
              <View style={estilos.tarjetaHilo} />

              <Sobreceja>{t('app.nombre')}</Sobreceja>
              <Titulo style={estilos.tarjetaTitulo}>{lectura.sintesis.titulo}</Titulo>

              {posiciones.map((posicion) => (
                <View key={posicion.clave} style={estilos.tarjetaFila}>
                  <Sobreceja>{posicion.rotulo}</Sobreceja>
                  <NombreCarta style={estilos.tarjetaCarta}>
                    {posicion.carta.nombre}
                  </NombreCarta>
                  <Micro>{posicion.orientacion}</Micro>
                </View>
              ))}

              <View style={estilos.tarjetaSeparador} />

              <Rotulo>{lectura.sintesis.accion.rotulo}</Rotulo>
              <Cuerpo style={estilos.tarjetaAccion}>{lectura.sintesis.accion.texto}</Cuerpo>

              <Fuente style={estilos.tarjetaFirma}>{t('app.tagline')}</Fuente>
            </View>

            {/* --- as duas saidas ---------------------------------------------- */}
            <BotonPrimario
              titulo={ROTULO_GUARDAR}
              onPress={irAlHilo}
              style={estilos.botonGuardar}
            />
            <BotonPrimario
              titulo={t('comunes.compartir')}
              variante="fantasma"
              cargando={compartiendo}
              onPress={compartir}
              style={estilos.botonCompartir}
            />

            {estado ? (
              <Micro accessibilityLiveRegion="polite" style={estilos.estado}>
                {estado}
              </Micro>
            ) : null}

            {/* --- o convite, e so agora ---------------------------------------
                Depois da leitura inteira, depois do metodo, depois das duas
                saidas gratuitas e so quando o scroll chegou ao fim. Botao
                fantasma, para nao competir com o botao que leva ao Hilo. A linha
                de saida fica junto: a leitura de hoje e gratis e continua sendo. */}
            {mostrarConvite ? (
              <Animated.View style={[estilos.convite, { opacity: opacidad }]}>
                <Cuerpo>{t('paywall.titulo')}</Cuerpo>
                <Micro style={estilos.conviteSalida}>{t('paywall.salida')}</Micro>
                <BotonPrimario
                  titulo={t('paywall.boton')}
                  variante="fantasma"
                  onPress={irAlPaywall}
                  style={estilos.conviteBoton}
                />
              </Animated.View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  segura: {
    flex: 1,
  },
  // A espera enquanto o disco responde, e o frame antes de a saida acontecer.
  espera: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacio.xl,
  },
  scroll: {
    flex: 1,
  },
  // SEM paddingHorizontal (12/09/2026): as faixas dos blocos precisam sangrar de
  // ponta a ponta. O recuo desceu pra `columna`, que e quem embrulha tudo o que
  // NAO e faixa (a abertura, a caixa de metodo, o cartao de compartilhar e as
  // saidas) — e la ele ja convivia com o maxWidth.
  contenido: {
    paddingTop: espacio.xl,
    paddingBottom: espacio.xxxl,
  },
  columna: {
    width: '100%',
    maxWidth: ANCHO_LECTURA,
    alignSelf: 'center',
    // O gutter que saiu do ScrollView. Vive aqui porque a `columna` e o que
    // sobrou de conteudo capado — e o que precisa de recuo lateral.
    paddingHorizontal: espacio.xl,
  },

  titulo: {
    marginTop: espacio.sm,
  },
  saludo: {
    marginTop: espacio.lg,
  },
  limites: {
    marginTop: espacio.xl,
  },

  // `bloque` MORREU: era o `marginTop: xxl` que separava um bloco do outro. Quem
  // separa agora e a MUDANCA DE CHAO da faixa, e margem por fora de uma faixa
  // abre um rasgo de fundo entre dois chaos que devem encostar.
  bloqueTexto: {
    marginTop: espacio.md,
  },
  bloqueNota: {
    marginTop: espacio.md,
  },

  // `ar` (48) e nao `xxl` (32): acima dela agora termina uma FAIXA, e nao um
  // paragrafo. Separar uma caixa do chao que acabou pede o degrau maior — na
  // duvida entre dois degraus da escala, o maior.
  metodo: {
    marginTop: space.ar,
    padding: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
    borderWidth: GROSOR,
    borderColor: colores.bordeSuave,
  },

  // A tarjeta e a unica peca da tela desenhada para virar imagem: fundo opaco
  // (uma captura com fundo transparente sai preta em metade dos apps de
  // mensagem) e padding generoso, porque a folha do sistema costuma recortar
  // as bordas na previa.
  tarjeta: {
    marginTop: espacio.xxl,
    padding: espacio.xl,
    borderRadius: radio.lg,
    backgroundColor: colores.penumbra,
    borderWidth: GROSOR,
    borderColor: colores.bordeSuave,
    overflow: 'hidden',
  },
  // O fio: a assinatura da marca dentro do card. colores.hilo como TRACO —
  // como texto sobre fundo escuro daria 3,2:1 e reprovaria AA.
  tarjetaHilo: {
    height: 2,
    width: espacio.xxxl,
    marginBottom: espacio.lg,
    backgroundColor: colores.hilo,
  },
  tarjetaTitulo: {
    marginTop: espacio.xs,
  },
  tarjetaFila: {
    marginTop: espacio.lg,
  },
  tarjetaCarta: {
    marginTop: espacio.xs,
  },
  tarjetaSeparador: {
    height: GROSOR,
    marginTop: espacio.xl,
    marginBottom: espacio.lg,
    backgroundColor: colores.bordeSuave,
  },
  tarjetaAccion: {
    marginTop: espacio.md,
  },
  tarjetaFirma: {
    marginTop: espacio.xl,
  },

  botonGuardar: {
    marginTop: espacio.xxl,
  },
  botonCompartir: {
    marginTop: espacio.md,
  },
  estado: {
    marginTop: espacio.md,
    textAlign: 'center',
  },

  convite: {
    marginTop: espacio.xxxl,
    paddingTop: espacio.xl,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
  },
  conviteSalida: {
    marginTop: espacio.sm,
  },
  conviteBoton: {
    marginTop: espacio.lg,
  },
});
