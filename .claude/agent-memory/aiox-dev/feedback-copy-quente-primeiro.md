---
name: feedback-copy-quente-primeiro
description: Lei de copy do Lenda — toda linha que ABRE tela ou seção é curiosidade + benefício concreto; jargão astrológico só como etiqueta pequena depois
metadata:
  type: feedback
---

**"Quente primeiro, ficha depois."** Nenhuma linha que abre uma tela ou uma seção pode ser
lista de jargão ("Sol + Ascendente + Lua. Cartas. Compatibilidade."). Ela tem que ser
curiosidade + benefício concreto. A ficha técnica continua existindo — mas como etiqueta
pequena (`overline`/badge) DEPOIS do título quente, nunca no lugar dele.

Coringas fixos: **sem promessa de efeito, sem porcentagem, sem prova social** ("mais de X
casais"). Isso vale mais na tela de conversão, não menos.

**Why:** quem já conhece "Ascendente" não precisa da linha; quem não conhece — que é quase
todo mundo, e é justamente o público que o funil compra — lê palavra técnica e fecha a aba.
A curiosidade que funciona já costuma estar escrita dois passos adiante no próprio fluxo
(no quiz era "a hora é opcional — mas revela o Ascendente"); é só trazer pra porta.

**How to apply:** ao mexer em hero/section-head, checar se o texto é LISTA ou GANCHO. E a
promessa tem que caber no que AQUELA superfície entrega: no funil (`gilfforever/web`) o
Ascendente não é calculado (`risingSign()` retorna null de propósito, falta cidade), então
o hero diz "empiezan por el Sol y la Luna", não "veem os três" — a versão do app
(`quiz.hero.sub` em `lib/i18n.js`) pode dizer os três porque lá abre mesmo. Ao portar copy
app → funil, sempre reconferir o que a superfície de destino realmente entrega.

**Corolário do alcance (04/08/2026): recolhido = invisível.** A lei não é só sobre ORDEM,
é sobre o que aparece SEM toque. Conteúdo correto dentro de bloco que nasce fechado
(`showX` default false) não existe pra maioria — foi o que aconteceu com o caminho prático
dos pares difíceis da Compatibilidade: escrito, testado nos 3 idiomas, renderizado, e
atrás de "De onde vem isso", que abre recolhido. O padrão de defeito é "motor conforme,
tela escondendo", e os testes de `lib/` passam verdes o tempo todo.

**How to apply:** ao auditar uma superfície, listar o que a pessoa lê antes de tocar em
qualquer coisa. Se a peça que resolve o problema só aparece depois de um toque, a correção
é um ECO no bloco que abre (rótulo + primeira frase + toque que leva ao completo) — nunca
mover a peça, nunca duplicar texto escrito à mão. O eco é RECORTE do texto existente, feito
no motor, no idioma da leitura.

Relacionado: [[feedback-cosmic-guide-regras-de-produto]], [[project-funil-quiz-repo]]
