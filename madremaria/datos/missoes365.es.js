// datos/missoes365.es.js
// ESPANHOL das missoes de datos/missoes365.js.
//
// LOTE 2 da Onda 2 — os capitulos degelo (55), carinho (58) e confianca (58):
// 171 missoes, 513 campos. Os outros capitulos (vocePrimeiro, vontade, voz,
// espelho, fds) entram aqui em outros lotes, cada um no seu bloco.
//
// ===========================================================================
// A CHAVE E 'capitulo:indice', E NAO O TITULO
// ===========================================================================
// O contrato esta em missoes365.js (bloco "OS TRES IDIOMAS"), e o motivo foi
// MEDIDO: dois titulos aparecem duas vezes no arquivo, em capitulos diferentes
// e com acao/porque diferentes — 'A carta que fica' (vocePrimeiro e espelho) e
// 'Deixa eu ver se entendi' (voz[27] e confianca[23], esta ultima deste lote).
// Com chave por titulo, a entrada de voz e a de confianca seriam a MESMA e o
// ultimo a escrever ganharia em silencio.
//
// O indice e a posicao no pool PT. A ORDEM DO POOL E LOAD-BEARING:
// lib/missaoDoDia.js escolhe por `diaAbsoluto(dia) % pool.length`. Inserir ou
// remover uma missao no meio do array desloca todas as chaves depois dela —
// quem mexer na ordem mexe nos tres arquivos na mesma passada.
//
// ===========================================================================
// AS REGRAS
// ===========================================================================
// 1. OS TRES CAMPOS: titulo, acao, porque. `precisaContato` NAO entra aqui —
//    e REGRA, nao texto. Quem decide se a missao sai para quem esta em contato
//    duro e lib/missaoDoDia.js lendo o PT, e missaoTraduzida() devolve o campo
//    PT intacto. A protecao e do campo, nao da frase: nenhuma traducao pode
//    enfraquece-la.
// 2. NADA VAZIO. '' nao cai no fallback: missaoTraduzida() usa `t.titulo ||
//    missao.titulo`, entao '' volta pro PT — mas ' ' (espaco) nao, e renderiza
//    em branco. Ou traduz, ou deixa a missao de fora.
// 3. NADA DE CHAVE TECNICA. id/clave/audio/fuente nao existem nestas missoes;
//    precisaContato e o unico campo nao-texto, e fica de fora.
//
// ===========================================================================
// ENCANTAMENTO HONESTO — VALE NOS TRES IDIOMAS
// ===========================================================================
// Doutrina em madremaria/theme.js:80: "nunca um desfecho, nunca uma promessa
// sobre o que a outra pessoa vai fazer". A missao e um GESTO de quem le; ela
// nunca diz o que a outra pessoa vai responder. Varias missoes deste lote
// terminam de proposito em "e para ai", "sem pergunta", "sem cobrar resposta" —
// isso E a doutrina no corpo do texto, e sobreviveu a traducao.
// Tudo aqui e varrido por test/madremaria-promessa-tres-idiomas.test.js, que
// descobre este arquivo pelo NOME (.es.js = es) sem ninguem registrar nada.
//
// ===========================================================================
// O QUE FOI ADAPTADO, E NAO TRADUZIDO AO PE DA LETRA
// ===========================================================================
// `[nome]` dentro do texto NAO e marcador de interpolacao: nenhum codigo o
// substitui (conferido em screens/PlanoScreen.js:1411-1414 e lib/missaoDoDia.js).
// E lacuna de prosa, para quem le preencher de cabeca. Entao ele VAI traduzido
// ('[nombre]', '[name]'), junto com [fato]/[sentimento]/[pedido]/[gesto exato].

export const MISSOES_ES = Object.freeze({
  /* ===== DEGELO (55) ===== */
  'degelo:0': { // Releitura em silêncio
    titulo: "Relectura en silencio",
    acao: "Abre las últimas conversaciones con esa persona y relee 5 minutos sin responder nada. Después cierra la aplicación y anota en un papel una sola frase: lo que notaste en tu propio tono.",
    porque: "Leer sin responder te entrena a observar antes de reaccionar. Lo que notas hoy en tu propio tono cambia la forma en que escribes de aquí en adelante.",
  },
  'degelo:1': { // Ensaio do limite
    titulo: "Ensayo del límite",
    acao: "Elige un límite que quieras mantener (por ejemplo: no responder de madrugada). Di la frase en voz alta 3 veces, frente al espejo, como si estuvieras hablando con esa persona.",
    porque: "Un límite ensayado sale con más firmeza en el momento real. Decirlo en voz alta saca la frase del terreno de la idea y la vuelve concreta.",
  },
  'degelo:2': { // Lista do que mudou
    titulo: "Lista de lo que cambió",
    acao: "Toma papel y lápiz y haz una lista de 5 cosas concretas que cambiaron en ti desde la separación. Solo vale lo que otra persona podría notar desde fuera.",
    porque: "El cambio real es el que aparece en el comportamiento, no en el discurso. Esa lista te muestra lo que ya está en pie — y lo que todavía es intención.",
  },
  'degelo:3': { // Carta que não se envia
    titulo: "Carta que no se envía",
    acao: "Escribe en un bloc de notas todo lo que tienes ganas de decirle a esa persona, sin filtro, hasta 10 minutos. Al terminar, no lo envíes: guarda el archivo en una carpeta o rompe el papel.",
    porque: "Lo que queda atrapado pide salida. Cuando lo vuelcas todo en un lugar seguro, queda menos presión a la hora de escribir el mensaje de verdad.",
  },
  'degelo:4': { // Mapa dos impulsos
    titulo: "Mapa de los impulsos",
    acao: "Anota los 3 momentos del día en que las ganas de escribir aprietan más (por ejemplo: el final de la noche). Al lado de cada uno, escribe una acción de recambio — algo simple que ocupe esos minutos.",
    porque: "Un impulso mapeado deja de mandar en ti. Saber la hora del apretón te permite elegir la respuesta en vez de actuar en automático.",
  },
  'degelo:5': { // Resposta de bolso
    titulo: "Respuesta de bolsillo",
    acao: "Escribe y guarda en tus notas una respuesta corta y amable, de hasta dos líneas, para usar si esa persona te escribe. Léela en voz alta y ajústala hasta que suene natural.",
    porque: "Tener una respuesta preparada evita decidir en el calor del momento. La calma construida con antelación es más fácil de sostener.",
  },
  'degelo:6': { // Teste do tom
    titulo: "Prueba del tono",
    acao: "Relee en voz alta los últimos 5 mensajes que le enviaste a esa persona. Marca los que suenan a reclamo y reescribe uno en versión liviana — solo para ti, sin enviarlo.",
    porque: "El tono aparece cuando el mensaje se vuelve sonido. Reescribir sin enviar es entrenamiento de escritura liviana, sin ningún riesgo.",
  },
  'degelo:7': { // Dez minutos de pausa
    titulo: "Diez minutos de pausa",
    acao: "La próxima vez que te den ganas de escribirle a esa persona, pon un temporizador de 10 minutos y escribe el mensaje en papel, no en el celular. Cuando suene, decide con calma si todavía tiene sentido.",
    porque: "La pausa separa el impulso de la elección. Mucho mensaje que parecía urgente pierde la urgencia en diez minutos.",
  },
  'degelo:8': { // Estoque de assuntos leves
    titulo: "Reserva de temas livianos",
    acao: "Haz una lista de 5 temas livianos que no tengan nada que ver con la relación: una serie, una receta, un lugar, una canción, una novedad. Guarda la lista en las notas del celular.",
    porque: "La conversación liviana necesita materia prima. Con la reserva hecha, no dependes de la inspiración del momento — ni caes en el tema pesado por falta de opción.",
  },
  'degelo:9': { // Três perguntas abertas
    titulo: "Tres preguntas abiertas",
    acao: "Escribe 3 preguntas abiertas sobre el día a día de esa persona — preguntas que no se contesten con sí o no. Elige la mejor y déjala aparte para el momento justo.",
    porque: "La pregunta abierta invita a hablar; la cerrada cierra. Prepararla antes te quita el peso de improvisar.",
  },
  'degelo:10': { // Duas colunas
    titulo: "Dos columnas",
    acao: "Divide un papel en dos columnas: de un lado, lo que depende de ti (tu tono, tu tiempo, tu palabra); del otro, lo que no depende (la respuesta de esa persona, el ritmo, el desenlace). Complétalo durante 5 minutos.",
    porque: "Poner cada cosa en la columna correcta ahorra energía. Actúas mejor en lo que es tuyo cuando dejas de cargar lo que no lo es.",
  },
  'degelo:11': { // Fecho do dia
    titulo: "Cierre del día",
    acao: "Antes de dormir, escribe una línea: una cosa que hiciste hoy por ti, sin relación con esa persona. Reléela en voz baja y cierra el cuaderno.",
    porque: "El acercamiento pesa menos cuando tu vida sigue teniendo dueña. Una línea por día registra que tu vida sigue pasando fuera de esta historia.",
  },
  'degelo:12': { // Plano para o frio
    titulo: "Plan para el frío",
    acao: "Escribe una frase de salida digna para usar si esa persona responde seca o tarda: algo como 'todo bien, lo dejo acá — buen descanso'. Ensáyala en voz alta una vez.",
    porque: "La frialdad pesa menos cuando ya decidiste cómo responder a ella. La frase preparada te protege de insistir por impulso.",
  },
  'degelo:13': { // Faxina de indiretas
    titulo: "Limpieza de indirectas",
    acao: "Abre tus propios perfiles y revisa tus últimas publicaciones durante 5 minutos. Si encuentras una indirecta, un desahogo o una provocación, bórralo o archívalo.",
    porque: "Lo que publicas también le habla a esa persona. Un perfil limpio de recados sostiene el mismo tono calmo de tus mensajes.",
  },
  'degelo:14': { // Uma frase gentil no post
    titulo: "Una frase amable en la publicación",
    acao: "Elige algo que esa persona publicó hace poco y reacciona con una sola frase amable sobre el contenido — por ejemplo: 'ese lugar se ve increíble'. Envíala y sal de la aplicación.",
    porque: "Un comentario liviano reabre el canal sin exigir nada a cambio. Salir de la aplicación después mantiene el gesto pequeño, del tamaño justo para este momento.",
  },
  'degelo:15': { // Resposta curta e calma
    titulo: "Respuesta corta y calma",
    acao: "Si hay un mensaje de esa persona sin responder, respóndelo ahora con calma: dos líneas como máximo, tono liviano, sin reclamo y sin pregunta pesada. Reléelo una vez antes de enviarlo.",
    porque: "Responder con serenidad muestra, en la práctica, lo que cambió en tu tono. Corto y amable es más fácil de sostener que largo e intenso.",
  },
  'degelo:16': { // Pergunta sobre o dia
    titulo: "Pregunta sobre el día",
    acao: "Envía una pregunta abierta y simple sobre el día de esa persona — por ejemplo: '¿cómo te fue hoy?'. Una sola pregunta, sin añadidos y sin apurar la respuesta.",
    porque: "El interés genuino por lo cotidiano es el escalón más liviano del acercamiento. Una pregunta por vez deja espacio para que esa persona venga a su propio ritmo.",
  },
  'degelo:17': { // Gratidão específica
    titulo: "Gratitud específica",
    acao: "Envía un agradecimiento por algo antiguo y específico que esa persona hizo — un consejo, una ayuda, una recomendación. Una sola frase, directa: 'me acordé de ese consejo que me diste sobre esto — gracias de verdad'. Sin enganchar otro tema.",
    porque: "La gratitud específica suena verdadera porque tiene dirección. Reconoce a esa persona sin abrir conversación sobre el pasado de ustedes.",
  },
  'degelo:18': { // Envio leve
    titulo: "Envío liviano",
    acao: "Mándale algo pequeño ligado a un interés de esa persona: un meme, una canción, una nota. Acompáñalo con una línea simple, tipo 'vi esto y me acordé de ti' — y nada más.",
    porque: "Compartir algo del interés de alguien dice 'te presto atención' sin necesidad de declarar nada. Y deja fácil responder — o no.",
  },
  'degelo:19': { // Elogio ao feito
    titulo: "Elogio a lo hecho",
    acao: "Elogia en una frase algo que esa persona hizo — un trabajo, un plato, un entrenamiento, un proyecto que apareció en el perfil. Habla de lo hecho, no del aspecto: 'quedó muy bueno ese proyecto tuyo'.",
    porque: "Elogiar lo que esa persona construye reconoce el esfuerzo, no solo la imagen — y abre conversación sobre un tema que le gusta.",
  },
  'degelo:20': { // Pedido de recomendação
    titulo: "Pedido de recomendación",
    acao: "Pídele a esa persona una recomendación en un tema que conoce bien — una película, un libro, un lugar. Una frase: '¿me recomiendas una película? confío en tu gusto'.",
    porque: "Pedir una opinión pone a esa persona en el lugar de quien tiene algo que ofrecer. Es un puente liviano: invita a conversar sin tocar ningún tema delicado.",
  },
  'degelo:21': { // Resposta ao story
    titulo: "Respuesta a la historia",
    acao: "Responde una historia de esa persona con un comentario corto y específico sobre lo que aparece en pantalla — la comida, el paisaje, la música. Una frase, sin pregunta pesada, y listo.",
    porque: "La historia es una invitación pública a comentar. Responder ahí es el gesto de menor peso posible: fácil de hacer, fácil de recibir.",
  },
  'degelo:22': { // Novidade em comum
    titulo: "Novedad en común",
    acao: "Envía una novedad neutra ligada a un gusto que ustedes comparten — 'salió la nueva temporada de esa serie', 'la banda anunció concierto'. Una línea informativa, sin pedir reacción.",
    porque: "El tema en común es territorio seguro: da de qué hablar sin tocar la relación. La información liviana no pide nada a cambio.",
  },
  'degelo:23': { // Pergunta sobre o projeto
    titulo: "Pregunta sobre el proyecto",
    acao: "Pregunta por algo que esa persona mencionó estar haciendo — un curso, una mudanza, un pasatiempo: '¿cómo va ese curso?'. Una pregunta, y espacio para que la respuesta llegue cuando llegue.",
    porque: "Acordarse de un detalle de lo cotidiano muestra atención real, sin tocar el pasado de ustedes. Preguntar por el presente es conversar con quien esa persona es hoy.",
  },
  'degelo:24': { // Leveza na resposta
    titulo: "Liviandad en la respuesta",
    acao: "Cuando esa persona te mande algo gracioso o liviano, responde en el mismo tono: una risa escrita, un comentario con humor, corto. Nada de aprovechar el impulso para sacar un tema serio.",
    porque: "Seguir el tono liviano muestra que conversar contigo es fácil. Reír juntos es una forma de cercanía que no exige una conversación grande.",
  },
  'degelo:25': { // Arqueologia da última conversa
    titulo: "Arqueología de la última conversación",
    acao: "Relee la última conversación de ustedes durante 5 minutos, sin responder nada. Anota una sola frase que hoy leerías con otros ojos.",
    porque: "Volver al registro real, y no a la versión del recuerdo, ayuda a reabrir el contacto desde lo que pasó — no desde lo que dolió.",
  },
  'degelo:26': { // Três versões da primeira frase
    titulo: "Tres versiones de la primera frase",
    acao: "Escribe 3 versiones del mensaje de reapertura. Descarta la que pide respuesta, descarta la que explica demasiado y quédate con la más liviana.",
    porque: "El primer mensaje del deshielo carga demasiado peso cuando reclama o se justifica. Elegir entre versiones le saca la decisión al impulso.",
  },
  'degelo:27': { // Filtro de expectativa
    titulo: "Filtro de expectativa",
    acao: "Pon 5 minutos de reloj y escribe todo lo que te gustaría escuchar de esa persona. Después tacha lo que es pedir demasiado para este momento.",
    porque: "Ver la expectativa en el papel separa lo que es deseo legítimo de lo que es prisa — y la prisa suele pesar en el primer contacto.",
  },
  'degelo:28': { // Ensaio da resposta seca
    titulo: "Ensayo de la respuesta seca",
    acao: "Di en voz alta, ahora, cómo responderías si la respuesta llega corta o tarda un día entero. Repítelo hasta que salga sin rabia en la voz.",
    porque: "Quien ensaya el escenario difícil no improvisa en el calor. Tu reacción a la primera respuesta dice más que el mensaje en sí.",
  },
  'degelo:29': { // Teto do dia
    titulo: "Techo del día",
    acao: "Escribe en un papel el número máximo de mensajes que te permites mandarle hoy a esa persona. Deja el papel a la vista sobre la mesa.",
    porque: "Un límite definido antes protege el deshielo del entusiasmo. El exceso de mensajes al principio suele volver a congelar lo que se estaba derritiendo.",
  },
  'degelo:30': { // Faxina de rascunhos
    titulo: "Limpieza de borradores",
    acao: "Busca en tus notas y borradores cualquier texto de reclamo o desahogo dirigido a esa persona. Bórralo definitivamente.",
    porque: "Un borrador pesado guardado es tentación en una noche difícil. Sin él cerca, el impulso encuentra menos municiones.",
  },
  'degelo:31': { // Pasta de pontes
    titulo: "Carpeta de puentes",
    acao: "Guarda en una carpeta del celular 2 o 3 memes, fotos o enlaces neutros que tengan la cara del humor de ustedes. Nada romántico entra en la carpeta.",
    porque: "Tener contenido liviano listo reduce la posibilidad de reabrir el contacto con un texto larguísimo. El puente se construye con material pequeño.",
  },
  'degelo:32': { // Três linhas de mudança
    titulo: "Tres líneas de cambio",
    acao: "Escribe en 3 líneas lo que cambió en ti desde la separación — con hechos concretos, no con 'yo cambié'. Por ejemplo: 'hoy espero antes de responder'.",
    porque: "Si la conversación llega a ese punto, una frase concreta suena verdadera. Un cambio descrito de forma genérica suena ensayado.",
  },
  'degelo:33': { // Simulação do pior cenário
    titulo: "Simulación del peor escenario",
    acao: "Escribe en 5 minutos qué harías con el resto del día si el mensaje queda en visto. Un plan real: qué cocinar, a quién llamar, qué ver.",
    porque: "El contacto sin plan B queda rehén de la respuesta. Con el día diseñado, el silencio pesa menos y no mandas el segundo mensaje por impulso.",
  },
  'degelo:34': { // Calendário do degelo
    titulo: "Calendario del deshielo",
    acao: "Marca en el calendario el día del primer contacto y bloquea el día siguiente como tu día de silencio, pase lo que pase.",
    porque: "El espacio programado entre un paso y otro da tiempo a que la otra parte sienta sus propias ganas — y te ahorra atropellar el proceso.",
  },
  'degelo:35': { // Estudo de tom
    titulo: "Estudio de tono",
    acao: "Relee durante 2 minutos una conversación buena y antigua de ustedes — no la de la pelea. Anota en una palabra el tono que funcionaba: broma, calma, curiosidad.",
    porque: "El deshielo reconoce el terreno por el tono. Retomar el clima de los tiempos buenos comunica familiaridad sin necesidad de hablar del pasado.",
  },
  'degelo:36': { // Lista do que não é agora
    titulo: "Lista de lo que no es ahora",
    acao: "Escribe 5 temas prohibidos en esta etapa: quién se equivocó, celos, rencor antiguo, promesas, la etiqueta de la relación. Fotografía la lista.",
    porque: "Saber lo que no hay que decir es la mitad de la conversación. La lista funciona como pasamanos cuando el intercambio se caliente y la lengua pique.",
  },
  'degelo:37': { // Teste do áudio-espelho
    titulo: "Prueba del audio espejo",
    acao: "Grábate un audio de 1 minuto leyendo tu frase de reapertura. Escúchalo y respóndete con sinceridad: ¿suena a invitación o suena a reclamo?",
    porque: "El texto engaña a su propio autor; la voz, no. Si suena a reclamo en tu oído, tiende a sonar peor todavía del otro lado.",
  },
  'degelo:38': { // Sinal de recuo
    titulo: "Señal de retroceso",
    acao: "Define por escrito qué respuesta — o qué ausencia — significa 'hago una pausa de una semana'. Por ejemplo: dos vistos seguidos sin contestación.",
    porque: "Un criterio definido con la cabeza fría protege tu dignidad cuando la emoción quiera insistir. Retroceder en el momento justo también es parte del deshielo.",
  },
  'degelo:39': { // Corte até caber em duas linhas
    titulo: "Recorta hasta que quepa en dos líneas",
    acao: "Toma el mensaje que piensas mandar y recorta palabras hasta que quepa en 2 líneas de pantalla, sin perder el sentido.",
    porque: "Un mensaje corto deja espacio para que la otra persona entre en la conversación. El texto larguísimo lo llena todo y no sobra lugar para responder.",
  },
  'degelo:40': { // Reação de um toque
    titulo: "Reacción de un toque",
    acao: "Reacciona a una historia o publicación de esa persona con un solo emoji que combine con el contenido. Sin mensaje adjunto. Cierra la aplicación enseguida.",
    porque: "Es la señal de presencia más pequeña posible: muestra que estás cerca sin exigir nada. La otra persona decide si lo convierte en conversación.",
  },
  'degelo:41': { // Ponte de uma linha
    titulo: "Puente de una línea",
    acao: "Manda un elemento de tu carpeta de puentes con una sola frase, sin pregunta. Por ejemplo: 'esto tiene tu cara'. Después deja el celular por 10 minutos.",
    porque: "El mensaje sin pregunta no reclama respuesta — y por eso es más fácil de responder. Dejar el celular te saca de la vigilia del visto.",
  },
  'degelo:42': { // Comentário sobre o conteúdo
    titulo: "Comentario sobre el contenido",
    acao: "Comenta algo que esa persona publicó hablando del contenido en sí — el lugar, la comida, la música. Nada sobre ustedes dos.",
    porque: "Hablar de la publicación y no de la relación mantiene el intercambio en suelo firme. La conversación liviana repetida suele pesar menos que la profundidad forzada.",
  },
  'degelo:43': { // Vi isso e lembrei
    titulo: "Vi esto y me acordé",
    acao: "Manda un enlace de tema neutro con el texto 'vi esto y me acordé de ti' — y nada más. Sin añadidos, sin segundo mensaje.",
    porque: "Decir que te acordaste es un hecho, no un pedido. Comunica presencia en tu cabeza sin poner ningún peso en la respuesta.",
  },
  'degelo:44': { // Uma pergunta, espera inteira
    titulo: "Una pregunta, la espera entera",
    acao: "Haz una sola pregunta abierta sobre la vida actual de esa persona y espera la respuesta sin mandar nada más — aunque tarde horas.",
    porque: "La pregunta única muestra interés; la espera muestra respeto por el tiempo de esa persona. Las dos cosas juntas dicen más que cualquier explicación.",
  },
  'degelo:45': { // Agradecimento fora de época
    titulo: "Agradecimiento fuera de tiempo",
    acao: "Agradece por algo pequeño y específico del pasado — 'ese consejo de película era bueno de verdad' — en una frase, sin sacar el tema de la relación.",
    porque: "La gratitud puntual y concreta reconoce el valor de la persona sin reabrir la herida. Es calor humano en una dosis que no asusta.",
  },
  'degelo:46': { // Espelho de ritmo
    titulo: "Espejo de ritmo",
    acao: "En el próximo intercambio, responde del mismo tamaño y en el mismo tiempo que el mensaje recibido: corto con corto, calmo con calmo.",
    porque: "Reflejar el ritmo comunica sintonía sin palabras. Responder tres párrafos a un 'jaja' entrega ansiedad y desequilibra la conversación.",
  },
  'degelo:47': { // Sair no ponto alto
    titulo: "Salir en el punto alto",
    acao: "Cuando la conversación esté en un momento bueno, ciérrala tú primero con una despedida liviana: 'me tengo que ir, me gustó esta charla'.",
    porque: "Terminar antes de agotar deja sabor a querer más en lugar de cansancio. El punto final liviano abre un camino natural para la próxima.",
  },
  'degelo:48': { // Janela do cotidiano
    titulo: "Ventana de lo cotidiano",
    acao: "Manda una foto simple de tu día — el café, el cielo, la calle — con una línea de contexto. Sin pregunta, sin pie de foto profundo.",
    porque: "Mostrar la rutina abre una ventana sin abrir la puerta de par en par. La otra persona ve tu vida siguiendo y elige si quiere mirar más de cerca.",
  },
  'degelo:49': { // Parabéns de uma frase
    titulo: "Felicitación de una frase",
    acao: "Si esa persona logró algo reciente — trabajo nuevo, un examen, un proyecto — felicítala con una sola frase específica. Y ahí para.",
    porque: "Celebrar el logro de esa persona sin enganchar conversación muestra generosidad sin segunda intención aparente. El 'ahí para' es lo que le da elegancia.",
  },
  'degelo:50': { // Convite de porta aberta
    titulo: "Invitación de puerta abierta",
    acao: "Propón algo con salida fácil: 'el sábado voy al café X como a las 10, aparece si te cuadra'. No preguntes después si va a venir.",
    porque: "Una invitación sin obligación de responder deja la decisión entera del otro lado. La presencia que nace de una elección vale más que la presencia por insistencia.",
  },
  'degelo:51': { // Faz sentido, antes do seu ponto
    titulo: "Tiene sentido, antes de tu punto",
    acao: "En la próxima conversación, cuando esa persona dé una opinión, responde primero 'tiene sentido' y solo después agrega tu mirada.",
    porque: "Validar antes de discrepar rompe el reflejo de debate que cargan las relaciones dañadas. Sentir que la propia opinión fue escuchada derrite hielo antiguo.",
  },
  'degelo:52': { // Gancho pra depois
    titulo: "Gancho para después",
    acao: "Al responder una pregunta de esa persona, cierra con un gancho liviano: 'después te cuento el resto de esa historia'. Y cúmplelo, días después.",
    porque: "Un gancho honesto crea continuidad sin forzar un encuentro. La conversación gana un capítulo siguiente sin que nadie tenga que pedirlo.",
  },
  'degelo:53': { // Logística como pretexto honesto
    titulo: "Logística como pretexto honesto",
    acao: "Si hay un objeto, un libro o una pertenencia por devolver, manda un mensaje práctico para acordarlo: día, lugar, cinco minutos.",
    porque: "La logística real da un motivo legítimo para un encuentro corto y sin expectativa. El contacto breve y concreto suele asustar menos que 'tenemos que hablar'.",
  },
  'degelo:54': { // Trinta segundos de voz
    titulo: "Treinta segundos de voz",
    acao: "Manda un audio de hasta 30 segundos, tono liviano, tema neutro — una historia graciosa de tu día. Cronométralo antes de enviarlo.",
    porque: "La voz carga un calor y una intención que el texto esconde. Treinta segundos muestran tu tono real sin ocupar el espacio de la otra persona.",
  },

  /* ===== CARINHO (58) ===== */
  'carinho:0': { // A casa que acolhe
    titulo: "La casa que acoge",
    acao: "Ordena durante 10 minutos la primera habitación que ve una visita al entrar: saca lo que está fuera de lugar, abre la ventana, deja una luz agradable.",
    porque: "Cuidar el espacio es practicar la acogida sin depender de que llegue nadie. Hoy tú vives en ese cuidado — y eso ya cambia tu día.",
  },
  'carinho:1': { // O gosto emprestado
    titulo: "El gusto prestado",
    acao: "Elige una canción, un plato o un tema que esa persona siempre quiso y pasa 10 minutos conociéndolo de verdad — sin contárselo a nadie.",
    porque: "Entender lo que encanta a esa persona amplía tu repertorio de cariño. Y el secreto mantiene el gesto puro: es atención, no moneda de cambio.",
  },
  'carinho:2': { // Presente de si
    titulo: "Regalo de ti para ti",
    acao: "Compra o aparta hoy un mimo pequeño para ti — un dulce, una flor, un café bien hecho — y recíbelo con atención, sin prisa, como un regalo de verdad.",
    porque: "Quien practica recibir cariño reconoce el cariño con más facilidad. Ese entrenamiento empieza dentro de casa.",
  },
  'carinho:3': { // A xícara reservada
    titulo: "La taza reservada",
    acao: "Aparta una taza o un lugar en la mesa pensando en esa persona y déjalo limpio y a la vista durante el día de hoy.",
    porque: "Reservar un espacio es un gesto silencioso de presencia. Cambia tu mirada sobre tu propia casa — y no le exige nada a nadie.",
  },
  'carinho:4': { // Dez minutos de aprendiz
    titulo: "Diez minutos de aprendiz",
    acao: "Practica durante 10 minutos algo que esa persona hace bien: una receta, un juego, unas palabras de otro idioma, un acorde en la guitarra.",
    porque: "La admiración que se vuelve práctica es más concreta que la admiración en el pensamiento. Te quedas con algo de esa persona en lo que aprendes.",
  },
  'carinho:5': { // Cheiro de casa cuidada
    titulo: "Olor a casa cuidada",
    acao: "Cambia la ropa de cama o pasa un paño con buen aroma en el ambiente donde pasas más tiempo.",
    porque: "La presencia también entra por los sentidos. Un ambiente cuidado te trata con el mismo cariño que quieres ofrecer.",
  },
  'carinho:6': { // Carta que fica na gaveta
    titulo: "Carta que se queda en el cajón",
    acao: "Escribe 5 líneas de cariño para esa persona y guárdalas sin enviarlas.",
    porque: "Nombrar el afecto organiza el afecto. Y guardarlo es entrenamiento de dar sin cobrar vuelto — el cariño más difícil y más limpio que existe.",
  },
  'carinho:7': { // O álbum de gestos
    titulo: "El álbum de gestos",
    acao: "Anota en papel 5 gestos pequeños que esa persona tuvo contigo — una nota, un aventón, un plato hecho.",
    porque: "Recordar el cariño recibido muestra lo que valoras y enseña el cariño que quieres devolver.",
  },
  'carinho:8': { // Mesa posta
    titulo: "Mesa puesta",
    acao: "Prepara una comida simple y sírvela con esmero: plato bonito, mesa limpia, celular lejos.",
    porque: "El esmero no necesita público. Servirte bien es ensayar el cuidado que quieres poner en el mundo.",
  },
  'carinho:9': { // Algo vivo na janela
    titulo: "Algo vivo en la ventana",
    acao: "Compra o corta una flor, o aparta un macetero pequeño, y ponlo en un lugar por donde pases todos los días.",
    porque: "Cuidar algo vivo es presencia en miniatura: un gesto diario, pequeño y real — exactamente la materia del cariño.",
  },
  'carinho:10': { // Inventário do acolhimento
    titulo: "Inventario de la acogida",
    acao: "Camina por la casa durante 5 minutos y anota: 3 cosas que ya hacen acogedor el espacio y 1 que merece atención esta semana.",
    porque: "Mirar la casa con ojos de quien recibe es una forma de prepararte por dentro, sin depender de ninguna visita agendada.",
  },
  'carinho:11': { // Presente de tempo
    titulo: "Regalo de tiempo",
    acao: "Reserva 10 minutos hoy para algo que te dé placer y no sirva para nada: hojear un libro, escuchar un disco entero con los ojos cerrados, mirar el cielo.",
    porque: "El cariño hacia ti también es tiempo, no solo cosas. Quien se da tiempo aprende el valor de la presencia — la tuya y la de cualquier persona.",
  },
  'carinho:12': { // A lembrança emoldurada
    titulo: "El recuerdo enmarcado",
    acao: "Elige una foto de un momento bueno de tu vida y ponla a la vista: fondo de pantalla, un marco, la puerta del refrigerador.",
    porque: "Volver a ver lo que ya fue bueno te recuerda una cosa simple: el cariño es algo que conoces y sabes vivir.",
  },
  'carinho:13': { // O doce favorito
    titulo: "El dulce favorito",
    acao: "En el próximo encuentro ya acordado, lleva el dulce o la bebida que esa persona más quiere. Entrégalo sin discurso: \"me acordé de ti\".",
    porque: "Un gesto pequeño de atención dice \"te veo\" mejor que cualquier declaración larga. El valor está en el recuerdo, no en el precio.",
  },
  'carinho:14': { // Elogio com endereço
    titulo: "Elogio con dirección",
    acao: "Dile o envíale un elogio específico y verdadero sobre algo que esa persona hizo — la manera de resolver un problema, el cuidado en un detalle. Nada genérico.",
    porque: "El elogio de detalle muestra atención real. Es distinto de adular: es ver — y todo el mundo nota la diferencia.",
  },
  'carinho:15': { // Memória boa, ponto final
    titulo: "Recuerdo bueno, punto final",
    acao: "Manda un mensaje corto compartiendo un recuerdo bueno: \"me acordé de aquel día en que nosotros...\". Termina sin pregunta y sin esperar respuesta.",
    porque: "Compartir sin cobrar es cariño sin anzuelo. El mensaje vale por lo que entrega, no por lo que vuelve.",
  },
  'carinho:16': { // Convite de dia claro
    titulo: "Invitación de día claro",
    acao: "Haz una invitación corta, simple y de día: \"¿te late un café el jueves por la tarde?\". Recibe cualquier respuesta con liviandad.",
    porque: "Una invitación liviana pide poco y ofrece presencia. Luz de día, hora fijada, cero drama — es el formato más amable de ofrecer compañía.",
  },
  'carinho:17': { // A pergunta que lembra
    titulo: "La pregunta que recuerda",
    acao: "En la próxima conversación, pregunta por algo que esa persona mencionó antes: \"¿cómo te fue en esa reunión?\", \"¿terminaste ese curso?\".",
    porque: "Recordar lo que se dijo es presencia en forma de pregunta. Muestra que la conversación anterior se quedó contigo.",
  },
  'carinho:18': { // A entrega certeira
    titulo: "La entrega certera",
    acao: "Entrega o envía algo pequeño ligado a un interés de esa persona: un libro prestado, una receta anotada, el enlace de una canción — con una sola línea de contexto.",
    porque: "El buen regalo no es el caro: es el que prueba que escuchas. Una línea de contexto alcanza; el resto se explica solo.",
  },
  'carinho:19': { // Obrigado com nome e data
    titulo: "Gracias con nombre y fecha",
    acao: "Agradece a esa persona por algo específico que hizo por ti en el pasado — reciente o antiguo — en una frase directa: \"eso me ayudó de verdad\".",
    porque: "La gratitud nombrada es cariño que no pide nada a cambio. Y lo que se dice en voz alta deja de pesar en silencio.",
  },
  'carinho:20': { // Foto do caminho
    titulo: "Foto del camino",
    acao: "Cuando algo de tu día te recuerde a esa persona — una vitrina, un plato, un cartel — fotografíalo y mándalo con una sola línea. Sin pregunta al final.",
    porque: "Es la manera más liviana de decir \"pasas por mis días\". Corto, verdadero y sin cobrar respuesta.",
  },
  'carinho:21': { // Presença inteira
    titulo: "Presencia entera",
    acao: "En el próximo encuentro acordado, llega 5 minutos antes y guarda el celular durante toda la conversación.",
    porque: "La atención entera por poco tiempo vale más que mucho tiempo a medias. La presencia es el cariño que no se puede fingir.",
  },
  'carinho:22': { // O bastidor gentil
    titulo: "El bastidor amable",
    acao: "Dile a esa persona una cosa buena que piensas en los días comunes y nunca dijiste en voz alta — una cualidad, un gesto que notas.",
    porque: "Mucha cosa buena muere en silencio por parecer obvia. Decirla en voz alta es sacar el cariño del depósito y ponerlo en circulación.",
  },
  'carinho:23': { // Ajuda miúda
    titulo: "Ayuda menuda",
    acao: "Ofrece una ayuda pequeña y concreta en algo que esa persona mencionó: \"¿quieres que te mande ese contacto?\", \"te puedo prestar el mío\".",
    porque: "La ayuda menuda es cariño en formato útil. No invade, no pesa — solo muestra que estabas escuchando.",
  },
  'carinho:24': { // Bom dia com detalhe
    titulo: "Buenos días con detalle",
    acao: "Manda un buenos días corto con el nombre de esa persona y un detalle real de tu día: \"buen día, [nombre] — en la panadería hicieron ese pan que te gusta\". Sin pregunta.",
    porque: "Un buenos días con detalle es distinto de un buenos días de sticker: tiene gente dentro. Y no le exige nada a quien lo recibe.",
  },
  'carinho:25': { // A despedida por inteiro
    titulo: "La despedida completa",
    acao: "Al final de la próxima conversación o encuentro, cambia el \"chao\" seco por una frase entera: \"qué bueno verte, cuídate\".",
    porque: "La despedida cuidada cierra el encuentro con el mismo cuidado con que empezó. Es un detalle — y el cariño vive en los detalles.",
  },
  'carinho:26': { // Elogio fora da relação
    titulo: "Elogio fuera de la relación",
    acao: "Elige a una amistad o a alguien de la familia y mándale ahora un mensaje elogiando algo específico que hizo: 'ese almuerzo estaba increíble', 'tu texto quedó buenísimo', 'la forma en que resolviste eso fue elegante'.",
    porque: "Elogiar de verdad es un músculo. Entrenarlo con quien está cerca vuelve el gesto más preciso — y menos cargado — cuando importa.",
  },
  'carinho:27': { // Inventário de gestos
    titulo: "Inventario de gestos",
    acao: "Toma papel y lápiz y haz una lista de 5 gestos pequeños de cariño que recibiste en la vida y recuerdas hasta hoy. Puede ser un plato hecho, una nota, alguien que te esperó.",
    porque: "Lo que quedó en tu memoria revela el tipo de gesto que suele marcarte. Es un mapa honesto de lo que sabes dar.",
  },
  'carinho:28': { // Nome de quem serve
    titulo: "El nombre de quien atiende",
    acao: "Hoy, agradece por su nombre a alguien que te atiende siempre — en la portería, en la panadería, en el mercado. Mira a la persona y di una frase entera: 'Gracias, [nombre]. Tu esmero se nota.'",
    porque: "La presencia empieza en ver a quien está delante de ti. Usar el nombre transforma una transacción en encuentro.",
  },
  'carinho:29': { // Flor no copo
    titulo: "Flor en el vaso",
    acao: "Toma una flor, una rama o una hoja bonita — del patio, de la calle, del mercado — y ponla en un vaso con agua en la mesa donde comes.",
    porque: "Cuidar tu propio espacio con un detalle vivo es cariño en versión silenciosa. Pasas a comer mirando algo que elegiste.",
  },
  'carinho:30': { // Releitura de elogio
    titulo: "Relectura de un elogio",
    acao: "Busca en el celular un mensaje antiguo en que alguien te elogió. Reléelo con calma y anota en una frase lo que ese elogio dice sobre tu manera de cuidar.",
    porque: "Un elogio guardado es espejo. Volver a ver lo que ya vieron en ti te recuerda el repertorio de cariño que ya tienes.",
  },
  'carinho:31': { // Três minutos de janela
    titulo: "Tres minutos de ventana",
    acao: "Quédate 3 minutos en una ventana o en la puerta de casa, sin celular, y anota 3 cosas de la vista en las que nunca te habías fijado.",
    porque: "La presencia es atención entrenada. Quien se fija en el detalle quieto de la calle se fija también en el detalle de quien ama.",
  },
  'carinho:32': { // Cuidar de algo vivo
    titulo: "Cuidar de algo vivo",
    acao: "Riega una planta y limpia las hojas con un paño húmedo, una por una. ¿No tienes plantas en casa? Dedica esos minutos a la mascota, o anota en la lista de compras un macetero pequeño.",
    porque: "El cariño constante se aprende en el cuidado repetido de algo que no habla. La planta no agradece — y justamente ese es el entrenamiento.",
  },
  'carinho:33': { // Primeiro carinho da memória
    titulo: "El primer cariño de la memoria",
    acao: "Escribe en 5 líneas el gesto de cariño más antiguo que recuerdas haber recibido. Describe el lugar, quién lo hizo y qué hizo.",
    porque: "Volver al origen del cariño muestra de dónde viene tu manera de dar y de recibir. Conocer la raíz también es preparación.",
  },
  'carinho:34': { // Bem feito, assinado
    titulo: "Bien hecho, firmado",
    acao: "Anota 3 cosas que hiciste en los últimos días y quedaron bien — de un correo difícil a un plato que salió rico. Al lado de cada una, escribe: 'bien hecho'.",
    porque: "Quien reconoce lo propio aprende a reconocer lo de los demás. El elogio empieza en casa.",
  },
  'carinho:35': { // Beleza repassada
    titulo: "Belleza reenviada",
    acao: "Elige una foto bonita que tomaste últimamente — un cielo, un plato, una esquina — y mándala a una amistad con una frase: 'vi esto y me acordé de ti'.",
    porque: "Compartir belleza es cariño de bajo costo y sin cobranza. Y mantiene viva tu red de afecto más allá de la relación.",
  },
  'carinho:36': { // Pausa para a pergunta
    titulo: "Pausa para la pregunta",
    acao: "En la próxima conversación de mostrador de hoy — panadería, portería, caja — detén lo que estés haciendo, guarda el celular y haz una pregunta real sobre el día de quien te atiende.",
    porque: "La presencia se mide en el cuerpo: parar, mirar, preguntar. Ensayarlo en encuentros pequeños prepara para los grandes.",
  },
  'carinho:37': { // Meu jeito de dar carinho
    titulo: "Mi manera de dar cariño",
    acao: "Haz una lista de 5 formas en que demuestras cuidado naturalmente — cocinar, escuchar, resolver, regalar, tocar, escribir. Encierra en un círculo la más fuerte y la que menos usas.",
    porque: "Conocer tu propio repertorio evita dar solo lo que te resulta fácil. El buen cariño también considera cómo recibe el otro lado.",
  },
  'carinho:38': { // Objeto em destaque
    titulo: "Objeto destacado",
    acao: "Elige un objeto tuyo que cargue un recuerdo bueno — un regalo, un souvenir de viaje — y ponlo en un lugar visible de la casa, limpio y ordenado.",
    porque: "Dar lugar de honor a lo que tiene historia es practicar el aprecio. Quien honra un recuerdo bueno cultiva la mirada que valora.",
  },
  'carinho:39': { // Áudio para você
    titulo: "Audio para ti",
    acao: "Grábate un audio de 1 minuto hablando en el tono que usarías con una gran amistad: reconoce lo que viene pesado y di una frase amable sobre cómo has ido lidiando con todo.",
    porque: "El tono que usas contigo se filtra en el tono que usas con los demás. La amabilidad hacia dentro es ensayo de la amabilidad hacia fuera.",
  },
  'carinho:40': { // Elogio ao ofício
    titulo: "Elogio al oficio",
    acao: "Observa unos minutos a alguien trabajando con las manos — en la panadería, en el mercado, en un arreglo — y elogia un detalle específico del oficio: 'ese punto de la masa quedó perfecto'.",
    porque: "Elogiar lo hecho exige mirar antes de hablar. Es la misma mirada que percibe el esfuerzo de quien amas.",
  },
  'carinho:41': { // Elogio ao feito, sem anzol
    titulo: "Elogio a lo hecho, sin anzuelo",
    acao: "Manda un mensaje elogiando algo que esa persona hizo hace poco — un trabajo, una comida, una decisión. Nombra el detalle y termina sin pregunta: nada de '¿y?'.",
    porque: "El elogio a lo hecho habla de lo que esa persona construyó, no de la relación. Sin pregunta al final, es un regalo — no una carnada.",
  },
  'carinho:42': { // Foto sem pergunta
    titulo: "Foto sin pregunta",
    acao: "¿Viste hoy algo que te recordó a esa persona — un plato, un lugar, una vitrina? Manda la foto con una frase liviana: 'esto tiene tu cara'. Y ahí para, sin quedarte mirando la respuesta.",
    porque: "Mostrar que esa persona pasó por tu pensamiento es presencia. No cobrar respuesta es respeto. Las dos cosas juntas, una rareza.",
  },
  'carinho:43': { // Convite com hora de acabar
    titulo: "Invitación con hora de terminar",
    acao: "Haz una invitación corta con principio y fin: '¿café mañana, de 16:00 a 16:30?'. Di el lugar y deja claro que media hora alcanza.",
    porque: "Una invitación con límite es fácil de aceptar y liviana de rechazar. Ofreces un encuentro, no un compromiso sin fondo.",
  },
  'carinho:44': { // A pergunta do detalhe
    titulo: "La pregunta del detalle",
    acao: "¿Recuerdas algo que esa persona mencionó — una entrevista, un examen, una consulta de la mascota, un partido? Pregunta hoy cómo fue, nombrando el detalle.",
    porque: "Recordar lo que importa a quien amas es la prueba silenciosa de haber escuchado. No hace falta discurso: la memoria habla.",
  },
  'carinho:45': { // Cumprimento de corpo presente
    titulo: "Saludo con el cuerpo presente",
    acao: "En el próximo encuentro, saluda con atención entera: detente, mira, di 'qué bueno verte' y, si entre ustedes tiene sentido, un abrazo breve. Sin celular en la mano.",
    porque: "El primer minuto de un encuentro le da el tono al resto. El cuerpo presente comunica lo que ninguna palabra alcanza.",
  },
  'carinho:46': { // Gratidão com data
    titulo: "Gratitud con fecha",
    acao: "Manda un mensaje agradeciendo por algo específico del pasado: 'me acordé de cuando hiciste aquello por mí. Nunca lo olvidé. Gracias.'",
    porque: "La gratitud por un hecho antiguo no pide nada del presente. Es de los pocos mensajes que solo entregan, sin cobrar nada de vuelta.",
  },
  'carinho:47': { // Ajuda de escopo fechado
    titulo: "Ayuda de alcance cerrado",
    acao: "Ofrece una ayuda concreta, pequeña y con final: 'puedo revisar tu texto', 'te presto mi taladro', 'te paso a buscar a las 18:00'. Una sola oferta, bien específica.",
    porque: "La ayuda vaga ('cualquier cosa me llamas') no se mueve de su lugar. Una oferta con alcance muestra cuidado real y respeta el espacio de decir no.",
  },
  'carinho:48': { // Correio de interesse
    titulo: "Correo de interés",
    acao: "Encuentra un enlace, un video o un artículo sobre un tema que esa persona ama — y que ni hace falta que sea el tuyo — y envíalo con una frase: 'vi esto y me acordé de tu lado fan de esto'.",
    porque: "Guardar en la memoria los intereses de alguien es una forma de decir 'presto atención a quien eres', sin tener que decirlo.",
  },
  'carinho:49': { // Convite de tarefa comum
    titulo: "Invitación de tarea común",
    acao: "Invita a esa persona a una tarea banal y corta: 'voy a la panadería a las 9, ¿te late ir?'. Veinte minutos, sin guion, sin mesa formal.",
    porque: "Un encuentro sin ceremonia le quita el peso al 'tenemos que hablar'. Lado a lado, caminando, la conversación encuentra camino — o el silencio se vuelve cómodo.",
  },
  'carinho:50': { // O esforço que ninguém vê
    titulo: "El esfuerzo que nadie ve",
    acao: "Reconoce, por mensaje o en persona, algo que esa persona hace siempre y casi nadie nota: 'nunca olvidas el cumpleaños de nadie', 'en tu casa uno se siente muy bien recibido'.",
    porque: "El reconocimiento de lo invisible es raro. Ese elogio dice: 'veo el trabajo, no solo el resultado'.",
  },
  'carinho:51': { // Presença no dia D
    titulo: "Presencia en el día D",
    acao: "¿Esa persona tiene algo importante cerca — una presentación, un examen, una mudanza? Ese día, manda una sola línea: 'hoy es el día, ¿no? Te mando toda la fuerza desde acá.'",
    porque: "Aparecer en el momento justo vale más que mil palabras en el momento equivocado. Una línea en el día correcto muestra que la agenda de esa persona vive en tu cabeza.",
  },
  'carinho:52': { // Devolução com bilhete
    titulo: "Devolución con nota",
    acao: "¿Tienes algo prestado de esa persona? Devuélvelo hoy o acuerda la entrega — limpio, completo, con una nota corta de agradecimiento.",
    porque: "Devolver bien es un gesto de respeto que habla de confianza. La nota transforma una obligación en cariño.",
  },
  'carinho:53': { // Pedir o olhar
    titulo: "Pedir la mirada",
    acao: "Pide la opinión de esa persona sobre un tema que domina: '¿entre estos dos, cuál elegirías?'. Manda la foto o el contexto y agradece la respuesta, sea cual sea.",
    porque: "Pedir una opinión dice 'valoro tu mirada' sin tener que declarar nada. Y abre conversación en un terreno donde esa persona pisa firme.",
  },
  'carinho:54': { // Áudio de 30 segundos
    titulo: "Audio de 30 segundos",
    acao: "Graba un audio corto — 30 segundos como máximo — contando una cosa buena de tu día y deseando una buena semana. Sin pregunta al final.",
    porque: "La voz carga una temperatura que el texto no tiene. Corto y sin pregunta, es un mimo que no exige nada a cambio.",
  },
  'carinho:55': { // Elogio na hora, ao vivo
    titulo: "Elogio en el momento, en vivo",
    acao: "En el próximo encuentro, nota algo hecho en voz alta, en el momento: 'esto quedó buenísimo', 'buena elección este lugar'. Una frase específica, dicha ahí mismo, mirando a esa persona.",
    porque: "El elogio en vivo, en el instante de lo hecho, tiene un peso que ningún mensaje reproduce. Exige solo atención — y es la atención la que comunica.",
  },
  'carinho:56': { // Convite de duas portas
    titulo: "Invitación de dos puertas",
    acao: "Ofrece una invitación con doble opción: 'café o helado, tú eliges — ¿media horita esta semana?'. Dos opciones simples, la decisión del otro lado.",
    porque: "Dar la elección reparte el control del encuentro. Se vuelve más fácil decir sí — y, si llega un no, responde al plan, no a ti.",
  },
  'carinho:57': { // Agrado de bolso
    titulo: "Mimo de bolsillo",
    acao: "En el próximo encuentro, lleva un mimo pequeño ligado a un gusto de esa persona: el pan preferido, una fruta, un caramelo de la infancia. Costo de vuelto, elección de atención.",
    porque: "El valor no está en el objeto, está en la prueba de que guardas los gustos de quien te importa. Pequeño lo suficiente para no incomodar.",
  },

  /* ===== CONFIANCA (58) ===== */
  'confianca:0': { // A promessa da semana
    titulo: "La promesa de la semana",
    acao: "Escribe en un papel una promesa pequeña que te haces esta semana — algo de pocos minutos al día — y pega el papel donde lo mires todos los días.",
    porque: "Confiar en alguien se vuelve más fácil cuando tu propia palabra tiene peso para ti. Eso empieza en promesas que caben en tu día.",
  },
  'confianca:1': { // O balanço honesto
    titulo: "El balance honesto",
    acao: "Toma una promesa que te hiciste en los últimos tiempos y escribe, sin suavizar: la cumplí, la cumplí en parte o no la cumplí — y qué se interpuso.",
    porque: "Mirar de frente tu propia palabra, sin drama y sin excusa, es el entrenamiento de honestidad más directo que existe.",
  },
  'confianca:2': { // Reler os limites
    titulo: "Releer los límites",
    acao: "Relee ahora los límites que escribiste en las lunas anteriores y marca, uno por uno: este se mantuvo, este tambaleó, este se cayó.",
    porque: "Un límite escrito y nunca revisado se vuelve decoración. Releer muestra lo que todavía es verdad para ti hoy.",
  },
  'confianca:3': { // Um limite reescrito
    titulo: "Un límite reescrito",
    acao: "Elige un límite que cambió desde que lo escribiste y reescríbelo en una frase clara, en presente, tal como es hoy.",
    porque: "Cambiaste a lo largo de estas lunas. Un límite actualizado protege a quien eres ahora, no a quien eras hace meses.",
  },
  'confianca:4': { // A âncora diária
    titulo: "El ancla diaria",
    acao: "Elige un gesto mínimo para repetir todos los días a la misma hora — hacer la cama, una caminata corta, escribir tres líneas — y hazlo por primera vez ahora.",
    porque: "Una rutina pequeña y cumplida es el cimiento silencioso de la confianza: cada repetición te muestra que puedes contar contigo.",
  },
  'confianca:5': { // O diário da palavra
    titulo: "El diario de la palabra",
    acao: "Anota tres momentos de esta semana en que hiciste exactamente lo que habías dicho que harías — para ti o para alguien.",
    porque: "Memorizamos los propios tropiezos y olvidamos los aciertos. Registrar lo que cumpliste equilibra la balanza con hechos.",
  },
  'confianca:6': { // A promessa quebrada
    titulo: "La promesa quebrada",
    acao: "Identifica una promesa que te hiciste y no cumpliste. Escribe qué la volvió difícil y un ajuste concreto para intentarlo de nuevo en versión más pequeña.",
    porque: "Una promesa quebrada no pide autocastigo, pide rediseño. Reducir el tamaño hasta que quepa en la vida es madurez, no debilidad.",
  },
  'confianca:7': { // O horário que é seu
    titulo: "El horario que es tuyo",
    acao: "Define un horario fijo del día que sea solo tuyo — diez minutos bastan — y crea ahora la alarma en el celular con un nombre que te lo recuerde.",
    porque: "Quien guarda un espacio para sí sostiene mejor los espacios que comparte. La alarma transforma la intención en compromiso.",
  },
  'confianca:8': { // Inventário de confiança
    titulo: "Inventario de confianza",
    acao: "Haz una lista de tres actitudes tuyas que construyen confianza a tu alrededor y una que la corroe. Al lado de la que corroe, escribe el paso más pequeño para reducirla.",
    porque: "La confianza no es un rasgo, es un conjunto de hábitos. Nombrar los tuyos deja visible dónde actuar.",
  },
  'confianca:9': { // Os cinco minutos devidos
    titulo: "Los cinco minutos debidos",
    acao: "Toma esa tarea que postergas desde hace días y trabaja en ella cinco minutos cronometrados. Solo cinco. Después para, si quieres.",
    porque: "Cada postergación le cobra un impuesto a la confianza que tienes en ti. Cinco minutos pagados ahora te reabren el crédito contigo.",
  },
  'confianca:10': { // Três linhas adiante
    titulo: "Tres líneas adelante",
    acao: "Escribe tres líneas para tu versión de dentro de un mes: qué quieres encontrar en pie cuando pase ese mes.",
    porque: "Escribirle a quien quieres llegar a ser transforma el deseo vago en dirección. Y tres líneas caben en cualquier día.",
  },
  'confianca:11': { // Cinco minutos de silêncio
    titulo: "Cinco minutos de silencio",
    acao: "Siéntate en un lugar tranquilo, deja el celular lejos y quédate cinco minutos en silencio, solo notando lo que aparece cuando nadie te pide nada.",
    porque: "En el ruido repetimos la opinión de los demás. En el silencio se alcanza a escuchar lo que sientes de verdad sobre este lugar nuevo.",
  },
  'confianca:12': { // O mapa do que sustenta
    titulo: "El mapa de lo que te sostiene",
    acao: "Escribe una lista de lo que te sostiene cuando la relación tambalea: personas, lugares, hábitos, proyectos. Guárdala donde la puedas encontrar después.",
    porque: "Quien tiene suelo propio conversa sobre temas difíciles con menos miedo, porque no tiene la vida entera apostada en una sola mesa.",
  },
  'confianca:13': { // Na hora combinada
    titulo: "A la hora acordada",
    acao: "Acuerda con esa persona un horario exacto para una llamada o un encuentro — y cúmplelo al minuto, ni demasiado antes, ni después.",
    porque: "La puntualidad es la forma más simple de decir 'tu espera me importa' sin usar palabras grandes.",
  },
  'confianca:14': { // Aviso dado, aviso cumprido
    titulo: "Aviso dado, aviso cumplido",
    acao: "Hoy, dile a esa persona que avisarás cuando llegues, salgas o termines algo — y manda el aviso en el momento exacto en que pase.",
    porque: "Un aviso pequeño cumplido vale más que diez declaraciones. La constancia se mide en gestos de ese tamaño.",
  },
  'confianca:15': { // Fato, sentimento, pedido
    titulo: "Hecho, sentimiento, pedido",
    acao: "Elige un tema delicado y háblalo con esa persona usando tres frases: 'Cuando pasó [hecho], yo sentí [sentimiento]. Quería pedirte [pedido claro].'",
    porque: "Esa estructura quita la acusación del frente y te pone entera en la conversación: lo que pasó, lo que dolió, lo que ayuda.",
  },
  'confianca:16': { // O erro com nome e sobrenome
    titulo: "El error con nombre y apellido",
    acao: "Admite ante esa persona un error específico tuyo, en tres frases como máximo, sin 'pero' y sin contexto que lo suavice: lo que hiciste, lo que causó, y punto.",
    porque: "La justificación diluye la disculpa hasta que casi no queda nada. Un error asumido por completo es raro — y por eso pesa.",
  },
  'confianca:17': { // Prometido, entregue
    titulo: "Prometido, entregado",
    acao: "Prométele a esa persona algo pequeño y concreto — una foto, una canción, una receta, un enlace — y entrégalo dentro de diez minutos.",
    porque: "El ciclo prometer-cumplir, incluso en miniatura, es el ladrillo básico de la confianza. Cuanto más corto el ciclo, más visible el ladrillo.",
  },
  'confianca:18': { // Resposta clara
    titulo: "Respuesta clara",
    acao: "Toma un mensaje o una invitación de esa persona que quedó sin respuesta definida y contesta ahora con un sí, un no o una fecha concreta.",
    porque: "Dejarlo en el aire parece educado, pero cobra intereses: quien espera llena el silencio con la peor versión.",
  },
  'confianca:19': { // O combinado da semana
    titulo: "El acuerdo de la semana",
    acao: "Propón a esa persona un acuerdo simple y pequeño para los próximos siete días — un mensaje de buenas noches, un café agendado — y dejen el acuerdo por escrito.",
    porque: "Un acuerdo explícito saca la relación del terreno de la adivinanza. Los dos lados saben qué esperar — y qué entregar.",
  },
  'confianca:20': { // Fechar o assunto aberto
    titulo: "Cerrar el tema abierto",
    acao: "Retoma con esa persona una conversación que quedó a medias: 'Ese tema quedó abierto. Tengo diez minutos ahora, ¿lo terminamos?'",
    porque: "Un tema interrumpido no desaparece, fermenta. Cerrar la conversación devuelve el suelo a los dos lados.",
  },
  'confianca:21': { // Cinco minutos de escuta
    titulo: "Cinco minutos de escucha",
    acao: "Pregúntale a esa persona cómo le fue el día — y escucha cinco minutos sin corregir, sin completar frases y sin llevar el tema hacia ti.",
    porque: "La escucha sin disputa es de las cosas más raras que alguien recibe. Quien escucha así crea un lugar donde se puede decir la verdad.",
  },
  'confianca:22': { // O aviso antes do atraso
    titulo: "El aviso antes del retraso",
    acao: "Si algo acordado con esa persona cambió o puede retrasarse, avisa ahora, en el momento en que ya lo sabes — no a última hora.",
    porque: "El retraso incomoda; la sorpresa del retraso corroe. Avisar temprano transforma un problema en información.",
  },
  'confianca:23': { // Deixa eu ver se entendi
    titulo: "Déjame ver si entendí",
    acao: "En la próxima conversación con esa persona, antes de responder algo importante, repite con tus palabras lo que escuchaste: 'Déjame ver si entendí: me estás diciendo que...'",
    porque: "Muchas peleas nacen de una respuesta dada a algo que nadie dijo. Confirmar antes cuesta diez segundos y ahorra horas.",
  },
  'confianca:24': { // Nomear a constância
    titulo: "Nombrar la constancia",
    acao: "Dile a esa persona, de forma específica, una cosa que hizo tal como lo había acordado: 'Noté que [gesto exacto]. Eso contó para mí.'",
    porque: "La constancia que nadie nota tiende a marchitarse. Lo que se ve y se nombra gana motivo para repetirse.",
  },
  'confianca:25': { // Perguntar em vez de presumir
    titulo: "Preguntar en vez de presumir",
    acao: "Toma una suposición que hiciste sobre esa persona en los últimos días y conviértela en pregunta directa: 'Preferí preguntar en vez de adivinar: ...?'",
    porque: "La suposición silenciosa se vuelve sentencia sin juicio. Preguntar le da a esa persona la oportunidad de existir fuera de tu imaginación.",
  },
  'confianca:26': { // Promessa de cinco minutos
    titulo: "Promesa de cinco minutos",
    acao: "Elige una promesa antigua que te hiciste — algo postergado desde hace semanas — y cumple ahora una versión de 5 minutos: el primer párrafo, el primer cajón, la primera llamada de la lista.",
    porque: "La confianza en ti se construye cumpliendo lo que acordaste contigo. Una versión pequeña, hecha hoy, vale más que la versión perfecta que sigue solo en la cabeza.",
  },
  'confianca:27': { // Inventário da palavra
    titulo: "Inventario de la palabra",
    acao: "Anota los compromisos que asumiste en los últimos 7 días — con cualquier persona o contigo. Marca al lado de cada uno: cumplí, me retrasé o lo dejé caer. Sin juicio, solo el retrato.",
    porque: "Nadie mejora lo que no ve. Ver en el papel la distancia entre lo que prometes y lo que entregas es el primer paso de cualquier cambio real.",
  },
  'confianca:28': { // Cancelamento honesto
    titulo: "Cancelación honesta",
    acao: "¿Hay un compromiso que, en el fondo, ya sabes que no vas a poder cumplir? Avisa ahora a quien depende de eso, con antelación y sin excusa elaborada: 'no voy a poder, prefiero avisar ya'.",
    porque: "Cancelar con antelación es palabra cumplida de otra manera: cuando no se puede, el aviso honesto preserva lo que la desaparición destruye.",
  },
  'confianca:29': { // Hora de sair, não hora de chegar
    titulo: "Hora de salir, no hora de llegar",
    acao: "Toma tu próximo compromiso con hora fijada. Calcula hacia atrás: el traslado + 10 minutos de holgura. Crea ahora la alarma con el nombre 'salir para...'.",
    porque: "El retraso rara vez es falta de respeto — es una cuenta mal hecha. Quien programa la salida, y no la llegada, saca la puntualidad del campo de la intención y la pone en el del método.",
  },
  'confianca:30': { // Cronômetro contra o otimismo
    titulo: "Cronómetro contra el optimismo",
    acao: "Cronometra hoy cuánto tardas en algo que siempre subestimas: cerrar la computadora y salir, el trayecto al mercado, arreglarte para salir de casa. Anota el número real.",
    porque: "Prometer un horario basado en una estimación optimista es quebrar la palabra en cámara lenta. El número real en el papel cambia las promesas que haces de aquí en adelante.",
  },
  'confianca:31': { // Uma pendência riscada
    titulo: "Un pendiente tachado",
    acao: "Abre tu lista de pendientes (o hazla ahora) y ejecuta el ítem más rápido de todos — ese de menos de 10 minutos que vienes empujando desde hace días. Táchalo con ganas.",
    porque: "Cada pendiente antiguo susurrando en el fondo de la mente corroe la confianza que tienes en tu palabra. Tachar uno, hoy, es evidencia concreta contra ese susurro.",
  },
  'confianca:32': { // Prometi, cumpri
    titulo: "Prometí, cumplí",
    acao: "Crea una nota en el celular llamada 'Prometí → Cumplí'. Registra hoy la primera línea: una promesa pequeña, con plazo hasta mañana, que dependa solo de ti.",
    porque: "La constancia no se declara, se registra. Una lista corta de promesas cumplidas se vuelve un historial que consultas en los días en que dudas de ti.",
  },
  'confianca:33': { // O erro em uma frase
    titulo: "El error en una frase",
    acao: "Escribe un error reciente tuyo en una sola frase: solo el hecho, sin 'pero', sin contexto, sin culpar a la circunstancia. Ejemplo: 'llegué 40 minutos tarde el jueves y no avisé'.",
    porque: "Admitir un error es una habilidad que se entrena, y la parte más difícil es quitar el 'pero'. Practicar en papel, sin público, prepara la admisión que algún día sale en voz alta.",
  },
  'confianca:34': { // Renegociar antes de falhar
    titulo: "Renegociar antes de fallar",
    acao: "Mira tu agenda de los próximos 3 días. Encuentra el compromiso que aceptaste sin querer aceptar. Renegócialo ahora: propón otra fecha o cancélalo con claridad.",
    porque: "Una agenda llena de compromisos aceptados por educación es una fábrica de palabra quebrada. Renegociar temprano es elegir decepcionar en pequeño ahora en vez de decepcionar en grande después.",
  },
  'confianca:35': { // Devolução agendada
    titulo: "Devolución agendada",
    acao: "Acuérdate de algo prestado que tienes contigo — un objeto, un libro, algo de dinero. Sepáralo ahora y define el día y la hora de la devolución, anotándolo en la agenda.",
    porque: "Una cosa prestada y detenida es una promesa silenciosa acumulando intereses. Separarla y agendarla transforma una deuda vaga en un acuerdo con fecha.",
  },
  'confianca:36': { // Âncora de três noites
    titulo: "Ancla de tres noches",
    acao: "Elige un microcompromiso fijo para las próximas 3 noches — revisar la agenda del día siguiente a las 21:00, por ejemplo. Configura el recordatorio ahora, a la misma hora los 3 días.",
    porque: "La constancia se entrena en lo pequeño y lo repetido. Tres noches seguidas cumpliendo el mismo acuerdo minúsculo muestran en la práctica el sabor que tiene la regularidad.",
  },
  'confianca:37': { // A resposta que você deve
    titulo: "La respuesta que debes",
    acao: "Busca un mensaje — de trabajo, de amistad, de familia — que prometiste responder y no respondiste. Responde ahora, empezando por asumirlo: 'me tardé, fue mi falla'.",
    porque: "La palabra cumplida también vive en las respuestas. Asumir la demora en vez de fingir que no existió cierra el pendiente de una manera que el silencio nunca cierra.",
  },
  'confianca:38': { // Ensaio da desculpa limpa
    titulo: "Ensayo de la disculpa limpia",
    acao: "Elige una disculpa que le debes a alguien y ensáyala en voz alta, en este formato: lo que hice + el efecto que causó + nada de 'pero'. Dos repeticiones alcanzan.",
    porque: "Una disculpa con 'pero' devuelve la culpa a quien escucha. Ensayar la versión limpia, sin público, le quita la improvisación al momento en que tenga que decirse.",
  },
  'confianca:39': { // O não que protege o sim
    titulo: "El no que protege al sí",
    acao: "Identifica un pedido reciente que quieres rechazar y escribe la negativa en dos frases: 'no puedo asumir esto ahora' + una alternativa honesta, si existe. Envíala o deja el mensaje guardado para enviar.",
    porque: "Cada sí dado sin respaldo le roba valor a todos los otros que dices. Quien rechaza con claridad promete menos — y quiebra menos.",
  },
  'confianca:40': { // Ritual de véspera
    titulo: "Ritual de la víspera",
    acao: "Prepara ahora lo que exige el compromiso de mañana: aparta la carpeta, el documento, la ropa, la dirección en el mapa. Deja todo en un único lugar visible.",
    porque: "La mitad de los retrasos nace en la mañana apurada, buscando las llaves. La víspera preparada es la puntualidad empezando doce horas antes del reloj.",
  },
  'confianca:41': { // Palavra da semana
    titulo: "Palabra de la semana",
    acao: "Elige UN solo acuerdo contigo para los próximos 7 días — pequeño, medible, casi diario. Escríbelo en un papel y pégalo donde lo mires todos los días.",
    porque: "Diez metas se vuelven ninguna. Un solo acuerdo, visible y pequeño, cabe en la vida real — y cumplirlo por una semana enseña más sobre constancia que cualquier plan grande.",
  },
  'confianca:42': { // Chego às...
    titulo: "Llego a las...",
    acao: "Si hay un encuentro agendado con esa persona, manda ahora un mensaje con el horario exacto: 'llego a las 19:00'. Después, crea la alarma de salida que sostiene ese horario.",
    porque: "Decir un horario específico, y no 'llego más tarde', transforma la intención en un compromiso verificable. Y la alarma eres tú tratando tu palabra como algo serio.",
  },
  'confianca:43': { // Um erro, nomeado
    titulo: "Un error, nombrado",
    acao: "Manda a esa persona un mensaje admitiendo UN error específico tuyo — con situación y fecha, sin 'pero', sin pedir nada a cambio: 'el martes prometí llamar y no llamé. Eso fue mío.'",
    porque: "La admisión vaga ('sé que me equivoqué mucho') no cuesta nada y no repara nada. Nombrar el error exacto muestra que de verdad miraste lo que hiciste.",
  },
  'confianca:44': { // A promessa esquecida
    titulo: "La promesa olvidada",
    acao: "Acuérdate de algo pequeño que le prometiste a esa persona y no entregaste — la foto, el enlace, la receta, el nombre de esa película. Entrégalo ahora, con una línea: 'te había quedado de mandar esto'.",
    porque: "Las promesas pequeñas olvidadas le enseñan a esa persona qué esperar de las grandes. Entregar una, aunque sea tarde, muestra que tu palabra no vence.",
  },
  'confianca:45': { // Aviso antes do atraso
    titulo: "Aviso antes del retraso",
    acao: "Si existe cualquier posibilidad de que te retrases para el próximo acuerdo con esa persona, avisa ahora — con un horario nuevo y realista, no con 'ya voy llegando'.",
    porque: "El retraso lastima menos que la espera sin información. Avisar temprano, con un número honesto, es respetar el tiempo de quien espera.",
  },
  'confianca:46': { // Pergunta corajosa
    titulo: "Pregunta valiente",
    acao: "Pregúntale a esa persona, por mensaje o en persona: '¿Hubo algo que prometí y no cumplí? Puedes decirme uno.' Después, solo escucha o lee — sin defenderte, sin explicar.",
    porque: "Tú no ves tus propias palabras quebradas; quien convive contigo, sí. Escuchar una, sin defensa, vale por diez autoevaluaciones.",
  },
  'confianca:47': { // Check-in de cinco minutos
    titulo: "Check-in de cinco minutos",
    acao: "Propón a esa persona un acuerdo fijo y pequeño: 5 minutos de conversación en día y hora ciertos — 'domingo, 20:00, hablamos 5 minutos, ¿te late?'. Anótalo en tu agenda en cuanto lo envíes.",
    porque: "La constancia no es intensidad, es frecuencia con hora fijada. Un ritual minúsculo y cumplido pesa más que promesas grandes y vagas.",
  },
  'confianca:48': { // Correção da história
    titulo: "Corrección de la historia",
    acao: "Si exageraste, omitiste o distorsionaste algo al contarle una historia a esa persona, corrígelo ahora: '¿te acuerdas de lo que te conté sobre X? En realidad fue así...'",
    porque: "La confianza se apoya en una versión única de los hechos. Corregir por cuenta propia, antes de cualquier reclamo, cuesta orgullo — y justamente por costar tiene valor.",
  },
  'confianca:49': { // Combinado por escrito
    titulo: "Acuerdo por escrito",
    acao: "Toma el último acuerdo medio vago entre ustedes ('eso lo vemos después') y conviértelo en un mensaje concreto: 'entonces quedó así: yo me encargo de X hasta el jueves, y tú me avisas sobre Y. ¿Cerrado?'",
    porque: "Un acuerdo vago es semilla de doble decepción: cada lado recuerda una versión distinta. Escribirlo en blanco y negro protege a los dos de la memoria selectiva.",
  },
  'confianca:50': { // Desculpa com data
    titulo: "Disculpa con fecha",
    acao: "Pídele disculpas a esa persona por UN retraso o una falla específica del pasado, nombrando el día: 'ese sábado en que te dejé esperando — te pido perdón, no debí hacerlo'. Sin justificación a continuación.",
    porque: "La disculpa genérica se diluye; la disculpa con fecha muestra que el episodio se quedó contigo también. Es la diferencia entre cerrar un tema y enterrar un tema.",
  },
  'confianca:51': { // O não dito com respeito
    titulo: "El no dicho con respeto",
    acao: "¿Hay algo que esa persona pidió y respondiste con un 'tal vez' que en realidad es no? Di el no ahora, con una frase de cuidado: 'prefiero decirte no ahora que fallarte después'.",
    porque: "El tal vez empuja la decepción hacia adelante y cobra intereses. Un no limpio duele una vez — y muestra que tu sí tiene respaldo.",
  },
  'confianca:52': { // Reconhecer a palavra cumprida
    titulo: "Reconocer la palabra cumplida",
    acao: "Acuérdate de una vez en que esa persona cumplió lo acordado — aunque haya sido pequeño. Dilo hoy, de forma específica: 'acordaste X y lo cumpliste. Me di cuenta.'",
    porque: "La confianza crece en los dos sentidos. Notar en voz alta la constancia de alguien valora lo que ya funciona entre ustedes — reconocer también construye, no solo reclamar.",
  },
  'confianca:53': { // Data no lugar do 'qualquer dia'
    titulo: "Una fecha en lugar del 'cualquier día'",
    acao: "Toma ese plan vago con esa persona — el paseo siempre postergado — y propón fecha y hora ahora: '¿qué tal el sábado a las 16:00?'. Ofrece dos opciones, si quieres facilitarlo.",
    porque: "El 'cualquier día' es donde los planes mueren en silencio. Poner fecha es asumir la palabra en voz alta — y un acuerdo con hora fijada tiene otra oportunidad de pasar.",
  },
  'confianca:54': { // Tarefa pequena, prazo claro
    titulo: "Tarea pequeña, plazo claro",
    acao: "Asume con esa persona UNA tarea pequeña y con fecha: 'yo resuelvo X para el viernes'. Elige algo que quepa con holgura en tu semana. Anótalo en el mismo minuto en que lo prometas.",
    porque: "Una promesa pequeña y cumplida construye más confianza que una promesa grande y heroica. Y anotarlo en el momento es el hábito de quien trata la palabra como contrato.",
  },
  'confianca:55': { // A demora assumida
    titulo: "La demora asumida",
    acao: "Abre ese mensaje de esa persona que quedó sin respuesta. Responde ahora empezando por la responsabilidad: 'me tardé, y eso fue mío, no tuvo que ver contigo'. Después responde el contenido.",
    porque: "El silencio largo deja a la otra persona llenando el vacío con la peor hipótesis. Asumir la demora primero deshace esa duda antes de cualquier explicación.",
  },
  'confianca:56': { // A régua de confiança
    titulo: "La medida de la confianza",
    acao: "Pregúntale a esa persona una cosa específica: '¿qué significa para ti un retraso?' o '¿qué te hace sentir que puedes contar con alguien?'. Una sola pregunta — y escucha hasta el final.",
    porque: "Cada persona mide la confianza con una medida distinta. Conocer la de quien te importa evita quebrar acuerdos que ni sabías que existían.",
  },
  'confianca:57': { // Confirmação de véspera
    titulo: "Confirmación de la víspera",
    acao: "Si hay un compromiso con esa persona en las próximas 48 horas, confírmalo ahora: '¿sigue en pie el jueves a las 19:00? Estoy organizando mi día por eso.' Sin esperar que confirme primero.",
    porque: "Confirmar en la víspera le cierra la puerta al malentendido y muestra que el encuentro está de verdad en tu agenda — no en la pila del 'si se puede'.",
  },

  // ===================== CAPITULO 13 — espelho (31) =====================
  // LOTE ESPELHO+FDS. Gestos adaptados neste lote (o gesto tem de ser FAZIVEL
  // no pais de quem le):
  //   · 'pastel' (da feira)  -> 'algo para picar' — o pastel de feira nao existe
  //     fora do Brasil; o gesto e "comer algo rapido na feira", e esse atravessa.
  //   · 'geladeiroteca'      -> 'un punto de intercambio de libros' — a geladeira
  //     reaproveitada como estante de rua e brasileira; a PRATICA existe.
  //   · 'luta' (aula exper.) -> 'algún arte marcial' — 'luta' generico em PT nao
  //     tem equivalente de uma palavra em ES sem soar a briga.
  //   · 'padaria'            -> 'panadería' / 'la barra de la panadería' (segue a
  //     escolha ja feita no lote vocePrimeiro deste mesmo arquivo).
  'espelho:0': Object.freeze({
    titulo: 'La primera luna, otra vez',
    acao: 'Abre lo que escribiste en la primera luna de esta vuelta y reléelo con calma. Subraya una frase que hoy suena distinta de como sonaba cuando la escribiste.',
    porque: 'Releer el punto de partida muestra la distancia recorrida — y esa medida no necesita que nadie te la confirme.',
  }),
  'espelho:1': Object.freeze({
    titulo: 'La carta que no se envía',
    acao: 'Escribe una carta a esa persona con todo lo que quedó sin decir este año. Al terminar, guarda la carta: no es para enviarla.',
    porque: 'Poner en el papel lo que quedó atascado ordena lo que estaba suelto por dentro. Esta carta es tuya, de principio a fin.',
  }),
  'espelho:2': Object.freeze({
    titulo: 'Cambio con prueba',
    acao: 'Haz una lista de tres cosas que cambiaron en ti este año. Al lado de cada una, anota un ejemplo concreto: un día, una escena, una decisión que muestre el cambio ocurriendo.',
    porque: 'Cambio sin ejemplo es frase bonita. Con ejemplo, se vuelve registro de lo que hiciste de verdad.',
  }),
  'espelho:3': Object.freeze({
    titulo: 'La maleta del año que viene',
    acao: 'Divide una página en dos columnas: \'me lo llevo\' y \'lo dejo aquí\'. Llena las dos con hábitos, ideas y formas de actuar de este año.',
    porque: 'Elegir por escrito pesa distinto de elegir solo en el pensamiento — el papel exige claridad.',
  }),
  'espelho:4': Object.freeze({
    titulo: 'Gratitud por escrito',
    acao: 'Escribe en el cuaderno el nombre de cada persona que se quedó cerca este año y, al lado de cada nombre, una línea sobre lo que esa presencia hizo por ti.',
    porque: 'Nombrar a quien se quedó saca esas presencias del fondo de la escena. Lo que se anota deja de pasar desapercibido.',
  }),
  'espelho:5': Object.freeze({
    titulo: 'El primer gesto, otra vez',
    acao: 'Repite hoy el primer ejercicio de esta vuelta, exactamente como en la primera luna. Después anota en tres líneas qué fue igual y qué fue distinto.',
    porque: 'El mismo gesto, hecho en dos momentos lejanos, funciona como regla: compara sin depender de la memoria.',
  }),
  'espelho:6': Object.freeze({
    titulo: 'La línea del año',
    acao: 'Dibuja una línea de tiempo de esta vuelta y marca en ella tres puntos altos y tres puntos difíciles. Dale un nombre corto a cada punto.',
    porque: 'Ver el año entero en una sola línea cambia la escala: lo que parecía enorme ocupa el tamaño que ocupa.',
  }),
  'espelho:7': Object.freeze({
    titulo: 'El nombre de este año',
    acao: 'Si esta vuelta fuera un capítulo de libro, ¿qué título tendría? Escribe el título y un párrafo corto explicando la elección.',
    porque: 'Darle nombre a un período es una manera de cerrarlo por completo, en vez de dejarlo abierto y sin forma.',
  }),
  'espelho:8': Object.freeze({
    titulo: 'Releer la página difícil',
    acao: 'Vuelve al pasaje más difícil que escribiste este año. Reléelo y escribe, al lado, una línea sobre cómo se ve esa escena desde hoy.',
    porque: 'El texto se quedó quieto en el papel; quien lo releyó cambió de lugar. La diferencia entre los dos es tuya, documentada.',
  }),
  'espelho:9': Object.freeze({
    titulo: 'Carta a quien empezó',
    acao: 'Escribe cinco líneas para quien eras en la primera luna, contándole lo que, en ese momento, todavía no sabías.',
    porque: 'Escribirle a quien fuiste vuelve visible el camino entre allá y acá — sin necesidad de embellecer nada.',
  }),
  'espelho:10': Object.freeze({
    titulo: 'Lo que quedó sin respuesta',
    acao: 'Haz una lista de las preguntas de este año que siguen sin respuesta. Al final, escribe: \'puedo cargar estas preguntas sin resolverlas hoy\'.',
    porque: 'No todo cierre es una respuesta. Admitir la pregunta abierta también es una manera de terminar en paz con ella.',
  }),
  'espelho:11': Object.freeze({
    titulo: 'Inventario de lo que hiciste',
    acao: 'Haz una lista de lo que existe hoy porque tú lo hiciste pasar este año: algo escrito, creado, arreglado, aprendido, sostenido. Las cosas pequeñas cuentan.',
    porque: 'La memoria guarda mejor lo que dolió que lo que se construyó. La lista corrige ese desequilibrio en el papel.',
  }),
  'espelho:12': Object.freeze({
    titulo: 'Dos páginas, una al lado de la otra',
    acao: 'Abre una página del principio del año y una de las últimas semanas. Lee las dos seguidas y anota una diferencia de tono que percibas entre ellas.',
    porque: 'El tono de quien escribe suele cambiar antes de que la propia persona lo note. Comparar páginas revela lo que pasó en el intervalo.',
  }),
  'espelho:13': Object.freeze({
    titulo: 'Lo que hablaba de ti',
    acao: 'Relee la carta que no se envía y subraya las frases que, en el fondo, hablan más de ti que de esa persona. Cuenta cuántas son.',
    porque: 'Buena parte de lo que se le escribe a alguien es retrato de quien escribe. Ver eso en el propio texto es información honesta.',
  }),
  'espelho:14': Object.freeze({
    titulo: 'Agradecerte a ti',
    acao: 'Escribe tres agradecimientos dirigidos a ti: uno por algo que hiciste, uno por algo que aguantaste, uno por algo que decidiste dejar de hacer.',
    porque: 'La gratitud suele apuntar hacia fuera. Apuntarla hacia dentro registra el propio esfuerzo, que también ocurrió.',
  }),
  'espelho:15': Object.freeze({
    titulo: 'Un minuto de espejo',
    acao: 'Quédate un minuto frente al espejo, en silencio. Después escribe tres líneas sobre quién viste, sin juicio — solo descripción.',
    porque: 'La luna trece se llama Espejo por esto: mirarte con la misma atención que este año entero le dedicó a mirar a esa persona.',
  }),
  'espelho:16': Object.freeze({
    titulo: 'El final de la carta',
    acao: 'Decide, ahora, qué hacer con la carta que no se envía: guardarla en una caja, pegarla en el cuaderno o romperla. Ejecuta la decisión enseguida.',
    porque: 'La carta cumplió su función al ser escrita. Lo que haces con el papel es un gesto de cierre — y es todo tuyo.',
  }),
  'espelho:17': Object.freeze({
    titulo: 'Un gesto para el año que viene',
    acao: 'Escribe un único gesto pequeño y repetible que quieras mantener el año que viene — algo que quepa en un día común. Describe cuándo y cómo ocurre ese gesto.',
    porque: 'La intención grande suele morir en el papel; un gesto pequeño y descrito tiene dónde ocurrir.',
  }),
  'espelho:18': Object.freeze({
    titulo: 'La última página',
    acao: 'Escribe la página final de esta vuelta: la fecha de hoy, una frase de cierre elegida por ti y, debajo, tu nombre — como quien firma.',
    porque: 'Firmar el final es distinto de simplemente dejar de escribir. Eres tú declarando: esta vuelta tuvo principio, medio y fin.',
  }),
  'espelho:19': Object.freeze({
    titulo: 'La primera conversación',
    acao: 'Desplázate por el historial hasta la primera conversación que tuviste con esa persona y relee los diez primeros mensajes. Después escribe una frase: ¿quién eras ahí?',
    porque: 'Releer el principio muestra la distancia entre quien llegó y quien está aquí ahora. Ese registro es tuyo — nadie tiene que saber que volviste allá.',
  }),
  'espelho:20': Object.freeze({
    titulo: 'El mensaje que mandaste',
    acao: 'Busca un mensaje largo que hayas escrito tú hace unos meses — a esa persona o a cualquier otra — y reléelo. Anota una cosa que hoy escribirías distinta.',
    porque: 'La diferencia entre lo que escribiste y lo que escribirías ahora es la medida más concreta de lo que cambió en ti este año.',
  }),
  'espelho:21': Object.freeze({
    titulo: 'La semana más difícil',
    acao: 'Piensa en la semana más pesada de tu año. Escribe en una línea lo que hiciste, en la práctica, para atravesarla — una acción concreta, no un sentimiento.',
    porque: 'Nombrar lo que te sostuvo convierte una memoria difícil en recurso. La próxima vez que apriete, ya sabes dónde está la cuerda.',
  }),
  'espelho:22': Object.freeze({
    titulo: 'Carta a quien empezó el año',
    acao: 'Escribe cinco líneas para quien eras en enero. Cuéntale lo que esa versión de ti todavía no sabía y necesitaba oír.',
    porque: 'Escribirle a tu pasado ordena lo que el año te enseñó — y deja registrado que prestaste atención a tu propio camino.',
  }),
  // ATENCAO, DUPLICATA DE TITULO: 'A carta que fica' existe TAMBEM em
  // vocePrimeiro:29, com acao e porque DIFERENTES (lá são 5 minutos de escrita
  // livre; aqui é a carta de fechamento do ano, datada e guardada). É
  // exatamente o caso que o cabeçalho deste arquivo cita para justificar a
  // chave 'capitulo:indice'. As duas traducoes sao distintas de proposito.
  'espelho:23': Object.freeze({
    titulo: 'La carta que se queda',
    acao: 'Escribe una carta corta a esa persona diciendo lo que este año te enseñó sobre esta historia. Féchala, dóblala y guárdala — no es para enviarla.',
    porque: 'Decir en el papel lo que no se dijo quita el peso de cargarlo todo por dentro. La carta cumple su función sin salir del cajón.',
  }),
  'espelho:24': Object.freeze({
    titulo: 'Un día común del diciembre que viene',
    acao: 'Escribe diez líneas describiendo un día común tuyo al final del año que viene — dónde te despiertas, qué haces por la mañana, qué te ocupa la cabeza. Escribe en presente, como si ya estuvieras allí.',
    porque: 'Poner en el papel la vida que quieres construir no cambia nada por magia — pero te da un blanco con el que comparar cada decisión del año.',
  }),
  'espelho:25': Object.freeze({
    titulo: 'Dos fotos, una diferencia',
    acao: 'Abre la galería y elige una foto tuya del principio del año y una reciente. Ponlas una al lado de la otra y escribe una diferencia que veas — en la mirada, en la postura, en el escenario.',
    porque: 'El cambio de un año entero es demasiado lento para verlo en vivo. Una al lado de la otra, aparece.',
  }),
  'espelho:26': Object.freeze({
    titulo: 'Tres frases, tres épocas',
    acao: 'Completa por escrito: \'En enero yo...\', \'A mitad de año yo...\', \'Hoy yo...\'. Solo hechos observables — lo que hacías, dónde estabas, qué te ocupaba la cabeza.',
    porque: 'Ver las tres versiones en la misma página muestra que el año no se quedó quieto — ni en los meses en que lo pareció.',
  }),
  'espelho:27': Object.freeze({
    titulo: 'La lista de preocupaciones de enero',
    acao: 'Escribe de memoria lo que más te preocupaba en enero — de tres a cinco cosas. Después tacha cada una que ya no existe o perdió fuerza.',
    porque: 'Tachar preocupaciones vencidas muestra, en el papel, cuánto se resolvió sin que notaras el momento exacto en que se resolvió.',
  }),
  'espelho:28': Object.freeze({
    titulo: 'La palabra que atraviesa',
    acao: 'Elige una palabra para llevarte al año que viene. Escríbela en un papel pequeño y ponla donde tus ojos dan todos los días — la cartera, el espejo, el fondo de pantalla.',
    porque: 'Una palabra elegida con calma funciona como filtro: ante una decisión, te preguntas si cabe en la palabra que elegiste.',
  }),
  'espelho:29': Object.freeze({
    titulo: 'Lo que no entra en la maleta',
    acao: 'Escribe en un papel un hábito o un pensamiento que eliges dejar en este año. Dóblalo y rómpelo — o tíralo. El gesto cierra la decisión.',
    porque: 'Decidir qué se queda atrás es tanta parte del cierre como decidir qué continúa. El papel roto marca la frontera.',
  }),
  'espelho:30': Object.freeze({
    titulo: 'Contrato de una línea',
    acao: 'Escribe una frase que empiece con \'El año que viene elijo...\' y termine con algo que dependa solo de ti. Fírmala y ponle la fecha.',
    porque: 'Una elección firmada pesa distinto de una gana suelta. Y lo que depende solo de ti no queda rehén de la respuesta de nadie.',
  }),

  // ================== FIM DE SEMANA — MISSOES_FDS (42) ==================
  // Este pool NAO esta em MISSOES_POR_CAPITULO: lib/missaoDoDia.js o troca
  // inteiro no sabado e no domingo. A chave segue o mesmo molde, com 'fds'
  // no lugar do capitulo.
  'fds:0': Object.freeze({
    titulo: 'El café aplazado',
    acao: 'Manda ahora un mensaje a la persona del café que siempre se aplaza: propón el sábado por la mañana, con lugar y hora. Escríbelo y envíalo antes de pensarlo demasiado.',
    porque: 'Reconstruir tu red te devuelve suelo firme. Quien quiere acercarse a alguien necesita una vida que se sostiene en pie.',
  }),
  'fds:1': Object.freeze({
    titulo: 'Sí a la invitación que rechazarías',
    acao: 'Coge esa invitación que rechazarías por pereza o por tristeza y responde que sí. Si no hay ninguna invitación abierta, pregúntale a una amistad qué se mueve este fin de semana.',
    porque: 'Decir sí rompe el ciclo de encerrarse. Una rutina social viva cambia cómo llegas a cualquier conversación — incluidas las que más importan.',
  }),
  'fds:2': Object.freeze({
    titulo: 'Lugar nuevo en el mapa',
    acao: 'Elige un lugar de la ciudad donde nunca hayas entrado — café, parque, mercado — y ponlo en el calendario del sábado con una hora definida.',
    porque: 'Territorio nuevo te saca del circuito de los recuerdos. Salir del escenario antiguo ayuda a ver la relación con menos ruido.',
  }),
  'fds:3': Object.freeze({
    titulo: 'Llamada de cinco minutos',
    acao: 'Llama a alguien querido con quien no hablas desde hace semanas. Cinco minutos bastan: pregúntale cómo está y escucha de verdad.',
    porque: 'Escuchar a alguien entrena la atención que pide cualquier acercamiento. Y te recuerda que no atraviesas esta etapa por tu cuenta.',
  }),
  'fds:4': Object.freeze({
    titulo: 'Grupo dormido',
    acao: 'Abre ese grupo de amistades que está parado y propón algo concreto para el domingo: hora, lugar, punto de encuentro. Un mensaje lo resuelve.',
    porque: 'Quien propone plan se vuelve punto de encuentro. El movimiento social real aparece en tu energía — sin necesidad de anunciar nada.',
  }),
  'fds:5': Object.freeze({
    titulo: 'Caminata de domingo',
    acao: 'El domingo temprano, camina diez minutos por una calle que no conozcas. Deja el celular en el bolsillo y fíjate en tres cosas nuevas del camino.',
    porque: 'El cuerpo en movimiento ordena la cabeza. Vuelves con más claridad para decidir los próximos pasos con calma.',
  }),
  'fds:6': Object.freeze({
    titulo: 'Comida de domingo',
    acao: 'Invita a alguien de la familia o a una amistad antigua a comer el domingo. Mensaje corto: día, hora y qué preparas — o dónde se encuentran.',
    porque: 'Compartir una comida reconstruye vínculo sin esfuerzo. Esa base afectiva te sostiene en los días difíciles.',
  }),
  'fds:7': Object.freeze({
    titulo: 'Gratitud en audio',
    acao: 'Graba un audio de un minuto para quien te aguantó el chaparrón estas últimas semanas. Di lo que hizo y lo que eso significó para ti.',
    porque: 'Nombrar la gratitud fortalece a quien te apoya. Una red fuerte es lo que separa un acercamiento sano de la dependencia.',
  }),
  'fds:8': Object.freeze({
    titulo: 'Grupo nuevo',
    acao: 'Apúntate ahora a una actividad de fin de semana que junte gente: una clase, una caminata en grupo, vóley en la plaza, un club de lectura. Basta con rellenar y confirmar.',
    porque: 'La gente nueva amplía tu mundo. Una vida que crece por su cuenta vuelve más ligero cualquier reencuentro, para los dos lados.',
  }),
  'fds:9': Object.freeze({
    titulo: 'Plan de sábado por la noche',
    acao: 'Escribe tres planes de sábado por la noche que dependan solo de ti o de tus amistades. Guarda la lista en el celular y elige uno ahora.',
    porque: 'Un sábado vacío tira hacia el mensaje impulsivo. Un plan cerrado te protege de actuar por carencia en vez de por intención.',
  }),
  'fds:10': Object.freeze({
    titulo: 'Conversación de barra',
    acao: 'En la panadería o en el mercado del sábado, saca treinta segundos de conversación con quien atiende: un comentario genuino, una pregunta simple.',
    porque: 'La conversación pequeña destraba la grande. Quien circula ligera carga menos peso hacia dentro de los encuentros importantes.',
  }),
  'fds:11': Object.freeze({
    titulo: 'La invitación que debes',
    acao: 'Piensa en quien ya te invitó dos veces sin respuesta. Mándale un mensaje hoy devolviendo la invitación, con una propuesta concreta para este fin de semana.',
    porque: 'Devolver mantiene viva la red. Cuidar los vínculos que ya existen entrena el mismo músculo que exige un acercamiento.',
  }),
  'fds:12': Object.freeze({
    titulo: 'Una foto para alguien',
    acao: 'Durante el plan del sábado o del domingo, hazle una foto a algo bonito y envíala a una amistad con una frase sobre el momento.',
    porque: 'Compartir el presente te ancla fuera de la nostalgia. Y mantiene puentes activos sin depender de una sola persona.',
  }),
  'fds:13': Object.freeze({
    titulo: 'Domingo por la tarde ocupado',
    acao: 'Cierra ahora un plan corto para el domingo por la tarde con alguien querido: un helado, un juego, el parque. Día, hora y lugar en un solo mensaje.',
    porque: 'El domingo por la tarde suele pesar. Ocupar ese hueco con vínculo real le quita fuerza al impulso de escribir por carencia.',
  }),
  'fds:14': Object.freeze({
    titulo: 'Café de media hora',
    acao: 'Escribe y envía una invitación corta a esa persona: "¿Sábado, 10h, un café en [lugar]? Media hora, sin compromiso." Adapta el lugar y envía.',
    porque: 'Una invitación con día, hora y duración corta respeta el espacio de la otra persona y facilita el sí. Si la respuesta tarda o es no, acógelo sin insistir — eso también comunica madurez.',
  }),
  'fds:15': Object.freeze({
    titulo: 'Caminata en el parque',
    acao: 'Invita a esa persona a veinte minutos de caminata el domingo por la mañana: "¿Domingo, 9h, una vuelta por [el parque]? Cosa rápida." Envíalo así, simple.',
    porque: 'Caminar lado a lado quita la presión del cara a cara. Un plan corto y de día deja el reencuentro ligero, sin clima de conversación definitiva.',
  }),
  'fds:16': Object.freeze({
    titulo: 'Vuelta por el mercado',
    acao: 'Propón una vuelta por el mercado del domingo: "¿Domingo, 10h, el mercado de [la calle]? Una vuelta y algo para picar." Un mensaje, directo al punto.',
    porque: 'Un lugar con movimiento invita a la risa, no al balance de la relación. Es convivencia en dosis pequeña — lo que pide un acercamiento honesto.',
  }),
  'fds:17': Object.freeze({
    titulo: 'Helado a las cinco',
    acao: 'Invita a un helado al final de la tarde del sábado: "¿Sábado, 17h, un helado en [lugar]? Media horita." Envíalo y suelta el celular.',
    porque: 'El final de la tarde tiene una hora natural para acabar, sin volverse una cena larga. Un encuentro que termina temprano deja ganas de más en vez de cansancio.',
  }),
  'fds:18': Object.freeze({
    titulo: 'Entrega acordada',
    acao: 'Si guardas algo de esa persona — un libro, un abrigo, una llave —, propón la entrega: "Sábado, 11h, te entrego [el objeto] en [lugar]. Cinco minutos." Envíalo hoy.',
    porque: 'Un motivo práctico le quita el peso simbólico al encuentro. Corto y resuelto, abre una puerta sin forzar ninguna.',
  }),
  'fds:19': Object.freeze({
    titulo: 'Librería de sábado',
    acao: 'Invita a media hora en una librería o un quiosco el sábado por la tarde: "¿Sábado, 15h, la librería [nombre]? Media hora, cada quien mira lo que quiera." Envía el mensaje ahora.',
    porque: 'Un lugar lleno de cosas que mirar rellena los silencios sin esfuerzo. El encuentro se queda sobre el presente, no sobre el balance del pasado.',
  }),
  'fds:20': Object.freeze({
    titulo: 'Puesto del mercado',
    acao: 'Ve al mercado del barrio, elige un puesto y pregúntale a quien atiende cómo se prepara algo que nunca has comprado. Llévate una unidad para probar.',
    porque: 'Una conversación corta con hora de acabar es la manera más fácil de volver a entrenar el contacto humano. Y encima vuelves a casa con una novedad en el plato.',
  }),
  'fds:21': Object.freeze({
    titulo: 'Invitación con día y hora',
    acao: 'Elige una amistad que no ves desde hace tiempo y mándale una invitación completa: día, hora y lugar. Nada de \'deberíamos quedar\' — propón algo listo para responder sí o no.',
    porque: 'La invitación vaga muere en el \'sí, va\'. La invitación con fecha existe de verdad: o se vuelve encuentro, o se vuelve respuesta clara — y en los dos casos sales del limbo.',
  }),
  'fds:22': Object.freeze({
    titulo: 'Café en la barra',
    acao: 'Tómate el café del sábado en la barra de la panadería, no para llevar. Cambia al menos una frase real con quien atiende — un elogio concreto a lo que pediste ya cuenta.',
    porque: 'Diez minutos entre gente, sin compromiso ninguno, recuerdan que estar en el mundo es más ligero de lo que parece desde la puerta de casa.',
  }),
  'fds:23': Object.freeze({
    titulo: 'Resucita el grupo',
    acao: 'Abre ese grupo de amistades que anda mudo, manda una foto antigua de ustedes y una pregunta específica a una persona del grupo, por su nombre.',
    porque: 'En un grupo parado, nadie quiere dar el primer paso. Cuando alguien lo da, el resto aparece — y hoy ese alguien puedes ser tú.',
  }),
  'fds:24': Object.freeze({
    titulo: 'Audio de dos minutos',
    acao: 'Graba un audio de hasta 2 minutos para alguien de la familia o una amistad antigua contándole una cosa buena de tu semana — y termina con una pregunta sobre la vida de quien lo recibe.',
    porque: 'El audio lleva voz, y la voz lleva presencia. Es una manera de visitar a alguien sin salir del sitio — y de probarte que tu semana sí tuvo algo bueno.',
  }),
  'fds:25': Object.freeze({
    titulo: 'Radar del próximo fin de semana',
    acao: 'Busca ahora 3 cosas gratis o baratas que pasen en tu ciudad el próximo fin de semana — un mercado, un concierto, una exposición — y pon una de ellas en la agenda con día y hora.',
    porque: 'Un buen fin de semana raramente ocurre por casualidad; se agenda antes. Quien planea con antelación llega al sábado con plan, no con vacío.',
  }),
  'fds:26': Object.freeze({
    titulo: 'Calle nueva en el barrio viejo',
    acao: 'Camina 10 minutos por una calle de tu barrio en la que nunca hayas entrado. Fíjate en 3 cosas que no sabías que existían ahí.',
    porque: 'Territorio nuevo, aunque sea pequeño, saca la vida del modo repetición. Y encontrar algo nuevo a dos cuadras de casa recuerda que descubrir no exige viajar.',
  }),
  'fds:27': Object.freeze({
    titulo: 'Elogio con autor',
    acao: 'Elogia hoy, de forma concreta, el trabajo de alguien: el pan de quien lo horneó, el corte de quien lo cortó, la atención de quien te atendió. Mirando a los ojos, en una frase.',
    porque: 'Un elogio concreto es un regalo que no cuesta nada y no pide nada de vuelta. Y quien se fija en el trabajo de los demás entrena la mirada para lo bueno que hay cerca.',
  }),
  'fds:28': Object.freeze({
    titulo: 'Diez minutos de experta',
    acao: 'Entra en un grupo o foro de tu afición y responde la duda de alguien con lo que sabes. Una respuesta cuidada, y listo.',
    porque: 'Ayudar en algo que dominas te recuerda tu propio valor — y te pone en el lugar de quien ofrece, no de quien solo pide.',
  }),
  'fds:29': Object.freeze({
    titulo: 'Libro con nota',
    acao: 'Separa un libro que ya leíste y te gustó, escribe en un papel por qué vale la lectura y deja los dos en un punto de intercambio de libros, en la conserjería o con alguien que encaje con la historia.',
    porque: 'Dar algo tuyo en vez de esperar recibir cambia el papel que ocupas en tu propio fin de semana. Y un libro parado en la estantería no le sirve a nadie.',
  }),
  'fds:30': Object.freeze({
    titulo: 'Pide una recomendación',
    acao: 'Mándale un mensaje a una amistad pidiéndole UNA recomendación — película, serie, música, receta — y avísale que después le cuentas qué te pareció.',
    porque: 'Pedir una recomendación es una invitación disfrazada: abre conversación ahora y ya deja un motivo listo para volver a conversar después.',
  }),
  'fds:31': Object.freeze({
    titulo: 'Di sí una vez',
    acao: 'Repasa las invitaciones que dejaste en visto esta semana y responde \'me apunto\' a una de ellas ahora. Si no hay ninguna, sé tú quien invita: llama a alguien para algo simple este mismo fin de semana.',
    porque: 'La vida social se reconstruye de un sí en un sí. El primero suele ser el más difícil — los siguientes van a rebufo de ese.',
  }),
  'fds:32': Object.freeze({
    titulo: 'La foto que se volvió mensaje',
    acao: 'En un paseo de hoy, fotografía algo que te recuerde a una amistad y mándalo en el momento: \'vi esto y me acordé de ti\'.',
    porque: 'Es el gesto de amistad más pequeño que existe — dice \'tienes lugar en mis días\' sin necesidad de una ocasión especial.',
  }),
  'fds:33': Object.freeze({
    titulo: 'Clase de prueba',
    acao: 'Busca una clase de prueba gratis o barata cerca de ti — baile, algún arte marcial, cerámica, cualquier cosa que use las manos o el cuerpo — y manda un mensaje ahora preguntando el horario del fin de semana.',
    porque: 'Un grupo nuevo es uno de los pocos sitios donde sacar conversación se espera, no resulta raro. Y el mensaje de hoy es lo que separa \'quiero probar\' de \'tengo hora reservada\'.',
  }),
  'fds:34': Object.freeze({
    titulo: 'El sábado nace el domingo',
    acao: 'Al final del domingo, anota 3 planes para el próximo fin de semana que no dependan de que nadie confirme — y un cuarto con nombre: a quién quieres llamar.',
    porque: 'Un buen fin de semana se construye antes, mitad por cuenta propia, mitad en compañía. Con el plan en pie, la semana ya corre hacia algo.',
  }),
  'fds:35': Object.freeze({
    titulo: 'Café del sábado por la mañana',
    acao: 'Invita a esa persona a un café de panadería el sábado por la mañana: manda el mensaje ahora con lugar y hora, dejando claro que es cosa rápida, de una hora como máximo.',
    porque: 'Un café por la mañana es el plan más ligero que existe: corto, de día, con una hora natural para acabar. Fácil de aceptar — y, si la respuesta es no, tu sábado sigue en pie.',
  }),
  'fds:36': Object.freeze({
    titulo: 'Mercado en pareja',
    acao: 'Llama a esa persona para ir al mercado contigo el fin de semana y propón una misión: cada quien elige una fruta que la otra persona nunca haya probado.',
    porque: 'El mercado es color, movimiento y tema de conversación listo en cada puesto. Un plan con tarea les da algo que hacer a las manos y a la charla — nadie queda rehén del silencio.',
  }),
  'fds:37': Object.freeze({
    titulo: 'Caminata con punto final',
    acao: 'Propón a esa persona una caminata corta de domingo — una plaza, el paseo marítimo, un parque — con punto final acordado: termina en el café, en el bocado o en el helado. Manda la invitación con el trayecto ya pensado.',
    porque: 'Caminar lado a lado conversa mejor que una mesa cara a cara cuando el tema es delicado. Y el punto final le da al encuentro un final natural, sin \'¿y ahora?\'.',
  }),
  'fds:38': Object.freeze({
    titulo: 'Descubrimiento del barrio',
    acao: '¿Descubriste un lugar nuevo este fin de semana? Invita a esa persona con una frase: \'encontré un lugar con tu cara, quiero mostrártelo\'. Queda de día, cosa de media hora.',
    porque: 'Quien muestra un descubrimiento llega con algo que ofrecer, no con una petición. Y \'con tu cara\' dice que prestas atención — sin necesidad de decir nada más.',
  }),
  'fds:39': Object.freeze({
    titulo: 'Una planta para cada casa',
    acao: 'Invita a esa persona a un puesto de plantas o a una floristería el fin de semana: la misión es salir de ahí con una plantita para cada casa. Media hora, de día, y listo.',
    porque: 'Elegir algo vivo da conversación fácil y un plan con propósito. Después, cada casa cuida la suya — el recuerdo se queda, sin cobrarle nada a nadie.',
  }),
  'fds:40': Object.freeze({
    titulo: 'Helado de domingo',
    acao: 'El domingo por la tarde, manda: \'¿un helado en un rato? media hora y cada quien vuelve a su domingo\'. Lugar, hora y duración en el propio mensaje.',
    porque: 'Es el encuentro más pequeño posible: de día, barato, con principio y fin anunciados. Lo bastante pequeño para que el sí salga fácil — y, si viene un no, costó un mensaje.',
  }),
  'fds:41': Object.freeze({
    titulo: 'Dos opciones sobre la mesa',
    acao: 'Mándale a esa persona dos opciones de plan de día para el fin de semana — \'¿café el sábado por la mañana o caminata el domingo por la tarde?\' — y deja la elección entera del otro lado.',
    porque: 'Ofrecer una elección es distinto de pedir presencia: esa persona participa de la decisión desde el principio. Y tú demuestras apertura sin renunciar a tu propio fin de semana.',
  }),
  /* ================== LOTE 1 DA ONDA 2 ================== */
  /* Os capitulos vocePrimeiro, vontade e voz — 175 missoes, 525 campos.
   * GESTOS ADAPTADOS, e nao traduzidos ao pe da letra:
   *   · 'padaria'     -> 'una panadería o una cafetería' (a padaria que serve
   *     cafe da manha nao e universal; o gesto e "sair, pedir algo, ocupar uma
   *     mesa", e esse atravessa)
   *   · 'feira'       -> 'el mercado'   · 'portaria' -> 'la conserjería'
   *   · 'polichinelo' -> 'saltos de tijera'
   *   · 'sobremesa'   -> 'un postre'. FALSO AMIGO: 'sobremesa' em espanhol e a
   *     conversa DEPOIS da refeicao, nao o doce — literal trocaria o gesto.
   * GENERO: 'esa persona', 'alguien de confianza' — nunca el/ella travado,
   * porque o PT nao trava e o app fala com qualquer pessoa sobre qualquer uma. */

  /* ===== vocePrimeiro (58) ===== */
  'vocePrimeiro:0': Object.freeze({ // Água antes do celular
    titulo: 'Agua antes del celular',
    acao: 'Al despertar, bebe un vaso lleno de agua antes de desbloquear el celular. Deja el vaso listo en la mesita la noche anterior.',
    porque: 'La primera acción del día define quién manda: tú o la notificación. Cuidar el cuerpo temprano es el primer ladrillo de quien se levanta de nuevo.',
  }),
  'vocePrimeiro:1': Object.freeze({ // Silenciar sem bloquear
    titulo: 'Silenciar sin bloquear',
    acao: 'Abre la red social donde esa persona aparece más y silencia sus publicaciones y sus historias. No bloquees ni elimines: solo quítalo de tu vista.',
    porque: 'Cada aparición inesperada reabre la herida y borra el polvo que ya se había asentado. Silenciar protege tus días sin quemar ningún puente.',
  }),
  'vocePrimeiro:2': Object.freeze({ // Cama feita
    titulo: 'Cama hecha',
    acao: 'En cuanto te levantes, haz la cama: estira la sábana, acomoda la almohada y la colcha.',
    porque: 'Es la primera victoria del día, visible y sin depender de nadie. Orden en tu rincón recuerda que tú sigues gobernando tu propio espacio.',
  }),
  'vocePrimeiro:3': Object.freeze({ // Cinco minutos no papel
    titulo: 'Cinco minutos en papel',
    acao: 'Toma lápiz y papel y escribe durante cinco minutos todo lo que duele hoy, sin filtro y sin releer. Después cierra el cuaderno y guárdalo.',
    porque: 'El dolor escrito pesa menos que el dolor dando vueltas en círculo en la cabeza. El papel sostiene lo que no necesitas cargar todo el día.',
  }),
  'vocePrimeiro:4': Object.freeze({ // Um oi pra gente amiga
    titulo: 'Un saludo a alguien que te quiere',
    acao: 'Manda ahora un mensaje a una amistad que te hace bien: puede ser solo un \'hola, me acordé de ti, nos vemos pronto\'.',
    porque: 'La ruptura encoge el mundo; reactivar tu red le devuelve el tamaño real a tu vida. Quien tiene gente cerca atraviesa el duelo con más suelo.',
  }),
  'vocePrimeiro:5': Object.freeze({ // Prato de verdade
    titulo: 'Un plato de verdad',
    acao: 'Prepara una comida simple y de verdad: un huevo con pan a la plancha, fruta picada, lo que haya. Siéntate a la mesa y come sin ninguna pantalla cerca.',
    porque: 'Comer de cualquier manera es la primera señal de abandono de uno mismo. Una comida cuidada es amor propio que se mastica.',
  }),
  'vocePrimeiro:6': Object.freeze({ // Caixa fora de vista
    titulo: 'Una caja fuera de la vista',
    acao: 'Elige un objeto o una prenda que recuerde demasiado a esa persona y guárdalo en una caja, fuera de tu campo de visión. No lo tires: solo quítalo del camino por ahora.',
    porque: 'Tú decides qué encuentras al abrir el armario, no el recuerdo por sorpresa. Menos disparador a la vista, más espacio para respirar.',
  }),
  'vocePrimeiro:7': Object.freeze({ // Dez minutos de rua
    titulo: 'Diez minutos de calle',
    acao: 'Ponte unos tenis y camina diez minutos por la cuadra. Si quieres compañía, una sola canción o el sonido de la calle.',
    porque: 'Cuerpo quieto es invitación para que la cabeza gire en falso. Diez minutos de paso cambian la textura del día entero.',
  }),
  'vocePrimeiro:8': Object.freeze({ // Banho de virada
    titulo: 'Una ducha que cambia el día',
    acao: 'Dúchate con atención de verdad: lávate el pelo con calma, frótate con esmero y, si te animas, cierra con treinta segundos de agua fría.',
    porque: 'La ducha es la forma más barata de empezar de nuevo un día malo. Salir distinta de como entraste es entrenamiento diario.',
  }),
  'vocePrimeiro:9': Object.freeze({ // Playlist sem faca
    titulo: 'Una lista sin cuchillo',
    acao: 'Arma una lista de reproducción solo con canciones que no hablen de la relación. Saca de la rotación, por ahora, las que abren la herida.',
    porque: 'La música conduce la emoción, y repetir la banda sonora del dolor es revivir la escena varias veces al día. Elegir lo que suena es proteger tu propio ánimo.',
  }),
  'vocePrimeiro:10': Object.freeze({ // Fotos no arquivo
    titulo: 'Fotos en el archivo',
    acao: 'Mueve las fotos de la relación a un álbum archivado, fuera de la galería principal del celular. No borres nada.',
    porque: 'Tropezar con el pasado en cada desplazamiento impide que el polvo se asiente. Archivar es cuidado contigo, no borrar la historia.',
  }),
  'vocePrimeiro:11': Object.freeze({ // Cabeceira limpa
    titulo: 'Mesita limpia',
    acao: 'Quita todo de la mesita de noche, pásale un paño y devuelve solo lo esencial: agua, un libro, la lámpara.',
    porque: 'Es el primer y el último escenario que ves cada día. El orden ahí conversa directo con tu sueño y tu ánimo.',
  }),
  'vocePrimeiro:12': Object.freeze({ // Lista do que fica
    titulo: 'La lista de lo que queda',
    acao: 'Escribe cinco cosas de tu vida que siguen en pie: trabajo, gente, techo, salud, algún proyecto. Pega el papel donde lo veas.',
    porque: 'El dolor reciente se traga el paisaje completo. La lista devuelve el tamaño real de lo que todavía tienes — y es desde ahí que se reconstruye.',
  }),
  'vocePrimeiro:13': Object.freeze({ // Corpo no chão
    titulo: 'El cuerpo en el suelo',
    acao: 'Acuéstate en el suelo y estira durante cinco minutos: brazos, piernas, cuello, columna. Sin técnica, solo estira lo que esté trabado.',
    porque: 'La tristeza también vive en el cuerpo, en forma de nudo. Soltar la musculatura toca el dolor por un camino que el pensamiento no alcanza.',
  }),
  'vocePrimeiro:14': Object.freeze({ // Feira no papel
    titulo: 'El mercado en papel',
    acao: 'Apunta tres alimentos de verdad para la próxima compra: una fruta, una verdura y algo que te guste cocinar.',
    porque: 'Planear la comida es planear cuidado. Quien se alimenta bien aguanta los días pesados con otra estructura.',
  }),
  'vocePrimeiro:15': Object.freeze({ // Cinco minutos de sol
    titulo: 'Cinco minutos de sol',
    acao: 'Quédate cinco minutos al sol de la mañana — balcón, patio o banqueta — sin el celular en la mano.',
    porque: 'La luz de la mañana despierta el cuerpo y marca un inicio de día que es tuyo. Es recarga simple, gratis y diaria.',
  }),
  'vocePrimeiro:16': Object.freeze({ // Emboscada desligada
    titulo: 'Emboscada desactivada',
    acao: 'Desactiva, por ahora, los \'recuerdos\' automáticos de las aplicaciones de fotos y de las redes del celular.',
    porque: 'Una cosa es la nostalgia elegida; otra es la emboscada del algoritmo. Quien decide la hora de mirar atrás eres tú, no la aplicación.',
  }),
  'vocePrimeiro:17': Object.freeze({ // Uma pendência a menos
    titulo: 'Un pendiente menos',
    acao: 'Elige el pendiente más pequeño que lleva días en tu cabeza y resuélvelo ahora: esa llamada, ese recibo, ese mensaje de trabajo.',
    porque: 'Cada pendiente abierto consume energía en silencio, justo cuando te sobra poca. Cerrar uno devuelve aire para lo que importa.',
  }),
  'vocePrimeiro:18': Object.freeze({ // Folha da garganta
    titulo: 'Quince minutos de sueño extra',
    acao: 'Adelanta quince minutos la hora de acostarte hoy. Solo quince, sin pelear con el resto de la rutina.',
    porque: 'El duelo cansa el cuerpo como si fuera trabajo físico. Dormir un poco más es la medida más simple que le devuelve reservas.',
  }),
  'vocePrimeiro:19': Object.freeze({ // Casa arejada
    titulo: 'Nada que revisar',
    acao: 'Elige un horario del día de hoy — una hora basta — en el que no revisas el perfil de esa persona ni una sola vez. Di en voz alta cuál es.',
    porque: 'Revisar es el gesto que reabre la herida con tus propias manos. Una hora protegida prueba que se puede, y mañana son dos.',
  }),
  'vocePrimeiro:20': Object.freeze({ // Hora de deitar
    titulo: 'Hora de acostarse',
    acao: 'Define ahora la hora de irte a la cama hoy y crea una alarma de \'hora de acostarse\' en el celular.',
    porque: 'La noche sin hora se vuelve desplazamiento infinito y rumia de madrugada. Una hora marcada protege tu energía para el día siguiente.',
  }),
  'vocePrimeiro:21': Object.freeze({ // Espelho a favor
    titulo: 'El espejo a favor',
    acao: 'Quédate un minuto frente al espejo y di en voz alta tres cosas que respetas en ti — cosas hechas, actitudes, no apariencia.',
    porque: 'En estos días la voz interna suele ser cruel. Decir en voz alta lo que vale en ti le disputa ese espacio — y nadie se levanta desde su propio desprecio.',
  }),
  'vocePrimeiro:22': Object.freeze({ // Celular fora do quarto
    titulo: 'El celular fuera del cuarto',
    acao: 'Hoy en la noche, deja el celular cargando fuera del cuarto y usa un despertador común o el reloj.',
    porque: 'El impulso de revisar a las tres de la mañana vive en la mesita. Con el aparato lejos de la mano, la madrugada vuelve a ser tuya.',
  }),
  'vocePrimeiro:23': Object.freeze({ // Suor de cinco minutos
    titulo: 'Cinco minutos de sudor',
    acao: 'Haz cinco minutos de ejercicio que te quite el aliento: saltar la cuerda, subir escaleras, sentadillas, baile en la sala.',
    porque: 'El sudor es respuesta concreta a la sensación de impotencia. El cuerpo gana fuerza antes de que la cabeza lo crea — y le presta esa fuerza al resto.',
  }),
  'vocePrimeiro:24': Object.freeze({ // Prazer com hora
    titulo: 'Un placer con hora',
    acao: 'Elige un placer pequeño y honesto para hoy — un postre, un episodio de serie, un baño largo — y agenda su hora en el celular.',
    porque: 'El dolor reciente le roba el gusto a las cosas. Devolver el placer a propósito, con hora marcada, es reconstrucción — no huida.',
  }),
  'vocePrimeiro:25': Object.freeze({ // Desabafo cronometrado
    titulo: 'Desahogo cronometrado',
    acao: 'Pon un cronómetro de diez minutos y desahógate con ganas: llora, habla en voz alta, escribe. Cuando suene, levántate, lávate la cara y cambia de cuarto.',
    porque: 'El duelo necesita salida, no la posesión del día entero. Darle hora al dolor es el comienzo de mandarlo, en lugar de obedecerlo.',
  }),
  'vocePrimeiro:26': Object.freeze({ // Dez minutos de faxina
    titulo: 'Diez minutos de limpieza',
    acao: 'Pon un temporizador de diez minutos y ordena un solo cuarto al ritmo que salga: los platos, la ropa tirada, la basura afuera.',
    porque: 'El estado de la casa refleja y alimenta el estado de adentro. Diez minutos de orden prueban que algo sí se puede mejorar hoy, ahora.',
  }),
  'vocePrimeiro:27': Object.freeze({ // Fim de semana seu
    titulo: 'Un fin de semana tuyo',
    acao: 'Escribe en dos líneas un plan para el próximo fin de semana que dependa solo de ti: el mercado, el cine, una caminata, una visita.',
    porque: 'El fin de semana vacío es el terreno donde más crece la nostalgia. Una agenda propia ocupa ese terreno antes de que lo ocupe el dolor.',
  }),
  'vocePrimeiro:28': Object.freeze({ // Uma linha por noite
    titulo: 'Una línea cada noche',
    acao: 'Antes de dormir, apunta una línea en el cuaderno: una cosa que hiciste hoy por ti. Solo una línea, todas las noches.',
    porque: 'En un día malo, la sensación es que nada avanza — el cuaderno prueba lo contrario, línea por línea. Un registro escrito es suelo para atravesar los días difíciles.',
  }),
  'vocePrimeiro:29': Object.freeze({ // A carta que fica
    titulo: 'La carta que se queda',
    acao: 'Toma papel y lápiz y escribe durante 5 minutos todo lo que te gustaría decirle a esa persona. Después dobla el papel y guárdalo en un cajón — sin enviar, sin releer.',
    porque: 'Lo que da vueltas en la cabeza sin salir ocupa espacio todo el día. En el papel gana un lugar propio y deja de pedir atención a cada hora.',
  }),
  'vocePrimeiro:30': Object.freeze({ // Choro com hora marcada
    titulo: 'Llanto con hora marcada',
    acao: 'Pon un cronómetro de 5 minutos, siéntate en un lugar tranquilo y deja venir lo que venga — lágrima, rabia, nada. Cuando suene, lávate la cara y sigue con el día.',
    porque: 'La emoción con espacio reservado tiende a invadir menos el resto del día. Sientes lo que necesitas sentir — con inicio, medio y fin.',
  }),
  'vocePrimeiro:31': Object.freeze({ // A caixa do depois
    titulo: 'La caja del después',
    acao: 'Elige un objeto que recuerde a esa persona y guárdalo en una caja o un cajón, fuera del campo de visión. Solo uno, sin tirar nada.',
    porque: 'Tú decides con qué se topan tus ojos por casualidad. Guardar no borra la historia — solo te devuelve la decisión de cuándo revisitarla.',
  }),
  'vocePrimeiro:32': Object.freeze({ // Pasta de fotos fora do caminho
    titulo: 'La carpeta de fotos fuera del camino',
    acao: 'Crea en el celular un álbum llamado "después" y mueve ahí las fotos con esa persona. Nada de borrar — solo quitarlas del camino del dedo que recorre la galería.',
    porque: 'Toparse con una foto sin querer duele de una manera; abrirla por decisión duele de otra. Este gesto separa las dos.',
  }),
  'vocePrimeiro:33': Object.freeze({ // A lista do que não faz falta
    titulo: 'La lista de lo que no echas de menos',
    acao: 'Escribe 3 cosas de esa relación que NO echas de menos. Con detalles concretos, sin censura. Guarda la lista para releerla en los días difíciles.',
    porque: 'La nostalgia edita la memoria y se queda solo con las mejores escenas. Apuntar lo que molestaba devuelve el retrato completo.',
  }),
  'vocePrimeiro:34': Object.freeze({ // Voz alta, porta fechada
    titulo: 'Voz alta, puerta cerrada',
    acao: 'Cierra la puerta del cuarto, marca 3 minutos en el reloj y di en voz alta lo que te está doliendo hoy. Sin público, sin filtro.',
    porque: 'Oír tu propia voz ordena lo que el pensamiento revuelve. Dicho en voz alta, el nudo se vuelve más visible — y un nudo visible se desata mejor.',
  }),
  'vocePrimeiro:35': Object.freeze({ // Mapa da saudade
    titulo: 'El mapa de la nostalgia',
    acao: 'Apunta en el celular la hora y el lugar en que el dolor apretó más hoy, y qué estabas haciendo. Con una línea basta.',
    porque: 'El dolor mapeado se vuelve patrón. Conocer tus horarios difíciles te permite llegar a ellos con algo planeado, en lugar de por sorpresa.',
  }),
  'vocePrimeiro:36': Object.freeze({ // Cinco coisas na sala
    titulo: 'Cinco cosas en la sala',
    acao: 'Detente donde estás y nombra en voz baja: 5 cosas que ves, 4 que puedes tocar, 3 sonidos que oyes, 2 olores, 1 sabor.',
    porque: 'Los sentidos solo funcionan en el presente. Convocarlos trae la atención de la película antigua de vuelta al cuarto donde estás ahora.',
  }),
  'vocePrimeiro:37': Object.freeze({ // Pés no chão
    titulo: 'Los pies en el suelo',
    acao: 'Quítate los zapatos y camina por la casa durante 3 minutos prestando atención solo al contacto del pie con el piso: temperatura, textura, peso.',
    porque: 'La sensación concreta compite con el pensamiento en bucle. El pie en el suelo es literal — un recordatorio físico de dónde estás.',
  }),
  'vocePrimeiro:38': Object.freeze({ // Água fria nas mãos
    titulo: 'Agua fría en las manos',
    acao: 'Abre la llave y deja correr el agua fría por las manos y las muñecas durante 2 minutos, prestando atención solo a la temperatura.',
    porque: 'Una sensación fuerte e inofensiva interrumpe el piloto automático. Es un botón de pausa que existe en cualquier lavabo.',
  }),
  'vocePrimeiro:39': Object.freeze({ // Objeto em detalhe
    titulo: 'Un objeto en detalle',
    acao: 'Toma cualquier objeto cercano y descríbelo en voz alta durante 2 minutos: peso, textura, temperatura, marcas de uso.',
    porque: 'Describir exige atención total, y la atención total no comparte espacio con la rumia. Es simple a propósito.',
  }),
  'vocePrimeiro:40': Object.freeze({ // Dez coisas que se movem
    titulo: 'Diez cosas que se mueven',
    acao: 'Ve hasta la ventana y cuenta 10 cosas en movimiento allá afuera: una hoja, un auto, gente, una nube. Sin prisa.',
    porque: 'El mundo de allá afuera sigue ancho y en movimiento. Mirarlo encoge un poco el cuarto donde el dolor hace eco.',
  }),
  'vocePrimeiro:41': Object.freeze({ // Uma fruta, atenção inteira
    titulo: 'Una fruta, la atención entera',
    acao: 'Come una fruta o un bocado sin ninguna pantalla cerca, prestando atención solo al sabor y a la textura, hasta la última mordida.',
    porque: 'Comer en automático es el patrón de los días difíciles. Cinco minutos de presencia en algo simple muestran que la presencia sigue siendo posible.',
  }),
  'vocePrimeiro:42': Object.freeze({ // Três minutos de soltura
    titulo: 'Tres minutos de soltar',
    acao: 'Ponte de pie y suelta despacio el cuello, los hombros y los brazos durante 3 minutos, como el cuerpo lo pida. Sin técnica, solo movimiento.',
    porque: 'El cuerpo guarda el peso del día en lugares que ni notas. Soltar un poco cambia la postura con la que atraviesas la próxima hora.',
  }),
  'vocePrimeiro:43': Object.freeze({ // Coração acelerado de propósito
    titulo: 'El corazón acelerado a propósito',
    acao: 'Haz 2 minutos de movimiento intenso: saltos de tijera, subir escaleras, bailar fuerte en medio de la sala. Detente cuando se acorte el aliento.',
    porque: 'El corazón acelerado por esfuerzo es una sensación que elegiste y que controlas — muy distinta del apretón que llega sin pedir permiso. El cuerpo nota la diferencia en la práctica.',
  }),
  'vocePrimeiro:44': Object.freeze({ // Banho com atenção
    titulo: 'Ducha con atención',
    acao: 'En la próxima ducha, reserva 3 minutos para prestar atención solo al agua: temperatura, sonido, el punto donde toca la piel.',
    porque: 'La ducha ya está en la rutina — cambiar la atención dentro de ella no cuesta nada y convierte un momento automático en un momento tuyo.',
  }),
  'vocePrimeiro:45': Object.freeze({ // Mãos cuidadas
    titulo: 'Manos cuidadas',
    acao: 'Ponte crema o aceite en las manos masajeando despacio cada dedo, durante 3 minutos, con atención en el tacto.',
    porque: 'El tacto con cuidado es algo que puedes darte ahora, sin depender de nadie. Pequeño, concreto e inmediato.',
  }),
  'vocePrimeiro:46': Object.freeze({ // Escovar com a outra mão
    titulo: 'Cepillarse con la otra mano',
    acao: 'Cepíllate los dientes con la mano no dominante, de principio a fin, prestando atención a la torpeza.',
    porque: 'Una novedad mínima obliga a la atención total — y durante 2 minutos el piloto automático, que adora volver al dolor, se queda sin espacio.',
  }),
  'vocePrimeiro:47': Object.freeze({ // Espelho, um minuto
    titulo: 'Espejo, un minuto',
    acao: 'Detente frente al espejo, mírate a los ojos durante 1 minuto y di tu nombre en voz alta una vez.',
    porque: 'Al final de una relación es fácil perderse de vista. Ese minuto sirve solo para registrar: hay alguien ahí, y eres tú.',
  }),
  'vocePrimeiro:48': Object.freeze({ // Um móvel fora do lugar
    titulo: 'Un mueble fuera de lugar',
    acao: 'Cambia de lugar un objeto o un mueble pequeño — la lámpara, la silla, un cuadro. Elige un rincón que miras todos los días.',
    porque: 'El escenario antiguo guarda disparadores en los detalles. Un desplazamiento pequeño marca, en el espacio físico, que esta casa sigue siendo tuya y cambia contigo.',
  }),
  'vocePrimeiro:49': Object.freeze({ // Bebida quente, duas mãos
    titulo: 'Bebida caliente, dos manos',
    acao: 'Prepara una bebida caliente y tómala sosteniendo la taza con las dos manos, sintiendo el calor hasta el final. El celular en otro cuarto.',
    porque: 'El calor en las manos es un consuelo que no necesita palabras. Y preparar algo para ti es un gesto de cuidado fácil de repetir mañana.',
  }),
  'vocePrimeiro:50': Object.freeze({ // Alarme com nome de coisa boa
    titulo: 'Una alarma con nombre de cosa buena',
    acao: 'Crea una alarma para mañana con el nombre de algo pequeño y bueno: "café en el balcón", "5 minutos de sol". Cuando suene, hazlo.',
    porque: 'Una rutina nueva se construye de compromisos mínimos. Una alarma con nombre recuerda que el día puede contener cosas que son solo tuyas.',
  }),
  'vocePrimeiro:51': Object.freeze({ // Três mínimos na geladeira
    titulo: 'Tres mínimos en el refrigerador',
    acao: 'Escribe en un papel 3 tareas mínimas para mañana — del tamaño de "lavar la taza" — y pégalo en el refrigerador.',
    porque: 'Tachar cosas pequeñas da prueba visible de movimiento. En semanas difíciles, una prueba visible vale más que un plan ambicioso.',
  }),
  'vocePrimeiro:52': Object.freeze({ // Uma gaveta em ordem
    titulo: 'Un cajón en orden',
    acao: 'Elige UN cajón o un rincón de la mesa y ordénalo durante 5 minutos, con el cronómetro puesto. Cuando suene, para.',
    porque: 'El orden en un espacio pequeño es progreso que los ojos confirman al instante — justo en un momento en que casi todo parece desordenado.',
  }),
  'vocePrimeiro:53': Object.freeze({ // Ar novo em casa
    titulo: 'Aire nuevo en casa',
    acao: 'Abre las ventanas, deja que el aire se renueve durante 5 minutos y quédate cerca de una de ellas, respirando con calma.',
    porque: 'El aire renovado en el cuarto es un cambio que el cuerpo percibe antes que la cabeza. Y abrir la casa es lo contrario de cerrarse — en gesto, no en discurso.',
  }),
  'vocePrimeiro:54': Object.freeze({ // Assunto que não é a dor
    titulo: 'Un tema que no es el dolor',
    acao: 'Manda un mensaje a alguien de confianza preguntando cómo estuvo su día — con el acuerdo contigo de no tocar el tema de la ruptura.',
    porque: 'Hay una parte de ti que vive fuera de este dolor. Sacar un tema común ejercita esa parte y muestra que sigue ahí.',
  }),
  'vocePrimeiro:55': Object.freeze({ // Resgate em miniatura
    titulo: 'Rescate en miniatura',
    acao: 'Acuérdate de algo que hacías antes de la relación y haz la versión más pequeña posible ahora: 5 páginas del libro, un garabato, un trozo de canción en el instrumento.',
    porque: 'Los intereses antiguos son territorio que siempre fue tuyo. Visitar la versión en miniatura reabre la puerta sin exigir una energía que hoy tal vez no exista.',
  }),
  'vocePrimeiro:56': Object.freeze({ // Uma foto do que está inteiro
    titulo: 'Una foto de lo que está entero',
    acao: 'Recorre el espacio donde estás y fotografía UNA cosa que te parezca bonita hoy: una luz, una planta, un rincón de la casa.',
    porque: 'Buscar belleza entrena la mirada para registrar lo que sigue en pie. La foto queda como prueba de que miraste.',
  }),
  'vocePrimeiro:57': Object.freeze({ // Memória no álbum, não no bolso
    titulo: 'El recuerdo en el álbum, no en el bolsillo',
    acao: 'Elige UN recuerdo bueno de esa relación y escríbelo en 3 líneas como máximo, como quien pega una foto en un álbum. Cierra el cuaderno enseguida.',
    porque: 'Honrar lo que fue bueno no es vivir ahí. El recuerdo guardado por decisión pesa distinto del que invade sin avisar.',
  }),

  /* ===== vontade (60) ===== */
  'vontade:0': Object.freeze({ // Perfume sem plateia
    titulo: 'Perfume sin público',
    acao: 'Ponte ahora tu perfume favorito, aunque hoy no salgas de casa. Usa el que guardas para una ocasión especial.',
    porque: 'Cuidarte sin que nadie mire entrena el placer de estar bien por cuenta propia. Esa autonomía es la base de cualquier atractivo real.',
  }),
  'vontade:1': Object.freeze({ // Três aprovações no espelho
    titulo: 'Tres aprobaciones en el espejo',
    acao: 'Quédate de pie frente al espejo dos minutos, con los hombros abiertos. Encuentra tres cosas de tu cuerpo que apruebas hoy y di cada una en voz alta.',
    porque: 'La mirada que lanzas sobre ti aparece en la forma en que entras a una sala. Aprobarse en voz alta es entrenamiento, no vanidad.',
  }),
  'vontade:2': Object.freeze({ // Roupa boa em dia comum
    titulo: 'Buena ropa en un día común',
    acao: 'Ponte hoy esa prenda que reservas \'para una ocasión\'. La ocasión es el día de hoy, aunque sea solo para ir a la panadería.',
    porque: 'Guardar lo mejor para después le enseña al cuerpo a vivir en modo de espera. Quien quiere reconquistar necesita salir de ese modo primero consigo.',
  }),
  'vontade:3': Object.freeze({ // Foto para o próprio arquivo
    titulo: 'Una foto para tu propio archivo',
    acao: 'Busca una buena luz y tómate una foto, solo para ti. Repite hasta que una te guste — y no la publiques.',
    porque: 'Descubrir tu propio ángulo es conocimiento sobre ti, no exhibición. La foto que nadie ve quita la presión y deja solo el aprendizaje.',
  }),
  'vontade:4': Object.freeze({ // Dez minutos de coluna
    titulo: 'Diez minutos de columna',
    acao: 'Pon un temporizador de diez minutos y mantén la columna erguida y los hombros hacia atrás mientras haces cualquier tarea. Cuando el cuerpo se desplome, reacomódate sin criticarte.',
    porque: 'La postura es el lenguaje que habla antes de cualquier palabra. Diez minutos al día le enseñan al cuerpo un patrón nuevo.',
  }),
  'vontade:5': Object.freeze({ // Uma música, porta fechada
    titulo: 'Una canción, puerta cerrada',
    acao: 'Cierra la puerta, elige una canción que te mueva algo y baila de principio a fin. Sin paso correcto, sin espejo: solo el cuerpo respondiendo al sonido.',
    porque: 'Bailar sin público le devuelve al cuerpo el derecho a sentir placer al moverse. Es desde ahí que renace la presencia física.',
  }),
  'vontade:6': Object.freeze({ // Caminhada de queixo erguido
    titulo: 'Caminata con el mentón en alto',
    acao: 'Sal de casa y camina diez minutos con el mentón paralelo al suelo. Al cruzarte con alguien, sostén la mirada un segundo antes de seguir.',
    porque: 'Quien camina mirando el suelo comunica derrota. Sostener la mirada del mundo es un músculo que se fortalece en la calle.',
  }),
  'vontade:7': Object.freeze({ // Banho de presença
    titulo: 'Ducha de presencia',
    acao: 'En la ducha de hoy, pasa los dos primeros minutos solo sintiendo el agua tocar la piel, sin pensar en la lista del día. Cuando la cabeza se escape, vuelve al agua.',
    porque: 'El deseo vive en el cuerpo, no en la cabeza. Volver a habitar tu propia piel es el primer paso para despertar lo que estaba en silencio.',
  }),
  'vontade:8': Object.freeze({ // Hidratante sem pressa
    titulo: 'Crema sin prisa',
    acao: 'Después de la ducha, ponte crema en el cuerpo con el doble de lentitud que de costumbre. Presta atención al tacto de tus propias manos.',
    porque: 'Tocar tu propio cuerpo con cuidado enseña que esta piel merece atención. Quien se trata así transmite otro tipo de presencia.',
  }),
  'vontade:9': Object.freeze({ // Playlist que acorda
    titulo: 'Una lista que despierta',
    acao: 'Arma una lista de reproducción con cinco canciones que despierten algo en ti: deseo, coraje, ganas de arreglarte. Escucha la primera ahora, al volumen que la canción pide.',
    porque: 'La música es un atajo directo al estado del cuerpo. Tener ese atajo a mano es poder despertar tus propias ganas cualquier día.',
  }),
  'vontade:10': Object.freeze({ // Marque o cuidado
    titulo: 'Agenda el cuidado',
    acao: 'Toma el teléfono ahora y agenda una cita para cuidar tu cabello como te gusta. Esta semana, no \'cuando se pueda\'.',
    porque: 'La apariencia con placer es distinta de la apariencia por obligación. Agendar convierte la intención en un compromiso contigo.',
  }),
  'vontade:11': Object.freeze({ // Mesa posta para você
    titulo: 'La mesa puesta para ti',
    acao: 'Prepara la próxima comida como si recibieras a alguien importante: un plato bonito, la mesa limpia, el celular lejos. La visita eres tú.',
    porque: 'La manera en que te sirves revela el valor que te das. Elevar ese nivel en casa cambia cómo te presentas en el mundo.',
  }),
  'vontade:12': Object.freeze({ // Três peças fora
    titulo: 'Tres prendas afuera',
    acao: 'Abre el armario y separa tres prendas que usas sin gustarte, por costumbre o por obligación. Ponlas hoy en la bolsa de donación.',
    porque: 'La ropa que toleras comunica tolerancia contigo. Quedarte solo con lo que te gusta es un filtro diario de autorrespeto.',
  }),
  'vontade:13': Object.freeze({ // Um minuto de olhar
    titulo: 'Un minuto de mirada',
    acao: 'Frente al espejo, sostén tu propia mirada un minuto entero, sin desviarla y sin hacer gestos. Respira y solo quédate.',
    porque: 'Quien no sostiene su propia mirada difícilmente sostiene la de otra persona. Ese minuto es entrenamiento de presencia en el nivel más básico.',
  }),
  'vontade:14': Object.freeze({ // Café fora, sem celular
    titulo: 'Un café fuera, sin celular',
    acao: 'Ve a una panadería o una cafetería, pide algo y ocupa una mesa. Deja el celular guardado diez minutos y solo observa el movimiento.',
    porque: 'Estar en público en tu propia compañía, sin escudo, es ejercicio de presencia. El mundo nota a quien ocupa su lugar por completo.',
  }),
  'vontade:15': Object.freeze({ // Memória de auge
    titulo: 'Memoria de tu mejor momento',
    acao: 'Escribe en tres frases un momento en que te sentiste en tu mejor forma: la ropa, el lugar, la sensación en el cuerpo. Guarda el papel en un lugar visible.',
    porque: 'Tu mejor momento no es invención: ya pasó y es tuyo. Revisitar ese recuerdo le recuerda al cuerpo un estado que ya le pertenece.',
  }),
  'vontade:16': Object.freeze({ // Roupa de dormir digna
    titulo: 'Ropa de dormir digna',
    acao: 'Separa hoy algo que te parezca bonito para dormir y jubila la prenda gastada de siempre. Ponte la nueva elección esta noche.',
    porque: 'El cuidado que nadie ve es el más honesto. Terminar el día con esmero refuerza que el nivel subió por ti, no para los demás.',
  }),
  'vontade:17': Object.freeze({ // Lençóis de recomeço
    titulo: 'Sábanas de recomienzo',
    acao: 'Cambia hoy la ropa de cama. En la noche, acuéstate temprano y siente la tela limpia contra la piel un minuto antes de tomar el celular.',
    porque: 'El placer se reaprende en los detalles pequeños y concretos. Una cama buena es un recordatorio diario de que sentirse bien está permitido.',
  }),
  'vontade:18': Object.freeze({ // Alongamento de despertar
    titulo: 'Estiramiento al despertar',
    acao: 'Al despertar mañana, antes del celular, estira el cuerpo tres minutos: brazos, columna, cuello. Nota dónde el cuerpo lo agradece.',
    porque: 'Empezar el día habitando el cuerpo, y no la pantalla, cambia la postura de las horas siguientes. La presencia física se construye en la mañana.',
  }),
  'vontade:19': Object.freeze({ // A própria voz
    titulo: 'Tu propia voz',
    acao: 'Graba un audio de un minuto leyendo un trozo de algo que te guste. Escúchalo después y apunta una cosa que te agrade en tu voz.',
    porque: 'La voz es parte de la atracción y casi nadie escucha la propia. Conocer lo que suena bien en ti es herramienta, no vanidad.',
  }),
  'vontade:20': Object.freeze({ // Cheiro de casa viva
    titulo: 'Olor a casa viva',
    acao: 'Abre las ventanas y elige un olor para la casa hoy: café recién hecho, una vela, un condimento en la estufa. Uno solo, elegido a propósito.',
    porque: 'El ambiente te repite tu historia todos los días. Una casa con un olor elegido dice que ahí hay vida.',
  }),
  'vontade:21': Object.freeze({ // Convite no calendário
    titulo: 'Una cita en el calendario',
    acao: 'Agenda ahora, en el calendario, un plan de dos: tú y tú. Cine, mercado, caminata, un concierto — apunta día y hora como compromiso firme.',
    porque: 'Quien espera compañía para vivir entrega el timón de su propia vida. Salir por voluntad propia devuelve el mando de la agenda y del deseo.',
  }),
  'vontade:22': Object.freeze({ // Elogio por escrito
    titulo: 'Un elogio por escrito',
    acao: 'Escribe tres cualidades tuyas que hacen buena tu compañía — cosas concretas, con ejemplo. Nada de modestia en esta lista.',
    porque: 'Reconquistar empieza por saber lo que tú traes a la mesa. Quien enumera su propio valor conversa de otra manera.',
  }),
  'vontade:23': Object.freeze({ // Andar mais devagar
    titulo: 'Caminar más despacio',
    acao: 'En la próxima salida, reduce el paso a propósito durante cinco minutos. Siente el suelo, mira las fachadas, ocupa el espacio sin prisa.',
    porque: 'La prisa comunica huida; la calma comunica dominio. Caminar como quien tiene tiempo cambia la forma en que el cuerpo se presenta.',
  }),
  'vontade:24': Object.freeze({ // Bebida de capricho
    titulo: 'Una bebida con esmero',
    acao: 'Prepárate una bebida con esmero: un café filtrado con calma, un té en la taza buena, un jugo recién hecho. Sírvelo en el mejor vaso de la casa y bébelo sin pantallas cerca.',
    porque: 'Los pequeños lujos diarios enseñan que el placer no depende de una fecha especial. Quien se sirve bien aprende a recibirse bien.',
  }),
  'vontade:25': Object.freeze({ // Peça que representa
    titulo: 'La prenda que te representa',
    acao: 'Elige en el armario la prenda que más se parece a quien eres hoy y arma un conjunto alrededor de ella para esta semana. Déjalo todo listo en el gancho.',
    porque: 'Vestir el presente, y no el pasado, alinea imagen y verdad. Esa coherencia se nota de lejos.',
  }),
  'vontade:26': Object.freeze({ // Gaveta íntima em ordem
    titulo: 'El cajón íntimo en orden',
    acao: 'Abre el cajón de la ropa interior y descarta lo que esté viejo o sin forma. Quédate solo con lo que te gusta usar.',
    porque: 'Lo que nadie ve define el tono de lo que todos ven. Cuidar la primera capa es autorrespeto en la raíz.',
  }),
  'vontade:27': Object.freeze({ // Espelho antes de sair
    titulo: 'El espejo antes de salir',
    acao: 'Antes de salir hoy, detente frente al espejo treinta segundos y ajusta una cosa: el cuello de la camisa, el pelo, la postura. Sal solo después de aprobar la imagen.',
    porque: 'Ese medio minuto es la diferencia entre salir en automático y salir con intención. La aprobación propia en la puerta cambia el resto del día.',
  }),
  'vontade:28': Object.freeze({ // Corpo no sol
    titulo: 'El cuerpo al sol',
    acao: 'Lleva el cuerpo a diez minutos de sol y aire libre hoy, sin audífonos y sin pantalla. Solo tú, la luz y la calle.',
    porque: 'El sol en la piel y la calle en el pulmón sacan al cuerpo del modo de espera. La presencia empieza en lo físico.',
  }),
  'vontade:29': Object.freeze({ // Assinatura de presença
    titulo: 'Una firma de presencia',
    acao: 'Elige un detalle para que sea tu marca: el perfume, el anillo, la pluma buena, el pañuelo. Úsalo hoy y repítelo mañana.',
    porque: 'Un detalle constante crea identidad. Antes de que alguien lo note, eres tú quien empieza a reconocerse en ese detalle.',
  }),
  'vontade:30': Object.freeze({ // O detalhe secreto
    titulo: 'El detalle secreto',
    acao: 'Lleva hoy un detalle que solo tú sabes que está ahí: el perfume en un punto escondido, la prenda favorita debajo de la ropa común.',
    porque: 'Cargar un secreto sensorial cambia la forma en que ocupas cualquier sala — y nadie necesita saber el motivo.',
  }),
  'vontade:31': Object.freeze({ // Dois minutos de espelho
    titulo: 'Dos minutos de espejo',
    acao: 'Mírate a los ojos en el espejo durante 2 minutos, sin arreglar nada, sin desviar la mirada.',
    porque: 'Sostener tu propia mirada es entrenamiento directo de presencia; quien aguanta la propia mirada duda menos frente a cualquier otra.',
  }),
  'vontade:32': Object.freeze({ // A frase não enviada
    titulo: 'La frase no enviada',
    acao: 'Cuando apriete las ganas de mandar un mensaje, escribe la frase exacta en un papel, dóblalo en cuatro y guárdalo en un frasco.',
    porque: 'El deseo escrito a mano pierde la urgencia sin perder el calor — y sigue siendo tuyo, no de la bandeja de salida.',
  }),
  'vontade:33': Object.freeze({ // Jantar de louça boa
    titulo: 'Cena con la loza buena',
    acao: 'Sirve la comida de hoy en la mejor loza de la casa, con los cubiertos acomodados, aunque estés sin compañía.',
    porque: 'La forma en que te sirves te cuenta, a ti, cuánto vales — antes de cualquier público.',
  }),
  'vontade:34': Object.freeze({ // O gesto mais lento
    titulo: 'El gesto más lento',
    acao: 'Ponte crema en las manos durante 3 minutos, dedo por dedo, sin ninguna prisa.',
    porque: 'El cariño no necesita venir de fuera para ser real; el cuerpo registra quién lo trata bien.',
  }),
  'vontade:35': Object.freeze({ // Mapa do prazer
    titulo: 'El mapa del placer',
    acao: 'Escribe una lista con 5 sensaciones físicas que amas: el sol en la piel, el olor a lluvia, lo que sea verdad para ti.',
    porque: 'Nadie seduce sin conocer su propio mapa — y el tuyo empieza en ti.',
  }),
  'vontade:36': Object.freeze({ // Voz em voz alta
    titulo: 'La voz en voz alta',
    acao: 'Elige un párrafo bonito de cualquier libro y léelo en voz alta, despacio, en un tono más grave que el habitual.',
    porque: 'La voz es instrumento de presencia, y un instrumento se afina usándolo.',
  }),
  'vontade:37': Object.freeze({ // A fruta com a mão
    titulo: 'La fruta con la mano',
    acao: 'Come una fruta madura con la mano, junto al lavabo, sin cubiertos y sin prisa, prestando atención al olor y a la textura.',
    porque: 'Un placer pequeño vivido por completo entrena al cuerpo a estar donde está — y la presencia es exactamente eso.',
  }),
  'vontade:38': Object.freeze({ // Rua em câmera lenta
    titulo: 'La calle en cámara lenta',
    acao: 'Camina una cuadra mucho más despacio que de costumbre, hombros abiertos, mirando por encima de la línea de los ojos.',
    porque: 'El ritmo del paso cambia el estado interno; un cuerpo desacelerado transmite otro mensaje — primero para ti.',
  }),
  'vontade:39': Object.freeze({ // Inventário de elogios
    titulo: 'Inventario de elogios',
    acao: 'Escribe 3 elogios que hayas recibido en la vida y que, en el fondo, sabes que son verdad.',
    porque: 'Recordar lo que ya es tuyo sostiene el encanto sin depender de una aprobación nueva.',
  }),
  'vontade:40': Object.freeze({ // Cenário do quarto
    titulo: 'El escenario del cuarto',
    acao: 'Arregla la mesita de noche como un pequeño escenario: durante 5 minutos, deja ahí solo lo que sea bonito o útil.',
    porque: 'El espacio donde duermes cuenta una historia — y la pluma está en tu mano.',
  }),
  'vontade:41': Object.freeze({ // A palavra intraduzível
    titulo: 'La palabra intraducible',
    acao: 'Busca una palabra de otro idioma que nombre un tipo de deseo o de falta, y apúntala en un papel junto con la definición.',
    porque: 'Cuanto más vocabulario tiene el deseo, menos espacio le queda para volverse ansiedad.',
  }),
  'vontade:42': Object.freeze({ // Vestir a noite
    titulo: 'Vestir la noche',
    acao: 'Cámbiate de ropa para la cena de hoy, aunque te quedes en casa, como si la noche lo mereciera.',
    porque: 'El rito marca valor; tu noche no necesita público para ser especial.',
  }),
  'vontade:43': Object.freeze({ // Três linhas de toque
    titulo: 'Tres líneas de tacto',
    acao: 'Escribe tres líneas sobre el tacto que más te gusta recibir — sin mencionar nombres.',
    porque: 'Nombrar tu propio gusto es el primer paso de cualquier conversación que algún día valga la pena tener.',
  }),
  'vontade:44': Object.freeze({ // Banho à luz de vela
    titulo: 'Ducha a la luz de una vela',
    acao: 'Dúchate hoy con la luz apagada y una vela encendida en un rincón seguro del baño.',
    porque: 'La oscuridad y el calor devuelven el cuerpo a los sentidos — y el deseo vive en los sentidos.',
  }),
  'vontade:45': Object.freeze({ // O que não entra mais
    titulo: 'Lo que ya no entra',
    acao: 'Escribe 3 comportamientos que ya no aceptas en quien se acerca. Guarda la lista donde solo tú la encuentres.',
    porque: 'El deseo con criterio es otra cosa; quien sabe lo que no quiere conversa distinto.',
  }),
  'vontade:46': Object.freeze({ // Cinco ângulos
    titulo: 'Cinco ángulos',
    acao: 'Tómate cinco fotos en luces diferentes, solo para ti, y fíjate en qué luz te gusta más. Borra el resto si quieres.',
    porque: 'Conocer tu propia imagen desarma el miedo que le tienes.',
  }),
  'vontade:47': Object.freeze({ // Flor de uma haste
    titulo: 'Una flor de un solo tallo',
    acao: 'Compra o corta una sola flor y ponla en un vaso en el lugar donde más pasas el día.',
    porque: 'La belleza puesta por ti, para ti, es una declaración silenciosa de cómo eliges vivir.',
  }),
  'vontade:48': Object.freeze({ // Sobremesa de colher pequena
    titulo: 'Un postre de cuchara pequeña',
    acao: 'Come un postre con la cuchara más pequeña de la casa, despacio, con los ojos cerrados en la primera cucharada.',
    porque: 'Alargar el placer es una habilidad — y la habilidad se entrena en lo dulce.',
  }),
  'vontade:49': Object.freeze({ // Perfume para dormir
    titulo: 'Perfume para dormir',
    acao: 'Antes de acostarte, ponte tu perfume favorito, aunque no salgas, aunque no haya nadie para sentirlo.',
    porque: 'El olor es memoria; dormir con tu propio olor favorito enseña que el placer también es para ti, no solo para los demás.',
  }),
  'vontade:50': Object.freeze({ // Espreguiçar por inteiro
    titulo: 'Estirarse por completo',
    acao: 'Al levantarte de la silla hoy, estira el cuerpo entero durante un minuto, con sonido y todo. Repítelo dos veces más a lo largo del día.',
    porque: 'El cuerpo que se permite ocupar espacio en casa ocupa espacio afuera también.',
  }),
  'vontade:51': Object.freeze({ // Bilhete no espelho
    titulo: 'Una nota en el espejo',
    acao: 'Escribe una nota corta para tu yo de mañana y pégala en el espejo: una frase de quien trata bien a quien ama.',
    porque: 'Tú despiertas antes que cualquier otra persona de tu vida — y la primera voz del día importa.',
  }),
  'vontade:52': Object.freeze({ // Assinatura de cheiro
    titulo: 'Una firma de olor',
    acao: 'Elige un olor para un cuarto de la casa — una vela, incienso, café recién hecho — y prepáralo ahora, con calma.',
    porque: 'Una casa con firma sensorial se vuelve refugio, y el deseo crece mejor en quien tiene dónde descansar.',
  }),
  'vontade:53': Object.freeze({ // Janela e pele
    titulo: 'Ventana y piel',
    acao: 'Abre la ventana y deja que el aire o el sol te toquen la cara durante 5 minutos, con los ojos cerrados, sin hacer nada más.',
    porque: 'La piel despierta es antena; la presencia empieza en la superficie del cuerpo.',
  }),
  'vontade:54': Object.freeze({ // A apresentação de uma frase
    titulo: 'La presentación de una frase',
    acao: 'Di en voz alta, al espejo, quién eres hoy — en una sola frase, sin mencionar a esa persona.',
    porque: 'Quien consigue presentarse sin explicarse carga otra postura el resto del día.',
  }),
  'vontade:55': Object.freeze({ // Gaveta íntima
    titulo: 'El cajón íntimo',
    acao: 'Ordena durante 10 minutos el cajón de la ropa que nadie ve. Separa para donar lo que ya no te representa.',
    porque: 'El cuidado de lo que es invisible para los demás es el termómetro más honesto del propio valor.',
  }),
  'vontade:56': Object.freeze({ // O riso mapeado
    titulo: 'La risa mapeada',
    acao: 'Apunta 3 momentos de este año en que te reíste de verdad, con quién y de qué.',
    porque: 'Recordar tu propia risa reenciende la parte de ti que es buena de tener cerca.',
  }),
  'vontade:57': Object.freeze({ // Postura de parede
    titulo: 'Postura de pared',
    acao: 'Apoya la espalda, los hombros y la cabeza en la pared durante 2 minutos, respirando despacio. Después sal caminando como estabas ahí.',
    porque: 'El cuerpo alineado comunica antes de cualquier palabra — incluso para ti.',
  }),
  'vontade:58': Object.freeze({ // Beleza que ninguém viu
    titulo: 'La belleza que nadie vio',
    acao: 'Sal a la calle y fotografía una cosa bonita en la que nunca te habías fijado.',
    porque: 'Entrenar la mirada para la belleza cambia el tema que cargas — y quien se fija en el mundo tiene más que ofrecer en una conversación.',
  }),
  'vontade:59': Object.freeze({ // Chá de ritual completo
    titulo: 'Un té de ritual completo',
    acao: 'Prepara un té prestando atención a cada etapa: el agua, el vapor, el olor, la primera taza. Ocho minutos solo de eso.',
    porque: 'Hacer una cosa a la vez, con los sentidos encendidos, es la forma más simple de volver a ti.',
  }),

  /* ===== voz (57) ===== */
  'voz:0': Object.freeze({ // Escuta de dois minutos
    titulo: 'Escucha de dos minutos',
    acao: 'Elige hoy a alguien de confianza y pídele que te cuente algo de su día. Escucha dos minutos sin interrumpir y, al final, resume con tus palabras lo que oíste.',
    porque: 'Escuchar sin atropellar es el cimiento de cualquier conversación difícil. Entrenar con quien es ligero prepara el terreno para cuando la conversación importa más.',
  }),
  'voz:1': Object.freeze({ // Reescreva sem enviar
    titulo: 'Reescribe sin enviar',
    acao: 'Abre un mensaje antiguo tuyo de un momento de pelea. Reescribe en un borrador la versión que mandarías hoy, con calma, y no envíes nada.',
    porque: 'Ver tu propio mensaje desde fuera muestra lo que el calor escondió en el momento. Quien reconoce su propio patrón puede elegir distinto en la próxima conversación.',
  }),
  'voz:2': Object.freeze({ // Diga um não
    titulo: 'Di un no',
    acao: 'Rechaza hoy un pedido pequeño que normalmente aceptas por obligación. Di no con educación, en una frase, sin apilar disculpas.',
    porque: 'Quien solo dice sí acumula silencio y resentimiento. Un no dicho con respeto entrena la voz que faltó en conversaciones importantes.',
  }),
  'voz:3': Object.freeze({ // Elogio específico
    titulo: 'Un elogio específico',
    acao: 'Elogia a alguien de tu día por algo concreto que hizo, no por algo genérico. Cambia el \'eres buena gente\' por un \'me gustó cómo resolviste aquello\'.',
    porque: 'El elogio vago se escurre; el elogio concreto se queda. Notar detalles en los demás entrena la mirada que toda relación pide.',
  }),
  'voz:4': Object.freeze({ // Três segundos de pausa
    titulo: 'Tres segundos de pausa',
    acao: 'En todas las conversaciones de hoy, respira una vez antes de responder. Cuenta tres segundos en silencio y solo entonces habla.',
    porque: 'La pausa separa la reacción de la respuesta. Ese espacio pequeño cambia el tono de una conversación entera.',
  }),
  'voz:5': Object.freeze({ // Pergunta que abre
    titulo: 'Una pregunta que abre',
    acao: 'Hazle hoy a alguien una pregunta que no se responda con sí o no. Después quédate en silencio y deja que la respuesta venga entera.',
    porque: 'La pregunta abierta invita; la cerrada cierra. Dominar esa diferencia cambia la calidad de cualquier conversación.',
  }),
  'voz:6': Object.freeze({ // Ouça a discordância
    titulo: 'Escucha el desacuerdo',
    acao: 'Pregúntale a alguien su opinión sobre un tema en el que no están de acuerdo. Solo escucha hasta el final, sin rebatir, y agradece.',
    porque: 'Escuchar sin rebatir es raro y desarma. Entrenarlo en terreno neutral fortalece el mismo músculo que exige una conversación delicada.',
  }),
  'voz:7': Object.freeze({ // Grave a própria voz
    titulo: 'Graba tu propia voz',
    acao: 'Graba un audio de un minuto contando cómo estuvo tu día. Escúchalo después y apunta una cosa de tu tono que te gustó y una que quieres ajustar.',
    porque: 'Nadie escucha su propio tono en el momento en que habla. Oírlo desde fuera revela lo que llega al oído de quien recibe.',
  }),
  'voz:8': Object.freeze({ // Da queixa ao pedido
    titulo: 'De la queja al pedido',
    acao: 'Toma una queja tuya que empiece con \'tú nunca\' o \'tú siempre\'. Reescríbela en papel como un pedido que empiece con \'yo necesito\' o \'yo quisiera\'.',
    porque: 'La queja señala con el dedo; el pedido abre la puerta. Cambiar la forma cambia lo que la otra persona alcanza a oír.',
  }),
  'voz:9': Object.freeze({ // Corte o 'mas'
    titulo: 'Corta el \'pero\'',
    acao: 'Elige un mensaje antiguo tuyo y reescríbelo sin usar la palabra \'pero\'. Lee las dos versiones en voz alta y nota la diferencia.',
    porque: 'El \'pero\' borra todo lo que viene antes de él. Darte cuenta de eso en el papel afina lo que sale por la boca.',
  }),
  'voz:10': Object.freeze({ // Nomeie o sentimento
    titulo: 'Nombra el sentimiento',
    acao: 'Escribe tres frases que empiecen con \'Yo siento\' sobre tu semana. Sin justificar, sin culpar, solo nombrar.',
    porque: 'Un sentimiento sin nombre se vuelve tono de voz cargado. Quien nombra lo que siente habla con más claridad y menos púas.',
  }),
  'voz:11': Object.freeze({ // Conversa sem tela
    titulo: 'Conversación sin pantalla',
    acao: 'En una conversación en persona hoy, deja el celular fuera de alcance y mantén la mirada en quien habla. Sostenla hasta el final.',
    porque: 'La atención entera es el elogio más concreto que existe. Cuando alguien percibe que tiene tu atención completa, la conversación cambia de nivel.',
  }),
  'voz:12': Object.freeze({ // Repita com suas palavras
    titulo: 'Repite con tus palabras',
    acao: 'En una conversación de hoy, antes de dar tu opinión, resume lo que la otra persona dijo: \'déjame ver si entendí\'. Solo después responde.',
    porque: 'Resumir muestra que escuchaste de verdad. Es una de las herramientas más simples y más raras de una conversación.',
  }),
  'voz:13': Object.freeze({ // Deixe o silêncio
    titulo: 'Deja el silencio',
    acao: 'En una conversación hoy, cuando aparezca una pausa, no corras a llenarla. Cuenta hasta diez en silencio y observa qué pasa.',
    porque: 'El silencio cómodo es señal de presencia, no de vacío. Quien aguanta la pausa le da espacio a la otra persona para ir más al fondo.',
  }),
  'voz:14': Object.freeze({ // Peça um espelho
    titulo: 'Pide un espejo',
    acao: 'Pregúntale a una persona de confianza: \'¿cómo es conversar conmigo?\'. Escucha la respuesta entera sin defenderte y agradece.',
    porque: 'Nadie ve su propia manera de conversar. Un espejo honesto que viene de fuera vale más que cualquier suposición.',
  }),
  'voz:15': Object.freeze({ // Mapa dos gatilhos
    titulo: 'El mapa de los disparadores',
    acao: 'Escribe tres frases que suelen sacarte de quicio en una discusión. Al lado de cada una, escribe una respuesta posible dicha con calma.',
    porque: 'Un disparador conocido pierde fuerza. Quien ensaya la respuesta calmada antes no depende de la improvisación en el calor.',
  }),
  'voz:16': Object.freeze({ // Desculpa sem 'mas'
    titulo: 'Una disculpa sin \'pero\'',
    acao: 'Escribe en un borrador una disculpa de tres frases por algo real, sin usar \'pero\' y sin justificarte. No la envíes; solo guárdala.',
    porque: 'La disculpa con justificación cobra recibo. Escribir la versión limpia enseña cómo suena asumir de verdad.',
  }),
  'voz:17': Object.freeze({ // Agradeça pelo nome
    titulo: 'Agradece por el nombre',
    acao: 'Agradece hoy a alguien que te atendió — en la caja, en el mostrador, en la conserjería — mirando a los ojos y usando su nombre, si lo sabes.',
    porque: 'La amabilidad dirigida entrena la presencia en las interacciones pequeñas. Quien la practica en lo cotidiano la lleva a las conversaciones que pesan.',
  }),
  'voz:18': Object.freeze({ // Leia como quem recebe
    titulo: 'Lee como quien recibe',
    acao: 'Relee una conversación antigua con esa persona y lee tus propios mensajes en voz alta, como si estuvieras recibiendo cada uno.',
    porque: 'Leer desde el otro lado de la pantalla muestra el tono que pasó desapercibido al enviar. Esa incomodidad enseña más que cualquier consejo.',
  }),
  'voz:19': Object.freeze({ // Peça sem rodeio
    titulo: 'Pide sin rodeos',
    acao: 'Pídele hoy algo directamente a alguien, en una frase, sin indirectas y sin rodeos del tipo \'quizá alguien podría\'. Observa cómo se recibe la claridad.',
    porque: 'Un pedido claro respeta a quien escucha y a quien habla. La indirecta acumula frustración en los dos lados.',
  }),
  'voz:20': Object.freeze({ // Releia antes de responder
    titulo: 'Relee antes de responder',
    acao: 'Si hoy llega un mensaje de esa persona, léelo dos veces antes de escribir. Responde corto, con calma, solo lo que te preguntaron.',
    porque: 'Una respuesta apresurada carga el tono equivocado con facilidad. La calma en la respuesta muestra el cambio sin necesidad de anunciarlo.',
  }),
  'voz:21': Object.freeze({ // Pergunta leve e aberta
    titulo: 'Una pregunta ligera y abierta',
    acao: 'Mándale a esa persona una pregunta abierta sobre un interés que tenga — la serie, el equipo, el proyecto. Una sola pregunta, sin reclamo y sin añadidos.',
    porque: 'Una pregunta ligera abre el canal sin presionar. El interés genuino por el mundo de la persona habla más alto que cualquier discurso.',
  }),
  'voz:22': Object.freeze({ // Dois minutos sem interromper
    titulo: 'Dos minutos sin interrumpir',
    acao: 'Si hoy conversan, deja que esa persona hable dos minutos enteros sin cortarla. Al final, resume con tus palabras lo que oíste.',
    porque: 'La escucha entera es rara y quien la recibe lo percibe al instante. El resumen muestra que estuviste presente, no solo en silencio.',
  }),
  'voz:23': Object.freeze({ // Agradecimento concreto
    titulo: 'Un agradecimiento concreto',
    acao: 'Agradece a esa persona por algo concreto y reciente, en una sola frase. Envíalo y no añadas nada más.',
    porque: 'La gratitud puntual no cobra respuesta ni reabre el pasado. Es un gesto pequeño que muestra atención al presente.',
  }),
  'voz:24': Object.freeze({ // Zero ironia hoje
    titulo: 'Cero ironía hoy',
    acao: 'Al hablar hoy con esa persona, revisa cada mensaje antes de enviarlo y corta cualquier ironía o indirecta. Si queda una púa, reescríbelo.',
    porque: 'La ironía es pelea disfrazada de broma. Quitarle la púa a la frase le quita el veneno a la conversación.',
  }),
  'voz:25': Object.freeze({ // Valide antes de opinar
    titulo: 'Valida antes de opinar',
    acao: 'En la próxima conversación con esa persona, cuando algo tenga sentido, dilo antes de dar tu visión: \'entiendo lo que quieres decir\'. Solo entonces completa.',
    porque: 'Validar primero baja la guardia de cualquier conversación. Una opinión que llega después de la escucha encuentra otro oído.',
  }),
  'voz:26': Object.freeze({ // Compartilhe algo leve
    titulo: 'Comparte algo ligero',
    acao: 'Mándale a esa persona algo ligero ligado a un gusto en común — un video, una foto, una noticia. Sin pregunta de por medio, sin esperar respuesta.',
    porque: 'Un gesto ligero sin reclamo recuerda los puntos buenos de la conexión. La ausencia de expectativa es lo que vuelve seguro el gesto.',
  }),
  'voz:27': Object.freeze({ // Deixa eu ver se entendi
    titulo: 'Déjame ver si entendí',
    acao: 'Si esa persona se desahoga o te explica algo hoy, responde empezando con \'déjame ver si entendí\' y resume antes de cualquier opinión.',
    porque: 'Un resumen bien hecho es escucha visible. Pocas cosas cambian tanto el clima de una conversación como notar que el mensaje llegó entero.',
  }),
  'voz:28': Object.freeze({ // Encerre no ponto bom
    titulo: 'Cierra en el punto bueno',
    acao: 'Si hoy la conversación con esa persona está ligera, ciérrala mientras está bien. Despídete con una frase simple y no la estires.',
    porque: 'Una conversación que termina bien deja ganas de otra. Estirarla hasta que se agrie deshace lo que construyó la ligereza.',
  }),
  'voz:29': Object.freeze({ // Responda no seu tempo
    titulo: 'Responde en tu tiempo',
    acao: 'Si hoy algún mensaje de esa persona te mueve algo, no respondas en caliente. Espera a que baje, relee y responde cuando vuelva la calma — hoy mismo, si se puede.',
    porque: 'Un mensaje escrito con rabia se vuelve prueba contra la conversación. Responder en paz protege el canal abierto que todavía existe.',
  }),
  'voz:30': Object.freeze({ // O eco da própria voz
    titulo: 'El eco de tu propia voz',
    acao: 'Graba un audio de 2 minutos hablando de cómo te sientes hoy. Después escúchalo prestando atención solo al tono, no a las palabras.',
    porque: 'El tono que llega al oído de quien escucha casi nunca es el que imaginas mientras hablas. Oír la grabación muestra esa diferencia en la práctica.',
  }),
  'voz:31': Object.freeze({ // Rascunho sem enviar
    titulo: 'Un borrador sin enviar',
    acao: 'Escribe el mensaje que te gustaría mandarle a esa persona, con todo lo que quieres decir. Guárdalo como borrador o apúntalo en papel. No lo envíes.',
    porque: 'Ponerlo en palabras ordena lo que está revuelto por dentro — y decidir después, con la cabeza fría, es distinto de decidir por impulso.',
  }),
  'voz:32': Object.freeze({ // Contagem de perguntas
    titulo: 'Conteo de preguntas',
    acao: 'Relee las últimas conversaciones que tuviste con esa persona (los mensajes antiguos sirven). Cuenta: cuántas preguntas hiciste y cuántas afirmaciones.',
    porque: 'Preguntar y afirmar crean conversaciones diferentes. Ver la proporción en blanco y negro muestra cuál de las dos has estado alimentando.',
  }),
  'voz:33': Object.freeze({ // Cinco sons
    titulo: 'Cinco sonidos',
    acao: 'Quédate 3 minutos en silencio, con los ojos cerrados, e identifica 5 sonidos diferentes a tu alrededor. Apunta los cinco.',
    porque: 'La escucha es atención entrenable — y es más fácil empezar el entrenamiento con sonidos que con personas.',
  }),
  'voz:34': Object.freeze({ // Reescrita gentil
    titulo: 'Reescritura amable',
    acao: 'Acuérdate de una frase que dijiste hace poco en un tono más duro de lo que querías. Escribe la frase original y, debajo, una versión que diga lo mismo con más cuidado.',
    porque: 'Casi toda frase dura tiene una versión amable que carga la misma verdad. Practicar la traducción en el papel lo facilita a la hora de hablar.',
  }),
  'voz:35': Object.freeze({ // Dois minutos sem 'mas'
    titulo: 'Dos minutos sin \'pero\'',
    acao: 'Pon un cronómetro de 2 minutos y habla en voz alta de cualquier tema sin usar la palabra \'pero\'. Si se te escapa, empieza de nuevo.',
    porque: 'El \'pero\' borra todo lo que viene antes de él. Notar cuántas veces se escapa muestra cuánto domina tu manera de hablar.',
  }),
  'voz:36': Object.freeze({ // Carta de um parágrafo
    titulo: 'Una carta de un párrafo',
    acao: 'Escribe a mano, en un papel, un párrafo diciéndole a esa persona lo que nunca dijiste en voz alta. Dobla el papel y guárdalo — es solo tuyo.',
    porque: 'Escribir a mano es más lento que teclear, y la lentitud obliga a elegir cada palabra. Elegir palabras es el entrenamiento mismo de la voz.',
  }),
  'voz:37': Object.freeze({ // Ensaio no espelho
    titulo: 'Ensayo en el espejo',
    acao: 'Ponte frente al espejo y di en voz alta, durante 2 minutos, algo que necesitas decirle a alguien. Repítelo hasta que la voz salga firme.',
    porque: 'Las palabras dichas por primera vez suelen salir torcidas. Ensayar le quita el peso al estreno.',
  }),
  'voz:38': Object.freeze({ // Resposta com cabeça fria
    titulo: 'Una respuesta con la cabeza fría',
    acao: 'Encuentra un mensaje antiguo que te irritó en el momento. Reléelo ahora y escribe la respuesta que darías hoy, con calma. No hace falta enviarla.',
    porque: 'Comparar la reacción en caliente con la respuesta en frío muestra, en la práctica, lo que la pausa le hace a tus palabras.',
  }),
  'voz:39': Object.freeze({ // Mapa da defensiva
    titulo: 'El mapa de la defensiva',
    acao: 'Apunta las 3 frases que más usas cuando estás a la defensiva (del tipo \'yo nunca dije eso\' o \'tú siempre haces esto\'). Solo enumera, sin juicio.',
    porque: 'Una frase de defensa dicha en automático es difícil de frenar. Conocer las tuyas de antemano te da un segundo más para elegir otra.',
  }),
  'voz:40': Object.freeze({ // Cinco não-ditos
    titulo: 'Cinco cosas no dichas',
    acao: 'Enumera 5 cosas que sientes y nunca dijiste en voz alta a nadie. La lista es tuya, nadie necesita verla.',
    porque: 'Darle nombre a lo que sentimos es el primer paso para poder hablar de eso. Lo que no tiene nombre no tiene cómo salir de la boca.',
  }),
  'voz:41': Object.freeze({ // Áudio descartável
    titulo: 'Un audio desechable',
    acao: 'Graba un audio diciendo la cosa más difícil que tendrías para decirle a esa persona. Escúchalo una vez. Después bórralo.',
    porque: 'Decirlo en voz alta, aunque nadie escuche, es distinto de solo pensarlo. El cuerpo registra que eso es decible.',
  }),
  'voz:42': Object.freeze({ // Cinco minutos de ouvido
    titulo: 'Cinco minutos de oído',
    acao: 'Llama a alguien de confianza (no hace falta que sea la persona amada) y pasa 5 minutos solo escuchando y haciendo preguntas. Nada de contar tus novedades.',
    porque: 'Aguantar las ganas de hablar de uno mismo es el ejercicio más difícil de la escucha — y una llamada con alguien de confianza es un buen campo de entrenamiento.',
  }),
  'voz:43': Object.freeze({ // A resposta que ficou
    titulo: 'La respuesta que se quedó',
    acao: 'Acuérdate de una conversación de la que saliste pensando \'debí haber dicho otra cosa\'. Escribe ahora la respuesta que te hubiera gustado dar.',
    porque: 'La respuesta que llega tarde todavía sirve: revela lo que valoras y amplía el repertorio para la próxima conversación.',
  }),
  'voz:44': Object.freeze({ // Manual de instruções
    titulo: 'Un manual de instrucciones',
    acao: 'Escribe 3 frases que empiecen con \'conmigo funciona mejor cuando...\' sobre cómo prefieres que te hablen (tono, momento, manera).',
    porque: 'Es difícil pedir lo que nunca formulamos. Conocer tu propio manual es lo que permite, algún día, entregárselo a alguien.',
  }),
  'voz:45': Object.freeze({ // Leitura em voz alta
    titulo: 'Lectura en voz alta',
    acao: 'Antes de enviar el próximo mensaje importante, lee el texto en voz alta una vez. Si suena distinto de lo que quisiste decir, ajústalo.',
    porque: 'El texto leído en voz alta revela el tono que llega al otro lado — algo que los ojos, leyendo en silencio, no atrapan.',
  }),
  'voz:46': Object.freeze({ // O sentimento por trás da história
    titulo: 'El sentimiento detrás de la historia',
    acao: 'Mira o escucha 2 minutos de alguien contando una historia (cualquier video sirve). Después resume en una frase lo que esa persona sintió — no lo que pasó.',
    porque: 'Oír hechos es fácil; oír sentimientos es lo que crea la sensación de escucha de verdad. Entrenar con desconocidos vuelve ligero el ejercicio.',
  }),
  'voz:47': Object.freeze({ // Como foi?
    titulo: '¿Cómo estuvo?',
    acao: 'Hazle a esa persona una pregunta que empiece con \'cómo estuvo...\' (el día, la semana, aquel compromiso). Después solo escucha, sin enganchar tu propia historia.',
    porque: 'La pregunta abierta invita a la persona a extenderse; la escucha sin interrupciones muestra que la invitación era verdadera.',
  }),
  'voz:48': Object.freeze({ // A segunda pergunta
    titulo: 'La segunda pregunta',
    acao: 'Cuando esa persona te cuente cualquier cosa hoy, haz una segunda pregunta sobre lo que acabas de oír, en lugar de cambiar de tema.',
    porque: 'La primera pregunta es educación; la segunda es interés. Es en ella donde la conversación gana profundidad.',
  }),
  'voz:49': Object.freeze({ // Mensagem que termina em pergunta
    titulo: 'Un mensaje que termina en pregunta',
    acao: 'Mándale a esa persona un mensaje que termine con una pregunta abierta — algo que no se responda con sí o no.',
    porque: 'El mensaje que termina en afirmación cierra; el que termina en pregunta pasa la estafeta. La estructura cambia el rumbo de la conversación.',
  }),
  'voz:50': Object.freeze({ // Reler antes de responder
    titulo: 'Releer antes de responder',
    acao: 'En el próximo mensaje que esa persona te mande, reléelo dos veces antes de responder. En la segunda lectura, busca lo que el mensaje pide — no solo lo que dice.',
    porque: 'Muchos malentendidos nacen de responder a la primera lectura. La segunda suele encontrar otra cosa.',
  }),
  'voz:51': Object.freeze({ // Com as minhas palavras
    titulo: 'Con mis palabras',
    acao: 'En una conversación hoy, repite con tus palabras algo que esa persona dijo: \'déjame ver si entendí...\'. Después pregunta si era eso.',
    porque: 'Resumir lo que oíste es la forma más directa de mostrar presencia — y de descubrir al instante si entendiste torcido.',
  }),
  'voz:52': Object.freeze({ // O assunto favorito
    titulo: 'El tema favorito',
    acao: 'Saca un tema que esa persona ame y que normalmente tú no sacas. Haz al menos dos preguntas sobre él.',
    porque: 'Interesarse por el mundo de alguien es una forma de cuidado que no necesita palabras bonitas — solo curiosidad real.',
  }),
  'voz:53': Object.freeze({ // Elogio ao que foi dito
    titulo: 'Un elogio a lo que se dijo',
    acao: 'Elogia hoy algo que esa persona DIJO — una idea, una frase, una manera de contar. No la apariencia, no algo que hizo: algo que habló.',
    porque: 'Elogiar lo que alguien dice significa \'yo te escucho\'. Es un tipo de reconocimiento raro — la mayoría de los elogios ignora la voz.',
  }),
  'voz:54': Object.freeze({ // Três segundos
    titulo: 'Tres segundos',
    acao: 'En una conversación con esa persona hoy, espera 3 segundos completos después de que termine de hablar, antes de responder. Hazlo al menos dos veces.',
    porque: 'El silencio corto abre espacio para completar lo que quedó a medias — y mucho de lo importante viene justamente en ese complemento.',
  }),
  'voz:55': Object.freeze({ // Entendi, e...
    titulo: 'Entiendo, y...',
    acao: 'Cuando no estés de acuerdo con algo que esa persona diga hoy, empieza la respuesta con \'entiendo tu punto\' antes de dar el tuyo. Vale por escrito o en voz alta.',
    porque: 'Reconocer antes de discordar separa a la persona de la opinión. La conversación sigue siendo sobre el tema, no sobre quién gana.',
  }),
  'voz:56': Object.freeze({ // O manual dessa pessoa
    titulo: 'El manual de esa persona',
    acao: 'Pregúntale a esa persona, en un momento tranquilo: \'¿cómo prefieres que te hable cuando no estamos de acuerdo?\'. Solo escucha y agradece la respuesta.',
    porque: 'Cada persona tiene su manera de recibir una conversación difícil. Preguntar el manual, en lugar de adivinarlo, es escucha en su forma más práctica.',
  }),
  /* ================ fim do LOTE 1 ======================= */
});

export default MISSOES_ES;
