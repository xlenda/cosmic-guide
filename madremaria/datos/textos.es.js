// datos/textos.es.js
// O ESPANHOL da Madre Maria. Arquivo de UM tradutor so: quem traduz para o
// ingles trabalha em datos/textos.en.js, e ninguem dos dois mexe no portugues
// (datos/textos.js). Tres arquivos disjuntos, zero conflito de merge.
//
// ===========================================================================
// COMO PREENCHER
// ===========================================================================
// Copie a chave do PT (datos/textos.js) EXATAMENTE como ela esta, escreva o
// valor em espanhol, e siga. Nada mais:
//
//     'app.tagline': 'Tres cartas para la historia que quedo a medias',
//
// O portao de cobertura (test/madremaria-i18n.test.js) diz quantas faltam e
// nomeia as primeiras. Enquanto faltar uma, ele fica VERMELHO de proposito:
// e o placar da obra, nao um defeito. A tela nao quebra nesse meio-tempo —
// chave sem traducao cai no portugues (t() em datos/textos.js).
//
// ===========================================================================
// AS QUATRO REGRAS QUE O PORTAO COBRA
// ===========================================================================
// 1. MESMA CHAVE. Chave que nao existe no PT e erro: o portao acusa chave a
//    mais. Chave do PT que falta aqui e o que ele conta como pendencia.
// 2. MESMOS MARCADORES. `{nombre}`, `{dias}`, `{n}`, `{total}` entram no texto
//    espanhol com o NOME EM PORTUGUES intacto. Quem chama t() passa por esse
//    nome; traduzir o marcador ('{nombre}' -> '{nome}') quebra a interpolacao
//    em silencio e a pessoa ve "{nome}" literal na tela.
// 3. ARRAY CONTINUA ARRAY. Oito chaves do PT valem uma LISTA de linhas
//    ('limites.lineas', 'ritual.meses', 'privacidad.guarda.lineas',
//    'privacidad.no.lineas', 'metodo.respuestas.si.lineas',
//    'metodo.respuestas.no.lineas', 'plano.semana.nomes', 'plano.semana.em').
//    Aqui elas tambem sao array, com o MESMO numero de linhas na MESMA ordem:
//    a tela indexa por posicao (`meses[mes - 1]`, `semana[diaSemana]`).
// 4. NADA VAZIO. '' ou '   ' NAO cai no fallback: a tela renderiza em branco e
//    nada acusa. Ou traduz, ou deixa a chave de fora.
//
// ===========================================================================
// ENCANTAMENTO HONESTO — VALE EM ESPANHOL TAMBEM
// ===========================================================================
// A doutrina esta em madremaria/theme.js:80: "nunca um desfecho, nunca uma
// promessa sobre o que a outra pessoa vai fazer". O app CONVIDA; ele nunca
// garante que o amor volta.
//
// Isto NAO e uma regra sobre o portugues: e uma regra sobre o app. Uma traducao
// que promete e uma violacao NOVA, mesmo quando o original nao promete — e e
// facil de cometer sem querer, porque o espanhol de nicho amoroso tem formula
// feita para isso. Nenhuma destas entra aqui:
//
//     "volvera", "va a volver", "regresara", "te va a escribir",
//     "recuperaras", "vas a reconquistar", "en X dias", "garantizado",
//     "seguro que", "el destino lo traera"
//
// O padrao certo: descrever o que a CARTA mostra, e fechar numa acao de QUEM
// ESTA LENDO. "Esta carta muestra donde se enredo" — sim. "Esta carta muestra
// que volvera" — nunca.
//
// Tambem nao entram: prova social inventada (porcentagem de usuarias, contador
// de gente, depoimento), alegacao de saude, e suposicao do genero de quem esta
// do outro lado — use "esa persona", "quien esta del otro lado".
//
// A lista de verbos proibidos que ABORTA o build vive nos testes de copy; ela
// foi escrita contra o portugues. Um verbo espanhol de promessa pode passar por
// ela e chegar na loja. Quem traduz e o ultimo portao desta linha.

import { SUPPORT_EMAIL } from '../../lib/supportContact.js';

export const ES = {
  /* ================================================================================
   * LOTE: O FIO · A SINTESE · O RITUAL · ERROS E ESTADOS VAZIOS  (58 chaves)
   * ============================================================================= */

  /* --- LA SINTESIS (screens/SintesisScreen.js) ------------------------------------
   * Titulo y saludo vienen montados por lib/lectura.js. 'sintesis.titulo' es el
   * titulo de la pantalla Y el de la tarjeta que sale del telefono: corto, sin
   * nombre. El encabezado de HiloScreen.js:2 conserva el ES del autor para esta
   * linea — "Tu hilo, hoy" — y es ese el que entra aqui, no una traduccion nueva. */
  'sintesis.titulo': 'Tu hilo, hoy',
  'sintesis.saludo': '{nombre}, esto es lo que quedó sobre la mesa.',
  'sintesis.bloque.lectura': 'LO QUE MUESTRAN LAS TRES CARTAS',
  'sintesis.bloque.tuparte': 'LA PARTE QUE SOSTIENES TÚ',
  'sintesis.bloque.accion': 'UNA ACCIÓN PARA HOY',
  'sintesis.accionNota':
    'Esta acción es tuya y se completa sola: no necesita que nadie más haga nada.',
  'sintesis.metodo':
    'Esta es una lectura simbólica. Las cartas no saben nada de tu historia: lo que hacen es darte tres imágenes fijas —el nudo, la tensión y tu extremo— para que mires lo que es tuyo desde fuera y con otras palabras. Lo que leíste describe lo que muestra cada carta y termina en algo que puedes hacer. No es predicción, no habla por nadie más y no decide nada por ti.',
  'sintesis.cierre':
    'Hasta aquí llega la lectura, {nombre}. Lo que viene después pasa fuera de la app.',
  'sintesis.guardada': 'Guardada en Mi Hilo',

  /* --- EL HILO (screens/HiloScreen.js) --------------------------------------------
   * 'hilo.unidad' trae SOLO el plural: unidadNudos() (HiloScreen.js:316) deriva el
   * singular quitando la ultima letra. "nudos" -> "nudo" funciona; una palabra cuyo
   * plural no sea +s romperia el singular en silencio.
   * 'hilo.rachaRota' y 'hilo.record' son el par del estado quieto — constatacion y
   * patrimonio, nunca perdida ni oferta. Las dos estan citadas en espanol ORIGINAL
   * del autor en lib/hilo.js:22 y screens/HiloScreen.js:21-23; es ese texto el que
   * entra aqui. Lo mismo con 'hilo.retomar' (HiloScreen.js:684). */
  'hilo.titulo': 'Mi Hilo',
  'hilo.sub': 'Un nudo por cada día en que viniste a leer.',
  'hilo.unidad': 'nudos',
  'hilo.conteo': '{n} {unidad}',
  'hilo.hoyListo': 'El nudo de hoy ya está hecho.',
  'hilo.vacio': 'Todavía no hay nudos. El primero se hace con la lectura de hoy.',
  'hilo.rachaRota': 'El hilo no se rompió. Se quedó quieto.',
  'hilo.record': 'Tu hilo más largo sigue siendo {n}. Eso no se borra.',
  'hilo.retomar': 'Retomar donde quedó',
  'hilo.panel.albumVazio': 'El álbum empieza en tu primera lectura.',
  'hilo.panel.albumVer': 'Abrir el álbum',
  'hilo.panel.ritualTitulo': 'El ritual de siete días',
  'hilo.panel.ritualProgresso': '{n} de {total} días cerrados.',
  'hilo.panel.ritualAbrir': 'Abrir el ritual',
  'hilo.panel.fichasTitulo': 'Tus fichas',
  'hilo.panel.fichasSaldo': '{n} {unidade}',
  'hilo.panel.fichasPara': 'Abren una lectura más el mismo día, por {preco}.',

  /* --- EL RITUAL (screens/RitualScreen.js) ----------------------------------------
   * Siete dias, un paso por dia. Prohibido el apuro y el castigo: ni "solo faltan
   * tres dias", ni "no lo dejes ahora", ni cuenta atras. 'ritual.hecho.porque' dice
   * por que el dia siguiente no se adelanta, y lo dice sin cobrar nada. */
  'ritual.sobreceja': 'DÍA {n} DE {total}',
  'ritual.titulo': 'El hilo de siete días',
  'ritual.cargando': 'Un momento.',
  'ritual.carta.rotulo': 'LA CARTA DE HOY',
  'ritual.carta.sinContacto':
    'Una parte de esta carta apuntaba hacia fuera, y quedó fuera: el día de hoy se completa en ti.',
  'ritual.carta.sinFuturo':
    'Una parte de esta carta hablaba de lo que viene después, y quedó fuera: ninguna carta lee lo que todavía no pasó.',
  'ritual.carta.nota':
    'Sorteada ahora, entre los 22 arcanos mayores. Nadie eligió por ti, tampoco nosotros. Cada día sale otra.',
  'ritual.pregunta.rotulo': 'LA PREGUNTA DE HOY',
  'ritual.campo.placeholder': 'Como salga, sin arreglar la frase.',
  'ritual.campo.nota':
    'Escribir es opcional. Lo que escribas queda en este teléfono, con la fecha, y lo vuelves a leer cuando quieras.',
  'ritual.gesto.rotulo': 'EL GESTO DE HOY',
  'ritual.gesto.nota':
    'Cabe en cinco minutos y es tuyo: se completa solo, sin necesitar que nadie más haga nada.',
  'ritual.cerrar': 'Cerrar el día {n}',
  'ritual.hecho.rotulo': 'DÍA {n} CERRADO',
  'ritual.hecho.proximo': 'El siguiente es el día {n}.',
  'ritual.hecho.porque':
    'Es un paso por día, y es eso lo que hace que quepa en cinco minutos. El día {n} se queda aquí esperando, tal como está.',
  'ritual.hecho.escrito': 'LO QUE ESCRIBISTE HOY',
  'ritual.hecho.sinTexto': 'Hoy no escribiste nada. El nudo del día está dado igual.',
  'ritual.espejo.rotulo': 'LO QUE ESCRIBISTE EL DÍA {n}',
  'ritual.espejo.fecha': 'Día {n}, el {fecha}.',
  'ritual.espejo.pie':
    'Es tu texto, con la fecha en que lo escribiste. La app guarda y devuelve: no compara los dos días y no concluye nada sobre ti.',
  'ritual.espejo.sinTexto':
    'El día {n} no escribiste nada. Lo que quedó registrado es la fecha: {fecha}.',
  'ritual.fin.sobreceja': 'SIETE DE SIETE',
  'ritual.fin.titulo': 'Siete días, siete nudos.',
  'ritual.fin.cuerpo':
    'Llegó al final, y el final estaba marcado desde el día 1. Fueron siete días en los que viniste, y cada uno está con su fecha aquí abajo.',
  'ritual.fin.guardado':
    'Empezar de nuevo abre un día 1 en blanco y borra estos siete registros de este aparato. Los nudos de tu hilo no se borran.',
  'ritual.fin.reiniciar': 'Empezar de nuevo, en el día 1',
  'ritual.fecha': '{dia} de {mes}',
  'ritual.meses': [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],

  /* --- ERRORES (estados de fallo; la app asume el fallo, nunca lo devuelve como
   * culpa de quien lee) ----------------------------------------------------------- */
  'errores.guardado':
    'No se pudo guardar en este teléfono. Tu lectura sigue en la pantalla mientras no la cierres.',
  'errores.compartir': 'No se pudo abrir el compartir. Inténtalo de nuevo.',
  'errores.generico': 'Algo falló de este lado. Inténtalo de nuevo.',
  /* =========================================================================
   * LOTE 1 — A ENTRADA DO FUNIL (apresentacao, onboarding, entrada, profunda).
   * Tudo o que a pessoa ve ANTES de entrar no app. Traduzido de datos/textos.js.
   *
   * Decisoes que valem para o lote inteiro:
   *   · "tu" em todo lugar (doutrina theme.js:80, regra 7: LatAm neutro —
   *     nunca "vos", nunca "vosotros").
   *   · A outra pessoa e sempre "esa persona" / "quien esta del otro lado":
   *     nunca "el", nunca "ella" (regra 4).
   *   · Os marcadores ficam com o nome em portugues: {nombre}, {n}, {total},
   *     {ordem}. Traduzir o nome do marcador quebra t() em silencio.
   *   · Nenhuma linha diz que esa persona vuelve, escribe o regresa. O que as
   *     cartas MUESTRAN, e o passo de QUIEN LEE — nada mais.
   * ========================================================================= */

  /* --- APP ---------------------------------------------------------------- */
  'app.nombre': 'Madre María',
  /* Assinatura do app (cartao de compartilhar, SintesisScreen). "quedó a medias"
     guarda o inacabado do PT ("ficou pela metade") sem "a medio camino", que
     soaria a itinerario — e itinerario insinua destino. */
  'app.tagline': 'Tres cartas para la historia que quedó a medias',

  /* --- ONBOARDING --------------------------------------------------------- */
  'onboarding.progreso': '{n} de {total}',
  'onboarding.errorNombre': 'Escribe al menos una letra para seguir.',
  'onboarding.errorFecha':
    'Revisa el día, el mes y el año: esa fecha no existe en el calendario — o todavía no llega.',
  'onboarding.datosNo':
    'Te preguntamos tu nombre, qué pasó, tu fecha de nacimiento y cómo hablarte. Nada más: nada sobre esa persona, ninguna ubicación, ningún contacto de tu agenda. Lo que la lectura no usa, no se pide.',
  'onboarding.privacidad':
    'Todo se queda en este teléfono. No hay cuenta, no hay correo, no hay servidor.',
  'onboarding.listo': 'Listo. Tus tres cartas ya están sobre la mesa.',

  /* --- LEITURA DE ENTRADA ------------------------------------------------- */
  'entrada.sobreceja': 'TU LECTURA DE ENTRADA',
  'entrada.titulo': 'Tres cartas, leídas en voz alta',
  'entrada.saudacao': '{nombre}, tus tres cartas ya están en la mesa.',
  'entrada.saudacaoSemNome': 'Tus tres cartas ya están en la mesa.',
  'entrada.abertura':
    'Son tres cartas de la baraja gitana, una por vez. Rascas la carta con el dedo, escuchas la lectura en la voz de quien lee, y el mismo texto queda escrito justo abajo.',
  'entrada.escolha.abrir': 'Ver las cartas en la mesa',
  'entrada.comecar': 'Ver la primera carta',

  /* --- A MESA DOS SEIS VERSOS -------------------------------------------- */
  'entrada.escolha.titulo': 'Seis cartas boca abajo',
  'entrada.escolha.texto':
    'Toca tres de ellas. Se abren una por vez, en el orden en que las toques, y rascas cada una con el dedo.',
  'entrada.escolha.contagem': '{n} de {total} tocadas',
  'entrada.escolha.verso': 'Carta boca abajo, {n} de {total}. Toca para llevarte esta.',
  'entrada.escolha.versoEscolhido':
    'Carta boca abajo, {n} de {total}. Ya es tuya: fue tu número {ordem}.',

  'entrada.progresso': 'Carta {n} de {total}',
  'entrada.posicao.1': 'LA PRIMERA',
  'entrada.posicao.2': 'LA SEGUNDA',
  'entrada.posicao.3': 'LA TERCERA Y ÚLTIMA',
  'entrada.posicao.4': 'LA CARTA EXTRA',
  'entrada.posicao.5': 'LA CARTA ESTRELLA',

  /* --- A APRESENTACAO DA MADRE MARIA ------------------------------------- */
  'apresentacao.sobreceja': 'QUIÉN VA A LEER TUS CARTAS',
  'apresentacao.titulo': 'Madre María',
  /* TRANSCRICAO do video (assets/madremaria/video/madre-maria.mp4). A fala e em
     portugues; este texto e a legenda escrita que acende com a voz. O PT fecha
     em "Senta aqui comigo?" — aqui "¿Te sientas aquí conmigo?": convite, nao
     instrucao (um imperativo "siéntate" mandaria, e ela nao manda). */
  'apresentacao.texto':
    'Ya miraste el teléfono hoy. Más de una vez. Y volteaste la pantalla para abajo para fingir que no mirabas. Yo soy la Madre María. No hay vergüenza en eso. Llegaste aquí con una persona en el pensamiento. Ahora te voy a hacer algunas preguntas. Después leemos tus cartas. Y yo camino contigo por las trece lunas, un acto por día. ¿Te sientas aquí conmigo?',
  'apresentacao.video.assistir': 'Ver a la Madre María',
  'apresentacao.video.pausar': 'Pausar',
  'apresentacao.video.denovo': 'Ver de nuevo',
  'apresentacao.video.nota': 'Toca el video para escuchar. Lo que ella dice está escrito justo abajo.',
  'apresentacao.botao': 'Vamos a empezar',
  'entrada.anuncio.ouvir': 'Escuchar a la Madre María',
  'entrada.apresentacao':
    'Soy yo de nuevo, la Madre María. Ahora es el turno de tus cartas. Una por vez, sin prisa. Yo leo cada una para ti.',
  'entrada.extra.anuncio':
    'Espera, todavía no termina. Mira la mesa otra vez. Todavía hay una carta cerrada ahí. Antes de que yo profundice, rasca una más. Sin prisa. Esa la dejé ahí a propósito.',
  'entrada.estrela.anuncio':
    'Esta la volteé yo para ti: la Estrella. Las otras hablaron de lo que hay entre tú y esa persona. Esta habla de tu próximo paso. No del paso de esa persona. Del tuyo.',
  'entrada.presenca.titulo': '¿Estás aquí conmigo?',
  'entrada.presenca.texto':
    'Ahora voy a profundizar. Esto no es para escuchar de pasada. Deja el resto a un lado un minuto. ¿Estás aquí conmigo?',
  'entrada.presenca.botao': 'Aquí estoy — abrir la lectura profunda',
  'entrada.fim.cartas':
    'Estas cartas son la puerta. De aquí en adelante no sale ninguna carta — la app cruza lo que ya diste: tu signo, que calculó de tu fecha, tu edad y las cinco respuestas. De ese cruce sale el plan del año, y cada línea de él muestra de cuáles de tus respuestas está hecha.',
  'entrada.instrucao': 'Rasca la carta con el dedo para ver cuál es.',
  'entrada.audioNota':
    'El audio no empieza solo: tócalo cuando quieras escucharlo. El texto de abajo dice lo mismo por escrito — sin audífonos no te pierdes nada.',
  'entrada.convite.rotulo': 'LO QUE SE QUEDA CONTIGO',
  /* A alternativa do filtro duro: contato cortado. Nenhuma palavra dela pode
     casar com PATRONES_CONTACTO (lib/lectura.js) — "escribir", "mensaje",
     "llamar", "hablar" ficam FORA desta linha de proposito, senao a guarda
     comeria a propria alternativa e a tela ficaria sem convite. */
  'entrada.convite.alternativa':
    'Con el contacto como está hoy, esta carta no pide ningún paso hacia afuera. Lo que pide se hace de este lado del hilo.',
  'entrada.proxima': 'Ver la próxima carta',
  'entrada.fechar': 'Ver el cierre',
  'entrada.fim.titulo': 'Las tres ya están leídas',
  'entrada.fim.texto':
    'Estas tres son la puerta: el afecto que existe, lo que está encubierto y lo que depende de ti mover. De aquí en adelante no sale ninguna carta — la app cruza lo que ya diste: tu signo, que calculó de tu fecha, tu edad y las cinco respuestas. De ese cruce sale el plan del año, y cada línea de él muestra de cuáles de tus respuestas está hecha.',
  'entrada.fim.ano':
    'La app cuenta el tiempo en trece lunaciones. Una por vez, sin cobrarte el día que se pase.',
  'entrada.entrar': 'Entrar en la app',
  'entrada.seguir': 'Escuchar la lectura profunda',

  /* --- REOUVIR AS TRES CARTAS -------------------------------------------- */
  'entrada.reouvir.titulo': 'La lectura de la Madre María, de nuevo',
  'entrada.reouvir.texto':
    'Son las mismas de tu lectura de entrada, con el mismo audio y el mismo texto. Nada se sacó otra vez: esta lectura pasa una sola vez, y ya pasó.',

  /* --- LEITURA PROFUNDA -------------------------------------------------- */
  'profunda.sobreceja': 'TU LECTURA PROFUNDA',
  'profunda.posicao': '{n} de {total}',
  'profunda.audioNota':
    'El audio no empieza solo: tócalo cuando quieras escucharlo. El texto de abajo es el mismo que dice la voz, palabra por palabra — sin audífonos no te pierdes nada.',
  'profunda.ouvir': 'Escuchar esta parte',
  'profunda.pausar': 'Pausar',
  'profunda.proximo': 'Ver la próxima parte',
  /* A frase do fim do audio 11, na letra: a voz termina nela e o botao repete. */
  'profunda.entrar': 'Tu primera luna empieza ahora',
  'profunda.pular': 'Saltar y entrar en la app',
  /* ================================================================================
   * LOTE: O PLANO DO DIA + O MAPA DO ANO  (158 chaves)
   *
   * O ato do dia, o veu raspavel, o fecho, a fresta de amanha (screens/PlanoScreen.js)
   * e as treze luas, o tabuleiro e as etiquetas (screens/MapaDoAnoScreen.js, lib/ano.js).
   * ============================================================================= */
  "plano.titulo": "El plan de hoy",
  "plano.acao.alternativa": "Con el contacto como está hoy, el plan no te pide ningún paso hacia fuera. Lo que hay para hacer hoy se hace de este lado del hilo.",
  "plano.acao.contencao": "Si hoy te vienen las ganas de dar un paso hacia fuera, este es el gesto que te sostiene la mano: haz el del plan, entero, y deja que el día termine.",
  "plano.ceu.vazio": "Hoy no se pudo calcular el cielo en este teléfono. Preferimos dejarlo en blanco antes que inventarlo.",
  "plano.ceu.fase": "La Luna de hoy está en {fase}.",
  "plano.ceu.marco.hoje": "{fase} es hoy.",
  "plano.ceu.marco.dia": "{fase} cae {quando}, día {dia}.",
  "plano.encaixe.exato": "Hoy es el día de este gesto: {criterios}.",
  "plano.encaixe.parcial": "Hoy coincide en parte: {criterios}.",
  "plano.encaixe.nenhum": "Hoy no es el día más obvio de este gesto. Vale igual.",
  "plano.encaixe.naoDeclara": "Este gesto no pide día ni fase. Sirve para hoy.",
  "plano.encaixe.semMedida": "Hoy no se pudo comprobar el momento de este gesto en este teléfono. Vale igual.",
  "plano.encaixe.parcialSemMedida": "Hoy coincide en lo que se pudo comprobar: {criterios}. La fase de la Luna quedó fuera de esta cuenta.",
  "plano.encaixe.nenhumSemMedida": "De lo que se pudo comprobar, hoy no es el día más obvio de este gesto. La fase de la Luna quedó fuera de esta cuenta, y vale igual.",
  "plano.encaixe.criterio.dia": "{diaSemana}, día de {regente}",
  "plano.encaixe.criterio.fase": "{fase}",
  "plano.encontro.titulo": "El encuentro",
  "plano.encontro.travado.contatoDuro": "Este bloque queda cerrado hoy. Por lo que marcaste sobre el contacto, el plan del día es sobre ti — y ningún paso de aquí apunta hacia fuera. Si el contacto vuelve por cuenta propia, actualiza la respuesta en Ajustes y el bloque se abre.",
  "plano.encontro.travado.bloqueio": "Este bloque queda cerrado hoy. Con un bloqueo en medio, el plan no apunta hacia fuera: sería ignorar el único dato duro que diste. Si eso cambia, actualiza la respuesta en Ajustes y el bloque se abre.",
  "plano.tela.linhaDoDia": "{diaSemana}, {dia} de {mes} · {glifo} {regente}",
  "plano.tela.ritual.rotulo": "EL RITUAL DE HOY",
  "plano.tela.ritual.ouvir": "Escuchar el gesto de hoy",
  "plano.tela.ritual.duracao": "Cuesta {duracao}.",
  "plano.tela.ritual.passos": "CÓMO HACERLO",
  "plano.tela.ritual.travado.corpo": "Son {n} pasos, y en ellos está lo que hay que hacer. El gesto de hoy es este y no se repite mañana: cada uno de los días de las trece lunas tiene el suyo.",
  "plano.tela.ritual.travado.boton": "Abrir las trece lunas",
  "plano.tela.ritual.camera": "Este es el único gesto que pide la cámara, y la foto va a la lectura del poso de Cosmic Guide, que analiza la imagen y devuelve un texto. La Madre no guarda la foto ni la lee. La última palabra sobre lo que viste sigue siendo tuya.",
  "plano.tela.ritual.abrir.cartas": "Volver a abrir mi lectura",
  "plano.tela.ritual.abrir.cafe": "Abrir la lectura del poso",
  "plano.tela.ritual.abrir.mao": "Abrir la lectura de la mano",
  "plano.tela.ritual.fonte": "{obra}, {autor} — {quando}",
  "plano.tela.reflexao.rotulo": "LA PREGUNTA DE HOY",
  "plano.tela.reflexao.placeholder": "Como salga, sin arreglar la frase.",
  "plano.tela.reflexao.nota": "Lo que escribes aquí se queda en este teléfono, con la fecha de hoy. Nadie más lo lee, y el \"Borrar todo\" de Ajustes se lo lleva también.",
  "plano.tela.reflexao.falhou": "No se pudo guardar en este teléfono. Lo que escribiste sigue en la pantalla mientras esté abierta.",
  "plano.tela.afirmacao.rotulo": "LA FRASE DE HOY",
  "plano.frase.rotulo": "LA FRASE DE APERTURA",
  "plano.passo.seguir": "Continuar",
  "plano.passo.fechar": "Cerrar el día",
  "plano.fio.rotulo": "EL HILO DE AYER",
  "plano.fio.abre": "La última vez, dejaste aquí:",
  "plano.fio.ponte.gesto": "Hoy el día pide un gesto. Llévate esa línea contigo.",
  "plano.fio.ponte.missao": "Hoy el día pide una misión. Llévate esa línea contigo.",
  "plano.fio.ponte.pergunta": "Hoy el día pregunta. La respuesta puede empezar ahí.",
  "plano.fio.ponte.ritmo": "Hoy es el día de Venus: el ritmo de ustedes dos.",
  "plano.fio.ponte.encontro": "Hoy el día es de abrir horizonte.",
  "plano.ato.gesto": "Un gesto pequeño",
  "plano.ato.missao": "Una misión",
  "plano.ato.pergunta": "Una pregunta tuya",
  "plano.ato.ritmo": "El ritmo de ustedes dos",
  "plano.ato.encontro": "La invitación del fin de semana",
  "plano.amanha.rotulo": "MAÑANA",
  "plano.amanha.nota": "La frase entera se abre con la casilla de mañana.",
  "mapa.seuDia": "TU DÍA",
  "plano.luaNoSigno": "La Luna pasa por {signo} hoy — el cielo está en tu signo.",
  "plano.fecho.selo": "El día se cerró.",
  "plano.missao.rotulo": "LA MISIÓN DE HOY",
  "plano.missao.porque": "POR QUÉ ESTO",
  "plano.missao.aceitar": "Acepto la misión",
  "plano.missao.cumpri": "Cumplida",
  "plano.missao.comoFoi": "De 0 a 10, ¿cómo fue?",
  "plano.missao.palavra": "Una palabra sobre cómo fue (si quieres).",
  "plano.missao.guardada": "Misión de hoy cumplida y guardada, con la fecha.",
  "plano.missao.travadaContato": "La misión de hoy es tuya, entera: por lo que marcaste sobre el contacto, ningún paso de aquí apunta hacia fuera.",
  "plano.coracao.rotulo": "EL CORAZÓN DE HOY",
  "plano.coracao.pergunta": "¿Cómo está tu corazón hoy?",
  "plano.coracao.leve": "Ligero",
  "plano.coracao.neutro": "Neutro",
  "plano.coracao.pesado": "Pesado",
  "plano.coracao.placar": "{n} de {total} mañanas ligeras esta semana. La semana pasada, {antes}.",
  "plano.coracao.nota": "Un toque, y es solo tuyo. El marcador cuenta; quien lee el número eres tú.",
  "plano.campo.escrevendo": "escribiendo…",
  "plano.campo.guardado": "Guardado en este teléfono, con la fecha de hoy.",
  "plano.sonho.placeholder": "El trozo que quedó — como salga, sin arreglar.",
  "plano.sonho.nota": "Lo que escribas aquí queda guardado con la fecha, durante noventa días. Nadie más lo lee.",
  "mapa.rotulo": "EL MAPA DEL AÑO",
  "mapa.hojeSoDia": "Hoy es el día {n}.",
  "mapa.abrir": "Ver el mapa del año",
  "mapa.hoje": "Hoy es el día {n}, en la luna {lua}.",
  "mapa.como": "Cada casilla es un día, y cada día se abre rascando — en el plan, uno por vez. La de hoy tiene el hilo vivo; la de ayer todavía acepta el dedo, si quedó cerrada.",
  "mapa.lua": "LUNA {lua}",
  "mapa.abrirDia": "Abrir el día {n}",
  "mapa.semAncora": "Tu mapa nace cuando empieza tu año — en la primera luna nueva después de tu lectura. Aparece aquí solo, con tus trescientas sesenta y cinco casillas.",
  "mapa.pe": "Una casilla apagada es solo un día que pasó. El año no te cobra nada: la luna sigue, y la casilla de hoy se abre igual.",
  "plano.veu.raspe": "Rasca para abrir tu día",
  "plano.veu.abrir": "Abrir sin rascar",
  "plano.veu.anuncio": "El día se abrió. El ritual de hoy está en la pantalla.",
  "plano.ritmo.rotulo": "EL RITMO DE USTEDES DOS",
  "plano.ritmo.venus": "El viernes es el día de Venus en el calendario antiguo — el día del deseo. Es el único día de la semana en que este bloque se abre.",
  "plano.ritmo.convite": "Si quieres, dime el signo de esa persona. Solo el signo: uno entre doce, sin nombre, sin fecha, sin identificar a nadie. Con él leo el ritmo de ustedes dos — cómo enciende, cómo conversa, cómo pelea.",
  "plano.ritmo.naoHoje": "Hoy no",
  "plano.ritmo.par": "{dela} y {daPessoa} — {figura}.",
  "plano.ritmo.cama": "EN LA CAMA",
  "plano.ritmo.conversa": "EN LA CONVERSACIÓN",
  "plano.ritmo.briga": "EN LA PELEA",
  "plano.ritmo.falar": "CUANDO HAYA CONVERSACIÓN",
  "plano.ritmo.limites": "Esto es una lente, no un veredicto: dos signos solares no deciden nada — quienes deciden son dos personas. Nada de aquí afirma lo que esa persona siente.",
  "plano.ritmo.trocar": "Cambiar el signo",
  "plano.ritmo.fonte": "Ptolomeo, Tetrabiblos I.13 y I.16 — las figuras entre los signos",
  "plano.ritmo.fonteNota": "La lectura en prosa viene de la tradición que Linda Goodman popularizó en 1968 — prosa, sin porcentaje: un número aquí se volvería veredicto, y una figura no es destino.",
  "plano.tela.encontro.travado": "CERRADO HOY",
  "plano.tela.encontro.ajustes": "Abrir Ajustes",
  "plano.tela.compartir": "Compartir la carta de hoy",
  "plano.tela.compartir.falhou": "No se pudo abrir el menú de compartir en este aparato.",
  "plano.tela.compartir.aviso": "Ninguna carta lee a la otra persona. Esa punta del hilo no está en esta app.",
  "plano.semana.nomes": ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  "plano.semana.em": ["el domingo", "el lunes", "el martes", "el miércoles", "el jueves", "el viernes", "el sábado"],
  "ano.lunacao.1.titulo": "Nombrar lo que fue",
  "ano.lunacao.2.titulo": "La rutina que sobró",
  "ano.lunacao.3.titulo": "Lo que ya era mío",
  "ano.lunacao.4.titulo": "Las ganas tienen hora",
  "ano.lunacao.5.titulo": "Sé o supongo",
  "ano.lunacao.6.titulo": "El tamaño de mi parte",
  "ano.lunacao.7.titulo": "Los otros hilos",
  "ano.lunacao.8.titulo": "La rabia no dicha",
  "ano.lunacao.9.titulo": "Lo que yo quiero",
  "ano.lunacao.10.titulo": "Confiar de nuevo",
  "ano.lunacao.11.titulo": "Lo que se dice",
  "ano.lunacao.12.titulo": "El año por dentro",
  "ano.lunacao.13.titulo": "La misma luna",
  "ano.lunacao.1.pergunta": "¿Qué pasó, dicho con tus palabras y sin arreglar la frase?",
  "ano.lunacao.2.pergunta": "¿Cómo es un día tuyo ahora, desde que despiertas hasta que apagas la luz?",
  "ano.lunacao.3.pergunta": "¿Qué era tuyo antes de ese vínculo y sigue siendo tuyo?",
  "ano.lunacao.4.pergunta": "¿A qué hora te aprietan las ganas de decir algo?",
  "ano.lunacao.5.pergunta": "¿Dónde termina lo que sabes y empieza lo que reconstruyes de cabeza?",
  "ano.lunacao.6.pergunta": "¿Cuál fue tu parte, dicha sin aumentar y sin disminuir?",
  "ano.lunacao.7.pergunta": "¿Quién más está en tu vida, y cuánto tiempo llevas sin mirar eso?",
  "ano.lunacao.8.pergunta": "¿Qué quedó sin decir del lado de la rabia?",
  "ano.lunacao.9.pergunta": "¿Qué quieres, dicho sin mencionar a nadie?",
  "ano.lunacao.10.pergunta": "¿Qué necesitarías para confiar de nuevo — en quien sea?",
  "ano.lunacao.11.pergunta": "¿Qué dirías, y qué se queda siendo solo tuyo?",
  "ano.lunacao.12.pergunta": "¿Qué guardó este año de ti, con tu letra?",
  "ano.lunacao.13.pergunta": "La luna está cerrando una vuelta. ¿Qué pregunta quieres abrir en la próxima?",
  "ano.lunacao.1.abertura": "Esta lunación empieza por el principio: qué pasó, escrito por ti, como salga. No hace falta que quede bonito ni que tenga sentido para nadie más — se queda en este aparato.",
  "ano.lunacao.2.abertura": "Después de nombrar lo que fue, sobra una cosa de veinticuatro horas de largo: el martes. Esta lunación mira la forma de tu día, no la historia.",
  "ano.lunacao.3.abertura": "Esta lunación pide cosas concretas y no conceptos: el café, el camino, la música, la amistad. El material viene del mes que pasó, que ya está apuntado aquí.",
  "ano.lunacao.4.abertura": "Las ganas de decir algo suelen tener horario, y cada persona tiene el suyo. Esta lunación no pide contención: pide que te fijes en cuál es el tuyo.",
  "ano.lunacao.5.abertura": "Ninguna carta lee a esa persona, y este aparato tampoco. Lo que se puede hacer es separar lo que sabes de lo que vienes suponiendo.",
  "ano.lunacao.6.abertura": "Tu parte no es la historia entera, y tampoco es nada. Esta lunación pide su tamaño, con las dos mitades en la misma pantalla.",
  "ano.lunacao.7.abertura": "Esta lunación entera no es sobre esa persona: es inventario de lo que ya existe. La hermana, el colega, la vecina, el grupo que quedó parado en marzo.",
  "ano.lunacao.8.abertura": "Esta lunación abre un lugar para lo que quedó sin decir del lado de la rabia. No tener rabia este mes es una respuesta legítima, y el día sigue igual.",
  "ano.lunacao.9.abertura": "La regla de esta lunación es una sola: escribir lo que quieres sin mencionar a nadie. La app no sabe lo que deberías querer, y no vota.",
  "ano.lunacao.10.abertura": "La formulación de esta lunación es \"en quien sea\", y vale todos los días de aquí a la próxima luna nueva. La confianza aquí es capacidad general, no preparación para una conversación concreta.",
  "ano.lunacao.11.abertura": "Esta lunación trabaja los dos lados del límite: lo que se dice y lo que se queda siendo solo tuyo. La carta que no se envía cuenta igual.",
  "ano.lunacao.12.abertura": "Esta lunación es archivo. La app abre lo que escribiste, lunación por lunación, con las fechas, y no resume nada.",
  "ano.lunacao.13.abertura": "Esta es la decimotercera lunación, y es la que cierra la vuelta. Doce lunaciones suman 354 días, trece suman 384 y el año civil tiene 365: la luna y el calendario no cierran juntos, y nunca cerraron.",
  "ano.fase.comecar-no-escuro.tom": "Empezar a oscuras",
  "ano.fase.comecar-no-escuro.pede": "Un gesto pequeño, empezado hoy, que no produce nada visible hoy.",
  "ano.fase.sustentar.tom": "Sostener lo que ya empezó, sin aumentar",
  "ano.fase.sustentar.pede": "Rehacer el gesto de la fase anterior una vez más, del mismo tamaño.",
  "ano.fase.o-que-ja-da-para-ver.tom": "Lo que ya se puede ver",
  "ano.fase.o-que-ja-da-para-ver.pede": "Registrar por escrito una cosa que ya se puede ver sin interpretar.",
  "ano.fase.tirar.tom": "Quitar, cortar, dejar secar",
  "ano.fase.tirar.pede": "Quitar una cosa concreta del día — una pestaña abierta, un horario, un objeto, una revisada.",
  "ano.virada.hoje": "Hoy la luna nueva cierra esta lunación. El tema cambia a partir de ahora.",
  "ano.virada.dia": "La luna nueva cierra esta lunación el día {dia}. El tema cambia ahí.",
  "ano.arquivo.titulo": "Lo que escribiste",
  "ano.arquivo.vazio": "En esta lunación no quedó nada escrito. No hay nada que recuperar y no hay atraso: el archivo muestra lo que existe, y sigue.",
  // ===== LOTE: perfil / ajustes / metodo / ayuda / privacidad / terminos / paywall =====
  "perfil.sobreceja": "ESTE TELÉFONO",
  "perfil.sinNombre": "Todavía sin nombre",
  "perfil.cargando": "Un momento.",
  "perfil.espejo.sobreceja": "LO QUE RESPONDISTE",
  "perfil.espejo.separador": " · ",
  "perfil.espejo.vacio": "Todavía no hay respuestas guardadas en este teléfono.",
  "perfil.espejo.pie": "Está con tus palabras, no con las nuestras: es lo que elegiste en las preguntas del principio. La app no deduce nada más sobre ti.",
  "perfil.hilo.sobreceja": "MI HILO",
  "perfil.hilo.actual": "Nosotros ahora",
  "perfil.hilo.record": "Hilo más largo",
  "perfil.hilo.total": "Días con lectura",
  "perfil.hilo.nota": "Los tres números salen de este teléfono y de nada más. Un día con lectura cuenta una vez, aunque abras la app varias veces. Aquí no hay nivel, ni ranking, ni puntos.",
  "perfil.hilo.ver": "Ver Mi Hilo completo",
  "perfil.suscripcion.sobreceja": "SUSCRIPCIÓN",
  "perfil.suscripcion.activa": "Activa en este teléfono.",
  "perfil.suscripcion.inactiva": "Sin suscripción.",
  "perfil.suscripcion.ver": "Ver lo que se abre en las trece lunas",
  "perfil.suscripcion.gestionar": "Gestionar",
  "perfil.suscripcion.gestionarNota": "Abre tu cuenta de la tienda: ahí se cambia el plan o se cancela, sin hablar con nadie y sin explicar por qué.",
  "perfil.suscripcion.gestionarError": "No se pudo abrir desde aquí. Tu suscripción está en la cuenta de la plataforma donde compraste.",
  "perfil.suscripcion.gestionarWeb": "La suscripción se administra donde compraste, en la cuenta de la plataforma de pago.",
  "perfil.restaurar.ok": "Listo. Tu compra quedó activa en este teléfono.",
  "perfil.restaurar.sinTienda": "Todavía no hay tienda conectada, así que no hay ninguna compra que restaurar. Nada de lo que es tuyo cambió.",
  "perfil.accesos.sobreceja": "MÁS",
  "perfil.acceso.entrada": "La lectura de la Madre Maria",
  "perfil.acceso.profunda": "La lectura profunda, en cinco partes",
  "perfil.acceso.profunda.naoOuvida": "Todavía no has escuchado esta",
  "perfil.acceso.profunda.parou": "Te quedaste en la parte {n} de {total}",
  "perfil.acceso.ritual": "El ritual de siete días",
  "perfil.acceso.album": "El álbum de las 78",
  "perfil.acceso.ajustes": "Ajustes",
  "perfil.acceso.metodo": "Cómo decide esta app",
  "perfil.acceso.ayuda": "Ayuda",
  "perfil.acceso.privacidad": "Privacidad",
  "perfil.acceso.terminos": "Términos",
  "perfil.rehacer": "Rehacer mis respuestas",
  "perfil.rehacer.nota": "Vuelves a las preguntas del principio y tu hilo se queda como está: rehacer no es empezar de cero. Los nudos que ya diste siguen contados.",
  "paywall.titulo": "Lo que viene ahora son trece lunas.",
  "paywall.sub": "Esto es lo que se abre, y nada más que esto:",
  "paywall.beneficio.lunas": "Las trece lunas del año: trece temas, uno por lunación, y cada uno abre en la luna nueva medida en el cielo — no en una fecha del calendario.",
  "paywall.beneficio.espelho": "El espejo: lo que escribas en la primera luna vuelve en la decimotercera, con la fecha del día en que lo escribiste, sin una coma cambiada.",
  "paywall.beneficio.gestos": "El trabajo de cada día, armado para ti: un gesto con nombre y hora justa, elegido por el cielo de ese día y por lo que contaste. El gesto del día lo ves de todos modos; el cómo se hace abre aquí.",
  "paywall.plan.mensual.nombre": "Mensual",
  "paywall.plan.mensual.precio": "{precio} al mes",
  "paywall.plan.anual.nombre": "Anual",
  "paywall.plan.anual.precio": "{precio} al año",
  "paywall.plan.anual.equivalente": "Queda en {precioMes} al mes.",
  "paywall.plan.nota": "El precio lo pone la tienda, en tu moneda. Aquí no hay letra chica.",
  "paywall.boton": "Abrir las trece lunas",
  "paywall.restaurar": "Restaurar compra",
  "paywall.salida": "Lo que ya abriste sigue siendo tuyo.",
  "paywall.comoCancelar": "Cancelas cuando quieras, desde tu cuenta en la plataforma donde compraste, sin hablar con nadie y sin explicar por qué. Lo que ya pagaste queda activo hasta el final del período.",
  "privacidad.sobreceja": "PRIVACIDAD",
  "privacidad.titulo": "Lo de la Madre se queda en este teléfono",
  "privacidad.entrada": "La Madre Maria no pide cuenta ni contraseña, y no manda nada hacia afuera: lo que escribes en sus preguntas se queda en tu aparato. Ella vive dentro de Cosmic Guide, que es una app mayor y tiene cuenta y servidor propios — lo que sea de él está descrito en la pantalla de Privacidad de Cosmic.",
  "privacidad.guarda.titulo": "LO QUE SE QUEDA GUARDADO EN TU TELÉFONO",
  "privacidad.guarda.lineas": [
    "El nombre que escribiste en la primera pregunta.",
    "Tus cuatro respuestas sobre la historia: qué pasó, hace cuánto, cómo está el contacto hoy y qué quieres entender.",
    "Tu fecha de nacimiento. Es un dato sensible y se trata como tal: de ella salen tu signo y tu edad, que son lo que hace que el plan hable con tu etapa de la vida. No pedimos la hora ni el lugar, y sale en el \"Borrar todo\" junto con el resto.",
    "Cómo hablarte — mujer, hombre o ninguno de los dos. Cambia solo las palabras con que la lectura se dirige a ti.",
    "Tu hilo: los días en que viniste a leer, la cuenta de hoy y tu récord.",
    "Una marca del día, para saber si ya abriste la lectura de hoy.",
    "Tus ajustes: la hora del recordatorio, el movimiento reducido y la vibración.",
    "Lo que escribes en los campos del día — la respuesta de la pregunta y, en el día del sueño, el sueño. Se queda con la fecha, nadie más lo lee, y sale en el \"Borrar todo\".",
    "El corazón de cada día (ligero, neutro o pesado) y el registro de las misiones — aceptaste, cumpliste y la nota que le diste. Cuentas tuyas, en tu teléfono.",
    "El signo de la persona amada, si quieres darlo — uno entre doce, pedido solo el viernes, para el ritmo de ustedes dos. No identifica a nadie, se puede cambiar cuando quieras, y sale en el \"Borrar todo\" con el resto.",
    "La línea que tu día cerrado deja para el siguiente — el \"hilo de ayer\", que la app te cita de vuelta en el próximo día vivido. Es la última línea, se queda solo en este teléfono y sale en el \"Borrar todo\".",
    "En qué escalón del camino estás: las misiones que involucran a la otra persona vienen en orden, de la más ligera a la que pide más coraje, y la app guarda solo el número del escalón y el día en que subiste. Es un número de uno a nueve en este teléfono, y sale en el \"Borrar todo\".",
    "Una letra, A o B: cuál de las dos lecturas de entrada te sorteó la app la primera vez — para que el \"volver a escuchar\" muestre tus cartas, y no las otras. Se queda en este teléfono y sale en el \"Borrar todo\".",
  ],
  "privacidad.guarda.pie": "Esa es la lista completa. Se queda en el almacenamiento local del sistema — el mismo cajón donde cualquier app deja sus preferencias — y ahí se queda hasta que lo borres.",
  "privacidad.recordatorio": "Todavía no hay recordatorios: la app no envía ninguna notificación. Si algún día lo ponemos, lo único guardado sería la hora que elijas, en este mismo teléfono.",
  "privacidad.no.titulo": "LO QUE NO SE PIDE NI SE RECOGE",
  "privacidad.no.lineas": [
    "La hora y el lugar donde naciste. Pedimos solo el día; sin hora no hay ninguna carta astral, y la app no finge tener una.",
    "Tu ubicación. La app nunca pregunta dónde estás.",
    "Tus contactos, tus fotos y tu micrófono. La cámara la Madre tampoco la pide: en los días de borra y de mano quien abre la cámara es la pantalla del Cosmic Guide, y es su privacidad la que responde por la foto.",
    "De la otra persona: el nombre, el nacimiento, el género, una foto o cómo llegar hasta ella — nunca. El único dato que puede existir aquí sobre esa persona es el signo solar, uno entre doce, y solo si quieres darlo (está en la lista de arriba).",
    "Tu correo y tu teléfono. No hay registro, así que no hay a quién identificar.",
  ],
  "privacidad.no.pie": "No hay publicidad, no hay rastreador y no hay análisis de terceros. Lo que la lectura no usa, no se pide.",
  "privacidad.red.titulo": "NO HAY RED",
  "privacidad.red.cuerpo": "Las cartas salen del mazo, de la fecha de hoy y de tus respuestas, y el texto se arma aquí dentro con contenido que ya viene dentro de la app: se puede leer en modo avión. Nada de lo que escribes aquí sale de este teléfono. Hay una puerta hacia fuera, y eres solo tú quien la abre: en los días de borra y de mano el plan te lleva a la lectura con foto del Cosmic Guide, que es otra pantalla y envía la foto para que sea leída. Si no abres esa puerta, nada sale.",
  "privacidad.borrar.titulo": "CÓMO BORRAR TODO",
  "privacidad.borrar.cuerpo": "En Ajustes hay un botón, \"Borrar todo\". Deja el teléfono como el primer día: sin nombre, sin respuestas, sin tu fecha de nacimiento y sin hilo. Es inmediato y no se puede deshacer. Y si desinstalas la app, el sistema se lleva lo que hubiera quedado. No tenemos copia de nada, porque nunca la tuvimos.",
  "privacidad.pago.titulo": "CUANDO LA SUSCRIPCIÓN EXISTA",
  "privacidad.pago.cuerpo": "Hoy no hay cobro dentro de la app. Cuando lo haya, quien procesa el pago es la plataforma que cobra por Cosmic Guide, con los datos que informes ahí. La Madre Maria no ve tu tarjeta, no recibe y no guarda: de este lado queda una única marca en el teléfono diciendo que la suscripción está activa.",
  "privacidad.cierre": "Esta pantalla describe la versión que tienes instalada hoy. Si algún día la app necesita mandar algo hacia fuera, esto se reescribe antes y el cambio queda a la vista.",
  "terminos.sobreceja": "TÉRMINOS DE USO",
  "terminos.titulo": "Lo que aceptas al usar la app",
  "terminos.entrada": "Corto y sin letra chica. Si usas la Madre Maria, esto es lo que estás aceptando.",
  "terminos.que.titulo": "QUÉ ES ESTO",
  "terminos.que.cuerpo": "La Madre Maria es una lectura simbólica de tarot y un camino de trece lunas, hechos para entretener y para darte otras palabras sobre algo que te da vueltas. No es predicción. No es consejo profesional — ni jurídico, ni financiero, ni de ningún otro orden —, no es diagnóstico y no sustituye la atención de un profesional de salud mental. Las cartas no saben nada de tu historia: lo que hacen es darte tres imágenes fijas para que mires desde fuera lo que es tuyo.",
  "terminos.edad.titulo": "EDAD MÍNIMA: 18 AÑOS",
  "terminos.edad.cuerpo": "La app es para personas mayores de 18 años. Te preguntamos tu fecha de nacimiento — de ella salen tu signo y tu edad —, pero no verificamos nada: aquí en la Madre se queda en este teléfono. Entonces esto sigue de tu lado: si tienes menos de 18, esta app todavía no es para ti.",
  "terminos.promesa.titulo": "LO QUE LA APP NO PROMETE",
  "terminos.promesa.cuerpo": "Ninguna lectura promete un resultado sobre tu vínculo, y ninguna carta lee a la otra persona: esa punta del hilo no está en esta app. Lo que decidas hacer después de leer es tuyo, y la responsabilidad de esa decisión también. Si alguien — aquí o en cualquier otro lugar — te da una fecha o te asegura un final, está inventando.",
  "terminos.suscripcion.titulo": "LA SUSCRIPCIÓN",
  "terminos.suscripcion.cuerpo": "Hoy no hay ningún cobro en esta versión, porque la suscripción todavía no está conectada. Cuando abra, funciona así: quien cobra es la plataforma de pago de Cosmic Guide, en tu moneda; se renueva sola al final de cada período, a menos que canceles antes; y la cancelación se hace desde tu cuenta de esa plataforma, sin hablar con nadie y sin explicar por qué. Lo que ya pagaste queda activo hasta el final del período en curso. Los reembolsos los trata ella, con sus reglas.",
  "terminos.datos.titulo": "TUS DATOS",
  "terminos.datos.cuerpo": "Lo que escribes para la Madre se queda en este teléfono, incluida tu fecha de nacimiento: ella no abre cuenta, no manda nada a un servidor y no guarda copia. La Madre vive dentro de Cosmic Guide, que tiene cuenta y servidor propios — el detalle completo está en las pantallas de Privacidad de las dos.",
  "terminos.apoyo.titulo": "SI LO ESTÁS PASANDO MAL",
  "terminos.apoyo.cuerpo": "Una carta no acompaña a nadie. Si lo que sientes está pesando de verdad, busca gente de carne y hueso: alguien de confianza, un profesional, o la línea de atención en crisis de tu país. Esta app no es ese lugar y no pretende serlo.",
  "terminos.cambios.titulo": "CAMBIOS Y CONTACTO",
  "terminos.cambios.cuerpo": "Si estos términos cambian, la versión nueva aparece en esta misma pantalla. Para dudas o reclamos, escribe a {correo}.",
  "ayuda.sobreceja": "SOPORTE",
  "ayuda.titulo": "Resolver un problema",
  "ayuda.entrada": "Elige lo que está pasando. Casi todo se resuelve aquí mismo, en un toque, sin hablar con nadie y sin esperar a que alguien responda.",
  "ayuda.cat.cobro": "Cobro y suscripción",
  "ayuda.cat.cobro.sub": "Un cobro que no reconoces, cancelar, o pagaste y no se abrió.",
  "ayuda.cat.acceso": "No puedo entrar o falta algo",
  "ayuda.cat.acceso.sub": "La app no abre, se queda cargando, o no ves lo que ya tenías.",
  "ayuda.cat.contenido": "Algo del contenido",
  "ayuda.cat.contenido.sub": "Un texto que no encaja, una carta extraña, una duda sobre cómo se decide.",
  "ayuda.cat.tecnico": "Error técnico",
  "ayuda.cat.tecnico.sub": "Se cierra solo, se traba o algo dejó de responder.",
  "ayuda.cat.otro": "Otra cosa",
  "ayuda.cat.otro.sub": "Nada de lo que está ahí arriba.",
  "ayuda.pasos.sobreceja": "PRUEBA ESTO PRIMERO",
  "ayuda.pasos.vacio": "Para esto no hay un botón que lo resuelva solo. Usa el campo de aquí abajo y cuenta lo que pasó.",
  "ayuda.paso.restaurar.titulo": "Restaurar tu compra",
  "ayuda.paso.restaurar.cuerpo": "Si ya pagaste y la app no lo reconoce — cambiaste de teléfono, reinstalaste, entraste con otra cuenta —, esto lo devuelve: le pregunta a la tienda qué compró tu cuenta. No cobra nada de nuevo.",
  "ayuda.paso.restaurar.boton": "Restaurar compra",
  "ayuda.paso.restaurar.sinTienda": "Todavía no hay tienda conectada en esta versión, así que no hay ninguna compra que restaurar. Nada de lo que es tuyo cambió.",
  "ayuda.paso.tienda.titulo": "Cancelar o revisar el cobro",
  "ayuda.paso.tienda.cuerpo": "La suscripción vive en tu cuenta de la tienda, no aquí. En esa pantalla están el precio, la fecha del próximo cobro y el botón de cancelar, sin hablar con nadie y sin explicar por qué.",
  "ayuda.paso.tienda.apple": "Abrir en la App Store",
  "ayuda.paso.tienda.google": "Abrir en Google Play",
  "ayuda.paso.tienda.web": "Abrir el área del comprador",
  "ayuda.paso.tienda.error": "No se pudo abrir desde aquí. La suscripción está en la cuenta de la plataforma donde compraste, en la sección de suscripciones.",
  "ayuda.paso.reembolso.titulo": "Un cobro que no reconoces",
  "ayuda.paso.reembolso.cuerpo": "Quien procesa el cobro es la tienda: no vemos tu tarjeta, no recibimos el pago y no podemos devolver un cobro desde aquí. El reembolso se pide en esa misma pantalla de la tienda, y ahí sí llega a quien puede resolverlo. Es el camino corto, no una manera de sacarte de encima.",
  "ayuda.paso.recargar.titulo": "Cerrar y abrir de nuevo",
  "ayuda.paso.recargar.cuerpo": "Cierra por completo — la app entera, no solo esta pantalla — y abre de nuevo. No pierdes nada: tu nombre, tus respuestas y tus nudos están guardados en este teléfono, no en la pantalla que se trabó.",
  "ayuda.paso.recargar.boton": "Recargar ahora",
  "ayuda.paso.metodo.titulo": "Mira cómo decide la app",
  "ayuda.paso.metodo.cuerpo": "Casi toda duda de contenido se responde ahí: cómo se sortean las cartas, qué cambian tus respuestas y qué no cambian, y de dónde sale el texto de cada carta. Si después de leer sigue sin encajar, el error es nuestro y queremos verlo.",
  "ayuda.paso.metodo.boton": "Ver cómo decide esta app",
  "ayuda.paso.borrar.titulo": "Borrar lo que la app guardó",
  "ayuda.paso.borrar.cuerpo": "Deja este teléfono como el primer día: sin nombre, sin respuestas, sin hilo. Es lo último que hay que probar, porque es inmediato y no se puede deshacer: no tenemos copia de nada, porque nunca la tuvimos.",
  "ayuda.paso.borrar.boton": "Borrar lo que está guardado",
  "ayuda.paso.borrar.confirma": "Borra ahora y no vuelve. Tu suscripción no se toca: no es un dato tuyo que guardemos aquí, vive en tu cuenta de la tienda.",
  "ayuda.paso.borrar.si": "Sí, borrar",
  "ayuda.paso.borrar.no": "Mejor no",
  "ayuda.paso.borrar.hecho": "Listo. Este teléfono ya no guarda nada tuyo.",
  "ayuda.paso.borrar.parcial": "Lo de esta sesión se borró, pero el teléfono no dejó grabar en el disco. Cierra la app y ábrela de nuevo para comprobarlo.",
  "ayuda.escribir.sobreceja": "SI NADA DE ESTO LO RESOLVIÓ",
  "ayuda.escribir.titulo": "Escríbenos",
  "ayuda.escribir.cuerpo": "Abre tu app de correo con el asunto y el diagnóstico técnico ya escritos. Lo que pasó lo cuentas tú, con tus palabras: eso la app no lo rellena.",
  "ayuda.escribir.boton": "Abrir mi correo",
  "ayuda.escribir.falta": "Elige ahí arriba lo que está pasando. Así el correo llega ya clasificado y no te preguntamos de vuelta lo que ya sabes.",
  "ayuda.escribir.asunto": "Madre Maria · {categoria}",
  "ayuda.escribir.error": "No se pudo abrir tu correo desde aquí. Usa la dirección {correo} desde donde prefieras y copia a mano las cuatro líneas de arriba.",
  "ayuda.escribir.directo": "O usa directo la dirección {correo}.",
  "ayuda.diagnostico.titulo": "ESTO ES LO ÚNICO QUE SALE DE AQUÍ",
  "ayuda.diagnostico.version": "Versión de la app",
  "ayuda.diagnostico.plataforma": "Plataforma",
  "ayuda.diagnostico.sistema": "Sistema",
  "ayuda.diagnostico.categoria": "Categoría",
  "ayuda.diagnostico.sinCategoria": "todavía sin elegir",
  "ayuda.diagnostico.sinDato": "sin dato",
  "ayuda.diagnostico.pie": "Nada más que eso. No va tu nombre, no van tus respuestas y no va ni una línea de tu lectura: la app no puede adjuntarlas, porque nunca salen de este teléfono. Si quieres contar algo de tu lectura, lo escribes tú dentro del correo, y esa es una decisión tuya y no un adjunto automático.",
  "ayuda.correo.cuerpo": "Cuenta lo que pasó (escribe aquí):\n\n\n\n———\nDiagnóstico técnico. Lo escribió la app; no incluye tu nombre, tus respuestas ni tu lectura.\n{diagnostico}\n",
  "ayuda.pie": "Pase lo que pase con esto, nada de lo que es tuyo se pierde.",
  "metodo.sobreceja": "CÓMO DECIDE ESTA APP",
  "metodo.titulo": "El método, sin misterio",
  "metodo.entrada": "Una app de tarot puede decir cualquier cosa sobre cómo funciona por dentro, porque nadie la ve por dentro. Esta pantalla es lo contrario: aquí está el mecanismo completo, escrito para que puedas discutirlo. Si algo de esto no coincide con lo que ves en la app, el error es nuestro.",
  "metodo.sorteo.titulo": "Cómo se sortean tus tres cartas",
  "metodo.sorteo.cuerpo": "Se mezclan con Fisher-Yates, el algoritmo estándar de mezcla: en cada paso elige al azar una carta entre las que todavía no salieron y la saca de la bolsa. Eso hace dos cosas al mismo tiempo — que las {cartas} cartas tengan exactamente la misma probabilidad de salir, y que no puedan repetirse dentro de una tirada. Se detiene en la tercera.",
  "metodo.sorteo.orientacion": "La orientación se sortea aparte, carta por carta, con {prob} de probabilidad de salir invertida. Por eso pueden salir las tres derechas, o las tres invertidas: las dos cosas son resultados normales del sorteo y no significan nada más.",
  "metodo.ficha.titulo": "LA FICHA DEL SORTEO",
  "metodo.ficha.algoritmo": "Algoritmo",
  "metodo.ficha.algoritmo.valor": "Fisher-Yates parcial, uniforme",
  "metodo.ficha.azar": "Fuente del azar",
  "metodo.ficha.azar.valor": "El generador del sistema, sin nada por encima",
  "metodo.ficha.semilla": "Semilla",
  "metodo.ficha.semilla.valor": "Ninguna",
  "metodo.ficha.entrada": "Lo que entra en el sorteo",
  "metodo.ficha.entrada.valor": "Nada tuyo",
  "metodo.ficha.repetidas": "Cartas repetidas",
  "metodo.ficha.repetidas.valor": "Imposibles por construcción",
  "metodo.ficha.pie": "Al sorteo no llega tu nombre, ni tus respuestas, ni la hora, ni cuántas veces abriste la app. No es promesa de marca: es que la función que reparte no tiene por dónde recibir esos datos, y está escrita para que no se le puedan pasar.",
  "metodo.respuestas.titulo": "Qué cambian tus {preguntas} respuestas",
  "metodo.respuestas.si": "LO QUE SÍ CAMBIAN",
  "metodo.respuestas.si.lineas": [
    "La pregunta que hace cada posición. El nudo se calibra con lo que pasó entre ustedes; la tensión, con el tiempo que pasó y con cómo está el contacto hoy; tu punta, con lo que quieres entender.",
    "El filtro de contacto. Si respondiste que escribiste y no tuviste respuesta, o que no hay ningún contacto, toda frase que te empuje hacia fuera queda fuera. No es que se elija otra frase: el texto ya armado se barre y se sustituye, así que no pasa ni un consejo escrito hace meses.",
  ],
  "metodo.respuestas.no": "LO QUE NO CAMBIAN",
  "metodo.respuestas.no.lineas": [
    "Qué cartas salen. Ninguna. Podrías responder todas las preguntas al revés y el mazo repartiría exactamente igual.",
    "Qué dice cada carta. El texto de una carta está escrito de antemano y entra tal como es, sin retoque para ti.",
  ],
  "metodo.respuestas.pie": "Es la diferencia entre personalizar la pregunta y personalizar la respuesta. Aquí se personaliza la pregunta. La respuesta la da el mazo, y por eso a veces cae una carta incómoda: si tus respuestas pudieran mover el resultado, esto sería un espejo y no una lectura.",
  "metodo.texto.titulo": "De dónde sale el texto de cada carta",
  "metodo.texto.cuerpo": "De la tradición Rider-Waite-Smith: el mazo que Pamela Colman Smith ilustró y que Arthur Edward Waite ordenó, publicado en Londres en 1909 y hoy en dominio público. Es el vocabulario que usa casi todo el tarot moderno. Lo que hicimos fue una lectura editorial de esas {cartas} imágenes con una sola lente — los vínculos que quedaron a medias —, escrita a mano, carta por carta, antes de que tu tirada existiera.",
  "metodo.texto.fuente": "Rider-Waite-Smith Tarot. Pamela Colman Smith y A. E. Waite, William Rider & Son, Londres, 1909. Dominio público.",
  "metodo.texto.pie": "Por eso el texto de una carta es el mismo para todo el mundo: no se reescribe para ti. Lo que es tuyo es qué carta te salió y en qué posición cayó.",
  "metodo.offline.titulo": "No hay inteligencia artificial y no hay internet",
  "metodo.offline.cuerpo": "La lectura se arma entera dentro de tu teléfono. No hay modelo de lenguaje escribiendo frases, no hay servidor devolviendo el texto y no hay ninguna consulta saliendo a la red: todo el contenido ya venía dentro de la app cuando la instalaste.",
  "metodo.offline.prueba": "Y se puede comprobar sin creernos: pon el teléfono en modo avión y pide tu tirada. Sale igual.",
  "metodo.offline.pie": "Como nada sale, tampoco nada sube. Tu nombre y tus respuestas se quedan en este teléfono: no hay cuenta, no hay correo, no hay servidor. Esto vale para todo lo que lees aquí. La excepción está declarada: en los días de borra y de mano, el plan te lleva a una lectura con foto del Cosmic Guide — esa es otra pantalla, usa red e inteligencia artificial, y solo pasa si tú la abres.",
  "metodo.limites.titulo": "Dónde termina el método",
  "metodo.limites.entrada": "Un método honesto también dice dónde termina. Esta es la misma caja que aparece antes de cada resultado, y aquí dice exactamente lo mismo que allá:",
  "metodo.cierre": "Ese es el mecanismo completo: un mazo mezclado sin saber nada de ti, tus respuestas eligiendo la pregunta, y un texto escrito de antemano por personas. No hay una capa secreta debajo. Si algún día la hay, esta pantalla lo dice antes.",
  "metodo.ayuda": "Resolver un problema",
  "ajustes.sobreceja": "SOLO LO QUE HACE ALGO",
  "ajustes.titulo": "Ajustes",
  "ajustes.sub": "Cada control de aquí cambia algo de verdad, y todo vive en este teléfono. Lo que todavía no funciona, no está aquí.",
  "ajustes.recordatorio.titulo": "Recordatorio diario",
  "ajustes.recordatorio.sub": "Un aviso al día, a la hora que elijas.",
  "ajustes.recordatorio.previa": "Esto es lo que te llega",
  "ajustes.recordatorio.previa.variantes": "El aviso cambia de palabras según el día, y este es uno de los tres. Los tres dicen lo mismo: que tu día de hoy está abierto en el tablero.",
  "ajustes.recordatorio.aviso.app": "Madre Maria",
  "ajustes.recordatorio.aviso.cuando": "ahora",
  "ajustes.recordatorio.aviso.titulo": "La casa de hoy abrió",
  "ajustes.recordatorio.aviso.cuerpo": "Tu día ya está en el tablero, con el gesto y la misión de hoy. Cuando quieras, solo hay que raspar.",
  "ajustes.recordatorio.aviso.dos.titulo": "El nudo de hoy te espera",
  "ajustes.recordatorio.aviso.dos.cuerpo": "Se da cuando el día de hoy se cumple. Y si hoy no vienes, el hilo se queda quieto y espera igual.",
  "ajustes.recordatorio.aviso.tres.titulo": "Unos minutos tuyos, sin prisa",
  "ajustes.recordatorio.aviso.tres.cuerpo": "Tu día de hoy está listo aquí dentro. Unos minutos para ti, y nada más que eso.",
  "ajustes.recordatorio.pie": "Nada más que eso: un aviso al día, siempre a la misma hora. Sin novedades, sin ofertas y sin insistir si un día no vienes.",
  "ajustes.recordatorio.antesDelPermiso": "Al activarlo, tu teléfono pregunta si permites los avisos. Si dices que no, la app sigue funcionando igual.",
  "ajustes.recordatorio.activar": "Activar el recordatorio",
  "ajustes.recordatorio.desactivar": "Desactivar el recordatorio",
  "ajustes.recordatorio.estadoActivo": "Activado. Todos los días a las {hora}.",
  "ajustes.recordatorio.estadoInactivo": "Desactivado. Ahora mismo no llega ningún aviso.",
  "ajustes.recordatorio.hora": "Hora del aviso",
  "ajustes.recordatorio.horaMenos": "Una hora menos",
  "ajustes.recordatorio.horaMas": "Una hora más",
  "ajustes.recordatorio.enPunto": "En punto",
  "ajustes.recordatorio.yMedia": "Y media",
  "ajustes.recordatorio.negado": "Tu teléfono tiene los avisos bloqueados para la Madre Maria. Se desbloquean en los ajustes del sistema, y desde ahí vuelves aquí.",
  "ajustes.recordatorio.abrirSistema": "Abrir los ajustes del teléfono",
  "ajustes.recordatorio.sinCanal": "Esta versión todavía no puede enviarte avisos. Cuando pueda, se enciende desde aquí y con este mismo aviso.",
  "ajustes.recordatorio.errorProgramar": "No se pudo programar el aviso. Inténtalo de nuevo.",
  "ajustes.movimiento.titulo": "Movimiento reducido",
  "ajustes.movimiento.sub": "Las animaciones de la app: las cartas, el botón que se enciende y las pantallas que aparecen.",
  "ajustes.movimiento.sistema": "Seguir al sistema",
  "ajustes.movimiento.forzado": "Siempre reducido",
  "ajustes.movimiento.sistemaReduce": "Tu sistema está pidiendo movimiento reducido ahora mismo, y la app lo respeta.",
  "ajustes.movimiento.sistemaNormal": "Tu sistema no está pidiendo movimiento reducido ahora mismo.",
  "ajustes.movimiento.forzadoNota": "La app reduce el movimiento siempre, diga lo que diga el sistema.",
  "ajustes.haptica.titulo": "Vibración",
  "ajustes.haptica.sub": "El toquecito corto al raspar una carta y al dar el nudo del día.",
  "ajustes.haptica.prueba": "Así se siente. Si no notaste nada, tu teléfono la tiene apagada.",
  "ajustes.datos.titulo": "Tus datos",
  "ajustes.datos.sub": "Nada de esto salió nunca de este teléfono: no hay cuenta, no hay correo, no hay servidor.",
  "ajustes.datos.respuestas": "Borrar mis respuestas",
  "ajustes.datos.todo": "Borrar todo",
  "ajustes.confirmar.borra": "BORRA",
  "ajustes.confirmar.queda": "NO BORRA",
  "ajustes.confirmar.cancelar": "Mejor no",
  "ajustes.confirmar.respuestas.titulo": "¿Borrar tus respuestas?",
  "ajustes.confirmar.respuestas.borra": "Tu nombre y las respuestas del principio — incluida tu fecha de nacimiento. La próxima vez que abras la app, te las pregunta de nuevo.",
  "ajustes.confirmar.respuestas.queda": "Mi Hilo entero: tus nudos y tu récord se quedan donde están. Tu suscripción tampoco se toca.",
  "ajustes.confirmar.respuestas.boton": "Sí, borrar mis respuestas",
  "ajustes.confirmar.todo.titulo": "¿Borrar todo?",
  "ajustes.confirmar.todo.borra": "Tu nombre, tus respuestas — tu fecha de nacimiento con ellas —, Mi Hilo completo — los nudos y también el récord —, el recordatorio y estos ajustes. No hay copia en ningún otro lugar, así que no hay manera de deshacerlo.",
  "ajustes.confirmar.todo.queda": "Tu suscripción: vive en tu cuenta de la plataforma donde compraste, no aquí. Si algún día la necesitas, se recupera con \"Restaurar compra\".",
  "ajustes.confirmar.todo.boton": "Sí, borrar todo",
  "ajustes.borrado.respuestas": "Listo. Tus respuestas ya no están en este teléfono.",
  "ajustes.borrado.todo": "Listo. No quedó nada tuyo en este teléfono.",
  "ajustes.borrado.parcial": "Quedó algo sin borrar en este teléfono. Inténtalo de nuevo.",
  "ajustes.noGuardado": "No se pudo guardar este ajuste en el teléfono. Vale mientras la app esté abierta.",
  "ajustes.version": "Versión {version}",
  "ajustes.privacidad": "Privacidad",
  "ajustes.privacidad.borrar": "Para borrar lo que está guardado no hace falta hablar con nadie: se hace aquí arriba, en \"Tus datos\", y es inmediato.",
  "perfil.acceso.hilo": "Mi hilo — los días en que viniste",
  "perfil.acceso.mao": "La lectura de mi mano — con foto, si quieres",
  "paywall.livre.nota": "En esta versión, todo esto está abierto — solo entra. La suscripción llega más adelante, y nada de lo que es tuyo cambia cuando llegue.",
  "perfil.suscripcion.livre": "Todo abierto en esta versión. La suscripción llega más adelante — y nada de lo que es tuyo cambia cuando llegue.",

  /* ===================================================================
     ONDA — AS TELAS VIVAS QUE FALTAVAM (107 chaves).

     NAO estao aqui, e e deliberado, as 143 chaves ORFAS do PT: a copy das
     cinco telas que nao vieram na fusao com o Cosmic Guide (o Circulo, o
     album das 78, a tela de Leituras, a TiradaScreen, o cafe e a palma — os
     dois ultimos sao UM SO com os do Cosmic). Nenhuma tela viva as chama, e
     traduzir chave morta e ruido no placar para sempre. A lista inteira, com
     o motivo de cada grupo, esta em test/madremaria-i18n-orfas.js, e o portao
     de cobertura confere essa lista a cada corrida.
     =================================================================== */
  "tirada.rotulo.nudo": "EL NUDO",
  "tirada.rotulo.nudo.sub": "Donde se enredó",
  "tirada.rotulo.tension": "LA TENSIÓN",
  "tirada.rotulo.tension.sub": "Lo que tira hoy",
  "tirada.rotulo.extremo": "TU PUNTA",
  "tirada.rotulo.extremo.sub": "La punta del hilo que tú sostienes",
  "tirada.avisoOtraPersona": "Ninguna carta lee a esa persona. Ese extremo del hilo no está en esta app.",
  "tirada.carta.derecha": "Derecha",
  "tirada.carta.invertida": "Invertida",
  "scratch.label": "Raspa para revelar",
  "scratch.tap": "Revelar sin raspar",
  "scratch.a11y": "Lámina de metal sobre la carta de {posicion}. Raspa con el dedo, o actívala para revelar la carta entera.",
  "scratch.revelada": "{carta} revelada. Su lectura está justo abajo.",
  "lua.sobreceja": "LA PRÓXIMA LUNA NUEVA",
  "lua.quando": "{diaSemana}, {dia} de {mes}, a las {hora}.",
  "lua.nota": "Si entras antes de ella, esa luna nueva es tuya. Si entras después, la tuya es la siguiente — y la siguiente es dentro de veintinueve días y medio. Eso no es una regla nuestra: es la luna.",
  "limites.titulo": "Lo que esta lectura NO puede decirte",
  "limites.lineas": [
    "Si esa persona reaparece o no. Eso no está escrito en ninguna carta.",
    "Lo que siente quien está del otro lado. Ese extremo del hilo no está en esta app.",
    "Cuándo. El tarot no marca fecha, y quien te dé una se la está inventando.",
  ],
  "limites.pie": "Nada de esto es una falla de la app. Es el límite honesto de una lectura simbólica, y por eso está escrito antes de tu resultado y no después.",
  "audio.velocidade.1": "1x",
  "audio.velocidade.1.5": "1,5x",
  "audio.velocidade.2": "2x",
  "audio.velocidade.rotulo": "Velocidad de la voz: {valor}",
  "audio.velocidade.ajuda": "Toca para cambiar entre 1x, 1,5x y 2x.",
  "audio.ouvir": "Escuchar la carta",
  "audio.pausar": "Pausar",
  "missoes.titulo": "Las tres de hoy",
  "missoes.sub": "La fecha elige las tres. Al día siguiente, son otras.",
  "missoes.progresso": "{n} de {total}",
  "missoes.feita": "Hecha",
  "missoes.todasFeitas": "Las tres de hoy están hechas.",
  "missoes.pie": "Las tres son sobre ti y sobre tu tiempo. Ninguna de ellas involucra a quien está del otro lado.",
  "missoes.ler-ate-o-fim.titulo": "Lee la síntesis hasta la última línea",
  "missoes.ler-ate-o-fim.pista": "Bajar hasta el final cuenta. Es donde la lectura termina de verdad.",
  "missoes.resposta-do-ritual.titulo": "Deja tu respuesta en el día de hoy del ritual",
  "missoes.resposta-do-ritual.pista": "Una línea basta. Se queda en este teléfono, y es solo tuya.",
  "missoes.voltar-a-leitura.titulo": "Vuelve a la lectura de hoy más tarde",
  "missoes.voltar-a-leitura.pista": "Abrirla de nuevo y releer lo que quedó en la mesa. Sigue ahí todo el día.",
  "missoes.olhar-o-fio.titulo": "Abre tu hilo y mira su tamaño",
  "missoes.olhar-o-fio.pista": "Solo mirar. El hilo cuenta los días en que viniste, y nada más que eso.",
  "missoes.reler-suas-respostas.titulo": "Relee tus respuestas del inicio",
  "missoes.reler-suas-respostas.pista": "Están en tu perfil, tal como las dejaste.",
  "missoes.fonte-de-uma-carta.titulo": "Mira de dónde sale una carta",
  "missoes.fonte-de-uma-carta.pista": "La pantalla del Método nombra la obra de donde sale cada texto. Abrirla y mirar ya cuenta.",
  "missoes.o-que-nao-diz.titulo": "Lee lo que esta lectura no puede decir",
  "missoes.o-que-nao-diz.pista": "La caja de los límites está al final de la pantalla del Método. Bajar hasta allá cuenta.",
  "barra.plano": "El plan de hoy",
  "barra.plano.pista": "Abre el ritual de hoy, la pregunta del día y la acción.",
  "barra.perfil": "Perfil",
  // Canal do app hospedeiro — ver o racional em datos/textos.js.
  "legal.correo": SUPPORT_EMAIL,
  "legal.version": "Madre Maria · versión 2 · septiembre de 2026",
  "comunes.siguiente": "Continuar",
  "comunes.empezar": "Empezar",
  "comunes.volver": "Volver",
  "comunes.compartir": "Compartir",
  "comunes.guardar": "Guardar",
  "comunes.cerrar": "Cerrar",
  "comunes.pronto": "Pronto",
  "conquistas.titulo": "Lo que ya hiciste",
  "conquistas.sub": "Todo lo de aquí se contó en este teléfono, a partir de lo que hiciste.",
  "conquistas.pendente": "Todavía no",
  "conquistas.pie": "Ninguna de ellas tiene plazo y ninguna de ellas se pierde. Lo que está marcado queda marcado.",
  "conquistas.primeira-leitura.titulo": "La primera lectura",
  "conquistas.primeira-leitura.texto": "Abriste las tres cartas por primera vez.",
  "conquistas.tres-nos.titulo": "Tres nudos",
  "conquistas.tres-nos.texto": "Tres días seguidos en que viniste. El hilo empezó a tener tamaño.",
  "conquistas.sete-nos.titulo": "Siete nudos",
  "conquistas.sete-nos.texto": "Una semana entera de nudos, uno detrás del otro.",
  "conquistas.trinta-nos.titulo": "Treinta nudos",
  "conquistas.trinta-nos.texto": "Treinta días seguidos. Eso es raro, y es tuyo.",
  "conquistas.a-volta.titulo": "El regreso",
  "conquistas.a-volta.texto": "Un día pasó en blanco y volviste. El hilo estaba del tamaño que lo habías dejado.",
  "conquistas.primeira-invertida.titulo": "La primera invertida",
  "conquistas.primeira-invertida.texto": "Una carta cayó de cabeza y la leíste así mismo.",
  "conquistas.dez-cartas.titulo": "Diez cartas",
  "conquistas.dez-cartas.texto": "Diez cartas diferentes ya aparecieron en tus lecturas.",
  "conquistas.um-grupo.titulo": "Un grupo cerrado",
  "conquistas.um-grupo.texto": "Todas las cartas de un grupo de la baraja ya pasaron por aquí.",
  "conquistas.carta-que-volta.titulo": "La carta que vuelve",
  "conquistas.carta-que-volta.texto": "Una misma carta apareció tres veces para ti. Es la baraja siendo baraja.",
  "conquistas.meio-baralho.titulo": "Media baraja",
  "conquistas.meio-baralho.texto": "La mitad de las cartas ya apareció en alguna lectura tuya.",
  "conquistas.baralho-inteiro.titulo": "La baraja entera",
  "conquistas.baralho-inteiro.texto": "Todas las cartas de la baraja ya aparecieron para ti.",
  "conquistas.ritual-completo.titulo": "Los siete días",
  "conquistas.ritual-completo.texto": "Hiciste el ritual entero, del primer día al séptimo.",
  "fichas.unidade": "ficha",
  "fichas.unidade.plural": "fichas",
  "fichas.motivo.leitura": "Lectura de hoy",
  "fichas.motivo.ritual": "Un día del ritual",
  "fichas.motivo.missao": "Una misión del día",
  "fichas.motivo.carta": "Carta nueva en el álbum",
  "fichas.gasto.leituraExtra": "Una lectura más hoy",
  "barra.mapa": "Mapa",
  "coracao.aposta.rotulo": "LA APUESTA DE MAÑANA",
  "coracao.aposta.convite": "Y mañana, ¿cómo crees que llegas?",
  "coracao.aposta.guardada": "Guardada. Se abre la próxima vez que registres el corazón.",
  "coracao.aposta.acertos": "Ya acertaste {n} veces.",
  "coracao.aposta.leve.leve": "Apostaste ligero y llegaste ligero. Te conoces.",
  "coracao.aposta.leve.neutro": "Apostaste ligero. Llegaste neutro. Cerca — y el día fue tuyo.",
  "coracao.aposta.leve.pesado": "Apostaste ligero. Llegaste pesado. Los días cambian — registraste de verdad.",
  "coracao.aposta.neutro.leve": "Apostaste neutro. Llegaste ligero. El día sorprendió.",
  "coracao.aposta.neutro.neutro": "Apostaste neutro y llegaste neutro. Lectura fina de tu ritmo.",
  "coracao.aposta.neutro.pesado": "Apostaste neutro. Llegaste pesado. Lo miraste de frente y lo anotaste.",
  "coracao.aposta.pesado.leve": "Apostaste pesado. Llegaste ligero. Fuiste más fuerte de lo que decía la víspera.",
  "coracao.aposta.pesado.neutro": "Apostaste pesado. Llegaste neutro. La víspera pesaba más que el día.",
  "coracao.aposta.pesado.pesado": "Apostaste pesado y llegaste pesado. Te escuchaste — y viniste así mismo.",
};

export default ES;
