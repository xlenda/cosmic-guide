// lib/hilo.js
// "Meu Fio" — a sequência de dias do Fio Vermelho, contada em NÓS.
// Interface pública em espanhol, comentários em português.
//
// ===========================================================================
// O QUE ESTE MÓDULO É (e o que ele deliberadamente NÃO é)
// ===========================================================================
// É o "Dia de Fogo" do Heat Game trocado de metáfora: o fio ganha um nó a cada
// dia em que a pessoa veio ler. A troca não é decorativa — ela muda o que
// acontece quando o dia passa em branco.
//
// Chama que se apaga é uma ameaça: ela existe para a pessoa voltar com medo de
// perder. Um fio parado não é ameaça nenhuma — ele continua ali, do tamanho que
// ficou, esperando. Por isso este módulo obedece a três regras DE PRODUTO, não
// de código, e qualquer uma delas violada estraga o app inteiro:
//
//   1. O RECORDE NUNCA ZERA. Só a sequência corrente volta a 1. O maior fio que
//      a pessoa já fez foi conquistado de verdade; apagar isso é mentir sobre o
//      passado dela para pressionar o presente.
//   2. QUEBRAR NÃO PUNE. Não existe "perdiste tu racha", não existe chama
//      apagada, não existe recuperar pagando. O copy do estado parado é
//      `hilo.rachaRota` ("El hilo no se rompió. Se quedó quieto.") seguido de
//      `hilo.record` — constatação e recorde intacto, nunca perda e nunca
//      oferta. Este arquivo não tem, e não pode ganhar, nenhuma função de
//      "restaurar sequência".
//   3. RELÓGIO PARA TRÁS É O MESMO DIA. Nem prêmio nem castigo. Ver `atarNudo`.
//
// Do lado do disco tudo mora numa chave só, 'limite'-style: 'hilo' guarda
// { ultimoDia, actual, record, total } em JSON. Quem chama nunca escreve o
// prefixo 'hr.' — isso é assunto do lib/almacen.js.
//
// SEPARAÇÃO DE PAPÉIS entre as três funções, porque é fácil confundir:
//   leerHilo()    → o que está NO DISCO, sanitizado. Não escreve, não interpreta.
//   resumenHilo() → o que a TELA mostra hoje. Deriva do estado, NÃO escreve.
//   atarNudo()    → a única que escreve. Idempotente dentro do mesmo dia.
// ===========================================================================

import { guardarSeguro, leerSeguro } from './almacen.js';

const CLAVE = 'hilo';

// Duplicado de propósito em lib/limiteDiario.js: são dois motores independentes
// e nenhum deve quebrar porque o outro mudou. São dez linhas triviais; um
// terceiro módulo de data custaria mais em acoplamento do que economiza aqui.
//
// Dia LOCAL, não UTC. Quem lê às 22h de Buenos Aires está no dia dela, não no
// dia de Londres — usar UTC daria o nó ao dia seguinte e criaria "buracos" que
// a pessoa jurava não ter. O ano é padronizado em 4 dígitos para que a
// comparação de strings continue válida em qualquer relógio.
function hoyLocal() {
  const d = new Date();
  const pad = (n, largo = 2) => String(n).padStart(largo, '0');
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function esDiaValido(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(anio, mes - 1, dd));
  // Round-trip: mata '2026-02-31' e '2026-13-01', que passam no regex.
  return t.getUTCFullYear() === anio && t.getUTCMonth() === mes - 1 && t.getUTCDate() === dd;
}

// Diferença em dias de calendário. Ancorada em UTC de propósito: as strings já
// são dias locais, e montar Date local aqui faria o horário de verão devolver
// 0,96 ou 1,04 dia — que vira 0 ou 2 nós no arredondamento. Devolve null quando
// qualquer das pontas não é um dia válido, e o chamador trata isso como "sem
// histórico". Exportada só para os testes conseguirem exercitar a virada de mês,
// de ano e de horário de verão sem mexer no relógio da máquina.
export function _diasEntre(desde, hasta) {
  if (!esDiaValido(desde) || !esDiaValido(hasta)) return null;
  const [a1, m1, d1] = desde.split('-').map(Number);
  const [a2, m2, d2] = hasta.split('-').map(Number);
  const ms = Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1);
  return Math.round(ms / 86400000);
}

function enteroSeguro(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

const ESTADO_VACIO = { ultimoDia: null, actual: 0, record: 0, total: 0 };

// Sanitiza o que veio do disco. Storage é entrada externa: pode ter sido
// editado à mão no devtools, ter sobrado de uma versão anterior do app ou ter
// vindo truncado. Nada aqui lança — estado ilegível vira estado vazio, e o
// primeiro nó de hoje reconstrói a vida da pessoa a partir do zero em vez de
// travar a tela.
function normalizar(bruto) {
  if (!bruto || typeof bruto !== 'object') return { ...ESTADO_VACIO };
  const ultimoDia = esDiaValido(bruto.ultimoDia) ? bruto.ultimoDia : null;
  // Existir um dia registrado significa que um nó foi atado naquele dia: a
  // sequência corrente vale no mínimo 1. Um disco que diga `ultimoDia` com
  // `actual: 0` está corrompido, e a correção é para cima.
  const actual = ultimoDia ? Math.max(1, enteroSeguro(bruto.actual)) : 0;
  return {
    // Sem dia registrado não existe sequência corrente: um `actual` solto sem
    // âncora de data nunca poderia ser continuado nem quebrado.
    ultimoDia,
    actual,
    // O recorde nunca pode sair menor do que a sequência corrente, e o total
    // nunca menor que a sequência que ele contém. Se o disco disser o contrário,
    // o disco está errado — e o erro se corrige para CIMA, nunca cortando o que
    // a pessoa já fez.
    record: Math.max(enteroSeguro(bruto.record), actual),
    total: Math.max(enteroSeguro(bruto.total), actual),
  };
}

/**
 * O estado como está no disco, sanitizado. Nunca escreve e nunca lança.
 * @returns {Promise<{ultimoDia: string|null, actual: number, record: number, total: number}>}
 */
export async function leerHilo() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return { ...ESTADO_VACIO };
  try {
    return normalizar(JSON.parse(bruto));
  } catch {
    return { ...ESTADO_VACIO };
  }
}

// Do estado guardado para o que a tela precisa hoje.
//
// A distinção que importa: `actual` aqui é a sequência VIVA, não a guardada. Se
// o último nó foi anteontem, a sequência corrente é 0 — o fio parou. O que está
// no disco continua intocado (nada de "faxina" que apaga o passado por conta
// própria); só a leitura é que reconhece que o dia virou.
//
// Cada campo booleano existe porque uma linha de copy depende dele:
//   vacio    → 'hilo.vacio'
//   hoyAtado → 'hilo.hoyListo'
//   quieto   → 'hilo.rachaRota' + 'hilo.record' (constatação + recorde intacto)
//   singular → 'hilo.conteo' com {unidad}: 1 nudo / 2 nudos. `textos.js` traz só
//              o plural em 'hilo.unidad'; a decisão de forma é da tela, e aqui
//              vai o dado que ela precisa em vez de copy espalhada pela lib.
function derivar(estado, hoy) {
  const diff = estado.ultimoDia ? _diasEntre(estado.ultimoDia, hoy) : null;
  // diff <= 0 cobre os dois casos de "hoje": o nó feito hoje mesmo e o relógio
  // que andou para trás (dia guardado no futuro). Ver `atarNudo`.
  const hoyAtado = diff !== null && diff <= 0;
  const viva = hoyAtado ? estado.actual : diff === 1 ? estado.actual : 0;
  return {
    actual: viva,
    record: estado.record,
    total: estado.total,
    ultimoDia: estado.ultimoDia,
    hoyAtado,
    vacio: estado.total === 0,
    // Só é "quieto" quem já teve fio e deixou passar um dia inteiro. Quem leu
    // ontem e ainda não leu hoje NÃO está quieto: a sequência dela está de pé.
    quieto: estado.total > 0 && viva === 0,
    singular: viva === 1,
  };
}

/**
 * O resumo que a tela do Hilo mostra. Não escreve nada.
 * @param {string} [hoy] dia YYYY-MM-DD; só os testes passam isto.
 * @returns {Promise<{actual: number, record: number, total: number, ultimoDia: string|null,
 *   hoyAtado: boolean, vacio: boolean, quieto: boolean, singular: boolean}>}
 */
export async function resumenHilo(hoy) {
  const dia = esDiaValido(hoy) ? hoy : hoyLocal();
  return derivar(await leerHilo(), dia);
}

/**
 * Ata o nó de hoje. É a ÚNICA função deste arquivo que escreve.
 *
 * Idempotente dentro do dia: chamar dez vezes na mesma data dá um nó só. Isso
 * não é detalhe de implementação — a tela da síntese pode remontar, o usuário
 * pode voltar e reabrir a leitura, e nenhuma dessas coisas é um dia novo.
 *
 * Os quatro caminhos:
 *   sem histórico          → actual = 1  (o primeiro nó)
 *   ontem                  → actual + 1  (sequência continua)
 *   antes de ontem         → actual = 1  (recomeça em 1, NUNCA em 0: o nó de
 *                            hoje conta; e o `record` fica onde estava)
 *   hoje / dia no futuro   → nada muda   (ver abaixo)
 *
 * RELÓGIO PARA TRÁS. Se o dia guardado for MAIOR que hoje, alguém adiantou o
 * relógio, leu, e voltou. Tratamos como o mesmo dia: nenhum nó a mais (não
 * premia) e nenhuma sequência zerada (não pune). A única coisa que fazemos é
 * ancorar o registro em hoje, para que a pessoa que corrigiu o relógio do
 * aparelho volte a poder atar nós amanhã em vez de ficar esperando o futuro
 * chegar. Nenhum contador é tocado nesse ajuste.
 *
 * @param {string} [hoy] dia YYYY-MM-DD; só os testes passam isto.
 * @returns {Promise<{actual: number, record: number, total: number, ultimoDia: string|null,
 *   hoyAtado: boolean, vacio: boolean, quieto: boolean, singular: boolean,
 *   nuevoNudo: boolean, nuevoRecord: boolean, persistido: boolean}>}
 *   nuevoNudo   — este chamado atou um nó (false na segunda vez do mesmo dia)
 *   nuevoRecord — a sequência corrente passou o recorde anterior (momento de
 *                 celebrar; a ausência dele nunca é motivo de cobrança)
 *   persistido  — este chamado escreveu no disco. False quando não havia o que
 *                 escrever E false quando o disco falhou; quem precisa avisar
 *                 "não deu pra gravar" cruza com `nuevoNudo`.
 */
export async function atarNudo(hoy) {
  const dia = esDiaValido(hoy) ? hoy : hoyLocal();
  const estado = await leerHilo();
  const diff = estado.ultimoDia ? _diasEntre(estado.ultimoDia, dia) : null;

  // Mesmo dia, ou relógio para trás: nada de contador muda.
  if (diff !== null && diff <= 0) {
    let persistido = false;
    if (diff < 0) {
      // Só reancora a data. actual, record e total ficam exatamente como estão.
      const ancorado = { ...estado, ultimoDia: dia };
      persistido = await guardarSeguro(CLAVE, JSON.stringify(ancorado));
      return { ...derivar(ancorado, dia), nuevoNudo: false, nuevoRecord: false, persistido };
    }
    return { ...derivar(estado, dia), nuevoNudo: false, nuevoRecord: false, persistido };
  }

  const continua = diff === 1;
  const actual = continua ? estado.actual + 1 : 1;
  const nuevoRecord = actual > estado.record;
  const siguiente = {
    ultimoDia: dia,
    actual,
    // max() e não atribuição: mesmo recomeçando em 1, o recorde fica de pé.
    record: Math.max(estado.record, actual),
    total: estado.total + 1,
  };
  const persistido = await guardarSeguro(CLAVE, JSON.stringify(siguiente));
  return { ...derivar(siguiente, dia), nuevoNudo: true, nuevoRecord, persistido };
}

export default { leerHilo, atarNudo, resumenHilo };
