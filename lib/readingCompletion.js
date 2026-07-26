// lib/readingCompletion.js
// Ponto único chamado por toda tela de leitura (Tarô, Palma/Rosto/Pé/Pintas,
// Café, Sonhos) quando o resultado é gerado. Concentra os 3 efeitos
// colaterais de "leitura concluída" num só lugar, pra cada tela chamar uma
// função só em vez de reimplementar journal+tokens+streak (e pra evitar que
// mudanças futuras nesses 3 sistemas precisem tocar em 7 telas diferentes).
import { saveJournalEntry } from './journal';
import { awardTokens, TOKEN_REWARDS } from './tokens';
import { recordActiveDay } from './streak';

// type/typeLabel/title/body: mesmos campos que iam pro Diário Cósmico.
// Retorna { entryId, tokensEarned, newBalance, currentStreak, milestone } —
// entryId é usado depois pra anexar o insight de voz (attachVoiceInsight),
// tokensEarned pra exibir um toast/badge de "+N tokens" se a tela quiser,
// milestone (não-null só quando bate 7/30/100) pra quem chama celebrar.
export async function recordReadingCompletion({ type, typeLabel, title, body }) {
  const entryId = await saveJournalEntry({ type, typeLabel, title, body });

  let tokensEarned = TOKEN_REWARDS.reading;
  const { isNewDay, currentStreak, milestone } = await recordActiveDay();
  if (isNewDay && currentStreak > 1) {
    tokensEarned += TOKEN_REWARDS.streakDay;
  }
  const newBalance = await awardTokens(tokensEarned, typeLabel || 'Leitura concluída');

  return { entryId, tokensEarned, newBalance, currentStreak, milestone };
}
