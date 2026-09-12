# Continuar amanhã

**Onde parou:** 12/09/2026, 01:40
**Tudo salvo em:** branch `madre-maria-fusao` (3 commits)
**Testes:** 2333, todos passando
**Publicado?** Ainda não

---

## O que ficou pronto hoje

A Madre Maria inteira agora vive dentro do Cosmic Guide, atrás do card
**"Sua reconquista começa aqui"** na tela inicial.

- As 21 telas dela, o tabuleiro de 365 dias, a voz, o véu de raspar
- Com as cores do Cosmic Guide, mas com a cara dela preservada (o fio vermelho
  continua vermelho)
- **Falando português, espanhol e inglês por inteiro** — as telas, as 419
  missões, as 36 cartas, as leituras
- Os dados dela guardados separados dos seus
- Peso reduzido: 35 MB → 18 MB (sem perder qualidade)
- Café e palma: **um só no app** — a Madre Maria usa os que você já tinha
- O Círculo ficou de fora (sua decisão)

---

## O que falta — 3 coisas

### 1. Os áudios em espanhol e inglês

**Você já autorizou.** Falta rodar.

São 62 gravações (31 em cada idioma), com a **mesma voz** que já está no app —
o ElevenLabs faz a mesma voz falar os três idiomas, não precisa clonar de novo.

| | |
|---|---|
| Custo | 7% do seu saldo (sobram 398 mil caracteres) |
| Gerador | pronto e testado, já está no servidor |

**Para ouvir antes:** `Downloads\MADRE-MARIA-VOZ-3-IDIOMAS\` — três provas da
mesma frase em PT, ES e EN.

> **Um detalhe que importa:** em 11 dos áudios o texto acende na tela junto com
> a fala, palavra por palavra. Esses precisam ser gerados com o texto traduzido
> já pronto (está), senão a Madre fala uma coisa e a tela mostra outra. O
> gerador já cuida disso — mede o tempo de cada frase automaticamente. Testei:
> a medição bateu com o áudio real no terceiro decimal.

### 2. Publicar

```bash
bash scripts/deploy-vercel.sh
```

⚠️ **Só esse comando.** Rodar `vercel deploy` na raiz derrubou a produção em
03/08.

### 3. As fotos do concorrente

Você mandou ~70 telas fotografadas. Falta eu estudar o layout e te dizer o que
dá para aproveitar no seu app.

---

## Duas coisas do outro app (o Fio Vermelho)

Não mexi lá, porque essa é a regra que você mesmo pôs. Mas achei e anotei:

**1. Tem um defeito no ar agora.** Em `madre-maria.vercel.app`, os rótulos
**"HOJE"** e **"AINDA DÁ"** do tabuleiro estão quase invisíveis — a cor sobre o
fundo escuro dá contraste 1,5 quando o mínimo aceitável é 4,5. O rótulo de
destaque ficou menos visível que o normal. Já está certo na cópia; no original,
não.

**2. Sua outra sessão trabalhou lá ontem.** Quatro commits entre 13:52 e 20:31:
nasceram 3 áudios novos (`profunda-11`) e o controle de velocidade da voz
(1× / 1,5× / 2×). **A cópia não tem isso** — ela é um retrato de antes. Se
quiser, peça para eu recopiar essa parte.

---

## Se precisar mexer no código

<details>
<summary>Regras da casa (abrir só se for editar)</summary>

1. **Nunca escrever em `C:\tmp\hilo-rojo`.** Ler e copiar de lá: à vontade.
   Editar ou commitar: nunca — você roda Claude e Codex no mesmo repositório.
2. **Nada de promessa.** O app convida, nunca garante que o amor volta. Vale nos
   três idiomas. Em espanhol: "tu" (nunca "vos"); a outra pessoa é sempre
   "esa persona", nunca "él/ella".
3. **Nada de inventar.** Sem dado real, devolve vazio. Nunca um resultado
   plausível-mas-falso.
4. **Teste novo tem que ser provado**: quebrar o código de propósito, ver o
   teste falhar, desfazer. Teste que passa com o código quebrado é decoração.
5. **Rodar um teste sozinho:**
   `node --require ./test/setup.js --test <arquivo>`
   (`import.meta` não funciona aí — usar `__dirname`.)
6. **Não traduzir:** `id`, `slug`, `tipo`, `audio` (nome de arquivo), e
   `fuente`/`obra` — são citações reais (A. E. Waite, *The Pictorial Key to the
   Tarot*). Traduzir o título faria a citação apontar para um livro inexistente.
</details>

<details>
<summary>As armadilhas que morderam hoje (para não repetir)</summary>

- **A tela da síntese não traduzia.** Os títulos saíam em inglês e o texto
  embaixo em português — 77 textos por idioma viviam fora do dicionário. É a
  tela que a pessoa recebe depois das 3 cartas.
- **Nomes vazando dentro de frases traduzidas:** *"Today's Moon is in Lua
  Cheia"*, *"Touro wants it done well..."*. Eram listas em português indexadas
  **por posição** — uma linha a mais numa tradução faria a lua de hoje virar
  outra fase, em silêncio.
- **O guarda da doutrina não reconhecia acento.** `"volta para voce"` ele
  pegava; `"volta para você"` passava batido — e é essa a grafia que a copy real
  usa. Três padrões estavam mortos por isso.
- **Vazamento de dados entre perfis — a terceira vez.** O "Apagar meus dados"
  usava uma lista escrita à mão, e toda chave nova nascia fora dela. Agora
  apaga por prefixo, e há um teste que inventa uma chave do futuro e exige que
  seja apagada.
- **O placar era cego:** mostrava só os 10 primeiros itens faltando, então
  apagar uma tradução já pronta não denunciava nada.
- **O Álbum já estava morto no app original** desde 01/09 — o teste que o
  vigiava passou verde dez dias vigiando uma porta lacrada.
- **Busca de texto engana:** `sorpresa.titulo` aparece no código, mas dentro de
  um comentário dizendo "aqui viviam...". Sempre conferir se é código ou
  comentário.
</details>

<details>
<summary>Suas decisões que estão no código</summary>

- Título: **"Sua reconquista começa aqui"** — você trocou o anterior ao ver que
  prometia o que uma terceira pessoa faria.
- Visual: cores do Cosmic Guide, **alma dela mantida inteira** ("mantém tudo").
- Funcionamento: **isolado** — "seria uma app dentro isolado".
- Café e palma: **um só no app**.
- O Madre Maria **continua no ar** em `madre-maria.vercel.app`. Isto aqui é uma
  cópia: mudança lá **não** atravessa para cá.
</details>
