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

import ColunaLeitura from '../../components/ColunaLeitura';
import FaixaCurva from '../../components/FaixaCurva';
import BotonPrimario from '../components/BotonPrimario';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { t } from '../datos/textos';
import { space } from '../../theme';
import { colores, espacio, radio, tipo } from '../theme';

// A largura de leitura saiu daqui (12/09/2026): era `const ANCHO_LECTURA = 560`,
// um numero de pixels. Passou a ser components/ColunaLeitura.js, que calcula a
// largura em CARACTERES POR LINHA contra o tamanho do corpo — se a fonte crescer,
// a coluna acompanha, e um valor em px nao acompanha.

/** Espessura do risco de cada item da lista. Mesmo 1px de CajaLimites. */
const GROSOR = 1;

/* t() de chave de array devolve o array; de chave morta devolve a propria chave
   (uma string), e string nao tem .map(). Preferimos uma linha errada visivel em
   QA a uma tela branca na politica de privacidade. */
function lineas(clave) {
  const valor = t(clave);
  return Array.isArray(valor) ? valor : [String(valor)];
}

/** Bloco de secao: cabecalho + conteudo, dentro de uma FAIXA CURVA.
 *
 *  DIAGRAMACAO (12/09/2026). Antes cada secao era so um `marginTop` no mesmo
 *  fundo: cinco assuntos diferentes correndo juntos sobre uma cor so, que e
 *  exatamente o defeito que o dono viu nos prints do concorrente ("parece
 *  lista"). Agora cada secao tem CHAO PROPRIO e a borda de cima e uma onda —
 *  o olho le "mudou de assunto" antes de ler o titulo.
 *
 *  A SEMENTE E O TITULO DA SECAO. Cada faixa recebe uma onda diferente porque
 *  a semente muda; duas faixas com a mesma semente desenhariam a mesma curva, e
 *  onda repetida vira papel de parede (o oposto do objetivo).
 *
 *  `grude` sempre: todas as secoes desta tela sao empilhadas, e sem ele fica
 *  uma meia-linha de antialias entre um preenchimento e o seguinte.
 *
 *  A COLUNA DE LEITURA ENTRA AQUI DENTRO, e nao em volta da faixa: a faixa
 *  precisa SANGRAR de ponta a ponta (chao), enquanto o texto precisa ficar
 *  estreito (leitura). Envolver a faixa na coluna faria o chao virar card. */
function Seccion({ titulo, tom, children }) {
  return (
    <FaixaCurva tom={tom} semente={titulo} grude style={estilos.seccion}>
      <ColunaLeitura>
        <Rotulo accessibilityRole="header" style={estilos.seccionTitulo}>
          {titulo}
        </Rotulo>
        {children}
      </ColunaLeitura>
    </FaixaCurva>
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
          {/* A ABERTURA fica FORA de faixa: e a primeira dobra, e ela respira
              contra o fundo do app (com o fio vermelho atras) em vez de ganhar
              um chao proprio. Faixa na abertura empurraria a onda pro topo da
              tela, onde ela briga com a curva do HiloFondo. */}
          <ColunaLeitura style={estilos.abertura}>
            <Sobreceja>{t('privacidad.sobreceja')}</Sobreceja>
            <Titulo accessibilityRole="header" style={estilos.titulo}>
              {t('privacidad.titulo')}
            </Titulo>
            <Cuerpo style={estilos.entrada}>{t('privacidad.entrada')}</Cuerpo>
          </ColunaLeitura>

          {/* OS TONS ALTERNAM, e e a alternancia que faz a paisagem: duas
              faixas seguidas do mesmo tom voltariam a ser um fundo so. A ordem
              e noite -> ameixa -> noite -> ameixa -> violeta, com o violeta
              guardado pro PAGAMENTO, que e a secao que mais precisa se destacar
              das vizinhas. Nenhum tom `rosa` nem `dourado` aqui: esta e a tela
              do documento, nao a do ritual. */}
          <Seccion tom="noite" titulo={t('privacidad.guarda.titulo')}>
            {lineas('privacidad.guarda.lineas').map((linea) => (
              <Item key={linea}>{linea}</Item>
            ))}
            <Micro style={estilos.pieSeccion}>{t('privacidad.guarda.pie')}</Micro>
            <Micro style={estilos.pieSeccion}>{t('privacidad.recordatorio')}</Micro>
          </Seccion>

          <Seccion tom="ameixa" titulo={t('privacidad.no.titulo')}>
            {lineas('privacidad.no.lineas').map((linea) => (
              <Item key={linea}>{linea}</Item>
            ))}
            <Micro style={estilos.pieSeccion}>{t('privacidad.no.pie')}</Micro>
          </Seccion>

          <Seccion tom="noite" titulo={t('privacidad.red.titulo')}>
            <Cuerpo>{t('privacidad.red.cuerpo')}</Cuerpo>
          </Seccion>

          <Seccion tom="ameixa" titulo={t('privacidad.borrar.titulo')}>
            <Cuerpo>{t('privacidad.borrar.cuerpo')}</Cuerpo>
          </Seccion>

          <Seccion tom="violeta" titulo={t('privacidad.pago.titulo')}>
            <Cuerpo>{t('privacidad.pago.cuerpo')}</Cuerpo>
          </Seccion>

          {/* O fecho vai numa caixa em penumbra: e a unica linha da tela que
              fala do FUTURO do app, e separa-la evita que ela seja lida como
              mais uma das declaracoes sobre o presente. Continua caixa e nao
              faixa de proposito: faixa e CHAO de secao, e o fecho nao e uma
              secao — e um aparte no fim do documento. */}
          <ColunaLeitura>
            <View style={estilos.cierre}>
              <Cuerpo>{t('privacidad.cierre')}</Cuerpo>
              <Micro style={estilos.version}>{t('legal.version')}</Micro>
            </View>
          </ColunaLeitura>
        </ScrollView>

        {/* O botao fica FORA do ScrollView: numa tela de documento longo, a saida
            nao pode depender de rolar ate o fim. */}
        <View style={estilos.pie}>
          {/* A MESMA ColunaLeitura do texto: o botao nasce alinhado com o
              paragrafo e nao com a borda da tela. Era o que a `columna` local
              fazia — a peca faz igual, e passa a valer a largura calculada em
              CARACTERES (que acompanha a fonte) em vez de um 560 fixo. */}
          <ColunaLeitura>
            <BotonPrimario
              titulo={t('comunes.volver')}
              variante="fantasma"
              onPress={volver}
            />
          </ColunaLeitura>
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
  // SEM paddingHorizontal (12/09/2026): as faixas precisam SANGRAR de ponta a
  // ponta pra serem chao e nao card. O recuo lateral passou a ser da
  // ColunaLeitura, que e onde ele deve morar — o texto ganha gutter, o chao
  // nao. Mesmo motivo do paddingTop: a abertura traz o proprio respiro.
  contenido: {
    paddingBottom: espacio.xxl,
  },

  // A ABERTURA. `ar` (48) no topo: o silencio deliberado antes da primeira
  // palavra (antes era espacio.xl/24, o degrau de "blocos irmaos" — e abertura
  // e primeira secao nao sao irmas).
  //
  // EMBAIXO NAO LEVA NADA, e isso foi MEDIDO na foto e nao decidido no papel: a
  // primeira faixa ja abre com `secao` (32) de padding proprio E com a altura
  // da onda em cima dele. Um `ar` aqui somava a tudo isso e abria ~112px de
  // nada entre o paragrafo de abertura e o primeiro rotulo — buraco, nao
  // respiro (o proprio theme.js avisa: "se aparecer tres vezes na mesma tela,
  // nao e mais respiro: e buraco"). O espaco que separa os dois ja e o da
  // faixa; somar margem a uma faixa e sempre somar duas vezes.
  abertura: {
    paddingTop: space.ar,
  },

  titulo: {
    marginTop: espacio.sm,
  },
  entrada: {
    marginTop: espacio.lg,
  },

  // O respiro DENTRO da faixa. A onda ocupa o topo da caixa, entao o conteudo
  // comeca abaixo dela: `secao` (32) em cima, e o mesmo embaixo pra faixa
  // seguinte nao encostar no ultimo paragrafo. O `marginTop` que existia aqui
  // morreu junto — a separacao entre secoes agora e a MUDANCA DE CHAO, e somar
  // margem a ela abriria um rasgo de fundo entre duas faixas que deviam
  // encostar.
  seccion: {
    paddingTop: space.secao,
    paddingBottom: space.secao,
  },
  seccionTitulo: {
    marginBottom: espacio.lg,
  },

  // `entre` (24) e nao `sm` (8): cada item aqui e um PARAGRAFO de duas a seis
  // linhas, nao uma linha de lista. Com 8px dois paragrafos de tres linhas
  // colam um no outro e viram um bloco so de texto — que e exatamente o que a
  // foto do "antes" mostra.
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: space.entre,
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
    marginTop: space.ar,
    marginBottom: space.entre,
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
