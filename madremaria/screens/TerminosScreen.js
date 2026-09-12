// screens/TerminosScreen.js
// "O que você aceita ao usar o app" — os termos de uso do Fio Vermelho.
//
// ===========================================================================
// CURTO DE PROPOSITO, E O QUE ESTA AQUI E O QUE TEM DE ESTAR
// ===========================================================================
// Termos longos nao protegem ninguem: ninguem le, e a loja tambem nao. O que a
// revisao de App Store e Google Play procura num app da categoria adivinhacao
// sao quatro coisas, e as quatro sao os quatro primeiros blocos desta tela:
//
//   1. QUE ES ESTO      — entretenimento e leitura simbolica. Nao e previsao,
//        nao e conselho profissional, nao e diagnostico e nao substitui apoio
//        de saude mental. Sem essa declaracao o app volta da revisao.
//   2. EDAD MINIMA      — 18. Dito com todas as letras, e dito junto com a
//        verdade incomoda. MUDOU EM 01/09: o app passou a perguntar a DATA DE
//        NASCIMENTO (P6 de datos/preguntas.js), e a copy dizia "a gente nao
//        pergunta a sua idade" — virou mentira no dia em que o campo entrou.
//        O que ela diz agora e o que acontece: a data e pedida, fica no
//        telefone, e NINGUEM verifica nada. O portao continua declarado e nao
//        verificado; escrever "verificamos a sua idade" seria a mentira maior,
//        porque nao ha para onde mandar a data e nao ha quem confira.
//   3. LO QUE NO PROMETE — nenhum resultado sobre o vinculo, e nenhuma carta le
//        a outra pessoa. E a regra 1 do contrato de produto virada para fora.
//   4. LA SUSCRIPCION   — renovacao automatica e cancelamento pela loja. Hoje
//        nao ha cobranca (ver lib/suscripcion.js, que e um stub honesto), e a
//        copy diz isso: "hoy no hay cobro" antes de descrever como sera.
//
// E ha um quinto bloco que nenhuma loja exige e que este produto exige de si
// mesmo: a linha de apoio humano. Ela e VISIVEL — nao esta escondida no fim,
// nao esta em corpo miudo, nao esta atras de um "ver mas" — e nao promete nada:
// nao diz que ajuda, nao diz que melhora, nao diz que resolve. Diz que uma
// carta nao acompanha ninguem e manda falar com uma pessoa. O app nao trata
// nada, e a unica coisa honesta a fazer e apontar para fora dele.
//
// O QUE ESTA TELA NAO TEM: aceite, checkbox, "acepto los términos", limitacao
// de responsabilidade em caixa alta de tres paragrafos, foro de eleicao. Nada
// disso e verdade sobre um app local sem conta e sem cobranca — e clausula
// copiada de modelo e exatamente o que faz uma revisao desconfiar do resto.
//
// Contrato de copy respeitado: nenhuma promessa de desfecho, nenhum genero
// assumido, nenhuma alegacao de saude, nenhum hex (regra 8) e colores.hilo so
// como TRACO, nunca como cor de texto (regra 9).

import { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import BotonPrimario from '../components/BotonPrimario';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { t } from '../datos/textos';
import { colores, espacio, radio } from '../theme';

/** Mesma largura de leitura da tela de privacidade: as duas sao o mesmo objeto. */
const ANCHO_LECTURA = 560;

const GROSOR = 1;

/** Bloco de secao: cabecalho + corpo. So layout, nenhuma copy propria. */
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

/**
 * @param {object} props
 * @param {object} [props.navigation] o objeto do React Navigation
 * @param {() => void} [props.onVolver] saida alternativa, para quando esta tela
 *        for aberta como folha dentro de outra em vez de empilhada.
 */
export default function TerminosScreen({ navigation, onVolver }) {
  const volver = useCallback(() => {
    if (typeof onVolver === 'function') return onVolver();
    if (navigation && typeof navigation.goBack === 'function') return navigation.goBack();
    return undefined;
  }, [navigation, onVolver]);

  return (
    <View style={estilos.pantalla} testID="pantalla-terminos">
      <HiloFondo variante="quieto" />

      <SafeAreaView style={estilos.segura}>
        <ScrollView
          style={estilos.scroll}
          contentContainerStyle={estilos.contenido}
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.columna}>
            <Sobreceja>{t('terminos.sobreceja')}</Sobreceja>
            <Titulo accessibilityRole="header" style={estilos.titulo}>
              {t('terminos.titulo')}
            </Titulo>
            <Cuerpo style={estilos.entrada}>{t('terminos.entrada')}</Cuerpo>

            <Seccion titulo={t('terminos.que.titulo')}>
              <Cuerpo>{t('terminos.que.cuerpo')}</Cuerpo>
            </Seccion>

            <Seccion titulo={t('terminos.edad.titulo')}>
              <Cuerpo>{t('terminos.edad.cuerpo')}</Cuerpo>
            </Seccion>

            <Seccion titulo={t('terminos.promesa.titulo')}>
              <Cuerpo>{t('terminos.promesa.cuerpo')}</Cuerpo>
            </Seccion>

            <Seccion titulo={t('terminos.suscripcion.titulo')}>
              <Cuerpo>{t('terminos.suscripcion.cuerpo')}</Cuerpo>
            </Seccion>

            <Seccion titulo={t('terminos.datos.titulo')}>
              <Cuerpo>{t('terminos.datos.cuerpo')}</Cuerpo>
            </Seccion>

            {/* A linha de apoio humano. Vai numa caixa com o risco do fio na
                lateral — o mesmo recurso de CajaLimites — para ter presenca
                visual sem precisar de cor de texto vermelha (regra 9) e sem
                virar um alerta que assusta. E o unico bloco desta tela que
                aponta para FORA do app, e por isso e o unico emoldurado. */}
            <View style={estilos.apoyo}>
              <View style={estilos.apoyoRisco} />
              <View style={estilos.apoyoTexto}>
                <Rotulo accessibilityRole="header" style={estilos.seccionTitulo}>
                  {t('terminos.apoyo.titulo')}
                </Rotulo>
                <Cuerpo>{t('terminos.apoyo.cuerpo')}</Cuerpo>
              </View>
            </View>

            <Seccion titulo={t('terminos.cambios.titulo')}>
              {/* O correio vive numa chave so (legal.correo) e entra aqui por
                  interpolacao: no dia em que a casilla mudar, muda em um lugar
                  e as duas telas de documento acompanham. */}
              <Cuerpo>{t('terminos.cambios.cuerpo', { correo: t('legal.correo') })}</Cuerpo>
              <Micro style={estilos.version}>{t('legal.version')}</Micro>
            </Seccion>
          </View>
        </ScrollView>

        {/* Fora do ScrollView: a saida nao pode depender de rolar ate o fim. */}
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

  apoyo: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: espacio.xxl,
    padding: espacio.lg,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
  },
  // O fio de pe: um traco vertical de 2px em hilo. Como TRACO e permitido —
  // como cor de texto daria 3,2:1 sobre noche e reprovaria AA.
  apoyoRisco: {
    width: 2,
    borderRadius: GROSOR,
    marginRight: espacio.lg,
    backgroundColor: colores.hilo,
  },
  apoyoTexto: {
    flex: 1,
  },

  version: {
    marginTop: espacio.lg,
  },

  pie: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.md,
    paddingBottom: espacio.lg,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
    backgroundColor: colores.noche,
  },
});
