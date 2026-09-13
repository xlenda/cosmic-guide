// Prova que o portão dos ícones REPROVA cada forma do defeito real:
// a build publicada em 13/09/2026 pedia
// assets/node_modules/@expo/vector-icons/.../Ionicons.ttf, a Vercel tinha
// descartado a pasta, e o fallback SPA devolvia index.html com status 200 —
// todo ícone do app virou quadrado vazio sem nenhum 404 pra denunciar.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { verificarAssets, corrigirAssets } = require('../scripts/verificar-assets-build');

const FONTE = 'assets/_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb.ttf';

// Monta uma build mínima e sã: bundle referencia a fonte, fonte existe no
// disco no caminho exato. Cada teste degrada UM aspecto dela.
function buildSa() {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-assets-'));
  const base = path.join(raiz, 'cosmic-guide');
  fs.mkdirSync(path.join(base, '_expo', 'static', 'js', 'web'), { recursive: true });
  fs.writeFileSync(path.join(base, 'index.html'), '<html></html>');
  fs.writeFileSync(
    path.join(base, '_expo', 'static', 'js', 'web', 'AppEntry-abc.js'),
    `var f="${FONTE}";`
  );
  fs.mkdirSync(path.join(base, path.dirname(FONTE)), { recursive: true });
  fs.writeFileSync(path.join(base, FONTE), 'ttf-bytes');
  return { raiz, base };
}

test('build sã passa', () => {
  const { raiz } = buildSa();
  assert.deepEqual(verificarAssets(raiz), []);
  fs.rmSync(raiz, { recursive: true, force: true });
});

test('MUTAÇÃO: a fonte referenciada some do disco (o defeito exato de 13/09)', () => {
  const { raiz, base } = buildSa();
  fs.rmSync(path.join(base, FONTE));
  const problemas = verificarAssets(raiz);
  assert.equal(problemas.length, 1, problemas.join(' | '));
  assert.match(problemas[0], /não existe no disco/);
  fs.rmSync(raiz, { recursive: true, force: true });
});

test('MUTAÇÃO: o sed não rodou — .js ainda pede assets/node_modules/', () => {
  const { raiz, base } = buildSa();
  // mv aconteceu (arquivo está em _modules) mas a referência ficou pra trás:
  // o bundle pede um caminho que não existe mais.
  fs.writeFileSync(
    path.join(base, '_expo', 'static', 'js', 'web', 'AppEntry-abc.js'),
    `var f="${FONTE.replace('_modules', 'node_modules')}";`
  );
  const problemas = verificarAssets(raiz);
  assert.ok(
    problemas.some((p) => /ainda referencia assets\/node_modules\//.test(p)),
    problemas.join(' | ')
  );
  fs.rmSync(raiz, { recursive: true, force: true });
});

test('MUTAÇÃO: o mv não rodou — pasta node_modules sobrou (a Vercel descarta)', () => {
  const { raiz, base } = buildSa();
  fs.mkdirSync(path.join(base, 'assets', 'node_modules'), { recursive: true });
  const problemas = verificarAssets(raiz);
  assert.ok(
    problemas.some((p) => /assets\/node_modules\/ existe na build/.test(p)),
    problemas.join(' | ')
  );
  fs.rmSync(raiz, { recursive: true, force: true });
});

test('MUTAÇÃO: bundle sem nenhuma fonte — vector-icons sumiu do build', () => {
  const { raiz, base } = buildSa();
  fs.writeFileSync(path.join(base, '_expo', 'static', 'js', 'web', 'AppEntry-abc.js'), 'var f=1;');
  const problemas = verificarAssets(raiz);
  assert.ok(problemas.some((p) => /nenhuma fonte \.ttf referenciada/.test(p)), problemas.join(' | '));
  fs.rmSync(raiz, { recursive: true, force: true });
});

test('aceita dist/ crua também (sem o aninhamento cosmic-guide/)', () => {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-dist-'));
  fs.mkdirSync(path.join(raiz, '_expo', 'static', 'js', 'web'), { recursive: true });
  fs.writeFileSync(path.join(raiz, '_expo', 'static', 'js', 'web', 'a.js'), `var f="${FONTE}";`);
  fs.mkdirSync(path.join(raiz, path.dirname(FONTE)), { recursive: true });
  fs.writeFileSync(path.join(raiz, FONTE), 'ttf-bytes');
  assert.deepEqual(verificarAssets(raiz), []);
  fs.rmSync(raiz, { recursive: true, force: true });
});

// corrigirAssets existe pra que uma build montada à mão aplique o MESMO passo
// do deploy-vercel.sh com um comando, em vez de alguém reescrever mv+sed de
// memória — que foi exatamente como o defeito entrou duas vezes.
test('corrigirAssets conserta uma build crua do expo export', () => {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-fix-'));
  const cru = FONTE.replace('_modules', 'node_modules');
  fs.mkdirSync(path.join(raiz, '_expo', 'static', 'js', 'web'), { recursive: true });
  fs.writeFileSync(path.join(raiz, '_expo', 'static', 'js', 'web', 'a.js'), `var f="${cru}";`);
  fs.mkdirSync(path.join(raiz, path.dirname(cru)), { recursive: true });
  fs.writeFileSync(path.join(raiz, cru), 'ttf-bytes');

  assert.ok(verificarAssets(raiz).length > 0, 'build crua tinha que estar reprovada');
  assert.equal(corrigirAssets(raiz), true);
  assert.deepEqual(verificarAssets(raiz), [], 'depois do passo tinha que passar');
  assert.ok(fs.existsSync(path.join(raiz, FONTE)), 'fonte tinha que existir no caminho novo');
  // Idempotente: rodar de novo não muda nada e continua são.
  assert.equal(corrigirAssets(raiz), false);
  assert.deepEqual(verificarAssets(raiz), []);
  fs.rmSync(raiz, { recursive: true, force: true });
});
