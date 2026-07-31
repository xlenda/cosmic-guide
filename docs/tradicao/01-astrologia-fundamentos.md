# 01 — ASTROLOGIA: FUNDAMENTOS

**Base de referência do Cosmic Guide. Consultar ANTES de escrever qualquer conteúdo
novo do app que envolva signos, planetas, elementos, regências ou compatibilidade.**

---

## O QUE É ESTE ARQUIVO

Isto não é um manual de astrologia. É o registro do que as **fontes antigas de fato
dizem**, separado do que a internet **repete achando que elas dizem**.

Existe porque este app já pagou o preço de não ter isso. Na auditoria do Homem
Zodiacal (`lib/zodiacBody.js`) a ida à fonte revelou que quase todo site do mercado
repete três erros: Leão não é o coração em Manílio (é flancos e omoplatas,
*Astronomica* II.460), Libra não são os rins (são nádegas, II.462), e a lista dos
doze signos **não está** no *Tetrabiblos* — o que Ptolomeu enumera em III.xvii são
os PLANETAS. Um site copia do outro e o erro atravessa dois mil anos intacto.

Este documento é o equivalente, para o conteúdo, do que a suíte de testes é para o
código: um lugar onde a afirmação errada morre antes de virar produto.

### Como usar

1. **Vai escrever texto novo sobre signo/planeta/elemento?** Procure o tema aqui
   primeiro.
2. **Achou a afirmação marcada como FONTE PRIMÁRIA?** Pode usar, e cite a obra.
3. **Achou marcada como TRADIÇÃO POSTERIOR?** Pode usar, mas nunca diga "os
   antigos diziam" — diga de quem é e de quando.
4. **Achou marcada como INVENÇÃO MODERNA?** Não use como tradição. Se o produto
   quiser usar mesmo assim (é entretenimento, é legítimo), o texto não pode
   alegar lastro histórico.
5. **Não achou aqui?** Pesquise, e **acrescente** — com obra, autor, século e, de
   preferência, a citação literal. Nunca preencha por dedução.

### A regra que dá valor a isto

> **Fonte inventada, ou atribuída ao autor errado, é PIOR que ausência de fonte.**
> Ela contamina tudo que vier depois. Se não achar, escreva "não encontrei fonte".

Há uma seção no fim (§8) só para isso.

### Convenção de marcação

| Marca | Significa |
|---|---|
| **[FONTE PRIMÁRIA]** | O texto antigo diz isso. Obra e locus indicados. |
| **[TRADIÇÃO POSTERIOR]** | Surgiu depois da antiguidade, com autor e data conhecidos. |
| **[INVENÇÃO MODERNA]** | Circula na internet/no mercado sem lastro em texto antigo. |
| **[DISPUTADO]** | As fontes divergem entre si. As duas versões estão nomeadas. |

E, cruzando com as anteriores, o grau de verificação **desta** pesquisa:

| Marca | Significa |
|---|---|
| ✅ | Li a passagem no texto durante esta pesquisa. Cito com confiança. |
| ⚠️ | Vem de fonte secundária/enciclopédica confiável, **não reconferi no original**. Quem for usar como argumento forte, reconfira. |

---

## 1. AS FONTES PRIMÁRIAS — e onde ler

Ordem cronológica. Só entra aqui obra antiga (ou a transmissão direta dela).

| Obra | Autor | Data | Onde ler |
|---|---|---|---|
| **MUL.APIN** (2 tábuas) | anônimo, babilônico | compilação c. séc. X a.C.; tábuas mais antigas c. 686 a.C. ⚠️ | Edição Hunger & Pingree, *MUL.APIN: An Astronomical Compendium in Cuneiform* (1989). Visão geral: https://en.wikipedia.org/wiki/Mul.Apin |
| **Astronomica** | Marco Manílio | séc. I d.C. (sob Augusto/Tibério) | Latim integral: https://www.thelatinlibrary.com/manilius2.html e `manilius4.html`. Inglês: Loeb (Goold, 1977). |
| ***Carmen Astrologicum*** (Pentateuco) | Doroteu de Sídon | c. 75 d.C. ⚠️ | Sobrevive sobretudo pela tradução árabe de ʿUmar al‑Ṭabarī (c. 800). Edição crítica: Pingree, Teubner, 1976. |
| ***Tetrabiblos*** (Ἀποτελεσματικά) | Cláudio Ptolomeu | c. 150 d.C. | Trad. Robbins (Loeb, 1940, domínio público) — PDF integral: https://qhpastrology.co.uk/wp-content/uploads/2017/10/Ptolemy-Claudius-1940-Tetrabiblos-Robbins-Edition.pdf · Trad. Ashmand (1822): https://sacred-texts.com/astro/ptb/ · Por capítulo: https://astrolibrary.org/library/tetrabiblos/ |
| ***Anthologiae*** | Vétio Valente | c. 150–175 d.C. | Trad. Mark T. Riley (PDF livre): https://www.skyscript.co.uk/pdf/pubs/texts/valens/riley/docs/Vettius_Valens_Riley.pdf |
| ***Mathesis*** | Júlio Fírmico Materno | c. 334–337 d.C. ⚠️ | Trad. Jean Rhys Bram, *Ancient Astrology Theory and Practice* (1975). |
| ***Eisagogika*** (Introdução) | Paulo de Alexandria | 378 d.C. ⚠️ | Trad. Robert Schmidt / James Holden. |

### ⚠️ ARMADILHA DE CITAÇÃO Nº 1 — o *Tetrabiblos* tem DUAS numerações de capítulo

Este é o erro de citação mais fácil de cometer no app, e o app **já convive com as
duas numerações hoje**.

| Assunto | Robbins (Loeb, 1940) | Ashmand (1822, sacred-texts) |
|---|---|---|
| Do Poder dos Planetas | **I.4** | I.IV |
| Signos solsticiais/equinociais/sólidos/bicorpóreos | **I.11** | I.XII |
| Das Casas dos Planetas (domicílios) | **I.17** | I.XX |
| Dos Triângulos / Das Triplicidades | **I.18** | **I.XXI** |
| Das Exaltações | **I.19** | I.XXII |
| Da Disposição dos Termos | **I.20** | I.XXIII |

`lib/grounding.js` cita `'Ptolomeu, Tetrabiblos I.xxi'` para as triplicidades e
aponta para `sacred-texts.com/astro/ptb/ptb24.htm` — **está correto**, porque é
numeração Ashmand e a URL é do próprio Ashmand. Mas o mesmo arquivo cita
`'Ptolomeu, Tetrabiblos I.4'` para o poder dos planetas apontando para
`astrolibrary.org/.../tetrabiblos-6/`, que é numeração **Robbins**. Ou seja: o app
já mistura os dois sistemas em um arquivo só.

**Regra para conteúdo novo:** use numeração **Robbins** (é a edição acadêmica
padrão) e, quando o link for para o Ashmand, escreva o número dele entre
parênteses. Ex.: `Tetrabiblos I.18 (Ashmand I.XXI)`.

---

## 2. NÚCLEO DOUTRINÁRIO

### 2.1 O zodíaco de doze signos iguais

**[FONTE PRIMÁRIA / origem babilônica]** ⚠️
O **MUL.APIN** (c. séc. VII a.C. nas tábuas conservadas) lista **18** constelações
na faixa por onde passam Sol, Lua e planetas — figuras **observacionais e de
tamanhos desiguais**, não signos de 30°.

**[FONTE PRIMÁRIA / matemática babilônica]** ⚠️
A divisão em **doze setores iguais de 30°** aparece na **segunda metade do séc. V
a.C.**, na astronomia matemática babilônica. Foi um artifício de cálculo: doze
meses esquemáticos de 30 dias → doze signos de 30 graus. Os nomes vieram das
constelações antigas, mas os signos deixaram de ser as constelações naquele
momento — dois mil e quinhentos anos antes de qualquer polêmica sobre Ofiúco.

**O ponto que quase ninguém escreve:** *signo não é constelação desde o século V
a.C.* Isso não é uma desculpa moderna dos astrólogos; é a definição original.

**[FONTE PRIMÁRIA]** ✅ Ptolomeu deixa isso explícito:

> "although there is no natural beginning of the zodiac, since it is a circle,
> they assume that the sign which begins with the vernal equinox, that of Aries,
> is the starting point of them all"
> — *Tetrabiblos* I.10 (Robbins)

### 2.2 Os quatro elementos e as triplicidades

**[FONTE PRIMÁRIA / física, não astrologia]** ✅
Aristóteles, *Da Geração e Corrupção* II.3: os corpos simples se compõem de quatro
contrários primários — quente, frio, seco, úmido — dois a dois. Fogo = quente e
seco; Ar = quente e úmido; Água = fria e úmida; Terra = fria e seca. **Aristóteles
não fala de signos.** (Empédocles, séc. V a.C., é quem nomeia os quatro elementos
antes disso ⚠️.)

**[FONTE PRIMÁRIA]** ✅ **Ptolomeu NÃO organiza as triplicidades por elemento.** O
eixo dele em I.18 é **vento e direção**: triângulo "preeminentemente setentrional",
"Borrolibycon", "Notapeliotes", "de constituição oriental". Ele nunca escreve
"esta é a triplicidade do fogo".

**[FONTE PRIMÁRIA]** ✅ **Quem escreve com todas as letras é VALENS**, e isso
corrige um erro corrente. *Anthologiae* II.1, "Os Triângulos":

> "The sun, being fiery, is most related to Aries, Leo, and Sagittarius, and this
> triangle of the sun is called 'of the day-sect' because it too is **fiery** by
> nature. […] Next the moon […] is allotted the houserulership of Taurus, Virgo,
> and Capricorn, a triangle **earthy** in nature […]. Next is the **airy**
> triangle of Gemini, Libra, and Aquarius. […] next is the **moist** triangle of
> Cancer, Scorpio, and Pisces."

E signo a signo, em *Anthologiae* I.2, Valens já qualifica: Áries "fiery", Leão
"fiery", Sagitário "fiery", Virgem "earthy", Capricórnio "earthy", Libra "airy",
Escorpião "rainy".

**Conclusão utilizável:** a atribuição fogo/terra/ar/água aos doze signos é
**antiga e primária (Valens, séc. II)** — mas **não é de Ptolomeu**. Se o app
quiser citar fonte para os elementos, a fonte certa é Valens, não o *Tetrabiblos*.

#### Regentes de triplicidade — **[DISPUTADO]**, e a divergência importa

**Ptolomeu, I.18 (Ashmand I.XXI)** ✅ — dá **dois** regentes (diurno/noturno):

| Triplicidade | Signos | Dia | Noite | Obs. |
|---|---|---|---|---|
| 1ª (fogo) | Áries, Leão, Sagitário | Sol | Júpiter | Marte excluído: "não é da seita solar" |
| 2ª (terra) | Touro, Virgem, Capricórnio | Vênus | Lua | |
| 3ª (ar) | Gêmeos, Libra, Aquário | Saturno | Mercúrio | |
| 4ª (água) | Câncer, Escorpião, Peixes | Vênus | Lua | com **Marte** como senhor do triângulo, via Escorpião |

**Valens, II.1** ✅ — preserva o esquema mais antigo de **três** (regente, segundo,
participante):

| Triplicidade | Dia | Noite | Terceiro |
|---|---|---|---|
| Fogo | Sol → Júpiter → Saturno | Júpiter → Sol → Saturno | Saturno "trabalha com os dois" |
| Terra | Vênus → Lua → Marte | Lua → Vênus → Marte | Marte |
| Ar | Saturno → Mercúrio → Júpiter | Mercúrio → Saturno → Júpiter | Júpiter |
| Água | Vênus → Marte → Lua | Marte → Vênus → Lua | Lua |

**Regra para o app:** nunca escreva "o regente da triplicidade de X é Y" sem dizer
**de quem é o esquema**. `lib/grounding.js` já faz isso certo (linhas ~402‑410) —
copie aquele padrão.

### 2.3 As modalidades — **[FONTE PRIMÁRIA]** com **nome moderno**

**[FONTE PRIMÁRIA]** ✅ Ptolomeu, *Tetrabiblos* I.11, chama:

- **solsticiais** (τροπικά): **Câncer** e **Capricórnio** — "the sun turns when he
  is at the beginning of these signs and reverses his latitudinal progress";
- **equinociais**: **Áries** e **Libra** — "he makes the nights exactly equal to
  the days";
- **sólidos** (στερεά): **Touro, Leão, Escorpião, Aquário** — seguem os quatro
  acima; "when the sun is in them the moisture, heat, dryness, and cold […] touch
  us more firmly";
- **bicorpóreos** (δίσωμα): **Gêmeos, Virgem, Sagitário, Peixes** — "share, as it
  were, at end and beginning, the natural properties of the two states of weather".

**[TRADIÇÃO POSTERIOR / terminologia]**
As palavras **"cardinal"**, **"fixo"** e **"mutável"** **não estão em Ptolomeu**.
Conferido: no texto integral de Robbins a palavra `cardinal` aparece **uma única
vez** — em "winds from the **cardinal points**", falando de direções do horizonte
(I.10), não de signos. "Cardinal" vem do latim *cardo* (dobradiça), e o vocabulário
se firma na transmissão latina/medieval. ⚠️ Não localizei nesta pesquisa a primeira
atestação de "signo cardinal" nesse sentido — ver §8.

**Isto pode ser usado no app:** as quatro categorias são antigas, primárias e bem
documentadas. Só não chame Ptolomeu de autor da palavra "cardinal".

### 2.4 Gênero / polaridade dos signos — **[FONTE PRIMÁRIA]** ✅

*Tetrabiblos* I.12: Áries e Libra são masculinos e diurnos; a partir deles a
alternância é estrita, ímpar/par. Ptolomeu registra que **há esquemas
concorrentes** — alguns começam os masculinos pelo **Ascendente**, outros dividem
por quadrantes inteiros. Ele mesmo cita a divergência.

**[INVENÇÃO MODERNA / vocabulário]** "Yin/yang", "positivo/negativo",
"expressivo/receptivo" são reetiquetagens do séc. XX para masculino/feminino. Não
há nada de chinês na origem — a importação de yin/yang para o zodíaco ocidental é
moderna.

### 2.5 Os sete planetas e suas potências — **[FONTE PRIMÁRIA]** ✅

*Tetrabiblos* I.4 dá as sete qualidades em vocabulário térmico único. Verbatim de
Robbins (o app já usa exatamente estes trechos em `lib/grounding.js`):

| Planeta | Ptolomeu, I.4 |
|---|---|
| Sol | "heating and, to a certain degree, drying" |
| Lua | "Most of the moon's power consists of humidifying" |
| Saturno | "to cool and […] to dry" |
| Júpiter | "temperate active force […] both heats and humidifies" |
| Marte | "chiefly to dry and to burn, in conformity with his fiery colour" |
| Vênus | "warms moderately […] but chiefly humidifies" |
| Mercúrio | "at certain times alike to be drying and absorptive of moisture […] inspired as it were by the speed of his motion" |

**Alerta que vale repetir:** Ptolomeu aqui descreve efeitos **físicos e
meteorológicos**. Transformar "Saturno resfria" em "sábado é dia de esfriar a
cabeça" é um salto **nosso**. `lib/grounding.js` documenta essa regra no cabeçalho
— e o teste `test/grounding.test.js` a impõe.

**[FONTE PRIMÁRIA / significações]** ✅ Para significações **de vida** (e não
térmicas), a fonte é **Valens I.1**, que é muito mais rico e muito menos citado:

> Sol: "kingship, rule, intellect […] the father, the master […] Of the parts of
> the body, the sun rules the head; […] of the trunk, it rules the **heart**"
> Mercúrio: "education, letters, disputation, reasoning, brotherhood […] number,
> accounts, geometry, markets"
> Vênus: "desire and love […] marriages, pure trades, fine voices, a taste for
> music"

(Guarde o "Sol rege o coração": ele explica, sozinho, o erro do Leão‑coração — ver
§3.2.)

### 2.6 Domicílios (regências) — **[FONTE PRIMÁRIA]** ✅

*Tetrabiblos* I.17. Ptolomeu não apenas lista: ele **deduz**. Câncer e Leão são os
signos mais setentrionais, logo dos luminares (Leão masculino → Sol; Câncer
feminino → Lua). Traça-se o semicírculo solar (Leão→Capricórnio) e o lunar
(Aquário→Câncer), e cada um dos cinco planetas recebe um signo em cada semicírculo,
**na ordem das esferas**:

| Planeta | Domicílios | Razão dada por Ptolomeu |
|---|---|---|
| Sol | Leão | signo mais quente, masculino |
| Lua | Câncer | signo mais quente, feminino |
| Saturno | Capricórnio, Aquário | esfera mais alta e fria; **oposta** a Câncer/Leão |
| Júpiter | Sagitário, Peixes | "windy and fecund", em **trígono** aos luminares |
| Marte | Escorpião, Áries | seco e destrutivo, em **quadratura** aos luminares |
| Vênus | Libra, Touro | fértil, em **sextil**; "never more than two signs removed from the sun" |
| Mercúrio | Gêmeos, Virgem | "never […] farther removed from the sun than one sign"; vizinhos dos luminares |

**Isto é elegante e vendável como conteúdo:** a tabela de regências não é
arbitrária, é uma consequência geométrica da distância angular máxima de Vênus
(~46°) e Mercúrio (~28°) ao Sol — astronomia observável.

**[TRADIÇÃO POSTERIOR]** — regências modernas ⚠️

| Planeta | Descoberta | Regência moderna atribuída |
|---|---|---|
| Urano | 1781 (Herschel) | Aquário |
| Netuno | 1846 | Peixes |
| Plutão | 1930 (Tombaugh) | Escorpião ("oitava superior de Marte") |

**Aqui há um buraco de fonte que vale registrar:** a Wikipédia (verbete *Domicile
(astrology)*) descreve isso como um "consenso" de astrólogos e **não nomeia autor
nem data**. Eu **não encontrei**, nesta pesquisa, quem primeiro propôs cada
atribuição nem quando. Atribuições específicas que circulam por aí ("foi Fulano em
18xx") devem ser tratadas como não verificadas até alguém achar a fonte. Ver §8.

**Consequência prática:** o app não usa regências hoje (ver §4). Se vier a usar,
mostre as **clássicas** como tradição documentada e as **modernas** como camada do
séc. XIX‑XX, nomeada como tal.

### 2.7 Exaltação e queda — **[FONTE PRIMÁRIA]** ✅ com uma ressalva grande

*Tetrabiblos* I.19. Ptolomeu explica cada uma pelo ciclo solar/estacional:

| Planeta | Exaltação | Queda ("depression") | Razão de Ptolomeu |
|---|---|---|---|
| Sol | Áries | Libra | "the length of the day and the heating power of his nature begin to increase" |
| Saturno | Libra | Áries | oposição ao Sol: "where heat increases there cold diminishes" |
| Lua | Touro | Escorpião | após a conjunção em Áries "shows her first phase and begins to increase her light" |
| Júpiter | Câncer | Capricórnio | "reaches farthest north in Cancer" |
| Marte | Capricórnio | Câncer | "in it he is farthest south" |
| Vênus | Peixes | Virgem | "where the beginning of the moist spring is indicated" |
| Mercúrio | Virgem | Peixes | "in which the dry autumn is signified" |

**⚠️ ARMADILHA DE CITAÇÃO Nº 2 — Ptolomeu NÃO dá os graus.** ✅ Conferido no texto
integral de Robbins: o capítulo I.19 inteiro fala apenas em **signos**. Os graus
famosos —

> Sol 19° Áries · Lua 3° Touro · Mercúrio 15° Virgem · Vênus 27° Peixes ·
> Marte 28° Capricórnio · Júpiter 15° Câncer · Saturno 21° Libra

— **não estão no *Tetrabiblos*.** Eles são helenísticos (aparecem em fontes como
Paulo de Alexandria e Fírmico ⚠️, e a Wikipédia os remete a Neugebauer & van Hoesen,
*Greek Horoscopes*, 1959), com raiz babilônica: as exaltações são chamadas
**bīt niṣirti / ašar niṣirti** — "casa secreta", "lugar secreto" — em textos
tardo‑babilônicos, e a ideia é anterior ao próprio zodíaco de 12 signos ⚠️.

Valens ✅ usa exaltação intensamente (II.19, "The Exaltation of the Sun and Moon"),
mas **por signo**, não por grau: "the distance from the sun at the nativity to
Aries, which is the sun's exaltation".

**Se o app for exibir grau de exaltação, escreva:** "grau tradicional, de origem
helenística/babilônica — não consta do *Tetrabiblos*."

### 2.8 Dignidades menores — termos, decanos, faces

**[FONTE PRIMÁRIA]** ✅ **Termos (ὅρια)**: *Tetrabiblos* I.20‑21. Ptolomeu apresenta
**dois sistemas concorrentes** — o **egípcio** e o **caldeu** — e **critica
abertamente o egípcio** por incoerência:

> "the Egyptian system of the commonly accepted terms does not at all preserve the
> consistency either of order or of individual quantity […] why have they assigned
> precedence to Saturn, say, in Libra, and not to Venus?"

E então propõe um **terceiro**, o "de Ptolomeu". Ou seja: **[DISPUTADO] desde a
antiguidade** — três tabelas de termos convivem no mesmo capítulo do mesmo autor.

**[FONTE PRIMÁRIA]** ✅ **Ptolomeu REJEITA os decanos e as monomoirias**
(*Tetrabiblos* I.22, "Of Places and Degrees"):

> "These matters, as they have only plausible and not natural, but, rather,
> unfounded, arguments in their favour, **we shall omit**."

A palavra `decan` não aparece nenhuma vez no texto de Robbins. Os decanos são
**egípcios**, muito mais antigos que Ptolomeu ⚠️, e sobrevivem na tradição apesar
dele, não por causa dele.

**⚠️ ARMADILHA DE CITAÇÃO Nº 3 — "face" em Ptolomeu não é o que o mercado chama de
face.** ✅ *Tetrabiblos* I.23:

> "The planets are said to be in their 'proper face' when an individual planet
> keeps to the sun or moon the same aspect which its house has to their houses"

Isso é uma **relação angular com os luminares**, não um pedaço de 10° do signo. A
"face" moderna (decanato de 10° regido pela ordem caldeia) é outra coisa, com o
mesmo nome. Nunca cite I.23 para justificar decanato.

### 2.9 Aspectos — **[FONTE PRIMÁRIA]** ✅ e o que foi acrescentado depois

*Tetrabiblos* I.13 reconhece **quatro** aspectos, e só quatro:

| Aspecto | Graus | Signos | Julgamento de Ptolomeu |
|---|---|---|---|
| Oposição | 180° | 6 | "disharmonious" |
| Trígono | 120° | 4 | "harmonious" |
| Quadratura | 90° | 3 | "disharmonious" |
| Sextil | 60° | 2 | "harmonious" |

A justificativa é **musical**: metade e terço da oposição, sesquiáltera e
sesquitércia da quadratura. Harmônicos e desarmônicos são definidos por gênero de
signo: trígono e sextil unem signos do **mesmo** gênero; quadratura e oposição, de
gêneros **opostos**.

Três coisas que a maioria dos apps erra aqui:

1. **[FONTE PRIMÁRIA]** A **conjunção NÃO é um aspecto** em Ptolomeu. Signos
   contíguos ou coincidentes são tratados em I.16 como **"disjunct" e "alien"** —
   "entirely without share in the four aforesaid aspects". Conjunção aparece em
   I.24 como **"bodily application"**, categoria separada de "aspecto".
2. **[FONTE PRIMÁRIA]** Os aspectos de Ptolomeu são entre **SIGNOS INTEIROS**, não
   entre graus com tolerância. **Não existe tabela de orbes em graus no
   *Tetrabiblos*.**
3. **[TRADIÇÃO POSTERIOR]** Semi‑sextil (30°), quincunce/inconjunção (150°),
   quintil, biquintil, sesquiquadratura e semiquadratura **não são ptolomaicos**.
   Kepler (*Harmonices Mundi*, 1619) é o nome associado à introdução dos aspectos
   harmônicos menores ⚠️. Note que 30° e 150° são exatamente os intervalos que I.16
   classifica como **alheios** — usar quincunce como aspecto é inverter Ptolomeu,
   não continuá‑lo.

**[INVENÇÃO MODERNA]** Os valores numéricos de orbe que todo software usa (8° para
conjunção/oposição/quadratura/trígono, 6° para sextil) são **convenção moderna de
software**, sem fonte antiga. São defensáveis como convenção — não como tradição.

### 2.10 Trópico × sideral — **[FONTE PRIMÁRIA]** ✅, e é decisivo

**Ptolomeu escolhe explicitamente o zodíaco trópico**, e argumenta:

> "it is reasonable to reckon the beginnings of the signs also from the equinoxes
> and solstices […] because from our previous demonstrations we observe that their
> natures, powers, and familiarities take their cause from the solstitial and
> equinoctial starting‑places, **and from no other source**. For if other
> starting‑places are assumed, we shall either be compelled no longer to use the
> natures of the signs for prognostications or, if we use them, to be in error"
> — *Tetrabiblos* I.22

Ou seja: para Ptolomeu, o signo **é** o segmento de estação do ano. A constelação
de fundo é um nome herdado, não a coisa.

**[FONTE PRIMÁRIA / astronomia]** ⚠️ **Hiparco** (190–120 a.C.) descobre a
precessão comparando a posição de Spica com observações de Timocáris e Aristilo, e
estima **≥1° por século**. Ptolomeu confirma no *Almagesto*: 2°40′ em ~265 anos,
1° por século, ciclo de 36.000 anos. (Valor real: ~1° a cada 72 anos, ciclo de
~25.800 anos.)

**Consequência aritmética:** os dois zodíacos coincidiram há cerca de 2.000 anos e
hoje divergem ~24° ⚠️ (a diferença exata depende do *ayanamsa* escolhido — Lahiri,
Raman, Sri Yukteswar dão valores diferentes; **não há um número único e correto**,
e isso é em si **[DISPUTADO]**).

**Ofiúco** — **[INVENÇÃO MODERNA]** como "13º signo":
- Os limites das constelações da IAU são de **1930** (Delporte). Por eles, o Sol
  está "em" Ofiúco de ~29/11 a ~18/12 ⚠️.
- **Steven Schmidt**, *Astrology 14* (1970), propôs um zodíaco de 14 signos ⚠️.
- **Walter Berg**, *The 13 Signs of the Zodiac* (1995), popularizou a versão de 13
  — com adesão notável no Japão ⚠️.
- Contra‑argumento correto e citável: o zodíaco é dividido em **doze partes iguais
  desde o séc. V a.C.**, por definição, e **não** pelos limites de constelação da
  IAU. Ofiúco não "faltava": signo nunca foi constelação.

**O que o app é hoje:** `astronomy-engine` devolve longitude eclíptica **da data**
(`SunPosition().elon`, `Ecliptic(GeoVector(...))`), e `lib/signs.js` divide por 30 a
partir de 0° = equinócio vernal. **O Cosmic Guide é trópico.** Isso está correto e
é a escolha majoritária no Ocidente — mas **em lugar nenhum do app está escrito**.
Ver §4.

### 2.11 De onde vem o "caráter" nas fontes antigas — a pergunta central

Esta seção é o coração do documento. A pergunta era: **"ariano é impulsivo" é
antigo ou é do séc. XX?**

Resposta curta: **a estrutura é antiga; a psicologia é moderna; os adjetivos
específicos que o mercado usa são do séc. XX.** Em detalhe:

#### (a) Ptolomeu: caráter vem de MERCÚRIO e da LUA, não do signo solar ✅

*Tetrabiblos* III.13, "Of the Quality of the Soul" — **[FONTE PRIMÁRIA]**:

> "Of the qualities of the soul, those which concern the reason and the mind are
> apprehended by means of the condition of **Mercury** […]; and the qualities of
> the sensory and irrational part are discovered from […] **the moon**, and from
> the planets which are configurated with her"

**Ptolomeu não deriva caráter do signo solar. Ele nem cogita isso.** O Sol, no
*Tetrabiblos*, não é o significador do "eu".

#### (b) Ptolomeu deriva traços da MODALIDADE — e esses traços SÃO primários ✅

No mesmo capítulo III.13:

| Grupo | Ptolomeu, III.13 (Robbins), verbatim |
|---|---|
| **Solsticiais** (mod. "cardinais") | "souls fitted for dealing with the people, fond of turbulence and political activity, glory‑seeking, moreover, and attentive to the gods, noble, mobile, inquisitive, inventive, good at conjecture" |
| **Bicorpóreos** (mod. "mutáveis") | "complex, changeable, hard to apprehend, light, unstable, fickle, amorous, versatile, fond of music, lazy, easily acquisitive, prone to change their minds" |
| **Sólidos** (mod. "fixos") | "just, unaffected by flattery, persistent, firm, intelligent, patient, industrious, stern, self‑controlled, tenacious of grudges, extortionate, contentious, ambitious, factious, grasping, hard, inflexible" |

**Isto é ouro para o app.** As descrições modernas de cardinal/fixo/mutável —
"iniciador", "teimoso e constante", "adaptável e disperso" — têm **lastro primário
literal** em Ptolomeu, séc. II. É o pedaço da astrologia popular que **mais**
sobrevive à ida à fonte. Conteúdo do app sobre modalidade pode citar
`Tetrabiblos III.13` com segurança.

#### (c) Valens: caráter POR SIGNO existe — e é irreconhecível ✅

*Anthologiae* I.2 — **[FONTE PRIMÁRIA]**. Comparado ao que os apps escrevem hoje:

| Signo | Valens, I.2 (Riley), verbatim | O que o mercado escreve hoje |
|---|---|---|
| **Áries** | "brilliant, distinguished, authoritarian, just, hard on offenders, free, governing, bold in thought, boastful, great‑hearted, restless, unstable, haughty, inflated, intimidating, quickly changing, wealthy" | "impulsivo, pioneiro, energético" |
| **Leão** | "distinguished, noble, steady, just, haters of evil, independent, haters of flattery, beneficent, inflated with their lofty thoughts" | "vaidoso, dramático, generoso" |
| **Virgem** | "noble, modest, religious, burdened with care […] administrators of others' goods, trusted, good stewards, secretaries, accountants, actors" | "perfeccionista, crítico, detalhista" |
| **Libra** | "noble and just, **but malicious, covetous of others' goods**, average in fortune, losing their original possessions […] being in charge of measures, posts, and the grain supply" | "diplomático, indeciso, harmonioso" |
| **Escorpião** | "**tricky, base, thieves, murderers, traitors, incorrigible, destroyers of property, connivers**" | "intenso, magnético, reservado" |
| **Sagitário** | "noble, just, great‑hearted, judges, generous, loving their brothers and their friends" | "aventureiro, otimista, sincero" |
| **Capricórnio** | "**bad, warped. They pretend goodness and sincerity.** They are toilsome, burdened with care, insomniac, fond of jokes, plotters of great deeds […] fickle, criminal, lying" | "disciplinado, ambicioso, responsável" |

Três observações que mudam como se escreve conteúdo:

1. **A fonte antiga é moral e social, não psicológica.** Ela fala de status,
   ofício, riqueza, crime e reputação — não de "estilo emocional".
2. **A fonte antiga é condicional, não determinística.** Valens escreve, no Áries:
   *"**Depending on its relationship with the houseruler**, men born under this
   sign will be…"* e *"When the houserulers are favorably situated and have
   benefics in aspect, kings and powerful men are born"*. Ou seja: o signo **só**
   diz alguma coisa através da condição do seu regente. Sun‑sign incondicional não
   é o método antigo.
3. **A fonte antiga é brutal.** Nenhum produto de 2026 vai publicar "escorpiano é
   assassino e traidor". **Isso é a prova de que o texto do mercado NÃO desce da
   fonte antiga** — se descesse, teria esse tom. O texto do mercado é uma criação
   do séc. XX que herdou os *nomes* e trocou todo o *conteúdo*.

#### (d) Manílio: signo prediz OFÍCIO, não temperamento ✅

*Astronomica* IV.122ss — **[FONTE PRIMÁRIA]**. O verso latino associa cada signo a
uma atividade econômica:

- Áries: *"Dives fecundis Aries in vellera lanis / exutusque novis rursum spem
  semper habebit"* — lã, tosquia, comércio de tecido.
- Touro: *"Taurus simplicibus dotabit rura colonis / pacatisque labor veniet"* —
  lavoura.
- Gêmeos: *"Mollius e Geminis studium est et mitior aetas / per varios cantus"* —
  canto, música.
- Libra: *"Librantes noctem Chelae cum tempore lucis"* — pesos, medidas, direito.
- Capricórnio: *"Vesta tuos, Capricorne, fovet penetralibus ignes"* — forja, fogo,
  artes do calor.

Nada disso é "personalidade". É **classe e profissão** numa sociedade romana.

#### (e) Retrogradação: o princípio é antigo, o pacote é moderno ✅

**[FONTE PRIMÁRIA]** Valens, *Anthologiae* (seção de trânsitos):

> "If the stars are passed the first stationary point and are found to be
> retrograde, **they delay expectations, actions, profits, and enterprises**. […]
> If they are at [or passed] the second stationary point, **they cancel any delay
> and reinstate the same activities**."

Ptolomeu (I.8) trata estações apenas em termos de qualidade térmica (úmido do
nascer à 1ª estação, quente até o nascer vespertino, seco até a 2ª estação, frio
até o ocaso).

**[INVENÇÃO MODERNA]** O pacote "Mercúrio retrógrado = celular quebra, contrato dá
errado, ex reaparece, avião atrasa" **não está em fonte antiga nenhuma**. "Atraso"
está (Valens); a lista de itens tecnológicos e o próprio destaque de *Mercúrio* em
particular sobre os outros planetas retrógrados são folclore do séc. XX/XXI.
`lib/signs.js:isMercuryRetrograde()` calcula o fenômeno **corretamente**; o cuidado
é só com o texto que o acompanha.

### 2.12 O corte moderno — o que veio do séc. XIX/XX e não da antiguidade

| Quem | Quando | O que introduziu | Grau |
|---|---|---|---|
| **Alan Leo** (William F. Allan, 1860–1917) | *Modern Astrology* desde 1895 | Desloca a astrologia de **previsão** para **análise de caráter**; cunha "character is destiny"; **reduz o mapa ao Sol** para poder produzir leituras em escala. Teosofista — usou a rede da Sociedade Teosófica para distribuir. | [TRADIÇÃO POSTERIOR] ⚠️ |
| **R. H. Naylor** (1889–1952) | 24/08/1930 | Artigo "What The Stars Foretell For The New Princess" no *Sunday Express*, sobre a recém‑nascida princesa Margaret. Vira a coluna semanal "Your Stars", **dividindo os leitores em 12 blocos por data de nascimento**. **É a invenção do horóscopo de jornal.** O jornal precisou explicar aos leitores o que era um horóscopo — em 1930 quase ninguém sabia. | [TRADIÇÃO POSTERIOR] ⚠️ |
| **Marc Edmund Jones** | 1925 | Símbolos Sabianos (com a médium Elsie Wheeler); padrões de mapa (bowl, bucket, splash…). | [TRADIÇÃO POSTERIOR] ⚠️ não reconferido |
| **Dane Rudhyar** | *The Astrology of Personality*, **1936** | Funde astrologia com **psicologia junguiana**. Cria a "astrologia humanística": o mapa deixa de ser destino e vira mapa de potencial psicológico. **É daqui que vem o vocabulário de "autoconhecimento", "sombra", "integração" que o mercado inteiro usa hoje.** | [TRADIÇÃO POSTERIOR] ⚠️ |
| **Linda Goodman**, *Sun Signs* | 1968 | Fixa em prosa popular os retratos de personalidade por signo solar que viraram o padrão de mercado. | [TRADIÇÃO POSTERIOR] ⚠️ não reconferido |

**A resposta direta à pergunta do início:**

> **"Ariano é impulsivo" NÃO é antigo.** É a soma de:
> (1) Ptolomeu III.13, que dá "mobile, inquisitive, fond of turbulence" ao grupo
> **solsticial** (Áries, Câncer, Libra, Capricórnio) — e não a Áries sozinho;
> (2) a regência de **Marte** sobre Áries, com as qualidades marciais de I.4
> ("to dry and to burn");
> (3) **Alan Leo**, que reduz o mapa ao Sol (c. 1895‑1910);
> (4) **Naylor** (1930), que transforma isso em 12 caixinhas de jornal;
> (5) **Rudhyar** (1936) e a psicologia junguiana, que trocam o vocabulário
> social‑moral antigo por vocabulário psicológico;
> (6) **Goodman** (1968) e a indústria de revista, que fixam os adjetivos.
>
> Cada camada é rastreável. Nenhuma delas é da antiguidade.

---

## 3. O QUE A INTERNET REPETE E A FONTE NÃO SUSTENTA

A seção mais valiosa deste arquivo. Cada item: o que se diz → o que a fonte diz.

### 3.1 "Ptolomeu descreveu as personalidades dos doze signos"
**Falso.** ✅ Ptolomeu deriva caráter de **Mercúrio e da Lua** (III.13) e dos
**grupos de modalidade**, não do signo solar. Não existe no *Tetrabiblos* um
capítulo "as doze personalidades". Quem tem retrato signo a signo é **Valens**
(I.2) e **Manílio** (IV) — e o conteúdo deles é irreconhecível para o leitor de
hoje (§2.11c e §2.11d).

### 3.2 "Leão rege o coração desde a antiguidade"
**Falso na forma como é dito.** ✅ Em **Manílio** II.460 Leão recebe *"laterum
regnum scapulaeque"* — **flancos e omoplatas**. Em **Valens** (melotesia, Livro II)
Leão é *"the flanks, the loin, the heart, courage, vision, sinews"* — o coração
aparece, mas **junto com flancos e lombo**, não sozinho. E o coração é, em Valens
I.1, atribuído ao **SOL** ("of the trunk, it rules the heart"). A equação popular
"Leão = coração" é uma **transitividade tardia**: Sol rege o coração → Sol rege
Leão → "Leão rege o coração". `lib/zodiacBody.js` já marca esta entrada como
`lateLayer: true`. **Correto, e agora com corroboração independente em Valens.**

### 3.3 "Libra rege os rins"
**Falso nas fontes antigas.** ✅ **Manílio** II.462 dá a Libra as **nádegas**.
**Valens** (Livro II) dá a Libra *"the hips, buttocks, the colon, the genitals, the
hind parts"* — **nenhuma menção a rins**. Duas fontes independentes do séc. I e II
concordam entre si e discordam de praticamente todo site de astrologia médica. Os
rins entram com a astrologia médica do séc. XX (Daath 1914, Heindel 1929,
Cornell 1933 — ver `lib/zodiacBody.js`).

### 3.4 "A lista signo → parte do corpo está no *Tetrabiblos*"
**Falso.** ✅ *Tetrabiblos* III.xvii enumera a correspondência **PLANETÁRIA**. A
lista dos doze signos é de **Manílio**, *Astronomica* II.453‑465. Ptolomeu
pressupõe a correspondência signo/corpo, mas nunca a escreve.

### 3.5 "Ptolomeu dividiu os signos em fogo, terra, ar e água"
**Falso.** ✅ Ptolomeu organiza as triplicidades por **vento e direção** (I.18:
"Borrolibycon", "Notapeliotes", "preeminently northern"). Quem nomeia
fiery/earthy/airy/moist é **Valens** (II.1 e I.2). A atribuição elemental é antiga
e primária — só não é de Ptolomeu.

### 3.6 "'Cardinal, fixo, mutável' são termos antigos"
**Meio falso.** ✅ As **categorias** são primárias (Ptolomeu I.11); os **nomes** não
são dele. Ptolomeu diz *solsticial, equinocial, sólido, bicorpóreo*. No texto
integral de Robbins, "cardinal" aparece uma vez só, sobre **ventos** do horizonte.

### 3.7 "Os graus de exaltação (Sol 19° Áries etc.) vêm de Ptolomeu"
**Falso.** ✅ *Tetrabiblos* I.19 dá **só os signos**, e explica cada um pelo ciclo
das estações. Os graus são helenísticos/babilônicos, transmitidos por outras fontes
⚠️.

### 3.8 "A conjunção é o aspecto mais forte, segundo os antigos"
**Enganoso.** ✅ Em Ptolomeu a **conjunção nem é aspecto** (I.13 lista quatro:
oposição, trígono, quadratura, sextil). Signos coincidentes/contíguos são
**"disjunct" e "alien"** (I.16). Conjunção entra como *bodily application* em I.24,
categoria à parte.

### 3.9 "Quincunce/inconjunção (150°) é um aspecto tradicional"
**Falso, e é o contrário.** ✅ 150° e 30° são exatamente os intervalos que Ptolomeu
classifica em I.16 como **alheios** — sem nenhuma familiaridade. Os aspectos
menores são pós‑antigos (Kepler, 1619 ⚠️).

### 3.10 "Os orbes (8°, 6°…) são a tolerância tradicional"
**Falso.** Não existe tabela de orbes em graus no *Tetrabiblos* ✅ — os aspectos de
Ptolomeu são entre **signos inteiros**. As tabelas de orbe são convenção moderna,
e variam entre autores e softwares. Legítimas como convenção; ilegítimas como
"tradição".

### 3.11 "Nascer na cusp = ser um pouco dos dois signos"
**[INVENÇÃO MODERNA].** Não há fonte antiga para isso: as fronteiras de signo são
**exatas**, em grau. Nas fontes antigas o que existe entre signos é a divisão por
**termos** e **graus** — que dá regentes diferentes dentro do mesmo signo, e não
mistura de dois signos. A crença de "cusp" nasce de tabelas de data fixas em
almanaques e jornais (§3.12), que **de fato** erram o signo em cerca de 1 dia em
cada 3 viradas. A resposta certa não é "você é dos dois" — é **calcular a
longitude do Sol no instante do nascimento**.

### 3.12 "Áries começa sempre em 21 de março"
**Falso, e é mensurável.** ✅ Medido nesta pesquisa com o próprio motor do app
(`astronomy-engine`, meio‑dia UTC, 1940–2030):

| Medida | Resultado |
|---|---|
| Dias de virada testados (12 por ano × 91 anos) | 1.092 |
| Viradas em que a tabela fixa do app dá o signo **errado** | **318 → 29,1%** |
| Dias do calendário inteiro com signo errado | 355 de 33.238 → **1,07%** |
| Dias em que o Sol **muda de signo no meio do dia** (1990‑2010) | 251 de 7.670 → **3,27%** |

Ou seja: **quase um terço das datas de virada estão erradas em um ano qualquer**, e
~1 em cada 93 usuários recebe o signo solar errado. Em 3,27% dos dias, nenhuma
tabela baseada só em data pode acertar — depende da hora. Ver §4.1.

### 3.13 "Ofiúco é o 13º signo que os astrólogos escondem"
**[INVENÇÃO MODERNA].** ✅ O zodíaco é de doze partes **iguais** desde o séc. V a.C.
⚠️, e Ptolomeu (I.22) diz textualmente que os signos se contam a partir dos
equinócios e solstícios "and from no other source". Os limites de constelação da
IAU são de **1930**. Não há nada escondido: signo nunca foi constelação. (A
proposta de 13/14 signos é de Schmidt, 1970, e Berg, 1995 ⚠️.)

### 3.14 "Compatibilidade se mede pelo elemento dos signos solares"
**Sem fonte antiga.** ✅ Ptolomeu trata união em *Tetrabiblos* IV.5 ("Of Marriage")
e o critério é **outro**:

> "Marriages for the most part are lasting when in both the genitures **the
> luminaries** happen to be in harmonious aspect, that is, **in trine or in
> sextile** with one another, and particularly when this comes about by exchange;
> and even more when **the husband's moon is in such aspect with the wife's sun**.
> Divorces on slight pretexts […] occur when the aforesaid positions of the
> luminaries are in disjunct signs, or in opposition or in quartile."

Isto é sinastria **de luminares entre os dois mapas** — Sol e Lua, com aspecto
real. Não é "fogo combina com ar". A regra elemental de compatibilidade solar é
folclore de revista do séc. XX. **Boa notícia para o produto:** a regra de Ptolomeu
é *calculável com o que o app já tem* (§4.3).

### 3.15 "Cada signo tem uma pedra / cor / chakra / frequência em Hz"
**[INVENÇÃO MODERNA]** para chakras e frequências. Chakras são do tantra
hindu/budista e **não têm relação histórica com o zodíaco ocidental**; a fusão é do
esoterismo teosófico do séc. XIX/XX ⚠️. As "frequências solfeggio" (528 Hz, 432 Hz,
639 Hz) são invenção do séc. XX sem lastro antigo **nem** físico ⚠️. Pedras e
plantas por signo/planeta **têm** tradição real e datável (Culpeper, *The English
Physitian*, 1653 — o app já cita isso em `lib/zodiacBody.js`), mas a lista popular
de "pedra do signo" que circula hoje é comercial, do séc. XX.

### 3.16 "Urano rege Aquário desde sempre"
**Falso por definição:** Urano foi descoberto em **1781**. Aquário é domicílio de
**Saturno** em Ptolomeu I.17 ✅. Netuno (1846) → Peixes e Plutão (1930) → Escorpião
são camadas modernas. Além disso, **não achei quem propôs cada atribuição, nem
quando** — a própria Wikipédia fala em "consenso" sem nomear ninguém. Ver §8.

### 3.17 "Casas Placidus é o sistema tradicional"
**Enganoso.** O sistema de **Casas Inteiras** (Whole Sign) é o padrão da astrologia
helenística — é como Valens raciocina o tempo todo ✅ ("the 11th Place from the Lot
of Fortune", contando signos). Placidus é do séc. XVII (Placidus de Titis) ⚠️ e
virou padrão por causa de tabelas impressas no séc. XIX/XX. O app usa **Casas
Inteiras** (`lib/signs.js:398`) — que é, historicamente, a escolha **mais**
tradicional, não menos.

### 3.18 "Mercúrio retrógrado quebra aparelhos eletrônicos"
**[INVENÇÃO MODERNA].** ✅ O que a fonte antiga diz é "atraso": Valens — retrógrado
"delay expectations, actions, profits, and enterprises", e a 2ª estação "cancels
any delay". Nada sobre tecnologia, contratos ou ex‑namorados. E Ptolomeu (I.8)
trata estação como qualidade térmica.

---

## 4. ONDE ISTO TOCA O APP HOJE

Nenhum arquivo foi editado por esta pesquisa. Abaixo, o que **muda** ou **deveria
mudar** no que o app diz — com arquivo e linha.

### 4.1 `lib/signs.js:15` (`SIGNS[].range`) e `lib/signs.js:115` (`signoFromDate`) — **erro mensurável**

O `range` de cada signo é string fixa (`"21/03–19/04"`) e `signoFromDate` decide por
**mês+dia**, sem hora e sem efeméride. Medição da §3.12: **29,1% das datas de
virada erradas** num ano qualquer; **1,07% de todos os aniversários** recebem o
signo solar errado; e em **3,27% dos dias** o Sol muda de signo no meio do dia, o
que **nenhuma** tabela por data resolve.

**Ironia estrutural:** o app já tem a solução instalada. `planetPositions()`
(`lib/signs.js:435`) devolve a longitude do **Sol** via `astronomy-engine`, e já
aceita fuso (`instanteUtcMs`). O signo solar correto é
`Math.floor(lonSol / 30)` — a mesma linha que `moonSign` já usa para a Lua. Hoje o
app calcula a **Lua** com efeméride real e o **Sol** com uma tabela de almanaque.

**O que muda no texto:** enquanto a tabela fixa existir, o app não deveria afirmar
"seu signo é X" sem ressalva para quem nasce em dia de virada. E o `range` exibido
deveria vir com "aprox.".

### 4.2 `lib/signs.js:135` (`PAIRS`) e `lib/signs.js:204` (`PCT`) — compatibilidade

`compatibility()` casa apenas os **elementos** dos dois signos solares (10 pares) e
`compatPercent()` devolve um número fixo por par (`terra+água: 91`,
`fogo+água: 74`, fallback `82`). Usado em `screens/CompatibilityScreen.js:50-51`.

- A regra elemental de compatibilidade solar é **[INVENÇÃO MODERNA]** (§3.14).
- As **porcentagens não têm origem nenhuma** — nem antiga, nem moderna, nem
  estatística. São números escolhidos.

**Isto é aceitável como entretenimento** — o app é entretenimento e diz isso. O que
**não** é aceitável é o texto sugerir que há tradição por trás. Duas saídas, ambas
baratas:
1. **Rótulo honesto:** "índice de afinidade do Cosmic Guide, baseado nos elementos
   — não é medida tradicional nem estatística".
2. **Camada com fonte, por cima:** o app **já calcula** `planetPositions()` para
   duas pessoas (é o que `lib/personalSky.js` faz com trânsito×natal). Aplicar a
   regra de **Ptolomeu IV.5** — Lua de um em trígono/sextil ao Sol do outro, e
   luminares entre si — daria uma leitura de casal **com fonte primária citável**,
   usando matemática que já existe no repositório. Seria o primeiro recurso de
   compatibilidade do mercado brasileiro com locus.

### 4.3 `lib/signs.js:467` (`ASPECTS_TABLE`) e `lib/personalSky.js:13`

O comentário diz *"consenso Wikipedia/Astrotheme/Astrolibrary"*. Está **honesto** —
e agora dá para ser preciso: **[INVENÇÃO MODERNA / convenção de software]**. Não
existe orbe em graus no *Tetrabiblos*; os aspectos de Ptolomeu são entre signos
inteiros (§2.9). Além disso a tabela inclui **Conjunção**, que Ptolomeu **não**
conta como aspecto (I.13/I.16/I.24).

Nada disso é erro de produto — é a prática moderna padrão. Só **não pode** ser
apresentado ao usuário como "os antigos diziam".

### 4.4 `lib/signs.js:415` (`PLANETS`) — Urano, Netuno, Plutão

A lista dos "planetas clássicos" inclui Urano, Netuno e Plutão. Eles **não são
clássicos** — são de 1781, 1846 e 1930. O comentário do arquivo os chama de
clássicos. É só nomenclatura interna, mas se algum texto de tela herdar essa
palavra, vira afirmação falsa.

Impacto real em `screens/BirthChartScreen.js` (seção Aspectos) e em
`lib/personalSky.js`: quase metade dos aspectos listados envolve planetas que
**nenhuma fonte antiga conhecia**. Se o app quiser um dia oferecer "leitura
tradicional", o filtro é: só os sete de Ptolomeu.

### 4.5 `lib/signs.js:398` (`houses`) — Casas Inteiras: **está certo, e é um trunfo**

O comentário justifica Whole Sign por razões de engenharia (Placidus é indefinido
perto dos polos). A justificativa **histórica** é ainda melhor e não está escrita:
**Casas Inteiras é o sistema da astrologia helenística** — é assim que Valens conta
lugares o tempo todo ✅. O app escolheu, por engenharia, o sistema historicamente
mais antigo. Isso merece uma linha na tela (`screens/BirthChartScreen.js:191`, hoje
só "Casas (Casas Inteiras)").

### 4.6 O app é **trópico** — e não diz isso em lugar nenhum

Busca por `sideral|sidereal|trópico|tropical|Ofiúco|precess` em `lib/`, `screens/`,
`components/`, `test/`: **uma única ocorrência**, num comentário sobre precessão em
`lib/signs.js:414`.

`astronomy-engine` devolve eclíptica **da data** e o app divide por 30 a partir de
0° (equinócio vernal) → **zodíaco trópico**. Está correto e é a escolha padrão no
Ocidente. Mas:
- usuário que compara com app de astrologia védica vai ver signos diferentes e
  achar que o Cosmic Guide está quebrado;
- a pergunta "e o Ofiúco?" chega em todo suporte de app de astrologia, e a resposta
  é **excelente** (§3.13) — o app tem munição de fonte primária (Ptolomeu I.22) e
  não a usa.

**Recomendação de conteúdo:** uma linha em `screens/BirthChartScreen.js` e um item
de FAQ. É diferenciação real, custo quase zero.

### 4.7 `lib/grounding.js` — o padrão-ouro, com um ajuste

Este arquivo é o modelo a copiar: locus por afirmação, verbatim sem tradução, seção
`NAO_ACHADO`, bibliografia com URL, teste que quebra o build. Duas notas:

1. **Numeração mista** (§1, armadilha nº 1): `I.4` é Robbins, `I.xxi` é Ashmand, no
   mesmo arquivo. Não está errado — está inconsistente. Sugestão: `I.18 (Ashmand
   I.XXI)`.
2. **`NAO_ACHADO: 'terraPsicologia'`** — o comentário diz que não achou fonte antiga
   ligando signos de terra a "praticidade"/"aterrado". **Esta pesquisa confirma e
   refina:** não achei tampouco. O que **existe** é fonte primária para a
   **modalidade** (Ptolomeu III.13, §2.11b) — "sólidos" são "persistent, firm,
   patient, industrious, stern, inflexible". Isso é bem perto do que o mercado
   chama de "energia de terra", mas é **modalidade, não elemento**. Um ponto de
   conteúdo forte e não explorado.

### 4.8 `lib/zodiacBody.js` — corroboração nova, de graça

A auditoria do Homem Zodiacal se apoia em **Manílio**. Esta pesquisa achou uma
**segunda fonte antiga independente** que concorda: a melotesia de **Valens**
(*Anthologiae*, Livro II) ✅ —

- Leão: "the flanks, the loin, the heart, courage, vision, sinews" → **flancos e
  lombo** primeiro, exatamente como Manílio II.460;
- Libra: "the hips, buttocks, the colon, the genitals, the hind parts" → **nádegas
  e quadris**, **zero rins**, exatamente como Manílio II.462;
- Gêmeos: "shoulders, arms, hands, fingers, joints" → bate com II.458‑459;
- Câncer: "the chest, stomach, breasts" → bate com "pectus" de II.459‑460.

Duas fontes independentes, séc. I e séc. II, batendo entre si e batendo contra o
mercado inteiro. A tela do Homem Zodiacal pode passar de "Manílio diz" para "duas
fontes antigas independentes dizem" — que é um argumento muito mais forte, e é
verdade.

### 4.9 `theme.js:70` (`zodiacSigns`) — elementos e datas duplicados

`theme.js` guarda `element: 'Fogo'` (maiúscula, PT) e `dates: '21 Mar - 19 Abr'`;
`lib/signs.js:15` guarda `element: "fogo"` (minúscula) e `range: "21/03–19/04"`.
São **duas fontes de verdade** para o mesmo dado. Qualquer correção de data feita
em um lugar e não no outro cria divergência silenciosa entre telas. (Observação de
consistência de conteúdo, não de estilo.)

### 4.10 `lib/signs.js:231` (`FREQUENCIAS`)

`"528Hz · frequência do amor"`, `"432Hz · harmonia"` etc. **[INVENÇÃO MODERNA]**
(§3.15) — solfeggio é do séc. XX, sem lastro antigo nem físico. O código já rotula
a seção do casal como "só por diversão", e o app é entretenimento. Só não pode
migrar para nenhuma tela que se apresente como histórica ou informativa — em
particular **não pode** encostar em `GroundingScreen`/`ZodiacBodyScreen`, que são as
telas com pretensão documental.

---

## 5. RESUMO OPERACIONAL — o que pode e o que não pode escrever

**PODE afirmar como tradição, com locus:**
- Elementos dos 12 signos → **Valens, *Anthologiae* I.2 e II.1**
- Modalidades e seus traços de caráter → **Ptolomeu, *Tetrabiblos* I.11 e III.13**
- Domicílios clássicos e a razão geométrica deles → **Ptolomeu I.17**
- Exaltações/quedas **por signo** e o porquê estacional → **Ptolomeu I.19**
- Os quatro aspectos maiores e a justificativa musical → **Ptolomeu I.13**
- Zodíaco trópico, e por quê → **Ptolomeu I.22 e I.10**
- Qualidades térmicas dos sete planetas → **Ptolomeu I.4**
- Significações de vida dos planetas → **Valens I.1**
- Signo → ofício → **Manílio, *Astronomica* IV.122ss**
- Retrógrado = atraso; 2ª estação = destrava → **Valens**
- Sinastria por luminares em trígono/sextil → **Ptolomeu IV.5**
- Casas Inteiras como sistema helenístico → **Valens, passim**

**NÃO pode afirmar como tradição:**
- Personalidade por signo solar no formato moderno (é Leo/Naylor/Rudhyar/Goodman)
- Graus de exaltação atribuídos a Ptolomeu
- Orbes em graus como coisa antiga
- Conjunção como "o aspecto mais forte dos antigos"
- Quincunce/semi‑sextil como aspecto tradicional
- Compatibilidade por elemento solar
- "Cusp" como mistura de dois signos
- Datas fixas de início de signo
- Regência de Urano/Netuno/Plutão como antiga
- Chakras, solfeggio, pedra-do-signo como tradição astrológica
- "Cardinal/fixo/mutável" como palavras de Ptolomeu
- Mercúrio retrógrado quebrando eletrônicos

**Fórmula segura para tudo que for camada moderna:**
> "A astrologia do século XX, a partir de [autor, ano], passou a ler isto como […]"

Nunca "os antigos diziam".

---

## 6. TABELAS DE REFERÊNCIA RÁPIDA

### 6.1 Os doze signos com as marcações de origem

| Signo | Elemento (Valens ✅) | Modalidade (Ptolomeu I.11 ✅) | Domicílio (Ptol. I.17 ✅) | Exaltação (Ptol. I.19 ✅, signo) | Parte do corpo (Manílio ✅) |
|---|---|---|---|---|---|
| Áries | fogo | equinocial | Marte | **Sol** | cabeça |
| Touro | terra | sólido | Vênus | **Lua** | pescoço |
| Gêmeos | ar | bicorpóreo | Mercúrio | — | braços/ombros |
| Câncer | água | solsticial | Lua | **Júpiter** | peito (*pectus*) |
| Leão | fogo | sólido | Sol | — | flancos e omoplatas |
| Virgem | terra | bicorpóreo | Mercúrio | **Mercúrio** | ventre |
| Libra | ar | equinocial | Vênus | **Saturno** | nádegas |
| Escorpião | água | sólido | Marte | — | genitais |
| Sagitário | fogo | bicorpóreo | Júpiter | — | coxas |
| Capricórnio | terra | solsticial | Saturno | **Marte** | joelhos |
| Aquário | ar | sólido | Saturno | — | pernas |
| Peixes | água | bicorpóreo | Júpiter | **Vênus** | pés |

Queda = signo oposto à exaltação. Exílio = signo oposto ao domicílio.
**Nenhuma coluna desta tabela tem grau** — de propósito (§2.7, §3.7).

### 6.2 As sete potências planetárias (Ptolomeu I.4) ✅

| Planeta | Qualidade | Seita |
|---|---|---|
| Sol | esquenta, seca um pouco | diurna |
| Lua | umedece | noturna |
| Saturno | esfria e seca | diurna |
| Júpiter | esquenta e umedece (temperado) | diurna |
| Marte | seca e queima | noturna |
| Vênus | esquenta pouco, umedece muito | noturna |
| Mercúrio | alterna seco/úmido — **sem qualidade fixa** | comum |

---

## 7. FONTES SECUNDÁRIAS ÚTEIS (e como tratá-las)

- **Skyscript** (skyscript.co.uk) — traduções e artigos de tradicionalistas.
  Confiável para localizar passagens; **sempre** confira no texto.
- **Astrolibrary** (astrolibrary.org/library/tetrabiblos/) — *Tetrabiblos* por
  capítulo, numeração Robbins. Prático.
- **Sacred-texts** (sacred-texts.com/astro/ptb/) — Ashmand 1822, numeração
  diferente. **Bloqueia requisições automatizadas** (403) — abra no navegador.
- **Hellenistic Astrology: The Study of Fate and Fortune**, Chris Brennan (2017) —
  ⚠️ não consultado nesta pesquisa; é a síntese acadêmica moderna de referência
  para o período helenístico. **Próxima leitura prioritária.**
- **Neugebauer & van Hoesen, *Greek Horoscopes*** (1959) — a referência
  acadêmica para os graus de exaltação e para os horóscopos gregos sobreviventes.
  ⚠️ não consultado.
- **Wikipédia** — útil para datas e cronologia, **nunca** para o que um texto
  antigo diz. Foi ela, por exemplo, que não soube nomear quem atribuiu Urano a
  Aquário (§3.16).

---

## 8. O QUE ESTA PESQUISA PROCUROU E NÃO ACHOU

Registrar isto é parte do método (mesmo padrão de `NAO_ACHADO` em
`lib/grounding.js` e `NOT_VERIFIED` em `lib/zodiacBody.js`). Dizer "não achei" é mais
honesto que completar por dedução, e impede que a próxima pessoa preencha a lacuna
com a versão que circula por aí.

1. **Quem e quando atribuiu Urano→Aquário, Netuno→Peixes, Plutão→Escorpião.**
   Nenhuma fonte consultada nomeia autor ou data. A Wikipédia fala em "consenso".
   **Não use atribuição específica sem achar a fonte.**
2. **Primeira atestação de "signo cardinal"** nesse sentido. Sei que não é
   Ptolomeu (verificado no texto ✅) e que vem do latim *cardo*; não sei quem
   escreveu primeiro.
3. **Origem da ideia de "cusp"** como mistura de dois signos. Não achei nenhuma
   fonte antiga nem o primeiro autor moderno.
4. **Origem dos lemas "Eu sou / Eu tenho / Eu penso…"** por signo. Busca não
   concluída (orçamento de busca desta sessão esgotado). Suspeita forte de séc. XX,
   **não confirmada** — não afirme.
5. **Fonte antiga ligando signos de TERRA a "praticidade"/"pé no chão".**
   Não achei — confirma o `NAO_ACHADO.terraPsicologia` de `lib/grounding.js`. O que
   existe é fonte para a **modalidade** sólida (Ptolomeu III.13), que é outra coisa.
6. **Origem dos valores numéricos de orbe** (8°/6°). Sei que não são antigos ✅;
   não achei o primeiro autor a tabelar.
7. **Verificação direta de Fírmico Materno, Paulo de Alexandria e Doroteu.**
   Não li os textos nesta pesquisa. Tudo que este documento diz sobre eles está
   marcado ⚠️ e vem de fonte secundária.
8. **Datas de composição** de Manílio, Doroteu, Fírmico e Paulo. Usei as datações
   correntes ⚠️; não conferi a discussão filológica de nenhuma.
9. **Linda Goodman (1968) e Marc Edmund Jones / Símbolos Sabianos (1925).**
   Datas e atribuições correntes, ⚠️ não reconferidas nesta sessão.

---

## 9. BIBLIOGRAFIA

Sem tradução das citações verbatim (traduzir citação é falsificá-la — mesma regra
de `lib/zodiacBody.js` e `lib/grounding.js`).

**Fontes primárias**

- Cláudio Ptolomeu, *Tetrabiblos*, trad. F. E. Robbins (Loeb Classical Library,
  1940) — texto integral em PDF:
  https://qhpastrology.co.uk/wp-content/uploads/2017/10/Ptolemy-Claudius-1940-Tetrabiblos-Robbins-Edition.pdf
  · Capítulos usados: I.4, I.10, I.11, I.12, I.13, I.16, I.17, I.18, I.19, I.20,
  I.22, I.23, I.24, III.13, IV.5.
- Cláudio Ptolomeu, *Tetrabiblos*, trad. J. M. Ashmand (1822) —
  https://sacred-texts.com/astro/ptb/ (numeração diferente; ver §1)
- Cláudio Ptolomeu, *Tetrabiblos* por capítulo, numeração Robbins —
  https://astrolibrary.org/library/tetrabiblos/
- Vétio Valente, *Anthologiae*, trad. Mark T. Riley —
  https://www.skyscript.co.uk/pdf/pubs/texts/valens/riley/docs/Vettius_Valens_Riley.pdf
  · Passagens usadas: I.1 (naturezas dos astros), I.2 (natureza dos doze signos),
  II.1 (os triângulos e seus regentes), II.19 (exaltação do Sol e da Lua),
  melotesia do Livro II, seção de trânsitos (retrogradação).
- Marco Manílio, *Astronomica* — latim:
  https://www.thelatinlibrary.com/manilius2.html ·
  https://www.thelatinlibrary.com/manilius4.html
  · Passagens usadas: II.273‑289 (trigona e quadrata), II.453‑465 (melotesia),
  IV.122ss (ofícios por signo).
- Aristóteles, *Da Geração e Corrupção* II.3 —
  https://sacred-texts.com/cla/ari/ogc/ogc13.htm
- Doroteu de Sídon, *Carmen Astrologicum* — ed. e trad. David Pingree, Teubner,
  1976. ⚠️ não consultado.
- Júlio Fírmico Materno, *Mathesis* — trad. Jean Rhys Bram (1975). ⚠️ não
  consultado.
- Paulo de Alexandria, *Eisagogika* (378). ⚠️ não consultado.
- MUL.APIN — ed. Hunger & Pingree (1989). ⚠️ não consultado; visão geral em
  https://en.wikipedia.org/wiki/Mul.Apin

**Secundárias e de cronologia** (todas ⚠️, usadas só para datas e história moderna)

- https://en.wikipedia.org/wiki/Astrological_sign
- https://en.wikipedia.org/wiki/Domicile_(astrology)
- https://en.wikipedia.org/wiki/Exaltation_(astrology)
- https://en.wikipedia.org/wiki/Planets_in_astrology
- https://en.wikipedia.org/wiki/Sidereal_and_tropical_astrology
- https://en.wikipedia.org/wiki/Axial_precession
- https://en.wikipedia.org/wiki/Ophiuchus_(astrology)
- https://en.wikipedia.org/wiki/Dorotheus_of_Sidon
- https://en.wikipedia.org/wiki/R._H._Naylor
- https://en.wikipedia.org/wiki/Alan_Leo
- https://en.wikipedia.org/wiki/Dane_Rudhyar
- https://www.skyscript.co.uk/tetrabiblos.html (índice de capítulos de Robbins)
- Neugebauer & van Hoesen, *Greek Horoscopes* (1959) — referência dos graus de
  exaltação. ⚠️ não consultado.
- Chris Brennan, *Hellenistic Astrology: The Study of Fate and Fortune* (2017).
  ⚠️ não consultado — **leitura prioritária para a próxima rodada.**

**Medições feitas nesta pesquisa** (reproduzíveis)

- Deriva das datas de signo solar: `astronomy-engine` (já em `node_modules/`),
  `SunPosition().elon`, meio‑dia UTC, 1940–2030, comparado com
  `lib/signs.js:signoFromDate`. Resultados em §3.12.

---

## 10. HISTÓRICO DESTE ARQUIVO

| Data | O que mudou |
|---|---|
| 2026‑07‑31 | Criação. Fundamentos: signos, planetas, elementos, modalidades, regências, dignidades, aspectos, trópico×sideral, origem dos adjetivos de personalidade. Fontes lidas diretamente: *Tetrabiblos* (Robbins, integral) e *Anthologiae* (Riley, integral). |

**Quem editar este arquivo:** acrescente linha aqui, e nunca remova uma marcação de
grau sem ter ido ao texto. Se for rebaixar uma afirmação de FONTE PRIMÁRIA para
TRADIÇÃO POSTERIOR, diga onde procurou.
