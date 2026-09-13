# Achados olhando as fotos (12/09, durante a aplicação)

Anotado por quem estava acompanhando, para o revisor conferir. NÃO corrigido
ainda — os aplicadores estavam em voo e mexer junto daria conflito.

## PlanosScreen (lote formulários) — `design/lote-formularios/04-planos-topo-depois.png`

**1. Título do herói cortado.** ALTO.
`planos.hero.title` passou a ser "O que o céu diz de você — sem contar quantas
vezes". A segunda linha cai atrás da imagem e fica quase ilegível (cinza sobre
cinza). O texto novo é mais longo que o anterior ("Suas nove leituras, sem
limite nenhum") e o herói não acompanhou.
Conferir: o fade do herói cobre o texto? O bloco tem altura fixa? Ou é o
número de linhas que estourou?

**2. Faixa roxa vazia no rodapé.** MÉDIO.
Depois da nota de cobrança há uma faixa violeta sem conteúdo nenhum até a barra
de navegação. Ou a faixa foi aberta sem filho, ou o conteúdo dela ficou abaixo
do scroll fotografado. As duas coisas são defeito: bloco de cor vazio parece
erro de carregamento.

**Como reproduzir as duas:** abrir a tela de Assinatura em 390x844 e olhar o
topo (título) e o fim (faixa vazia).

## HomeScreen — `design/home/home-cheia-dobra1-depois.png`

**3. Vão escuro grande entre o carrossel e o Diário Cósmico.** ALTO.
Depois das bolinhas do carrossel há quase um terço de tela vazio até o cartão
do Diário. Isso não é o "ar" do concorrente: lá o vazio fica AO REDOR do
conteúdo (margem), aqui ficou ENTRE dois blocos soltos, e lê como buraco de
carregamento.
Conferir: é `space.respiro` (64) aplicado onde caberia `secao` (32)? Ou é uma
FaixaCurva aberta cuja altura não acompanha o filho?

**O que está BOM nessa tela (não desfazer ao corrigir):**
· as duas faixas curvas separando saudação / identidade / horóscopo — o corte
  de chão funciona e é o efeito certo;
· Sol/Lua/Ascendente em duas linhas centralizadas, com ar;
· os anéis de elementos preservados (dados reais);
· `home.card.diary.subtitle` novo: "Guarde a primeira leitura — daqui a um mês
  você vai querer reler" — fala do porquê, não da função.

## Revisor da loja — REPROVADO (2 a corrigir)

**4. `home.card.social.subtitle` descreve função que não existe.** CRÍTICO.
Diz "Salas POR SIGNO: converse com quem sente o mesmo" (PT/ES/EN). As salas
NÃO são por signo — são pela RELAÇÃO entre signos (`lib/communityRooms.js`:
plaza, mirror...). Quem assina esperando sala do próprio signo encontra outra
coisa: é Misrepresentation na Play Store, e frustração real no app.
Conserto: descrever o que as salas SÃO, sem perder o tom.

**5. `home.card.comovoceta.subtitle` afirma eficácia.** ALTO.
"a gente acha a leitura CERTA" / "la lectura CORRECTA" / "the RIGHT reading".
"Certa" afirma que o app acerta, sobre um mecanismo que não decide nada.
Conserto: trocar por algo que descreva o encaminhamento sem prometer acerto.

**CONFIRMADO NO MESMO RELATÓRIO:** o portão de promessa MORDE nos 3 idiomas —
provado plantando "Ele vai voltar para você em 30 dias" numa chave real e
conferindo o md5 do arquivo depois de restaurar.

## Revisor da clareza — REPROVADO (3 a corrigir + 1 falso alarme)

**6. 13 títulos e 9 subtítulos SÃO CORTADOS no card.** ALTO.
`components/FeatureCard.js:95` usa `numberOfLines={2}` e a largura útil real é
134px (medida da geometria do masonry: margem 16x2 + gap 12, 2 colunas, menos
padding 12x2). Os textos novos são mais longos e o corte come exatamente a
palavra que persuade.
Conserto: encurtar os 22, ou rever o numberOfLines/largura — mas encurtar é mais
honesto que deixar reticências comendo o final.

**7. Número que envelhece sozinho.** ALTO.
`home.card.idadereal.subtitle` crava "A Superlua tem 47 anos". Mas
`lib/idadeReal.js:42` diz textualmente que a idade É CONTA, NUNCA TABELA —
"'Superlua tem 47 anos' vira 48 sozinho na virada do ano, sem ninguém editar".
A copy nova congelou um número que o app calcula. Ano que vem estará errado, e
ninguém vai perceber.
Conserto: tirar o número do texto, ou interpolar o valor calculado.

**8. ES mistura voseo com "tu" neutro.** MÉDIO.
:3585, :6927, :7169, :7180 — "Suscribite", "seguí sin límite", "abrí la
suscripción". O padrão do app é "tu" neutro latino-americano, e os outros lotes
seguiram. Estes quatro escaparam.

**FALSO ALARME (conferido, está tudo bem):** o revisor 2 leu
"Ele vai voltar para você em 30 dias" em `home.card.reconectar.title` e achou
que outra sessão tinha escrito promessa no arquivo. Era a MUTAÇÃO do revisor 1
sendo testada no mesmo instante. Conferido: a frase não está no arquivo
(grep vazio) e o portão passa 4/4. Nada a fazer.

## Investigação do "700px de vazio" (12/09, feita olhando a tela)

O revisor final marcou como ALTO: "a tela depois de escolher o signo tem ~700px
de vazio no topo, é a primeira impressão de todo usuário novo".

**Reproduzi o caminho e a tela é outra**: não é `OnboardingPerguntasScreen`
(cheguei a consertar lá e REVERTI — não era o arquivo). É o
`components/StoriesReader.js`, o leitor em formato de stories.

**E o vazio é DELIBERADO.** O comentário do próprio componente diz:

    // O respiro empurra o texto pro terço inferior: ~55% de céu vazio em cima.
    respiro: { flex: 1.4 },

É o formato de story — texto embaixo, como Instagram. A camada do botão "Ouvir"
espelha esse mesmo flex para o botão pousar exatamente acima da primeira linha.
Mexer no `respiro` quebra esse alinhamento.

**Então o que fazer?** Não é bug de layout, é decisão de produto:
· se a ficha do signo DEVE ser um story, o vazio fica e está certo;
· se ela deve ser uma tela comum, ela não deveria usar o StoriesReader.

Deixo a decisão registrada em vez de "consertar" um formato intencional. O que
é defeito de verdade nessa tela: o nome do signo em 13px no canto é pequeno
demais para ser o título da primeira tela de um usuário novo.
