// screens/MetodoScreen.js — "Cómo decide esta app"
//
// ===========================================================================
// O QUE ESTA TELA E — e por que ela e o argumento de marca do produto
// ===========================================================================
// A avaliacao mais curtida do maior app de astrologia do Brasil nao reclama de
// preco nem de bug: reclama de CONFIANCA — "o servico e amador, nao consigo
// confiar na informacao". Essa e a ferida aberta da categoria inteira, e e a
// unica que nao se fecha com desconto.
//
// Esta tela e o oposto exato daquela frase. Ela declara o mecanismo completo,
// no espirito do Recibo Cosmico: como as cartas sao sorteadas, o que as
// respostas do quiz mudam de verdade, o que elas NAO mudam, de onde vem o texto
// de cada carta, e onde a leitura se acaba. Nao ha vantagem em esconder isso —
// a magia deste produto nunca esteve no misterio do algoritmo, esta em receber
// uma imagem fixa que a pessoa nao escolheu.
//
// ===========================================================================
// TODA LINHA DAQUI E CONFERIVEL NO CODIGO. ESSA E A UNICA REGRA DA TELA.
// ===========================================================================
// Cada afirmacao foi lida no arquivo antes de ser escrita, e continua valendo
// so enquanto o arquivo continuar assim:
//
//  · "Fisher-Yates, uniforme, sem semente"  -> lib/mazo.js, funcao repartir():
//    Math.random() direto, sem parametro de aleatoriedade, sem semilla e sem
//    ponto de injecao. O modulo nao le storage, nao sabe quem esta usando e
//    nao recebe as respostas — a ausencia do parametro E a defesa, e esta
//    escrita la em comentario travado.
//  · "cartas nao repetem"                   -> lib/mazo.js: cada indice sorteado
//    sai do saco no mesmo passo; nao existe laco de "sorteia de novo".
//  · "a orientacao e sorteada por carta"    -> lib/mazo.js, funcao sacar().
//  · "as respostas mudam a pergunta"        -> lib/lectura.js, TABLAS: P2 calibra
//    o nudo, P3+P4 compoem a tensao, P5 da o tom do extremo.
//  · "o filtro de contato varre o texto"    -> lib/lectura.js, guardaContacto():
//    e uma varredura no texto JA composto, nao um `if` na escolha da frase.
//  · "o texto da carta entra verbatim"      -> lib/lectura.js: o campo `amor` de
//    datos/cartas.json e citacao e nao e reescrito por ninguem.
//  · "nao ha IA e nao ha rede"              -> nao existe fetch() no projeto, e
//    lib/lectura.js e puro: sem Date.now(), sem Math.random(), sem storage.
//
// Quem mexer num desses arquivos mexe nesta copy no MESMO commit. Uma tela que
// declara o mecanismo e mais perigosa do que nao ter tela nenhuma no dia em que
// o mecanismo muda e ela nao.
//
// OS NUMEROS NAO SAO DIGITADOS. As 78 cartas, o numero de perguntas e a probabilidade
// de invertida chegam importadas de lib/mazo.js e datos/preguntas.js e entram
// por interpolacao. Numero escrito a mao numa tela de transparencia e a maneira
// mais boba de a tela virar mentira.
//
// ===========================================================================
// REGRAS DO PROJETO QUE ESTE ARQUIVO CUMPRE
// ===========================================================================
//  · Toda cor sai de theme.js — nenhum hex, nenhum rgba() escrito a mao.
//  · colores.hilo so como TRACO; texto vermelho sobre noche reprova AA.
//  · Todo texto passa por t(); nenhuma string solta na tela.
//  · A caixa de limites e o componente CajaLimites, nao uma copia local: o
//    conteudo dela nao entra por prop justamente para que nenhuma tela consiga
//    esvaziar a declaracao sem querer.
//  · Nenhuma biblioteca nova.

import { useCallback, useEffect, useRef } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import BotonPrimario from '../components/BotonPrimario';
import CajaLimites from '../components/CajaLimites';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Fuente, Micro, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { TOTAL_PREGUNTAS } from '../datos/preguntas';
import { t } from '../datos/textos';
import { MAZO, PROBABILIDAD_INVERTIDA } from '../lib/mazo';
import { completarMissao } from '../lib/missoes';
import RUTAS from '../routes';
import { colores, espacio, radio, tipo } from '../theme';

/* ===================================================================================
   OS NUMEROS — importados, nunca digitados.
   =================================================================================== */

const TOTAL_CARTAS = MAZO.length;
const TOTAL_RESPUESTAS = TOTAL_PREGUNTAS;

// A probabilidade sai da mesma constante que o sorteio usa. Se alguem calibrar
// PROBABILIDAD_INVERTIDA amanha, esta tela conta a verdade nova sem ser tocada.
const PROB_INVERTIDA = `${Math.round(PROBABILIDAD_INVERTIDA * 100)}%`;

/* ===================================================================================
   A FICHA DO SORTEIO — cinco pares clave/valor.
   E a peca "recibo": a mesma informacao do paragrafo acima dela, mas na forma em
   que se confere um dado e nao na forma em que se le uma promessa.
   =================================================================================== */
const FICHA = Object.freeze([
  Object.freeze({ clave: 'metodo.ficha.algoritmo', valor: 'metodo.ficha.algoritmo.valor' }),
  Object.freeze({ clave: 'metodo.ficha.azar', valor: 'metodo.ficha.azar.valor' }),
  Object.freeze({ clave: 'metodo.ficha.semilla', valor: 'metodo.ficha.semilla.valor' }),
  Object.freeze({ clave: 'metodo.ficha.entrada', valor: 'metodo.ficha.entrada.valor' }),
  Object.freeze({ clave: 'metodo.ficha.repetidas', valor: 'metodo.ficha.repetidas.valor' }),
]);

/* Chave de array lida uma vez, na carga: t() aqui nao recebe variavel, entao o
   resultado nunca muda. O guard e o mesmo de components/CajaLimites.js — t() de
   chave morta devolve a propria chave (uma string), e string nao tem .map(). */
const comoLista = (clave) => {
  const valor = t(clave);
  return Array.isArray(valor) ? valor : [String(valor)];
};

const LINEAS_SI = comoLista('metodo.respuestas.si.lineas');
const LINEAS_NO = comoLista('metodo.respuestas.no.lineas');

/* ===================================================================================
   PECAS DE DESENHO
   =================================================================================== */

/** Cabecalho numerado de secao. O numero em aguja (8,3:1 sobre noche, AAA) e a
 *  progressao visivel do "recibo": cinco passos, na ordem em que a leitura acontece. */
function Seccion({ n, titulo, children }) {
  return (
    <View style={estilos.seccion}>
      <View style={estilos.seccionCabecera}>
        <Cuerpo tabular style={estilos.seccionNumero} accessible={false}>
          {String(n).padStart(2, '0')}
        </Cuerpo>
        <Cuerpo accessibilityRole="header" style={estilos.seccionTitulo}>
          {titulo}
        </Cuerpo>
      </View>
      {children}
    </View>
  );
}

/** Lista com risco. O risco e um traco e nunca um glifo de texto: e assim que a
 *  marca entra sem colocar vermelho sobre fundo escuro. `colorTraza` separa o que
 *  as respostas mudam (aguja) do que elas nao mudam (ceniza), sem inventar cor. */
function Lineas({ lineas, colorTraza }) {
  return (
    <View style={estilos.lineas}>
      {lineas.map((linea) => (
        <View key={linea} style={estilos.linea}>
          <View style={[estilos.risco, { backgroundColor: colorTraza }]} />
          <Micro style={estilos.lineaTexto}>{linea}</Micro>
        </View>
      ))}
    </View>
  );
}

/**
 * A missao que ESTA tela comprova.
 *
 * O `prova` daquela entrada em lib/missoes.js aponta este arquivo, e o portao de
 * test/gamificacao.test.js abre o arquivo nomeado ali e exige achar este id
 * junto de `completarMissao`.
 *
 * A missao fecha na ABERTURA do Metodo, e nao "ao abrir a fonte de uma carta":
 * esta tela e uma rolagem estatica, nao existe fonte por carta para abrir e nao
 * existe carta para escolher. O `prova` anterior descrevia uma interacao que o
 * app nao tem — e uma missao assim aparece na lista e nunca fecha. A fonte que a
 * tela realmente mostra e t('metodo.texto.fuente'), na secao 03, e e disso que a
 * copy da missao fala agora.
 */
const MISSAO_DESTA_TELA = 'fonte-de-uma-carta';

/**
 * A SEGUNDA missao que esta tela comprova, e ela fecha no FIM DA ROLAGEM.
 *
 * O `prova` de 'o-que-nao-diz' em lib/missoes.js aponta este arquivo. Ela era a
 * ultima missao ativa do catalogo que NENHUMA tela marcava: aparecia nas tres de
 * hoje e ficava pendente para sempre. Na tela isso nao parece bug, parece tarefa
 * que a pessoa nao consegue cumprir — que e a punicao mais muda que uma lista de
 * missoes pode ter.
 *
 * O gatilho e o fim da rolagem, e nao "a caixa aberta ate o fim": CajaLimites nao
 * tem estado nenhum, ela desenha o conteudo inteiro sempre. O que esta tela SABE
 * e a rolagem, e a caixa e a ultima secao antes do fecho — chegar ao fim e ter
 * passado por ela por inteiro.
 *
 * Gatilho DIFERENTE do da missao de cima de proposito: as duas falam de coisas
 * diferentes, e fechar as duas com o mesmo gesto seria mentira. (Na pratica so
 * uma das duas e sorteada por dia — as duas sao do grupo `descoberta`.)
 */
const MISSAO_LIMITES = 'o-que-nao-diz';

/** Folga, em pixels, para considerar o fim do scroll alcancado. Mesma medida e
 *  mesmo motivo de screens/SintesisScreen.js: sem ela um arredondamento de meio
 *  pixel no Android faria a rolagem nunca "terminar" e a missao nunca fechar. */
const MARGEN_FINAL = 24;

/* ===================================================================================
   A TELA
   =================================================================================== */

export default function MetodoScreen({ navigation }) {
  /* A missao desta tela — ver MISSAO_DESTA_TELA logo acima.
   *
   * Marca na ABERTURA, uma vez por montagem. O ref existe porque em dev o efeito
   * roda duas vezes (StrictMode) e porque a tela pode remontar ao voltar da
   * Ayuda: `completarMissao` ja e idempotente no dia, mas evitar a segunda
   * chamada evita tambem a segunda ida ao disco.
   *
   * Disparada e esquecida: nada nesta tela depende do resultado, e nao ha ramo
   * de erro — id fora do sorteio de hoje nao grava nada e devolve o mesmo
   * resumo. */
  const marcada = useRef(false);
  useEffect(() => {
    if (marcada.current) return;
    marcada.current = true;
    completarMissao(MISSAO_DESTA_TELA);
  }, []);

  const volver = useCallback(() => {
    if (navigation && typeof navigation.goBack === 'function') navigation.goBack();
  }, [navigation]);

  const irAAyuda = useCallback(() => {
    if (navigation && typeof navigation.navigate === 'function') navigation.navigate(RUTAS.AYUDA);
  }, [navigation]);

  /* A SEGUNDA missao — 'o-que-nao-diz', ver MISSAO_LIMITES la em cima.
   *
   * Ref e nao state de proposito: nada nesta tela muda de aparencia quando a
   * missao fecha, e um setState por frame de scroll seria custo puro numa tela
   * que so rola. */
  const fimLido = useRef(false);
  const altoVista = useRef(0);

  const marcarFim = useCallback(() => {
    if (fimLido.current) return;
    fimLido.current = true;
    completarMissao(MISSAO_LIMITES);
  }, []);

  const alDesplazar = useCallback(
    (evento) => {
      if (fimLido.current) return;
      const datos = evento && evento.nativeEvent;
      if (!datos) return;
      const { contentSize, contentOffset, layoutMeasurement } = datos;
      if (!contentSize || !contentOffset || !layoutMeasurement) return;
      if (contentSize.height - contentOffset.y - layoutMeasurement.height <= MARGEN_FINAL) {
        marcarFim();
      }
    },
    [marcarFim]
  );

  const medirVista = useCallback((evento) => {
    altoVista.current = evento.nativeEvent.layout.height;
  }, []);

  /* Conteudo mais curto que a janela nunca dispara onScroll. Num tablet grande a
   * missao ficaria impossivel — e nao por doutrina, por bug. Mesma rede de
   * seguranca de screens/SintesisScreen.js. */
  const medirContenido = useCallback(
    (_ancho, alto) => {
      if (altoVista.current > 0 && alto <= altoVista.current + MARGEN_FINAL) marcarFim();
    },
    [marcarFim]
  );

  return (
    <View style={estilos.raiz}>
      <StatusBar barStyle="light-content" />
      {/* 'tenso' e nao 'quieto': esta e a tela do argumento, e a curva diagonal
          atravessa a leitura em vez de descansar embaixo dela. Muda so a
          curvatura — cor, espessura e opacidade sao as mesmas nas duas. */}
      <HiloFondo variante="tenso" />

      <SafeAreaView style={estilos.segura}>
        <ScrollView
          contentContainerStyle={estilos.scroll}
          onLayout={medirVista}
          onContentSizeChange={medirContenido}
          onScroll={alDesplazar}
          scrollEventThrottle={16}
        >
          <Pressable
            onPress={volver}
            accessibilityRole="button"
            accessibilityLabel={t('comunes.volver')}
            hitSlop={espacio.md}
            style={estilos.volver}
          >
            <View style={estilos.volverTraza} />
            <Rotulo>{t('comunes.volver')}</Rotulo>
          </Pressable>

          <Sobreceja style={estilos.sobreceja}>{t('metodo.sobreceja')}</Sobreceja>
          <Titulo accessibilityRole="header">{t('metodo.titulo')}</Titulo>
          <Cuerpo style={estilos.entrada}>{t('metodo.entrada')}</Cuerpo>

          {/* --- 01. o sorteio -------------------------------------------------- */}
          <Seccion n={1} titulo={t('metodo.sorteo.titulo')}>
            <Micro style={estilos.parrafo}>
              {t('metodo.sorteo.cuerpo', { cartas: TOTAL_CARTAS })}
            </Micro>
            <Micro style={estilos.parrafo}>
              {t('metodo.sorteo.orientacion', { prob: PROB_INVERTIDA })}
            </Micro>

            <View style={estilos.ficha}>
              <Sobreceja style={estilos.fichaTitulo}>{t('metodo.ficha.titulo')}</Sobreceja>
              {FICHA.map((fila) => (
                <View key={fila.clave} style={estilos.fichaFila}>
                  <Micro style={estilos.fichaClave}>{t(fila.clave)}</Micro>
                  <Micro style={estilos.fichaValor}>{t(fila.valor)}</Micro>
                </View>
              ))}
              <Micro style={estilos.fichaPie}>{t('metodo.ficha.pie')}</Micro>
            </View>
          </Seccion>

          {/* --- 02. o que as respostas mudam, e o que nao ---------------------- */}
          <Seccion n={2} titulo={t('metodo.respuestas.titulo', { preguntas: TOTAL_RESPUESTAS })}>
            <Sobreceja style={estilos.grupo}>{t('metodo.respuestas.si')}</Sobreceja>
            <Lineas lineas={LINEAS_SI} colorTraza={colores.aguja} />

            <Sobreceja style={estilos.grupo}>{t('metodo.respuestas.no')}</Sobreceja>
            <Lineas lineas={LINEAS_NO} colorTraza={colores.ceniza} />

            <Micro style={estilos.parrafo}>{t('metodo.respuestas.pie')}</Micro>
          </Seccion>

          {/* --- 03. de onde vem o texto ---------------------------------------- */}
          <Seccion n={3} titulo={t('metodo.texto.titulo')}>
            <Micro style={estilos.parrafo}>
              {t('metodo.texto.cuerpo', { cartas: TOTAL_CARTAS })}
            </Micro>
            {/* <Fuente> e o estilo da citacao verificavel — obra, autor, ano.
                E o lugar que neste app substitui a prova social inventada. */}
            <Fuente style={estilos.fuente}>{t('metodo.texto.fuente')}</Fuente>
            <Micro style={estilos.parrafo}>{t('metodo.texto.pie')}</Micro>
          </Seccion>

          {/* --- 04. sem IA, sem rede ------------------------------------------- */}
          <Seccion n={4} titulo={t('metodo.offline.titulo')}>
            <Micro style={estilos.parrafo}>{t('metodo.offline.cuerpo')}</Micro>
            {/* A prova que a pessoa pode fazer sozinha, em papel: e a unica linha
                da tela que ela consegue verificar sem abrir o codigo. */}
            <View style={estilos.prueba}>
              <View style={estilos.pruebaTraza} />
              <Cuerpo style={estilos.pruebaTexto}>{t('metodo.offline.prueba')}</Cuerpo>
            </View>
            <Micro style={estilos.parrafo}>{t('metodo.offline.pie')}</Micro>
          </Seccion>

          {/* --- 05. onde a leitura se acaba ------------------------------------ */}
          <Seccion n={5} titulo={t('metodo.limites.titulo')}>
            <Micro style={estilos.parrafo}>{t('metodo.limites.entrada')}</Micro>
            {/* Mesmo componente da sintese, palavra por palavra. Se um dia o
                texto mudar la, muda aqui junto — que e exatamente o motivo de a
                caixa nao aceitar conteudo por prop. */}
            <CajaLimites style={estilos.caja} />
          </Seccion>

          <Cuerpo style={estilos.cierre}>{t('metodo.cierre')}</Cuerpo>

          <BotonPrimario
            titulo={t('metodo.ayuda')}
            onPress={irAAyuda}
            variante="fantasma"
            style={estilos.botonAyuda}
          />

          <Micro style={estilos.version}>{t('legal.version')}</Micro>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ===================================================================================
   ESTILOS — so geometria e tokens.
   =================================================================================== */

const GROSOR = 1;

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  segura: {
    flex: 1,
  },
  scroll: {
    padding: espacio.xl,
    paddingBottom: espacio.xxxl,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },

  volver: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: espacio.xl,
  },
  volverTraza: {
    width: espacio.lg,
    height: GROSOR,
    marginRight: espacio.sm,
    backgroundColor: colores.hilo,
  },

  sobreceja: {
    marginBottom: espacio.sm,
  },
  entrada: {
    marginTop: espacio.md,
  },

  seccion: {
    marginTop: espacio.xxl,
    paddingTop: espacio.xl,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
  },
  seccionCabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: espacio.md,
  },
  // Numero e titulo compartilham tipo.cuerpo: mesma entrelinha, entao a linha de
  // base bate sozinha e nao ha ajuste vertical a mao.
  seccionNumero: {
    width: espacio.xxxl,
    color: colores.aguja,
  },
  seccionTitulo: {
    flex: 1,
  },

  parrafo: {
    marginTop: espacio.md,
    marginLeft: espacio.xxxl,
  },

  ficha: {
    marginTop: espacio.lg,
    marginLeft: espacio.xxxl,
    padding: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
    borderWidth: GROSOR,
    borderColor: colores.bordeSuave,
  },
  fichaTitulo: {
    marginBottom: espacio.md,
  },
  fichaFila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: espacio.xs,
  },
  fichaClave: {
    flex: 1,
    paddingRight: espacio.md,
  },
  // O valor e o dado: papel, para ser lido de relance como se le um recibo.
  fichaValor: {
    flex: 1,
    color: colores.papel,
    textAlign: 'right',
  },
  fichaPie: {
    marginTop: espacio.md,
    paddingTop: espacio.md,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
  },

  grupo: {
    marginTop: espacio.lg,
    marginLeft: espacio.xxxl,
  },
  lineas: {
    marginLeft: espacio.xxxl,
  },
  linea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: espacio.sm,
  },
  // O risco alinha com a PRIMEIRA linha do texto ao lado: metade da entrelinha de
  // tipo.micro menos metade da propria espessura. Lendo o token, se a escala
  // tipografica mudar amanha o risco continua alinhado sozinho.
  risco: {
    width: espacio.md,
    height: GROSOR,
    marginRight: espacio.md,
    marginTop: (tipo.micro.entrelinea - GROSOR) / 2,
  },
  lineaTexto: {
    flex: 1,
  },

  fuente: {
    marginTop: espacio.md,
    marginLeft: espacio.xxxl,
  },

  prueba: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: espacio.lg,
    marginLeft: espacio.xxxl,
    padding: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
  },
  // Barra vertical em hilo: a marca marcando a unica linha da tela que a pessoa
  // pode conferir sozinha, em trinta segundos, sem acreditar em nos.
  pruebaTraza: {
    width: GROSOR + 1,
    marginRight: espacio.lg,
    backgroundColor: colores.hilo,
  },
  pruebaTexto: {
    flex: 1,
  },

  caja: {
    marginTop: espacio.lg,
    marginLeft: espacio.xxxl,
  },

  cierre: {
    marginTop: espacio.xxl,
    paddingTop: espacio.xl,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
  },
  botonAyuda: {
    marginTop: espacio.xl,
  },
  version: {
    marginTop: espacio.xl,
    opacity: 0.7,
  },
});
