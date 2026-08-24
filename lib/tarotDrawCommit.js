// Commit transacional da tiragem local. O snapshot vem primeiro; limite,
// previa e bonus so podem ser consumidos depois que a leitura ficou retomavel.
// Dependencias sao injetadas para que a ordem e as corridas sejam testadas sem
// montar toda a arvore nativa da tela.

function snapshotIdentity(snapshot) {
  return {
    createdAt: snapshot?.createdAt,
    cardIds: Array.isArray(snapshot?.cardIds) ? snapshot.cardIds : [],
  };
}
export async function commitTarotDrawSnapshot({
  snapshot,
  viaBonus = false,
  isSelectionCurrent = () => true,
  savePending,
  consumeBonus,
  clearPendingIfMatches,
} = {}) {
  if (
    !snapshot
    || typeof savePending !== 'function'
    || typeof clearPendingIfMatches !== 'function'
    || (viaBonus && typeof consumeBonus !== 'function')
  ) {
    return { ok: false, reason: 'invalid_contract' };
  }
  if (!isSelectionCurrent()) return { ok: false, reason: 'selection_changed' };

  const identity = snapshotIdentity(snapshot);
  const persisted = await savePending(snapshot);
  if (!persisted) {
    // setItemSeguro pode manter fallback apenas em memoria. A tentativa nao
    // deve reaparecer na sessao como se tivesse sido consumida.
    await clearPendingIfMatches(identity);
    return { ok: false, reason: 'persist_failed' };
  }
  if (!isSelectionCurrent()) {
    await clearPendingIfMatches(identity);
    return { ok: false, reason: 'selection_changed' };
  }

  if (viaBonus) {
    const consumed = await consumeBonus();
    if (!consumed) {
      await clearPendingIfMatches(identity);
      return { ok: false, reason: 'bonus_unavailable' };
    }
  }

  return { ok: true, bonusConsumed: viaBonus };
}
