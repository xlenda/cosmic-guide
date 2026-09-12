# Roteiro da leitura profunda — os quatro áudios do carrossel

> Reescrita dos áudios 8, 9, 10 e 11 do funil, para o app. O áudio 7 já foi refeito
> (54s, na voz clonada) e abre a sequência.
>
> **O que se manteve:** o tom próximo, o reconhecimento da dor, e a promessa de que
> existe um caminho. É o que faz a pessoa ficar nos 9 minutos.
>
> **O que mudou, e por quê:** os originais afirmam o que a outra pessoa sente
> ("com absoluta certeza que essa pessoa te ama"), constroem uma causa sobrenatural
> (inveja, energia negativa, venda espiritual) e vendem um trabalho pago que termina
> com a pessoa "rastejando nos seus pés". Nada disso passa na Play Store, e o pior:
> venderia o trabalho por PIX em vez da assinatura do app.
>
> Aqui o destino é **o plano de 365 dias** — que existe de verdade no código, com as
> 13 lunações calculadas por efeméride.

---

## Áudio 7 — já feito (54s)

Abre reconhecendo. Está em `assets/audio/profunda-7.m4a`, na voz clonada.

---

## Áudio 8 — "não se desfaz num dia" (~75s)

> Agora eu preciso te dizer uma coisa sobre o que essas três cartas mostraram.
>
> O nó que apareceu ali não se desfez num dia, e não vai se desfazer num dia também.
> Ele foi sendo apertado aos poucos — uma conversa que não aconteceu, uma resposta que
> ficou fria, um silêncio que durou mais do que devia.
>
> E é por isso que eu não vou te prometer uma virada de um dia para o outro. Quem te
> promete isso está te vendendo pressa, e pressa em assunto de amor costuma apertar
> mais o nó.
>
> O que eu vou te oferecer é outra coisa: tempo. Treze luas, uma de cada vez, e cada
> uma delas com um trabalho seu.

**Por que funciona sem mentir:** mantém a autoridade ("eu preciso te dizer"), nomeia o
problema, e transforma a ausência de promessa em argumento — quem promete rápido está
vendendo pressa. É a mesma técnica do original, com o sinal invertido.

---

## Áudio 9 — a lua como calendário real (~85s)

> Você já reparou que a lua não se repete nunca igual? Ela leva vinte e nove dias e meio
> para fechar uma volta inteira. Não é vinte e oito, não é um mês do calendário: é vinte
> e nove dias e meio, contados no céu.
>
> E são treze dessas voltas. Treze luas.
>
> Foi assim que eu montei o seu caminho. Cada lua é um trabalho diferente, e ele começa
> na noite em que a lua nasce escura e fecha quando ela escurece de novo.
>
> A primeira lua é para nomear o que aconteceu, com as suas palavras, sem arrumar a
> frase para ninguém. A sexta é para olhar a sua parte, e ela vem no meio do caminho de
> propósito, porque perguntada cedo demais essa pergunta vira culpa.
>
> E agora eu vou te dizer a única coisa que eu prometo aqui dentro. O que você escrever
> na primeira lua fica guardado neste telefone. E na décima terceira, quando a lua fechar
> a volta inteira e chegar de novo no mesmo ponto do céu, eu te devolvo aquilo do seu
> jeito, com a data do dia em que você escreveu, sem uma vírgula mudada.
>
> Não é a promessa que você queria ouvir de mim. Mas é a única que eu consigo cumprir —
> e essa eu cumpro.

**Por que é forte:** os números são verdadeiros e conferíveis — 29,53 dias, 13 lunações,
e o app calcula cada uma por efeméride. O espelho é o `tema 1 → devolvidoPor: 13` de
`lib/ano.js`, e ele devolve verbatim, com a data: é a promessa mais concreta que o app
pode fazer, e a única que ele faz.

**Cuidado que o texto respeita:** não se diz "no dia trezentos e sessenta e cinco". Treze
lunações são ~384 dias e o ano civil tem 365 — `lib/ano.js` existe justamente para não
mentir sobre essa defasagem. Por isso o marco é *a décima terceira lua*, não uma data
civil redonda.

---

## Áudio 10 — o dia a dia (~90s)

> Agora, todo dia você vai abrir isso aqui e vai encontrar três coisas.
>
> A primeira é o céu daquele dia. Em que fase a lua está, que dia da semana é no calendário
> antigo — porque cada dia tem o seu planeta, e isso é mais velho que qualquer um de nós.
>
> A segunda é o trabalho do dia. São cinco gestos que giram com o céu, cada um com o seu nome
> e a sua hora certa de aparecer. Um deles usa uma coisa que está na sua cozinha agora. Outro
> não pede nada além de você. Qual cai em qual dia, não sou eu que escolho e não é você: é o
> dia que escolhe.
>
> O como se faz de cada um eu não vou te contar agora — e não é segredo pra te prender: é que
> o gesto perde a força se você souber dele antes da hora. O que eu te digo é o tamanho: cinco
> minutos. Não importa a hora, não importa o lugar. Esse é o preço, e é o preço inteiro.
>
> Mas tem uma condição, e essa não se negocia: é todo dia. Um gesto prepara o seguinte, e é a
> repetição que trabalha — como o sono: não existe dormir a semana inteira numa noite só.
>
> E o que isso tem a ver com essa pessoa voltar? Tudo. Correr atrás não traz ninguém — isso
> você já sabe. Esses gestos viram o jogo: cada dia arruma um pedaço seu, até reaparecer a
> versão sua que essa pessoa escolheu lá no começo. E quando houver conversa, o plano entra
> junto: a hora de responder, a hora do silêncio, o que não se diz. Isso não é esperança. É
> estratégia, um dia de cada vez.
>
> E a terceira é a sua parte. Uma pergunta que só você responde, escrita aí dentro, que
> não sai desse telefone e ninguém mais lê.

**Por que funciona:** "cinco minutos, não importa a hora nem o lugar" é a frase do funil
original, e ela é boa — declara o preço e remove a logística.

**Cada nome aponta para um ritual real de `datos/rituais.js`**, e os passos ditos aqui são
os passos de lá, não uma versão bonita: `cafe` (vira no pires, fotografa, UMA palavra),
`mao` (a linha que puxar o olho primeiro), `sonho` ("não lembro de nada" é resposta) e
`respiro` (vinte respirações, perder a conta faz parte). Os quatro dizem `duracao: '5
minutos'`. **Não se fala em "uma carta por dia": isso não existe no app.**

---

## Áudio 11 — o convite (~80s)

> Eu não vou te dizer que essa pessoa vai voltar. Ninguém pode te dizer isso, e quem diz
> está inventando. E eu sei que você já ouviu isso de alguém — de um aplicativo, de uma
> carta de baralho, de alguém que cobrou por isso. Foi bom por dois dias. Depois não
> sobrou nada.
>
> O que eu posso te dizer é o que eu vejo daqui: você vai chegar no fim dessas treze luas
> sabendo coisas sobre você que hoje você não sabe. Vai saber a que horas a saudade aperta.
> Vai saber separar o que você sabe do que você está preenchendo por conta própria. E vai
> saber o que você aceita e o que você não aceita mais. Quem sabe isso já não é a mesma
> pessoa. E o que acontece com o seu amor, seja com essa pessoa ou com outra, é diferente
> do que acontece hoje.
>
> Agora eu preciso te dizer uma coisa que eu não vou terminar aqui. Tem um ponto nessas
> três cartas que eu não vou te falar hoje, e não é maldade: é que ele só faz sentido
> depois que você responder a primeira pergunta da primeira lua — a que pede que você
> conte o que aconteceu com as suas palavras, sem arrumar a frase para ninguém.
>
> A sua leitura de hoje fica guardada aí dentro, inteira, e você pode reabrir ela quando
> quiser. Mas escreva a sua versão ANTES de reabrir a minha. Nessa ordem a coisa aparece.
> Na ordem contrária você arruma a frase para caber no que eu disse, e aí o exercício
> inteiro se perde.
>
> E tem uma coisa que eu prefiro te falar agora do que você descobrir amanhã. Todo dia vai ter
> um gesto esperando você lá dentro. Você vai ver qual é, e vai ver quanto tempo ele custa. O
> que não abre sozinho é o como se faz. Os passos.
>
> E eu não vou fingir que isso é detalhe pra te deixar confortável. O como se faz é a coisa
> toda: é onde você faz alguma coisa, em vez de só ler sobre. É a diferença entre passar mais
> um dia pensando nessa pessoa e sair do lugar.
>
> Eu preciso que você abra essa parte decidindo. Não porque apareceu na tela, não num dia em
> que você estava sem fazer nada. Decidindo. Porque o que vem depois pede isso de você todo
> dia, e o primeiro dia é o que ensina todos os que vêm depois.
>
> E eu vou te dizer o que te espera do outro lado dessa porta, porque você tem direito de
> saber antes de decidir.
>
> Todo dia, um gesto. Um só, com o tempo dele contado. As primeiras luas são só suas: o seu
> chão, a sua voz, o seu jeito de responder. Depois começam os passos que essa pessoa vê, um
> por semana, na ordem certa.
>
> Começa com uma frase gentil que não pede nada. Depois um obrigado com endereço, por uma
> coisa específica. Depois uma pergunta sobre o dia, sem cobrar resposta. Depois uma lembrança
> boa, dividida sem anzol. Depois dois minutos escutando sem cortar. E lá na frente, quando
> você estiver de pé, o convite. E o erro assumido por inteiro, sem mas, que é o degrau que
> quase ninguém tem coragem de subir.
>
> Um não abre antes do outro. Se um doer, ou cair no vazio, a gente segura ali, volta pro seu
> chão por uns dias, e sobe de novo quando você estiver firme. Não é pressa. É ordem.
>
> Em treze luas, o que essa pessoa vê não é você pedindo. É você diferente. E isso não se
> explica, se mostra. Você não vai atrás. Você fica impossível de não notar.
>
> E tem a hora. A sua primeira lua não começa quando você decide: ela começa na próxima
> lua nova, que já tem dia e hora marcados no céu — e você está vendo esses dois escritos
> aqui na tela, agora. Se você entrar antes dela, essa lua nova é a sua. Se você entrar
> depois, a sua é a seguinte, e a seguinte é daqui a vinte e nove dias e meio. Isso não é
> regra minha. É a lua, e ela não espera ninguém.
>
> A sua primeira lua está aí. Vamos?

### O fecho é UM só, e vale para qualquer pessoa (11/09)

Até 11/09 este bloco existia em três versões (mulher, homem e neutro), porque uma frase
afirmava quem ela passa a ser depois das treze luas. O dono cortou: a versão neutra virou a
única, e ela se sustenta sozinha — "quem sabe isso já não é a mesma pessoa. E o que acontece
com o seu amor, seja com essa pessoa ou com outra, é diferente do que acontece hoje."

Três áudios de quase cinco minutos viraram um (`profunda-11`), e a tabela de tempos também.
O gênero de quem está do outro lado continua sem ser assumido em lugar nenhum: é sempre
"essa pessoa".

## O que este roteiro nunca diz

- que a outra pessoa ama, sente ou vai fazer qualquer coisa
- que existe energia, inveja, praga ou trabalho a ser desfeito
- que alguém vai voltar, em qualquer prazo
- que o app cura, trata, acalma ou resolve sofrimento
- qualquer coisa vendida por fora do app

## Tempo total

Medido nos `.m4a` que estão em `assets/audio`, com `ffprobe`:

7 (54,2s) + 8 (47,6s) + 9 (85,8s) + 10 (93,7s) + 11 = **~6,9 minutos**, contra os 9,5 dos
originais. O bloco 11 tem três versões — o fecho muda com o gênero dela — e cada uma tem a
sua duração: mulher 135,5s, homem 133,6s, neutra 133,3s. A leitura de quem não respondeu
soma 414,5s.

São **137 frases medidas**: 53 nos quatro primeiros blocos e 28 em cada versão do 11. O
`datos/profunda-tempos.json` é indexado por **áudio**, não por bloco, porque três arquivos
com durações diferentes não cabem numa entrada só.

Os blocos 9, 10 e 11 cresceram na reescrita de `docs/PERSUASAO.md` (o espelho anunciado, os
quatro rituais nomeados, e o fecho com recusa + loop + urgência) e **já foram regravados**
na voz clonada `b8boGhcWbCyPtZnKW69X` (`eleven_multilingual_v2`, stability 0.5,
similarity_boost 0.85, style 0.25). `datos/profunda-tempos.json` foi remedido no mesmo
commit, e `test/profunda.test.js` está verde.

Quem regravar qualquer um dos cinco tem de refazer as duas coisas juntas — o `.m4a` e os
tempos — e mover o total de 137 frases em `test/profunda.test.js`. Esse número é o alarme
que acusa texto e voz dizendo coisas diferentes; ajustá-lo sem regravar desliga o alarme.

**No bloco 11 são três gravações, não uma.** Mexer no texto compartilhado obriga a refazer
as três — deixar uma para trás dá exatamente o defeito que o alarme existe para pegar, e só
para quem respondeu um dos gêneros.
