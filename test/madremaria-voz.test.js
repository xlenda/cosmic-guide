// test/madremaria-voz.test.js
// O PORTAO DA VOZ — prova que os audios da Madre chegaram inteiros, nos tres
// idiomas, sem abrir o app uma vez por arquivo.
//
// ===========================================================================
// O QUE ELE VIGIA
// ===========================================================================
//   1. TODO audio que o app sabe pedir tem ARQUIVO ou AUSENCIA DECLARADA.
//      Os ids sao os 30 de madremaria/lib/audios.js; as ausencias, as de
//      test/madremaria-voz-ausencias.js, cada uma com motivo. Nao ha terceira
//      saida — e nenhuma das duas e "botao morto".
//   1b. E O ARQUIVO NAO BASTA: cada .m4a no disco precisa da sua linha de
//      `require` LITERAL no mapa do idioma (POR_IDIOMA em lib/audios.js). O
//      Metro nao resolve caminho montado com string, entao arquivo sem require e
//      voz que nunca chega na tela — e um portao que so olhasse o disco daria
//      tudo verde. O inverso tambem e cobrado: require sem arquivo derruba o
//      bundle inteiro no build.
//   2. NENHUM arquivo tem 0 bytes. Um .m4a vazio passa pelo require do Metro,
//      desenha o botao e nao toca nada: o pior dos dois mundos, porque a pessoa
//      aperta e nada acontece.
//   3. TODO <id>.<lang>.tempos.json que exista tem duracao > 0 e trechos nao
//      vazios, em ordem e com tempo finito.
//   4. O TEXTO EMENDADO dos trechos bate com o texto do bloco NAQUELE IDIOMA —
//      a mesma checagem que test/madremaria-profunda.test.js ja faz para o PT
//      ('as frases emendadas dao de volta o texto do bloco'), agora tambem para
//      o es e o en, contra datos/profunda.es.js e datos/profunda.en.js.
//      Sem isso, um tempos.es.json medido do audio PORTUGUES passaria: os
//      segundos sao plausiveis, a duracao e positiva, e a tela acenderia a frase
//      errada enquanto a voz diz outra — que e pior do que nao acender nada.
//
// ===========================================================================
// O QUE ELE NAO USA, E POR QUE
// ===========================================================================
// NAO chama ffprobe e NAO vai a rede: a suite roda em node puro
// (`node --require ./test/setup.js --test`) e um portao que depende de binario
// externo falha na maquina de quem nao o tem — e "falhou porque falta ffprobe"
// e indistinguivel de "falhou porque o audio quebrou". O que da para medir sem
// ele: o tamanho do arquivo (0 byte = arquivo morto) e o JSON inteiro. A
// DURACAO REAL do .m4a nao da, e este portao nao finge que da — ele confere a
// duracao DECLARADA no tempos.json contra o ultimo trecho, que e verificavel.
//
// ===========================================================================
// NOMES, NUNCA NUMEROS
// ===========================================================================
// Toda mensagem de erro lista os arquivos que faltam POR NOME, todos, sem
// `.slice(0, 10)`. O placar de i18n truncava em dez (test/i18nKeysExist.test.js
// :280) e escondia regressao atras do numero: se o es chegar e o en nao, este
// portao diz exatamente quais 30 arquivos en faltam, um por linha.
//
// ===========================================================================
// COMO RODAR SO ELE
// ===========================================================================
//   node --require ./test/setup.js --test test/madremaria-voz.test.js
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { BLOQUES_PROFUNDA, BLOQUES_PROFUNDA_B, paragrafosDe } from '../madremaria/datos/profunda.js';
import { PROFUNDA_ES } from '../madremaria/datos/profunda.es.js';
import { PROFUNDA_EN } from '../madremaria/datos/profunda.en.js';

const {
  TODOS_OS_IDS,
  IDIOMAS,
  AUSENTES,
  COM_TEMPO_MEDIDO,
  arquivoDe,
  temposDe,
  ausenciaDeclarada,
} = require('./madremaria-voz-ausencias.js');

/* FUSAO COSMIC GUIDE: o pipeline transpila para CommonJS com alvo Hermes, que
 * rejeita `import.meta`. __dirname existe nesse alvo — mesmo molde de
 * test/madremaria-voz-do-gesto.test.js. */
const RAIZ = join(__dirname, '..');
const PASTA_AUDIO = join(RAIZ, 'assets', 'madremaria', 'audio');
const FONTE_AUDIOS = readFileSync(join(RAIZ, 'madremaria', 'lib', 'audios.js'), 'utf8');

/* lib/audios.js e lido como TEXTO, nunca importado: os `require` de .m4a so o
 * Metro resolve, e no node eles estourariam. Mesmo motivo escrito em
 * test/madremaria-voz-do-gesto.test.js.
 *
 * SAO DOIS MAPAS NO MESMO ARQUIVO desde 12/09: `AUDIOS` (o portugues, arquivos
 * `<id>.m4a`) e `POR_IDIOMA` (es/en, arquivos `<id>.<lang>.m4a`). Varrer o
 * arquivo inteiro com uma regex so misturaria os dois — e foi exatamente o que
 * aconteceu na primeira versao deste portao: um `ritual-cafe.es.m4a` do mapa
 * espanhol foi cobrado como se fosse portugues. Cada mapa e lido do seu trecho. */
function registros(fonte, sufixo) {
  const escapado = sufixo.replace(/\./g, '\\.');
  return [...fonte.matchAll(
    new RegExp(`'([^']+)':\\s*require\\('\\.\\./\\.\\./assets/madremaria/audio/([^']+)${escapado}\\.m4a'\\)`, 'g')
  )].map(([, id, arquivo]) => ({ id, arquivo }));
}

/* O corte entre os dois mapas. `POR_IDIOMA` e declarado uma vez; o que vem
 * antes dele e o portugues. Se o nome do mapa mudar, o teste de sanidade logo
 * abaixo acusa em vez de o portao ficar cego. */
const CORTE = FONTE_AUDIOS.indexOf('const POR_IDIOMA');
const FONTE_PT = CORTE > 0 ? FONTE_AUDIOS.slice(0, CORTE) : FONTE_AUDIOS;
const FONTE_LANG = CORTE > 0 ? FONTE_AUDIOS.slice(CORTE) : '';

const IDS_NO_MAPA = registros(FONTE_PT, '');
const REGISTRADOS = {
  pt: IDS_NO_MAPA.map((e) => e.id),
  es: registros(FONTE_LANG, '.es').map((e) => e.id),
  en: registros(FONTE_LANG, '.en').map((e) => e.id),
};

const achatar = (texto) => String(texto == null ? '' : texto).replace(/\s+/g, ' ').trim();

/** Um bloco da profunda num idioma: texto traduzido, com fallback honesto ao PT. */
const BLOCOS_PT = [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B];
const DICIONARIO = { es: PROFUNDA_ES, en: PROFUNDA_EN };

function textoDoBloco(id, lang) {
  const pt = BLOCOS_PT.find((b) => b.id === id);
  if (!pt) return null;
  if (lang === 'pt') return pt.texto;
  const traduzido = DICIONARIO[lang]?.[id];
  /* `== null` e nao `||`, a mesma regra de blocoNoIdioma em datos/profunda.js:
   * string vazia e defeito de traducao, nao fallback escondido. */
  if (traduzido?.texto != null && String(traduzido.texto).trim() !== '') return traduzido.texto;
  return pt.texto;
}

/** Uma linha por nome, para o erro caber na tela e nada se esconder. */
const listar = (nomes) => nomes.map((n) => `\n    ${n}`).join('');

// ===========================================================================
// 1. A LISTA DE IDS NAO PODE DIVERGIR DO MAPA
// ===========================================================================
// Sem isto, um id novo em lib/audios.js nasceria fora do portao: teria arquivo
// PT (senao o bundle cai) e nunca seria cobrado em es/en. A ausencia so e
// honesta se a lista de quem pode faltar for a lista de verdade.

test('a lista do portao e exatamente o mapa de lib/audios.js', () => {
  assert.ok(
    IDS_NO_MAPA.length >= 30,
    `so ${IDS_NO_MAPA.length} ids casaram o padrao de require em lib/audios.js — `
      + 'o formato do mapa mudou e o portao ficou cego'
  );

  const noMapa = IDS_NO_MAPA.map((e) => e.id);
  const sobrando = noMapa.filter((id) => !TODOS_OS_IDS.includes(id));
  const faltando = TODOS_OS_IDS.filter((id) => !noMapa.includes(id));

  assert.deepEqual(
    sobrando, [],
    'ids novos em madremaria/lib/audios.js que ninguem cobra nos outros idiomas. '
      + 'Acrescente-os a TODOS_OS_IDS em test/madremaria-voz-ausencias.js (e as '
      + `ausencias de es/en, se ainda nao gravados):${listar(sobrando)}`
  );
  assert.deepEqual(
    faltando, [],
    'ids que o portao cobra e o mapa nao declara mais. Se o audio foi removido de '
      + `proposito, tire-o de TODOS_OS_IDS:${listar(faltando)}`
  );
});

test('o portao enxerga os dois mapas de lib/audios.js', () => {
  /* SANIDADE DO CORTE. Se `POR_IDIOMA` for renomeado, FONTE_LANG fica vazia e
   * todo o es/en passaria a "nao registrado" em silencio — um portao que falha
   * sozinho e pior que nenhum portao. */
  assert.ok(
    CORTE > 0,
    'nao achei `const POR_IDIOMA` em madremaria/lib/audios.js. O mapa por idioma '
      + 'foi renomeado ou removido — atualize o CORTE aqui antes de seguir, senao '
      + 'este portao para de cobrar es/en sem acusar nada.'
  );
});

test('o id e o nome do arquivo sao a mesma palavra', () => {
  /* arquivoDe() monta `<id>.<lang>.m4a` a partir do id. Se um id do mapa
   * apontasse para um arquivo de outro nome, o portao procuraria es/en no lugar
   * errado e daria falso negativo para sempre. */
  const tortos = IDS_NO_MAPA.filter((e) => e.id !== e.arquivo).map((e) => `${e.id} -> ${e.arquivo}.m4a`);
  assert.deepEqual(
    tortos, [],
    'id que nao bate com o nome do arquivo — arquivoDe() nao sabe achar o es/en '
      + `deste audio:${listar(tortos)}`
  );
});

test('audio no disco que lib/audios.js nao registra e voz que nunca chega na tela', () => {
  /* O ARQUIVO NAO BASTA. O Metro so resolve `require` com caminho LITERAL: um
   * .m4a no disco que nao tem linha em POR_IDIOMA e um arquivo que ninguem
   * consegue pedir — `audioDaCarta` devolve null, `temAudio` devolve false e o
   * botao some. O usuario ve o mesmo que veria se o arquivo nunca tivesse
   * chegado, e o portao que so olha o disco daria tudo verde.
   *
   * Este e o teste que prova que os 54 chegaram DE VERDADE: ate a ultima linha
   * de require entrar, ele nomeia as que faltam. */
  const mudos = [];

  for (const lang of IDIOMAS) {
    for (const id of TODOS_OS_IDS) {
      const nome = arquivoDe(id, lang);
      if (!existsSync(join(PASTA_AUDIO, nome))) continue;
      if (REGISTRADOS[lang].includes(id)) continue;
      mudos.push(`[${lang}] ${nome}`);
    }
  }

  assert.deepEqual(
    mudos, [],
    `${mudos.length} audio(s) estao no disco e NAO tem linha de require em `
      + 'madremaria/lib/audios.js. Arquivo sem require e voz que nunca toca: o Metro so '
      + 'resolve caminho literal, entao o botao some e a pessoa nunca sabe que o audio '
      + `existe. Cada um precisa da sua linha no mapa do idioma:${listar(mudos)}`
  );
});

test('lib/audios.js nao registra audio que nao esta no disco', () => {
  /* O INVERSO, e este derruba o BUILD, nao so a tela: um require apontando para
   * .m4a inexistente estoura o bundle inteiro no Metro. O portao pega antes do
   * build — a mesma razao escrita em test/madremaria-voz-do-gesto.test.js. */
  const fantasmas = [];

  for (const lang of IDIOMAS) {
    for (const id of REGISTRADOS[lang]) {
      const nome = arquivoDe(id, lang);
      if (!existsSync(join(PASTA_AUDIO, nome))) fantasmas.push(`[${lang}] ${nome}`);
    }
  }

  assert.deepEqual(
    fantasmas, [],
    'require de .m4a que nao existe no disco — isto derruba o bundle inteiro no Metro, '
      + `nao e so um botao a menos:${listar(fantasmas)}`
  );
});

// ===========================================================================
// 2. TODO AUDIO TEM ARQUIVO OU AUSENCIA DECLARADA — NOS TRES IDIOMAS
// ===========================================================================

test('todo audio que o app pode pedir tem arquivo ou ausencia declarada, nos tres idiomas', () => {
  const semResposta = [];

  for (const lang of IDIOMAS) {
    for (const id of TODOS_OS_IDS) {
      const nome = arquivoDe(id, lang);
      if (existsSync(join(PASTA_AUDIO, nome))) continue;
      if (ausenciaDeclarada(id, lang)) continue;
      semResposta.push(`[${lang}] ${nome}`);
    }
  }

  assert.deepEqual(
    semResposta, [],
    `${semResposta.length} audio(s) que o app sabe pedir nao estao no disco NEM `
      + 'declarados como ausentes em test/madremaria-voz-ausencias.js. Um audio nessa '
      + 'situacao vira botao morto: a tela desenha o botao, a pessoa aperta e nada toca. '
      + 'Ou o arquivo chega, ou entra em AUSENTES com o motivo escrito:'
      + listar(semResposta)
  );
});

test('a lista de ausencias nao envelheceu: audio que chegou saiu da lista', () => {
  const chegaram = [];

  for (const [lang, grupo] of Object.entries(AUSENTES)) {
    for (const id of grupo.ids) {
      const nome = arquivoDe(id, lang);
      if (existsSync(join(PASTA_AUDIO, nome))) chegaram.push(`[${lang}] ${nome}`);
    }
  }

  assert.deepEqual(
    chegaram, [],
    `${chegaram.length} audio(s) CHEGARAM ao disco e continuam declarados ausentes. `
      + 'Tire-os de AUSENTES em test/madremaria-voz-ausencias.js — uma lista de ausencia '
      + 'que envelhece em silencio esconde exatamente o que ela existe para mostrar:'
      + listar(chegaram)
  );
});

test('o placar da voz diz, por idioma, quantos faltam e QUAIS', () => {
  /* Este teste nao falha por falta: ele SO falha se um idioma regredir a ponto de
   * nao ter nenhum arquivo onde antes tinha. O valor dele e a mensagem — e a
   * mensagem sai nominal, nunca truncada. */
  const placar = [];

  for (const lang of IDIOMAS) {
    const presentes = TODOS_OS_IDS.filter((id) => existsSync(join(PASTA_AUDIO, arquivoDe(id, lang))));
    const faltam = TODOS_OS_IDS.filter((id) => !presentes.includes(id));
    placar.push({ lang, presentes: presentes.length, faltam });
  }

  const pt = placar.find((p) => p.lang === 'pt');
  assert.deepEqual(
    pt.faltam, [],
    'o PORTUGUES perdeu arquivo. O PT nao pode faltar: cada um destes ids e um '
      + `require estatico em lib/audios.js, e require sem arquivo derruba o bundle inteiro no Metro:${listar(pt.faltam.map((id) => arquivoDe(id, 'pt')))}`
  );

  /* O relatorio, que aparece quando se roda este arquivo sozinho. Nao e enfeite:
   * e o unico lugar onde "o es chegou e o en nao" aparece por nome. */
  for (const { lang, presentes, faltam } of placar) {
    if (faltam.length === 0) continue;
    console.log(
      `[voz] ${lang}: ${presentes}/${TODOS_OS_IDS.length} no disco. Faltam ${faltam.length}:`
        + listar(faltam.map((id) => arquivoDe(id, lang)))
    );
  }
});

// ===========================================================================
// 3. NENHUM ARQUIVO DE 0 BYTES
// ===========================================================================

test('nenhum audio no disco tem 0 bytes', () => {
  const mortos = readdirSync(PASTA_AUDIO)
    .filter((nome) => nome.endsWith('.m4a'))
    .filter((nome) => statSync(join(PASTA_AUDIO, nome)).size === 0);

  assert.deepEqual(
    mortos, [],
    'arquivo de audio com 0 bytes. Ele passa pelo require do Metro, desenha o botao '
      + 'e nao toca nada — a pessoa aperta e o app fica mudo sem erro nenhum. '
      + `Regravar ou apagar (e declarar a ausencia):${listar(mortos)}`
  );
});

test('nenhum audio no disco e pequeno demais para conter voz', () => {
  /* SEM FFPROBE, o unico sinal de "arquivo truncado" que sobra e o tamanho. O
   * piso de 8 KB nao mede duracao e nao finge medir: o menor .m4a real da pasta
   * hoje tem 55 KB (entrada-presenca), e nenhuma fala da Madre cabe em 8 KB de
   * AAC. Um download interrompido ou uma geracao que morreu no meio para aqui. */
  const PISO_BYTES = 8 * 1024;
  const magros = readdirSync(PASTA_AUDIO)
    .filter((nome) => nome.endsWith('.m4a'))
    .map((nome) => ({ nome, bytes: statSync(join(PASTA_AUDIO, nome)).size }))
    .filter((a) => a.bytes > 0 && a.bytes < PISO_BYTES)
    .map((a) => `${a.nome} (${a.bytes} bytes)`);

  assert.deepEqual(
    magros, [],
    `audio abaixo de ${PISO_BYTES} bytes — cabe silencio, nao cabe fala. `
      + `Provavelmente download interrompido ou geracao truncada:${listar(magros)}`
  );
});

// ===========================================================================
// 4. OS TEMPOS: DURACAO, TRECHOS, E O TEXTO DAQUELE IDIOMA
// ===========================================================================

/** Todo <id>.<lang>.tempos.json (e <id>.tempos.json) que existir na pasta. */
function temposNoDisco() {
  return readdirSync(PASTA_AUDIO)
    .filter((nome) => nome.endsWith('.tempos.json'))
    .map((nome) => {
      const base = nome.slice(0, -'.tempos.json'.length);
      const casa = base.match(/^(.*)\.(es|en)$/);
      return casa
        ? { nome, id: casa[1], lang: casa[2] }
        : { nome, id: base, lang: 'pt' };
    });
}

test('todo tempos.json no disco tem duracao > 0 e trechos de verdade', () => {
  const defeitos = [];

  for (const { nome, id, lang } of temposNoDisco()) {
    let dados;
    try {
      dados = JSON.parse(readFileSync(join(PASTA_AUDIO, nome), 'utf8'));
    } catch (erro) {
      defeitos.push(`${nome}: JSON ilegivel (${erro.message})`);
      continue;
    }

    const duracao = Number(dados?.duracao);
    if (!Number.isFinite(duracao) || duracao <= 0) {
      defeitos.push(`${nome}: duracao ${JSON.stringify(dados?.duracao)} — sem duracao a barra fica parada no zero`);
    }

    const trechos = dados?.trechos;
    if (!Array.isArray(trechos) || trechos.length === 0) {
      defeitos.push(`${nome}: sem trechos — a tela desenha e nada acende`);
      continue;
    }

    /* A mesma sanidade de tempoUtilizavel() em datos/profunda.js: ordem
     * crescente, tempos finitos, texto de verdade. */
    let anterior = -1;
    trechos.forEach((trecho, i) => {
      const ini = Number(trecho?.ini);
      const fim = Number(trecho?.fim);
      if (!Number.isFinite(ini) || !Number.isFinite(fim)) {
        defeitos.push(`${nome}: trecho ${i} sem tempo medido (ini=${trecho?.ini}, fim=${trecho?.fim})`);
        return;
      }
      if (ini < anterior) defeitos.push(`${nome}: trecho ${i} comeca antes do anterior (${ini} < ${anterior})`);
      if (fim < ini) defeitos.push(`${nome}: trecho ${i} acaba antes de comecar (${fim} < ${ini})`);
      if (achatar(trecho?.texto).length === 0) defeitos.push(`${nome}: trecho ${i} sem texto`);
      anterior = ini;
    });

    /* A duracao declarada tem de cobrir o ultimo trecho. E a unica checagem de
     * duracao possivel sem ffprobe — e pega a medicao que ficou pela metade. */
    const ultimo = Number(trechos[trechos.length - 1]?.fim);
    if (Number.isFinite(ultimo) && Number.isFinite(duracao) && duracao > 0 && ultimo > duracao + 0.5) {
      defeitos.push(`${nome}: a ultima frase acaba em ${ultimo}s e a duracao declarada e ${duracao}s`);
    }

    /* O arquivo de audio do MESMO idioma tem de existir. Tempo medido sem audio
     * e realce cronometrado de voz nenhuma. */
    const audio = arquivoDe(id, lang);
    if (!existsSync(join(PASTA_AUDIO, audio))) {
      defeitos.push(`${nome}: mede um audio que nao esta no disco (${audio})`);
    }
  }

  assert.deepEqual(defeitos, [], `tempos.json com defeito:${listar(defeitos)}`);
});

test('o texto emendado dos trechos bate com o texto do bloco NAQUELE idioma', () => {
  const desencontros = [];

  for (const { nome, id, lang } of temposNoDisco()) {
    const esperado = textoDoBloco(id, lang);
    /* Nem todo tempos.json e de bloco da profunda — um ritual pode ganhar realce
     * um dia. Sem bloco para comparar, nao ha o que afirmar, e inventar uma
     * comparacao seria pior que nao fazer nenhuma. */
    if (esperado == null) continue;

    let dados;
    try {
      dados = JSON.parse(readFileSync(join(PASTA_AUDIO, nome), 'utf8'));
    } catch {
      continue; // o teste de cima ja acusou o JSON ilegivel
    }
    const trechos = Array.isArray(dados?.trechos) ? dados.trechos : [];
    if (trechos.length === 0) continue; // idem

    const emendado = achatar(trechos.map((t) => t.texto).join(' '));
    const alvo = achatar(esperado);
    if (emendado === alvo) continue;

    /* O PRIMEIRO PONTO ONDE DIVERGEM — dizer "nao bate" e inutil num texto de
     * 4 minutos; dizer onde e o que da para consertar. */
    let i = 0;
    while (i < emendado.length && i < alvo.length && emendado[i] === alvo[i]) i += 1;
    desencontros.push(
      `${nome} [${lang}] diverge do bloco '${id}' no caractere ${i}:`
        + `\n      medido:  ...${emendado.slice(Math.max(0, i - 40), i + 60)}`
        + `\n      no bloco: ...${alvo.slice(Math.max(0, i - 40), i + 60)}`
    );
  }

  assert.deepEqual(
    desencontros, [],
    'o texto cronometrado nao e o texto que a tela desenha naquele idioma. A tela '
      + 'acenderia a frase errada enquanto a voz diz outra — pior do que nao acender nada. '
      + 'Ou o tempos.json foi medido do audio de OUTRO idioma, ou o texto do bloco mudou '
      + `sem a remedicao sair no mesmo commit:${listar(desencontros)}`
  );
});

test('os dez blocos que tem tempo medido no PT continuam tendo', () => {
  /* Sanidade da lista COM_TEMPO_MEDIDO: hoje o PT mede num arquivo unico
   * (datos/profunda-tempos.json), nao num <id>.tempos.json por audio. Se um
   * bloco sumir de la, o realce PT morre em silencio. */
  const TEMPOS_PT = JSON.parse(
    readFileSync(join(RAIZ, 'madremaria', 'datos', 'profunda-tempos.json'), 'utf8')
  );
  const sumiram = COM_TEMPO_MEDIDO.filter((id) => {
    const medido = TEMPOS_PT[id];
    return !medido || !(Number(medido.duracao) > 0) || !Array.isArray(medido.trechos) || medido.trechos.length === 0;
  });

  assert.deepEqual(
    sumiram, [],
    'bloco que tinha tempo medido no PT e perdeu. O realce por frase desliga em silencio '
      + `para ele — a tela desenha e nada acende:${listar(sumiram)}`
  );
});
