// O BOTÃO "OUVIR" — teste do que é PURO em lib/voz.js: a quebra em frases que
// alimenta a fila de utterances (armadilha 2 do cabeçalho de lá: Chrome
// desktop pausa utterance longa ~15s, então cada frase vira uma utterance).
//
// O que NÃO se testa aqui, de propósito: speechSynthesis em si. É API de
// browser — em node:test não existe window, vozDisponivel() devolve false e
// falar()/parar()/falando() degradam pra no-op. Testar isso seria mockar o
// browser pra ver o mock funcionar.
const test = require('node:test');
const assert = require('node:assert/strict');
const { quebraEmFrases, vozDisponivel } = require('../lib/voz.js');

test('nenhuma frase se perde — o join reconstrói o texto original byte a byte', () => {
  const textos = [
    'Olá. Tudo bem? Sim! O céu de hoje… muda tudo.',
    'Primeira frase. Segunda sem ponto final',
    'Frase com fecho ("assim dizia ele.") e mais uma depois. Fim!',
    'A Lua está em Escorpião — fase minguante. Marte rege o dia. Observa o que encerra.',
  ];
  for (const texto of textos) {
    const frases = quebraEmFrases(texto);
    assert.ok(frases.length >= 2, `esperava 2+ frases em: ${texto}`);
    assert.equal(frases.join(''), texto, `o join não reconstruiu: ${texto}`);
  }
});

test('texto curto sem pontuação final vira exatamente 1 item, inteiro', () => {
  assert.deepEqual(quebraEmFrases('só uma frase sem ponto'), ['só uma frase sem ponto']);
  assert.deepEqual(quebraEmFrases('Uma frase com ponto.'), ['Uma frase com ponto.']);
});

test('vazio, null e undefined viram []', () => {
  assert.deepEqual(quebraEmFrases(''), []);
  assert.deepEqual(quebraEmFrases(null), []);
  assert.deepEqual(quebraEmFrases(undefined), []);
});

test('texto que não casa com o regex (só pontuação) sai inteiro em vez de sumir', () => {
  assert.deepEqual(quebraEmFrases('...'), ['...']);
});

test('em node não há Web Speech API — vozDisponivel() é false e nada explode', () => {
  assert.equal(vozDisponivel(), false);
});
