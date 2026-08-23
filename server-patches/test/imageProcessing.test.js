const test = require("node:test");
const assert = require("node:assert/strict");
const sharp = require("sharp");

const {
  compressImage,
  MAX_DIMENSION,
  JPEG_QUALITY,
} = require("../src/infrastructure/imageProcessing");

test("normaliza a imagem, respeita o teto e devolve JPEG", async () => {
  const original = await sharp({
    create: {
      width: 1400,
      height: 700,
      channels: 3,
      background: { r: 80, g: 40, b: 100 },
    },
  })
    .png()
    .toBuffer();

  const result = await compressImage(original.toString("base64"), "image/png");
  const output = Buffer.from(result.imageBase64, "base64");
  const metadata = await sharp(output).metadata();

  assert.equal(result.mediaType, "image/jpeg");
  assert.equal(metadata.format, "jpeg");
  assert.equal(metadata.width, MAX_DIMENSION);
  assert.equal(metadata.height, 512);
  assert.equal(JPEG_QUALITY, 82);
});

test("não aumenta imagem pequena", async () => {
  const original = await sharp({
    create: {
      width: 120,
      height: 80,
      channels: 3,
      background: { r: 10, g: 20, b: 30 },
    },
  })
    .jpeg()
    .toBuffer();

  const result = await compressImage(original.toString("base64"), "image/jpeg");
  const metadata = await sharp(Buffer.from(result.imageBase64, "base64")).metadata();

  assert.equal(metadata.width, 120);
  assert.equal(metadata.height, 80);
});

test("rejeita entrada ausente", async () => {
  await assert.rejects(() => compressImage(""), /obrigatório/);
  await assert.rejects(() => compressImage(null), /obrigatório/);
});
