// Ativa transform on-the-fly (ESM->CommonJS) pra rodar lib/*.js direto com
// node:test, sem precisar de Metro/Jest — lib/ usa `export`/`import` (mesmo
// código que o app real importa), então os testes exercitam a fonte de
// verdade, não uma cópia reimplementada.
require("@babel/register")({
  presets: ["babel-preset-expo"],
  extensions: [".js"],
  ignore: [/node_modules/],
});
