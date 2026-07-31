# 11 — OS SETE PLANETAS TRADICIONAIS E OS TRÊS MODERNOS

## O QUE É ESTE ARQUIVO

O documento 01 apresentou os sete planetas em duas tabelas: as qualidades térmicas
de Ptolomeu (I.4) e os domicílios (I.17). Isto aqui é o **retrato longo de cada
um** — o que a fonte antiga de fato atribui a cada planeta, como a tradição mede
sua força (dignidades), como mede sua **condição** (retrógrado, combusto, cazimi,
sob os raios), e qual é o ciclo astronômico real por trás de tudo isso.

Depois vêm os três modernos — Urano (1781), Netuno (1846), Plutão (1930) — com a
história datada de como foram incorporados, que é bem mais suja e bem mais
interessante do que o mercado conta.

E duas decisões que o app precisa tomar de olhos abertos:

> **CRÍTICO 1 — o app tem de DECLARAR qual sistema de regências usa.** Hoje ele
> usa o tradicional (sete planetas, `lib/dailyHoroscope.js:150`) e **não diz isso
> em lugar nenhum da tela**. A §6 levanta os argumentos dos dois lados para que a
> declaração seja informada, e não um acidente de implementação.
>
> **CRÍTICO 2 — Mercúrio retrógrado.** É a feature que o público deste app mais
> confere (o próprio comentário de `lib/celestialSeasons.js:34` reconhece isso). A
> §7 separa três coisas que vivem misturadas: o que a astronomia mede, o que a
> tradição de fato diz, e o que a internet inventou entre 2009 e 2019.

### Quando consultar

| Situação | Vá para |
|---|---|
| Escrever texto sobre um planeta específico | §3 (os sete, um a um) |
| Decidir se o app usa regência moderna ou tradicional | §6 |
| Escrever qualquer coisa sobre Mercúrio retrógrado | §7 |
| Precisar do número real (velocidade, ciclo, duração de retrogradação) | §4 |
| Alguém disser "Plutão rege Escorpião desde sempre" | §5 |
| Escrever sobre "planeta em dignidade", "combusto", "cazimi" | §2.5 e §2.6 |

### Convenção de marcação

A mesma do documento 01, repetida aqui para o arquivo ser lido sozinho:

| Marca | Significa |
|---|---|
| **[FONTE PRIMÁRIA]** | O texto antigo diz isso. Obra e locus indicados. |
| **[TRADIÇÃO POSTERIOR]** | Surgiu depois da antiguidade, com autor e data conhecidos. |
| **[INVENÇÃO MODERNA]** | Circula sem lastro em texto antigo. |
| **[DISPUTADO]** | As fontes divergem entre si. As duas versões estão nomeadas. |
| ✅ | Li ou extraí o trecho literalmente nesta pesquisa. |
| ⚠️ | Vem de fonte secundária ou de resumo; **não** reconferi frase a frase no original. |
| 📐 | **Medição feita nesta pesquisa**, reproduzível — o script está indicado. |

> **A regra que dá valor a isto:** fonte inventada, ou atribuída ao autor errado, é
> PIOR que ausência de fonte. Há uma §10 só para o que procurei e não achei.

---

## 1. O QUE É UM "PLANETA" NA FONTE ANTIGA

**[FONTE PRIMÁRIA]** A palavra grega é *planētēs*, "errante" — o que se move
contra o fundo fixo das estrelas. Isso define, sozinho, quantos são: **sete**, e
só sete, porque são os sete corpos que um olho humano vê se deslocar. Urano está
no limite absoluto da visibilidade (magnitude ~5,4 a 6,0, ou seja, visível em céu
perfeito por observador treinado que **saiba onde olhar**) ⚠️, e nunca foi
identificado como errante antes do telescópio. Netuno e Plutão são invisíveis a
olho nu.

Nas fontes helenísticas, Sol e Lua costumam ser tratados à parte como **luminares**
(τὰ φῶτα, "as luzes"), e os outros cinco como "estrelas". Valens abre o Livro I
chamando o Sol de "nature's fire and intellectual light" ✅ e a Lua de corpo
"lit by the reflection of the sun's light and possessing a borrowed light" ✅.
A distinção importa: quase toda regra de seita, de fase e de luz é escrita **em
relação aos luminares**, não em relação a "planetas" em geral.

### 1.1 A ordem caldeia é a ordem da velocidade — e isso é verificável 📐

A "ordem caldeia" (Saturno → Júpiter → Marte → Sol → Vênus → Mercúrio → Lua) é
apresentada por todo mundo como esotérica. Ela é, na origem, **empírica**: é a
ordem do mais lento para o mais rápido em movimento aparente. Medi:

| Planeta | Velocidade média aparente medida (2000–2050) |
|---|---|
| Saturno | 0,0338 °/dia |
| Júpiter | 0,0841 °/dia |
| Marte | 0,5268 °/dia |
| Sol | 0,9856 °/dia |
| Vênus | 0,9878 °/dia |
| Mercúrio | 0,9855 °/dia |
| Lua | 13,1764 °/dia |

📐 Medição própria — script em `scratchpad/retro.js`, `astronomy-engine` (a mesma
lib do app), eclíptica verdadeira da data, passo de 1 dia, 2000‑01‑01 a 2050‑01‑01.

Duas observações que valem conteúdo:

1. **Mercúrio e Vênus têm velocidade média idêntica à do Sol** (0,9855 / 0,9878 /
   0,9856 °/dia). Não é coincidência: eles orbitam *dentro* da órbita da Terra e,
   vistos daqui, ficam presos ao Sol. É exatamente o argumento que Ptolomeu usa em
   I.17 para lhes dar os signos vizinhos aos dos luminares — a astronomia dele
   estava certa. Na ordem caldeia eles aparecem entre o Sol e a Lua **por convenção
   de esfera**, não por velocidade média, já que a velocidade média é a mesma.
2. A ordem caldeia gera os **dias da semana** ao se percorrer a lista de hora em
   hora e tomar o regente de cada 25ª hora ⚠️ [TRADIÇÃO POSTERIOR] — a atestação
   antiga costuma ser remetida a Dião Cássio (*História Romana* 37.18‑19); **não li
   a passagem** nesta pesquisa. O app já usa a ordem caldeia para o regente do dia
   (`lib/cosmicSound.js:52`, `lib/dailyHoroscope.js:338`), e isso está correto como
   convenção antiga — mas não deve ser vendido como "Ptolomeu diz".

---

## 2. A GRADE DE ANÁLISE — as sete perguntas que a tradição faz de cada planeta

Astrologia tradicional não pergunta "o que Marte significa?". Pergunta sete coisas,
nesta ordem, e o significado sai do cruzamento. Entender a grade é mais útil do que
decorar adjetivos.

### 2.1 Natureza térmica — **[FONTE PRIMÁRIA]** ✅

*Tetrabiblos* I.4. Já tabelado no documento 01 §2.5 e já implementado em
`lib/grounding.js`. Resumo: Sol esquenta e seca um pouco; Lua umedece; Saturno
esfria e seca; Júpiter esquenta e umedece (temperado); Marte seca e queima; Vênus
esquenta pouco e umedece muito; Mercúrio alterna, **sem qualidade fixa**.

**O alerta que nunca envelhece:** Ptolomeu está descrevendo efeito **físico e
meteorológico**. "Saturno resfria" é sobre clima, não sobre humor.

### 2.2 Benéfico e maléfico — **[FONTE PRIMÁRIA]** ✅ e o *porquê* é o ponto

*Tetrabiblos* I.5. Ptolomeu não decreta: **deriva** a classificação das quatro
qualidades. Duas delas são fecundas e ativas — "the hot and the moist"; duas são
destrutivas e passivas — "the dry and the cold" ✅.

Disso sai tudo:

| Classe | Planetas | Justificativa de Ptolomeu (I.5) ✅ |
|---|---|---|
| Benéficos | Júpiter, Vênus, **e a Lua** | "because of their tempered nature and because they abound in the hot and the moist" |
| Maléficos | Saturno, Marte | "one because of his excessive cold and the other for his excessive dryness" |
| Comuns | Sol, Mercúrio | "have both powers, because they have a common nature", e se somam a quem estiver junto |

Três consequências que quase nenhum app percebe:

1. **A Lua é benéfica em Ptolomeu.** A lista clássica é Júpiter, Vênus **e Lua** —
   não só os dois primeiros. O mercado quase sempre lista "benéficos: Júpiter e
   Vênus" e esquece o luminar.
2. **O Sol não é benéfico.** É **comum**, junto com Mercúrio. Isso contraria a
   intuição solar do público moderno ("Sol = vida, ótimo") e é uma boa correção de
   conteúdo.
3. **"Maléfico" é uma classificação de qualidade elemental excessiva**, não um
   julgamento moral. O que faz Saturno "maléfico" é o excesso de frio, do mesmo
   modo que gelo demais estraga a plantação.

**A ressalva que muda o uso — [FONTE PRIMÁRIA]** ✅ **Valens I.1 (fecho do
capítulo):** um maléfico bem colocado **na sua própria seita** é bom. Verbatim:

> "even the malefic stars, when they are operative in appropriate places in their
> own sect, are bestowers of good and indicative of the greatest positions and
> success; when they are inoperative, they bring about disasters and accusations."
> — Vétio Valente, *Anthologiae* I.1, trad. Riley ✅

E o simétrico, na mesma passagem: benéficos mal situados "are indicative of
reversals" ✅. Ou seja: **a tradição antiga já era mais matizada que a maior parte
do conteúdo atual.** "Saturno é ruim" é uma redução que Valens explicitamente
recusa. Isso é ouro para o app: dá para dizer algo verdadeiro, com fonte, que
contraria a versão simplista do mercado.

### 2.3 Gênero — **[FONTE PRIMÁRIA]** ⚠️

*Tetrabiblos* I.6. Lua e Vênus femininos; Sol, Júpiter, Marte e Saturno masculinos;
Mercúrio comum. Categoria elemental (úmido = feminino), não sociológica.
**Recomendação editorial:** o app não tem nenhuma razão de produto para exibir
"planeta masculino/feminino" — é a categoria antiga que pior envelheceu e a que
mais facilmente é lida como afirmação sobre pessoas. Usar só se houver necessidade
técnica, e sempre explicando que é vocabulário de física antiga.

### 2.4 Seita (*hairesis*) — **[FONTE PRIMÁRIA]** ✅ e é a peça que o mercado perdeu

*Tetrabiblos* I.7. Diurnos: "the sun and Jupiter". Noturnos: "the moon and Venus".
Mercúrio: "common as before, diurnal when it is a morning star and nocturnal as an
evening star" ✅.

E os dois maléficos entram na **seita contrária** para serem temperados: Saturno
(frio) vai para o dia, que é quente; Marte (seco) vai para a noite, que é úmida —
"each of them attains good proportion through admixture" ⚠️ (parafraseado do
resumo do capítulo; a frase citada é curta e do texto de Robbins).

Valens confirma a mesma grade planeta a planeta em I.1 ✅: Sol "of the day sect";
Lua "of the night sect"; Saturno "of the day sect"; Júpiter "of the day sect";
Marte "of the night sect"; Vênus "of the night sect".

**Por que isso importa para o app:** seita é o principal fator que a tradição usa
para dizer se um mesmo planeta age bem ou mal **naquele mapa**. Um Saturno em mapa
diurno e um Saturno em mapa noturno são coisas diferentes para Ptolomeu e para
Valens — e são exatamente iguais em 100% dos apps de mercado. É uma diferenciação
barata de implementar (o app já sabe se o nascimento foi de dia ou de noite, porque
já calcula o Ascendente) e impossível de contestar como "invenção".

| Planeta | Seita | Fonte |
|---|---|---|
| Sol | diurna | Ptol. I.7 ✅ · Valens I.1 ✅ |
| Júpiter | diurna | Ptol. I.7 ✅ · Valens I.1 ✅ |
| Saturno | diurna (maléfico da seita do dia) | Ptol. I.7 ✅ · Valens I.1 ✅ |
| Lua | noturna | Ptol. I.7 ✅ · Valens I.1 ✅ |
| Vênus | noturna | Ptol. I.7 ✅ · Valens I.1 ✅ |
| Marte | noturna (maléfico da seita da noite) | Ptol. I.7 ✅ · Valens I.1 ✅ |
| Mercúrio | comum — diurno se nasce antes do Sol, noturno se depois | Ptol. I.7 ✅ |

### 2.5 As cinco dignidades essenciais

A tradição mede a força de um planeta **no lugar onde ele está** por cinco camadas,
da mais forte para a mais fraca. O app implementa hoje as duas primeiras
(`lib/dailyHoroscope.js:197`, `dignidadeDe`).

**1. Domicílio** — *Tetrabiblos* I.17 ✅. Tabelado no doc 01 §2.6. O app usa
(`DOMICILIO_POR_SIGNO`, `lib/dailyHoroscope.js:150`).

**2. Exaltação** — *Tetrabiblos* I.19 ✅, **por signo, sem graus**. Tabelado no doc
01 §2.7, com a armadilha: os graus famosos (Sol 19° Áries etc.) **não estão em
Ptolomeu**. O app usa (`EXALTACAO_POR_SIGNO`, `lib/dailyHoroscope.js:168`) e
acerta ao não exibir graus.

**3. Triplicidade** — *Tetrabiblos* I.18 ⚠️. Cada trígono elemental tem regente de
**dia** e de **noite**, mais um participante. A versão de Ptolomeu:

| Triângulo | Signos | Dia | Noite | Participante | Razão dada |
|---|---|---|---|---|---|
| 1º | Áries, Leão, Sagitário | Sol | Júpiter | Marte (por ter Áries) | "composed of three masculine signs" |
| 2º | Touro, Virgem, Capricórnio | Vênus | Lua | Saturno | "composed of three feminine signs" |
| 3º | Gêmeos, Libra, Aquário | Saturno | Mercúrio | Júpiter | "primarily of eastern constitution, because of Saturn" |
| 4º | Câncer, Escorpião, Peixes | Vênus | Marte | Lua | "left to the only remaining planet, Mars" (que tem Escorpião) |

⚠️ Esta tabela foi extraída de leitura assistida do capítulo I.18 no texto de
Robbins, **não conferida linha a linha por mim no original**. Antes de exibir
triplicidade no app, reconferir — em especial o 4º triângulo, onde Ptolomeu
raciocina de modo diferente dos outros três.

**[DISPUTADO]** ⚠️ A tabela de triplicidades que os astrólogos tradicionais
modernos de fato usam é a de **Doroteu de Sídon**, não a de Ptolomeu, e elas
divergem em detalhes. Doroteu não foi lido nesta pesquisa (nem na do doc 01). Se o
app for usar triplicidade um dia, **essa divergência precisa ser resolvida com o
texto de Doroteu na mão**, não por dedução.

**4. Termos (ὅρια)** — *Tetrabiblos* I.20‑21 ✅. Já coberto no doc 01 §2.8: Ptolomeu
apresenta **três sistemas concorrentes** (egípcio, caldeu e o dele), critica o
egípcio nominalmente, e o campo nunca resolveu. **[DISPUTADO] desde a antiguidade,
dentro do mesmo capítulo do mesmo autor.** Não reproduzo as tabelas aqui: são 12
linhas × 5 colunas de graus, com três variantes, e um erro de digitação numa delas
seria invisível e permanente. Se for preciso, extrair direto de Robbins I.20‑21 e
conferir soma = 30° por signo.

**5. Face / decano** — ⚠️ **ARMADILHA.** Ver doc 01 §2.8: Ptolomeu **rejeita** os
decanos (I.22 — "we shall omit"), e o que ele chama de "face" em I.23 é uma relação
angular com os luminares, **não** um pedaço de 10° do signo. A "face" que o mercado
usa é outra coisa com o mesmo nome. Nunca cite I.23 para justificar decanato.

**E a ausência de dignidade: peregrino** — **[TRADIÇÃO POSTERIOR]** ✅ Lilly define
com clareza (*Christian Astrology*, 1647/1659, Livro I):

> "A Planet is then said to be Peregrine, when he is in the degrees of any Sign
> wherein he hath no essentiall dignity: As ♃ in the tenth degree of ♈, that Sign
> being not his House, Exaltation, or of his Triplicity, or he having in that
> degree either Term or Faces, he is then said to be Peregrine"
> — Lilly, *Christian Astrology*, 2ª ed. 1659 ✅ (transcrito de OCR do fac‑símile;
> ortografia da época preservada, alguns caracteres reconstruídos)

**Nota de produto importante:** peregrino é **o caso mais comum**. Com cinco
dignidades, a maioria dos planetas na maioria dos mapas não tem nenhuma. O
comentário em `lib/dailyHoroscope.js:194` já diz isso corretamente — a tela não
pode tratar "peregrino" como má notícia nem como exceção. É o estado normal.

### 2.6 As condições em relação ao Sol

Esta é a camada que quase nenhum app implementa e que a tradição considera
decisiva. Não é dignidade *essencial* (não depende do signo) — é **condição**, ou
"dignidade acidental".

**Oriental e ocidental** — **[FONTE PRIMÁRIA]** ✅ (Ptolomeu I.8; Valens usa o tempo
todo). Planeta que nasce **antes** do Sol (estrela da manhã) é oriental; depois do
Sol (estrela da tarde), ocidental. Para Mercúrio isso decide a seita (§2.4).

**Sob os raios (*under the rays*)** — **[FONTE PRIMÁRIA]** ✅ A expressão está em
Valens dezenas de vezes, sempre como enfraquecimento. Exemplos verbatim:

> "If the houseruler of the Lot or of the Ascendant is **under the rays of the
> sun**, the native will stretch out his hands to beg."
> "Mercury in this Place and located **under the rays of the sun** makes stupid,
> illiterate men."
> "If Mars and Venus are setting **under the rays of the sun**, they cause sneaking
> adulterers and secret sins."
> — Valens, *Anthologiae* II (Riley) ✅

Note o padrão: **sob os raios = escondido, secreto, ineficaz** — não "queimado" no
sentido de danificado, mas *invisível*, e portanto sem operar em público. Essa
leitura é muito mais defensável e muito mais interessante que "planeta fraco".

**Combusto** — **[TRADIÇÃO POSTERIOR]** ✅ O valor numérico que todo software usa
vem da tradição medieval e chega a nós por Lilly:

> "A Planet is said to be Combust of the ☉, when in the same Sign where the ☉ is,
> he is not distant from the ☉ eight degrees and thirty minutes, either before or
> after the ☉"
> — Lilly, *Christian Astrology* 1659, Livro I ✅ (OCR; o valor **8° 30'** está
> legível no fac‑símile)

E o limite externo:

> "A Planet is said to be still under the Sun-beams until he is fully elongated or
> distant from his body 17 degr., either before or after"
> — idem ✅ (OCR; **17°** legível)

**Cazimi** — **[TRADIÇÃO POSTERIOR]** ⚠️ **NÃO VERIFICADO.** O valor que circula
universalmente é **17 minutos de arco** do centro do Sol, e é atribuído a Lilly
("in the heart of the Sun"). **Procurei a passagem no OCR do fac‑símile de 1659 e
não a localizei** — o OCR daquela região está corrompido. Todas as fontes
secundárias consultadas dão 17'. A etimologia usualmente citada é do árabe
*kaṣmīmī* ("como que no coração") ⚠️, também não verificada. **Se o app exibir
cazimi, escreva "17' — valor da tradição medieval, transmitido por Lilly" e não
"Lilly diz", até alguém achar a linha.**

**A hierarquia, então:**

| Distância angular do Sol | Nome | Efeito na tradição |
|---|---|---|
| ≤ 0°17' | Cazimi | fortalece muito ⚠️ |
| 0°17' – 8°30' | Combusto | enfraquece muito ✅ |
| 8°30' – 17° | Sob os raios | enfraquece / oculta ✅ |
| > 17° | Livre dos raios | condição normal ✅ |

**E aqui a tradição pode ser verificada — e passa no teste** 📐

Lilly, no mesmo capítulo, afirma que "☿ cannot be more degrees removed from the ☉
then 28, nor ♀ more then 48" ✅. Medi as elongações máximas reais de 2000 a 2050:

| | Lilly (1647/59) | Medido 📐 |
|---|---|---|
| Mercúrio, maior afastamento do Sol | 28° | **27,83°** |
| Vênus, maior afastamento do Sol | 48° | **47,23°** |

📐 `scratchpad/retro.js`, `A.SearchMaxElongation`, 315 elongações de Mercúrio e 62
de Vênus na janela. Lilly erra por menos de 1° em Vênus e por 0,2° em Mercúrio —
com instrumentos de 1647. **Este é o tipo de fato que dá autoridade ao app sem
prometer nada**: a tradição observou de verdade, e observou bem.

### 2.7 Estações e retrogradação — a condição mais famosa e a pior compreendida

Aqui só o esqueleto doutrinário; o caso de Mercúrio tem seção própria (§7).

**Ptolomeu, I.8** ⚠️ trata as fases do planeta como **qualidades térmicas**, em
paralelo às fases da Lua:

| Trecho do ciclo | Qualidade atribuída (I.8) |
|---|---|
| do nascer heliacal à 1ª estação | umidade |
| da 1ª estação ao nascer acrônico | calor |
| do nascer acrônico à 2ª estação | secura |
| da 2ª estação ao ocaso | frio |

Ou seja: **em Ptolomeu, "retrógrado" não é bom nem mau — é uma fase térmica do
ciclo.** Não há uma palavra sobre contratos, viagens ou mal‑entendidos.

**Valens** ✅ é quem dá o significado prático, e ele é exatamente um: **atraso**.

> "If the stars are passed the first stationary point and are found to be
> retrograde, they **delay expectations, actions, profits, and enterprises**. In
> the same way they will be rather weak and thwarting when in opposition to the
> sun; they hold out only appearances and hopes. If they are at <or passed> the
> second stationary point, they **cancel any delay and reinstate the same
> activities**. They then bring stability and success in life."
> — Valens, *Anthologiae* V (Riley) ✅

Três coisas a extrair, e todas contrariam o discurso corrente:

1. O conteúdo é **adiamento**, não desastre.
2. A **segunda estação cancela o atraso** e devolve estabilidade — a tradição tem
   um final feliz embutido que a internet cortou fora.
3. Valens diz "as estrelas", no plural e em geral. **Não há nada de especial com
   Mercúrio nessa doutrina.** A regra vale igual para Marte, Júpiter e Saturno.

**Lilly** ✅ segue a mesma linha, tratando retrogradação como **debilidade
acidental** e como sinal de coisa que anda para trás. Num julgamento de doença:

> "if either the ☽ or Lord of the ascendant be in ☌ to a benevolent Planet,
> Retrograde, the sick will recover, but not in haste, for it's an argument of the
> **prolongation of the Disease** and relapsing out of one Disease into another"
> — Lilly, *Christian Astrology* 1659 ✅ (OCR)

E, nas suas "considerações antes do julgamento", um planeta retrógrado ou na
primeira estação como significador é sinal de **contradição** no assunto ⚠️ (a
linha existe no fac‑símile mas o OCR está parcialmente ilegível; a leitura
"contradiction" é provável, não certa).

**A síntese honesta da tradição sobre retrogradação, em uma frase:** *demora,
revisita, contradiz, e depois destrava.* Nada além disso está em fonte antiga.

---

## 3. OS SETE, UM A UM

Cada retrato abaixo tem a mesma estrutura: **significações na fonte** (base:
Valens I.1, o texto antigo mais detalhado que existe sobre isto, lido integralmente
nesta pesquisa ✅), **grade técnica** (natureza, seita, dignidades), **ciclo real
medido** 📐, e **o que o app pode dizer**.

> **Sobre o método destes retratos:** as significações são apresentadas com minhas
> palavras, agrupadas por tema, com citações curtas onde a expressão exata importa.
> Valens escreve em listas longas e desordenadas; a organização é minha, o conteúdo
> é dele.

---

### 3.1 ☉ SOL

**Fonte** — Valens I.1 ✅ abre pelo Sol e o define como fogo da natureza e luz
intelectual, "the organ of mental perception". As significações se agrupam assim:

- **Poder e posição:** realeza, comando, autoridade sobre multidões, cargo,
  reputação pública, honras (estátuas, coroas, retratos), sumos sacerdócios.
- **Faculdade:** intelecto, inteligência, discernimento, juízo.
- **Pessoas:** o pai, o senhor/patrão, personagens nobres, amizade.
- **Corpo:** a cabeça; o **olho direito**; do tronco, **o coração**; os nervos.
- **Matéria:** ouro. **Frutos:** trigo e cevada.
- **Grade:** seita **diurna**; cor amarelada; sabor amargo.

> ⚠️ **O "Sol rege o coração" (Valens I.1) é a chave do erro mais repetido do
> mercado**: a atribuição do coração a **Leão** é derivada (Leão é domicílio do
> Sol), não é a atribuição original. Ver doc 01 §3.2.

**Grade técnica** — Natureza: esquenta, seca um pouco (Ptol. I.4 ✅). Classe:
**comum**, não benéfico (Ptol. I.5 ✅). Seita: diurna. Domicílio: **Leão**.
Exaltação: **Áries**. Exílio: Aquário. Queda: Libra. Rege a triplicidade de fogo
por dia.

**Ciclo real** 📐 — Velocidade média 0,9856 °/dia, variando de **0,953 a 1,020
°/dia** (mais rápido em janeiro, perto do periélio). Nunca retrógrado. Período de
Valens: **19 anos** — e 19 anos é o **ciclo metônico** (19 anos trópicos = 6939,60
dias; 235 lunações = 6939,69 dias; diferença de **2 horas em 19 anos**) 📐. Ver §4.2.

**O que o app pode dizer:** que o Sol é o significador de pai, autoridade, o que a
pessoa faz publicamente, e do coração — tudo com Valens I.1 nominal. **Não** pode
dizer que é "benéfico" (Ptolomeu o classifica como comum) nem que "rege a
personalidade" (isso é Alan Leo, 1895+, ver doc 01 §2.12).

---

### 3.2 ☽ LUA

**Fonte** — Valens I.1 ✅. É o planeta com a lista mais **material** de todas, o
que costuma surpreender quem espera "emoções":

- **Vida e corpo:** "man's life, body", concepção, nutrição, aparência, visão.
- **Pessoas:** **a mãe**; o irmão mais velho; a rainha, a dona da casa.
- **Casa e cidade:** administração doméstica, o lar, posses, a cidade, a assembleia
  do povo, ganhos e despesas.
- **Movimento:** viagens, deslocamentos e **errâncias** — e Valens explica por quê:
  "it does not provide straight pathways because of Cancer" ✅ (o caranguejo anda
  de lado — raciocínio por imagem do signo, típico da fonte).
- **Corpo:** olho **esquerdo**, estômago, seios, baço, dura‑máter, medula.
- **Matéria:** prata e vidro. **Grade:** seita **noturna**; verde; sabor salgado.

**Grade técnica** — Natureza: umedece (Ptol. I.4 ✅). Classe: **BENÉFICA** — Ptolomeu
a lista junto com Júpiter e Vênus (I.5 ✅). Seita: noturna. Domicílio: **Câncer**.
Exaltação: **Touro**. Exílio: Capricórnio. Queda: Escorpião. Rege a triplicidade de
terra por noite.

**Ciclo real** 📐 — Velocidade média **13,1764 °/dia**, entre 11,767 e 15,374 °/dia.
Nunca retrógrada.

**E aqui a tradição é verificada de novo, com precisão desconfortável:** Lilly, em
1647, dá o movimento médio da Lua como **13° 10' 36"** = 13,17667 °/dia ✅ (OCR
legível). Medição própria: **13,1764 °/dia**. Diferença: **0,0003 °/dia**. Ele
também dá o retorno pelos doze signos em "27 days, 7 hours and 43 min" ✅ — o mês
sideral real é 27 d 7 h 43 min 12 s. **Ele errou por 12 segundos.**

Uma discrepância, registrada por honestidade: Lilly diz que a Lua nunca excede
"15 degr. and two min." em 24 horas; medi máximo de **15,374°** (15° 22'). Lilly
subestimou o extremo em ~20'.

**O que o app pode dizer:** mãe, corpo, casa, cotidiano, viagem — Valens I.1. E que
a Lua é **benéfica** na classificação de Ptolomeu, o que quase nenhum concorrente
sabe. O app já usa Lua intensamente (`moonSign`, fases); o material de Valens dá
substância a essas telas sem inventar nada.

---

### 3.3 ☿ MERCÚRIO

**Fonte** — Valens I.1 ✅ é longuíssimo sobre Mercúrio, e o resumo em uma palavra é
**intermediação**:

- **Mente e linguagem:** educação, letras, disputa, raciocínio, interpretação,
  embaixadas, oratória, filosofia.
- **Número e medida:** contas, geometria, pesos e medidas, "the testing of
  coinage", bancos.
- **Comércio:** mercados, associação, comunicação, ganho, "the creator of all
  marketing and banking" ✅.
- **Pessoas:** irmãos e filhos mais novos.
- **Ofícios:** escribas, advogados, médicos, arquitetos, músicos, escultores,
  adivinhos, **intérpretes de sonhos**, tecelões, estrategistas — e também
  "deception, gambling, or sleight of hand" ✅ (o mesmo planeta faz o notário e o
  trapaceiro; isso é doutrina, não piada).
- **Corpo:** mãos, ombros, dedos, articulações, ventre, audição, artérias,
  intestinos, **a língua**.
- **Matéria:** cobre e **as moedas usadas na compra e venda** — "for the god makes
  exchanges" ✅.

E a linha mais importante para o app:

> "This star's effects go in many directions, depending on the changes of the
> zodiac and the interactions of the stars, and yields quite varied results […] As
> for the end result — Mercury will make everything **capricious in outcome and
> quite disturbed**."
> — Valens, *Anthologiae* I.1 ✅

**Grade técnica** — Natureza: alterna seco/úmido, **sem qualidade fixa**, e Ptolomeu
credita isso à velocidade: "inspired as it were by the speed of his motion"
(I.4 ✅). Classe: **comum** (I.5 ✅). Seita: **comum** — diurno se estrela da manhã,
noturno se da tarde (I.7 ✅). Domicílios: **Gêmeos e Virgem**. Exaltação:
**Virgem** (único planeta que se exalta no próprio domicílio). Exílios: Sagitário e
Peixes. Queda: Peixes. Rege a triplicidade de ar por noite.

**Ciclo real** 📐 — Velocidade média 0,9855 °/dia (a do Sol), variando de **+2,202 a
−1,383 °/dia**: é o planeta com a maior amplitude de velocidade relativa do
sistema. Elongação máxima: entre **17,86° e 27,83°**. Retrogradações: **3,10 por
ano**, duração média **22,2 dias** (mínimo 19, máximo 25), totalizando **19,1% do
tempo**. Período de Valens: **20 anos** — que são 63 retornos sinódicos (7300,3
dias = 19,99 anos) 📐.

**O que o app pode dizer:** comércio, escrita, contas, mãos, língua, irmãos mais
novos, e a **variabilidade** como característica de fonte (Valens diz literalmente
que os resultados de Mercúrio são "capricious"). Ver §7 antes de escrever qualquer
linha sobre retrogradação.

---

### 3.4 ♀ VÊNUS

**Fonte** — Valens I.1 ✅ abre com uma definição de duas palavras: "Venus is desire
and love". Depois:

- **Vínculo:** casamento, amizade, companhia, acordos em termos favoráveis.
- **Pessoas:** a **mãe** (sim — Valens dá a mãe também a Vênus, além da Lua) e a
  nutrição.
- **Ofício e arte:** sacerdócios, direção de escolas, "pure trades", boas vozes,
  gosto por música, canto, pintura, mistura de cores em bordado, tintura e
  perfumaria; trabalho com esmeraldas, pedras preciosas e marfim; ourives,
  barbeiros.
- **Administração:** supervisão de pesos e medidas, mercados, oficinas, dar e
  receber presentes.
- **Corpo:** pescoço, rosto, lábios, olfato, as partes da frente, órgãos sexuais;
  internamente, os pulmões.
- **Matéria:** pedras preciosas e joalheria. **Fruto:** a oliveira.
- **Grade:** seita **noturna**; branca; sabor muito oleoso.

**Grade técnica** — Natureza: esquenta pouco, umedece muito (I.4 ✅). Classe:
**benéfica** (I.5 ✅). Seita: noturna. Domicílios: **Touro e Libra**. Exaltação:
**Peixes**. Exílios: Escorpião e Áries. Queda: Virgem. Rege a triplicidade de terra
por dia e a de água por dia.

**Ciclo real** 📐 — Velocidade média 0,9878 °/dia (+1,259 a −0,631). Elongação
máxima **45,39° a 47,23°**. Retrogradações: **0,58 por ano** — ou seja, uma a cada
~19 meses — com duração média de **42,2 dias** (40 a 44), somando **7,2% do tempo**.
É o planeta que **menos** retrograda dos cinco visíveis. Período de Valens: **8
anos** — que são 5 retornos sinódicos (2919,6 dias = 7,994 anos) 📐, o famoso ciclo
óctuplo de Vênus.

**O que o app pode dizer:** afeto, acordo, arte, dinheiro em forma de ornamento e
de comércio "limpo", a garganta e o rosto. E um fato de calendário que é conteúdo
pronto e verdadeiro: **Vênus retrógrada é rara** (uma vez a cada ano e meio) —
exatamente o contrário do tratamento que ela recebe hoje, em que é apresentada como
mais um evento na esteira de Mercúrio.

---

### 3.5 ♂ MARTE

**Fonte** — Valens I.1 ✅. A lista é a mais dura do capítulo e não deve ser
suavizada nem reproduzida crua num app de consumo:

- **Força e conflito:** força, guerras, pilhagem, gritos, violência, roubo à mão
  armada, brigas entre amigos, ira, processos, ódio, juramentos falsos.
- **Perda:** perda de bens, banimento, exílio, afastamento dos pais.
- **Ofício e ação:** comando, campanhas militares, governos, infantaria, caça,
  trabalho com **fogo e ferro**, artesanato, alvenaria.
- **Corpo:** cabeça, nádegas, genitais; internamente, o **sangue**, a bile, os
  ductos seminais, as costas.
- **Matéria:** **ferro**, ornamento de vestes ("because of Aries" — a lã), vinho e
  feijões.
- **Grade:** seita **noturna**; vermelho; sabor ácido.

**Como usar isso num app moderno sem mentir e sem assustar:** o vetor de Marte na
fonte é **ação que corta** — ferro, fogo, ofício manual, comando, disputa. As
consequências catastróficas que Valens lista pertencem a um gênero de literatura
(prognóstico de vida inteira, século II) que o app não pratica. Descrever Marte
como "o que corta, forja e comanda" é fiel; descrever como "energia e paixão" é
Rudhyar 1936 em diante, e deve ser marcado como tal.

**Grade técnica** — Natureza: seca e queima, "in conformity with his fiery colour"
(I.4 ✅). Classe: **maléfico** por secura excessiva (I.5 ✅) — **com a ressalva de
Valens** (§2.2): em seita própria e bem colocado, é doador de bem. Seita: noturna.
Domicílios: **Áries e Escorpião**. Exaltação: **Capricórnio**. Exílios: Libra e
Touro. Queda: Câncer. Rege a triplicidade de água por noite; participa da de fogo.

**Ciclo real** 📐 — Velocidade média 0,5268 °/dia (+0,791 a −0,400). Retrogradações:
**0,42 por ano** — uma a cada ~26 meses — com duração média de **74,1 dias**, e uma
variação enorme (de 60 a 81 dias), somando **9,3% do tempo**. Período de Valens:
**15 anos** — 7 retornos sinódicos (5459,6 dias = 14,95 anos) 📐.

---

### 3.6 ♃ JÚPITER

**Fonte** — Valens I.1 ✅. É a lista mais curta e mais uniforme:

- **Aumento:** gerar filhos, procriação, desejo, amores, abundância de colheitas.
- **Posição e lei:** justiça, cargos, ranks, autoridade sobre templos, arbitragens,
  fideicomissos, herança.
- **Vínculo social:** amizade com grandes homens, laços políticos, fraternidade,
  parceria, beneficência.
- **Alívio:** posse segura de bens, alívio de problemas, "release from bonds",
  liberdade.
- **Dinheiro:** salários, grandes presentes, depósitos em confiança, administração.
- **Corpo:** coxas e pés; internamente, o esperma, o útero, o **fígado**, o lado
  direito. Valens acrescenta um detalhe delicioso: "Consequently in the games
  Jupiter governs the race" ✅.
- **Matéria:** estanho. **Grade:** seita **diurna**; cinza tendendo a branco; doce.

**Grade técnica** — Natureza: força ativa temperada, "both heats and humidifies"
(I.4 ✅). Classe: **benéfico** (I.5 ✅). Seita: diurna. Domicílios: **Sagitário e
Peixes**. Exaltação: **Câncer**. Exílios: Gêmeos e Virgem. Queda: Capricórnio. Rege
a triplicidade de fogo por noite; participa da de ar.

**Ciclo real** 📐 — Velocidade média 0,0841 °/dia (+0,242 a −0,137). Retrogradações:
**0,86 por ano**, duração média **120,7 dias**, somando **29,9% do tempo**. Período
de Valens: **12 anos** — 11 retornos sinódicos (4387,7 dias = 12,01 anos) 📐 e
também, aproximadamente, o período orbital real (11,86 anos).

**Um fato que reorganiza o discurso do mercado:** Júpiter passa **quase um terço do
tempo retrógrado**. Se retrogradação fosse a catástrofe que se anuncia, o "planeta
da sorte" estaria avariado 4 meses por ano, todo ano. Ver §7.1.

---

### 3.7 ♄ SATURNO

**Fonte** — Valens I.1 ✅. É o retrato mais longo e mais sombrio, e vale lê‑lo pelo
que ele revela do **mundo social** do século II, não como diagnóstico:

- **Caráter atribuído:** mesquinho, atormentado, solitário, secreto, severo,
  cabisbaixo, "black‑clad", de ar hipócrita.
- **Trabalho e terra:** servos e agricultores "because of its rule over the land";
  locatários, cobradores de imposto; ofícios ligados à água e à navegação.
- **Poder por delegação:** e — nota importante — Saturno também "puts into one's
  hands great ranks and distinguished positions, supervisions, **management of
  others' property**, and the fathership of others' children" ✅. **Saturno dá
  cargo.** O mercado quase nunca diz isso.
- **Obstrução:** lentidão, desemprego, obstáculos, processos intermináveis, dívidas,
  prisões, luto.
- **Corpo:** pernas, joelhos, tendões, linfa, fleuma, bexiga, **rins**, e "the
  internal, hidden organs".
- **Matéria:** chumbo, madeira e pedra.
- **Grade:** "It is the star of **Nemesis**" ✅; seita **diurna**; cor de castóreo;
  sabor adstringente.

> ⚠️ **Regra de conteúdo do projeto:** Valens lista uma série de doenças sob
> Saturno. O app **não faz alegação de saúde** (`lib/grounding.js`,
> `lib/zodiacBody.js`, e a memória `feedback_conteudo_tradicao_sem_saude`). A
> melotesia (parte do corpo ↔ astro) pode ser citada como **tradição histórica com
> fonte**; nunca como orientação. Isso vale para os sete.

**Grade técnica** — Natureza: esfria e seca (I.4 ✅). Classe: **maléfico** por frio
excessivo (I.5 ✅), com a mesma ressalva de seita. Seita: **diurna**. Domicílios:
**Capricórnio e Aquário**. Exaltação: **Libra**. Exílios: Câncer e Leão. Queda:
Áries. Rege a triplicidade de ar por dia; participa da de terra.

**Ciclo real** 📐 — Velocidade média 0,0338 °/dia (+0,130 a −0,083). Retrogradações:
**0,94 por ano**, duração média **137,6 dias**, somando **36,3% do tempo**. Período
de Valens: **30 anos** — 29 retornos sinódicos (10964,7 dias = 30,02 anos) 📐, e o
período orbital real é 29,46 anos (daí o "retorno de Saturno").

**Verificação da tradição** ✅📐: Lilly afirma que Saturno "continueth Retrograde
140 dayes" e que fica "five dayes in his first station before Retrogradation" ⚠️
(OCR). Medição: **média 137,6 dias**, faixa 134–141. Lilly errou por ~2%.

---

## 4. A ARITMÉTICA REAL — o que dá para medir e afirmar sem risco

### 4.1 Tabela mestra da retrogradação 📐

Medição própria, `scratchpad/retro.js`, `astronomy-engine` (a lib que o app já usa),
eclíptica verdadeira da data, passo de 1 dia, janela 2000‑01‑01 → 2050‑01‑01
(18.263 dias). Episódios de borda descartados.

| Planeta | Episódios/ano | Duração média | Faixa | % do tempo retrógrado |
|---|---|---|---|---|
| Mercúrio | 3,10 | 22,2 d | 19–25 d | **19,1%** |
| Vênus | 0,58 | 42,2 d | 40–44 d | 7,2% |
| Marte | 0,42 | 74,1 d | 60–81 d | 9,3% |
| Júpiter | 0,86 | 120,7 d | 117–124 d | 29,9% |
| Saturno | 0,94 | 137,6 d | 134–141 d | 36,3% |
| Urano | 0,94 | 151,2 d | 149–155 d | 40,6% |
| Netuno | 0,94 | 158,6 d | 157–160 d | 43,2% |
| Plutão | 0,96 | 162,2 d | 158–165 d | 44,4% |

E o número que desmonta o pânico sozinho 📐 (janela 2020–2030):

- **Pelo menos um dos cinco planetas visíveis está retrógrado em 67,4% dos dias.**
- **Pelo menos um dos oito está retrógrado em 85,9% dos dias.**

Ou seja: se retrogradação explicasse o caos, o caos seria o estado padrão do
universo em cinco de cada seis dias. O que a tradição faz com isso — corretamente —
é tratar retrogradação como **modificador de condição de um significador
específico**, não como clima geral. Ver §7.

### 4.2 Os "períodos mínimos" de Valens são ciclos astronômicos reais 📐

**[FONTE PRIMÁRIA]** ✅ Valens usa em toda a técnica de cronocratoria uma tabela de
"períodos" por planeta (*Anthologiae* IV.1, tabela "Star / Period / One‑fourth
Period"; e III.15K;13P para os "anos médios"):

| Planeta | Período mínimo (Valens) ✅ |
|---|---|
| Saturno | 30 |
| Júpiter | 12 |
| Marte | 15 |
| Sol | 19 |
| Vênus | 8 |
| Mercúrio | 20 |
| Lua | 25 |

Esses números são apresentados no mercado como numerologia sagrada. **Não são.**
Cada um é um ciclo de retorno observável. Verifiquei:

| Planeta | Valens | O que o número é, de fato | Erro |
|---|---|---|---|
| Mercúrio | 20 | 63 retornos sinódicos = 7300,3 d = **19,99 anos** | 4,6 dias |
| Vênus | 8 | 5 retornos sinódicos = 2919,6 d = **7,994 anos** | 2,3 dias |
| Marte | 15 | 7 retornos sinódicos = 5459,6 d = **14,95 anos** | 19,1 dias |
| Júpiter | 12 | 11 retornos sinódicos = 4387,7 d = **12,01 anos** | 4,8 dias |
| Saturno | 30 | 29 retornos sinódicos = 10964,7 d = **30,02 anos** | 7,4 dias |
| Sol | 19 | **ciclo metônico**: 19 anos trópicos = 235 lunações | 2 horas |
| Lua | 25 | **ciclo lunar egípcio**: 25 anos de 365 d = 309 lunações | 1 hora |

📐 Conta reproduzível com períodos sinódicos correntes (IAU/JPL), script no
scratchpad; qualquer calculadora refaz.

**Isto é conteúdo de altíssimo valor para o app**, e ninguém no mercado brasileiro
está dizendo: os "anos planetários" da astrologia antiga são **calendários de
retorno observacional** — o registro de quando cada planeta volta a fazer a mesma
coisa no mesmo lugar. A astrologia helenística nasce de séculos de observação
babilônica, e a tabela de Valens é a prova aritmética disso.

⚠️ Ressalva de honestidade: a identificação desses números com ciclos sinódicos é
**minha leitura da coincidência numérica**, verificada aritmeticamente, e é
conhecida na literatura acadêmica de história da astronomia — mas eu **não localizei
nesta pesquisa** o texto antigo que declare "este número é o retorno sinódico".
Valens apresenta os períodos como dados, sem derivá‑los. Escreva como "os períodos
correspondem, com erro de dias, aos ciclos de retorno", não como "os antigos
disseram que".

---

## 5. OS TRÊS MODERNOS

### 5.1 O que muda quando se descobre um planeta

Antes de 1781, "sete planetas" não era uma escolha — era o inventário completo do
céu visível. A descoberta de Urano criou um problema que a astrologia nunca
resolveu de forma consensual, e que este documento vai apresentar como o que é: uma
**disputa aberta, com argumentos sérios dos dois lados**.

### 5.2 ♅ URANO — 1781

**Astronomia** ⚠️ (fontes: NASA, Royal Observatory Greenwich, Wikipedia)

- Descoberto por **William Herschel em 13 de março de 1781**, do quintal da casa
  dele em Bath. Não procurava planeta: fazia levantamento de estrelas e notou um
  objeto que não era pontual.
- Herschel o batizou **Georgium Sidus** ("astro de Jorge"), em homenagem a Jorge
  III. Fora da Inglaterra chamavam simplesmente **"Herschel"** — e é assim que os
  textos astrológicos do século XIX se referem a ele.
- O nome **Urano** foi proposto por **Johann Bode em 1782**, pelo argumento de
  coerência mitológica (Saturno é pai de Júpiter; Urano é pai de Saturno). Levou
  décadas para se firmar.
- Período orbital: 84,02 anos.

**Ciclo real** 📐 — 0,0118 °/dia de média; retrógrado **40,6% do tempo**, em
episódios de ~151 dias.

**Como entrou na astrologia — a cronologia datada** ⚠️

Esta é a resposta (parcial) à lacuna que o documento 01 §8 item 1 registrou como
não encontrada. **Encontrei uma cronologia com nomes e datas**, e a fonte é
bibliográfica séria — Philip Graves, do Astrolearn, que é um bibliógrafo de
astrologia histórica, citando pesquisa feita no fórum Skyscript por Kim Farnell,
Deborah Houlding e outros:

| Ano | Quem | O quê |
|---|---|---|
| 1825 | **Robert Cross Smith** ("Raphael I", 1795–1832) | Atribui Urano a Aquário **implicitamente**, dizendo que, "de vários milhares de observações", Aquário é o signo que mais agrada a Urano ⚠️ |
| 1828 | **John Varley** (1778–1842, pintor e astrólogo, amigo de William Blake) | Propõe **firmemente** que Urano rege Aquário ⚠️ |
| **1834** | **Richard James Morrison** ("Zadkiel I"), revista *The Horoscope* | **A proposta ainda NÃO tinha pegado.** Um leitor pergunta na seção de correspondência: *"Why has not Herschel a house assigned to him in the Zodiac?"* ✅ (verbatim, via Graves) — e nem o leitor nem o editor tratam a atribuição como existente |
| 1839 | **David Parkes** ("Ebn Shemaya"), *The Star* | Mantém Saturno com Capricórnio **e** Aquário, e anota em nota de rodapé: *"Herschell has the same fortitudes and debilities as Saturn"* ✅ (verbatim, via Graves) — nem tradicional puro, nem moderno |
| 1852 | **W. J. Simmonite**, *The Prognostic Astronomer* (2ª ed.) | Urano em Aquário aparece **como dado consolidado**, sem discussão ⚠️ |

**Três coisas que essa cronologia estabelece, e que valem ouro:**

1. **A regência moderna de Aquário tem cerca de 200 anos, não "sempre".** E tem
   autores nomeados: Smith (1825) e Varley (1828).
2. **Ela demorou ~25 anos para ser aceita**, e no meio do caminho havia astrólogos
   sérios (Zadkiel, Parkes) que a rejeitavam explicitamente ou davam a Urano as
   dignidades de Saturno.
3. **O raciocínio original NÃO era mitológico.** Graves observa que em toda a
   discussão de 1834 não há "the slightest reference to mythology as a basis for
   reading the influence of the newly discovered planets" ✅ — o método declarado
   era **observação de milhares de mapas**. O "Urano = deus do céu = rebeldia e
   tecnologia" é uma camada posterior, do século XX, construída **a partir do nome**
   que Bode escolheu em 1782. Isto é: o significado moderno de Urano depende de um
   nome que quase não foi dado a ele (podia ter ficado "Georgium Sidus").

⚠️ **Grau desta seção:** as citações verbatim de 1834 e 1839 são reproduções de
Graves, que as transcreveu dos originais e declarou o domínio público. **Não vi os
originais.** As datas de Smith (1825) e Varley (1828) são relatadas por Graves como
"as far as I can recall from reading the earlier extensive strand at Skyscript" —
ou seja, **memória de leitura de pesquisa alheia**. É bem melhor que "consenso sem
autor" (que era o estado no doc 01), mas ainda **não é primário**. Quem quiser
elevar isto a ✅ precisa ir aos volumes de Varley (1828) e Smith (1825).

### 5.3 ♆ NETUNO — 1846

**Astronomia** ⚠️

- Descoberto por **Johann Galle**, no Observatório de Berlim, em **23 de setembro de
  1846**, apontando o telescópio para a posição calculada por **Urbain Le Verrier**
  a partir das perturbações na órbita de Urano. **John Couch Adams**, em Cambridge,
  fizera cálculo equivalente sem conseguir que o observassem — daí a disputa de
  prioridade anglo‑francesa.
- É **o primeiro planeta previsto matematicamente antes de ser visto** — estava a
  cerca de 1° da posição prevista.
- Período orbital: 164,8 anos.

**Ciclo real** 📐 — 0,0060 °/dia; retrógrado **43,2% do tempo**, episódios de ~159
dias.

**Como entrou na astrologia** — ⚠️ **AQUI EU NÃO CHEGUEI À FONTE.** O artigo que
existe sobre exatamente isto (Philip Graves, *"Neptune's rulership of Pisces: first
published sources"*, astrolearn.com) está **protegido por senha** e não pôde ser
lido. Uma busca secundária atribuiu a primeira atribuição de Netuno a Peixes a
**Sepharial (Walter Gorn Old, 1864–1929)** ⚠️, mas a mesma fonte também atribui a
ele a de Urano a Aquário — o que a cronologia de §5.2 desmente. **Trate a
atribuição a Sepharial como não confiável.**

O que se pode afirmar com segurança: Peixes é domicílio de **Júpiter** em Ptolomeu
I.17 ✅, a atribuição a Netuno é posterior a 1846 por definição, e a lógica dela é
transparente — **posição na sequência** (ver §6.3) reforçada pelo nome (deus do
mar → água → Peixes). Como no caso de Urano, o significado nasce do nome, e o nome
foi escolhido por Le Verrier em outubro de 1846 ⚠️.

### 5.4 ♇ PLUTÃO — 1930

**Astronomia** ⚠️

- Descoberto por **Clyde Tombaugh** no Observatório Lowell (Flagstaff, Arizona) em
  **18 de fevereiro de 1930**, em placas fotográficas comparadas com *blink
  comparator*.
- O nome **Plutão** foi sugerido por **Venetia Burney**, menina inglesa de **11
  anos**, de Oxford. (A inicial PL também homenageia Percival Lowell.)
- **Reclassificado como planeta anão pela IAU em 24 de agosto de 2006**, na
  Assembleia Geral de Praga: cumpre dois dos três critérios de "planeta" (orbita o
  Sol, tem forma arredondada) mas não o terceiro (não limpou a vizinhança da
  órbita).
- Período orbital: ~248 anos.

**Ciclo real** 📐 — 0,0047 °/dia; retrógrado **44,4% do tempo**.

**Como entrou na astrologia** ⚠️

- A atribuição a **Escorpião** foi feita nos anos 1930, rapidamente, e por analogia
  (transformação, o oculto, a Casa VIII) ⚠️.
- **Fritz Brunhübner**, *Pluto* (Nuremberg, **1934**; tradução da AFA em 1966, ed.
  revista 1971) é a obra de referência da primeira geração. Um dos argumentos dele
  é notavelmente astrológico e nada mitológico: no dia da descoberta, Plutão estava
  **em oposição a Marte** — "dois irmãos hostis prestes a brigar pela regência de
  Escorpião" ⚠️.
- **[DISPUTADO] e continua disputado.** **Carl Payne Tobey** propôs **Áries**, pelo
  argumento sequencial: se Urano é Aquário e Netuno é Peixes, o próximo da fila é
  Áries ⚠️. Essa proposta nunca morreu e reaparece periodicamente.
- Há ainda uma linha que cita um texto de **Gregório de Nicéia** referindo
  astrologia zoroastriana, que associaria Posêidon a Peixes e Plutão a Áries como
  co‑regentes ⚠️ — **não verifiquei essa referência e ela deve ser tratada com muita
  desconfiança**: é exatamente o tipo de "precedente antigo" conveniente demais.

**A ironia registrada:** o planeta cuja regência é hoje a mais popular do mercado
moderno é o único dos três que a astronomia **rebaixou** de categoria em 2006 — sem
que isso mudasse absolutamente nada no discurso astrológico. É um ótimo exemplo de
que os dois campos não compartilham critério, e o app deve dizer isso com
tranquilidade em vez de fingir que compartilham.

### 5.5 De onde vêm os significados dos três

**[TRADIÇÃO POSTERIOR / INVENÇÃO MODERNA]** ⚠️ Vale registrar o mecanismo, porque
ele se repete três vezes:

1. Astrônomo descobre o corpo.
2. Alguém escolhe um nome mitológico (Bode 1782; Le Verrier 1846; uma menina de 11
   anos em 1930).
3. Astrólogos derivam o significado **do mito associado ao nome** — céu/rebelião,
   mar/dissolução, submundo/transformação.
4. Em seguida, o significado é confirmado "por observação" de eventos históricos
   contemporâneos à descoberta (Revolução Francesa e Independência dos EUA para
   Urano; espiritismo e anestesia para Netuno; fissão nuclear e ditaduras para
   Plutão) ⚠️.

O passo 3 é frágil: o nome foi contingente. O passo 4 é o problema clássico de
**seleção pós‑hoc** — a janela histórica de qualquer década comporta narrativa de
rebelião, dissolução e poder.

**Isso invalida os modernos?** Não necessariamente — e a §6 não vai fingir que sim.
Mas invalida a frase "Plutão significa transformação porque sempre significou". O
app não pode escrever isso.

---

## 6. CRÍTICO 1 — QUAL SISTEMA O APP DECLARA

### 6.1 As duas tabelas, lado a lado

| Signo | Regente tradicional (Ptol. I.17 ✅) | Regente moderno ⚠️ (séc. XIX–XX) |
|---|---|---|
| Áries | Marte | Marte (Plutão, segundo Tobey ⚠️) |
| Touro | Vênus | Vênus |
| Gêmeos | Mercúrio | Mercúrio |
| Câncer | Lua | Lua |
| Leão | Sol | Sol |
| Virgem | Mercúrio | Mercúrio |
| Libra | Vênus | Vênus |
| Escorpião | **Marte** | **Plutão** (desde ~1930) |
| Sagitário | Júpiter | Júpiter |
| Capricórnio | Saturno | Saturno |
| Aquário | **Saturno** | **Urano** (Smith 1825 / Varley 1828; consolidado ~1852) |
| Peixes | **Júpiter** | **Netuno** (posterior a 1846; primeira fonte não localizada) |

Só três casas mudam. Mas as três são exatamente as que o mercado usa mais.

### 6.2 Argumentos do lado TRADICIONAL

1. **Visibilidade.** Os sete são os corpos que se veem mover. É um critério
   objetivo, não estético, e é o critério que gerou o sistema inteiro.
2. **A simetria se quebra.** O esquema de Ptolomeu I.17 é uma dedução geométrica a
   partir da distância angular máxima de Mercúrio e Vênus ao Sol (doc 01 §2.6). Ao
   dar Aquário a Urano, Escorpião a Plutão e Peixes a Netuno, sobram Marte, Saturno
   e Júpiter com **um** signo cada, e Mercúrio e Vênus com **dois** — uma assimetria
   sem justificativa interna nenhuma. Nem os modernos defendem essa configuração
   como elegante; ela é o resíduo do processo histórico.
3. **Regência ≠ afinidade.** Este é o argumento mais forte e o menos entendido:
   "regência" na tradição é uma relação de **responsabilidade e disposição** (o
   regente do signo é quem "recebe" e "responde por" o que ali estiver, e é a peça
   que faz funcionar dispositor, receptão, almuten, cronocratoria). Dizer que
   Netuno *se parece* com Peixes não é o mesmo que dizer que Netuno *administra*
   Peixes. Trocar um pelo outro **quebra técnicas inteiras** que dependem da cadeia
   de disposição.
4. **Velocidade.** Um regente de signo precisa dar leituras que mudem. Netuno passa
   ~14 anos em cada signo; Plutão, 12 a 32. Um "regente" que é o mesmo para toda uma
   geração não distingue duas pessoas — e a §4.1 mostra que ele está retrógrado
   ~44% do tempo.
5. **Contraexemplo vivo.** O Jyotish (astrologia védica) usa **sete planetas + os
   dois nós lunares** e nunca incorporou os transaturninos. É um sistema com séculos
   de prática contínua e centenas de milhões de usuários — a prova de que o sistema
   de sete é operacional sem os modernos. (Ver doc 07.)

### 6.3 Argumentos do lado MODERNO

Apresentados na versão mais forte, não na caricatura:

1. **A sequência estendida.** Se você continuar a lógica de ordenação do próprio
   *thema mundi* — planetas atribuídos em ordem de distância a partir dos
   luminares — o próximo depois de Saturno em Capricórnio/Aquário é Urano em
   Aquário, depois Netuno em Peixes, depois Plutão em Áries. **Este é o melhor
   argumento moderno que existe**, e é notável porque opera *dentro* da lógica
   tradicional em vez de contra ela. Ele também prevê **Plutão em Áries** — o que
   contradiz a atribuição popular a Escorpião.
2. **Visibilidade não é linha limpa.** Urano é visível a olho nu em condições
   ótimas (magnitude ~5,4–6,0) ⚠️. Se o critério é "o que se pode ver", ele passa
   raspando.
3. **O sistema já foi expandido antes.** O zodíaco de doze signos, as casas, as
   exaltações e os lotes não nasceram juntos; a tradição incorporou camadas por
   séculos. Congelar em 150 d.C. é uma escolha, não uma neutralidade.
4. **Função transpessoal (Rudhyar, 1936+).** ⚠️ A tese de Rudhyar (*The Astrology
   of Personality*) é que os três externos representam forças **coletivas** agindo
   através do indivíduo, e que é justamente por isso que abrem a leitura de ciclos
   históricos e geracionais. Nessa moldura, a lentidão que o tradicionalista chama
   de defeito é o **recurso**. É uma tese coerente — e é a origem do vocabulário de
   "geração" que todo mundo usa hoje.
5. **Expectativa do usuário.** Não é argumento astrológico, é de produto, e precisa
   estar na mesa: o público brasileiro que chega ao app **já sabe** que "Escorpião é
   de Plutão". Um app que diz "Escorpião é de Marte" sem explicar parece errado, não
   parece rigoroso.

### 6.4 O que este documento recomenda

Não é escolher um lado. É **declarar**, e transformar a declaração em diferencial.

> **Recomendação: sistema tradicional (sete) como base declarada, com os três
> modernos exibidos como camada nomeada e datada.**

Concretamente:

1. **Regência, dignidade e qualquer texto que dependa de "quem manda no signo" usa
   os sete.** É o que o app já faz (`DOMICILIO_POR_SIGNO`,
   `lib/dailyHoroscope.js:150`) — e o comentário daquele arquivo já explica a razão.
   Falta a tela dizer.
2. **Urano, Netuno e Plutão continuam sendo calculados e exibidos** como posição e
   como aspecto (`lib/signs.js:430`), **nunca como regentes**, e sempre com a data
   de descoberta ao lado na primeira menção: "Plutão (1930)".
3. **Uma linha permanente na tela de mapa**, curta:
   *"Este mapa usa as regências clássicas (Ptolomeu, séc. II) e casas inteiras.
   Urano, Netuno e Plutão aparecem como posições, mas não como regentes — eles foram
   descobertos em 1781, 1846 e 1930."*
4. **Um card explicativo** ("Por que Escorpião é de Marte aqui?") que conte a
   cronologia da §5.2. Isso converte a objeção do usuário em **prova de
   competência** — é exatamente o movimento que o doc 08 identificou como a
   oportunidade do projeto.
5. **Onde os modernos são legítimos e o app pode usá‑los sem ressalva:** trânsito
   geracional, ciclos longos, contexto de época. Aí eles fazem o que Rudhyar disse
   que fazem, e não há conflito com a tradição — porque não há regência envolvida.

**A razão de fundo:** o app não ganha nada sendo mais um que repete Plutão‑Escorpião
sem saber de onde veio. Ganha muito sendo o único que sabe **a data, o autor e a
discussão** — e que diz qual escolheu e por quê. Isso é defensável contra qualquer
concorrente e não depende de convencer ninguém de que a outra escolha é burra.

---

## 7. CRÍTICO 2 — MERCÚRIO RETRÓGRADO

### 7.1 O que de fato acontece no céu 📐

Retrogradação é **movimento aparente**, e nada mais. Nenhum planeta inverte a
marcha. O que ocorre é geometria de perspectiva: a Terra e o planeta correm em
pistas diferentes, com velocidades diferentes, e quando a linha de visada gira mais
rápido que o deslocamento próprio do planeta, ele parece recuar contra o fundo das
estrelas — exatamente como um carro ultrapassado parece andar para trás.

- Para os **planetas internos** (Mercúrio, Vênus), a retrogradação acontece perto da
  **conjunção inferior** — quando passam entre a Terra e o Sol.
- Para os **externos** (Marte a Plutão), acontece perto da **oposição** — quando a
  Terra os ultrapassa por dentro.

Números medidos (§4.1), para Mercúrio: **3,10 episódios por ano**, duração média
**22,2 dias**, faixa 19–25, **19,1% do tempo total**. E, para contexto:
**Saturno passa 36,3% do tempo retrógrado; Plutão, 44,4%.** Em 85,9% dos dias há
pelo menos um planeta retrógrado no céu.

**Datas medidas para 2026–2027** 📐 (resolução de 1 dia, meio‑dia UTC; para exibir no
app, usar o cálculo em tempo real, não esta tabela):

| Início | Fim | Duração | Signo |
|---|---|---|---|
| 2026‑02‑26 | 2026‑03‑20 | 22 d | Peixes |
| 2026‑06‑29 | 2026‑07‑23 | 24 d | Câncer |
| 2026‑10‑24 | 2026‑11‑13 | 20 d | Escorpião |
| 2027‑02‑09 | 2027‑03‑03 | 22 d | Peixes → Aquário |
| 2027‑06‑10 | 2027‑07‑04 | 24 d | Câncer → Gêmeos |
| 2027‑10‑07 | 2027‑10‑28 | 21 d | Escorpião → Libra |

Note o padrão de três por ano, sempre com ~4 meses de intervalo, e a tendência de
cair em signos do mesmo elemento por vários anos seguidos (aqui, água) — isso é
consequência da razão entre o período sinódico de Mercúrio (115,88 d) e o ano, e é
um fato bonito e verdadeiro que o app pode contar.

### 7.2 O que a tradição de fato diz

Está tudo na §2.7, e cabe em três linhas:

- **Ptolomeu (I.8)** ⚠️: retrogradação é uma **fase térmica** do ciclo do planeta
  (entre a 1ª estação e o nascer acrônico, "calor"). Zero conteúdo psicológico.
- **Valens (V)** ✅: retrógrado **"delay expectations, actions, profits, and
  enterprises"** — e a **segunda estação "cancels any delay"**. Vale para todos os
  planetas, não só Mercúrio.
- **Lilly (1647/59)** ✅: debilidade acidental; sinal de coisa que se prolonga
  ("prolongation of the Disease"), de contradição, de assunto que volta.

**E o que Mercúrio significa quando funciona** (Valens I.1 ✅): comércio, escrita,
contas, contratos no sentido de documento e testemunho, mensagem, deslocamento
curto, irmãos mais novos, mãos e língua.

**Combine as duas coisas honestamente e você obtém:** *quando Mercúrio está
retrógrado, os assuntos de Mercúrio tendem a se atrasar e a voltar para revisão.*
Isso é defensável com fonte. É também bem menos do que a internet promete — e bem
mais útil.

### 7.3 O que NÃO está em fonte nenhuma

**[INVENÇÃO MODERNA]** — nenhum destes tem qualquer atestação antiga:

- quebra de aparelho eletrônico, celular, computador, disco rígido;
- proibição de assinar contrato;
- proibição de comprar carro, casa ou eletrônico;
- voo atrasado / bagagem extraviada;
- reaparecimento de ex‑namorado;
- "faça backup dos seus arquivos";
- **"período sombra" / "retroshade"** — as duas semanas antes e depois. Este é o mais
  recente de todos: o termo *retroshade* é atribuído a astrólogos em atividade nos
  anos 2010–2020 ⚠️ (há mais de uma reivindicação de autoria, o que por si já data a
  coisa). Não existe em Ptolomeu, Valens, Lilly ou em qualquer fonte anterior ao
  século XX que eu tenha visto.

O mecanismo do erro é fácil de descrever: pega‑se a significação **antiga** de
Mercúrio (comunicação, comércio, documentos), atualiza‑se o inventário material
(documento → contrato; mensagem → e‑mail; mensageiro → smartphone) e aplica‑se a ela
a **força** de um desastre em vez do **atraso** que a fonte descreve. Duas
distorções empilhadas: modernização do objeto (defensável) e inflação do efeito
(não defensável).

### 7.4 Como virou pânico de internet — a cronologia ⚠️

Toda esta subseção é **secundária** (imprensa cultural), útil para entender o
mercado, e **não deve ser citada como tradição**:

| Quando | O quê |
|---|---|
| Anos 1930 | Nasce o horóscopo de jornal (Naylor, 1930 — doc 01 §2.12). Mercúrio retrógrado ainda é assunto técnico de astrólogo. |
| Anos 1980 | Onda de interesse popular em astrologia nos EUA, associada à divulgação de que Nancy Reagan consultava astróloga ⚠️ |
| **1996** | **Primeira menção de "Mercury retrograde" no *New York Times*** ⚠️ — ou seja, até os anos 1990 a expressão não era vocabulário de imprensa geral |
| **2009** | Criação do site **IsMercuryInRetrograde.com** (Kate Trgovac), coincidindo com o crescimento das redes sociais ⚠️ |
| 2011 | Primeiro salto de tráfego do site ⚠️ |
| 2014 | Vídeo de Taylor Swift para a MTV é apontado por astrólogos como o momento de entrada no mainstream ⚠️ |
| **julho de 2019** | **Pico histórico de busca no Google Trends** ⚠️ |
| 2020s | Marcas passam a fazer promoção temática (McDonald's, Taco Bell, cervejaria) — o sinal definitivo de mainstream ⚠️ |

**O que essa cronologia significa para o app:** a versão que o usuário traz na
cabeça não tem 2000 anos. Tem cerca de **15**. Ela nasceu com o Facebook, foi
amplificada pelo meme e consolidada por marketing. Enquanto isso, a versão de
Valens — atraso que a segunda estação desfaz — tem 1800 anos e nunca chegou ao
usuário.

Este é, provavelmente, **o melhor pedaço de conteúdo isolado deste projeto inteiro**:
um app que explica isso, com datas dos dois lados, faz algo que nenhum concorrente
brasileiro faz.

### 7.5 O método de cálculo do app está correto — verificado 📐

`lib/signs.js:531` (`isMercuryRetrograde`) e `lib/dailyHoroscope.js:293`
(`planetaRetrogrado`) decidem retrogradação comparando a longitude eclíptica
**dois dias antes e dois dias depois** da data. É um atalho: o que ele mede é a
velocidade *média* numa janela de 4 dias, não a velocidade instantânea. A pergunta
óbvia é se isso desloca a data das estações.

Medi. Comparei a janela de ±2 dias com a velocidade instantânea (±1 hora), em passo
de 3 horas, de 2020 a 2035:

| Planeta | Estações comparadas | Desvio médio | Pior caso |
|---|---|---|---|
| Mercúrio | 94 | 0,02 d | 0,13 d |
| Vênus | 20 | 0,01 d | 0,13 d |
| Marte | 14 | 0,01 d | 0,13 d |

📐 `scratchpad/janela.js`. **O pior desvio (0,13 d ≈ 3 h) é igual ao passo de
amostragem do teste** — isto é, dentro da resolução da medição, os dois métodos
dão a mesma data. A razão é que a velocidade aparente é praticamente linear no
tempo em torno da estação, e a média simétrica de uma função linear cruza zero no
mesmo ponto que a função.

**Conclusão: o atalho está validado.** Não há bug aqui, e o comentário do arquivo
pode registrar essa verificação. (O que **não** está verificado por esta medição é
a varredura de `lib/celestialSeasons.js:39`, que procura o último dia do retrógrado
corrente com teto de 45 dias — o teto é folgado o bastante para Mercúrio, cujo
máximo medido é 25 dias, mas seria insuficiente para Marte, Júpiter ou Saturno se
a função algum dia for generalizada.)

### 7.6 O texto que o app pode escrever

Modelo, já no tom do projeto:

> **Mercúrio retrógrado**
> De 26/02 a 20/03. É movimento aparente: Mercúrio não inverte a marcha — a Terra
> o ultrapassa por fora e ele parece recuar. Acontece 3 vezes por ano, por cerca de
> 22 dias, e nada nisso é raro: em 86% dos dias existe algum planeta retrógrado no
> céu.
>
> **O que a tradição diz:** Vétio Valente (séc. II) escreve que planetas retrógrados
> "atrasam expectativas, ações, lucros e empreendimentos" — e que a segunda estação
> "cancela o atraso". É isso: **demora e revisão**, não catástrofe. E vale para
> todos os planetas, não só Mercúrio.
>
> **O que não está em fonte nenhuma:** quebrar celular, proibição de assinar
> contrato, ex que reaparece, "período sombra". Nada disso existe em Ptolomeu, em
> Valente ou em Lilly. É invenção da internet, e dá para datar: a expressão só
> aparece no *New York Times* em 1996 e vira fenômeno de busca entre 2009 e 2019.

---

## 8. O QUE A INTERNET REPETE E A FONTE NÃO SUSTENTA

### 8.1 "Os benéficos são Júpiter e Vênus"
**Incompleto.** Ptolomeu I.5 ✅ lista **Júpiter, Vênus e a Lua**. E o Sol **não** é
benéfico: é comum, junto com Mercúrio.

### 8.2 "Saturno e Marte são planetas ruins"
**Enganoso.** São "maléficos" por **excesso de qualidade elemental** (frio, secura),
e Valens I.1 ✅ diz explicitamente que maléficos bem colocados **na própria seita**
"are bestowers of good and indicative of the greatest positions and success".
Saturno, em Valens, também dá cargo, supervisão e administração de bens alheios ✅.

### 8.3 "Urano rege Aquário desde sempre"
**Falso, e agora com data.** Aquário é domicílio de **Saturno** (Ptol. I.17 ✅). A
atribuição a Urano é de **1825 (Smith) / 1828 (Varley)** ⚠️, e em **1834** ainda não
era aceita — um leitor de Zadkiel pergunta por que Herschel não tem casa nenhuma ✅.
Ver §5.2.

### 8.4 "Plutão rege Escorpião" (como fato consolidado)
**[DISPUTADO].** Foi proposto nos anos 1930 e é hoje majoritário entre modernos —
mas **Carl Payne Tobey propôs Áries** ⚠️, e o argumento sequencial (o melhor
argumento moderno, §6.3) também dá **Áries**, não Escorpião. Ou seja: a atribuição
mais popular do mercado é a que o raciocínio moderno mais forte contradiz.

### 8.5 "Mercúrio retrógrado quebra aparelhos eletrônicos"
**[INVENÇÃO MODERNA].** §7.3. Nenhuma fonte antiga, e a expressão sequer aparece na
imprensa geral antes de 1996 ⚠️.

### 8.6 "Retrogradação é rara e perigosa"
**Falso e mensurável.** 📐 Saturno passa **36,3%** do tempo retrógrado; Júpiter,
**29,9%**; Plutão, **44,4%**. Em **85,9%** dos dias há algum planeta retrógrado.

### 8.7 "O período sombra (retroshade) é parte do ciclo tradicional"
**[INVENÇÃO MODERNA] recente.** Termo dos anos 2010–2020 ⚠️, com autoria disputada
entre astrólogos vivos. Não existe em fonte antiga.

### 8.8 "Os graus de exaltação vêm de Ptolomeu"
**Não.** *Tetrabiblos* I.19 fala só em **signos** ✅. Ver doc 01 §2.7.

### 8.9 "A face/decanato do planeta está em Ptolomeu"
**Não.** Ptolomeu **rejeita** decanos (I.22 ✅) e a "face" de I.23 ✅ é outra coisa —
relação angular com os luminares. Ver doc 01 §2.8.

### 8.10 "Cazimi/combusto são doutrina de Ptolomeu"
**Não.** Ptolomeu trata a relação com o Sol em I.8 ✅ como **qualidade térmica**, sem
valores em graus. "Sob os raios" é helenístico e está em Valens ✅; os números
(8°30', 17°, 17') vêm da tradição medieval e chegam por Lilly ✅⚠️.

### 8.11 "Os 'anos' dos planetas são números místicos"
**Não.** São ciclos de retorno observáveis, com erro de dias 📐. Ver §4.2.

### 8.12 "Mercúrio retrógrado atrapalha todo mundo igual"
**Nem na versão moderna isso se sustenta.** Na tradição, o que importa é se o
planeta em questão é **significador** de alguma coisa no mapa da pessoa e se está em
condição de operar. Um "clima geral" que atinge 8 bilhões de pessoas do mesmo jeito
é exatamente o que a técnica tradicional não faz.

### 8.13 "Plutão deixou de valer porque virou planeta anão"
**Falso pelos dois lados.** A reclassificação de 2006 ⚠️ é taxonômica astronômica e
não tem relação com o critério astrológico (que, no caso dos modernos, nunca foi
"ser planeta" e sim "ter sido descoberto"). O fato interessante é outro: a
reclassificação **não mudou nada** na prática astrológica — o que mostra que os dois
campos não compartilham critério. Diga isso; não finja que compartilham.

---

## 9. ONDE ISTO TOCA O APP

Nenhum arquivo de código foi editado por esta pesquisa.

> ⚠️ **Aviso sobre números de linha:** conferidos em 31/07/2026, mas havia outras
> frentes editando o repositório no mesmo dia. `lib/signs.js:PLANETS`, por exemplo,
> estava na linha 415 quando o doc 01 foi escrito e está na 430 agora. **Confie no
> nome do símbolo (`DOMICILIO_POR_SIGNO`, `planetaRetrogrado`), não no número.**

### 9.1 `lib/dailyHoroscope.js:150` (`DOMICILIO_POR_SIGNO`) — **está certo, e precisa aparecer**
A tabela usa os sete clássicos e o comentário já explica por quê. **O que falta é a
tela dizer.** Ver §6.4, item 3. Hoje o usuário lê "Escorpião → Marte" sem nenhuma
pista de que isso é uma escolha deliberada e defensável — e vai concluir que o app
errou.

### 9.2 `lib/dailyHoroscope.js:197` (`dignidadeDe`) — falta uma camada barata e forte
Implementa domicílio, exaltação, exílio, queda e peregrino. **Não implementa
seita** (§2.4), que é a peça que a tradição usa para modular tudo e que nenhum
concorrente tem. O app já calcula o Ascendente, então já sabe se o nascimento foi
diurno ou noturno. Um Saturno em mapa diurno lido diferente de um Saturno em mapa
noturno é uma diferenciação de produto com fonte primária dupla (Ptol. I.7 ✅ +
Valens I.1 ✅).

### 9.3 `lib/dailyHoroscope.js:194` — "peregrino" é o caso normal
O comentário já acerta. Vale garantir que o texto de tela não trate peregrino como
notícia ruim: com cinco dignidades, a maioria dos planetas na maioria dos mapas não
tem nenhuma.

### 9.4 `lib/signs.js:430` (`PLANETS`) — a palavra "clássicos" no comentário
Já apontado no doc 01 §4.4 e continua valendo: a lista inclui Urano, Netuno e Plutão
sob o rótulo "planetas clássicos". É comentário interno, mas se algum texto de tela
herdar a palavra vira afirmação falsa. Sugestão de nomenclatura: **"os sete"** e
**"os três modernos"**, com data de descoberta na primeira menção de tela.

### 9.5 `lib/signs.js:531` (`isMercuryRetrograde`) e `lib/dailyHoroscope.js:293` (`planetaRetrogrado`) — **validados** 📐
O atalho da janela de ±2 dias concorda com a estação verdadeira dentro de ~3 horas,
em 94 estações de Mercúrio, 20 de Vênus e 14 de Marte (§7.5). Vale registrar isso
no comentário: é o tipo de decisão que alguém vai querer "consertar" no futuro sem
saber que já foi medida.

### 9.6 `lib/celestialSeasons.js:39` — o teto de 45 dias
Suficiente para Mercúrio (máximo medido: 25 dias) e para Vênus (44). **Insuficiente
para Marte (81), Júpiter (124), Saturno (141), Urano (155), Netuno (160) e Plutão
(165)** 📐. Não é bug hoje, porque a função só é usada para Mercúrio — é uma nota
para quem for generalizá‑la.

### 9.7 `lib/grounding.js` — material novo, do mesmo padrão
`grounding.js` hoje carrega as qualidades térmicas de Ptolomeu I.4. **Valens I.1
está integralmente lido nesta pesquisa** e é uma mina de significações **de vida**
(não térmicas) com locus único e verificável: metal, parte do corpo, ofício, pessoa
da família, cor e sabor de cada um dos sete. É exatamente o formato que
`grounding.js` já usa, e permite frases do tipo "prata e vidro, para Valente
(*Anthologiae* I.1, séc. II)" — coisa que nenhum concorrente brasileiro escreve.

### 9.8 `lib/cosmicSound.js:52` e `lib/dailyHoroscope.js:338` — o regente do dia
A ordem caldeia está correta como convenção antiga, e §1.1 acrescenta o fato
verificável de que ela é **a ordem de velocidade aparente** 📐 — um detalhe que dá
substância à tela do som. Cuidado só com a atribuição: a derivação dos dias da
semana a partir das horas planetárias é [TRADIÇÃO POSTERIOR] ⚠️, não é de Ptolomeu.

### 9.9 O que ainda não existe e a pesquisa recomenda
Um card **"Como este app decide"** — sistema de regências, sistema de casas
(inteiras), zodíaco (trópico). São três declarações, três linhas cada, e resolvem de
uma vez o buraco identificado aqui (§6.4), no doc 01 §4.6 (trópico não declarado) e
no doc 01 §4.5 (casas inteiras não explicadas).

---

## 10. O QUE ESTA PESQUISA PROCUROU E NÃO ACHOU

Registrar isto é parte do método.

1. **A primeira fonte publicada que atribui Netuno a Peixes.** O artigo que trata
   exatamente disso (Graves, *"Neptune's rulership of Pisces: first published
   sources"*, astrolearn.com) está **protegido por senha**. A atribuição secundária
   a Sepharial é **inconsistente** com a cronologia verificada de Urano e não deve
   ser usada.
2. **Os originais de Varley (1828) e Smith/Raphael (1825).** As datas vêm de Graves
   citando pesquisa de Skyscript **de memória**. É uma pista forte e nomeada — não é
   fonte primária.
3. **A frase de Lilly sobre cazimi (17').** Baixei o fac‑símile OCR de *Christian
   Astrology* (2ª ed., 1659) e **não localizei a passagem**; o OCR daquela região
   está corrompido. Combusto (8°30') e sob os raios (17°) **foram localizados** ✅.
4. **A tabela de triplicidades de Doroteu.** *Carmen Astrologicum* não foi lido (nem
   nesta pesquisa nem na do doc 01). A tabela de Ptolomeu I.18 apresentada em §2.5
   veio de leitura assistida, não de conferência linha a linha.
5. **Tabelas de termos.** Deliberadamente não reproduzidas: três sistemas
   concorrentes, 12×5 números cada, e um erro seria invisível. Extrair de Robbins
   I.20‑21 com verificação de soma = 30° por signo quando for necessário.
6. **al‑Bīrūnī, *Book of Instruction* (1029, trad. Wright 1934).** Está na
   bibliografia do projeto (doc 09) e é a fonte medieval mais sistemática sobre
   naturezas planetárias, anos (pequenos/médios/grandes) e condições solares.
   **Não consultado.** É a próxima leitura mais rentável para este documento.
7. **Chris Brennan, *Hellenistic Astrology* (2017).** Continua não consultado (é
   obra protegida; o uso seria como referência bibliográfica). É onde a discussão
   acadêmica moderna sobre seita e dignidades está mais bem organizada.
8. **Dião Cássio 37.18‑19** (origem dos dias da semana pela ordem caldeia). Não
   lido; a atribuição é corrente ⚠️.
9. **A passagem de "Gregório de Nicéia" sobre Posêidon/Peixes e Plutão/Áries**,
   citada como precedente antigo para regências modernas. **Não verificada, e
   suspeita** — precedente conveniente demais.
10. **A primeira menção de "Mercury retrograde" no *New York Times* (1996).**
    Relatada por dois veículos ⚠️; não fui ao arquivo do jornal confirmar.
11. **Quem primeiro escreveu "não assine contratos em Mercúrio retrógrado".**
    Procurei; não achei autor nem data. Sei que não é antigo ✅. Suspeita de origem
    em manuais americanos de meados do século XX, **não confirmada — não afirme**.
12. **Fírmico Materno e Paulo de Alexandria.** Continuam não lidos.

---

## 11. BIBLIOGRAFIA

Sem tradução das citações verbatim — traduzir citação é falsificá‑la (mesma regra de
`lib/grounding.js` e `lib/zodiacBody.js`).

**Fontes primárias efetivamente usadas nesta pesquisa**

- **Vétio Valente, *Anthologiae*, trad. Mark T. Riley** (PDF livre) —
  https://www.skyscript.co.uk/pdf/pubs/texts/valens/riley/docs/Vettius_Valens_Riley.pdf
  · **Livro I.1 lido integralmente** ✅ (naturezas e significações dos sete, seita,
  cor, sabor, metal, partes do corpo); Livro III.15K;13P (anos médios) ✅; Livro IV.1
  (tabela de períodos) ✅; passagens de "under the rays" nos Livros II e V ✅;
  passagem sobre estações e retrogradação, Livro V ✅.
  *Nota de acesso:* o servidor bloqueia WebFetch (403); baixado por `curl` com
  user‑agent de navegador e extraído com `pypdf`.
- **Cláudio Ptolomeu, *Tetrabiblos*, trad. F. E. Robbins (Loeb, 1940)** — consultado
  por capítulo em https://astrolibrary.org/library/tetrabiblos/
  · I.4 (potências) ✅ via doc 01 · **I.5 (benéficos e maléficos) ✅** ·
  I.6 (gênero) ⚠️ · **I.7 (seita) ✅** · **I.8 (fases e estações) ⚠️** ·
  I.17 (domicílios) ✅ via doc 01 · **I.18 (triângulos) ⚠️** · I.19 (exaltações) ✅
  via doc 01 · I.20‑23 (termos, lugares, faces) ✅ via doc 01.
- **William Lilly, *Christian Astrology*, 2ª ed. (Londres, John Macock, 1659)** —
  fac‑símile OCR completo:
  https://archive.org/stream/ChristianAstrologyByWilliamLilly/Lilly_William-Christian_astrology_djvu.txt
  · Livro I: definição de peregrino ✅, combustão (8°30') ✅, sob os raios (17°) ✅,
  elongação máxima de Mercúrio (28°) e Vênus (48°) ✅, movimento médio da Lua
  (13°10'36") e mês sideral (27 d 7 h 43 min) ✅, retrogradação de Saturno (140
  dias) ⚠️ OCR · Livro II: retrogradação e prolongamento de doença ✅.
  **Aviso sobre esta fonte:** o OCR é de tipografia do século XVII com *s* longo e
  está frequentemente corrompido. Toda citação acima foi lida diretamente no arquivo
  extraído; onde a leitura é insegura, está marcada ⚠️ OCR. **Não use este OCR para
  citar Lilly sem conferir o fac‑símile em imagem.**

**Secundárias — história da incorporação dos planetas modernos**

- **Philip Macartney Graves, "Astrologers' evaluation of Uranus and the asteroids in
  1834"**, Astrolearn, 07/10/2007 —
  https://www.astrolearn.com/astrology-articles/asteroids-1834/
  · Transcreve verbatim, do original em domínio público, a discussão em *The
  Horoscope* (1834) de Richard James Morrison ("Zadkiel I"), incluindo a pergunta
  "Why has not Herschel a house assigned to him in the Zodiac?"; e a nota de David
  Parkes ("Ebn Shemaya"), *The Star* (1839): "Herschell has the same fortitudes and
  debilities as Saturn". Traz também as datas de Varley (1828) e Smith (1825),
  atribuídas a pesquisa de Kim Farnell e Deborah Houlding no fórum Skyscript ⚠️, e a
  consolidação em Simmonite (1852) ⚠️.
  *Nota de acesso:* 403 no WebFetch; baixado por `curl` com user‑agent de navegador.
- **Philip M. Graves, "Neptune's rulership of Pisces: first published sources"**,
  Astrolearn — https://www.astrolearn.com/astrology-articles/neptune/
  **PROTEGIDO POR SENHA — não lido.** É a leitura prioritária para fechar a lacuna
  de Netuno.
- **Philip M. Graves, "Astrologers on Pluto 1897‑1931"**, Astrolearn —
  https://www.astrolearn.com/astrology-articles/astrologers-on-pluto-1897-1931/
  **PROTEGIDO POR SENHA — não lido.**
- **Patrick Watson, "3 Slightly Better Arguments for Modern Rulerships (That No One
  Makes)"** —
  https://patrickwatsonastrology.com/3-slightly-better-arguments-for-modern-rulerships-that-no-one-makes/
  ⚠️ Astrólogo tradicionalista construindo os melhores argumentos do lado contrário.
  Fonte da "sequência estendida do *thema mundi*" (§6.3) e da observação sobre a
  magnitude de Urano.
- **Deborah Houlding, resenha de Fritz Brunhübner, *Pluto*** —
  https://www.skyscript.co.uk/rev_pluto.html ⚠️ (obra alemã de 1934, tradução AFA
  1966, revista 1971).
- **Fritz Brunhübner, *Pluto*** (Nuremberg, 1934) ⚠️ não consultado.

**Secundárias — astronomia e cronologia** (todas ⚠️, usadas só para datas)

- NASA Science, *Uranus: Facts* / *Pluto: Facts* — https://science.nasa.gov/
- Royal Observatory Greenwich, *The Discovery of Uranus* —
  https://www.rmg.co.uk/stories/space-astronomy/astronomy/discovery-uranus
- American Physical Society, *September 23, 1846: Neptune's Existence
  Observationally Confirmed* — https://www.aps.org/apsnews/2020/08/neptunes-existence-confirmed
- IAU, resolução de 24/08/2006 (Praga) sobre planetas anões —
  https://iauarchive.eso.org/public/themes/pluto/
- NASA, *Venetia Burney Phair (1918‑2009)* —
  https://science.nasa.gov/people/venetia-burney-phair/

**Secundárias — cultura pop de Mercúrio retrógrado** (todas ⚠️, **não são tradição**)

- InsideHook, *No One, Not Even You, Can Avoid Mercury Retrograde Anymore* —
  https://www.insidehook.com/culture/no-one-can-avoid-mercury-retrograde-anymore
  (primeira menção no *NYT* em 1996; pico no Google Trends em julho de 2019; marcas)
- Vice, *Why the 2010s Were the Decade of Mercury in Retrograde* ⚠️ — URL original
  fora do ar (404); conteúdo conhecido apenas por resumo de busca.
- Reportagens sobre o termo "retroshade" e sua autoria disputada ⚠️.

**Medições feitas nesta pesquisa** (reproduzíveis, `astronomy-engine` já em
`node_modules/`)

| Script | O que mede | Onde aparece |
|---|---|---|
| `retro.js` | Retrogradação de 8 planetas (episódios/ano, duração, % do tempo), elongação máxima de Mercúrio e Vênus, velocidade média/máx/mín de 10 corpos, 2000–2050 | §1.1, §3, §4.1 |
| `retro2.js` | Velocidade da Lua; % de dias com ao menos um planeta retrógrado (2020–2030); datas de Mercúrio retrógrado 2026–2027 | §3.2, §4.1, §7.1 |
| `janela.js` | Validação do método de ±2 dias do app contra a estação verdadeira, 2020–2035 | §7.5 |
| (conta aritmética) | Períodos mínimos de Valens × retornos sinódicos reais | §4.2 |

Todos em
`C:\Users\XuXa\AppData\Local\Temp\claude\C--Users-XuXa\857ce44c-7e7a-4150-a119-83f9fcbc08f2\scratchpad\`.
São scripts de pesquisa, **não** código do app — se forem úteis a longo prazo, o
lugar deles é `scripts/`.

---

## 12. HISTÓRICO DESTE ARQUIVO

| Data | O que mudou |
|---|---|
| 2026‑07‑31 | Criação. Os sete planetas em profundidade (Valens I.1 lido integralmente); grade de análise em sete camadas; dignidades e condições solares; os três modernos com cronologia datada de incorporação; a decisão de sistema de regências; Mercúrio retrógrado em três camadas (astronomia medida, tradição, pânico de internet). **Fecha parcialmente a lacuna nº 1 do doc 01 §8** (quem atribuiu Urano a Aquário: Smith 1825 / Varley 1828, ainda não aceito em 1834). Quatro medições próprias reproduzíveis. |

**Quem editar este arquivo:** acrescente linha aqui. Nunca rebaixe um ⚠️ para ✅ sem
ter ido ao texto, e nunca remova uma medição sem refazê‑la — os números de §4 e §7
são o que dá a este documento autoridade que não depende de acreditar em ninguém.
