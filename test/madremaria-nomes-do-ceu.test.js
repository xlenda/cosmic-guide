// test/madremaria-nomes-do-ceu.test.js
// O PORTAO CONTRA A FRASE HIBRIDA.
//
// ===========================================================================
// O DEFEITO QUE ELE GUARDA
// ===========================================================================
// FASES e REGENTE_POR_DIA (lib/ceu.js) e SIGNOS (lib/sinastria.js, lib/signo.js)
// sao CONGELADOS em portugues de proposito — sao identificadores tecnicos. Mas
// eles entravam por interpolacao em chaves JA TRADUZIDAS, e a tela de quem le em
// ingles dizia:
//
//   "Today's Moon is in Lua Cheia."
//   "Friday, day of Venus" (com acento, a grafia portuguesa)
//   "Aries and Touro - opposition."
//
// Pior que nao traduzir: parece defeito do app. lib/nomesDoCeu.js separa o VALOR
// (tecnico, PT, o que o codigo compara) do ROTULO (por idioma, o que a pessoa le),
// e este arquivo e o portao que impede a separacao de se desfazer.
//
// ===========================================================================
// AS TRES PERGUNTAS, E POR QUE CADA UMA
// ===========================================================================
// 1. COBERTURA: todo nome canonico tem rotulo em ES e EN. Chave faltando cai no
//    PT em silencio, e e exatamente o defeito original voltando por uma fresta.
// 2. O VALOR NAO SE MOVE: rotular nao pode tocar em FASES, em REGENTE_POR_DIA,
//    em SIGNOS, nem no que `planoDoDia` emite em `ceu.fase.nome` — porque esse
//    valor e comparado contra `momento.fasesLua` de datos/plano.js e indexa
//    GLIFO_POR_PLANETA. Traduzir o valor apagaria o glifo e quebraria o encaixe
//    do ritual EM SILENCIO, com o app desenhando normalmente.
// 3. A FRASE RENDERIZADA: em 'en', nenhuma frase de tela contem 'Lua', 'Touro',
//    'Venus' com acento etc. Esta e a pergunta que o revisor fez, e e a unica
//    que pega o defeito pelo lado de quem le.
//
// NAO ha teste de POSICAO aqui de proposito: nomesDoCeu.js e um mapa por NOME,
// nao um array por indice — e e por isso que ele nao pode deslocar a lua de hoje
// para outra fase, que e o risco que um array de traducao teria.
import test from 'node:test';
import assert from 'node:assert/strict';

import { IDIOMA_PADRAO, setIdiomaMadre, t, lista } from '../madremaria/datos/textos.js';
import { FASES, GLIFO_POR_PLANETA, REGENTE_POR_DIA, regenteDoDia } from '../madremaria/lib/ceu.js';
import {
  _TABELAS_PARA_TESTE,
  rotuloDaFase,
  rotuloDoPlaneta,
  rotuloDoSigno,
} from '../madremaria/lib/nomesDoCeu.js';
import { SIGNOS, ritmoDoPar } from '../madremaria/lib/sinastria.js';
import { SIGNOS as SIGNOS_OBJ } from '../madremaria/lib/signo.js';
import { planoDoDia } from '../madremaria/lib/plano.js';

/* O espelho do idioma e variavel de MODULO, compartilhada com qualquer outro
 * teste no mesmo processo. Mesma disciplina de test/madremaria-i18n.test.js. */
test.afterEach(() => setIdiomaMadre(IDIOMA_PADRAO));

const TRADUZIDOS = ['es', 'en'];

// ===========================================================================
// 1 · COBERTURA — nenhum nome canonico sem rotulo
// ===========================================================================

test('os tres catalogos de rotulo cobrem TODO nome canonico em ES e EN', () => {
  const casos = [
    ['fase', FASES, _TABELAS_PARA_TESTE.fase],
    ['planeta', REGENTE_POR_DIA, _TABELAS_PARA_TESTE.planeta],
    ['signo', SIGNOS, _TABELAS_PARA_TESTE.signo],
  ];
  for (const [qual, canonicos, tabela] of casos) {
    for (const lang of TRADUZIDOS) {
      const faltam = canonicos.filter((nome) => {
        const v = tabela[lang][nome];
        return typeof v !== 'string' || v.trim() === '';
      });
      assert.deepEqual(
        faltam,
        [],
        `${qual} sem rotulo em "${lang}": ${faltam.join(', ')} — cairia no portugues em silencio`
      );
    }
    /* O inverso tambem: rotulo de nome que nao existe mais e chave morta, e chave
     * morta esconde um renomeio que ninguem propagou. */
    for (const lang of TRADUZIDOS) {
      const sobrando = Object.keys(tabela[lang]).filter((k) => canonicos.indexOf(k) === -1);
      assert.deepEqual(
        sobrando,
        [],
        `${qual}: rotulo para nome que nao e canonico em "${lang}": ${sobrando.join(', ')}`
      );
    }
  }
});

test('os doze signos de lib/signo.js sao os MESMOS doze de lib/sinastria.js', () => {
  // Dois catalogos de signo existem no app (um de strings, um de objetos) e os
  // rotulos servem aos dois pela mesma tabela. Se eles divergirem, um dos dois
  // fica sem rotulo sem que o teste de cobertura acima perceba.
  assert.deepEqual(SIGNOS_OBJ.map((s) => s.nome), [...SIGNOS]);
});

test('em PT o rotulo E o proprio canonico: o portugues nao tem ramo', () => {
  setIdiomaMadre('pt');
  for (const f of FASES) assert.equal(rotuloDaFase(f), f);
  for (const p of REGENTE_POR_DIA) assert.equal(rotuloDoPlaneta(p), p);
  for (const s of SIGNOS) assert.equal(rotuloDoSigno(s), s);
});

test('nome desconhecido sai CRU, nunca vazio e nunca undefined', () => {
  setIdiomaMadre('en');
  assert.equal(rotuloDaFase('Lua Quadrada'), 'Lua Quadrada');
  assert.equal(rotuloDoPlaneta('Nibiru'), 'Nibiru');
  assert.equal(rotuloDoSigno('Ofiuco'), 'Ofiuco');
  assert.equal(rotuloDaFase(null), null);
  assert.equal(rotuloDaFase(''), '');
});

// ===========================================================================
// 2 · O VALOR TECNICO NAO SE MOVE
// ===========================================================================

test('rotular NAO toca nos arrays canonicos: eles continuam em portugues', () => {
  setIdiomaMadre('en');
  FASES.forEach((f) => rotuloDaFase(f));
  REGENTE_POR_DIA.forEach((p) => rotuloDoPlaneta(p));
  SIGNOS.forEach((s) => rotuloDoSigno(s));
  assert.equal(FASES[4], 'Lua Cheia');
  assert.equal(REGENTE_POR_DIA[5], 'Vênus');
  assert.equal(SIGNOS[1], 'Touro');
  // O glifo e buscado pelo canonico. Se alguem rotular antes do lookup, ele
  // esvazia — e uma linha do dia sem glifo e o sintoma visivel disso.
  assert.equal(GLIFO_POR_PLANETA[regenteDoDia('2026-09-11')], '♀');
});

test('planoDoDia emite a fase e o regente CANONICOS em qualquer idioma', () => {
  // `ceu.fase.nome` e comparado contra `momento.fasesLua` de datos/plano.js, que
  // e portugues. `regente` indexa GLIFO_POR_PLANETA. Os dois sao DADO, nao texto.
  const resp = { hoy: 'hablamos-normal', nacimiento: '1990-05-10' };
  const pt = (setIdiomaMadre('pt'), planoDoDia(resp, { hoy: '2026-09-11' }));
  for (const lang of TRADUZIDOS) {
    setIdiomaMadre(lang);
    const p = planoDoDia(resp, { hoy: '2026-09-11' });
    assert.equal(p.regente, pt.regente, `o regente mudou de valor em "${lang}"`);
    if (pt.ceu && p.ceu) {
      assert.equal(p.ceu.fase.nome, pt.ceu.fase.nome, `a fase mudou de valor em "${lang}"`);
      assert.equal(FASES.indexOf(p.ceu.fase.nome) !== -1, true, 'a fase saiu de FASES');
      if (pt.ceu.marco && p.ceu.marco) {
        assert.equal(p.ceu.marco.nome, pt.ceu.marco.nome, `o marco mudou de valor em "${lang}"`);
      }
    }
  }
});

test('o encaixe do ritual da o MESMO veredito nos tres idiomas', () => {
  // O encaixe compara `nomeDaFase` contra `momento.fasesLua`. Se o valor virasse
  // 'Full Moon', o indexOf falharia e o tipo cairia de 'exato' para 'nenhum' —
  // sem erro, com a tela dizendo que hoje nao e o dia. Este e o bug silencioso.
  const resp = { hoy: 'hablamos-normal', nacimiento: '1990-05-10' };
  for (let d = 1; d <= 28; d++) {
    const dia = `2026-09-${String(d).padStart(2, '0')}`;
    setIdiomaMadre('pt');
    const esperado = planoDoDia(resp, { hoy: dia }).ritual.encaixe;
    for (const lang of TRADUZIDOS) {
      setIdiomaMadre(lang);
      const achado = planoDoDia(resp, { hoy: dia }).ritual.encaixe;
      assert.equal(achado.tipo, esperado.tipo, `o tipo do encaixe mudou em "${lang}" no dia ${dia}`);
      assert.equal(achado.fase, esperado.fase, `o bate-fase mudou em "${lang}" no dia ${dia}`);
    }
  }
});

// ===========================================================================
// 3 · A FRASE RENDERIZADA — a pergunta de quem le
// ===========================================================================

/* As palavras portuguesas que NAO podem aparecer numa frase em ES/EN. Sao os
 * nomes canonicos inteiros, e nao fragmentos: procurar 'Sol' soltaria falso
 * positivo em espanhol ('Sol' e a palavra castelhana), e procurar 'Lua' dentro
 * de palavra pegaria qualquer coisa. A comparacao e por PALAVRA. */
function vazamentosEm(frase, lang) {
  const proibidos = [];
  const canonicos = [...FASES, ...REGENTE_POR_DIA, ...SIGNOS];
  for (const nome of canonicos) {
    const rotulo =
      FASES.indexOf(nome) !== -1
        ? rotuloDaFase(nome)
        : REGENTE_POR_DIA.indexOf(nome) !== -1
          ? rotuloDoPlaneta(nome)
          : rotuloDoSigno(nome);
    // Nome cujo rotulo E igual ao canonico nao vaza: 'Libra' e 'Libra' nos tres
    // idiomas, e 'Marte' tambem em espanhol. Procura-los daria falso positivo.
    if (rotulo === nome) continue;
    if (frase.indexOf(nome) !== -1) proibidos.push(nome);
  }
  return proibidos;
}

test('em ES e EN, NENHUMA frase de ceu/sinastria contem nome proprio em portugues', () => {
  const resp = { hoy: 'hablamos-normal', nacimiento: '1990-05-10', genero: 'mujer' };
  for (const lang of TRADUZIDOS) {
    setIdiomaMadre(lang);

    /* Varre setembro inteiro: fases e marcos diferentes caem em dias diferentes,
     * e um unico dia fixo deixaria sete das oito fases sem conferencia. */
    for (let d = 1; d <= 30; d++) {
      const dia = `2026-09-${String(d).padStart(2, '0')}`;
      const p = planoDoDia(resp, { hoy: dia });
      const frases = [p.ritual.encaixe.motivo];
      if (p.ceu) {
        frases.push(p.ceu.linha);
        if (p.ceu.marco) frases.push(p.ceu.marco.linha);
      }
      for (const frase of frases) {
        assert.deepEqual(
          vazamentosEm(String(frase), lang),
          [],
          `"${lang}" ${dia}: frase hibrida -> ${frase}`
        );
      }
    }

    /* A sinastria: os 144 pares. `cama`/`conversa`/`briga` resolvem {el:...} pelo
     * NOME DO SIGNO, que era o quinto vazamento — 'Touro wants it done well'. */
    for (const a of SIGNOS) {
      for (const b of SIGNOS) {
        const r = ritmoDoPar(a, b);
        const frases = [
          t('plano.ritmo.par', {
            dela: rotuloDoSigno(a),
            daPessoa: rotuloDoSigno(b),
            figura: r.nomeAspecto,
          }),
          r.cama,
          r.conversa,
          r.briga,
        ];
        for (const frase of frases) {
          if (!frase) continue;
          assert.deepEqual(
            vazamentosEm(String(frase), lang),
            [],
            `"${lang}" ${a}+${b}: frase hibrida -> ${frase}`
          );
        }
      }
    }

    /* A lua no signo dela e a linha do dia — as duas frases que a tela compoe. */
    for (const s of SIGNOS) {
      const frase = t('plano.luaNoSigno', { signo: rotuloDoSigno(s) });
      assert.deepEqual(vazamentosEm(frase, lang), [], `"${lang}": ${frase}`);
    }
    const linhaDoDia = t('plano.tela.linhaDoDia', {
      diaSemana: lista('plano.semana.nomes')[5],
      dia: 11,
      mes: lista('ritual.meses')[8],
      regente: rotuloDoPlaneta(regenteDoDia('2026-09-11')),
      glifo: GLIFO_POR_PLANETA[regenteDoDia('2026-09-11')],
    });
    assert.deepEqual(vazamentosEm(linhaDoDia, lang), [], `"${lang}": ${linhaDoDia}`);
  }
});

test('a frase do revisor, nos tres idiomas, sai inteira no idioma certo', () => {
  // As tres frases exatas do relato. Elas nao assertam traducao bonita; assertam
  // que a palavra portuguesa saiu de dentro delas.
  const esperado = {
    pt: ['A Lua de hoje está em Lua Nova.', 'sexta-feira, dia de Vênus'],
    es: ['La Luna de hoy está en Luna Nueva.', 'viernes, día de Venus'],
    en: ["Today's Moon is in New Moon.", 'Friday, day of Venus'],
  };
  for (const lang of ['pt', 'es', 'en']) {
    setIdiomaMadre(lang);
    assert.equal(t('plano.ceu.fase', { fase: rotuloDaFase('Lua Nova') }), esperado[lang][0]);
    assert.equal(
      t('plano.encaixe.criterio.dia', {
        diaSemana: lista('plano.semana.nomes')[5],
        regente: rotuloDoPlaneta('Vênus'),
      }),
      esperado[lang][1]
    );
  }
});
