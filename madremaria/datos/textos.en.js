// datos/textos.en.js
// O INGLES da Madre Maria. Arquivo de UM tradutor so: quem traduz para o
// espanhol trabalha em datos/textos.es.js, e ninguem dos dois mexe no portugues
// (datos/textos.js). Tres arquivos disjuntos, zero conflito de merge.
//
// ===========================================================================
// COMO PREENCHER
// ===========================================================================
// Copie a chave do PT (datos/textos.js) EXATAMENTE como ela esta, escreva o
// valor em ingles, e siga. Nada mais:
//
//     'app.tagline': 'Three cards for the story that stopped halfway',
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
//    ingles com o NOME EM PORTUGUES intacto. Quem chama t() passa por esse
//    nome; traduzir o marcador ('{nombre}' -> '{name}') quebra a interpolacao
//    em silencio e a pessoa ve "{name}" literal na tela.
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
// ENCANTAMENTO HONESTO — VALE EM INGLES TAMBEM
// ===========================================================================
// A doutrina esta em madremaria/theme.js:80: "nunca um desfecho, nunca uma
// promessa sobre o que a outra pessoa vai fazer". O app CONVIDA; ele nunca
// garante que o amor volta.
//
// Isto NAO e uma regra sobre o portugues: e uma regra sobre o app. Uma traducao
// que promete e uma violacao NOVA, mesmo quando o original nao promete — e e
// facil de cometer sem querer, porque o ingles de nicho amoroso tem formula
// feita para isso. Nenhuma destas entra aqui:
//
//     "will come back", "is coming back", "will text you", "will reach out",
//     "you will win them back", "in X days", "guaranteed", "for sure",
//     "destiny will bring", "manifest them back"
//
// O padrao certo: descrever o que a CARTA mostra, e fechar numa acao de QUEM
// ESTA LENDO. "This card shows where it got tangled" — sim. "This card shows
// they will come back" — nunca.
//
// Tambem nao entram: prova social inventada (porcentagem de usuarias, contador
// de gente, depoimento), alegacao de saude, e suposicao do genero de quem esta
// do outro lado — use "that person", "whoever is on the other side", "they".
//
// A lista de verbos proibidos que ABORTA o build vive nos testes de copy; ela
// foi escrita contra o portugues. Um verbo ingles de promessa pode passar por
// ela e chegar na loja. Quem traduz e o ultimo portao desta linha.

import { SUPPORT_EMAIL } from '../../lib/supportContact.js';

export const EN = {
  /* ================================================================================
   * LOTE: THE THREAD · THE SYNTHESIS · THE RITUAL · ERRORS AND EMPTY STATES
   * (58 keys)
   * ============================================================================= */

  /* --- THE SYNTHESIS (screens/SintesisScreen.js) ----------------------------------
   * Title and greeting arrive already assembled from lib/lectura.js.
   * 'sintesis.titulo' is both the screen title AND the title on the shareable card
   * that leaves the phone: short, no name in it. */
  'sintesis.titulo': 'Your thread, today',
  'sintesis.saludo': '{nombre}, this is what was left on the table.',
  'sintesis.bloque.lectura': 'WHAT THE THREE CARDS SHOW',
  'sintesis.bloque.tuparte': 'THE PART YOU HOLD',
  'sintesis.bloque.accion': 'ONE ACTION FOR TODAY',
  'sintesis.accionNota':
    'This action is yours and it completes on its own: it needs no one else to do anything.',
  'sintesis.metodo':
    'This is a symbolic reading. The cards know nothing about your story: what they do is give you three fixed images — the knot, the tension and your end of it — so you can look at what is yours from the outside and in other words. What you just read describes what each card shows and ends in something you can do. It is not a prediction, it does not speak for anyone else, and it decides nothing for you.',
  'sintesis.cierre':
    'The reading ends here, {nombre}. What comes next happens outside the app.',
  'sintesis.guardada': 'Saved to My Thread',

  /* --- THE THREAD (screens/HiloScreen.js) -----------------------------------------
   * 'hilo.unidad' carries ONLY the plural: unidadNudos() (HiloScreen.js:316) derives
   * the singular by dropping the last letter. "knots" -> "knot" works; a word whose
   * plural is not +s would break the singular silently.
   * 'hilo.rachaRota' and 'hilo.record' are the pair for the still state — the plain
   * fact, then what she still holds. Never loss, never an offer to buy the streak
   * back. "Stopped", not "broken": the screen header (HiloScreen.js:10-17) bans any
   * image of something that goes out, and any word of loss. */
  'hilo.titulo': 'My Thread',
  'hilo.sub': 'One knot for every day you came to read.',
  'hilo.unidad': 'knots',
  'hilo.conteo': '{n} {unidad}',
  'hilo.hoyListo': "Today's knot is already tied.",
  'hilo.vacio': 'No knots yet. The first one is tied with today’s reading.',
  'hilo.rachaRota': 'The thread did not break. It went still.',
  'hilo.record': 'Your longest thread is still {n}. That does not get erased.',
  'hilo.retomar': 'Pick up where it stopped',
  'hilo.panel.albumVazio': 'The album begins with your first reading.',
  'hilo.panel.albumVer': 'Open the album',
  'hilo.panel.ritualTitulo': 'The seven-day ritual',
  'hilo.panel.ritualProgresso': '{n} of {total} days closed.',
  'hilo.panel.ritualAbrir': 'Open the ritual',
  'hilo.panel.fichasTitulo': 'Your tokens',
  'hilo.panel.fichasSaldo': '{n} {unidade}',
  'hilo.panel.fichasPara': 'They open one more reading on the same day, for {preco}.',

  /* --- THE RITUAL (screens/RitualScreen.js) ---------------------------------------
   * Seven days, one step a day. No hurry and no punishment: no "only three days
   * left", no "don't give up now", no countdown. 'ritual.hecho.porque' says why
   * tomorrow cannot be pulled forward, and says it without asking for anything. */
  'ritual.sobreceja': 'DAY {n} OF {total}',
  'ritual.titulo': 'The seven-day thread',
  'ritual.cargando': 'One moment.',
  'ritual.carta.rotulo': "TODAY'S CARD",
  'ritual.carta.sinContacto':
    'Part of this card pointed outward, and it stayed out: today completes in you.',
  'ritual.carta.sinFuturo':
    'Part of this card spoke of what comes later, and it stayed out: no card reads what has not happened yet.',
  'ritual.carta.nota':
    'Drawn just now, from the 22 major arcana. Nobody chose it for you, not even us. A different one comes out each day.',
  'ritual.pregunta.rotulo': "TODAY'S QUESTION",
  'ritual.campo.placeholder': 'However it comes out, without fixing the sentence.',
  'ritual.campo.nota':
    'Writing is optional. Whatever you write stays on this phone, with the date, and you can read it again whenever you want.',
  'ritual.gesto.rotulo': "TODAY'S GESTURE",
  'ritual.gesto.nota':
    'It fits in five minutes and it is yours: it completes on its own, with no one else having to do anything.',
  'ritual.cerrar': 'Close day {n}',
  'ritual.hecho.rotulo': 'DAY {n} CLOSED',
  'ritual.hecho.proximo': 'Next comes day {n}.',
  'ritual.hecho.porque':
    'It is one step a day, and that is what keeps it down to five minutes. Day {n} stays here waiting, just as it is.',
  'ritual.hecho.escrito': 'WHAT YOU WROTE TODAY',
  'ritual.hecho.sinTexto': "Today you wrote nothing. The day's knot is tied all the same.",
  'ritual.espejo.rotulo': 'WHAT YOU WROTE ON DAY {n}',
  'ritual.espejo.fecha': 'Day {n}, on {fecha}.',
  'ritual.espejo.pie':
    'It is your text, with the date you wrote it. The app keeps it and gives it back: it does not compare the two days and it concludes nothing about you.',
  'ritual.espejo.sinTexto':
    'On day {n} you wrote nothing. What stayed on record is the date: {fecha}.',
  'ritual.fin.sobreceja': 'SEVEN OF SEVEN',
  'ritual.fin.titulo': 'Seven days, seven knots.',
  'ritual.fin.cuerpo':
    'You reached the end, and the end was set from day 1. Seven days in which you came, and each one is here below with its date.',
  'ritual.fin.guardado':
    'Starting over opens a blank day 1 and erases these seven entries from this device. The knots in your thread do not get erased.',
  'ritual.fin.reiniciar': 'Start over, on day 1',
  'ritual.fecha': '{mes} {dia}',
  'ritual.meses': [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],

  /* --- ERRORS (failure states; the app owns the failure and never hands it back as
   * the reader's fault) ----------------------------------------------------------- */
  'errores.guardado':
    'It could not be saved on this phone. Your reading stays on the screen until you close it.',
  'errores.compartir': 'Sharing would not open. Try again.',
  'errores.generico': 'Something went wrong on our side. Try again.',
  /* =========================================================================
   * LOTE 1 — A ENTRADA DO FUNIL (apresentacao, onboarding, entrada, profunda).
   * Tudo o que a pessoa ve ANTES de entrar no app. Traduzido de datos/textos.js.
   *
   * Decisoes que valem para o lote inteiro:
   *   · "Madre Maria" e nome proprio: nunca "Mother Mary".
   *   · A outra pessoa e sempre "that person" / "they": nunca "he", nunca "she"
   *     (doutrina theme.js:80, regra 4).
   *   · Os marcadores ficam com o nome em portugues: {nombre}, {n}, {total},
   *     {ordem}. Traduzir o nome do marcador quebra t() em silencio.
   *   · Nenhuma linha diz que a pessoa volta, escreve ou responde. O que a carta
   *     SHOWS, e o passo de QUEM LE — nada mais. Em ingles a armadilha e o
   *     futuro simples: "will" virou palavra proibida neste lote inteiro, a nao
   *     ser quando o sujeito e quem le ("you").
   * ========================================================================= */

  /* --- APP ---------------------------------------------------------------- */
  'app.nombre': 'Madre Maria',
  /* Assinatura do app (cartao de compartilhar, SintesisScreen). "stopped halfway"
     e o inacabado do PT ("ficou pela metade"); "unfinished" diria que falta
     acabar — e promete um acabamento. */
  'app.tagline': 'Three cards for the story that stopped halfway',

  /* --- ONBOARDING --------------------------------------------------------- */
  'onboarding.progreso': '{n} of {total}',
  'onboarding.errorNombre': 'Write at least one letter to go on.',
  'onboarding.errorFecha':
    'Check the day, the month and the year: that date is not on the calendar — or it has not arrived yet.',
  'onboarding.datosNo':
    'We ask your name, what happened, your date of birth and how to talk to you. Nothing else: nothing about that person, no location, no contact from your address book. What the reading does not use is not asked for.',
  'onboarding.privacidad':
    'Everything stays on this phone. There is no account, no email, no server.',
  'onboarding.listo': 'Done. Your three cards are already on the table.',

  /* --- LEITURA DE ENTRADA ------------------------------------------------- */
  'entrada.sobreceja': 'YOUR OPENING READING',
  'entrada.titulo': 'Three cards, read out loud',
  'entrada.saudacao': '{nombre}, your three cards are already on the table.',
  'entrada.saudacaoSemNome': 'Your three cards are already on the table.',
  'entrada.abertura':
    'Three cards from the Lenormand deck, one at a time. You scratch the card with your finger, you hear the reading in the voice of the one who reads, and the same text stays written just below.',
  'entrada.escolha.abrir': 'See the cards on the table',
  'entrada.comecar': 'See the first card',

  /* --- A MESA DOS SEIS VERSOS -------------------------------------------- */
  'entrada.escolha.titulo': 'Six cards face down',
  'entrada.escolha.texto':
    'Touch three of them. They open one at a time, in the order you touch them, and you scratch each one with your finger.',
  'entrada.escolha.contagem': '{n} of {total} touched',
  'entrada.escolha.verso': 'Card face down, {n} of {total}. Touch to take this one.',
  'entrada.escolha.versoEscolhido':
    'Card face down, {n} of {total}. It is yours already: it was your number {ordem}.',

  'entrada.progresso': 'Card {n} of {total}',
  'entrada.posicao.1': 'THE FIRST',
  'entrada.posicao.2': 'THE SECOND',
  'entrada.posicao.3': 'THE THIRD AND LAST',
  'entrada.posicao.4': 'THE EXTRA CARD',
  'entrada.posicao.5': 'THE STAR CARD',

  /* --- A APRESENTACAO DA MADRE MARIA ------------------------------------- */
  'apresentacao.sobreceja': 'WHO WILL READ YOUR CARDS',
  'apresentacao.titulo': 'Madre Maria',
  /* TRANSCRICAO do video (assets/madremaria/video/madre-maria.mp4). A fala e em
     portugues; este texto e a legenda escrita que acende com a voz. O PT fecha
     em "Senta aqui comigo?" — aqui "Will you sit here with me?": pergunta, nao
     ordem. "Sit here with me" mandaria, e ela nao manda. */
  'apresentacao.texto':
    'You already looked at your phone today. More than once. And you turned the screen face down to pretend you did not look. I am Madre Maria. There is no shame in that. You came here with someone on your mind. Now I am going to ask you a few questions. Then we read your cards. And I walk with you through the thirteen moons, one act a day. Will you sit here with me?',
  'apresentacao.video.assistir': 'Watch Madre Maria',
  'apresentacao.video.pausar': 'Pause',
  'apresentacao.video.denovo': 'Watch again',
  'apresentacao.video.nota': 'Touch the video to hear it. What she says is written just below.',
  'apresentacao.botao': 'Let us begin',
  'entrada.anuncio.ouvir': 'Listen to Madre Maria',
  'entrada.apresentacao':
    'It is me again, Madre Maria. Now it is your cards’ turn. One at a time, no rush. I read each one for you.',
  'entrada.extra.anuncio':
    'Wait, it is not over yet. Look at the table again. There is still a closed card there. Before I go deeper, scratch one more. No rush. I left that one there on purpose.',
  'entrada.estrela.anuncio':
    'This one I turned over for you: the Star. The others spoke of what is between you and that person. This one speaks of your next step. Not of that person’s step. Of yours.',
  'entrada.presenca.titulo': 'Are you here with me?',
  'entrada.presenca.texto':
    'Now I am going deeper. This is not for listening in passing. Leave the rest aside for a minute. Are you here with me?',
  'entrada.presenca.botao': 'I am here — open the deep reading',
  'entrada.fim.cartas':
    'These cards are the door. From here on no card comes out — the app crosses what you already gave: your sign, which it calculated from your date, your age and the five answers. That crossing is what the year’s plan is made of, and every line of it shows which of your answers it came from.',
  'entrada.instrucao': 'Scratch the card with your finger to see which one it is.',
  'entrada.audioNota':
    'The audio does not start on its own: touch it when you want to hear it. The text below says the same thing in writing — with no headphones you miss nothing.',
  'entrada.convite.rotulo': 'WHAT STAYS WITH YOU',
  /* A alternativa do filtro duro: contato cortado. Nenhuma palavra dela pode
     casar com PATRONES_CONTACTO (lib/lectura.js) — "write", "message", "call",
     "text" ficam FORA desta linha de proposito, senao a guarda comeria a propria
     alternativa e a tela ficaria sem convite. */
  'entrada.convite.alternativa':
    'With the contact the way it is today, this card asks for no step outward. What it asks for is done on this side of the thread.',
  'entrada.proxima': 'See the next card',
  'entrada.fechar': 'See the closing',
  'entrada.fim.titulo': 'The three have been read',
  'entrada.fim.texto':
    'These three are the door: the affection that exists, what is covered over, and what depends on you to move. From here on no card comes out — the app crosses what you already gave: your sign, which it calculated from your date, your age and the five answers. That crossing is what the year’s plan is made of, and every line of it shows which of your answers it came from.',
  'entrada.fim.ano':
    'The app counts time in thirteen lunations. One at a time, with no charge for a day that got away.',
  'entrada.entrar': 'Go into the app',
  'entrada.seguir': 'Listen to the deep reading',

  /* --- REOUVIR AS TRES CARTAS -------------------------------------------- */
  'entrada.reouvir.titulo': 'Madre Maria’s reading, again',
  'entrada.reouvir.texto':
    'They are the same ones from your opening reading, with the same audio and the same text. Nothing was drawn again: this reading happens only once, and it already happened.',

  /* --- LEITURA PROFUNDA -------------------------------------------------- */
  'profunda.sobreceja': 'YOUR DEEP READING',
  'profunda.posicao': '{n} of {total}',
  'profunda.audioNota':
    'The audio does not start on its own: touch it when you want to hear it. The text below is the same thing the voice says, word for word — with no headphones you miss nothing.',
  'profunda.ouvir': 'Listen to this part',
  'profunda.pausar': 'Pause',
  'profunda.proximo': 'See the next part',
  /* A frase do fim do audio 11, na letra: a voz termina nela e o botao repete. */
  'profunda.entrar': 'Your first moon begins now',
  'profunda.pular': 'Skip and go into the app',
  /* ================================================================================
   * LOTE: O PLANO DO DIA + O MAPA DO ANO  (158 chaves)
   *
   * O ato do dia, o veu raspavel, o fecho, a fresta de amanha (screens/PlanoScreen.js)
   * e as treze luas, o tabuleiro e as etiquetas (screens/MapaDoAnoScreen.js, lib/ano.js).
   * ============================================================================= */
  "plano.titulo": "Today's plan",
  "plano.acao.alternativa": "With contact the way it is today, the plan asks you for no step outward. What there is to do today is done on this side of the thread.",
  "plano.acao.contencao": "If the urge to take a step outward hits today, this is the gesture that holds your hand: do the one in the plan, all of it, and let the day end.",
  "plano.ceu.vazio": "The sky couldn't be worked out on this phone today. We'd rather leave it blank than guess.",
  "plano.ceu.fase": "Today's Moon is in {fase}.",
  "plano.ceu.marco.hoje": "{fase} is today.",
  "plano.ceu.marco.dia": "{fase} falls {quando}, day {dia}.",
  "plano.encaixe.exato": "Today is the day for this gesture: {criterios}.",
  "plano.encaixe.parcial": "Today matches in part: {criterios}.",
  "plano.encaixe.nenhum": "Today isn't the most obvious day for this gesture. It still counts.",
  "plano.encaixe.naoDeclara": "This gesture asks for no day and no phase. It works for today.",
  "plano.encaixe.semMedida": "The timing of this gesture couldn't be checked on this phone today. It still counts.",
  "plano.encaixe.parcialSemMedida": "Today matches what could be checked: {criterios}. The Moon's phase stayed out of this count.",
  "plano.encaixe.nenhumSemMedida": "From what could be checked, today isn't the most obvious day for this gesture. The Moon's phase stayed out of this count, and it still counts.",
  "plano.encaixe.criterio.dia": "{diaSemana}, day of {regente}",
  "plano.encaixe.criterio.fase": "{fase}",
  "plano.encontro.titulo": "The meeting",
  "plano.encontro.travado.contatoDuro": "This block stays closed today. From what you marked about contact, the day's plan is about you — and no step here points outward. If contact comes back on its own, update the answer in Settings and the block opens.",
  "plano.encontro.travado.bloqueio": "This block stays closed today. With a block in the middle, the plan doesn't point outward: that would be ignoring the one hard fact you gave. If that changes, update the answer in Settings and the block opens.",
  "plano.tela.linhaDoDia": "{diaSemana}, {dia} {mes} · {glifo} {regente}",
  "plano.tela.ritual.rotulo": "TODAY'S RITUAL",
  "plano.tela.ritual.ouvir": "Listen to today's gesture",
  "plano.tela.ritual.duracao": "It costs {duracao}.",
  "plano.tela.ritual.passos": "HOW TO DO IT",
  "plano.tela.ritual.travado.corpo": "There are {n} steps, and that's where what to do lives. Today's gesture is this one and it doesn't repeat tomorrow: every one of the days of the thirteen moons has its own.",
  "plano.tela.ritual.travado.boton": "Open the thirteen moons",
  "plano.tela.ritual.camera": "This is the only gesture that asks for the camera, and the photo goes to Cosmic Guide's coffee-grounds reading, which analyses the image and gives back a text. Madre doesn't keep the photo and doesn't read it. The last word on what you saw is still yours.",
  "plano.tela.ritual.abrir.cartas": "Open my reading again",
  "plano.tela.ritual.abrir.cafe": "Open the coffee-grounds reading",
  "plano.tela.ritual.abrir.mao": "Open the palm reading",
  "plano.tela.ritual.fonte": "{obra}, {autor} — {quando}",
  "plano.tela.reflexao.rotulo": "TODAY'S QUESTION",
  "plano.tela.reflexao.placeholder": "However it comes out, without tidying the sentence.",
  "plano.tela.reflexao.nota": "What you write here stays on this phone, with today's date. No one else reads it, and \"Delete everything\" in Settings takes this with it.",
  "plano.tela.reflexao.falhou": "It couldn't be saved on this phone. What you wrote stays on the screen while it's open.",
  "plano.tela.afirmacao.rotulo": "TODAY'S LINE",
  "plano.frase.rotulo": "THE OPENING LINE",
  "plano.passo.seguir": "Continue",
  "plano.passo.fechar": "Close the day",
  "plano.fio.rotulo": "YESTERDAY'S THREAD",
  "plano.fio.abre": "Last time, you left this here:",
  "plano.fio.ponte.gesto": "Today the day asks for a gesture. Take that line with you.",
  "plano.fio.ponte.missao": "Today the day asks for a mission. Take that line with you.",
  "plano.fio.ponte.pergunta": "Today the day asks. The answer can start there.",
  "plano.fio.ponte.ritmo": "Today is Venus's day: the rhythm between the two of you.",
  "plano.fio.ponte.encontro": "Today the day is for opening the horizon.",
  "plano.ato.gesto": "A small gesture",
  "plano.ato.missao": "A mission",
  "plano.ato.pergunta": "A question of yours",
  "plano.ato.ritmo": "The rhythm between the two of you",
  "plano.ato.encontro": "The weekend invitation",
  "plano.amanha.rotulo": "TOMORROW",
  "plano.amanha.nota": "The whole line opens with tomorrow's square.",
  "mapa.seuDia": "YOUR DAY",
  "plano.luaNoSigno": "The Moon passes through {signo} today — the sky is in your sign.",
  "plano.fecho.selo": "The day closed.",
  "plano.missao.rotulo": "TODAY'S MISSION",
  "plano.missao.porque": "WHY THIS",
  "plano.missao.aceitar": "I accept the mission",
  "plano.missao.cumpri": "Done",
  "plano.missao.comoFoi": "From 0 to 10, how did it go?",
  "plano.missao.palavra": "One word about how it went (if you want).",
  "plano.missao.guardada": "Today's mission done and saved, with the date.",
  "plano.missao.travadaContato": "Today's mission is yours, all of it: from what you marked about contact, no step here points outward.",
  "plano.coracao.rotulo": "TODAY'S HEART",
  "plano.coracao.pergunta": "How is your heart today?",
  "plano.coracao.leve": "Light",
  "plano.coracao.neutro": "Neutral",
  "plano.coracao.pesado": "Heavy",
  "plano.coracao.placar": "{n} of {total} light mornings this week. Last week, {antes}.",
  "plano.coracao.nota": "One tap, and it's only yours. The tally counts; the one who reads the number is you.",
  "plano.campo.escrevendo": "writing…",
  "plano.campo.guardado": "Saved on this phone, with today's date.",
  "plano.sonho.placeholder": "The piece that stayed — however it comes out, without tidying it.",
  "plano.sonho.nota": "What you write here is kept with the date, for ninety days. No one else reads it.",
  "mapa.rotulo": "THE MAP OF THE YEAR",
  "mapa.hojeSoDia": "Today is day {n}.",
  "mapa.abrir": "See the map of the year",
  "mapa.hoje": "Today is day {n}, in moon {lua}.",
  "mapa.como": "Each square is a day, and each day opens by scratching — in the plan, one at a time. Today's has the thread alive; yesterday's still takes a finger, if it stayed closed.",
  "mapa.lua": "MOON {lua}",
  "mapa.abrirDia": "Open day {n}",
  "mapa.semAncora": "Your map is born when your year begins — on the first new moon after your reading. It shows up here on its own, with your three hundred and sixty-five squares.",
  "mapa.pe": "A dimmed square is just a day that passed. The year charges you nothing: the moon goes on, and today's square opens the same.",
  "plano.veu.raspe": "Scratch to open your day",
  "plano.veu.abrir": "Open without scratching",
  "plano.veu.anuncio": "The day opened. Today's ritual is on the screen.",
  "plano.ritmo.rotulo": "THE RHYTHM BETWEEN THE TWO OF YOU",
  "plano.ritmo.venus": "Friday is Venus's day in the old calendar — the day of desire. It's the only day of the week this block opens.",
  "plano.ritmo.convite": "If you want, tell me that person's sign. Only the sign: one of twelve, no name, no date, nobody identified. With it I read the rhythm between the two of you — how it catches fire, how it talks, how it fights.",
  "plano.ritmo.naoHoje": "Not today",
  "plano.ritmo.par": "{dela} and {daPessoa} — {figura}.",
  "plano.ritmo.cama": "IN BED",
  "plano.ritmo.conversa": "IN CONVERSATION",
  "plano.ritmo.briga": "IN A FIGHT",
  "plano.ritmo.falar": "WHEN THERE IS A CONVERSATION",
  "plano.ritmo.limites": "This is a lens, not a verdict: two sun signs decide nothing — the ones who decide are two people. Nothing here states what that person feels.",
  "plano.ritmo.trocar": "Change the sign",
  "plano.ritmo.fonte": "Ptolemy, Tetrabiblos I.13 and I.16 — the figures between the signs",
  "plano.ritmo.fonteNota": "The prose reading comes from the tradition Linda Goodman popularised in 1968 — prose, no percentage: a number here would turn into a verdict, and a figure is not fate.",
  "plano.tela.encontro.travado": "CLOSED TODAY",
  "plano.tela.encontro.ajustes": "Open Settings",
  "plano.tela.compartir": "Share today's card",
  "plano.tela.compartir.falhou": "Sharing couldn't be opened on this device.",
  "plano.tela.compartir.aviso": "No card reads the other person. That end of the thread isn't in this app.",
  "plano.semana.nomes": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "plano.semana.em": ["on Sunday", "on Monday", "on Tuesday", "on Wednesday", "on Thursday", "on Friday", "on Saturday"],
  "ano.lunacao.1.titulo": "Naming what happened",
  "ano.lunacao.2.titulo": "The routine left over",
  "ano.lunacao.3.titulo": "What was already mine",
  "ano.lunacao.4.titulo": "The urge has an hour",
  "ano.lunacao.5.titulo": "I know or I assume",
  "ano.lunacao.6.titulo": "The size of my part",
  "ano.lunacao.7.titulo": "The other threads",
  "ano.lunacao.8.titulo": "The anger not spoken",
  "ano.lunacao.9.titulo": "What I want",
  "ano.lunacao.10.titulo": "Trusting again",
  "ano.lunacao.11.titulo": "What gets said",
  "ano.lunacao.12.titulo": "The year from inside",
  "ano.lunacao.13.titulo": "The same moon",
  "ano.lunacao.1.pergunta": "What happened, said in your own words and without tidying the sentence?",
  "ano.lunacao.2.pergunta": "What is a day of yours like now, from waking up to turning off the light?",
  "ano.lunacao.3.pergunta": "What was yours before that bond and is still yours?",
  "ano.lunacao.4.pergunta": "At what hour does the urge to say something press on you?",
  "ano.lunacao.5.pergunta": "Where does what you know end and what you rebuild in your head begin?",
  "ano.lunacao.6.pergunta": "What was your part, said without inflating it and without shrinking it?",
  "ano.lunacao.7.pergunta": "Who else is in your life, and how long has it been since you looked at that?",
  "ano.lunacao.8.pergunta": "What went unsaid on the side of the anger?",
  "ano.lunacao.9.pergunta": "What do you want, said without naming anyone?",
  "ano.lunacao.10.pergunta": "What would you need in order to trust again — in whoever it is?",
  "ano.lunacao.11.pergunta": "What would you say, and what stays only yours?",
  "ano.lunacao.12.pergunta": "What did this year keep of you, in your own handwriting?",
  "ano.lunacao.13.pergunta": "The moon is closing a turn. Which question do you want to open in the next one?",
  "ano.lunacao.1.abertura": "This lunation starts at the beginning: what happened, written by you, however it comes out. It doesn't have to look good or make sense to anyone else — it stays on this device.",
  "ano.lunacao.2.abertura": "After naming what happened, one thing is left over, twenty-four hours long: Tuesday. This lunation looks at the shape of your day, not at the story.",
  "ano.lunacao.3.abertura": "This lunation asks for concrete things and not concepts: the coffee, the route, the song, the friendship. The material comes from the month that passed, already written down here.",
  "ano.lunacao.4.abertura": "The urge to say something usually has a time of day, and each person has their own. This lunation doesn't ask you to hold back: it asks you to notice which one is yours.",
  "ano.lunacao.5.abertura": "No card reads that person, and this device doesn't either. What can be done is separating what you know from what you've been assuming.",
  "ano.lunacao.6.abertura": "Your part isn't the whole story, and it isn't nothing either. This lunation asks for its size, with both halves on the same screen.",
  "ano.lunacao.7.abertura": "This whole lunation isn't about that person: it's an inventory of what already exists. Your sister, the colleague, the neighbour, the group that's been still since March.",
  "ano.lunacao.8.abertura": "This lunation opens a place for what went unsaid on the side of the anger. Not being angry this month is a legitimate answer, and the day goes on the same.",
  "ano.lunacao.9.abertura": "This lunation has one rule only: write what you want without naming anyone. The app doesn't know what you ought to want, and it doesn't vote.",
  "ano.lunacao.10.abertura": "The wording of this lunation is \"in whoever it is\", and it holds every day from here to the next new moon. Trust here is a general capacity, not preparation for one specific conversation.",
  "ano.lunacao.11.abertura": "This lunation works both sides of the line: what gets said and what stays only yours. The letter you don't send counts just the same.",
  "ano.lunacao.12.abertura": "This lunation is archive. The app opens what you wrote, lunation by lunation, with the dates, and summarises nothing.",
  "ano.lunacao.13.abertura": "This is the thirteenth lunation, and it's the one that closes the turn. Twelve lunations add up to 354 days, thirteen to 384, and the civil year has 365: the moon and the calendar don't close together, and never did.",
  "ano.fase.comecar-no-escuro.tom": "Starting in the dark",
  "ano.fase.comecar-no-escuro.pede": "A small gesture, started today, that produces nothing visible today.",
  "ano.fase.sustentar.tom": "Holding what already started, without adding to it",
  "ano.fase.sustentar.pede": "Doing the previous phase's gesture one more time, the same size.",
  "ano.fase.o-que-ja-da-para-ver.tom": "What can already be seen",
  "ano.fase.o-que-ja-da-para-ver.pede": "Writing down one thing that can already be seen without interpreting it.",
  "ano.fase.tirar.tom": "Taking away, cutting, letting it dry",
  "ano.fase.tirar.pede": "Taking one concrete thing out of the day — an open tab, a time slot, an object, one more check.",
  "ano.virada.hoje": "Today the new moon closes this lunation. The theme changes from now on.",
  "ano.virada.dia": "The new moon closes this lunation on day {dia}. The theme changes there.",
  "ano.arquivo.titulo": "What you wrote",
  "ano.arquivo.vazio": "In this lunation nothing was written. There's nothing to recover and nothing is late: the archive shows what exists, and goes on.",
  // ===== LOTE: perfil / ajustes / metodo / ayuda / privacidad / terminos / paywall =====
  "perfil.sobreceja": "THIS PHONE",
  "perfil.sinNombre": "Still no name",
  "perfil.cargando": "One moment.",
  "perfil.espejo.sobreceja": "WHAT YOU ANSWERED",
  "perfil.espejo.separador": " · ",
  "perfil.espejo.vacio": "No answers saved on this phone yet.",
  "perfil.espejo.pie": "It is in your words, not ours: it is what you chose in the questions at the start. The app infers nothing else about you.",
  "perfil.hilo.sobreceja": "MY THREAD",
  "perfil.hilo.actual": "Us now",
  "perfil.hilo.record": "Longest thread",
  "perfil.hilo.total": "Days with a reading",
  "perfil.hilo.nota": "All three numbers come from this phone and from nothing else. A day with a reading counts once, even if you open the app several times. There is no level here, no ranking, no points.",
  "perfil.hilo.ver": "See My Thread in full",
  "perfil.suscripcion.sobreceja": "SUBSCRIPTION",
  "perfil.suscripcion.activa": "Active on this phone.",
  "perfil.suscripcion.inactiva": "No subscription.",
  "perfil.suscripcion.ver": "See what opens across the thirteen moons",
  "perfil.suscripcion.gestionar": "Manage",
  "perfil.suscripcion.gestionarNota": "Opens your store account: that is where the plan is changed or cancelled, without talking to anyone and without explaining why.",
  "perfil.suscripcion.gestionarError": "It would not open from here. Your subscription is in the account of the platform where you bought it.",
  "perfil.suscripcion.gestionarWeb": "The subscription is managed where you bought it, in your payment platform account.",
  "perfil.restaurar.ok": "Done. Your purchase is active on this phone.",
  "perfil.restaurar.sinTienda": "No store is connected yet, so there is no purchase to restore. Nothing of yours changed.",
  "perfil.accesos.sobreceja": "MORE",
  "perfil.acceso.entrada": "Madre Maria's reading",
  "perfil.acceso.profunda": "The deep reading, in five parts",
  "perfil.acceso.profunda.naoOuvida": "You have not heard this one yet",
  "perfil.acceso.profunda.parou": "You stopped at part {n} of {total}",
  "perfil.acceso.ritual": "The seven-day ritual",
  "perfil.acceso.album": "The album of the 78",
  "perfil.acceso.ajustes": "Settings",
  "perfil.acceso.metodo": "How this app decides",
  "perfil.acceso.ayuda": "Help",
  "perfil.acceso.privacidad": "Privacy",
  "perfil.acceso.terminos": "Terms",
  "perfil.rehacer": "Redo my answers",
  "perfil.rehacer.nota": "You go back to the questions at the start and your thread stays as it is: redoing is not starting over. The knots you already tied stay counted.",
  "paywall.titulo": "What comes next is thirteen moons.",
  "paywall.sub": "This is what opens, and nothing beyond this:",
  "paywall.beneficio.lunas": "The thirteen moons of the year: thirteen themes, one per lunation, and each one opens on the new moon as measured in the sky — not on a calendar date.",
  "paywall.beneficio.espelho": "The mirror: what you write on the first moon comes back on the thirteenth, with the date of the day you wrote it, without a comma changed.",
  "paywall.beneficio.gestos": "Each day's work, put together for you: one gesture with a name and the right hour, chosen by that day's sky and by what you told us. You see the day's gesture either way; how it is done opens here.",
  "paywall.plan.mensual.nombre": "Monthly",
  "paywall.plan.mensual.precio": "{precio} a month",
  "paywall.plan.anual.nombre": "Yearly",
  "paywall.plan.anual.precio": "{precio} a year",
  "paywall.plan.anual.equivalente": "That works out to {precioMes} a month.",
  "paywall.plan.nota": "The store sets the price, in your currency. There is no fine print here.",
  "paywall.boton": "Open the thirteen moons",
  "paywall.restaurar": "Restore purchase",
  "paywall.salida": "What you have already opened stays yours.",
  "paywall.comoCancelar": "Cancel whenever you want, from your account on the platform where you bought it, without talking to anyone and without explaining why. What you have already paid stays active until the end of the period.",
  "privacidad.sobreceja": "PRIVACY",
  "privacidad.titulo": "What is Madre's stays on this phone",
  "privacidad.entrada": "Madre Maria asks for no account and no password, and sends nothing out: what you write in her questions stays on your device. She lives inside Cosmic Guide, a larger app with its own account and server — whatever is his is described on the Cosmic Privacy screen.",
  "privacidad.guarda.titulo": "WHAT IS KEPT ON YOUR PHONE",
  "privacidad.guarda.lineas": [
    "The name you wrote in the first question.",
    "Your four answers about the story: what happened, how long ago, how the contact stands today and what you want to understand.",
    "Your date of birth. It is sensitive data and it is handled as such: your sign and your age come from it, and those are what make the plan speak to the stage of life you are in. We do not ask for the hour or the place, and it goes out with \"Delete everything\" along with the rest.",
    "How to address you — woman, man or neither. It changes only the words the reading uses to speak to you.",
    "Your thread: the days you came to read, today's count and your record.",
    "A mark for the day, to know whether you have already opened today's reading.",
    "Your settings: the hour of the reminder, reduced motion and vibration.",
    "What you write in the day's fields — the answer to the question and, on the dream day, the dream. It is kept with the date, nobody else reads it, and it goes out with \"Delete everything\".",
    "Each day's heart (light, neutral or heavy) and the record of the missions — whether you accepted, whether you completed it and the mark you gave it. Your own counts, on your own phone.",
    "The sign of the person you love, if you want to give it — one of twelve, asked only on Friday, for the rhythm between the two of you. It identifies nobody, it can be changed whenever you want, and it goes out with \"Delete everything\" along with the rest.",
    "The line your closed day leaves for the next one — \"yesterday's thread\", which the app quotes back to you on the next day you live. It is the last line, it stays only on this phone and it goes out with \"Delete everything\".",
    "Which step of the path you are on: the missions that involve the other person come in order, from the lightest to the one that asks for the most courage, and the app keeps only the number of the step and the day you climbed it. It is a number from one to nine on this phone, and it goes out with \"Delete everything\".",
    "One letter, A or B: which of the two entry readings the app drew for you the first time — so that \"listen again\" shows your cards, and not the other ones. It stays on this phone and it goes out with \"Delete everything\".",
  ],
  "privacidad.guarda.pie": "That is the complete list. It sits in the system's local storage — the same drawer where any app leaves its preferences — and it stays there until you delete it.",
  "privacidad.recordatorio": "There are no reminders yet: the app sends no notification at all. If we ever add them, the only thing kept would be the hour you choose, on this same phone.",
  "privacidad.no.titulo": "WHAT IS NEITHER ASKED FOR NOR COLLECTED",
  "privacidad.no.lineas": [
    "The hour and the place where you were born. We ask only for the day; with no hour there is no birth chart at all, and the app does not pretend to have one.",
    "Your location. The app never asks where you are.",
    "Your contacts, your photos and your microphone. Madre Maria does not ask for the camera either: on the grounds days and the hand days the screen that opens the camera is the Cosmic Guide's, and it is its privacy that answers for the photo.",
    "About the other person: their name, their birth, their gender, a photo or how to reach them — never. The only piece of data that can exist here about that person is their sun sign, one of twelve, and only if you want to give it (it is on the list above).",
    "Your email and your phone number. There is no sign-up, so there is nobody to identify.",
  ],
  "privacidad.no.pie": "There is no advertising, no tracker and no third-party analytics. What the reading does not use is not asked for.",
  "privacidad.red.titulo": "THERE IS NO NETWORK",
  "privacidad.red.cuerpo": "The cards come from the deck, from today's date and from your answers, and the text is assembled in here from content that already ships inside the app: you can read it in airplane mode. Nothing you write here leaves this phone. There is one door to the outside, and only you open it: on the grounds days and the hand days the plan takes you to the Cosmic Guide photo reading, which is another screen and sends the photo to be read. If you do not open that door, nothing goes out.",
  "privacidad.borrar.titulo": "HOW TO DELETE EVERYTHING",
  "privacidad.borrar.cuerpo": "In Settings there is a button, \"Delete everything\". It leaves the phone as it was on the first day: no name, no answers, no date of birth and no thread. It is immediate and it cannot be undone. And if you uninstall the app, the system takes whatever was left. We have no copy of anything, because we never had one.",
  "privacidad.pago.titulo": "WHEN THE SUBSCRIPTION EXISTS",
  "privacidad.pago.cuerpo": "Today there is no charge inside the app. When there is, the payment is processed by the platform that charges for Cosmic Guide, with the details you give it there. Madre Maria does not see your card, does not receive it and does not keep it: on this side there is one single mark on the phone saying the subscription is active.",
  "privacidad.cierre": "This screen describes the version you have installed today. If the app ever needs to send anything out, this is rewritten first and the change is in plain sight.",
  "terminos.sobreceja": "TERMS OF USE",
  "terminos.titulo": "What you accept by using the app",
  "terminos.entrada": "Short, and with no fine print. If you use Madre Maria, this is what you are accepting.",
  "terminos.que.titulo": "WHAT THIS IS",
  "terminos.que.cuerpo": "Madre Maria is a symbolic tarot reading and a path of thirteen moons, made to entertain and to give you other words for something that keeps going around in your head. It is not prediction. It is not professional advice — not legal, not financial, not of any other kind —, it is not a diagnosis and it does not replace care from a mental health professional. The cards know nothing of your story: what they do is give you three fixed images so you can look at what is yours from the outside.",
  "terminos.edad.titulo": "MINIMUM AGE: 18",
  "terminos.edad.cuerpo": "The app is for people over 18. We ask for your date of birth — your sign and your age come from it —, but we verify nothing: here in Madre it stays on this phone. So this stays on your side: if you are under 18, this app is not for you yet.",
  "terminos.promesa.titulo": "WHAT THE APP DOES NOT PROMISE",
  "terminos.promesa.cuerpo": "No reading promises an outcome about your bond, and no card reads the other person: that end of the thread is not in this app. What you decide to do after reading is yours, and so is the responsibility for that decision. If anyone — here or anywhere else — gives you a date or assures you of an ending, they are making it up.",
  "terminos.suscripcion.titulo": "THE SUBSCRIPTION",
  "terminos.suscripcion.cuerpo": "Today there is no charge at all in this version, because the subscription is not connected yet. When it opens, it works like this: the payment platform of Cosmic Guide charges you, in your currency; it renews on its own at the end of each period, unless you cancel first; and cancelling is done from your account on that platform, without talking to anyone and without explaining why. What you have already paid stays active until the end of the current period. Refunds are handled by it, under its rules.",
  "terminos.datos.titulo": "YOUR DATA",
  "terminos.datos.cuerpo": "What you write for Madre stays on this phone, your date of birth included: she opens no account, sends nothing to a server and keeps no copy. Madre lives inside Cosmic Guide, which has its own account and server — the full detail is on both Privacy screens.",
  "terminos.apoyo.titulo": "IF YOU ARE GOING THROUGH A HARD TIME",
  "terminos.apoyo.cuerpo": "A card keeps nobody company. If what you feel is truly weighing on you, look for people of flesh and blood: someone you trust, a professional, or the crisis line in your country. This app is not that place and does not pretend to be.",
  "terminos.cambios.titulo": "CHANGES AND CONTACT",
  "terminos.cambios.cuerpo": "If these terms change, the new version appears on this same screen. For questions or complaints, write to {correo}.",
  "ayuda.sobreceja": "SUPPORT",
  "ayuda.titulo": "Fix a problem",
  "ayuda.entrada": "Choose what is happening. Almost everything is solved right here, in one tap, without talking to anyone and without waiting for someone to reply.",
  "ayuda.cat.cobro": "Charges and subscription",
  "ayuda.cat.cobro.sub": "A charge you do not recognise, cancelling, or you paid and it did not open.",
  "ayuda.cat.acceso": "I cannot get in, or something is missing",
  "ayuda.cat.acceso.sub": "The app will not open, it keeps loading, or you cannot see what you already had.",
  "ayuda.cat.contenido": "Something about the content",
  "ayuda.cat.contenido.sub": "A text that does not fit, a strange card, a question about how things are decided.",
  "ayuda.cat.tecnico": "Technical error",
  "ayuda.cat.tecnico.sub": "It closes on its own, it freezes, or something stopped responding.",
  "ayuda.cat.otro": "Something else",
  "ayuda.cat.otro.sub": "None of the above.",
  "ayuda.pasos.sobreceja": "TRY THIS FIRST",
  "ayuda.pasos.vacio": "For this there is no button that fixes it on its own. Use the field below and tell us what happened.",
  "ayuda.paso.restaurar.titulo": "Restore your purchase",
  "ayuda.paso.restaurar.cuerpo": "If you already paid and the app does not recognise it — you changed phones, reinstalled, signed in with another account —, this gives it back: it asks the store what your account bought. It charges nothing again.",
  "ayuda.paso.restaurar.boton": "Restore purchase",
  "ayuda.paso.restaurar.sinTienda": "No store is connected in this version yet, so there is no purchase to restore. Nothing of yours changed.",
  "ayuda.paso.tienda.titulo": "Cancel or check the charge",
  "ayuda.paso.tienda.cuerpo": "The subscription lives in your store account, not here. On that screen you will find the price, the date of the next charge and the cancel button, without talking to anyone and without explaining why.",
  "ayuda.paso.tienda.apple": "Open in the App Store",
  "ayuda.paso.tienda.google": "Open in Google Play",
  "ayuda.paso.tienda.web": "Open the buyer area",
  "ayuda.paso.tienda.error": "It would not open from here. The subscription is in the account of the platform where you bought it, in the subscriptions section.",
  "ayuda.paso.reembolso.titulo": "A charge you do not recognise",
  "ayuda.paso.reembolso.cuerpo": "The store processes the charge: we do not see your card, we do not receive the payment and we cannot refund a charge from here. The refund is requested on that same store screen, and there it does reach someone who can sort it out. It is the short way, not a way of getting rid of you.",
  "ayuda.paso.recargar.titulo": "Close it and open it again",
  "ayuda.paso.recargar.cuerpo": "Close it completely — the whole app, not just this screen — and open it again. You lose nothing: your name, your answers and your knots are kept on this phone, not on the screen that froze.",
  "ayuda.paso.recargar.boton": "Reload now",
  "ayuda.paso.metodo.titulo": "See how the app decides",
  "ayuda.paso.metodo.cuerpo": "Almost any question about the content is answered there: how the cards are drawn, what your answers change and what they do not, and where each card's text comes from. If it still does not fit after you read it, the mistake is ours and we want to see it.",
  "ayuda.paso.metodo.boton": "See how this app decides",
  "ayuda.paso.borrar.titulo": "Delete what the app has kept",
  "ayuda.paso.borrar.cuerpo": "It leaves this phone as it was on the first day: no name, no answers, no thread. It is the last thing to try, because it is immediate and it cannot be undone: we have no copy of anything, because we never had one.",
  "ayuda.paso.borrar.boton": "Delete what is kept",
  "ayuda.paso.borrar.confirma": "It deletes now and it does not come back. Your subscription is not touched: it is not a piece of your data that we keep here, it lives in your store account.",
  "ayuda.paso.borrar.si": "Yes, delete it",
  "ayuda.paso.borrar.no": "Better not",
  "ayuda.paso.borrar.hecho": "Done. This phone keeps nothing of yours any more.",
  "ayuda.paso.borrar.parcial": "This session's data was deleted, but the phone would not let us write to disk. Close the app and open it again to check.",
  "ayuda.escribir.sobreceja": "IF NONE OF THAT FIXED IT",
  "ayuda.escribir.titulo": "Write to us",
  "ayuda.escribir.cuerpo": "It opens your email app with the subject and the technical diagnostics already written. What happened is yours to tell, in your own words: the app does not fill that in.",
  "ayuda.escribir.boton": "Open my email",
  "ayuda.escribir.falta": "Choose up above what is happening. That way the email arrives already sorted and we do not ask you back for what you already know.",
  "ayuda.escribir.asunto": "Madre Maria · {categoria}",
  "ayuda.escribir.error": "Your email would not open from here. Use the address {correo} from wherever you prefer and copy the four lines above by hand.",
  "ayuda.escribir.directo": "Or use the address {correo} directly.",
  "ayuda.diagnostico.titulo": "THIS IS THE ONLY THING THAT LEAVES HERE",
  "ayuda.diagnostico.version": "App version",
  "ayuda.diagnostico.plataforma": "Platform",
  "ayuda.diagnostico.sistema": "System",
  "ayuda.diagnostico.categoria": "Category",
  "ayuda.diagnostico.sinCategoria": "not chosen yet",
  "ayuda.diagnostico.sinDato": "no data",
  "ayuda.diagnostico.pie": "Nothing beyond that. Your name does not go, your answers do not go and not one line of your reading goes: the app cannot attach them, because they never leave this phone. If you want to tell us something about your reading, you type it inside the email yourself, and that is your decision and not an automatic attachment.",
  "ayuda.correo.cuerpo": "Tell us what happened (type here):\n\n\n\n———\nTechnical diagnostics. The app wrote this; it does not include your name, your answers or your reading.\n{diagnostico}\n",
  "ayuda.pie": "Whatever happens with this, nothing of yours is lost.",
  "metodo.sobreceja": "HOW THIS APP DECIDES",
  "metodo.titulo": "The method, with no mystery",
  "metodo.entrada": "A tarot app can say anything it likes about how it works inside, because nobody sees inside. This screen is the opposite: here is the whole mechanism, written so you can argue with it. If any of this does not match what you see in the app, the mistake is ours.",
  "metodo.sorteo.titulo": "How your three cards are drawn",
  "metodo.sorteo.cuerpo": "They are shuffled with Fisher-Yates, the standard shuffling algorithm: at each step it picks at random one card among those not yet drawn and takes it out of the bag. That does two things at once — it gives all {cartas} cards exactly the same chance of coming out, and it makes them impossible to repeat within one draw. It stops at the third.",
  "metodo.sorteo.orientacion": "The orientation is drawn separately, card by card, with a {prob} chance of coming out reversed. That is why all three can come out upright, or all three reversed: both are normal results of the draw and mean nothing extra.",
  "metodo.ficha.titulo": "THE DRAW'S SPEC SHEET",
  "metodo.ficha.algoritmo": "Algorithm",
  "metodo.ficha.algoritmo.valor": "Partial Fisher-Yates, uniform",
  "metodo.ficha.azar": "Source of randomness",
  "metodo.ficha.azar.valor": "The system's generator, with nothing on top",
  "metodo.ficha.semilla": "Seed",
  "metodo.ficha.semilla.valor": "None",
  "metodo.ficha.entrada": "What goes into the draw",
  "metodo.ficha.entrada.valor": "Nothing of yours",
  "metodo.ficha.repetidas": "Repeated cards",
  "metodo.ficha.repetidas.valor": "Impossible by construction",
  "metodo.ficha.pie": "Your name does not reach the draw, nor your answers, nor the hour, nor how many times you opened the app. This is not a brand promise: the function that deals has no way of receiving that data, and it is written so that it cannot be passed in.",
  "metodo.respuestas.titulo": "What your {preguntas} answers change",
  "metodo.respuestas.si": "WHAT THEY DO CHANGE",
  "metodo.respuestas.si.lineas": [
    "The question each position asks. The knot is calibrated by what happened between you; the tension, by how much time has passed and by how the contact stands today; your end of it, by what you want to understand.",
    "The contact filter. If you answered that you wrote and got no reply, or that there is no contact at all, every sentence that would push you outward is left out. It is not that another sentence is chosen: the already-assembled text is swept and replaced, so not even a piece of advice written months ago gets through.",
  ],
  "metodo.respuestas.no": "WHAT THEY DO NOT CHANGE",
  "metodo.respuestas.no.lineas": [
    "Which cards come out. None of it. You could answer every question the other way around and the deck would deal exactly the same.",
    "What each card says. A card's text is written beforehand and goes in as it is, with no touch-up for you.",
  ],
  "metodo.respuestas.pie": "It is the difference between personalising the question and personalising the answer. Here the question is personalised. The deck gives the answer, and that is why an uncomfortable card sometimes lands: if your answers could move the result, this would be a mirror and not a reading.",
  "metodo.texto.titulo": "Where each card's text comes from",
  "metodo.texto.cuerpo": "From the Rider-Waite-Smith tradition: the deck Pamela Colman Smith illustrated and Arthur Edward Waite arranged, published in London in 1909 and in the public domain today. It is the vocabulary almost all modern tarot uses. What we did was an editorial reading of those {cartas} images through one lens only — bonds that were left half-finished —, written by hand, card by card, before your draw existed.",
  "metodo.texto.fuente": "Rider-Waite-Smith Tarot. Pamela Colman Smith and A. E. Waite, William Rider & Son, London, 1909. Public domain.",
  "metodo.texto.pie": "That is why a card's text is the same for everyone: it is not rewritten for you. What is yours is which card came out and in which position it landed.",
  "metodo.offline.titulo": "There is no artificial intelligence and there is no internet",
  "metodo.offline.cuerpo": "The reading is assembled entirely inside your phone. There is no language model writing sentences, no server returning the text and no request going out to the network: all the content already shipped inside the app when you installed it.",
  "metodo.offline.prueba": "And you can check it without taking our word for it: put the phone in airplane mode and ask for your draw. It comes out the same.",
  "metodo.offline.pie": "Since nothing goes out, nothing goes up either. Your name and your answers stay on this phone: no account, no email, no server. This holds for everything you read here. The exception is declared: on the grounds days and the hand days, the plan takes you to a Cosmic Guide photo reading — that is another screen, it uses the network and artificial intelligence, and it only happens if you open it.",
  "metodo.limites.titulo": "Where the method ends",
  "metodo.limites.entrada": "An honest method also says where it ends. This is the same box that appears before every result, and here it says exactly what it says there:",
  "metodo.cierre": "That is the whole mechanism: a deck shuffled knowing nothing about you, your answers choosing the question, and a text written beforehand by people. There is no secret layer underneath. If there ever is, this screen says so first.",
  "metodo.ayuda": "Fix a problem",
  "ajustes.sobreceja": "ONLY WHAT ACTUALLY DOES SOMETHING",
  "ajustes.titulo": "Settings",
  "ajustes.sub": "Every control here changes something real, and all of it lives on this phone. What does not work yet is not here.",
  "ajustes.recordatorio.titulo": "Daily reminder",
  "ajustes.recordatorio.sub": "One notice a day, at the hour you choose.",
  "ajustes.recordatorio.previa": "This is what reaches you",
  "ajustes.recordatorio.previa.variantes": "The notice changes its wording depending on the day, and this is one of the three. All three say the same thing: that today's day is open on the board.",
  "ajustes.recordatorio.aviso.app": "Madre Maria",
  "ajustes.recordatorio.aviso.cuando": "now",
  "ajustes.recordatorio.aviso.titulo": "Today's house has opened",
  "ajustes.recordatorio.aviso.cuerpo": "Your day is already on the board, with today's gesture and mission. Whenever you want, all it takes is a scratch.",
  "ajustes.recordatorio.aviso.dos.titulo": "Today's knot is waiting for you",
  "ajustes.recordatorio.aviso.dos.cuerpo": "It is tied when today's day is done. And if you do not come today, the thread stays still and waits all the same.",
  "ajustes.recordatorio.aviso.tres.titulo": "A few minutes of your own, no rush",
  "ajustes.recordatorio.aviso.tres.cuerpo": "Today's day is ready in here. A few minutes for you, and nothing beyond that.",
  "ajustes.recordatorio.pie": "Nothing beyond that: one notice a day, always at the same hour. No news, no offers and no nagging if one day you do not come.",
  "ajustes.recordatorio.antesDelPermiso": "When you turn it on, your phone asks whether you allow notices. If you say no, the app keeps working just the same.",
  "ajustes.recordatorio.activar": "Turn on the reminder",
  "ajustes.recordatorio.desactivar": "Turn off the reminder",
  "ajustes.recordatorio.estadoActivo": "On. Every day at {hora}.",
  "ajustes.recordatorio.estadoInactivo": "Off. Right now no notice arrives.",
  "ajustes.recordatorio.hora": "Time of the notice",
  "ajustes.recordatorio.horaMenos": "One hour earlier",
  "ajustes.recordatorio.horaMas": "One hour later",
  "ajustes.recordatorio.enPunto": "On the hour",
  "ajustes.recordatorio.yMedia": "Half past",
  "ajustes.recordatorio.negado": "Your phone has notices blocked for Madre Maria. They are unblocked in the system settings, and from there you come back here.",
  "ajustes.recordatorio.abrirSistema": "Open the phone settings",
  "ajustes.recordatorio.sinCanal": "This version cannot send you notices yet. When it can, it is switched on from here and with this same notice.",
  "ajustes.recordatorio.errorProgramar": "The notice could not be scheduled. Try again.",
  "ajustes.movimiento.titulo": "Reduced motion",
  "ajustes.movimiento.sub": "The app's animations: the cards, the button that lights up and the screens that appear.",
  "ajustes.movimiento.sistema": "Follow the system",
  "ajustes.movimiento.forzado": "Always reduced",
  "ajustes.movimiento.sistemaReduce": "Your system is asking for reduced motion right now, and the app respects it.",
  "ajustes.movimiento.sistemaNormal": "Your system is not asking for reduced motion right now.",
  "ajustes.movimiento.forzadoNota": "The app always reduces motion, whatever the system says.",
  "ajustes.haptica.titulo": "Vibration",
  "ajustes.haptica.sub": "The short tap when you scratch a card and when you tie the day's knot.",
  "ajustes.haptica.prueba": "That is how it feels. If you felt nothing, your phone has it switched off.",
  "ajustes.datos.titulo": "Your data",
  "ajustes.datos.sub": "None of this has ever left this phone: no account, no email, no server.",
  "ajustes.datos.respuestas": "Delete my answers",
  "ajustes.datos.todo": "Delete everything",
  "ajustes.confirmar.borra": "DELETES",
  "ajustes.confirmar.queda": "DOES NOT DELETE",
  "ajustes.confirmar.cancelar": "Better not",
  "ajustes.confirmar.respuestas.titulo": "Delete your answers?",
  "ajustes.confirmar.respuestas.borra": "Your name and the answers from the start — your date of birth included. The next time you open the app, it asks for them again.",
  "ajustes.confirmar.respuestas.queda": "All of My Thread: your knots and your record stay where they are. Your subscription is not touched either.",
  "ajustes.confirmar.respuestas.boton": "Yes, delete my answers",
  "ajustes.confirmar.todo.titulo": "Delete everything?",
  "ajustes.confirmar.todo.borra": "Your name, your answers — your date of birth along with them —, all of My Thread — the knots and the record too —, the reminder and these settings. There is no copy anywhere else, so there is no way to undo it.",
  "ajustes.confirmar.todo.queda": "Your subscription: it lives in your account on the platform where you bought it, not here. If you ever need it, it comes back with \"Restore purchase\".",
  "ajustes.confirmar.todo.boton": "Yes, delete everything",
  "ajustes.borrado.respuestas": "Done. Your answers are no longer on this phone.",
  "ajustes.borrado.todo": "Done. Nothing of yours was left on this phone.",
  "ajustes.borrado.parcial": "Something was left undeleted on this phone. Try again.",
  "ajustes.noGuardado": "This setting could not be saved on the phone. It holds while the app is open.",
  "ajustes.version": "Version {version}",
  "ajustes.privacidad": "Privacy",
  "ajustes.privacidad.borrar": "To delete what is kept you do not need to talk to anyone: it is done up above, under \"Your data\", and it is immediate.",
  "perfil.acceso.hilo": "My thread — the days you came",
  "perfil.acceso.mao": "The reading of my hand — with a photo, if you want",
  "paywall.livre.nota": "In this version, all of this is open — just come in. The subscription comes later, and nothing of yours changes when it does.",
  "perfil.suscripcion.livre": "Everything open in this version. The subscription comes later — and nothing of yours changes when it does.",

  /* ===================================================================
     WAVE — THE LIVE SCREENS THAT WERE MISSING (107 keys).

     The 143 ORPHAN keys of the PT are deliberately NOT here: the copy of the
     five screens that did not come in the merge with Cosmic Guide (the
     Circle, the album of the 78, the Readings screen, the TiradaScreen, and
     the coffee and palm readings — the last two are ONE with the Cosmic
     ones). No live screen calls them, and translating a dead key is noise in
     the scoreboard forever. The full list, with the reason for each group, is
     in test/madremaria-i18n-orfas.js, and the coverage gate checks that list
     on every run.
     =================================================================== */
  "tirada.rotulo.nudo": "THE KNOT",
  "tirada.rotulo.nudo.sub": "Where it got tangled",
  "tirada.rotulo.tension": "THE PULL",
  "tirada.rotulo.tension.sub": "What pulls today",
  "tirada.rotulo.extremo": "YOUR END",
  "tirada.rotulo.extremo.sub": "The end of the thread you are holding",
  "tirada.avisoOtraPersona": "No card reads that person. That end of the thread is not in this app.",
  "tirada.carta.derecha": "Upright",
  "tirada.carta.invertida": "Reversed",
  "scratch.label": "Scratch to reveal",
  "scratch.tap": "Reveal without scratching",
  "scratch.a11y": "Metal blade over the {posicion} card. Scratch with your finger, or activate to reveal the whole card.",
  "scratch.revelada": "{carta} revealed. Its reading is just below.",
  "lua.sobreceja": "THE NEXT NEW MOON",
  "lua.quando": "{diaSemana}, {mes} {dia}, at {hora}.",
  "lua.nota": "If you come in before it, that new moon is yours. If you come in after, yours is the next one — and the next one is twenty-nine and a half days away. That is not our rule: it is the moon.",
  "limites.titulo": "What this reading CANNOT tell you",
  "limites.lineas": [
    "Whether that person shows up again or not. That is not written on any card.",
    "What the one on the other side is feeling. That end of the thread is not in this app.",
    "When. Tarot does not set a date, and anyone who gives you one is making it up.",
  ],
  "limites.pie": "None of this is a flaw in the app. It is the honest limit of a symbolic reading, and that is why it is written before your result and not after.",
  "audio.velocidade.1": "1x",
  "audio.velocidade.1.5": "1.5x",
  "audio.velocidade.2": "2x",
  "audio.velocidade.rotulo": "Voice speed: {valor}",
  "audio.velocidade.ajuda": "Tap to switch between 1x, 1.5x and 2x.",
  "audio.ouvir": "Listen to the card",
  "audio.pausar": "Pause",
  "missoes.titulo": "Today's three",
  "missoes.sub": "The date picks the three. The next day, they are others.",
  "missoes.progresso": "{n} of {total}",
  "missoes.feita": "Done",
  "missoes.todasFeitas": "Today's three are done.",
  "missoes.pie": "All three are about you and your time. None of them involves the one on the other side.",
  "missoes.ler-ate-o-fim.titulo": "Read the synthesis to the last line",
  "missoes.ler-ate-o-fim.pista": "Scrolling to the end counts. That is where the reading really ends.",
  "missoes.resposta-do-ritual.titulo": "Leave your answer on today's day of the ritual",
  "missoes.resposta-do-ritual.pista": "One line is enough. It stays on this phone, and it is yours alone.",
  "missoes.voltar-a-leitura.titulo": "Come back to today's reading later",
  "missoes.voltar-a-leitura.pista": "Opening it again and rereading what was left on the table. It stays there all day.",
  "missoes.olhar-o-fio.titulo": "Open your thread and see how long it is",
  "missoes.olhar-o-fio.pista": "Just looking. The thread counts the days you came, and nothing beyond that.",
  "missoes.reler-suas-respostas.titulo": "Reread your answers from the beginning",
  "missoes.reler-suas-respostas.pista": "They are in your profile, just as you left them.",
  "missoes.fonte-de-uma-carta.titulo": "Check where a card comes from",
  "missoes.fonte-de-uma-carta.pista": "The Method screen names the work each text comes from. Opening it and looking already counts.",
  "missoes.o-que-nao-diz.titulo": "Read what this reading cannot say",
  "missoes.o-que-nao-diz.pista": "The box of limits is at the end of the Method screen. Scrolling down there counts.",
  "barra.plano": "Today's plan",
  "barra.plano.pista": "Opens today's ritual, the question of the day and the action.",
  "barra.perfil": "Profile",
  // Host app's support channel — rationale lives in datos/textos.js.
  "legal.correo": SUPPORT_EMAIL,
  "legal.version": "Madre Maria · version 2 · September 2026",
  "comunes.siguiente": "Continue",
  "comunes.empezar": "Start",
  "comunes.volver": "Back",
  "comunes.compartir": "Share",
  "comunes.guardar": "Save",
  "comunes.cerrar": "Close",
  "comunes.pronto": "Soon",
  "conquistas.titulo": "What you have done",
  "conquistas.sub": "Everything here was counted on this phone, from what you did.",
  "conquistas.pendente": "Not yet",
  "conquistas.pie": "None of them has a deadline and none of them is lost. What is marked stays marked.",
  "conquistas.primeira-leitura.titulo": "The first reading",
  "conquistas.primeira-leitura.texto": "You opened the three cards for the first time.",
  "conquistas.tres-nos.titulo": "Three knots",
  "conquistas.tres-nos.texto": "Three days in a row that you came. The thread started to have length.",
  "conquistas.sete-nos.titulo": "Seven knots",
  "conquistas.sete-nos.texto": "A whole week of knots, one after another.",
  "conquistas.trinta-nos.titulo": "Thirty knots",
  "conquistas.trinta-nos.texto": "Thirty days in a row. That is rare, and it is yours.",
  "conquistas.a-volta.titulo": "The return",
  "conquistas.a-volta.texto": "A day went blank and you came back. The thread was the length you had left it.",
  "conquistas.primeira-invertida.titulo": "The first reversed card",
  "conquistas.primeira-invertida.texto": "A card fell upside down and you read it that way anyway.",
  "conquistas.dez-cartas.titulo": "Ten cards",
  "conquistas.dez-cartas.texto": "Ten different cards have already shown up in your readings.",
  "conquistas.um-grupo.titulo": "One suit closed",
  "conquistas.um-grupo.texto": "Every card of one group of the deck has already passed through here.",
  "conquistas.carta-que-volta.titulo": "The card that returns",
  "conquistas.carta-que-volta.texto": "One same card showed up three times for you. That is the deck being a deck.",
  "conquistas.meio-baralho.titulo": "Half the deck",
  "conquistas.meio-baralho.texto": "Half of the cards have already shown up in some reading of yours.",
  "conquistas.baralho-inteiro.titulo": "The whole deck",
  "conquistas.baralho-inteiro.texto": "Every card of the deck has already shown up for you.",
  "conquistas.ritual-completo.titulo": "The seven days",
  "conquistas.ritual-completo.texto": "You did the whole ritual, from the first day to the seventh.",
  "fichas.unidade": "token",
  "fichas.unidade.plural": "tokens",
  "fichas.motivo.leitura": "Today's reading",
  "fichas.motivo.ritual": "One day of the ritual",
  "fichas.motivo.missao": "One mission of the day",
  "fichas.motivo.carta": "New card in the album",
  "fichas.gasto.leituraExtra": "One more reading today",
  "barra.mapa": "Map",
  "coracao.aposta.rotulo": "TOMORROW'S BET",
  "coracao.aposta.convite": "And tomorrow, how do you think you arrive?",
  "coracao.aposta.guardada": "Saved. It opens the next time you record your heart.",
  "coracao.aposta.acertos": "You have got yourself right {n} times.",
  "coracao.aposta.leve.leve": "You bet light and you arrived light. You know yourself.",
  "coracao.aposta.leve.neutro": "You bet light. You arrived neutral. Close — and the day was yours.",
  "coracao.aposta.leve.pesado": "You bet light. You arrived heavy. Days change — you recorded it honestly.",
  "coracao.aposta.neutro.leve": "You bet neutral. You arrived light. The day surprised you.",
  "coracao.aposta.neutro.neutro": "You bet neutral and you arrived neutral. A fine read of your own rhythm.",
  "coracao.aposta.neutro.pesado": "You bet neutral. You arrived heavy. You looked at it head on and wrote it down.",
  "coracao.aposta.pesado.leve": "You bet heavy. You arrived light. You were stronger than the night before said.",
  "coracao.aposta.pesado.neutro": "You bet heavy. You arrived neutral. The night before weighed more than the day.",
  "coracao.aposta.pesado.pesado": "You bet heavy and you arrived heavy. You listened to yourself — and you came anyway.",
};

export default EN;
