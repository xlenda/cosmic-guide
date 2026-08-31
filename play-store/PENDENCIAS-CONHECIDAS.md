# Pendencias conhecidas — o que NAO foi fechado, e por que

Estado em 19/08/2026; o item 2 foi reconferido contra o codigo em 31/08/2026.
Nenhuma destas impede publicar na Play Store; todas sao risco aceito, com o
motivo escrito.

## 1. Deep link malicioso pode atrapalhar um login em curso (MEDIO, aberto)

No Android, qualquer app instalado pode disparar `cosmicguide://?code=...`. O app
tenta trocar esse codigo por sessao sem provar que foi ELE quem iniciou o login.
O ataque nao rouba conta — no maximo impede a vitima de logar naquela tentativa.

**Tentamos consertar e REVERTEMOS**: a correcao nao fechava o ataque (o revisor
provou o reataque passo a passo contra o codigo novo) e quebrava um fluxo
legitimo — cancelar o login do Google apagava a marca do link de e-mail
pendente, entao "esqueci minha senha" parava de funcionar sem avisar. Uma
regressao ALTA em troca de um risco MEDIO nao fechado e piora, nao melhora.

**Conserto certo quando for a hora**: usar o parametro `state` do OAuth (e pra
isso que ele existe) em vez de inventar uma marca global no storage. Precisa
conferir antes o que o supabase-js ja faz com `state`.

## 2. Lapide de revogacao nao tem caminho de volta (MEDIO, revisto em 31/08)

Apagar a conta grava o uuid em `revoked_accounts`, e o `requireAuth` passa a
recusar aquele token. Isso e o que faz a exclusao ser exclusao (o access token
sobreviveria ate o `exp`). Mas nao existe rota de des-revogacao: se a lapide for
gravada por engano, a pessoa fica trancada fora da conta.

Na pratica o app so chama essa rota DEPOIS do RPC que apaga a conta no Supabase,
entao quando a lapide e gravada a conta ja morreu.

**O "destrave manual" abaixo NAO devolve a pessoa ao estado anterior — ele so
devolve o acesso.** A lapide e gravada dentro da MESMA transacao que APAGA o
resto (`SubscriptionRepository.forgetAccountData`, linhas 393-430): o vinculo da
assinatura e desfeito, o UGC social sai (perfil, posts, comentarios, curtidas,
follows, bloqueios), `voice_usage_daily` sai, e `cosmic_memories` +
`cosmic_memory_preferences` saem junto. Quando a lapide existe, esse conteudo ja
foi apagado e nao tem volta. Rodar o DELETE abaixo reabre o login de uma conta
esvaziada:

```sql
DELETE FROM revoked_accounts WHERE user_id = '<uuid>';
```

Por isso a severidade subiu de BAIXO para MEDIO: o escopo do que se perde cresceu
com a Comunidade e com a Memoria Cosmica, e o unico remedio documentado conserta
so a metade barata do problema. Nao apresentar esse DELETE como "reverter a
exclusao" para o dono nem em texto visivel ao usuario — a pagina publica ja diz
corretamente que a exclusao "e imediata e nao tem volta".

## 3. Checkout anonimo aceita e-mail de terceiro (MEDIO, pre-existente)

`POST /api/checkout/initiate` e anonimo de proposito — e a rede de seguranca de
quem compra deslogado, que e a maioria. Um conserto grosseiro aqui quebra
receita real. O dano hoje fica em sujeira no banco, e o desempate de assinatura
ja e auditado.

**Melhoria barata mapeada** (nao aplicada): no desempate de
`SubscriptionRepository`, ranquear linha com `linked_by='checkout'` (que nasce
de checkout AUTENTICADO) acima de linha meramente correlacionada por e-mail.

## 4. Webhook do RevenueCat nao existe (BLOQUEADOR DE RECEITA, nao de publicacao)

O app ja sabe comprar pela Google Play, mas quem libera acesso e o
`GET /api/subscription/me`, que so conhece a Hotmart. **A ordem certa e webhook
primeiro, chave do RevenueCat depois** — se a chave for ligada antes, a pessoa
paga, ve "a Play confirmou, falta aparecer na conta" e nunca aparece.

Enquanto `EXPO_PUBLIC_RC_ANDROID_KEY` nao existir, o botao de assinar nao
aparece no Android e o app publica sem risco de reprovacao por pagamento.

## 5. Textos da pagina de exclusao vs. codigo (BAIXO)

O revisor apontou que a pagina publica descreve o mecanismo de revogacao com
mais precisao do que o codigo garante em todas as rotas. O texto visivel esta
correto no essencial (a conta e apagada, as sessoes caem); o excesso de detalhe
tecnico e que envelhece mal. Se for mexer na pagina, simplificar.
