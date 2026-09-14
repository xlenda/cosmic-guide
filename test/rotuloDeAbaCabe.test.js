// Portão: rótulo de aba é PLACA, não frase — tem que caber no chip.
//
// Medido no ar em 14/09/2026, celular de 390px: o chip das abas tem 90px de
// largura útil e `numberOfLines={1}`. Os rótulos vinham de `home.card.*.title`,
// que são frases inteiras:
//
//   "Quando o silêncio esfria"        90px de caixa, 138px de texto
//   "A história que vocês escreveram"  90px de caixa, 184px de texto
//   "Quanto vocês já caminharam"       90px de caixa, 166px de texto
//   "O ano de vocês em uma tela"       90px de caixa, 164px de texto
//
// Cortava no meio da palavra, sem reticência honesta. Em inglês era pior.
//
// POR QUE CHAVES NOVAS, e não encurtar as antigas: `home.card.agir.title` e
// `home.card.descobrir.title` também titulam a PÁGINA, no GradientHeader de
// AgirScreen/DescobrirScreen — ali a frase longa é o que dá alma à tela.
// Encurtar a chave partilhada consertaria o chip e empobreceria a página.
//
// A REGRA QUE ESTE TESTE PROTEGE: nos três idiomas, todo rótulo de aba cabe
// em 90px.
//
// O TETO DE 14 NÃO É CONTA, É MEDIÇÃO — e a primeira versão deste teto errou.
// Derivei 16 por regra de três (138px / 24 caracteres ≈ 5,75px cada) e o
// navegador reprovou: "Línea del tiempo" (16) pediu 96px num chip de 90, e
// "Linha do tempo" (14) passou raspando, 91 em 90. A conta falha porque
// caractere não tem largura fixa: 'í', 'm' e 'W' comem mais que 'i' e 'l'.
// 14 é o maior tamanho que a medição real aprovou nos três idiomas, e mesmo
// ele só passa no limite — por isso os rótulos de hoje ficam em 13 ou menos.
// Quem precisar subir este número: meça no navegador antes, não calcule.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const i18n = fs.readFileSync(path.join(RAIZ, 'lib', 'i18n.js'), 'utf8');

// As seis abas das duas portas do casal.
const CHAVES = [
  'aba.agir', 'aba.reconectar', 'aba.descobrir',
  'aba.timeline', 'aba.progresso', 'aba.retrospectiva',
];

const TETO = 14; // caracteres — o maior que a medição no navegador aprovou

function valoresDe(chave) {
  // Uma ocorrência por idioma (pt, es, en). Pega o literal de cada uma.
  const re = new RegExp(`'${chave.replace('.', '\.')}': '([^']*)'`, 'g');
  return [...i18n.matchAll(re)].map((m) => m[1]);
}

test('as seis abas existem nos TRÊS idiomas', () => {
  for (const chave of CHAVES) {
    const vs = valoresDe(chave);
    assert.strictEqual(vs.length, 3, `${chave}: esperava 3 idiomas, achei ${vs.length}`);
    for (const v of vs) assert.ok(v.trim().length > 0, `${chave}: rótulo vazio`);
  }
});

test('nenhum rótulo de aba estoura o chip de 90px, em nenhum idioma', () => {
  for (const chave of CHAVES) {
    for (const v of valoresDe(chave)) {
      assert.ok(
        v.length <= TETO,
        `${chave} = "${v}" tem ${v.length} caracteres; o chip de 90px comporta ${TETO}. ` +
        'Rótulo de aba é placa, não frase — encurte, não estique o chip.',
      );
    }
  }
});

test('as telas usam as chaves curtas, não as frases da Home', () => {
  for (const arq of ['NosHojeScreen.js', 'NossaHistoriaScreen.js']) {
    const src = fs.readFileSync(path.join(RAIZ, 'screens', arq), 'utf8');
    // Só as linhas de definição de aba interessam.
    const linhas = src.split('\n').filter((l) => l.includes('tituloKey:'));
    assert.ok(linhas.length >= 3, `${arq}: não achei as abas`);
    for (const l of linhas) {
      assert.ok(
        l.includes("tituloKey: 'aba."),
        `${arq}: aba ainda aponta pra frase longa — ${l.trim()}`,
      );
    }
  }
});

test('as frases longas da Home continuam intactas (não foram encurtadas)', () => {
  // O conserto não pode ter empobrecido o título das páginas.
  for (const frase of ['Quando o silêncio esfria', 'Quanto vocês já caminharam']) {
    assert.ok(i18n.includes(frase), `a frase "${frase}" sumiu do i18n — ela titula a página`);
  }
});
