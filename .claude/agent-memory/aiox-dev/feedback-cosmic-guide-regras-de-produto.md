---
name: feedback-cosmic-guide-regras-de-produto
description: Duas regras do dono no Cosmic Guide: nada de card novo solto na Home, e todo número tem que ser contagem do que a pessoa fez
metadata:
  type: feedback
---

Duas regras que o Lenda dá como inegociáveis e que NÃO estão escritas em lugar nenhum do código:

1. **Nada de card novo solto na Home.** Feature nova entra como seção DENTRO de uma tela que
   já existe (a Jornada, o Diário, etc.), nunca como mais um card no grid da Home.
2. **Todo número mostrado é contagem de coisa real que a pessoa fez** — nunca previsão,
   promessa ou porcentagem de vida. Hábito é CONVITE ("escrever 1 linha"), nunca resultado
   ("dormir melhor", "acalma", "cura").

**Why:** (1) a Home já está cheia e cada card novo dilui as outras nove features; é decisão de
produto do dono, não questão de layout. (2) o app vende espiritualidade e uma alegação de
saúde/sorte é problema jurídico de loja — por isso o repo tem varredura de vocabulário
proibido em pt/es/en em vários testes (grounding, cosmicSound, jornada) e o build aborta.

**How to apply:** antes de escrever qualquer texto de UI novo, checar se ele descreve um GESTO
ou um EFEITO — só gesto passa. Toda família de chaves i18n nova deve vir com a própria
varredura de promessa nos três idiomas, e a varredura precisa de um teste que prove que ela
MORDE (frase proibida plantada é pega) — senão vira decoração. E antes de propor UI, procurar
a tela hospedeira em vez de assumir Home.

Relacionado: [[feedback-cosmic-guide-rodar-testes]]
