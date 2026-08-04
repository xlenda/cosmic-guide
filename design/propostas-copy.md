# Propostas de copy — Cosmic Guide (menu para aprovação)

> **04/08/2026 · Copy Chief.** Nada aqui foi implementado. É menu: o dono marca o que
> entra, e só depois disso o PT aprovado vai para ES/EN.
> Todas as propostas foram conferidas contra o código (chave existe, fato é
> verdadeiro) e contra a regra da casa (00-tese / 00-LEIA-PRIMEIRO).

---

## Tier 0 — diagnóstico (antes de qualquer linha)

**Consciência (Schwartz), por superfície — o app tem quatro públicos diferentes:**

| Superfície | Nível | O que a copy precisa fazer |
|---|---|---|
| Quiz `/carta` | Inconsciente do produto | Ponte da diversão → produto, matando o custo |
| SEO `/combina` | Consciente do problema | Entregar a resposta e mostrar o buraco que sobra |
| Onboarding | Consciente do produto | Nomear o próximo passo, não fazer pergunta administrativa |
| Paywalls (OneTimeLock, véu, Planos) | **Mais consciente** | Oferta inteira + reversão de risco no ponto da interrupção |

**Sofisticação de mercado: estágio 4–5.** Astrolink, Personare, Co-Star e Chaturanga
já disseram "leitura personalizada", "seu mapa completo" e "sem limite". Promessa
não move mais nada aqui. O que move é **mecanismo** (Todd Brown) — e o Cosmic Guide
tem um mecanismo real, verificável e impossível de copiar sem refazer o trabalho:
*fonte primária, com obra, autor e século; quando a tradição e a internet discordam,
mostramos a fonte.*

**O achado central da auditoria:** esse mecanismo aparece **uma vez em todo o funil** —
`planos.benefit.solo.8`, oitava linha, de uma só das duas listas de planos. Ele está
ausente do onboarding, dos três paywalls de casal, do OneTimeLock (o muro mais comum
do app), do quiz viral e das mensagens de compartilhamento. O produto vende feature
onde poderia vender a única coisa que o concorrente não consegue igualar.

**Conversa mental no muro (Collier):** *"Vou pagar por um app de astrologia? Tenho o
Co-Star de graça."* Nenhuma linha do paywall hoje responde a essa frase.

**Auditoria Hopkins do copy atual (amostra dos 12 pontos de conversão): 68/100.**
Pontos fortes: honestidade, preço visível no muro, nota legal clara, oferta única.
Pontos fracos: benefício genérico ("recursos", "experiência completa"), CTA que pede
o compromisso maior em vez do próximo passo, e um fato de oferta contado errado
(o par convidado entra de graça, e a copy diz que ele assina).

**Prioridade das 15:** 1–4 são o muro por onde passam as nove leituras individuais.
5–9 são a tela onde o cartão é digitado. 10–11 é a tela de maior tráfego medido
(118 sessões chegam, 22 concluem). 12–15 são os laços virais e o tráfego frio.

---

## As 15 propostas

### 1. O muro abre com débito, não com presente
- **Onde:** `lib/i18n.js` → `onetimelock.freeUsed.title`
- **Hoje:** "Você já usou sua leitura gratuita de {feature}"
- **Proposta:** "{feature}: a primeira foi por conta da casa"
- **Por que converte:** Halbert — nunca abrir a venda numa contabilidade negativa; o mesmo fato vira presente já entregue e reencontra a promessa do onboarding ("a primeira de cada, grátis"), que foi o que trouxe a pessoa até aqui.
- **Doutrina:** OK (fato, sem promessa)

### 2. O muro diz "recursos" onde poderia dizer o mecanismo
- **Onde:** `lib/i18n.js` → `onetimelock.freeUsed.text.solo` (+ `.couple`)
- **Hoje (solo):** "Assine o Cosmic Guide e continue usando esse e todos os outros recursos individuais sem limite."
- **Proposta (solo):** "Da segunda em diante é com assinatura: as nove leituras individuais sem limite — e cada afirmação com a fonte de onde veio, obra, autor e século."
- **Proposta (casal):** "Da segunda em diante é com assinatura: as nove leituras individuais, mais as telas de vocês dois, sem limite — e cada afirmação com a fonte de onde veio."
- **Por que converte:** Todd Brown — no estágio 5 de sofisticação, quem não mostra mecanismo é comparado só por preço com o app grátis que a pessoa já tem no celular.
- **Doutrina:** OK ("nove leituras" = os 9 OneTimeLock do código; a frase da fonte é a própria doutrina)

### 3. O CTA pede o compromisso grande num momento de medo de preço
- **Onde:** `lib/i18n.js` → `onetimelock.cta.subscribe`
- **Hoje:** "Assinar agora"
- **Proposta:** "Começar meus 7 dias grátis →"
- **Por que converte:** Kennedy — venda o próximo degrau, não a escada inteira; e o rótulo passa a ser o mesmo de `planos.cta.trial`, então o botão "sobrevive" na tela seguinte em vez de a pessoa achar que mudou de assunto.
- **Doutrina:** OK · **Atenção:** o toque leva à escolha de plano, não ao checkout. Se o dono quiser precisão literal, a variante é "Ver meus 7 dias grátis →".

### 4. A copy conta errado o melhor fato da oferta
- **Onde:** `lib/i18n.js` → `onetimelock.invite`
- **Hoje:** "ou convide seu par pra assinarem juntos →"
- **Proposta:** "ou convide seu par — sua assinatura vale pros dois →"
- **Por que converte:** Hopkins — a oferta real (uma conta, duas pessoas) estava sendo apresentada como duas contas; corrigir não é polir texto, é dobrar o valor percebido pelo mesmo preço.
- **Doutrina:** OK e **necessário** — a regra de 29/07 já está no código (`combineAccessResults` em `lib/coupleData.js` + `&acesso=` em `lib/coupleInvite.js`), e a linha atual contradiz o produto.

### 5. O véu vende a transação em vez do que está embaixo dele
- **Onde:** `lib/i18n.js` → `gate.teaser.title` e `gate.teaser.cta`
- **Hoje:** "Continue com a assinatura" / "Assinar →"
- **Proposta:** "O resto desta tela está logo aí embaixo" / "Ver o resto — 7 dias grátis →"
- **Por que converte:** Collier — entrar na conversa que já está na cabeça da pessoa; o véu foi desenhado justamente para criar a pergunta "o que tem embaixo?", e o texto respondia falando de contrato.
- **Doutrina:** OK

### 6. O muro do solo começa dizendo "isso não é pra você"
- **Onde:** `lib/i18n.js` → `gate.solo.title` e `gate.solo.text`
- **Hoje:** "Isso é pra fazer em casal" / "Rotas de reconexão, jogos, ideias de encontro e retrospectiva só fazem sentido com os dois."
- **Proposta:** "Esta tela precisa de vocês dois" / "Rotas de reconexão, jogos, ideias de encontro e retrospectiva se abrem quando o par entra. Você preenche o quiz, manda o link — e ele entra pela sua assinatura, sem pagar de novo."
- **Por que converte:** Halbert — rejeição no pico do interesse mata a venda; o mesmo fato vira convite com dois passos concretos, e a nota honesta que já existe abaixo deixa de ser a única a dar a boa notícia.
- **Doutrina:** OK

### 7. A headline de casal é vapor; a de solo já foi consertada
- **Onde:** `lib/i18n.js` → `planos.unlockTitle`
- **Hoje:** "Desbloqueie a experiência completa do casal"
- **Proposta:** "Tudo do app pros dois — com uma assinatura só"
- **Por que converte:** Hopkins — afirmação checável derrota adjetivo; e ela carrega a vantagem real da oferta (um pagamento, duas pessoas), que hoje não aparece em nenhuma headline do funil.
- **Doutrina:** OK (verificado no código)

### 8. A lista de casal empilha feature e esconde a razão para acreditar
- **Onde:** `lib/i18n.js` → `planos.benefit.1..7` + nova `planos.benefit.8` (e `COUPLE_BENEFIT_KEYS` em `screens/PlanosScreen.js`, 1 linha)
- **Hoje:** bullet 1 = trial; bullet 2 = nove leituras amontoadas numa vírgula só; 3–7 = telas de casal; nenhuma razão para acreditar.
- **Proposta:** aplicar ao casal o mesmo tratamento já aprovado no solo — desmontar o bullet 2 nas linhas por desejo (`planos.benefit.solo.2..7`) e fechar a lista com: "Escrito a partir de fonte primária: quando a tradição e a internet discordam, a gente mostra a fonte — obra, autor e século."
- **Por que converte:** Bencivenga — nove itens separados por vírgula o olho lê como uma linha, não como nove; e nenhuma lista de features fecha venda sem uma razão para acreditar no fim.
- **Doutrina:** OK (é a doutrina virada em bullet)

### 9. O plano de maior LTV mostra opinião onde o irmão mostra aritmética
- **Onde:** `lib/i18n.js` → `planos.plan.annual.badge`
- **Hoje:** "Melhor oferta" (o trimestral, mais barato, mostra "Economize 33%")
- **Proposta:** "Economize 67%"
- **Por que converte:** Hopkins — número específico vence elogio próprio; US$5×12 = US$60 contra US$20 é 67%, e o selo mais fraco está justamente no plano que a casa mais quer vender.
- **Doutrina:** OK (é porcentagem de preço, não de vida/sorte/saúde — a regra proibida não é essa)

### 10. Na tela de maior tráfego, uma porta está mobiliada e a outra está vazia
- **Onde:** `lib/i18n.js` → `onboarding.couple.desc`
- **Hoje:** "Descubram juntos a energia e a compatibilidade de vocês." (contra a descrição rica e concreta do card solo, ao lado)
- **Proposta:** "A compatibilidade de vocês pela distância real entre os signos, a frase do dia pra mandar pro seu amor e as rotas pra reconectar. Uma assinatura vale pros dois."
- **Por que converte:** Ogilvy — concreto derrota abstrato quando as duas opções estão lado a lado; hoje a escolha "casal" pede fé e a "solo" mostra o cardápio, e a medição da própria tela (118 chegam, 22 concluem) diz que a decisão é onde se perde gente.
- **Doutrina:** OK · **Atenção:** não incluir "a primeira de cada é sua" nesse card — as 5 telas de casal hoje usam véu, não uso grátis (`components/FeatureGate.js`).

### 11. O botão do onboarding descreve processo, não destino
- **Onde:** `lib/i18n.js` → `onboarding.cta` (hoje é a **mesma chave** nos dois cards, ver `screens/OnboardingChoiceScreen.js:89,105`)
- **Hoje:** "Começar"
- **Proposta:** dividir em duas chaves — solo: "Escolher meu signo →" · casal: "Montar o nosso mapa →"
- **Por que converte:** Hopkins — dizer exatamente o que acontece no toque; o caminho solo cai num grid de 12 signos que hoje aparece sem aviso (o comentário do código diz que é ali que a pessoa some), e nomear o passo antes remove a surpresa.
- **Doutrina:** OK · **Atenção:** exige 2 chaves novas em vez de 1.

### 12. O convite viaja sozinho e não diz que o acesso vai dentro dele
- **Onde:** `lib/coupleInvite.js` → `shareInvite()`
- **Hoje:** "{amor}, criei nosso espaço no Cosmic Guide — nosso guia cósmico de casal. Abre aqui: {url}"
- **Proposta (quem já assina):** "{amor}, fiz o nosso mapa no Cosmic Guide — dá pra ver o que combina e o que atrita entre a gente. Seu acesso já vai neste link, é só abrir: {url}"
- **Proposta (quem ainda não assina):** "{amor}, fiz o nosso mapa no Cosmic Guide — dá pra ver o que combina e o que atrita entre a gente. Abre aqui: {url}"
- **Por que converte:** Halbert — a mensagem chega sem vendedor junto, então ela precisa carregar sozinha a curiosidade ("a gente") e a remoção do custo; "criei nosso espaço" não é nem uma coisa nem outra.
- **Doutrina:** OK · **Atenção:** as duas variantes são obrigatórias — o `accessCode` só entra na URL de quem tem assinatura (`buildInviteUrl`), então a frase do acesso seria falsa para os outros.

### 13. A Frase do Amor manda um link pelado
- **Onde:** `screens/HomeScreen.js` → `handleShareLovePhrase` · `lib/i18n.js` → `home.lovePhrase.share`
- **Hoje:** mensagem "{frase}\n\n💜 https://cosmicguide.cloud" · botão "Compartilhar"
- **Proposta:** mensagem "{frase}\n\n💜 Frase de hoje no Cosmic Guide — amanhã tem outra: https://cosmicguide.cloud" · botão "Mandar pro meu amor →" (casal) / "Mandar pra alguém →" (solo)
- **Por que converte:** Collier — todo link precisa de uma promessa colada nele, senão quem recebe lê a frase e ignora a URL; "amanhã tem outra" é o motivo de retorno e é literalmente verdade (frase determinística por data, `lib/lovePhrase.js`).
- **Doutrina:** OK

### 14. O quiz joga fora exatamente o que faz alguém compartilhar
- **Onde:** `C:\tmp\gilfforever\web\app\carta\page.js` → `compartilhar()`
- **Hoje:** "Eu sou {nome}! Descubra a sua: {URL}"
- **Proposta:** "Deu {nome} pra mim — e o lado sombra doeu. Faz o seu e me diz qual deu: {URL}"
- **Por que converte:** o comentário da própria página está certo ("elogio puro não se compartilha, verdade engraçada sim") e o texto compartilhado é o único lugar onde a sombra não aparece; a pergunta de volta ("me diz qual deu") transforma um envio em conversa, que é o segundo envio.
- **Doutrina:** OK

### 15. A ponte do tráfego frio não mata o custo nem mostra o mecanismo
- **Onde:** `C:\tmp\gilfforever\web\app\carta\page.js` → card `card-accent` final (sub + botão)
- **Hoje:** "Sol, Lua, Ascendente e as suas cartas — a leitura completa, no seu ritmo." / botão "Fazer minha leitura completa no Cosmic Guide →"
- **Proposta:** manter "Uma carta é um retrato. O Cosmic Guide é o álbum." e trocar o resto por: "Sol, Lua, Ascendente e as 78 cartas — **a primeira leitura de cada uma é grátis, sem cartão**." + segunda linha: "E cada afirmação vem com a fonte: o tarô de adivinhação nasceu em 1781, com Court de Gébelin (*Le Monde primitif*) — não no Egito." / botão "Ver minha primeira leitura grátis →"
- **Por que converte:** Schwartz — esse tráfego é inconsciente do produto, então a ponte tem que resolver custo e preferência na mesma respiração; e o gancho de 1781 é o mesmo que o dono já validou como gatilho de encantamento no reel.
- **Doutrina:** OK (data com obra, autor e ano — é a regra sendo cumprida, não arriscada)

---

## Ficou de fora do menu (mas o dono precisa saber)

1. **Erro de digitação na frase-padrão-ouro da casa.** `tarot.subtitle` (PT) diz
   *"Tarô que não **dourá** a pílula"* — a forma correta é *"doura"*. ES e EN estão certos.
   É a linha que define o tom do produto, com typo, na tela do Tarô.

2. **A porcentagem da página de SEO briga com a tese do app.** `/combina/[par]` estampa
   "64% de afinidade" em 64px, e `docs/tradicao/02` §3.1 diz que porcentagem de
   compatibilidade **não existe em nenhuma fonte** — é convenção de mídia do séc. XX.
   Hoje o número aparece sem etiqueta. Sugestão (decisão do dono, porque é o número que
   traz a busca): manter o número e colocar **uma linha embaixo** —
   *"De onde vem esse número: é convenção de mercado, não tradição. Ptolomeu (Tetrabiblos
   IV.5 e IV.7) compara lugares, não porcentagens. Aqui ele é atalho; a leitura está abaixo."*
   Transformar o ponto fraco em prova do mecanismo é o movimento mais rentável da página —
   mas mexe em SEO, então não entrou como proposta de copy pura.

3. **Duas armadilhas para quem for implementar.** `planos.unlockTitleSolo` está definida
   **duas vezes** (linha 683 e sobrescrita na 5427 pelo bloco `PLANOS_SOLO_I18N`) — editar a
   primeira não muda nada na tela. E `gate.teaser.price` continua no dicionário sem uso,
   guardando um preço digitado à mão; se alguém a reaproveitar, os preços divergem.

---

## Como eu recomendo aprovar

- **Lote 1 (muro — propostas 1 a 4):** maior tráfego, menor risco, e a #4 corrige um fato
  errado. Se só um lote entrar, é este.
- **Lote 2 (tela do cartão — 5 a 9):** onde o dinheiro é digitado.
- **Lote 3 (topo e laços — 10 a 15):** onboarding e viralidade; efeito mais lento, teto mais alto.

Depois da aprovação do PT: auditoria Hopkins final linha a linha (meta 85/100) e
checagem dos 30 gatilhos de Sugarman antes de mandar para ES/EN.
