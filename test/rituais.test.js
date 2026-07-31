// A biblioteca de rituais — os testes que a seguram.
//
// Quatro trabalhos obrigatórios, pedidos pelo dono, e nenhum deles é enfeite:
//
// (a) VARREDURA DE ALEGAÇÃO DE SAÚDE em TODO texto visível, com lista de
//     padrões proibidos, que ABORTA se achar. Vale para os cinco campos de
//     cada ritual, para as categorias, para os blocos de lastro e para o texto
//     de compartilhar. A varredura percorre o objeto sozinha, em profundidade
//     — não existe lista de campos escrita à mão que alguém possa esquecer de
//     atualizar. Campo novo em um ritual JÁ ENTRA na varredura.
//
// (b) OS CINCO CAMPOS de cada ritual preenchidos: INTENÇÃO, MATERIAIS, PASSO A
//     PASSO, MOMENTO IDEAL, CUIDADOS E ÉTICA.
//
// (c) TODA AFIRMAÇÃO HISTÓRICA COM FONTE E SÉCULO. O teste não confia na boa
//     vontade de quem escreve: ele lê a prosa, acha os nomes de autor, e exige
//     que cada um esteja declarado em `fontes` com obra e século. E faz o
//     caminho de volta — recibo declarado que não aparece no texto é recibo
//     morto e reprova. Século órfão (um "séc. II" solto, sem autor por perto)
//     também reprova.
//
// (d) O AVISO ÉTICO LITERAL, byte a byte, presente em TODOS os rituais — no
//     campo `aviso`, no fim de `cuidados` e no texto de compartilhar.
//
// Por que isso tem que ser teste e não revisão de código: o risco não é
// escrever a frase errada hoje. É alguém, daqui a três meses, "melhorar" a
// cópia pra ela converter melhor, e a biblioteca virar catálogo de simpatia com
// promessa de resultado sem ninguém perceber. Falha aqui = não publica.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  AVISO_ETICO,
  SEM_FONTE_ANTIGA,
  LINK_COMPARTILHAR,
  FONTES_TRADICAO,
  CATEGORIAS,
  CATEGORIA_IDS,
  FASES_LUA,
  DIAS_SEMANA,
  LASTRO_MOMENTO_IDEAL,
  RITUAIS,
  recibo,
  ritualPorId,
  rituaisPorCategoria,
  resumoDoMomento,
  rituaisPara,
  rituaisDeHoje,
  textoCompartilhavel,
  textosVisiveis,
  diaSemanaPorIndice,
} = require('../lib/rituais.js');

const { REGENTES } = require('../lib/grounding.js');
const { getMoonPhase } = require('../lib/lunarCalendar.js');

// ---------------------------------------------------------------------------
// Coleta recursiva de texto — a base das varreduras
// ---------------------------------------------------------------------------
// Devolve [caminho, texto] para toda string dentro de um objeto. `fontes` sai
// (são ids técnicos, não texto de tela) e `base` também (é caminho de arquivo
// da pesquisa, não vai pra tela).
const CHAVES_TECNICAS = new Set(['fontes', 'base', 'token', 'id', 'categoria', 'provas']);

function coletar(valor, caminho, saida) {
  if (typeof valor === 'string') {
    saida.push([caminho, valor]);
  } else if (Array.isArray(valor)) {
    valor.forEach((v, i) => coletar(v, `${caminho}[${i}]`, saida));
  } else if (valor && typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) {
      if (CHAVES_TECNICAS.has(k)) continue;
      coletar(v, caminho ? `${caminho}.${k}` : k, saida);
    }
  }
  return saida;
}

// Tudo que a pessoa pode ler: os 21 rituais, as categorias, os três blocos de
// lastro, a lista de fontes e os 21 textos de compartilhar.
//
// FONTES_TRADICAO ficava INTEIRA fora das três varreduras, e o objeto é
// exportado justamente pra tela que quiser renderizar a lista de fontes de um
// ritual. Foi por esse buraco que passou "A lua minguante mata as sementes de
// erva daninha no esterco" — presente do indicativo, efeito lunar AFIRMADO.
// Entra aqui. O recibo (autor + obra + século) é coletado JUNTO, na forma em
// que a tela o mostra: separar o campo `seculo` num item próprio criaria um
// "séc. III" sem autor por perto, que é exatamente o que o teste de século
// órfão existe pra proibir.
function todoTextoVisivel() {
  const saida = [];
  RITUAIS.forEach((r) => coletar(r, `ritual:${r.id}`, saida));
  coletar(CATEGORIAS, 'categorias', saida);
  coletar(LASTRO_MOMENTO_IDEAL, 'lastro', saida);
  for (const [id, f] of Object.entries(FONTES_TRADICAO)) {
    saida.push([`fonte:${id}.recibo`, `${f.autor}, ${f.obra}, ${f.seculo}`]);
    if (f.nota) saida.push([`fonte:${id}.nota`, f.nota]);
  }
  RITUAIS.forEach((r) => saida.push([`compartilhar:${r.id}`, textoCompartilhavel(r)]));
  return saida;
}

// A ÚNICA ISENÇÃO da varredura, e ela é cirúrgica: o próprio AVISO_ETICO. Ele
// contém "garantias mágicas" e "controlar vontade alheia" — as duas expressões
// existem ali justamente para NEGAR a promessa e o controle, e um teste que as
// proibisse proibiria o aviso que protege. Em vez de isentar campos inteiros
// (o que abriria buraco), removemos a string literal do aviso do texto antes de
// varrer o que sobra. Mesma lógica de PREFIXOS_ISENTOS em
// test/grounding.test.js, só que muito mais estreita.
function semOAviso(texto) {
  return texto.split(AVISO_ETICO).join(' ');
}

// ---------------------------------------------------------------------------
// (b) OS CINCO CAMPOS
// ---------------------------------------------------------------------------

test('a biblioteca tem as sete categorias e no mínimo três rituais em cada', () => {
  assert.equal(CATEGORIAS.length, 7);
  assert.deepEqual(CATEGORIA_IDS, [
    'amor',
    'prosperidade',
    'protecao',
    'limpeza',
    'coragem',
    'foco',
    'autoestima',
  ]);
  for (const cat of CATEGORIAS) {
    const daCategoria = rituaisPorCategoria(cat.id);
    assert.ok(
      daCategoria.length >= 3,
      `${cat.id} tem ${daCategoria.length} ritual(is) — o mínimo aprovado é 3`
    );
  }
  assert.ok(RITUAIS.length >= 21, `a biblioteca encolheu para ${RITUAIS.length} rituais`);
  // Nenhum ritual órfão de categoria.
  for (const r of RITUAIS) {
    assert.ok(CATEGORIA_IDS.includes(r.categoria), `${r.id}: categoria "${r.categoria}" não existe`);
  }
});

test('id e título são únicos — dois rituais com o mesmo id somem um do outro na tela', () => {
  const ids = new Set();
  const titulos = new Set();
  for (const r of RITUAIS) {
    assert.ok(!ids.has(r.id), `id repetido: ${r.id}`);
    assert.ok(!titulos.has(r.titulo), `título repetido: ${r.titulo}`);
    ids.add(r.id);
    titulos.add(r.titulo);
    assert.equal(ritualPorId(r.id).id, r.id);
  }
  assert.equal(ritualPorId('nao-existe'), null, 'ritualPorId nunca pode chutar um ritual');
});

test('todo ritual tem os CINCO campos preenchidos, na estrutura aprovada', () => {
  for (const r of RITUAIS) {
    // 1. INTENÇÃO
    assert.equal(typeof r.intencao, 'string', `${r.id}: sem INTENÇÃO`);
    assert.ok(r.intencao.trim().length >= 80, `${r.id}: INTENÇÃO curta demais para explicar o gesto`);

    // 2. MATERIAIS
    assert.ok(Array.isArray(r.materiais), `${r.id}: MATERIAIS não é lista`);
    assert.ok(r.materiais.length >= 2, `${r.id}: MATERIAIS com menos de 2 itens`);
    r.materiais.forEach((m, i) =>
      assert.ok(typeof m === 'string' && m.trim().length > 3, `${r.id}: material ${i} vazio`)
    );

    // 3. PASSO A PASSO
    assert.ok(Array.isArray(r.passos), `${r.id}: PASSO A PASSO não é lista`);
    assert.ok(r.passos.length >= 4, `${r.id}: PASSO A PASSO com menos de 4 passos`);
    r.passos.forEach((p, i) =>
      assert.ok(typeof p === 'string' && p.trim().length > 10, `${r.id}: passo ${i} vazio`)
    );

    // 4. MOMENTO IDEAL — fase da Lua e/ou dia da semana, mais o texto do lastro
    assert.ok(r.momento && typeof r.momento === 'object', `${r.id}: sem MOMENTO IDEAL`);
    const fases = r.momento.fasesLua || [];
    const dias = r.momento.diasSemana || [];
    assert.ok(
      fases.length > 0 || dias.length > 0,
      `${r.id}: MOMENTO IDEAL sem fase da Lua nem dia da semana — ele bateria com qualquer instante, ` +
        'e a sugestão diária deixaria de significar alguma coisa'
    );
    assert.equal(typeof r.momento.texto, 'string', `${r.id}: MOMENTO IDEAL sem o texto que explica o lastro`);
    assert.ok(r.momento.texto.trim().length >= 150, `${r.id}: o texto do MOMENTO IDEAL não explica nada`);
    for (const f of fases) {
      assert.ok(FASES_LUA.includes(f), `${r.id}: fase "${f}" não existe em FASES_LUA`);
    }
    for (const d of dias) {
      assert.ok(Number.isInteger(d) && d >= 0 && d <= 6, `${r.id}: dia da semana inválido (${d})`);
      assert.ok(diaSemanaPorIndice(d), `${r.id}: dia ${d} sem entrada em DIAS_SEMANA`);
    }

    // 5. CUIDADOS E ÉTICA
    assert.equal(typeof r.cuidados, 'string', `${r.id}: sem CUIDADOS E ÉTICA`);
    assert.ok(
      r.cuidados.trim().length >= AVISO_ETICO.length + 60,
      `${r.id}: CUIDADOS E ÉTICA é só o aviso colado, sem o cuidado específico do ritual`
    );
  }
});

test('os nomes de fase batem BYTE A BYTE com o motor de lib/lunarCalendar.js', () => {
  // Um acento diferente aqui não daria erro nenhum: o app simplesmente nunca
  // sugeriria ritual, em silêncio. Por isso o teste não compara com uma lista
  // escrita à mão — ele roda a efeméride de verdade por 400 dias e coleta os
  // nomes que o motor produz.
  const vistos = new Set();
  const inicio = new Date(Date.UTC(2026, 0, 1, 12, 0, 0));
  for (let i = 0; i < 400; i++) {
    const d = new Date(inicio.getTime() + i * 86400000);
    const fase = getMoonPhase(d);
    if (fase) vistos.add(fase.name);
  }
  assert.ok(vistos.size > 0, 'astronomy-engine não respondeu — o teste perderia o sentido');
  assert.equal(vistos.size, 8, `o motor produziu ${vistos.size} nomes de fase, esperávamos 8`);
  for (const nome of FASES_LUA) {
    assert.ok(vistos.has(nome), `a fase "${nome}" de lib/rituais.js não sai de lib/lunarCalendar.js`);
  }
  for (const nome of vistos) {
    assert.ok(FASES_LUA.includes(nome), `o motor produz "${nome}" e lib/rituais.js não conhece essa fase`);
  }
});

test('a tabela de dias da semana é a MESMA de lib/grounding.js — uma fonte só de regente', () => {
  // lib/grounding.js:287 já exporta os regentes do dia pela ordem caldaica, e
  // eles vêm de rulerOfDay em lib/dailyThought.js. Se este arquivo mantivesse
  // uma segunda tabela e alguém corrigisse só uma das duas, o app diria
  // "terça, dia de Marte" numa tela e outra coisa na outra.
  assert.equal(DIAS_SEMANA.length, 7);
  for (const dia of DIAS_SEMANA) {
    const regente = REGENTES.find((x) => x.diaSemana === dia.diaSemana);
    assert.ok(regente, `sem regente em lib/grounding.js para o dia ${dia.diaSemana}`);
    assert.equal(
      dia.planeta,
      regente.planeta,
      `dia ${dia.diaSemana}: aqui é ${dia.planeta}, em lib/grounding.js é ${regente.planeta}`
    );
  }
});

// ---------------------------------------------------------------------------
// (d) O AVISO ÉTICO — literal, byte a byte, em todos
// ---------------------------------------------------------------------------

test('o aviso ético é o texto literal do dono, sem uma vírgula fora do lugar', () => {
  assert.equal(
    AVISO_ETICO,
    'Rituais são ferramentas de intenção, não garantias mágicas. Use sempre com respeito, sem tentar controlar vontade alheia.',
    'O aviso ético é texto literal do dono. Não reescreva, não "melhore", não resuma.'
  );
});

test('o aviso ético aparece literal em TODOS os rituais, nos três lugares', () => {
  const faltando = [];
  for (const r of RITUAIS) {
    if (r.aviso !== AVISO_ETICO) faltando.push(`${r.id}: campo aviso`);
    if (!r.cuidados.includes(AVISO_ETICO)) faltando.push(`${r.id}: fim de CUIDADOS E ÉTICA`);
    if (!r.cuidados.trim().endsWith(AVISO_ETICO)) faltando.push(`${r.id}: o aviso não fecha CUIDADOS`);
    if (!textoCompartilhavel(r).includes(AVISO_ETICO)) faltando.push(`${r.id}: texto de compartilhar`);
  }
  assert.equal(
    faltando.length,
    0,
    'O aviso ético tem que estar literal em todo ritual e em tudo que sai dele — ' +
      `inclusive no que a pessoa manda no WhatsApp:\n  ${faltando.join('\n  ')}`
  );
  assert.equal(RITUAIS.length, RITUAIS.filter((r) => r.aviso === AVISO_ETICO).length);
});

test('nenhum ritual traz uma versão "adaptada" do aviso', () => {
  // A falha realista não é apagar o aviso: é reescrevê-lo mais curto pra caber
  // no card. Se o texto tem o começo do aviso mas não o aviso inteiro, quebrou.
  const inicio = AVISO_ETICO.slice(0, 40);
  for (const [caminho, texto] of todoTextoVisivel()) {
    if (texto.includes(inicio) && !texto.includes(AVISO_ETICO)) {
      assert.fail(`${caminho}: versão encurtada do aviso ético — use a constante AVISO_ETICO inteira`);
    }
  }
});

// ---------------------------------------------------------------------------
// (a) A VARREDURA — alegação de saúde, promessa de resultado, mecanismo
// ---------------------------------------------------------------------------
// Três listas, porque são três problemas diferentes e um relatório que os
// mistura não ajuda quem for consertar.

// 1. SAÚDE. Mesma régua de test/grounding.test.js e test/cosmicSound.test.js,
//    com os implícitos que o dono nomeou: "acalma", "reduz ansiedade",
//    "melhora o sono", "energiza". A armadilha é a preposição de finalidade:
//    "escreva três frases" descreve; "escreva três frases para acalmar" promete.
const SAUDE = [
  /\bcur(a|ar|as|am|ativ)/i,
  /\btrata(r|mento)?\b/i,
  /\bregenera/i,
  /\bansiedade\b/i,
  /\bdepress(ão|ao|iva|ivo)\b/i,
  /\bins[oô]nia\b/i,
  /\bdores?\b/i,
  /\bterap[eê]utic/i,
  /\bimunidade\b/i,
  /\brem[ée]dio\b/i,
  /\bsono\b/i,
  /\bdormir\b/i,
  /\bestresse\b/i,
  /\brelaxa/i,
  /\bacalma\b/i,
  /\bcalmante\b/i,
  /\btranquiliza/i,
  /\balivi(a|ar|o)\b/i,
  /\bal[ií]vio\b/i,
  /\bharmoniza/i,
  /\bequilibra\b/i,
  /\bbem-estar\b/i,
  /\bsa[uú]de\b/i,
  /\bcortisol\b/i,
  /\bpress[ãa]o arterial\b/i,
  /\bsistema nervoso\b/i,
  /\benergiza/i,
  /\brevigora/i,
  /\bdesintoxica/i,
  /\bimuniza/i,
  /\bmelhora o\b/i,
  /\bfaz bem\b/i,
  /\bse sentir melhor\b/i,
  /\bsolt(a|e|ar) a tens[ãa]o\b/i,
  /\besvazi(a|e|ar) a mente\b/i,
];

// 2. PROMESSA DE RESULTADO. Um ritual é o que a pessoa FAZ. Se o texto diz o
//    que o universo devolve, virou outra coisa.
const PROMESSA = [
  /\batra(i|ir|em|irá|ia)\b/i,
  /\batra[çc][ãa]o\b/i,
  /\bgarant(e|em|ia|ias|ido|ida|ir)\b/i,
  /\bpromet(e|em|er|ido)\b/i,
  /\bfaz acontecer\b/i,
  /\bmanifesta(r|ção)?\b/i,
  /\babre caminhos?\b/i,
  /\bdestrava\b/i,
  /\bdesbloqueia\b/i,
  /\bafasta\b/i,
  /\bespanta\b/i,
  /\bprotege\b/i,
  /\bproteger[áa]\b/i,
  /\bblinda\b/i,
  /\bneutraliza\b/i,
  /\belimina\b/i,
  /\bpoderoso\b/i,
  /\binfal[ií]vel\b/i,
  /\bd[áa] sorte\b/i,
  /\btraz sorte\b/i,
  /\btraz de volta\b/i,
  /\bvai dar certo\b/i,
  /\bresultado garantido\b/i,
  /\bfunciona mesmo\b/i,
  /\bcontrol(a|ar|e|ando)\b/i,
  /\bdomina(r)?\b/i,
  // IMPERATIVO + CAUSALIDADE. "o que você quer que cresça, faça com a Lua
  // crescendo" não é vocabulário proibido — é uma REGRA DE VIDA dirigida a quem
  // lê, e a fonte antiga fala de semente, madeira e lã. A lista era só de
  // vocabulário e não pegava a forma.
  /\bfaça (na|com|no) (lua|quarto)/i,
];

// 3. MECANISMO PSEUDOCIENTÍFICO. Mesma decisão que baniu o vocabulário de
//    earthing de lib/grounding.js. docs/tradicao/08-o-que-o-mercado-diz.md
//    nomeia "limpeza energética" como a divergência de responsabilidade entre
//    este app e o mercado — então ela não entra nem como imagem poética.
const MECANISMO = [
  /\benergia (negativa|positiva|ruim|pesada)\b/i,
  /\benerg[ée]tic/i,
  /\bvibra[çc][ãa]o\b/i,
  /\bfrequ[êe]ncia (alta|baixa|vibracional)\b/i,
  /\bcampo (energ|vibr)/i,
  /\baura\b/i,
  /\bchakra/i,
  /\bmagnetismo\b/i,
  /\bfluido (vital|energ)/i,
  /\bmau-olhado\b/i,
  /\bolho gordo\b/i,
  /\bpurifica/i,
  /\bdescarreg(a|ar)\b/i,
  /\bel[ée]tron/i,
];

function varrer(regras, rotulo) {
  const violacoes = [];
  for (const [caminho, bruto] of todoTextoVisivel()) {
    const texto = semOAviso(bruto);
    for (const re of regras) {
      if (re.test(texto)) violacoes.push(`${caminho} → ${re} (${rotulo})`);
    }
  }
  return violacoes;
}

test('NENHUM texto de ritual faz alegação de saúde, nem implícita', () => {
  const violacoes = varrer(SAUDE, 'saúde');
  assert.equal(
    violacoes.length,
    0,
    'Ritual é gesto, nunca tratamento. Estas frases prometem efeito sobre corpo ou mente ' +
      'e não podem existir — reescreva como ação observável (escreva, acenda, dobre, ' +
      'guarde) ou corte:\n  ' +
      violacoes.join('\n  ')
  );
});

test('NENHUM texto de ritual promete resultado', () => {
  const violacoes = varrer(PROMESSA, 'promessa');
  assert.equal(
    violacoes.length,
    0,
    'Um ritual é o que a pessoa FAZ, não o que o universo devolve. "Vai atrair", ' +
      '"garante", "faz acontecer", "protege" e parentes não entram:\n  ' +
      violacoes.join('\n  ')
  );
});

test('NENHUM texto de ritual inventa mecanismo (energia, vibração, limpeza energética)', () => {
  const violacoes = varrer(MECANISMO, 'mecanismo');
  assert.equal(
    violacoes.length,
    0,
    'docs/tradicao/08-o-que-o-mercado-diz.md nomeia exatamente isto como a divergência ' +
      'de responsabilidade entre este app e o mercado. Nem como imagem poética:\n  ' +
      violacoes.join('\n  ')
  );
});

test('a única isenção da varredura é o próprio aviso ético, e ela é necessária', () => {
  // Se um dia o aviso mudar e deixar de tropeçar nos padrões, esta isenção vira
  // buraco aberto sem motivo e tem que ser removida. O teste segura isso.
  const tropeca = PROMESSA.some((re) => re.test(AVISO_ETICO));
  assert.ok(
    tropeca,
    'O AVISO_ETICO não tropeça mais em nenhum padrão proibido — então a isenção de ' +
      'semOAviso() virou buraco sem uso. Remova a isenção.'
  );
  // E o inverso: nada além do aviso pode estar se escondendo atrás dela. Se
  // removermos a isenção, as ÚNICAS violações que podem sobrar são as do aviso.
  const semIsencao = [];
  for (const [caminho, texto] of todoTextoVisivel()) {
    for (const re of [...SAUDE, ...PROMESSA, ...MECANISMO]) {
      if (re.test(texto)) {
        const soNoAviso = re.test(AVISO_ETICO) && !re.test(semOAviso(texto));
        if (!soNoAviso) semIsencao.push(`${caminho} → ${re}`);
      }
    }
  }
  assert.equal(
    semIsencao.length,
    0,
    `Texto proibido escondido atrás da isenção do aviso:\n  ${semIsencao.join('\n  ')}`
  );
});

// ---------------------------------------------------------------------------
// (c) TODA AFIRMAÇÃO HISTÓRICA COM FONTE E SÉCULO
// ---------------------------------------------------------------------------

const SECULO = /\bs[ée]c\.\s*[IVXL]+/;

// ---------------------------------------------------------------------------
// A BASE, ABERTA DE VERDADE
// ---------------------------------------------------------------------------
// Até 31/07/2026 o teste abaixo validava o campo `base` só com um regex de
// FORMATO de caminho — nunca abria o arquivo. Foi por isso que "Kitāb
// al-Tafhīm" como veículo da carta de Bagdá (é a Cronologia das Nações
// Antigas) e "ordem caldaica" como nome da sequência dos dias (é derivada
// dela) passaram verdes. Agora vale o mesmo mecanismo de test/jornada.test.js:
// cada fonte declara `provas` LITERAIS e o teste procura cada uma dentro do(s)
// arquivo(s) apontados por `base`.
const RAIZ = path.join(__dirname, '..');
const _arquivos = {};

function lerArquivo(rel) {
  if (!(rel in _arquivos)) {
    const alvo = path.join(RAIZ, rel);
    _arquivos[rel] = fs.existsSync(alvo) ? fs.readFileSync(alvo, 'utf8') : null;
  }
  return _arquivos[rel];
}

// `base` é texto de prosa ("docs/tradicao/09-...md; ressalva em
// docs/tradicao/99-...md") — daqui saem os caminhos citados nele.
function caminhosDaBase(base) {
  return (base || '').match(/(?:docs\/tradicao\/[\w.\-]+\.md|lib\/[\w.\-]+\.js)/g) || [];
}

test('toda entrada de FONTES_TRADICAO tem obra, autor, século e endereço na base', () => {
  const ids = Object.keys(FONTES_TRADICAO);
  assert.ok(ids.length >= 12, 'a base de fontes encolheu demais');
  for (const id of ids) {
    const f = FONTES_TRADICAO[id];
    assert.ok(f.autor && f.autor.length > 3, `${id}: sem autor`);
    assert.ok(f.obra && f.obra.length > 5, `${id}: sem obra`);
    assert.ok(f.seculo && f.seculo.length > 3, `${id}: sem século`);
    assert.match(
      f.seculo,
      /s[ée]c\.\s*[IVXL]+/,
      `${id}: o campo século não está no formato "séc. X" (achei "${f.seculo}")`
    );
    assert.ok(f.token && f.token.length > 2, `${id}: sem token de reconhecimento no texto`);
    assert.match(
      f.base,
      /^docs\/tradicao\/|^lib\//,
      `${id}: a fonte precisa apontar para onde foi conferida na base (achei "${f.base}")`
    );
    assert.ok(
      Array.isArray(f.provas) && f.provas.length >= 2,
      `${id}: menos de 2 provas — sem prova literal o campo \`base\` é só um caminho bonito`
    );
  }
  // Doroteu é o caso-limite e ele tem que continuar marcado. A base registra a
  // obra e NÃO a leu (docs/tradicao/99-o-que-falta.md). Citar como se tivesse
  // lido é exatamente o erro que docs/tradicao/00-tese.md existe pra impedir.
  assert.equal(
    FONTES_TRADICAO.doroteu.atribuicaoNaoLida,
    true,
    'Doroteu de Sídon precisa continuar marcado como atribuição registrada, não leitura própria'
  );
});

test('todo arquivo citado em `base` existe, e TODA prova aparece literalmente nele', () => {
  const faltando = [];
  for (const [id, f] of Object.entries(FONTES_TRADICAO)) {
    const caminhos = caminhosDaBase(f.base);
    assert.ok(caminhos.length > 0, `${id}: \`base\` não cita nenhum arquivo real (achei "${f.base}")`);
    const textos = [];
    for (const rel of caminhos) {
      const conteudo = lerArquivo(rel);
      assert.ok(conteudo !== null, `${id}: \`base\` aponta pra ${rel}, que não existe`);
      textos.push(conteudo);
    }
    const palheiro = textos.join('\n');
    for (const prova of f.provas || []) {
      if (!palheiro.includes(prova)) {
        faltando.push(`${id} → ${caminhos.join(' + ')} não contém ${JSON.stringify(prova)}`);
      }
    }
  }
  assert.deepEqual(
    faltando,
    [],
    'Fonte declarada sem lastro na base — obra, autor ou locus que a pesquisa não sustenta:\n  ' +
      faltando.join('\n  ')
  );
});

test('a carta de fundação de Bagdá é creditada à obra certa de al-Bīrūnī', () => {
  // docs/tradicao/10 §4.2: quem transmite a carta é a Cronologia das Nações
  // Antigas. O Kitāb al-Tafhīm (1029) é o MANUAL descrito em §4.3 — outra obra.
  // Autor certo, livro errado, repetido em três lugares do app.
  assert.match(FONTES_TRADICAO.albiruni.obra, /Cronologia das Nações Antigas/);
  const prosa = [
    LASTRO_MOMENTO_IDEAL.eletiva.texto,
    ritualPorId('protecao-hora-escolhida').intencao,
    ritualPorId('protecao-hora-escolhida').momento.texto,
  ].join('\n');
  assert.doesNotMatch(prosa, /Tafhīm/, 'a carta de Bagdá voltou a ser creditada ao Kitāb al-Tafhīm');
  assert.match(prosa, /Cronologia das Nações Antigas/);
  // E o eleitor principal na fonte é Nawbakht, o Persa — Māshā'allāh assistiu.
  assert.match(prosa, /Nawbakht/, 'o eleitor principal da carta de Bagdá sumiu de novo');
});

test('a sequência dos dias nunca é chamada de "ordem caldaica" — ela é DERIVADA dela', () => {
  // docs/tradicao/14 §3.1 item 2 e §3.2c: a ordem caldaica é
  // Saturno·Júpiter·Marte·Sol·Vênus·Mercúrio·Lua; a dos dias sai dela pulando
  // três posições (24 mod 7 = 3). Chamar uma de outra era erro em 14 lugares.
  const erros = [];
  for (const [caminho, texto] of todoTextoVisivel()) {
    if (/ordem caldaica d(os|e) dias/i.test(texto)) {
      erros.push(`${caminho}: chama a sequência dos dias de "ordem caldaica"`);
    }
  }
  assert.deepEqual(erros, [], erros.join('\n  '));
  // E o apelido "caldaica" continua declarado como não verificado (14 §3.3).
  assert.match(
    LASTRO_MOMENTO_IDEAL.semana.ressalvas.join(' '),
    /apelido "caldaica"|não conseguiu verificar/i,
    'sumiu a ressalva de que "caldaica" é apelido não conferido contra os textos babilônicos'
  );
});

// Todos os tokens de autor conhecidos, do mais longo para o mais curto (pra
// "Māshā'allāh ibn Atharī" não ser mascarado por "Māshā'allāh").
const TOKENS = [...new Set(Object.values(FONTES_TRADICAO).map((f) => f.token))].sort(
  (a, b) => b.length - a.length
);

function tokensNoTexto(texto) {
  return TOKENS.filter((t) => texto.includes(t));
}

function tokensDeclarados(ritual) {
  return new Set(
    (ritual.fontes || []).map((id) => (FONTES_TRADICAO[id] || {}).token).filter(Boolean)
  );
}

test('todo autor citado na prosa de um ritual está declarado em fontes, com século', () => {
  const problemas = [];
  for (const r of RITUAIS) {
    const declarados = tokensDeclarados(r);
    for (const [caminho, texto] of coletar(r, `ritual:${r.id}`, [])) {
      for (const token of tokensNoTexto(texto)) {
        if (!declarados.has(token)) {
          problemas.push(`${caminho}: cita "${token}" e o ritual não declara essa fonte em \`fontes\``);
        }
      }
    }
    // E o século tem que estar junto: fonte declarada sem século reprova antes,
    // no teste acima; aqui garantimos que o ritual declara ALGUMA fonte sempre
    // que fala de história.
    assert.ok(Array.isArray(r.fontes) && r.fontes.length > 0, `${r.id}: nenhuma fonte declarada`);
    for (const id of r.fontes) {
      assert.ok(FONTES_TRADICAO[id], `${r.id}: fonte "${id}" não existe em FONTES_TRADICAO`);
      assert.match(FONTES_TRADICAO[id].seculo, /s[ée]c\./, `${r.id}: fonte "${id}" sem século`);
    }
  }
  assert.equal(problemas.length, 0, `Afirmação histórica sem recibo:\n  ${problemas.join('\n  ')}`);
});

test('recibo declarado que não aparece no texto é recibo morto', () => {
  // O caminho de volta. Sem ele, dava pra encher `fontes` de ids bonitos que
  // ninguém lê na tela e o teste acima passaria feliz.
  const mortos = [];
  for (const r of RITUAIS) {
    const prosa = coletar(r, '', [])
      .map(([, t]) => t)
      .join('\n');
    for (const id of r.fontes) {
      const token = FONTES_TRADICAO[id].token;
      if (!prosa.includes(token)) mortos.push(`${r.id}: declara "${id}" e nunca cita "${token}" no texto`);
    }
  }
  assert.equal(mortos.length, 0, `Recibo declarado e não mostrado:\n  ${mortos.join('\n  ')}`);
});

test('não existe século órfão — um "séc. II" solto, sem autor por perto', () => {
  // O erro mais fácil de cometer: escrever "isso vem do séc. I" e achar que
  // datou alguma coisa. Século sem autor e sem obra não é fonte, é aura de
  // antiguidade — que é o gesto que docs/tradicao/00-tese.md §3 denuncia.
  const orfaos = [];
  for (const [caminho, texto] of todoTextoVisivel()) {
    if (SECULO.test(texto) && tokensNoTexto(texto).length === 0) {
      orfaos.push(`${caminho}: fala em século sem nomear autor nenhum`);
    }
  }
  assert.equal(orfaos.length, 0, `Século órfão:\n  ${orfaos.join('\n  ')}`);
});

test('o que a fonte antiga não diz vai marcado com a frase literal, sempre igual', () => {
  assert.equal(SEM_FONTE_ANTIGA, 'prática popular contemporânea, sem fonte antiga localizada');
  for (const r of RITUAIS) {
    assert.ok(
      Array.isArray(r.naoTemFonte) && r.naoTemFonte.length > 0,
      `${r.id}: nenhum item marcado como prática popular — todo ritual tem alguma parte que a ` +
        'fonte antiga não sustenta, e escondê-la é o erro que este app existe pra não cometer'
    );
    for (const linha of r.naoTemFonte) {
      assert.ok(
        linha.trim().endsWith(`${SEM_FONTE_ANTIGA}.`),
        `${r.id}: "${linha}" não termina na frase literal — nunca invente antiguidade nem reescreva a marca`
      );
    }
  }
});

test('a ressalva sobre Doroteu está escrita no ritual que o cita, não só no comentário', () => {
  const comDoroteu = RITUAIS.filter((r) => (r.fontes || []).includes('doroteu'));
  assert.ok(comDoroteu.length >= 1, 'sumiu o ritual de eleição do momento');
  for (const r of comDoroteu) {
    assert.match(
      r.momento.texto,
      /não leu a obra diretamente|atribuição registrada/i,
      `${r.id}: cita Doroteu sem dizer que a base não leu Carmen Astrologicum`
    );
  }
});

test('a eletiva cita o caso documentado, e não só o nome do ramo', () => {
  const eletiva = ritualPorId('protecao-hora-escolhida');
  assert.ok(eletiva, 'sumiu o ritual da hora escolhida');
  assert.match(eletiva.momento.texto, /762/, 'sumiu a data da carta de fundação de Bagdá');
  assert.match(eletiva.momento.texto, /Māshā'allāh/);
  assert.match(eletiva.momento.texto, /al-Bīrūnī/);
  // E a simplificação declarada: o critério antigo era o céu inteiro do
  // instante, não "fase da Lua + dia da semana".
  assert.match(eletiva.momento.texto, /céu inteiro/i, 'sumiu a ressalva de que reduzimos o critério antigo');
});

test('as oito fases nomeadas são datadas como modernas onde o app as usa', () => {
  // docs/tradicao/04 §3.1: a divisão ANTIGA é em quatro quartos (Ptolomeu I.8);
  // as oito fases com leitura psicológica são de Rudhyar, 1967. lib/lunarCalendar.js
  // já corrigiu isso nas reflexões; a biblioteca de rituais não pode desfazer.
  const citamRudhyar = RITUAIS.filter((r) => (r.fontes || []).includes('rudhyar'));
  assert.ok(
    citamRudhyar.length >= 3,
    `só ${citamRudhyar.length} ritual(is) datam as oito fases — a correção precisa aparecer na tela`
  );
  for (const r of citamRudhyar) {
    assert.match(r.momento.texto, /1967|séc\. XX/, `${r.id}: cita Rudhyar sem a data`);
  }
  assert.match(LASTRO_MOMENTO_IDEAL.fases.ressalvas.join(' '), /quatro quartos/i);
});

test('o lastro da semana registra que a própria fonte chama o costume de recente', () => {
  // É o detalhe que separa este app do mercado: quem chama a semana planetária
  // de imemorial está contrariando o autor que cita.
  assert.match(
    LASTRO_MOMENTO_IDEAL.semana.ressalvas.join(' '),
    /comparatively recent/,
    'sumiu a ressalva de Dião Cássio sobre o costume ser recente'
  );
  assert.match(FONTES_TRADICAO.dioCassio.nota, /comparatively recent/);
});

// ---------------------------------------------------------------------------
// O TOM — abre em conversa, fecha no recibo. Nunca o contrário.
// ---------------------------------------------------------------------------

const CAMPOS_DE_PROSA = [
  ['intencao', (r) => r.intencao],
  ['momento.texto', (r) => r.momento.texto],
];

// O contrato de tom cobria SÓ `intencao` e `momento.texto`. LASTRO_MOMENTO_IDEAL
// — que é a tela mais expositiva do arquivo — e as descrições de CATEGORIAS, que
// são card de menu, ficavam de fora, e era exatamente ali que três ressalvas
// abriam pelo recibo. Entram aqui.
function prosaDeTela() {
  const out = [];
  for (const r of RITUAIS) {
    for (const [nome, pegar] of CAMPOS_DE_PROSA) out.push([`${r.id} ${nome}`, pegar(r)]);
  }
  for (const [bloco, b] of Object.entries(LASTRO_MOMENTO_IDEAL)) {
    out.push([`lastro.${bloco}.texto`, b.texto]);
    (b.ressalvas || []).forEach((rr, i) => out.push([`lastro.${bloco}.ressalvas[${i}]`, rr]));
  }
  for (const c of CATEGORIAS) out.push([`categoria.${c.id}.descricao`, c.descricao]);
  return out;
}

// Nas ressalvas, que são curtas, 60 caracteres fixos seriam quase o texto
// inteiro — o limiar é proporcional, e o teto de 60 mantém a régua original nos
// textos longos.
function tamanhoDaAbertura(texto) {
  return Math.max(1, Math.min(60, Math.floor(texto.length / 3)));
}

test('toda prosa ABRE em português de conversa — sem autor nem século na largada', () => {
  const erros = [];
  for (const [onde, texto] of prosaDeTela()) {
    const abertura = texto.slice(0, tamanhoDaAbertura(texto));
    if (tokensNoTexto(abertura).length > 0 || SECULO.test(abertura) || /\d{4}/.test(abertura)) {
      erros.push(`${onde}: abre com fonte — "${abertura}…"`);
    }
  }
  assert.equal(
    erros.length,
    0,
    'Feedback literal do dono: "muito científico, preciso mesclar para o povão entender e ' +
      'deixar científico também". Abre em conversa, fecha no recibo — nunca o contrário:\n  ' +
      erros.join('\n  ')
  );
});

test('toda prosa FECHA no recibo — a fonte fica na segunda metade do texto', () => {
  const erros = [];
  for (const [onde, texto] of prosaDeTela()) {
    const posicoes = [
      ...TOKENS.map((t) => texto.lastIndexOf(t)),
      texto.lastIndexOf(SEM_FONTE_ANTIGA),
    ].filter((i) => i >= 0);
    // Duas isenções, e as duas são o contrário de um buraco:
    // (a) descrição de categoria é rótulo de menu, não peça de prosa histórica;
    // (b) ressalva cuja função é dizer que ali NÃO há fonte ("é leitura nossa",
    //     "o apelido não foi verificado") não pode ser obrigada a exibir uma.
    // O que nenhuma das duas pode é ABRIR no recibo, e disso o teste acima
    // cuida. Exigir recibo aqui empurraria a citação para dentro da ressalva de
    // ausência, que é o pior lugar possível pra ela.
    const declaraAusencia = /\bnoss[ao]\b|apelido|não conseguiu verificar|não foi verificad/i.test(texto);
    if (posicoes.length === 0) {
      if (onde.startsWith('categoria.') || declaraAusencia) continue;
      erros.push(`${onde}: não tem recibo nenhum`);
      continue;
    }
    const ultimo = Math.max(...posicoes);
    if (ultimo < texto.length / 2) {
      erros.push(
        `${onde}: o último recibo está a ${Math.round((ultimo / texto.length) * 100)}% do texto — ` +
          'ele tem que fechar a peça, não abrir'
      );
    }
  }
  assert.equal(erros.length, 0, `Recibo fora do fim:\n  ${erros.join('\n  ')}`);
});

test('nenhuma data solta na prosa — todo século e todo ano pertencem a uma fonte declarada', () => {
  // A varredura no sentido contrário, portada de test/jornada.test.js: as
  // `provas` garantem que o que está na TABELA existe na base; esta garante que
  // o que está no TEXTO existe na tabela. Sem ela dava pra escrever "desde 3000
  // a.C." numa intenção e passar por todos os outros testes.
  const palheiro = Object.values(FONTES_TRADICAO)
    .map((f) => [f.autor, f.obra, f.seculo, ...(f.provas || [])].join(' | '))
    .join(' || ');

  const soltas = [];
  for (const [onde, texto] of todoTextoVisivel()) {
    const achados = new Set();
    for (const m of texto.matchAll(/\b(1[0-9]{3}|20[0-9]{2})\b/g)) achados.add(m[1]);
    for (const m of texto.matchAll(/s[ée]c\.\s*[IVXL]+/gi)) achados.add(m[0]);
    for (const achado of achados) {
      if (!palheiro.includes(achado)) soltas.push(`${onde}: "${achado}" não pertence a fonte nenhuma`);
    }
  }
  assert.deepEqual(soltas, [], `Data sem dono no texto:\n  ${soltas.join('\n  ')}`);
});

test('os passos são ação observável, e o primeiro nunca é uma promessa', () => {
  // Mesma disciplina do cabeçalho de lib/grounding.js: todo verbo de passo é de
  // ação (escreva, acenda, dobre, guarde), nenhum é de efeito.
  const VERBO_DE_EFEITO = /^(relaxe|acalme|sinta a paz|esvazie a mente|visualize o dinheiro)/i;
  for (const r of RITUAIS) {
    for (const p of r.passos) {
      assert.doesNotMatch(p, VERBO_DE_EFEITO, `${r.id}: passo com verbo de efeito — "${p}"`);
      assert.ok(!SECULO.test(p), `${r.id}: passo com citação histórica no meio — "${p}"`);
    }
  }
});

// ---------------------------------------------------------------------------
// A SUGESTÃO DIÁRIA
// ---------------------------------------------------------------------------

test('rituaisPara casa fase E dia, e nunca devolve ritual que não bate', () => {
  for (const fase of FASES_LUA) {
    for (let dia = 0; dia < 7; dia++) {
      for (const r of rituaisPara({ faseLua: fase, diaSemana: dia })) {
        const fases = r.momento.fasesLua || [];
        const dias = r.momento.diasSemana || [];
        if (fases.length) assert.ok(fases.includes(fase), `${r.id} voltou em ${fase} e não declara essa fase`);
        if (dias.length) assert.ok(dias.includes(dia), `${r.id} voltou no dia ${dia} e não declara esse dia`);
        assert.ok(r.motivo && r.motivo.length > 0, `${r.id}: veio sem motivo declarado`);
      }
    }
  }
});

test('toda combinação de fase e dia devolve pelo menos um ritual', () => {
  // Se alguma das 56 combinações vier vazia, existe um dia do ano em que a tela
  // abre sem sugestão nenhuma — e ninguém descobre até acontecer.
  const vazios = [];
  for (const fase of FASES_LUA) {
    for (let dia = 0; dia < 7; dia++) {
      const achados = rituaisPara({ faseLua: fase, diaSemana: dia });
      if (achados.length === 0) vazios.push(`${fase} + dia ${dia}`);
    }
  }
  assert.equal(vazios.length, 0, `Combinações sem ritual nenhum:\n  ${vazios.join('\n  ')}`);
});

test('sem a fase da Lua o módulo NÃO chuta — só entram os rituais de dia da semana', () => {
  // Mesma disciplina de guiaDoDia em lib/grounding.js: sem efeméride, o dia da
  // semana continua real (é aritmética de calendário) e a Lua simplesmente não
  // é afirmada. Nunca uma fase plausível inventada.
  for (let dia = 0; dia < 7; dia++) {
    const achados = rituaisPara({ faseLua: null, diaSemana: dia });
    for (const r of achados) {
      assert.equal(
        (r.momento.fasesLua || []).length,
        0,
        `${r.id} entrou sem a fase ser conhecida — o app estaria afirmando o que não sabe`
      );
    }
  }
});

test('rituaisDeHoje devolve o céu real do dia e o motivo de cada sugestão', () => {
  const quando = new Date(2026, 6, 31, 10, 0, 0); // sexta-feira
  const hoje = rituaisDeHoje(quando);
  assert.equal(hoje.diaSemana, 5);
  assert.equal(hoje.diaNome, 'sexta-feira');
  assert.equal(hoje.planetaDoDia, 'Vênus');
  assert.equal(hoje.ceuDisponivel, !!hoje.faseLua);
  if (hoje.ceuDisponivel) {
    assert.ok(FASES_LUA.includes(hoje.faseLua), `fase desconhecida: ${hoje.faseLua}`);
  }
  assert.ok(Array.isArray(hoje.rituais) && hoje.rituais.length > 0, 'sexta-feira sem sugestão nenhuma');
  for (const r of hoje.rituais) assert.ok(r.motivo.length > 0);
  // Parciais nunca repetem os exatos.
  const exatos = new Set(hoje.rituais.map((r) => r.id));
  for (const p of hoje.parciais) assert.ok(!exatos.has(p.id), `${p.id} aparece nas duas listas`);
});

test('rituaisDeHoje aguenta data inválida sem quebrar a tela', () => {
  const r = rituaisDeHoje(new Date('não é data'));
  assert.ok(r.data instanceof Date && !Number.isNaN(r.data.getTime()));
  assert.ok(Array.isArray(r.rituais));
});

test('um ano inteiro de dias reais nunca abre a tela vazia', () => {
  const vazios = [];
  const inicio = new Date(2026, 0, 1, 12, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(inicio.getTime() + i * 86400000);
    const hoje = rituaisDeHoje(d);
    if (hoje.rituais.length + hoje.parciais.length === 0) vazios.push(d.toISOString().slice(0, 10));
  }
  assert.equal(vazios.length, 0, `Dias sem sugestão nenhuma: ${vazios.slice(0, 10).join(', ')}`);
});

// ---------------------------------------------------------------------------
// O TEXTO DE COMPARTILHAR
// ---------------------------------------------------------------------------

test('todo ritual tem texto de compartilhar curto, com o aviso e terminando no link', () => {
  for (const r of RITUAIS) {
    const txt = textoCompartilhavel(r);
    assert.ok(txt.includes(r.titulo), `${r.id}: o texto de compartilhar não diz qual ritual é`);
    assert.ok(txt.includes(AVISO_ETICO), `${r.id}: sem o aviso ético`);
    assert.ok(txt.trim().endsWith(LINK_COMPARTILHAR), `${r.id}: não termina no link`);
    assert.equal(LINK_COMPARTILHAR, 'https://cosmicguide.cloud/cosmic-guide/');
    assert.ok(txt.length <= 400, `${r.id}: texto de compartilhar longo demais (${txt.length} caracteres)`);
    // O momento ideal legível vai junto, e não pode sair vazio.
    const resumo = resumoDoMomento(r);
    assert.ok(resumo.length > 3, `${r.id}: resumo do momento vazio`);
    assert.ok(txt.includes(resumo), `${r.id}: o resumo do momento não entrou no texto`);
  }
  assert.equal(textoCompartilhavel('nao-existe'), '', 'nunca compartilhe um ritual que não existe');
});

test('o resumo do momento nomeia fase e dia com as palavras que a pessoa reconhece', () => {
  assert.equal(
    resumoDoMomento('amor-carta-que-nao-se-envia'),
    'Lua Nova ou Lua Crescente · sexta-feira'
  );
  assert.equal(resumoDoMomento('prosperidade-conta-na-mesa'), 'quinta-feira');
  assert.equal(resumoDoMomento('prosperidade-semear-na-cheia'), 'Lua Cheia');
});

test('recibo() monta autor, obra e século na ordem certa', () => {
  assert.equal(
    recibo(['columelaFava']),
    'Columela, De Re Rustica XI.2.85, séc. I'
  );
  assert.match(recibo(['dioCassio', 'ptolomeuI4']), / · /);
  assert.equal(recibo(['id-que-nao-existe']), '', 'recibo nunca inventa fonte');
  assert.equal(recibo(), '');
});

test('textosVisiveis entrega a peça inteira, e não sobra campo fora da auditoria', () => {
  for (const r of RITUAIS) {
    const textos = textosVisiveis(r);
    assert.ok(textos.includes(r.intencao), `${r.id}: INTENÇÃO fora da auditoria`);
    assert.ok(textos.includes(r.cuidados), `${r.id}: CUIDADOS fora da auditoria`);
    assert.ok(textos.includes(r.momento.texto), `${r.id}: MOMENTO IDEAL fora da auditoria`);
    for (const p of r.passos) assert.ok(textos.includes(p), `${r.id}: passo fora da auditoria`);
    for (const m of r.materiais) assert.ok(textos.includes(m), `${r.id}: material fora da auditoria`);
  }
  assert.deepEqual(textosVisiveis('nao-existe'), []);
});
