// Portao do REALCE POR FRASE FORA DO PORTUGUES.
//
// O defeito que este arquivo impede nao da erro, nao aparece em screenshot e
// nao quebra teste nenhum dos outros: a frase acende na hora ERRADA. Quem abre
// em espanhol ouve a Madre dizer uma coisa e ve outra linha brilhar. So percebe
// quem ouve e le ao mesmo tempo — e ai ja e tarde.
//
// A voz clonada (b8boGhcWbCyPtZnKW69X, eleven_multilingual_v2) fala os tres
// idiomas, entao desde a gravacao traduzida cada idioma tem os SEUS segundos em
// madremaria/datos/profunda-tempos.<lang>.json, gerado dos .tempos.json da
// propria gravacao por scripts/juntar-tempos-idioma.js.
//
// O que este arquivo segura:
//
//   1. os tempos de verdade, os que vao para a loja, ACENDEM: `trechosDe` no
//      idioma devolve as frases medidas, com `ini` de verdade, e nao os
//      paragrafos mudos da degradacao.
//   2. emendadas, essas frases dao de volta o texto traduzido do bloco, palavra
//      por palavra. E a mesma regra que o portugues cumpre desde sempre: o que
//      a tela desenha e o que a voz diz, inteiro, sem sobra nem falta.
//   3. um idioma nunca le o tempo do outro.
//   4. arquivo torto ou tempo ausente DEGRADAM (um trecho por paragrafo,
//      `ini: null`) em vez de desenhar errado.
import assert from 'node:assert/strict';
import test from 'node:test';

import TEMPOS_PT from '../madremaria/datos/profunda-tempos.json' with { type: 'json' };
import TEMPOS_EN from '../madremaria/datos/profunda-tempos.en.json' with { type: 'json' };
import TEMPOS_ES from '../madremaria/datos/profunda-tempos.es.json' with { type: 'json' };
import { PROFUNDA_EN } from '../madremaria/datos/profunda.en.js';
import { PROFUNDA_ES } from '../madremaria/datos/profunda.es.js';
import {
  BLOQUES_PROFUNDA,
  BLOQUES_PROFUNDA_B,
  _inyectarTemposParaTests,
  _reiniciarTemposParaTests,
  duracaoDe,
  paragrafosDe,
  trechosDe,
} from '../madremaria/datos/profunda.js';
import { setIdiomaMadre } from '../madremaria/datos/textos.js';

const achatar = (texto) => String(texto).replace(/\s+/g, ' ').trim();

const IDIOMAS = [
  ['es', PROFUNDA_ES, TEMPOS_ES],
  ['en', PROFUNDA_EN, TEMPOS_EN],
];

const TODOS = [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B];

test.afterEach(() => {
  _reiniciarTemposParaTests();
  setIdiomaMadre('pt');
});

test('os tempos que vao para a loja ACENDEM, nos dois idiomas', () => {
  let provados = 0;

  for (const [lang, dicionario, tabela] of IDIOMAS) {
    setIdiomaMadre(lang);

    for (const bloco of TODOS) {
      const medido = tabela[bloco.audio];
      const traduzido = dicionario[bloco.id];
      if (!medido || !traduzido) continue; // audio ainda nao gravado: e o caso da degradacao

      const trechos = trechosDe(bloco.id);

      assert.equal(
        trechos.length,
        medido.trechos.length,
        `[${lang}] ${bloco.id}: degradou em vez de acender — o JSON de tempos nao foi aceito`
      );
      for (const [i, tr] of trechos.entries()) {
        assert.ok(
          Number.isFinite(tr.ini) && Number.isFinite(tr.fim),
          `[${lang}] ${bloco.id}: frase ${i} veio sem tempo — a tela desenha, mas nada acende`
        );
      }

      // A regra da casa, agora nos tres idiomas: emendadas, as frases dao de
      // volta o texto do bloco. Uma frase perdida e um buraco na leitura de
      // quem so le — e esse e o produto de metade das pessoas, que abre isto no
      // onibus sem fone.
      assert.equal(
        achatar(trechos.map((tr) => tr.texto).join(' ')),
        achatar(traduzido.texto),
        `[${lang}] ${bloco.id}: o texto emendado das frases nao e o texto do bloco`
      );

      // O respiro do texto sobrevive: os paragrafos continuam sendo os mesmos.
      assert.equal(
        new Set(trechos.map((tr) => tr.paragrafo)).size,
        paragrafosDe(traduzido).length,
        `[${lang}] ${bloco.id}: as frases perderam a conta dos paragrafos`
      );

      // Mesma instancia em toda chamada: o hook tem os trechos numa lista de
      // dependencia, e um array novo por render reiniciaria o relogio do audio.
      assert.equal(trechosDe(bloco.id), trechos, `[${lang}] ${bloco.id}: instancia instavel`);
      provados += 1;
    }
  }

  // Sem isto o teste inteiro passaria por vacuidade no dia em que os dois JSON
  // voltassem a ser `{}` — verde, e o realce desligado em producao.
  assert.ok(provados >= 20, `so ${provados} blocos acenderam; esperados os 10 nos dois idiomas`);
});

test('cada idioma le os SEUS segundos — nunca os do vizinho', () => {
  // A prova e o proprio numero: espanhol e ingles nao duram o mesmo, e a
  // primeira frase de cada um fecha em segundo diferente. Se um lesse a tabela
  // do outro, este teste acusaria na hora.
  setIdiomaMadre('es');
  const es = trechosDe('profunda-7');
  setIdiomaMadre('en');
  const en = trechosDe('profunda-7');

  assert.equal(es[0].fim, TEMPOS_ES['profunda-7'].trechos[0].fim);
  assert.equal(en[0].fim, TEMPOS_EN['profunda-7'].trechos[0].fim);
  assert.notEqual(es[0].fim, en[0].fim, 'os dois idiomas cairam no mesmo segundo: tabela cruzada');
  assert.notEqual(es[0].texto, en[0].texto);
});

test('a duracao tambem e a do idioma — a barra nao corre na escala errada', () => {
  // `duracaoDe` e a reserva do progresso enquanto o player nao carregou. O mesmo
  // bloco dura ~51,5s em espanhol e ~54,2s em portugues: entregar a portuguesa
  // para quem ouve o espanhol faz a barra andar torta justamente nos primeiros
  // segundos, que e quando ela serve para alguma coisa.
  for (const [lang, , tabela] of IDIOMAS) {
    setIdiomaMadre(lang);
    for (const bloco of TODOS) {
      const medido = tabela[bloco.audio];
      if (!medido) continue;
      assert.equal(
        duracaoDe(bloco.audio),
        medido.duracao,
        `[${lang}] ${bloco.audio}: a duracao veio de outro idioma`
      );
    }
  }

  setIdiomaMadre('pt');
  assert.equal(duracaoDe('profunda-7'), TEMPOS_PT['profunda-7'].duracao);

  // Sem gravacao no idioma o botao nem aparece (lib/audios.js devolve null),
  // entao nao ha o que cronometrar: 0 honesto, nunca o segundo portugues.
  _inyectarTemposParaTests('es', {});
  setIdiomaMadre('es');
  assert.equal(duracaoDe('profunda-7'), 0, 'devolveu a duracao do audio que ninguem vai ouvir');
});

test('o portugues nao foi tocado', () => {
  setIdiomaMadre('pt');
  for (const bloco of TODOS) {
    const trechos = trechosDe(bloco.id);
    assert.ok(trechos.length > 0, `${bloco.id}: ficou sem frase`);
    assert.ok(
      Number.isFinite(trechos[0].ini),
      `${bloco.id}: o portugues perdeu os proprios tempos`
    );
    assert.equal(
      achatar(trechos.map((tr) => tr.texto).join(' ')),
      achatar(bloco.texto),
      `${bloco.id}: o texto emendado deixou de ser o texto do bloco`
    );
  }
});

/* ---------------------------------------------------------------------------
   OS CAMINHOS DE DEGRADACAO
   ---------------------------------------------------------------------------
   Estes tres precisam de dado RUIM, que por definicao nao esta no arquivo que
   vai para a loja. Por isso a tabela e injetada — e so ela: idioma, cache,
   chave do audio e a checagem palavra por palavra continuam sendo o codigo de
   producao. Plantar esses defeitos dentro do JSON de verdade seria estragar o
   produto para o teste ter o que provar.
   --------------------------------------------------------------------------- */

test('idioma sem gravacao degrada em paragrafo mudo — nunca desenha errado', () => {
  _inyectarTemposParaTests('es', {});
  setIdiomaMadre('es');

  const trechos = trechosDe('profunda-7');
  assert.equal(
    trechos.length,
    paragrafosDe(PROFUNDA_ES['profunda-7']).length,
    'sem tempo, o retorno tem de ser um trecho por paragrafo'
  );
  for (const tr of trechos) assert.equal(tr.ini, null);
  // Mudo, mas inteiro: quem so le nao pode receber um produto menor.
  assert.equal(
    achatar(trechos.map((tr) => tr.texto).join(' ')),
    achatar(PROFUNDA_ES['profunda-7'].texto)
  );
});

test('tempos medidos contra OUTRA traducao degradam em vez de desenhar errado', () => {
  // O caso que nao da erro nenhum: alguem reescreveu uma frase do espanhol e
  // nao regravou. Os numeros seguem validos (crescentes, finitos), so o TEXTO e
  // de ontem — e sem a checagem palavra por palavra a tela acenderia, com toda
  // a confianca, o espanhol antigo.
  const medido = structuredClone(TEMPOS_ES['profunda-7']);
  medido.trechos[2].texto = 'Una frase que ya no existe en el bloque.';
  _inyectarTemposParaTests('es', { 'profunda-7': medido });
  setIdiomaMadre('es');

  const trechos = trechosDe('profunda-7');
  assert.equal(
    trechos.length,
    paragrafosDe(PROFUNDA_ES['profunda-7']).length,
    'o arquivo torto passou: a tela vai acender a traducao antiga'
  );
  for (const tr of trechos) assert.equal(tr.ini, null);
});

test('tempo AUSENTE degrada — nao vira o segundo zero', () => {
  // O gerador escreve `"ini": null` quando o alinhamento falha numa frase. Isso
  // passava batido: `Number(null)` e 0, e 0 e finito. As frases entravam com
  // tempo "bom" comecando no segundo zero, e o realce ficava parado na ultima
  // desde o primeiro instante do audio — sem erro nenhum, em portugues tambem.
  const medido = structuredClone(TEMPOS_ES['profunda-7']);
  medido.trechos[3].ini = null;
  medido.trechos[3].fim = null;
  _inyectarTemposParaTests('es', { 'profunda-7': medido });
  setIdiomaMadre('es');

  const trechos = trechosDe('profunda-7');
  assert.equal(
    trechos.length,
    paragrafosDe(PROFUNDA_ES['profunda-7']).length,
    'a frase sem tempo passou como se comecasse em 0s'
  );
  for (const tr of trechos) assert.equal(tr.ini, null);
});
