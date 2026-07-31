# 16 — OPORTUNIDADES DE CONTEÚDO

> O que esta base de tradição destrava como **feature nova**, ordenado por
> **riqueza do material × esforço de implementar**, dizendo em cada caso **o que
> o app já calcula** que permitiria construir.
>
> Escrito em 31/07/2026, a partir dos dezesseis documentos. **Nenhuma proposta
> aqui foi implementada** — a memória `feedback_pedir_aprovacao` manda apresentar
> e aguardar.

---

## Antes de tudo: o que o app JÁ calcula

Este é o inventário que torna as propostas concretas. Verificado lendo o código
em 31/07/2026. **Confie no nome do símbolo, não no número da linha** — havia
outras frentes editando o repositório no mesmo dia.

| Capacidade | Onde | O que devolve |
|---|---|---|
| Signo solar **pela longitude real** | `lib/signs.js → signoFromDate` | Signo correto no instante, não por tabela de calendário |
| Signo lunar | `lib/signs.js → moonSign` | Com fuso; `EclipticGeoMoon` |
| Ascendente | `lib/signs.js → ascendantSign` | Signo e grau. **Exige hora + lat/lon + fuso** |
| **Casas Inteiras** | `lib/signs.js → houses` | `{ houseNumber, sign }` × 12. **Exige hora + cidade** |
| Posições dos 10 planetas | `lib/signs.js → planetPositions` | Longitude eclíptica em qualquer instante |
| Aspectos | `lib/signs.js → aspects` | 5 aspectos maiores |
| Mercúrio retrógrado | `lib/signs.js → isMercuryRetrograde` | 📐 validado: concorda com a estação verdadeira em ~3h, em 94 estações |
| **Trânsito × natal** | `lib/personalSky.js → personalSkyToday` | 10 planetas de hoje × 10 natais, orbe escalonado por velocidade, top 3 com texto |
| Fases da Lua | `lib/lunarCalendar.js → getMoonPhase, nextExactMoonPhase, nextExactNewOrFullMoon` | Rótulo de fatia **e** instante exato, separados corretamente |
| Sinastria ptolomaica | `lib/synastry.js` | Já traz `VERBATIM`, `GRAUS_IV7`, `ESCALA`, `CATEGORIAS`, `distanciaEmSignos`, `FONTES`, `NAO_ACHADO` |
| Domicílios dos 7 clássicos | `lib/dailyHoroscope.js → DOMICILIO_POR_SIGNO` | Ptolomeu I.17. Escorpião → Marte, Aquário → Saturno |
| Dignidades | `lib/dailyHoroscope.js → dignidadeDe` | Domicílio, exaltação, exílio, queda, peregrino |
| Melotesia | `lib/zodiacBody.js` | Manílio verbatim + `lateLayer` para a camada popular. **É o padrão-ouro do repositório** |
| 36 decanatos Golden Dawn | `lib/tarotDeck.js → GOLDEN_DAWN_DECANS` | 📐 **auditados: as 36 entradas fecham como um ciclo caldaico único** |
| Mecânica de oráculo | `lib/tarotDeck.js` + `tokens.js` + `tarotDailyLimit.js` + `tarotCollection.js` + `TarotAlbumScreen` | Sorteio, orientação, limite diário, coleção, álbum |
| Dado de nascimento | `lib/birthData.js → getAnyBirthData` | `{ date, time (pode ser null), city (pode ser null) }`. **Nunca fabrica** |
| Quiz com barras | `screens/DescobrirScreen.js` + componente `ScoreBar` | Padrão "quiz → resultado com barras" já pronto |
| Regente do dia | `lib/grounding.js → REGENTES` · `lib/cosmicSound.js` | Ordem caldaica. ⚠️ **Não são regentes de domicílio** — é o falso amigo nº 1 |

**O que o app NÃO tem e várias propostas precisam:**
tabela de domicílios em `lib/signs.js` (existe só em `dailyHoroscope.js`),
flag de seita (diurno/noturno), significado de casa (as células de
`BirthChartScreen` são "Casa N — signo" e nada mais), qualquer texto sobre
história do tarô, chaves `birthchart.house.*` em `lib/i18n.js`.

---

## Como esta lista está ordenada

**Riqueza (R)** = quanto material com fonte a base já tem pronto, de 1 a 5.
**Esforço (E)** = quanto custa construir, de 1 (uma tarde) a 5 (projeto).
Ordem = R alto e E baixo primeiro.

| # | Oportunidade | R | E | Precisa de hora/cidade? |
|---|---|---|---|---|
| 1 | Seita: mapa diurno × noturno | 5 | 1 | Não (só hora) |
| 2 | "A idade real de cada coisa" | 5 | 1 | Não |
| 3 | Trânsito aplicativo × separativo | 3 | 1 | Não |
| 4 | Card "Como este app decide" | 3 | 1 | Não |
| 5 | As quatro regras de Waite antes da tiragem | 3 | 1 | Não |
| 6 | **Profecções anuais e mensais** | 5 | 2 | Ascendente sim / **Sol não** |
| 7 | Retorno de Saturno calculado | 4 | 2 | Não |
| 8 | A história real do tarô, no álbum | 5 | 2 | Não |
| 9 | "Por que esta carta é este decanato" | 4 | 2 | Não |
| 10 | Aniversário astrológico (instante do retorno solar) | 3 | 2 | Não |
| 11 | Trânsito que sabe em que casa cai | 4 | 2 | Sim |
| 12 | As cinco espécies de sonho de Artemidoro | 4 | 2 | Não |
| 13 | Melotesia dupla: Manílio × Sefer Yetzirah | 3 | 2 | Não |
| 14 | Rodapé de datação em toda feature | 3 | 2 | Não |
| 15 | **I Ching como segundo oráculo** | 5 | 3 | Não |
| 16 | Significado das casas (Camada A + nota moderna) | 5 | 3 | Sim |
| 17 | Pañcāṅga no calendário lunar | 4 | 3 | Não |
| 18 | Lua progredida | 3 | 3 | Não |
| 19 | Numerologia no Descobrir | 3 | 3 | Não |
| 20 | Calendário lunar de plantio brasileiro | 4 | 4 | Não |

---

# TIER 1 — Fazer agora (esforço 1, riqueza alta)

## 1. Seita: mapa diurno × noturno
**R 5 · E 1 · Fonte: Ptolomeu I.7 ✅ + Valente I.1 ✅ (dupla, primária, verbatim)**

A peça que a tradição usa para **modular tudo**, e que nenhum concorrente
brasileiro tem. Um Saturno em mapa **diurno** é lido diferente de um Saturno em
mapa **noturno** — e Valente diz textualmente que maléficos bem colocados na
própria seita *"are bestowers of good and indicative of the greatest positions
and success"*.

**O app já calcula:** o Ascendente (`ascendantSign`) e a posição do Sol
(`planetPositions`). **Saber se o nascimento foi diurno ou noturno é comparar a
longitude do Sol com o eixo Ascendente–Descendente — um booleano.** E
`dignidadeDe` já implementa as cinco dignidades; falta só esta sexta camada.

**Renderia:** cada leitura de planeta ganha uma segunda linha
(*"Saturno estava na seita dele — na tradição isso muda o sinal"*), e o app
passa a dizer algo que Astrolink e Co-Star não dizem. Doc 11 §9.2.

**Custo real:** um booleano + a modulação de texto. O conteúdo é onde mora o
trabalho — 7 planetas × 2 seitas.

---

## 2. "A idade real de cada coisa" — tela de conteúdo
**R 5 · E 1 · Fonte: a tabela pronta do doc 10 §13, 30 linhas datadas**

A tabela já está escrita, verificada e com grau. É virar conteúdo.

**O app já calcula:** nada. É conteúdo puro. Zero dependência de efeméride, de
hora, de cidade.

**Renderia:** a peça mais compartilhável que este app pode ter. "Superlua tem 47
anos", "o horóscopo de jornal é de 24 de agosto de 1930", "as 8 fases da Lua são
de 1936". É exatamente o tipo de material que circula sozinho em rede social,
gera print, gera comentário, e **nenhum concorrente tem** — porque teria que ler
Court de Gébelin e o *Maine Farmers' Almanac* para produzir.

**Onde:** seção nova em `screens/DescobrirScreen.js` (que já é a tela de
"conteúdo para explorar") ou tela própria linkada da Home. Doc 10 §17.2.

---

## 3. Trânsito aplicativo × separativo
**R 3 · E 1 · Fonte: Valente IX.3 · é correção, não feature**

`lib/personalSky.js` calcula `Math.abs(sep - angle)` e **perde o sinal**.
Resultado: o app diz **a mesma frase** para um aspecto que está se formando e
para um que já passou.

**O app já calcula:** tudo. A correção é **uma segunda chamada de
`planetPositions` para amanhã** e a comparação das duas separações.

**Renderia:** o verbo muda — *"está se formando"* × *"está se desfazendo"* — e é
a distinção que Valente faz na fonte. Melhora **algo que todo usuário vê todo
dia**, com custo de uma tarde. Doc 13 §13.2(a).

---

## 4. Card "Como este app decide"
**R 3 · E 1 · Fonte: docs 01, 03, 11**

Três declarações, três linhas cada:
- **Regências:** os sete clássicos (Escorpião → Marte, Aquário → Saturno), porque
  Urano é de 1781 e a atribuição é de 1825–28.
- **Casas:** Casas Inteiras — o sistema da antiguidade, e por isso o **mais**
  tradicional, não menos.
- **Zodíaco:** trópico, contado dos equinócios e solstícios, "and from no other
  source" (Ptolomeu I.22).

**O app já calcula:** tudo isso, e **não declara nenhum**. Hoje o usuário lê
"Escorpião → Marte" e conclui que o app errou. Doc 11 §9.9 · 01 §4.5–4.6.

**Renderia:** resolve de uma vez três buracos apontados em três documentos
diferentes, e é a base para a proposta nº 14.

---

## 5. As quatro regras de prática de Waite, antes da tiragem
**R 3 · E 1 · Fonte: *The Pictorial Key*, 1911, domínio público, citável verbatim**

Waite dá quatro regras de prática que cabem perfeitamente na UI **antes** de
sortear: formular a pergunta em voz alta, esvaziar a mente ao embaralhar, soltar
o viés, e "é mais fácil ler para um estranho do que para si mesmo".

**O app já calcula:** nada. É texto de tela em `screens/TarotScreen.js`, antes do
`drawCards`.

**Renderia:** conteúdo com fonte primária, de graça, num momento em que o
usuário está esperando de qualquer jeito. Doc 05 §6.2.

---

# TIER 2 — Alto valor, esforço médio

## 6. ⭐ Profecções anuais e mensais
**R 5 · E 2 · Fonte: Ptolomeu IV.10 verbatim ✅**

**A melhor oportunidade estrutural do app.** Um signo por ano de vida a partir do
Ascendente; o regente do signo onde a contagem para é o **Senhor do Ano**.

**O app já calcula:**
- **Casas Inteiras** (`houses`) — e a profecção **pressupõe exatamente esse
  sistema**. Num app Placidus a técnica ficaria conceitualmente torta. É uma
  coincidência favorável rara.
- Data de nascimento, sempre (`getAnyBirthData`).
- 📐 **Custo de cálculo medido: 1.000.000 de profecções em 22,7 ms.** Sem
  efeméride, sem rede, sem dependência nova.

**O que falta:** a tabela de domicílios em `lib/signs.js` (12 linhas, Ptolomeu
I.17 — existe hoje só em `dailyHoroscope.js`), e **12 textos de casa × 7 de
Senhor do Ano**. O cálculo é uma tarde; **o conteúdo é a obra**.

**A camada mensal resolve o problema de cadência.** Ptolomeu IV.10 dá 28 dias por
signo: **treze mudanças por ano**, também de graça. Transforma uma feature anual
(ruim para engajamento) numa feature mensal (boa).

**O problema, e a saída que tem fonte primária.** A profecção do Ascendente exige
hora + cidade, e nem todo usuário preencheu. **Ptolomeu IV.10 manda profeccionar
a partir de cinco lugares** e nomeia o **Sol** ("dignities and glory"). Como o
app conhece o signo solar de **todo** usuário:

- **Com mapa completo** → profecção do Ascendente, a forma canônica.
- **Só com data** → **profecção do Sol**, rotulada como tal, com a citação de
  Ptolomeu explicando por que é do Sol e o que ela cobre.

Isso **não é modo degradado inventado** — é uma das cinco prorrogações que o
texto manda fazer, e a frase que explica a diferença é ela própria conteúdo de
autoridade.

**Onde:** seção no `BirthChartScreen` (onde o Ascendente já está na tela) e
gatilho de **aniversário** e de **Monthly Wrapped** (`lib/monthlyWrapped.js`).
Como card diário na Home é fraca. Doc 13 §7 e §13.3.

**Cuidado:** a idade tem que sair do **retorno solar**, não da diferença de
datas — 📐 o ano profeccional vira até um dia antes do aniversário, que é
justamente quando o usuário mais olha. Ver proposta nº 10.

---

## 7. Retorno de Saturno calculado — não "aos 29"
**R 4 · E 2 · Fonte: Valente IV.1 e IX.5 ✅ + Ptolomeu IV.10 ✅ + medição própria**

📐 **MEDIDO em 244 nascimentos: a janela real é 28a5m a 29a10m — 17,5 meses de
amplitude.** Todo mundo diz "aos 29". O app pode dizer **a data da pessoa**.

**O app já calcula:** `planetPositions` em qualquer instante. Achar quando
Saturno volta à longitude natal é uma bisseção — barato.

**Renderia** três frases que ninguém no mercado brasileiro escreve:
- *"Medindo 244 nascimentos, o primeiro retorno cai entre 28a5m e 29a10m. Por
  isso a gente calcula o seu."*
- *"O ciclo de 30 anos é antigo — Valente, no séc. II, já chama o 30º ano de
  ponto crítico. Mas a leitura como crise de amadurecimento é do séc. XX: livro
  popular em 1940, vocabulário psicológico com Liz Greene em 1976."*
- *"Na tabela de idades de Ptolomeu, os 29 anos ainda são do **Sol** — Saturno só
  assume aos 68, e a fase de 41 a 56 é de Marte. **A 'crise dos 40' tem mais
  lastro antigo que a 'crise dos 29'.**"*

Encaixa em `screens/TimelineScreen.js`. Doc 13 §11.

---

## 8. A história real do tarô, dentro do álbum
**R 5 · E 2 · Fonte: doc 05 inteiro, ~890 linhas prontas**

**Não existe hoje em nenhum arquivo do app uma única linha sobre a história do
tarô — nem certa, nem errada.** O app nunca disse "Egito", o que é ótimo. Mas
também nunca disse o que o tarô é. Isso é **lacuna, não defeito**.

**O app já calcula:** nada. `screens/TarotAlbumScreen.js` e
`lib/tarotCollection.js` já existem, com as 78 cartas e a mecânica de coleção.

**Ganchos prontos, todos com fonte:**
- O **baralho mameluco** e os quatro naipes (taças, moedas, espadas, **tacos de
  pólo**).
- O **sermão do frade** que xingava jogadores e sem querer preservou a lista dos
  22 trunfos.
- **Waite desmentindo o Egito no próprio livro**, em 1911.
- **Pamela Colman Smith** e o **Sola Busca** (c. 1491, fotos no British Museum em
  1907 — dois anos antes).
- **A Estrela que em 1911 significava roubo.**
- Minchiate: **97 cartas**. Bolonhês: 62. O 78 é o padrão que venceu, não o
  universal — bom gancho para o próprio álbum.

**Renderia** diferenciação competitiva pura: **todo concorrente repete o Egito**.
Doc 05 §6.7.

---

## 9. "Por que esta carta é este decanato"
**R 4 · E 2 · Fonte: *Book T*, Golden Dawn, 1888 · 📐 auditado nesta base**

`GOLDEN_DAWN_DECANS` tem as 36 entradas, e 📐 **elas foram conferidas uma a uma
e fecham como um ciclo caldaico único**. É o dado mais forte do app em matéria de
correlação — e hoje a tela só mostra o rótulo "Marte em Áries".

**O app já calcula:** tudo. Falta o texto que **explica**.

**Renderia:** conteúdo premium auditável, e o app passa a **explicar uma
correspondência** — coisa que nenhuma tela dele faz hoje. Todas entregam pronto.

**Regra obrigatória:** escrever **"a atribuição da Golden Dawn, 1888"**, nunca "a
atribuição astrológica" — há pelo menos três sistemas rivais. Docs 14 §9.1 · 05
§6.1.

---

## 10. Aniversário astrológico: o instante do retorno solar
**R 3 · E 2 · Fonte: medição própria 📐**

📐 O instante em que o Sol volta ao grau natal **desliza ~5,8h por ano** e cai no
dia **anterior** ao aniversário em anos pré-bissextos.

**O app já calcula:** `planetPositions`. É uma bisseção, como a nº 7.

**Renderia:** uma notificação com cara de segredo — *"seu ano astrológico virou
ontem às 14h32, não hoje à meia-noite"* — e resolve o bug de borda da profecção
(nº 6). Frase pronta no doc 13 §13.5.

---

## 11. Trânsito que sabe em que casa cai
**R 4 · E 2 · Exige hora + cidade**

`personalSkyToday` hoje cruza **planeta com planeta**. Um trânsito de Marte que
cai na **casa 7** diz outra coisa de um que cai na **casa 2**.

**O app já calcula:** `houses()` devolve as 12 casas quando há hora e cidade. É
cruzar a longitude do planeta em trânsito com a tabela.

**Bloqueio:** depende da proposta nº 16 (significado de casa). Sem ela, o app
sabe a casa mas não tem o que dizer. Doc 13 §13.2(b).

---

## 12. As cinco espécies de sonho, de Artemidoro
**R 4 · E 2 · Fonte: *Oneirocritica* 1.2.45–55 ✅**

Antes de interpretar, Artemidoro pergunta: **este sonho é só seu (*idioi*), sobre
outra pessoa (*allotrioi*), sobre você e alguém (*koina*), sobre sua cidade
(*demosia*), ou sobre o mundo (*kosmika*)?** É uma pergunta estrutural real,
vinda do texto, que **nenhum concorrente faz**.

**O app já calcula / já tem:** `screens/DreamScreen.js`, o prompt de sonhos (que
já representa Artemidoro **corretamente** — é o melhor dos seis), `lib/journal.js`,
data de nascimento e contexto de casal. O checklist literal de Artemidoro 1.9
exige identidade, ofício, situação e idade — **o app já tem esses dados**.

**Renderia:** o app deixa de ser dicionário de símbolo e passa a **aplicar o
método** da fonte. E o disclaimer de `DreamScreen` ("de Artemidoro a Jung") é a
**única das seis frases de disclaimer do app que sobrevive à checagem sem
ressalva** — a tela já merece o upgrade. Doc 06 §7.8.

---

## 13. Melotesia dupla: Manílio × Sefer Yetzirah, lado a lado
**R 3 · E 2 · Fonte: *Astronomica* II ✅ + *Sefer Yetzirah* (séc. II–VI) ⚠️**

`screens/ZodiacBodyScreen.js` já conta a linha do tempo do Homem Zodiacal. O
*Sefer Yetzirah* oferece uma **segunda** correspondência corpo↔signo,
independente e de tradição totalmente diferente (12 letras simples → 12 signos →
12 órgãos).

⚠️ **Não fundir.** As listas **não coincidem**, e misturá-las fabricaria uma
terceira lista que nunca existiu — exatamente o erro que a auditoria do Homem
Zodiacal encontrou nos sites. Use **lado a lado e rotulado**.

**Bloqueio:** a atribuição das recensões antigas veio por fonte secundária;
conferir na edição crítica de Hayman antes de publicar (doc 99 §1.1). Doc 07 §7.5.

---

## 14. Rodapé de datação em toda feature
**R 3 · E 2 · Fonte: a base inteira**

Uma linha por tela dizendo de quando vem aquilo. Custo marginal por tela, padrão
consistente, e resolve de uma vez a auditoria de "milenar" do doc 10 §15.2.

Depende da nº 4 (declarar as convenções primeiro). E pede um **teste automatizado
de vocabulário de datação**, no molde de `test/grounding.test.js`: custo
baixíssimo, evita regressão de conteúdo para sempre. Doc 10 §17.3 e §17.5.

---

# TIER 3 — Projetos, alta riqueza

## 15. ⭐ I Ching como segundo oráculo
**R 5 · E 3 · Fonte: *Zhouyi*, séc. IX a.C. — domínio público, 448 textos**

**A maior oportunidade de conteúdo do app com o menor risco de conteúdo.**

**O app já calcula / já tem — e isto é o ponto:** a mecânica de um segundo
oráculo **já está construída inteira**. Sorteio (`tarotDeck`), orientação
(direta/invertida ↔ **linha fixa/móvel**), limite diário (`tarotDailyLimit`),
economia (`tokens`), coleção (`tarotCollection`) e álbum (`TarotAlbumScreen`).
Um módulo de I Ching reaproveitaria **tudo isso**.

**Riqueza:** 64 hexagramas × 6 linhas + 64 julgamentos = **448 textos de fonte
primária**, com **zero invenção necessária**.

**Detalhes que o app pode acertar e ninguém acerta:**
- 📐 **Moedas e varetas NÃO dão no mesmo.** Varetas: 1/16, 5/16, 7/16, 3/16.
  Moedas: 1/8, 3/8, 3/8, 1/8. O app pode oferecer os dois métodos **e explicar a
  diferença** — é aritmética verificável.
- Nunca dizer "5.000 anos / Fu Xi": o núcleo é do **séc. IX a.C.**, ~2.900 anos,
  o que já é impressionante.
- Nunca dizer "Confúcio escreveu as Dez Asas": **Ouyang Xiu refutou isso no séc.
  XI**.
- Em português você está lendo a **quarta camada** (chinês → Wilhelm alemão 1924
  → Baynes inglês 1950 → PT). Dizer isso é honestidade e é conteúdo.

Doc 07 §3 e §7.7 e §7.9 (recomendação nº 1 daquele documento).

---

## 16. Significado das casas — Camada A com nota moderna
**R 5 · E 3 · Fonte: Paulo cap. 24 ✅, Valente II ✅, Fírmico II ✅ · Exige hora + cidade**

**Situação atual, que é acidentalmente a mais segura possível:**
`BirthChartScreen` renderiza doze células "**Casa N — signo**" e nada mais.
`houses()` devolve `{ houseNumber, sign }` **sem campo de significado**. O
contexto da IA **não envia casas**. Ou seja: **o app hoje não afirma o
significado de nenhuma casa** — e por isso não aparece em nenhum item da lista de
erros do doc 12.

**No dia em que alguém preencher aquelas células, três decisões vêm juntas:**

**(a) Qual camada.** Recomendação: **Camada A (antiga, com fonte) + uma linha do
que a leitura moderna diz**. É o mesmo padrão que `lib/zodiacBody.js` já usa com
sucesso.

**(b) Onde o texto mora.** As strings são **PT hardcoded** e `lib/i18n.js`
**não tem nenhuma chave `birthchart.house.*`** (tem 54 chaves `birthchart.*`,
nenhuma de casa). Doze casas entrando hardcoded = doze strings × N idiomas de
dívida no dia seguinte.

**(c) O rótulo de sistema.** `BirthChartScreen` já mostra "Casas (Casas
Inteiras)", o que é raro e certo. Se ganharem significado, o rótulo dobra de
peso: 📐 quem comparar com um app Placidus verá **metade dos planetas em casas
diferentes**.

> ⚠️ **O perigo nº 1:** a "roda natural" (Áries = Casa 1). É o motor de
> fabricação de conteúdo falso e a invenção mais destrutiva de toda esta base.
> **A significação vem de Paulo e Valente, nunca do signo correspondente.**

**Renderia** o ativo comercial mais forte que a pesquisa produziu — três frases
que nenhum concorrente em português diz:
1. *"O nome antigo da Casa 8 é 'o Ocioso' — porque ela não faz aspecto nenhum com
   o signo do seu Ascendente."*
2. *"A astrologia antiga tinha casas que eram simplesmente ruins. A moderna
   reenquadrou todas como áreas de crescimento. Foi uma escolha do século XX."*
3. *"Casa 8 = sexo é uma dedução a partir de Escorpião e de Plutão — que foi
   descoberto em 1930."*

E destrava a IA a **explicar** em vez de afirmar: *"a Casa 12 é difícil porque é
um dos quatro signos que não fazem aspecto com o seu Ascendente — os gregos a
chamavam de 'em aversão'"*. Docs 12 §10 · 03 §8.

---

## 17. Pañcāṅga no calendário lunar
**R 4 · E 3 · Fonte: *Vedāṅga Jyotiṣa*, ~2.500 anos ✅**

**O insight de produto mais elegante da base:** a camada **autenticamente indiana
e pré-helenística** do jyotish **não é o mapa natal — é o calendário**. O
*Vedāṅga Jyotiṣa* é literalmente um manual de calendário. Os 12 signos entram na
Índia via material grego, séc. I–IV d.C.

**O app já calcula:** `lib/lunarCalendar.js`, com `astronomy-engine`, separando
corretamente rótulo de fase e instante exato.

**Acrescentar** *tithi* (dia lunar), *nakṣatra* do dia, *yoga*, *karaṇa*, *vāra*
seria:
- **100% cálculo determinístico**, sem IA, na mesma política de `personalSky.js`;
- a única adição "védica" que **não conflita com o signo tropical** que o usuário
  já recebeu, porque não fala de signo nenhum;
- com fonte primária de 2.500 anos.

> 🚩 **A linha vermelha:** `SIGNS` é tabela de faixas **tropicais**. Se jyotish
> entrar, **nunca reusar `SIGNS` nem as faixas de data**. Zodíaco sideral exige
> longitude eclíptica **menos ayanāṃśa**, em tabela separada. Reciclar a tabela
> tropical produziria um "signo védico" simplesmente errado.

Doc 07 §7.3 e §7.9 (recomendação nº 2).

---

## 18. Lua progredida
**R 3 · E 3 · Fonte: Valente IX.3 ✅ (a regra dia-por-ano é do séc. II)**

Se algum dia houver progressão no app, **que seja só a Lua** (ciclo de ~28 anos,
muda de signo a cada ~2,3 anos) e o **Sol** (~30 anos por signo), com rótulo de
que é simbólico.

📐 **Não faça planeta lento: Netuno progredido anda 1,7° em 90 anos de vida.**
Qualquer coisa dita sobre planeta lento progredido é ruído — e é o que metade dos
apps do mercado escreve.

**O app já calcula:** `planetPositions` em qualquer instante; progressão
secundária é só deslocar a data. Doc 13 §4 e §13.4.

---

## 19. Numerologia no Descobrir
**R 3 · E 3 · Fonte: Nicômaco ✅ para a camada real, Balliett 1908 para a popular**

**O app já tem:** `screens/DescobrirScreen.js` é exatamente o padrão "quiz →
resultado com barras", o componente `ScoreBar` existe, e `lib/birthData.js`
guarda nome e data. **Não precisa de efeméride.**

**Condição inegociável:** o rodapé diz a verdade — **sistema de L. Dow Balliett,
1908**; Pitágoras não deixou escrito nenhum e a tabela A=1 B=2 **não existe em
fonte antiga alguma**. E o app ganha a camada de **Nicômaco** (a década real,
fonte primária) como diferencial. Doc 07 §2 e §7.6.

---

## 20. O calendário lunar de plantio brasileiro
**R 4 · E 4 (exige pesquisa nova) · Fonte: a levantar**

📐 A lista de nomes de lua cheia descreve o **hemisfério errado**: "Lua da Neve"
em fevereiro é pico do verão aqui; "Lua da Colheita" em setembro é primavera.

**O que o Brasil tem de tradição lunar real é outra coisa, e é forte:** o
calendário de plantio do agricultor caboclo, sertanejo, gaúcho e amazônida —
crescente para folha, flor e fruto; minguante para raiz, bulbo, poda e corte de
madeira; nova para preparar a terra. Na Amazônia, derrubar madeira nobre na
minguante é prática documentada. E é **prima direta** da regra romana (Plínio,
Catão, Columela), chegada via colonização ibérica.

**O app já calcula:** fase da Lua exata, todo dia, em `lunarCalendar.js`.

**Por que é E 4:** a base **não tem** o levantamento. O doc 04 §4.3 identifica a
oportunidade em duas frases e o doc 99 a registra como **a maior lacuna de
conteúdo brasileiro da base**. Precisa de pesquisa própria antes — mas o material
existe (Plínio *NH* XVIII.321, Catão 29 e 31.2, Columela II.5.1 e XI.2.11 já
estão lidos e citáveis para a linhagem romana).

**Renderia** conteúdo **do público**, no hemisfério certo, com fonte — em vez de
"Lua do Morango" em pleno inverno brasileiro.

---

# O QUE NÃO CONSTRUIR

Registrado para não gastar orçamento. Todas as razões estão medidas ou
documentadas.

| Não construir | Por quê |
|---|---|
| **Direções primárias** | Exigem hora **ao minuto**, ascensão oblíqua e escolha de sistema de casas que **muda o resultado**. Nenhum retorno proporcional ao custo |
| **Zodiacal releasing** | Exige Lotes, quatro níveis de subdivisão e uma UI temporal que não existe. E a técnica tem **uma única fonte antiga** |
| **Revolução solar completa** | Só faz sentido com casas (reintroduz o problema da hora), mais **duas disputas não resolvidas** (relocação e precessão) que o app teria de arbitrar sem base |
| **Firdaria** | Período fixo igual para todos, muda a cada 7–13 anos. Conteúdo quase estático, engajamento nulo. Ótimo para o chat responder; péssimo como feature |
| **Progressão de planeta lento** | 📐 **Não se move.** Netuno: 1,7° em 90 anos |
| **Porcentagem de compatibilidade** | Já morta pela auditoria. Não ressuscitar sob outro nome |
| **Runas** | Por último, ou nunca. Se for: **24 runas** (não 25), **sem runa em branco** (Blum, 1982), **sem Armanen** (von List — ver doc 07 §4.5), só o que os poemas dizem, e revisão de arte contra a ADL |
| **Jyotish completo** | Só como módulo **explicitamente separado**, com aviso de que o signo difere **por desenho**, nunca misturado ao mapa tropical |
| **Reflexologia, "pé grego/egípcio/romano", qualquer coisa de saúde** | Linha vermelha, independente de fonte |

---

# ANTES DE QUALQUER FEATURE NOVA: as correções que já estão no ar

Estas **não são oportunidades** — são erros factuais vivos no app, apontados
pelos documentos 04, 06 e 11. Custam pouco e valem mais que qualquer feature,
porque cada um é um lugar onde um usuário informado pode pegar o app.

| Onde | O erro | A fonte que desmente |
|---|---|---|
| `server-patches/.../AnthropicChatProvider.js` — tabela zona↔planeta das pintas | Apresentada como **"a tradição ocidental dos almanaques"**. **Não localizada em nenhuma fonte primária**, e as três que existem divergem dela | Cardano põe **os sete planetas na testa inteira**; Cocles lê o rosto **pelo zodíaco**; pseudo-Melampo **não tem planeta nenhum**. Saída recomendada: trocar planeta por signo, usando a melotesia que o app **já auditou** (doc 06 §5.2) |
| `screens/CoffeeScreen.js` | *"tasseografia — tradição **milenar**"* | **Cronologicamente impossível**: café em Istambul só em **1555**; manual impresso mais antigo, **1742**. Substituição pronta em doc 06 §7.1 |
| `lib/lunarCalendar.js` (as 8 `reflexao`) e `screens/LunarCalendarScreen.js` (`DISCLAIMER`) | *"a tradição lunar **milenar**"* — e o disclaimer é justamente onde a imprecisão dói mais | As **oito** fases são de **Rudhyar, 1936/1967**. A moldura milenar é a de **quatro** quartos (Ptolomeu I.8) |
| `lib/lunarCalendar.js`, Lua Cheia · `lib/celestialSeasons.js` | *"momento de colher"* | **Inverte a fonte.** Plínio *NH* XVIII.321: o que se corta e colhe é na **minguante**. Na cheia, Columela manda **semear favas** |
| `lib/i18n.js` — `horoscope.reading.ontem.1` | *"A **Lua minguante** favoreceu…"* — string estática num app que **calcula a fase real duas telas adiante** | Em ~metade dos dias a Lua **não** está minguante. Ou tirar o adjetivo, ou alimentar com `getMoonPhase()`, que já existe. E corrigir nos **três** dicionários |
| `server-patches/.../AnthropicChatProvider.js` — linha da vida | *"isso é mito popular, não quiromancia"* — **regra certa, justificativa falsa** | É **a afirmação mais antiga documentada da tradição inteira** (Aristóteles, *HA* I.15). Manter a proibição, trocar a razão (doc 06 §2.3.3) |
| `screens/PalmScreen.js` — rosto | *"fisiognomonia — espelho de temperamento e **caráter**"* | **É literalmente a tese de Lavater e Lombroso.** Trocar por **estado/expressão**. E a UI diz "fisiognomonia" enquanto o prompt diz "mian xiang" — **alinhar** |
| `screens/PalmScreen.js` — pés | *"a podomancia — tradição de…"* | **Podomancia não é uma arte histórica** com esse nome. O prompt do servidor já está **correto** (samudrika shastra + mian xiang). **A UI é que está atrás do prompt** |
| `lib/signs.js` — `PLANETS` (comentário) | Chama Urano, Netuno e Plutão de **"planetas clássicos"** | É comentário interno, mas se um texto de tela herdar a palavra vira afirmação falsa. Nomenclatura sugerida: **"os sete"** e **"os três modernos"** |
| `lib/signs.js` — `FREQUENCIAS` | "528Hz frequência do amor" | Sem fonte de tradição **e** sem fonte física |

---

## A oportunidade que atravessa todas

O doc 08 concluiu que **citar a fonte** é defensável contra qualquer concorrente.
O doc 15 aponta o nível seguinte, que ninguém no mercado brasileiro ocupa:

> **Citar a fonte é bom. Mostrar que os especialistas discordam é melhor.**

*"Há duas leituras dessa carta e a diferença tem 300 anos"* é conteúdo que
Astrolink, Personare e Co-Star **estruturalmente não podem produzir** — o modelo
deles depende de voz única e afirmativa.

E há um efeito assimétrico que decide a longo prazo: quando o app crescer, vai
aparecer quem estuda astrologia de verdade. Essa pessoa testa com o mapa dela. Um
app que erra o signo dela perde a credibilidade em dez segundos. Um app que cita
capítulo e corrige o que os outros repetem **ganha a mesma pessoa como
defensora** — e a defesa dela vale mais que anúncio.

---

*Documento 16. Escrito em 31/07/2026 a partir dos dezesseis documentos da base.
Nenhum arquivo de código foi alterado por esta frente. Toda proposta aqui aguarda
aprovação do dono.*
