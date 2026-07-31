# Respostas para Leads — WhatsApp e Instagram

> Playbook de atendimento do Cosmic Guide. Toda resposta aqui é rastreável à base
> (`docs/tradicao/`) ou ao código. Se a pergunta não estiver aqui, a régua é a da
> tese ([00-tese.md](tradicao/00-tese.md)): o céu é medível, o significado é
> atribuído, a vida do lead é dele. Nunca prometa saúde, resultado ou futuro.
> Nunca invente número de usuários.
>
> **Moldura de tudo:** tradição simbólica, para reflexão e entretenimento.
> Espelho, não bola de cristal.

---

## 1. AS 20 PERGUNTAS QUE VÃO CHEGAR

Da mais provável pra menos. Resposta pronta pra copiar e colar.

---

### 1) "Isso é de verdade ou é IA inventando?"

> São duas camadas, e a gente nunca mistura: o céu é calculado de verdade — posição real do Sol, fases da Lua, por astronomia, a mesma matemática dos observatórios. Já o significado é tradição, e cada pedaço tem autor e século citado na tela (Ptolomeu, séc. II; Waite, 1911...). A IA escreve o texto, mas o fato não vem dela — o céu vem calculado e o significado vem citado com autor e século; ela redige por cima dessas duas camadas. E o app não prevê nada: é espelho pra reflexão e entretenimento.

**Por quê:** proposição 1 da tese (docs/tradicao/00-tese.md) — céu medível vs. significado atribuído, nunca misturados.

---

### 2) "Vocês preveem o futuro? O tarô mostra o que vai acontecer?"

> Não prevemos — e o app diz isso na tela, não em letra miúda. O que sai na casa do 'Futuro' do tarô é direção, não sentença: toda leitura ali fecha com 'vetor, não fato consumado'. O céu de amanhã dá pra calcular (é matemática), mas a sua vida não — e quem promete isso tá te vendendo mentira.

**Por quê:** lib/tarotThemes.js:399 e 408 ("Vetor, não fato consumado" fecha toda leitura do Futuro) + moldura da tese.

---

### 3) "Por que meu signo aqui deu diferente do que eu sempre fui?"

> Porque você provavelmente nasceu perto da troca de signo — e tabela fixa de datas erra nas fronteiras. A gente sabe porque já usamos uma e medimos: 293 dias errados entre 1950 e 2030. Quem nasceu dia 23/10, por exemplo, muda de signo em 44 dos 81 anos que testamos. Aqui o signo sai da posição real do Sol na sua data, calculada por astronomia. Dentro da régua tropical — a que o app usa e declara no rodapé — o seu signo é esse.

**Por quê:** proposição 1 da tese (bug histórico do `signoFromDate`) + trava em test/signoSolarReal.test.js.

---

### 4) "Cadê a porcentagem de compatibilidade? Todo app tem."

> A gente tirou de propósito, porque ela não existe em fonte nenhuma — é invenção comercial do século XX, do mesmo lote do horóscopo de jornal. No lugar, mostramos a relação que a tradição realmente descreve (Ptolomeu, Tetrabiblos, séc. II): trígono, sextil, quadratura, oposição — com a citação na tela pra você conferir. Nota alta pra todo mundo vende, mas é mentira.

**Por quê:** lib/synastry.js:381 (NOTA_ESCALA) exibida em CompatibilityScreen.js + proposição 4 da tese.

---

### 5) "Isso substitui terapia? Médico?"

> Não, e a gente escreve isso nas telas: não é diagnóstico, não é exame, não substitui ninguém de verdade na sua vida. O app é tradição simbólica pra reflexão e entretenimento — um espelho pra você pensar, não tratamento. Se o assunto é saúde ou cabeça, o lugar certo é médico e terapeuta; o app nunca vai fingir que faz o trabalho deles.

**Por quê:** disclaimers visíveis em screens/PalmScreen.js ("Não substitui exame médico"), screens/DreamScreen.js ("Não é diagnóstico psicológico nem previsão") + proposição 6 da tese (a linha do corpo).

---

### 6) "Por que pagar se tem grátis?"

> O grátis é pra você provar: a primeira leitura de cada um dos 9 tipos é sua, sem cartão nenhum. A assinatura destrava volume — todas as leituras, todo dia, sem limite, incluindo as geradas por IA. Única exceção, dita na tela: o Tarô é 1 tiragem por tema por dia, de propósito — vale até pra assinante. O que ela NÃO destrava é 'resposta melhor': a leitura é a mesma, você só pode usar mais.

**Por quê:** lib/i18n.js:39-40 (onboarding: "Nove leituras. A primeira de cada, grátis." / "Sem cartão pra começar") + lib/i18n.js:677 (leituras sem limite pra assinante).

---

### 7) "É grátis mesmo ou vocês cobram escondido nos 7 dias?"

> Grátis mesmo. Os 3 planos têm 7 dias de teste, e se cancelar dentro do prazo não cai cobrança nenhuma — tá nos Termos. A cobrança é da Hotmart e o cancelamento é lá, direto, sem falar com ninguém.

**Por quê:** lib/i18n.js:673 e 685 (splash e planos: "7 dias grátis, depois US$5/mês") + lib/i18n.js:2728-2729 (rodapé do checkout).

---

### 8) "Funciona pra casal? Meu par vai ter que pagar outra assinatura?"

> Funciona, e é uma assinatura só pros dois — conferido no código. Você assina, manda seu link de convite, e seu par entra de graça. Aí vocês têm compatibilidade pelo aspecto real entre os signos, rotas de reconexão, jogos e ideias de encontro. Só precisam preencher o quiz, porque sem os dados de vocês as telas não têm o que mostrar.

**Por quê:** lib/i18n.js:2654-2655 (gate.solo.subscribeNote: "seu par entra de graça pelo seu link de convite").

---

### 9) "Vocês guardam meus dados? E a foto da minha mão, vai parar onde?"

> Nomes, datas e horários de nascimento ficam só no seu aparelho — não sobem pra servidor nenhum. Foto de palma, borra ou texto de sonho vai pro nosso servidor só na hora de gerar aquela leitura (processada por IA da Anthropic) e não fica guardada depois. Não vendemos nada pra Google nem Meta, e tem botão dentro do app pra apagar tudo — aparelho e servidor. Tela de Privacidade explica item por item, com seus direitos da LGPD.

**Por quê:** screens/PrivacyScreen.js — seções "O que guardamos neste aparelho", "Como usamos" e "Seus direitos (LGPD)", visíveis no app.

---

### 10) "O tarô é sério? Não é aquela coisa do Egito antigo?"

> É sério justamente porque a gente não te conta a lenda: a história do Egito foi inventada em 1781 por Court de Gébelin — 41 anos antes de alguém conseguir ler hieróglifo. O baralho que usamos é o de Waite, de 1911, e o app te conta isso dentro dele. O nosso diferencial é ler como a tradição documentada lê: a mesma carta muda de sentido conforme a posição na tiragem, coisa que vem de Etteilla (1783) e Waite. A história real é mais interessante que a inventada.

**Por quê:** tabela da proposição 3 da tese + docs/tradicao/05-taro-historia-e-leitura.md + lib/tarotDeck.js (waite1911) + screens/TarotScreen.js:359-364/427 + test/tarotVoice.test.js:887-929.

---

### 11) "No chat eu tô falando com uma pessoa? Uma vidente?"

> É IA, e ela mesma te conta na primeira mensagem: 'Sou a Luna — uso IA e mais de dois mil anos de tradição astrológica pra te ajudar a refletir'. Não é pessoa, não é médium, não vê futuro. É um chat pra conversar sobre as suas leituras, respondendo a partir da tradição que o app cita, com autor e século.

**Por quê:** lib/chatPersonas.js:24 e 34 — Luna e Arcano se apresentam como IA na primeira mensagem.

---

### 12) "E pra cancelar, vai ser aquela novela?"

> Zero novela: cancela direto na área de compras da Hotmart, com o e-mail da compra, a qualquer momento, sem justificar. O acesso segue até o fim do período que você já pagou e não cobra de novo. Cancelou dentro dos 7 dias de teste, não paga nada.

**Por quê:** lib/i18n.js:2728-2729 (planos.legal.billingNote: "cancela quando quiser, direto na sua área de compras").

---

### 13) "'Sem limite' mesmo? Não tem letra miúda?"

> Sem limite nas leituras, incluindo as de IA — decisão nossa, sem teto escondido. A única regra diferente é do Tarô: 1 tiragem por tema por dia, de propósito — assunto sério merece uma resposta, não repetição até sair a que você quer ouvir. Isso vale pra assinante também, e a gente fala na tela, não esconde.

**Por quê:** lib/i18n.js:677 (leituras sem limite) + TarotScreen.js:276 (regra da tiragem única, com a justificativa na tela).

---

### 14) "US$3,33 por mês? Vai cair isso no meu cartão?"

> A conta é real, mas a cobrança é do ciclo inteiro de uma vez: US$10 a cada 3 meses (dá 3,33/mês) ou US$20 por ano (dá 1,67/mês). O mensal é US$5. Não existe cobrança fracionada mês a mês nos planos maiores — por isso o card mostra o preço cheio e o ciclo.

**Por quê:** lib/i18n.js:688-692 (planos.plan.quarterly/annual.detail).

---

### 15) "Tirei A Morte (ou A Torre) — vai acontecer algo ruim?"

> Não — o app não prevê morte, doença nem desfecho de ninguém. A carta sai lida como fim de ciclo e transformação (repara o sol nascendo entre as torres, no desenho de 1911). E a gente nem te engana sobre a história: na lista original de Waite a carta abria com 'End, mortality' — ler como transformação é escolha moderna, e o app mostra o texto de 1911 na tela em vez de fingir que sempre foi assim.

**Por quê:** lib/tarotDeck.js:642-646 (nota da Morte, visível quando a carta sai).

---

### 16) "Meu mapa védico diz que sou de outro signo. Qual tá certo?"

> Os dois, cada um na sua régua. Este app é trópico: os signos começam nos equinócios e solstícios, escolha que Ptolomeu argumenta no séc. II. O sistema védico é sideral, corrige a precessão dos equinócios, e por isso costuma dar o signo anterior. A diferença é astronomia medível, não erro de ninguém — e o rodapé do horóscopo declara qual régua usamos, coisa que quase nenhum app faz.

**Por quê:** lib/i18n.js:4505-4506 (footer.tropical) + proposição 5 da tese (Yavanajātaka, o cruzamento documentado).

---

### 17) "Mercúrio retrógrado vai quebrar meu celular e trazer meu ex de volta?"

> Esse pacote — aparelho quebra, ex volta, voo atrasa — é folclore do século XX, não está em fonte antiga nenhuma, e o app te diz isso na cara. O que a fonte diz (Valens, séc. II) é outra coisa: atraso com prazo, que depois se cancela. E o retrógrado aqui é calculado da efeméride de verdade, não copiado de lista.

**Por quê:** lib/i18n.js:4489-4490 (horoscope.sky.retro.folklore, no bloco de Mercúrio retrógrado).

---

### 18) "Deu 'desarmônico' pra mim e meu par. A gente vai terminar?"

> Não é isso que tá escrito — e a ressalva não é rodeio nosso, é da fonte: no mesmo capítulo do casamento, Ptolomeu registra a união em posição difícil que NÃO termina, com 'recomeços e lembranças, que preservam gentileza e afeto'. Essa citação sai junto de toda leitura dura, por regra travada em teste. O app descreve a natureza do encontro; o desfecho é de vocês dois.

**Por quê:** lib/synastry.js:311/554-558 (quadratura com o modificador de Tetrabiblos IV.5 na tela, citação verbatim) + regra travada em teste.

---

### 19) "Por que só uma tiragem de tarô por dia? É pra me forçar a assinar?"

> Não — assinante também tem 1 tiragem por tema por dia. É regra do produto, e a gente não finge que é tradição antiga: assunto sério merece uma resposta, não repetição até sair a que você quer ouvir. O que a assinatura destrava é volume (todos os temas, todo dia), não 'resposta melhor'.

**Por quê:** TarotScreen.js:276 (justificativa na tela) + lib/tarotDailyLimit.js:1-9 (regra de produto, vale para assinante). A base não registra prescrição antiga sobre tiragens — e a resposta assume que a ética é nossa, não da tradição (cf. 05 §3.6 sobre a própria tiragem de 3 não ser antiga).

---

### 20) "Quanta gente já usa? Tem avaliação?"

> O app é novo e a base ainda é pequena — não vou te inventar número, isso seria trair exatamente o que o app promete. O que eu posso fazer é melhor: a primeira leitura de cada um dos 9 tipos é grátis, sem cartão. Testa e me diz você o que achou.

**Por quê:** regra inegociável do dono — o app tem poucas assinaturas ativas e prova social NUNCA se inventa. Honestidade é o produto (proposição 7 da tese).

---

## 2. O QUE NUNCA RESPONDER

As três linhas que não se cruzam — nem por gentileza, nem pra fechar venda.
Quando o lead pedir exatamente isso, use o que está NO LUGAR.

### ❌ Alegação de saúde — nem implícita

**O lead vai pedir assim:** "isso ajuda na ansiedade?", "melhora o sono?", "o 4-7-8 faz dormir?", "essa frequência cura?", "essa pinta aqui significa algo?"

**NUNCA diga:** "reduz ansiedade", "melhora sono", "acalma", "equilibra", "528 Hz repara DNA", nem versões suaves ("muita gente relata que ajuda a relaxar" — isso é alegação disfarçada).

**NO LUGAR:**
> A gente não promete efeito nenhum no corpo ou na cabeça — de propósito, porque a promessa não se sustenta. O que o app faz é descrever a prática com fonte e data (a respiração de tempos iguais está na tradição do yoga — Patanjali define pranayama nos Yoga Sutras II.49-50, e a fonte sai na tela; a numeração Solfeggio é de 1974) e você usa como momento de pausa. Se o assunto é saúde, o lugar certo é médico ou terapeuta.

E se for pinta, mancha ou sintoma:
> Pinta no app é símbolo de posição, só isso. Cor, borda, tamanho ou mudança é assunto de dermatologista — e disso a gente não fala, por regra.

**Fonte:** lib/grounding.js:464-469 (seção "o que a pesquisa não achou", na tela) + lib/cosmicSound.js:275-330 (aviso dos presets) + proposição 6 da tese, travada em teste que aborta o deploy.

### ❌ Promessa de resultado

**O lead vai pedir assim:** "vai dar certo com ele?", "vou conseguir o emprego?", "isso salva meu casamento?", "se eu assinar minha vida melhora?"

**NUNCA diga:** "vai dar certo", "sua vida vai mudar", "confia que funciona", "quem usa relata que a vida melhorou".

**NO LUGAR:**
> Não prometemos isso — e desconfie de quem prometer. O que a gente garante é o nosso lado: conteúdo com fonte, céu calculado de verdade, e leitura oferecida como espelho pra você refletir. O que acontece a partir daí é seu — e é assim que tem que ser.

**Fonte:** moldura da tese ("tendências, não fortunas") + lib/chatResponses.js:34 ("Não trabalho com certezas, trabalho com espelhos").

### ❌ Previsão

**O lead vai pedir assim:** "o que vai acontecer comigo esse ano?", "ele vai voltar?", "me diz meu futuro".

**NUNCA diga:** qualquer frase que afirme evento futuro na vida da pessoa. Nem "os astros indicam que vem coisa boa".

**NO LUGAR:**
> O que dá pra calcular é o céu — fase da Lua e posição dos planetas de amanhã são matemática, e isso o app faz de verdade. A sua vida não se calcula, e a gente não finge que sim. A leitura te dá o símbolo e a direção pra pensar; a decisão e o desfecho são seus.

**Fonte:** lib/dailyThought.js:1-10 (o pensamento de amanhã é montado de fase da Lua, signo lunar, regente do dia e retrógrado calculados de verdade — "nunca fabrica") + lib/tarotThemes.js:399 ("vetor, não fato consumado"); "Espiada de Amanhã" é só o nome da feature (lib/i18n.js:142-143).

### ❌ Prova social inventada

**O lead vai pedir assim:** "quantos usuários tem?", "quem já usou aprovou?", "me mostra depoimento".

**NUNCA diga:** número inventado, "milhares de usuários", depoimento fabricado, estrela de app store que não existe.

**NO LUGAR:** a resposta pronta da pergunta 20 — app novo, base pequena, testa grátis e julga você.

### ❌ Antiguidade inflada

**O lead vai pedir assim:** "é sabedoria milenar, né?", "vem dos faraós?"

**NUNCA diga:** "milenar" onde a base data como moderno (tarô, borra de café, quiromancia moderna, porcentagem, oito fases da Lua, Solfeggio).

**NO LUGAR:**
> Vou te contar a data real, que é mais interessante: [tarô = 1781 / borra = séc. XVI + símbolos de 1922 / palma moderna = 1839-1900]. Quase tudo que o mercado vende como antigo tem inventor com nome e ano — e o app mostra isso na tela em vez de esconder. O que é milenar de verdade (observar o céu, os sonhos de Artemidoro) a gente banca com fonte.

**Fonte:** tabela completa da proposição 3 da tese (docs/tradicao/00-tese.md).

---

## 3. AS 7 MUNIÇÕES

Fatos verificáveis que viram resposta-íman. Uma frase, pronta de mandar,
quando a conversa precisar de um gancho.

1. **Tarô "egípcio":**
> "A lenda do tarô egípcio nasceu em 1781, e o primeiro método de leitura de tarô é de 1783 (Etteilla) — o cara que inventou a história do Egito escreveu isso 41 anos antes de alguém conseguir ler um hieróglifo. A gente te conta a história real, que é melhor."

2. **Signo calculado vs. tabela:**
> "Tabela fixa de datas erra nas fronteiras — a gente sabe porque já usamos uma e medimos: 293 dias errados entre 1950 e 2030; quem nasceu em 23/10 muda de signo em 44 dos 81 anos que testamos. Aqui é a posição real do Sol."

3. **A aversão que o mercado esconde:**
> "Um terço dos pares de signos, Ptolomeu chama de 'alheios' — nem se veem; os outros apps escondem isso porque nota baixa não vende, a gente mostra com a citação na tela."

4. **"Opostos se atraem" é o contrário da fonte:**
> "Na fonte, a oposição tá no fundo da escala — e nossa versão antiga dava 92% pra Áries+Libra, a nota mais alta; achamos o erro lendo Ptolomeu e corrigimos."

5. **Lua Cheia não é hora de colher:**
> "A fonte romana diz o contrário da fama: Plínio manda colher na minguante, e na Lua Cheia o que Columela manda é semear — o app repetia a inversão, achou o erro e corrigiu com a fonte na tela."

6. **Leão não é o coração:**
> "Todo site diz que Leão rege o coração, mas na lista antiga de verdade (Manílio, séc. I) Leão fica com flancos e omoplatas — o latim tá na tela pra você conferir."

7. **Até o nosso 'espelho, não previsão' tem história:**
> "A frase 'tendências, não previsões' que o mercado inteiro usa nasceu na defesa criminal de um astrólogo processado em 1914 — a diferença é que a gente sabe de onde ela veio e te conta."

---

*Regra final: toda resposta termina com porta aberta, nunca com pressão. O funil
honesto é o produto — primeira leitura de cada tipo grátis, sem cartão. Se o
rigor não converter, o problema é a copy, não a verdade (seção "O que refutaria
esta tese", 00-tese.md).*
