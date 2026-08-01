// lib/traducoes/waiteRegras.es.js
// EL PACK ESPAÑOL de las cuatro reglas de práctica de Waite. Misma FORMA que
// lib/traducoes/waiteRegras.pt.js: mismas claves, mismos campos, funciones con
// la misma firma. El motor vive en lib/waiteRegras.js.
//
// Lo que NO cambia respecto del pt: el verbatim en inglés (traducir una cita
// es falsificarla), el nombre de la OBRA (The Pictorial Key to the Tarot sigue
// siendo The Pictorial Key to the Tarot), los años, y las CLAVES internas —
// los ids de las cuatro reglas siguen en portugués en los tres packs, porque
// son datos y no texto de pantalla.
//
// Las dos reglas que más se rompen aquí:
//   · ENGANCHA PRIMERO. `chamada` es la vida real de quien está en esta silla.
//     Waite, "1911" y "§8" solo pueden aparecer en `recibo`.
//   · LAS CUATRO NO VAN ENTRE COMILLAS. Esta base no tiene el inglés literal
//     de las cuatro (solo la frase de la mezcla, en VERBATIM). Cada `recibo`
//     RELATA lo que Waite escribió, sin comillas.

const TITULO = 'Cuatro cosas antes de tirar';

const ABERTURA =
  'Puedes tocar el botón ahora mismo y tener tres cartas en pantalla en dos segundos. Esa parte es un sorteo. ' +
  'Lo que la convierte en lectura son cuatro cosas pequeñas, hechas antes, en esta silla, con el teléfono en la mano: ' +
  'decir la pregunta en voz alta, mezclar las cartas sin ir respondiendo por dentro, admitir qué respuesta querías, ' +
  'y leer como si las cartas fueran de otra persona. Las cuatro juntas llevan menos de un minuto.' +
  '\n\n' +
  'Ninguna es idea de la app. Es la lista de notas de práctica que A. E. Waite anexó a su propio libro, ' +
  'The Pictorial Key to the Tarot, 1911, en la Parte III §8 — cuatro puntos, en este orden.' +
  '\n\n' +
  'Waite es quien le encargó a Pamela Colman Smith la baraja que estás a punto de tirar: las cartas salieron en Londres, ' +
  'por William Rider & Son, en diciembre de 1909, y el libro llegó dos años después para explicarlas. ' +
  'Las reglas y la baraja son de la misma mano, con dos años de diferencia.';

const REGRAS = {
  pergunta: {
    titulo: 'Di la pregunta en voz alta',
    chamada:
      'La pregunta que sube primero casi nunca es una sola. Es el tipo que no contestó ayer, la cuenta que vence el viernes y tu madre preguntando cuándo se resuelve esto — todo en el mismo pensamiento. ' +
      'Mezcladas así, tres preguntas aceptan cualquier carta como respuesta, porque siempre le sirve a alguna.',
    oQueVoceFaz: () =>
      'Elige una. Escríbela en el campo de aquí arriba y después dila, con la boca, al volumen de quien habla con alguien en la sala. La primera vez da vergüenza. Es la regla entera.',
    porQue: () =>
      'Hablar termina la frase. La pregunta pensada queda a medias y se amolda a lo que salga; la pregunta dicha tiene principio, medio y final, y escuchas en el momento lo vaga que estaba.',
    recibo:
      'Primera de las cuatro notas de práctica de A. E. Waite en The Pictorial Key to the Tarot, 1911, Parte III §8: formular la pregunta de forma definida y repetirla en voz alta antes de empezar.',
  },
  embaralhar: {
    titulo: 'Mezcla con la cabeza vacía',
    chamada:
      'Este es el trozo que nadie hace. Mientras la mano mezcla, la cabeza ya va montando el veredicto: si sale carta buena es señal de quedarme, si sale carta mala lo termino el domingo. ' +
      'En ese punto la baraja pasó a ser público.',
    oQueVoceFaz: () =>
      'Mientras las cartas se mezclan en la pantalla, cuenta hasta veinte mirándolas y no respondas nada por dentro. Si el pensamiento salta a la respuesta, vuelve al uno. Son veinte segundos, lo que dura la animación — y los veinte los ponemos nosotros, no él.',
    porQue: () =>
      'No es mística, es orden de las operaciones. Quien ya respondió antes de dar vuelta la carta no lee la carta: comprueba si está de acuerdo.',
    recibo:
      'Segunda nota de práctica de A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8: mantener la mente lo más en blanco posible mientras se mezcla. ' +
      'Y su mezcla tiene una segunda mitad que casi nadie cita — en el mismo párrafo manda girar parte de las cartas boca abajo antes de mezclar. ' +
      'De ahí sale la carta invertida: de su método alternativo, y no de la Cruz Celta del mismo libro, que no menciona ninguna carta invertida. ' +
      'El significado invertido carta por carta es más viejo que Waite y viene de Etteilla, desde 1770.',
  },
  vies: {
    titulo: 'Di qué respuesta querías',
    chamada:
      'Es raro que alguien abra una baraja sin querer un resultado concreto. Quieres que diga que te quedes, o que te vayas, o que la culpa no fue tuya. ' +
      'El problema nunca es quererlo — es que ese deseo entre disfrazado de lectura.',
    oQueVoceFaz: () =>
      'Antes de tirar, completa esta frase en voz alta: yo quería que la carta dijera ____. Con todas las letras, sin adornar, una sola vez.',
    porQue: () =>
      'El deseo con nombre sigue ahí, pero se vuelve visible. A partir de ahí la mesa tiene dos cosas separadas: lo que trae la carta y lo que tú querías que trajera.',
    recibo:
      'Tercera nota de práctica de A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8: dejar de lado el sesgo personal y las ideas preconcebidas, o el juicio sale teñido por ellas.',
  },
  estranho: {
    titulo: 'Lee como si fuera de otra persona',
    chamada:
      'La lectura más difícil que existe es la tuya. Para una amiga lo resuelves en dos minutos: ves el dibujo entero, hablas sin miedo, aciertas el tono. ' +
      'En la tuya estás dentro del dibujo — y desde dentro no se ve la forma.',
    oQueVoceFaz: (c) =>
      c.paraQuem === 'outra'
        ? 'Caíste en el caso fácil: la lectura es de otra persona. Usa la ventaja y no recortes lo que suene antipático — el recorte para no herir es el sesgo de la regla tres, solo que con corbata.'
        : 'Cuando aparezcan las tres cartas, di en voz alta lo que le dirías a una amiga que sacó exactamente esas cartas en tu misma situación. Después fíjate en lo que ibas a decirte a ti. La distancia entre las dos frases es el tamaño del sesgo de hoy.',
    porQue: (c) =>
      c.paraQuem === 'outra'
        ? 'Cuanto más cerca está la vida en juego, menos distancia hay para verla. Extraño, amigo, tú mismo: ese es el orden de dificultad en la fuente, y leyendo para otra persona estás en el escalón más fácil.'
        : 'Cuanto más cerca está la vida en juego, menos distancia hay para verla. Extraño, amigo, tú mismo: ese es el orden de dificultad en la fuente, y tú estás en el escalón más alto.',
    recibo:
      'Cuarta nota de práctica de A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8: por el sesgo, es más fácil adivinar correctamente para un extraño que para uno mismo o para un amigo. ' +
      'Y vale decir lo que eso implica aquí dentro: la mayor parte del tiempo esta app hace justo el caso que Waite llama el más difícil — tú leyendo para ti. ' +
      'La regla no descalifica la lectura; dice dónde estar atento. El truco de hablar como si fuera para una amiga es de la app: Waite constata la dificultad y no enseña salida.',
  },
};

const VERBATIM = {
  embaralhar: {
    texto: 'Shuffle the entire pack and turn some of the cards round, so as to invert their tops.',
    parafrase:
      'Mezcla la baraja entera y gira algunas cartas del revés, de modo que su parte de arriba quede invertida. Es la primera línea del método alternativo — y es la dirección exacta de donde entra la carta invertida en la práctica.',
    locus: 'A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8',
  },
};

const PERGUNTA = {
  rotulo: 'Tu pregunta',
  ajuda: 'Una sola pregunta, escrita como la dirías.',
  exemplos: [
    '¿Qué me está frenando en esa conversación que no empiezo?',
    '¿Qué no estoy viendo en este trabajo nuevo?',
    '¿De qué está hecho mi miedo a llamar a mi madre?',
  ],
  avaliacao: {
    vazia:
      'Todavía no hay pregunta escrita. Se puede tirar igual, la app no bloquea nada — pero la primera nota de 1911 es exactamente esta: una pregunta formulada, no un tema suelto.',
    curta:
      'Quedó corta. Esto es lectura de la app y no regla de Waite: por debajo de cuatro palabras suele sobrar tema y faltar pregunta. Di qué quieres saber, sobre quién, y desde cuándo.',
    duasPerguntas:
      'Ahí dentro hay más de una pregunta. Elige una para esta tirada y guarda la otra — la nota de 1911 pide una pregunta formulada, en singular.',
    definida:
      'Una pregunta, con principio y final. Ahora la parte que da vergüenza, y que es la regla entera: dila en voz alta, una vez.',
  },
  emVozAlta:
    'En voz alta de verdad. La nota de 1911 manda repetir la pregunta en voz alta antes de empezar, y es la única de las cuatro que suena.',
};

const PROGRESSO = {
  nenhuma:
    'Ninguna de las cuatro todavía. Juntas llevan menos de un minuto, y no bloquean nada: el botón de tirar sigue donde está.',
  parcial: (c) => `${c.feitas} de ${c.total} hechas. La siguiente es: ${c.proxima}.`,
  completo: 'Las cuatro hechas. La lista es de 1911 y cupo en un minuto de hoy. Ya puedes tirar.',
};

const BOTAO = {
  antes: 'Tirar las tres cartas',
  depois: 'Hice las cuatro — tirar las cartas',
};

const GRAUS = { FP: 'fuente primaria', TP: 'tradición posterior' };

const NOTAS_DE_DATACAO = {
  pictorialKey: 'El libro donde están las cuatro notas de práctica, y de donde sale todo lo que dice esta pantalla.',
  baralhoRWS:
    'La baraja que sortea la pantalla. Arte de Pamela Colman Smith, concepto y estructura de A. E. Waite, publicada en Londres por William Rider & Son — dos años antes del libro.',
  etteilla:
    'Quien instituyó el significado invertido carta por carta. Toda lectura de carta invertida en el mundo desciende de ahí, y es anterior a Waite.',
  cruzCelta:
    'La tirada de diez cartas que Waite bautizó como método celta antiguo, en el mismo libro. El nombre es suyo, de 1911; la estructura viene de los círculos de la Golden Dawn. Y no menciona carta invertida en ningún momento.',
};

const NOTA_SEM_TRANCA =
  'La app no bloquea el botón, y es decisión nuestra apoyada en la fuente: Waite llamó a los cuatro puntos notas de práctica, no condiciones. Quien quiera tirar directo, tira.';

const NOTA_LEITURA_DO_APP =
  'Qué es de Waite y qué es de la app. Las cuatro reglas son suyas, de 1911, y están aquí en el orden en que las escribió; la manera de contarlas en español de hoy es nuestra. ' +
  'Dos medidas también son nuestras, y quedan declaradas donde aparecen: los veinte segundos de la mezcla (él pide la mente en blanco y no da duración) y las cuatro palabras mínimas de la pregunta (él pide la pregunta definida y no dice cómo se mide eso). ' +
  'Y hay una diferencia mayor, que es mejor decir que esconder: la tirada de tres cartas con pasado, presente y futuro no está en The Pictorial Key. ' +
  'El libro describe tres métodos — de diez, de cuarenta y dos y de treinta y cinco cartas — y ninguno es ese. ' +
  'Las cuatro reglas de preparación sirven para cualquier tirada; la de tres es elección nuestra, popularizada en el siglo XX, y de esta base no salió fuente datada anterior a eso.';

// ---------------------------------------------------------------------------
// EL CHROME DE LA PANTALLA — las etiquetas que la vitrina necesita
// ---------------------------------------------------------------------------
// Mismas claves que el bloque TELA de lib/traducoes/waiteRegras.pt.js, ni una
// más ni una menos. `convite` y `conviteLinha` son la tarjeta CERRADA: ahí
// valen las mismas dos reglas de siempre — ENGANCHA PRIMERO (nada de Waite, ni
// año, ni capítulo a esa altura) y nada de bloqueo, porque el propio gancho
// dice que el botón de tirar sigue donde estaba. `contando` lleva el único
// molde de esta función: `{s}`, los segundos que faltan.
const TELA = {
  nome: 'Tarot por Tema',
  convite: 'Cuatro cosas antes de tirar',
  conviteLinha:
    'Lo que separa un sorteo de una lectura pasa ahora, en esta silla, antes de que el dedo toque el botón. ' +
    'Son cuatro gestos pequeños, juntos llevan menos de un minuto, y no bloquean nada: el botón de tirar sigue ahí abajo.',
  abrir: 'Ver las cuatro',
  fechar: 'Cerrar',
  pular: 'Cerrar y tirar directo',
  paraQuemRotulo: 'Esta lectura es',
  paraQuemVoce: 'Para mí',
  paraQuemOutra: 'Para otra persona',
  rotuloGesto: 'QUÉ HACER AHORA',
  rotuloPorQue: 'POR QUÉ',
  rotuloRecibo: 'DE DÓNDE SALE',
  rotuloExemplos: 'Ejemplos de pregunta',
  contar: 'Contar los veinte segundos',
  contando: 'Contando… faltan {s}',
  contada: 'Veinte segundos contados',
  marcar: 'Marcar como hecha',
  marcada: 'Hecha',
  rotuloVerbatim: 'La frase, en el inglés del libro',
  rotuloDatacao: 'Las fechas de esta pantalla',
  rotuloFontes: 'Fuentes',
  verFontes: 'Ver las fuentes',
  ocultarFontes: 'Ocultar las fuentes',
};

const FONTES = [
  'A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8 — las cuatro notas de práctica: pregunta formulada y repetida en voz alta, mente lo más en blanco posible al mezclar, sesgo personal dejado de lado, y la lectura para un extraño como caso más fácil',
  'A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8 — "Shuffle the entire pack and turn some of the cards round, so as to invert their tops": la instrucción de invertir cartas está en su método alternativo',
  'A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §7 — la Cruz Celta, diez cartas, y ni una línea sobre carta invertida',
  'Pamela Colman Smith (arte) y A. E. Waite (concepto), baraja publicada por William Rider & Son, Londres, diciembre de 1909 — dos años antes del libro',
  'Etteilla, desde 1770 — el significado invertido sistemático, carta por carta, anterior a Waite',
  'Cartomancia francesa de los siglos XVIII–XIX, passé, présent, avenir — la idea de dividir la lectura en tres tiempos, que la app usa y que el Pictorial Key no trae',
];

export const PACK = {
  idioma: 'es',
  tela: TELA,
  titulo: TITULO,
  abertura: ABERTURA,
  regras: REGRAS,
  verbatim: VERBATIM,
  pergunta: PERGUNTA,
  progresso: PROGRESSO,
  botao: BOTAO,
  graus: GRAUS,
  notasDeDatacao: NOTAS_DE_DATACAO,
  notaSemTranca: NOTA_SEM_TRANCA,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  fontes: FONTES,
};

export default PACK;
