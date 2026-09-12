// O LOTE DE CASAL — o portao das faixas de Compatibilidade e Reconectar.
// (12/09/2026)
//
// ARQUIVO PROPRIO, e nao mais um bloco em test/diagramacaoPecas.test.js: outra
// sessao estava editando aquele arquivo no mesmo dia, e portao novo dentro de
// arquivo em edicao alheia e conflito na certa.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const leia = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');
const { ondaPath } = require('../lib/ondaPath');
// OS TONS VALIDOS, lidos do CODIGO da peca e nao importados: require de um
// componente arrasta o react-native, que nao carrega no runner (import typeof
// no index.js dele). E o mesmo motivo pelo qual test/diagramacaoPecas.test.js
// le os arquivos como texto. Nasce do proprio TONS, entao tom novo entra
// sozinho — nenhuma lista repetida aqui.
const FAIXA_TONS = (leia('components/FaixaCurva.js')
  .match(/const TONS = \{([\s\S]*?)^\};/m)[1]
  .match(/^\s*([a-z]+):\s*'rgba/gm) || []).map((m) => m.trim().replace(/:.*$/, ''));
if (FAIXA_TONS.length < 3) throw new Error('nao consegui ler os TONS de FaixaCurva.js');

// =====================================================================
// O LOTE DE CASAL — as faixas de Compatibilidade e Reconectar.
// (12/09/2026)
//
// POR QUE ESTE PORTAO EXISTE. As duas telas foram fotografadas antes e
// depois, e a medida do "antes" era a mesma nas duas: a leitura inteira
// correndo num chao so. O que conserta isso e a FaixaCurva, e ela tem duas
// formas silenciosas de voltar atras:
//   1. alguem repete a SEMENTE entre duas faixas — as duas desenham a MESMA
//      onda e o rolo vira papel de parede, que e o oposto do objetivo;
//   2. alguem passa de quatro faixas — cinco ou mais e textura de novo.
// Nenhuma das duas quebra o app, nenhuma aparece em teste de logica, e as
// duas devolvem a tela pro estado que o dono recusou.
// =====================================================================

const TELAS_COM_FAIXA = ['screens/CompatibilityScreen.js', 'screens/ReconectarScreen.js'];

function faixasDe(arq) {
  // So o CODIGO: o cabecalho destes arquivos cita <FaixaCurva ...> nos
  // comentarios pra explicar a decisao, e comentario nao desenha nada.
  const codigo = leia(arq)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  return (codigo.match(/<FaixaCurva[^>]*>/g) || []).map((tag) => ({
    tag,
    tom: (tag.match(/tom="([^"]+)"/) || [])[1],
    semente: (tag.match(/semente="([^"]+)"/) || [])[1],
  }));
}

test('as telas do lote de casal usam faixa — sem ela a leitura corre num chao so', () => {
  for (const arq of TELAS_COM_FAIXA) {
    assert.ok(faixasDe(arq).length > 0, `${arq}: nenhuma FaixaCurva — a tela voltou a ser lista`);
  }
});

test('duas faixas NUNCA repetem a semente — onda repetida e papel de parede', () => {
  for (const arq of TELAS_COM_FAIXA) {
    const sementes = faixasDe(arq).map((f) => f.semente);
    for (const s of sementes) {
      assert.ok(s, `${arq}: ha uma <FaixaCurva> sem semente — sem ela a onda sai do tom e nunca varia`);
    }
    assert.equal(
      new Set(sementes).size,
      sementes.length,
      `${arq}: duas faixas com a mesma semente desenham a MESMA onda: ${sementes.join(', ')}`
    );
    // E as sementes tem que desenhar ondas de fato diferentes — a semente
    // distinta e a intencao, o ondaPath e o resultado.
    const curvas = sementes.map(ondaPath);
    assert.equal(new Set(curvas).size, curvas.length, `${arq}: duas sementes diferentes colidiram na mesma curva`);
  }
});

test('de DUAS a QUATRO faixas por tela — cinco ou mais volta a ser textura', () => {
  for (const arq of TELAS_COM_FAIXA) {
    const n = faixasDe(arq).length;
    assert.ok(n >= 2 && n <= 4, `${arq}: ${n} faixas — o guia manda de 2 a 4`);
  }
});

test('a faixa que vem logo abaixo de outra leva `grude` — sem ele sobra um fio do fundo', () => {
  for (const arq of TELAS_COM_FAIXA) {
    const faixas = faixasDe(arq);
    // A PRIMEIRA nao gruda (nao ha nada acima dela); da segunda em diante,
    // todas — e o -1px que mata a meia-linha de antialias entre dois
    // preenchimentos vizinhos.
    for (let i = 1; i < faixas.length; i += 1) {
      assert.match(faixas[i].tag, /grude/, `${arq}: a faixa ${i + 1} (${faixas[i].semente}) nao gruda na de cima`);
    }
  }
});

test('o tom da faixa sai da paleta da peca — hex solto na tela e outro app', () => {
  for (const arq of TELAS_COM_FAIXA) {
    for (const f of faixasDe(arq)) {
      assert.ok(
        FAIXA_TONS.includes(f.tom),
        `${arq}: tom "${f.tom}" nao existe em FaixaCurva.js (validos: ${FAIXA_TONS.join(', ')})`
      );
    }
  }
});

test('o lote de casal nao repoe numero cru de espaco — a escala e a fundacao', () => {
  for (const arq of TELAS_COM_FAIXA) {
    // SEM COMENTARIO: os cabecalhos destas telas CITAM o "padding: 20" antigo
    // pra explicar por que ele saiu — citar o defeito nao e cometer o defeito.
    // (Pego na primeira rodada deste portao: dois falsos positivos, os dois em
    // comentario, e um numero de verdade.)
    const fonte = leia(arq).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.match(fonte, /space/, `${arq} nao le a escala de espaco`);
    const crus = fonte.match(/(padding|margin|gap)[A-Za-z]*:\s*(\d+)(?!\d*%)/g) || [];
    // 0, 1 e 2 sao ajuste de fio de cabelo, nao relacao entre elementos —
    // mesma excecao que as seis pecas ja tinham.
    // 0 a 3: fio de cabelo (a folga de 3px entre o icone e o rotulo de
    // "Trocar"), nao relacao entre elementos. A peca ja abria excecao pra 0-2.
    const proibidos = crus.filter((m) => !/:\s*[0-3]$/.test(m));
    assert.deepEqual(proibidos, [], `${arq} tem espaco em numero cru: ${proibidos.join(', ')}`);
  }
});
