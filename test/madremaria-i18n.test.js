// test/madremaria-i18n.test.js
// O PORTAO DE COBERTURA DOS TRES IDIOMAS DA MADRE MARIA.
//
// ===========================================================================
// ESTE TESTE NASCE VERMELHO, E ISSO E O PONTO
// ===========================================================================
// A estrutura dos tres idiomas esta pronta (madremaria/datos/textos.js com o PT,
// textos.es.js e textos.en.js vazios). A TRADUCAO nao: ela entra depois, em
// lotes, por dois tradutores em arquivos disjuntos.
//
// Enquanto faltar uma chave, este arquivo falha e diz QUANTAS faltam em cada
// idioma. Ele e o PLACAR da obra, nao um defeito a silenciar: no dia em que os
// dois dicionarios estiverem completos ele fica verde sozinho, sem ninguem
// editar uma linha daqui.
//
// NAO marque estes testes com skip para "destravar o deploy". O app nao quebra
// com eles vermelhos — chave sem traducao cai no portugues (t() em textos.js) —,
// entao a unica coisa que o skip compra e perder a conta de quanto falta.
//
// ===========================================================================
// POR QUE UM ARQUIVO SEPARADO DO test/i18n.test.js
// ===========================================================================
// test/i18n.test.js guarda o dicionario do COSMIC (lib/i18n.js), que esta
// COMPLETO nos tres idiomas e tem de continuar assim — ele e verde e um vermelho
// la significa regressao. Este guarda o da MADRE, que esta incompleto de
// proposito. Juntar os dois misturaria "regressao" com "obra em andamento" no
// mesmo resultado, e a primeira ficaria invisivel atras da segunda.
//
// As asserções sao as MESMAS de test/i18n.test.js (mesma paridade de chave, de
// tipo, de vazio e de marcador), porque o defeito que elas pegam e o mesmo.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  IDIOMAS,
  IDIOMA_PADRAO,
  _DICTS_PARA_TESTE,
  t,
  lista,
  existe,
  setIdiomaMadre,
  idiomaMadre,
} from '../madremaria/datos/textos.js';

/* Toda suite que mexe no idioma ativo DEVOLVE o idioma ao padrao no fim: o
 * espelho e variavel de modulo, compartilhada com qualquer outro teste que
 * importe textos.js no mesmo processo. Deixar 'en' ligado aqui faria a suite de
 * copy vizinha comparar texto contra dicionario vazio. */
test.afterEach(() => setIdiomaMadre(IDIOMA_PADRAO));

// ===========================================================================
// 1 · A FORMA
// ===========================================================================

test('a Madre fala os MESMOS tres idiomas do Cosmic, e o padrao e o portugues', () => {
  assert.deepEqual([...IDIOMAS].sort(), ['en', 'es', 'pt']);
  assert.equal(IDIOMA_PADRAO, 'pt');
});

test('os tres dicionarios existem como objeto, e o PT nao esta vazio', () => {
  for (const lang of IDIOMAS) {
    const dict = _DICTS_PARA_TESTE[lang];
    assert.equal(typeof dict, 'object', `o dicionario de "${lang}" nao e um objeto`);
    assert.ok(dict, `o dicionario de "${lang}" e nulo`);
  }
  assert.ok(
    Object.keys(_DICTS_PARA_TESTE.pt).length > 700,
    'o PT encolheu: ele e a fonte de verdade das chaves e tinha 775'
  );
});

// ===========================================================================
// 2 · O PLACAR — o teste que fica vermelho ate os tradutores terminarem
// ===========================================================================

/** As chaves do PT que faltam no idioma dado. Falta = ausente, null, ou presente
 *  com valor que a tela nao consegue mostrar (vazio / so espaco). As tres contam
 *  como pendencia porque as tres produzem o MESMO efeito para quem le: texto
 *  errado na tela, sem nenhum erro. */
function faltantes(lang) {
  const dict = _DICTS_PARA_TESTE[lang];
  const faltam = [];
  for (const [clave, ptValor] of Object.entries(_DICTS_PARA_TESTE.pt)) {
    const valor = dict[clave];
    if (valor === undefined || valor === null) {
      faltam.push(clave);
      continue;
    }
    if (Array.isArray(ptValor)) {
      // Lista vazia, ou com uma linha em branco, e tao inutil quanto ausente.
      if (!Array.isArray(valor) || valor.length === 0) faltam.push(clave);
      else if (valor.some((l) => typeof l !== 'string' || l.trim() === '')) faltam.push(clave);
      continue;
    }
    if (typeof valor !== 'string' || valor.trim() === '') faltam.push(clave);
  }
  return faltam;
}

/* ===========================================================================
 * AS DUAS LISTAS QUE O PLACAR CONSULTA, E POR QUE ELE NAO FUNCIONA SEM ELAS
 * ===========================================================================
 * O placar ANTERIOR contava as faltantes e nomeava as DEZ PRIMEIRAS. Com 250
 * faltando, essas dez eram sempre as mesmas — e por isso ele era CEGO A
 * REGRESSAO. Medido: apagar a traducao de 'plano.veu.raspe' no ES, uma chave JA
 * ENTREGUE, deixava o teste vermelho com a MESMA mensagem e as MESMAS dez
 * chaves. A unica pista era o total virar 251, e quem le um placar que sempre
 * esteve vermelho le isso como "e o de sempre, segue".
 *
 *   · ENTREGUES (test/madremaria-i18n-base.js) — a linha de base. Chave que esta
 *     la e nao esta mais traduzida e REGRESSAO, e sai em bloco separado, com
 *     nome. O arquivo explica por que uma LISTA, e nao um numero nem um
 *     agrupamento por prefixo, e o unico desenho que distingue "nunca chegou"
 *     de "estava aqui e saiu".
 *
 *   · TODAS_ORFAS (test/madremaria-i18n-orfas.js) — as 143 chaves do PT que
 *     nenhuma tela viva chama (a copy das telas que nao vieram na fusao com o
 *     Cosmic Guide). Elas saem da CONTA: um placar que cobra 250 quando so 107
 *     sao de verdade ensina que o numero nao vale nada, e era atras desse
 *     numero inflado que a regressao se escondia.
 * =========================================================================== */
const { ENTREGUES } = require('./madremaria-i18n-base.js');
const { TODAS_ORFAS, GRUPO_DA_ORFA, ORFAS } = require('./madremaria-i18n-orfas.js');

const SET_ORFAS = new Set(TODAS_ORFAS);

/** Agrupa chaves por prefixo, para a mensagem nomear por FAMILIA em vez de
 *  despejar as dez primeiras em ordem de insercao. */
function porPrefixo(claves) {
  const g = new Map();
  for (const c of claves) {
    const p = c.split('.')[0];
    if (!g.has(p)) g.set(p, []);
    g.get(p).push(c);
  }
  return [...g.entries()].sort((a, b) => b[1].length - a[1].length);
}

test('REGRESSAO: nenhuma chave JA ENTREGUE desapareceu de ES ou EN', () => {
  /* O teste que o placar nao conseguia ser. Ele nao conta nada: ele compara o
   * disco de hoje com o que ja foi entregue, e a unica coisa que o deixa
   * vermelho e uma traducao que EXISTIA e nao existe mais — sobrescrita por um
   * splice de outra onda, apagada por acidente, ou esvaziada para ''.
   *
   * Fica SEPARADO do placar de proposito. Juntos, a perda de uma chave seria uma
   * linha a mais num relatorio que ja tinha 107 pendencias — o mesmo lugar onde
   * ela se escondeu antes. Sozinho, este teste e verde hoje e so fica vermelho
   * por regressao: quando ele falha, nao ha duvida sobre o que aconteceu. */
  const perdidas = [];
  for (const lang of IDIOMAS) {
    if (lang === IDIOMA_PADRAO) continue;
    const faltam = new Set(faltantes(lang));
    for (const clave of ENTREGUES[lang]) {
      if (faltam.has(clave)) perdidas.push(`${lang.toUpperCase()} · ${clave}`);
    }
  }

  assert.deepEqual(
    perdidas,
    [],
    'TRADUCAO PERDIDA — estas chaves JA ESTAVAM traduzidas e nao estao mais:\n' +
      `  ${perdidas.join('\n  ')}\n\n` +
      'Isto NAO e obra em andamento, e REGRESSAO: alguem sobrescreveu o arquivo em\n' +
      'vez de fazer splice, ou apagou a linha. A traducao esta no git — recupere-a\n' +
      '(git log -p madremaria/datos/textos.es.js) em vez de traduzir de novo, que\n' +
      'produziria texto diferente do que o revisor ja aprovou.\n' +
      'NAO conserte tirando a chave de test/madremaria-i18n-base.js: aquela lista e\n' +
      'a unica prova de que ela existiu.'
  );
});

test('a lista de chaves ORFAS nao envelheceu: nenhuma delas voltou a ser chamada', () => {
  /* A lista das 143 orfas e uma AFIRMACAO sobre o codigo ("nenhuma tela viva
   * chama estas chaves"), e afirmacao sobre codigo apodrece. Se alguem escrever
   * a CirculoScreen amanha, as 31 chaves de 'circulo' voltam a ser copy de
   * verdade — e ficariam de fora do placar para sempre, invisiveis, que e o
   * mesmo defeito do item A virado do avesso.
   *
   * A varredura e de TEXTO-FONTE, como a de MadreMariaApp mais abaixo, e pelo
   * mesmo motivo: as telas tem JSX e a suite roda em node puro. Ela cobre as
   * tres formas de uma chave ser chamada — literal, prefixo montado
   * (t(`pref.${x}`), t('pref.' + x)) e sufixo montado (`${base}.titulo`) —
   * porque conferir so a literal acusaria de morta a chave viva de
   * screens/PlanoScreen.js:1562 e as de lib/lectura.js:925. */
  const { readdirSync, readFileSync, statSync } = require('node:fs');
  const { join } = require('node:path');

  const fontes = [];
  (function varrer(dir) {
    for (const nome of readdirSync(dir)) {
      if (nome === 'node_modules' || nome === 'dist' || nome === '.git') continue;
      const p = join(dir, nome);
      if (statSync(p).isDirectory()) varrer(p);
      else if (nome.endsWith('.js')) fontes.push(p);
    }
  })(join(__dirname, '..', 'madremaria'));

  // datos/ sao os DICIONARIOS: a chave aparece la por definicao, nao e chamada.
  let src = fontes
    .filter((p) => !p.split(/[\\/]/).includes('datos'))
    .map((p) => readFileSync(p, 'utf8'))
    .join('\n');
  // Comentario que CITA uma chave nao a chama. Este arquivo de teste e a prova:
  // os blocos acima nomeiam 'circulo.rotulo' e 'plano.veu.raspe' em prosa.
  src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

  const literais = new Set(
    [...src.matchAll(/['"`]([a-zA-Z][\w.\-]*\.[\w.\-]+)['"`]/g)].map((m) => m[1])
  );
  const prefixos = new Set();
  for (const m of src.matchAll(/`([\w.\-]+\.)\$\{/g)) prefixos.add(m[1]);
  for (const m of src.matchAll(/['"]([\w.\-]+\.)['"]\s*\+/g)) prefixos.add(m[1]);
  const sufixos = new Set();
  for (const m of src.matchAll(/`\$\{[^}]+\}(\.[\w.\-]+)`/g)) sufixos.add(m[1]);

  const ressuscitadas = TODAS_ORFAS.filter((clave) => {
    if (literais.has(clave)) return true;
    for (const p of prefixos) if (clave.startsWith(p)) return true;
    for (const s of sufixos) {
      if (clave.endsWith(s) && literais.has(clave.slice(0, -s.length))) return true;
    }
    return false;
  });

  assert.deepEqual(
    ressuscitadas,
    [],
    'CHAVE ORFA VOLTOU A SER CHAMADA por uma tela viva:\n' +
      `  ${ressuscitadas.map((c) => `${c}  (grupo "${GRUPO_DA_ORFA[c]}")`).join('\n  ')}\n\n` +
      'Uma tela nova esta usando copy que o placar trata como morta — ela nunca\n' +
      'seria cobrada em ES/EN e sairia em portugues na tela, em silencio.\n' +
      'Tire estas chaves de test/madremaria-i18n-orfas.js e traduza-as.'
  );
});

test('PLACAR: toda chave VIVA do PT existe, traduzida, em ES e EN', () => {
  const totalPT = Object.keys(_DICTS_PARA_TESTE.pt).length;
  const totalVivas = totalPT - SET_ORFAS.size;
  const relatorio = [];
  let faltaAlgo = false;

  for (const lang of IDIOMAS) {
    if (lang === IDIOMA_PADRAO) continue;
    // As orfas saem da conta: elas nao sao pendencia, sao copy de tela morta.
    const faltam = faltantes(lang).filter((c) => !SET_ORFAS.has(c));
    if (faltam.length > 0) faltaAlgo = true;
    const feitas = totalVivas - faltam.length;
    const pct = totalVivas === 0 ? 100 : Math.floor((feitas / totalVivas) * 100);
    relatorio.push(
      `  ${lang.toUpperCase()}: faltam ${faltam.length} de ${totalVivas} vivas ` +
        `(${feitas} prontas, ${pct}%)` +
        /* Nomeia por FAMILIA, nao as dez primeiras em ordem de insercao: dez
         * chaves de um prefixo so nao dizem nada sobre as outras 240, e era
         * assim que a lista ficava identica de uma corrida para a outra. Por
         * prefixo, a mensagem muda quando o CONTEUDO da pendencia muda. */
        (faltam.length > 0
          ? '\n' +
            porPrefixo(faltam)
              .map(
                ([p, cs]) =>
                  `      ${p}: ${cs.length} (${cs.slice(0, 3).join(', ')}${cs.length > 3 ? ', ...' : ''})`
              )
              .join('\n')
          : '')
    );
  }

  assert.ok(
    !faltaAlgo,
    'TRADUCAO DA MADRE INCOMPLETA (esperado enquanto os tradutores trabalham; ' +
      'o app nao quebra, chave sem traducao cai no portugues):\n' +
      relatorio.join('\n') +
      `\n  (${SET_ORFAS.size} chaves ORFAS estao FORA desta conta — copy das telas que ` +
      'nao vieram\n   na fusao com o Cosmic Guide. A lista e o motivo de cada grupo ' +
      'estao em\n   test/madremaria-i18n-orfas.js, e o teste acima confere que nenhuma ' +
      'voltou.)' +
      '\n  ES entra em madremaria/datos/textos.es.js, EN em textos.en.js.'
  );
});

test('a LINHA DE BASE esta em dia com o que ja foi entregue', () => {
  /* O guarda do guarda. A linha de base so pega regressao das chaves que ELA
   * conhece: um lote traduzido hoje e que nao entre nela fica desprotegido para
   * sempre, e ninguem descobre — o teste de regressao continua verde porque nao
   * sabe que aquelas chaves existem. Este teste faz a omissao DOER na hora: quem
   * entrega copy fica vermelho no mesmo commit em que entregou, com a lista do
   * que acrescentar pronta para colar.
   *
   * Ele nao cobra o contrario (chave na base que nao esta traduzida) — isso e
   * exatamente a REGRESSAO, e quem a reporta e o teste la em cima, com a
   * mensagem certa. */
  const atrasadas = [];
  for (const lang of IDIOMAS) {
    if (lang === IDIOMA_PADRAO) continue;
    const faltam = new Set(faltantes(lang));
    for (const clave of Object.keys(_DICTS_PARA_TESTE.pt)) {
      if (!faltam.has(clave) && !ENTREGUES[lang].has(clave)) {
        atrasadas.push(`${lang}: '${clave}',`);
      }
    }
  }

  assert.deepEqual(
    atrasadas,
    [],
    `A LINHA DE BASE ESTA ATRASADA — ${atrasadas.length} chaves ja traduzidas que ` +
      'test/madremaria-i18n-base.js ainda nao conhece:\n' +
      `  ${atrasadas.join('\n  ')}\n\n` +
      'Enquanto elas nao estiverem la, uma regressao NESSAS chaves passa em\n' +
      'silencio — a base e o que torna a perda visivel. Acrescente cada uma na\n' +
      'lista do idioma dela (em ordem alfabetica) e este teste fica verde.'
  );
});

// ===========================================================================
// 3 · AS ARMADILHAS — estas NAO podem esperar tradutor; sao defeito desde ja
// ===========================================================================

test('nenhum idioma inventa chave que nao existe no PT', () => {
  const doPT = new Set(Object.keys(_DICTS_PARA_TESTE.pt));
  for (const lang of IDIOMAS) {
    for (const clave of Object.keys(_DICTS_PARA_TESTE[lang])) {
      assert.ok(
        doPT.has(clave),
        `chave "${clave}" existe em "${lang}" mas nao no PT — ou o PT perdeu a ` +
          'chave, ou o tradutor inventou uma. Nenhuma tela chama essa chave.'
      );
    }
  }
});

test('as OITO chaves-lista continuam lista nos tres idiomas, com o mesmo tamanho', () => {
  // A tela indexa por posicao (meses[mes - 1], semana[diaSemana]): lista com
  // tamanho diferente nao e traducao ruim, e undefined dentro de um render.
  const listasPT = Object.entries(_DICTS_PARA_TESTE.pt).filter(([, v]) => Array.isArray(v));
  assert.equal(listasPT.length, 8, 'o numero de chaves-lista do PT mudou — confira o portao');

  for (const lang of IDIOMAS) {
    if (lang === IDIOMA_PADRAO) continue;
    for (const [clave, ptValor] of listasPT) {
      const valor = _DICTS_PARA_TESTE[lang][clave];
      if (valor === undefined || valor === null) continue; // ainda nao traduzida: conta no PLACAR
      assert.ok(Array.isArray(valor), `"${clave}" e lista no PT e virou string em "${lang}"`);
      assert.equal(
        valor.length,
        ptValor.length,
        `"${clave}" tem ${ptValor.length} linhas no PT e ${valor.length} em "${lang}" — ` +
          'a tela indexa por posicao'
      );
    }
  }
});

test('nenhuma chave-string do PT virou lista em outro idioma', () => {
  for (const lang of IDIOMAS) {
    if (lang === IDIOMA_PADRAO) continue;
    for (const [clave, ptValor] of Object.entries(_DICTS_PARA_TESTE.pt)) {
      if (Array.isArray(ptValor)) continue;
      const valor = _DICTS_PARA_TESTE[lang][clave];
      if (valor === undefined || valor === null) continue;
      assert.ok(
        !Array.isArray(valor),
        `"${clave}" e string no PT e virou lista em "${lang}" — a tela faria ` +
          'render de um array onde espera texto'
      );
    }
  }
});

function marcadoresDe(valor) {
  const texto = Array.isArray(valor) ? valor.join(' ') : String(valor);
  return new Set([...texto.matchAll(/\{(\w+)\}/g)].map((m) => m[1]));
}

test('cada chave usa os MESMOS marcadores do PT nos outros dois idiomas', () => {
  // Traduzir {nombre} para {nome}/{name} quebra a interpolacao EM SILENCIO: a
  // pessoa ve a chaveta literal na tela, e nada da erro.
  const divergencias = [];
  for (const [clave, ptValor] of Object.entries(_DICTS_PARA_TESTE.pt)) {
    const esperados = marcadoresDe(ptValor);
    for (const lang of IDIOMAS) {
      if (lang === IDIOMA_PADRAO) continue;
      const valor = _DICTS_PARA_TESTE[lang][clave];
      if (valor === undefined || valor === null) continue;
      const achados = marcadoresDe(valor);
      const faltando = [...esperados].filter((m) => !achados.has(m));
      const sobrando = [...achados].filter((m) => !esperados.has(m));
      if (faltando.length || sobrando.length) {
        divergencias.push(
          `${lang} · ${clave}: falta {${faltando.join('} {')}} / sobra {${sobrando.join('} {')}}`
        );
      }
    }
  }
  assert.deepEqual(divergencias, [], `marcador divergente:\n  ${divergencias.join('\n  ')}`);
});

// ===========================================================================
// 4 · OS TRES CAMINHOS DO t() — a prova de que o fallback e honesto
// ===========================================================================

test('CAMINHO 1: chave traduzida no idioma ativo devolve o texto DE LA', () => {
  // Planta uma traducao de verdade no dicionario ES e confere que t() a usa.
  // O dicionario nao e congelado de proposito: os tradutores escrevem nele.
  const CLAVE = 'app.tagline';
  assert.ok(existe(CLAVE), 'a chave de referencia do teste saiu do PT');
  const antes = _DICTS_PARA_TESTE.es[CLAVE];
  _DICTS_PARA_TESTE.es[CLAVE] = 'Tres cartas para la historia que quedo a medias';
  try {
    setIdiomaMadre('es');
    assert.equal(idiomaMadre(), 'es');
    assert.equal(t(CLAVE), 'Tres cartas para la historia que quedo a medias');
  } finally {
    if (antes === undefined) delete _DICTS_PARA_TESTE.es[CLAVE];
    else _DICTS_PARA_TESTE.es[CLAVE] = antes;
  }
});

test('CAMINHO 2: chave sem traducao cai no PORTUGUES, nunca na chave crua', () => {
  /* A chave e ESCOLHIDA pelo teste e o estado e PLANTADO por ele, em vez de
   * apontar para uma chave que hoje esta sem traducao. A versao anterior fixava
   * 'tirada.avisoOtraPersona' e se defendia com um assert que dizia "troque a do
   * teste" — ou seja, ela SABIA que ia quebrar, e quebrou: a chave foi traduzida
   * e o teste ficou vermelho por uma traducao CERTA. Era o mesmo defeito que o
   * comentario de `lista()` mais abaixo descreve, e o conserto e o mesmo: estado
   * que o teste precisa, o teste monta. Assim este caminho do t() continua
   * medido mesmo quando os tres dicionarios estiverem COMPLETOS — que e
   * justamente o dia em que nenhuma chave real serviria mais de cobaia. */
  const CLAVE = 'app.tagline';
  assert.ok(existe(CLAVE), 'a chave de referencia do teste saiu do PT');
  const antes = _DICTS_PARA_TESTE.en[CLAVE];

  setIdiomaMadre('en');
  try {
    delete _DICTS_PARA_TESTE.en[CLAVE];
    const saida = t(CLAVE);
    assert.equal(saida, _DICTS_PARA_TESTE.pt[CLAVE]);
    // E o que importa para quem le: nao e a chave, e nao e vazio.
    assert.notEqual(saida, CLAVE, 'o fallback devolveu o nome da chave na cara da pessoa');
    assert.ok(saida.trim().length > 0, 'o fallback devolveu texto vazio');

    // E o vazio NAO cai escondido no PT: string vazia e traducao entregue torta,
    // e por isso t() usa `=== undefined` e nao `||`. O placar e quem a cobra.
    _DICTS_PARA_TESTE.en[CLAVE] = '';
    assert.equal(t(CLAVE), '', 'string vazia caiu no PT e escondeu a traducao torta');
  } finally {
    if (antes === undefined) delete _DICTS_PARA_TESTE.en[CLAVE];
    else _DICTS_PARA_TESTE.en[CLAVE] = antes;
  }
});

test('CAMINHO 3: chave que nao existe em idioma nenhum volta como ela mesma', () => {
  const MORTA = 'chave.que.nunca.existiu';
  assert.ok(!existe(MORTA));
  for (const lang of IDIOMAS) {
    setIdiomaMadre(lang);
    assert.equal(t(MORTA), MORTA, `em "${lang}" a chave morta nao voltou como ela mesma`);
  }
});

// ===========================================================================
// 5 · O QUE O MOTOR NAO PODE PERDER AO GANHAR DOIS IDIOMAS
// ===========================================================================

test('a interpolacao de vars continua igual nos tres idiomas', () => {
  /* O que este teste prova e o MECANISMO, nao a redacao: {n} e {total} saem
   * substituidos, e marcador sem valor FICA na tela como {total} — bug visivel, e
   * nunca uma frase torta. A versao anterior comparava contra a string portuguesa
   * ('2 de 7') dentro do laco dos tres idiomas, e por isso ficou vermelha no dia em
   * que 'onboarding.progreso' foi traduzida para '2 of 7' — uma traducao CERTA
   * derrubando um teste de interpolacao. A assercao agora e sobre o que t() faz com
   * as chavetas, que e a unica coisa igual nos tres idiomas. */
  const CLAVE = 'onboarding.progreso';
  for (const lang of IDIOMAS) {
    setIdiomaMadre(lang);

    const completo = t(CLAVE, { n: 2, total: 7 });
    assert.match(completo, /\b2\b/, `{n} nao foi interpolado em "${lang}"`);
    assert.match(completo, /\b7\b/, `{total} nao foi interpolado em "${lang}"`);
    assert.doesNotMatch(completo, /\{\w+\}/, `sobrou chaveta na tela em "${lang}"`);

    const semTotal = t(CLAVE, { n: 2 });
    assert.match(semTotal, /\b2\b/, `{n} nao foi interpolado em "${lang}"`);
    assert.match(semTotal, /\{total\}/, `{total} sem valor nao ficou literal em "${lang}"`);
  }
});

test('chave-lista devolve ARRAY ja interpolado em qualquer idioma, nunca string', () => {
  for (const lang of IDIOMAS) {
    setIdiomaMadre(lang);
    const linhas = t('limites.lineas');
    assert.ok(Array.isArray(linhas), `"limites.lineas" nao voltou array em "${lang}"`);
    assert.equal(linhas.length, _DICTS_PARA_TESTE.pt['limites.lineas'].length);
    assert.ok(linhas.every((l) => typeof l === 'string' && l.trim() !== ''));
  }
});

test('lista() segue o idioma ATIVO e cai no PT quando falta — nunca undefined', () => {
  const CLAVE = 'ritual.meses';
  const pt = _DICTS_PARA_TESTE.pt[CLAVE];

  setIdiomaMadre('pt');
  assert.deepEqual(lista(CLAVE), pt);

  /* Os dois ramos PLANTAM o estado que querem medir, em vez de contar com o
   * dicionario estar de um jeito. A versao anterior lia o fallback com o EN ainda
   * vazio: no dia em que o tradutor entregou os doze meses em ingles, este teste
   * virou vermelho por uma traducao CERTA. Estado que o teste precisa, o teste
   * monta — senao ele mede o andamento da obra e nao o comportamento do motor. */
  const antes = _DICTS_PARA_TESTE.en[CLAVE];
  setIdiomaMadre('en');
  try {
    // Sem traducao: o calendario sai em portugues (honesto), nao em branco.
    delete _DICTS_PARA_TESTE.en[CLAVE];
    assert.deepEqual(lista(CLAVE), pt);

    // Com traducao: o calendario troca — era isso que `T['ritual.meses']` impedia.
    _DICTS_PARA_TESTE.en[CLAVE] = pt.map((_, i) => `month${i + 1}`);
    assert.equal(lista(CLAVE)[0], 'month1');
    assert.equal(lista(CLAVE).length, 12);
  } finally {
    if (antes === undefined) delete _DICTS_PARA_TESTE.en[CLAVE];
    else _DICTS_PARA_TESTE.en[CLAVE] = antes;
  }

  // Chave que nao e lista devolve [], porque quem chama indexa.
  assert.deepEqual(lista('app.tagline'), []);
  assert.deepEqual(lista('chave.que.nunca.existiu'), []);
});

test('idioma que a Madre nao fala e IGNORADO, e o anterior continua valendo', () => {
  setIdiomaMadre('es');
  setIdiomaMadre('fr');
  assert.equal(idiomaMadre(), 'es', 'um idioma desconhecido trocou o idioma ativo');
  setIdiomaMadre(null);
  setIdiomaMadre(undefined);
  assert.equal(idiomaMadre(), 'es');
});

test('existe() e claves() falam do CONJUNTO de chaves do app, que e o do PT', () => {
  // Uma chave nao deixa de existir porque ainda nao foi traduzida — senao as
  // varreduras de chave morta (missoes, conquistas, plano) acusariam o app
  // inteiro de morto assim que alguem ligasse o ingles.
  setIdiomaMadre('en');
  assert.ok(existe('app.tagline'));
  assert.ok(!existe('chave.que.nunca.existiu'));
});

// ===========================================================================
// 6 · A SOLDA COM O COSMIC
// ===========================================================================

test('a lista de idiomas da Madre nao divergiu da do Cosmic', () => {
  // A Madre declara IDIOMAS por conta propria (textos.js roda em node puro e nao
  // pode arrastar os 800 KB de lib/i18n.js). Este e o teste que impede as duas
  // listas de se afastarem: um quarto idioma no Cosmic sem par aqui faria a Madre
  // cair no portugues sem ninguem perceber.
  const { LANGUAGES, DEFAULT_LANGUAGE } = require('../lib/i18n.js');
  assert.deepEqual([...IDIOMAS].sort(), [...LANGUAGES].sort());
  assert.equal(IDIOMA_PADRAO, DEFAULT_LANGUAGE);
});

test('MadreMariaApp empurra o idioma do Cosmic e remonta a arvore ao trocar', () => {
  // Varredura de TEXTO-FONTE: o arquivo tem JSX e a suite roda em node puro, que
  // nao o parseia. Sem isto, as duas linhas que ligam a Madre ao seletor do
  // Cosmic seriam as unicas do motor que nenhum teste olha.
  const { readFileSync } = require('node:fs');
  const { join } = require('node:path');
  const APP = readFileSync(join(__dirname, '..', 'madremaria', 'MadreMariaApp.js'), 'utf8');

  assert.match(APP, /from '\.\.\/context\/LanguageContext'/, 'a Madre nao le o idioma do Cosmic');
  assert.match(APP, /setIdiomaMadre\(lang\)/, 'o idioma ativo nao e empurrado para textos.js');
  assert.match(APP, /<ArvoreDaMadre key=\{lang\}/, 'sem key={lang} a troca de idioma nao redesenha a Madre');
  // Sincrono, nao em efeito: dentro de useEffect a primeira pintura sairia em PT e
  // repintaria. A busca e pela CHAMADA embrulhada em efeito, em qualquer lugar do
  // arquivo — procurar a palavra "useEffect" no corpo acusaria o comentario que
  // explica justamente por que ela nao esta ali.
  assert.doesNotMatch(
    APP,
    /useEffect\([\s\S]{0,400}?setIdiomaMadre/,
    'setIdiomaMadre dentro de efeito: a primeira tela pinta em portugues e repinta'
  );
});
