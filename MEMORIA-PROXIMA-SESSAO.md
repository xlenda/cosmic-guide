# Memória da próxima sessão — Cosmic Guide

> Registrado em **24/08/2026** para retomar em **25/08/2026**.
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

**PUBLICADO — commit `f8140eb` (`fix: restore full home and interactive tarot album`)**

- A Home abre com o catálogo completo visível.
- As 78 costas de carta do Álbum são clicáveis.
- Ao tocar numa carta ainda não encontrada, abre um modal lacrado, sem revelar o segredo.
- O CTA do modal leva à tiragem de Tarô.
- O Álbum atualiza imediatamente depois da terceira carta revelada.
- Produção validada em `https://cosmicguide.cloud/cosmic-guide/`.
- Na última verificação: **1625/1625 testes**, export web e export Android aprovados.

Pendência externa conhecida: o backend possuía Anthropic para texto, mas a conta
retornava erro de crédito insuficiente. Isso não é falha do fluxo visual e não deve
ser mascarado por fallback que prometa resposta de IA real.

---

## 2. Comunidade visível — prioridade da próxima sessão

### Diagnóstico atual

**PUBLICADO, porém escondido:** já existe uma tela social funcional, com perfil,
publicações compartilhadas explicitamente pelo Diário/Tarô, seguidores,
comentários, curtidas, busca por `@usuário`, denúncia e bloqueio. A rota está no
`HomeStack`, mas o único acesso está fundo no catálogo da Home e somente no modo
solo. A barra inferior mostra apenas Home, Tarô e Perfil. Para uma pessoa comum,
parece que a Comunidade não existe.

### Decisão de navegação

**DECIDIDO / NÃO IMPLEMENTADO**

- Criar um quarto botão fixo na barra inferior:
  - PT: **Comunidade**
  - ES: **Comunidad**
  - EN: **Community**
- Criar um `CommunityStack`, sem duplicar a tela social existente.
- Manter o botão visível tanto no modo solo quanto no modo casal.
- Deslogado: mostrar uma apresentação verdadeira do benefício e CTA de login;
  nunca preencher a tela com pessoas ou atividade falsas.
- Logado: abrir a nova descoberta da Comunidade, com acesso ao feed já existente.
- Quando existir uma central permanente de Explorar, retirar apenas a duplicação
  do card antigo; nunca esconder novamente o acesso principal.

### Conceito aprovado: conversas entre signos

O produto pode aproximar pessoas por signo, mas precisa tratar isso como
**afinidade simbólica e assunto para conversa**, não como um diagnóstico real de
compatibilidade humana.

**V1 aprovado:** poucas salas densas, em vez de 78 combinações vazias.

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

Na entrada, mostrar:

- **Sua conversa:** filtro opcional com o próprio signo, sem criar mais uma sala vazia.
- **Combinações para explorar:** sugestões qualitativas relevantes para o signo
  que a pessoa consentiu em exibir.
- **Conversas recentes:** conteúdo real; no vazio, uma pergunta editorial assinada
  pelo Cosmic Guide, sem fingir ser usuário.
- Filtros simples como Amor, Trabalho, Decisões e Autoconhecimento somente se
  alterarem de verdade a descoberta exibida.

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

### Privacidade, consentimento e segurança

**Obrigatório antes de promover a Comunidade:**

- O signo no perfil social nasce **desligado**, exige consentimento próprio e pode
  ser ocultado/removido a qualquer momento.
- Armazenar/exibir no social somente o signo escolhido. Nunca expor data, horário,
  cidade de nascimento, pergunta privada, reflexão do Diário ou contexto de casal.
- Mesmo sem signo público, a pessoa participa da Praça do Céu e pode abrir
  manualmente qualquer sala.
- Diário e Tarô continuam privados por padrão; compartilhar exige ação explícita e
  uma prévia exata do texto que será publicado.
- Nenhuma leitura ou atividade do modo casal é publicada automaticamente.
- Manter denúncia e bloqueio; acrescentar lista de bloqueados, exclusão do próprio
  comentário, edição/exclusão do perfil e limites contra spam.
- Disponibilizar denúncia e bloqueio também no perfil, aplicar o bloqueio dos dois
  lados no servidor e permitir que a moderação suspenda o perfil denunciado.
- Fechar o ciclo de exclusão da conta: apagar ou anonimizar perfil social,
  publicações, comentários e relações conforme a política definida.
- Preparar fila de moderação, `ADMIN_TOKEN`, e-mail de suporte válido e rotina do dono.
- Textos e estados nascem em PT/ES/EN; eliminar os textos PT hardcoded da tela atual.
- Versionar o esquema social e cobrir suas rotas HTTP; não apoiar um lançamento
  público em tabelas ou testes que só existam no servidor remoto.
- Atualizar Política de Privacidade, Termos e página de exclusão em PT/ES/EN.

**FORA DO V1:** mensagens privadas, namoro/match automático, chat aleatório,
localização, áudio ao vivo e placar de compatibilidade. Esses recursos aumentam
risco de assédio, spam e falsas promessas antes de existir operação de moderação.

### Critérios de aceite da Comunidade V1

- O botão Comunidade é visível nos modos solo e casal, logado ou deslogado.
- O acesso não depende de rolar a Home nem de conhecer um `@usuário`.
- Uma pessoa pode entrar na Praça e nas cinco salas relacionais; seu filtro pessoal
  mostra a combinação exata sem fragmentar a conversa.
- Nenhum dado natal sensível aparece na rede social.
- As combinações possíveis são classificadas de modo determinístico na relação
  correta, com teste para todos os pares.
- Não existe atividade, perfil ou contador falso.
- Denunciar, bloquear, apagar conteúdo próprio e excluir conta cobrem todo o UGC.
- Leitor de tela, teclado/web, redução de movimento e estados vazio/erro/carregando
  têm experiência completa.
- Todos os textos visíveis passam pelo portão PT/ES/EN.

---

## 3. 3S e gatilho de encantamento próprio

### O princípio

Os cinco apps da mentoria não devem ser copiados literalmente. O padrão útil é:

- uma ação física óbvia;
- uma consequência visual imediata;
- um resultado pessoal que usa de verdade a resposta/dado informado;
- uma cena de poucos segundos que qualquer pessoa consegue mostrar em vídeo.

### Assinatura principal aprovada: **Alinhe seu céu**

**DECIDIDO / NÃO IMPLEMENTADO**

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

### Lote A — fundação antes da Comunidade pública

1. Mapear e testar o ciclo de vida completo do UGC na exclusão da conta.
2. Completar moderação e ações do dono; configurar suporte e `ADMIN_TOKEN`.
3. Remover hardcodes PT da tela social e criar chaves PT/ES/EN.
4. Criar `CommunityStack` e o quarto botão inferior.
5. Entregar descoberta, salas de signo e salas de combinação sem DMs.
6. Testar em conta nova e ambiente limpo, além da conta do dono.

### Lote B — personalização real do Tarô

1. Escrever a camada carta × tema de verdade, começando pelos 22 Arcanos Maiores
   e depois os 56 Menores, em PT/ES/EN. Hoje o mesmo texto entre temas ainda é
   semelhante demais.
2. Mudar a ordem da experiência: raspar → interpretação individual imediata →
   próxima carta; síntese somente depois da terceira.
3. Perguntas inteligentes depois do primeiro valor, não um onboarding longo.
   Cada resposta precisa alterar de verdade tema, pergunta sugerida, tiragem, CTA
   ou plano — nunca apenas repetir o que o lead quer ouvir.
4. Permitir estruturas como Passado–Presente–Futuro e
   Situação–Tensão–Próximo passo, persistindo a chave da tiragem.
5. Não prometer “resposta da IA” quando o resultado for regra/template.

### Lote C — Álbum 2.0 e Explorar

- Álbum: PT/ES/EN, busca, filtros, favoritos e estudo com posição normal/invertida,
  cena, conselho, primeira/última aparição e quantidade de encontros.
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
- Backend: tornar testes reproduzíveis e rodá-los antes de reiniciar; não confundir
  a suíte do app com cobertura do servidor.

---

## 5. Ordem recomendada ao retomar

1. Ler `CONTEXTO-PARA-AGENTE.md` e este arquivo inteiro.
2. Conferir `git status`, branch, HEAD e produção antes de alterar qualquer coisa.
3. Auditar exclusão/moderação do UGC e escrever testes de contrato.
4. Implementar internacionalização social e navegação da Comunidade.
5. Implementar as salas e validar com usuário novo/conta limpa.
6. Só então iniciar o gatilho **Alinhe seu céu**.
7. Seguir para Tarô contextual, Álbum 2.0 e os demais lotes.

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

## 7. Arquivos para abrir primeiro amanhã

| Arquivo | Motivo |
|---|---|
| `App.js` | Abas atuais, `HomeStack` e registro de `SocialScreen`. |
| `routes.js` | Criar a rota/aba da Comunidade sem nomes duplicados. |
| `screens/HomeScreen.js` | Card social atual e regra `SOLO_ONLY`. |
| `screens/SocialScreen.js` | Feed já existente e textos ainda hardcoded em PT. |
| `lib/socialClient.js` | Contrato do cliente com a API social. |
| `lib/i18n.js` | Chaves PT/ES/EN da aba, salas, erros e estados. |
| `server-patches/src/http/socialRoutes.js` | Perfil, posts, follows e comentários. |
| `server-patches/src/http/socialAuth.js` | Autenticação e conta revogada. |
| `server-patches/src/http/moderationRoutes.js` | Denúncia, bloqueio e painel de moderação. |
| `server-patches/src/infrastructure/migrations/016_add_moderation.sql` | Única migração social/moderação já versionada encontrada. |
| `server-patches/supabase/001_delete_own_account.sql` | Exclusão atual; auditar e cobrir todo o UGC antes do destaque. |
| `screens/ProfileScreen.js` | Ordem atual da exclusão da conta. |
| `docs/tradicao/02-aspectos-e-sinastria.md` | Base doutrinária; não transformar signo solar em veredito. |

---

## 8. Estado desta noite

Nesta sessão de 24/08/2026, as decisões acima foram **documentadas para amanhã**.
Nenhuma das novas funções de Comunidade, salas de signos ou “Alinhe seu céu” foi
implementada ou publicada nesta etapa. A base publicada continua sendo a descrita
na seção 1.
