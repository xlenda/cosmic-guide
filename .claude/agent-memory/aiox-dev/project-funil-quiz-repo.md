---
name: project-funil-quiz-repo
description: O funil viral (quiz.cosmicguide.cloud) vive em C:\tmp\gilfforever\web e está VIVO — só o backend/ daquele repo é que é obsoleto
metadata:
  type: project
---

O funil de aquisição do Cosmic Guide é um projeto Next.js separado do app:
`C:\tmp\gilfforever\web` (rotas `app/carta` = quiz viral, `app/combina` = SEO,
`app/(funil)` e `app/(app)` = versão ES "Forja del Amor"). Ele é **atual** e
recebe features novas.

**Why:** existe uma memória correta de que `C:\tmp\gilfforever\backend` está
obsoleto (o backend de verdade é `server-patches/` do app) — o risco é
generalizar isso pro repo inteiro e achar que `gilfforever/web` também está
morto. Não está: em 04/08/2026 o quiz `/carta` ganhou o card compartilhável ali.

**How to apply:** trabalho de funil/quiz/SEO → `gilfforever/web`. Trabalho de
app (telas do produto, RevenueCat, i18n) → `Downloads\Cosmic Guide`. Backend →
`Downloads\Cosmic Guide\server-patches`. O build do funil é `output: "export"`
com `basePath: "/oraculo"` fora da Vercel, e `.next/` e `out/` são
gitignored — rodar `npx next build` ali não suja o repo.

Ver [[feedback-backend-cosmic-guide-fonte-da-verdade]] e
[[feedback-deploy-cosmic-guide-usa-script]].
