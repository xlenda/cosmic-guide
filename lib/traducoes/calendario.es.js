// lib/traducoes/calendario.es.js
// PACK DE TEXTO — ESPAÑOL (neutro latinoamericano, não castelhano de Espanha).
//
// LEIA lib/traducoes/calendario.pt.js ANTES DE MEXER AQUI — o cabeçalho de lá
// é o contrato dos três packs: mesmas chaves, mesmos placeholders {x},
// tradução de SENTIDO (prende primeiro, fonte depois; conversa, não aula).
//
// O QUE NUNCA SE TRADUZ: obras e loci em latim/grego (Tetrabiblos I.13,
// Naturalis Historia XVIII.321, De Re Rustica XI.2.85, De Agri Cultura 40.1,
// Anthologiae V), números e datas. Os verbatins de Robbins ficam em INGLÊS,
// entre aspas, seguidos da paráfrase em espanhol — é citação, não texto nosso.
// Nomes consagrados traduzem: Ptolomeu → Ptolomeo, Plínio → Plinio el Viejo,
// Catão → Catón el Viejo, Hesíodo (igual), Os Trabalhos e os Dias → Los
// trabajos y los días.
//
// LINHA VERMELHA (test/calendarioIdiomas.test.js varre e derruba o build):
// nada de aliviar/calmar/sanar/curar/tratar/energizar nem qualquer alegação
// de saúde; nenhuma promessa de resultado; nenhuma instrução ao leitor nos
// eventos do calendário; nenhum aviso defensivo.
//
// O sentinela abaixo NÃO é texto de tela (a tela corta o parágrafo nele e o
// descarta) — por isso fica idêntico ao do pack PT, sem tradução.

const R = 'Quem escreveu isso:';

// A frase fixa para prática moderna sem fonte antiga — sempre esta, nunca
// variações amenizadas.
const SFA = 'práctica popular contemporánea, sin fuente antigua localizada';

export default {
  semFonteAntiga: SFA,

  // -------------------------------------------------------------------------
  // 1. LAS CUATRO LUNAS
  // -------------------------------------------------------------------------
  marcosLunares: {
    luaNova: {
      titulo: 'Luna Nueva',
      paragrafo:
        'La Luna desapareció del cielo — y desapareció porque está del mismo lado que el Sol, con la mitad iluminada mirando hacia el otro lado. Es el cero del ciclo: de aquí en adelante la luz vuelve a crecer, por unos 29 días y medio, hasta que todo empieza de nuevo. Y no es una franja de días: es un instante, el minuto en que Sol y Luna quedan en la misma longitud vistos desde la Tierra. ' +
        R +
        ' Claudio Ptolomeo — el Tetrabiblos I.8 (siglo II d. C.) cuenta los cuatro tramos del mes lunar a partir de aquí. Y el mes contado día a día, del 1º al 30º, ya está en Hesíodo, Los trabajos y los días, vv. 765-828 (siglo VII a. C.): empezar el mes aquí es de las costumbres genuinamente antiguas.',
      fonte: 'Claudio Ptolomeo, Tetrabiblos I.8 — siglo II d. C.; Hesíodo, Los trabajos y los días vv. 765-828 — siglo VII a. C.',
      tradicao: {
        texto:
          'El campo romano plantaba higuera, manzano, olivo, peral y vid en la Luna Nueva, esa en que la Luna desaparece del cielo — los romanos la llamaban luna muda, o interlunio — y siempre por la tarde.',
        obra: 'De Agri Cultura 40.1',
        autor: 'Catón el Viejo',
        seculo: 'siglo II a. C.',
      },
      avisoDeIdade:
        'Leer la Luna Nueva como la hora de "plantar una intención" es ' +
        SFA +
        '. Lo verdaderamente antiguo es el hito: el mes empezaba aquí.',
    },
    quartoCrescente: {
      titulo: 'Cuarto Creciente',
      paragrafo:
        'Medio disco encendido, medio disco apagado, con el corte recto en el medio: es lo que se ve cuando la Luna está a 90° del Sol, en ángulo recto vista desde la Tierra. De aquí hasta la llena, la luz solo crece. ' +
        R +
        ' Claudio Ptolomeo, Tetrabiblos I.8 (siglo II d. C.) — y vale saber que la división antigua es esa, de CUATRO cuartos. Las ocho fases con nombre y lectura de personalidad son mucho más nuevas: Dane Rudhyar, The Lunation Cycle, 1967.',
      fonte: 'Claudio Ptolomeo, Tetrabiblos I.8 — siglo II d. C.',
      tradicao: {
        texto:
          'Ptolomeo describía los cuatro tramos del mes lunar como cualidades del aire y de la materia: de la nueva al cuarto creciente, más productor de humedad; del cuarto creciente a la llena, de calor; de la llena al cuarto menguante, de sequedad; del cuarto menguante a la desaparición, de frío. Era descripción del clima, no de la gente.',
        obra: 'Tetrabiblos I.8',
        autor: 'Claudio Ptolomeo',
        seculo: 'siglo II d. C.',
      },
      avisoDeIdade:
        'El marco de ocho fases con significado psicológico es de Dane Rudhyar (The Lunation Cycle, 1967). Llamar a las ocho "tradición milenaria" le acredita una edad que no tiene.',
    },
    luaCheia: {
      titulo: 'Luna Llena',
      paragrafo:
        'La Luna aparece encendida entera y sale más o menos a la hora en que el Sol se pone. Está del lado opuesto al Sol, con la Tierra en el medio, y por eso le vemos la cara toda iluminada. También es un instante y no una temporada — los cuatro o cinco días en que "parece llena" son un límite del ojo: la cuenta marca un solo minuto. ' +
        R +
        ' Claudio Ptolomeo — el Tetrabiblos I.8 (siglo II d. C.) marca aquí la mitad del ciclo, entre los dos cuartos.',
      fonte: 'Claudio Ptolomeo, Tetrabiblos I.8 — siglo II d. C.',
      tradicao: {
        texto:
          'Columela mandaba sembrar habas la víspera o el mismo día de la luna llena. Y, al contrario de la fama de esta fase, no era aquí donde se cosechaba para guardar: Plinio el Viejo registraba que todo lo que se corta, se cosecha y se esquila sufría menos daño con la luna menguante.',
        obra: 'De Re Rustica XI.2.85 y Naturalis Historia XVIII.321',
        autor: 'Columela y Plinio el Viejo',
        seculo: 'siglo I d. C.',
      },
      avisoDeIdade:
        'La fama de "fase de la cosecha" invierte la fuente romana: cosechar para guardar era en menguante (Plinio, Naturalis Historia XVIII.321, siglo I d. C.).',
    },
    quartoMinguante: {
      titulo: 'Cuarto Menguante',
      paragrafo:
        'De nuevo medio disco encendido, ahora del otro lado. La Luna volvió a los 90° del Sol, pero bajando: la luz va a encogerse hasta desaparecer del todo. ' +
        R +
        ' Claudio Ptolomeo, Tetrabiblos I.8 (siglo II d. C.), el mismo capítulo que parte el mes lunar en cuatro y no en ocho.',
      fonte: 'Claudio Ptolomeo, Tetrabiblos I.8 — siglo II d. C.',
      tradicao: {
        texto:
          'Este es el tramo del mes que más aparece escrito en el campo antiguo. Era en la luna menguante cuando se cortaba madera, se cosechaba para secar, se esquilaba, se desmalezaba y se abonaba — todo lo que se quería que disminuyera en vez de crecer.',
        obra: 'Naturalis Historia XVIII.321-322, De Re Rustica XI.2.11 y De Agri Cultura 31.2',
        autor: 'Plinio el Viejo, Columela y Catón el Viejo',
        seculo: 'siglo II a. C. a siglo I d. C.',
      },
      avisoDeIdade: null,
    },
  },

  // -------------------------------------------------------------------------
  // 2. EL SOL CAMBIANDO DE SIGNO
  // -------------------------------------------------------------------------
  ingresso: {
    titulo: 'El Sol entra en {signo}',
    abertura:
      'El Sol cambia de signo: sale de {anterior} y entra en {novo}. ' +
      'Y la fecha cambia de un año a otro, porque no es una casilla del calendario — es un instante astronómico, ' +
      'el minuto en que el Sol completa otros 30° de camino en el círculo del zodíaco. ' +
      'Otra cosa que confunde a mucha gente: el signo no es la constelación que está allá atrás. ' +
      'Es el pedazo de cielo contado a partir del equinoccio de marzo — el instante en que día y noche ' +
      'empatan y el año del cielo empieza de nuevo{complemento}. ',
    complementoAries: ', y este ingreso es exactamente eso — el Sol vuelve al grado cero desde donde todo se cuenta',
    complementoCardinal: ', y este ingreso es exactamente {evento} — {explica}',
    recibo:
      R +
      ' Claudio Ptolomeo, Tetrabiblos I.22 (siglo II d. C.): los comienzos de los signos se cuentan desde los equinoccios y solsticios, "and from no other source" — y de ninguna otra fuente.',
    fonte: 'Claudio Ptolomeo, Tetrabiblos I.22 — siglo II d. C.',
    tradicaoTexto:
      'Para Ptolomeo esto no era coincidencia de calendario: su zodíaco es el año solar repartido en doce, y {evento} es uno de los cuatro puntos desde donde parte la cuenta. Eligió ese marco de referencia a propósito y explicó por qué.',
    tradicaoObra: 'Tetrabiblos I.22',
    tradicaoAutor: 'Claudio Ptolomeo',
    tradicaoSeculo: 'siglo II d. C.',
    avisoDeIdade:
      '"Ofiuco, el signo 13 que esconden" confunde signo con constelación. Los límites de las constelaciones que usa la astronomía son de 1930 (Unión Astronómica Internacional), y el zodíaco de doce partes iguales es muy anterior a eso.',
    cardinais: {
      'Áries': { evento: 'el equinoccio de marzo', explica: 'el instante en que día y noche tienen casi la misma duración en el mundo entero' },
      'Câncer': { evento: 'el solsticio de junio', explica: 'el instante en que el Sol alcanza el punto más al norte del año, lo que hace el día más largo en el hemisferio norte y el más corto en el sur' },
      'Libra': { evento: 'el equinoccio de septiembre', explica: 'el otro instante del año en que día y noche casi empatan' },
      'Capricórnio': { evento: 'el solsticio de diciembre', explica: 'el instante en que el Sol alcanza el punto más al sur del año, lo que hace el día más corto en el hemisferio norte y el más largo en el sur' },
    },
  },

  // -------------------------------------------------------------------------
  // 3. MERCURIO RETRÓGRADO
  // -------------------------------------------------------------------------
  retro: {
    inicio: {
      titulo: 'Mercurio empieza a retrogradar',
      paragrafo:
        'Mercurio parece andar hacia atrás en el cielo — y "parece" es la palabra justa, porque es una ilusión de perspectiva. ' +
        'La Tierra va rebasando a Mercurio por fuera de la curva, y el planeta parece retroceder contra el fondo de estrellas, ' +
        'igual que el auto de al lado parece dar marcha atrás cuando el de uno lo pasa. Nada frena y nada se invierte de verdad. ' +
        'Pasa tres o cuatro veces por año, dura unas tres semanas, y no tiene nada de raro: midiendo la efeméride ' +
        '— las tablas de posición de los planetas que astrónomo y astrólogo usan por igual —, ' +
        'en el 86% de los días hay algún planeta retrógrado en el cielo. ' +
        R +
        ' Vetio Valente, Anthologiae V (siglo II d. C.). Y lo que él dice es una sola cosa: atraso — los planetas retrógrados ' +
        '"delay expectations, actions, profits, and enterprises": atrasan expectativas, acciones, ganancias y empresas.',
      fonte: 'Vetio Valente, Anthologiae V — siglo II d. C.',
      tradicao: {
        texto:
          'Ptolomeo ni siquiera clasificaba la retrogradación como buena o mala: para él era una fase térmica del ciclo del planeta — de la primera estación (el día en que el planeta parece detenerse antes de retroceder) a la salida acrónica (cuando el planeta asoma por el este justo a la hora en que el Sol se pone), calor; de la salida acrónica a la segunda estación, sequedad.',
        obra: 'Tetrabiblos I.8',
        autor: 'Claudio Ptolomeo',
        seculo: 'siglo II d. C.',
      },
      avisoDeIdade:
        '"Mercurio retrógrado rompe aparatos, tumba contratos y trae de vuelta al ex" no está en ninguna fuente antigua: es folclore del siglo XX y del siglo XXI. Se suele decir que la primera mención de "Mercury retrograde" en el New York Times es de 1996 — eso lo relatan medios secundarios y no fue verificado en el archivo del diario, así que queda como noticia de segunda mano. Valente tampoco habla de Mercurio en particular: su regla vale igual para Marte, Júpiter y Saturno.',
    },
    fim: {
      titulo: 'Último día de Mercurio retrógrado',
      paragrafo:
        'Mercurio se detiene y vuelve a andar hacia adelante contra el fondo de estrellas. Es la llamada segunda estación — el día en que ' +
        'el planeta parece detenerse antes de retomar el rumbo —, y a partir del día siguiente el movimiento aparente vuelve a ser directo. ' +
        R +
        ' Vetio Valente, Anthologiae V (siglo II d. C.) — y Valente registraba también el otro lado, el que internet suele recortar: ' +
        'pasada la segunda estación, los planetas "cancel any delay and reinstate the same activities": cancelan el atraso y retoman las mismas actividades.',
      fonte: 'Vetio Valente, Anthologiae V — siglo II d. C.',
      tradicao: {
        texto:
          'Lilly clasificaba la retrogradación como debilidad accidental — en su regla, un planeta en posición débil, no un planeta malo —, señal de asunto que andaba hacia atrás y tardaba en resolverse, nunca de catástrofe.',
        obra: 'Christian Astrology',
        autor: 'William Lilly',
        seculo: 'siglo XVII (1647/1659)',
      },
      avisoDeIdade:
        'La síntesis honesta de la tradición sobre la retrogradación cabe en tres palabras: demora, revisita, contradice. Nada más que eso está en fuente antigua.',
    },
  },

  // -------------------------------------------------------------------------
  // 4. ASPECTO EXACTO ENTRE LOS PLANETAS PERSONALES
  // -------------------------------------------------------------------------
  aspecto: {
    titulo: '{planetA} y {planetB} en {aspecto} {exato}',
    aberturaConjuncao:
      '{planetA} y {planetB} quedan hoy en el mismo punto del círculo del zodíaco, vistos desde la Tierra — eso es lo que "conjunción" quiere decir: {glosa}. Un ángulo es un ángulo, se puede verificar en cualquier tabla de posición de planetas, y el encuentro tiene hora marcada. ',
    aberturaOutros:
      'Vistos desde la Tierra, {planetA} y {planetB} quedan hoy a exactos {grau}° uno del otro sobre el círculo del zodíaco — eso es lo que "{aspecto}" quiere decir: {glosa}. Un ángulo es un ángulo: se puede verificar en cualquier tabla de posición de planetas, y el instante tiene hora marcada. ',
    reciboConjuncao:
      R +
      ' Claudio Ptolomeo, Tetrabiblos I.13 y I.24 (siglo II d. C.) — y aquí va un detalle en el que casi toda app se equivoca: en Ptolomeo la conjunción NO es un aspecto. Sus aspectos son cuatro (oposición 180°, trígono 120°, cuadratura 90°, sextil 60°), y la conjunción aparece en I.24 como "bodily application" — aplicación corporal, una categoría aparte.',
    reciboOutros:
      R +
      ' Claudio Ptolomeo — el Tetrabiblos I.13 (siglo II d. C.) reconoce cuatro aspectos y solo cuatro (oposición 180°, trígono 120°, cuadratura 90° y sextil 60°), y saca esos ángulos de proporciones musicales aplicadas al semicírculo.',
    fonteConjuncao: 'Claudio Ptolomeo, Tetrabiblos I.13 y I.24 — siglo II d. C.',
    fonteOutros: 'Claudio Ptolomeo, Tetrabiblos I.13 — siglo II d. C.',
    tradicao: {
      texto:
        'Ptolomeo llamaba armónicos al trígono y al sextil, y desarmónicos a la cuadratura y la oposición. La razón que daba era el género de los signos: los armónicos unirían signos del mismo género, y los desarmónicos, de géneros opuestos. La cuenta cierra para la cuadratura y no cierra para la oposición, porque a seis signos de distancia el género es siempre el mismo. El hueco es suyo, y registrarlo vale más que repetir la frase como si cerrara.',
      obra: 'Tetrabiblos I.12-I.13',
      autor: 'Claudio Ptolomeo',
      seculo: 'siglo II d. C.',
    },
    avisoDeIdade:
      'Los grados de tolerancia ("orbe") usados para encontrar el aspecto — 8° para conjunción, oposición, cuadratura y trígono, 6° para sextil — son convención moderna de software: no existe tabla de orbes en grados en el Tetrabiblos. Aquí sirven solo para ubicar el par; la hora publicada es la del ángulo exacto.',
    nomes: {
      'Conjunção': 'Conjunción',
      'Sextil': 'Sextil',
      'Quadratura': 'Cuadratura',
      'Trígono': 'Trígono',
      'Oposição': 'Oposición',
    },
    glosa: {
      'Conjunção': 'el mismo grado, uno detrás del otro en nuestra línea de visión',
      'Sextil': 'un sexto de vuelta entre los dos',
      'Quadratura': 'un cuarto de vuelta entre los dos',
      'Trígono': 'un tercio de vuelta entre los dos',
      'Oposição': 'media vuelta entre los dos, cada uno a un lado del círculo',
    },
    exato: {
      'Conjunção': 'exacta',
      'Sextil': 'exacto',
      'Quadratura': 'exacta',
      'Trígono': 'exacto',
      'Oposição': 'exacta',
    },
  },

  // -------------------------------------------------------------------------
  // 5. LAS OCHO FASES DE LA LUNA
  // -------------------------------------------------------------------------
  // La corrección histórica tiene que sobrevivir con la misma claridad del PT:
  // cosechar para guardar es en la MENGUANTE (Plinio, Naturalis Historia
  // XVIII.321); la llena, en Columela XI.2.85, es día de SEMBRAR habas.
  fases: {
    luaNova: {
      nome: 'Luna Nueva',
      reflexao:
        'Cielo oscuro, mes que empieza: la Luna Nueva es el punto cero del ciclo. Queda la invitación simbólica a la pausa antes de actuar — vale anotar qué quieres dejar nacer en este ciclo. Y el recibo es honesto: abrir el mes en la Luna Nueva es costumbre genuinamente milenaria, de todo calendario lunisolar antiguo (el que cuenta los meses por la Luna); leerla como la hora de «plantar una intención», en cambio, es lectura contemporánea, no antigua.',
    },
    luaCrescente: {
      nome: 'Luna Creciente',
      reflexao:
        'La luz está creciendo, y la lectura aquí es de construcción: dar los primeros pasos en lo que empezó en la Luna Nueva. Es un recordatorio simbólico de mantener el ritmo — las acciones pequeñas cuentan más que las grandes decisiones ahora. Recibo: esa lectura es contemporánea, no antigua — el marco de ocho fases es de 1967 (Dane Rudhyar, «The Lunation Cycle»).',
    },
    quartoCrescente: {
      nome: 'Cuarto Creciente',
      reflexao:
        'Mitad de la luz, primera encrucijada del ciclo: la invitación simbólica es revisar el plan — vale preguntarse qué necesita más foco esta semana. Ajuste de rumbo y tensión creativa son lectura contemporánea, eso queda dicho. Pero el hito en sí es división antigua de verdad: Ptolomeo parte el ciclo en cuatro (Tetrabiblos I.8), y este es uno de los cuatro.',
    },
    gibosaCrescente: {
      nome: 'Luna Gibosa Creciente',
      reflexao:
        'Casi llena (eso es lo que «gibosa» quiere decir: más de media Luna ya iluminada), la hora es de refinar detalles. Queda la invitación simbólica a la paciencia con lo que ya está en marcha — ajustar es distinto de empezar de nuevo. Recibo honesto: esa lectura es contemporánea, no herencia antigua; la gibosa ni siquiera es una fase con nombre fuera del marco de ocho, que es de 1967.',
    },
    luaCheia: {
      nome: 'Luna Llena',
      reflexao:
        'La Luna está en el pico de luz del ciclo — eso es astronomía — y la invitación simbólica es ver con claridad: observar lo que ya venía dibujándose. Todo el mundo repite que la Luna Llena es día de cosecha, pero la fuente romana dice lo contrario. Columela pone en la llena el día de SEMBRAR habas (XI.2.85). Cosechar y guardar es cosa de la menguante — es Plinio quien la reserva para eso (Naturalis Historia XVIII.321). O sea: la fama de fase de la cosecha invierte la fuente.',
    },
    gibosaMinguante: {
      nome: 'Luna Gibosa Menguante',
      reflexao:
        'La luz empezó a ceder, y era ahora cuando el campo romano cosechaba para guardar. Gratitud y compartir son la capa contemporánea encima de eso — una invitación simbólica a mirar atrás con más liviandad. Buen momento para repasar algo que aprendiste. El recibo de la parte antigua: Plinio registra que lo que se corta, se cosecha y se esquila sufre menos daño con la luna decreciente (Naturalis Historia XVIII.321).',
    },
    quartoMinguante: {
      nome: 'Cuarto Menguante',
      reflexao:
        'Mitad de la luz, ahora cayendo: es tiempo de quitar, no de poner. Soltar lo que ya no sirve es la invitación simbólica — una limpieza emocional; la transposición hacia adentro es contemporánea, eso queda dicho. Vale preguntarse qué ya puede quedar atrás. Y el recibo es de los mejores: de las ocho etiquetas, esta es una de las dos con mejor respaldo antiguo — Plinio pone en la menguante lo que es cortar, cosechar, esquilar, desmalezar (Naturalis Historia XVIII.321–322).',
    },
    luaMinguante: {
      nome: 'Luna Menguante',
      reflexao:
        'La Luna está desapareciendo del cielo: son los últimos días antes de que se encuentre con el Sol (la conjunción) y el ciclo empiece de nuevo. Descanso y recogimiento son la lectura contemporánea de ese vaciamiento — una invitación simbólica a bajar el ritmo. Buen momento para el silencio y el balance personal. Recibo: para la luna vieja romana, ese fin de mes seguía siendo el de quitar, no el de poner (Plinio, Naturalis Historia XVIII.321–322).',
    },
  },

  // -------------------------------------------------------------------------
  // NOMBRES — as chaves são os nomes canônicos de lib/signs.js (nunca mudam).
  // -------------------------------------------------------------------------
  signos: {
    'Áries': 'Aries',
    'Touro': 'Tauro',
    'Gêmeos': 'Géminis',
    'Câncer': 'Cáncer',
    'Leão': 'Leo',
    'Virgem': 'Virgo',
    'Libra': 'Libra',
    'Escorpião': 'Escorpio',
    'Sagitário': 'Sagitario',
    'Capricórnio': 'Capricornio',
    'Aquário': 'Acuario',
    'Peixes': 'Piscis',
  },
  planetas: {
    'Sol': 'Sol',
    'Mercúrio': 'Mercurio',
    'Vênus': 'Venus',
    'Marte': 'Marte',
  },
};
