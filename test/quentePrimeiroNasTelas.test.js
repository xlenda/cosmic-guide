// QUENTE PRIMEIRO, FICHA DEPOIS — a lei do dono, travada na ORDEM DA TELA.
//
// Por que este arquivo existe: a auditoria de 04/08/2026 varreu o app inteiro
// atrás da lei e achou um padrão que nenhum teste pegava. Em quatro superfícies
// o MOTOR já estava conforme — a frase de vida real existia, escrita, testada e
// no golden — e era o JSX que mostrava a ficha técnica primeiro. Os testes de
// lib/ liam o pack e passavam; a pessoa abria o app e lia "mapa diurno" ou
// "Ano 34 · casa 11 · Aquário" antes de qualquer motivo pra se importar.
//
// A lei, escrita: a primeira coisa que a tela mostra é a leitura em língua de
// conversa. O dado técnico (rótulo, título com número, chips, origem da
// contagem) não some — ele DESCE, e vira recibo do que já foi lido. Ela já
// estava dita em lib/transitoFase.js ("1. PRENDE PRIMEIRO, FONTE DEPOIS"), em
// lib/seita.js e até em comentário dentro de screens/ProfeccoesScreen.js. O que
// faltava era alguém conferindo o arquivo da TELA.
//
// Como estes testes conferem: por posição no código-fonte do JSX. É frágil de
// propósito — quebra quando alguém MOVE o bloco, que é exatamente o defeito que
// esta frente corrigiu. Se o teste quebrar por renomeação, atualize a âncora;
// se quebrar porque a ficha voltou pra cima, o teste está certo e a tela não.
//
// A varredura de 04/08 listou mais superfícies (ONDA B: Horóscopo, Calendário
// Lunar, ZodiacBody, Calendário Cósmico, resumo do Mapa). Quando cada uma for
// corrigida, o caso dela entra aqui embaixo.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SCREENS = path.join(__dirname, '..', 'screens');

function fonteDaTela(arquivo) {
  return fs.readFileSync(path.join(SCREENS, arquivo), 'utf8');
}

// O trecho de JSX entre duas âncoras. Recorta antes de comparar posições porque
// o mesmo campo costuma aparecer duas vezes no arquivo (o card disponível e o
// card de indisponível), e comparar índices no arquivo inteiro compararia
// blocos diferentes — passando por acidente.
function trecho(src, de, ate, origem) {
  const i = src.indexOf(de);
  assert.ok(i > -1, `${origem}: âncora inicial sumiu do arquivo — ${de}`);
  const j = src.indexOf(ate, i + de.length);
  assert.ok(j > i, `${origem}: âncora final sumiu depois da inicial — ${ate}`);
  return src.slice(i, j);
}

// O quente tem que aparecer ANTES de cada peça da ficha, no mesmo bloco.
function quenteAbre(bloco, quente, fichas, origem) {
  const q = bloco.indexOf(quente);
  assert.ok(q > -1, `${origem}: a abertura quente sumiu do bloco — ${quente}`);
  for (const ficha of fichas) {
    const f = bloco.indexOf(ficha);
    assert.ok(f > -1, `${origem}: a ficha sumiu do bloco (o dado não pode ser apagado, só descer) — ${ficha}`);
    assert.ok(
      q < f,
      `${origem}: a ficha "${ficha}" está ANTES da leitura "${quente}". A lei é quente primeiro, ficha depois.`
    );
  }
}

test('Home · Céu de hoje pra você — a chamada da fase abre, o trânsito e o grau descem', () => {
  // O motor (lib/transitoFase.js) devolve `chamada` por aspecto desde 01/08 e a
  // Home ignorava: mostrava só `a.text` (qual planeta sobre qual ponto) e a
  // `linhaCurta` (graus e prazo). Dois recibos, nenhuma leitura.
  const src = fonteDaTela('HomeScreen.js');
  const bloco = trecho(src, 'personalSkyBlocos.slice(0, 1)', 'home.sky.moreAspects', 'HomeScreen/céu de hoje');
  quenteAbre(bloco, '{b.chamada ?', ['{aspecto.text}', 'fase.linhaCurta'], 'HomeScreen/céu de hoje');
});

test('Mapa Astral · seita — a chamada abre, "mapa diurno/noturno" desce pra linha de ficha', () => {
  const src = fonteDaTela('BirthChartScreen.js');
  const bloco = trecho(src, 'testID="seita-secao"', 'testID="seita-toggle"', 'BirthChartScreen/seita');
  quenteAbre(bloco, '{seita.chamada}', ['{seita.seitaMapa}'], 'BirthChartScreen/seita');
});

test('Mapa Astral · profecção — o texto do ano abre, título e origem viram recibo', () => {
  const src = fonteDaTela('BirthChartScreen.js');
  const bloco = trecho(
    src,
    'chart.profeccao.disponivel &&',
    'chart.profeccao.detalhe.casaTradicao',
    'BirthChartScreen/profecção'
  );
  quenteAbre(
    bloco,
    '{chart.profeccao.texto}',
    ['{chart.profeccao.titulo}', '{chart.profeccao.origemRotulo}'],
    'BirthChartScreen/profecção'
  );
});

test('Profecções · card do ano — o texto abre, título e chips descem', () => {
  const src = fonteDaTela('ProfeccoesScreen.js');
  const bloco = trecho(src, 'testID="profeccoes-ano"', 'testID="profeccoes-fonte-ano"', 'ProfeccoesScreen/ano');
  quenteAbre(
    bloco,
    '{anual.texto}',
    ['{anual.titulo}', 'rotulos.casaDoAno', 'rotulos.senhorDoAno', 'testID="profeccoes-origem"'],
    'ProfeccoesScreen/ano'
  );
});

test('a ficha continua na tela — descer não é apagar', () => {
  // O erro oposto ao que esta frente corrigiu, e o mais fácil de cometer na
  // próxima limpeza: sumir com o dado em nome da leitura. O app mostra a conta
  // que fez; ela só não abre a porta.
  const birth = fonteDaTela('BirthChartScreen.js');
  const prof = fonteDaTela('ProfeccoesScreen.js');
  const home = fonteDaTela('HomeScreen.js');
  for (const [origem, src, campos] of [
    ['BirthChartScreen', birth, ['{seita.seitaMapa}', '{chart.profeccao.titulo}', '{chart.profeccao.origemRotulo}']],
    ['ProfeccoesScreen', prof, ['{anual.titulo}', '{anual.casaProfectada}', '{anual.senhorDoAno}', '{anual.origemRotulo}']],
    ['HomeScreen', home, ['{aspecto.text}', 'fase.linhaCurta']],
  ]) {
    for (const campo of campos) {
      assert.ok(src.includes(campo), `${origem}: ${campo} sumiu da tela — a ficha desce, não se apaga`);
    }
  }
});
