# TRADIÇÃO 12 — As Doze Casas: significado antigo × moderno

**O que é este arquivo.** Uma revisão bibliográfica, casa por casa, do que a
astrologia **helenística** atribuía a cada um dos doze *lugares* contra o que a
astrologia **moderna** atribui — e, no meio, a camada **medieval/renascentista**
que quase todo mundo confunde com "a tradição". Inclui a doutrina dos **lugares
inoperantes** (os *topoi argoi* / *achrematistoi*), que é o coração conceitual do
sistema antigo e que praticamente nenhum app menciona.

**Quando consultar.** Antes de escrever **qualquer** texto do app que diga o que
uma casa significa. Isso inclui: a tela de Mapa Astral, o contexto enviado à IA,
frases soltas de chat, conteúdo de blog/marketing e legenda de card. Se o texto
usar as palavras "Casa 8", "Casa 12", "casa da carreira", "casa do inconsciente"
— este arquivo é pré-requisito.

**Relação com o documento 03.** O `03-casas-e-mapa-natal.md` cobre o **sistema**
(Ascendente, ângulos, Casas Inteiras × Placidus × Porfírio, a medição de 50% de
planetas que trocam de casa) e traz a lista de significações de Paulo de
Alexandria. Ele é a base; **não repito aqui o que já está lá**. Este documento 12
faz o que o 03 não faz:

| O 03 tem | O 12 acrescenta |
|---|---|
| A lista de Paulo (378 d.C.) e a de Valente | A de **Fírmico** (c. 335) e a de **Ptolomeu** (c. 150), verbatim, e o **confronto entre as três** — que não batem |
| A lógica de aversão em três parágrafos | A **doutrina completa dos lugares inoperantes**, com as três listas antigas de "casas ruins" que **discordam entre si** |
| "Casa 8 ≠ sexo", "Casa 12 ≠ inconsciente" como dois itens de mito | A **genealogia** de onde cada significado moderno veio: autor, obra, década, mecanismo |
| Nada sobre a camada medieval | **Lilly, 1647**, casa por casa — a camada que o mercado chama de "tradicional" |
| Nada sobre o motor do erro | O **alfabeto de 12 letras**: Lilly (1647) → Dobyns (anos 1970), e as doze consequências dele |
| Nada sobre evidência empírica | Os **setores de Gauquelin** e por que eles não servem de prova (mas são interessantes) |

**Como ler os selos de grau.** Mesmo padrão dos arquivos 01–09:

| Selo | Significa |
|---|---|
| **[FP] FONTE PRIMÁRIA** | O texto antigo diz isso. Obra, livro e capítulo dados. |
| **[TP] TRADIÇÃO POSTERIOR** | Surgiu depois (medieval, renascentista, século XX), com autor e data conhecidos. Legítimo — só não é "o que os antigos diziam". |
| **[AM] ACADEMIA MODERNA** | Historiador ou pesquisador contemporâneo, com publicação identificável. |
| **[IR] INVENÇÃO RECENTE** | Circula sem lastro em fonte nenhuma que eu tenha achado. |
| **[DIS] DISPUTADO** | As próprias fontes divergem, ou os especialistas divergem. Digo quais. |

**Regra de ouro (a mesma dos outros arquivos).** Fonte inventada ou atribuída ao
autor errado é pior que ausência de fonte. Onde não cheguei, está escrito "não
verifiquei" — e a seção 12 lista tudo que ficou de fora.

**Nota sobre citações.** Ptolomeu na tradução Robbins (Loeb 1940, domínio
público via LacusCurtius) e Lilly (1647) são citados verbatim à vontade.
Fírmico e Valente aparecem em traduções inglesas **protegidas** (Bram 1975,
Riley) — deles cito no máximo uma frase curta, sempre entre aspas e com o
tradutor nomeado, e o resto é síntese minha. Obra moderna protegida (Rudhyar,
Sasportas, Greene, Dobyns) não tem citação nenhuma: só a **tese** do autor, com
minhas palavras.

---

## 1. A tese, em uma página

Existem **três camadas** históricas de significado para as casas, e o mercado
inteiro as serve misturadas, como se fossem uma só coisa chamada "a tradição".

| | **Camada A — Helenística** | **Camada B — Medieval/Renascentista** | **Camada C — Moderna** |
|---|---|---|---|
| **Quando** | séc. I a.C. – séc. VII d.C. | séc. IX – séc. XVII | 1890 – hoje |
| **Autores‑âncora** | Valente, Ptolomeu, Fírmico, Paulo, Retório | al‑Qabisi, Bonatti, **Lilly (1647)** | Alan Leo, Rudhyar, Dobyns, Greene/Sasportas |
| **O que uma casa É** | um **lugar** (*tópos*) no céu, definido pela relação geométrica com o Ascendente | um **tema de julgamento** (de quem é a pergunta, quem é o ladrão, quem é o pai) | um **campo de experiência** psicológica |
| **Hierarquia** | tripla: angularidade + configuração ao Asc + alegria planetária | angularidade + dignidade do regente | nenhuma — as doze são iguais e todas "importantes" |
| **Casas ruins** | sim, quatro delas, e a doutrina é explícita e central | sim, mais brandas | **não existem** — foram reenquadradas como "desafios de crescimento" |
| **De onde vem o significado** | geometria + alegrias + observação acumulada | herança grega filtrada pelo árabe e pelo latim | em grande parte do **signo correspondente** (o "alfabeto de 12 letras") |

**A frase que resume tudo:** na Camada A, o significado de uma casa deriva da
**posição dela em relação ao Ascendente**. Na Camada C, deriva do **signo de mesmo
número** (Casa 8 ↔ Escorpião, Casa 12 ↔ Peixes). São dois motores diferentes,
produzindo dois conjuntos de significados diferentes — e o segundo se apresenta
como sendo o primeiro.

**Por que isso é decisão de produto, não de erudição.** O app tem tela de mapa
astral e ela lista as doze casas (`screens/BirthChartScreen.js:197-222`). Hoje
ela não diz o que cada casa significa — e isso, por acaso, é a única razão de o
app ainda não estar errado. No dia em que essas células ganharem uma frase de
significado, essa frase vai pertencer a uma das três camadas, quer a gente
decida ou não. **Decidir e declarar é o diferencial; herdar sem saber é o
padrão do mercado.**

---

## 2. Os nomes — grego, latino, medieval, moderno

**[FP]** Tabela mestra. Os nomes gregos vêm da nota do tradutor de Ptolomeu
(F. E. Robbins, Loeb 1940, nota 56 ao Livro III, p. 273), que os lista
explicitamente ao comentar que Ptolomeu "*pays little attention to the system of
'places' or 'houses' so much used by the astrologers*" — observação que confirma
o item 7.4 do documento 03. Os latinos vêm de Fírmico, *Mathesis* II.XVI–XX
(trad. Bram). Os nomes medievais vêm do hexâmetro mnemônico latino; os modernos,
do uso corrente em português.

| # | Grego (Robbins, n. 56) | Transliteração / sentido | Latim (Fírmico II.XVI–XX) | Mnemônico medieval | Rótulo moderno em PT |
|---|---|---|---|---|---|
| 1 | ὡροσκόπος | *horoskópos*, "marcador da hora" | *Horoscopus*, **Vita** | *vita* | Casa do eu / da personalidade |
| 2 | Ἅιδου πύλη | *Háidou pýlē*, **Porta do Hades** | *Anafora*, **Spes** ("esperança") | *lucrum* | Casa dos recursos / do autovalor |
| 3 | Θεά | *Theá*, **a Deusa** (a Lua) | *Dea*, **Fratres** | *fratres* | Casa da comunicação |
| 4 | ὑπόγειον | *hypógeion*, "o subterrâneo" | *Imum Caelum*, **Parentes** | *genitor* | Casa do lar / das raízes / da mãe |
| 5 | ἀγαθὴ τύχη | *agathḕ týchē*, **Boa Fortuna** | *Bona Fortuna*, **Filii** | *nati* | Casa da criatividade / do romance |
| 6 | κακὴ τύχη | *kakḕ týchē*, **Má Fortuna** | *Mala Fortuna*, **Valetudo** | *valetudo* | Casa da rotina / da saúde / do trabalho |
| 7 | δύσις | *dýsis*, "o poente" | *Occasus / Descendens*, **Coniunx** | *uxor* | Casa dos relacionamentos |
| 8 | ἀρχὴ θανάτου | *archḕ thanátou*, **Começo da Morte** | *Epicatafora*, **Mors** | *mors* | Casa da transformação / sexo / recursos compartilhados |
| 9 | Θεός | *Theós*, **o Deus** (o Sol) | *Deus* | *pietas* / *iter* | Casa da filosofia / das viagens longas |
| 10 | μεσουράνημα | *mesouránēma*, "meio do céu" | *Medium Caelum* | *regnum* | Casa da carreira |
| 11 | ἀγαθὸς δαίμων | *agathòs daímōn*, **Bom Daimon** | *Bonus Daemon / Bonus Genius* | *benefacta* | Casa dos amigos / dos grupos |
| 12 | κακὸς δαίμων | *kakòs daímōn*, **Mau Daimon** | *Malus Daemon / Cacodaemon* | *carcer* | Casa do inconsciente / do karma |

**Três observações que valem o preço do documento inteiro:**

1. **Sete dos doze nomes gregos são juízos de valor, não temas.** "Boa Fortuna",
   "Má Fortuna", "Bom Daimon", "Mau Daimon", "Porta do Hades", "Começo da Morte",
   "Ocioso". A tradição antiga não tinha doze casas neutras: tinha um mapa moral
   do céu. A astrologia moderna apagou essa camada inteira e ninguém avisou o
   usuário.
2. **Nenhum dos nomes gregos é o nome de um signo.** Não há "casa de Áries",
   "casa de Escorpião". A equivalência casa↔signo é posterior (seção 6).
3. **[DIS] Os nomes medievais em hexâmetro.** A forma mais citada é *"Vita,
   lucrum, fratres, genitor, nati, valetudo, / uxor, mors, pietas, regnum,
   benefactaque carcer"*, com variantes que trocam *pietas* por *iter* e
   *benefacta* por *daemon*. **Não consegui rastrear a autoria nem a data desse
   verso em fonte primária** — encontrei-o em compilações modernas e enciclopédias.
   Registrado como mnemônico medieval de circulação larga, **não** como citação de
   um autor identificado. Ver seção 12.

**[FP] O ancestral direto do mnemônico está em Fírmico.** *Mathesis* II.XX.2
(trad. Bram) lista os lugares nesta ordem, com estes rótulos: *Vida, Esperança,
Dea ou Irmãos, Pais, Filhos, Saúde, Cônjuge, Morte, Deus, Medium Caelum, Bonus
Daemon, Malus Daemon*. É quase palavra por palavra a lista medieval, oito
séculos antes dela. A diferença que salta: onde o mnemônico medieval põe
*lucrum* (lucro) na 2ª, Fírmico põe **Esperança**; e onde o medieval põe *carcer*
(cárcere) na 12ª, Fírmico põe **Mau Daimon**.

---

## 3. As três hierarquias antigas — e a única que sobrou

A astrologia moderna tem **uma** hierarquia de casas (angular > sucedente >
cadente) e a aplica frouxamente. A helenística tinha **três**, cruzadas, e a
combinação delas é que produzia o significado.

### 3.1 Angularidade — de onde vem a força

**[FP]** *Kentra* (1, 4, 7, 10) > *epanaphorai* (2, 5, 8, 11) > *apoklimata*
(3, 6, 9, 12). Documentado em Paulo cap. 27 e detalhado no doc 03 §4. Isto mede
**potência**: quanto um planeta ali consegue realizar.

### 3.2 Configuração ao Ascendente — de onde vem a qualidade

**[FP]** Este é o eixo que a modernidade perdeu inteiro. Fírmico o enuncia com
uma clareza que não deixa margem. *Mathesis* II.XVII tem por título, na tradução
Bram, exatamente **"Unaspected Houses"** ("Casas sem aspecto"), e abre assim:

> "The remaining four houses are all feeble and debilitated because of the fact
> that they are not aspected to the ascendant."
> — Fírmico Materno, *Mathesis* II.XVII.1 (trad. Jean Rhys Bram, 1975).

As quatro são a 2ª (*Anafora* / Porta do Inferno), a 8ª (*Epicatafora*), a 6ª
(*Mala Fortuna*) e a 12ª (*Malus Daemon*). E Fírmico repete o critério **casa por
casa** ao descrevê-las em II.XIX — a 2ª "é chamada Porta do Inferno **porque não
é de modo algum aspectada ao ascendente**"; a 6ª é "passiva **porque não é
aspectada ao ascendente**"; a 8ª, idem; a 12ª, idem. Quatro vezes o mesmo
argumento, quatro vezes a mesma palavra.

**Por que 2, 6, 8, 12 e não outras.** Porque os aspectos antigos se contam entre
**signos inteiros** a partir do signo ascendente: 3 e 11 fazem sextil, 5 e 9 fazem
trígono, 4 e 10 fazem quadratura, 7 faz oposição. Sobram exatamente quatro signos
que não fazem aspecto nenhum. Estão em **aversão** (*apóstrophos*) — literalmente
de costas. (O mecanismo já está no doc 03 §5.4; o que este documento acrescenta é
que **Fírmico o declara explicitamente como o critério**, e não como dedução de
comentarista moderno.)

**Consequência prática, e é grande:** essa geometria **só fecha em Casas
Inteiras**. Num sistema de quadrante, a cúspide da Casa 8 pode cair num signo que
faz trígono com o signo ascendente, e a explicação dissolve. O app usa Casas
Inteiras (`lib/signs.js`, função `houses()` — linha 413 em 31/07/2026, mas o
arquivo está sendo editado por outra frente; **procurar pelo nome da função, não
pela linha**), então a explicação vale — o que é uma vantagem editorial concreta.

### 3.3 Alegrias planetárias — de onde vêm os nomes

**[FP]** Mercúrio na 1ª, Lua na 3ª, Vênus na 5ª, Marte na 6ª, Sol na 9ª, Júpiter
na 11ª, Saturno na 12ª. Fírmico confirma duas delas em texto corrido: a 5ª "é
chamada *Bona Fortuna* **porque é a casa de Vênus**" (II.XIX.6), a 6ª "é chamada
*Mala Fortuna* **porque é a casa de Marte**" (II.XIX.7), a 11ª "é a casa de
Júpiter" (II.XIX.12), a 12ª "é a casa de Saturno" (II.XIX.13). A tese de que os
**nomes derivam das alegrias** é de Chris Brennan (2013) e está documentada no
doc 03 §5.3 — aqui fica registrado que **Fírmico praticamente já diz isso**,
ligando nome e planeta na mesma frase, quatro vezes.

### 3.4 A tabela que cruza as três

Esta tabela não existe em nenhuma fonte antiga — é síntese minha a partir de
Paulo cap. 27, Fírmico II.XVI–XIX e das alegrias. **[AM/síntese própria.]**

| # | Angularidade | Configurada ao Asc? | Alegria | Veredicto antigo combinado |
|---|---|---|---|---|
| 1 | angular | é o próprio | Mercúrio | forte e bom |
| 2 | sucedente | **não (aversão)** | — | fraco e ruim |
| 3 | cadente | sim (sextil) | Lua | fraco mas bom |
| 4 | angular | sim (quadratura) | — | forte, ambivalente |
| 5 | sucedente | sim (trígono) | Vênus | médio e bom |
| 6 | cadente | **não (aversão)** | Marte | fraco e ruim |
| 7 | angular | sim (oposição) | — | forte, ambivalente |
| 8 | sucedente | **não (aversão)** | — | fraco e ruim |
| 9 | cadente | sim (trígono) | Sol | fraco mas bom |
| 10 | angular | sim (quadratura) | — | o mais forte |
| 11 | sucedente | sim (sextil) | Júpiter | médio e ótimo |
| 12 | cadente | **não (aversão)** | Saturno | fraco e o pior |

**O que se aprende olhando a coluna 3:** "cadente = fraca" é meia verdade. A 3ª e
a 9ª são cadentes **e boas** — Fírmico chama a 9ª de casa do Deus Sol e diz que
ela é "importantly aspected to the ascendant in trine aspect" (II.XIX.10). A
força e a qualidade eram **eixos independentes**. Reduzir tudo a "casas cadentes
são fracas", como o mercado faz, é perder metade da doutrina.

---

## 4. A doutrina dos lugares inoperantes

Esta é a seção que nenhum concorrente tem, e é o núcleo técnico do sistema
antigo. O vocabulário primeiro, porque ele é confuso e as traduções variam.

### 4.1 As palavras

| Termo grego | Sentido literal | Como aparece nas traduções |
|---|---|---|
| ἀργός (*argós*) | ocioso, sem trabalho | "idle place", "inactive place", *locus otiosus* |
| ἄπρακτος (*ápraktos*) | que não realiza, improdutivo | "inoperative", "ineffective" |
| χρηματιστικός (*chrēmatistikós*) | que faz negócio, que rende | "busy place", "profitable place", "advantageous" |
| ἀποστρόφος (*apóstrophos*) | virado de costas | "in aversion", "disjunct", "unaspected" |
| ἀφετικός (*aphetikós*) | que solta, que lança | "prorogative", "aphetic" |

**[AM]** Robert Schmidt, em *House Division, Planetary Strength, and Cusps in
Hellenistic Astrology*, descreve os *chrematistikoi* como "*signs in which the
planets had enough activity to conduct their business*" — e adverte que o termo é
**ambíguo** e que ele próprio não tem certeza da interpretação. Registro a
ressalva dele junto com a definição; é honesto e evita que o app afirme mais do
que a academia afirma.

### 4.2 A versão de Ptolomeu — a lista mais restritiva que existe

**[FP]** *Tetrabiblos* III.10 ("On the Length of Life"), trad. Robbins, Loeb
1940, p. 273–275 (domínio público, LacusCurtius). Ptolomeu está definindo quais
lugares podem abrigar o **prorrogador** (o planeta que "lança" a duração da
vida), e ao fazer isso publica de fato uma lista de lugares operantes:

> "…namely, the twelfth part of the zodiac surrounding the horoscope, from 5°
> above the actual horizon up to the 25° that remains, which is rising in
> succession to the horizon; the part sextile dexter to these thirty degrees,
> called the House of the Good Daemon; the part in quartile, the mid‑heaven; the
> part in trine, called the House of the God; and the part opposite, the
> Occident."

Traduzido no que interessa: **1ª, 11ª, 10ª, 9ª e 7ª**. Cinco lugares. E ele
ordena a força deles: primeiro o meio-do-céu, depois o oriente, depois a 11ª,
depois a 7ª, depois a 9ª.

E então exclui o resto, com motivo:

> "…for the whole region below the earth must, as is reasonable, be disregarded
> when a domination of such importance is concerned, except only those parts
> which in the ascendant itself are coming into the light. Of the part above the
> earth it is not fitting to consider either the sign that is disjunct from the
> ascendant, nor that which rose before it, called the House of the Evil Daemon,
> because it injures the emanation from the stars in it to the earth and is also
> declining…"

**[FP]** E há um detalhe filológico que fecha o argumento: no ponto em que
Ptolomeu diz "o signo disjunto do ascendente" (a 8ª), **um manuscrito acrescenta
na margem** `ὃ λέγεται τόπος ἀργός` — "que é chamado o Lugar Ocioso". Robbins
registra o acréscimo no aparato crítico e o considera provavelmente um escólio
que entrou no texto (nota 57 à p. 275). Ou seja: mesmo não sendo de Ptolomeu, é
um leitor antigo do próprio Ptolomeu confirmando que a 8ª tinha esse nome.

**O que Ptolomeu está dizendo, em português direto:** de doze lugares, **sete são
inoperantes** para o propósito mais grave da astrologia antiga. Tudo abaixo da
terra (2, 3, 4, 5, 6 — mais a parte já submersa da 1ª), mais a 8ª (em aversão) e
a 12ª (cadente, "declinante", e obscurecida pelas exalações da terra). A razão que
ele dá para a 12ª nem é simbólica: é **óptica**. A luz das estrelas ali atravessa
mais atmosfera e chega degradada.

### 4.3 A versão de Fírmico — a mais explícita, e a mais dura

**[FP]** *Mathesis*, Livro VI, cap. I (trad. Bram). Fírmico repete o critério de
aversão e depois faz algo que nenhuma outra fonte faz: **dá um conselho pastoral
ao astrólogo**.

> "The second and eighth houses have no connection with the ascendant; the sixth
> and the twelfth houses are dejected and have no relationship to the ascendant."
> (VI.I.4)

> "You should pray in every possible way that the chart you are working on should
> not have planets either malefic or benefic in the sixth or twelfth houses; or
> in the second or eighth. For these houses are always filled with hostile
> influences from all planets." (VI.I.6)

E o mecanismo, que é o ponto mais fino de toda a doutrina:

> "If a benefic planet occupies these houses it loses its salutary power; if a
> malefic, its injurious influence is increased." (VI.I.7)

**Isto não é "casa difícil".** É uma assimetria: o lugar inoperante **desliga o
benéfico e amplifica o maléfico**. Não há compensação possível dentro dele. Não
existe nada remotamente parecido na astrologia moderna, que trata as casas 6, 8 e
12 como "áreas de crescimento".

**Uma exceção que Fírmico registra, e que vale citar porque é surpreendente.**
Ele diz que nenhum planeta se alegra na 8ª **exceto a Lua**, e só em mapas
noturnos: Lua crescente na 8ª, à noite, sem maléficos em aspecto e com Júpiter em
trígono ou sextil, prenuncia "the greatest good fortune and riches beyond
measure" (II.XIX.9). O sistema tinha portas de saída. Elas eram estreitas e
condicionais, mas existiam.

### 4.4 A versão de Valente — graus operantes, não casas

**[FP]** Valente, *Anthologiae* III.2 (trad. Riley). Aqui a doutrina muda de
objeto: em vez de dizer que quatro **casas** são inoperantes, Valente divide cada
quadrante em três e diz que o **primeiro terço** a partir de cada ângulo tem
graus "operativos" e o resto tem graus "inoperativos e impropícios". Ele dá um
exemplo numérico completo (Asc em Peixes 13°, MC em Sagitário 22°) e credita o
método a um autor chamado **Órion**.

Depois ele propõe um refinamento próprio, que acha "more scientific": primeiro
terço **operante e potente**, segundo terço **médio**, terceiro terço
**produtor de crise e ruim**.

**Por que isso importa.** Valente está medindo **força**, não atribuindo
**tópicos** — exatamente a distinção que Schmidt defende e que o doc 03 §6.11
registra. Ou seja: a mesma palavra ("inoperante") aparece em dois níveis
diferentes do sistema, e confundi-los é fácil. **Lugar inoperante** (Fírmico,
Ptolomeu) = casa em aversão ao Ascendente. **Grau inoperante** (Valente) = posição
dentro do quadrante, longe do ângulo.

Valente também usa a expressão **"the Inactive and Shadowy Place"** ao listar
onde os efeitos de uma configuração ruim são piores, ao lado do Mau Daimon (XII)
e da Má Fortuna (VI) — *Anthologiae* II (trad. Riley). O vocabulário é
consistente com o de Ptolomeu.

### 4.5 As três listas antigas NÃO batem — e isso é o achado

Este quadro é síntese própria e, até onde procurei, não está montado em lugar
nenhum. **[AM/síntese própria.]**

| Critério | Casas boas / operantes | Casas ruins / inoperantes |
|---|---|---|
| **Ptolomeu III.10** (prorrogação) | 1, 7, 9, 10, 11 | **todas as outras sete**, com menção nominal à 8ª e à 12ª |
| **Fírmico II.XVII + VI.I** (aversão) | 1, 3, 4, 5, 7, 9, 10, 11 | **2, 6, 8, 12** |
| **Angularidade** (Paulo cap. 27) | 1, 4, 7, 10 fortes; 2, 5, 8, 11 médias | **3, 6, 9, 12** fracas |
| **Alegrias** (Trasilo, Manílio em diante) | 1, 3, 5, 9, 11 | 6, 12 |

Repare que a **9ª** é operante para Ptolomeu, boa para Fírmico, **fraca** pela
angularidade e ótima pela alegria do Sol. E a **4ª** é ruim para Ptolomeu (está
abaixo da terra), boa para Fírmico (faz quadratura com o Asc) e forte pela
angularidade.

**A conclusão honesta:** não existe "a lista das casas ruins na tradição". Existem
**quatro doutrinas concorrentes**, que os autores antigos aplicavam a propósitos
diferentes. Qualquer texto que diga "os antigos consideravam as casas 6, 8 e 12
as casas más" está simplificando três sistemas em um. A formulação segura para o
app é: *"a tradição tinha mais de um critério para classificar as casas, e eles
não davam sempre o mesmo resultado."*

### 4.6 O que a modernidade fez com isso: nada

**[TP]** A astrologia moderna **não tem** doutrina de lugares inoperantes. A
angularidade sobreviveu, enfraquecida e frequentemente reinterpretada em chave
psicológica ("casas cadentes são as da mente"). A aversão desapareceu. As
alegrias foram redescobertas só nos anos 1990–2010, com a revalorização
helenística.

Isso não é acidente nem esquecimento: é **decisão editorial** da reforma
teosófica (seção 7). Alan Leo e seus sucessores estavam vendendo astrologia como
ferramenta de autoconhecimento e crescimento, para um público de classe média
vitoriana e depois para o mercado de massa. Uma doutrina que diz "reze para que
não haja planeta nenhum nesta casa" não cabe nesse produto. As casas ruins não
foram refutadas — foram **desativadas comercialmente**.

Dizer isso no app é útil e é verdade. Não como denúncia: como informação. *"A
astrologia antiga tinha casas que eram simplesmente ruins. A moderna não tem —
ela reenquadrou essas casas como áreas de crescimento. Foi uma escolha do século
XX, não uma descoberta."*

---

## 5. Casa a casa

Formato fixo em cada uma: **[A] Antigo** (Camada A, com fonte) · **[B]
Medieval/Renascentista** (Lilly 1647) · **[C] Moderno** (com autor/mecanismo
quando rastreável) · **Δ** o delta em uma linha · **📱** frase pronta e defensável
para o app.

> Sobre as citações de Lilly: são de *Christian Astrology* (Londres, 1647),
> Livro I, "Of the twelve Houses, their Nature and Signification", consultado na
> transcrição da Skyscript. A grafia foi **modernizada** na transcrição que li —
> registro isso porque o original de 1647 escreve *cattell*, *brethren*,
> *embassadors* etc. **Não confiro grafia original**; ver seção 12.

---

### Casa 1 — *Horoskopos* / Vita

**[A] [FP]** Paulo: "a origem e o fundamento", "o leme" (*oíax*), doador de vida e
sopro (cap. 24 — verbatim no doc 03 §3.1). Fírmico: "In this house is to be found
the life and vital spirit of men; from this house the basic character of the
entire nativity is determined… the cornerstone and basis of the whole nativity"
(II.XIX.2, trad. Bram). Alegria de **Mercúrio**. Angular.

**[B] [TP]** Lilly, 1647: "signification of the life of man, of the stature,
colour, complexion, form and shape". Consignificadores: **Áries e Saturno**.
Sue Ward (2002) acrescenta a lógica da alegria: Mercúrio se alegra aí "because of
its association with the head, brain and tongue".

**[C] [TP]** "A máscara", "como o mundo te vê", "a persona", "a primeira
impressão". Camada psicológica do séc. XX. Mecanismo do alfabeto de 12 letras:
1ª ↔ Áries ↔ Marte → iniciativa, impulso, ação, "o guerreiro".

**Δ** Antigo: o Ascendente é o **eixo estrutural** do mapa — o ponto zero de
onde tudo se conta. Moderno: é a **aparência social**. A diferença não é de
ênfase, é de função: a leitura antiga é arquitetônica, a moderna é
caracterológica.

**📱** *"O Ascendente é o leme do mapa. Nas fontes antigas ele não é 'como o
mundo te vê' — é 'a origem e o fundamento', o ponto de onde todas as casas são
contadas. A leitura de 'máscara social' é do século XX e é legítima, só é
posterior."*
(⚠️ O app já usa a leitura moderna em `lib/i18n.js:335` — `'birthchart.row.asc.desc':
'Como o mundo te vê'`. Está anotado no doc 03 §7.14 e não é erro; é escolha.)

---

### Casa 2 — Porta do Hades / *Anafora*

**[A] [FP]** **A casa mais desfigurada pela modernidade.** Fírmico: mostra
"increase in personal hopes and in material possessions", **mas** é casa passiva,
"called the Gate of Hell, because it is not in any way aspected to the ascendant"
(II.XIX.3). Valente, sobre o II Lugar: "In this Place the benefics do no good, the
malefics make men sluggish and injured" (II, trad. Riley) — e desfia uma lista
sombria: carcereiros, gente que vive nas celas, ocupações públicas
desonrosas. Paulo: sustento e modo de vida, mas também perda de bens com
maléficos. Fírmico a chama de **Spes**, "Esperança". Sem alegria planetária.

**[B] [TP]** Lilly: "estate or fortune of him that asks the question, of his
wealth or poverty, of all movable goods". Puro e simples: dinheiro e bens móveis.
A carga infernal do nome já saiu quase toda.

**[C] [IR/TP]** "Autoestima", "autovalor", "meus valores", "o que eu valorizo",
"minha relação com o dinheiro". A virada de *bens* para *valores* é jogo de
palavras moderno em inglês (*values* = valores morais e valor monetário) e não
tem paralelo em fonte antiga nenhuma que eu tenha lido. Mecanismo do alfabeto:
2ª ↔ Touro ↔ Vênus → posse, prazer, estabilidade, autovalor.

**Δ** Antigo: **Porta do Hades**, lugar em aversão, onde os benéficos não
funcionam. Moderno: casa da autoestima. É provavelmente a maior inversão de
sinal de todo o zodíaco.

**📱** *"O nome antigo da Casa 2 era 'Porta do Hades'. Ela tratava de sustento
material — e era um dos quatro lugares que não fazem aspecto com o signo do seu
Ascendente, o que a tradição considerava um problema. 'Autoestima' é leitura do
século XX."*

---

### Casa 3 — a Deusa / *Dea*

**[A] [FP]** Fírmico: "From this house we will predict everything that concerns
**brothers and friends**… but it is also the house of **travelers**. This is the
first of the houses to be joined to the ascendant by a weak aspect" (II.XIX.4).
Paulo põe aqui **amizade e patrocínio** e **viver no estrangeiro**. Valente, na
tabela dos Nove Nomes, dá à Deusa **a mãe**. Alegria da **Lua**. Cadente, mas
configurada por sextil.

**[B] [TP]** Lilly: "brethren, sisters, cousins or kindred, neighbours, small
journeys". Aqui aparece a divisão que virou padrão: **viagens curtas na 3ª,
viagens longas na 9ª**. Sue Ward endurece o critério tradicional: o que define não
é a duração, é o **estrangeiro** — "Journeys to foreign countries are a matter for
the 9th house, regardless of how long the trip takes".

**[C] [TP]** "Comunicação", "mente concreta", "aprendizado básico", "redes
sociais", "o irmão". Mecanismo do alfabeto: 3ª ↔ Gêmeos ↔ Mercúrio →
comunicação, informação, mente. **[AM]** Brennan observa que a associação antiga
da 3ª é com a **Lua** (alegria) e não com Mercúrio, e que a coincidência temática
com "viagem curta" é justamente isso — coincidência entre dois motores
conceituais distintos.

**Δ** Antigo: casa da **Lua**, dos irmãos, da **amizade** e do **viver fora**.
Moderno: casa de **Mercúrio**, da comunicação. Trocou-se o planeta padroeiro e,
com ele, o eixo semântico inteiro. E **amizade** — que Paulo põe aqui — migrou
para a 11ª.

**📱** *"Na tradição antiga a Casa 3 é 'a Deusa', a casa onde a Lua se alegra. Ela
trata de irmãos, amizade e de viver no estrangeiro. 'Comunicação' vem da
associação moderna com Gêmeos e Mercúrio."*

---

### Casa 4 — *Hypógeion* / Imum Caelum

**[A] [FP]** Fírmico é **taxativo e não fala em pai**: "This house shows us family
property, substance, possessions, household goods, anything that pertains to
hidden and recovered wealth" (II.XIX.5). Fírmico rotula a casa de **Parentes**
(II.XX.2) mas, ao descrevê-la, trata de **patrimônio**. Paulo: velhice, o **fim da
vida**, o corpo depois de morto, terras, fundações, pais, pátria, casa,
permanência, navios. Angular.

**[FP] E aqui está o achado que resolve a briga toda:** em Fírmico, os **pais não
vêm de casa nenhuma — vêm de planetas**. Fechando o capítulo dos doze lugares
(II.XIX.13): "The Sun gives definite information about the father in the
nativities of both men and women, the Moon about the mother, Venus about the
wife, Mars about the husband." Ptolomeu faz o mesmo (*Tetr.* III.4). Valente,
por sua vez, põe **pai no IX** e **mãe no III**. Ou seja: na Camada A há **pelo
menos três esquemas concorrentes** para os pais, e o "4ª = pai" nem é o dominante.

**[B] [TP]** Lilly, 1647: "**fathers** in general and ever of his father that
enquires, or that is born; of lands, houses, tenements, inheritances". Aqui sim,
**4ª = pai**, e a 10ª = mãe. Essa é a doutrina que a astrologia tradicional/horária
usa até hoje (Sue Ward, 2002: "the 4th house signifies the father and the 10th
house the mother").

**[C] [TP/IR]** **A inversão.** A astrologia moderna dá **4ª = mãe** e **10ª =
pai**. Sue Ward identifica o mecanismo exato: se você deixa Câncer (signo
feminino, regido pela Lua) "reger" a 4ª pelo alfabeto de 12 letras, a casa vira
maternal por dedução — e o pai é empurrado para a 10ª porque a 10ª é autoridade.
Somam-se a isso "lar", "raízes", "família de origem", "a base emocional" e,
na chave psicológica, "a criança interior".

**Δ** Antigo: **patrimônio, terra, fundações e o fim das coisas**, com os pais
vindo de planetas ou de outras casas. Renascentista: **pai**. Moderno: **mãe**.
Três respostas diferentes para a mesma pergunta, em três camadas.

**📱** *"Casa 4 e pais é um caso em que a tradição briga consigo mesma: Fírmico
(séc. IV) tira os pais dos planetas, não das casas; Valente põe o pai na 9ª e a
mãe na 3ª; Lilly (1647) põe o pai na 4ª e a mãe na 10ª; a astrologia moderna
inverteu para mãe na 4ª. A gente diz qual está usando."*

---

### Casa 5 — Boa Fortuna / *Bona Fortuna*

**[A] [FP]** Fírmico: "From this house is discovered the number of children and
their sex. It is called *Bona Fortuna* **because it is the house of Venus**…
aspected very powerfully to the ascendant, namely, in trine" (II.XIX.6). Paulo:
**filhos**. Valente, na tabela dos Nove Nomes: **casamento** (!). Alegria de
**Vênus**. Sucedente, em trígono com o Asc.

**[B] [TP]** Lilly: "children, of embassadors, of the state of a woman with child,
of banquets". Sue Ward acrescenta a lógica das casas derivadas: a 5ª é a 2ª a
partir da 4ª, logo rege **os bens móveis do pai**.

**[C] [TP]** "Criatividade", "autoexpressão", "romance", "prazer", "o palco",
"a criança interior". Mecanismo do alfabeto: 5ª ↔ Leão ↔ Sol → expressão,
espetáculo, brilho, o eu criativo.

**Δ** Antigo: **filhos** (e, em Valente, casamento). Moderno: **criatividade e
romance**. "Criatividade" não aparece em fonte antiga nenhuma que eu tenha lido —
é dedução a partir de Leão.

**📱** *"Casa 5 é 'Boa Fortuna', o lugar onde Vênus se alegra. A tradição a liga a
filhos — Valente, no século II, chegava a ligá-la a casamento. 'Criatividade e
autoexpressão' vem da associação moderna com Leão e o Sol."*

---

### Casa 6 — Má Fortuna / *Mala Fortuna*

**[A] [FP]** Fírmico: "In this house we find the cause of physical infirmities and
sickness. This house is called *Mala Fortuna* because it is the house of Mars.
This is also a **passive** house because it is not aspected to the ascendant"
(II.XIX.7). E registra a única saída: o azar pode ser removido se um planeta ali
estiver em bom aspecto com um planeta na 10ª. Valente, VI Lugar / Lugar de Marte:
"If benefics happen to be in this Place, the native will lose whatever he
possesses" — benéfico ali **prejudica**. Paulo: **ferimento/dano**, escravas,
inimizades vindas delas. Alegria de **Marte**. Cadente **e** em aversão: a pior
combinação depois da 12ª.

**[B] [TP]** Lilly: "men and maid-servants, galley slaves, hogs, sheep, goats,
hares, conies… sickness, its quality and cause". **Aqui nasce o critério dos
animais pequenos** — a lista de Lilly é de bichos de granja. Sue Ward formaliza:
6ª = animais **até o tamanho de uma cabra**; 12ª = animais **maiores que uma
cabra**.

> **Isto responde uma pergunta que o doc 03 deixou aberta.** O doc 03 §7.16
> registra que Paulo põe os **quadrúpedes na 12ª**, não na 6ª, e diz "não achei
> fonte antiga" para a divisão animais pequenos/grandes. **Achei a fonte: é a
> camada B, Lilly 1647 e a tradição horária que o segue.** Não é helenística, e
> não é invenção de internet — é renascentista.

**[C] [TP/IR]** "Rotina", "hábitos", "trabalho diário", "saúde e bem-estar",
"organização", "pets". Mecanismo do alfabeto: 6ª ↔ Virgem ↔ Mercúrio → método,
detalhe, higiene, serviço. Sue Ward objeta com precisão: "It is often said that
this is the house of **service**, however, it has more to do with **servitude and
toil**".

**Δ** Antigo: **Má Fortuna** — dano, doença, servidão, um dos quatro lugares em
que benéfico não funciona. Moderno: **rotina e autocuidado**. Doença sobreviveu;
tudo o mais mudou de sinal.

**📱** *"O nome antigo da Casa 6 é 'Má Fortuna' — é onde Marte se alegra, e trata
de dano, doença e trabalho servil. 'Rotina e bem-estar' é leitura moderna, vinda
da associação com Virgem."*

---

### Casa 7 — *Dýsis* / Occasus

**[A] [FP]** Fírmico: "From this house we shall inquire as to the nature and
number of **marriages**. But this house is aspected **most detrimentally** to the
ascendant, for it is in **opposition**" (II.XIX.8). Paulo: preparativos de
casamento, longas estadas no estrangeiro **e a qualidade da morte**. Valente
chama-o de Lugar do Descendente e liga-o a relacionamentos e parcerias. Angular —
e Ptolomeu o inclui entre os cinco lugares afetivos (III.10). Sem alegria.

**[B] [TP]** Lilly: "marriage, and describes the person inquired after… all manner
of love questions, **our public enemies**". Sue Ward é explícita sobre a leitura
mortal: em oposição ao Ascendente (o corpo), a 7ª "poses a threat to the querent
or native and so is connected with **war and death**" — e faz questão de negar a
leitura moderna: "It is **not** the house of 'the unknown other'".

**[C] [TP]** "O outro", "o espelho", "a projeção da sombra", "a alma gêmea",
"parcerias", "o que eu não integro em mim e vejo no outro". A leitura junguiana da
7ª como **projeção** é a contribuição mais característica da Camada C aqui.
Mecanismo do alfabeto: 7ª ↔ Libra ↔ Vênus → harmonia, equilíbrio, o par.

**Δ** Antigo: casamento **e a qualidade da morte**, e o lugar geometricamente mais
hostil ao Ascendente. Moderno: **o espelho da alma**. A morte sumiu; a hostilidade
virou "tensão criativa"; e o inimigo público de Lilly virou "o outro".

**📱** *"A Casa 7 é o pivô poente. A tradição a liga a casamento, sim — mas o mesmo
Paulo de Alexandria diz que ela indica 'a qualidade da morte', porque é onde o Sol
se põe. E Fírmico observa que ela é o lugar mais adverso ao Ascendente, por
oposição."*

---

### Casa 8 — Começo da Morte / *Epicatafora* / o **Lugar Ocioso**

**[A] [FP]** A casa emblemática deste documento. Fírmico: "This house is called
*Epicatafora*. It is, however, a **passive** house, since it is not in aspect to
the ascendant. From this house is discovered the **kind of death**" (II.XIX.9).
Valente encabeça o capítulo com **"The VIII Place of Death"** e é impiedoso:
"Benefics appearing in this place are ineffectual and weak, and they do not bestow
their proper benefits". Paulo: o "**Ocioso**" (*argós*), "a completude da vida",
lucro vindo de mortes e heranças. Ptolomeu exclui a 8ª da prorrogação por ser
"disjunct from the ascendant", e um escoliasta anota na margem `τόπος ἀργός`. Sem
alegria — **exceto** a Lua crescente em mapa noturno (Fírmico II.XIX.9).

**[B] [TP]** Lilly: "estate of men deceased, death, its quality and nature; the
wills, legacies… **dowry of the wife, portion of the maid**". Aqui nasce
"recursos compartilhados": pela lógica de casas derivadas, a 8ª é a **2ª a partir
da 7ª** — os bens do cônjuge. É raciocínio medieval/renascentista, não
helenístico.

**[C] [IR]** "Transformação", "morte e renascimento psicológico", "sexo", "tabu",
"o oculto", "poder", "intimidade profunda". O mecanismo está documentado com
todas as letras. Sue Ward (2002) o descreve sem meias palavras:

> "So, we then have Pluto gaining rulership of the 8th house absorbing
> signification from the 8th, for example, death. From the same error we see the
> 8th house associated with **sexual activity because Scorpio rules the sexual
> organs and is the eighth sign**."

A cadeia completa: Plutão descoberto em **1930** → atribuído a Escorpião → 8ª ↔
Escorpião pelo alfabeto de 12 letras → 8ª herda Plutão → Plutão é morte,
transformação e poder → **8ª = transformação**; e, em paralelo, Escorpião rege os
órgãos sexuais na melotesia por signo (doc 01, Homem Zodiacal) → **8ª = sexo**.
Duas inferências encadeadas sobre uma premissa moderna, apresentadas como
tradição milenar.

**Δ** Antigo: **morte, herança e ociosidade** — o lugar onde benéfico não
funciona. Moderno: **sexo e transformação psicológica**. Nenhuma fonte antiga que
eu tenha lido liga a 8ª a sexo.

**📱** *"O nome antigo da Casa 8 é 'Começo da Morte', e Paulo de Alexandria a
chama de 'o Ocioso' — porque ela não faz aspecto nenhum com o signo do
Ascendente. Ela tratava de morte e de herança. 'Sexo e transformação' veio depois
de 1930, quando Plutão foi associado a Escorpião e Escorpião foi equiparado à
Casa 8."*

---

### Casa 9 — o Deus / *Deus*

**[A] [FP]** Fírmico: "It is also the house of the **Sun God**. In this house we
find the **social class** of men. It also has to do with **religion and foreign
travel**. This house is importantly aspected to the ascendant in **trine**"
(II.XIX.10). Valente é o mais rico: "friendship, travel, benefits from foreign
things. It's the place of God, king, sovereign; **astrology**, oracular decrees,
the appearance of gods, **divination**; mystical or occult matters; fellowship".
Fírmico ainda liga a 9ª a ofícios de templo, incluindo adivinhação pelos astros.
Alegria do **Sol**. Cadente, mas em trígono — a melhor das cadentes.

**[B] [TP]** Lilly: "voyages or long journeys beyond seas; of religious men, or
clergy". Sue Ward: viagem ao **estrangeiro** independentemente da duração;
conhecimento; sonhos e visões; e a nota de que Lilly se contradiz sobre advogados
entre a 9ª e a 10ª (*CA* pp. 403–404 e 630).

**[C] [TP]** "Filosofia", "ensino superior", "expansão de horizontes", "sentido
da vida", "estrangeiro". Mecanismo do alfabeto: 9ª ↔ Sagitário ↔ Júpiter →
expansão, otimismo, o professor.

**Δ** Esta é a casa em que **o antigo e o moderno mais se parecem** — e vale dizer
isso, porque credibilidade se constrói também admitindo quando o mercado acerta.
As diferenças são de sotaque: o antigo é mais **religioso e divinatório** (é a
casa da própria astrologia) e mais **estamental** (classe social); o moderno é mais
**acadêmico** (universidade, filosofia).

**📱** *"A Casa 9 é 'a casa do Deus', onde o Sol se alegra. Valente, no século II,
listava aqui a religião, a adivinhação — e a própria astrologia. A leitura moderna
de 'filosofia e ensino superior' é uma versão secular da mesma coisa."*

---

### Casa 10 — *Mesouránēma* / Medium Caelum

**[A] [FP]** Fírmico: "This place is the first in importance and has the greatest
influence of all on the angles… In this house we find life and vital spirit, all
our **actions**, **country**, **home**, all our dealings with others,
**professional careers**… From this house we easily see the **infirmities of the
mind**" (II.XIX.11). Paulo dá ao 10º *praxis* (ação), reputação e valor — e
também casamento e filhos varões. Ptolomeu o põe em **primeiro lugar** entre os
prorrogativos. Angular, em quadratura com o Asc. Sem alegria.

**⚠️ E o alerta que o doc 03 §6.9 já levanta:** em Casas Inteiras **o
Meio-do-Céu não é a cúspide da Casa 10**. Paulo cap. 30 avisa que o grau
culminante cai às vezes na 9ª e às vezes na 11ª; o doc 03 mediu 40,8% em Lisboa e
22,0% em São Paulo. Portanto, ao escrever sobre a Casa 10, o app está falando do
**décimo signo a partir do ascendente** — não necessariamente de onde está o MC.

**[B] [TP]** Lilly: "kings, princes, dukes, earls, judges… **mothers**, honour,
preferment, dignity, office". Sue Ward: ocupação diária (*exercitation*),
autoridade sobre o nativo, e — pela oposição à 4ª do pai — **a mãe**.

**[C] [TP]** "Carreira", "vocação", "propósito profissional", "imagem pública",
"o pai", "ambição". Mecanismo do alfabeto: 10ª ↔ Capricórnio ↔ Saturno →
estrutura, ambição, autoridade, o pai.

**Δ** Antigo: **ação** (*praxis*) — o que você faz no mundo, incluindo pátria e
lar, que hoje ninguém coloca na 10ª. Moderno: **carreira** no sentido de emprego e
LinkedIn. E a mãe virou pai.

**📱** *"A Casa 10 é o topo do mapa. A palavra grega para o que ela rege é
*praxis* — ação, o que você faz. 'Carreira' é uma tradução moderna e estreita
disso: Fírmico incluía aqui também a pátria e a casa."*
(⚠️ `lib/chatResponses.js:27` já diz *"Carreira costuma se conectar com a Casa 10 e
com Saturno no mapa"* — **sustentado por fonte**, e o doc 03 §8.2(g) já o
aprovou. Fica confirmado aqui por Fírmico II.XIX.11.)

---

### Casa 11 — Bom Daimon / *Bonus Daemon*

**[A] [FP]** Fírmico: "It is called the *Bonus Daemon* or *Bonus Genius*, by the
Greeks *Agathos Daemon*… it is, furthermore, the **house of Jupiter**, and not
indifferently aspected to the ascendant; it can be seen to be in **sextile**"
(II.XIX.12). Valente: benéficos aí "make men illustrious and rich from youth".
Paulo: **aliança e patrocínio**, boas expectativas. Valente, na tabela dos Nove
Nomes: **filhos**. Ptolomeu a inclui entre os prorrogativos, chamando-a pelo nome
grego. Alegria de **Júpiter**. Sucedente, em sextil.

**[B] [TP]** Lilly: "friends and friendship, hope, trust, confidence… the praise
or dispraise of any one". Sue Ward acrescenta a derivação: a 11ª é a **2ª a partir
da 10ª**, logo mostra "the resources of the person in command".

**[C] [TP]** "Amigos, grupos, comunidades, causas, humanidade, o coletivo, redes
sociais, esperanças e desejos". Mecanismo do alfabeto: 11ª ↔ Aquário ↔ Urano →
coletivo, tecnologia, revolução, o grupo. A carga **política/humanitária** da 11ª
moderna é inteiramente uraniana e, portanto, pós-1781 no melhor dos casos e do
século XX na prática.

**Δ** Antigo: **Bom Daimon** — o bom espírito, boas expectativas, patrocínio, e
onde Júpiter se alegra. Moderno: **redes e ativismo**. E, como o doc 03 §7.17
observa, **Paulo põe amizade na 3ª**, não na 11ª.

**📱** *"O nome antigo da Casa 11 é 'Bom Daimon' — o bom espírito. É onde Júpiter
se alegra, e a tradição a liga a patrocínio, aliados e boas expectativas.
'Amigos e grupos' é consolidação posterior: Paulo de Alexandria punha a amizade na
Casa 3."*

---

### Casa 12 — Mau Daimon / *Cacodaemon*

**[A] [FP]** A segunda casa emblemática deste documento. Fírmico: "This house the
Greeks call *Cacos Daemon*; we call it *Malus Daemon*. From this house is easily
determined the nature of **enemies** and the character of **slaves**. Also we find
**defects and illnesses** in this house. But it is a **passive** house because it
is not aspected to the ascendant. It is, moreover, the **house of Saturn**"
(II.XIX.13). Valente, V Lugar do Mau Daimon: maléficos ali "will cause great
wounds and traumas"; inimigos "from the moment of birth"; benéficos ali não
concedem benefício nenhum; os que "estendem a mão" pedindo esmola. Paulo:
sofrimentos, **parto**, inimigos, escravos varões, **quadrúpedes**. Ptolomeu a
exclui nominalmente — e a razão que dá é **atmosférica**: a exalação úmida e
espessa da terra turva a luz das estrelas ali. Alegria de **Saturno**. Cadente **e**
em aversão: o pior lugar do mapa pelos dois critérios simultâneos.

**[B] [TP]** Lilly: "private enemies, of witches, **great cattle**… sorrow,
tribulation, imprisonments". Sue Ward acrescenta mosteiros, cativeiro, prisões — e
a definição afiada de inimigo oculto: "usually people who the native or querent
**considers to be friends**".

**[C] [IR/TP]** "Inconsciente", "karma", "vidas passadas", "espiritualidade",
"o oculto interior", "autossabotagem", "o inconsciente coletivo". Aqui a genealogia
é rastreável em três saltos:
1. **Alan Leo (1860–1917)**, teosofista, injeta **karma e reencarnação** na
   astrologia inglesa (*Esoteric Astrology*, 1913). O doc 01 §546 já registra o
   papel dele. Karma entra no vocabulário — e a 12ª, sendo a casa dos
   sofrimentos, é o destino natural dele.
2. **Dane Rudhyar**, *The Astrology of Personality* (1936) e *The Astrological
   Houses: The Spectrum of Individual Experience* (1972), reformula as casas como
   **campos de experiência** e não como zonas de eventos, sob influência
   junguiana explícita. Num artigo dele de 1966 (*Horoscope Magazine*, outubro),
   a 12ª aparece como o teste de **encerrar um ciclo** e soltar o passado.
3. **Liz Greene** e **Howard Sasportas** consolidam a leitura psicológica no
   Centre for Psychological Astrology; *The Twelve Houses* (Sasportas, 1985)
   vira o livro de referência do assunto em inglês e é onde a 12ª como
   **inconsciente coletivo** se torna padrão de mercado.

Somado a isso, o mecanismo do alfabeto: 12ª ↔ Peixes ↔ Netuno → dissolução,
nebulosidade, transcendência, inconsciente.

**"Self-undoing" (autossabotagem):** **[DIS]** aparece consolidado na literatura
astrológica inglesa do século XX e é frequentemente atribuído à tradição do século
XIX (Raphael, Zadkiel). **Não consegui rastrear a primeira ocorrência em fonte
primária datada.** Ver seção 12. Não escrever data.

**Δ** Antigo: **Mau Daimon** — inimigos, escravos, doença, prisão, quadrúpedes; o
lugar onde Saturno se alegra e onde benéfico não funciona; excluído por Ptolomeu
por razão óptica. Moderno: **o inconsciente**. Entre os dois, um século de
teosofia e psicologia analítica.

**📱** *"O nome antigo da Casa 12 é 'Mau Daimon'. Ela tratava de inimigos ocultos,
doença, cativeiro — e é onde Saturno se alegra. A leitura de 'inconsciente e
karma' entra no século XX, com a teosofia de Alan Leo e depois com a astrologia
psicológica de Rudhyar e Liz Greene. A explicação antiga é mais interessante e é
técnica: a Casa 12 é um dos quatro signos que não fazem aspecto nenhum com o seu
Ascendente."*

---

### 5.13 Quadro-resumo (a tabela para copiar)

Significação **antiga** compactada, em português, pronta para virar conteúdo.
Fonte: Fírmico II.XIX + Paulo cap. 24 + Valente Livro II.

| # | Nome antigo | Antigo, em uma linha | O moderno costuma dizer |
|---|---|---|---|
| 1 | Horoskopos, "o leme" | vida, sopro, corpo, o fundamento do mapa | eu, aparência, máscara |
| 2 | Porta do Hades | sustento e bens — em aversão ao Asc | autoestima, valores |
| 3 | a Deusa | irmãos, amizade, viver fora; alegria da Lua | comunicação, mente |
| 4 | Subterrâneo | patrimônio, terra, fundações, o fim de tudo | lar, mãe, raízes |
| 5 | Boa Fortuna | filhos; alegria de Vênus | criatividade, romance |
| 6 | Má Fortuna | dano, doença, servidão; alegria de Marte — em aversão | rotina, saúde, trabalho |
| 7 | o Poente | casamento e a qualidade da morte | o outro, o espelho |
| 8 | Começo da Morte / **o Ocioso** | morte, herança — em aversão | sexo, transformação |
| 9 | o Deus | religião, adivinhação, estrangeiro; alegria do Sol | filosofia, viagens |
| 10 | Meio-do-Céu | *praxis* — ação, reputação, pátria | carreira |
| 11 | Bom Daimon | patrocínio, boas expectativas; alegria de Júpiter | amigos, grupos |
| 12 | Mau Daimon | inimigos, doença, cativeiro; alegria de Saturno — em aversão | inconsciente, karma |

---

## 6. O motor da camada moderna: o alfabeto de 12 letras

### 6.1 O que é

**[TP]** A doutrina de que **Casa N = Signo N = regente do Signo N**, formando
doze "arquétipos" (1ª = Áries = Marte; 2ª = Touro = Vênus; …; 12ª = Peixes =
Netuno). É chamada de "alfabeto de doze letras" e é, hoje, a espinha dorsal
implícita de quase todo conteúdo astrológico de massa — inclusive quando o autor
não sabe que a está usando.

### 6.2 O ancestral real: Lilly, 1647 — e por que ele NÃO é a mesma coisa

**[FP]** Lilly, *Christian Astrology* (1647), Livro I, dá a cada casa dois
**consignificadores**: um signo e um planeta.

| Casa | Signo | Planeta | Casa | Signo | Planeta |
|---|---|---|---|---|---|
| 1 | Áries | **Saturno** | 7 | Libra | **Lua** |
| 2 | Touro | **Júpiter** | 8 | Escorpião | **Saturno** |
| 3 | Gêmeos | **Marte** | 9 | Sagitário | **Júpiter** |
| 4 | Câncer | **Sol** | 10 | Capricórnio | **Marte** |
| 5 | Leão | **Vênus** | 11 | Aquário | **Sol** |
| 6 | Virgem | **Mercúrio** | 12 | Peixes | **Vênus** |

E a justificativa dele, em suas palavras:

> "The consignificators of this house are Aries and Saturn; for as this house is
> the first house, so is Aries the first sign, and Saturn the first of the
> planets."
> — William Lilly, *Christian Astrology*, 1647, Livro I (grafia modernizada).

**Duas diferenças que mudam tudo:**

1. **Os planetas de Lilly seguem a ordem caldeia** (Saturno, Júpiter, Marte, Sol,
   Vênus, Mercúrio, Lua — distância decrescente da Terra), **não** a regência dos
   signos. Por isso Saturno consignifica a **1ª**, e não Marte. O sistema
   moderno trocou a ordem caldeia pelos **regentes domiciliares** e, com essa
   única substituição, criou uma doutrina diferente.
2. **Consignificador não é regente.** É um significador **secundário**, um eco
   ordinal, não uma identidade. Anthony Louis dá o exemplo que expõe a
   diferença: Marte consignifica a 10ª e ali costuma ser favorável — mas Saturno,
   que **rege** Capricórnio, tipicamente **nega** honras na 10ª. Se
   consignificação fosse regência, os dois teriam que concordar. Não concordam.

### 6.3 O salto: anos 1970

**[TP/DIS]** A formulação moderna é atribuída a **Zipporah Pottenger Dobyns**
(1921–2003), que a popularizou nos anos 1970 no contexto da astrologia
psicológica. **Ela não a inventou** — a estrutura vinha de Lilly, como acima. O
que Dobyns fez foi (a) substituir os planetas caldeus pelos regentes domiciliares
e (b) tratar o trio casa/signo/planeta como **um arquétipo único**, pedagogicamente
poderoso e memorizável.

**[DIS] sobre a datação.** Brennan, no ep. 231 do *The Astrology Podcast* (2019),
descreve o modelo "signos = casas" como invenção relativamente recente e o
associa vagamente a Alan Leo e ao século XX; noutro momento fala em **origem
renascentista** (o que bate com Lilly). As duas afirmações são compatíveis se
lidas como camadas — semente em 1647, doutrina plena no século XX — mas
**não escrever uma data única** sem a distinção.

### 6.4 As doze consequências, em uma tabela

Cada linha é um significado moderno que **só existe** porque a casa foi
equiparada ao signo. **[IR]** onde não achei nenhum lastro antigo; **[TP]** onde
há algum precedente medieval independente.

| Casa | Signo/planeta importado | O que a importação produziu | Grau |
|---|---|---|---|
| 1 | Áries / Marte | iniciativa, impulso, "o guerreiro", aparência física como identidade | [IR] |
| 2 | Touro / Vênus | autovalor, "meus valores", prazer, conforto | [IR] |
| 3 | Gêmeos / Mercúrio | comunicação, mente concreta, curiosidade | [TP] (viagem curta é de Lilly) |
| 4 | Câncer / Lua | **a mãe**, emoção, ninho, criança interior | [IR] (a mãe é inversão do medieval) |
| 5 | Leão / Sol | criatividade, autoexpressão, palco, romance | [IR] |
| 6 | Virgem / Mercúrio | rotina, método, higiene, "serviço" | [IR] |
| 7 | Libra / Vênus | harmonia, equilíbrio, "o espelho", projeção | [TP] (casamento é antigo) |
| 8 | Escorpião / **Plutão** | **sexo**, tabu, transformação, poder, intimidade | [IR] |
| 9 | Sagitário / Júpiter | expansão, otimismo, ensino superior | [TP] (estrangeiro e religião são antigos) |
| 10 | Capricórnio / Saturno | **o pai**, ambição, estrutura, status | [IR] (o pai é inversão do medieval) |
| 11 | Aquário / **Urano** | coletivo, ativismo, tecnologia, "humanidade" | [IR] |
| 12 | Peixes / **Netuno** | inconsciente, dissolução, transcendência, karma | [IR] |

**Repare no padrão:** as três casas mais desfiguradas — 8ª, 11ª, 12ª — são
exatamente as que receberam os **três planetas transaturninos** (Plutão 1930,
Urano 1781, Netuno 1846). Isso data o grosso da Camada C com precisão razoável:
ela **não pode** ser anterior a 1930 na sua forma atual.

### 6.5 A crítica — e a contra-crítica honesta

**[TP]** Sue Ward (2002) é direta: "For anyone using the Modern system of house
ordering, I only suggest that they recognise that **there is no foundation for
it**". E dá a consequência prática, que não é filosófica: escolher Vênus como
significador de dinheiro (porque "rege" a 2ª) ou Júpiter como significador de
viagem ao exterior (porque "rege" a 9ª) leva a julgamento errado em horária.

**Mas a honestidade exige o outro lado.** O alfabeto de 12 letras tem três
virtudes reais, e um app que só o ataca soa dogmático:

1. **É pedagogicamente excelente.** Reduz três vocabulários (signos, casas,
   planetas) a um. É por isso que venceu.
2. **É internamente coerente.** As deduções que ele produz são consistentes com a
   premissa. O problema é a premissa, não o raciocínio.
3. **Ele tem um precedente real de 1647.** Não é invenção de TikTok. É Lilly com
   uma peça trocada.

**A objeção correta é histórica, não estética:** o alfabeto de 12 letras produz
significados **novos** e os apresenta como **antigos**. Se o app disser "Casa 8 é
transformação" e acrescentar "essa é a leitura moderna; a antiga é morte e
herança", está tudo certo. O erro é o rótulo, não o conteúdo.

---

## 7. A camada psicológica — quem, quando, o quê

Todas as obras abaixo são **protegidas**. Registro a **tese** de cada autor com
minhas palavras, o que é exatamente o método de revisão bibliográfica pedido.
Nenhuma reprodução de texto.

| Autor | Obra-âncora | Data | Contribuição às CASAS, em minhas palavras | Grau |
|---|---|---|---|---|
| **Alan Leo** (W. F. Allan, 1860–1917) | *Esoteric Astrology*; *Casting the Horoscope* | 1902–1913 | Injeta **karma e reencarnação** (via Sociedade Teosófica) na astrologia inglesa e desloca a leitura de evento para **caráter**. As casas deixam de ser "onde as coisas acontecem" e passam a ser "onde o eu se desenvolve". Também é quem consolida **Placidus** como padrão inglês (doc 03 §6.7). | [TP] |
| **Marc Edmund Jones** (1888–1980) | *The Guide to Horoscope Interpretation* | 1941 | Sistematiza a leitura por **padrão global do mapa** (as sete formas) e por **hemisférios** — o que muda a pergunta de "o que há na casa X" para "onde está a massa do mapa". Reforça a leitura das casas como campos e não como listas de tópicos. | [TP] |
| **Dane Rudhyar** (1895–1985) | *The Astrology of Personality* (1936); ***The Astrological Houses: The Spectrum of Individual Experience*** (1972) | 1936 / 1972 | **O nó da questão.** Redefine casa como **campo de experiência** (não zona de eventos) e como **circunstância** — no sentido literal de *circum-stare*, o que está em volta. Insiste que a circunstância é dada mas o **significado** dela é escolhido: é a mudança de fatalidade para agência. É daqui que sai o vocabulário de "autoconhecimento", "integração", "sombra" que o mercado inteiro usa. (O doc 01 §549 e o doc 04 §3.1 já registram Rudhyar noutros contextos.) | [TP] |
| **Zipporah Dobyns** (1921–2003) | *Finding the Person in the Horoscope* e cursos | anos 1970 | Populariza o **alfabeto de 12 letras** com regentes domiciliares (seção 6). É o vetor por onde os significados dos signos entram nas casas em escala industrial. | [TP] |
| **Stephen Arroyo** (n. 1946) | *Astrology, Karma & Transformation* | 1978 | Consolida em livro de massa a fusão karma + psicologia + astrologia, com forte carga sobre 8ª e 12ª. | [TP] |
| **Liz Greene** (n. 1946) e **Howard Sasportas** (1948–1992) | ***The Twelve Houses*** (Sasportas, 1985); seminários do Centre for Psychological Astrology (fundado 1983) | 1983–1992 | **O livro de referência moderno sobre casas em inglês.** Aplica arquétipos junguianos casa a casa; é onde a 12ª como **inconsciente coletivo** e a 7ª como **projeção da sombra** viram padrão de mercado. | [TP] |
| **Mercado PT-BR** | ver doc 08 | 2010– | Recebe a Camada C já pronta, traduzida do inglês, e a apresenta como "a astrologia". Praticamente nenhum produto brasileiro distingue camadas. | [TP] |

**A observação estrutural que interessa ao produto:** a Camada C não é
"astrologia errada". É um **projeto intelectual coerente**, com objetivo
declarado — tornar a astrologia uma linguagem de desenvolvimento pessoal em vez
de um oráculo de eventos. Ele conseguiu. O problema é só um: a Camada C se
apresenta usando os nomes e a autoridade da Camada A. **Separar as duas é o
diferencial editorial mais barato e mais defensável que o app tem à disposição.**

---

## 8. O que a estatística tentou dizer sobre casas

Vale uma seção porque o app tem posição sobre evidência (docs 01 e 02) e porque
o assunto **casas** tem o caso mais famoso da história dessa discussão.

### 8.1 Os setores de Gauquelin

**[AM]** Michel Gauquelin (1928–1991), psicólogo e estatístico francês, publicou
em *L'influence des astres* (**1955**) e *Les Hommes et les Astres* (**1960**) a
observação de que campeões esportivos de elite nasciam com **Marte** em zonas
específicas do ciclo diurno com frequência acima do esperado. As zonas —
chamadas por ele de **"plus zones"** ou setores-chave — são as **imediatamente
posteriores ao nascer** de um planeta e as **imediatamente posteriores à
culminação**.

**Traduzindo para linguagem de casas de quadrante: os setores quentes são a
Casa 12 e a Casa 9.** As duas casas **cadentes** que a doutrina moderna considera
fracas e sem importância.

**[DIS] sobre os detalhes técnicos.** Encontrei duas descrições do esquema: uma
que fala em **12 setores** e outra em **36 setores de 10°**, com as plus zones
sendo os setores 1–3 (após o nascer) e 10–12 (após a culminação). **Não verifiquei
qual esquema está nas publicações originais de Gauquelin** — provavelmente ele
usou divisões diferentes em fases diferentes da pesquisa. Números de efeito que
circulam (≈22% para campeões contra ≈17% esperado) vêm de fonte secundária e
**não os confirmei na publicação original**.

### 8.2 Por que isto NÃO pode ser usado como prova — e mesmo assim vale contar

**[AM]** A história da replicação é longa e termina mal para o efeito:

- **Comité Para (Bélgica)**, 1962–1967: replicou os números, depois atribuiu-os a
  erros demográficos; análises internas contestaram essa atribuição.
- **CFEPP (França)**, relatório preliminar em 1990 com 1.066 campeões, publicação
  final em **1996** (Benski *et al.*): **nenhuma evidência** do efeito Marte,
  atribuindo o resultado original a **viés de seleção** da amostra.
- **Geoffrey Dean** propôs uma explicação alternativa: manipulação de horários de
  nascimento pelos próprios pais em épocas em que a astrologia era popular.
- **Suitbert Ertel** defendeu o efeito com reanálises. A discussão nunca produziu
  consenso favorável.

**Posição correta para o app:** o efeito Marte **não é evidência de nada** e não
deve ser citado como prova de que astrologia funciona. Mas ele é **um fato
histórico interessante e verificável** sobre a pesquisa em casas, e tem uma ironia
que vale um parágrafo de conteúdo: as zonas que a estatística de Gauquelin
apontou são as que a **doutrina moderna** despreza (cadentes) e que a
**doutrina antiga** honrava com alegrias planetárias (Saturno na 12ª, Sol na 9ª).
Contar isso **com a ressalva da não-replicação** é conteúdo honesto e raro.

### 8.3 O problema metodológico que ninguém resolve

**[AM/síntese própria.]** Há uma objeção anterior a qualquer resultado: **estudar
"casas" estatisticamente é estudar uma convenção, não um fenômeno.** O doc 03
§7.20 mediu que, entre Placidus e Casas Inteiras, **cerca de metade dos planetas
troca de casa** e **93–99% dos mapas mudam**. Um estudo que "testa a Casa 10"
testa, na verdade, a Casa 10 **de um sistema específico**. Gauquelin escapou
disso porque trabalhou com **setores do ciclo diurno** definidos
astronomicamente, sem passar por nenhum sistema de domificação — o que, ironia
adicional, é mais parecido com o que Valente faz em III.2 (graus operantes por
divisão de quadrante) do que com qualquer coisa que um app moderno mostre.

---

## 9. O QUE A INTERNET REPETE E A FONTE NÃO SUSTENTA

*Nenhum item aqui repete a lista do doc 03 §7. Onde há continuidade, está
indicado.*

**9.1 — "A Casa 8 é a casa da transformação e do sexo."**
**[IR]** Fírmico: *Epicatafora*, casa passiva, "de onde se descobre o tipo de
morte". Valente: "The VIII Place of **Death**". Paulo: "o **Ocioso**". Um
escoliasta antigo de Ptolomeu anota `τόπος ἀργός` no mesmo ponto. **Sexo não
aparece em fonte antiga nenhuma que eu tenha lido.** A cadeia causal está em 5/Casa 8:
Plutão (1930) → Escorpião → Casa 8. Sue Ward nomeia o mecanismo com todas as
letras. (Continua o doc 03 §7.13, com a genealogia que faltava lá.)

**9.2 — "A Casa 12 é o inconsciente."**
**[IR]** Fírmico: inimigos, escravos, defeitos e doenças; casa de Saturno; passiva
por não aspectar o Ascendente. Ptolomeu a exclui e dá razão **óptica**. A leitura
de inconsciente entra pela linha Leo → Rudhyar → Greene/Sasportas (seção 7).
(Continua o doc 03 §7.15.)

**9.3 — "A Casa 4 é a mãe."**
**[TP, e é inversão]** Lilly, 1647: 4ª = **pai**, 10ª = **mãe**. Fírmico não põe
pais em casa nenhuma — põe nos **planetas** (Sol=pai, Lua=mãe, Vênus=esposa,
Marte=marido, II.XIX.13). Valente põe pai na **9ª** e mãe na **3ª**. A versão
moderna (4ª=mãe, 10ª=pai) é a única das quatro que **nenhuma fonte antiga ou
renascentista** sustenta, e Sue Ward mostra que ela é derivada de Câncer/Lua
regerem a 4ª — ou seja, do alfabeto de 12 letras.

**9.4 — "As casas cadentes são as casas fracas."**
**[DIS / simplificação]** Verdade só num dos quatro critérios antigos. Pelo
critério de configuração ao Ascendente, a **3ª e a 9ª** são **boas** — Fírmico diz
que a 9ª é "importantly aspected to the ascendant in trine aspect". Pelas
alegrias, a 3ª (Lua) e a 9ª (Sol) são honradas. As casas ruins pela aversão são
**2, 6, 8, 12** — e duas delas (2ª e 8ª) são **sucedentes**, não cadentes. A
frase correta é: *"cadente mede força; aversão mede qualidade; são coisas
diferentes."*

**9.5 — "As casas boas e ruins são as 6, 8 e 12."**
**[DIS]** É a lista mais popular e não é a de nenhuma fonte isoladamente.
Fírmico dá **2, 6, 8, 12**. Ptolomeu, para prorrogação, rejeita **sete**. A
angularidade condena **3, 6, 9, 12**. A "lista das três" é um consenso de mercado,
não de fonte. Ver a tabela em 4.5.

**9.6 — "Angular = cardinal, sucedente = fixo, cadente = mutável."**
**[IR]** Isso só é verdade num mapa com **Áries exatamente no Ascendente**. É o
alfabeto de 12 letras aplicado à tríade de modalidades. Nenhuma fonte antiga
liga qualidade angular a modalidade de signo; são dois eixos independentes que
coincidem em um único mapa em doze.

**9.7 — "Casa vazia significa que aquela área da vida não é importante."**
**[IR]** Nem antiga nem moderna sustenta isso. A prática antiga lê o lugar pelo
seu **regente** (*oikodespótēs*) esteja ele onde estiver — Valente faz isso em
cada parágrafo, dizendo coisas como "se o regente do Lote está neste Lugar…". Com
doze casas e dez planetas, **casas vazias são a norma matemática**, não anomalia.

**9.8 — "Cada casa é regida por um planeta."**
**[IR na formulação moderna]** Uma casa é regida pelo **planeta que rege o signo
que cai nela naquele mapa** — muda de pessoa para pessoa. A ideia de "regente
natural" fixo (Marte rege a 1ª sempre) é o alfabeto de 12 letras. O precedente
de Lilly (consignificadores) usa a **ordem caldeia** e é um significador
secundário, não uma regência.

**9.9 — "Casa 2 é autoestima."**
**[IR]** Ver 5/Casa 2. Nenhuma fonte antiga. O nome dela era **Porta do Hades**.

**9.10 — "Casa 6 rege pets."**
**[TP, mas não helenístico]** Vem de Lilly (1647), cuja lista é de animais de
criação — porcos, ovelhas, cabras, lebres, coelhos — e da regra renascentista
"até o tamanho de uma cabra na 6ª, acima disso na 12ª" (Sue Ward). **Paulo põe os
quadrúpedes na 12ª.** Gato de apartamento não estava previsto por ninguém. Isto
**fecha a lacuna deixada aberta no doc 03 §7.16**: a divisão pequeno/grande tem
fonte, e é renascentista.

**9.11 — "Casa 11 é a casa da humanidade e das causas coletivas."**
**[IR]** Carga uraniana, pós-1781 na melhor hipótese e do século XX na prática. O
nome antigo é **Bom Daimon** e o tema é **patrocínio e boas expectativas**; Paulo
põe **amizade na 3ª**.

**9.12 — "Ptolomeu descreveu as doze casas."**
**[Falso, e continua rodando]** Encontrei essa afirmação em material de divulgação
durante esta própria pesquisa. O tradutor de Ptolomeu diz o contrário na cara do
leitor: Ptolomeu "*pays little attention to the system of 'places' or 'houses' so
much used by the astrologers*" e, em III.10, trata de **cinco** lugares além do
próprio Ascendente (Robbins, Loeb 1940, nota 56). (Doc 03 §7.4 já registra; aqui
fica a citação exata do aparato.)

**9.13 — "A casa 12 é a casa da espiritualidade."**
**[IR]** Na Camada A, o lugar da religião, da adivinhação e do contato com o
divino é a **9ª** — literalmente "o Deus", casa do Sol. Valente lista lá "the
appearance of gods, divination; mystical or occult matters". A 12ª é o **Mau
Daimon**. A troca é moderna e vem de Peixes/Netuno.

**9.14 — "As casas descrevem doze áreas iguais da vida."**
**[IR]** A antiguidade não tratava as doze como equivalentes. Havia hierarquia
tripla (seção 3), lugares em que benéfico **deixa de funcionar** (Fírmico VI.I.7)
e, em Ptolomeu, sete lugares descartados para a questão mais grave do mapa. A
democracia das casas é invenção do século XX.

**9.15 — "'Casa' e 'signo' são coisas diferentes, sempre foram."**
**[DIS]** Sim e não — e é o ponto mais delicado. Na Camada A o lugar **é** um
signo (doc 03 §6.1: "o enésimo *zoidion* a partir do Horoskopos"). O que não
existia é a equivalência **de significado** entre a Casa N e o Signo N. Ou seja:
casas eram signos na **forma**, e não eram signos no **conteúdo**. O alfabeto de
12 letras inverte exatamente isso — separa na forma (usa cúspides de quadrante) e
funde no conteúdo.

**9.16 — "'Interceptação' na Casa 12 significa karma preso."**
**[IR]** Interceptação é **artefato de sistema de casas** e não existe em Casas
Inteiras (doc 03 §7.23). Somar a isso uma leitura kármica é empilhar uma invenção
do século XX sobre um artefato matemático.

**9.17 — "Casa 10 é onde está o Meio-do-Céu."**
**[Falso no sistema do app]** Ver doc 03 §6.9 e 5/Casa 10 aqui. Em Casas
Inteiras o MC flutua entre a 9ª, a 10ª e a 11ª. Se o app um dia exibir o MC, tem
que dizer isso, ou o usuário vai conferir no astro.com e concluir que o app
errou.

**9.18 — "A Casa 8 são os recursos compartilhados."**
**[TP, medieval, não antigo]** Vem da lógica de **casas derivadas** — a 8ª é a
2ª a partir da 7ª, logo os bens do cônjuge. Lilly diz isso explicitamente ("dowry
of the wife, portion of the maid"). É legítimo e tem fonte — só é **1647**, não
séc. II.

---

## 10. ONDE ISTO TOCA O APP

> **Aviso.** Levantamento do código em **31/07/2026**, para decisão. Outras
> frentes estão editando o repositório; **nada aqui é alteração feita nem
> proposta unilateral**.

### 10.1 A situação atual, em uma frase

`screens/BirthChartScreen.js:197-222` (`HousesSection`) renderiza doze células no
formato **"Casa N — ⟨signo⟩"** e nada mais. `lib/signs.js`, função `houses()`
(linha 413 hoje — **o arquivo está sob edição de outra frente, buscar pelo nome**),
calcula Casas Inteiras e devolve `{ houseNumber, sign }` — **sem campo de
significado**. `server-patches/src/infrastructure/AnthropicChatProvider.js:206`
(`blocoContexto`) **não envia casas** para a IA.

**Ou seja: o app hoje não afirma o significado de nenhuma casa.** Isso é
acidentalmente a posição mais segura possível — e explica por que ele não aparece
em nenhum item da seção 9.

### 10.2 As três decisões que virão junto com o conteúdo de casas

Quando alguém for preencher aquelas células, três escolhas se impõem ao mesmo
tempo. Elas são **inseparáveis** e é melhor decidi-las de uma vez:

**(a) Qual camada.** A, B ou C — ou as duas em paralelo. A recomendação
editorial deste documento é **A com nota de C**: dar a significação antiga (que
tem fonte, é curta e é interessante) e uma linha dizendo o que a leitura moderna
diz. É o mesmo padrão que `lib/zodiacBody.js` já usa para o Homem Zodiacal e que
o doc 01 aprovou.

**(b) Onde o texto mora.** As strings de `HousesSection` são **PT hardcoded**
(`BirthChartScreen.js:200, 216`) e `lib/i18n.js` **não tem nenhuma chave
`birthchart.house.*`** — tem 54 chaves `birthchart.*`, nenhuma delas de casa
(constatação; a decisão é de quem estiver no i18n). Conteúdo de doze casas
entrando hardcoded significa doze strings × N idiomas de dívida no dia seguinte.

**(c) O rótulo de sistema.** `BirthChartScreen.js:200` já mostra
**"Casas (Casas Inteiras)"**, e isso é raro e certo (doc 03 §8.1). Se as casas
ganharem significado, o rótulo passa a carregar peso dobrado: o usuário que
compara com um app Placidus vai ver **metade dos planetas em casas diferentes**
(doc 03 §7.20). A frase pronta para esse caso está no doc 03 §8.3.

### 10.3 Se as casas forem para o contexto da IA

`AnthropicChatProvider.js:206-214` monta o `blocoContexto` com sol, lua,
ascendente, fase lunar, retrogradação e aspectos — e a proibição nº 1 do prompt
impede a IA de afirmar casa sem dado no `<contexto>`. **A combinação é sólida e
deve ser preservada.** Duas notas para o dia em que casas entrarem:

1. **A linha precisa carregar o sistema.** Não `"Casa 8: Escorpião"` e sim
   `"Casas (sistema: Casas Inteiras): Casa 1 em Virgem, Casa 2 em Libra…"`. Sem o
   rótulo, a IA afirma algo que só é verdade sob convenção não declarada.
2. **`AnthropicChatProvider.js:711`** lista "As doze casas" numa enumeração de
   conhecimento, **sem significações e sem sistema**. Se essa linha for
   enriquecida, a tabela 5.13 deste documento é a fonte — e vale acrescentar a
   lógica de aversão (§3.2) e das alegrias (§3.3), que é o que permite a IA
   **explicar** em vez de só afirmar. Uma IA que diz *"a Casa 12 é difícil porque
   é um dos quatro signos que não fazem aspecto com o seu Ascendente — os gregos
   a chamavam de 'em aversão'"* está entregando algo que nenhum concorrente
   entrega.

### 10.4 Onde o app já toca casas fora da tela de mapa

- **`lib/chatResponses.js:27`** — *"Carreira costuma se conectar com a Casa 10 e
  com Saturno no mapa."* **Sustentado.** Fírmico II.XIX.11 dá à 10ª "all our
  actions… professional careers"; Paulo dá *praxis*, reputação e valor.
  Aprovado no doc 03 §8.2(g) e **confirmado aqui com a fonte exata**.
- **`lib/i18n.js:335`** — `'birthchart.row.asc.desc': 'Como o mundo te vê'`.
  Camada C (ver 5/Casa 1). Não é erro; é escolha moderna não declarada. Se algum
  dia houver espaço para uma segunda linha, a frase antiga está em 5/Casa 1 📱.

### 10.5 O ativo comercial que esta pesquisa cria

Três frases que o app pode dizer e que, até onde levantei, **nenhum concorrente
em português diz**:

1. *"O nome antigo da Casa 8 é 'o Ocioso' — porque ela não faz aspecto nenhum com
   o signo do seu Ascendente."*
2. *"A astrologia antiga tinha casas que eram simplesmente ruins. A moderna
   reenquadrou todas como áreas de crescimento. Foi uma escolha do século XX."*
3. *"Casa 8 = sexo é uma dedução a partir de Escorpião e de Plutão — que foi
   descoberto em 1930."*

Todas as três são verificáveis, todas têm fonte nesta página, e todas são o tipo
de conteúdo que faz um usuário mostrar o print para outra pessoa. É o mesmo
padrão que o doc 01 estabeleceu com o Homem Zodiacal.

---

## 11. Bibliografia — o que eu de fato consultei

### Fontes primárias, lidas diretamente nesta pesquisa

- **Cláudio Ptolomeu**, *Tetrabiblos*, Livro III, cap. 10 ("On the Length of
  Life"), trad. F. E. Robbins, Loeb Classical Library, 1940, pp. 273–275, com as
  notas 56, 57 e 58 do tradutor e o aparato crítico ao texto grego. Consultado na
  edição digital de Bill Thayer, **LacusCurtius**,
  `penelope.uchicago.edu/Thayer/E/Roman/Texts/Ptolemy/Tetrabiblos/3B*.html`.
  Domínio público. **É a fonte de toda a §4.2 e da tabela de nomes gregos da §2.**
- **Júlio Fírmico Materno**, *Mathesis*, Livro II caps. XVI–XX e Livro VI cap. I,
  na tradução inglesa de **Jean Rhys Bram**, *Ancient Astrology: Theory and
  Practice* (Noyes Press, 1975), PDF consultado em
  `astrologiahumana.com/firmicusmaternustheoryandpractice.pdf`. **Tradução
  protegida** — citei no máximo uma frase por passagem, com atribuição. O latim
  original é de domínio público (ed. Kroll–Skutsch–Ziegler, Teubner) mas **não o
  consultei**.
- **Vétio Valente**, *Anthologiae*, Livro II (os doze Lugares) e Livro III cap. 2
  (graus operantes/inoperantes), na tradução integral de **Mark T. Riley**, PDF
  livre da Skyscript,
  `skyscript.co.uk/pdf/pubs/texts/valens/riley/docs/Vettius_Valens_Riley.pdf`.
- **William Lilly**, *Christian Astrology* (Londres, 1647), Livro I, "Of the
  twelve Houses, their Nature and Signification", consultado na transcrição da
  **Skyscript** (`skyscript.co.uk/lilly_houses.html`). **Grafia modernizada na
  transcrição** — ver seção 12.
- **Paulo de Alexandria**, *Introductory Matters*, caps. 7, 24, 27 e 30 — via a
  documentação já feita no `03-casas-e-mapa-natal.md`, que trabalhou com a
  tradução Schmidt/Hand (Project Hindsight). **Não reli o texto de Paulo nesta
  frente**; as atribuições a ele aqui são as do doc 03.

### Estudos e artigos modernos

- **Robert Schmidt**, *House Division, Planetary Strength, and Cusps in
  Hellenistic Astrology*, em `astrology-x-files.com/houses/schmidt-houses.html`
  (também em PDF no Internet Archive). — Fonte da discussão sobre
  *chrematistikos* e da ressalva sobre a ambiguidade do termo (§4.1).
- **Sue Ward**, *The Houses in Traditional Astrology* (2002), PDF em
  `theafi.wordpress.com/wp-content/uploads/2011/01/houses.pdf`. — A melhor
  exposição breve da Camada B que encontrei, e a fonte da análise do mecanismo
  Escorpião/Plutão → Casa 8 e da questão pai/mãe. Posição declaradamente
  tradicionalista; ler como tal.
- **Anthony Louis**, "William Lilly's Con-significators of the houses" (03/04/2017)
  e "Planetary hours and the 12-letter alphabet of astrology" (22/03/2021),
  `tonylouis.wordpress.com`. — Fonte da tabela de consignificadores e da
  distinção consignificador × regente (§6.2).
- **Skyscript**, "House terms — consignificators", `skyscript.co.uk/horary1dc.html`.
  — Confirma a tabela de Lilly e dá a referência de página (*CA* p. 51 ss.).
- **Dane Rudhyar**, "The Astrological Houses and Planets as Circumstances and
  Opportunities", *Horoscope Magazine*, outubro de **1966**, republicado no
  Rudhyar Archival Project, `khaldea.com/rudhyar/astroarticles/`. — Único texto de
  Rudhyar que li **diretamente** nesta pesquisa; a tese dele na §7 vem
  principalmente daqui.
- ***The Astrology Podcast***, transcrições dos eps. **17**, **231** e **233**
  ("Significations of the Twelve Houses", 2019, com Chris Brennan, Kelly Surtees e
  Austin Coppock), `theastrologypodcast.com/transcripts/`. — Usado para a posição
  contemporânea sobre origens das significações e sobre o alfabeto de 12 letras.
  **Atenção:** são transcrições de podcast, não texto revisado por pares; o próprio
  formato faz os participantes citarem doutrinas sem dar referência. Tratei como
  **orientação de pesquisa**, e fui checar tudo que importava em Fírmico,
  Ptolomeu e Valente diretamente.
- **Wikipedia**, verbete "Mars effect", para a cronologia da replicação e a
  referência ao estudo CFEPP (Benski *et al.*, 1996). — Usado só como índice
  cronológico; **as publicações originais não foram consultadas**.

### Obras protegidas usadas como referência bibliográfica (não lidas integralmente)

Registradas pela **tese**, conforme o método. Nenhuma reprodução de texto.

- **Dane Rudhyar**, *The Astrology of Personality* (1936) e *The Astrological
  Houses: The Spectrum of Individual Experience* (Doubleday, 1972).
- **Howard Sasportas**, *The Twelve Houses* (1985; reed. Flare/Wessex).
- **Liz Greene**, obra do Centre for Psychological Astrology (fundado 1983).
- **Zipporah Pottenger Dobyns**, *Finding the Person in the Horoscope*.
- **Stephen Arroyo**, *Astrology, Karma & Transformation* (1978).
- **Marc Edmund Jones**, *The Guide to Horoscope Interpretation* (1941).
- **Alan Leo**, *Esoteric Astrology* (1913) e *Casting the Horoscope* (1902) —
  **em domínio público**, mas ver seção 12: não consegui um texto legível.
- **Deborah Houlding**, *The Houses: Temples of the Sky* (1998/2006) — a
  referência moderna mais importante especificamente sobre casas na linha
  tradicional. **Não consultada nesta frente.**
- **Chris Brennan**, *Hellenistic Astrology: The Study of Fate and Fortune* (2017).
- **Michel Gauquelin**, *L'influence des astres* (1955), *Les Hommes et les Astres*
  (1960).

### Documentos internos referenciados

`docs/tradicao/01-astrologia-fundamentos.md` (Alan Leo, Rudhyar, Homem Zodiacal),
`03-casas-e-mapa-natal.md` (sistema de casas, Paulo cap. 24, medições),
`04-lua-fases-e-calendario.md` (Rudhyar 1967), `08-o-que-o-mercado-diz.md`,
`09-bibliografia-e-fontes.md`.

---

## 12. O que eu NÃO consegui verificar

Registrado para ninguém repetir o esforço nem preencher a lacuna com invenção.

1. **O texto latino original de Fírmico.** Trabalhei inteiramente com a tradução
   Bram (1975). Todas as citações de Fírmico neste documento são **da tradução
   inglesa**, e os títulos de capítulo ("Unaspected Houses") são **de Bram**, não
   necessariamente de Fírmico. Antes de citar Fírmico em latim em qualquer lugar,
   ir à edição Teubner.
2. **A grafia original de Lilly.** A transcrição que li (Skyscript) tem grafia
   modernizada. O original de 1647 escreve *cattell*, *brethren*, *embassadors*,
   *hogges*. **As citações de Lilly aqui não são fac-similares.** O fac-símile
   está no Internet Archive; quem for citar Lilly verbatim em material público
   deve conferir lá.
3. **O hexâmetro latino das casas** (*"Vita, lucrum, fratres…"*). Circula em
   compilações e enciclopédias; **não achei autor, obra nem século**. Encontrei
   duas variantes divergentes. Está marcado [DIS] na §2 e **não deve ser
   atribuído a ninguém**.
4. **A primeira ocorrência de "self-undoing" para a Casa 12.** É frequentemente
   atribuída à astrologia inglesa do século XIX (Raphael, Zadkiel). Não localizei
   a passagem. **Não escrever data.**
5. **O texto de Alan Leo sobre casas.** Baixei *The Key to Your Own Nativity*
   (ed. 1927) do Internet Archive e o OCR está corrompido (reconhecido como
   devanágari — arquivo inutilizável). *Casting the Horoscope* não tem cópia de
   leitura livre no Archive. **A caracterização de Alan Leo na §7 e em 5/Casa 12
   é de segunda mão** (biografias, Theosophy Wiki, doc 01) e **não** de leitura do
   texto dele. Antes de atribuir a Alan Leo uma formulação específica sobre
   qualquer casa, achar o texto.
6. **Os números de Gauquelin.** O esquema de setores (12 ou 36) e as
   porcentagens (≈22% × ≈17%) vêm de fontes secundárias. **Não consultei
   *L'influence des astres* nem os relatórios originais.** Está marcado [DIS] na
   §8.1.
7. **A data e a obra exatas em que Zipporah Dobyns formula o alfabeto de 12
   letras.** "Anos 1970" é o que as fontes secundárias dizem; **não confirmei o
   livro nem o ano**. Não escrever ano específico.
8. **Retório, *Compendium* cap. 54**, e **Antíoco, *Thesaurus* cap. 46**, no
   original — não consultados nesta frente. Aparecem aqui só via doc 03.
9. **Deborah Houlding, *The Houses: Temples of the Sky*.** É a obra moderna mais
   diretamente concorrente deste documento e **não a li**. Qualquer conteúdo do
   app que se apresente como levantamento definitivo sobre casas deveria passar
   por ela antes.
10. **A posição de Valente sobre quais LUGARES (não graus) são inoperantes.** Ele
    usa "Inactive and Shadowy Place" numa passagem do Livro II, mas **não
    identifiquei com certeza a qual lugar ele se refere ali** — o contexto sugere
    a 8ª e/ou a 2ª. Não afirmar sem reler o grego.

---

*Documento 12. Escrito em 31/07/2026 como aprofundamento do
`03-casas-e-mapa-natal.md`. Nenhum arquivo de código foi alterado nesta frente.*
