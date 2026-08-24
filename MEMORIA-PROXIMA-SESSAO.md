# Estado consolidado e próximos lotes — Cosmic Guide

> Registrado em **24/08/2026** e atualizado depois da publicação da Community V1
> e do gatilho 3S **Alinhe seu céu**.
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

Pendência externa conhecida: o backend possuía Anthropic para texto, mas a conta
retornava erro de crédito insuficiente. Isso não é falha do fluxo visual e não deve
ser mascarado por fallback que prometa resposta de IA real.

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
- Denúncia, bloqueio bilateral e suspensão administrativa estão implementados.
- A exclusão da conta cobre perfil social, publicações, comentários e relações.
- Textos e estados da nova superfície existem em PT/ES/EN.
- O esquema social foi versionado nas migrations `018` e `019`; rotas HTTP e
  contratos locais foram cobertos por testes.
- Política de Privacidade, Termos e página de exclusão foram atualizados em PT/ES/EN.

### Pendências operacionais e de acabamento

- Confirmar periodicamente `ADMIN_TOKEN`, caixa de suporte e rotina humana de moderação.
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

Produção foi checada após o deploy: `/health` retornou `200`, Comunidade sem token
retornou `401`, denúncia inválida retornou `400`, e o navegador limpo não apresentou
overflow horizontal na Home nem no estado visitante da Comunidade. Em 390 × 844,
a Home rolou do topo ao fim de seus 5418 px e as quatro abas permaneceram acessíveis.

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

### Lote B — personalização real do Tarô

1. Corrigir e testar a entrada pelos 12 signos: a próxima tela deve usar o signo
   realmente escolhido, sem texto preso ao primeiro signo, cache antigo ou cópia
   genérica. Cobrir os 12 signos em PT/ES/EN e também em contexto limpo.
2. Escrever a camada carta × tema de verdade, começando pelos 22 Arcanos Maiores
   e depois os 56 Menores, em PT/ES/EN. Hoje o mesmo texto entre temas ainda é
   semelhante demais.
3. Mudar a ordem da experiência: raspar → interpretação individual imediata →
   próxima carta; síntese somente depois da terceira.
4. Refazer a raspagem como gesto premium: carta maior e em foco, remoção progressiva
   exatamente sob o dedo, textura elegante, haptics discretos e conclusão sem
   animação robótica. Incluir botão acessível “Revelar”, teclado/web e movimento
   reduzido; o gesto nunca finge escolher a carta ou sentir energia.
5. Perguntas inteligentes depois do primeiro valor, não um onboarding longo.
   Cada resposta precisa alterar de verdade tema, pergunta sugerida, tiragem, CTA
   ou plano — nunca apenas repetir o que o lead quer ouvir.
6. Permitir estruturas como Passado–Presente–Futuro e
   Situação–Tensão–Próximo passo, persistindo a chave da tiragem.
7. Não prometer “resposta da IA” quando o resultado for regra/template.

#### Entrada de Órbi antes das perguntas

**DECIDIDO / NÃO IMPLEMENTADO — roteiro-base:**

1. O céu escuro ganha um único ponto de luz; Órbi desperta sem falar demais.
2. Órbi: **“Antes das cartas, vamos dar nome ao que está pedindo clareza.”**
3. Órbi: **“Eu não decido por você. Organizo símbolos, perguntas e caminhos para
   você enxergar sua própria escolha.”**
4. A primeira pergunta aparece integrada à cena, sem abrir outro formulário.
5. Órbi: **“São poucas respostas. Cada uma precisa mudar o caminho que vou mostrar.”**
6. CTA: **“Começar meu caminho.”**

O roteiro final deve ser curto, gravável com voz humana licenciada, legendado em
PT/ES/EN e coerente com o código entregue. Não dizer que Órbi sentiu energia,
conhece a pessoa ou já criou um plano antes de as respostas realmente alterarem o fluxo.

### Lote C — Álbum 2.0 e Explorar

- Álbum: PT/ES/EN, busca, filtros, favoritos e estudo com posição normal/invertida,
  cena, conselho, primeira/última aparição e quantidade de encontros.
- Na área “Tarô por tema”, todo elemento com aparência de card precisa ser
  clicável e levar a uma ação real. O que for apenas decorativo não pode parecer botão.
- Registrar a carta quando ela é revelada, não apenas no fim da tiragem.
- Diferenciar “nova no Álbum” de “novo encontro com esta carta”.
- Criar destino permanente **Explorar** antes de voltar a recolher o catálogo da Home.
- “Continuar” deve usar uma atividade realmente inacabada, não um estado inventado.

### Lote D — Diário, receita, voz e acabamento

- Diário: editar, pesquisar o próprio texto, exportar e sincronizar com merge
  idempotente/união; nunca deixar vazio do servidor sobrescrever conteúdo local.
- Receita: webhook RevenueCat antes de chave/produtos Android; preço exibido vem
  da fonte oficial da loja; instrumentar eventos do funil de pagamento.
- Voz dinâmica real: somente depois de provedor, chave, custo, cache e privacidade.
  Anthropic gera texto, não áudio. Uma introdução fixa de Órbi pode usar gravação
  humana antes, se houver licença e arquivo aprovados.
- Visual: tipografia editorial, menos gradientes/cores, estados consistentes,
  movimento premium e ilustrações com intenção — sem aparência de template de IA.
- Backend: a fonte local reproduzível, dependências, migrations e testes foram
  incorporados a `server-patches/`; continuar rodando a suíte do servidor antes
  de reiniciar e não confundi-la com a suíte do app.

---

## 5. Ordem recomendada ao retomar

1. Ler `CONTEXTO-PARA-AGENTE.md` e este arquivo inteiro.
2. Conferir `git status`, branch, HEAD e produção antes de alterar qualquer coisa.
3. Confirmar o baseline limpo em `2b4d783` e a rota canônica publicada do 3S.
4. **Próxima frente: Lote B — personalização real do Tarô**, começando pelo signo
   realmente escolhido, pela camada carta × tema e pela raspagem premium acessível.
5. Depois seguir para Álbum 2.0/Explorar no Lote C e para o Lote D.

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
| `screens/HomeScreen.js` | Entradas editoriais da Comunidade e de **Alinhe seu céu**. |
| `screens/SkyAlignmentScreen.js` | Estados honestos, palco, resultado e Recibo Cósmico. |
| `components/SkyAlignmentStage.js` | Dois discos, arraste, encaixe, haptics e fallback acessível. |
| `hooks/useReducedMotion.js` | Preferência de movimento reduzido no web e no nativo. |
| `lib/skyAlignment.js` | Motor puro do encontro, próximo evento e recibo auditável. |
| `lib/personalSky.js` | Leitura validada dos dados natais locais usados pelo motor. |
| `screens/CommunityHubScreen.js` | Hub, salas, conversas, comentários e ações sociais. |
| `components/community/CommunityDiscovery.js` | Descoberta editorial, salas e estado visitante. |
| `screens/SocialScreen.js` | Feed Seguindo e compartilhamentos explícitos. |
| `lib/communityRooms.js` | Classificação determinística dos 144 pares. |
| `lib/socialClient.js` | Contrato do cliente com a API social. |
| `lib/i18n.js` | Chaves PT/ES/EN da Comunidade e de todos os estados do 3S. |
| `server-patches/src/http/socialRoutes.js` | Perfil, posts, follows e comentários. |
| `server-patches/src/http/socialAuth.js` | Autenticação e conta revogada. |
| `server-patches/src/http/moderationRoutes.js` | Denúncia, bloqueio e painel de moderação. |
| `server-patches/src/infrastructure/migrations/018_version_social_foundation.sql` | Fundação social versionada. |
| `server-patches/src/infrastructure/migrations/019_add_community_rooms.sql` | Salas, signo público e relações da Community V1. |
| `server-patches/test/communityRooms.http.test.js` | Contrato HTTP das salas. |
| `server-patches/test/socialLifecycle.http.test.js` | Ciclo social e exclusão de conta. |
| `test/communityHubScreen.test.js` | Interações e estados do hub. |
| `test/communityNavigation.test.js` | Aba, stacks e destinos de compartilhamento. |
| `test/communityRooms.test.js` | Classificação dos pares no app. |
| `test/communityServerContract.test.js` | Paridade entre app e backend versionado. |
| `test/skyAlignment*.test.js` | Motor, estados, interação, idiomas e navegação do 3S. |
| `tests/e2e/sky-alignment.spec.js` | Gesto, acessibilidade, estados e deep link em artefato real. |
| `scripts/e2e-regression.js` | Portão oficial da abertura fria da rota canônica antes do deploy. |
| `docs/tradicao/02-aspectos-e-sinastria.md` | Base doutrinária; não transformar signo solar em veredito. |

---

## 8. Estado desta noite

A Community V1 foi publicada no commit `8179785`. O mecanismo 3S **Alinhe seu céu**
foi publicado em `9f9986e`, com o deep link corrigido em `2b4d783`, backend release
`20260824-151514`, web `dpl_CtWHToDHH4ijNwtCeykqS3KZP75j` e **1689/1689 testes**.
A rota canônica é `/cosmic-guide/alinhe-seu-ceu`. O próximo trabalho é o **Lote B**;
os lotes B, C e D continuam **DECIDIDOS / NÃO IMPLEMENTADOS** até seus respectivos
códigos, verificações e publicações.
