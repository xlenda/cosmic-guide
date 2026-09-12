// screens/PrivacidadScreen.js
// "Tudo fica neste celular" — a politica de privacidade do Fio Vermelho.
//
// ===========================================================================
// ESTA TELA NAO E UM MODELO JURIDICO. E UMA DESCRICAO DO CODIGO.
// ===========================================================================
// Toda afirmacao daqui pode ser conferida abrindo o projeto, e e por isso que
// ela vale alguma coisa. O mapa da conferencia:
//
//   "todo se queda en este teléfono"  -> lib/almacen.js. Nao existe outro
//        caminho de escrita no app; e o unico modulo que fala com o disco.
//   "lo que se guarda"                -> as quatro chaves nuas que o app usa:
//        'perfil' (nome, data de nascimento, genero e as quatro respostas da historia), 'hilo' (dias, atual, recorde,
//        total), 'limite' (dia + contagem da leitura gratis) e 'suscripcion'
//        (a marca 'activa'). O prefixo 'hr.' e assunto do proprio almacen.js.
//   "o que se pede"                   -> datos/preguntas.js. Sao SETE perguntas
//        e so sete: nome, corte, cuando, hoy, intencion, nacimiento (P6) e
//        genero (P7). MUDOU EM 01/09: a data de nascimento passou a ser pedida
//        (o signo e a idade saem dela, por lib/signo.js), e as linhas desta tela
//        foram reescritas no mesmo commit. Continua sem hora de nascimento, sem
//        localizacao e sem NADA sobre a outra pessoa.
//   "no hay red"                      -> nao existe fetch(), XMLHttpRequest nem
//        SDK de rede em nenhum arquivo do projeto. A leitura e composta em
//        lib/lectura.js, local e deterministica.
//
// REGRA DE MANUTENCAO, e ela e a razao deste comentario existir: mexer em
// qualquer uma dessas quatro coisas obriga a mexer na copy correspondente de
// datos/textos.js NO MESMO COMMIT. Uma politica de privacidade que ficou para
// tras nao e um texto desatualizado — e uma declaracao falsa numa ficha de loja.
//
// O QUE ESTA TELA DELIBERADAMENTE NAO TEM:
//  · clausula sobre servidor, conta, login, cookie, transferencia internacional
//    ou "nuestros socios". Nada disso existe no v1, e escrever a clausula "por
//    precaucao" seria descrever um app que nao e este.
//  · aceite, checkbox ou botao de "entendi". Ler nao e um contrato; a unica
//    acao daqui e voltar.
//
// Contrato de copy respeitado: nenhuma promessa de desfecho, nenhum genero
// assumido, nenhuma prova social, nenhum hex (regra 8 — toda cor vem de
// theme.js) e colores.hilo so como TRACO, nunca como cor de texto (regra 9).

import { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import BotonPrimario from '../components/BotonPrimario';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { t } from '../datos/textos';
import { colores, espacio, radio, tipo } from '../theme';

/** Largura de leitura. Acima disto a linha fica longa demais e o olho se perde
 *  ao voltar para a esquerda — o texto centraliza e as bordas respiram. */
const ANCHO_LECTURA = 560;

/** Espessura do risco de cada item da lista. Mesmo 1px de CajaLimites. */
const GROSOR = 1;

/* t() de chave de array devolve o array; de chave morta devolve a propria chave
   (uma string), e string nao tem .map(). Preferimos uma linha errada visivel em
   QA a uma tela branca na politica de privacidade. */
function lineas(clave) {
  const valor = t(clave);
  return Array.isArray(valor) ? valor : [String(valor)];
}

/** Bloco de secao: cabecalho + conteudo. So layout, nenhuma copy propria. */
function Seccion({ titulo, children }) {
  return (
    <View style={estilos.seccion}>
      <Rotulo accessibilityRole="header" style={estilos.seccionTitulo}>
        {titulo}
      </Rotulo>
      {children}
    </View>
  );
}

/** Item de lista com o risco vermelho — a assinatura da marca dentro de texto
 *  corrido. O risco e uma View, e nao um bullet de texto: colores.hilo como
 *  glifo daria 3,2:1 sobre noche e reprovaria AA. */
function Item({ children }) {
  return (
    <View style={estilos.item}>
      <View style={estilos.risco} />
      <Cuerpo style={estilos.itemTexto}>{children}</Cuerpo>
    </View>
  );
}

/**
 * @param {object} props
 * @param {object} [props.navigation] o objeto do React Navigation
 * @param {() => void} [props.onVolver] saida alternativa, para quando esta tela
 *        for aberta como folha dentro de outra (o pe do paywall) em vez de
 *        empilhada. Sem nenhum dos dois, o botao existe e nao faz nada — o que
 *        e melhor do que estourar em runtime na tela que fala de confianca.
 */
export default function PrivacidadScreen({ navigation, onVolver }) {
  const volver = useCallback(() => {
    if (typeof onVolver === 'function') return onVolver();
    if (navigation && typeof navigation.goBack === 'function') return navigation.goBack();
    return undefined;
  }, [navigation, onVolver]);

  return (
    <View style={estilos.pantalla} testID="pantalla-privacidad">
      <HiloFondo variante="quieto" />

      <SafeAreaView style={estilos.segura}>
        <ScrollView
          style={estilos.scroll}
          contentContainerStyle={estilos.contenido}
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.columna}>
            <Sobreceja>{t('privacidad.sobreceja')}</Sobreceja>
            <Titulo accessibilityRole="header" style={estilos.titulo}>
              {t('privacidad.titulo')}
            </Titulo>
            <Cuerpo style={estilos.entrada}>{t('privacidad.entrada')}</Cuerpo>

            <Seccion titulo={t('privacidad.guarda.titulo')}>
              {lineas('privacidad.guarda.lineas').map((linea) => (
                <Item key={linea}>{linea}</Item>
              ))}
              <Micro style={estilos.pieSeccion}>{t('privacidad.guarda.pie')}</Micro>
              <Micro style={estilos.pieSeccion}>{t('privacidad.recordatorio')}</Micro>
            </Seccion>

            <Seccion titulo={t('privacidad.no.titulo')}>
              {lineas('privacidad.no.lineas').map((linea) => (
                <Item key={linea}>{linea}</Item>
              ))}
              <Micro style={estilos.pieSeccion}>{t('privacidad.no.pie')}</Micro>
            </Seccion>

            <Seccion titulo={t('privacidad.red.titulo')}>
              <Cuerpo>{t('privacidad.red.cuerpo')}</Cuerpo>
            </Seccion>

            <Seccion titulo={t('privacidad.borrar.titulo')}>
              <Cuerpo>{t('privacidad.borrar.cuerpo')}</Cuerpo>
            </Seccion>

            <Seccion titulo={t('privacidad.pago.titulo')}>
              <Cuerpo>{t('privacidad.pago.cuerpo')}</Cuerpo>
            </Seccion>

            {/* O fecho vai numa caixa em penumbra: e a unica linha da tela que
                fala do FUTURO do app, e separa-la evita que ela seja lida como
                mais uma das declaracoes sobre o presente. */}
            <View style={estilos.cierre}>
              <Cuerpo>{t('privacidad.cierre')}</Cuerpo>
              <Micro style={estilos.version}>{t('legal.version')}</Micro>
            </View>
          </View>
        </ScrollView>

        {/* O botao fica FORA do ScrollView: numa tela de documento longo, a saida
            nao pode depender de rolar ate o fim. */}
        <View style={estilos.pie}>
          <View style={estilos.columna}>
            <BotonPrimario
              titulo={t('comunes.volver')}
              variante="fantasma"
              onPress={volver}
            />
          </View>
        </View>
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
  scroll: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.xl,
    paddingBottom: espacio.xxl,
  },

  // A coluna de leitura: mesma largura no scroll e no pe, para que o botao
  // nasca alinhado com o texto e nao com a borda da tela.
  columna: {
    width: '100%',
    maxWidth: ANCHO_LECTURA,
    alignSelf: 'center',
  },

  titulo: {
    marginTop: espacio.sm,
  },
  entrada: {
    marginTop: espacio.lg,
  },

  seccion: {
    marginTop: espacio.xxl,
  },
  seccionTitulo: {
    marginBottom: espacio.md,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: espacio.sm,
  },
  // Alinha com a PRIMEIRA linha do texto ao lado: metade da entrelinha de
  // tipo.cuerpo (a que <Cuerpo> usa), menos metade da propria espessura. Ler o
  // token e o contrario de escrever um numero de fonte na mao.
  risco: {
    width: espacio.md,
    height: GROSOR,
    marginRight: espacio.md,
    marginTop: (tipo.cuerpo.entrelinea - GROSOR) / 2,
    backgroundColor: colores.hilo,
  },
  // flex:1 e o que faz a linha quebrar em vez de estourar para fora da tela.
  itemTexto: {
    flex: 1,
  },

  pieSeccion: {
    marginTop: espacio.lg,
  },

  cierre: {
    marginTop: espacio.xxl,
    padding: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
    borderWidth: GROSOR,
    borderColor: colores.bordeSuave,
  },
  version: {
    marginTop: espacio.md,
  },

  pie: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.md,
    paddingBottom: espacio.lg,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
    // Opaco de proposito: o texto que rola por baixo nao pode aparecer atras
    // do botao de saida.
    backgroundColor: colores.noche,
  },
});
