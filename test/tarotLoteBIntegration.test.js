import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(__dirname, '..');
const screen = fs.readFileSync(path.join(root, 'screens', 'TarotScreen.js'), 'utf8');
const pending = fs.readFileSync(path.join(root, 'lib', 'tarotPendingReading.js'), 'utf8');
const drawCommit = fs.readFileSync(path.join(root, 'lib', 'tarotDrawCommit.js'), 'utf8');

test('a tela usa o signo real do casal ou do perfil solo sem fallback em Aries', () => {
  assert.match(screen, /coupleData\?\.sa\s*\|\|\s*soloSign\?\.name/);
  assert.match(screen, /normalizeTarotGuideSign\(signName\)/);
  assert.doesNotMatch(screen, /signSnapshot\s*=\s*['"](?:Áries|Aries)['"]/);
});

test('o clique separa a prontidao normal da prontidao do bonus', () => {
  const drawStart = screen.indexOf('const drawCards = async');
  const hydrationGuard = screen.indexOf('if (!readyForThisPath || drawInFlightRef.current) return;', drawStart);
  const dailyGuard = screen.indexOf('if (!allowedToday) return;', drawStart);
  assert.ok(drawStart >= 0 && hydrationGuard > drawStart);
  assert.ok(hydrationGuard < dailyGuard, 'a corrida nao pode consumir limite antes de carregar o perfil');
  assert.match(screen, /const bonusDrawReady = profileHydrated\s*&& pendingHydrated\s*&& bonusHydrated/);
  assert.match(screen, /const readyForThisPath = viaBonus \? bonusDrawReady : drawReady/);
  assert.match(screen, /savePending: savePendingTarotReading/);
  assert.match(screen, /consumeBonus: consumeBonusTarotReading/);
  assert.ok(
    drawCommit.indexOf('await savePending(snapshot)') < drawCommit.indexOf('await consumeBonus()'),
    'snapshot duravel precisa vir antes do consumo do bonus'
  );
  assert.match(screen, /setPendingHydrated\(true\)/);
  for (const gate of ['dailyHydrated', 'accessHydrated', 'bonusHydrated']) {
    assert.ok(screen.includes(gate), `gate ausente: ${gate}`);
  }
  assert.match(screen, /await canDrawToday\(themeSnapshot\.key\)/);
  assert.match(screen, /await hasUsedFeatureOnce\(FEATURE_KEY\)/);
});

test('intencao e situacao do onboarding mudam tema e foco sem sobrepor escolha manual', () => {
  assert.match(screen, /PROFILE_THEME_BY_INTENT/);
  assert.match(screen, /PROFILE_PATH_BY_SITUATION/);
  assert.match(screen, /love:\s*'Amor'/);
  assert.match(screen, /work:\s*'Carreira'/);
  assert.match(screen, /loveClosure:\s*\{ themeKey: 'Amor', focusId: 'closure-renewal' \}/);
  assert.match(screen, /workGrowth:\s*\{ themeKey: 'Carreira', focusId: 'visibility-growth' \}/);
  assert.match(screen, /selfEmotions:\s*\{ themeKey: 'Saúde', focusId: 'emotional-balance' \}/);
  assert.match(screen, /onboardingProfile && !drawn && !themeTouchedRef\.current/);
  assert.match(screen, /themeTouchedRef\.current = true/);
});

test('snapshot congela guia, foco, estrutura e signo junto das cartas', () => {
  for (const field of ['focusId:', 'spreadKey:', 'sign:', 'guideVersion:']) {
    assert.ok(screen.includes(field), `TarotScreen sem ${field}`);
  }
  for (const field of ['focusId', 'spreadKey', 'sign', 'guideVersion']) {
    assert.ok(pending.includes(field), `snapshot sem ${field}`);
  }
  assert.match(screen, /setReadingFocusId\(restoredFocus/);
  assert.match(screen, /setReadingSpreadId\(restoredSpreadId\)/);
  assert.match(screen, /setReadingSign\(pending\.sign \|\| null\)/);
});

test('uma conclusão antiga não pode apagar nem colar diário em uma leitura nova', () => {
  assert.match(screen, /activeReadingIdRef\.current === targetReadingId/);
  assert.match(screen, /clearPendingTarotReadingIfMatches\(\{/);
  assert.match(screen, /createdAt: readingCreatedAt/);
  assert.match(screen, /completionInFlightRef\.current === targetReadingId/);
  const completion = screen.slice(screen.indexOf('const completeReading'), screen.indexOf('const reveal'));
  assert.ok(
    completion.indexOf('setJournalEntryId(entryId)') < completion.indexOf('clearPendingTarotReadingIfMatches'),
    'a UI e guardada, mas a limpeza condicional continua depois do await'
  );
});

test('a estrutura escolhida muda plano e semântica, e escolhas manuais vencem a hidratação', () => {
  assert.match(screen, /activeSpread\.id !== selectedFocus\?\.spreadId/);
  assert.match(screen, /readingSpreadId === 'situation-tension-next-step'/);
  assert.match(screen, /interpretationFrame/);
  assert.match(screen, /markSelectionTouched\(\)/);
  assert.match(screen, /onChangeText=\{handleQuestionChange\}/);
});

test('limites editoriais visíveis não vendem método como inteligência artificial', () => {
  assert.match(screen, /testID="tarot-guide-disclosures"/);
  assert.match(screen, /disclosures\?\.randomness/);
  assert.match(screen, /disclosures\?\.future/);
  assert.match(screen, /disclosures\?\.wellbeing/);
  assert.doesNotMatch(screen, /<Text[^>]*>\{ritualGuide\?\.disclosures\?\.method\}<\/Text>/);
});

test('cada carta mostra interpretacao antes do botao proxima e a sintese exige as tres', () => {
  const immediate = screen.indexOf('testID={`tarot-card-meaning-${ritualIndex}`}');
  const next = screen.indexOf('testID={`tarot-next-${ritualIndex}`}');
  const synthesis = screen.indexOf('testID="tarot-personal-synthesis"');
  assert.ok(immediate > 0 && next > immediate && synthesis > next);
  assert.match(screen.slice(immediate - 500, immediate), /revealed\[ritualIndex\]/);
  assert.match(screen.slice(synthesis - 300, synthesis), /ritualComplete\s*&&\s*readingArtifacts/);
});

test('a tela aplica lentes por tema tanto aos arcanos maiores quanto aos menores', () => {
  assert.match(screen, /getMajorThemeLens\(card, theme\.key, readingLanguage\)/);
  assert.match(screen, /getMinorThemeLens\(card, theme\.key, readingLanguage\)/);
  assert.match(screen, /thematicLenses\[index\] \|\| meaning/);
});

test('a arte usa a carta grande sem cover e mantem alternativa acessivel', () => {
  assert.match(screen, /resizeMode="contain"/);
  assert.match(screen, /width:\s*'96%'/);
  assert.match(screen, /maxWidth:\s*334/);
  assert.match(screen, /aspectRatio:\s*0\.6/);
  assert.match(screen, /tapLabel=\{t\('tarot\.scratch\.tapAlternative'\)\}/);
});
