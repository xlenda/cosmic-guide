# INVENTÁRIO DE ARTE — o que o dono JÁ TEM e o que a tela realmente mostra

**Data:** 12/09/2026 · **Medido, não suposto.** Nenhuma imagem foi gerada pra escrever isto.

**A lei desta obra:** COMPLEMENTAR, NUNCA SUBSTITUIR. Nenhum arquivo de
`assets/ilustracoes/` sai, é apagado ou é sobrescrito. Se uma composição nova
pedir arte nova, ela entra AO LADO.

**Leia este arquivo ANTES de pedir crédito de geração de imagem.** O achado
central é que a maior parte do "detalhe estiloso" que falta já existe no repo e
está morta no bundle.

---

## O NÚMERO QUE DECIDE TUDO

```
91 arquivos   1.166.748 bytes   1.139,4 KB   (1,11 MB)

USADA (renderiza em tela)        59 arquivos   ~789 KB    65%
MAPEADA MAS NÃO MOSTRADA          6 arquivos   ~ 56 KB     5%
ÓRFÃ (nem mapeada)               26 arquivos   ~287 KB    25%   ← 26 dos 91
```

**287 KB (25% do pack) nunca chegam a um pixel de tela.** São os 26
`tile-*.jpg`, um pack inteiro pago e esquecido. Antes de qualquer geração nova,
a pergunta é: por que gerar se um quarto do que existe está no escuro?

---

## 1. AS 91 ILUSTRAÇÕES — nome, peso, dimensão

Medido com `stat -c %s` + leitura do marcador SOF do JPEG (dimensão real do
arquivo, não a declarada em lugar nenhum).

### Mascotes dos signos — 12 arquivos, 101.005 B (98,6 KB), todos 256×256

| arquivo | KB | px |
|---|---|---|
| aquario.jpg | 10,7 | 256×256 |
| aries.jpg | 6,9 | 256×256 |
| cancer.jpg | 7,9 | 256×256 |
| capricornio.jpg | 8,0 | 256×256 |
| escorpiao.jpg | 9,6 | 256×256 |
| gemeos.jpg | 9,6 | 256×256 |
| leao.jpg | 8,4 | 256×256 |
| libra.jpg | 8,9 | 256×256 |
| peixes.jpg | 6,9 | 256×256 |
| sagitario.jpg | 7,9 | 256×256 |
| touro.jpg | 7,3 | 256×256 |
| virgem.jpg | 6,4 | 256×256 |

### Cenas (heros 640px) — 9 arquivos, 338.936 B (331,0 KB), todos 640×640

| arquivo | KB | px |
|---|---|---|
| cena-amor.jpg | 28,9 | 640×640 |
| cena-casal.jpg | 43,0 | 640×640 |
| cena-guia.jpg | 47,6 | 640×640 |
| cena-loja.jpg | 50,5 | 640×640 |
| cena-lua.jpg | 20,7 | 640×640 |
| cena-onboarding.jpg | 46,1 | 640×640 |
| cena-planeta.jpg | 25,3 | 640×640 |
| cena-sonho.jpg | 29,2 | 640×640 |
| cena-taro.jpg | 39,6 | 640×640 |

**São as maiores do pack** — 331 KB, 29% do peso total, em 9 arquivos.

### Planetas — 10 arquivos, 95.396 B (93,2 KB), todos 256×256

| arquivo | KB | px |
|---|---|---|
| planeta-jupiter.jpg | 6,8 | 256×256 |
| planeta-lua.jpg | 6,9 | 256×256 |
| planeta-marte.jpg | 9,6 | 256×256 |
| planeta-mercurio.jpg | 8,4 | 256×256 |
| planeta-netuno.jpg | 10,7 | 256×256 |
| planeta-plutao.jpg | 8,8 | 256×256 |
| planeta-saturno.jpg | 8,0 | 256×256 |
| planeta-sol.jpg | 10,4 | 256×256 |
| planeta-urano.jpg | 8,5 | 256×256 |
| planeta-venus.jpg | 15,1 | 256×256 |

### Elementos — 4 arquivos, 53.755 B (52,5 KB), todos 256×256

| arquivo | KB | px |
|---|---|---|
| elemento-agua.jpg | 12,3 | 256×256 |
| elemento-ar.jpg | 12,5 | 256×256 |
| elemento-fogo.jpg | 9,8 | 256×256 |
| elemento-terra.jpg | 17,9 | 256×256 |

### Função (banners dos cards) — 28 arquivos, 261.857 B (255,7 KB)

**Três são 512×512** — `funcao-calendario`, `funcao-diary`, `funcao-horoscope`.
Os outros **25 são 256×256**. Vale notar: o cabeçalho de `TILES` em
`lib/ilustracoes.js` afirma "512px, ~13KB/arquivo, 383KB o conjunto" — a
medição desmente. O conjunto tem **255,7 KB**, média **9,1 KB**, e só 3 dos 28
são 512px. O comentário está desatualizado.

| arquivo | KB | px |
|---|---|---|
| funcao-agir.jpg | 11,3 | 256×256 |
| funcao-birthchart.jpg | 5,7 | 256×256 |
| funcao-calendario.jpg | 7,6 | **512×512** |
| funcao-coffee.jpg | 9,9 | 256×256 |
| funcao-comovoceta.jpg | 11,3 | 256×256 |
| funcao-compatibility.jpg | 10,3 | 256×256 |
| funcao-descobrir.jpg | 9,7 | 256×256 |
| funcao-diary.jpg | 6,0 | **512×512** |
| funcao-dream.jpg | 6,8 | 256×256 |
| funcao-grounding.jpg | 8,3 | 256×256 |
| funcao-horoscope.jpg | 16,3 | **512×512** |
| funcao-idadereal.jpg | 10,7 | 256×256 |
| funcao-jornada.jpg | 11,6 | 256×256 |
| funcao-lunarCalendar.jpg | 4,6 | 256×256 |
| funcao-mitos.jpg | 9,4 | 256×256 |
| funcao-palm.jpg | 8,2 | 256×256 |
| funcao-profeccoes.jpg | 12,6 | 256×256 |
| funcao-progresso.jpg | 7,7 | 256×256 |
| funcao-quizcosmico.jpg | 6,4 | 256×256 |
| funcao-reconectar.jpg | 6,3 | 256×256 |
| funcao-retrolua.jpg | 4,7 | 256×256 |
| funcao-retrospectiva.jpg | 13,2 | 256×256 |
| funcao-rituais.jpg | 8,4 | 256×256 |
| funcao-social.jpg | 10,7 | 256×256 |
| funcao-tarot.jpg | 9,5 | 256×256 |
| funcao-timeline.jpg | 13,1 | 256×256 |
| funcao-wallpaper.jpg | 9,3 | 256×256 |
| funcao-zodiacbody.jpg | 6,2 | 256×256 |

### Tile (pack ÓRFÃO) — 26 arquivos, 294.238 B (287,3 KB), todos 256×256

| arquivo | KB | arquivo | KB |
|---|---|---|---|
| tile-agir.jpg | 13,4 | tile-palm.jpg | 10,1 |
| tile-birthchart.jpg | 7,0 | tile-profeccoes.jpg | 15,2 |
| tile-chat.jpg | 12,9 | tile-progresso.jpg | 9,2 |
| tile-coffee.jpg | 12,1 | tile-quizcosmico.jpg | 7,6 |
| tile-comovoceta.jpg | 13,6 | tile-reconectar.jpg | 7,6 |
| tile-compatibility.jpg | 12,9 | tile-retrolua.jpg | 6,3 |
| tile-descobrir.jpg | 11,7 | tile-retrospectiva.jpg | 16,0 |
| tile-dream.jpg | 8,7 | tile-rituais.jpg | 10,0 |
| tile-grounding.jpg | 10,0 | tile-social.jpg | 12,9 |
| tile-idadereal.jpg | 12,9 | tile-tarot.jpg | 11,5 |
| tile-jornada.jpg | 13,9 | tile-timeline.jpg | 15,7 |
| tile-lunar.jpg | 6,3 | tile-wallpaper.jpg | 11,3 |
| tile-mitos.jpg | 11,2 | tile-zodiacbody.jpg | 7,5 |

### Tiragens de tarô — 2 arquivos, 21.561 B (21,1 KB), 512×512

| arquivo | KB | px |
|---|---|---|
| tiragem-continuidade.jpg | 13,7 | 512×512 |
| tiragem-decisao.jpg | 7,4 | 512×512 |

---

## 2. AS TRÊS LISTAS

Método: para cada arquivo, grep do nome em `lib/ilustracoes.js` → pega a chave
exportada → grep de quem consome a chave em `screens/` e `components/` → leitura
do call site pra confirmar que existe um `<Image source=…>` de verdade e não só
um import. `deploy-vercel/` (build de saída) e `node_modules/` excluídos: são
cópia, não fonte.

### · USADA — 59 arquivos, ~789 KB

**12 mascotes** (`MASCOTES` / `mascoteDoSigno`) — o export mais bem aproveitado
do pack, 6 telas:

| arquivo | onde aparece |
|---|---|
| os 12 signos | `HomeScreen.js:1228` (badge do hero, `heroMascoteImg`) |
| | `BirthChartScreen.js:642` (mascote do Sol) e `:756` (nos regentes) |
| | `CompatibilityScreen.js:806` (SignSlot) e `:835` (PlacarSigno, medalhão 72px) |
| | `HoroscopeScreen.js:172` e `:273` (carrossel dos 12) |
| | `OnboardingPerguntasScreen.js:333` |

**8 das 9 cenas** (`CENAS`):

| arquivo | onde aparece |
|---|---|
| cena-casal.jpg | `CompatibilityScreen.js:459` — hero no estado antes do resultado |
| cena-taro.jpg | mapeada em `CENAS.taro` — ver ressalva abaixo |
| cena-lua.jpg | `LunarCalendarScreen.js:391` |
| cena-planeta.jpg | `CalendarioCosmicoScreen.js:892` |
| cena-sonho.jpg | `DreamScreen.js:663` e `:688` (via `HeroiDoTopo`, prop `arte`) |
| cena-amor.jpg | `PlanosScreen.js:378` (solo) |
| cena-onboarding.jpg | `PlanosScreen.js:378` (casal) |
| cena-loja.jpg | `LojaScreen.js:255` |

**10 planetas** (`PLANETAS` / `planetaImagem`):

| arquivo | onde aparece |
|---|---|
| os 10 planetas | `HomeScreen.js:551` (miniatura do próximo evento do céu) |
| | `CalendarioCosmicoScreen.js:330` e `:393` |
| | `HoroscopeScreen.js:178` (regente do dia) |

**27 das 28 funções** (`TILES` / `tileArte`) — chegam à tela por dois caminhos,
`components/CardGrid.js:53` (grade da Home) e `screens/ExploreScreen.js:57`
(ponto da constelação no Explorar); mais dois call sites diretos:
`CoffeeScreen.js:441` e `PalmScreen.js:521` passam `arte={tileArte('coffee')}` /
`tileArte('palm')`. As 24 chaves confirmadas nas duas telas: `horoscope`,
`comovoceta`, `birthchart`, `tarot`, `tarotAmor`, `compatibility`, `dream`,
`lunarCalendar`, `calendario`, `zodiacbody`, `retrolua`, `grounding`, `rituais`,
`jornada`, `palm`, `coffee`, `social`, `mitos`, `quizcosmico`, `wallpaper`,
`idadereal`, `diary`, `nosHoje`, `nossaHistoria`.

**2 tiragens** (`TIRAGENS` / `tiragemArte`): `TarotScreen.js:1403`, na escolha
de tiragem. Os dois ids (`past-present-future`, `situation-tension-next-step`)
batem com `TAROT_GUIDE_SPREAD_IDS` — ambas rendem.

### · MAPEADA MAS NÃO MOSTRADA — 6 arquivos, 56,2 KB

Estão em `lib/ilustracoes.js`, o Metro embala, o app carrega — e **nenhum pixel
chega à tela**.

| arquivo | KB | chave | por que está morta |
|---|---|---|---|
| **elemento-fogo.jpg** | 9,8 | `ELEMENTOS_ARTE.fogo` | ⬇ |
| **elemento-terra.jpg** | 17,9 | `ELEMENTOS_ARTE.terra` | ⬇ |
| **elemento-ar.jpg** | 12,5 | `ELEMENTOS_ARTE.ar` | ⬇ |
| **elemento-agua.jpg** | 12,3 | `ELEMENTOS_ARTE.agua` | ⬇ |

> **Os 4 elementos: `elementoImagem()` NÃO TEM UM ÚNICO CALL SITE NO APP.**
> `grep -n "elementoImagem(" screens/*.js components/*.js` devolve **zero
> linhas**. O `import { mascoteDoSigno, elementoImagem }` em
> `BirthChartScreen.js:29` é import morto. O próprio código conta o que houve,
> em `BirthChartScreen.js:566`:
> *"A arte do elemento saiu daqui: ela preenchia o miolo, e o miolo agora é do
> número."* — em 11/09/2026 o `AnelProgresso` (72px, a % no centro) tomou o
> lugar da ilustração.
>
> **Correção ao briefing:** não é que a Home não mostre os elementos — é que
> **NENHUMA tela mostra**. Os 4 espíritos pintados estão 100% fora de tela,
> em qualquer lugar do app.

| arquivo | KB | chave | por que está morta |
|---|---|---|---|
| **funcao-profeccoes.jpg** | 12,6 | `TILES.profeccoes` | o card que a consumiria está **comentado**: `HomeScreen.js:909` é uma linha `// { key: 'profeccoes', … }`. A chave existe no registro, o item não existe na grade. |
| **cena-guia.jpg** | 47,6 | `CENAS.guia` | único consumidor é `PecasDemoScreen.js:50` — a vitrine `__DEV__`. Em `App.js:126` ela é `__DEV__ ? lazy(...) : null` e a rota `/pecas` em `App.js:420` só existe em dev. **Nenhum usuário de produção vê esta cena.** (Contada acima entre as 8 cenas usadas por ser a mais alta do pack em KB — na prática é meia-morta: viva só em dev.) |

*(cena-guia conta uma vez. O total de 6 aqui = 4 elementos + funcao-profeccoes +
cena-guia.)*

### · ÓRFÃ — 26 arquivos, 294.238 B (287,3 KB)

Os **26 `tile-*.jpg`**. Prova mecânica: grep de cada nome de arquivo em todo
`.js`/`.json`/`.md` do repo, fora `node_modules/` e `deploy-vercel/`:

```
tile-agir.jpg          -> 0 refs      tile-palm.jpg          -> 0 refs
tile-birthchart.jpg    -> 0 refs      tile-profeccoes.jpg    -> 0 refs
tile-chat.jpg          -> 0 refs      tile-progresso.jpg     -> 0 refs
tile-coffee.jpg        -> 0 refs      tile-quizcosmico.jpg   -> 0 refs
tile-comovoceta.jpg    -> 0 refs      tile-reconectar.jpg    -> 0 refs
tile-compatibility.jpg -> 0 refs      tile-retrolua.jpg      -> 0 refs
tile-descobrir.jpg     -> 0 refs      tile-retrospectiva.jpg -> 0 refs
tile-dream.jpg         -> 0 refs      tile-rituais.jpg       -> 0 refs
tile-grounding.jpg     -> 0 refs      tile-social.jpg        -> 0 refs
tile-idadereal.jpg     -> 0 refs      tile-tarot.jpg         -> 0 refs
tile-jornada.jpg       -> 0 refs      tile-timeline.jpg      -> 0 refs
tile-lunar.jpg         -> 0 refs      tile-wallpaper.jpg     -> 0 refs
tile-mitos.jpg         -> 0 refs      tile-zodiacbody.jpg    -> 0 refs
```

**Zero. Nos 26.** O cabeçalho de `TILES` em `lib/ilustracoes.js` explica: em
10/09/2026 "o pack de linha fina virou ilustração pintada", e o registro passou
a apontar para `funcao-*`. O pack antigo `tile-*` nunca foi removido nem
religado. **Não apague** (lei 1: a arte dele fica) — mas saiba que nenhum deles
está no caminho de render, e por isso **`tile-*` NÃO deve ser proposto como
matéria-prima de composição nova**: é a geração ANTERIOR da mesma arte, em traço
de ícone de interface, que o próprio repo já julgou e substituiu.

---

## 3. OS DETALHES DO CONCORRENTE — 66 telas, e o que dá pra fazer com o que já existe

Lidas as 66 fotos de
`C:/Users/Sanches/Downloads/WhatsApp Unknown 2026-08-08 at 20.57.11`.
Referências citadas pelo timestamp do nome.

### (a) DÁ PRA FAZER COM A ARTE QUE O DONO JÁ TEM — 7 itens, custo 0 crédito

**A1. Os 4 elementos como ILUSTRAÇÃO GRANDE com nome e seta** ⭐ o pedido
original do dono, e o mais barato do inventário
- **Referência:** `20.55.48.jpeg` — "Seus elementos": quatro colunas, cada uma
  com um desenho colorido grande (chama, onda, montanha, redemoinho), o nome
  em azul-claro embaixo e um `>` convidando a entrar. A % é um chip pequeno no
  canto superior direito, subordinada ao desenho.
- **Arquivos:** `elemento-fogo.jpg`, `elemento-terra.jpg`, `elemento-ar.jpg`,
  `elemento-agua.jpg` — **já no repo, já mapeados, já embalados pelo Metro, e
  hoje invisíveis**. 52,5 KB que o usuário já baixa e nunca vê.
- **Como COMPLEMENTA (não substitui):** o `AnelProgresso` de
  `BirthChartScreen.js:570` é o que o Cosmic faz melhor que o concorrente (o
  próprio código diz isso em `:779`) e **fica**. A arte volta como camada de
  fundo do anel, ou ao lado dele, ou numa segunda superfície — não no miolo,
  que agora é do número. `elementoImagem()` já existe e devolve null com
  segurança: nada de contrato novo.
- **Doutrina:** a % de elemento é a ÚNICA porcentagem que o app permite
  (`HomeScreen.js:1295`), porque é contagem real de 10 planetas × 10. Continua
  vindo de `lib/elementos.js`. Nada inventado.

**A2. O topo ilustrado grande (terço superior da tela)**
- **Referência:** `20.55.50.jpeg` (roda do zodíaco dourada atrás de "Leitura
  Pessoal do Mapa Astral"), `20.55.54 (1).jpeg` (planeta nascendo sobre
  montanhas roxas), `20.55.59.jpeg` (Saturno no centro da roda).
- **Arquivos:** as 9 `cena-*.jpg` (640×640) + o componente **`HeroiDoTopo`, que
  JÁ EXISTE** em `components/HeroiDoTopo.js` e já lê `lib/ilustracoes.js`.
- **O achado:** `HeroiDoTopo` está usado **em uma tela só, e só em dev** —
  `PecasDemoScreen.js:49` e `:132`. `DreamScreen.js:688` é o único uso real em
  produção. A peça construída exatamente pra copiar este detalhe do concorrente
  está na prateleira. **Custo de ligar: 0 crédito de imagem.**

**A3. Medalhão redondo do signo flanqueando um resultado**
- **Referência:** `20.55.52.jpeg` — Capricórnio e Touro em medalhões redondos,
  o selo "99%" entre eles.
- **Arquivos:** os 12 mascotes. **Já feito e no ar:**
  `CompatibilityScreen.js:835` (`PlacarSigno`, 72px redondo) é este desenho.
  Nada a gerar; no máximo a replicar em outras telas.

**A4. Planeta pintado grande como assunto da tela**
- **Referência:** `20.55.56.jpeg` — Lua e Vênus em ~180px cada, lado a lado,
  com grau e signo por cima ("11°33′ Sagitário").
- **Arquivos:** os 10 `planeta-*.jpg`. Hoje aparecem só como **miniatura**
  (`HomeScreen.js:551`, `HoroscopeScreen.js:178`). São 256×256 — aguentam
  ~128pt em telas @2x sem borrar. O detalhe que falta é de ESCALA e composição,
  não de arte nova.
- **Limite honesto:** a 256px, um par em 180pt lado a lado começa a amolecer em
  @3x. Se o dono quiser o tamanho exato do print, aí sim vale reexportar os 10
  em 512 (ver B3) — mas 128pt resolve a maior parte da distância.

**A5. Fileira horizontal de planetas (a "régua" do sistema solar)**
- **Referência:** `20.55.56.jpeg`, terço inferior — 11 planetinhas em duas
  fileiras, ~40px cada, como amostra do que a leitura cobre.
- **Arquivos:** os mesmos 10 `planeta-*.jpg` a 40pt. Cabe com folga.
  Composição pura, 0 crédito.

**A6. Carrossel horizontal de mascotes**
- **Referência:** `20.55.48.jpeg` (Signo lunar / Ascendente em cartões pareados).
- **Arquivos:** os 12 mascotes — **já feito** em `HoroscopeScreen.js:273`.

**A7. Card com banner ilustrado sangrando de borda a borda + véu + texto por cima**
- **Referência:** `20.55.52.jpeg` (o cartão "Consulta Premium", ilustração
  cobrindo o card inteiro, texto branco sobre véu).
- **Arquivos:** as 27 `funcao-*.jpg` — **já feito** em `components/FeatureCard.js`
  (`arteFundo`, `position:absolute`, `width/height:100%`, mais o véu que a
  linha 84 explica). A cascata masonry de `CardGrid.js` já foi feita pela
  referência do dono.

### (b) SÓ COM IMAGEM NOVA — e sendo duro, como mandado

O concorrente tem **4** coisas que o pack do dono genuinamente não cobre. Listo
com o custo, e **recomendo gerar 2 delas**.

**B1. A roda do zodíaco (mandala astrológica) — NÃO GERAR COMO IMAGEM**
- **Referência:** `20.55.50.jpeg`, `20.55.59.jpeg`, `20.55.53.jpeg` (miniatura
  no card "Leitura do Mapa Astral pessoal").
- **O que é:** anel com os 12 glifos, divisórias de casa, linhas de aspecto
  cruzando o centro.
- **Veredito: NÃO custa crédito de imagem.** Isto é **desenho vetorial de dado
  real** — o app já calcula posições planetárias (`planetPositions`,
  `personalSky`) e já tem `react-native-svg`. `HeroiDoTopo` já aceita a prop
  `grafico` pra exatamente isto (`components/HeroiDoTopo.js:47`: *"OU um nó
  qualquer (Svg, a roda do zodíaco…)"*). Um JPEG de roda seria pior:
  estático, desalinhado com o mapa da pessoa, e mentiria sobre ser o céu dela.
  **Gerar imagem aqui é desperdício de crédito e de honestidade.**

**B2. Paisagem panorâmica de horizonte (o formato LARGO) — 1 a 3 imagens, VALE**
- **Referência:** `20.55.54 (1).jpeg` — montanhas roxas, água, sol laranja
  nascendo, ocupando o terço superior inteiro numa proporção ~16:7.
- **Por que o pack não cobre:** as 9 `cena-*` são **quadradas 640×640** com
  composição centrada. `HeroiDoTopo` é obrigado a usar `resizeMode:"cover"` num
  bloco 390×280 e **corta em cima e embaixo** — o próprio componente documenta
  isso na linha 71: `contain` desenharia "uma CAIXA BRANCA em volta da arte no
  meio do app escuro". Um panorama nasce na proporção certa e sangra sem perder
  composição.
- **Custo honesto:** **1 imagem** resolve (um horizonte neutro serve de topo
  para várias telas). No máximo 3, se o dono quiser variar por seção. Formato:
  **JPEG 1024×448** (~55-70 KB cada na compressão do pack).
- **Complementa:** entra AO LADO das 9 cenas quadradas, que continuam servindo
  onde o corte quadrado funciona.

**B3. Planetas em resolução de protagonista — reexportação, NÃO geração nova**
- **Referência:** `20.55.56.jpeg` (Lua ~180px), `20.55.59.jpeg` (Saturno ~200px).
- **Se e só se** o dono quiser o planeta no tamanho exato do print: os atuais
  são 256×256. **Não é arte nova — é o mesmo desenho em 512.** Se as fontes
  originais 512/1024 ainda existirem na pasta de geração, custo = **0 crédito**,
  só reexportar. Se não existirem, aí sim são 10 gerações — e **nesse caso
  recomendo NÃO fazer**: A4 a 128pt entrega 80% do efeito por 0.
- **Checar primeiro:** procurar os originais antes de pedir qualquer crédito.

**B4. Ilustração humana editorial (pessoas grandes, estilo flat-vetor claro) — NÃO GERAR**
- **Referência:** `20.55.53.jpeg` e `20.55.52.jpeg` — duas figuras humanas
  grandes, pele/roupa em tons claros (pêssego, azul-claro), folhagem verde,
  pontos de interrogação gigantes.
- **Por que o pack não cobre:** é outra família de arte. O pack do dono é
  "flat, corpo lavanda/violeta, acentos dourados, fundo índigo-noite" (cabeçalho
  de `lib/ilustracoes.js`); esta é vetor editorial claro com figura humana.
- **Veredito: NÃO GERAR.** Três motivos que se somam:
  1. **Quebra a família.** Entrariam duas linguagens visuais brigando — o mesmo
     erro que o comentário de `TILES` (10/09/2026) diz ter custado o pack
     anterior: *"o pack anterior desenhava com traço de ícone de interface um
     app que cita Culpeper 1653 — um anulava o outro."*
  2. **Serve a telas que o Cosmic não tem.** No concorrente essas figuras
     vendem "astrólogo humano em 24h" e "Consulta Premium". O Cosmic não vende
     astrólogo humano. Arte pra uma tela que não existe é crédito no lixo.
  3. **Puxa promessa de desfecho.** As telas que essas figuras ilustram dizem
     "Seu ex vai voltar para você?" e "Quando você vai se casar?" — exatamente
     o que o portão de encantamento honesto reprova.

### O que o concorrente tem e NÃO se copia (não é arte — é doutrina)

- **"Amor 82%", "99%" por tema** (`20.55.52.jpeg`): número inventado. O
  `HomeScreen.js:1364` já registra a decisão e `lib/synastry.js` já tirou a % do
  app inteiro. **Não entra, com ou sem arte nova.**
- **Prova social fabricada** (`20.55.53.jpeg`: "4.9 · 37.400+ pedidos",
  "100 mil+ leituras", "Jade de Nice pediu Horóscopo Chinês há 5 min"): sem dado
  real, a linha some.
- **Contagem regressiva fantasma** (`06:12`, `08:13`, `03:02` esmaecidos atrás
  do conteúdo em quase todos os prints): urgência falsa.
- **Badge "Premium" flutuante permanente:** decisão de funil, não de arte.

---

## 4. O PESO — hoje e depois

### Hoje

```
assets/ilustracoes/      1.166.748 B   1.139,4 KB   1,11 MB   91 arquivos
  ├─ 9 cenas 640px          338.936 B     331,0 KB   29,1%
  ├─ 26 tile 256px (ÓRFÃS)  294.238 B     287,3 KB   25,2%   ← nunca renderizam
  ├─ 28 funcao              261.857 B     255,7 KB   22,4%
  ├─ 12 signos              101.005 B      98,6 KB    8,7%
  ├─ 10 planetas             95.396 B      93,2 KB    8,2%
  ├─ 4 elementos             53.755 B      52,5 KB    4,6%   ← nunca renderizam
  └─ 2 tiragens              21.561 B      21,1 KB    1,8%
assets/ (tudo, com o áudio da Madre Maria)        61 MB
```

Contexto: o pack inteiro é **1,9% de `assets/`**. Os 18 MB de áudio da Madre
Maria dominam; arte não é o problema de peso deste app — mas isso não é licença
pra gerar à toa.

### Proposta

| item | arquivos novos | peso novo | crédito |
|---|---|---|---|
| A1 Elementos grandes | 0 | **0 B** | **0** |
| A2 Topo ilustrado | 0 | **0 B** | **0** |
| A3 Medalhão | 0 | **0 B** | **0** |
| A4 Planeta protagonista 128pt | 0 | **0 B** | **0** |
| A5 Régua de planetas | 0 | **0 B** | **0** |
| A6 Carrossel de mascotes | 0 | **0 B** | **0** |
| A7 Card com banner | 0 | **0 B** | **0** |
| B1 Roda do zodíaco | 0 (SVG de dado real) | **0 B** | **0** |
| **B2 Panorama de horizonte** | **1** (até 3) | **~65 KB** (até ~195 KB) | **1-3** |
| B3 Planetas 512 | 0 se os originais existirem | (só se necessário) | 0 ou 10 |
| B4 Figura humana editorial | **0 — recomendo não fazer** | 0 B | 0 |

```
Cenário recomendado (7 composições com arte existente + 1 panorama):
  antes    1.166.748 B   (1,11 MB)
  depois  ~1.233.000 B   (1,18 MB)
  delta       +65 KB      +5,7%       ·  1 crédito de imagem

Teto (3 panoramas):
  depois  ~1.362.000 B   (1,30 MB)
  delta      +195 KB     +16,7%       ·  3 créditos
```

**A conta que importa:** ligar os 4 elementos + o `HeroiDoTopo` que já existe
entrega o item nº 1 da lista do dono por **0 KB e 0 crédito**, porque os 52,5 KB
dos elementos **já estão no bundle que o usuário baixa hoje** — só não chegam à
tela.

---

## 5. PRÓXIMOS PASSOS, EM ORDEM DE RETORNO POR CRÉDITO

1. **Ligar `elementoImagem()`** ao lado do `AnelProgresso` em
   `BirthChartScreen.js` (o anel FICA — complementa). Desbloqueia 52,5 KB já
   baixados e entrega o pedido literal do dono. Custo 0.
2. **Levar `HeroiDoTopo` de `PecasDemoScreen` (dev) para as telas de conteúdo**,
   alimentado pelas `cena-*` e `planeta-*` existentes. A peça já está pronta.
   Custo 0.
3. **Descomentar ou remover `HomeScreen.js:909`** — decidir o destino de
   `funcao-profeccoes.jpg` (12,6 KB mapeados e invisíveis).
4. **Decidir sobre `cena-guia.jpg`** (47,6 KB, a mais pesada do pack, viva só em
   `__DEV__`): dar a ela uma tela de produção, ou aceitar que é peso de dev.
5. **Limpar os 2 imports mortos:** `elementoImagem` em `BirthChartScreen.js:29`
   e `CENAS` em `HomeScreen.js:19` (importado, nunca usado) — ou, melhor, torná-los
   vivos pelos passos 1 e 2.
6. **Só então** gerar o panorama (B2), com 1 imagem, aprovada antes de gerar.
7. **Nunca:** os 26 `tile-*` como matéria-prima (é a geração que o repo já
   aposentou), a figura humana editorial (B4), e qualquer porcentagem por tema.

---

**Este inventário não gerou nenhuma imagem, não tocou em nenhuma tela, não
apagou nenhum arquivo e não roda deploy. É só o mapa.**
