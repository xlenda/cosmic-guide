# Dossiê mestre de produto — Cosmic Guide

> Fechado em 23/08/2026. Este documento trata pesquisa de mercado como
> evidência de produto, não como fonte de astrologia ou tarô. A base de conteúdo
> continua sendo `docs/tradicao/`.

## 1. Material cruzado

- `Dossie_Astro_Tarot.pdf`: 19 páginas.
- `Dossie_Concorrentes_Astrologia_Tarot.xlsx`: 5 abas.
- 24 apps mapeados no Google Play Brasil.
- 12 apps analisados comentário por comentário.
- 4.787 comentários com texto; 746 negativos e 4.041 positivos.
- 166 citações negativas organizadas por tema na planilha.
- Questionário dos 5 apps da mentoria: FitCal, OzemPro, Heat Game, PumpLab e
  TapDin.
- Relatório 3S da mentoria: promessa, mecanismo e experiência sensorial.
- Base de tradição do Cosmic Guide: 19 documentos, 12.988 linhas medidas no
  repositório atual.
- Código, testes e versão publicada do Cosmic Guide em 23/08/2026.

Os comentários são uma amostra recente de avaliações com texto, não uma pesquisa
representativa de todos os usuários. Um comentário pode aparecer em mais de um
tema. As conclusões abaixo usam os comentários para descobrir problemas e
expectativas; não transformam opinião de loja em verdade histórica.

## 2. O que o mercado está dizendo

### As falhas que mais aparecem entre os 746 comentários negativos

| Tema | Comentários | Participação |
|---|---:|---:|
| Cobrança e assinatura | 217 | 29,1% |
| Bugs e travamento | 82 | 11,0% |
| Login e cadastro | 70 | 9,4% |
| Paywall e preço | 63 | 8,4% |
| Anúncios | 53 | 7,1% |
| Idioma e tradução | 52 | 7,0% |
| Piorou após atualização | 44 | 5,9% |
| Consultor e créditos | 37 | 5,0% |
| Conteúdo genérico | 23 | 3,1% |
| Erro de cálculo | 18 | 2,4% |
| Suporte ausente | 13 | 1,7% |

O maior risco do nicho não é uma carta ou um signo: é perder confiança no
dinheiro, no acesso ou nos dados. A segunda camada é produto: atualização que
remove função, cadastro que não termina, interface poluída e resultado que parece
template.

### O que aparece nos 4.041 comentários positivos

| Desejo observado | Menções no relatório |
|---|---:|
| Linguagem acessível e fácil de entender | 269 |
| Sensação de acerto e autoconhecimento | 233 |
| Conteúdo completo e detalhado | 199 |
| Ensina e serve para estudar | 141 |
| Vira hábito diário | 87 |
| Visual bonito | 78 |
| Gratuito ou barato | 45 |
| Compartilhar e comparar com amigos | 29 |

O produto vencedor combina profundidade com uma entrada simples. Profundidade
sem hierarquia vira confusão; simplicidade sem profundidade vira resposta
genérica.

### Padrões qualitativos que importam para o Cosmic Guide

1. O usuário percebe imediatamente quando a resposta não leu a pergunta ou os
   dados dele. “IA” vira insulto quando significa erro básico, texto genérico ou
   decisão sem contexto.
2. Interface bonita não compensa perda de função. Horos e Co–Star receberam
   críticas fortes quando simplificaram removendo textos e resumos úteis.
3. Labyrinthos é o melhor padrão de produto da amostra: baralho completo,
   aprendizado, histórico, notas e ausência de anúncios. Seu erro mais grave foi
   apagar ou esconder recursos e notas numa reformulação.
4. O ritual não pode ser interrompido. Anúncio, paywall ou erro no momento de
   virar a carta quebra a experiência inteira.
5. Português correto é produto. Tradução automática destrói credibilidade até
   quando o cálculo está certo.
6. “Consulta personalizada” com texto repetido entre pessoas vira prova pública
   contra o app.

## 3. Onde o Cosmic Guide já vence

Estas vantagens existem no código atual; não são promessas de roadmap.

| Área | Estado real em 23/08/2026 |
|---|---|
| Idiomas | PT, ES e EN, com portão de teste antes do deploy. |
| Anúncios | Não há SDK nem interrupção por anúncio no ritual. |
| Tema noturno | O app inteiro nasce em modo escuro. |
| Tarô | 78 cartas, cartas invertidas, álbum, leitura temática, raspagem e salvamento automático no Diário. |
| Pesquisa | Conteúdo separado em céu calculado, tradição citada e vida do usuário. |
| Precisão | `astronomy-engine`, fuso IANA, horário de verão histórico, cidade real e testes de cálculo. |
| Diário | Histórico unificado, favoritos, filtros, voz, destaque e insight semanal. |
| Personalização inicial | Cinco intenções, uma pergunta seguinte que muda por intenção e quatro resultados desejados; cada resposta altera a prévia e o primeiro caminho da Home. |
| Cancelamento/recuperação | Perfil oferece gerenciamento e recuperação de assinatura; a tela de planos explica cobrança e renovação. |
| Play Billing | Integração no app existe via RevenueCat, mas continua desligada com segurança enquanto falta o webhook. |
| Mascote | Órbi abre o onboarding com uma apresentação própria; há ainda um conjunto separado de 12 personagens dos signos. |

## 4. Diagnóstico central

O Cosmic Guide não sofre de falta de funcionalidades. Ele sofre de **excesso de
oferta simultânea e falta de uma hierarquia única**.

Evidência no código atual:

- `HomeScreen.js` tem 2.003 linhas.
- A Home declara 28 recursos e 38 navegações.
- O catálogo “Explore o cosmos” agora nasce fechado (`exploreOpen = false`),
  primeira correção aplicada a partir deste diagnóstico.
- Mesmo depois de o onboarding escolher um primeiro caminho, a pessoa encontra
  missões, check-in, pensamento, ritual, som, céu pessoal, calendário, frase,
  compatibilidade e o catálogo inteiro na mesma rolagem.
- A Home ainda contém 77 cores hexadecimais e 15 referências a gradientes,
  apesar da limpeza recente do tema global.

O primeiro caminho personalizado está correto e o catálogo já foi recolhido.
A próxima redução de ruído deve agir sobre os muitos blocos que ainda aparecem
antes dele, sem apagar nenhuma função.

## 5. Roadmap e estado das mudanças

### P0 — confiança, simplicidade e continuidade

#### 1. Transformar a Home em “uma coisa importante agora”

- Catálogo fechado por padrão.
- Um único CTA dominante: a próxima ação do plano pessoal.
- No máximo duas ações secundárias visíveis na primeira visita.
- Missões, som, céu, amor e catálogo continuam existindo, mas entram por
  expansão progressiva e por contexto.
- Depois da primeira leitura, a Home troca “primeiro caminho” por “continue de
  onde parou”.
- Nenhuma feature é apagada. O trabalho é de ordem e descoberta, não de corte.

**Por quê:** apps da amostra ganham quando são simples e perdem nota quando a
interface fica poluída. O próprio usuário descreveu a Home como confusa.

#### 2. Proteger o Diário contra troca de aparelho e atualização

- Sincronização do Diário com a conta autenticada.
- Migração versionada e idempotente: nunca substituir histórico local por uma
  resposta vazia do servidor.
- Conflito resolvido por ID/data e favoritos preservados.
- Exportação manual de backup.
- Estado claro: “salvo neste aparelho” ou “sincronizado com sua conta”.

**Estado atual:** as entradas ficam localmente no aparelho. O servidor recebe
apenas a data da última atividade para lembrete; não recebe o conteúdo do
Diário. A lista guarda até 200 entradas não favoritas, além das favoritas.

**Por quê:** perda de notas e histórico é uma das reclamações mais destrutivas
do dossiê. O Cosmic Guide ainda está exposto a esse risco ao trocar de aparelho.

#### 3. Fechar a experiência de pagamento honesta

- Concluir primeiro o webhook RevenueCat no backend.
- Só depois ativar a chave e os produtos do Play Billing.
- Preço nativo sempre vindo da loja na moeda da pessoa.
- Recibo, restauração e estado da assinatura dentro do app.
- Cancelamento acessível em dois toques, levando ao gerenciador correto da
  plataforma.
- Na web brasileira, trocar para preço real em reais somente depois de a oferta
  da Hotmart também estar configurada em reais. Nunca converter apenas o texto.

**Estado atual:** a web mostra US$ 5/10/20; o Android tem o código de compra, mas
o botão permanece desligado porque o webhook RevenueCat ainda não existe. Isso é
seguro para publicação, mas bloqueia receita nativa.

#### 4. Tirar a “IA” do centro sem esconder a verdade

- Órbi vira a voz de navegação e continuidade do produto.
- A tela fala primeiro do que a pessoa pode fazer: entender, registrar,
  comparar e continuar.
- “Chat Espiritual” sai do catálogo principal e vira “Conversar com Órbi”, com
  escopo claro e perguntas sugeridas a partir do perfil.
- Onde há geração por IA, a informação continua disponível no detalhe, na
  privacidade e no botão de reportar. Não fingir consultor humano.
- Criar testes contra resposta que ignora intenção, situação, idioma, signo ou
  dados disponíveis.
- Nunca usar foto de “especialista” para representar robô.

**Por quê:** esconder o uso de IA seria desonesto; vender a tecnologia como
produto também é fraco. O valor deve ser o caminho pessoal, e a tecnologia deve
ficar no papel de ferramenta.

#### 5. Voz: real ou ausente

- Remover a fala robótica como experiência principal.
- Para texto dinâmico, integrar um provedor de TTS neural somente quando houver
  conta, chave, custo definido, cache e consentimento.
- Para conteúdo fixo, pode-se usar áudio humano pré-gravado e versionado.
- Sem provedor real, o botão deve dizer honestamente que usa a voz do aparelho,
  ou não aparecer.

**Dependência:** Anthropic gera texto, não áudio. Uma voz neural dinâmica exige
serviço e credencial próprios. Skill local pode ajudar no fluxo e nos assets,
mas não substitui a autorização e a chave do provedor.

### P1 — ritual e personalização que aumentam retenção

#### 6. Completar o ritual de tarô sem copiar um concorrente

O segundo lote organizou a raspagem, as 78 cartas, as invertidas, o álbum e o
Diário num loop mais forte:

1. Escrever ou escolher a pergunta.
2. Escolher uma tiragem curta, com rótulo honesto de método contemporâneo.
3. Embaralhar e raspar sem interrupção.
4. Mostrar primeiro a leitura de cada carta, depois a síntese.
5. Escrever uma nota própria logo após a revelação.
6. Salvar pergunta, cartas, orientação, síntese e nota no Diário.
7. Reabrir depois exatamente como foi vista.

Adicionar busca, favoritos e modo de estudo ao Álbum aproxima o produto da força
do Labyrinthos sem copiar sua interface, seus textos ou suas ilustrações.

**Implementado no lote 2:** pergunta opcional e privada; sorteio Fisher–Yates;
uma carta grande por vez; raspagem vetorial contínua seguindo o dedo; síntese
contextual sem alterar cartas nem significados; anotação privada; retomada exata
de tiragem interrompida; conclusão idempotente no Diário; e compartilhamento
opcional com prévia exata e corpo público construído apenas com tema, cartas e
significados canônicos. Pergunta e anotação nunca entram no post.

#### 7. Perguntas inteligentes em camadas, não um interrogatório

O onboarding atual já tem três perguntas adaptativas antes dos dados de
nascimento. A próxima melhoria não deve colocar vinte perguntas antes da
primeira recompensa.

- Manter três perguntas de alto sinal no onboarding.
- Entregar uma resposta/eco visível depois de cada escolha.
- Fazer perguntas adicionais dentro do uso: depois da primeira leitura, no
  check-in e ao escolher amor, decisão, trabalho ou autoconhecimento.
- Cada nova resposta precisa mudar algo verificável: próxima ferramenta, ordem
  da Home, pergunta sugerida ou acompanhamento.
- Nunca mudar carta, cálculo ou significado para dizer apenas o que o lead quer
  ouvir.

Isso preserva o mecanismo dos 5 apps — resposta imediata e plano crescente — sem
deixar a entrada longa ou manipulativa.

#### 8. Dar uma função única ao mascote

- Órbi será o guia do produto: boas-vindas, progresso, transições, vazio e
  conclusão.
- Criar um pequeno sistema consistente de poses: neutro, curioso, celebrando,
  pensando e apontando o próximo passo.
- Os 12 personagens de signo ficam como coleção/identidade do mapa, não como
  uma segunda família de mascotes competindo com Órbi.
- Sem balões longos e sem “cara de chatbot”. Uma frase útil por aparição.
- Mesma proporção, iluminação, contorno e acabamento em todos os assets.

#### 9. Permitir nota manual no Diário

O lote 2 passou a permitir uma nota de texto privada logo após a tiragem e a
exibi-la separada da leitura do app no Diário. Ainda adicionar:

- edição posterior;
- busca pelo texto da pessoa;
- exportação;

Isso transforma leitura em memória pessoal e atende exatamente ao padrão mais
elogiado no Labyrinthos.

### P2 — acabamento premium e crescimento

#### 10. Consolidar a direção visual

- Fundo ameixa quase preto e metal quente já são uma boa base.
- Reduzir cores específicas por card e gradientes roxo/rosa/azul.
- Um acento principal por tela; cor semântica só quando comunica estado.
- Tipografia editorial mais adulta, com títulos menos arredondados/pesados.
- Menos caixas: informação não clicável não precisa parecer card.
- Textura e movimento discretos; animações apenas em `transform` e `opacity`.
- Pressionado, carregando, vazio, erro e offline com o mesmo sistema visual.
- Remover ilustrações ou cópias que pareçam genéricas antes de gerar mais arte.

#### 11. Suporte que aparece antes da avaliação de uma estrela

- “Resolver um problema” no Perfil.
- Categoria: cobrança, acesso, cálculo, tradução, conteúdo ou bug.
- Anexar diagnóstico técnico sem enviar leitura privada.
- Resposta automática com protocolo e prazo real.
- Atalho para restaurar compra e gerenciar assinatura antes de abrir chamado.

#### 12. Hábito diário sem poluição

- Uma notificação escolhida pela pessoa, não várias.
- Retorno sempre abre a ação prometida.
- Sequência celebra constância, sem culpa por interrupção.
- Missões aparecem depois que a pessoa entende o valor principal; não antes.
- Medir abertura, primeira leitura, salvamento, retorno em D1/D7 e checkout.

## 6. O que não fazer

- Não apagar funções para deixar simples. Reorganizar e revelar aos poucos.
- Não abrir o catálogo inteiro para toda pessoa nova.
- Não alongar o onboarding sem recompensa após cada resposta.
- Não fabricar personalização alterando significado ou previsão para agradar.
- Não esconder que uma saída foi gerada por IA quando foi.
- Não prometer “voz humana” enquanto o app usa a voz do navegador/aparelho.
- Não ativar Play Billing antes do webhook RevenueCat.
- Não sincronizar o Diário com estratégia “servidor vence”, porque resposta
  vazia pode apagar história local.
- Não copiar texto, identidade, arte ou fluxo exato de concorrente. Usar o
  mecanismo comprovado e executar com a tese própria do Cosmic Guide.

## 7. Ordem segura de implementação

1. **Home essencial:** catálogo fechado, uma ação dominante e duas secundárias.
2. **Tarô + nota própria:** pergunta, raspagem, síntese e anotação no Diário.
3. **Órbi e linguagem:** uma única voz de produto; IA sai da vitrine e permanece
   transparente no detalhe.
4. **Diário sincronizado:** backend primeiro, migração local segura, depois web
   e Android.
5. **Pagamento nativo:** webhook primeiro, produtos/chave depois.
6. **Voz neural:** somente após escolher provedor e definir custo/privacidade.
7. **Polimento visual:** consolidar paleta, tipografia, estados e movimento sem
   reescrever a arquitetura.

Cada lote precisa manter as três línguas, testes de regressão e deploy pelo
script oficial, sempre backend antes da web quando houver mudança de servidor.
