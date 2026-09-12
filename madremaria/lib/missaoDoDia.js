// lib/missaoDoDia.js
// A MISSAO DO DIA — a camada de reconquista da cronogramacao (docs/
// CRONOGRAMACAO-365.md), escolhida por capitulo e travada pelo contato.
//
// ===================================================================================
// COMO A MISSAO E ESCOLHIDA (deterministico, sem disco, sem sorteio)
// ===================================================================================
//   1. O CAPITULO sai da LUNACAO dela (1..13), pela tabela CAPITULO_POR_LUA.
//   2. Fim de semana (sabado/domingo) troca o pool: MISSOES_FDS — a vida
//      social como reconstrucao, a pedido do dono ("convidar alguem pra sair").
//   3. O indice anda com o dia absoluto (dias desde 1970, como o rodizio dos
//      gestos), entao mesma pessoa + mesmo dia = mesma missao, offline.
//   4. A REDE DE CONTATO: missao com precisaContato=true NUNCA sai para quem
//      esta em contato duro (le-escribi-no-responde, cero-contacto, bloqueo —
//      os MESMOS ids de lib/plano.js). O indice pula para a proxima missao
//      solo do pool; o pulo e deterministico tambem.
//
// A anatomia do aceite (3S/Heat Game): a missao termina em "Aceita?"; o estado
// aceita/cumprida + a nota ficam POR DIA na chave 'missao', e o Apagar tudo a
// leva (CLAVES_HILO_ROJO).
import {
  CAPITULO_POR_LUA,
  MISSOES_FDS,
  MISSOES_POR_CAPITULO,
  missaoTraduzida,
} from '../datos/missoes365.js';
import { guardarSeguro, leerSeguro } from './almacen.js';
/* A REDE DE CONTATO vem de onde ela SEMPRE morou: lib/plano.js exporta
 * precisaDeRede (que le a lista canonica de datos/preguntas.js + o bloqueio).
 * A primeira versao deste arquivo copiava a lista na mao com uma justificativa
 * de ciclo que nao existia — o /code-review pegou no mesmo dia. "Duas
 * condicoes escritas na mao acabam discordando" e doutrina do proprio
 * precisaDeRede. */
import { DEGRAU_POR_MISSAO } from '../datos/escada.js';
import { precisaDeRede } from './plano.js';

const CLAVE = 'missao';
const TETO = 400;
const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;

function contatoDuro(respuestas) {
  return precisaDeRede(respuestas);
}

/* Dias desde 1970 sobre os campos LOCAIS da data — a mesma aritmetica do
 * rodizio dos gestos (lib/rituaisRotativos.js). */
function diaAbsoluto(dia) {
  const [a, m, d] = String(dia).split('-').map(Number);
  return Math.floor(Date.UTC(a, m - 1, d) / 86400000);
}

function ehFimDeSemana(dia) {
  const [a, m, d] = String(dia).split('-').map(Number);
  const s = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  return s === 0 || s === 6;
}

/**
 * A missao do dia, ou null (dia invalido / pool vazio).
 *
 * @param {string} dia          'YYYY-MM-DD' local
 * @param {number|null} lunacao 1..13 (de lib/ano.js), ou null (cai no cap. 1)
 * @param {object} [respuestas] as respostas do onboarding (so `hoy` e lida)
 */
export function missaoDoDia(dia, lunacao, respuestas, degrau) {
  if (!DIA_RE.test(String(dia))) return null;
  const fds = ehFimDeSemana(dia);
  /* O NOME do pool, e nao so o pool: ele e metade da chave de traducao
   * ('capitulo:indice') em datos/missoes365.es.js / .en.js. */
  const capitulo = fds ? 'fds' : (CAPITULO_POR_LUA[lunacao] || 'vocePrimeiro');
  const pool = fds ? MISSOES_FDS : MISSOES_POR_CAPITULO[capitulo] || [];
  if (!pool.length) return null;

  const duro = contatoDuro(respuestas);
  const base = diaAbsoluto(dia) % pool.length;

  /* A ESCADA DO DEGELO (11/09). As missoes que pedem acao com a outra pessoa
   * sao entregues em ORDEM, do degrau mais leve ao de coragem (datos/escada.js).
   * `degrau` e a altura em que a pessoa esta; sem ele, a escada nao filtra nada
   * e o comportamento e o de antes — e por isso nenhum chamador antigo quebra.
   *
   * ACIMA do degrau atual nao sai: o convite nao pode chegar antes de o canal
   * ter reaberto. ABAIXO sai: um degrau ja vencido continua valendo como
   * missao do dia, e nao ha nada de errado em repetir um gesto leve.
   *
   * Missao SEM degrau (as 272 que se completam sozinhas) passa sempre: a escada
   * so governa o contato. */
  const teto = Number(degrau) > 0 ? Number(degrau) : 0;
  const cabe = (m) => {
    if (duro && m.precisaContato) return false;
    if (!teto) return true;
    const d = DEGRAU_POR_MISSAO[m.titulo] || 0;
    return d <= teto;
  };

  /* A TRADUCAO ENTRA SO NA SAIDA, de proposito. Todo o filtro acima (cabe(),
   * DEGRAU_POR_MISSAO[m.titulo], m.precisaContato) continua lendo o objeto
   * PORTUGUES — que e onde o degrau e o campo de contato moram. Traduzir antes
   * de filtrar mudaria o titulo que a escada procura e derrubaria a protecao de
   * quem esta em contato duro em ES e EN. Quem decide e o PT; quem a pessoa le
   * e o idioma dela. */
  const entregar = (m, i) => missaoTraduzida(m, capitulo, (base + i) % pool.length);

  /* O pulo do contato: anda para frente ate achar missao que sirva. Um pool
   * 100% precisaContato devolveria null — e os testes garantem que nenhum pool
   * e assim. */
  for (let i = 0; i < pool.length; i += 1) {
    const m = pool[(base + i) % pool.length];
    if (cabe(m)) return entregar(m, i);
  }
  /* Nenhuma coube pelo teto da escada: devolve a primeira que o contato
   * permite. Um dia sem missao seria pior do que um gesto fora de ordem. */
  for (let i = 0; i < pool.length; i += 1) {
    const m = pool[(base + i) % pool.length];
    if (!duro || !m.precisaContato) return entregar(m, i);
  }
  return null;
}

/* ===================================================================================
   O ACEITE E O CUMPRIMENTO — por dia, com nota.
   =================================================================================== */
async function lerTudo() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return {};
  try {
    const dato = JSON.parse(bruto);
    return dato && dato.dias && typeof dato.dias === 'object' ? dato.dias : {};
  } catch (e) {
    return {};
  }
}

/** { aceita: bool, cumprida: bool, nota: 0..10|null, palavra: string } ou null. */
export async function estadoDaMissao(dia) {
  const dias = await lerTudo();
  const e = dias[dia];
  return e && typeof e === 'object' ? e : null;
}

/* FILA DE ESCRITA: dois toques rapidos (Aceito -> Cumpri) faziam duas
 * leituras do mesmo estado e a segunda escrita engolia a primeira. Encadear
 * as escritas numa promessa unica serializa sem lock e sem perder o contrato
 * de nunca lancar. */
let filaDeEscrita = Promise.resolve();

export function marcarMissao(dia, mudanca) {
  const tarefa = () => marcarMissaoAgora(dia, mudanca);
  filaDeEscrita = filaDeEscrita.then(tarefa, tarefa);
  return filaDeEscrita;
}

async function marcarMissaoAgora(dia, mudanca) {
  if (!DIA_RE.test(String(dia))) return false;
  if (!mudanca || typeof mudanca !== 'object') return false;
  const dias = await lerTudo();
  const atual = dias[dia] && typeof dias[dia] === 'object' ? dias[dia] : {};
  const nota =
    typeof mudanca.nota === 'number' && mudanca.nota >= 0 && mudanca.nota <= 10
      ? Math.round(mudanca.nota)
      : atual.nota != null
        ? atual.nota
        : null;
  dias[dia] = {
    aceita: mudanca.aceita != null ? Boolean(mudanca.aceita) : Boolean(atual.aceita),
    cumprida: mudanca.cumprida != null ? Boolean(mudanca.cumprida) : Boolean(atual.cumprida),
    nota,
    palavra:
      typeof mudanca.palavra === 'string'
        ? mudanca.palavra.slice(0, 200)
        : atual.palavra || '',
  };
  const chaves = Object.keys(dias).sort();
  while (chaves.length > TETO) delete dias[chaves.shift()];
  return guardarSeguro(CLAVE, JSON.stringify({ dias }));
}

/** Quantas missoes ja foram CUMPRIDAS — o numero honesto do balanco. */
export async function totalCumpridas() {
  const dias = await lerTudo();
  return Object.values(dias).filter((e) => e && e.cumprida).length;
}

export default { missaoDoDia, estadoDaMissao, marcarMissao, totalCumpridas };
