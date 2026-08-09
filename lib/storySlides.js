// O MODO HISTÓRIA — a leitura longa fatiada em slides, como stories.
//
// Por que este módulo existe (08/08/2026): as três leituras longas do app
// (Tarô de 3 cartas, Sonho, Compatibilidade) saem como parede de texto, e o
// concorrente entrega a mesma coisa em slides de um trecho por tela — barras
// de progresso em cima, toque à direita avança, à esquerda volta. O leitor é
// components/StoriesReader.js; AQUI mora só a fatia, porque fatiar texto é
// função pura e função pura roda em node:test sem Metro.
//
// A REGRA DA FATIA, na ordem em que ela decide:
//   1. Parágrafo ('\n\n') é a unidade natural: cada um vira um slide.
//   2. Parágrafo maior que o teto quebra em FIM DE FRASE (. ! ? …),
//      acumulando frases até o teto — nunca no meio de palavra nem de frase.
//   3. Frase única maior que o teto vira slide sozinha, inteira. Cortar uma
//      frase ao meio pra caber seria pior que um slide comprido (a mesma
//      decisão de quebrarEmLinhas em lib/shareCard.js, para palavra).
//
// E a diferença que importa em relação a encurtarParaCard (lib/shareCard.js):
// lá o card mostra o soco e DESCARTA o resto, porque o link traz a pessoa de
// volta pro app; aqui NADA é descartado — todo trecho vira slide, porque o
// modo história É o app mostrando a leitura inteira, só que respirável.

// Fim de frase: a pontuação final pode vir seguida de aspas/parênteses de
// fechamento ("...disse ele." — o fecho pertence à frase). O segundo ramo
// pega o rabo sem pontuação final (última frase de parágrafo sem ponto).
const RE_FRASES = /[^.!?…]+[.!?…]+[”"'’)\]]*\s*|[^.!?…]+$/g;

/**
 * Divide `texto` em slides de no máximo `teto` caracteres (exceto frase única
 * maior que o teto, que sai inteira). Devolve array de strings, sem vazios.
 * String vazia, null e undefined devolvem [].
 */
export function paraSlides(texto, teto = 240) {
  const paragrafos = String(texto || '')
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const slides = [];
  for (const paragrafo of paragrafos) {
    if (paragrafo.length <= teto) {
      slides.push(paragrafo);
      continue;
    }
    const frases = (paragrafo.match(RE_FRASES) || [paragrafo])
      .map((f) => f.trim())
      .filter(Boolean);
    let atual = '';
    for (const frase of frases) {
      const tentativa = atual ? `${atual} ${frase}` : frase;
      // `!atual` é a cláusula da frase gigante: sozinha ela SEMPRE entra,
      // mesmo estourando o teto — nunca se corta frase no meio.
      if (tentativa.length <= teto || !atual) {
        atual = tentativa;
      } else {
        slides.push(atual);
        atual = frase;
      }
    }
    if (atual) slides.push(atual);
  }
  return slides;
}
