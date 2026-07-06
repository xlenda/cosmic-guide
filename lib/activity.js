// Agregador de conquistas/resumos para Progresso e Retrospectiva — porta fiel de
// c:/tmp/gilfforever/web/lib/activity.js (collectData, BADGES, computeBadges,
// monthlyRecap) + o yearlyRecap que no original vivia solto dentro de
// retrospectiva/page.js. Diferente do original (localStorage síncrono), aqui tudo
// é assíncrono e construído em cima dos getters que lib/coupleData.js já expõe —
// nenhuma chave nova é lida ou escrita, só combinamos o que Timeline/Reconectar/
// Descobrir/Agir/streak já persistem. Não grava nada: módulo 100% leitura.
import { getTimeline, getReconectarChecks, getDescobrirData, getAgirData, getStreak, daysUntil } from './coupleData';

// Junta os dados de todas as áreas numa única leitura — mesmo formato do
// collectData() original, na mesma ordem de campos. Exportado (igual ao
// original): retrospectiva/page.js importa collectData diretamente para pegar
// reconectarChecks, sem passar pelas conquistas.
export async function collectData(voce, amor) {
  const [timeline, reconectar, descobrir, agir, streak] = await Promise.all([
    getTimeline(voce, amor),
    getReconectarChecks(voce, amor),
    getDescobrirData(voce, amor),
    getAgirData(voce, amor),
    getStreak(voce, amor),
  ]);

  // Mesma regra de "cápsula aberta" que TimelineScreen já usa (daysUntil <= 0),
  // em vez de duplicar a comparação de datas do original em JS puro.
  const capsulesOpened = (timeline.capsules || []).filter((c) => daysUntil(c.unlockAt) <= 0).length;
  const reconectarChecks = Object.values(reconectar || {}).filter(Boolean).length;

  return {
    memoriesCount: (timeline.memories || []).length,
    capsulesCount: (timeline.capsules || []).length,
    capsulesOpened,
    reconectarChecks,
    linguagemFeito: Boolean(descobrir.linguagem),
    apegoFeito: Boolean(descobrir.apego),
    agirDoneCount: (agir.done || []).length,
    favoritesCount: (agir.favorites || []).length,
    goalDone: Boolean(agir.goalDone),
    goalSaved: agir.goalSaved || '',
    streakCount: streak.count,
    streakLongest: streak.longest,
  };
}

// Mesmas 10 conquistas do original (ids, emojis e critérios idênticos),
// só a cópia traduzida para PT-BR — nenhuma conquista nova foi inventada.
export const BADGES = [
  { id: 'memoria1', emoji: '🌱', title: 'Primeira memória', desc: 'Vocês adicionaram a primeira memória à linha do tempo.', check: (d) => d.memoriesCount >= 1 },
  { id: 'capsula1', emoji: '⏳', title: 'Primeira cápsula selada', desc: 'Vocês criaram a primeira cápsula do tempo.', check: (d) => d.capsulesCount >= 1 },
  { id: 'capsulaAberta', emoji: '🔓', title: 'Uma surpresa revelada', desc: 'Uma cápsula do tempo de vocês se abriu.', check: (d) => d.capsulesOpened >= 1 },
  { id: 'streak7', emoji: '🔥', title: '7 dias seguidos', desc: 'Uma semana inteira cuidando da relação, dia após dia.', check: (d) => d.streakLongest >= 7 },
  { id: 'streak30', emoji: '🌟', title: '30 dias seguidos', desc: 'Um mês inteiro de constância. Isso é raro.', check: (d) => d.streakLongest >= 30 },
  { id: 'reconectar10', emoji: '💞', title: '10 missões de reconexão', desc: 'Vocês completaram 10 passos nos caminhos de reconexão.', check: (d) => d.reconectarChecks >= 10 },
  { id: 'autoconhecimento', emoji: '🔮', title: 'Autoconhecimento a dois', desc: 'Descobriram a linguagem do amor e o estilo de apego de vocês.', check: (d) => d.linguagemFeito && d.apegoFeito },
  { id: 'desafio7', emoji: '🎯', title: 'Desafio de 7 dias', desc: 'Completaram o desafio de gestos diários.', check: (d) => d.agirDoneCount >= 7 },
  { id: 'metaAlcancada', emoji: '⭐', title: 'Meta alcançada', desc: 'Marcaram uma meta do casal como cumprida.', check: (d) => d.goalDone },
  { id: 'colecionador', emoji: '📸', title: 'Colecionadores de memórias', desc: '10 memórias guardadas na linha do tempo.', check: (d) => d.memoriesCount >= 10 },
];

export async function computeBadges(voce, amor) {
  const data = await collectData(voce, amor);
  return BADGES.map((b) => ({ ...b, unlocked: b.check(data) }));
}

// Resumo do mês — porta fiel de monthlyRecap() original: memórias/cápsulas
// filtradas pelo mês corrente (YYYY-MM), reconectarChecks/agirDoneCount/streakCount
// vêm de collectData (acumulado desde sempre, igual ao original).
export async function monthlyRecap(voce, amor) {
  const timeline = await getTimeline(voce, amor);
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const memoriesThisMonth = (timeline.memories || []).filter((m) => (m.date || '').startsWith(ym)).length;
  const capsulesSealedThisMonth = (timeline.capsules || []).filter((c) => (c.unlockAt || '').startsWith(ym)).length;
  const data = await collectData(voce, amor);
  return {
    mesLabel: now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    memoriesThisMonth,
    capsulesSealedThisMonth,
    reconectarChecks: data.reconectarChecks,
    agirDoneCount: data.agirDoneCount,
    streakCount: data.streakCount,
  };
}

// Resumo do ano — no original vivia inline dentro de retrospectiva/page.js (não
// estava em activity.js); porta fiel do mesmo cálculo: memórias/cápsulas do ano
// corrente, mais antiga e mais recente do ano.
export async function yearlyRecap(voce, amor) {
  const timeline = await getTimeline(voce, amor);
  const year = String(new Date().getFullYear());

  const memoriesThisYear = (timeline.memories || [])
    .filter((m) => (m.date || '').slice(0, 4) === year)
    .sort((a, b) => a.date.localeCompare(b.date));

  const capsulesSealedThisYear = (timeline.capsules || []).filter(
    (c) => (c.unlockAt || '').slice(0, 4) === year
  ).length;

  return {
    year,
    memoriesCount: memoriesThisYear.length,
    capsulesSealedThisYear,
    oldest: memoriesThisYear[0] || null,
    newest: memoriesThisYear[memoriesThisYear.length - 1] || null,
  };
}
