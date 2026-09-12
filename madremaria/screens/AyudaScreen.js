// screens/AyudaScreen.js — "Resolver un problema"
//
// ===========================================================================
// POR QUE ESTA TELA EXISTE, E POR QUE ELA NAO E UM FORMULARIO
// ===========================================================================
// O dossie mediu a categoria antes de escrevermos uma linha: COBRANCA e a
// reclamacao numero 1 do nicho — 29,1% das avaliacoes negativas. E a resposta
// util para cobranca nunca e "preencha e aguarde". Quem esta com raiva de um
// cargo que nao reconhece nao quer um chamado: quer cancelar, quer o dinheiro
// de volta e quer nos proximos trinta segundos.
//
// Por isso a tela e uma ESCADA e nao um formulario:
//   1. a pessoa diz o que esta acontecendo (cinco categorias, nada mais);
//   2. a categoria abre PASSOS QUE RESOLVEM ali mesmo — restaurar a compra,
//      abrir a assinatura na loja, recarregar, apagar o que ficou guardado;
//   3. so DEPOIS disso o "Escríbenos" acende.
//
// O botao de escrever nasce APAGADO de proposito (BotonPrimario, padrao 6:
// o botao acende quando a resposta fica valida). Nao e obstaculo — e o mesmo
// gesto que faz o correio chegar ja classificado, em vez de comecar com uma
// ida e volta perguntando "de qual cobranca voce fala?".
//
// ===========================================================================
// O DIAGNOSTICO E VISIVEL ANTES DE SAIR — essa e a tela inteira em uma frase
// ===========================================================================
// O correio leva quatro linhas: versao da app, plataforma, sistema e a
// categoria escolhida. NADA MAIS. Nunca o nome, nunca as respostas,
// nunca uma linha da leitura.
//
// E a tela mostra essas quatro linhas na cara, com os valores reais, ANTES de
// abrir o app de correio. Dizer "seus dados estao seguros" e o que todo mundo
// escreve; mostrar o payload exato e o que ninguem faz — e e a unica versao
// dessa frase que da para conferir. Nao existe caminho neste arquivo que
// coloque conteudo de leitura no corpo do e-mail: `ayuda.correo.cuerpo` so
// interpola {diagnostico}, e {diagnostico} e montado aqui, com estas quatro
// linhas e nenhuma outra.
//
// ===========================================================================
// REGRAS DO PROJETO QUE ESTE ARQUIVO CUMPRE
// ===========================================================================
//  · Toda cor sai de theme.js — nenhum hex, nenhum rgba() escrito a mao.
//  · colores.hilo aparece so como TRACO (o sinal +/− do acordeao, os riscos
//    das secoes) e como FUNDO de botao, nunca como cor de texto.
//  · Todo texto passa por t() de datos/textos.js; nenhuma string solta na tela.
//  · Nenhuma biblioteca nova: Linking e Platform sao do core do React Native.
//
// CONFIRMACAO SEM Alert: a confirmacao de "borrar" e um estado desta tela e
// nao um Alert.alert do sistema. Alert e no-op silencioso no React Native Web —
// no navegador o botao destrutivo simplesmente nao faria nada, ou pior, faria
// tudo sem perguntar. A confirmacao inline funciona nas tres plataformas.
//
// NOTA DE VIZINHANCA: `privacidad.borrar.cuerpo` promete um "Borrar todo" na
// tela de Ajustes. As duas portas apagam as MESMAS chaves (CLAVES_BORRABLES
// abaixo). Quem mexer numa mexe na outra, ou uma das duas passa a mentir.

import { useCallback, useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

// A versao vem do app.json e nao de uma constante digitada aqui: numero de
// versao escrito a mao e a primeira coisa que fica velha, e a versao errada no
// diagnostico e pior do que nao ter diagnostico. O `with { type: 'json' }` e a
// mesma forma usada por lib/mazo.js — atende o Metro e o Node ao mesmo tempo.
import APP_JSON from '../../app.json' with { type: 'json' };
import BotonPrimario from '../components/BotonPrimario';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { t } from '../datos/textos';
import { borrarSeguro } from '../lib/almacen';
import { restaurar } from '../lib/suscripcion';
import RUTAS from '../routes';
import { colores, espacio, radio } from '../theme';

/* ===================================================================================
   CONSTANTES DE PLATAFORMA
   =================================================================================== */

const VERSION_APP = (APP_JSON && APP_JSON.expo && APP_JSON.expo.version) || null;

// As duas contas de loja onde uma assinatura pode viver. No telefone mostramos
// so a da plataforma; no navegador mostramos as duas, porque quem abriu a app
// no navegador pode ter comprado em qualquer uma das duas — adivinhar ali seria
// mandar a pessoa para a loja errada.
const TIENDAS = Object.freeze([
  Object.freeze({
    id: 'ios',
    rotulo: 'ayuda.paso.tienda.apple',
    url: 'https://apps.apple.com/account/subscriptions',
  }),
  Object.freeze({
    id: 'android',
    rotulo: 'ayuda.paso.tienda.google',
    url: 'https://play.google.com/store/account/subscriptions',
  }),
]);

const TIENDAS_VISIBLES = (() => {
  const dePlataforma = TIENDAS.filter((x) => x.id === Platform.OS);
  return dePlataforma.length > 0 ? dePlataforma : TIENDAS;
})();

// Recarregar de verdade so existe no navegador. No telefone nao ha API de
// reinicio sem expo-updates (que nao esta nas dependencias), entao la o passo
// e a instrucao — que resolve igual — e o botao simplesmente nao aparece, em
// vez de aparecer e nao fazer nada.
const PUEDE_RECARGAR_AQUI =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  !!(window.location && typeof window.location.reload === 'function');

// As chaves NUAS do lib/almacen.js — o prefixo 'hr.' e aplicado la dentro e
// nunca aqui. A lista e a mesma que privacidad.guarda.lineas descreve.
//
// 'suscripcion' fica FORA de propósito: nao e um dado sobre a pessoa, e a marca
// local de um acesso ja pago. Apaga-la nao devolveria privacidade nenhuma e
// tiraria da pessoa o que ela comprou — o oposto do que este botao promete.
const CLAVES_BORRABLES = Object.freeze(['perfil', 'hilo', 'limite']);

/* ===================================================================================
   AS CINCO CATEGORIAS E OS SEIS PASSOS

   Categoria = o que a pessoa diz que esta acontecendo. Passo = o que resolve.
   Um passo pode aparecer em mais de uma categoria (restaurar resolve tanto
   "me cobraram" quanto "paguei e nao abriu") — por isso os dois vivem em
   tabelas separadas, ligadas por id, e nao em uma arvore aninhada.

   As chaves de texto sao ESCRITAS por extenso e nunca montadas com template
   string: chave montada nao aparece num grep, e uma chave morta so seria
   descoberta quando a pessoa ja estivesse com o problema na mao.
   =================================================================================== */

const PASOS = Object.freeze({
  restaurar: Object.freeze({
    titulo: 'ayuda.paso.restaurar.titulo',
    cuerpo: 'ayuda.paso.restaurar.cuerpo',
    accion: 'restaurar',
  }),
  tienda: Object.freeze({
    titulo: 'ayuda.paso.tienda.titulo',
    cuerpo: 'ayuda.paso.tienda.cuerpo',
    accion: 'tienda',
  }),
  reembolso: Object.freeze({
    titulo: 'ayuda.paso.reembolso.titulo',
    cuerpo: 'ayuda.paso.reembolso.cuerpo',
    accion: null,
  }),
  recargar: Object.freeze({
    titulo: 'ayuda.paso.recargar.titulo',
    cuerpo: 'ayuda.paso.recargar.cuerpo',
    accion: 'recargar',
  }),
  metodo: Object.freeze({
    titulo: 'ayuda.paso.metodo.titulo',
    cuerpo: 'ayuda.paso.metodo.cuerpo',
    accion: 'metodo',
  }),
  borrar: Object.freeze({
    titulo: 'ayuda.paso.borrar.titulo',
    cuerpo: 'ayuda.paso.borrar.cuerpo',
    accion: 'borrar',
  }),
});

const CATEGORIAS = Object.freeze([
  Object.freeze({
    id: 'cobro',
    titulo: 'ayuda.cat.cobro',
    sub: 'ayuda.cat.cobro.sub',
    pasos: Object.freeze(['restaurar', 'tienda', 'reembolso']),
  }),
  Object.freeze({
    id: 'acceso',
    titulo: 'ayuda.cat.acceso',
    sub: 'ayuda.cat.acceso.sub',
    pasos: Object.freeze(['recargar', 'restaurar']),
  }),
  Object.freeze({
    id: 'contenido',
    titulo: 'ayuda.cat.contenido',
    sub: 'ayuda.cat.contenido.sub',
    pasos: Object.freeze(['metodo']),
  }),
  Object.freeze({
    id: 'tecnico',
    titulo: 'ayuda.cat.tecnico',
    sub: 'ayuda.cat.tecnico.sub',
    pasos: Object.freeze(['recargar', 'borrar']),
  }),
  Object.freeze({
    id: 'otro',
    titulo: 'ayuda.cat.otro',
    sub: 'ayuda.cat.otro.sub',
    pasos: Object.freeze([]),
  }),
]);

/* ===================================================================================
   PECAS DE DESENHO
   =================================================================================== */

/** O sinal do acordeao: dois tracos em hilo que formam + fechado e − aberto.
 *  E traco, nunca glifo de texto — hilo como TEXTO sobre noche reprova AA. */
function Signo({ abierta }) {
  return (
    <View style={estilos.signo} pointerEvents="none" accessible={false}>
      <View style={estilos.signoBarra} />
      {abierta ? null : <View style={[estilos.signoBarra, estilos.signoBarraVertical]} />}
    </View>
  );
}

/** Numero do passo, em aguja (8,3:1 sobre noche — AAA). Tabular para que 1 e 2
 *  ocupem a mesma largura e a coluna de texto nao dance entre passos. */
function Numero({ n }) {
  return (
    <Cuerpo tabular style={estilos.numero} accessible={false}>
      {String(n)}
    </Cuerpo>
  );
}

/* ===================================================================================
   A TELA
   =================================================================================== */

export default function AyudaScreen({ navigation }) {
  // Uma categoria aberta por vez: a tela toda tem de caber na cabeca de quem
  // esta irritado. Abrir de novo a mesma fecha.
  const [abierta, setAbierta] = useState(null);

  // { paso, texto } — a mensagem de resultado mora COLADA no passo que a gerou,
  // e nao num toast no topo que some antes de ser lido.
  const [aviso, setAviso] = useState(null);

  const [restaurando, setRestaurando] = useState(false);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const categoria = useMemo(() => CATEGORIAS.find((c) => c.id === abierta) || null, [abierta]);
  const correo = t('legal.correo');

  const alternar = useCallback((id) => {
    setAviso(null);
    setConfirmandoBorrado(false);
    setAbierta((actual) => (actual === id ? null : id));
  }, []);

  const irA = useCallback(
    (ruta) => {
      if (navigation && typeof navigation.navigate === 'function') navigation.navigate(ruta);
    },
    [navigation]
  );

  const volver = useCallback(() => {
    if (navigation && typeof navigation.goBack === 'function') navigation.goBack();
  }, [navigation]);

  /* --- as quatro linhas que saem no correio, e mais nenhuma --------------------- */
  const diagnostico = useMemo(() => {
    const sinDato = t('ayuda.diagnostico.sinDato');
    return [
      { clave: t('ayuda.diagnostico.version'), valor: VERSION_APP || sinDato },
      { clave: t('ayuda.diagnostico.plataforma'), valor: Platform.OS || sinDato },
      {
        clave: t('ayuda.diagnostico.sistema'),
        // Platform.Version e o numero do iOS/Android; no web nao existe.
        valor: Platform.Version == null ? sinDato : String(Platform.Version),
      },
      {
        clave: t('ayuda.diagnostico.categoria'),
        valor: categoria ? t(categoria.titulo) : t('ayuda.diagnostico.sinCategoria'),
      },
    ];
  }, [categoria]);

  /* --- acoes ------------------------------------------------------------------- */

  const alRestaurar = useCallback(async () => {
    setRestaurando(true);
    setAviso(null);
    // lib/suscripcion.js devolve sempre {ok:false, motivo:'sin-backend'} no v1.
    // A tela mostra "todavia no hay tienda", que e a verdade — e NAO um erro
    // vermelho: nada quebrou, o cobro ainda nao abriu.
    const r = await restaurar();
    setRestaurando(false);
    setAviso({
      paso: 'restaurar',
      texto: r && r.ok === true ? t('perfil.restaurar.ok') : t('ayuda.paso.restaurar.sinTienda'),
    });
  }, []);

  const abrirEnlace = useCallback(async (url, claveError, paso) => {
    try {
      await Linking.openURL(url);
      setAviso(null);
    } catch {
      setAviso({ paso, texto: t(claveError) });
    }
  }, []);

  const alRecargar = useCallback(() => {
    if (PUEDE_RECARGAR_AQUI) window.location.reload();
  }, []);

  const alBorrar = useCallback(async () => {
    setBorrando(true);
    // Promise.all e nao um for sequencial: sao tres chaves independentes e
    // nenhuma depende do resultado da outra. borrarSeguro nunca lanca — devolve
    // false quando ficou so na memoria da sessao, e a tela diz isso em vez de
    // mentir "listo".
    const resultados = await Promise.all(CLAVES_BORRABLES.map((clave) => borrarSeguro(clave)));
    const todoAlDisco = resultados.every((ok) => ok === true);
    setBorrando(false);
    setConfirmandoBorrado(false);
    setAviso({
      paso: 'borrar',
      texto: todoAlDisco ? t('ayuda.paso.borrar.hecho') : t('ayuda.paso.borrar.parcial'),
    });
  }, []);

  const alEscribir = useCallback(async () => {
    if (!categoria) return;
    const asunto = t('ayuda.escribir.asunto', { categoria: t(categoria.titulo) });
    const cuerpo = t('ayuda.correo.cuerpo', {
      diagnostico: diagnostico.map((l) => `${l.clave}: ${l.valor}`).join('\n'),
    });
    const url = `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
      cuerpo
    )}`;
    try {
      await Linking.openURL(url);
      setAviso(null);
    } catch {
      setAviso({ paso: 'escribir', texto: t('ayuda.escribir.error', { correo }) });
    }
  }, [categoria, correo, diagnostico]);

  /* --- render de um passo ------------------------------------------------------ */

  const renderAccion = (paso) => {
    if (paso.accion === 'restaurar') {
      return (
        <BotonPrimario
          titulo={t('ayuda.paso.restaurar.boton')}
          onPress={alRestaurar}
          cargando={restaurando}
          variante="fantasma"
          style={estilos.accion}
        />
      );
    }

    if (paso.accion === 'tienda') {
      return TIENDAS_VISIBLES.map((tienda) => (
        <BotonPrimario
          key={tienda.id}
          titulo={t(tienda.rotulo)}
          onPress={() => abrirEnlace(tienda.url, 'ayuda.paso.tienda.error', 'tienda')}
          variante="fantasma"
          style={estilos.accion}
        />
      ));
    }

    if (paso.accion === 'recargar') {
      return PUEDE_RECARGAR_AQUI ? (
        <BotonPrimario
          titulo={t('ayuda.paso.recargar.boton')}
          onPress={alRecargar}
          variante="fantasma"
          style={estilos.accion}
        />
      ) : null;
    }

    if (paso.accion === 'metodo') {
      return (
        <BotonPrimario
          titulo={t('ayuda.paso.metodo.boton')}
          onPress={() => irA(RUTAS.METODO)}
          variante="fantasma"
          style={estilos.accion}
        />
      );
    }

    if (paso.accion === 'borrar') {
      // Duas etapas na propria tela. O destrutivo nunca usa a variante solida:
      // hilo cheio e a cor da acao que a app QUER que a pessoa toque, e apagar
      // os proprios dados nao e isso — e um direito, nao uma recomendacao.
      if (!confirmandoBorrado) {
        return (
          <BotonPrimario
            titulo={t('ayuda.paso.borrar.boton')}
            onPress={() => setConfirmandoBorrado(true)}
            variante="fantasma"
            style={estilos.accion}
          />
        );
      }
      return (
        <View style={estilos.confirma}>
          <Micro style={estilos.confirmaTexto}>{t('ayuda.paso.borrar.confirma')}</Micro>
          <BotonPrimario
            titulo={t('ayuda.paso.borrar.si')}
            onPress={alBorrar}
            cargando={borrando}
            variante="fantasma"
            style={estilos.accion}
          />
          <BotonPrimario
            titulo={t('ayuda.paso.borrar.no')}
            onPress={() => setConfirmandoBorrado(false)}
            variante="fantasma"
            style={estilos.accion}
          />
        </View>
      );
    }

    return null;
  };

  const renderPaso = (id, indice) => {
    const paso = PASOS[id];
    if (!paso) return null;
    const mensaje = aviso && aviso.paso === paso.accion ? aviso.texto : null;

    return (
      <View key={id} style={estilos.paso}>
        <View style={estilos.pasoCabecera}>
          <Numero n={indice + 1} />
          <Cuerpo style={estilos.pasoTitulo}>{t(paso.titulo)}</Cuerpo>
        </View>
        <Micro style={estilos.pasoCuerpo}>{t(paso.cuerpo)}</Micro>
        {renderAccion(paso)}
        {mensaje ? <Micro style={estilos.mensaje}>{mensaje}</Micro> : null}
      </View>
    );
  };

  /* --- tela -------------------------------------------------------------------- */

  return (
    <View style={estilos.raiz}>
      <StatusBar barStyle="light-content" />
      <HiloFondo variante="quieto" />

      <SafeAreaView style={estilos.segura}>
        <ScrollView
          contentContainerStyle={estilos.scroll}
          keyboardShouldPersistTaps="handled"
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

          <Sobreceja style={estilos.sobreceja}>{t('ayuda.sobreceja')}</Sobreceja>
          <Titulo accessibilityRole="header">{t('ayuda.titulo')}</Titulo>
          <Cuerpo style={estilos.entrada}>{t('ayuda.entrada')}</Cuerpo>

          {/* --- as cinco categorias, acordeao de uma aberta por vez ------------- */}
          <View style={estilos.lista}>
            {CATEGORIAS.map((cat) => {
              const estaAbierta = cat.id === abierta;
              return (
                <View
                  key={cat.id}
                  style={[estilos.tarjeta, estaAbierta ? estilos.tarjetaAbierta : null]}
                >
                  <Pressable
                    onPress={() => alternar(cat.id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: estaAbierta }}
                    accessibilityLabel={`${t(cat.titulo)}. ${t(cat.sub)}`}
                    style={estilos.cabecera}
                  >
                    <View style={estilos.cabeceraTexto}>
                      <Cuerpo style={estilos.cabeceraTitulo}>{t(cat.titulo)}</Cuerpo>
                      <Micro>{t(cat.sub)}</Micro>
                    </View>
                    <Signo abierta={estaAbierta} />
                  </Pressable>

                  {estaAbierta ? (
                    <View style={estilos.cuerpoTarjeta}>
                      {cat.pasos.length > 0 ? (
                        <>
                          <Sobreceja style={estilos.pasosSobreceja}>
                            {t('ayuda.pasos.sobreceja')}
                          </Sobreceja>
                          {cat.pasos.map(renderPaso)}
                        </>
                      ) : (
                        <Micro>{t('ayuda.pasos.vacio')}</Micro>
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* --- escrever: so depois dos passos, e so com categoria escolhida ---- */}
          <View style={estilos.escribir}>
            <Sobreceja>{t('ayuda.escribir.sobreceja')}</Sobreceja>
            <Cuerpo style={estilos.escribirTitulo}>{t('ayuda.escribir.titulo')}</Cuerpo>
            <Micro style={estilos.escribirCuerpo}>{t('ayuda.escribir.cuerpo')}</Micro>

            {/* O payload inteiro, com os valores reais, ANTES de sair. */}
            <View style={estilos.diagnostico}>
              <Sobreceja style={estilos.diagnosticoTitulo}>
                {t('ayuda.diagnostico.titulo')}
              </Sobreceja>
              {diagnostico.map((linea) => (
                <View key={linea.clave} style={estilos.filaDiagnostico}>
                  <Micro style={estilos.filaClave}>{linea.clave}</Micro>
                  <Micro style={estilos.filaValor}>{linea.valor}</Micro>
                </View>
              ))}
              <Micro style={estilos.diagnosticoPie}>{t('ayuda.diagnostico.pie')}</Micro>
            </View>

            <BotonPrimario
              titulo={t('ayuda.escribir.boton')}
              onPress={alEscribir}
              habilitado={Boolean(categoria)}
              style={estilos.botonEscribir}
            />

            {categoria ? null : (
              <Micro style={estilos.mensaje}>{t('ayuda.escribir.falta')}</Micro>
            )}
            {aviso && aviso.paso === 'escribir' ? (
              <Micro style={estilos.mensaje}>{aviso.texto}</Micro>
            ) : null}

            <Micro style={estilos.directo}>{t('ayuda.escribir.directo', { correo })}</Micro>
          </View>

          <Micro style={estilos.pie}>{t('ayuda.pie')}</Micro>
          <Micro style={estilos.version}>{t('legal.version')}</Micro>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ===================================================================================
   ESTILOS — so geometria e tokens. Nenhum tamanho de fonte, nenhuma familia e
   nenhuma cor de texto: isso e trabalho de components/Texto.js e de theme.tipo.
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
  // A seta e um traco em hilo, nao um glifo: hilo como texto reprova AA.
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

  lista: {
    marginTop: espacio.xl,
  },
  tarjeta: {
    backgroundColor: colores.penumbra,
    borderRadius: radio.md,
    borderWidth: GROSOR,
    borderColor: colores.bordeSuave,
    marginBottom: espacio.md,
    overflow: 'hidden',
  },
  tarjetaAbierta: {
    borderColor: colores.bordeHilo,
  },

  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: espacio.lg,
    // Alvo de toque confortavel mesmo com o titulo em uma linha so.
    minHeight: 64,
  },
  cabeceraTexto: {
    flex: 1,
    paddingRight: espacio.md,
  },
  cabeceraTitulo: {
    marginBottom: espacio.xs,
  },

  signo: {
    width: espacio.lg,
    height: espacio.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signoBarra: {
    position: 'absolute',
    width: espacio.lg,
    height: GROSOR,
    backgroundColor: colores.hilo,
  },
  signoBarraVertical: {
    width: GROSOR,
    height: espacio.lg,
  },

  cuerpoTarjeta: {
    paddingHorizontal: espacio.lg,
    paddingBottom: espacio.lg,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
    paddingTop: espacio.lg,
  },
  pasosSobreceja: {
    marginBottom: espacio.md,
  },

  paso: {
    marginTop: espacio.lg,
  },
  pasoCabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // O numero alinha com a primeira linha do titulo ao lado: as duas usam
  // tipo.cuerpo, entao basta a mesma largura fixa e nenhuma margem vertical.
  numero: {
    width: espacio.xl,
    color: colores.aguja,
  },
  pasoTitulo: {
    flex: 1,
  },
  pasoCuerpo: {
    marginTop: espacio.sm,
    marginLeft: espacio.xl,
  },
  accion: {
    marginTop: espacio.md,
    marginLeft: espacio.xl,
  },
  mensaje: {
    marginTop: espacio.md,
  },

  confirma: {
    marginTop: espacio.md,
    marginLeft: espacio.xl,
    padding: espacio.lg,
    borderRadius: radio.sm,
    borderWidth: GROSOR,
    borderColor: colores.bordeHilo,
    backgroundColor: colores.noche,
  },
  confirmaTexto: {
    marginBottom: espacio.sm,
  },

  escribir: {
    marginTop: espacio.xxl,
    paddingTop: espacio.xl,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
  },
  escribirTitulo: {
    marginTop: espacio.sm,
  },
  escribirCuerpo: {
    marginTop: espacio.sm,
  },

  diagnostico: {
    marginTop: espacio.lg,
    padding: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
    borderWidth: GROSOR,
    borderColor: colores.bordeSuave,
  },
  diagnosticoTitulo: {
    marginBottom: espacio.md,
  },
  filaDiagnostico: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: espacio.xs,
  },
  filaClave: {
    flex: 1,
    paddingRight: espacio.md,
  },
  // O valor e o dado cru: papel, para que se leia sem esforco e a pessoa possa
  // conferi-lo contra o que chega no correio.
  filaValor: {
    flex: 1,
    color: colores.papel,
    textAlign: 'right',
  },
  diagnosticoPie: {
    marginTop: espacio.md,
    paddingTop: espacio.md,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
  },

  botonEscribir: {
    marginTop: espacio.lg,
  },
  directo: {
    marginTop: espacio.md,
  },

  pie: {
    marginTop: espacio.xxl,
  },
  version: {
    marginTop: espacio.sm,
    // So a opacidade muda: e a linha menos importante da tela, e rebaixar a cor
    // exigiria um token novo que nao existe (e nao deve existir) no theme.
    opacity: 0.7,
  },
});
