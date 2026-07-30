// lib/cosmicSoundSession.js
// As REGRAS DA SESSÃO do "Som do céu" — a parte que não é React nem Web Audio:
// quanto tempo de escuta conta como dia ativo, como o timer desliga sem corte
// seco, e o que a tela de bloqueio do celular recebe.
//
// Vive separado de components/CosmicSoundPlayer.js de propósito: um componente
// React Native não roda no `node --test` deste repo, então toda decisão que
// merece teste mora aqui (ver test/cosmicSoundSession.test.js). O componente
// fica só com pixels e eventos.
//
// ================== HONESTIDADE (mesma régua de lib/cosmicSound.js) ==========
// Nada aqui promete efeito sobre corpo ou mente. "Escuta" é literalmente tempo
// de som tocando, e só serve pra marcar PRESENÇA no app — a mesmíssima
// sequência de dias ativos que as leituras já marcam (lib/streak.js). Nenhum
// contador novo, nenhuma pontuação paralela, nenhuma promessa.
// ============================================================================
import { localDayStr } from './localDay';

// ---------------------------------------------------------------------------
// 1. QUANTO TEMPO CONTA COMO DIA ATIVO
// ---------------------------------------------------------------------------
// 3 minutos. O raciocínio, por partes:
//
//   - 3 segundos não pode contar, obviamente: seria dia ativo de graça, e a
//     sequência deste app só existe porque ela é honesta (ver lib/streak.js,
//     que recusa até tolerância de fuso pra não inflar).
//   - Também não pode ser alto a ponto de virar tarefa. Ler o Pensamento do
//     dia — que JÁ conta como dia ativo hoje (HomeScreen.markThoughtReadToday)
//     — leva de 1 a 2 minutos. Exigir 15 minutos de som seria cobrar do som um
//     esforço 10× maior que o da ação equivalente que já existe.
//   - 3 minutos é acima do acidente (abrir, ouvir, fechar) e abaixo da tarefa:
//     é o tempo de quem DEIXOU tocando, que é exatamente o comportamento que
//     esta feature quer reconhecer.
//
// E o crédito acontece uma vez por dia local, pelo caminho que já existe
// (recordActiveDay) — não é uma segunda moeda.
export const MIN_ESCUTA_SEGUNDOS = 180;

// Teto por tique. O relógio de parede é a fonte da verdade (setInterval é
// estrangulado em aba de segundo plano, então contar tiques mentiria pra menos),
// mas relógio de parede tem a armadilha oposta: se o aparelho DORMIU 3 horas
// com a aba aberta, o primeiro tique depois de acordar acusaria 10 800 s de
// "escuta" que ninguém escutou. Um tique nunca vale mais de 1 minuto.
export const TETO_POR_TIQUE_S = 60;

// Contador de escuta do dia. Não persiste nada: some ao recarregar a página, e
// isso é de propósito — o que precisa sobreviver (o dia ativo) já é gravado por
// lib/streak.js. Persistir os segundos criaria um estado paralelo pra manter em
// dia sem necessidade nenhuma.
export function criarContadorEscuta(opcoes = {}) {
  const minSegundos = Number.isFinite(opcoes.minSegundos) ? opcoes.minSegundos : MIN_ESCUTA_SEGUNDOS;
  const dia = typeof opcoes.dia === 'function' ? opcoes.dia : () => localDayStr();

  let diaAtual = dia();
  let segundos = 0;
  let jaContou = false;

  return {
    // Recebe o tempo REAL decorrido desde o tique anterior, em segundos.
    // Devolve { atingiu } — `atingiu: true` acontece UMA vez por dia local, no
    // exato tique em que a escuta cruza o mínimo. Quem chama é que decide o que
    // fazer (aqui: chamar recordActiveDay uma vez).
    registrar(segundosDecorridos) {
      const hoje = dia();
      // Virou a meia-noite com o som tocando: o dia novo começa do zero e pode
      // ganhar o próprio crédito. Sem isso, quem dorme ouvindo teria o dia
      // seguinte marcado de graça (ou nunca marcado, dependendo da ordem) —
      // os dois errados.
      if (hoje !== diaAtual) {
        diaAtual = hoje;
        segundos = 0;
        jaContou = false;
      }
      const passo = Number.isFinite(segundosDecorridos) && segundosDecorridos > 0 ? segundosDecorridos : 0;
      segundos += Math.min(passo, TETO_POR_TIQUE_S);

      if (!jaContou && segundos >= minSegundos) {
        jaContou = true;
        return { atingiu: true, segundos, dia: diaAtual, faltam: 0 };
      }
      return {
        atingiu: false,
        segundos,
        dia: diaAtual,
        faltam: Math.max(0, minSegundos - segundos),
      };
    },

    estado() {
      return { segundos, jaContou, dia: diaAtual, minSegundos };
    },
  };
}

// ---------------------------------------------------------------------------
// 2. TIMER DE DESLIGAR
// ---------------------------------------------------------------------------
// 0 = "até eu parar". Os três valores são os que a pessoa realmente pensa
// (um intervalo, um trecho de trabalho, uma hora antes de dormir).
export const SEM_TIMER = 0;
export const TIMER_MINUTOS = [15, 30, 60];

// O fade do timer é MAIS LONGO que o do botão de pausa (1,4 s no motor) porque
// os dois momentos são diferentes: pausar é uma decisão consciente e o corte
// rápido é o esperado; o timer expira quando a pessoa provavelmente não está
// olhando — talvez dormindo — e um som que some em 1 s acorda. Cinco degraus de
// 1,4 s levam o volume a zero em 7 s, e só então o motor faz a própria rampa.
export const FADE_PASSOS = 5;
export const FADE_PASSO_MS = 1400;

// Degraus de volume (posição de fader 0..1) até o silêncio. Linear no fader de
// propósito: lib/cosmicSound.js já converte fader→ganho numa curva de 40 dB
// (ganhoPerceptual), então passo linear AQUI é o que soa como decaimento
// uniforme no ouvido.
export function planoDeFade(volume, passos = FADE_PASSOS) {
  const v = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
  const n = Number.isFinite(passos) && passos >= 1 ? Math.floor(passos) : FADE_PASSOS;
  const degraus = [];
  for (let i = 1; i <= n; i++) degraus.push(Math.max(0, (v * (n - i)) / n));
  return degraus;
}

// Segundos que faltam pro timer. Devolve null quando não há timer — a tela usa
// isso pra decidir entre "Até eu parar" e "desliga em X".
export function calcularRestante(fimMs, agoraMs = Date.now()) {
  if (!Number.isFinite(fimMs)) return null;
  return Math.max(0, Math.ceil((fimMs - agoraMs) / 1000));
}

// ---------------------------------------------------------------------------
// 3. SESSÃO DE MÍDIA (tela de bloqueio)
// ---------------------------------------------------------------------------
// Objeto de metadados no formato que o construtor MediaMetadata espera. Função
// pura: quem monta o objeto do navegador é o contexto, aqui só se decide O QUE
// aparece na tela de bloqueio — e nenhuma dessas strings pode prometer efeito,
// porque a tela de bloqueio é justamente onde o texto aparece FORA do app, sem
// o aviso ao lado.
export function metadadosDeMidia({ titulo, artista, album, artwork } = {}) {
  const meta = {
    title: titulo || '',
    artist: artista || '',
    album: album || '',
    artwork: [],
  };
  if (artwork) {
    meta.artwork = [{ src: artwork, sizes: '512x512', type: 'image/png' }];
  }
  return meta;
}

// ---------------------------------------------------------------------------
// 4. ÂNCORA DE SESSÃO DE MÍDIA — o arquivo de áudio que não existe no bundle
// ---------------------------------------------------------------------------
// O problema real: a Web Audio API sozinha NÃO registra uma sessão de mídia no
// Chrome. Sem sessão de mídia, minimizar o navegador (ou apagar a tela) mata o
// áudio em segundos, e é exatamente o caso de uso desta feature. O que registra
// a sessão é um HTMLAudioElement tocando.
//
// Como lib/cosmicSound.js não empacota nenhum mp3 (todo o som é sintetizado),
// geramos aqui um WAV de silêncio EM MEMÓRIA, em tempo de execução: alguns
// milhares de bytes, zero download, zero arquivo no repositório. Ele toca em
// loop, quase inaudível, só pra segurar a sessão de mídia enquanto o som real
// sai pela Web Audio.
//
// Por que 0,0001 de volume e não `muted`: navegador ignora elemento MUDO na
// hora de decidir se há mídia tocando. Silêncio digital com volume acima de
// zero passa nos dois critérios sem produzir som nenhum.
export function bytesWavSilencioso(segundos = 2, taxa = 8000) {
  const s = Number.isFinite(segundos) && segundos > 0 ? segundos : 2;
  const sr = Number.isFinite(taxa) && taxa > 0 ? Math.floor(taxa) : 8000;
  const amostras = Math.max(1, Math.floor(s * sr));
  const bytes = new Uint8Array(44 + amostras);
  const escreverTexto = (pos, texto) => {
    for (let i = 0; i < texto.length; i++) bytes[pos + i] = texto.charCodeAt(i);
  };
  const escrever32 = (pos, valor) => {
    bytes[pos] = valor & 0xff;
    bytes[pos + 1] = (valor >> 8) & 0xff;
    bytes[pos + 2] = (valor >> 16) & 0xff;
    bytes[pos + 3] = (valor >> 24) & 0xff;
  };
  const escrever16 = (pos, valor) => {
    bytes[pos] = valor & 0xff;
    bytes[pos + 1] = (valor >> 8) & 0xff;
  };

  escreverTexto(0, 'RIFF');
  escrever32(4, 36 + amostras);
  escreverTexto(8, 'WAVE');
  escreverTexto(12, 'fmt ');
  escrever32(16, 16); // tamanho do bloco fmt
  escrever16(20, 1); // PCM
  escrever16(22, 1); // mono
  escrever32(24, sr);
  escrever32(28, sr); // bytes por segundo (8 bits mono)
  escrever16(32, 1); // alinhamento de bloco
  escrever16(34, 8); // bits por amostra
  escreverTexto(36, 'data');
  escrever32(40, amostras);
  // PCM de 8 bits é SEM sinal: o silêncio é 128, não 0. Preencher com 0 daria
  // o valor mínimo da escala — um estalo seco no início de cada volta do loop.
  bytes.fill(128, 44);
  return bytes;
}

function paraBase64(bytes) {
  let binario = '';
  // Em blocos: String.fromCharCode(...array) estoura o limite de argumentos da
  // pilha com arrays grandes (e este tem dezenas de milhares de bytes).
  const BLOCO = 8192;
  for (let i = 0; i < bytes.length; i += BLOCO) {
    binario += String.fromCharCode.apply(null, bytes.subarray(i, i + BLOCO));
  }
  if (typeof btoa === 'function') return btoa(binario);
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64');
  return '';
}

export function wavSilenciosoDataUri(segundos = 2, taxa = 8000) {
  return `data:audio/wav;base64,${paraBase64(bytesWavSilencioso(segundos, taxa))}`;
}

// ---------------------------------------------------------------------------
// 5. BRILHO DO TIMBRE EM PALAVRA
// ---------------------------------------------------------------------------
// A tela precisa dizer POR QUE o som está assim hoje numa linha só ("Lua cheia
// em Aquário — timbre mais aberto hoje"). A iluminação vira uma das três
// palavras; os cortes são escolha estética, iguais aos de lib/cosmicSound.js
// (que interpola o filtro continuamente entre os mesmos extremos).
export function faixaDeBrilho(iluminacao) {
  const luz = Number.isFinite(iluminacao) ? iluminacao : 50;
  if (luz >= 66) return 'alto';
  if (luz >= 33) return 'medio';
  return 'baixo';
}
