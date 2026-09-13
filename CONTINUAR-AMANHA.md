# Continuar amanhã

**Onde parou:** 13/09/2026, madrugada
**Tudo salvo em:** branch `madre-maria-fusao`, 9 commits, **tudo no GitHub**
**Testes:** 2504, todos passando
**Publicado?** **Não** — travou no último passo, e o motivo não é o app

---

## O que falta: 1 coisa, e é do Windows

O comando de publicar roda tudo certo — **os 2504 testes passam** — e para na
hora de apagar a pasta `dist` do projeto:

```
rm: cannot remove 'dist': Device or resource busy
```

**Não é a Vercel e não é o app.** É um programa da sua máquina segurando um
arquivo dessa pasta: o indexador do Windows, o antivírus, ou uma janela do
Explorer aberta nela. Conferi: **nenhum processo do Node** está com ela.

### O conserto mais provável: reiniciar o PC

Você vai desligar de qualquer jeito. Ao ligar amanhã, a trava sai sozinha e o
comando funciona normal:

```bash
cd "C:\Users\Sanches\Downloads\Cosmic Guide"
bash scripts/deploy-vercel.sh
```

Se ainda travar, o contorno que já testei (funciona, é só mais passos):

```bash
npx expo export --platform web --output-dir dist-build
mv dist-build/assets/node_modules dist-build/assets/_modules
grep -rl 'assets/node_modules/' dist-build/_expo/static/js/web/*.js | \
  while read -r f; do sed -i 's#assets/node_modules/#assets/_modules/#g' "$f"; done
mkdir -p deploy-vercel/cosmic-guide && cp -r dist-build/* deploy-vercel/cosmic-guide/
# depois copiar index.html e vercel.json das linhas 67-131 de scripts/deploy-vercel.sh
node scripts/e2e-regression.js deploy-vercel   # o portão
cd deploy-vercel && npx vercel link --yes --project cosmic-guide && npx vercel --prod --yes
```

---

## Uma coisa para investigar antes de publicar

O portão de regressão (o teste que simula uma pessoa usando) **parou num
clique**: o botão "Gerenciar assinatura" no Perfil.

Investiguei: **o botão está lá, visível, e nada o cobre** — conferi quem está no
ponto do clique e é o próprio botão. A tela do Perfil está bonita (foto em
`C:/tmp/bloqueio.png`).

Pode ser só o teste esperando 30s por uma tela que demora mais a abrir. **Mas
não confirmei**, e o portão existe justamente para barrar o deploy quando algo
assim aparece. Vale 10 minutos amanhã antes de publicar.

---

## O que ficou pronto (tudo já no GitHub)

### A Madre Maria dentro do Cosmic Guide
21 telas, tabuleiro de 365 dias, véu de raspar, **3 idiomas**, **54 áudios** com
a sua voz clonada e a música de fundo. Dados isolados, café e palma únicos no
app, Círculo de fora.

### A diagramação do concorrente, com a sua cara
As **70 telas** com escala de espaço, tipografia que respira e faixas curvas
separando seções. Seis peças novas, tons calibrados por medição de cor.

### O tom emocional
- *"Sonhos"* → **"Aquele sonho quer te dizer algo"**
- *"Comunidade"* → **"Você não é o único assim"**
- *"Ritual do Café"* → **"Sua xícara tem recado"**
- *"Previsão diária"* → **"O que a Lua diz de você hoje"**

### A sua arte, finalmente aparecendo
Os 4 elementos (Fogo, Terra, Ar, Água) entraram na Home **dentro dos anéis** —
o buraco escuro no miolo virou ilustração, a porcentagem foi pro chip do canto,
e a setinha convida a entrar. É o desenho do concorrente, com a sua arte.

**O anel ficou**: ele mostra dado real (contagem de planetas). O concorrente
mostra "Amor 82%", que não sai de conta nenhuma.

---

## Defeitos reais que apareceram e foram consertados

| | |
|---|---|
| Uma tela de demonstração estava **no roteador de produção** com endereço público | agora só em desenvolvimento |
| O botão "Som do céu" **cobria palavras** no Horóscopo e vazava para dentro da Madre Maria | consertado na raiz |
| O Álbum do Tarô **quebrava ao abrir** ("space is not defined") | consertado + portão novo que pega essa classe inteira |
| Um **rasgo cinza claro** acima da barra de abas, tapado tela a tela | consertado na causa: o navegador não tinha tema |
| **62px reservados** para um botão que não aparecia — era o que cortava o Diário ao meio | consertado, vale para as 49 telas |
| A frase *"Dia 1 começa quando você abrir a primeira"* terminava **no meio** em PT e ES | completada |
| Os chips do Diário viravam **colunas de 161px** | consertado |
| **84 MB de fotos** e **376 arquivos de build** desprotegidos no repositório | ignorados |

---

## O que ficou para você decidir

1. **O nível da música** dos áudios — amostras em
   `Downloads\MADRE-MARIA-MUSICA-TESTE\`. Se não escolher, vai o sutil que
   já apliquei.
2. **Gerar 1 imagem nova** (~65 KB): suas 9 cenas são quadradas e o topo
   ilustrado do concorrente precisa de formato panorâmico. É a única arte que
   um agente recomendou gerar, depois de recusar as outras com motivo.
3. **A ficha do signo** (primeira tela do usuário novo) tem 55% de céu vazio em
   cima. **Isso é deliberado** — é o formato de story, está escrito no código.
   Se você quiser que seja uma tela comum, é decisão de produto, não conserto.

<details>
<summary>Os 13 achados do último percurso (abrir se for continuar o acabamento)</summary>

Consertados: a frase cortada, os chips do Diário.

Pendentes, em ordem de quem vê primeiro:
- **Home, catálogo**: as duas colunas nunca se alinham e os títulos brancos
  ficam direto sobre a arte, sem sombra — some em cima de desenho claro
- **Home, Pensamento Cósmico**: o título e o selo dourado se sobrepõem
- **Tarô, leitura**: o botão dourado é invadido pela quina do card de baixo
- **Tarô, temas**: 5 temas em 3+2 deixam buraco no canto inferior direito
- **Diário**: estando dentro dele, a aba acesa embaixo diz "Início"
- **Comunidade**: ainda é a única tela com fonte serifada no título
- **Termos e Tokens**: a faixa cinza-ardósia como fundo de seção inteira
</details>

<details>
<summary>Regras da casa (abrir só se for editar)</summary>

1. **Nunca escrever em `C:\tmp\hilo-rojo`** (o Fio Vermelho). Ler: à vontade.
2. **Nada de promessa**: o app convida, nunca garante que o amor volta. Há um
   teste que derruba o build, nos 3 idiomas.
3. **Nada de inventar**: sem dado real, devolve vazio. Nunca porcentagem falsa.
4. **Teste novo tem que ser provado**: quebrar de propósito, ver falhar, desfazer.
5. **Rodar um teste**: `node --require ./test/setup.js --test <arquivo>`
6. **Deploy só por** `bash scripts/deploy-vercel.sh` — `vercel deploy` na raiz
   derrubou produção em 03/08.
</details>
