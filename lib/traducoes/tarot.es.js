// lib/traducoes/tarot.es.js
// Pacote de idioma ESPANHOL do Tarô — espanhol neutro-latino (não castelhano
// de Espanha). Mesma FORMA do pacote pt (mesmas chaves, mesmos placeholders);
// a paridade é cobrada por test/tarotIdiomas.test.js.
//
// Regras que valem aqui (as mesmas do motor, lib/tarotThemes.js):
// • Tradução de SENTIDO — prende primeiro, fonte depois; conversa, não aula.
// • O que NUNCA se traduz: nomes de obra e locus ("Book T", Pictorial Key),
//   números, datas. Títulos de carta em ES são os consagrados em espanhol
//   (El Loco, La Torre, Sota/Caballero/Reina/Rey, Bastos/Copas/Espadas/Oros).
// • O verbatim de Waite (1911) fica em INGLÊS como citação; a nota que o
//   enquadra é que vai em espanhol.
// • Linha vermelha (test/tarotIdiomas.test.js): aliviar/calmar/sanar/curar/
//   tratar/energizar NÃO entram, em nenhuma forma. Nada de promessa de
//   futuro: o Futuro é "Vector, no hecho consumado."

const MAJORS = {
  'major-00': {
    name: 'El Loco',
    keywords: ['salto de fe', 'nuevos comienzos', 'espontaneidad', 'libertad'],
    upright: 'Inicio de un viaje, inocencia y disposición a arriesgar sin miedo a lo desconocido.',
    reversed: 'Imprudencia, decisiones apresuradas o miedo a dar el primer paso.',
    cena: 'el caminante con el hatillo al hombro y el pie al borde del precipicio, y el perro tirando de su ropa',
    conselho: 'El paso pide confianza, no garantía — pero mira dónde pisas antes de saltar.',
    conselhoInvertido: 'Antes de arriesgar, pregúntate si es coraje o huida; si lo que frena es miedo, ponle nombre al miedo.',
  },
  'major-01': {
    name: 'El Mago',
    keywords: ['poder personal', 'habilidad', 'manifestación', 'acción'],
    upright: 'Tienes todas las herramientas y recursos necesarios para manifestar tus objetivos.',
    reversed: 'Manipulación, talentos desperdiciados o falta de foco y planificación.',
    cena: 'la mesa con los cuatro símbolos de los palos, una mano apuntando al cielo y otra a la tierra',
    conselho: 'Las herramientas ya están sobre tu mesa; lo que falta es elegir cuál usar primero.',
    conselhoInvertido: 'Verifica si la promesa — tuya o de alguien — tiene respaldo: el talento disperso no manifiesta nada.',
  },
  'major-02': {
    name: 'La Sacerdotisa',
    keywords: ['intuición', 'misterio', 'sabiduría interior', 'subconsciente'],
    upright: 'Confía en tu intuición y en los secretos aún no revelados; la sabiduría viene del silencio interior.',
    reversed: 'Secretos revelados, desconexión de la intuición o información oculta y engañosa.',
    cena: 'la guardiana sentada entre las columnas blanca y negra, con el rollo de la ley medio escondido en el manto',
    conselho: 'No todo necesita decirse o decidirse ahora; espera el dato que todavía no llegó.',
    conselhoInvertido: 'O te están escondiendo algo, o estás ignorando lo que ya sabes por dentro — verifica cuál de los dos.',
  },
  'major-03': {
    name: 'La Emperatriz',
    keywords: ['abundancia', 'fertilidad', 'naturaleza', 'creatividad'],
    upright: 'Abundancia, creatividad fértil y conexión con la naturaleza florecen en tu vida.',
    reversed: 'Bloqueo creativo, dependencia excesiva o descuido contigo mismo.',
    cena: 'el trono acolchado en el campo de trigo maduro, con el cetro en la mano y el escudo de Venus al lado',
    conselho: 'Deja crecer en el tiempo que la cosa pide — cuidar aquí también es producir.',
    conselhoInvertido: 'Cuidar de todo el mundo y de nada tuyo seca la fuente; recoge un poco hacia dentro.',
  },
  'major-04': {
    name: 'El Emperador',
    keywords: ['autoridad', 'estructura', 'control', 'liderazgo'],
    upright: 'Estructura, autoridad y liderazgo estable traen orden y seguridad.',
    reversed: 'Rigidez excesiva, autoritarismo o falta de disciplina y control.',
    cena: 'el trono de piedra con cabezas de carnero, en una montaña seca sin nada verde alrededor',
    conselho: 'Define la regla y el límite antes de seguir — aquí la estructura es protección, no prisión.',
    conselhoInvertido: 'Demasiada rigidez y ninguna estructura terminan igual: nada se sostiene.',
  },
  'major-05': {
    name: 'El Hierofante',
    keywords: ['tradición', 'conformidad', 'espiritualidad institucional', 'enseñanza'],
    upright: 'La tradición, la orientación espiritual y los valores establecidos guían el camino.',
    reversed: 'Rebeldía contra las convenciones, dogmatismo o cuestionamiento de creencias tradicionales.',
    cena: 'el maestro entre dos columnas bendiciendo a dos discípulos, con las llaves cruzadas a los pies',
    conselho: 'Vale consultar a quien ya recorrió ese camino antes de inventar el tuyo.',
    conselhoInvertido: 'La regla heredada puede ya no servir — cuestiónala, pero sabe qué estás dejando atrás.',
  },
  'major-06': {
    name: 'Los Enamorados',
    keywords: ['elecciones', 'alineación de valores', 'amor', 'armonía'],
    upright: 'Unión, amor verdadero y una elección importante alineada con tus valores.',
    reversed: 'Desarmonía, valores desalineados o elecciones en conflicto en el amor.',
    cena: 'el ángel sobre dos figuras, entre el árbol del conocimiento y el árbol de la vida: el instante antes de la elección',
    conselho: 'Elige por lo que valoras, no por lo más fácil — y elige una sola cosa.',
    conselhoInvertido: 'Si la decisión se trabó, es porque dos valores tuyos están en conflicto; nómbralos antes de decidir.',
  },
  'major-07': {
    name: 'El Carro',
    keywords: ['determinación', 'voluntad', 'victoria', 'control'],
    upright: 'Victoria a través de la determinación, el foco y el control sobre fuerzas opuestas.',
    reversed: 'Falta de dirección, agresividad o pérdida de control sobre el rumbo.',
    cena: 'el conductor de pie entre dos esfinges de colores opuestos, sin riendas en las manos',
    conselho: 'Sostén la dirección con la voluntad, no con la fuerza — las dos esfinges tiran hacia lados opuestos.',
    conselhoInvertido: 'Sin rumbo definido, la energía se vuelve agitación; detente y di hacia dónde antes de acelerar.',
  },
  'major-08': {
    name: 'La Fuerza',
    keywords: ['coraje', 'paciencia', 'compasión', 'fuerza interior'],
    upright: 'El coraje sereno y la compasión superan cualquier obstáculo con paciencia.',
    reversed: 'Inseguridad, duda de ti mismo o fuerza bruta en lugar de gentileza.',
    cena: 'la mujer cerrando la boca del león con las propias manos, sin violencia, bajo el símbolo del infinito',
    conselho: 'Firmeza con gentileza dobla lo que la fuerza bruta solo irrita.',
    conselhoInvertido: 'La duda sobre ti está haciendo el trabajo que el obstáculo no logró hacer.',
  },
  'major-09': {
    name: 'El Ermitaño',
    keywords: ['introspección', 'búsqueda interior', 'soledad', 'orientación'],
    upright: 'Momento de introspección y de buscar respuestas dentro de ti.',
    reversed: 'Aislamiento excesivo, soledad no deseada o negarse a pedir ayuda.',
    cena: 'el viejo en lo alto de la montaña con una estrella dentro de la linterna, iluminando solo el próximo paso',
    conselho: 'Recogerse un tiempo aquí es método, no huida — la linterna muestra un paso a la vez.',
    conselhoInvertido: 'El retiro se volvió aislamiento; pide ayuda a una persona específica, no al mundo en general.',
  },
  'major-10': {
    name: 'La Rueda de la Fortuna',
    keywords: ['ciclos', 'destino', 'cambio', 'suerte'],
    upright: 'Cambio de ciclo trayendo nuevas oportunidades guiadas por el destino.',
    reversed: 'Mala suerte percibida, resistencia al cambio o ciclos negativos que se repiten.',
    cena: 'la rueda girando en el cielo con las cuatro criaturas en las esquinas, cada una leyendo su propio libro',
    conselho: 'Lo que gira no pide control, pide posición — mira en qué punto de la vuelta estás.',
    conselhoInvertido: 'Si el mismo ciclo se repite, busca tu parte en él: ahí es donde existe elección.',
  },
  'major-11': {
    name: 'La Justicia',
    keywords: ['verdad', 'equilibrio', 'ley', 'causa y efecto'],
    upright: 'Equilibrio, verdad y justicia imparcial guían las decisiones y sus resultados.',
    reversed: 'Injusticia, deshonestidad o falta de responsabilidad por los propios actos.',
    cena: 'la figura sentada con la espada en alto en una mano y la balanza en la otra, entre las cortinas',
    conselho: 'Mira el hecho antes que el sentimiento y asume tu parte de la cuenta.',
    conselhoInvertido: 'Hay un desequilibrio real; antes de acusar, revisa qué parte de él es tuya.',
  },
  'major-12': {
    name: 'El Colgado',
    keywords: ['pausa', 'entrega', 'nueva perspectiva', 'sacrificio'],
    upright: 'Una pausa voluntaria revela una nueva perspectiva sobre la situación.',
    reversed: 'Resistencia al sacrificio necesario, estancamiento o retrasos no deseados.',
    cena: 'el hombre colgado boca abajo de un pie, sereno, con un halo alrededor de la cabeza',
    conselho: 'La pausa es el trabajo ahora — insistir solo aprieta el nudo.',
    conselhoInvertido: 'Llevas colgado demasiado tiempo sin que nada cambie: o te entregas de verdad, o bajas.',
  },
  'major-13': {
    name: 'La Muerte',
    keywords: ['transformación', 'fin de ciclo', 'transición', 'renovación'],
    upright: 'Fin de un ciclo abriendo espacio para una transformación profunda y renovación.',
    reversed: 'Resistencia al cambio, estancamiento o miedo a cerrar un ciclo necesario.',
    cena: 'el caballero de armadura pasando con el estandarte de la rosa blanca, y el sol naciendo entre dos torres al fondo',
    conselho: 'Algo terminó de verdad; la energía gastada en sostener es la que va a faltar para lo que viene.',
    conselhoInvertido: 'Sostener lo que ya terminó no lo trae de vuelta — solo aplaza el duelo y cobra intereses.',
  },
  'major-14': {
    name: 'La Templanza',
    keywords: ['equilibrio', 'moderación', 'paciencia', 'armonía'],
    upright: 'Equilibrio y moderación traen armonía entre fuerzas opuestas.',
    reversed: 'Excesos, desequilibrio o falta de paciencia y de visión a largo plazo.',
    cena: 'el ángel con un pie en el agua y otro en la tierra, pasando líquido de una copa a otra',
    conselho: 'Mezcla de a poco: aquí la dosis justa importa más que la decisión.',
    conselhoInvertido: 'Algún exceso está desajustando el resto; identifica uno solo y reduce ese.',
  },
  'major-15': {
    name: 'El Diablo',
    keywords: ['apego', 'vicios', 'materialismo', 'sombra'],
    upright: 'El apego a patrones limitantes, vicios o materialismo excesivo te tiene preso.',
    reversed: 'Liberación de cadenas autoimpuestas y reconocimiento de patrones dañinos.',
    cena: 'la pareja encadenada al bloque — con las cadenas lo bastante flojas para salir por la cabeza',
    conselho: 'Mira la cadena y lo que te da a cambio; sin eso, el patrón continúa.',
    conselhoInvertido: 'La cadena se está aflojando — nombra lo que ya puedes soltar hoy.',
  },
  'major-16': {
    name: 'La Torre',
    keywords: ['ruptura súbita', 'revelación', 'caos', 'despertar'],
    upright: 'Una ruptura súbita y reveladora derriba estructuras que ya no sostenían.',
    reversed: 'Evitar un cambio inevitable, desastre aplazado o miedo a la transformación.',
    cena: 'el rayo arrancando la corona de lo alto de la torre y las dos figuras cayendo',
    conselho: 'Lo que cayó ya estaba rajado; recoge lo que era verdadero y no reconstruyas igual.',
    conselhoInvertido: 'La caída se está aplazando, o viviéndose por dentro en silencio — aplazar aquí cobra intereses.',
  },
  'major-17': {
    name: 'La Estrella',
    keywords: ['esperanza', 'fe', 'renovación', 'inspiración'],
    upright: 'Esperanza, inspiración y renovación después de un tiempo difícil.',
    reversed: 'Desesperanza, falta de fe o desconexión de la propia inspiración.',
    cena: 'la mujer arrodillada derramando dos jarras, una en la laguna y otra en la tierra, bajo ocho estrellas',
    conselho: 'Confía lo suficiente para seguir regando el suelo: la recuperación es lenta y es real.',
    conselhoInvertido: 'La fe bajó — busca la cosa pequeña y concreta que todavía funciona y empieza por ella.',
  },
  'major-18': {
    name: 'La Luna',
    keywords: ['ilusión', 'intuición', 'miedo', 'subconsciente'],
    upright: 'Una intuición profunda emerge, pero ilusiones y miedos aún enturbian la claridad.',
    reversed: 'Confusión disipada, miedos superados o la verdad saliendo a la luz.',
    cena: 'el camino entre dos torres, el perro y el lobo aullando y el cangrejo de río saliendo del agua',
    conselho: 'No decidas a oscuras; espera a que aclare o pide un segundo par de ojos.',
    conselhoInvertido: 'Lo que asustaba está tomando forma — el miedo era más grande que el hecho.',
  },
  'major-19': {
    name: 'El Sol',
    keywords: ['alegría', 'éxito', 'vitalidad', 'claridad'],
    upright: 'Éxito, alegría genuina y vitalidad plena iluminan el camino.',
    reversed: 'Optimismo exagerado, éxito momentáneamente opacado o falta de claridad.',
    cena: 'el niño en el caballo blanco bajo los girasoles, con el sol de rostro abierto en lo alto',
    conselho: 'Deja que sea simple y visible — no todo necesita complicación para valer.',
    conselhoInvertido: 'La alegría está ahí, solo opacada; busca qué está tapando la luz.',
  },
  'major-20': {
    name: 'El Juicio',
    keywords: ['renacimiento', 'llamado interior', 'evaluación', 'absolución'],
    upright: 'Un llamado interior te invita a un despertar y a un renacimiento personal.',
    reversed: 'Autocrítica excesiva, dudas sobre decisiones pasadas o resistencia al llamado.',
    cena: 'el ángel con la trompeta y las figuras levantándose de los ataúdes, con los brazos abiertos',
    conselho: 'Un llamado antiguo volvió; responder es decidir, no esperar una señal mejor.',
    conselhoInvertido: 'La autocrítica no es evaluación: juzga el acto, no la persona que eres.',
  },
  'major-21': {
    name: 'El Mundo',
    keywords: ['conclusión', 'realización', 'integración', 'plenitud'],
    upright: 'Realización plena y conclusión exitosa de un gran ciclo de vida.',
    reversed: 'Un ciclo inacabado, sensación de estancamiento o búsqueda de cierre.',
    cena: 'la figura danzando dentro de la corona de laureles, con las cuatro criaturas en las esquinas',
    conselho: 'Cierra el ciclo por completo antes de abrir el próximo — reconocer el fin es parte de eso.',
    conselhoInvertido: 'Falta un detalle para cerrar y es ese el que sostiene todo; descubre cuál es.',
  },
};

// Menores: keywords/upright/reversed espelham MINOR_MEANINGS; cena/conselho/
// conselhoInvertido espelham CARD_DEPTH (lib/tarotDeck.js), carta a carta.
const MINORS = {
  paus: {
    1: { keywords: ['inicio', 'inspiración', 'potencial'], upright: 'Nuevo comienzo, inspiración creativa y potencial listo para entrar en acción.', reversed: 'Retrasos, falta de dirección o energía creativa bloqueada.', cena: 'la mano saliendo de la nube sosteniendo un bastón que todavía brota hojas', conselho: 'La chispa es real, pero todavía es chispa — da hoy el primer paso concreto.', conselhoInvertido: 'Las ganas existen y no salen del lugar: reduce el proyecto al paso más pequeño posible.' },
    2: { keywords: ['planificación', 'decisión', 'expansión'], upright: 'Planificación cuidadosa y decisiones sobre el futuro abren nuevos horizontes.', reversed: 'Miedo a lo desconocido o falta de plan para expandir.', cena: 'el hombre en lo alto del castillo con el globo en la mano, mirando el mar, un bastón fijado a la pared y otro en la mano', conselho: 'Elige entre el mapa y el mundo: planificar más no sustituye decidir.', conselhoInvertido: 'El miedo a lo desconocido está disfrazado de "todavía no es hora".' },
    3: { keywords: ['previsión', 'expansión', 'resultados'], upright: 'Expansión y visión de largo plazo traen resultados de esfuerzos ya en marcha.', reversed: 'Retrasos u obstáculos inesperados en los planes en curso.', cena: 'la figura de espaldas en el acantilado, tres bastones clavados, viendo partir los barcos', conselho: 'Lo que lanzaste ya está en camino; ahora toca acompañar, no empezar de nuevo.', conselhoInvertido: 'El retraso es del plazo, no del proyecto — revisa la expectativa antes de revisar el plan.' },
    4: { keywords: ['celebración', 'armonía', 'hogar'], upright: 'Celebración, armonía y un momento para festejar en el hogar o la comunidad.', reversed: 'Inestabilidad doméstica o una celebración aplazada.', cena: 'cuatro bastones floridos formando un pórtico con guirnalda, y la fiesta ocurriendo detrás', conselho: 'Algo ya fue construido y todavía no fue reconocido — reconócelo antes de seguir.', conselhoInvertido: 'O la base está inestable, o la celebración se está aplazando; cuida la casa primero.' },
    5: { keywords: ['conflicto', 'competencia', 'tensión'], upright: 'Conflicto, competencia y tensión entre voluntades o intereses distintos.', reversed: 'Conflictos internos o el deseo de evitar una confrontación necesaria.', cena: 'cinco jóvenes con bastones en alto en una escaramuza confusa, más entrenamiento que guerra', conselho: 'Esto es escaramuza, no guerra: arbitra lo acordado en vez de ganar la discusión.', conselhoInvertido: 'El conflicto se volvió hacia dentro — nombra lo que no dijiste.' },
    6: { keywords: ['victoria', 'reconocimiento', 'éxito'], upright: 'Victoria y reconocimiento público después de un esfuerzo logrado.', reversed: 'Caída de popularidad, arrogancia o retraso del reconocimiento merecido.', cena: 'el jinete coronado de laureles desfilando entre los que van a pie', conselho: 'Acepta el reconocimiento sin convencerte de que es permanente.', conselhoInvertido: 'Si el mérito no llegó, revisa lo que se entregó antes de culpar al público.' },
    7: { keywords: ['defensa', 'perseverancia', 'desafío'], upright: 'Defensa firme de la propia posición y perseverancia frente a los desafíos.', reversed: 'Sensación de sobrecarga o de ceder a la presión de los demás.', cena: 'la figura en lo alto del terreno defendiendo la posición contra seis bastones que suben', conselho: 'Vale defender la posición, siempre que todavía sea tuya — verifica eso antes de gastar fuerza.', conselhoInvertido: 'La presión venció por cansancio; elige un solo frente y suelta los otros.' },
    8: { keywords: ['velocidad', 'movimiento', 'progreso'], upright: 'Acción rápida, movimiento y progreso acelerado hacia el objetivo.', reversed: 'Retrasos, frustración o algo que se arrastra más de lo debido.', cena: 'ocho bastones cruzando el cielo abierto en pleno vuelo, sin nadie en la escena', conselho: 'Las cosas andan rápido ahora: responde al ritmo en vez de frenar.', conselhoInvertido: 'Lo que se atascó pide un destrabe simple, no un plan nuevo.' },
    9: { keywords: ['resiliencia', 'cautela', 'persistencia'], upright: 'Resiliencia y cautela reúnen las últimas fuerzas antes de la victoria final.', reversed: 'Agotamiento, terquedad excesiva o fuerzas al límite.', cena: 'el hombre herido en la cabeza, apoyado en el bastón, con ocho bastones en fila detrás como cerca', conselho: 'Estás herido y todavía de pie — solo no confundas vigilancia con desconfiar de todo.', conselhoInvertido: 'La guardia alta se volvió muro; verifica si todavía existe enemigo afuera.' },
    10: { keywords: ['sobrecarga', 'carga', 'responsabilidad'], upright: 'Sobrecarga de responsabilidades y una carga pesada que llevar.', reversed: 'Soltar cargas innecesarias, delegar o reconocer el agotamiento.', cena: 'la figura encorvada cargando diez bastones que le tapan la vista de la ciudad justo enfrente', conselho: 'La carga necesita apoyarse, no cargarse mejor: suelta una parte o divide.', conselhoInvertido: 'Ya estás soltando carga — elige cuál sale primero y no tomes otra en su lugar.' },
    11: { keywords: ['entusiasmo', 'curiosidad', 'mensaje'], upright: 'Mensajero entusiasta, curiosidad y nuevas ideas creativas surgiendo.', reversed: 'Falta de dirección, procrastinación o malas noticias.', cena: 'el joven de pie en el desierto mirando la punta del bastón como quien lee una noticia', conselho: 'Llegó una idea o noticia nueva; investiga antes de anunciar.', conselhoInvertido: 'Muchas ideas y ningún comienzo: elige una y dale un plazo.' },
    12: { keywords: ['acción', 'aventura', 'impulsividad'], upright: 'Acción impulsiva, pasión y disposición para viajes y aventuras.', reversed: 'Impulsividad excesiva, frustración o proyectos abandonados a mitad de camino.', cena: 'el caballo encabritado y el jinete de armadura partiendo a toda velocidad', conselho: 'Buena hora para partir — con la salvedad de siempre: sabe hacia dónde.', conselhoInvertido: 'El impulso sin dirección deja proyectos a medias; termina uno antes del próximo.' },
    13: { keywords: ['confianza', 'determinación', 'independencia'], upright: 'Confianza magnética, determinación e independencia inquebrantables.', reversed: 'Celos, inseguridad o comportamiento autoritario.', cena: 'la reina de frente, girasol en la mano y el gato negro sentado a los pies', conselho: 'Sostén lo que es tuyo con calidez, sin necesidad de convencer a nadie.', conselhoInvertido: 'Si habla la inseguridad, va a sonar a control — fíjate en eso.' },
    14: { keywords: ['liderazgo', 'visión', 'carisma'], upright: 'Liderazgo visionario, coraje emprendedor y carisma natural.', reversed: 'Impulsividad, arrogancia o expectativas exageradas sobre los demás.', cena: 'el rey ligeramente de lado en el trono de salamandras, bastón firme en la mano', conselho: 'Lidera con la visión y delega la ejecución; centralizar aquí traba todo.', conselhoInvertido: 'La promesa quedó más grande que la entrega — ajusta el tamaño de lo que prometiste.' },
  },
  copas: {
    1: { keywords: ['nuevo amor', 'intuición', 'apertura emocional'], upright: 'Nuevo amor, apertura emocional e intuición fértil desbordando.', reversed: 'Bloqueo emocional, amor no correspondido o sensación de vacío interior.', cena: 'la mano en la nube ofreciendo la copa de cinco chorros, con la paloma descendiendo', conselho: 'Hay una apertura afectiva disponible; recibir también es un acto.', conselhoInvertido: 'El canal se cerró por protección — no fuerces, pero fíjate en qué lo cerró.' },
    2: { keywords: ['unión', 'pareja', 'atracción'], upright: 'Unión, pareja y atracción mutua creando una conexión verdadera.', reversed: 'Desequilibrio en la relación, ruptura o desarmonía entre las partes.', cena: 'los dos mirándose e intercambiando copas bajo el caduceo y la cabeza de león', conselho: 'Un vínculo entre iguales pide acuerdo dicho en voz alta, no supuesto.', conselhoInvertido: 'El intercambio está desigual; di cuál es el desequilibrio en vez de compensar en soledad.' },
    3: { keywords: ['celebración', 'amistad', 'comunidad'], upright: 'Celebración, amistad y alegría compartida en buena compañía.', reversed: 'Excesos, chismes o aislamiento social.', cena: 'las tres danzando en ronda con las copas en alto, en medio de la cosecha', conselho: 'Celebra con quien estuvo a tu lado — el lazo también se mantiene en fiesta.', conselhoInvertido: 'El exceso o el chisme está corroyendo al grupo; recógete un poco.' },
    4: { keywords: ['apatía', 'contemplación', 'oportunidad perdida'], upright: 'Apatía y contemplación frente a oportunidades que pasan desapercibidas.', reversed: 'Despertar a nuevas posibilidades y superación del tedio.', cena: 'el joven de brazos cruzados bajo el árbol, ignorando la cuarta copa que la nube ofrece', conselho: 'Una oferta está extendida y no la estás mirando — fíjate en lo que ya llegó.', conselhoInvertido: 'El tedio está pasando; vuelve a aceptar las invitaciones pequeñas.' },
    5: { keywords: ['pérdida', 'duelo', 'arrepentimiento'], upright: 'Pérdida, duelo y la mirada puesta en lo que ya no está.', reversed: 'Aceptación, perdón y disposición para seguir adelante.', cena: 'la figura de manto negro mirando las tres copas caídas, sin ver las dos todavía en pie detrás de ella', conselho: 'Tres copas cayeron y dos siguen en pie — gírate hacia las que quedaron, sin apurar el duelo.', conselhoInvertido: 'El perdón está empezando a caber; sigue adelante sin exigirte olvidar.' },
    6: { keywords: ['nostalgia', 'recuerdos', 'infancia'], upright: 'Nostalgia, buenos recuerdos y reencuentros con el pasado.', reversed: 'Apego excesivo al pasado o idealización de tiempos que ya se fueron.', cena: 'el niño entregando la copa florida a otro, en el patio de la casa antigua', conselho: 'La memoria es buena compañía, no dirección: visítala sin mudarte allí.', conselhoInvertido: 'Idealizar el pasado está impidiendo que el presente tome color.' },
    7: { keywords: ['fantasía', 'ilusión', 'elecciones'], upright: 'Fantasías y opciones ilusorias vuelven confusas las elecciones.', reversed: 'Claridad sobre una elección real, con las ilusiones por fin deshechas.', cena: 'las siete copas en la nube, cada una con una visión distinta, y solo una con algo real dentro', conselho: 'De las siete visiones, una es real — elimina primero las opciones bonitas y vacías.', conselhoInvertido: 'La niebla se levantó: elige ahora, mientras todavía está claro.' },
    8: { keywords: ['abandono', 'búsqueda', 'propósito'], upright: 'Abandono de lo que ya no llena en busca de un propósito mayor.', reversed: 'Miedo a seguir adelante o estancamiento por comodidad.', cena: 'la figura de espaldas yéndose bajo la luna, dejando ocho copas apiladas con un hueco en el medio', conselho: 'Salir de lo que ya no alimenta es una pérdida voluntaria — y a veces es el camino.', conselhoInvertido: 'Quedarse por comodidad también es elección; nombra lo que te retiene.' },
    9: { keywords: ['satisfacción', 'deseo cumplido', 'contento'], upright: 'Satisfacción, contento y realización de un deseo importante.', reversed: 'Exceso, satisfacción superficial u orgullo vacío.', cena: 'el anfitrión satisfecho de brazos cruzados, con las nueve copas alineadas en la repisa detrás', conselho: 'El deseo se cumplió; fíjate si todavía era el deseo correcto.', conselhoInvertido: 'La satisfacción de vitrina no sostiene — pregúntate qué querías de verdad.' },
    10: { keywords: ['felicidad', 'familia', 'armonía'], upright: 'Felicidad familiar y armonía emocional plena y duradera.', reversed: 'Conflictos familiares o valores desalineados dentro del hogar.', cena: 'el arcoíris de diez copas sobre la pareja y los dos niños bailando', conselho: 'La armonía de la casa se cuida en el día común, no solo en la foto.', conselhoInvertido: 'Hay un desajuste de valores dentro de la casa; enfréntalo antes de que se vuelva rutina.' },
    11: { keywords: ['mensaje', 'intuición', 'creatividad'], upright: 'Mensajes intuitivos y creatividad emocional trayendo novedades afectivas.', reversed: 'Inmadurez emocional, decepción o bloqueo creativo.', cena: 'el joven que mira, sorprendido, el pez que apareció dentro de la copa', conselho: 'Un mensaje afectivo o creativo está surgiendo; dale espacio aunque todavía no lo entiendas.', conselhoInvertido: 'La inmadurez emocional está estorbando — tuya o suya; no te lo tomes todo personal.' },
    12: { keywords: ['romance', 'invitación', 'idealismo'], upright: 'Romanticismo, invitaciones y la disposición a seguir el corazón.', reversed: 'Humor inestable, promesas vacías o decepción romántica.', cena: 'el caballero avanzando despacio a la orilla del río, copa extendida al frente', conselho: 'La invitación es sincera; verifica si la propuesta acompaña al encanto.', conselhoInvertido: 'Una promesa bonita sin fecha es solo promesa — pide la fecha.' },
    13: { keywords: ['empatía', 'intuición', 'cuidado'], upright: 'Empatía, intuición aguda y cuidado emocional profundo con los demás.', reversed: 'Inseguridad emocional, dependencia o sensibilidad excesiva.', cena: 'la reina a la orilla del mar, absorta en la copa cerrada y ornamentada que solo ella ve por dentro', conselho: 'Tu lectura emocional está afilada; cuídate con el mismo cuidado que ofreces.', conselhoInvertido: 'Absorber el sentimiento de los demás se volvió peso — rehaz el contorno entre tú y ellos.' },
    14: { keywords: ['equilibrio emocional', 'sabiduría', 'madurez'], upright: 'Equilibrio emocional, sabiduría compasiva y madurez en los sentimientos.', reversed: 'Inestabilidad emocional, manipulación o frialdad afectiva.', cena: 'el rey en el trono en pleno mar agitado, sin mojarse', conselho: 'Sentir y decidir en el mismo gesto: la madurez aquí es no ahogarse ni congelarse.', conselhoInvertido: 'Frialdad o chantaje afectivo están en juego; verifica de qué lado están.' },
  },
  espadas: {
    1: { keywords: ['claridad', 'verdad', 'nueva idea'], upright: 'Claridad mental, verdad y una nueva idea poderosa surgiendo.', reversed: 'Confusión, información distorsionada o decisiones tomadas de forma precipitada.', cena: 'la mano en la nube alzando la espada, con la corona y el ramo colgando de la punta', conselho: 'La verdad está disponible y corta por los dos lados — úsala una vez, con precisión.', conselhoInvertido: 'La información está distorsionada; confirma en la fuente antes de actuar.' },
    2: { keywords: ['impasse', 'indecisión', 'equilibrio tenso'], upright: 'Impasse e indecisión frente a una decisión difícil.', reversed: 'Sobrecarga de información, decisión forzada o huida de la verdad.', cena: 'la mujer vendada, de espaldas al mar, equilibrando dos espadas cruzadas sobre el pecho', conselho: 'Quítate la venda antes de decidir: el impasse es falta de datos, no falta de coraje.', conselhoInvertido: 'La decisión está siendo forzada por el plazo; elige el criterio antes de elegir el lado.' },
    3: { keywords: ['dolor', 'traición', 'duelo emocional'], upright: 'Dolor emocional, traición y la sensación de un corazón roto.', reversed: 'Perdón y reconstrucción: el dolor cede poco a poco.', cena: 'las tres espadas atravesando el corazón, bajo la lluvia y el cielo cerrado', conselho: 'El dolor es real y nombrarlo es el trabajo de hoy — no corras a ponerlo en positivo.', conselhoInvertido: 'La recuperación comenzó, de a poco; no confundas cicatriz con herida abierta.' },
    4: { keywords: ['descanso', 'recuperación', 'pausa'], upright: 'Descanso y recuperación necesarios después de un período de esfuerzo.', reversed: 'Agotamiento, regreso forzado a la acción o pausa prolongada de más.', cena: 'el caballero acostado en piedra en la capilla, tres espadas en la pared y una bajo el cuerpo', conselho: 'Descansar aquí es parte de la estrategia; la batalla continúa después.', conselhoInvertido: 'O paras ahora, o el cuerpo para por ti.' },
    5: { keywords: ['conflicto', 'derrota', 'disputa'], upright: 'Conflicto y una victoria obtenida a costa de algo importante.', reversed: 'Reconciliación y disposición para dejar atrás los rencores.', cena: 'el vencedor recogiendo las espadas mientras los otros dos se alejan de espaldas', conselho: 'Revisa el precio de la victoria antes de celebrar — puede no valer lo que costó.', conselhoInvertido: 'Hay espacio para la reconciliación; alguien tiene que dar el primer paso y puedes ser tú.' },
    6: { keywords: ['transición', 'movimiento', 'dejar atrás'], upright: 'Transición y movimiento hacia aguas más tranquilas, dejando atrás las dificultades.', reversed: 'Resistencia al cambio o dificultad para seguir adelante.', cena: 'el barquero llevando a la mujer y al niño a la otra orilla, seis espadas clavadas en la proa', conselho: 'La travesía ya comenzó: lleva lo esencial y acepta que la orilla nueva es extraña al principio.', conselhoInvertido: 'Quieres ir y sigues amarrado — mira qué sigue atado en la otra orilla.' },
    7: { keywords: ['estrategia', 'engaño', 'acción furtiva'], upright: 'Estrategia y acción discreta, a veces con algún tipo de engaño.', reversed: 'Confesión, arrepentimiento o mentiras expuestas.', cena: 'la figura saliendo del campamento en puntas de pie con cinco espadas, dejando dos clavadas', conselho: 'La estrategia discreta puede ser legítima; si hay que esconderla de todos, no lo es.', conselhoInvertido: 'Es hora de confesar o devolver, antes de que aparezca por otra vía.' },
    8: { keywords: ['encierro', 'limitación', 'miedo'], upright: 'Sensación de encierro frente a límites que son, en verdad, autoimpuestos.', reversed: 'Liberación, nueva perspectiva y ruptura de patrones mentales limitantes.', cena: 'la mujer atada y vendada entre ocho espadas, con las cuerdas flojas y el suelo libre al frente', conselho: 'Las cuerdas están flojas y el suelo está libre: la prisión es más mental que real.', conselhoInvertido: 'Empezaste a ver la salida; da un paso pequeño y comprueba que sostiene.' },
    9: { keywords: ['ansiedad', 'angustia', 'pesadilla'], upright: 'Ansiedad, pesadillas y angustia mental que quitan el sueño.', reversed: 'La angustia va cediendo poco a poco, o una desesperación que sigue oculta.', cena: 'la figura sentada en la cama a oscuras, el rostro entre las manos, nueve espadas alineadas en la pared', conselho: 'El sufrimiento está más grande en la cabeza que en el hecho — revisa el hecho por la mañana, despierto.', conselhoInvertido: 'La angustia está cediendo, o está escondida; cuéntaselo a alguien y descubre cuál de las dos.' },
    10: { keywords: ['fin', 'colapso', 'punto más bajo'], upright: 'Un final doloroso, colapso y la sensación de haber tocado fondo.', reversed: 'Recuperación y firmeza para no repetir el mismo ciclo.', cena: 'la figura caída boca abajo con diez espadas en la espalda, y el cielo ya aclarando en el horizonte', conselho: 'El fondo del pozo tiene una ventaja: desde aquí solo se sube, y el día ya está aclarando.', conselhoInvertido: 'Sobreviviste — el cuidado ahora es no repetir el mismo guion por costumbre.' },
    11: { keywords: ['curiosidad', 'vigilancia', 'ideas'], upright: 'Curiosidad intelectual, vigilancia y nuevas ideas en formación.', reversed: 'Chismes, información equivocada o impulsividad verbal.', cena: 'el joven de pie en lo alto de la colina ventosa, espada en alto, mirando por encima del hombro', conselho: 'La curiosidad y la vigilancia son útiles; observar no es vigilar a todo el mundo.', conselhoInvertido: 'Chismes e información torcida están circulando: no repitas lo que no confirmaste.' },
    12: { keywords: ['acción rápida', 'ambición', 'impulsividad'], upright: 'Acción rápida y directa impulsada por ambición intelectual.', reversed: 'Impulsividad, imprudencia o agresividad en palabras y actos.', cena: 'el caballero a toda carrera contra el viento, espada apuntada al frente', conselho: 'La rapidez es la fuerza aquí; solo verifica si vas o huyes.', conselhoInvertido: 'La prisa se está volviendo atropello — relee antes de enviar.' },
    13: { keywords: ['claridad', 'honestidad', 'independencia'], upright: 'Claridad mental, honestidad directa e independencia intelectual.', reversed: 'Frialdad excesiva, crítica cortante o aislamiento emocional.', cena: 'la reina de perfil en el trono de nubes, espada en alto y la mano abierta en invitación', conselho: 'Habla con claridad y sin crueldad: la honestidad no necesita doler a propósito.', conselhoInvertido: 'La crítica está cortando a quien amas; pregunta de qué dolor viene.' },
    14: { keywords: ['autoridad', 'ética', 'intelecto'], upright: 'Autoridad intelectual, ética sólida y búsqueda de la verdad.', reversed: 'Manipulación mental, rigidez o abuso de poder.', cena: 'el rey de frente en el trono, espada levemente inclinada y la mirada atravesando a quien llega', conselho: 'Decide por el criterio y no por el humor — y escribe el criterio.', conselhoInvertido: 'Argumento usado como poder; si estás del lado fuerte, retrocede un paso.' },
  },
  ouros: {
    1: { keywords: ['oportunidad', 'prosperidad', 'nuevo proyecto material'], upright: 'Nueva oportunidad material y prosperidad en potencia manifestándose.', reversed: 'Oportunidad perdida o inestabilidad financiera.', cena: 'la mano en la nube sosteniendo el pentáculo sobre el jardín florido, con el arco de seto abriendo camino', conselho: 'Llegó una oportunidad material concreta; tómala como semilla, no como cosecha.', conselhoInvertido: 'O la oportunidad se escapó, o la base no estaba lista — verifica cuál de las dos.' },
    2: { keywords: ['equilibrio', 'adaptación', 'prioridades'], upright: 'Equilibrio entre prioridades y buena adaptación frente a los cambios.', reversed: 'Desorden financiero o sobrecarga de compromisos.', cena: 'el malabarista equilibrando dos pentáculos en la cinta en forma de ocho, con barcos en el mar agitado detrás', conselho: 'Equilibrar dos compromisos es posible hoy; un tercero derriba los dos.', conselhoInvertido: 'El malabarista se cansó: corta un compromiso en vez de acelerar.' },
    3: { keywords: ['colaboración', 'trabajo en equipo', 'reconocimiento'], upright: 'Trabajo en equipo, colaboración y reconocimiento profesional merecido.', reversed: 'Falta de cooperación o trabajo entregado con baja calidad.', cena: 'el artesano en el andamio explicando el trabajo al monje y al maestro de obras', conselho: 'El buen trabajo aquí es trabajo acordado — alinea lo que entrega cada uno.', conselhoInvertido: 'Faltó acordar antes de ejecutar; la falla es de coordinación, no de esfuerzo.' },
    4: { keywords: ['seguridad', 'control', 'apego material'], upright: 'Seguridad material, control y deseo de conservar lo ya conquistado.', reversed: 'Avaricia, miedo a perder o materialismo excesivo.', cena: 'la figura coronada aferrada a un pentáculo, uno en la cabeza y uno bajo cada pie, con la ciudad detrás', conselho: 'Guardar tiene sentido; agarrarlo todo con las dos manos es lo que impide recibir.', conselhoInvertido: 'O el miedo a perder se aflojó, o el control se apretó — verifica cuál de los dos.' },
    5: { keywords: ['dificultad', 'exclusión', 'pérdida financiera'], upright: 'Dificultad financiera y sensación de exclusión en un momento duro.', reversed: 'Recuperación financiera y fin de un período de escasez.', cena: 'los dos caminantes pasando por la nieve bajo el vitral encendido que no miran', conselho: 'Falta amparo y hay ayuda a pocos pasos, detrás del vitral encendido: pide.', conselhoInvertido: 'La escasez está pasando; acepta la ayuda que aparezca sin leerla como derrota.' },
    6: { keywords: ['generosidad', 'ayuda mutua', 'equilibrio'], upright: 'Generosidad y ayuda mutua crean equilibrio entre dar y recibir.', reversed: 'Deudas, dependencia o generosidad con segundas intenciones.', cena: 'el mercader pesando en la balanza y repartiendo monedas a dos mendigos arrodillados', conselho: 'Dar y recibir necesitan quedar claros — quien sostiene la balanza define los términos.', conselhoInvertido: 'Verifica si la generosidad tiene precio incluido, de un lado o del otro.' },
    7: { keywords: ['paciencia', 'evaluación', 'inversión'], upright: 'Paciencia para evaluar inversiones que todavía necesitan tiempo para florecer.', reversed: 'Impaciencia o esfuerzo que parece no traer recompensa.', cena: 'el labrador apoyado en la azada mirando los siete pentáculos en el arbusto que todavía no cosechó', conselho: 'La cosecha todavía no está lista; evaluar ahora es mejor que cosechar verde.', conselhoInvertido: 'Si el esfuerzo no rinde hace demasiado tiempo, el problema puede ser el cultivo, no la paciencia.' },
    8: { keywords: ['dedicación', 'aprendizaje', 'habilidad'], upright: 'Dedicación, aprendizaje constante y perfeccionamiento de una habilidad.', reversed: 'Perfeccionismo, trabajo sin propósito claro o estancamiento profesional.', cena: 'el artesano sentado cincelando el octavo pentáculo, con los ya listos colgados al lado', conselho: 'La repetición es el método aquí: la habilidad se construye haciendo de nuevo.', conselhoInvertido: 'Perfeccionismo o trabajo sin sentido — en ambos casos le falta destino a lo que haces.' },
    9: { keywords: ['independencia', 'autosuficiencia', 'logro'], upright: 'Independencia financiera, autosuficiencia y logros disfrutados con placer.', reversed: 'Dependencia financiera o inseguridad a pesar del éxito aparente.', cena: 'la mujer en su propio jardín de viñas, con el halcón encapuchado posado en la mano', conselho: 'Construiste tu propio jardín; disfrutarlo también es parte del trabajo.', conselhoInvertido: 'La independencia está más en la apariencia que en la cuenta; mira los números.' },
    10: { keywords: ['riqueza', 'legado', 'estabilidad'], upright: 'Riqueza duradera, legado familiar y estabilidad construida a largo plazo.', reversed: 'Inestabilidad financiera familiar o disputas en torno a una herencia.', cena: 'las tres generaciones bajo el arco de la ciudad, los perros a los pies del viejo y los diez pentáculos repartidos por la escena', conselho: 'Piensa a largo plazo y en quien viene después — el legado se construye en decisión conjunta.', conselhoInvertido: 'Hay disputa o inestabilidad en la base familiar; arregla el acuerdo, no a la persona.' },
    11: { keywords: ['oportunidad', 'estudio', 'practicidad'], upright: 'Nueva oportunidad de estudio o trabajo, con foco práctico en los próximos pasos.', reversed: 'Falta de planificación, procrastinación u oportunidades desperdiciadas.', cena: 'el joven en el campo sosteniendo el pentáculo frente a los ojos, completamente absorto', conselho: 'Un estudio o trabajo nuevo empieza despacio; toma el comienzo como aprendizaje.', conselhoInvertido: 'Planificar sin empezar es procrastinación con nombre bonito.' },
    12: { keywords: ['método', 'confiabilidad', 'constancia'], upright: 'Trabajo metódico, confiabilidad y esfuerzo constante rumbo al resultado.', reversed: 'Estancamiento, terquedad o rutina llevada al extremo.', cena: 'el caballero detenido en el campo arado, caballo pesado e inmóvil, pentáculo en la mano', conselho: 'Despacio y constante es literalmente la lectura: la constancia vence al brillo aquí.', conselhoInvertido: 'La rutina se volvió estancamiento; cambia una variable pequeña.' },
    13: { keywords: ['practicidad', 'cuidado', 'abundancia'], upright: 'Practicidad, cuidado material y emocional, y abundancia generosa.', reversed: 'Descuido de las finanzas o del propio autocuidado.', cena: 'la reina en el trono florido mirando el pentáculo en el regazo como quien cuida algo vivo', conselho: 'Cuidar lo concreto — cuerpo, casa, dinero — también es cuidado afectivo.', conselhoInvertido: 'Cuidaste de todo menos de ti; el autocuidado aquí es material, no motivacional.' },
    14: { keywords: ['éxito material', 'liderazgo', 'seguridad'], upright: 'Éxito material consolidado, liderazgo seguro y abundancia establecida.', reversed: 'Materialismo excesivo, rigidez financiera o autoritarismo.', cena: 'el rey en el trono de racimos de uva y cabezas de toro, con el castillo ya construido detrás', conselho: 'La base está construida; administra con generosidad en vez de acumular.', conselhoInvertido: 'Rigidez financiera o autoritarismo: ¿el recurso te sirve a ti, o al revés?' },
  },
};

// Títulos Golden Dawn consagrados em espanhol ("Señor de..."), decanatos com
// os nomes espanhóis de planetas e signos.
const SUIT_NAME = { paus: 'Bastos', copas: 'Copas', espadas: 'Espadas', ouros: 'Oros' };
const RANK_NAME = {
  1: 'As', 2: 'Dos', 3: 'Tres', 4: 'Cuatro', 5: 'Cinco', 6: 'Seis', 7: 'Siete',
  8: 'Ocho', 9: 'Nueve', 10: 'Diez', 11: 'Sota', 12: 'Caballero', 13: 'Reina', 14: 'Rey',
};
const SUIT_ELEMENT = { paus: 'Fuego', copas: 'Agua', espadas: 'Aire', ouros: 'Tierra' };
const SUIT_ELEMENT_ARTICLE = { paus: 'del', copas: 'del', espadas: 'del', ouros: 'de la' };
const COURT_ELEMENT = { 11: 'Tierra', 12: 'Aire', 13: 'Agua', 14: 'Fuego' };
const DECANS = {
  paus: {
    2: ['Marte en Aries', 'Señor del Dominio'],
    3: ['Sol en Aries', 'Señor de la Fuerza Establecida'],
    4: ['Venus en Aries', 'Señor de la Obra Perfecta'],
    5: ['Saturno en Leo', 'Señor de la Contienda'],
    6: ['Júpiter en Leo', 'Señor de la Victoria'],
    7: ['Marte en Leo', 'Señor del Valor'],
    8: ['Mercurio en Sagitario', 'Señor de la Rapidez'],
    9: ['Luna en Sagitario', 'Señor de la Gran Fuerza'],
    10: ['Saturno en Sagitario', 'Señor de la Opresión'],
  },
  copas: {
    2: ['Venus en Cáncer', 'Señor del Amor'],
    3: ['Mercurio en Cáncer', 'Señor de la Abundancia'],
    4: ['Luna en Cáncer', 'Señor del Placer Mezclado'],
    5: ['Marte en Escorpio', 'Señor de la Pérdida en el Placer'],
    6: ['Sol en Escorpio', 'Señor del Placer'],
    7: ['Venus en Escorpio', 'Señor del Éxito Ilusorio'],
    8: ['Saturno en Piscis', 'Señor del Éxito Abandonado'],
    9: ['Júpiter en Piscis', 'Señor de la Felicidad Material'],
    10: ['Marte en Piscis', 'Señor del Éxito Perfecto'],
  },
  espadas: {
    2: ['Luna en Libra', 'Señor de la Paz Restaurada'],
    3: ['Saturno en Libra', 'Señor de la Tristeza'],
    4: ['Júpiter en Libra', 'Señor del Descanso de la Contienda'],
    5: ['Venus en Acuario', 'Señor de la Derrota'],
    6: ['Mercurio en Acuario', 'Señor del Éxito Ganado'],
    7: ['Luna en Acuario', 'Señor del Esfuerzo Inestable'],
    8: ['Júpiter en Géminis', 'Señor de la Fuerza Reducida'],
    9: ['Marte en Géminis', 'Señor de la Desesperación y la Crueldad'],
    10: ['Sol en Géminis', 'Señor de la Ruina'],
  },
  ouros: {
    2: ['Júpiter en Capricornio', 'Señor del Cambio Armonioso'],
    3: ['Marte en Capricornio', 'Señor de las Obras Materiales'],
    4: ['Sol en Capricornio', 'Señor del Poder Terrenal'],
    5: ['Mercurio en Tauro', 'Señor de la Dificultad Material'],
    6: ['Luna en Tauro', 'Señor del Éxito Material'],
    7: ['Saturno en Tauro', 'Señor del Éxito No Cumplido'],
    8: ['Sol en Virgo', 'Señor de la Prudencia'],
    9: ['Venus en Virgo', 'Señor de la Ganancia Material'],
    10: ['Mercurio en Virgo', 'Señor de la Riqueza'],
  },
};

function astroFor(suitKey, number) {
  if (number === 1) return `raíz de las fuerzas ${SUIT_ELEMENT_ARTICLE[suitKey]} ${SUIT_ELEMENT[suitKey]}`;
  if (number >= 11) return `${COURT_ELEMENT[number]} de ${SUIT_ELEMENT[suitKey]}`;
  const entry = DECANS[suitKey]?.[number];
  return entry ? entry[0] : null;
}

function buildCards() {
  const cards = {};
  Object.keys(MAJORS).forEach((id) => {
    const m = MAJORS[id];
    cards[id] = {
      name: m.name,
      keywords: m.keywords,
      uprightMeaning: m.upright,
      reversedMeaning: m.reversed,
      cena: m.cena,
      conselho: m.conselho,
      conselhoInvertido: m.conselhoInvertido,
      astro: null,
      tituloGD: null,
    };
  });
  ['paus', 'copas', 'espadas', 'ouros'].forEach((suitKey) => {
    for (let n = 1; n <= 14; n += 1) {
      const m = MINORS[suitKey][n];
      const entry = DECANS[suitKey]?.[n];
      cards[`${suitKey}-${String(n).padStart(2, '0')}`] = {
        name: `${RANK_NAME[n]} de ${SUIT_NAME[suitKey]}`,
        keywords: m.keywords,
        uprightMeaning: m.upright,
        reversedMeaning: m.reversed,
        cena: m.cena,
        conselho: m.conselho,
        conselhoInvertido: m.conselhoInvertido,
        astro: astroFor(suitKey, n),
        tituloGD: entry ? entry[1] : null,
      };
    }
  });
  return cards;
}

const pack = {
  themeWord: { Amor: 'Amor', Carreira: 'Carrera', Dinheiro: 'Dinero', Energia: 'Energía', 'Saúde': 'Salud' },
  themeOpener: {
    Amor: 'En el amor',
    Carreira: 'En la carrera',
    Dinheiro: 'En las finanzas',
    Energia: 'En la energía',
    'Saúde': 'En la salud',
  },
  suitTerritory: {
    paus: {
      Amor: 'deseo e iniciativa',
      Carreira: 'ímpetu y proyecto',
      Dinheiro: 'dinero que solo se mueve con iniciativa',
      Energia: 'vigor — y cuánto de él ya se gastó',
      'Saúde': 'cuerpo en movimiento, entre vigor y agotamiento',
    },
    copas: {
      Amor: 'vínculo y lo que todavía no se volvió palabra',
      Carreira: 'clima y personas',
      Dinheiro: 'decisión movida por valor afectivo',
      Energia: 'estado emocional',
      'Saúde': 'estado emocional, que sostiene el resto',
    },
    espadas: {
      Amor: 'aquello que necesita decirse',
      Carreira: 'análisis, estrategia y la conversación difícil',
      Dinheiro: 'número mirado sin la historia alrededor',
      Energia: 'cabeza, y cuánto deja rodar al resto',
      'Saúde': 'sueño y pensamiento',
    },
    ouros: {
      Amor: 'sentimiento vuelto gesto concreto',
      Carreira: 'oficio, plazo y resultado que se ve',
      Dinheiro: 'materia, y aquí el palo juega de local',
      Energia: 'cuerpo físico y lo que aguanta',
      'Saúde': 'hábito y rutina que se sostienen en el tiempo',
    },
  },
  suitLabel: { paus: 'Bastos', copas: 'Copas', espadas: 'Espadas', ouros: 'Oros' },
  rankRole: {
    1: 'la raíz del elemento, todavía entera',
    2: 'el grado de la polaridad, con dos fuerzas mirándose antes de que pase nada',
    3: 'el grado en que el plan sale del plano y aparece en el mundo',
    4: 'el grado de la forma que ya empieza a pesar',
    5: 'el grado de la crisis, donde el equilibrio del elemento se pierde',
    6: 'el grado del restablecimiento después de la crisis',
    7: 'el grado de la prueba, que se pasa lejos del público',
    8: 'el grado del movimiento, cuando el asunto vuelve a andar',
    9: 'el grado de la culminación, con lo que tiene de solitario',
    10: 'el grado del límite, completitud que ya se volvió exceso',
    11: 'la figura que todavía aprende el elemento',
    12: 'la figura que lanza el elemento hacia fuera',
    13: 'la figura que sostiene el elemento por dentro',
    14: 'la figura que administra el elemento en el mundo',
  },
  rankGrades: {
    1: 'As — la raíz del elemento: potencial puro, todavía entero y sin gastar.',
    2: 'Dos — polaridad y elección: dos fuerzas mirándose antes de que pase nada.',
    3: 'Tres — primera manifestación: lo que era plan sale del plano y aparece en el mundo.',
    4: 'Cuatro — estabilidad y consolidación: ya tiene forma, y la forma ya empieza a pesar.',
    5: 'Cinco — crisis: el equilibrio del elemento se pierde. Es el mismo grado en cuatro elementos, por eso pelea en Bastos, duelo en Copas, derrota en Espadas y privación en Oros.',
    6: 'Seis — restablecimiento: el equilibrio volviendo después de la crisis del Cinco.',
    7: 'Siete — prueba: la fuerza se pone a prueba por dentro, lejos del público.',
    8: 'Ocho — movimiento: la energía vuelve a circular y el asunto anda.',
    9: 'Nueve — culminación: lo máximo que el elemento sostiene solo, con lo que eso tiene de solitario.',
    10: 'Diez — límite del ciclo: completitud que ya es exceso y pide cierre.',
    11: 'Sota — quien está APRENDIENDO el elemento: comienzo, curiosidad, todavía sin dominio.',
    12: 'Caballero — quien LANZA el elemento hacia fuera: movimiento, ímpetu, a veces exceso.',
    13: 'Reina — quien SOSTIENE el elemento por dentro: dominio por la vivencia.',
    14: 'Rey — quien ADMINISTRA el elemento en el mundo: dominio por el ejercicio de la autoridad.',
  },
  syClassPhrase: {
    'mãe': 'una de las tres madres',
    dupla: 'una de las siete dobles',
    simples: 'una de las doce simples',
  },
  elements: {
    ar: 'Aire', 'água': 'Agua', fogo: 'Fuego', terra: 'Tierra',
    'mercúrio': 'Mercurio', lua: 'la Luna', 'vênus': 'Venus', sol: 'el Sol',
    marte: 'Marte', 'júpiter': 'Júpiter', saturno: 'Saturno',
    'áries': 'Aries', touro: 'Tauro', 'gêmeos': 'Géminis', 'câncer': 'Cáncer',
    'leão': 'Leo', virgem: 'Virgo', libra: 'Libra', 'escorpião': 'Escorpio',
    'sagitário': 'Sagitario', 'capricórnio': 'Capricornio', 'aquário': 'Acuario', peixes: 'Piscis',
  },
  elementLow: { fogo: 'fuego', terra: 'tierra', ar: 'aire', 'água': 'agua' },
  frames: {
    abreSemEixo: '{tema}.',
    abre: '{tema} — {eixo}.',
    abreInvertida: '{tema} — {eixo} al revés.',
    cena: 'En la carta, {cena}.',
    eixoNome: 'el eje — {eixo} —',
    eixoNomeSemEixo: 'el eje',
    invertidaPassado: 'Ahí {eixoNome} ya estaba trabado. {significado}',
    invertidaFuturo: '{eixoNome} sigue trabado. {significado}. Vector, no hecho consumado.',
    invertidaPresente: '{eixoNome} está trabado. {significado}',
    diretaPassado: 'Raíz ya cumplida: {significado}. Es terreno, no noticia.',
    diretaFuturo: 'Sin cambiar la conducción: {significado}. Vector, no hecho consumado.',
    diretaPresente: '{significado}',
    diretaSemCasa: '{significado}',
    atributoFallback: 'el propio símbolo',
    maiorPassado: '{opener}: {nome}, arcano {numero}, letra {letra} en la tabla de la Golden Dawn.',
    maiorFuturo: '{opener}: {nome}, camino {caminho} del Árbol de la Vida, bajo {atributo} en la tabla de la Golden Dawn.',
    maiorPresente: '{opener}: {nome}, arcano {numero}, bajo {atributo} en la tabla de la Golden Dawn.',
    campo: '{opener}, {naipe} cubre {territorio}.',
    campoSemTerritorio: '{opener}, habla {naipe}.',
    asPassado: '{campo} El As es {astro}, y en ese punto el potencial estaba entero — según la tabla de la Golden Dawn.',
    asFuturo: '{campo} El As es {astro} — semilla, no cosecha (tabla de la Golden Dawn).',
    asPresente: '{campo} El As es {astro}, potencial todavía sin gastar — según la tabla de la Golden Dawn.',
    cortePassado: '{campo} Golden Dawn: {astro}, {papel}.',
    corteFuturo: '{campo} Golden Dawn: {astro} — quien conduce desde aquí.',
    cortePresente: '{campo} Golden Dawn: {astro} — {papel}.',
    numeradaPassado: '{campo} Golden Dawn: {astro}, {papel}.',
    numeradaFuturo: '{campo} Golden Dawn: {tituloGD}, {astro} — quien conduce desde aquí.',
    numeradaPresente: '{campo} Golden Dawn: {tituloGD}, {astro} — {papel}.',
    menorFallback: '{campo} Desde ahí habla esta carta, en la tabla de la Golden Dawn.',
    conselhoFuturo: 'Cambia el vector: {conselho}',
    conselhoPresente: '{conselho}',
  },
  waite: {
    titulo: 'Lo que A. E. Waite escribió en 1911 — la carta {orientacao} en su lista',
    orientacao: { direta: 'al derecho', invertida: 'invertida' },
    notas: {
      'major-00': 'En la lista de 1911 El Loco es eso — locura, no salto de fe. La app lee la IMAGEN de Pamela Colman Smith (el pie al borde del precipicio), que es la escuela contemporánea mayoritaria. Es una elección, y no es de Waite.',
      'major-03': 'Fíjate: en Waite la Emperatriz INVERTIDA es luz y verdad, y la derecha incluye "difficulty, doubt, ignorance". La idea de que la invertida es siempre la energía trabada es del siglo XX (Gray, Pollack, Greer), no de 1911.',
      'major-04': 'Otra invertida que en Waite es mejor que la derecha. La app usa la escuela contemporánea (bloqueo, exceso, interiorización) y dice que es contemporánea.',
      'major-09': 'Fíjate en los puntos suspensivos: esto es un FRAGMENTO de la lista derecha del Ermitaño, no la lista entera — la base registra que el significado derecho en Waite "incluye" estas cuatro palabras, junto a otras. La app se queda con la imagen, la linterna que ilumina un paso a la vez, y lo que no hace es fingir que la lista de 1911 es pura bondad y sabiduría.',
      'major-10': 'La Rueda invertida es POSITIVA en Waite. Es el ejemplo más limpio de que "invertida = opuesto" nunca fue su regla.',
      'major-13': '"La Muerte nunca significó muerte" es falso como afirmación histórica: la lista de 1911 abre exactamente así. Leer la carta como fin de forma y transformación es una elección ética del siglo XX — es la que hace esta app, y no vamos a fingir que es antigua.',
      'major-14': 'Una invertida que en Waite no es ni mejor ni peor — es LATERAL, sobre otro asunto. Una vez más: su inversión no es lo opuesto.',
      'major-16': 'Ocho sustantivos y punto. Este es el registro seco de la tradición, y por eso la app no endulza la Torre. Lo que la app NO hace es convertirlo en sentencia: la carta describe la naturaleza de lo que está en juego, no decreta el desenlace.',
      'major-17': 'El caso más chocante de la lista: la esperanza es la SEGUNDA lectura de Waite, presentada como "otra versión". La app se queda con la esperanza, que es la lectura moderna y la correcta para el producto, y nunca se la acredita al Pictorial Key.',
      'copas-05': 'El modelo de cómo se dice una carta dura sin mentir: nombra la pérdida entera, y lo que queda después es un HECHO DE LA IMAGEN (dos copas todavía en pie), no un consuelo de cajón.',
      'espadas-03': 'Es el FINAL de su entrada — de ahí los puntos suspensivos — y Waite termina el Tres de Espadas negándose a explicar, porque la imagen ya lo dijo. Es la licencia más antigua que tiene esta app para ser directa en vez de dar vueltas. Y no es casualidad que sea justo esta carta: en el Tres de Espadas es donde más se ve cuánto se inspiró Pamela Colman Smith en el Sola Busca, un mazo italiano de c. 1491 — su deuda visual más documentada.',
    },
  },
  dignidade: {
    intro: 'En esta mesa de tres, la carta del medio no se lee sola: las dos vecinas refuerzan o debilitan su fuerza, según el elemento de cada una — fuego, agua, aire o tierra. Aquí el medio es {nome}, de {elemento}, flanqueado por {vizinhas}. {veredito} Y no me lo estoy inventando: es la dignidad elemental, regla de la tríada del "Book T" (S. L. MacGregor Mathers, fines del siglo XIX, publicada por Regardie en 1937-1940).',
    vizinha: '{nome} ({elemento})',
    vizinhaForaDaRegra: '{nome} (carta de planeta — queda fuera de esta regla)',
    vizinhasConector: ' y ',
    vereditos: {
      duasContrarias: '{nome} sale mal dignificada: los dos lados son contrarios a su elemento, y la tradición dice que ahí pierde fuerza — el asunto del medio no encuentra apoyo en ninguna de las dos casas vecinas.',
      dividida: '{nome} queda dividida: un lado sostiene su elemento y el otro es contrario, así que su fuerza depende de cuál de las dos casas mires.',
      umaContraria: '{nome} sale debilitada por uno de los lados, sin nada del otro que lo compense.',
      duasIguais: '{nome} sale muy reforzada: los tres son del mismo elemento, y la regla vale para ambos lados — refuerza tanto lo bueno de la carta como lo duro.',
      fortalecida: '{nome} sale fortalecida: las dos vecinas son del mismo elemento o de elemento amigo, y la tradición lo lee como energía que corre sin obstáculo.',
      apoioDeUmLado: '{nome} recibe apoyo de un solo lado; el otro es pasivo, ni ayuda ni estorba.',
      passiva: '{nome} queda en terreno pasivo: ninguna vecina refuerza ni contraría su elemento.',
    },
  },
  spread: {
    grauRepetido: 'El mismo grado — el número de la carta — salió {qtd} veces en esta tirada. La lectura de conjunto pesa ese patrón más que cada carta aislada — práctica que se afirmó en el siglo XX. {grade}',
    maiores: '{qtd} Arcanos Mayores en {total} cartas: la lectura contemporánea lo toma como un asunto que no está del todo en tus manos — es telón de fondo, no detalle de rutina.',
    naipeDominante: 'Tirada dominada por {naipe}: el asunto entero está concentrado en ese territorio.',
    naipeDominanteLabel: {
      paus: 'Bastos (fuego — acción y deseo)',
      copas: 'Copas (agua — afecto y vínculo)',
      espadas: 'Espadas (aire — mente y verdad)',
      ouros: 'Oros (tierra — materia y cuerpo)',
    },
  },
  tradicaoNota: {
    astroComTitulo: '{tituloGD} ({astro})',
    letraComClasse: 'letra hebrea {letra}, {classe} del Sepher Yetzirah — el "Libro de la Formación", texto antiguo de la mística judía',
    letraSemClasse: 'letra hebrea {letra}',
    caminho: 'camino {caminho} del Árbol de la Vida, el mapa de la Cábala',
    separador: ' · ',
  },
  cards: buildCards(),
};

export default pack;
