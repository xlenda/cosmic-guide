/* TELA QUE NÃO ABRE — o portão que faltava (12/09/2026)
 *
 * O Álbum do Tarô foi entregue com `space.` em 17 lugares e `type.` em 7, mas
 * o import trazia só `{ colors, gradients }`. A tela mostrava
 * "Algo deu errado — space is not defined" no lugar do conteúdo.
 *
 * POR QUE NENHUM PORTÃO EXISTENTE PEGOU: os testes de diagramação verificam
 * TEXTO-FONTE — se a tela usa FaixaCurva, se sobrou número cru. Uma tela que
 * usa tudo certo e não importa nada passa em todos eles com louvor, e só
 * quebra quando alguém ABRE. Foi um revisor humano navegando que achou.
 *
 * O que este teste faz: para cada arquivo de tela e componente, confere que
 * todo símbolo do theme que ele USA em código vivo ele também IMPORTA.
 *
 * CUIDADO COM FALSO POSITIVO (custou uma rodada): 'space' e 'type' são
 * palavras inglesas comuns. `missoes365.en.js` tem "the other person's space"
 * no meio de uma missão traduzida, e um regex ingênuo acusa. Por isso este
 * teste olha só arquivos de UI (screens/ e components/) e exige a forma
 * `simbolo.propriedade` fora de string e de comentário.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const SIMBOLOS = ['space', 'type', 'colors', 'gradients'];

/** Remove comentários e literais de string: só sobra código que executa.
 *
 * A ordem importa e custou duas rodadas:
 *  1. blocos /* … *\/ primeiro;
 *  2. depois as STRINGS — senão uma URL com // dentro de aspas viraria
 *     comentário e comeria o resto da linha;
 *  3. só então os // de fim de linha. Sem este passo, a nota
 *     `ameixa: 'rgba(...)',  // família gradients.hero` acusava FaixaCurva.js
 *     de usar `gradients` sem importar — comentário no MEIO da linha, não no
 *     começo, e o filtro que só olha o início da linha não pega.
 */
function codigoVivo(fonte) {
  // O bloco vira as MESMAS quebras de linha que ocupava: trocar por um espaço
  // só junta linhas, e o `//` de fim de linha da linha seguinte deixa de estar
  // no fim — foi o que fez a nota `// família gradients.hero` sobreviver ao
  // filtro e acusar FaixaCurva.js três vezes seguidas.
  const semBloco = fonte.replace(/\/\*[\s\S]*?\*\//g, (bloco) => bloco.replace(/[^\n]/g, ' '));
  return semBloco
    .split('\n')
    .map((linha) => linha
      // as strings desta LINHA primeiro: uma URL com // dentro de aspas não
      // pode virar comentário e comer o resto
      .replace(/'(?:[^'\\]|\\.)*'/g, "''")
      .replace(/"(?:[^"\\]|\\.)*"/g, '""')
      .replace(/`(?:[^`\\]|\\.)*`/g, '``')
      // e só então o // de fim de linha
      .replace(/\/\/.*$/, ''))
    .join('\n');
}

/* Os imports saem do fonte BRUTO, não do código vivo: codigoVivo() esvazia
 * strings, e `from '../theme'` viraria `from ''` — o caminho some e o teste
 * acusaria TODAS as telas de não importar nada. Foi o que aconteceu na
 * primeira versão deste arquivo.
 * Só os comentários saem aqui, para um import comentado não valer. */
function importadosDoTema(bruto) {
  const semComentario = bruto
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n');
  const achados = [];
  const re = /import\s*\{([^}]+)\}\s*from\s*['"`][^'"`]*theme['"`]/g;
  let m;
  while ((m = re.exec(semComentario)) !== null) {
    for (const parte of m[1].split(',')) {
      const nome = parte.trim().split(/\s+as\s+/)[0];
      if (nome) achados.push(nome);
    }
  }
  return achados;
}

function telasEComponentes() {
  const achados = [];
  const varrer = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const nome of fs.readdirSync(dir)) {
      const p = path.join(dir, nome);
      if (fs.statSync(p).isDirectory()) { varrer(p); continue; }
      if (nome.endsWith('.js')) achados.push(p);
    }
  };
  varrer(path.join(RAIZ, 'screens'));
  varrer(path.join(RAIZ, 'components'));
  varrer(path.join(RAIZ, 'madremaria', 'screens'));
  varrer(path.join(RAIZ, 'madremaria', 'components'));
  return achados;
}

function simbolosFaltando(arquivo) {
  const bruto = fs.readFileSync(arquivo, 'utf8');
  const vivo = codigoVivo(bruto);
  const importados = importadosDoTema(bruto);
  return SIMBOLOS.filter((s) => new RegExp(`\\b${s}\\.[A-Za-z]`).test(vivo) && !importados.includes(s));
}

test('nenhuma tela usa um símbolo do theme sem importar (a tela quebraria ao abrir)', () => {
  const quebradas = [];
  for (const arquivo of telasEComponentes()) {
    const faltando = simbolosFaltando(arquivo);
    if (faltando.length) {
      quebradas.push(`${path.relative(RAIZ, arquivo).replace(/\\/g, '/')} usa ${faltando.join(', ')} sem importar`);
    }
  }
  assert.deepEqual(
    quebradas,
    [],
    'Tela(s) que mostrariam "X is not defined" no lugar do conteúdo:\n  ' + quebradas.join('\n  '),
  );
});

test('o portão enxerga arquivos de verdade (não passa por vacuidade)', () => {
  const arquivos = telasEComponentes();
  assert.ok(arquivos.length > 60, `esperava 60+ telas/componentes, achei ${arquivos.length}`);
  // e pelo menos um deles importa do theme, senão o parser está errado
  const comTema = arquivos.filter((a) => importadosDoTema(fs.readFileSync(a, 'utf8')).length > 0);
  assert.ok(comTema.length > 30, `esperava 30+ arquivos importando do theme, achei ${comTema.length}`);
});

test('não acusa palavra inglesa dentro de texto (o falso positivo que custou uma rodada)', () => {
  // 'space' e 'type' aparecem em prosa traduzida; só a forma `space.propriedade`
  // fora de string conta. Este caso é o que fez o primeiro scanner errar.
  const fingido = [
    "const a = 'takes up the other person space here';",
    '// space.secao num comentário não conta',
    'const b = `type.corpo dentro de template`;',
  ].join('\n');
  const vivo = codigoVivo(fingido);
  for (const s of ['space', 'type']) {
    assert.ok(
      !new RegExp(`\\b${s}\\.[A-Za-z]`).test(vivo),
      `${s} foi acusado dentro de string/comentário — o filtro de código vivo falhou`,
    );
  }
});
