// Tempo relativo compacto usado no feed. A função recebe `t` por injeção para
// continuar pura e testável sem importar React ou o contexto de idioma.
export function formatSocialTimeAgo(iso, t, nowMs = Date.now()) {
  const createdAtMs = new Date(iso).getTime();
  if (!Number.isFinite(createdAtMs)) return t('social.time.justNow');

  const minutes = Math.max(0, Math.floor((nowMs - createdAtMs) / 60000));
  if (minutes < 1) return t('social.time.justNow');
  if (minutes < 60) return t('social.time.minutes', { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('social.time.hours', { count: hours });
  return t('social.time.days', { count: Math.floor(hours / 24) });
}
