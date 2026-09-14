# Ampliar as artes — o que eu medi, e por que parei

**14/09/2026.** O dono disse *"as imagens dele são muito melhores que as minhas,
faça melhor"*. Fui medir antes de mexer. **Nada foi trocado** — este arquivo
existe pra ele decidir com número na mão, não com impressão.

---

## 1. O diagnóstico: o problema é RESOLUÇÃO, não estilo

Medido no navegador, celular retina (3×), no app publicado:

| grupo | tem | exibe em | precisa | veredito |
|---|---|---|---|---|
| mascotes dos signos | 256px | 64px | 192px | **OK**, sobra 64px |
| planetas | 256px | 44px | 132px | **OK**, sobra 124px |
| elementos | 256px | 72px | 216px | **OK**, sobra 40px |
| tiragem (cartas) | 512px | 110px | 330px | **OK**, sobra 182px |
| **funcao-\* (cards)** | **256px** | **153px** | **459px** | **estica 1,8×** |
| **cena-\* (heróis)** | **640px** | **390px** | **1170px** | **estica 1,8×** |

**Só 2 dos 6 grupos têm problema** — 37 arquivos de 91. Os outros 54 já têm
resolução de sobra e **não devem ser tocados**.

E o estilo não é o problema: comparei a `funcao-compatibility.jpg` do dono com
uma arte gerada do zero. A dele tem casal desenhado de costas com dobra na
roupa, cabelo com volume, colina com textura pontilhada, estrelas de brilhos
variados. A gerada saiu com duas silhuetas chapadas e um coração genérico.
**O desenho dele é melhor; o que falta é tamanho.**

---

## 2. Caminho A — LANCZOS (ampliação matemática): **ganho ZERO**

| | nitidez na tela (459px) |
|---|---|
| hoje, 256px esticado pelo navegador | 23,2 |
| LANCZOS 768px, navegador reduz | 23,3 |

**Ganho: +0,1.** Interpolação não inventa detalhe que a origem não tem — os
256px seguem sendo 256px de informação. O arquivo ficaria **7× mais pesado**
(10 KB → 72 KB), e os 37 arquivos passariam de **587 KB para ~4 MB** por ganho
invisível.

*(A queda de nitidez 62 → 12 que aparece medindo em 768px é artefato da métrica:
laplaciano mede contraste entre pixels vizinhos, e ao ampliar a mesma borda é
descrita por 3× mais pixels. O teste honesto é comparar na escala em que a arte
**aparece**, e foi o que a tabela acima faz.)*

---

## 3. Caminho B — IA do Cloudflare: **descartado, com prova**

A conta tem 13 modelos de imagem. Nenhum faz super-resolução; a lista é toda
*Text-to-Image*.

**`flux-2-klein-4b`** — aceitou a imagem por `multipart` e devolveu **HTTP 200**
nas quatro formas testadas, inclusive na que não mandava imagem nenhuma.
O que voltou foi uma **gárgula de madeira sobre fundo preto**. Distância de cor
para o original: **151** (referência: < 30 = mesma paleta). Ele ignorou a
entrada e gerou do nada. *Um 200 não prova que a imagem foi usada.*

**`sd-1.5-inpainting`** — o único marcado como image-to-image. Recusou o
multipart (HTTP 400).

**`flux-2-klein-9b`** — o único que **de fato usou** a imagem. Distância de cor
**13,5**, composição preservada (casal de costas, lua grande, colinas pastel,
céu índigo), 1024×1024. Parecia a solução. Mas medindo o traço:

| | pixels escuros (o contorno) | famílias de cor |
|---|---|---|
| original do dono | **43,2%** | **602** |
| klein-9b | 39,2% | 388 |

Sumiu o contorno escuro que marca o pack, e a textura pontilhada das colinas
virou degradê liso. As figuras ficaram mais realistas no lugar do desenho fofo.
**É redesenhar, não ampliar** — outro desenho com a mesma composição.

E o repo tem quatro portões cuja lei é literal — *"a arte complementa, não
substitui"* (`missoesArte`, `elementosNaHome`, `fraseDoAmorNaHome`,
`madremariaMontagem`). Trocar 37 arquivos por versões redesenhadas por IA é
exatamente o que essa lei proíbe. **Por isso parei aqui.**

---

## 4. Caminho C — encolher o card: conserta e piora

Sem tocar na arte, basta o banner exibir menos largura:

| banner | tela 2× | tela 3× |
|---|---|---|
| 153px (hoje) | estica 1,20× | estica 1,79× |
| 128px | não estica | estica 1,50× |
| 96px | não estica | estica 1,12× |
| 85px | não estica | **não estica** |

Funciona — e **custa a diagramação**. O banner ilustrado grande é justamente o
recurso do concorrente que o dono pediu. Trocar nitidez por card pequeno é
desfazer o trabalho de 12/09.

---

## 5. O que eu recomendo

**Gerar as 37 artes em 1024px no mesmo motor que fez o pack original.** As 28
`funcao-*` e as 9 `cena-*` nasceram de um gerador pago com um estilo definido;
refazê-las lá, com o mesmo prompt e a mesma semente, dá resolução **sem trocar
o traço** — que é a única coisa que nenhum dos três caminhos acima entrega.

Isso gasta crédito, e a regra da casa é **aprovar antes de gerar**. Fica para o
dono decidir.

**Enquanto não decidir, o app fica como está** — e está honesto: a arte é dele,
o desenho é bom, e o borrão só aparece em tela retina grande. É o menor dos
defeitos que esta sessão encontrou.

---

## Regra pra quem continuar

1. **Não trocar arte por versão de IA** sem o dono ver lado a lado. A lei do
   pack é complementar, nunca substituir — e há 4 testes que a defendem.
2. **Não ampliar por interpolação** achando que resolve: medido, ganho +0,1.
3. **Não mexer nos 54 arquivos** que já têm resolução de sobra.
4. **HTTP 200 não é prova.** O `klein-4b` respondeu 200 e devolveu uma gárgula.
   Confira a cor média contra o original antes de aceitar qualquer resultado.
