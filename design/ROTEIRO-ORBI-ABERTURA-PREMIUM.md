# Roteiro do Órbi — abertura premium antes das perguntas

> Objetivo único: fazer a pessoa entender, em menos de cinco segundos, que três
> respostas mudarão de verdade o caminho mostrado pelo Cosmic Guide.

## 1. Direção criativa

**Sensação:** íntima, elegante e segura. Não infantil, não “chatbot”, não
trailer de ficção científica.

**Assinatura visual:** Órbi é uma bússola/astrolábio vivo. A frase inicial nasce
dentro do aro central como se o personagem estivesse focalizando a questão da
pessoa. Essa “lente” é o gesto visual exclusivo da marca.

**O risco escolhido:** uma abertura quase silenciosa, com muito espaço vazio e
um único objeto em movimento. O acabamento precisa vir de timing, tipografia e
luz, não de mais partículas ou gradientes.

**Não usar:** túnel roxo, chuva de estrelas, texto digitando letra por letra,
órbitas girando sem parar, voz automática ou Órbi quicando.

## 2. Sistema visual da abertura

- Fundo: ameixa quase preto `#0B0712`.
- Superfície próxima: `#151019`.
- Texto principal: marfim `#FAF5EA`.
- Texto secundário: névoa `#C9BFCB`.
- Metal do Órbi/ação: ouro fosco `#E3B85F`.
- Acento secundário, usado uma vez: ametista apagada `#9B6AC8`.
- Título futuro: uma display inspirada em inscrições/almanaques, sem aparência
  medieval caricata.
- Corpo e botões: sans limpa, aberta e muito legível.

Na implementação, a fonte nova só entra depois de ser incluída como asset e
validada no Expo. Até lá, manter a fonte atual é melhor do que depender de fonte
remota ou causar troca visível durante o carregamento.

## 3. Roteiro visual — entrada curta, sem bloquear a pessoa

Na implementação publicada, as quatro camadas terminam em menos de um segundo;
a tela permanece parada até a pessoa escolher como continuar.

### Cena 1 — a pergunta encontra foco · 0–0,43 s

- Tela escura.
- O aro de Órbi entra 6 px de baixo para cima e desacelera sem quicar.
- Uma linha dourada curta se expande através do centro do aro.
- O ponteiro faz parte do asset atual e não é animado separadamente.

**Texto revelado pela lente:**

> Tem algo que você quer entender melhor hoje.

Não usar interrogação. A frase acolhe sem exigir uma resposta em voz alta.

### Cena 2 — apresentação · 0,15–0,58 s

- A apresentação aparece abaixo, centralizada e com hierarquia editorial.

**Órbi:**

> Eu sou Órbi.

> Responda três perguntas curtas e eu organizo seu primeiro caminho.

### Cena 3 — prova da promessa · 0,30–0,73 s

- Três pequenos traços entram juntos; o primeiro recebe o ouro da etapa atual.
- Cada traço representa uma pergunta; não são cards nem ícones coloridos.

**Texto:**

> Cada escolha muda o próximo passo. Você continua no controle.

Essa promessa é verificável: intenção, situação e resultado desejado já mudam a
ordem do plano inicial. Não dizer “tudo será único” ou “nada será genérico”.

### Cena 4 — decisão · 0,45–0,88 s

- Botão e link sobem 8 px e desaceleram sem salto.

**Botão principal:**

> Começar meu caminho

**Link secundário:**

> Já sei meu signo

**Ação discreta no canto superior desde o primeiro frame:**

> Pular introdução

Ao tocar no botão: escala para `0.985`, vibração leve e troca para a primeira
pergunta. Nunca reproduzir áudio automaticamente.

## 4. Texto final nos três idiomas

### Português

1. Tem algo que você quer entender melhor hoje.
2. Eu sou Órbi.
3. Responda três perguntas curtas e eu organizo seu primeiro caminho.
4. Cada escolha muda o próximo passo. Você continua no controle.
5. **Começar meu caminho**
6. Já sei meu signo
7. Pular introdução

### Espanhol

1. Hay algo que quieres entender mejor hoy.
2. Soy Orbi.
3. Responde tres preguntas breves y organizaré tu primer camino.
4. Cada elección cambia el siguiente paso. Tú mantienes el control.
5. **Empezar mi camino**
6. Ya sé mi signo
7. Omitir introducción

### Inglês

1. There’s something you want to understand more clearly today.
2. I’m Orbi.
3. Answer three short questions and I’ll shape your first path.
4. Each choice changes what comes next. You stay in control.
5. **Start my path**
6. I know my sign
7. Skip introduction

## 5. Voz do Órbi

A abertura funciona inteira sem áudio. Enquanto não houver provedor de voz
neural, não usar a fala do navegador.

Quando houver voz real, ela será opcional e iniciada por toque em “Ouvir Órbi”.
O roteiro falado é uma versão curta, sem repetir tudo que já está na tela:

> Eu sou Órbi. Me responda três coisas e eu organizo seu primeiro caminho. Cada
> escolha muda o próximo passo — e você continua no controle.

Direção de voz: adulta, calorosa, baixa, ritmo calmo, sem sussurro místico e sem
interpretação teatral. O áudio precisa ter legenda integral e controle de pausa.

## 6. Movimento

- Personalidade: premium.
- Curva principal: `cubic-bezier(0.4, 0, 0.2, 1)`.
- Durações: 140 ms para toque, 420 ms para elementos e 620 ms para a entrada do
  Órbi.
- Movimento apenas em `transform` e `opacity`.
- Sem loop depois de a abertura terminar.
- Com “reduzir movimento”: fade de 140 ms, sem rotação nem deslocamento.
- Nenhum elemento percorre mais que um terço da tela.

## 7. Como as perguntas devem responder em alto padrão

### Contrato de cada resposta

Depois de cada escolha, Órbi devolve quatro coisas, sempre nesta ordem:

1. **Espelho:** repete em linguagem natural o que a pessoa escolheu.
2. **Leitura do pedido:** explica o que ela está tentando entender, sem
   diagnóstico nem adivinhação.
3. **Próximo passo:** nomeia a ferramenta real que será aberta.
4. **Por quê:** explica em uma frase por que aquela ferramenta combina com a
   resposta.

Exemplo: `Decisão → pressão de outras pessoas → clareza`:

> Você não está procurando mais opiniões — está procurando espaço para separar
> o que é seu do que veio de fora. Vamos começar por um exercício curto de
> aterramento. Depois, se quiser, o mapa ajuda a comparar padrões sem transformar
> isso em sentença.

Exemplo: `Amor → fechando um ciclo → próximo passo`:

> Você está tentando encerrar um ciclo sem apagar o que viveu. Seu primeiro
> passo será o Diário: registrar o que terminou, o que ainda pesa e o que já não
> precisa de resposta. Depois, o Tarô pode entrar como espelho — não como promessa
> de volta.

### Dados permitidos para personalizar

- O que a pessoa declarou: intenção, situação e resultado desejado.
- O que foi calculado: Sol; Lua quando houver data; Ascendente apenas com hora,
  cidade e fuso reais.
- O que ela fez: última ferramenta aberta, leitura salva, favorito, check-in e
  caminho não concluído.
- O que ela escreveu: somente quando ela estiver dentro daquela leitura e tiver
  autorizado o uso daquele texto.

### Dados que nunca podem ser inventados

- Estado civil, término, gravidez, doença, profissão ou sentimento não
  declarado.
- Ascendente sem hora e cidade.
- Evento futuro, retorno de alguém ou resultado garantido.
- Memória de conversa que não está salva.
- “Especialista humano” quando a resposta vem de IA.

## 8. Motor de personalização necessário

Para respostas consistentemente personalizadas, o app precisa montar um objeto
de contexto antes de escrever qualquer texto:

```text
perfil declarado
  + nascimento calculável
  + intenção atual
  + situação escolhida
  + resultado desejado
  + último passo real
  + histórico permitido
  = contexto da resposta
```

O onboarding usa composição determinística para nunca depender da IA nem cair em
texto genérico. A IA fica para aprofundamentos posteriores e recebe contexto
estruturado, regras e formato de saída.

### Testes obrigatórios

- Cobrir as 80 combinações de intenção × situação × resultado.
- Toda combinação abre uma ferramenta que existe.
- Respostas diferentes não podem produzir o mesmo parágrafo inteiro.
- A resposta precisa mencionar a situação e o objetivo escolhidos.
- Quem escolhe trabalho não recebe texto de relacionamento.
- Quem está sem casal não recebe término inventado.
- PT, ES e EN devem ter o mesmo comportamento, com texto próprio de cada idioma.
- Nenhuma saída pode prometer certeza, saúde, resultado ou dado não calculado.

## 9. Critério de sucesso

A abertura funciona quando a pessoa consegue responder, sem explicação externa:

1. Quem é Órbi?
2. Quantas perguntas serão feitas?
3. O que muda quando ela responde?
4. Como pular ou escolher o signo direto?

Métricas: início da primeira pergunta, conclusão das três respostas, conclusão
do nascimento, abertura da primeira ferramenta e primeira leitura salva. Não
medir apenas clique no botão inicial.
