// IDs sociais alimentam consultas, lapides de suspensao e trilha de auditoria.
// Um unico normalizador evita que espacos ou caracteres invisiveis apontem cada
// etapa para uma identidade diferente. IDs longos sao rejeitados, nao cortados:
// cortar poderia transformar um valor malicioso no prefixo de uma conta real.
const CONTROL_OR_INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/gu;
const MAX_SOCIAL_USER_ID_LENGTH = 64;

function normalizeSocialUserId(value) {
  if (value === undefined || value === null) return null;

  const clean = String(value).replace(CONTROL_OR_INVISIBLE, "").trim();
  if (!clean || clean.length > MAX_SOCIAL_USER_ID_LENGTH || /\s/u.test(clean)) return null;
  return clean;
}

module.exports = { MAX_SOCIAL_USER_ID_LENGTH, normalizeSocialUserId };
