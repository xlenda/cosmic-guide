// O LOTE DE FORMULÁRIOS — onboarding, paywall e perfil. (12/09/2026)
//
// Mesmo padrão do test/diagramacaoPecas.test.js: sem react-test-renderer no
// projeto, o que se guarda é o TEXTO das telas. Aqui as leis são três, e
// todas são leis que já custaram caro quando quebradas em silêncio:
//
//   1. NÃO FABRICAR. A fileira de três números do concorrente ("4.9 Avaliação
//      | 100 mil+ leituras") NÃO entrou no paywall porque o Cosmic não tem
//      esses números. Se alguém plantar um depois, este teste cai.
//   2. NEGRITO É RARO. A lista de check do paywall destaca DUAS linhas entre
//      oito. Marcar tudo é marcar nada.
//   3. ESPAÇO PELA ESCALA. As telas do lote não voltam a usar número cru de
//      espaçamento — foi a origem do aperto que o dono reclamou.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const ler = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');

const PLANOS = ler('screens/PlanosScreen.js');
const PERGUNTAS = ler('screens/OnboardingPerguntasScreen.js');
const PERFIL = ler('screens/ProfileScreen.js');
const ESCOLHA = ler('screens/OnboardingChoiceScreen.js');

const LOTE = [
  ['PlanosScreen', PLANOS],
  ['OnboardingPerguntasScreen', PERGUNTAS],
  ['ProfileScreen', PERFIL],
  ['OnboardingChoiceScreen', ESCOLHA],
];

// =====================================================================
// 1. NÃO FABRICAR
// =====================================================================

test('o paywall NÃO inventa prova social — sem nota, sem contagem de leituras', () => {
  // A FileiraDeTres é a peça natural pro "4.9 | 100 mil+ leituras" do print.
  // Ela não entra aqui porque esses números não existem no Cosmic. O dia em
  // que existirem de verdade (vindos do servidor, não de um literal), este
  // teste muda junto — de propósito: a mudança tem que ser deliberada.
  assert.ok(
    !PLANOS.includes('FileiraDeTres'),
    'FileiraDeTres apareceu no paywall: só entra com número REAL, não com número escrito na mão'
  );

  // E nenhum literal de prova social plantado à mão.
  const inventados = [
    /\b\d+[.,]\d\s*(de\s*5|estrelas|★)/i,        // "4,9 de 5", "4.9 estrelas"
    /\b\d{2,3}\s*mil\+/i,                          // "100 mil+"
    /\b\d{1,3}\.\d{3}\+?\s*(leituras|avalia)/i,    // "37.400+ leituras"
    /\b\d+%\s*(de\s*)?(satisfa|aprova|acerto)/i,   // "98% de satisfação"
  ];
  for (const re of inventados) {
    assert.ok(!re.test(PLANOS), `o paywall ganhou um número inventado: ${re}`);
  }
});

// =====================================================================
// 2. NEGRITO É RARO
// =====================================================================

test('a lista de benefícios destaca POUCAS linhas, e as duas pontas da oferta', () => {
  const bloco = PLANOS.match(/const DESTAQUE_KEYS = new Set\(\[([\s\S]*?)\]\)/);
  assert.ok(bloco, 'DESTAQUE_KEYS sumiu do paywall');

  const chaves = bloco[1].match(/'[^']+'/g).map((c) => c.slice(1, -1));

  // MAX_DESTAQUE da peça é 3, e cada lista (solo/casal) só casa com 2 destas
  // chaves — a primeira e a última da sua própria lista. Se alguém marcar a
  // lista inteira, o número de chaves por lista estoura e isto cai.
  // MAX_DESTAQUE lido do TEXTO da peça: o runner transpila pra CommonJS e um
  // require de componente com JSX estoura ('Unexpected token'). Mesmo motivo
  // pelo qual o resto da suíte lê componente como string.
  const MAX_DESTAQUE = Number(ler('components/ListaCheck.js').match(/MAX_DESTAQUE = (\d+)/)[1]);
  assert.ok(MAX_DESTAQUE > 0, 'MAX_DESTAQUE sumiu da ListaCheck');
  for (const familia of ['solo.', '']) {
    const daLista = chaves.filter((k) =>
      familia === 'solo.' ? k.includes('.solo.') : !k.includes('.solo.')
    );
    assert.ok(
      daLista.length <= MAX_DESTAQUE,
      `a lista ${familia || 'casal'} pediu ${daLista.length} destaques; a peça só pinta ${MAX_DESTAQUE}`
    );
    assert.ok(daLista.length > 0, 'nenhum destaque: a lista inteira lê no mesmo tom');
  }

  // As duas que importam: a oferta (a 1ª) e a razão para acreditar (a 8ª).
  assert.ok(chaves.some((k) => k.endsWith('.1')), 'a linha da oferta perdeu o destaque');
  assert.ok(chaves.some((k) => k.endsWith('.8')), 'a razão para acreditar perdeu o destaque');
});

test('quem desenha a linha do benefício é a peça, não um estilo solto da tela', () => {
  assert.ok(PLANOS.includes('<ListaCheck'), 'a ListaCheck saiu do paywall');
  // benefitRow/benefitText eram o desenho antigo, 13/19 apertado e sem
  // destaque nenhum. Se voltarem, voltou o aperto junto.
  // Sem os comentários: o comentário que EXPLICA a remoção cita os dois nomes
  // de propósito, e contá-lo como reincidência tornaria o teste impossível de
  // satisfazer sem apagar a explicação.
  const codigo = PLANOS.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!codigo.includes('benefitRow'), 'benefitRow voltou: a peça foi contornada');
  assert.ok(!codigo.includes('styles.benefitText'), 'benefitText voltou: a peça foi contornada');
});

// =====================================================================
// 3. AS FAIXAS SEPARAM SEÇÃO, E SANGRAM
// =====================================================================

test('o paywall corta preço de benefício com faixa curva, não com nada', () => {
  const faixas = PLANOS.match(/<FaixaCurva/g) || [];
  assert.ok(faixas.length >= 2, 'o paywall voltou a ser um cartão só: preço e benefício sem corte');
  // Duas a quatro por tela é a regra da peça; cinco vira textura.
  assert.ok(faixas.length <= 4, `${faixas.length} faixas no paywall: acima de 4 a faixa vira textura`);
  // Sementes diferentes, senão as duas ondas saem idênticas e o corte some.
  const sementes = [...PLANOS.matchAll(/<FaixaCurva[^>]*semente="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(sementes).size, sementes.length, 'duas faixas com a MESMA semente: ondas gêmeas');
});

test('toda faixa sangra pra fora do padding da tela — faixa que não sangra é cartão', () => {
  for (const [nome, src] of [['PlanosScreen', PLANOS], ['ProfileScreen', PERFIL]]) {
    if (!src.includes('<FaixaCurva')) continue;
    // O estilo que a faixa recebe tem que anular o padding lateral do
    // contentContainer (que é 20 nas duas telas).
    const temSangria = /faixa\w*:\s*\{[^}]*marginHorizontal:\s*-20/.test(src);
    assert.ok(temSangria, `${nome}: a faixa não sangra, então ela é um cartão com onda em cima`);
  }
});

test('o Perfil usa UMA faixa só — lista de ajustes com faixa por linha vira textura', () => {
  const faixas = PERFIL.match(/<FaixaCurva/g) || [];
  assert.equal(faixas.length, 1, `o Perfil tem ${faixas.length} faixas; a identidade é a única seção que pede uma`);
});

// =====================================================================
// 4. ESPAÇO PELA ESCALA
// =====================================================================

test('as telas do lote pedem espaço pelo nome do uso, não por número cru', () => {
  for (const [nome, src] of LOTE) {
    assert.ok(/from '\.\.\/theme'/.test(src), `${nome} não importa do theme`);
    assert.ok(/\bspace\b/.test(src), `${nome} não usa a escala de espaço`);
    // O degrau que o app quase não usava, e é o que faz a tela respirar.
    assert.ok(
      /space\.(secao|entre|ar)/.test(src),
      `${nome} não usa nenhum degrau largo (secao/entre/ar) — é o aperto de sempre`
    );
  }
});

test('o texto longo das telas do lote vive numa coluna, não de borda a borda', () => {
  // A pergunta do onboarding e as notas legais do paywall são os dois
  // parágrafos mais longos do lote.
  assert.ok(PERGUNTAS.includes('ColunaLeitura'), 'a pergunta do onboarding voltou pra largura toda');
  assert.ok(PLANOS.includes('<ColunaLeitura'), 'as notas do paywall voltaram pra largura toda');
});

test('a pergunta do onboarding usa o degrau de primeira dobra, não fonte solta', () => {
  // type.display é o degrau de "uma ideia por tela" — o arranjo do print.
  const bloco = PERGUNTAS.match(/pergunta:\s*\{[\s\S]*?\},/);
  assert.ok(bloco, 'o estilo da pergunta sumiu');
  assert.ok(
    bloco[0].includes('...type.display'),
    'a pergunta voltou a ter fontSize/lineHeight na mão em vez do degrau da escala'
  );
  assert.ok(
    !/fontSize:\s*\d/.test(bloco[0]),
    'a pergunta ganhou fontSize cru de volta'
  );
});
