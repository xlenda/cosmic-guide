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

import ColunaLeitura from '../../components/ColunaLeitura';
import FaixaCurva from '../../components/FaixaCurva';
import BotonPrimario from '../components/BotonPrimario';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { t } from '../datos/textos';
import { space } from '../../theme';
import { colores, espacio, radio } from '../theme';

// A largura de leitura saiu daqui (12/09/2026), pelo mesmo motivo da tela de
// privacidade — as duas SAO o mesmo objeto e tem de continuar sendo: era
// `const ANCHO_LECTURA = 560`, um numero de pixels. Passou a ser
// components/ColunaLeitura.js, que calcula a largura em CARACTERES POR LINHA
// contra o tamanho do corpo. Se a fonte crescer, a coluna acompanha; 560 nao.

const GROSOR = 1;

/** Bloco de secao: cabecalho + corpo, dentro de uma FAIXA CURVA.
 *
 *  DIAGRAMACAO (12/09/2026). Identica a da tela de privacidade, e de proposito:
 *  as duas sao o MESMO objeto (um documento legal curto, seis blocos de um
 *  assunto cada) e ler diferente uma da outra seria o "app com duas caras".
 *  Antes cada secao era so um `marginTop` no mesmo fundo: seis assuntos
 *  distintos correndo sobre uma cor so. Agora cada secao tem CHAO PROPRIO e a
 *  borda de cima e uma onda — o olho le "mudou de assunto" antes do titulo.
 *
 *  A SEMENTE E O TITULO DA SECAO: cada faixa ganha uma onda diferente porque a
 *  semente muda. Duas faixas com a mesma semente desenhariam a mesma curva, e
 *  onda repetida e papel de parede.
 *
 *  `grude` sempre: as secoes sao empilhadas, e sem ele sobra uma meia-linha de
 *  antialias entre um preenchimento e o seguinte.
 *
 *  A COLUNA DE LEITURA ENTRA AQUI DENTRO, nunca em volta da faixa: a faixa
 *  precisa SANGRAR de ponta a ponta (ela e chao), enquanto o texto precisa
 *  ficar estreito (ele e leitura). Envolver a faixa na coluna faz o chao virar
 *  card gigante, que e o efeito que o dono recusou. */
function Seccion({ titulo, tom, children }) {
  return (
    <FaixaCurva tom={tom} semente={titulo} grude>
      <ColunaLeitura>
        <Rotulo accessibilityRole="header" style={estilos.seccionTitulo}>
          {titulo}
        </Rotulo>
        {children}
      </ColunaLeitura>
    </FaixaCurva>
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
          {/* A ABERTURA fica FORA de faixa, como na tela de privacidade: e a
              primeira dobra, e ela respira contra o fundo do app (com o fio
              vermelho atras) em vez de ganhar chao proprio. Faixa na abertura
              empurraria a onda pro topo da tela, onde ela briga com a curva do
              HiloFondo. */}
          <ColunaLeitura style={estilos.abertura}>
            <Sobreceja>{t('terminos.sobreceja')}</Sobreceja>
            <Titulo accessibilityRole="header" style={estilos.titulo}>
              {t('terminos.titulo')}
            </Titulo>
            <Cuerpo style={estilos.entrada}>{t('terminos.entrada')}</Cuerpo>
          </ColunaLeitura>

          {/* OS TONS ALTERNAM — e a alternancia que faz a paisagem: duas faixas
              seguidas do mesmo tom voltariam a ser um fundo so. A ordem e
              noite -> ameixa -> noite -> ameixa -> noite, e o VIOLETA fica
              guardado pro bloco de apoio humano, que e o unico que aponta pra
              FORA do app e o que mais precisa se destacar das vizinhas (na
              privacidade o violeta guarda o PAGAMENTO, pelo mesmo criterio:
              uma faixa violeta por tela, na secao que nao pode passar batida).
              Nenhum tom `rosa` nem `dourado`: esta e a tela do documento, nao
              a do ritual. */}
          <Seccion tom="noite" titulo={t('terminos.que.titulo')}>
            <Cuerpo>{t('terminos.que.cuerpo')}</Cuerpo>
          </Seccion>

          <Seccion tom="ameixa" titulo={t('terminos.edad.titulo')}>
            <Cuerpo>{t('terminos.edad.cuerpo')}</Cuerpo>
          </Seccion>

          <Seccion tom="noite" titulo={t('terminos.promesa.titulo')}>
            <Cuerpo>{t('terminos.promesa.cuerpo')}</Cuerpo>
          </Seccion>

          <Seccion tom="ameixa" titulo={t('terminos.suscripcion.titulo')}>
            <Cuerpo>{t('terminos.suscripcion.cuerpo')}</Cuerpo>
          </Seccion>

          <Seccion tom="noite" titulo={t('terminos.datos.titulo')}>
            <Cuerpo>{t('terminos.datos.cuerpo')}</Cuerpo>
          </Seccion>

          {/* A linha de apoio humano. A caixa com o risco do fio na lateral
              CONTINUA — o mesmo recurso de CajaLimites — para ter presenca
              visual sem precisar de cor de texto vermelha (regra 9) e sem
              virar um alerta que assusta. E o unico bloco desta tela que
              aponta para FORA do app, e por isso e o unico emoldurado.
              O QUE MUDOU (12/09/2026): a caixa passou a morar dentro de uma
              faixa `violeta`. NAO e decoracao em cima de decoracao — a caixa
              marca "isto e um aparte" e a faixa marca "mudou de assunto", que
              sao duas coisas diferentes, e este bloco e as duas ao mesmo tempo.
              A caixa sozinha ja nao dava conta: entre cinco secoes de chao
              igual, o unico aviso de que aqui a conversa sai do app era um
              retangulo um degrau mais claro. */}
          <FaixaCurva tom="violeta" semente="apoyo" grude>
            <ColunaLeitura>
              <View style={estilos.apoyo}>
                <View style={estilos.apoyoRisco} />
                <View style={estilos.apoyoTexto}>
                  <Rotulo accessibilityRole="header" style={estilos.seccionTitulo}>
                    {t('terminos.apoyo.titulo')}
                  </Rotulo>
                  <Cuerpo>{t('terminos.apoyo.cuerpo')}</Cuerpo>
                </View>
              </View>
            </ColunaLeitura>
          </FaixaCurva>

          <Seccion tom="ameixa" titulo={t('terminos.cambios.titulo')}>
            {/* O correio vive numa chave so (legal.correo) e entra aqui por
                interpolacao: no dia em que a casilla mudar, muda em um lugar
                e as duas telas de documento acompanham. */}
            <Cuerpo>{t('terminos.cambios.cuerpo', { correo: t('legal.correo') })}</Cuerpo>
            <Micro style={estilos.version}>{t('legal.version')}</Micro>
          </Seccion>
        </ScrollView>

        {/* Fora do ScrollView: a saida nao pode depender de rolar ate o fim. */}
        <View style={estilos.pie}>
          {/* A MESMA ColunaLeitura do texto: o botao nasce alinhado com o
              paragrafo e nao com a borda da tela. Era o que a `columna` local
              fazia — a peca faz igual, e com a largura calculada em CARACTERES
              (que acompanha a fonte) em vez de um 560 fixo. */}
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
  // SEM paddingHorizontal e SEM paddingTop (12/09/2026), igual a privacidade: as
  // faixas precisam SANGRAR de ponta a ponta pra serem chao e nao card. O recuo
  // lateral passou pra ColunaLeitura, que e onde ele deve morar — o texto ganha
  // gutter, o chao nao. O respiro de cima passou pra abertura, que o traz.
  contenido: {
    paddingBottom: espacio.xxl,
  },

  // A ABERTURA. `ar` (48) no topo: o silencio deliberado antes da primeira
  // palavra (antes era espacio.xl/24, o degrau de "blocos irmaos" — e abertura
  // e primeira secao nao sao irmas).
  //
  // EMBAIXO NAO LEVA NADA. Medido na foto da privacidade e valendo igual aqui: a
  // primeira faixa ja abre com `secao` (32) de padding proprio E com a altura da
  // onda em cima dele. Somar `ar` aqui abriria ~112px de nada entre o paragrafo
  // de abertura e o primeiro rotulo — buraco, nao respiro. Somar margem a uma
  // faixa e sempre somar duas vezes.
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
  // morreu junto — quem separa as secoes agora e a MUDANCA DE CHAO, e margem
  // entre duas faixas abriria um rasgo de fundo entre chaos que devem encostar.
  // SEM PADDING NA FAIXA (12/09/2026), e o motivo foi MEDIDO na foto: o `style`
  // de FaixaCurva vai pra View de FORA, que embrulha o SVG da onda mais o corpo
  // colorido. Padding vertical ali cria espaco TRANSPARENTE acima e abaixo do
  // preenchimento — 32+32 = 64px de fundo do app entre cada par de faixas,
  // fotografado na segunda dobra da tela de termos. Era o proprio "rasgo de
  // fundo entre duas faixas que devem encostar" que estes comentarios diziam
  // estar evitando; o `grude` (marginTop:-1) existe pra meia-linha de antialias
  // e nao fecha 64px.
  // O respiro nao se perdeu: components/FaixaCurva.js ja poe `space.secao` em
  // cima e embaixo no CORPO dela, por DENTRO do chao. Isto aqui era duplicata.
  seccionTitulo: {
    marginBottom: espacio.lg,
  },

  // SEM marginTop (12/09/2026): a caixa agora mora dentro da faixa `violeta`, e
  // o respiro de cima e o padding da propria faixa. O `xxl` que estava aqui
  // somava com ele e empurrava a caixa pro meio do chao violeta, deixando a
  // onda orfa la em cima.
  apoyo: {
    flexDirection: 'row',
    alignItems: 'stretch',
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
