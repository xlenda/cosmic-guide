// datos/bancos.es.js
// O ESPANHOL dos tres bancos do ano. Vizinho de datos/bancos.js, que continua
// sendo o PORTUGUES e a fonte do indice. Quem traduz para o ingles trabalha em
// datos/bancos.en.js. Tres arquivos disjuntos, zero conflito de merge.
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
// que divergissem a espanhola veria a pergunta de outro dia sem erro nenhum.
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
//    nenhuma linha. Nem aqui, nem em espanhol, nem "por baixo do pano".
//    O espanhol de nicho amoroso tem formula feita para isso ("volvera", "te va
//    a buscar", "lo recuperaras") e nenhuma dela entra.
// 2. AS CONTENCOES SAO CONVITE, NUNCA PROIBICAO. Nenhuma diz "no le escribas".
//    Todas dizem o que fazer PRIMERO — e "primero" pressupoe que mandar continua
//    sendo opcao dela. Sem consequencia descrita, e nunca o gesto como coisa que
//    produz efeito na outra pessoa (o eufemismo classico do nicho, "el silencio
//    hace milagros", e a promessa proibida dita pelo avesso).
// 3. AS AFIRMACOES SAO DELA SOBRE ELA. Primeira pessoa, PRESENTE. Nenhuma no
//    futuro ("algun dia voy a entender" e promessa com outra roupa), nenhuma
//    sobre a outra pessoa, nenhuma alegacao de saude.
// 4. NENHUMA PERGUNTA PEDE PREVISAO nem o que a outra pessoa pensa. "Este mes
//    no" continua sendo resposta legitima nas treze lunacoes.
// 5. NENHUM TEXTO PUNE FALTA.
//
// SEM FUTURO SINTETICO, e nao so por doutrina: lib/lectura.js:423
// (`hablaDelFuturo`) morde as terminacoes -ra/-ras/-ran em PT E ES, e o portao
// test/madremaria-promessa-tres-idiomas.js tem quatro formulas de promessa em
// espanhol montadas sobre elas. A voz da Madre e presente de indicativo; quando
// precisa de projecao, usa perifrase de QUEM LE ("lo que quieres que siga siendo
// verdad"), nunca futuro de terceira pessoa.
//
// ===========================================================================
// A VOZ — e ela que atravessa, nao as palavras
// ===========================================================================
// Fala com UMA pessoa, de tu, baixinho. Frases curtas, ela respira entre elas.
// Acolhe sem prometer. Nao julga a decisao de ninguem.
//
// O espanhol E o idioma original deste funil — a Onda 1 ja fixou o registro em
// datos/textos.es.js ("Tu hilo, hoy", "esa persona", "Las ganas tienen hora").
// As linhas daqui seguem esse mesmo tu informal e esse mesmo "esa persona": sem
// voseo, sem "usted", sem nomear o genero de quem esta do outro lado.
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

export const BANCOS_ES = Object.freeze({
  /* ===============================================================================
   * 1. REFLEXIONES — lo que ella responde por escrito.
   *
   * Las treinta del dia primero, en el mismo orden del portugues. El orden aqui no
   * manda en nada (el indice vive en datos/bancos.js), pero se conserva para que
   * una revision linea a linea sea posible contra el original.
   * ============================================================================ */

  /* --- las treinta del dia ---------------------------------------------------- */
  'hora-leve': '¿Cuál fue la hora más liviana de hoy, y qué estabas haciendo?',
  'comeu-sentada': '¿Qué comiste hoy, y comiste sentada?',
  'primeiro-pensamento': '¿Qué fue lo primero que pensaste al despertar hoy?',
  'som-conhecido': '¿Qué sonido de hoy reconocerías con los ojos cerrados?',
  'pediu-mais': '¿Qué te pidió hoy más de lo que esperabas?',
  'onde-pesou': '¿Dónde pesó más el cuerpo hoy: hombro, pecho, mandíbula, estómago?',
  'faria-de-qualquer-jeito': '¿Qué hiciste hoy que habrías hecho de todos modos, con esta historia o sin ella?',
  'vontade-de-rir': '¿Qué fue la cosa más tonta que te dio ganas de reír hoy?',
  'tela-sem-escolher': '¿Cuánto tiempo pasaste hoy mirando una pantalla sin haber elegido mirarla?',
  'adiou-hoje': '¿Qué dejaste para después hoy, y por qué?',
  'duas-horas-a-mais': 'Si hoy hubiera durado dos horas más, ¿qué habrías hecho con ellas?',
  'casa-do-jeito': '¿Qué parte de tu casa está como te gusta, y qué parte no?',
  'agradeceu-calada': '¿Qué agradeciste hoy sin decirlo en voz alta?',
  'conversa-que-somou': '¿Cuál conversación de hoy te dejó mejor que antes de ella?',
  'repetiu-a-semana': '¿Qué repetiste hoy que ya venías repitiendo toda la semana?',
  'hora-da-fome': '¿A qué hora tuviste más hambre hoy, y qué hiciste con eso?',
  'decisao-inteira': '¿Qué fue hoy decisión tuya, de principio a fin?',
  'cheiro-que-ficou': '¿Qué olor de hoy se quedó contigo?',
  'roupa-para-quem': '¿Qué ropa elegiste hoy, y para quién la elegiste?',
  'pela-metade': '¿Qué dejaste a medias hoy?',
  'hora-silenciosa': '¿Cuál fue la hora más silenciosa de tu día?',
  'aprendeu-hoje': '¿Qué aprendiste hoy que ayer no sabías, por pequeño que sea?',
  'dia-em-uma-frase': 'Si tuvieras que contar el día de hoy en una frase, ¿cuál sería?',
  'custou-sem-valer': '¿Qué te costó hoy dinero, tiempo o energía sin valer ninguno de los tres?',
  'gesto-de-cuidado': '¿Qué gesto pequeño de hoy fue solo cuidado contigo?',
  'nem-casa-nem-trabalho': '¿Dónde estuviste hoy que no era casa ni trabajo?',
  'esqueceu-das-horas': '¿Cuál fue el momento de hoy en que te olvidaste de la hora?',
  'ninguem-ia-saber': '¿Qué habrías hecho hoy si nadie fuera a saberlo?',
  'promessa-cumprida': '¿Qué promesa pequeña te hiciste esta semana, y cumpliste?',
  'tirou-do-lugar': '¿Qué te sacó de lugar hoy, y por cuánto tiempo?',

  /* --- el suelo: nombrar (1), la rutina (2), lo que ya era mio (3) ------------- */
  'por-onde-comecaria': 'Si contaras lo que pasó sin arreglar ninguna frase, ¿por dónde empezarías?',
  'palavra-usada': '¿Qué palabra has usado para nombrar esto, y es la palabra exacta?',
  'duas-versoes': '¿Cuál versión de esta historia cuentas a los demás, y cuál te cuentas a ti?',
  'data-marcada': '¿Qué fecha quedó marcada, y qué recuerdas de ella de verdad?',
  'frase-repetida-de-cabeca': '¿Qué frase dicha en aquel tiempo todavía repites de cabeza?',
  'titulo-da-historia': 'Si esta historia tuviera un título, ¿cuál sería hoy?',
  'uma-frase-sem-justificar': '¿Qué dirías que pasó, en una frase, sin justificar nada?',
  'comeco-do-dia': '¿Cómo empieza tu día ahora, desde el despertador hasta salir del cuarto?',
  'horario-que-mudou': '¿Qué hora de tu día cambió de forma en este tiempo?',
  'parou-sem-decidir': '¿Qué dejaste de hacer sin haber decidido dejarlo?',
  'semana-igual': '¿Qué parte de tu semana sigue exactamente igual?',
  'o-sono-mudou': '¿Qué cambió en tu sueño en este tiempo, si es que cambió?',
  'hora-so-sua': '¿Cuál es la hora de tu día que hoy es solo tuya?',
  'continua-seu': '¿Qué era tuyo antes y sigue siendo tuyo: un objeto, un lugar, una costumbre, una persona?',
  'ficou-de-lado': '¿Qué canción, libro o lugar quedó de lado en este tiempo?',
  'habilidade-intacta': '¿Cuál habilidad tuya nadie te quitó?',
  'sozinha-e-gostava': '¿Qué hacías sola y te gustaba, antes de todo esto?',

  /* --- el lazo: las ganas tienen hora (4), sé o supongo (5), mi parte (6) ------ */
  'hora-da-vontade': '¿A qué hora te apretaron hoy más las ganas de decir algo?',
  'antes-da-vontade': '¿Qué suele venir justo antes de esas ganas: hambre, cansancio, silencio, una foto?',
  'vontade-passou-sozinha': '¿Dónde estabas la última vez que esas ganas se pasaron solas?',
  'viu-ou-montou': '¿Qué sabes porque lo viste u oíste, y qué armaste de cabeza?',
  'sem-dado-novo': '¿Qué historia reconstruiste hoy sin tener ningún dato nuevo?',
  'qual-e-a-prova': 'Si alguien te pidiera la prueba de lo que supones, ¿qué le mostrarías?',
  'parte-sem-aumentar': '¿Cuál fue tu parte, dicha sin aumentarla?',
  'parte-sem-diminuir': '¿Cuál fue tu parte, dicha sin disminuirla?',
  'nao-era-seu-carregar': '¿Qué no era tuyo para cargar y lo cargaste igual?',
  'faria-de-novo': '¿Qué cosa hiciste ahí que harías de nuevo, sin ninguna vergüenza?',

  /* --- el ensanchamiento: otros hilos (7), rabia (8), lo que quiero (9) -------- */
  'apareceu-sem-chamar': '¿Quién apareció en tu semana sin que lo llamaras?',
  'conversa-que-nao-e-sobre-isso': '¿Cuánto hace que no hablas con alguien que quieres sobre cualquier otro tema?',
  'mesa-abandonada': '¿Cuál grupo, clase o mesa abandonaste y todavía existe?',
  'quem-te-procurou': '¿Quién te buscó este mes, y qué respondiste?',
  'raiva-nao-dita': '¿Qué quedó sin decir del lado de la rabia?',
  'frase-nunca-mandada': '¿Qué frase escribiste de cabeza unas diez veces y nunca mandaste?',
  'nao-concordo-mais': '¿Con qué exactamente ya no estás de acuerdo?',
  'quero-sem-citar': '¿Qué quieres, dicho sin nombrar a nadie?',
  'verdade-daqui-a-um-ano': '¿Qué quieres que siga siendo verdad sobre ti, pase lo que pase?',
  'desejo-sem-resposta': '¿Cuál deseo tuyo no depende de la respuesta de nadie?',

  /* --- la capacidad: confiar (10), lo que se dice (11), el año (12), la luna (13) */
  'confiar-em-quem-for': '¿Qué necesitarías para confiar de nuevo, en quien sea?',
  'sinal-de-seguranca': '¿Qué señal te hace sentir segura con cualquier persona: una amiga, tu jefa o tu vecina?',
  'tres-frases': '¿Qué dirías si tuvieras tres frases, y qué se queda siendo solo tuyo?',
  'mudou-de-tom': 'Leyendo lo que escribiste en los últimos meses, ¿qué cambió de tono?',
  'pergunta-que-abre': '¿Cuál pregunta quieres abrir ahora?',

  /* --- LAS EXCLUSIVAS: dos por lunación, ninguna cae en más de una ------------- */
  'nunca-escrita-em-lugar-nenhum': '¿Qué parte de esta historia no escribiste en ningún lado?',
  'sem-os-porques': 'Si le quitaras todos los porqués a lo que pasó, ¿qué quedaría de hecho?',
  'hora-identica-a-ontem': '¿Qué hora de tu día de hoy fue igualita a la de ayer, minuto a minuto?',
  'primeira-voz-do-dia': '¿Cuál es la primera hora de tu día en que le hablas a alguien en voz alta?',
  'guardado-numa-caixa': '¿Qué cosa tuya está guardada en una caja, en una carpeta o en un armario desde hace meses?',
  'gosto-que-parou-de-defender': '¿Cuál gusto tuyo dejaste de defender en una mesa?',
  'dia-da-semana-da-vontade': '¿Qué día de la semana suelen aparecer esas ganas más de una vez?',
  'horas-sem-a-vontade': '¿Qué parte del día de hoy pasó sin que las ganas aparecieran ni una vez?',
  'visto-com-os-proprios-olhos': '¿Cuál es la última cosa que sabes por haberla visto con tus propios ojos?',
  'suposicao-que-mudou-sozinha': '¿Qué suposición tuya cambió de forma en los últimos treinta días sin ningún dato nuevo?',
  'diferente-e-igual': '¿Qué harías distinto, y qué harías igual? Las dos cosas, en ese orden.',
  'nao-estava-na-sua-mao': '¿Qué parte de esto no estaba en tu mano de ninguna manera?',
  'quem-mora-mais-perto': '¿Quién de tu vida vive más cerca de ti, en kilómetros?',
  'aniversario-de-cabeca': '¿De quién es el último cumpleaños que recuerdas sin mirar el teléfono?',
  'regra-que-nao-se-abre-mao': '¿De qué regla tuya ya no cedes, pase lo que pase?',
  'irritaria-numa-pessoa-nova': '¿Qué te incomodaría hoy en una persona que acabas de conocer?',
  'cabe-num-sabado': '¿Qué cosa que quieres cabría en un sábado, sin depender de nadie más?',
  'quero-sem-custar-dinheiro': '¿Qué quieres que no cuesta ningún dinero?',
  'relaxa-os-ombros': '¿Qué actitud, venga de quien venga, te hace relajar los hombros?',
  'saber-de-antemao': '¿Qué necesitas saber de antemano para aceptar un plan con alguien?',
  'olho-no-olho-ou-papel': '¿Qué frase tuya dirías mirando a los ojos, y cuál solo cabría en el papel?',
  'limite-de-tres-palavras': '¿Qué dirías hoy en tres palabras, si tres fueran el límite?',
  'nao-lembrava-de-ter-escrito': '¿Cuál entrada tuya no recordabas haber escrito?',
  'releria-agora': '¿Cuál entrada antigua tuya releerías ahora, si pudieras elegir una?',
  'pergunta-que-fica-para-tras': '¿Cuál pregunta de esta vuelta ya no quieres cargar?',
  'daqui-a-treze-luas': '¿Qué pregunta te harías a ti misma dentro de trece lunas?',

  /* ===============================================================================
   * 2. AFIRMACIONES — frases DE ELLA sobre ELLA.
   *
   * Primera persona, PRESENTE, las cincuenta. Sin la otra persona, sin desenlace,
   * sin alegato de salud: derecho, elección y capacidad.
   * ============================================================================ */
  'sozinha-sem-perdida': 'Puedo estar sola sin estar perdida.',
  'sinto-e-sigo-dona': 'Siento lo que siento y sigo siendo dueña de mi día.',
  'meu-tempo': 'El tiempo que estoy tomando es mi tiempo.',
  'sem-explicacao': 'No le debo explicación a nadie por la forma en que atravieso esto.',
  'silencio-sem-abandono': 'Sé quedarme en silencio sin abandonarme.',
  'minha-parte-existe': 'Hoy cuido la parte que es mía, que es la parte que existe.',
  'mudar-de-ideia': 'Puedo cambiar de opinión sin traicionar a la que fui hasta aquí.',
  'calma-nao-guardada': 'Mi calma no está guardada con nadie más.',
  'minha-noite': 'Yo elijo qué hago con mi noche.',
  'nada-errado-em-mim': 'Nada en mí está mal porque esta historia no haya cerrado.',
  'mais-constante': 'Soy la persona más constante de mi vida.',
  'nao-estar-bem-com-respeito': 'Tengo derecho a no estar bien hoy y aun así tratarme con respeto.',
  'esperar-sem-parar': 'Puedo esperar sin quedarme quieta.',
  'dia-que-nao-depende': 'Mi día tiene cosas que no dependen de nadie.',
  'fiz-bem-no-que-deu-errado': 'Reconozco lo que hice bien, incluso dentro de lo que salió mal.',
  'devolvo-o-resto': 'Cargo mi parte y devuelvo el resto.',
  'nao-entender-tudo': 'No necesito entenderlo todo hoy para vivir el día de hoy.',
  'memoria-tambem-minha': 'Tengo buena memoria y ella también es mía.',
  'saudade-nao-manda': 'La falta cabe en mí sin mandar en mi semana.',
  'falo-como-com-amiga': 'Me hablo como le hablaría a una amiga.',
  'querer-sem-correr': 'Puedo querer una cosa y aun así no hacer nada al respecto hoy.',
  'moro-no-meu-corpo': 'Mi cuerpo es el lugar donde vivo, y cuido el lugar donde vivo.',
  'sei-o-que-nao-aceito': 'Sé lo que ya no acepto.',
  'ocupar-espaco': 'Tengo derecho a ocupar espacio en una conversación.',
  'escolho-quem-sabe': 'Yo elijo quién sabe de mis cosas.',
  'descanso-sem-merecer': 'Me permito descansar sin haberlo merecido primero.',
  'hoje-sem-desfecho': 'Puedo pasar por el día de hoy sin exigirme un desenlace.',
  'amizades-existem': 'Mis amistades existen, y puedo acercarme a ellas.',
  'nao-sou-meu-pior-dia': 'No soy el peor día que tuve.',
  'gostos-meus': 'Tengo gustos míos y no están en negociación.',
  'nao-e-ser-boa': 'Sé decir no y seguir siendo una buena persona.',
  'rotina-um-horario': 'Construyo mi rutina, una hora a la vez.',
  'raiva-sem-injustica': 'Puedo sentir rabia sin volverme una persona injusta.',
  'reparo-nas-pequenas': 'Me fijo en las cosas pequeñas y eso es una cualidad mía.',
  'paciencia-comigo': 'Me doy la paciencia que suelo darle a los demás.',
  'o-que-entra-antes-de-dormir': 'Yo elijo qué entra en mi cabeza antes de dormir.',
  'vida-acontecendo-agora': 'Tengo una vida que sigue pasando ahora.',
  'pedir-ajuda': 'Puedo pedir ayuda sin estar débil.',
  'confio-na-minha-leitura': 'Confío en mi lectura de las cosas.',
  'aprendizado-e-meu': 'Lo que aprendí en este tiempo es mío.',
  'valor-fora-do-amor': 'Tengo valor fuera de cualquier historia de amor.',
  'falar-ou-guardar': 'Yo decido cuándo hablar y cuándo guardar.',
  'pergunta-em-aberto': 'Puedo quedarme con una pregunta abierta.',
  'recomecar-pequeno': 'Soy capaz de empezar de nuevo una cosa pequeña hoy.',
  'sem-ser-exemplo': 'No necesito ser ejemplo de nada para nadie.',
  'falta-sem-agir': 'Tengo derecho a sentir falta y no hacer nada con eso.',
  'me-reconheco': 'Me miro al espejo y reconozco a quien está ahí.',
  'meu-passo': 'Camino a mi paso, y mi paso me sirve a mí.',
  'projetos-meus': 'Tengo proyectos que son solo míos.',
  'volto-para-mim': 'Vuelvo a mí cuando me pierdo de vista.',

  /* ===============================================================================
   * 3. CONTENCIONES — para el momento en que vengan las ganas de escribir.
   *
   * INVITACIÓN, nunca prohibición: ninguna dice "no lo mandes". Todas dicen qué
   * hacer PRIMERO, y "primero" deja mandar como opción suya. Reversibles, sin
   * consecuencia descrita, y en ninguna línea el gesto aparece como algo que
   * produzca efecto en la otra persona.
   *
   * La apertura es la misma en las treinta y una —"Si te vienen las ganas de
   * mandar"— igual que en el portugués: la fórmula repetida es el reconocimiento
   * del momento, y lo que varía es el gesto. El mismo `forma` del PT (escribir,
   * cuerpo, tiempo, lugar, voz, guardar, nombrar, cosa, contar) se conserva en la
   * variedad de los gestos, aunque la etiqueta viva solo en datos/bancos.js.
   * ============================================================================ */
  'escreve-aqui-primeiro': 'Si te vienen las ganas de mandar, escribe aquí primero. Lo que salga aquí se queda en este teléfono.',
  'inteira-depois-le': 'Si te vienen las ganas de mandar, escribe aquí, entero, lo que dirías, y léelo después de terminar. Sigue siendo tuyo, salga de aquí o no.',
  'marca-a-hora': 'Si te vienen las ganas de mandar, apunta la hora en un papel. Solo la hora. Después haces lo que quieras.',
  'copo-de-agua': 'Si te vienen las ganas de mandar, bebe un vaso de agua hasta el final antes de decidir.',
  'sai-do-comodo': 'Si te vienen las ganas de mandar, sal del cuarto en el que estás y vuelve. Las ganas vienen contigo o no vienen.',
  'frase-que-quer-ouvir': 'Si te vienen las ganas de mandar, escribe primero la frase que te gustaría escuchar. Después mira las dos.',
  'outra-mao': 'Si te vienen las ganas de mandar, pásate el teléfono a la otra mano por un minuto.',
  'o-que-quer-que-aconteca': 'Si te vienen las ganas de mandar, escribe aquí lo que te gustaría que pasara después. Se queda siendo tuyo.',
  'escada-ou-esquina': 'Si te vienen las ganas de mandar, baja y sube una escalera, o camina hasta la esquina y vuelve.',
  'le-em-voz-alta': 'Si te vienen las ganas de mandar, lee en voz alta lo que escribiste. Tu voz es la primera lectora.',
  'tres-frases-depois-uma': 'Si te vienen las ganas de mandar, escribe lo mismo en tres frases, y después en una.',
  'guarda-o-rascunho': 'Si te vienen las ganas de mandar, guarda el borrador aquí y apunta en un papel la hora de releerlo.',
  'cinco-minutos-antes': 'Si te vienen las ganas de mandar, escribe aquí qué estaba pasando cinco minutos antes de que llegaran las ganas.',
  'manda-para-voce': 'Si te vienen las ganas de mandar, mándatelo a ti misma primero, en otra aplicación, y léelo como si fuera de otra persona.',
  'musica-inteira': 'Si te vienen las ganas de mandar, elige una canción entera y escúchala hasta el final. Después vuelve aquí.',
  'palavra-que-travou': 'Si te vienen las ganas de mandar, escribe aquí en qué palabra te trabaste.',
  'dois-pes-no-chao': 'Si te vienen las ganas de mandar, siéntate y apoya los dos pies en el suelo hasta contar hasta sesenta.',
  'se-nao-tivesse-vindo': 'Si te vienen las ganas de mandar, escribe qué harías ahora si esas ganas no hubieran venido. Después elige una de las dos.',
  'janela-e-dez-respiracoes': 'Si te vienen las ganas de mandar, abre la ventana y mira hacia fuera mientras cuentas diez respiraciones.',
  'data-e-frase': 'Si te vienen las ganas de mandar, escribe aquí la fecha de hoy y la frase, solo eso. El registro es tuyo.',
  'agua-fria-no-rosto': 'Si te vienen las ganas de mandar, lávate la cara con agua fría y vuelve al teléfono.',
  'arruma-a-mesa': 'Si te vienen las ganas de mandar, ordena una cosa de tu mesa antes de escribir cualquier palabra.',
  'o-que-mandaria-ontem': 'Si te vienen las ganas de mandar, escribe aquí lo que habrías mandado ayer, si lo hubieras mandado.',
  'liga-para-alguem': 'Si te vienen las ganas de mandar, llama a alguien que quieres y habla de cualquier otro tema por cinco minutos.',
  'poe-um-titulo': 'Si te vienen las ganas de mandar, escribe aquí y ponle un título a la página. El título suele decir más que el texto.',
  'come-alguma-coisa': 'Si te vienen las ganas de mandar, camina hasta la cocina y come algo. El hambre y las ganas se parecen por dentro.',
  'ultima-frase-pela-metade': 'Si te vienen las ganas de mandar, escribe aquí y deja la última frase a medias. Vuelve a ella más tarde.',
  'foto-do-lugar': 'Si te vienen las ganas de mandar, saca una foto del lugar donde estás ahora. Es un registro de tu día.',
  'conta-os-eu': 'Si te vienen las ganas de mandar, escribe aquí y cuenta cuántas veces aparece la palabra "yo".',
  'dois-minutos-na-porta': 'Si te vienen las ganas de mandar, ponte un abrigo y quédate dos minutos en la puerta de tu casa.',
  'verdade-amanha-de-manha': 'Si te vienen las ganas de mandar, escribe aquí lo que te gustaría que siguiera siendo verdad cuando el día cambie.',
});

export default BANCOS_ES;
