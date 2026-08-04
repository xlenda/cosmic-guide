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
//
// ONDA B ENTROU EM 04/08/2026, e com ela dois casos que não são de ORDEM DE
// JSX e por isso ficam no fim do arquivo, separados: o disclaimer da tela de
// Sonhos (#7) e a primeira frase do funil do casal (#15). Nesses dois o defeito
// estava DENTRO do parágrafo — nenhuma reordenação de tela resolvia —, então a
// guarda mede a ordem interna do texto, nos três idiomas.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { LANGUAGES, _DICTS_FOR_TESTS } = require('../lib/i18n.js');

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

// ===========================================================================
// ONDA B — a ficha do céu como cabeçalho (04/08/2026)
// ===========================================================================
// O padrão desta onda é diferente do da onda A: aqui o texto quente também já
// existia, mas o que abria a tela era a MEDIDA — chips de efeméride, nome de
// fase com porcentagem, data/hora/UTC, título com dois planetas e um ângulo.
// Medida não é mentira e não sai da tela; ela só não é motivo pra ficar.

test('Horóscopo · os chips do céu descem pra depois do primeiro bloco de leitura', () => {
  // Os três fatos (Lua, fase, regente do dia) eram o PRIMEIRO card do rolo.
  // Agora a leitura do dia abre e <FichaDoCeu> entra depois do bloco 1 — o
  // mesmo desenho que o próprio card já usava por dentro com o metodoToggle.
  const src = fonteDaTela('HoroscopeScreen.js');
  const bloco = trecho(src, 'leitura.blocks.map(', 'styles.footerCard', 'HoroscopeScreen/céu do dia');
  quenteAbre(bloco, 'leituraLinhas.map(', ['<FichaDoCeu'], 'HoroscopeScreen/céu do dia');
  assert.ok(
    src.includes("t('horoscope.sky.factsTitle')"),
    'HoroscopeScreen: a ficha do céu sumiu da tela — ela desce, não se apaga'
  );
});

test('Mapa Astral · resumo — o trio abre, data/hora/UTC viram recibo', () => {
  const src = fonteDaTela('BirthChartScreen.js');
  const bloco = trecho(src, 'styles.summaryCard', "t('birthchart.positions')", 'BirthChartScreen/resumo');
  quenteAbre(bloco, 'styles.trio', ['formatDateBR(chart.date)', 'formatOffset(chart.zone.offset)'], 'BirthChartScreen/resumo');
});

test('Calendário Lunar · a reflexão abre, o nome da fase e a iluminação descem', () => {
  const src = fonteDaTela('LunarCalendarScreen.js');
  const bloco = trecho(src, 'styles.todayCard', 'styles.disclaimer', 'LunarCalendarScreen/hoje');
  quenteAbre(bloco, '{today.reflexao}', ['{today.name}', '{today.illumination}'], 'LunarCalendarScreen/hoje');
});

test('Homem Zodiacal · "A Lua hoje" abre pela leitura, o chip do signo desce pro latim', () => {
  const src = fonteDaTela('ZodiacBodyScreen.js');
  const bloco = trecho(src, 'testID="zodiacbody-moon"', "t('zodiacBody.figure.hint')", 'ZodiacBodyScreen/lua');
  quenteAbre(
    bloco,
    "t('zodiacBody.moon.part'",
    ['{transit.sign.emoji}', '{moonEntry.latin}', "t('zodiacBody.author.manilius')"],
    'ZodiacBodyScreen/lua'
  );
  // A linha que impede o cartão de virar calendário de procedimento continua
  // no ar — mexer na ordem deste cartão nunca pode custar essa frase.
  assert.ok(
    src.includes("t('zodiacBody.moon.notACalendar')"),
    'ZodiacBodyScreen: a ressalva que freia decisão sobre o corpo sumiu do cartão da Lua'
  );
});

test('Home · Evento cósmico — a descrição abre, "{planetA} em {aspect}" vira recibo', () => {
  const src = fonteDaTela('HomeScreen.js');
  const bloco = trecho(src, "t('home.sectionCosmicEvent')", '</ScrollView>', 'HomeScreen/evento cósmico');
  quenteAbre(bloco, "'home.cosmicEventDesc'", ["'home.cosmicEventTitle'", "'home.cosmicEventDate'"], 'HomeScreen/evento cósmico');
});

test('Home · compatibilidade — o resumo abre, "{aspecto} · {categoria}" desce', () => {
  const src = fonteDaTela('HomeScreen.js');
  const bloco = trecho(src, '{compat ? (', "t('home.compatSeeMore')", 'HomeScreen/compatibilidade');
  quenteAbre(bloco, '{compat.resumo}', ["'home.compatAspect'"], 'HomeScreen/compatibilidade');
});

test('Calendário Cósmico · temporada — o gancho sobe, título e datas descem', () => {
  const src = fonteDaTela('CalendarioCosmicoScreen.js');
  const bloco = trecho(src, 'testID="calendario-temporada"', 'testID="calendario-voc"', 'CalendarioCosmicoScreen/temporada');
  quenteAbre(
    bloco,
    "'calendario.season.note'",
    ["'calendario.season.title'", "'calendario.season.startedAt'"],
    'CalendarioCosmicoScreen/temporada'
  );
});

test('Calendário Cósmico · card de evento — o parágrafo abre, nome e data descem', () => {
  // Reordenação pura: o pack já escreve o parágrafo abrindo pela cena, então
  // nada foi reescrito e nenhum golden foi recapturado.
  const src = fonteDaTela('CalendarioCosmicoScreen.js');
  const bloco = trecho(src, 'function EventoCard(', 'function FaseCard(', 'CalendarioCosmicoScreen/evento');
  quenteAbre(bloco, '{conversa}', ['{evento.titulo}', 'styles.eventoQuando'], 'CalendarioCosmicoScreen/evento');
});

test('Compatibilidade · a saída dos pares difíceis aparece no bloco que ABRE', () => {
  // Uma variação do padrão desta suíte, e vale a pena nomeá-la: aqui não era a
  // FICHA que abria a tela — o bloco quente já abria certo. Era a SAÍDA que
  // estava presa no bloco recolhido. O caminho prático dos 84 pares difíceis
  // morava colado na Atenção, dentro de "De onde vem isso", que nasce fechado:
  // quem não tocasse na bibliografia lia o diagnóstico inteiro e ia embora sem
  // uma linha sobre o que fazer. Motor conforme, tela escondendo — a mesma
  // família de defeito, no eixo do alcance em vez do eixo da ordem.
  const src = fonteDaTela('CompatibilityScreen.js');
  const bloco1 = trecho(src, 'styles.realCard', 'styles.sourceToggle', 'CompatibilityScreen/bloco 1');
  assert.ok(
    bloco1.includes('ecoDoCaminho(result.caminho'),
    'CompatibilityScreen: o eco do caminho sumiu do bloco 1 — o par difícil voltou a sair sem saída visível'
  );
  assert.ok(
    bloco1.includes('rotuloDoCaminho(lang)'),
    'CompatibilityScreen: o rótulo do eco saiu do pack do idioma'
  );
  // O eco abre; o caminho inteiro, a atenção e a fonte continuam embaixo — o
  // eco é porta, e descer não é apagar.
  quenteAbre(
    src,
    'ecoDoCaminho(result.caminho',
    ['{result.cuidado}', 'styles.traitPath', "t('compat.sourceTitle')"],
    'CompatibilityScreen/caminho'
  );
});

test('Idade Real · a história abre, quem inventou e quando descem pro recibo', () => {
  const src = fonteDaTela('IdadeRealScreen.js');
  const bloco = trecho(src, 'styles.corpo', 'styles.recibo', 'IdadeRealScreen/card aberto');
  quenteAbre(bloco, '{item.detalhe}', ['UI.rotuloQuem', 'UI.rotuloQuando'], 'IdadeRealScreen/card aberto');
});

// ---------------------------------------------------------------------------
// Os dois casos de TEXTO — a ordem dentro do parágrafo, nos três idiomas
// ---------------------------------------------------------------------------

test('Sonhos · o disclaimer abre na vida real e fecha com Artemidoro/Jung como recibo', () => {
  // Ele é o PRIMEIRO parágrafo da tela, antes do campo de digitar o sonho.
  // Abria por "a tradição milenar... o grego Artemidoro... Carl Jung": currículo
  // antes de uma palavra sobre quem acordou com o sonho.
  for (const lang of LANGUAGES) {
    const texto = _DICTS_FOR_TESTS[lang]['dream.disclaimer'];
    assert.ok(texto, `${lang}: dream.disclaimer não existe`);
    const primeiraFrase = texto.split(/(?<=[.;!?])\s+/)[0];
    assert.ok(
      !/Artemidor|Jung|tradi[cç][aã]o mil|milenar|antiquity|Antiguidade|Antig[üu]edad/i.test(primeiraFrase),
      `${lang}: o disclaimer de Sonhos volta a abrir pela linhagem — "${primeiraFrase}"`
    );
    // A linhagem não pode sumir: ela é o recibo, e recibo não se apaga.
    for (const recibo of ['Artemidor', 'Jung']) {
      assert.ok(texto.includes(recibo), `${lang}: o disclaimer perdeu ${recibo} — a ficha desce, não se apaga`);
    }
    assert.ok(
      texto.indexOf('Jung') > texto.indexOf(primeiraFrase) + primeiraFrase.length - 1,
      `${lang}: Jung voltou pra abertura do disclaimer`
    );
    // E a única frase do app que manda procurar gente de verdade continua no
    // fim, inteira. Sonho é a porta por onde entra quem está sofrendo.
    assert.match(
      texto,
      /(N[ãa]o substitui|No sustituye|does not replace)[^.]*(profissional|profesional|professional)/i,
      `${lang}: o disclaimer de Sonhos perdeu a linha que manda procurar acompanhamento`
    );
  }
});

test('Funil do casal · quiz.hero.sub não abre por lista de jargão, e não promete nada', () => {
  // "Sol + Ascendente + Lua. Cartas. Compatibilidade do casal." era a primeira
  // frase de quem chega pelo link — jargão empilhado na tela de conversão.
  for (const lang of LANGUAGES) {
    const texto = _DICTS_FOR_TESTS[lang]['quiz.hero.sub'];
    assert.ok(texto && texto.length > 60, `${lang}: quiz.hero.sub sumiu ou encolheu pra uma etiqueta`);
    assert.ok(
      !/^(Sol|Sun)\s*\+/.test(texto.trim()),
      `${lang}: a chamada do funil voltou a abrir pela lista de jargão — "${texto}"`
    );
    // A doutrina não afrouxa na tela que converte: nada de porcentagem, nada de
    // prova social, nada de garantia.
    assert.ok(!/\d\s*%/.test(texto), `${lang}: porcentagem na chamada do funil`);
    assert.ok(
      !/garant|assegur|guarantee|mais de \d|m[áa]s de \d|more than \d/i.test(texto),
      `${lang}: promessa ou prova social na chamada do funil — "${texto}"`
    );
  }
});

test('a ficha continua na tela — descer não é apagar', () => {
  // O erro oposto ao que esta frente corrigiu, e o mais fácil de cometer na
  // próxima limpeza: sumir com o dado em nome da leitura. O app mostra a conta
  // que fez; ela só não abre a porta.
  const birth = fonteDaTela('BirthChartScreen.js');
  const prof = fonteDaTela('ProfeccoesScreen.js');
  const home = fonteDaTela('HomeScreen.js');
  for (const [origem, src, campos] of [
    [
      'BirthChartScreen',
      birth,
      [
        '{seita.seitaMapa}',
        '{chart.profeccao.titulo}',
        '{chart.profeccao.origemRotulo}',
        // ONDA B: a linha do instante de nascimento desceu pra baixo do trio —
        // e é ela que prova que a conta usou o fuso e o horário de verão certos.
        'formatDateBR(chart.date)',
        'formatOffset(chart.zone.offset)',
      ],
    ],
    ['ProfeccoesScreen', prof, ['{anual.titulo}', '{anual.casaProfectada}', '{anual.senhorDoAno}', '{anual.origemRotulo}']],
    ['HomeScreen', home, ['{aspecto.text}', 'fase.linhaCurta', "'home.cosmicEventTitle'", "'home.compatAspect'"]],
    ['HoroscopeScreen', fonteDaTela('HoroscopeScreen.js'), ["'horoscope.sky.fact.moon'", "'horoscope.sky.fact.phase'", "'horoscope.sky.fact.dayRuler'"]],
    ['LunarCalendarScreen', fonteDaTela('LunarCalendarScreen.js'), ['{today.name}', '{today.illumination}']],
    ['ZodiacBodyScreen', fonteDaTela('ZodiacBodyScreen.js'), ['{transit.sign.emoji}', '{moonEntry.latin}', '{moonEntry.locus}']],
    [
      'CalendarioCosmicoScreen',
      fonteDaTela('CalendarioCosmicoScreen.js'),
      ['{evento.titulo}', "'calendario.season.title'", "'calendario.season.startedAt'", "'calendario.season.endsAt'"],
    ],
    ['IdadeRealScreen', fonteDaTela('IdadeRealScreen.js'), ['{item.quemInventou}', '{item.quando}']],
  ]) {
    for (const campo of campos) {
      assert.ok(src.includes(campo), `${origem}: ${campo} sumiu da tela — a ficha desce, não se apaga`);
    }
  }
});
