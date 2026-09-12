// datos/bancos.en.js
// O INGLES dos tres bancos do ano. Vizinho de datos/bancos.js, que continua
// sendo o PORTUGUES e a fonte do indice. Quem traduz para o espanhol trabalha em
// datos/bancos.es.js. Tres arquivos disjuntos, zero conflito de merge.
//
// ===========================================================================
// A FORMA: id -> texto, e mais nada
// ===========================================================================
// Aqui NAO se repete a estrutura do PT. Nada de `lunacoes`, nada de `forma`,
// nada de ordem. O motivo esta no cabecalho de datos/bancos.js:
//
//     "a ordem E o indice — mover uma linha para cima reescreve o historico
//      inteiro em silencio"
//
// Se este arquivo fosse uma lista paralela, a rotacao do dia passaria a depender
// de DOIS arrays que alguem tem de manter na mesma ordem para sempre, e o dia em
// que divergissem a inglesa veria a pergunta de outro dia sem erro nenhum.
// Entao o indice continua sendo SO do portugues: este arquivo e um mapa de
// consulta por `id`. Traduzir nao pode mudar qual item cai hoje.
//
// `lunacoes` e `forma` tambem nao entram por isso: sao ETIQUETAS DE ENCAIXE e de
// verificacao (`verificarBancos` mede exclusivas por lunacao e teto de forma).
// Duplicadas aqui, elas passariam a ter duas versoes da mesma verdade.
//
// ===========================================================================
// AS REGRAS QUE ESTE ARQUIVO HERDA — as cinco do cabecalho do PT
// ===========================================================================
// 1. NENHUMA PROMESSA DE DESFECHO. A outra pessoa nunca e sujeito de verbo, em
//    nenhuma linha. "he will come back", "you'll get them back", "they'll text
//    you" — nenhuma entra, nem como promessa disfarcada.
//    O INGLES E O IDIOMA QUE PASSAVA POR TODOS OS SETE PORTOES ANTIGOS:
//    `hablaDelFuturo()` de lib/lectura.js:423 le morfologia de futuro PT/ES
//    (-ra/-rao/-ran) e "will come back" nao tem terminacao para morder. Quem
//    escreve aqui e o ultimo portao antes da loja, junto com
//    test/madremaria-promessa-tres-idiomas.test.js.
// 2. AS CONTENCOES SAO CONVITE, NUNCA PROIBICAO. Nenhuma diz "don't text them".
//    Todas dizem o que fazer FIRST — e "first" pressupoe que mandar continua
//    sendo opcao dela. Sem consequencia descrita, e nunca o gesto como coisa que
//    produz efeito na outra pessoa (o eufemismo classico do nicho, "no contact
//    works wonders", e a promessa proibida dita pelo avesso).
// 3. AS AFIRMACOES SAO DELA SOBRE ELA. Primeira pessoa, PRESENTE. Nenhuma no
//    futuro ("someday I will understand" e promessa com outra roupa), nenhuma
//    sobre a outra pessoa, nenhuma alegacao de saude.
// 4. NENHUMA PERGUNTA PEDE PREVISAO nem o que a outra pessoa pensa. "Not this
//    month" continua sendo resposta legitima nas treze lunacoes.
// 5. NENHUM TEXTO PUNE FALTA.
//
// SEM "will" EM LUGAR NENHUM deste arquivo, e a regra e de forma: o portao tem
// seis formulas de promessa inglesa montadas sobre `will` e sobre a contracao
// `'ll` com a outra pessoa como sujeito. A voz da Madre e presente; quando
// precisa de projecao, usa o condicional de QUEM LE ("what you would do",
// "what you want to stay true"), nunca futuro de terceira pessoa.
//
// ===========================================================================
// A VOZ — e ela que atravessa, nao as palavras
// ===========================================================================
// Fala com UMA pessoa, baixinho. Frases curtas, ela respira entre elas. Acolhe
// sem prometer. Nao julga a decisao de ninguem.
//
// "Madre Maria" CONTINUA "Madre Maria": nome proprio, nao se traduz.
//
// GENERO: "that person", "they/them" — o ingles ja tem o singular they e ele e o
// que este app usa. Nunca "he" nem "she" para quem esta do outro lado, mesmo
// quando o PT usa "ele/ela" por exigencia gramatical.
//
// GESTO QUE TEM DE SER FAZIVEL FORA DO BRASIL. Os trinta e um gestos de
// contencao foram conferidos um por um: agua, escada, janela, esquina, cozinha,
// agasalho, musica, foto — todos existem em qualquer pais. Nenhum dependia de
// coisa brasileira, entao nenhum precisou de equivalente.
//
// ===========================================================================
// O QUE FALTA AQUI DE PROPOSITO
// ===========================================================================
// Nada. Os 179 ids do PT (98 reflexoes + 50 afirmacoes + 31 contencoes) estao
// traduzidos. Um id que venha a faltar cai no portugues por `textoDoBanco()` em
// datos/bancos.js — fallback honesto, nunca texto inventado.

export const BANCOS_EN = Object.freeze({
  /* ===============================================================================
   * 1. REFLECTIONS — what she answers in writing.
   *
   * The thirty day-questions first, in the same order as the Portuguese. Order
   * means nothing here (the index lives in datos/bancos.js), but it is kept so a
   * line-by-line review against the original stays possible.
   * ============================================================================ */

  /* --- the thirty day-questions ------------------------------------------------ */
  'hora-leve': 'Which hour of today was the lightest, and what were you doing?',
  'comeu-sentada': 'What did you eat today, and did you eat sitting down?',
  'primeiro-pensamento': 'What was the first thing you thought when you woke up today?',
  'som-conhecido': 'Which sound from today would you recognise with your eyes closed?',
  'pediu-mais': 'What asked more of you today than you expected?',
  'onde-pesou': 'Where did your body carry the most weight today: shoulder, chest, jaw, stomach?',
  'faria-de-qualquer-jeito': 'What did you do today that you would have done anyway, with this story or without it?',
  'vontade-de-rir': 'What was the silliest thing that made you want to laugh today?',
  'tela-sem-escolher': 'How much time did you spend today looking at a screen without having chosen to?',
  'adiou-hoje': 'What did you put off today, and why?',
  'duas-horas-a-mais': 'If today had lasted two hours longer, what would you have done with them?',
  'casa-do-jeito': 'Which part of your home is the way you like it, and which part is not?',
  'agradeceu-calada': 'What were you grateful for today without saying it out loud?',
  'conversa-que-somou': 'Which conversation today left you better than you were before it?',
  'repetiu-a-semana': 'What did you repeat today that you had been repeating all week?',
  'hora-da-fome': 'What time today were you hungriest, and what did you do about it?',
  'decisao-inteira': 'What today was your decision, from start to finish?',
  'cheiro-que-ficou': 'Which smell from today stayed with you?',
  'roupa-para-quem': 'What clothes did you choose today, and who did you choose them for?',
  'pela-metade': 'What did you leave half done today?',
  'hora-silenciosa': 'What was the quietest hour of your day?',
  'aprendeu-hoje': 'What did you learn today that you did not know yesterday, however small?',
  'dia-em-uma-frase': 'If you had to tell today in one sentence, what would it be?',
  'custou-sem-valer': 'What cost you money, time or energy today without being worth any of the three?',
  'gesto-de-cuidado': 'Which small gesture today was only care for yourself?',
  'nem-casa-nem-trabalho': 'Where were you today that was neither home nor work?',
  'esqueceu-das-horas': 'What was the moment today when you forgot the time?',
  'ninguem-ia-saber': 'What would you have done today if nobody were going to know?',
  'promessa-cumprida': 'What small promise did you make to yourself this week, and keep?',
  'tirou-do-lugar': 'What knocked you off balance today, and for how long?',

  /* --- the ground: naming (1), the routine (2), what was already mine (3) ------ */
  'por-onde-comecaria': 'If you told what happened without tidying a single sentence, where would you start?',
  'palavra-usada': 'Which word have you been using to name this, and is it the right word?',
  'duas-versoes': 'Which version of this story do you tell other people, and which one do you tell yourself?',
  'data-marcada': 'Which date stayed marked, and what do you actually remember about it?',
  'frase-repetida-de-cabeca': 'Which sentence said back then do you still repeat in your head?',
  'titulo-da-historia': 'If this story had a title, what would it be today?',
  'uma-frase-sem-justificar': 'What would you say happened, in one sentence, without justifying anything?',
  'comeco-do-dia': 'How does your day start now, from the alarm to leaving the bedroom?',
  'horario-que-mudou': 'Which hour of your day changed shape in this time?',
  'parou-sem-decidir': 'What did you stop doing without having decided to stop?',
  'semana-igual': 'Which part of your week is still exactly the same?',
  'o-sono-mudou': 'What changed in your sleep in this time, if anything did?',
  'hora-so-sua': 'Which hour of your day is only yours today?',
  'continua-seu': 'What was yours before and is still yours: an object, a place, a habit, a person?',
  'ficou-de-lado': 'Which song, book or place got left aside in this time?',
  'habilidade-intacta': 'Which skill of yours did nobody take from you?',
  'sozinha-e-gostava': 'What did you do on your own and enjoy, before all of this?',

  /* --- the knot: the urge has an hour (4), I know or I assume (5), my part (6) -- */
  'hora-da-vontade': 'What time today did the urge to say something press hardest?',
  'antes-da-vontade': 'What usually comes just before that urge: hunger, tiredness, silence, a photo?',
  'vontade-passou-sozinha': 'Where were you the last time that urge passed on its own?',
  'viu-ou-montou': 'What do you know because you saw or heard it, and what did you assemble in your head?',
  'sem-dado-novo': 'Which story did you rebuild today without a single new piece of information?',
  'qual-e-a-prova': 'If someone asked you for proof of what you are assuming, what would you show them?',
  'parte-sem-aumentar': 'What was your part, told without making it bigger?',
  'parte-sem-diminuir': 'What was your part, told without making it smaller?',
  'nao-era-seu-carregar': 'What was not yours to carry and you carried it anyway?',
  'faria-de-novo': 'What did you do back there that you would do again, with no shame at all?',

  /* --- the widening: other threads (7), anger (8), what I want (9) ------------- */
  'apareceu-sem-chamar': 'Who turned up in your week without you calling them?',
  'conversa-que-nao-e-sobre-isso': 'How long has it been since you talked with someone you love about any other subject?',
  'mesa-abandonada': 'Which group, class or table did you abandon that still exists?',
  'quem-te-procurou': 'Who reached out to you this month, and what did you answer?',
  'raiva-nao-dita': 'What went unsaid on the side of the anger?',
  'frase-nunca-mandada': 'Which sentence have you written in your head about ten times and never sent?',
  'nao-concordo-mais': 'What exactly do you no longer agree with?',
  'quero-sem-citar': 'What do you want, said without naming anyone?',
  'verdade-daqui-a-um-ano': 'What do you want to stay true about you, whatever happens?',
  'desejo-sem-resposta': 'Which wish of yours depends on nobody answering?',

  /* --- the capacity: trusting (10), what gets said (11), the year (12), the moon (13) */
  'confiar-em-quem-for': 'What would you need in order to trust again, whoever it is?',
  'sinal-de-seguranca': 'Which sign makes you feel safe with anyone: a friend, a boss, a neighbour?',
  'tres-frases': 'What would you say if you had three sentences, and what stays only yours?',
  'mudou-de-tom': 'Reading what you wrote over the last few months, what changed in tone?',
  'pergunta-que-abre': 'Which question do you want to open now?',

  /* --- THE EXCLUSIVE ONES: two per lunation, none falls in more than one ------- */
  'nunca-escrita-em-lugar-nenhum': 'Which part of this story have you never written down anywhere?',
  'sem-os-porques': 'If you took every why out of what happened, what would be left as fact?',
  'hora-identica-a-ontem': 'Which hour of your day today was identical to yesterday, minute by minute?',
  'primeira-voz-do-dia': 'What is the first hour of your day when you speak to someone out loud?',
  'guardado-numa-caixa': 'Which thing of yours has been kept in a box, a folder or a wardrobe for months?',
  'gosto-que-parou-de-defender': 'Which taste of yours did you stop defending at a table?',
  'dia-da-semana-da-vontade': 'On which day of the week does that urge tend to show up more than once?',
  'horas-sem-a-vontade': 'Which part of today went by without the urge showing up even once?',
  'visto-com-os-proprios-olhos': 'What is the last thing you know because you saw it with your own eyes?',
  'suposicao-que-mudou-sozinha': 'Which assumption of yours changed shape in the last thirty days with no new information?',
  'diferente-e-igual': 'What would you do differently, and what would you do the same? Both, in that order.',
  'nao-estava-na-sua-mao': 'Which part of this was not in your hands at all?',
  'quem-mora-mais-perto': 'Who in your life lives closest to you, in kilometres?',
  'aniversario-de-cabeca': 'Whose is the last birthday you remember without checking your phone?',
  'regra-que-nao-se-abre-mao': 'Which rule of yours do you no longer bend, whatever happens?',
  'irritaria-numa-pessoa-nova': 'What would bother you today in someone you had just met?',
  'cabe-num-sabado': 'Which thing you want would fit into a Saturday, without depending on anyone else?',
  'quero-sem-custar-dinheiro': 'What do you want that costs no money at all?',
  'relaxa-os-ombros': 'Which attitude, coming from anyone, makes your shoulders drop?',
  'saber-de-antemao': 'What do you need to know beforehand in order to say yes to a plan with someone?',
  'olho-no-olho-ou-papel': 'Which sentence of yours would you say looking someone in the eye, and which one would only fit on paper?',
  'limite-de-tres-palavras': 'What would you say today in three words, if three were the limit?',
  'nao-lembrava-de-ter-escrito': 'Which entry of yours did you not remember writing?',
  'releria-agora': 'Which old entry of yours would you reread now, if you could pick one?',
  'pergunta-que-fica-para-tras': 'Which question from this turn do you no longer want to carry?',
  'daqui-a-treze-luas': 'Which question would you ask yourself thirteen moons from now?',

  /* ===============================================================================
   * 2. AFFIRMATIONS — HER sentences about HERSELF.
   *
   * First person, PRESENT, all fifty. No other person, no outcome, no health
   * claim: right, choice and capacity.
   * ============================================================================ */
  'sozinha-sem-perdida': 'I can be alone without being lost.',
  'sinto-e-sigo-dona': 'I feel what I feel and I am still the owner of my day.',
  'meu-tempo': 'The time I am taking is my time.',
  'sem-explicacao': 'I owe no one an explanation for the way I go through this.',
  'silencio-sem-abandono': 'I know how to stay silent without abandoning myself.',
  'minha-parte-existe': 'Today I take care of the part that is mine, which is the part that exists.',
  'mudar-de-ideia': 'I can change my mind without betraying who I have been until now.',
  'calma-nao-guardada': 'My calm is not being kept by anyone else.',
  'minha-noite': 'I choose what I do with my evening.',
  'nada-errado-em-mim': 'Nothing in me is wrong because this story did not close.',
  'mais-constante': 'I am the most constant person in my life.',
  'nao-estar-bem-com-respeito': 'I have the right not to be okay today and still treat myself with respect.',
  'esperar-sem-parar': 'I can wait without standing still.',
  'dia-que-nao-depende': 'My day has things in it that depend on nobody.',
  'fiz-bem-no-que-deu-errado': 'I recognise what I did well, even inside what went wrong.',
  'devolvo-o-resto': 'I carry my part and I hand back the rest.',
  'nao-entender-tudo': 'I do not need to understand everything today in order to live today.',
  'memoria-tambem-minha': 'I have a good memory and it is mine too.',
  'saudade-nao-manda': 'Missing someone fits inside me without running my week.',
  'falo-como-com-amiga': 'I speak to myself the way I would speak to a friend.',
  'querer-sem-correr': 'I can want something and still do nothing about it today.',
  'moro-no-meu-corpo': 'My body is the place where I live, and I take care of where I live.',
  'sei-o-que-nao-aceito': 'I know what I no longer accept.',
  'ocupar-espaco': 'I have the right to take up space in a conversation.',
  'escolho-quem-sabe': 'I choose who knows about my life.',
  'descanso-sem-merecer': 'I let myself rest without having earned it first.',
  'hoje-sem-desfecho': 'I can get through today without demanding an ending from myself.',
  'amizades-existem': 'My friendships exist, and I can reach them.',
  'nao-sou-meu-pior-dia': 'I am not the worst day I have had.',
  'gostos-meus': 'I have tastes of my own and they are not up for negotiation.',
  'nao-e-ser-boa': 'I know how to say no and still be a good person.',
  'rotina-um-horario': 'I build my routine, one hour at a time.',
  'raiva-sem-injustica': 'I can feel anger without becoming an unfair person.',
  'reparo-nas-pequenas': 'I notice small things and that is a quality of mine.',
  'paciencia-comigo': 'I give myself the patience I usually give other people.',
  'o-que-entra-antes-de-dormir': 'I choose what goes into my head before I sleep.',
  'vida-acontecendo-agora': 'I have a life that keeps happening right now.',
  'pedir-ajuda': 'I can ask for help without being weak.',
  'confio-na-minha-leitura': 'I trust my own reading of things.',
  'aprendizado-e-meu': 'What I learned in this time is mine.',
  'valor-fora-do-amor': 'I have worth outside of any love story.',
  'falar-ou-guardar': 'I decide when to speak and when to keep it to myself.',
  'pergunta-em-aberto': 'I can sit with an open question.',
  'recomecar-pequeno': 'I am able to start one small thing over today.',
  'sem-ser-exemplo': 'I do not need to be an example of anything for anyone.',
  'falta-sem-agir': 'I have the right to miss someone and do nothing about it.',
  'me-reconheco': 'I look in the mirror and I recognise the person standing there.',
  'meu-passo': 'I walk at my own pace, and my pace works for me.',
  'projetos-meus': 'I have projects that are only mine.',
  'volto-para-mim': 'I come back to myself when I lose sight of me.',

  /* ===============================================================================
   * 3. HOLDING GESTURES — for the moment the urge to write arrives.
   *
   * INVITATION, never prohibition: none of them says "do not send it". They all
   * say what to do FIRST, and "first" leaves sending as her option. Reversible,
   * with no consequence described, and in no line does the gesture appear as
   * something that produces an effect on the other person.
   *
   * The opening is the same in all thirty-one — "If the urge to send comes" — just
   * as in the Portuguese: the repeated formula is the recognition of the moment,
   * and what varies is the gesture. The PT `forma` tags (writing, body, time,
   * place, voice, keeping, naming, object, counting) survive in the variety of the
   * gestures, even though the tag itself lives only in datos/bancos.js.
   * ============================================================================ */
  'escreve-aqui-primeiro': 'If the urge to send comes, write here first. Whatever comes out here stays on this phone.',
  'inteira-depois-le': 'If the urge to send comes, write here, in full, what you would say, and read it once you finish. It stays yours, whether it leaves here or not.',
  'marca-a-hora': 'If the urge to send comes, write down the time on a piece of paper. Only the time. After that you do as you please.',
  'copo-de-agua': 'If the urge to send comes, drink a glass of water to the bottom before deciding.',
  'sai-do-comodo': 'If the urge to send comes, step out of the room you are in and come back. The urge comes along or it does not.',
  'frase-que-quer-ouvir': 'If the urge to send comes, write down first the sentence you would like to hear. Then look at both.',
  'outra-mao': 'If the urge to send comes, move the phone to your other hand for a minute.',
  'o-que-quer-que-aconteca': 'If the urge to send comes, write here what you would like to happen next. It stays yours.',
  'escada-ou-esquina': 'If the urge to send comes, walk down a flight of stairs and back up, or to the corner and back.',
  'le-em-voz-alta': 'If the urge to send comes, read out loud what you wrote. Your voice is the first reader.',
  'tres-frases-depois-uma': 'If the urge to send comes, write the same thing in three sentences, then in one.',
  'guarda-o-rascunho': 'If the urge to send comes, keep the draft here and write on paper the time to reread it.',
  'cinco-minutos-antes': 'If the urge to send comes, write here what was happening five minutes before the urge arrived.',
  'manda-para-voce': 'If the urge to send comes, send it to yourself first, in another app, and read it as though it came from someone else.',
  'musica-inteira': 'If the urge to send comes, pick a whole song and listen to the end of it. Then come back here.',
  'palavra-que-travou': 'If the urge to send comes, write here which word you got stuck on.',
  'dois-pes-no-chao': 'If the urge to send comes, sit down and put both feet on the floor until you have counted to sixty.',
  'se-nao-tivesse-vindo': 'If the urge to send comes, write what you would be doing now if that urge had not arrived. Then pick one of the two.',
  'janela-e-dez-respiracoes': 'If the urge to send comes, open the window and look outside while you count ten breaths.',
  'data-e-frase': 'If the urge to send comes, write here today’s date and the sentence, nothing else. The record is yours.',
  'agua-fria-no-rosto': 'If the urge to send comes, wash your face with cold water and come back to the phone.',
  'arruma-a-mesa': 'If the urge to send comes, tidy one thing on your desk before you write a single word.',
  'o-que-mandaria-ontem': 'If the urge to send comes, write here what you would have sent yesterday, had you sent it.',
  'liga-para-alguem': 'If the urge to send comes, call someone you love and talk about any other subject for five minutes.',
  'poe-um-titulo': 'If the urge to send comes, write here and give the page a title. The title usually says more than the text.',
  'come-alguma-coisa': 'If the urge to send comes, walk to the kitchen and eat something. Hunger and urges feel alike from the inside.',
  'ultima-frase-pela-metade': 'If the urge to send comes, write here and leave the last sentence half finished. Come back to it later.',
  'foto-do-lugar': 'If the urge to send comes, take a photo of the place where you are now. It is a record of your day.',
  'conta-os-eu': 'If the urge to send comes, write here and count how many times the word "I" appears.',
  'dois-minutos-na-porta': 'If the urge to send comes, put on a coat and stand two minutes at your front door.',
  'verdade-amanha-de-manha': 'If the urge to send comes, write here what you would like to stay true once the day turns over.',
});

export default BANCOS_EN;
