// lib/cosmicSound.js
// "Som do Céu" — trilha ambiente SINTETIZADA no aparelho, sem nenhum arquivo de
// áudio no bundle (zero mp3/wav): tudo é gerado pela Web Audio API na hora.
//
// POR QUE SINTETIZAR EM VEZ DE EMPACOTAR UM LOOP:
//   1. Um loop de N segundos sempre denuncia a emenda depois de uns minutos —
//      e essa feature existe justamente pra ficar aberta por muito tempo.
//   2. O app já tem motor astrológico real (fase da Lua, signo lunar, regente
//      do dia pela ordem caldaica, aspectos com orbe). Sintetizando, o som pode
//      SER DERIVADO desse céu em vez de ser mais uma playlist de frequências.
//   3. Bundle não engorda e não há download.
//
// ================== HONESTIDADE (regra inegociável do app) ==================
// Este módulo NÃO promete efeito nenhum sobre corpo ou mente. É som ambiente
// pra ritual, foco e companhia — o mesmo enquadramento simbólico do resto do
// app (ver lib/lunarCalendar.js e lib/chatResponses.js). As frequências de
// Solfeggio existem aqui como PRESET DE AMBIENTE, com a origem real declarada
// (proposta dos anos 1970, sem confirmação científica). Nenhuma string deste
// arquivo pode alegar efeito terapêutico — se alguém for acrescentar texto
// aqui depois, é essa a régua.
// ===========================================================================
//
// SEPARAÇÃO EXPLÍCITA — o que é TRADIÇÃO e o que é DECISÃO ESTÉTICA MINHA:
// cada bloco de mapeamento abaixo traz essa marcação. Nada foi inventado e
// apresentado como tradição.

import { moonSign, aspects, isMercuryRetrograde } from './signs';
import { getMoonPhase } from './lunarCalendar';
import { rulerOfDay } from './dailyThought';
import { localDayStr } from './localDay';

// AsyncStorage por require preguiçoso dentro de try/catch — mesmo padrão do
// astronomy-engine em lib/signs.js e lib/lunarCalendar.js. Sem isso, este
// módulo não carregaria fora do runtime RN (Node, teste, SSR) só por causa da
// preferência de volume, que é o detalhe menos importante do arquivo.
let _Storage;
function getStorage() {
  if (_Storage !== undefined) return _Storage;
  try {
    const mod = require('@react-native-async-storage/async-storage');
    _Storage = (mod && (mod.default || mod)) || null;
  } catch {
    _Storage = null;
  }
  return _Storage;
}

const CHAVE_VOLUME = 'cosmic-sound-volume';
const CHAVE_PRESET = 'cosmic-sound-preset';

// ---------------------------------------------------------------------------
// 1. NOTA BASE — regente do dia (ordem caldaica)
// ---------------------------------------------------------------------------
// TRADIÇÃO (real, já usada pelo app em lib/dailyThought.js): a ordem caldaica
// Sol–Lua–Marte–Mercúrio–Júpiter–Vênus–Saturno rege os dias da semana. Isso é
// fato histórico, não invenção nossa — é a origem dos nomes dos dias em várias
// línguas.
//
// TRADIÇÃO (real, mas AMBÍGUA): a "harmonia das esferas" associa os sete
// planetas a sete tons. Só que as fontes DISCORDAM da direção: no Sonho de
// Cipião (Cícero) a esfera mais externa e veloz soa AGUDA e a Lua soa GRAVE;
// leituras posteriores e a intuição moderna fazem o contrário — planeta lento e
// distante = som grave. Não existe, portanto, uma "nota tradicional de Saturno"
// pra obedecer.
//
// DECISÃO ESTÉTICA MINHA (declarada como tal): adotei a direção MODERNA —
// Saturno mais grave, Lua mais aguda — contra Cícero, porque o próprio texto do
// app para sábado (dia de Saturno) fala de "encarar o que pesa"; um drone agudo
// no sábado brigaria com a leitura que a pessoa está lendo na mesma tela.
// Os valores em Hz são escolha minha: sete graus de uma escala menor natural em
// Lá, afinação igual com Lá 440, no registro grave de drone.
export const NOTA_POR_REGENTE = {
  Saturno: 55.0, // Lá1
  Júpiter: 61.74, // Si1
  Marte: 65.41, // Dó2
  Sol: 73.42, // Ré2
  Vênus: 82.41, // Mi2
  Mercúrio: 87.31, // Fá2
  Lua: 98.0, // Sol2
};
const NOTA_PADRAO = 73.42;

// ---------------------------------------------------------------------------
// 2. TIMBRE / BRILHO — fase da Lua
// ---------------------------------------------------------------------------
// O VÍNCULO é astronômico REAL: a iluminação vem de getMoonPhase(), que calcula
// a fase de verdade via astronomy-engine. Não é sorteio nem calendário fixo.
//
// DECISÃO ESTÉTICA MINHA: iluminação → corte do filtro e presença dos parciais
// agudos. Lua Nova = fechado e grave (corte baixo, oitava quase inaudível);
// Lua Cheia = aberto e brilhante. Nenhuma tradição diz "Lua Nova tem corte de
// 320 Hz" — a analogia escuro/fechado ↔ claro/aberto é autoral, e é só isso.
const CORTE_MIN_HZ = 320; // Lua Nova
const CORTE_MAX_HZ = 2400; // Lua Cheia

// ---------------------------------------------------------------------------
// 3. CAMADA DE RUÍDO — elemento do signo lunar de hoje
// ---------------------------------------------------------------------------
// TRADIÇÃO (real, já no app em lib/signs.js): cada signo pertence a um dos
// quatro elementos — fogo, terra, ar, água. Atribuição clássica, milenar.
//
// DECISÃO ESTÉTICA MINHA: qual textura de ruído filtrado representa cada
// elemento. Fogo = banda média com crepitação; ar = agudo e arejado (vento);
// água = grave rolando devagar (chuva/mar); terra = muito grave e quase parado
// (zumbido de caverna). É desenho de som, não correspondência tradicional.
const TEXTURA_POR_ELEMENTO = {
  fogo: { filtro: 'bandpass', centroHz: 1400, q: 0.9, varreduraHz: 900, ganho: 0.1, descricao: 'crepitação seca, como brasa' },
  ar: { filtro: 'highpass', centroHz: 700, q: 0.7, varreduraHz: 500, ganho: 0.12, descricao: 'sopro arejado, como vento em fresta' },
  'água': { filtro: 'lowpass', centroHz: 520, q: 1.2, varreduraHz: 380, ganho: 0.16, descricao: 'rolo grave, como chuva ou mar longe' },
  terra: { filtro: 'lowpass', centroHz: 220, q: 0.6, varreduraHz: 90, ganho: 0.18, descricao: 'zumbido fundo e quase parado, como caverna' },
};
const TEXTURA_PADRAO = TEXTURA_POR_ELEMENTO.terra;

// ---------------------------------------------------------------------------
// 4. PULSO EXTRA — aspecto exato do dia
// ---------------------------------------------------------------------------
// TRADIÇÃO (real): aspecto é a distância angular entre dois planetas, e quanto
// menor o orbe, mais "exato" ele é — convenção de qualquer efeméride.
//
// DECISÃO MINHA (herdada de lib/dailyThought.js, mesma lógica): só conta
// aspecto que envolva luminar ou planeta pessoal, porque par de planeta lento
// fica em orbe por meses e não é "de hoje". E "exato" aqui é orbe ≤ 1°.
// EFEITO NO SOM (estético): quando existe, entra uma segunda voz de pulso na
// trama. Nada além disso — não muda o significado de nada.
const ORBE_EXATO_GRAUS = 1;
const PLANETAS_PESSOAIS = new Set(['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte']);

// ---------------------------------------------------------------------------
// 5. DESENHO DO PULSO — Mercúrio retrógrado
// ---------------------------------------------------------------------------
// FATO ASTRONÔMICO (não tradição, não invenção): movimento retrógrado aparente
// é real e observável — o planeta parece andar pra trás no céu por causa da
// geometria entre as duas órbitas. lib/signs.js calcula isso de verdade
// (isMercuryRetrograde), comparando a longitude dois dias antes e dois depois.
//
// DECISÃO ESTÉTICA MINHA (100% autoral, nenhuma tradição diz isso): quando
// Mercúrio está retrógrado, o envelope do pulso INVERTE — em vez de entrar
// rápido e sumir devagar, ele entra devagar e sai curto, como uma nota tocada
// de trás pra frente. É uma piada visual-sonora com o "andar pra trás", não uma
// afirmação sobre comunicação, tecnologia ou qualquer outra coisa.
// Não muda o significado de nada e não é apresentado como presságio.
// Fração da duração do pulso gasta subindo. Direto = sobe rápido, cauda longa
// (nota tocada normalmente). Retrógrado = sobe devagar, cauda curta (a mesma
// nota "de trás pra frente"). Nenhum dos dois é corte seco: os dois lados são
// rampa, sempre.
export const ENVELOPE_DIRETO = { ataqueFrac: 0.22 };
export const ENVELOPE_RETROGRADO = { ataqueFrac: 0.78 };

function aspectoExatoDoDia(diaStr) {
  const todos = aspects(diaStr);
  if (!todos || todos.length === 0) return null;
  const candidatos = todos.filter(
    (a) => (PLANETAS_PESSOAIS.has(a.planetA) || PLANETAS_PESSOAIS.has(a.planetB)) && a.orb <= ORBE_EXATO_GRAUS
  );
  if (candidatos.length === 0) return null;
  return candidatos.reduce((melhor, a) => (a.orb < melhor.orb ? a : melhor), candidatos[0]);
}

// ---------------------------------------------------------------------------
// getSkyTuning — o céu de um dia virando parâmetros de som.
// ---------------------------------------------------------------------------
// PURO e DETERMINÍSTICO POR DIA LOCAL: duas chamadas no mesmo dia devolvem
// exatamente os mesmos números, mesmo com horas de diferença. Isso importa
// porque a pessoa vai deixar o app aberto por horas — o timbre não pode mudar
// sozinho às 21h só porque o dia UTC virou (mesma armadilha documentada em
// lib/localDay.js). Ancoramos ao meio-dia UTC do dia local, igual dailyThought.
//
// NUNCA FABRICA: sem astronomy-engine, devolve ceuDisponivel: false e uma
// afinação neutra declarada como neutra. O som toca, mas o app não pode dizer
// que aquilo é o céu de hoje.
export function getSkyTuning(data = new Date()) {
  const diaStr = localDayStr(data instanceof Date ? data : new Date(data));
  const fase = getMoonPhase(new Date(`${diaStr}T12:00:00Z`));
  const regente = rulerOfDay(data instanceof Date ? data : new Date(data));
  const notaHz = NOTA_POR_REGENTE[regente.planet] ?? NOTA_PADRAO;

  // Sem efeméride (astronomy-engine ausente) só a PARTE LUNAR se perde. O
  // regente do dia continua real: a ordem caldaica é aritmética de dia da
  // semana, não depende de efeméride nenhuma. Por isso a nota base é mantida
  // aqui — neutralizar ela seria jogar fora um dado verdadeiro. O que fica
  // declarado como indisponível é só o céu observado (fase, signo, aspecto),
  // e é isso que `ceuDisponivel: false` sinaliza pra tela.
  if (!fase) {
    return {
      dia: diaStr,
      ceuDisponivel: false,
      regente: regente.planet,
      notaHz,
      fase: null,
      iluminacao: null,
      corteHz: 900,
      aberturaHarmonica: 0.4,
      signoLua: null,
      elemento: null,
      textura: TEXTURA_PADRAO,
      aspectoExato: null,
      vozesDePulso: 1,
      mercurioRetrogrado: null,
      envelopePulso: ENVELOPE_DIRETO,
    };
  }

  // iluminacao 0–100 → 0..1. Interpolação exponencial no corte porque a
  // percepção de altura/brilho é logarítmica: interpolar linearmente faria a
  // metade do caminho soar bem mais perto do extremo agudo do que do grave.
  const luz = Math.max(0, Math.min(1, (fase.illumination ?? 50) / 100));
  const corteHz = CORTE_MIN_HZ * Math.pow(CORTE_MAX_HZ / CORTE_MIN_HZ, luz);

  const lua = moonSign(diaStr);
  const elemento = lua && lua.element ? lua.element : null;
  const textura = (elemento && TEXTURA_POR_ELEMENTO[elemento]) || TEXTURA_PADRAO;

  const aspecto = aspectoExatoDoDia(diaStr);
  const retrogrado = isMercuryRetrograde(diaStr);

  return {
    dia: diaStr,
    ceuDisponivel: true,
    regente: regente.planet,
    notaHz,
    fase: fase.name,
    iluminacao: fase.illumination,
    corteHz,
    // Quanto a oitava e a quinta aparecem na mistura. Lua Nova ≈ só o
    // fundamental; Lua Cheia ≈ tríade aberta.
    aberturaHarmonica: 0.15 + luz * 0.85,
    signoLua: lua ? lua.name : null,
    elemento,
    textura,
    aspectoExato: aspecto,
    vozesDePulso: aspecto ? 2 : 1,
    mercurioRetrogrado: retrogrado,
    envelopePulso: retrogrado === true ? ENVELOPE_RETROGRADO : ENVELOPE_DIRETO,
  };
}

// Frase honesta pra tela mostrar POR QUE o som está assim hoje. Só descreve o
// que foi calculado — sem adjetivo de efeito, sem promessa.
export function descreverCeu(afinacao) {
  const t = afinacao || getSkyTuning();
  if (!t.ceuDisponivel) {
    // Honesto sobre o que é real mesmo aqui: o dia da semana é, a Lua não foi
    // calculada. Nada de fingir que o som "é o céu de hoje".
    return `Hoje é dia de ${t.regente} e a nota base vem daí. A posição da Lua não pôde ser calculada agora, então o resto do timbre é neutro — não é o céu de hoje.`;
  }
  const partes = [`Hoje é dia de ${t.regente}: a nota base do drone vem daí.`];
  if (t.fase) partes.push(`${t.fase} (${t.iluminacao}% iluminada) define o brilho do timbre.`);
  if (t.signoLua && t.elemento) partes.push(`Lua em ${t.signoLua}, elemento ${t.elemento} — daí a camada de ${t.textura.descricao}.`);
  if (t.aspectoExato) {
    partes.push(
      `${t.aspectoExato.planetA} e ${t.aspectoExato.planetB} em ${t.aspectoExato.aspectType.toLowerCase()} quase exato — por isso entrou uma voz a mais nos pulsos.`
    );
  }
  if (t.mercurioRetrogrado === true) {
    partes.push('Mercúrio está retrógrado: os pulsos entram ao contrário, subindo devagar e cortando curto.');
  }
  partes.push('Amanhã o som muda porque o céu muda. É ambiente pra acompanhar sua leitura, nada além disso.');
  return partes.join(' ');
}

// ---------------------------------------------------------------------------
// PRESETS
// ---------------------------------------------------------------------------
// O padrão é o céu de hoje. Os demais são os pedidos de "frequência": eles
// trocam APENAS a nota base — o timbre, a textura de ruído e os pulsos
// continuam vindo do céu real do dia. Ou seja: mesmo no preset de 528 Hz, o som
// de hoje é diferente do de amanhã.
//
// ORIGEM DECLARADA: a numeração chamada de "Solfeggio" foi proposta em 1974
// (Joseph Puleo / Leonard Horowitz), a partir de uma leitura numerológica do
// hino Ut queant laxis. Não é notação medieval e não tem confirmação
// científica. Está aqui como escolha de ambiente, com a origem na cara — e o
// campo `associacaoTradicional` descreve o que ESSA tradição diz, não o que o
// app afirma.
export const AVISO_PRESETS =
  'Frequências são escolha de ambiente, dentro de uma tradição simbólica dos anos 1970 — sem confirmação científica e sem qualquer promessa de efeito. Use como companhia sonora e ponto de foco.';

export const PRESETS = [
  {
    id: 'ceu-de-hoje',
    nome: 'Céu de hoje',
    baseHz: null, // vem de getSkyTuning
    associacaoTradicional: null,
    usoPratico: 'A nota nasce do regente do dia e o timbre, da fase da Lua. Muda sozinho todo dia.',
  },
  {
    id: 'solfeggio-396',
    nome: '396 Hz',
    baseHz: 396,
    associacaoTradicional: 'A tradição associa esta frequência a deixar para trás culpa e medo.',
    usoPratico: 'Pra ficar em silêncio junto, sem tela.',
  },
  {
    id: 'solfeggio-417',
    nome: '417 Hz',
    baseHz: 417,
    associacaoTradicional: 'A tradição associa esta frequência a recomeço e mudança de situação.',
    usoPratico: 'Pra acompanhar o começo de um ciclo lunar novo.',
  },
  {
    id: 'solfeggio-528',
    nome: '528 Hz',
    baseHz: 528,
    associacaoTradicional: 'A tradição associa esta frequência a amor e transformação.',
    usoPratico: 'Pra deixar tocando enquanto você lê o Pensamento do dia.',
  },
  {
    id: 'solfeggio-639',
    nome: '639 Hz',
    baseHz: 639,
    associacaoTradicional: 'A tradição associa esta frequência a vínculos e relacionamentos.',
    usoPratico: 'Pra abrir junto com a leitura de casal.',
  },
  {
    id: 'solfeggio-741',
    nome: '741 Hz',
    baseHz: 741,
    associacaoTradicional: 'A tradição associa esta frequência a expressão e clareza ao falar.',
    usoPratico: 'Pra escrever no Diário Cósmico com o som ao fundo.',
  },
  {
    id: 'solfeggio-852',
    nome: '852 Hz',
    baseHz: 852,
    associacaoTradicional: 'A tradição associa esta frequência a intuição.',
    usoPratico: 'Pra ficar com o app aberto antes de dormir, no volume baixo.',
  },
  {
    id: 'afinacao-432',
    nome: '432 Hz',
    baseHz: 432,
    // Este NÃO é Solfeggio: é uma proposta de afinação de concerto alternativa
    // ao padrão internacional de Lá 440 (norma desde 1955). Fato verificável;
    // a preferência por 432 é gosto e tradição de nicho, não acústica superior.
    associacaoTradicional: 'Afinação alternativa ao padrão internacional de 440 Hz, preferida por parte da tradição sonora esotérica.',
    usoPratico: 'Pra quem já gosta desse padrão de afinação.',
  },
];

export function presetPorId(id) {
  return PRESETS.find((p) => p.id === id) || PRESETS[0];
}

// ---------------------------------------------------------------------------
// REGISTRO DO DRONE — por que as camadas às vezes descem em vez de subir
// ---------------------------------------------------------------------------
// As notas do céu são graves (55–98 Hz): empilhar quinta e oitava ACIMA soa
// cheio e macio. Já os presets de frequência são agudos (396–852 Hz) — em cima
// de 852 Hz, uma quinta justa dá 1278 Hz e a oitava 1704 Hz. Sine puro nessa
// faixa, tocando por HORAS (que é literalmente o caso de uso desta feature),
// fatiga o ouvido e vira apito.
//
// DECISÃO ESTÉTICA/DE SEGURANÇA AUDITIVA MINHA: acima de 220 Hz as camadas de
// apoio INVERTEM e vão pra BAIXO (oitava abaixo, quinta abaixo). O fundamental
// continua sendo EXATAMENTE a frequência escolhida — quem pediu 528 Hz recebe
// 528 Hz —, só o acompanhamento muda de lado. Os intervalos seguem justos
// (razões 2:1 e 3:2), invertidos.
//
// A desafinação de poucos cents é de propósito: dois osciladores em intervalo
// justo perfeito batem zero e soam mortos; alguns cents de diferença produzem
// um batimento lento que dá vida sem sujar a afinação.
export const LIMITE_REGISTRO_HZ = 220; // Lá3

export function camadasDrone(baseHz, aberturaHarmonica) {
  const abertura = Number.isFinite(aberturaHarmonica) ? Math.max(0, Math.min(1, aberturaHarmonica)) : 0.5;
  const agudo = baseHz > LIMITE_REGISTRO_HZ;
  return [
    { razao: 1, tipo: 'sine', ganho: 0.22, desafinacao: -4 },
    { razao: agudo ? 2 / 3 : 3 / 2, tipo: 'sine', ganho: 0.13 * abertura, desafinacao: 5 },
    { razao: agudo ? 1 / 2 : 2, tipo: 'triangle', ganho: 0.07 * abertura, desafinacao: -7 },
  ];
}

// ---------------------------------------------------------------------------
// VOLUME — curva perceptual + memória da preferência
// ---------------------------------------------------------------------------
// Ouvido humano responde a razão, não a diferença: um fader linear entrega quase
// toda a mudança audível nos últimos 20% do curso e o resto some. Mapeamos o
// slider 0..1 numa faixa de 40 dB (0,5 no slider = −20 dB, metade da altura
// percebida), com 0 sendo silêncio absoluto de verdade.
const FAIXA_DB = 40;
const TETO = 0.6; // margem de headroom: nunca chegamos a 1.0 no master

export function ganhoPerceptual(volume) {
  const v = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 0;
  if (v <= 0) return 0;
  return Math.pow(10, (FAIXA_DB * (v - 1)) / 20);
}

const VOLUME_PADRAO = 0.45;
let _volumeCache = null;

export async function carregarVolume() {
  const S = getStorage();
  if (!S) return _volumeCache ?? VOLUME_PADRAO;
  try {
    const bruto = await S.getItem(CHAVE_VOLUME);
    const n = bruto === null || bruto === undefined ? NaN : Number(bruto);
    _volumeCache = Number.isFinite(n) && n >= 0 && n <= 1 ? n : VOLUME_PADRAO;
  } catch {
    _volumeCache = VOLUME_PADRAO;
  }
  return _volumeCache;
}

export async function salvarVolume(volume) {
  const v = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : VOLUME_PADRAO;
  _volumeCache = v;
  const S = getStorage();
  if (!S) return v;
  try {
    await S.setItem(CHAVE_VOLUME, String(v));
  } catch {}
  return v;
}

export async function carregarPreset() {
  const S = getStorage();
  if (!S) return PRESETS[0].id;
  try {
    const bruto = await S.getItem(CHAVE_PRESET);
    return presetPorId(bruto).id;
  } catch {
    return PRESETS[0].id;
  }
}

export async function salvarPreset(id) {
  const escolhido = presetPorId(id).id;
  const S = getStorage();
  if (!S) return escolhido;
  try {
    await S.setItem(CHAVE_PRESET, escolhido);
  } catch {}
  return escolhido;
}

// ---------------------------------------------------------------------------
// VARIAÇÃO QUE NUNCA REPETE
// ---------------------------------------------------------------------------
// Não é um loop de N segundos: são LFOs cujos períodos estão em razão
// IRRACIONAL entre si (φ e √2). Duas ondas com razão de período irracional
// nunca voltam à mesma configuração relativa — o resultado é quase-periódico,
// matematicamente sem repetição. É a mesma ideia das figuras de Lissajous que
// nunca fecham.
const PHI = (1 + Math.sqrt(5)) / 2;
const PERIODO_BASE_S = 29;
const PERIODOS_LFO_S = [
  PERIODO_BASE_S, // 29 s
  PERIODO_BASE_S * PHI, // ≈ 46,9 s
  PERIODO_BASE_S * PHI * PHI, // ≈ 75,9 s
  PERIODO_BASE_S * Math.SQRT2, // ≈ 41,0 s
];

// Sequência de baixa discrepância (recorrência aditiva com φ): distribui
// uniformemente em [0,1) e NUNCA entra em ciclo, ao contrário de um
// PRNG com período finito. Usada pros intervalos e alturas dos pulsos.
function fracPhi(n, deslocamento) {
  const x = (n + 1) * (PHI - 1) + deslocamento;
  return x - Math.floor(x);
}

// Semente do dia só pra DESLOCAR a sequência (dois dias começam em pontos
// diferentes). Não é fonte de aleatoriedade do som.
function sementeDoDia(diaStr) {
  let h = 2166136261;
  for (let i = 0; i < diaStr.length; i++) {
    h ^= diaStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h % 100000) / 100000;
}

const PULSO_MIN_S = 7;
const PULSO_MAX_S = 23;
// Razões de entonação JUSTA (frações inteiras simples, não temperamento igual):
// unísono, quinta, oitava, terça maior duas oitavas acima, décima segunda.
const RAZOES_JUSTAS = [1, 1.5, 2, 2.5, 3, 4];

// Faixa em que os pulsos podem soar. Existe porque a razão do pulso multiplica
// a nota base, e com os presets agudos isso escapava do audível confortável:
// 852 Hz × 4 × 3 = 10 224 Hz, um apito. Em vez de cortar a razão (o que
// destruiria o intervalo musical), DOBRAMOS por oitavas até cair na faixa —
// oitava acima ou abaixo é a mesma nota, então o intervalo justo é preservado
// e nada soa desafinado. Necessário porque isto toca por horas.
const PULSO_MIN_HZ = 180;
const PULSO_MAX_HZ = 1400;

export function dobrarParaRegistro(hz, minHz = PULSO_MIN_HZ, maxHz = PULSO_MAX_HZ) {
  if (!Number.isFinite(hz) || hz <= 0) return minHz;
  let f = hz;
  // Guarda de iteração: sem ela, um min/max incoerente (min > max) daria loop
  // infinito e travaria a aba. 40 dobras cobrem qualquer coisa audível.
  for (let i = 0; i < 40 && f > maxHz; i++) f /= 2;
  for (let i = 0; i < 40 && f < minHz; i++) f *= 2;
  return f;
}

// ---------------------------------------------------------------------------
// MOTOR
// ---------------------------------------------------------------------------

// Nunca lançar exceção por ausência da API — este módulo é importado em Node
// (testes), em RN nativo e em navegador antigo.
export function audioDisponivel() {
  const g = typeof globalThis !== 'undefined' ? globalThis : null;
  if (!g) return false;
  return typeof g.AudioContext === 'function' || typeof g.webkitAudioContext === 'function';
}

function novoContexto() {
  const g = globalThis;
  const Ctor = typeof g.AudioContext === 'function' ? g.AudioContext : g.webkitAudioContext;
  if (typeof Ctor !== 'function') return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

// Ruído ROSA (1/f) por filtro de Paul Kellett sobre ruído branco. Rosa e não
// branco porque o branco tem energia demais no agudo e cansa em minutos — o
// rosa é o que o ouvido lê como chuva/vento/mar.
//
// O buffer em si é um loop (8 s). Isso é aceitável e não é uma exceção à regra
// de "nunca repete": ruído não tem altura nem ritmo, então não existe marco
// audível pra o ouvido identificar a emenda. E o que dá caráter à camada — o
// filtro — é modulado continuamente pelos LFOs irracionais, então a TEXTURA
// percebida de fato nunca se repete.
function bufferRuidoRosa(ctx, segundos) {
  const taxa = ctx.sampleRate || 44100;
  const total = Math.max(1, Math.floor(taxa * segundos));
  const buffer = ctx.createBuffer(1, total, taxa);
  const dados = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < total; i++) {
    const branco = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + branco * 0.0555179;
    b1 = 0.99332 * b1 + branco * 0.0750759;
    b2 = 0.969 * b2 + branco * 0.153852;
    b3 = 0.8665 * b3 + branco * 0.3104856;
    b4 = 0.55 * b4 + branco * 0.5329522;
    b5 = -0.7616 * b5 - branco * 0.016898;
    dados[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + branco * 0.5362) * 0.11;
    b6 = branco * 0.115926;
  }
  return buffer;
}

const FADE_IN_MS_PADRAO = 2500;
const FADE_OUT_MS_PADRAO = 1400;

export function createCosmicSound(opcoes = {}) {
  const fadeInS = (opcoes.fadeInMs ?? FADE_IN_MS_PADRAO) / 1000;
  const fadeOutS = (opcoes.fadeOutMs ?? FADE_OUT_MS_PADRAO) / 1000;
  const agora = opcoes.agora || (() => new Date());

  let ctx = null;
  let tocando = false;
  let parando = null; // Promise em voo, pra parar duas vezes não duplicar teardown
  let volume = _volumeCache ?? VOLUME_PADRAO;
  let presetId = PRESETS[0].id;
  let afinacao = null;

  // TODO nó criado entra aqui. Vazamento de áudio (oscilador que continua
  // tocando depois do stop) é O bug clássico dessa feature — a única defesa
  // confiável é registro central, não "lembrar de desligar cada um".
  let nos = [];
  let fontes = []; // subconjunto de `nos` que tem start/stop
  let temporizadores = [];
  let master = null;
  let filtroDrone = null;
  let filtroRuido = null;
  let ganhoRuido = null;
  let indicePulso = 0;
  let deslocamentoDia = 0;

  function registrar(no, ehFonte) {
    if (!no) return no;
    nos.push(no);
    if (ehFonte) fontes.push(no);
    return no;
  }

  // Toda mudança de parâmetro passa por aqui. Atribuir `.value` direto num
  // parâmetro que já está tocando produz um degrau de amostra — o "clique" que
  // denuncia amadorismo. Rampa sempre, sem exceção.
  function rampa(param, alvo, duracaoS, exponencial) {
    if (!param || !ctx) return;
    const t = ctx.currentTime;
    try {
      const atual = typeof param.value === 'number' ? param.value : 0;
      if (typeof param.cancelScheduledValues === 'function') param.cancelScheduledValues(t);
      if (typeof param.setValueAtTime === 'function') param.setValueAtTime(atual, t);
      if (exponencial && typeof param.exponentialRampToValueAtTime === 'function') {
        // exponentialRamp explode com alvo 0 (log de zero) — piso mínimo audível
        param.exponentialRampToValueAtTime(Math.max(alvo, 0.0001), t + duracaoS);
      } else if (typeof param.linearRampToValueAtTime === 'function') {
        param.linearRampToValueAtTime(alvo, t + duracaoS);
      } else {
        param.value = alvo;
      }
    } catch {
      try {
        param.value = alvo;
      } catch {}
    }
  }

  function criarLFO(periodoS, alvoParam, profundidade) {
    if (!alvoParam || typeof alvoParam.connect !== 'function') return;
    const osc = registrar(ctx.createOscillator(), true);
    const g = registrar(ctx.createGain());
    osc.type = 'sine';
    osc.frequency.value = 1 / periodoS;
    g.gain.value = profundidade;
    osc.connect(g);
    g.connect(alvoParam);
    osc.start();
  }

  function montarGrafo() {
    afinacao = getSkyTuning(agora());
    deslocamentoDia = sementeDoDia(afinacao.dia);
    indicePulso = 0;

    const preset = presetPorId(presetId);
    const base = preset.baseHz || afinacao.notaHz;

    master = registrar(ctx.createGain());
    master.gain.value = 0; // sempre entra do silêncio e sobe em rampa
    master.connect(ctx.destination);

    // --- DRONE: fundamental + quinta justa + oitava (ver camadasDrone) ---
    // Intervalos JUSTOS de propósito: 3/2 exato bate zero contra o fundamental,
    // então o movimento vem só da desafinação leve que aplicamos de propósito
    // (batimento lento e vivo, em vez do batimento sujo do temperamento igual).
    // O LADO dos intervalos (acima ou abaixo do fundamental) depende do
    // registro da nota base — camadasDrone explica por quê.
    filtroDrone = registrar(ctx.createBiquadFilter());
    filtroDrone.type = 'lowpass';
    filtroDrone.frequency.value = afinacao.corteHz;
    filtroDrone.Q.value = 0.6;
    filtroDrone.connect(master);

    const camadas = camadasDrone(base, afinacao.aberturaHarmonica);
    const osciladores = [];
    for (const c of camadas) {
      const osc = registrar(ctx.createOscillator(), true);
      const g = registrar(ctx.createGain());
      osc.type = c.tipo;
      osc.frequency.value = base * c.razao;
      if (osc.detune) osc.detune.value = c.desafinacao;
      g.gain.value = c.ganho;
      osc.connect(g);
      g.connect(filtroDrone);
      osc.start();
      osciladores.push(osc);
    }

    // --- RUÍDO: elemento do signo lunar ---
    const textura = afinacao.textura;
    const fonteRuido = registrar(ctx.createBufferSource(), true);
    fonteRuido.buffer = bufferRuidoRosa(ctx, 8);
    fonteRuido.loop = true;
    filtroRuido = registrar(ctx.createBiquadFilter());
    filtroRuido.type = textura.filtro;
    filtroRuido.frequency.value = textura.centroHz;
    filtroRuido.Q.value = textura.q;
    ganhoRuido = registrar(ctx.createGain());
    ganhoRuido.gain.value = textura.ganho;
    fonteRuido.connect(filtroRuido);
    filtroRuido.connect(ganhoRuido);
    ganhoRuido.connect(master);
    fonteRuido.start();

    // --- LFOs irracionais entre si (ver PERIODOS_LFO_S) ---
    criarLFO(PERIODOS_LFO_S[0], filtroDrone.frequency, afinacao.corteHz * 0.25);
    if (osciladores[1] && osciladores[1].detune) criarLFO(PERIODOS_LFO_S[1], osciladores[1].detune, 6);
    criarLFO(PERIODOS_LFO_S[2], filtroRuido.frequency, textura.varreduraHz);
    criarLFO(PERIODOS_LFO_S[3], ganhoRuido.gain, textura.ganho * 0.4);
  }

  // Nota curta com envelope suave. Cria os nós, agenda o fim e se limpa sozinha
  // no onended — pulso é o único nó efêmero do grafo, então ele precisa saber
  // se apagar mesmo quando ninguém chama stop().
  function dispararPulso(indice, voz) {
    if (!ctx || !tocando || !master) return;
    const preset = presetPorId(presetId);
    const base = preset.baseHz || afinacao.notaHz;
    const razao = RAZOES_JUSTAS[Math.floor(fracPhi(indice * 2 + voz, deslocamentoDia) * RAZOES_JUSTAS.length)] || 1;
    const dur = 3.5 + fracPhi(indice + voz * 7, deslocamentoDia) * 4;
    const pico = 0.06 * (voz === 0 ? 1 : 0.6);
    const envelope = (afinacao && afinacao.envelopePulso) || ENVELOPE_DIRETO;
    const ataqueS = Math.max(0.25, dur * envelope.ataqueFrac);

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = dobrarParaRegistro(base * razao * (voz === 0 ? 2 : 3));
    const t = ctx.currentTime;
    // Os dois lados em rampa, sempre. O ataque nunca é instantâneo (clique) e o
    // fim decai a um piso mínimo em vez de zero, porque exponentialRamp não
    // aceita alvo 0 (log de zero).
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(pico, t + ataqueS);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(master);

    fontes.push(osc);
    nos.push(osc);
    nos.push(g);

    osc.onended = () => {
      try {
        osc.disconnect();
        g.disconnect();
      } catch {}
      fontes = fontes.filter((f) => f !== osc);
      nos = nos.filter((n) => n !== osc && n !== g);
    };
    osc.start(t);
    osc.stop(t + dur + 0.15);
  }

  function agendarProximoPulso() {
    if (!tocando) return;
    const i = indicePulso++;
    const intervaloS = PULSO_MIN_S + fracPhi(i, deslocamentoDia) * (PULSO_MAX_S - PULSO_MIN_S);
    const id = setTimeout(() => {
      temporizadores = temporizadores.filter((x) => x !== id);
      if (!tocando) return;
      dispararPulso(i, 0);
      if (afinacao && afinacao.vozesDePulso > 1) {
        const id2 = setTimeout(() => {
          temporizadores = temporizadores.filter((x) => x !== id2);
          if (tocando) dispararPulso(i, 1);
        }, 1400);
        temporizadores.push(id2);
      }
      agendarProximoPulso();
    }, intervaloS * 1000);
    temporizadores.push(id);
  }

  function desmontar() {
    for (const id of temporizadores) clearTimeout(id);
    temporizadores = [];
    // Parar ANTES de desconectar: um oscilador desconectado mas não parado
    // continua rodando e consumindo CPU (e volta a soar se for reconectado).
    for (const f of fontes) {
      try {
        f.onended = null;
      } catch {}
      try {
        if (typeof f.stop === 'function') f.stop();
      } catch {}
    }
    for (const n of nos) {
      try {
        if (typeof n.disconnect === 'function') n.disconnect();
      } catch {}
    }
    fontes = [];
    nos = [];
    master = null;
    filtroDrone = null;
    filtroRuido = null;
    ganhoRuido = null;
  }

  return {
    // AUTOPLAY: navegador só libera áudio depois de um gesto do usuário. Por
    // isso start() é assíncrono, chama resume() e, se o contexto continuar
    // suspenso, NÃO monta o grafo — devolve o motivo pra tela pedir o toque.
    // Nada quebra, nada fica pendurado.
    async start() {
      if (!audioDisponivel()) return { ok: false, motivo: 'sem-suporte' };
      if (tocando) return { ok: true, motivo: 'ja-tocando' };
      if (parando) await parando;
      if (!ctx) ctx = novoContexto();
      if (!ctx) return { ok: false, motivo: 'sem-suporte' };

      try {
        if (ctx.state === 'suspended' && typeof ctx.resume === 'function') await ctx.resume();
      } catch {
        return { ok: false, motivo: 'gesto-necessario' };
      }
      if (ctx.state === 'suspended') return { ok: false, motivo: 'gesto-necessario' };

      try {
        montarGrafo();
      } catch {
        desmontar();
        return { ok: false, motivo: 'falha-audio' };
      }
      tocando = true;
      rampa(master.gain, ganhoPerceptual(volume) * TETO, fadeInS);
      agendarProximoPulso();
      return { ok: true, afinacao };
    },

    async stop() {
      if (!tocando) return { ok: true, motivo: 'ja-parado' };
      if (parando) return parando;
      tocando = false; // corta o agendamento de pulsos novos imediatamente
      const g = master && master.gain;
      rampa(g, 0, fadeOutS);
      parando = new Promise((resolve) => {
        // Registrado como todos os outros: `inspecionar().temporizadores` tem
        // que contar TODO timer vivo, senão o teste de vazamento mente. O
        // próprio desmontar() zera a lista quando roda.
        const idFade = setTimeout(async () => {
          desmontar();
          try {
            if (ctx && typeof ctx.suspend === 'function') await ctx.suspend();
          } catch {}
          parando = null;
          resolve({ ok: true });
        }, fadeOutS * 1000 + 60);
        temporizadores.push(idFade);
      });
      return parando;
    },

    // Libera o contexto de vez (sair da tela/desmontar componente).
    async dispose() {
      await this.stop();
      try {
        if (ctx && typeof ctx.close === 'function') await ctx.close();
      } catch {}
      ctx = null;
    },

    async setVolume(v) {
      volume = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : VOLUME_PADRAO;
      if (tocando && master) rampa(master.gain, ganhoPerceptual(volume) * TETO, 0.25);
      await salvarVolume(volume);
      return volume;
    },

    getVolume() {
      return volume;
    },

    async carregarPreferencias() {
      volume = await carregarVolume();
      presetId = await carregarPreset();
      if (tocando && master) rampa(master.gain, ganhoPerceptual(volume) * TETO, 0.25);
      return { volume, presetId };
    },

    // Trocar preset com o som tocando: para e remonta com rampa dos dois lados,
    // nunca corte seco.
    async setPreset(id) {
      presetId = presetPorId(id).id;
      await salvarPreset(presetId);
      if (tocando) {
        await this.stop();
        await this.start();
      }
      return presetId;
    },

    getPreset() {
      return presetPorId(presetId);
    },

    isPlaying() {
      return tocando;
    },

    // Introspecção pros testes e pra tela de debug: quantos nós/fontes existem
    // agora. Depois de stop(), tem que ser zero — é literalmente o teste de
    // vazamento de áudio.
    inspecionar() {
      return {
        nos: nos.length,
        fontes: fontes.length,
        temporizadores: temporizadores.length,
        estadoContexto: ctx ? ctx.state : null,
        afinacao,
      };
    },
  };
}
