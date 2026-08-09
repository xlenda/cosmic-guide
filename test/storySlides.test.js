// O MODO HISTÓRIA — a fatia em slides, travada.
//
// O que quebraria calado sem estes testes: uma frase cortada no meio vira
// slide que termina em "e então a" — a pior cara possível pra uma leitura que
// a pessoa pagou pra ler. E um trecho DESCARTADO na fatia é pior ainda: o modo
// história é a mesma leitura reformatada, então perder uma frase é mentir por
// omissão. Os dois contratos (nunca cortar, nunca perder) estão aqui.
import test from 'node:test';
import assert from 'node:assert/strict';
import { paraSlides } from '../lib/storySlides.js';

// Normaliza espaços pra comparar conteúdo sem depender de onde a fatia caiu.
const plano = (slides) => slides.join(' ').replace(/\s+/g, ' ').trim();

test('texto curto vira exatamente 1 slide, intacto', () => {
  const texto = 'Uma leitura curta que cabe inteira num slide só.';
  assert.deepEqual(paraSlides(texto), [texto]);
});

test('multi-parágrafo: um slide por parágrafo, na ordem', () => {
  const slides = paraSlides('Primeiro parágrafo.\n\nSegundo parágrafo.\n\nTerceiro.');
  assert.deepEqual(slides, ['Primeiro parágrafo.', 'Segundo parágrafo.', 'Terceiro.']);
});

test('parágrafo longo quebra em fim de frase — nenhum slide estoura o teto', () => {
  const frases = [
    'A primeira frase fala do passado e do que ficou pra trás.',
    'A segunda frase fala do presente e do que está na mesa agora.',
    'A terceira frase fala do futuro e do que ainda pode mudar.',
    'A quarta frase amarra as três casas numa leitura só!',
    'E a quinta pergunta o que você faz com isso?',
  ];
  const texto = frases.join(' ');
  const teto = 130;
  const slides = paraSlides(texto, teto);

  assert.ok(slides.length > 1, 'parágrafo maior que o teto tem que virar mais de um slide');
  for (const s of slides) {
    assert.ok(s.length <= teto, `slide estourou o teto (${s.length} > ${teto}): "${s}"`);
    // Quebra em FIM DE FRASE: todo slide termina em pontuação final.
    assert.match(s, /[.!?…]$/, `slide cortado no meio da frase: "${s}"`);
  }
  // Reconstrução: nada perdido, nada duplicado, nada fora de ordem.
  assert.equal(plano(slides), texto);
  for (const f of frases) {
    assert.ok(plano(slides).includes(f), `frase perdida na fatia: "${f}"`);
  }
});

test('frase única maior que o teto vira slide sozinha, sem corte', () => {
  const gigante =
    'Esta frase foi escrita comprida de propósito para não caber em teto nenhum e provar que o fatiador nunca corta uma frase no meio só para obedecer a régua.';
  assert.ok(gigante.length > 100);
  const slides = paraSlides(gigante, 100);
  assert.deepEqual(slides, [gigante], 'a frase gigante tem que sair inteira, num slide só');
});

test('frase gigante no meio de um parágrafo longo não arrasta as vizinhas', () => {
  const curta1 = 'Abre curto.';
  const gigante =
    'Agora vem uma frase deliberadamente comprida que passa sozinha do teto escolhido para este teste e portanto precisa sair num slide próprio sem corte nenhum.';
  const curta2 = 'Fecha curto.';
  const slides = paraSlides([curta1, gigante, curta2].join(' '), 80);
  assert.ok(slides.includes(gigante), 'a gigante sai inteira num slide próprio');
  assert.equal(plano(slides), `${curta1} ${gigante} ${curta2}`);
});

test('vazio, espaços e null devolvem [] sem explodir', () => {
  assert.deepEqual(paraSlides(''), []);
  assert.deepEqual(paraSlides('   '), []);
  assert.deepEqual(paraSlides(null), []);
  assert.deepEqual(paraSlides(undefined), []);
  assert.deepEqual(paraSlides('\n\n\n\n'), []);
});

test('parágrafos vazios no meio do texto não viram slide fantasma', () => {
  const slides = paraSlides('Um.\n\n\n\n  \n\nDois.');
  assert.deepEqual(slides, ['Um.', 'Dois.']);
});

test('o corpo real do app (título com \\n dentro do parágrafo) fica no mesmo slide', () => {
  // CompatibilityScreen junta "Título\nTexto" com '\n\n' entre dimensões — o
  // '\n' simples é quebra de linha DENTRO do slide, não fronteira de slide.
  const corpo = 'Química e cama\nA química vem fácil aqui.\n\nConversa\nA conversa flui.';
  const slides = paraSlides(corpo);
  assert.deepEqual(slides, ['Química e cama\nA química vem fácil aqui.', 'Conversa\nA conversa flui.']);
});
