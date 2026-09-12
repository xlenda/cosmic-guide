# As peças de diagramação — guia de uso

12/09/2026. Construídas olhando os 66 prints do concorrente, uma a uma.
A fundação (escala de espaço e tipografia) já existia em `theme.js`; estas são
as peças que **usam** aquela escala pra montar tela.

> **Não é sobre cor.** O dono disse "olha a elegância que tem no deles e não tem
> no meu" e depois corrigiu: **"NÃO É SÓ TEXTO, É DIAGRAMAÇÃO"**. O que separa
> os dois apps é onde as coisas ficam na tela, não a paleta.

---

## As seis peças

| # | Peça | Arquivo | Resolve |
|---|------|---------|---------|
| 1 | Faixa curva | `components/FaixaCurva.js` | tudo corre junto no mesmo fundo → parece lista |
| 2 | Coluna de leitura | `components/ColunaLeitura.js` | parágrafo de borda a borda |
| 3 | Tabela de dados | `components/TabelaDados.js` | ficha mostrada como texto corrido |
| 4 | Fileira de três | `components/FileiraDeTres.js` | três fatos soltos que deviam ser um bloco |
| 5 | Herói do topo | `components/HeroiDoTopo.js` | topo é barra de título, não composição |
| 6 | Lista com check | `components/ListaCheck.js` | negrito em tudo = negrito em nada |

Lógica pura por trás delas (é onde moram os testes):

- `lib/ondaPath.js` — o desenho da onda, determinístico e variável por semente.
- `lib/filtroDado.js` — a lei "nunca fabricar" virada em função.

Vitrine: `screens/PecasDemoScreen.js`, rota escondida **`/pecas`**
(nenhum menu leva até ela). Fotos em `design/pecas/`.

---

## 1 · A faixa curva — o recurso mais importante

Nos prints, **nenhuma linha reta corta a tela**. Cada bloco entra numa faixa
cuja borda de cima é uma onda, e a cor muda de faixa pra faixa. O olho lê
"mudou de assunto" sem precisar de título.

```jsx
<FaixaCurva tom="ameixa" semente="oferta">…</FaixaCurva>
<FaixaCurva tom="noite"  semente="sobre" grude>…</FaixaCurva>
<FaixaCurva tom="violeta" semente="dados" grude>…</FaixaCurva>
```

- **`semente` é obrigatória na prática.** É ela que faz cada faixa ter uma onda
  diferente. O nome da seção serve. Duas faixas com a mesma semente desenham a
  mesma curva — e onda repetida é papel de parede, que é o oposto do objetivo.
- **`grude`** em toda faixa que vem logo abaixo de outra (sobe −1px e mata o fio
  de antialias entre os dois preenchimentos).
- **Tons:** `noite` `ameixa` `violeta` `rosa` `dourado`. São a paleta do
  **Cosmic**, não a do concorrente — decisão do dono: trazer o recurso com a
  cara dele.
- **Duas a quatro por tela.** Cinco ou mais e volta a ser textura.

**Decisões que já foram medidas (não refaça o teste):**

- **SVG, não border-radius.** `react-native-svg ^15.12.1` **está** instalado
  (comentários antigos em `CosmicScene.js` e `ZodiacBody.js` dizendo que não
  são anteriores à instalação). O truque sem-SVG só produz um formato de curva:
  gira quanto quiser, é sempre a mesma elipse. A exigência era variar.
- **Translúcida, não opaca.** Testados os dois: opaca mata o céu do
  `CosmicScene` e o app perde a atmosfera. Alfa ~0.8 deixa as estrelas
  atravessarem e a mudança de chão ainda se lê. `opaco` existe pra quem
  precisar (paywall).
- **`violeta` era azul** (`rgba(80,88,168,.55)`): lia como outro app no meio das
  ameixas. Puxado pro `accent #9B6AC8`.
- **`dourado` a 0.14 era invisível** sobre fundo quase preto — acento que não
  acenta. Hoje é a mistura ameixa-quente já resolvida.

**O que substitui o quê:** `WaveDivider.js` desenha só a borda e nunca muda o
chão (segue servindo pra um corte solto). `BandaSection.js` muda o chão mas com
raio 40 nos quatro cantos, que lê como card gigante. Seção de verdade pede a
`FaixaCurva`. As duas continuam vivas — nada foi removido.

---

## 2 · A coluna de leitura

```jsx
<ColunaLeitura>
  <Text style={{ ...type.corpo, color: colors.textSecondary }}>…</Text>
</ColunaLeitura>

<ColunaLeitura centralizado>…</ColunaLeitura>
```

A largura sai de **caracteres por linha** (~45–75), calculada contra
`type.corpo.fontSize` — não de um número de pixels. Se a fonte crescer, a coluna
acompanha.

**Em 390px ela não faz nada, e é o certo:** no celular o texto já usa a tela
toda. O efeito aparece no tablet e na web, onde hoje a linha atravessa e ninguém
acha o começo da seguinte.

`centralizado` é a variante deles pra bloco curto de abertura. **Parágrafo de
sete linhas: alinhado à esquerda.**

---

## 3 · A tabela de dados

```jsx
<TabelaDados itens={[
  { chave: 'nome', rotulo: 'Nome',          valor: 'Guilherme' },
  { chave: 'nasc', rotulo: 'Data de nasc.', valor: '9 de jan. de 1989', pilula: true },
  { chave: 'hora', rotulo: 'Hora de nasc.', valor: null, convite: 'adicione sua hora', onPress: abrirForm },
  { chave: 'local', rotulo: 'Local',        valor: null },   // NÃO APARECE
]} />
```

**A lei de não fabricar, aplicada:**

| situação | o que acontece |
|---|---|
| tem valor | linha normal |
| sem valor, **com** `convite` | linha com o convite apagado (tocável se houver `onPress`) |
| sem valor e sem convite | **a linha não existe** |

Nunca traço mudo, nunca "não informado", nunca zero de enfeite.
**`0` e `false` são valores reais** e aparecem (o bug clássico do `if (!valor)`).

Nada sobrou → devolve `vazio` (ou nada). Moldura vazia é o que mais estraga app
bonito.

---

## 4 · A fileira de três

```jsx
<FileiraDeTres itens={[
  { chave: 'dias',   valor: '12', rotulo: 'dias seguidos' },
  { chave: 'cartas', valor: '48', rotulo: 'cartas viradas' },
  { chave: 'lidas',  valor: '7',  rotulo: 'leituras guardadas' },
]} />
```

Mesmo filtro da tabela. **Menos de duas colunas sobrando → a fileira não
desenha:** uma coluna sozinha não é comparação, é número perdido no meio da
tela.

**Não é lugar de porcentagem inventada.** O número sai de cálculo real — os
anéis de elementos da Home (10% Fogo, 60% Terra…) já saem do mapa de nascimento
e são justamente o que o concorrente **não** tem. Se uma diagramação pedir um
número que não existe, **a diagramação muda, não o dado**.

As colunas alinham pelo **topo**, não pelo centro: com um rótulo em duas linhas,
`center` desalinha os três números entre si — e é o alinhamento dos números que
faz a fileira ler como uma peça só.

---

## 5 · O herói do topo

```jsx
import { CENAS, mascoteDoSigno } from '../lib/ilustracoes';

<HeroiDoTopo fonte={CENAS.guia} titulo="…" apoio="…" />
<HeroiDoTopo grafico={<RodaDoZodiaco />} titulo="…" />
<HeroiDoTopo titulo="…" apoio="…" />   {/* sem arte: metade em céu vazio */}
```

**A lei desta peça: não monta fundo.** O fundo é `CosmicScene`. Dois fundos
brigando é pior que um fundo simples — aqui não há céu, nem estrelas, nem
colinas próprias. Só a arte, dissolvendo num gradiente até `colors.background`
pra emendar no cenário que já está lá. *(Há um teste que falha se alguém
plantar um segundo fundo aqui.)*

A arte vem de `lib/ilustracoes.js` — **reuse**, não crie um segundo pack.

**`resizeMode="cover"`, medido:** a arte do pack é quadrada (640×640) com fundo
claro próprio. Com `contain` o quadrado inteiro aparece e o céu claro do JPEG
desenha uma **caixa branca** no meio do app escuro — o oposto do print, onde a
arte sangra sem moldura.

**Sem arte é um estado desejável, não um remendo:** é o print da tela de uma
ideia só, com metade em céu vazio (`space.respiro`).

Não confundir com `components/HeroSection.js`, que é o cabeçalho da **Home**
(saudação + data + badge) e segue sendo dele.

---

## 6 · A lista com check

```jsx
<ListaCheck itens={[
  { chave: 'a', texto: 'As posições reais do céu' },
  { chave: 'b', texto: 'Seus talentos e forças', destaque: true },
  { chave: 'c', texto: 'O que pede atenção agora' },
  { chave: 'd', texto: 'Seus ideais interiores', destaque: true },
]} />
```

**O destaque é contado, não sugerido.** Passar `destaque` em mais de
`MAX_DESTAQUE` (3) itens não pinta todos: só os primeiros ganham. Um aviso em
`__DEV__` avisa quem passou demais. É a única forma de a raridade sobreviver às
52 telas — e a raridade **é** o efeito (471 usos de peso `800` contra dois de
peso leve foi o diagnóstico).

`alinhado` quando os itens tiverem mais de uma linha. Lista vazia → `null`.

E: **convida, nunca promete desfecho.** "Seus talentos secretos" convida;
"vai encontrar seu amor em 3 meses" promete, e o app não promete.

---

## Regras que valem pras seis

1. **Nada de número cru de espaço.** Sempre `space.grudado|junto|dentro|bloco|entre|secao|ar|respiro`. Há teste que falha se entrar número cru.
2. **Não reponha `fontWeight` depois do spread de `type.*`.** Se falta destaque e não é título, o que falta é espaço ou cor — não peso.
3. **390px e tela larga.** Nenhuma peça alarga o documento (medido: `scrollWidth === innerWidth === 390`; o bug de zoom-out das ondas não voltou).
4. **Estado vazio pensado em todas.** Nenhuma desenha moldura com nada dentro.
5. **`Platform.OS` dual.** Só View/Text/Image/Svg/LinearGradient — tudo roda igual em web e nativo. `Alert.alert` não aparece em nenhuma (é no-op na web).
6. **`notranslate`** onde entrar texto dinâmico — é responsabilidade de quem **usa** a peça, não da peça.
7. **Madre Maria:** aplique **espaço e diagramação**; a identidade dela (fio vermelho `#C1121F`, metal foil, véu, tabuleiro) fica intacta. As peças leem cor de `theme.js`; para usá-las lá, passe `style`/`cor` com os tokens dela — **não uniformize**.

---

## O confete de texto (o achado que muda a Home)

A Home tem **107 textos somando 2.481 caracteres — média de 23 caracteres cada**.
Não é parede de texto: é o oposto, cem pedacinhos pequenos demais pra valer que
juntos enchem a tela. O concorrente faz **poucos blocos, cada um com mais
conteúdo** (o "Como funciona?" deles é um título e um parágrafo de sete linhas,
e nada mais).

Por tela: Home 107 · Tarot 73 · Mapa 41 · Explore 24 · Horóscopo 17.

**Agrupar em menos blocos maiores. NADA SOME** — só para de estar espalhado em
107 caixinhas. A `ColunaLeitura` e a `FaixaCurva` são as duas peças que tornam
isso possível: um bloco maior só respira dentro de uma faixa com `space.secao`
em volta.

---

## Provas

- `npm test` — **2384/2384**, incluindo `test/diagramacaoPecas.test.js` (15).
- `npx expo export --platform web` — passa; `PecasDemoScreen` entra no bundle.
- Fotos em `design/pecas/` (390×844, três dobras + duas de tela larga).
- **Prova por mutação**, cinco mutantes, cada um pego por um teste:
  1. onda ignora a semente → *"sementes diferentes desenham ondas DIFERENTES"*
  2. crista zerada (vira rampa) → *"a onda é RASA e tem crista de verdade"*
  3. linha sem dado vira `"—"` → *"linha sem dado e sem convite SOME"*
  4. `if(!valor)` engole o zero → *"zero e false SÃO valores reais"* (2 testes)
  5. herói ganha estrelas próprias → *"o herói NÃO monta um segundo fundo"*
