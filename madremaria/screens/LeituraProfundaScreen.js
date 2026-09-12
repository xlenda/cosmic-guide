// screens/LeituraProfundaScreen.js — O CARROSSEL DA LEITURA PROFUNDA.
//
// ===========================================================================
// ONDE ESTA TELA FICA NO FUNIL
// ===========================================================================
//   1. as cinco perguntas          (screens/OnboardingScreen.js)
//   2. as tres cartas com a voz    (screens/LeituraDeEntradaScreen.js)
//   3. ESTA TELA — cinco audios, um por card, 6,7 minutos ao todo
//   4. o paywall                   (screens/PaywallScreen.js) — desde 31/08
//   5. o app, com o plano de 365 dias em treze lunacoes
//
// O PASSO 4 E NOVO, e ele so existe por causa dos passos 2 e 3: quando o botao
// do ultimo card e tocado, ela ja recebeu uma leitura inteira de graca. O
// "Pular" NAO passa por ele — ver `terminar` e `sair`, mais abaixo. E fechar a
// oferta entra no app do mesmo jeito: o paywall nao e portao, e convite.
//
// Os cinco audios estao na MESMA voz das tres cartas, e o texto de cada um esta
// em datos/profunda.js. Eles nao repetem a leitura: eles explicam o que vem
// depois dela — por que o no nao se desfaz num dia, o que sao as treze luas, o
// que ela vai encontrar todo dia, e o convite.
//
// ===========================================================================
// A REGRA QUE FAZ O CARROSSEL FUNCIONAR: LER BASTA
// ===========================================================================
// O TEXTO INTEIRO de cada audio fica na tela, sempre visivel e rolavel, e ele diz
// exatamente o que a voz diz — palavra por palavra (datos/profunda.js explica de
// onde veio cada transcricao). Metade das pessoas abre isto no onibus, sem fone:
// quem le tudo nao perde nada, e por isso o audio pode ser um convite em vez de
// um pedagio.
//
// ===========================================================================
// O TEXTO ACOMPANHA A VOZ
// ===========================================================================
// Com o audio tocando, a frase que a voz esta dizendo fica acesa e o aparelho da
// um toquinho a cada frase nova. Tres arquivos, um papel cada:
//
//   datos/profunda-tempos.json   as frases com ini/fim medidos dos .m4a, POR
//                                AUDIO (o bloco 11 tem tres, um por genero)
//   hooks/useFraseAtual.js       le o player e diz QUAL frase, 8x por segundo
//   components/TextoNoRitmo.js   pinta, rola quando precisa, e vibra
//
// Esta tela so costura: pega o player que o BotaoOuvir passa pelo `onPlayer`,
// entrega ao hook, e da o indice ao componente.
//
// O QUE ISSO NAO E: nao e revelacao progressiva. As frases que ainda nao
// chegaram continuam na tela, legiveis, desde o primeiro frame — a regra "LER
// BASTA" logo acima nao foi afrouxada, e com a voz parada nao ha destaque
// nenhum. Quem le mais rapido que a voz le adiantado, como sempre pode.
//
// ===========================================================================
// O ULTIMO CARD FALA COM QUEM ESTA OUVINDO
// ===========================================================================
// O bloco 11 afirma quem ela passa a ser depois das treze luas, e ate 01/09 essa
// afirmacao dizia "uma mulher que sabe isso e outra mulher" para todo mundo —
// para um homem, a frase mais importante da leitura falava de outra pessoa.
//
// Agora sao tres audios e tres textos, um por genero respondido no onboarding
// (lib/genero.js le, datos/profunda.js guarda as tres versoes). So as duas
// frases do fecho mudam; o resto do bloco e o mesmo. Sem resposta, a versao
// neutra — que e uma leitura inteira, nao um caminho degradado.
//
// ISSO NAO E "ASSUMIR GENERO": o genero de quem esta do OUTRO LADO continua
// nunca sendo assumido nem coletado, e o portao de copy segue vigiando isso. O
// que muda aqui e o genero DELA, que ela respondeu.
//
// ===========================================================================
// AS QUATRO REGRAS DE AUDIO DESTA TELA
// ===========================================================================
//  · NUNCA toca sozinho, em nenhum card. A pessoa pode estar em qualquer lugar
//    quando abre — components/BotaoOuvir.js ja garante isso, e esta tela nao
//    inventa autoplay em cima dele.
//  · TROCAR DE CARD PARA O AUDIO ANTERIOR (`pararAudioAtual`). Duas vozes juntas
//    nao e leitura, e barulho. A trava de "um por vez" do BotaoOuvir cobre dois
//    botoes; ela nao cobre o dedo deslizando, e este e o caso que so acontece
//    aqui.
//  · O botao de ouvir e o destaque do card, logo abaixo do titulo — antes do
//    texto, para que quem tem fone nao precise rolar para achar a voz.
//  · Sem arquivo de audio o botao simplesmente nao existe, e a nota sobre ele
//    tambem nao: nota sobre um botao que nao esta na tela e ruido.
//
// ===========================================================================
// O "PULAR" NAO E FRAQUEZA — E O NUMERO
// ===========================================================================
// Sao 6,7 minutos entre a leitura que a trouxe e a primeira tela do produto, e e
// ali que mais gente sai. A pessoa que fecha o app no minuto 2 nao ouviu o audio
// NEM viu o produto: perde-se as duas coisas. Por isso o "Pular" e visivel desde
// o primeiro card, quem pula entra no app direto, e a leitura profunda continua
// na lista do Perfil marcada como nao ouvida (screens/PerfilScreen.js le
// lib/profunda.js para isso).
//
// ===========================================================================
// A ANCORA DO ANO NAO NASCE E NAO SE REESCREVE AQUI
// ===========================================================================
// O dia 1 das treze luas ja foi ancorado na conclusao das tres cartas
// (lib/entrada.js, `marcarLeituraDeEntrada`), e la a gravacao so acontece na
// PRIMEIRA vez — quem reouve no mes 7 nao volta para a lunacao 1. Esta tela nao
// toca na chave 'ano' por nenhum caminho: nem ao entrar no app, nem ao pular,
// nem ao ser reaberta pelo Perfil. O unico disco que ela escreve e o progresso
// do carrossel, em lib/profunda.js (chave 'profunda', ja em CLAVES_HILO_ROJO).
//
// ===========================================================================
// CONTRATOS DE ARQUIVO (os mesmos das outras telas)
// ===========================================================================
//  · Toda string visivel sai de t() (datos/textos.js) ou de datos/profunda.js.
//  · Nenhum hex e nenhum rgba: toda cor vem de theme.js (regra 8).
//  · colores.hilo so como traco e borda, nunca como cor de texto (regra 9).
//  · Toda tipografia vem dos wrappers de components/Texto.js.
//  · Nenhum Alert.alert: no react-native-web ele e no-op silencioso.
//  · props.navigation e OPCIONAL: sem ele a tela desenha inteira (screenshot de
//    loja) e nada quebra.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import BotaoOuvir, { pararAudioAtual } from '../components/BotaoOuvir';
import BotonPrimario from '../components/BotonPrimario';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, NombreCarta, Sobreceja, Titulo } from '../components/Texto';
import TextoNoRitmo from '../components/TextoNoRitmo';
import { TOTAL_PROFUNDA, blocosDaVariante, duracaoDe, trechosDe } from '../datos/profunda';
import { varianteGravada } from '../lib/variante';
import { t } from '../datos/textos';
import useFraseAtual from '../hooks/useFraseAtual';
import { temAudio } from '../lib/audios';
import { GENERO_PADRAO, lerGenero } from '../lib/genero';
import { marcarCardVisto, marcarFimDaProfunda, marcarOuvido } from '../lib/profunda';
import { proximaLuaNova } from '../lib/proximaLua';
import { NOMBRE_ABAS } from '../navegacion';
import { RUTAS } from '../routes';
import { colores, espacio, radio } from '../theme';

const enDesarrollo = typeof __DEV__ !== 'undefined' && __DEV__;

/* ===================================================================================
   UM CARD
   Recebe a largura MEDIDA do palco, nunca uma constante: '100%' dentro de um
   ScrollView horizontal vira a largura do CONTEUDO (que cresce com os cinco
   cards), e o resultado sao cinco cards espremidos lado a lado na mesma tela.
   =================================================================================== */
function Card({ bloco, indice, largura, ativo, onOuvir, lua }) {
  // As frases do bloco, com a hora de cada uma (datos/profunda-tempos.json,
  // medido do .m4a). Sem tempo medido elas voltam a ser os paragrafos de sempre
  // e nada acende — o card continua inteiro.
  //
  // A chave e `bloco.audio`, nao `bloco.id`: o bloco 11 e um id so com tres
  // arquivos (o fecho muda com o genero dela), e cada arquivo tem os seus
  // proprios segundos. Com o id aqui, quem ouvisse a versao de homem veria o
  // texto acendendo nos tempos da versao de mulher — dois segundos fora, sem
  // erro nenhum no console.
  const trechos = useMemo(() => trechosDe(bloco.audio), [bloco.audio]);
  const duracao = useMemo(() => duracaoDe(bloco.audio), [bloco.audio]);

  /* O PLAYER. Ele nasce dentro do BotaoOuvir, no primeiro toque, e chega aqui
   * pelo `onPlayer`. E dele que sai o segundo em que a voz esta — nada mais
   * neste arquivo o toca: quem manda tocar, pausar e descartar continua sendo o
   * botao. */
  const [player, setPlayer] = useState(null);
  const guardarPlayer = useCallback((instancia) => setPlayer(instancia || null), []);

  /* O relogio so anda no card que esta na tela. Os cinco cards ficam montados
   * ao mesmo tempo (e um ScrollView horizontal, nao um FlatList): sem este
   * portao seriam cinco relogios lendo player para uma voz so. */
  const { indice: fraseAtual, tocando } = useFraseAtual(player, trechos, { ativo, duracao });

  /* A janela visivel do card, para TextoNoRitmo saber se a frase atual ainda da
   * para ler. Vai por REFERENCIA: o `onScroll` escreve direto no objeto e nao
   * dispara render nenhum. Com estado, cada evento de rolagem redesenharia as
   * treze frases para mostrar exatamente a mesma coisa. */
  const scrollRef = useRef(null);
  const janela = useRef({ y: 0, altura: 0 });

  const aoRolar = useCallback((evento) => {
    janela.current.y = evento?.nativeEvent?.contentOffset?.y || 0;
  }, []);

  const aoMedirJanela = useCallback((evento) => {
    janela.current.altura = evento?.nativeEvent?.layout?.height || 0;
  }, []);

  return (
    <View style={[estilos.card, { width: largura }]}>
      {/* O texto rola DENTRO do card. Sem isto, o texto mais longo (o bloco 9,
          que tem cinco paragrafos) ficaria cortado na dobra sem nenhum sinal de
          que ha mais coisa embaixo. */}
      <ScrollView
        ref={scrollRef}
        style={estilos.cardScroll}
        contentContainerStyle={estilos.cardConteudo}
        showsVerticalScrollIndicator={false}
        onScroll={aoRolar}
        onLayout={aoMedirJanela}
        scrollEventThrottle={32}
      >
        {/* O rotulo de posicao e discreto de proposito: ele orienta, nao cobra.
            Digitos tabulares para o "1 de 5" nao tremer ao virar "2 de 5". */}
        <Micro tabular style={estilos.posicao}>
          {t('profunda.posicao', { n: indice + 1, total: TOTAL_PROFUNDA })}
        </Micro>

        <Titulo style={estilos.titulo}>{bloco.titulo}</Titulo>

        {/* A VOZ, EM DESTAQUE, ANTES DO TEXTO. Quem tem fone toca aqui e le
            junto; quem nao tem rola e le tudo. */}
        {/* O rotulo vai explicito: o padrao do componente e "Ouvir a carta", que
            e verdade nas tres cartas da leitura de entrada e mentira aqui — nao
            ha carta nenhuma neste carrossel. */}
        <BotaoOuvir
          audioId={bloco.audio}
          onTocar={onOuvir}
          onPlayer={guardarPlayer}
          rotulo={t('profunda.ouvir')}
          rotuloPausar={t('profunda.pausar')}
          style={estilos.ouvir}
        />

        {temAudio(bloco.audio) && <Micro style={estilos.audioNota}>{t('profunda.audioNota')}</Micro>}

        {/* O TEXTO ACOMPANHANDO A VOZ. Com a voz parada (fraseAtual === -1) ele
            desenha o texto inteiro, sem destaque nenhum — a mesma pagina de
            antes. Nada e escondido em nenhum momento: ler basta continua sendo
            a regra do carrossel. */}
        <TextoNoRitmo
          trechos={trechos}
          indice={fraseAtual}
          tocando={tocando}
          scrollRef={scrollRef}
          janelaRef={janela}
          style={estilos.texto}
        />

        {/* --- A DATA QUE A VOZ MANDA OLHAR ------------------------------------
            O audio 11 diz, com todas as letras, "ela comeca na proxima lua nova,
            que ja tem dia e hora marcados no ceu — e voce esta vendo esses dois
            escritos aqui na tela, agora". Enquanto esta caixa nao existiu, a voz
            apontou para um lugar vazio: a divida esta registrada pelo nome no
            cabecalho de datos/profunda.js, e e ela que este bloco paga.

            Vem DEPOIS do texto de proposito: a frase da voz cai perto do fim de
            um bloco de seis paragrafos, e a essa altura o dedo ja rolou ate
            aqui.

            `lua` e null quando a efemeride nao pode ser medida, e ai nao se
            desenha nada — nem caixa vazia, nem data aproximada. O audio fica
            falando de uma data que a tela nao mostra, o que e ruim; mostrar uma
            data ERRADA e pior, e e conferivel por qualquer pessoa em cinco
            segundos. */}
        {lua ? (
          <View style={estilos.lua}>
            {/* Sobreceja e Cuerpo ficam nas cores do tema escuro (ceniza e
                papel): esta tela e noche, e nenhum wrapper precisa de cor
                explicita aqui — ao contrario do paywall, que nasce em papel. */}
            <Sobreceja>{t('lua.sobreceja')}</Sobreceja>
            <NombreCarta style={estilos.luaQuando}>{lua.quando}</NombreCarta>
            <Cuerpo style={estilos.luaNota}>{lua.nota}</Cuerpo>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

/* ===================================================================================
   A TELA
   =================================================================================== */
export default function LeituraProfundaScreen({ navigation }) {
  const [indice, setIndice] = useState(0);
  const [largura, setLargura] = useState(0);

  const scrollRef = useRef(null);
  const ultimo = TOTAL_PROFUNDA - 1;

  /* A LUA, MEDIDA UMA VEZ POR SESSAO. Fica aqui e nao dentro do Card para que o
   * ultimo card e o paywall que vem depois dele digam exatamente a mesma data:
   * duas medidas separadas so precisam divergir uma vez, na virada da lunacao,
   * para a tela se contradizer sozinha no unico assunto em que este app promete
   * medir. `null` quando nao ha efemeride — ver lib/proximaLua.js. */
  const lua = useMemo(() => proximaLuaNova(), []);

  /* --- O GENERO DELA, E SO O DELA -------------------------------------------
   * O fecho (bloco 11) afirma quem ela passa a ser depois das treze luas, e essa
   * afirmacao tem tres versoes — uma por genero respondido no onboarding. Nada
   * disto vale para quem esta do outro lado: aquela pessoa continua sendo "essa
   * pessoa" no produto inteiro, e o portao de copy segue vigiando isso.
   *
   * COMECA NO NEUTRO e nao em `null`: o disco responde um quadro ou dois depois
   * do primeiro render, e um estado vazio ali deixaria o primeiro frame sem
   * texto no card do fecho. O neutro e uma leitura inteira, entao o pior caso
   * visivel e o texto trocar uma vez, antes de qualquer dedo chegar no card 5.
   *
   * `montado` evita o setState depois de a tela sair — ela pode ser fechada
   * enquanto a leitura do disco ainda esta no ar. */
  const [genero, setGenero] = useState(GENERO_PADRAO);

  useEffect(() => {
    let montado = true;
    lerGenero().then((lido) => {
      if (montado) setGenero(lido);
    });
    return () => {
      montado = false;
    };
  }, []);

  /* Os cinco blocos JA no genero dela. Os quatro primeiros saem identicos —
   * `bloqueDe` so troca alguma coisa no 11 — e a identidade deles e estavel
   * porque as tres versoes do 11 sao instancias congeladas, montadas uma vez no
   * carregamento de datos/profunda.js. Sem isso, cada render devolveria cards
   * novos e o BotaoOuvir perderia o player no meio da voz. */
  /* A VARIANTE (08/09): a leitura profunda e a da tiragem que ela recebeu
   * — A ou B, mesma essencia, imagens proprias, MESMO final. Sem letra
   * gravada (ou disco mudo) e a A. */
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

  const blocos = useMemo(() => blocosDaVariante(variante), [variante]);

  /* --- A MEDIDA DO PALCO ---------------------------------------------------
   * Guardada so quando MUDA de verdade: o onLayout dispara em toda rotacao e em
   * todo redimensionamento da janela na web, e um setState com o mesmo numero
   * seria um render por evento sem nada para mostrar. */
  const medir = useCallback((evento) => {
    const w = Math.round(evento?.nativeEvent?.layout?.width || 0);
    setLargura((atual) => (w > 0 && w !== atual ? w : atual));
  }, []);

  /* --- TROCAR DE CARD PARA O AUDIO -----------------------------------------
   * E aqui, e nao no botao: a troca acontece tambem quando ela desliza com o
   * dedo, e nesse caminho nenhum botao e tocado. `marcarCardVisto` e disparado e
   * esquecido — o progresso e conveniencia do Perfil, nunca algo que segure a
   * tela. Ele nunca anda para tras (lib/profunda.js). */
  useEffect(() => {
    pararAudioAtual();
    marcarCardVisto(indice);
  }, [indice]);

  /* Enquanto o audio toca, a tela nao pode sumir por baixo dele: sair da arvore
   * com um player rodando e o defeito que faz desinstalar o app. O BotaoOuvir ja
   * descarta o proprio player no unmount; isto cobre o caso de a tela sair sem
   * que o botao daquele card tenha sido desmontado antes (troca de rota). */
  useEffect(() => () => pararAudioAtual(), []);

  const irPara = useCallback(
    (proximo) => {
      const alvo = Math.max(0, Math.min(ultimo, proximo));
      setIndice(alvo);
      if (largura > 0) {
        scrollRef.current?.scrollTo?.({ x: alvo * largura, y: 0, animated: true });
      }
    },
    [largura, ultimo]
  );

  /* O dedo mandou. Divide pela largura MEDIDA e arredonda: com paginacao ligada
   * o offset final e sempre um multiplo dela, e o arredondamento cobre o meio
   * pixel que a web devolve em telas com zoom. */
  const aoParar = useCallback(
    (evento) => {
      if (largura <= 0) return;
      const x = evento?.nativeEvent?.contentOffset?.x || 0;
      const alvo = Math.max(0, Math.min(ultimo, Math.round(x / largura)));
      setIndice((atual) => (atual === alvo ? atual : alvo));
    },
    [largura, ultimo]
  );

  const aoOuvir = useCallback(() => {
    // O bloco que esta na tela AGORA. Disparado e esquecido, como o card visto.
    const bloco = BLOQUES_PROFUNDA[indice];
    if (bloco) marcarOuvido(bloco.id);
  }, [indice]);

  /* ------------------------------------------------------------------------ *
   * A SAIDA: O APP
   * ------------------------------------------------------------------------ *
   * `fim` diz por qual porta ela saiu — o botao do ultimo card, ou o "Pular".
   * Os dois entram no app; a diferenca so existe para o Perfil poder dizer a
   * verdade sobre o que ficou pendente.
   *
   * O await e obrigatorio pelo mesmo motivo do fim da leitura de entrada: sem
   * ele, a corrida entre a gravacao e o fechamento do app decide o que a
   * proxima abertura vai mostrar.
   *
   * PARA ONDE: quando ha de onde voltar (ela abriu o carrossel pelo Perfil), a
   * saida e `goBack` — um `replace` dali empilharia um segundo navegador de abas
   * por cima do que ela ja estava usando. No caminho do funil nao ha volta, e ai
   * e `replace` para a rota HOSPEDEIRA das abas (NOMBRE_ABAS), com a aba dita em
   * voz alta. `replace(RUTAS.HILO)` daqui morreria EM SILENCIO: 'Hilo' e uma
   * <Tab.Screen> dentro de um navegador que nem esta montado ainda. Ler o
   * cabecalho de navegacion.js. */
  const sair = useCallback(
    async (fim) => {
      if (fim) await marcarFimDaProfunda();
      else await marcarCardVisto(indice);

      pararAudioAtual();

      if (typeof navigation?.canGoBack === 'function' && navigation.canGoBack()) {
        navigation.goBack();
        return;
      }
      if (typeof navigation?.replace === 'function') {
        navigation.replace(NOMBRE_ABAS, { screen: RUTAS.MAPA_ANO });
        return;
      }
      if (typeof navigation?.navigate === 'function') {
        navigation.navigate(NOMBRE_ABAS, { screen: RUTAS.MAPA_ANO });
        return;
      }
      if (enDesarrollo) {
        console.warn(
          '[LeituraProfundaScreen] Nao ha navigator montado: a leitura profunda terminou '
            + `e nao ha para onde ir. Registre a rota ${NOMBRE_ABAS} no Stack.`
        );
      }
    },
    [indice, navigation]
  );

  /* ------------------------------------------------------------------------ *
   * O FIM DO CARROSSEL: O PAYWALL, E DEPOIS O APP DE QUALQUER JEITO
   * ------------------------------------------------------------------------ *
   * O botao do ultimo card deixou de entrar direto no app: ele abre a oferta
   * (screens/PaywallScreen.js) e o app vem DEPOIS dela — assinando ou nao.
   *
   * POR QUE AQUI E NAO ANTES. Neste ponto ela ja recebeu a leitura inteira de
   * graca: tres cartas raspadas com voz e 6,7 minutos de leitura profunda. A
   * regra dura do nicho ("surpreender antes de pedir o cartao") ja foi cumprida
   * — e e so por isso que pedir aqui e defensavel. O "Pular" NAO passa por esta
   * porta de proposito: quem pula nao ouviu nada, e cobrar de quem nao recebeu e
   * exatamente o paywall de abertura que o dossie mede derrubando app.
   *
   * FECHAR A OFERTA ENTRA NO APP. Quem manda o paywall para as abas e o proprio
   * paywall, com { destino, reemplazar } — os dois parametros juntos, e nao so o
   * primeiro, porque `replace` la e o que impede o botao voltar do Android de
   * trazer a oferta de volta na cara de quem acabou de fecha-la. Prender a saida
   * por caminho torto continua sendo prender a saida.
   *
   * REOUVINDO PELO PERFIL (`canGoBack()`), nao ha paywall: ela ja e usuaria, ja
   * passou por esta tela uma vez e voltou aqui para ouvir a voz. Repetir a oferta
   * a cada reescuta e o comportamento que gera as 544 reclamacoes de assinatura
   * do dossie. Sai por onde entrou.
   *
   * `marcarFimDaProfunda` continua sendo o PRIMEIRO await pelo mesmo motivo de
   * `sair`: sem ele, a corrida entre a gravacao e o fechamento do app decide o
   * que o Perfil vai mostrar na proxima abertura. Ela terminou o carrossel — isso
   * e verdade antes de qualquer decisao de compra, e nao depende dela. */
  const terminar = useCallback(async () => {
    await marcarFimDaProfunda();

    pararAudioAtual();

    if (typeof navigation?.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    const paraOApp = { destino: NOMBRE_ABAS, reemplazar: true };
    if (typeof navigation?.replace === 'function') {
      navigation.replace(RUTAS.PAYWALL, paraOApp);
      return;
    }
    if (typeof navigation?.navigate === 'function') {
      navigation.navigate(RUTAS.PAYWALL, paraOApp);
      return;
    }
    if (enDesarrollo) {
      console.warn(
        '[LeituraProfundaScreen] Nao ha navigator montado: a leitura profunda terminou '
          + `e nao ha para onde ir. Registre as rotas ${RUTAS.PAYWALL} e ${NOMBRE_ABAS} no Stack.`
      );
    }
  }, [navigation]);

  const naUltima = indice >= ultimo;

  return (
    <View style={estilos.raiz}>
      {/* Irmao em posicao absoluta, nunca pai: HiloFondo ignora children. */}
      <HiloFondo variante="quieto" />

      <SafeAreaView style={estilos.seguro}>
        <View style={estilos.cabecalho}>
          <Sobreceja>{t('profunda.sobreceja')}</Sobreceja>
        </View>

        {/* O PALCO. O onLayout fica no PAI do ScrollView: medir o proprio
            ScrollView horizontal devolveria a largura do conteudo, nao a da
            tela. */}
        <View style={estilos.palco} onLayout={medir}>
          {largura > 0 ? (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={aoParar}
              /* O momentum nao dispara quando o dedo arrasta e solta parado (e
                 e o caso comum no trackpad da web): sem este segundo aviso, o
                 audio do card anterior continuaria tocando. */
              onScrollEndDrag={aoParar}
              scrollEventThrottle={16}
            >
              {blocos.map((bloco, i) => (
                <Card
                  key={bloco.id}
                  bloco={bloco}
                  indice={i}
                  largura={largura}
                  ativo={i === indice}
                  onOuvir={aoOuvir}
                  /* So o ULTIMO card recebe a lua: e o unico cujo audio manda
                     olhar a data na tela. Nos outros quatro a caixa seria um
                     marco de ceu solto no meio de um texto que nao o citou. */
                  lua={i === ultimo ? lua : null}
                />
              ))}
            </ScrollView>
          ) : null}
        </View>

        {/* --- O RODAPE ---------------------------------------------------
            Os dois botoes vivem FORA do carrossel de proposito: eles nao
            deslizam, entao o "Pular" nunca fica escondido no card seguinte e o
            avanco nao depende do gesto. O botao de avancar existe porque
            deslizar com o mouse nao funciona no react-native-web e porque
            leitor de tela nao desliza — sem ele, o carrossel seria alcancavel
            so por dedo. */}
        <View style={estilos.rodape}>
          <BotonPrimario
            titulo={naUltima ? t('profunda.entrar') : t('profunda.proximo')}
            onPress={naUltima ? terminar : () => irPara(indice + 1)}
          />

          {/* O "Pular" some no ultimo card, e so nele.
              Ate 31/08 o motivo era que os dois botoes iam para o mesmo lugar.
              Agora nao vao — o de cima abre o paywall e este entraria direto no
              app —, e o motivo passou a ser outro: no ultimo card ela ja ouviu
              tudo, entao nao ha mais o que pular. Duas portas para o app lado a
              lado, uma delas passando pela oferta e a outra desviando dela, e um
              teste A/B desenhado na cara da pessoa.
              ISSO NAO PRENDE A SAIDA: a tela seguinte tem o X no primeiro frame
              e fecha-lo entra no app do mesmo jeito (ver `terminar` acima e a
              regra 1 no cabecalho de screens/PaywallScreen.js). O que se perde e
              um toque, nao o direito de entrar. */}
          {naUltima ? null : (
            <BotonPrimario
              titulo={t('profunda.pular')}
              variante="fantasma"
              onPress={() => sair(false)}
              style={estilos.pular}
            />
          )}
        </View>
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

  cabecalho: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.xl,
  },

  // O palco fica com toda a altura que sobra entre o cabecalho e o rodape: sem
  // `flex: 1` o ScrollView horizontal vira altura-de-conteudo e o texto longo
  // empurra o rodape para fora da tela.
  palco: { flex: 1 },

  card: { flex: 1 },
  cardScroll: { flex: 1 },
  cardConteudo: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.lg,
    paddingBottom: espacio.xxl,
  },

  posicao: { marginBottom: espacio.sm },
  titulo: { marginBottom: espacio.lg },
  ouvir: { marginBottom: espacio.md },
  audioNota: {
    marginBottom: espacio.md,
    paddingLeft: espacio.lg,
    // O traco do fio a esquerda: colores.hilo como TRACO, nunca como cor de
    // texto (regra 9 do theme.js).
    borderLeftWidth: 2,
    borderLeftColor: colores.hilo,
  },
  texto: { marginTop: espacio.lg },

  /* --- a caixa da lua ------------------------------------------------------
   * Caixa com borda, e nao mais um paragrafo: o que esta aqui dentro nao e voz,
   * e MEDIDA — e a voz manda olhar para ela. Fundo `penumbra` como o rodape,
   * para o bloco se ler como parte da moldura do app e nao como continuacao do
   * texto que a voz esta dizendo. */
  lua: {
    marginTop: espacio.xl,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    borderRadius: radio.md,
    backgroundColor: colores.penumbra,
    padding: espacio.lg,
  },
  // A data no italico de display, em `aguja` — 8,3:1 sobre noche, e o mesmo tom
  // do numero de ContadorAnio, que e o outro lugar do app onde um dado medido e
  // o evento da tela. Nunca colores.hilo: regra 9 (hilo so como traco).
  luaQuando: {
    color: colores.aguja,
    marginTop: espacio.sm,
  },
  luaNota: { marginTop: espacio.md },

  rodape: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.lg,
    paddingBottom: espacio.xl,
    borderTopWidth: 1,
    borderTopColor: colores.bordeSuave,
    backgroundColor: colores.penumbra,
    borderTopLeftRadius: radio.xl,
    borderTopRightRadius: radio.xl,
  },
  pular: { marginTop: espacio.md },
});
