// O template public/index.html só pode ter UMA tag de fechamento de body.
//
// Por que este teste existe: em 29/07/2026 um comentário explicativo dentro do
// <head> de public/index.html escreveu a tag de fechamento do body por extenso,
// só pra documentar onde o Expo injeta o bundle. O `npx expo export --platform
// web` injeta as tags <script> na PRIMEIRA ocorrência dessa string — então os
// três scripts do bundle (metro-runtime, common, AppEntry) nasceram DENTRO do
// comentário, no meio do <head>.
//
// O resultado era o pior tipo de falha: nenhum erro de JS, nenhuma requisição
// falhando, nenhum log no console — o HTML servia normal, o splash aparecia, e
// o app simplesmente NUNCA montava. Quem abrisse cosmicguide.cloud ficaria
// olhando a lua girar pra sempre. Confirmado no navegador: `document
// .querySelectorAll('script[src]')` devolvia lista VAZIA na build nova e três
// scripts na build antiga.
//
// A regressão e2e pega o sintoma (nada clicável na Home), mas só depois de
// gastar um export inteiro e estourar num timeout de 30s sem dizer por quê.
// Este teste pega a CAUSA em milissegundos, antes do build.
//
// Falha aqui = não pode publicar. É de propósito.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const TEMPLATE = path.join(__dirname, '..', 'public', 'index.html');

test('public/index.html tem exatamente uma tag de fechamento de body', () => {
  const src = fs.readFileSync(TEMPLATE, 'utf8');
  // Montada em pedaços de propósito: escrever a tag inteira AQUI é inofensivo
  // (o Expo não lê este arquivo), mas deixa o grep de auditoria confuso.
  const fecha = new RegExp('<' + '/' + 'body\\s*>', 'gi');
  const ocorrencias = src.match(fecha) || [];

  assert.equal(
    ocorrencias.length,
    1,
    `public/index.html tem ${ocorrencias.length} tag(s) de fechamento de body. ` +
      'O Expo injeta os <script> do bundle na PRIMEIRA — com mais de uma, o ' +
      'bundle inteiro pode nascer dentro de um comentário e o app nunca monta ' +
      '(splash eterno, sem nenhum erro no console). Se a tag extra está num ' +
      'comentário explicativo, descreva-a por palavras em vez de escrevê-la.'
  );
});

test('a tag de fechamento de body vem depois do fechamento do head', () => {
  // Blindagem do mesmo buraco por outro ângulo: mesmo com uma só ocorrência,
  // se ela estivesse acima de </head> os scripts cairiam fora do <body>.
  const src = fs.readFileSync(TEMPLATE, 'utf8');
  const fimHead = src.search(new RegExp('<' + '/' + 'head\\s*>', 'i'));
  const fimBody = src.search(new RegExp('<' + '/' + 'body\\s*>', 'i'));

  assert.ok(fimHead !== -1, 'template sem fechamento de head');
  assert.ok(fimBody !== -1, 'template sem fechamento de body');
  assert.ok(
    fimBody > fimHead,
    'a tag de fechamento de body aparece ANTES do fim do head — o Expo ' +
      'injetaria os scripts do bundle dentro do <head>.'
  );
});
