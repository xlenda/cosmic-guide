# Contexto para agente — Cosmic Guide

> Handoff iniciado em 19/08/2026 e atualizado em 26/08/2026 depois da publicação
> da Community V1, do gatilho 3S **Alinhe seu céu**, dos Lotes B e C do Tarô,
> dos artefatos premium e da voz neural ElevenLabs.
> Leia isto ANTES de tocar em qualquer arquivo. Datas e números abaixo são
> fotografias do momento em que foram medidos, não garantias sobre produção.

---

## 1. O que é o projeto

App de astrologia/autoconhecimento, **Expo SDK 54 / React Native 0.81**, que hoje
roda em produção **como web** (Vercel) e está sendo preparado para a **Google Play
Store** (iOS depois).

| Superfície | Onde |
|---|---|
| App web (produção) | https://cosmicguide.cloud/cosmic-guide/ |
| API própria | https://api.cosmicguide.cloud (Express + SQLite, VPS via pm2) |
| Auth | Supabase (projeto `kroadufkgvymsfzulfzn`, só login — o app **não tem nenhuma tabela lá**) |
| Repo | https://github.com/xlenda/cosmic-guide (branch `master`) |
| Identidade de loja | `cloud.cosmicguide.app` — **imutável** depois do 1º publish |

O dono é o Lenda. Fala português. Prefere solução simples que funciona a
over-engineering, e quer sempre saber o que sobrou pendente.

---

## 2. Estado registrado (remeça antes de afirmar)

Baseline de **19/08/2026** (histórico, não reutilize como status atual):

- **Testes naquele commit:** 1567/1567 verdes (`npm test`)
- **Produção naquele dia:** app 200 · API 200 · rotas de moderação 200 · página de exclusão 200
- **Git naquele dia:** limpo, tudo em `origin/master`
- **Projeto Android naquele dia:** `npx expo prebuild --platform android` sem aviso
- **Deploy daquele baseline:** backend e web publicados; migrações 016 e 017 aplicadas

O snapshot medido mais recente é:

- Lote C, artefatos premium, política pública e voz neural no commit `af6afc2`;
- backend publicado primeiro, release `20260826-160253`, schema 21 e
  `quick_check = ok`;
- web `READY` no deploy `dpl_ARZF1HNxYAtZUjMg7oxtQDevCo75`, com alias
  `https://cosmicguide.cloud`;
- **1805/1805 testes do app** e 306 testes do backend, com 305 aprovados,
  zero falhas e 1 teste documental ignorado;
- Expo Doctor **18/18**, exports web/Android, dez cenários E2E e regressão oficial
  aprovados;
- probes externos: raiz/app/Explorar/Privacidade `200`, health `200`, voz
  disponível em `pt,es,en`, síntese sem sessão `401`, Comunidade sem sessão
  `401`, moderação inválida `400` e painel admin sem credencial `401`;
- canário real da ElevenLabs gerou MP3 válido nas três línguas; a chave existe
  somente no `.env` da VPS, agora com permissão `600`;
- produção limpa em 390 × 844: onboarding do Órbi, Home e Explorar abriram sem
  overflow horizontal e sem erro JavaScript; `/cosmic-guide/explorar` permaneceu
  canônico;
- escopo aprovado concluído sem vídeo premium, DMs, match ou cobrança nova.

Ainda assim, remeça antes de afirmar: confira `git status`, rode a suíte e os
exports e, se for publicar, use os scripts oficiais na ordem backend → web e
confirme com probes reais.

### Contrato da Fase 3 — Órbi

- **Órbi é IA da Anthropic e isso aparece antes da primeira pergunta.** Não é
  pessoa, consultor, médium nem mecanismo de previsão.
- A chamada envia a pergunta e o histórico da conversa atual. Como contexto de
  perfil, só existe um pacote estrito com **signo + tema + situação + objetivo**;
  ele só é enviado quando os quatro campos explícitos estão completos. O
  servidor rejeita campo extra e o **Diário nunca entra nesse pacote**.
- Conversas trazidas de versões anteriores ficam legíveis como histórico
  importado local. Elas não são reenviadas à Anthropic e não são atribuídas a
  Órbi.
- **Voz neural foi entregue depois da Fase 3**, em 26/08/2026, pela ElevenLabs.
  Ela exige conta com e-mail confirmado, usa voz escolhida no servidor, cota
  pessoal e global, MP3 privado sem cache HTTP e cache físico de no máximo 24h.
  Não existe fallback para a voz robótica do navegador/aparelho.
- No Tarô, a entrada compacta de Órbi e os 15 caminhos são conteúdo editorial
  local e determinístico. Não os apresente como resposta da Anthropic. O chat é
  a superfície que realmente chama a IA.
- A **Community V1 foi publicada depois em um escopo próprio**. Não a atribua à
  Fase 3 original; consulte `MEMORIA-PROXIMA-SESSAO.md` para o contrato social,
  as limitações e o estado real.
- Fontes de verdade: `screens/ChatScreen.js`, `lib/orbiConversation.js`,
  `server-patches/src/application/chatContext.js` e
  `server-patches/src/infrastructure/AnthropicChatProvider.js`.

---

## 3. Regras duras — quebrar qualquer uma destas já causou incidente real

### Deploy só por script, e o backend SEMPRE antes da web

```bash
bash server-patches/deploy.sh          # 1º — faz backup do banco E do código
bash scripts/deploy-vercel.sh          # 2º — tem portão que aborta se o 1º não foi
```

`vercel deploy` na raiz **derrubou a produção em 03/08**. O app vive em
`/cosmic-guide/` e as telas são chunks lazy — deploy fora do script quebra tudo.

### `server-patches/` é a fonte da verdade do backend

`C:\tmp\gilfforever\backend` está **obsoleto**. Sincronizar de lá derrubou
`/api/cities` em produção (01/08). O que roda na VPS é `/root/forja-backend`, e
`server-patches/` é o espelho versionado dele.

### Todo texto visível existe nas 3 línguas (pt/es/en)

`test/i18nKeysExist.test.js` trava o deploy se faltar chave. Texto cravado no JSX
**não** é pego por esse portão — procure ativamente. O dono tem uma regra: app
metade traduzido quebra a confiança.

### O app NUNCA promete o que o código não faz

Esta é a falha recorrente do projeto — apareceu 4 vezes em uma semana:
- a tela de Privacidade afirmava "nada é enviado para nenhum servidor" (falso)
- o botão de exclusão dizia que apagava a conta (só limpava o aparelho)
- "Desfazer" no bloqueio não desfazia o que prometia
- `report.body` dizia "nada do que você escreveu é enviado" depois que a denúncia
  passou a enviar o conteúdo

Texto que promete a mais é defeito **grave**, no mesmo nível de um crash. Se você
mudar comportamento, varra os textos (app, `lib/i18n.js`,
`public/excluir-conta.html`) atrás do que ficou mentindo.
`test/privacidadeNaoPromete.test.js` trava parte disso.

### Nunca mexer nos outros processos do servidor

A VPS roda 7 outros processos de **outros negócios**. Só `forja-backend` é do
Cosmic Guide. Espiritualidade só neste projeto.

---

## 4. Armadilhas técnicas já descobertas (não redescubra)

### Web → nativo

- **`window`/`document`/`localStorage`/`navigator`/canvas não existem em nativo.**
  O app só tinha rodado como web, então essa dívida estava inteira escondida.
- **`getLocales()` do `expo-localization`** substituiu `navigator.language`
  (`context/LanguageContext.js`) — e está dentro de `try/catch` de propósito: se o
  módulo nativo falhar no 1º frame, o app **não pode ficar preso no splash**.
- **`openAuthSessionAsync` do expo-web-browser NÃO usa ASWebAuthenticationSession
  no Android** (`Platform.OS !== 'android'` na fonte). Isso fazia dois ouvintes de
  deep link competirem pelo mesmo código PKCE de uso único — o login com Google
  **nunca concluía** no Android. Corrigido com um Map de promessas em
  `lib/supabaseClient.js`.
- **`require()` tardio NÃO impede o Metro de empacotar** (ele resolve require
  estaticamente). Para tirar um SDK do bundle web use extensão de plataforma:
  `lib/purchases.web.js` (stub inerte) + `lib/purchases.js` (nativo). Isso levou o
  chunk do paywall de **950 KB para 13,8 KB**. Prove com
  `npx expo export --platform web` + grep no `dist/`.

### `expo prebuild` valida o que ler o `app.json` nunca mostra

Rode `npx expo prebuild --platform android --no-install`, confira o
**AndroidManifest gerado**, e depois `rm -rf android/` (a pasta é gerada; `android/`
e `ios/` estão no `.gitignore` e o EAS regera no servidor). Foi assim que
apareceram: `userInterfaceStyle` mentindo, `versionCode` ausente, e permissões
entrando pelos plugins.

### Layout (custou o funil inteiro em 09/08)

- `cardStyle` de Stack.Navigator **precisa** de `flex: 1` junto do
  `backgroundColor`, senão vira altura de conteúdo e mata o scroll.
- Decoração com `width > 100%` precisa de `overflow: hidden` no container, senão
  o navegador mobile dá **zoom out na página inteira**.
- Pai com `height` fixa + `alignItems: 'center'` faz o filho medir pelo CONTEÚDO —
  o filho rolável precisa de `height` própria ou `flex: 1` + `minHeight: 0`.
- **Teste sempre em contexto LIMPO (sem storage).** O dono nunca vê o bug do funil
  porque já tem perfil salvo — o caminho do usuário novo é o único que 100% dos
  leads percorre.

### Testes que mentem

Dois padrões pegos por revisão adversarial nesta preparação:
1. **Número de teste falso** — agente roda a suíte antes de terminar de editar, ou
   sem o `--require ./test/setup.js` do projeto.
2. **Teste que passa pelo motivo errado** — um mock que simulava a ordem
   **inversa** da realidade, e um `assert.match(arquivo, /regex/)` no TEXTO do
   código em vez do comportamento.

Regra: **prove por MUTAÇÃO** — quebre a lógica de propósito, confirme que o teste
fica vermelho, restaure.

### Escrever arquivo

- Nunca `open(w)` direto: escreva em temporário e mova (zerou o `painel.html` uma vez).
- `.bat` precisa de CRLF — em LF o cmd falha **em silêncio** reportando sucesso.
- Heredoc de bash com `\n` dentro de string JS vira quebra de linha real → erro de
  sintaxe em produção. E **crase dentro de heredoc não-quotado o bash executa**.

---

## 5. O que foi feito na preparação para a Play Store

Auditoria de 37 achados, 12 confirmados por verificação adversarial, corrigidos em
3 rodadas + 2 auditorias de segurança. Commits `16c788d` → `83d156c`.

**Os 5 bloqueadores de política** (nenhum era bug de código):

| # | O quê |
|---|---|
| 1 | **Exclusão de conta de verdade** — função SQL `delete_own_account()` no Supabase (SECURITY DEFINER, `search_path=''`, sem parâmetro) + rota `DELETE /api/subscription/account` + fluxo de duplo passo no app + `public/excluir-conta.html`. Antes só limpava o aparelho e mandava escrever pra um e-mail que **não recebe**. |
| 2 | **Pagamento pela loja** — RevenueCat atrás de gate de configuração. Sem `EXPO_PUBLIC_RC_ANDROID_KEY`, o botão de assinar **não aparece** no Android. Checkout externo = rejeição certa. |
| 3 | **UGC com denúncia e bloqueio** — `POST /api/moderation/report` e `/block`, filtro no servidor, fila no painel admin. |
| 4 | **Denúncia de conteúdo de IA** — `components/ReportarIA.js` no rodapé dos resultados. |
| 5 | **Data Safety batendo com o código** — telas de Privacidade e FAQ reescritas para serem verdadeiras. |

**Segurança:**
- **XSS armazenado no painel admin** (crítico, pré-existente): o campo `plano`
  chegava por `POST /api/track` — rota **pública, sem login** — e ia cru pro
  `innerHTML`. Escapado. Havia um 2º ponto na tabela de assinaturas.
- **Reset infinito da cota de IA** (introduzido pelos próprios agentes): o DELETE de
  exclusão apagava `ai_free_quota`, mas a rota não pode provar que a conta morreu —
  um curl com o próprio token devolvia as leituras grátis em loop. A cota deixou de
  ser apagada.
- **Revogação de token** (migração 017 + `revoked_accounts`): sem isso o access
  token sobrevivia até o `exp` mesmo com a conta apagada, e um `GET /me` **regravava
  o e-mail no banco** — a exclusão se desfazia sozinha.

---

## 6. O que está ABERTO de propósito

Detalhe completo em **`play-store/PENDENCIAS-CONHECIDAS.md`**. Resumo:

1. **Webhook do RevenueCat não existe** — bloqueador de receita, não de publicação.
   Quem libera acesso é `GET /api/subscription/me`, que só conhece Hotmart.
   **Ordem certa: webhook primeiro, chave depois.** Se a chave for ligada antes, a
   pessoa paga e nunca recebe acesso.
2. **Deep link malicioso pode atrapalhar um login em curso** (médio). Tentamos
   corrigir e **revertemos** — o conserto não fechava o ataque e quebrava o
   "esqueci minha senha" em silêncio. O conserto certo é usar o parâmetro `state`
   do OAuth; confira antes o que o supabase-js já faz com `state`.
3. **Lápide de revogação não tem des-revogação.** Destrave manual:
   `DELETE FROM revoked_accounts WHERE user_id = '<uuid>';`
4. **Checkout anônimo aceita e-mail de terceiro** (pré-existente). Conserto
   grosseiro aqui **quebra receita real** — a rota é anônima de propósito.

---

## 7. Só o dono pode fazer

1. **Recarregar os créditos da Anthropic.** Os logs do release
   `20260826-160253` devolveram `credit balance is too low`. Remeça antes de
   repetir no futuro, mas hoje o chat do Órbi pode falhar. O backend retorna erro
   explícito; não documente um fallback genérico como resposta real da IA.
2. **Conta no Play Console** (US$ 25). Ele tem CNPJ + D‑U‑N‑S → abrir como
   **organização** dispensa os 12 testadores por 14 dias.
3. **Supabase → Authentication → URL Configuration → Redirect URLs → `cosmicguide://`**
   Sem isso o login com Google não volta pro app no Android, por mais correto que o
   código esteja. (O conector Supabase alcança o banco, **não** essa configuração.)
4. **`npx eas login` && `npx eas init`** — grava `extra.eas.projectId` no `app.json`.
5. **Caixa e DNS do domínio** — `contato@cosmicguide.cloud` **não recebe**. A
   consulta atual não encontrou MX/TXT. Configurar caixa, MX, SPF, DKIM e DMARC e
   provar envio/recebimento antes de declarar recursos por e-mail operacionais.
6. **Moderação humana contínua** — revisar o painel em dois turnos por dia e
   registrar decisões/recursos conforme `docs/OPERACAO-MODERACAO.md`. O código
   fornece fila e controles; não substitui a pessoa responsável.

---

## 8. Comandos

```bash
npm test                                     # rode a suíte inteira e registre o total real
npx expo export --platform web               # valida o bundle web
npx expo prebuild --platform android --no-install   # valida config nativa; rm -rf android depois

bash server-patches/deploy.sh                # backend — SEMPRE primeiro
bash scripts/deploy-vercel.sh                # web

cd play-store/assets && node loja-shots.js   # regera screenshots da loja
```

`loja-shots.js` **semeia data e hora de nascimento** (`gff-birth-a`/`-b` e os
espelhos), não só o perfil do casal — sem isso as telas saem no estado vazio e a
screenshot não vende nada.

---

## 9. Mapa dos arquivos que importam

| Arquivo | Por quê |
|---|---|
| `lib/i18n.js` | 3 dicionários. Chaves novas entram no bloco do fim. Um agente por vez. |
| `App.js` + `routes.js` | Abas, stacks, chunks lazy e rotas canônicas; a base web `/cosmic-guide` é explícita. |
| `screens/HomeScreen.js` | Home curta: caminho do dia, 3S, porta de Explorar e conteúdo atual. |
| `screens/ExploreScreen.js` | Catálogo permanente virtualizado, com todos os destinos reais. |
| `screens/SkyAlignmentScreen.js` | Estados honestos, palco e Recibo Cósmico do 3S. |
| `components/SkyAlignmentStage.js` | Discos, gesto, encaixe, haptics e fallback acessível. |
| `lib/skyAlignment.js` + `lib/personalSky.js` | Efemérides, encontro/recibo e dados natais validados. |
| `hooks/useReducedMotion.js` | Movimento reduzido no web e no nativo. |
| `test/skyAlignment*.test.js` + `tests/e2e/sky-alignment.spec.js` | Contrato do motor, tela, gesto e deep link frio. |
| `scripts/e2e-regression.js` | Portão oficial que bloqueia regressões críticas antes do deploy web. |
| `screens/TarotScreen.js` | Ritual do Lote B: guia, signo real, duas estruturas, raspagem sequencial, síntese e Comunidade. |
| `components/ScratchRevealCard.js` + `lib/scratchReveal.js` | Gesto premium, gate de área, fallback acessível, haptics e movimento reduzido. |
| `screens/TarotAlbumScreen.js` + `lib/tarotAlbum2.js` | Álbum 2.0, encontros, favoritos, repetição, orientação, busca, filtros e Espelho. |
| `lib/cosmicMirror.js` | Espelho calculado somente a partir de tiragens reais do Diário. |
| `components/PremiumCosmicCard.js` + `lib/cosmicShareCard*` | PNG 1080 × 1920 para Tarô, Espelho e Alinhamento, sem campos privados. |
| `components/BotaoOuvir.js` + `lib/voiceClient.js` + `lib/useVoicePlayback.*` | Cliente neural, cancelamento e reprodução web/nativa sem TTS do sistema. |
| `lib/tarotRitualGuide.js` | Cinco temas, 15 focos, 12 signos e duas estruturas em PT/ES/EN. |
| `lib/tarotMajorThemeLenses.js` + `lib/tarotMinorThemeLenses.js` | Acesso às 1170 lentes carta × tema × idioma. |
| `lib/tarotPendingReading.js` + `lib/tarotDrawCommit.js` | Snapshot durável e consumo transacional de Leitura Bônus. |
| `screens/ChatScreen.js` + `lib/orbiConversation.js` | Órbi, histórico local/importado e montagem do contexto explícito |
| `lib/supabaseClient.js` | Login, deep link, o Map de promessas do PKCE |
| `lib/purchases.js` + `.web.js` | Compra na loja, atrás do gate. Extensão de plataforma. |
| `lib/accountSubscription.js` | Quem tem acesso. Trata `token_malformed` e `account_deleted`. |
| `screens/ProfileScreen.js` | Exclusão de conta (RPC → backend → local, nessa ordem) |
| `server-patches/src/http/socialAuth.js` | `requireAuth` — JWKS + lápide de revogação |
| `server-patches/src/http/moderationRoutes.js` | Denúncia e bloqueio com identidade canônica. |
| `server-patches/src/http/adminRoutes.js` + `painelRoutes.js` | Suspensão, reversão, histórico e painel fail-closed. |
| `server-patches/src/infrastructure/SocialModerationCleanup.js` | Limpeza transacional de UGC. |
| `server-patches/src/infrastructure/migrations/020_add_moderation_actions.sql` | Histórico append-only de moderação. |
| `server-patches/src/http/voiceRoutes.js` + `VoiceSynthesisService.js` | Status e síntese neural autenticada, validação, cota e erros estáveis. |
| `server-patches/src/infrastructure/ElevenLabsVoiceProvider.js` | Chamada ElevenLabs; chave e IDs nunca chegam ao cliente. |
| `server-patches/src/infrastructure/VoiceAudioCache.js` + `VoiceQuota.js` | Cache temporário, deduplicação e limites pessoal/global. |
| `server-patches/src/infrastructure/migrations/021_add_voice_usage.sql` | Contagem diária de voz; apagada junto com a conta. |
| `public/privacidade.html` | Política pública estática em PT/ES/EN, acessível sem JS ou login. |
| `docs/OPERACAO-MODERACAO.md` | Procedimento humano obrigatório em dois turnos diários. |
| `server-patches/src/application/chatContext.js` | Allowlist do contexto enviado ao Órbi; nunca ampliar sem alinhar privacidade e testes |
| `server-patches/src/infrastructure/AnthropicChatProvider.js` | Prompt e chamada Anthropic; identidade atual da conversa é Órbi |
| `server-patches/supabase/001_delete_own_account.sql` | Já aplicado no Supabase |
| `play-store/ficha-da-loja.md` | Textos prontos para o Play Console |
| `play-store/assets/COMO-USAR.md` | Onde vai cada imagem |

---

## 10. Como trabalhar aqui

- **Meça, não presuma.** Toda afirmação sobre produção vem de `curl`; sobre bundle,
  de grep no `dist/`; sobre permissão, do manifesto gerado.
- **Verificação adversarial vale mais que rodada nova.** Quando o revisor começa a
  achar bug *dentro* do conserto anterior, o certo é **reverter e documentar** —
  empilhar conserto sobre conserto passa a piorar.
- **Relatório vazio de agente que caiu não é "nada encontrado".** Confira
  `agents_done`/`agents_error` antes de interpretar.
- **Diga o que sobrou.** O dono sempre pergunta, e prefere a lista honesta.

---

## 11. Próxima sessão

O estado consolidado para retomar depois de **26/08/2026** está em
[`MEMORIA-PROXIMA-SESSAO.md`](./MEMORIA-PROXIMA-SESSAO.md). Community V1, 3S,
Lotes B/C, cartões premium e voz ElevenLabs estão **PUBLICADOS**. O snapshot é
`af6afc2`, backend `20260826-160253`, schema 21, web
`dpl_ARZF1HNxYAtZUjMg7oxtQDevCo75` e **1805/1805 testes do app**.

Não há outro lote de código autorizado pendente nesta entrega. Antes de anunciar
a voz nativa como validada em aparelho, fazer uma escuta real no Android. Manter
dois turnos diários de moderação. Créditos da Anthropic e a caixa
`contato@cosmicguide.cloud` seguem como ações externas do dono; o log do release
de 26/08 ainda mostrou saldo Anthropic insuficiente.
