# Estado consolidado e próximos lotes — Cosmic Guide

> Registrado em **24/08/2026** e atualizado em **26/08/2026** depois da publicação
> da Community V1, do gatilho 3S **Alinhe seu céu**, dos **Lotes B e C do Tarô**,
> dos artefatos premium e da voz neural ElevenLabs.
>
> Este arquivo é uma **memória de produto e execução**. Tudo que estiver marcado
> como **DECIDIDO / NÃO IMPLEMENTADO** ainda precisa ser construído, testado e
> publicado. Não anunciar como funcionalidade pronta.

## Legenda de estado

- **PUBLICADO:** está no código, passou pelas verificações registradas e foi para produção.
- **DECIDIDO / NÃO IMPLEMENTADO:** direção aprovada para o próximo trabalho.
- **DEPENDÊNCIA EXTERNA:** exige serviço, credencial ou ação do dono.
- **FORA DO V1:** não construir no primeiro lote.

---

## 1. Base já publicada

**PUBLICADO — histórico: commit `f8140eb` (`fix: restore full home and interactive tarot album`)**

- A Home abre com o catálogo completo visível.
- As 78 costas de carta do Álbum são clicáveis.
- Ao tocar numa carta ainda não encontrada, abre um modal lacrado, sem revelar o segredo.
- O CTA do modal leva à tiragem de Tarô.
- O Álbum atualiza imediatamente depois da terceira carta revelada.
- Produção validada em `https://cosmicguide.cloud/cosmic-guide/`.
- Na verificação daquele commit: **1625/1625 testes**, export web e export Android aprovados.

**PUBLICADO — Community V1: commit `8179785` (`feat: launch premium zodiac community`)**

**PUBLICADO — correção segura do deploy web: commit `5a502b2` (`fix: trust system CA for Vercel deploy`)**

**PUBLICADO — 3S Alinhe seu céu: commit `9f9986e` (`feat: launch sky alignment signature`)**

**PUBLICADO — correção do deep link: commit `2b4d783` (`fix: preserve sky alignment deep link`)**

- Backend final publicado primeiro pelo script oficial, release `20260824-151514`.
- Banco de produção em `user_version = 19`, com `quick_check = ok`.
- Web publicada pelo script oficial e disponível em
  `https://cosmicguide.cloud/cosmic-guide/`.
- Deploy Vercel de produção: `dpl_CtWHToDHH4ijNwtCeykqS3KZP75j`, estado `READY`.
- Verificação final: **1689/1689 testes do app**, **272 testes do backend aprovados,
  zero falhas e 1 teste documental ignorado**, export web, export Android e regressão
  E2E aprovados.
- Abertura fria validada em navegador limpo na URL canônica
  `https://cosmicguide.cloud/cosmic-guide/alinhe-seu-ceu`: palco visível, pathname
  preservado, zero erros JavaScript e zero overflow horizontal em 390 × 844.

**PUBLICADO — Lote B + moderação: commits `c96250c` e `306fd5d`**

- Backend publicado primeiro pelo script oficial: release `20260824-180243`.
- Banco em `user_version = 20`, `quick_check = ok`; migration
  `020_add_moderation_actions.sql` aplicada.
- Suíte remota do backend: **283 testes**, **282 aprovados**, zero falhas e
  1 teste documental ignorado.
- Suíte completa do app: **1758/1758 aprovada**. Exports web e Android e os
  nove cenários E2E limpos também foram aprovados.
- Web de produção: `dpl_AzQKsGMsKd3axWHkePo1ZvpN3AU3`, estado `READY`,
  alias `https://cosmicguide.cloud`.
- Probes externos após a publicação: web raiz `200`, app `200`, API health
  `200`, Comunidade sem sessão `401`, denúncia inválida `400` e painel admin
  sem credencial `401`.
- Em produção, no viewport 390 × 844, a Home percorreu os `4897 px` internos
  até o fim sem overflow horizontal. O fluxo limpo preservou Touro como Touro,
  revelou três cartas, só exibiu a síntese após a terceira, mostrou o convite
  da Comunidade e terminou com zero erros JavaScript.

**PUBLICADO — Lote C + artefatos premium + voz: commit `af6afc2`**

- Backend publicado primeiro pelo script oficial: release `20260826-160253`.
- Banco em `user_version = 21`, `quick_check = ok`; migration
  `021_add_voice_usage.sql` aplicada.
- Suíte remota: **306 testes**, **305 aprovados**, zero falhas e 1 teste
  documental ignorado. Suíte do app: **1805/1805 aprovada**.
- Expo Doctor **18/18**, exports web/Android e dez cenários E2E aprovados.
- Web de produção: `dpl_ARZF1HNxYAtZUjMg7oxtQDevCo75`, estado `READY`, alias
  `https://cosmicguide.cloud`.
- Probes externos: raiz, app, Explorar e Privacidade `200`; API health `200`;
  voz disponível em PT/ES/EN; síntese e Comunidade sem sessão `401`; denúncia
  inválida `400`.
- Canário real gerou MP3 válido nas três vozes ElevenLabs. A chave permanece só
  no `.env` da VPS, com permissão `600`; nunca foi versionada ou enviada ao app.
- Navegador limpo em 390 × 844 abriu onboarding, Home e Explorar sem overflow ou
  erro JavaScript. A política pública funciona sem JavaScript.

Pendência externa revalidada nos logs do release `20260826-160253`: a Anthropic
está configurada para texto, mas a conta retorna **crédito insuficiente**. O chat
do Órbi pode falhar até o dono recarregar o saldo. Isso não é falha do fluxo visual
e não deve ser mascarado por fallback que prometa resposta de IA real.

---

## 2. Community V1

**PUBLICADO — commit `8179785`**

### Navegação e experiência entregues

- Quarto botão fixo na barra inferior:
  - PT: **Comunidade**
  - ES: **Comunidad**
  - EN: **Community**
- `CommunityStack` próprio, sem duplicar o feed social existente.
- Botão visível nos modos solo e casal depois da introdução/configuração inicial.
- Deslogado: apresentação verdadeira do benefício e CTA de login;
  nunca preencher a tela com pessoas ou atividade falsas.
- Logado: descoberta da Comunidade, salas, conversas e acesso ao feed **Seguindo**.
- Card da Home também leva diretamente ao hub da Comunidade.
- Compartilhamentos explícitos do Diário e do Tarô continuam indo ao feed Seguindo.
- Quando existir uma central permanente de Explorar, retirar apenas a duplicação
  do card antigo; nunca esconder novamente o acesso principal.

Observações medidas: num navegador totalmente novo, sem signo escolhido, a introdução
do Órbi e a configuração inicial continuam vindo antes das abas. O acesso visitante
foi validado depois da escolha do signo; não anunciar que o deep link ignora essa etapa.
A URL canônica da tela é `/comunidade`; `/cosmic-guide/comunidade` volta para a Home.

### Conversas entre signos entregues

O produto pode aproximar pessoas por signo, mas precisa tratar isso como
**afinidade simbólica e assunto para conversa**, não como um diagnóstico real de
compatibilidade humana.

O V1 usa poucas salas densas, em vez de 78 combinações vazias.

1. **Praça do Céu:** conversa geral.
2. **Espelhos:** pessoas do mesmo signo.
3. **Pontes:** sextis e trígonos.
4. **Faíscas:** quadraturas.
5. **Polos:** oposições.
6. **Entrelinhas:** aversões, isto é, signos que não se aspectam na doutrina de
   signo inteiro.

Cada publicação de combinação carrega os dois signos e a relação exata. Exemplo:
`Áries · Leão — trígono por signo inteiro`. A conversa fica numa das cinco salas
relacionais, sem abrir uma sala isolada para cada par. Todos podem entrar em
qualquer sala; o signo organiza a descoberta, nunca restringe pessoas.

Na entrada, o app mostra as seis salas, sugestões qualitativas ligadas ao signo que
a pessoa consentiu em exibir e conversas reais da sala. Estados vazios são honestos
e oferecem uma ação real; não existem pergunta, usuário, atividade ou contador fictícios.

Os 144 pares de signos são classificados de forma determinística nas sete relações
da tradição usadas pelo produto, mas continuam agrupados nas cinco salas relacionais.
Filtros como Amor, Trabalho, Decisões e Autoconhecimento não foram incluídos no V1.

**Contrato de honestidade:**

- Nunca escrever “vocês são compatíveis” só com base no signo solar.
- Nunca atribuir porcentagem, placar, destino, garantia romântica ou ranking a um par.
- Preferir “conversa entre Áries e Libra”, “afinidade simbólica”, “facilidades e
  tensões desta tradição” e “uma lente para conversar, não um veredito”.
- Se houver contexto astrológico no cabeçalho da sala, mostrar a categoria
  qualitativa, a explicação curta e a fonte usada.
- Não alegar sinastria sem os dados e cálculos necessários.
- Aviso curto na interface: “Seu signo sugere a sala. A conversa decide o
  encontro. Esta é uma relação simbólica entre signos solares, não uma sinastria
  nem uma previsão de relacionamento.”

### Privacidade, consentimento e segurança entregues

- O signo no perfil social nasce **desligado**, exige consentimento próprio e pode
  ser ocultado/removido a qualquer momento.
- Armazenar/exibir no social somente o signo escolhido. Nunca expor data, horário,
  cidade de nascimento, pergunta privada, reflexão do Diário ou contexto de casal.
- Mesmo sem signo público, a pessoa participa da Praça do Céu e pode abrir
  manualmente qualquer sala.
- Diário e Tarô continuam privados por padrão; compartilhar exige ação explícita e
  uma prévia exata do texto que será publicado.
- Nenhuma leitura ou atividade do modo casal é publicada automaticamente.
- Publicações, comentários e curtidas são reais; a pessoa pode apagar o próprio
  post ou comentário.
- Denúncia, bloqueio bilateral, suspensão administrativa, reversão, histórico
  append-only e limpeza transacional do UGC estão implementados.
- Qualquer resposta `community_suspended` invalida requisições antigas e limpa
  feed, perfil, comentários, modais, rascunhos e pendências sociais do aparelho.
- A exclusão da conta cobre perfil social, publicações, comentários e relações.
- Textos e estados da nova superfície existem em PT/ES/EN.
- O esquema social foi versionado nas migrations `018`, `019` e `020`; rotas
  HTTP, ciclo de suspensão e contratos locais foram cobertos por testes.
- Política de Privacidade, Termos e página de exclusão foram atualizados em PT/ES/EN.

### Pendências operacionais e de acabamento

- **Rotina humana obrigatória:** abrir o painel em dois turnos por dia, tratar a
  fila mais antiga primeiro, registrar a decisão e revisar recursos. O procedimento,
  severidades e protocolo de indisponibilidade estão em `docs/OPERACAO-MODERACAO.md`.
- `ADMIN_TOKEN` foi confirmado no release atual sem expor o segredo: a rota sem
  credencial respondeu `401`, e não `503`.
- **DEPENDÊNCIA EXTERNA:** `contato@cosmicguide.cloud` continua sem MX/TXT e não
  recebe. Não anunciar recurso por e-mail até configurar caixa, MX, SPF, DKIM e
  DMARC e testar recebimento real.
- Dívida técnica não bloqueante: painel sem busca/paginação completa, token
  administrativo compartilhado sem identidade individual do moderador e timeout
  que não cobre um corpo de resposta travado depois dos headers.
- Uma tela permanente para listar/desbloquear pessoas não fez parte deste V1.
- Edição/saída explícita do perfil social merece um fluxo dedicado no próximo acabamento.
- A verificação visual limpa cobriu Home inteira, estado visitante, largura e erros;
  uma auditoria manual completa com leitor de tela e teclado físico continua recomendada.

**FORA DO V1:** mensagens privadas, namoro/match automático, chat aleatório,
localização, áudio ao vivo e placar de compatibilidade. Esses recursos aumentam
risco de assédio, spam e falsas promessas antes de existir operação de moderação.

### Critérios de aceite medidos

- O botão Comunidade é visível nos modos solo e casal, logado ou deslogado.
- O acesso não depende de rolar a Home nem de conhecer um `@usuário`.
- Uma pessoa pode entrar na Praça e nas cinco salas relacionais; seu filtro pessoal
  mostra a combinação exata sem fragmentar a conversa.
- Nenhum dado natal sensível aparece na rede social.
- As combinações possíveis são classificadas de modo determinístico na relação
  correta, com teste para todos os pares.
- Não existe atividade, perfil ou contador falso.
- Denunciar, bloquear, apagar conteúdo próprio e excluir conta cobrem todo o UGC.
- Componentes usam alvos de toque adequados e suportam redução de movimento;
  estados vazio/erro/carregando estão implementados.
- Todos os textos visíveis passam pelo portão PT/ES/EN.

Produção foi rechecada após o release `20260824-180243`: `/health` retornou `200`,
Comunidade sem token retornou `401`, denúncia inválida retornou `400` e o painel
admin sem credencial retornou `401`. Em 390 × 844, a Home percorreu os `4897 px`
internos até o fim, sem overflow horizontal; o convite da Comunidade apareceu ao
final da tiragem personalizada e não houve erro JavaScript.

---

## 3. 3S e gatilho de encantamento próprio

### O princípio

Os cinco apps da mentoria não devem ser copiados literalmente. O padrão útil é:

- uma ação física óbvia;
- uma consequência visual imediata;
- um resultado pessoal que usa de verdade a resposta/dado informado;
- uma cena de poucos segundos que qualquer pessoa consegue mostrar em vídeo.

### Assinatura principal publicada: **Alinhe seu céu**

**PUBLICADO — commits `9f9986e` e `2b4d783`**

1. A tela mostra dois discos: **Meu mapa** e **Céu de agora**.
2. A pessoa arrasta o “Céu de agora” sobre o “Meu mapa”.
3. O encaixe magnético usa movimento curto e três haptics discretos.
4. O encontro realmente calculado é revelado.
5. Abre o **Recibo Cósmico**: dado utilizado, aspecto calculado, orbe, fonte,
   limite da leitura e um único próximo gesto útil.

Copy principal: **“Arraste o céu de agora sobre o seu mapa.”**

Frase de produto: **“Um dado seu. Um gesto. Um encontro calculado — com a conta
na tela.”**

Frase de diferenciação: **“Tarô raspa. Cosmic Guide alinha.”**

### Os 3S do Cosmic Guide

- **Simples:** perfil/data → arrastar → uma descoberta → um próximo passo.
- **Sexy:** ameixa escura, metal quente, discos editoriais, encaixe magnético,
  haptics refinados e movimento sem loop decorativo.
- **Surpreendente:** a pessoa vê a mensagem pessoal e também a causa calculada,
  a fonte e o limite — surpresa sem fingir magia técnica.

### Regras do mecanismo

- O gesto apenas revela. Não “lê energia”, não sente aura, não usa biometria e
  não altera o céu.
- Se não existir aspecto próximo, dizer isso e mostrar o próximo evento real.
- Sem hora de nascimento, não prometer Ascendente nem casas.
- O céu diário só muda quando os dados reais mudarem; não fabricar novidade para retenção.
- Ter fallback **“Alinhar por mim”**, suporte a leitor de tela e caminho com movimento reduzido.
- Nenhuma nova permissão de câmera, microfone ou sensor.
- O criativo de oito segundos usa fixture calculada e identificada; nunca inventa
  um aspecto só para o vídeo.

O motor usa efemérides determinísticas do `Astronomy Engine 2.1.19`, o instante
natal convertido pelo fuso informado e o céu real do momento. O Recibo Cósmico
expõe dado, cálculo, aspecto/orbe, fonte, convenção e limite. Cadastros antigos que
guardam apenas offset fixo aparecem como aproximação explícita, nunca como cidade
ou fuso exato. O gesto tem fallback **Alinhar por mim**, teclado/web, leitor de tela
e movimento reduzido; todos os estados visíveis existem em PT/ES/EN.

URL canônica publicada: `https://cosmicguide.cloud/cosmic-guide/alinhe-seu-ceu`.
O portão final passou em **1689/1689 testes**, e o deploy agora testa também a
abertura fria dessa rota para impedir que ela volte silenciosamente à Home.

### Alternativas reservadas

- **Pulso Órbi:** segurar Órbi por três pulsos para iniciar uma revelação. É uma
  boa microinteração de entrada/onboarding e uma opção acessível, mas não deve
  fingir que o toque escolheu a carta ou detectou energia.
- **Constelação da pergunta:** conectar três pontos pode virar interação futura no
  Tarô, mas não é o gatilho principal por exigir reconhecimento de gesto.
- Raspagem permanece como prazer tátil do Tarô, não como assinatura de todo o app.
- Não usar toque traseiro, sacudir, soprar, inclinar ou foto como requisito.

---

## 4. Próximos lotes aprovados

### Lote A — publicado em `8179785`

1. **Concluído:** ciclo de vida do UGC coberto na exclusão da conta.
2. **Concluído no produto:** denúncia, bloqueio bilateral, suspensão e limites;
   a configuração e a rotina humana do dono continuam sendo responsabilidade operacional.
3. **Concluído:** nova superfície social em PT/ES/EN.
4. **Concluído:** `CommunityStack` e quarto botão inferior.
5. **Concluído:** descoberta e salas públicas sem DMs, match ou placar.
6. **Concluído:** testes automatizados, contexto limpo e produção; manter auditorias
   manuais periódicas de tecnologias assistivas e da conta operacional de moderação.

### Gatilho 3S — publicado em `9f9986e`, corrigido em `2b4d783`

- Backend publicado primeiro: release `20260824-151514`.
- Web publicada: `dpl_CtWHToDHH4ijNwtCeykqS3KZP75j`.
- URL canônica: `https://cosmicguide.cloud/cosmic-guide/alinhe-seu-ceu`.
- Testes, exports, E2E e verificação adversarial em produção concluídos.

### Lote B — **PUBLICADO** em `c96250c`, portão corrigido em `306fd5d`

1. Os 12 signos têm lentes próprias em PT/ES/EN. Signo ausente ou inválido não
   cai em Áries; contexto limpo de produção preservou Touro como Touro.
2. A cobertura carta × tema está completa: **78 cartas × 5 temas × 3 idiomas =
   1170 lentes editoriais**. São 330 lentes dos Maiores e 840 dos Menores, sem
   texto genérico de emergência.
3. A experiência é sequencial: raspar → interpretação daquela carta → próxima
   carta. A síntese pessoal só aparece depois da terceira revelação.
4. A raspagem usa carta grande, foil de metal antigo, remoção contínua sob o dedo,
   interpolação do trajeto, haptics discretos e gate medido pela área revelada.
   Há fallback acessível **“Revelar sem raspar”**, teclado/web e movimento reduzido.
5. Existem **5 temas × 3 focos = 15 caminhos**. Cada escolha altera confirmação,
   pergunta sugerida, plano, CTA e/ou estrutura; não é eco vazio do que a pessoa
   quer ouvir.
6. As estruturas **Passado–Presente–Futuro** e
   **Situação–Tensão–Próximo passo** têm semânticas próprias e são persistidas
   junto das cartas, do foco, do signo, da pergunta e do idioma.
7. O resultado local é apresentado como método editorial e simbólico, nunca como
   resposta gerada por IA. Pergunta e reflexão privadas não entram no Feed.

#### Entrada compacta de Órbi — entregue

- Órbi aparece dentro do card de perguntas antes das escolhas, sem criar outra
  tela ou outro toque obrigatório.
- O roteiro diz que organiza símbolos, perguntas e caminhos e que não decide pela
  pessoa. Poucas escolhas mudam de verdade o caminho mostrado.
- O recibo após a escolha confirma o foco com linguagem específica e explica o
  plano antes de tirar as cartas.
- O texto existe em PT/ES/EN. A voz não pertencia ao Lote B original; foi
  adicionada depois, no commit `af6afc2`, usando ElevenLabs no backend.

#### Integridade entregue

- A tiragem é gravada de forma durável antes de consumir Leitura Bônus; falha de
  gravação não cobra, e corrida entre dois toques não duplica o benefício.
- Trocar tema/foco durante uma gravação não mistura leituras; uma conclusão antiga
  não apaga uma tiragem nova.
- A terceira carta só conclui depois de persistir o Álbum. A síntese e o convite
  da Comunidade usam exatamente o snapshot congelado daquela leitura.
- Verificação final: **1758/1758 testes**, exports web e Android, 9/9 cenários
  limpos de Playwright e regressão oficial aprovados; produção validada sem erro JS.

### Lote C — **PUBLICADO** em `af6afc2`

- Álbum 2.0 em PT/ES/EN com busca, filtros, favoritos, encontros, repetição,
  posição normal/invertida, primeira/última aparição e estudo real.
- Cada carta é registrada quando é revelada; `occurrenceId` estável impede toque
  duplo, retomada e concorrência de inflarem a coleção.
- Cartas ainda ocultas aparecem em grupos anônimos clicáveis. O app não expõe os
  slots canônicos nem deixa um card decorativo parecer uma ação quebrada.
- **Espelho Cósmico** usa somente tiragens reais do Diário, declara empate e
  estado vazio e nunca mostra pergunta/reflexão privada.
- **Explorar** é um destino permanente, virtualizado, com 29 experiências e URL
  canônica. A Home ficou curta sem perder portas reais.
- Tarô, Espelho e Alinhamento geram cards premium 1080 × 1920. A allowlist exclui
  pergunta, reflexão, nascimento, cidade, IDs e outros dados privados.

### Lote D — **PARCIALMENTE PUBLICADO** em `af6afc2`

**Entregue nesta frente:** voz neural ElevenLabs PT/ES/EN, privacidade estática,
cache temporário de até 24h, cotas pessoal/global, reprodução web/nativa e cards
premium estáticos. Não há fallback para TTS robótico.

**Permanece fora deste escopo, de propósito:**

- vídeo premium — o dono explicitamente disse que não precisava;
- DMs, match e ativação automática por compatibilidade na Comunidade;
- cobrança/RevenueCat novo — webhook deve existir antes de ligar chave/produtos;
- edição, busca, exportação e sincronização remota do Diário;
- teste físico da reprodução longa/interrupções no Android, que exige aparelho.

---

## 5. Ordem recomendada ao retomar

1. Ler `CONTEXTO-PARA-AGENTE.md` e este arquivo inteiro.
2. Conferir `git status`, branch, HEAD e produção antes de alterar qualquer coisa.
3. Confirmar o baseline publicado em `af6afc2`, backend `20260826-160253`, web
   `dpl_ARZF1HNxYAtZUjMg7oxtQDevCo75`. Esse baseline mediu 1805 testes; medição de
   31/08/2026 no HEAD `4b1b113` deu 1827/1827. **Não repita nenhum dos dois como
   status: rode `npm test` e registre o total real da sua execução.**
4. **Rotina diária paralela:** revisar a fila humana de moderação em dois turnos,
   seguindo `docs/OPERACAO-MODERACAO.md`; isso não é substituído por automação.
5. Há um lote no código sem publicação registrada: a **Memória Cósmica do Órbi**
   (`12d7aa6`, `f09616b`, migration `022`) — ver a seção 8. Fora ele, não existe
   novo lote de código autorizado. Primeiro validar a voz em aparelho Android
   real; depois o dono decide qual item remanescente do Lote D vira uma frente
   própria.
6. Ações do dono: recarregar créditos da Anthropic e configurar/testar a caixa
   `contato@cosmicguide.cloud` antes de prometer chat ou recurso por e-mail.

Não iniciar cinco frentes ao mesmo tempo. Cada lote deve terminar com testes,
export web/Android quando aplicável, revisão em contexto limpo e registro do que
realmente foi publicado.

---

## 6. Regras que não podem ser quebradas

- Deploy somente pelos scripts do repositório; **backend sempre antes da web**.
- `server-patches/` é a fonte da verdade do backend.
- Todo texto visível nasce em PT/ES/EN e passa pelo portão de idiomas.
- Nunca prometer o que o código não faz.
- Medir em vez de presumir; reverter em vez de empilhar correções.
- Não publicar dado privado, conteúdo de casal ou Diário/Tarô sem consentimento explícito.
- Não fabricar compatibilidade, depoimentos, usuários, atividade, precisão ou personalização.

---

## 7. Mapa dos arquivos atuais

| Arquivo | Motivo |
|---|---|
| `App.js` | `CommunityStack`, quarta aba, rota lazy do 3S e base web dos deep links. |
| `routes.js` | Rotas canônicas da Comunidade, Seguindo, Diretrizes e `SkyAlignment`. |
| `screens/HomeScreen.js` | Home curta: caminho do dia, **Alinhe seu céu**, Explorar e conteúdo atual. |
| `screens/ExploreScreen.js` | Catálogo permanente, virtualizado e com destinos reais. |
| `screens/SkyAlignmentScreen.js` | Estados honestos, palco, resultado e Recibo Cósmico. |
| `components/SkyAlignmentStage.js` | Dois discos, arraste, encaixe, haptics e fallback acessível. |
| `hooks/useReducedMotion.js` | Preferência de movimento reduzido no web e no nativo. |
| `lib/skyAlignment.js` | Motor puro do encontro, próximo evento e recibo auditável. |
| `lib/personalSky.js` | Leitura validada dos dados natais locais usados pelo motor. |
| `screens/TarotScreen.js` | Seleção guiada, duas estruturas, ritual sequencial, síntese e ponte explícita para a Comunidade. |
| `components/ScratchRevealCard.js` + `lib/scratchReveal.js` | Foil premium, gesto contínuo, gate de área, acessibilidade, haptics e movimento reduzido. |
| `screens/TarotAlbumScreen.js` + `lib/tarotAlbum2.js` | Álbum 2.0, cartas ocultas agrupadas, encontros, favoritos e Espelho. |
| `lib/cosmicMirror.js` | Padrões calculados apenas de tiragens reais. |
| `components/PremiumCosmicCard.js` + `lib/cosmicShareCard*` | PNG premium compartilhável sem campos privados. |
| `components/BotaoOuvir.js` + `lib/voiceClient.js` + `lib/useVoicePlayback.*` | Cliente ElevenLabs e reprodução web/nativa sem TTS local. |
| `lib/tarotRitualGuide.js` | Contrato dos 5 temas, 15 focos, 12 signos e duas estruturas. |
| `lib/tarotMajorThemeLenses.js` + `lib/tarotMinorThemeLenses.js` | Acesso às 1170 lentes carta × tema × idioma. |
| `lib/tarotPendingReading.js` + `lib/tarotDrawCommit.js` | Snapshot durável e consumo transacional da Leitura Bônus. |
| `screens/CommunityHubScreen.js` | Hub, salas, conversas, comentários e ações sociais. |
| `components/community/CommunityDiscovery.js` | Descoberta editorial, salas e estado visitante. |
| `screens/SocialScreen.js` | Feed Seguindo e compartilhamentos explícitos. |
| `lib/communityRooms.js` | Classificação determinística dos 144 pares. |
| `lib/socialClient.js` | Contrato do cliente com a API social. |
| `lib/i18n.js` | Chaves PT/ES/EN da Comunidade e de todos os estados do 3S. |
| `server-patches/src/http/socialRoutes.js` | Perfil, posts, follows e comentários. |
| `server-patches/src/http/socialAuth.js` | Autenticação e conta revogada. |
| `server-patches/src/http/moderationRoutes.js` | Denúncia e bloqueio com identidade social normalizada. |
| `server-patches/src/http/adminRoutes.js` + `painelRoutes.js` | Suspensão, reversão, histórico, fila oldest-first e painel fail-closed. |
| `server-patches/src/infrastructure/SocialModerationCleanup.js` | Limpeza transacional do UGC durante suspensão. |
| `server-patches/src/infrastructure/normalizeSocialUserId.js` | Identidade canônica usada em todo o fluxo de moderação. |
| `server-patches/src/infrastructure/migrations/018_version_social_foundation.sql` | Fundação social versionada. |
| `server-patches/src/infrastructure/migrations/019_add_community_rooms.sql` | Salas, signo público e relações da Community V1. |
| `server-patches/src/infrastructure/migrations/020_add_moderation_actions.sql` | Histórico append-only de ações e reversões administrativas. |
| `server-patches/src/http/voiceRoutes.js` + `src/application/VoiceSynthesisService.js` | Síntese autenticada, validação, cache e erros estáveis. |
| `server-patches/src/infrastructure/ElevenLabsVoiceProvider.js` | Provedor server-only; chave/IDs não chegam ao cliente. |
| `server-patches/src/infrastructure/VoiceAudioCache.js` + `VoiceQuota.js` | Retenção máxima, temporários e cotas pessoal/global. |
| `server-patches/src/infrastructure/migrations/021_add_voice_usage.sql` | Contagem diária removida com a conta. |
| `server-patches/src/infrastructure/migrations/022_add_cosmic_memory.sql` | Memória Cósmica: conteúdo e consentimento versionado. Migration mais alta do diretório; **no código, ainda sem release registrado**. |
| `server-patches/src/http/memoryRoutes.js` + `src/application/cosmicMemory.js` + `src/infrastructure/CosmicMemoryRepository.js` | Rota (exige e-mail verificado), regras de guardar/recuperar e persistência da Memória Cósmica. Opt-in, desligada por padrão, teto de 300 itens. |
| `screens/CosmicMemoryScreen.js` + `lib/cosmicMemoryClient.js` + `lib/cosmicMemoryCopy.js` | Tela onde a pessoa liga, lê e apaga as lembranças. Roteada em `App.js` e linkada em `screens/ProfileScreen.js`. |
| `public/privacidade.html` | Política PT/ES/EN estática, pública e sem JavaScript. |
| `docs/OPERACAO-MODERACAO.md` | Rotina humana em dois turnos, severidade, recurso e protocolo de indisponibilidade. |
| `server-patches/test/communityRooms.http.test.js` | Contrato HTTP das salas. |
| `server-patches/test/socialLifecycle.http.test.js` | Ciclo social e exclusão de conta. |
| `test/communityHubScreen.test.js` | Interações e estados do hub. |
| `test/tarotLoteBIntegration.test.js` + `test/tarot*ThemeLenses*.test.js` | Integração e cobertura das 78 cartas nos cinco temas e três idiomas. |
| `test/communityNavigation.test.js` | Aba, stacks e destinos de compartilhamento. |
| `test/communityRooms.test.js` | Classificação dos pares no app. |
| `test/communityServerContract.test.js` | Paridade entre app e backend versionado. |
| `test/skyAlignment*.test.js` | Motor, estados, interação, idiomas e navegação do 3S. |
| `tests/e2e/sky-alignment.spec.js` | Gesto, acessibilidade, estados e deep link em artefato real. |
| `scripts/e2e-regression.js` | Portão oficial da abertura fria da rota canônica antes do deploy. |
| `docs/tradicao/02-aspectos-e-sinastria.md` | Base doutrinária; não transformar signo solar em veredito. |

---

## 8. Estado desta noite

Community V1, 3S **Alinhe seu céu**, Lotes B/C, cards premium e voz ElevenLabs
estão publicados. Esse snapshot é `af6afc2`, backend `20260826-160253`, schema 21,
web `dpl_ARZF1HNxYAtZUjMg7oxtQDevCo75` e **1805/1805 testes do app naquela data**.
Probes, canários das três vozes e navegador limpo passaram.

**O código andou depois desse snapshot.** Em 31/08/2026 o HEAD é `4b1b113`, oito
commits à frente de `af6afc2`, e a suíte medida nesta máquina deu **1827/1827**
(entraram arquivos de teste novos). Número de teste é fotografia datada, não
status permanente: rode `npm test` e registre o total real da sua execução, como
`ESTADO-ATUAL.md` já manda.

**Pendente de publicação: a Memória Cósmica do Órbi** (commits `12d7aa6` e
`f09616b`). Ela está no código com a migration `022_add_cosmic_memory.sql` — o
número mais alto de `server-patches/src/infrastructure/migrations/` — mais a rota
`memoryRoutes.js` e a tela `CosmicMemoryScreen.js`. **Não existe registro de
release posterior a `20260826-160253` neste repositório**, e nenhum documento diz
que a 022 foi aplicada — o mais provável é que produção ainda esteja em schema 21,
mas isso NÃO foi medido aqui: leia o `user_version` real na VPS antes de afirmar
qualquer número. Publicar backend antes da web (`AGENTS.md`, seção
"Publicação"). É uma superfície nova de dado privado e muda o que sai para a
Anthropic — ver o Contrato da Fase 3 em `CONTEXTO-PARA-AGENTE.md`.

Fora esse lote, não existe outro lote de código autorizado pendente. Faltam o
teste físico da voz no Android e as rotinas/ações externas do dono: moderação
humana duas vezes ao dia, créditos Anthropic e caixa de e-mail do domínio. Vídeo
premium, DMs, match e nova cobrança ficaram fora de propósito; não anunciá-los
como existentes.
