/* test/madremaria-missoes-tres-idiomas.test.js
 *
 * AS 419 MISSOES EM PT / ES / EN — paridade, fiacao e a protecao que nao pode
 * se perder na traducao.
 *
 * POR QUE ESTE ARQUIVO EXISTE, e nao e duplicata de nenhum portao:
 *   · test/madremaria-promessa-tres-idiomas.test.js varre o CONTEUDO dos tres
 *     idiomas contra promessa de desfecho. Ele nao sabe se a traducao CHEGA na
 *     tela, nem se alguma chave ficou faltando.
 *   · test/madremaria-i18n.test.js e o placar das 775 chaves de TELA
 *     (datos/textos*.js). Missao nao passa por t() — ela vem de datos/
 *     missoes365*.js, entao ele nao a ve.
 *   · test/madremaria-escada-do-degelo.test.js cruza titulo x degrau no PT.
 *
 * O que SO este arquivo guarda:
 *   1. PARIDADE: toda missao do PT tem chave 'capitulo:indice' em ES e EN, com
 *      os tres campos cheios. Chave a mais (orfa) tambem e erro: ela nasce de
 *      alguem inserir missao no meio do array PT e deslocar os indices — e esse
 *      desencontro falharia EM SILENCIO, entregando a traducao da missao errada.
 *   2. A FIACAO: missaoDoDia() devolve o texto NO IDIOMA ATIVO. Sem isto, as
 *      419x2 traducoes ficam no disco e a tela segue em portugues — foi
 *      exatamente o estado em que este arquivo as encontrou.
 *   3. A REDE DE CONTATO SOBREVIVE: `precisaContato` e o campo que impede a
 *      missao de contato de chegar a quem esta em bloqueio. A traducao nao o
 *      declara, e missaoTraduzida() tem de devolve-lo INTACTO. Um spread na
 *      ordem errada apagaria a protecao em ES e EN e deixaria o PT verde.
 *   4. A ESCADA LE O PT: DEGRAU_POR_MISSAO e indexado pelo titulo PORTUGUES
 *      (lib/missaoDoDia.js). Se a traducao entrasse antes do filtro, o degrau
 *      viraria 0 e o convite de coragem sairia no primeiro dia.
 */
const test = require('node:test');
const assert = require('node:assert');

const {
  CAPITULO_POR_LUA,
  MISSOES_POR_CAPITULO,
  MISSOES_FDS,
  missaoTraduzida,
} = require('../madremaria/datos/missoes365.js');
const { missaoDoDia } = require('../madremaria/lib/missaoDoDia.js');
const { MISSOES_ES } = require('../madremaria/datos/missoes365.es.js');
const { MISSOES_EN } = require('../madremaria/datos/missoes365.en.js');
const { setIdiomaMadre, IDIOMA_PADRAO } = require('../madremaria/datos/textos.js');

const DICTS = { es: MISSOES_ES, en: MISSOES_EN };
const POOLS = { ...MISSOES_POR_CAPITULO, fds: MISSOES_FDS };
const CAMPOS = ['titulo', 'acao', 'porque'];

/* Sempre volta ao PT: o idioma e um espelho de MODULO, e um teste que o deixa
 * em 'en' contamina todo teste que rodar depois no mesmo processo. */
test.afterEach(() => setIdiomaMadre(IDIOMA_PADRAO));

/* ===================================================================
 * 1 · PARIDADE
 * =================================================================== */

test('toda missao do PT tem traducao em ES e EN, com os tres campos cheios', () => {
  const faltam = [];
  const vazios = [];
  let total = 0;

  for (const [capitulo, pool] of Object.entries(POOLS)) {
    pool.forEach((_, i) => {
      total += 1;
      for (const lang of ['es', 'en']) {
        const t = DICTS[lang][`${capitulo}:${i}`];
        if (!t) { faltam.push(`[${lang}] ${capitulo}:${i}`); continue; }
        for (const campo of CAMPOS) {
          if (!t[campo] || !String(t[campo]).trim()) {
            vazios.push(`[${lang}] ${capitulo}:${i}.${campo}`);
          }
        }
      }
    });
  }

  assert.equal(total, 419, `o PT tinha 419 missoes, contei ${total}`);
  assert.equal(
    faltam.length, 0,
    `${faltam.length} missao(oes) sem traducao:\n  ${faltam.slice(0, 20).join('\n  ')}`
  );
  /* Campo em branco NAO e o mesmo que chave ausente: ausente cai no portugues
   * (verdadeiro), ' ' renderiza uma tela vazia. */
  assert.equal(
    vazios.length, 0,
    `${vazios.length} campo(s) em branco (renderiza vazio na tela, nao cai no PT):\n  ${vazios.slice(0, 20).join('\n  ')}`
  );
});

test('nenhuma chave orfa: indice traduzido que nao existe mais no PT', () => {
  const validas = new Set();
  for (const [capitulo, pool] of Object.entries(POOLS)) {
    pool.forEach((_, i) => validas.add(`${capitulo}:${i}`));
  }
  for (const lang of ['es', 'en']) {
    const orfas = Object.keys(DICTS[lang]).filter((k) => !validas.has(k));
    assert.deepEqual(
      orfas, [],
      `[${lang}] chave(s) que o PT nao tem — alguem mexeu na ORDEM de um pool e `
      + `deslocou os indices; a traducao da missao errada estaria sendo entregue: ${orfas.join(', ')}`
    );
  }
});

/* ===================================================================
 * 2 · A FIACAO — a traducao chega na tela
 * =================================================================== */

test('missaoDoDia devolve o texto no idioma ativo, e volta ao PT quando o idioma volta', () => {
  /* 2026-09-14 e uma segunda-feira (nao cai no pool de fim de semana), e a
   * lunacao 1 fixa o capitulo em vocePrimeiro. */
  const dia = '2026-09-14';
  const pt = missaoDoDia(dia, 1, {});
  assert.ok(pt && pt.titulo, 'o PT nao devolveu missao');

  const pool = MISSOES_POR_CAPITULO.vocePrimeiro;
  const i = pool.findIndex((m) => m.titulo === pt.titulo && m.acao === pt.acao);
  assert.ok(i >= 0, 'a missao devolvida nao esta no pool de vocePrimeiro');

  for (const lang of ['es', 'en']) {
    setIdiomaMadre(lang);
    const m = missaoDoDia(dia, 1, {});
    const esperado = DICTS[lang][`vocePrimeiro:${i}`];
    assert.equal(m.titulo, esperado.titulo, `[${lang}] titulo nao traduzido na saida de missaoDoDia`);
    assert.equal(m.acao, esperado.acao, `[${lang}] acao nao traduzida`);
    assert.equal(m.porque, esperado.porque, `[${lang}] porque nao traduzido`);
    assert.notEqual(m.titulo, pt.titulo, `[${lang}] devolveu o portugues`);
  }

  setIdiomaMadre(IDIOMA_PADRAO);
  assert.equal(missaoDoDia(dia, 1, {}).titulo, pt.titulo, 'nao voltou ao portugues');
});

test('o fim de semana tambem traduz (pool fds, capitulo que nao vem de lunacao)', () => {
  const sabado = '2026-09-12';
  const pt = missaoDoDia(sabado, 1, {});
  const i = MISSOES_FDS.findIndex((m) => m.titulo === pt.titulo && m.acao === pt.acao);
  assert.ok(i >= 0, 'sabado nao caiu no pool de fim de semana');
  setIdiomaMadre('es');
  assert.equal(missaoDoDia(sabado, 1, {}).titulo, MISSOES_ES[`fds:${i}`].titulo);
});

/* ===================================================================
 * 3 · A REDE DE CONTATO SOBREVIVE A TRADUCAO
 * =================================================================== */

test('precisaContato volta INTACTO da traducao, nos dois idiomas', () => {
  let contato = 0;
  for (const [capitulo, pool] of Object.entries(POOLS)) {
    pool.forEach((m, i) => {
      if (m.precisaContato) contato += 1;
      for (const lang of ['es', 'en']) {
        setIdiomaMadre(lang);
        const t = missaoTraduzida(m, capitulo, i);
        assert.equal(
          t.precisaContato, m.precisaContato,
          `[${lang}] ${capitulo}:${i} perdeu precisaContato na traducao — a missao de `
          + 'contato passaria a sair para quem esta em bloqueio'
        );
      }
    });
  }
  assert.ok(contato > 50, `so ${contato} missoes de contato no PT — o filtro nao teria o que proteger`);
});

test('quem esta em contato duro NAO recebe missao de contato em ES nem EN', () => {
  const bloqueio = { hoy: 'bloqueo' };
  /* A lunacao 5/6 e o capitulo 'voz', que TEM missoes de contato — um capitulo
   * sem nenhuma deixaria este teste verde por vacuidade. */
  const comContato = MISSOES_POR_CAPITULO.voz.filter((m) => m.precisaContato).length;
  assert.ok(comContato > 0, 'o capitulo voz deveria ter missao de contato');

  for (const lang of ['pt', 'es', 'en']) {
    setIdiomaMadre(lang);
    for (let d = 1; d <= 28; d += 1) {
      const dia = `2026-09-${String(d).padStart(2, '0')}`;
      const m = missaoDoDia(dia, 5, bloqueio);
      if (!m) continue;
      assert.equal(
        m.precisaContato, false,
        `[${lang}] ${dia}: missao de contato entregue a quem esta em bloqueio`
      );
    }
  }
});

/* ===================================================================
 * 4 · A ESCADA CONTINUA LENDO O PORTUGUES
 * =================================================================== */

test('o degrau e respeitado em ES e EN (o filtro le o titulo PT, nao o traduzido)', () => {
  const { DEGRAU_POR_MISSAO } = require('../madremaria/datos/escada.js');
  /* Degrau 1 = so os gestos mais leves podem sair. Se a traducao entrasse ANTES
   * do filtro, DEGRAU_POR_MISSAO[titulo traduzido] seria undefined -> 0, e
   * TODA missao de contato passaria. */
  /* Sabado e domingo trocam o pool por MISSOES_FDS (lib/missaoDoDia.js), que a
   * escada nao ordena — um dia de fim de semana aqui compararia a missao
   * entregue contra o dicionario de 'voz' e falharia por motivo errado. */
  const ehFds = (dia) => {
    const [a, mes, d] = dia.split('-').map(Number);
    const s = new Date(Date.UTC(a, mes - 1, d)).getUTCDay();
    return s === 0 || s === 6;
  };

  for (const lang of ['es', 'en']) {
    setIdiomaMadre(lang);
    for (let d = 1; d <= 28; d += 1) {
      const dia = `2026-09-${String(d).padStart(2, '0')}`;
      if (ehFds(dia)) continue;
      const m = missaoDoDia(dia, 5, {}, 1);
      if (!m || !m.precisaContato) continue;
      /* Nenhuma missao entregue com teto 1 pode ter degrau > 1 no PT. A missao
       * PT se recupera pelo INDICE: o texto devolvido esta traduzido, entao o
       * casamento e contra o dicionario do idioma ativo. */
      const idx = MISSOES_POR_CAPITULO.voz.findIndex(
        (x, i) => DICTS[lang][`voz:${i}`] && DICTS[lang][`voz:${i}`].acao === m.acao
      );
      assert.ok(idx >= 0, `[${lang}] ${dia}: missao entregue nao casa com nenhuma traducao de voz`);
      const grau = DEGRAU_POR_MISSAO[MISSOES_POR_CAPITULO.voz[idx].titulo] || 0;
      assert.ok(
        grau <= 1,
        `[${lang}] ${dia}: missao de degrau ${grau} saiu com teto 1 — a escada parou de `
        + 'ler o titulo portugues'
      );
    }
  }
});

/* ===================================================================
 * 5 · FALLBACK HONESTO
 * =================================================================== */

test('chave sem traducao cai no PORTUGUES, nunca em vazio nem em texto inventado', () => {
  const m = MISSOES_POR_CAPITULO.vocePrimeiro[0];
  setIdiomaMadre('es');
  /* capitulo inexistente: nenhuma chave 'naoExiste:0' em nenhum dicionario */
  const semTraducao = missaoTraduzida(m, 'naoExiste', 0);
  assert.equal(semTraducao.titulo, m.titulo);
  assert.equal(semTraducao.acao, m.acao);
  assert.equal(semTraducao.porque, m.porque);
  assert.equal(semTraducao.precisaContato, m.precisaContato);
  assert.equal(missaoTraduzida(null, 'vocePrimeiro', 0), null, 'missao nula tem de voltar nula');
});

test('CAPITULO_POR_LUA aponta so para pools que existem e estao traduzidos', () => {
  for (const lua of Object.keys(CAPITULO_POR_LUA)) {
    const cap = CAPITULO_POR_LUA[lua];
    assert.ok(MISSOES_POR_CAPITULO[cap], `lua ${lua} aponta para o capitulo inexistente ${cap}`);
    for (const lang of ['es', 'en']) {
      assert.ok(
        DICTS[lang][`${cap}:0`],
        `[${lang}] o capitulo ${cap} (lua ${lua}) nao tem nenhuma traducao`
      );
    }
  }
});
