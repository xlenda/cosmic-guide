// O LOTE DAS TELAS DE DADO E NÚMERO — o portão. (12/09/2026)
//
// Irmão de test/diagramacaoPecas.test.js (que guarda AS PEÇAS) e de
// test/diagramacaoLoteTempo.test.js (que guarda o lote de tempo). Este guarda
// as SEIS telas de dado e número: Progresso, Memória Cósmica, Retrospectiva
// Mensal, Tokens, Nós Hoje e Nossa História.
//
// POR QUE UM TESTE DE FONTE, E NÃO DE RENDER. Não há react-test-renderer no
// projeto (conferido 12/09/2026, mesma nota dos irmãos) e o repo inteiro testa
// lógica em lib/ + o TEXTO dos componentes. O que estas telas têm de testável
// sem render é justamente o que volta sozinho na próxima mexida.
//
// AS LEIS GUARDADAS AQUI
//   1. NUNCA FABRICAR. É a lei nº 1 da casa e este é o lote onde ela mais
//      arrisca: seis telas de número, e a fileira de três é justamente o lugar
//      onde uma porcentagem bonita caberia. Nenhuma fileira daqui carrega
//      índice — só contagem de coisa que aconteceu.
//   2. cada tela recebeu alguma peça ou, no mínimo, a escala;
//   3. duas a quatro faixas por tela — cinco vira textura;
//   4. toda faixa tem SEMENTE, e sementes distintas dentro do mesmo arquivo;
//   5. o ESTADO VAZIO usa `rasa` — a faixa não vira bloco de cor sem conteúdo;
//   6. o espaço e o corpo de texto saem da ESCALA, não de número cru.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const leia = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');

// Tira comentários: o que vale é o que o arquivo FAZ, não o que ele diz que
// faz. Sem isto, um comentário citando "FaixaCurva" passaria por uso — e este
// lote tem comentários LONGOS explicando justamente por que certas telas NÃO
// levaram faixa, que é exatamente o texto que enganaria a busca.
function semComentarios(fonte) {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

// `faixas: false` é decisão declarada, não esquecimento:
//   · MonthlyWrapped — cada slide JÁ é um chão inteiro (LinearGradient de tela
//     cheia, um por assunto). Faixa por cima é o "dois fundos brigando" que o
//     guia proíbe. Mesma decisão de RetroLuaCheiaScreen no lote de tempo.
//   · NosHoje e NossaHistoria — são CASCAS: o conteúdo inteiro são as telas
//     hospedadas nas abas. O que existe aqui é chrome (título e barra de
//     abas), e barra de abas não é seção — faixa em volta dela seria cor por
//     cor, sem assunto embaixo.
const LOTE = [
  { arq: 'screens/ProgressoScreen.js', faixas: true },
  { arq: 'screens/CosmicMemoryScreen.js', faixas: true },
  { arq: 'screens/TokensScreen.js', faixas: true },
  { arq: 'screens/MonthlyWrappedScreen.js', faixas: false },
  { arq: 'screens/NosHojeScreen.js', faixas: false },
  { arq: 'screens/NossaHistoriaScreen.js', faixas: false },
];

// =====================================================================
// 1 · NUNCA FABRICAR — a lei da casa, e o risco real deste lote
// =====================================================================

test('nenhuma fileira de três do lote carrega porcentagem — só contagem real', () => {
  // "Amor 75%" foi recusado duas vezes pelo dono, e a referência do
  // concorrente mostra "2% taxa de aceitação" que NÃO se copia. A fileira é
  // justamente onde um índice bonito caberia — então é aqui que se guarda.
  for (const { arq } of LOTE) {
    const codigo = semComentarios(leia(arq));
    let i = codigo.indexOf('<FileiraDeTres');
    while (i > 0) {
      const bloco = codigo.slice(i, codigo.indexOf('/>', i));
      assert.doesNotMatch(
        bloco,
        /pct|%|porcent|percent/i,
        `${arq}: entrou porcentagem numa fileira — o número dela é contagem de coisa que aconteceu, não índice`
      );
      i = codigo.indexOf('<FileiraDeTres', i + 1);
    }
  }
});

test('o lote inteiro não imprime traço mudo no lugar de dado que não existe', () => {
  // O travessão é caractere legítimo dentro de FRASE. O que a lei proíbe é o
  // traço SOZINHO ocupando o lugar de um valor — a forma que ele sempre tem é
  // um ramo de ternário com um literal de um caractere só.
  const TRACO_SOZINHO = /[?:]\s*['"`]\s*[—–-]\s*['"`]/;
  for (const { arq } of LOTE) {
    const codigo = semComentarios(leia(arq));
    const achado = codigo.match(TRACO_SOZINHO);
    assert.equal(
      achado,
      null,
      `${arq}: achei ${achado && achado[0]} — traço mudo no lugar de dado ausente. ` +
        'Sem dado real a linha SOME (é o que TabelaDados e FileiraDeTres já fazem sozinhas).'
    );
  }
});

test('o resumo do mês do Progresso não perde o ZERO — 0 é valor real', () => {
  // O bug clássico do `if (!valor)`: mês sem memória nenhuma tem ZERO
  // memórias, e zero é um fato sobre o mês, não a ausência de um fato. A
  // TabelaDados já sabe disso (test/diagramacaoPecas.test.js guarda a peça);
  // o que se guarda AQUI é que a tela entrega o número cru pra ela, sem
  // filtrar antes com um `|| null` ou um `&&` que engoliria o zero.
  const codigo = semComentarios(leia('screens/ProgressoScreen.js'));
  const i = codigo.indexOf('<TabelaDados');
  assert.ok(i > 0, 'o resumo do mês perdeu a tabela');
  const bloco = codigo.slice(i, codigo.indexOf('/>', i));
  for (const campo of ['memoriesThisMonth', 'capsulesSealedThisMonth', 'reconectarChecks', 'agirDoneCount']) {
    assert.match(
      bloco,
      new RegExp(`valor: recap\\.${campo}\\s*[,}]`),
      `${campo} deixou de ir cru pra tabela — um "|| 0", "|| null" ou "&&" aqui transforma o zero real em linha que some`
    );
  }
});

// =====================================================================
// 2 · AS PEÇAS E AS FAIXAS
// =====================================================================

test('toda tela do lote recebeu a diagramação — nenhuma ficou de fora', () => {
  for (const { arq, faixas } of LOTE) {
    const codigo = semComentarios(leia(arq));
    assert.match(codigo, /from '\.\.\/theme'/, `${arq} não lê a fundação`);
    assert.match(codigo, /\bspace\./, `${arq} não usa a escala de espaço`);
    assert.match(codigo, /\btype\./, `${arq} não usa a escala tipográfica`);
    if (faixas) {
      assert.match(codigo, /<FaixaCurva/, `${arq} devia ter ganho faixa curva e não ganhou`);
    } else {
      assert.doesNotMatch(
        codigo,
        /<FaixaCurva/,
        `${arq} ganhou faixa: ou cada slide dela já é um chão inteiro, ou ela é casca de abas sem seção de conteúdo`
      );
    }
  }
});

test('duas a quatro faixas por tela — cinco vira textura', () => {
  for (const { arq, faixas } of LOTE) {
    if (!faixas) continue;
    const codigo = semComentarios(leia(arq));
    const n = (codigo.match(/<FaixaCurva/g) || []).length;
    assert.ok(n >= 2 && n <= 4, `${arq}: ${n} faixas — o guia manda 2 a 4 (5+ vira papel de parede)`);
  }
});

test('toda faixa tem semente, e duas faixas do mesmo arquivo nunca repetem a onda', () => {
  for (const { arq, faixas } of LOTE) {
    if (!faixas) continue;
    const codigo = semComentarios(leia(arq));
    // A tag da faixa é multilinha nestas telas — o [^>]* de uma linha só não
    // alcança a semente. O recorte vai da abertura até o primeiro '>'.
    const tags = codigo.match(/<FaixaCurva[\s\S]*?>/g) || [];
    const sementes = [];
    for (const tag of tags) {
      const m = tag.match(/semente="([^"]+)"/);
      assert.ok(m, `${arq}: faixa sem semente — sem ela todas desenham a MESMA onda`);
      sementes.push(m[1]);
    }
    assert.equal(
      new Set(sementes).size,
      sementes.length,
      `${arq}: semente repetida (${sementes.join(', ')}) — duas ondas iguais na mesma tela é papel de parede`
    );
  }
});

// =====================================================================
// 3 · O ESTADO VAZIO — o defeito ALTO que um revisor achou na Home
// =====================================================================

test('toda tela com faixa tem pelo menos uma faixa que fica RASA no vazio', () => {
  // Quem nunca usou o app vê estas telas ZERADAS: sem sequência, sem extrato,
  // sem lembrança. Uma onda de altura inteira em volta de um convite de três
  // linhas é uma faixa que virou bloco de cor sem conteúdo. O prop `rasa`
  // corta a caixa da onda pela metade sem redesenhar a curva — e o que se
  // guarda aqui é que ele está ligado a uma CONDIÇÃO, não fixo em true (uma
  // faixa sempre rasa não é estado vazio, é faixa menor).
  for (const { arq, faixas } of LOTE) {
    if (!faixas) continue;
    const codigo = semComentarios(leia(arq));
    assert.match(
      codigo,
      /rasa=\{[^}]+\}/,
      `${arq}: nenhuma faixa fica rasa no vazio — a tela zerada desenha onda inteira em volta de um convite de três linhas`
    );
  }
});

// =====================================================================
// 4 · A ESCALA, E O NÚMERO CRU QUE VOLTA SOZINHO
// =====================================================================

test('nenhuma folha de estilo do lote tem espaço cru — tudo sai da escala', () => {
  // O número cru de espaço é o defeito que volta: alguém acha 14 "melhor que
  // 16" e repõe, e com ele volta o aperto que a escala existe pra consertar.
  // Só `0` passa, e por um motivo: é o jeito de ANULAR um padding que uma
  // peça já traz (ColunaLeitura tem paddingHorizontal próprio) — zero não é
  // um degrau de espaço, é a ausência dele.
  for (const { arq } of LOTE) {
    const fonte = leia(arq);
    const folha = fonte.slice(fonte.indexOf('const styles = StyleSheet.create({'));
    const crus = (folha.match(/(?:padding|margin|gap)[A-Za-z]*:\s*\d+/g) || [])
      .filter((m) => !/:\s*0$/.test(m));
    assert.deepEqual(
      crus,
      [],
      `${arq}: espaço cru na folha (${crus.join(', ')}) — use space.grudado|junto|dentro|bloco|entre|secao|ar|respiro`
    );
  }
});

test('o corpo de texto do lote sai da escala — nada de fontSize cru fora das exceções', () => {
  // AS EXCEÇÕES, UMA A UMA — e todas são EMOJI ou NÚMERO DE CARTAZ. Nenhuma é
  // texto de leitura: esse desceu inteiro pra escala nas seis telas. Emoji não
  // tem entrelinha de parágrafo nem hierarquia de título, e o número de cartaz
  // é deliberadamente ACIMA da escala (que termina no display 32, título de
  // primeira dobra — não cartaz de tela cheia).
  const EXCECOES = {
    // 44/48 o número dentro do anel de sequência; 30 o emoji da conquista.
    'screens/ProgressoScreen.js': ['44', '48', '30'],
    // 40/46 o número do saldo dentro do cartão dourado.
    'screens/TokensScreen.js': ['40', '46'],
    // 96/104 o número de tela cheia dos slides; 30/38 o título de cartaz;
    // 72 o emoji do slide; 44 o do estado vazio.
    'screens/MonthlyWrappedScreen.js': ['96', '104', '30', '38', '72', '44'],
    // Estas três não têm UMA exceção: nada de texto nem de emoji sobrou fora
    // da escala nelas.
    'screens/CosmicMemoryScreen.js': [],
    'screens/NosHojeScreen.js': [],
    'screens/NossaHistoriaScreen.js': [],
  };

  for (const { arq } of LOTE) {
    const fonte = leia(arq);
    const folha = fonte.slice(fonte.indexOf('const styles = StyleSheet.create({'));
    const crus = (folha.match(/(?:fontSize|lineHeight):\s*(\d+)/g) || []).map((m) => m.split(/\s+/).pop());
    const proibidos = crus.filter((n) => !(EXCECOES[arq] || []).includes(n));
    assert.deepEqual(
      proibidos,
      [],
      `${arq}: fontSize/lineHeight cru fora da escala (${proibidos.join(', ')}) — use type.corpo/corpoCurto/apoio/nota`
    );
  }
});

test('ninguém repõe fontWeight depois do spread de type.* — negrito é hierarquia, não ênfase', () => {
  // A regra nº 4 do guia da fundação, e a que mais volta sozinha: alguém acha
  // que "ficou fraco" e põe um '700' depois do spread. Se falta destaque e não
  // é título, o que falta é ESPAÇO ou COR — nunca peso. (Os pesos que sobram
  // nas exceções acima são de estilos que NÃO espalham type.*: o número de
  // cartaz, que não está na escala justamente por ser cartaz.)
  for (const { arq } of LOTE) {
    const fonte = leia(arq);
    const folha = fonte.slice(fonte.indexOf('const styles = StyleSheet.create({'));
    const reincidentes = folha.match(/\.\.\.type\.[A-Za-z]+,[^}]*fontWeight/g) || [];
    assert.deepEqual(
      reincidentes,
      [],
      `${arq}: fontWeight reposto depois do spread de type.* (${reincidentes.join(' | ')}) — o que falta é espaço ou cor`
    );
  }
});
