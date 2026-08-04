// Toda chave t('...') usada numa tela PRECISA existir no dicionário.
//
// Por que este teste existe: em 29/07/2026 o repo tinha 421 chaves em uso e 112
// definidas — 342 faltando, entre elas TODAS as de `onboarding.*` e `login.*`,
// que são as duas primeiras telas de quem chega pelo link. `translate()` devolve
// a PRÓPRIA CHAVE quando não acha, então o próximo deploy teria publicado uma
// tela inicial escrita literalmente "onboarding.headerTitle". Nada quebrava, nada
// dava erro — só ficava ilegível pro visitante.
//
// O teste de paridade (i18n.test.js) não pegava: ele compara pt/es/en ENTRE SI,
// então uma chave ausente nos três passa verde. Este aqui compara o que o código
// USA com o que o dicionário TEM — é o outro lado da mesma moeda, e os dois
// juntos fecham o buraco.
//
// Falha aqui = não pode publicar. É de propósito.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..');
const PASTAS = ['screens', 'components', 'lib', 'context'];

// Chaves montadas em tempo de execução (ex.: t(`plano.${id}.titulo`)) não dá pra
// verificar estaticamente. Elas são registradas aqui pelo PREFIXO, e o teste
// exige que exista pelo menos UMA chave real com aquele prefixo — assim uma
// família inteira que suma ainda é pega.
//
// A lista ficou VAZIA por engano até 31/07/2026, e o custo era duplo: o aviso de
// chave morta acusava ~30% do dicionário como lixo (quase tudo falso positivo,
// família viva montada em runtime), e com o número inflado ninguém conseguia ver
// o lixo de verdade no meio. Cada prefixo abaixo tem o recibo do lugar que monta
// a chave. Quem confere o CONTEÚDO destas famílias é o teste de família de cada
// uma (zodiacBody.test.js, grounding.test.js e o da Loja mais abaixo).
const PREFIXOS_DINAMICOS = [
  'diary.month.', // DiaryScreen.js — t(`diary.month.${n}`)
  'timeline.month.', // TimelineScreen.js — t(`timeline.month.${+m - 1}`)
  'planos.benefit.', // PlanosScreen.js — t(`planos.benefit.${n}`)
  'planos.plan.', // PlanosScreen.js — t(`planos.plan.${plan.id}.label`) etc.
  'planos.cta.', // PlanosScreen.js — t(`planos.cta.${selectedPlan}`)
  'loja.reward.', // LojaScreen.js — t(`loja.reward.${reward.id}.title`)
  'loja.brinde.', // LojaScreen.js — t(`loja.brinde.${brinde.id}.title`)
  'sound.assoc.', // CosmicSoundScreen.js — t(`sound.assoc.${preset.baseHz}`)
  'descobrir.att.', // DescobrirScreen.js — t(`descobrir.att.q${n}.opt.${k}`)
  'descobrir.lang.', // DescobrirScreen.js — t(`descobrir.lang.q${n}.opt.${k}`)
  'horoscope.reading.', // HoroscopeScreen.js — t(`horoscope.reading.${tab}.${n}`)
  'horoscope.sky.', // lib/dailyHoroscope.js — skyKey() monta o campo (linha 460)
  'grounding.', // lib/grounding.js — helpers de chave (cabeçalho, linha 70)
  'zodiacBody.', // lib/zodiacBody.js — prefixo declarado no cabeçalho (linha 35)
  // JornadaScreen.js — t(`arco.convite.${c.id}`) e t(`arco.categoria.${c.categoria}`),
  // montadas a partir de CONVITES/CATEGORIAS de lib/arco.js. Quem confere o
  // CONTEÚDO das duas famílias é test/arco.test.js: ele exige rótulo nos três
  // idiomas pra cada id do motor, recusa rótulo órfão sem convite correspondente,
  // e varre as duas atrás de promessa de efeito.
  'arco.convite.',
  'arco.categoria.',
  // AS TRÊS FAMÍLIAS DE CONTEÚDO — `jornada.`, `rituais.` e `calendarioCosmico.`
  // — NÃO entram aqui, e por dois motivos diferentes que vale distinguir:
  //
  //   · `calendarioCosmico.` porque a família ainda não nasceu: a migração é
  //     plano (lib/calendarioCosmico.js, cabeçalho), e registrar prefixo de
  //     família inexistente é abrir buraco antes da hora — o teste logo abaixo
  //     recusa exatamente isso.
  //   · `jornada.` e `rituais.` porque não PRECISAM: as parcelas de migração
  //     que já saíram (jornada.feature.*, rituais.cat/dia/planeta/fase.*)
  //     escrevem a chave LITERAL no arquivo, nunca montada por template. Então
  //     a varredura estática as enxerga uma a uma, que é melhor do que isentar
  //     a família inteira — registrar o prefixo aqui esconderia junto todas as
  //     chaves de chrome dessas telas, que hoje são conferidas de verdade.
  //
  // O que NENHUM destes testes cobre é o CONTEÚDO ainda em português dentro dos
  // três motores — pra isso existe o teste de inventário no fim deste arquivo.
];

function arquivosJs(pasta) {
  const dir = path.join(RAIZ, pasta);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'))
    .map((f) => path.join(dir, f));
}

// Chaves definidas: pega tudo que é `'chave.com.ponto':` ou `"chave.com.ponto":`
// no i18n.js. O formato do arquivo é um objeto por idioma com chaves planas.
function chavesDefinidas() {
  const src = fs.readFileSync(path.join(RAIZ, 'lib', 'i18n.js'), 'utf8');
  const achadas = new Set();
  // O hífen ENTRA na classe: as chaves de recompensa e de brinde da Loja são
  // hifenizadas (loja.reward.selo-cosmico.title, loja.brinde.brinde-ritual-lua
  // .title). Sem o hífen, as duas famílias ficavam invisíveis nos DOIS lados do
  // teste — nem definidas nem usadas — e apagar uma delas passava verde.
  const re = /['"]([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)['"]\s*:/g;
  let m;
  while ((m = re.exec(src))) achadas.add(m[1]);
  return achadas;
}

// Chaves usadas. Três formas, porque o código usa as três — e a primeira versão
// deste teste só pegava a primeira, deixando 11 chaves passarem invisíveis
// (a Home mostraria "home.week.mon" embaixo da sequência COM O TESTE VERDE):
//
//   1. direta        t('home.title')
//   2. por ternário  t(n === 1 ? 'home.streak.count_one' : 'home.streak.count_other')
//   3. em lista      const WEEK_KEYS = ['home.week.mon', ...]; ... .map(k => t(k))
//
// Para (2) e (3) não dá pra amarrar a chave ao t() de forma confiável, então o
// critério é: QUALQUER literal com cara de chave de tradução (dois ou mais
// segmentos separados por ponto, sem espaço) que apareça num arquivo de tela.
// Isso pode gerar falso positivo em string que só parece chave — se acontecer,
// o nome entra em IGNORAR abaixo, com o motivo escrito.
const IGNORAR = new Set([
  // Nada aqui ainda. Adicione com comentário explicando por que NÃO é chave.
]);

function pareceChave(s) {
  if (IGNORAR.has(s)) return false;
  // dois+ segmentos, só letra/número/underscore, sem espaço, e não é caminho de
  // arquivo nem domínio nem versão
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_-]+)+$/.test(s)) return false;
  if (/\.(js|json|png|jpg|svg|ttf|com|br|cloud|bet|org|net|io)$/i.test(s)) return false;
  if (/^\d+(\.\d+)+$/.test(s)) return false;
  // LOCUS DE CITAÇÃO, não chave: `I.8` (Tetrabiblos), `XVIII.321` (Naturalis
  // Historia), `XI.2.85` (De Re Rustica), `IV.7`. O primeiro segmento é um
  // numeral romano em MAIÚSCULAS, e nenhuma chave do dicionário começa assim —
  // todas são camelCase minúsculas (conferido: zero chaves em lib/i18n.js
  // batem com /^[IVXLCDM]+\./). Regra genérica em vez de lista em IGNORAR
  // porque capítulo-e-verso é agora um dado estrutural do app: a tese
  // (docs/tradicao/00-tese.md) exige obra + autor + século em toda afirmação
  // histórica, então todo módulo de conteúdo novo guarda loci e cairia aqui.
  if (/^[IVXLCDM]+\./.test(s)) return false;
  return true;
}

function chavesUsadas() {
  const usos = new Map(); // chave -> arquivo onde apareceu primeiro
  for (const pasta of PASTAS) {
    for (const arq of arquivosJs(pasta)) {
      // i18n.js é o dicionário, não consumidor — senão toda chave definida
      // apareceria também como "usada" e o teste viraria tautologia.
      if (arq.endsWith(path.join('lib', 'i18n.js'))) continue;
      const src = fs.readFileSync(arq, 'utf8');
      const rel = path.relative(RAIZ, arq);

      // (1) forma direta — sempre conta
      const direta = /\bt\(\s*['"]([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)['"]/g;
      let m;
      while ((m = direta.exec(src))) if (!usos.has(m[1])) usos.set(m[1], rel);

      // (2) e (3) — qualquer literal com cara de chave no arquivo
      const solta = /['"]([a-zA-Z][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_-]+)+)['"]/g;
      while ((m = solta.exec(src))) {
        if (pareceChave(m[1]) && !usos.has(m[1])) usos.set(m[1], rel);
      }
    }
  }
  return usos;
}

// A ISENÇÃO DE LOCUS, TRAVADA — mesmo espírito de "a única isenção da varredura
// é o próprio aviso ético, e ela é necessária" (test/rituais.test.js).
//
// `pareceChave` dispensa da varredura tudo que começa com numeral romano
// maiúsculo seguido de ponto (`I.8`, `XVIII.321`, `XI.2.85`, `IV.7`) porque isso
// é capítulo-e-verso de citação, não chave de tradução. A premissa — "nenhuma
// chave do dicionário começa assim" — vivia só num comentário, e comentário não
// falha o build: bastava uma chave futura entrar debaixo da isenção para deixar
// de ser verificada em silêncio. Aqui a premissa vira asserção.
test('nenhuma chave do dicionário se esconde atrás da isenção de locus de citação', () => {
  const escondidas = [...chavesDefinidas()].filter((k) => /^[IVXLCDM]+\./.test(k));
  assert.deepEqual(
    escondidas,
    [],
    'Estas chaves casam com a isenção de locus (/^[IVXLCDM]+\\./) e por isso NÃO seriam ' +
      'verificadas pela varredura estática. Renomeie-as para camelCase minúscula, ou ' +
      'estreite a isenção em pareceChave():\n  ' +
      escondidas.join('\n  ')
  );
});

// Prefixo dinâmico dispensa a família da varredura estática — então ele não pode
// virar um buraco onde uma família inteira some sem ninguém ver. Cumpre o que o
// comentário de PREFIXOS_DINAMICOS promete desde sempre.
test('todo prefixo dinâmico registrado ainda tem chave de verdade no dicionário', () => {
  const definidas = [...chavesDefinidas()];
  const vazios = PREFIXOS_DINAMICOS.filter((p) => !definidas.some((k) => k.startsWith(p)));
  assert.deepEqual(
    vazios,
    [],
    `prefixo(s) registrado(s) como dinâmicos e sem NENHUMA chave no dicionário — ` +
      `ou a família sumiu, ou o prefixo está obsoleto: ${vazios.join(', ')}`
  );
});

test('toda chave t() usada nas telas existe no dicionário', () => {
  const definidas = chavesDefinidas();
  const usadas = chavesUsadas();

  const faltando = [];
  for (const [chave, arquivo] of usadas) {
    if (definidas.has(chave)) continue;
    if (PREFIXOS_DINAMICOS.some((p) => chave.startsWith(p))) continue;
    faltando.push(`${chave}  (${arquivo})`);
  }

  assert.equal(
    faltando.length,
    0,
    `${faltando.length} chave(s) usadas no código e AUSENTES no dicionário — ` +
      `essas telas mostrariam o nome da chave pro usuário:\n  ` +
      faltando.slice(0, 40).join('\n  ') +
      (faltando.length > 40 ? `\n  ... e mais ${faltando.length - 40}` : '')
  );
});

// ---------------------------------------------------------------------------
// Famílias montadas em runtime na Loja
// ---------------------------------------------------------------------------
// A varredura estática acima nunca vê t(`loja.reward.${reward.id}.title`) — ela
// só enxerga literais. Então as duas famílias da Loja ganham um teste próprio,
// no molde do "toda chave montada em runtime existe nos três idiomas" de
// test/zodiacBody.test.js e test/grounding.test.js: a lista de ids sai da FONTE
// (o array de REWARDS na tela, o de BRINDES no catálogo) e cada id tem que ter
// .title e .description nos três idiomas. Sem isso, um reward novo sem entrada
// no dicionário passava verde e a Loja imprimia a chave crua na tela.
//
// Os ids são lidos do texto do arquivo, não importados: screens/LojaScreen.js
// puxa react-native e @expo/vector-icons, que não carregam sob node:test.
function idsDeArray(arquivo, nomeDoArray) {
  const src = fs.readFileSync(path.join(RAIZ, arquivo), 'utf8');
  const bloco = new RegExp(`(?:const|export const)\\s+${nomeDoArray}\\s*=\\s*\\[([\\s\\S]*?)\\n\\];`).exec(src);
  assert.ok(bloco, `não achei o array ${nomeDoArray} em ${arquivo}`);
  return [...bloco[1].matchAll(/\bid:\s*'([^']+)'/g)].map((m) => m[1]);
}

test('toda recompensa e todo brinde da Loja tem título e descrição nos três idiomas', () => {
  const { LANGUAGES, _DICTS_FOR_TESTS } = require('../lib/i18n.js');
  const familias = [
    ['loja.reward', idsDeArray(path.join('screens', 'LojaScreen.js'), 'REWARDS')],
    ['loja.brinde', idsDeArray(path.join('lib', 'brindes.js'), 'BRINDES')],
  ];

  const faltando = [];
  for (const [prefixo, ids] of familias) {
    assert.ok(ids.length > 0, `nenhum id lido para ${prefixo}.* — o parser quebrou`);
    for (const id of ids) {
      for (const campo of ['title', 'description']) {
        const chave = `${prefixo}.${id}.${campo}`;
        for (const lang of LANGUAGES) {
          const v = _DICTS_FOR_TESTS[lang][chave];
          if (typeof v !== 'string' || v.trim() === '') faltando.push(`${lang}: ${chave}`);
        }
      }
    }
  }

  assert.equal(
    faltando.length,
    0,
    `${faltando.length} chave(s) da Loja montada(s) em runtime sem tradução — ` +
      `a tela mostraria o nome da chave:\n  ` + faltando.join('\n  ')
  );
});

test('o dicionário não acumula chave morta (definida e nunca usada)', () => {
  const definidas = chavesDefinidas();
  const usadas = new Set(chavesUsadas().keys());

  // Chave dinâmica é usada por prefixo, então não conta como morta.
  const mortas = [...definidas].filter(
    (k) => !usadas.has(k) && !PREFIXOS_DINAMICOS.some((p) => k.startsWith(p))
  );

  // Aviso, não falha: chave morta não quebra ninguém, mas acumular lixo faz a
  // tradução de idioma novo custar mais caro do que precisa.
  if (mortas.length > 0) {
    console.log(
      `\n  [aviso] ${mortas.length} chave(s) no dicionário sem uso no código: ` +
        mortas.slice(0, 10).join(', ') +
        (mortas.length > 10 ? ` ... e mais ${mortas.length - 10}` : '')
    );
  }
  assert.ok(true);
});

// ---------------------------------------------------------------------------
// INVENTÁRIO DA DÍVIDA DE i18n — o número que só pode CAIR
// ---------------------------------------------------------------------------
// Os testes acima comparam CHAVE USADA contra CHAVE DEFINIDA. Nenhum deles vê o
// texto que nunca passou por t(): o conteúdo dos três motores novos
// (lib/rituais.js, lib/jornada.js, lib/calendarioCosmico.js) está em português
// nos três idiomas, declarado nos cabeçalhos como migração pendente. São
// centenas de strings VISÍVEIS fora de qualquer teste de i18n — e uma dívida
// que ninguém mede é uma dívida que cresce.
//
// Este teste mede. Ele não exige que a migração aconteça hoje; exige que ela
// não ANDE PRA TRÁS: se alguém acrescentar um ritual, uma trilha ou um evento
// com texto cravado em português, o número sobe e o build falha. Quando a
// migração de um campo sair, o número cai e a linha abaixo é atualizada pra
// baixo. Zero significa que acabou.
//
// A contagem é deterministicamente definida abaixo. O calendário é medido por
// UM MÊS FIXO (jan/2026) em vez do ano inteiro: o motor é determinístico, o mês
// é representativo e a conta é barata.
const TETO_PT_ONLY = {
  // 21 rituais × (titulo, intencao, materiais[], passos[], momento.texto,
  // cuidados, naoTemFonte[]) + os 3 blocos de lastro.
  // JÁ MIGRADO e por isso fora da conta: nome/descrição das 7 categorias,
  // nome/planeta dos 7 dias, os 8 nomes de fase, a moldura do compartilhar.
  rituais: 297,
  // 4 trilhas × (nome, subtitulo) + 28 dias × (titulo, leitura, pergunta,
  // acao.texto) + nome/legenda das medalhas.
  // JÁ MIGRADO e fora da conta: os 6 rótulos de FEATURES.
  jornada: 132,
  // Eventos de jan/2026 × (titulo, paragrafo, fonte, avisoDeIdade,
  // tradicao.texto).
  // JÁ MIGRADO e fora da conta: MARCA_RECIBO (virou rótulo de UI traduzido) e
  // as duas mensagens de indisponibilidade (viraram `mensagemKey`).
  calendarioCosmico: 53,
};

function contarStrings(...valores) {
  let n = 0;
  const anda = (v) => {
    if (typeof v === 'string') {
      if (v.trim()) n += 1;
    } else if (Array.isArray(v)) {
      v.forEach(anda);
    }
  };
  valores.forEach(anda);
  return n;
}

function inventarioPtOnly() {
  const rituais = require('../lib/rituais.js');
  const jornada = require('../lib/jornada.js');
  const calendario = require('../lib/calendarioCosmico.js');

  let nRituais = 0;
  for (const r of rituais.RITUAIS) {
    nRituais += contarStrings(
      r.titulo, r.intencao, r.cuidados, r.momento && r.momento.texto,
      r.materiais, r.passos, r.naoTemFonte
    );
  }
  for (const bloco of Object.values(rituais.LASTRO_MOMENTO_IDEAL)) {
    nRituais += contarStrings(bloco.titulo, bloco.texto, bloco.ressalvas);
  }

  let nJornada = 0;
  for (const t of jornada.TRILHAS) {
    nJornada += contarStrings(t.nome, t.subtitulo);
    for (const d of t.dias) {
      nJornada += contarStrings(d.titulo, d.leitura, d.pergunta, d.acao && d.acao.texto);
    }
  }
  for (const m of [...jornada.MEDALHAS, ...jornada.MEDALHAS_JORNADA]) {
    nJornada += contarStrings(m.nome, m.legenda);
  }

  const mes = calendario.calendarioCosmico(2026, 1);
  let nCalendario = 0;
  for (const e of mes.eventos) {
    nCalendario += contarStrings(
      e.titulo, e.paragrafo, e.fonte, e.avisoDeIdade, e.tradicao && e.tradicao.texto
    );
  }

  return { rituais: nRituais, jornada: nJornada, calendarioCosmico: nCalendario, mes };
}

test('a dívida de i18n dos três motores não cresce (o número só pode cair)', () => {
  const atual = inventarioPtOnly();

  // Se o mês de referência vier vazio, a conta do calendário mediria zero por
  // acidente e o teste "passaria" enquanto a dívida ficasse intacta.
  assert.ok(
    atual.mes.ceuDisponivel && atual.mes.eventos.length > 0,
    'jan/2026 não trouxe evento nenhum — sem efeméride a contagem do calendário é falsa'
  );

  const subiram = [];
  const cairam = [];
  for (const [modulo, teto] of Object.entries(TETO_PT_ONLY)) {
    if (atual[modulo] > teto) subiram.push(`${modulo}: ${atual[modulo]} (teto ${teto})`);
    if (atual[modulo] < teto) cairam.push(`${modulo}: ${atual[modulo]} (teto ${teto})`);
  }

  assert.deepEqual(
    subiram,
    [],
    'Texto novo cravado em português num motor que já tem migração de i18n pendente. ' +
      'Ou escreva por chave, ou reconheça a dívida atualizando TETO_PT_ONLY pra cima ' +
      'com o motivo escrito:\n  ' + subiram.join('\n  ')
  );

  assert.deepEqual(
    cairam,
    [],
    'A dívida CAIU — é a notícia boa. Baixe TETO_PT_ONLY pros números novos pra travar o ' +
      'ganho, senão ele pode ser desfeito sem ninguém ver:\n  ' + cairam.join('\n  ')
  );
});
