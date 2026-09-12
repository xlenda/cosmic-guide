// O LOTE DAS TELAS DE TEMPO E DADO — o portão. (12/09/2026)
//
// Irmão de test/diagramacaoPecas.test.js (que guarda AS PEÇAS) e de
// test/diagramacaoLoteTelas.test.js (que guarda o lote da Comunidade). Este
// guarda as OITO telas de tempo e dado: Calendário Cósmico, Calendário Lunar,
// Profecções, Idade Real, Relatórios, Retrospectiva, Retrospectiva da Lua
// Cheia e Linha do Tempo.
//
// POR QUE UM TESTE DE FONTE, E NÃO DE RENDER. Não há react-test-renderer no
// projeto (conferido 12/09/2026, mesma nota dos dois irmãos) e o repo inteiro
// testa lógica em lib/ + o TEXTO dos componentes. O que estas telas têm de
// testável sem render é justamente o que volta sozinho na próxima mexida.
//
// AS LEIS GUARDADAS AQUI
//   1. NUNCA TRAÇO MUDO. É a lei nº 1 da casa e as duas telas mais densas em
//      dado deste lote a violavam: a Idade Real imprimia '—' no lugar da
//      idade quando a pesquisa não achou a data, e a grade do Calendário
//      Lunar imprimia '—' no lugar do glifo da fase quando a efeméride não
//      veio. Este é o teste que mais importa do arquivo — os outros são de
//      diagramação, este é de DOUTRINA.
//   2. cada tela do lote recebeu alguma peça ou, no mínimo, a escala;
//   3. duas a quatro faixas por tela — cinco vira textura;
//   4. toda faixa tem SEMENTE, e sementes distintas dentro do mesmo arquivo;
//   5. o corpo de texto sai da ESCALA, não de número cru;
//   6. a FILEIRA DE TRÊS deste lote não carrega porcentagem inventada.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const leia = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');

// Tira comentários: o que vale é o que o arquivo FAZ, não o que ele diz que
// faz. Sem isto, um comentário citando "FaixaCurva" passaria por uso — e este
// lote tem comentários LONGOS explicando justamente por que certas telas não
// levaram faixa, que é exatamente o texto que enganaria a busca.
function semComentarios(fonte) {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

// As oito telas. `faixas: false` é decisão declarada, não esquecimento:
//   · RetroLuaCheia — cada slide JÁ é um chão inteiro (LinearGradient de tela
//     cheia, um por assunto). Faixa por cima é o "dois fundos brigando".
const LOTE = [
  { arq: 'screens/CalendarioCosmicoScreen.js', faixas: true },
  { arq: 'screens/LunarCalendarScreen.js', faixas: true },
  { arq: 'screens/ProfeccoesScreen.js', faixas: true },
  { arq: 'screens/IdadeRealScreen.js', faixas: true },
  { arq: 'screens/ReportsScreen.js', faixas: true },
  { arq: 'screens/RetrospectivaScreen.js', faixas: true },
  { arq: 'screens/TimelineScreen.js', faixas: true },
  { arq: 'screens/RetroLuaCheiaScreen.js', faixas: false },
];

// =====================================================================
// 1 · NUNCA TRAÇO MUDO — a lei da casa, e o defeito real que este lote achou
// =====================================================================

test('NENHUMA tela do lote imprime traço mudo no lugar de dado que não existe', () => {
  // O travessão é caractere legítimo dentro de FRASE ("a idade aqui é conta,
  // não tabela — 2026 menos o ano da fonte"). O que a lei proíbe é o traço
  // SOZINHO ocupando o lugar de um valor: um literal de um caractere só,
  // renderizado como se fosse o dado.
  //
  // A busca é pelo traço isolado que cai num RAMO DE TERNÁRIO — que é
  // exatamente a forma que os dois defeitos tinham, e a única em que o traço
  // vira "o valor":
  //     {item.anosAtras === null ? '—' : item.idadeReal}
  //     {celula.phase ? celula.phase.emoji : '—'}
  // Restringir ao ternário é o que separa o defeito do uso legítimo: um
  // `String(iso).split('-')` no meio do arquivo é hífen de formato de data,
  // não dado ausente, e derrubar o teste por causa dele seria ruído (o
  // Calendário Cósmico tem dois, e são corretos).
  const TRACO_SOZINHO = /[?:]\s*['"`]\s*[—–-]\s*['"`]/;
  for (const { arq } of LOTE) {
    const codigo = semComentarios(leia(arq));
    const achado = codigo.match(TRACO_SOZINHO);
    assert.equal(
      achado,
      null,
      `${arq}: achei ${achado && achado[0]} — traço mudo no lugar de dado ausente. ` +
        'A lei da casa: sem dado real, a linha SOME ou a ausência é DECLARADA em palavra ' +
        '(a Idade Real tem tela.semData = "sem data"/"sin fecha"/"no date" nos três packs). ' +
        'Nunca um risco que a pessoa tem que adivinhar.'
    );
  }
});

test('a Idade Real mostra a ausência DECLARADA que o motor já devolve', () => {
  // O motor (lib/idadeReal.js → rotuloDeIdade) já resolve o caso null: ele
  // devolve `tela.semData`, traduzido. A tela jogava isso fora e punha o
  // traço. O conserto é NÃO escolher: imprimir o que veio.
  const codigo = semComentarios(leia('screens/IdadeRealScreen.js'));
  assert.match(
    codigo,
    /testID=\{`idade-numero-\$\{item\.id\}`\}\s*>\s*\{item\.idadeReal\}/,
    'a tela voltou a decidir sozinha o que mostrar quando não há data — o texto honesto é o do motor'
  );
  // E o pack tem mesmo o texto nos três idiomas, senão o conserto acima só
  // funciona em português.
  for (const lang of ['pt', 'es', 'en']) {
    const pack = leia(`lib/traducoes/idadeReal.${lang}.js`);
    assert.match(pack, /semData:\s*'[^']+'/, `${lang}: sumiu o texto de ausência declarada`);
  }
});

test('a grade do Calendário Lunar some com o glifo em vez de chutar um', () => {
  const codigo = semComentarios(leia('screens/LunarCalendarScreen.js'));
  assert.match(
    codigo,
    /\{celula\.phase \? <Text style=\{styles\.gradeFase\}>\{celula\.phase\.emoji\}<\/Text> : null\}/,
    'o glifo de fase voltou a ter um substituto — numa grade de 35 células o traço lê como mais um estado da Lua'
  );
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
        `${arq} ganhou faixa: cada slide dela já é um chão inteiro, e faixa por cima é dois fundos brigando`
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
    const tags = codigo.match(/<FaixaCurva[^>]*>/g) || [];
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
// 3 · A ESCALA, E O NÚMERO CRU QUE VOLTA SOZINHO
// =====================================================================

test('o corpo de texto do lote sai da escala — nada de fontSize cru na folha de estilo', () => {
  // O fontSize cru é o defeito que volta: alguém acha 14 "melhor que 15" e
  // repõe, e com ele volta a entrelinha apertada que a escala existe pra
  // consertar. As exceções abaixo são DELIBERADAS e estão comentadas no
  // próprio arquivo — número de cartaz e emoji, que não são texto de leitura.
  // AS EXCECOES, UMA A UMA — e todas sao EMOJI, GLIFO ou o numero de cartaz.
  // Nenhuma e texto de leitura: esse desceu inteiro pra escala nas oito telas.
  // Emoji nao tem entrelinha de paragrafo nem hierarquia de titulo — medir um
  // 🌕 pela escala tipografica seria usar a regua errada.
  const EXCECOES = {
    // 96/104: o numero de tela cheia dos slides, deliberado e ACIMA da escala
    // (que termina no display 32, titulo de primeira dobra, nao cartaz).
    // 72/44/20: emoji de slide, de estado vazio e do placar.
    'screens/RetroLuaCheiaScreen.js': ['96', '104', '72', '44', '20'],
    // 12: a estrelinha ✦ do divisor.
    'screens/IdadeRealScreen.js': ['12'],
    // 10 e o grupo de emojis do dia na grade; 40/20 as artes dos eventos;
    // 12 a estrelinha do divisor.
    'screens/CalendarioCosmicoScreen.js': ['10', '40', '20', '12'],
    // 56 o emoji da fase de hoje; 15 o glifo de cada dia na grade.
    'screens/LunarCalendarScreen.js': ['56', '15'],
    // 22 o emoji de cada linha do resumo; 40 o do estado vazio.
    'screens/RetrospectivaScreen.js': ['22', '40'],
    // 32 o emoji do estado vazio; 26 o cadeado da capsula.
    'screens/TimelineScreen.js': ['32', '26'],
    // Estas duas nao tem UMA excecao: nada de texto nem de emoji sobrou fora
    // da escala nelas.
    'screens/ReportsScreen.js': [],
    'screens/ProfeccoesScreen.js': [],
  };

  for (const { arq } of LOTE) {
    const fonte = leia(arq);
    const folha = fonte.slice(fonte.indexOf('const styles = StyleSheet.create({'));
    const crus = (folha.match(/fontSize:\s*(\d+)/g) || []).map((m) => m.split(/\s+/).pop());
    const proibidos = crus.filter((n) => !(EXCECOES[arq] || []).includes(n));
    assert.deepEqual(
      proibidos,
      [],
      `${arq}: fontSize cru fora da escala (${proibidos.join(', ')}) — use type.corpo/corpoCurto/apoio/nota`
    );
  }
});

// =====================================================================
// 4 · A FILEIRA DE TRÊS DO LOTE NÃO CARREGA NÚMERO INVENTADO
// =====================================================================

test('as fileiras do lote só mostram contagem real — nada de porcentagem', () => {
  // "Amor 75%" foi recusado duas vezes pelo dono, e a referência do
  // concorrente mostra "Amor 82%" que NÃO se copia. A fileira é justamente o
  // lugar onde uma porcentagem bonita caberia — então é aqui que se guarda.
  for (const arq of ['screens/ReportsScreen.js', 'screens/TimelineScreen.js']) {
    const codigo = semComentarios(leia(arq));
    const i = codigo.indexOf('<FileiraDeTres');
    assert.ok(i > 0, `${arq}: perdeu a fileira`);
    const bloco = codigo.slice(i, codigo.indexOf('/>', i));
    assert.doesNotMatch(
      bloco,
      /pct|%|porcent|percent/i,
      `${arq}: entrou porcentagem na fileira — o número dela é contagem de coisa que aconteceu, não índice`
    );
  }
});
