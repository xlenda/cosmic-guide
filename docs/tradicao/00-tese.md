# A TESE DO COSMIC GUIDE

> Este é o documento que governa os outros. Os arquivos 01 a 09 são **pesquisa**:
> o que Ptolomeu, Manílio, Waite, Artemidoro e Benham escreveram, com obra, autor
> e século. Este aqui é **posição**: o que nós sustentamos, por quê, e o que isso
> obriga o produto a fazer.
>
> Escrito em 31/07/2026, depois de ler as fontes primárias diretamente — não
> resumos delas.

---

## Por que um app precisa de tese

Porque sem tese, um app de astrologia é uma coletânea de afirmações sem dono.
Alguém escreveu "leonino é dramático" em algum lugar, todo mundo copiou, e hoje
nenhum produto do mercado sabe dizer de onde veio. Quando um usuário que estuda
o assunto pergunta "quem disse isso?", não há resposta.

Tese é o que permite responder. E é o que permite **discordar do mercado sem ser
arrogante** — porque a discordância passa a ter endereço: capítulo, autor, ano.

---

## A TESE, em um parágrafo

**Todo sistema divinatório que o app oferece tem duas camadas de idade muito
diferentes, e o mercado as apresenta como uma só.** A camada de baixo — observar
o céu, marcar o tempo, registrar o que se vê — é genuinamente milenar e
verificável. A camada de cima — o que cada coisa *significa* — é quase sempre
muito mais recente do que se anuncia, e tem inventor com nome e data. O Cosmic
Guide separa as duas camadas em vez de fundi-las. Isso não enfraquece o produto:
**a história real é mais interessante que a inventada**, e é a única que aguenta
ser checada.

---

## As sete proposições

### 1. O céu é medível. O significado é atribuído. Nunca misture as duas coisas.

Há uma diferença de natureza entre "o Sol estava a 209,98° de longitude
eclíptica em 23/10/2010" e "Libra é diplomático". A primeira é falsificável: se
estiver errada, está errada, e dá para provar. A segunda é uma atribuição
cultural: pode ser útil, bonita e antiga, mas não é do mesmo tipo.

Isso não é filosofia — é a regra de engenharia mais importante do app. Foi
exatamente aqui que ele teve o pior bug da sua história: `signoFromDate`
decidia o signo por **tabela fixa de calendário**, e errava 293 dias em 29.585
no período 1950–2030 (0,99%), sempre nas fronteiras. 23/10 errava em 44 dos 81
anos. Ptolomeu já sabia disso no séc. II (*Tetrabiblos* I.22): os signos começam
nos equinócios e solstícios, que são **instantes**, não datas de calendário.

A camada medível tem que ser perfeita, porque ela é checável. A camada atribuída
tem que ser **citada**, porque ela é opinião — de alguém, em algum século.

> **Regra:** nenhuma afirmação astronômica no app pode vir de tabela. Vem de
> efeméride calculada. Trava: `test/signoSolarReal.test.js`.

### 2. A tradição nunca foi uma coisa só — e mostrar a discordância é mais forte que escondê-la

"Conhecimento milenar" é uma expressão que achata quatro mil anos de gente
brigando. Ptolomeu (séc. II) já escreve *contra* práticas babilônicas.
Vétio Valente (séc. II) usa técnicas que Ptolomeu ignora. Sexto Empírico, no
séc. III, escreveu um livro inteiro chamado ***Contra os Astrólogos*** — e ele
é fonte primária tanto quanto os outros. William Lilly (1647) pratica um ofício
diferente do de Dane Rudhyar (1936). Jyotish e a astrologia ocidental usam
zodíacos diferentes e discordam do signo da maioria das pessoas.

O mercado esconde isso porque discordância parece fraqueza. É o contrário:
um app que diz "Ptolomeu classifica assim, mas Valente usa outro critério" está
dizendo ao usuário que **existe um assunto de verdade ali**, com literatura e
controvérsia — e não um texto de biscoito da sorte.

**E há um cuidado que esta tese precisa ter consigo mesma: Ptolomeu não é o
fundador.** Ele chega cerca de três séculos depois do sistema pronto e é um
**reformador dissidente** — define a astrologia como física do éter e por isso
*poda* a tradição que recebeu, descartando os lotes e enxugando as casas. Quem
representa a prática corrente da época é Valente, não ele. Este documento se
apoia bastante em Ptolomeu porque ele é o mais sistemático, o mais bem
preservado e o mais fácil de citar com precisão — mas citar Ptolomeu como "o que
os antigos faziam" é **citar o dissidente como se fosse a média**. Onde a tese
diz "a tradição", leia "Ptolomeu, que discordava de parte dela".

> **Regra:** quando duas fontes discordam, mostrar as duas com o nome de cada
> uma. Nunca escolher em silêncio.

### 3. Quase tudo que o mercado vende como antigo é moderno, datável, e tem autor

Esta é a lista que a pesquisa produziu. Cada item foi verificado em fonte, e
cada um é um lugar onde o app pode estar certo enquanto o mercado inteiro erra:

| O que o mercado diz | O que a fonte mostra |
|---|---|
| Tarô vem do Egito, é o *Livro de Thoth* | Antoine Court de Gébelin, *Le Monde primitif*, **vol. 8, 1781**, capítulo "Du Jeu des Tarots". Ele escreveu isso 40 anos antes de Champollion decifrar hieróglifo — não tinha como ler nada egípcio. Dois anos depois, Etteilla publica o primeiro método de leitura. **A cartomancia com tarô tem 245 anos, não 4.000.** |
| As 22 lâminas correspondem às 22 letras hebraicas | Comte de Mellet, no mesmo volume de 1781. Não é cabala antiga: é uma associação feita no Iluminismo francês. |
| "Superlua" é conceito astronômico tradicional | Cunhado pelo astrólogo **Richard Nolle em 1979**. |
| Os nomes das luas cheias (Lua do Lobo, do Morango) são folclore indígena milenar | Publicados pelo ***Maine Farmers' Almanac*, anos 1930**. |
| As 8 fases da Lua como ciclo psicológico | **Dane Rudhyar, séc. XX.** A divisão antiga é outra. |
| O Homem Zodiacal com os doze signos está no *Tetrabiblos* | Não está. Ptolomeu lista **planetas**. A lista dos doze signos é de **Manílio, *Astronomica* II** — e Leão não é o coração (é flancos e omoplatas), Libra não são os rins (é nádegas). |
| Quiromancia com montes, tipos de mão e linha do casamento é antiga | O sistema moderno nasce em **1839** com D'Arpentigny (*La Chirognomie*), Heron-Allen (1883), a Chirological Society (1889) e **Benham (1900)**. O tratado "de Aristóteles" que circula nos manuais **não está nas obras canônicas dele**. |
| Ler borra de café é tradição turca milenar | O café só chega ao palácio otomano no **séc. XVI** — a prática não pode ser mais velha que a bebida. E o **dicionário de símbolos** (cobra = inimizade, casa = mudança) é entretenimento de salão **britânico do fim do séc. XIX**, consolidado por Cicely Kent em **1922**. |
| Porcentagem de compatibilidade entre signos | Não existe em fonte nenhuma. Invenção comercial do séc. XX, do mesmo lote do horóscopo de jornal. |
| "Ariano é impulsivo, escorpiano é intenso" | Caracterologia do séc. XX, de Alan Leo em diante. Não está em Ptolomeu nem em Manílio. |

**Nenhum desses itens obriga a apagar a feature.** Obriga a datá-la. O tarô
continua no app — com a informação de que Waite desenhou o baralho em 1911 e
que a leitura como conhecemos nasceu em 1781. Isso é mais interessante que
"segredo dos faraós", e tem a vantagem de ser verdade.

**A descoberta que unifica a lista inteira, e ela é a melhor coisa desta
pesquisa:** a astrologia ocidental **começa** com uma falsificação de
antiguidade. Os textos fundadores do mapa natal como sistema circulam sob os
nomes de *Nechepso* e *Petosiris* — um faraó e um sacerdote egípcios. Os dois
são **pseudônimos**, usados por autores gregos em Alexandria por volta de
150–120 a.C. para dar pedigree egípcio a um texto que eles estavam escrevendo
naquele momento.

É exatamente o mesmo gesto de Court de Gébelin com o tarô, 1.900 anos depois. E
de Nolle com a "Superlua". E do almanaque com os nomes das luas.

Ou seja: **inventar antiguidade não é a corrupção da tradição, é um traço da
tradição** — está lá desde o primeiro dia. Isso muda o tom da nossa correção.
Não estamos denunciando fraude moderna contra uma pureza antiga; estamos
mostrando um padrão de 2.000 anos, do qual o mercado de hoje é só o capítulo
mais recente. É uma posição mais interessante, mais generosa e mais difícil de
refutar.

**E um achado que aponta para dentro de casa.** A moldura que o app usa — "não é
previsão, é reflexão", "espelho simbólico", "tendências, não determinismos" — não
nasceu de escrúpulo epistemológico. Nasceu de **defesa criminal**. Alan Leo foi
processado por adivinhação na Inglaterra em 1914 e de novo em 1917; a tese da
defesa era que ele descrevia tendências, não fortunas. Ela ruiu quando a acusação
leu em voz alta uma linha do almanaque dele prevendo morte na família. Foi
condenado, multado em £5, e morreu em agosto do mesmo ano.

O mercado inteiro herdou essa frase sem saber de onde veio, e o Cosmic Guide
também. Saber a origem não a torna falsa — ela continua sendo a descrição
honesta do que o app faz. Mas é um belo exemplo da proposição 1: até a nossa
ressalva tem história, autor e data.

### 4. A compatibilidade real da tradição é mais rica E mais dura que a do mercado

Esta é a proposição com maior valor competitivo, e ela veio da leitura direta
do *Tetrabiblos*, Livro I, capítulos 13 a 16.

**Ptolomeu não tem quatro relações entre signos. Tem seis.**

1. **Os quatro aspectos** (I.13): oposição 180°, trígono 120°, quadratura 90°,
   sextil 60°. E o critério dele para "harmônico" **não é elemento** — é
   **gênero do signo**: trígono e sextil unem signos do mesmo gênero (todos
   masculinos ou todos femininos), quadratura e oposição unem gêneros opostos.
   Ele deriva os ângulos de proporções musicais (½, ⅓, 3:2, 4:3) aplicadas aos
   180°. A afinidade por elemento é **consequência**, não causa — e é por isso
   que "fogo combina com ar" é uma simplificação de segunda mão.

2. **Signos comandantes e obedientes** (I.14): pares equidistantes do mesmo
   ponto **equinocial**. São Touro–Peixes, Gêmeos–Aquário, Câncer–Capricórnio,
   Leão–Sagitário, Virgem–Escorpião. Áries e Libra ficam de fora, porque são os
   próprios pontos de referência. **Esta relação é assimétrica**: o signo do
   semicírculo norte comanda, o do sul obedece.

3. **Signos que se veem / de igual poder** (I.15): pares equidistantes do mesmo
   ponto **solsticial**. São Gêmeos–Leão, Touro–Virgem, Áries–Libra,
   Peixes–Escorpião, Aquário–Sagitário. Câncer e Capricórnio não têm par.

4. **Signos desconexos / alheios** (I.16): os que não têm **nenhuma** das
   familiaridades acima. Ptolomeu diz que estão "a um ou a cinco signos de
   distância" — 30° e 150°.

E aqui está a descoberta que fecha o raciocínio. Conferindo par a par: **todos
os pares comandantes e todos os pares que se veem já possuem um aspecto**
(Touro–Peixes é sextil, Gêmeos–Aquário é trígono, Áries–Libra é oposição, e
assim por diante). Ou seja, essas duas categorias **não resgatam nenhum par de
30° ou 150°**. A conclusão é aritmética, não interpretativa:

> **Todo par a 1 ou 5 signos de distância é desconexo. São 24 pares — 48 das 144
> células da matriz. Um terço.**

O que o app fazia: 144 pares, todos entre 74% e 92%, média 84, **nenhum abaixo
de 70**. A oposição Áries–Libra recebia **92%, a nota mais alta** — sendo o
aspecto mais duro que existe. E os 48 pares de aversão recebiam 74–80, a mesma
faixa das quadraturas.

O que a tradição sustenta: **um terço dos pares simplesmente não se relacionam**
— Ptolomeu usa a palavra *alheios*. Isso é exatamente o que você disse que
sabia por conta própria ("tem signo que não combina com outro"), e o mercado
inteiro esconde porque nota baixa não vende.

Mas repare no outro lado: as duas categorias esquecidas **adicionam** relação
onde só havia ângulo. Touro–Peixes não é "um sextil de 78%" — é um sextil **e**
uma relação de comando, com direção. Nenhum app do mercado implementa isso,
porque nenhum leu I.14.

**Correção a esta proposição, feita em 31/07/2026 depois de ler o Livro IV.**
A primeira versão deste documento tratava a aversão como *indiferença* — dois
signos que não se veem, e portanto não se relacionam. Isso está certo para I.16,
que é a definição **estrutural**. Mas o Livro IV, capítulo 7 (*Dos amigos e
inimigos*) faz a aplicação **relacional**, e ali Ptolomeu escreve: *"if they are
in disjunct signs or opposite signs, they produce the deepest enmities and
lasting contentions"*. Ou seja: em sinastria, a aversão não é neutra — ele a põe
**no mesmo degrau da oposição**, no fundo. Os dois capítulos não se contradizem;
I.16 define, IV.7 aplica. Registro a correção porque a versão anterior estava
incompleta e a seção "o que refutaria esta tese" existe justamente para isso.

E IV.7 dá algo que I.13 não dá: uma **escala ordinal de quatro degraus**, que é
o único lugar em que a tradição ocidental ordena configurações entre duas cartas.
Grau 1 mesmo signo ("secure and indissoluble sympathy"), grau 2 trígono e sextil
juntos, grau 3 quadratura ("the antipathies less"), grau 4 oposição e aversão.
Note o que isso corrige: **a oposição não é o topo — é o fundo**, e o app antigo
dava a ela a nota máxima.

**E há um furo no próprio Ptolomeu, que vale citar em vez de esconder.** Em I.13
ele justifica quadratura e oposição serem desarmônicas dizendo que unem "signos
de tipos opostos" — os gêneros de I.12, que alternam um a um a partir de Áries.
A conta fecha para a quadratura (Áries masculino, Câncer feminino). **Não fecha
para a oposição**: a seis signos de distância o gênero é sempre o mesmo (Áries e
Libra são ambos masculinos). A razão que ele dá sustenta uma e não a outra. O app
cita o furo em vez de repetir a frase como se ela fechasse — e isso é mais
defensável que qualquer apelo à autoridade.

> **Regra:** compatibilidade se descreve por relação nomeada e citada, não por
> nota. Se houver número, ele não pode contradizer a relação que o acompanha.

### 5. As tradições se cruzaram — e o cruzamento é documentado

O *Yavanajātaka* é uma tradução do **grego para o sânscrito, séc. II d.C.** O
nome quer dizer, literalmente, "a astrologia dos jônios" — dos gregos. A
astrologia indiana absorveu a helenística num ponto de contato datável, e por
isso Jyotish tem casas, aspectos e planetas reconhecíveis, mas rodando sobre
zodíaco **sideral** (que corrige a precessão dos equinócios) em vez do
**tropical** ocidental.

Consequência prática, e ela é forte: **para a maioria das pessoas, o signo
solar védico é diferente do ocidental** — em geral o anterior. Isso não é erro
de ninguém: são dois sistemas de referência, ambos internamente coerentes, e a
diferença é a precessão, que é medível.

Um app que explica isso ganha duas coisas. Ganha o usuário que já ouviu falar
que "existe outro signo" e não entendeu. E ganha a demonstração viva da
proposição 2: a tradição discorda de si mesma, e a discordância tem causa
astronômica conhecida.

### 6. A linha do corpo é epistemológica antes de ser jurídica

O app descreve o que a tradição acreditava. Não prescreve nada ao corpo de quem
lê. Isso já está travado em código (`lib/zodiacBody.js`, `lib/grounding.js`,
`lib/cosmicSound.js`, com teste que aborta o deploy).

A razão que costuma ser dada é jurídica — Anvisa, responsabilidade civil — e
ela é verdadeira. Mas a razão **anterior** é a proposição 1: dizer "Áries rege
sua cabeça" é apresentar uma atribuição do séc. I como se fosse um fato medido
sobre uma pessoa viva. É a mesma confusão de camadas do bug do signo solar, só
que aplicada a um corpo — e aí ela sai do erro e vira dano.

> **Regra:** sempre no passado, sempre com dono. "Manílio associava…", nunca
> "seu ponto fraco é…".

### 7. Honestidade é fosso, não freio

Cada correção das proposições acima é uma feature que o concorrente **não
consegue copiar sem fazer o mesmo trabalho**. Ele teria que ler Ptolomeu em I.16
para descobrir a aversão, ler Manílio para descobrir que Leão não é o coração,
ler Court de Gébelin para datar o tarô em 1781.

E há um efeito assimétrico que decide a longo prazo: quando o app crescer, vai
aparecer quem estuda astrologia de verdade. Essa pessoa testa com o mapa dela.
Um app que erra o signo dela perde a credibilidade em dez segundos e ela conta
para os outros. Um app que cita capítulo e corrige o que os outros repetem
ganha a mesma pessoa como defensora — e a defesa dela vale mais que anúncio.

---

## O que a tese obriga o produto a fazer

Estas são as regras operacionais, deriváveis das sete proposições. Elas valem
para toda tela, todo texto, toda feature futura.

1. **Três camadas, sempre separadas.**
   Camada 1 — o céu: calculado, nunca tabelado, tem que estar certo.
   Camada 2 — a tradição: citada com obra, autor e século.
   Camada 3 — a vida de quem lê: dela, nunca nossa para afirmar.

2. **Data de nascimento em vez de signo autodeclarado.** O app calcula melhor
   que a pessoa lembra, e a data destrava mapa, céu do dia e signo correto de
   uma vez. Pedir o signo é pedir para ela errar.

3. **Toda feature declara sua idade.** Não em letra miúda: como parte do
   conteúdo. "Este baralho é de 1911" é informação, não ressalva.

4. **Nada de nota sem relação nomeada.** Vale para compatibilidade e para
   qualquer futuro score.

5. **Nenhum texto sobre pessoa real pode ser gerado sem dado real.** Já é regra
   do dono; a tese diz por quê: conteúdo inventado sobre gente é a camada 3
   sendo fabricada.

6. **Quando a fonte contraria o que é bonito, vale a fonte** — e explica-se a
   diferença ao usuário. É esse o produto.

---

## O que refutaria esta tese

Uma tese que não pode ser derrubada não é tese. Estas são as condições que a
derrubariam, e elas são checáveis:

- **Se as datas de invenção estiverem erradas.** Se aparecer atestação do tarô
  divinatório antes de 1781, ou do dicionário de símbolos de café antes do séc.
  XIX, a proposição 3 cai naquele item. (Cada linha da tabela é uma aposta
  verificável — é assim que deve ser.)
- **Se a leitura de I.14–I.16 estiver errada.** Se algum par de 30° ou 150°
  tiver alguma das familiaridades ptolomaicas, o número 48 muda. Conferi par a
  par; quem discordar tem onde conferir.
- **Se o público não quiser isto.** Esta é a única refutação que não vem de
  fonte, e é a mais séria. Se o rigor não converter, a tese continua verdadeira
  e o negócio continua errado. A resposta então não é mentir: é achar a forma
  de contar a verdade que prende — que é trabalho de copy, não de conteúdo.

---

## Fontes lidas diretamente para esta tese

*Tetrabiblos* I.13, I.14, I.15, I.16, I.22 (Ptolomeu, séc. II, trad. Robbins,
LacusCurtius) · *Astronomica* II (Manílio, séc. I) · *Le Monde primitif* vol. 8,
"Du Jeu des Tarots" (Court de Gébelin, 1781) · *The Pictorial Key to the Tarot*
(Waite, 1911) · *The Laws of Scientific Hand Reading* (Benham, 1900) ·
*La Chirognomie* (D'Arpentigny, 1839) · *Yavanajātaka* (séc. II, do grego) ·
*Oneirocritica* (Artemidoro, séc. II) · cânone comentado da escola Saturnália
(44 obras) · 38 autores brasileiros levantados pela Constelar.

Detalhamento em [09-bibliografia-e-fontes.md](09-bibliografia-e-fontes.md).
Retrato do mercado — que **não é fonte** — em
[08-o-que-o-mercado-diz.md](08-o-que-o-mercado-diz.md).
