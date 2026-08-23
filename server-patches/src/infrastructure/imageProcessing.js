// Comprime e normaliza fotos antes de enviá-las ao provedor de IA.
//
// Este arquivo existia somente na VPS. Mantê-lo no repositório é essencial:
// server.js o importa no boot, e um ambiente limpo não pode depender de um
// arquivo residual de deploy anterior.
const sharp = require("sharp");

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 82;

/**
 * @param {string} base64 imagem sem o prefixo data URL
 * @returns {Promise<{imageBase64: string, mediaType: "image/jpeg"}>}
 */
async function compressImage(base64) {
  if (typeof base64 !== "string" || !base64.trim()) {
    throw new TypeError("base64 da imagem é obrigatório");
  }

  const inputBuffer = Buffer.from(base64, "base64");
  if (!inputBuffer.length) throw new TypeError("base64 da imagem é inválido");

  const outputBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  return {
    imageBase64: outputBuffer.toString("base64"),
    mediaType: "image/jpeg",
  };
}

module.exports = { compressImage, MAX_DIMENSION, JPEG_QUALITY };
