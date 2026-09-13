// hooks/useFraseAtual.js — QUAL FRASE A VOZ ESTA DIZENDO AGORA.
//
// ===========================================================================
// O QUE ESTE ARQUIVO FAZ
// ===========================================================================
// Recebe o player do expo-audio e a lista de trechos medidos
// (datos/profunda-tempos.json, via `trechosDe` em datos/profunda.js) e devolve o
// INDICE da frase que esta tocando. components/TextoNoRitmo.js pinta a partir
// disso; screens/LeituraProfundaScreen.js so liga os dois.
//
// ===========================================================================
// DE ONDE SAI O TEMPO — CONFERIDO NO PACOTE INSTALADO, NAO SUPOSTO
// ===========================================================================
// node_modules/expo-audio/build/AudioModule.types.d.ts declara, na propria
// classe AudioPlayer, tres campos lidos direto do objeto:
//
//     playing: boolean        "whether the player is currently playing"
//     currentTime: number     "current position through the audio item in seconds"
//     duration: number        "total duration of the audio in seconds"
//
// e AudioModule.web.d.ts repete os tres como getters no AudioPlayerWeb. Ou seja:
// os mesmos tres nomes valem no iOS, no Android e na web, e sao SEGUNDOS — nao
// milissegundos. Existe tambem o evento `playbackStatusUpdate`, mas ele nao e o
// caminho daqui: o intervalo padrao dele e 500 ms (AudioPlayerOptions.updateInterval),
// o que erraria a troca de frase em ate meio segundo, e um listener que nao
// dispare em alguma plataforma deixaria o texto MUDO sem acusar erro nenhum.
// Ler a propriedade nao tem esse risco: se o player existe, ela responde.
//
// ===========================================================================
// POR QUE 120 ms, E POR QUE ISSO NAO PESA
// ===========================================================================
// Sao 8 leituras por segundo de duas propriedades de um objeto nativo. O olho
// nao distingue 120 ms de 16 ms na troca de uma LINHA de texto (as frases duram
// ~4,7 s em media), e um requestAnimationFrame a 60 fps faria 7,5x mais trabalho
// para o mesmo resultado visivel. O que custa caro nao e a leitura, e o RENDER:
// por isso `progresso` sai quantizado em 1% (ver abaixo) e o estado so muda
// quando um dos tres campos muda de verdade.
//
// O intervalo so existe enquanto ha player E `ativo` e verdadeiro. O carrossel
// monta os cinco cards ao mesmo tempo; sem esse portao seriam cinco relogios
// rodando para uma voz so.
//
// ===========================================================================
// ESTE ARQUIVO NAO IMPORTA react-native — DE PROPOSITO
// ===========================================================================
// So `react`. Assim `indiceEm` e `deveVibrar` rodam sob `node --test` sem
// nenhum mock de RN, e test/madremaria-profunda.test.js consegue provar a matematica da
// sincronia com numeros de verdade. O haptico, que precisa de Platform e de
// expo-haptics, mora em components/TextoNoRitmo.js — aqui fica so a REGRA dele,
// que e a parte que pode dar errado em silencio.
import { useEffect, useState } from 'react';

/** De quanto em quanto tempo o relogio le o player. Ver o cabecalho. */
export const INTERVALO_MS = 120;

/**
 * O piso entre duas vibracoes, em segundos.
 *
 * Sao 81 frases na leitura que uma pessoa ouve (as tres versoes do fecho somam
 * 137 no arquivo de tempos, mas ela so ouve uma) em ~6,9 minutos: uma vibracao a
 * cada ~5,1 s na media, que e um
 * ritmo de leitura. Mas a media esconde o problema — nos audios medidos ha
 * frases curtas coladas ("Quanto ao amor:" dura 1,24 s; no bloco 8 ha um par a
 * 0,49 s de distancia). Tres toquinhos em um segundo nao e ritmo, e uma rajada:
 * a pessoa nao entende o que o aparelho esta dizendo e desliga a vibracao
 * inteira em Ajustes — perdendo tambem o toque da raspadinha e o do no do dia.
 * Entao a segunda vibracao do par e PULADA. A frase ainda acende; so o aparelho
 * fica quieto.
 */
export const INTERVALO_MINIMO_VIBRACAO = 1.2;

/**
 * O `ini` de um trecho, em segundos, ou NaN quando ele nao tem tempo medido.
 *
 * `Number(trecho.ini)` NAO serve aqui, e este e o tipo de erro que passa em toda
 * revisao: `Number(null)` e 0, e 0 e um numero finito perfeitamente valido. Com
 * a conversao ingenua, um bloco SEM tempo medido (`ini: null`, o caminho de
 * degradacao de `trechosDe`) viraria um bloco em que todas as frases comecam no
 * segundo zero — a primeira ficaria acesa o audio inteiro, e ninguem veria erro
 * nenhum no console.
 */
function inicioDe(trecho) {
  const ini = trecho?.ini;
  return typeof ini === 'number' && Number.isFinite(ini) ? ini : NaN;
}

/**
 * O INDICE da frase que contem `tempo`, ou -1.
 *
 * Busca binaria sobre os inicios, que ja vem em ordem crescente do arquivo de
 * tempos. Com 13 frases a diferenca para um `find` linear e irrelevante — o que
 * a busca binaria garante de verdade e que o custo nao cresce se um dia um audio
 * de dez minutos entrar aqui.
 *
 * Devolve -1 quando:
 *  · nao ha trechos;
 *  · o tempo nao e um numero utilizavel (player recem-criado devolve NaN);
 *  · os trechos nao tem tempo medido (`ini: null`, que e o que `trechosDe`
 *    entrega quando profunda-tempos.json nao cobre aquele bloco). Nesse caso
 *    NINGUEM acende, e o texto fica exatamente como era antes desta feature.
 *
 * @param {ReadonlyArray<{ini: number|null}>} trechos
 * @param {number} tempo  segundos
 * @returns {number} indice em `trechos`, ou -1
 */
export function indiceEm(trechos, tempo) {
  if (!Array.isArray(trechos) || trechos.length === 0) return -1;
  if (!Number.isFinite(tempo) || tempo < 0) return -1;
  if (!Number.isFinite(inicioDe(trechos[0]))) return -1;

  let baixo = 0;
  let alto = trechos.length - 1;
  let achado = -1;

  while (baixo <= alto) {
    const meio = (baixo + alto) >> 1;
    const ini = inicioDe(trechos[meio]);
    if (!Number.isFinite(ini)) return achado;
    if (tempo < ini) {
      alto = meio - 1;
    } else {
      achado = meio;
      baixo = meio + 1;
    }
  }

  return achado;
}

/**
 * A vibracao desta frase pode sair?
 *
 * Puro e exportado para poder ser provado com numeros: e a regra que, quando
 * erra, erra em silencio — ninguem ve uma rajada de haptic num screenshot.
 *
 * @param {number|null} iniAnterior  o `ini` da frase que vibrou por ultimo
 * @param {number} iniNova           o `ini` da frase que acabou de entrar
 * @param {number} [minimo]          o piso, em segundos
 */
export function deveVibrar(iniAnterior, iniNova, minimo = INTERVALO_MINIMO_VIBRACAO) {
  if (!Number.isFinite(iniNova)) return false;
  // Primeira frase do audio: nada para comparar, e o toque diz "comecou".
  if (!Number.isFinite(iniAnterior)) return true;
  // Voltou no tempo — ela tocou de novo desde o inicio. O piso nao vale aqui,
  // senao o replay comecaria mudo.
  if (iniNova < iniAnterior) return true;
  // A folga de 1e-9 nao e paranoia: os tempos vem do Whisper com duas casas, e
  // em ponto flutuante 11.2 - 10 da 1.1999999999999993. Sem ela, um par que esta
  // EXATAMENTE no piso e recusado — e a diferenca entre vibrar e nao vibrar
  // ficaria dependendo do arredondamento binario de um numero decimal.
  return iniNova - iniAnterior >= minimo - 1e-9;
}

/* Quantizacao do progresso: 1%.
 *
 * Sem isto o `currentTime` muda a cada leitura e o estado mudaria 8x por
 * segundo, arrastando a lista de frases junto por causa de uma barra que
 * ninguem desenhou ainda. Em 1% o numero anda uma vez a cada ~0,5 s num audio
 * de 54 s — o suficiente para uma barra parecer continua, e 16x menos render. */
const quantizar = (fracao) => Math.round(fracao * 100) / 100;

const PARADO = Object.freeze({ indice: -1, progresso: 0, tocando: false });

const igual = (a, b) =>
  a.indice === b.indice && a.progresso === b.progresso && a.tocando === b.tocando;

/**
 * O relogio da leitura: le o player e diz que frase esta na boca da voz.
 *
 * @param {object|null} player   o AudioPlayer do expo-audio. `null` ate o
 *   primeiro toque no botao — components/BotaoOuvir.js so cria o player quando
 *   o dedo pede, e essa preguica e o que impede o carrossel de instanciar cinco
 *   players para tocar um.
 * @param {ReadonlyArray<{ini:number|null,fim:number|null}>} trechos
 * @param {object} [opcoes]
 * @param {boolean} [opcoes.ativo=true]  desligue nos cards que nao estao na
 *   tela. Sem isso, cinco relogios para uma voz.
 * @param {number} [opcoes.duracao]  a duracao medida do arquivo, de reserva
 *   para o caso de `player.duration` ainda vir 0 (ele so e conhecido depois de
 *   o audio carregar, e o `progresso` sairia 0 o audio inteiro).
 * @returns {{ indice: number, progresso: number, tocando: boolean }}
 *   `indice` e -1 sempre que a voz NAO esta tocando — pausada, terminada ou
 *   nunca iniciada. Nesse estado a tela mostra o texto inteiro, sem destaque
 *   nenhum: quem parou o audio voltou a ler, e um realce parado no meio da
 *   pagina viraria uma marca sem dono.
 */
export function useFraseAtual(player, trechos, opcoes) {
  const ativo = opcoes?.ativo !== false;
  const duracaoDeReserva = Number(opcoes?.duracao) > 0 ? Number(opcoes.duracao) : 0;

  const [estado, setEstado] = useState(PARADO);

  useEffect(() => {
    if (!player || !ativo) {
      setEstado((atual) => (igual(atual, PARADO) ? atual : PARADO));
      return undefined;
    }

    let vivo = true;

    const ler = () => {
      if (!vivo) return;

      let tocando = false;
      let tempo = NaN;
      let duracao = 0;

      // Um player ja descartado (a pessoa saiu da tela no meio) lanca ao ser
      // lido em algumas plataformas. Isso e "parou", nunca uma tela quebrada.
      try {
        tocando = player.playing === true;
        tempo = Number(player.currentTime);
        duracao = Number(player.duration);
      } catch {
        tocando = false;
        tempo = NaN;
        duracao = 0;
      }

      const total = Number.isFinite(duracao) && duracao > 0 ? duracao : duracaoDeReserva;
      const bruto = total > 0 && Number.isFinite(tempo) ? tempo / total : 0;
      const progresso = quantizar(Math.min(1, Math.max(0, bruto)));

      // `progresso` continua valendo com o audio pausado: ele diz ONDE a leitura
      // parou, e zerar isso na pausa seria mentira. Quem some e o destaque.
      const proximo = { indice: tocando ? indiceEm(trechos, tempo) : -1, progresso, tocando };

      setEstado((atual) => (igual(atual, proximo) ? atual : proximo));
    };

    ler();
    const relogio = setInterval(ler, INTERVALO_MS);
    return () => {
      vivo = false;
      clearInterval(relogio);
    };
  }, [player, trechos, ativo, duracaoDeReserva]);

  return estado;
}

export default useFraseAtual;
