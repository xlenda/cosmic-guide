// lib/traducoes/rituais.es.js
// PACK EM ESPANHOL (neutro latino-americano) para lib/rituais.js — mesma forma
// da fonte de verdade em português, chave por chave. O motor continua canônico
// em PT; este arquivo carrega SÓ o texto que a pessoa lê, traduzido por
// SENTIDO, não ao pé da letra.
//
// AS REGRAS DESTE ARQUIVO (mesma linha vermelha de lib/rituais.js, primos em
// espanhol):
//   (1) NENHUMA alegação de saúde: aliviar/calmar/sanar/curar/tratar/energizar
//       e parentes não entram, nem implícitos. Por isso este arquivo NUNCA usa
//       "se trata de" — a conjugação esbarraria na varredura, e a varredura
//       está certa.
//   (2) NENHUMA promessa de resultado: atraer/garantizar/manifestar/proteger/
//       alejar/abrir caminos e parentes não entram. Ritual é o que a pessoa FAZ.
//   (3) NENHUM mecanismo pseudocientífico: energía/vibración/aura/limpieza
//       energética não entram nem como imagem poética.
//   (4) O que nunca se traduz: nomes de obra e locus (Tetrabiblos I.4,
//       Naturalis Historia XVIII.321-322, Carmen Astrologicum), números,
//       datas. Nome próprio consagrado TRADUZ (Ptolomeu → Ptolomeo). Verbatim
//       em inglês ("comparatively recent") fica em inglês, como citação.
//   (5) O tom espelha o PT: prende primeiro, recibo depois — conversa, não
//       aula. Toda `intencao`/`momentoTexto` abre simples e fecha em fonte (ou
//       na frase literal de ausência de fonte).
//
// CONTRATO DE FORMA (cobrado por test/rituaisIdiomas.test.js):
//   - `rituais` tem EXATAMENTE os 21 ids de RITUAIS, cada um com titulo,
//     intencao, materiais[], passos[], momentoTexto, cuidados, naoTemFonte[] —
//     mesmos tamanhos de array do PT, nenhum valor vazio, mesmos placeholders.
//   - `cuidados` aqui EXCLUI o aviso ético: o motor cola `avisoEtico` no fim,
//     exatamente como a fonte PT concatena o dela.
//   - toda linha de `naoTemFonte` termina em `semFonteAntiga` + '.'.
export default {
  // O aviso ético do dono, com a mesma força — a última frase é limite duro de
  // conduta, não ressalva jurídica.
  avisoEtico:
    'Estos rituales son gestos de intención, hechos con tu propia mano y sobre tu propia vida. La voluntad ajena no se toca.',

  // A frase literal que substitui a antiguidade inventada, sempre igual.
  semFonteAntiga: 'práctica popular contemporánea, sin fuente antigua localizada',

  // A moldura do motivo do encaixe diário: "viernes (día de Venus)".
  motivoDia: '{dia} (día de {planeta})',

  // Os recibos, como a tela imprime (autor, obra, século). Título de obra e
  // locus ficam como estão; nome de autor vai na forma consagrada em espanhol.
  fontes: {
    dioCassio: { autor: 'Dion Casio', obra: 'Historia Romana 37.18-19', seculo: 'siglo III' },
    ptolomeuI4: { autor: 'Claudio Ptolomeo', obra: 'Tetrabiblos I.4', seculo: 'siglo II' },
    ptolomeuI8: { autor: 'Claudio Ptolomeo', obra: 'Tetrabiblos I.8', seculo: 'siglo II' },
    plinioColheita: { autor: 'Plinio el Viejo', obra: 'Naturalis Historia XVIII.321-322', seculo: 'siglo I' },
    columelaFava: { autor: 'Columela', obra: 'De Re Rustica XI.2.85', seculo: 'siglo I' },
    columelaPassa: { autor: 'Columela', obra: 'De Re Rustica XII.16.1', seculo: 'siglo I' },
    columelaEsterco: { autor: 'Columela', obra: 'De Re Rustica II.5.1', seculo: 'siglo I' },
    columelaMadeira: { autor: 'Columela', obra: 'De Re Rustica XI.2.11', seculo: 'siglo I' },
    cataoPlantio: { autor: 'Catón el Viejo', obra: 'De Agri Cultura 40.1', seculo: 'siglo II a.C.' },
    cataoEsterco: { autor: 'Catón el Viejo', obra: 'De Agri Cultura 29', seculo: 'siglo II a.C.' },
    paladio: { autor: 'Paladio', obra: 'Opus Agriculturae I.6.12', seculo: 'siglos IV-V' },
    hesiodo: { autor: 'Hesíodo', obra: 'Los trabajos y los días, vv. 765-828', seculo: 'siglo VII a.C.' },
    virgilio: { autor: 'Virgilio', obra: 'Geórgicas I.276-286', seculo: 'siglo I a.C.' },
    mashaallahBagda: { autor: 'Māshā’allāh ibn Atharī', obra: 'carta de fundación de Bagdad (762)', seculo: 'siglo VIII' },
    mashaallahVenus: { autor: 'Māshā’allāh', obra: 'Book of Aristotle III.7.11', seculo: 'siglo VIII' },
    albiruni: { autor: 'al-Bīrūnī', obra: 'Cronología de las Naciones Antiguas (al-Āthār al-bāqiya)', seculo: 'siglo XI' },
    doroteu: { autor: 'Doroteo de Sidón', obra: 'Carmen Astrologicum', seculo: 'siglo I' },
    rudhyar: { autor: 'Dane Rudhyar', obra: 'The Lunation Cycle', seculo: 'siglo XX (1967)' },
  },

  // Os três blocos de lastro do "momento ideal", mostrados uma vez, no fim.
  momentoIdeal: {
    eletiva: {
      titulo: 'Elegir la hora de empezar es cosa antigua de verdad',
      texto:
        'Fijar el día y la hora para empezar algo importante no es un invento de aplicación: es una rama entera de la astrología antigua — elegir la hora de empezar —, que los árabes llamaban ikhtiyārāt, las elecciones. Y hay un caso registrado con fecha y dirección. En 762 el califa al-Manṣūr encargó la elección del momento para empezar la construcción de Bagdad; quien eligió fue Nawbakht el Persa, asistido por el joven Māshā’allāh ibn Atharī, siglo VIII. La carta llega hasta nosotros por al-Bīrūnī, Cronología de las Naciones Antiguas, siglo XI.',
      ressalvas: [
        'Esto lo registramos pero no lo leímos — la obra existe en la bibliografía y nadie aquí la abrió. Queda como atribución: Doroteo de Sidón, Carmen Astrologicum, siglo I.',
        'El criterio antiguo era el cielo entero de un instante (dónde estaba cada planeta, en qué parte del cielo, y qué subía por el horizonte), no "fase de la Luna y día de la semana". Reducir la elección del momento a esos dos datos es simplificación nuestra, y por eso va marcada en cada ritual.',
      ],
    },
    semana: {
      titulo: 'Por qué cada día tiene un planeta',
      texto:
        'El lunes es de la Luna, el martes de Marte, el miércoles de Mercurio — y eso no es ocurrencia de almanaque. Viene de la fila antigua de los planetas, el llamado orden caldeo: los siete en fila del más lento al más rápido. La fila de los días sale de ella por cuenta: cada hora del día recibe un planeta en el orden de la fila, y como el día tiene 24 horas y la fila tiene 7 nombres, en cada vuelta se saltan tres posiciones — por eso la secuencia de los días no es la misma que la de la fila. Quien lo registra es Dion Casio, Historia Romana 37.18-19, siglo III, y él da dos explicaciones que compiten por la misma cosa, porque él mismo no sabía cuál era la correcta.',
      ressalvas: [
        'Ni para un romano esto era cosa inmemorial: el propio autor que lo registra llama a la costumbre "comparatively recent" y dice que los griegos antiguos no la conocían. Dion Casio, Historia Romana 37.18-19, siglo III.',
        'En la fuente antigua los planetas calientan, secan y humedecen — no tienen personalidad. Claudio Ptolomeo, Tetrabiblos I.4, siglo II.',
        'El apodo "caldeo" es uso grecorromano para "babilónico" en sentido amplio. La investigación de esta app no pudo verificar que ese orden específico sea el orden canónico de los textos astronómicos babilónicos — queda como apodo corriente, no como hecho comprobado.',
      ],
    },
    fases: {
      titulo: 'Lo que el campo antiguo hacía en cada fase, según quien lo dejó escrito',
      texto:
        'La regla es corta y viene del campo: lo que se quería ver crecer iba a la tierra con la Luna creciendo, y lo que se quería secar o achicar se hacía en la menguante. Hay fuente en las dos puntas — Paladio, Opus Agriculturae I.6.12, siglos IV-V, para sembrar en la creciente; Plinio el Viejo, Naturalis Historia XVIII.321-322, siglo I, para cortar, cosechar y esquilar en la menguante.',
      ressalvas: [
        'La división antigua del ciclo lunar es en CUATRO cuartos, con cualidades elementales — Claudio Ptolomeo, Tetrabiblos I.8, siglo II. Las ocho fases con nombre y lectura psicológica son de Dane Rudhyar, The Lunation Cycle, siglo XX (1967).',
        'La fama de la Luna Llena como fase de cosecha invierte la fuente antigua: Columela, De Re Rustica XI.2.85, siglo I, siembra habas en la llena, y es la menguante la que Plinio reserva para cosechar y guardar.',
        'La fuente habla de plantas, madera y animales. Trasladar "podar una rama" a "cerrar una suscripción" es lectura nuestra, contemporánea, y cada ritual marca dónde lo hace.',
      ],
    },
  },

  rituais: {
    // ===================== AMOR =====================
    'amor-carta-que-nao-se-envia': {
      titulo: 'La carta que no se envía',
      intencao:
        'Es poner en papel lo que sientes por alguien, leerlo en voz alta una vez y guardarlo. El destino de la carta es el cajón, no la persona — lo que se hace aquí es quedarte con lo que es tuyo, sin meterte con quien está del otro lado. Escribir afecto para uno mismo es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: [
        'Una hoja de papel y un bolígrafo',
        'Un sobre',
        'Una vela blanca, si quieres (es opcional y no cambia nada de lo que está escrito aquí)',
      ],
      passos: [
        'Siéntate a una mesa, con el celular en otro cuarto, y escribe arriba de la hoja la fecha de hoy — sin el nombre de la persona.',
        'Escribe en primera persona: lo que sientes, lo que te habría gustado decir, lo que no vas a decir.',
        'Lee el texto en voz alta, una sola vez, de principio a fin.',
        'Dobla la hoja, métela en el sobre y escribe la fecha de hoy por fuera.',
        'Guarda el sobre en un lugar tuyo. Si enciendes la vela, apágala antes de salir del cuarto.',
      ],
      momentoTexto:
        'El viernes es el día en que se puede parar y mirar lo que sientes sin la semana empujando. Y el nombre del día carga a Venus desde la Antigüedad: sale de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido —, de donde la secuencia de los días se deriva saltando tres posiciones en cada vuelta de 24 horas. Venus aparece incluso en juicio antiguo sobre parejas: Māshā’allāh, Book of Aristotle III.7.11, siglo VIII, mira a Venus y a la Luna en el mismo signo. La Luna Nueva entra como comienzo del mes lunar, que es marcación de calendario antigua de verdad. Quien registra la fila de los días es Dion Casio, Historia Romana 37.18-19, siglo III — y él mismo dice que la costumbre era novedad en su tiempo —; quien cuenta el mes lunar día a día es Hesíodo, Los trabajos y los días, vv. 765-828, siglo VII a.C.',
      cuidados:
        'Este ritual es sobre lo que tú sientes, y ahí se queda. No escribas el nombre de nadie en el papel: con nombre, el ejercicio deja de ser sobre lo que sientes y se vuelve un gesto dirigido a otra persona. No escribas pidiendo que la otra persona cambie de idea, no mandes la carta después y no uses el nombre de nadie como blanco. Si el asunto involucra a alguien que pidió distancia, respeta la distancia.',
      naoTemFonte: [
        'Encender una vela en un gesto de afecto, de cualquier color, incluida la blanca: práctica popular contemporánea, sin fuente antigua localizada.',
        'Escribir una carta para no enviarla: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'amor-mesa-posta-pra-dois': {
      titulo: 'La mesa puesta para dos',
      intencao:
        'Es sacar una noche del piloto automático con quien ya estás: mesa puesta, teléfonos lejos, una conversación que no sea logística de la casa. Lo que se hace aquí es darle atención a propósito a quien está a tu lado. La cena como gesto de vínculo es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: [
        'Una mesa y dos sillas',
        'La comida que les gusta a los dos (puede ser simple)',
        'Dos velas, o cualquier luz baja',
        'Un acuerdo: los dos teléfonos en otro cuarto',
      ],
      passos: [
        'Acuerden el día con anticipación, los dos de acuerdo. Un ritual fijado por uno solo se vuelve un reclamo.',
        'Pon la mesa antes: plato, vaso, la luz baja.',
        'Dejen los dos teléfonos en otro cuarto.',
        'Cada uno dice, sin ser interrumpido, una cosa que notó en el otro este mes.',
        'Después conversen de cualquier cosa que no sea cuentas, agenda ni trabajo.',
        'Apaguen las velas juntos al final.',
      ],
      momentoTexto:
        'El viernes viene bien por un motivo práctico — es cuando se puede seguir despierto sin pensar en el despertador — y el nombre del día carga a Venus por herencia de la fila antigua de los planetas, el orden caldeo: los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. La Luna Llena entra por ser el pico de luz del ciclo, y eso es astronomía; leerla como hora de ver con claridad es lectura de hoy, y la fuente antigua le da otro uso. Quien registra la fila de los días es Dion Casio, Historia Romana 37.18-19, siglo III; quien siembra habas la víspera o el mismo día de la llena es Columela, De Re Rustica XI.2.85, siglo I.',
      cuidados:
        'Acuérdenlo antes. Un ritual de pareja decidido por una sola persona deja de ser ritual y se vuelve una prueba. Si la otra persona no quiere, no insistas y no lo vuelvas a agendar por tu cuenta.',
      naoTemFonte: [
        'Cenar a la luz de las velas como ritual de pareja: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'amor-lista-do-que-eu-quero-sentir': {
      titulo: 'La lista de lo que quiero sentir',
      intencao:
        'Es una lista corta, escrita a mano, de lo que quieres sentir en una relación — y no de quién quieres que aparezca. La diferencia es el punto del ejercicio: el nombre de una persona se vuelve un reclamo, una sensación se vuelve un criterio tuyo. La lista de intenciones en Luna Nueva es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Papel y bolígrafo', 'Diez minutos sin interrupciones'],
      passos: [
        'Escribe arriba de la hoja: "lo que quiero sentir".',
        'Enumera como máximo siete puntos, uno por línea, cada uno empezando con un verbo.',
        'Tacha todo lo que sea nombre de persona. Si queda una línea vacía, déjala vacía.',
        'Lee la lista una vez en voz alta.',
        'Guarda el papel donde lo vayas a reencontrar sin buscarlo — dentro de un libro que uses.',
      ],
      momentoTexto:
        'Empezar en lo oscuro de la Luna es un gesto viejo, y es agrícola antes que simbólico. El campo romano plantaba higuera, manzano, olivo, peral y vid con la luna callada — el nombre romano de la Luna Nueva, cuando no aparece en el cielo —, siempre por la tarde. Quien manda eso es Catón el Viejo, De Agri Cultura 40.1, siglo II a.C.; y Paladio, Opus Agriculturae I.6.12, siglos IV-V, repite la regla de sembrar con la luna creciendo. Cambiar la semilla por una intención es transposición nuestra, y queda dicho: práctica popular contemporánea, sin fuente antigua localizada.',
      cuidados:
        'No escribas nombres de gente en la lista. El ejercicio pierde el sentido y se vuelve un intento de meterte en la vida de otra persona. Si la lista se convierte en un reclamo contra ti, rómpela y escribe una más corta.',
      naoTemFonte: [
        'Lista de deseos en Luna Nueva: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },

    // ===================== PROSPERIDAD =====================
    'prosperidade-conta-na-mesa': {
      titulo: 'Las cuentas sobre la mesa',
      intencao:
        'Es poner todas las cuentas del mes encima de la mesa, en papel, y mirarlas de una sola vez en lugar de una por una con el susto. Lo que se hace aquí es ver el tamaño real de lo que existe. Mirar las cuentas juntas es organización doméstica, no tradición: práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: [
        'Todas las cuentas y recibos del mes, impresos o anotados',
        'Una hoja de papel',
        'Un bolígrafo',
        'Una mesa libre',
      ],
      passos: [
        'Vacía la mesa por completo antes de empezar.',
        'Coloca cada cuenta abierta sobre la mesa, todas visibles al mismo tiempo.',
        'En la hoja, escribe tres columnas: vence esta semana, vence este mes, puede esperar.',
        'Pasa cada papel a una columna. Ningún papel queda fuera.',
        'Suma cada columna y escribe el total debajo, con la fecha de hoy.',
        'Deja la hoja a la vista y recoge las cuentas.',
      ],
      momentoTexto:
        'El jueves es el día en que la semana todavía tiene arreglo: lo que aparezca aquí todavía cabe en el viernes. Y el nombre del día carga a Júpiter desde la Antigüedad, por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. Sobre el propio Júpiter, la fuente antigua habla de física, no de dinero: calentar y humedecer, en una fuerza que llama templada. Ligar a Júpiter con el dinero es lectura de hoy: práctica popular contemporánea, sin fuente antigua localizada. Quien registra la fila de los días es Dion Casio, Historia Romana 37.18-19, siglo III — y él mismo avisa que la costumbre era reciente en su tiempo —; la física del planeta es de Claudio Ptolomeo, Tetrabiblos I.4, siglo II.',
      cuidados:
        'Esto es un inventario, no un plan de pagos. Si el total asusta, el siguiente paso es conversar con alguien que entienda de deudas — no repetir el ritual. Y no lo hagas con las cuentas de otra persona sin que esté contigo.',
      naoTemFonte: [
        'Júpiter como planeta del dinero: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'prosperidade-semear-na-cheia': {
      titulo: 'Sembrar en la llena',
      intencao:
        'Es plantar algo de verdad — una maceta, un almácigo, un puñado de frijoles en algodón — el día de la Luna Llena, y cuidarlo durante un mes. Lo que se hace aquí es asumir un trabajo que solo depende de que aparezcas todos los días. Y la fecha tiene fuente agrícola directa: Columela, De Re Rustica XI.2.85, siglo I, siembra habas la víspera o el mismo día de la luna llena.',
      materiais: [
        'Una maceta con tierra, o un frasco con algodón',
        'Semillas (los frijoles sirven, y son el pariente más cercano del haba de la fuente)',
        'Agua',
        'Un lugar con luz',
      ],
      passos: [
        'El día de la llena, prepara la tierra o moja el algodón.',
        'Pon las semillas y cúbrelas.',
        'Escribe en un papelito la fecha y una frase corta sobre lo que estás empezando este mes.',
        'Deja el papelito debajo de la maceta.',
        'Riega todos los días, a la misma hora, hasta la próxima Luna Llena.',
        'En la llena siguiente, lee el papelito y escribe debajo lo que pasó de verdad.',
      ],
      momentoTexto:
        'Aquí la fecha no es adorno: es el día que la fuente manda de verdad. Columela, De Re Rustica XI.2.85, siglo I, siembra habas la víspera o el mismo día de la luna llena — y esa es la excepción interesante, porque la regla general del campo romano es la opuesta: Plinio el Viejo, Naturalis Historia XVIII.321-322, siglo I, pone en la menguante todo lo que se corta, se cosecha y se esquila. Llena para poner, menguante para sacar. Lo que la fuente no dice es que eso valga para el dinero — esa parte es práctica popular contemporánea, sin fuente antigua localizada.',
      cuidados:
        'La planta es una planta. Si se muere, no significa nada sobre ti ni sobre tu mes — significa que faltó agua, faltó luz o la semilla no prendió. No decidas nada de dinero a partir de lo que la planta hizo o dejó de hacer.',
      naoTemFonte: [
        'Plantar una semilla para asuntos de dinero: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'prosperidade-caderno-do-que-entra': {
      titulo: 'El cuaderno de lo que entra',
      intencao:
        'Es abrir un cuaderno solo para anotar el dinero que entra, línea por línea, durante un ciclo entero de la Luna. Lo que se hace aquí es mirar de frente un número que la mayoría evitamos. El cuaderno de entradas es hábito de gestión doméstica: práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Un cuaderno pequeño, solo para esto', 'Un bolígrafo', 'Cinco minutos por día'],
      passos: [
        'Empieza en la Luna Nueva. Escribe la fecha en la primera página.',
        'Cada vez que entre dinero, anota: fecha, monto, de dónde vino.',
        'No anotes salidas en este cuaderno. Es solo de entradas, a propósito.',
        'En la Luna Llena, suma lo que haya hasta ahí y escribe el subtotal.',
        'En la Luna Nueva siguiente, cierra el ciclo con el total y una frase sobre lo que viste.',
      ],
      momentoTexto:
        'Empieza en la Luna Nueva por un motivo de conteo: el mes de la Luna se mide de una nueva a la nueva siguiente, 29 días y medio, y eso es medición de tiempo, no simbolismo. El mes lunar contado día a día, del primero al trigésimo, ya está en Hesíodo, Los trabajos y los días, vv. 765-828, siglo VII a.C. Lo que la fuente no hace es ligar ese comienzo con el dinero — eso es práctica popular contemporánea, sin fuente antigua localizada.',
      cuidados:
        'Anotar entradas no cambia cuánto entra. Si el cuaderno muestra que no alcanza, el paso siguiente es buscar ayuda concreta — orientación de crédito, renegociación, un trabajo más.',
      naoTemFonte: [
        'Cuaderno de entradas cerrado por ciclo lunar: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },

    // ===================== PROTECCIÓN =====================
    'protecao-volta-pela-casa': {
      titulo: 'La vuelta por la casa',
      intencao:
        'Es dar una vuelta por tu casa, cuarto por cuarto, revisando qué cierra y qué está suelto: puerta, ventana, llave de gas, enchufe, lo que debe quedar fuera del alcance de los niños. Lo que se hace aquí es cuidado práctico del lugar donde vives. La ronda de revisión es hábito doméstico: práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Cinco minutos', 'Un papel para anotar lo que necesita arreglo'],
      passos: [
        'Empieza por la puerta de entrada y sigue siempre en el mismo sentido.',
        'En cada cuarto, revisa lo que cierra: ventana, llave de paso, enchufe, garrafa de gas.',
        'Anota lo que esté roto en lugar de arreglarlo en el momento.',
        'Termina en la puerta de entrada y escribe en el papel la fecha y la hora en que cerraste la ronda.',
        'Al día siguiente, resuelve el primer punto de la lista.',
      ],
      momentoTexto:
        'El sábado es el día en que la casa está llena de gente y se puede mirar todo de una vez, sin correr. Su nombre carga a Saturno por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. Sobre Saturno en sí, la fuente antigua describe física y clima, no guardia de puertas: enfriar y secar. Hacer de eso un "día de cerrar la casa" es salto nuestro, y el salto queda declarado: práctica popular contemporánea, sin fuente antigua localizada. Quien registra la fila de los días es Dion Casio, Historia Romana 37.18-19, siglo III; la física del planeta es de Claudio Ptolomeo, Tetrabiblos I.4, siglo II.',
      cuidados:
        'Esto es una revisión, no un escudo. Si algo de la lista implica riesgo — cableado, gas, estructura —, llama a un profesional en lugar de repetir la ronda.',
      naoTemFonte: [
        'El sábado como día de resguardo de la casa: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'protecao-hora-escolhida': {
      titulo: 'La hora elegida',
      intencao:
        'Es elegir con anticipación el día y la hora para empezar algo importante — una mudanza, un viaje, una primera reunión, una firma — en lugar de empezar el día que sobró. Lo que se hace aquí es llegar con la decisión tomada. Y la práctica está documentada, con fecha y dirección: en 762 quien eligió la hora de fundar Bagdad fue Nawbakht el Persa, asistido por el joven Māshā’allāh ibn Atharī, siglo VIII, y el episodio llega hasta nosotros por al-Bīrūnī, Cronología de las Naciones Antiguas, siglo XI.',
      materiais: ['Un calendario', 'La agenda de las personas involucradas', 'Papel y bolígrafo'],
      passos: [
        'Escribe en una línea lo que va a empezar. Una línea sola.',
        'Elige tres fechas posibles en las próximas cuatro semanas.',
        'Para cada fecha, anota la fase de la Luna y el día de la semana.',
        'Elige una y escribe el horario, con hora y minuto.',
        'Avisa a las personas involucradas de la fecha elegida.',
        'Ese día, empieza a la hora fijada, aunque sea con un gesto pequeño.',
      ],
      momentoTexto:
        'Elegir la hora de empezar es una rama entera de la astrología antigua — elegir el momento —, que los árabes llamaban ikhtiyārāt, las elecciones. Y tiene un caso con fecha y dirección: la tarde del 31 de julio de 762 fue elegida para iniciar la construcción de Bagdad por Nawbakht el Persa, asistido por el joven Māshā’allāh ibn Atharī, siglo VIII, y la carta llega hasta nosotros por al-Bīrūnī, Cronología de las Naciones Antiguas, siglo XI. Dos honestidades. La base de investigación de esta app registra también a Doroteo de Sidón, Carmen Astrologicum, siglo I, como origen de ese linaje, pero no leyó la obra directamente — queda como atribución registrada, no como lectura propia. Y el criterio antiguo era el cielo entero del instante — dónde estaba cada planeta, en qué parte del cielo, y qué subía por el horizonte —, no "luna creciente y listo": usar solo la fase es simplificación nuestra, práctica popular contemporánea, sin fuente antigua localizada.',
      cuidados:
        'Elegir la fecha decide cuándo empiezas, y nada más — lo que viene después sigue siendo trabajo. No pospongas una decisión urgente esperando una fase de la Luna, y nunca pospongas una consulta agendada, un plazo legal o una medida de seguridad por el calendario.',
      naoTemFonte: [
        'Reducir la elección del momento a "fase de la Luna + día de la semana": práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'protecao-limite-escrito': {
      titulo: 'El límite escrito',
      intencao:
        'Es escribir, en una frase, lo que no vas a aceptar más — y escribir también lo que vas a hacer cuando vuelva a pasar. Lo que se hace aquí es salir del "debí haberlo dicho" y tener la frase lista. Escribir el límite antes de la conversación es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Papel y bolígrafo', 'Un lugar donde nadie lea por encima de tu hombro'],
      passos: [
        'Escribe la situación en una frase, sin adjetivos: qué pasa, con quién, con qué frecuencia.',
        'Escribe el límite en una frase que empiece con "yo".',
        'Escribe lo que vas a hacer la próxima vez. Debe ser algo que dependa solo de ti.',
        'Lee las tres frases en voz alta.',
        'Guarda el papel en la billetera, o fotografíalo y guárdalo en el celular.',
      ],
      momentoTexto:
        'El martes es día hábil lo bastante temprano para que la frase escrita aquí valga toda la semana. El nombre del día lleva a Marte por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. Y la fuente antigua sobre Marte es mucho menos épica que su fama: secar y quemar, por el color de fuego del planeta — es física, no carácter. Usar el martes como día de asuntos difíciles es elección nuestra: práctica popular contemporánea, sin fuente antigua localizada. Quien registra la fila de los días es Dion Casio, Historia Romana 37.18-19, siglo III; la física del planeta es de Claudio Ptolomeo, Tetrabiblos I.4, siglo II.',
      cuidados:
        'El límite es sobre tu conducta, no sobre obligar a nadie a nada. Si la situación implica violencia o amenazas, esto no sirve: busca a la policía, una red de apoyo o alguien de confianza hoy mismo.',
      naoTemFonte: [
        'Marte como planeta del coraje y del límite: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },

    // ===================== LIMPIEZA =====================
    'limpeza-cortar-o-que-ja-secou': {
      titulo: 'Cortar lo que ya se secó',
      intencao:
        'Es elegir una cosa que claramente terminó — una suscripción que no usas, un grupo que solo ocupa espacio, una pila de papel viejo — y cerrarla de verdad, hoy. Lo que se hace aquí es el corte, en lugar del aplazamiento. Y el gesto de cortar en la Luna menguante tiene fuente: Plinio el Viejo, Naturalis Historia XVIII.321-322, siglo I, escribe que todo lo que se corta, se cosecha y se esquila sufre menos daño con la luna decreciente.',
      materiais: [
        'Una lista de las cosas que vienes aplazando cerrar',
        'Celular o computadora, si la cancelación es en línea',
        'Una bolsa de basura o una caja de donación, si es algo físico',
      ],
      passos: [
        'Elige UNA cosa. Solo una.',
        'Escribe su nombre en un papel.',
        'Haz el cierre ahora: cancela, sal del grupo, tíralo, dónalo.',
        'Tacha el nombre en el papel.',
        'Guarda el papel tachado hasta la próxima Luna menguante y elige la siguiente.',
      ],
      momentoTexto:
        'Este es el ritual con la fuente más directa de toda la biblioteca, y vale decir por qué: el campo antiguo SACA en la menguante, y eso está escrito, no es folclore. Todo lo que se corta, se cosecha y se esquila sufría menos daño con la luna decreciente, y la uva para pasas se cosechaba en la menguante. Trasladar "podar una rama" a "cancelar una suscripción" es nuestro, contemporáneo: práctica popular contemporánea, sin fuente antigua localizada. Quien escribe las dos cosas es Plinio el Viejo, Naturalis Historia XVIII.321-322, siglo I, y Columela, De Re Rustica XII.16.1, siglo I.',
      cuidados:
        'Cierra solo lo que es tuyo para cerrar. No canceles, no tires y no borres cosas de otra persona. Y si las ganas de cortar apuntan a un vínculo con gente, espera un día antes de hacer cualquier cosa.',
      naoTemFonte: [
        'Aplicar la regla de la menguante a una suscripción, un grupo o un compromiso: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'limpeza-uma-gaveta-so': {
      titulo: 'Un cajón solo',
      intencao:
        'Es elegir un cajón — uno, no el armario entero — vaciarlo sobre la cama y devolver solo lo que usaste en los últimos doce meses. Lo que se hace aquí es terminar algo hoy, en lugar de empezar una reforma. Ordenar un cajón a la vez es método doméstico corriente: práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Un cajón', 'Dos cajas: una de donación, una de basura', 'Un paño húmedo'],
      passos: [
        'Elige el cajón antes de empezar y no cambies de idea a la mitad.',
        'Vacía todo sobre la cama o el piso.',
        'Pasa el paño por el fondo del cajón vacío.',
        'Devuelve solo lo que usaste en los últimos doce meses.',
        'El resto va a la caja de donación o de basura hoy, antes de que termine el día.',
        'Cierra el cajón y no lo abras hasta mañana.',
      ],
      momentoTexto:
        'La menguante es la mitad del mes lunar en que el campo antiguo saca en lugar de poner, y eso está escrito en más de un lugar. Se abonaba y se desmalezaba con la luna decreciente; se escribía que el abono esparcido en la menguante no hacía brotar la maleza que venía dentro de él; y ya se abonaba con la luna callada — el nombre romano de la Luna Nueva, cuando no aparece en el cielo. Llamar "maleza" a un cajón desordenado es figura nuestra: práctica popular contemporánea, sin fuente antigua localizada. Los tres recibos: Plinio el Viejo, Naturalis Historia XVIII.321-322, siglo I; Columela, De Re Rustica II.5.1, siglo I; Catón el Viejo, De Agri Cultura 29, siglo II a.C.',
      cuidados:
        'Un cajón. Si abres el armario entero, el ritual se vuelve una mudanza y queda a medias. Y no tires cosas de otra persona de la casa sin preguntar.',
      naoTemFonte: [
        'El orden de la casa como asunto de fase lunar: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'limpeza-o-que-ja-pode-ficar-pra-tras': {
      titulo: 'Lo que ya puede quedar atrás',
      intencao:
        'Es escribir, a mano, tres cosas que todavía cargas y que ya pueden quedarse donde están — y después romper o quemar el papel. Lo que se hace aquí es el gesto de soltar, y vale por sí mismo. Escribir para romper es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: [
        'Papel y bolígrafo',
        'Un fregadero, o un plato hondo con un poco de agua',
        'Si vas a quemar: un plato de loza y la llave de agua cerca',
      ],
      passos: [
        'Escribe tres frases cortas, una por línea, empezando con "ya puede quedar".',
        'Lee las tres en voz alta, despacio.',
        'Rompe el papel en pedazos pequeños, o quémalo sobre el plato de loza, con la llave de agua abierta al lado.',
        'Tira los pedazos, o moja las cenizas antes de desecharlas.',
        'Lávate las manos y vuelve a lo que estabas haciendo.',
      ],
      momentoTexto:
        'El lunes es el día de sacar del camino lo que quedó colgado del mes pasado. Su nombre lleva a la Luna por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. La fase importa aquí por el mismo motivo que en los otros rituales de limpieza: la menguante es donde el campo antiguo ponía todo lo que se corta, se cosecha y se esquila. Y vale saber que la división en ocho fases con nombre que la app muestra en pantalla no es antigua; la antigua es en cuatro cuartos. Los recibos: Dion Casio, Historia Romana 37.18-19, siglo III, para la fila de los días; Plinio el Viejo, Naturalis Historia XVIII.321-322, siglo I, para la menguante; Claudio Ptolomeo, Tetrabiblos I.8, siglo II, para los cuatro cuartos; y Dane Rudhyar, The Lunation Cycle, siglo XX (1967), para las ocho fases psicológicas.',
      cuidados:
        'Si vas a quemar, hazlo en el fregadero, con el agua abierta al lado, y nunca cerca de una cortina o de alcohol. Si las tres frases son sobre una persona, escribe lo que TÚ vas a hacer, no lo que ella debería hacer.',
      naoTemFonte: [
        'Quemar papel escrito como cierre simbólico: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },

    // ===================== CORAJE =====================
    'coragem-ligacao-que-voce-adia': {
      titulo: 'La llamada que vienes aplazando',
      intencao:
        'Es hacer hoy una llamada que vienes empujando hace semanas — la del dentista, la del banco, la del pariente. Lo que se hace aquí es tachar de la lista un punto que lleva ahí demasiado tiempo. Encarar el pendiente con hora fijada es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: [
        'El número de teléfono, ya anotado',
        'Un reloj',
        'Dos frases escritas: cómo vas a abrir y qué necesitas preguntar',
      ],
      passos: [
        'Escribe el número en un papel, a mano.',
        'Escribe la primera frase que vas a decir, entera.',
        'Escribe la pregunta principal. Una sola.',
        'Fija la hora: dentro de los próximos treinta minutos.',
        'Llama. Si cae el buzón, deja un mensaje con la primera frase.',
        'Tacha el número del papel.',
      ],
      momentoTexto:
        'El martes es lo bastante temprano en la semana para que la llamada todavía quede resuelta antes del viernes. El nombre del día lleva a Marte por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. Marte como planeta del coraje es lectura de personalidad, y es reciente: la fuente antigua solo habla de calor y sequedad — secar y quemar, por el color de fuego del planeta. Usar el martes como día de encarar pendientes es elección nuestra: práctica popular contemporánea, sin fuente antigua localizada. Los recibos: Dion Casio, Historia Romana 37.18-19, siglo III, que cuenta que la costumbre era nueva en su tiempo; y Claudio Ptolomeo, Tetrabiblos I.4, siglo II.',
      cuidados:
        'Si la llamada es para alguien que pidió no ser contactado, no llames. Lo que se encara aquí es tu pendiente, nunca el límite de otra persona.',
      naoTemFonte: [
        'El martes como día de encarar pendientes: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'coragem-tres-linhas-antes': {
      titulo: 'Tres líneas antes',
      intencao:
        'Es escribir tres líneas antes de una conversación difícil: lo que quieres decir, lo que no vas a decir, y cómo quieres salir del cuarto. Lo que se hace aquí es entrar con un plan en lugar de improvisar. Escribir el guion de la conversación antes es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Una tarjeta o media hoja de papel', 'Bolígrafo', 'Cinco minutos antes de la conversación'],
      passos: [
        'Línea 1: la frase que abre. Escríbela entera, palabra por palabra.',
        'Línea 2: lo que decidiste no decir, aunque aparezca la oportunidad.',
        'Línea 3: cómo quieres salir — qué quieres haber acordado al final.',
        'Lee las tres en voz alta, una vez.',
        'Dobla el papel y llévalo en el bolsillo.',
        'Después de la conversación, escribe atrás lo que pasó de verdad.',
      ],
      momentoTexto:
        'La fase creciente entra por la regla general del campo antiguo, y es simple: lo que se quería ver crecer iba a la tierra con la Luna creciendo. El martes lleva el nombre de Marte por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. Y el encaje entre "luna creciente" y "conversación difícil" es nuestro: práctica popular contemporánea, sin fuente antigua localizada. Los recibos: Paladio, Opus Agriculturae I.6.12, siglos IV-V, para sembrar en la creciente; Dion Casio, Historia Romana 37.18-19, siglo III, para la fila de los días.',
      cuidados:
        'Una conversación difícil acordada es mejor que una conversación difícil de emboscada: avísale a la persona que quieres hablar. Si hay riesgo de agresión, no lo hagas a solas y no lo hagas en casa.',
      naoTemFonte: [
        'Fijar una conversación difícil por la fase de la Luna: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'coragem-o-dia-escolhido': {
      titulo: 'El día elegido',
      intencao:
        'Es marcar en el calendario, con día y hora, eso que vienes aplazando hace meses — la inscripción, la entrevista, el pedido. Lo que se hace aquí es convertir "algún día lo hago" en una línea en la agenda. Elegir la fecha como forma de comprometerse es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: [
        'Un calendario a la vista',
        'Un bolígrafo que no se borre',
        'Una persona a la que le vas a contar la fecha',
      ],
      passos: [
        'Escribe la cosa en una línea.',
        'Elige una fecha dentro de los próximos veintiún días.',
        'Escríbela en el calendario, a mano, con hora.',
        'Cuéntale la fecha a una persona hoy.',
        'La víspera, relee la línea que escribiste.',
      ],
      momentoTexto:
        'Elegir un buen día para empezar es cosa vieja, y es más literal de lo que parece: Hesíodo, Los trabajos y los días, vv. 765-828, siglo VII a.C., lista día por día del mes lunar cuáles son buenos y cuáles no; Virgilio, Geórgicas I.276-286, siglo I a.C., manda huir del quinto día y da el decimoséptimo por feliz para plantar la vid. Dos salvedades honestas: los dos cuentan DÍAS del mes lunar, del 1 al 30, y no fases — convertir eso en "Luna Creciente" es cuenta nuestra; y su lista es sobre campo y casa, no sobre inscribirse en un concurso. En las dos puntas, lo que queda es práctica popular contemporánea, sin fuente antigua localizada.',
      cuidados:
        'Marcar la fecha no hace el trabajo. Si llega el día y no estás listo, cambia la fecha una vez y escribe por qué — cambiarla tres veces es señal de que el paso es demasiado grande y hay que partirlo en pedazos más chicos.',
      naoTemFonte: [
        'Convertir los días del mes lunar de Hesíodo y Virgilio en fases con nombre: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },

    // ===================== FOCO =====================
    'foco-uma-coisa-so': {
      titulo: 'Una sola cosa',
      intencao:
        'Es elegir, al empezar el día, una única cosa que tiene que pasar — y escribirla en un papel que queda frente al teclado. Lo que se hace aquí es tener un criterio listo para decir "eso no es hoy". Elegir una tarea principal por día es método de trabajo corriente: práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Un papel pequeño', 'Bolígrafo', 'Un lugar fijo donde el papel quede visible'],
      passos: [
        'Antes de abrir cualquier mensaje, escribe la única cosa del día.',
        'Escribe debajo lo que acuerdas contigo NO hacer hoy.',
        'Pon el papel frente al teclado, o en la puerta del refrigerador.',
        'Al final del día, escribe atrás: hecho, a medias o no hecho.',
        'Guarda los papeles de la semana juntos y míralos todos el domingo.',
      ],
      momentoTexto:
        'El miércoles es la mitad de la semana: el día en que se ve si la semana va o no va. Su nombre lleva a Mercurio por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. Y hay un detalle bonito en la fuente antigua: Mercurio es el único de los siete sin cualidad fija, que a veces seca y a veces absorbe humedad, como inspirado por la rapidez de su propio movimiento. Ligar eso al estudio y la escritura es convención de hoy: práctica popular contemporánea, sin fuente antigua localizada. Los recibos: Dion Casio, Historia Romana 37.18-19, siglo III; y Claudio Ptolomeo, Tetrabiblos I.4, siglo II.',
      cuidados:
        'Una cosa por día es un criterio, no un reclamo. El día que no se pudo, escribe "no hecho" y sigue — la pila de papeles existe para que veas el patrón de la semana, no para volverse prueba en tu contra.',
      naoTemFonte: [
        'El miércoles como día de estudio y escritura: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'foco-mesa-vazia': {
      titulo: 'La mesa vacía',
      intencao:
        'Es dejar la mesa de trabajo sin nada encima aparte de lo que vas a usar en la próxima hora. Lo que se hace aquí es sacar de la vista lo que compite por tu atención. La mesa vacía como método es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Una caja vacía', 'Un paño', 'Diez minutos'],
      passos: [
        'Saca TODO de la mesa y ponlo dentro de la caja.',
        'Pasa el paño por la mesa vacía.',
        'Devuelve solo lo que vas a usar en la próxima hora.',
        'Pon la caja fuera del campo de visión.',
        'Trabaja una hora. Después decide, punto por punto, qué vuelve.',
      ],
      momentoTexto:
        'La idea de sacar cosas en la fase que disminuye viene del campo romano, y es literal: en la luna decreciente iba todo lo que se corta, se cosecha y se esquila, y la madera se cortaba entre los días 20 y 30 del mes lunar. El miércoles lleva el nombre de Mercurio por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. El salto de "cosechar trigo" a "vaciar la mesa" es nuestro: práctica popular contemporánea, sin fuente antigua localizada. Los recibos: Plinio el Viejo, Naturalis Historia XVIII.321-322, siglo I; Columela, De Re Rustica XI.2.11, siglo I; y Dion Casio, Historia Romana 37.18-19, siglo III.',
      cuidados:
        'No tires nada en este ritual — todo va a la caja. La decisión de descartar es otro ritual, otro día.',
      naoTemFonte: [
        'Vaciar la mesa de trabajo en la menguante: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'foco-vinte-minutos-marcados': {
      titulo: 'Veinte minutos con reloj',
      intencao:
        'Es trabajar veinte minutos cronometrados en una sola cosa, con el teléfono en otro cuarto, y parar cuando suene el cronómetro aunque esté rindiendo. Lo que se hace aquí es completar un bloque entero en lugar de picar la tarde. Los bloques cronometrados son método de trabajo de hoy: práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: [
        'Un cronómetro (el de la cocina sirve)',
        'La tarea ya elegida antes de empezar',
        'El teléfono en otro cuarto',
      ],
      passos: [
        'Elige la tarea y escribe su nombre en un papel.',
        'Lleva el teléfono a otro cuarto.',
        'Marca veinte minutos.',
        'Trabaja solo en esa tarea. Si te acuerdas de otra cosa, anótala en el papel y sigue.',
        'Cuando suene, para. Aunque esté rindiendo.',
        'Escribe en el papel hasta dónde llegaste.',
      ],
      momentoTexto:
        'La fase creciente entra por la regla agrícola general: lo que se quiere que crezca va con la Luna creciendo, según Paladio, Opus Agriculturae I.6.12, siglos IV-V. Y el cuarto creciente es una de las divisiones que tienen fuente antigua de verdad: Claudio Ptolomeo, Tetrabiblos I.8, siglo II, parte el ciclo en cuatro cuartos y le da una cualidad a cada uno. Las ocho fases con nombre que ves en la app son convención moderna, y su lectura psicológica es de Dane Rudhyar, The Lunation Cycle, siglo XX (1967).',
      cuidados:
        'Veinte minutos es un bloque, no una meta. Si no llegas a los veinte, anota cuántos fueron y para — el número anotado sirve para ajustar el próximo bloque, no para reclamarte.',
      naoTemFonte: [
        'Bloque cronometrado de trabajo en la fase creciente: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },

    // ===================== AUTOESTIMA =====================
    'autoestima-o-que-eu-fiz': {
      titulo: 'Lo que hice',
      intencao:
        'Es escribir, en una hoja, lo que de verdad hiciste en los últimos siete días — incluido lo pequeño, incluido lo aburrido. Lo que se hace aquí es leer la lista entera de una vez, porque separada desaparece. Hacer inventario de lo hecho es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Una hoja entera', 'Bolígrafo', 'La agenda o el historial del celular, para recordar'],
      passos: [
        'Escribe arriba los siete días, uno debajo del otro.',
        'En cada día, escribe al menos una cosa que hiciste. Lavar los platos cuenta.',
        'No escribas lo que faltó. Esta hoja es solo de lo que pasó.',
        'Lee la hoja entera en voz alta, de principio a fin.',
        'Guárdala y repite el domingo siguiente.',
      ],
      momentoTexto:
        'El domingo es cuando la semana ya terminó y la próxima todavía no empieza — la única hora en que se pueden mirar las dos. Su nombre lleva al Sol por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. Y la fuente antigua sobre el Sol habla de calor y sequedad, no de brillo personal: calentar y, en cierta medida, secar. El domingo como día de mirar la semana es arreglo nuestro, de calendario de trabajo: práctica popular contemporánea, sin fuente antigua localizada. Los recibos: Dion Casio, Historia Romana 37.18-19, siglo III; y Claudio Ptolomeo, Tetrabiblos I.4, siglo II.',
      cuidados:
        'Si la hoja sale corta, está bien así — las semanas cortas existen. No conviertas la lista en comparación con la semana de otra persona.',
      naoTemFonte: [
        'El domingo como día de recuento personal: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'autoestima-espelho-e-tres-frases': {
      titulo: 'El espejo y tres frases',
      intencao:
        'Es pararte frente al espejo y decir, en voz alta, tres frases sobre cosas que hiciste — comprobables, no elogio genérico. Lo que se hace aquí es oír tu propia voz diciendo algo que se puede verificar. Hablarle al espejo es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Un espejo', 'Las tres frases escritas antes, en un papel', 'La puerta cerrada'],
      passos: [
        'Escribe las tres frases antes, en el papel. Cada una tiene que citar un hecho: qué hiciste, cuándo.',
        'Cierra la puerta y párate frente al espejo.',
        'Lee la primera frase en voz alta, mirándote.',
        'Repite con la segunda y la tercera.',
        'Dobla el papel y guárdalo. No lo tires.',
      ],
      momentoTexto:
        'La Luna Llena es el pico de luz del ciclo, y eso es astronomía, no interpretación. Leer la llena como hora de ver con claridad ya es lectura de hoy, y la fuente antigua le da otro uso. El domingo lleva el nombre del Sol por herencia de la fila antigua de los planetas — el orden caldeo, los siete en fila del más lento al más rápido, de donde la secuencia de los días se deriva saltando tres posiciones cada 24 horas planetarias. Los recibos: Columela, De Re Rustica XI.2.85, siglo I, que siembra habas en la llena; Claudio Ptolomeo, Tetrabiblos I.8, siglo II, que marca el paso de la llena al cuarto menguante como el tramo seco del ciclo; y Dion Casio, Historia Romana 37.18-19, siglo III, para la fila de los días.',
      cuidados:
        'La frase tiene que ser comprobable. Si no crees lo que estás diciendo, cámbiala por un hecho más pequeño y más verdadero — una frase que suena falsa no sirve de nada aquí.',
      naoTemFonte: [
        'Hablarle al espejo en Luna Llena: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
    'autoestima-carta-de-um-ano': {
      titulo: 'La carta de un año',
      intencao:
        'Es escribirte una carta para dentro de un año, con fecha, y guardarla sellada. Lo que se hace aquí es registrar quién eres hoy, con tus palabras, para revisarlo después. La carta al yo futuro es práctica popular contemporánea, sin fuente antigua localizada.',
      materiais: ['Papel y bolígrafo', 'Un sobre', 'Un lugar seguro para guardarla doce meses'],
      passos: [
        'Escribe la fecha de hoy arriba.',
        'Cuenta en qué punto estás: trabajo, casa, gente cerca, qué está difícil.',
        'Escribe tres preguntas para el tú de dentro de un año.',
        'No escribas metas. Escribe preguntas.',
        'Sella el sobre, escribe la fecha de apertura por fuera y guárdalo.',
        'En la fecha, ábrelo y responde por escrito.',
      ],
      momentoTexto:
        'La llena entra aquí por la luz, que es medida, y vale separar lo que es medida de lo que es lectura. Claudio Ptolomeo, Tetrabiblos I.8, siglo II, divide el ciclo lunar en cuatro cuartos con cualidades — esa es la doctrina antigua de fases, y es la única. Las ocho fases con nombre y lectura de personalidad son de Dane Rudhyar, The Lunation Cycle, siglo XX (1967). Y escribir una carta al yo futuro en la llena no está en ninguna fuente: práctica popular contemporánea, sin fuente antigua localizada.',
      cuidados:
        'Un año es mucho tiempo. Escribe de un modo que no le exija nada a quien va a abrirla — quien abre eres tú, y puedes estar en otro punto de la vida.',
      naoTemFonte: [
        'Carta al yo futuro escrita en Luna Llena: práctica popular contemporánea, sin fuente antigua localizada.',
      ],
    },
  },
};
