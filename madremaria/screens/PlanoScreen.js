// screens/PlanoScreen.js — O PLANO DE HOJE, a tela que ela abre de manha.
//
// ===========================================================================
// O QUE ESTA TELA E
// ===========================================================================
// A visao do dono, na palavra dele: "um plano diario que cruza os dados
// astrologicos com um ritual rotativo e uma acao concreta — se nessa sexta vai
// estar lua cheia, vai ser melhor voce sair para um restaurante; hoje e dia do
// ritual do cafe, tira uma foto do cafe; hoje e dia da leitura da mao". Mais o
// card compartilhavel.
//
// A tela nao calcula nada. Ela desenha o que dois motores puros devolvem, e a
// unica coisa que ela decide sozinha e a ORDEM, que e a hierarquia do produto.
//
// ===========================================================================
// UMA ACAO DOMINANTE — a licao que veio do dossie do app irmao
// ===========================================================================
// O Cosmic Guide sofre de "excesso de oferta simultanea": seis cartoes do mesmo
// peso na primeira dobra, e a pessoa nao faz nenhum. Aqui existe UMA acao
// dominante — o ritual de hoje —, e ela e a unica coisa da tela com <Titulo>,
// borda viva e (quando o gesto e a tiragem) botao solido. Todo o resto entra por
// baixo, em cartoes de borda suave, sem competir.
//
// A ordem, de cima para baixo, e a que o dono pediu:
//   1. a data e a linha do ceu — a linha do ceu SO se ela existir;
//   2. o ritual de hoje, em destaque, com o gesto e a duracao;
//   3. a reflexao, com campo para ela responder;
//   4. a afirmacao;
//   5. a acao do dia — ou o bloco travado, com o motivo honesto;
//   6. o botao de compartilhar o card do dia.
//
// ===========================================================================
// DE ONDE VEM CADA PEDACO (leia antes de trocar qualquer import)
// ===========================================================================
//   lib/plano.js            planoDoDia(respuestas, { hoy }) → o dia inteiro:
//                           ceu, reflexao, afirmacao, encontro, contencao,
//                           regente, nomeDiaSemana. PURO: nao le nem escreve
//                           disco, nao sorteia, nao lanca.
//   lib/plano.js            ritualSeguroDoDia(dia, respuestas) → o gesto de hoje
//                           (`gesto`, `duracao`, `comoFazer[]`, `fecho`,
//                           `precisaCamera`, recibo), JA PASSADO pela rede de
//                           contato. Ele embrulha ritualDoDia() de
//                           lib/rituaisRotativos.js — que esta tela NAO importa
//                           direto, e a diferenca nao e de estilo: ver a regra 3.
//   lib/ceu.js              diaLocal() e GLIFO_POR_PLANETA — nada de efemeride
//                           e chamado daqui; quem fala com o ceu e lib/plano.js.
//
// POR QUE O RITUAL EM DESTAQUE VEM DE lib/rituaisRotativos.js, E NAO DE
// `plano.ritual`. O app tem HOJE dois catalogos de ritual rotativo:
//
//   · datos/plano.js  → cinco gestos (cafe-da-manha, linha-no-papel,
//     leitura-da-mao, caminho-de-volta, mesa-posta), com `momento` declarado e,
//     por isso, com ENCAIXE medido contra a fase e o dia da semana;
//   · datos/rituais.js → cinco gestos (cafe, mao, cartas, sonho, respiro), com
//     `gesto`, `duracao`, `comoFazer[]`, recibo de tradicao e a flag de camera.
//
// Esta tela mostra o SEGUNDO, por dois motivos de produto que nao tem volta:
// o dono pediu o gesto e a duracao em destaque (campos que so existem la), e
// pediu que o plano contenha a tiragem quando for o dia dela — e 'cartas' so
// existe naquele catalogo. Nao ha aqui um segundo ritual escondido: mostrar os
// dois seria a tela dizendo duas coisas diferentes sobre o mesmo dia, que e
// exatamente o "excesso de oferta" que este arquivo evita.
//
// A CONSEQUENCIA, e ela e deliberada: `plano.ritual.encaixe` NAO e desenhado.
// Aquele encaixe ("Hoje e o dia deste gesto: quarta-feira, dia de Mercurio")
// mede o ritual de datos/plano.js, e nao o que esta na tela. Colar a medida de
// um gesto embaixo de outro seria uma afirmacao falsa produzida por um copiar e
// colar — a mesma classe de erro que a regra 1 proibe, so que sobre o catalogo
// em vez de sobre o ceu. Quem quiser encaixe aqui precisa primeiro dar `momento`
// aos rituais de datos/rituais.js e medir o certo; enquanto isso nao acontece, a
// tela cala. A linha do ceu no topo ja entrega a promessa do "nessa sexta vai
// estar lua cheia", e ela e medida de verdade.
//
// ===========================================================================
// AS TRES LINHAS QUE ESTA TELA NAO ATRAVESSA
// ===========================================================================
// 1. NUNCA FABRICAR CEU. `plano.ceu` null significa "nao desenhe o card", nunca
//    "desenhe um card de erro": o bloco do ceu simplesmente NAO EXISTE na
//    arvore. E `plano.ceuMotivoTecnico` — 'motor_indisponivel',
//    'fase_nao_calculada' — vai para o console em __DEV__ e NUNCA para a tela.
//    Escrever "ceu indisponivel" para a usuaria seria despejar log em cima dela.
//    O que nao depende de efemeride (a data, o regente do dia, o ritual, a
//    reflexao, a afirmacao) continua inteiro num aparelho sem astronomy-engine.
// 2. NUNCA PROMETER DESFECHO nem dizer que o ceu ou o gesto agem sobre a outra
//    pessoa. Toda frase visivel desta tela nasce em datos/plano.js,
//    datos/rituais.js ou datos/textos.js — nenhuma e composta aqui.
// 3. NUNCA EMPURRAR CONTATO. Quem decide se o bloco de encontro sai como acao ou
//    travado e lib/plano.js, pela resposta dela na pergunta 4. A tela desenha o
//    que veio e NAO tem nenhum ramo que remonte a acao a partir de outro campo:
//    no estado travado, `encontro.texto` ja e o texto do bloco travado e nao
//    existe nada guardado "para quando destravar".
//
//    E ISSO VALE PARA O CARTAO DO RITUAL, que e a parte da tela onde a regra ja
//    esteve furada. O cartao em destaque desenha `gesto`, `abertura`,
//    `comoFazer[]` e `fecho` — texto de datos/rituais.js — e por meses ele
//    chegava CRU: a rede de contato de lib/plano.js varria `plano.ritual`, que
//    sai do OUTRO catalogo e que esta tela nao desenha em lugar nenhum. Nada,
//    em teste nem em runtime, chegava a ler o texto deste cartao: a abertura da
//    mao falava pela outra pessoa ("ate onde ela vai") e ninguem media.
//    Por isso o import e `ritualSeguroDoDia` (lib/plano.js) e nunca `ritualDoDia`
//    (lib/rituaisRotativos.js): trocar um pelo outro aqui reabre o buraco sem
//    mudar uma linha de layout, e test/plano.test.js confere este import.
//
// ===========================================================================
// A CHAVE DE DISCO — e por que ela e a UNICA coisa que esta tela grava
// ===========================================================================
// O plano e puro; esta tela nao. Ela guarda UMA coisa: a resposta que ela
// escrever na reflexao do dia, sob a chave 'plano'.
//
// REGRA DE INTEGRACAO QUE JA CUSTOU CARO: 'plano' ESTA em CLAVES_HILO_ROJO
// (screens/AjustesScreen.js), no mesmo commit deste arquivo. Fora daquela lista
// a chave sobreviveria ao "Apagar tudo" e a politica de privacidade viraria
// declaracao falsa numa ficha de loja.
//
// O QUE FICA GRAVADO: { dia, texto } — a resposta do DIA CORRENTE, e so. Nao ha
// historico porque nao ha quem o leia: esta tela so mostra hoje. Byte guardado
// sem leitor e byte que alguem tem de defender numa ficha de loja sem ter o que
// mostrar em troca.
//
// ===========================================================================
// CONTRATOS DE ARQUIVO
// ===========================================================================
//  · Nenhum hex e nenhum rgba: toda cor sai de theme.js.
//  · colores.hilo nunca como cor de TEXTO — so borda, fundo de botao e traco.
//  · Toda string visivel vem de t() (datos/textos.js) ou dos catalogos de datos/.
//  · Toda tipografia vem dos wrappers de components/Texto.js.
//  · Nenhum Alert.alert: no react-native-web ele e no-op silencioso. Falha vira
//    linha de texto na tela.
//  · props.navigation e OPCIONAL: sem ele a tela desenha inteira (screenshot de
//    loja) e os botoes que navegariam simplesmente nao navegam.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import BotaoOuvir from '../components/BotaoOuvir';
import BotonPrimario from '../components/BotonPrimario';
import { ScratchRevealCard } from '../components/ScratchRevealCard';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Fuente, Micro, Rotulo, Sobreceja, Titulo } from '../components/Texto';
import { signoDe } from '../datos/preguntas';
import { lunacaoDe } from '../lib/ano';
import {
  HUMORES,
  apostarAmanha,
  coracaoDoDia,
  estadoDaAposta,
  placarDaSemana,
  registrarCoracao,
  revelarAposta,
} from '../lib/coracao';
import { luaNoSignoDela } from '../lib/luaNoSigno';
import { inicioDaJornada } from '../lib/entrada';
import { atoDoDia, diaSeguinte } from '../lib/atoDoDia';
// O CIRCULO nao veio para o Cosmic Guide (decisao do dono, 11/09/2026):
// lib/circulo.js nao foi copiado. Contador, mural e a palavra do dia sairam.
import { guardarDeixa, lerDeixa } from '../lib/corrente';
import { fraseDoDia } from '../lib/fraseDoDia';
import { cumpriuNaEscada, degrauDeHoje } from '../lib/escada';
import { estadoDaMissao, marcarMissao, missaoDoDia } from '../lib/missaoDoDia';
import { t } from '../datos/textos';
import { leerSeguro, guardarSeguro } from '../lib/almacen';
import { GLIFO_POR_PLANETA, diaLocal, esDiaValido } from '../lib/ceu';
/* O rotulo do planeta e do signo para DENTRO da frase. O valor que entra em
 * GLIFO_POR_PLANETA, em `darSigno` e no disco continua canonico. Ver
 * lib/nomesDoCeu.js. */
import { rotuloDoPlaneta, rotuloDoSigno } from '../lib/nomesDoCeu';
import { atarNudo } from '../lib/hilo';
import { ESTADOS_ENCONTRO, planoDoDia, ritualSeguroDoDia } from '../lib/plano';
import {
  SIGNOS,
  apagarSignoDaPessoa,
  guardarSignoDaPessoa,
  lerSignoDaPessoa,
  ritmoDoPar,
} from '../lib/sinastria';
import { estaSuscrito } from '../lib/suscripcion';
import { guardarSonho, lerSonho } from '../lib/registroDoSonho';
import { diasRaspados } from '../lib/veuDoDia';
import { diaAindaAbre, jaRaspou, marcarRaspado } from '../lib/veuDoDia';
import { RUTAS } from '../routes';
/* As rotas do COSMIC GUIDE. Unico import da Madre que atravessa a fronteira dos
 * dois apps, e ele existe por decisao do dono (11/09/2026): cafe e palma sao UM
 * SO no app. Ver o ★ PONTO DE SOLDA, abaixo. */
import { ROUTES } from '../../routes';
import { colores, espacio, radio, sombra, tipo } from '../theme';

/* ===================================================================================
   AS CHAVES DE DISCO
   Nuas de proposito: o prefixo 'hr.' e assunto de lib/almacen.js, e escrever
   'hr.plano' aqui geraria 'hr.hr.plano'.

   CLAVES_RESPUESTAS repete a lista de screens/TiradaScreen.js — as respostas do
   onboarding moram em 'respuestas' (o espelho) ou em 'perfil' (a ficha). Duplicada
   ali e aqui de proposito: sao duas telas independentes, e nenhuma deve quebrar
   porque a outra mudou de ideia sobre onde procurar.
   =================================================================================== */
const CLAVE_PLANO = 'plano';
const CLAVES_RESPUESTAS = ['respuestas', 'perfil'];

/* ===================================================================================
   ONDE CADA GESTO ABRE
   Dos cinco rituais, um tem tela propria aqui dentro, dois pertencem ao Cosmic
   Guide e dois acontecem fora do telefone.

     cartas  → reabrir a leitura dela  (screens/ReouvirTresCartasScreen.js)
     cafe    → a borra da xicara       — TELA DO COSMIC GUIDE (ROUTES.COFFEE)
     mao     → a linha da propria mao  — TELA DO COSMIC GUIDE (ROUTES.PALM)
     sonho   → nao tem tela: o gesto e escrever, e o app nao devolve significado
     respiro → nao tem tela: o gesto e virar o telefone para baixo por cinco
               minutos, e uma tela aqui seria o contrario do gesto

   CAFE E PALMA SAO UM SO NO APP (decisao do dono, 11/09/2026). O Cosmic Guide ja
   tem o Ritual do Cafe e a leitura da palma, com endpoint, cota e chave proprios.
   As telas da Madre (RitualCafeScreen.js, RitualMaoScreen.js) NAO vieram na copia,
   e com elas sairam lib/camara.js, lib/camaraExpo.js, lib/visao.js e lib/api.js —
   ficaram sem nenhum consumidor, e eram elas que apontavam para o servidor do
   Madre Maria autonomo. O Madre Maria em madre-maria.vercel.app continua inteiro.

   Ritual fora desta tabela simplesmente nao ganha botao. Botao que nao leva a lugar
   nenhum e pior que nenhum botao — e um botao que abrisse uma tela vazia "para
   registrar o respiro" transformaria o unico gesto sem material do catalogo em mais
   uma tarefa dentro do aparelho.
   =================================================================================== */
const DESTINO_POR_RITUAL = Object.freeze({
  /* 'cartas' NAO abre tiragem nenhuma — nao existe mais tiragem no app
   * (decisao do dono, 01/09). O gesto e reabrir a leitura DELA: as tres de
   * sempre, com voz e texto, em ReouvirTresCartasScreen. */
  cartas: RUTAS.REOUVIR_ENTRADA,
  /* ★ SOLDA FEITA (11/09/2026) — cafe e palma abrem as telas do COSMIC GUIDE.
   * Nomes do outro navegador dentro deste mapa, de proposito: ver o bloco abaixo. */
  cafe: ROUTES.COFFEE,
  mao: ROUTES.PALM,
});

/* ===================================================================================
   ★ A SOLDA — CAFE E PALMA (11/09/2026). FEITA.

   Este e o UNICO lugar do plano do dia que decide para onde o botao do ritual leva.
   A outra ponta da mesma decisao e a lista de acessos do PerfilScreen (procure pelo
   mesmo marcador ★ la).

   POR QUE `navigate` NU BASTA — e por que NAO ha getParent() aqui.
   O aviso que este bloco trazia antes dizia que a solda precisaria de
   navigation.getParent(). Foi medido no @react-navigation instalado e ESTA ERRADO:

     1. A Madre inteira e uma Stack.Screen do HomeStack do Cosmic (App.js), e
        COFFEE/PALM sao Stack.Screen do MESMO HomeStack — irmas da Madre, nao
        primas distantes.
     2. `ir()` faz navigate('Coffee') nu. O TabRouter das abas da Madre nao conhece
        esse nome e devolve null
        (node_modules/@react-navigation/routers/lib/commonjs/TabRouter.js:193).
     3. Router que devolve null faz a acao SUBIR sozinha para o pai
        (node_modules/@react-navigation/core/lib/commonjs/useOnAction.js:79-83),
        e o pai e exatamente o HomeStack que tem as duas telas.

   getParent() aqui seria codigo a mais fazendo o que a biblioteca ja faz, e
   pior: amarraria o botao a uma altura fixa da arvore, quebrando calado no dia em
   que a Madre mudasse de lugar. A subida por nome sobrevive a mudanca de altura.

   NAO HA COLISAO DE NOME: 'Coffee' e 'Palm' nao existem em madremaria/routes.js
   (conferido nos 26 valores de la), entao nenhuma aba da Madre intercepta a subida.
   Se um dia alguem criar uma rota com um desses nomes aqui dentro, o botao passa a
   abrir a tela errada EM SILENCIO — e a razao de este paragrafo existir.

   O QUE VOLTA DA TELA DO COSMIC: NADA, e e assim de proposito.
   A tela do Cosmic nao recebe parametro nenhum (nem CoffeeScreen nem PalmScreen
   leem route.params) e nao devolve resultado a quem a abriu — ela grava a leitura
   no Diario do COSMIC (lib/readingCompletion.js), que e o pote dele. Os dados dos
   dois apps sao ISOLADOS por decisao do dono, entao a Madre nao le esse pote e nao
   ha formato nenhum a adaptar deste lado.

   E O NO DO DIA? JA ESTA ATADO ANTES DO BOTAO EXISTIR NA TELA.
   Quem ata e `aoRasparODia` (atarNudo, mais abaixo nesta tela): raspar o veu E o
   gesto diario de presenca desde 01/09, justamente porque atar so no fim do ritual
   deixava o fio congelado em 10 de 12 dias. O botao do ritual so aparece DEPOIS do
   veu raspado — entao, quando a pessoa toca nele, o no daquele dia ja existe.
   Somar uma segunda amarracao na volta seria: (a) redundante, atarNudo e
   idempotente no dia; (b) uma MENTIRA na volta de quem desistiu — ver abaixo.

   A DESISTENCIA (Lei 1 do Cosmic: nada fabricado).
   Quem abre o cafe e sai no meio, ou nega a camera, volta com o botao de voltar do
   proprio stack e cai de novo no plano, que continua exatamente como estava. Isso
   nao e sorte: nao ha `.then()` pendurado nesta navegacao, nao ha listener de
   'focus' que marque nada, e a Madre nao le o Diario do Cosmic. Nao existe neste
   caminho um lugar onde o dia pudesse ser dado por vivido, e por isso nao existe
   um lugar onde ele pudesse ser dado por vivido POR ENGANO. O que mede presenca
   continua sendo o veu, que ela ja raspou — nem mais, nem menos do que aconteceu.
   =================================================================================== */
export function destinoDoRitual(idRitual) {
  return DESTINO_POR_RITUAL[idRitual] || null;
}

/** Teto do campo da reflexao. O mesmo espirito de MAX_NOTA do ritual: um campo sem
 *  teto vira arquivo de texto dentro de uma chave de AsyncStorage. */
const MAX_RESPOSTA = 600;

/* O sonho e mais longo que a reflexao por natureza — cena, gente, lugar. O
 * dobro do teto; acima disso ja e diario, e diario tem o fio. */
const MAX_SONHO = 1200;

/** Quanto tempo sem digitar antes de gravar. Gravar a cada tecla escreveria no
 *  disco dezenas de vezes por frase; gravar so no blur perderia o texto de quem
 *  fecha o app com o teclado aberto. O blur tambem grava, na hora. */
const MS_GRABAR = 700;

/**
 * Aceita o objeto achatado ({ nombre, corte, hoy, ... }) e o embrulhado
 * ({ respuestas: { ... } }). Devolve null para qualquer coisa que nao sirva.
 * Mesma funcao de screens/TiradaScreen.js, pelo mesmo motivo: as duas chaves
 * guardam formatos diferentes por razoes historicas.
 */
function desembrulhar(valor) {
  if (!valor || typeof valor !== 'object') return null;
  const interno = valor.respuestas;
  if (interno && typeof interno === 'object') return interno;
  return valor;
}

/* ===================================================================================
   A LINHA DO DIA — 'sexta-feira, 4 de setembro · ♀ Vênus'

   Os nomes dos meses saem de 'ritual.meses' e NAO de uma lista nova: dois arrays
   de doze meses digitados em lugares diferentes acabam discordando, e a
   discordancia sai na tela como o app escrevendo duas datas diferentes para o
   mesmo dia.

   O REGENTE NAO E CEU e por isso ele nunca some. A fila dos sete dias e aritmetica
   de calendario (a ordem caldaica com salto de 3, registrada em Diao Cassio) e
   continua verdadeira num aparelho sem efemeride nenhuma. E por isso que esta
   linha sobrevive inteira quando o bloco do ceu nao renderiza.
   =================================================================================== */
export function linhaDoDia(plano) {
  if (!plano || !esDiaValido(plano.dia)) return '';
  const meses = t('ritual.meses');
  const mes = Array.isArray(meses) ? meses[Number(plano.dia.slice(5, 7)) - 1] : null;
  if (!mes) return '';
  return t('plano.tela.linhaDoDia', {
    diaSemana: plano.nomeDiaSemana,
    dia: Number(plano.dia.slice(8, 10)),
    mes,
    /* O rotulo entra na FRASE; o glifo continua sendo buscado pelo nome
     * CANONICO, que e como GLIFO_POR_PLANETA esta escrito em lib/ceu.js —
     * rotular antes do lookup deixaria o glifo vazio em ES e EN. */
    regente: rotuloDoPlaneta(plano.regente),
    glifo: GLIFO_POR_PLANETA[plano.regente] || '',
  });
}

/* ===================================================================================
   A LINHA DO CEU
   Duas medidas ja compostas por lib/plano.js: a fase de hoje e, quando existe um
   marco dentro do horizonte declarado (7 dias), a data dele. Esta funcao so
   emenda as duas — nao formata numero, nao arredonda nada e nao inventa ligacao
   causal entre as duas frases.

   Devolve '' quando nao ha ceu, e o chamador nao desenha nada. '' aqui nunca vira
   "ceu indisponivel": isso e log, e log nao e copy.
   =================================================================================== */
export function linhaDoCeu(plano) {
  const ceu = plano && plano.ceu;
  if (!ceu || ceu.disponivel !== true) return '';
  const partes = [ceu.fase && ceu.fase.emoji ? `${ceu.fase.emoji} ${ceu.linha}` : ceu.linha];
  if (ceu.marco && ceu.marco.linha) partes.push(ceu.marco.linha);
  return partes.filter(Boolean).join(' ');
}

/* ===================================================================================
   O CARD COMPARTILHAVEL
   Texto puro, montado so de campos que ja existem. O que ENTRA: o nome do app, a
   data, a linha do ceu (se houve medida), o ritual do dia com o gesto, a afirmacao
   e o aviso que impede o print de virar promessa na conversa de outra pessoa.

   O QUE NAO ENTRA, e os tres motivos sao diferentes:
     · a resposta da reflexao — e dela, e escrita num campo que a tela promete que
       nao sai deste telefone;
     · o bloco de encontro — e a parte que fala de outra pessoa, e um print dele
       numa conversa vira exatamente a cobranca que o produto nao faz;
     · qualquer campo tecnico (`ceuMotivoTecnico`, `guardasDisparadas`).
   =================================================================================== */
export function textoParaCompartir(plano, ritual, atoEfetivo) {
  const ceu = linhaDoCeu(plano);
  /* Em dia que nao e de gesto, o print diz so o TIPO do ato: o nome do gesto
   * do rodizio nao apareceu na tela daquele dia e nao pode estrear num
   * compartilhamento (um dia = um ato, 03/09). */
  const linhaDoAto =
    atoEfetivo && atoEfetivo !== 'gesto'
      ? t('plano.ato.' + atoEfetivo)
      : ritual
        ? `${ritual.nome} — ${ritual.gesto}`
        : null;
  return [
    t('app.nombre'),
    linhaDoDia(plano),
    ceu || null,
    '',
    linhaDoAto,
    '',
    plano ? plano.afirmacao : null,
    '',
    t('plano.tela.compartir.aviso'),
  ]
    .filter((linea) => typeof linea === 'string')
    .join('\n')
    .trim();
}

/* ===================================================================================
   A TELA
   =================================================================================== */

/**
 * @param {object}  props
 * @param {object} [props.navigation] objeto de navegacao. Sem ele a tela desenha
 *        inteira e os dois botoes que navegariam nao navegam.
 * @param {object} [props.route] route.params aceita { respuestas } — o mesmo
 *        pacote que o onboarding empilha. Sem ele, as respostas saem do disco.
 * @param {string} [props.hoy] 'YYYY-MM-DD' para congelar o dia em teste ou em
 *        captura de tela de loja. Fora disso, o dia local do aparelho.
 */
export default function PlanoScreen({ navigation, route, hoy }) {
  // null = ainda lendo o disco. O plano nao depende do disco para existir, mas as
  // respostas do onboarding sim — e sao elas que decidem se o bloco de encontro
  // sai como acao ou travado. Desenhar antes de saber mostraria a acao de encontro
  // por uma fracao de segundo para quem esta sem contato, que e o pior frame que
  // este app pode desenhar.
  const [respuestas, setRespuestas] = useState(null);
  const [listo, setListo] = useState(false);

  // O dia corrente. Fica em estado (e nao numa chamada solta) para poder virar
  // sozinho quando ela volta a tela depois da meia-noite com o app em segundo
  // plano — sem isso a tela mostraria o plano de ontem ate ser fechada.
  /* O dia mostrado. O mapa do ano pode mandar { dia } por parametro — e o
   * plano ACEITA no maximo o perdao de um dia (lib/veuDoDia.diaAindaAbre):
   * hoje, ou ontem. Qualquer outra coisa — futuro, semana passada, lixo de
   * URL — cai no dia real. Sem esta guarda o parametro viraria maquina do
   * tempo, e o cronograma inteiro perderia o sentido de "um por dia". */
  const [dia, setDia] = useState(() => {
    const pedido = route && route.params ? route.params.dia : null;
    const real = esDiaValido(hoy) ? hoy : diaLocal();
    return pedido && diaAindaAbre(pedido, real) ? pedido : real;
  });

  const [respostaReflexao, setRespostaReflexao] = useState('');
  /* O texto do gesto do sonho — so usado quando o ritual do dia e 'sonho'.
   * Nasceu do bug de 01/09: o cartao mandava escrever sem dar campo. */
  const [textoDoSonho, setTextoDoSonho] = useState('');
  /* 'quieto' | 'escrevendo' | 'guardado' — o aviso que faltava. O disco grava
   * no silencio (debounce) e a pessoa ficava esperando um botao de concluir
   * que nunca existiu; agora o campo DIZ quando guardou. Um estado por campo. */
  const [estadoReflexao, setEstadoReflexao] = useState('quieto');
  const [estadoSonho, setEstadoSonho] = useState('quieto');
  /* --- A CELULA NOVA (cronogramacao 01/09) --------------------------------------
   * lunacao: 1..13 medida (ou null sem ancora — a missao cai no capitulo 1).
   * missaoEstado: {aceita, cumprida, nota, palavra} do dia, lido do disco.
   * coracaoHoje/placar: o toque do dia e as contagens da semana. */
  const [lunacao, setLunacao] = useState(null);
  const [missaoEstado, setMissaoEstado] = useState(null);
  const [coracaoHoje, setCoracaoHoje] = useState(null);
  const [placar, setPlacar] = useState(null);
  /* null = AINDA NAO SEI. Os tres estados sao de proposito: com um booleano
   * iniciado em false a tela pintaria o cadeado por um quadro antes de a leitura
   * do disco voltar, e quem assina veria o proprio ritual trancado piscar. */
  const [assina, setAssina] = useState(null);

  /* --- O RITMO DE VOCES DOIS (so sexta) ------------------------------------------
   * `signoDaPessoa`: null = nao deu (ou apagou); string = o signo guardado.
   * `ritmoFechado`: "Hoje nao" desta SESSAO — nao persiste de proposito: na
   * proxima sexta o convite volta, e e assim que o loop semanal se mantem. */
  const [signoDaPessoa, setSignoDaPessoa] = useState(null);
  const [ritmoFechado, setRitmoFechado] = useState(false);

  /* --- O VEU DO DIA ---------------------------------------------------------------
   * null = lendo o disco; true = ja raspou o dia MOSTRADO; false = coberto.
   * O raspado e DO DIA, nao da pessoa: a chave guarda {dia} e amanha o veu
   * volta sozinho. Falha de leitura cai em coberto — raspar de novo custa dois
   * segundos; abrir sozinho mataria a mecanica inteira. */
  const [raspadoHoje, setRaspadoHoje] = useState(null);
  /* null = lendo; true = NUNCA raspou um dia — o primeiro plano da vida dela,
   * e o gesto e a mao (a estreia). false = vida normal, o giro decide. */
  const [estreia, setEstreia] = useState(null);
  const [falloDisco, setFalloDisco] = useState(false);
  const [falloCompartir, setFalloCompartir] = useState(false);

  const montado = useRef(true);
  const temporizador = useRef(null);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    lerSignoDaPessoa()
      .then((s) => {
        if (!cancelado && montado.current) setSignoDaPessoa(s);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    setRaspadoHoje(null); // null cobre — o veu nunca abre por engano na virada
    jaRaspou(dia)
      .then((sim) => {
        if (!cancelado && montado.current) setRaspadoHoje(Boolean(sim));
      })
      .catch(() => {
        if (!cancelado && montado.current) setRaspadoHoje(false);
      });
    return () => {
      cancelado = true;
    };
  }, [dia]);

  const aoRasparODia = useCallback(() => {
    setRaspadoHoje(true);
    setEtapa('frase'); // o dia recem-raspado abre em passos, nao em paredao
    marcarRaspado(dia).catch(() => {});
    /* O NO DO DIA ATA AQUI. Antes so as telas de cafe/mao/sintese atavam — e
     * com o rodizio novo isso deixava o fio congelado em 10 de 12 dias mesmo
     * para quem vinha todo dia (achado do /code-review de 01/09). Raspar o
     * veu E o gesto diario de presenca; o fio anda com ele. */
    atarNudo(dia).catch(() => {});
  }, [dia]);

  const darSigno = useCallback((s) => {
    guardarSignoDaPessoa(s).then((ok) => {
      if (ok && montado.current) setSignoDaPessoa(s);
    });
  }, []);

  const trocarSigno = useCallback(() => {
    apagarSignoDaPessoa().then(() => {
      if (montado.current) setSignoDaPessoa(null);
    });
  }, []);

  useEffect(() => {
    let cancelado = false;
    /* A VIRADA LIMPA ANTES DE LER. Sem estes resets, a meia-noite mostrava o
     * dia novo com o coracao e a missao de ontem por alguns quadros — e um
     * toque nessa janela gravava dado de ontem no dia novo. */
    setMissaoEstado(null);
    setCoracaoHoje(null);
    setPlacar(null);
    (async () => {
      const inicio = await inicioDaJornada();
      if (cancelado || !montado.current) return;
      if (inicio) {
        const m = lunacaoDe(`${dia}T12:00:00.000Z`, inicio);
        setLunacao(m && m.disponivel && typeof m.numero === 'number' ? m.numero : null);
      }
      const [e, ch, p] = await Promise.all([
        estadoDaMissao(dia),
        coracaoDoDia(dia),
        placarDaSemana(dia),
      ]);
      if (cancelado || !montado.current) return;
      setMissaoEstado(e || { aceita: false, cumprida: false, nota: null, palavra: '' });
      setCoracaoHoje(ch);
      setPlacar(p);
    })().catch(() => {
      /* Disco quebrado nao pode emudecer o unico ato do dia: o estado padrao
       * entra do mesmo jeito e a missao renderiza. */
      if (!cancelado && montado.current) {
        setMissaoEstado({ aceita: false, cumprida: false, nota: null, palavra: '' });
      }
    });
    return () => {
      cancelado = true;
    };
  }, [dia]);

  /* A ESCADA DO DEGELO (11/09): a altura em que ela esta e o TETO das missoes
   * de contato. `null` enquanto o disco nao responde — nessa janela o motor se
   * comporta como antes, em vez de mostrar uma missao que ela ainda nao
   * alcancou e troca-la no frame seguinte. */
  const [degrau, setDegrau] = useState(null);
  useEffect(() => {
    let cancelado = false;
    degrauDeHoje()
      .then((d) => {
        if (!cancelado && montado.current) setDegrau(d);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  const missao = useMemo(
    () => missaoDoDia(dia, lunacao, respuestas || {}, degrau),
    [dia, lunacao, respuestas, degrau]
  );
  const frase = useMemo(() => fraseDoDia(dia), [dia]);

  /* --- UM DIA, UM ATO (03/09) ----------------------------------------------------
   * "cada dia tem que ser uma coisa" — o tipo do dia sai de lib/atoDoDia.js e
   * o wizard monta SO o bloco daquele tipo. O de amanha aparece no fecho:
   * apenas o TIPO e a frase cortada no meio — o gesto de amanha continua sem
   * spoiler (promessa do audio 10), e frase interrompida e convite, nao divida. */
  const ato = useMemo(() => atoDoDia(dia), [dia]);
  const fraseAmanha = useMemo(() => {
    const f = fraseDoDia(diaSeguinte(dia));
    if (!f) return '';
    const corte = f.slice(0, Math.max(18, Math.floor(f.length * 0.45)));
    const esp = corte.lastIndexOf(' ');
    return (esp > 12 ? corte.slice(0, esp) : corte) + '\u2026';
  }, [dia]);

  /* A DEIXA — o elo com o ultimo dia fechado (lib/corrente.js). So conta se
   * for de OUTRO dia: reabrir hoje nao cita hoje. Faltou dias? A deixa
   * espera, e a copy nunca conta o tempo. */
  const [deixa, setDeixa] = useState(null);
  useEffect(() => {
    let cancelado = false;
    lerDeixa()
      .then((d) => {
        if (cancelado || !montado.current) return;
        // So deixa de dia ANTERIOR: reabrir ontem nao pode citar hoje
        // como "da ultima vez" (strings YYYY-MM-DD comparam em ordem).
        setDeixa(d && d.dia < dia ? d : null);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [dia]);

  /* O CIRCULO saiu (11/09/2026) — estado do contador/mural removido. */

  /* --- A APOSTA DO CORACAO (04/09) ------------------------------------------------
   * aposta = a que espera revelacao; revelacao = a de HOJE (persistida em
   * lib/coracao.js para a reabertura mostrar de novo); acertos = so acertos. */
  const [aposta, setAposta] = useState(null);
  const [revelacao, setRevelacao] = useState(null);
  const [acertos, setAcertos] = useState(0);
  useEffect(() => {
    let cancelado = false;
    setAposta(null);
    setRevelacao(null);
    estadoDaAposta()
      .then((e) => {
        if (cancelado || !montado.current || !e) return;
        setAposta(e.aposta);
        setAcertos(e.acertos);
        if (e.revelada && e.revelada.dia === dia) setRevelacao(e.revelada);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [dia]);

  /* O CARIMBO — o instante do fechamento (some sozinho). */
  const [carimbo, setCarimbo] = useState(false);
  const mudarMissao = useCallback(
    (mudanca) => {
      setMissaoEstado((atual) => ({ ...(atual || {}), ...mudanca }));
      marcarMissao(dia, mudanca).catch(() => {});
      /* CUMPRIU = SOBE (11/09). So o cumprimento move a escada, e so quando a
       * missao era do degrau atual — lib/escada.js decide. Aceitar nao sobe: o
       * que abre a proxima porta e o ato feito, nao a intencao. */
      if (mudanca && mudanca.cumprida) {
        cumpriuNaEscada(dia, missao)
          .then((r) => {
            if (r.subiu && montado.current) setDegrau(r.degrau);
          })
          .catch(() => {});
      }
    },
    [dia, missao]
  );

  const tocarCoracao = useCallback(
    (humor) => {
      setCoracaoHoje(humor);
      registrarCoracao(dia, humor)
        .then(() => placarDaSemana(dia))
        .then((p) => {
          if (montado.current) setPlacar(p);
        })
        .catch(() => {});
      /* A aposta de um dia ANTERIOR se revela agora (a de hoje espera). A lib
       * decide e consome; a tela so mostra o que voltar. */
      revelarAposta(dia, humor)
        .then((r) => {
          if (!montado.current || !r) return;
          setRevelacao({ dia, apostou: r.apostou, chegou: r.chegou });
          setAcertos(r.acertos);
          setAposta(null);
        })
        .catch(() => {});
    },
    [dia]
  );

  const fazerAposta = useCallback(
    (humor) => {
      setAposta({ humor, feitaEm: dia });
      apostarAmanha(dia, humor).catch(() => {});
    },
    [dia]
  );

  /* A estreia le a MESMA lista do veu: zero dias raspados = primeiro plano da
   * vida. Falha de disco cai em false — na duvida, o giro normal, nunca uma
   * estreia repetida. */
  useEffect(() => {
    let cancelado = false;
    diasRaspados()
      .then((dias) => {
        if (cancelado || !montado.current) return;
        /* Estreia = nunca raspou NADA, ou o unico raspado e o proprio dia
         * mostrado. Sem a segunda metade, raspar o primeiro dia e reabrir o
         * app trocava o gesto ja revelado de 'mao' para o do giro no MESMO
         * dia (achado do /code-review de 01/09). */
        setEstreia(dias.length === 0 || (dias.length === 1 && dias[0] === dia));
      })
      .catch(() => {
        if (!cancelado && montado.current) setEstreia(false);
      });
    return () => {
      cancelado = true;
    };
  }, [dia]);

  /* O sonho ja escrito NESTE dia volta ao campo — reabrir o app nao pode
   * apagar o que ela escreveu de manha. */
  useEffect(() => {
    let cancelado = false;
    lerSonho(dia)
      .then((texto) => {
        if (!cancelado && montado.current) setTextoDoSonho(texto);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [dia]);

  /* --- ELA ASSINA? ---------------------------------------------------------------
   * O portao dos PASSOS do ritual. Falha de disco cai em `false` (trancado), e nao
   * em `true`: um erro de leitura nunca deve virar acesso liberado. */
  useEffect(() => {
    let cancelado = false;
    estaSuscrito()
      .then((activa) => {
        if (!cancelado && montado.current) setAssina(Boolean(activa));
      })
      .catch(() => {
        if (!cancelado && montado.current) setAssina(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  /* --- AS RESPOSTAS DO ONBOARDING ------------------------------------------------
   * Parametro de rota primeiro; o disco como rede. Espelho corrompido nao trava a
   * tela: sem respostas, lib/plano.js trata o contato como "nao declarado" e o
   * bloco de encontro sai como acao — que e o comportamento certo para quem nunca
   * respondeu a pergunta, e nao um chute sobre o contato dela. */
  useEffect(() => {
    let cancelado = false;
    (async () => {
      let recolhidas = desembrulhar(route && route.params ? route.params.respuestas : null);

      for (const clave of CLAVES_RESPUESTAS) {
        if (recolhidas) break;
        const crudo = await leerSeguro(clave);
        if (cancelado || !montado.current) return;
        try {
          recolhidas = crudo ? desembrulhar(JSON.parse(crudo)) : null;
        } catch {
          recolhidas = null;
        }
      }

      if (cancelado || !montado.current) return;
      setRespuestas(recolhidas || null);
      setListo(true);
    })();

    return () => {
      cancelado = true;
    };
    // Sem dependencias: as respostas chegam uma vez, na entrada da tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- A RESPOSTA GRAVADA DO DIA -------------------------------------------------
   * Recarregada sempre que o dia vira: o que ela escreveu ontem nao pode aparecer
   * embaixo da pergunta de hoje. Registro de outro dia e descartado em silencio —
   * ele nao e erro, e so um dia que passou. */
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const crudo = await leerSeguro(CLAVE_PLANO);
      if (cancelado || !montado.current) return;
      let texto = '';
      try {
        const guardado = crudo ? JSON.parse(crudo) : null;
        if (guardado && guardado.dia === dia && typeof guardado.texto === 'string') {
          texto = guardado.texto;
        }
      } catch {
        texto = '';
      }
      if (cancelado || !montado.current) return;
      setRespostaReflexao(texto);
    })();
    return () => {
      cancelado = true;
    };
  }, [dia]);

  /* --- A VIRADA DE DIA -----------------------------------------------------------
   * Voltar para esta tela (trocar de aba, ou trazer o app do segundo plano) confere
   * o relogio. Se o dia virou, tudo se recalcula: ritual, ceu, reflexao, afirmacao.
   * `hoy` fixo desliga a virada de proposito — quem congelou o dia quer o dia
   * congelado. */
  useEffect(() => {
    if (esDiaValido(hoy)) return undefined;
    if (!navigation || typeof navigation.addListener !== 'function') return undefined;
    return navigation.addListener('focus', () => {
      /* O PEDIDO DO MAPA MANDA. A primeira versao deste listener cravava
       * diaLocal() em todo foco — e matava o perdao de ontem: tocar na casa de
       * ontem navegava com { dia }, o foco disparava logo depois e sobrescrevia
       * o pedido (achado do /code-review de 01/09). Agora o param e lido AQUI,
       * validado pela MESMA regra (diaAindaAbre), e consumido via setParams
       * para nao pegar o proximo foco de carona. */
      const agora = diaLocal();
      const pedido = route && route.params ? route.params.dia : null;
      if (pedido && diaAindaAbre(pedido, agora)) {
        if (typeof navigation.setParams === 'function') navigation.setParams({ dia: undefined });
        setDia((anterior) => (anterior === pedido ? anterior : pedido));
        return;
      }
      /* Sem pedido: so recoloca em hoje se o dia mostrado DEIXOU de abrir —
       * um ontem aberto de proposito sobrevive ao foco; um anteontem (o dia
       * virou de novo) nao. */
      setDia((anterior) => (diaAindaAbre(anterior, agora) ? anterior : agora));
    });
  }, [navigation, hoy, route]);

  /* --- OS DOIS MOTORES -----------------------------------------------------------
   * Os dois sao puros e sincronos, e nenhum dos dois lanca. Memoizados pelo dia e
   * pelas respostas: sem isso o plano seria recomposto a cada tecla digitada no
   * campo da reflexao. */
  const plano = useMemo(
    () => planoDoDia(respuestas || {}, { hoy: dia }),
    [respuestas, dia]
  );
  /* `ritualSeguroDoDia`, NUNCA `ritualDoDia` direto. Este e o gesto que a tela
   * desenha em destaque, e ele passa pela mesma rede de contato que o resto do
   * plano quando ela respondeu 'le-escribi-no-responde', 'cero-contacto' ou
   * bloqueio. Trocar por `ritualDoDia` aqui devolve a versao crua do catalogo a
   * tela de quem esta sem contato — que foi exatamente o buraco que este arquivo
   * teve por meses, com a rede ligada no ritual de datos/plano.js, que a tela nao
   * desenha. Depende de `respuestas`, entao entra na lista de dependencias. */
  const ritual = useMemo(
    () => ritualSeguroDoDia(dia, respuestas || {}, { estreia: estreia === true }),
    [dia, respuestas, estreia]
  );

  /* O motivo tecnico e as guardas que dispararam vao para o console em __DEV__ e
   * para lugar nenhum mais. `guardasDisparadas` nao vazia significa que alguem
   * escreveu em datos/plano.js uma frase que a rede de lib/plano.js precisou
   * retirar — a tela ficou correta, e o conserto e no catalogo. Rede que salva em
   * silencio e rede que ninguem conserta. */
  useEffect(() => {
    if (!__DEV__ || !plano) return;
    if (plano.ceuMotivoTecnico) {
      console.log('[Plano] sem ceu hoje:', plano.ceuMotivoTecnico);
    }
    if (plano.guardasDisparadas && plano.guardasDisparadas.length > 0) {
      console.warn(
        '[Plano] a guarda de contato retirou texto de:',
        plano.guardasDisparadas.join(', '),
        '— conserte a frase em datos/plano.js.'
      );
    }
    /* O ritual rotativo tem a lista DELE, e ela aponta para o outro catalogo. Os
       dois avisos ficam separados de proposito: quem for consertar precisa saber
       em qual dos dois arquivos a frase esta escrita. */
    if (ritual.guardasDisparadas && ritual.guardasDisparadas.length > 0) {
      console.warn(
        '[Plano] a guarda de contato retirou texto do ritual de hoje:',
        ritual.guardasDisparadas.join(', '),
        '— conserte a frase em datos/rituais.js.'
      );
    }
  }, [plano, ritual]);

  /* --- GRAVAR A REFLEXAO ---------------------------------------------------------
   * `guardarSeguro` devolve false quando ficou so na memoria da sessao. A tela
   * avisa, porque descobrir na proxima abertura que o texto sumiu e pior do que
   * saber na hora. Nunca lanca. */
  const grabar = useCallback(
    async (texto) => {
      const ok = await guardarSeguro(CLAVE_PLANO, JSON.stringify({ dia, texto }));
      if (!montado.current) return;
      setFalloDisco(ok === false);
    },
    [dia]
  );

  const alEscribir = useCallback(
    (texto) => {
      const recortado = texto.slice(0, MAX_RESPOSTA);
      setRespostaReflexao(recortado);
      setEstadoReflexao('escrevendo');
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => {
        temporizador.current = null;
        grabar(recortado).then(() => {
          if (montado.current) setEstadoReflexao('guardado');
        });
      }, MS_GRABAR);
    },
    [grabar]
  );

  /* O campo do sonho: mesmo padrao (debounce + blur), outra chave, outro teto —
   * sonho e mais longo que reflexao. */
  const temporizadorSonho = useRef(null);
  const gravarSonho = useCallback(
    async (texto) => {
      const ok = await guardarSonho(dia, texto);
      if (!montado.current) return;
      setFalloDisco(ok === false);
      setEstadoSonho('guardado');
    },
    [dia]
  );
  const alEscribirSonho = useCallback(
    (texto) => {
      const recortado = texto.slice(0, MAX_SONHO);
      setTextoDoSonho(recortado);
      setEstadoSonho('escrevendo');
      if (temporizadorSonho.current) clearTimeout(temporizadorSonho.current);
      temporizadorSonho.current = setTimeout(() => {
        temporizadorSonho.current = null;
        gravarSonho(recortado);
      }, MS_GRABAR);
    },
    [gravarSonho]
  );
  const alSairDoSonho = useCallback(() => {
    if (temporizadorSonho.current) {
      clearTimeout(temporizadorSonho.current);
      temporizadorSonho.current = null;
    }
    gravarSonho(textoDoSonho);
  }, [gravarSonho, textoDoSonho]);

  const alSalirDelCampo = useCallback(() => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
    grabar(respostaReflexao).then(() => {
      if (montado.current) setEstadoReflexao('guardado');
    });
  }, [grabar, respostaReflexao]);

  /* --- NAVEGACAO -----------------------------------------------------------------
   * Devolve se a navegacao aconteceu. Sem navegador montado o app fica onde esta
   * em vez de quebrar — a tela tem de desenhar inteira num screenshot de loja. */
  const ir = useCallback(
    (ruta) => {
      if (!navigation || typeof navigation.navigate !== 'function') return false;
      navigation.navigate(ruta);
      return true;
    },
    [navigation]
  );

  /* --- COMPARTILHAR --------------------------------------------------------------
   * Cancelar nao e falha (o proprio Share resolve com dismissedAction), entao so um
   * erro de verdade chega ao catch — e no react-native-web a folha do sistema pode
   * simplesmente nao existir. Nos dois casos a tela diz uma linha e segue viva. */
  const ceu = linhaDoCeu(plano);
  const cabecera = linhaDoDia(plano);
  const travado = plano.encontro.estado === ESTADOS_ENCONTRO.TRAVADO;


  /* --- o ritmo de voces dois: os derivados ---------------------------------------
   * Sexta pelo DIA DO PLANO ('YYYY-MM-DD' local), convertida em UTC de
   * proposito: `new Date('2026-09-04')` ja e UTC por spec, e getDay() local em
   * cima disso vira quinta em meio mundo. Date.UTC + getUTCDay nao tem fuso. */
  const ehSexta = useMemo(() => {
    const [a, m, d] = String(dia).split('-').map(Number);
    return new Date(Date.UTC(a, m - 1, d)).getUTCDay() === 5;
  }, [dia]);
  const signoDela = useMemo(() => (respuestas ? signoDe(respuestas) : null), [respuestas]);
  const ritmo = useMemo(
    () => (ehSexta && signoDela && signoDaPessoa ? ritmoDoPar(signoDela, signoDaPessoa) : null),
    [ehSexta, signoDela, signoDaPessoa]
  );

  /* --- O DIA EM PASSOS -------------------------------------------------------------
   * Feedback do dono no aparelho real (01/09): "muito cheio de coisa o dia um,
   * teria que ser mais objetivo, mais interativo". O dia revelado deixa de ser
   * um paredao de blocos e vira uma SEQUENCIA: um cartao por vez, botao grande
   * de seguir, pontinhos de progresso — o molde do Heat Game/Celeste ("um
   * minuto, uma frase, um passo").
   *
   * `etapa` = indice na lista de ETAPAS; null = pagina completa (reabertura de
   * um dia ja raspado mostra tudo de uma vez — o wizard e rito de PRIMEIRA
   * revelacao, nao pedagio eterno). aoRasparODia liga o wizard. */
  const [etapa, setEtapa] = useState(null);

  /* --- O ATO EFETIVO ---------------------------------------------------------------
   * O calendario (lib/atoDoDia.js) diz o TIPO do dia; as capacidades dizem o
   * que da para MOSTRAR: ritmo pede signo dado e "hoje nao" destravado,
   * encontro pede as respostas carregadas E contato que nao esteja duro (um
   * convite trancado nao pode ser o unico ato do dia), missao pede a propria
   * missao. O que nao se sustenta cai no gesto — o dia mais seguro do app.
   * ESTA e a unica derivacao: ETAPAS, ponte do fio, deixa, fresta e o card
   * de compartilhar leem daqui. Re-derivar a mao em dois lugares foi o que o
   * /code-review de 03/09 pegou divergindo. */
  const atoEfetivo = useMemo(() => {
    if (ato === 'missao' && missao) return 'missao';
    if (ato === 'pergunta') return 'pergunta';
    if (ato === 'ritmo' && ehSexta && signoDela && !ritmoFechado) return 'ritmo';
    if (ato === 'encontro' && listo && !travado) return 'encontro';
    return 'gesto';
  }, [ato, missao, ehSexta, signoDela, ritmoFechado, listo, travado]);

  /* A fresta de amanha promete pelo MESMO criterio (so capacidades
   * persistentes — o "hoje nao" da sexta e da sessao e nao adivinha amanha):
   * prometer 'ritmo' a quem nao tem signo e entregar gesto quebraria
   * convite-nunca-promessa pelo tipo errado. */
  const atoAmanha = useMemo(() => {
    const d2 = diaSeguinte(dia);
    const a = atoDoDia(d2);
    if (a === 'ritmo' && !signoDela) return 'gesto';
    if (a === 'encontro' && travado) return 'gesto';
    if (a === 'missao' && !missaoDoDia(d2, lunacao, respuestas || {})) return 'gesto';
    return a;
  }, [dia, signoDela, travado, lunacao, respuestas]);

  /* O DIA E UMA COISA SO: frase -> fio de ontem -> O ATO -> coracao ->
   * amanha. A frase vem ANTES do fio de proposito: e ela o teaser sob o veu,
   * e abrir nela mantem o cartao raspado em cena no quadro da revelacao. */
  const ETAPAS = useMemo(() => {
    const lista = [];
    if (frase) lista.push('frase');
    if (deixa) lista.push('fio');
    lista.push(atoEfetivo === 'gesto' ? 'ritual' : atoEfetivo);
    lista.push('coracao');
    lista.push('amanha');
    return lista;
  }, [frase, deixa, atoEfetivo]);

  /* `etapa` e o NOME da etapa (ou null = pagina completa), nunca um indice:
   * a lista muda quando a deixa chega do disco no meio do wizard, e um
   * indice deslocava o cartao debaixo do dedo (achado do /code-review). */
  const naEtapa = useCallback(
    (id) => ETAPAS.includes(id) && (etapa === null || etapa === id),
    [etapa, ETAPAS]
  );

  /* A linha que o dia deixa na corrente, POR ATO EFETIVO. Pergunta sem
   * resposta devolve vazio — e vazio nao grava (lib/corrente.js), entao o
   * elo anterior sobrevive em vez de virar o nome de um gesto que o dia
   * nunca mostrou. */
  const textoDaDeixa = useCallback(() => {
    if (atoEfetivo === 'pergunta') return respostaReflexao.trim();
    if (atoEfetivo === 'missao') return missao ? missao.titulo : '';
    if (atoEfetivo === 'ritmo') return t('plano.ato.ritmo');
    if (atoEfetivo === 'encontro') return t('plano.ato.encontro');
    return ritual && ritual.nome ? ritual.nome : '';
  }, [atoEfetivo, respostaReflexao, missao, ritual]);

  /* Handler puro por fora, efeito por fora do updater: gravar dentro de
   * setEtapa rodava em replays do React sem commit (achado do /code-review). */
  const avancarEtapa = useCallback(() => {
    if (etapa === null) return;
    const i = ETAPAS.indexOf(etapa);
    if (i === -1) {
      // A etapa saiu da lista sob os pes (troca async raridade): a pagina
      // completa e o chao seguro; o fecho de verdade grava a deixa.
      setEtapa(null);
      return;
    }
    if (i + 1 < ETAPAS.length) {
      setEtapa(ETAPAS[i + 1]);
      return;
    }
    guardarDeixa(dia, atoEfetivo, textoDaDeixa()).catch(() => {});
    /* (fecharNoCirculo saiu com o Circulo — 11/09/2026.) */
    /* O CARIMBO: a recompensa do fechamento — aparece e some sozinho. */
    setCarimbo(true);
    setTimeout(() => {
      if (montado.current) setCarimbo(false);
    }, 1700);
    setEtapa(null);
  }, [etapa, ETAPAS, dia, atoEfetivo, textoDaDeixa]);

  /* Compartilhar mora aqui (depois do atoEfetivo) porque o card agora
   * respeita o ato do dia. */
  const compartir = useCallback(async () => {
    setFalloCompartir(false);
    const mensaje = textoParaCompartir(plano, ritual, atoEfetivo);
    try {
      await Share.share({ message: mensaje });
    } catch {
      if (montado.current) setFalloCompartir(true);
    }
  }, [plano, ritual, atoEfetivo]);

  /* O destino do gesto de hoje, quando ele tem tela. `undefined` nos dois rituais
   * que acontecem fora do telefone — e ai o cartao nao ganha botao nenhum. A chave
   * do rotulo e derivada do id, nunca digitada duas vezes. */
  // Passa por destinoDoRitual() e nao pelo mapa cru: cafe e mao voltam null ate
  // a solda com as telas do Cosmic Guide (ver ★ PONTO DE SOLDA, la em cima).
  const destino = destinoDoRitual(ritual.id);
  const rotuloDestino = `plano.tela.ritual.abrir.${ritual.id}`;

  return (
    <View style={estilos.pantalla}>
      {/* HiloFondo e IRMAO do conteudo, nunca pai: ignora children e tem
          pointerEvents 'none'. 'tenso' porque esta e a tela do dia em curso. */}
      <HiloFondo variante="tenso" />

      <SafeAreaView style={estilos.seguro}>
        <KeyboardAvoidingView
          style={estilos.seguro}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={estilos.contenido}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* ---------------------------------------------------------------
                1. A DATA E A LINHA DO CEU
                A data e o regente do dia sao aritmetica de calendario: existem
                sempre. A linha do ceu so aparece quando houve MEDIDA — sem
                efemeride ela nao vira uma frase mais fraca, ela nao existe.
                --------------------------------------------------------------- */}
            <Sobreceja>{t('plano.titulo')}</Sobreceja>
            {cabecera ? <Micro style={estilos.fecha}>{cabecera}</Micro> : null}
            {ceu ? <Cuerpo style={estilos.ceu}>{ceu}</Cuerpo> : null}
            {/* A LUA NO SIGNO DELA — transito medido (lib/luaNoSigno.js):
                2-3 dias por mes o ceu passa pelo signo dela. Descricao,
                nunca promessa. */}
            {signoDela && luaNoSignoDela(dia, signoDela) ? (
              <Cuerpo style={estilos.luaNoSigno}>
                {t('plano.luaNoSigno', { signo: rotuloDoSigno(signoDela) })}
              </Cuerpo>
            ) : null}

            {/* A PORTA DO TABULEIRO. Fantasma e pequena: o mapa e panorama,
                nunca a acao do dia — o solido continua sendo o ritual. */}
            <Pressable
              onPress={() => ir(RUTAS.MAPA_ANO)}
              accessibilityRole="button"
              accessibilityLabel={t('mapa.abrir')}
            >
              <Micro style={estilos.linkMapa}>{t('mapa.abrir')}</Micro>
            </Pressable>

            {/* ---------------------------------------------------------------
                2. O RITUAL DE HOJE — A ACAO DOMINANTE
                O unico cartao com borda viva e o unico <Titulo> da tela. Tudo
                que vem depois e cartao de borda suave, de proposito.
                --------------------------------------------------------------- */}
            {/* -----------------------------------------------------------------
                O VEU: o cartao do ritual nasce coberto pela MESMA lamina do
                funil (components/ScratchRevealCard.js — dica visivel, botao de
                abrir sem raspar e anuncio de leitor de tela vem dela). O
                `resetKey={dia}` rearma o veu quando o dia vira; `revealed` so e
                true com a marca DO DIA lida do disco. Enquanto o disco nao
                respondeu (null), a lamina fica armada — o pior caso e raspar de
                novo, nunca ver aberto o que devia estar coberto. */}
            {raspadoHoje !== true || naEtapa('frase') || naEtapa('ritual') ? (
            <ScratchRevealCard
              revealed={raspadoHoje === true}
              onReveal={aoRasparODia}
              resetKey={dia}
              scratchLabel={t('plano.veu.raspe')}
              tapLabel={t('plano.veu.abrir')}
              revealAnnouncement={t('plano.veu.anuncio')}
            >
            {/* -----------------------------------------------------------------
                O CORPO DO VEU E COMPACTO DE PROPOSITO (bug de celular, 01/09):
                cobrir o cartao inteiro fazia o veu ser mais alto que a tela, e
                como TODO toque no veu vira raspagem, o scroll morria — a parte
                de baixo (e o botao acessivel) ficava inalcancavel, e o limiar
                de raspagem, impossivel. Coberto, o veu e uma carta de altura
                fixa com a FRASE do dia como teaser por baixo do metal; so o
                reveal monta o dia inteiro. */}
            {raspadoHoje !== true ? (
              <View style={estilos.corpoDoVeu}>
                {frase ? <Cuerpo style={estilos.fraseDoDia}>{frase}</Cuerpo> : null}
              </View>
            ) : (
            <View>
            {/* A frase de abertura — revelada JUNTO com o dia, acima do gesto.
                Compartilhavel pelo card do dia; banco em datos/frases.js. */}
            {naEtapa('frase') && frase ? (
              <View style={estilos.bloque}>
                <Rotulo>{t('plano.frase.rotulo')}</Rotulo>
                <Cuerpo style={estilos.fraseDoDia}>{frase}</Cuerpo>
              </View>
            ) : null}
            {naEtapa('ritual') ? (
            <View style={estilos.tarjetaRitual}>
              <Rotulo>{t('plano.tela.ritual.rotulo')}</Rotulo>
              <Titulo accessibilityRole="header" style={estilos.nombreRitual}>
                {ritual.nome}
              </Titulo>

              <Cuerpo style={estilos.gesto}>{ritual.gesto}</Cuerpo>
              <Micro style={estilos.duracion}>
                {t('plano.tela.ritual.duracao', { duracao: ritual.duracao })}
              </Micro>

              <Cuerpo style={estilos.parrafo}>{ritual.abertura}</Cuerpo>

              {/* A VOZ NO GESTO — a mesma voz do funil lendo a abertura acima,
                  palavra por palavra (lib/audios.js, 'ritual-*'). O botao nao
                  renderiza sem arquivo, nao toca sozinho, e o texto continua
                  inteiro na tela: audio e alternativa, nunca substituto. */}
              <BotaoOuvir
                audioId={'ritual-' + ritual.id}
                rotulo={t('plano.tela.ritual.ouvir')}
                style={estilos.botaoOuvirGesto}
              />

              {/* --- OS PASSOS, OU O CONVITE ---------------------------------
                  Tres estados, nao dois. `assina === null` e "ainda lendo o
                  disco" e nao pinta NADA — nem passo nem cadeado —, porque as
                  duas alternativas estariam erradas por um quadro.

                  O rotulo so existe se sobrou passo. A rede de contato pode
                  retirar um passo inteiro do catalogo (ver ritualSeguroDoDia em
                  lib/plano.js), e um "COMO FAZER" seguido de nada seria a tela
                  anunciando uma lista que ela nao tem. Isso vale para os DOIS
                  ramos: sem passo nenhum nao ha o que trancar, e o convite
                  tambem nao aparece. */}
              {ritual.comoFazer.length > 0 && assina !== null ? (
                <>
                  <Rotulo style={estilos.rotuloPasos}>{t('plano.tela.ritual.passos')}</Rotulo>
                  {assina ? (
                    ritual.comoFazer.map((paso, i) => (
                      <View key={`paso-${i}`} style={estilos.paso}>
                        <Micro style={estilos.pasoNumero} tabular>
                          {i + 1}
                        </Micro>
                        <Cuerpo style={estilos.pasoTexto}>{paso}</Cuerpo>
                      </View>
                    ))
                  ) : (
                    <Cuerpo style={estilos.pasoTrancado}>
                      {t('plano.tela.ritual.travado.corpo', { n: ritual.comoFazer.length })}
                    </Cuerpo>
                  )}
                </>
              ) : null}

              {/* --- O CAMPO DO SONHO --------------------------------------
                  So no dia do gesto 'sonho', e so para quem ve os passos: os
                  passos mandam ESCREVER, e um cartao que manda escrever sem
                  dar onde e promessa sem entrega (bug achado pelo dono em
                  01/09). O texto e guardado POR DIA em lib/registroDoSonho.js
                  — o fecho promete "daqui a um mes ainda vai estar aqui", e
                  agora isso e verdade. */}
              {ritual.id === 'sonho' && assina === true ? (
                <>
                  <TextInput
                    style={[estilos.campo, textoDoSonho.length > 0 && estilos.campoVivo]}
                    value={textoDoSonho}
                    onChangeText={alEscribirSonho}
                    onBlur={alSairDoSonho}
                    placeholder={t('plano.sonho.placeholder')}
                    placeholderTextColor={colores.ceniza}
                    selectionColor={colores.hilo}
                    multiline
                    textAlignVertical="top"
                    maxLength={MAX_SONHO}
                    accessibilityLabel={t('plano.sonho.placeholder')}
                  />
                  <Micro
                    accessibilityLiveRegion="polite"
                    style={[estilos.nota, estadoSonho === 'guardado' && estilos.notaGuardado]}
                  >
                    {estadoSonho === 'escrevendo'
                      ? t('plano.campo.escrevendo')
                      : estadoSonho === 'guardado'
                        ? t('plano.campo.guardado')
                        : t('plano.sonho.nota')}
                  </Micro>
                </>
              ) : null}

              {/* A camera aparece num unico ritual, e a nota diz para onde a foto
                  vai. Desde a solda (★ la em cima) ela vai para a leitura da borra
                  do COSMIC, que analisa a imagem — entao esta nota deixou de dizer
                  "nada analisa a foto", que virou mentira colada no botao que faz
                  exatamente isso. Ela fica ACIMA do botao de proposito: o aviso do
                  que a foto vai fazer tem de ser lido antes do toque, nao depois. */}
              {ritual.precisaCamera ? (
                <Micro style={estilos.nota}>{t('plano.tela.ritual.camera')}</Micro>
              ) : null}

              {/* O UNICO BOTAO SOLIDO DA TELA, e ele so existe nos tres gestos
                  que tem destino (ver destinoDoRitual e ★ PONTO DE SOLDA, la em cima). O
                  plano abre a tela que ja existe em vez de reinventar a mecanica;
                  nos dois dias restantes o gesto acontece fora do aparelho e o
                  cartao fica sem botao, de proposito. */}
              {assina === null ? null : assina ? (
                destino ? (
                  <BotonPrimario
                    titulo={t(rotuloDestino)}
                    onPress={() => ir(destino)}
                    style={estilos.boton}
                  />
                ) : null
              ) : (
                /* O rotulo diz o que o toque ABRE — e ele abre o paywall, nao os
                   passos. "Ver como se faz" seria o botao prometendo a tela
                   seguinte errada. Mesma regra de 'plano.tela.ritual.abrir.*'. */
                <BotonPrimario
                  titulo={t('plano.tela.ritual.travado.boton')}
                  onPress={() => ir(RUTAS.PAYWALL)}
                  style={estilos.boton}
                />
              )}

              {etapa === null ? (
              <Micro style={estilos.cierre}>{ritual.fecho}</Micro>
              ) : null}

              {/* O RECIBO. Quatro dos cinco rituais tem obra, autor e ano; o
                  quinto declara a ausencia em voz alta. Ausencia declarada e
                  diferente de ausencia escondida — e e por isso que o ramo do
                  `naoTemFonte` existe em vez de o bloco simplesmente sumir. */}
              {etapa === null && ritual.fonte ? (
                <View style={estilos.recibo}>
                  <Fuente>
                    {t('plano.tela.ritual.fonte', {
                      obra: ritual.fonte.obra,
                      autor: ritual.fonte.autor,
                      quando: ritual.fonte.quando,
                    })}
                  </Fuente>
                  <Micro style={estilos.notaFuente}>{ritual.fonte.nota}</Micro>
                </View>
              ) : etapa === null ? (
                <View style={estilos.recibo}>
                  <Micro style={estilos.notaFuente}>{ritual.naoTemFonte}</Micro>
                </View>
              ) : null}
            </View>
            ) : null}
            </View>
            )}
            </ScratchRevealCard>
            ) : null}

            {/* ---------------------------------------------------------------
                A ORDEM CERTA — a orquestracao do dono, no molde do Heat Game:
                nada abaixo do veu existe enquanto ele nao foi raspado. Primeiro
                o fazer (o ritual revelado), depois o escrever, a frase, o
                encontro, o ritmo e a saida de compartilhar. `=== true` e nao
                verdade solta: null (disco lendo) tambem esconde, senao a tela
                piscaria o resto por um quadro antes de cobrir. */}
            {raspadoHoje === true ? (
            <>
            {/* ---------------------------------------------------------------
                O FIO DE ONTEM — a corrente entre os dias (lib/corrente.js).
                A linha dela volta LITERAL, entre aspas; a ponte so anuncia o
                TIPO de hoje. Nenhuma palavra do app comenta o conteudo.
                --------------------------------------------------------------- */}
            {naEtapa('fio') && deixa ? (
              <View style={estilos.bloque}>
                <Rotulo>{t('plano.fio.rotulo')}</Rotulo>
                <Cuerpo style={estilos.pregunta}>{t('plano.fio.abre')}</Cuerpo>
                <Cuerpo style={estilos.deixaTexto}>
                  {'\u201C' + deixa.texto + '\u201D'}
                </Cuerpo>
                <Micro style={estilos.nota}>{t('plano.fio.ponte.' + atoEfetivo)}</Micro>
              </View>
            ) : null}
            {/* ---------------------------------------------------------------
                A MISSAO DE HOJE — a camada de reconquista (cronogramacao 01/09).
                Anatomia do aceite (3S): acao + porque + "Aceito" + "Cumpri" +
                nota 0-10. A rede de contato ja escolheu a missao em
                lib/missaoDoDia.js — quem esta em contato duro NUNCA recebe
                missao que aponte para fora, e o aviso curto diz isso.
                --------------------------------------------------------------- */}
            {naEtapa('missao') && missao ? (
              <View style={estilos.bloqueVivo}>
                <Rotulo>{t('plano.missao.rotulo')}</Rotulo>
                <Titulo style={estilos.missaoTitulo}>{missao.titulo}</Titulo>
                <Cuerpo style={estilos.parrafo}>{missao.acao}</Cuerpo>
                <Rotulo style={estilos.rotuloRitmo}>{t('plano.missao.porque')}</Rotulo>
                <Cuerpo style={estilos.parrafo}>{missao.porque}</Cuerpo>
                {travado ? (
                  <Micro style={estilos.nota}>{t('plano.missao.travadaContato')}</Micro>
                ) : null}

                {!missaoEstado ? null : !missaoEstado.aceita ? (
                  <BotonPrimario
                    titulo={t('plano.missao.aceitar')}
                    onPress={() => mudarMissao({ aceita: true })}
                    style={estilos.boton}
                  />
                ) : !missaoEstado.cumprida ? (
                  <BotonPrimario
                    titulo={t('plano.missao.cumpri')}
                    onPress={() => mudarMissao({ cumprida: true })}
                    style={estilos.boton}
                  />
                ) : (
                  <>
                    <Micro style={estilos.nota}>{t('plano.missao.comoFoi')}</Micro>
                    <View style={estilos.notasMissao}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <Pressable
                          key={'nota-' + n}
                          onPress={() => mudarMissao({ nota: n })}
                          accessibilityRole="button"
                          style={[
                            estilos.notaChip,
                            missaoEstado.nota === n ? estilos.notaChipViva : null,
                          ]}
                        >
                          <Micro
                            tabular
                            style={missaoEstado.nota === n ? estilos.notaChipTextoVivo : estilos.notaChipTexto}
                          >
                            {n}
                          </Micro>
                        </Pressable>
                      ))}
                    </View>
                    {missaoEstado.nota != null ? (
                      <Micro style={estilos.notaGuardado}>{t('plano.missao.guardada')}</Micro>
                    ) : null}
                  </>
                )}
              </View>
            ) : null}

            {/* ---------------------------------------------------------------
                3. A REFLEXAO, COM CAMPO
                A pergunta e sempre sobre ELA — nenhuma pergunta pelo que a outra
                pessoa pensa, que e a pergunta que o app nao tem como responder e
                que, feita todo dia, vira ruminacao.
                --------------------------------------------------------------- */}
            {naEtapa('pergunta') ? (
            <View style={estilos.bloque}>
              <Rotulo>{t('plano.tela.reflexao.rotulo')}</Rotulo>
              <Cuerpo style={estilos.pregunta}>{plano.reflexao}</Cuerpo>

              <TextInput
                style={[estilos.campo, respostaReflexao.length > 0 && estilos.campoVivo]}
                value={respostaReflexao}
                onChangeText={alEscribir}
                onBlur={alSalirDelCampo}
                placeholder={t('plano.tela.reflexao.placeholder')}
                placeholderTextColor={colores.ceniza}
                selectionColor={colores.hilo}
                multiline
                textAlignVertical="top"
                maxLength={MAX_RESPOSTA}
                accessibilityLabel={plano.reflexao}
              />

              <Micro
                accessibilityLiveRegion="polite"
                style={[estilos.nota, estadoReflexao === 'guardado' && estilos.notaGuardado]}
              >
                {estadoReflexao === 'escrevendo'
                  ? t('plano.campo.escrevendo')
                  : estadoReflexao === 'guardado'
                    ? t('plano.campo.guardado')
                    : t('plano.tela.reflexao.nota')}
              </Micro>
              {falloDisco ? (
                <Micro style={estilos.aviso}>{t('plano.tela.reflexao.falhou')}</Micro>
              ) : null}
            </View>

            ) : null}

            {/* ---------------------------------------------------------------
                4. A AFIRMACAO
                Sempre no presente. Afirmacao no futuro e promessa com outra
                roupa, e promessa e o que este produto nao vende.
                --------------------------------------------------------------- */}
            {naEtapa('coracao') ? (
            <View style={estilos.bloque}>
              <Rotulo>{t('plano.tela.afirmacao.rotulo')}</Rotulo>
              <Cuerpo style={estilos.afirmacion}>{plano.afirmacao}</Cuerpo>
            </View>
            ) : null}

            {/* ---------------------------------------------------------------
                O CORACAO DE HOJE — um toque, tres estados, placar que CONTA e
                nunca qualifica (lib/coracao.js; espirito do checkin do Cosmic
                Guide: "o dado e dela, o grafico e dela"). Tocar de novo troca.
                --------------------------------------------------------------- */}
            {naEtapa('coracao') ? (
            <View style={estilos.bloque}>
              <Rotulo>{t('plano.coracao.rotulo')}</Rotulo>
              <Cuerpo style={estilos.pregunta}>{t('plano.coracao.pergunta')}</Cuerpo>
              <View style={estilos.coracoes}>
                {HUMORES.map((h) => (
                  <Pressable
                    key={h}
                    onPress={() => tocarCoracao(h)}
                    accessibilityRole="button"
                    accessibilityLabel={t('plano.coracao.' + h)}
                    style={[estilos.coracaoBoton, coracaoHoje === h ? estilos.coracaoVivo : null]}
                  >
                    <Cuerpo>{h === 'leve' ? '\u{1F49B}' : h === 'neutro' ? '\u{1F60C}' : '\u{1F327}\u{FE0F}'}</Cuerpo>
                    <Micro style={coracaoHoje === h ? estilos.notaChipTextoVivo : estilos.notaChipTexto}>
                      {t('plano.coracao.' + h)}
                    </Micro>
                  </Pressable>
                ))}
              </View>
              {placar && placar.semana.registrados > 0 ? (
                <Micro style={estilos.nota}>
                  {t('plano.coracao.placar', {
                    n: placar.semana.leve,
                    total: placar.semana.registrados,
                    antes: placar.anterior.leve,
                  })}
                </Micro>
              ) : (
                <Micro style={estilos.nota}>{t('plano.coracao.nota')}</Micro>
              )}

              {/* --- A APOSTA DE AMANHA --------------------------------------
                  So aparece com o coracao de hoje registrado. A revelacao de
                  hoje vem primeiro (se houve); depois, a aposta nova — a de
                  hoje fica guardada e NUNCA se revela no ato. */}
              {coracaoHoje ? (
                <>
                  {revelacao ? (
                    <>
                      <Cuerpo style={estilos.apostaFrase}>
                        {t('coracao.aposta.' + revelacao.apostou + '.' + revelacao.chegou)}
                      </Cuerpo>
                      {acertos > 0 ? (
                        <Micro style={estilos.nota}>
                          {t('coracao.aposta.acertos', { n: acertos })}
                        </Micro>
                      ) : null}
                    </>
                  ) : null}
                  {aposta && aposta.feitaEm === dia ? (
                    <Micro style={estilos.notaGuardado}>{t('coracao.aposta.guardada')}</Micro>
                  ) : !aposta ? (
                    <>
                      <Rotulo style={estilos.rotuloRitmo}>{t('coracao.aposta.rotulo')}</Rotulo>
                      <Cuerpo style={estilos.pregunta}>{t('coracao.aposta.convite')}</Cuerpo>
                      <View style={estilos.coracoes}>
                        {HUMORES.map((h) => (
                          <Pressable
                            key={'aposta-' + h}
                            onPress={() => fazerAposta(h)}
                            accessibilityRole="button"
                            accessibilityLabel={t('plano.coracao.' + h)}
                            style={estilos.coracaoBoton}
                          >
                            <Cuerpo>
                              {h === 'leve' ? '\u{1F49B}' : h === 'neutro' ? '\u{1F60C}' : '\u{1F327}\u{FE0F}'}
                            </Cuerpo>
                            <Micro style={estilos.notaChipTexto}>{t('plano.coracao.' + h)}</Micro>
                          </Pressable>
                        ))}
                      </View>
                    </>
                  ) : null}
                </>
              ) : null}
            </View>
            ) : null}

            {/* ---------------------------------------------------------------
                5. A ACAO DO DIA — OU O BLOCO TRAVADO
                Um renderizador so, dois estados, a MESMA forma de objeto vinda
                de lib/plano.js. Travado NAO e escondido: esconder ensinaria que
                o app tem um andar secreto. Ele aparece, com o motivo escrito, e
                nao carrega nenhum pedaco da acao — nem em campo auxiliar, nem
                "para quando destravar".

                Quem destrava e ela, mudando a resposta sobre o contato em
                Ajustes. Por isso o botao fantasma leva exatamente para la: o
                texto do bloco diz onde fica a chave, e a tela poe a chave a um
                toque em vez de mandar procurar.
                --------------------------------------------------------------- */}
            {/* `listo` GATEIA ESTE BLOCO E SO ESTE. Enquanto o disco nao voltou,
                o app nao sabe o que ela respondeu sobre o contato — e o padrao de
                lib/plano.js para "nao declarado" e a acao liberada. Desenhar antes
                de saber mostraria a acao de encontro por uma fracao de segundo
                para quem esta sem contato, que e o pior frame que este app pode
                desenhar. O resto da tela nao espera nada: ritual, ceu, reflexao e
                afirmacao nao dependem das respostas. */}
            {listo ? (
              <>
                {/* --- O RITMO DE VOCES DOIS — so na sexta, dia de Venus -------
                    O unico bloco do plano que fala da outra pessoa; as regras
                    estao no comentario de 'plano.ritmo.*' em datos/textos.js.
                    Ele exige `signoDela` (sem nascimento respondido nao ha par a
                    ler) e mora DENTRO de `listo` porque o paragrafo pratico
                    ('QUANDO HOUVER CONVERSA') obedece ao mesmo `travado` do
                    encontro — desenhar antes de saber o contato mostraria
                    instrucao de conversa a quem esta em contato zero. */}
                {naEtapa('ritmo') && ehSexta && signoDela && !ritmoFechado ? (
                  <View style={estilos.bloque}>
                    <Rotulo>{t('plano.ritmo.rotulo')}</Rotulo>
                    <Micro style={estilos.venusRitmo}>{t('plano.ritmo.venus')}</Micro>
                    {ritmo ? (
                      <>
                        <Cuerpo style={estilos.parRitmo}>
                          {t('plano.ritmo.par', {
                            dela: rotuloDoSigno(signoDela),
                            daPessoa: rotuloDoSigno(signoDaPessoa),
                            figura: ritmo.nomeAspecto,
                          })}
                        </Cuerpo>

                        <Rotulo style={estilos.rotuloRitmo}>{t('plano.ritmo.cama')}</Rotulo>
                        <Cuerpo style={estilos.parrafo}>{ritmo.cama}</Cuerpo>
                        <Micro style={estilos.figuraRitmo}>{ritmo.camaFigura}</Micro>

                        <Rotulo style={estilos.rotuloRitmo}>{t('plano.ritmo.conversa')}</Rotulo>
                        <Cuerpo style={estilos.parrafo}>{ritmo.conversa}</Cuerpo>

                        <Rotulo style={estilos.rotuloRitmo}>{t('plano.ritmo.briga')}</Rotulo>
                        <Cuerpo style={estilos.parrafo}>{ritmo.briga}</Cuerpo>

                        {/* O paragrafo pratico cala quando o contato esta duro —
                            a MESMA regra do bloco do encontro, pelo MESMO
                            `travado`. A leitura do par continua (fala do ritmo,
                            nao manda falar); o que some e a instrucao de
                            conversa. */}
                        {!travado ? (
                          <>
                            <Rotulo style={estilos.rotuloRitmo}>{t('plano.ritmo.falar')}</Rotulo>
                            <Cuerpo style={estilos.parrafo}>{ritmo.comoFalar}</Cuerpo>
                          </>
                        ) : null}

                        <Micro style={estilos.limitesRitmo}>{t('plano.ritmo.limites')}</Micro>

                        <View style={estilos.recibo}>
                          <Fuente>{t('plano.ritmo.fonte')}</Fuente>
                          <Micro style={estilos.notaFuente}>{t('plano.ritmo.fonteNota')}</Micro>
                        </View>

                        <Pressable onPress={trocarSigno} accessibilityRole="button">
                          <Micro style={estilos.acaoRitmo}>{t('plano.ritmo.trocar')}</Micro>
                        </Pressable>
                      </>
                    ) : (
                      <>
                        <Cuerpo style={estilos.parrafo}>{t('plano.ritmo.convite')}</Cuerpo>
                        <View style={estilos.signosRitmo}>
                          {SIGNOS.map((s) => (
                            <Pressable
                              key={s}
                              onPress={() => darSigno(s)}
                              accessibilityRole="button"
                              style={estilos.signoBoton}
                            >
                              {/* `darSigno(s)` acima recebe o CANONICO — e o que
                                  `guardarSignoDaPessoa` valida por indiceDoSigno e
                                  o que vai para o disco. So o botao leva rotulo. */}
                              <Micro style={estilos.signoTexto}>{rotuloDoSigno(s)}</Micro>
                            </Pressable>
                          ))}
                        </View>
                        <Pressable
                          onPress={() => setRitmoFechado(true)}
                          accessibilityRole="button"
                        >
                          <Micro style={estilos.acaoRitmo}>{t('plano.ritmo.naoHoje')}</Micro>
                        </Pressable>
                      </>
                    )}
                  </View>
                ) : null}

                {naEtapa('encontro') ? (
                <View style={travado ? estilos.bloque : estilos.bloqueVivo}>
                  <Rotulo>{plano.encontro.titulo}</Rotulo>
                  {travado ? (
                    <Sobreceja style={estilos.selo}>{t('plano.tela.encontro.travado')}</Sobreceja>
                  ) : null}

                  <Cuerpo style={estilos.pregunta}>{plano.encontro.texto}</Cuerpo>

                  {/* NENHUMA ANCORA DE CEU ENTRA NESTE CARTAO, e a ausencia e o
                      contrato. Havia aqui uma linha com o marco lunar medido
                      ("Se for para escolher o dia: Lua Nova cai na sexta-feira,
                      dia 11") logo abaixo da acao de encontro. As duas frases
                      eram verdadeiras em separado; encostadas, afirmavam que a
                      Lua e criterio para escolher o dia de um encontro com outra
                      pessoa — que e previsao vestida de descricao, e nenhum campo
                      de lib/plano.js mede isso. O marco continua no alto desta
                      tela (`linhaDoCeu`), onde descreve o DIA. Ver o cabecalho de
                      `encontroDoDia` em lib/plano.js antes de reabrir isto. */}

                  {travado ? (
                    <BotonPrimario
                      titulo={t('plano.tela.encontro.ajustes')}
                      onPress={() => ir(RUTAS.AJUSTES)}
                      variante="fantasma"
                      style={estilos.boton}
                    />
                  ) : null}
                </View>

                ) : null}

                {/* O SABADO TRAVADO: com um-dia-um-ato o convite trancado nao
                    pode ser o unico ato (o dia cai no gesto), mas travado NAO
                    e escondido — na pagina completa o bloco aparece com o
                    motivo e a chave de Ajustes, como sempre. */}
                {etapa === null && ato === 'encontro' && travado ? (
                  <View style={estilos.bloque}>
                    <Rotulo>{plano.encontro.titulo}</Rotulo>
                    <Sobreceja style={estilos.selo}>{t('plano.tela.encontro.travado')}</Sobreceja>
                    <Cuerpo style={estilos.pregunta}>{plano.encontro.texto}</Cuerpo>
                    <BotonPrimario
                      titulo={t('plano.tela.encontro.ajustes')}
                      onPress={() => ir(RUTAS.AJUSTES)}
                      variante="fantasma"
                      style={estilos.boton}
                    />
                  </View>
                ) : null}

                {/* O gesto de contencao existe SO no contato duro: e a frase para
                    o momento em que bate a vontade de dar o passo para fora, e
                    ela e DIARIA — o /code-review pegou o um-dia-um-ato
                    reduzindo-a a um dia por semana. Aparece no fecho do wizard
                    e na pagina completa, todo dia que lib/plano.js a devolver. */}
                {(etapa === null || naEtapa('coracao')) && plano.contencao ? (
                  <Micro style={estilos.contencion}>{plano.contencao}</Micro>
                ) : null}
              </>
            ) : null}

            {/* ---------------------------------------------------------------
                AMANHA — a fresta. So o TIPO do dia e a frase interrompida:
                curiosidade honesta, sem spoiler do gesto (audio 10) e sem
                promessa nenhuma. Se ela faltar, nada disto e cobrado — a
                fresta seguinte e sempre sobre o proximo amanha.
                --------------------------------------------------------------- */}
            {naEtapa('amanha') ? (
              <View style={estilos.bloque}>
                <Rotulo>{t('plano.amanha.rotulo')}</Rotulo>
                <Titulo style={estilos.missaoTitulo}>{t('plano.ato.' + atoAmanha)}</Titulo>
                {fraseAmanha ? (
                  <Cuerpo style={estilos.fraseCortada}>{fraseAmanha}</Cuerpo>
                ) : null}
                <Micro style={estilos.nota}>{t('plano.amanha.nota')}</Micro>
              </View>
            ) : null}

            {/* O CIRCULO (contador, mural, convite) saiu — decisao do dono, 11/09/2026. */}

            {/* ---------------------------------------------------------------
                6. O CARD DO DIA
                Fantasma: compartilhar e uma saida, nao a acao da tela. O solido
                pertence ao ritual, e dois botoes acesos empatariam a hierarquia
                que o resto do arquivo construiu.
                --------------------------------------------------------------- */}
            {etapa === null ? (
            <BotonPrimario
              titulo={t('plano.tela.compartir')}
              onPress={compartir}
              variante="fantasma"
              style={estilos.botonCompartir}
            />
            ) : null}
            {falloCompartir ? (
              <Micro style={estilos.aviso}>{t('plano.tela.compartir.falhou')}</Micro>
            ) : null}

            {/* --- O PASSO ---------------------------------------------------
                So no wizard: os pontinhos dizem onde ela esta, o botao leva ao
                proximo. O ultimo "Fechar o dia" abre a pagina completa. */}
            {etapa !== null
              ? (() => {
                  const idx = ETAPAS.indexOf(etapa);
                  return (
                    <>
                      <View style={estilos.pontos}>
                        {ETAPAS.map((id, i) => (
                          <View
                            key={'ponto-' + id}
                            style={[
                              estilos.ponto,
                              i === idx ? estilos.pontoVivo : null,
                              idx >= 0 && i < idx ? estilos.pontoFeito : null,
                            ]}
                          />
                        ))}
                      </View>
                      <BotonPrimario
                        titulo={
                          idx >= 0 && idx + 1 < ETAPAS.length
                            ? t('plano.passo.seguir')
                            : t('plano.passo.fechar')
                        }
                        onPress={avancarEtapa}
                        style={estilos.boton}
                      />
                    </>
                  );
                })()
              : null}
            </>
            ) : null}

            {/* Espacador: a barra de abas flutua sobre o fundo do app, e sem isto
                o ultimo botao encosta nela em telas curtas. */}
            <View style={estilos.pie} accessibilityElementsHidden pointerEvents="none" />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* O CARIMBO DO FECHAMENTO — um selo que aparece no instante de
            fechar o dia e some sozinho. Nao captura toque nenhum. */}
        {carimbo ? (
          <View pointerEvents="none" style={estilos.carimboFundo}>
            <View style={estilos.carimboSelo}>
              <Cuerpo style={estilos.carimboTexto}>{t('plano.fecho.selo')}</Cuerpo>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

/* ===================================================================================
   ESTILOS
   Nenhum hex, nenhum rgba e nenhum numero de fonte. Medidas saem de `espacio` e
   `radio`; o campo herda tipo.cuerpo, que ja traz familia e tamanho.
   =================================================================================== */
const GROSOR_BORDE = 1;
const ALTO_CAMPO = 110;
const ANCHO_NUMERO = 22;

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  seguro: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: espacio.xl,
    paddingTop: espacio.xl,
    paddingBottom: espacio.xxxl,
    // Em tablet e na web a coluna para de crescer.
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },

  /* --- cabecalho --- */
  fecha: {
    marginTop: espacio.sm,
  },
  // A linha do ceu em papel cheio: e uma medida, e ela e o pedaco do dia que a
  // pessoa veio conferir. Sem ela o bloco nao existe, e o cabecalho encolhe.
  ceu: {
    marginTop: espacio.md,
  },

  /* --- o ritual, a acao dominante --- */
  tarjetaRitual: {
    marginTop: espacio.xl,
    backgroundColor: colores.penumbra,
    borderRadius: radio.lg,
    borderWidth: GROSOR_BORDE,
    // A UNICA borda viva da tela. hilo aqui e borda, nunca texto.
    borderColor: colores.bordeHilo,
    padding: espacio.xl,
  },
  nombreRitual: {
    marginTop: espacio.md,
  },
  gesto: {
    marginTop: espacio.lg,
  },
  duracion: {
    marginTop: espacio.sm,
  },
  parrafo: {
    marginTop: espacio.lg,
  },
  rotuloPasos: {
    marginTop: espacio.xl,
  },
  paso: {
    flexDirection: 'row',
    marginTop: espacio.md,
  },
  pasoNumero: {
    width: ANCHO_NUMERO,
    color: colores.aguja,
  },
  pasoTexto: {
    flex: 1,
  },
  /* O convite ocupa o lugar exato onde os passos estariam, e em FOIL — a cor
   * que o app ja usa para o que se abre pagando. Sem caixa, sem cadeado
   * desenhado, sem tarja: a falta ja e visivel pela lista que nao veio.
   * (11/09/2026, fusao: o TOM e o mesmo metal, mas o token agora e foilTexto —
   * colores.foil e escuro demais para texto em tela escura, 1,5:1. Ver theme.js.) */
  pasoTrancado: {
    color: colores.foilTexto,
    marginTop: espacio.sm,
  },
  /* --- o ritmo de voces dois ------------------------------------------------------ */
  notaGuardado: {
    color: colores.foilTexto,
  },
  /* O corpo do veu coberto: altura fixa que cabe em qualquer celular com a
   * barra e o cabecalho na tela. O metal cobre tudo; a frase e o teaser que
   * o dedo vai descobrindo. */
  pontos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: espacio.xs,
    marginTop: espacio.xl,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colores.bordeSuave,
  },
  pontoVivo: {
    backgroundColor: colores.hilo,
    transform: [{ scale: 1.3 }],
  },
  pontoFeito: {
    backgroundColor: colores.foil,
  },
  corpoDoVeu: {
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.xl,
  },
  /* --- a celula nova ------------------------------------------------------------- */
  botaoOuvirGesto: {
    marginTop: espacio.md,
  },
  /* --- a lua no signo, a aposta e o carimbo --- */
  luaNoSigno: {
    marginTop: espacio.sm,
    color: colores.foilTexto,
  },
  apostaFrase: {
    marginTop: espacio.md,
    color: colores.papel,
  },
  carimboFundo: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carimboSelo: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.nudo,
    borderWidth: 2,
    borderColor: colores.foil,
    ...sombra.halo,
    transform: [{ rotate: '-8deg' }],
  },
  carimboTexto: {
    color: colores.papel,
    textAlign: 'center',
  },
  /* (os estilos do Circulo sairam com ele — 11/09/2026.) */
  /* a citacao da deixa e a frase cortada de amanha */
  deixaTexto: {
    marginTop: espacio.sm,
    color: colores.papel,
    fontStyle: 'italic',
  },
  fraseCortada: {
    marginTop: espacio.sm,
    color: colores.ceniza,
    fontStyle: 'italic',
  },
  fraseDoDia: {
    color: colores.foilTexto,
    fontStyle: 'italic',
  },
  missaoTitulo: {
    marginTop: espacio.xs,
  },
  notasMissao: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: espacio.sm,
    gap: espacio.xs,
  },
  notaChip: {
    minWidth: 34,
    paddingVertical: espacio.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    borderRadius: radio.sm,
  },
  notaChipViva: {
    borderColor: colores.hilo,
    backgroundColor: colores.nudo,
  },
  notaChipTexto: {
    color: colores.ceniza,
  },
  notaChipTextoVivo: {
    color: colores.papel,
  },
  coracoes: {
    flexDirection: 'row',
    gap: espacio.sm,
    marginTop: espacio.md,
  },
  coracaoBoton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: espacio.sm,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    borderRadius: radio.md,
    gap: espacio.xs,
  },
  coracaoVivo: {
    borderColor: colores.hilo,
    backgroundColor: colores.nudo,
  },
  linkMapa: {
    marginTop: espacio.sm,
    color: colores.foilTexto,
  },
  venusRitmo: {
    marginTop: espacio.xs,
    color: colores.ceniza,
  },
  parRitmo: {
    marginTop: espacio.md,
    color: colores.foilTexto,
  },
  rotuloRitmo: {
    marginTop: espacio.lg,
  },
  figuraRitmo: {
    marginTop: espacio.xs,
    color: colores.ceniza,
    fontStyle: 'italic',
  },
  limitesRitmo: {
    marginTop: espacio.lg,
    color: colores.ceniza,
  },
  acaoRitmo: {
    marginTop: espacio.md,
    color: colores.foilTexto,
  },
  signosRitmo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: espacio.md,
    gap: espacio.xs,
  },
  signoBoton: {
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    borderRadius: radio.md,
    paddingVertical: espacio.xs,
    paddingHorizontal: espacio.sm,
  },
  signoTexto: {
    color: colores.papel,
  },
  cierre: {
    marginTop: espacio.xl,
  },
  recibo: {
    marginTop: espacio.lg,
    borderTopWidth: GROSOR_BORDE,
    borderTopColor: colores.bordeSuave,
    paddingTop: espacio.lg,
  },
  notaFuente: {
    marginTop: espacio.sm,
  },

  /* --- os cartoes de baixo, todos de borda suave --- */
  bloque: {
    marginTop: espacio.xl,
    backgroundColor: colores.penumbra,
    borderRadius: radio.md,
    borderWidth: GROSOR_BORDE,
    borderColor: colores.bordeSuave,
    padding: espacio.lg,
  },
  // O encontro liberado ganha a borda viva porque ele TEM acao. O travado fica em
  // `bloque`: visivel, legivel e sem o convite visual de quem pode agir.
  bloqueVivo: {
    marginTop: espacio.xl,
    backgroundColor: colores.penumbra,
    borderRadius: radio.md,
    borderWidth: GROSOR_BORDE,
    borderColor: colores.bordeHilo,
    padding: espacio.lg,
  },
  selo: {
    marginTop: espacio.sm,
  },
  pregunta: {
    marginTop: espacio.md,
  },
  // A afirmacao e a unica linha da tela que ela pode ler em voz alta. Papel cheio
  // e um respiro maior em volta; sem tamanho novo, que so theme.js define.
  afirmacion: {
    marginTop: espacio.md,
    color: colores.papel,
  },
  nota: {
    marginTop: espacio.md,
  },
  aviso: {
    marginTop: espacio.md,
  },
  contencion: {
    marginTop: espacio.lg,
  },

  /* --- campo --- */
  campo: {
    ...tipo.cuerpo,
    marginTop: espacio.lg,
    minHeight: ALTO_CAMPO,
    paddingHorizontal: espacio.lg,
    paddingVertical: espacio.md,
    borderRadius: radio.md,
    borderWidth: GROSOR_BORDE,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.noche,
  },
  campoVivo: {
    borderColor: colores.bordeHilo,
  },

  /* --- acoes --- */
  boton: {
    marginTop: espacio.xl,
  },
  botonCompartir: {
    marginTop: espacio.xxl,
  },
  pie: {
    height: espacio.xl,
  },
});
