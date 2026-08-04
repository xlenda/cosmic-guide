// O TEXTO DO LEMBRETE DIÁRIO DO CHECK-IN — fonte única da frase que sai no
// Web Push de scripts/enviar-lembrete-checkin.js.
//
// POR QUE MORA AQUI, E NÃO DENTRO DO SCRIPT: o script fala com o banco, com o
// serviço de push do navegador e com a rede — nada disso roda em node:test sem
// mock. O texto é a única parte que PODE ser conferida de graça, e é a única
// parte que tem regra de produto em cima dela. Separado, test/lembreteCheckin
// .test.js morde a frase nos três idiomas sem subir servidor nenhum.
//
// A REGRA DO TEXTO (a mesma do resto do app): a notificação CONVIDA, nunca
// PROMETE. Ela não diz que o dia vai melhorar, não fala de saúde, humor
// clínico, ansiedade, sono, cura ou sorte — só avisa que o check-in de hoje
// ainda não foi respondido. O check-in é a pessoa registrando o próprio
// estado; a notificação é o toque no ombro, não um diagnóstico nem uma
// previsão. Quem tenta "melhorar" essa copy com benefício prometido quebra o
// teste antes de chegar em produção, de propósito.
//
// TRÊS IDIOMAS PORQUE A INSCRIÇÃO GUARDA O IDIOMA: o app manda o `lang` da
// pessoa junto do opt-in (ver migração 014 e DailyReminderRepository), então o
// push sai na língua em que ela lê o app — em vez do português pra todo mundo,
// que era o comportamento dos crons antigos.
const IDIOMAS = ["pt", "es", "en"];
const IDIOMA_PADRAO = "pt";

const LEMBRETE = {
  pt: {
    title: "💛 Seu check-in de hoje te espera",
    body: "Um toque pra registrar como está seu coração hoje.",
  },
  es: {
    title: "💛 Tu check-in de hoy te espera",
    body: "Un toque para registrar cómo está tu corazón hoy.",
  },
  en: {
    title: "💛 Your check-in is waiting for you today",
    body: "One tap to note how your heart is today.",
  },
};

// 'pt-BR', 'PT', 'es-419' e afins viram o idioma base. O que não for
// reconhecido cai no português — o padrão do app (lib/i18n.js,
// DEFAULT_LANGUAGE). Nunca devolve undefined: um push sem texto é pior que um
// push na língua errada.
function normalizarIdioma(lang) {
  if (typeof lang !== "string") return IDIOMA_PADRAO;
  const base = lang.trim().toLowerCase().split(/[-_]/)[0];
  return IDIOMAS.includes(base) ? base : IDIOMA_PADRAO;
}

function textoDoLembrete(lang) {
  return LEMBRETE[normalizarIdioma(lang)];
}

module.exports = { IDIOMAS, IDIOMA_PADRAO, LEMBRETE, normalizarIdioma, textoDoLembrete };
