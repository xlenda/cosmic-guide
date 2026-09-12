// screens/HiloScreen.js — TELA 4: MI HILO, o painel do progresso sem chantagem.
//
// ===========================================================================
// O QUE ESTA TELA E
// ===========================================================================
// No molde do Heat Game esta e a tela do "Dia de Fogo": a chama, o numero de
// dias seguidos e, quando o dia passa em branco, a chama apagada com a oferta
// de comprar a recuperacao da sequencia. Aquilo funciona porque assusta.
//
// Aqui a metafora muda e, com ela, muda o que acontece no dia ruim. O fio nao
// se apaga: ele para. Um fio parado continua do tamanho que ficou, com todos os
// nos que ja foram atados, esperando. Nao ha nada a recuperar porque nada foi
// perdido — e por isso esta tela NUNCA pode ganhar:
//
//   · chama, vela, brasa ou qualquer imagem de coisa que se apaga;
//   · linguagem de perda ("se rompio", "perdiste", "ya no tienes");
//   · botao, cartao ou convite que venda a volta da sequencia;
//   · numero que o app nao consiga apontar de onde saiu.
//
// O estado parado mostra, nesta ordem exata, o que lib/hilo.js manda: a
// constatacao ('hilo.rachaRota' — "El hilo no se rompio. Se quedo quieto.") e
// logo abaixo o recorde intacto ('hilo.record' — "Tu hilo mas largo sigue
// siendo {n}. Eso no se borra."), em colores.aguja, que e o token de numero e
// destaque do tema. Constatacao mais patrimonio; nunca perda mais oferta.
//
// ===========================================================================
// POR QUE ELA DEIXOU DE SER SO O CONTADOR
// ===========================================================================
// Ate aqui a tela tinha tres coisas — um titulo, uma linha e um botao — e um
// buraco no meio. O dono viu no navegador e reclamou, com razao: no molde este
// lugar e o painel (os sete chips dos dias, o recorde, o resumo), e uma tela de
// retencao que nao mostra o que se acumulou nao retem nada.
//
// O que entrou, de cima para baixo, e o motivo de estar nessa ordem:
//   1. o contador de nos e o recorde        — o que ela ja tem;
//   2. os sete dias no fio continuo         — onde ela esta na semana;
//   3. as tres missoes de hoje              — o que ha para fazer HOJE;
//   4. o album em miniatura                 — o horizonte longo, o cofre;
//   5. as fichas, se houver saldo           — hoje isto nunca aparece (ver abaixo);
//   6. o ritual, se estiver em andamento    — o compromisso ja assumido.
//
// ===========================================================================
// A REGRA DE HIERARQUIA (a licao que o dossie do Cosmic Guide cobrou caro)
// ===========================================================================
// O diagnostico da secao 4 daquele dossie e "excesso de oferta simultanea e
// falta de hierarquia unica": seis cartoes do mesmo tamanho na mesma tela, cada
// um pedindo uma coisa, e a pessoa nao faz nenhuma. Aqui a defesa e estrutural e
// esta no ESTILO, nao na boa intencao:
//
//   · UMA acao dominante, e ela e um BotonPrimario — a leitura de hoje ou, se a
//     leitura ja esta feita, o dia do ritual. Nunca as duas. `accionRitual` so
//     e verdadeira quando o no de hoje ja esta atado;
//   · o cartao do fio e o UNICO com fundo (colores.penumbra) e borda fechada;
//   · tudo o que vem depois e "seccion": sem fundo, separado por um filete de
//     bordeSuave. Um bloco secundario nao pode ganhar fundo proprio sem que
//     alguem, antes, decida qual dos outros deixa de ter — senao a hierarquia
//     volta a ser plana no terceiro commit;
//   · nenhum bloco secundario tem botao. Eles sao linhas tocaveis, com seta.
//
// ===========================================================================
// O QUE ESTA TELA ESCREVE (e a lista e de UMA coisa)
// ===========================================================================
// A versao anterior dizia "esta tela SO LE", e a frase valia como defesa: sem
// importar `atarNudo` nem `borrarSeguro`, nao havia como ela mexer no fio nem
// por acidente nem num refactor distraido. Isso continua valendo para o fio.
//
// A UNICA escrita desta tela e o carimbo da missao 'olhar-o-fio', e ela existe
// porque lib/missoes.js declara, no campo `prova` daquela entrada, que a tela
// que a comprova e esta, na abertura. O missions.js do Cosmic Guide registra o
// bug oposto — duas missoes ficaram impossiveis de completar porque verificavam
// uma acao que nenhuma tela gravava. Marcar aqui e o que impede aquilo.
//
// Continua PROIBIDO nesta tela: importar `atarNudo`, `borrarSeguro`,
// `guardarSeguro`, `concluirDia`, `registrarEncuentro`, `ganharFichas` ou
// qualquer outra coisa que mova o fio, o album, o ritual ou o saldo. Quem ata o
// no e a tela da Sintese, uma vez. Quem registra carta e a leitura de verdade.
//
// ===========================================================================
// O FIO DA SEMANA — o desenho nao mora mais aqui
// ===========================================================================
// Sete circulos em linha sao sete dias. Um traco continuo que ATRAVESSA os sete
// e um fio — e o fio e a marca. Esse desenho (o <Path> unico de borda a borda, o
// no cheio, o ponto vazado e o halo que respira no no de hoje) foi para
// components/FaixaNudos.js no dia em que a tela do ritual passou a precisar do
// MESMO fio com sete nos. Duas copias da mesma curva divergem no primeiro
// ajuste, e a marca nao pode ter duas versoes. Toda a explicacao da geometria e
// do pulso esta la; aqui ficou o que e desta tela: o DADO (quais dias tem no,
// qual e hoje) e as sete iniciais do calendario.
//
// E por isso o bloco do ritual NAO desenha uma segunda faixa de sete nos. O fio
// e a marca do app; dois fios na mesma rolagem, um contando dias de calendario e
// outro contando passos do ritual, ensinam que a marca nao quer dizer nada.
// O ritual entra como linha de texto e uma seta.
//
// LIMITE HONESTO DO DADO. lib/hilo.js guarda quatro numeros, e nao um diario:
// { ultimoDia, actual, record, total }. Do que esta no disco da para reconstruir
// com certeza UMA coisa — a corrida corrente, que sao os `actual` dias seguidos
// terminando em `ultimoDia`. Um no isolado de tres semanas atras nao esta ali e
// esta tela nao o inventa: o dia aparece com o fio liso, que e a ausencia de
// afirmacao, e nunca com marca de falta. Preferir o silencio a um "voce falhou"
// que o app nao tem como provar e a mesma regra do resto do produto.
//
// ===========================================================================
// O ALBUM EM MINIATURA — e a unica regra que ele tem
// ===========================================================================
// A tira mostra SO carta encontrada, e as encontradas mais recentes primeiro.
// Nao existe silhueta de carta oculta, nao existe cadeado e nao existe contagem
// do que falta: lib/album.js nem sequer expoe a lista de faltantes, de proposito
// (a funcao espelho entregaria o nome da proxima carta e a surpresa acabaria
// antes de acontecer).
//
// E album vazio NAO vira "0 de 78". E o mesmo zero que ja foi condenado no
// contador de nos, na secao abaixo: um numero que anuncia o buraco no maior tipo
// da tela. Sem carta nenhuma, o bloco mostra o convite de 'hilo.panel.albumVazio'
// e mais nada.
//
// ===========================================================================
// AS FICHAS — por que este bloco existe e nunca aparece
// ===========================================================================
// lib/fichas.js nasce com FICHAS_ACTIVAS === false e o cabecalho daquele arquivo
// e explicito: enquanto for false, NENHUMA tela mostra saldo. O bloco aqui esta
// atras dessa flag e de `saldo > 0`, e o disco nem chega a ser lido com a flag
// desligada. Ele existe escrito para que, no dia em que alguem ligar a flag, o
// lugar da ficha ja esteja decidido — embaixo, secundario, e com a frase que diz
// na mesma linha que a leitura de hoje continua de graca.
//
// ===========================================================================
// CONTRATOS QUE ESTE ARQUIVO CUMPRE
// ===========================================================================
//  · Regra 8 — nenhum hex e nenhum rgba escrito aqui; toda cor sai de theme.js.
//  · Regra 9 — colores.hilo so como traco, ponto e halo. Nunca como texto.
//  · Toda string visivel vem de t() (datos/textos.js). A unica excecao esta
//    documentada em `unidadNudos`, e ainda assim a palavra vem de la.
//  · Toda tipografia vem dos wrappers de components/Texto.js: nenhum fontSize
//    e nenhum fontFamily escrito na mao.
//  · Nenhum Alert.alert: no react-native-web ele e no-op silencioso.
//  · Nenhuma biblioteca nova: react-native-svg ja esta no package.json.
//  · Nenhuma chave de storage nova. Esta tela nao cria nenhuma — as quatro que
//    ela le ('hilo', 'album', 'missoes', 'ritual') ja estao em CLAVES_HILO_ROJO
//    (screens/AjustesScreen.js), cada uma pelo commit do seu proprio motor.
//
// ===========================================================================
// CONTRATO DE ENTRADA
// ===========================================================================
// props.navigation — o objeto padrao do React Navigation, e OPCIONAL: sem ele a
// tela desenha inteira e o toque vira um aviso de __DEV__ em vez de crash. Isso
// importa porque o navigator ainda e um andaime e porque esta tela precisa
// poder ser montada sozinha para screenshot da loja.
//
// Esta e a rota inicial de quem ja passou pelo onboarding, entao ela recarrega
// no 'focus': voltar da Sintese depois de atar o no de hoje tem de mostrar o no
// novo, a carta nova no album e a missao fechada — e nao o estado do primeiro
// mount.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import BotonPrimario from '../components/BotonPrimario';
import FaixaNudos, { trazoNudos } from '../components/FaixaNudos';
import HiloFondo from '../components/HiloFondo';
import { Cuerpo, Micro, Sobreceja, Titulo } from '../components/Texto';
import { t } from '../datos/textos';
import { TOTAL_CARTAS, leerAlbum, resumenAlbum } from '../lib/album';
import { FICHAS_ACTIVAS, PRECO_LEITURA_EXTRA, leerFichas } from '../lib/fichas';
import { leerHilo, resumenHilo } from '../lib/hilo';
import { imagenDeCarta } from '../lib/imagenes';
import { cartaPorId } from '../lib/mazo';
import { completarMissao } from '../lib/missoes';
import { DURACION, resumenRitual } from '../lib/ritual';
import RUTAS from '../routes';
import { colores, espacio, radio } from '../theme';

/* ===================================================================================
   A SEMANA
   Iniciais do calendario, nao copy de produto: e por isso que elas nao moram em
   datos/textos.js. Semana que comeca na segunda, como em toda a America Latina —
   L M M J V S D. As duas repeticoes (M de martes e M de miercoles, S de sabado)
   sao corretas e por isso a chave do map nunca pode ser a letra.
   =================================================================================== */
const INICIALES = Object.freeze(['L', 'M', 'M', 'J', 'V', 'S', 'D']);

const MS_DIA = 86400000;

const GROSOR_BORDE = 1;

/** Lado da seta das linhas tocaveis. Mesma seta de PerfilScreen. */
const LADO_FLECHA = 8;

/** Quantas cartas cabem na tira do album sem ela virar uma segunda grade. */
const CARTAS_EN_TIRA = 6;

/** Largura da miniatura. A altura sai da proporcao de carta, logo abaixo. */
const ANCHO_MINIATURA = 40;
const ALTO_MINIATURA = 60;

/**
 * A missao que ESTA tela comprova, e a unica escrita do arquivo.
 *
 * O id e o de lib/missoes.js, onde o campo `prova` daquela entrada diz, em
 * texto: "HiloScreen, na abertura". Marcar em qualquer outro lugar tornaria
 * aquela linha falsa; nao marcar em lugar nenhum tornaria a missao impossivel,
 * que e exatamente o bug que o missions.js do Cosmic Guide registrou.
 */
const MISSAO_DESTA_TELA = 'olhar-o-fio';

/**
 * Para onde cada missao leva.
 *
 * A tela nao cumpre missao nenhuma por ninguem: ela so abre o lugar onde a
 * pessoa cumpre. Id sem destino (a desta propria tela) simplesmente nao vira
 * linha tocavel — uma seta que nao leva a lugar nenhum e pior que nenhuma seta.
 *
 * Os destinos saem do campo `prova` do catalogo, um por um:
 *   leitura-do-dia, raspar-sem-pular → a tiragem de hoje
 *   ler-ate-o-fim, voltar-a-leitura  → a sintese
 *   resposta-do-ritual               → o ritual de sete dias
 *   reler-suas-respostas             → a ficha do perfil
 *   fonte-de-uma-carta, o-que-nao-diz→ o metodo (e la que vive CajaLimites fora
 *                                      de uma leitura; a Sintese so existe
 *                                      depois de uma tirada, e a missao ficaria
 *                                      impossivel no dia em que a pessoa ainda
 *                                      nao leu)
 *   carta-nova-no-album              → a tiragem: carta nova so vem de leitura
 *                                      de verdade. A entrada esta `activa:false`
 *                                      no catalogo e por isso nunca e sorteada;
 *                                      o destino fica escrito para que ligar a
 *                                      flag nao deixe um toque morto para tras.
 */
/* SEM TIRAGEM — 01/09: as missoes 'leitura-do-dia', 'raspar-sem-pular' e
 * 'carta-nova-no-album' sairam do catalogo junto com a TiradaScreen (o dono
 * mandou tirar toda carta de dentro do app). Se alguma voltar um dia, o
 * destino certo e RUTAS.REOUVIR_ENTRADA — nunca uma tiragem nova. */
const DESTINO_MISSAO = Object.freeze({
  'resposta-do-ritual': RUTAS.RITUAL,
  /* 'voltar-a-leitura' agora e literal: reouvir as tres de sempre. A Sintese
   * ficou inalcancavel quando a tiragem saiu das abas (01/09). */
  'voltar-a-leitura': RUTAS.REOUVIR_ENTRADA,
  'reler-suas-respostas': RUTAS.PERFIL,
  'fonte-de-uma-carta': RUTAS.METODO,
  'o-que-nao-diz': RUTAS.METODO,
});

/**
 * O `d` do fio. O desenho inteiro mudou de casa para components/FaixaNudos.js
 * quando a tela do ritual passou a precisar do MESMO fio com sete nos: duas
 * copias da mesma curva divergem no primeiro ajuste, e o fio e a marca.
 *
 * O nome antigo continua exportado daqui de proposito — ele e a superficie
 * publica desta tela desde antes da mudanca, e um alias de uma linha custa menos
 * que renomear referencias espalhadas.
 */
export const trazoSemana = trazoNudos;

/** Timestamp UTC do dia 'YYYY-MM-DD', ou null quando a string nao e um dia. */
function marcaDeDia(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return null;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const marca = Date.UTC(anio, mes - 1, dd);
  return Number.isFinite(marca) ? marca : null;
}

/**
 * Quais dos sete dias desta semana tem no atado, e onde cai hoje.
 *
 * Recebe o estado CRU do disco (lib/hilo.leerHilo), nao o resumo: o resumo zera
 * `actual` quando o dia passou, e um dia que ja foi atado continua atado mesmo
 * depois de o fio parar. Apagar o no de segunda porque hoje e quinta seria
 * reescrever o passado dela — exatamente o que o produto proibe.
 *
 * As datas sao comparadas em UTC de proposito. As duas pontas ja sao dias
 * locais em texto; montar Date local aqui faria o horario de verao devolver
 * 0,96 ou 1,04 dia, que vira um no a mais ou a menos no arredondamento.
 *
 * @param {{ultimoDia: string|null, actual: number}} guardado estado cru do disco
 * @param {Date} ahora relogio; injetavel para o teste nao depender da maquina
 * @returns {{indiceHoy: number, nudos: boolean[]}}
 */
export function calcularSemana(guardado, ahora) {
  const fecha = ahora instanceof Date && !Number.isNaN(ahora.getTime()) ? ahora : new Date();

  // getDay() devolve 0 para domingo; a semana daqui comeca na segunda.
  const indiceHoy = (fecha.getDay() + 6) % 7;
  const marcaHoy = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

  const ultimo = marcaDeDia(guardado ? guardado.ultimoDia : null);
  const bruto = guardado ? Number(guardado.actual) : 0;
  const corrida = Number.isFinite(bruto) && bruto > 0 ? Math.floor(bruto) : 0;

  const nudos = INICIALES.map((_, i) => {
    if (ultimo === null || corrida === 0) return false;
    const marca = marcaHoy + (i - indiceHoy) * MS_DIA;
    // Distancia deste dia ate o ultimo no. A corrida corrente cobre o intervalo
    // fechado [ultimoDia - (actual - 1), ultimoDia]; fora dele nao ha o que
    // afirmar. Distancia negativa e dia posterior ao ultimo no — futuro.
    const distancia = Math.round((ultimo - marca) / MS_DIA);
    return distancia >= 0 && distancia <= corrida - 1;
  });

  return { indiceHoy, nudos };
}

/**
 * A unidade da contagem: 'nudos' no plural, e o mesmo substantivo sem o -s no
 * singular.
 *
 * datos/textos.js so traz o plural em 'hilo.unidad' e lib/hilo.js devolve o
 * booleano `singular` esperando que a tela decida a forma. Em vez de digitar a
 * palavra no singular aqui — que seria copy nascendo dentro de uma tela, contra
 * a regra do projeto — ela e DERIVADA da chave: em espanhol o plural de um
 * substantivo terminado em vogal e exatamente a palavra mais -s, entao tirar a
 * ultima letra devolve o singular sem inventar termo nenhum. Trocar
 * 'hilo.unidad' continua trocando as duas formas de uma vez, que e a propriedade
 * que importa. Se um dia existir uma chave singular propria, esta funcao vira
 * uma linha e o resto da tela nao muda.
 */
export function unidadNudos(singular) {
  const plural = t('hilo.unidad');
  if (singular !== true || typeof plural !== 'string') return plural;
  return /s$/i.test(plural) ? plural.slice(0, -1) : plural;
}

/**
 * As cartas encontradas mais recentes primeiro, para a tira do album.
 *
 * PURA, sobre o estado ja lido de lib/album.js. Duas decisoes:
 *
 *  · a ordem e por `ultima` (o dia do ultimo encontro), decrescente. A ordem do
 *    baralho — a de `cartasEncontradas()` — e a certa para a GRADE, que precisa
 *    ficar no mesmo lugar entre duas aberturas; aqui a tira quer justamente o
 *    contrario, mostrar o que acabou de chegar;
 *  · carta de legado (a que ja tinha vindo antes de a metrica existir, sem data
 *    gravada) vai para o FIM em vez de ganhar uma data inventada. lib/album.js
 *    se recusa a fabricar aquele dia e esta tela nao pode desfazer isso por
 *    ordenacao.
 *
 * O desempate por id existe so para a tira nao trocar de ordem a cada render
 * quando duas cartas vieram no mesmo dia — o que e o caso normal, ja que a
 * tiragem e de tres.
 *
 * @param {{cartas: object}} estado o album ja lido
 * @param {number} cuantas quantas miniaturas cabem
 * @returns {string[]} ids, do encontro mais recente para o mais antigo
 */
export function ultimasEncontradas(estado, cuantas) {
  const cartas = estado && estado.cartas ? estado.cartas : {};
  const tope = Number.isFinite(cuantas) && cuantas > 0 ? Math.floor(cuantas) : 0;
  return Object.keys(cartas)
    .sort((a, b) => {
      const diaA = cartas[a] && cartas[a].ultima ? cartas[a].ultima : '';
      const diaB = cartas[b] && cartas[b].ultima ? cartas[b].ultima : '';
      if (diaA !== diaB) return diaA < diaB ? 1 : -1;
      return a < b ? -1 : 1;
    })
    .slice(0, tope);
}

/* ===================================================================================
   PECAS DE INTERFACE
   =================================================================================== */

/**
 * A faixa da semana. O desenho (o fio, os nos, o halo que respira) mora em
 * components/FaixaNudos.js, que e o mesmo componente usado pela tela do ritual.
 * O que sobrou aqui e o que e proprio DESTA tela: as sete iniciais do calendario
 * embaixo dos nos.
 */
function FaixaSemana({ nudos, indiceHoy }) {
  return (
    <FaixaNudos
      nudos={nudos}
      indiceHoy={indiceHoy}
      total={INICIALES.length}
      etiquetas={INICIALES}
      style={estilos.faixa}
    />
  );
}

/**
 * A seta da direita de uma linha tocavel. E uma View rotacionada e nao um
 * caractere: glifo dependeria da fonte carregada e apareceria como quadrado no
 * primeiro frame frio. Fora da arvore de acessibilidade — quem le a linha ja
 * sabe que ela abre algo, porque o Pressable tem role de botao.
 */
function Flecha() {
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no"
      style={estilos.flecha}
    />
  );
}

/**
 * O cabecalho de um bloco secundario: sobreceja a esquerda, contagem a direita.
 * Sem fundo e sem borda propria — quem separa os blocos e o filete de `seccion`.
 */
function TituloSeccion({ etiqueta, nota }) {
  return (
    <View style={estilos.tituloSeccion}>
      <Sobreceja>{etiqueta}</Sobreceja>
      {nota ? <Micro style={estilos.tituloNota}>{nota}</Micro> : null}
    </View>
  );
}

/**
 * Uma missao de hoje que ainda nao foi feita.
 *
 * Titulo e pista, e uma seta que leva ao lugar de cumpri-la. Sem destino, a
 * linha continua aparecendo — ela informa o que fazer — mas para de ser
 * tocavel: e o caso da missao desta propria tela, que ja se cumpre pelo fato de
 * a pessoa estar aqui.
 */
function FilaMissao({ titulo, pista, onPress }) {
  if (typeof onPress !== 'function') {
    return (
      <View style={estilos.filaMissao}>
        <View style={estilos.filaTexto}>
          <Cuerpo>{titulo}</Cuerpo>
          <Micro style={estilos.pista}>{pista}</Micro>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={pista}
      style={({ pressed }) => [estilos.filaMissao, pressed ? estilos.filaPresionada : null]}
    >
      <View style={estilos.filaTexto}>
        <Cuerpo>{titulo}</Cuerpo>
        <Micro style={estilos.pista}>{pista}</Micro>
      </View>
      <Flecha />
    </Pressable>
  );
}

/**
 * A missao ja feita: sai do topo e vira uma linha riscada, discreta.
 *
 * O risco e decoracao visual e nao e anunciado por leitor de tela, entao o
 * estado vai no accessibilityLabel — titulo mais 'missoes.feita'. Sem isso, quem
 * usa TalkBack ouviria a missao feita exatamente igual a uma pendente.
 */
function FilaMissaoFeita({ titulo }) {
  return (
    <View
      style={estilos.filaFeita}
      accessible
      accessibilityLabel={`${titulo}. ${t('missoes.feita')}`}
    >
      <Micro style={estilos.textoFeito}>{titulo}</Micro>
    </View>
  );
}

/** Uma miniatura da tira do album. So carta encontrada chega aqui. */
function Miniatura({ cartaId }) {
  const fuente = imagenDeCarta(cartaId);
  const carta = cartaPorId(cartaId);
  const nombre = carta && carta.nombre ? carta.nombre : cartaId;

  return (
    <View style={estilos.miniatura}>
      {fuente ? (
        <Image
          source={fuente}
          style={estilos.miniaturaImagen}
          resizeMode="cover"
          accessible
          accessibilityRole="image"
          accessibilityLabel={nombre}
        />
      ) : null}
    </View>
  );
}

/* ===================================================================================
   A TELA
   =================================================================================== */
export default function HiloScreen({ navigation }) {
  // Um estado so, trocado de uma vez: pedacos independentes viravam varios
  // renders e um piscar de "0 nudos" antes do numero real.
  const [datos, setDatos] = useState(null);

  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  // As leituras servem a coisas diferentes e nenhuma delas escreve:
  //   resumenHilo()   → o que a tela DIZ hoje (sequencia viva, quieto, hoyAtado)
  //   leerHilo()      → o estado CRU, unico jeito de saber quais dias da semana
  //                     ja tem no mesmo quando a sequencia viva e zero.
  //   leerAlbum()     → a contagem e as ultimas cartas encontradas.
  //   resumenRitual() → so para saber se ha um ritual em andamento.
  //   leerFichas()    → so com a flag ligada. Com ela desligada o disco nem e
  //                     tocado: nenhuma tela mostra saldo enquanto FICHAS_ACTIVAS
  //                     for false, e ler para depois esconder e como se comeca a
  //                     esquecer disso.
  //
  // A UNICA escrita e `completarMissao(MISSAO_DESTA_TELA)`, e ela vem depois das
  // leituras de proposito: ela devolve o resumo do dia ja com a missao marcada,
  // entao a tela tem UMA fonte para as tres de hoje em vez de duas que poderiam
  // discordar. Id nao sorteado hoje nao grava nada e devolve o mesmo resumo —
  // por isso nao ha ramo de erro aqui.
  const cargar = useCallback(async () => {
    const [resumen, guardado, album, ritual, fichas] = await Promise.all([
      resumenHilo(),
      leerHilo(),
      leerAlbum(),
      resumenRitual(),
      FICHAS_ACTIVAS ? leerFichas() : Promise.resolve(null),
    ]);
    const missoes = await completarMissao(MISSAO_DESTA_TELA);
    if (!montado.current) return;
    setDatos({ resumen, guardado, album, ritual, fichas, missoes });
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Voltar da Sintese depois de atar o no de hoje tem de mostrar o no novo.
  // addListener devolve a propria funcao de limpeza no React Navigation 6.
  useEffect(() => {
    if (!navigation || typeof navigation.addListener !== 'function') return undefined;
    return navigation.addListener('focus', cargar);
  }, [navigation, cargar]);

  const ir = useCallback(
    (ruta) => {
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate(ruta);
        return;
      }
      if (__DEV__) {
        console.warn(`[HiloScreen] Sem navigation: a rota "${ruta}" nao foi aberta.`);
      }
    },
    [navigation]
  );

  /* O fallback do botao grande era a tiragem; sem tiragem no app, o lugar
   * de "comecar" e o plano do dia. */
  const irAlPlano = useCallback(() => ir(RUTAS.PLANO), [ir]);
  const irAlRitual = useCallback(() => ir(RUTAS.RITUAL), [ir]);

  const semana = useMemo(() => {
    if (!datos) return null;
    return calcularSemana(datos.guardado, new Date());
  }, [datos]);

  const album = useMemo(() => {
    if (!datos) return null;
    const resumo = resumenAlbum(datos.album);
    return { ...resumo, ultimas: ultimasEncontradas(datos.album, CARTAS_EN_TIRA) };
  }, [datos]);

  const resumen = datos ? datos.resumen : null;
  const missoes = datos ? datos.missoes : null;
  const ritual = datos ? datos.ritual : null;
  const fichas = datos ? datos.fichas : null;

  // O recorde aparece SEMPRE que o fio esta parado — e a segunda metade
  // obrigatoria do estado quieto — e tambem quando ele e maior que a sequencia
  // de agora, que e quando dizer "eso no se borra" acrescenta alguma coisa.
  // Com sequencia viva igual ao recorde a linha seria eco, e fica fora.
  const mostrarRecord =
    !!resumen && resumen.record > 0 && (resumen.quieto || resumen.record > resumen.actual);

  /* --- A HIERARQUIA, resolvida em quatro booleanos --------------------------
     A leitura de hoje e a acao dominante enquanto o no de hoje nao estiver
     atado. So DEPOIS disso o dia do ritual pode ocupar o botao — e por isso
     `accionRitual` exige `hoyAtado`. As duas nunca aparecem juntas como botao;
     o ritual que nao virou botao vira a linha do bloco 6. */
  const hoyPendiente = !!resumen && !resumen.hoyAtado;
  const ritualEnCurso = !!ritual && ritual.empezado && !ritual.completo;
  const ritualHoyAbierto = ritualEnCurso && !ritual.bloqueadoHoy && ritual.diaActual !== null;
  const accionRitual = !!resumen && resumen.hoyAtado && ritualHoyAbierto;

  const pendientes = missoes ? missoes.missoes.filter((m) => !m.feita) : [];
  const hechas = missoes ? missoes.missoes.filter((m) => m.feita) : [];

  const mostrarFichas = FICHAS_ACTIVAS && !!fichas && fichas.saldo > 0;

  return (
    <View style={estilos.pantalla}>
      {/* O fundo acompanha o estado: tenso enquanto a sequencia esta de pe,
          quieto quando ela parou, quando ainda nao ha nada e enquanto o disco
          nao respondeu. HiloFondo e IRMAO do conteudo, nunca pai: ele ignora
          children e tem pointerEvents 'none'. */}
      <HiloFondo variante={resumen && !resumen.quieto && !resumen.vacio ? 'tenso' : 'quieto'} />

      <SafeAreaView style={estilos.seguro}>
        <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
          <Sobreceja>{t('app.nombre')}</Sobreceja>
          <Titulo accessibilityRole="header" style={estilos.titulo}>
            {t('hilo.titulo')}
          </Titulo>
          <Micro style={estilos.sub}>{t('hilo.sub')}</Micro>

          {/* --- 1 e 2. O CARTAO DO FIO --------------------------------------
              O unico bloco com fundo da tela: ele e o assunto, o resto e
              consequencia. Enquanto o disco nao respondeu, o cartao ja desenha o
              fio da semana — liso, sem no nenhum e sem dia marcado — mas nao
              mostra contagem: um "0 nudos" que ainda nao foi medido e exatamente
              o tipo de numero que este produto nao mostra. O fio aparece antes do
              dado porque ele e desenho, nao afirmacao. */}
          <View style={estilos.tarjeta}>
            {resumen ? (
              <>
                {/* A CONTAGEM SO EXISTE QUANDO HA O QUE CONTAR.
                    resumenHilo() devolve `actual: 0` nos dois estados em que nao
                    ha sequencia viva — o fio parado e o telefone novo. Imprimir
                    isso dava "0 nudos" no MAIOR tipo da tela, logo acima de "El
                    hilo no se rompio. Se quedo quieto.": o texto dizia que nada
                    se perdeu e o numero anunciava a perda na mesma respiracao.
                    Nenhuma palavra proibida aparece — o castigo era o zero.
                    O cabecalho deste arquivo ja diz as duas coisas que condenam
                    aquele render: um fio parado "continua do tamanho que ficou" e
                    "um '0 nudos' que ainda nao foi medido e exatamente o tipo de
                    numero que este produto nao mostra".
                    Sem a linha, o estado parado fica com o par que lib/hilo.js
                    manda e nesta ordem: constatacao ('hilo.rachaRota') e recorde
                    intacto ('hilo.record'). O telefone novo fica com
                    'hilo.vacio', que ja diz que ainda nao ha nudos. */}
                {resumen.actual > 0 ? (
                  <Titulo tabular style={estilos.conteo}>
                    {t('hilo.conteo', { n: resumen.actual, unidad: unidadNudos(resumen.singular) })}
                  </Titulo>
                ) : null}

                {semana ? (
                  <FaixaSemana nudos={semana.nudos} indiceHoy={semana.indiceHoy} />
                ) : null}

                {/* Uma linha de estado, nunca duas. A ordem do estado parado e
                    a que lib/hilo.js manda: constatacao primeiro, recorde
                    intacto depois. Nenhum dos ramos fala em perda. */}
                {resumen.vacio ? (
                  <Cuerpo style={estilos.estado}>{t('hilo.vacio')}</Cuerpo>
                ) : resumen.quieto ? (
                  <Cuerpo style={estilos.estado}>{t('hilo.rachaRota')}</Cuerpo>
                ) : resumen.hoyAtado ? (
                  <Cuerpo style={estilos.estado}>{t('hilo.hoyListo')}</Cuerpo>
                ) : null}

                {mostrarRecord ? (
                  <Cuerpo style={estilos.record}>
                    {t('hilo.record', { n: resumen.record })}
                  </Cuerpo>
                ) : null}
              </>
            ) : (
              <FaixaSemana nudos={[]} indiceHoy={-1} />
            )}
          </View>

          {/* --- A ACAO DOMINANTE ---------------------------------------------
              Uma so, e ela e a leitura de hoje. Quando o no de hoje ja esta
              atado, o botao passa a ser o dia do ritual — mas SO se houver um
              ritual em andamento com o dia de hoje aberto. Nao havendo nem uma
              coisa nem outra, nao ha botao nenhum: inventar um "vuelve manana"
              com cara de botao seria dar um alvo de toque que nao leva a lugar
              nenhum, e empurrar para o paywall aqui seria vender exatamente o que
              esta tela nao vende.

              Enquanto o disco nao respondeu o botao existe apagado, para o
              conteudo abaixo nao subir e descer.

              O rotulo com o fio parado e 'hilo.retomar' ("Retomar donde quedo"):
              retomar de onde ficou, e nao recuperar o que se perdeu. */}
          {resumen && resumen.hoyAtado && !accionRitual ? null : (
            <BotonPrimario
              titulo={
                accionRitual
                  ? t('ritual.cerrar', { n: ritual.diaActual })
                  : resumen && resumen.quieto
                    ? t('hilo.retomar')
                    : t('comunes.empezar')
              }
              habilitado={!!resumen}
              onPress={accionRitual ? irAlRitual : irAlPlano}
              style={estilos.boton}
            />
          )}

          {/* --- 3. AS TRES DE HOJE -------------------------------------------
              Pendentes em cima, com titulo, pista e seta para o lugar de
              cumpri-las. Feitas embaixo, riscadas e em tipo menor: elas saem do
              caminho sem sumir, porque ver o que ja foi feito e a metade boa da
              lista.

              Nao ha barra de progresso e nao ha "faltam N": 'missoes.progresso' e
              "{n} de {total}", o mesmo formato honesto do album. E nao ha premio
              — 'missoes.todasFeitas' e constatacao, nao recompensa, porque
              recompensa que nao existe nao entra no catalogo. */}
          {missoes && missoes.total > 0 ? (
            <View style={estilos.seccion}>
              <TituloSeccion
                etiqueta={t('missoes.titulo')}
                nota={t('missoes.progresso', { n: missoes.feitas, total: missoes.total })}
              />

              {pendientes.map((m) => (
                <FilaMissao
                  key={m.id}
                  titulo={t(m.claveTitulo)}
                  pista={t(m.clavePista)}
                  onPress={
                    DESTINO_MISSAO[m.id] ? () => ir(DESTINO_MISSAO[m.id]) : undefined
                  }
                />
              ))}

              {hechas.map((m) => (
                <FilaMissaoFeita key={m.id} titulo={t(m.claveTitulo)} />
              ))}

              {missoes.todasFeitas ? (
                <Micro style={estilos.notaSeccion}>{t('missoes.todasFeitas')}</Micro>
              ) : null}
            </View>
          ) : null}

          {/* --- 4. O ALBUM — DESLIGADO EM 31/08 -------------------------------
              Decisao do dono: o app abre com tres cartas fixas e segue no plano
              do dia. Uma colecao de 78 seria uma segunda porta competindo com a
              principal — exatamente o "excesso de oferta simultanea" que o
              dossie do Cosmic Guide diagnostica como a doenca daquele app.

              O motor (lib/album.js), a tela (screens/AlbumScreen.js) e os 14
              testes continuam no repositorio, verdes e sem consumidor. Religar
              e devolver este bloco e a linha do PerfilScreen.
          ------------------------------------------------------------------- */}

          {/* --- 5. AS FICHAS -------------------------------------------------
              Atras de FICHAS_ACTIVAS e de saldo > 0. Com a flag desligada — que e
              o estado de hoje — este bloco nunca chega a existir na arvore, e o
              disco das fichas nem e lido la em cima.

              A segunda linha diz, na mesma frase, o que a ficha compra e o que
              ela NAO compra: a leitura de hoje continua de graca. A ficha nunca e
              o portao da leitura diaria. */}
          {mostrarFichas ? (
            <View style={estilos.seccion}>
              <TituloSeccion etiqueta={t('hilo.panel.fichasTitulo')} />
              <Cuerpo tabular style={estilos.saldo}>
                {t('hilo.panel.fichasSaldo', {
                  n: fichas.saldo,
                  unidade:
                    fichas.saldo === 1 ? t('fichas.unidade') : t('fichas.unidade.plural'),
                })}
              </Cuerpo>
              <Micro style={estilos.pista}>
                {t('hilo.panel.fichasPara', { preco: PRECO_LEITURA_EXTRA })}
              </Micro>
            </View>
          ) : null}

          {/* --- 6. O RITUAL EM ANDAMENTO -------------------------------------
              So aparece com um ritual comecado e nao terminado, e so quando ele
              NAO virou o botao dominante la em cima — senao a mesma acao apareceria
              duas vezes na mesma rolagem.

              A linha diz quantos dias ja foram fechados. Quando o dia de hoje ja
              foi fechado, ela usa 'ritual.hecho.proximo' ("O dia {n} abre
              amanha."), que informa sem cobrar: nao existe aqui contagem
              regressiva nem aviso de que o ritual "expira". */}
          {ritualEnCurso && !accionRitual ? (
            <Pressable
              onPress={irAlRitual}
              accessibilityRole="button"
              accessibilityLabel={t('hilo.panel.ritualAbrir')}
              style={({ pressed }) => [
                estilos.seccion,
                estilos.seccionTocable,
                pressed ? estilos.filaPresionada : null,
              ]}
            >
              <View style={estilos.filaSeccion}>
                <View style={estilos.filaTexto}>
                  <Sobreceja>{t('hilo.panel.ritualTitulo')}</Sobreceja>
                  <Cuerpo style={estilos.lineaSeccion}>
                    {t('hilo.panel.ritualProgresso', {
                      n: ritual.diasHechos,
                      total: DURACION,
                    })}
                  </Cuerpo>
                  {ritual.bloqueadoHoy && ritual.diaActual !== null ? (
                    <Micro style={estilos.pista}>
                      {t('ritual.hecho.proximo', { n: ritual.diaActual })}
                    </Micro>
                  ) : ritualHoyAbierto ? (
                    <Micro style={estilos.pista}>
                      {t('ritual.cerrar', { n: ritual.diaActual })}
                    </Micro>
                  ) : null}
                </View>
                <Flecha />
              </View>
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ===================================================================================
   ESTILOS
   Nenhum hex, nenhum rgba e nenhum numero de fonte. Medidas de layout saem de
   `espacio` e `radio`; as constantes do topo sao geometria de desenho.

   A HIERARQUIA MORA AQUI, e nao na boa intencao de quem escreve a proxima tela:
   `tarjeta` e o unico estilo com fundo; `seccion` nao tem fundo nenhum e se
   separa por um filete. Enquanto for assim, nenhum bloco secundario consegue
   competir com o cartao do fio nem com o botao — que sao, juntos, a unica coisa
   que esta tela pede.
   =================================================================================== */
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
    // Folga no fim: a barra de tres zonas fica por cima desta tela e o ultimo
    // elemento nao pode nascer debaixo dela.
    paddingBottom: espacio.xxxl * 2,
    // Em tablet e na web a coluna para de crescer.
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },

  titulo: {
    marginTop: espacio.sm,
  },
  sub: {
    marginTop: espacio.sm,
  },

  /* --- cartao do fio: o unico bloco com fundo --- */
  tarjeta: {
    marginTop: espacio.xl,
    backgroundColor: colores.penumbra,
    borderRadius: radio.md,
    borderWidth: GROSOR_BORDE,
    borderColor: colores.bordeSuave,
    padding: espacio.lg,
  },
  conteo: {
    // So cor e digito tabular: tamanho e familia sao de <Titulo>. Tabular
    // impede a linha de tremer de largura quando 9 vira 10.
    color: colores.papel,
  },
  estado: {
    marginTop: espacio.lg,
  },
  // O recorde e o unico numero em destaque da tela. aguja da 8,3:1 sobre noche
  // (AAA) e e o token de numero do tema; colores.hilo aqui seria texto e
  // reprovaria AA (regra 9).
  record: {
    marginTop: espacio.md,
    color: colores.aguja,
  },

  /* --- faixa da semana ---
     So a margem: altura, halo e a linha das iniciais sao de FaixaNudos. */
  faixa: {
    marginTop: espacio.xl,
  },

  /* --- acao --- */
  boton: {
    marginTop: espacio.xl,
  },

  /* --- blocos secundarios ---
     Sem fundo e sem borda fechada. O filete de cima e tudo o que os separa, e e
     de proposito: cartao dentro de cartao e como a tela vira a vitrine plana que
     o dossie do Cosmic Guide diagnostica. */
  seccion: {
    marginTop: espacio.xxl,
    paddingTop: espacio.lg,
    borderTopWidth: GROSOR_BORDE,
    borderTopColor: colores.bordeSuave,
  },
  // O bloco inteiro e o alvo de toque: o retangulo do Pressable precisa de folga
  // embaixo para o dedo nao terminar em cima do filete do bloco seguinte.
  seccionTocable: {
    paddingBottom: espacio.md,
  },
  tituloSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tituloNota: {
    marginLeft: espacio.md,
  },
  notaSeccion: {
    marginTop: espacio.md,
  },
  lineaSeccion: {
    marginTop: espacio.xs,
  },

  /* --- linhas --- */
  filaSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filaMissao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // 52 e a altura minima de alvo de toque do projeto (a mesma de
    // BotonPrimario): 12 + 12 de padding sobre duas linhas chega la com folga.
    paddingVertical: espacio.md,
  },
  filaTexto: {
    flex: 1,
    paddingRight: espacio.md,
  },
  filaPresionada: {
    backgroundColor: colores.bordeSuave,
  },
  pista: {
    marginTop: espacio.xs,
  },

  /* --- missao feita ---
     Riscada e em ceniza: continua legivel, para de chamar. O leitor de tela nao
     anuncia line-through, e por isso FilaMissaoFeita carrega o estado no
     accessibilityLabel. */
  filaFeita: {
    paddingVertical: espacio.sm,
  },
  textoFeito: {
    textDecorationLine: 'line-through',
  },

  /* --- album --- */
  conteoAlbum: {
    marginTop: espacio.xs,
    color: colores.aguja,
  },
  tira: {
    flexDirection: 'row',
    marginTop: espacio.lg,
  },
  miniatura: {
    width: ANCHO_MINIATURA,
    height: ALTO_MINIATURA,
    marginRight: espacio.sm,
    borderRadius: radio.sm,
    borderWidth: GROSOR_BORDE,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.penumbra,
    overflow: 'hidden',
  },
  miniaturaImagen: {
    width: '100%',
    height: '100%',
  },

  /* --- fichas --- */
  saldo: {
    marginTop: espacio.sm,
    color: colores.aguja,
  },

  /* --- seta --- */
  flecha: {
    width: LADO_FLECHA,
    height: LADO_FLECHA,
    borderTopWidth: GROSOR_BORDE,
    borderRightWidth: GROSOR_BORDE,
    borderColor: colores.ceniza,
    transform: [{ rotate: '45deg' }],
  },
});
