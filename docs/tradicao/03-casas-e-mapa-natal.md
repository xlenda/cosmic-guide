# TRADIÇÃO 03 — Casas e Mapa Natal

**O que é este arquivo.** Base de referência sobre as casas astrológicas, o
Ascendente, os ângulos e os sistemas de divisão de casas. Cada afirmação carrega
obra, autor, século e, quando existe, a citação literal. **Consulte ANTES de
escrever qualquer conteúdo novo do app que mencione casa, Ascendente,
Meio-do-Céu, cúspide ou "sistema de casas".** É o equivalente, para o conteúdo,
do que a suíte de testes é para o código: existe para impedir que a gente
repita erro de internet.

**Como ler os selos de grau.** Toda afirmação abaixo está marcada:

| Selo | Significa |
|---|---|
| **FONTE PRIMÁRIA** | O texto antigo diz isso. Referência exata dada. |
| **TRADIÇÃO POSTERIOR** | Surgiu depois, com autor e data conhecidos. Legítimo, mas não é "o que os antigos diziam". |
| **INVENÇÃO MODERNA** | Circula na internet, sem lastro em fonte nenhuma. Não escrever como se fosse tradição. |
| **DISPUTADO** | Fontes ou especialistas divergem. Diz-se quais. |
| **MEDIDO AQUI** | Número calculado por mim com a `astronomy-engine` do próprio repositório. Método descrito, reproduzível. |

**Regra de ouro.** Fonte inventada ou atribuída ao autor errado é pior que
ausência de fonte: contamina tudo que vem depois. Onde eu não achei, está
escrito "não encontrei fonte".

---

## 1. Vocabulário — o primeiro erro começa aqui

**FONTE PRIMÁRIA.** O que hoje chamamos de "casa" os antigos chamavam de
**lugar** — grego *tópos* (τόπος), latim *locus*. A palavra "casa" (grego
*oîkos*, latim *domus*) significava outra coisa: o **signo** considerado em
relação ao planeta que o rege. Vênus tem "casa" em Touro e Libra; isso é
domicílio, não é a Casa 2 nem a Casa 7.

> "in ancient and also in much of medieval astrology what we now call `houses'
> were called `places' (Greek τόποι, Latin loci). The term `house' (Greek
> οἶκος, Latin domus) at that time was used to designate a sign whenever that
> sign was referred to in relation to the one or more planets that were believed
> to […] rule or govern […] that sign."
> — Robert Hand, *Signs as Houses (Places) in Ancient Astrology*, **Culture and
> Cosmos** vol. 11, nº 1–2 (2007), p. 135–136.

Termos gregos que aparecem nas fontes e que o conteúdo do app pode usar sem medo,
desde que traduzidos:

| Grego | Tradução | O que é |
|---|---|---|
| *horoskópos* (ὡροσκόπος) | "marcador da hora" | O Ascendente. Literalmente "o que observa a hora". |
| *zṓidion* (ζῴδιον) | signo | Um dos doze signos. **Nas fontes antigas, "o enésimo *zoidion* a partir do horoskopos" É a definição de casa.** |
| *tópos* (τόπος) | lugar | O que hoje chamamos casa. |
| *kéntron* (κέντρον) | pivô / ângulo | Asc, MC, Desc, IC. Latim *cardo* → "cardinal", "angular". |
| *epanaphorá* (ἐπαναφορά) | pós-ascensão | Casas sucedentes (2, 5, 8, 11). |
| *apóklima* (ἀπόκλιμα) | declínio | Casas cadentes (3, 6, 9, 12). |

**INVENÇÃO MODERNA** — a palavra "horóscopo" para designar o mapa inteiro.
Hand rejeita explicitamente o uso: "*The use of the word `horoscope' to
designate the entire chart is modern, and inappropriate given the original use
of the word*" (Hand 2007, nota 9). Originalmente *horoskopos* = o grau ou signo
ascendente, só.

---

## 2. Fontes primárias — o que ler e onde

Ordem cronológica. Onde há edição/tradução acessível na internet, o link está
dado.

| Obra | Autor | Data | Onde ler |
|---|---|---|---|
| *Astronomica* | Marcus Manilius | c. 10–20 d.C. | Loeb Classical Library, trad. G. P. Goold (1977). Livro II descreve os *templa*; Livro III, o círculo dos *athla* (um SEGUNDO esquema de doze, diferente). |
| *Pínax* (sumário) | Trasilo | c. 20 d.C. | Só sobrevive um resumo, em *CCAG* vol. 8 parte 3, p. 99–101. Contém já os nomes das casas ligados às alegrias planetárias. |
| *Anthologiae* (Antologias) | Vétio Valente | c. 150–175 d.C. | Trad. inglesa integral de Mark T. Riley, PDF livre: `skyscript.co.uk/pdf/pubs/texts/valens/riley/docs/Vettius_Valens_Riley.pdf`. Livro II caps. 4–16 = os doze lugares. Livro III cap. 2 = a trissecção de quadrantes. Livro V cap. 6 = o MC que "flutua". |
| *Tetrabiblos* | Cláudio Ptolomeu | c. 150 d.C. | Loeb, trad. F. E. Robbins (1940). Edições gregas: Boer–Boll (Teubner 1940/1957), Hübner (Teubner 1998). III.10–11 (numeração varia por edição) = lugares aféticos. |
| *Thesaurus* | Antíoco de Atenas | prov. séc. II d.C. | Cap. 46. Trad. Robert Schmidt (Berkeley Springs, 1993). Fonte real do "sistema de Porfírio". |
| *Mathesis* | Júlio Fírmico Materno | c. 335 d.C. | Ed. Kroll–Skutsch–Ziegler, Teubner. Livro II caps. 14–21 = os lugares. Livro VI cap. 32 = lugares definidos como signos inteiros. |
| *Eisagōgiká* (*Introductory Matters*) | Paulo de Alexandria | **378 d.C.** (data no próprio texto) | Trad. Robert Schmidt / ed. Robert Hand, Project Hindsight. Texto completo em `archive.org/download/livingsignsii/Paulus Alexandrinus - Introductory Matters_djvu.txt`. **Cap. 24 = a exposição sistemática mais clara dos doze lugares em toda a antiguidade. Cap. 30 = o MC.** |
| *Eisagōgē* (Introdução ao Tetrabiblos) | atribuída a Porfírio | séc. III (mas citando Antíoco) | Cap. 43. *CCAG* 5/4, p. 226; ed. Basileia 1559. |
| *Apotelesmatiká* | Hefestião de Tebas | c. 415 d.C. | Ed. Pingree. Livro II.18 preserva mapas de Antígono de Niceia. |
| *Compendium* | Retório de Egito | séc. VI–VII d.C. | Cap. 54 (as alegrias e os nomes dos lugares). |
| Comentário a Paulo | Olimpiodoro | 564 d.C. | Cap. 23. Trad. Greenbaum, *Late Classical Astrology* (2001). |
| Mapas documentais | — | 71 a.C. – séc. VI d.C. | O. Neugebauer & H. B. van Hoesen, *Greek Horoscopes* (Philadelphia, 1959); Alexander Jones, *Astronomical Papyri from Oxyrhynchus* (Philadelphia, 1999). **Estes são a evidência material, não literária.** |

Bibliografia moderna essencial na seção 9.

---

## 3. O Ascendente (*horoskopos*)

### 3.1 O que é

**FONTE PRIMÁRIA.** O grau da eclíptica que sobe no horizonte leste no instante
exato do nascimento, no local exato do nascimento. Paulo de Alexandria, cap. 24
(378 d.C.), abre a exposição dos doze lugares assim:

> "Of the twelve places which are taken in relation to every drawing up of
> effects, the origin and foundation is the Horoskopos, through which everything
> bearing upon man is apprehended. For, the Horoskopos is the giver of life and
> breath, whence it is called the 'helm.'"
> — Paulo de Alexandria, *Introductory Matters*, cap. 24 (trad. Schmidt).

"O leme" (*oíax*). O Ascendente não é "como o mundo te vê" nas fontes antigas —
essa é uma leitura moderna (ver 7.14). Nas fontes é **a origem e o fundamento**:
o ponto a partir do qual toda a estrutura do mapa é contada.

**FONTE PRIMÁRIA.** Fírmico Materno diz a mesma coisa em latim:

> "In hoc loco vita hominum et spiritus continetur, ex hoc loco totius geniturae
> fundamenta noscuntur." — *Mathesis* II, 19.2.
> ("Neste lugar se contêm a vida e o sopro dos homens; deste lugar se conhecem
> os fundamentos de toda a genitura.")

### 3.2 Por que ele, e não o Sol

**FONTE PRIMÁRIA / historiografia.** Porque o método antigo de cálculo partia
dele. Hand demonstra que os astrólogos gregos **calculavam o Ascendente
diretamente**, a partir do tempo decorrido desde o nascer ou pôr do Sol mais
próximo, usando as tabelas de tempos de ascensão dos signos — e que o MC
verdadeiro **não era necessário** nesse procedimento (Hand 2007, p. 139–140).
A própria palavra *horoskopos* já indica isso: "the import of the word
`horoscope' clearly indicates that the ascending degree was regarded from the
beginning as the decisive factor" (Hand 2007, p. 140).

**MEDIDO AQUI** — evidência material. Hand tabulou os mapas sobreviventes:

| Corpus | Total | Com Ascendente | Com Meio-do-Céu | Com cúspides intermediárias |
|---|---|---|---|---|
| Jones, *Oxyrhynchus* (1999) | 81 | 45 | 4 | **0** |
| Neugebauer & van Hoesen (1959), literários | 168 | maioria | 27 | 2 |
| Neugebauer & van Hoesen, não-literários | 51 | maioria | 2 | — |
| **Total** | **~300** | — | **32** | **2** |

(Hand 2007, p. 141–142, citando J. D. North, *Horoscopes and History*, 1986, p. 6.)

Dois mapas em trezentos têm cúspides intermediárias. Não é incompetência —
é que o sistema em uso **não precisava** delas.

### 3.3 A precisão que ele exige

O Ascendente muda de signo a cada ~2 horas em média. Hora chutada é quase
cara-ou-coroa entre dois signos. Isso já está codificado no app
(`lib/signs.js:302-306`, `ascendantSign()` devolve `null` sem hora e cidade) e
é a política certa — a fonte antiga também exige o instante exato, porque é do
grau exato que sai o signo ascendente.

---

## 4. Os ângulos (*kentra*)

**FONTE PRIMÁRIA.** Quatro pontos, definidos pela interseção da eclíptica com o
horizonte e com o meridiano:

| Ponto | Grego / latim em Paulo | Lugar antigo |
|---|---|---|
| Ascendente | *horoskopos*, pivô que marca a hora do nascimento | 1º |
| Meio-do-Céu | *mesouránēma*, "pivô do sul", "pivô no pico" | 10º (**nem sempre** — ver 5.4) |
| Descendente | *dýsis*, "Anti-Horoskopos", pivô poente | 7º |
| Fundo do Céu | *hypógeion*, "Subterrâneo", "Anti-culminação", pivô do norte | 4º |

**FONTE PRIMÁRIA — os quadrantes e as idades da vida.** Paulo, cap. 7:

> "The first quadrant, that from the degree marking the birth-hour to the
> culminating degree, is masculine. […] It signifies the first age — I mean
> youth. The second quadrant, from the culminating degree to the setting degree
> […] signifies the age after youth, which is middle-age. The third quadrant,
> from the setting degree to the subterraneous degree […] signifies old-age. The
> fourth quadrant, from the subterraneous degree to the degree marking the
> birth-hour […] signifies elderly age until the end at death."
> — Paulo de Alexandria, *Introductory Matters*, cap. 7.

**FONTE PRIMÁRIA — a tríade angular/sucedente/cadente.** Paulo, cap. 27: "*There
being four pivots, four post-ascensions, and four declines…*" Quatro pivôs
(*kentra*: 1, 4, 7, 10), quatro pós-ascensões (*epanaphorai*: 2, 5, 8, 11),
quatro declínios (*apoklimata*: 3, 6, 9, 12). Essa é a hierarquia de força mais
antiga que existe sobre as casas: angular > sucedente > cadente.

**Nota de rigor.** Paulo já matiza: no cap. 27 ele diz que mesmo um declínio
"produz atualização não ordinária" quando o planeta lá lança raios a um pivô.
"Cadente = fraco, ponto final" é simplificação moderna.

---

## 5. Os doze lugares — o que as fontes de fato dizem

### 5.1 A lista de Paulo de Alexandria (378 d.C.), cap. 24

Esta é **a** referência. Reparar na fórmula que abre cada item: *"The Nth
zoidion from the Horoskopos"* — "o enésimo **signo** a partir do Ascendente".
Não "os trinta graus a partir de", não "a cúspide". **Signo.** Isto é o sistema
de Casas Inteiras enunciado sem ambiguidade nenhuma, doze vezes seguidas.

| # | Nomes em Paulo | Significações em Paulo | Alegria planetária |
|---|---|---|---|
| 1 | *Horoskopos*, "o leme" | vida e sopro; estação da juventude; sobrevivência e criação da criança | **Mercúrio** |
| 2 | Vida (*bios*), **Porta do Hades**, pós-ascensão do Horoskopos | sustento/modo de vida; herdeiros de outros; "doador de boas expectativas"; com maléficos, perda de bens | — |
| 3 | **Deusa**, lugar da Lua, Bom Declínio | irmãos; **amizade e patrocínio**; aquisição de bens; viver no estrangeiro (por oposição ao 9º) | **Lua** |
| 4 | Subterrâneo, Anti-culminação | velhice, **fim da vida**, o corpo depois de morto, tudo que vem depois da morte; terras, fundações, pais, pátria, casa, permanência; navios e lugares aquáticos | — |
| 5 | **Boa Fortuna**, lugar próprio de Afrodite | **filhos** | **Vênus** |
| 6 | **Má Fortuna**, Retribuição, Pré-poente, Declínio Baixo, lugar de Ares | **ferimento/dano**; escravas e fêmeas de serviço; inimizades, tramas e rebeliões vindas delas | **Marte** |
| 7 | Anti-Horoskopos, pivô poente | preparativos de casamento; longas estadas no estrangeiro; **a qualidade da morte**; a idade avançada | — |
| 8 | **Ocioso** (*argós*) | "a completude da vida"; lucro vindo de mortes, heranças | — |
| 9 | **Deus** (*theós*), Pré-culminação, lugar do Sol, Bom Declínio | deuses, **sonhos**, viver no estrangeiro, **astronomia**; místicos, adivinhos, ritos sagrados | **Sol** |
| 10 | Meio-do-Céu, "bifurcação da parte alta", pivô do sul | **trabalho** (*praxis*), reputação, valor, aliança, privilégio, pátria, permanência; "**indicador do casamento e dos filhos varões**"; atualizações a partir da meia-idade | — |
| 11 | **Boa Divindade** (Bom Daimon), lugar próprio de Zeus | aliança e patrocínio; **boas expectativas** | **Júpiter** |
| 12 | **Espírito Mau** (Mau Daimon), pré-ascensão do Horoskopos, lugar verdadeiro de Cronos | sofrimentos, **parto**, **inimigos**, escravos varões, **quadrúpedes** | **Saturno** |

### 5.2 A lista de Vétio Valente (c. 150–175 d.C.), Livro II caps. 4–16

Mesmo esqueleto, cem/duzentos anos antes, com diferenças reais que importam:

**FONTE PRIMÁRIA.** A tabela do cap. 15K;16P ("Nove Nomes dos Lugares", trad.
Riley) dá pares nome→significação:

| Nome do lugar | Significação em Valente |
|---|---|
| O Deus ⟨IX⟩ | **o pai** |
| A Deusa ⟨III⟩ | **a mãe** |
| O Bom Daimon ⟨XI⟩ | **filhos** |
| A Boa Fortuna ⟨V⟩ | **casamento** |
| O Mau Daimon ⟨XII⟩ | doenças |
| A Má Fortuna ⟨VI⟩ | ferimentos |
| Sorte da Fortuna + o Ascendente ⟨I⟩ | vida e sustento |
| Daimon (a Sorte do Espírito) | atividade mental |
| Meio-do-Céu ⟨X⟩ | ação / ocupação |
| Eros ("Amor") | desejo |
| Necessidade | inimigos |

**Repare em três coisas que contrariam o senso comum moderno:**

1. **Valente põe FILHOS no XI e CASAMENTO no V** — invertido em relação ao
   padrão moderno (5º=filhos, 7º=casamento). Paulo, dois séculos depois, já põe
   filhos no V. **DISPUTADO** entre autores antigos; não escrever "a tradição
   sempre disse que a Casa 5 é dos filhos".
2. **Valente põe pai no IX e mãe no III**, não no 4º/10º. Ptolomeu usa ainda um
   terceiro esquema (signo do Sol e de Saturno para o pai, de Vênus e da Lua
   para a mãe — *Tetrabiblos* III.4/III.6).
3. **Os quatro últimos itens não são lugares, são Sortes** (*klēroi*, "lots"):
   Fortuna, Daimon/Espírito, Eros, Necessidade. Valente conta lugares
   **também a partir da Sorte da Fortuna**, não só do Ascendente (Livro II caps.
   3, 4, 18, 20, 21; e Valens II, 20K;21P, "O 11º Lugar ⟨relativo à Sorte⟩ da
   Fortuna"). Manilio faz o mesmo (*Astronomica* III.96–204). Ou seja: **o mapa
   antigo tinha mais de um "ponto zero"**.

**FONTE PRIMÁRIA — Valente fala em SIGNO o tempo todo.** No cap. 13K;14P: "*If
Mercury is with the moon **in the Sign of the Goddess***…" — "no Signo da
Deusa", não "no terceiro lugar". No cap. 5: "*Whenever these three stars fall in
**this sign**…*" falando do XII. A linguagem é sign-como-lugar, sem exceção.

### 5.3 As alegrias planetárias — a chave que explica os nomes

**FONTE PRIMÁRIA + TRADIÇÃO POSTERIOR (a tese é moderna, os dados são antigos).**
O esquema das alegrias (*chairetismoi*, "regozijos"): Mercúrio no 1º, Lua no 3º,
Vênus no 5º, Marte no 6º, Sol no 9º, Júpiter no 11º, Saturno no 12º.

Fontes primárias das alegrias: **Paulo, *Introduction*, 24; Olimpiodoro,
*Commentary*, 23; Fírmico, *Mathesis*, II, 15–19; Retório, *Compendium*, 54**
(lista dada por Chris Brennan, *The Planetary Joys and the Origins of the
Significations of the Houses and Triplicities*, **ISAR International Astrologer**
vol. 42 nº 1, abril 2013, p. 27–42, nota 2).

A tese de Brennan (2013): **os nomes dos lugares vêm das alegrias.** O 11º se
chama "Bom Daimon" porque Júpiter (benéfico) se alegra ali; o 12º "Mau Daimon"
porque Saturno (maléfico) se alegra ali; o 5º "Boa Fortuna" (Vênus), o 6º "Má
Fortuna" (Marte); o 9º "Deus" (Sol), o 3º "Deusa" (Lua). Os quatro ângulos não
têm nome desse tipo — porque nenhum planeta se alegra neles.

**Datação.** Brennan mostra que as alegrias já aparecem em **Trasilo** (astrólogo
de Tibério, morto em 36 d.C.) e em **Manílio** — dois contemporâneos que escrevem
no início do séc. I d.C. — o que empurra a doutrina para o **fim do séc. I a.C.**
(Brennan 2013, p. 4–5). Manílio é a **única** exceção conhecida: usa um esquema
alternativo de alegrias (Brennan 2013, nota 3 e p. 6).

**Por que isso importa para o app:** as significações das casas não são
arbitrárias nem "energia do signo correspondente". Elas têm uma lógica
reconstruível. Conteúdo que explica *por que* o 12º é difícil (é o lugar de
Saturno, e é invisível/em aversão ao Ascendente) vale dez vezes mais que
conteúdo que só afirma.

### 5.4 A lógica de aversão — por que 2, 6, 8 e 12 são os lugares ruins

**FONTE PRIMÁRIA.** Paulo, cap. 24, sobre o oitavo lugar:

> "The eighth zoidion from the Horoskopos is called **idle, because it is in
> aversion and disjunct to the zoidion that marks the birth hour**."

Isto é decisivo e quase nunca aparece na internet. Os aspectos antigos são
**contados entre signos inteiros**: o 3º e o 11º fazem sextil com o 1º, o 5º e
o 9º fazem trígono, o 4º e o 10º fazem quadratura, o 7º faz oposição. Sobram
**2, 6, 8 e 12** — os quatro signos que **não fazem aspecto nenhum** com o signo
ascendente. Estão "em aversão" (*apóstrophos*), literalmente virados de costas.

E é exatamente essa a lista dos lugares que a tradição chama de ruins ou
inoperantes. **A significação negativa deles é derivada da geometria — e a
geometria só fecha se as casas forem signos inteiros.** Num sistema de
quadrantes, uma cúspide de Casa 8 pode cair num signo que faz trígono com o
signo ascendente, e a explicação evapora.

Este é o argumento nº 2 de Chris Brennan (*12 Reasons Why Whole Sign Houses is
the Best System of House Division*, palestra 2015): "*many of them only make
sense conceptually in the context of WSH […] Same logic doesn't hold up in
quadrant houses*".

**Confirmação cruzada na própria Paulo:** ele nota que o 2º lugar, mesmo em
aversão ao 1º, "*is harmonious with the culminating zoidion due to a left
triangle*" — o 2º faz trígono com o 10º. Contagem por signo, de novo.

---

## 6. Os sistemas de casas — um por um

### 6.0 O quadro geral, em uma tabela

| Sistema | Divide o quê | Autor a quem o nome é dado | Século do nome | Origem real |
|---|---|---|---|---|
| **Casas Inteiras** (Whole Sign) | nada — usa os signos | ninguém (nome moderno, cunhado por Schmidt & Hand nos anos 1990) | — | **Séc. I a.C.**, o sistema original |
| **Iguais** (*modus equalis*) | 30° a partir do grau do Asc | ninguém | — | Antiguidade; leitura possível (não certa) de Ptolomeu e Fírmico |
| **Porfírio** | trissecção dos quadrantes em longitude | Porfírio (233–305?) | III | **Antíoco de Atenas** (séc. II) e **Valente III.2** |
| **Alcabitius** | semi-arcos diurno/noturno do Ascendente | al-Qabisi († 967) | X | Mapa de **Retório, 428 d.C.** |
| **Campanus** | vertical primário em 12 fusos | Campanus de Novara (c. 1220–1296) | XIII | Campanus (ou anterior) |
| **Regiomontanus** (*modus rationalis*) | equador celeste em 12 arcos de 30° | Johannes Müller de Königsberg (1436–1476) | XV | **Abraham ibn Ezra** († 1167) |
| **Placidus** | semi-arcos de cada grau da eclíptica | Placido de Titis (1603–1668) | XVII | **Magini (1555–1617)** e antes ibn Ezra |
| **Morinus** | equador celeste em 12 | Jean-Baptiste Morin (1583–1656) | XVII | Morin |
| **Koch / Birthplace** | horizonte em instantes diferentes | Walter Koch (1895–1970) | XX | **Zanzinger e Specht** |
| **Topocêntrico** (Polich–Page) | tangentes da elevação polar | Polich (1892–1979) e Page (1919–1970) | XX | os próprios |

(Datas e atribuições de autoria: documentação do **Swiss Ephemeris /
Astrodienst**, `astro.com/swisseph/sweph_ht_e.htm`, seção "Tables of Houses".)

### 6.1 Casas Inteiras (Whole Sign) — **o sistema da antiguidade**

**Definição.** O signo onde cai o Ascendente é a Casa 1 inteira, de 0° a 30°,
não importa se o Asc está a 1° ou a 29°. O signo seguinte é a Casa 2, e assim
por diante. Cúspide de casa = cúspide de signo. **O Ascendente não é a cúspide
da Casa 1 — é um ponto sensível flutuante dentro dela.**

**FONTE PRIMÁRIA.** Já dada acima em três camadas independentes:

1. **Paulo de Alexandria, cap. 24 (378 d.C.)** — "the Nth *zoidion* from the
   Horoskopos", doze vezes. É a formulação mais explícita que sobreviveu.
2. **Fírmico Materno, *Mathesis* VI, 32.3 (c. 335 d.C.)** — sobre o lugar do pai:
   > "*ab horoscopi parte incipiens hunc numerum […] divides, reddens triginta
   > partes singulis signis; et in quo signo novissima pars ceciderit, ipsum
   > tibi **signum locum** patris monstrat.*"
   > ("…dividirás esse número dando trinta graus a cada signo; e no signo em que
   > cair o último grau, **esse mesmo signo te mostra o lugar** do pai.")
   Hand comenta: "*Here the text unambiguously defines a `place' as a sign, not
   any thirty-degree patch. There is no `interpretation' of the Latin here*"
   (Hand 2007, p. 145).
3. **Valente, Livro V cap. 6 (c. 175 d.C.)** — o teste decisivo, ver 6.9 abaixo.

**Historiografia.** Quem descobriu isso, e quando:

- **James Holden**, *Ancient House Division*, **AFA Journal of Research**, 1982
  — primeiro a apontar que as casas inteiras eram o sistema original do
  Ocidente.
- **Robert Schmidt e Robert Hand**, meados dos anos 1990 (Project Hindsight) —
  confirmam e cunham o termo em inglês *"whole sign houses"*.
- **Robert Hand**, *Whole Sign Houses: The Oldest House System* (ARHAT, 2000) e
  o artigo revisado por pares em *Culture and Cosmos* (2007).
- **Chris Brennan**, *Hellenistic Astrology: The Study of Fate and Fortune*
  (Amor Fati Publications, 2017), 670 pp. — a síntese acadêmica atual.

**Continuidade viva.** Casas inteiras nunca morreram: são o sistema dominante na
astrologia indiana até hoje, onde o mapa assim construído se chama *rāśi chakra*
(Hand 2007, p. 160 e nota 53–54). A astrologia helenística foi transmitida à
Índia no séc. II d.C. e a transmissão lá foi mais estável que a ocidental.

**Também na tradição árabe primitiva.** **FONTE PRIMÁRIA.** Māshā'allāh
(fl. 762–815), *De Receptione* cap. X (trad. latina de João de Sevilha, ed.
Nuremberg 1549):

> "*…et si esset cum Saturno in **decimo signo**, esset adhuc velocius. Et in
> **signo ascendente** esset velocius prae caeteris locis.*"
> ("…e se estivesse com Saturno no **décimo signo**, seria ainda mais rápido. E
> no **signo ascendente** seria o mais rápido de todos os lugares.")

*Signum*, não *locus*. Idem em *De Revolutione Annorum Mundi* cap. VI:
"*Et **signum undecimum** est infra occasum…*" (Hand 2007, p. 158–159).

### 6.2 Casas Iguais (*modus equalis*)

**Definição.** A Casa 1 começa **no grau exato do Ascendente** e cada casa tem
exatamente 30° a partir dali. O MC não é a cúspide da 10ª.

**DISPUTADO.** Duas fontes antigas são invocadas para o sistema igual, e **as
duas são ambíguas**:

- **Fírmico, *Mathesis* II, 19.2–3**: "*hic locus […] vires suas **per residuas
  partes XXX** extendit*". Jean Rhys Bram traduz *residuas* como "following"
  ("os trinta graus seguintes"), o que tornaria a passagem inequivocamente
  "casas iguais". Hand contesta a tradução: "*the Latin adjective residuus […]
  does not mean `following'. It means only `the remaining' or `the rest of'*"
  (Hand 2007, p. 144). E o próprio Fírmico usa signos inteiros no Livro VI
  (acima). **Veredito de Hand: "dubious".**
- **Ptolomeu, *Tetrabiblos* III.10–11**: ver 6.8 abaixo. **Veredito de Hand:
  "possibly hopelessly" ambíguo.**

**TRADIÇÃO POSTERIOR.** As casas iguais tiveram um renascimento na escola
britânica do séc. XX (Charles Carter, Margaret Hone e a Faculty of Astrological
Studies). Não confirmei datas exatas de publicação; **não escrever data sem
conferir**.

**Casas Iguais ≠ Casas Inteiras.** Erro comum. Elas coincidem **só** quando o
Ascendente cai exatamente em 0°00' de um signo.

### 6.3 Porfírio

**Definição.** Calcula-se Asc, MC, Desc e IC; cada quadrante é dividido em três
partes iguais **em longitude eclíptica**. Primeiro sistema de quadrantes.

**FONTE PRIMÁRIA — e a atribuição está errada.** O método aparece na
*Introdução ao Tetrabiblos* atribuída a Porfírio, cap. 43 — **mas ali é citação
de um dicionário de termos astrológicos de Antíoco de Atenas** (prov. séc. II
d.C.), *Thesaurus* cap. 46. E aparece **antes ou em paralelo** em **Valente,
*Anthology* III, 2** — obra que pode ser anterior à de Antíoco (Hand 2007, nota
6 e p. 149–152).

**O que Valente faz com isso não é o que se imagina.** Ele **não** usa a
trissecção para atribuir tópicos de vida. Usa para classificar **graus** como
"operativos" ou "inoperantes". Texto (trad. Riley, III.2):

> "take the distance in degrees from the Ascendant to IC […] to consider
> **one-third of that total distance to be the 'operative' degrees** […] Consider
> the rest of the degrees in order up to IC […] to be 'inoperative' and
> impropitious. […] It is therefore obvious that **there will not always be 30°
> at an angle**, sometimes more, sometimes fewer."

Exemplo numérico do próprio Valente: Asc a Peixes 13°, MC a Sagitário 22°,
IC a Gêmeos 22°. Distância Asc→IC = 99°; um terço = 33°; conta-se do Asc e para
em Áries 16°. Esses graus são poderosos; do 17° de Áries até o IC, inoperantes.

E Valente atribui o método a um antecessor: "**Orion expounded all this in his
book**" (III.2, final). Não encontrei nada sobre esse Órion além dessa menção.

Hand resume: "*In this description Valens mentions only the power of the
degrees, profitable or unprofitable, in each place; he says nothing about the
signification, i.e., what part of life each place rules*" (Hand 2007, p. 151).

**Conclusão de rigor:** o "sistema de Porfírio" na antiguidade era uma camada de
**força**, não de **tópico**. Os tópicos continuavam nos signos. Chamar isso de
"sistema de casas" no sentido moderno é anacronismo.

### 6.4 Alcabitius

**Definição.** Divide o **semi-arco diurno e o noturno** do grau ascendente em
três partes iguais cada.

**TRADIÇÃO POSTERIOR + atribuição corrigida.** al-Qabisi (Alcabitius), de Aleppo,
morto c. 967, **não inventou o método**. Deborah Houlding: "*Al Qabisi did not
invent that system of house calculation but personally employed it and explained
it in sufficient detail*" que a Idade Média o creditou como fonte
(`skyscript.co.uk/alcabitius.html`). No tempo dele o método já era considerado
antigo e **era atribuído a Ptolomeu** — porque o cálculo se apoiava nas tabelas
de diferenças ascensionais do *Almagesto* II.7 e nos astrolábios derivados do
*Planisphaerium*.

**FONTE PRIMÁRIA (documental).** "*The oldest clear explanation of how to
calculate 'Alcabitius' house cusps is found in a chart attributed to Rhetorius,
dated 428 AD*" (Houlding, ibid.) — é o mapa **L428** de Neugebauer & van Hoesen,
*Greek Horoscopes*, p. 138–140 (Hand 2007, nota 8).

Alcabitius foi o sistema dominante na astrologia árabe e depois na medieval
europeia, até o Regiomontanus no séc. XV. J. D. North o chama de "sistema
padrão".

### 6.5 Campanus

Campanus de Novara (c. 1220–1296), matemático italiano. Divide o **vertical
primário** (o grande círculo que passa pelo leste, zênite, oeste e nadir) em doze
gomos iguais, projetados na eclíptica. **TRADIÇÃO POSTERIOR**, séc. XIII.

### 6.6 Regiomontanus (*modus rationalis*)

Johannes Müller de Königsberg, dito Regiomontanus (1436–1476). Divide o
**equador celeste** em doze arcos de 30° e projeta por círculos que passam pelos
pontos norte e sul do horizonte.

**Atribuição corrigida.** A documentação do Swiss Ephemeris credita a invenção a
**Abraham ibn Ezra** († 1167). Regiomontanus nunca reivindicou a autoria; suas
**tabelas** é que popularizaram o método (primeira impressão em 1490, cerca de
duas décadas após sua morte). Foi o sistema de William Lilly e da horária inglesa
do séc. XVII.

### 6.7 Placidus — o padrão de hoje, e a história que o desmente

**Definição.** Para cada grau da eclíptica calcula-se o semi-arco diurno (do
nascer ao culminar) e o noturno. A cúspide da 11ª é o grau que já percorreu 1/3
do seu semi-arco diurno; a da 12ª, 2/3; e analogamente abaixo do horizonte. É
um sistema **temporal**, não espacial, e sua solução rigorosa só se obtém por
**recursão** (Hand 2007, nota 7 — a descrição matemática dele é a melhor em
português que consegui rastrear até uma fonte).

**As quatro afirmações da internet e o que a fonte diz:**

**(a) "Placidus é o sistema de Ptolomeu." — DISPUTADO, com o peso todo contra.**
A atribuição é rastreável: **Abraham ibn Ezra**, no séc. XII, identificou o
método dos semi-arcos como sendo o de Ptolomeu, e **Placido de Titis aceitou a
atribuição** e construiu sobre ela um programa "de volta a Ptolomeu". Mas
Ptolomeu discute semi-arcos no *Almagesto* no contexto das **direções primárias**
— não como divisão de casas, e não os usa como tal. Hand classifica Cardano
(1501–1576) e Placido (1603–1668) como dois casos de "*a complete 'back to
Ptolemy' program*" que ficou "*far short of completely Ptolemaic*" (Hand 2007,
nota 57).

**(b) "Placido inventou o sistema em 1650." — TRADIÇÃO POSTERIOR, mas a autoria
é de outro.** Placido publicou em **1650**. A documentação do Swiss Ephemeris
atribui a invenção a **Giovanni Antonio Magini (1555–1617)**; Hand fala do
"*system advocated by Maginus and Placidus in early modern times*" (Hand 2007,
nota 7). A Astrodienst é ainda mais dura: Placido é "*erroneously considered to
be the 'Founding Father'*" e sua contribuição real foi dar ao método uma nova
fundamentação filosófica.

**(c) "Placidus virou padrão porque é o mais preciso." — INVENÇÃO MODERNA.**
A história real é editorial:

- **1687**: Kirby & Bishop publicam *The Marrow of Astrology*, tradução inglesa
  abreviada de Placido.
- **1687, renovado em 1709**: a obra de Placido entra no **Index Librorum
  Prohibitorum** da Igreja Católica — o que, ironicamente, empurra sua adoção
  para a Inglaterra protestante.
- **1693**: **John Partridge** (1644–1715), em *Opus Reformatum*, rejeita a
  astrologia medieval em favor de Ptolomeu-via-Placido e vira seu maior
  propagandista.
- **1821**: **R. C. Smith ("Raphael")** publica um almanaque astrológico popular
  **com tabelas de casas Placidus** — é aqui que o sistema chega ao público.
- **Início do séc. XX**: **Alan Leo** e a escola inglesa adotam Placidus como
  padrão; a astrologia computadorizada depois o herda como default.

(Fonte: *The Astrology Podcast* ep. 244, "How Did Placidus Become the Most
Popular House System?", 24/02/2020 — episódio de pesquisa histórica com
transcrição publicada.)

James Holden resume o motivo material: **Placidus foi adotado no séc. XX porque
era o único sistema para o qual havia tabelas impressas disponíveis** (citado por
Brennan, *12 Reasons*, slide final). Antes de computador, o sistema de casas que
você usava era o sistema cujas tabelas você conseguia comprar.

**(d) "Placidus funciona em qualquer lugar." — FALSO, e é matemático.**
Placidus é **indefinido além dos círculos polares** (±66°34'). Um grau da
eclíptica que nunca nasce ou nunca se põe não tem semi-arco diurno; a conta não
existe. O Swiss Ephemeris diz literalmente: "*For mathematical reasons, Placidus
houses cannot be calculated for regions beyond the polar circles*". O mesmo vale
para **Koch**.

**MEDIDO AQUI.** Implementei a iteração padrão de Placidus e rodei contra a
`astronomy-engine` do repositório:

| Latitude | Mapas em que Placidus falhou |
|---|---|
| 60°N | 0 / 400 |
| 66,0°N | 0 / 400 |
| 66,5°N | 0 / 400 |
| **67,0°N** | **296 / 400 (74%)** |
| **69,65°N (Tromsø)** | **5.000 / 5.000 (100%)** |

Tromsø tem ~77 mil habitantes; Murmansk, ~270 mil; Reykjavík fica logo abaixo do
círculo. Não é um caso de laboratório: é um usuário real com o app quebrado.

**A distorção antes de quebrar.** Ainda dentro da zona "válida", Placidus deforma
brutalmente. **MEDIDO AQUI**, amostrando latitudes de −33° a 60°: a casa Placidus
mais larga encontrada teve **84,9°** e a mais estreita **10,9°** — num sistema
que a intuição imagina como "doze fatias". É daí que nascem os **signos
interceptados** (um signo inteiro contido dentro de uma casa, sem tocar cúspide
nenhuma) — que **não existem** em Casas Inteiras nem em Iguais.

### 6.8 Ptolomeu — o que ele de fato escreveu sobre lugares

**Esta seção existe porque a internet inteira atribui a Ptolomeu coisas que ele
não escreveu.** É o mesmo padrão do erro do Homem Zodiacal (ver
`docs/tradicao/01-…`, se já existir): a autoridade é invocada, a linha nunca é
conferida.

**FONTE PRIMÁRIA.** Ptolomeu **não tem** um capítulo sistemático sobre os doze
lugares com significações. Ele não enumera "Casa 1 = vida, Casa 2 = dinheiro".
Isso está em Paulo (cap. 24), Valente (Livro II), Fírmico (Livro II) e Retório
(cap. 54) — **não** no *Tetrabiblos*.

O que Ptolomeu tem é uma passagem funcional sobre os **lugares aféticos**
(pontos capazes de "prorrogar" a vida), em *Tetrabiblos* **III.11** na edição
Boer–Boll / III.10 em Robbins:

> "In the first place we must consider those places prorogative […] namely, the
> **twelfth part** [*dōdekatēmórion*] of the zodiac surrounding the horoscope,
> **from 5° above the actual horizon up to the 25° which remains**, which is
> rising in succession to the horizon; the part sextile dexter to those thirty
> degrees, called the House of the Good Daemon…"
> — trad. F. E. Robbins, Loeb (1940), p. 273 (grego: Boer–Boll III, 11.3,
> p. 129.15–21).

**Três problemas, todos documentados:**

1. **"House of" não está no grego.** Hand: "*the phrase 'the House of' does not
   appear in the Greek*" (Hand 2007, p. 147). É acréscimo do tradutor.
2. **A leitura do grego depende do editor.** Robbins adotou uma variante, Boer
   outra, Hübner (Teubner 1998) uma terceira. Uma leitura implica que os 30°
   em sextil **são** a 11ª casa (o que apoiaria casas iguais); a outra diz que os
   graus precisam estar **ao mesmo tempo** na 11ª casa (calculada de algum modo
   não especificado) **e** em sextil. "*Thanks to the textual confusion we do not
   know from the Greek*" (Hand 2007, p. 148).
3. **O próprio termo é ambíguo.** Ptolomeu usa *dōdekatēmórion*, "duodécima
   parte", onde outros autores usam *topos*. Ele usa a palavra tanto para signo
   quanto para "qualquer grupo de 30 graus contíguos", e ainda para as
   subdivisões dos signos (Hand 2007, nota 26).

**Conclusão de Hand (p. 148):** "*what we have here in Ptolemy is not a
description of a system of places, but a description of locations or degrees in
the chart in which an aphetic point may be found.*"

**A "regra dos 5 graus"** (planeta até 5° antes da cúspide já conta como na casa
seguinte) nasce **desta** passagem, e nasce torta: Ptolomeu está falando de
lugares aféticos, não de cúspides de casas. Hand nota que não há **nenhuma fonte
anterior a Ptolomeu** que possa ser lida como defendendo essa prática, e que
mesmo nele "*it is not clear that he advocated the five degree rule for cusps of
places*" (Hand 2007, nota 47). Existe ainda a hipótese de que os 5° fossem um
fator de correção entre zodíaco sideral e tropical, não uma regra de casa
(Anthony Louis, "Was Ptolemy's 5-degree rule simply a Fudge Factor?",
13/10/2024) — **DISPUTADO**, mas a hipótese merece registro.

**Nota de contexto que quase ninguém dá.** Hand, sobre a influência real de
Ptolomeu: "*he had much less influence on astrology as practised both in the
ancient world and later on, than is generally supposed […] one finds more lip
service paid to Ptolemy than actual use of his methods*" (Hand 2007, nota 11).
Ptolomeu é o nome mais citado e o método menos usado da tradição.

### 6.9 O Meio-do-Céu flutuante — o ponto que resolve a questão

**FONTE PRIMÁRIA, e é a citação mais importante deste documento.**

Paulo de Alexandria, cap. 30, "Sobre o Meio-do-Céu" (378 d.C.), última frase do
capítulo:

> "It is necessary to know that **the culminating degree does not always fall in
> the tenth place from the Horoskopos** owing to the inequality of the temporal
> ascension of the zoidia, but that it **sometimes falls in the ninth place, and
> sometimes in the eleventh place**."

Um autor antigo, num manual didático, avisando explicitamente que o
Meio-do-Céu **não é** a cúspide da décima casa. Isso só faz sentido — só é
*enunciável* — num sistema em que as casas são signos inteiros.

**Confirmação em Valente**, *Anthology* V, 6.66–67 (c. 175 d.C.), trad. Riley:

> "An example: Gemini in the Ascendant, MC in Aquarius when calculated by degree.
> **This X Place includes the Places relevant to action, to rank, and to
> children. It also includes the Places of Foreign Lands and of the God, since
> it is found (when calculated by sign) in the IX Place from the Ascendant** […]
> In the same way the sign in opposition to Aquarius (Leo, which is IC) includes
> the Places relevant to buildings, estates, and parents, **and the Places of the
> Goddess, brothers, and strangers**."

Com Gêmeos ascendente e MC em Aquário, Aquário é o **nono** signo a partir do
Ascendente. Valente não "corrige" nada: diz que Aquário acumula as funções das
duas casas — a do MC (ação, reputação, filhos) e a do 9º signo (estrangeiro,
Deus). Leão, no IC, acumula as do 4º e as do 3º.

Isto **elimina** duas hipóteses alternativas de uma vez:
- não pode ser casas iguais (nelas o MC também flutua, mas Valente fala em
  **signo**, não em segmento de 30°);
- não pode ser "eles não sabiam calcular o MC" (ele acabou de calculá-lo por
  grau).

**MEDIDO AQUI — com que frequência isso acontece.** Amostrei 20.000 instantes
aleatórios entre 1950 e 2010 e verifiquei em qual casa inteira o MC cai:

| Local (latitude) | MC na 9ª | **MC na 10ª** | MC na 11ª | MC na 8ª ou 12ª |
|---|---|---|---|---|
| Quito (0,2°S) | 4,8% | **90,4%** | 4,9% | 0,0% |
| São Paulo (23,6°S) | 11,3% | **78,0%** | 10,7% | 0,0% |
| Lisboa (38,7°N) | 20,5% | **59,2%** | 20,4% | 0,0% |
| Reykjavík (64,1°N) | 18,3% | **24,8%** | 17,9% | **38,9%** |

Em Lisboa, **quatro em cada dez mapas** têm o MC fora da décima casa inteira.
Em Reykjavík, em três de cada quatro. E o caso extremo confirma o rodapé de
Hand: "*In more extreme latitudes the midheaven may fall in the twelfth or eighth
sign from the ascendant as well*" (Hand 2007, nota 56) — **medido: 38,9%.**

### 6.10 A troca para casas de quadrante — quando e por quê

**TRADIÇÃO POSTERIOR, com data e sem explicação conhecida.** Segundo Brennan
(*12 Reasons*, argumento 3):

- Astrólogos medievais primitivos — **Māshā'allāh** e **Sahl ibn Bishr**, c. 800
  d.C. — ainda usavam predominantemente casas inteiras (confirmado pelos textos
  latinos citados em 6.1).
- Com **Abu Ma'shar** (c. 850 d.C.) e depois dele, há uma **mudança súbita** para
  casas de quadrante — possivelmente dentro de uma única geração.
- Depois disso, casas inteiras são esquecidas no Ocidente e surgem **mais de 20**
  sistemas de quadrante concorrentes.

**Por quê? Brennan é honesto: "Frankly, we don't know."** As hipóteses que ele
lista são explicitamente especulativas (erro de tradução — hipótese de Hand;
novas doutrinas de aspecto com orbes que obscureceram a ligação signo↔casa;
matemáticos exibindo virtuosismo; a sofisticação aparente do método novo).
**Não escrever nenhuma dessas como causa estabelecida.**

Consequência: **mil anos de disputa**. Do séc. IX até hoje a divisão de casas é
um dos temas mais brigados da astrologia, sem convergência.

### 6.11 A contestação — o que Deborah Houlding argumenta

**DISPUTADO. Registrar sempre esta seção junto com as anteriores.**

**Deborah Houlding** — autora de *The Houses: Temples of the Sky* e editora do
Skyscript — é a crítica mais consistente da tese das casas inteiras. Do que
consegui apurar (episódios 54 e 386 de *The Astrology Podcast*, e a página dela
sobre Alcabitius):

- Ela sustenta que **nenhum autor antigo ou medieval jamais definiu ou endossou
  formalmente** as casas inteiras como um *sistema* — o que **não é** dizer que a
  prática não existiu. É uma objeção sobre a natureza da evidência: prática
  atestada ≠ sistema declarado.
- Ela objeta ao enquadramento histórico de Brennan, especialmente quanto ao papel
  **precoce** das casas de quadrante, e afirmou que "a maioria, se não todos" os
  argumentos da palestra dele eram falsos ou enganosos.
- Ela lembra que a base de cálculo do método Alcabitius "**já estava disponível
  aos babilônios**" (citando J. D. North) — ou seja, a capacidade técnica de
  dividir quadrantes é muito mais antiga do que a narrativa "quadrantes chegaram
  no séc. IX" sugere.

**O que Brennan concede.** Que na tradição helenística tardia **os dois eram
usados ao mesmo tempo** e que os autores tentavam fundi-los; e que uma solução
prática legítima é usar casas inteiras para os tópicos e um sistema de quadrantes
como camada secundária de força/atividade (*12 Reasons*, "Final Points"). Isso é
literalmente o que Valente faz em III.2 (força por graus) combinado com II.4–16
(tópicos por signo).

**Posição honesta para o app:** casas inteiras são, com folga, a leitura mais
sustentada da evidência documental (300 mapas, 2 com cúspides intermediárias) e
dos manuais (Paulo cap. 24 é inequívoco). Mas **não** se deve escrever "os
antigos usavam SÓ casas inteiras" — Valente III.2, Antíoco cap. 46 e o mapa
L428 (428 d.C.) provam que divisões de quadrante existiam e eram calculadas.
A formulação correta é: **casas inteiras eram o quadro de referência dos
tópicos; divisões de quadrante, quando apareciam, mediam força, não assunto.**

---

## 7. O QUE A INTERNET REPETE E A FONTE NÃO SUSTENTA

*A seção mais valiosa deste arquivo. Se você só ler uma, leia esta.*

**7.1 — "Placidus é o sistema que Ptolomeu usava."**
**FALSO / DISPUTADO com o peso todo contra.** Rastreável a ibn Ezra (séc. XII),
aceito por Placido (1650). Ptolomeu discute semi-arcos no *Almagesto* no
contexto de **direções primárias**, não de domificação. E o *Tetrabiblos* não
descreve sistema de casas nenhum.

**7.2 — "Placido de Titis inventou o sistema Placidus."**
**Não.** Publicou em 1650, mas o Swiss Ephemeris atribui a invenção a **Magini
(1555–1617)**, e Hand fala do "sistema defendido por Maginus e Placidus". A
contribuição de Placido foi filosófica, não matemática.

**7.3 — "Placidus é o padrão porque é o mais preciso / o mais usado sempre foi."**
**INVENÇÃO MODERNA.** Virou padrão por acidente editorial: Partridge (1693),
Raphael com tabelas impressas (1821), Alan Leo (séc. XX), e depois o default dos
softwares. Holden: era o único com tabelas disponíveis. Antes dele, o padrão
medieval europeu era **Alcabitius**, e depois **Regiomontanus**.

**7.4 — "Ptolomeu lista as doze casas no Tetrabiblos."**
**FALSO.** Mesma classe do erro do Homem Zodiacal. Ptolomeu não tem exposição
sistemática dos doze lugares. Ela está em **Paulo de Alexandria cap. 24 (378
d.C.)**, **Valente Livro II**, **Fírmico Livro II**, **Retório cap. 54**. Se
algum conteúdo do app precisa citar uma fonte para as significações das casas,
**cite Paulo, não Ptolomeu**.

**7.5 — "Porfírio criou o sistema Porfírio."**
**Não.** O texto que leva o nome dele (Introdução ao Tetrabiblos, cap. 43) está
**citando Antíoco de Atenas** (séc. II), e o mesmo método está em **Valente III.2**,
possivelmente anterior. E Valente o usa para pesar graus, não para atribuir
tópicos. O próprio Valente credita um tal **Órion**.

**7.6 — "Alcabitius criou o sistema Alcabitius."**
**Não.** al-Qabisi († 967) explicou-o em detalhe; o método já era antigo no tempo
dele. A explicação mais antiga do cálculo está num mapa atribuído a **Retório,
datado de 428 d.C.** (Greek Horoscopes, L428).

**7.7 — "Regiomontanus criou o sistema Regiomontanus."**
**Não.** Swiss Ephemeris atribui a **Abraham ibn Ezra** († 1167). Regiomontanus
(1436–1476) nunca reivindicou; as **tabelas** dele é que popularizaram.

**7.8 — "O Meio-do-Céu é sempre a cúspide da Casa 10."**
**FALSO na tradição antiga, e falso em qualquer sistema de casas iguais ou
inteiras.** Paulo cap. 30 avisa explicitamente que o grau culminante cai às vezes
no 9º e às vezes no 11º lugar. Valente V.6 trabalha um caso concreto.
**MEDIDO AQUI:** em Lisboa isso ocorre em **40,8%** dos instantes; em São Paulo,
**22,0%**; em Reykjavík o MC chega a cair na 8ª ou 12ª casa em **38,9%**.

**7.9 — "O Ascendente é a cúspide da Casa 1."**
**Verdadeiro só em sistemas de quadrante e no sistema igual.** Em Casas Inteiras
— o sistema do app e o da antiguidade — o signo ascendente **inteiro** é a Casa 1,
e o grau do Ascendente é um ponto sensível flutuante dentro dela. Brennan:
"*ASC is not the starting point of the 1st house. Acts as a floating sensitive
point.*"

**7.10 — "Casas Inteiras é modinha nova / invenção de TikTok."**
**FALSO.** Holden publicou em **1982**; Hand em **2000** (livro) e **2007**
(artigo revisado por pares em *Culture and Cosmos*); Brennan em **2017** (670
páginas). E o sistema **nunca deixou de ser usado na Índia** (*rāśi chakra*).
O que é moderno é o **nome em inglês** ("whole sign houses", cunhado por Schmidt
& Hand nos anos 1990) — não a prática.

**7.11 — "Todos os antigos usavam só Casas Inteiras."**
**Exagero — DISPUTADO.** Valente III.2 e Antíoco cap. 46 descrevem trissecção de
quadrantes; o mapa L428 (428 d.C.) traz cúspides estilo Alcabitius; Ptolomeu é
ambíguo. Houlding objeta que nenhum antigo **definiu formalmente** casas inteiras
como sistema. Formulação segura: *"as casas inteiras eram o quadro dos tópicos;
divisões de quadrante, quando usadas, mediam força."*

**7.12 — A "roda natural": Áries = Casa 1, Touro = Casa 2, Gêmeos = Casa 3…**
**INVENÇÃO MODERNA — e é a mais destrutiva de todas.** Nenhuma fonte antiga
equipara o significado de uma casa ao significado de um signo. Esse esquema é
o motor de fabricação de conteúdo falso: dele saem "Casa 8 = Escorpião = sexo e
morte", "Casa 12 = Peixes = inconsciente", "Casa 6 = Virgem = rotina e saúde".
São deduções a partir de uma premissa moderna, apresentadas como tradição.
**Se um texto do app precisa da significação de uma casa, ela vem da tabela 5.1
(Paulo) ou 5.2 (Valente) — nunca do signo correspondente.**

**7.13 — "Casa 8 = sexo."**
**INVENÇÃO MODERNA.** Paulo: o 8º é o "**Ocioso**", significa "a completude da
vida", lucro vindo de mortes e heranças. Valente, Livro II 8K;9P: "**O VIII
Lugar da Morte**". Sexo não aparece em fonte nenhuma que eu tenha lido. A
associação vem da equivalência 8ª↔Escorpião (item 7.12). "Recursos
compartilhados" vem da lógica medieval de casas derivadas (a 2ª da 7ª = os bens
do parceiro) — **TRADIÇÃO POSTERIOR**, medieval, não helenística.

**7.14 — "O Ascendente é a máscara / como o mundo te vê."**
**TRADIÇÃO POSTERIOR (séc. XX, astrologia psicológica).** Nas fontes primárias o
Ascendente é "o **leme**", "doador de vida e sopro", "a origem e o fundamento"
(Paulo cap. 24); "a vida e o sopro dos homens", "os fundamentos de toda a
genitura" (Fírmico II.19). É o **eixo estrutural do mapa**, não uma persona
social. *Isto afeta o app diretamente:* a string
`'birthchart.row.asc.desc': 'Como o mundo te vê'` em `lib/i18n.js:335` é leitura
moderna. É uma leitura **legítima e difundida** — só não é "o que a tradição diz".

**7.15 — "Casa 12 = inconsciente / karma / vidas passadas."**
**INVENÇÃO MODERNA** (teosófica, de Alan Leo em diante). Paulo, 12º: sofrimentos,
**parto**, inimigos, escravos varões, **quadrúpedes**; lugar de Saturno.
Valente: Mau Daimon — ferimentos, inimigos desde o nascimento, pobreza. Nada de
inconsciente. A dificuldade do 12º tem uma explicação técnica boa (aversão ao
Ascendente + alegria de Saturno) que é mais interessante que "karma".

**7.16 — "Casa 6 = saúde, rotina e animais de estimação pequenos."**
**Parcialmente INVENÇÃO MODERNA.** Paulo, 6º: "**Má Fortuna**, Retribuição,
Pré-poente, Declínio Baixo, lugar de Ares" — dá sinais para "a determinação que
concerne **ferimento**", mais escravas e inimizades vindas delas. Ferimento sim;
"rotina/hábitos/trabalho diário" não está lá. E o detalhe verificável e engraçado:
**os quadrúpedes estão no 12º em Paulo, não no 6º.** A divisão moderna "animais
pequenos na 6ª, grandes na 12ª" é racionalização posterior — não achei fonte
antiga para ela.

**7.17 — "Casa 11 = amigos e redes."**
**DISPUTADO.** Paulo põe **amizade e patrocínio no 3º** ("*It has been allotted
the determination concerning friendship and patronage […] make men who have many
friends*") e no 11º põe "**aliança e patrocínio**" e "**boas expectativas**".
Valente atribui ao XI **filhos**. "Amigos, grupos, esperanças e desejos" como
pacote fechado do 11º é consolidação posterior. Escrever "aliados e boas
expectativas" é mais fiel e igualmente utilizável.

**7.18 — "Casa 5 = filhos" / "Casa 7 = casamento", ditas como imutáveis.**
**DISPUTADO entre as próprias fontes antigas.** Paulo (378): 5º = filhos, 7º =
casamento **e a qualidade da morte**. Valente (c. 175): V = casamento, XI =
filhos, e o **X** também "inclui os Lugares relativos a… filhos" (V.6). Paulo
ainda diz que o **10º** é "indicador do casamento e dos filhos varões". A
tradição consolidou uma versão; ela não é a única.

**7.19 — "O Descendente mostra o parceiro ideal."**
**TRADIÇÃO POSTERIOR / simplificação.** Paulo, 7º: "*signifies wedding
preparations, long terms abroad, and **the quality of the death***; it is called
the Anti-Horoskopos." Casamento é **um** dos três tópicos, e o 7º é, tão
literalmente quanto, o lugar da qualidade da morte — porque é o pivô poente.

**7.20 — "Todo sistema de casas dá quase o mesmo resultado."**
**FALSO — MEDIDO AQUI.** Comparando Placidus com Casas Inteiras em 20.000 mapas
por local:

| Local | Planetas que mudam de casa | Mapas com ≥1 planeta em casa diferente |
|---|---|---|
| Quito (0,2°S) | **50,2%** | **91,8%** |
| São Paulo (23,6°S) | **50,6%** | **93,9%** |
| Lisboa (38,7°N) | **52,8%** | **96,5%** |
| Reykjavík (64,1°N) | **66,8%** | **99,6%** |

Metade dos planetas troca de casa. Praticamente **todo** mapa muda. E há uma
razão matemática simples que confirma o número: como as Casas Inteiras começam
em 0° do signo e qualquer sistema de quadrante começa perto do grau do
Ascendente, a distância entre os dois é o offset do Asc dentro do signo,
uniformemente distribuído entre 0° e 30° — média 15°, metade de uma casa. **O
50% é esperado, não é ruído.**

**7.21 — "Casas Iguais e Casas Inteiras são a mesma coisa."**
**FALSO.** Iguais começa no **grau** do Ascendente; Inteiras começa em **0° do
signo** dele. Coincidem só quando o Asc está exatamente em 0°00'.

**7.22 — "Koch é o sistema alemão criado por Walter Koch."**
**Atribuição errada.** Swiss Ephemeris: idealizado por **Friedrich Zanzinger
(1913–1967)** e **Heinz Specht (1925–)**; Koch (1895–1970) deu o nome. Também
**falha além dos círculos polares**.

**7.23 — "Signos interceptados significam [x]."**
**Artefato de sistema, não fato do céu.** Interceptação só existe em sistemas de
quadrante e é função da latitude. Em Casas Inteiras e Iguais, **não existe**.
Qualquer significado atribuído a ela é, no mínimo, pós-século IX — e na prática
é do século XX. Não escrever sobre interceptação sem dizer que ela depende do
sistema escolhido.

**7.24 — "Cada casa rege uma parte do corpo."**
**Confusão de doutrinas.** A melotesia (mapa do corpo) da tradição é **por
signo**, não por casa — ver `docs/tradicao/01-…` (Homem Zodiacal), onde já está
documentado que Manílio, *Astronomica* II.453–465, atribui as partes do corpo aos
**signos**. Não misturar.

**7.25 — "Horóscopo" significa o mapa inteiro.**
Uso moderno. Originalmente *horoskopos* = o grau/signo ascendente (Hand 2007,
nota 9). Não é erro grave em texto de produto, mas em texto que se apresenta como
"tradição" convém não usar assim.

---

## 8. ONDE ISTO TOCA O APP HOJE

> **Aviso:** esta seção descreve o código como ele está em **31/07/2026** e
> **não propõe alteração unilateral** — outras frentes estão editando o repo.
> É um levantamento para decisão.

### 8.1 O app já acerta o principal, e isso é raro

`lib/signs.js:390-407` — `houses()` implementa **Casas Inteiras** e o comentário
já registra o porquê, incluindo o motivo técnico correto:

> "Escolhido em vez de Casas Iguais […] e em vez de Placidus (matematicamente
> indefinido perto/acima do círculo polar, ~66,5° de latitude — risco real num
> app global)."

**Confirmado e medido** (seção 6.7): 0% de falha até 66,5°, **74% a 67°N**, 100%
a 69,65°N. O comentário está certo até o decimal. Fica documentado aqui que a
escolha tem **duas** justificativas independentes — a matemática (acima) e a
histórica (Paulo cap. 24, Fírmico VI.32, Valente V.6, Māshā'allāh).

`screens/BirthChartScreen.js:200` — o título da seção é literalmente
**`"Casas (Casas Inteiras)"`**. **O app declara o sistema.** A maioria dos apps
do mercado não declara: mostra "Casa 5: Leão" e esconde que essa frase muda se
o sistema mudar. Declarar é a decisão certa e deve ser preservada em qualquer
refatoração.

### 8.2 O que está incompleto

**(a) A seção de Casas não tem significação nenhuma.**
`screens/BirthChartScreen.js:197-224` renderiza uma grade de "Casa N — ⟨signo⟩"
e para por aí. O usuário vê "Casa 8 — Escorpião" e não faz ideia do que fazer
com isso. **A tabela 5.1 deste documento (Paulo, cap. 24) é exatamente o material
que falta**, e vem com fonte, o que permite escrever conteúdo que se sustenta.

**(b) A seção de Casas está fora do i18n.**
`lib/i18n.js` tem `birthchart.row.*`, `birthchart.fix.*`, `birthchart.positions`
— mas **nenhuma chave para casas**. Os textos em
`BirthChartScreen.js:200, 216, 247, 269-270, 285, 292` são strings PT
hardcoded. Usuário em ES ou EN vê o app inteiro traduzido e a seção de Casas
em português. (Constatação, não pedido — decidir com quem estiver no i18n.)

**(c) O app não mostra os outros três ângulos.**
A tela mostra Sol, Lua e Ascendente. **Descendente, Meio-do-Céu e Fundo do Céu
não aparecem** no mapa natal (o MC só existe dentro da astrocartografia,
`lib/signs.js:601`). Os quatro *kentra* são a espinha dorsal da tradição
(Paulo cap. 7 e 27). Se algum dia os três forem adicionados, a seção 6.9 deste
documento é obrigatória: **em Casas Inteiras o MC não é a cúspide da Casa 10**,
e o app precisará dizer isso, senão o usuário que confere no astro.com vai achar
que o app errou. Frase pronta e correta: *"em Casas Inteiras o Meio-do-Céu é um
ponto que flutua — ele pode cair na casa 9, 10 ou 11, e leva os assuntos de
carreira e reputação para a casa onde cair."* (Valente V.6 faz exatamente isso.)

**(d) O MC da astrocartografia é aproximado pelo RAMC.**
`lib/signs.js:578` diz: "*Meio-do-Céu aqui é aproximado pelo próprio RAMC (sem
depender de latitude…)*". O MC de verdade é a **longitude eclíptica** cujo
ascensão reta é o RAMC — a conversão é λ = atan2(sen(RAMC)/cos ε, cos(RAMC)).
**MEDIDO AQUI:** o erro dessa aproximação chega a **2,47°**, fica **acima de 1°
em 73%** dos instantes, e faz o **signo** do MC sair errado em **4,7%** dos
casos. Para a astrocartografia (que trabalha com orbe) isso é tolerável e o
comentário é honesto ao chamar de aproximação; para um MC exibido ao usuário,
não seria. Registrado aqui para que quem for exibir o MC saiba que precisa da
conversão.

**(e) A IA nunca recebe casas — e a regra que a protege está certa.**
`server-patches/src/infrastructure/AnthropicChatProvider.js:206-214`
(`blocoContexto`) envia `sol`, `lua`, `ascendente`, fase lunar, retrogradação e
aspectos reais — **nunca casas**. E a proibição nº 1 do prompt (linha 716)
impede a IA de afirmar casa sem dado no `<contexto>`. A combinação é sólida.
**Se um dia casas entrarem no contexto, a linha tem que dizer o sistema**, por
exemplo `"Casas (sistema: Casas Inteiras): Casa 1 em Virgem, Casa 2 em Libra…"`.
Sem o rótulo, a IA está afirmando algo que só é verdade sob uma convenção não
declarada.

**(f) O prompt da IA menciona "as doze casas" sem conteúdo.**
`AnthropicChatProvider.js:711` lista "As doze casas" numa enumeração de
conhecimento, sem significações e sem sistema. Se isso for enriquecido algum dia,
a tabela 5.1 é a fonte — e vale acrescentar a lógica das alegrias (5.3) e da
aversão (5.4), que é o que permite à IA **explicar** em vez de só afirmar.

**(g) Uma afirmação avulsa sobre casa no app.**
`lib/chatResponses.js:27`: *"Carreira costuma se conectar com a Casa 10 e com
Saturno no mapa."* **Sustentado por fonte** — Paulo cap. 24 dá ao 10º "trabalho
(*praxis*), reputação, valor"; Valente V.6 idem. Mantém-se. Só notar que é uma
afirmação dependente de sistema: em Casas Inteiras a Casa 10 é o décimo signo a
partir do ascendente, e o MC pode nem estar ali.

### 8.3 Frases prontas, com lastro, para uso no app

Livres para copiar. Cada uma tem fonte nesta página.

- **Sobre o sistema:** "Usamos Casas Inteiras — o sistema mais antigo do Ocidente,
  em que o signo inteiro do seu Ascendente é a Casa 1. É o que Paulo de
  Alexandria descreve em 378 d.C. e o que a astrologia indiana usa até hoje."
- **Sobre por que não Placidus:** "Placidus, o padrão da maioria dos apps, é do
  século XVII e não pode ser calculado acima do círculo polar — a conta
  simplesmente não existe lá."
- **Sobre a diferença:** "Sistemas de casas diferentes dão mapas diferentes: entre
  Placidus e Casas Inteiras, cerca de metade dos planetas troca de casa. Por isso
  a gente diz qual está usando."
- **Sobre o Ascendente:** "O Ascendente é o leme do mapa — na fonte antiga ele é
  chamado de 'a origem e o fundamento', o ponto a partir do qual todas as casas
  são contadas."
- **Sobre as casas difíceis:** "As casas 2, 6, 8 e 12 são as únicas que não fazem
  aspecto nenhum com o signo do seu Ascendente. Os gregos as chamavam de 'em
  aversão' — viradas de costas. É daí que vem a fama delas, não de misticismo."

---

## 9. Bibliografia

### Fontes primárias (edições e traduções)

- **Manílio**, *Astronomica*. Trad. G. P. Goold. Loeb Classical Library.
  Cambridge, MA: Harvard University Press, 1977.
- **Vétio Valente**, *Anthologiae*. Ed. W. Kroll (1908); ed. D. Pingree (Teubner,
  1986). Trad. inglesa integral: Mark T. Riley, *Vettius Valens: Anthologies*
  (PDF livre, Skyscript). Trad. parcial com comentário: Robert Schmidt,
  Project Hindsight, 1993–1996.
- **Ptolomeu**, *Tetrabiblos*. Trad. F. E. Robbins, Loeb, 1940. Ed. gregas:
  E. Boer & F. Boll (Teubner, 1940/1957); Wolfgang Hübner (Teubner, 1998).
  Trad. do Livro III: Robert Schmidt, Project Hindsight, 1996.
- **Antíoco de Atenas**, *The Thesaurus*. Trad. Robert Schmidt. Berkeley Springs,
  WV: Golden Hind Press, 1993.
- **Júlio Fírmico Materno**, *Matheseos Libri VIII*. Eds. W. Kroll, F. Skutsch,
  K. Ziegler, 2 vols. Stuttgart: Teubner, 1968. Trad. inglesa: Jean Rhys Bram,
  *Ancient Astrology — Theory and Practice*. Park Ridge, NJ, 1975.
- **Paulo de Alexandria**, *Introductory Matters*. Trad. Robert Schmidt, ed.
  Robert Hand. Project Hindsight, Greek Track vol. I. Berkeley Springs, WV, 1993.
- **Paulo de Alexandria & Olimpiodoro**, *Late Classical Astrology*. Trad.
  Dorian Gieseler Greenbaum. Reston, VA: ARHAT, 2001.
- **Hefestião de Tebas**, *Apotelesmatika*. Ed. D. Pingree. Teubner.
- **Māshā'allāh**, *De Receptione* e *De Revolutione Annorum Mundi*. Trad. latina
  de João de Sevilha, ed. Nuremberg, 1549.

### Corpora documentais

- **O. Neugebauer & H. B. van Hoesen**, *Greek Horoscopes*. Philadelphia:
  American Philosophical Society, 1959.
- **Alexander Jones**, *Astronomical Papyri from Oxyrhynchus*. Philadelphia:
  American Philosophical Society, 1999.
- ***Catalogus Codicum Astrologorum Graecorum*** (CCAG), 12 vols., 1898–1953.

### Estudos modernos

- **James Herschel Holden**, "Ancient House Division", *AFA Journal of Research*,
  1982. — O artigo fundador da redescoberta.
- **J. D. North**, *Horoscopes and History*. London: Warburg Institute, 1986.
- **Robert Hand**, *Whole Sign Houses: The Oldest House System*. Reston, VA:
  ARHAT, 2000.
- **Robert Hand**, "Signs as Houses (Places) in Ancient Astrology",
  *Culture and Cosmos*, vol. 11, nº 1–2 (2007), pp. 135–162. — **Revisado por
  pares. É a referência acadêmica central deste documento.** PDF aberto em
  `cultureandcosmos.org/pdfs/11/11_Hand_Signs_as_Houses_Vol11.pdf`.
- **Chris Brennan**, "The Planetary Joys and the Origins of the Significations of
  the Houses and Triplicities", *ISAR International Astrologer*, vol. 42, nº 1
  (abril 2013), pp. 27–42.
- **Chris Brennan**, *Hellenistic Astrology: The Study of Fate and Fortune*.
  Denver: Amor Fati Publications, 2017.
- **Chris Brennan**, "12 Reasons Why Whole Sign Houses is the Best System of
  House Division", palestra, 2015 (slides publicados pelo Astrology Podcast).
- **Deborah Houlding**, *The Houses: Temples of the Sky*. Bournemouth: Wessex
  Astrologer, 2006 (1ª ed. 1998). — A posição crítica. Ler junto com Hand.
- **Deborah Houlding**, "About AL-QABISI a.k.a. Alcabitius", Skyscript,
  `skyscript.co.uk/alcabitius.html`.
- **David Pingree**, "Antiochus and Rhetorius", *Classical Philology*, vol. 72,
  nº 3 (1977), p. 203.
- **David Pingree**, *The Yavanajataka of Sphujidhvaja*, 2 vols. Cambridge, MA,
  1978. — Sobre a transmissão helenística para a Índia.
- **David Juste**, *Les Alchandreana primitifs*. Leiden: Brill, 2007.
- ***The Astrology Podcast***, ep. 244, "How Did Placidus Become the Most Popular
  House System?", 24/02/2020. Ep. 52 e 54 (2015) e ep. 386 (2023) sobre o debate
  Brennan × Houlding. Transcrições publicadas no site.
- **Documentação do Swiss Ephemeris / Astrodienst**, "Tables of Houses",
  `astro.com/swisseph/sweph_ht_e.htm`. — Autoria e datas de todos os sistemas,
  e as limitações polares de Placidus e Koch.

### Fontes que eu procurei e NÃO consegui verificar

Registrado para ninguém repetir o esforço nem preencher a lacuna com invenção:

- **O texto grego original de Paulo de Alexandria cap. 24 e cap. 30.** Trabalhei
  com a tradução Schmidt/Hand (Project Hindsight). As citações estão marcadas
  como tradução; não confirmei os termos gregos exatos de cada nome de lugar.
- **A data exata de publicação de Margaret Hone e Charles Carter** sobre casas
  iguais na escola britânica. Não escrever data.
- **A identidade de "Órion"**, o autor a quem Valente credita a trissecção de
  quadrantes em III.2. Não encontrei nada além da menção.
- **Retório, *Compendium* cap. 54**, no original — usado aqui de segunda mão, via
  a lista de fontes de Brennan (2013, nota 2).
- **A transcrição do ep. 386** do Astrology Podcast (Houlding e o "negacionismo
  das casas inteiras") retornou 404 na consulta. A posição de Houlding aqui vem
  do texto de apresentação dos episódios e da página dela sobre Alcabitius —
  **é uma reconstrução de segunda mão e está marcada como tal na seção 6.11.**
  Antes de escrever qualquer conteúdo que caracterize a posição dela, ler a
  fonte direta.

### Método das medições marcadas "MEDIDO AQUI"

Script em Node, fora do repositório, usando a mesma `astronomy-engine` de
`node_modules` do projeto e a mesma fórmula de Ascendente de `lib/signs.js`
(RAMC/atan2, Duffett-Smith). Placidus implementado pela iteração padrão
(RA₁₁ = RAMC + (90+AD)/3; RA₁₂ = RAMC + 2(90+AD)/3; RA₂ = RAMC + 180 − 2(90−AD)/3;
RA₃ = RAMC + 180 − (90−AD)/3, com AD = arcsen(tan φ · tan δ), iterado até
convergir; devolve falha quando |tan φ · tan δ| > 1). Amostra: 20.000 instantes
pseudoaleatórios (semente fixa) entre 01/01/1950 e 01/01/2010, 10 planetas por
mapa. Verificações de sanidade feitas: ordenação das cúspides consistente em
12.000/12.000 mapas em seis latitudes; no equador as cúspides caem em divisões
iguais de **ascensão reta** (não de longitude), como esperado do método.
Os números não são citação de ninguém — são reprodutíveis por quem quiser
refazer.

---

*Documento escrito em 31/07/2026. Nenhum arquivo existente do repositório foi
alterado na produção dele.*
