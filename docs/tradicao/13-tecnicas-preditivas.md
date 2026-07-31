# TRADIÇÃO 13 — Técnicas Preditivas: Trânsitos, Progressões, Revoluções

**O que é este arquivo.** Base de referência sobre as **sete famílias de técnica
preditiva** que existem de fato na tradição ocidental: trânsitos, direções
primárias, progressões secundárias, direções por arco solar, revolução solar,
profecções anuais, *zodiacal releasing* e firdaria persa. Para cada uma: **origem
datada, como funciona, e que pergunta ela responde** — porque a diferença entre
elas não é de "precisão", é de **tipo de pergunta**.

**Quando consultar.** Antes de escrever qualquer conteúdo do app que fale de
"previsão", "o que vem por aí", "seu ano", "ciclo", "fase da vida", "retorno de
Saturno" ou "trânsito". E obrigatoriamente antes de construir qualquer feature
preditiva nova — a seção 12 tem a análise de custo de cada uma contra o que já
existe no repositório.

**Como ler os selos de grau.** Mesmo padrão dos documentos 01 a 07:

| Selo | Significa |
|---|---|
| **FONTE PRIMÁRIA** | O texto antigo diz isso. Obra, livro e capítulo dados. |
| **TRADIÇÃO POSTERIOR** | Surgiu depois, com autor e data conhecidos. Legítimo, mas não é "o que os antigos diziam". |
| **ACADEMIA MODERNA** | Afirmação de historiador ou pesquisador contemporâneo, com a publicação citada. |
| **INVENÇÃO RECENTE** | Circula hoje sem lastro em fonte nenhuma, ou com lastro que não sustenta o que se afirma. |
| **DISPUTADO** | Fontes ou especialistas divergem. Diz-se quais e por quê. |
| **MEDIDO AQUI** | Número calculado por mim com a `astronomy-engine` do próprio repositório. Método descrito, reproduzível. |

**Regra de ouro.** Fonte inventada ou atribuída ao autor errado é pior que
ausência de fonte. Onde eu não cheguei à fonte, está escrito "não cheguei" — ver
seção 15.

---

## 1. O mapa do campo em uma página

A confusão do mercado começa aqui: trata-se "previsão astrológica" como uma coisa
só. São **duas coisas incompatíveis** empacotadas juntas.

**(A) Tempo real.** O céu de hoje, medido por efeméride. O planeta está mesmo
onde você diz. Só o **trânsito** é assim.

**(B) Tempo simbólico.** Uma convenção de conversão inventada por astrólogos —
um dia vale um ano, um signo vale um ano, um grau vale um ano. O planeta **não
está** onde a técnica diz; a técnica move um ponteiro sobre o mapa parado. Todas
as outras seis famílias são assim.

Isso não desqualifica (B). Desqualifica **misturar** (A) e (B) sem avisar, que é
o que o mercado faz. Um app que diz "Saturno está te tensionando" quando fala de
Saturno progredido está afirmando algo astronomicamente falso — e verificável em
cinco segundos numa efeméride.

| Técnica | Chave de tempo | Origem datada | Pergunta que responde |
|---|---|---|---|
| **Trânsito** | tempo real | Valente, séc. II (uso sistemático) | *O que está acontecendo agora?* |
| **Direção primária** | 1° de ascensão reta = 1 ano | Ptolomeu, *Tetrabiblos* III.10 | *Quando o evento estrutural da vida chega?* |
| **Progressão secundária** | 1 dia após o nascimento = 1 ano | Valente IX.3 (embrião); Placidus, séc. XVII (nome) | *Em que estágio de amadurecimento interno eu estou?* |
| **Arco solar** | arco do Sol progredido aplicado a tudo | Naibod 1560 (chave); Ebertin, séc. XX (uso) | *Quando o mapa inteiro é ativado de uma vez?* |
| **Revolução solar** | retorno anual do Sol ao grau natal | Abu Ma'shar, séc. IX | *Como é o tema deste meu ano?* |
| **Profecção anual** | 1 signo = 1 ano (idade mod 12) | Ptolomeu IV.10; Paulo, cap. 31 | *Qual área da vida está ligada este ano, e quem manda nela?* |
| **Zodiacal releasing** | períodos planetários desiguais | Valente, *Anthologiae* IV | *Em que capítulo da minha vida eu estou?* |
| **Firdaria** | períodos fixos, 75 anos no total | al-Andarzaghar/Abu Ma'shar, séc. VIII–IX | *Qual planeta comanda esta década da minha vida?* |

Repare no padrão: **quanto mais antiga a técnica, menos ela fala de "eventos" e
mais fala de "quem manda agora"**. A astrologia helenística e persa é
essencialmente um sistema de **senhores do tempo** (*chronocrator*, grego
χρονοκράτωρ) — a pergunta não é "o que vai acontecer" mas "qual planeta do meu
mapa está com a chave nas mãos". Isso é uma diferença de gênero, não de grau, em
relação ao horóscopo moderno.

---

## 2. Trânsitos — a única que é astronomia pura

**FONTE PRIMÁRIA.** Trânsito é o planeta real de hoje formando aspecto com uma
posição do mapa natal. É a técnica mais antiga em uso contínuo e a única que não
depende de convenção nenhuma: ou o planeta está a 90° do seu Vênus natal, ou não
está.

Valente já a usa como camada corrente de análise, e — importante — **subordinada
aos senhores do tempo**, não sozinha. A instrução dele é explícita: *"Be aware of
the transits of the stars and their changes of sign at the various
chronocratorships"* (*Anthologiae* IX.3, trad. Riley). O trânsito, na fonte, é o
**gatilho**; quem define o **assunto** é o time-lord. O mercado moderno inverteu:
usa trânsito sozinho e não usa time-lord nenhum.

**FONTE PRIMÁRIA — retrogradação.** Valente, na seção de trânsitos: *"If the
stars are passed the first stationary point and are found to be retrograde, they
delay expectations, actions, profits, and enterprises."* (Já documentado em
01 §(e); repetido aqui porque é o único juízo de trânsito que a fonte antiga dá
com essa clareza.)

**O que a tradição faz e o app ainda não faz.** Três coisas:

1. **Separar trânsito rápido de trânsito lento.** O app já faz isto — e bem: a
   tabela `TEMPO`/`ORB_FACTOR` em `lib/personalSky.js:31-51` escalona o orbe pela
   velocidade e ordena por camada antes de ordenar por exatidão. Sem isso, um
   trânsito de Plutão com orbe de 0,3° empurrava para fora um da Lua com 2° numa
   tela chamada "Céu de HOJE".
2. **Aplicação (*applying*) versus separação (*separating*).** O aspecto que está
   se formando é lido como coisa que vem; o que está se desfazendo, como coisa
   que passou. Valente formula isso em termos de posição relativa e movimento
   (IX.3, sobre Júpiter "sendo carregado em direção à posição do Ascendente").
   **O app não distingui os dois:** `personalSky.js` usa `Math.abs(sep - angle)`,
   que perde o sinal. É a diferença entre "isto está chegando" e "isto já passou"
   — e o texto que o app entrega hoje é o mesmo nos dois casos.
3. **Trânsito à casa, não só ao planeta.** A tradição lê o trânsito também pelo
   *lugar* em que ele cai. O app compara planeta com planeta e ignora as casas,
   embora `lib/signs.js:440` já as calcule.

**INVENÇÃO RECENTE — "trânsito exato = evento no dia".** Não há fonte antiga que
prometa data. A precisão que o mercado vende ("dia 14, às 15h32, Marte quadra seu
Sol e você vai brigar") é do século XX e do software de efeméride barato.

---

## 3. Direções primárias — a técnica de Ptolomeu, e por que ninguém usa

**FONTE PRIMÁRIA.** *Tetrabiblos* **III.10**, "Of Length of Life" (numeração
Robbins/Loeb 1940). É aqui que nasce a medida de tempo simbólico do Ocidente.

O método: escolhe-se um **prorrogador** (grego *aphetes*, "o que solta") — um
ponto vivo do mapa — e mede-se quantos graus de **ascensão reta** (graus do
equador celeste, não da eclíptica) separam ele do ponto destrutivo. Cada grau
vale um ano.

> "each one of the periods has the value of one solar year"
> — Ptolomeu, *Tetrabiblos* III.10, trad. Robbins (Loeb, 1940)

E o motivo de usar o equador e não a eclíptica, dado pelo próprio Ptolomeu:

> "equinoctial periods pass evenly through both the horizon and the mid-heaven"
> — idem

Isto é engenharia astronômica de verdade: o grau do equador passa pelo horizonte
em tempo uniforme; o grau da eclíptica, não. A direção primária é literalmente **a
rotação da Terra convertida em anos de vida** — quatro minutos de rotação valem um
ano.

**Por que caiu em desuso.** Três razões, todas honestas:

- **É cara.** Exige ascensão reta, declinação, ascensão oblíqua para a latitude do
  nascimento, e uma escolha de sistema de casas que muda o resultado
  (Regiomontanus e Placidus dão direções diferentes para o mesmo mapa).
- **Exige hora de nascimento ao minuto.** O Ascendente anda ~1° a cada 4 minutos;
  errar 15 minutos de hora joga a direção quase 4 anos fora.
- **A pergunta original era mórbida.** O capítulo se chama "Da Duração da Vida".
  A técnica nasceu para calcular **quando a pessoa morre**. A astrologia moderna
  não quer fazer isso — e a técnica não foi reconvertida com o mesmo cuidado.

**TRADIÇÃO POSTERIOR.** As "chaves" alternativas de direção (Naibod 1560,
Placidus séc. XVII) são tentativas de simplificar a conta de Ptolomeu. Cada chave
dá uma data diferente para o mesmo evento — o que já diz muito sobre a
falseabilidade da técnica.

**Veredito para o app:** inviável e desnecessário. Registrado aqui para que, ao
ler "direção" numa fonte, se saiba que é isto — e não progressão.

---

## 4. Progressões secundárias — a mais popular, e a mais mal explicada

### 4.1 O que é

Chave: **um dia depois do nascimento simboliza um ano de vida**. Para saber o mapa
progredido de alguém de 30 anos, calcula-se o céu do 30º dia após o nascimento.

### 4.2 A origem verdadeira, com o texto na mão

O mercado atribui a Placidus (séc. XVII). **Está incompleto.** A instrução existe
em Valente, no século II — e eu li a passagem:

> "It is necessary to calculate as follows: add a number of days to the birth date
> equivalent to the age (in years) of the native. Then, having first determined the
> date, whether in the following month or in the birth month itself, cast a
> horoscope for that day."
> — Vétio Valente, *Anthologiae* **IX.3** (Pingree; = 2K no Kroll), trad. Mark T.
> Riley, p. 153

**FONTE PRIMÁRIA.** É exatamente a progressão secundária: some a idade em dias à
data de nascimento e levante o mapa daquele dia.

E aqui vem a parte que **nenhum site em português menciona** e que é a coisa mais
valiosa desta seção. Valente, imediatamente depois de ensinar o método, **critica
o próprio método**:

> "As for the previously explained method for the stars: we will not find much
> change in position for Saturn, Jupiter, and Mars. **These stars have an
> imperceptible motion and stay in the same place.** In the latter method we will
> find that they come to be in square, trine, and in opposition."
> — Valente, *Anthologiae* IX.3, trad. Riley

Ou seja: o inventor documentado da técnica observou que, na progressão, **os
planetas lentos praticamente não saem do lugar**, e por isso preferiu usar a data
progredida apenas como marcador e ler os **trânsitos reais** daquele ano. A
objeção mais forte contra a progressão secundária é de 1.850 anos atrás, e é do
próprio autor.

**MEDIDO AQUI.** Valente estava certo, e dá para pôr número. Calculei com a
`astronomy-engine` do repositório o deslocamento de cada planeta em **90 "dias"**
— isto é, uma vida inteira de 90 anos de progressão — para três nascimentos
distintos (1970-01-01, 1985-06-20, 1995-11-03):

| Planeta progredido | Deslocamento em 90 anos de vida |
|---|---|
| Lua | ~108,8° |
| Vênus | ~108,5° |
| Sol | ~89,5° |
| Mercúrio | ~76,7° |
| Marte | ~64,2° |
| Júpiter | ~10,0° |
| **Saturno** | **~3,8°** |
| Urano | ~2,6° |
| Plutão | ~2,0° |
| Netuno | ~1,7° |

*Método: `Astronomy.SunPosition`/`EclipticGeoMoon`/`Ecliptic(GeoVector(...))`,
mesma pilha de `lib/signs.js:487-497`; média dos três nascimentos.*

**Consequência prática:** em progressão secundária, Netuno anda **1,7° na vida
inteira**. Falar em "Netuno progredido entrando em quadratura" é falar de um
planeta que não se moveu. A progressão secundária é, na prática, **uma técnica de
Lua, Sol, Mercúrio, Vênus e Marte** — e qualquer conteúdo honesto tem que dizer
isso.

**MEDIDO AQUI — a Lua progredida.** Partindo de 1970-01-01, a Lua progredida
volta ao grau natal em **~28 "dias" = 28 anos de vida**. É daí que sai o "ciclo
lunar progredido de 27 a 30 anos" que a literatura moderna usa, e o número
confere. (Note que ele é **quase igual** ao retorno de Saturno — duas técnicas
distintas apontando para a mesma faixa etária, o que ajuda a explicar por que
essa idade virou meme cultural. Ver seção 11.)

### 4.3 A linha do tempo da técnica

- **séc. II** — Valente IX.3: a regra dia-por-ano, com a ressalva do autor.
  **FONTE PRIMÁRIA**.
- **Antecedente não-astrológico** — a fórmula "um dia por um ano" aparece em
  Ezequiel 4:6 e Números 14:34. **DISPUTADO** se influenciou os astrólogos ou se é
  coincidência de uma equivalência óbvia; não achei estudo que resolva.
- **séc. XVII** — Placidus de Titis formaliza e nomeia: são "direções
  **secundárias**", secundárias em relação às **primárias** de Ptolomeu. É daí que
  vem o nome, e o nome é uma hierarquia: a técnica se apresentava como a de
  segunda linha. **TRADIÇÃO POSTERIOR**.
- **séc. XVII–XVIII** — Kepler e John Partridge referenciados como usuários
  iniciais. **ACADEMIA MODERNA**, via James H. Holden, *A History of Horoscopic
  Astrology* (AFA, 1996), conforme relatado por Chris Brennan (The Astrology
  Podcast ep. 144). Não li Holden diretamente.
- **início do séc. XX** — Alan Leo torna a progressão o padrão do mercado, por um
  motivo declaradamente prático: é mais simples de explicar e de calcular que a
  direção primária. **TRADIÇÃO POSTERIOR**.

**A leitura crítica:** a técnica mais popular da astrologia moderna venceu por
**facilidade de cálculo**, não por superioridade demonstrada. Isso é um fato
histórico, não uma opinião — Alan Leo o diz.

---

## 5. Direções por arco solar — a simplificação da simplificação

**TRADIÇÃO POSTERIOR.** Toma-se o arco que o **Sol progredido** percorreu e
aplica-se esse mesmo arco a **todos** os pontos do mapa. Se o Sol progredido andou
30°, tudo anda 30°.

**Chave de Naibod.** Valentin Naibod (Naboth), astrônomo do séc. XVI, propôs usar
o **movimento médio diário do Sol** — 59'08" = **0,98556°** — como valor fixo de
um ano, em vez do arco real. Motivo: o arco real varia com a época do ano em que
a pessoa nasceu, porque a órbita da Terra é elíptica.

**MEDIDO AQUI.** O problema que Naibod resolve é real e mensurável. Calculei o
arco solar por ano de vida para doze nascimentos, um por mês (dia 15 de cada mês
de 1985), ao longo de 30 anos de progressão:

| Mês de nascimento | Arco por ano | Arco acumulado aos 30 anos |
|---|---|---|
| Junho | **0,9538°** (mínimo) | 28,61° |
| Março | 0,9877° | 29,63° |
| Setembro | 0,9830° | 29,49° |
| Dezembro | **1,0188°** (máximo) | 30,57° |

Amplitude: **0,9538° a 1,0188° por ano**. Diferença acumulada entre um nascido em
junho e um nascido em dezembro, aos 40 anos: **2,60°** — mais de dois anos e meio
de defasagem na mesma técnica, só por causa do mês de nascimento. A chave de
Naibod (0,98556°) é a média que apaga essa variação.

**O que isso significa honestamente:** existem hoje pelo menos três "arcos
solares" em circulação (arco real, chave de Naibod, "um grau por ano" arredondado),
que dão datas diferentes para o mesmo evento. Quando três variantes de uma técnica
discordam entre si por anos, a técnica não está medindo nada com a precisão que
anuncia.

**Uso moderno.** Reinhold Ebertin (cosmobiologia, *The Combination of Stellar
Influences*) e depois Noel Tyl popularizam o arco solar no século XX como
alternativa "mais limpa" que a progressão. **TRADIÇÃO POSTERIOR** — não há
antecedente antigo para aplicar o arco do Sol ao mapa inteiro.

---

## 6. Revolução solar (retorno solar) — o mapa do aniversário

### 6.1 O que é e de onde vem

Levanta-se o mapa do instante exato em que o Sol volta ao **grau, minuto e segundo**
que ocupava no nascimento. Esse mapa é lido como o tema do ano que começa.

**Origem: persa, século IX.** A sistematização é de **Abu Ma'shar al-Balkhi**
(787–886), no *Kitāb taḥāwīl sinī al-mawālīd* — "Sobre as Revoluções dos Anos das
Natividades", traduzido ao latim como *De revolutionibus nativitatum*. É o
primeiro tratamento completo do assunto. **FONTE PRIMÁRIA** (a obra existe; li em
tradução indireta e em resenha, não no original — ver seção 15).

Há precursores helenísticos de "retorno", mas o **aparato** da revolução solar —
as camadas de senhores do ano, o *ǧārbaḫtār* (distribuidor), a combinação com
profecção e firdaria — é síntese persa de material grego, persa e indiano.
**ACADEMIA MODERNA**, via Benjamin Dykes (tradutor de Abu Ma'shar, *Persian
Nativities III*, Cazimi Press, 2010/2019).

### 6.2 As duas disputas reais

**DISPUTADO — local do mapa.** Levanta-se a revolução para o **local de
nascimento** ou para **onde a pessoa está** naquele dia?

- Abu Ma'shar e os medievais: **local de nascimento**. Não há evidência de que
  algum astrólogo antigo ou medieval relocasse a revolução.
- Jean-Baptiste Morin (Morinus, séc. XVII): **local atual**, com o argumento de
  que os planetas só agem sobre o horizonte onde a pessoa efetivamente está.
- Nunca foi resolvido. E a diferença não é cosmética: mudar de continente muda o
  Ascendente da revolução, logo muda **todas as casas** do mapa do ano.

*(Fonte da comparação: Benjamin Dykes em The Astrology Podcast ep. 218; Anthony
Louis, "Tropical vs Sidereal Years in Calculating Solar Returns", 2020.)*

**DISPUTADO — precessão.** Alguns astrólogos do séc. XX propõem "revolução
precessionada" (corrigir o grau natal pela precessão dos equinócios). **Não há
evidência de que a tradição fizesse isso.** É acréscimo moderno, e desloca o
instante do retorno em vários dias.

### 6.3 O número que ninguém conta

**MEDIDO AQUI.** O retorno solar **não cai no aniversário**. Nascimento em
1990-03-14 09:30 UTC; instante do retorno do Sol ao grau natal:

| Idade | Instante do retorno (UTC) |
|---|---|
| 1 | 1991-03-14 15:17 |
| 2 | 1992-03-13 20:56 |
| 3 | 1993-03-14 02:53 |
| 4 | 1994-03-14 08:41 |
| 5 | 1995-03-14 14:23 |

Deslocamento ano a ano, além dos 365 dias: **5,66h, 5,95h, 5,79h, 5,70h, 5,91h,
5,81h, 5,98h** — quase seis horas por ano, zerando a cada bissexto. Em 1992 o
"aniversário astrológico" caiu **no dia 13**, um dia antes do aniversário do
calendário.

**Por que isso importa para um app:** seis horas de deslocamento equivalem a cerca
de **90° de Ascendente — três casas inteiras**. Um app que levantasse a revolução
solar "às 00:00 do dia do aniversário" estaria errando o mapa do ano em três
casas. Ou se faz certo (achar o instante do retorno por bisseção, ~60 iterações,
barato) ou não se faz.

---

## 7. Profecções anuais — a técnica que o app deveria ter

Esta é a seção com consequência prática. Leia inteira antes de decidir.

### 7.1 O que é

Conte **um signo por ano de vida** a partir do signo do Ascendente. Ao completar 1
ano você está no 2º signo; aos 11, no 12º; aos 12, de volta ao 1º. O signo onde a
contagem para é a **casa profeccionada** do ano, e o **regente** desse signo é o
**Senhor do Ano** (*dominus anni*, "lord of the year").

A conta inteira é: `casa = (idade % 12) + 1`.

### 7.2 A fonte, verbatim

**FONTE PRIMÁRIA.** Ptolomeu, *Tetrabiblos* **IV.10**, "Of the Division of Times"
(numeração Robbins/Loeb 1940):

> "setting out from each of the prorogatory places, in the order of the signs, the
> number of years from birth, **one year to each sign** […] taking the ruler of the
> last sign."

E — isto quase ninguém cita — Ptolomeu dá no mesmo capítulo as **camadas mensal e
diária**:

> "We shall do the same thing for the months, setting out, again, the number of
> months from the month of birth, starting from the places that govern the year,
> **twenty-eight days to a sign**; and similarly for the days, we shall set out the
> number of the days from the day of birth, starting with the places which govern
> the months, **two and a third days to a sign**."

**Verificação de coerência interna** (minha, não dele): 28 × 12 = 336 dias ≈ um
ano; 2⅓ × 12 = 28 dias ≈ um mês. O esquema fecha. É um sistema fractal de três
níveis: ano → mês → dia.

**FONTE PRIMÁRIA — e não é só do Ascendente.** A frase de Ptolomeu diz "from
**each** of the prorogatory places". No mesmo capítulo ele especifica quais são e
o que cada um governa:

> "We shall apply the prorogation from the horoscope to events relating to the body
> and to journeys […]; that from the Lot of Fortune to matters of property; that
> from the moon to affections of the soul and to marriage; that from the sun to
> dignities and glory; that from the mid-heaven to the other details of the conduct
> of life."

**Isto é ouro para o app**, e explico por quê na seção 12: significa que **existe
profecção a partir do Sol, com fonte primária explícita** — e o signo solar é o
único dado astrológico que o app tem de **todo** usuário, inclusive de quem nunca
informou hora nem cidade de nascimento.

### 7.3 As outras fontes

- **Paulo de Alexandria** (378 d.C.), *Eisagogiká* **cap. 31** — segundo a
  literatura secundária, a exposição mais clara e didática do método básico.
  **ACADEMIA MODERNA** (não li Paulo diretamente; ver seção 15).
- **Doroteu de Sídon** (séc. I), *Carmen Astrologicum* **IV.1** — tratamento do
  Senhor do Ano. **ACADEMIA MODERNA**, mesma ressalva.
- **Vétio Valente** (séc. II) — usa a técnica ao longo do Livro IV inteiro, sob a
  linguagem de "transmissões" e "distribuições". A tradução Riley **não usa a
  palavra "profecção"** em lugar nenhum: `grep -i profect` no PDF integral da
  tradução de Riley retorna **zero ocorrências**. **MEDIDO AQUI** (busca textual no
  PDF do Skyscript). Isso não significa que Valente não use a técnica — significa
  que quem procurar "profection" nas fontes gregas não vai achar.
- **A palavra é latina e é posterior.** *Profectio* = partida, saída, avanço.
  Chris Brennan é explícito: **"No name for it in the Hellenistic tradition"**
  (slides de aula, The Astrology Podcast, 2018). **ACADEMIA MODERNA**.
- **Alcance.** Brennan classifica a profecção anual como *"a técnica de time-lord
  mais difundida da tradição helenística"*, usada ou mencionada por praticamente
  todo autor cujo texto sobreviveu (*Hellenistic Astrology: The Study of Fate and
  Fortune*, Amor Fati, 2017). **ACADEMIA MODERNA**.

### 7.4 Quando o ano profeccional vira

**FONTE + MEDIDO AQUI.** O ano profeccional vira no **retorno solar**, não à
meia-noite do aniversário e muito menos em 1º de janeiro. E, pela seção 6.3, o
retorno solar às vezes cai um dia antes do aniversário do calendário. Medi para o
nascimento 1990-03-14 09:30 UTC:

| Ano de vida | Começa em |
|---|---|
| 29 | 2019-03-14 10:10 UTC |
| **30** | **2020-03-13 16:04 UTC** ← um dia antes do aniversário |
| 31 | 2021-03-13 21:54 UTC |

**Aviso de engenharia:** calcular idade por diferença de datas do calendário
("já fez aniversário este ano?") erra o senhor do ano em até **um dia por ano**,
e erra sempre nas vésperas — que é justamente quando o usuário mais olharia.

### 7.5 O custo real

**MEDIDO AQUI.** Um milhão de profecções completas (idade → casa → signo →
regente) em **22,7 ms** em Node no notebook do dono. Zero chamadas de efeméride,
zero rede, zero dependência. Para comparação: uma única chamada de
`planetPositions()` já é mais cara que todas essas.

Exemplo com Ascendente em Virgem:

| Idade | Casa | Signo | Senhor do Ano |
|---|---|---|---|
| 0 | 1 | Virgem | Mercúrio |
| 1 | 2 | Libra | Vênus |
| 12 | 1 | Virgem | Mercúrio |
| 24 | 1 | Virgem | Mercúrio |
| 29 | 6 | Aquário | Saturno |
| 30 | 7 | Peixes | Júpiter |
| 41 | 6 | Aquário | Saturno |

A tabela de regências (domicílios) que isso exige é a de **Ptolomeu I.17**, já
documentada em `docs/tradicao/01-astrologia-fundamentos.md` §2.6. São 12 linhas.

---

## 8. Zodiacal releasing — a técnica que só existe em um livro

**FONTE PRIMÁRIA.** Vétio Valente, *Anthologiae* **Livro IV**, especialmente o
capítulo intitulado por Riley "The Distribution of the Chronocratorships Starting
with the Lot of Fortune and with Daimon". Valente a apresenta assim: *"I will now
append this truly powerful method"*.

**É a única fonte que existe.** Não há segundo testemunho antigo. Se o Livro IV de
Valente não tivesse sobrevivido, a técnica não existiria.

### 8.1 Como funciona

Solta-se (*aphesis*, ἄφεσις, "soltura") um ponto do mapa — normalmente o **Lote do
Espírito** (*Daimon*) ou o **Lote da Fortuna** — e ele avança pelos signos, mas
cada signo dura **o número de anos do período do seu regente**, não um ano. Os
períodos são os "períodos mínimos" que Valente tabula em IV.1 (li a tabela no
PDF de Riley):

| Astro | Período | Signos que ele rege |
|---|---|---|
| Saturno | 30 | Aquário; Capricórnio recebe **27** — ver ressalva abaixo |
| Mercúrio | 20 | Gêmeos, Virgem |
| Sol | 19 | Leão |
| Marte | 15 | Áries, Escorpião |
| Júpiter | 12 | Sagitário, Peixes |
| Vênus | 8 | Touro, Libra |
| Lua | 25 | Câncer |

**Ressalva sobre a tabela.** Os períodos por astro (30, 20, 19, 15, 12, 8, 25) eu
li em Valente IV.1, no PDF de Riley. A **atribuição por signo** — incluindo a
exceção de Capricórnio receber 27 em vez de 30 — vem da reconstrução moderna
(tabela apresentada por Brennan, The Astrology Podcast ep. 192). **Não localizei a
tabela signo-a-signo na tradução de Riley.** Se for usada em conteúdo público,
confirmar na fonte.

Cada período de nível 1 (anos) se subdivide em doze de nível 2 (meses), estes em
nível 3, e assim por diante — cada subnível é exatamente 1/12 do nível acima.
Valente usa ano de **360 dias** e mês de **30 dias**; a convenção é estranha e é
para ser aceita como é.

**Escolha do lote:** Fortuna → corpo, saúde, o que acontece com a pessoa
independente da vontade dela. Espírito/Daimon → ação, carreira, direção de vida,
o que ela faz. Valente é explícito sobre a divisão de competência entre os dois
(IV.4).

**"Picos" (*peak periods*)** — quando o período liberado a partir do Espírito
chega aos signos angulares **contados a partir do Lote da Fortuna** (1º, 4º, 7º,
10º a partir de Fortuna). São marcados como momentos de alta atividade e virada,
não necessariamente boa.

**"Soltura do vínculo"** (λύσις τῶν δεσμῶν, *lusis tou desmou*) — quando os
subperíodos completam a volta pelos doze signos e voltariam ao ponto de partida,
em vez de repetir a sequência, o ciclo **salta para o signo oposto** e recomeça
dali. É a quebra deliberada da ordem, lida como reorientação dentro do capítulo
maior. *(Regra confirmada em fontes secundárias — Anthony Louis 2016, Kerykeion;
**não localizei a passagem exata em Riley**, ver seção 15.)*

### 8.2 O nome é moderno

**TRADIÇÃO POSTERIOR / INVENÇÃO RECENTE (do nome).** "Zodiacal Releasing" foi
cunhado por **Robert Schmidt**, do Project Hindsight, ao traduzir o Livro IV de
Valente por volta de **1996**. Valente não dá nome à técnica. Qualquer texto que
diga "os antigos chamavam de Zodiacal Releasing" está errado.

### 8.3 As ressalvas que os praticantes admitem

Registrando com honestidade, porque quem admite são os próprios defensores
(Brennan, The Astrology Podcast ep. 192):

1. Valente dá **pouquíssimos exemplos** — a reconstrução moderna levou cerca de
   uma década de prática para se firmar.
2. A regra de mover o Lote do Espírito um signo adiante quando ele coincide com o
   da Fortuna é reconhecida como **arbitrária**, aceita por funcionar.
3. Soltar a partir de outros lotes (Eros etc.) é **inovação de Brennan (2005)**,
   não de Valente.
4. Soltar a partir da Fortuna é descrito pelo próprio Brennan como "mais
   inconsistente" que a partir do Espírito.

**Veredito para o app:** fora de escopo. Exige os Lotes (que exigem Ascendente
exato), um motor de subdivisão em quatro níveis e uma interface temporal que o app
não tem. Documentado para que ninguém prometa "releasing" sem saber o tamanho da
obra.

---

## 9. Firdaria — a década que tem dono

**FONTE PRIMÁRIA / ACADEMIA MODERNA.** Sistema persa de senhores do tempo: a vida
é dividida em períodos fixos, cada um regido por um planeta, na mesma ordem para
todo mundo, mudando só o **ponto de partida** conforme o nascimento seja diurno ou
noturno.

Períodos (Abu Ma'shar, *Sobre as Revoluções dos Anos das Natividades* IV.1:1-8,
trad. Dykes, Cazimi Press 2019 — lido na citação integral de Birchfield):

| Astro | Anos |
|---|---|
| Sol | 10 |
| Vênus | 8 |
| Mercúrio | 13 |
| Lua | 9 |
| Saturno | 11 |
| Júpiter | 12 |
| Marte | 7 |
| Cabeça do Dragão (nodo norte) | 3 |
| Cauda do Dragão (nodo sul) | 2 |
| **Total** | **75** |

> "the fardār of the Sun is 10 years, the fardār of Venus 8 years, the fardār of
> Mercury 13 years […] the amount of all of that is 75 years, then it returns to
> the Sun."
> — Abu Ma'shar IV.1:2, trad. Dykes

**Ordem diurna:** Sol → Vênus → Mercúrio → Lua → Saturno → Júpiter → Marte →
Cabeça → Cauda.
**Ordem noturna:** Lua → Saturno → Júpiter → Marte → Sol → Vênus → Mercúrio →
Cabeça → Cauda.

**Subperíodos:** cada período se divide em **sete partes iguais**; a primeira
pertence ao próprio regente, e as seguintes aos demais planetas em ordem caldaica
descendente. Os nodos **não participam** de subperíodo nenhum e não têm
subperíodo próprio — Abu Ma'shar explica que é porque eles "não têm casas"
(domicílios).

### 9.1 A disputa dos nodos, contada direito

**DISPUTADO — e resolvido pela filologia, não pela prática.** Existem duas ordens
noturnas em circulação:

- **Abu Ma'shar e al-Andarzaghar:** os nodos vão **no fim**, tanto de dia quanto
  de noite. "Now, the Head and Tail distribute for diurnal nativities after the
  years of Mars, and for nocturnal nativities after the years of Mercury: and it is
  when the native enters year 71."
- **Guido Bonatti** (séc. XIII), *Liber Astronomiae*: texto ambíguo, que muitos
  leram como "a série noturna segue a diurna em tudo", colocando os nodos **depois
  de Marte, aos 42 anos**.

**A explicação histórica é limpa e é a lição do documento inteiro:** Bonatti
estava parafraseando al-Qabīṣī (Alcabitius), que por sua vez resumira Abu Ma'shar
**sem a passagem esclarecedora**. O tratado completo de Abu Ma'shar sobre
revoluções só foi traduzido ao latim **no século XV, depois da morte de Bonatti**.
Bonatti não errou por incompetência — errou por não ter o texto.

*(Fonte: Steven Birchfield, "The Fardārāt in Nativities", rev. 2020 — artigo com
as citações primárias transcritas, que é como pude verificar Abu Ma'shar e
al-Qabīṣī sem ter as traduções em mãos.)*

**al-Bīrūnī** (*Book of Instruction*, 1029, trad. Wright 1934) descreve os
firdaria e já está na tabela de domínio público da bibliografia (doc 09) — mas o
tratamento completo com a ordem noturna resolvida é o de Abu Ma'shar.

**Nota de tradução:** *fardār* (persa/árabe), plural *fardārāt*; "firdaria" é a
forma latinizada medieval. Ambas circulam.

### 9.2 O parentesco com o Jyotish

**DISPUTADO / em aberto na academia.** Os firdaria têm semelhança estrutural forte
com os *daśā*/*bhukti* védicos: períodos planetários fixos, subdivididos, com
senhor maior e senhor menor. Laura Michetti levanta a pergunta explicitamente e a
deixa em aberto — a pesquisa sobre transmissão astrológica entre Oriente Médio e
Índia mal começou. Ver doc 07 para o Jyotish.

---

## 10. A tabela de conversão que resolve 90% da confusão

Guarde esta. É o antídoto contra o erro mais comum do mercado.

| Se você lê… | O planeta está… | Chave |
|---|---|---|
| "Saturno em trânsito" | **realmente lá**, hoje | tempo real |
| "Saturno progredido" | onde estava no dia N após o nascimento | 1 dia = 1 ano |
| "Saturno dirigido por arco solar" | posição natal + arco do Sol | ~1° = 1 ano |
| "Saturno dirigido (primária)" | posição natal, medida em ascensão reta | 1° equatorial = 1 ano |
| "Saturno senhor do ano" | **na posição natal**, ativado por profecção | 1 signo = 1 ano |
| "Saturno na revolução solar" | onde estava no instante do retorno do Sol | tempo real daquele instante |

Só a primeira e a última linhas descrevem um planeta que está mesmo lá. As
outras quatro descrevem um **ponteiro simbólico**. Um app que não sinaliza a
diferença está fazendo afirmação astronômica falsa.

---

## 11. O retorno de Saturno: a tradição versus o meme

### 11.1 O que a astronomia diz

**MEDIDO AQUI.** Calculei o primeiro retorno de Saturno (trânsito voltando à
longitude eclíptica natal) para **244 nascimentos** — quatro por ano, de 1950 a
2010 —, refinando cada cruzamento por bisseção de 40 iterações com a
`astronomy-engine` do repositório:

| Métrica | Valor |
|---|---|
| Idade mínima | **28 anos e 5 meses** (28,404) |
| Idade máxima | **29 anos e 10 meses** (29,859) |
| Média | 29,241 |
| Mediana | 29,144 |
| **Amplitude** | **17,5 meses** |

Segundo retorno (n=26): **58,23 a 58,96 anos**, média 58,65.
Retorno de Júpiter, para comparação (n=244): **11,28 a 11,96 anos**, média 11,67.

**A conclusão que o mercado não dá:** "o retorno de Saturno acontece aos 29" é
**errado como afirmação de calendário**. A janela real tem quase um ano e meio de
largura, e para muita gente o retorno acontece **aos 28**. Um app que anuncie "seu
retorno de Saturno é aos 29" vai errar uma fração enorme dos usuários — e o erro é
verificável em qualquer efeméride. Se for para dizer a data, calcule-a.

*(Nota: a longitude oscila com as retrogradações, então Saturno cruza o grau natal
até três vezes. O número acima é a **primeira** passagem exata.)*

### 11.2 O que a tradição realmente diz sobre Saturno e o número 30

Aqui há mais fonte do que o ceticismo apressado supõe. Três achados:

**(a) FONTE PRIMÁRIA — o período de 30 anos é antigo e é significativo.** O
"período mínimo" de Saturno é 30 anos em Valente (*Anthologiae* IV.1, tabela lida
no PDF de Riley) e é a base de todo o cálculo de tempo dele. E em IX.5, "Critical
Times", Valente escreve algo notavelmente próximo do que hoje se chama retorno:

> "the period of Saturn is 30 years […] **There will be a Saturnian critical point
> every 4 years, then every 30, its own period.**"
> — Valente, *Anthologiae* IX.5, trad. Riley

Ou seja: **a ideia de que o 30º ano é um ponto crítico saturnino tem fonte
primária**. Isso é mais do que o mercado costuma alegar e do que os céticos
costumam conceder.

**(b) FONTE PRIMÁRIA — mas Ptolomeu põe Saturno na velhice, não aos 29.** Nas
"idades do homem" de *Tetrabiblos* IV.10, cada planeta governa uma fase da vida:

| Astro | Duração dada por Ptolomeu | Faixa acumulada |
|---|---|---|
| Lua | "up to about the fourth year" | 0–4 |
| Mercúrio | "the following period of ten years" | 4–14 |
| Vênus | "the next eight years" | 14–22 |
| Sol | "the period of nineteen years" | 22–41 |
| Marte | "the space of fifteen years" | 41–56 |
| Júpiter | "the space of his own period, twelve years" | 56–68 |
| **Saturno** | *"Finally to Saturn falls as his lot old age, the latest period, which lasts for the rest of life."* | **68+** |

Na fonte primária mais influente do Ocidente, **os 29 anos são território do Sol**
(22–41: "mastery and direction of its actions"), e Saturno só entra aos 68. O
"retorno de Saturno como rito de passagem dos vinte e poucos" **não é isto**.

Vale notar de passagem: Ptolomeu atribui a Marte a faixa **41–56**, "which
introduces severity and misery into life". A "crise dos 40" tem mais lastro
ptolomaico que a "crise dos 29".

**(c) ACADEMIA MODERNA — a formulação atual não tem precedente histórico.** Laura
Michetti, em artigo revisado para *Archai: The Journal of Archetypal Cosmology*
(edição "Historical Roots and Current Flowerings", pp. 7–15):

> "Contemporary astrology makes much use of the concept of the Saturn return, but
> **the historical origins of the idea are largely unknown and certainly not to be
> found in the Western tradition.**"

E o fecho do artigo:

> "Contemporary Eastern and Western interpretations of the Saturn cycle seem not to
> have direct historical precedents, but are instead **modern inventions**."

Michetti nota ainda o paralelo com o *Sade Sati* védico (os ~7 anos de Saturno
transitando o signo lunar) e pergunta como as duas ideias se informaram — questão
que ela deixa aberta.

### 11.3 De onde veio o meme, então

**TRADIÇÃO POSTERIOR, com data.**

- **1940** — **Grant Lewi**, *Astrology for the Millions*. É a primeira exposição
  em livro popular do retorno de Saturno como fase de desenvolvimento entre 28 e
  30 anos. Lewi descreve Saturno "returning to its own place" e o trata como
  período produtivo de balanço, não como maldição. **DISPUTADO quanto à primazia
  absoluta**: a atribuição vem de fontes secundárias (Astrology University,
  Aquarius Papers); **não li o livro de 1940 diretamente** — ver seção 15.
- **1976** — **Liz Greene**, *Saturn: A New Look at an Old Devil*. Aplica leitura
  junguiana e transforma Saturno de malfeitor em agente de individuação. É este
  livro que dá ao retorno de Saturno o vocabulário psicológico que ele tem hoje.
- **1978** — **Stephen Arroyo**, *Astrology, Karma & Transformation*, consolida a
  leitura transformacional dos trânsitos lentos.
- **2000** — **No Doubt**, álbum *Return of Saturn*, escrito por Gwen Stefani em
  torno do próprio retorno. É o momento em que o termo sai da astrologia e entra na
  cultura pop de massa.

**A síntese honesta, em uma frase:** *o ciclo de 30 anos de Saturno é antigo e tem
fonte; a leitura do retorno como crise psicológica de amadurecimento aos 29 é do
século XX, e o nome popular tem data — 1940 no livro, 1976 no divã, 2000 no rádio.*

Isso é **melhor** para o app do que qualquer um dos dois extremos. Não é "os
antigos já sabiam" (falso) nem "é invenção de internet" (também falso). É uma
camada moderna sobre um osso antigo — e contar isso direito é exatamente o
diferencial que os documentos 01 a 08 estabeleceram.

---

## 12. O QUE A INTERNET REPETE E A FONTE NÃO SUSTENTA

**12.1 — "Progressões secundárias foram inventadas por Placidus no século XVII."**
Meia verdade. Placidus deu o **nome** ("direções secundárias", secundárias às
primárias de Ptolomeu) e formalizou. A **regra** dia-por-ano está em Valente
IX.3, século II — com a ressalva do próprio Valente de que os planetas lentos não
saem do lugar. Ver §4.2.

**12.2 — "Netuno progredido está entrando em quadratura com o seu Sol."**
Astronomicamente vazio. **MEDIDO AQUI:** Netuno progredido anda **1,7° em 90 anos
de vida**; Saturno, 3,8°. A progressão secundária é técnica de Lua, Sol, Mercúrio,
Vênus e Marte. Qualquer coisa dita sobre planeta lento progredido é ruído. Ver §4.2.

**12.3 — "Seu retorno de Saturno é aos 29 anos."**
**MEDIDO AQUI:** a janela real é **28a5m a 29a10m** — 17,5 meses de amplitude
sobre 244 nascimentos. Dizer "aos 29" é errar uma parcela grande dos usuários.
Ver §11.1.

**12.4 — "O retorno de Saturno é um conceito da astrologia antiga."**
Não. O **período de 30 anos** é antigo (Valente IV.1 e IX.5). A **leitura como
crise de amadurecimento aos 29** é do século XX. E Ptolomeu, na fonte primária
mais copiada do Ocidente, atribui a Saturno a **velhice a partir dos 68**
(*Tetrabiblos* IV.10). Ver §11.2.

**12.5 — "Os gregos chamavam de Zodiacal Releasing."**
Não chamavam de nada. O nome é de **Robert Schmidt**, Project Hindsight, ~1996.
Ver §8.2.

**12.6 — "Profecção é uma palavra grega."**
Não. É latina — *profectio*, "partida, avanço". A tradição helenística **não tinha
nome** para a técnica (Brennan, 2018). **MEDIDO AQUI:** `grep -i profect` na
tradução integral de Riley de Valente retorna **zero** ocorrências. Ver §7.3.

**12.7 — "Profecção conta a partir do Ascendente" (como se fosse a única forma).**
Incompleto, e a omissão custa caro. Ptolomeu IV.10 manda profeccionar a partir de
**cinco** lugares — Ascendente, Lote da Fortuna, Lua, Sol e Meio-do-Céu —, cada um
governando um assunto diferente. A profecção **a partir do Sol** ("dignities and
glory") tem fonte primária e **não exige hora de nascimento**. Ver §7.2 e §13.

**12.8 — "A revolução solar é o mapa do seu aniversário."**
Só por coincidência. **MEDIDO AQUI:** o instante do retorno desliza ~5,8h por ano
e cai no dia **anterior** ao aniversário em anos pré-bissextos. Seis horas de
deslocamento ≈ 90° de Ascendente ≈ **três casas inteiras**. Ver §6.3.

**12.9 — "Revolução solar precessionada é a forma correta."**
Não há evidência de que a tradição corrigisse por precessão. É proposta do século
XX. **DISPUTADO**, e quem afirma que é "o jeito tradicional" está errado. Ver §6.2.

**12.10 — "Direção por arco solar é um grau por ano."**
Arredondamento. **MEDIDO AQUI:** o arco real varia de **0,9538°/ano** (nascidos em
junho) a **1,0188°/ano** (nascidos em dezembro) — **2,60° de diferença acumulada
aos 40 anos** entre os dois extremos. A chave de Naibod (0,98556°) existe
justamente para apagar essa variação. Ver §5.

**12.11 — "Os firdaria noturnos põem os nodos depois de Marte, aos 42."**
Leitura de Bonatti, que parafraseava al-Qabīṣī, que resumira Abu Ma'shar **sem** a
passagem esclarecedora. O texto completo de Abu Ma'shar diz o contrário: os nodos
vão **no fim**, aos 71, em ambas as séries. Bonatti não tinha acesso à tradução —
ela só saiu no século XV, depois da morte dele. Ver §9.1.

**12.12 — "Ptolomeu ensina progressão secundária."**
Não. Ptolomeu ensina **direção primária** (III.10, grau equatorial = ano) e
**profecção** (IV.10, signo = ano). São coisas diferentes, e confundi-las é o erro
mais comum dos textos de divulgação. Ver §3 e §7.

**12.13 — "Trânsito exato = evento naquele dia."**
Nenhuma fonte antiga promete data. Na fonte, o trânsito é **gatilho** de um
assunto já definido pelo senhor do tempo — não é o assunto. Ver §2.

---

## 13. ONDE ISTO TOCA O APP

### 13.1 O que já existe, com precisão

| Peça | Arquivo | O que faz |
|---|---|---|
| Motor de trânsito×natal | `lib/personalSky.js` | Único módulo preditivo do app. Compara os 10 planetas de hoje com os 10 natais, 5 aspectos maiores, orbe escalonado por velocidade, devolve os 3 mais fortes com texto pronto. |
| Origem do dado natal | `lib/birthData.js:96` (`getAnyBirthData`) | `{ date, time (pode ser null), city (pode ser null) }`. Nunca fabrica. |
| Card "Céu de hoje pra você" | `screens/HomeScreen.js:180-194` e `:617-645` | Consome `personalSkyToday`. 1º aspecto grátis, resto atrás do gate. |
| Casas Inteiras | `lib/signs.js:440` (`houses`) | Casa 1 = signo do Ascendente. **É exatamente o sistema que a profecção exige.** Exige hora + lat/lon. |
| Posições planetárias | `lib/signs.js:478` (`planetPositions`) | Longitude eclíptica dos 10 planetas em qualquer instante. |
| Ascendente | `lib/signs.js:355` / `:402` | Signo e grau. Exige hora + lat/lon + fuso. |
| Mapa natal na tela | `screens/BirthChartScreen.js:72-73` | Asc e casas **só** quando `time && city`. |
| Contexto da IA | `server-patches/.../AnthropicChatProvider.js:206-214` | Envia sol, lua, ascendente, fase lunar, retrogradação, aspectos. **Nunca envia casas.** A proibição nº 1 do prompt (linha 716) impede a IA de afirmar posição sem dado. |
| Tabela de domicílios | `docs/tradicao/01-astrologia-fundamentos.md` §2.6 | Ptolomeu I.17. É a tabela que o Senhor do Ano precisa. **Não existe em código ainda.** |

**Cuidado com um falso amigo:** `lib/grounding.js:287` exporta `REGENTES`, mas
são os **regentes do dia da semana** (ordem caldaica — segunda=Lua, terça=Marte…).
**Não são regentes de domicílio.** Reaproveitar essa tabela para profecção daria
Senhor do Ano errado em todos os casos.

### 13.2 Três lacunas no trânsito que valem mais que qualquer feature nova

Antes de construir técnica nova, o que já existe está incompleto em três pontos, e
os três têm fonte:

**(a) Aplicativo × separativo.** `lib/personalSky.js:99-102` calcula
`Math.abs(sep - angle)` e perde o sinal. Resultado: o app diz a mesma frase para
um aspecto que está se formando e para um que já passou. A correção é comparar a
separação de hoje com a de amanhã (uma segunda chamada de `planetPositions`) e
mudar o verbo: *"está se formando"* versus *"está se desfazendo"*. É a distinção
que Valente faz em IX.3.

**(b) O trânsito não sabe em que casa cai.** `houses()` já existe e devolve as 12
casas quando há hora e cidade. Um trânsito de Marte que cai na casa 7 diz outra
coisa de um que cai na casa 2. Hoje o app só cruza planeta com planeta.

**(c) Se casas entrarem no contexto da IA, o rótulo é obrigatório.** Já registrado
em 03 §8.2(e): a linha teria que ser `"Casas (sistema: Casas Inteiras): Casa 1 em
Virgem…"`. Sem o rótulo, a IA afirma algo que só é verdade sob convenção não
declarada.

### 13.3 Profecção anual: a avaliação honesta que o dono pediu

**A favor:**

1. **O custo de cálculo é praticamente zero.** MEDIDO: 1.000.000 de profecções em
   22,7 ms. Sem efeméride, sem rede, sem dependência nova.
2. **A fonte é de primeira linha e citável nominalmente.** Ptolomeu IV.10,
   verbatim, incluindo as camadas mensal e diária. É o padrão que
   `lib/zodiacBody.js` já estabeleceu.
3. **Casas Inteiras já é o sistema do app.** `lib/signs.js:440`. A profecção
   pressupõe exatamente isso; num app Placidus a técnica ficaria conceitualmente
   torta. É uma coincidência favorável rara.
4. **Entrega conteúdo pessoal e datado** — "este é o seu ano de casa 7, e quem
   manda é Vênus" —, que é justamente o que falta ao card diário genérico.
5. **A camada mensal resolve o problema de cadência.** Ptolomeu IV.10 dá 28 dias
   por signo: **treze mudanças por ano**, também de graça. Isso transforma uma
   feature anual (ruim para engajamento) numa feature mensal (boa).

**Contra, e é aqui que o custo real aparece:**

1. **Precisa do Ascendente, que precisa de hora + cidade.** `getAnyBirthData()`
   devolve `time` e `city` como opcionais, e `BirthChartScreen` só calcula
   Ascendente com os dois. **Quem não preencheu o Mapa Astral completo não teria a
   feature.** Não medi que fração de usuários é essa — é a incógnita que decide o
   caso, e o dono tem esse dado.
2. **O conteúdo é onde mora o trabalho, não o cálculo.** Precisa de 12 textos de
   casa profeccionada × 7 textos de Senhor do Ano, escritos com o cuidado
   documentado em 03 §5 (significações de casa **com fonte**, não a "roda natural"
   Áries=casa 1 que 03 §7.12 já refuta). O cálculo é uma tarde; o conteúdo é a obra.
3. **Precisa da tabela de domicílios em código.** 12 linhas, Ptolomeu I.17, doc 01
   §2.6. Não existe hoje. Trivial, mas é código novo.
4. **A idade tem que sair do retorno solar, não do calendário.** MEDIDO em §7.4: o
   ano profeccional vira até um dia antes do aniversário. Calcular idade por
   diferença de datas erra nas vésperas — que é quando o usuário mais olha. A
   correção é achar o instante do retorno por bisseção (~60 iterações, barato) ou
   assumir e documentar a imprecisão de um dia.
5. **É uma afirmação mais forte que "Céu de hoje".** Dizer "este é o seu ano de
   casa 8" é mais categórico que "Marte tensiona seu Vênus". A moldura de 08
   ("símbolos apontam tendências, não determinismos") tem que ficar mais visível,
   não menos.

**A saída para o problema nº 1, e ela tem fonte primária.** Ptolomeu IV.10 diz
"from **each** of the prorogatory places" e nomeia cinco, entre eles o **Sol**
("dignities and glory") e a **Lua** ("affections of the soul and to marriage").
Como o app conhece o signo solar de **todo** usuário (`signoFromDate`, e desde a
correção recente ele é onde o Sol está de verdade, não o que a tabela diz), é
possível oferecer:

- **Usuário com mapa completo** → profecção do Ascendente, a forma canônica.
- **Usuário só com data** → profecção **do Sol**, rotulada como tal, com a citação
  de Ptolomeu IV.10 explicando por que é do Sol e o que ela cobre.

Isso não é um "modo degradado" inventado para contornar limitação de produto — é
uma das cinco prorrogações que o texto manda fazer. E a frase que explica a
diferença ao usuário é, ela mesma, conteúdo de autoridade.

**Recomendação, sem enrolação:** vale a pena, **na camada mensal e na tela certa**.
Como card diário na Home ela é fraca (muda uma vez por ano, ou uma vez por mês).
Como seção no **Mapa Astral** (`BirthChartScreen`, onde o Ascendente já está na
tela) e como gatilho de **aniversário** e de **Monthly Wrapped**
(`lib/monthlyWrapped.js`), ela é forte. A ordem de execução que eu defenderia é:
primeiro fechar as três lacunas de trânsito de §13.2 (custo baixo, melhora algo
que já é visto por todo usuário), depois profecção mensal a partir do Ascendente
no Mapa Astral, e só depois o fallback solar.

**Decisão do dono, não minha** — a memória `feedback_pedir_aprovacao.md` manda
apresentar e aguardar.

### 13.4 O que NÃO construir

- **Direções primárias** — exigem hora ao minuto, ascensão oblíqua e escolha de
  sistema de casas que muda o resultado. Nenhum retorno proporcional ao custo.
- **Zodiacal releasing** — exige Lotes, quatro níveis de subdivisão e uma UI
  temporal que não existe. E a técnica tem uma única fonte antiga.
- **Revolução solar completa** — só faz sentido com casas, o que reintroduz o
  problema da hora, mais duas disputas não resolvidas (relocação e precessão) que
  o app teria de arbitrar sem base.
- **Firdaria** — período fixo igual para todos, muda a cada 7–13 anos. Conteúdo
  quase estático, engajamento nulo. Ótimo para o chat responder se perguntarem;
  péssimo como feature.
- **Progressão secundária de planeta lento** — MEDIDO: não se move. Se algum dia
  houver progressão no app, que seja **só da Lua progredida** (ciclo de ~28 anos,
  muda de signo a cada ~2,3 anos) e do **Sol progredido** (muda de signo a cada
  ~30 anos), com o rótulo de que é simbólico.

### 13.5 Frases prontas, com lastro, para uso no app

Livres para copiar. Cada uma tem fonte nesta página.

- **Sobre trânsito × símbolo:** "Trânsito é onde o planeta está de verdade hoje.
  Progressão e direção são ponteiros simbólicos sobre o seu mapa parado — o
  planeta não está lá. A gente sempre diz qual dos dois está falando."
- **Sobre o retorno de Saturno:** "Saturno leva cerca de 29 anos e meio para voltar
  ao ponto onde estava quando você nasceu — mas a data exata varia: medindo 244
  nascimentos, o primeiro retorno cai entre 28 anos e 5 meses e 29 anos e 10 meses.
  Por isso a gente calcula a sua, em vez de dizer 'aos 29'."
- **Sobre a idade do meme:** "O ciclo de 30 anos de Saturno é antigo — Vétio
  Valente, no século II, já chama o 30º ano de ponto crítico saturnino. Mas a
  leitura do retorno como crise de amadurecimento é do século XX: aparece em livro
  popular em 1940, ganha vocabulário psicológico com Liz Greene em 1976 e vira
  cultura pop em 2000."
- **Sobre Ptolomeu e as idades:** "Na tabela de idades de Ptolomeu (*Tetrabiblos*
  IV.10), os 29 anos ainda são território do **Sol**, não de Saturno — Saturno só
  assume aos 68, e a fase de 41 a 56 é de Marte. A 'crise dos 40' tem mais lastro
  antigo que a 'crise dos 29'."
- **Sobre profecção:** "Um signo por ano de vida, a partir do seu Ascendente. Está
  em Ptolomeu, *Tetrabiblos* IV.10: 'um ano para cada signo', pegando o regente do
  signo onde a contagem para. É a técnica de previsão mais usada da astrologia
  antiga — e a mais barata de calcular."
- **Sobre o aniversário astrológico:** "Seu ano astrológico não vira à meia-noite
  do aniversário: vira quando o Sol volta ao grau exato em que estava no seu
  nascimento. Esse instante desliza quase seis horas por ano e, em ano
  pré-bissexto, cai no dia anterior."
- **Sobre progressão:** "Progressão secundária conta um dia depois do nascimento
  como um ano de vida. Funciona para Lua, Sol, Mercúrio, Vênus e Marte. Para os
  planetas lentos não funciona — em 90 anos de vida, Netuno progredido anda menos
  de 2 graus. Quem primeiro apontou isso foi Vétio Valente, no século II, sobre a
  própria técnica que ele estava ensinando."

---

## 14. Método: o que eu de fato li

Para que a próxima pessoa saiba o grau de confiança de cada afirmação.

**Li integralmente, no texto:**
- Vétio Valente, *Anthologiae*, tradução completa de Mark T. Riley (PDF do
  Skyscript, 3,0 MB) — baixei, converti para texto (11.646 linhas) e li de ponta a
  ponta as seções relevantes: IV.1 (períodos), IV.2-4 (setor vital, distribuições
  a partir de Fortuna e Daimon), IV.11 (o ano operativo), IX.3 (progressões),
  IX.5 (tempos críticos). Todas as citações de Valente aqui vêm desse arquivo.
- Steven Birchfield, "The Fardārāt in Nativities" (rev. 2020, PDF) — integral, 612
  linhas de texto extraído. É por ele que tenho as citações de Abu Ma'shar e
  al-Qabīṣī transcritas.
- Laura Michetti, "Persian Conjunctions and the Origins of the Saturn Return"
  (*Archai*, PDF) — integral, 389 linhas.

**Li em tradução, via LacusCurtius (Robbins/Loeb 1940):**
- Ptolomeu, *Tetrabiblos* III.10 e IV.10. As citações verbatim foram extraídas
  dessas páginas e conferidas contra o índice de capítulos da mesma edição.

**Li em fonte secundária confiável, e está marcado como tal no texto:**
- Chris Brennan (transcrições e slides do The Astrology Podcast, eps. 144, 153,
  192, 218; slides de profecções 2018) — para a história das técnicas e para o
  consenso acadêmico atual.
- Benjamin Dykes (via ep. 218 e via as citações de Birchfield) — para Abu Ma'shar.
- Anthony Louis (blog) — para as disputas de revolução solar e para a "soltura do
  vínculo".

**Medi eu mesmo, com a `astronomy-engine` do repositório:**
- Retornos de Saturno (n=244) e de Júpiter (n=244); segundo retorno de Saturno
  (n=26).
- Deslocamento de progressão secundária de 10 planetas em 90 anos, três
  nascimentos.
- Ciclo da Lua progredida.
- Deriva do instante da revolução solar ao longo de 8 anos.
- Arco solar por mês de nascimento (12 amostras).
- Custo computacional da profecção (10⁶ iterações).
- Data de virada do ano profeccional versus aniversário do calendário.

Scripts em
`%TEMP%\claude\...\scratchpad\medir.js` e `arco.js`. Reprodutíveis: usam só
`require('astronomy-engine')` do `node_modules` do próprio projeto.

---

## 15. Onde eu NÃO cheguei

Honestidade sobre o limite vale mais que cobertura fingida.

1. **Paulo de Alexandria, *Eisagogiká* cap. 31.** É apontado pela literatura
   secundária como a exposição mais clara da profecção. Não achei o texto em
   tradução acessível online — as traduções (Schmidt/Project Hindsight 1993;
   Greenbaum/ARHAT 2001) são impressas e protegidas. **A atribuição do capítulo 31
   é de segunda mão.**
2. **Doroteu de Sídon, *Carmen Astrologicum* IV.1.** Mesmo caso: citado como fonte
   do Senhor do Ano, não verificado por mim. A tradução Pingree e a de Dykes são
   protegidas.
3. **Firmico Materno, *Mathesis* II.27** (os "decennials"). Birchfield menciona;
   não fui ao texto.
4. **Grant Lewi, *Astrology for the Millions* (1940).** A afirmação de que é a
   primeira exposição impressa do retorno de Saturno vem de fontes secundárias
   (Astrology University, Aquarius Papers). **Não li o livro.** Se essa data for
   usada em conteúdo público, vale confirmar no exemplar — há cópias no Internet
   Archive.
5. **A passagem exata da "soltura do vínculo" em Valente.** Procurei "bond" na
   tradução de Riley e as ocorrências não são a técnica. A regra descrita em §8.1
   vem de fontes secundárias consistentes entre si, mas **não a li na fonte**. É
   possível que Riley traduza o termo de outro modo.
6. **Abu Ma'shar no original.** Todas as citações vêm da tradução de Dykes
   reproduzida por Birchfield. Não tenho o volume.
7. **Que fração dos usuários do app tem hora e cidade de nascimento salvas.** É o
   número que decide se a profecção do Ascendente é viável como feature principal
   ou se o fallback solar é o caminho. Está no banco, não em mim.
8. **Se a distinção aplicativo/separativo existe em Ptolomeu.** Achei em Valente
   (IX.3, sobre Júpiter sendo "carregado em direção" ao Ascendente). Não procurei
   sistematicamente no *Tetrabiblos*.

---

## 16. Bibliografia

### Fontes primárias consultadas

- **Cláudio Ptolomeu**, *Tetrabiblos*. Trad. F. E. Robbins, Loeb Classical
  Library, 1940. Texto aberto em LacusCurtius:
  `penelope.uchicago.edu/Thayer/E/Roman/Texts/Ptolemy/Tetrabiblos/`
  · Passagens usadas: **III.10** ("Of Length of Life" — grau equatorial = ano);
  **IV.10** ("Of the Division of Times" — idades do homem, profecção anual/mensal/
  diária, os cinco lugares prorrogatórios).
- **Vétio Valente**, *Anthologiae*. Trad. integral de Mark T. Riley (PDF livre):
  `skyscript.co.uk/pdf/pubs/texts/valens/riley/docs/Vettius_Valens_Riley.pdf`
  · Passagens usadas: **IV.1** (períodos mínimos e a tabela de "quartos");
  **IV.2** ("The Vital Sector"); **IV.3-4** (distribuições, e a soltura a partir
  dos Lotes de Fortuna e Daimon = zodiacal releasing); **IV.11** ("The Operative
  Year"); **IV.17-25** (as distribuições planeta a planeta); **V.7** (o dia
  operativo); **IX.3** (progressão dia-por-ano e a autocrítica); **IX.5**
  ("Critical Times" — o ponto crítico saturnino de 30 anos).
- **Abu Ma'shar al-Balkhi**, *Sobre as Revoluções dos Anos das Natividades*
  (*Kitāb taḥāwīl sinī al-mawālīd*), séc. IX. Trad. Benjamin Dykes, Cazimi Press,
  2010/2019 · Livro IV, cap. 1 e cap. 7 — **lido através das citações integrais
  transcritas por Birchfield**, não no volume.
- **al-Qabīṣī (Alchabitius)**, *The Introduction to Astrology*, cap. 4:270-275 —
  idem, via Birchfield.
- **Guido Bonatti**, *Liber Astronomiae*, *Tractatus de nativitatibus* cap. III.
  Trad. Robert Zoller, em *Tools and Techniques II*, 3ª ed., 2003 — idem, via
  Birchfield.
- **al-Bīrūnī**, *The Book of Instruction in the Elements of the Art of Astrology*,
  1029. Trad. R. Ramsay Wright, 1934 (domínio público, Archive.org). Já na tabela
  de domínio público do doc 09. Descreve os fardārāt; a ordem noturna resolvida é a
  de Abu Ma'shar.

### Estudos e fontes secundárias

- **Laura Michetti**, "Persian Conjunctions and the Origins of the Saturn Return",
  *Archai: The Journal of Archetypal Cosmology*, edição "Historical Roots and
  Current Flowerings", pp. 7–15. PDF aberto em `archai.org`. — **A referência
  central da seção 11.** Bibliografia dela inclui Campion, Holden, Klibansky/
  Panofsky/Saxl (*Saturn and Melancholy*), Neugebauer, Pingree & Kennedy, Tarnas.
- **Steven Birchfield**, "The Fardārāt in Nativities" (2005, rev. 2020). PDF aberto
  em `birchfieldastrology.com`. — **A referência central da seção 9.** Reproduz as
  citações primárias de Abu Ma'shar, al-Andarzaghar, al-Qabīṣī e Bonatti lado a
  lado, que é o que permite ver a disputa dos nodos como problema de transmissão
  textual.
- **Chris Brennan**, *Hellenistic Astrology: The Study of Fate and Fortune*.
  Denver: Amor Fati Publications, 2017. — Obra protegida; usada como referência
  bibliográfica (tese e contribuição), não reproduzida. É a síntese acadêmica
  moderna de referência da tradição helenística.
- **Chris Brennan**, The Astrology Podcast — transcrições abertas: ep. 144
  (progressões secundárias), ep. 153 (profecções anuais), ep. 192 (zodiacal
  releasing), ep. 218 (Abu Ma'shar sobre revoluções solares, com Benjamin Dykes);
  e os slides de aula "Annual Profections" (2018).
- **James Herschel Holden**, *A History of Horoscopic Astrology*. Tempe, AZ: AFA
  Press, 1996. — Citado por Brennan para a linha Kepler→Placidus→Partridge das
  progressões. Não consultado diretamente.
- **Charles Burnett & Ahmed al-Hamdi**, *Zādānfarrūkh al-Andarzaghar: On
  Anniversary Horoscopes*. The Warburg Institute, 1992. — Fonte de Birchfield para
  o testemunho de al-Andarzaghar.
- **Reinhold Ebertin**, *The Combination of Stellar Influences* — cosmobiologia; a
  escola que popularizou o arco solar no século XX. Obra protegida, referência
  bibliográfica.
- **Liz Greene**, *Saturn: A New Look at an Old Devil*, 1976. — Obra protegida. O
  marco da releitura psicológica de Saturno; registrada aqui como datação, não
  reproduzida.
- **Grant Lewi**, *Astrology for the Millions*, 1940. — Apontado como a primeira
  exposição impressa do retorno de Saturno. **Não verificado no exemplar.**
- **Anthony Louis** (blog `tonylouis.wordpress.com`) — "A brief overview of
  Zodiacal Releasing" (2017); "Tropical vs Sidereal Years in Calculating Solar
  Returns" (2020); "Reflections on Secondary Progressions" (2019).
- **Seven Stars Astrology** (`sevenstarsastrology.com`), série "Astrological
  Predictive Techniques" — para as referências de Paulo cap. 31 e Doroteu IV.1
  (segunda mão).
- **Robert Schmidt / Project Hindsight** — tradutor do Livro IV de Valente
  (~1996) e autor do termo "Zodiacal Releasing".

### Documentos irmãos desta base

- **01 — Fundamentos**: §2.6 tem a tabela de domicílios de Ptolomeu I.17, que é o
  que a profecção precisa para achar o Senhor do Ano. §(e) tem a retrogradação em
  Valente.
- **03 — Casas e Mapa Natal**: Casas Inteiras, o Ascendente como origem da
  contagem, a aversão, e por que a "roda natural" (Áries = casa 1) é falsa. Tudo
  isso é pré-requisito para escrever texto de profecção sem repetir erro.
- **04 — Lua, fases e calendário**: o ciclo lunar de 8 fases é de Rudhyar, não é
  antigo — mesmo tipo de camada moderna sobre osso antigo que a seção 11 descreve
  para Saturno.
- **08 — O que o mercado diz**: a moldura. Quando mercado e fonte divergem, vale a
  fonte, e vale explicar a divergência ao usuário.
- **09 — Bibliografia**: a regra de domínio público × obra protegida que este
  documento seguiu.
