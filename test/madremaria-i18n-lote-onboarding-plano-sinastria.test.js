// O LOTE DA ONDA 2: datos/preguntas.js, datos/plano.js e datos/sinastria.js nos
// TRES idiomas — as 7 perguntas do onboarding, o plano do dia e o ritmo do par.
//
// O QUE ESTE PORTAO MEDE, E QUE NENHUM OUTRO MEDIA
// ================================================================================
// test/madremaria-promessa-tres-idiomas.js ja varre os seis arquivos do disco e
// reprova promessa de desfecho em qualquer idioma. O que ele NAO ve e a FIACAO:
// um vizinho .es.js perfeito, com o motor ainda lendo a constante portuguesa,
// passa por ele VERDE e chega na loja com o conteudo em portugues e a tela em
// espanhol. Foi exatamente esse o bug que este arquivo pegou por mutacao em
// lib/sinastria.js (nomeAspecto e comoFalar voltaram a ler a constante PT: tres
// idiomas colapsaram em 2 textos distintos em vez de 6).
//
// E mede a outra metade: que a traducao NAO mexeu no que nao e texto —
//   · os ids de pergunta e de OPCAO (IDS_CONTACTO_DURO e IDS_GENERO importam
//     daqueles ids; um id traduzido desligaria a protecao de quem esta em
//     contato zero, em silencio, so naquele idioma);
//   · `tipo`, `largo`, a ORDEM das sete perguntas;
//   · `id`, `camera` e `momento.fasesLua` do ritual — os nomes de fase casam
//     BYTE A BYTE com FASES de lib/ceu.js, e 'Luna Llena' pararia de casar sem
//     erro nenhum;
//   · o COMPRIMENTO das tres listas do plano (5/7/11/4): a rotacao de
//     lib/plano.js e aritmetica de dia sobre o indice, e cinco, sete e onze sao
//     primos entre si de proposito. Uma lista espanhola com dez afirmacoes faria
//     o dia 12 repetir o dia 1.
//
// MUTACAO (obrigatoria): lib/sinastria.js revertido para as constantes PT ->
// VERMELHO em 'SINASTRIA' (actual: 2, expected: 6). Desfeito -> 5/5 verde,
// arquivo byte-identico.
//
// PROVA DO LOTE: o conteudo das 7 perguntas, do plano e da sinastria TROCA de
// idioma quando setIdiomaMadre muda, e os contratos tecnicos nao se movem.
// __dirname e nao import.meta (alvo Hermes, ver o cabecalho dos outros testes).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { setIdiomaMadre } from '../madremaria/datos/textos.js';
import {
  IDS_CONTACTO_DURO, IDS_GENERO, PREGUNTAS, pantallaCero, preguntas, pregunta,
} from '../madremaria/datos/preguntas.js';
import { RITUAIS, REFLEXOES, AFIRMACOES, ENCONTROS, rituais, lista } from '../madremaria/datos/plano.js';
import { ritmoDoPar } from '../madremaria/lib/sinastria.js';
import { planoDoDia, _rotacaoDe } from '../madremaria/lib/plano.js';

const idiomas = ['pt', 'es', 'en'];

test('PREGUNTAS: texto troca, id/tipo/ordem nao', () => {
  const vistos = new Set();
  for (const lang of idiomas) {
    setIdiomaMadre(lang);
    const P = preguntas();
    assert.equal(P.length, 7, lang);
    assert.deepEqual(P.map((p) => p.id), PREGUNTAS.map((p) => p.id), `ordem/ids em ${lang}`);
    assert.deepEqual(P.map((p) => p.tipo), PREGUNTAS.map((p) => p.tipo), `tipos em ${lang}`);
    // os ids de OPCAO sao o contrato do motor — IDS_CONTACTO_DURO depende deles
    for (let i = 0; i < 7; i++) {
      const orig = PREGUNTAS[i];
      if (Array.isArray(orig.opciones)) {
        assert.deepEqual(P[i].opciones.map((o) => o.id), orig.opciones.map((o) => o.id),
          `ids de opcao de ${orig.id} em ${lang}`);
      }
      if (Array.isArray(orig.campos)) {
        assert.deepEqual(P[i].campos.map((c) => c.id), orig.campos.map((c) => c.id));
        assert.deepEqual(P[i].campos.map((c) => c.largo), orig.campos.map((c) => c.largo));
      }
    }
    // o filtro duro continua apontando para opcoes que EXISTEM
    const idsHoy = P.find((p) => p.id === 'hoy').opciones.map((o) => o.id);
    for (const id of IDS_CONTACTO_DURO) assert.ok(idsHoy.includes(id), `${id} em ${lang}`);
    for (const id of IDS_GENERO) {
      assert.ok(P.find((p) => p.id === 'genero').opciones.some((o) => o.id === id));
    }
    vistos.add(P[0].texto);
    vistos.add(pantallaCero().titulo);
  }
  // tres idiomas, tres textos DIFERENTES (se a fiacao nao funcionasse, seria 1)
  assert.equal(vistos.size, 6, [...vistos].join(' | '));
});

test('PERGUNTA POR ID: o espelho do Perfil fala no idioma ativo', () => {
  setIdiomaMadre('es');
  assert.equal(pregunta('hoy').opciones.find((o) => o.id === 'bloqueo').texto, 'Hay un bloqueo en el medio');
  setIdiomaMadre('en');
  assert.equal(pregunta('hoy').opciones.find((o) => o.id === 'bloqueo').texto, 'There is a block in the middle');
  setIdiomaMadre('pt');
  assert.equal(pregunta('hoy').opciones.find((o) => o.id === 'bloqueo').texto, 'Tem um bloqueio no meio');
});

test('PLANO: comprimento e ordem intocados, texto trocado, momento/id/camera do PT', () => {
  for (const lang of idiomas) {
    setIdiomaMadre(lang);
    const R = rituais();
    assert.equal(R.length, RITUAIS.length, lang);
    assert.deepEqual(R.map((r) => r.id), RITUAIS.map((r) => r.id), `ids em ${lang}`);
    assert.deepEqual(R.map((r) => r.camera), RITUAIS.map((r) => r.camera), `camera em ${lang}`);
    // o momento e NOME CANONICO de lib/ceu.js: tem de sair em portugues sempre
    assert.deepEqual(R.map((r) => r.momento.fasesLua), RITUAIS.map((r) => r.momento.fasesLua), `fasesLua em ${lang}`);
    assert.deepEqual(R.map((r) => r.momento.diasSemana), RITUAIS.map((r) => r.momento.diasSemana));
    assert.equal(lista('REFLEXOES').length, REFLEXOES.length, `reflexoes em ${lang}`);
    assert.equal(lista('AFIRMACOES').length, AFIRMACOES.length, `afirmacoes em ${lang}`);
    assert.equal(lista('ENCONTROS').length, ENCONTROS.length, `encontros em ${lang}`);
  }
  // a rotacao do dia nao se mexe com o idioma: e aritmetica de dia, nao de texto
  const r = idiomas.map((l) => { setIdiomaMadre(l); return _rotacaoDe('2026-09-12'); });
  assert.deepEqual(r[0], r[1]);
  assert.deepEqual(r[0], r[2]);
});

test('PLANO na saida: o dia sai no idioma ativo, e o travado continua travado', () => {
  const duro = { hoy: 'cero-contacto' };
  const livre = { hoy: 'hablamos' };
  const textos = new Set();
  for (const lang of idiomas) {
    setIdiomaMadre(lang);
    const p = planoDoDia(livre, { hoy: '2026-09-11' });
    textos.add(p.ritual.acao);
    assert.equal(planoDoDia(duro, { hoy: '2026-09-11' }).encontro.estado, 'travado', lang);
  }
  assert.equal(textos.size, 3, [...textos].join(' | '));
});

test('SINASTRIA: o ritmo do par troca de idioma e o {el:...} nao vaza', () => {
  const vistos = new Set();
  for (const lang of idiomas) {
    setIdiomaMadre(lang);
    const r = ritmoDoPar('Áries', 'Câncer'); // fogo + agua, par misto: tem placeholder
    for (const campo of ['cama', 'camaFigura', 'conversa', 'briga', 'comoFalar', 'nomeAspecto']) {
      assert.ok(r[campo] && r[campo].length > 5, `${campo} vazio em ${lang}`);
      assert.doesNotMatch(r[campo], /\{el:/, `placeholder nao resolvido em ${lang}: ${r[campo]}`);
    }
    vistos.add(r.nomeAspecto);
    vistos.add(r.comoFalar);
  }
  assert.equal(vistos.size, 6, [...vistos].join(' | '));
  setIdiomaMadre('pt');
});
