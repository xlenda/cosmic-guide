// datos/traduzir.js
// A FUSAO: pega uma entrada de catalogo em portugues e costura por cima dela o
// texto do idioma ativo. Vinte linhas de codigo, uma funcao, nenhuma classe.
//
// ===========================================================================
// POR QUE ISTO EXISTE, SENDO QUE JA HA t()
// ===========================================================================
// datos/textos.js resolve CHAVE DE TELA: string plana, chave pontuada, um
// dicionario por idioma. Perfeito para 775 rotulos, e errado para conteudo
// longo — as missoes, as cartas, as leituras, os rituais sao ENTRADAS com forma
// (um objeto com nome, gesto, passos[], fonte{}), e achatar isso em 'ritual.cafe.
// comoFazer[2]' trocaria a forma que os testes e as telas ja leem por mil
// chaves soltas sem dono.
//
// Entao o conteudo longo mantem a forma e ganha tradutor por cima:
//   · o PT fica no arquivo ORIGINAL, intocado e congelado. Ele e a fonte da
//     verdade e e o que os testes de doutrina varrem como texto-fonte.
//   · cada idioma mora num vizinho ('x.es.js', 'x.en.js'), um mapa por id com
//     SO os campos de texto visivel.
//   · quem le chama o getter do original (getRitual, getDia, getFigura), e o
//     getter funde na hora da chamada, no idioma que estiver ativo.
//
// O FALLBACK E O MESMO DE t(), e nesta ordem: campo no idioma ativo -> campo em
// PT -> nada inventado. Traducao que falta mostra o PORTUGUES, que e verdadeiro.
// Campo que existe no PT e nao existe na traducao nunca desaparece da tela.
//
// POR QUE FUNDIR, E NAO SUBSTITUIR A ENTRADA INTEIRA: porque metade dos campos
// NAO se traduz e nao pode ser redigitada num arquivo de traducao —
//   id, clave, slug, tipo, grupo, rota   chaves tecnicas (id trocado = dado do
//                                        disco orfao, sem erro nenhum);
//   audio                                nome de arquivo .m4a, resolvido por
//                                        require ESTATICO pelo Metro;
//   obra, autor, quando                  citacao bibliografica REAL — titulo de
//                                        livro e nome de autor nao se traduzem,
//                                        e o ano nao muda;
//   precisaCamera, precisaContato,       os CAMPOS QUE MANDAM. A rede de contato
//   espeja, dia, duracion                le `precisaContato`, nao o texto: uma
//                                        traducao que o apagasse desligaria a
//                                        protecao da usuaria em silencio.
// Tudo isso vem do PT por construcao, porque a fusao so escreve por cima do que
// o arquivo de idioma TROUXE. O que ele nao traz, ele nao pode estragar.
//
// E a fusao e RASA DE PROPOSITO, com UMA excecao nomeada (`fonte`): um merge
// profundo generico andaria dentro de qualquer objeto e um dia escreveria em
// cima de um campo tecnico aninhado que ninguem previu. A excecao existe porque
// dentro de `fonte` ha um campo que E prosa da Madre — a `nota`, que diz o que a
// obra NAO sustenta — ao lado de tres que sao a citacao. A nota se traduz; obra,
// autor e quando ficam os do PT.
// ===========================================================================

import { IDIOMA_PADRAO, idiomaMadre } from './textos.js';

/**
 * A entrada do catalogo no idioma ativo.
 *
 * @param {object} base       a entrada em PT (ja congelada). Devolvida como esta
 *                            quando o idioma ativo e PT ou quando nao ha
 *                            traducao para ela — sem copia, sem objeto novo.
 * @param {object} porIdioma  { es: {<id>: {...}}, en: {...} } — os mapas dos
 *                            arquivos vizinhos.
 * @param {string} id         o id da entrada dentro daqueles mapas.
 * @returns {object} congelado. Nunca lanca, nunca devolve undefined para uma
 *   base valida, e nunca inventa texto: campo sem traducao fica em portugues.
 */
export function traduzido(base, porIdioma, id) {
  if (!base) return base;
  const lang = idiomaMadre();
  if (lang === IDIOMA_PADRAO) return base;

  const mapa = porIdioma && porIdioma[lang];
  const tr = mapa && mapa[id];
  if (!tr) return base;

  const saida = { ...base, ...limparVazios(tr) };

  /* A unica descida, e ela e nomeada: a `nota` de dentro de `fonte` e prosa da
   * Madre e se traduz; obra, autor e quando sao a citacao e ficam as do PT. */
  if (base.fonte && tr.fonte) saida.fonte = { ...base.fonte, ...limparVazios(tr.fonte) };

  return Object.freeze(saida);
}

/* String vazia NAO sobrescreve o portugues escondido: ela e defeito de traducao,
 * e o portao de cobertura e quem reclama dela. Mesmo criterio do `=== undefined`
 * de valorDe() em datos/textos.js. */
function limparVazios(obj) {
  const fora = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    fora[k] = v;
  }
  return fora;
}

export default traduzido;
