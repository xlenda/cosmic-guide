---
name: feedback-cosmic-guide-rodar-testes
description: No Cosmic Guide, nunca rodar `npm test` inteiro — só o arquivo de teste da feature, com o setup do babel
metadata:
  type: feedback
---

Nunca rodar `npm test` inteiro neste repo. Rodar só o arquivo da feature:

```
node --require ./test/setup.js --test test/<feature>.test.js
```

**Why:** o script `test` do package.json roda `test/*.test.js` com `--test-concurrency=2` e
`--max-old-space-size=4096` — são ~70 arquivos, vários lendo disco (docs/tradicao/) e rodando
efeméride (astronomy-engine). Em paralelo isso é pesado demais para a máquina do Lenda. Ele
pediu explicitamente que só o teste do arquivo tocado rode.

**How to apply:** ao terminar uma feature, rodar o teste dela + no máximo 2-3 vizinhos
diretamente afetados (ex.: `test/i18n.test.js` e `test/i18nKeysExist.test.js` quando mexi no
dicionário), usando `--test-concurrency=1` quando for mais de um arquivo. O repo não tem
script de `lint` nem `typecheck` — o portão equivalente é transformar o arquivo com babel
(`transformFileSync` com preset `babel-preset-expo`), que pega erro de sintaxe/JSX.

Relacionado: [[feedback-cosmic-guide-regras-de-produto]]
