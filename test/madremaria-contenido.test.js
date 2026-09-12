// Portao do conteudo. Substitui os 4 testes de paridade de idioma do Cosmic
// Guide, que nao vieram: la eles guardavam PT/ES/EN e cinco temas; aqui existe
// um idioma e um tema, entao o que precisa ser travado e outro.
//
// O que este arquivo impede:
//  - uma carta sumir ou entrar duplicada na extracao;
//  - um campo vir vazio e a tela renderizar um bloco em branco;
//  - um id sem JPG correspondente, que so apareceria como carta invisivel;
//  - um fato historico sem ano ou sem fonte, num app cuja tela diz DATO VERIFICABLE.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

/* FUSAO COSMIC GUIDE: a raiz do app da Madre deixou de ser a raiz do repo —
 * ela agora mora em madremaria/. Tudo que este arquivo le por RAIZ (lib/,
 * datos/, screens/) esta la dentro. */
const RAIZ = join(__dirname, '..', 'madremaria');
const CARTAS = JSON.parse(readFileSync(join(RAIZ, 'datos', 'cartas.json'), 'utf8'));

const NAIPES = ['paus', 'copas', 'espadas', 'ouros'];
const CAMPOS = ['nombre', 'escena', 'consejo', 'consejoInv', 'amor'];
const ID_VALIDO = /^(major-(0\d|1\d|2[01])|(paus|copas|espadas|ouros)-(0[1-9]|1[0-4]))$/;

test('o baralho tem exatamente 78 cartas, sem id repetido', () => {
  assert.equal(CARTAS.length, 78);
  assert.equal(new Set(CARTAS.map((c) => c.id)).size, 78);
});

test('sao 22 arcanos maiores e 14 cartas por naipe', () => {
  assert.equal(CARTAS.filter((c) => c.id.startsWith('major-')).length, 22);
  for (const naipe of NAIPES) {
    assert.equal(
      CARTAS.filter((c) => c.id.startsWith(`${naipe}-`)).length,
      14,
      `naipe ${naipe} nao tem 14 cartas`
    );
  }
});

test('todo id segue o padrao canonico', () => {
  for (const c of CARTAS) {
    assert.match(c.id, ID_VALIDO, `id fora do padrao: ${c.id}`);
  }
});

test('nenhum campo de texto vem vazio', () => {
  for (const c of CARTAS) {
    for (const campo of CAMPOS) {
      assert.ok(
        typeof c[campo] === 'string' && c[campo].trim().length > 0,
        `${c.id} tem ${campo} vazio`
      );
    }
  }
});

test('toda carta tem a arte correspondente em assets/tarot', () => {
  const faltando = CARTAS.filter((c) => !existsSync(join(RAIZ, '..', 'assets', 'madremaria', 'tarot', `${c.id}.jpg`)));
  assert.deepEqual(faltando.map((c) => c.id), [], 'JPG faltando');
});

test('lib/imagenes.js mapeia as 78 cartas', () => {
  const fonte = readFileSync(join(RAIZ, 'lib', 'imagenes.js'), 'utf8');
  for (const c of CARTAS) {
    assert.ok(fonte.includes(`'${c.id}': require(`), `${c.id} nao esta em lib/imagenes.js`);
  }
});

// A lente de amor e o corpo da leitura. Se ela virar uma linha solta, a tela
// perde o texto que justifica o produto — entao o tamanho minimo e travado.
test('a lente de amor tem corpo de leitura, nao uma frase solta', () => {
  for (const c of CARTAS) {
    assert.ok(c.amor.length >= 60, `${c.id}: lente de amor curta demais (${c.amor.length} chars)`);
  }
});

// Doutrina: nenhuma lente pode prometer desfecho nem assumir o genero de quem
// esta do outro lado. As lentes vieram curadas do Cosmic Guide, mas quem edita
// datos/cartas.json a mao depois nao tem como saber disso — por isso o portao.
test('nenhuma lente promete desfecho nem assume genero da outra pessoa', () => {
  const PROIBIDO = [
    /\bvolver[aá]\b/i,
    /\bregresar[aá]\b/i,
    /\bva a volver\b/i,
    /\bte va a buscar\b/i,
    /\bgarantiza\b/i,
    /\bseguro que (vuelve|regresa)\b/i,
    /\bsu novio\b/i,
    /\bsu novia\b/i,
  ];
  for (const c of CARTAS) {
    for (const campo of ['amor', 'consejo', 'consejoInv']) {
      for (const padrao of PROIBIDO) {
        assert.ok(!padrao.test(c[campo]), `${c.id}.${campo} casa com o padrao proibido ${padrao}`);
      }
    }
  }
});

// hechos.js e escrito a mao (curadoria) e por isso e o mais fragil do conteudo.
// O teste roda so quando o arquivo existir, para nao travar o build antes dele.
test('os 22 fatos historicos cobrem os arcanos maiores, com ano e fonte', async (t) => {
  const caminho = join(RAIZ, 'datos', 'hechos.js');
  if (!existsSync(caminho)) return t.skip('datos/hechos.js ainda nao existe');

  const { HECHOS } = await import(`file://${caminho.replace(/\\/g, '/')}`);
  assert.ok(HECHOS, 'hechos.js nao exporta HECHOS');

  for (let i = 0; i <= 21; i += 1) {
    const id = `major-${String(i).padStart(2, '0')}`;
    const h = HECHOS[id];
    assert.ok(h, `falta fato para ${id}`);
    assert.ok(Number.isInteger(h.anios), `${id}: 'anios' precisa ser inteiro`);
    assert.ok(String(h.titular || '').trim(), `${id}: titular vazio`);
    assert.ok(String(h.cuerpo || '').trim(), `${id}: cuerpo vazio`);
    assert.match(String(h.fuente || ''), /\b\d{4}\b/, `${id}: fonte sem ano de 4 digitos`);
  }
});
