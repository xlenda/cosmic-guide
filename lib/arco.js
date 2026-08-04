// lib/arco.js
// O ARCO DE 7 DIAS — um convite de hábito, e a contagem honesta dos dias.
//
// ===========================================================================
// O QUE ISTO É (e o que ele nunca vai ser)
// ===========================================================================
// A pessoa escolhe UM convite — escrever uma linha antes de dormir, um minuto
// de respiração ao acordar, um copo d'água ao abrir o app — e o app acompanha
// sete dias: "Dia 4 de 7 — você veio todos os dias". No dia 7 vem o selo e o
// placar.
//
// A regra que sustenta o arquivo inteiro, e ela é a mesma de lib/checkin.js
// (leia aquele primeiro — é o irmão mais velho desta feature): TODO NÚMERO AQUI
// É CONTAGEM DO QUE A PESSOA FEZ. Nada nesta feature prevê, promete ou afirma
// efeito — nem sobre corpo, nem sobre mente, nem sobre sorte. O hábito é
// CONVITE; o número é recibo. É por isso que:
//
//   · o convite é escrito como AÇÃO ("escrever uma linha"), nunca como
//     resultado ("dormir melhor"). O texto mora no dicionário, sob `arco.*`, e
//     test/arco.test.js varre os três idiomas atrás de promessa;
//   · "você veio todos os dias" só sai quando é VERDADE — feitos === dia E o
//     dia de hoje marcado. Um dia perdido não vira "você falhou": vira o número
//     honesto ("3 dias marcados até aqui"), e o arco continua;
//   · falhar não zera nada. Zerar a contagem por um dia perdido seria punir com
//     um número — e número que pune é número que mente sobre o que aconteceu.
//     Os dias marcados ficam marcados; o placar do dia 7 conta os que houve.
//
// ===========================================================================
// A JANELA É FIXA, E ISSO É DE PROPÓSITO
// ===========================================================================
// O arco tem começo (`inicio`) e sete dias corridos a partir dele — não sete
// visitas espalhadas. Uma janela que anda junto com quem falta ("faltou? tudo
// bem, o dia 4 fica pra quando você voltar") mede assiduidade de ninguém: ela
// mede só o número de vezes que a pessoa abriu o app, com nome de constância.
// Sete dias corridos é a única versão em que "vim todos os dias" quer dizer
// alguma coisa.
//
// ===========================================================================
// COMO ESTE ARQUIVO ESTÁ ORGANIZADO
// ===========================================================================
// Duas metades separadas na régua de lib/checkin.js:
//   1. AS CONTAS — puras. Recebem (estado, hoje) por parâmetro, não chamam
//      Date.now() escondido e não tocam disco. É o que test/arco.test.js
//      exercita sem mock nenhum.
//   2. O DISCO — quatro wrappers finos que leem, aplicam uma conta pura e
//      gravam. AsyncStorage SÓ via lib/storage.js (regra da casa).
//
// "Hoje" vem de localDayStr (lib/localDay.js) — o dia LOCAL do aparelho, nunca
// UTC. É a mesma convenção de lib/jornada.js, e pela mesma razão: no Brasil,
// depois das 21h, o dia UTC já é amanhã e a pessoa marcaria dois dias do arco
// numa noite só.
import { getItemSeguro, setItemSeguro } from './storage';
import { localDayStr } from './localDay';

const CHAVE = 'arco-7-dias-v1';

export const DIAS_DO_ARCO = 7;

// Quantos selos ficam guardados. Poda pela mesma razão da poda de 90 dias em
// lib/checkin.js: sem teto, quem mais usa o app é quem carrega o registro mais
// gordo no aparelho — prêmio ao contrário.
const MAX_SELOS = 12;

// As três frentes do convite. Ficam aqui como DADO (ids em PT, igual aos
// HUMORES do check-in); o rótulo de tela sai do i18n, sob arco.categoria.*.
export const CATEGORIAS = ['mente', 'corpo', 'espirito'];

// Os seis convites. Dois por frente — o bastante pra pessoa se reconhecer em
// algum, pouco o bastante pra escolher num relance. Cada `id` é chave de
// tradução (arco.convite.<id>) e NUNCA texto: o motor não redige, ele conta.
//
// O que faz um convite ser aceitável aqui: descrever um GESTO de menos de dois
// minutos que a pessoa possa provar que fez. "Beber um copo d'água" cabe;
// "se acalmar" não cabe — não é gesto, é resultado, e resultado é justamente a
// coisa que este app não promete.
export const CONVITES = [
  { id: 'linha', categoria: 'mente' },
  { id: 'nomear', categoria: 'mente' },
  { id: 'respirar', categoria: 'corpo' },
  { id: 'agua', categoria: 'corpo' },
  { id: 'ceu', categoria: 'espirito' },
  { id: 'silencio', categoria: 'espirito' },
];

const IDS_VALIDOS = new Set(CONVITES.map((c) => c.id));

// ---------------------------------------------------------------------------
// Datas — tudo em dia local YYYY-MM-DD, tudo comparável como string
// ---------------------------------------------------------------------------
function paraData(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function somarDias(iso, n) {
  const d = paraData(iso);
  d.setDate(d.getDate() + n);
  return localDayStr(d);
}

// Math.round, não Math.floor: no dia da virada do horário de verão a diferença
// entre duas meias-noites locais é 23h ou 25h, e o floor devolveria um dia a
// menos — o arco pularia (ou repetiria) um passo uma vez por ano, no país
// inteiro ao mesmo tempo.
function difDias(isoA, isoB) {
  return Math.round((paraData(isoB) - paraData(isoA)) / 86400000);
}

function ehDiaISO(v) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

// ---------------------------------------------------------------------------
// O estado, e a normalização que aceita lixo sem quebrar
// ---------------------------------------------------------------------------
// Formato gravado:
//   { conviteId, inicio, dias: ['2026-08-04', ...], selos: [{...}] }
//
// Normalizar na LEITURA (e não confiar no que está no disco) é o que impede
// que uma gravação parcial de versão antiga — ou um usuário curioso mexendo no
// localStorage do navegador — vire NaN dentro da contagem. A regra é a mesma de
// localDayStr: degradar para o estado vazio, que é sempre conhecível, em vez de
// propagar um valor envenenado para dentro do placar.
export function arcoVazio() {
  return { conviteId: null, inicio: null, dias: [], selos: [] };
}

export function normalizarArco(bruto) {
  const base = arcoVazio();
  if (!bruto || typeof bruto !== 'object') return base;

  const selos = Array.isArray(bruto.selos)
    ? bruto.selos
        .filter((s) => s && IDS_VALIDOS.has(s.conviteId) && ehDiaISO(s.inicio))
        .map((s) => ({
          conviteId: s.conviteId,
          inicio: s.inicio,
          feitos: Math.max(0, Math.min(DIAS_DO_ARCO, Number(s.feitos) || 0)),
          maiorSequencia: Math.max(0, Math.min(DIAS_DO_ARCO, Number(s.maiorSequencia) || 0)),
        }))
        .slice(-MAX_SELOS)
    : [];

  // Convite ou início inválido = não existe arco em curso. Os selos já
  // conquistados sobrevivem: eles são registro de coisa que aconteceu, e não
  // se apaga o passado por causa de um campo corrompido no presente.
  if (!IDS_VALIDOS.has(bruto.conviteId) || !ehDiaISO(bruto.inicio)) {
    return { ...base, selos };
  }

  const fim = somarDias(bruto.inicio, DIAS_DO_ARCO - 1);
  const dias = Array.isArray(bruto.dias)
    ? [...new Set(bruto.dias.filter((d) => ehDiaISO(d) && d >= bruto.inicio && d <= fim))].sort()
    : [];

  return { conviteId: bruto.conviteId, inicio: bruto.inicio, dias, selos };
}

export function arcoAtivo(estado) {
  return !!(estado && IDS_VALIDOS.has(estado.conviteId) && ehDiaISO(estado.inicio));
}

export function categoriaDoConvite(id) {
  const c = CONVITES.find((x) => x.id === id);
  return c ? c.categoria : null;
}

// ---------------------------------------------------------------------------
// AS CONTAS (puras — `hoje` entra por parâmetro, nada de disco)
// ---------------------------------------------------------------------------

/**
 * O retrato do arco em curso. Devolve null quando não há arco — a tela usa isso
 * pra decidir entre "escolha um convite" e "dia 4 de 7", sem repetir regra.
 *
 * Campos que a tela consome, e o que cada um garante:
 *   dia            — em que dia do arco `hoje` cai (1..7, ou >7 se já passou)
 *   feitos         — quantos dias a pessoa marcou DENTRO da janela
 *   marcouHoje     — hoje já está marcado
 *   todosOsDias    — só true quando é verdade: marcou hoje E feitos === dia
 *   maiorSequencia — a maior corrida de dias seguidos dentro da janela
 *   fechado        — o arco chegou ao fim (dia 7 marcado, ou a janela passou)
 *   passos         — os 7 dias em ordem, pra desenhar as bolinhas
 */
export function progressoDoArco(estado, hoje = new Date()) {
  if (!arcoAtivo(estado)) return null;

  const hojeISO = localDayStr(hoje);
  const offset = difDias(estado.inicio, hojeISO);

  // Offset negativo = o relógio do aparelho voltou (fuso, viagem, ajuste
  // manual). Tratamos como dia 1: é a leitura menos errada possível, e
  // `podeMarcar` recusa a marcação enquanto o relógio não alcançar o início —
  // marcar aqui gravaria um dia FORA da janela, e aí a contagem mentiria.
  const dia = Math.max(1, offset + 1);
  const marcados = new Set(estado.dias);
  const marcouHoje = marcados.has(hojeISO);

  const passos = [];
  let corrida = 0;
  let maiorSequencia = 0;
  for (let n = 1; n <= DIAS_DO_ARCO; n += 1) {
    const iso = somarDias(estado.inicio, n - 1);
    const marcado = marcados.has(iso);
    corrida = marcado ? corrida + 1 : 0;
    if (corrida > maiorSequencia) maiorSequencia = corrida;
    passos.push({ n, iso, marcado, hoje: iso === hojeISO, futuro: iso > hojeISO });
  }

  const feitos = passos.filter((p) => p.marcado).length;

  return {
    conviteId: estado.conviteId,
    categoria: categoriaDoConvite(estado.conviteId),
    inicio: estado.inicio,
    dia,
    total: DIAS_DO_ARCO,
    feitos,
    marcouHoje,
    // A frase "você veio todos os dias" nasce daqui e de lugar nenhum mais. As
    // DUAS condições importam: sem `marcouHoje` ela apareceria de manhã, antes
    // de a pessoa ter vindo hoje — dizendo por antecipação uma coisa que ainda
    // não aconteceu.
    todosOsDias: marcouHoje && feitos === dia,
    maiorSequencia,
    fechado: offset >= DIAS_DO_ARCO || (dia === DIAS_DO_ARCO && marcouHoje),
    expirado: offset >= DIAS_DO_ARCO,
    passos,
  };
}

/**
 * Pode marcar hoje? Puro e com MOTIVO — mesmo desenho de podeConcluir() em
 * lib/jornada.js: a tela pergunta em vez de reimplementar a regra, e o motivo
 * é o que permite mostrar a coisa certa (nada, "já marcado", ou o placar).
 */
export function podeMarcar(estado, hoje = new Date()) {
  const p = progressoDoArco(estado, hoje);
  if (!p) return { ok: false, motivo: 'semArco' };
  if (localDayStr(hoje) < estado.inicio) return { ok: false, motivo: 'foraDaJanela' };
  if (p.expirado) return { ok: false, motivo: 'foraDaJanela' };
  if (p.marcouHoje) return { ok: false, motivo: 'jaMarcouHoje' };
  return { ok: true, motivo: null };
}

// As três transições de estado, puras. Os wrappers de disco abaixo são só
// ler → aplicar uma destas → gravar. Separadas assim porque é o que deixa o
// teste exercitar a regra inteira sem tocar em AsyncStorage.
export function escolherNoEstado(estado, conviteId, hoje = new Date()) {
  if (!IDS_VALIDOS.has(conviteId)) return null;
  const base = normalizarArco(estado);
  return { conviteId, inicio: localDayStr(hoje), dias: [], selos: base.selos };
}

export function marcarNoEstado(estado, hoje = new Date()) {
  const base = normalizarArco(estado);
  if (!podeMarcar(base, hoje).ok) return null;
  const dias = [...new Set([...base.dias, localDayStr(hoje)])].sort();
  return { ...base, dias };
}

/**
 * Fecha o arco terminado e guarda o selo. O selo carrega o PLACAR junto
 * (feitos, maiorSequencia): sem isso ele seria um troféu sem número, e um
 * troféu sem número é a única coisa desta feature que poderia sugerir mais do
 * que aconteceu.
 */
export function fecharNoEstado(estado, hoje = new Date()) {
  const base = normalizarArco(estado);
  const p = progressoDoArco(base, hoje);
  if (!p || !p.fechado) return null;
  const selo = {
    conviteId: base.conviteId,
    inicio: base.inicio,
    feitos: p.feitos,
    maiorSequencia: p.maiorSequencia,
  };
  return { ...arcoVazio(), selos: [...base.selos, selo].slice(-MAX_SELOS) };
}

// Abandonar o arco em curso NÃO gera selo — não houve sete dias. O que sobra é
// o que já existia: os selos antigos, intactos.
export function abandonarNoEstado(estado) {
  const base = normalizarArco(estado);
  return { ...arcoVazio(), selos: base.selos };
}

// ---------------------------------------------------------------------------
// O DISCO (a única parte que sai do puro)
// ---------------------------------------------------------------------------
export async function lerArco() {
  try {
    const bruto = await getItemSeguro(CHAVE);
    return normalizarArco(bruto ? JSON.parse(bruto) : null);
  } catch {
    // JSON quebrado no disco vira arco vazio, nunca exceção: esta seção mora
    // dentro da Jornada, e um throw aqui levaria a tela inteira junto.
    return arcoVazio();
  }
}

async function gravar(estado) {
  await setItemSeguro(CHAVE, JSON.stringify(estado));
  return estado;
}

export async function escolherConvite(conviteId, hoje = new Date()) {
  const novo = escolherNoEstado(await lerArco(), conviteId, hoje);
  return novo ? gravar(novo) : null;
}

export async function marcarHoje(hoje = new Date()) {
  const novo = marcarNoEstado(await lerArco(), hoje);
  return novo ? gravar(novo) : null;
}

export async function fecharArco(hoje = new Date()) {
  const novo = fecharNoEstado(await lerArco(), hoje);
  return novo ? gravar(novo) : null;
}

export async function abandonarArco() {
  return gravar(abandonarNoEstado(await lerArco()));
}
