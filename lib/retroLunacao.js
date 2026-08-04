// A RETROSPECTIVA DA LUA CHEIA — o fechamento de meio-ciclo.
//
// Pedido do dono (04/08/2026): o "momento dia 10" dos apps de hábito, aquele em
// que o app finalmente PAGA a constância de volta. A diferença é o que se paga.
// Os apps de sono dizem "você melhorou 70%" — número que ninguém mediu, previsão
// disfarçada de balanço. Aqui a frase é "você esteve aqui 9 dias deste ciclo, e
// destes 5 foram leves": cada peça é contagem de coisa que a pessoa fez, e a
// única coisa que o app trouxe de fora é a data do céu.
//
// POR QUE A LUA CHEIA, E NÃO O "DIA 10". O app já mede a lunação corrente
// (termometroDaLunacao, em lib/checkin.js): a janela entre uma Lua Nova e a
// próxima, com instante exato de efeméride. A Lua Cheia é o MEIO dessa janela e
// é o único marco do ciclo que chega sozinho, sem o produto precisar inventar
// uma data de festa. "Faz 10 dias que você usa o app" é um marco que só
// interessa ao app; "hoje a Lua está cheia" é um marco que a pessoa vê da
// janela — e é ele que dá licença pro app aparecer com um balanço na mão.
//
// SEM EFEMÉRIDE NÃO EXISTE RETRO. Se astronomy-engine não estiver disponível, o
// motor devolve null e a tela diz que está indisponível. Chutar a abertura do
// ciclo (assumir 29,5 dias pra trás, por exemplo) daria um número plausível e
// ERRADO, com a cara de medido — exatamente o que este app não faz.
//
// TUDO POR PARÂMETRO. `checkins`, `hoje` e `leituras` entram de fora: nada de
// Date.now() escondido, nada de disco. Quem lê o disco é a tela (lerCheckins +
// getJournalEntries) — assim o motor inteiro roda em node:test sem mock nenhum.
import { faseDoDia, nextExactMoonPhase } from './lunarCalendar';
import { termometroDaLunacao, contarJanela } from './checkin';

const DIA_MS = 86400000;

// Índice da fatia de 45° que o app chama de Lua Cheia (0 = Nova, 4 = Cheia —
// a mesma tabela de PHASES em lib/lunarCalendar.js).
const FATIA_CHEIA = 4;

/**
 * Hoje é dia de Lua Cheia?
 *
 * A pergunta é respondida pela ÂNCORA ÚNICA DO DIA (faseDoDia, meio-dia local)
 * e não pelo instante exato da oposição. É de propósito: o instante exato dura
 * zero segundo, e uma tela que só abrisse nele nunca abriria pra ninguém. O
 * rótulo cobre a fatia de 45° em torno do marco (~3,7 dias), que é o mesmo
 * "hoje é Lua Cheia" que a grade do calendário mostra e que a pessoa vê no céu.
 * Ter DUAS definições de Lua Cheia no mesmo app é o bug que a âncora única
 * nasceu pra matar.
 *
 * A comparação é por LONGITUDE, nunca pelo nome: `fase.name` vem traduzido
 * (pt/es/en) e comparar com a string 'Lua Cheia' deixaria a tela fechada pra
 * quem usa o app em inglês. Longitude é medida — não tem idioma.
 */
export function ehDiaDeLuaCheia(hoje = new Date()) {
  const fase = faseDoDia(hoje);
  if (!fase || typeof fase.longitude !== 'number' || Number.isNaN(fase.longitude)) return false;
  const lon = ((fase.longitude % 360) + 360) % 360;
  return Math.round(lon / 45) % 8 === FATIA_CHEIA;
}

/**
 * Instante exato da próxima Lua Cheia — pra tela poder dizer QUANDO ela volta
 * em vez de só dizer "hoje não". Null sem efeméride (nunca uma data estimada).
 */
export function proximaLuaCheia(hoje = new Date()) {
  return nextExactMoonPhase(180, hoje, 40);
}

// A resposta mais frequente do ciclo. Empate devolve null de propósito: eleger
// um vencedor no par ou ímpar produziria uma frase ("seu ciclo foi leve") que o
// próprio placar da tela desmente logo abaixo. Empate é resposta.
function humorDominante(placar) {
  const ordenado = ['leve', 'neutro', 'pesado']
    .map((id) => ({ id, n: placar[id] || 0 }))
    .sort((a, b) => b.n - a.n);
  if (ordenado[0].n === 0) return null;
  if (ordenado[0].n === ordenado[1].n) return null;
  return ordenado[0].id;
}

// Leituras do Diário dentro da janela do ciclo.
//
// `entry.date` é timestamp LOCAL sem sufixo Z (lib/localDay.js), então
// `new Date(string)` volta a ser o mesmo instante local que foi gravado —
// comparar com a abertura (um instante UTC exato) é comparar instante com
// instante, que é o certo.
//
// A ASSIMETRIA DE BORDA, ASSUMIDA: o check-in é contado pela MEIA-NOITE local
// do dia (é o que contarJanela faz, e é o que a Home já mostra), enquanto a
// leitura é contada pela hora real dela. No dia da Lua Nova isso pode incluir
// uma leitura das 20h e excluir o check-in do mesmo dia. Preferimos isso a
// rebaixar a leitura pra meia-noite: cada fonte é contada na precisão que ela
// tem, e mexer na contagem do check-in aqui faria a retro divergir da Home.
function contarLeituras(leituras, inicio, fim) {
  if (!Array.isArray(leituras)) return 0;
  let n = 0;
  for (const e of leituras) {
    if (!e || typeof e.date !== 'string') continue;
    const quando = new Date(e.date);
    if (Number.isNaN(quando.getTime())) continue;
    if (quando >= inicio && quando < fim) n += 1;
  }
  return n;
}

/**
 * O BALANÇO DO CICLO — da última Lua Nova até hoje.
 *
 * @param {object} checkins  mapa 'YYYY-MM-DD' -> 'leve'|'neutro'|'pesado' (lerCheckins)
 * @param {Date}   hoje      o dia de referência (por parâmetro, sempre)
 * @param {Array}  leituras  entradas do Diário (getJournalEntries) — opcional
 *
 * Devolve null quando não há efeméride: a tela mostra indisponível honesto.
 */
export function retrospectivaDaLunacao(checkins, hoje = new Date(), leituras = []) {
  const termometro = termometroDaLunacao(checkins, hoje);
  if (!termometro) return null;

  const { abertura, proxima, pct } = termometro;

  // A MESMA expressão de fim que o termômetro usa (hoje + 24h corridas, não
  // meia-noite local). Copiada byte a byte de propósito — é o que garante que
  // placar.total seja SEMPRE igual ao diasPresentes que a Home já mostra.
  const fim = new Date(hoje.getTime() + DIA_MS);
  const placar = contarJanela(checkins, abertura, fim);

  // Dia 1 é o dia da própria Lua Nova — é assim que se conta dia de ciclo em
  // qualquer almanaque (o dia do marco é o primeiro, não o zero).
  const diaDoCiclo = Math.floor((hoje - abertura) / DIA_MS) + 1;
  const duracaoDoCiclo = Math.round((proxima - abertura) / DIA_MS);

  const leiturasNoCiclo = contarLeituras(leituras, abertura, fim);

  return {
    ehLuaCheia: ehDiaDeLuaCheia(hoje),
    abertura,
    proximaNova: proxima,
    pct,
    diaDoCiclo,
    duracaoDoCiclo,
    diasDePresenca: placar.total,
    placar,
    humorDominante: humorDominante(placar),
    leiturasNoCiclo,
    // Ciclo sem NADA registrado: a tela não celebra zeros (mesma disciplina do
    // wrapped mensal, que devolve null pro mês vazio). Aqui o objeto continua
    // existindo porque as datas do ciclo são verdadeiras e a tela ainda tem o
    // que dizer — só não tem o que comemorar.
    temRegistro: placar.total > 0 || leiturasNoCiclo > 0,
  };
}
