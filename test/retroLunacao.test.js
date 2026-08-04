// A RETROSPECTIVA DA LUA CHEIA — as travas que impedem o balanço de virar
// invenção.
//
// A feature existe pra pagar constância de volta, e é exatamente esse tipo de
// tela que apodrece primeiro: basta alguém "melhorar" o texto pra prometer um
// mês melhor, ou preencher o ciclo vazio com um zero enfeitado. Este arquivo
// guarda cinco leis:
//
//   1. O CICLO É ASTRONOMIA, NÃO ESTIMATIVA. A janela é a lunação real (Lua
//      Nova → Lua Nova) e a abertura tem que ser a Lua Nova de verdade da
//      efeméride, com a duração batendo com a de um mês sinódico.
//   2. UM NÚMERO SÓ. O placar do ciclo tem que fechar com o diasPresentes que o
//      termômetro da Home já mostra — a mesma pessoa não pode ler dois números
//      diferentes de presença no mesmo dia.
//   3. NADA ENTRA DE FORA DA JANELA. Check-in e leitura de antes da Lua Nova
//      pertencem ao ciclo passado, e ciclo vazio se declara vazio.
//   4. LUA CHEIA É MEDIDA, E NÃO TEM IDIOMA. A checagem do dia usa longitude,
//      então responde igual em pt/es/en.
//   5. LINHA VERMELHA NO TEXTO. Nenhuma chave desta tela promete sorte, saúde,
//      resultado ou porcentagem de vida — nos três idiomas.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  retrospectivaDaLunacao,
  ehDiaDeLuaCheia,
  proximaLuaCheia,
} from '../lib/retroLunacao.js';
import { termometroDaLunacao } from '../lib/checkin.js';
import { LANGUAGES, _DICTS_FOR_TESTS } from '../lib/i18n.js';

// Efeméride real de ago/2026 (conferida com astronomy-engine):
//   Lua Nova  12/08/2026 17:37 UTC
//   Lua Cheia 28/08/2026 04:19 UTC
//   Lua Nova  11/09/2026 03:27 UTC
// 28/08 ao meio-dia LOCAL cai na fatia da Cheia em qualquer fuso do planeta
// (conferido de UTC-14 a UTC+14), então a data serve de âncora sem depender do
// TZ de quem roda o teste.
const CHEIA = new Date(2026, 7, 28, 12, 0, 0);
const CRESCENTE = new Date(2026, 7, 15, 12, 0, 0);

// ===========================================================================
// 1. O ciclo é astronomia
// ===========================================================================
test('o ciclo abre na Lua Nova REAL e dura um mês sinódico — nunca 30 dias chutados', () => {
  const r = retrospectivaDaLunacao({}, CHEIA);
  assert.ok(r, 'com efeméride disponível a retro precisa existir');

  // A abertura é a Lua Nova de 12/08/2026, não "hoje menos 29,5".
  assert.equal(r.abertura.getUTCMonth(), 7);
  assert.equal(r.abertura.getUTCDate(), 12);
  assert.ok(r.proximaNova > CHEIA, 'a Lua Nova que fecha o ciclo ainda não chegou');

  // Mês sinódico ~29,53 dias: arredondado, 29 ou 30. Qualquer outra coisa é
  // sinal de que alguém trocou a efeméride por uma constante.
  assert.ok(
    r.duracaoDoCiclo === 29 || r.duracaoDoCiclo === 30,
    `duração do ciclo fora do mês sinódico: ${r.duracaoDoCiclo}`
  );

  // Lua Cheia é o MEIO do ciclo — o dia tem que cair perto da metade.
  assert.ok(
    r.diaDoCiclo >= 14 && r.diaDoCiclo <= 18,
    `Lua Cheia deveria cair no meio do ciclo, deu dia ${r.diaDoCiclo} de ${r.duracaoDoCiclo}`
  );
});

// ===========================================================================
// 2. Um número só
// ===========================================================================
test('a presença da retro é o MESMO número que o termômetro da Home mostra', () => {
  const checkins = {
    '2026-08-13': 'leve',
    '2026-08-14': 'pesado',
    '2026-08-19': 'neutro',
    '2026-08-25': 'leve',
    '2026-08-28': 'leve',
  };
  const r = retrospectivaDaLunacao(checkins, CHEIA);
  const termometro = termometroDaLunacao(checkins, CHEIA);

  assert.equal(r.diasDePresenca, termometro.diasPresentes);
  assert.equal(r.placar.total, termometro.diasPresentes);
  assert.deepEqual(r.placar, { leve: 3, neutro: 1, pesado: 1, total: 5 });
});

// ===========================================================================
// 3. Nada entra de fora da janela
// ===========================================================================
test('check-in e leitura de antes da Lua Nova pertencem ao ciclo passado', () => {
  const checkins = {
    '2026-08-05': 'leve', // ciclo ANTERIOR (Lua Nova foi em 12/08)
    '2026-08-11': 'leve', // véspera da Lua Nova — também é do ciclo anterior
    '2026-08-20': 'leve',
  };
  const leituras = [
    { date: '2026-08-01T10:00:00' }, // ciclo anterior
    { date: '2026-08-20T09:30:00' },
    { date: '2026-08-27T22:10:00' },
    { date: '2026-09-20T09:00:00' }, // futuro: nunca conta
    { date: 'lixo' }, // data inválida não derruba nem infla a conta
    null,
  ];
  const r = retrospectivaDaLunacao(checkins, CHEIA, leituras);

  assert.equal(r.diasDePresenca, 1, 'só o check-in de 20/08 está dentro do ciclo');
  assert.equal(r.leiturasNoCiclo, 2, 'só as leituras de 20/08 e 27/08 estão dentro');
  assert.equal(r.temRegistro, true);
});

test('ciclo sem NADA se declara vazio — a tela não celebra zeros', () => {
  const r = retrospectivaDaLunacao({}, CHEIA, []);
  assert.equal(r.temRegistro, false);
  assert.equal(r.diasDePresenca, 0);
  assert.equal(r.leiturasNoCiclo, 0);
  assert.equal(r.humorDominante, null, 'sem resposta não existe resposta dominante');
});

test('empate no placar não elege vencedor — empate é resposta', () => {
  const empate = retrospectivaDaLunacao(
    { '2026-08-13': 'leve', '2026-08-14': 'pesado', '2026-08-20': 'neutro' },
    CHEIA
  );
  assert.equal(empate.humorDominante, null);

  const claro = retrospectivaDaLunacao(
    { '2026-08-13': 'leve', '2026-08-14': 'leve', '2026-08-20': 'pesado' },
    CHEIA
  );
  assert.equal(claro.humorDominante, 'leve');
});

// ===========================================================================
// 4. Lua Cheia é medida, e não tem idioma
// ===========================================================================
test('o dia de Lua Cheia é reconhecido pela longitude, não pelo nome traduzido', () => {
  assert.equal(ehDiaDeLuaCheia(CHEIA), true, '28/08/2026 é dia de Lua Cheia');
  assert.equal(ehDiaDeLuaCheia(CRESCENTE), false, '15/08/2026 é Lua Crescente');

  assert.equal(retrospectivaDaLunacao({}, CHEIA).ehLuaCheia, true);
  assert.equal(retrospectivaDaLunacao({}, CRESCENTE).ehLuaCheia, false);

  // Fora do dia, a tela precisa saber QUANDO ela volta — com instante real.
  const proxima = proximaLuaCheia(CRESCENTE);
  assert.ok(proxima instanceof Date, 'sem data da próxima Cheia a tela não teria o que dizer');
  assert.ok(proxima > CRESCENTE);
  assert.equal(proxima.getUTCMonth(), 7);
  assert.equal(proxima.getUTCDate(), 28);
});

// ===========================================================================
// 5. Linha vermelha no texto
// ===========================================================================
// O motor conta; o texto é onde a promessa entra escondida. Mesma disciplina
// das varreduras de test/rituais.test.js e test/seita.test.js: se alguém
// escrever "sua sorte melhorou 40% neste ciclo" numa chave de retroLua.*, o
// build para aqui — nos três idiomas, não só em português.
const PROIBIDO = [
  /\bsorte\b|\bsuerte\b|\bluck(y)?\b/i,
  /\bsa[úu]de\b|\bsalud\b|\bhealth\b/i,
  /\bcura\b|\bcure\b|\bheal(s|ing)?\b/i,
  /\bgarant/i, // garante, garantia, garantiza
  /\bpromet|\bpromis/i,
  /\bprevis|\bpredic|\bforecast/i,
  /\bdiagn[óo]stic/i,
  /%/, // porcentagem de vida/melhora — o app mede contagem, não índice
];

test('nenhuma chave desta tela promete sorte, saúde, previsão ou porcentagem — nos três idiomas', () => {
  const violacoes = [];
  let chavesVistas = 0;

  for (const lang of LANGUAGES) {
    const dict = _DICTS_FOR_TESTS[lang];
    for (const [chave, texto] of Object.entries(dict)) {
      if (!chave.startsWith('retroLua.') && !chave.startsWith('home.card.retrolua.')) continue;
      chavesVistas += 1;
      assert.equal(typeof texto, 'string', `${lang}: ${chave} não é texto`);
      assert.ok(texto.trim() !== '', `${lang}: ${chave} está vazia`);
      for (const re of PROIBIDO) {
        const m = texto.match(re);
        if (m) violacoes.push(`${lang}: ${chave} → "${m[0]}" em "${texto}"`);
      }
    }
  }

  assert.ok(chavesVistas > 0, 'a varredura não achou chave nenhuma — ela não protege ninguém');
  assert.deepEqual(violacoes, [], `promessa/saúde/porcentagem no texto da retro:\n  ${violacoes.join('\n  ')}`);
});

test('as chaves da retro existem nos TRÊS idiomas — nenhuma cai pro português por omissão', () => {
  const [pt, es, en] = LANGUAGES.map((l) => _DICTS_FOR_TESTS[l]);
  const chavesPt = Object.keys(pt).filter(
    (k) => k.startsWith('retroLua.') || k.startsWith('home.card.retrolua.')
  );
  assert.ok(chavesPt.length >= 20, `só ${chavesPt.length} chaves de retro em PT — a família encolheu`);

  const faltando = [];
  for (const k of chavesPt) {
    if (typeof es[k] !== 'string' || !es[k].trim()) faltando.push(`es: ${k}`);
    if (typeof en[k] !== 'string' || !en[k].trim()) faltando.push(`en: ${k}`);
  }
  assert.deepEqual(faltando, [], `chave(s) de retro sem tradução:\n  ${faltando.join('\n  ')}`);
});
