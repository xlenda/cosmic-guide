// lib/readingCompletion.js
// Ponto único chamado por toda tela de leitura (Tarô, Palma/Rosto/Pé/Pintas,
// Café, Sonhos) quando o resultado é gerado. Concentra os 3 efeitos
// colaterais de "leitura concluída" num só lugar, pra cada tela chamar uma
// função só em vez de reimplementar journal+tokens+streak (e pra evitar que
// mudanças futuras nesses 3 sistemas precisem tocar em 7 telas diferentes).
import { saveJournalEntry } from './journal';
import { awardReadingTokens, getTokenBalance, TOKEN_REWARDS } from './tokens';
import { recordActiveDay } from './streak';

// type/typeLabel/title/body: mesmos campos que iam pro Diário Cósmico.
// Retorna { entryId, tokensEarned, newBalance, currentStreak, milestone } —
// entryId é usado depois pra anexar o insight de voz (attachVoiceInsight),
// tokensEarned pra exibir um toast/badge de "+N tokens" se a tela quiser
// (pode ser menor que o valor "cheio" se já bateu o teto diário — ver
// lib/tokens.js DAILY_READING_TOKEN_CAP), milestone (não-null só quando bate
// 7/30/100) pra quem chama celebrar.
export async function recordReadingCompletion({ type, typeLabel, title, body }) {
  const entryId = await saveJournalEntry({ type, typeLabel, title, body });

  let wanted = TOKEN_REWARDS.reading;
  const { isNewDay, currentStreak, milestone } = await recordActiveDay();
  if (isNewDay && currentStreak > 1) {
    wanted += TOKEN_REWARDS.streakDay;
  }
  const tokensEarned = await awardReadingTokens(wanted, typeLabel || 'Leitura concluída');
  const newBalance = await getTokenBalance();

  return { entryId, tokensEarned, newBalance, currentStreak, milestone };
}
