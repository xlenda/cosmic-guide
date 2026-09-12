# Continuar amanhã — Madre Maria dentro do Cosmic Guide

**Onde parou:** 12/09/2026, 01:03. Commit `0aee464`, branch `madre-maria-fusao`.
**Estado:** 2333 testes verdes. Nada quebrado. Nada publicado ainda.

---

## O que já está pronto

A Madre Maria inteira vive dentro do Cosmic Guide, atrás do card
**"Sua reconquista começa aqui"** da Home.

| | |
|---|---|
| 21 telas, 46 bibliotecas, o tabuleiro de 365 casas | ✅ |
| Alma preservada: fio vermelho, véu raspável, voz, tabuleiro | ✅ verificado item a item |
| Cores do Cosmic Guide (14 trocas num arquivo só) | ✅ |
| Dados isolados (prefixo `mm-hr.`) | ✅ |
| Mídia compactada: 35 MB → 18 MB | ✅ |
| Café e palma: **um só no app** (usa as telas do Cosmic) | ✅ |
| URL própria: `/amor` | ✅ |
| Círculo: fora (decisão sua) | ✅ |
| Tradução das telas | ⚠️ **632 de 775** — mas 127 das 143 são órfãs |
| Tradução do conteúdo (419 missões, cartas, leituras) | ✅ |
| Áudios em ES/EN | ❌ **nenhum dos 62** |

---

## O que falta — em ordem

### 1. A tradução — **já está pronta. Nada a fazer.**

Parecia faltar tradução, mas não falta. Conferi chave por chave.

O que "faltava" são textos de telas que **foram removidas do app**: o Círculo, o
Álbum, a Tirada, e as telas de café e palma dela (que agora usam as do Cosmic
Guide). Os textos ficaram guardados no arquivo, mas nenhuma tela os mostra —
é como guardar a plaquinha de um cômodo que foi demolido.

Traduzir aquilo seria trabalho jogado fora.

São 143 textos assim, todos anotados em `test/madremaria-i18n-orfas.js` com o
motivo de cada um. E tem um teste vigiando: **se alguém trouxer o Círculo de
volta um dia, o teste avisa** que aqueles 31 textos voltaram a valer e precisam
de tradução. Não some sem avisar.

**Resumindo: a Madre Maria já fala português, espanhol e inglês por inteiro.**

<details>
<summary>Detalhe técnico, se precisar mexer nisso depois</summary>

Os 143 estão agrupados assim: `circulo` 31, `cafe` 31, `album` 24, `mao` 22,
`leituras` 13, `tirada` 6, `missoes` 6, `hecho` 4, `barra` 3, `sorpresa` 2,
`scratch` 1.

Duas armadilhas para quem for conferir:

1. **Não julgue pelo prefixo.** Três chaves `tirada` estão VIVAS e já traduzidas
   (`avisoOtraPersona`, `carta.derecha`, `carta.invertida`) — usadas em
   `lib/lectura.js:964` e `components/CartaHilo.js:180`, mais
   `tirada.rotulo.${clave}` montada em runtime em `lectura.js:1053`.
2. **Busca crua engana.** `sorpresa.titulo` aparece em
   `OnboardingScreen.js:723` mas **dentro de um comentário** ("Aqui viviam a
   CARTA-SURPRESA…"). Sempre olhar se é código ou comentário.

Para checar uma chave:
```bash
grep -rn "t('NOME.DA.CHAVE')" madremaria/      # citação direta
grep -rnE "t\(\s*[\`']PREFIXO\." madremaria/   # montada em runtime
```
Placar: `node --require ./test/setup.js --test test/madremaria-i18n.test.js`
</details>

### 2. Os 62 áudios (31 ES + 31 EN)

**Autorizado por você.** A conta:

| | |
|---|---|
| Voz | `FioVermelho-Principal` — `b8boGhcWbCyPtZnKW69X` |
| Modelo | `eleven_multilingual_v2` (a mesma voz fala os 3 idiomas) |
| Plano | Pro — **398.944 caracteres sobrando** |
| Os 62 usam | ~28 mil (**7%**) |

**O gerador está pronto e testado:** `scratchpad/gerar-voz.py`, já no servidor em
`/root/gerar-voz.py`. Testado com 1 áudio ES: gerou, cronometrou 4 frases e a
duração bateu com o arquivo real (7,152 medidos × 7,151 reais).

**A armadilha:** dos 30 áudios, **11 acendem o texto na tela frase a frase** —
241 frases cronometradas. Esses precisam do texto traduzido **antes** de gravar,
senão a Madre fala uma coisa e a tela acende outra. São a apresentação (primeira
tela do funil) e a leitura profunda (6,7 minutos).

Ordem certa: terminar a tradução → montar o lote → gerar → conferir duração.

Provas de voz para ouvir: `Downloads\MADRE-MARIA-VOZ-3-IDIOMAS\`
(`prova-pt.mp3`, `prova-es.mp3`, `prova-en.mp3` — a mesma voz nos 3 idiomas).

### 3. Ver funcionando e publicar
```bash
npm test                                    # 2333, tem que estar tudo verde
npx expo export --platform web --clear      # o build tem que fechar
bash scripts/deploy-vercel.sh               # ÚNICO jeito de publicar
```

⚠️ **Nunca** `vercel deploy` na raiz — derrubou produção em 03/08.

### 4. As fotos do concorrente
Você mandou ~70 telas fotografadas. Falta **estudar o layout e dizer o que dá
para complementar** no seu app.

---

## Regras que valem para quem continuar

1. **Nunca escrever em `C:\tmp\hilo-rojo`** (o Fio Vermelho). Ler e copiar de lá:
   à vontade. Editar, criar ou commitar lá: nunca — você roda Claude e Codex no
   mesmo repo. Achou defeito lá? Relate, não conserte.
2. **Encantamento honesto** (`madremaria/theme.js:80`): nunca um desfecho, nunca
   uma promessa sobre o que a outra pessoa vai fazer. Vale em todo idioma.
   ES em "tu" (LatAm neutro, nunca vos/vosotros). A outra pessoa é sempre
   "esa persona" / "that person" — nunca él/ella/him/her.
3. **Não fabricar**: sem dado real, devolve nulo. Nunca inventa resultado.
4. **Teste novo exige prova por mutação**: quebrar de propósito, ver falhar,
   desfazer. Teste que passa com o código quebrado é decoração.
5. **Runner dos testes**: `node --require ./test/setup.js --test <arquivo>`.
   Ele transpila para CommonJS (alvo Hermes) — `import.meta` é **erro de
   sintaxe** ali, usar `__dirname`. (Isso custou meia hora.)
6. **Não se traduz**: `id`, `slug`, `tipo`, `grupo`, `audio` (nome de arquivo,
   `require` estático), e **`fuente` / `obra`** — são citações reais
   (A. E. Waite, *The Pictorial Key to the Tarot*). Traduzir o título faria a
   citação apontar para um livro que não existe.

---

## O que os revisores acharam hoje (tudo consertado)

Vale ler antes de mexer — são armadilhas que já morderam:

- **A tela central não traduzia.** `lectura.js` guardava ~9 mil caracteres fora
  do dicionário: os rótulos saíam em inglês e o texto embaixo em português, na
  tela que a pessoa recebe depois das 3 cartas.
- **Nomes congelados vazando** dentro de frases traduzidas: *"Today's Moon is in
  Lua Cheia"*. Fases, planetas e signos eram listas em PT **indexadas por
  posição** — mudar a ordem faria a lua de hoje virar outra fase, em silêncio.
- **Três padrões da doutrina estavam mortos**: `\b` depois de palavra acentuada
  nunca casa em JS. `"volta para voce"` era pego, `"volta para você"` passava —
  e é essa a grafia que a copy real usa.
- **Vazamento entre perfis** — a **terceira vez** desta mesma classe de bug
  (01/08, 11/09 de manhã, e ontem). A causa sempre foi a mesma: lista literal de
  chaves, e toda chave nova nascia fora dela. Agora varre **por prefixo**, e há
  teste que inventa uma chave do futuro e exige que seja apagada.
- **O placar era cego**: nomeava só as 10 primeiras faltantes, então apagar uma
  tradução já entregue não denunciava nada.
- **O Álbum já estava morto no app original** desde 01/09 — o teste que o
  vigiava passava verde há dez dias vigiando uma porta lacrada.

---

## Decisões suas que estão no código

- Título: **"Sua reconquista começa aqui"** (você trocou o anterior ao ver que
  prometia o que uma terceira pessoa faria).
- Visual: cores do Cosmic Guide, **alma dela mantida inteira** ("mantém tudo").
- Funcionamento: **isolado** — "seria uma app dentro isolado".
- Café e palma: **um só no app**, a Madre usa os do Cosmic.
- O Madre Maria **continua no ar** em `madre-maria.vercel.app`. Isto é cópia:
  mudança lá **não** atravessa para cá.

---

## Dois avisos sobre o outro app (não mexi, é a regra)

1. **Bug de contraste no ar**: em `madre-maria.vercel.app`, os rótulos "HOJE" e
   "AINDA DÁ" do tabuleiro e o link do mapa estão quase invisíveis — contraste
   1,5 onde o mínimo é 4,5. Corrigido na cópia; **no original, não**.
2. **Sua outra sessão andou**: 4 commits no Fio Vermelho em 11/09, entre 13:52 e
   20:31. Nasceram 3 áudios (`profunda-11` nas três versões) e o controle de
   velocidade da voz (1× / 1,5× / 2×). **A cópia não tem isso** — é um retrato de
   antes. Se quiser, é só pedir para recopiar a parte que mudou.
