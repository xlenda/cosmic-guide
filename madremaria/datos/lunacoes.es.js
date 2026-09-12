// datos/lunacoes.es.js
// ESPANHOL dos treze temas do arco. Vizinho de datos/lunacoes.js, um arquivo por
// idioma — mesma forma que a Onda 1 fixou em datos/textos.es.js, e pelo mesmo
// motivo: dois tradutores em paralelo nunca colidem no mesmo arquivo, e o PT
// fica ONDE ESTA porque testes de doutrina abrem o original com readFileSync e
// casam regex contra a copy crua.
//
// ===========================================================================
// DE ONDE VEIO ESTE ESPANHOL — e por que nao e uma traducao nova
// ===========================================================================
// Este funil NASCEU em espanhol (vestigios no codigo: 'respuestas', 'almacen',
// 'preguntas', 'cuerpo', 'hechos'). Quando a Onda 1 traduziu o dicionario de
// tela, `nome`, `pergunta` e `abertura` das treze lunacoes JA existiam em
// datos/textos.es.js, nas chaves 'ano.lunacao.N.titulo', '.pergunta' e
// '.abertura' (linhas 412-450). Essas 39 entradas foram copiadas VERBATIM de
// la: e a voz que o app ja fala na tela, e duas redacoes diferentes do mesmo
// texto em dois arquivos e um defeito que aparece na cara da usuaria quando o
// tema abre na Lua Nova e repete no card do ano.
// Os 37 restantes (`fecho`, `foco`, os cinco blocos do ARCO e a nota do CICLO)
// nao existiam em idioma nenhum fora do PT e foram escritos aqui.
//
// ===========================================================================
// O QUE A TRADUCAO NAO PODE PERDER (do cabecalho do original)
// ===========================================================================
//  · A outra pessoa NUNCA e sujeito de verbo. O tema descreve o DIA de quem le.
//  · NENHUM texto promete, cobra ou conclui: o arco serve aos dois desfechos e
//    nao vota em nenhum. "Este mes nao" e resposta legitima em todo tema.
//  · Lunacao 6: SIMETRIA obrigatoria em cada frase — ni la historia entera, ni
//    nada. Sem a segunda metade o texto vira maquina de culpa.
//  · Lunacao 10: a formulacao "en quien sea" entra em CADA campo, nao so no
//    titulo. Sem ela, confianca-como-capacidade vira ensaio de conversa.
//  · Lunacao 13 diz "esta cerrando", nunca "cerro": na abertura do tema 13 so
//    DOZE lunacoes se fecharam. Tempo verbal aqui e medida, nao estilo.
//  · Os numeros (354 / 384 / 365 / ~11 dias) NAO mudam: sao o recibo do CICLO.
//
// ===========================================================================
// FORMA — dicionario plano, chave igual nos tres idiomas
// ===========================================================================
// Chave: 'arco.<id>.<campo>' | 'lunacao.<numero>.<campo>' | 'ciclo.nota'.
// Plano de proposito, igual a datos/textos.js: chave morta aparece como chave
// na tela (bug visivel em QA), nunca como tela branca.
//
// NAO SE TRADUZ, e por isso esta fora deste arquivo: `numero`, `bloco`, `id`,
// `lunacoes` e todos os numeros de CICLO. Mudar um id orfana o dado do disco
// sem levantar erro nenhum.
// ===========================================================================

export const ES = {
  /* --- O ARCO: os cinco agrupamentos ------------------------------------- */
  'arco.chao.nome': 'El suelo',
  'arco.chao.porque':
    'El terreno: qué pasó, cómo es el día ahora, y qué ya era tuyo antes. Todo lo que se nombra aquí sigue siendo verdad en los dos desenlaces posibles.',
  'arco.laco.nome': 'El lazo',
  'arco.laco.porque':
    'El costo diario: el impulso con horario, la rumia, y el tamaño de la parte. Es el bloque que más necesita contrapeso, y el contrapeso viene del bloque anterior.',
  'arco.alargamento.nome': 'El ensanchamiento',
  'arco.alargamento.porque':
    'La mitad exacta del arco, donde el foco sale del vínculo: quién más existe, qué quedó sin decir, y qué se quiere sin mencionar a nadie.',
  'arco.capacidade.nome': 'La capacidad',
  'arco.capacidade.porque':
    'La confianza como capacidad general y el límite dicho en los dos sentidos. Son las dos lunaciones más resbaladizas del año: las dos invitan al "prepárate para la conversación", y las dos se niegan.',
  'arco.fechamento.nome': 'El cierre',
  'arco.fechamento.porque':
    'Archivo y devolución. Separar el archivo (12) del cierre (13) impide que el último mes haga las dos cosas a la vez y termine siendo un veredicto.',

  /* --- 1 · NOMBRAR -------------------------------------------------------
   * nome/pergunta/abertura: VERBATIM de textos.es.js (ano.lunacao.1.*). */
  'lunacao.1.nome': 'Nombrar lo que fue',
  'lunacao.1.pergunta': '¿Qué pasó, dicho con tus palabras y sin arreglar la frase?',
  'lunacao.1.abertura':
    'Esta lunación empieza por el principio: qué pasó, escrito por ti, como salga. No hace falta que quede bonito ni que tenga sentido para nadie más — se queda en este aparato.',
  /* PT: "ele volta para você exatamente como está" — o sujeito e O QUE ELA
   * ESCREVEU, nao a outra pessoa. Em espanhol "vuelve a ti" e ambiguo na tela e
   * casa com a formula 'desenlace declarado' do portao de doutrina (medido: o
   * portao acusou esta linha). Conserto sem perder o sentido: o sujeito volta a
   * ser nomeado — o texto, explicito, no lugar do pronome implicito. */
  'lunacao.1.fecho':
    'Lo que escribiste en esta lunación quedó guardado con la fecha. Cuando la luna cierre la vuelta, la app te devuelve ese texto exactamente como está.',
  'lunacao.1.foco':
    'El plan del día abre espacio para escribir y la pregunta tira para el registro, nunca para la interpretación. La app no resume nada ni comenta nada.',

  /* --- 2 · LA RUTINA ----------------------------------------------------- */
  'lunacao.2.nome': 'La rutina que sobró',
  'lunacao.2.pergunta': '¿Cómo es un día tuyo ahora, desde que despiertas hasta que apagas la luz?',
  'lunacao.2.abertura':
    'Después de nombrar lo que fue, sobra una cosa de veinticuatro horas de largo: el martes. Esta lunación mira la forma de tu día, no la historia.',
  'lunacao.2.fecho':
    'El día tiene una forma, y quedó descrita con tus palabras. Lo que hagas con esa forma sigue siendo tu decisión.',
  'lunacao.2.foco':
    'Los gestos del día quedan anclados en hora y lugar concretos — el café, el trayecto, la hora de acostarse. Es el único terreno donde cabe un gesto pequeño.',

  /* --- 3 · LO QUE YA ERA MÍO -------------------------------------------- */
  'lunacao.3.nome': 'Lo que ya era mío',
  'lunacao.3.pergunta': '¿Qué era tuyo antes de ese vínculo y sigue siendo tuyo?',
  'lunacao.3.abertura':
    'Esta lunación pide cosas concretas y no conceptos: el café, el camino, la música, la amistad. El material viene del mes que pasó, que ya está apuntado aquí.',
  'lunacao.3.fecho':
    'Lo que entró en esta lista sigue siendo tuyo de cualquier manera. La lista queda guardada, y es de ella que la app saca un gesto cuando un día se pone duro.',
  'lunacao.3.foco':
    'El gesto del día pasa a salir de la lista que escribiste, en vez de venir hecho de la app.',

  /* --- 4 · LAS GANAS TIENEN HORA ---------------------------------------- */
  'lunacao.4.nome': 'Las ganas tienen hora',
  'lunacao.4.pergunta': '¿A qué hora te aprietan las ganas de decir algo?',
  'lunacao.4.abertura':
    'Las ganas de decir algo suelen tener horario, y cada persona tiene el suyo. Esta lunación no pide contención: pide que te fijes en cuál es el tuyo.',
  'lunacao.4.fecho':
    'Las ganas tienen hora, y ahora esa hora está apuntada. Lo que hagas con ella sigue siendo tu decisión.',
  'lunacao.4.foco':
    'El día gana un campo con horario: la frase entera cabe ahí, como vino y con la hora en que vino.',

  /* --- 5 · SÉ O SUPONGO ------------------------------------------------- */
  'lunacao.5.nome': 'Sé o supongo',
  'lunacao.5.pergunta': '¿Dónde termina lo que sabes y empieza lo que reconstruyes de cabeza?',
  'lunacao.5.abertura':
    'Ninguna carta lee a esa persona, y este aparato tampoco. Lo que se puede hacer es separar lo que sabes de lo que vienes suponiendo.',
  'lunacao.5.fecho':
    'Quedó apuntado lo que es sabido y lo que es supuesto, uno al lado del otro y con la fecha. Nada aquí dice cuál de los dos es más grande.',
  'lunacao.5.foco':
    'La pregunta del día pasa a pedir la marca en dos columnas: esto lo sé, esto lo supongo.',

  /* --- 6 · EL TAMAÑO DE MI PARTE ---------------------------------------
   * SIMETRIA em cada frase: "ni la historia entera, ni nada". */
  'lunacao.6.nome': 'El tamaño de mi parte',
  'lunacao.6.pergunta': '¿Cuál fue tu parte, dicha sin aumentar y sin disminuir?',
  'lunacao.6.abertura':
    'Tu parte no es la historia entera, y tampoco es nada. Esta lunación pide su tamaño, con las dos mitades en la misma pantalla.',
  'lunacao.6.fecho':
    'Ni la historia entera, ni nada: lo que quedó escrito fue el tamaño. Queda guardado y es tuyo para revisarlo cuando quieras.',
  'lunacao.6.foco':
    'Toda pantalla de esta lunación trae las dos mitades juntas — lo que fue tuyo y lo que no lo fue. Ningún campo acepta solo una de ellas.',

  /* --- 7 · LOS OTROS HILOS --------------------------------------------- */
  'lunacao.7.nome': 'Los otros hilos',
  'lunacao.7.pergunta': '¿Quién más está en tu vida, y cuánto tiempo llevas sin mirar eso?',
  'lunacao.7.abertura':
    'Esta lunación entera no es sobre esa persona: es inventario de lo que ya existe. La hermana, el colega, la vecina, el grupo que quedó parado en marzo.',
  'lunacao.7.fecho':
    'La lista es del tamaño que es y no necesita crecer. Queda guardada, con la fecha.',
  'lunacao.7.foco':
    'El gesto del día puede involucrar a alguien de la lista que escribiste — y nunca a esa persona.',

  /* --- 8 · LA RABIA NO DICHA ------------------------------------------
   * "No tener rabia este mes es una respuesta legítima" tem de sobreviver:
   * sem essa frase o tema prescreve estado. */
  'lunacao.8.nome': 'La rabia no dicha',
  'lunacao.8.pergunta': '¿Qué quedó sin decir del lado de la rabia?',
  'lunacao.8.abertura':
    'Esta lunación abre un lugar para lo que quedó sin decir del lado de la rabia. No tener rabia este mes es una respuesta legítima, y el día sigue igual.',
  'lunacao.8.fecho':
    'Lo que escribiste aquí no salió de este aparato y no va a salir. Quedó escrito, y escribir no es lo mismo que resolver.',
  'lunacao.8.foco':
    'La escritura del día es cerrada: nada de esta lunación tiene botón de enviar, compartir ni copiar.',

  /* --- 9 · LO QUE YO QUIERO ------------------------------------------- */
  'lunacao.9.nome': 'Lo que yo quiero',
  'lunacao.9.pergunta': '¿Qué quieres, dicho sin mencionar a nadie?',
  'lunacao.9.abertura':
    'La regla de esta lunación es una sola: escribir lo que quieres sin mencionar a nadie. La app no sabe lo que deberías querer, y no vota.',
  'lunacao.9.fecho':
    'Lo que quedó escrito sigue siendo legible de cualquier manera, porque no depende de nadie para ser leído. Queda guardado, con la fecha.',
  'lunacao.9.foco':
    'La pregunta del día está siempre formulada sin mencionar a terceros, y el pedido es que la respuesta también lo esté.',

  /* --- 10 · CONFIAR DE NUEVO ------------------------------------------
   * "en quien sea" em CADA campo, nao so no titulo. */
  'lunacao.10.nome': 'Confiar de nuevo',
  'lunacao.10.pergunta': '¿Qué necesitarías para confiar de nuevo — en quien sea?',
  'lunacao.10.abertura':
    'La formulación de esta lunación es "en quien sea", y vale todos los días de aquí a la próxima luna nueva. La confianza aquí es capacidad general, no preparación para una conversación concreta.',
  'lunacao.10.fecho':
    'La lista de condiciones es tuya y quedó apuntada. Sirve para cualquier vínculo, y no tiene plazo.',
  'lunacao.10.foco':
    'Todo gesto del día se puede completar hoy y a solas. Ninguno es ensayo de conversación, y la formulación "en quien sea" aparece en cada pantalla.',

  /* --- 11 · LO QUE SE DICE ------------------------------------------- */
  'lunacao.11.nome': 'Lo que se dice',
  'lunacao.11.pergunta': '¿Qué dirías, y qué se queda siendo solo tuyo?',
  'lunacao.11.abertura':
    'Esta lunación trabaja los dos lados del límite: lo que se dice y lo que se queda siendo solo tuyo. La carta que no se envía cuenta igual.',
  'lunacao.11.fecho':
    'Quedó escrito de los dos lados, y nada de esto salió del aparato. Es la última lunación de material nuevo: las dos siguientes trabajan con lo que ya escribiste.',
  'lunacao.11.foco':
    'La pantalla del día tiene dos campos uno al lado del otro — lo que saldría de la boca y lo que se queda guardado. Ninguno de los dos tiene botón de enviar.',

  /* --- 12 · EL AÑO POR DENTRO --------------------------------------- */
  'lunacao.12.nome': 'El año por dentro',
  'lunacao.12.pergunta': '¿Qué guardó este año de ti, con tu letra?',
  'lunacao.12.abertura':
    'Esta lunación es archivo. La app abre lo que escribiste, lunación por lunación, con las fechas, y no resume nada.',
  'lunacao.12.fecho':
    'Lo que leíste lo escribiste tú, con la fecha al lado. Aquí la app es índice, no intérprete.',
  'lunacao.12.foco':
    'El plan del día cambia la pregunta nueva por la relectura de una entrada antigua, en el orden de las lunaciones. Ninguna entrada viene comentada.',

  /* --- 13 · LA MISMA LUNA ------------------------------------------
   * "está cerrando", nunca "cerró". Os numeros 354 / 384 / 365 nao mudam. */
  'lunacao.13.nome': 'La misma luna',
  'lunacao.13.pergunta':
    'La luna está cerrando una vuelta. ¿Qué pregunta quieres abrir en la próxima?',
  'lunacao.13.abertura':
    'Esta es la decimotercera lunación, y es la que cierra la vuelta. Doce lunaciones suman 354 días, trece suman 384 y el año civil tiene 365: la luna y el calendario no cierran juntos, y nunca cerraron.',
  'lunacao.13.fecho':
    'La línea de la primera lunación está aquí, con la fecha, como la dejaste. La pregunta de la próxima vuelta es tuya para escribirla.',
  'lunacao.13.foco':
    'El día devuelve textualmente la primera entrada de la lunación 1, con la fecha, y pide una pregunta — nunca una conclusión.',

  /* --- El CICLO: medida, no doctrina ------------------------------- */
  'ciclo.nota':
    'El mes sinódico varía; ninguno de estos números se convierte en calendario fijo. El desfase de ~11 días entre doce lunaciones y el año civil es el motivo de que el tema se cuente por lunación medida, nunca por fecha.',
};

export default ES;
