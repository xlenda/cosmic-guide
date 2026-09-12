// lib/ceu.js
// O CEU DO DIA — a unica porta para efemeride no Fio Vermelho.
//
// ===========================================================================
// A REGRA QUE E O PRODUTO: NUNCA FABRICAR CEU
// ===========================================================================
// Sem efemeride, este modulo DECLARA indisponivel. Nao existe "aproximadamente",
// nao existe lua cheia estimada, nao existe transito inventado para ter o que
// dizer no dia. Toda funcao devolve null quando nao pode medir, e nao ha uma
// linha de `|| 'Lua Cheia'` nem de `?? 0` no arquivo inteiro.
//
// E existe uma distincao que quem consome PRECISA conseguir fazer, porque a
// tela fala diferente de cada uma:
//
//   retrogrados: []    -> foi medido. Hoje NENHUM planeta esta retrogrado.
//   retrogrados: null  -> NAO foi medido. O app nao sabe.
//
// Uma lista vazia e uma resposta; null e a ausencia de resposta. O mesmo vale
// para todo campo daqui. Um modulo que devolvesse [] nos dois casos faria a
// tela dizer "nenhum planeta retrogrado hoje" no dia em que a efemeride
// quebrou — que e fabricar ceu por omissao, e e mais dificil de detectar do
// que fabricar por comissao.
//
// PARCIAL E PIOR QUE VAZIO. `retrogrados` e tudo ou nada de proposito: se a
// posicao de UM dos oito nao fechar, o campo inteiro vira null. Devolver os
// sete que deram silenciaria "Marte nao esta retrogrado" quando a verdade e
// "nao consegui olhar para Marte", e quem le nao teria como saber a diferenca.
// A Lua tem a mesma regra: fase sem marco, ou marco sem fase, seria meio bloco
// se passando por bloco inteiro, e meio bloco e onde o "por volta de" entra
// sozinho.
//
// ===========================================================================
// O QUE NAO E CEU, E POR ISSO NAO MORRE JUNTO
// ===========================================================================
// `regenteDoDia` e aritmetica de dia da semana (ordem caldaica, salto de 3),
// nao efemeride. Ele continua verdadeiro num aparelho onde astronomy-engine
// nao carregou, e e por isso que o plano do dia continua existindo la. A regra
// de nunca fabricar ceu NAO se aplica a este campo — e ele fica fora do bloco
// `lua` justamente para que ninguem confunda os dois.
//
// A unica coisa que derruba o regente e um INSTANTE INVALIDO: ai o modulo nao
// sabe nem que dia e. Isso e DIFERENTE do que o molde (rulerOfDay do Cosmic
// Guide) faz, e a diferenca e deliberada: la a funcao e chamada pela tela com
// o relogio do aparelho, e cair para hoje e a degradacao certa. Aqui o
// instante e ARGUMENTO EXPLICITO — se ele e lixo, quem chamou tem um bug, e
// responder o ceu de outro dia esconde esse bug dentro de um objeto que parece
// saudavel. As funcoes-helper de baixo nivel (`regenteDoDia`, `diaDaSemana`)
// mantem o cair-para-hoje do molde porque sao chamadas direto pela tela; o
// contrato de `ceuDoDia` e mais estrito de proposito.
//
// ===========================================================================
// UMA ANCORA SO: MEIO-DIA LOCAL
// ===========================================================================
// O app que serviu de molde ja teve TRES ancoras ao mesmo tempo para "a fase
// de hoje" (meio-dia UTC, `new Date()` cru, meio-dia local) e chegou a mostrar
// "Lua Cheia" na grade do calendario enquanto o card acima dizia "Gibosa
// Minguante" — mesmo dia, mesmo app, duas respostas. Um app que se contradiz
// sozinho e pior que um que erra junto.
//
// Aqui a ancora e UMA: o meio-dia LOCAL do dia local do instante recebido.
// Rotulo de fase e rotulo de DIA CIVIL, e o calendario de quem le e o local.
// A ancora usada sai no objeto (`lua.fase.ancora`) para ser conferivel.
// Nenhuma tela pode usar `new Date()` cru para falar de fase.
//
// ===========================================================================
// ROTULO DE FASE NAO DATA MARCO
// ===========================================================================
// A tentacao obvia para "nessa sexta vai estar lua cheia" e varrer os rotulos
// do mes procurando o primeiro dia rotulado "Lua Cheia". Isso esta ERRADO e ja
// custou caro: o rotulo cobre uma fatia de 45 graus, ~3,7 dias. Em julho de
// 2026 os dias 28, 29, 30 e 31 sao TODOS rotulados "Lua Cheia", enquanto a
// Cheia real e instantanea, em 29/07 as 14:36 UTC. Varrer rotulo anuncia um
// dia antes e continua anunciando dois dias depois.
//
// Lua Cheia e a oposicao exata Sol-Lua: um instante. `proximaCheia` e
// `proximaNova` saem de SearchMoonPhase, que devolve esse instante — nunca de
// varredura de rotulo. As duas coisas nao se substituem.
//
// ===========================================================================
// UTC POR DENTRO, FUSO DO APARELHO POR FORA
// ===========================================================================
// Toda conta acontece sobre Date (milissegundos UTC). Na saida, todo instante
// aparece nas duas formas, e nenhuma mente sobre a outra:
//   `iso`   — o instante em UTC, para conferir contra efemeride publica;
//   `local` — o mesmo instante no fuso do aparelho, sem sufixo Z;
//   `dia`   — o dia LOCAL (YYYY-MM-DD) em que esse instante cai.
//
// `faltamDias` conta DIAS LOCAIS, nunca horas de distancia. Por isso a busca
// dos marcos comeca na MEIA-NOITE LOCAL do dia, e nao no instante recebido: um
// marco que caiu hoje as 3h continua sendo o marco de hoje, e sai com
// `faltamDias: 0` e `passou: true`. Ele some por virada de dia local, nunca
// porque em UTC ja e outro dia. Quem quiser so o futuro filtra por `passou`.
//
// ===========================================================================
// PUREZA E DETERMINISMO
// ===========================================================================
// Sem storage, sem React, sem rede, sem Alert, sem cor. Nada aqui grava nada,
// entao este modulo NAO precisa entrar em CLAVES_HILO_ROJO (screens/
// AjustesScreen.js) — mas quem construir cache ou historico por cima dele tem
// de lembrar que a chave nova entra la, senao sobrevive ao "Apagar tudo" e a
// politica de privacidade vira declaracao falsa na ficha de loja.
//
// Deterministico: o MESMO instante, no MESMO fuso, da a MESMA saida. O fuso
// entra na conta de proposito (a ancora e o dia sao locais), entao o par
// (instante, fuso) e a entrada real. Sem argumento, usa o relogio do aparelho.
//
// ===========================================================================
// ESTE MODULO NAO FALA DA OUTRA PESSOA
// ===========================================================================
// Aqui nao ha uma linha de copy, e isso e deliberado. O ceu descreve o DIA; ele
// nao age sobre a decisao de ninguem e nao promete desfecho. Quem montar o
// texto por cima destes dados (em datos/textos.js, que e onde string mora)
// escreve sobre o dia: "a Lua fecha ciclo na sexta" e descricao do ceu; "com a
// Lua Cheia essa pessoa vai te procurar" e alegacao sobre terceiro e nao tem
// lastro nenhum neste arquivo. Nenhum campo daqui autoriza a segunda frase, e
// nenhum campo daqui destrava acao de encontro: esse gate e da pergunta 4 do
// onboarding, nao do ceu.
// ===========================================================================

/* =================================================================================
 * A SONDA DO MOTOR — e por que ela e `import` e nao `require` lazy.
 *
 * O molde sonda com `require('astronomy-engine')` dentro de try/catch, para o
 * Metro nao quebrar o bundle se o pacote sumir. Esse padrao NAO pode ser
 * copiado literalmente para ca, e a diferenca nao e estetica: os modulos do Fio
 * Vermelho sao ESM e rodam sob `node --test`, onde `require` nao existe no
 * escopo. O try/catch capturaria o ReferenceError, o motor viraria `false` e
 * este arquivo devolveria null para tudo, SEMPRE — verde nos testes e vazio no
 * app, com a mensagem "sem efemeride" mentindo sobre um pacote que esta
 * instalado. Foi medido: a versao com require devolvia `disponivel: false` para
 * hoje com astronomy-engine@2.1.19 presente no node_modules.
 *
 * O que sobrevive do padrao e o que importa — a SONDA. `motorDoCeu()` confere
 * que o namespace importado tem as funcoes que este arquivo chama; faltando
 * qualquer uma (instalacao parcial, pacote trocado, build mal feito), devolve
 * false e todo mundo declara indisponivel pelo caminho normal, em vez de
 * estourar TypeError no meio de uma tela.
 * ================================================================================= */
import * as MOTOR_REAL from 'astronomy-engine';

const FUNCOES_EXIGIDAS = Object.freeze([
  'MoonPhase', 'Illumination', 'SearchMoonPhase', 'MakeTime', 'GeoVector', 'Ecliptic',
]);

let _motorInjetado = null;
let _motorConferido = null;

function motorDoCeu() {
  if (_motorInjetado !== null) return _motorInjetado;
  if (_motorConferido !== null) return _motorConferido;
  const m = MOTOR_REAL;
  const completo =
    !!m &&
    FUNCOES_EXIGIDAS.every((f) => typeof m[f] === 'function') &&
    !!m.Body &&
    typeof m.Body.Moon !== 'undefined';
  _motorConferido = completo ? m : false;
  return _motorConferido;
}

/**
 * Troca o motor de efemeride. EXISTE PARA TESTE, e so.
 * Sem este assento, o caminho de indisponibilidade — que e justamente o produto
 * deste arquivo — nao teria como ser exercitado por teste nenhum, e regra que
 * nao pode ser testada e regra que apodrece verde.
 * `false` simula aparelho sem efemeride; um objeto simula motor parcial;
 * `null` devolve o modulo ao motor real.
 */
export function _inyectarMotorParaTests(motor) {
  _motorInjetado = motor === null || motor === undefined ? null : motor;
}

/** Devolve a sonda ao estado "ainda nao sondado". */
export function _reiniciarCieloParaTests() {
  _motorInjetado = null;
  _motorConferido = null;
}

/** true quando ha efemeride. A tela usa isto para NAO desenhar, nunca para estimar. */
export function hayEfemeride() {
  return motorDoCeu() !== false;
}

/* =================================================================================
 * MOTIVOS — vocabulario TECNICO de indisponibilidade.
 *
 * Sao tokens para log, teste e switch de tela. NENHUM deles vai para a tela como
 * esta: a frase que a pessoa le mora em datos/textos.js, e nela nao entram nome
 * de pacote npm nem a palavra "efemeride". Log honesto e copy honesta querem
 * coisas diferentes, e e por isso que sao dois campos e nao um.
 * ================================================================================= */
export const MOTIVOS = Object.freeze({
  INSTANTE_INVALIDO: 'instante_invalido',
  MOTOR_INDISPONIVEL: 'motor_indisponivel',
  FASE_NAO_CALCULADA: 'fase_nao_calculada',
  ILUMINACAO_NAO_CALCULADA: 'iluminacao_nao_calculada',
  MARCO_NAO_ENCONTRADO: 'marco_nao_encontrado',
  RETROGRADACAO_NAO_CALCULADA: 'retrogradacao_nao_calculada',
});

/** Token -> frase de LOG. Continua sendo tecnico: nao e copy, nao vai para tela. */
export const EXPLICACAO_TECNICA = Object.freeze({
  [MOTIVOS.INSTANTE_INVALIDO]: 'instante fora de ISO 8601, ou data inexistente no calendario',
  [MOTIVOS.MOTOR_INDISPONIVEL]: 'astronomy-engine ausente ou incompleto — o ceu fica vazio em vez de estimado',
  [MOTIVOS.FASE_NAO_CALCULADA]: 'MoonPhase nao devolveu numero para a ancora do dia',
  [MOTIVOS.ILUMINACAO_NAO_CALCULADA]: 'Illumination nao devolveu phase_fraction — a fase sem fracao seria resposta pela metade',
  [MOTIVOS.MARCO_NAO_ENCONTRADO]: 'SearchMoonPhase voltou vazio dentro da janela — nao existe mes sem Nova e sem Cheia, entao isto e falha, nunca ausencia de marco',
  [MOTIVOS.RETROGRADACAO_NAO_CALCULADA]: 'posicao de ao menos um dos oito nao fechou — lista parcial mentiria por omissao',
});

/* =================================================================================
 * NOMES CANONICOS — SAO DADO, NAO TEXTO.
 *
 * Estes oito nomes de fase e estes sete nomes de planeta sao identificadores, e
 * casam byte a byte com o que qualquer outro modulo comparar. Traduzir um deles,
 * tirar um acento ou "melhorar" a grafia faz o casamento parar EM SILENCIO — sem
 * erro, sem log, so deixando de casar. Se um dia forem renomeados, renomeie tudo
 * de uma vez e rode o portao contra o motor real.
 *
 * Texto de tela NAO mora aqui: quem quiser a fase escrita bonito indexa
 * datos/textos.js por este nome (ou pelo indice), que e onde string mora.
 * ================================================================================= */
export const FASES = Object.freeze([
  'Lua Nova',
  'Lua Crescente',
  'Quarto Crescente',
  'Lua Gibosa Crescente',
  'Lua Cheia',
  'Lua Gibosa Minguante',
  'Quarto Minguante',
  'Lua Minguante',
]);

export const EMOJIS_FASE = Object.freeze(['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']);

export const FASES_CRESCENTES = Object.freeze([
  'Lua Crescente', 'Quarto Crescente', 'Lua Gibosa Crescente',
]);

export const FASES_MINGUANTES = Object.freeze([
  'Lua Gibosa Minguante', 'Quarto Minguante', 'Lua Minguante',
]);

/* Ordem da semana planetaria, indexada por Date#getDay(): 0 = domingo. */
export const REGENTE_POR_DIA = Object.freeze([
  'Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno',
]);

/* Glifos astronomicos dos sete classicos. Simbolo, nao decoracao de marca. */
export const GLIFO_POR_PLANETA = Object.freeze({
  'Sol': '☉', 'Lua': '☽', 'Marte': '♂', 'Mercúrio': '☿',
  'Júpiter': '♃', 'Vênus': '♀', 'Saturno': '♄',
});

/* A FONTE da semana planetaria, estruturada em campos em vez de frase pronta.
 * Frase aqui seria copy, e copy mora em datos/textos.js — a tela compoe a linha
 * que quiser a partir destes campos e continua tendo um recibo de verdade.
 *
 * O QUE A FONTE REALMENTE DIZ, para ninguem inflar isso depois: Diao Cassio
 * registra a fila dos dias e da DUAS explicacoes concorrentes para ela, porque
 * ele mesmo nao sabia qual era a certa; e chama o costume de recente, dizendo
 * que os gregos antigos nao o conheciam. A sequencia sai da ordem caldaica (os
 * sete enfileirados do mais lento para o mais rapido): cada hora recebe um
 * planeta na ordem da fila e, como o dia tem 24 horas e a fila tem 7 nomes, a
 * cada volta pulam-se tres posicoes. E dai que vem a ordem dos dias, e e por
 * isso que ela nao e a mesma da fila. */
export const FONTE_SEMANA_PLANETARIA = Object.freeze({
  autor: 'Dião Cássio',
  obra: 'História Romana',
  locus: '37.18-19',
  seculo: 'séc. III',
});

/* Os oito que PODEM retrogradar. Sol e Lua ficam de fora porque nunca
 * retrogradam vistos da Terra — nao e omissao, e o fato. */
export const PLANETAS_RETROGRADAVEIS = Object.freeze([
  'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão',
]);

const CORPO_DO_PLANETA = Object.freeze({
  'Mercúrio': 'Mercury', 'Vênus': 'Venus', 'Marte': 'Mars', 'Júpiter': 'Jupiter',
  'Saturno': 'Saturn', 'Urano': 'Uranus', 'Netuno': 'Neptune', 'Plutão': 'Pluto',
});

const MS_DIA = 86400000;

/* Janela de busca dos marcos, em dias. O mes sinodico dura ~29,53 dias, entao 45
 * cobre com folga qualquer ponto de partida. E por isso que `proximaCheia: null`
 * significa FALHA e nunca "nao tem cheia por perto": nao existe mes sem Lua Cheia. */
const JANELA_MARCO_DIAS = 45;

/* Janela do teste de retrogradacao: 2 dias para cada lado da ancora. A
 * consequencia precisa ficar dita — a resolucao deste campo e de UM DIA. Ele
 * responde "este planeta esta retrogrado neste dia", nunca "a que horas
 * estacionou". Quem quiser datar a estacao precisa de outra conta, e nao deve
 * fingir que tem essa precisao a partir daqui. */
const JANELA_RETROGRADO_DIAS = 2;

/* =================================================================================
 * DATA E FUSO
 * ================================================================================= */

function pad(n, largo = 2) {
  return String(n).padStart(largo, '0');
}

/* Round-trip, nao regex: /^\d{4}-\d{2}-\d{2}$/ aceita '2026-02-31', e uma data
 * impossivel entregue ao motor rola para o mes seguinte EM SILENCIO. */
export function esDiaValido(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(anio, mes - 1, dd));
  return t.getUTCFullYear() === anio && t.getUTCMonth() === mes - 1 && t.getUTCDate() === dd;
}

/** 'YYYY-MM-DD' do dia LOCAL de um Date. Nunca toISOString(): as 21h ja seria amanha. */
export function diaLocal(fecha = new Date()) {
  const d = fecha instanceof Date && !Number.isNaN(fecha.getTime()) ? fecha : new Date();
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Meio-dia LOCAL do dia civil. A unica ancora do app para "a fase do dia X". */
export function meioDiaLocal(dia) {
  if (!esDiaValido(dia)) return null;
  const [anio, mes, dd] = dia.split('-').map(Number);
  return new Date(anio, mes - 1, dd, 12, 0, 0, 0);
}

/* Distancia em DIAS LOCAIS entre dois dias civis — 0 e "hoje", 1 e "amanha".
 * Ancorada em Date.UTC sobre campos LOCAIS, e nao em divisao de milissegundos:
 * dividir por 24h erra em todo dia de mudanca de horario de verao (que tem 23 ou
 * 25 horas) e erra sempre que os instantes caem em horas diferentes do dia,
 * dizendo "faltam 0 dias" para algo que e amanha de manha. */
export function diasEntre(desde, hasta) {
  if (!esDiaValido(desde) || !esDiaValido(hasta)) return null;
  const [a1, m1, d1] = desde.split('-').map(Number);
  const [a2, m2, d2] = hasta.split('-').map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / MS_DIA);
}

/* Contagem CONTINUA de dias desde a epoca. E ela, e nao o dia-do-ano, que serve
 * de indice de rotacao: dia-do-ano zera em 1 de janeiro e, em ano bissexto,
 * 31/12 e 01/01 caem no MESMO indice quando o catalogo tem 5 itens
 * (365 % 5 === 0). Um repeteco por ano e pouco — mas e justamente o dia em que a
 * rotacao promete nao repetir e repete, e ninguem descobre isso lendo o codigo. */
export function diasDesdeEpoca(dia) {
  if (!esDiaValido(dia)) return null;
  const [anio, mes, dd] = dia.split('-').map(Number);
  return Math.round(Date.UTC(anio, mes - 1, dd) / MS_DIA);
}

/** Dia da semana LOCAL (0 = domingo). Aritmetica: nao depende de efemeride. */
export function diaDaSemana(dia) {
  const base = esDiaValido(dia) ? dia : diaLocal(new Date());
  const [anio, mes, dd] = base.split('-').map(Number);
  return new Date(anio, mes - 1, dd, 12).getDay();
}

/**
 * REGENTE DO DIA — aritmetica de dia da semana, NAO efemeride.
 * Continua correto sem astronomy-engine, e e por isso que o plano do dia
 * sobrevive num aparelho onde o ceu inteiro esta indisponivel.
 * Dia invalido cai para hoje em vez de devolver undefined (bug real do molde:
 * uma data ruim derrubava a Home). Ver o cabecalho sobre por que `ceuDoDia` e
 * mais estrito que esta funcao.
 */
export function regenteDoDia(dia) {
  return REGENTE_POR_DIA[diaDaSemana(dia)];
}

/* Fuso do aparelho, ou null se o ambiente nao souber dizer. null aqui significa
 * "nao sei o nome do fuso", nunca "e UTC" — as contas locais continuam usando o
 * relogio do aparelho de qualquer jeito. */
function fusoDoAparelho() {
  try {
    const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof z === 'string' && z ? z : null;
  } catch {
    return null;
  }
}

/* Aceita ISO 8601 (com Z, com offset, ou sem nada), um Date, ou ms. Devolve Date
 * ou null — NUNCA cai para hoje: ver o cabecalho. Uma data pura de 10 caracteres
 * e lida como meio-dia UTC daquele dia, que e a convencao declarada do molde
 * para "um dia, sem hora". A validacao exige que a data seja REAL, nao apenas
 * bem-formatada. */
function normalizarInstante(entrada) {
  if (entrada instanceof Date) {
    return Number.isNaN(entrada.getTime()) ? null : new Date(entrada.getTime());
  }
  if (typeof entrada === 'number') {
    return Number.isFinite(entrada) ? new Date(entrada) : null;
  }
  if (typeof entrada !== 'string') return null;

  const texto = entrada.trim();
  const m = /^(\d{4}-\d{2}-\d{2})(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.exec(texto);
  if (!m || !esDiaValido(m[1])) return null;

  const d = new Date(texto.length === 10 ? `${texto}T12:00:00Z` : texto);
  return Number.isNaN(d.getTime()) ? null : d;
}

function localSemZ(d) {
  return `${diaLocal(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* A forma padrao de todo instante que sai daqui: UTC para conferencia, local
 * para tela, e o dia local a que ele pertence. Os tres campos existem porque um
 * so sempre engana um dos leitores. */
function instanteEmDuasFormas(d) {
  return Object.freeze({
    iso: d.toISOString(),
    local: localSemZ(d),
    dia: diaLocal(d),
  });
}

/* =================================================================================
 * AS PECAS MEDIDAS
 * ================================================================================= */

/* Indice da fatia de 45 graus, centrada nos multiplos de 45. O modulo 8 depois do
 * arredondamento traz 337,5-360 de volta para o indice 0 (Nova). */
function indiceDaFase(longitude) {
  const lon = ((longitude % 360) + 360) % 360;
  return Math.round(lon / 45) % 8;
}

/**
 * O ROTULO de fase de um dia civil, medido ao meio-dia LOCAL.
 * { nome, emoji, indice, longitude } ou null.
 */
export function faseDoDia(dia) {
  const A = motorDoCeu();
  if (!A) return null;
  const instante = meioDiaLocal(dia);
  if (!instante) return null;
  let longitude;
  try {
    longitude = A.MoonPhase(instante);
  } catch {
    return null;
  }
  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) return null;
  const indice = indiceDaFase(longitude);
  return Object.freeze({
    nome: FASES[indice],
    emoji: EMOJIS_FASE[indice],
    indice,
    longitude,
  });
}

/* Fase + fracao iluminada na ancora. MoonPhase devolve a diferenca de longitude
 * ecliptica Lua-Sol em graus: 0 = Nova, 90 = Quarto Crescente, 180 = Cheia,
 * 270 = Quarto Minguante.
 *
 * A iluminacao vem de outra funcao do pacote e por isso tem a sua propria falha
 * possivel. Ela NAO e opcional aqui: a fracao iluminada e metade do que este
 * campo promete, e uma fase sem ela seria resposta pela metade se passando por
 * completa. Sem iluminacao, a fase inteira vem null com motivo proprio, e a tela
 * sabe exatamente o que faltou. */
function faseCompleta(A, ancora, dia) {
  const rotulo = faseDoDia(dia);
  if (!rotulo) return { fase: null, motivo: MOTIVOS.FASE_NAO_CALCULADA };

  let fracao = null;
  try {
    const info = A.Illumination(A.Body.Moon, ancora);
    if (info && typeof info.phase_fraction === 'number' && Number.isFinite(info.phase_fraction)) {
      fracao = info.phase_fraction;
    }
  } catch {
    fracao = null;
  }
  if (fracao === null) return { fase: null, motivo: MOTIVOS.ILUMINACAO_NAO_CALCULADA };

  return {
    motivo: null,
    fase: Object.freeze({
      nome: rotulo.nome,
      emoji: rotulo.emoji,
      indice: rotulo.indice,
      // Arredondamento de MEDIDA, nao estimativa: o valor foi calculado e so
      // esta sendo escrito com menos casas. Nada foi inventado para preencher.
      fracaoIluminada: Math.round(fracao * 10000) / 10000,
      percentIluminado: Math.round(fracao * 100),
      // A elongacao Lua-Sol crua, para quem quiser conferir a fatia por conta.
      elongacao: Math.round(rotulo.longitude * 100) / 100,
      ancora: instanteEmDuasFormas(ancora),
    }),
  };
}

/* Instante EXATO de um marco lunar a partir de `desde`.
 * alvo: 0 = Nova, 90 = Quarto Crescente, 180 = Cheia, 270 = Quarto Minguante.
 * Devolve Date (UTC) ou null — e null aqui e falha do motor, nunca ausencia de
 * marco (ver JANELA_MARCO_DIAS). */
function marcoExato(A, alvo, desde) {
  try {
    const achado = A.SearchMoonPhase(alvo, A.MakeTime(desde), JANELA_MARCO_DIAS);
    if (!achado) return null;
    const fecha = achado.date instanceof Date ? achado.date : achado;
    if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return null;
    return fecha;
  } catch {
    return null;
  }
}

function marcoParaSaida(quando, referencia, indice) {
  return Object.freeze({
    nome: FASES[indice],
    emoji: EMOJIS_FASE[indice],
    instante: instanteEmDuasFormas(quando),
    faltamDias: diasEntre(diaLocal(referencia), diaLocal(quando)),
    passou: quando.getTime() < referencia.getTime(),
  });
}

/**
 * O proximo marco lunar (Nova ou Cheia) a partir de `dia`, inclusive.
 * { nome, emoji, dia, dataISO, faltamDias } ou null.
 * null quer dizer "nao desenhe o card", nunca "desenhe um card de erro".
 */
export function proximoMarcoLunar(dia) {
  const A = motorDoCeu();
  if (!A) return null;
  if (!esDiaValido(dia)) return null;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const desde = new Date(anio, mes - 1, dd, 0, 0, 0, 0);

  let melhor = null;
  for (const alvo of [{ lon: 0, indice: 0 }, { lon: 180, indice: 4 }]) {
    const fecha = marcoExato(A, alvo.lon, desde);
    if (!fecha) continue;
    if (!melhor || fecha.getTime() < melhor.fecha.getTime()) melhor = { fecha, indice: alvo.indice };
  }
  if (!melhor) return null;

  const diaDoMarco = diaLocal(melhor.fecha);
  return Object.freeze({
    nome: FASES[melhor.indice],
    emoji: EMOJIS_FASE[melhor.indice],
    dia: diaDoMarco,
    dataISO: melhor.fecha.toISOString(),
    faltamDias: diasEntre(dia, diaDoMarco),
  });
}

/* Retrogradacao de UM planeta na ancora do dia.
 *
 * A definicao e a de qualquer efemeride: compara a longitude ecliptica
 * geocentrica dois dias antes com dois dias depois; se ela caiu, o movimento
 * aparente e retrogrado. A normalizacao para [-180, 180] e obrigatoria — sem
 * ela, uma virada de 359 para 1 grau pareceria um recuo de -358 em vez do avanco
 * real de +2, e o app anunciaria retrogradacao inventada uma vez por volta de
 * cada planeta.
 *
 * true, false, ou null quando nao deu para medir. */
export function estaRetrogrado(planeta, ancora) {
  if (planeta === 'Sol' || planeta === 'Lua') return false;
  const A = motorDoCeu();
  if (!A) return null;
  const corpo = CORPO_DO_PLANETA[planeta];
  if (!corpo) return null;
  if (!(ancora instanceof Date) || Number.isNaN(ancora.getTime())) return null;

  const antes = new Date(ancora.getTime() - JANELA_RETROGRADO_DIAS * MS_DIA);
  const depois = new Date(ancora.getTime() + JANELA_RETROGRADO_DIAS * MS_DIA);

  let lonAntes;
  let lonDepois;
  try {
    lonAntes = A.Ecliptic(A.GeoVector(A.Body[corpo], antes, true)).elon;
    lonDepois = A.Ecliptic(A.GeoVector(A.Body[corpo], depois, true)).elon;
  } catch {
    return null;
  }
  if (!Number.isFinite(lonAntes) || !Number.isFinite(lonDepois)) return null;

  let delta = lonDepois - lonAntes;
  delta = ((delta + 540) % 360) - 180;
  return delta < 0;
}

/* =================================================================================
 * O CEU DE UM INSTANTE — a mesma FORMA de objeto nos dois casos.
 *
 * A tela tem UM renderizador so e a checagem e `if (!ceu.disponivel)`. Quando
 * indisponivel, todo campo medido vem null — nunca um valor plausivel. Forma
 * diferente entre sucesso e falha e como se produz "undefined is not an object"
 * na mao de quem consome.
 * ================================================================================= */

/**
 * @param {string|Date|number} [instanteISO] ISO 8601 ('2026-08-31',
 *   '2026-08-31T14:36:00Z', com offset, ou sem Z), um Date, ou ms.
 *   Uma data pura (10 caracteres) e lida como meio-dia UTC daquele dia.
 *   Sem argumento, usa o relogio do aparelho.
 *
 * @returns {Readonly<object>} congelado:
 *   - `instante`     { iso, local, dia } do instante recebido, ou null
 *   - `dia`          o dia LOCAL (YYYY-MM-DD) a que o ceu se refere, ou null
 *   - `fuso`         IANA do aparelho, ou null se o ambiente nao souber
 *   - `disponivel`   true so quando TODAS as pecas fecharam
 *   - `motivo`       null quando disponivel; token de MOTIVOS quando nao
 *   - `falta`        TODOS os motivos, nao so o primeiro (array; vazio quando ok)
 *   - `lua`          { fase, proximaCheia, proximaNova } ou null
 *   - `regenteDoDia` { diaSemana, planeta, glifo, fonte } — sobrevive sem
 *                    efemeride, porque e aritmetica de calendario
 *   - `retrogrados`  array de nomes canonicos; [] e "medi, nenhum";
 *                    null e "nao consegui medir". Sao coisas diferentes.
 */
export function ceuDoDia(instanteISO = new Date()) {
  const fuso = fusoDoAparelho();
  const instante = normalizarInstante(instanteISO);

  // Instante invalido: o modulo nao sabe nem que dia e. Nada e devolvido, nem o
  // regente — ver o cabecalho sobre por que aqui nao se cai para hoje.
  if (!instante) {
    return Object.freeze({
      instante: null,
      dia: null,
      fuso,
      disponivel: false,
      motivo: MOTIVOS.INSTANTE_INVALIDO,
      falta: Object.freeze([MOTIVOS.INSTANTE_INVALIDO]),
      lua: null,
      regenteDoDia: null,
      retrogrados: null,
    });
  }

  const dia = diaLocal(instante);
  const instanteFmt = instanteEmDuasFormas(instante);

  // O regente sai ANTES de qualquer conta de efemeride, de proposito: ele nao
  // depende dela e nao pode ser derrubado por ela.
  const semana = diaDaSemana(dia);
  const planeta = REGENTE_POR_DIA[semana];
  const regente = Object.freeze({
    diaSemana: semana,
    planeta,
    glifo: GLIFO_POR_PLANETA[planeta],
    fonte: FONTE_SEMANA_PLANETARIA,
  });

  const A = motorDoCeu();
  if (!A) {
    return Object.freeze({
      instante: instanteFmt,
      dia,
      fuso,
      disponivel: false,
      motivo: MOTIVOS.MOTOR_INDISPONIVEL,
      falta: Object.freeze([MOTIVOS.MOTOR_INDISPONIVEL]),
      lua: null,
      regenteDoDia: regente,
      retrogrados: null,
    });
  }

  const falta = [];

  // --- Lua -----------------------------------------------------------------
  // Ancora do ROTULO: meio-dia local. Ancora da BUSCA dos marcos: meia-noite
  // local. As duas sao do mesmo dia civil, e o cabecalho explica cada uma.
  const ancora = meioDiaLocal(dia);
  const inicioDoDia = new Date(instante.getFullYear(), instante.getMonth(), instante.getDate(), 0, 0, 0, 0);

  const { fase, motivo: motivoFase } = faseCompleta(A, ancora, dia);
  if (motivoFase) falta.push(motivoFase);

  const cheia = marcoExato(A, 180, inicioDoDia);
  const nova = marcoExato(A, 0, inicioDoDia);
  if (!cheia || !nova) falta.push(MOTIVOS.MARCO_NAO_ENCONTRADO);

  const lua =
    fase && cheia && nova
      ? Object.freeze({
          fase,
          proximaCheia: marcoParaSaida(cheia, instante, 4),
          proximaNova: marcoParaSaida(nova, instante, 0),
        })
      : null;

  // --- Retrogrados ---------------------------------------------------------
  // Tudo ou nada, pelo motivo do cabecalho: lista parcial mentiria por omissao
  // sobre o planeta que nao deu para olhar.
  let retrogrados = [];
  for (const p of PLANETAS_RETROGRADAVEIS) {
    const r = estaRetrogrado(p, ancora);
    if (r === null) {
      retrogrados = null;
      falta.push(MOTIVOS.RETROGRADACAO_NAO_CALCULADA);
      break;
    }
    if (r) retrogrados.push(p);
  }

  const disponivel = falta.length === 0;
  return Object.freeze({
    instante: instanteFmt,
    dia,
    fuso,
    disponivel,
    motivo: disponivel ? null : falta[0],
    falta: Object.freeze(falta),
    lua,
    regenteDoDia: regente,
    retrogrados: retrogrados === null ? null : Object.freeze(retrogrados),
  });
}

export default {
  FASES,
  EMOJIS_FASE,
  FASES_CRESCENTES,
  FASES_MINGUANTES,
  REGENTE_POR_DIA,
  GLIFO_POR_PLANETA,
  PLANETAS_RETROGRADAVEIS,
  FONTE_SEMANA_PLANETARIA,
  MOTIVOS,
  EXPLICACAO_TECNICA,
  ceuDoDia,
  faseDoDia,
  proximoMarcoLunar,
  estaRetrogrado,
  regenteDoDia,
  diaDaSemana,
  diaLocal,
  meioDiaLocal,
  diasEntre,
  diasDesdeEpoca,
  esDiaValido,
  hayEfemeride,
};
