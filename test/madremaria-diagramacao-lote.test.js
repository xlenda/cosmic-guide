// O LOTE DA MADRE MARIA — o portão da diagramação aplicada. (12/09/2026)
//
// POR QUE ESTE ARQUIVO EXISTE. As três telas deste lote trocaram o separador de
// seção: saiu o `borderTopWidth` (a LINHA RETA cortando a tela, que é o defeito
// nº 1 dos 66 prints do concorrente) e entrou components/FaixaCurva.js (chão
// próprio com a borda de cima em onda). E saiu a largura de leitura escrita em
// pixels na própria tela, e entrou components/ColunaLeitura.js.
//
// As duas trocas são FÁCEIS DE DESFAZER SEM PERCEBER: um `borderTopWidth: 1`
// numa seção nova, um `maxWidth: 560` copiado de outra tela, e o lote volta ao
// que era sem quebrar nada nem aparecer em diff de revisão. Este teste é o que
// morde nesse dia.
//
// O QUE ELE NÃO É. Não é teste de aparência (não existe react-test-renderer no
// projeto, e não há como medir pixel aqui). É teste de ESTRUTURA DO CÓDIGO — a
// mesma técnica de test/diagramacaoPecas.test.js, que já guarda as peças.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// __dirname e não import.meta: o runner transpila para CommonJS.
const RAIZ = path.join(__dirname, '..');
const leia = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');

/** As três telas do lote. Quem aplicar a diagramação numa quarta acrescenta
 *  aqui — a lista é o contrato do que já foi convertido, não um desejo. */
const LOTE = [
  'madremaria/screens/PrivacidadScreen.js',
  'madremaria/screens/MetodoScreen.js',
  'madremaria/screens/AyudaScreen.js',
];

test('as três telas do lote montam as peças de diagramação do Cosmic', () => {
  for (const arq of LOTE) {
    const fonte = leia(arq);
    assert.match(
      fonte,
      /import FaixaCurva from '\.\.\/\.\.\/components\/FaixaCurva'/,
      `${arq} não importa a faixa curva`
    );
    assert.match(
      fonte,
      /import ColunaLeitura from '\.\.\/\.\.\/components\/ColunaLeitura'/,
      `${arq} não importa a coluna de leitura`
    );
    // Importar não basta: tem que MONTAR. Um import órfão passaria no teste
    // acima e deixaria a tela exatamente como era.
    assert.match(fonte, /<FaixaCurva\b/, `${arq} importa a faixa e não a monta`);
    assert.match(fonte, /<ColunaLeitura\b/, `${arq} importa a coluna e não a monta`);
  }
});

test('toda faixa leva semente — sem ela, todas desenham a MESMA onda', () => {
  // Duas faixas com a mesma curva são papel de parede, que é o oposto do
  // objetivo: a onda existe para dizer "mudou de assunto", e uma onda repetida
  // não diz nada. `semente` sem valor cai no `tom`, e como os tons se repetem
  // de propósito (noite/ameixa alternando), sem semente a tela inteira sairia
  // com duas curvas só.
  for (const arq of LOTE) {
    const fonte = leia(arq);
    const faixas = fonte.match(/<FaixaCurva\b[^>]*>/g) || [];
    assert.ok(faixas.length > 0, `${arq} não tem nenhuma faixa`);
    for (const faixa of faixas) {
      assert.match(faixa, /\bsemente=/, `${arq}: faixa sem semente -> ${faixa}`);
    }
  }
});

test('o separador de seção NÃO voltou a ser uma linha reta', () => {
  // O teste que morde de verdade. `borderTopWidth` é permitido em RODAPÉ de
  // caixa (o fio embaixo da ficha, a barra do botão de voltar), mas nunca mais
  // como separador ENTRE SEÇÕES — e é por isso que a busca é pelo par
  // borderTop* + `bordeSuave` dentro de um estilo cujo nome é de seção.
  const NOMES_DE_SECAO = /^\s*(seccion|escribir|cierre|faixa\w*)\s*:\s*\{/;
  for (const arq of LOTE) {
    const linhas = leia(arq).split('\n');
    for (let i = 0; i < linhas.length; i += 1) {
      if (!NOMES_DE_SECAO.test(linhas[i])) continue;
      // Lê o corpo do estilo até a chave que o fecha.
      const corpo = [];
      for (let j = i + 1; j < linhas.length && !/^\s*\},\s*$/.test(linhas[j]); j += 1) {
        corpo.push(linhas[j]);
      }
      const texto = corpo.join('\n');
      assert.doesNotMatch(
        texto,
        /borderTopWidth/,
        `${arq}: o estilo de seção em "${linhas[i].trim()}" voltou a usar fio reto`
      );
    }
  }
});

test('a largura de leitura não volta a ser número de pixel na tela', () => {
  // Era `maxWidth: 560` (em MetodoScreen e AyudaScreen, no ScrollView) e
  // `const ANCHO_LECTURA = 560` (em PrivacidadScreen). Os três capavam TUDO na
  // mesma largura — inclusive a faixa, que precisa sangrar de ponta a ponta
  // para ser chão e não card. Quem mede legibilidade mede em CARACTERES POR
  // LINHA, e é isso que ColunaLeitura faz contra type.corpo.fontSize.
  for (const arq of LOTE) {
    const fonte = leia(arq);
    // Só em linha de código: a palavra pode aparecer em comentário explicando
    // justamente que ela saiu.
    const codigo = fonte
      .split('\n')
      .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .join('\n');
    assert.doesNotMatch(
      codigo,
      /maxWidth:\s*\d{3}/,
      `${arq}: largura de leitura voltou a ser pixel cru`
    );
  }
});

test('o espaço das telas do lote sai da escala, não de número cru', () => {
  // Mesma regra de test/diagramacaoPecas.test.js, agora para as telas. Os
  // valores vêm de `space.*` (a fundação) ou de `espacio.*` (a escala da Madre
  // Maria, que é dela e continua valendo — ver madremaria/theme.js). O que não
  // pode é número solto.
  for (const arq of LOTE) {
    const fonte = leia(arq);
    const crus = fonte.match(/(padding|margin|gap)[A-Za-z]*:\s*(\d+)(?!\d*%)/g) || [];
    // 0/1/2 são exceções conscientes: espessura de fio e ajuste de antialias.
    const proibidos = crus.filter((m) => !/:\s*(0|1|2)$/.test(m));
    assert.deepEqual(proibidos, [], `${arq} tem espaço em número cru: ${proibidos.join(', ')}`);
  }
});

test('a alma da Madre Maria não foi uniformizada pela diagramação', () => {
  // A REGRA QUE MANDA. O briefing é explícito: se a diagramação nova brigar com
  // a identidade dela, a alma ganha. As telas continuam lendo o tema DELA
  // (madremaria/theme.js), e o fio vermelho continua atrás de todas as três.
  // Este teste existe para que "aplicar a diagramação" numa quarta tela nunca
  // signifique trocar o tema dela pelo do Cosmic.
  for (const arq of LOTE) {
    const fonte = leia(arq);
    assert.match(fonte, /from '\.\.\/theme'/, `${arq} parou de ler o tema da Madre Maria`);
    assert.match(fonte, /<HiloFondo\b/, `${arq} perdeu o fio vermelho no fundo`);
  }
});
