// lib/lectura.js
// O MOTOR DE LEITURA do Fio Vermelho. Interface publica e guardas em PORTUGUES DO
// BRASIL — o baralho (datos/cartas.json) ja esta em portugues, e guarda escrita
// noutra lingua nao pega nada do que le. Comentarios em portugues (mesma
// convencao de theme.js, datos/preguntas.js e lib/almacen.js).
//
// ===========================================================================
// O QUE ESTE ARQUIVO E — e o que ele nao e
// ===========================================================================
// Puro, deterministico e offline. Entra {respuestas, tirada}, sai texto. Sem IA,
// sem rede, sem storage, sem Date.now(), sem Math.random(). Duas chamadas com a
// mesma entrada devolvem exatamente a mesma saida — e por isso da para travar o
// arquivo inteiro com node:test.
//
// A carta NAO e reescrita. O campo `amor` de datos/cartas.json entra VERBATIM
// como corpo de cada posicao: aquela lente ja foi curada e passa pelo portao de
// test/madremaria-contenido.test.js. O que este motor faz e ENQUADRAR a lente:
//
//     pregunta  ->  a pergunta que a posicao responde   (tabela)
//     cuerpo    ->  carta.amor, VERBATIM                 (nunca tocado)
//     linea     ->  carta.consejo | carta.consejoInv     (citado, filtrado)
//     frase     ->  a frase de posicao                   (tabela)
//
// ===========================================================================
// AS TRES POSICOES
// ===========================================================================
// 1. O NO         — "Onde se enredou".    Calibrada por respuestas.corte (P2).
// 2. A TENSAO     — "O que puxa hoje".
//                   Calibrada pelo PAR respuestas.cuando (P3) + respuestas.hoy (P4):
//                   um fragmento de tempo + um fragmento de contato, compostos.
//                   5 x 5 = 25 combinacoes reais sem escrever 25 paragrafos.
// 3. A SUA PONTA  — "A ponta do fio que voce segura". Calibrada por
//                   respuestas.intencion (P5). Fala SO da usuaria e NUNCA do
//                   futuro — as duas guardas abaixo rodam SEMPRE nesta posicao,
//                   independente das respostas.
//
// ===========================================================================
// AS DUAS GUARDAS (a parte que impede o app de machucar quem o usa)
// ===========================================================================
// guardaContacto — varre o texto JA COMPOSTO e troca por uma alternativa segura
//   qualquer frase que empurre a usuaria a procurar, escrever, ligar ou insistir
//   com a outra pessoa. Roda SEMPRE na terceira posicao e na acao da sintese;
//   roda nas tres posicoes quando respuestas.hoy for um dos IDS_CONTACTO_DURO
//   ('le-escribi-no-responde' | 'cero-contacto'), importados de datos/preguntas.js.
//   E uma VARREDURA, nao um `if` na hora de escolher a frase: mesmo um consejo
//   curado meses atras, ou uma tabela editada por outra pessoa, passa por ela.
//
// guardaFuturo — varre a terceira posicao e a acao atras de futuro do indicativo
//   ("voltara", "vai te procurar", "com o tempo") e troca pela alternativa. E o
//   que faz a regra "A SUA PONTA nunca fala do futuro" ser codigo e nao promessa.
//
// A lente `amor` e a unica coisa que as guardas NAO reescrevem: ela e citacao,
// vai verbatim por contrato. Quando a propria lente insinua contato e o filtro
// duro esta ligado, a posicao ganha um `aviso` que a neutraliza na mesma tela.
//
// ===========================================================================
// CONTRATO DE PRODUTO (o mesmo de theme.js e textos.js, aqui virado codigo)
// 1. Nunca prometer desfecho. Nenhuma tabela deste arquivo diz o que a outra
//    pessoa fara. A leitura descreve e termina em uma acao DA USUARIA.
// 2. Zero prova social. Nao ha numero de usuarias em lugar nenhum daqui.
// 3. Nenhuma alegacao de saude.
// 4. O genero de quem esta do outro lado nunca e assumido: "essa pessoa".
// 5. A SUA PONTA fala so da usuaria e nunca do futuro (guardaFuturo).
// 6. O nome da usuaria e usado UMA vez, na sintese. Ver NOMBRE_APARECE_EN.
// 7. Portugues do Brasil, tratamento por VOCE. Nunca "tu", nunca "senhora",
//    nunca apelido ("meu anjo", "meu bem").
// 8. Nenhum hex aqui: este arquivo so tem palavra e regra.
// ===========================================================================

import { IDS_CONTACTO_DURO, esValida, onboardingCompleto } from '../datos/preguntas.js';
import { IDIOMA_PADRAO, idiomaMadre, lista, t } from '../datos/textos.js';
import * as EN from './lectura.en.js';
import * as ES from './lectura.es.js';

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * ORDEM DAS POSICOES
 * ================================================================================= */

export const CLAVES_POSICION = Object.freeze(['nudo', 'tension', 'extremo']);

/**
 * Onde o nome da usuaria aparece. UMA vez em toda a leitura, e e aqui.
 * datos/textos.js tambem tem 'sintesis.cierre' com {nombre}: este motor NAO o
 * emite de proposito. Se uma tela quiser fechar com aquela linha, tem de decidir
 * qual das duas leva o nome — nunca as duas.
 */
export const NOMBRE_APARECE_EN = 'sintesis.saludo';

/* =================================================================================
 * GUARDAS — padroes
 *
 * Nenhum padrao leva a flag /g: regex com /g guarda lastIndex entre chamadas e
 * .test() passa a alternar true/false a cada invocacao. Bug silencioso e caro.
 * Nenhum padrao usa lookbehind `(?<=`: quebra Safari < 16.4 (tela branca no web).
 * ================================================================================= */

/* BORDA DE PALAVRA QUE FUNCIONA COM ACENTO.
 *
 * O \b do JavaScript e ASCII puro: para ele "ã" nao e letra. Em "amanhã" nao
 * existe borda depois do "ã", entao /\bamanh[ãa]\b/ casa "amanha" e NAO casa
 * "amanhã" — a guarda perde justo a forma acentuada, que e a que a pessoa
 * escreve. Em portugues isso atinge amanhã, você, está, coração, explicação.
 *
 * A borda final vira um lookahead negativo (permitido em qualquer Safari).
 * A borda inicial nao pode ser lookbehind (`(?<!` quebra Safari < 16.4, ver
 * feedback-lookbehind-quebra-ios15): e um grupo CONSUMIDO — inicio de string ou
 * um caractere que nao e letra. Como as guardas so usam .test(), consumir um
 * caractere a mais nao muda nada; `retiradas` guarda a FRASE, nunca o trecho. */
const LETRA = '0-9A-Za-zÀ-ÖØ-öø-ÿ';
const B0 = `(?:^|[^${LETRA}])`;
const B1 = `(?![${LETRA}])`;
const re = (cuerpo) => new RegExp(`${B0}(?:${cuerpo})${B1}`, 'i');

/**
 * Frases que empurram a usuaria para fora — procurar, escrever, ligar, insistir
 * — e, no fim da lista, frases que falam PELA outra pessoa.
 *
 * A lista e PORTUGUESA porque o conteudo e portugues. A parte espanhola ficou no
 * fim, marcada como legado: datos/cartas.es.json continua guardado para o dia em
 * que o espanhol voltar como segundo idioma, e as guardas nao podem depender do
 * idioma do texto para funcionar — rede que so pega numa lingua nao e rede.
 *
 * O QUE NAO ENTRA NA LISTA, de proposito:
 *  - "insistir" e "escrever" no INFINITIVO solto: o baralho usa as duas palavras
 *    justamente para dizer que NAO se deve ("insistir só aperta o nó"); padrao
 *    ganancioso apagaria o melhor conselho do maco em silencio.
 *  - "fala", "falou", "conta", "conte", "volta", "espera" soltos: sao descricao,
 *    nao instrucao. "a carta fala de encontro" e "essa pessoa falou com você
 *    ontem" TEM de passar. Por isso o verbo ambiguo so casa quando vem com o
 *    alvo colado ("fale com ela", "liga pra essa pessoa").
 * O criterio: forma que so existe como ORDEM entra sozinha; forma que tambem
 * existe como narracao so entra acompanhada de um objeto ou de um destinatario.
 */
export const PATRONES_CONTACTO = congelar([
  /* --- 1. IMPERATIVO DE SAIDA, SOZINHO ---------------------------------------
   * Sao as formas de comando do tratamento "você" (mande, ligue, apareça). Como
   * ordem elas nao tem outro sentido em portugues — quem "mande" ou "apareça" so
   * pode estar mandando ou aparecendo para alguem —, entao nao precisam de alvo.
   *
   * "telefone" NAO entra: e o imperativo de telefonar e o aparelho, e este app
   * fala do aparelho em quase toda tela de privacidade ("fica neste telefone",
   * "nada sai deste telefone"). Como imperativo ele ja esta coberto por "ligue"
   * aqui e pela raiz 'telefon' + destinatario no padrao 3. Medido: sem esta
   * excecao a guarda apagava o PACTO do ritual e a nota de privacidade.
   *
   * "escreva"/"escrevas" saiu pelo MESMO criterio, e a medida foi a do ano:
   * escrever nao e sair. E o gesto central deste app — o ritual do sonho abre
   * com "Escreva o que você lembra", a lua cheia e a UNICA das quatro fases que
   * pede palavra escrita, e as 31 contencoes de datos/bancos.js sao todas
   * "escreve aqui", que e o oposto exato de mandar. Com o imperativo solto na
   * lista, a rede de runtime de lib/plano.js apagava essas instrucoes em
   * silencio, e apagava justamente para quem esta em contato duro: medido sobre
   * 365 dias, um terco deles perdia a acao ou o porque do ritual. A ordem que
   * de fato empurra para fora continua caindo — "escreva pra ela" no padrao 3,
   * "escreva uma mensagem" no padrao 2.
   *
   * "procure", "peça", "pergunte" e "busque" sairam pelo MESMO criterio e com a
   * mesma medida, agora sobre o baralho portugues: sao REFLEXIVOS na maior parte
   * das cartas — «procure a sua parte nele» (major-10), «peça ajuda a uma pessoa
   * específica» (major-09), «pergunte se é coragem ou fuga» (major-00), «procure
   * a coisa pequena e concreta que ainda funciona» (major-17). Soltos na lista,
   * eles levavam 33 dos 234 campos do baralho, e A SUA PONTA — que roda a guarda
   * SEMPRE — trocava o melhor conselho do maco pela alternativa. Descem para os
   * padroes 3, 3b e 6, onde so casam COM o alvo de fora: «procure essa pessoa» e
   * «peça uma explicação» continuam pegos. O imperativo perigoso destes verbos
   * nunca vem sozinho — ele sempre diz a quem. */
  re('mande|remeta|envie|ligue|chame|converse|responda|insista|apare[çc]a|reapare[çc]a|avise|convide|proponha|esbarre|aborde|persiga|reconquiste|reate|desbloqueie|sinalize'),

  /* --- 2. VERBO DE SAIDA + OBJETO DE MENSAGEM --------------------------------
   * Pega a forma narrada tambem ("manda uma mensagem pra ela"), que a lista 1
   * deixa passar de proposito. "carta" sozinha NAO entra no objeto: neste app
   * carta e a carta do baralho, e a palavra aparece em quase todo paragrafo. */
  re('(?:escrev|mand|envi|redig|dispar)[a-zà-ú]*\\s+(?:[^.!?]{0,30}\\s)?(?:mensagem|mensagens|[áa]udio|recado|bilhete|zap|whats|whatsapp|dm|direct|e-mail|email|carta para|carta pra)'),

  /* --- 3. VERBO DE SAIDA + DESTINATARIO --------------------------------------
   * O alvo e o que separa instrucao de descricao. "essa pessoa falou com você"
   * nao casa: depois de "com" tem de vir quem esta do OUTRO lado, nunca "você". */
  re('(?:escrev|mand|envi|lig|telefon|procur|busc|cham|fal|convers|volt|corr|apare[çc]|insist|cobr|reclam|pergunt|ped|implor|suplic)[a-zà-ú]*\\s+(?:[^.!?]{0,25}\\s)?(?:pra|para|pro|com|at[ée])\\s+(?:ela|ele|elas|eles|essa pessoa|a pessoa|o ex|a ex|quem est[áa] do outro lado)'),

  /* --- 3b. VERBO DE SAIDA + A PESSOA COMO OBJETO DIRETO -----------------------
   * "procure essa pessoa" nao tem preposicao nenhuma, e e a frase exata que este
   * arquivo existe para impedir. Aqui o alvo vem COLADO no verbo, sem folga: com
   * folga, «procure a coisa pequena que ainda funciona e comece por ela» voltaria
   * a casar por causa do "ela" do fim, e era esse o falso positivo do padrao 1. */
  re('(?:procur|busc|cham|abord|persig|encontr)[a-zà-ú]*\\s+(?:essa pessoa|a pessoa|ela|ele|elas|eles|o ex|a ex)'),

  /* --- 3c. CLITICO COLADO NO VERBO -------------------------------------------
   * "escreva-lhe", "procurá-la", "mande-lhe um oi", "dizer-lhe". A enclise e a
   * forma escrita da mesma ordem, e nao tem preposicao nem objeto para os padroes
   * de cima acharem. '-se', '-me' e '-nos' ficam de fora: sao reflexivos
   * ("pergunte-se"), que e o oposto de sair. */
  re('(?:escrev|mand|envi|lig|telefon|procur|busc|cham|fal|convers|responder?|diz|ped|cobr|avis|convid)[a-zà-ú]*-(?:lhes?|l[ao]s?|o|a)'),

  /* --- 4. APARECER PARA A OUTRA PESSOA VER -----------------------------------
   * "mostre que você está bem para ela ver": nao pede mensagem nenhuma e mesmo
   * assim organiza o dia inteiro em torno do olhar de quem esta do outro lado. */
  re('(?:pra|para|pro)\\s+(?:ela|ele|elas|eles|essa pessoa)\\s+(?:ver|saber|notar|reparar|perceber|sentir|ouvir|entender|voltar)'),

  /* --- 5. LOCUCOES DE APROXIMACAO -------------------------------------------- */
  re('(?:d[êe]|d[áa]|dar|dando)\\s+o\\s+primeiro\\s+passo'),
  re('(?:tom[ae]|tomar|tomando)\\s+a\\s+iniciativa'),
  re('(?:v[áa]|vai|v[ãa]o|vou|ir|corr[ae]|correr|correndo)\\s+atr[áa]s'),
  re('(?:puxe|puxa|puxar)\\s+(?:assunto|conversa)'),
  re('(?:quebre|quebrar)\\s+o\\s+gelo'),
  re('(?:marque|marcar|combine|combinar)\\s+(?:um|uma)\\s+(?:encontro|caf[ée]|conversa|hora|papo)'),
  re('(?:d[êe]|dar|mande|mandar|envie|enviar)\\s+(?:um|algum)\\s+sinal'),
  re('(?:volt[ae]|voltar)\\s+a\\s+(?:escrever|falar|ligar|procurar|buscar|insistir|tentar|chamar|mandar|aparecer)'),
  re('n[ãa]o\\s+(?:desista|desistir|deixe\\s+de\\s+(?:escrever|ligar|procurar|insistir|tentar|chamar))'),
  re('(?:busque|busca|buscar|proponha|propor|tente|tentar|prepare|preparar)\\s+(?:[^.!?]{0,30}\\s)?(?:reencontro|reaproxima[çc][ãa]o|reconcilia[çc][ãa]o|uma conversa|um encontro|o contato)'),

  /* --- 6. EXIGIR OU ESPERAR RESPOSTA DA OUTRA PESSOA -------------------------
   * O verbo sozinho nao basta ("a decisão pode esperar" e frase boa): so casa
   * com o objeto que transforma a espera em cobranca.
   * O GERUNDIO fica de fora ("está esperando um sinal", "vem pedindo explicação"):
   * gerundio e narracao, e a pergunta que devolve a pessoa para ela mesma —
   * «Você está esperando um sinal ou está esperando uma decisão sua?» — e o
   * melhor texto que o app tem. Instrucao em portugues vem no imperativo ou no
   * infinitivo, e sao esses que entram. */
  re('(?:cobr[ae]|cobrar|exij[ao]|exigir|reclam[ae]|reclamar|esper[ae]|esperar|aguard[ae]|aguardar|ped[ei]|pedir|pe[çc]a)\\s+(?:[^.!?]{0,25}\\s)?(?:resposta|respostas|explica[çc][ãa]o|satisfa[çc][ãa]o|um retorno|uma posi[çc][ãa]o|um sinal|uma chance|desculpa|desculpas|perd[ãa]o|que responda|que ela responda|que ele responda|que te escreva)'),

  /* --- 7. FALAR PELA OUTRA PESSOA / ASSUMIR O GENERO DELA --------------------
   * Nao pede contato nenhum e por isso escapava de tudo acima — mas quebra a
   * regra 4 do contrato (o genero de quem esta do outro lado nunca e assumido) e
   * a promessa de A SUA PONTA, onde a guarda de contato roda SEMPRE justamente
   * porque aquela posicao nao fala da outra pessoa.
   * Em portugues "ela" tambem retoma substantivo feminino ("a carta... ela"), e
   * por isso o padrao exige um verbo de intencao logo depois. A copy deste
   * arquivo evita "ela te"/"ele te" de proposito: o custo do falso positivo aqui
   * (uma frase boa trocada pela alternativa) e menor que o do falso negativo. */
  re('(?:ele|ela)\\s+te'),
  re('(?:ele|ela)\\s+(?:vai|quer|sente|pensa|volta|voltou|procura|procurou|ligou|escreveu)'),
  re('(?:diga|conte|explique|responda|mostre)\\s+(?:a|ao|para|pra)\\s+(?:ela|ele|essa pessoa|quem)'),
  /* =========================================================================
   * LEGADO ESPANHOL — a rede do idioma que sai, nao a do idioma que entra.
   *
   * O app virou portugues, mas datos/cartas.es.json continua guardado para o
   * espanhol voltar como SEGUNDO idioma. Apagar estes padroes agora significaria
   * reescreve-los na pressa no dia em que aquele baralho for ligado — e no meio
   * tempo qualquer texto espanhol (deep link antigo, conteudo restaurado, carta
   * copiada do arquivo velho) chegaria a tela sem rede nenhuma.
   *
   * Foram REVISADOS contra falso positivo em portugues, que e o risco novo:
   *  - o objeto "carta" saiu do padrao de mensagem. Em espanhol "carta" e uma
   *    carta escrita; aqui e a carta do baralho, e aparece em quase todo
   *    paragrafo — "a tensão manda menos do que a carta mostra" seria filtrada;
   *  - /\bconversa\b/ saiu. Em espanhol e o imperativo de conversar; em
   *    portugues e o substantivo mais comum da tabela de contato ("como ainda
   *    existe conversa..."), e o padrao apagaria a propria frase de tensao.
   * O resto nao existe em portugues: 'escríbele', 'habla', 'dile', 'acércate'.
   * ========================================================================= */

  /* Verbo de saida com o pronome colado: escribele, llamarlo, buscala, mandale.
   * As raizes vem com o acento POSSIVEL ja no padrao (escr[ií]b, b[uú]sc, ll[aá]m):
   * o imperativo espanhol acentua a raiz — "escribir" vira "escríbele" — e um
   * padrao escrito so com a vogal seca deixa passar justo a forma imperativa,
   * que e exatamente a que empurra a usuaria para fora.
   *
   * O MIOLO E LISTA FECHADA, e nao `[a-záéíóúñ]*`. Com o miolo livre, a raiz
   * 'm[aá]nd' engolia "íbu" e o padrao casava MANDIBULA — e a reflexao de corpo
   * "Onde no corpo hoje pesou mais — ombro, peito, mandíbula, estômago?" era
   * classificada como pedido de contato e apagada em runtime por lib/plano.js,
   * em silencio, exatamente para quem esta em contato duro. O clitico espanhol
   * cola direto na desinencia: mándale, escríbeselo, buscarle, cuéntaselo. */
  /\b(escr[ií]b|ll[aá]m|b[uú]sc|m[aá]nd|env[ií]|cont[aá]ct|cont[eé]st|resp[oó]nd|p[ií]d|prop[oó]n|propon|mu[eé]str|cu[eé]nt|av[ií]s|inv[ií]t)(?:a|e|i|o|as|es|en|an|ar|er|ir|ad|ed|id|ando|iendo|[áéíó])?(le|les|lo|los|la|las|selo|sela)\b/i,
  /\bh[aá]z(le|selo)\s+saber\b/i,
  /\bac[eé]rcate\b/i,
  // verbo de saida + o objeto "mensaje" (objeto so espanhol: ver a revisao acima)
  /\b(enviar|env[ií]a[a-z]*|mandar|manda[a-z]*|escrib[a-záéíóúñ]*|redacta[a-z]*)\b[^.!?¿¡]{0,45}\b(mensaje|dm)\b/i,
  /\b(mensaje|dm)\b[^.!?¿¡]{0,45}\b(enviar|env[ií]a[a-z]*|mandar|manda[a-z]*|escribir)\b/i,
  /* Verbos que so existem em direcao a outra pessoa NO ESPANHOL. 'enviar' e
   * 'mandar' SAIRAM daqui, e a saida obedece o criterio que este arquivo ja
   * declara la em cima para o portugues: infinitivo solto nao entra, porque o
   * conteudo usa a palavra justamente para dizer que NAO se deve.
   *
   * As 31 contencoes de datos/bancos.js abrem todas com "Se vier a vontade de
   * mandar, ..." — a frase e o freio, e o padrao a lia como o empurrao. Com ele
   * na lista, a rede de runtime de lib/plano.js apagava a contencao inteira e
   * a afirmacao "Saudade cabe em mim sem mandar na minha semana" (onde 'mandar'
   * nem sequer e enviar: e mandar em alguem). O contato de verdade continua
   * caindo: com objeto nos dois padroes acima ("mandar un mensaje", "manda uma
   * mensagem"), com destinatario no padrao 3 ("manda pra ela"), e com clitico
   * no padrao de 'mándale'. */
  /\b(llamar|contactar)\b/i,
  /\bantes de (enviar|mandar|llamar|escribir|responder)\b/i,
  // falar dirigido a alguem. "habla de / del / sobre" e a carta descrevendo algo,
  // nao um pedido de conversa: fica de fora pelo lookahead negativo.
  /\bhabla\b(?!\s+(de|del|sobre|contigo))/i,
  /\bh[aá]blale\b/i,
  /\bd[ií]le\b/i,
  /\bd[ií]selo\b/i,
  /\bconversa\s+con\b/i,
  // buscar ou propor reaproximacao
  /\b(busca[a-z]*|propon[a-z]*|intenta[a-z]*|prepara[a-z]*)\b[^.!?¿¡]{0,40}\b(reencuentro|acercamiento|reconciliaci[oó]n|una conversaci[oó]n|un encuentro|el contacto)\b/i,
  /\bda(le)? el primer paso\b/i,
  /\bvuelve a (escribir|llamar|buscar|intentar|acercarte|insistir)\b/i,
  /\bno dejes de (escribir|llamar|buscar|insistir)\b/i,
  // exigir ou esperar resposta da outra pessoa
  /\b(pide|pedir|exige|exigir|reclama|reclamar|espera|esperar)\b[^.!?¿¡]{0,35}\b(respuesta|explicaci[oó]n|una se[ñn]al|que responda|que te escriba)\b/i,
  /* Falar PELA outra pessoa, em espanhol. "Él te extraña" nao e futuro e nao e
   * contato: sem este padrao, ia inteiro para a tela.
   * "el" sem acento entra junto — teclado sem acento e o caso comum, e nao ha
   * falso positivo: em "del", "aquel" e "aquella" nao existe borda de palavra
   * antes do "el"/"ella". Em portugues "el" nao e palavra. */
  /\b(él|el|ella)\s+te\b/i,
]);

/** Locucoes de futuro que nao sao verbo conjugado. */
export const PATRONES_FUTURO = congelar([
  /* --- PORTUGUES -------------------------------------------------------------
   * O futuro sintetico ("voltará", "dirão") cai em FIN_FUTURO, la embaixo, que
   * so olha a terminacao. Aqui entra o que a terminacao nao alcanca: a
   * perifrase com "ir" — que e como o brasileiro fala do futuro de verdade — e
   * as locucoes temporais. */

  /* "vai voltar", "vão aparecer", "vai te procurar": o clitico no meio ("te",
   * "lhe") e o que faz um padrao ingenuo perder justo a promessa mais perigosa. */
  re('(?:vai|vais|v[ãa]o|vou|vamos)\\s+(?:(?:te|lhe|se|me|nos|o|a|os|as)\\s+)?[a-zà-ú]+(?:ar|er|ir)'),
  re('mais\\s+(?:pra|para)\\s+frente'),
  re('mais adiante'),
  re('l[áa]\\s+na\\s+frente'),
  re('com o tempo'),
  re('uma hora'),
  re('cedo ou tarde'),
  re('mais cedo ou mais tarde'),
  re('algum dia'),
  re('um dia desses'),
  re('(?:o|no|do|ao)\\s+futuro'),
  re('em breve'),
  re('logo logo'),
  re('daqui a (?:pouco|dias|semanas|meses|um|uma)'),
  re('na hora certa'),
  re('no tempo certo'),
  re('quando chegar a hora'),
  /* "quando ela voltar", "quando ele quiser": qualquer clausula pendurada no que
   * a outra pessoa vai fazer e futuro e e promessa, mesmo sem verbo no futuro. */
  re('quando\\s+(?:ela|ele|elas|eles|essa pessoa)'),
  re('o que vem por a[íi]'),

  /* --- LEGADO ESPANHOL (mesmo motivo de PATRONES_CONTACTO) ------------------ */
  /* "va a volver", "vas a buscarte": o clitico colado no infinitivo ("buscarte")
   * e o que faz um padrao ingenuo perder justo a promessa mais perigosa. */
  /\bva(n|s)? a [a-záéíóúñ]+(ar|er|ir)(me|te|se|le|lo|la|nos|les|los|las)?\b/i,
  /\bm[aá]s adelante\b/i,
  /\blo que viene\b/i,
  /\bel futuro\b/i,
  /\bma[ñn]ana\b/i,
  /\balg[uú]n d[ií]a\b/i,
  /\bcon el tiempo\b/i,
  /\btarde o temprano\b/i,
  /\bcuando vuelva\b/i,
  /\bal final va\b/i,
  /* FUTURO SEM ACENTO. FIN_FUTURO (logo abaixo) exige o acento de proposito, e
   * isso esta certo: sem acento, "-ara/-era/-ira" tambem termina "para",
   * "primera", "mira" e "espera" — relaxar a regra morfologica apagaria frase
   * boa em silencio. So que texto sem acento existe (teclado sem layout,
   * copia-cola que perde o diacritico, revisao apressada) e "volvera" e
   * exatamente a palavra mais proibida do produto: escrita assim, passava pela
   * guarda inteira e chegava a tela. Por isso, lista fechada em vez de regra
   * ampla — os verbos que a doutrina nomeia e as raizes irregulares do futuro
   * espanhol, que nao terminam em -ar/-er/-ir e escapariam de qualquer jeito.
   * 'cabr' fica de fora de proposito: "cabra" e um animal. */
  /\b(volver|regresar|buscar|llamar|escribir|responder|aparecer|reaparecer|entender|perdonar|cambiar|olvidar|extra[ñn]ar)[áa](s|n)?\b/i,
  /\b(dir|har|podr|pondr|querr|sabr|saldr|tendr|vendr|valdr|habr)[áa](s|n)?\b/i,

  /* FUTURO PORTUGUES SEM ACENTO — a mesma armadilha do espanhol, pelo mesmo
   * motivo: FIN_FUTURO exige o acento e esta certo em exigir, porque sem acento
   * "-ara/-era/-ira" tambem termina "para", "espera", "primeira" e "hora".
   * Como o texto sem acento existe (teclado sem layout, copia-cola que come o
   * diacritico), a saida e a mesma: lista FECHADA dos verbos que a doutrina
   * nomeia, nunca regra ampla. 'sera' entra na lista pela raiz 'ser', e nao pela
   * terminacao — assim "espera" e "primeira" continuam passando. */
  re('(?:volt|retorn|procur|busc|lig|escrev|respond|aparec|reaparec|entend|perdo|mud|esquec|cham|mand|envi|falt|acontec|acab|termin|melhor)(?:ar|er|ir)[áa](?:s|o)?'),
  /* 'vir' fica de fora de proposito: "vira" e palavra comum ("isso vira rotina"),
   * e a forma acentuada "virá" ja cai em FIN_FUTURO. Mesmo criterio do 'cabr'
   * espanhol logo acima. */
  re('(?:ser|ter|ver|dir|far|dar|estar|poder|querer|saber|haver|dizer|fazer)[áa](?:s|o)?'),
  re('o que vem'),
  re('amanh[ãa]'),
]);

/* O futuro do indicativo e RAIZ + r + terminacao, nas duas linguas:
 *   portugues  -rei, -rás, -rá, -remos, -reis, -rão   (voltarei, voltará, voltarão)
 *   espanhol   -ré,  -rás, -rá, -remos, -réis, -rán   (volveré, volverá, volverán)
 * Testar a TERMINACAO pega os irregulares de graca (dirá, fará, terão, habrá)
 * sem lista de verbo nenhuma, e e a mesma regra para os dois idiomas.
 *
 * AS EXCECOES — palavras que terminam igual e nao sao verbo. Sem elas a guarda
 * apaga frase boa em silencio, que e o falso positivo mais caro daqui:
 *   'atrás' / 'trás' / 'detrás' — "um passo atrás e você olha o nó inteiro";
 *   'remos'                     — o remo, e o final de "-remos" ao mesmo tempo;
 *   'rei' / 'reis'              — as cartas da corte ("o Rei de Copas"), que
 *                                 terminam exatamente como o futuro de 1a pessoa;
 *   'grão'                      — termina em "-rão" como "voltarão".
 * 'verão' NAO entra: em portugues e tanto o verao quanto "eles verão", e neste
 * app a segunda leitura e a provavel — e e promessa. Fica pego de proposito.
 *
 * O corte em palavras precisa das letras portuguesas (ã, õ, â, ê, ô, ç, à): sem
 * elas "voltarão" viraria "voltar" + "o" e a terminacao -rão nunca seria testada. */
const FIN_FUTURO = /(r[áé][sn]?|r[ãa]o|rei|reis|remos|r[ée]is)$/i;
/* 'quarteirão' entrou em 01/09: o gesto da caminhada fala do quarteirao e a
 * morfologia de -rão o lia como verbo no futuro (como farão/irão). */
const EXCEPCIONES_FUTURO = new Set(['atrás', 'trás', 'detrás', 'remos', 'rei', 'reis', 'grão', 'grao', 'quarteirão', 'quarteirao']);
const SEPARADOR_PALABRAS = /[^A-Za-zÀ-ÖØ-öø-ÿ]+/;

/* =================================================================================
 * GUARDAS — motor
 * ================================================================================= */

/** true quando o texto insinua procurar, escrever, ligar, insistir — ou fala pela outra pessoa. */
export function sugiereContacto(texto) {
  const s = String(texto == null ? '' : texto);
  return PATRONES_CONTACTO.some((p) => p.test(s));
}

/** true quando o texto fala em futuro (verbo conjugado ou locucao). */
export function hablaDelFuturo(texto) {
  const s = String(texto == null ? '' : texto);
  if (PATRONES_FUTURO.some((p) => p.test(s))) return true;
  return s
    .split(SEPARADOR_PALABRAS)
    .some((palabra) => palabra.length > 3 && FIN_FUTURO.test(palabra) && !EXCEPCIONES_FUTURO.has(palabra.toLowerCase()));
}

/* Corta o texto em frases sem lookbehind: percorre caractere a caractere e fecha
 * a frase na pontuacao final. Preserva a ordem e nao inventa espacos. */
function dividirEnFrases(texto) {
  const frases = [];
  let actual = '';
  for (const ch of String(texto)) {
    actual += ch;
    if (ch === '.' || ch === '!' || ch === '?' || ch === '…') {
      frases.push(actual);
      actual = '';
    }
  }
  if (actual.trim()) frases.push(actual);
  return frases;
}

/**
 * A varredura. Frase a frase: a que casa com um padrao SAI e a alternativa entra
 * no lugar da PRIMEIRA que saiu — as seguintes so somem, para a alternativa nao
 * aparecer repetida no mesmo bloco.
 *
 * `libro` e um contador opcional compartilhado entre as varias partes de uma
 * mesma posicao: com ele, a alternativa entra uma vez na posicao inteira.
 */
function barrer(texto, patrones, alternativa, libro) {
  const contador = libro || { usada: false };
  const frases = dividirEnFrases(texto);
  const salida = [];
  const retiradas = [];

  for (const bruta of frases) {
    const frase = bruta.trim();
    if (!frase) continue;
    if (patrones.some((p) => p.test(frase))) {
      retiradas.push(frase);
      if (!contador.usada) {
        contador.usada = true;
        salida.push(alternativa);
      }
      continue;
    }
    salida.push(frase);
  }

  /* Sem rede de seguranca "se ficou vazio, poe a alternativa": quando o `libro`
   * ja gastou a alternativa nesta posicao, o certo e a parte sair VAZIA e sumir
   * da tela. Repetir a mesma frase de seguranca dois paragrafos seguidos e o
   * jeito mais rapido de a leitura soar automatica. */
  return { texto: salida.join(' ').trim(), filtrado: retiradas.length > 0, retiradas };
}

/**
 * O FILTRO DURO. Varre `texto` e devolve { texto, filtrado, retiradas }.
 * Toda frase que sugere procurar/escrever/ligar/insistir e substituida por
 * `alternativa`. Nao lanca, nao muta a entrada, e deterministica.
 *
 * Exportada porque a tela e o teste tem de poder rodar a mesma varredura sobre
 * qualquer string — inclusive sobre texto que ainda nem existe neste arquivo.
 */
export function guardaContacto(texto, alternativa, libro) {
  return barrer(String(texto == null ? '' : texto), PATRONES_CONTACTO, alternativa || alternativa_('contacto', 'generica'), libro);
}

/** A mesma varredura, para futuro do indicativo. So TU EXTREMO e a acao a usam. */
export function guardaFuturo(texto, alternativa, libro) {
  const s = String(texto == null ? '' : texto);
  const patrones = [
    ...PATRONES_FUTURO,
    { test: (frase) => hablaDelFuturo(frase) },
  ];
  return barrer(s, patrones, alternativa || alternativa_('futuro', 'generica'), libro);
}

/** true quando P4 e 'le-escribi-no-responde' ou 'cero-contacto'. */
export function esContactoDuro(respuestas) {
  if (!respuestas || typeof respuestas !== 'object') return false;
  return IDS_CONTACTO_DURO.indexOf(respuestas.hoy) !== -1;
}

/* =================================================================================
 * ALTERNATIVAS — o que entra no lugar da frase retirada.
 * Nenhuma delas pode casar com os proprios padroes (test/madremaria-lectura.test.js cobra).
 * ================================================================================= */

export const ALTERNATIVAS = congelar({
  contacto: {
    generica:
      'Com o contato do jeito que está hoje, esta leitura não pede nenhum passo para fora. O que resta fazer se faz deste lado do fio.',
    nudo: 'Aqui a carta não pede movimento para fora: pede olhar o nó de onde você está, que é o único lugar de onde dá para olhar.',
    tension:
      'Com o contato do jeito que está hoje, a carta não aponta para mais ninguém. Sustentar a tensão sem puxar mais o fio também é fazer alguma coisa.',
    extremo:
      'A sua ponta do fio não depende de mais ninguém aparecer. O que cabe a você hoje se completa com você, e por isso dá para completar.',
    accion: 'A ação de hoje não passa por mais ninguém: passa por você, e termina quando você termina.',
  },
  futuro: {
    generica: 'Esta carta não prevê nada. Fala do lugar onde você está hoje.',
    extremo:
      'Na sua ponta, a carta não prevê nada: fala do que você tem hoje na mão e do que dá para olhar com isso.',
    accion: 'A ação de hoje se faz hoje e termina hoje. Não precisa de data para valer.',
  },
  aviso:
    'Com o contato do jeito que está hoje, esta leitura não pede nenhum passo para fora. Fique com a imagem da carta: a ação do dia é a que você sustenta.',
});

/* =================================================================================
 * TABLAS — toda a copy composta pelo motor.
 *
 * Exportadas de proposito: assim test/madremaria-lectura.test.js consegue varrer CADA string
 * possivel contra a doutrina (promessa de desfecho, genero atribuido, voseo,
 * futuro na terceira posicao) sem ter de gerar as 625 combinacoes de respostas.
 * Tabela que nao e exportada e tabela que ninguem linta.
 * ================================================================================= */

export const TABLAS = congelar({
  /* --- POSICION 1: O NO — escolhida por respuestas.corte (P2) ------------------ */
  preguntaNudo: {
    pelea: 'O que foi dito naquela vez que nenhum dos dois soube desmanchar depois?',
    distancia: 'Em que momento vocês pararam de contar um para o outro as coisas pequenas?',
    ruptura: 'O que se rompeu de verdade no dia em que aquilo foi dito com todas as letras?',
    'me-arrepenti': 'Do que você estava se protegendo quando decidiu terminar?',
    'nunca-empezo': 'O que ficou sem ser dito em algo que nunca chegou a ter nome?',
    generica: 'Onde exatamente isso se enredou?',
  },

  fraseNudo: {
    pelea: 'A carta não julga aquela discussão: marca ali o ponto onde o fio apertou. Nó apertado se olha antes de tocar.',
    distancia:
      'A carta mostra um nó que se fez devagar, sem um dia exato para apontar. Isso não o torna menor: torna mais difícil de achar.',
    ruptura:
      'A carta põe o nó em algo que foi dito mesmo. O que foi dito tem data, e uma data pelo menos dá uma borda por onde começar a olhar.',
    'me-arrepenti':
      'A carta põe o nó do seu lado do fio. Aí tem uma coisa incômoda e uma coisa útil ao mesmo tempo: é a única ponta ao seu alcance.',
    'nunca-empezo':
      'A carta mostra um nó feito do que não chegou a acontecer. Enreda igual, mesmo sem uma história para contar a ninguém.',
    generica: 'A carta marca o ponto onde o fio apertou. Não explica o porquê: aponta onde olhar.',
  },

  /* --- POSICION 2: A TENSAO — o PAR cuando (P3) + hoy (P4) --------------------- */
  preguntaTension: {
    dias: 'Quanto do que você sente hoje é a ferida e quanto é o susto destes dias?',
    semanas: 'Que parte da tensão continua viva e que parte já virou costume destas semanas?',
    'meses-1-3': 'O que virou rotina nestes meses sem você perceber?',
    'meses-3-12': 'O que você segura esticado há meses porque soltar parece perder?',
    'mas-de-un-ano': 'O que disso ainda está tenso de verdade e o que já é um gesto velho que você repete?',
    generica: 'O que exatamente mantém isso esticado hoje?',
  },

  /* Primeira metade da frase de tensao: o eixo do tempo. */
  tiempo: {
    dias: 'Com dias de intervalo, a carta lê uma tensão ainda quente: nada assentou, e o que pesa hoje pesa o dobro por causa do barulho.',
    semanas:
      'Com semanas de intervalo, a carta lê uma tensão que já perdeu o barulho do começo e ficou mais calada.',
    'meses-1-3': 'Com um a três meses de intervalo, a carta lê uma tensão que já tomou forma de rotina.',
    'meses-3-12':
      'Com vários meses de intervalo, a carta lê uma tensão que virou parte da paisagem e quase não se nota até alguém nomear.',
    'mas-de-un-ano':
      'Com mais de um ano de intervalo, a carta lê uma tensão antiga, dessas que se sustentam por costume e não por urgência.',
    generica: 'A carta lê uma tensão que já está instalada faz tempo.',
  },

  /* Segunda metade: o eixo do contato. Os dois estados do filtro duro
   * ('le-escribi-no-responde' e 'cero-contacto') descrevem a espera SEM propor
   * nada — sao eles que a guarda protege, e por isso nao podem cair nela. */
  contacto: {
    hablamos:
      'E como ainda existe conversa, o que está esticado não é o silêncio, e sim o que não se nomeia dentro dessa conversa.',
    'le-escribi-no-responde':
      'E como já houve uma tentativa sua sem resposta, a tensão vive hoje deste lado: quem sustenta é a espera, não uma troca.',
    'cero-contacto':
      'E como não há contato de nenhum dos dois lados, o que está esticado é seu e só seu: hoje não tem ninguém do outro lado puxando o fio.',
    'me-escribe-a-veces':
      'E como as mensagens aparecem sem padrão, a tensão se renova sozinha a cada vez e nunca chega a assentar.',
    bloqueo:
      'E como há um bloqueio no meio, a carta lê uma tensão sem saída para fora: o que se move, se move por dentro.',
    generica: 'E o estado do contato hoje muda o peso dessa tensão mais do que qualquer outra coisa.',
  },

  /* --- POSICION 3: A SUA PONTA — respuestas.intencion (P5) --------------------- */
  preguntaExtremo: {
    'entender-que-paso': 'Que parte desta história você entende hoje melhor do que ontem?',
    'entender-mi-parte': 'O que você fez que hoje faria diferente, sem transformar isso em culpa?',
    /* "em vez de ficar à espera de um sinal" seria a frase natural aqui e cai na
     * propria guarda (esperar + sinal): a guarda nao le negacao, e nem devia.
     * A pergunta se reescreve; a guarda nao se afrouxa. */
    'decidir-insistir-o-soltar': 'O que você precisa saber sobre você para decidir hoje, sem depender de nenhum sinal de fora?',
    'entender-que-diria': 'O que você diria se não precisasse cuidar da reação de ninguém?',
    'entender-para-cerrar': 'O que falta você entender para este assunto deixar de ocupar o primeiro lugar do dia?',
    generica: 'Que parte disso está mesmo nas suas mãos hoje?',
  },

  fraseExtremo: {
    'entender-que-paso':
      'A ponta do fio que você segura hoje não é a explicação inteira: é a parte da história que você já consegue contar sem embolar a voz. Essa parte já é sua.',
    'entender-mi-parte':
      'A ponta que você segura hoje é a sua parte, do tamanho real que tem: nem toda a culpa, nem nenhuma. Olhar essa parte inteira é o que a torna do tamanho de uma pessoa só.',
    'decidir-insistir-o-soltar':
      'A ponta que você segura hoje não é a decisão: é o material com que se decide. Ninguém decide bem com metade dos dados e a outra metade imaginada.',
    'entender-que-diria':
      'A ponta que você segura hoje é a sua voz: o que você diria, inteiro, sem editar por medo da reação de ninguém. Essa versão existe mesmo que não chegue a lugar nenhum.',
    'entender-para-cerrar':
      'A ponta que você segura hoje é o espaço que este assunto ocupa no seu dia. Esse espaço é seu e se mede sem licença de ninguém.',
    generica:
      'A ponta que você segura hoje é o que está na sua mão: olhar, nomear e decidir quanto lugar dar a isso.',
  },

  /* --- SINTESIS ---------------------------------------------------------------- */

  /* Fecha o bloco "O QUE AS TRES CARTAS MOSTRAM", amarrado ao corte. */
  lecturaCierre: {
    pelea: 'As três se leem sobre uma história que se cortou de repente: por isso o nó tem data e a tensão ainda soa como o que foi dito.',
    distancia:
      'As três se leem sobre uma história que foi se soltando aos poucos: por isso o nó não tem data exata e a tensão parece mais um vazio do que um barulho.',
    ruptura:
      'As três se leem sobre uma história que se fechou com palavras: por isso o nó está no que foi dito, e a tensão em tudo o que ficou embaixo disso.',
    'me-arrepenti':
      'As três se leem sobre uma decisão que foi sua: por isso o nó cai do seu lado e a sua ponta pesa mais do que em qualquer outra tiragem.',
    'nunca-empezo':
      'As três se leem sobre algo que não chegou a ter nome: por isso o nó é feito de possibilidade e não de história, e aperta igual.',
    generica:
      'As três se leem juntas: o nó onde apertou, a tensão que mantém isso esticado e a ponta que você tem na mão.',
  },

  /* Bloco "A PARTE QUE VOCE SUSTENTA". */
  tuParte: {
    'entender-que-paso':
      'O que você sustenta é a versão dos fatos que dá para revisar: a sua. Essa se organiza sozinha, sem ninguém vir confirmar.',
    'entender-mi-parte':
      'O que você sustenta é a sua parte, e só ela. A parte de quem está do outro lado não está na sua mão nem está nesta leitura.',
    'decidir-insistir-o-soltar':
      'O que você sustenta é o critério: com que informação você decide e com qual não. A decisão pode esperar; o critério não.',
    'entender-que-diria':
      'O que você sustenta são as suas palavras. Elas existem inteiras mesmo sem serem ditas, e organizar isso muda o peso que o assunto tem no seu dia.',
    'entender-para-cerrar':
      'O que você sustenta é o lugar que este assunto ocupa. Ninguém mais muda esse lugar por você, e por isso ninguém mais consegue impedir que você mude.',
    generica:
      'O que você sustenta é a sua ponta do fio: o que você olha, o que você nomeia e o lugar que dá a isso no dia.',
  },

  /* Bloco "UMA ACAO PARA HOJE". Toda acao se completa sozinha: papel, voz, conta.
   * Nenhuma depende de que alguem responda, apareca ou autorize.
   *
   * O verbo de cada acao e escolhido para NAO cair na propria guarda: "anote",
   * "termine", "faça", "conte". "Escreva" seria a palavra natural em portugues e
   * esta fora de proposito — ela e imperativo de saida em PATRONES_CONTACTO, e a
   * acao passa pelas duas guardas SEMPRE. Uma tabela escrita com "escreva" faria
   * a guarda comer todas as acoes e a tela mostrar so a alternativa. */
  accion: {
    'entender-que-paso':
      'Anote em uma linha só o que se rompeu, com as suas palavras e sem enfeite. Uma linha, e deixe onde ninguém mais leia.',
    'entender-mi-parte':
      'Termine em voz alta, uma vez só, a frase que começa por «nisso eu fiz». Ninguém precisa ouvir para valer.',
    'decidir-insistir-o-soltar':
      'Faça duas listas na mesma folha: o que você sabe e o que você está supondo. Não decida hoje; hoje é só separar uma coisa da outra.',
    'entender-que-diria':
      'Anote o que você diria, inteiro, numa folha que dá para rasgar depois. A folha não é para ninguém: é para tirar isso da cabeça.',
    'entender-para-cerrar':
      'Conte quantas vezes este assunto apareceu na sua cabeça desde que você acordou e anote o número sem corrigir. Fechar começa por saber o tamanho real do que se fecha.',
    generica:
      'Anote numa folha a frase que hoje fica dando voltas e deixe ali. Tirar da cabeça e pôr no papel já é a ação.',
  },

  /* Entradas da linha citada. O consejo entra entre comilhas angulares porque e
   * CITACAO da carta, nao voz do app — e quando a guarda o retira, a citacao
   * desaparece junto: nada filtrado se apresenta como palavra da carta. */
  entrada: {
    nudo: {
      derecha: 'Em pé nesta posição, a carta diz sem rodeios:',
      invertida: 'De cabeça para baixo nesta posição, a carta muda o acento:',
    },
    tension: {
      derecha: 'Em pé, a carta aponta por onde afrouxa:',
      invertida: 'Invertida, a carta aponta o que está apertando demais:',
    },
    extremo: {
      derecha: 'Em pé na sua ponta, a carta devolve isto:',
      invertida: 'Invertida na sua ponta, a carta devolve isto:',
    },
  },
});

/* Saudacao para quando o nome nao veio (entrada incompleta, teste, deep link).
 * Nunca interpolar vazio em 'sintesis.saludo': viraria ", isto e o que...".
 *
 * Continua exportada como o PORTUGUES, e de proposito: o portao antigo
 * (test/madremaria-lectura.test.js) a compara contra a saida em PT, e TABLAS e
 * ALTERNATIVAS seguem a mesma regra logo abaixo. Quem precisa da frase que a
 * PESSOA ve chama saludoSinNombre(). Mesmo criterio do `T` de datos/textos.js. */
export const SALUDO_SIN_NOMBRE = 'Isto é o que ficou sobre a mesa.';

/* O cabecalho da enumeracao das tres cartas na sintese. */
const SOBRE_LA_MESA = 'Sobre a mesa:';

/* =================================================================================
 * OS TRES IDIOMAS DO MOTOR
 * =================================================================================
 * O PT fica NESTE arquivo: ele e a fonte da verdade, e duas suites antigas
 * (test/madremaria-lectura.test.js e o portao da doutrina) varrem TABLAS e
 * ALTERNATIVAS como objeto portugues, com Object.entries. Mover o PT para um
 * vizinho cegaria os dois.
 *
 * ES e EN moram em lib/lectura.es.js e lib/lectura.en.js, com as MESMAS chaves.
 * Nao virou chave de datos/textos.js por duas medidas:
 *   · a forma. O motor indexa por RESPOSTA (TABLAS.accion['entender-mi-parte']),
 *     e achatar isso em 76 chaves pontuadas trocaria uma tabela que ele ja le
 *     por 76 chaves soltas sem dono;
 *   · o dono. Aquelas chaves entrariam em datos/textos.es.js e textos.en.js, que
 *     sao os arquivos da OUTRA onda de traducao.
 * E o molde ja existe na casa: datos/lecturas.js faz exatamente isto com
 * datos/lecturas.es.js (ver datos/traduzir.js).
 *
 * FALLBACK, na ordem de t(): idioma ativo -> PT -> nada inventado. Usa
 * `=== undefined` e nao `||`, para string vazia NAO cair escondida no PT: vazio
 * e defeito de traducao, e quem reclama dele e o portao.
 * ================================================================================= */

const IDIOMAS_DO_MOTOR = { es: ES, en: EN };

/* O modulo do idioma ativo, ou null em PT (e em idioma que nao temos).
 *
 * `null`, e nunca `undefined` por acidente: todo leitor daqui compara com null
 * explicitamente. O atalho `mod && mod.X` devolve NULL quando mod e null, e um
 * `tr === undefined ? pt : tr` depois disso entrega null para a tela. Foi
 * exatamente esse o bug que test/madremaria-lectura.test.js (3f) pegou na
 * primeira rodada: o aviso da lente suja saiu null em PORTUGUES. Por isso a
 * guarda e `!mod` antes de qualquer acesso, e nao um encadeamento esperto. */
function moduloDoIdioma() {
  const lang = idiomaMadre();
  if (lang === IDIOMA_PADRAO) return null;
  return IDIOMAS_DO_MOTOR[lang] || null;
}

/* Texto traduzido que a tela consegue MOSTRAR, ou undefined. Vazio e espaco
 * contam como ausente, igual ao placar de cobertura: string vazia e defeito de
 * traducao e nao pode virar bloco em branco na tela. Mesmo criterio do
 * `=== undefined` de valorDe() em datos/textos.js. */
function util(valor) {
  return typeof valor === 'string' && valor.trim() !== '' ? valor : undefined;
}

/* A tabela do idioma ativo, por NOME. Nome e nao objeto porque so o nome
 * sobrevive a troca de idioma: passar TABLAS.accion amarraria a chamada ao
 * portugues no ato do import. */
function tabla(nombre) {
  const mod = moduloDoIdioma();
  if (!mod || !mod.TABLAS || !mod.TABLAS[nombre]) return TABLAS[nombre];
  return mod.TABLAS[nombre];
}

/* O mesmo, para ALTERNATIVAS. `grupo` e 'contacto' | 'futuro'; `clave` e a
 * posicao. 'aviso' e string solta e entra por alternativaAviso(). */
function alternativa_(grupo, clave) {
  const mod = moduloDoIdioma();
  const tr = (mod && mod.ALTERNATIVAS && mod.ALTERNATIVAS[grupo]) || null;
  const pt = ALTERNATIVAS[grupo];
  /* Cada campo cai no PT por conta propria: traducao incompleta troca UMA
   * alternativa, nunca o grupo inteiro. E a cadeia nunca pode render null — a
   * alternativa E a frase que quem esta em contato duro recebe no lugar do
   * convite, e null ali apagaria a protecao em silencio. */
  return util(tr && tr[clave]) || util(pt[clave]) || util(tr && tr.generica) || pt.generica;
}

function alternativaAviso() {
  const mod = moduloDoIdioma();
  return util(mod && mod.ALTERNATIVAS && mod.ALTERNATIVAS.aviso) || ALTERNATIVAS.aviso;
}

/** A saudacao sem nome no idioma ativo. Traduzida de proposito nos tres: e a
 *  PRIMEIRA linha da sintese, e uma frase em portugues no topo de um bloco
 *  traduzido e justamente o defeito que feedback-app-inteiro-no-mesmo-idioma
 *  nomeia. */
export function saludoSinNombre() {
  const mod = moduloDoIdioma();
  return util(mod && mod.SALUDO_SIN_NOMBRE) || SALUDO_SIN_NOMBRE;
}

function sobreLaMesa() {
  const mod = moduloDoIdioma();
  return util(mod && mod.SOBRE_LA_MESA) || SOBRE_LA_MESA;
}

/* =================================================================================
 * LIMITES — as tres linhas do que a leitura NAO pode dizer.
 * Vem inteiras de datos/textos.js. A tela e obrigada a renderizar: `limites` sai
 * em todo retorno de componerLectura(), nunca condicionado a nada.
 *
 * E UMA FUNCAO, nao um objeto de modulo. Era um objeto, e por isso congelava o
 * idioma do INSTANTE DO IMPORT — t() avaliado uma vez, no topo do arquivo, antes
 * de o provider ter empurrado idioma nenhum. Resultado medido: a tela trocava de
 * idioma e os LIMITES ficavam em portugues para sempre. `lineas` usa lista(), e
 * nao t(), porque a tela indexa por posicao.
 * ================================================================================= */
export function limitesDeLaLectura() {
  return Object.freeze({
    titulo: t('limites.titulo'),
    lineas: Object.freeze(lista('limites.lineas')),
    pie: t('limites.pie'),
  });
}

/* Compatibilidade: LIMITES continua exportado e continua sendo O PORTUGUES,
 * igual ao `T` de datos/textos.js — o portao antigo o importa como objeto. Quem
 * renderiza le `limites` do retorno de componerLectura(), que e a funcao. */
export const LIMITES = limitesDeLaLectura();

/* =================================================================================
 * AUXILIARES
 * ================================================================================= */

function elegir(tabla_, clave) {
  if (clave && Object.prototype.hasOwnProperty.call(tabla_, clave)) return tabla_[clave];
  return tabla_.generica;
}

/** A entrada da tabela `nombre` para `clave`, JA no idioma ativo. Um unico
 *  chokepoint: e aqui que os 66 textos do motor passaram a seguir o idioma. */
function texto(nombre, clave) {
  /* Traducao incompleta (chave que existe no PT e falta no vizinho) cai no PT
   * campo a campo, nunca em undefined — a tela imprimiria "undefined". */
  return util(elegir(tabla(nombre), clave)) || elegir(TABLAS[nombre], clave);
}

/** A entrada da linha citada. Fora de texto() porque `entrada` e a UNICA tabela
 *  de dois niveis (posicao -> orientacao) e nao tem `generica`: a posicao e a
 *  orientacao vem do motor, nunca de resposta da usuaria, e por isso as duas
 *  sempre existem. Fallback campo a campo para o PT, igual ao resto. */
function entradaDe(clave, orientacion) {
  const linha = tabla('entrada')[clave];
  return util(linha && linha[orientacion]) || TABLAS.entrada[clave][orientacion];
}

/** Nome saneado. null quando nao passa por esValida('nombre', ...) de preguntas.js. */
function nombreLimpio(respuestas) {
  const crudo = respuestas && respuestas.nombre;
  if (!esValida('nombre', crudo)) return null;
  const limpio = String(crudo).replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  return limpio || null;
}

/**
 * Aceita as duas formas de entrada de carta, para nao amarrar este motor ao
 * formato interno de quem embaralha:
 *   { carta: {...datos/cartas.json}, invertida }
 *   { ...datos/cartas.json, invertida }
 * Entrada quebrada vira null e a posicao simplesmente nao sai — nunca lanca.
 */
function normalizarTirada(tirada) {
  if (!Array.isArray(tirada)) return [null, null, null];
  const salida = [];
  for (let i = 0; i < 3; i += 1) {
    const entrada = tirada[i];
    if (!entrada || typeof entrada !== 'object') {
      salida.push(null);
      continue;
    }
    const carta = entrada.carta && typeof entrada.carta === 'object' ? entrada.carta : entrada;
    const valida =
      carta && typeof carta.id === 'string' && typeof carta.amor === 'string' && carta.amor.trim().length > 0;
    if (!valida) {
      salida.push(null);
      continue;
    }
    const marca = entrada.invertida !== undefined ? entrada.invertida : carta.invertida;
    salida.push({ carta, invertida: Boolean(marca) });
  }
  return salida;
}

/** O consejo que corresponde a orientacao, com fallback para o outro se faltar. */
function consejoDeOrientacion(carta, invertida) {
  const principal = invertida ? carta.consejoInv : carta.consejo;
  const respaldo = invertida ? carta.consejo : carta.consejoInv;
  const texto = typeof principal === 'string' && principal.trim() ? principal : respaldo;
  return typeof texto === 'string' ? texto.trim() : '';
}

/* Aplica as guardas pedidas a UMA parte. Devolve { texto, filtrado }.
 * `libro` e compartilhado pela posicao inteira: a alternativa entra uma vez. */
function proteger(texto, { contacto, futuro, alternativas, libro }) {
  let actual = String(texto == null ? '' : texto).trim();
  let contactoFiltrado = false;
  let futuroFiltrado = false;

  if (contacto) {
    const r = guardaContacto(actual, alternativas.contacto, libro.contacto);
    actual = r.texto;
    contactoFiltrado = r.filtrado;
  }
  if (futuro) {
    const r = guardaFuturo(actual, alternativas.futuro, libro.futuro);
    actual = r.texto;
    futuroFiltrado = r.filtrado;
  }
  return { texto: actual, contactoFiltrado, futuroFiltrado };
}

/* =================================================================================
 * componerLectura — a funcao publica
 * ================================================================================= */

/**
 * componerLectura({ respuestas, tirada })
 *
 * respuestas: { nombre, corte, cuando, hoy, intencion }  (ids de datos/preguntas.js)
 * tirada:     [ { carta, invertida } x3 ]  na ordem nudo, tension, extremo
 *
 * Devolve SEMPRE o mesmo formato, mesmo com entrada quebrada:
 *   {
 *     completa,          // onboardingCompleto() && as 3 cartas chegaram
 *     posiciones: [...], // 0 a 3 posicoes, na ordem CLAVES_POSICION
 *     sintesis: {...},
 *     limites: LIMITES,  // a tela e obrigada a renderizar
 *     filtros: {...}     // quais guardas dispararam, para teste e para a tela
 *   }
 *
 * Nunca lanca. Nunca le disco, relogio nem rede.
 */
export function componerLectura(entrada) {
  const datos = entrada && typeof entrada === 'object' ? entrada : {};
  const respuestas = datos.respuestas && typeof datos.respuestas === 'object' ? datos.respuestas : {};
  const cartas = normalizarTirada(datos.tirada);

  const contactoDuro = esContactoDuro(respuestas);
  const nombre = nombreLimpio(respuestas);

  const filtros = {
    contactoDuro,
    contactoAplicado: false,
    futuroAplicado: false,
    lenteMarcada: false,
  };

  const derecha = t('tirada.carta.derecha');
  const invertidaRotulo = t('tirada.carta.invertida');

  const posiciones = [];

  CLAVES_POSICION.forEach((clave, indice) => {
    const entradaCarta = cartas[indice];
    if (!entradaCarta) return;

    const { carta, invertida } = entradaCarta;
    const orientacion = invertida ? 'invertida' : 'derecha';

    /* Que guardas rodam nesta posicao:
     *  - contacto: sempre no extremo (TU EXTREMO nunca fala da outra pessoa);
     *              nas outras duas, so com o filtro duro ligado.
     *  - futuro:   so no extremo (TU EXTREMO nunca fala do futuro). */
    const conContacto = clave === 'extremo' || contactoDuro;
    const conFuturo = clave === 'extremo';

    const alternativas = {
      contacto: alternativa_('contacto', clave),
      futuro: alternativa_('futuro', clave),
    };
    const libro = { contacto: { usada: false }, futuro: { usada: false } };
    const opciones = { contacto: conContacto, futuro: conFuturo, alternativas, libro };

    /* --- cuerpo: a lente, VERBATIM. Nunca passa pelas guardas. ----------------
     * Quando a propria lente insinua contato e o filtro duro esta ligado, a lente
     * continua intacta e a posicao ganha um aviso que a neutraliza na mesma tela.
     * Reescrever a lente quebraria o contrato de conteudo; deixa-la sozinha
     * quebraria a promessa com a usuaria. O aviso resolve os dois.
     *
     * O aviso e calculado ANTES das demais partes e GASTA a alternativa de
     * contato desta posicao: ele ja e a frase de seguranca. Sem isso, a tela
     * mostraria o aviso e logo abaixo a alternativa, as duas comecando igual. */
    const cuerpo = carta.amor;
    let aviso = null;
    if (contactoDuro && sugiereContacto(cuerpo)) {
      aviso = alternativaAviso();
      filtros.lenteMarcada = true;
      libro.contacto.usada = true;
    }

    /* --- pregunta ------------------------------------------------------------- */
    let preguntaCruda;
    if (clave === 'nudo') preguntaCruda = texto('preguntaNudo', respuestas.corte);
    else if (clave === 'tension') preguntaCruda = texto('preguntaTension', respuestas.cuando);
    else preguntaCruda = texto('preguntaExtremo', respuestas.intencion);
    const pregunta = proteger(preguntaCruda, opciones);

    /* --- linea: o consejo citado ---------------------------------------------- */
    const consejo = consejoDeOrientacion(carta, invertida);
    let linea = null;
    let lineaFiltrada = { contactoFiltrado: false, futuroFiltrado: false };
    if (consejo) {
      const revisado = proteger(consejo, opciones);
      lineaFiltrada = revisado;
      const intacto = !revisado.contactoFiltrado && !revisado.futuroFiltrado;
      /* Citacao SO quando nada foi tocado: texto filtrado nunca se apresenta
       * entre comilhas, porque entre comilhas ele passaria por palavra da carta. */
      linea = intacto ? `${entradaDe(clave, orientacion)} «${consejo}»` : revisado.texto || null;
    }

    /* --- frase de posicion ---------------------------------------------------- */
    let fraseCruda;
    if (clave === 'nudo') {
      fraseCruda = texto('fraseNudo', respuestas.corte);
    } else if (clave === 'tension') {
      fraseCruda = `${texto('tiempo', respuestas.cuando)} ${texto('contacto', respuestas.hoy)}`;
    } else {
      fraseCruda = texto('fraseExtremo', respuestas.intencion);
    }
    const frase = proteger(fraseCruda, opciones);

    if (pregunta.contactoFiltrado || lineaFiltrada.contactoFiltrado || frase.contactoFiltrado) {
      filtros.contactoAplicado = true;
    }
    if (pregunta.futuroFiltrado || lineaFiltrada.futuroFiltrado || frase.futuroFiltrado) {
      filtros.futuroAplicado = true;
    }

    const parrafos = [pregunta.texto, cuerpo, aviso, linea, frase.texto].filter(
      (p) => typeof p === 'string' && p.trim().length > 0
    );

    posiciones.push(
      Object.freeze({
        clave,
        indice,
        rotulo: t(`tirada.rotulo.${clave}`),
        sub: t(`tirada.rotulo.${clave}.sub`),
        carta: Object.freeze({
          id: carta.id,
          nombre: carta.nombre,
          claves: Object.freeze(Array.isArray(carta.claves) ? carta.claves.slice() : []),
        }),
        invertida,
        orientacion: invertida ? invertidaRotulo : derecha,
        /* pregunta, linea e frase podem vir null: e o caso em que a guarda
         * esvaziou a parte porque a alternativa desta posicao ja foi gasta.
         * Para renderizar, use `parrafos` (ja sem buracos) ou `texto`. */
        pregunta: pregunta.texto || null,
        cuerpo,
        aviso,
        linea,
        frase: frase.texto || null,
        parrafos: Object.freeze(parrafos),
        texto: parrafos.join('\n\n'),
      })
    );
  });

  /* --- SINTESIS --------------------------------------------------------------- */

  /* A enumeracao das tres cartas. Sai da tirada, nao de tabela: se a posicao nao
   * existe, ela simplesmente nao aparece na frase. */
  const enumeradas = posiciones
    .map((p) => `${p.sub.toLowerCase()}, ${p.carta.nombre} ${p.orientacion.toLowerCase()}`)
    .join('; ');
  const lecturaTexto = [
    enumeradas ? `${sobreLaMesa()} ${enumeradas}.` : '',
    texto('lecturaCierre', respuestas.corte),
  ]
    .filter(Boolean)
    .join(' ');

  const tuParteTexto = texto('tuParte', respuestas.intencion);

  /* A acao passa pelas duas guardas SEMPRE: ela e a unica linha da leitura que
   * pede um gesto, e 'sintesis.accionNota' promete que esse gesto se completa
   * sozinho. Guarda ligada e o que sustenta a promessa. */
  const libroSintesis = { contacto: { usada: false }, futuro: { usada: false } };
  const accion = proteger(texto('accion', respuestas.intencion), {
    contacto: true,
    futuro: true,
    alternativas: { contacto: alternativa_('contacto', 'accion'), futuro: alternativa_('futuro', 'accion') },
    libro: libroSintesis,
  });
  if (accion.contactoFiltrado) filtros.contactoAplicado = true;
  if (accion.futuroFiltrado) filtros.futuroAplicado = true;

  const bloqueLectura = Object.freeze({
    clave: 'lectura',
    rotulo: t('sintesis.bloque.lectura'),
    texto: lecturaTexto,
  });
  const bloqueTuParte = Object.freeze({
    clave: 'tuparte',
    rotulo: t('sintesis.bloque.tuparte'),
    texto: tuParteTexto,
  });
  const bloqueAccion = Object.freeze({
    clave: 'accion',
    rotulo: t('sintesis.bloque.accion'),
    texto: accion.texto,
    nota: t('sintesis.accionNota'),
  });

  const sintesis = Object.freeze({
    titulo: t('sintesis.titulo'),
    /* O UNICO lugar da leitura inteira onde o nome aparece. Ver NOMBRE_APARECE_EN.
     * O nome NAO sai tambem como campo solto: a invariante que o teste cobra e
     * "a string do nome aparece exatamente uma vez no objeto inteiro", e um campo
     * `nombre` a mais so serviria para uma tela reimprimi-lo em outro lugar. */
    saludo: nombre ? t('sintesis.saludo', { nombre }) : saludoSinNombre(),
    lectura: bloqueLectura,
    tuParte: bloqueTuParte,
    accion: bloqueAccion,
    bloques: Object.freeze([bloqueLectura, bloqueTuParte, bloqueAccion]),
    metodo: t('sintesis.metodo'),
  });

  return Object.freeze({
    completa: onboardingCompleto(respuestas) && posiciones.length === 3,
    posiciones: Object.freeze(posiciones),
    sintesis,
    limites: limitesDeLaLectura(),
    filtros: Object.freeze(filtros),
  });
}

export default componerLectura;
