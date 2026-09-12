// datos/profunda.es.js
// EL ESPAÑOL de la lectura profunda — los cinco bloques de la variante A y los
// cinco de la B.
//
// Arquivo de UM tradutor so, no mesmo molde de datos/textos.es.js: o portugues
// fica em datos/profunda.js (intocado), o ingles em datos/profunda.en.js.
//
// ===========================================================================
// LEIA ISTO ANTES DE MUDAR UMA PALAVRA: O CONTRATO QUE ESTE ARQUIVO **NAO** TEM
// ===========================================================================
// O portugues de datos/profunda.js tem um contrato duro, escrito no cabecalho
// dele: `texto` NAO e resumo nem parafrase — e a TRANSCRICAO palavra por palavra
// do .m4a gravado na voz clonada. E datos/profunda-tempos.json guarda, frase por
// frase, o segundo em que a voz diz cada uma, para a tela acender a frase que
// esta soando (components/TextoNoRitmo.js).
//
// OS AUDIOS SAO SO EM PORTUGUES. Nao existe .m4a espanhol destes dez blocos.
// Por isso este arquivo NAO herda o contrato do portugues, e isso e uma decisao
// declarada, nao um descuido:
//
//   1. O TEXTO TRADUZIDO NAO E TRANSCRICAO DE NADA. Ele e a traducao fiel do que
//      a voz portuguesa diz. Quem abre o app em espanhol LE em espanhol e, se
//      apertar o botao, OUVE em portugues. A tela avisa que ha audio; ela nao
//      promete idioma.
//
//   2. O REALCE POR FRASE DESLIGA SOZINHO, e por construcao. `trechosDe` em
//      datos/profunda.js casa os tempos do JSON com as frases do texto; em
//      espanhol as frases nao sao as mesmas, entao a funcao entrega os
//      PARAGRAFOS com `ini: null` — o caminho de degradacao que aquele arquivo
//      ja documenta ("a tela desenha exatamente o que desenhava antes desta
//      feature, nada acende, e nada quebra"). NAO tentar alinhar tempo
//      portugues com frase espanhola: acenderia a frase errada, que e pior do
//      que nao acender nenhuma.
//
//   3. QUANDO OS AUDIOS FOREM GRAVADOS EM ESPANHOL, este arquivo passa a ser a
//      fonte do roteiro deles — e no MESMO commit da gravacao entra um
//      profunda-tempos.es.json e o `trechosDe` ganha o idioma. Enquanto isso nao
//      acontecer, o que existe aqui e honesto: texto inteiro, sem realce.
//
// ===========================================================================
// O QUE SE TRADUZ
// ===========================================================================
//   titulo  rotulo de navegacao do card
//   texto   o corpo do bloco, com os '\n\n' entre paragrafos INTACTOS
//           (datos/profunda.js corta por eles em paragrafosDe)
//
// NAO SE TRADUZ: `id` e `audio`. Sao endereco de dado e nome de arquivo .m4a
// resolvido por require ESTATICO pelo Metro — mudar qualquer um dos dois deixa
// o progresso de quem ja ouviu orfao e o botao de ouvir invisivel, sem erro
// nenhum.
//
// NUMERO DE PARAGRAFOS: o mesmo do portugues em todos os dez blocos. Nao e
// capricho — `paragrafosDe` desenha um <Cuerpo> por paragrafo, e o teste de
// forma de test/madremaria-profunda.test.js cobra dois no minimo.
//
// ===========================================================================
// ENCANTAMENTO HONESTO — E A RECUSA, QUE E O CORACAO DISTO
// ===========================================================================
// O bloco 11 (e o b5) nao so evita a promessa: ele a RECUSA em voz alta. Essa
// recusa e o que separa este produto de todo mundo que promete, e em espanhol
// ela tinha de continuar sendo recusa e nao virar promessa envergonhada:
//
//   PT  "Eu não vou te dizer que essa pessoa vai voltar. Ninguém pode te dizer
//        isso, e quem diz está inventando."
//   ES  "Yo no voy a decirte que esa persona va a volver. Nadie puede
//        decirte eso, y quien lo dice está inventando."
//
// "va a volver" aparece aqui DENTRO DA NEGACAO, e e a unica forma de a frase
// existir. O portao de doutrina
// (test/madremaria-promessa-tres-idiomas.test.js) conhece esse caso: ele julga
// frase por frase e reconhece RECUSA explicita — verbo de dizer negado
// ("no voy a decirte", "nadie puede decirte"), nunca um "no" solto. Se esta
// frase for reescrita, ela tem de CONTINUAR tendo o verbo de dizer negado na
// mesma frase, senao o portao a acusa — e ele esta certo em acusar.
//
// Fora da recusa, nenhuma promessa entra: nenhum bloco diz que a outra pessoa
// volta, escreve ou procura. O unico compromisso que o texto assume e o que o
// app CUMPRE (devolver na decima terceira lua o que a pessoa escreveu na
// primeira), e ele esta nomeado como "la única que puedo cumplir".
//
// GENERO: neutro dos dois lados. A pessoa do outro lado e sempre "esa persona".
// O fecho portugues diz "quem sabe isso ja nao e a mesma pessoa" justamente
// para nao travar genero (ver a nota de 11/09 em datos/profunda.js) — aqui isso
// se mantem: "quien sabe eso ya no es la misma persona".
//
// TRATAMENTO: tu, como datos/textos.es.js fixou.

/* A RECUSA, numa LINHA SO — o mesmo motivo do portugues: o portao reconhece a
 * recusa pelo conteudo da FRASE, e quebrar a linha no meio dela nao muda o
 * texto, mas deixa a intencao mais facil de estragar na proxima edicao. */
const P11_RECUSA_ES =
  'Yo no voy a decirte que esa persona va a volver. Nadie puede decirte eso, y quien lo dice está inventando. Y yo sé que ya se lo escuchaste a alguien — a una aplicación, a una carta de baraja, a alguien que te cobró por eso. Estuvo bueno dos días. Después no quedó nada.';

const P11_VAI_SABER_ES =
  'Lo que sí puedo decirte es lo que veo desde acá: vas a llegar al final de estas trece lunas sabiendo cosas de ti que hoy no sabes. Vas a saber a qué hora aprieta la nostalgia. Vas a saber separar lo que sabes de lo que estás completando por tu cuenta. Y vas a saber lo que aceptas y lo que ya no aceptas. Quien sabe eso ya no es la misma persona. Y lo que pasa con tu amor, sea con esa persona o con otra, es distinto de lo que pasa hoy.';

const P11_RESTO_ES =
  'Ahora tengo que decirte algo que no voy a terminar acá. Hay un punto en estas tres cartas que hoy no te voy a contar, y no es maldad: es que solo tiene sentido después de que respondas la primera pregunta de la primera luna — la que te pide que cuentes lo que pasó con tus palabras, sin arreglarle la frase a nadie.\n\n'
  + 'Tu lectura de hoy queda guardada ahí dentro, entera, y puedes volver a abrirla cuando quieras. Pero escribe tu versión ANTES de reabrir la mía. En ese orden la cosa aparece. En el orden contrario le arreglas la frase para que entre en lo que yo dije, y ahí el ejercicio entero se pierde.\n\n'
  + 'Y hay algo que prefiero decirte ahora antes de que lo descubras mañana. Todos los días va a haber un gesto esperándote ahí dentro. Vas a ver cuál es, y vas a ver cuánto tiempo cuesta. Lo que no se abre solo es el cómo se hace. Los pasos.\n\n'
  + 'Y no voy a fingir que eso es un detalle para dejarte cómoda. El cómo se hace es la cosa entera: es donde haces algo, en vez de solo leer sobre. Es la diferencia entre pasar un día más pensando en esa persona y salir del lugar.\n\n'
  + 'Necesito que abras esa parte decidiendo. No porque apareció en la pantalla, no en un día en que no tenías nada que hacer. Decidiendo. Porque lo que viene después te pide eso todos los días, y el primer día es el que enseña a todos los que vienen detrás.\n\n'
  + 'Y te voy a decir lo que te espera del otro lado de esa puerta, porque tienes derecho a saberlo antes de decidir.\n\n'
  + 'Todos los días, un gesto. Uno solo, con su tiempo contado. Las primeras lunas son solo tuyas: tu piso, tu voz, tu manera de responder. Después empiezan los pasos que esa persona ve, uno por semana, en el orden justo.\n\n'
  + 'Empieza con una frase amable que no pide nada. Después un gracias con dirección, por una cosa específica. Después una pregunta sobre el día, sin cobrar respuesta. Después un recuerdo bueno, compartido sin anzuelo. Después dos minutos escuchando sin cortar. Y más adelante, cuando estés de pie, la invitación. Y el error asumido entero, sin peros, que es el escalón que casi nadie tiene el valor de subir.\n\n'
  + 'Uno no se abre antes del otro. Si uno duele, o cae en el vacío, ahí frenamos, volvemos a tu piso por unos días, y subimos de nuevo cuando estés firme. No es prisa. Es orden.\n\n'
  + 'En trece lunas, lo que esa persona ve no es a ti pidiendo. Es a ti distinta. Y eso no se explica, se muestra. Tú no vas detrás. Te vuelves imposible de no notar.\n\n'
  + 'Y hay una hora. Tu primera luna no empieza cuando tú decides: empieza en la próxima luna nueva, que ya tiene día y hora marcados en el cielo — y estás viendo los dos escritos acá en la pantalla, ahora. Si entras antes de ella, esa luna nueva es tuya. Si entras después, la tuya es la siguiente, y la siguiente es dentro de veintinueve días y medio. Esto no es una regla mía. Es la luna, y ella no espera a nadie.\n\n'
  + 'Tu primera luna está ahí. ¿Vamos?';

/** Los cinco bloques de la variante A, por id. */
export const PROFUNDA_ES = {
  'profunda-7': {
    titulo: 'Más piedra de la que debía',
    texto:
      'Veo un camino que tuvo más piedra de la que debía, y, a pesar de eso, tu determinación es notable. Cada cosa que conseguiste fue fruto de tu propio esfuerzo. Me di cuenta de que fueron pocos los que te tendieron la mano a lo largo de ese camino.\n\n'
      + 'Hay días en que despiertas bien, y hay días en que levantarte ya es el trabajo entero. Algunos días son más livianos, otros pesan más de lo que deberían. Y ese peso parece no ser solo tuyo.\n\n'
      + 'Hubo cambios importantes en tu vida en un período reciente.\n\n'
      + 'En cuanto al amor: esa persona por la que sientes lo que sientes no te trajo la felicidad que merecías. Al contrario, te hizo sufrir. Y aun estando lejos, todavía ocupa tus pensamientos.',
  },

  'profunda-8': {
    titulo: 'El nudo no se desató en un día',
    texto:
      'Ahora tengo que decirte algo sobre lo que mostraron esas tres cartas.\n\n'
      + 'El nudo que apareció ahí no se ató en un día, y tampoco se va a desatar en un día. Se fue apretando de poco — una conversación que no pasó, una respuesta que quedó fría, un silencio que duró más de lo que debía.\n\n'
      + 'Y por eso no te voy a prometer un vuelco de un día para el otro. Quien te promete eso te está vendiendo prisa, y la prisa en asuntos de amor suele apretar más el nudo.\n\n'
      + 'Lo que yo te voy a ofrecer es otra cosa: tiempo. Trece lunas, una por vez, y cada una de ellas con un trabajo tuyo.',
  },

  'profunda-9': {
    titulo: 'Trece lunas en un año',
    texto:
      '¿Ya te fijaste en que la luna nunca se repite igual? Tarda veintinueve días y medio en cerrar una vuelta entera. No son veintiocho, no es un mes del calendario: son veintinueve días y medio, contados en el cielo.\n\n'
      + 'Y son trece de esas vueltas. Trece lunas.\n\n'
      + 'Así fue como armé tu camino. Cada luna es un trabajo distinto, y empieza la noche en que la luna nace oscura y cierra cuando vuelve a oscurecer.\n\n'
      + 'La primera luna es para nombrar lo que pasó, con tus palabras, sin arreglarle la frase a nadie. La sexta es para mirar tu parte, y llega a mitad del camino a propósito, porque preguntada demasiado temprano esa pregunta se vuelve culpa.\n\n'
      + 'Y ahora te voy a decir lo único que prometo acá dentro. Lo que escribas en la primera luna queda guardado en este teléfono. Y en la decimotercera, cuando la luna cierre la vuelta entera y llegue de nuevo al mismo punto del cielo, te lo devuelvo con tus palabras, con la fecha del día en que lo escribiste, sin una coma cambiada.\n\n'
      + 'No es la promesa que querías escuchar de mí. Pero es la única que puedo cumplir — y esa la cumplo.',
  },

  'profunda-10': {
    titulo: 'Cinco minutos, todos los días',
    texto:
      'Ahora, todos los días vas a abrir esto acá y vas a encontrar tres cosas.\n\n'
      + 'La primera es el cielo de ese día. En qué fase está la luna, qué día de la semana es en el calendario antiguo — porque cada día tiene su planeta, y eso es más viejo que cualquiera de nosotros.\n\n'
      + 'La segunda es el trabajo del día. Son cinco gestos que giran con el cielo, cada uno con su nombre y su hora justa de aparecer. Uno de ellos usa una cosa que está en tu cocina ahora. Otro no pide nada más que a ti. Cuál cae en cuál día, no lo elijo yo y no lo eliges tú: es el día el que elige.\n\n'
      + 'El cómo se hace cada uno no te lo voy a contar ahora — y no es un secreto para retenerte: es que el gesto pierde fuerza si lo sabes antes de la hora. Lo que sí te digo es el tamaño: cinco minutos. No importa la hora, no importa el lugar. Ese es el precio, y es el precio entero.\n\n'
      + 'Pero hay una condición, y esa no se negocia: es todos los días. Un gesto prepara al siguiente, y es la repetición la que trabaja — como el sueño: no existe dormir la semana entera en una sola noche.\n\n'
      + '¿Y qué tiene que ver esto con que esa persona vuelva? Todo. Correr detrás no trae a nadie — eso ya lo sabes. Estos gestos dan la vuelta al juego: cada día acomoda un pedazo tuyo, hasta que reaparece la versión de ti que esa persona eligió allá al principio. Y cuando haya conversación, el plan entra con ella: la hora de responder, la hora del silencio, lo que no se dice. Esto no es esperanza. Es estrategia, un día por vez.\n\n'
      + 'Y la tercera es tu parte. Una pregunta que solo tú respondes, escrita ahí dentro, que no sale de este teléfono y nadie más lee.',
  },

  'profunda-11': {
    titulo: 'Tu primera luna',
    texto: `${P11_RECUSA_ES}\n\n${P11_VAI_SABER_ES}\n\n${P11_RESTO_ES}`,
  },

  /* ===================================================================
     LA VARIANTE B — la misma esencia, con las imágenes de sus cartas
     (la montaña, los caminos, la llave, el ancla, las estrellas).
     =================================================================== */
  'profunda-b1': {
    titulo: 'Una montaña en el camino',
    texto:
      'Veo una montaña en tu camino. Ya intentaste rodearla, ya intentaste subirla a la fuerza, y la montaña sigue ahí. Pero lo que me llama la atención no es la montaña. Es que no dejaste de caminar. Todo lo que conseguiste fue con tu propio paso. Había mucha gente cerca. Ayudando, casi nadie.\n\n'
      + 'Hay días en que la subida es liviana. Y hay días en que la montaña empieza al borde de la cama. Conoces ese peso. Y ese peso no es solo tuyo: hay piedra ahí que dejó otra persona, y la cargas como si fuera tuya.\n\n'
      + 'Hubo un cambio grande en tu vida en un tiempo reciente, y todavía estás acomodando las cosas en el lugar nuevo.\n\n'
      + 'Y en cuanto al amor: esa persona por la que sientes lo que sientes no te trajo la paz que merecías. Trajo más peso que abrazo. Y aun de lejos, esa persona todavía vive en tus pensamientos. Esa es la montaña que apareció acá.',
  },

  'profunda-b2': {
    titulo: 'No se atraviesa en un día',
    texto:
      'Esa montaña no apareció en un día, y tampoco se atraviesa en un día. Fue subiendo piedra por piedra: un dejarlo pasar encima del otro, una herida que te tragaste para no pelear, un día en que fingiste que todo estaba bien.\n\n'
      + 'Por eso no te voy a prometer un vuelco de un día para el otro. Quien te promete atajo en esa montaña te está empujando prisa. Y la prisa, en asuntos de amor, suele poner más piedra encima.\n\n'
      + 'La segunda carta es la que me interesa. Los Caminos. Una bifurcación: dos caminos, y ninguno con cartel. Ya llevas un tiempo en esa encrucijada, mirando a los dos lados, esperando un cartel. Elegir sin garantía incomoda, lo sé. Pero quedarse en la encrucijada también es una elección. Y esa ya la conoces.\n\n'
      + 'Lo que yo te voy a ofrecer es otra cosa: tiempo. Trece lunas, una por vez, repartidas en trece tramos. Y cada tramo con un paso tuyo.',
  },

  'profunda-b3': {
    titulo: 'Trece lunas y una llave',
    texto:
      'La luna no tiene prisa y no se equivoca en la cuenta. Tarda veintinueve días y medio en nacer oscura, llenarse y oscurecer de nuevo. Y son trece de esas. Trece lunas.\n\n'
      + 'Por ellas dividí tu montaña en trece tramos. La primera luna es para nombrar lo que pasó, con tus palabras, sin arreglarle la frase a nadie. La sexta es para mirar tu parte, y llega en el medio a propósito, porque demasiado temprano se vuelve culpa.\n\n'
      + 'Y acá entra la tercera carta, la Llave. Una llave no derriba montañas. Lo que dice la llave es que existe una puerta en ese asunto. Por encima no se puede. El camino es por dentro, una luna por vez.\n\n'
      + 'Ahora lo único que te prometo. Lo que escribas en la primera luna queda guardado acá dentro. En la decimotercera, cuando la luna vuelva al punto de donde salió, te devuelvo esa línea con tus palabras. Con la fecha del día. Sin una coma fuera de lugar.\n\n'
      + 'No es la promesa que querías escuchar. Pero es la única que puedo cumplir. Y esa la cumplo.',
  },

  'profunda-b4': {
    titulo: 'Cinco minutos, un ancla',
    texto:
      'Todos los días abres esto acá y encuentras tres cosas.\n\n'
      + 'La primera es el cielo de ese día: la fase de la luna.\n\n'
      + 'La segunda es el gesto del día. Son cinco gestos que giran con el cielo, cada uno con su propio nombre y el día justo de aparecer. Uno de ellos cabe en tu mano. Otro lo haces sin moverte del lugar. El cómo se hace queda ahí dentro. Lo que sí te digo es el tamaño: cinco minutos.\n\n'
      + 'Pero hay una condición, y esa no se negocia: es todos los días. Es la carta que raspaste al final, el Ancla. Un ancla no sostiene por ser grande. Sostiene porque está ahí cuando el agua se mueve. Esos cinco minutos son tu ancla, el pedazo del día que no se balancea.\n\n'
      + '¿Y qué tiene que ver esto con esa persona? Todo, porque la única parte de esta historia que depende de ti es la tuya. Cada día acomoda un pedazo tuyo. Y cuando haya conversación, el plan entra con ella: la hora de responder, la hora del silencio. Esto no es esperanza. Es piso, un día por vez.\n\n'
      + 'La tercera es tu parte: una pregunta que solo tú respondes. Y mañana, la primera cosa que ves es la línea que escribiste hoy. Es el hilo.',
  },

  'profunda-b5': {
    titulo: 'Esa estrella es tuya',
    texto:
      'Yo no voy a decirte que esa persona va a atravesar esa montaña en tu dirección. Nadie puede decirte eso. Quien lo dice está inventando. Ya lo escuchaste: de una aplicación, de una carta, de alguien que te cobró por eso. Estuvo bueno dos días. Después no quedó nada.\n\n'
      + 'La Estrella no saca a nadie de la montaña. Solo muestra la dirección. La dirección se encuentra mirando hacia arriba. Esa estrella es tuya. Si llegas a la decimotercera, vas a saber cosas de ti que hoy no sabes. Quien sabe eso ya no es quien empezó la subida.\n\n'
      + 'Hay un punto en estas cartas que solo te cuento después de que respondas la primera pregunta de la primera luna. La lectura de hoy queda guardada ahí dentro. Escribe tu versión antes de reabrir la mía.\n\n'
      + 'Y hay algo que prefiero decir ahora. El gesto del día va a estar ahí esperándote: ves cuál es, cuánto tiempo cuesta. Lo que no se abre solo es el cómo se hace. Esa puerta, la de la llave, necesito que la abras decidiendo.\n\n'
      + 'Y te voy a decir lo que te espera del otro lado de esa puerta, porque tienes derecho a saberlo antes de decidir.\n\n'
      + 'Todos los días, un paso en la montaña. Uno solo, con su tiempo contado. Las primeras lunas suben tu lado: tu piso, tu voz, tu manera de responder. Después la llave empieza a abrir la otra parte, los pasos que esa persona ve, uno por semana, en el orden justo.\n\n'
      + 'Empieza con una frase amable que no pide nada. Después un gracias con dirección, por una cosa específica. Después una pregunta sobre el día, sin cobrar respuesta. Después un recuerdo bueno, compartido sin anzuelo. Después dos minutos escuchando sin cortar. Y más adelante, cuando el pie esté firme, la invitación. Y el error asumido entero, sin peros, que es el escalón que casi nadie tiene el valor de subir.\n\n'
      + 'Un escalón no se abre antes del otro. Si uno de ellos duele, o cae en el vacío, ahí afirmamos el ancla, bajamos a tu piso por unos días, y subimos de nuevo cuando el pie esté seguro. No es prisa. Es el orden de la subida.\n\n'
      + 'En trece lunas, lo que esa persona ve no es a ti pidiendo. Es a ti distinta. Y eso no se explica, se muestra. Tú no vas detrás. Te vuelves imposible de no notar.\n\n'
      + 'Y hay una hora. Tu primera luna no empieza cuando tú decides: empieza en la próxima luna nueva, con día y hora marcados en el cielo, escritos acá en la pantalla, ahora. La luna no espera a nadie.\n\n'
      + 'Tu primera luna está ahí. ¿Vamos?',
  },
};

export default PROFUNDA_ES;
