// O CHECK-IN DE UM TOQUE E O TERMÔMETRO DA LUNAÇÃO — o encantamento honesto.
//
// Pedido do dono (04/08/2026): retenção com "sensação de progresso" tipo os
// apps de sono de bebê ("dia 10: 70% melhor") — MAS o app tem regra de build
// contra promessa e número inventado, então aqui todo número é CONTA DE COISA
// REAL: o que a pessoa respondeu, quantos dias ela veio, quanto da lunação
// astronômica já passou. Nada aqui prevê nada; tudo aqui MEDE.
//
// As duas peças:
//   1. CHECK-IN: "Como está seu coração hoje?" — um toque, três respostas.
//      No fim da semana a pessoa vê o PRÓPRIO placar ("5 manhãs leves esta
//      semana; semana passada foram 2"). O dado é dela, o gráfico é dela —
//      é o loop de retenção mais forte que existe, e é 100% verdadeiro.
//   2. TERMÔMETRO: "42% desta lunação — você esteve aqui 5 dias". O % é o
//      avanço REAL da Lua entre uma Lua Nova e a próxima (astronomy-engine),
//      e a presença é a contagem de check-ins dentro dessa janela.
//
// AsyncStorage SÓ via lib/storage.js (regra da casa). As funções de conta são
// puras — recebem o mapa e a data — pra rodar em node:test sem mock nenhum.
import { getItemSeguro, setItemSeguro } from './storage';
import { nextExactMoonPhase } from './lunarCalendar';

const CHAVE = 'daily-checkin-v1';
// Preferência do lembrete diário (o toggle discreto dentro do bloco de
// check-in). Chave SEPARADA do mapa de respostas de propósito: a poda de 90
// dias mexe no mapa toda vez que alguém responde, e um dia a preferência
// desapareceria junto com um dia velho.
const CHAVE_LEMBRETE = 'daily-checkin-reminder-v1';

// As três respostas. Chaves internas em PT (são DADO, como as do personalSky);
// o rótulo de tela vem do i18n. Emojis moram aqui porque são idênticos nas
// três línguas — emoji não se traduz.
export const HUMORES = [
  { id: 'leve', emoji: '💛' },
  { id: 'neutro', emoji: '😌' },
  { id: 'pesado', emoji: '🌧️' },
];

const IDS_VALIDOS = new Set(HUMORES.map((h) => h.id));

export function diaISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Leitura e escrita (a única parte que toca o disco)
// ---------------------------------------------------------------------------
export async function lerCheckins() {
  try {
    const bruto = await getItemSeguro(CHAVE);
    const dados = bruto ? JSON.parse(bruto) : {};
    return dados && typeof dados === 'object' ? dados : {};
  } catch {
    return {};
  }
}

export async function registrarCheckin(humor, hoje = new Date()) {
  if (!IDS_VALIDOS.has(humor)) return null;
  const dados = await lerCheckins();
  dados[diaISO(hoje)] = humor;
  // Poda: 90 dias bastam pra qualquer resumo que o app mostra. Sem poda, o
  // registro cresceria pra sempre no aparelho de quem mais usa o app — punir
  // o melhor usuário com o storage mais gordo seria um prêmio ao contrário.
  const dias = Object.keys(dados).sort();
  for (const d of dias.slice(0, Math.max(0, dias.length - 90))) delete dados[d];
  await setItemSeguro(CHAVE, JSON.stringify(dados));
  return dados;
}

// ---------------------------------------------------------------------------
// O lembrete diário (preferência local + a regra de quando ele pode aparecer)
// ---------------------------------------------------------------------------
// O toggle só existe DEPOIS do primeiro check-in — regra do produto, não
// detalhe de UI: oferecer notificação diária de uma coisa que a pessoa nunca
// experimentou é pedir permissão antes de dar motivo, e é assim que opt-in
// vira spam. Quem já respondeu uma vez sabe o que está aceitando.
//
// Pura de propósito (recebe o mapa, devolve boolean) — quem decide se mostra é
// a tela, e o teste confere a regra sem montar componente nenhum.
export function jaFezAlgumCheckin(checkins) {
  if (!checkins || typeof checkins !== 'object') return false;
  return Object.values(checkins).some((humor) => IDS_VALIDOS.has(humor));
}

// A preferência mora no APARELHO, e o servidor guarda a marcação da inscrição
// de push (tabela push_daily_reminder). São duas verdades porque respondem a
// perguntas diferentes: o servidor sabe pra quem enviar, o aparelho sabe como
// desenhar o toggle antes de qualquer resposta de rede. Ausente = desligado —
// nunca ligamos nada por omissão.
export async function lerLembreteCheckin() {
  try {
    return (await getItemSeguro(CHAVE_LEMBRETE)) === 'true';
  } catch {
    return false;
  }
}

export async function salvarLembreteCheckin(ligado) {
  await setItemSeguro(CHAVE_LEMBRETE, ligado ? 'true' : 'false');
  return !!ligado;
}

// ---------------------------------------------------------------------------
// As contas (puras — nada de Date.now() escondido, nada de disco)
// ---------------------------------------------------------------------------
function inicioDaSemana(d) {
  // Semana começando na SEGUNDA — é como as pessoas contam "essa semana".
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (base.getDay() + 6) % 7; // seg=0 ... dom=6
  base.setDate(base.getDate() - dow);
  return base;
}

// EXPORTADA desde 04/08/2026 por causa da Retrospectiva da Lua Cheia
// (lib/retroLunacao.js), que precisa do placar leve/tranquilo/pesado DENTRO da
// mesma janela que o termômetro usa pra contar presença. Reaproveitar em vez de
// reescrever não é economia de linhas: se a retro tivesse a própria contagem, a
// menor diferença de borda (>= vs >, meia-noite local vs instante exato) faria a
// Home dizer "você esteve aqui 9 dias" e a retro dizer 10 — na mesma pessoa, no
// mesmo dia. Um app que se contradiz sozinho é pior que um que erra junto.
export function contarJanela(checkins, inicio, fim) {
  const placar = { leve: 0, neutro: 0, pesado: 0, total: 0 };
  for (const [dia, humor] of Object.entries(checkins)) {
    const [y, m, dd] = dia.split('-').map(Number);
    const quando = new Date(y, m - 1, dd);
    if (quando >= inicio && quando < fim && placar[humor] !== undefined) {
      placar[humor]++;
      placar.total++;
    }
  }
  return placar;
}

/**
 * O placar da semana atual e da anterior. `hoje` entra por parâmetro pra
 * teste; o placar são contagens, nunca porcentagem de vida de ninguém.
 */
export function resumoDaSemana(checkins, hoje = new Date()) {
  const inicioAtual = inicioDaSemana(hoje);
  const inicioAnterior = new Date(inicioAtual);
  inicioAnterior.setDate(inicioAnterior.getDate() - 7);
  const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
  return {
    atual: contarJanela(checkins, inicioAtual, amanha),
    anterior: contarJanela(checkins, inicioAnterior, inicioAtual),
  };
}

/**
 * O TERMÔMETRO: quanto da lunação corrente já passou (astronomia real) e
 * quantos dias a pessoa esteve aqui desde a Lua Nova.
 *
 * Sem efeméride devolve null — regra "nunca fabricar céu": termômetro sem Lua
 * de verdade seria exatamente o número inventado que este app não mostra.
 */
export function termometroDaLunacao(checkins, hoje = new Date()) {
  // A Lua Nova que ABRIU a lunação corrente: procura a próxima a partir de 31
  // dias atrás; se ela já passou, é a nossa — senão recua mais um pouco.
  for (const diasAtras of [31, 36]) {
    const partida = new Date(hoje.getTime() - diasAtras * 86400000);
    const abertura = nextExactMoonPhase(0, partida, 40);
    if (!abertura) return null;
    if (abertura > hoje) continue;
    const proxima = nextExactMoonPhase(0, new Date(abertura.getTime() + 3600000), 40);
    if (!proxima || proxima <= hoje) continue;
    const pct = Math.round(((hoje - abertura) / (proxima - abertura)) * 100);
    const presenca = contarJanela(checkins, abertura, new Date(hoje.getTime() + 86400000)).total;
    return { pct, diasPresentes: presenca, abertura, proxima };
  }
  return null;
}

/**
 * VOCÊ × VOCÊ DE 30 DIAS ATRÁS — a comparação só aparece quando é VERDADE.
 *
 * Compara os últimos 30 dias com os 30 anteriores (o registro guarda 90).
 * Devolve null quando qualquer janela tem menos de 8 respostas: comparação
 * com amostra rala viraria exatamente o número enganoso que o app não mostra.
 * E devolve a DIREÇÃO só quando há mudança de fato — "igual" também é
 * resposta honesta.
 */
export function comparacaoMensal(checkins, hoje = new Date()) {
  const dia = (n) => new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - n);
  const atual = contarJanela(checkins, dia(29), dia(-1));
  const anterior = contarJanela(checkins, dia(59), dia(29));
  if (atual.total < 8 || anterior.total < 8) return null;
  return { atual, anterior, direcao: atual.leve > anterior.leve ? 'mais-leve' : atual.leve < anterior.leve ? 'menos-leve' : 'igual' };
}
