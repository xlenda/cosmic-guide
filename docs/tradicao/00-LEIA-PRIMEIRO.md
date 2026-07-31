# 00 — LEIA PRIMEIRO

> **Índice mestre da base de tradição do Cosmic Guide.**
> Fechado em 31/07/2026, com 16 documentos e ~15 mil linhas de revisão
> bibliográfica em fonte primária.

---

## O que é esta base

É a **memória de pesquisa do produto**. Dezesseis documentos que respondem, com
obra, autor, capítulo e século, a uma única pergunta repetida em vinte formatos:

> *De onde veio isso, e quem foi a primeira pessoa a escrever?*

Ela foi feita pelo método de **revisão bibliográfica** — o mesmo de um TCC.
Lemos as fontes, entendemos o campo, marcamos onde os autores concordam e onde
brigam, e escrevemos **síntese própria**, com a referência de onde cada ideia
veio. Fonte de domínio público foi lida direto e citada verbatim quando a frase
exata importa. Obra protegida entrou só como **referência bibliográfica** —
registramos a tese e a contribuição do autor, nunca o texto dele.

## Por que ela existe

Porque o mercado de astrologia e tarô funciona por telefone-sem-fio. Alguém
escreveu "Leão rege o coração" em algum lugar, todo mundo copiou, e hoje nenhum
produto do mercado sabe dizer de onde veio. Quando um usuário que estuda o
assunto pergunta "quem disse isso?", não há resposta.

Esta base é a resposta. E ela produziu, de quebra, o ativo competitivo do app:
**a lista dos erros que o mercado inteiro repete** (seção grande, mais abaixo).
Cada linha daquela lista é um lugar onde o Cosmic Guide pode estar certo
enquanto todo concorrente erra — e o concorrente não consegue copiar sem fazer
o mesmo trabalho de leitura.

## A regra de uso

> **Consulte esta base ANTES de escrever qualquer conteúdo do app.**
> Antes da tela, antes da copy, antes do prompt de IA, antes do post.

Não é burocracia. É que a maior parte do que "todo mundo sabe" sobre esses
assuntos está documentadamente errado, e o custo de publicar errado é alto: o
usuário que estuda de verdade testa o app com o mapa dele, encontra o erro em
dez segundos, e conta para os outros.

---

## A REGRA DE OURO

Quatro proibições e uma obrigação. Valem para toda tela, todo texto, toda
feature futura, em qualquer idioma.

### 1. Tradição sempre com fonte
Nada de "dizem que", "a tradição ensina", "os antigos acreditavam". Ou tem obra,
autor e século, ou não vai para a tela. Se a pesquisa não achou a fonte, o texto
diz que não achou — **fonte inventada, ou atribuída ao autor errado, é PIOR que
ausência de fonte.**

### 2. Nunca alegação de saúde
Linha vermelha absoluta, independente de fonte. O app **descreve o que a
tradição acreditava**; não prescreve nada ao corpo de quem lê. Nada sobre
sono, humor, ciclo, fertilidade, dor, doença, cura, energia corporal ou
"limpeza". Pintas: nada sobre cor, borda, formato, tamanho, textura ou mudança —
isso é dermatologia. Já travado em código (`lib/grounding.js`,
`lib/zodiacBody.js`, `lib/cosmicSound.js`), com teste que aborta o deploy.
Ver também a memória `feedback_conteudo_tradicao_sem_saude`.

### 3. Nunca invenção apresentada como milenar
Toda peça de conteúdo declara sua idade real. "Superlua" tem 47 anos, não é
astronomia clássica. O tarô divinatório tem 245 anos, não vem do Egito. As oito
fases da Lua são de 1936, não são milenares. **Datar não enfraquece: a história
real é mais interessante que a inventada, e é a única que aguenta ser checada.**
Antes de escrever "milenar", "ancestral" ou "desde a antiguidade", ache o item
na tabela do doc 10 §13. Se a data for posterior a 1800, a palavra é falsa.

### 4. Nunca determinismo
"Símbolos apontam tendências, não determinismos." O app não prevê evento datado,
não afirma mecanismo causal, não promete resultado. Sempre no passado e com
dono: *"Manílio associava…"*, nunca *"seu ponto fraco é…"*.

### 5. A obrigação: mostrar a discordância
Quando duas fontes divergem, mostre as duas com o nome de cada uma. Nunca
escolha em silêncio. Um app que diz "Ptolomeu classifica assim, mas Valente usa
outro critério" está dizendo ao usuário que existe um assunto de verdade ali.
**Citar a fonte é bom. Mostrar que os especialistas discordam é melhor** — e é
conteúdo que Astrolink, Personare e Co-Star estruturalmente não conseguem
produzir, porque o modelo deles depende de voz única e afirmativa.

### As três camadas, sempre separadas
| Camada | O que é | Regra |
|---|---|---|
| **1 — o céu** | Longitude, fase, aspecto, ascendente | **Calculado, nunca tabelado.** Tem que estar certo, porque é checável |
| **2 — a tradição** | O que cada coisa significa | **Citada** com obra, autor e século. É atribuição cultural, não fato |
| **3 — a vida de quem lê** | A pessoa | **Dela.** Nunca nossa para afirmar |

Misturar a camada 1 com a 2 foi a origem do pior bug da história do app
(`signoFromDate` por tabela de calendário, errando 293 dias em 29.585). Misturar
a 2 com a 3 é o que transforma "Áries rege a cabeça" em dano.

---

## Convenção de marcação

Todos os documentos usam graus de origem e de verificação. **Atenção:** os docs
04–07 escrevem `[IM]` (invenção moderna) onde os docs 10–15 escrevem `[IR]`
(invenção recente). São a mesma marca. A unificação está registrada como
pendência no `99-o-que-falta.md`.

| Marca | Significa |
|---|---|
| **[FP]** | **FONTE PRIMÁRIA** — o texto antigo diz isso. Obra e locus indicados |
| **[TP]** | **TRADIÇÃO POSTERIOR** — surgiu depois, com autor e data conhecidos |
| **[AM]** | **ACADEMIA MODERNA** — conclusão de erudição histórica (séc. XIX–XXI) |
| **[IR]** / **[IM]** | **INVENÇÃO RECENTE** — sem lastro antigo; nasceu no séc. XIX/XX/XXI |
| **[DIS]** | **DISPUTADO** — especialistas divergem; as duas posições estão nomeadas |
| **[AST]** | Fato astronômico medível |
| ✅ | Li o trecho nesta pesquisa, ou é fato bibliográfico duro corroborado |
| ⚠️ | Vem de literatura secundária. Não reconferido no original |
| ❌ / [NF] | Procurei e **não** consegui confirmar. Está no doc 99, não no corpo |
| 📐 **MEDIDO AQUI** | Número calculado pela própria pesquisa, com o motor do app |

---

## Índice dos documentos

| # | Arquivo | Uma linha |
|---|---|---|
| **00** | `00-tese.md` | **A posição do produto** — sete proposições que governam todos os outros arquivos. Leia depois deste |
| 01 | `01-astrologia-fundamentos.md` | Signos, elementos, modalidades, dignidades, o Homem Zodiacal — Ptolomeu, Manílio e Valente em fonte primária, com 18 erros de internet desmontados |
| 02 | `02-aspectos-e-sinastria.md` | Os quatro aspectos de Ptolomeu, as seis relações entre signos, sinastria real (IV.5 e IV.7) e a morte da "porcentagem de compatibilidade" |
| 03 | `03-casas-e-mapa-natal.md` | Ascendente, ângulos, os doze lugares em Paulo e Valente, e os sete sistemas de casas comparados com medição própria |
| 04 | `04-lua-fases-e-calendario.md` | Fases, calendário agrícola romano e brasileiro, nodos, eclipses, e o rastreamento nome a nome das luas cheias de almanaque |
| 05 | `05-taro-historia-e-leitura.md` | A história real do tarô — 350 anos de jogo de cartas, 1781, Waite/Smith 1911 — e 21 mitos datados |
| 06 | `06-oniromancia-e-artes-corporais.md` | Artemidoro, quiromancia, fisiognomonia (com a história feia), podomancia, pintas e tasseografia |
| 07 | `07-outras-tradicoes-e-oportunidades.md` | Jyotish, numerologia, I Ching, runas e cabala — o que é antigo, o que é do séc. XX, e o que nunca existiu |
| 08 | `08-o-que-o-mercado-diz.md` | Retrato do mercado brasileiro. **Não é fonte** — é o que o usuário espera encontrar e o que o concorrente faz |
| 09 | `09-bibliografia-e-fontes.md` | Bibliografia por status de uso: domínio público (citável) × obra protegida (só referência) |
| 10 | `10-historia-da-astrologia.md` | Babilônia → séc. XXI em doze partes, com a tabela "isso é milenar?" e 17 erros históricos corrigidos |
| 11 | `11-planetas-em-profundidade.md` | Os sete tradicionais e os três modernos: seita, dignidade, retrogradação — com medições astronômicas próprias |
| 12 | `12-as-doze-casas.md` | Casa a casa, antigo × moderno, a doutrina dos lugares inoperantes e o "alfabeto de 12 letras" que fabrica conteúdo falso |
| 13 | `13-tecnicas-preditivas.md` | Trânsitos, progressões, direções, revoluções, profecções, zodiacal releasing e firdaria — com o que vale e o que não vale construir |
| 14 | `14-simbolismo-comparado.md` | Onde as tradições de fato se cruzam (4, 7, 22, 12, 36) e onde a correspondência é só pressão de forma |
| 15 | `15-campo-contemporaneo-e-autores.md` | As cinco escolas vivas, os autores internacionais, o campo lusófono e as dez divergências abertas |
| 16 | `16-oportunidades-de-conteudo.md` | O que esta base destrava como feature, ordenado por riqueza × esforço |
| 99 | `99-o-que-falta.md` | As lacunas: o que não foi achado, o que exige obra impressa, o que ficou disputado |

**Estado da base:** todos os 16 documentos existem, estão em português, têm
grau marcado e nenhum está vazio ou pela metade. Os docs 08 e 09 são curtos por
desenho (retrato de mercado e bibliografia), não por incompletude — mas o 09
está **desatualizado** em relação às fontes que os docs 10–15 consultaram
depois, e tem uma correção pendente registrada (doc 15 §4.4).

---

# ⭐ OS ERROS QUE O MERCADO INTEIRO REPETE

**Esta é a seção mais importante desta base.** Cada linha é um engano difundido,
a fonte que o desmente, e — quando existe — o nome e a data de quem inventou.

Reunida dos dezesseis documentos. Use-a como checklist: se um texto do app,
um prompt de IA ou um post estiver prestes a afirmar qualquer coisa desta
tabela, **pare**.

> Regra de leitura: a coluna "quem inventou" só traz nome quando a pesquisa
> achou o nome. Onde está "sem autor identificado", isso é resultado, não
> preguiça — e está detalhado no doc 99.

---

## A · Os falsos "milenares" — idade real de cada coisa

A pergunta que mais dá dinheiro e mais dá vergonha. Tabela completa no doc 10 §13.

| O mercado diz | A fonte mostra | Quem inventou / quando | Doc |
|---|---|---|---|
| "A astrologia tem 5.000 anos" | O que tem ~4.000 anos são **presságios de Estado** mesopotâmicos, que não são astrologia individual. Zodíaco: ~2.450 anos. Horóscopo individual mais antigo: **410 a.C.** Mapa natal com Ascendente e casas: ~2.150 anos | Formulação honesta: "~2.000 a 2.500 anos de tradição textual contínua, com raízes numa divinação celeste mesopotâmica mais antiga e diferente" | 10 §14.1 |
| "Os babilônios liam mapas natais" | Liam presságios **de Estado**. Os horóscopos cuneiformes individuais existem só a partir de 410 a.C., são poucos, e são listas de posições **sem Ascendente, sem casas, sem interpretação** | — | 10 §14.2 |
| "O tarô vem do Egito / é o Livro de Thoth" | **Antoine Court de Gébelin**, *Le Monde primitif* vol. 8, "Du Jeu des Tarots" — **1781**. Ele escreveu isso **18 anos antes da Pedra de Roseta e 41 antes de Champollion**: não tinha como ler nada egípcio. O próprio **Waite (1911)**: *"there is no particle of evidence for the Egyptian origin of Tarot cards"* | **Court de Gébelin, 1781** | 05 §5.1 |
| "TAROT vem do egípcio TAR-RO, 'caminho real'" | A etimologia real de *tarocco* é **desconhecida**, e já era declarada desconhecida em **1550** por Lollio | **Court de Gébelin, 1781** | 05 §5.2 |
| "Tasseografia (borra de café) é milenar" | **Cronologicamente impossível.** Os primeiros cafés de Istambul são de **1555**. Leitura de folha de chá exige folha solta em xícara aberta — arranjo europeu dos séc. XVII–XVIII. Manual impresso mais antigo verificado: **1742**, anônimo, *Die Wahrsagerin aus dem Coffee-Schälgen* | Nenhuma versão pode ter mais de ~470 anos | 06 §6.1 |
| "O dicionário de símbolos da xícara é tradição antiga" | É salão **britânico vitoriano/eduardiano**: *Tea-Cup Reading*, "A Highland Seer", **1881**; **Cicely Kent, 1922**. A geografia da xícara (alça = a pessoa, horário = o tempo) **não tem codificador identificado** | 1880–1930, Grã-Bretanha | 06 §6.1 |
| "A Cabala tem 4.000 anos, Abraão escreveu o Sefer Yetzirah" | Atribuição a Abraão é **pseudepigrafia interna** do próprio texto. Datação real: **séc. II–VI d.C.**, e disputada | — | 07 §6 |
| "O Zohar é do séc. II, de Shimon bar Yochai" | Texto de **Castela, fim do séc. XIII**. Scholem atribui a **Moshe de León** | Séc. XIII | 07 §5.3 |
| "A Árvore da Vida é um diagrama antigo" | A versão padrão, **com letras nos caminhos**, é a **Árvore de Kircher, 1652**. O primeiro diagrama impresso de sefirot é de **1516** e tem ~17 caminhos, não 22 | **Kircher, 1652** | 07 §5.4 |
| "O I Ching tem 5.000 anos, criado por Fu Xi" | **Fu Xi é figura mítica.** O núcleo (*Zhouyi*) é do **séc. IX a.C.** — ~2.900 anos, o que já é impressionante | — | 07 §6 |
| "Os vikings liam runas para adivinhar" | Nenhuma fonte descreve isso. O corpus rúnico é **memorial, de propriedade e comemorativo**. Tácito (98 d.C.) escreve *notis quibusdam*, "certos sinais" — não diz runas, e escreve **antes** da inscrição rúnica mais antiga conhecida | — | 07 §4.3 |
| "A astrologia védica está nos Vedas, tem 5.000 anos" | Os Vedas trazem **nakshatras** (calendário e ritual). **Não trazem mapa natal, casas, aspectos nem os 12 signos.** O *Vedāṅga Jyotiṣa* é manual **de calendário** | Os 12 signos entram na Índia via material grego, séc. I–IV d.C. | 07 §6 |
| "Quiromancia é arte cigana / milenar com montes e tipos de mão" | Raiz textual é grega, latina e sânscrita — anterior em dois séculos à chegada dos Rom à Europa ocidental. O sistema **moderno** nasce em **1839** (D'Arpentigny, *La Chirognomie*), Heron-Allen (1883), Chirological Society (1889), **Benham (1900)**. Os quatro tipos de mão Terra/Ar/Fogo/Água são **Fred Gettings, 1965** | Séc. XIX–XX. **A palavra "cigana" não entra em nenhum texto do app** | 06 §2 |
| "Podomancia é uma arte milenar" | Como **nome de arte**, não existe. Como prática dentro do *samudrika shastra* indiano, sim (séc. VI). "Pé grego/egípcio/romano revela personalidade" é classificação **podiátrica de modelagem de calçado** reciclada | Séc. XX–XXI | 06 §4 |
| "Astrologia tradicional é a astrologia antiga, direta" | É uma **reconstrução** iniciada em **1992–93** (Project Hindsight, Schmidt/Hand/Zoller), a partir de textos que estavam intraduzidos, com lacunas preenchidas por interpretação e disputas internas em aberto | **1992–93** — tem 33 anos | 10 §14.14 · 15 §6 |

---

## B · Atribuições ao autor errado

O erro mais elegante do mercado: a fonte existe, mas é outra.

| O mercado diz | A fonte mostra | Doc |
|---|---|---|
| "O Homem Zodiacal (signo → parte do corpo) está no *Tetrabiblos*" | **Não está.** Ptolomeu III.xvii enumera a correspondência **planetária**. A lista dos doze signos é de **Manílio, *Astronomica* II.453–465** — e **Leão não é o coração** (é *laterum regnum scapulaeque*, flancos e omoplatas) e **Libra não são os rins** (é nádegas). Valente corrobora independentemente | 01 §3.2–3.4 |
| "Leão rege o coração desde a antiguidade" | Transitividade tardia: o **Sol** rege o coração (Valente I.1) → o Sol rege Leão → "Leão rege o coração". **Novidade do doc 14: a versão 'coração' pode ser datada** — está impressa na Escala do Doze de **Agrippa, 1533** | 01 §3.2 · 14 §6.2 |
| "Ptolomeu descreveu as personalidades dos doze signos" | Ptolomeu deriva caráter de **Mercúrio e da Lua** (III.13) e das modalidades. Não existe capítulo de "doze personalidades" no *Tetrabiblos*. Quem tem retrato signo a signo é **Valente** (I.2) e **Manílio** (IV) — e o conteúdo deles é irreconhecível para o leitor de hoje | 01 §3.1 |
| "Ptolomeu lista as doze casas" | **Não lista.** O próprio tradutor da Loeb avisa: Ptolomeu *"pays little attention to the system of 'places' or 'houses'"*. A exposição sistemática está em **Paulo de Alexandria cap. 24 (378 d.C.)**, **Valente II**, **Fírmico II**, **Retório 54**. Se precisar citar fonte para significação de casa: **cite Paulo, não Ptolomeu** | 03 §7.4 · 12 §9.12 |
| "Ptolomeu dividiu os signos em fogo, terra, ar e água" | Ptolomeu organiza as triplicidades por **vento e direção** (I.18). Quem nomeia *fiery/earthy/airy/moist* é **Valente** (I.2, II.1). A atribuição elemental é antiga e primária — só não é de Ptolomeu | 01 §3.5 |
| "Ptolomeu estabeleceu os orbes de aspecto" | Ptolomeu **não dá orbe nenhum**. Os aspectos dele são entre **signos inteiros**. Orbe é doutrina dos **raios do planeta**, transmitida por al-Bīrūnī (1029) e Bonatti (c. 1277), tabelada por **Lilly (1647)** — e nela o orbe pertence ao *planeta*, não ao aspecto | 02 §3.4 |
| "Ptolomeu é o pai da astrologia" | Chega ~300 anos depois do sistema pronto, é um **reformador físico** que **poda** a tradição recebida, e **não** representa a prática comum de sua época — Valente representa | 10 §14.3 |
| "Ptolomeu ensina progressão secundária" | Ptolomeu ensina **direção primária** (III.10) e **profecção** (IV.10). São coisas diferentes, e confundi-las é o erro mais comum dos textos de divulgação | 13 §12.12 |
| "Placidus criou o sistema Placidus" / "é o sistema de Ptolomeu" | Publicou em **1650**, mas o Swiss Ephemeris atribui a invenção a **Magini (1555–1617)**, e a linhagem vai a **ibn Ezra, séc. XII**. E o *Tetrabiblos* **não descreve sistema de casas nenhum** | 03 §7.1–7.2 |
| "Porfírio criou o sistema Porfírio" | O texto que leva o nome dele está **citando Antíoco de Atenas** (séc. II), e o método está em **Valente III.2**. O próprio Valente credita um tal **Órion** | 03 §7.5 |
| "Regiomontanus criou o sistema Regiomontanus" | Swiss Ephemeris atribui a **Abraham ibn Ezra († 1167)**. Regiomontanus nunca reivindicou; as **tabelas** dele é que popularizaram | 03 §7.7 |
| "Koch foi criado por Walter Koch" | Idealizado por **Friedrich Zanzinger** e **Heinz Specht**. Koch deu o nome | 03 §7.22 |
| "Waite desenhou o baralho" | As 78 imagens são de **Pamela Colman Smith**. Use **"Rider-Waite-Smith"**. Para os menores, Smith se apoiou fortemente no **Sola Busca** (c. 1491), cujas fotos entraram no British Museum em **1907**, dois anos antes | 05 §5.10 |
| "Waite inventou a troca Força ⇄ Justiça" | A troca está nos **Cipher Manuscripts da Golden Dawn**, anteriores ao baralho. Motivo: pôr Leão e Libra em ordem zodiacal | 05 §5.9 |
| "Confúcio escreveu as Dez Asas do I Ching" | **Ouyang Xiu** já refutava isso no **séc. XI**. As Asas são compósitas, séc. IV–II a.C. | 07 §6 |
| "Leibniz tirou o binário do I Ching" | Leibniz **já trabalhava com binário em 1679**. Recebeu o diagrama de Fu Xi em **1701** e o leu como **confirmação**. A ordem causal é a inversa | 07 §6 |
| "Mathers traduziu o Zohar" | Traduziu o **latim de Knorr von Rosenroth** (1677–84). Tradução de tradução | 07 §6 |
| "Wilhelm traduziu o I Ching para o português/inglês" | Wilhelm traduziu para o **alemão** (1924); a inglesa é de **Baynes** (1950). Em português, você está lendo a **quarta camada** | 07 §6 |
| "Kepler chamou a astrologia de 'filha tola', logo desprezava" | Citação truncada. A frase completa diz que a filha tola **sustentava financeiramente a mãe astronomia**, e está num livro escrito **em defesa** de uma astrologia reformada (*Tertius Interveniens*, 1610) | 10 §14.6 |
| "Martinho de Braga criou os nomes dos dias em português" | Ele **condena** chamar os dias por nomes de deuses (verbatim, verificado). Que ele tenha criado a numeração por *feria* é tradição repetida **não confirmada no texto primário** | 14 §8.11 |
| "Tommaso Tamponelli escreveu o primeiro manual de café no séc. XVII" | **Atribuição não sustentada.** Busca no Google Books não retorna nenhuma ocorrência de "Tamponelli" anterior a 1800. Circula na Wikipédia alemã e em dezenas de sites. **É o 'Leão = coração' desta tradição — não cite** | 06 §6.2 |
| "Agrippa ensina o cálculo do Caminho de Vida" | Agrippa (1533) traz tabelas numéricas de alfabetos no esquema 1–9/10–90/100+, **não** a redução por raiz digital. Sistema diferente | 07 §6 |
| "Pitágoras criou a tabela A=1, B=2…" | **Pitágoras não deixou nenhum escrito**, e o alfabeto latino de 26 letras não é o dele. A tabela em três colunas de nove **não existe em fonte antiga alguma** — difusão rastreável a **L. Dow Balliett, 1908**. Os "números-mestres" 11 e 22 também são de Balliett | 07 §2.4 |

---

## C · Signos, elementos e compatibilidade

O núcleo comercial do mercado — e onde ele está mais frágil.

| O mercado diz | A fonte mostra | Quem inventou / quando | Doc |
|---|---|---|---|
| **"Porcentagem de compatibilidade entre signos"** | **Não existe em nenhuma fonte** ocidental antiga, medieval ou renascentista. Varridos Ptolomeu IV.5 e IV.7, Doroteu, Māshāʾallāh e Lilly: **nenhum número**. O que existe é uma **escala ordinal de quatro degraus** e a contagem de quantos dos quatro lugares concordam | Convenção de mídia de massa e software, séc. XX, **sem inventor documentado**. Ingredientes datáveis: coluna de jornal (Naylor, 1930), compatibilidade em massa (Linda Goodman, *Sun Signs* 1968 / *Love Signs* 1978, **sem porcentagem**), pontuação em sinastria (Benjamine, Pottenger, Discepolo) | 02 §3.1 |
| **"Fogo combina com ar, terra com água"** | Colapso grave. **O par de elementos não determina o aspecto**: Fogo×Ar pode ser sextil (Áries–Gêmeos) **ou oposição** (Áries–Libra). Fogo×Água pode ser quadratura, quincunce **ou** semi-sextil. O critério de Ptolomeu I.13 é **gênero do signo**, e ele deriva os ângulos de proporções musicais. Reduzir 78 pares a 10 combinações de elemento apaga a diferença entre um sextil e uma oposição | Folclore de revista, séc. XX | 02 §3.9 · 08 |
| **"Signos a 30° e 150° são 'aspectos menores' (semi-sextil, quincunce)"** | **É o contrário exato.** Ptolomeu I.16 chama esses signos de ***disjunct* e *alien*** — "entirely without share in the four aforesaid aspects". São **a definição de não-aspecto**. E a aritmética fecha: **todo par a 1 ou 5 signos é desconexo — 24 pares, 48 das 144 células da matriz, um terço** | Promoção a "aspecto menor" é moderna | 02 §3.6 · 00-tese §4 |
| "A tradição só tem quatro relações entre signos" | **Tem seis.** Além dos quatro aspectos: **signos comandantes e obedientes** (I.14, equidistantes do ponto equinocial, relação **assimétrica**) e **signos que se veem / de igual poder** (I.15, equidistantes do ponto solsticial). Nenhum app do mercado implementa, porque ninguém leu I.14 | — | 00-tese §4 |
| "O melhor aspecto entre dois mapas é o trígono" | **Falso na fonte.** IV.7 põe acima do trígono a **coincidência de signo** e a **troca de lugares**; trígono e sextil "make the sympathies **less**". **Na tradição, estar no mesmo lugar vale mais que estar em bom ângulo** | — | 02 §3.8 |
| "Sinastria é comparar os signos solares dos dois" | IV.7 compara **quatro lugares** (Sol, Lua, Ascendente, Parte da Fortuna); IV.5 compara **Sol e Lua**; Doroteu compara **ângulos**; Māshāʾallāh olha **Vênus e Lua** | Signo solar como unidade de comparação é séc. XX | 02 §3.7 |
| "A conjunção é o aspecto mais forte / o melhor" | Em Ptolomeu a conjunção **nem é aspecto** (I.13 lista quatro). Entra como *bodily application* em I.24, categoria à parte. Lilly p. 106: "Conjunctions are good or bad, **as the Planets in Conjunction are friends or enemies**" | — | 01 §3.8 · 02 §3.12 |
| "Aspectos menores (quintil, semiquadratura, sesquiquadratura) são antigos" | São de **Kepler, 1619**, derivados de razões harmônicas. Ptolomeu reconhece **cinco** figuras e dá razão para só essas existirem | **Kepler, 1619** | 10 §14.15 |
| "O orbe padrão do trígono é 8°" | **Não há padrão.** Varia por autor e por software. Usar 8° é aceitável como convenção declarada; chamar de "o tradicional" não é | Sem autor identificado | 02 §3.5 |
| "'Cardinal, fixo, mutável' são os termos antigos" | As **categorias** são primárias (Ptolomeu I.11); os **nomes** não. Ptolomeu diz *solsticial, equinocial, sólido, bicorpóreo*. Em Robbins, "cardinal" aparece **uma vez**, sobre ventos | Sem autor identificado | 01 §3.6 |
| "Nascer na cusp = ser um pouco dos dois signos" | Não há fonte antiga. As fronteiras de signo são **exatas, em grau**. A crença nasce de tabelas de data fixas em almanaques — que **de fato** erram. **A resposta certa não é "você é dos dois": é calcular a longitude do Sol no instante do nascimento** | **[IR]**, sem autor identificado | 01 §3.11 |
| "Áries começa sempre em 21 de março" | 📐 **MEDIDO:** de 1.092 dias de virada testados (1940–2030), **318 (29,1%)** dão signo errado por tabela fixa. **3,27% dos dias** o Sol muda de signo no meio do dia — nenhuma tabela por data pode acertar | — | 01 §3.12 |
| "Ofiúco é o 13º signo que escondem" | O zodíaco é de doze partes **iguais** desde o séc. V a.C., e Ptolomeu I.22 diz que os signos se contam a partir dos equinócios e solstícios "**and from no other source**". Os limites de constelação da IAU são de **1930**. **Signo nunca foi constelação** | — | 01 §3.13 |
| "Cada signo tem chakra e frequência em Hz" | Chakras são do tantra hindu/budista e **não têm relação histórica** com o zodíaco ocidental — a fusão é teosófica, séc. XIX/XX. As "frequências solfeggio" (528, 432, 639 Hz) são invenção do séc. XX **sem lastro antigo nem físico**. Pedra e planta por signo **têm** tradição real (Culpeper, 1653) | Marketing de bem-estar | 01 §3.15 |
| "Na astrologia védica seu signo verdadeiro é outro" | Referenciais diferentes, **não correção**. O sideral também usa divisões iguais de 30°, que não correspondem ao tamanho real das constelações, e existem **múltiplos ayanāṃśas discordantes**. O padrão indiano (Lahiri) foi **fixado por um comitê do CSIR em 1955**. E no jyotish o primeiro corpo lido é a **Lua** | — | 07 §6 · 15 §6 |

---

## D · As casas — onde nasce mais conteúdo falso

| O mercado diz | A fonte mostra | Doc |
|---|---|---|
| **"A roda natural: Áries = Casa 1, Touro = Casa 2, Gêmeos = Casa 3…"** | **A INVENÇÃO MAIS DESTRUTIVA DE TODAS.** Nenhuma fonte antiga equipara o significado de uma casa ao de um signo. Este esquema — o "alfabeto de 12 letras" — é o **motor de fabricação de conteúdo falso**: dele saem "Casa 8 = sexo", "Casa 12 = inconsciente", "Casa 6 = rotina". São deduções a partir de premissa moderna, vendidas como tradição. Atribuído a **Zipporah Dobyns, anos 1970** (ano e obra **não confirmados**) | 03 §7.12 · 12 §6 |
| "Casa 8 = sexo e transformação" | Paulo: o **Ocioso**, "a completude da vida". Valente: "The VIII Place of **Death**". Fírmico: *Epicatafora*, "de onde se descobre o tipo de morte". **Sexo não aparece em fonte antiga nenhuma.** Cadeia causal: Plutão (**1930**) → Escorpião → Casa 8 | 03 §7.13 · 12 §9.1 |
| "Casa 8 = recursos compartilhados" | Vem da lógica **medieval** de casas derivadas (a 2ª da 7ª = os bens do cônjuge). Lilly diz explicitamente. Legítimo e com fonte — só é **1647**, não séc. II | 12 §9.18 |
| "Casa 12 = inconsciente / karma / vidas passadas" | Paulo, 12º: sofrimentos, **parto**, inimigos, escravos varões, **quadrúpedes**; lugar de Saturno. Valente: **Mau Daimon**. Nada de inconsciente. Entra pela linha teosófica **Alan Leo → Rudhyar → Greene/Sasportas** | 03 §7.15 · 12 §9.2 |
| "Casa 12 = espiritualidade" | O lugar da religião, adivinhação e contato com o divino é a **9ª** — literalmente "o Deus", casa do Sol. Valente lista lá "the appearance of gods, divination; mystical or occult matters" | 12 §9.13 |
| "Casa 4 = a mãe, Casa 10 = o pai" | **É inversão.** Lilly, 1647: 4ª = **pai**, 10ª = **mãe**. Fírmico põe os pais nos **planetas** (Sol=pai, Lua=mãe). Valente põe pai na **9ª** e mãe na **3ª**. A versão moderna é a **única das quatro que nenhuma fonte sustenta** | 12 §9.3 |
| "Casa 11 = amigos, grupos, redes, causas coletivas" | Paulo põe **amizade e patrocínio no 3º**. No 11º põe "aliança, patrocínio e **boas expectativas**" (Bom Daimon). Valente atribui ao XI **filhos**. A carga "humanidade/coletivo" é uraniana, pós-1781 na melhor hipótese | 03 §7.17 · 12 §9.11 |
| "Casa 6 = rotina, saúde e pets pequenos" | Paulo, 6º: **Má Fortuna**, "a determinação que concerne **ferimento**". Rotina e trabalho diário não estão lá. E **os quadrúpedes estão no 12º em Paulo, não no 6º**. A divisão pequeno/grande é **renascentista** (Lilly, 1647: porcos, ovelhas, cabras — gato de apartamento não estava previsto por ninguém) | 03 §7.16 · 12 §9.10 |
| "Casa 2 = autoestima" | Nenhuma fonte antiga. O nome dela era **Porta do Hades** | 12 §9.9 |
| "O Ascendente é a máscara / como o mundo te vê" | Nas fontes é "o **leme**", "doador de vida e sopro", "a origem e o fundamento" (Paulo cap. 24), "os fundamentos de toda a genitura" (Fírmico II.19). É o **eixo estrutural**, não persona social. A leitura moderna é legítima e difundida — só **não é o que a tradição diz** | 03 §7.14 |
| "O Descendente mostra o parceiro ideal" | Paulo, 7º: "wedding preparations, long terms abroad, and **the quality of the death**". Casamento é **um** dos três tópicos | 03 §7.19 |
| "O Meio-do-Céu é sempre a cúspide da Casa 10" | **Falso em qualquer sistema de casas iguais ou inteiras.** Paulo cap. 30 avisa que o grau culminante cai às vezes no 9º e às vezes no 11º. 📐 **MEDIDO:** em Lisboa ocorre em **40,8%** dos instantes; em São Paulo, **22,0%** | 03 §7.8 · 12 §9.17 |
| "Todo sistema de casas dá quase o mesmo resultado" | 📐 **MEDIDO** em 20.000 mapas: Placidus × Casas Inteiras trocam **50,6%** dos planetas de casa em São Paulo, e **93,9%** dos mapas têm ao menos um planeta em casa diferente. Em Reykjavík, **66,8%** e **99,6%** | 03 §7.20 |
| "Angular = cardinal, sucedente = fixo, cadente = mutável" | Só é verdade num mapa com **Áries exatamente no Ascendente** — um em doze. São dois eixos independentes | 12 §9.6 |
| "As casas ruins são 6, 8 e 12" | É consenso de mercado, **de nenhuma fonte isoladamente**. Fírmico dá **2, 6, 8, 12** (aversão ao Ascendente). Ptolomeu, para prorrogação, rejeita **sete**. E a **3ª e a 9ª** são **boas** pelo critério de configuração — a 9ª "importantly aspected to the ascendant in trine" | 12 §9.4–9.5 |
| "Casa vazia = área sem importância" | Nem antiga nem moderna sustenta. A prática antiga lê o lugar pelo seu **regente** esteja ele onde estiver. Com doze casas e dez planetas, **casa vazia é a norma matemática** | 12 §9.7 |
| "As doze casas são doze áreas iguais da vida" | A antiguidade não tratava as doze como equivalentes: havia hierarquia tripla, lugares em que benéfico **deixa de funcionar** (Fírmico VI.I.7), e sete lugares descartados por Ptolomeu. **A democracia das casas é invenção do séc. XX** | 12 §9.14 |
| "Signo interceptado significa [x]" | É **artefato do sistema de casas**, função da latitude. Em Casas Inteiras e Iguais **não existe**. Somar leitura kármica a isso é empilhar invenção do séc. XX sobre artefato matemático | 03 §7.23 · 12 §9.16 |
| "Casas Inteiras é modinha de TikTok" | Holden publicou em **1982**, Hand em **2000/2007** (revisado por pares em *Culture and Cosmos*), Brennan em **2017**. E o sistema **nunca deixou de ser usado na Índia**. O que é moderno é o **nome em inglês** | 03 §7.10 |

---

## E · Planetas

| O mercado diz | A fonte mostra | Doc |
|---|---|---|
| "Urano rege Aquário desde sempre" | Urano foi **descoberto em 1781**. Aquário é domicílio de **Saturno** (Ptolomeu I.17). A atribuição a Urano é de **1825 (Smith) / 1828 (Varley)**, e em **1834** ainda não era aceita — um leitor de Zadkiel pergunta por que Herschel não tem casa nenhuma | 11 §8.3 |
| "Plutão rege Escorpião" | Descoberto em **1930**; na tradição, Escorpião é de **Marte**. **[DIS]** entre os próprios modernos: **Carl Payne Tobey propôs Áries**, e o melhor argumento sequencial moderno também dá **Áries**. Ou seja: a atribuição mais popular do mercado é a que o raciocínio moderno mais forte contradiz | 11 §8.4 |
| "Os benéficos são Júpiter e Vênus" | Incompleto. Ptolomeu I.5 lista **Júpiter, Vênus e a Lua**. E o **Sol não é benéfico**: é comum, junto com Mercúrio | 11 §8.1 |
| "Saturno e Marte são planetas ruins" | São maléficos por **excesso de qualidade elemental**. Valente I.1 diz que maléficos bem colocados **na própria seita** "are bestowers of good and indicative of the greatest positions and success" | 11 §8.2 |
| "Saturno é o planeta das lições e do amadurecimento" | **Liz Greene, 1976.** Nas fontes antigas Saturno é maléfico, e a leitura depende da **seita** | 15 §6 |
| **"Mercúrio retrógrado quebra aparelhos / não assine contratos"** | O que a fonte antiga diz é **atraso**: Valente — retrógrado "delay expectations, actions, profits, and enterprises", e a 2ª estação "cancels any delay". **Nada sobre tecnologia, contratos ou ex-namorados.** A expressão sequer aparece na imprensa geral antes de **1996** | 01 §3.18 · 11 §8.5 |
| "Retrogradação é rara" | 📐 **MEDIDO:** Saturno passa **36,3%** do tempo retrógrado; Júpiter, 29,9%; Plutão, 44,4%. **Em 85,9% dos dias há algum planeta retrógrado** | 11 §8.6 |
| "O período sombra (retroshade) faz parte do ciclo tradicional" | Termo dos anos **2010–2020**, com autoria disputada entre astrólogos vivos. Não existe em fonte antiga | 11 §8.7 |
| "Os graus de exaltação (Sol 19° Áries) vêm de Ptolomeu" | *Tetrabiblos* I.19 dá **só os signos**, e explica cada um pelo ciclo das estações. Os graus vêm de outras fontes | 01 §3.7 · 11 §8.8 |
| "Cazimi e combusto são doutrina de Ptolomeu" | Ptolomeu trata a relação com o Sol em I.8 como **qualidade térmica**, sem valores em graus. Os números (8°30', 17°) vêm da tradição medieval e chegam por Lilly | 11 §8.10 |
| "Plutão deixou de valer porque virou planeta anão" | Falso pelos dois lados. A reclassificação de 2006 é taxonômica astronômica e **não mudou nada** na prática astrológica — o que mostra que os dois campos não compartilham critério. Diga isso; não finja que compartilham | 11 §8.13 |

---

## F · A Lua e o calendário

| O mercado diz | A fonte mostra | Quem inventou / quando | Doc |
|---|---|---|---|
| **"'Superlua' é fenômeno astronômico clássico"** | É **termo de astrologia**. O nome técnico é *perigee syzygy*, e **não existe definição astronômica oficial**. A diferença é real (~14% de diâmetro) mas **imperceptível a olho nu sem comparação lado a lado**; o "gigantismo" no horizonte é a **ilusão lunar**. A previsão de estresse geofísico **não tem sustentação** | **Richard Nolle, astrólogo, 1979**, na revista *Dell Horoscope*. Virou popular só em **2011** | 04 §4.5 |
| **"Os nomes das luas cheias são ancestrais, dos povos originários"** | Meia-verdade perigosa. A lista padrão é do **Maine Farmers' Almanac dos anos 1930**, simplificada pelo Old Farmer's Almanac para um nome por mês. É *medley* de fontes algonquianas, inglesas coloniais, celtas e neopagãs. A lista impressa mais antiga é de **1918** (Beard, para os Boy Scouts) e **difere** da famosa. **"Lua do Lobo"** é [DIS] — boa parte das fontes dá origem **inglesa/celta**. **"Lua Rosa"** vem da flor *Phlox subulata* — **a Lua não fica rosa** | Almanaque americano, **anos 1930** | 04 §4 |
| "E no Brasil?" | A lista descreve o **ciclo agrícola do nordeste dos EUA** e chega ao Brasil com o **hemisfério errado**: "Lua da Neve" em fevereiro = pico do verão; "Lua da Colheita" em setembro = primavera. **O Brasil tem tradição lunar real e melhor**: o calendário de plantio caboclo/sertanejo/amazônida — crescente para folha e fruto, minguante para raiz, poda e corte de madeira | Prima direta da regra romana, via colonização ibérica | 04 §4.3 |
| **"Blue Moon é a segunda lua cheia do mês"** | **É um erro rastreado.** O *Maine Farmers' Almanac* usava para a **terceira lua cheia de uma estação que tem quatro**. Em **1946** o astrônomo amador **James Hugh Pruett** leu mal o artigo na *Sky & Telescope* e redefiniu como "segunda do mês". NPR repetiu em **1980**, o **Trivial Pursuit** cristalizou em **1986**, e a própria *Sky & Telescope* se corrigiu em **1999**. **Nenhuma das duas definições é antiga** | **Pruett, 1946** | 04 §4.4 |
| "Lua de Sangue é termo bíblico antigo" | A **imagem** é de **Joel 2:31**. O **termo** como nome de eclipse é do pastor **Mark Biltz (2008)** e de **John Hagee** (*Four Blood Moons*, **2013**). Astrônomos não usam. A profecia da tétrade não se cumpriu | **Biltz, 2008** | 04 §4.6 |
| **"As 8 fases da Lua são tradição milenar"** | Ptolomeu (*Tetr.* I.8) divide em **quatro** quartos com qualidades elementares. As **oito** fases com leitura de personalidade são de **Dane Rudhyar** | **Rudhyar, 1936** (*The Astrology of Personality*) / **1967** (*The Lunation Cycle*) | 04 §3.1 · 10 §13 |
| **"Lua Cheia é a fase de colher"** | **A fonte romana diz o contrário.** Plínio, *NH* XVIII.321: o que se corta, colhe e tosquia sofre menos dano na **minguante**. Columela XII.16.1: uva-passa na minguante. Na **cheia**, Columela manda **semear favas** | — | 04 §3.2 |
| "Lua Nova é o momento de plantar intenções" | Metade certa. **Plantar de verdade** na lua escura é fonte primária (Catão 40.1, *luna silente*; Paládio I.6.12). **"Plantar intenções"** é transposição moderna de cultura de manifestação | **Jan Spiller, *New Moon Astrology*, 2001** | 04 §5 |
| "Nodo Norte é seu propósito; Nodo Sul, vidas passadas — sabedoria védica" | **Não é védico.** O jyotish não lê Rahu/Ketu como indicadores específicos de carma | **Martin Schulman, *Karmic Astrology*, 1975**, com raiz na Teosofia do séc. XIX | 04 §5 |
| "Os antigos evitavam começar coisas com a Lua fora de curso" | Em Lilly (1647) é julgamento de **horária** ("nada virá deste assunto"), não regra de agenda. E a definição **helenística** (Antíoco, Porfírio) são os **30° seguintes**, ignorando fronteira de signo — período diferente do medieval | Regra de agenda cotidiana: **Al H. Morrison, ~1970** | 04 §5 |
| "Eclipses viram sua vida pessoal de cabeça para baixo" | Em Ptolomeu (*Tetr.* II.4–9) eclipse é astrologia **mundana**: países, cidades, reis, clima, epidemias. Aplicação individual **não vem de lá** | — | 04 §5 |
| "Saros é palavra babilônica para o ciclo de eclipses" | **Erro de nomenclatura de Halley (1691)**, tirado do *Suda*; *šār* é o número **3.600**. **Le Gentil apontou o erro em 1756** e ninguém corrigiu | **Halley, 1691** | 04 §5 |
| "A lua cheia aumenta partos, crimes, internações" | **Refutado.** Meta-análise de **Rotton & Kelly (1985)**, 37 estudos: nenhuma relação. O estudo de sono de Cajochen (2013) teve **falha de replicação** (Cordi et al., 2014) | — | 04 §5 |
| "A Lua fica 2 dias e meio em cada signo" | 📐 Média **~2,28 dias** (2d 6h40m), variando de **~1,95 a ~2,55** conforme a velocidade real | — | 04 §5 |

---

## G · Tarô

| O mercado diz | A fonte mostra | Quem inventou / quando | Doc |
|---|---|---|---|
| "O tarô sempre foi instrumento espiritual" | Foram **~350 anos exclusivamente jogo de cartas** de aposta e salão — e **ainda é jogado**: *Tarot français*, *Königrufen*, *Tarocchini*. A adivinhação entra no séc. XVIII. Diga: **~6 séculos de imagem, ~2,5 séculos de leitura** | Etteilla publica o primeiro método, **1783** | 05 §5.18 |
| "Os 22 Arcanos correspondem às 22 letras hebraicas — prova de origem cabalística" | Nenhum documento italiano dos séc. XV–XVII liga trunfos a letras. A coincidência 22↔22 é do próprio jogo italiano (21 trunfos + o Mato). E **os padrões históricos não têm todos 22 trunfos**: a Minchiate tem **40** — o que desmonta o argumento numerológico. Há **quatro sistemas incompatíveis** de correspondência | **Comte de Mellet, 1781** sugere; **Lévi, 1854** sistematiza; **Golden Dawn, 1888** muda de novo | 05 §5.5 · 14 §4 |
| "Os ciganos trouxeram o tarô do Egito" | Os Rom vêm do **noroeste da Índia** (linguística comparada, 1782–83), e as cartas já estavam na Europa antes. **Waite já refutava em 1911** | Boiteau (1854) e Vaillant (1857) | 05 §5.3 |
| "O Tarô de Marselha é o tarô mais antigo" | É um **padrão de impressão francês dos séc. XVII–XVIII** (Noblet c. 1650, Dodal c. 1701, **Conver 1760**). Os tarôs mais antigos que existem são os **italianos pintados à mão do séc. XV**. E o **nome** "Tarô de Marselha" foi popularizado por **Paul Marteau, Grimaud, 1930** | **Marteau, 1930** | 05 §5.6–5.7 |
| "O Rider-Waite é 'o tarô tradicional'" | É de **dezembro de 1909** (livro em 1911). Trocou Força↔Justiça, ilustrou os 56 menores com cena e reescreveu a iconografia sob chave Golden Dawn. Chamar de "tradicional" apaga **470 anos** de tarô anterior | Waite/Smith, **1909–1911** | 05 §5.8 |
| "Todo tarô tem 78 cartas" | Minchiate: **97**. Tarocco Bolognese: **62**. Siciliano: **64**. O 78 é o padrão que venceu, não o universal | — | 05 §5.17 |
| **"Carta invertida = energia bloqueada, é a leitura tradicional"** | **Em Waite (1911) a invertida costuma ser um significado *lateral*, e às vezes MELHOR que a direta.** Verbatim: **Roda da Fortuna invertida = "Increase, abundance, superfluity"**; **Imperatriz invertida = "Light, truth, the unravelling of involved matters, public rejoicings"**; **Imperador invertido = "Benevolence, compassion, credit"** | Leitura "bloqueio/excesso/interiorização": séc. XX (Gray, Pollack, Greer) | 05 §5.12 |
| **"A Estrela é a carta da esperança, tradicionalmente"** | **O caso mais chocante.** Waite, 1911: **"17. THE STAR.—Loss, theft, privation, abandonment; another reading says—hope and bright prospects."** A esperança é a **segunda** leitura, apresentada como "outra versão". Idem **O Eremita** ("treason, dissimulation, roguery, corruption") e o **Louco** ("Folly, mania, extravagance, intoxication, delirium, frenzy") | A leitura moderna **inverteu a prioridade** — e o motivo é estrutural: as **listas verbais** de Waite vêm da cartomancia francesa (via Mathers, 1888), enquanto as **imagens de Smith** carregam simbolismo Golden Dawn. **As duas metades do RWS não contam a mesma história**, e a leitura moderna seguiu a imagem | 05 §5.14 |
| "A carta da Morte nunca significa morte" | Waite, 1911: **"13. DEATH.—End, mortality, destruction, corruption."** A leitura "transformação" é escolha ética do séc. XX — **legítima, e o app deve mantê-la** — mas não a atribua a Waite | Séc. XX | 05 §5.13 |
| "A Cruz Celta é um método celta antigo" | O **nome** é de **Waite, 1911**. A estrutura vem de círculos da Golden Dawn dos anos 1890. Waite diz apenas que "tem sido usada em privado por muitos anos" — afirmação de autor sobre a própria prática | **Waite, 1911** | 05 §5.15 |
| "Passado/Presente/Futuro é a tiragem clássica" | Não está em Waite (que dá tiragens de 10, 42 e 35 cartas), não está no *Book T*. **Não encontrei fonte primária datada** para a tiragem de três nesse formato | Popularização do séc. XX, sem autor identificado | 05 §5.16 |
| "A tabela astrológica do tarô" | **Disputado por construção**: há pelo menos **três** (Golden Dawn, continental Lévi/Papus, Thoth de Crowley) mais o sistema à parte de Etteilla. **Nunca escreva "a correspondência astrológica" sem dizer de quem** | — | 05 §5.19 |
| "Os quatro naipes representam os quatro elementos desde a origem" | Os naipes vêm do baralho **mameluco** (taças, moedas, espadas, **tacos de pólo**) e circularam na Europa por **~400 anos sem doutrina elemental**. A atribuição é do séc. XIX e teve **versões rivais** | Séc. XIX; padrão GD **1888** | 14 §8.1 |
| "Tarô não pode ser comprado para si, tem que ser presenteado" | Sem fonte anterior ao séc. XX. Idem seda, cristal e lua cheia | — | 05 §5.21 |
| "Waite cita o *Manual of Cartomancy* como autoridade externa" | O *Manual of Cartomancy* foi publicado sob o pseudônimo **"Grand Orient" — que é o próprio Waite**. Ele se cita anonimamente | — | 05 §5.20 |

---

## H · Técnicas preditivas

| O mercado diz | A fonte mostra | Doc |
|---|---|---|
| "Seu retorno de Saturno é aos 29 anos" | 📐 **MEDIDO em 244 nascimentos:** a janela real é **28a5m a 29a10m** — **17,5 meses de amplitude**. Dizer "aos 29" erra uma parcela grande dos usuários | 13 §12.3 |
| "O retorno de Saturno é conceito da astrologia antiga" | O **período de 30 anos** é antigo (Valente IV.1 e IX.5). A **leitura como crise de amadurecimento aos 29** é do séc. XX — livro popular em **1940** (Grant Lewi), vocabulário psicológico com **Liz Greene, 1976**, cultura pop em 2000. E **Ptolomeu (IV.10) põe os 29 anos ainda no território do Sol** — Saturno só assume aos **68**. A "crise dos 40" tem mais lastro antigo que a "crise dos 29" | 13 §11 |
| "Netuno progredido está entrando em quadratura com seu Sol" | 📐 **Astronomicamente vazio: Netuno progredido anda 1,7° em 90 anos de vida.** Saturno, 3,8°. Progressão secundária é técnica de **Lua, Sol, Mercúrio, Vênus e Marte** — só | 13 §12.2 |
| "A revolução solar é o mapa do seu aniversário" | 📐 **Só por coincidência.** O instante do retorno desliza **~5,8h por ano** e cai no dia **anterior** ao aniversário em anos pré-bissextos. Seis horas ≈ 90° de Ascendente ≈ **três casas inteiras** | 13 §12.8 |
| "Direção por arco solar é um grau por ano" | 📐 O arco real varia de **0,9538°/ano** (nascidos em junho) a **1,0188°/ano** (nascidos em dezembro) — **2,60° de diferença acumulada aos 40 anos** | 13 §12.10 |
| "Profecção é palavra grega" | É **latina** — *profectio*, "partida". A tradição helenística **não tinha nome** para a técnica. 📐 `grep -i profect` na tradução integral de Riley de Valente retorna **zero** ocorrências | 13 §12.6 |
| "Profecção conta a partir do Ascendente" (como única forma) | Ptolomeu IV.10 manda profeccionar a partir de **cinco** lugares — Ascendente, Lote da Fortuna, Lua, Sol e Meio-do-Céu — cada um governando assunto diferente. **A profecção a partir do Sol tem fonte primária e não exige hora de nascimento** | 13 §12.7 |
| "Os gregos chamavam de Zodiacal Releasing" | Não chamavam de nada. O nome é de **Robert Schmidt, Project Hindsight, ~1996** | 13 §12.5 |
| "Trânsito exato = evento naquele dia" | Nenhuma fonte antiga promete data. Na fonte o trânsito é **gatilho** de um assunto já definido pelo senhor do tempo — não é o assunto | 13 §12.13 |

---

## I · Simbolismo comparado e correspondências

O erro estrutural mais elegante da lista, e o que mais gente comete sem perceber.

| O mercado diz | A fonte mostra | Doc |
|---|---|---|
| **"Se sistemas independentes chegam à mesma correspondência, isso prova que ela é verdadeira"** | **O argumento mais comum e o mais fraco.** Conjuntos com o mesmo número de itens se emparelham **por pressão de forma**, não por descoberta — e a prova é que emparelhamentos independentes chegam a resultados **incompatíveis**. Newton fez isso com as cores para chegar a sete | 14 §1 |
| "Os quatro elementos da astrologia são os das estações" | **Estruturalmente impossível:** triplicidade espaça 120°, estação ocupa 90°. Cada estação recebe **três** elementos e o outono não recebe nenhum signo de terra | 14 §8.2 |
| "Áries é fogo porque a primavera é quente" | Ptolomeu (I.10) diz que a primavera é **úmida**; a medicina humoral põe o **ar** na primavera. Áries é fogo por **seita solar** em Valente, não por clima | 14 §8.3 |
| "Na tradição, o leste é o fogo" | Em **Agrippa (1533)**, sim. Em **Ptolomeu (séc. II)**, o leste é **seco — terra** — e o fogo está no sul. Duas fontes canônicas, resultado oposto em 2 de 4 direções | 14 §8.4 |
| "Hipócrates descreveu os quatro temperamentos" | O tratado hipocrático descreve **humores, qualidades e estações**. Os quatro **tipos nomeados** (sanguíneo, colérico, melancólico, fleumático) se firmam bem depois, e **nem Galeno** os apresenta nessa forma | 14 §8.5 |
| "A semana planetária é imemorial" | **Dio Cássio, séc. III, chama o costume de "comparativamente recente"** e diz que os gregos antigos não o conheciam. E ele dá **duas** explicações diferentes para a ordem | 14 §8.9 |
| "A ordem caldaica é a ordem verdadeira, reconhecida por todos os antigos" | Havia pelo menos **duas ordens concorrentes**; Ptolomeu registra a disputa sobre Vênus e Mercúrio no *Almagesto* IX.1 | 14 §8.10 |
| "A correspondência planeta–metal é fixa desde a antiguidade" | Em **Olympiodoro (séc. VI)**, **estanho é de Mercúrio** e **electro é de Júpiter**. Duas das sete linhas mudaram | 14 §8.12 |
| "Os montes da mão seguem a ordem dos planetas" | 📐 Do indicador ao mínimo a mão dá Júpiter-Saturno-Sol-Mercúrio; a ordem caldaica daria Saturno-Júpiter-Sol-Mercúrio. **Invertido.** E sete planetas geram **oito ou nove** montes, porque Marte foi duplicado | 14 §8.13 |
| "A Golden Dawn seguiu o *Sefer Yetzirah*" | **Metade verdade.** Nos 12 signos, seguiu. Nos **7 planetas**, a tabela dela **não coincide com a das recensões antigas em nenhuma das sete linhas** — ela segue a Árvore de Kircher (1652), não o texto que invoca | 14 §4.4 |
| "A numerologia do tarô é a pitagórica" | A do tarô é **sefirótica** (*Book T*). Divergem em 3 casos, batem em 4, e as que batem são triviais. **No Cinco são opostas: casamento para os pitagóricos, crise no tarô** | 14 §5.3 |
| "As doze tribos de Israel correspondem aos doze signos, segundo a tradição judaica" | **Josefo oferece a leitura como uma entre duas possíveis e não fecha.** A tabela fechada é de **Agrippa, 1533**, e há listas concorrentes. A lista apóstolo↔signo é composição renascentista sem base neotestamentária | 14 §6.1 |
| "Os cinco elementos chineses e os quatro gregos são o mesmo sistema" | Cinco **fases cíclicas** com relações de geração e dominação *versus* quatro **composições** de duas qualidades binárias. Nem o número, nem a natureza, nem a função batem | 14 §8.8 |
| "Os 64 hexagramas codificam os 64 códons do DNA" | **Schönberger, 1973.** 64 = 2⁶ nos hexagramas e 4³ nos códons; a coincidência é trivial e o mapeamento é arbitrário — há bilhões de correspondências possíveis | 07 §6 |
| "Moedas e varetas no I Ching dão no mesmo" | 📐 **Falso, e é aritmética.** Varetas: 1/16, 5/16, 7/16, 3/16. Moedas: 1/8, 3/8, 3/8, 1/8 | 07 §3.3 |
| "A runa em branco é a runa de Odin" | **Ralph Blum, 1982.** **São 24 runas, não 25.** E "runa invertida = o oposto" não tem atestação — além de **várias runas do Elder Futhark serem simétricas**, o que torna a mecânica logicamente incoerente | 07 §4.4 |
| "As 18 runas armanen são as originais do Hávamál" | **Guido von List, 1902/1906/1908** — e é **perigoso**. O Hávamál lista 18 **encantos** e **não nomeia runa alguma** ali. Ver doc 07 §4.5 antes de qualquer arte rúnica | 07 §4.5 |

---

## J · Oniromancia e artes corporais

| O mercado diz | A fonte mostra | Doc |
|---|---|---|
| **"Água = emoção. Cair = perda de controle. Voar = liberdade."** | **Não está em Artemidoro** (que interpreta por sonhador e contexto) **e não está em Jung** (que usa amplificação, não equivalência). É pop-junguianismo de revista. Artemidoro escreveu um **manual de método**, com um livro inteiro (IV) sobre método, e o que ele **combate** é exatamente a equivalência fixa | 06 §1.3 |
| "Todo sonho prevê alguma coisa" | Falso pela própria fonte: o *enhypnion* (sonho de resíduo) **não prevê nada, por definição**, e é a maioria dos sonhos | 06 §1.3 |
| "A taxonomia dos cinco tipos de sonho é de Artemidoro" | Existem **duas** taxonomias quíntuplas distintas: a de **Artemidoro** (*idioi/allotrioi/koina/demosia/kosmika*, subespécies do sonho **alegórico**) e a de **Macróbio** (c. 430 d.C.: *somnium, visio, oraculum, insomnium, visum*). A internet mistura rotineiramente | 06 §1.3 |
| **"A linha da vida não diz nada sobre longevidade — isso é mito popular"** | **Metade falso, e é uma armadilha.** A ligação comprimento↔longevidade é **a afirmação mais antiga documentada da tradição inteira** (Aristóteles, *HA* I.15) e atravessa toda a *linea vitae* latina. **A regra de não falar disso está certa; a justificativa está errada.** A frase honesta: *"a tradição antiga ligava isso, sim; nós não usamos, porque não há base e porque assustar alguém com prazo de vida é irresponsável"* | 06 §2.3 |
| "Cheiro leu a mão de Mark Twain e Oscar Wilde" | Anedotas de **autopromoção do próprio Cheiro**. Não verificadas. Não use como prova de nada | 06 §2.3 |
| **"A tradição ocidental dos almanaques atribui um planeta a cada zona do corpo" (testa=Júpiter, bochecha=Marte…)** | **Não localizada em nenhuma fonte primária — e as três fontes que existem divergem dela.** **Cardano** (*Metoposcopia*, 1558) põe **os sete planetas na testa inteira**, em faixas. **Cocles** lê o rosto pelo **zodíaco** (Áries no alto da testa → Peixes no queixo). **Pseudo-Melampo**, o único texto antigo, **não tem planeta nenhum** | 06 §5.2 · 14 §9.7 |
| "Moleosofia é uma tradição antiga com esse nome" | A **prática** é antiga (pseudo-Melampo); o **nome** é cunhagem do séc. XX | 06 §5.3 |
| "Fisiognomonia é a leitura do caráter no rosto" | **É literalmente a tese de Lavater e de Lombroso** — e é a formulação que a história desta arte torna indefensável. Ver doc 06 §3.3, "A história feia". Fale de **estado e expressão**, nunca de caráter, criminalidade, inteligência, orientação ou etnia | 06 §3 |
| "Reflexologia podal" | **Fitzgerald, 1917; Eunice Ingham, 1938** — e sobretudo **é alegação de saúde**. Fora do app por regra fixa, independente de fonte | 06 §4.3 |

---

## K · Ciência, evidência e a moldura do produto

| O mercado diz | O que se sustenta | Doc |
|---|---|---|
| "Jung comprovou a astrologia" | Jung descreveu um experimento com horóscopos de casais em *Synchronicity* (**1952**) e **ele mesmo não o apresentou como prova causal** — propôs sincronicidade, um princípio *acausal*. O resultado é citado historicamente como caso de erro de amostragem. **Não cite Jung como evidência** | 02 §3.10 · 10 §14.16 |
| "Não há estudo sério sobre compatibilidade" | Há, e é enorme. **David Voas, *Ten million marriages* (2007)**, censo de 2001 da Inglaterra e País de Gales: **mais de 10 milhões de casamentos, todos os 144 pares**. Conclusão literal: *"astrological sign has **no impact** on the probability of marrying — and staying married to — someone of any other sign."* Maior desvio observado/esperado: **~1%** | 02 §3.11 |
| "Astrólogos concordam que Sóis harmônicos fazem casais durarem" | **Até quem tentou medir não achou o que a internet promete.** Ciro Discepolo (*Ricerca '90*, 1991), 2.116 casais dos arquivos Gauquelin, relatou que os pares com Sóis em **quadratura ou oposição** eram os mais numerosos entre os duradouros — o contrário da expectativa. Trate como alegação contestada | 02 §3.3 |
| "Estudos científicos comprovam a astrologia" | A literatura empírica vai majoritariamente **na direção oposta** (Dean & Mather 1977; **Carlson, *Nature*, 1985**; Dean & Kelly). O único resultado positivo relevante — o **efeito Marte** de Gauquelin — é disputado há décadas e **não valida signos nem aspectos** | 15 §6 |
| "Astrologia é ferramenta de autoconhecimento, e sempre foi" | **A segunda metade é falsa.** A astrologia antiga previa **eventos** — riqueza, casamentos, escravidão, tipo de morte — em tom moral-social e quadro fatalista. A moldura de autoconhecimento é de **Rudhyar, 1936**, com pré-história em **Alan Leo (1895–1917)** e razão parcialmente **jurídica** (os processos de 1914/17). **O app pode e deve usar essa moldura; só não pode dizer que ela é antiga** | 10 §14.10 |
| "'Não é previsão, são tendências'" | Também tem data: é a defesa de **Alan Leo nos processos de 1914/17**. Tem ~110 anos | 10 §13 |
| **"O horóscopo de jornal é tradição antiga"** | **Datável ao dia: 24 de agosto de 1930**, *Sunday Express*, **R. H. Naylor**, "What the Stars Foretell for the New Princess", sobre o nascimento da princesa Margaret. Virou a coluna semanal "Your Stars". **Em 1930 o jornal precisou explicar aos leitores o que era um horóscopo** | 10 §9.1 |
| "O signo solar sempre foi o centro da astrologia" | **É o erro estrutural do mercado.** Na tradição, o Sol é **um** dos sete planetas; o significador do indivíduo é o **Ascendente**; o caráter, em Ptolomeu, vem de **Mercúrio e da Lua**. A centralidade do Sol é consequência de **Alan Leo** (escala) e de **Naylor** (formato de jornal, que precisava de 12 caixinhas) | 10 §14.8 |
| "Ariano é impulsivo, escorpiano é intenso" | Caracterologia do séc. XX, de **Alan Leo** em diante, consolidada por **Linda Goodman, *Sun Signs*, 1968**. Não está em Ptolomeu nem em Manílio. **Pode ser usada — como o que é** | 01 §3.1 · 10 §13 |
| "A astrologia foi proibida pela Igreja e sumiu na Idade Média" | **O oposto é mais próximo.** Era **matéria de universidade** (Bolonha, Pádua, Paris, Florença), obrigatória na formação médica, e **papas renascentistas foram patronos**. O que fez a astrologia sumir do Ocidente latino foi o **colapso da infraestrutura técnica entre os séc. VI e XI** — não um decreto. Onde a perseguição foi sistemática foi em **Roma antiga**, e por razão **política** (prever a morte do imperador) | 10 §14.4, §14.7 |
| "Copérnico/Galileu/Newton derrubaram a astrologia" | **Kepler**, heliocentrista, praticava e reformava astrologia. **Lilly** vendia almanaques em massa um século depois de Copérnico. O declínio é do fim do séc. XVII, é **social e filosófico**, e foi **erosão, não refutação** | 10 §14.5 |
| "A astrologia nunca parou de ser praticada" | Há um **hiato de séculos (c. VI–XI)** em que a astrologia horoscópica não se pratica na Europa latina. Ela volta pela **tradução do árabe no séc. XII**. **A continuidade real passa por Bagdá, não por Roma** | 10 §14.17 |
| "A astrologia védica é a mãe da ocidental" | **Falso na direção.** A astrologia horoscópica indiana **importou** o núcleo helenístico — o vocabulário transliterado do grego prova: *horā, kendra, dreṣkāṇa, liptā, apoklima, jāmitra*. O *Yavanajātaka* significa literalmente "a astrologia dos jônios". Isso não a diminui: o jyotiṣa desenvolveu depois um aparato próprio e imenso (nakṣatras, daśās, vargas) sem equivalente ocidental | 10 §14.12 · 07 §1.3 |
| "A astrologia brasileira vem dos portugueses e da Escola de Sagres" | Construção de linhagem em página institucional. O que é documentável no Brasil começa no **almanaque de 1913** e se institucionaliza em **1969–1977** | 15 §6 |
| "'A astrologia diz que…'" | **Não existe "a astrologia".** Existem **cinco escolas** com critérios de validação incompatíveis. Toda frase nesse formato está escolhendo uma delas em silêncio | 15 §1, §6 |

---

## O que fazer com esta lista

1. **Antes de escrever:** procure a afirmação aqui. Se estiver na tabela, use a
   coluna do meio.
2. **Nada aqui obriga a apagar feature.** Obriga a **datá-la**. O tarô continua no
   app — com a informação de que Waite e Smith fizeram o baralho em 1909 e que a
   leitura como conhecemos nasceu em 1781. Isso é mais interessante que "segredo
   dos faraós", e tem a vantagem de ser verdade.
3. **Achou coisa nova?** Registre no documento do domínio, com grau e data de
   verificação, e traga para cá.
4. **Não achou a fonte?** Escreva "não encontrei fonte" e mande para o
   `99-o-que-falta.md`. Nunca preencha por dedução — "deve ser babilônico" não é
   datação.

---

*Base fechada em 31/07/2026. Dezesseis documentos, ~15 mil linhas. Nenhum arquivo
de código foi alterado por esta frente.*
