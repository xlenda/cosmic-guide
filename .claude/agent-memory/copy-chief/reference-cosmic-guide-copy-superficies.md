---
name: reference-cosmic-guide-copy-superficies
description: Onde vive cada texto de conversão do Cosmic Guide (i18n, quiz viral, convite, frase do amor) e qual doc governa o que pode ser dito
metadata:
  type: reference
---

Mapa das superfícies de copy do Cosmic Guide — vale para qualquer revisão futura.

| Superfície | Onde |
|---|---|
| Todo texto do app (PT/ES/EN) | `lib/i18n.js` (~6.5k linhas). Cuidado: há blocos `Object.assign` no fim que **sobrescrevem** chaves definidas no topo (ex.: `planos.unlockTitleSolo` está na 683 e na 5427) |
| Paywall do muro comum (9 leituras) | chaves `onetimelock.*` + `components/OneTimeLock.js` |
| Véu e muro de casal | chaves `gate.*` + `components/FeatureGate.js` |
| Preço/oferta em qualquer muro | `components/OfferSummary.js`, que lê `planos.plan.trial.detail` — fonte única do preço, nunca duplicar |
| Tela de planos | chaves `planos.*` + `screens/PlanosScreen.js` (preços US$5/10/20 ficam no array `PLANS`) |
| Onboarding | chaves `onboarding.*` + `screens/OnboardingChoiceScreen.js` |
| Convite do par (loop viral) | `lib/coupleInvite.js` → `shareInvite()` |
| Frase do Amor e Pensamento do dia | `lib/lovePhrase.js`, `lib/dailyThought.js`, share em `screens/HomeScreen.js` |
| Quiz viral e SEO (site separado) | `C:\tmp\gilfforever\web\app\carta\page.js` e `...\combina\[par]\page.js` |
| Degraus medidos do funil | `lib/funnel.js` (`FUNNEL_EVENTS`) |

**O que pode ser dito:** `docs/tradicao/00-LEIA-PRIMEIRO.md` (regra de ouro) e
`00-tese.md`. Proibições com **teste que aborta o build**: alegação de saúde
(pt aliviar/acalmar/curar/tratar), promessa de resultado, prova social inventada,
data histórica sem obra+autor+século, invenção vendida como milenar.
Tom da casa: convite, espelho, honestidade que vende.
