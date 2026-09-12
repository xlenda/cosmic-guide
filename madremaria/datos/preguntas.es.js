// datos/preguntas.es.js
// O ESPANHOL das 7 perguntas do onboarding e da PANTALLA_CERO. Arquivo VIZINHO
// de datos/preguntas.js: o portugues fica la, intacto (dois testes leem a copy
// crua dele), e aqui mora so o texto visivel traduzido.
//
// ===========================================================================
// O QUE ESTE ARQUIVO TRADUZ, E O QUE ELE NAO PODE TOCAR
// ===========================================================================
// TRADUZ: titulo / cuerpo / boton da PANTALLA_CERO; texto / microcopy /
// placeholder de cada pergunta; o texto visivel de cada opcao; rotulo e
// placeholder dos tres campos da data.
//
// NAO TOCA, e isto nao e preferencia de estilo — e o contrato do motor:
//   · `id` de pergunta e de OPCAO. Os ids das opcoes sao lidos por
//     lib/lectura.js, lib/plano.js e lib/diagnostico.js, e dois deles
//     ('le-escribi-no-responde', 'cero-contacto') sao IDS_CONTACTO_DURO — o
//     filtro que tira do caminho toda acao de "escreva para essa pessoa". Um id
//     traduzido aqui ('le-escribi-no-responde' -> 'le-escribi-no-contesta')
//     nao da erro nenhum: so desliga a protecao, em silencio, para quem usa o
//     app em espanhol. O mesmo vale para os tres ids de IDS_GENERO e para os
//     ids 'dia'/'mes'/'ano' dos campos da data, que a tela usa como chave.
//   · `tipo`, `maxLargo`, `largo`, `anoMinimo` — estrutura, nao texto.
//   · a ORDEM das perguntas e das opcoes: a tela avanca por indice, e
//     test/madremaria-lectura.test.js afirma a ordem dos sete ids.
//
// ===========================================================================
// A VOZ, E AS DUAS REGRAS DE GENERO QUE SE CRUZAM AQUI
// ===========================================================================
// A Madre fala com UMA pessoa, de "tu" (o ES de Onda 1 em datos/textos.es.js ja
// fixou "tu": "Escribe al menos una letra para seguir"), baixinho, frases
// curtas. Acolhe sem prometer.
//
// 1. A OUTRA PESSOA nunca tem genero: "esa persona", "quien esta del otro
//    lado". Nunca "el" nem "ella". Vale em P4, onde o PT diz "essa pessoa me
//    escreve".
// 2. QUEM LE nao tem genero tampouco, porque P7 ainda NAO FOI RESPONDIDA
//    enquanto estas telas estao na frente dela. O PT escapa disso por acidente
//    gramatical ("sozinha" nao aparece aqui); o espanhol teria de escolher, e
//    escolher seria adivinhar. Por isso nenhum adjetivo de P1..P6 concorda em
//    genero com quem le — e as tres opcoes de P7 dizem o genero SEM um
//    adjetivo que ja o assuma ("Soy mujer", nao "Estoy sola").
//
// PROMESSA: nenhuma linha daqui diz o que a outra pessoa vai fazer. P5 e a
// tela de maior risco — cinco opcoes sobre o que ela quer ENTENDER — e
// nenhuma delas virou "saber si va a volver" na traducao. A microcopy de P5 diz
// isso em voz alta, como no PT: esta leitura serve para entender, nao para
// prever.

export const PANTALLA_CERO_ES = {
  /* "quedo a medias" e a mesma escolha que Onda 1 fixou em 'app.tagline'
     (datos/textos.es.js): guarda o inacabado sem insinuar itinerario. Uma
     segunda traducao da mesma frase faria o app falar com duas bocas. */
  titulo: 'Tres cartas para la historia que quedó a medias',
  cuerpo:
    'Madre María te da hoy una lectura de tarot sobre ese vínculo que no se cerró: dónde se enredó, qué lo mantiene tirante y qué parte del hilo sostienes tú. No adivina el final, porque ninguna carta lee a la otra persona.',
  boton: 'Ver mis tres cartas',
};

/* As sete perguntas, por ID. O objeto e um MAPA e nao uma lista de proposito:
 * a ordem canonica mora no PT, e repeti-la aqui seria uma segunda fonte da
 * verdade que pode divergir sem ninguem notar. */
export const PREGUNTAS_ES = {
  nombre: {
    texto: '¿Cómo te llamas?',
    microcopy:
      'Para llamarte por tu nombre en la parte de la lectura que más pesa, y no con un "hola" de formulario. Se queda en este teléfono: no hay cuenta, no hay correo, no se envía a ningún lado.',
    placeholder: 'Tu nombre',
  },

  corte: {
    texto: '¿Qué pasó entre ustedes?',
    microcopy:
      'Define la primera carta, la del nudo. Sin saber dónde se enredó el hilo, la lectura hablaría de cualquier historia menos de la tuya.',
    opciones: {
      pelea: 'Una discusión fuerte y ahí se rompió todo',
      distancia: 'Nos fuimos alejando de a poco, sin pelea',
      ruptura: 'Terminamos: se dijo con todas las letras',
      'me-arrepenti': 'Fui yo quien terminó y me arrepentí',
      'nunca-empezo': 'Nunca llegó a empezar de verdad',
    },
  },

  cuando: {
    texto: '¿Cuánto tiempo hace?',
    microcopy:
      'Cambia la carta del medio: la tensión de una semana no se parece a la de un año. Es el único dato de calendario que pedimos, y por eso es un rango y no una fecha.',
    opciones: {
      dias: 'Hace días',
      semanas: 'Unas semanas',
      'meses-1-3': 'Entre uno y tres meses',
      'meses-3-12': 'Entre tres meses y un año',
      'mas-de-un-ano': 'Más de un año',
    },
  },

  hoy: {
    texto: '¿Cómo está el contacto hoy?',
    microcopy:
      'Filtra la acción con la que termina la lectura. Hay consejos que no tienen sentido si ya escribiste y nadie contestó: con esta respuesta quedan fuera, en vez de aparecer y empujarte a insistir.',
    /* Os textos mudam, os ids nao: 'le-escribi-no-responde' e 'cero-contacto'
     * continuam sendo IDS_CONTACTO_DURO. Ver o cabecalho. */
    opciones: {
      hablamos: 'Nos hablamos, aunque distinto que antes',
      'le-escribi-no-responde': 'Escribí y no llegó respuesta',
      'cero-contacto': 'Cero contacto hace tiempo, de los dos lados',
      /* "esa persona": a regra 4 do contrato em espanhol. Nem "él" nem "ella". */
      'me-escribe-a-veces': 'A veces esa persona me escribe, sin un patrón claro',
      bloqueo: 'Hay un bloqueo en el medio',
    },
  },

  intencion: {
    texto: '¿Qué quieres entender hoy?',
    microcopy:
      'Decide el tono de la tercera carta, la que habla solo de ti. Aquí no existe una opción para adivinar el final: esta lectura sirve para entender, no para predecir.',
    opciones: {
      'entender-que-paso': 'Entender qué se rompió de verdad',
      'entender-mi-parte': 'Ver cuál fue mi parte en esto',
      'decidir-insistir-o-soltar': 'Decidir si sigo insistiendo o si suelto',
      'entender-que-diria': 'Saber qué diría yo si hubiera una conversación',
      'entender-para-cerrar': 'Entender lo suficiente para cerrar el asunto',
    },
  },

  nacimiento: {
    texto: '¿Qué día naciste?',
    microcopy:
      'De aquí salen dos cosas: tu signo, que la app calcula sola —no tienes que buscarlo en una lista—, y tu edad. Son ellas las que hacen que el plan de los próximos días hable con tu etapa de la vida y no con cualquier persona. No pedimos la hora ni el lugar. Se queda en este teléfono y sale en "Borrar todo".',
    /* Os rotulos sao abreviacao de tela, em caixa alta como no PT. 'AÑO' leva
     * a tilde: e a palavra, e a tela tem largura para ela (tres caracteres). */
    campos: {
      dia: { rotulo: 'DÍA', placeholder: 'DD' },
      mes: { rotulo: 'MES', placeholder: 'MM' },
      ano: { rotulo: 'AÑO', placeholder: 'AAAA' },
    },
  },

  genero: {
    texto: '¿Y cómo te hablamos?',
    microcopy:
      'Cambia solo las palabras con que la lectura se dirige a ti — el cierre se dice en tu género, y no en el de otra persona. No cambia ninguna carta, no cambia lo que sale en la tirada y no dice nada sobre quien está del otro lado: sobre esa persona la app sigue sin preguntar nada.',
    /* "Prefiero no decirlo" e resposta INTEIRA, nao rodeio: ha um fecho neutro
     * escrito de proposito para ela (datos/profunda.js, FECHOS). O texto
     * espanhol nao a faz soar como recusa — e uma terceira opcao, nao um "no". */
    opciones: {
      mulher: 'Soy mujer',
      homem: 'Soy hombre',
      'prefiro-nao-dizer': 'Prefiero no decirlo',
    },
  },
};

export default { PANTALLA_CERO_ES, PREGUNTAS_ES };
