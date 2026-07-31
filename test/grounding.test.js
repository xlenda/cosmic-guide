// Assentar — os testes que seguram o ritual de respiração.
//
// Quatro trabalhos, e o terceiro e o quarto são os que importam de verdade:
//
// 1. MÁQUINA DE ESTADOS. As funções de lib/grounding.js são puras (ninguém lê
//    relógio lá dentro), então dá pra percorrer uma sessão inteira de 20
//    minutos em milissegundos e conferir cada fase.
//
// 2. INTEGRIDADE DOS DADOS E DAS CHAVES. As famílias grounding.pattern.*,
//    .ruler.*, .element.*, .notFound.* e .phase.* são montadas em RUNTIME
//    (helpers de lib/grounding.js), então test/i18nKeysExist.test.js não as
//    enxerga — uma chave faltando sairia na tela como
//    "grounding.ruler.saturno.quality" pro visitante, sem erro nenhum.
//
// 3. A LINHA QUE NÃO SE ATRAVESSA (regra do dono). Respiração e presença são
//    PRÁTICA, nunca tratamento. O teste varre TODOS os valores grounding.* nos
//    três idiomas atrás de promessa de saúde ("alivia", "reduz a ansiedade",
//    "melhora o sono", "relaxa", "cura") e atrás do vocabulário de EARTHING
//    (elétron, radical livre, campo eletromagnético, descarga, polaridade),
//    que é a pseudociência que a palavra "aterramento" arrasta junto.
//
//    Isso existe porque o risco não é escrever a frase errada hoje: é alguém,
//    daqui a três meses, "melhorar" a cópia pra ela vender melhor, e a tela
//    virar promessa terapêutica sem ninguém perceber. Uma alegação de saúde em
//    inglês não é menos ilegal por estar em inglês.
//
// 4. A SEGURANÇA QUE É DESENHO, NÃO TEXTO. O risco real da prática está na
//    RETENÇÃO. Os testes abaixo travam três decisões de desenho que protegem
//    de verdade e que seriam fáceis de desfazer sem querer: o padrão
//    pré-selecionado não tem retenção; a lista está ordenada por retenção
//    crescente; e o aviso de contraindicação é renderizado ANTES da escolha,
//    nunca no rodapé. Também travam a ausência de recompensa: se alguém
//    plugar token ou sequência própria aqui, o ritual vira obrigação pra quem
//    acabou de receber uma leitura pesada, e o teste quebra.
//
// Falha aqui = não pode publicar. É de propósito.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { _DICTS_FOR_TESTS, LANGUAGES } = require('../lib/i18n.js');
const { SIGNS } = require('../lib/signs.js');
const { rulerOfDay } = require('../lib/dailyThought.js');
const {
  FASES,
  PADROES,
  PADRAO_PADRAO,
  DURACOES_MIN,
  DURACAO_PADRAO_MIN,
  REGENTES,
  ELEMENTOS,
  NAO_ACHADO,
  FONTES,
  VOCABULARIO_EARTHING,
  TRIPLICIDADE_TERRA,
  cicloSegundos,
  elementoPorNomeApp,
  faseEm,
  fasesAtivas,
  formatarTempo,
  guiaDoDia,
  padraoPorId,
  regentePorPlaneta,
  retencaoMaisLonga,
  sessaoEm,
  padraoKey,
  regenteKey,
  elementoKey,
  naoAchadoKey,
  faseKey,
} = require('../lib/grounding.js');

const RAIZ = path.join(__dirname, '..');
const lerFonte = (...p) => fs.readFileSync(path.join(RAIZ, ...p), 'utf8');
const TELA = lerFonte('screens', 'GroundingScreen.js');
const GUIA = lerFonte('components', 'BreathGuide.js');
const CONVITE = lerFonte('components', 'GroundingInvite.js');

// Procura a CHAMADA t('chave'), não a menção à chave: os comentários citam
// nomes de chave e um indexOf cru pegaria o comentário.
const CHAMADA = (k) => `t('${k}')`;
const renderiza = (fonte, k) => fonte.includes(CHAMADA(k));
const ondeRenderiza = (fonte, k) => fonte.indexOf(CHAMADA(k));

// ---------------------------------------------------------------------------
// 1. A máquina de estados
// ---------------------------------------------------------------------------

test('cada padrão tem as quatro fases declaradas e um ciclo com duração real', () => {
  assert.equal(PADROES.length, 3);
  const vistos = new Set();
  for (const p of PADROES) {
    assert.ok(!vistos.has(p.id), `id repetido: ${p.id}`);
    vistos.add(p.id);
    for (const f of FASES) {
      assert.equal(typeof p.tempos[f], 'number', `${p.id}: falta a fase ${f}`);
      assert.ok(p.tempos[f] >= 0 && p.tempos[f] <= 12, `${p.id}: tempo absurdo em ${f}`);
    }
    assert.ok(p.tempos.inspira > 0 && p.tempos.expira > 0, `${p.id}: sem entrada ou sem saída de ar`);
    assert.ok(cicloSegundos(p) >= 8, `${p.id}: ciclo curto demais`);
    assert.ok(p.locus && p.locus.length > 10, `${p.id}: sem fonte declarada`);
    // `temRetencao` não pode divergir dos números — é ele que a tela usa pra
    // marcar o padrão e oferecer a alternativa sem pausa.
    const retencao = p.tempos.seguraCheio + p.tempos.seguraVazio;
    assert.equal(p.temRetencao, retencao > 0, `${p.id}: temRetencao não bate com os tempos`);
  }
});

test('fase de duração zero não existe no ciclo (não é pausa de zero, é fase que não acontece)', () => {
  const igual = padraoPorId('igual');
  const ativas = fasesAtivas(igual).map((f) => f.fase);
  assert.deepEqual(ativas, ['inspira', 'expira']);
  assert.equal(cicloSegundos(igual), 8);
  assert.equal(cicloSegundos(padraoPorId('quadrado')), 16);
  assert.equal(cicloSegundos(padraoPorId('quatroSeteOito')), 19);
});

test('faseEm percorre as fases na ordem, com contagem de 1 até a duração', () => {
  const p = padraoPorId('quadrado'); // 4-4-4-4, o único com as quatro fases
  const esperado = [];
  for (const f of FASES) for (let i = 0; i < 4; i++) esperado.push(f);

  for (let s = 0; s < 16; s++) {
    const r = faseEm(p, s + 0.5);
    assert.ok(r, `sem fase em ${s}s`);
    assert.equal(r.fase, esperado[s], `segundo ${s}`);
    assert.equal(r.contagem, (s % 4) + 1, `contagem no segundo ${s}`);
    assert.ok(r.progresso >= 0 && r.progresso < 1);
    assert.equal(r.ciclo, 0);
  }
  // Segunda volta: mesma fase, ciclo seguinte.
  const volta = faseEm(p, 16.5);
  assert.equal(volta.fase, 'inspira');
  assert.equal(volta.ciclo, 1);
});

test('faseEm nunca devolve nulo nem contagem fora do intervalo, em nenhum padrão', () => {
  for (const p of PADROES) {
    const ciclo = cicloSegundos(p);
    for (let t = 0; t < ciclo * 3; t += 0.25) {
      const r = faseEm(p, t);
      assert.ok(r, `${p.id}: sem fase em ${t}s`);
      assert.ok(p.tempos[r.fase] > 0, `${p.id}: caiu numa fase de duração zero`);
      assert.ok(r.contagem >= 1 && r.contagem <= r.duracaoFase, `${p.id}: contagem ${r.contagem} em ${t}s`);
      assert.ok(r.restanteNaFase > 0 && r.restanteNaFase <= r.duracaoFase);
    }
    // Tempo negativo ou lixo cai no começo, nunca quebra.
    assert.equal(faseEm(p, -5).fase, 'inspira');
    assert.equal(faseEm(p, NaN).fase, 'inspira');
  }
});

test('sessaoEm termina no tempo escolhido e não deixa o círculo dar a volta depois', () => {
  for (const min of DURACOES_MIN) {
    const total = min * 60;
    const p = padraoPorId('quadrado');
    const antes = sessaoEm(p, min, total - 1);
    assert.equal(antes.terminou, false);
    assert.equal(antes.restanteS, 1);

    const noFim = sessaoEm(p, min, total);
    assert.equal(noFim.terminou, true);
    assert.equal(noFim.restanteS, 0);
    assert.equal(noFim.decorridoS, total);

    // Passou do fim: continua terminado, sem tempo negativo e sem voltar pro
    // começo do ciclo (a tela do fim não pode mostrar "Inspire" do zero).
    const depois = sessaoEm(p, min, total + 30);
    assert.equal(depois.terminou, true);
    assert.equal(depois.restanteS, 0);
    assert.equal(depois.decorridoS, total);
    assert.equal(depois.fase, noFim.fase);
  }
});

test('a contagem de ciclos bate com o tempo decorrido', () => {
  const p = padraoPorId('igual'); // ciclo de 8 s
  assert.equal(sessaoEm(p, 3, 0).ciclosCompletos, 0);
  assert.equal(sessaoEm(p, 3, 7.9).ciclosCompletos, 0);
  assert.equal(sessaoEm(p, 3, 8).ciclosCompletos, 1);
  assert.equal(sessaoEm(p, 3, 180).ciclosCompletos, 22); // 180 / 8
});

test('formatarTempo mostra minuto e segundo, e nunca tempo negativo', () => {
  assert.equal(formatarTempo(0), '0:00');
  assert.equal(formatarTempo(9), '0:09');
  assert.equal(formatarTempo(60), '1:00');
  assert.equal(formatarTempo(1199), '19:59');
  assert.equal(formatarTempo(1200), '20:00');
  // Fração de segundo arredonda pra cima: "0:01" enquanto ainda resta algo,
  // nunca "0:00" com a sessão rodando.
  assert.equal(formatarTempo(0.4), '0:01');
  assert.equal(formatarTempo(-30), '0:00');
  assert.equal(formatarTempo(NaN), '0:00');
});

// ---------------------------------------------------------------------------
// 2. Segurança por desenho — o que de fato protege
// ---------------------------------------------------------------------------

test('o padrão pré-selecionado é o primeiro da lista e NÃO tem retenção', () => {
  const padrao = padraoPorId(PADRAO_PADRAO);
  assert.equal(padrao.id, PADROES[0].id, 'o padrão pré-selecionado tem que ser o primeiro da lista');
  assert.equal(
    padrao.temRetencao,
    false,
    'O risco concreto da prática está concentrado na retenção. Quem só apertou ' +
      'começar não pode receber o elemento de maior risco: o padrão de entrada ' +
      'é sem pausa, e retenção é escolha explícita.'
  );
  assert.equal(padrao.tempos.seguraCheio, 0);
  assert.equal(padrao.tempos.seguraVazio, 0);
});

test('a lista de padrões está ordenada pela retenção MAIS LONGA, crescente', () => {
  // A medida é o máximo, não a soma — ver retencaoMaisLonga em
  // lib/grounding.js. Somando as pausas do ciclo, o quadrado (4+4=8) pareceria
  // mais pesado que o 4-7-8 (7+0=7) e a lista sairia ordenada ao contrário do
  // que importa: o que exige esforço é quanto tempo dura UMA apneia.
  const retencoes = PADROES.map(retencaoMaisLonga);
  assert.deepEqual(retencoes, [0, 4, 7]);
  for (let i = 1; i < retencoes.length; i++) {
    assert.ok(
      retencoes[i] >= retencoes[i - 1],
      `${PADROES[i].id} tem retenção mais curta que ${PADROES[i - 1].id} e vem depois — ` +
        'a ordem existe pra que o padrão mais agressivo nunca fique perto do topo'
    );
  }
  // O 4-7-8 é o de retenção mais longa e tem que ser o último.
  assert.equal(PADROES[PADROES.length - 1].id, 'quatroSeteOito');
  assert.equal(padraoPorId('quatroSeteOito').tempos.seguraCheio, 7);
  assert.equal(retencaoMaisLonga(PADRAO_PADRAO), 0);
});

test('id desconhecido cai no padrão sem retenção, nunca num padrão com pausa', () => {
  assert.equal(padraoPorId('padrao-que-nao-existe').id, PADRAO_PADRAO);
  assert.equal(padraoPorId(null).temRetencao, false);
  assert.equal(padraoPorId(undefined).temRetencao, false);
});

test('as durações oferecidas são 3, 10 e 20 minutos, e a padrão é a mais curta', () => {
  assert.deepEqual(DURACOES_MIN, [3, 10, 20]);
  assert.equal(DURACAO_PADRAO_MIN, 3);
  assert.equal(DURACAO_PADRAO_MIN, Math.min(...DURACOES_MIN));
});

test('o ritual não tem recompensa, token nem sequência própria', () => {
  // Se o ritual pagar alguma coisa, ele deixa de ser "alguns minutos com o que
  // você leu" e vira obrigação — e aí quem está mal fica no exercício por
  // causa da métrica. O único efeito permitido é marcar o dia como ativo, o
  // mesmo caminho de qualquer leitura.
  for (const [nome, fonte] of [['GroundingScreen', TELA], ['GroundingInvite', CONVITE], ['BreathGuide', GUIA]]) {
    assert.doesNotMatch(fonte, /awardTokens|awardReadingTokens|TOKEN_REWARDS/, `${nome} paga token`);
    assert.doesNotMatch(fonte, /recordReadingCompletion/, `${nome} registra o ritual como leitura`);
  }
  assert.match(TELA, /recordActiveDay\(\)/, 'terminar tem que marcar o dia ativo, como as outras telas');
  // E só no fim natural: quem sai no meio não perde nem ganha nada.
  const iFim = TELA.indexOf("setEtapa('fim')");
  const iMarca = TELA.indexOf('recordActiveDay()');
  assert.ok(iFim > 0 && iMarca > iFim, 'recordActiveDay tem que ficar no ramo do fim natural da sessão');
});

test('o convite do fim da leitura é fácil de recusar e não trava a tela', () => {
  assert.doesNotMatch(CONVITE, /<Modal/, 'o convite é card, nunca janela que trava a tela');
  assert.ok(renderiza(CONVITE, 'grounding.invite.dismiss'), 'sumiu o botão de recusar');
  assert.ok(renderiza(CONVITE, 'grounding.invite.cta'));
  assert.ok(renderiza(CONVITE, 'grounding.invite.note'), 'sumiu a linha que diz que não há nada a completar');
});

test('o convite está plugado nas quatro telas de leitura', () => {
  for (const tela of ['TarotScreen', 'DreamScreen', 'PalmScreen', 'CoffeeScreen']) {
    const src = lerFonte('screens', `${tela}.js`);
    assert.match(src, /<GroundingInvite/, `${tela}: o convite do fim da leitura sumiu`);
    assert.match(src, /import GroundingInvite from/, `${tela}: import ausente`);
    // Depois do resultado e ANTES do upsell: o convite pra ficar não pode vir
    // depois do convite pra pagar.
    const iConvite = src.indexOf('<GroundingInvite');
    const iUpsell = src.indexOf('upsellCard');
    if (iUpsell > 0) {
      assert.ok(iConvite < iUpsell, `${tela}: o convite ficou depois do bloco de assinatura`);
    }
  }
});

// ---------------------------------------------------------------------------
// 3. A ordem da tela — aviso escondido embaixo do conteúdo não é aviso
// ---------------------------------------------------------------------------

test('os dois avisos aparecem antes de qualquer escolha', () => {
  const iNotice = ondeRenderiza(TELA, 'grounding.notice.body');
  const iCondicoes = ondeRenderiza(TELA, 'grounding.warning.conditions');
  const iConsulte = ondeRenderiza(TELA, 'grounding.warning.consult');
  const iPadrao = ondeRenderiza(TELA, 'grounding.section.pattern');
  const iComecar = ondeRenderiza(TELA, 'grounding.start');

  assert.ok(iNotice > 0, 'o aviso de que isto é prática sumiu da tela');
  assert.ok(iCondicoes > 0, 'o aviso de contraindicação sumiu da tela');
  assert.ok(iConsulte > 0, 'a linha que manda consultar um profissional sumiu da tela');
  assert.ok(
    iNotice < iCondicoes && iCondicoes < iPadrao && iPadrao < iComecar,
    'A ordem tem que ser: aviso de prática → aviso de contraindicação → escolha ' +
      '→ começar. Aviso depois da escolha, ou no rodapé, não é aviso.'
  );
});

test('a permissão de parar aparece TAMBÉM durante a prática, não só no começo', () => {
  // Uma linha que age no momento em que a pessoa precisa faz mais pela
  // segurança real do que qualquer disclaimer lido antes de começar: ela
  // desarma a sensação de que interromper é falhar.
  const ocorrencias = TELA.split(CHAMADA('grounding.warning.stopAnytime')).length - 1;
  assert.ok(
    ocorrencias >= 2,
    'grounding.warning.stopAnytime tem que ser renderizada no aviso E durante a ' +
      `sessão (achei ${ocorrencias} ocorrência(s))`
  );
});

test('escolher um padrão com retenção mostra a alternativa sem pausa', () => {
  assert.ok(
    renderiza(TELA, 'grounding.warning.retention'),
    'sumiu a linha que oferece o padrão sem pausa a quem escolheu um com retenção'
  );
  assert.match(TELA, /padrao\.temRetencao/, 'a linha da retenção precisa ser condicional ao padrão escolhido');
});

test('o guia visual respeita quem pede menos movimento e nunca depende só da animação', () => {
  assert.match(GUIA, /prefers-reduced-motion/, 'BreathGuide ignora a preferência de movimento reduzido');
  assert.match(GUIA, /isReduceMotionEnabled/, 'falta a leitura da preferência no runtime nativo');
  assert.match(GUIA, /semMovimento \?/, 'falta o caminho sem animação');
  // O nome da fase e a contagem em texto, sempre — nos dois modos.
  assert.match(GUIA, /breath-phase/);
  assert.match(GUIA, /breath-count/);
  assert.ok(GUIA.includes('faseKey(fase)'), 'o rótulo da fase tem que sair do dicionário, não ser texto solto');
});

test('o som é o motor único do app, não um segundo motor', () => {
  assert.match(TELA, /import CosmicSoundPlayer from/, 'a tela precisa reusar o controle de som que já existe');
  assert.doesNotMatch(TELA, /createCosmicSound/, 'a tela não pode instanciar um segundo motor de áudio');
  assert.doesNotMatch(TELA, /new AudioContext|webkitAudioContext/, 'áudio próprio na tela do ritual');
  // E nunca começa sozinho: nenhuma chamada de tocar() disparada pela tela.
  assert.doesNotMatch(TELA, /\.tocar\(\)/, 'o som nunca pode começar sozinho ao abrir o ritual');
});

// ---------------------------------------------------------------------------
// 4. O céu de hoje — sem fabricar nada
// ---------------------------------------------------------------------------

test('os sete regentes cobrem os sete dias da semana, na mesma fonte do resto do app', () => {
  assert.equal(REGENTES.length, 7);
  for (let dia = 0; dia < 7; dia++) {
    // 04/01/2026 é um domingo — a partir dele, os sete dias seguidos.
    const d = new Date(2026, 0, 4 + dia, 12, 0, 0);
    assert.equal(d.getDay(), dia);
    const planeta = rulerOfDay(d).planet;
    const regente = regentePorPlaneta(planeta);
    assert.ok(regente, `sem entrada de regente para ${planeta} (dia ${dia})`);
    assert.equal(regente.diaSemana, dia, `${planeta} está no dia errado da semana`);
    assert.ok(regente.verbatim.length > 30, `${regente.id}: citação verbatim ausente`);
  }
});

test('a citação da Lua não traz a passagem de putrefação', () => {
  // O mesmo capítulo de Ptolomeu diz que a ação da Lua é amolecer e causar
  // putrefação nos corpos. É imagem de decomposição física e foi cortada de
  // propósito — numa tela de ritual, só pode dar errado.
  const lua = REGENTES.find((r) => r.id === 'lua');
  assert.doesNotMatch(lua.verbatim, /putref|soften/i);
  assert.match(lua.verbatim, /humidifying/);
});

test('os quatro elementos cobrem os elementos reais de lib/signs.js', () => {
  const usados = new Set(SIGNS.map((s) => s.element));
  assert.equal(usados.size, 4);
  for (const nome of usados) {
    const e = elementoPorNomeApp(nome);
    assert.ok(e, `sem entrada para o elemento "${nome}" — a tela mostraria buraco`);
  }
  assert.equal(ELEMENTOS.length, 4);
  assert.equal(elementoPorNomeApp('não-existe'), null, 'nunca chuta um elemento');
});

test('guiaDoDia é determinístico por dia e nunca fabrica a posição da Lua', () => {
  const manha = new Date(2026, 6, 30, 8, 0, 0);
  const noite = new Date(2026, 6, 30, 23, 30, 0);
  const a = guiaDoDia(manha);
  const b = guiaDoDia(noite);
  assert.equal(a.dia, b.dia, 'o mesmo dia local tem que dar o mesmo resultado');
  assert.equal(a.planeta, b.planeta);
  assert.equal(a.signoLua, b.signoLua);
  assert.equal(a.elemento && a.elemento.id, b.elemento && b.elemento.id);

  // Com efeméride disponível (é o caso nos testes), o elemento vem preenchido
  // e casa com o signo; sem ela, ceuDisponivel seria false e o elemento nulo —
  // nunca um elemento plausível inventado.
  assert.equal(a.ceuDisponivel, !!a.signoLua);
  if (a.ceuDisponivel) {
    const signo = SIGNS.find((s) => s.name === a.signoLua);
    assert.ok(signo);
    assert.equal(a.elemento.elementoApp, signo.element);
    assert.equal(a.elementoTerra, signo.element === 'terra');
  } else {
    assert.equal(a.elemento, null);
  }
  // O regente continua real mesmo sem efeméride: ordem caldaica é aritmética
  // de dia da semana.
  assert.ok(a.regente, 'o regente do dia nunca depende de efeméride');
});

test('a triplicidade de terra traz os três signos e as duas escolas de regentes', () => {
  assert.deepEqual(TRIPLICIDADE_TERRA.signos, ['Touro', 'Virgem', 'Capricórnio']);
  assert.match(TRIPLICIDADE_TERRA.locus, /Tetrabiblos I\.xxi/);
  assert.match(TRIPLICIDADE_TERRA.divergenciaLocus, /Doroteu|Valente/);
  for (const nome of TRIPLICIDADE_TERRA.signos) {
    const s = SIGNS.find((x) => x.name === nome);
    assert.ok(s && s.element === 'terra', `${nome} não é signo de terra em lib/signs.js`);
  }
});

test('a bibliografia não sumiu e aponta para as fontes primárias', () => {
  assert.ok(FONTES.length >= 10);
  assert.ok(FONTES.some((f) => /Yoga Sutras/.test(f)));
  assert.ok(FONTES.some((f) => /Tetrabiblos/.test(f)));
  assert.ok(FONTES.some((f) => /Aristóteles/.test(f)));
  assert.ok(FONTES.some((f) => /Dião Cássio/.test(f)));
});

// ---------------------------------------------------------------------------
// 5. Paridade das chaves montadas em runtime
// ---------------------------------------------------------------------------

function chavesEsperadas() {
  const keys = [];
  for (const p of PADROES) {
    for (const campo of ['name', 'rhythm', 'about', 'caution']) keys.push(padraoKey(p.id, campo));
  }
  for (const r of REGENTES) {
    keys.push(regenteKey(r.id, 'name'));
    keys.push(regenteKey(r.id, 'quality'));
    if (r.temPonte) keys.push(regenteKey(r.id, 'bridge'));
  }
  for (const e of ELEMENTOS) {
    keys.push(elementoKey(e.id, 'name'));
    keys.push(elementoKey(e.id, 'qualities'));
  }
  for (const n of NAO_ACHADO) keys.push(naoAchadoKey(n));
  for (const f of FASES) keys.push(faseKey(f));
  return keys;
}

test('toda chave montada em runtime existe nos três idiomas', () => {
  const keys = chavesEsperadas();
  assert.ok(keys.length > 35, 'a lista de chaves esperadas encolheu demais');
  const faltando = [];
  for (const lang of LANGUAGES) {
    const dict = _DICTS_FOR_TESTS[lang];
    for (const k of keys) {
      const v = dict[k];
      if (typeof v !== 'string' || v.trim().length === 0) faltando.push(`${lang}: ${k}`);
    }
  }
  assert.equal(
    faltando.length,
    0,
    `${faltando.length} chave(s) montada(s) em runtime sem tradução — a tela ` +
      `mostraria o nome da chave:\n  ` + faltando.slice(0, 30).join('\n  ')
  );
});

// ---------------------------------------------------------------------------
// 6. A LINHA QUE NÃO SE ATRAVESSA
// ---------------------------------------------------------------------------

// Chaves dispensadas da varredura, cada uma com o motivo escrito. Só entra
// aqui o que NOMEIA a frase proibida justamente para negá-la ou para mandar a
// pessoa procurar um profissional. Nunca acrescente uma chave de conteúdo.
const ISENTAS = new Set([
  // O aviso PRECISA dizer que isto não é tratamento e que dúvida de saúde se
  // leva a um profissional — é o oposto do risco.
  'grounding.notice.title',
  'grounding.notice.body',
  'grounding.notice.footer',
  // O aviso de contraindicação, no padrão da Headspace: nomear as condições
  // (epilepsia, cardiovascular, ansiedade, TEPT, gravidez) e mandar consultar.
  // Ele não descreve sintoma nem mecanismo — aponta pra fora, que é
  // exatamente a antítese de "adiar o médico".
  'grounding.warning.conditions',
  'grounding.warning.consult',
]);

// Prefixo dispensado: a seção que CITA as alegações (inclusive o earthing e
// seus elétrons) para dizer que não se sustentam. Se ela não pudesse escrever
// a palavra, não poderia desmenti-la.
const PREFIXOS_ISENTOS = ['grounding.notFound.'];

// Promessa de efeito sobre corpo ou mente, nos três idiomas. Mesma régua de
// test/cosmicSound.test.js — uma alegação de saúde em espanhol não é menos
// ilegal por estar em espanhol.
const PROMESSAS = [
  // pt
  /\bcur(a|ar|as|am|ativ)/i, /\btrata(r|mento)?\b/i, /\bregenera/i,
  /\bansiedade\b/i, /\bdepress(ão|ao|iva|ivo)\b/i, /\bins[oô]nia\b/i,
  /\bdores?\b/i, /\bterap[eê]utic/i, /\bimunidade\b/i, /\bremédio\b/i,
  /\bsono\b/i, /\bdormir\b/i, /\bestresse\b/i, /\brelaxa/i, /\bacalma\b/i,
  /\balivi(a|ar|o)\b/i, /\bharmoniza/i, /\bequilibra/i, /\bbem-estar\b/i,
  /\bsaúde\b/i, /\bcortisol\b/i, /\bpressão arterial\b/i, /\bsistema nervoso\b/i,
  // es
  /\btrata(miento)?\b/i, /\bansiedad\b/i, /\bdepresión\b/i, /\binsomnio\b/i,
  /\bdolor(es)?\b/i, /\bterapéutic/i, /\binmunidad\b/i, /\bremedio\b/i,
  /\bsueño\b/i, /\bestrés\b/i, /\brelaja/i, /\bcalma\b/i, /\barmoniza/i,
  /\bbienestar\b/i, /\bsalud\b/i, /\bpresión arterial\b/i, /\bsistema nervioso\b/i,
  // en
  /\bcure[sd]?\b/i, /\bheal(s|ing|ed)?\b/i, /\btreat(s|ment|ing)?\b/i,
  /\banxiety\b/i, /\bdepression\b/i, /\binsomnia\b/i, /\bpain\b/i,
  /\btherapeutic\b/i, /\bimmun/i, /\bremedy\b/i, /\bsleep\b/i, /\bstress\b/i,
  /\brelax/i, /\bsoothe?s?\b/i, /\brelieve/i, /\bharmoni[sz]e/i,
  /\bwell-?being\b/i, /\bwellness\b/i, /\bhealth\b/i, /\bblood pressure\b/i,
  /\bnervous system\b/i,
];

function entradasGrounding(lang) {
  const dict = _DICTS_FOR_TESTS[lang];
  return Object.keys(dict)
    .filter((k) => k.startsWith('grounding.') || k.startsWith('home.card.grounding.'))
    .map((k) => [k, dict[k]]);
}

function varrer(regras) {
  const violacoes = [];
  for (const lang of LANGUAGES) {
    for (const [k, v] of entradasGrounding(lang)) {
      if (ISENTAS.has(k)) continue;
      if (PREFIXOS_ISENTOS.some((p) => k.startsWith(p))) continue;
      for (const re of regras) {
        if (re.test(v)) violacoes.push(`${lang} ${k} → ${re}`);
      }
    }
  }
  return violacoes;
}

test('nenhum texto do ritual promete efeito sobre corpo ou mente (pt, es, en)', () => {
  const violacoes = varrer(PROMESSAS);
  assert.equal(
    violacoes.length,
    0,
    'Respiração e presença são PRÁTICA, nunca tratamento. Estas frases prometem ' +
      'efeito e não podem existir — descreva o que a pessoa VAI FAZER (inspire, ' +
      'conte, solte) ou o que a tradição associa, com a fonte:\n  ' +
      violacoes.join('\n  ')
  );
});

test('nenhum texto do ritual usa o vocabulário de earthing, nem como metáfora', () => {
  // "Descarregar a energia negativa no chão" é earthing de roupa nova, e o
  // leitor não faz a distinção. A imagem da terra entra pelo lado astrológico
  // (Aristóteles + Ptolomeu), que é declaradamente tradição — não mecanismo.
  const regras = VOCABULARIO_EARTHING.map((termo) => new RegExp(termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  const violacoes = varrer(regras);
  assert.equal(
    violacoes.length,
    0,
    'Earthing (elétrons, radicais livres, campos eletromagnéticos, descarga, ' +
      'polaridade) não tem lastro e não entra nesta tela nem como imagem ' +
      `poética:\n  ${violacoes.join('\n  ')}`
  );
  assert.ok(VOCABULARIO_EARTHING.length >= 10, 'a lista de termos banidos encolheu');
});

test('as qualidades planetárias são atribuídas à tradição, nunca afirmadas', () => {
  // Ptolomeu descreve efeitos físicos e meteorológicos, não estados de ânimo.
  // O sujeito da frase tem que ser o PLANETA: "a tradição atribui a Saturno
  // resfriar e secar". Perto de um exercício de respiração, verbo térmico
  // dirigido a quem lê é lido como efeito fisiológico.
  for (const lang of LANGUAGES) {
    for (const r of REGENTES) {
      const v = _DICTS_FOR_TESTS[lang][regenteKey(r.id, 'quality')];
      assert.match(
        v,
        /tradi(ção|ción)|tradition/i,
        `${lang} ${r.id}: a qualidade precisa se declarar como atribuição de tradição`
      );
      assert.doesNotMatch(
        v,
        /\bvocê\b|\byour\b|\byou\b|\bti\b|\btu\b/i,
        `${lang} ${r.id}: a qualidade planetária está falando com quem lê`
      );
    }
  }
});

test('as qualidades dos elementos se declaram como doutrina clássica', () => {
  for (const lang of LANGUAGES) {
    for (const e of ELEMENTOS) {
      const v = _DICTS_FOR_TESTS[lang][elementoKey(e.id, 'qualities')];
      assert.match(
        v,
        /doutrina|doctrina|doctrine/i,
        `${lang} ${e.id}: falta declarar que é doutrina clássica, não física de hoje`
      );
    }
  }
});

test('o texto não repete as alegações de Weil sobre o 4-7-8', () => {
  // Podemos atribuir o padrão a ele como fato histórico. Não podemos
  // reproduzir "tranquilizante natural do sistema nervoso" nem "dorme em 60
  // segundos" — citar a promessa, mesmo entre aspas e com atribuição, é
  // colocar a promessa na tela.
  const PROIBIDAS = [
    /tranquilizante/i,
    /natural tranqu/i,
    /60 segundos/i,
    /60 seconds/i,
    /\bsegundos? para dormir\b/i,
  ];
  for (const lang of LANGUAGES) {
    for (const campo of ['about', 'caution', 'rhythm', 'name']) {
      const v = _DICTS_FOR_TESTS[lang][padraoKey('quatroSeteOito', campo)];
      for (const re of PROIBIDAS) {
        assert.doesNotMatch(v, re, `${lang} 4-7-8 ${campo}: alegação de Weil reproduzida`);
      }
    }
  }
});

test('a seção do que não se achou continua nomeando as quatro coisas', () => {
  assert.deepEqual(NAO_ACHADO, ['upanishads', 'terraPsicologia', 'quatroSeteOito', 'earthing']);
  for (const lang of LANGUAGES) {
    for (const id of NAO_ACHADO) {
      const v = _DICTS_FOR_TESTS[lang][naoAchadoKey(id)];
      assert.ok(v.length > 120, `${lang} ${id}: virou frase curta demais pra explicar o que não se achou`);
    }
    // A entrada do earthing é a única que PODE citar o mecanismo — e precisa,
    // porque ela existe pra negá-lo.
    const earthing = _DICTS_FOR_TESTS[lang][naoAchadoKey('earthing')];
    assert.match(earthing, /el[eé]tron|electron|electrón/i, `${lang}: o desmonte do earthing perdeu o mecanismo que nega`);
  }
});

test('o aviso de contraindicação nomeia as condições e manda procurar um profissional', () => {
  const CONDICOES = {
    pt: [/epilepsia/i, /cardiovascular/i, /grávida/i],
    es: [/epilepsia/i, /cardiovascular/i, /embarazada/i],
    en: [/epilepsy/i, /cardiovascular/i, /pregnant/i],
  };
  const CONSULTA = { pt: /médico|profissional de saúde/i, es: /médico|profesional de la salud/i, en: /doctor|medical provider/i };
  for (const lang of LANGUAGES) {
    const condicoes = _DICTS_FOR_TESTS[lang]['grounding.warning.conditions'];
    for (const re of CONDICOES[lang]) {
      assert.match(condicoes, re, `${lang}: o aviso deixou de nomear uma das condições`);
    }
    const consulta = _DICTS_FOR_TESTS[lang]['grounding.warning.consult'];
    assert.match(consulta, CONSULTA[lang], `${lang}: o aviso parou de mandar consultar um profissional`);
    // O aviso NÃO pode virar texto médico: nomear é permitido, explicar o que
    // acontece na condição não é.
    assert.doesNotMatch(condicoes, /porque|because|porqué/i, `${lang}: o aviso começou a explicar mecanismo`);
  }
});

test('a linha que dá permissão de parar existe nos três idiomas e não promete nada', () => {
  for (const lang of LANGUAGES) {
    const v = _DICTS_FOR_TESTS[lang]['grounding.warning.stopAnytime'];
    assert.ok(typeof v === 'string' && v.length > 60, `${lang}: a permissão de parar sumiu ou encolheu`);
    for (const re of PROMESSAS) {
      assert.doesNotMatch(v, re, `${lang}: a linha que protege virou promessa (${re})`);
    }
  }
});
