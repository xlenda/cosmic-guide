// datos/missoes365.en.js
// INGLES das missoes de datos/missoes365.js.
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
// descobre este arquivo pelo NOME (.en.js = en) sem ninguem registrar nada.
//
// ===========================================================================
// O QUE FOI ADAPTADO, E NAO TRADUZIDO AO PE DA LETRA
// ===========================================================================
// `[nome]` dentro do texto NAO e marcador de interpolacao: nenhum codigo o
// substitui (conferido em screens/PlanoScreen.js:1411-1414 e lib/missaoDoDia.js).
// E lacuna de prosa, para quem le preencher de cabeca. Entao ele VAI traduzido
// ('[nombre]', '[name]'), junto com [fato]/[sentimento]/[pedido]/[gesto exato].

export const MISSOES_EN = Object.freeze({
  /* ===== DEGELO (55) ===== */
  'degelo:0': { // Releitura em silêncio
    titulo: "Rereading in silence",
    acao: "Open your last conversations with that person and reread them for 5 minutes without replying to anything. Then close the app and write one single sentence on paper: what you noticed in your own tone.",
    porque: "Reading without replying trains you to observe before you react. What you notice in your own tone today changes how you write from here on.",
  },
  'degelo:1': { // Ensaio do limite
    titulo: "Rehearsing the limit",
    acao: "Choose one limit you want to keep (for example: no replying in the middle of the night). Say the sentence out loud 3 times, in front of the mirror, as if you were talking to that person.",
    porque: "A rehearsed limit comes out steadier when the real moment arrives. Saying it out loud takes the sentence out of the realm of ideas and makes it concrete.",
  },
  'degelo:2': { // Lista do que mudou
    titulo: "List of what changed",
    acao: "Take pen and paper and list 5 concrete things that have changed in you since the split. Only what another person could notice from the outside counts.",
    porque: "Real change is the kind that shows up in behavior, not in speeches. That list shows you what is already standing — and what is still only an intention.",
  },
  'degelo:3': { // Carta que não se envia
    titulo: "The letter you don't send",
    acao: "Write in a notes app everything you feel like saying to that person, unfiltered, for up to 10 minutes. When you finish, don't send it: save the file in a folder or tear up the paper.",
    porque: "What stays trapped asks for a way out. When you pour it all somewhere safe, there is less pressure left when it's time to write the real message.",
  },
  'degelo:4': { // Mapa dos impulsos
    titulo: "Map of the urges",
    acao: "Write down the 3 moments of the day when the urge to text hits hardest (for example: late at night). Next to each one, write a swap action — something simple that fills those minutes.",
    porque: "A mapped urge stops running you. Knowing the hour it squeezes lets you choose your response instead of acting on autopilot.",
  },
  'degelo:5': { // Resposta de bolso
    titulo: "Pocket reply",
    acao: "Write and save in your notes a short, kind reply, two lines at most, to use if that person messages you. Read it out loud and adjust it until it sounds natural.",
    porque: "Having a reply ready keeps you from deciding in the heat of the moment. Calm built in advance is easier to hold on to.",
  },
  'degelo:6': { // Teste do tom
    titulo: "The tone test",
    acao: "Reread out loud the last 5 messages you sent that person. Mark the ones that sound like a complaint and rewrite one of them in a lighter version — just for you, without sending it.",
    porque: "Tone shows up when a message becomes sound. Rewriting without sending is practice in writing light, at no risk at all.",
  },
  'degelo:7': { // Dez minutos de pausa
    titulo: "Ten minutes of pause",
    acao: "The next time the urge to write to that person hits, set a 10-minute timer and write the message on paper, not on your phone. When the timer goes off, decide calmly whether it still makes sense.",
    porque: "The pause separates the urge from the choice. Plenty of messages that felt urgent lose their urgency in ten minutes.",
  },
  'degelo:8': { // Estoque de assuntos leves
    titulo: "A stock of light topics",
    acao: "List 5 light topics that have nothing to do with the relationship: a show, a recipe, a place, a song, a piece of news. Save the list in your phone notes.",
    porque: "Light conversation needs raw material. With the stock ready, you don't depend on inspiration in the moment — and you don't fall into the heavy subject for lack of options.",
  },
  'degelo:9': { // Três perguntas abertas
    titulo: "Three open questions",
    acao: "Write 3 open questions about that person's day-to-day life — questions that can't be answered with yes or no. Pick the best one and set it aside for the right moment.",
    porque: "An open question invites someone to talk; a closed one ends things. Preparing it beforehand takes away the weight of improvising.",
  },
  'degelo:10': { // Duas colunas
    titulo: "Two columns",
    acao: "Split a sheet of paper into two columns: on one side, what depends on you (your tone, your timing, your word); on the other, what doesn't (that person's answer, the pace, how it ends). Fill it in for 5 minutes.",
    porque: "Putting each thing in the right column saves energy. You act better on what is yours once you stop carrying what isn't.",
  },
  'degelo:11': { // Fecho do dia
    titulo: "Closing the day",
    acao: "Before you sleep, write one line: one thing you did today for yourself, unrelated to that person. Read it back quietly and close the notebook.",
    porque: "Getting closer weighs less when your life still has an owner. One line a day records that your life keeps happening outside this story.",
  },
  'degelo:12': { // Plano para o frio
    titulo: "A plan for the cold",
    acao: "Write a dignified exit line to use if that person replies curtly or takes their time: something like 'all good, I'll leave it here — rest well'. Rehearse it out loud once.",
    porque: "Coldness weighs less on someone who has already decided how to answer it. The prepared line protects you from insisting on impulse.",
  },
  'degelo:13': { // Faxina de indiretas
    titulo: "Clearing out the hints",
    acao: "Open your own profiles and review your latest posts for 5 minutes. If you find a veiled jab, a vent or a provocation, delete or archive it.",
    porque: "What you post is also talking to that person. A profile clear of messages-in-a-bottle holds the same calm tone as your messages.",
  },
  'degelo:14': { // Uma frase gentil no post
    titulo: "One kind line on the post",
    acao: "Pick something that person posted recently and react with a single kind sentence about the content — for example: 'that place looks incredible'. Send it and leave the app.",
    porque: "A light comment reopens the channel without asking for anything back. Leaving the app afterward keeps the gesture small, exactly the size this moment calls for.",
  },
  'degelo:15': { // Resposta curta e calma
    titulo: "A short, calm reply",
    acao: "If there's a message from that person left unanswered, answer it now, calmly: two lines at most, light tone, no complaint and no heavy question. Reread it once before sending.",
    porque: "Answering with composure shows, in practice, what changed in your tone. Short and kind is easier to sustain than long and intense.",
  },
  'degelo:16': { // Pergunta sobre o dia
    titulo: "A question about the day",
    acao: "Send one open, simple question about that person's day — for example: 'how was your day?'. One question only, nothing tacked on, and no rush for an answer.",
    porque: "Genuine interest in someone's ordinary life is the lightest step of getting closer. One question at a time leaves room for that person to come at their own pace.",
  },
  'degelo:17': { // Gratidão específica
    titulo: "Specific gratitude",
    acao: "Send a thank-you for something old and specific that person did — a tip, a favor, a recommendation. One sentence, straight: 'I remembered that tip you gave me about this — thank you, really'. Don't tack on another subject.",
    porque: "Specific gratitude sounds true because it has an address. It acknowledges that person without opening a conversation about your shared past.",
  },
  'degelo:18': { // Envio leve
    titulo: "A light send",
    acao: "Send something small tied to one of that person's interests: a meme, a song, an article. Add one simple line, like 'saw this and it felt like you' — and nothing more.",
    porque: "Sharing something from someone's interests says 'I pay attention to you' without having to declare anything. And it makes it easy to answer — or not.",
  },
  'degelo:19': { // Elogio ao feito
    titulo: "Praise for the work",
    acao: "Praise, in one sentence, something that person made — a project, a dish, a workout, something that showed up on their profile. Talk about the work, not the looks: 'that project of yours turned out really well'.",
    porque: "Praising what that person builds acknowledges effort, not just image — and it opens a conversation about something they like.",
  },
  'degelo:20': { // Pedido de recomendação
    titulo: "Asking for a recommendation",
    acao: "Ask that person for a recommendation in something they know well — a film, a book, a place. One sentence: 'got a film for me? I trust your taste'.",
    porque: "Asking for an opinion puts that person in the position of having something to offer. It's a light bridge: it invites conversation without touching anything delicate.",
  },
  'degelo:21': { // Resposta ao story
    titulo: "Replying to the story",
    acao: "Reply to one of that person's stories with a short, specific comment about what's on screen — the food, the view, the song. One sentence, no heavy question, and that's it.",
    porque: "A story is a public invitation to comment. Replying there is the lowest-weight gesture there is: easy to do, easy to receive.",
  },
  'degelo:22': { // Novidade em comum
    titulo: "Shared news",
    acao: "Send a neutral piece of news tied to something you both like — 'the new season of that show is out', 'the band announced a tour'. One informative line, no reaction expected.",
    porque: "A shared interest is safe ground: it gives you something to talk about without touching the relationship. Light information asks for nothing in return.",
  },
  'degelo:23': { // Pergunta sobre o projeto
    titulo: "A question about the project",
    acao: "Ask about something that person mentioned they were doing — a course, a move, a hobby: 'how's that course going?'. One question, and room for the answer to arrive whenever it arrives.",
    porque: "Remembering an everyday detail shows real attention, without touching your shared past. Asking about the present is talking to who that person is today.",
  },
  'degelo:24': { // Leveza na resposta
    titulo: "Lightness in the reply",
    acao: "When that person sends you something funny or light, answer in the same key: a written laugh, a good-humored comment, short. Don't use the momentum to bring up something serious.",
    porque: "Matching the light tone shows that talking to you is easy. Laughing together is a kind of closeness that doesn't require a big conversation.",
  },
  'degelo:25': { // Arqueologia da última conversa
    titulo: "Archaeology of the last conversation",
    acao: "Reread your last conversation for 5 minutes, without replying to anything. Write down one single sentence you would read differently today.",
    porque: "Going back to the real record, rather than to memory's version, helps you reopen contact from what actually happened — not from what hurt.",
  },
  'degelo:26': { // Três versões da primeira frase
    titulo: "Three versions of the first line",
    acao: "Write 3 versions of the reopening message. Cut the one that asks for an answer, cut the one that explains too much, and keep the lightest.",
    porque: "The first message of the thaw carries too much weight when it complains or justifies. Choosing between versions takes the decision away from impulse.",
  },
  'degelo:27': { // Filtro de expectativa
    titulo: "Expectation filter",
    acao: "Set a 5-minute timer and write down everything you'd like to hear from that person. Then cross out whatever is asking too much for this moment.",
    porque: "Seeing expectation on paper separates legitimate wanting from rushing — and rushing tends to weigh on a first contact.",
  },
  'degelo:28': { // Ensaio da resposta seca
    titulo: "Rehearsing the curt reply",
    acao: "Say out loud, right now, how you'd answer if the reply comes back short or takes a whole day. Repeat it until it comes out with no anger in your voice.",
    porque: "Whoever rehearses the hard scenario doesn't improvise in the heat. Your reaction to the first reply says more than the message itself.",
  },
  'degelo:29': { // Teto do dia
    titulo: "The day's ceiling",
    acao: "Write on paper the maximum number of messages you allow yourself to send that person today. Leave the paper visible on the table.",
    porque: "A limit set beforehand protects the thaw from enthusiasm. Too many messages early on tend to refreeze what was starting to melt.",
  },
  'degelo:30': { // Faxina de rascunhos
    titulo: "Clearing out the drafts",
    acao: "Search your notes and drafts for any text of complaint or venting addressed to that person. Delete it for good.",
    porque: "A heavy draft kept around is temptation on a hard night. Without it nearby, the urge finds less ammunition.",
  },
  'degelo:31': { // Pasta de pontes
    titulo: "Folder of bridges",
    acao: "Put 2 or 3 neutral memes, photos or links that match your shared sense of humor into a folder on your phone. Nothing romantic goes in that folder.",
    porque: "Having light content ready lowers the odds of reopening contact with a wall of text. A bridge is built from small material.",
  },
  'degelo:32': { // Três linhas de mudança
    titulo: "Three lines of change",
    acao: "Write in 3 lines what changed in you since the split — with concrete facts, not with 'I've changed'. For example: 'these days I wait before replying'.",
    porque: "If the conversation reaches that point, a concrete sentence sounds true. Change described in generalities sounds rehearsed.",
  },
  'degelo:33': { // Simulação do pior cenário
    titulo: "Worst-case rehearsal",
    acao: "Write in 5 minutes what you'll do with the rest of your day if the message is left on read. A real plan: what to cook, who to call, what to watch.",
    porque: "Contact without a plan B becomes hostage to the answer. With the day mapped out, the silence weighs less and you don't send the second message on impulse.",
  },
  'degelo:34': { // Calendário do degelo
    titulo: "The thaw calendar",
    acao: "Mark the day of the first contact on your calendar and block the day after as your day of silence, whatever happens.",
    porque: "Scheduled space between one step and the next gives the other side time to feel their own wanting — and keeps you from steamrolling the process.",
  },
  'degelo:35': { // Estudo de tom
    titulo: "Tone study",
    acao: "Reread for 2 minutes a good, old conversation between you — not the argument. Write down in one word the tone that worked: teasing, calm, curiosity.",
    porque: "The thaw recognizes the ground by its tone. Picking up the mood of the good times signals familiarity without having to talk about the past.",
  },
  'degelo:36': { // Lista do que não é agora
    titulo: "List of what isn't for now",
    acao: "Write 5 topics that are off limits in this phase: who was wrong, jealousy, old hurt, promises, the label of the relationship. Take a photo of the list.",
    porque: "Knowing what not to say is half the conversation. The list works as a handrail when the exchange heats up and your tongue itches.",
  },
  'degelo:37': { // Teste do áudio-espelho
    titulo: "The mirror-audio test",
    acao: "Record a 1-minute voice note for yourself, reading your reopening line. Listen to it and answer honestly: does it sound like an invitation, or like a complaint?",
    porque: "Text fools its own author; voice doesn't. If it sounds like a complaint in your own ear, it tends to sound worse still on the other side.",
  },
  'degelo:38': { // Sinal de recuo
    titulo: "Signal to step back",
    acao: "Define in writing which reply — or which absence — means 'I pause for a week'. For example: two reads in a row with no answer.",
    porque: "A criterion set with a cool head protects your dignity when emotion wants to push. Stepping back at the right time is part of the thaw too.",
  },
  'degelo:39': { // Corte até caber em duas linhas
    titulo: "Cut it to two lines",
    acao: "Take the message you plan to send and cut words until it fits in 2 lines on screen, without losing the meaning.",
    porque: "A short message leaves room for the other person to enter the conversation. A wall of text fills everything and leaves no space for an answer.",
  },
  'degelo:40': { // Reação de um toque
    titulo: "A one-tap reaction",
    acao: "React to one of that person's stories or posts with a single emoji that fits the content. No message attached. Close the app right after.",
    porque: "It's the smallest possible signal of presence: it shows you're around without demanding anything. The other person decides whether to turn it into a conversation.",
  },
  'degelo:41': { // Ponte de uma linha
    titulo: "One-line bridge",
    acao: "Send one item from your folder of bridges with a single sentence, no question. For example: 'this one is so you'. Then put the phone down for 10 minutes.",
    porque: "A message with no question doesn't demand a reply — which is exactly why it's easier to answer. Putting the phone down takes you out of the read-receipt vigil.",
  },
  'degelo:42': { // Comentário sobre o conteúdo
    titulo: "A comment on the content",
    acao: "Comment on something that person posted, talking about the content itself — the place, the food, the music. Nothing about the two of you.",
    porque: "Talking about the post and not the relationship keeps the exchange on solid ground. Light conversation, repeated, tends to weigh less than forced depth.",
  },
  'degelo:43': { // Vi isso e lembrei
    titulo: "Saw this and thought of you",
    acao: "Send a link on a neutral subject with the text 'saw this and thought of you' — and nothing else. No add-ons, no second message.",
    porque: "Saying you thought of someone is a fact, not a request. It says you're present in their mind without putting any weight on the answer.",
  },
  'degelo:44': { // Uma pergunta, espera inteira
    titulo: "One question, the whole wait",
    acao: "Ask one single open question about that person's life right now and wait for the answer without sending anything else — even if it takes hours.",
    porque: "A single question shows interest; the waiting shows respect for that person's time. The two together say more than any explanation.",
  },
  'degelo:45': { // Agradecimento fora de época
    titulo: "Thanks out of season",
    acao: "Say thank you for something small and specific from the past — 'that film you recommended really was good' — in one sentence, without bringing up the relationship.",
    porque: "Gratitude that is specific and concrete honors the person without reopening the wound. It's human warmth in a dose that doesn't frighten.",
  },
  'degelo:46': { // Espelho de ritmo
    titulo: "Mirroring the pace",
    acao: "In your next exchange, answer at the same length and in the same timeframe as the message you received: short with short, calm with calm.",
    porque: "Mirroring the pace signals attunement without words. Replying three paragraphs to a 'haha' hands over your anxiety and throws the conversation off balance.",
  },
  'degelo:47': { // Sair no ponto alto
    titulo: "Leaving on a high note",
    acao: "When the conversation is at a good moment, be the one to close it with a light goodbye: 'I have to go, I enjoyed this'.",
    porque: "Ending before it runs out leaves a taste of wanting more instead of tiredness. A light full stop clears a natural path to the next one.",
  },
  'degelo:48': { // Janela do cotidiano
    titulo: "A window into your day",
    acao: "Send a simple photo from your day — the coffee, the sky, the street — with one line of context. No question, no deep caption.",
    porque: "Showing your routine opens a window without throwing the door wide. The other person sees your life going on and chooses whether to look closer.",
  },
  'degelo:49': { // Parabéns de uma frase
    titulo: "One-sentence congratulations",
    acao: "If that person achieved something recently — a new job, an exam, a project — congratulate them in one specific sentence. And stop there.",
    porque: "Celebrating that person's win without tacking on conversation shows generosity with no apparent ulterior motive. The 'stop there' is what makes it graceful.",
  },
  'degelo:50': { // Convite de porta aberta
    titulo: "Open-door invitation",
    acao: "Propose something with an easy exit: 'Saturday I'll be at café X around 10, drop by if it works'. Don't follow up asking whether they're coming.",
    porque: "An invitation with no obligation to reply leaves the decision entirely on the other side. Presence that comes from choice is worth more than presence from insistence.",
  },
  'degelo:51': { // Faz sentido, antes do seu ponto
    titulo: "That makes sense, before your point",
    acao: "In your next conversation, when that person gives an opinion, answer first with 'that makes sense' and only then add your own view.",
    porque: "Validating before disagreeing breaks the debate reflex that strained relationships carry. Feeling that your opinion was heard melts old ice.",
  },
  'degelo:52': { // Gancho pra depois
    titulo: "A hook for later",
    acao: "When you answer one of that person's questions, close with a light hook: 'I'll tell you the rest of that story later'. And follow through, days later.",
    porque: "An honest hook creates continuity without forcing a meeting. The conversation gains a next chapter without anyone having to ask for it.",
  },
  'degelo:53': { // Logística como pretexto honesto
    titulo: "Logistics as an honest pretext",
    acao: "If there's an object, a book or a belonging to return, send a practical message to arrange it: day, place, five minutes.",
    porque: "Real logistics gives a legitimate reason for a short meeting with no expectations. Brief, concrete contact tends to frighten less than 'we need to talk'.",
  },
  'degelo:54': { // Trinta segundos de voz
    titulo: "Thirty seconds of voice",
    acao: "Send a voice note of up to 30 seconds, light tone, neutral subject — a funny story from your day. Time it before you send it.",
    porque: "Voice carries warmth and intention that text hides. Thirty seconds show your real tone without taking up the other person's space.",
  },

  /* ===== CARINHO (58) ===== */
  'carinho:0': { // A casa que acolhe
    titulo: "The home that welcomes",
    acao: "Spend 10 minutes tidying the first room a visitor sees on the way in: put away what's out of place, open the window, leave a pleasant light on.",
    porque: "Caring for your space is practicing welcome without waiting for anyone to arrive. You're the one living inside that care today — and that already changes your day.",
  },
  'carinho:1': { // O gosto emprestado
    titulo: "The borrowed taste",
    acao: "Pick a song, a dish or a subject that person always loved and spend 10 minutes really getting to know it — without telling anyone.",
    porque: "Understanding what delights that person widens your own repertoire of care. And keeping it to yourself keeps the gesture clean: it's attention, not a bargaining chip.",
  },
  'carinho:2': { // Presente de si
    titulo: "A gift from you to you",
    acao: "Buy or set aside a small treat for yourself today — a sweet, a flower, a properly made coffee — and receive it with attention, unhurried, like a real gift.",
    porque: "Whoever practices receiving care recognizes care more easily. That practice starts at home.",
  },
  'carinho:3': { // A xícara reservada
    titulo: "The cup set aside",
    acao: "Set aside a mug or a seat at the table with that person in mind, and leave it clean and in plain sight for the day.",
    porque: "Saving a space is a quiet gesture of presence. It changes how you look at your own home — and it asks nothing of anyone.",
  },
  'carinho:4': { // Dez minutos de aprendiz
    titulo: "Ten minutes as an apprentice",
    acao: "Practice for 10 minutes something that person does well: a recipe, a game, a few words of another language, a chord on the guitar.",
    porque: "Admiration that turns into practice is more concrete than admiration in thought. You keep something of that person in what you learn.",
  },
  'carinho:5': { // Cheiro de casa cuidada
    titulo: "The smell of a cared-for home",
    acao: "Change the bedsheets, or wipe down the room where you spend the most time with something that smells good.",
    porque: "Presence comes in through the senses too. A cared-for space treats you with the same care you want to offer.",
  },
  'carinho:6': { // Carta que fica na gaveta
    titulo: "The letter that stays in the drawer",
    acao: "Write 5 lines of affection for that person and put them away without sending them.",
    porque: "Naming affection organizes affection. And putting it away is practice in giving without collecting change — the hardest and cleanest care there is.",
  },
  'carinho:7': { // O álbum de gestos
    titulo: "The album of gestures",
    acao: "List on paper 5 small gestures that person once made for you — a note, a ride, a meal cooked.",
    porque: "Remembering the care you received shows what you value and teaches the care you want to give back.",
  },
  'carinho:8': { // Mesa posta
    titulo: "A set table",
    acao: "Make a simple meal and serve it with care: a nice plate, a clean table, your phone far away.",
    porque: "Care doesn't need an audience. Serving yourself well is rehearsal for the care you want to put into the world.",
  },
  'carinho:9': { // Algo vivo na janela
    titulo: "Something alive by the window",
    acao: "Buy or pick a flower, or set aside a small pot, and put it somewhere you walk past every day.",
    porque: "Caring for something alive is presence in miniature: a daily, small, real gesture — exactly what affection is made of.",
  },
  'carinho:10': { // Inventário do acolhimento
    titulo: "An inventory of welcome",
    acao: "Walk around your home for 5 minutes and write down: 3 things that already make the place feel welcoming and 1 that deserves attention this week.",
    porque: "Looking at your home through the eyes of someone who hosts is a way of preparing yourself inside, with no visit on the calendar.",
  },
  'carinho:11': { // Presente de tempo
    titulo: "A gift of time",
    acao: "Set aside 10 minutes today for something that brings you pleasure and serves no purpose: leafing through a book, listening to a whole record with your eyes closed, looking at the sky.",
    porque: "Care for yourself is also time, not only things. Whoever gives themselves time learns the value of presence — their own and anyone else's.",
  },
  'carinho:12': { // A lembrança emoldurada
    titulo: "The framed memory",
    acao: "Choose a photo of a good moment in your life and put it in plain sight: your wallpaper, a frame, the fridge door.",
    porque: "Seeing again what was already good reminds you of something simple: affection is something you know and know how to live.",
  },
  'carinho:13': { // O doce favorito
    titulo: "The favorite treat",
    acao: "At the next meeting you've already arranged, bring the sweet or the drink that person loves most. Hand it over without a speech: \"I thought of you\".",
    porque: "A small gesture of attention says \"I see you\" better than any long declaration. The value is in the remembering, not in the price.",
  },
  'carinho:14': { // Elogio com endereço
    titulo: "Praise with an address",
    acao: "Say or send a specific, truthful compliment about something that person did — the way they solved a problem, the care in one detail. Nothing generic.",
    porque: "Praise about a detail shows real attention. It's different from flattering: it's seeing — and everyone can tell the difference.",
  },
  'carinho:15': { // Memória boa, ponto final
    titulo: "A good memory, full stop",
    acao: "Send a short message sharing a good memory: \"I remembered that day when we...\". End it without a question and without waiting for an answer.",
    porque: "Sharing without charging for it is affection with no hook. The message is worth what it delivers, not what comes back.",
  },
  'carinho:16': { // Convite de dia claro
    titulo: "A daylight invitation",
    acao: "Make a short, simple, daytime invitation: \"coffee Thursday afternoon?\". Receive any answer lightly.",
    porque: "A light invitation asks for little and offers presence. Daylight, a set time, zero drama — it's the kindest way to offer company.",
  },
  'carinho:17': { // A pergunta que lembra
    titulo: "The question that remembers",
    acao: "In your next conversation, ask about something that person mentioned before: \"how did that meeting go?\", \"did you finish that course?\".",
    porque: "Remembering what was said is presence in the shape of a question. It shows the last conversation stayed with you.",
  },
  'carinho:18': { // A entrega certeira
    titulo: "The well-aimed delivery",
    acao: "Hand over or send something small tied to one of that person's interests: a book on loan, a recipe written out, a link to a song — with one line of context.",
    porque: "A good gift isn't the expensive one: it's the one that proves you listen. One line of context is enough; the rest explains itself.",
  },
  'carinho:19': { // Obrigado com nome e data
    titulo: "Thanks with a name and a date",
    acao: "Thank that person for something specific they did for you in the past — recent or old — in one direct sentence: \"that really helped me\".",
    porque: "Named gratitude is affection that asks for nothing in return. And what gets said out loud stops weighing in silence.",
  },
  'carinho:20': { // Foto do caminho
    titulo: "A photo from the way there",
    acao: "When something in your day reminds you of that person — a shop window, a dish, a poster — take a photo and send it with one line. No question at the end.",
    porque: "It's the lightest way of saying \"you pass through my days\". Short, true and without charging for an answer.",
  },
  'carinho:21': { // Presença inteira
    titulo: "Whole presence",
    acao: "At the next arranged meeting, arrive 5 minutes early and keep your phone put away for the whole conversation.",
    porque: "Whole attention for a short while is worth more than a long while given by halves. Presence is the kind of care you can't fake.",
  },
  'carinho:22': { // O bastidor gentil
    titulo: "The kind backstage",
    acao: "Tell that person one good thing you think on ordinary days and have never said out loud — a quality, a gesture you notice.",
    porque: "A lot of good things die in silence for seeming obvious. Saying it out loud takes the affection out of storage and puts it into circulation.",
  },
  'carinho:23': { // Ajuda miúda
    titulo: "Small help",
    acao: "Offer small, concrete help with something that person mentioned: \"want me to send you that contact?\", \"I can lend you mine\".",
    porque: "Small help is affection in useful form. It doesn't intrude, it doesn't weigh — it just shows you were listening.",
  },
  'carinho:24': { // Bom dia com detalhe
    titulo: "Good morning with a detail",
    acao: "Send a short good morning with that person's name and one real detail from your day: \"morning, [name] — the bakery made that bread you like\". No question.",
    porque: "A good morning with a detail is different from a good morning sticker: there's a person inside it. And it asks nothing of whoever receives it.",
  },
  'carinho:25': { // A despedida por inteiro
    titulo: "The full goodbye",
    acao: "At the end of the next conversation or meeting, swap the dry \"bye\" for a whole sentence: \"it was good to see you, take care\".",
    porque: "A careful goodbye closes the meeting with the same care it started with. It's a detail — and affection lives in details.",
  },
  'carinho:26': { // Elogio fora da relação
    titulo: "Praise outside the relationship",
    acao: "Pick a friend or someone in your family and send a message right now praising something specific they did: 'that lunch was incredible', 'your piece came out great', 'the way you handled that was elegant'.",
    porque: "Praising for real is a muscle. Training it with whoever is nearby makes the gesture sharper — and less loaded — when it matters.",
  },
  'carinho:27': { // Inventário de gestos
    titulo: "Inventory of gestures",
    acao: "Take pen and paper and list 5 small gestures of affection you received in your life and still remember. It could be a meal cooked, a note, someone who waited for you.",
    porque: "What stayed in your memory reveals the kind of gesture that tends to mark you. It's an honest map of what you know how to give.",
  },
  'carinho:28': { // Nome de quem serve
    titulo: "The name of whoever serves you",
    acao: "Today, thank someone who serves you regularly by name — at the front desk, the bakery, the market. Look at the person and say a whole sentence: 'Thank you, [name]. Your care makes a difference.'",
    porque: "Presence begins in seeing whoever is in front of you. Using the name turns a transaction into an encounter.",
  },
  'carinho:29': { // Flor no copo
    titulo: "A flower in a glass",
    acao: "Take a flower, a branch or a pretty leaf — from the yard, the street, the market — and put it in a glass of water on the table where you eat.",
    porque: "Caring for your own space with one living detail is affection in its quiet version. You start eating while looking at something you chose.",
  },
  'carinho:30': { // Releitura de elogio
    titulo: "Rereading a compliment",
    acao: "Find an old message on your phone where someone praised you. Reread it slowly and write one sentence about what that compliment says about your way of caring.",
    porque: "A saved compliment is a mirror. Seeing again what someone already saw in you reminds you of the repertoire of care you already have.",
  },
  'carinho:31': { // Três minutos de janela
    titulo: "Three minutes at the window",
    acao: "Stand 3 minutes at a window or your front door, without your phone, and write down 3 things in the view you had never noticed.",
    porque: "Presence is trained attention. Whoever notices the still detail on the street also notices the detail in the person they love.",
  },
  'carinho:32': { // Cuidar de algo vivo
    titulo: "Caring for something alive",
    acao: "Water a plant and clean its leaves with a damp cloth, one by one. No plants at home? Give those minutes to the pet, or put a small pot on your shopping list.",
    porque: "Steady care is learned in the repeated tending of something that doesn't speak. The plant doesn't say thank you — and that is exactly the practice.",
  },
  'carinho:33': { // Primeiro carinho da memória
    titulo: "The first affection you remember",
    acao: "Write in 5 lines the oldest gesture of affection you remember receiving. Describe the place, who did it and what they did.",
    porque: "Going back to the origin of affection shows where your way of giving and receiving comes from. Knowing the root is preparation too.",
  },
  'carinho:34': { // Bem feito, assinado
    titulo: "Well done, signed",
    acao: "Write down 3 things you did in the last few days that turned out well — from a difficult email to a dish that worked. Next to each one, write: 'well done'.",
    porque: "Whoever acknowledges their own work learns to acknowledge other people's. Praise starts at home.",
  },
  'carinho:35': { // Beleza repassada
    titulo: "Beauty passed along",
    acao: "Choose a beautiful photo you took recently — a sky, a dish, a street corner — and send it to a friend with one sentence: 'saw this and thought of you'.",
    porque: "Sharing beauty is affection at low cost and with no strings. And it keeps your web of care alive beyond the relationship.",
  },
  'carinho:36': { // Pausa para a pergunta
    titulo: "A pause for the question",
    acao: "At the next counter conversation today — bakery, front desk, checkout — stop what you're doing, put your phone away and ask a real question about the day of whoever is serving you.",
    porque: "Presence is measured in the body: stopping, looking, asking. Rehearsing it in small encounters prepares you for the big ones.",
  },
  'carinho:37': { // Meu jeito de dar carinho
    titulo: "My way of giving care",
    acao: "List 5 ways you naturally show care — cooking, listening, fixing, giving gifts, touch, writing. Circle the strongest and the one you use least.",
    porque: "Knowing your own repertoire keeps you from giving only what comes easily to you. Good care also considers how the other side receives.",
  },
  'carinho:38': { // Objeto em destaque
    titulo: "An object on display",
    acao: "Choose an object of yours that carries a good memory — a gift, a souvenir from a trip — and put it somewhere visible in your home, clean and in order.",
    porque: "Giving a place of honor to what holds history is practicing appreciation. Whoever honors a good memory cultivates the eye that values.",
  },
  'carinho:39': { // Áudio para você
    titulo: "A voice note for you",
    acao: "Record a 1-minute voice note for yourself, speaking in the tone you'd use with a close friend: name what's been heavy and say one kind sentence about how you've been handling all of it.",
    porque: "The tone you use with yourself leaks into the tone you use with others. Kindness turned inward is rehearsal for kindness turned outward.",
  },
  'carinho:40': { // Elogio ao ofício
    titulo: "Praise for the craft",
    acao: "Watch someone working with their hands for a few minutes — at the bakery, the market, a repair shop — and praise one specific detail of the craft: 'you got that dough exactly right'.",
    porque: "Praising the work requires looking before speaking. It's the same looking that notices the effort of the person you love.",
  },
  'carinho:41': { // Elogio ao feito, sem anzol
    titulo: "Praise for the work, no hook",
    acao: "Send a message praising something that person did recently — a piece of work, a meal, a decision. Name the detail and end with no question: none of the 'so...?'.",
    porque: "Praise for the work talks about what that person built, not about the relationship. With no question at the end, it's a gift — not bait.",
  },
  'carinho:42': { // Foto sem pergunta
    titulo: "A photo with no question",
    acao: "Did you see something today that reminded you of that person — a dish, a place, a shop window? Send the photo with one light sentence: 'this is so you'. And stop there, without watching for a reply.",
    porque: "Showing that person crossed your mind is presence. Not charging for a reply is respect. The two together are rare.",
  },
  'carinho:43': { // Convite com hora de acabar
    titulo: "An invitation with an end time",
    acao: "Make a short invitation with a beginning and an end: 'coffee tomorrow, 4 to 4:30?'. Name the place and make it clear that half an hour is enough.",
    porque: "An invitation with a limit is easy to accept and light to turn down. You're offering a meeting, not a bottomless commitment.",
  },
  'carinho:44': { // A pergunta do detalhe
    titulo: "The question about the detail",
    acao: "Remember something that person mentioned — an interview, an exam, a vet appointment, a match? Ask today how it went, naming the detail.",
    porque: "Remembering what matters to the person you love is the quiet proof of listening. No speech needed: the memory speaks.",
  },
  'carinho:45': { // Cumprimento de corpo presente
    titulo: "A greeting with your body present",
    acao: "At the next meeting, greet them with your whole attention: stop, look, say 'good to see you' and, if it fits between you, a brief hug. No phone in hand.",
    porque: "The first minute of a meeting sets the tone for the rest. A present body communicates what no word reaches.",
  },
  'carinho:46': { // Gratidão com data
    titulo: "Gratitude with a date",
    acao: "Send a message thanking them for something specific from the past: 'I remembered when you did that for me. I never forgot. Thank you.'",
    porque: "Gratitude for an old fact asks nothing of the present. It's one of the few messages that only delivers, charging nothing back.",
  },
  'carinho:47': { // Ajuda de escopo fechado
    titulo: "Help with a closed scope",
    acao: "Offer help that is concrete, small and has an end: 'I can proofread your text', 'I'll lend you my drill', 'I'll pick you up at 6'. One offer only, well specified.",
    porque: "Vague help ('call me if you need anything') never goes anywhere. An offer with a scope shows real care and respects the room to say no.",
  },
  'carinho:48': { // Correio de interesse
    titulo: "Mail about their interest",
    acao: "Find a link, a video or an article about something that person loves — it doesn't even have to be your thing — and send it with one sentence: 'saw this and thought of your fan side for this'.",
    porque: "Holding someone's interests in your memory is a way of saying 'I pay attention to who you are', without having to say it.",
  },
  'carinho:49': { // Convite de tarefa comum
    titulo: "An invitation to an ordinary errand",
    acao: "Invite that person along on a short, ordinary errand: 'I'm going to the bakery at 9, want to come?'. Twenty minutes, no script, no formal table.",
    porque: "A meeting without ceremony takes the weight off 'we need to talk'. Side by side, walking, conversation finds its way — or the silence becomes comfortable.",
  },
  'carinho:50': { // O esforço que ninguém vê
    titulo: "The effort nobody sees",
    acao: "Acknowledge, by message or in person, something that person always does and almost nobody notices: 'you never forget anyone's birthday', 'your place always makes us feel welcome'.",
    porque: "Acknowledging the invisible is rare. That compliment says: 'I see the work, not just the result'.",
  },
  'carinho:51': { // Presença no dia D
    titulo: "Presence on the day",
    acao: "Does that person have something important coming up — a presentation, an exam, a move? On the day, send one line: 'today's the day, right? Rooting for you from here.'",
    porque: "Showing up at the right moment is worth more than a thousand words at the wrong one. One line on the right day shows that person's calendar lives in your head.",
  },
  'carinho:52': { // Devolução com bilhete
    titulo: "A return with a note",
    acao: "Do you have something of that person's on loan? Return it today or arrange the handover — clean, complete, with a short thank-you note along with it.",
    porque: "Returning something well is a gesture of respect that speaks of trust. The note turns an obligation into affection.",
  },
  'carinho:53': { // Pedir o olhar
    titulo: "Asking for their eye",
    acao: "Ask that person's opinion on a subject they know well: 'between these two, which would you pick?'. Send a photo or the context and thank them for the answer, whatever it is.",
    porque: "Asking an opinion says 'I value your eye' without having to declare anything. And it opens a conversation on ground where that person stands firm.",
  },
  'carinho:54': { // Áudio de 30 segundos
    titulo: "A 30-second voice note",
    acao: "Record a short voice note — 30 seconds at most — telling one good thing from your day and wishing them a good week. No question at the end.",
    porque: "Voice carries a warmth text doesn't have. Short and with no question, it's a kindness that demands nothing in return.",
  },
  'carinho:55': { // Elogio na hora, ao vivo
    titulo: "Praise in the moment, in person",
    acao: "At the next meeting, notice something out loud, right then: 'this turned out great', 'good call on this place'. One specific sentence, said in the moment, looking at that person.",
    porque: "Praise in person, in the instant of the thing itself, carries a weight no message reproduces. It takes only attention — and it's the attention that communicates.",
  },
  'carinho:56': { // Convite de duas portas
    titulo: "A two-door invitation",
    acao: "Offer an invitation with a choice of two: 'coffee or ice cream, you pick — half an hour this week?'. Two simple options, the decision on the other side.",
    porque: "Giving the choice shares control of the meeting. It becomes easier to say yes — and if a no comes, it answers the plan, not you.",
  },
  'carinho:57': { // Agrado de bolso
    titulo: "A pocket-sized treat",
    acao: "At the next meeting, bring a small treat tied to something that person likes: their favorite bread, a piece of fruit, a childhood candy. Pocket change in cost, attention in choice.",
    porque: "The value isn't in the object, it's in the proof that you keep track of what the people who matter like. Small enough not to make anyone uncomfortable.",
  },

  /* ===== CONFIANCA (58) ===== */
  'confianca:0': { // A promessa da semana
    titulo: "This week's promise",
    acao: "Write on paper one small promise you're making to yourself this week — something that takes a few minutes a day — and stick the paper where you look every day.",
    porque: "Trusting someone gets easier when your own word carries weight with you. That starts with promises that fit inside your day.",
  },
  'confianca:1': { // O balanço honesto
    titulo: "The honest reckoning",
    acao: "Take a promise you made to yourself recently and write, without softening it: I kept it, I partly kept it, or I didn't — and what got in the way.",
    porque: "Looking straight at your own word, without drama and without excuses, is the most direct honesty practice there is.",
  },
  'confianca:2': { // Reler os limites
    titulo: "Rereading the limits",
    acao: "Reread now the limits you wrote in the previous moons and mark each one: this one held, this one wobbled, this one fell.",
    porque: "A limit written and never revisited becomes decoration. Rereading shows what is still true for you today.",
  },
  'confianca:3': { // Um limite reescrito
    titulo: "One limit rewritten",
    acao: "Choose a limit that has changed since you wrote it and rewrite it in one clear sentence, in the present tense, the way it is today.",
    porque: "You changed over these moons. An updated limit protects who you are now, not who you were months ago.",
  },
  'confianca:4': { // A âncora diária
    titulo: "The daily anchor",
    acao: "Choose one minimal gesture to repeat every day at the same time — making the bed, a short walk, writing three lines — and do it for the first time now.",
    porque: "A small routine, kept, is the quiet foundation of trust: each repetition shows you that you can count on yourself.",
  },
  'confianca:5': { // O diário da palavra
    titulo: "The journal of your word",
    acao: "Write down three moments from this week when you did exactly what you said you would — for yourself or for someone else.",
    porque: "We memorize our own stumbles and forget the times we got it right. Recording what you kept balances the scale with facts.",
  },
  'confianca:6': { // A promessa quebrada
    titulo: "The broken promise",
    acao: "Identify a promise you made to yourself and didn't keep. Write down what made it hard and one concrete adjustment to try again in a smaller version.",
    porque: "A broken promise doesn't ask for self-punishment, it asks for a redesign. Shrinking it until it fits your life is maturity, not weakness.",
  },
  'confianca:7': { // O horário que é seu
    titulo: "The hour that is yours",
    acao: "Set a fixed time of day that belongs only to you — ten minutes is enough — and create the alarm on your phone now, with a name that reminds you why.",
    porque: "Whoever keeps a space for themselves holds the shared spaces better. The alarm turns an intention into a commitment.",
  },
  'confianca:8': { // Inventário de confiança
    titulo: "Trust inventory",
    acao: "List three of your behaviors that build trust around you and one that erodes it. Next to the one that erodes it, write the smallest step to reduce it.",
    porque: "Trust isn't a trait, it's a set of habits. Naming yours makes it visible where to act.",
  },
  'confianca:9': { // Os cinco minutos devidos
    titulo: "The five minutes you owe",
    acao: "Take that task you've been putting off for days and work on it for five timed minutes. Just five. Then stop, if you want.",
    porque: "Every postponement charges a tax on the trust you have in yourself. Five minutes paid now reopens your own line of credit.",
  },
  'confianca:10': { // Três linhas adiante
    titulo: "Three lines ahead",
    acao: "Write three lines to your version of yourself a month from now: what you want to find still standing when that month has passed.",
    porque: "Writing to who you want to become turns vague wanting into direction. And three lines fit into any day.",
  },
  'confianca:11': { // Cinco minutos de silêncio
    titulo: "Five minutes of silence",
    acao: "Sit somewhere quiet, leave your phone far away and stay five minutes in silence, just noticing what shows up when nobody is asking anything of you.",
    porque: "In the noise we repeat other people's opinions. In the silence you can hear what you really feel about this new place.",
  },
  'confianca:12': { // O mapa do que sustenta
    titulo: "The map of what holds you up",
    acao: "Write a list of what holds you up when the relationship wobbles: people, places, habits, projects. Keep it somewhere you can find it later.",
    porque: "Whoever has their own ground talks about hard subjects with less fear, because their whole life isn't staked on a single table.",
  },
  'confianca:13': { // Na hora combinada
    titulo: "At the agreed time",
    acao: "Agree with that person on an exact time for a call or a meeting — and keep it to the minute, neither far too early nor late.",
    porque: "Punctuality is the simplest way of saying 'your waiting matters to me' without using big words.",
  },
  'confianca:14': { // Aviso dado, aviso cumprido
    titulo: "Word given, word kept",
    acao: "Today, tell that person you'll let them know when you arrive, leave or finish something — and send the message at the exact moment it happens.",
    porque: "One small notice, kept, is worth more than ten declarations. Steadiness is measured in gestures that size.",
  },
  'confianca:15': { // Fato, sentimento, pedido
    titulo: "Fact, feeling, request",
    acao: "Choose a delicate subject and speak to that person using three sentences: 'When [fact] happened, I felt [feeling]. I wanted to ask you for [clear request].'",
    porque: "That structure takes the accusation out of the front and puts all of you into the conversation: what happened, what hurt, what helps.",
  },
  'confianca:16': { // O erro com nome e sobrenome
    titulo: "The mistake with a full name",
    acao: "Admit to that person one specific mistake of yours, in three sentences at most, with no 'but' and no context that softens it: what you did, what it caused, and full stop.",
    porque: "Justification dilutes an apology until almost nothing is left. A mistake owned in full is rare — and that's why it lands.",
  },
  'confianca:17': { // Prometido, entregue
    titulo: "Promised, delivered",
    acao: "Promise that person something small and concrete — a photo, a song, a recipe, a link — and deliver it within ten minutes.",
    porque: "The promise-and-keep cycle, even in miniature, is the basic brick of trust. The shorter the cycle, the more visible the brick.",
  },
  'confianca:18': { // Resposta clara
    titulo: "A clear answer",
    acao: "Take a message or an invitation from that person that was left without a definite answer and reply now with a yes, a no or a concrete date.",
    porque: "Leaving it hanging looks polite, but it charges interest: whoever waits fills the silence with the worst version.",
  },
  'confianca:19': { // O combinado da semana
    titulo: "The week's agreement",
    acao: "Propose to that person one simple, small agreement for the next seven days — a goodnight message, a coffee on the calendar — and put the agreement in writing.",
    porque: "An explicit agreement takes the relationship out of guesswork. Both sides know what to expect — and what to deliver.",
  },
  'confianca:20': { // Fechar o assunto aberto
    titulo: "Closing the open subject",
    acao: "Pick back up with that person a conversation that was left half-finished: 'That subject stayed open. I have ten minutes now, shall we finish it?'",
    porque: "An interrupted subject doesn't disappear, it ferments. Closing the conversation gives both sides the ground back.",
  },
  'confianca:21': { // Cinco minutos de escuta
    titulo: "Five minutes of listening",
    acao: "Ask that person how their day went — and listen for five minutes without correcting, without finishing their sentences and without steering it to yourself.",
    porque: "Listening without competing is one of the rarest things anyone receives. Whoever listens like that creates a place where the truth can be said.",
  },
  'confianca:22': { // O aviso antes do atraso
    titulo: "The warning before you're late",
    acao: "If something you arranged with that person has changed or might run late, say so now, the moment you know — not at the last minute.",
    porque: "Being late is annoying; the surprise of it corrodes. Telling someone early turns a problem into information.",
  },
  'confianca:23': { // Deixa eu ver se entendi
    titulo: "Let me see if I understood",
    acao: "In your next conversation with that person, before answering something important, repeat what you heard in your own words: 'Let me see if I understood: you're saying that...'",
    porque: "Plenty of fights start with an answer given to something nobody said. Checking first costs ten seconds and saves hours.",
  },
  'confianca:24': { // Nomear a constância
    titulo: "Naming the steadiness",
    acao: "Tell that person, specifically, one thing they did just as they had agreed: 'I noticed that [exact gesture]. That counted for me.'",
    porque: "Steadiness nobody notices tends to wither. What is seen and named earns a reason to happen again.",
  },
  'confianca:25': { // Perguntar em vez de presumir
    titulo: "Asking instead of assuming",
    acao: "Take one assumption you made about that person in the last few days and turn it into a direct question: 'I'd rather ask than guess: ...?'",
    porque: "A silent assumption becomes a sentence with no trial. Asking gives that person the chance to exist outside your imagination.",
  },
  'confianca:26': { // Promessa de cinco minutos
    titulo: "A five-minute promise",
    acao: "Choose an old promise you made to yourself — something put off for weeks — and keep a 5-minute version of it now: the first paragraph, the first drawer, the first call on the list.",
    porque: "Self-trust is built by keeping what you agreed with yourself. A small version, done today, is worth more than the perfect version that stays in your head.",
  },
  'confianca:27': { // Inventário da palavra
    titulo: "Inventory of your word",
    acao: "Write down the commitments you took on in the last 7 days — with anyone, or with yourself. Mark each one: kept it, ran late, let it drop. No judgment, just the portrait.",
    porque: "Nobody improves what they can't see. Seeing on paper the distance between what you promise and what you deliver is the first step of any real change.",
  },
  'confianca:28': { // Cancelamento honesto
    titulo: "An honest cancellation",
    acao: "Is there a commitment you already know, deep down, you can't keep? Tell whoever depends on it now, with notice and without an elaborate excuse: 'I can't do it, I'd rather tell you now'.",
    porque: "Cancelling with notice is your word kept in another form: when it can't be done, the honest warning preserves what vanishing destroys.",
  },
  'confianca:29': { // Hora de sair, não hora de chegar
    titulo: "Time to leave, not time to arrive",
    acao: "Take your next commitment with a set time. Count backward: travel time + 10 minutes of slack. Create the alarm now, named 'leave for...'.",
    porque: "Lateness is rarely disrespect — it's bad arithmetic. Whoever schedules the departure, not the arrival, moves punctuality out of the realm of intention and into method.",
  },
  'confianca:30': { // Cronômetro contra o otimismo
    titulo: "A stopwatch against optimism",
    acao: "Time yourself today on something you always underestimate: shutting the computer and leaving, the trip to the market, getting ready to go out. Write down the real number.",
    porque: "Promising a time based on an optimistic guess is breaking your word in slow motion. The real number on paper changes the promises you make from here on.",
  },
  'confianca:31': { // Uma pendência riscada
    titulo: "One loose end crossed off",
    acao: "Open your to-do list (or make one now) and do the fastest item on it — the one under 10 minutes you've been pushing for days. Cross it off with gusto.",
    porque: "Every old loose end whispering at the back of your mind erodes the trust you have in your own word. Crossing one off, today, is concrete evidence against that whisper.",
  },
  'confianca:32': { // Prometi, cumpri
    titulo: "Promised, kept",
    acao: "Create a note on your phone called 'Promised → Kept'. Log the first line today: one small promise, due by tomorrow, that depends only on you.",
    porque: "Steadiness isn't declared, it's recorded. A short list of promises kept becomes a history you can check on the days you doubt yourself.",
  },
  'confianca:33': { // O erro em uma frase
    titulo: "The mistake in one sentence",
    acao: "Write a recent mistake of yours in a single sentence: the fact alone, no 'but', no context, no blaming circumstances. For example: 'I was 40 minutes late on Thursday and didn't say anything'.",
    porque: "Admitting a mistake is a skill you train, and the hardest part is removing the 'but'. Practicing on paper, with no audience, prepares the admission that one day has to be spoken.",
  },
  'confianca:34': { // Renegociar antes de falhar
    titulo: "Renegotiate before you fail",
    acao: "Look at your calendar for the next 3 days. Find the commitment you accepted without wanting to. Renegotiate it now: propose another date or cancel it clearly.",
    porque: "A calendar full of commitments accepted out of politeness is a factory of broken words. Renegotiating early is choosing to disappoint small now instead of big later.",
  },
  'confianca:35': { // Devolução agendada
    titulo: "A scheduled return",
    acao: "Think of something borrowed that's still with you — an object, a book, a small amount of money. Set it aside now and set the day and time to return it, writing it in your calendar.",
    porque: "A borrowed thing sitting still is a silent promise accruing interest. Setting it aside and scheduling it turns a vague debt into an agreement with a date.",
  },
  'confianca:36': { // Âncora de três noites
    titulo: "A three-night anchor",
    acao: "Choose one fixed micro-commitment for the next 3 nights — reviewing tomorrow's schedule at 9 p.m., for instance. Set the reminder now, at the same time all 3 days.",
    porque: "Steadiness is trained in the small and the repeated. Three nights in a row keeping the same tiny agreement shows you in practice what regularity tastes like.",
  },
  'confianca:37': { // A resposta que você deve
    titulo: "The reply you owe",
    acao: "Find a message — from work, a friend, family — that you promised to answer and didn't. Answer now, starting by owning it: 'I took too long, that's on me'.",
    porque: "A word kept lives in replies too. Owning the delay instead of pretending it didn't happen closes the loop in a way silence never does.",
  },
  'confianca:38': { // Ensaio da desculpa limpa
    titulo: "Rehearsing the clean apology",
    acao: "Choose an apology you owe someone and rehearse it out loud, in this format: what I did + the effect it had + no 'but'. Two repetitions is enough.",
    porque: "An apology with a 'but' hands the blame back to whoever is listening. Rehearsing the clean version, with no audience, takes the improvising out of the moment it has to be said.",
  },
  'confianca:39': { // O não que protege o sim
    titulo: "The no that protects the yes",
    acao: "Identify a recent request you want to turn down and write the refusal in two sentences: 'I can't take this on right now' + an honest alternative, if there is one. Send it, or leave the message saved to send.",
    porque: "Every yes given without backing steals value from all the others you say. Whoever refuses clearly promises less — and breaks less.",
  },
  'confianca:40': { // Ritual de véspera
    titulo: "The night-before ritual",
    acao: "Prepare now what tomorrow's commitment requires: set out the folder, the document, the clothes, the address on the map. Leave it all in one visible place.",
    porque: "Half of all lateness is born in a rushed morning, hunting for keys. A prepared night before is punctuality starting twelve hours ahead of the clock.",
  },
  'confianca:41': { // Palavra da semana
    titulo: "Word of the week",
    acao: "Choose ONE single agreement with yourself for the next 7 days — small, measurable, almost daily. Write it on paper and stick it where you look every day.",
    porque: "Ten goals become none. One single agreement, visible and small, fits into a real life — and keeping it for a week teaches more about steadiness than any big plan.",
  },
  'confianca:42': { // Chego às...
    titulo: "I'll be there at...",
    acao: "If there's a meeting set with that person, send a message now with the exact time: 'I'll be there at 7'. Then create the departure alarm that holds that time.",
    porque: "Naming a specific time, instead of 'I'll be there later', turns an intention into a verifiable commitment. And the alarm is you treating your word as something serious.",
  },
  'confianca:43': { // Um erro, nomeado
    titulo: "One mistake, named",
    acao: "Send that person a message admitting ONE specific mistake of yours — with the situation and the date, no 'but', asking nothing in return: 'on Tuesday I said I'd call and I didn't. That was mine.'",
    porque: "A vague admission ('I know I messed up a lot') costs nothing and repairs nothing. Naming the exact mistake shows you really looked at what you did.",
  },
  'confianca:44': { // A promessa esquecida
    titulo: "The forgotten promise",
    acao: "Think of something small you promised that person and never delivered — the photo, the link, the recipe, the name of that film. Deliver it now, with one line: 'I still owed you this'.",
    porque: "Small promises forgotten teach that person what to expect from the big ones. Delivering one, even late, shows that your word doesn't expire.",
  },
  'confianca:45': { // Aviso antes do atraso
    titulo: "Notice before the delay",
    acao: "If there's any chance you'll be late for your next arrangement with that person, say so now — with a new, realistic time, not with 'almost there'.",
    porque: "Being late hurts less than waiting with no information. Telling someone early, with an honest number, is respecting the time of whoever is waiting.",
  },
  'confianca:46': { // Pergunta corajosa
    titulo: "The brave question",
    acao: "Ask that person, by message or in person: 'Was there something I promised and didn't do? You can name one.' Then just listen or read — no defending, no explaining.",
    porque: "You can't see your own broken words; whoever lives alongside you can. Hearing one, without defending yourself, is worth ten self-assessments.",
  },
  'confianca:47': { // Check-in de cinco minutos
    titulo: "A five-minute check-in",
    acao: "Propose to that person one fixed, small agreement: 5 minutes of conversation on a set day and time — 'Sunday, 8 p.m., we talk for 5 minutes, sound good?'. Put it in your calendar the minute you send it.",
    porque: "Steadiness isn't intensity, it's frequency with a set time. A tiny ritual, kept, weighs more than big, vague promises.",
  },
  'confianca:48': { // Correção da história
    titulo: "Correcting the story",
    acao: "If you exaggerated, left something out or bent a story when you told it to that person, correct it now: 'remember what I told you about X? Actually it went like this...'",
    porque: "Trust rests on a single version of the facts. Correcting it yourself, before anyone asks, costs pride — and it's precisely because it costs that it counts.",
  },
  'confianca:49': { // Combinado por escrito
    titulo: "The agreement in writing",
    acao: "Take the last half-vague agreement between you ('we'll sort that out later') and turn it into a concrete message: 'so here's how it stands: I handle X by Thursday, and you let me know about Y. Deal?'",
    porque: "A vague agreement is the seed of a double disappointment: each side remembers a different version. Putting it in black and white protects you both from selective memory.",
  },
  'confianca:50': { // Desculpa com data
    titulo: "An apology with a date",
    acao: "Apologize to that person for ONE specific delay or letdown from the past, naming the day: 'that Saturday I left you waiting — I'm sorry, I shouldn't have done that'. With no justification afterward.",
    porque: "A generic apology dilutes; an apology with a date shows the episode stayed with you too. It's the difference between closing a subject and burying one.",
  },
  'confianca:51': { // O não dito com respeito
    titulo: "The no said with respect",
    acao: "Is there something that person asked for and you answered with a 'maybe' that's really a no? Say the no now, with one careful sentence: 'I'd rather tell you no now than let you down later'.",
    porque: "A maybe pushes the disappointment forward and charges interest. A clean no hurts once — and it shows your yes has something behind it.",
  },
  'confianca:52': { // Reconhecer a palavra cumprida
    titulo: "Acknowledging a word kept",
    acao: "Think of a time that person did what they said they would — even something small. Say it today, specifically: 'you said you'd do X and you did. I noticed.'",
    porque: "Trust grows in both directions. Noticing someone's steadiness out loud values what already works between you — acknowledging builds too, not only asking.",
  },
  'confianca:53': { // Data no lugar do 'qualquer dia'
    titulo: "A date instead of 'someday'",
    acao: "Take that vague plan with that person — the outing always postponed — and propose a date and time now: 'how about Saturday at 4?'. Offer two options, if that makes it easier.",
    porque: "'Someday' is where plans die in silence. Setting a date is taking your word out loud — and an arrangement with a set time has another chance of happening.",
  },
  'confianca:54': { // Tarefa pequena, prazo claro
    titulo: "A small task, a clear deadline",
    acao: "Take on ONE small, dated task with that person: 'I'll handle X by Friday'. Choose something that fits your week with room to spare. Write it down the same minute you promise it.",
    porque: "A small promise kept builds more trust than a big, heroic one. And writing it down on the spot is the habit of someone who treats their word as a contract.",
  },
  'confianca:55': { // A demora assumida
    titulo: "The delay owned",
    acao: "Open that message from that person that was left unanswered. Answer now, starting with the responsibility: 'I took too long, and that was on me, it had nothing to do with you'. Then answer the content.",
    porque: "A long silence leaves the other person filling the gap with the worst guess. Owning the delay first undoes that doubt before any explanation.",
  },
  'confianca:56': { // A régua de confiança
    titulo: "The measure of trust",
    acao: "Ask that person one specific thing: 'what does being late mean to you?' or 'what makes you feel you can count on someone?'. One question only — and listen to the end.",
    porque: "Everyone measures trust with a different ruler. Knowing the ruler of the person who matters keeps you from breaking agreements you didn't know existed.",
  },
  'confianca:57': { // Confirmação de véspera
    titulo: "Day-before confirmation",
    acao: "If there's a commitment with that person in the next 48 hours, confirm it now: 'still on for Thursday at 7? I'm organizing my day around it.' Without waiting for them to confirm first.",
    porque: "Confirming the day before shuts the door on misunderstanding and shows the meeting is genuinely in your calendar — not in the 'if it works out' pile.",
  },

  // ===================== CAPITULO 13 — espelho (31) =====================
  // LOTE ESPELHO+FDS, na chave 'capitulo:indice' que o cabecalho de
  // datos/missoes365.js declara como contrato e que missaoTraduzida() le.
  //
  // O INGLES E O IDIOMA MENOS GUARDADO DOS TRES: hablaDelFuturo()
  // (madremaria/lib/lectura.js:422) morde morfologia de futuro PT/ES (-ra/-rao/
  // -ran) e "will come back" nao tem terminacao para morder. Quem cobre o ingles
  // e test/madremaria-promessa-tres-idiomas.test.js, por descoberta de disco.
  //
  // GESTOS ADAPTADOS (o gesto tem de ser FAZIVEL no pais de quem le):
  //   · 'pastel' (da feira) -> 'something to snack on' — o pastel de feira nao
  //     existe fora do Brasil; o gesto e comer algo rapido no mercado.
  //   · 'feira'             -> 'farmers market' / 'market'.
  //   · 'geladeiroteca'     -> 'a little free library or book-swap spot' — a
  //     geladeira reaproveitada como estante de rua e brasileira; a PRATICA existe.
  //   · 'padaria'           -> 'bakery (counter)' — a padaria de balcao brasileira
  //     nao tem equivalente exato; o gesto (tomar o cafe no balcao em vez de
  //     levar) se faz em qualquer cafe com balcao.
  //   · 'luta' (aula exper.) -> 'a martial art' — 'luta' generico em PT nao tem
  //     equivalente de uma palavra em EN sem soar a briga de rua.
  //
  // GENERO: 'that person', e 'they/them' quando precisa de pronome — nunca
  // 'he'/'she', porque o PT nao trava e o app fala com qualquer pessoa.
  'espelho:0': Object.freeze({
    titulo: 'The first moon, again',
    acao: 'Open what you wrote on the first moon of this turn and read it slowly. Underline one sentence that sounds different today from how it sounded when you wrote it.',
    porque: 'Rereading the starting point shows the distance you covered — and nobody has to confirm that measurement for you.',
  }),
  'espelho:1': Object.freeze({
    titulo: 'The letter you do not send',
    acao: 'Write a letter to that person with everything that went unsaid this year. When you finish, put the letter away: it is not meant to be sent.',
    porque: 'Putting on paper what got stuck sorts out what was loose inside. This letter is yours, start to finish.',
  }),
  'espelho:2': Object.freeze({
    titulo: 'Change, with evidence',
    acao: 'List three things that changed in you this year. Next to each one, write a concrete example: a day, a scene, a choice that shows the change happening.',
    porque: 'Change without an example is a pretty sentence. With an example, it becomes a record of what you actually did.',
  }),
  'espelho:3': Object.freeze({
    titulo: 'Next year’s suitcase',
    acao: 'Split a page into two columns: \'taking with me\' and \'leaving here\'. Fill both with habits, ideas and ways of acting from this year.',
    porque: 'Choosing in writing weighs differently from choosing in your head — paper demands clarity.',
  }),
  'espelho:4': Object.freeze({
    titulo: 'Gratitude in writing',
    acao: 'Write in your notebook the name of every person who stayed close this year and, next to each name, one line about what that presence did for you.',
    porque: 'Naming who stayed brings those presences out of the background. What gets written down stops going unnoticed.',
  }),
  'espelho:5': Object.freeze({
    titulo: 'The first gesture, once more',
    acao: 'Redo today the first exercise of this turn, exactly as you did it on the first moon. Then write three lines on what was the same and what was different.',
    porque: 'The same gesture done at two distant moments works like a ruler: it compares without relying on memory.',
  }),
  'espelho:6': Object.freeze({
    titulo: 'The year’s line',
    acao: 'Draw a timeline of this turn and mark three high points and three hard points on it. Give each point a short name.',
    porque: 'Seeing the whole year on a single line changes the scale: what seemed enormous takes up the room it actually takes up.',
  }),
  'espelho:7': Object.freeze({
    titulo: 'The name of this year',
    acao: 'If this turn were a book chapter, what would its title be? Write the title and a short paragraph explaining the choice.',
    porque: 'Naming a period is a way of closing it completely, instead of leaving it open and shapeless.',
  }),
  'espelho:8': Object.freeze({
    titulo: 'Reread the hard page',
    acao: 'Go back to the hardest passage you wrote this year. Read it again and write, beside it, one line about how that scene looks from today.',
    porque: 'The text stayed still on the paper; the person rereading it has moved. The difference between the two is yours, documented.',
  }),
  'espelho:9': Object.freeze({
    titulo: 'A letter to the one who started',
    acao: 'Write five lines to the person you were on the first moon, telling them what you did not know yet back then.',
    porque: 'Writing to who you were makes the road between there and here visible — with no need to dress anything up.',
  }),
  'espelho:10': Object.freeze({
    titulo: 'What stayed unanswered',
    acao: 'List this year’s questions that are still unanswered. At the end, write: \'I can carry these questions without solving them today\'.',
    porque: 'Not every closing is an answer. Admitting the open question is also a way of finishing at peace with it.',
  }),
  'espelho:11': Object.freeze({
    titulo: 'An inventory of what you did',
    acao: 'List what exists today because you made it happen this year: something written, made, fixed, learned, held up. Small items count.',
    porque: 'Memory keeps what hurt better than what got built. The list corrects that imbalance on paper.',
  }),
  'espelho:12': Object.freeze({
    titulo: 'Two pages, side by side',
    acao: 'Open one page from early in the year and one from the last few weeks. Read them back to back and note one difference in tone you notice between them.',
    porque: 'The tone of the person writing usually changes before they notice it themselves. Comparing pages reveals what happened in between.',
  }),
  'espelho:13': Object.freeze({
    titulo: 'What was about you',
    acao: 'Reread the letter you do not send and underline the sentences that, deep down, say more about you than about that person. Count how many there are.',
    porque: 'Much of what you write to someone is a portrait of the person writing. Seeing that in your own text is honest information.',
  }),
  'espelho:14': Object.freeze({
    titulo: 'Thank yourself',
    acao: 'Write three thank-yous addressed to you: one for something you did, one for something you endured, one for something you decided to stop doing.',
    porque: 'Gratitude usually points outward. Pointing it inward records your own effort, which also happened.',
  }),
  'espelho:15': Object.freeze({
    titulo: 'One minute of mirror',
    acao: 'Stand in front of the mirror for one minute, in silence. Then write three lines about who you saw, without judgement — description only.',
    porque: 'The thirteenth moon is called Mirror for this: looking at yourself with the same attention this whole year gave to looking at that person.',
  }),
  'espelho:16': Object.freeze({
    titulo: 'The end of the letter',
    acao: 'Decide, now, what to do with the letter you do not send: keep it in a box, glue it into the notebook, or tear it up. Carry out the decision right away.',
    porque: 'The letter did its job the moment it was written. What you do with the paper is a closing gesture — and it is entirely yours.',
  }),
  'espelho:17': Object.freeze({
    titulo: 'One gesture for next year',
    acao: 'Write down a single small, repeatable gesture you want to keep next year — something that fits inside an ordinary day. Describe when and how that gesture happens.',
    porque: 'A big intention usually dies on the page; a small, described gesture has somewhere to happen.',
  }),
  'espelho:18': Object.freeze({
    titulo: 'The last page',
    acao: 'Write the final page of this turn: today’s date, a closing sentence of your own choosing and, underneath, your name — like someone signing off.',
    porque: 'Signing the ending is different from simply stopping writing. It is you declaring: this turn had a beginning, a middle and an end.',
  }),
  'espelho:19': Object.freeze({
    titulo: 'The first conversation',
    acao: 'Scroll the thread back to the first conversation you had with that person and reread the first ten messages. Then write one sentence: who were you there?',
    porque: 'Rereading the beginning shows the distance between who arrived and who is here now. That record is yours — nobody has to know you went back.',
  }),
  'espelho:20': Object.freeze({
    titulo: 'The message you sent',
    acao: 'Find a long message you wrote yourself a few months ago — to that person or to anyone else — and reread it. Note one thing you would write differently today.',
    porque: 'The difference between what you wrote and what you would write now is the most concrete measure of what changed in you this year.',
  }),
  'espelho:21': Object.freeze({
    titulo: 'The hardest week',
    acao: 'Think of the heaviest week of your year. Write in one line what you actually did to get through it — a concrete action, not a feeling.',
    porque: 'Naming what held you up turns a hard memory into a resource. Next time it gets tight, you know where the rope is.',
  }),
  'espelho:22': Object.freeze({
    titulo: 'A letter to the one who started the year',
    acao: 'Write five lines to the person you were in January. Tell them what that version of you did not know yet and needed to hear.',
    porque: 'Writing to your past self sorts out what the year taught you — and leaves it on record that you paid attention to your own path.',
  }),
  // ATENCAO, DUPLICATA DE TITULO: 'A carta que fica' existe TAMBEM em
  // vocePrimeiro:29, com acao e porque DIFERENTES (la sao 5 minutos de escrita
  // livre; aqui e a carta de fechamento do ano, datada e guardada). E o caso que
  // o cabecalho de datos/missoes365.js cita para justificar 'capitulo:indice'.
  // As duas traducoes sao distintas de proposito.
  'espelho:23': Object.freeze({
    titulo: 'The letter that stays',
    acao: 'Write a short letter to that person saying what this year taught you about this story. Date it, fold it and keep it — it is not meant to be sent.',
    porque: 'Saying on paper what went unsaid takes away the weight of carrying it all inside. The letter does its job without leaving the drawer.',
  }),
  'espelho:24': Object.freeze({
    titulo: 'An ordinary day next December',
    acao: 'Write ten lines describing an ordinary day of yours at the end of next year — where you wake up, what you do in the morning, what occupies your head. Write in the present tense, as if you were already there.',
    porque: 'Putting on paper the life you want to build changes nothing by magic — but it gives you a target to compare each choice of the year against.',
  }),
  'espelho:25': Object.freeze({
    titulo: 'Two photos, one difference',
    acao: 'Open your gallery and pick one photo of yourself from early in the year and one recent. Put them side by side and write one difference you can see — in the eyes, the posture, the setting.',
    porque: 'A whole year of change is too slow to watch live. Side by side, it shows.',
  }),
  'espelho:26': Object.freeze({
    titulo: 'Three sentences, three seasons',
    acao: 'Complete these in writing: \'In January I...\', \'Mid-year I...\', \'Today I...\'. Observable facts only — what you were doing, where you were, what occupied your head.',
    porque: 'Seeing the three versions on the same page shows the year did not stand still — not even in the months when it seemed to.',
  }),
  'espelho:27': Object.freeze({
    titulo: 'January’s worry list',
    acao: 'Write from memory what worried you most in January — three to five items. Then cross out each one that no longer exists or has lost its grip.',
    porque: 'Crossing out expired worries shows, on paper, how much resolved itself without you noticing the exact moment it did.',
  }),
  'espelho:28': Object.freeze({
    titulo: 'The word that carries over',
    acao: 'Choose one word to take into next year. Write it on a small piece of paper and put it where your eyes land every day — your wallet, the mirror, your lock screen.',
    porque: 'A word chosen calmly works as a filter: faced with a decision, you ask whether it fits inside the word you chose.',
  }),
  'espelho:29': Object.freeze({
    titulo: 'What does not go in the suitcase',
    acao: 'Write on a piece of paper one habit or one thought you choose to leave behind in this year. Fold it and tear it up — or throw it away. The gesture closes the decision.',
    porque: 'Deciding what stays behind is as much part of the closing as deciding what carries on. The torn paper marks the border.',
  }),
  'espelho:30': Object.freeze({
    titulo: 'A one-line contract',
    acao: 'Write a sentence that starts with \'Next year, I choose...\' and ends with something that depends only on you. Sign it and add the date.',
    porque: 'A signed choice weighs differently from a loose wish. And what depends only on you is never held hostage by anyone’s answer.',
  }),

  // ================== FIM DE SEMANA — MISSOES_FDS (42) ==================
  // Este pool NAO esta em MISSOES_POR_CAPITULO: lib/missaoDoDia.js o troca
  // inteiro no sabado e no domingo. A chave segue o mesmo molde, com 'fds' no
  // lugar do capitulo — e e o que missaoTraduzida(missao, 'fds', i) procura.
  'fds:0': Object.freeze({
    titulo: 'The coffee that keeps getting postponed',
    acao: 'Send a message now to the person from that coffee that keeps getting postponed: propose Saturday morning, with a place and a time. Write it and send it before you overthink it.',
    porque: 'Rebuilding your circle gives you solid ground again. Anyone who wants to get closer to someone needs a life that stands on its own.',
  }),
  'fds:1': Object.freeze({
    titulo: 'Yes to the invitation you would turn down',
    acao: 'Take that invitation you would turn down out of tiredness or sadness and say yes. If there is no open invitation, ask a friend what is going on this weekend.',
    porque: 'Saying yes breaks the shutting-down cycle. A living social routine changes how you show up in any conversation — including the ones that matter most.',
  }),
  'fds:2': Object.freeze({
    titulo: 'A new place on the map',
    acao: 'Pick a spot in the city you have never walked into — a café, a park, a market — and put it in Saturday’s calendar with a set time.',
    porque: 'New ground takes you out of the memory circuit. Leaving the old setting helps you see the relationship with less noise.',
  }),
  'fds:3': Object.freeze({
    titulo: 'A five-minute call',
    acao: 'Call someone you love who you have not spoken to in weeks. Five minutes is enough: ask how they are and really listen.',
    porque: 'Listening to someone trains the attention any reconnection asks for. And it reminds you that you are not going through this stretch on your own.',
  }),
  'fds:4': Object.freeze({
    titulo: 'The sleeping group chat',
    acao: 'Open that friend group chat that has gone quiet and propose something concrete for Sunday: a time, a place, a meeting point. One message does it.',
    porque: 'Whoever proposes the plan becomes the meeting point. Real social movement shows up in your energy — with nothing to announce.',
  }),
  'fds:5': Object.freeze({
    titulo: 'Sunday walk',
    acao: 'Early on Sunday, walk ten minutes down a street you do not know. Leave your phone in your pocket and notice three new things along the way.',
    porque: 'A body in motion sorts out the head. You come back with more clarity to decide the next steps calmly.',
  }),
  'fds:6': Object.freeze({
    titulo: 'Sunday lunch',
    acao: 'Invite someone from your family or an old friend to Sunday lunch. Short message: day, time and what you are cooking — or where you are meeting.',
    porque: 'Sharing a meal rebuilds a bond without effort. That base of affection holds you up on the hard days.',
  }),
  'fds:7': Object.freeze({
    titulo: 'Gratitude as a voice note',
    acao: 'Record a one-minute voice note for whoever carried you through these past weeks. Say what they did and what it meant to you.',
    porque: 'Naming gratitude strengthens the person holding you up. A strong circle is what separates a healthy reconnection from dependence.',
  }),
  'fds:8': Object.freeze({
    titulo: 'A new group',
    acao: 'Sign up right now for a weekend activity that puts people together: a class, a group hike, volleyball in the square, a book club. Filling in the form and confirming is enough.',
    porque: 'New people widen your world. A life that grows on its own makes any reunion lighter, for both sides.',
  }),
  'fds:9': Object.freeze({
    titulo: 'A plan for Saturday night',
    acao: 'Write down three Saturday-night plans that depend only on you or on your friends. Save the list on your phone and pick one now.',
    porque: 'An empty Saturday pulls toward the impulsive message. A plan already set protects you from acting out of need instead of intention.',
  }),
  'fds:10': Object.freeze({
    titulo: 'Counter conversation',
    acao: 'At the bakery or the Saturday market, pull thirty seconds of conversation out of whoever is serving: a genuine remark, a simple question.',
    porque: 'Small talk unjams the big kind. Someone who moves through the day lightly carries less weight into the encounters that matter.',
  }),
  'fds:11': Object.freeze({
    titulo: 'The invitation you owe',
    acao: 'Think of the person who has already invited you twice without a reply. Message them today returning the invitation, with a concrete proposal for this weekend.',
    porque: 'Giving back keeps the circle alive. Tending the bonds that already exist trains the very muscle a reconnection calls for.',
  }),
  'fds:12': Object.freeze({
    titulo: 'A photo for someone',
    acao: 'During your Saturday or Sunday plan, take a photo of something beautiful and send it to a friend with one sentence about the moment.',
    porque: 'Sharing the present anchors you outside nostalgia. And it keeps bridges open without depending on a single person.',
  }),
  'fds:13': Object.freeze({
    titulo: 'A full Sunday afternoon',
    acao: 'Lock in a short plan for Sunday afternoon with someone you love: ice cream, a game, the park. Day, time and place in a single message.',
    porque: 'Sunday afternoon tends to weigh. Filling that slot with a real bond takes the force out of the urge to message out of need.',
  }),
  'fds:14': Object.freeze({
    titulo: 'A half-hour coffee',
    acao: 'Write and send a short invitation to that person: "Saturday, 10am, coffee at [place]? Half an hour, no pressure." Adapt the place and send it.',
    porque: 'An invitation with a day, a time and a short duration respects the other person’s space and makes the yes easier. If the answer is slow or is no, take it without pushing — that speaks too.',
  }),
  'fds:15': Object.freeze({
    titulo: 'A walk in the park',
    acao: 'Invite that person to a twenty-minute walk on Sunday morning: "Sunday, 9am, one loop around [the park]? Quick thing." Send it just like that, simple.',
    porque: 'Walking side by side takes the pressure off face-to-face. A short daytime plan keeps the meeting light, with no air of a final conversation.',
  }),
  'fds:16': Object.freeze({
    titulo: 'A loop around the market',
    acao: 'Propose a loop around the Sunday farmers market: "Sunday, 10am, the market on [street]? One loop and something to snack on." One message, straight to the point.',
    porque: 'A busy place invites laughter, not a review of the relationship. It is time together in a small dose — what an honest reconnection asks for.',
  }),
  'fds:17': Object.freeze({
    titulo: 'Ice cream at five',
    acao: 'Invite them for ice cream late on Saturday afternoon: "Saturday, 5pm, ice cream at [place]? Just half an hour." Send it and put the phone down.',
    porque: 'Late afternoon has a natural hour to end, without turning into a long dinner. A meeting that ends early leaves a taste of more instead of tiredness.',
  }),
  'fds:18': Object.freeze({
    titulo: 'An agreed hand-off',
    acao: 'If you are holding something of that person’s — a book, a coat, a key — propose the hand-off: "Saturday, 11am, I will drop off [the item] at [place]. Five minutes." Send it today.',
    porque: 'A practical reason takes the symbolic weight off the meeting. Short and settled, it opens a door without forcing any.',
  }),
  'fds:19': Object.freeze({
    titulo: 'Saturday bookshop',
    acao: 'Invite them for half an hour at a bookshop or newsstand on Saturday afternoon: "Saturday, 3pm, [name] bookshop? Half an hour, each of us browses whatever we like." Send the message now.',
    porque: 'A place full of things to look at fills the silences effortlessly. The meeting stays about the present, not about reviewing the past.',
  }),
  'fds:20': Object.freeze({
    titulo: 'A market stall',
    acao: 'Go to the neighbourhood market, pick a stall and ask whoever is serving how to prepare something you have never bought. Take one home to try.',
    porque: 'A short conversation with a built-in ending is the easiest way to train human contact again. And you go home with something new on the plate.',
  }),
  'fds:21': Object.freeze({
    titulo: 'An invitation with a day and a time',
    acao: 'Pick a friend you have not seen in a long time and send a complete invitation: day, time and place. None of that \'we should get together\' — propose something ready for a yes or a no.',
    porque: 'A vague invitation dies in \'yeah, let’s do it\'. An invitation with a date actually exists: it either becomes a meeting or becomes a clear answer — and either way you are out of limbo.',
  }),
  'fds:22': Object.freeze({
    titulo: 'Coffee at the counter',
    acao: 'Have your Saturday coffee at the bakery counter, not to go. Exchange at least one real sentence with whoever serves you — a specific compliment about what you ordered already counts.',
    porque: 'Ten minutes among people, with no commitment at all, remind you that being out in the world is lighter than it looks from your front door.',
  }),
  'fds:23': Object.freeze({
    titulo: 'Revive the group chat',
    acao: 'Open that friend group chat that has gone silent, send an old photo of you all and one specific question to one person in the group, by name.',
    porque: 'In a quiet group, nobody wants to take the first step. When someone does, the rest show up — and today that someone can be you.',
  }),
  'fds:24': Object.freeze({
    titulo: 'A two-minute voice note',
    acao: 'Record a voice note of up to 2 minutes for someone in your family or an old friend, telling them one good thing from your week — and end with a question about their life.',
    porque: 'A voice note carries a voice, and a voice carries presence. It is a way of visiting someone without leaving your place — and of proving to yourself that your week did have something good in it.',
  }),
  'fds:25': Object.freeze({
    titulo: 'Next weekend’s radar',
    acao: 'Look up right now 3 free or cheap things happening in your city next weekend — a market, a gig, an exhibition — and put one of them in your calendar with a day and a time.',
    porque: 'A good weekend rarely happens by accident; it gets scheduled beforehand. Whoever plans ahead reaches Saturday with a plan, not with emptiness.',
  }),
  'fds:26': Object.freeze({
    titulo: 'A new street in the old neighbourhood',
    acao: 'Walk 10 minutes down a street in your own neighbourhood you have never turned into. Notice 3 things you did not know were there.',
    porque: 'New ground, even a small patch of it, takes life out of repeat mode. And finding something new two blocks from home is a reminder that discovery does not require a trip.',
  }),
  'fds:27': Object.freeze({
    titulo: 'A compliment with an author',
    acao: 'Today, compliment someone’s work specifically: the bread from whoever baked it, the cut from whoever cut it, the service from whoever served you. Looking them in the eye, in one sentence.',
    porque: 'A specific compliment is a gift that costs nothing and asks for nothing back. And noticing other people’s work trains your eye for the good that is nearby.',
  }),
  'fds:28': Object.freeze({
    titulo: 'Ten minutes as the expert',
    acao: 'Go into a group or forum about your hobby and answer someone’s question with what you know. One careful answer, and that is it.',
    porque: 'Helping with something you are good at reminds you of your own worth — and puts you in the position of the one who offers, not only the one who asks.',
  }),
  'fds:29': Object.freeze({
    titulo: 'A book with a note',
    acao: 'Set aside a book you have read and liked, write on a piece of paper why it is worth reading, and leave the two of them at a little free library or book-swap spot, at the front desk, or with someone the story suits.',
    porque: 'Giving something of yours instead of waiting to receive changes the role you play in your own weekend. And a book sitting on a shelf is of no use to anyone.',
  }),
  'fds:30': Object.freeze({
    titulo: 'Ask for a recommendation',
    acao: 'Message a friend asking for ONE recommendation — a film, a series, a song, a recipe — and tell them you will report back on what you thought.',
    porque: 'Asking for a recommendation is an invitation in disguise: it opens a conversation now and already leaves a reason ready to talk again later.',
  }),
  'fds:31': Object.freeze({
    titulo: 'Say yes once',
    acao: 'Go back through the invitations you left on read this week and answer \'I am in\' to one of them now. If there are none, be the one who invites: call someone for something simple this very weekend.',
    porque: 'A social life rebuilds itself one yes at a time. The first is usually the hardest — the ones after it ride along.',
  }),
  'fds:32': Object.freeze({
    titulo: 'The photo that became a message',
    acao: 'On a walk today, photograph something that reminds you of a friend and send it right then: \'saw this and thought of you\'.',
    porque: 'It is the smallest gesture of friendship there is — it says \'you have a place in my days\' with no need for a special occasion.',
  }),
  'fds:33': Object.freeze({
    titulo: 'A trial class',
    acao: 'Look for a free or cheap trial class near you — dance, a martial art, pottery, anything that uses your hands or your body — and message them now asking about the weekend schedule.',
    porque: 'A new class is one of the few places where striking up a conversation is expected, not odd. And today’s message is what separates \'I want to try\' from \'I have a slot booked\'.',
  }),
  'fds:34': Object.freeze({
    titulo: 'Saturday is born on Sunday',
    acao: 'At the end of Sunday, write down 3 plans for next weekend that do not depend on anyone confirming — and a fourth one with a name on it: who you want to invite.',
    porque: 'A good weekend gets built beforehand, half on your own, half in company. With the plan standing, the week already runs toward something.',
  }),
  'fds:35': Object.freeze({
    titulo: 'Saturday morning coffee',
    acao: 'Invite that person for a coffee at a bakery on Saturday morning: send the message now with a place and a time, making clear it is a quick thing, an hour at most.',
    porque: 'Morning coffee is the lightest plan there is: short, in daylight, with a natural hour to end. Easy to accept — and if the answer is no, your Saturday still stands.',
  }),
  'fds:36': Object.freeze({
    titulo: 'The market, two of you',
    acao: 'Ask that person to come to the market with you this weekend and propose a mission: each of you picks a fruit the other has never tried.',
    porque: 'A market is colour, movement and a ready-made subject at every stall. A plan with a task gives your hands and the conversation something to do — nobody is held hostage by silence.',
  }),
  'fds:37': Object.freeze({
    titulo: 'A walk with an end point',
    acao: 'Propose a short Sunday walk to that person — a square, the waterfront, a park — with an agreed end point: it finishes at the coffee, the snack or the ice cream. Send the invitation with the route already thought through.',
    porque: 'Walking side by side talks better than a table face to face when the subject is delicate. And the end point gives the meeting a natural finish, with no \'so, now what?\'.',
  }),
  'fds:38': Object.freeze({
    titulo: 'A neighbourhood find',
    acao: 'Did you find somewhere new this weekend? Invite that person with one sentence: \'found a place that is so you, I want to show you\'. Make it daytime, about half an hour.',
    porque: 'Someone who shows a find arrives with something to offer, not with a request. And \'so you\' says you pay attention — without having to say anything more.',
  }),
  'fds:39': Object.freeze({
    titulo: 'One plant for each home',
    acao: 'Invite that person to a plant stall or a flower shop this weekend: the mission is to leave with one little plant for each home. Half an hour, daytime, and done.',
    porque: 'Choosing something alive makes conversation easy and gives the plan a purpose. Afterwards, each home looks after its own — the memory stays, and nobody is charged for it.',
  }),
  'fds:40': Object.freeze({
    titulo: 'Sunday ice cream',
    acao: 'On Sunday afternoon, send: \'ice cream in a bit? half an hour and each of us goes back to our Sunday\'. Place, time and duration right there in the message.',
    porque: 'It is the smallest possible meeting: daytime, cheap, with its beginning and end announced. Small enough for the yes to come easily — and if a no comes, it cost one message.',
  }),
  'fds:41': Object.freeze({
    titulo: 'Two options on the table',
    acao: 'Send that person two daytime plan options for the weekend — \'coffee Saturday morning or a walk Sunday afternoon?\' — and leave the whole choice on their side.',
    porque: 'Offering a choice is different from asking for presence: that person takes part in the decision from the start. And you show openness without giving up your own weekend.',
  }),
  /* ================== LOTE 1 DA ONDA 2 ================== */
  /* Os capitulos vocePrimeiro, vontade e voz — 175 missoes, 525 campos.
   * GESTOS ADAPTADOS, e nao traduzidos ao pe da letra:
   *   · 'padaria'     -> 'a bakery or a café' (the Brazilian padaria that serves
   *     breakfast is not universal; the gesture is "leave the house, order
   *     something, take a table", and that travels)
   *   · 'feira'       -> 'the market'  · 'portaria' -> 'the front desk'
   *   · 'polichinelo' -> 'jumping jacks'  · 'tenis' -> 'sneakers'
   *   · 'geladeira'   -> 'the fridge'
   * GENDER: 'that person', 'they', 'someone you trust' — never a locked
   * he/she, because the PT does not lock it and the app speaks to anyone. */

  /* ===== vocePrimeiro (58) ===== */
  'vocePrimeiro:0': Object.freeze({ // Água antes do celular
    titulo: 'Water before the phone',
    acao: 'When you wake up, drink a full glass of water before you unlock your phone. Leave the glass ready on the nightstand the night before.',
    porque: 'The first action of the day decides who is in charge: you or the notification. Taking care of your body early is the first brick of someone getting back up.',
  }),
  'vocePrimeiro:1': Object.freeze({ // Silenciar sem bloquear
    titulo: 'Mute without blocking',
    acao: 'Open the social network where that person shows up the most and mute their posts and their stories. Do not block and do not delete: just take it out of your sight.',
    porque: 'Every unexpected appearance reopens the wound and clears away the dust that had already settled. Muting protects your days without burning a single bridge.',
  }),
  'vocePrimeiro:2': Object.freeze({ // Cama feita
    titulo: 'Bed made',
    acao: 'As soon as you get up, make the bed: straighten the sheet, fix the pillow and the blanket.',
    porque: 'It is the first win of the day, visible and depending on nobody. Order in your corner reminds you that you still govern your own space.',
  }),
  'vocePrimeiro:3': Object.freeze({ // Cinco minutos no papel
    titulo: 'Five minutes on paper',
    acao: 'Take pen and paper and write for five minutes everything that hurts today, unfiltered and without rereading. Then close the notebook and put it away.',
    porque: 'Pain written down weighs less than pain going in circles in your head. The paper holds what you do not need to carry all day.',
  }),
  'vocePrimeiro:4': Object.freeze({ // Um oi pra gente amiga
    titulo: 'A hello to a good friend',
    acao: 'Send a message right now to a friend who does you good: it can be just a \'hey, you crossed my mind, let\'s do something soon\'.',
    porque: 'A breakup shrinks the world; reactivating your circle gives your life back its real size. Someone with people around crosses grief on firmer ground.',
  }),
  'vocePrimeiro:5': Object.freeze({ // Prato de verdade
    titulo: 'A real meal',
    acao: 'Make a simple, real meal: an egg and toast, cut fruit, whatever you have. Sit at the table and eat with no screen nearby.',
    porque: 'Eating any old way is the first sign of abandoning yourself. A meal made with care is self-respect you can chew.',
  }),
  'vocePrimeiro:6': Object.freeze({ // Caixa fora de vista
    titulo: 'A box out of sight',
    acao: 'Pick one object or piece of clothing that reminds you too much of that person and put it in a box, out of your line of sight. Do not throw it away: just move it aside for now.',
    porque: 'You decide what you find when you open the closet, not a memory ambushing you. Fewer triggers in sight, more room to breathe.',
  }),
  'vocePrimeiro:7': Object.freeze({ // Dez minutos de rua
    titulo: 'Ten minutes outside',
    acao: 'Put on your sneakers and walk ten minutes around the block. If you want company, one song only, or the sound of the street.',
    porque: 'A still body invites the mind to spin in place. Ten minutes of walking changes the texture of the whole day.',
  }),
  'vocePrimeiro:8': Object.freeze({ // Banho de virada
    titulo: 'A shower that turns the day',
    acao: 'Take a shower with real attention: wash your hair slowly, scrub with care and, if you are up for it, finish with thirty seconds of cold water.',
    porque: 'A shower is the cheapest way to restart a bad day. Coming out different from how you went in is daily practice at turning things around.',
  }),
  'vocePrimeiro:9': Object.freeze({ // Playlist sem faca
    titulo: 'A playlist with no knife in it',
    acao: 'Build a playlist with only songs that do not talk about the relationship. Take out of rotation, for now, the ones that open the wound.',
    porque: 'Music drives emotion, and replaying the soundtrack of the pain is reliving the scene several times a day. Choosing what plays is protecting your own mood.',
  }),
  'vocePrimeiro:10': Object.freeze({ // Fotos no arquivo
    titulo: 'Photos in the archive',
    acao: 'Move the photos of the relationship to an archived album, out of your phone\'s main gallery. Do not delete anything.',
    porque: 'Tripping over the past at every scroll keeps the dust from settling. Archiving is care for you, not erasing the story.',
  }),
  'vocePrimeiro:11': Object.freeze({ // Cabeceira limpa
    titulo: 'A clear nightstand',
    acao: 'Take everything off the nightstand, wipe it down and put back only the essentials: water, a book, the lamp.',
    porque: 'It is the first and the last scene you see every day. Order there talks straight to your sleep and your mood.',
  }),
  'vocePrimeiro:12': Object.freeze({ // Lista do que fica
    titulo: 'The list of what is still standing',
    acao: 'Write five things in your life that are still standing: work, people, a roof, health, some project. Stick the paper where you can see it.',
    porque: 'Fresh pain swallows the whole landscape. The list gives back the real size of what you still have — and that is where rebuilding starts.',
  }),
  'vocePrimeiro:13': Object.freeze({ // Corpo no chão
    titulo: 'Body on the floor',
    acao: 'Lie on the floor and stretch for five minutes: arms, legs, neck, spine. No technique, just stretch whatever is locked.',
    porque: 'Sadness lives in the body too, in the shape of a knot. Loosening the muscles reaches the pain by a road thinking cannot take.',
  }),
  'vocePrimeiro:14': Object.freeze({ // Feira no papel
    titulo: 'The market on paper',
    acao: 'Write down three real foods for your next shop: a fruit, a vegetable and something you like to cook.',
    porque: 'Planning food is planning care. Someone who eats properly takes the heavy days with a different frame under them.',
  }),
  'vocePrimeiro:15': Object.freeze({ // Cinco minutos de sol
    titulo: 'Five minutes of sun',
    acao: 'Stay five minutes in the morning sun — balcony, yard or sidewalk — with no phone in your hand.',
    porque: 'Morning light wakes the body and marks a start to the day that is yours. It is simple, free, daily recharging.',
  }),
  'vocePrimeiro:16': Object.freeze({ // Emboscada desligada
    titulo: 'Ambush switched off',
    acao: 'Turn off, for now, the automatic \'memories\' and \'on this day\' reminders in your photo apps and social feeds.',
    porque: 'Missing someone by choice is one thing; an algorithm ambush is another. You decide when to look back, not the app.',
  }),
  'vocePrimeiro:17': Object.freeze({ // Uma pendência a menos
    titulo: 'One loose end fewer',
    acao: 'Pick the smallest loose end that has been sitting in your head for days and settle it now: that call, that bill, that work message.',
    porque: 'Every open loose end burns energy quietly, exactly when you have little to spare. Closing one gives you air back for what matters.',
  }),
  'vocePrimeiro:18': Object.freeze({ // Folha da garganta
    titulo: 'Fifteen extra minutes of sleep',
    acao: 'Move your bedtime fifteen minutes earlier today. Just fifteen, without fighting the rest of your routine.',
    porque: 'Grief tires the body like physical work does. Sleeping a little more is the simplest thing that gives it reserves back.',
  }),
  'vocePrimeiro:19': Object.freeze({ // Casa arejada
    titulo: 'Nothing to check',
    acao: 'Pick one stretch of today — an hour is enough — where you do not check that person\'s profile even once. Say out loud which hour it is.',
    porque: 'Checking is the gesture that reopens the wound with your own hands. One protected hour proves it can be done, and tomorrow it is two.',
  }),
  'vocePrimeiro:20': Object.freeze({ // Hora de deitar
    titulo: 'Bedtime',
    acao: 'Decide right now what time you are going to bed today and set a \'bedtime\' alarm on your phone.',
    porque: 'A night with no set hour turns into endless scrolling and 3am rumination. A set hour protects your energy for the next day.',
  }),
  'vocePrimeiro:21': Object.freeze({ // Espelho a favor
    titulo: 'The mirror on your side',
    acao: 'Stand one minute in front of the mirror and say out loud three things you respect in yourself — things you have done, ways you act, not looks.',
    porque: 'In days like these the inner voice tends to be cruel. Saying out loud what is good in you competes for that space — and nobody gets back up from putting themselves down.',
  }),
  'vocePrimeiro:22': Object.freeze({ // Celular fora do quarto
    titulo: 'Phone out of the bedroom',
    acao: 'Tonight, leave your phone charging outside the bedroom and use a plain alarm clock or a watch.',
    porque: 'The urge to check at three in the morning lives on the nightstand. With the device out of reach, the night is yours again.',
  }),
  'vocePrimeiro:23': Object.freeze({ // Suor de cinco minutos
    titulo: 'Five minutes of sweat',
    acao: 'Do five minutes of exercise that takes your breath: skipping rope, climbing stairs, squats, dancing in the living room.',
    porque: 'Sweat is a concrete answer to feeling powerless. The body gains strength before the mind believes it — and lends that strength to everything else.',
  }),
  'vocePrimeiro:24': Object.freeze({ // Prazer com hora
    titulo: 'A pleasure with a time on it',
    acao: 'Pick one small, honest pleasure for today — dessert, an episode of a show, a long bath — and put the time for it in your phone.',
    porque: 'Fresh pain steals the taste out of things. Giving pleasure back on purpose, at a set hour, is rebuilding — not escaping.',
  }),
  'vocePrimeiro:25': Object.freeze({ // Desabafo cronometrado
    titulo: 'Timed venting',
    acao: 'Set a ten-minute timer and let it out properly: cry, talk out loud, write. When it rings, get up, wash your face and change rooms.',
    porque: 'Grief needs an outlet, not ownership of the whole day. Giving the pain an hour is the start of you running it, instead of obeying it.',
  }),
  'vocePrimeiro:26': Object.freeze({ // Dez minutos de faxina
    titulo: 'Ten minutes of tidying',
    acao: 'Set a ten-minute timer and tidy one single room at whatever pace comes: the dishes, the clothes on the floor, the rubbish out.',
    porque: 'The state of the house reflects and feeds the state inside. Ten minutes of order prove that something can get better today, right now.',
  }),
  'vocePrimeiro:27': Object.freeze({ // Fim de semana seu
    titulo: 'A weekend of your own',
    acao: 'Write two lines about a plan for next weekend that depends on you alone: the market, a film, a trail, a visit.',
    porque: 'An empty weekend is the ground where missing someone grows fastest. Your own plan takes that ground before the pain does.',
  }),
  'vocePrimeiro:28': Object.freeze({ // Uma linha por noite
    titulo: 'One line every night',
    acao: 'Before you sleep, write one line in a notebook: one thing you did today for yourself. Just one line, every night.',
    porque: 'On a bad day it feels like nothing moves — the notebook proves otherwise, line by line. A written record is ground to cross the hard days on.',
  }),
  'vocePrimeiro:29': Object.freeze({ // A carta que fica
    titulo: 'The letter that stays',
    acao: 'Take pen and paper and write for 5 minutes everything you would like to say to that person. Then fold the paper and put it in a drawer — unsent, unread again.',
    porque: 'What keeps circling in your head without coming out takes up room all day. On paper it gets a place of its own and stops asking for attention every hour.',
  }),
  'vocePrimeiro:30': Object.freeze({ // Choro com hora marcada
    titulo: 'Crying at a set hour',
    acao: 'Set a 5-minute timer, sit somewhere quiet and let whatever comes come — tears, anger, nothing. When it rings, wash your face and get on with the day.',
    porque: 'An emotion with reserved space tends to invade the rest of the day less. You feel what you need to feel — with a beginning, a middle and an end.',
  }),
  'vocePrimeiro:31': Object.freeze({ // A caixa do depois
    titulo: 'The box for later',
    acao: 'Pick one object that reminds you of that person and put it in a box or a drawer, out of your line of sight. Just one, without throwing anything away.',
    porque: 'You decide what your eyes run into by accident. Putting it away does not erase the story — it just gives you back the choice of when to revisit it.',
  }),
  'vocePrimeiro:32': Object.freeze({ // Pasta de fotos fora do caminho
    titulo: 'The photo folder out of the way',
    acao: 'Create an album on your phone called "later" and move the photos with that person into it. No deleting — just move them off the path of the thumb that scrolls the gallery.',
    porque: 'Running into a photo by accident hurts one way; opening it by choice hurts another. This gesture separates the two.',
  }),
  'vocePrimeiro:33': Object.freeze({ // A lista do que não faz falta
    titulo: 'The list of what you do not miss',
    acao: 'Write 3 things about that relationship you do NOT miss. Concrete details, no censoring. Keep the list to reread on the hard days.',
    porque: 'Longing edits memory and keeps only the best scenes. Writing down what bothered you gives back the whole portrait.',
  }),
  'vocePrimeiro:34': Object.freeze({ // Voz alta, porta fechada
    titulo: 'Out loud, door closed',
    acao: 'Close the bedroom door, put 3 minutes on the clock and say out loud what is hurting today. No audience, no filter.',
    porque: 'Hearing your own voice sorts out what thinking scrambles. Said out loud, the knot becomes more visible — and a visible knot comes undone more easily.',
  }),
  'vocePrimeiro:35': Object.freeze({ // Mapa da saudade
    titulo: 'The map of the longing',
    acao: 'Note in your phone the time and the place where the pain squeezed hardest today, and what you were doing. One line is enough.',
    porque: 'Mapped pain becomes a pattern. Knowing your hard hours lets you arrive at them with something planned, instead of caught off guard.',
  }),
  'vocePrimeiro:36': Object.freeze({ // Cinco coisas na sala
    titulo: 'Five things in the room',
    acao: 'Stop where you are and name quietly: 5 things you can see, 4 you can touch, 3 sounds you can hear, 2 smells, 1 taste.',
    porque: 'The senses only work in the present. Calling them in brings your attention out of the old film and back to the room you are in now.',
  }),
  'vocePrimeiro:37': Object.freeze({ // Pés no chão
    titulo: 'Feet on the floor',
    acao: 'Take off your shoes and walk around the house for 3 minutes paying attention only to the contact between foot and floor: temperature, texture, weight.',
    porque: 'A concrete sensation competes with a looping thought. Feet on the floor is literal — a physical reminder of where you are.',
  }),
  'vocePrimeiro:38': Object.freeze({ // Água fria nas mãos
    titulo: 'Cold water on your hands',
    acao: 'Turn on the tap and let cold water run over your hands and wrists for 2 minutes, paying attention only to the temperature.',
    porque: 'A strong, harmless sensation interrupts the autopilot. It is a pause button that exists at any sink.',
  }),
  'vocePrimeiro:39': Object.freeze({ // Objeto em detalhe
    titulo: 'One object in detail',
    acao: 'Pick up any object near you and describe it out loud for 2 minutes: weight, texture, temperature, marks of use.',
    porque: 'Describing demands full attention, and full attention does not share space with rumination. It is simple on purpose.',
  }),
  'vocePrimeiro:40': Object.freeze({ // Dez coisas que se movem
    titulo: 'Ten things that move',
    acao: 'Go to the window and count 10 things moving out there: a leaf, a car, people, a cloud. No rush.',
    porque: 'The world out there is still wide and still moving. Looking at it shrinks the room where the pain echoes, a little.',
  }),
  'vocePrimeiro:41': Object.freeze({ // Uma fruta, atenção inteira
    titulo: 'One fruit, your whole attention',
    acao: 'Eat a piece of fruit or a snack with no screen nearby, paying attention only to the taste and the texture, down to the last bite.',
    porque: 'Eating on autopilot is the default of hard days. Five minutes of presence in something simple show that presence is still possible.',
  }),
  'vocePrimeiro:42': Object.freeze({ // Três minutos de soltura
    titulo: 'Three minutes of letting go',
    acao: 'Stand up and slowly loosen your neck, shoulders and arms for 3 minutes, however your body asks for it. No technique, just movement.',
    porque: 'The body stores the weight of the day in places you never notice. Loosening a little changes the posture you cross the next hour in.',
  }),
  'vocePrimeiro:43': Object.freeze({ // Coração acelerado de propósito
    titulo: 'A racing heart on purpose',
    acao: 'Do 2 minutes of intense movement: jumping jacks, climbing stairs, dancing hard in the middle of the room. Stop when your breath gets short.',
    porque: 'A heart racing from effort is a sensation you chose and control — very different from the squeeze that arrives without asking. The body notices the difference in practice.',
  }),
  'vocePrimeiro:44': Object.freeze({ // Banho com atenção
    titulo: 'A shower with attention',
    acao: 'In your next shower, set aside 3 minutes to pay attention only to the water: temperature, sound, the point where it touches your skin.',
    porque: 'The shower is already in your routine — changing the attention inside it costs nothing and turns an automatic moment into a moment of yours.',
  }),
  'vocePrimeiro:45': Object.freeze({ // Mãos cuidadas
    titulo: 'Hands taken care of',
    acao: 'Put cream or oil on your hands, massaging each finger slowly, for 3 minutes, with your attention on the touch.',
    porque: 'Touch given with care is something you can give yourself right now, depending on nobody. Small, concrete and immediate.',
  }),
  'vocePrimeiro:46': Object.freeze({ // Escovar com a outra mão
    titulo: 'Brush with the other hand',
    acao: 'Brush your teeth with your non-dominant hand, start to finish, paying attention to how clumsy it feels.',
    porque: 'One tiny novelty forces full attention — and for 2 minutes the autopilot, which loves going back to the pain, has no room.',
  }),
  'vocePrimeiro:47': Object.freeze({ // Espelho, um minuto
    titulo: 'Mirror, one minute',
    acao: 'Stop in front of the mirror, look into your own eyes for 1 minute and say your name out loud once.',
    porque: 'At the end of a relationship it is easy to lose sight of yourself. That minute is only there to register it: someone is in there, and it is you.',
  }),
  'vocePrimeiro:48': Object.freeze({ // Um móvel fora do lugar
    titulo: 'One thing out of place',
    acao: 'Move one object or one small piece of furniture — the lamp, the chair, a picture. Pick a corner you look at every day.',
    porque: 'The old scenery keeps triggers in the details. One small shift marks, in physical space, that this house is still yours and changes with you.',
  }),
  'vocePrimeiro:49': Object.freeze({ // Bebida quente, duas mãos
    titulo: 'A hot drink, both hands',
    acao: 'Make a hot drink and drink it holding the mug with both hands, feeling the warmth to the end. Phone in another room.',
    porque: 'Warmth in your hands is comfort that needs no words. And making something for yourself is an act of care that is easy to repeat tomorrow.',
  }),
  'vocePrimeiro:50': Object.freeze({ // Alarme com nome de coisa boa
    titulo: 'An alarm named after something good',
    acao: 'Set an alarm for tomorrow named after something small and good: "coffee on the balcony", "5 minutes of sun". When it rings, do it.',
    porque: 'A new routine is built out of tiny commitments. A named alarm reminds you the day can hold things that are only yours.',
  }),
  'vocePrimeiro:51': Object.freeze({ // Três mínimos na geladeira
    titulo: 'Three tiny things on the fridge',
    acao: 'Write 3 tiny tasks for tomorrow on a piece of paper — the size of "wash the mug" — and stick it on the fridge.',
    porque: 'Crossing off small items gives visible proof of movement. In hard weeks, visible proof is worth more than an ambitious plan.',
  }),
  'vocePrimeiro:52': Object.freeze({ // Uma gaveta em ordem
    titulo: 'One drawer in order',
    acao: 'Pick ONE drawer or one corner of the desk and tidy it for 5 minutes, timer running. When it rings, stop.',
    porque: 'Order in a small space is progress your eyes confirm immediately — precisely at a moment when almost everything looks out of order.',
  }),
  'vocePrimeiro:53': Object.freeze({ // Ar novo em casa
    titulo: 'New air in the house',
    acao: 'Open the windows, let the air change over for 5 minutes and stand near one of them, breathing calmly.',
    porque: 'Fresh air in the room is a change the body notices before the mind does. And opening the house is the opposite of shutting down — in action, not in speech.',
  }),
  'vocePrimeiro:54': Object.freeze({ // Assunto que não é a dor
    titulo: 'A subject that is not the pain',
    acao: 'Message someone you trust asking how their day went — agreeing with yourself not to touch the subject of the breakup.',
    porque: 'There is a part of you that lives outside this pain. Pulling up an ordinary subject exercises that part and shows it is still there.',
  }),
  'vocePrimeiro:55': Object.freeze({ // Resgate em miniatura
    titulo: 'A rescue in miniature',
    acao: 'Remember something you used to do before the relationship and do the smallest possible version of it now: 5 pages of the book, a doodle, one bar of music on the instrument.',
    porque: 'Old interests are territory that was always yours. Visiting the miniature version reopens the door without demanding energy you may not have today.',
  }),
  'vocePrimeiro:56': Object.freeze({ // Uma foto do que está inteiro
    titulo: 'A photo of what is whole',
    acao: 'Walk around the space you are in and photograph ONE thing you find beautiful today: a light, a plant, a corner of the house.',
    porque: 'Looking for beauty trains the eye to register what is still standing. The photo stays as proof that you looked.',
  }),
  'vocePrimeiro:57': Object.freeze({ // Memória no álbum, não no bolso
    titulo: 'The memory in the album, not in your pocket',
    acao: 'Pick ONE good memory of that relationship and write it in 3 lines at most, like someone gluing a photo into an album. Close the notebook straight after.',
    porque: 'Honouring what was good is not living inside it. A memory kept by choice weighs differently from one that barges in unannounced.',
  }),

  /* ===== vontade (60) ===== */
  'vontade:0': Object.freeze({ // Perfume sem plateia
    titulo: 'Perfume with no audience',
    acao: 'Put on your favourite perfume right now, even if you are not leaving the house today. Use the one you save for a special occasion.',
    porque: 'Taking care of yourself with nobody watching trains the pleasure of being well on your own. That self-sufficiency is the base of any real attraction.',
  }),
  'vontade:1': Object.freeze({ // Três aprovações no espelho
    titulo: 'Three approvals in the mirror',
    acao: 'Stand in front of the mirror for two minutes, shoulders open. Find three things about your body you approve of today and say each one out loud.',
    porque: 'The way you look at yourself shows up in how you walk into a room. Approving of yourself out loud is practice, not vanity.',
  }),
  'vontade:2': Object.freeze({ // Roupa boa em dia comum
    titulo: 'Good clothes on an ordinary day',
    acao: 'Wear today that piece you keep \'for an occasion\'. The occasion is today, even if it is only a trip to the bakery.',
    porque: 'Saving the best for later teaches the body to live in waiting mode. Anyone who wants to win someone back needs to leave that mode with themselves first.',
  }),
  'vontade:3': Object.freeze({ // Foto para o próprio arquivo
    titulo: 'A photo for your own archive',
    acao: 'Find good light and take a photo of yourself, just for you. Repeat until you like one — and do not post it.',
    porque: 'Finding your own angle is knowledge about yourself, not display. The photo nobody sees takes off the pressure and leaves only what you learn.',
  }),
  'vontade:4': Object.freeze({ // Dez minutos de coluna
    titulo: 'Ten minutes of spine',
    acao: 'Set a ten-minute timer and keep your spine upright and your shoulders back while you do any task. When your body slumps, reset it without criticising yourself.',
    porque: 'Posture is the language that speaks before any word. Ten minutes a day teach the body a new pattern.',
  }),
  'vontade:5': Object.freeze({ // Uma música, porta fechada
    titulo: 'One song, door closed',
    acao: 'Close the door, pick a song that moves something in you and dance it start to finish. No right steps, no mirror: just the body answering the sound.',
    porque: 'Dancing with no audience gives the body back its right to enjoy moving. Physical presence is reborn from there.',
  }),
  'vontade:6': Object.freeze({ // Caminhada de queixo erguido
    titulo: 'A walk with your chin up',
    acao: 'Leave the house and walk ten minutes with your chin level with the ground. When you pass someone, hold their eyes for a second before you go on.',
    porque: 'Someone walking with their eyes on the ground communicates defeat. Holding the world\'s gaze is a muscle that gets stronger out on the street.',
  }),
  'vontade:7': Object.freeze({ // Banho de presença
    titulo: 'A shower of presence',
    acao: 'In today\'s shower, spend the first two minutes only feeling the water touch your skin, without thinking about the day\'s list. When your mind wanders off, come back to the water.',
    porque: 'Desire lives in the body, not in the head. Inhabiting your own skin again is the first step to waking up what had gone quiet.',
  }),
  'vontade:8': Object.freeze({ // Hidratante sem pressa
    titulo: 'Lotion, no rush',
    acao: 'After your shower, put lotion on your body at twice your usual slowness. Pay attention to the touch of your own hands.',
    porque: 'Touching your own body with care teaches that this skin deserves attention. Someone who treats themselves that way carries a different kind of presence.',
  }),
  'vontade:9': Object.freeze({ // Playlist que acorda
    titulo: 'A playlist that wakes you up',
    acao: 'Build a playlist with five songs that wake something in you: desire, courage, the urge to get ready. Play the first one now, at the volume the song asks for.',
    porque: 'Music is a direct shortcut to the state of the body. Having that shortcut at hand means you can wake your own appetite any day.',
  }),
  'vontade:10': Object.freeze({ // Marque o cuidado
    titulo: 'Book the care in',
    acao: 'Pick up the phone now and book an appointment to do your hair the way you like it. This week, not \'when there is time\'.',
    porque: 'Appearance out of pleasure is different from appearance out of obligation. Booking it turns an intention into a commitment to yourself.',
  }),
  'vontade:11': Object.freeze({ // Mesa posta para você
    titulo: 'The table set for you',
    acao: 'Make your next meal as if you were receiving someone important: a nice plate, a clean table, the phone far away. The guest is you.',
    porque: 'The way you serve yourself reveals the value you give yourself. Raising that standard at home changes how you show up in the world.',
  }),
  'vontade:12': Object.freeze({ // Três peças fora
    titulo: 'Three pieces out',
    acao: 'Open the wardrobe and set aside three pieces you wear without liking, out of habit or duty. Put them in the donation bag today.',
    porque: 'Clothes you merely tolerate communicate tolerance with yourself. Keeping only what you like is a daily filter of self-respect.',
  }),
  'vontade:13': Object.freeze({ // Um minuto de olhar
    titulo: 'One minute of looking',
    acao: 'In the mirror, hold your own gaze for a full minute, without looking away and without making faces. Breathe and just stay.',
    porque: 'Someone who cannot hold their own gaze will hardly hold another person\'s. That minute is presence training at its most basic.',
  }),
  'vontade:14': Object.freeze({ // Café fora, sem celular
    titulo: 'Coffee out, no phone',
    acao: 'Go to a bakery or a café, order something and take a table. Keep your phone put away for ten minutes and just watch the movement.',
    porque: 'Being in public in your own company, with no shield, is presence practice. The world notices someone who takes up their own place fully.',
  }),
  'vontade:15': Object.freeze({ // Memória de auge
    titulo: 'A memory of your best',
    acao: 'Write in three sentences a moment when you felt at your best: the clothes, the place, the sensation in your body. Keep the paper somewhere visible.',
    porque: 'Your best moment is not an invention: it already happened and it is yours. Revisiting that memory reminds the body of a state that already belongs to it.',
  }),
  'vontade:16': Object.freeze({ // Roupa de dormir digna
    titulo: 'Decent clothes to sleep in',
    acao: 'Set aside something you find nice to sleep in today and retire the usual worn-out piece. Wear the new choice tonight.',
    porque: 'The care nobody sees is the most honest kind. Ending the day with some care reinforces that the standard went up for you, not for other people.',
  }),
  'vontade:17': Object.freeze({ // Lençóis de recomeço
    titulo: 'Sheets for a fresh start',
    acao: 'Change the bedding today. Tonight, go to bed early and feel the clean fabric against your skin for a minute before you pick up your phone.',
    porque: 'Pleasure is relearned in small, concrete details. A good bed is a daily reminder that feeling good is allowed.',
  }),
  'vontade:18': Object.freeze({ // Alongamento de despertar
    titulo: 'A waking stretch',
    acao: 'When you wake up tomorrow, before the phone, stretch your body for three minutes: arms, spine, neck. Notice where the body thanks you.',
    porque: 'Starting the day inhabiting the body, not the screen, changes the posture of the hours that follow. Physical presence is built in the morning.',
  }),
  'vontade:19': Object.freeze({ // A própria voz
    titulo: 'Your own voice',
    acao: 'Record a one-minute audio reading a passage from something you like. Listen to it afterwards and note one thing you like about your voice.',
    porque: 'Voice is part of attraction and almost nobody listens to their own. Knowing what sounds good in you is a tool, not vanity.',
  }),
  'vontade:20': Object.freeze({ // Cheiro de casa viva
    titulo: 'The smell of a living house',
    acao: 'Open the windows and pick a smell for the house today: fresh coffee, a candle, a spice on the stove. Just one, chosen on purpose.',
    porque: 'Your surroundings repeat your story back to you every day. A house with a chosen smell says there is life in here.',
  }),
  'vontade:21': Object.freeze({ // Convite no calendário
    titulo: 'An invitation in the calendar',
    acao: 'Put a date for two in the calendar right now: you and you. Cinema, the market, a trail, a gig — write the day and the time as a firm commitment.',
    porque: 'Waiting for company in order to live hands over the wheel of your own life. Going out because you want to gives back command of your schedule and your appetite.',
  }),
  'vontade:22': Object.freeze({ // Elogio por escrito
    titulo: 'A compliment in writing',
    acao: 'Write three of your qualities that make your company good — concrete things, with an example. No modesty in this list.',
    porque: 'Winning someone back starts with knowing what you bring to the table. Someone who can list their own value talks differently.',
  }),
  'vontade:23': Object.freeze({ // Andar mais devagar
    titulo: 'Walk more slowly',
    acao: 'Next time you go out, slow your pace on purpose for five minutes. Feel the ground, look at the buildings, take up the space without rushing.',
    porque: 'Rushing communicates flight; calm communicates command. Walking like someone who has time changes the way the body presents itself.',
  }),
  'vontade:24': Object.freeze({ // Bebida de capricho
    titulo: 'A drink made with care',
    acao: 'Make yourself a drink with care: coffee brewed slowly, tea in the good cup, juice made fresh. Serve it in the best glass in the house and drink it with no screen nearby.',
    porque: 'Small daily luxuries teach that pleasure does not depend on a special date. Someone who serves themselves well learns to receive themselves well.',
  }),
  'vontade:25': Object.freeze({ // Peça que representa
    titulo: 'The piece that represents you',
    acao: 'Pick the piece in your wardrobe that looks most like who you are today and build an outfit around it for this week. Leave it all ready on the hanger.',
    porque: 'Dressing the present, not the past, lines up image and truth. That coherence shows from far away.',
  }),
  'vontade:26': Object.freeze({ // Gaveta íntima em ordem
    titulo: 'The underwear drawer in order',
    acao: 'Open the underwear drawer and throw out what is old or out of shape. Keep only what you like wearing.',
    porque: 'What nobody sees sets the tone for what everybody sees. Caring for the first layer is self-respect at the root.',
  }),
  'vontade:27': Object.freeze({ // Espelho antes de sair
    titulo: 'The mirror before you leave',
    acao: 'Before you go out today, stop at the mirror for thirty seconds and adjust one thing: the collar, your hair, your posture. Leave only after you approve of the image.',
    porque: 'That half minute is the difference between leaving on autopilot and leaving on purpose. Your own approval at the front door changes the rest of the day.',
  }),
  'vontade:28': Object.freeze({ // Corpo no sol
    titulo: 'The body in the sun',
    acao: 'Take your body out for ten minutes of sun and open air today, no headphones and no screen. Just you, the light and the street.',
    porque: 'Sun on the skin and street in the lungs take the body out of waiting mode. Presence starts in the physical.',
  }),
  'vontade:29': Object.freeze({ // Assinatura de presença
    titulo: 'A signature of presence',
    acao: 'Pick one detail to become your mark: the perfume, the ring, the good pen, the scarf. Wear it today and repeat tomorrow.',
    porque: 'One constant detail creates identity. Before anyone else notices, you are the one who starts recognising yourself in that detail.',
  }),
  'vontade:30': Object.freeze({ // O detalhe secreto
    titulo: 'The secret detail',
    acao: 'Wear one detail today that only you know is there: perfume in a hidden spot, the favourite piece under ordinary clothes.',
    porque: 'Carrying a sensory secret changes the way you occupy any room — and nobody needs to know why.',
  }),
  'vontade:31': Object.freeze({ // Dois minutos de espelho
    titulo: 'Two minutes of mirror',
    acao: 'Look into your own eyes in the mirror for 2 minutes, fixing nothing, looking away at nothing.',
    porque: 'Holding your own gaze is direct presence training; someone who can take their own eyes hesitates less in front of anyone else\'s.',
  }),
  'vontade:32': Object.freeze({ // A frase não enviada
    titulo: 'The sentence not sent',
    acao: 'When the urge to send a message squeezes, write the exact sentence on paper, fold it in four and put it in a jar.',
    porque: 'Desire written by hand loses its urgency without losing its warmth — and it stays yours, not the outbox\'s.',
  }),
  'vontade:33': Object.freeze({ // Jantar de louça boa
    titulo: 'Dinner on the good china',
    acao: 'Serve today\'s meal on the best china in the house, cutlery laid out, even with no company.',
    porque: 'The way you serve yourself tells you, before any audience, how much you are worth.',
  }),
  'vontade:34': Object.freeze({ // O gesto mais lento
    titulo: 'The slowest gesture',
    acao: 'Put cream on your own hands for 3 minutes, finger by finger, with no rush at all.',
    porque: 'Tenderness does not need to come from outside to be real; the body registers who treats it well.',
  }),
  'vontade:35': Object.freeze({ // Mapa do prazer
    titulo: 'The map of pleasure',
    acao: 'Write a list of 5 physical sensations you love: sun on your skin, the smell of rain, whatever is true for you.',
    porque: 'Nobody charms anyone without knowing their own map — and yours starts in you.',
  }),
  'vontade:36': Object.freeze({ // Voz em voz alta
    titulo: 'Voice out loud',
    acao: 'Pick a beautiful paragraph from any book and read it out loud, slowly, in a lower tone than usual.',
    porque: 'The voice is an instrument of presence, and an instrument gets tuned by being played.',
  }),
  'vontade:37': Object.freeze({ // A fruta com a mão
    titulo: 'Fruit eaten with your hands',
    acao: 'Eat a ripe piece of fruit with your hands, at the sink, no cutlery and no rush, paying attention to the smell and the texture.',
    porque: 'A small pleasure lived fully trains the body to be where it is — and presence is exactly that.',
  }),
  'vontade:38': Object.freeze({ // Rua em câmera lenta
    titulo: 'The street in slow motion',
    acao: 'Walk one block much more slowly than usual, shoulders open, looking above eye level.',
    porque: 'The rhythm of your step changes your inner state; a slowed-down body carries a different message — to you first.',
  }),
  'vontade:39': Object.freeze({ // Inventário de elogios
    titulo: 'An inventory of compliments',
    acao: 'Write 3 compliments you have received in your life that, deep down, you know are true.',
    porque: 'Remembering what is already yours keeps the charm going without depending on fresh approval.',
  }),
  'vontade:40': Object.freeze({ // Cenário do quarto
    titulo: 'The bedroom as a set',
    acao: 'Arrange the nightstand like a small stage set: for 5 minutes, leave only what is beautiful or useful there.',
    porque: 'The space where you sleep tells a story — and the pen is in your hand.',
  }),
  'vontade:41': Object.freeze({ // A palavra intraduzível
    titulo: 'The untranslatable word',
    acao: 'Look for a word in another language that names a kind of desire or of absence, and write it on paper along with the definition.',
    porque: 'The more vocabulary desire has, the less room it has left to turn into anxiety.',
  }),
  'vontade:42': Object.freeze({ // Vestir a noite
    titulo: 'Dress for the evening',
    acao: 'Change your clothes for dinner today, even staying home, as if the evening deserved it.',
    porque: 'Ritual marks value; your evening does not need an audience to be special.',
  }),
  'vontade:43': Object.freeze({ // Três linhas de toque
    titulo: 'Three lines about touch',
    acao: 'Write three lines about the kind of touch you most like to receive — without naming anyone.',
    porque: 'Naming your own taste is the first step of any conversation that is one day worth having.',
  }),
  'vontade:44': Object.freeze({ // Banho à luz de vela
    titulo: 'A shower by candlelight',
    acao: 'Take today\'s shower with the light off and one candle lit in a safe corner of the bathroom.',
    porque: 'Darkness and warmth give the body back to the senses — and desire lives in the senses.',
  }),
  'vontade:45': Object.freeze({ // O que não entra mais
    titulo: 'What does not get in any more',
    acao: 'Write 3 behaviours you no longer accept from anyone who comes close. Keep the list where only you can find it.',
    porque: 'Desire with standards is a different thing; someone who knows what they do not want talks differently.',
  }),
  'vontade:46': Object.freeze({ // Cinco ângulos
    titulo: 'Five angles',
    acao: 'Take five photos of yourself in different lights, just for you, and notice which light you like best. Delete the rest if you want.',
    porque: 'Knowing your own image disarms the fear of it.',
  }),
  'vontade:47': Object.freeze({ // Flor de uma haste
    titulo: 'A single-stem flower',
    acao: 'Buy or pick one single flower and put it in a glass where you spend most of your day.',
    porque: 'Beauty placed by you, for you, is a quiet statement about how you choose to live.',
  }),
  'vontade:48': Object.freeze({ // Sobremesa de colher pequena
    titulo: 'Dessert with a small spoon',
    acao: 'Eat a dessert with the smallest spoon in the house, slowly, eyes closed on the first spoonful.',
    porque: 'Stretching out pleasure is a skill — and skill gets practised on what is sweet.',
  }),
  'vontade:49': Object.freeze({ // Perfume para dormir
    titulo: 'Perfume for sleeping',
    acao: 'Before you lie down, put on your favourite perfume, even without going out, even with nobody there to smell it.',
    porque: 'Smell is memory; sleeping in your own favourite smell teaches that pleasure is also for you, not only for other people.',
  }),
  'vontade:50': Object.freeze({ // Espreguiçar por inteiro
    titulo: 'A full-body stretch',
    acao: 'When you get up from your chair today, stretch your whole body for a minute, sound and all. Repeat twice more during the day.',
    porque: 'A body that lets itself take up space at home takes up space outside too.',
  }),
  'vontade:51': Object.freeze({ // Bilhete no espelho
    titulo: 'A note on the mirror',
    acao: 'Write a short note to tomorrow\'s you and stick it on the mirror: one sentence from someone who treats the person they love well.',
    porque: 'You wake up before anyone else in your life — and the first voice of the day matters.',
  }),
  'vontade:52': Object.freeze({ // Assinatura de cheiro
    titulo: 'A signature smell',
    acao: 'Pick a smell for one room of the house — a candle, incense, freshly brewed coffee — and set it up now, calmly.',
    porque: 'A house with a sensory signature becomes a refuge, and desire grows better in someone who has somewhere to rest.',
  }),
  'vontade:53': Object.freeze({ // Janela e pele
    titulo: 'Window and skin',
    acao: 'Open the window and let the air or the sun touch your face for 5 minutes, eyes closed, doing nothing else.',
    porque: 'Woken skin is an antenna; presence starts at the surface of the body.',
  }),
  'vontade:54': Object.freeze({ // A apresentação de uma frase
    titulo: 'An introduction in one sentence',
    acao: 'Say out loud, to the mirror, who you are today — in one single sentence, without mentioning that person.',
    porque: 'Someone who can introduce themselves without explaining themselves carries a different posture for the rest of the day.',
  }),
  'vontade:55': Object.freeze({ // Gaveta íntima
    titulo: 'The private drawer',
    acao: 'Spend 10 minutes tidying the drawer of clothes nobody sees. Set aside to donate whatever no longer represents you.',
    porque: 'Care for what is invisible to other people is the most honest thermometer of your own worth.',
  }),
  'vontade:56': Object.freeze({ // O riso mapeado
    titulo: 'Laughter mapped',
    acao: 'Note 3 moments this year when you really laughed, with whom and at what.',
    porque: 'Remembering your own laughter relights the part of you that is good to have around.',
  }),
  'vontade:57': Object.freeze({ // Postura de parede
    titulo: 'Wall posture',
    acao: 'Rest your back, shoulders and head against the wall for 2 minutes, breathing slowly. Then walk away holding the shape you had there.',
    porque: 'An aligned body communicates before any word — including to you.',
  }),
  'vontade:58': Object.freeze({ // Beleza que ninguém viu
    titulo: 'The beauty nobody saw',
    acao: 'Go out to the street and photograph one beautiful thing you had never noticed before.',
    porque: 'Training your eye for beauty changes the subject you carry — and someone who notices the world has more to offer in a conversation.',
  }),
  'vontade:59': Object.freeze({ // Chá de ritual completo
    titulo: 'Tea as a full ritual',
    acao: 'Make tea paying attention to every stage: the water, the steam, the smell, the first cup. Eight minutes of only that.',
    porque: 'Doing one thing at a time, with the senses switched on, is the simplest way back to yourself.',
  }),

  /* ===== voz (57) ===== */
  'voz:0': Object.freeze({ // Escuta de dois minutos
    titulo: 'Two minutes of listening',
    acao: 'Pick someone you trust today and ask them to tell you something about their day. Listen for two minutes without interrupting and, at the end, sum up in your own words what you heard.',
    porque: 'Listening without trampling is the foundation of any hard conversation. Practising with someone easy prepares the ground for when the conversation matters more.',
  }),
  'voz:1': Object.freeze({ // Reescreva sem enviar
    titulo: 'Rewrite without sending',
    acao: 'Open an old message of yours from a moment of argument. Rewrite in a draft the version you would send today, calmly, and send nothing.',
    porque: 'Seeing your own message from outside shows what the heat hid at the time. Someone who recognises their own pattern can choose differently in the next conversation.',
  }),
  'voz:2': Object.freeze({ // Diga um não
    titulo: 'Say one no',
    acao: 'Turn down one small request today that you normally accept out of obligation. Say no politely, in one sentence, without piling up excuses.',
    porque: 'Someone who only says yes stacks up silence and resentment. One no said with respect trains the voice that was missing in important conversations.',
  }),
  'voz:3': Object.freeze({ // Elogio específico
    titulo: 'A specific compliment',
    acao: 'Compliment someone in your day for something concrete they did, not for something generic. Swap \'you are great\' for \'I liked how you handled that\'.',
    porque: 'A vague compliment runs off; a concrete one sticks. Noticing details in other people trains the eye every relationship asks for.',
  }),
  'voz:4': Object.freeze({ // Três segundos de pausa
    titulo: 'Three seconds of pause',
    acao: 'In every conversation today, take one breath before you answer. Count three seconds in silence and only then speak.',
    porque: 'The pause separates a reaction from a response. That small space changes the tone of an entire conversation.',
  }),
  'voz:5': Object.freeze({ // Pergunta que abre
    titulo: 'A question that opens',
    acao: 'Ask someone today a question that cannot be answered with yes or no. Then stay quiet and let the answer come out whole.',
    porque: 'An open question invites; a closed one ends things. Mastering that difference changes the quality of any conversation.',
  }),
  'voz:6': Object.freeze({ // Ouça a discordância
    titulo: 'Listen to the disagreement',
    acao: 'Ask someone their opinion on a subject the two of you disagree about. Just listen to the end, without arguing back, and thank them.',
    porque: 'Listening without arguing back is rare, and it disarms people. Practising it on neutral ground strengthens the same muscle a delicate conversation demands.',
  }),
  'voz:7': Object.freeze({ // Grave a própria voz
    titulo: 'Record your own voice',
    acao: 'Record a one-minute audio telling how your day went. Listen to it afterwards and note one thing about your tone you liked and one you want to adjust.',
    porque: 'Nobody hears their own tone in the moment of speaking. Hearing it from outside reveals what reaches the ear on the other side.',
  }),
  'voz:8': Object.freeze({ // Da queixa ao pedido
    titulo: 'From complaint to request',
    acao: 'Take a complaint of yours that starts with \'you never\' or \'you always\'. Rewrite it on paper as a request that starts with \'I need\' or \'I would like\'.',
    porque: 'A complaint points a finger; a request opens a door. Changing the form changes what the other person is able to hear.',
  }),
  'voz:9': Object.freeze({ // Corte o 'mas'
    titulo: 'Cut the \'but\'',
    acao: 'Pick an old message of yours and rewrite it without using the word \'but\'. Read both versions out loud and notice the difference.',
    porque: 'The \'but\' erases everything that came before it. Noticing that on paper sharpens what comes out of your mouth.',
  }),
  'voz:10': Object.freeze({ // Nomeie o sentimento
    titulo: 'Name the feeling',
    acao: 'Write three sentences starting with \'I feel\' about your week. No justifying, no blaming, only naming.',
    porque: 'A feeling without a name turns into a loaded tone of voice. Someone who names what they feel speaks with more clarity and fewer barbs.',
  }),
  'voz:11': Object.freeze({ // Conversa sem tela
    titulo: 'A conversation with no screen',
    acao: 'In one face-to-face conversation today, leave your phone out of reach and keep your eyes on whoever is talking. Hold it to the end.',
    porque: 'Whole attention is the most concrete compliment there is. When someone notices they have your full attention, the conversation changes level.',
  }),
  'voz:12': Object.freeze({ // Repita com suas palavras
    titulo: 'Say it back in your words',
    acao: 'In one conversation today, before giving your opinion, sum up what the other person said: \'let me see if I got it\'. Only then answer.',
    porque: 'Summing up shows you really listened. It is one of the simplest and rarest tools in a conversation.',
  }),
  'voz:13': Object.freeze({ // Deixe o silêncio
    titulo: 'Leave the silence',
    acao: 'In one conversation today, when a pause shows up, do not rush to fill it. Count to ten in silence and watch what happens.',
    porque: 'Comfortable silence is a sign of presence, not of emptiness. Someone who can take the pause gives the other person room to go deeper.',
  }),
  'voz:14': Object.freeze({ // Peça um espelho
    titulo: 'Ask for a mirror',
    acao: 'Ask someone you trust: \'what is it like to talk to me?\'. Listen to the whole answer without defending yourself, and thank them.',
    porque: 'Nobody can see their own way of talking. An honest mirror from outside is worth more than any guess.',
  }),
  'voz:15': Object.freeze({ // Mapa dos gatilhos
    titulo: 'The map of the triggers',
    acao: 'Write three sentences that usually set you off in an argument. Next to each one, write a possible answer said calmly.',
    porque: 'A known trigger loses force. Someone who rehearses the calm answer beforehand does not depend on improvising in the heat.',
  }),
  'voz:16': Object.freeze({ // Desculpa sem 'mas'
    titulo: 'An apology with no \'but\'',
    acao: 'Write in a draft a three-sentence apology for something real, without using \'but\' and without justifying yourself. Do not send it; just keep it.',
    porque: 'An apology with a justification asks for a receipt. Writing the clean version teaches how owning it for real sounds.',
  }),
  'voz:17': Object.freeze({ // Agradeça pelo nome
    titulo: 'Thank someone by name',
    acao: 'Thank someone who served you today — at the till, at the counter, at the front desk — looking them in the eye and using their name, if you know it.',
    porque: 'Directed kindness trains presence in the small interactions. Someone who practises in daily life carries it into the conversations that weigh.',
  }),
  'voz:18': Object.freeze({ // Leia como quem recebe
    titulo: 'Read it as the receiver',
    acao: 'Reread an old conversation with that person and read your own messages out loud, as if you were receiving each one.',
    porque: 'Reading from the other side of the screen shows the tone that went unnoticed when you sent it. That discomfort teaches more than any advice.',
  }),
  'voz:19': Object.freeze({ // Peça sem rodeio
    titulo: 'Ask straight out',
    acao: 'Ask someone for something directly today, in one sentence, no hints and no roundabout \'maybe somebody could\'. Notice how clarity lands.',
    porque: 'A clear request respects both the listener and the speaker. A hint stacks up frustration on both sides.',
  }),
  'voz:20': Object.freeze({ // Releia antes de responder
    titulo: 'Reread before you answer',
    acao: 'If a message from that person arrives today, read it twice before you type. Answer short, calmly, only what was asked.',
    porque: 'A rushed answer carries the wrong tone easily. Calm in the answer shows the change without having to announce a change.',
  }),
  'voz:21': Object.freeze({ // Pergunta leve e aberta
    titulo: 'A light, open question',
    acao: 'Send that person an open question about an interest of theirs — the show, the team, the project. One question only, with no demand and nothing tacked on.',
    porque: 'A light question opens the channel without pressing. Genuine interest in someone\'s world speaks louder than any speech.',
  }),
  'voz:22': Object.freeze({ // Dois minutos sem interromper
    titulo: 'Two minutes without interrupting',
    acao: 'If the two of you talk today, let that person speak for two whole minutes without cutting in. At the end, sum up in your own words what you heard.',
    porque: 'Whole listening is rare and whoever receives it notices immediately. The summary shows you were present, not just quiet.',
  }),
  'voz:23': Object.freeze({ // Agradecimento concreto
    titulo: 'A concrete thank you',
    acao: 'Thank that person for something concrete and recent, in one single sentence. Send it and add nothing more.',
    porque: 'Punctual gratitude asks for no answer and reopens no past. It is a small gesture that shows attention to the present.',
  }),
  'voz:24': Object.freeze({ // Zero ironia hoje
    titulo: 'Zero irony today',
    acao: 'When you talk to that person today, check every message before you send it and cut any irony or hint. If a barb is left, rewrite it.',
    porque: 'Irony is a fight dressed as a joke. Taking the barb out of the sentence takes the poison out of the conversation.',
  }),
  'voz:25': Object.freeze({ // Valide antes de opinar
    titulo: 'Validate before you opine',
    acao: 'In your next conversation with that person, when something makes sense, say so before giving your view: \'I understand what you mean\'. Only then add the rest.',
    porque: 'Validating first lowers the guard in any conversation. An opinion that arrives after the listening meets a different ear.',
  }),
  'voz:26': Object.freeze({ // Compartilhe algo leve
    titulo: 'Share something light',
    acao: 'Send that person something light tied to a shared taste — a video, a photo, a piece of news. No question attached, no answer expected.',
    porque: 'A light gesture with no demand recalls the good parts of the connection. The absence of expectation is what makes the gesture safe.',
  }),
  'voz:27': Object.freeze({ // Deixa eu ver se entendi
    titulo: 'Let me see if I got it',
    acao: 'If that person vents or explains something today, answer starting with \'let me see if I got it\' and sum it up before any opinion.',
    porque: 'A good summary is visible listening. Few things change the weather of a conversation as much as noticing the message arrived whole.',
  }),
  'voz:28': Object.freeze({ // Encerre no ponto bom
    titulo: 'Close on the good note',
    acao: 'If the conversation with that person is light today, close it while it is good. Say goodbye in one simple sentence and do not stretch it.',
    porque: 'A conversation that ends well leaves the wish for another. Stretching it until it sours undoes what the lightness built.',
  }),
  'voz:29': Object.freeze({ // Responda no seu tempo
    titulo: 'Answer in your own time',
    acao: 'If a message from that person stirs something in you today, do not answer in the heat. Wait for it to cool, reread and answer when calm comes back — still today, if you can.',
    porque: 'A message written in anger becomes evidence against the conversation. Answering in peace protects the open channel that still exists.',
  }),
  'voz:30': Object.freeze({ // O eco da própria voz
    titulo: 'The echo of your own voice',
    acao: 'Record a 2-minute audio talking about how you feel today. Then listen back paying attention only to the tone, not to the words.',
    porque: 'The tone that reaches the listener\'s ear is almost never the one you imagine while speaking. Hearing the recording shows that difference in practice.',
  }),
  'voz:31': Object.freeze({ // Rascunho sem enviar
    titulo: 'A draft not sent',
    acao: 'Write the message you would like to send that person, with everything you want to say. Save it as a draft or write it on paper. Do not send it.',
    porque: 'Putting it into words sorts out what is tangled inside — and deciding later, with a cool head, is different from deciding on impulse.',
  }),
  'voz:32': Object.freeze({ // Contagem de perguntas
    titulo: 'A count of questions',
    acao: 'Reread the last conversations you had with that person (old messages will do). Count: how many questions you asked and how many statements you made.',
    porque: 'Asking and stating create different conversations. Seeing the ratio in black and white shows which of the two you have been feeding.',
  }),
  'voz:33': Object.freeze({ // Cinco sons
    titulo: 'Five sounds',
    acao: 'Stay 3 minutes in silence, eyes closed, and identify 5 different sounds around you. Write down all five.',
    porque: 'Listening is trainable attention — and it is easier to start the training with sounds than with people.',
  }),
  'voz:34': Object.freeze({ // Reescrita gentil
    titulo: 'A kinder rewrite',
    acao: 'Remember a sentence you said recently in a harder tone than you meant. Write the original sentence and, underneath, a version that says the same thing with more care.',
    porque: 'Almost every hard sentence has a kind version carrying the same truth. Practising that translation on paper makes it easier when it is time to speak.',
  }),
  'voz:35': Object.freeze({ // Dois minutos sem 'mas'
    titulo: 'Two minutes without \'but\'',
    acao: 'Set a 2-minute timer and talk out loud about any subject without using the word \'but\'. If it slips out, start again.',
    porque: 'The \'but\' erases everything that came before it. Noticing how often it slips out shows how much it runs your way of speaking.',
  }),
  'voz:36': Object.freeze({ // Carta de um parágrafo
    titulo: 'A letter of one paragraph',
    acao: 'Write by hand, on paper, one paragraph telling that person what you never said out loud. Fold the paper and keep it — it is yours alone.',
    porque: 'Writing by hand is slower than typing, and the slowness forces you to choose every word. Choosing words is the training of the voice itself.',
  }),
  'voz:37': Object.freeze({ // Ensaio no espelho
    titulo: 'A rehearsal in the mirror',
    acao: 'Stand in front of the mirror and say out loud, for 2 minutes, something you need to say to someone. Repeat it until the voice comes out steady.',
    porque: 'Words said for the first time tend to come out crooked. Rehearsing takes the weight out of the premiere.',
  }),
  'voz:38': Object.freeze({ // Resposta com cabeça fria
    titulo: 'An answer with a cool head',
    acao: 'Find an old message that annoyed you at the time. Reread it now and write the answer you would give today, calmly. You do not have to send it.',
    porque: 'Comparing the hot reaction with the cool answer shows, in practice, what the pause does to your words.',
  }),
  'voz:39': Object.freeze({ // Mapa da defensiva
    titulo: 'The map of your defences',
    acao: 'Write down the 3 sentences you use most when you are being defensive (things like \'I never said that\' or \'you always do this\'). Just list them, no judging.',
    porque: 'A defensive sentence said on autopilot is hard to hold back. Knowing yours in advance gives you one extra second to pick another.',
  }),
  'voz:40': Object.freeze({ // Cinco não-ditos
    titulo: 'Five things unsaid',
    acao: 'List 5 things you feel and have never said out loud to anyone. The list is yours, nobody needs to see it.',
    porque: 'Naming what we feel is the first step to being able to talk about it. What has no name has no way out of the mouth.',
  }),
  'voz:41': Object.freeze({ // Áudio descartável
    titulo: 'A throwaway recording',
    acao: 'Record an audio saying the hardest thing you would have to say to that person. Listen to it once. Then delete it.',
    porque: 'Saying it out loud, even with nobody listening, is different from only thinking it. The body registers that this is sayable.',
  }),
  'voz:42': Object.freeze({ // Cinco minutos de ouvido
    titulo: 'Five minutes of ear',
    acao: 'Call someone you trust (it does not have to be the person you love) and spend 5 minutes only listening and asking questions. No telling your own news.',
    porque: 'Holding back the urge to talk about yourself is the hardest exercise in listening — and a call with someone you trust is a good training ground.',
  }),
  'voz:43': Object.freeze({ // A resposta que ficou
    titulo: 'The answer that stayed behind',
    acao: 'Remember a conversation you walked away from thinking \'I should have said something else\'. Write now the answer you would have liked to give.',
    porque: 'The answer that arrives late still counts: it reveals what you value and widens the repertoire for the next conversation.',
  }),
  'voz:44': Object.freeze({ // Manual de instruções
    titulo: 'An instruction manual',
    acao: 'Write 3 sentences starting with \'it works better with me when...\' about how you prefer to be spoken to (tone, timing, manner).',
    porque: 'It is hard to ask for what we never put into words. Knowing your own manual is what makes it possible, one day, to hand it to someone.',
  }),
  'voz:45': Object.freeze({ // Leitura em voz alta
    titulo: 'Reading out loud',
    acao: 'Before you send your next important message, read the text out loud once. If it sounds different from what you meant, adjust it.',
    porque: 'Text read out loud reveals the tone that arrives on the other side — something the eyes, reading in silence, do not catch.',
  }),
  'voz:46': Object.freeze({ // O sentimento por trás da história
    titulo: 'The feeling behind the story',
    acao: 'Watch or listen to 2 minutes of someone telling a story (any video will do). Then sum up in one sentence what that person felt — not what happened.',
    porque: 'Hearing facts is easy; hearing feelings is what creates the sense of being really listened to. Practising with strangers keeps the exercise light.',
  }),
  'voz:47': Object.freeze({ // Como foi?
    titulo: 'How was it?',
    acao: 'Ask that person a question starting with \'how was...\' (the day, the week, that appointment). Then only listen, without tacking on your own story.',
    porque: 'An open question invites the person to go on; listening without interrupting shows the invitation was real.',
  }),
  'voz:48': Object.freeze({ // A segunda pergunta
    titulo: 'The second question',
    acao: 'When that person tells you anything today, ask a second question about what you just heard, instead of changing the subject.',
    porque: 'The first question is manners; the second one is interest. That is where the conversation gains depth.',
  }),
  'voz:49': Object.freeze({ // Mensagem que termina em pergunta
    titulo: 'A message that ends in a question',
    acao: 'Send that person a message that ends with an open question — something that cannot be answered with yes or no.',
    porque: 'A message ending in a statement closes; one ending in a question passes the baton. The structure changes where the conversation goes.',
  }),
  'voz:50': Object.freeze({ // Reler antes de responder
    titulo: 'Reread before responding',
    acao: 'With the next message that person sends, reread it twice before you answer. On the second reading, look for what the message is asking for — not only what it says.',
    porque: 'A lot of misunderstanding is born from answering the first reading. The second one usually finds something else.',
  }),
  'voz:51': Object.freeze({ // Com as minhas palavras
    titulo: 'In my own words',
    acao: 'In a conversation today, repeat in your own words something that person said: \'let me see if I got it...\'. Then ask if that was it.',
    porque: 'Summing up what you heard is the most direct way to show presence — and to find out on the spot if you got it crooked.',
  }),
  'voz:52': Object.freeze({ // O assunto favorito
    titulo: 'The favourite subject',
    acao: 'Bring up a subject that person loves and that you do not normally bring up. Ask at least two questions about it.',
    porque: 'Taking an interest in someone\'s world is a form of care that needs no beautiful words — only real curiosity.',
  }),
  'voz:53': Object.freeze({ // Elogio ao que foi dito
    titulo: 'A compliment to what was said',
    acao: 'Compliment something that person SAID today — an idea, a sentence, a way of telling it. Not their looks, not something they did: something they said.',
    porque: 'Complimenting what someone says means \'I listen to you\'. It is a rare kind of recognition — most compliments ignore the voice.',
  }),
  'voz:54': Object.freeze({ // Três segundos
    titulo: 'Three seconds',
    acao: 'In a conversation with that person today, wait three full seconds after they finish speaking, before you answer. Do it at least twice.',
    porque: 'The short silence opens room to finish what was left half said — and a lot of the important part comes exactly in that addition.',
  }),
  'voz:55': Object.freeze({ // Entendi, e...
    titulo: 'I understand, and...',
    acao: 'When you disagree with something that person says today, start your answer with \'I understand your point\' before giving yours. It counts in writing or out loud.',
    porque: 'Acknowledging before disagreeing separates the person from the opinion. The conversation stays about the subject, not about who wins.',
  }),
  'voz:56': Object.freeze({ // O manual dessa pessoa
    titulo: 'That person\'s manual',
    acao: 'Ask that person, in a calm moment: \'how would you rather I talk to you when we disagree?\'. Just listen and thank them for the answer.',
    porque: 'Every person has their own way of receiving a hard conversation. Asking for the manual, instead of guessing it, is listening in its most practical form.',
  }),
  /* ================ fim do LOTE 1 ======================= */
});

export default MISSOES_EN;
