// Toda chave t('...') usada numa tela PRECISA existir no dicionário.
//
// Por que este teste existe: em 29/07/2026 o repo tinha 421 chaves em uso e 112
// definidas — 342 faltando, entre elas TODAS as de `onboarding.*` e `login.*`,
// que são as duas primeiras telas de quem chega pelo link. `translate()` devolve
// a PRÓPRIA CHAVE quando não acha, então o próximo deploy teria publicado uma
// tela inicial escrita literalmente "onboarding.headerTitle". Nada quebrava, nada
// dava erro — só ficava ilegível pro visitante.
//
// O teste de paridade (i18n.test.js) não pegava: ele compara pt/es/en ENTRE SI,
// então uma chave ausente nos três passa verde. Este aqui compara o que o código
// USA com o que o dicionário TEM — é o outro lado da mesma moeda, e os dois
// juntos fecham o buraco.
//
// Falha aqui = não pode publicar. É de propósito.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const PASTAS = ['screens', 'components', 'lib', 'context'];

// Chaves montadas em tempo de execução (ex.: t(`plano.${id}.titulo`)) não dá pra
// verificar estaticamente. Elas são registradas aqui pelo PREFIXO, e o teste
// exige que exista pelo menos UMA chave real com aquele prefixo — assim uma
// família inteira que suma ainda é pega.
const PREFIXOS_DINAMICOS = [];

function arquivosJs(pasta) {
  const dir = path.join(RAIZ, pasta);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'))
    .map((f) => path.join(dir, f));
}

// Chaves definidas: pega tudo que é `'chave.com.ponto':` ou `"chave.com.ponto":`
// no i18n.js. O formato do arquivo é um objeto por idioma com chaves planas.
function chavesDefinidas() {
  const src = fs.readFileSync(path.join(RAIZ, 'lib', 'i18n.js'), 'utf8');
  const achadas = new Set();
  // O hífen ENTRA na classe: as chaves de recompensa e de brinde da Loja são
  // hifenizadas (loja.reward.selo-cosmico.title, loja.brinde.brinde-ritual-lua
  // .title). Sem o hífen, as duas famílias ficavam invisíveis nos DOIS lados do
  // teste — nem definidas nem usadas — e apagar uma delas passava verde.
  const re = /['"]([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)['"]\s*:/g;
  let m;
  while ((m = re.exec(src))) achadas.add(m[1]);
  return achadas;
}

// Chaves usadas. Três formas, porque o código usa as três — e a primeira versão
// deste teste só pegava a primeira, deixando 11 chaves passarem invisíveis
// (a Home mostraria "home.week.mon" embaixo da sequência COM O TESTE VERDE):
//
//   1. direta        t('home.title')
//   2. por ternário  t(n === 1 ? 'home.streak.count_one' : 'home.streak.count_other')
//   3. em lista      const WEEK_KEYS = ['home.week.mon', ...]; ... .map(k => t(k))
//
// Para (2) e (3) não dá pra amarrar a chave ao t() de forma confiável, então o
// critério é: QUALQUER literal com cara de chave de tradução (dois ou mais
// segmentos separados por ponto, sem espaço) que apareça num arquivo de tela.
// Isso pode gerar falso positivo em string que só parece chave — se acontecer,
// o nome entra em IGNORAR abaixo, com o motivo escrito.
const IGNORAR = new Set([
  // Nada aqui ainda. Adicione com comentário explicando por que NÃO é chave.
]);

function pareceChave(s) {
  if (IGNORAR.has(s)) return false;
  // dois+ segmentos, só letra/número/underscore, sem espaço, e não é caminho de
  // arquivo nem domínio nem versão
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_-]+)+$/.test(s)) return false;
  if (/\.(js|json|png|jpg|svg|ttf|com|br|cloud|bet|org|net|io)$/i.test(s)) return false;
  if (/^\d+(\.\d+)+$/.test(s)) return false;
  // LOCUS DE CITAÇÃO, não chave: `I.8` (Tetrabiblos), `XVIII.321` (Naturalis
  // Historia), `XI.2.85` (De Re Rustica), `IV.7`. O primeiro segmento é um
  // numeral romano em MAIÚSCULAS, e nenhuma chave do dicionário começa assim —
  // todas são camelCase minúsculas (conferido: zero chaves em lib/i18n.js
  // batem com /^[IVXLCDM]+\./). Regra genérica em vez de lista em IGNORAR
  // porque capítulo-e-verso é agora um dado estrutural do app: a tese
  // (docs/tradicao/00-tese.md) exige obra + autor + século em toda afirmação
  // histórica, então todo módulo de conteúdo novo guarda loci e cairia aqui.
  if (/^[IVXLCDM]+\./.test(s)) return false;
  return true;
}

function chavesUsadas() {
  const usos = new Map(); // chave -> arquivo onde apareceu primeiro
  for (const pasta of PASTAS) {
    for (const arq of arquivosJs(pasta)) {
      // i18n.js é o dicionário, não consumidor — senão toda chave definida
      // apareceria também como "usada" e o teste viraria tautologia.
      if (arq.endsWith(path.join('lib', 'i18n.js'))) continue;
      const src = fs.readFileSync(arq, 'utf8');
      const rel = path.relative(RAIZ, arq);

      // (1) forma direta — sempre conta
      const direta = /\bt\(\s*['"]([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)['"]/g;
      let m;
      while ((m = direta.exec(src))) if (!usos.has(m[1])) usos.set(m[1], rel);

      // (2) e (3) — qualquer literal com cara de chave no arquivo
      const solta = /['"]([a-zA-Z][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_-]+)+)['"]/g;
      while ((m = solta.exec(src))) {
        if (pareceChave(m[1]) && !usos.has(m[1])) usos.set(m[1], rel);
      }
    }
  }
  return usos;
}

test('toda chave t() usada nas telas existe no dicionário', () => {
  const definidas = chavesDefinidas();
  const usadas = chavesUsadas();

  const faltando = [];
  for (const [chave, arquivo] of usadas) {
    if (definidas.has(chave)) continue;
    if (PREFIXOS_DINAMICOS.some((p) => chave.startsWith(p))) continue;
    faltando.push(`${chave}  (${arquivo})`);
  }

  assert.equal(
    faltando.length,
    0,
    `${faltando.length} chave(s) usadas no código e AUSENTES no dicionário — ` +
      `essas telas mostrariam o nome da chave pro usuário:\n  ` +
      faltando.slice(0, 40).join('\n  ') +
      (faltando.length > 40 ? `\n  ... e mais ${faltando.length - 40}` : '')
  );
});

// ---------------------------------------------------------------------------
// Famílias montadas em runtime na Loja
// ---------------------------------------------------------------------------
// A varredura estática acima nunca vê t(`loja.reward.${reward.id}.title`) — ela
// só enxerga literais. Então as duas famílias da Loja ganham um teste próprio,
// no molde do "toda chave montada em runtime existe nos três idiomas" de
// test/zodiacBody.test.js e test/grounding.test.js: a lista de ids sai da FONTE
// (o array de REWARDS na tela, o de BRINDES no catálogo) e cada id tem que ter
// .title e .description nos três idiomas. Sem isso, um reward novo sem entrada
// no dicionário passava verde e a Loja imprimia a chave crua na tela.
//
// Os ids são lidos do texto do arquivo, não importados: screens/LojaScreen.js
// puxa react-native e @expo/vector-icons, que não carregam sob node:test.
function idsDeArray(arquivo, nomeDoArray) {
  const src = fs.readFileSync(path.join(RAIZ, arquivo), 'utf8');
  const bloco = new RegExp(`(?:const|export const)\\s+${nomeDoArray}\\s*=\\s*\\[([\\s\\S]*?)\\n\\];`).exec(src);
  assert.ok(bloco, `não achei o array ${nomeDoArray} em ${arquivo}`);
  return [...bloco[1].matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]);
}

test('toda recompensa e todo brinde da Loja tem título e descrição nos três idiomas', () => {
  const { LANGUAGES, _DICTS_FOR_TESTS } = require('../lib/i18n.js');
  const familias = [
    ['loja.reward', idsDeArray(path.join('screens', 'LojaScreen.js'), 'REWARDS')],
    ['loja.brinde', idsDeArray(path.join('lib', 'brindes.js'), 'BRINDES')],
  ];

  const faltando = [];
  for (const [prefixo, ids] of familias) {
    assert.ok(ids.length > 0, `nenhum id lido para ${prefixo}.* — o parser quebrou`);
    for (const id of ids) {
      for (const campo of ['title', 'description']) {
        const chave = `${prefixo}.${id}.${campo}`;
        for (const lang of LANGUAGES) {
          const v = _DICTS_FOR_TESTS[lang][chave];
          if (typeof v !== 'string' || v.trim() === '') faltando.push(`${lang}: ${chave}`);
        }
      }
    }
  }

  assert.equal(
    faltando.length,
    0,
    `${faltando.length} chave(s) da Loja montada(s) em runtime sem tradução — ` +
      `a tela mostraria o nome da chave:\n  ` + faltando.join('\n  ')
  );
});

test('o dicionário não acumula chave morta (definida e nunca usada)', () => {
  const definidas = chavesDefinidas();
  const usadas = new Set(chavesUsadas().keys());

  // Chave dinâmica é usada por prefixo, então não conta como morta.
  const mortas = [...definidas].filter(
    (k) => !usadas.has(k) && !PREFIXOS_DINAMICOS.some((p) => k.startsWith(p))
  );

  // Aviso, não falha: chave morta não quebra ninguém, mas acumular lixo faz a
  // tradução de idioma novo custar mais caro do que precisa.
  if (mortas.length > 0) {
    console.log(
      `\n  [aviso] ${mortas.length} chave(s) no dicionário sem uso no código: ` +
        mortas.slice(0, 10).join(', ') +
        (mortas.length > 10 ? ` ... e mais ${mortas.length - 10}` : '')
    );
  }
  assert.ok(true);
});
