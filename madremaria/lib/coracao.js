// lib/coracao.js
// O CORACAO DE HOJE — o check-in de um toque, e o placar honesto da semana.
//
// Portado em espirito do Cosmic Guide (lib/checkin.js), que o descreve assim:
// "o dado e dela, o grafico e dela — e o loop de retencao mais forte que
// existe, e e 100% verdadeiro". Tres estados, um toque, nenhuma pergunta
// aberta: leve, neutro, pesado.
//
// O QUE ESTE MODULO NAO FAZ: julgamento. O placar CONTA ("3 dias leves esta
// semana; na passada foram 2") e nunca qualifica ("voce esta melhorando!").
// Adjetivo e promessa; contagem e fato — a regra dos numeros da casa.
//
// FORMATO ('coracao'): {
//   dias: { 'YYYY-MM-DD': 'leve'|'neutro'|'pesado' },
//   aposta: { humor, feitaEm } | null,     — a aposta de amanha (uma por vez)
//   revelada: { dia, apostou, chegou } | null, — a ultima revelacao (reabertura)
//   acertos: number                         — SO acertos; erro nao tem placar
// }
// A APOSTA (04/09): "e amanha, como voce acha que chega?" — 1 toque. Revela
// contra o PROXIMO coracao registrado (faltar nao expira nada, nem e citado),
// e o contador guarda apenas os acertos — errar a aposta nao vira numero.
import { guardarSeguro, leerSeguro } from './almacen.js';

const CLAVE = 'coracao';
const TETO = 400;
const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;

export const HUMORES = Object.freeze(['leve', 'neutro', 'pesado']);

async function lerEstado() {
  const bruto = await leerSeguro(CLAVE);
  const vazio = { dias: {}, aposta: null, revelada: null, acertos: 0 };
  if (!bruto) return vazio;
  try {
    const dato = JSON.parse(bruto);
    if (!dato || typeof dato !== 'object') return vazio;
    return {
      dias: dato.dias && typeof dato.dias === 'object' ? dato.dias : {},
      aposta:
        dato.aposta && HUMORES.includes(dato.aposta.humor) && DIA_RE.test(dato.aposta.feitaEm)
          ? { humor: dato.aposta.humor, feitaEm: dato.aposta.feitaEm }
          : null,
      revelada:
        dato.revelada && DIA_RE.test(dato.revelada.dia)
          ? dato.revelada
          : null,
      acertos: Number.isInteger(dato.acertos) && dato.acertos > 0 ? dato.acertos : 0,
    };
  } catch (e) {
    return vazio;
  }
}

async function lerTudo() {
  return (await lerEstado()).dias;
}

/** O humor registrado naquele dia, ou null. */
export async function coracaoDoDia(dia) {
  const dias = await lerTudo();
  return HUMORES.includes(dias[dia]) ? dias[dia] : null;
}

let filaDeEscrita = Promise.resolve();

/** Registra o humor do dia (tocar de novo TROCA). Escritas em fila: dois
 *  toques rapidos nunca se engolem. */
export function registrarCoracao(dia, humor) {
  const tarefa = () => registrarAgora(dia, humor);
  filaDeEscrita = filaDeEscrita.then(tarefa, tarefa);
  return filaDeEscrita;
}

async function registrarAgora(dia, humor) {
  if (!DIA_RE.test(String(dia)) || !HUMORES.includes(humor)) return false;
  const estado = await lerEstado();
  estado.dias[dia] = humor;
  const chaves = Object.keys(estado.dias).sort();
  while (chaves.length > TETO) delete estado.dias[chaves.shift()];
  return guardarSeguro(CLAVE, JSON.stringify(estado));
}

/* --- A APOSTA DE AMANHA ----------------------------------------------------------- */

/** Guarda a aposta (1 toque; apostar de novo TROCA). Nunca lança. */
export function apostarAmanha(dia, humor) {
  const tarefa = async () => {
    if (!DIA_RE.test(String(dia)) || !HUMORES.includes(humor)) return false;
    const estado = await lerEstado();
    estado.aposta = { humor, feitaEm: dia };
    return guardarSeguro(CLAVE, JSON.stringify(estado));
  };
  filaDeEscrita = filaDeEscrita.then(tarefa, tarefa);
  return filaDeEscrita;
}

/** O estado da aposta para a tela: { aposta, revelada, acertos }. */
export async function estadoDaAposta() {
  const { aposta, revelada, acertos } = await lerEstado();
  return { aposta, revelada, acertos };
}

/**
 * Revela a aposta contra o coração de HOJE, se houver aposta de um dia
 * ANTERIOR (a de hoje espera o próximo registro — nunca se revela no ato).
 * Consome a aposta, guarda a revelação (reabrir o dia mostra de novo) e
 * conta o acerto. Devolve { apostou, chegou, acertos } ou null.
 */
export function revelarAposta(dia, humorDeHoje) {
  const tarefa = async () => {
    if (!DIA_RE.test(String(dia)) || !HUMORES.includes(humorDeHoje)) return null;
    const estado = await lerEstado();
    if (!estado.aposta || estado.aposta.feitaEm >= dia) return null;
    const apostou = estado.aposta.humor;
    estado.aposta = null;
    estado.revelada = { dia, apostou, chegou: humorDeHoje };
    if (apostou === humorDeHoje) estado.acertos += 1;
    await guardarSeguro(CLAVE, JSON.stringify(estado));
    return { apostou, chegou: humorDeHoje, acertos: estado.acertos };
  };
  filaDeEscrita = filaDeEscrita.then(tarefa, tarefa);
  return filaDeEscrita;
}

/* O dia N dias antes de um 'YYYY-MM-DD', em UTC puro (sem fuso, sem verao). */
function diasAntes(dia, n) {
  const [a, m, d] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(a, m - 1, d - n));
  const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(t.getUTCDate()).padStart(2, '0');
  return `${t.getUTCFullYear()}-${mm}-${dd}`;
}

/**
 * O placar de uma janela de 7 dias que TERMINA em `dia`.
 * `anterior` e a mesma janela, uma semana antes — o "na semana passada foram 2".
 * So contagens; a comparacao em prosa e trabalho da tela, com as regras dela.
 */
export async function placarDaSemana(dia) {
  if (!DIA_RE.test(String(dia))) return null;
  const dias = await lerTudo();
  const conta = (fim) => {
    const c = { leve: 0, neutro: 0, pesado: 0, registrados: 0 };
    for (let i = 0; i < 7; i += 1) {
      const h = dias[diasAntes(fim, i)];
      if (HUMORES.includes(h)) {
        c[h] += 1;
        c.registrados += 1;
      }
    }
    return c;
  };
  return { semana: conta(dia), anterior: conta(diasAntes(dia, 7)) };
}

export default { HUMORES, coracaoDoDia, registrarCoracao, placarDaSemana };
