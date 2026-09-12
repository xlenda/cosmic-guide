// test/promessa-scanner.js
//
// O MOTOR DO PORTAO DA DOUTRINA. Nao e um teste: e a biblioteca que os portoes
// importam. Foi EXTRAIDO, sem uma virgula de mudanca nas formulas, de
// test/madremaria-promessa-tres-idiomas.test.js, que ate esta onda era o unico
// lugar do repo onde a doutrina existia em codigo.
//
// ===========================================================================
// POR QUE ELE SAIU DE DENTRO DO TESTE
// ===========================================================================
// A doutrina de madremaria/theme.js:80 — "nunca um desfecho, nunca uma promessa
// sobre o que a outra pessoa vai fazer" — nao e regra da Madre Maria. E a regra
// que a politica de Misrepresentation do Google aplica ao APP INTEIRO, e o app
// inteiro nao e madremaria/: 2481 chaves POR IDIOMA vivem em lib/i18n.js (Home,
// Quiz, Onboarding, Horoscopo, Mapa Astral, Loja, Assinatura, Comunidade...),
// ~140 mil caracteres de copy por idioma, e nenhuma delas tinha guarda nenhuma.
//
// Enquanto o motor morava DENTRO do arquivo de teste, vigiar a segunda
// superficie so tinha dois caminhos, e os dois sao ruins:
//   (a) copiar as ~70 formulas para um segundo arquivo — duas listas que
//       divergem no primeiro conserto, e o conserto de uma nao chega na outra;
//   (b) importar o .test.js de dentro de outro .test.js — o que RE-EXECUTA os
//       testes dele, com o dobro do custo e mensagem de falha duplicada.
// Entao o motor virou modulo, e os dois portoes chamam o MESMO violacoesDe().
// Uma formula estreitada por causa de um falso positivo na Home passa a valer
// para a Madre Maria no mesmo commit, e vice-versa. Lista unica, doutrina unica.
//
// ===========================================================================
// QUEM IMPORTA DAQUI
// ===========================================================================
//   test/madremaria-promessa-tres-idiomas.test.js — madremaria/datos/*.js,
//     madremaria/lib/lectura*.js e os dicionarios de tela da Madre. Esse arquivo
//     tambem guarda a PROVA POR MUTACAO do motor (blocos 7 a 7-quinquies):
//     ela mora la porque nasceu la, e prova o motor INTEIRO, nao so a Madre.
//   test/copy-promessa-app-inteiro.test.js — lib/i18n.js nos tres idiomas.
//
// ===========================================================================
// O FALSO POSITIVO QUE NAO PODEMOS COMETER
// ===========================================================================
// "reconquista" (PT/ES) e "comeback" (EN) NOMEIAM o que a PESSOA faz, e sao o
// assunto do produto: o titulo aprovado pelo dono e "Sua reconquista comeca
// aqui". Proibir a PALAVRA reprovaria o proprio titulo honesto — e o proximo
// agente, vendo o portao acusar copy aprovada, afrouxaria o portao INTEIRO.
// Ja aconteceu neste projeto.
//
// Entao: proibimos a PROMESSA, nunca a palavra. "sua reconquista" passa.
// "reconquiste em 30 dias" nao. "lo recuperaras" nao. A regra e a gramatica da
// garantia (futuro cujo sujeito e a outra pessoa, prazo, selo de certeza), nao
// o vocabulario do nicho.
//
// A MESMA LINHA, em prosa e com exemplo, para quem escreve copy:
// docs/LINHA-DA-PERSUASAO.md. Este arquivo e a versao executavel dela.

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
   * NOMEADA, ou o destino tem de ser a usuaria.
   *
   * A LISTA DE NOMES CRESCEU, e o achado foi vexatorio: ate esta onda ela tinha
   * so 'essa pessoa' e as quatro formas de 'ex' — e por isso deixava passar
   * EXATAMENTE O TITULO QUE O DONO RECUSOU:
   *
   *     "Traga seu amor de volta."      -> PASSAVA
   *
   * Esse titulo e o caso fundador da doutrina neste projeto: um revisor apontou
   * que ele promete o que uma TERCEIRA pessoa vai fazer, e o dono o trocou por
   * "Sua reconquista comeca aqui". O portao guardava a copy honesta que nasceu
   * da decisao e nao guardava a frase que a motivou. Achado ao conferir, uma por
   * uma, as frases do guia docs/LINHA-DA-PERSUASAO.md contra a varredura — que e
   * o motivo de o guia ter de ser verificado e nao so escrito.
   *
   * Entraram os sinonimos afetivos de "a outra pessoa": amor, par, pessoa,
   * namorado/a, marido, esposa, mulher, homem. Todos sao GENTE — nenhum pode
   * nomear um objeto —, e por isso nenhum reabre o falso positivo de frases.js:83,
   * que depende de o objeto ser coisa ('ela' = a imaginacao, 'o foco', 'a
   * atencao'). Medido nos dois sentidos e travado no bloco 7-septies do portao
   * da Madre. */
  P('(?:traga|tragam|trarei|trar[aá]|vou\\s+trazer|vai\\s+trazer)\\s+(?:essa\\s+pessoa|seu\\s+ex|sua\\s+ex|o\\s+ex|a\\s+ex|seu\\s+amor|seu\\s+par|sua\\s+pessoa|seu\\s+namorado|sua\\s+namorada|seu\\s+marido|sua\\s+esposa|sua\\s+mulher|seu\\s+homem)',
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
  /* El hermano espanol de "Traga seu amor de volta" / "Bring your love back".
   * Faltaba: la lista tenia 'recupera a tu' pero no el verbo TRAER, y
   * "Trae a tu amor de vuelta" — la traduccion literal del titulo que el dueno
   * rechazo — pasaba limpio.
   *
   * Exige 'a tu/a esa/a el/a ella' Y el 'de vuelta/de regreso' despues, igual
   * que la formula portuguesa exige el objeto nombrado: "trae la atencion de
   * vuelta al cuerpo" no casa, porque el objeto no lleva 'a tu' delante. */
  P_ABERTA('(?:trae|traeme|traer[eé]|traer[aá]|voy\\s+a\\s+traer|va\\s+a\\s+traer)\\s+(?:a\\s+tu|a\\s+esa\\s+persona|a\\s+[eé]l|a\\s+ella)[^.!?]{0,30}?\\s+de\\s+(?:vuelta|regreso)',
    'el app como causa: "trae a tu amor de vuelta"'),
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
/* O VERBO DE RELACAO — o predicado que so se conjuga entre PESSOAS.
 * Usado para desambiguar o 'they' do ingles nas duas formulas de sujeito logo
 * abaixo (ver o comentario longo la). Um bilhete nao te perdoa, uma assinatura
 * nao sente sua falta, uma carta nao te procura: quando o sujeito faz um destes
 * verbos, ele e gente.
 *
 * NAO entra aqui verbo que uma COISA tambem faz — 'stay', 'leave', 'show',
 * 'find', 'open', 'be'. Foi medido: com 'stay' na lista, "Your notes are saved;
 * they will stay here" reprovava. A lista e curta de proposito, e o fallback
 * 'you'/'your' cobre o resto. */
/* O OBJETO da promessa de recuperacao em ingles — quem o app se propoe a
 * "trazer de volta". Mesma correcao que a lista PT recebeu, pelo mesmo achado:
 * "Bring your love back" / "Get your love back" / "Win your love back" passavam,
 * porque a lista so tinha os pronomes e 'your ex'. Sao os irmaos ingleses de
 * "Traga seu amor de volta", o titulo que o dono recusou.
 *
 * Todos nomeiam GENTE. 'your love' aqui e a pessoa amada, nao o sentimento: a
 * formula exige o verbo de recuperacao ANTES e 'back' DEPOIS, e "bring your love
 * back" so se diz de alguem. Uma frase sobre o sentimento se escreve de outro
 * jeito ("bring love back into your life" nao casa — o objeto ali e 'love', sem
 * 'your', e o 'back' nao vem colado). */
const ALVO_EN =
  '(?:them|him|her|your\\s+ex|your\\s+love|your\\s+person|your\\s+partner'
  + '|your\\s+boyfriend|your\\s+girlfriend|your\\s+husband|your\\s+wife)';

const VERBO_DE_RELACAO_EN =
  '(?:text|call|message|reach|write|answer|reply|respond|forgive|want|love|miss'
  + '|return|come|apologi[sz]e|regret|reali[sz]e|understand|choose)';

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
  /* O OBJETO sai de ALVO_EN, uma constante so, pelo mesmo motivo que a fronteira
   * saiu das formulas e virou P(): as quatro formulas abaixo descrevem a MESMA
   * promessa com quatro verbos, e a lista de objeto tinha de crescer nas quatro
   * juntas ou nao crescia em nenhuma. Foi assim que 'your love' faltou nas
   * quatro ao mesmo tempo. */
  P(`get\\s+${ALVO_EN}\\s+back`, 'promise of retrieval: "get them back"'),
  P(`win\\s+${ALVO_EN}\\s+back`, 'promise of retrieval: "win them back"'),
  P(`bring\\s+${ALVO_EN}\\s+back`, 'the app as cause: "bring them back"'),
  P(`have\\s+(?:them|him|her)\\s+back`, 'promise of retrieval: "have them back"'),
  // The named outcome: the other person acting.
  P('will\\s+(?:text|call|message|reach\\s+out|write|answer|reply|forgive|want|love|miss)\\s+you',
    'promise about what the other person will do: "will text you"'),
  /* 'they' ESTREITADO — e a mesma classe de defeito que ja tirou 'el' sem til da
   * lista espanhola e o substantivo nu 'guarantee' desta aqui: um pronome que o
   * IDIOMA usa para duas coisas diferentes, acusando prosa limpa.
   *
   * Em ingles 'they' e ao mesmo tempo o pronome da outra pessoa E o plural
   * generico de COISA. Com 'they' solto na alternancia, estas duas formulas
   * acusavam copy real do app, medida em lib/i18n.js:
   *
   *     agir.gesture.g5      "Leave a sweet little note where THEY'LL find it."
   *     planos.store.soonText "When subscriptions open inside the app,
   *                            THEY'LL show up on this screen."
   *
   * No primeiro 'they' e o BILHETE; no segundo, as ASSINATURAS. Nenhum dos dois
   * fala do que a outra pessoa vai fazer — o primeiro e um gesto que a usuaria
   * faz, o segundo e um aviso de produto sobre a loja.
   *
   * E os irmaos PT e ES passam limpos nas duas, porque 'ele(a)' e 'ela' ali sao
   * inequivocos e a frase espanhola nem usa pronome:
   *     PT "Deixe um bilhetinho carinhoso onde ele(a) va encontrar."   -> passa
   *     ES "Deja una notita carinosa donde el/ella la vaya a encontrar." -> passa
   *     EN "...where they'll find it."                                 -> REPROVAVA
   * Assimetria de idioma, nao de doutrina — exatamente o padrao que este arquivo
   * ja consertou duas vezes, e sempre ESTREITANDO a formula.
   *
   * COMO SE ESTREITA SEM ABRIR BURACO. 'he', 'she' e 'that person' continuam
   * SOLTOS: nomeiam pessoa e so pessoa, e quem promete com eles cai igual. So
   * 'they' ganha condicao, e a condicao e o PREDICADO: vale quando o verbo e de
   * RELACAO (procurar, escrever, perdoar, sentir falta, voltar — o que so se faz
   * entre gente) ou quando a frase fala com a usuaria ('you'/'your') logo
   * adiante. Um bilhete nao te perdoa e uma assinatura nao sente sua falta.
   *
   * Medido nos dois sentidos, e travado pelo bloco 7-sexies do portao da Madre:
   *   passa   "they'll find it" / "they'll show up on this screen" /
   *           "they will be revealed one by one" / "they will stay here"
   *   morde   "They'll reach out" / "They will forgive you" / "They'll miss you" /
   *           "They will text you" / "They'll return to you" /
   *           "They will come back before the next moon"
   * E "They will be back in three days" segue caindo por OUTRAS duas formulas
   * (a de volta e a de prazo), que nao dependem do sujeito — o estreitamento
   * aqui nao descobre a promessa, so para de acusar a coisa. */
  P_ABERTA(`(?:he|she|that\\s+person)\\s+will\\s+\\p{L}`, 'subject is the other person + will'),
  P_ABERTA(`they\\s+will\\s+(?=${VERBO_DE_RELACAO_EN}|[^.!?]{0,40}?(?:you|your)(?![\\p{L}]))\\p{L}`,
    'subject is "they" (a person) + will'),
  P_ABERTA('(?:he|she)(?:\'|’)ll\\s+\\p{L}', 'subject is the other person + contracted will'),
  P_ABERTA(`they(?:'|’)ll\\s+(?=${VERBO_DE_RELACAO_EN}|[^.!?]{0,40}?(?:you|your)(?![\\p{L}]))\\p{L}`,
    'subject is "they" (a person) + contracted will'),
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


/* =====================================================================
 * 8 · O ANDADOR E O RELATORIO — compartilhados pelos dois portoes
 * ===================================================================== */

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
    + '\nA LINHA COM EXEMPLO, para reescrever: docs/LINHA-DA-PERSUASAO.md\n'
    + `\n${achados.length} violacao(oes):${linhas.join('\n')}\n`
  );
}

export {
  // as formulas e seus construtores — o portao da Madre prova cada uma por mutacao
  P, P_ABERTA, FORMULAS, FRONT_ESQ, FRONT_DIR,
  // a varredura
  violacoesDe, emFrases,
  // as aberturas, expostas para que a prova por mutacao possa medir CADA UMA
  ehRecusa, falaDoArtefato, ehExcecao, EXCECOES, FORMULA_DEPENDE_DO_SUJEITO,
  // o andador e o relatorio, compartilhados pelos dois portoes
  andar, varrerModulo, relatorio, CAMPOS_FORA, CHAVE_FORA,
};
