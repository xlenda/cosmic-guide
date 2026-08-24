"use strict";

// Imagens públicas da API são consumidas pelo app em cosmicguide.cloud, que é
// outra origem em relação a api.cosmicguide.cloud. O Helmet usa
// Cross-Origin-Resource-Policy: same-origin por padrão; sem esta exceção
// pequena e explícita, o navegador baixa o PNG e depois o bloqueia. Apenas as
// rotas públicas de imagem aplicam esta política — JSON e áreas autenticadas
// continuam com os cabeçalhos globais mais restritivos.
const PUBLIC_IMAGE_HEADERS = Object.freeze({
  "Cross-Origin-Resource-Policy": "cross-origin",
  "Cache-Control": "public, max-age=86400, immutable",
});

function applyPublicImagePolicy(res) {
  for (const [name, value] of Object.entries(PUBLIC_IMAGE_HEADERS)) {
    res.set(name, value);
  }
  return res;
}

module.exports = { PUBLIC_IMAGE_HEADERS, applyPublicImagePolicy };
