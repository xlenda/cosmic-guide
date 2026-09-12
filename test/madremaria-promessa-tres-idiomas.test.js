// test/madremaria-promessa-tres-idiomas.test.js
//
// O PORTAO DA DOUTRINA NOS TRES IDIOMAS.
//
// ===========================================================================
// O BURACO QUE ESTE ARQUIVO FECHA
// ===========================================================================
// A doutrina de madremaria/theme.js:80 diz, no CONTRATO DE PRODUTO, item 1:
//
//     "A leitura descreve o que a carta mostra e devolve uma acao para a
//      usuaria. Nunca um desfecho, nunca uma promessa sobre o que a outra
//      pessoa vai fazer."
//
// Ela e cobrada hoje por SETE portoes espalhados, e TODOS eles tem lista de
// padrao escrita contra o PORTUGUES (ou, em um caso, contra o espanhol legado
// do baralho). Inventario do que existia antes deste arquivo:
//
//   test/madremaria-celula.test.js:19        PROIBIDAS  — /vai voltar/, /garant/,
//                                           /alma gemea/, /destino/, /%/ ... so PT.
//                                           Varre FRASES e as 419 missoes.
//   test/madremaria-ano.test.js:654          AFIRMA_DESFECHO — /voltara/, /vai
//                                           voltar/, /reconquist/ ... so PT.
//                                           Varre AFIRMACOES (31+).
//   test/madremaria-diagnostico.test.js:99   PROIBIDO — /voltara/, /vai voltar/,
//                                           /com certeza/ ... so PT. Varre a
//                                           saida do diagnostico.
//   test/madremaria-contenido.test.js:89     PROIBIDO — /volvera/, /va a volver/,
//                                           /garantiza/ ... so ES (o baralho
//                                           nasceu em espanhol). Varre cartas.json.
//   test/madremaria-gamificacao.test.js:397  usa hablaDelFuturo() nos titulos e
//                                           pistas de missao.
//   madremaria/lib/lectura.js:422            hablaDelFuturo() — morfologia de
//                                           futuro PT+ES (-ra/-rao/-ran). NAO
//                                           cobre ingles: "will come back" nao
//                                           tem terminacao nenhuma para morder.
//   madremaria/lib/lectura.js:416            sugiereContacto() — PT+ES.
//
// Conclusao medida: um "volvera" espanhol passa por SEIS dos sete (so o que
// herdou o espanhol legado o pegaria, e ele varre apenas cartas.json); um
// "will come back" ingles passa por TODOS OS SETE. Quando textos.es.js e
// textos.en.js sairem do vazio, e quando os arquivos de conteudo ganharem seus
// vizinhos .es.js/.en.js, dois tercos do app ficam sem guarda — e o espanhol e
// o publico ORIGINAL deste funil.
//
// Este arquivo NAO inventa doutrina nova. Ele pega a mesma regra dos sete
// portoes acima e a escreve nas tres linguas, sobre TODA a superficie visivel.
//
// ===========================================================================
// O QUE ELE VARRE (e por que a descoberta e DINAMICA)
// ===========================================================================
//   1. OS DICIONARIOS DE TELA — PT (objeto no proprio datos/textos.js), ES
//      (datos/textos.es.js) e EN (datos/textos.en.js), lidos por
//      _DICTS_PARA_TESTE. Hoje ES/EN estao vazios: o portao passa por vacuidade
//      e ACORDA sozinho na primeira chave traduzida. Nao ha lista de chave aqui.
//
//   2. OS ARQUIVOS DE CONTEUDO — datos/*.js varridos do DISCO, nao de uma lista
//      escrita a mao. O PT de hoje (missoes365, lenormand, bancos, lecturas,
//      lunacoes, hechos, rituais, ritual, fases, preguntas, profunda, sinastria,
//      plano, escada, frases) e, no minuto em que existirem, os vizinhos
//      missoes365.es.js, missoes365.en.js, lenormand.es.js e o resto.
//
//      POR QUE DINAMICO, e nao uma lista: uma lista escrita hoje nao conhece os
//      arquivos que a Onda 2 vai criar. O tradutor que cria lenormand.en.js
//      amanha nao tem como saber que precisa vir aqui adicionar o nome dele — e
//      a falha desse esquecimento e SILENCIOSA (portao verde, arquivo sem
//      guarda, promessa na loja). A descoberta pelo disco e o conserto de raiz:
//      arquivo novo em datos/ ja nasce varrido.
//
//      O IDIOMA DE CADA ARQUIVO sai do NOME: `x.es.js` e espanhol, `x.en.js` e
//      ingles, `x.js` e portugues. Mesma convencao de textos.es.js/textos.en.js,
//      que a Onda 1 ja fixou, e de cartas.es.json.
//
// ===========================================================================
// O QUE ELE **NAO** VARRE, e cada exclusao tem um motivo verificado
// ===========================================================================
//   · CHAVES TECNICAS (id, clave, slug, tipo, grupo, rota, variante...) — nao
//     sao texto visivel. 'volver-a-empezar' como id de capitulo e dado, nao copy.
//   · audio — nome de arquivo .m4a resolvido por require estatico do Metro.
//   · fonte/fuente/obra/autor/quando — CITACAO BIBLIOGRAFICA REAL. "Telling
//     Fortunes by Tea Leaves" (Cicely Kent, Londres 1922) e "A Manual of
//     Cheirosophy" sao livros que existem; `autor` e nome de pessoa e `quando` e
//     lugar+ano. Nenhum dos tres se traduz, e nenhum dos tres pode casar com um
//     padrao de promessa — sao nome proprio e data.
//     ATENCAO: `nota` DENTRO de fonte NAO e excluida — ela e prosa da Madre
//     sobre a obra (o que a fonte NAO sustenta), e prosa se traduz e se vigia.
//   · 'Madre Maria' — nome proprio. Nao e promessa em nenhum idioma.
//
// ===========================================================================
// O FALSO POSITIVO QUE NAO PODEMOS COMETER
// ===========================================================================
// "reconquista" (PT/ES) e "comeback" (EN) NOMEIAM o que a PESSOA faz, e sao o
// assunto do produto: o titulo aprovado pelo dono e "Sua reconquista comeca
// aqui". Proibir a PALAVRA reprovaria o proprio titulo honesto — e o proximo
// agente, vendo o portao acusar copy aprovada, afrouxaria o portao INTEIRO.
//
// Entao: proibimos a PROMESSA, nunca a palavra. "sua reconquista" passa.
// "reconquiste em 30 dias" nao. "lo recuperaras" nao. A regra e a gramatica da
// garantia (futuro cujo sujeito e a outra pessoa, prazo, selo de certeza), nao
// o vocabulario do nicho. O bloco 7-bis deste arquivo e a trava disso: ele
// exige que o titulo aprovado PASSE, e existe para que um falso positivo seja
// consertado ESTREITANDO a formula, nunca afrouxando o portao.
//
// NOTA: test/madremaria-ano.test.js:661 proibe /\breconquist/ inteiro — mas so
// sobre AFIRMACOES, que sao a frase do dia na PRIMEIRA PESSOA ("Eu vou
// reconquistar o que era meu" e promessa a si mesma). Regra estreita e
// deliberada, de uma superficie so. Este portao e amplo e por isso NAO herda
// aquela: se herdasse, reprovaria o titulo da Home.
//
// ===========================================================================
// PROVA POR MUTACAO
// ===========================================================================
// Os blocos 7 e 7-bis plantam promessa nos TRES idiomas e exigem que a
// varredura MORDA, e plantam copy honesta e exigem que ela PASSE. Sem eles uma
// regex quebrada deixaria o portao verde para sempre, e decoracao neste lugar
// especifico e pior que nada: da a sensacao de que ha guarda.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { IDIOMAS, _DICTS_PARA_TESTE } from '../madremaria/datos/textos.js';

/* FUSAO COSMIC GUIDE: o pipeline transpila para CommonJS com alvo Hermes, que
 * rejeita `import.meta`. __dirname existe nesse alvo. Mesmo criterio de
 * test/madremaria-contenido.test.js. */
const DATOS = join(__dirname, '..', 'madremaria', 'datos');
const LIB = join(__dirname, '..', 'madremaria', 'lib');

/* =====================================================================
 * 1 · AS FORMULAS DA PROMESSA, UMA LISTA POR IDIOMA
 * =====================================================================
 * Cada entrada tem `re` (o padrao) e `diz` (o nome humano da formula), porque a
 * mensagem de falha precisa dizer QUAL formula casou — quem le tem de poder
 * consertar sem investigar.
 *
 * Escritas como quem escreve MAL: o tradutor apressado, o copywriter de funil
 * que quer converter, o agente que traduz literal sem ler a doutrina. */

/* =====================================================================
 * 1-bis · A FRONTEIRA DE PALAVRA QUE FUNCIONA COM ACENTO
 * =====================================================================
 * A ARMADILHA, medida: em JavaScript `\b` usa a definicao ASCII de `\w`
 * ([A-Za-z0-9_]). `ê`, `ç`, `á`, `ñ` NAO sao caractere de palavra para o motor.
 * Consequencia: `\b` encostado num caractere acentuado nunca casa onde deveria,
 * e casa onde nao deveria. Medido neste arquivo:
 *
 *     /\b(?:volta)\s+(?:para)\s+(?:voc[eê])\b/i
 *        .test('volta para voce')  -> true    (grafia SEM acento)
 *        .test('volta para você')  -> FALSE   (a grafia que a copy real usa)
 *
 *     /\bvoltar[aá]\b/i.test('voltará')       -> FALSE
 *     /\bél/i          .test('él vuelve')     -> FALSE
 *
 * Ou seja: a promessa mais provavel de aparecer na copy real passava batido,
 * exatamente nas formulas escritas para pega-la. Nove formulas tinham o defeito
 * (PT: "volta pra voce", "traga ele de volta pra voce", "de volta pra sua
 * vida", "com certeza da", "o destino trara"; ES: "el va a", "el te buscara",
 * "seguro que volvera", "el destino lo traera"). O EN e imune — foi varrido
 * junto e nao tem nenhuma —, mas nasce protegido pelo mesmo helper.
 *
 * O CONSERTO DE RAIZ, e por que ele e neste lugar e nao em cada formula:
 * `\b` depois de acento e uma armadilha que qualquer pessoa repete, porque o
 * padrao LE certo. Consertar as nove regex uma a uma deixaria a decima nascer
 * errada. Entao a fronteira sai das formulas e passa a ser responsabilidade do
 * construtor P(): quem escreve a formula escreve so o MIOLO, sem `\b`, e a
 * fronteira correta e montada aqui. A formula seguinte nasce certa de graca.
 *
 * A fronteira e `(?:^|[^\p{L}\p{N}_])` ... `(?![\p{L}\p{N}_])` com a flag `u`:
 * inicio de cadeia ou um caractere que nao e letra/numero em NENHUM alfabeto.
 * E a definicao de `\b` que o `\b` deveria ter tido.
 *
 * NAO e lookbehind. `(?<=` da tela branca em Safari < 16.4 e esta proibido no
 * projeto; a fronteira esquerda CONSOME um caractere, que e por isso que
 * `violacoesDe()` reporta `m[0]` podendo comecar com o espaco anterior — custo
 * aceito, a mensagem de falha continua legivel.
 *
 * O bloco 7-ter e a prova por mutacao desta funcao: ele exige que toda formula
 * desta lista case a propria grafia ACENTUADA, e e o teste que impede a
 * armadilha de voltar em qualquer idioma. */

/** Fronteira esquerda: inicio de cadeia, ou um caractere que nao e letra. */
const FRONT_ESQ = '(?:^|[^\\p{L}\\p{N}_])';
/** Fronteira direita: nao seguido de letra. */
const FRONT_DIR = '(?![\\p{L}\\p{N}_])';

/** Monta uma formula da promessa.
 *  @param corpo string — o MIOLO do padrao, sem `\b` e sem fronteira. Pode
 *    conter qualquer sintaxe de regex (alternancia, classe, \s+, lookahead).
 *  @param diz string — o nome humano da formula, para a mensagem de falha.
 *
 *  NAO escreva `\b` aqui. Se precisar de fronteira no MEIO do padrao (raro),
 *  use FRONT_ESQ / FRONT_DIR explicitamente — nunca `\b`. */
const P = (corpo, diz) => {
  if (/\\[bB]/.test(corpo)) {
    throw new Error(
      `A formula "${diz}" usa \\b. Em JS \\b e ASCII: ele NAO casa encostado em `
      + 'letra acentuada (medido: /voc[eê]\\b/ nao pega "você"). A fronteira ja e '
      + 'montada por P() — escreva so o miolo do padrao. Ver o bloco 1-bis.'
    );
  }
  return { re: new RegExp(`${FRONT_ESQ}(?:${corpo})${FRONT_DIR}`, 'iu'), diz, corpo };
};

/** Formula cuja fronteira DIREITA nao se aplica: o padrao termina num curinga
 *  (`\w+`, `\d`) ou num lookahead proprio, e exigir "nao seguido de letra"
 *  depois disso mataria o padrao. A fronteira ESQUERDA continua correta.
 *  Usado pelas formulas de sujeito-mais-futuro ("ela vai ...") e de prazo. */
const P_ABERTA = (corpo, diz) => {
  if (/\\[bB]/.test(corpo)) {
    throw new Error(`A formula "${diz}" usa \\b — ver o bloco 1-bis.`);
  }
  return { re: new RegExp(`${FRONT_ESQ}(?:${corpo})`, 'iu'), diz, corpo, aberta: true };
};

// --------------------------------------------------------------------------
// PORTUGUES
// --------------------------------------------------------------------------
const PROMESSA_PT = Object.freeze([
  // O desfecho nomeado: a outra pessoa voltando.
  P('vai\\s+(?:voltar|retornar|regressar)', 'futuro perifrastico de volta: "vai voltar"'),
  P('(?:volta|retorna|regressa)r[aá]', 'futuro sintetico de volta: "voltara"'),
  P('(?:volta|retorna|regressa)r[aã]o', 'futuro plural de volta: "voltarao"'),
  /* ESTREITADO POR SUJEITO (ver o bloco 3-ter). O miolo continua "volta pra
   * voce", mas a varredura desarma esta formula quando a frase nomeia a COISA
   * que ela escreveu — e o que acontece em ritual.js:130 e textos.js:998. */
  P('(?:volta|retorna|regressa)\\s+(?:pra|para)\\s+(?:voc[eê]|ti)',
    'desfecho declarado: "volta pra voce"'),
  /* ESTREITADO depois de medir. A forma larga ("traga" + pronome solto) acusava
   * datos/frases.js:83 — "Preocupacao e imaginacao apontada pro lugar errado.
   * Traga ELA de volta pra mesa", onde "ela" e a IMAGINACAO da frase anterior, e
   * "a mesa" e o almoco da usuaria. O objeto agora tem de ser a outra pessoa
   * NOMEADA, ou o destino tem de ser a usuaria. */
  P('(?:traga|tragam|trarei|trar[aá]|vou\\s+trazer|vai\\s+trazer)\\s+(?:essa\\s+pessoa|seu\\s+ex|sua\\s+ex|o\\s+ex|a\\s+ex)',
    'o app se coloca como causa: "traga essa pessoa de volta"'),
  /* `pros?` e `pras?`: a contracao coloquial era um buraco medido — a lista
   * tinha `pro` mas nao `pros`, e "de volta PROS seus bracos" passava batido
   * mesmo SEM acento nenhum. Mesmo conserto na formula seguinte. */
  P('(?:traga|tragam|trarei|trar[aá]|vou\\s+trazer|vai\\s+trazer)\\s+(?:ele|ela|eles|elas)\\s+de\\s+volta\\s+(?:pra|pras|para|pro|pros|nos?)\\s+(?:voc[eê]|ti|sua\\s+vida|seus?\\s+bra[cç]os)',
    'o app se coloca como causa: "traga ela de volta pra voce"'),
  P('de\\s+volta\\s+(?:pra|pras|para|pro|pros|nos?)\\s+(?:seus?\\s+bra[cç]os|sua\\s+vida|voc[eê])',
    'desfecho declarado: "de volta pra sua vida"'),
  // O desfecho nomeado: a outra pessoa agindo.
  P('vai\\s+te\\s+(?:procurar|buscar|chamar|ligar|escrever|mandar|responder|perdoar|querer|amar|perceber)',
    'promessa sobre o que a outra pessoa vai fazer: "vai te procurar"'),
  P_ABERTA('(?:ele|ela|eles|elas|essa\\s+pessoa)\\s+(?:vai|v[aã]o)\\s+\\p{L}',
    'sujeito e a outra pessoa + futuro perifrastico: "ela vai ..."'),
  P('(?:ele|ela|eles|elas|essa\\s+pessoa)\\s+(?:te\\s+|me\\s+)?(?:procurar|buscar|chamar|ligar|escrever|voltar|querer|amar|responder)[aá]',
    'sujeito e a outra pessoa + futuro sintetico: "ele voltara"'),
  // O selo de certeza.
  P('garantid[oa]s?', 'selo de garantia'),
  P('garant(?:imos|o|e|em)\\s+que', 'garantia declarada: "garantimos que"'),
  P('com\\s+certeza\\s+(?:volta|vai|d[aá]|retorna|procura)', 'certeza sobre desfecho'),
  P_ABERTA('(?:100|cem)\\s*%\\s*(?:de\\s*)?(?:certeza|garantia|efic[aá]cia|sucesso|funciona)',
    'porcentagem de certeza'),
  P('funciona\\s+(?:sempre|em\\s+todos?|com\\s+qualquer)', 'eficacia universal'),
  P('sem\\s+falha', 'infalibilidade'),
  P('o\\s+destino\\s+(?:vai\\s+)?(?:trazer|traz|trar[aá]|devolve|devolver[aá])',
    'o destino como garantia'),
  // O prazo. "em N dias" + a outra pessoa ou o desfecho, em qualquer ordem.
  P_ABERTA(`em\\s+(?:\\d+|um|dois|tr[eê]s|quatro|cinco|sete|dez|trinta)\\s+(?:dias?|semanas?|meses?|luas?)${FRONT_DIR}[^.!?]{0,60}?${FRONT_ESQ}(?:ele|ela|eles|elas|essa\\s+pessoa|volta|voltar[aá]|de\\s+volta|reconquist\\p{L}+)`,
    'prazo + desfecho: "em N dias ele/ela ..."'),
  P_ABERTA(`(?:ele|ela|essa\\s+pessoa|de\\s+volta|reconquist\\p{L}+)${FRONT_DIR}[^.!?]{0,60}?${FRONT_ESQ}em\\s+(?:apenas\\s+)?(?:\\d+|um|dois|tr[eê]s|quatro|cinco|sete|dez|trinta)\\s+(?:dias?|semanas?|meses?|luas?)${FRONT_DIR}`,
    'desfecho + prazo: "... de volta em N dias"'),
  // O verbo do produto no IMPERATIVO ou no futuro. E so aqui que "reconquista"
  // encosta na lista, e de proposito: o SUBSTANTIVO passa.
  P('reconquiste\\s+(?:em|ele|ela|essa\\s+pessoa|seu\\s+ex|sua\\s+ex)',
    'imperativo do produto virando promessa: "reconquiste em" / "reconquiste ele"'),
  P('(?:vai|vou|voc[eê]\\s+vai)\\s+reconquistar', 'futuro de reconquista como desfecho'),
  P('reconquista\\s+garantida', 'reconquista garantida'),
]);

// --------------------------------------------------------------------------
// ESPANHOL — o idioma do publico ORIGINAL deste funil, e o que nenhum portao
// vigiava fora do baralho legado.
// --------------------------------------------------------------------------
const PROMESSA_ES = Object.freeze([
  // Desenlace: la otra persona volviendo.
  P('(?:volver|regresar|retornar)[aá]', 'futuro sintetico de vuelta: "volvera"'),
  P('(?:volver|regresar|retornar)[aá]n', 'futuro plural de vuelta: "volveran"'),
  P('va\\s+a\\s+(?:volver|regresar|retornar)', 'futuro perifrastico: "va a volver"'),
  P('van\\s+a\\s+(?:volver|regresar|retornar)', 'futuro perifrastico plural: "van a volver"'),
  P('(?:vuelve|regresa|retorna)\\s+a\\s+(?:ti|tu\\s+vida|tus\\s+brazos)',
    'desenlace declarado: "vuelve a ti"'),
  P('de\\s+(?:vuelta|regreso)\\s+(?:a|en)\\s+(?:ti|tu\\s+vida|tus\\s+brazos)',
    'desenlace declarado: "de vuelta a tu vida"'),
  // Desenlace: la usuaria recuperando a la otra persona.
  P('(?:lo|la|los|las)\\s+recuperar[aá]s', 'promesa de recuperacion: "lo recuperaras"'),
  P_ABERTA('recuperar[aá]s\\s+(?:a\\s+)?(?:tu|su|[eé]l|ella|esa\\s+persona)',
    'promesa de recuperacion: "recuperaras a tu ..."'),
  P('recupera\\s+a\\s+tu', 'imperativo de recuperacion: "recupera a tu ..."'),
  P_ABERTA('vas\\s+a\\s+(?:recuperar|reconquistar|tener)\\s+(?:lo|la|a\\s+tu|a\\s+[eé]l|a\\s+ella|esa)',
    'futuro perifrastico de recuperacion'),
  // Desenlace: la otra persona actuando.
  P('te\\s+va\\s+a\\s+(?:buscar|escribir|llamar|hablar|responder|perdonar|querer|amar|extra[nñ]ar)',
    'promesa sobre lo que la otra persona hara: "te va a buscar"'),
  P('te\\s+(?:buscar|escribir|llamar|hablar|responder|perdonar|querer|amar|extra[nñ]ar)[aá]',
    'futuro sintetico sobre la otra persona: "te buscara"'),
  P_ABERTA('(?:[eé]l|ella|esa\\s+persona|ellos|ellas)\\s+va[n]?\\s+a\\s+\\p{L}',
    'sujeto es la otra persona + futuro: "ella va a ..."'),
  P('(?:[eé]l|ella|esa\\s+persona)\\s+(?:te\\s+)?(?:buscar|escribir|llamar|volver|querer|amar|responder)[aá]',
    'sujeto es la otra persona + futuro sintetico: "el volvera"'),
  // El sello de certeza.
  P('garantizad[oa]s?', 'sello de garantia'),
  P('garantiza(?:mos|n)?\\s+que', 'garantia declarada: "garantizamos que"'),
  P('seguro\\s+que\\s+(?:vuelve|regresa|volver[aá]|te\\s+busca|te\\s+escribe)',
    'certeza sobre el desenlace'),
  P_ABERTA('(?:100|cien)\\s*%\\s*(?:de\\s*)?(?:segur[oa]|garantiz\\p{L}+|certeza|efectiv\\p{L}+|[eé]xito|funciona)',
    'porcentaje de certeza'),
  P('funciona\\s+(?:siempre|en\\s+todos?|con\\s+cualquier)', 'eficacia universal'),
  P('sin\\s+falla', 'infalibilidad'),
  P('el\\s+destino\\s+(?:lo|la|los|las)\\s+(?:traer[aá]|devolver[aá]|trae|devuelve)',
    'el destino como garantia'),
  /* El plazo.
   *
   * 'el' SIN TILDE SALIO DE LAS DOS FORMULAS (Onda 2), y el motivo es de
   * ortografia espanola, no de doctrina: "el" es tambien el ARTICULO definido,
   * la palabra mas frecuente del idioma. Con `[eé]l` en la alternancia, estas
   * dos formulas acusaban cualquier frase que tuviera un articulo a menos de 60
   * caracteres de "en un dia" — y eso no es una promesa, es espanol:
   *
   *     "El nudo no se desato en un dia."                      (profunda.es.js)
   *     "...nada avanza — el cuaderno prueba lo contrario."    (missoes365.es.js)
   *
   * Los hermanos PT y EN no tienen este problema porque 'ele'/'ela' y
   * 'he'/'she' no son articulos: la formula portuguesa deja pasar el mismo
   * titulo ("O no nao se desfez num dia") sin tocarlo. Era una asimetria del
   * espanol, y el resultado era un portao que acusaba prosa limpia — el camino
   * mas corto para que alguien lo desactive entero.
   *
   * SIGUE CAYENDO lo que importa: 'el' CON TILDE (el pronombre de verdad, como
   * en "el vuelve en tres dias"), 'ella', 'ellos', 'ellas', 'esa persona', y el
   * desenlace nombrado ('vuelve', 'volvera', 'de vuelta', 'recuperaras',
   * 'reconquist*'). La promesa real nombra a la persona o nombra la vuelta; no
   * se escribe con un articulo.
   *
   * Y EL GUARDA NO ES `\b`, POR LA MISMA TRAMPA QUE ESTE ARCHIVO YA DOCUMENTA
   * (ver el bloco 7 y /\bvoltar[aá]\b/): en JavaScript `\b` ANTES de una vocal
   * acentuada NUNCA casa, porque `é` no es un caracter de palabra para el motor.
   * Medido: /\bél/ da false en "Él vuelve en tres dias" Y en "dice que él
   * vuelve" — es decir, estrechar 'el' a 'el' con tilde usando `\b` no habria
   * estrechado la formula, la habria APAGADO, y la promesa mas directa del
   * espanol ("El vuelve en tres dias") pasaria en silencio. Eso lo encontro la
   * prueba por mutacion de la Onda 2, no la lectura.
   *
   * El guarda NO es `\b`, es FRONT_ESQ / FRONT_DIR del bloco 1-bis: inicio de
   * cadena o un caracter que no es letra en NINGUN alfabeto, CONSUMIDO en el
   * grupo — no lookbehind, que esta prohibido en este proyecto (`(?<=` =
   * pantalla blanca en Safari < 16.4). La Onda 3 saco estos dos guardas escritos
   * a mano y los reemplazo por el helper compartido, que es el mismo guarda:
   * asi la proxima formula nace con el guarda correcto sin copiarlo. Verificado
   * en los cuatro casos: "El vuelve" (casa), "dice que el vuelve" (casa), "El
   * nudo no se desato" (no casa), "aquel hombre" (no casa). */
  P_ABERTA(`en\\s+(?:\\d+|un|dos|tres|cuatro|cinco|siete|diez|treinta)\\s+(?:d[ií]as?|semanas?|meses?|lunas?)${FRONT_DIR}[^.!?]{0,60}?${FRONT_ESQ}(?:él|ella|ellos|ellas|esa\\s+persona|vuelve|volver[aá]|de\\s+vuelta|recuperar[aá]s|reconquist\\p{L}+)`,
    'plazo + desenlace: "en N dias el/ella ..."'),
  P_ABERTA(`(?:él|ella|esa\\s+persona|de\\s+vuelta|recuperar[aá]s|reconquist\\p{L}+)${FRONT_DIR}[^.!?]{0,60}?${FRONT_ESQ}en\\s+(?:solo\\s+|s[oó]lo\\s+)?(?:\\d+|un|dos|tres|cuatro|cinco|siete|diez|treinta)\\s+(?:d[ií]as?|semanas?|meses?|lunas?)${FRONT_DIR}`,
    'desenlace + plazo: "... de vuelta en N dias"'),
  // El verbo del producto como promesa. El SUSTANTIVO "tu reconquista" pasa.
  P_ABERTA('reconquista\\s+(?:a\\s+tu|a\\s+[eé]l|a\\s+ella|a\\s+esa|en\\s+\\d)',
    'imperativo del producto como promesa: "reconquista a tu ex"'),
  P('vas\\s+a\\s+reconquistar', 'futuro de reconquista como desenlace'),
  P('reconquista\\s+garantizada', 'reconquista garantizada'),
]);

// --------------------------------------------------------------------------
// INGLES — o idioma que passava por TODOS os sete portoes, porque "will come
// back" nao tem terminacao de futuro para hablaDelFuturo() morder.
// --------------------------------------------------------------------------
const PROMESSA_EN = Object.freeze([
  // The named outcome: the other person returning.
  P('will\\s+(?:come|be|get)\\s+back', 'future promise of return: "will come back"'),
  P('(?:\'|’)ll\\s+(?:come|be|get)\\s+back', 'contracted future of return: "he\'ll come back"'),
  P('(?:is|are)\\s+coming\\s+back', 'present continuous as promise: "is coming back"'),
  P('(?:\'|’)(?:s|re)\\s+coming\\s+back', 'contracted present continuous: "they\'re coming back"'),
  /* ESTREITADO POR SUJEITO (ver o bloco 3-ter), pela mesma medicao que estreitou
   * o irmao PT "volta pra voce": em ritual.en.js e lunacoes.en.js o sujeito que
   * volta no dia 7 e A LINHA QUE ELA ESCREVEU, nao a outra pessoa. */
  P('comes?\\s+back\\s+to\\s+you', 'outcome declared: "comes back to you"'),
  P('back\\s+(?:in|into)\\s+your\\s+(?:life|arms|bed)', 'outcome declared: "back into your life"'),
  P('will\\s+return\\s+to\\s+you', 'future promise of return: "will return to you"'),
  // The named outcome: the user retrieving the other person.
  P('get\\s+(?:them|him|her|your\\s+ex)\\s+back', 'promise of retrieval: "get them back"'),
  P('win\\s+(?:them|him|her|your\\s+ex)\\s+back', 'promise of retrieval: "win them back"'),
  P('bring\\s+(?:them|him|her|your\\s+ex)\\s+back', 'the app as cause: "bring them back"'),
  P('have\\s+(?:them|him|her)\\s+back', 'promise of retrieval: "have them back"'),
  // The named outcome: the other person acting.
  P('will\\s+(?:text|call|message|reach\\s+out|write|answer|reply|forgive|want|love|miss)\\s+you',
    'promise about what the other person will do: "will text you"'),
  P_ABERTA('(?:he|she|they|that\\s+person)\\s+will\\s+\\p{L}', 'subject is the other person + will'),
  P_ABERTA('(?:he|she|they)(?:\'|’)ll\\s+\\p{L}', 'subject is the other person + contracted will'),
  P('(?:is|are)\\s+going\\s+to\\s+(?:text|call|come|return|reach|write|miss|want|forgive)',
    'periphrastic future about the other person'),
  /* The certainty seal.
   *
   * ESTREITADO NA ONDA 2 (lenormand.en.js carta 22 e profunda.en.js bloco b2),
   * depois de medir a assimetria contra os irmaos PT e ES. O substantivo nu
   * "guarantee" reprovava a NEGACAO dele:
   *
   *     PT  "...o desconforto de decidir sem garantia."        -> PASSA
   *     ES  "Elegir sin garantia incomoda, lo se."             -> PASSA
   *     EN  "Choosing without a guarantee is uncomfortable."   -> REPROVAVA
   *
   * E a mesma frase nos tres, e e um AVISO de que nao ha garantia — o oposto
   * exato do selo que esta lista caca. A formula PT morde 'garantido/garantida'
   * e 'garantimos que'; a ES morde 'garantizado' e 'garantiza que'. Nenhuma das
   * duas morde o substantivo nu, porque o substantivo nu e justamente a palavra
   * que a doutrina USA para dizer que nao promete. A EN mordia, e so ela.
   *
   * O conserto e ESTREITAR a formula nomeada, nao afrouxar o portao: continua
   * caindo o selo ('guaranteed', 'we guarantee', 'guarantees that',
   * 'guaranteeing'), e passa a negacao ('without a guarantee', 'no guarantee').
   * A promessa de verdade nao se escreve com o substantivo nu — se escreve com
   * o participio ou com o verbo, e os dois continuam cobertos aqui e nas
   * formulas de porcentagem, infalibilidade e destino logo abaixo. */
  P('guaranteed', 'guarantee seal: "guaranteed"'),
  P('(?:we|i|it|this|that|they)\\s+guarantees?', 'guarantee declared: "we guarantee"'),
  P('guarantees?\\s+that', 'guarantee declared: "guarantees that"'),
  P('guaranteeing', 'guarantee seal'),
  P_ABERTA('(?:100|one\\s+hundred)\\s*%\\s*(?:sure|guaranteed|certain|effective|success|works?)',
    'percentage of certainty'),
  P('works\\s+(?:every\\s+time|always|for\\s+everyone|on\\s+anyone)', 'universal efficacy'),
  P('never\\s+fails', 'infallibility'),
  P('for\\s+sure\\s+(?:comes?|returns?|will)', 'certainty about the outcome'),
  P('destined\\s+to\\s+(?:return|come\\s+back|be)', 'destiny as guarantee'),
  P('fated\\s+to', 'fate as guarantee'),
  P('destiny\\s+will\\s+bring', 'destiny as guarantee'),
  // The deadline.
  P_ABERTA(`in\\s+(?:just\\s+)?(?:\\d+|one|two|three|four|five|seven|ten|thirty)\\s+(?:days?|weeks?|months?|moons?)${FRONT_DIR}[^.!?]{0,60}?${FRONT_ESQ}(?:he|she|they|that\\s+person|will|back|comeback)${FRONT_DIR}`,
    'deadline + outcome: "in N days they will ..."'),
  P_ABERTA(`(?:he|she|they|that\\s+person|back|comeback)${FRONT_DIR}[^.!?]{0,60}?${FRONT_ESQ}in\\s+(?:just\\s+)?(?:\\d+|one|two|three|four|five|seven|ten|thirty)\\s+(?:days?|weeks?|months?|moons?)${FRONT_DIR}`,
    'outcome + deadline: "... back in N days"'),
  // The product word as a promise. The NOUN "your comeback" passes.
  P('comeback\\s+guaranteed', 'comeback guaranteed'),
  P_ABERTA('your\\s+comeback\\s+in\\s+\\d', 'comeback with a deadline'),
]);

const FORMULAS = Object.freeze({ pt: PROMESSA_PT, es: PROMESSA_ES, en: PROMESSA_EN });

/* =====================================================================
 * 2 · O QUE NAO SE VARRE
 * ===================================================================== */

/* Campos tecnicos e bibliograficos. Ver o cabecalho para o motivo de cada um.
 * `nota` NAO esta aqui de proposito: dentro de `fonte` ela e prosa da Madre
 * sobre o que a obra nao sustenta, e prosa se traduz e se vigia. */
const CAMPOS_FORA = new Set([
  // tecnicos
  'id', 'ids', 'clave', 'claveTitulo', 'clavePista', 'claves', 'slug', 'tipo',
  'grupo', 'rota', 'route', 'variante', 'audio', 'audios', 'imagen', 'imagem',
  'icone', 'icon', 'cor', 'color', 'key', 'chave', 'capitulo', 'degrau',
  // bibliograficos — citacao real, nao se traduz nem se vigia
  'obra', 'autor', 'quando', 'fuente', 'fonte', 'ano', 'year',
]);

/* Chaves de dicionario de tela que nomeiam coisa tecnica, nao copy. */
const CHAVE_FORA = /(?:^|\.)(?:audio|icone|rota|cor|slug|id)$/i;

/* =====================================================================
 * 3 · A RECUSA — a formula que NEGA a promessa nao e promessa
 * =====================================================================
 * ESCRITO DEPOIS DE MEDIR, nao antes. Na primeira rodada este portao acusou
 * quatro trechos do PT de hoje. Lidos um por um, os quatro sao FALSO POSITIVO,
 * e tres deles pelo mesmo motivo — o mais importante do app:
 *
 *   madremaria/datos/profunda.js:102  (e o irmao :438, variante B)
 *     "Eu NAO VOU TE DIZER que essa pessoa vai voltar. NINGUEM PODE TE DIZER
 *      ISSO, e QUEM DIZ ESTA INVENTANDO."
 *
 * Esse paragrafo e a doutrina dita em voz alta: e a Madre recusando, na cara da
 * usuaria, exatamente a promessa que este portao proibe — e dizendo que quem a
 * faz esta mentindo. E a copy mais honesta do produto. Um portao que reprova a
 * propria declaracao da doutrina estaria pedindo para ser afrouxado na semana
 * seguinte: e o caminho mais curto para alguem apagar a regra inteira.
 *
 * Entao a formula aprende a RECUSA. A varredura passa a julgar FRASE por frase
 * (e nao o bloco inteiro), e a frase que carrega uma recusa explicita — "nao vou
 * te dizer que", "ninguem pode te dizer", "no voy a decirte que", "I will not
 * tell you that" — nao e promessa: e a negacao dela.
 *
 * O PERIGO DESTA REGRA, e por que ela e ESTREITA: "nao" solto nao serve. "Nao
 * se preocupe, ela vai voltar" e promessa com um "nao" no comeco, e tem de ser
 * pega. Por isso a lista abaixo nao e de negacao generica: e de VERBO DE DIZER
 * negado ("nao vou te dizer", "ninguem pode prometer", "quem diz esta
 * inventando"), que e a forma como este app declara o limite dele. O bloco 7
 * planta justamente "Não se preocupe, ela vai voltar" para travar isso.
 *
 * E o quarto achado, de outra natureza:
 *
 *   madremaria/datos/frases.js:83
 *     "Preocupacao e imaginacao apontada pro lugar errado. TRAGA ELA de volta
 *      pra mesa."
 *
 * O "ela" e a IMAGINACAO da frase anterior, nao a outra pessoa. Aqui o conserto
 * nao e recusa, e precisao: a formula "traga de volta" passa a exigir que o
 * objeto seja a outra pessoa NOMEADA ("traga essa pessoa", "traga ele/ela de
 * volta pra voce/sua vida"), nunca o pronome solto seguido de "pra mesa". */

const RECUSA = Object.freeze({
  pt: [
    /\bn[ãa]o\s+(?:vou|posso|dou|d[aá])\s+(?:te\s+)?(?:dizer|falar|prometer|garantir|afirmar)\b/i,
    /\bningu[ée]m\s+(?:pode|consegue|vai)\s+(?:te\s+)?(?:dizer|falar|prometer|garantir|saber)\b/i,
    /\bquem\s+(?:diz|promete|garante)\s+(?:isso\s+)?est[aá]\s+(?:inventando|mentindo)\b/i,
    /\bn[ãa]o\s+(?:existe|tem)\s+(?:como\s+)?(?:saber|prever|garantir|prometer)\b/i,
    /\bn[ãa]o\s+[ée]\s+(?:promessa|garantia)\b/i,
  ],
  es: [
    /\bno\s+(?:voy|puedo)\s+a?\s*(?:decirte|decir|prometer|garantizar|afirmar)\b/i,
    /\bnadie\s+(?:puede|va)\s+a?\s*(?:decirte|decir|prometer|garantizar|saber)\b/i,
    /\bquien\s+(?:lo\s+)?(?:dice|promete|garantiza)\s+(?:lo\s+)?est[aá]\s+(?:inventando|mintiendo)\b/i,
    /\bno\s+(?:existe|hay)\s+(?:forma\s+de\s+)?(?:saber|prever|garantizar|prometer)\b/i,
    /\bno\s+es\s+(?:una\s+)?(?:promesa|garant[íi]a)\b/i,
  ],
  en: [
    /\b(?:I|we)\s+(?:will\s+not|won(?:'|’)t|can(?:'|’)?not|cannot|can(?:'|’)t)\s+(?:tell|promise|guarantee|say)\b/i,
    /\b(?:no\s+one|nobody)\s+(?:can|could|will)\s+(?:tell|promise|guarantee|know)\b/i,
    /\b(?:whoever|anyone\s+who)\s+(?:says|promises|guarantees)\s+(?:that\s+)?is\s+(?:making\s+it\s+up|lying)\b/i,
    /\bthere\s+is\s+no\s+(?:way\s+to\s+)?(?:knowing|telling|predicting|guarantee)\b/i,
    /\bis\s+not\s+a\s+(?:promise|guarantee)\b/i,
  ],
});

/** true quando a frase declara o LIMITE em vez de prometer. */
function ehRecusa(frase, lang) {
  return RECUSA[lang].some((re) => re.test(frase));
}

/* Corta em frases sem lookbehind — `(?<=` da tela branca no Safari < 16.4, e
 * este arquivo roda no mesmo alvo Hermes do app. Mesmo criterio (e mesma forma)
 * de dividirEnFrases() em madremaria/lib/lectura.js:432. */
function emFrases(texto) {
  const frases = [];
  let atual = '';
  for (const ch of texto) {
    atual += ch;
    if (ch === '.' || ch === '!' || ch === '?' || ch === '…' || ch === '\n') {
      frases.push(atual);
      atual = '';
    }
  }
  if (atual.trim()) frases.push(atual);
  return frases;
}

/* =====================================================================
 * 3-ter · O SUJEITO IMPORTA — "a LINHA volta para voce" nao e promessa
 * =====================================================================
 * ACHADO DO REVISOR, e ele esta certo. Depois de consertar a armadilha do `\b`
 * (bloco 1-bis), a formula "volta pra voce" passou a morder — como devia — e a
 * PRIMEIRA coisa que ela mordeu foi copy honesta, medida em tres lugares:
 *
 *   madremaria/datos/ritual.js:130
 *     "No setimo dia ESTA MESMA LINHA volta para voce com a data de hoje ao
 *      lado."
 *   madremaria/datos/textos.js:998
 *     "o 'fio de ontem', que O APP cita de volta pra voce no proximo dia vivido."
 *   madremaria/datos/lunacoes.js:171
 *     "O que voce escreveu nesta lunacao ficou guardado com a data. Quando a lua
 *      fechar a volta, ele volta para voce exatamente como esta."
 *
 * Nos tres o sujeito que volta e O QUE ELA ESCREVEU — a linha, o texto, o fio —
 * devolvido pelo aparelho no dia 7. E o mecanismo do produto, nao um desfecho:
 * nada ali diz o que a OUTRA PESSOA vai fazer. A doutrina proibe promessa sobre
 * a outra pessoa; devolver o proprio texto da usuaria e o oposto disso.
 *
 * (Os vizinhos ES/EN dos dois primeiros JA foram reescritos pela Onda 2 para
 * nomear o sujeito — "este aparato te devuelve esta misma linea", "this device
 * hands this same line back to you" — justamente porque este portao os acusou.
 * O conserto deles foi na COPY. O de ritual.js:130 e lunacoes.js:171 nao pode
 * ser: o PT e a fonte da verdade de dois testes que leem a copy crua, e a Onda 3
 * nao mexe em datos/. Entao o conserto e aqui, na formula.)
 *
 * COMO SE DISTINGUE, sem abrir buraco: a frase tem de NOMEAR o artefato. A copy
 * honesta sempre nomeia — "esta mesma linha", "o app", "o fio de ontem", "este
 * aparato", "this device". A promessa de verdade nomeia a PESSOA ("ela volta
 * pra voce") ou nao nomeia nada ("volta pra voce, e questao de tempo"), porque
 * dizer "a linha volta" nao vende reconquista. Medido abaixo, e travado pelo
 * bloco 7-quater nos dois sentidos.
 *
 * ONDE A REGEX NAO ALCANCA, e a excecao NOMEADA que sobra:
 *
 *   lunacoes.js:171 diz "ELE volta para voce" — pronome cujo antecedente ("o que
 *   voce escreveu") esta na frase ANTERIOR. A varredura julga frase por frase
 *   (de proposito: e o que impede um bloco de dez paragrafos de ficar impune por
 *   uma recusa solta), entao nenhuma regex desta lista pode resolver esse
 *   pronome — resolver anafora nao e trabalho de regex, e fingir que e seria
 *   pior que a excecao.
 *
 *   Entao esse caso entra como EXCECAO NOMEADA, uma entrada so, com o arquivo, a
 *   linha, o texto exato e o motivo — auditavel, e que EXPIRA sozinha: o bloco
 *   7-quinquies exige que cada excecao AINDA case a copy que a justificou, e
 *   falha se a copy mudou (aviso de que a excecao virou letra morta e tem de
 *   sair). Nao e um "permitir tudo": e uma frase exata, casada inteira.
 *
 * SAIDA PROPOSTA para zerar a excecao (nao e desta onda porque mexe em datos/,
 * onde a Onda 2 esta gravando): trocar o pronome pelo sujeito em
 * lunacoes.js:171 — "ele volta para voce" -> "o app devolve esse texto para
 * voce" —, exatamente o que lunacoes.en.js:66 e lunacoes.es.js:72 ja fizeram e
 * documentaram. Com a copy corrigida a excecao pode ser apagada e o bloco
 * 7-quinquies avisa quando isso acontecer. */

/* As formulas que descrevem ALGO VOLTANDO, e que por isso dependem de QUEM
 * volta. Sao as unicas que o filtro de sujeito desarma — nenhuma outra formula
 * da lista (garantia, prazo, porcentagem, a outra pessoa agindo) e ambigua
 * quanto ao sujeito, e desarmar qualquer uma delas seria afrouxar o portao. */
const FORMULA_DEPENDE_DO_SUJEITO = new Set([
  'desfecho declarado: "volta pra voce"',
  'desfecho declarado: "de volta pra sua vida"',
  'desenlace declarado: "vuelve a ti"',
  'desenlace declarado: "de vuelta a tu vida"',
  'outcome declared: "comes back to you"',
  'outcome declared: "back into your life"',
]);

/* O ARTEFATO: o que a usuaria escreveu, ou o aparelho que o devolve. Se a frase
 * nomeia um destes, o sujeito que "volta" e uma COISA, e as formulas acima nao
 * se aplicam.
 *
 * NAO entra aqui nada que possa nomear a outra pessoa. Conferido um por um: sao
 * todos objeto ou dispositivo. 'carta' esta fora de proposito — no baralho ela e
 * a carta do tarot, e "a carta volta pra voce" nao e frase deste app. */
const ARTEFATO = Object.freeze({
  pt: /(?:^|[^\p{L}])(?:linhas?|texto|textos|palavras?|frases?|registro|anota[cç][aã]o|caderno|di[aá]rio|fio|app|aplicativo|aparelho|telefone|celular)(?![\p{L}])/iu,
  es: /(?:^|[^\p{L}])(?:l[ií]neas?|texto|textos|palabras?|frases?|registro|anotaci[oó]n|cuaderno|diario|hilo|app|aplicaci[oó]n|aparato|tel[eé]fono|celular|m[oó]vil)(?![\p{L}])/iu,
  en: /(?:^|[^\p{L}])(?:lines?|text|texts|words?|sentences?|record|entry|notebook|journal|thread|app|device|phone)(?![\p{L}])/iu,
});

/** true quando a frase nomeia o artefato — a linha, o texto, o aparelho. */
function falaDoArtefato(frase, lang) {
  return ARTEFATO[lang].test(frase);
}

/* =====================================================================
 * 3-quater · AS EXCECOES NOMEADAS — uma entrada, um arquivo, um motivo
 * =====================================================================
 * Cada excecao e uma FRASE EXATA, nao um padrao largo, e cada uma carrega o
 * arquivo e a linha onde foi medida. O bloco 7-quinquies prova que cada uma
 * ainda e necessaria: se a copy mudar, a excecao falha e tem de sair.
 *
 * REGRA PARA QUEM VIER DEPOIS: nao adicione aqui para calar uma falha. Primeiro
 * tente ESTREITAR a formula (bloco 3-ter) ou nomear o sujeito na COPY, que e o
 * que a Onda 2 fez nos vizinhos ES/EN. Excecao e o ultimo recurso, e so quando a
 * distincao e anafora — pronome cujo antecedente esta em outra frase —, que
 * nenhuma regex resolve. */
const EXCECOES = Object.freeze([
  {
    arquivo: 'madremaria/datos/lunacoes.js:171',
    lang: 'pt',
    /* "ELE volta para voce exatamente como esta" — 'ele' e O QUE VOCE ESCREVEU
     * NESTA LUNACAO, nomeado na frase anterior do mesmo bloco. O filtro de
     * artefato (3-ter) nao alcanca porque a varredura julga frase por frase.
     * Fidelidade verificada contra os vizinhos ja reescritos:
     * lunacoes.es.js:72 e lunacoes.en.js:66 nomeiam "el app"/"the app" no lugar
     * do pronome, e documentam ter feito isso por causa deste portao. */
    frase: 'Quando a lua fechar a volta, ele volta para você exatamente como está.',
    formula: 'desfecho declarado: "volta pra voce"',
  },
]);

/** true quando a frase e uma excecao nomeada para esta formula e idioma. */
function ehExcecao(frase, lang, diz) {
  const limpa = frase.trim();
  return EXCECOES.some((e) => e.lang === lang && e.formula === diz && e.frase === limpa);
}

/* =====================================================================
 * 3-bis · A VARREDURA
 * ===================================================================== */

/** Todas as violacoes de uma string, no idioma dado.
 *  Julga FRASE por frase: um bloco de dez paragrafos nao fica impune porque uma
 *  frase dele recusa, nem e condenado porque outra promete dentro de uma recusa. */
function violacoesDe(texto, lang) {
  if (typeof texto !== 'string' || texto.length === 0) return [];
  const achados = [];
  for (const frase of emFrases(texto)) {
    if (ehRecusa(frase, lang)) continue;
    /* O sujeito importa (bloco 3-ter): se a frase nomeia o artefato — a linha, o
     * texto, o aparelho —, as formulas de "algo voltando" descrevem o mecanismo
     * do produto, nao um desfecho sobre a outra pessoa. So essas formulas sao
     * desarmadas; garantia, prazo e "a outra pessoa agindo" seguem valendo na
     * mesma frase. */
    const artefato = falaDoArtefato(frase, lang);
    for (const { re, diz } of FORMULAS[lang]) {
      if (artefato && FORMULA_DEPENDE_DO_SUJEITO.has(diz)) continue;
      const m = frase.match(re);
      if (!m) continue;
      if (ehExcecao(frase, lang, diz)) continue;       // bloco 3-quater
      achados.push({ diz, trecho: m[0], re: String(re), frase: frase.trim() });
    }
  }
  return achados;
}

/** Anda por qualquer forma (objeto, array, string) e chama `ver(caminho, texto)`
 *  em toda string visivel, pulando os campos de CAMPOS_FORA. */
function andar(valor, caminho, ver, vistos) {
  if (typeof valor === 'string') return ver(caminho, valor);
  if (!valor || typeof valor !== 'object') return;
  if (vistos.has(valor)) return;
  vistos.add(valor);
  if (Array.isArray(valor)) {
    valor.forEach((v, i) => andar(v, `${caminho}[${i}]`, ver, vistos));
    return;
  }
  for (const [k, v] of Object.entries(valor)) {
    if (CAMPOS_FORA.has(k)) continue;
    if (typeof v === 'function') continue;
    andar(v, caminho ? `${caminho}.${k}` : k, ver, vistos);
  }
}

/** Junta toda violacao de um modulo inteiro. */
function varrerModulo(modulo, lang, arquivo, achados) {
  andar(modulo, '', (campo, texto) => {
    for (const v of violacoesDe(texto, lang)) {
      achados.push({ lang, arquivo, campo, texto, ...v });
    }
  }, new WeakSet());
}

/** A mensagem de falha. Diz idioma, arquivo, chave/campo, o texto INTEIRO e a
 *  formula que casou — quem le conserta sem investigar. */
function relatorio(achados, cabeca) {
  const linhas = achados.map(
    (a, i) =>
      `\n  ${i + 1}. [${a.lang.toUpperCase()}] ${a.arquivo}\n`
      + `     campo/chave : ${a.campo}\n`
      + `     formula     : ${a.diz}\n`
      + `     casou com   : "${a.trecho}"   (${a.re})\n`
      + `     frase       : ${a.frase}\n`
      + `     texto inteiro:\n${a.texto.split('\n').map((l) => `       | ${l}`).join('\n')}`
  );
  return (
    `${cabeca}\n`
    + '\nDOUTRINA (madremaria/theme.js:80, CONTRATO DE PRODUTO item 1):\n'
    + '  "A leitura descreve o que a carta mostra e devolve uma acao para a\n'
    + '   usuaria. Nunca um desfecho, nunca uma promessa sobre o que a outra\n'
    + '   pessoa vai fazer."\n'
    + '\nO CONSERTO: descreva o que a carta MOSTRA e feche num gesto de QUEM ESTA\n'
    + 'LENDO. O substantivo do produto ("sua reconquista", "tu reconquista",\n'
    + '"your comeback") e permitido e aprovado pelo dono — o que nao entra e a\n'
    + 'GARANTIA de desfecho, o prazo, e o verbo cujo sujeito e a outra pessoa.\n'
    + `\n${achados.length} violacao(oes):${linhas.join('\n')}\n`
  );
}

/* =====================================================================
 * 4 · OS DICIONARIOS DE TELA — PT, ES, EN
 * ===================================================================== */

test('nenhuma chave de tela promete desfecho, em nenhum dos tres idiomas', () => {
  const achados = [];
  let lidas = 0;

  for (const lang of IDIOMAS) {
    const dict = _DICTS_PARA_TESTE[lang];
    for (const [clave, valor] of Object.entries(dict)) {
      if (CHAVE_FORA.test(clave)) continue;
      andar(valor, clave, (campo, texto) => {
        lidas += 1;
        for (const v of violacoesDe(texto, lang)) {
          achados.push({
            lang,
            arquivo: `madremaria/datos/textos${lang === 'pt' ? '' : `.${lang}`}.js`,
            campo,
            texto,
            ...v,
          });
        }
      }, new WeakSet());
    }
  }

  assert.equal(achados.length, 0, relatorio(achados, 'COPY DE TELA PROMETENDO DESFECHO.'));

  // A varredura tem de ter tido o que ler. O PT sozinho ja garante isso; ES e
  // EN podem estar vazios hoje (obra em andamento) sem cegar o portao: quando
  // a primeira chave traduzida entrar, ela entra JA varrida.
  assert.ok(lidas > 700, `so ${lidas} textos de tela lidos — o PT tinha 775 chaves`);
});

/* =====================================================================
 * 5 · OS ARQUIVOS DE CONTEUDO — descobertos do DISCO
 * ===================================================================== */

/** Todo datos/*.js de conteudo, com o idioma tirado do NOME do arquivo.
 *  textos*.js fica fora: ele e o dicionario de tela, varrido no bloco 4. */
function arquivosDeConteudo() {
  return readdirSync(DATOS)
    .filter((f) => f.endsWith('.js'))
    .filter((f) => !/^textos(?:\.(?:es|en))?\.js$/.test(f))
    .map((f) => {
      const m = f.match(/^(.+?)\.(es|en)\.js$/);
      return { arquivo: f, base: m ? m[1] : f.replace(/\.js$/, ''), lang: m ? m[2] : 'pt' };
    });
}

test('nenhum arquivo de conteudo promete desfecho, em nenhum idioma que exista no disco', async () => {
  const achados = [];
  const varridos = [];

  for (const { arquivo, lang } of arquivosDeConteudo()) {
    /* import() em vez de readFileSync: queremos os VALORES finais (congelados,
     * derivados, montados por map), nao o texto-fonte — comentario de codigo
     * cita frase proibida de proposito (inclusive neste arquivo) e viraria
     * falso positivo. Mesmo criterio de test/madremaria-contenido.test.js. */
    const modulo = await import(`file://${join(DATOS, arquivo).replace(/\\/g, '/')}`);
    varrerModulo(modulo, lang, `madremaria/datos/${arquivo}`, achados);
    varridos.push(`${arquivo} (${lang})`);
  }

  assert.equal(achados.length, 0, relatorio(achados, 'CONTEUDO LONGO PROMETENDO DESFECHO.'));

  // Piso de cobertura: os arquivos de conteudo PT de hoje. Se alguem apagar um,
  // o portao acusa em vez de ficar verde por ter menos o que ler.
  assert.ok(
    varridos.length >= 13,
    `so ${varridos.length} arquivos de conteudo varridos: ${varridos.join(', ')}`
  );
});

/* =====================================================================
 * 5-bis · A COPY QUE MORA EM lib/ — as tabelas do MOTOR DE LEITURA
 * =====================================================================
 * O bloco 5 descobre conteudo varrendo madremaria/datos/. Isso deixava UM ponto
 * cego, e era o pior possivel: madremaria/lib/lectura.js guarda ~8 mil
 * caracteres de copy (TABLAS com preguntaNudo/fraseNudo/tiempo/contacto/accion,
 * ALTERNATIVAS com as frases do filtro de contato duro, o saudo sem nome) que
 * montam A TELA DA SINTESE — o climax do funil, o que a pessoa recebe depois das
 * tres cartas. Nao e datos/, nao e chave de textos.js, e por isso nem este
 * portao nem o placar de cobertura a viam.
 *
 * Agora ela entra aqui, pelos MESMOS mecanismos: as formulas por idioma, a
 * RECUSA, o filtro de artefato e as excecoes nomeadas. O idioma sai do NOME do
 * arquivo, igual ao bloco 5 — lectura.js e pt, lectura.es.js e es,
 * lectura.en.js e en —, entao um quarto idioma nasce varrido sem edicao aqui.
 * ===================================================================== */

/** Os arquivos de lib/ que carregam COPY, com o idioma tirado do nome.
 *  Lista nomeada, e nao readdirSync de lib/ inteiro: lib/ e quase todo motor
 *  (almacen, signo, proximaLua...), e varrer 40 modulos de logica para achar
 *  copy em tres so produziria import caro e falso positivo em nome de variavel. */
function arquivosDeCopyEmLib() {
  return [
    { arquivo: 'lectura.js', lang: 'pt' },
    { arquivo: 'lectura.es.js', lang: 'es' },
    { arquivo: 'lectura.en.js', lang: 'en' },
  ];
}

test('nenhuma tabela do MOTOR DE LEITURA promete desfecho, em nenhum dos tres idiomas', async () => {
  const achados = [];
  const varridos = [];

  for (const { arquivo, lang } of arquivosDeCopyEmLib()) {
    /* import() e nao readFileSync, pelo motivo do bloco 5: queremos os VALORES
     * finais e nao o texto-fonte. lib/lectura.js cita frase proibida nos
     * comentarios de proposito (e a documentacao das guardas), e uma varredura
     * de fonte acusaria a propria explicacao da regra. */
    const modulo = await import(`file://${join(LIB, arquivo).replace(/\\/g, '/')}`);
    /* So as tabelas de copy. O resto do modulo e motor: PATRONES_CONTACTO e
     * PATRONES_FUTURO sao LISTAS DE REGEX cujo proprio conteudo e a frase
     * proibida — varre-las seria acusar a rede de pescar peixe. */
    for (const nome of ['TABLAS', 'ALTERNATIVAS', 'SALUDO_SIN_NOMBRE', 'SOBRE_LA_MESA']) {
      if (modulo[nome] === undefined) continue;
      andar(modulo[nome], nome, (campo, texto) => {
        for (const v of violacoesDe(texto, lang)) {
          achados.push({ lang, arquivo: `madremaria/lib/${arquivo}`, campo, texto, ...v });
        }
      }, new WeakSet());
    }
    varridos.push(`${arquivo} (${lang})`);
  }

  assert.equal(achados.length, 0, relatorio(achados, 'A COPY DO MOTOR DE LEITURA PROMETENDO DESFECHO.'));

  assert.equal(
    varridos.length,
    3,
    `esperados 3 arquivos de copy em lib/, varridos ${varridos.length}: ${varridos.join(', ')}`
  );
});

test('a varredura de lib/ tem mesmo o que ler, e classifica o idioma pelo nome', async () => {
  /* Sem este piso o teste de cima ficaria verde por varrer ZERO string — o jeito
   * mais facil de um portao virar decoracao. */
  let lidas = 0;
  for (const { arquivo } of arquivosDeCopyEmLib()) {
    const modulo = await import(`file://${join(LIB, arquivo).replace(/\\/g, '/')}`);
    for (const nome of ['TABLAS', 'ALTERNATIVAS', 'SALUDO_SIN_NOMBRE']) {
      if (modulo[nome] === undefined) continue;
      andar(modulo[nome], nome, () => { lidas += 1; }, new WeakSet());
    }
  }
  assert.ok(lidas > 200, `so ${lidas} textos do motor lidos — eram 76 por idioma, 228 nos tres`);

  const classificar = (f) => {
    const m = f.match(/^(.+?)\.(es|en)\.js$/);
    return m ? m[2] : 'pt';
  };
  assert.equal(classificar('lectura.js'), 'pt');
  assert.equal(classificar('lectura.es.js'), 'es');
  assert.equal(classificar('lectura.en.js'), 'en');
});

/* =====================================================================
 * 6 · A COBERTURA E AUTOMATICA — quem cria o vizinho .es.js/.en.js nao
 *     precisa vir aqui
 * =====================================================================
 * Este teste existe para que o bloco 5 nao possa virar decoracao por omissao:
 * ele prova que a descoberta pelo disco REALMENTE classifica os idiomas pelo
 * nome, e que um arquivo novo entra varrido sem edicao aqui. */

test('a descoberta pelo disco classifica o idioma pelo nome do arquivo', () => {
  const lidos = arquivosDeConteudo();

  // O PT de hoje esta todo coberto — a lista medida campo a campo da Onda 2.
  const pt = lidos.filter((a) => a.lang === 'pt').map((a) => a.arquivo);
  for (const esperado of [
    'missoes365.js', 'lenormand.js', 'bancos.js', 'lecturas.js', 'lunacoes.js',
    'hechos.js', 'rituais.js', 'ritual.js', 'fases.js', 'preguntas.js',
    'profunda.js', 'sinastria.js', 'plano.js',
  ]) {
    assert.ok(pt.includes(esperado), `${esperado} nao esta sendo varrido`);
  }

  // E o dicionario de tela NAO entra aqui (ele e varrido no bloco 4, com a
  // chave como caminho, que da mensagem de erro melhor).
  assert.ok(
    !lidos.some((a) => a.arquivo.startsWith('textos')),
    'textos*.js vazou para a varredura de conteudo'
  );

  // A classificacao por nome, provada na mao: e o que fara missoes365.es.js
  // nascer varrido com a lista espanhola sem ninguem editar este arquivo.
  const classificar = (f) => {
    const m = f.match(/^(.+?)\.(es|en)\.js$/);
    return m ? m[2] : 'pt';
  };
  assert.equal(classificar('missoes365.js'), 'pt');
  assert.equal(classificar('missoes365.es.js'), 'es');
  assert.equal(classificar('missoes365.en.js'), 'en');
  assert.equal(classificar('lenormand.en.js'), 'en');
  assert.equal(classificar('bancos.es.js'), 'es');
});

/* =====================================================================
 * 7 · PROVA POR MUTACAO — a varredura MORDE nos tres idiomas
 * =====================================================================
 * Sem este bloco, uma regex quebrada deixaria tudo verde para sempre. */

test('MUTACAO: promessa plantada e pega nos tres idiomas', () => {
  const plantadas = [
    // PT
    ['pt', 'Ela vai voltar e voce vai sentir.'],
    ['pt', 'Essa pessoa voltará antes da próxima lua.'],
    ['pt', 'Ele vai te procurar nesta semana.'],
    ['pt', 'Resultado garantido: em 30 dias ele volta.'],
    ['pt', 'Reconquiste em 21 dias, sem falha.'],
    ['pt', 'Este gesto traz ele de volta pra sua vida.'],
    ['pt', 'Com certeza volta, é só questão de tempo.'],
    ['pt', 'O destino vai trazer essa pessoa de novo.'],
    /* A ARMADILHA DO `\b` (bloco 1-bis), plantada NA GRAFIA ACENTUADA — que e a
     * grafia que a copy real usa. Antes da Onda 3 estas nove linhas PASSAVAM
     * pelo portao: `\b` depois de `ê`/`ç`/`á` nunca casa, porque para o motor do
     * JS eles nao sao caractere de palavra. Era o buraco mais perigoso do
     * arquivo, porque a formula LIA certo e a versao SEM acento era pega — quem
     * testasse com "volta para voce" veria o portao morder e iria dormir em paz.
     *
     * Se uma destas voltar a passar, alguem reescreveu uma formula com `\b`.
     * (P() hoje recusa `\b` e estoura; o bloco 7-ter e a outra metade da trava.) */
    ['pt', 'Ele vai voltar para você.'],
    ['pt', 'Essa pessoa volta para você quando entender.'],
    ['pt', 'Este gesto traz ele de volta pros seus braços.'],
    ['pt', 'Ela volta pra você, é questão de tempo.'],
    ['pt', 'Com certeza dá, pode confiar.'],
    ['pt', 'O destino trará essa pessoa de volta.'],
    ['es', 'Él va a llamarte el viernes.'],
    ['es', 'Él te buscará antes de la luna.'],
    ['es', 'Seguro que volverá, ya lo verás.'],
    ['es', 'El destino lo traerá de nuevo.'],
    /* A RECUSA NAO E UM PASSE LIVRE. "nao" solto no comeco da frase nao absolve:
     * so o VERBO DE DIZER negado absolve. Sem estes tres casos, a lista RECUSA
     * viraria o buraco novo — bastaria escrever "nao se preocupe" antes da
     * promessa para passar por este portao. */
    ['pt', 'Não se preocupe: ela vai voltar.'],
    ['es', 'No te preocupes: va a volver.'],
    ['en', 'Do not worry, they will come back.'],
    // ES
    ['es', 'Esa persona volverá antes de la próxima luna.'],
    ['es', 'Va a volver, ya lo verás.'],
    ['es', 'Vuelve a ti en cuanto cierres el nudo.'],
    ['es', 'Lo recuperarás con este gesto.'],
    ['es', 'Recupera a tu ex en 21 días, garantizado.'],
    ['es', 'Te va a escribir esta semana.'],
    ['es', 'Seguro que vuelve: el destino lo traerá.'],
    ['es', 'Ella va a llamarte el viernes.'],
    // EN
    ['en', 'They will come back before the next moon.'],
    ['en', 'That person is coming back to you.'],
    ['en', 'Get them back with this one gesture.'],
    ['en', 'Win them back in 21 days, guaranteed.'],
    ['en', 'She will text you this week.'],
    ['en', 'He is destined to return.'],
    ['en', 'This never fails and works every time.'],
    ['en', 'Your comeback in 30 days.'],
  ];

  const cegas = plantadas.filter(([lang, texto]) => violacoesDe(texto, lang).length === 0);
  assert.deepEqual(
    cegas.map(([l, t]) => `[${l}] ${t}`),
    [],
    'A varredura deixou passar promessa plantada. Portao cego e PIOR que portao '
      + 'nenhum: da a sensacao de que ha guarda.'
  );
});

/* =====================================================================
 * 7-bis · A MUTACAO AO CONTRARIO — a copy HONESTA tem de passar
 * =====================================================================
 * Esta e a trava que impede o proximo agente de afrouxar o portao inteiro.
 * "Sua reconquista comeca aqui" e o titulo aprovado pelo dono — se este teste
 * ficar vermelho, a formula ficou larga e o conserto e REFINAR A FORMULA
 * nomeada na falha, nunca remover o caso daqui. */

test('MUTACAO AO CONTRARIO: a copy honesta do produto NAO e acusada', () => {
  const honestas = [
    // O titulo aprovado e seus irmaos — a PALAVRA do nicho passa.
    ['pt', 'Sua reconquista começa aqui'],
    ['pt', 'A reconquista não é dela: é sua.'],
    ['pt', 'Esta carta mostra onde a conversa se enroscou. Hoje, escreva uma linha sobre o que você sentiu.'],
    ['pt', 'O gesto de hoje é seu. O que a outra pessoa faz não está nas suas mãos.'],
    ['pt', 'Volte para o seu corpo: respire três vezes antes de abrir o celular.'],
    ['pt', 'Um passo atrás e você vê o nó inteiro.'],
    ['pt', 'Em sete dias você terá escrito sete linhas sobre si mesma.'],
    ['es', 'Tu reconquista empieza aquí'],
    ['es', 'La reconquista no es de esa persona: es tuya.'],
    ['es', 'Esta carta muestra dónde se enredó. Hoy, escribe una línea sobre lo que sentiste.'],
    ['es', 'Vuelve a tu cuerpo: respira tres veces antes de abrir el teléfono.'],
    ['es', 'El Rey de Copas habla de lo que ya fue nombrado.'],
    ['es', 'Lo que hace esa persona no está en tus manos.'],
    ['en', 'Your comeback starts here'],
    ['en', 'The comeback is not theirs: it is yours.'],
    ['en', 'This card shows where it got tangled. Today, write one line about what you felt.'],
    ['en', 'Come back to your body: breathe three times before opening your phone.'],
    ['en', 'What that person does is not in your hands.'],
    /* A RECUSA — a copy mais honesta do app, e o que este portao acusou na
     * primeira rodada. E a doutrina dita em voz alta, medida em
     * madremaria/datos/profunda.js:102 e :438. Se um destes ficar vermelho,
     * alguem estreitou a lista RECUSA e reprovou a propria declaracao da regra. */
    ['pt', 'Eu não vou te dizer que essa pessoa vai voltar. Ninguém pode te dizer isso, e quem diz está inventando.'],
    ['pt', 'Eu não vou te dizer que essa pessoa vai atravessar essa montanha na sua direção. Ninguém pode te dizer isso. Quem diz está inventando.'],
    ['pt', 'Ninguém pode te garantir que ele volta. Não existe como prever isso.'],
    ['es', 'No voy a decirte que esa persona volverá. Nadie puede decirte eso, y quien lo dice está inventando.'],
    ['es', 'Nadie puede garantizar que vuelve. No hay forma de saberlo.'],
    ['en', 'I will not tell you that they will come back. No one can tell you that, and whoever says that is making it up.'],
    ['en', 'Nobody can promise they will text you. There is no way of knowing.'],
    /* O pronome que NAO e a outra pessoa — datos/frases.js:83, medido. "ela" e a
     * imaginacao da frase anterior, e "a mesa" e o almoco de quem le. */
    ['pt', 'Preocupação é imaginação apontada pro lugar errado. Traga ela de volta pra mesa.'],
    /* O MECANISMO DO DIA 7 — o sujeito que volta e A LINHA QUE ELA ESCREVEU.
     * Medido em ritual.js:130, textos.js:998 e nos vizinhos ES/EN que a Onda 2 ja
     * reescreveu para nomear o sujeito. Ver o bloco 3-ter; o 7-quater prova as
     * duas direcoes do filtro. */
    ['pt', 'No sétimo dia esta mesma linha volta para você com a data de hoje ao lado.'],
    ['pt', 'É esta linha que volta no sétimo dia.'],
    ['es', 'Es esta línea la que vuelve el séptimo día.'],
    ['en', 'Kept with today’s date. This is the line that comes back on the seventh day.'],
    // Citacao bibliografica real — nenhuma formula pode morder um titulo de livro.
    ['en', 'Telling Fortunes by Tea Leaves'],
    ['en', 'A Manual of Cheirosophy'],
    ['en', 'A. E. Waite, The Pictorial Key to the Tarot'],
  ];

  const acusadas = honestas
    .map(([lang, texto]) => [lang, texto, violacoesDe(texto, lang)])
    .filter((par) => par[2].length > 0);

  assert.deepEqual(
    acusadas.map(([l, t, v]) => `[${l}] "${t}" -> ${v.map((x) => x.diz).join(' | ')}`),
    [],
    'FALSO POSITIVO. A formula ficou larga e acusou copy honesta — possivelmente '
      + 'o proprio titulo aprovado pelo dono. O conserto e ESTREITAR a formula '
      + 'nomeada acima, nunca remover o caso desta lista nem afrouxar o portao.'
  );
});

/* =====================================================================
 * 7-ter · A TRAVA DA ARMADILHA DO ACENTO — mecanica, nao escrita a mao
 * =====================================================================
 * Os blocos 7 e 7-bis sao listas escritas a mao: provam as frases que alguem
 * pensou em escrever. A armadilha do `\b` (bloco 1-bis) escapou deles por nove
 * formulas porque ninguem pensou em plantar a versao ACENTUADA — e e justamente
 * a versao acentuada que a copy real usa.
 *
 * Este bloco nao depende de ninguem pensar. Ele pega CADA formula das tres
 * listas, expande o proprio padrao nas suas variantes literais (alternancias e
 * classes de caractere) e exige que a formula CASE A PROPRIA EXPANSAO. Uma
 * formula que nao casa o texto que ela mesma descreve esta cega — e foi
 * exatamente esse o defeito: /voc[eê]\b/ descreve "você" e nao casava "você".
 *
 * Por que isso impede a armadilha de voltar em QUALQUER idioma: a expansao gera
 * as duas grafias de cada classe ([eê] da 'e' e 'ê', [cç] da 'c' e 'ç', [aá] da
 * 'a' e 'á'), e a forma acentuada so casa se a fronteira estiver correta. O
 * construtor P() ja recusa `\b` estourando; este bloco pega o caso em que alguem
 * escreve a fronteira errada na mao, sem usar `\b`. As duas travas juntas
 * fecham o buraco. */

/** Expande o miolo de um padrao nas suas variantes literais.
 *  Resolve alternancia `(?:a|b)`, classe `[eê]`, `?` opcional e os atalhos de
 *  espaco; devolve null quando o padrao nao e expansivel (curinga, lookahead,
 *  quantificador largo) — esses ficam fora da prova, e sao poucos. */
function expandir(corpo) {
  if (/\\[pdwSPW]|\[\^|\{|\(\?[=!]/.test(corpo)) return null;   // nao expansivel
  let c = corpo.replace(/\\s\+/g, ' ').replace(/\\s\*/g, ' ').replace(/\\s/g, ' ');
  let saidas = [''];
  let i = 0;
  while (i < c.length) {
    if (saidas.length > 4000) return null;
    if (c.startsWith('(?:', i)) {
      let d = 0;
      let j = i;
      for (; j < c.length; j++) {
        if (c[j] === '(') d += 1;
        else if (c[j] === ')') { d -= 1; if (d === 0) break; }
      }
      const dentro = c.slice(i + 3, j);
      let depois = j + 1;
      let opcional = false;
      if (c[depois] === '?') { opcional = true; depois += 1; }
      else if (c[depois] === '+' || c[depois] === '*') return null;
      const alts = [];
      let prof = 0;
      let ini = 0;
      for (let k = 0; k < dentro.length; k += 1) {
        if (dentro[k] === '(') prof += 1;
        else if (dentro[k] === ')') prof -= 1;
        else if (dentro[k] === '[') { while (k < dentro.length && dentro[k] !== ']') k += 1; }
        else if (dentro[k] === '|' && prof === 0) { alts.push(dentro.slice(ini, k)); ini = k + 1; }
      }
      alts.push(dentro.slice(ini));
      const sub = [];
      for (const a of alts) {
        const e = expandir(a);
        if (e === null) return null;
        sub.push(...e);
      }
      if (opcional) sub.push('');
      const nova = [];
      for (const s of saidas) for (const t of sub) nova.push(s + t);
      saidas = nova;
      i = depois;
      continue;
    }
    if (c[i] === '[') {
      let j = i + 1;
      while (j < c.length && c[j] !== ']') j += 1;
      const cls = c.slice(i + 1, j);
      let depois = j + 1;
      let opcional = false;
      if (c[depois] === '?') { opcional = true; depois += 1; }
      else if (c[depois] === '+' || c[depois] === '*') return null;
      const chars = [];
      for (let k = 0; k < cls.length; k += 1) {
        if (cls[k + 1] === '-' && cls[k + 2]) {
          for (let cc = cls.charCodeAt(k); cc <= cls.charCodeAt(k + 2); cc += 1) {
            chars.push(String.fromCharCode(cc));
          }
          k += 2;
        } else chars.push(cls[k]);
      }
      const nova = [];
      for (const s of saidas) for (const t of chars) nova.push(s + t);
      if (opcional) nova.push(...saidas);
      saidas = nova;
      i = depois;
      continue;
    }
    const ch = c[i];
    const prox = c[i + 1];
    if (prox === '?') {
      const nova = [];
      for (const s of saidas) { nova.push(s + ch); nova.push(s); }
      saidas = nova;
      i += 2;
      continue;
    }
    if (prox === '+' || prox === '*') return null;
    saidas = saidas.map((s) => s + ch);
    i += 1;
  }
  return saidas;
}

test('MUTACAO: toda formula casa a PROPRIA grafia acentuada (a armadilha do \\b)', () => {
  const cegas = [];
  let provadas = 0;
  let foraDaProva = 0;
  let comAcento = 0;

  for (const lang of ['pt', 'es', 'en']) {
    for (const { re, diz, corpo, aberta } of FORMULAS[lang]) {
      const exp = expandir(corpo);
      if (exp === null) { foraDaProva += 1; continue; }
      for (const variante of exp) {
        provadas += 1;
        if (/[À-ɏ]/.test(variante)) comAcento += 1;
        /* (1) FALSO NEGATIVO — o defeito do `\b`. Testa a variante SOZINHA e
         * EMBUTIDA numa frase: embutida prova a fronteira ESQUERDA; sozinha
         * prova a DIREITA (fim de cadeia). */
        if (!re.test(variante) || !re.test(`e ${variante} hoje`)) {
          cegas.push(`[${lang}] "${variante}"  nao casa a formula que o descreve: ${diz}`);
        }
        /* (2) FALSO POSITIVO — o defeito OPOSTO, e ele e real: uma fronteira
         * escrita com classe ASCII ([^A-Za-z0-9_]) conserta o falso negativo e
         * abre um falso positivo, porque passa a tratar 'á'/'ç'/'ñ' como
         * NAO-letra e aceita fronteira no MEIO de uma palavra acentuada.
         * Medido: com a fronteira ASCII, /volta para ti/ casa "volta para tiá" e
         * "çvolta para ti". Sem esta metade, trocar \p{L} por A-Za-z passava
         * verde — foi o que a mutacao desta onda pegou.
         *
         * Entao: colada numa letra ACENTUADA, a variante NAO pode casar.
         *
         * A fronteira ESQUERDA vale para TODA formula. A DIREITA so para as
         * fechadas: P_ABERTA nao tem fronteira direita de proposito (o padrao
         * segue num curinga ou num lookahead proprio), e exigi-la ali mataria o
         * padrao. Marcadas com `aberta` no construtor. */
        /* A fronteira ESQUERDA: grudar o acento e exigir que, se houver casamento,
         * ele NAO comece no acento grudado. Nao basta `!re.test('á'+v)`: a
         * formula pode casar legitimamente um trecho MAIS A DIREITA (alguma
         * alternativa interna que comeca no meio, como "vai" dentro de
         * "voce vai reconquistar"), e isso nao e defeito de fronteira. */
        for (const acento of ['á', 'ç']) {
          const m = re.exec(`${acento}${variante}`);
          if (m && m.index === 0) {
            cegas.push(
              `[${lang}] "${variante}"  casa colada a letra ACENTUADA A ESQUERDA `
              + `(fronteira ASCII?) na formula: ${diz}`
            );
          }
        }
        if (!aberta && (re.test(`${variante}á`) || re.test(`${variante}ñ`))) {
          cegas.push(
            `[${lang}] "${variante}"  casa colada a letra ACENTUADA A DIREITA `
            + `(fronteira ASCII?) na formula: ${diz}`
          );
        }
      }
    }
  }

  assert.deepEqual(
    cegas,
    [],
    'FORMULA CEGA PARA A PROPRIA GRAFIA. Quase sempre e a armadilha do bloco '
      + '1-bis: `\\b` (ou uma fronteira escrita a mao com [A-Za-z...]) encostado '
      + 'em letra acentuada NUNCA casa, porque em JS `ê`/`ç`/`á`/`ñ` nao sao '
      + 'caractere de palavra. Use P()/P_ABERTA e escreva so o miolo; a fronteira '
      + 'correta (\\p{L} com a flag u) e montada no bloco 1-bis.'
  );

  // A prova tem de ter tido o que provar, e tem de ter visto acento — senao ela
  // passaria por vacuidade e a armadilha voltaria sem ninguem notar.
  assert.ok(provadas > 2000, `so ${provadas} variantes provadas`);
  assert.ok(comAcento > 100, `so ${comAcento} variantes ACENTUADAS provadas`);
  // E as formulas nao expansiveis (curinga, prazo, porcentagem) sao poucas: se
  // esse numero crescer muito, a prova esta virando decoracao.
  assert.ok(foraDaProva <= 18, `${foraDaProva} formulas fora da prova — demais`);
});

/* =====================================================================
 * 7-quater · O SUJEITO — as duas direcoes do filtro do bloco 3-ter
 * =====================================================================
 * O filtro de artefato e uma ABERTURA no portao, e toda abertura tem de ser
 * medida nos dois sentidos: ele tem de deixar passar a copy do mecanismo E tem
 * de continuar morchendo a promessa. Sem a segunda metade, "nomeie a linha em
 * qualquer lugar da frase e prometa o que quiser" seria o buraco novo. */

test('MUTACAO: o filtro de sujeito abre para o artefato e NAO abre para a promessa', () => {
  // Passa: o sujeito que volta e o que ELA escreveu.
  const mecanismo = [
    ['pt', 'No sétimo dia esta mesma linha volta para você com a data de hoje ao lado.'],
    ['pt', 'O "fio de ontem" é o que o app cita de volta pra você no próximo dia vivido.'],
    ['es', 'El séptimo día este aparato te devuelve esta misma línea, con la fecha de hoy al lado.'],
    ['es', 'Es esta línea la que vuelve el séptimo día.'],
    ['en', 'On the seventh day this device hands this same line back to you, with today’s date beside it.'],
    ['en', 'This is the line that comes back to you on the seventh day.'],
  ];
  const acusadas = mecanismo
    .map(([lang, t]) => [lang, t, violacoesDe(t, lang)])
    .filter((p) => p[2].length > 0);
  assert.deepEqual(
    acusadas.map(([l, t, v]) => `[${l}] "${t}" -> ${v.map((x) => x.diz).join(' | ')}`),
    [],
    'O filtro de sujeito (bloco 3-ter) nao reconheceu o artefato. O sujeito que '
      + 'volta aqui e a LINHA QUE ELA ESCREVEU, devolvida pelo aparelho no dia 7 — '
      + 'e o mecanismo do produto, nao um desfecho sobre a outra pessoa.'
  );

  // NAO passa: nomear a linha nao absolve uma promessa sobre a outra pessoa, nem
  // um selo de garantia, nem um prazo. O filtro desarma SO as formulas de "algo
  // voltando", e so elas.
  const aindaPromessa = [
    ['pt', 'Escreva a linha e ela vai voltar antes da lua cheia.'],
    ['pt', 'A linha fica no aparelho e ele vai te procurar nesta semana.'],
    ['pt', 'Guarde o texto: em 7 dias ela volta, garantido.'],
    ['pt', 'Deixe a linha aqui e essa pessoa voltará.'],
    ['es', 'Escribe la línea y él te buscará esta semana.'],
    ['es', 'Guarda el texto en el aparato: va a volver.'],
    ['en', 'Write the line on this device and they will come back.'],
    ['en', 'Keep the text and win them back in 21 days, guaranteed.'],
  ];
  const escaparam = aindaPromessa.filter(([lang, t]) => violacoesDe(t, lang).length === 0);
  assert.deepEqual(
    escaparam.map(([l, t]) => `[${l}] ${t}`),
    [],
    'O filtro de sujeito virou PASSE LIVRE: bastou nomear a linha/o app para '
      + 'prometer o que quiser. Ele tem de desarmar SO as formulas de "algo '
      + 'voltando" (FORMULA_DEPENDE_DO_SUJEITO), nunca garantia, prazo, nem a '
      + 'outra pessoa agindo.'
  );
});

/* =====================================================================
 * 7-quinquies · AS EXCECOES EXPIRAM SOZINHAS
 * =====================================================================
 * Uma excecao nomeada e divida tecnica. Esta prova e o juros: cada entrada de
 * EXCECOES tem de (a) ainda casar a formula que a justificou — senao ela nao
 * protege mais nada e esta so enfraquecendo o portao — e (b) ainda existir na
 * copy do arquivo que ela cita. Quando a copy for corrigida (a saida proposta no
 * bloco 3-ter), esta prova falha e manda apagar a excecao. */

test('cada excecao nomeada ainda e necessaria — e a lista e pequena', () => {
  assert.ok(
    EXCECOES.length <= 3,
    `${EXCECOES.length} excecoes nomeadas. A lista tem de ser pequena e auditavel: `
      + 'se ela cresce, a formula e que tem de ser estreitada.'
  );

  for (const e of EXCECOES) {
    // (a) a frase ainda casa a formula nomeada — se nao casa, a excecao e letra
    //     morta e tem de sair.
    const formula = FORMULAS[e.lang].find((f) => f.diz === e.formula);
    assert.ok(formula, `excecao de ${e.arquivo} cita formula inexistente: "${e.formula}"`);
    assert.ok(
      formula.re.test(e.frase),
      `A excecao de ${e.arquivo} nao casa mais a formula "${e.formula}". Ela nao `
        + 'protege nada e tem de ser APAGADA do bloco 3-quater.'
    );
    // (b) e, com a excecao valendo, a frase passa.
    assert.equal(
      violacoesDe(e.frase, e.lang).length,
      0,
      `A excecao de ${e.arquivo} nao esta surtindo efeito na varredura.`
    );
    /* (c) a excecao tem de ser LOAD-BEARING: nem a RECUSA nem o filtro de
     *     artefato podem ja estar absolvendo esta frase. Se um deles estiver, a
     *     excecao e redundante e tem de sair — excecao redundante e a que ninguem
     *     revisa, e fica la absolvendo copy nova por acidente. */
    assert.ok(
      !ehRecusa(e.frase, e.lang),
      `A excecao de ${e.arquivo} e REDUNDANTE: a RECUSA ja absolve esta frase.`
    );
    assert.ok(
      !falaDoArtefato(e.frase, e.lang),
      `A excecao de ${e.arquivo} e REDUNDANTE: o filtro de artefato (bloco 3-ter) `
        + 'ja absolve esta frase. Apague a excecao.'
    );
  }
});
