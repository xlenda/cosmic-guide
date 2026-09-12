// screens/ReouvirTresCartasScreen.js — AS TRES CARTAS, PARA REOUVIR.
//
// ===========================================================================
// POR QUE ESTA TELA EXISTE
// ===========================================================================
// A leitura de entrada acontece UMA VEZ NA VIDA (decisao do dono, 01/09), e
// screens/LeituraDeEntradaScreen.js explica no cabecalho por que a tranca do
// "uma vez" e o que sustenta a mesa dos seis versos: quem nunca refaz a leitura
// nunca tem duas para comparar.
//
// So que as pessoas VOLTAM nos audios — no funil de WhatsApp e o que segura a
// lead, e o Perfil sempre teve a linha "Ouvir de novo as tres cartas". Tirar a
// porta seria trancar a voz que faz o app inteiro funcionar; deixa-la apontando
// para a tela da escolha seria abrir a unica fresta pela qual a leitura se
// refaz. Entao a porta continua, e leva para CA: as tres cartas ja abertas, com
// o audio e o texto, e mais nada.
//
// ===========================================================================
// O QUE ESTA TELA NAO TEM, E ISSO E O PONTO
// ===========================================================================
//  · NAO tem a mesa dos seis versos. Nao ha o que escolher: ja foi escolhido.
//  · NAO tem raspadinha. As tres nascem abertas — raspar de novo o que ja foi
//    aberto seria encenar uma revelacao que ja aconteceu.
//  · NAO grava nada. Nem o marcador, nem a ancora do ano: `marcarLeituraDeEntrada`
//    nao e chamado aqui por caminho nenhum. (Mesmo se fosse, lib/entrada.js so
//    ancora na primeira vez — mas a defesa boa e nao chamar.)
//  · NAO manda para a leitura profunda. Quem chegou aqui veio do Perfil e volta
//    para o Perfil. A profunda tem a porta dela, na linha de baixo da mesma
//    lista.
//
// ===========================================================================
// O PORTAO AO CONTRARIO
// ===========================================================================
// screens/LeituraDeEntradaScreen.js expulsa quem JA fez. Esta tela expulsa quem
// AINDA NAO fez: sem isso, '/tres-cartas' digitado na barra de enderecos
// entregaria as tres cartas abertas, sem gesto, sem voz na ordem certa e sem
// ancorar o ano das treze luas — a leitura de entrada gasta e o funil orfao. As
// duas telas se mandam uma para a outra, e nenhuma das duas fica alcancavel na
// hora errada.
//
// ===========================================================================
// CONTRATOS DE ARQUIVO (os mesmos das outras telas)
// ===========================================================================
//  · Toda string visivel sai de t() (datos/textos.js) ou de datos/lenormand.js.
//  · Nenhum hex e nenhum rgba: toda cor vem de theme.js (regra 8).
//  · colores.hilo so como traco e borda, nunca como cor de texto (regra 9).
//  · Toda tipografia vem dos wrappers de components/Texto.js.
//  · props.navigation e OPCIONAL: sem ele a tela desenha inteira e nada quebra.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import BotaoOuvir, { pararAudioAtual } from '../components/BotaoOuvir';
import BotonPrimario from '../components/BotonPrimario';
import CartaHilo from '../components/CartaHilo';
import ColunaLeitura from '../../components/ColunaLeitura';
import FaixaCurva from '../../components/FaixaCurva';
import { space } from '../../theme';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, NombreCarta, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { tiragemDeEntrada } from '../datos/lenormand';
import { t } from '../datos/textos';
import { temAudio } from '../lib/audios';
import { jaFezLeituraDeEntrada } from '../lib/entrada';
import { varianteGravada } from '../lib/variante';
import { arteDaCartaCigana } from '../lib/imagenesLenormand';
import { NOMBRE_ABAS } from '../navegacion';
import { RUTAS } from '../routes';
import { colores, espacio } from '../theme';

const enDesarrollo = typeof __DEV__ !== 'undefined' && __DEV__;

const PORTAO = Object.freeze({
  CONSULTANDO: 'consultando',
  LIBERADA: 'liberada',
  TRANCADA: 'trancada',
});

export default function ReouvirTresCartasScreen({ navigation }) {
  /* As mesmas tres, na mesma ordem. `tirarTresLenormand()` nao sorteia — se um
   * dia sortear, esta tela deixa de ser "as suas tres cartas" e vira uma segunda
   * tiragem escondida na lista do Perfil. */
  /* A TIRAGEM DELA (08/09): a da variante sorteada na entrada — A ou B, com a
   * extra (e a estrela, na B). Sem letra gravada, a A: reouvir nunca sorteia. */
  const [variante, setVariante] = useState('a');
  useEffect(() => {
    let montado = true;
    varianteGravada().then((v) => {
      if (montado && v) setVariante(v);
    });
    return () => {
      montado = false;
    };
  }, []);
  const tiragem = useMemo(() => tiragemDeEntrada(variante), [variante]);

  const [portao, setPortao] = useState(PORTAO.CONSULTANDO);
  const vivoRef = useRef(true);
  const portaoRef = useRef(false);

  useEffect(() => {
    vivoRef.current = true;
    return () => {
      vivoRef.current = false;
      // Sair da tela com a voz falando deixaria o audio tocando por cima do
      // Perfil. A trava de "um por vez" do BotaoOuvir cobre dois botoes; ela nao
      // cobre a tela inteira sumindo.
      pararAudioAtual();
    };
  }, []);

  /* O PORTAO AO CONTRARIO (ver o cabecalho). Duvida vira TRANCADA aqui, e isso e
   * o oposto da disciplina da outra tela — de proposito: la o pior caso e ela
   * nunca receber a leitura; aqui o pior caso e ela receber a leitura pela porta
   * errada, sem voz na ordem e sem ancorar o ano. Na duvida, esta tela manda
   * para a leitura de entrada, que sabe decidir sozinha se ja aconteceu. */
  useEffect(() => {
    if (portaoRef.current) return undefined;
    portaoRef.current = true;
    let cancelado = false;

    const desviar = () => {
      setPortao(PORTAO.TRANCADA);
      if (typeof navigation?.replace === 'function') {
        navigation.replace(RUTAS.LEITURA_ENTRADA);
        return;
      }
      if (typeof navigation?.navigate === 'function') {
        navigation.navigate(RUTAS.LEITURA_ENTRADA);
        return;
      }
      if (enDesarrollo) {
        console.warn(
          '[ReouvirTresCartasScreen] Esta pessoa ainda nao fez a leitura de entrada e nao ha '
            + `navigator para leva-la ate ela. Registre ${RUTAS.LEITURA_ENTRADA} no Stack — `
            + 'a tela fica em branco de proposito, para nao gastar a leitura pela porta errada.'
        );
      }
    };

    jaFezLeituraDeEntrada()
      .then((feita) => {
        if (cancelado || !vivoRef.current) return;
        if (feita) setPortao(PORTAO.LIBERADA);
        else desviar();
      })
      .catch(() => {
        if (!cancelado && vivoRef.current) desviar();
      });

    return () => {
      cancelado = true;
    };
  }, [navigation]);

  /* A saida e sempre voltar: quem chegou aqui veio do Perfil. Sem pilha atras
   * (deep link direto) cai nas abas, que e onde o Perfil mora. */
  const sair = useCallback(() => {
    pararAudioAtual();
    if (typeof navigation?.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    if (typeof navigation?.replace === 'function') {
      navigation.replace(NOMBRE_ABAS);
      return;
    }
    if (typeof navigation?.navigate === 'function') navigation.navigate(NOMBRE_ABAS);
  }, [navigation]);

  if (portao !== PORTAO.LIBERADA) {
    return (
      <View style={estilos.raiz}>
        <HiloFondo variante="quieto" />
      </View>
    );
  }

  return (
    <View style={estilos.raiz}>
      <HiloFondo variante="quieto" />

      <SafeAreaView style={estilos.seguro}>
        <ScrollView contentContainerStyle={estilos.conteudo}>
          {/* A ABERTURA fora de faixa: primeira dobra, respira contra o fundo
              do app com o fio atras. */}
          <ColunaLeitura style={estilos.abertura}>
            <Sobreceja>{t('entrada.sobreceja')}</Sobreceja>
            <Titulo style={estilos.titulo}>{t('entrada.reouvir.titulo')}</Titulo>
            <Cuerpo style={estilos.paragrafo}>{t('entrada.reouvir.texto')}</Cuerpo>
          </ColunaLeitura>

          {/* AS TRES CARTAS, uma por FAIXA.
              O FIO RETO MORREU: cada bloco era `marginTop` + `borderTopWidth`,
              uma linha reta de 1px entre uma carta e a seguinte. Quem separa
              agora e a MUDANCA DE CHAO, e o guia e explicito — "nos prints,
              NENHUMA linha reta corta a tela".
              O tom alterna pelo INDICE (par noite, impar ameixa) e nao por nome
              fixo: a tiragem vem do motor e a tela nao decide quantas cartas
              sao. Assim nunca ha dois chaos iguais encostados.
              A SEMENTE E O ID DA CARTA: onda propria por carta, e a MESMA onda
              sempre que a mesma tiragem reabrir (a semente e deterministica —
              com Math.random a tela formigaria no scroll).
              `grude` a partir da segunda: a primeira encosta na abertura, que
              nao e faixa. */}
          {tiragem.map(({ carta, posicao }, indice) => (
            <FaixaCurva
              key={carta.id}
              tom={indice % 2 === 0 ? 'noite' : 'ameixa'}
              semente={carta.id}
              grude={indice > 0}
            >
              <ColunaLeitura>
              <Rotulo>{t(`entrada.posicao.${posicao}`)}</Rotulo>

              {/* `revelada` fixo em true: aqui nao se raspa. CartaHilo continua
                  sendo quem instancia a carta — o unico lugar autorizado —, e com
                  o veu ja removido nao ha gesto nenhum montado por baixo. */}
              <CartaHilo
                carta={{ id: carta.id, nombre: carta.nome }}
                arte={arteDaCartaCigana(carta.id)}
                sinOrientacion
                posicion={t(`entrada.posicao.${posicao}`)}
                revelada
                style={estilos.carta}
              />

              <View style={estilos.linhaNome}>
                <NombreCarta style={estilos.nome}>{carta.nome}</NombreCarta>
                <BotaoOuvir audioId={carta.audio} style={estilos.ouvir} />
              </View>

              {temAudio(carta.audio) && (
                <Micro style={estilos.audioNota}>{t('entrada.audioNota')}</Micro>
              )}

              {/* O TEXTO ESCRITO, SEMPRE — a mesma regra da leitura de entrada:
                  quem esta sem fone le tudo e nao perde nada.

                  O CONVITE NAO ENTRA AQUI. Ele e o passo que a carta pede, e ele
                  ja foi dado no dia da leitura; repeti-lo meses depois, fora do
                  contexto que a guarda de contato duro julgou naquele dia, seria
                  cobrar de novo uma acao que ela ja fez ou ja decidiu nao fazer. */}
              <Cuerpo style={estilos.paragrafo}>{carta.leitura}</Cuerpo>
              </ColunaLeitura>
            </FaixaCurva>
          ))}

          <ColunaLeitura style={estilos.fecho}>
            <BotonPrimario
              titulo={t('comunes.volver')}
              onPress={sair}
              variante="fantasma"
            />
          </ColunaLeitura>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  seguro: { flex: 1 },
  // SEM padding lateral (12/09/2026): as faixas precisam SANGRAR de ponta a
  // ponta pra serem chao e nao card. O recuo passou pra ColunaLeitura, bloco a
  // bloco, que e onde ele deve morar.
  conteudo: {
    paddingBottom: espacio.xxxl,
  },

  // `ar` (48) no topo: o silencio antes da primeira palavra. Embaixo nada — a
  // primeira faixa ja abre com `secao` de padding proprio mais a altura da
  // onda, e somar margem a uma faixa e sempre somar duas vezes.
  abertura: { paddingTop: space.ar },
  // `ar` tambem no fecho: a tela abre e fecha com a mesma respiracao.
  fecho: { paddingTop: space.ar },

  titulo: { marginTop: espacio.sm },
  paragrafo: { marginTop: espacio.lg },

  // `bloco` MORREU com o fio reto que ele desenhava. Ver o comentario da faixa,
  // no render.

  // Mesma proporcao 5:8 da leitura de entrada (as artes do baralho cigano).
  carta: {
    marginTop: espacio.lg,
    aspectRatio: 0.625,
  },

  linhaNome: {
    marginTop: espacio.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: espacio.md,
  },
  nome: { flexShrink: 1 },
  ouvir: { alignSelf: 'center' },
  audioNota: { marginTop: espacio.md },

});
