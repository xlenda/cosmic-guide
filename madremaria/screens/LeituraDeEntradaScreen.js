// screens/LeituraDeEntradaScreen.js — AS TRES CARTAS COM A VOZ DO DONO.
//
// ===========================================================================
// LEIA ISTO ANTES DE MEXER: O QUE ESTA TELA REALMENTE FAZ
// ===========================================================================
// A tela mostra SEIS versos iguais numa grade e pede que a usuaria toque em
// TRES. Ela sente que escolheu tres cartas. O que acontece por baixo e outra
// coisa, e esta escrito aqui em vez de na tela:
//
//   · AS TRES CARTAS SAO FIXAS. Sempre O Coracao (lenormand-24), As Nuvens
//     (lenormand-06) e O Cavaleiro (lenormand-01), nessa ordem — e
//     tirarTresLenormand() nao sorteia nada (datos/lenormand.js).
//
//   · A ESCOLHA DELA E DE POSICAO, NAO DE CARTA. O primeiro verso que ela tocar
//     abre O Coracao; o segundo, As Nuvens; o terceiro, O Cavaleiro. Qual dos
//     seis retangulos o dedo encostou nao muda absolutamente nada: muda so qual
//     celula da grade recebe a marca. `escolhidas` guarda INDICES DA GRADE em
//     ordem de toque, e a sequencia de cartas continua sendo tiragem[0..2],
//     exatamente a mesma de antes de existir grade nenhuma.
//
//   · A LEITURA ACONTECE UMA VEZ NA VIDA. Feita uma vez, esta tela nao volta:
//     nem pelo botao voltar do Android, nem por URL, nem pelo Perfil (ver a
//     TRANCA, mais abaixo).
//
// ESSAS DUAS ULTIMAS COISAS ANDAM JUNTAS, E E DE PROPOSITO. Quem nunca refaz a
// leitura nunca tem duas para comparar — e e a comparacao, e so ela, que
// mostraria que os seis versos escondem sempre as mesmas tres cartas. Tire a
// tranca do "uma vez na vida" e a grade dos seis vira uma encenacao que a
// propria usuaria desmonta na segunda tentativa, sozinha, em dez segundos. Nao
// da para afrouxar uma sem afrouxar a outra: quem mexer numa tem de saber que
// esta mexendo nas duas.
//
// O QUE A TELA NAO ESCREVE: o mecanismo. Nem "a sua escolha e de posicao", nem
// "estas tres sao as mesmas para todo mundo" — ate 10/09 essa segunda frase
// ficava embaixo da grade ('entrada.fixas') e o dono a tirou, pelo mesmo motivo
// que a primeira nunca esteve la: explicar o truque no meio do momento nao deixa
// momento nenhum de pe. A honestidade fica no que a tela NAO promete: nenhuma
// linha daqui afirma sorteio, acaso ou cartas escolhidas para ela. A explicacao
// mora aqui, no codigo, para quem mantem o app.
//
// ===========================================================================
// ONDE ELA FICA NO FUNIL
// ===========================================================================
//   1. as cinco perguntas          (screens/OnboardingScreen.js)
//   2. ESTA TELA — seis versos, tres toques, tres cartas com a voz dele
//   3. o carrossel da leitura profunda (screens/LeituraProfundaScreen.js)
//   4. o app, com o plano de 365 dias em treze lunacoes
//
// No WhatsApp, o que faz a lead ficar sao tres audios de uns 28 segundos. Nao e
// o texto, nao e a arte: e a voz. Esta tela e aquele momento virado app, e por
// isso ela nao economiza em nada — a arte inteira, a voz, o texto escrito e o
// convite, um de cada vez, sem pular etapa.
//
// ===========================================================================
// A TRANCA: A LEITURA DE ENTRADA NAO SE REFAZ
// ===========================================================================
// Tres fechaduras, e nenhuma delas basta sozinha:
//
//  1. A ROTA INICIAL (App.js). Quem tem perfil e marcador abre direto nas abas.
//     Cobre a abertura normal do app, e so ela.
//
//  2. O REDIRECIONAMENTO DESTA TELA (`useEffect` do portao, mais abaixo). Quem
//     chegar aqui com a leitura ja feita — deep link '/leitura' digitado na
//     barra de enderecos, tela empilhada de uma sessao antiga, um navigate novo
//     que alguem escrever daqui a seis meses — sai por `replace` para as abas,
//     antes de qualquer carta aparecer. Enquanto o disco responde, a tela nao
//     desenha conteudo nenhum: mostrar a abertura e some-la meio segundo depois
//     seria pior do que esperar.
//
//  3. O PERFIL NAO APONTA MAIS PARA CA. A linha "Ouvir de novo as tres cartas"
//     leva a RUTAS.REOUVIR_ENTRADA (screens/ReouvirTresCartasScreen.js): as tres
//     cartas ja abertas, com audio e texto, sem grade e sem raspagem. As pessoas
//     voltam nos audios — essa porta tinha de continuar existindo —, mas ela nao
//     pode desembocar na escolha.
//
// E o botao voltar do Android? Nao ha o que interceptar: o onboarding entra aqui
// por `replace` e esta tela sai por `replace`, entao ela nunca fica na pilha
// atras de nada. Prender o back so criaria uma armadilha de onde nao se sai —
// e a fechadura 2 ja cobre o caso em que alguem, um dia, empilhar mesmo assim.
//
// ===========================================================================
// A RASPADINHA, E OS SEIS VERSOS
// ===========================================================================
// A carta aberta e desenhada por components/CartaHilo.js, que e o UNICO lugar do
// app autorizado a instanciar o ScratchRevealCard — la a dimensao e explicita, e
// sem dimensao explicita o onLayout mede 0x0 e a raspagem falha MUDA (o dedo
// passa e nada acontece, sem erro no console). Como a arte destas tres vem de
// outro baralho, CartaHilo ganhou a prop `arte` para receber o modulo ja
// resolvido de lib/imagenesLenormand.js.
//
// OS SEIS VERSOS DA GRADE NAO SAO SEIS RASPADINHAS. Sao `VersoDeCarta` — o mesmo
// metal, sem gesto —, reexportado por components/CartaHilo.js. Uma raspadinha
// ali traria junto a dica visivel ("Raspe para revelar") e o botao obrigatorio
// de "Revelar sem raspar": seis instrucoes erradas na tela, porque naquele
// momento o gesto e tocar, e seis botoes que abririam carta antes da hora. Quem
// escuta o dedo na grade e o Pressable da celula, e so ele.
//
// ===========================================================================
// AUDIO E RASPAGEM SAO O MESMO MOMENTO, E NENHUM SUBSTITUI O OUTRO
// ===========================================================================
// · O botao de ouvir nasce junto com o nome, assim que a carta e revelada.
//   Raspar e a mao; ouvir e a voz.
// · O audio NAO toca sozinho. A pessoa pode estar no onibus, no trabalho, ao
//   lado de alguem. O botao convida; ela decide. (components/BotaoOuvir.js ja
//   garante isso, e some sozinho quando a carta nao tem voz.)
// · O TEXTO ESCRITO APARECE SEMPRE, com ou sem audio tocado. Quem esta sem fone
//   le a leitura inteira e nao perde nada — 'entrada.audioNota' diz isso na tela.
//
// ===========================================================================
// O DESENCONTRO DO CAVALEIRO
// ===========================================================================
// O audio da terceira carta termina em "algo ira vir em sua direcao e voce
// precisa estar preparado". E previsao de futuro, que este produto nao faz e que
// test/copy-promessa-app-inteiro.test.js aborta. O campo `leitura` de datos/lenormand.js guarda a
// forca da carta (movimento, iniciativa) SEM a previsao, e o desencontro esta
// anotado la em `avisoDeAudio`.
//
// Esta tela mostra `leitura` e `convite`, e NUNCA `avisoDeAudio`: aquele campo e
// nota para quem mantem o app, nao texto de produto. E nenhuma linha daqui
// repete a frase do audio — repeti-la seria pegar a previsao que a gravacao
// deixou escapar e assina-la por escrito, que e pior do que deixa-la no audio.
//
// ===========================================================================
// CONTRATOS DE ARQUIVO (os mesmos das outras telas)
// ===========================================================================
//  · Toda string visivel sai de t() (datos/textos.js) ou de datos/lenormand.js.
//    Nenhuma palavra nasce dentro deste arquivo.
//  · Nenhum hex e nenhum rgba: toda cor vem de theme.js (regra 8).
//  · colores.hilo so como traco e borda, nunca como cor de texto (regra 9).
//  · Toda tipografia vem dos wrappers de components/Texto.js.
//  · Nenhum Alert.alert: no react-native-web ele e no-op silencioso.
//  · props.navigation e OPCIONAL: sem ele a tela desenha inteira (screenshot de
//    loja) e nada quebra.
//
// ===========================================================================
// O QUE ESTA TELA GRAVA, E SO ISSO
// ===========================================================================
// Duas chaves, as duas de lib/entrada.js, as duas no fim (ver `entrarNoApp`):
//
//  · 'leituraEntrada' — o marcador de "ja aconteceu", que e o que faz a TRANCA
//    la de cima existir. As duas chaves estao em CLAVES_HILO_ROJO de
//    screens/AjustesScreen.js: chave gravada que o "Apagar tudo" nao apaga
//    transforma a politica de privacidade da ficha de loja em declaracao falsa.
//
//  · 'ano' — a ANCORA DA JORNADA, o dia 1 do plano de 365 dias. E aqui que ela
//    nasce porque e aqui que a jornada comeca: lib/ano.js se recusa a numerar
//    lunacao sem esse instante, e a recusa e deliberada. A gravacao e um MERGE e
//    so acontece na primeira vez.
//
// ===========================================================================
// O QUE ESTA TELA NAO FAZ
// ===========================================================================
//  · Nao registra no fio, no album nem no limite diario. Nada disto e a leitura
//    do dia: e a porta de entrada, e cobrar a cota diaria de quem acabou de
//    chegar tiraria a tirada do taro no primeiro dia.
//  · Nao deixa desfazer um toque na grade. Nao e rigor por rigor: um "tirar a
//    escolha" convidaria a pessoa a procurar a carta certa entre os seis versos,
//    que e exatamente a busca que nao tem resposta.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import BotaoOuvir from '../components/BotaoOuvir';
import BotonPrimario from '../components/BotonPrimario';
import CartaHilo, { VersoDeCarta } from '../components/CartaHilo';
import ColunaLeitura from '../../components/ColunaLeitura';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, NombreCarta, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { CARTAS_NA_MESA, tiragemDeEntrada } from '../datos/lenormand';
import { esValida } from '../datos/preguntas';
import { t } from '../datos/textos';
import { leerSeguro } from '../lib/almacen';
import { temAudio } from '../lib/audios';
import { jaFezLeituraDeEntrada, marcarLeituraDeEntrada } from '../lib/entrada';
import { arteDaCartaCigana } from '../lib/imagenesLenormand';
import { esContactoDuro, guardaContacto } from '../lib/lectura';
import { varianteDaEntrada } from '../lib/variante';
import { NOMBRE_ABAS } from '../navegacion';
import { RUTAS } from '../routes';
import { colores, espacio, radio } from '../theme';

const enDesarrollo = typeof __DEV__ !== 'undefined' && __DEV__;

/* As duas chaves onde as respostas do onboarding podem estar, na ordem em que
 * valem. NUAS de proposito: o prefixo 'hr.' e assunto de lib/almacen.js, e
 * escrever 'hr.respuestas' aqui geraria 'hr.hr.respuestas' — a leitura voltaria
 * vazia para sempre, sem erro nenhum. Mesma lista de screens/TiradaScreen.js. */
const CLAVES_RESPUESTAS = ['respuestas', 'perfil'];

/* QUANTOS VERSOS A MESA MOSTRA. Seis, decisao do dono (01/09): o suficiente para
 * a mao ter para onde ir, e pouco o bastante para caber numa grade de 3x2 sem
 * virar rolagem. Nao ha seis cartas por tras — ha tres, e o comentario do topo
 * explica por que isso e assim e o que sustenta. */
const VERSOS_NA_MESA = 6;

/* O PASSO DA ABERTURA e o PASSO DA MESA. Numeros negativos de proposito: assim o
 * passo das cartas e o proprio indice do array, sem +1 nem -1 espalhados pela
 * tela, e o passo do fechamento e simplesmente `tiragem.length`. */
const PASSO_ABERTURA = -2;
const PASSO_MESA = -1;

/* O PORTAO. Enquanto o disco nao responde ninguem ve nada — nem a abertura, nem
 * a grade. Ver a fechadura 2 no cabecalho. */
const PORTAO = Object.freeze({
  CONSULTANDO: 'consultando',
  LIBERADA: 'liberada',
  TRANCADA: 'trancada',
});

/**
 * Aceita o objeto achatado ({ nombre, corte, ... }) e o embrulhado
 * ({ respuestas: { ... } }) — as duas formas que o disco ja tem gravadas.
 * Qualquer outra coisa vira null, e null e um estado valido aqui: sem respostas
 * a tela desenha inteira, so sem o nome e sem o filtro duro.
 */
function desembrulhar(valor) {
  if (!valor || typeof valor !== 'object') return null;
  const interno = valor.respuestas;
  if (interno && typeof interno === 'object') return interno;
  return valor;
}

/* O nome, saneado pela MESMA validacao do onboarding (datos/preguntas.js), para
 * nao existirem duas definicoes de "nome que serve" no projeto. As chaves sao
 * retiradas porque um nome com '{' quebraria a interpolacao de t(). */
function nomeLimpo(respuestas) {
  const cru = respuestas && respuestas.nombre;
  if (!esValida('nombre', cru)) return null;
  const limpo = String(cru).replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  return limpo || null;
}

/* ===================================================================================
   UMA CELULA DA MESA
   O verso e mudo (`VersoDeCarta` nasce com pointerEvents="none"): quem escuta o
   dedo e este Pressable. A marca de escolhida e o NUMERO da ordem em que ela
   tocou — algarismo nao se traduz e por isso nao mora em datos/textos.js, pela
   mesma razao do travessao de screens/PerfilScreen.js. O que o leitor de tela
   ouve, esse sim, sai inteiro de t().
   =================================================================================== */
function VersoDaMesa({ posicao, total, ordem, onEscolher, travada }) {
  const escolhida = ordem > 0;
  const etiqueta = escolhida
    ? t('entrada.escolha.versoEscolhido', { n: posicao, total, ordem })
    : t('entrada.escolha.verso', { n: posicao, total });

  return (
    <Pressable
      onPress={onEscolher}
      disabled={escolhida || travada}
      style={({ pressed }) => [
        estilos.celula,
        pressed && !escolhida && !travada && estilos.celulaTocada,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: escolhida || travada, selected: escolhida }}
    >
      <VersoDeCarta style={[estilos.verso, escolhida && estilos.versoEscolhido]} />
      {escolhida && (
        <View style={estilos.marca} pointerEvents="none">
          <Rotulo tabular accessible={false}>
            {String(ordem)}
          </Rotulo>
        </View>
      )}
    </Pressable>
  );
}

export default function LeituraDeEntradaScreen({ navigation, route }) {
  /* A TIRAGEM. useMemo com lista vazia: ela e fixa por contrato, mas recalcula-la
   * a cada render criaria objetos novos e faria o `key` das cartas mudar debaixo
   * do dedo de quem esta raspando. */
  /* A VARIANTE (lib/variante.js, 08/09): A ou B, sorteada UMA vez e gravada.
   * Enquanto o disco nao responde a tela fica no portao — nada e desenhado, e
   * a tiragem so passa a valer com a letra em maos. A e B tem tamanhos
   * diferentes (4 e 5 cartas): `total` e o da tiragem, e os toques na mesa
   * continuam sendo tres (CARTAS_NA_MESA) nas duas. */
  const [variante, setVariante] = useState(null);
  const tiragem = useMemo(() => tiragemDeEntrada(variante || 'a'), [variante]);
  const total = tiragem.length;

  const [portao, setPortao] = useState(PORTAO.CONSULTANDO);
  const [respuestas, setRespuestas] = useState(() => desembrulhar(route?.params?.respuestas));
  const [passo, setPasso] = useState(PASSO_ABERTURA);
  const [reveladas, setReveladas] = useState(() => Array(tiragem.length).fill(false));
  useEffect(() => {
    setReveladas(Array(tiragem.length).fill(false));
  }, [tiragem.length]);

  /* OS TOQUES DELA NA MESA: indices de CELULA, na ordem em que o dedo encostou.
   * O que sai deste array e so a marca na grade — a sequencia das cartas continua
   * sendo tiragem[0..2]. Ver o comentario do topo: a escolha e de posicao. */
  const [escolhidas, setEscolhidas] = useState([]);

  const scrollRef = useRef(null);
  const vivoRef = useRef(true);
  const portaoRef = useRef(false);

  useEffect(() => {
    vivoRef.current = true;
    return () => {
      vivoRef.current = false;
    };
  }, []);

  /* --- O PORTAO: quem ja fez a leitura nao entra ----------------------------
   * FECHADURA 2 da tranca (ver o cabecalho). Roda UMA vez por montagem — a
   * conclusao da propria leitura grava o marcador no fim, e sem o `portaoRef`
   * uma re-execucao expulsaria a pessoa da tela que ela acabou de terminar.
   *
   * Duvida vira LIBERADA, pela mesma disciplina de `jaFezLeituraDeEntrada`: o
   * pior caso de um falso "nao fez" e ela receber a leitura de novo; o pior caso
   * de um falso "ja fez" e ela nunca receber a leitura que o funil inteiro existe
   * para entregar.
   *
   * Sem navigator (screenshot de loja, teste de arvore) nao ha para onde mandar
   * ninguem — e ai a tela fica TRANCADA e desenha so o fundo, em vez de abrir a
   * escolha para quem ja escolheu. */
  useEffect(() => {
    if (portaoRef.current) return undefined;
    portaoRef.current = true;
    let cancelado = false;

    jaFezLeituraDeEntrada()
      .then((feita) => {
        if (cancelado || !vivoRef.current) return;
        if (!feita) {
          varianteDaEntrada()
            .then((v) => {
              if (cancelado || !vivoRef.current) return;
              setVariante(v);
              setPortao(PORTAO.LIBERADA);
            })
            .catch(() => {
              if (cancelado || !vivoRef.current) return;
              setVariante('a');
              setPortao(PORTAO.LIBERADA);
            });
          return;
        }
        setPortao(PORTAO.TRANCADA);
        if (typeof navigation?.replace === 'function') {
          navigation.replace(NOMBRE_ABAS);
          return;
        }
        if (typeof navigation?.navigate === 'function') {
          navigation.navigate(NOMBRE_ABAS);
          return;
        }
        if (enDesarrollo) {
          console.warn(
            '[LeituraDeEntradaScreen] A leitura de entrada ja foi feita e nao ha navigator '
              + `para sair daqui. A tela fica em branco de proposito: registre ${NOMBRE_ABAS} `
              + 'no Stack, ou a escolha das tres cartas volta a acontecer duas vezes.'
          );
        }
      })
      .catch(() => {
        if (!cancelado && vivoRef.current) {
          setVariante('a');
          setPortao(PORTAO.LIBERADA);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [navigation]);

  /* --- As respostas: parametro de rota primeiro, disco como rede ------------
   * O caminho normal e o parametro — o onboarding acabou de passar por aqui. O
   * disco cobre o reload na web e o deep link, onde o parametro nao existe (ele e
   * tirado da URL de proposito, ver o `linking` de App.js).
   *
   * Falhar em achar as respostas NAO impede a leitura: as tres cartas sao as
   * mesmas para todo mundo, e o que se perde e so o nome na abertura e o filtro
   * duro no convite. Uma tela de erro aqui seria trocar a leitura inteira por
   * nada. */
  useEffect(() => {
    if (respuestas) return undefined;
    let cancelado = false;

    (async () => {
      for (const clave of CLAVES_RESPUESTAS) {
        const cru = await leerSeguro(clave);
        if (cancelado || !vivoRef.current) return;
        let achado = null;
        try {
          achado = cru ? desembrulhar(JSON.parse(cru)) : null;
        } catch {
          // Espelho corrompido nao trava a leitura de entrada: segue sem nome.
          achado = null;
        }
        if (achado) {
          setRespuestas(achado);
          return;
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [respuestas]);

  const nome = useMemo(() => nomeLimpo(respuestas), [respuestas]);

  /* --- O ADAPTADOR DE DIALETO ----------------------------------------------
   * components/CartaHilo.js fala o dialeto do taro (datos/cartas.json), onde o
   * campo do nome se chama `nombre`. O baralho cigano usa `nome` — sao dois
   * arquivos escritos com meses de diferenca, e nenhum dos dois esta errado.
   *
   * Sem esta traducao a falha e MUDA e so aparece em quem usa leitor de tela:
   * CartaHilo cai no `nombre = ''`, a face revelada fica sem etiqueta e o anuncio
   * de "carta revelada" nao acontece. A tela desenha igual, e ninguem ve.
   *
   * Traduzir AQUI, e nao dentro do CartaHilo: aquele componente serve o taro, e
   * ensina-lo a adivinhar entre dois nomes de campo faria com que um erro de
   * digitacao futuro em qualquer dos dois baralhos passasse despercebido. */
  const veus = useMemo(
    () => tiragem.map(({ carta }) => ({ id: carta.id, nombre: carta.nome })),
    [tiragem]
  );

  /* --- OS CONVITES, JA PASSADOS PELA GUARDA --------------------------------
   * Quando P4 diz que o contato esta duro ('cero-contacto' ou
   * 'le-escribi-no-responde'), qualquer frase que empurre para procurar,
   * escrever ou aparecer e a pior frase possivel na tela. lib/plano.js faz a
   * mesma varredura pelo mesmo motivo, e a alternativa entra igual: o convite
   * NUNCA volta vazio, porque carta sem convite e carta pela metade.
   *
   * Um `livro` por carta, e nao um para as tres: cada carta e uma tela sozinha
   * aqui, e a regra de "a alternativa entra uma vez" vale dentro de uma tela. Um
   * livro compartilhado deixaria a segunda e a terceira sem convite nenhum.
   *
   * A `leitura` NAO passa pela guarda, do mesmo jeito que a lente `amor` do taro
   * nao passa: ela e a carta falando, vai verbatim, e ja e conferida pelo portao
   * de test/copy-promessa-app-inteiro.test.js. */
  const convites = useMemo(() => {
    const duro = esContactoDuro(respuestas);
    const alternativa = t('entrada.convite.alternativa');
    return tiragem.map(({ carta }) => {
      const original = typeof carta.convite === 'string' ? carta.convite : '';
      if (!duro || !original) return original;
      const passada = guardaContacto(original, alternativa, { usada: false });
      return passada.texto.trim() || alternativa;
    });
  }, [respuestas, tiragem]);

  /* Toda troca de passo volta ao topo: a carta nova tem de nascer no alto da
   * tela, e nao no meio, onde a pessoa terminou de ler a anterior. */
  useEffect(() => {
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  }, [passo]);

  const revelar = useCallback((indice) => {
    setReveladas((anteriores) => {
      if (anteriores[indice]) return anteriores;
      const proximas = anteriores.slice();
      proximas[indice] = true;
      return proximas;
    });
  }, []);

  const avancar = useCallback(() => {
    setPasso((atual) => (atual >= total ? atual : atual + 1));
  }, [total]);

  /* O TOQUE NA MESA. Guarda o indice da CELULA, e so isso — a carta que vai abrir
   * nao depende dele. As duas travas (ja escolhida, ja completou) tambem estao no
   * `disabled` do Pressable; ficam repetidas aqui porque um toque duplo rapido
   * pode chegar antes do render que desabilita o botao. */
  const tocarNaMesa = useCallback(
    (celula) => {
      setEscolhidas((anteriores) => {
        if (anteriores.length >= CARTAS_NA_MESA) return anteriores;
        if (anteriores.includes(celula)) return anteriores;
        return [...anteriores, celula];
      });
    },
    []
  );

  /* ------------------------------------------------------------------------ *
   * A SAIDA: A LEITURA PROFUNDA
   * ------------------------------------------------------------------------ *
   * DOIS EFEITOS, NESTA ORDEM, e o primeiro nao pode ser pulado:
   *
   * 1. lib/entrada.js marca que a leitura aconteceu e ANCORA O DIA 1 do ano das
   *    treze luas. E esse marcador que tranca esta tela para sempre (fechaduras
   *    1 e 2 do cabecalho). O await e obrigatorio — sem ele a pessoa entra no
   *    app, fecha, reabre, e a corrida entre a gravacao e o fechamento decide se
   *    ela recebe a leitura de entrada outra vez.
   *
   * 2. A navegacao, sempre por `replace` e sempre para o carrossel.
   *
   * SEMPRE `replace`, E SEM `goBack`. Havia aqui um caminho de volta, para quem
   * tinha aberto a leitura pelo Perfil so para reouvir os audios. Esse caminho
   * deixou de existir: o Perfil leva a RUTAS.REOUVIR_ENTRADA, que e leitura sem
   * escolha. Manter o `goBack` seria manter viva a unica rota pela qual alguem
   * chegava aqui uma segunda vez.
   *
   * PARA ONDE: o carrossel de cinco audios (screens/LeituraProfundaScreen.js),
   * que e o passo 3 do funil e quem entrega o app de verdade. Quem entra no app
   * sem ele recebe um plano de 365 dias sem nunca ter ouvido por que ele dura um
   * ano. Quem fecha o app no meio do carrossel volta direto para as abas na
   * proxima abertura — o marcador acima ja foi gravado, e reouvir e uma escolha
   * dela pelo Perfil, nunca um pedagio cobrado outra vez.
   *
   * ESTA TELA NAO CONHECE O CAMINHO DAS ABAS PARA O FIM DA LEITURA, e isso e de
   * proposito: quem entrega o app e o carrossel, e ter dois lugares mandando para
   * as abas seria ter duas verdades sobre onde o funil termina. (O portao la em
   * cima manda para as abas, sim — mas aquilo e expulsao, nao e o fim do funil.)
   * Se a rota do carrossel sumir do Stack, o React Navigation nao lanca — so
   * avisa em __DEV__ —, e e por isso que test/madremaria-profunda.test.js exige o registro
   * dela em App.js. */
  const entrarNoApp = useCallback(async () => {
    await marcarLeituraDeEntrada();

    if (typeof navigation?.replace === 'function') {
      navigation.replace(RUTAS.LEITURA_PROFUNDA);
      return;
    }
    if (typeof navigation?.navigate === 'function') {
      navigation.navigate(RUTAS.LEITURA_PROFUNDA);
      return;
    }
    if (enDesarrollo) {
      console.warn(
        '[LeituraDeEntradaScreen] Nao ha navigator montado: a leitura de entrada terminou '
          + `e nao ha para onde ir. Registre a rota ${RUTAS.LEITURA_PROFUNDA} no Stack — e `
          + `ela precisa levar as abas (${NOMBRE_ABAS}) quando terminar.`
      );
    }
  }, [navigation]);

  /* ---------------------------------------------------------------------- *
   * O PORTAO AINDA NAO RESPONDEU, OU RESPONDEU QUE NAO
   * ---------------------------------------------------------------------- *
   * So o fundo. Nada de texto, nada de spinner: sao alguns milissegundos de
   * leitura de disco, e uma frase que aparece e some e pior do que o silencio. */
  if (portao !== PORTAO.LIBERADA) {
    return (
      <View style={estilos.raiz}>
        <HiloFondo variante="quieto" />
      </View>
    );
  }

  /* ---------------------------------------------------------------------- *
   * ABERTURA — o nome dela, e o que vai acontecer agora
   * ---------------------------------------------------------------------- */
  if (passo === PASSO_ABERTURA) {
    return (
      <View style={estilos.raiz}>
        {/* Irmao em posicao absoluta, nunca pai: HiloFondo ignora children. */}
        <HiloFondo variante="quieto" />

        <SafeAreaView style={estilos.seguro}>
          <ScrollView ref={scrollRef} contentContainerStyle={estilos.conteudo}>
            <ColunaLeitura>
            <Sobreceja>{t('entrada.sobreceja')}</Sobreceja>
            <Titulo style={estilos.titulo}>{t('entrada.titulo')}</Titulo>

            {/* A MADRE MARIA VOLTA (09/09): ela ja se apresentou na primeira
                tela do funil (ApresentacaoScreen); aqui e "sou eu de novo".
                Voz se houver arquivo; o texto fica sempre. */}
            <BotaoOuvir
              audioId="entrada-apresentacao"
              rotulo={t('entrada.anuncio.ouvir')}
              style={estilos.ouvirAnuncio}
            />
            <Cuerpo style={estilos.paragrafo}>{t('entrada.apresentacao')}</Cuerpo>

            <Cuerpo style={estilos.paragrafo}>
              {nome ? t('entrada.saudacao', { nombre: nome }) : t('entrada.saudacaoSemNome')}
            </Cuerpo>
            <Cuerpo style={estilos.paragrafo}>{t('entrada.abertura')}</Cuerpo>

            {/* O rotulo diz para onde vai DE VERDADE: a mesa, e nao a primeira
                carta. 'entrada.comecar' volta a ser verdade depois do terceiro
                toque, e e la que ele aparece. */}
            <BotonPrimario
              titulo={t('entrada.escolha.abrir')}
              onPress={avancar}
              style={estilos.botao}
            />
            </ColunaLeitura>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  /* ---------------------------------------------------------------------- *
   * A MESA — seis versos, tres toques
   * ---------------------------------------------------------------------- *
   * O que ela escolhe e a POSICAO, nao a carta (cabecalho). A grade e de 3x2 e
   * as celulas sao iguais: nenhuma se destaca, porque nenhuma vale mais.
   * Nenhuma linha desta tela afirma sorteio — e o que impede a grade de ser uma
   * encenacao. A confissao que ficava aqui embaixo ('entrada.fixas') saiu em
   * 10/09 por decisao do dono. */
  if (passo === PASSO_MESA) {
    const completou = escolhidas.length >= CARTAS_NA_MESA;

    return (
      <View style={estilos.raiz}>
        <HiloFondo variante="tenso" />

        <SafeAreaView style={estilos.seguro}>
          <ScrollView ref={scrollRef} contentContainerStyle={estilos.conteudo}>
            <ColunaLeitura>
            <Sobreceja>{t('entrada.sobreceja')}</Sobreceja>
            <Titulo style={estilos.titulo}>{t('entrada.escolha.titulo')}</Titulo>

            <Cuerpo style={estilos.paragrafo}>{t('entrada.escolha.texto')}</Cuerpo>

            <Micro tabular style={estilos.progresso}>
              {t('entrada.escolha.contagem', { n: escolhidas.length, total: CARTAS_NA_MESA })}
            </Micro>

            <View style={estilos.mesa}>
              {Array.from({ length: VERSOS_NA_MESA }, (_, celula) => (
                <VersoDaMesa
                  key={celula}
                  posicao={celula + 1}
                  total={VERSOS_NA_MESA}
                  ordem={escolhidas.indexOf(celula) + 1}
                  travada={completou}
                  onEscolher={() => tocarNaMesa(celula)}
                />
              ))}
            </View>

            {/* O botao nasce com o terceiro toque. Antes disso nao ha o que
                confirmar, e um botao apagado so apressaria o gesto. */}
            {completou && (
              <BotonPrimario
                titulo={t('entrada.comecar')}
                onPress={avancar}
                style={estilos.botao}
              />
            )}
            </ColunaLeitura>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  /* ---------------------------------------------------------------------- *
   * FECHAMENTO — a passagem para o carrossel
   * ---------------------------------------------------------------------- */
  if (passo >= total) {
    return (
      <View style={estilos.raiz}>
        <HiloFondo variante="quieto" />

        <SafeAreaView style={estilos.seguro}>
          <ScrollView ref={scrollRef} contentContainerStyle={estilos.conteudo}>
            <ColunaLeitura>
            <Sobreceja>{t('entrada.sobreceja')}</Sobreceja>
            <Titulo style={estilos.titulo}>{t('entrada.presenca.titulo')}</Titulo>

            {/* A PRESENCA (08/09): antes dos minutos longos da profunda, a voz
                pergunta se ela esta aqui — um "sim" explicito, UMA vez, sem
                relogio. O botao e o sim. */}
            <BotaoOuvir
              audioId="entrada-presenca"
              rotulo={t('entrada.anuncio.ouvir')}
              style={estilos.ouvirAnuncio}
            />
            <Cuerpo style={estilos.paragrafo}>{t('entrada.presenca.texto')}</Cuerpo>
            <Cuerpo style={estilos.paragrafo}>{t('entrada.fim.cartas')}</Cuerpo>
            <Cuerpo style={estilos.paragrafo}>{t('entrada.fim.ano')}</Cuerpo>

            <BotonPrimario
              titulo={t('entrada.presenca.botao')}
              onPress={entrarNoApp}
              style={estilos.botao}
            />
            </ColunaLeitura>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  /* ---------------------------------------------------------------------- *
   * UMA CARTA POR VEZ — nunca as tres juntas na tela
   * ---------------------------------------------------------------------- */

  const atual = tiragem[passo];

  // Cinto de seguranca: tirarTresLenormand() devolve tres por contrato, entao
  // isto nao e caminho — e a defesa contra um id renomeado em datos/lenormand.js.
  if (!atual || !atual.carta) {
    return (
      <View style={estilos.raiz}>
        <HiloFondo variante="quieto" />
        <SafeAreaView style={estilos.centrado}>
          <Cuerpo style={estilos.paragrafo}>{t('errores.generico')}</Cuerpo>
        </SafeAreaView>
      </View>
    );
  }

  const { carta } = atual;
  const papel = atual.papel || 'carta';
  /* A ESTRELA VIRA SOZINHA: o guia a vira por ela — nasce revelada, sem
   * raspar. Extra e as tres continuam pelo dedo. */
  const revelada = papel === 'estrela' || reveladas[passo] === true;
  const ultima = passo === total - 1;
  const rotuloPosicao = t(`entrada.posicao.${atual.posicao}`);

  return (
    <View style={estilos.raiz}>
      <HiloFondo variante="tenso" />

      <SafeAreaView style={estilos.seguro}>
        <ScrollView ref={scrollRef} contentContainerStyle={estilos.conteudo}>
          <ColunaLeitura>
          <Sobreceja>{t('entrada.sobreceja')}</Sobreceja>
          <Micro tabular style={estilos.progresso}>
            {t('entrada.progresso', { n: atual.posicao, total })}
          </Micro>

          <View style={estilos.posicao}>
            {/* O rotulo segue a VOZ ("a sua terceira e ultima"), e nao o numero
                da carta no baralho. Quem fala e a gravacao. */}
            <Rotulo>{rotuloPosicao}</Rotulo>
          </View>

          {/* O ANUNCIO da carta extra e da estrela (08/09): a voz do guia
              apresenta o que vem antes de a carta aparecer — "tem uma que
              ficou na mesa" / "essa eu virei por voce". Texto sempre, voz se
              houver arquivo (BotaoOuvir some sozinho sem ele). */}
          {papel !== 'carta' ? (
            <View style={estilos.anuncio}>
              <BotaoOuvir
                audioId={papel === 'extra' ? 'entrada-anuncio-extra' : 'entrada-anuncio-estrela'}
                rotulo={t('entrada.anuncio.ouvir')}
                style={estilos.ouvirAnuncio}
              />
              <Cuerpo style={estilos.paragrafo}>
                {t(papel === 'extra' ? 'entrada.extra.anuncio' : 'entrada.estrela.anuncio')}
              </Cuerpo>
            </View>
          ) : null}

          {/* A instrucao do gesto some quando ja nao ha o que raspar. */}
          {!revelada && <Micro style={estilos.instrucao}>{t('entrada.instrucao')}</Micro>}

          {/* key por passo: sem ela o React reaproveita a MESMA instancia da
              carta ao trocar de carta (mesmo lugar na arvore, componente
              memoizado) e a lamina ja raspada apareceria meio aberta na
              proxima. O resetKey e a segunda tranca da mesma porta.

              `arte` vem de lib/imagenesLenormand.js: este e o baralho cigano, e
              o mapa do taro nao conhece estes ids. `sinOrientacion` porque o
              Lenormand nao le carta invertida — anunciar "Em pé" no leitor de
              tela inventaria uma distincao que este baralho nao faz. */}
          <CartaHilo
            key={carta.id}
            carta={veus[passo]}
            arte={arteDaCartaCigana(carta.id)}
            sinOrientacion
            posicion={rotuloPosicao}
            revelada={revelada}
            onRevelar={() => revelar(passo)}
            resetKey={carta.id}
            style={estilos.carta}
          />

          {revelada && (
            <View style={estilos.revelado}>
              {/* O NOME E A VOZ, lado a lado: o botao de ouvir nasce junto com o
                  nome da carta. `flexWrap` porque nome longo com fonte grande do
                  sistema nao pode empurrar o botao para fora da tela. */}
              <View style={estilos.linhaNome}>
                <NombreCarta style={estilos.nome}>{carta.nome}</NombreCarta>
                <BotaoOuvir audioId={carta.audio} style={estilos.ouvir} />
              </View>

              {/* So quando existe voz de verdade para esta carta: sem audio o
                  BotaoOuvir nao renderiza, e uma nota sobre um botao que nao
                  esta na tela e ruido. */}
              {temAudio(carta.audio) && (
                <Micro style={estilos.audioNota}>{t('entrada.audioNota')}</Micro>
              )}

              {/* O TEXTO ESCRITO, SEMPRE. Com ou sem audio tocado. */}
              <Cuerpo style={estilos.paragrafo}>{carta.leitura}</Cuerpo>

              {convites[passo] ? (
                <View style={estilos.convite}>
                  <Sobreceja>{t('entrada.convite.rotulo')}</Sobreceja>
                  <Cuerpo style={estilos.conviteTexto}>{convites[passo]}</Cuerpo>
                </View>
              ) : null}

              {/* O botao nasce com a carta aberta: antes disso nao ha nada a
                  confirmar, e um botao apagado so serviria para apressar o
                  gesto que e o momento da tela. */}
              <BotonPrimario
                titulo={ultima ? t('entrada.fechar') : t('entrada.proxima')}
                onPress={avancar}
                style={estilos.botao}
              />
            </View>
          )}
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
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacio.xl,
  },
  // O RECUO LATERAL saiu daqui (12/09/2026) e virou ColunaLeitura, que traz o
  // mesmo gutter MAIS o limite de largura que esta tela nunca teve: sem ele, em
  // tablet e na web a linha atravessa a tela inteira e ninguem acha o comeco da
  // seguinte. A largura de la sai de CARACTERES POR LINHA contra o tamanho do
  // corpo, entao acompanha a fonte — um numero de pixels nao acompanharia.
  // Em 390px a coluna nao muda nada, e e o certo: no celular o texto ja usa a
  // tela toda.
  conteudo: {
    paddingTop: espacio.xl,
    paddingBottom: espacio.xxxl,
  },

  titulo: { marginTop: espacio.sm },
  paragrafo: { marginTop: espacio.lg },
  anuncio: { marginTop: espacio.md },
  ouvirAnuncio: { marginTop: espacio.md },

  // A nota da fixidez: traco do fio a esquerda. colores.hilo como TRACO, nunca
  // como cor de texto (regra 9).
  nota: {
    marginTop: espacio.xl,
    paddingLeft: espacio.lg,
    borderLeftWidth: 2,
    borderLeftColor: colores.hilo,
  },

  progresso: { marginTop: espacio.sm },
  posicao: { marginTop: espacio.xl },
  instrucao: { marginTop: espacio.sm },

  /* A MESA: 3 colunas x 2 linhas. `flexWrap` com `gap` em vez de largura
   * calculada — a celula de 31% deixa folga para os dois vaos, e a grade
   * reflui sozinha em tela estreita em vez de estourar para fora. */
  mesa: {
    marginTop: espacio.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: espacio.md,
  },
  celula: {
    // 30% e nao 33%: o `gap` de 12 come o resto, e uma celula de 33% empurraria
    // a terceira coluna para a linha de baixo — a grade viraria 2x3 sem que
    // nada acusasse erro.
    width: '30%',
    borderRadius: radio.lg,
  },
  celulaTocada: { opacity: 0.72 },

  /* O verso. A largura vem da celula; a proporcao 0.625 (5:8) e a das artes do
   * baralho cigano, a mesma do `carta` la embaixo. */
  verso: {
    width: '100%',
    aspectRatio: 0.625,
  },
  // Escolhida: borda do fio em volta do metal. colores.hilo como TRACO (regra 9).
  versoEscolhido: {
    borderWidth: 2,
    borderColor: colores.hilo,
  },
  /* A marca da ordem, no pe da celula. Fundo penumbra para o algarismo nao
   * disputar leitura com o brilho do metal. */
  marca: {
    position: 'absolute',
    right: espacio.xs,
    bottom: espacio.xs,
    minWidth: espacio.xl,
    paddingHorizontal: espacio.sm,
    paddingVertical: espacio.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radio.sm,
    borderWidth: 1,
    borderColor: colores.bordeHilo,
    backgroundColor: colores.penumbra,
  },

  /* A CARTA. O aspectRatio 0.625 e 5:8, a proporcao das artes do baralho cigano
   * (a de CartaHilo e 0.6, que e a do taro). A largura e o teto continuam vindo
   * de DIMENSION_CARTA — este style so ajusta, nunca zera a medida: sem largura
   * e altura o onLayout do ScratchRevealCard mede 0x0 e a raspagem para de
   * responder ao dedo, em silencio. O 'contain' sobre fundo noche ja e de
   * CartaHilo, entao a diferenca de proporcao nunca corta a arte. */
  carta: {
    marginTop: espacio.xl,
    aspectRatio: 0.625,
  },

  revelado: { marginTop: espacio.xl },

  linhaNome: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: espacio.md,
  },
  nome: { flexShrink: 1 },
  ouvir: { alignSelf: 'center' },
  audioNota: { marginTop: espacio.md },

  convite: {
    marginTop: espacio.xl,
    padding: espacio.lg,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.penumbra,
  },
  conviteTexto: { marginTop: espacio.sm },

  botao: { marginTop: espacio.xxl },
});
