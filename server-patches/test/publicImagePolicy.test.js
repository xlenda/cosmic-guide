"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  PUBLIC_IMAGE_HEADERS,
  applyPublicImagePolicy,
} = require("../src/application/publicImagePolicy");

test("imagem pública permite incorporação pelo domínio web sem afrouxar outras rotas", () => {
  const recebidos = {};
  const response = {
    set(name, value) {
      recebidos[name] = value;
      return this;
    },
  };

  assert.equal(applyPublicImagePolicy(response), response);
  assert.deepEqual(recebidos, {
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Cache-Control": "public, max-age=86400, immutable",
  });
  assert.deepEqual(Object.keys(PUBLIC_IMAGE_HEADERS).sort(), [
    "Cache-Control",
    "Cross-Origin-Resource-Policy",
  ]);
});
