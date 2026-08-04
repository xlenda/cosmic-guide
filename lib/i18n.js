// lib/i18n.js
// Dicionário de tradução PT/ES/EN — cobre as telas do app inteiro (Home, Quiz,
// Onboarding, Login, Horóscopo, Mapa Astral, Agir, Descobrir, Reconectar, Linha
// do tempo, Diário, Assinatura, Loja, Tokens, Perfil e os componentes
// compartilhados). Ver context/LanguageContext.js pra detecção/persistência do
// idioma.
//
// NÃO cobre ainda, e os dois são gap CONHECIDO, não esquecimento — ficam em
// português mesmo com o app em "es"/"en", até uma próxima fase traduzir:
//   1. os textos de conteúdo astrológico gerados por lib/signs.js
//      (compatibility(), MOON_NEED, etc.);
//   2. BRINDE_CONTEUDO em lib/brindes.js — o corpo entregue ao abrir um brinde
//      (título e seções do Guia do Ritual, da Tiragem da Lua Interior e dos
//      wallpapers). Os CARDS da Loja já são traduzidos aqui
//      (loja.brinde.<id>.title/.description); o que ainda não é são as seções
//      de dentro.
//
// Uso: t('home.greetingCouple', { voce, amor }) — {chave} dentro do template
// vira interpolação simples via replace. Plural NÃO é resolvido aqui: quem
// chama escolhe a chave (…_one / …_other), como em HomeScreen.js e
// TimelineScreen.js — o dicionário só guarda as duas formas.
//
// Chaves montadas em runtime (t(`diary.month.${n}`), t(`planos.benefit.${n}`),
// t(`horoscope.reading.${tab}.${n}`), as trilhas de Reconectar, as perguntas de
// Descobrir…) precisam da família INTEIRA definida aqui — o teste estático
// test/i18nKeysExist.test.js não enxerga essas, então elas se conferem à mão.
//
// Exceção proposital: planos.plan.trial.badge não existe — o Mensal não tem
// selo, e PlanosScreen.js checa `badge !== chave` pra decidir se mostra.

export const LANGUAGES = ['pt', 'es', 'en'];
export const DEFAULT_LANGUAGE = 'pt';

const PT = {
  // Onboarding — a escolha "só eu / eu e meu par", 1ª tela de quem chega pelo link
  // A tela estava FORA DE FASE, não fraca: a pessoa clicou num link que
  // prometeu horóscopo e tarô, e a primeira coisa que o app fazia era uma
  // pergunta administrativa ("escolha um caminho"). 118 de 128 sessões chegam
  // aqui e 22 concluem. O título agora dá NOTÍCIA — nove leituras, quando o
  // mercado promete três — e mata o custo na mesma linha. Os dois números são
  // verificados no código: 9 features com OneTimeLock, e o onboarding não pede
  // cartão em nenhum passo. "Só eu" virou "Pra mim" porque "só" subtrai, e ele
  // ficava ao lado de "Eu e meu par", que soma.
  'onboarding.headerTitle': 'Nove leituras.\nA primeira de cada, grátis.',
  'onboarding.headerSub': 'Horóscopo, mapa astral, tarô, sonhos, palma da mão, borra de café e mais. Sem cartão pra começar.',
  'onboarding.solo.title': 'Pra mim',
  'onboarding.solo.desc': 'O céu de hoje, seu mapa de nascimento, as cartas, o que a sua mão e os seus sonhos contam. A primeira leitura de cada uma é sua.',
  'onboarding.couple.title': 'Eu e meu par',
  'onboarding.couple.desc': 'Descubram juntos a energia e a compatibilidade de vocês.',
  'onboarding.cta': 'Começar',
  'onboarding.back': 'Voltar',
  'onboarding.pickerTitle': 'Qual é o seu signo?',
  'onboarding.saveError': 'Não foi possível salvar seu signo. Tente novamente.',

  // Login e criação de conta
  'login.mode.signIn': 'Entrar',
  'login.mode.signUp': 'Criar conta',
  'login.emailLabel': 'E-mail',
  'login.emailPlaceholder': 'seuemail@exemplo.com',
  'login.passwordLabel': 'Senha',
  'login.showPassword': 'Mostrar senha',
  'login.hidePassword': 'Esconder senha',
  'login.errorEmptyFields': 'Preencha e-mail e senha.',
  'login.infoConfirmEmail': 'Conta criada! Confira seu e-mail para confirmar antes de entrar.',
  'login.divider': 'ou',
  'login.google': 'Continuar com Google',
  'login.switchToSignUp': 'Não tem conta? Criar uma',
  'login.switchToSignIn': 'Já tem conta? Entrar',
  'login.checkoutSubtitle': 'O plano que você escolheu está guardado — entre ou crie sua conta pra continuar.',

  // Home
  'home.greetingCouple': 'Olá, {voce} & {amor}',
  'home.greetingSolo': 'Olá, {sign}',
  // 'home.compatPercent' NÃO mora mais aqui: o valor vivo é o do bloco
  // SINASTRIA_I18N no fim do arquivo ('{aspecto} · {categoria}'). O literal
  // antigo ('{pct}% de compatibilidade') foi APAGADO em 31/07/2026 e não só
  // sobrescrito — enquanto ele existia aqui, continuava sendo publicado no
  // bundle e era a primeira coisa que alguém copiaria ao criar uma tela nova.
  // O app não tem porcentagem de compatibilidade; o dicionário também não.
  'home.compatSeeMore': 'Ver compatibilidade completa',
  'home.compatTitleEmpty': 'Compatibilidade do casal',
  'home.compatSubtitleEmpty': 'Ainda não calculada',
  'home.compatTextEmpty': 'Convide seu par para descobrir a compatibilidade entre os signos de vocês e acompanhar a sequência diária.',
  'home.compatLinkEmpty': 'Convidar meu par',
  'home.lovePhrase.label': 'Frase do dia pra compartilhar',
  'home.lovePhrase.share': 'Compartilhar',
  'home.thought.label': 'Pensamento cósmico do dia',
  'home.thought.unread': '✨ Leia o de hoje',
  'home.thought.readToday': '✓ Lido hoje',
  'home.thought.expand': 'Ler completo ↓',
  'home.thought.collapse': 'Recolher ↑',
  'home.notifPrompt.title': 'Quer o pensamento cósmico todo dia?',
  'home.notifPrompt.text': 'Uma notificação por dia, com o céu do dia pro seu signo. Sem spam.',
  'home.notifPrompt.cta': 'Ativar',
  'home.notifPrompt.later': 'Agora não',
  'home.sectionExplore': 'Explore o cosmos',
  'home.sectionExploreSubtitle': 'Sozinho ou em casal — assine e use sem limite',
  // Subdivisão do grid individual (ver screens/HomeScreen.js) — quinze cards
  // chapados num bloco só era o "fica perdido no meio" do dono aplicado ao grid.
  'home.sectionPraticas': 'Práticas',
  'home.sectionPraticasSubtitle': 'Coisas que se fazem com a mão, o corpo e o tempo marcado',
  'home.sectionDatas': 'Datas do céu',
  'home.sectionDatasSubtitle': 'O que o céu faz este mês, com dia e hora',
  'home.sectionCuriosidades': 'Curiosidades',
  'home.sectionCuriosidadesSubtitle': 'História com fonte e coisas feitas pra compartilhar',
  'home.sectionCouple': 'Recursos de casal',
  'home.sectionCoupleSubtitle': 'Só desbloqueiam formando um casal no app',
  'home.sectionCosmicEvent': 'Evento cósmico',
  'home.cosmicEventTitle': '{planetA} em {aspect} com {planetB}',
  'home.cosmicEventTitleEmpty': 'Céu calmo hoje — nenhuma conversa forte entre planetas',
  'home.cosmicEventDesc': 'Dois planetas estão conversando no céu de hoje — é isso que a astrologia chama de aspecto. E é real: calculado pela posição exata dos planetas, a {orb}° do ângulo exato (o "orbe").',
  'home.cosmicEventDescEmpty': 'Nenhum par de planetas conversando de perto agora. No termo técnico: os planetas clássicos estão sem aspectos maiores (os cinco ângulos principais) em orbe estreito (pertinho do ângulo exato) no céu de hoje.',
  'home.cosmicEventDate': 'Hoje · {date}',
  'home.card.horoscope.title': 'Horóscopo',
  'home.card.horoscope.subtitle': 'Previsão diária',
  'home.card.birthchart.title': 'Mapa Astral',
  'home.card.birthchart.subtitle': 'Sol, Lua e Ascendente',
  'home.card.tarot.title': 'Tarô por Tema',
  'home.card.tarot.subtitle': 'Passado · Futuro',
  'home.card.compatibility.title': 'Compatibilidade',
  'home.card.compatibility.subtitle': 'Match celestial',
  'home.card.timeline.title': 'Linha do Tempo',
  'home.card.timeline.subtitle': 'Memórias do casal',
  'home.card.reconectar.title': 'Reconectar',
  'home.card.reconectar.subtitle': 'Fortaleça o vínculo',
  'home.card.descobrir.title': 'Descobrir',
  'home.card.descobrir.subtitle': 'Conheçam-se mais',
  'home.card.agir.title': 'Agir',
  'home.card.agir.subtitle': 'Pequenos gestos',
  'home.card.progresso.title': 'Progresso',
  'home.card.progresso.subtitle': 'Sequência e conquistas',
  'home.card.retrospectiva.title': 'Retrospectiva',
  'home.card.retrospectiva.subtitle': 'O ano de vocês',
  'home.card.dream.title': 'Sonhos',
  'home.card.dream.subtitle': 'Interprete já',
  'home.card.lunarCalendar.title': 'Calendário Lunar',
  'home.card.lunarCalendar.subtitle': 'Fase da Lua hoje',
  'home.card.palm.title': 'Leitura de Palma',
  'home.card.palm.subtitle': 'Sua mão revela',
  'home.card.coffee.title': 'Ritual do Café',
  'home.card.coffee.subtitle': 'Borra mística',
  'home.card.chat.title': 'Chat Espiritual',
  'home.card.chat.subtitle': 'Conselho rápido',
  'home.card.diary.title': 'Diário Cósmico',
  'home.card.diary.subtitle': 'Suas leituras guardadas',
  'home.card.social.title': 'Feed Social',
  'home.card.social.subtitle': 'Outros leitores',
  'home.milestone.title': '{days} dias seguidos!',
  'home.milestone.bonus': '+{tokens} tokens de bônus',
  'home.milestone.offer': 'Comemorar com 7 dias grátis de assinatura →',
  'home.milestone.continue': 'Continuar',
  'home.streak.count_one': '🔥 {count} dia seguido',
  'home.streak.count_other': '🔥 {count} dias seguidos',
  'home.streak.empty': 'Comece sua sequência hoje',
  'home.goal.label': 'Meta da semana',
  'home.goal.done': 'Cumprida: ',
  'home.goal.empty': 'Vocês ainda não definiram uma meta pra essa semana',
  'home.wrapped.title': 'Sua Retrospectiva Cósmica chegou',
  'home.wrapped.subtitle': 'O resumo do seu mês — pra ver e compartilhar',
  'home.sky.label': 'Céu de hoje pra você',
  'home.sky.inviteText': 'Informe sua data de nascimento no Mapa Astral e veja, todo dia, como o céu de hoje toca o SEU mapa — não o de todo mundo.',
  'home.sky.inviteCta': 'Preencher meu Mapa Astral →',
  'home.sky.moreAspects': '+{count} aspecto(s) (conversas de planetas) no seu céu hoje — assine pra ver →',
  'home.hero.streak.count_one': '{count} dia seguido',
  'home.hero.streak.count_other': '{count} dias seguidos',
  'home.hero.streak.empty': '✨ Comecem hoje a sequência de vocês',
  'home.notifPrompt.errorTitle': 'Não foi possível ativar',
  'home.notifPrompt.errorHint': 'Depois de resolver, ative em Perfil > Pensamento cósmico diário.',
  'home.week.mon': 'S',
  'home.week.tue': 'T',
  'home.week.wed': 'Q',
  'home.week.thu': 'Q',
  'home.week.fri': 'S',
  'home.week.sat': 'S',
  'home.week.sun': 'D',

  // Quiz do casal
  'quiz.headerTitle': 'Quiz do Casal',
  'quiz.headerSubtitle': 'Passo {step} de {total} · {stepName}',
  'quiz.step.voces': 'Vocês',
  'quiz.step.signoNascimento': 'Signo e Nascimento',
  'quiz.step.energia': 'Energia',
  'quiz.step.cartas': 'Cartas',
  'quiz.step.astros': 'Astros',
  'quiz.hero.eyebrow': 'Astrologia do casal',
  'quiz.hero.title': 'Trio Cósmico do Casal',
  'quiz.hero.gold': 'em construção',
  'quiz.hero.sub': 'Sol + Ascendente + Lua. Cartas. Compatibilidade do casal. O mapa cósmico de vocês, completo.',
  'quiz.names.title': 'Como vocês se chamam?',
  'quiz.names.yourName': 'Seu nome',
  'quiz.names.yourNamePlaceholder': 'Ex.: Ana',
  'quiz.names.partnerName': 'Nome do seu amor',
  'quiz.names.partnerNamePlaceholder': 'Ex.: Léo',
  'quiz.energy.title': '{voce} e {amor}: qual é a energia de vocês agora?',
  'quiz.cards.title': '{voce} e {amor}, escolham 3 cartas',
  'quiz.cards.progress': 'Agora escolham a carta do {position} · {count}/3',
  'quiz.cards.done': 'O passado, o presente e o futuro de {voce} & {amor} já estão sobre a mesa.',
  'quiz.cards.position.past': 'Passado',
  'quiz.cards.position.present': 'Presente',
  'quiz.cards.position.future': 'Futuro',
  'quiz.nav.continue': 'Continuar',
  'quiz.nav.seeReveal': 'Ver a revelação',
  'quiz.nav.saving': 'Salvando…',
  'quiz.nav.saveAndSee': 'Salvar e ver nosso início →',
  'quiz.datePicker.title': 'Data de nascimento',
  'quiz.datePicker.cancel': 'Cancelar',
  'quiz.datePicker.confirm': 'Confirmar',
  'quiz.datePicker.month.jan': 'Jan',
  'quiz.datePicker.month.feb': 'Fev',
  'quiz.datePicker.month.mar': 'Mar',
  'quiz.datePicker.month.apr': 'Abr',
  'quiz.datePicker.month.may': 'Mai',
  'quiz.datePicker.month.jun': 'Jun',
  'quiz.datePicker.month.jul': 'Jul',
  'quiz.datePicker.month.aug': 'Ago',
  'quiz.datePicker.month.sep': 'Set',
  'quiz.datePicker.month.oct': 'Out',
  'quiz.datePicker.month.nov': 'Nov',
  'quiz.datePicker.month.dec': 'Dez',
  'quiz.fallback.voce': 'você',
  'quiz.fallback.voces': 'vocês',
  'quiz.fallback.seuAmor': 'seu amor',
  'quiz.aviso.needYourName': 'Escreva seu nome para continuar.',
  'quiz.aviso.needPartnerName': 'Falta o nome do seu amor.',
  'quiz.aviso.needBirthDate': 'Falta a data de nascimento de {name}.',
  'quiz.aviso.checkDates': 'Confira as datas — não conseguimos calcular o signo.',
  'quiz.aviso.chooseEnergy': 'Escolha a energia de vocês agora.',
  'quiz.aviso.pickCards_one': 'Escolham 3 cartas — falta {missing}.',
  'quiz.aviso.pickCards_other': 'Escolham 3 cartas — faltam {missing}.',
  'quiz.aviso.fillStep': 'Preencha esta etapa para continuar.',
  'quiz.aviso.saveFailed': 'Não foi possível salvar. Tente novamente.',
  'quiz.loading.readingSky': 'Lendo o céu de {voce} & {amor}…',
  'quiz.loading.crossing': 'Cruzando {signoVoce} com {signoAmor}…',
  'quiz.loading.tracing': 'Traçando o mapa de vocês…',
  'quiz.birth.title': 'Data de nascimento de cada um',
  'quiz.birth.subtitle': 'Com a data já sabemos o signo de cada um. A hora é opcional — mas revela o Ascendente.',
  'quiz.birth.dateOf': 'Data de {name}',
  'quiz.birth.timeOf': 'Hora de {name} (opcional)',
  'quiz.birth.cityOf': 'Cidade de nascimento de {name} (opcional)',
  'quiz.birth.selectDate': 'Selecionar data',
  'quiz.birth.selectCity': 'Selecionar cidade',
  'quiz.birth.signOf': 'Signo de {name}:',
  'quiz.birth.hide': 'ocultar',
  'quiz.birth.notThisSign': 'não é esse o signo',
  'quiz.energy.option.romantica': 'Romântica 💕',
  'quiz.energy.echo.romantica': 'Dá pra notar — este mapa vai mostrar de onde nasce essa faísca.',
  'quiz.energy.option.apaixonada': 'Apaixonada 🔥',
  'quiz.energy.echo.apaixonada': 'Intensa. Vamos ver o que sustenta isso quando a chama abaixar.',
  'quiz.energy.option.poderosa': 'Poderosa ⚡',
  'quiz.energy.echo.poderosa': 'Duas forças juntas. Esse poder também precisa de cuidado.',
  'quiz.energy.option.reflexiva': 'Reflexiva 🌙',
  'quiz.energy.echo.reflexiva': 'Um momento de olhar pra dentro, os dois.',
  'quiz.energy.option.distantes': 'Distantes 🌫️',
  'quiz.energy.echo.distantes': 'A distância também tem mapa — e caminho de volta, juntos.',
  'quiz.energy.option.conflito': 'Em conflito 😔',
  'quiz.energy.echo.conflito': 'Vocês estão aqui, juntos, buscando isso. Isso já diz muito.',
  'quiz.energy.option.crise': 'Em crise 💔',
  'quiz.energy.echo.crise': 'Momentos assim apertam. Vocês dois aqui já é um bom começo.',
  'quiz.energy.option.recomecando': 'Recomeçando 🌱',
  'quiz.energy.echo.recomecando': 'Recomeçar é corajoso. Vamos começar pelo céu de vocês.',
  'quiz.reveal.energyOf': 'A energia de {voce} & {amor}',
  'quiz.reveal.compatBadge': 'compatibilidade do casal',
  'quiz.reveal.affinity': 'Afinidade entre os elementos de vocês ({elementoA} + {elementoB}) · leitura astrológica, por diversão',
  'quiz.reveal.strongHigh': 'Elementos que se acendem: {forte}',
  'quiz.reveal.strongMid': 'Se equilibram bem: {forte}',
  'quiz.reveal.strongLow': 'Diferentes e magnéticos: {forte}',
  'quiz.reveal.elementBadge': 'Elemento {element}',
  'quiz.reveal.strongPointLabel': 'Ponto forte de vocês:',
  'quiz.reveal.careLabel': 'Um cuidado especial:',
  'quiz.reveal.energyNow': 'E a energia de vocês agora — "{desejo}" — combina com esse momento. 💛',
  'quiz.reveal.trioTitle': 'Sol · Lua · Ascendente',
  'quiz.reveal.moonLine': ': a Lua em {sign} {need}.',
  'quiz.reveal.moonNeed.fogo': 'precisa de faísca e movimento para se sentir em casa',
  'quiz.reveal.moonNeed.terra': 'precisa de constância e gestos concretos para se sentir em paz',
  'quiz.reveal.moonNeed.ar': 'precisa conversar e entender para se sentir perto',
  'quiz.reveal.moonNeed.agua': 'precisa de ternura e contato para se sentir seguro(a)',
  'quiz.reveal.moonsSame': 'As Luas de vocês pedem a mesma coisa: se acalmam de forma parecida — aí está um refúgio de vocês.',
  'quiz.reveal.moonsDiff': 'As Luas de vocês pedem coisas diferentes: é dali que nascem quase todos os mal-entendidos… e também a saída.',
  'quiz.reveal.ascLine': ': Ascendente em {sign} {emoji}.',
  'quiz.reveal.ascPrecision': 'O Ascendente usa a hora exata e a cidade de nascimento de cada um — quanto mais precisas essas informações, mais confiável o resultado. Pequena diferença de horário pode mudar o signo do Ascendente.',
  'quiz.reveal.ascTeaser': 'O Ascendente — a primeira impressão que vocês passam e a couraça que usam sob pressão — se calcula com a hora e a cidade de nascimento. É uma das partes que se abrem dentro do app.',
  'quiz.reveal.cardsTitle': 'As cartas de vocês',
  'quiz.reveal.cosmicNumbers': 'Números cósmicos do casal',
  'quiz.reveal.goldenHour': '✷ Hora dourada de vocês: {time} ✷',
  'quiz.reveal.readingFooter': 'Leitura de {voce} & {amor} — feita hoje. Ninguém escolheu isso por vocês: vocês começaram isso, hoje, juntos. O que vem depois se escreve com o que vocês fizerem a partir daqui.',
  'quiz.reveal.todayTitle': 'Essa foi a leitura de hoje 💫',
  'quiz.reveal.todayText': 'O mapa astral completo do casal — com mais camadas sobre como vocês se comunicam e se aproximam — continua se construindo agora, no painel de vocês.',
  'quiz.nav.back': 'Voltar',

  // Horóscopo — textos sorteados por hash (o sorteio usa só o length, não muda por idioma)
  'horoscope.tab.yesterday': 'Ontem',
  'horoscope.tab.today': 'Hoje',
  'horoscope.tab.tomorrow': 'Amanhã',
  'horoscope.elementName.fogo': 'Fogo',
  'horoscope.elementName.terra': 'Terra',
  'horoscope.elementName.ar': 'Ar',
  'horoscope.elementName.agua': 'Água',
  'horoscope.diary.title': 'Horóscopo de {sign} — hoje',
  'horoscope.pickerTitle': 'Escolha seu signo',
  'horoscope.element': 'Elemento {element}',
  'horoscope.areasTitle': 'Áreas da sua vida',
  'horoscope.area.amor': 'Amor',
  'horoscope.area.trabalho': 'Trabalho',
  'horoscope.area.saude': 'Saúde',
  'horoscope.area.dinheiro': 'Dinheiro',
  'horoscope.luckTitle': 'Sua sorte hoje',
  'horoscope.luck.color': 'Cor',
  'horoscope.luck.number': 'Número',
  'horoscope.luck.hour': 'Hora',
  'horoscope.luck.colorName.violeta': 'Violeta',
  'horoscope.luck.colorName.rosa': 'Rosa',
  'horoscope.luck.colorName.dourado': 'Dourado',
  'horoscope.luck.colorName.turquesa': 'Turquesa',
  'horoscope.luck.colorName.verde': 'Verde',
  'horoscope.luck.colorName.ambar': 'Âmbar',
  'horoscope.luck.colorName.vermelho': 'Vermelho',
  'horoscope.luck.colorName.azul': 'Azul',
  'horoscope.reading.ontem.1': 'A energia de ontem trouxe reflexões importantes sobre seus vínculos. O que ficou pendente pede resolução calma. A Lua minguante favoreceu o encerramento de ciclos.',
  'horoscope.reading.ontem.2': 'Ontem foi um dia de olhar para dentro. Uma conversa deixou lições valiosas, mesmo que o momento tenha sido desconfortável. O que passou já cumpriu seu papel.',
  'horoscope.reading.ontem.3': 'O dia de ontem pediu paciência com você mesmo(a). Pequenos atritos revelaram o que precisa de mais atenção esta semana. Nada se perdeu, só amadureceu.',
  'horoscope.reading.ontem.4': 'Ontem trouxe um convite silencioso para soltar o que já não serve. A energia de Marte ainda ecoava em decisões rápidas, mas a calma venceu no fim do dia.',
  'horoscope.reading.ontem.5': 'A Lua de ontem favoreceu memórias e reencontros. Algo do passado voltou à mente para ser finalmente compreendido, não revivido.',
  'horoscope.reading.ontem.6': 'Ontem exigiu organização e método. Tarefas represadas começaram a andar, mesmo que o ritmo tenha parecido lento demais para o seu gosto.',
  'horoscope.reading.ontem.7': 'O céu de ontem trouxe clareza sobre um sentimento que você vinha evitando nomear. Encarar isso foi o primeiro passo para virar a página.',
  'horoscope.reading.ontem.8': 'Ontem foi propício para ajustar expectativas. O que parecia urgente perdeu força assim que você respirou fundo e observou com mais distância.',
  'horoscope.reading.hoje.1': 'O céu de hoje pede coragem para dizer sim ao novo. Vênus ilumina seus relacionamentos e traz suavidade às conversas difíceis. Confie na sua intuição — ela raramente falha. É um bom dia para iniciar projetos que envolvam criatividade e conexão.',
  'horoscope.reading.hoje.2': 'Hoje o dia pede foco e menos dispersão. Mercúrio favorece conversas objetivas, então aproveite para resolver o que anda te tirando o sono.',
  'horoscope.reading.hoje.3': 'O sol de hoje ilumina sua autoconfiança. É um bom momento para se posicionar sobre algo que você vinha adiando por medo do julgamento alheio.',
  'horoscope.reading.hoje.4': 'Hoje sua intuição está mais afiada que o normal. Preste atenção aos pequenos sinais — eles tendem a apontar na direção certa.',
  'horoscope.reading.hoje.5': 'O dia de hoje favorece parcerias. Uma troca sincera pode destravar algo que estava emperrado há tempos, no trabalho ou em casa.',
  'horoscope.reading.hoje.6': 'Hoje pede leveza. Não force respostas: algumas coisas se resolvem sozinhas quando você para de empurrar tanto.',
  'horoscope.reading.hoje.7': 'O céu de hoje aquece os relacionamentos próximos. Vale a pena reservar um tempo para quem importa, mesmo que a agenda esteja cheia.',
  'horoscope.reading.hoje.8': 'Hoje é um dia de ajustes finos. Pequenas mudanças de rotina rendem mais do que grandes decisões tomadas às pressas.',
  'horoscope.reading.amanha.1': 'Amanhã Mercúrio favorece decisões práticas. Uma oportunidade profissional pode surgir de onde você menos espera. Mantenha os olhos abertos e o coração leve.',
  'horoscope.reading.amanha.2': 'Amanhã tende a exigir paciência com prazos. Uma notícia inesperada pode reorganizar seus planos — encare como ajuste, não como obstáculo.',
  'horoscope.reading.amanha.3': 'O dia de amanhã favorece conversas francas. Se há algo pendente para dizer a alguém, esse pode ser o momento certo.',
  'horoscope.reading.amanha.4': 'Amanhã a Lua favorece o descanso. Vale desacelerar antes de tomar decisões importantes que podem esperar mais um dia.',
  'horoscope.reading.amanha.5': 'Amanhã promete movimento nas finanças. Um gasto ou uma entrada inesperada pede atenção redobrada ao planejamento.',
  'horoscope.reading.amanha.6': 'O céu de amanhã abre espaço para recomeços pequenos. Não precisa ser um grande gesto — um passo simples já muda o rumo do dia.',
  'horoscope.reading.amanha.7': 'Amanhã tende a trazer clareza sobre um dilema recente. A resposta pode não ser a que você esperava, mas será a mais honesta.',
  'horoscope.reading.amanha.8': 'Amanhã favorece a criatividade. Se algo trava no modo tradicional, vale tentar um caminho diferente do habitual.',

  // Mapa Astral
  'birthchart.row.sun.label': 'Sol',
  'birthchart.row.sun.desc': 'Sua essência e identidade',
  'birthchart.row.sun.missing': 'Informe a data de nascimento para calcular.',
  'birthchart.row.moon.label': 'Lua',
  'birthchart.row.moon.desc': 'Suas emoções e instintos',
  'birthchart.row.moon.missing': 'Não foi possível calcular a Lua agora.',
  'birthchart.row.asc.label': 'Ascendente',
  'birthchart.row.asc.desc': 'Como o mundo te vê',
  'birthchart.row.asc.missing': 'O Ascendente pede hora exata e cidade de nascimento — adicione os dois para descobrir.',
  'birthchart.noTime': 'hora não informada',
  'birthchart.positions': 'Posições',
  'birthchart.positionIn': '{label} em {sign}',

  // Agir — ideias de encontro, desafio de 7 dias, gesto do dia e meta da semana
  'agir.empty.title': 'Complete o quiz do casal primeiro',
  'agir.empty.desc': 'Precisamos saber os nomes de vocês para guardar as ideias, desafios e metas no lugar certo.',
  'agir.empty.cta': 'Fazer o quiz do casal',
  'agir.ideas.title': 'Ideia para um encontro',
  'agir.ideas.subtitle': 'Sem tempo para pensar? Deixem que a gente sugere.',
  'agir.ideas.prioritize': 'Priorizar ideias para a linguagem do amor de vocês: {lang}',
  'agir.ideas.draw': 'Sortear uma ideia ✨',
  'agir.ideas.inFavs': '💛 Nas favoritas',
  'agir.ideas.addFav': '🤍 Adicionar às favoritas',
  'agir.ideas.emptyFavTitle': 'Ainda não há favoritas',
  'agir.ideas.emptyFavDesc': 'Sorteiem uma ideia e guardem aqui as que mais gostarem.',
  'agir.ideas.emptyFavCta': 'Sortear uma ideia agora',
  'agir.ideas.favCount': 'Favoritas ({count})',
  'agir.ideas.tag.casa': 'em casa',
  'agir.ideas.tag.arLivre': 'ao ar livre',
  'agir.ideas.tag.economico': 'econômico',
  'agir.ideas.tag.especial': 'especial',
  'agir.ideas.i1': 'Noite de cinema em casa: cada um escolhe um filme, o outro prepara a pipoca.',
  'agir.ideas.i2': 'Cozinhem juntos uma receita nova que nenhum dos dois tenha feito antes.',
  'agir.ideas.i3': 'Piquenique no chão da sala, luzes apagadas e velas acesas.',
  'agir.ideas.i4': 'Tarde de jogos: cartas, tabuleiro ou videogame, com um carinho de prêmio.',
  'agir.ideas.i5': 'Caminhada ao entardecer em um lugar onde nunca estiveram juntos.',
  'agir.ideas.i6': 'Levem um café e sentem num banco da praça para ver o dia passar.',
  'agir.ideas.i7': 'Andem de bicicleta por um parque numa manhã ensolarada.',
  'agir.ideas.i8': 'Deitem na grama à noite e tentem encontrar constelações juntos.',
  'agir.ideas.i9': 'Vão a um mercado local: comprem ingredientes e improvisem um jantar.',
  'agir.ideas.i10': 'Visitem uma livraria e presenteiem um ao outro com um livro econômico.',
  'agir.ideas.i11': 'Façam um passeio a pé pelo bairro, fingindo ser turistas na própria cidade.',
  'agir.ideas.i12': 'Tarde de sorvete: provem um sabor que nenhum dos dois pediria sozinho.',
  'agir.ideas.i13': 'Recriem o primeiro encontro de vocês, exatamente como foi.',
  'agir.ideas.i14': 'Escrevam uma carta um para o outro e troquem na hora do jantar.',
  'agir.ideas.i15': 'Planejem juntos uma micro-fuga de um dia para o mês que vem.',
  'agir.lang.palavras': 'palavras de afirmação',
  'agir.lang.tempo': 'tempo de qualidade',
  'agir.lang.presentes': 'presentes',
  'agir.lang.servico': 'atos de serviço',
  'agir.lang.toque': 'toque físico',
  'agir.challenge.title': 'Desafio de 7 dias',
  'agir.challenge.subtitle': 'Um gesto por dia. No ritmo de vocês, vão marcando à medida que fizerem.',
  'agir.challenge.day': 'Dia {n}. ',
  'agir.challenge.complete': 'Desafio completo! {voce} e {amor} toparam 7 dias de gestos. 💛',
  'agir.challenge.d1': 'Envie uma mensagem dizendo algo que você admira nele(a).',
  'agir.challenge.d2': 'Dê um abraço de 20 segundos, sem pressa.',
  'agir.challenge.d3': 'Faça uma pergunta que nunca fez antes e escute de verdade.',
  'agir.challenge.d4': 'Assuma uma tarefa que costuma ser do outro, sem pedir nada em troca.',
  'agir.challenge.d5': 'Lembrem juntos um bom momento que vocês viveram.',
  'agir.challenge.d6': 'Elogie algo pequeno que costuma passar despercebido.',
  'agir.challenge.d7': 'Planejem juntos algo simples para fazer na próxima semana.',
  'agir.gesture.title': 'Gesto do dia',
  'agir.gesture.subtitle': 'Uma ideia simples, uma por dia — a mesma para vocês dois hoje.',
  'agir.gesture.g1': 'Prepare o café ou um lanche exatamente como ele(a) gosta.',
  'agir.gesture.g2': 'Envie uma mensagem no meio da manhã só para dizer que lembrou dele(a).',
  'agir.gesture.g3': 'Guarde 10 minutos sem celular só para conversar se olhando nos olhos.',
  'agir.gesture.g4': 'Faça um elogio sincero sobre algo além do físico.',
  'agir.gesture.g5': 'Deixe um bilhetinho carinhoso onde ele(a) vá encontrar.',
  'agir.gesture.g6': 'Ofereça um carinho na cabeça ou nas costas, sem motivo nenhum.',
  'agir.gesture.g7': 'Pergunte como foi o dia dele(a) e escute sem interromper.',
  'agir.gesture.g8': 'Assuma uma pequena tarefa de casa para aliviar o dia dele(a).',
  'agir.gesture.g9': 'Lembre um momento engraçado que vocês viveram juntos.',
  'agir.gesture.g10': 'Agradeça por algo específico que ele(a) tenha feito recentemente.',
  'agir.goal.title': 'Meta da semana',
  'agir.goal.subtitle': 'Combinem algo para cuidar juntos esta semana.',
  'agir.goal.label': 'Nossa meta',
  'agir.goal.placeholder': 'Ex.: Jantar sem celular duas vezes esta semana',
  'agir.goal.save': 'Salvar meta',

  // Descobrir — linguagem do amor, estilo de apego e conflitos
  'descobrir.empty.title': 'Complete o quiz do casal primeiro',
  'descobrir.empty.desc': 'Precisamos saber os nomes de vocês para guardar os resultados no lugar certo.',
  'descobrir.empty.cta': 'Fazer o quiz do casal',
  'descobrir.intro': 'Dois testes rápidos para que {voce} e {amor} abram uma boa conversa. Não há respostas certas ou erradas — só um convite para se entenderem com mais carinho.',
  'descobrir.disclaimer': 'Isso é uma reflexão para vocês conversarem, não um diagnóstico. Ninguém se resume a um rótulo — e essas formas de amar e se vincular podem mudar e crescer com o tempo.',
  'descobrir.tab.linguagem': 'Linguagem do amor',
  'descobrir.tab.apego': 'Estilo de apego',
  'descobrir.tab.conflitos': 'Conflitos',
  'descobrir.quiz.dica': 'Dica',
  'descobrir.quiz.balance': 'Assim ficou o balanço de vocês',
  'descobrir.quiz.redo': 'Refazer',
  'descobrir.quiz.progress': 'Pergunta {step} de {total}',
  'descobrir.quiz.back': 'Voltar',
  'descobrir.quiz.next': 'Próxima',
  'descobrir.quiz.seeResult': 'Ver resultado',
  'descobrir.lang.badge': 'A linguagem principal de {name}',
  'descobrir.lang.label.palavras': 'Palavras de afirmação',
  'descobrir.lang.label.tempo': 'Tempo de qualidade',
  'descobrir.lang.label.presentes': 'Presentes',
  'descobrir.lang.label.servico': 'Atos de serviço',
  'descobrir.lang.label.toque': 'Toque físico',
  'descobrir.lang.q1': 'O que mais faz você se sentir amado(a) no dia a dia?',
  'descobrir.lang.q1.opt.palavras': 'Ouvir um elogio sincero ou um "obrigado" de verdade',
  'descobrir.lang.q1.opt.tempo': 'Passar um tempo que seja só nosso, sem pressa e sem celular',
  'descobrir.lang.q1.opt.presentes': 'Receber um detalhe que mostre que pensaram em mim',
  'descobrir.lang.q1.opt.servico': 'Que alguém resolva algo por mim antes mesmo de eu pedir',
  'descobrir.lang.q1.opt.toque': 'Um abraço forte ou estar de mãos dadas',
  'descobrir.lang.q2': 'Depois de um dia difícil, o que mais te reconforta?',
  'descobrir.lang.q2.opt.palavras': 'Ouvir "estou com você, vai ficar tudo bem"',
  'descobrir.lang.q2.opt.tempo': 'Sentar juntos e conversar com calma sobre tudo',
  'descobrir.lang.q2.opt.presentes': 'Chegar em casa e encontrar um detalhe me esperando',
  'descobrir.lang.q2.opt.servico': 'Que alguém tenha cuidado de uma tarefa que era minha',
  'descobrir.lang.q2.opt.toque': 'Um abraço longo, um carinho na cabeça, me sentir aconchegado(a)',
  'descobrir.lang.q3': 'Como você costuma demonstrar carinho a quem ama?',
  'descobrir.lang.q3.opt.palavras': 'Dizendo com todas as letras o quanto admiro essa pessoa',
  'descobrir.lang.q3.opt.tempo': 'Reservando um tempo só para ficarmos juntos',
  'descobrir.lang.q3.opt.presentes': 'Escolhendo presentes com significado',
  'descobrir.lang.q3.opt.servico': 'Fazendo coisas práticas que facilitam a vida dele(a)',
  'descobrir.lang.q3.opt.toque': 'Com abraços, beijos e proximidade',
  'descobrir.lang.q4': 'Como seria o seu fim de semana ideal a dois?',
  'descobrir.lang.q4.opt.palavras': 'Compartilhando muitas boas conversas e palavras carinhosas',
  'descobrir.lang.q4.opt.tempo': 'Um plano tranquilo, com atenção total um no outro',
  'descobrir.lang.q4.opt.presentes': 'Uma pequena surpresa ou uma trocinha simples de presentes',
  'descobrir.lang.q4.opt.servico': 'Resolver a casa juntos e depois relaxar sem preocupações',
  'descobrir.lang.q4.opt.toque': 'Muito mimo, desde o café da manhã na cama até um filme abraçados',
  'descobrir.lang.q5': 'Quando estão longe, do que mais sente falta?',
  'descobrir.lang.q5.opt.palavras': 'Das mensagens carinhosas e do "bom dia, meu amor"',
  'descobrir.lang.q5.opt.tempo': 'Das nossas conversas sem hora para acabar',
  'descobrir.lang.q5.opt.presentes': 'De receber (e mandar) aquele detalhe à distância',
  'descobrir.lang.q5.opt.servico': 'De ter alguém com quem dividir as tarefas do dia',
  'descobrir.lang.q5.opt.toque': 'Do abraço e de simplesmente estar pertinho',
  'descobrir.lang.q6': 'Qual gesto do seu amor te toca mais fundo?',
  'descobrir.lang.q6.opt.palavras': 'Quando ele(a) nota algo em mim e diz em voz alta',
  'descobrir.lang.q6.opt.tempo': 'Quando ele(a) larga tudo só para me dar atenção',
  'descobrir.lang.q6.opt.presentes': 'Quando ele(a) guarda um detalhe e transforma em presente',
  'descobrir.lang.q6.opt.servico': 'Quando ele(a) age para aliviar um peso meu sem que eu peça',
  'descobrir.lang.q6.opt.toque': 'Quando ele(a) me puxa para perto num momento inesperado',
  'descobrir.lang.result.palavras.texto': 'Você floresce quando o amor vira palavra: um elogio sincero, um "tenho orgulho de você", um bilhete inesperado. Ouvir em voz alta que você é amado(a) te dá segurança e aquece o seu dia. O reconhecimento, para você, é uma forma concreta de cuidado.',
  'descobrir.lang.result.palavras.dica': 'Dica para vocês: combinem dizer, todas as noites, algo que admiraram um no outro naquele dia — também vale por mensagem.',
  'descobrir.lang.result.tempo.texto': 'O que mais te preenche é a atenção de verdade: estar juntos, sem pressa e sem distrações. Um tempo que seja só de vocês vale mais que qualquer coisa material. A presença, para você, é a maior prova de amor.',
  'descobrir.lang.result.tempo.dica': 'Dica para vocês: reservem um momento fixo na semana sem telas — mesmo que sejam só 20 minutos para conversar se olhando nos olhos.',
  'descobrir.lang.result.presentes.texto': 'Para você, um presente não é sobre o preço — é sobre a intenção por trás dele. Um detalhe simples mostra que alguém pensou em você mesmo à distância. Esses gestos viram símbolos de carinho que você carrega consigo.',
  'descobrir.lang.result.presentes.dica': 'Dica para vocês: mantenham uma "listinha de detalhes" um do outro (gostos, sonhos, desejos) para acertar em cheio nas próximas surpresas.',
  'descobrir.lang.result.servico.texto': 'Você sente o amor quando ele vira ação: alguém que resolve, ajuda e tira um peso das suas costas. As atitudes práticas, para você, falam mais alto que as promessas. Cuidar do dia a dia juntos é sua forma favorita de amar e ser amado(a).',
  'descobrir.lang.result.servico.dica': 'Dica para vocês: perguntem-se "o que posso tirar das suas costas hoje?" — e deixem o outro sentir que não está sozinho.',
  'descobrir.lang.result.toque.texto': 'Para você, a conexão passa muito pelo corpo: um abraço, a mão dada, o mimo que acalma. O contato carinhoso te faz sentir seguro(a) e presente no vínculo. É por aí que o carinho chega mais fundo.',
  'descobrir.lang.result.toque.dica': 'Dica para vocês: criem pequenos rituais de contato — um abraço de 20 segundos ao se reencontrarem já muda o clima do dia.',
  'descobrir.att.badge': 'O estilo predominante de {name}',
  'descobrir.att.label.seguro': 'Estilo seguro',
  'descobrir.att.label.ansioso': 'Estilo ansioso',
  'descobrir.att.label.evitativo': 'Estilo evitativo',
  'descobrir.att.q1': 'Quando surge um desentendimento entre vocês, você tende a...',
  'descobrir.att.q1.opt.seguro': 'Conversar com calma, confiando que vão resolver juntos',
  'descobrir.att.q1.opt.ansioso': 'Ficar angustiado(a) e querer resolver tudo na hora',
  'descobrir.att.q1.opt.evitativo': 'Precisar de um tempo sozinho(a) antes de conseguir falar',
  'descobrir.att.q2': 'Quando seu amor demora para responder uma mensagem...',
  'descobrir.att.q2.opt.seguro': 'Fico tranquilo(a), sei que ele(a) responde quando pode',
  'descobrir.att.q2.opt.ansioso': 'Começo a imaginar que talvez algo esteja errado',
  'descobrir.att.q2.opt.evitativo': 'Nem noto tanto — cada um no seu ritmo',
  'descobrir.att.q3': 'Sobre falar de sentimentos no relacionamento...',
  'descobrir.att.q3.opt.seguro': 'Me sinto à vontade para abrir o coração',
  'descobrir.att.q3.opt.ansioso': 'Quero muito, mas às vezes temo estar sendo demais',
  'descobrir.att.q3.opt.evitativo': 'Prefiro guardar algumas coisas para mim',
  'descobrir.att.q4': 'Nos momentos de muita proximidade e intimidade...',
  'descobrir.att.q4.opt.seguro': 'Aproveito a conexão sem deixar de ser eu mesmo(a)',
  'descobrir.att.q4.opt.ansioso': 'Eu gostaria que fosse assim, bem coladinhos, o tempo todo',
  'descobrir.att.q4.opt.evitativo': 'De vez em quando sinto necessidade de um respiro',
  'descobrir.att.q5': 'Pensando em contar com o outro no dia a dia...',
  'descobrir.att.q5.opt.seguro': 'Confio nele(a) e também gosto de ser um apoio',
  'descobrir.att.q5.opt.ansioso': 'Tenho medo que, algum dia, me deixem de lado',
  'descobrir.att.q5.opt.evitativo': 'Prefiro, na maioria das vezes, contar comigo mesmo(a)',
  'descobrir.att.result.seguro.texto': 'Você tende a se sentir confortável tanto na proximidade quanto na sua individualidade. Confia com naturalidade e consegue falar do que sente sem se perder no processo. Isso não é um rótulo fixo — é uma forma de ser que se constrói e se cultiva no dia a dia.',
  'descobrir.att.result.seguro.dica': 'Dica para vocês: usem essa base de confiança para criar um "espaço seguro" onde possam falar de inseguranças sem medo de ser julgados.',
  'descobrir.att.result.ansioso.texto': 'Você valoriza muito a conexão e às vezes fica atento(a) a sinais de distância, buscando reforçar o vínculo. Esse cuidado mostra o quanto a relação importa para você. Não é um defeito — é uma necessidade de proximidade que pode ser conversada com carinho.',
  'descobrir.att.result.ansioso.dica': 'Dica para vocês: combinem pequenos gestos de reafirmação (um "estou aqui", um bom dia pontual) que acalmam sem virar uma cobrança.',
  'descobrir.att.result.evitativo.texto': 'Você valoriza sua autonomia e às vezes precisa de um espaço próprio para processar antes de compartilhar. Isso não significa amar menos — é uma forma de se sentir seguro(a). Reconhecer esse ritmo ajuda os dois a se encontrarem no meio do caminho.',
  'descobrir.att.result.evitativo.dica': 'Dica para vocês: quando precisar de espaço, avise com carinho ("preciso de um tempinho e já volto") para que o outro não interprete como afastamento.',
  'descobrir.conf.q1': 'Quando há um conflito entre {voce} e {amor}, quem costuma dar o primeiro passo?',
  'descobrir.conf.both': 'Os dois igualmente',
  'descobrir.conf.none': 'Ainda nenhum',
  'descobrir.conf.q2': 'Qual é o desafio que vocês mais querem resolver juntos?',
  'descobrir.conf.desafio.comunicacao': 'Comunicação',
  'descobrir.conf.desafio.rotina': 'Rotina vs. romance',
  'descobrir.conf.desafio.confianca': 'Confiança',
  'descobrir.conf.desafio.redescobrir': 'Redescobrir-se',
  'descobrir.conf.statFirstStep': 'dá o primeiro passo',
  'descobrir.conf.statChallenge': 'desafio a resolver',
  'descobrir.conf.saved': 'Salvo — isso ajuda a personalizar o que vocês veem em Reconectar.',

  // Reconectar — trilhas e modo SOS
  'reconectar.header.title': 'Reconectar',
  'reconectar.header.subtitle': 'Fortaleça o vínculo',
  'reconectar.gate.title': 'Complete o quiz do casal primeiro',
  'reconectar.gate.desc': 'Precisamos saber os nomes de vocês para guardar o progresso das trilhas no lugar certo.',
  'reconectar.gate.cta': 'Fazer o quiz do casal',
  'reconectar.celebrate.title': 'Conseguiram, {voce} & {amor}!',
  'reconectar.celebrate.desc': 'Completaram juntos a trilha "{title}". Mais um passo, real e dos dois.',
  'reconectar.sos.overline': 'Ajuda imediata',
  'reconectar.sos.title': 'Modo SOS — logo após uma briga',
  'reconectar.sos.desc': '4 passos curtos para baixar a tensão agora, sem escolher trilha.',
  'reconectar.sos.next': 'Pronto, próximo passo',
  'reconectar.sos.finish': 'Terminamos os 4 passos 💛',
  'reconectar.sos.step.0': 'Respirem fundo, cada um à sua maneira, antes de dizer qualquer outra coisa.',
  'reconectar.sos.step.1': 'O primeiro que conseguir, diga em voz alta: "não quero brigar com você, quero te entender".',
  'reconectar.sos.step.2': 'Escutem um ao outro sem interromper nem se defender — só para entender, não para responder já.',
  'reconectar.sos.step.3': 'Ofereçam um abraço de 20 segundos, mesmo que ainda falte algo para resolver.',
  'reconectar.intro.title': 'Reavivar a conexão',
  'reconectar.intro.text': 'Reconectar não é convencer nem controlar ninguém — é voltar a se escutar, se cuidar e se comunicar com honestidade. Escolham uma trilha e façam uma pequena missão por dia, no ritmo de vocês. Os gestos pequenos, repetidos, reconstroem o vínculo.',
  'reconectar.intro.disclaimer': 'Para questões sérias, considerem terapia de casal com um profissional.',
  'reconectar.progress.overline': 'Avanço conjunto de vocês',
  'reconectar.progress.done': '✅ feitos',
  'reconectar.progress.pending': '⏳ pendentes',
  'reconectar.progress.tracks': '🏁 trilhas',
  'reconectar.tracksTitle': 'Trilhas de reconexão',
  'reconectar.recommendedIntro': 'De acordo com o jeito de vocês se vincularem e o momento de hoje, sugerimos começar pela trilha marcada abaixo.',
  'reconectar.recommendedBadge': '✷ sugerida para hoje',
  'reconectar.trackComplete': 'Trilha completa. Quando quiserem, podem revisitá-la juntos.',
  'reconectar.disclaimer': 'As memórias de progresso das trilhas de vocês ficam salvas apenas neste aparelho.',
  'reconectar.track.conversar.title': 'Voltar a conversar',
  'reconectar.track.conversar.intro': 'Pequenos gestos para reabrir o canal e se escutarem de verdade.',
  'reconectar.track.conversar.step.0': 'Escute seu par por 2 minutos sem interromper e resuma com suas palavras o que ouviu.',
  'reconectar.track.conversar.step.1': 'Envie uma mensagem curta perguntando como foi o dia dele(a) — e leia a resposta com atenção.',
  'reconectar.track.conversar.step.2': 'Escolham um momento sem pressa para conversar, com os celulares longe.',
  'reconectar.track.conversar.step.3': 'Faça uma pergunta aberta ("o que você tem sentido ultimamente?") em vez de uma de sim ou não.',
  'reconectar.track.conversar.step.4': 'Compartilhe algo seu primeiro: conte como você tem se sentido, começando com "eu sinto...".',
  'reconectar.track.conversar.step.5': 'Combinem um horário fixo na semana, só para vocês, para se atualizarem.',
  'reconectar.track.frieza.title': 'Reduzir a frieza',
  'reconectar.track.frieza.intro': 'Esquentar o ambiente aos poucos, sem pressão e no ritmo dos dois.',
  'reconectar.track.frieza.step.0': 'Cumprimente seu par com um bom dia ou boa noite, mesmo nos dias mais difíceis.',
  'reconectar.track.frieza.step.1': 'Reconheça em voz alta algo que você admira nele(a).',
  'reconectar.track.frieza.step.2': 'Ofereça um contato carinhoso — a mão no ombro, um abraço — se for confortável para os dois.',
  'reconectar.track.frieza.step.3': 'Respire antes de falar quando sentir vontade de se fechar, para não responder no automático.',
  'reconectar.track.frieza.step.4': 'Diga "senti sua falta" quando for verdade, sem esperar nada em troca.',
  'reconectar.track.frieza.step.5': 'Retomem um pequeno hábito de vocês: um café juntos, uma música, uma caminhada.',
  'reconectar.track.carinho.title': 'Reconstruir o carinho',
  'reconectar.track.carinho.intro': 'Regar o afeto com atenção, gratidão e presença.',
  'reconectar.track.carinho.step.0': 'Agradeça algo específico que seu par fez hoje, por menor que pareça.',
  'reconectar.track.carinho.step.1': 'Envie uma mensagem lembrando um bom momento que vocês viveram juntos.',
  'reconectar.track.carinho.step.2': 'Faça um elogio sincero sobre quem ele(a) é, não só sobre o que faz.',
  'reconectar.track.carinho.step.3': 'Ofereça ajuda em algo que você sabe que pesa para ele(a), sem esperar que peça.',
  'reconectar.track.carinho.step.4': 'Reservem 10 minutos só para ficarem juntos, sem resolver nada — só presença.',
  'reconectar.track.carinho.step.5': 'Escreva um bilhete curto dizendo o que você valoriza em ter essa pessoa por perto.',
  'reconectar.track.confianca.title': 'Retomar a confiança',
  'reconectar.track.confianca.intro': 'Reconstruir a segurança com transparência e reparos honestos.',
  'reconectar.track.confianca.step.0': 'Cumpra uma pequena promessa esta semana e avise com carinho quando cumprir.',
  'reconectar.track.confianca.step.1': 'Peça desculpas por algo específico, sem acrescentar um "mas" depois.',
  'reconectar.track.confianca.step.2': 'Escute a dor do seu par até o fim, sem se defender, e valide o que ele(a) sentiu.',
  'reconectar.track.confianca.step.3': 'Faça um pedido começando com "eu sinto..." em vez de acusar ("sinto insegurança quando...").',
  'reconectar.track.confianca.step.4': 'Seja transparente sobre algo que você costumava evitar contar, no seu próprio ritmo.',
  'reconectar.track.confianca.step.5': 'Combinem juntos um pequeno pacto de convivência e revisem daqui a uma semana.',

  // Linha do tempo — memórias e cápsulas
  'timeline.header.title': 'Linha do tempo',
  'timeline.header.subtitle': 'Memórias do casal',
  'timeline.gate.title': 'Complete o quiz do casal primeiro',
  'timeline.gate.desc': 'Precisamos saber os nomes de vocês para guardar as memórias no lugar certo.',
  'timeline.gate.cta': 'Fazer o quiz do casal',
  'timeline.link.badge': '✷ Horóscopo do casal ✷',
  'timeline.link.text': 'Veja a energia de hoje entre {voce} e {amor} →',
  'timeline.section.timeline': 'Linha do tempo',
  'timeline.stat.memories': '📸 memórias',
  'timeline.stat.capsules': '⏳ cápsulas',
  'timeline.empty.memories.title': 'Ainda não há memórias salvas',
  'timeline.empty.memories.desc': 'Adicionem o primeiro capítulo da história de {voce} e {amor} 👇',
  'timeline.delete': 'eliminar',
  'timeline.dateFormat': '{d} {month} {y}',
  'timeline.month.0': 'jan',
  'timeline.month.1': 'fev',
  'timeline.month.2': 'mar',
  'timeline.month.3': 'abr',
  'timeline.month.4': 'mai',
  'timeline.month.5': 'jun',
  'timeline.month.6': 'jul',
  'timeline.month.7': 'ago',
  'timeline.month.8': 'set',
  'timeline.month.9': 'out',
  'timeline.month.10': 'nov',
  'timeline.month.11': 'dez',
  'timeline.defaultMemory.1.title': 'Primeiro encontro',
  'timeline.defaultMemory.1.text': 'Aquele café que virou 4 horas de conversa.',
  'timeline.defaultMemory.2.title': 'Primeira viagem juntos',
  'timeline.defaultMemory.2.text': 'Praia, chuva e nós rindo de tudo.',
  'timeline.defaultMemory.3.title': 'Um "eu te amo" de verdade',
  'timeline.defaultMemory.3.text': 'Sem pressa, como devia ser.',
  'timeline.addMemory.section': 'Adicionar uma memória',
  'timeline.addMemory.titleLabel': 'Título',
  'timeline.addMemory.titlePlaceholder': 'Ex.: Nossa primeira viagem',
  'timeline.addMemory.dateLabel': 'Data',
  'timeline.selectDate': 'Selecionar data',
  'timeline.addMemory.descLabel': 'Descrição',
  'timeline.addMemory.descPlaceholder': 'Um detalhe para nunca esquecer',
  'timeline.addMemory.save': 'Salvar memória 💛',
  'timeline.datePicker.memoryTitle': 'Data da memória',
  'timeline.capsules.section': 'Cápsulas do tempo ⏳',
  'timeline.capsules.empty.title': 'Ainda não há nenhuma cápsula',
  'timeline.capsules.empty.desc': 'Grave uma mensagem que se abra no futuro 👇',
  'timeline.capsule.opened': 'Cápsula aberta!',
  'timeline.capsule.sealed': 'Cápsula selada',
  'timeline.capsule.daysLeft_one': '{n} dia',
  'timeline.capsule.daysLeft_other': '{n} dias',
  'timeline.capsule.opensOn': 'abre em {date}',
  'timeline.createCapsule.section': 'Criar uma cápsula',
  'timeline.createCapsule.msgLabel': 'Mensagem para o futuro',
  'timeline.createCapsule.msgPlaceholder': 'Ex.: Lembra desse dia?',
  'timeline.createCapsule.openAtLabel': 'Abrir em',
  'timeline.createCapsule.seal': 'Selar cápsula ⏳',
  'timeline.createCapsule.hint': 'Dica: para ver uma cápsula "abrir", escolha a data de hoje ou de ontem.',
  'timeline.disclaimer': 'As memórias e cápsulas de vocês ficam salvas apenas neste aparelho.',

  // Diário Cósmico
  'diary.date': '{d} de {month}',
  'diary.month.0': 'janeiro',
  'diary.month.1': 'fevereiro',
  'diary.month.2': 'março',
  'diary.month.3': 'abril',
  'diary.month.4': 'maio',
  'diary.month.5': 'junho',
  'diary.month.6': 'julho',
  'diary.month.7': 'agosto',
  'diary.month.8': 'setembro',
  'diary.month.9': 'outubro',
  'diary.month.10': 'novembro',
  'diary.month.11': 'dezembro',
  'diary.filter.all': 'Todos',
  'diary.filter.tarot': 'Tarô',
  'diary.filter.palma': 'Palma',
  'diary.filter.rosto': 'Rosto',
  'diary.filter.pe': 'Pé',
  'diary.filter.pintas': 'Pintas',
  'diary.filter.coffee': 'Café',
  'diary.filter.dream': 'Sonho',
  'diary.pinned.banner': 'EM DESTAQUE',
  'diary.withInsight': '🎙️ com insight',

  // Assinatura
  'planos.header.title': 'Assinatura',
  'planos.header.subtitle': '3 planos · todos com 7 dias grátis',
  'planos.unlockTitle': 'Desbloqueie a experiência completa do casal',
  'planos.unlockTitleSolo': 'Desbloqueie as leituras individuais sem limite',
  'planos.benefit.1': '7 dias grátis pra testar, sem compromisso',
  'planos.benefit.2': 'Leituras sem limite: Horóscopo, Mapa Astral, Tarô, Compatibilidade, Chat, Palma, Café, Sonhos e Calendário Lunar',
  'planos.benefit.3': 'Reconectar — rotas de reconexão pro casal',
  'planos.benefit.4': 'Descobrir — jogos e ideias de encontro',
  'planos.benefit.5': 'Agir — metas da semana',
  'planos.benefit.6': 'Progresso e Retrospectiva da jornada de vocês',
  'planos.benefit.7': 'Linha do tempo e cápsulas do tempo guardadas',
  'planos.plan.trial.label': 'Mensal',
  'planos.plan.trial.cycle': '/mês',
  'planos.plan.trial.detail': '7 dias grátis, depois US$5/mês',
  'planos.plan.quarterly.label': 'Trimestral',
  'planos.plan.quarterly.cycle': '/3 meses',
  'planos.plan.quarterly.detail': '7 dias grátis · US$3,33/mês',
  'planos.plan.quarterly.badge': 'Economize 33%',
  'planos.plan.annual.label': 'Anual',
  'planos.plan.annual.cycle': '/ano',
  'planos.plan.annual.detail': '7 dias grátis · US$1,67/mês',
  'planos.plan.annual.badge': 'Melhor oferta',
  'planos.cta.trial': 'Começar meus 7 dias grátis →',
  'planos.cta.quarterly': 'Começar 7 dias grátis (Trimestral) →',
  'planos.cta.annual': 'Começar 7 dias grátis (Anual) →',
  'planos.preparing': 'Preparando o checkout seguro…',
  'planos.errorGeneric': 'Não conseguimos abrir o checkout agora. Tente de novo em instantes.',
  'planos.openOtherTab': 'Abrir o checkout em outra aba →',
  'planos.back': '← Voltar',
  'planos.alreadySubscriber': 'Você já é assinante',
  'planos.status.active': 'Ativa',
  'planos.status.pastDue': 'Pagamento pendente',
  'planos.status.pending': 'Aguardando confirmação',
  'planos.status.canceled': 'Cancelada',
  'planos.status.expired': 'Expirada',
  'planos.renewsOn': 'Renova em {date}',
  'planos.loginRequired.title': 'Faça login para assinar',
  'planos.loginRequired.text': 'Precisamos de uma conta pra ligar sua assinatura a você — assim, se trocar de aparelho, seu acesso continua junto.',
  'planos.loginRequired.cta': 'Fazer login →',
  'planos.statusLine': 'Status: {status}',

  // Loja — recompensas e brindes espirituais
  'loja.header.title': 'Loja',
  'loja.header.subtitle': 'Troque tokens por recompensas',
  'loja.balanceLabel': 'tokens disponíveis',
  'loja.sectionRewards': 'Recompensas',
  'loja.costTokens': '{cost} tokens',
  'loja.redeem': 'Resgatar',
  'loja.open': 'Abrir',
  'loja.owned': 'seu — abra quando quiser',
  'loja.sectionBrindes': 'Brindes espirituais',
  'loja.sectionBrindesSubtitle': 'Ganhe tokens nas missões diárias e troque por mimos de entrega imediata.',
  'loja.wallpaperDownload': 'Baixar “{nome}”',
  'loja.reward.selo-cosmico.title': 'Selo Cósmico no perfil',
  'loja.reward.selo-cosmico.description': 'Um selinho especial ao lado do seu nome no Perfil — no seu perfil individual ou no do casal.',
  'loja.reward.destaque-diario.title': 'Destaque no Diário',
  'loja.reward.destaque-diario.description': 'Fixa uma leitura à sua escolha no topo do Diário Cósmico por 7 dias.',
  'loja.reward.leitura-bonus.title': 'Leitura Bônus',
  'loja.reward.leitura-bonus.description': 'Desbloqueia uma leitura extra de Tarô fora da sua sequência normal (mesmo tema já consultado hoje).',
  'loja.reward.escudo-sequencia.title': 'Escudo da Sequência',
  'loja.reward.escudo-sequencia.description': 'Protege sua sequência de quebrar se vocês esquecerem de usar o app por 1 dia.',
  'loja.reward.tema-dourado.title': 'Tema dourado exclusivo',
  'loja.reward.tema-dourado.description': 'O app inteiro em dourado — compra única, liga e desliga quando quiser no Perfil.',
  // Brindes: mesmo esquema das recompensas acima — o id do catálogo
  // (lib/brindes.js) é a chave, e só custo/ícone/plataforma ficam lá.
  'loja.brinde.brinde-ritual-lua.title': 'Guia do Ritual de Lua Cheia',
  'loja.brinde.brinde-ritual-lua.description': 'Ritual guiado em 4 passos pra próxima Lua Cheia — seu pra sempre, reabre quando quiser.',
  'loja.brinde.brinde-wallpapers.title': 'Pack de Wallpapers Místicos',
  'loja.brinde.brinde-wallpapers.description': '3 fundos de tela exclusivos (1080×1920) pra baixar na hora.',
  'loja.brinde.brinde-tiragem-exclusiva.title': 'Tiragem da Lua Interior',
  'loja.brinde.brinde-tiragem-exclusiva.description': 'Tiragem exclusiva de 3 posições + 1 Leitura Bônus de Tarô já creditada pra você usar nela.',
  'loja.brinde.brinde-incenso.title': 'Incenso Místico (kit 7 varetas)',
  'loja.brinde.brinde-incenso.description': 'Kit de incensos naturais enviado pra sua casa — em breve.',
  'loja.brinde.brinde-cristal.title': 'Cristal de Quartzo',
  'loja.brinde.brinde-cristal.description': 'Quartzo natural escolhido a dedo, enviado pra sua casa — em breve.',
  'loja.alert.goldAlready.title': 'Você já tem o Tema dourado',
  'loja.alert.goldAlready.text': 'Liga e desliga quando quiser em Perfil > Preferências.',
  'loja.alert.shield.title': 'Escudo ativado!',
  'loja.alert.shield.text': '{count} escudo(s) guardado(s) — protege a próxima sequência quebrada.',
  'loja.alert.seal.title': 'Selo ativado!',
  'loja.alert.seal.text': 'Já apareceu ao lado do nome de vocês no Perfil.',
  'loja.alert.bonusReading.title': 'Leitura Bônus guardada!',
  'loja.alert.bonusReading.text': 'Vá no Tarô, escolha o tema (mesmo já consultado hoje) e use o botão "Usar Leitura Bônus" ({count} disponível).',
  'loja.alert.pin.title': 'Destaque guardado!',
  'loja.alert.pin.text': 'Abra o Diário Cósmico, toque na leitura que quiser e use "Fixar no topo por 7 dias".',
  'loja.alert.goldGranted.title': 'Tema dourado seu!',
  'loja.alert.goldGranted.text': 'Recarregando pra aplicar o visual novo…',
  'loja.alert.goldGranted.cta': 'Aplicar agora',
  'loja.alert.redeemed.title': 'Resgatado!',
  'loja.alert.redeemed.text': '"{title}" resgatado com sucesso.',
  'loja.alert.noBalance.title': 'Saldo insuficiente',
  'loja.alert.noBalance.rewardText': 'Você tem {balance} tokens, mas essa recompensa custa {cost}. Complete mais leituras pra ganhar tokens.',
  'loja.alert.noBalance.brindeText': 'Você tem {balance} tokens, mas esse brinde custa {cost}. Complete as missões diárias e leituras pra ganhar mais.',
  'loja.alert.noBalance.cta': 'Ganhar tokens agora',
  'loja.alert.noBalance.dismiss': 'Agora não',
  'loja.alert.physical.title': 'Quase lá',
  'loja.alert.physical.text': 'Os brindes físicos estão em preparação — nenhum token foi gasto.',

  // Meus Tokens
  'tokens.header.title': 'Meus Tokens',
  'tokens.header.subtitle': 'Sua energia acumulada',
  'tokens.seeShop': 'Ver Loja',
  'tokens.balanceLabel': 'tokens acumulados',
  'tokens.historyTitle': 'Histórico',
  'tokens.empty': 'Nenhuma transação ainda — complete uma leitura pra ganhar seus primeiros tokens!',
  'tokens.emptyCta': 'Fazer uma leitura agora',
  'tokens.history.dateTime': '{date} às {time}',

  // Paywall e portões de casal
  'gate.teaser.title': 'Continue com a assinatura',
  'gate.teaser.price': '$5 USD/mês · 7 dias grátis, sem compromisso',
  'gate.teaser.cta': 'Assinar →',
  'gate.solo.title': 'Isso é pra fazer em casal',
  'gate.solo.text': 'Rotas de reconexão, jogos, ideias de encontro e retrospectiva só fazem sentido com os dois.',
  'gate.solo.cta': 'Assinar agora →',
  'gate.solo.inviteCta': 'ou convide seu par pra desbloquear isso →',

  // Perfil
  'profile.header.title': 'Perfil',
  'profile.soloUniverse': 'Seu universo · {sign}',
  'profile.noCouple': 'Casal ainda não cadastrado',
  'profile.soloInviteHint': 'Convide seu par quando quiser — aba Início',
  'profile.noCoupleHint': 'Complete o quiz do casal na aba Início',
  'profile.section.account': 'Conta',
  'profile.section.preferences': 'Preferências',
  'profile.section.support': 'Suporte',
  'profile.row.email': 'E-mail',
  'profile.row.login': 'Fazer login',
  'profile.row.installApp': 'Instalar app',
  'profile.row.manageSubscription': 'Gerenciar assinatura',
  'profile.row.subscribe': 'Assinar',
  'profile.row.recovering': 'Recuperando...',
  'profile.row.recoverSubscription': 'Recuperar minha assinatura',
  'profile.row.redoQuiz': 'Refazer quiz do casal',
  'profile.row.addPartner': 'Adicionar parceiro(a)',
  'profile.row.sendInvite': 'Enviar convite pra {amor}',
  'profile.row.myTokens': 'Meus Tokens ({count})',
  'profile.row.goldTheme': 'Tema dourado',
  'profile.row.dailyThought': 'Pensamento cósmico diário',
  'profile.row.appVersion': 'Versão do app',
  'profile.pref.language': 'Idioma',
  'profile.name.editTitle': 'Editar nome',
  'profile.name.placeholder': 'Seu nome',
  'profile.name.saving': 'Salvando...',
  'profile.name.save': 'Salvar',
  'profile.name.emptyTitle': 'Nome vazio',
  'profile.name.emptyText': 'Digite um nome antes de salvar.',
  'profile.name.saveErrorTitle': 'Não foi possível salvar',
  'profile.name.saveErrorFallback': 'Tente de novo em instantes.',
  'profile.delete.title': 'Deletar conta',
  'profile.delete.text': 'Isso vai sair da sua conta e apagar os dados salvos neste aparelho (nomes, signos, datas e sequência do casal). A conta de login em si continua existindo — pra removê-la de vez, escreva pra contato@cosmicguide.cloud.',
  'profile.delete.confirmWipe': 'Sair e apagar dados locais',
  'profile.delete.justSignOut': 'Só sair da conta',
  'profile.signOut.title': 'Sair da conta',
  'profile.signOut.text': 'Tem certeza que quer sair?',
  'profile.signOut.confirm': 'Sair',
  'profile.install.iosTitle': 'Instalar no iPhone ou iPad',
  'profile.install.iosText': 'Abra este site no Safari (precisa ser o Safari, não funciona em outro navegador). Toque no ícone de Compartilhar (□↑) na barra inferior, deslize a lista de opções até achar "Adicionar à Tela de Início" e confirme tocando em "Adicionar" no canto superior.',
  'profile.install.genericTitle': 'Instalar o app',
  'profile.install.genericText': 'Abra o menu do navegador e procure por "Instalar app" ou "Adicionar à Tela de Início".',
  'profile.notif.permTitle': 'Permissão necessária',
  'profile.notif.permText': 'Ative as notificações do Cosmic Guide nas configurações do aparelho para receber o pensamento cósmico diário.',
  'profile.recover.successTitle': 'Assinatura recuperada',
  'profile.recover.successText': 'Sua assinatura agora está ligada a esta conta. Você pode entrar por ela em qualquer aparelho.',
  'profile.recover.emptyTitle': 'Nada encontrado neste aparelho',
  'profile.recover.emptyText': 'Não há nenhuma assinatura guardada aqui. Se você assinou em outro celular, entre com a mesma conta que usou lá. Se pagou com outro e-mail, escreva pra contato@cosmicguide.cloud com o comprovante.',
  'profile.recover.otherAccountTitle': 'Essa assinatura já está em outra conta',
  'profile.recover.otherAccountText': 'A assinatura guardada neste aparelho já pertence a outro login. Entre com aquela conta, ou escreva pra contato@cosmicguide.cloud.',
  'profile.recover.errorTitle': 'Não foi possível recuperar agora',
  'profile.recover.errorText': 'Tente de novo em instantes. Se continuar, escreva pra contato@cosmicguide.cloud com o e-mail do pagamento.',

  // Ajuda, privacidade e termos
  'help.header.title': 'Ajuda e suporte',

  'privacy.header.title': 'Privacidade',

  'terms.header.title': 'Termos de uso',

  // Seletor de data compartilhado
  'datePicker.title': 'Selecionar data',
  'datePicker.cancel': 'Cancelar',
  'datePicker.confirm': 'Confirmar',
  'datePicker.month.0': 'Jan',
  'datePicker.month.1': 'Fev',
  'datePicker.month.2': 'Mar',
  'datePicker.month.3': 'Abr',
  'datePicker.month.4': 'Mai',
  'datePicker.month.5': 'Jun',
  'datePicker.month.6': 'Jul',
  'datePicker.month.7': 'Ago',
  'datePicker.month.8': 'Set',
  'datePicker.month.9': 'Out',
  'datePicker.month.10': 'Nov',
  'datePicker.month.11': 'Dez',

  // Compartilhados — erro, cartões, cabeçalho, push
  'errorBoundary.title': 'Algo deu errado',
  'errorBoundary.fallbackMessage': 'Erro inesperado ao carregar o app.',
  'errorBoundary.hint': 'Recarregue a página. Se persistir, avise o suporte.',

  'featureCard.lockedA11y': '{title}, recurso bloqueado, requer assinatura',

  'header.backA11y': 'Voltar',

  'push.errorTitle': 'Não foi possível ativar',

  'common.cancel': 'Cancelar',
  'common.ok': 'OK',

  // "Onde é que fica isso?" — botões que LEVAM em vez de textos que informam.
  // Toda mensagem que pede algo ("complete o quiz", "adicione a hora",
  // "assine", "vá em Perfil") agora nasce com o toque que faz a coisa
  // acontecer. Rótulos sempre no imperativo e concretos, nunca "saiba mais".
  'birthchart.couple.missingDateCta': 'Preencher a data de nascimento',
  'birthchart.fix.timeCta': 'Informar a hora de nascimento',
  'birthchart.fix.timeCoupleCta': 'Refazer o quiz e informar a hora',
  'birthchart.fix.cityCta': 'Escolher a cidade de nascimento',
  'profile.noCoupleCta': 'Fazer o quiz do casal',
  'profile.soloInviteCta': 'Convidar meu par agora',
  'diary.empty.cta': 'Fazer minha primeira leitura',
  'compat.locked.cta': 'Ver os planos',
  'tarot.locked.cta': 'Ver os planos',
  'tarot.dailyLimit.storeCta': 'Comprar Leitura Bônus na Loja',
  'help.faq.couple.cta': 'Fazer o quiz do casal',
  'help.faq.subscription.cta': 'Abrir minha assinatura',
  'support.emailCta': 'Escrever para o suporte',
  'social.empty.findCta': 'Procurar leitores para seguir',
  'social.empty.diaryCta': 'Abrir meu Diário Cósmico',
  'album.drawCta': 'Tirar cartas agora',
  'album.cardHidden': 'Carta ainda não revelada',
  'album.closeHint': 'Toque fora da carta pra fechar',
  'wrapped.empty.readingsCta': 'Fazer uma leitura agora',
  'errorBoundary.reloadCta': 'Recarregar o app',
  'errorBoundary.supportCta': 'Escrever para o suporte',
  'home.notifPrompt.errorOpenPrefsCta': 'Abrir Preferências',
  'login.forgot.cta': 'Esqueci minha senha',
  'login.forgot.sending': 'Enviando o link...',
  'login.forgot.needEmail': 'Digite seu e-mail acima para receber o link de recuperação.',
  'login.forgot.sent': 'Link de recuperação enviado. Confira seu e-mail para criar uma senha nova.',
  'login.openInboxCta': 'Abrir meu e-mail',

  // --- Textos que estavam FIXOS NO JSX (03/08/2026) -------------------------
  // Achado da auditoria: 18 telas ainda tinham frase escrita direto dentro do
  // <Text>, sem passar por t(). Em português ninguém notava; em espanhol e
  // inglês eram ilhas de português no meio da tela — e várias delas são de
  // BOTÃO ("Analisar", "Assinar"), o texto que a pessoa precisa entender pra
  // continuar ou pra pagar. Este lote cobre Diário, Café, Sonhos, Tarô e o
  // card de Missões.
  'diary.insight.original': 'Seu insight original',
  'diary.insight.polished': 'Versão lapidada pela IA',
  'diary.pin.cta': 'Fixar no topo por 7 dias',
  'diary.delete.cta': 'Apagar esta leitura',
  'diary.weekly.cta': 'Ver Insight da Semana',
  'diary.weekly.loading': 'Buscando o fio condutor da sua semana...',
  'diary.close': 'Fechar',
  'diary.empty.waiting': 'Seu diário está esperando sua primeira leitura',
  'coffee.weekly.ready': 'Sua conclusão da semana está pronta',
  'coffee.weekly.cta': 'Ver conclusão da semana',
  'coffee.close': 'Fechar',
  'coffee.takePhoto': 'Tirar foto',
  'coffee.pickPhoto': 'Escolher da galeria',
  'coffee.analyzing': 'Analisando…',
  'coffee.analyze': 'Analisar',
  'coffee.changePhoto': 'Trocar foto',
  'coffee.subscribe': 'Assinar →',
  'coffee.newReading': 'Nova leitura',
  'dream.interpreting': 'Interpretando…',
  'dream.interpret': 'Interpretar',
  'dream.subscribe': 'Assinar →',
  'dream.new': 'Novo sonho',
  'tarot.subtitle': 'Tarô que não dourá a pílula — Passado · Presente · Futuro',
  'tarot.album': 'Álbum',
  'tarot.tap': 'Toque',
  'missions.today': 'Missões de hoje',
  'missions.storeLink': 'trocar tokens por recompensas na Loja',
};

const ES = {
  // Onboarding — a escolha "só eu / eu e meu par", 1ª tela de quem chega pelo link
  'onboarding.headerTitle': 'Nueve lecturas.\nLa primera de cada una, gratis.',
  'onboarding.headerSub': 'Horóscopo, carta astral, tarot, sueños, palma de la mano, poso de café y más. Sin tarjeta para empezar.',
  'onboarding.solo.title': 'Para mí',
  'onboarding.solo.desc': 'El cielo de hoy, tu carta natal, las cartas, lo que cuentan tu mano y tus sueños. La primera lectura de cada una es tuya.',
  'onboarding.couple.title': 'Mi pareja y yo',
  'onboarding.couple.desc': 'Descubran juntos su energía y su compatibilidad.',
  'onboarding.cta': 'Comenzar',
  'onboarding.back': 'Volver',
  'onboarding.pickerTitle': '¿Cuál es tu signo?',
  'onboarding.saveError': 'No pudimos guardar tu signo. Inténtalo de nuevo.',

  // Login e criação de conta
  'login.mode.signIn': 'Iniciar sesión',
  'login.mode.signUp': 'Crear cuenta',
  'login.emailLabel': 'Correo electrónico',
  'login.emailPlaceholder': 'tucorreo@ejemplo.com',
  'login.passwordLabel': 'Contraseña',
  'login.showPassword': 'Mostrar contraseña',
  'login.hidePassword': 'Ocultar contraseña',
  'login.errorEmptyFields': 'Completa el correo y la contraseña.',
  'login.infoConfirmEmail': '¡Cuenta creada! Revisa tu correo para confirmarla antes de entrar.',
  'login.divider': 'o',
  'login.google': 'Continuar con Google',
  'login.switchToSignUp': '¿No tienes cuenta? Crea una',
  'login.switchToSignIn': '¿Ya tienes cuenta? Inicia sesión',
  'login.checkoutSubtitle': 'El plan que elegiste está guardado — inicia sesión o crea tu cuenta para continuar.',

  // Home
  'home.greetingCouple': 'Hola, {voce} & {amor}',
  'home.greetingSolo': 'Hola, {sign}',
  // ver a nota em 'home.compatPercent' no bloco PT: o valor vivo está no fim
  'home.compatSeeMore': 'Ver compatibilidad completa',
  'home.compatTitleEmpty': 'Compatibilidad de pareja',
  'home.compatSubtitleEmpty': 'Aún no calculada',
  'home.compatTextEmpty': 'Invita a tu pareja para descubrir la compatibilidad entre sus signos y seguir la racha diaria.',
  'home.compatLinkEmpty': 'Invitar a mi pareja',
  'home.lovePhrase.label': 'Frase del día para compartir',
  'home.lovePhrase.share': 'Compartir',
  'home.thought.label': 'Pensamiento cósmico del día',
  'home.thought.unread': '✨ Lee el de hoy',
  'home.thought.readToday': '✓ Leído hoy',
  'home.thought.expand': 'Leer completo ↓',
  'home.thought.collapse': 'Mostrar menos ↑',
  'home.notifPrompt.title': '¿Quieres el pensamiento cósmico cada día?',
  'home.notifPrompt.text': 'Una notificación al día, con el cielo del día para tu signo. Sin spam.',
  'home.notifPrompt.cta': 'Activar',
  'home.notifPrompt.later': 'Ahora no',
  'home.sectionExplore': 'Explora el cosmos',
  'home.sectionExploreSubtitle': 'Solo o en pareja — suscríbete y usa sin límite',
  'home.sectionPraticas': 'Prácticas',
  'home.sectionPraticasSubtitle': 'Cosas que se hacen con la mano, el cuerpo y el tiempo marcado',
  'home.sectionDatas': 'Fechas del cielo',
  'home.sectionDatasSubtitle': 'Lo que el cielo hace este mes, con día y hora',
  'home.sectionCuriosidades': 'Curiosidades',
  'home.sectionCuriosidadesSubtitle': 'Historia con fuente y cosas hechas para compartir',
  'home.sectionCouple': 'Recursos de pareja',
  'home.sectionCoupleSubtitle': 'Solo se desbloquean formando una pareja en la app',
  'home.sectionCosmicEvent': 'Evento cósmico',
  'home.cosmicEventTitle': '{planetA} en {aspect} con {planetB}',
  'home.cosmicEventTitleEmpty': 'Cielo tranquilo hoy — ninguna conversación fuerte entre planetas',
  'home.cosmicEventDesc': 'Dos planetas están conversando en el cielo de hoy — eso es lo que la astrología llama aspecto. Y es real: calculado por la posición exacta de los planetas, a {orb}° del ángulo exacto (el "orbe").',
  'home.cosmicEventDescEmpty': 'Ningún par de planetas conversando de cerca ahora. En términos técnicos: los planetas clásicos no tienen aspectos mayores (los cinco ángulos principales) en orbe estrecho (muy cerca del ángulo exacto) en el cielo de hoy.',
  'home.cosmicEventDate': 'Hoy · {date}',
  'home.card.horoscope.title': 'Horóscopo',
  'home.card.horoscope.subtitle': 'Predicción diaria',
  'home.card.birthchart.title': 'Carta Astral',
  'home.card.birthchart.subtitle': 'Sol, Luna y Ascendente',
  'home.card.tarot.title': 'Tarot por Tema',
  'home.card.tarot.subtitle': 'Pasado · Futuro',
  'home.card.compatibility.title': 'Compatibilidad',
  'home.card.compatibility.subtitle': 'Match celestial',
  'home.card.timeline.title': 'Línea de Tiempo',
  'home.card.timeline.subtitle': 'Recuerdos de pareja',
  'home.card.reconectar.title': 'Reconectar',
  'home.card.reconectar.subtitle': 'Fortalezcan el vínculo',
  'home.card.descobrir.title': 'Descubrir',
  'home.card.descobrir.subtitle': 'Conózcanse más',
  'home.card.agir.title': 'Actuar',
  'home.card.agir.subtitle': 'Pequeños gestos',
  'home.card.progresso.title': 'Progreso',
  'home.card.progresso.subtitle': 'Racha y logros',
  'home.card.retrospectiva.title': 'Retrospectiva',
  'home.card.retrospectiva.subtitle': 'El año de ustedes',
  'home.card.dream.title': 'Sueños',
  'home.card.dream.subtitle': 'Interpreta ya',
  'home.card.lunarCalendar.title': 'Calendario Lunar',
  'home.card.lunarCalendar.subtitle': 'Fase lunar de hoy',
  'home.card.palm.title': 'Lectura de Palma',
  'home.card.palm.subtitle': 'Tu mano revela',
  'home.card.coffee.title': 'Ritual del Café',
  'home.card.coffee.subtitle': 'Borra mística',
  'home.card.chat.title': 'Chat Espiritual',
  'home.card.chat.subtitle': 'Consejo rápido',
  'home.card.diary.title': 'Diario Cósmico',
  'home.card.diary.subtitle': 'Tus lecturas guardadas',
  'home.card.social.title': 'Feed Social',
  'home.card.social.subtitle': 'Otros lectores',
  'home.milestone.title': '¡{days} días seguidos!',
  'home.milestone.bonus': '+{tokens} tokens de bonus',
  'home.milestone.offer': 'Celebrar con 7 días gratis de suscripción →',
  'home.milestone.continue': 'Continuar',
  'home.streak.count_one': '🔥 {count} día seguido',
  'home.streak.count_other': '🔥 {count} días seguidos',
  'home.streak.empty': 'Comienza tu racha hoy',
  'home.goal.label': 'Meta de la semana',
  'home.goal.done': 'Cumplida: ',
  'home.goal.empty': 'Todavía no definieron una meta para esta semana',
  'home.wrapped.title': 'Tu Retrospectiva Cósmica llegó',
  'home.wrapped.subtitle': 'El resumen de tu mes — para ver y compartir',
  'home.sky.label': 'El cielo de hoy para ti',
  'home.sky.inviteText': 'Ingresa tu fecha de nacimiento en la Carta Astral y mira, cada día, cómo el cielo de hoy toca TU carta — no la de todo el mundo.',
  'home.sky.inviteCta': 'Completar mi Carta Astral →',
  'home.sky.moreAspects': '+{count} aspecto(s) (conversaciones de planetas) en tu cielo hoy — suscríbete para ver →',
  'home.hero.streak.count_one': '{count} día seguido',
  'home.hero.streak.count_other': '{count} días seguidos',
  'home.hero.streak.empty': '✨ Comiencen hoy su racha juntos',
  'home.notifPrompt.errorTitle': 'No se pudo activar',
  'home.notifPrompt.errorHint': 'Después de resolverlo, actívalo en Perfil > Pensamiento cósmico diario.',
  'home.week.mon': 'L',
  'home.week.tue': 'M',
  'home.week.wed': 'X',
  'home.week.thu': 'J',
  'home.week.fri': 'V',
  'home.week.sat': 'S',
  'home.week.sun': 'D',

  // Quiz do casal
  'quiz.headerTitle': 'Quiz de Pareja',
  'quiz.headerSubtitle': 'Paso {step} de {total} · {stepName}',
  'quiz.step.voces': 'Ustedes',
  'quiz.step.signoNascimento': 'Signo y Nacimiento',
  'quiz.step.energia': 'Energía',
  'quiz.step.cartas': 'Cartas',
  'quiz.step.astros': 'Astros',
  'quiz.hero.eyebrow': 'Astrología de pareja',
  'quiz.hero.title': 'Trío Cósmico de Pareja',
  'quiz.hero.gold': 'en construcción',
  'quiz.hero.sub': 'Sol + Ascendente + Luna. Cartas. Compatibilidad de pareja. El mapa cósmico de ustedes, completo.',
  'quiz.names.title': '¿Cómo se llaman?',
  'quiz.names.yourName': 'Tu nombre',
  'quiz.names.yourNamePlaceholder': 'Ej.: Ana',
  'quiz.names.partnerName': 'Nombre de tu amor',
  'quiz.names.partnerNamePlaceholder': 'Ej.: Leo',
  'quiz.energy.title': '{voce} y {amor}: ¿cuál es la energía de ustedes ahora?',
  'quiz.cards.title': '{voce} y {amor}, elijan 3 cartas',
  'quiz.cards.progress': 'Ahora elijan la carta del {position} · {count}/3',
  'quiz.cards.done': 'El pasado, el presente y el futuro de {voce} & {amor} ya están sobre la mesa.',
  'quiz.cards.position.past': 'Pasado',
  'quiz.cards.position.present': 'Presente',
  'quiz.cards.position.future': 'Futuro',
  'quiz.nav.continue': 'Continuar',
  'quiz.nav.seeReveal': 'Ver la revelación',
  'quiz.nav.saving': 'Guardando…',
  'quiz.nav.saveAndSee': 'Guardar y ver nuestro comienzo →',
  'quiz.datePicker.title': 'Fecha de nacimiento',
  'quiz.datePicker.cancel': 'Cancelar',
  'quiz.datePicker.confirm': 'Confirmar',
  'quiz.datePicker.month.jan': 'Ene',
  'quiz.datePicker.month.feb': 'Feb',
  'quiz.datePicker.month.mar': 'Mar',
  'quiz.datePicker.month.apr': 'Abr',
  'quiz.datePicker.month.may': 'May',
  'quiz.datePicker.month.jun': 'Jun',
  'quiz.datePicker.month.jul': 'Jul',
  'quiz.datePicker.month.aug': 'Ago',
  'quiz.datePicker.month.sep': 'Sep',
  'quiz.datePicker.month.oct': 'Oct',
  'quiz.datePicker.month.nov': 'Nov',
  'quiz.datePicker.month.dec': 'Dic',
  'quiz.fallback.voce': 'ti',
  'quiz.fallback.voces': 'ustedes',
  'quiz.fallback.seuAmor': 'tu amor',
  'quiz.aviso.needYourName': 'Escribe tu nombre para continuar.',
  'quiz.aviso.needPartnerName': 'Falta el nombre de tu amor.',
  'quiz.aviso.needBirthDate': 'Falta la fecha de nacimiento de {name}.',
  'quiz.aviso.checkDates': 'Revisa las fechas — no pudimos calcular el signo.',
  'quiz.aviso.chooseEnergy': 'Elijan la energía de ustedes ahora.',
  'quiz.aviso.pickCards_one': 'Elijan 3 cartas — falta {missing}.',
  'quiz.aviso.pickCards_other': 'Elijan 3 cartas — faltan {missing}.',
  'quiz.aviso.fillStep': 'Completa esta etapa para continuar.',
  'quiz.aviso.saveFailed': 'No se pudo guardar. Inténtalo de nuevo.',
  'quiz.loading.readingSky': 'Leyendo el cielo de {voce} & {amor}…',
  'quiz.loading.crossing': 'Cruzando {signoVoce} con {signoAmor}…',
  'quiz.loading.tracing': 'Trazando el mapa de ustedes…',
  'quiz.birth.title': 'Fecha de nacimiento de cada uno',
  'quiz.birth.subtitle': 'Con la fecha ya sabemos el signo de cada uno. La hora es opcional — pero revela el Ascendente.',
  'quiz.birth.dateOf': 'Fecha de {name}',
  'quiz.birth.timeOf': 'Hora de {name} (opcional)',
  'quiz.birth.cityOf': 'Ciudad de nacimiento de {name} (opcional)',
  'quiz.birth.selectDate': 'Seleccionar fecha',
  'quiz.birth.selectCity': 'Seleccionar ciudad',
  'quiz.birth.signOf': 'Signo de {name}:',
  'quiz.birth.hide': 'ocultar',
  'quiz.birth.notThisSign': 'ese no es el signo',
  'quiz.energy.option.romantica': 'Romántica 💕',
  'quiz.energy.echo.romantica': 'Se nota — este mapa va a mostrar de dónde nace esa chispa.',
  'quiz.energy.option.apaixonada': 'Apasionada 🔥',
  'quiz.energy.echo.apaixonada': 'Intensa. Vamos a ver qué sostiene eso cuando la llama baje.',
  'quiz.energy.option.poderosa': 'Poderosa ⚡',
  'quiz.energy.echo.poderosa': 'Dos fuerzas juntas. Ese poder también necesita cuidado.',
  'quiz.energy.option.reflexiva': 'Reflexiva 🌙',
  'quiz.energy.echo.reflexiva': 'Un momento de mirar hacia dentro, los dos.',
  'quiz.energy.option.distantes': 'Distantes 🌫️',
  'quiz.energy.echo.distantes': 'La distancia también tiene mapa — y camino de vuelta, juntos.',
  'quiz.energy.option.conflito': 'En conflicto 😔',
  'quiz.energy.echo.conflito': 'Ustedes están aquí, juntos, buscando esto. Eso ya dice mucho.',
  'quiz.energy.option.crise': 'En crisis 💔',
  'quiz.energy.echo.crise': 'Momentos así aprietan. Que estén los dos aquí ya es un buen comienzo.',
  'quiz.energy.option.recomecando': 'Recomenzando 🌱',
  'quiz.energy.echo.recomecando': 'Recomenzar es valiente. Vamos a empezar por el cielo de ustedes.',
  'quiz.reveal.energyOf': 'La energía de {voce} & {amor}',
  'quiz.reveal.compatBadge': 'compatibilidad de pareja',
  'quiz.reveal.affinity': 'Afinidad entre sus elementos ({elementoA} + {elementoB}) · lectura astrológica, por diversión',
  'quiz.reveal.strongHigh': 'Elementos que se encienden: {forte}',
  'quiz.reveal.strongMid': 'Se equilibran bien: {forte}',
  'quiz.reveal.strongLow': 'Diferentes y magnéticos: {forte}',
  'quiz.reveal.elementBadge': 'Elemento {element}',
  'quiz.reveal.strongPointLabel': 'El punto fuerte de ustedes:',
  'quiz.reveal.careLabel': 'Un cuidado especial:',
  'quiz.reveal.energyNow': 'Y la energía de ustedes ahora — "{desejo}" — combina con este momento. 💛',
  'quiz.reveal.trioTitle': 'Sol · Luna · Ascendente',
  'quiz.reveal.moonLine': ': la Luna en {sign} {need}.',
  'quiz.reveal.moonNeed.fogo': 'necesita chispa y movimiento para sentirse en casa',
  'quiz.reveal.moonNeed.terra': 'necesita constancia y gestos concretos para sentirse en paz',
  'quiz.reveal.moonNeed.ar': 'necesita conversar y entender para sentirse cerca',
  'quiz.reveal.moonNeed.agua': 'necesita ternura y contacto para sentirse seguro(a)',
  'quiz.reveal.moonsSame': 'Sus Lunas piden lo mismo: se calman de forma parecida — ahí está un refugio de ustedes.',
  'quiz.reveal.moonsDiff': 'Sus Lunas piden cosas diferentes: de ahí nacen casi todos los malentendidos… y también la salida.',
  'quiz.reveal.ascLine': ': Ascendente en {sign} {emoji}.',
  'quiz.reveal.ascPrecision': 'El Ascendente usa la hora exacta y la ciudad de nacimiento de cada uno — cuanto más precisos esos datos, más confiable el resultado. Una pequeña diferencia de horario puede cambiar el signo del Ascendente.',
  'quiz.reveal.ascTeaser': 'El Ascendente — la primera impresión que dan y la coraza que usan bajo presión — se calcula con la hora y la ciudad de nacimiento. Es una de las partes que se abren dentro de la app.',
  'quiz.reveal.cardsTitle': 'Las cartas de ustedes',
  'quiz.reveal.cosmicNumbers': 'Números cósmicos de la pareja',
  'quiz.reveal.goldenHour': '✷ La hora dorada de ustedes: {time} ✷',
  'quiz.reveal.readingFooter': 'Lectura de {voce} & {amor} — hecha hoy. Nadie eligió esto por ustedes: ustedes empezaron esto, hoy, juntos. Lo que viene después se escribe con lo que hagan de aquí en adelante.',
  'quiz.reveal.todayTitle': 'Esa fue la lectura de hoy 💫',
  'quiz.reveal.todayText': 'La carta astral completa de la pareja — con más capas sobre cómo se comunican y se acercan — se sigue construyendo ahora, en el panel de ustedes.',
  'quiz.nav.back': 'Volver',

  // Horóscopo — textos sorteados por hash (o sorteio usa só o length, não muda por idioma)
  'horoscope.tab.yesterday': 'Ayer',
  'horoscope.tab.today': 'Hoy',
  'horoscope.tab.tomorrow': 'Mañana',
  'horoscope.elementName.fogo': 'Fuego',
  'horoscope.elementName.terra': 'Tierra',
  'horoscope.elementName.ar': 'Aire',
  'horoscope.elementName.agua': 'Agua',
  'horoscope.diary.title': 'Horóscopo de {sign} — hoy',
  'horoscope.pickerTitle': 'Elige tu signo',
  'horoscope.element': 'Elemento {element}',
  'horoscope.areasTitle': 'Áreas de tu vida',
  'horoscope.area.amor': 'Amor',
  'horoscope.area.trabalho': 'Trabajo',
  'horoscope.area.saude': 'Salud',
  'horoscope.area.dinheiro': 'Dinero',
  'horoscope.luckTitle': 'Tu suerte hoy',
  'horoscope.luck.color': 'Color',
  'horoscope.luck.number': 'Número',
  'horoscope.luck.hour': 'Hora',
  'horoscope.luck.colorName.violeta': 'Violeta',
  'horoscope.luck.colorName.rosa': 'Rosa',
  'horoscope.luck.colorName.dourado': 'Dorado',
  'horoscope.luck.colorName.turquesa': 'Turquesa',
  'horoscope.luck.colorName.verde': 'Verde',
  'horoscope.luck.colorName.ambar': 'Ámbar',
  'horoscope.luck.colorName.vermelho': 'Rojo',
  'horoscope.luck.colorName.azul': 'Azul',
  'horoscope.reading.ontem.1': 'La energía de ayer trajo reflexiones importantes sobre tus vínculos. Lo que quedó pendiente pide una resolución calmada. La Luna menguante favoreció el cierre de ciclos.',
  'horoscope.reading.ontem.2': 'Ayer fue un día de mirar hacia dentro. Una conversación dejó lecciones valiosas, aunque el momento haya sido incómodo. Lo que pasó ya cumplió su papel.',
  'horoscope.reading.ontem.3': 'El día de ayer pidió paciencia contigo mismo(a). Pequeños roces revelaron lo que necesita más atención esta semana. Nada se perdió, solo maduró.',
  'horoscope.reading.ontem.4': 'Ayer trajo una invitación silenciosa a soltar lo que ya no sirve. La energía de Marte todavía resonaba en decisiones rápidas, pero la calma ganó al final del día.',
  'horoscope.reading.ontem.5': 'La Luna de ayer favoreció los recuerdos y los reencuentros. Algo del pasado volvió a tu mente para ser finalmente comprendido, no revivido.',
  'horoscope.reading.ontem.6': 'Ayer exigió organización y método. Tareas atascadas empezaron a moverse, aunque el ritmo haya parecido demasiado lento para tu gusto.',
  'horoscope.reading.ontem.7': 'El cielo de ayer trajo claridad sobre un sentimiento que venías evitando nombrar. Encararlo fue el primer paso para pasar la página.',
  'horoscope.reading.ontem.8': 'Ayer fue propicio para ajustar expectativas. Lo que parecía urgente perdió fuerza en cuanto respiraste hondo y lo miraste con más distancia.',
  'horoscope.reading.hoje.1': 'El cielo de hoy pide coraje para decirle sí a lo nuevo. Venus ilumina tus relaciones y trae suavidad a las conversaciones difíciles. Confía en tu intuición — rara vez falla. Es un buen día para iniciar proyectos que involucren creatividad y conexión.',
  'horoscope.reading.hoje.2': 'Hoy el día pide foco y menos dispersión. Mercurio favorece las conversaciones directas, así que aprovecha para resolver lo que te viene quitando el sueño.',
  'horoscope.reading.hoje.3': 'El sol de hoy ilumina tu autoconfianza. Es un buen momento para posicionarte sobre algo que venías postergando por miedo al juicio ajeno.',
  'horoscope.reading.hoje.4': 'Hoy tu intuición está más afilada de lo normal. Presta atención a las pequeñas señales — suelen apuntar en la dirección correcta.',
  'horoscope.reading.hoje.5': 'El día de hoy favorece las alianzas. Un intercambio sincero puede destrabar algo que estaba atascado hace tiempo, en el trabajo o en casa.',
  'horoscope.reading.hoje.6': 'Hoy pide ligereza. No fuerces respuestas: algunas cosas se resuelven solas cuando dejas de empujar tanto.',
  'horoscope.reading.hoje.7': 'El cielo de hoy entibia las relaciones cercanas. Vale la pena reservar un tiempo para quien importa, aunque la agenda esté llena.',
  'horoscope.reading.hoje.8': 'Hoy es un día de ajustes finos. Pequeños cambios de rutina rinden más que grandes decisiones tomadas a las apuradas.',
  'horoscope.reading.amanha.1': 'Mañana Mercurio favorece las decisiones prácticas. Una oportunidad profesional puede surgir de donde menos lo esperas. Mantén los ojos abiertos y el corazón ligero.',
  'horoscope.reading.amanha.2': 'Mañana tiende a exigir paciencia con los plazos. Una noticia inesperada puede reorganizar tus planes — tómalo como un ajuste, no como un obstáculo.',
  'horoscope.reading.amanha.3': 'El día de mañana favorece las conversaciones francas. Si hay algo pendiente por decirle a alguien, ese puede ser el momento justo.',
  'horoscope.reading.amanha.4': 'Mañana la Luna favorece el descanso. Vale la pena desacelerar antes de tomar decisiones importantes que pueden esperar un día más.',
  'horoscope.reading.amanha.5': 'Mañana promete movimiento en las finanzas. Un gasto o un ingreso inesperado pide una atención redoblada a la planificación.',
  'horoscope.reading.amanha.6': 'El cielo de mañana abre espacio para recomienzos pequeños. No hace falta un gran gesto — un paso simple ya cambia el rumbo del día.',
  'horoscope.reading.amanha.7': 'Mañana tiende a traer claridad sobre un dilema reciente. La respuesta puede no ser la que esperabas, pero será la más honesta.',
  'horoscope.reading.amanha.8': 'Mañana favorece la creatividad. Si algo se traba en el modo tradicional, vale la pena probar un camino distinto al habitual.',

  // Mapa Astral
  'birthchart.row.sun.label': 'Sol',
  'birthchart.row.sun.desc': 'Tu esencia y tu identidad',
  'birthchart.row.sun.missing': 'Ingresa la fecha de nacimiento para calcular.',
  'birthchart.row.moon.label': 'Luna',
  'birthchart.row.moon.desc': 'Tus emociones y tus instintos',
  'birthchart.row.moon.missing': 'No se pudo calcular la Luna ahora.',
  'birthchart.row.asc.label': 'Ascendente',
  'birthchart.row.asc.desc': 'Cómo te ve el mundo',
  'birthchart.row.asc.missing': 'El Ascendente pide hora exacta y ciudad de nacimiento — añade las dos para descubrirlo.',
  'birthchart.noTime': 'hora no indicada',
  'birthchart.positions': 'Posiciones',
  'birthchart.positionIn': '{label} en {sign}',

  // Agir — ideias de encontro, desafio de 7 dias, gesto do dia e meta da semana
  'agir.empty.title': 'Completen primero el quiz de pareja',
  'agir.empty.desc': 'Necesitamos saber sus nombres para guardar las ideas, los desafíos y las metas en el lugar correcto.',
  'agir.empty.cta': 'Hacer el quiz de pareja',
  'agir.ideas.title': 'Idea para una cita',
  'agir.ideas.subtitle': '¿Sin tiempo para pensar? Dejen que les sugiramos.',
  'agir.ideas.prioritize': 'Priorizar ideas para su lenguaje del amor: {lang}',
  'agir.ideas.draw': 'Sortear una idea ✨',
  'agir.ideas.inFavs': '💛 En favoritas',
  'agir.ideas.addFav': '🤍 Añadir a favoritas',
  'agir.ideas.emptyFavTitle': 'Todavía no hay favoritas',
  'agir.ideas.emptyFavDesc': 'Sorteen una idea y guarden aquí las que más les gusten.',
  'agir.ideas.emptyFavCta': 'Sortear una idea ahora',
  'agir.ideas.favCount': 'Favoritas ({count})',
  'agir.ideas.tag.casa': 'en casa',
  'agir.ideas.tag.arLivre': 'al aire libre',
  'agir.ideas.tag.economico': 'económico',
  'agir.ideas.tag.especial': 'especial',
  'agir.ideas.i1': 'Noche de cine en casa: cada uno elige una película y el otro prepara las palomitas.',
  'agir.ideas.i2': 'Cocinen juntos una receta nueva que ninguno de los dos haya hecho antes.',
  'agir.ideas.i3': 'Picnic en el suelo del salón, luces apagadas y velas encendidas.',
  'agir.ideas.i4': 'Tarde de juegos: cartas, mesa o videojuegos, con un mimo de premio.',
  'agir.ideas.i5': 'Caminata al atardecer por un lugar donde nunca hayan estado juntos.',
  'agir.ideas.i6': 'Lleven un café y siéntense en un banco de la plaza a ver pasar el día.',
  'agir.ideas.i7': 'Anden en bicicleta por un parque en una mañana soleada.',
  'agir.ideas.i8': 'Túmbense en el césped de noche e intenten encontrar constelaciones juntos.',
  'agir.ideas.i9': 'Vayan a un mercado local: compren ingredientes e improvisen una cena.',
  'agir.ideas.i10': 'Visiten una librería y regálense el uno al otro un libro baratito.',
  'agir.ideas.i11': 'Den un paseo a pie por el barrio, fingiendo ser turistas en su propia ciudad.',
  'agir.ideas.i12': 'Tarde de helado: prueben un sabor que ninguno de los dos pediría solo.',
  'agir.ideas.i13': 'Recreen su primera cita, exactamente como fue.',
  'agir.ideas.i14': 'Escríbanse una carta el uno al otro e intercámbienlas a la hora de la cena.',
  'agir.ideas.i15': 'Planeen juntos una micro-escapada de un día para el mes que viene.',
  'agir.lang.palavras': 'palabras de afirmación',
  'agir.lang.tempo': 'tiempo de calidad',
  'agir.lang.presentes': 'regalos',
  'agir.lang.servico': 'actos de servicio',
  'agir.lang.toque': 'toque físico',
  'agir.challenge.title': 'Desafío de 7 días',
  'agir.challenge.subtitle': 'Un gesto por día. A su ritmo, vayan marcando a medida que los hagan.',
  'agir.challenge.day': 'Día {n}. ',
  'agir.challenge.complete': '¡Desafío completo! {voce} y {amor} se animaron a 7 días de gestos. 💛',
  'agir.challenge.d1': 'Manda un mensaje diciendo algo que admiras de él/ella.',
  'agir.challenge.d2': 'Den un abrazo de 20 segundos, sin prisa.',
  'agir.challenge.d3': 'Haz una pregunta que nunca hiciste antes y escucha de verdad.',
  'agir.challenge.d4': 'Encárgate de una tarea que suele ser del otro, sin pedir nada a cambio.',
  'agir.challenge.d5': 'Recuerden juntos un buen momento que vivieron.',
  'agir.challenge.d6': 'Elogia algo pequeño que suele pasar desapercibido.',
  'agir.challenge.d7': 'Planeen juntos algo simple para hacer la próxima semana.',
  'agir.gesture.title': 'Gesto del día',
  'agir.gesture.subtitle': 'Una idea simple, una por día — la misma para los dos hoy.',
  'agir.gesture.g1': 'Prepara el café o una merienda exactamente como a él/ella le gusta.',
  'agir.gesture.g2': 'Manda un mensaje a media mañana solo para decir que te acordaste de él/ella.',
  'agir.gesture.g3': 'Guarden 10 minutos sin móvil solo para hablar mirándose a los ojos.',
  'agir.gesture.g4': 'Haz un elogio sincero sobre algo más allá de lo físico.',
  'agir.gesture.g5': 'Deja una notita cariñosa donde él/ella la vaya a encontrar.',
  'agir.gesture.g6': 'Ofrece una caricia en la cabeza o en la espalda, sin motivo alguno.',
  'agir.gesture.g7': 'Pregunta cómo fue su día y escucha sin interrumpir.',
  'agir.gesture.g8': 'Encárgate de una pequeña tarea de casa para aliviarle el día.',
  'agir.gesture.g9': 'Recuerda un momento divertido que vivieron juntos.',
  'agir.gesture.g10': 'Agradece algo específico que él/ella haya hecho recientemente.',
  'agir.goal.title': 'Meta de la semana',
  'agir.goal.subtitle': 'Acuerden algo para cuidar juntos esta semana.',
  'agir.goal.label': 'Nuestra meta',
  'agir.goal.placeholder': 'Ej.: Cenar sin móvil dos veces esta semana',
  'agir.goal.save': 'Guardar meta',

  // Descobrir — linguagem do amor, estilo de apego e conflitos
  'descobrir.empty.title': 'Completen primero el quiz de pareja',
  'descobrir.empty.desc': 'Necesitamos saber sus nombres para guardar los resultados en el lugar correcto.',
  'descobrir.empty.cta': 'Hacer el quiz de pareja',
  'descobrir.intro': 'Dos tests rápidos para que {voce} y {amor} abran una buena conversación. No hay respuestas correctas ni incorrectas — solo una invitación a entenderse con más cariño.',
  'descobrir.disclaimer': 'Esto es una reflexión para que conversen, no un diagnóstico. Nadie se resume a una etiqueta — y estas formas de amar y de vincularse pueden cambiar y crecer con el tiempo.',
  'descobrir.tab.linguagem': 'Lenguaje del amor',
  'descobrir.tab.apego': 'Estilo de apego',
  'descobrir.tab.conflitos': 'Conflictos',
  'descobrir.quiz.dica': 'Consejo',
  'descobrir.quiz.balance': 'Así quedó el balance de ustedes',
  'descobrir.quiz.redo': 'Rehacer',
  'descobrir.quiz.progress': 'Pregunta {step} de {total}',
  'descobrir.quiz.back': 'Volver',
  'descobrir.quiz.next': 'Siguiente',
  'descobrir.quiz.seeResult': 'Ver resultado',
  'descobrir.lang.badge': 'El lenguaje principal de {name}',
  'descobrir.lang.label.palavras': 'Palabras de afirmación',
  'descobrir.lang.label.tempo': 'Tiempo de calidad',
  'descobrir.lang.label.presentes': 'Regalos',
  'descobrir.lang.label.servico': 'Actos de servicio',
  'descobrir.lang.label.toque': 'Toque físico',
  'descobrir.lang.q1': '¿Qué es lo que más te hace sentir amado(a) en el día a día?',
  'descobrir.lang.q1.opt.palavras': 'Escuchar un elogio sincero o un "gracias" de verdad',
  'descobrir.lang.q1.opt.tempo': 'Pasar un tiempo que sea solo nuestro, sin prisa y sin móvil',
  'descobrir.lang.q1.opt.presentes': 'Recibir un detalle que muestre que pensaron en mí',
  'descobrir.lang.q1.opt.servico': 'Que alguien resuelva algo por mí antes incluso de que lo pida',
  'descobrir.lang.q1.opt.toque': 'Un abrazo fuerte o ir de la mano',
  'descobrir.lang.q2': 'Después de un día difícil, ¿qué es lo que más te reconforta?',
  'descobrir.lang.q2.opt.palavras': 'Escuchar "estoy contigo, todo va a estar bien"',
  'descobrir.lang.q2.opt.tempo': 'Sentarnos juntos y hablar con calma sobre todo',
  'descobrir.lang.q2.opt.presentes': 'Llegar a casa y encontrar un detalle esperándome',
  'descobrir.lang.q2.opt.servico': 'Que alguien se haya encargado de una tarea que era mía',
  'descobrir.lang.q2.opt.toque': 'Un abrazo largo, una caricia en la cabeza, sentirme arropado(a)',
  'descobrir.lang.q3': '¿Cómo sueles demostrar cariño a quien amas?',
  'descobrir.lang.q3.opt.palavras': 'Diciendo con todas las letras cuánto admiro a esa persona',
  'descobrir.lang.q3.opt.tempo': 'Reservando un tiempo solo para estar juntos',
  'descobrir.lang.q3.opt.presentes': 'Eligiendo regalos con significado',
  'descobrir.lang.q3.opt.servico': 'Haciendo cosas prácticas que le facilitan la vida',
  'descobrir.lang.q3.opt.toque': 'Con abrazos, besos y cercanía',
  'descobrir.lang.q4': '¿Cómo sería tu fin de semana ideal en pareja?',
  'descobrir.lang.q4.opt.palavras': 'Compartiendo muchas buenas conversaciones y palabras cariñosas',
  'descobrir.lang.q4.opt.tempo': 'Un plan tranquilo, con atención total el uno en el otro',
  'descobrir.lang.q4.opt.presentes': 'Una pequeña sorpresa o un intercambio simple de regalos',
  'descobrir.lang.q4.opt.servico': 'Resolver la casa juntos y después relajarnos sin preocupaciones',
  'descobrir.lang.q4.opt.toque': 'Mucho mimo, desde el desayuno en la cama hasta una película abrazados',
  'descobrir.lang.q5': 'Cuando están lejos, ¿qué es lo que más extrañas?',
  'descobrir.lang.q5.opt.palavras': 'De los mensajes cariñosos y del "buenos días, mi amor"',
  'descobrir.lang.q5.opt.tempo': 'De nuestras conversaciones sin hora de terminar',
  'descobrir.lang.q5.opt.presentes': 'De recibir (y mandar) ese detalle a la distancia',
  'descobrir.lang.q5.opt.servico': 'De tener a alguien con quien repartir las tareas del día',
  'descobrir.lang.q5.opt.toque': 'Del abrazo y de simplemente estar cerquita',
  'descobrir.lang.q6': '¿Qué gesto de tu amor te toca más hondo?',
  'descobrir.lang.q6.opt.palavras': 'Cuando nota algo en mí y lo dice en voz alta',
  'descobrir.lang.q6.opt.tempo': 'Cuando deja todo solo para prestarme atención',
  'descobrir.lang.q6.opt.presentes': 'Cuando guarda un detalle y lo convierte en regalo',
  'descobrir.lang.q6.opt.servico': 'Cuando actúa para aliviarme un peso sin que yo lo pida',
  'descobrir.lang.q6.opt.toque': 'Cuando me acerca hacia sí en un momento inesperado',
  'descobrir.lang.result.palavras.texto': 'Floreces cuando el amor se vuelve palabra: un elogio sincero, un "estoy orgulloso(a) de ti", una nota inesperada. Escuchar en voz alta que eres amado(a) te da seguridad y te calienta el día. El reconocimiento, para ti, es una forma concreta de cuidado.',
  'descobrir.lang.result.palavras.dica': 'Consejo para ustedes: acuerden decirse, cada noche, algo que admiraron el uno del otro ese día — también vale por mensaje.',
  'descobrir.lang.result.tempo.texto': 'Lo que más te llena es la atención de verdad: estar juntos, sin prisa y sin distracciones. Un tiempo que sea solo de ustedes vale más que cualquier cosa material. La presencia, para ti, es la mayor prueba de amor.',
  'descobrir.lang.result.tempo.dica': 'Consejo para ustedes: reserven un momento fijo en la semana sin pantallas — aunque sean solo 20 minutos para hablar mirándose a los ojos.',
  'descobrir.lang.result.presentes.texto': 'Para ti, un regalo no se trata del precio — se trata de la intención detrás de él. Un detalle simple muestra que alguien pensó en ti incluso a la distancia. Esos gestos se vuelven símbolos de cariño que llevas contigo.',
  'descobrir.lang.result.presentes.dica': 'Consejo para ustedes: mantengan una "listita de detalles" el uno del otro (gustos, sueños, deseos) para acertar de lleno en las próximas sorpresas.',
  'descobrir.lang.result.servico.texto': 'Sientes el amor cuando se vuelve acción: alguien que resuelve, ayuda y te quita un peso de encima. Las actitudes prácticas, para ti, hablan más alto que las promesas. Cuidar el día a día juntos es tu forma favorita de amar y de ser amado(a).',
  'descobrir.lang.result.servico.dica': 'Consejo para ustedes: pregúntense "¿qué puedo quitarte de encima hoy?" — y dejen que el otro sienta que no está solo.',
  'descobrir.lang.result.toque.texto': 'Para ti, la conexión pasa mucho por el cuerpo: un abrazo, la mano tomada, el mimo que calma. El contacto cariñoso te hace sentir seguro(a) y presente en el vínculo. Es por ahí que el cariño llega más hondo.',
  'descobrir.lang.result.toque.dica': 'Consejo para ustedes: creen pequeños rituales de contacto — un abrazo de 20 segundos al reencontrarse ya cambia el clima del día.',
  'descobrir.att.badge': 'El estilo predominante de {name}',
  'descobrir.att.label.seguro': 'Estilo seguro',
  'descobrir.att.label.ansioso': 'Estilo ansioso',
  'descobrir.att.label.evitativo': 'Estilo evitativo',
  'descobrir.att.q1': 'Cuando surge un desacuerdo entre ustedes, tiendes a...',
  'descobrir.att.q1.opt.seguro': 'Hablar con calma, confiando en que lo resolverán juntos',
  'descobrir.att.q1.opt.ansioso': 'Angustiarte y querer resolverlo todo en el momento',
  'descobrir.att.q1.opt.evitativo': 'Necesitar un tiempo a solas antes de poder hablar',
  'descobrir.att.q2': 'Cuando tu amor tarda en responder un mensaje...',
  'descobrir.att.q2.opt.seguro': 'Me quedo tranquilo(a), sé que responde cuando puede',
  'descobrir.att.q2.opt.ansioso': 'Empiezo a imaginar que quizá algo esté mal',
  'descobrir.att.q2.opt.evitativo': 'Ni lo noto tanto — cada uno a su ritmo',
  'descobrir.att.q3': 'Sobre hablar de sentimientos en la relación...',
  'descobrir.att.q3.opt.seguro': 'Me siento a gusto para abrir el corazón',
  'descobrir.att.q3.opt.ansioso': 'Quiero mucho, pero a veces temo estar siendo demasiado',
  'descobrir.att.q3.opt.evitativo': 'Prefiero guardarme algunas cosas para mí',
  'descobrir.att.q4': 'En los momentos de mucha cercanía e intimidad...',
  'descobrir.att.q4.opt.seguro': 'Disfruto la conexión sin dejar de ser yo mismo(a)',
  'descobrir.att.q4.opt.ansioso': 'Me gustaría que fuera así, bien pegaditos, todo el tiempo',
  'descobrir.att.q4.opt.evitativo': 'De vez en cuando siento la necesidad de un respiro',
  'descobrir.att.q5': 'Pensando en contar con el otro en el día a día...',
  'descobrir.att.q5.opt.seguro': 'Confío en él/ella y también me gusta ser un apoyo',
  'descobrir.att.q5.opt.ansioso': 'Tengo miedo de que, algún día, me dejen de lado',
  'descobrir.att.q5.opt.evitativo': 'Prefiero, la mayoría de las veces, contar conmigo mismo(a)',
  'descobrir.att.result.seguro.texto': 'Tiendes a sentirte cómodo(a) tanto en la cercanía como en tu individualidad. Confías con naturalidad y logras hablar de lo que sientes sin perderte en el proceso. Esto no es una etiqueta fija — es una forma de ser que se construye y se cultiva en el día a día.',
  'descobrir.att.result.seguro.dica': 'Consejo para ustedes: usen esa base de confianza para crear un "espacio seguro" donde puedan hablar de inseguridades sin miedo a ser juzgados.',
  'descobrir.att.result.ansioso.texto': 'Valoras mucho la conexión y a veces estás atento(a) a señales de distancia, buscando reforzar el vínculo. Ese cuidado muestra cuánto te importa la relación. No es un defecto — es una necesidad de cercanía que se puede conversar con cariño.',
  'descobrir.att.result.ansioso.dica': 'Consejo para ustedes: acuerden pequeños gestos de reafirmación (un "estoy aquí", un buenos días puntual) que calman sin volverse una exigencia.',
  'descobrir.att.result.evitativo.texto': 'Valoras tu autonomía y a veces necesitas un espacio propio para procesar antes de compartir. Eso no significa amar menos — es una forma de sentirte seguro(a). Reconocer ese ritmo ayuda a que los dos se encuentren a mitad de camino.',
  'descobrir.att.result.evitativo.dica': 'Consejo para ustedes: cuando necesites espacio, avisa con cariño ("necesito un ratito y ya vuelvo") para que el otro no lo interprete como alejamiento.',
  'descobrir.conf.q1': 'Cuando hay un conflicto entre {voce} y {amor}, ¿quién suele dar el primer paso?',
  'descobrir.conf.both': 'Los dos por igual',
  'descobrir.conf.none': 'Todavía ninguno',
  'descobrir.conf.q2': '¿Cuál es el desafío que más quieren resolver juntos?',
  'descobrir.conf.desafio.comunicacao': 'Comunicación',
  'descobrir.conf.desafio.rotina': 'Rutina vs. romance',
  'descobrir.conf.desafio.confianca': 'Confianza',
  'descobrir.conf.desafio.redescobrir': 'Redescubrirse',
  'descobrir.conf.statFirstStep': 'da el primer paso',
  'descobrir.conf.statChallenge': 'desafío a resolver',
  'descobrir.conf.saved': 'Guardado — esto ayuda a personalizar lo que ven en Reconectar.',

  // Reconectar — trilhas e modo SOS
  'reconectar.header.title': 'Reconectar',
  'reconectar.header.subtitle': 'Fortalezcan el vínculo',
  'reconectar.gate.title': 'Completen primero el quiz de pareja',
  'reconectar.gate.desc': 'Necesitamos saber sus nombres para guardar el progreso de las rutas en el lugar correcto.',
  'reconectar.gate.cta': 'Hacer el quiz de pareja',
  'reconectar.celebrate.title': '¡Lo lograron, {voce} & {amor}!',
  'reconectar.celebrate.desc': 'Completaron juntos la ruta "{title}". Un paso más, real y de los dos.',
  'reconectar.sos.overline': 'Ayuda inmediata',
  'reconectar.sos.title': 'Modo SOS — justo después de una pelea',
  'reconectar.sos.desc': '4 pasos cortos para bajar la tensión ahora, sin elegir ruta.',
  'reconectar.sos.next': 'Listo, siguiente paso',
  'reconectar.sos.finish': 'Terminamos los 4 pasos 💛',
  'reconectar.sos.step.0': 'Respiren hondo, cada uno a su manera, antes de decir cualquier otra cosa.',
  'reconectar.sos.step.1': 'El primero que pueda, que diga en voz alta: "no quiero pelear contigo, quiero entenderte".',
  'reconectar.sos.step.2': 'Escúchense el uno al otro sin interrumpir ni defenderse — solo para entender, no para responder ya.',
  'reconectar.sos.step.3': 'Ofrézcanse un abrazo de 20 segundos, aunque todavía falte algo por resolver.',
  'reconectar.intro.title': 'Reavivar la conexión',
  'reconectar.intro.text': 'Reconectar no es convencer ni controlar a nadie — es volver a escucharse, cuidarse y comunicarse con honestidad. Elijan una ruta y hagan una pequeña misión por día, a su ritmo. Los gestos pequeños, repetidos, reconstruyen el vínculo.',
  'reconectar.intro.disclaimer': 'Para cuestiones serias, consideren terapia de pareja con un profesional.',
  'reconectar.progress.overline': 'El avance conjunto de ustedes',
  'reconectar.progress.done': '✅ hechos',
  'reconectar.progress.pending': '⏳ pendientes',
  'reconectar.progress.tracks': '🏁 rutas',
  'reconectar.tracksTitle': 'Rutas de reconexión',
  'reconectar.recommendedIntro': 'De acuerdo con la forma en que se vinculan y el momento de hoy, sugerimos empezar por la ruta marcada abajo.',
  'reconectar.recommendedBadge': '✷ sugerida para hoy',
  'reconectar.trackComplete': 'Ruta completa. Cuando quieran, pueden revisitarla juntos.',
  'reconectar.disclaimer': 'Los registros de progreso de sus rutas quedan guardados solo en este dispositivo.',
  'reconectar.track.conversar.title': 'Volver a conversar',
  'reconectar.track.conversar.intro': 'Pequeños gestos para reabrir el canal y escucharse de verdad.',
  'reconectar.track.conversar.step.0': 'Escucha a tu pareja por 2 minutos sin interrumpir y resume con tus palabras lo que escuchaste.',
  'reconectar.track.conversar.step.1': 'Manda un mensaje corto preguntando cómo fue su día — y lee la respuesta con atención.',
  'reconectar.track.conversar.step.2': 'Elijan un momento sin prisa para conversar, con los móviles lejos.',
  'reconectar.track.conversar.step.3': 'Haz una pregunta abierta ("¿qué has estado sintiendo últimamente?") en vez de una de sí o no.',
  'reconectar.track.conversar.step.4': 'Comparte algo tuyo primero: cuenta cómo te has estado sintiendo, empezando con "yo siento...".',
  'reconectar.track.conversar.step.5': 'Acuerden un horario fijo en la semana, solo para ustedes, para ponerse al día.',
  'reconectar.track.frieza.title': 'Reducir la frialdad',
  'reconectar.track.frieza.intro': 'Calentar el ambiente de a poco, sin presión y al ritmo de los dos.',
  'reconectar.track.frieza.step.0': 'Saluda a tu pareja con un buenos días o buenas noches, incluso en los días más difíciles.',
  'reconectar.track.frieza.step.1': 'Reconoce en voz alta algo que admiras de él/ella.',
  'reconectar.track.frieza.step.2': 'Ofrece un contacto cariñoso — la mano en el hombro, un abrazo — si es cómodo para los dos.',
  'reconectar.track.frieza.step.3': 'Respira antes de hablar cuando sientas ganas de cerrarte, para no responder en automático.',
  'reconectar.track.frieza.step.4': 'Di "te extrañé" cuando sea verdad, sin esperar nada a cambio.',
  'reconectar.track.frieza.step.5': 'Retomen un pequeño hábito de ustedes: un café juntos, una canción, una caminata.',
  'reconectar.track.carinho.title': 'Reconstruir el cariño',
  'reconectar.track.carinho.intro': 'Regar el afecto con atención, gratitud y presencia.',
  'reconectar.track.carinho.step.0': 'Agradece algo específico que tu pareja hizo hoy, por pequeño que parezca.',
  'reconectar.track.carinho.step.1': 'Manda un mensaje recordando un buen momento que vivieron juntos.',
  'reconectar.track.carinho.step.2': 'Haz un elogio sincero sobre quién es, no solo sobre lo que hace.',
  'reconectar.track.carinho.step.3': 'Ofrece ayuda en algo que sabes que le pesa, sin esperar a que lo pida.',
  'reconectar.track.carinho.step.4': 'Reserven 10 minutos solo para estar juntos, sin resolver nada — solo presencia.',
  'reconectar.track.carinho.step.5': 'Escribe una nota corta diciendo lo que valoras de tener a esa persona cerca.',
  'reconectar.track.confianca.title': 'Retomar la confianza',
  'reconectar.track.confianca.intro': 'Reconstruir la seguridad con transparencia y reparaciones honestas.',
  'reconectar.track.confianca.step.0': 'Cumple una pequeña promesa esta semana y avisa con cariño cuando la cumplas.',
  'reconectar.track.confianca.step.1': 'Pide disculpas por algo específico, sin agregar un "pero" después.',
  'reconectar.track.confianca.step.2': 'Escucha el dolor de tu pareja hasta el final, sin defenderte, y valida lo que sintió.',
  'reconectar.track.confianca.step.3': 'Haz un pedido empezando con "yo siento..." en vez de acusar ("siento inseguridad cuando...").',
  'reconectar.track.confianca.step.4': 'Sé transparente sobre algo que solías evitar contar, a tu propio ritmo.',
  'reconectar.track.confianca.step.5': 'Acuerden juntos un pequeño pacto de convivencia y revísenlo dentro de una semana.',

  // Linha do tempo — memórias e cápsulas
  'timeline.header.title': 'Línea de tiempo',
  'timeline.header.subtitle': 'Recuerdos de pareja',
  'timeline.gate.title': 'Completen primero el quiz de pareja',
  'timeline.gate.desc': 'Necesitamos saber sus nombres para guardar los recuerdos en el lugar correcto.',
  'timeline.gate.cta': 'Hacer el quiz de pareja',
  'timeline.link.badge': '✷ Horóscopo de la pareja ✷',
  'timeline.link.text': 'Mira la energía de hoy entre {voce} y {amor} →',
  'timeline.section.timeline': 'Línea de tiempo',
  'timeline.stat.memories': '📸 recuerdos',
  'timeline.stat.capsules': '⏳ cápsulas',
  'timeline.empty.memories.title': 'Todavía no hay recuerdos guardados',
  'timeline.empty.memories.desc': 'Añadan el primer capítulo de la historia de {voce} y {amor} 👇',
  'timeline.delete': 'eliminar',
  'timeline.dateFormat': '{d} {month} {y}',
  'timeline.month.0': 'ene',
  'timeline.month.1': 'feb',
  'timeline.month.2': 'mar',
  'timeline.month.3': 'abr',
  'timeline.month.4': 'may',
  'timeline.month.5': 'jun',
  'timeline.month.6': 'jul',
  'timeline.month.7': 'ago',
  'timeline.month.8': 'sep',
  'timeline.month.9': 'oct',
  'timeline.month.10': 'nov',
  'timeline.month.11': 'dic',
  'timeline.defaultMemory.1.title': 'Primera cita',
  'timeline.defaultMemory.1.text': 'Aquel café que se volvió 4 horas de conversación.',
  'timeline.defaultMemory.2.title': 'Primer viaje juntos',
  'timeline.defaultMemory.2.text': 'Playa, lluvia y nosotros riéndonos de todo.',
  'timeline.defaultMemory.3.title': 'Un "te amo" de verdad',
  'timeline.defaultMemory.3.text': 'Sin prisa, como debía ser.',
  'timeline.addMemory.section': 'Añadir un recuerdo',
  'timeline.addMemory.titleLabel': 'Título',
  'timeline.addMemory.titlePlaceholder': 'Ej.: Nuestro primer viaje',
  'timeline.addMemory.dateLabel': 'Fecha',
  'timeline.selectDate': 'Seleccionar fecha',
  'timeline.addMemory.descLabel': 'Descripción',
  'timeline.addMemory.descPlaceholder': 'Un detalle para nunca olvidar',
  'timeline.addMemory.save': 'Guardar recuerdo 💛',
  'timeline.datePicker.memoryTitle': 'Fecha del recuerdo',
  'timeline.capsules.section': 'Cápsulas del tiempo ⏳',
  'timeline.capsules.empty.title': 'Todavía no hay ninguna cápsula',
  'timeline.capsules.empty.desc': 'Graben un mensaje que se abra en el futuro 👇',
  'timeline.capsule.opened': '¡Cápsula abierta!',
  'timeline.capsule.sealed': 'Cápsula sellada',
  'timeline.capsule.daysLeft_one': '{n} día',
  'timeline.capsule.daysLeft_other': '{n} días',
  'timeline.capsule.opensOn': 'se abre el {date}',
  'timeline.createCapsule.section': 'Crear una cápsula',
  'timeline.createCapsule.msgLabel': 'Mensaje para el futuro',
  'timeline.createCapsule.msgPlaceholder': 'Ej.: ¿Te acuerdas de este día?',
  'timeline.createCapsule.openAtLabel': 'Abrir el',
  'timeline.createCapsule.seal': 'Sellar cápsula ⏳',
  'timeline.createCapsule.hint': 'Consejo: para ver una cápsula "abrirse", elige la fecha de hoy o de ayer.',
  'timeline.disclaimer': 'Sus recuerdos y cápsulas quedan guardados solo en este dispositivo.',

  // Diário Cósmico
  'diary.date': '{d} de {month}',
  'diary.month.0': 'enero',
  'diary.month.1': 'febrero',
  'diary.month.2': 'marzo',
  'diary.month.3': 'abril',
  'diary.month.4': 'mayo',
  'diary.month.5': 'junio',
  'diary.month.6': 'julio',
  'diary.month.7': 'agosto',
  'diary.month.8': 'septiembre',
  'diary.month.9': 'octubre',
  'diary.month.10': 'noviembre',
  'diary.month.11': 'diciembre',
  'diary.filter.all': 'Todos',
  'diary.filter.tarot': 'Tarot',
  'diary.filter.palma': 'Palma',
  'diary.filter.rosto': 'Rostro',
  'diary.filter.pe': 'Pie',
  'diary.filter.pintas': 'Lunares',
  'diary.filter.coffee': 'Café',
  'diary.filter.dream': 'Sueño',
  'diary.pinned.banner': 'DESTACADO',
  'diary.withInsight': '🎙️ con insight',

  // Assinatura
  'planos.header.title': 'Suscripción',
  'planos.header.subtitle': '3 planes · todos con 7 días gratis',
  'planos.unlockTitle': 'Desbloqueen la experiencia completa de pareja',
  'planos.unlockTitleSolo': 'Desbloquea las lecturas individuales sin límite',
  'planos.benefit.1': '7 días gratis para probar, sin compromiso',
  'planos.benefit.2': 'Lecturas sin límite: Horóscopo, Carta Astral, Tarot, Compatibilidad, Chat, Palma, Café, Sueños y Calendario Lunar',
  'planos.benefit.3': 'Reconectar — rutas de reconexión para la pareja',
  'planos.benefit.4': 'Descubrir — juegos e ideas para citas',
  'planos.benefit.5': 'Actuar — metas de la semana',
  'planos.benefit.6': 'Progreso y Retrospectiva del camino de ustedes',
  'planos.benefit.7': 'Línea de tiempo y cápsulas del tiempo guardadas',
  'planos.plan.trial.label': 'Mensual',
  'planos.plan.trial.cycle': '/mes',
  'planos.plan.trial.detail': '7 días gratis, después US$5/mes',
  'planos.plan.quarterly.label': 'Trimestral',
  'planos.plan.quarterly.cycle': '/3 meses',
  'planos.plan.quarterly.detail': '7 días gratis · US$3,33/mes',
  'planos.plan.quarterly.badge': 'Ahorra 33%',
  'planos.plan.annual.label': 'Anual',
  'planos.plan.annual.cycle': '/año',
  'planos.plan.annual.detail': '7 días gratis · US$1,67/mes',
  'planos.plan.annual.badge': 'Mejor oferta',
  'planos.cta.trial': 'Comenzar mis 7 días gratis →',
  'planos.cta.quarterly': 'Comenzar 7 días gratis (Trimestral) →',
  'planos.cta.annual': 'Comenzar 7 días gratis (Anual) →',
  'planos.preparing': 'Preparando el checkout seguro…',
  'planos.errorGeneric': 'No pudimos abrir el checkout ahora. Intenta de nuevo en instantes.',
  'planos.openOtherTab': 'Abrir el checkout en otra pestaña →',
  'planos.back': '← Volver',
  'planos.alreadySubscriber': 'Ya eres suscriptor',
  'planos.status.active': 'Activa',
  'planos.status.pastDue': 'Pago pendiente',
  'planos.status.pending': 'Esperando confirmación',
  'planos.status.canceled': 'Cancelada',
  'planos.status.expired': 'Expirada',
  'planos.renewsOn': 'Se renueva el {date}',
  'planos.loginRequired.title': 'Inicia sesión para suscribirte',
  'planos.loginRequired.text': 'Necesitamos una cuenta para vincular tu suscripción a ti — así, si cambias de dispositivo, tu acceso sigue contigo.',
  'planos.loginRequired.cta': 'Iniciar sesión →',
  'planos.statusLine': 'Estado: {status}',

  // Loja — recompensas e brindes espirituais
  'loja.header.title': 'Tienda',
  'loja.header.subtitle': 'Cambia tokens por recompensas',
  'loja.balanceLabel': 'tokens disponibles',
  'loja.sectionRewards': 'Recompensas',
  'loja.costTokens': '{cost} tokens',
  'loja.redeem': 'Canjear',
  'loja.open': 'Abrir',
  'loja.owned': 'tuyo — ábrelo cuando quieras',
  'loja.sectionBrindes': 'Regalos espirituales',
  'loja.sectionBrindesSubtitle': 'Gana tokens en las misiones diarias y cámbialos por mimos de entrega inmediata.',
  'loja.wallpaperDownload': 'Descargar “{nome}”',
  'loja.reward.selo-cosmico.title': 'Sello Cósmico en el perfil',
  'loja.reward.selo-cosmico.description': 'Un sellito especial al lado de tu nombre en el Perfil — en solo o en pareja.',
  'loja.reward.destaque-diario.title': 'Destacado en el Diario',
  'loja.reward.destaque-diario.description': 'Fija la lectura que elijas en la parte de arriba del Diario Cósmico por 7 días.',
  'loja.reward.leitura-bonus.title': 'Lectura Bonus',
  'loja.reward.leitura-bonus.description': 'Desbloquea una lectura extra de Tarot fuera de tu ritmo normal (aunque ya hayas consultado ese tema hoy).',
  'loja.reward.escudo-sequencia.title': 'Escudo de la Racha',
  'loja.reward.escudo-sequencia.description': 'Protege su racha de romperse si se olvidan de usar la app por 1 día.',
  'loja.reward.tema-dourado.title': 'Tema dorado exclusivo',
  'loja.reward.tema-dourado.description': 'Toda la app en dorado — compra única, actívalo y desactívalo cuando quieras en el Perfil.',
  'loja.brinde.brinde-ritual-lua.title': 'Guía del Ritual de Luna Llena',
  'loja.brinde.brinde-ritual-lua.description': 'Ritual guiado en 4 pasos para la próxima Luna Llena — tuyo para siempre, se reabre cuando quieras.',
  'loja.brinde.brinde-wallpapers.title': 'Pack de Fondos Místicos',
  'loja.brinde.brinde-wallpapers.description': '3 fondos de pantalla exclusivos (1080×1920) para descargar al instante.',
  'loja.brinde.brinde-tiragem-exclusiva.title': 'Tirada de la Luna Interior',
  'loja.brinde.brinde-tiragem-exclusiva.description': 'Tirada exclusiva de 3 posiciones + 1 Lectura Bonus de Tarot ya acreditada para que la uses en ella.',
  'loja.brinde.brinde-incenso.title': 'Incienso Místico (kit de 7 varitas)',
  'loja.brinde.brinde-incenso.description': 'Kit de inciensos naturales enviado a tu casa — muy pronto.',
  'loja.brinde.brinde-cristal.title': 'Cristal de Cuarzo',
  'loja.brinde.brinde-cristal.description': 'Cuarzo natural elegido a dedo, enviado a tu casa — muy pronto.',
  'loja.alert.goldAlready.title': 'Ya tienes el Tema dorado',
  'loja.alert.goldAlready.text': 'Actívalo y desactívalo cuando quieras en Perfil > Preferencias.',
  'loja.alert.shield.title': '¡Escudo activado!',
  'loja.alert.shield.text': '{count} escudo(s) guardado(s) — protege la próxima racha rota.',
  'loja.alert.seal.title': '¡Sello activado!',
  'loja.alert.seal.text': 'Ya apareció al lado del nombre de ustedes en el Perfil.',
  'loja.alert.bonusReading.title': '¡Lectura Bonus guardada!',
  'loja.alert.bonusReading.text': 'Ve al Tarot, elige el tema (aunque ya lo hayas consultado hoy) y usa el botón "Usar Lectura Bonus" ({count} disponible).',
  'loja.alert.pin.title': '¡Destacado guardado!',
  'loja.alert.pin.text': 'Abre el Diario Cósmico, toca la lectura que quieras y usa "Fijar arriba por 7 días".',
  'loja.alert.goldGranted.title': '¡El Tema dorado es tuyo!',
  'loja.alert.goldGranted.text': 'Recargando para aplicar el nuevo aspecto…',
  'loja.alert.goldGranted.cta': 'Aplicar ahora',
  'loja.alert.redeemed.title': '¡Canjeado!',
  'loja.alert.redeemed.text': '"{title}" canjeado con éxito.',
  'loja.alert.noBalance.title': 'Saldo insuficiente',
  'loja.alert.noBalance.rewardText': 'Tienes {balance} tokens, pero esa recompensa cuesta {cost}. Completa más lecturas para ganar tokens.',
  'loja.alert.noBalance.brindeText': 'Tienes {balance} tokens, pero ese regalo cuesta {cost}. Completa las misiones diarias y las lecturas para ganar más.',
  'loja.alert.noBalance.cta': 'Ganar tokens ahora',
  'loja.alert.noBalance.dismiss': 'Ahora no',
  'loja.alert.physical.title': 'Casi allí',
  'loja.alert.physical.text': 'Los regalos físicos están en preparación — no se gastó ningún token.',

  // Meus Tokens
  'tokens.header.title': 'Mis Tokens',
  'tokens.header.subtitle': 'Tu energía acumulada',
  'tokens.seeShop': 'Ver Tienda',
  'tokens.balanceLabel': 'tokens acumulados',
  'tokens.historyTitle': 'Historial',
  'tokens.empty': 'Ninguna transacción todavía — ¡completa una lectura para ganar tus primeros tokens!',
  'tokens.emptyCta': 'Hacer una lectura ahora',
  'tokens.history.dateTime': '{date} a las {time}',

  // Paywall e portões de casal
  'gate.teaser.title': 'Continúa con la suscripción',
  'gate.teaser.price': '$5 USD/mes · 7 días gratis, sin compromiso',
  'gate.teaser.cta': 'Suscribirme →',
  'gate.solo.title': 'Esto es para hacer en pareja',
  'gate.solo.text': 'Las rutas de reconexión, los juegos, las ideas para citas y la retrospectiva solo tienen sentido con los dos.',
  'gate.solo.cta': 'Suscribirme ahora →',
  'gate.solo.inviteCta': 'o invita a tu pareja para desbloquear esto →',

  // Perfil
  'profile.header.title': 'Perfil',
  'profile.soloUniverse': 'Tu universo · {sign}',
  'profile.noCouple': 'Pareja aún no registrada',
  'profile.soloInviteHint': 'Invita a tu pareja cuando quieras — pestaña Inicio',
  'profile.noCoupleHint': 'Completa el quiz de pareja en la pestaña Inicio',
  'profile.section.account': 'Cuenta',
  'profile.section.preferences': 'Preferencias',
  'profile.section.support': 'Soporte',
  'profile.row.email': 'Correo',
  'profile.row.login': 'Iniciar sesión',
  'profile.row.installApp': 'Instalar app',
  'profile.row.manageSubscription': 'Gestionar suscripción',
  'profile.row.subscribe': 'Suscribirse',
  'profile.row.recovering': 'Recuperando...',
  'profile.row.recoverSubscription': 'Recuperar mi suscripción',
  'profile.row.redoQuiz': 'Rehacer el quiz de pareja',
  'profile.row.addPartner': 'Añadir pareja',
  'profile.row.sendInvite': 'Enviar invitación a {amor}',
  'profile.row.myTokens': 'Mis Tokens ({count})',
  'profile.row.goldTheme': 'Tema dorado',
  'profile.row.dailyThought': 'Pensamiento cósmico diario',
  'profile.row.appVersion': 'Versión de la app',
  'profile.pref.language': 'Idioma',
  'profile.name.editTitle': 'Editar nombre',
  'profile.name.placeholder': 'Tu nombre',
  'profile.name.saving': 'Guardando...',
  'profile.name.save': 'Guardar',
  'profile.name.emptyTitle': 'Nombre vacío',
  'profile.name.emptyText': 'Escribe un nombre antes de guardar.',
  'profile.name.saveErrorTitle': 'No se pudo guardar',
  'profile.name.saveErrorFallback': 'Inténtalo de nuevo en unos instantes.',
  'profile.delete.title': 'Eliminar cuenta',
  'profile.delete.text': 'Esto cerrará tu sesión y borrará los datos guardados en este dispositivo (nombres, signos, fechas y la racha de la pareja). La cuenta de acceso en sí sigue existiendo — para eliminarla del todo, escribe a contato@cosmicguide.cloud.',
  'profile.delete.confirmWipe': 'Salir y borrar los datos locales',
  'profile.delete.justSignOut': 'Solo cerrar sesión',
  'profile.signOut.title': 'Cerrar sesión',
  'profile.signOut.text': '¿Seguro que quieres salir?',
  'profile.signOut.confirm': 'Salir',
  'profile.install.iosTitle': 'Instalar en iPhone o iPad',
  'profile.install.iosText': 'Abre este sitio en Safari (tiene que ser Safari, en otro navegador no funciona). Toca el icono de Compartir (□↑) en la barra inferior, desliza la lista de opciones hasta encontrar "Añadir a pantalla de inicio" y confirma tocando "Añadir" en la esquina superior.',
  'profile.install.genericTitle': 'Instalar la app',
  'profile.install.genericText': 'Abre el menú del navegador y busca "Instalar app" o "Añadir a pantalla de inicio".',
  'profile.notif.permTitle': 'Permiso necesario',
  'profile.notif.permText': 'Activa las notificaciones de Cosmic Guide en los ajustes del dispositivo para recibir el pensamiento cósmico diario.',
  'profile.recover.successTitle': 'Suscripción recuperada',
  'profile.recover.successText': 'Tu suscripción ahora está vinculada a esta cuenta. Puedes entrar con ella desde cualquier dispositivo.',
  'profile.recover.emptyTitle': 'No hay nada en este dispositivo',
  'profile.recover.emptyText': 'No hay ninguna suscripción guardada aquí. Si te suscribiste en otro móvil, entra con la misma cuenta que usaste allí. Si pagaste con otro correo, escribe a contato@cosmicguide.cloud con el comprobante.',
  'profile.recover.otherAccountTitle': 'Esa suscripción ya está en otra cuenta',
  'profile.recover.otherAccountText': 'La suscripción guardada en este dispositivo ya pertenece a otro acceso. Entra con esa cuenta, o escribe a contato@cosmicguide.cloud.',
  'profile.recover.errorTitle': 'No se pudo recuperar ahora',
  'profile.recover.errorText': 'Inténtalo de nuevo en unos instantes. Si sigue igual, escribe a contato@cosmicguide.cloud con el correo del pago.',

  // Ajuda, privacidade e termos
  'help.header.title': 'Ayuda y soporte',

  'privacy.header.title': 'Privacidad',

  'terms.header.title': 'Términos de uso',

  // Seletor de data compartilhado
  'datePicker.title': 'Seleccionar fecha',
  'datePicker.cancel': 'Cancelar',
  'datePicker.confirm': 'Confirmar',
  'datePicker.month.0': 'Ene',
  'datePicker.month.1': 'Feb',
  'datePicker.month.2': 'Mar',
  'datePicker.month.3': 'Abr',
  'datePicker.month.4': 'May',
  'datePicker.month.5': 'Jun',
  'datePicker.month.6': 'Jul',
  'datePicker.month.7': 'Ago',
  'datePicker.month.8': 'Sep',
  'datePicker.month.9': 'Oct',
  'datePicker.month.10': 'Nov',
  'datePicker.month.11': 'Dic',

  // Compartilhados — erro, cartões, cabeçalho, push
  'errorBoundary.title': 'Algo salió mal',
  'errorBoundary.fallbackMessage': 'Error inesperado al cargar la app.',
  'errorBoundary.hint': 'Recarga la página. Si persiste, avisa al soporte.',

  'featureCard.lockedA11y': '{title}, función bloqueada, requiere suscripción',

  'header.backA11y': 'Volver',

  'push.errorTitle': 'No se pudo activar',

  'common.cancel': 'Cancelar',
  'common.ok': 'OK',

  // Botones que LLEVAN en vez de textos que solo informan (ver bloque PT).
  'birthchart.couple.missingDateCta': 'Rellenar la fecha de nacimiento',
  'birthchart.fix.timeCta': 'Indicar la hora de nacimiento',
  'birthchart.fix.timeCoupleCta': 'Rehacer el test e indicar la hora',
  'birthchart.fix.cityCta': 'Elegir la ciudad de nacimiento',
  'profile.noCoupleCta': 'Hacer el test de pareja',
  'profile.soloInviteCta': 'Invitar a mi pareja ahora',
  'diary.empty.cta': 'Hacer mi primera lectura',
  'compat.locked.cta': 'Ver los planes',
  'tarot.locked.cta': 'Ver los planes',
  'tarot.dailyLimit.storeCta': 'Comprar Lectura Bonus en la Tienda',
  'help.faq.couple.cta': 'Hacer el test de pareja',
  'help.faq.subscription.cta': 'Abrir mi suscripción',
  'support.emailCta': 'Escribir al soporte',
  'social.empty.findCta': 'Buscar lectores para seguir',
  'social.empty.diaryCta': 'Abrir mi Diario Cósmico',
  'album.drawCta': 'Sacar cartas ahora',
  'album.cardHidden': 'Carta todavía no revelada',
  'album.closeHint': 'Toca fuera de la carta para cerrar',
  'wrapped.empty.readingsCta': 'Hacer una lectura ahora',
  'errorBoundary.reloadCta': 'Recargar la app',
  'errorBoundary.supportCta': 'Escribir al soporte',
  'home.notifPrompt.errorOpenPrefsCta': 'Abrir Preferencias',
  'login.forgot.cta': 'Olvidé mi contraseña',
  'login.forgot.sending': 'Enviando el enlace...',
  'login.forgot.needEmail': 'Escribe tu correo arriba para recibir el enlace de recuperación.',
  'login.forgot.sent': 'Enlace de recuperación enviado. Revisa tu correo para crear una contraseña nueva.',
  'login.openInboxCta': 'Abrir mi correo',

  'diary.insight.original': 'Tu insight original',
  'diary.insight.polished': 'Versión pulida por la IA',
  'diary.pin.cta': 'Fijar arriba por 7 días',
  'diary.delete.cta': 'Borrar esta lectura',
  'diary.weekly.cta': 'Ver el Insight de la Semana',
  'diary.weekly.loading': 'Buscando el hilo conductor de tu semana...',
  'diary.close': 'Cerrar',
  'diary.empty.waiting': 'Tu diario está esperando tu primera lectura',
  'coffee.weekly.ready': 'Tu conclusión de la semana está lista',
  'coffee.weekly.cta': 'Ver la conclusión de la semana',
  'coffee.close': 'Cerrar',
  'coffee.takePhoto': 'Tomar foto',
  'coffee.pickPhoto': 'Elegir de la galería',
  'coffee.analyzing': 'Analizando…',
  'coffee.analyze': 'Analizar',
  'coffee.changePhoto': 'Cambiar foto',
  'coffee.subscribe': 'Suscribirse →',
  'coffee.newReading': 'Nueva lectura',
  'dream.interpreting': 'Interpretando…',
  'dream.interpret': 'Interpretar',
  'dream.subscribe': 'Suscribirse →',
  'dream.new': 'Nuevo sueño',
  'tarot.subtitle': 'Tarot que no endulza la verdad — Pasado · Presente · Futuro',
  'tarot.album': 'Álbum',
  'tarot.tap': 'Toca',
  'missions.today': 'Misiones de hoy',
  'missions.storeLink': 'cambiar fichas por recompensas en la Tienda',
};

const EN = {
  // Onboarding — a escolha "só eu / eu e meu par", 1ª tela de quem chega pelo link
  'onboarding.headerTitle': 'Nine readings.\nThe first of each, free.',
  'onboarding.headerSub': 'Horoscope, birth chart, tarot, dreams, palm, coffee grounds and more. No card to get started.',
  'onboarding.solo.title': 'For me',
  'onboarding.solo.desc': 'Today’s sky, your birth chart, the cards, what your hand and your dreams say. The first reading of each is yours.',
  'onboarding.couple.title': 'My partner and me',
  'onboarding.couple.desc': 'Discover your energy and compatibility together.',
  'onboarding.cta': 'Start',
  'onboarding.back': 'Back',
  'onboarding.pickerTitle': 'What\'s your sign?',
  'onboarding.saveError': 'We couldn\'t save your sign. Please try again.',

  // Login e criação de conta
  'login.mode.signIn': 'Log in',
  'login.mode.signUp': 'Create account',
  'login.emailLabel': 'Email',
  'login.emailPlaceholder': 'youremail@example.com',
  'login.passwordLabel': 'Password',
  'login.showPassword': 'Show password',
  'login.hidePassword': 'Hide password',
  'login.errorEmptyFields': 'Please fill in your email and password.',
  'login.infoConfirmEmail': 'Account created! Check your email to confirm it before logging in.',
  'login.divider': 'or',
  'login.google': 'Continue with Google',
  'login.switchToSignUp': 'No account yet? Create one',
  'login.switchToSignIn': 'Already have an account? Log in',
  'login.checkoutSubtitle': 'The plan you picked is saved — log in or create your account to continue.',

  // Home
  'home.greetingCouple': 'Hi, {voce} & {amor}',
  'home.greetingSolo': 'Hi, {sign}',
  // ver a nota em 'home.compatPercent' no bloco PT: o valor vivo está no fim
  'home.compatSeeMore': 'See full compatibility',
  'home.compatTitleEmpty': 'Couple compatibility',
  'home.compatSubtitleEmpty': 'Not calculated yet',
  'home.compatTextEmpty': 'Invite your partner to discover your sign compatibility and keep your daily streak going.',
  'home.compatLinkEmpty': 'Invite my partner',
  'home.lovePhrase.label': 'Phrase of the day to share',
  'home.lovePhrase.share': 'Share',
  'home.thought.label': 'Cosmic thought of the day',
  'home.thought.unread': '✨ Read today\'s',
  'home.thought.readToday': '✓ Read today',
  'home.thought.expand': 'Read in full ↓',
  'home.thought.collapse': 'Show less ↑',
  'home.notifPrompt.title': 'Want the cosmic thought every day?',
  'home.notifPrompt.text': 'One notification a day, with the day\'s sky for your sign. No spam.',
  'home.notifPrompt.cta': 'Enable',
  'home.notifPrompt.later': 'Not now',
  'home.sectionExplore': 'Explore the cosmos',
  'home.sectionExploreSubtitle': 'Alone or as a couple — subscribe and use without limits',
  'home.sectionPraticas': 'Practices',
  'home.sectionPraticasSubtitle': 'Things you do with your hands, your body and a set amount of time',
  'home.sectionDatas': 'Sky dates',
  'home.sectionDatasSubtitle': 'What the sky does this month, with day and time',
  'home.sectionCuriosidades': 'Curiosities',
  'home.sectionCuriosidadesSubtitle': 'History with sources, made to share',
  'home.sectionCouple': 'Couple features',
  'home.sectionCoupleSubtitle': 'Only unlock by forming a couple in the app',
  'home.sectionCosmicEvent': 'Cosmic event',
  'home.cosmicEventTitle': '{planetA} in {aspect} with {planetB}',
  'home.cosmicEventTitleEmpty': 'Quiet sky today — no strong conversations between planets',
  'home.cosmicEventDesc': 'Two planets are in conversation in today\'s sky — that\'s what astrology calls an aspect. And it\'s real: calculated from the exact position of the planets, {orb}° from the exact angle (the "orb").',
  'home.cosmicEventDescEmpty': 'No pair of planets in close conversation right now. In technical terms: the classical planets have no major aspects (the five main angles) in tight orb (close to the exact angle) in tonight\'s sky.',
  'home.cosmicEventDate': 'Today · {date}',
  'home.card.horoscope.title': 'Horoscope',
  'home.card.horoscope.subtitle': 'Daily forecast',
  'home.card.birthchart.title': 'Birth Chart',
  'home.card.birthchart.subtitle': 'Sun, Moon & Ascendant',
  'home.card.tarot.title': 'Tarot by Theme',
  'home.card.tarot.subtitle': 'Past · Future',
  'home.card.compatibility.title': 'Compatibility',
  'home.card.compatibility.subtitle': 'Celestial match',
  'home.card.timeline.title': 'Timeline',
  'home.card.timeline.subtitle': 'Couple\'s memories',
  'home.card.reconectar.title': 'Reconnect',
  'home.card.reconectar.subtitle': 'Strengthen your bond',
  'home.card.descobrir.title': 'Discover',
  'home.card.descobrir.subtitle': 'Get to know each other',
  'home.card.agir.title': 'Take Action',
  'home.card.agir.subtitle': 'Small gestures',
  'home.card.progresso.title': 'Progress',
  'home.card.progresso.subtitle': 'Streak & achievements',
  'home.card.retrospectiva.title': 'Retrospective',
  'home.card.retrospectiva.subtitle': 'Your year together',
  'home.card.dream.title': 'Dreams',
  'home.card.dream.subtitle': 'Interpret now',
  'home.card.lunarCalendar.title': 'Lunar Calendar',
  'home.card.lunarCalendar.subtitle': 'Today\'s Moon phase',
  'home.card.palm.title': 'Palm Reading',
  'home.card.palm.subtitle': 'Your hand reveals',
  'home.card.coffee.title': 'Coffee Ritual',
  'home.card.coffee.subtitle': 'Mystic grounds',
  'home.card.chat.title': 'Spiritual Chat',
  'home.card.chat.subtitle': 'Quick guidance',
  'home.card.diary.title': 'Cosmic Diary',
  'home.card.diary.subtitle': 'Your saved readings',
  'home.card.social.title': 'Social Feed',
  'home.card.social.subtitle': 'Other readers',
  'home.milestone.title': '{days} days in a row!',
  'home.milestone.bonus': '+{tokens} bonus tokens',
  'home.milestone.offer': 'Celebrate with a 7-day free trial →',
  'home.milestone.continue': 'Continue',
  'home.streak.count_one': '🔥 {count} day in a row',
  'home.streak.count_other': '🔥 {count} days in a row',
  'home.streak.empty': 'Start your streak today',
  'home.goal.label': 'Weekly goal',
  'home.goal.done': 'Done: ',
  'home.goal.empty': 'You haven\'t set a goal for this week yet',
  'home.wrapped.title': 'Your Cosmic Retrospective is here',
  'home.wrapped.subtitle': 'Your month in summary — to see and share',
  'home.sky.label': 'Today\'s sky for you',
  'home.sky.inviteText': 'Enter your birth date in the Birth Chart and see, every day, how today\'s sky touches YOUR chart — not everyone else\'s.',
  'home.sky.inviteCta': 'Fill in my Birth Chart →',
  'home.sky.moreAspects': '+{count} aspect(s) (planet conversations) in your sky today — subscribe to see →',
  'home.hero.streak.count_one': '{count} day in a row',
  'home.hero.streak.count_other': '{count} days in a row',
  'home.hero.streak.empty': '✨ Start your streak together today',
  'home.notifPrompt.errorTitle': 'Couldn\'t enable',
  'home.notifPrompt.errorHint': 'Once that\'s sorted, enable it in Profile > Daily cosmic thought.',
  'home.week.mon': 'M',
  'home.week.tue': 'T',
  'home.week.wed': 'W',
  'home.week.thu': 'T',
  'home.week.fri': 'F',
  'home.week.sat': 'S',
  'home.week.sun': 'S',

  // Quiz do casal
  'quiz.headerTitle': 'Couple Quiz',
  'quiz.headerSubtitle': 'Step {step} of {total} · {stepName}',
  'quiz.step.voces': 'You Two',
  'quiz.step.signoNascimento': 'Sign & Birth',
  'quiz.step.energia': 'Energy',
  'quiz.step.cartas': 'Cards',
  'quiz.step.astros': 'Stars',
  'quiz.hero.eyebrow': 'Couple astrology',
  'quiz.hero.title': 'Your Cosmic Trio',
  'quiz.hero.gold': 'in progress',
  'quiz.hero.sub': 'Sun + Ascendant + Moon. Cards. Couple compatibility. Your complete cosmic map.',
  'quiz.names.title': 'What are your names?',
  'quiz.names.yourName': 'Your name',
  'quiz.names.yourNamePlaceholder': 'E.g.: Ana',
  'quiz.names.partnerName': 'Your love\'s name',
  'quiz.names.partnerNamePlaceholder': 'E.g.: Leo',
  'quiz.energy.title': '{voce} and {amor}: what\'s your energy right now?',
  'quiz.cards.title': '{voce} and {amor}, pick 3 cards',
  'quiz.cards.progress': 'Now pick the {position} card · {count}/3',
  'quiz.cards.done': '{voce} & {amor}\'s past, present and future are already on the table.',
  'quiz.cards.position.past': 'Past',
  'quiz.cards.position.present': 'Present',
  'quiz.cards.position.future': 'Future',
  'quiz.nav.continue': 'Continue',
  'quiz.nav.seeReveal': 'See the reveal',
  'quiz.nav.saving': 'Saving…',
  'quiz.nav.saveAndSee': 'Save and see our beginning →',
  'quiz.datePicker.title': 'Date of birth',
  'quiz.datePicker.cancel': 'Cancel',
  'quiz.datePicker.confirm': 'Confirm',
  'quiz.datePicker.month.jan': 'Jan',
  'quiz.datePicker.month.feb': 'Feb',
  'quiz.datePicker.month.mar': 'Mar',
  'quiz.datePicker.month.apr': 'Apr',
  'quiz.datePicker.month.may': 'May',
  'quiz.datePicker.month.jun': 'Jun',
  'quiz.datePicker.month.jul': 'Jul',
  'quiz.datePicker.month.aug': 'Aug',
  'quiz.datePicker.month.sep': 'Sep',
  'quiz.datePicker.month.oct': 'Oct',
  'quiz.datePicker.month.nov': 'Nov',
  'quiz.datePicker.month.dec': 'Dec',
  'quiz.fallback.voce': 'you',
  'quiz.fallback.voces': 'you two',
  'quiz.fallback.seuAmor': 'your love',
  'quiz.aviso.needYourName': 'Write your name to continue.',
  'quiz.aviso.needPartnerName': 'Your love\'s name is missing.',
  'quiz.aviso.needBirthDate': '{name}\'s date of birth is missing.',
  'quiz.aviso.checkDates': 'Check the dates — we couldn\'t work out the sign.',
  'quiz.aviso.chooseEnergy': 'Choose your energy right now.',
  'quiz.aviso.pickCards_one': 'Pick 3 cards — {missing} to go.',
  'quiz.aviso.pickCards_other': 'Pick 3 cards — {missing} to go.',
  'quiz.aviso.fillStep': 'Fill in this step to continue.',
  'quiz.aviso.saveFailed': 'We couldn\'t save it. Please try again.',
  'quiz.loading.readingSky': 'Reading {voce} & {amor}\'s sky…',
  'quiz.loading.crossing': 'Crossing {signoVoce} with {signoAmor}…',
  'quiz.loading.tracing': 'Tracing your map…',
  'quiz.birth.title': 'Each of your birth dates',
  'quiz.birth.subtitle': 'The date alone gives us each of your signs. The time is optional — but it reveals the Ascendant.',
  'quiz.birth.dateOf': '{name}\'s date',
  'quiz.birth.timeOf': '{name}\'s time (optional)',
  'quiz.birth.cityOf': '{name}\'s city of birth (optional)',
  'quiz.birth.selectDate': 'Select date',
  'quiz.birth.selectCity': 'Select city',
  'quiz.birth.signOf': '{name}\'s sign:',
  'quiz.birth.hide': 'hide',
  'quiz.birth.notThisSign': 'that\'s not the sign',
  'quiz.energy.option.romantica': 'Romantic 💕',
  'quiz.energy.echo.romantica': 'It shows — this map will reveal where that spark comes from.',
  'quiz.energy.option.apaixonada': 'Passionate 🔥',
  'quiz.energy.echo.apaixonada': 'Intense. Let\'s see what holds it up when the flame settles.',
  'quiz.energy.option.poderosa': 'Powerful ⚡',
  'quiz.energy.echo.poderosa': 'Two forces together. That power needs care too.',
  'quiz.energy.option.reflexiva': 'Reflective 🌙',
  'quiz.energy.echo.reflexiva': 'A moment of looking inward, both of you.',
  'quiz.energy.option.distantes': 'Distant 🌫️',
  'quiz.energy.echo.distantes': 'Distance has a map too — and a way back, together.',
  'quiz.energy.option.conflito': 'In conflict 😔',
  'quiz.energy.echo.conflito': 'You\'re here, together, looking for this. That already says a lot.',
  'quiz.energy.option.crise': 'In crisis 💔',
  'quiz.energy.echo.crise': 'Moments like this squeeze hard. The two of you being here is already a good start.',
  'quiz.energy.option.recomecando': 'Starting over 🌱',
  'quiz.energy.echo.recomecando': 'Starting over takes courage. Let\'s begin with your sky.',
  'quiz.reveal.energyOf': '{voce} & {amor}\'s energy',
  'quiz.reveal.compatBadge': 'couple compatibility',
  'quiz.reveal.affinity': 'Affinity between your elements ({elementoA} + {elementoB}) · astrological reading, for fun',
  'quiz.reveal.strongHigh': 'Elements that set each other alight: {forte}',
  'quiz.reveal.strongMid': 'They balance each other well: {forte}',
  'quiz.reveal.strongLow': 'Different and magnetic: {forte}',
  'quiz.reveal.elementBadge': '{element} element',
  'quiz.reveal.strongPointLabel': 'Your strong point:',
  'quiz.reveal.careLabel': 'One thing to watch:',
  'quiz.reveal.energyNow': 'And your energy right now — "{desejo}" — matches this moment. 💛',
  'quiz.reveal.trioTitle': 'Sun · Moon · Ascendant',
  'quiz.reveal.moonLine': ': the Moon in {sign} {need}.',
  'quiz.reveal.moonNeed.fogo': 'needs spark and movement to feel at home',
  'quiz.reveal.moonNeed.terra': 'needs steadiness and concrete gestures to feel at peace',
  'quiz.reveal.moonNeed.ar': 'needs to talk and understand to feel close',
  'quiz.reveal.moonNeed.agua': 'needs tenderness and touch to feel safe',
  'quiz.reveal.moonsSame': 'Your Moons ask for the same thing: you settle in similar ways — there\'s a refuge of yours.',
  'quiz.reveal.moonsDiff': 'Your Moons ask for different things: that\'s where nearly every misunderstanding is born… and the way out, too.',
  'quiz.reveal.ascLine': ': Ascendant in {sign} {emoji}.',
  'quiz.reveal.ascPrecision': 'The Ascendant uses each of your exact birth times and cities — the more precise that information, the more reliable the result. A small difference in time can change the Ascendant sign.',
  'quiz.reveal.ascTeaser': 'The Ascendant — the first impression you give and the armor you wear under pressure — is calculated from your birth time and city. It\'s one of the parts that opens up inside the app.',
  'quiz.reveal.cardsTitle': 'Your cards',
  'quiz.reveal.cosmicNumbers': 'The couple\'s cosmic numbers',
  'quiz.reveal.goldenHour': '✷ Your golden hour: {time} ✷',
  'quiz.reveal.readingFooter': '{voce} & {amor}\'s reading — made today. Nobody chose this for you: you started this, today, together. What comes next gets written by what you do from here.',
  'quiz.reveal.todayTitle': 'That was today\'s reading 💫',
  'quiz.reveal.todayText': 'The couple\'s full birth chart — with more layers about how you communicate and come close — keeps building now, in your dashboard.',
  'quiz.nav.back': 'Back',

  // Horóscopo — textos sorteados por hash (o sorteio usa só o length, não muda por idioma)
  'horoscope.tab.yesterday': 'Yesterday',
  'horoscope.tab.today': 'Today',
  'horoscope.tab.tomorrow': 'Tomorrow',
  'horoscope.elementName.fogo': 'Fire',
  'horoscope.elementName.terra': 'Earth',
  'horoscope.elementName.ar': 'Air',
  'horoscope.elementName.agua': 'Water',
  'horoscope.diary.title': '{sign} horoscope — today',
  'horoscope.pickerTitle': 'Choose your sign',
  'horoscope.element': '{element} element',
  'horoscope.areasTitle': 'Areas of your life',
  'horoscope.area.amor': 'Love',
  'horoscope.area.trabalho': 'Work',
  'horoscope.area.saude': 'Health',
  'horoscope.area.dinheiro': 'Money',
  'horoscope.luckTitle': 'Your luck today',
  'horoscope.luck.color': 'Color',
  'horoscope.luck.number': 'Number',
  'horoscope.luck.hour': 'Hour',
  'horoscope.luck.colorName.violeta': 'Violet',
  'horoscope.luck.colorName.rosa': 'Pink',
  'horoscope.luck.colorName.dourado': 'Gold',
  'horoscope.luck.colorName.turquesa': 'Turquoise',
  'horoscope.luck.colorName.verde': 'Green',
  'horoscope.luck.colorName.ambar': 'Amber',
  'horoscope.luck.colorName.vermelho': 'Red',
  'horoscope.luck.colorName.azul': 'Blue',
  'horoscope.reading.ontem.1': 'Yesterday\'s energy brought important reflections about your bonds. What was left hanging asks for a calm resolution. The waning Moon favored closing cycles.',
  'horoscope.reading.ontem.2': 'Yesterday was a day for looking inward. A conversation left valuable lessons, even if the moment felt uncomfortable. What has passed already did its job.',
  'horoscope.reading.ontem.3': 'Yesterday asked for patience with yourself. Small frictions revealed what needs more attention this week. Nothing was lost, it only ripened.',
  'horoscope.reading.ontem.4': 'Yesterday brought a quiet invitation to let go of what no longer serves you. Mars\'s energy still echoed in quick decisions, but calm won by the end of the day.',
  'horoscope.reading.ontem.5': 'Yesterday\'s Moon favored memories and reunions. Something from the past came back to mind to finally be understood, not relived.',
  'horoscope.reading.ontem.6': 'Yesterday demanded organization and method. Backed-up tasks started to move, even if the pace felt far too slow for your liking.',
  'horoscope.reading.ontem.7': 'Yesterday\'s sky brought clarity about a feeling you\'d been avoiding naming. Facing it was the first step to turning the page.',
  'horoscope.reading.ontem.8': 'Yesterday was good for adjusting expectations. What seemed urgent lost its grip the moment you breathed deep and looked from further away.',
  'horoscope.reading.hoje.1': 'Today\'s sky asks for the courage to say yes to what\'s new. Venus lights up your relationships and softens the hard conversations. Trust your intuition — it rarely misses. A good day to start projects involving creativity and connection.',
  'horoscope.reading.hoje.2': 'Today asks for focus and less scattering. Mercury favors straight talk, so use it to settle whatever has been keeping you up at night.',
  'horoscope.reading.hoje.3': 'Today\'s sun lights up your self-confidence. A good moment to take a stand on something you\'d been putting off for fear of being judged.',
  'horoscope.reading.hoje.4': 'Today your intuition is sharper than usual. Pay attention to the small signs — they tend to point the right way.',
  'horoscope.reading.hoje.5': 'Today favors partnerships. One honest exchange can unstick something that\'s been jammed for ages, at work or at home.',
  'horoscope.reading.hoje.6': 'Today asks for lightness. Don\'t force answers: some things sort themselves out once you stop pushing so hard.',
  'horoscope.reading.hoje.7': 'Today\'s sky warms your closest relationships. It\'s worth carving out time for the people who matter, even with a full schedule.',
  'horoscope.reading.hoje.8': 'Today is a day for fine-tuning. Small changes to your routine pay off more than big decisions made in a hurry.',
  'horoscope.reading.amanha.1': 'Tomorrow Mercury favors practical decisions. A work opportunity may appear where you least expect it. Keep your eyes open and your heart light.',
  'horoscope.reading.amanha.2': 'Tomorrow tends to demand patience with deadlines. Unexpected news may reshuffle your plans — take it as an adjustment, not an obstacle.',
  'horoscope.reading.amanha.3': 'Tomorrow favors frank conversations. If there\'s something left to say to someone, this may be the right moment.',
  'horoscope.reading.amanha.4': 'Tomorrow the Moon favors rest. It\'s worth slowing down before making big decisions that can wait another day.',
  'horoscope.reading.amanha.5': 'Tomorrow promises movement in your finances. An unexpected expense or income calls for extra attention to planning.',
  'horoscope.reading.amanha.6': 'Tomorrow\'s sky opens room for small fresh starts. It doesn\'t take a grand gesture — one simple step already shifts the day.',
  'horoscope.reading.amanha.7': 'Tomorrow tends to bring clarity about a recent dilemma. The answer may not be the one you hoped for, but it will be the most honest.',
  'horoscope.reading.amanha.8': 'Tomorrow favors creativity. If something jams the traditional way, it\'s worth trying a path other than the usual one.',

  // Mapa Astral
  'birthchart.row.sun.label': 'Sun',
  'birthchart.row.sun.desc': 'Your essence and identity',
  'birthchart.row.sun.missing': 'Enter your birth date to calculate it.',
  'birthchart.row.moon.label': 'Moon',
  'birthchart.row.moon.desc': 'Your emotions and instincts',
  'birthchart.row.moon.missing': 'We couldn\'t calculate the Moon right now.',
  'birthchart.row.asc.label': 'Ascendant',
  'birthchart.row.asc.desc': 'How the world sees you',
  'birthchart.row.asc.missing': 'The Ascendant needs your exact birth time and city — add both to find out.',
  'birthchart.noTime': 'time not provided',
  'birthchart.positions': 'Positions',
  'birthchart.positionIn': '{label} in {sign}',

  // Agir — ideias de encontro, desafio de 7 dias, gesto do dia e meta da semana
  'agir.empty.title': 'Complete the couple quiz first',
  'agir.empty.desc': 'We need your names to keep your ideas, challenges and goals in the right place.',
  'agir.empty.cta': 'Take the couple quiz',
  'agir.ideas.title': 'An idea for a date',
  'agir.ideas.subtitle': 'No time to think it up? Let us suggest one.',
  'agir.ideas.prioritize': 'Prioritize ideas for your love language: {lang}',
  'agir.ideas.draw': 'Draw an idea ✨',
  'agir.ideas.inFavs': '💛 In favorites',
  'agir.ideas.addFav': '🤍 Add to favorites',
  'agir.ideas.emptyFavTitle': 'No favorites yet',
  'agir.ideas.emptyFavDesc': 'Draw an idea and keep the ones you love best right here.',
  'agir.ideas.emptyFavCta': 'Draw an idea now',
  'agir.ideas.favCount': 'Favorites ({count})',
  'agir.ideas.tag.casa': 'at home',
  'agir.ideas.tag.arLivre': 'outdoors',
  'agir.ideas.tag.economico': 'easy on the wallet',
  'agir.ideas.tag.especial': 'special',
  'agir.ideas.i1': 'Movie night at home: each of you picks a film, the other makes the popcorn.',
  'agir.ideas.i2': 'Cook a new recipe together, one neither of you has ever made.',
  'agir.ideas.i3': 'A picnic on the living room floor, lights off and candles lit.',
  'agir.ideas.i4': 'A games afternoon: cards, board games or video games, with affection as the prize.',
  'agir.ideas.i5': 'A walk at sunset somewhere you\'ve never been together.',
  'agir.ideas.i6': 'Take a coffee, sit on a park bench and watch the day go by.',
  'agir.ideas.i7': 'Ride your bikes through a park on a sunny morning.',
  'agir.ideas.i8': 'Lie on the grass at night and try to find constellations together.',
  'agir.ideas.i9': 'Go to a local market: buy ingredients and improvise a dinner.',
  'agir.ideas.i10': 'Visit a bookshop and gift each other an inexpensive book.',
  'agir.ideas.i11': 'Take a walk around the neighborhood, pretending to be tourists in your own city.',
  'agir.ideas.i12': 'Ice cream afternoon: try a flavor neither of you would order alone.',
  'agir.ideas.i13': 'Recreate your first date, exactly as it happened.',
  'agir.ideas.i14': 'Write each other a letter and swap them at dinner.',
  'agir.ideas.i15': 'Plan a one-day micro-getaway together for next month.',
  'agir.lang.palavras': 'words of affirmation',
  'agir.lang.tempo': 'quality time',
  'agir.lang.presentes': 'gifts',
  'agir.lang.servico': 'acts of service',
  'agir.lang.toque': 'physical touch',
  'agir.challenge.title': '7-day challenge',
  'agir.challenge.subtitle': 'One gesture a day. At your own pace, tick them off as you go.',
  'agir.challenge.day': 'Day {n}. ',
  'agir.challenge.complete': 'Challenge complete! {voce} and {amor} took on 7 days of gestures. 💛',
  'agir.challenge.d1': 'Send a message saying something you admire about them.',
  'agir.challenge.d2': 'Give a 20-second hug, no rushing.',
  'agir.challenge.d3': 'Ask a question you\'ve never asked before and really listen.',
  'agir.challenge.d4': 'Take on a chore that\'s usually theirs, asking nothing in return.',
  'agir.challenge.d5': 'Remember together a good moment you\'ve lived.',
  'agir.challenge.d6': 'Compliment something small that usually goes unnoticed.',
  'agir.challenge.d7': 'Plan something simple together for next week.',
  'agir.gesture.title': 'Gesture of the day',
  'agir.gesture.subtitle': 'One simple idea a day — the same one for both of you today.',
  'agir.gesture.g1': 'Make the coffee or a snack exactly the way they like it.',
  'agir.gesture.g2': 'Send a message mid-morning just to say they crossed your mind.',
  'agir.gesture.g3': 'Set aside 10 phone-free minutes just to talk, looking each other in the eye.',
  'agir.gesture.g4': 'Give a sincere compliment about something beyond looks.',
  'agir.gesture.g5': 'Leave a sweet little note where they\'ll find it.',
  'agir.gesture.g6': 'Offer a touch on their head or back, for no reason at all.',
  'agir.gesture.g7': 'Ask how their day went and listen without interrupting.',
  'agir.gesture.g8': 'Take on a small household task to lighten their day.',
  'agir.gesture.g9': 'Bring up a funny moment you lived through together.',
  'agir.gesture.g10': 'Thank them for something specific they did recently.',
  'agir.goal.title': 'Goal of the week',
  'agir.goal.subtitle': 'Agree on something to look after together this week.',
  'agir.goal.label': 'Our goal',
  'agir.goal.placeholder': 'E.g.: Dinner with no phones twice this week',
  'agir.goal.save': 'Save goal',

  // Descobrir — linguagem do amor, estilo de apego e conflitos
  'descobrir.empty.title': 'Complete the couple quiz first',
  'descobrir.empty.desc': 'We need your names to keep the results in the right place.',
  'descobrir.empty.cta': 'Take the couple quiz',
  'descobrir.intro': 'Two quick tests to help {voce} and {amor} open a good conversation. There are no right or wrong answers — just an invitation to understand each other more kindly.',
  'descobrir.disclaimer': 'This is a reflection to talk about, not a diagnosis. Nobody fits inside a label — and these ways of loving and bonding can change and grow over time.',
  'descobrir.tab.linguagem': 'Love language',
  'descobrir.tab.apego': 'Attachment style',
  'descobrir.tab.conflitos': 'Conflicts',
  'descobrir.quiz.dica': 'Tip',
  'descobrir.quiz.balance': 'Here\'s how your balance turned out',
  'descobrir.quiz.redo': 'Redo',
  'descobrir.quiz.progress': 'Question {step} of {total}',
  'descobrir.quiz.back': 'Back',
  'descobrir.quiz.next': 'Next',
  'descobrir.quiz.seeResult': 'See result',
  'descobrir.lang.badge': '{name}\'s main love language',
  'descobrir.lang.label.palavras': 'Words of affirmation',
  'descobrir.lang.label.tempo': 'Quality time',
  'descobrir.lang.label.presentes': 'Gifts',
  'descobrir.lang.label.servico': 'Acts of service',
  'descobrir.lang.label.toque': 'Physical touch',
  'descobrir.lang.q1': 'What makes you feel most loved day to day?',
  'descobrir.lang.q1.opt.palavras': 'Hearing a sincere compliment or a genuine "thank you"',
  'descobrir.lang.q1.opt.tempo': 'Spending time that\'s only ours, unhurried and phone-free',
  'descobrir.lang.q1.opt.presentes': 'Getting a small something that shows I was on their mind',
  'descobrir.lang.q1.opt.servico': 'Someone sorting something out for me before I even ask',
  'descobrir.lang.q1.opt.toque': 'A tight hug or holding hands',
  'descobrir.lang.q2': 'After a hard day, what comforts you most?',
  'descobrir.lang.q2.opt.palavras': 'Hearing "I\'m here with you, it\'s going to be okay"',
  'descobrir.lang.q2.opt.tempo': 'Sitting together and talking it all through, calmly',
  'descobrir.lang.q2.opt.presentes': 'Coming home to find a little something waiting for me',
  'descobrir.lang.q2.opt.servico': 'Someone having taken care of a task that was mine',
  'descobrir.lang.q2.opt.toque': 'A long hug, a hand through my hair, feeling held',
  'descobrir.lang.q3': 'How do you usually show affection to the person you love?',
  'descobrir.lang.q3.opt.palavras': 'Saying out loud, in plain words, how much I admire them',
  'descobrir.lang.q3.opt.tempo': 'Setting aside time just to be together',
  'descobrir.lang.q3.opt.presentes': 'Choosing gifts that mean something',
  'descobrir.lang.q3.opt.servico': 'Doing practical things that make their life easier',
  'descobrir.lang.q3.opt.toque': 'With hugs, kisses and closeness',
  'descobrir.lang.q4': 'What would your ideal weekend for two look like?',
  'descobrir.lang.q4.opt.palavras': 'Sharing lots of good conversation and tender words',
  'descobrir.lang.q4.opt.tempo': 'A quiet plan, with full attention on each other',
  'descobrir.lang.q4.opt.presentes': 'A small surprise or a simple exchange of gifts',
  'descobrir.lang.q4.opt.servico': 'Getting the house sorted together, then relaxing with nothing on our minds',
  'descobrir.lang.q4.opt.toque': 'Lots of cuddling, from breakfast in bed to a film in each other\'s arms',
  'descobrir.lang.q5': 'When you\'re apart, what do you miss most?',
  'descobrir.lang.q5.opt.palavras': 'The sweet messages and the "good morning, my love"',
  'descobrir.lang.q5.opt.tempo': 'Our conversations with no closing time',
  'descobrir.lang.q5.opt.presentes': 'Getting (and sending) that little something from afar',
  'descobrir.lang.q5.opt.servico': 'Having someone to share the day\'s tasks with',
  'descobrir.lang.q5.opt.toque': 'The hug, and simply being close by',
  'descobrir.lang.q6': 'Which gesture from your love touches you deepest?',
  'descobrir.lang.q6.opt.palavras': 'When they notice something in me and say it out loud',
  'descobrir.lang.q6.opt.tempo': 'When they drop everything just to give me their attention',
  'descobrir.lang.q6.opt.presentes': 'When they remember a detail and turn it into a gift',
  'descobrir.lang.q6.opt.servico': 'When they step in to lift a weight off me without being asked',
  'descobrir.lang.q6.opt.toque': 'When they pull me close at an unexpected moment',
  'descobrir.lang.result.palavras.texto': 'You bloom when love becomes words: a sincere compliment, an "I\'m proud of you", an unexpected note. Hearing out loud that you are loved gives you security and warms your day. Recognition, for you, is a concrete form of care.',
  'descobrir.lang.result.palavras.dica': 'A tip for you two: agree to say, every night, one thing you admired in each other that day — a message counts too.',
  'descobrir.lang.result.tempo.texto': 'What fills you most is real attention: being together, unhurried and undistracted. Time that belongs only to you two is worth more than anything material. Presence, for you, is the greatest proof of love.',
  'descobrir.lang.result.tempo.dica': 'A tip for you two: keep one fixed screen-free slot each week — even if it\'s just 20 minutes to talk, looking each other in the eye.',
  'descobrir.lang.result.presentes.texto': 'For you, a gift isn\'t about the price — it\'s about the intention behind it. One simple token shows that someone thought of you even from afar. Those gestures become symbols of affection you carry with you.',
  'descobrir.lang.result.presentes.dica': 'A tip for you two: keep a little "list of details" about each other (tastes, dreams, wishes) so the next surprises land perfectly.',
  'descobrir.lang.result.servico.texto': 'You feel love when it turns into action: someone who solves, helps and lifts a weight off your shoulders. Practical acts, for you, speak louder than promises. Taking care of daily life together is your favorite way to love and be loved.',
  'descobrir.lang.result.servico.dica': 'A tip for you two: ask each other "what can I take off your shoulders today?" — and let the other feel they\'re not alone.',
  'descobrir.lang.result.toque.texto': 'For you, connection runs largely through the body: a hug, a held hand, the touch that soothes. Affectionate contact makes you feel safe and present in the bond. That\'s the path where tenderness reaches deepest.',
  'descobrir.lang.result.toque.dica': 'A tip for you two: build small rituals of touch — a 20-second hug when you meet again already changes the mood of the day.',
  'descobrir.att.badge': '{name}\'s predominant style',
  'descobrir.att.label.seguro': 'Secure style',
  'descobrir.att.label.ansioso': 'Anxious style',
  'descobrir.att.label.evitativo': 'Avoidant style',
  'descobrir.att.q1': 'When a disagreement comes up between you, you tend to...',
  'descobrir.att.q1.opt.seguro': 'Talk it out calmly, trusting you\'ll work it out together',
  'descobrir.att.q1.opt.ansioso': 'Get anxious and want to settle it all right now',
  'descobrir.att.q1.opt.evitativo': 'Need time alone before you can talk about it',
  'descobrir.att.q2': 'When your love takes a while to answer a message...',
  'descobrir.att.q2.opt.seguro': 'I stay calm, I know they reply when they can',
  'descobrir.att.q2.opt.ansioso': 'I start imagining that maybe something\'s wrong',
  'descobrir.att.q2.opt.evitativo': 'I barely notice — each of us at our own pace',
  'descobrir.att.q3': 'About talking feelings in the relationship...',
  'descobrir.att.q3.opt.seguro': 'I feel at ease opening my heart',
  'descobrir.att.q3.opt.ansioso': 'I really want to, but sometimes I fear I\'m being too much',
  'descobrir.att.q3.opt.evitativo': 'I\'d rather keep some things to myself',
  'descobrir.att.q4': 'In moments of great closeness and intimacy...',
  'descobrir.att.q4.opt.seguro': 'I enjoy the connection without stopping being myself',
  'descobrir.att.q4.opt.ansioso': 'I\'d like it to be like that, close together, all the time',
  'descobrir.att.q4.opt.evitativo': 'Every now and then I need room to breathe',
  'descobrir.att.q5': 'Thinking about relying on each other day to day...',
  'descobrir.att.q5.opt.seguro': 'I trust them and I also like being their support',
  'descobrir.att.q5.opt.ansioso': 'I\'m afraid that one day I\'ll be left aside',
  'descobrir.att.q5.opt.evitativo': 'Most of the time, I\'d rather rely on myself',
  'descobrir.att.result.seguro.texto': 'You tend to feel comfortable both in closeness and in your own individuality. You trust naturally and can speak about what you feel without losing yourself in the process. This isn\'t a fixed label — it\'s a way of being that gets built and tended day by day.',
  'descobrir.att.result.seguro.dica': 'A tip for you two: use that base of trust to build a "safe space" where you can talk about insecurities without fear of being judged.',
  'descobrir.att.result.ansioso.texto': 'You value connection deeply and sometimes stay alert to signs of distance, looking to reinforce the bond. That watchfulness shows how much the relationship matters to you. It isn\'t a flaw — it\'s a need for closeness that can be talked about with tenderness.',
  'descobrir.att.result.ansioso.dica': 'A tip for you two: agree on small reassuring gestures (an "I\'m here", a reliable good morning) that soothe without becoming a demand.',
  'descobrir.att.result.evitativo.texto': 'You value your autonomy and sometimes need space of your own to process before sharing. That doesn\'t mean loving less — it\'s a way of feeling safe. Recognizing that rhythm helps you both meet halfway.',
  'descobrir.att.result.evitativo.dica': 'A tip for you two: when you need space, say so kindly ("I need a little while, I\'ll be back") so the other doesn\'t read it as pulling away.',
  'descobrir.conf.q1': 'When there\'s a conflict between {voce} and {amor}, who usually takes the first step?',
  'descobrir.conf.both': 'Both equally',
  'descobrir.conf.none': 'Neither, so far',
  'descobrir.conf.q2': 'Which challenge do you most want to work through together?',
  'descobrir.conf.desafio.comunicacao': 'Communication',
  'descobrir.conf.desafio.rotina': 'Routine vs. romance',
  'descobrir.conf.desafio.confianca': 'Trust',
  'descobrir.conf.desafio.redescobrir': 'Rediscovering each other',
  'descobrir.conf.statFirstStep': 'takes the first step',
  'descobrir.conf.statChallenge': 'challenge to work on',
  'descobrir.conf.saved': 'Saved — this helps personalize what you see in Reconnect.',

  // Reconectar — trilhas e modo SOS
  'reconectar.header.title': 'Reconnect',
  'reconectar.header.subtitle': 'Strengthen your bond',
  'reconectar.gate.title': 'Complete the couple quiz first',
  'reconectar.gate.desc': 'We need your names to keep your track progress in the right place.',
  'reconectar.gate.cta': 'Take the couple quiz',
  'reconectar.celebrate.title': 'You did it, {voce} & {amor}!',
  'reconectar.celebrate.desc': 'You completed the "{title}" track together. One more step, real and shared.',
  'reconectar.sos.overline': 'Immediate help',
  'reconectar.sos.title': 'SOS mode — right after a fight',
  'reconectar.sos.desc': '4 short steps to bring the tension down now, no track needed.',
  'reconectar.sos.next': 'Done, next step',
  'reconectar.sos.finish': 'We finished the 4 steps 💛',
  'reconectar.sos.step.0': 'Breathe deep, each in your own way, before saying anything else.',
  'reconectar.sos.step.1': 'Whoever can go first, say out loud: "I don\'t want to fight with you, I want to understand you".',
  'reconectar.sos.step.2': 'Listen to each other without interrupting or defending — just to understand, not to reply yet.',
  'reconectar.sos.step.3': 'Offer each other a 20-second hug, even if something is still unresolved.',
  'reconectar.intro.title': 'Rekindling the connection',
  'reconectar.intro.text': 'Reconnecting isn\'t about convincing or controlling anyone — it\'s about listening, caring and communicating honestly again. Pick a track and do one small mission a day, at your own pace. Small gestures, repeated, rebuild the bond.',
  'reconectar.intro.disclaimer': 'For serious matters, consider couples therapy with a professional.',
  'reconectar.progress.overline': 'Your progress together',
  'reconectar.progress.done': '✅ done',
  'reconectar.progress.pending': '⏳ pending',
  'reconectar.progress.tracks': '🏁 tracks',
  'reconectar.tracksTitle': 'Reconnection tracks',
  'reconectar.recommendedIntro': 'Based on how you bond and where you are today, we suggest starting with the track marked below.',
  'reconectar.recommendedBadge': '✷ suggested for today',
  'reconectar.trackComplete': 'Track complete. Whenever you like, you can revisit it together.',
  'reconectar.disclaimer': 'Your track progress is saved on this device only.',
  'reconectar.track.conversar.title': 'Talking again',
  'reconectar.track.conversar.intro': 'Small gestures to reopen the channel and really hear each other.',
  'reconectar.track.conversar.step.0': 'Listen to your partner for 2 minutes without interrupting, then sum up in your own words what you heard.',
  'reconectar.track.conversar.step.1': 'Send a short message asking how their day went — and read the answer carefully.',
  'reconectar.track.conversar.step.2': 'Pick an unhurried moment to talk, with your phones out of reach.',
  'reconectar.track.conversar.step.3': 'Ask an open question ("what have you been feeling lately?") instead of a yes-or-no one.',
  'reconectar.track.conversar.step.4': 'Share something of yours first: say how you\'ve been feeling, starting with "I feel...".',
  'reconectar.track.conversar.step.5': 'Agree on a fixed slot each week, just for you two, to catch up.',
  'reconectar.track.frieza.title': 'Thawing the coldness',
  'reconectar.track.frieza.intro': 'Warming the air little by little, without pressure and at both your paces.',
  'reconectar.track.frieza.step.0': 'Greet your partner with a good morning or good night, even on the hardest days.',
  'reconectar.track.frieza.step.1': 'Say out loud something you admire about them.',
  'reconectar.track.frieza.step.2': 'Offer an affectionate touch — a hand on the shoulder, a hug — if it\'s comfortable for both.',
  'reconectar.track.frieza.step.3': 'Breathe before speaking when you feel yourself shutting down, so you don\'t reply on autopilot.',
  'reconectar.track.frieza.step.4': 'Say "I missed you" when it\'s true, expecting nothing in return.',
  'reconectar.track.frieza.step.5': 'Pick a small habit of yours back up: a coffee together, a song, a walk.',
  'reconectar.track.carinho.title': 'Rebuilding tenderness',
  'reconectar.track.carinho.intro': 'Watering affection with attention, gratitude and presence.',
  'reconectar.track.carinho.step.0': 'Thank your partner for something specific they did today, however small it seems.',
  'reconectar.track.carinho.step.1': 'Send a message recalling a good moment you lived together.',
  'reconectar.track.carinho.step.2': 'Give a sincere compliment about who they are, not just what they do.',
  'reconectar.track.carinho.step.3': 'Offer help with something you know weighs on them, without waiting to be asked.',
  'reconectar.track.carinho.step.4': 'Set aside 10 minutes just to be together, solving nothing — only presence.',
  'reconectar.track.carinho.step.5': 'Write a short note saying what you value about having this person close.',
  'reconectar.track.confianca.title': 'Restoring trust',
  'reconectar.track.confianca.intro': 'Rebuilding safety with transparency and honest repairs.',
  'reconectar.track.confianca.step.0': 'Keep one small promise this week, and let them know kindly when you\'ve kept it.',
  'reconectar.track.confianca.step.1': 'Apologize for something specific, without adding a "but" afterwards.',
  'reconectar.track.confianca.step.2': 'Listen to your partner\'s pain all the way through, without defending yourself, and validate what they felt.',
  'reconectar.track.confianca.step.3': 'Make a request starting with "I feel..." instead of accusing ("I feel insecure when...").',
  'reconectar.track.confianca.step.4': 'Be transparent about something you used to avoid telling, at your own pace.',
  'reconectar.track.confianca.step.5': 'Agree together on a small pact for living side by side, and review it in a week.',

  // Linha do tempo — memórias e cápsulas
  'timeline.header.title': 'Timeline',
  'timeline.header.subtitle': 'Couple\'s memories',
  'timeline.gate.title': 'Complete the couple quiz first',
  'timeline.gate.desc': 'We need your names to keep your memories in the right place.',
  'timeline.gate.cta': 'Take the couple quiz',
  'timeline.link.badge': '✷ Couple horoscope ✷',
  'timeline.link.text': 'See today\'s energy between {voce} and {amor} →',
  'timeline.section.timeline': 'Timeline',
  'timeline.stat.memories': '📸 memories',
  'timeline.stat.capsules': '⏳ capsules',
  'timeline.empty.memories.title': 'No memories saved yet',
  'timeline.empty.memories.desc': 'Add the first chapter of {voce} and {amor}\'s story 👇',
  'timeline.delete': 'delete',
  'timeline.dateFormat': '{month} {d}, {y}',
  'timeline.month.0': 'Jan',
  'timeline.month.1': 'Feb',
  'timeline.month.2': 'Mar',
  'timeline.month.3': 'Apr',
  'timeline.month.4': 'May',
  'timeline.month.5': 'Jun',
  'timeline.month.6': 'Jul',
  'timeline.month.7': 'Aug',
  'timeline.month.8': 'Sep',
  'timeline.month.9': 'Oct',
  'timeline.month.10': 'Nov',
  'timeline.month.11': 'Dec',
  'timeline.defaultMemory.1.title': 'First date',
  'timeline.defaultMemory.1.text': 'That coffee that turned into 4 hours of talking.',
  'timeline.defaultMemory.2.title': 'First trip together',
  'timeline.defaultMemory.2.text': 'Beach, rain and the two of us laughing at everything.',
  'timeline.defaultMemory.3.title': 'A real "I love you"',
  'timeline.defaultMemory.3.text': 'Unhurried, the way it should be.',
  'timeline.addMemory.section': 'Add a memory',
  'timeline.addMemory.titleLabel': 'Title',
  'timeline.addMemory.titlePlaceholder': 'E.g.: Our first trip',
  'timeline.addMemory.dateLabel': 'Date',
  'timeline.selectDate': 'Select date',
  'timeline.addMemory.descLabel': 'Description',
  'timeline.addMemory.descPlaceholder': 'A detail you never want to forget',
  'timeline.addMemory.save': 'Save memory 💛',
  'timeline.datePicker.memoryTitle': 'Memory date',
  'timeline.capsules.section': 'Time capsules ⏳',
  'timeline.capsules.empty.title': 'No capsules yet',
  'timeline.capsules.empty.desc': 'Record a message that opens in the future 👇',
  'timeline.capsule.opened': 'Capsule opened!',
  'timeline.capsule.sealed': 'Sealed capsule',
  'timeline.capsule.daysLeft_one': '{n} day',
  'timeline.capsule.daysLeft_other': '{n} days',
  'timeline.capsule.opensOn': 'opens on {date}',
  'timeline.createCapsule.section': 'Create a capsule',
  'timeline.createCapsule.msgLabel': 'Message for the future',
  'timeline.createCapsule.msgPlaceholder': 'E.g.: Remember this day?',
  'timeline.createCapsule.openAtLabel': 'Open on',
  'timeline.createCapsule.seal': 'Seal capsule ⏳',
  'timeline.createCapsule.hint': 'Tip: to watch a capsule "open", pick today\'s or yesterday\'s date.',
  'timeline.disclaimer': 'Your memories and capsules are saved on this device only.',

  // Diário Cósmico
  'diary.date': '{month} {d}',
  'diary.month.0': 'January',
  'diary.month.1': 'February',
  'diary.month.2': 'March',
  'diary.month.3': 'April',
  'diary.month.4': 'May',
  'diary.month.5': 'June',
  'diary.month.6': 'July',
  'diary.month.7': 'August',
  'diary.month.8': 'September',
  'diary.month.9': 'October',
  'diary.month.10': 'November',
  'diary.month.11': 'December',
  'diary.filter.all': 'All',
  'diary.filter.tarot': 'Tarot',
  'diary.filter.palma': 'Palm',
  'diary.filter.rosto': 'Face',
  'diary.filter.pe': 'Foot',
  'diary.filter.pintas': 'Moles',
  'diary.filter.coffee': 'Coffee',
  'diary.filter.dream': 'Dream',
  'diary.pinned.banner': 'PINNED',
  'diary.withInsight': '🎙️ with insight',

  // Assinatura
  'planos.header.title': 'Subscription',
  'planos.header.subtitle': '3 plans · all with a 7-day free trial',
  'planos.unlockTitle': 'Unlock the full couple experience',
  'planos.unlockTitleSolo': 'Unlock unlimited individual readings',
  'planos.benefit.1': '7-day free trial, no commitment',
  'planos.benefit.2': 'Unlimited readings: Horoscope, Birth Chart, Tarot, Compatibility, Chat, Palm, Coffee, Dreams and Lunar Calendar',
  'planos.benefit.3': 'Reconnect — reconnection routes for couples',
  'planos.benefit.4': 'Discover — games and date ideas',
  'planos.benefit.5': 'Take Action — weekly goals',
  'planos.benefit.6': 'Progress and Retrospective of your journey',
  'planos.benefit.7': 'Timeline and saved time capsules',
  'planos.plan.trial.label': 'Monthly',
  'planos.plan.trial.cycle': '/month',
  'planos.plan.trial.detail': '7 days free, then US$5/month',
  'planos.plan.quarterly.label': 'Quarterly',
  'planos.plan.quarterly.cycle': '/3 months',
  'planos.plan.quarterly.detail': '7 days free · US$3.33/month',
  'planos.plan.quarterly.badge': 'Save 33%',
  'planos.plan.annual.label': 'Annual',
  'planos.plan.annual.cycle': '/year',
  'planos.plan.annual.detail': '7 days free · US$1.67/month',
  'planos.plan.annual.badge': 'Best deal',
  'planos.cta.trial': 'Start my 7-day free trial →',
  'planos.cta.quarterly': 'Start 7-day free trial (Quarterly) →',
  'planos.cta.annual': 'Start 7-day free trial (Annual) →',
  'planos.preparing': 'Preparing secure checkout…',
  'planos.errorGeneric': 'We couldn\'t open checkout right now. Please try again shortly.',
  'planos.openOtherTab': 'Open checkout in another tab →',
  'planos.back': '← Back',
  'planos.alreadySubscriber': 'You\'re already a subscriber',
  'planos.status.active': 'Active',
  'planos.status.pastDue': 'Payment overdue',
  'planos.status.pending': 'Awaiting confirmation',
  'planos.status.canceled': 'Canceled',
  'planos.status.expired': 'Expired',
  'planos.renewsOn': 'Renews on {date}',
  'planos.loginRequired.title': 'Log in to subscribe',
  'planos.loginRequired.text': 'We need an account to link your subscription to you — that way, if you switch devices, your access stays with you.',
  'planos.loginRequired.cta': 'Log in →',
  'planos.statusLine': 'Status: {status}',

  // Loja — recompensas e brindes espirituais
  'loja.header.title': 'Shop',
  'loja.header.subtitle': 'Trade tokens for rewards',
  'loja.balanceLabel': 'tokens available',
  'loja.sectionRewards': 'Rewards',
  'loja.costTokens': '{cost} tokens',
  'loja.redeem': 'Redeem',
  'loja.open': 'Open',
  'loja.owned': 'yours — open it whenever you like',
  'loja.sectionBrindes': 'Spiritual gifts',
  'loja.sectionBrindesSubtitle': 'Earn tokens in the daily missions and trade them for treats delivered instantly.',
  'loja.wallpaperDownload': 'Download “{nome}”',
  'loja.reward.selo-cosmico.title': 'Cosmic Seal on your profile',
  'loja.reward.selo-cosmico.description': 'A special little seal next to your name in your Profile — solo or as a couple.',
  'loja.reward.destaque-diario.title': 'Diary Highlight',
  'loja.reward.destaque-diario.description': 'Pins a reading of your choice to the top of your Cosmic Diary for 7 days.',
  'loja.reward.leitura-bonus.title': 'Bonus Reading',
  'loja.reward.leitura-bonus.description': 'Unlocks an extra Tarot reading outside your normal rhythm (even a theme you already drew today).',
  'loja.reward.escudo-sequencia.title': 'Streak Shield',
  'loja.reward.escudo-sequencia.description': 'Keeps your streak from breaking if you forget to use the app for 1 day.',
  'loja.reward.tema-dourado.title': 'Exclusive gold theme',
  'loja.reward.tema-dourado.description': 'The whole app in gold — one-time purchase, turn it on and off whenever you like in your Profile.',
  'loja.brinde.brinde-ritual-lua.title': 'Full Moon Ritual Guide',
  'loja.brinde.brinde-ritual-lua.description': 'A 4-step guided ritual for the next Full Moon — yours forever, reopen it whenever you like.',
  'loja.brinde.brinde-wallpapers.title': 'Mystic Wallpaper Pack',
  'loja.brinde.brinde-wallpapers.description': '3 exclusive wallpapers (1080×1920) to download right away.',
  'loja.brinde.brinde-tiragem-exclusiva.title': 'Inner Moon Spread',
  'loja.brinde.brinde-tiragem-exclusiva.description': 'An exclusive 3-position spread + 1 Bonus Tarot Reading already credited for you to use on it.',
  'loja.brinde.brinde-incenso.title': 'Mystic Incense (7-stick kit)',
  'loja.brinde.brinde-incenso.description': 'A kit of natural incense shipped to your home — coming soon.',
  'loja.brinde.brinde-cristal.title': 'Quartz Crystal',
  'loja.brinde.brinde-cristal.description': 'Natural quartz hand-picked and shipped to your home — coming soon.',
  'loja.alert.goldAlready.title': 'You already have the Gold Theme',
  'loja.alert.goldAlready.text': 'Turn it on and off whenever you like in Profile > Preferences.',
  'loja.alert.shield.title': 'Shield activated!',
  'loja.alert.shield.text': '{count} shield(s) saved — protects your next broken streak.',
  'loja.alert.seal.title': 'Seal activated!',
  'loja.alert.seal.text': 'It\'s already showing next to your names in your Profile.',
  'loja.alert.bonusReading.title': 'Bonus Reading saved!',
  'loja.alert.bonusReading.text': 'Go to Tarot, pick the theme (even one you already drew today) and tap the "Use Bonus Reading" button ({count} available).',
  'loja.alert.pin.title': 'Highlight saved!',
  'loja.alert.pin.text': 'Open your Cosmic Diary, tap the reading you want and use "Pin to top for 7 days".',
  'loja.alert.goldGranted.title': 'The Gold Theme is yours!',
  'loja.alert.goldGranted.text': 'Reloading to apply the new look…',
  'loja.alert.goldGranted.cta': 'Apply now',
  'loja.alert.redeemed.title': 'Redeemed!',
  'loja.alert.redeemed.text': '"{title}" redeemed successfully.',
  'loja.alert.noBalance.title': 'Not enough tokens',
  'loja.alert.noBalance.rewardText': 'You have {balance} tokens, but that reward costs {cost}. Complete more readings to earn tokens.',
  'loja.alert.noBalance.brindeText': 'You have {balance} tokens, but that gift costs {cost}. Complete the daily missions and readings to earn more.',
  'loja.alert.noBalance.cta': 'Earn tokens now',
  'loja.alert.noBalance.dismiss': 'Not now',
  'loja.alert.physical.title': 'Almost there',
  'loja.alert.physical.text': 'Physical gifts are still being prepared — no tokens were spent.',

  // Meus Tokens
  'tokens.header.title': 'My Tokens',
  'tokens.header.subtitle': 'Your accumulated energy',
  'tokens.seeShop': 'View Shop',
  'tokens.balanceLabel': 'tokens earned',
  'tokens.historyTitle': 'History',
  'tokens.empty': 'No transactions yet — complete a reading to earn your first tokens!',
  'tokens.emptyCta': 'Do a reading now',
  'tokens.history.dateTime': '{date} at {time}',

  // Paywall e portões de casal
  'gate.teaser.title': 'Continue with a subscription',
  'gate.teaser.price': '$5 USD/month · 7 days free, no commitment',
  'gate.teaser.cta': 'Subscribe →',
  'gate.solo.title': 'This one is meant for two',
  'gate.solo.text': 'Reconnection routes, games, date ideas and the retrospective only make sense with both of you.',
  'gate.solo.cta': 'Subscribe now →',
  'gate.solo.inviteCta': 'or invite your partner to unlock this →',

  // Perfil
  'profile.header.title': 'Profile',
  'profile.soloUniverse': 'Your universe · {sign}',
  'profile.noCouple': 'Couple not set up yet',
  'profile.soloInviteHint': 'Invite your partner whenever you like — Home tab',
  'profile.noCoupleHint': 'Complete the couple quiz on the Home tab',
  'profile.section.account': 'Account',
  'profile.section.preferences': 'Preferences',
  'profile.section.support': 'Support',
  'profile.row.email': 'Email',
  'profile.row.login': 'Sign in',
  'profile.row.installApp': 'Install app',
  'profile.row.manageSubscription': 'Manage subscription',
  'profile.row.subscribe': 'Subscribe',
  'profile.row.recovering': 'Recovering...',
  'profile.row.recoverSubscription': 'Recover my subscription',
  'profile.row.redoQuiz': 'Redo the couple quiz',
  'profile.row.addPartner': 'Add partner',
  'profile.row.sendInvite': 'Send an invite to {amor}',
  'profile.row.myTokens': 'My Tokens ({count})',
  'profile.row.goldTheme': 'Gold theme',
  'profile.row.dailyThought': 'Daily cosmic thought',
  'profile.row.appVersion': 'App version',
  'profile.pref.language': 'Language',
  'profile.name.editTitle': 'Edit name',
  'profile.name.placeholder': 'Your name',
  'profile.name.saving': 'Saving...',
  'profile.name.save': 'Save',
  'profile.name.emptyTitle': 'Empty name',
  'profile.name.emptyText': 'Type a name before saving.',
  'profile.name.saveErrorTitle': 'Could not save',
  'profile.name.saveErrorFallback': 'Try again in a moment.',
  'profile.delete.title': 'Delete account',
  'profile.delete.text': 'This will sign you out and erase the data saved on this device (names, signs, dates and the couple streak). The login account itself keeps existing — to remove it for good, write to contato@cosmicguide.cloud.',
  'profile.delete.confirmWipe': 'Sign out and erase local data',
  'profile.delete.justSignOut': 'Just sign out',
  'profile.signOut.title': 'Sign out',
  'profile.signOut.text': 'Are you sure you want to sign out?',
  'profile.signOut.confirm': 'Sign out',
  'profile.install.iosTitle': 'Install on iPhone or iPad',
  'profile.install.iosText': 'Open this site in Safari (it has to be Safari, it won\'t work in another browser). Tap the Share icon (□↑) in the bottom bar, scroll the list of options until you find "Add to Home Screen" and confirm by tapping "Add" in the top corner.',
  'profile.install.genericTitle': 'Install the app',
  'profile.install.genericText': 'Open your browser menu and look for "Install app" or "Add to Home Screen".',
  'profile.notif.permTitle': 'Permission needed',
  'profile.notif.permText': 'Turn on Cosmic Guide notifications in your device settings to get the daily cosmic thought.',
  'profile.recover.successTitle': 'Subscription recovered',
  'profile.recover.successText': 'Your subscription is now linked to this account. You can sign in with it on any device.',
  'profile.recover.emptyTitle': 'Nothing found on this device',
  'profile.recover.emptyText': 'There\'s no subscription stored here. If you subscribed on another phone, sign in with the same account you used there. If you paid with a different email, write to contato@cosmicguide.cloud with the receipt.',
  'profile.recover.otherAccountTitle': 'That subscription is already on another account',
  'profile.recover.otherAccountText': 'The subscription stored on this device already belongs to another login. Sign in with that account, or write to contato@cosmicguide.cloud.',
  'profile.recover.errorTitle': 'Could not recover right now',
  'profile.recover.errorText': 'Try again in a moment. If it keeps happening, write to contato@cosmicguide.cloud with the payment email.',

  // Ajuda, privacidade e termos
  'help.header.title': 'Help and support',

  'privacy.header.title': 'Privacy',

  'terms.header.title': 'Terms of use',

  // Seletor de data compartilhado
  'datePicker.title': 'Select date',
  'datePicker.cancel': 'Cancel',
  'datePicker.confirm': 'Confirm',
  'datePicker.month.0': 'Jan',
  'datePicker.month.1': 'Feb',
  'datePicker.month.2': 'Mar',
  'datePicker.month.3': 'Apr',
  'datePicker.month.4': 'May',
  'datePicker.month.5': 'Jun',
  'datePicker.month.6': 'Jul',
  'datePicker.month.7': 'Aug',
  'datePicker.month.8': 'Sep',
  'datePicker.month.9': 'Oct',
  'datePicker.month.10': 'Nov',
  'datePicker.month.11': 'Dec',

  // Compartilhados — erro, cartões, cabeçalho, push
  'errorBoundary.title': 'Something went wrong',
  'errorBoundary.fallbackMessage': 'Unexpected error while loading the app.',
  'errorBoundary.hint': 'Reload the page. If it keeps happening, let support know.',

  'featureCard.lockedA11y': '{title}, locked feature, requires a subscription',

  'header.backA11y': 'Back',

  'push.errorTitle': 'Could not turn it on',

  'common.cancel': 'Cancel',
  'common.ok': 'OK',

  // Buttons that TAKE you there instead of text that just tells you (see PT).
  'birthchart.couple.missingDateCta': 'Fill in the birth date',
  'birthchart.fix.timeCta': 'Add my birth time',
  'birthchart.fix.timeCoupleCta': 'Redo the quiz and add the time',
  'birthchart.fix.cityCta': 'Pick the birth city',
  'profile.noCoupleCta': 'Take the couple quiz',
  'profile.soloInviteCta': 'Invite my partner now',
  'diary.empty.cta': 'Do my first reading',
  'compat.locked.cta': 'See the plans',
  'tarot.locked.cta': 'See the plans',
  'tarot.dailyLimit.storeCta': 'Buy a Bonus Reading in the Shop',
  'help.faq.couple.cta': 'Take the couple quiz',
  'help.faq.subscription.cta': 'Open my subscription',
  'support.emailCta': 'Email support',
  'social.empty.findCta': 'Find readers to follow',
  'social.empty.diaryCta': 'Open my Cosmic Diary',
  'album.drawCta': 'Draw cards now',
  'album.cardHidden': 'Card not revealed yet',
  'album.closeHint': 'Tap outside the card to close',
  'wrapped.empty.readingsCta': 'Do a reading now',
  'errorBoundary.reloadCta': 'Reload the app',
  'errorBoundary.supportCta': 'Email support',
  'home.notifPrompt.errorOpenPrefsCta': 'Open Preferences',
  'login.forgot.cta': 'I forgot my password',
  'login.forgot.sending': 'Sending the link...',
  'login.forgot.needEmail': 'Type your email above to get the recovery link.',
  'login.forgot.sent': 'Recovery link sent. Check your email to create a new password.',
  'login.openInboxCta': 'Open my email',

  'diary.insight.original': 'Your original insight',
  'diary.insight.polished': 'Version polished by the AI',
  'diary.pin.cta': 'Pin to the top for 7 days',
  'diary.delete.cta': 'Delete this reading',
  'diary.weekly.cta': 'See the Insight of the Week',
  'diary.weekly.loading': 'Looking for the thread running through your week...',
  'diary.close': 'Close',
  'diary.empty.waiting': 'Your journal is waiting for your first reading',
  'coffee.weekly.ready': 'Your conclusion for the week is ready',
  'coffee.weekly.cta': 'See the conclusion of the week',
  'coffee.close': 'Close',
  'coffee.takePhoto': 'Take a photo',
  'coffee.pickPhoto': 'Choose from the gallery',
  'coffee.analyzing': 'Reading…',
  'coffee.analyze': 'Read it',
  'coffee.changePhoto': 'Change photo',
  'coffee.subscribe': 'Subscribe →',
  'coffee.newReading': 'New reading',
  'dream.interpreting': 'Interpreting…',
  'dream.interpret': 'Interpret',
  'dream.subscribe': 'Subscribe →',
  'dream.new': 'New dream',
  'tarot.subtitle': 'Tarot that will not sugarcoat it — Past · Present · Future',
  'tarot.album': 'Album',
  'tarot.tap': 'Tap',
  'missions.today': "Today's missions",
  'missions.storeLink': 'trade tokens for rewards in the Store',
};

// Resumo de oferta mostrado DENTRO de cada paywall (components/OfferSummary.js).
// Acrescentado aqui embaixo, num bloco único, em vez de espalhado nos três
// dicionários: outro time está acrescentando chaves nas seções acima ao mesmo
// tempo, e edição pontual num só ponto do arquivo evita conflito.
// Nenhuma destas chaves carrega VALOR — o preço vive só em
// 'planos.plan.trial.detail', que os paywalls leem direto.
Object.assign(PT, {
  'offer.cancelAnytime': 'Cancele quando quiser',
  'offer.morePlans': 'Trimestral e anual saem mais barato por mês',
});
Object.assign(ES, {
  'offer.cancelAnytime': 'Cancela cuando quieras',
  'offer.morePlans': 'Trimestral y anual salen más baratos por mes',
});
Object.assign(EN, {
  'offer.cancelAnytime': 'Cancel anytime',
  'offer.morePlans': 'Quarterly and annual cost less per month',
});

// Promessa corrigida dos muros que aparecem pra quem está SOZINHO (sem par).
// Mesmo bloco único do resumo de oferta acima, pelo mesmo motivo (edição
// pontual num só ponto do arquivo, com outro time acrescentando chaves nas
// seções de cima).
//
// REGRA NOVA (decisão do dono, 29/07/2026): UMA assinatura libera o app
// inteiro, telas de casal incluídas — e o par convidado herda o acesso pelo
// link (&acesso= em lib/coupleInvite.js), de graça. Estas chaves foram
// reescritas pra contar exatamente essa verdade: assinatura = acesso a tudo;
// quiz/convite = os DADOS que as telas de casal mostram. As versões antigas
// diziam "a assinatura sozinha não abre esta tela", que era a regra anterior
// (escopo solo × casal) e deixou de ser verdade.
Object.assign(PT, {
  'gate.solo.invitePrimaryCta': 'Convidar meu par →',
  'gate.solo.inviteHint': 'Você preenche os dados de vocês dois (1 minuto) e recebe um link pra mandar pro seu par.',
  'gate.solo.subscribeNote':
    'A assinatura libera o app inteiro — estas telas de casal também. Pra elas terem o que mostrar, preencha o quiz com os dados de vocês dois. E o melhor: seu par entra de graça pelo seu link de convite.',
  'upsell.solo.text':
    'Gostou dessa leitura? Assine e use o app inteiro sem limite — 7 dias grátis. E quando convidar seu par, ele entra de graça pelo seu link.',
});
Object.assign(ES, {
  'gate.solo.invitePrimaryCta': 'Invitar a mi pareja →',
  'gate.solo.inviteHint': 'Completas los datos de los dos (1 minuto) y recibes un enlace para enviarle a tu pareja.',
  'gate.solo.subscribeNote':
    'La suscripción libera toda la app — estas pantallas de pareja también. Para que tengan qué mostrar, completa el quiz con los datos de los dos. Y lo mejor: tu pareja entra gratis con tu enlace de invitación.',
  'upsell.solo.text':
    '¿Te gustó esta lectura? Suscríbete y usa toda la app sin límite — 7 días gratis. Y cuando invites a tu pareja, entra gratis con tu enlace.',
});
Object.assign(EN, {
  'gate.solo.invitePrimaryCta': 'Invite my partner →',
  'gate.solo.inviteHint': 'You fill in both your details (1 minute) and get a link to send to your partner.',
  'gate.solo.subscribeNote':
    'The subscription unlocks the whole app — these couple screens included. For them to have something to show, fill in the quiz with both your details. Best part: your partner gets in free through your invite link.',
  'upsell.solo.text':
    'Enjoyed this reading? Subscribe and use the whole app with no limits — 7 days free. And when you invite your partner, they get in free through your link.',
});

// ---- Splash pré-bundle (public/index.html) ----
// Único texto do app que NÃO passa por t() na hora de renderizar, e de
// propósito: o splash cobre os 3,4-5,2 segundos em que o bundle ainda está
// baixando, então nada que dependa deste arquivo teria chegado a tempo. O PT
// vive no HTML estático (pinta no primeiro paint) e ES/EN entram por um
// <script> inline lá — as 6 frases abaixo são a fonte de verdade dessa cópia,
// e test/splashPromise.test.js falha se o HTML divergir daqui.
//
// Ficam juntas, num bloco só, em vez de espalhadas nos três dicionários acima:
// são frases que precisam mudar SEMPRE as três ao mesmo tempo (junto com o
// HTML), e vê-las lado a lado é o que torna isso óbvio pra quem for editar.
// Object.assign muta os mesmos objetos que DICTS referencia, então translate()
// e os testes de paridade enxergam essas chaves normalmente.
//
// O texto é o mesmo do og:description — a frase que já convence no preview do
// link no WhatsApp era a que faltava dentro do app.
const SPLASH = {
  pt: {
    'splash.promise': 'Horóscopo, tarô, mapa astral e leituras místicas — individual ou em casal.',
    'splash.trial': '7 dias grátis',
  },
  es: {
    'splash.promise': 'Horóscopo, tarot, carta astral y lecturas místicas — solo o en pareja.',
    'splash.trial': '7 días gratis',
  },
  en: {
    'splash.promise': 'Horoscope, tarot, birth chart and mystic readings — alone or as a couple.',
    'splash.trial': '7 days free',
  },
};
Object.assign(PT, SPLASH.pt);
Object.assign(ES, SPLASH.es);
Object.assign(EN, SPLASH.en);

// Higiene de confiança — o que a pessoa precisa saber ANTES de digitar o cartão.
//
// O cancelamento é a suspeita nº1 de quem hesita em assinar, e o texto antigo
// dizia "vá em Perfil > Gerenciar assinatura" e "pela loja de aplicativos" —
// dois caminhos que o produto NÃO tem: a cobrança é da Hotmart e o app não é
// publicado em loja nenhuma. Prometer nos Termos um cancelamento que não
// existe vira reclamação e, no Brasil, infração ao CDC. Aqui o texto diz o que
// é verdade e a tela oferece o botão que leva à área de compras da Hotmart.
//
// O rodapé legal existe porque Termos, Privacidade e Suporte precisam estar
// alcançáveis SEM sair da tela onde se digita cartão.
const CONFIANCA = {
  pt: {
    'reading.genericNote':
      'A leitura personalizada por IA não respondeu agora, então esta é uma leitura simbólica geral — não uma análise do que você enviou. Tente de novo em alguns minutos.',
    'help.faq.cancel.answer':
      'A qualquer momento, sem falar com ninguém. Sua assinatura é cobrada pela Hotmart, e é lá que ela se cancela: entre na área de compras com o e-mail que você usou, abra a assinatura do Cosmic Guide e toque em cancelar. O acesso continua até o fim do período já pago.',
    'help.faq.cancel.cta': 'Abrir minha área de compras na Hotmart',
    'planos.legal.billingNote':
      'Cobrança processada pela Hotmart. Renova sozinho no fim de cada período e você cancela quando quiser, direto na sua área de compras.',
    'planos.legal.terms': 'Termos',
    'planos.legal.privacy': 'Privacidade',
    'planos.legal.support': 'Suporte',
    'terms.payments.body':
      'A assinatura é processada e cobrada pela Hotmart, não pelo Cosmic Guide. Ela renova automaticamente no fim de cada período (mensal, trimestral ou anual) até você cancelar. O cancelamento é feito na área de compras da Hotmart, com o e-mail usado na compra, a qualquer momento e sem justificativa — e o acesso continua até o fim do período já pago, sem cobrança nova. Assinaturas com 7 dias grátis não geram cobrança se forem canceladas dentro desse prazo. Reembolsos seguem a política da Hotmart e o Código de Defesa do Consumidor.',
  },
  es: {
    'reading.genericNote':
      'La lectura personalizada por IA no respondió ahora, así que esta es una lectura simbólica general — no un análisis de lo que enviaste. Probá de nuevo en unos minutos.',
    'help.faq.cancel.answer':
      'Cuando quieras, sin hablar con nadie. Tu suscripción la cobra Hotmart, y ahí mismo se cancela: entrá en tu área de compras con el correo que usaste, abrí la suscripción de Cosmic Guide y tocá cancelar. El acceso sigue hasta el final del período ya pagado.',
    'help.faq.cancel.cta': 'Abrir mi área de compras en Hotmart',
    'planos.legal.billingNote':
      'Cobro procesado por Hotmart. Se renueva solo al final de cada período y lo cancelás cuando quieras, directo en tu área de compras.',
    'planos.legal.terms': 'Términos',
    'planos.legal.privacy': 'Privacidad',
    'planos.legal.support': 'Soporte',
    'terms.payments.body':
      'La suscripción es procesada y cobrada por Hotmart, no por Cosmic Guide. Se renueva automáticamente al final de cada período (mensual, trimestral o anual) hasta que la canceles. La cancelación se hace en el área de compras de Hotmart, con el correo usado en la compra, en cualquier momento y sin justificación — y el acceso sigue hasta el final del período ya pagado, sin cobro nuevo. Las suscripciones con 7 días gratis no generan cobro si se cancelan dentro de ese plazo. Los reembolsos siguen la política de Hotmart y la ley de defensa del consumidor aplicable.',
  },
  en: {
    'reading.genericNote':
      'The personalized AI reading did not respond right now, so this is a general symbolic reading — not an analysis of what you sent. Try again in a few minutes.',
    'help.faq.cancel.answer':
      'Anytime, without talking to anyone. Your subscription is billed by Hotmart, and that is where it is cancelled: sign in to your purchases area with the email you used, open the Cosmic Guide subscription and tap cancel. Access continues until the end of the period you already paid for.',
    'help.faq.cancel.cta': 'Open my Hotmart purchases area',
    'planos.legal.billingNote':
      'Billing handled by Hotmart. It renews on its own at the end of each period, and you can cancel whenever you want, right in your purchases area.',
    'planos.legal.terms': 'Terms',
    'planos.legal.privacy': 'Privacy',
    'planos.legal.support': 'Support',
    'terms.payments.body':
      'The subscription is processed and billed by Hotmart, not by Cosmic Guide. It renews automatically at the end of each period (monthly, quarterly or yearly) until you cancel. Cancellation is done in the Hotmart purchases area, with the email used at purchase, at any time and without giving a reason — and access continues until the end of the period already paid for, with no new charge. Subscriptions with a 7-day free trial are not charged if cancelled within that window. Refunds follow Hotmart policy and applicable consumer protection law.',
  },
};
Object.assign(PT, CONFIANCA.pt);
Object.assign(ES, CONFIANCA.es);
Object.assign(EN, CONFIANCA.en);

// Linha do tempo — botão do estado vazio (29/07/2026).
//
// Contexto: as 3 "memórias padrão" que o app inventava pra todo casal novo
// foram removidas de screens/TimelineScreen.js, então o estado vazio — que era
// código morto — passou a ser a primeira coisa que a pessoa vê. Ele pedia
// ("Adicionem o primeiro capítulo…") sem oferecer o caminho; esta chave é o
// botão que rola até o formulário de adicionar memória, na mesma tela.
// Mesmo espelho do CTA que a Retrospectiva já usa quando o ano está vazio.
//
// Bloco único no fim do arquivo, mesmo padrão de offer.*/gate.solo.* acima:
// outro time está acrescentando chaves nas seções de cima ao mesmo tempo.
//
// As chaves timeline.defaultMemory.* seguem no dicionário sem uso (o teste
// i18nKeysExist.test.js só avisa, não falha) — remover valor de dicionário não
// é permitido nesta rodada; ficam pra faxina de chave morta.
const TIMELINE_EMPTY_CTA = {
  pt: { 'timeline.empty.memories.cta': 'Guardar a primeira memória →' },
  es: { 'timeline.empty.memories.cta': 'Guardar el primer recuerdo →' },
  en: { 'timeline.empty.memories.cta': 'Save the first memory →' },
};
Object.assign(PT, TIMELINE_EMPTY_CTA.pt);
Object.assign(ES, TIMELINE_EMPTY_CTA.es);
Object.assign(EN, TIMELINE_EMPTY_CTA.en);

// ---- Som do céu (components/CosmicSoundPlayer.js) ----
//
// Bloco único no fim do arquivo, mesmo padrão de offer.*/gate.solo.*/timeline.*
// acima: outros times estão acrescentando chaves nas seções de cima ao mesmo
// tempo, e uma edição pontual num só ponto evita conflito.
//
// ================== HONESTIDADE — a régua deste bloco ======================
// Nenhuma string aqui pode dizer (nem sugerir) que o som cura, trata, relaxa,
// melhora sono, ansiedade, dor ou qualquer outra coisa mensurável no corpo ou
// na mente. As frequências de Solfeggio e a afinação de 432 Hz aparecem como
// TRADIÇÃO declarada — "a tradição associa..." — e sempre acompanhadas de
// sound.disclaimer, que diz na cara que não há confirmação científica nem
// promessa de efeito. O que PODE ser afirmado é o vínculo astronômico real
// (o timbre muda porque a Lua mudou de fase e de signo hoje) e o uso prático
// (acompanhar a leitura, ficar em silêncio junto). Quem for editar aqui: se a
// frase pudesse ser chamada de propaganda enganosa por um órgão de defesa do
// consumidor, ela está errada.
//
// Nomes de signo, fase da Lua e planeta chegam do motor astrológico em
// português (lib/signs.js, lib/lunarCalendar.js) e são interpolados nas frases
// abaixo — é o mesmo gap de tradução de conteúdo astrológico já declarado no
// cabeçalho deste arquivo, não um esquecimento.
// ===========================================================================
const SOM_DO_CEU = {
  pt: {
    'sound.title': 'Som do céu',
    'sound.tagline':
      'Som ambiente que nasce do céu de hoje — a nota vem do regente do dia e o brilho, da fase da Lua. Deixe tocando enquanto você lê.',
    'sound.play': 'Tocar',
    'sound.pause': 'Pausar',
    'sound.playing': 'tocando',
    'sound.open': 'Abrir os controles do som',
    'sound.adjust': 'Ajustar',
    'sound.close': 'Fechar',
    'sound.volume': 'Volume',
    'sound.mutedHint': 'No silêncio o tempo não conta como escuta.',
    'sound.a11y.volumeStep': 'Volume {n} de {total}',
    'sound.ambience': 'Ambiente',
    'sound.hz': '{hz} Hz',
    'sound.preset.sky': 'Céu de hoje',
    'sound.preset.skyHint':
      'A nota base vem do regente do dia e o brilho do timbre, da fase da Lua. Amanhã muda sozinho.',
    'sound.assoc.396': 'A tradição associa esta frequência a deixar para trás culpa e medo.',
    'sound.assoc.417': 'A tradição associa esta frequência a recomeço e mudança de situação.',
    'sound.assoc.432':
      'Afinação alternativa ao padrão internacional de 440 Hz, preferida por parte da tradição sonora esotérica.',
    'sound.assoc.528': 'A tradição associa esta frequência a amor e transformação.',
    'sound.assoc.639': 'A tradição associa esta frequência a vínculos e relacionamentos.',
    'sound.assoc.741': 'A tradição associa esta frequência a expressão e clareza ao falar.',
    'sound.assoc.852': 'A tradição associa esta frequência a intuição.',
    'sound.disclaimer':
      'Frequências aqui são escolha de ambiente, dentro de uma tradição simbólica dos anos 1970. A origem fica declarada: a numeração foi proposta em 1974, não é notação medieval.',
    'sound.timer': 'Desligar em',
    'sound.timer.minutes': '{n} min',
    'sound.timer.off': 'Até eu parar',
    'sound.timer.left': 'Desliga sozinho em {min} min.',
    'sound.timer.fadeHint': 'No fim do tempo o som baixa devagar até sumir, sem corte seco.',
    'sound.streak.counted': 'A escuta de hoje já entrou na sua sequência de dias ativos ✓',
    'sound.streak.left': 'Faltam {min} min de escuta pra hoje entrar na sequência.',
    'sound.streak.hint':
      'A partir de {min} minutos de escuta, o dia entra na sua sequência — a mesma que as leituras marcam.',
    'sound.why.title': 'Por que o som está assim hoje',
    'sound.why.short': '{fase} em {signo} — {brilho} hoje.',
    'sound.why.shortRuler': 'Dia de {regente} — a nota base do som vem daí.',
    'sound.why.unavailableShort': 'Dia de {regente}. A Lua não pôde ser calculada agora — o timbre está neutro.',
    'sound.why.unavailable':
      'Hoje é dia de {regente} e a nota base vem daí. A posição da Lua não pôde ser calculada agora, então o resto do timbre está neutro — não é o céu de hoje.',
    'sound.why.ruler':
      'Hoje é dia de {regente}: a nota base vem daí — a ordem caldaica, a mesma que dá nome aos dias da semana.',
    'sound.why.phase': '{fase}, {luz}% iluminada — é isso que define o brilho do timbre.',
    'sound.why.moon': 'Lua em {signo}, elemento {elemento} — daí a camada de fundo.',
    'sound.why.aspect': '{a} e {b} quase exatos hoje — por isso entra uma voz a mais nos pulsos.',
    'sound.why.retro': 'Mercúrio está retrógrado: os pulsos entram ao contrário, subindo devagar e cortando curto.',
    'sound.why.presetNote':
      'Neste ambiente a nota base é {hz} Hz; o timbre, a textura e os pulsos continuam vindo do céu de hoje.',
    'sound.why.tomorrow': 'Amanhã o som muda porque o céu muda.',
    'sound.bright.high': 'timbre mais aberto',
    'sound.bright.mid': 'timbre a meio caminho',
    'sound.bright.low': 'timbre mais fechado',
    'sound.warn.unsupported': 'Este navegador não abre o som ambiente.',
    'sound.warn.gesture': 'Toque em Tocar de novo — o navegador só libera o som depois de um toque na tela.',
    'sound.warn.failed': 'Não deu pra iniciar o som agora. Tente de novo.',
    'sound.warn.background': 'O som parou quando o app saiu da frente. Toque pra voltar.',
    'sound.media.album': 'Cosmic Guide',
  },
  es: {
    'sound.title': 'Sonido del cielo',
    'sound.tagline':
      'Sonido ambiente que nace del cielo de hoy — la nota viene del regente del día y el brillo, de la fase de la Luna. Dejalo sonando mientras leés.',
    'sound.play': 'Reproducir',
    'sound.pause': 'Pausar',
    'sound.playing': 'sonando',
    'sound.open': 'Abrir los controles del sonido',
    'sound.adjust': 'Ajustar',
    'sound.close': 'Cerrar',
    'sound.volume': 'Volumen',
    'sound.mutedHint': 'En silencio el tiempo no cuenta como escucha.',
    'sound.a11y.volumeStep': 'Volumen {n} de {total}',
    'sound.ambience': 'Ambiente',
    'sound.hz': '{hz} Hz',
    'sound.preset.sky': 'Cielo de hoy',
    'sound.preset.skyHint':
      'La nota base viene del regente del día y el brillo del timbre, de la fase de la Luna. Mañana cambia solo.',
    'sound.assoc.396': 'La tradición asocia esta frecuencia con dejar atrás culpa y miedo.',
    'sound.assoc.417': 'La tradición asocia esta frecuencia con volver a empezar y cambiar de situación.',
    'sound.assoc.432':
      'Afinación alternativa al estándar internacional de 440 Hz, preferida por parte de la tradición sonora esotérica.',
    'sound.assoc.528': 'La tradición asocia esta frecuencia con el amor y la transformación.',
    'sound.assoc.639': 'La tradición asocia esta frecuencia con los vínculos y las relaciones.',
    'sound.assoc.741': 'La tradición asocia esta frecuencia con la expresión y la claridad al hablar.',
    'sound.assoc.852': 'La tradición asocia esta frecuencia con la intuición.',
    'sound.disclaimer':
      'Las frecuencias acá son una elección de ambiente, dentro de una tradición simbólica de los años 1970. El origen queda declarado: la numeración fue propuesta en 1974, no es notación medieval.',
    'sound.timer': 'Apagar en',
    'sound.timer.minutes': '{n} min',
    'sound.timer.off': 'Hasta que yo pare',
    'sound.timer.left': 'Se apaga solo en {min} min.',
    'sound.timer.fadeHint': 'Al final del tiempo el sonido baja despacio hasta desaparecer, sin corte seco.',
    'sound.streak.counted': 'La escucha de hoy ya entró en tu racha de días activos ✓',
    'sound.streak.left': 'Faltan {min} min de escucha para que hoy entre en la racha.',
    'sound.streak.hint':
      'A partir de {min} minutos de escucha, el día entra en tu racha — la misma que marcan las lecturas.',
    'sound.why.title': 'Por qué el sonido está así hoy',
    'sound.why.short': '{fase} en {signo} — {brilho} hoy.',
    'sound.why.shortRuler': 'Día de {regente} — de ahí sale la nota base del sonido.',
    'sound.why.unavailableShort': 'Día de {regente}. La Luna no se pudo calcular ahora — el timbre está neutro.',
    'sound.why.unavailable':
      'Hoy es día de {regente} y de ahí viene la nota base. La posición de la Luna no se pudo calcular ahora, así que el resto del timbre está neutro — no es el cielo de hoy.',
    'sound.why.ruler':
      'Hoy es día de {regente}: de ahí viene la nota base — el orden caldeo, el mismo que da nombre a los días de la semana.',
    'sound.why.phase': '{fase}, {luz}% iluminada — eso define el brillo del timbre.',
    'sound.why.moon': 'Luna en {signo}, elemento {elemento} — de ahí la capa de fondo.',
    'sound.why.aspect': '{a} y {b} casi exactos hoy — por eso entra una voz más en los pulsos.',
    'sound.why.retro': 'Mercurio está retrógrado: los pulsos entran al revés, subiendo despacio y cortando corto.',
    'sound.why.presetNote':
      'En este ambiente la nota base es {hz} Hz; el timbre, la textura y los pulsos siguen viniendo del cielo de hoy.',
    'sound.why.tomorrow': 'Mañana el sonido cambia porque cambia el cielo.',
    'sound.bright.high': 'timbre más abierto',
    'sound.bright.mid': 'timbre a medio camino',
    'sound.bright.low': 'timbre más cerrado',
    'sound.warn.unsupported': 'Este navegador no abre el sonido ambiente.',
    'sound.warn.gesture': 'Tocá Reproducir de nuevo — el navegador libera el sonido solo después de un toque en la pantalla.',
    'sound.warn.failed': 'No se pudo iniciar el sonido ahora. Probá de nuevo.',
    'sound.warn.background': 'El sonido paró cuando la app pasó a segundo plano. Tocá para volver.',
    'sound.media.album': 'Cosmic Guide',
  },
  en: {
    'sound.title': 'Sound of the sky',
    'sound.tagline':
      'Ambient sound built from today’s sky — the note comes from the day’s ruler, the brightness from the Moon’s phase. Leave it playing while you read.',
    'sound.play': 'Play',
    'sound.pause': 'Pause',
    'sound.playing': 'playing',
    'sound.open': 'Open the sound controls',
    'sound.adjust': 'Adjust',
    'sound.close': 'Close',
    'sound.volume': 'Volume',
    'sound.mutedHint': 'At zero volume the time does not count as listening.',
    'sound.a11y.volumeStep': 'Volume {n} of {total}',
    'sound.ambience': 'Ambience',
    'sound.hz': '{hz} Hz',
    'sound.preset.sky': 'Today’s sky',
    'sound.preset.skyHint':
      'The base note comes from the ruler of the day and the brightness from the Moon phase. Tomorrow it changes on its own.',
    'sound.assoc.396': 'Tradition associates this frequency with leaving guilt and fear behind.',
    'sound.assoc.417': 'Tradition associates this frequency with starting over and changing a situation.',
    'sound.assoc.432':
      'An alternative tuning to the international 440 Hz standard, preferred by part of the esoteric sound tradition.',
    'sound.assoc.528': 'Tradition associates this frequency with love and transformation.',
    'sound.assoc.639': 'Tradition associates this frequency with bonds and relationships.',
    'sound.assoc.741': 'Tradition associates this frequency with expression and speaking clearly.',
    'sound.assoc.852': 'Tradition associates this frequency with intuition.',
    'sound.disclaimer':
      'Frequencies here are an ambience choice inside a symbolic tradition from the 1970s. The origin is stated plainly: the numbering was proposed in 1974, it is not medieval notation.',
    'sound.timer': 'Stop in',
    'sound.timer.minutes': '{n} min',
    'sound.timer.off': 'Until I stop it',
    'sound.timer.left': 'Turns itself off in {min} min.',
    'sound.timer.fadeHint': 'When the time is up the sound fades out slowly, never cut off.',
    'sound.streak.counted': 'Today’s listening already counted towards your active-day streak ✓',
    'sound.streak.left': '{min} min of listening to go for today to count in the streak.',
    'sound.streak.hint':
      'After {min} minutes of listening the day joins your streak — the same streak readings mark.',
    'sound.why.title': 'Why the sound is like this today',
    'sound.why.short': '{fase} in {signo} — {brilho} today.',
    'sound.why.shortRuler': 'Day of {regente} — that is where the base note comes from.',
    'sound.why.unavailableShort': 'Day of {regente}. The Moon could not be calculated now — the timbre is neutral.',
    'sound.why.unavailable':
      'Today is the day of {regente} and the base note comes from that. The Moon position could not be calculated now, so the rest of the timbre is neutral — it is not today’s sky.',
    'sound.why.ruler':
      'Today is the day of {regente}: that is where the base note comes from — the Chaldean order, the same one that names the days of the week.',
    'sound.why.phase': '{fase}, {luz}% lit — that is what sets the brightness of the timbre.',
    'sound.why.moon': 'Moon in {signo}, element {elemento} — hence the background layer.',
    'sound.why.aspect': '{a} and {b} almost exact today — that is why an extra voice joins the pulses.',
    'sound.why.retro': 'Mercury is retrograde: the pulses come in backwards, rising slowly and cutting short.',
    'sound.why.presetNote':
      'In this ambience the base note is {hz} Hz; the timbre, the texture and the pulses still come from today’s sky.',
    'sound.why.tomorrow': 'Tomorrow the sound changes because the sky changes.',
    'sound.bright.high': 'a more open timbre',
    'sound.bright.mid': 'a timbre halfway there',
    'sound.bright.low': 'a more closed timbre',
    'sound.warn.unsupported': 'This browser cannot open the ambient sound.',
    'sound.warn.gesture': 'Tap Play again — the browser only releases sound after a tap on the screen.',
    'sound.warn.failed': 'The sound could not start right now. Try again.',
    'sound.warn.background': 'The sound stopped when the app went to the background. Tap to bring it back.',
    'sound.media.album': 'Cosmic Guide',
  },
};
Object.assign(PT, SOM_DO_CEU.pt);
Object.assign(ES, SOM_DO_CEU.es);
Object.assign(EN, SOM_DO_CEU.en);

// ---- Homem Zodiacal (screens/ZodiacBodyScreen.js) ----
//
// Bloco único no fim do arquivo, mesmo padrão de offer.*/gate.solo.*/splash.*
// acima: outros times estão acrescentando chaves nas seções de cima ao mesmo
// tempo, e um bloco só evita conflito.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — vale para os TRÊS idiomas
// ===========================================================================
// Descrever a tradição é seguro. Aplicá-la a uma pessoa é conselho médico.
// Tudo aqui está no PASSADO, com a fonte, como registro do que alguém
// escreveu ou fazia. Nada no imperativo dirigido a quem lê, nada que oriente
// o corpo de ninguém, nada de erva/dieta/suplemento/momento bom para
// procedimento. Traduzir NÃO é oportunidade de afrouxar a moldura: se a frase
// em espanhol ou inglês soar como conselho, ela está errada nas três.
// test/zodiacBody.test.js varre estes valores nos três idiomas e falha o
// build quando o vocabulário de orientação aparece. É de propósito.
//
// O que NÃO está traduzido, e não deve ser: o latim de Manílio, o latim e o
// inglês do Centiloquium, as citações verbatim de Culpeper e a bibliografia.
// Tudo isso vive em lib/zodiacBody.js — traduzir citação verbatim seria
// falsificá-la.
//
// As famílias zodiacBody.sign.*, .planet.*, .history.*, .culpeper.herb.*,
// .modern.* e .notVerified.* são montadas em runtime pelos helpers de
// lib/zodiacBody.js, então test/i18nKeysExist.test.js não as enxerga — quem
// confere que as três línguas têm todas elas é test/zodiacBody.test.js.
// ===========================================================================
const ZODIAC_BODY_I18N = {
  pt: {
    'home.card.zodiacbody.title': 'Homem Zodiacal',
    'home.card.zodiacbody.subtitle': 'História, séc. I ao XVII',

    'zodiacBody.title': 'Homem Zodiacal',
    'zodiacBody.subtitle': 'História da astrologia médica',
    'zodiacBody.notice.title': 'Isto é história, não orientação de saúde',
    'zodiacBody.notice.body':
      'Esta tela descreve o que astrólogos e médicos escreveram entre o século I e o século XVII. Nada aqui avalia, descreve ou orienta o corpo de quem lê, e nada aqui substitui um profissional de saúde. Diante de um sintoma ou de uma dúvida sobre saúde, procure um médico — não um almanaque de 1450.',
    'zodiacBody.notice.footer':
      'Registro histórico. Nenhuma frase desta tela se aplica ao seu corpo, hoje ou em qualquer outro dia. Sintoma ou dúvida sobre saúde: procure um profissional de saúde.',
    'zodiacBody.expand': 'abrir',
    'zodiacBody.collapse': 'fechar',

    'zodiacBody.figure.hint': 'Toque numa região da figura para ler o verbete daquele signo.',
    'zodiacBody.figure.a11y':
      'Figura do homem zodiacal, com os doze signos distribuídos da cabeça aos pés.',
    'zodiacBody.figure.regionA11y': '{sign} — {part}',
    'zodiacBody.figure.legendSun': 'Seu signo solar',
    'zodiacBody.figure.legendMoon': 'Onde a Lua está hoje',

    'zodiacBody.moon.title': 'A Lua hoje',
    'zodiacBody.moon.part': '{sign} respondia por: {part} — é o que diz a lista antiga de Manílio.',
    'zodiacBody.moon.changes': 'A Lua entra em {sign} — {part} — daqui a {duration}.',
    'zodiacBody.moon.durH': '{h} h',
    'zodiacBody.moon.durDH': '{d} d {h} h',
    'zodiacBody.moon.rate':
      'A Lua percorre os doze signos em cerca de 27,3 dias, cerca de 2,5 dias em cada um. Era esse o relógio dos almanaques.',
    'zodiacBody.moon.practice':
      'O que se fazia com essa posição, no passado: entre os séculos XIV e XVII, quem seguia o aforismo 20 do Centiloquium tratava a posição da Lua como um calendário rotativo e deixava a região do corpo ligada ao signo lunar fora da sangria naqueles dois dias e meio. Esse cálculo saiu da medicina há séculos e está aqui como peça de história — ele não diz nada sobre o seu corpo, hoje ou em qualquer outro dia.',
    'zodiacBody.moon.unavailable': 'Não foi possível calcular a posição da Lua agora.',

    'zodiacBody.sun.title': 'O seu signo solar na lista',
    'zodiacBody.sun.body': 'Na lista antiga de Manílio, {sign} respondia por: {part}.',
    'zodiacBody.sun.caveat':
      'Uma ressalva que muda tudo: a tradição não lia o corpo pelo signo de nascimento. A melotesia — o nome técnico desse mapa entre signos e partes do corpo — trabalhava com a posição da LUA no instante do procedimento. E «meu signo» como identidade pessoal é invenção recente: nasceu nas colunas de jornal, na imprensa popular do século XX, a partir dos anos 1930. Esta linha é curiosidade sobre a lista antiga, não uma leitura sobre você.',
    'zodiacBody.sun.none':
      'Seu signo ainda não está informado, então não dá para mostrar em que ponto da lista antiga ele cairia.',
    'zodiacBody.sun.noneCta': 'Informar meu signo',

    'zodiacBody.entry.label': 'Verbete',
    'zodiacBody.entry.noteLabel': 'O que a pesquisa corrige',
    'zodiacBody.entry.flagLateLayer': 'a versão popular desta veio bem depois',
    'zodiacBody.confidence.media':
      'Confiança média: a datação desta peça é incerta na própria literatura acadêmica.',

    'zodiacBody.author.manilius': 'Manílio',
    'zodiacBody.author.ptolemy': 'Ptolomeu',
    'zodiacBody.author.culpeper': 'Nicholas Culpeper',
    'zodiacBody.manilius.when': 'séc. I d.C.',

    'zodiacBody.section.planets': 'Regência planetária, em Ptolomeu',
    'zodiacBody.section.history': 'Como isso virou medicina, e como saiu dela',
    'zodiacBody.section.culpeper': 'Culpeper, 1653: como se decidia o planeta de uma planta',
    'zodiacBody.section.modern': 'O que NÃO é da tradição antiga',
    'zodiacBody.section.notVerified': 'O que a pesquisa não conseguiu confirmar',
    'zodiacBody.section.sources': 'Fontes',

    'zodiacBody.planets.intro':
      'Aqui vale desfazer uma confusão comum: são duas listas antigas, de dois autores diferentes. A dos doze signos (Áries = cabeça…) é do poeta Manílio; a que vem abaixo, a dos planetas, é a que Ptolomeu de fato enumera no Tetrabiblos. Atribuir a lista Áries-cabeça ao Tetrabiblos é erro corrente, inclusive em textos que se apresentam como sérios — Ptolomeu pressupõe a correspondência entre signo e parte do corpo, mas em nenhum momento a escreve.',
    'zodiacBody.planets.qualities':
      'Cada planeta tinha a sua «temperatura», como se fosse clima — é o que a tradição chama de qualidades elementares: o Sol, calor e secura moderada; a Lua, sobretudo úmida; Saturno, frio e seco (agia mais pelo frio que pela secura); Marte, seco e muito quente; Júpiter, quente e úmido na medida; Vênus, temperada e mais úmida que quente; Mercúrio, ora seco, ora úmido. Calor e umidade eram tidos como nutritivos; secura e frio, como destrutivos — e é daí que saem Júpiter, Vênus e a Lua «benéficos», Saturno e Marte «maléficos», Sol e Mercúrio comuns. Tudo isso está em Ptolomeu: as qualidades no Tetrabiblos I.iv, a divisão nutritivo/destrutivo no I.v.',
    'zodiacBody.planets.humours':
      'Ressalva metodológica — e os famosos quatro humores, sangue, fleuma e as duas biles, a base da medicina antiga? O mapa fechado que se repete por aí (Júpiter sanguíneo, Marte colérico, Saturno melancólico, Lua e Vênus fleumáticos) não aparece em nenhum destes capítulos: Ptolomeu nunca pendura os humores de Galeno, um a um, nos planetas. Esse mapa é síntese medieval e renascentista, feita cruzando Galeno com o Tetrabiblos. Que a síntese existiu e circulou, disso não há dúvida; atribuí-la a um autor antigo específico é que não se sustenta.',

    'zodiacBody.planet.saturn.name': 'Saturno',
    'zodiacBody.planet.saturn.parts': 'A orelha direita, o baço, a bexiga, a fleuma e os ossos.',
    'zodiacBody.planet.saturn.note':
      'Ptolomeu dá a Saturno a FLEUMA, não a bile negra. A equação Saturno = bile negra = melancólico é síntese medieval e renascentista posterior, não uma frase do Tetrabiblos.',
    'zodiacBody.planet.jupiter.name': 'Júpiter',
    'zodiacBody.planet.jupiter.parts': 'A mão, os pulmões, as artérias e o sêmen.',
    'zodiacBody.planet.jupiter.note':
      'Na tradução Ashmand está «a mão»; na edição Robbins, «o tato». A divergência é de tradução, não de doutrina.',
    'zodiacBody.planet.mars.name': 'Marte',
    'zodiacBody.planet.mars.parts':
      'A orelha esquerda, os rins, as veias e as partes pudendas.',
    'zodiacBody.planet.mars.note':
      'Os rins são de Marte, não de Libra. E a bile, em Ptolomeu, é de Mercúrio: a ligação de Marte com a cólera vem por outra via — em I.iv ele é quente e seco, e quente com seco é a complexão colérica de Galeno. É inferência de segunda ordem, documentada na tradição medieval, mas não está escrita no Tetrabiblos.',
    'zodiacBody.planet.sun.name': 'Sol',
    'zodiacBody.planet.sun.parts':
      'Os olhos, o cérebro, o coração, os tendões e todo o lado direito.',
    'zodiacBody.planet.sun.note':
      'É aqui que está a origem real da associação com o coração: no planeta, não no signo de Leão.',
    'zodiacBody.planet.venus.name': 'Vênus',
    'zodiacBody.planet.venus.parts': 'As narinas, o fígado e a carne.',
    'zodiacBody.planet.mercury.name': 'Mercúrio',
    'zodiacBody.planet.mercury.parts':
      'A fala, o entendimento, a bile, a língua e o fundamento.',
    'zodiacBody.planet.moon.name': 'Lua',
    'zodiacBody.planet.moon.parts':
      'O palato, a garganta, o estômago, o ventre, o útero e todo o lado esquerdo.',

    'zodiacBody.sign.aries.name': 'Áries',
    'zodiacBody.sign.aries.part': 'Cabeça',
    'zodiacBody.sign.aries.gloss': 'A Áries coube a cabeça, a primeira de todas as partes.',
    'zodiacBody.sign.aries.note':
      'Culpeper ainda operava com essa ligação em 1653: registrou o alecrim como planta do Sol «under the celestial Ram» e a betônica como de Júpiter e do signo de Áries.',
    'zodiacBody.sign.touro.name': 'Touro',
    'zodiacBody.sign.touro.part': 'Pescoço',
    'zodiacBody.sign.touro.gloss': 'A Touro coube o belíssimo pescoço.',
    'zodiacBody.sign.touro.note':
      '«colla», no latim, é pescoço. A extensão até a garganta é posterior: em 1653 Culpeper escreveu que «Venus rules the throat (it being under Taurus her sign)».',
    'zodiacBody.sign.gemeos.name': 'Gêmeos',
    'zodiacBody.sign.gemeos.part': 'Braços, ligados aos ombros',
    'zodiacBody.sign.gemeos.gloss':
      'Aos Gêmeos foram atribuídos os braços, ligados aos ombros, em partes iguais.',
    'zodiacBody.sign.gemeos.note':
      'O texto antigo fala de braços e ombros, e de mais nada. Pulmões e sistema nervoso não estão ali: entram na literatura do século XX.',
    'zodiacBody.sign.cancer.name': 'Câncer',
    'zodiacBody.sign.cancer.part': 'Peito',
    'zodiacBody.sign.cancer.gloss': 'Sob Câncer ficou situado o peito.',
    'zodiacBody.sign.cancer.note':
      'Manílio escreve apenas «peito». A ampliação para «estômago e pulmões» aparece em paráfrases inglesas tardias, como o almanaque impresso para Daniel Brown em 1628. Em Ptolomeu o estômago é da Lua, não de Câncer.',
    'zodiacBody.sign.leao.name': 'Leão',
    'zodiacBody.sign.leao.part': 'Flancos e omoplatas',
    'zodiacBody.sign.leao.gloss': 'A Leão coube o domínio dos flancos e das omoplatas.',
    'zodiacBody.sign.leao.note':
      'Correção importante: Manílio não dá o coração a Leão. O coração é do SOL, em Ptolomeu. «Leão = coração» é dedução posterior, pela cadeia Sol → Leão — a mesma que Culpeper opera em 1653 ao registrar a calêndula como planta do Sol e de Leão.',
    'zodiacBody.sign.virgem.name': 'Virgem',
    'zodiacBody.sign.virgem.part': 'Baixo-ventre',
    'zodiacBody.sign.virgem.gloss':
      'À Virgem desceram, como quinhão próprio, os flancos inferiores do ventre.',
    'zodiacBody.sign.virgem.note':
      '«ilia» são os flancos baixos do ventre; os almanaques ingleses renderizaram como «guts and belly». Intestinos, pâncreas e vesícula não estão no original.',
    'zodiacBody.sign.libra.name': 'Libra',
    'zodiacBody.sign.libra.part': 'Nádegas e ancas',
    'zodiacBody.sign.libra.gloss': 'A Libra couberam as nádegas.',
    'zodiacBody.sign.libra.note':
      '«Libra = rins» não está em Manílio. Em Ptolomeu os rins pertencem a Marte. É acréscimo tardio.',
    'zodiacBody.sign.escorpiao.name': 'Escorpião',
    'zodiacBody.sign.escorpiao.part': 'Virilha',
    'zodiacBody.sign.escorpiao.gloss': 'E o Escorpião se alegra com a virilha.',
    'zodiacBody.sign.escorpiao.note':
      'Ptolomeu atribui as partes pudendas a Marte, planeta que na tradição responde por Escorpião — aqui as duas camadas convergem, em vez de se contradizerem.',
    'zodiacBody.sign.sagitario.name': 'Sagitário',
    'zodiacBody.sign.sagitario.part': 'Coxas',
    'zodiacBody.sign.sagitario.gloss': 'Ao Centauro somam-se as coxas.',
    'zodiacBody.sign.sagitario.note':
      'Manílio chama o signo de «Centauro». Em Ptolomeu, Sagitário e Gêmeos aparecem noutra chave de doutrina, ligada a quedas e a males convulsivos — outra camada, não a melotesia corporal.',
    'zodiacBody.sign.capricornio.name': 'Capricórnio',
    'zodiacBody.sign.capricornio.part': 'Os dois joelhos',
    'zodiacBody.sign.capricornio.gloss':
      'A Capricórnio coube o comando de ambos os joelhos — o latim diz «ambos», explicitamente.',
    'zodiacBody.sign.capricornio.note':
      'Ossos, pele e articulações vêm da regência de Saturno, a quem Ptolomeu atribui os ossos, e não do signo.',
    'zodiacBody.sign.aquario.name': 'Aquário',
    'zodiacBody.sign.aquario.part': 'Pernas, da coxa para baixo',
    'zodiacBody.sign.aquario.gloss':
      'Ao Aquário que verte a água coube o arbítrio sobre as pernas.',
    'zodiacBody.sign.aquario.note':
      '«crura» são as pernas da coxa para baixo, as canelas. «Aquário = sistema circulatório» ou «vasos sanguíneos» não tem lastro antigo nenhum.',
    'zodiacBody.sign.peixes.name': 'Peixes',
    'zodiacBody.sign.peixes.part': 'Pés',
    'zodiacBody.sign.peixes.gloss': 'E os Peixes reclamam para si o direito sobre os pés.',
    'zodiacBody.sign.peixes.note':
      'Fecha a sequência, da cabeça aos pés. Em Astronomica IV.701-710 Manílio repete a correspondência numa versão abreviada («namque Aries capiti, Taurus cervicibus haeret…»), mas ali ela entra como ANALOGIA: o assunto do trecho é que terras cada signo rege, não o corpo. A lista curta do livro IV confirma a do livro II — Câncer com o peito, Leão com as omoplatas — e não acrescenta nada a ela.',

    'zodiacBody.history.origin.title': 'A lista mais antiga que restou',
    'zodiacBody.history.origin.body':
      'A lista dos doze signos sobre o corpo, da cabeça aos pés, é mais velha do que parece: o registro mais antigo que chegou inteiro até nós — a atestação canônica em texto contínuo conservado — está num poema do século I d.C., a Astronomica, de Manílio. E é dele que sai tudo o que veio depois.',
    'zodiacBody.history.precursor.title': 'Um precursor mesopotâmico',
    'zodiacBody.history.precursor.body':
      'Antes de Roma, a Babilônia: existe uma tábua de argila, em escrita cuneiforme, com uma lista quase idêntica de divisões do corpo — babilônia tardia, publicada por John Z. Wee em 2015. Vale registrar que ela existe. Não vale dizer «tradição de 5.000 anos»: a datação da tábua é incerta, não há elo egípcio comprovado, e o que se documenta são cerca de dois mil anos de tradição textual.',
    'zodiacBody.history.image.title': 'A imagem que todo mundo já viu',
    'zodiacBody.history.image.body':
      'Dois corpos nus, dorso a dorso, com os doze signos sobre as regiões correspondentes do corpo: é a miniatura do «Homme anatomique», nas Très Riches Heures do Duque de Berry. A literatura a descreve como iconografia rara em manuscrito iluminado — livro copiado e pintado à mão.',
    'zodiacBody.history.print.title': 'A difusão pela imprensa',
    'zodiacBody.history.print.body':
      'Com a imprensa, a figura saiu do manuscrito de luxo e entrou no calendário popular. O calendário de pastores de 1491 e as edições inglesas de 1503 e 1506 traziam xilogravuras do homem zodiacal ao lado das instruções de sangria.',
    'zodiacBody.history.rule.title': 'A regra que governava a prática',
    'zodiacBody.history.rule.body':
      'A regra central dessa prática passou séculos com a assinatura errada — e é o ponto em que mais se erra até hoje. Ela não vem de Ptolomeu: é o aforismo 20 do Centiloquium, uma coleção de cem aforismos que a Idade Média e a Idade Moderna inteiras atribuíram a ele, mas que é pseudoepigráfica — em bom português, obra assinada com o nome de outro. Richard Lemay argumentou que o autor real seria Abu Jaʿfar Ahmad ibn Yusuf, astrólogo árabe do século X — tese dele, não consenso fechado. A primeira tradução latina completa é de Barcelona, 1136, e os aforismos vizinhos formavam um bloco inteiro de regras de calendário terapêutico.',
    'zodiacBody.history.instruments.title': 'Os instrumentos de trabalho',
    'zodiacBody.history.instruments.body':
      'A Lua percorre os doze signos em cerca de 27,3 dias, cerca de 2,5 dias em cada um, então a regra funcionava como um calendário rotativo de dias impróprios para cada região. O instrumento era o almanaque dobrável dos séculos XIV e XV — apelidado «bat book» porque pendia de cabeça para baixo do cinto —, que trazia o homem zodiacal ao lado do diagrama dos pontos de sangria e de tabelas lunares. Havia também a volvelle, um calendário de discos giratórios para localizar a Lua.',
    'zodiacBody.history.university.title': 'Isso era matéria de universidade',
    'zodiacBody.history.university.body':
      'Não era folclore. Em Bolonha, nos anos 1320, Cecco d’Ascoli abria suas aulas afirmando que a astrologia era parte integrante do estudo da medicina, e a astrologia médica ficou particularmente forte nas universidades italianas dos séculos XIV e XV. Paris, Pádua, Bolonha e Florença tiveram cátedras de astrologia.',
    'zodiacBody.history.plague.title': 'A Peste Negra explicada por uma conjunção',
    'zodiacBody.history.plague.body':
      'O caso mais bem documentado é o da Peste Negra. Quando ela varreu a Europa, a Faculdade de Medicina de Paris, a pedido de Filipe VI, redigiu o Compendium de epidemia (outubro de 1348) — e a explicação era o céu: uma conjunção de Saturno, Júpiter e Marte em Aquário, ocorrida «uma hora depois do meio-dia de 20 de março de 1345».',
    'zodiacBody.history.exit.title': 'Como saiu da medicina',
    'zodiacBody.history.exit.body':
      'Não houve decreto único: houve erosão. A autoridade foi mudando de endereço — do céu para a dissecação e a observação. A Fabrica de Vesalius, em 1543, empurrou nessa direção; o De motu cordis de Harvey, em 1628, empurrou de novo. No século XVII, os médicos universitários passaram a invocar influência celeste cada vez mais raramente — mas a literatura acadêmica recente insiste: não existe ponto único de rejeição formal. Ao fim do século XVII a iatromatemática (o nome de época da astrologia aplicada à medicina) já não era ensinada, mas ainda era praticada em 1700 «widely and lucratively» — em bom português: por toda parte, e dando dinheiro. O que mudou primeiro foi o registro social: de controvérsia virou motivo de riso. Resíduos institucionais duraram muito: os titulares das cátedras de astronomia de Salamanca e de Bolonha ainda eram obrigados a produzir almanaques astrológicos para os estudantes de medicina até 1770 e 1799. Bulas papais condenaram a astrologia judiciária — a que fazia previsões sobre pessoas e acontecimentos — em 1586 e em 1631; estas duas datas ficam com confiança média: seus textos não foram reconferidos nesta pesquisa.',
    'zodiacBody.history.afterlife.title': 'Onde ele foi parar',
    'zodiacBody.history.afterlife.body':
      'Expulso da universidade, o homem zodiacal migrou para o almanaque popular — dos calendários de pastores aos almanaques agrícolas anglo-americanos, onde a figura continuou a ser impressa por séculos. É de lá, e não da medicina, que ele chega até hoje.',

    'zodiacBody.culpeper.who':
      'Nicholas Culpeper (1616-1654) publicou The English Physitian em 1652 e a versão ampliada, The Complete Herbal, em 1653. Escrevia em inglês, contra o monopólio do latim, e atacava frontalmente a corporação médica: o livro é peça de disputa profissional, não consenso médico da época.',
    'zodiacBody.culpeper.method':
      'O verbete da losna é onde ele conta, sem esconder o jogo, como decidia a regência de uma planta — o planeta dela. Não é revelação nenhuma: é um silogismo escolástico — o raciocínio em três passos ensinado nas escolas medievais — e o argumento é o LUGAR onde a planta cresce.',
    'zodiacBody.culpeper.chain':
      'A cadeia signo → parte do corpo → planeta aparece na frase dele, a propósito da garganta:',
    'zodiacBody.culpeper.antipathy':
      'O esquema tinha duas vias, simpatia e antipatia, e o par mais oposto era Marte e Vênus:',
    'zodiacBody.culpeper.examplesLabel': 'Atribuições, na fórmula fixa do livro',
    'zodiacBody.culpeper.politics': 'E a razão de tudo isso estar escrito em inglês:',
    'zodiacBody.culpeper.warning':
      'Nada disto aparece aqui como uso possível — nem parafraseado, nem com ressalva. De cada verbete ficaram só a atribuição planetária e o raciocínio; a parte terapêutica foi cortada de propósito. É registro do que um autor escreveu em 1653.',
    'zodiacBody.culpeper.herb.rosemary': 'Alecrim',
    'zodiacBody.culpeper.herb.marigold': 'Calêndula',
    'zodiacBody.culpeper.herb.woodBetony': 'Betônica',
    'zodiacBody.culpeper.herb.vervain': 'Verbena',
    'zodiacBody.culpeper.herb.camomile': 'Camomila',
    'zodiacBody.culpeper.herb.bittersweet': 'Doce-amarga',
    'zodiacBody.culpeper.herb.angelica': 'Angélica — e a hora da colheita',

    'zodiacBody.modern.intro':
      'Muita coisa que hoje se apresenta como «tradição antiga» tem cerca de cem anos: entrou pela literatura teosófica e rosacruz do século XX — correntes esotéricas daquele começo de século — com Heinrich Daath (Medical Astrology, manual n.º 9 da série de Alan Leo, 1914), Max e Augusta Foss Heindel (1929) e H. L. Cornell (1933). Nada disto está em Manílio nem em Ptolomeu:',
    'zodiacBody.modern.glands':
      '«Áries rege as adrenais», «Libra rege o sistema endócrino», «Peixes rege o sistema linfático», «Gêmeos rege o sistema nervoso», «Aquário rege o sistema circulatório», «Virgem rege o pâncreas». Adrenais, glândulas endócrinas, sistema linfático, imunidade e a função do pâncreas são conceitos dos séculos XIX e XX: os antigos não podiam conhecê-los.',
    'zodiacBody.modern.libraKidneys':
      '«Libra rege os rins» contradiz as duas fontes antigas ao mesmo tempo: Manílio dá a Libra as nádegas, e Ptolomeu dá os rins a Marte.',
    'zodiacBody.modern.leoHeart':
      '«Leão = coração» e «Câncer = estômago» como doutrina antiga são meia-verdade. Manílio dá a Leão os flancos e as omoplatas, e a Câncer o peito; coração é do Sol e estômago é da Lua, em Ptolomeu. A migração da regência do planeta para o signo que ele governa é dedução posterior.',
    'zodiacBody.modern.outerPlanets':
      'Urano, Netuno e Plutão na astrologia médica são anacronismo puro: foram descobertos em 1781, 1846 e 1930. Nenhum autor desta tradição os conheceu.',
    'zodiacBody.modern.chakras':
      'Chakras mapeados em signos são sincretismo do século XX, via teosofia. A tradição dos chakras é indiana e não tem relação histórica com a melotesia greco-latina.',
    'zodiacBody.modern.diet':
      '«Dieta do seu signo», suplemento, vitamina, óleo essencial ou sal de Schuessler por signo: os sais bioquímicos de Schuessler são de 1873, e a vinculação a signos é posterior e comercial. Não existe nas fontes antigas.',
    'zodiacBody.modern.weakSpot':
      '«O seu signo mostra o seu ponto fraco de saúde.» A tradição antiga não fazia isso a partir do signo de nascimento: a melotesia operava com a posição da Lua no instante do procedimento. E o signo solar como identidade pessoal é invenção da imprensa popular do século XX.',
    'zodiacBody.modern.consensus':
      '«Era medicina consensual e todo mundo acreditava» é simplificação. Houve crítica interna já na época, e a literatura acadêmica atual rejeita tanto a narrativa de crença universal quanto a de rejeição súbita por um único evento científico.',

    'zodiacBody.notVerified.intro':
      'Quatro coisas foram procuradas e não foram achadas. Ficam registradas como lacuna: dizer que não se achou é mais honesto do que completar por dedução.',
    'zodiacBody.notVerified.law':
      '«A Europa medieval exigia por lei que o médico consultasse a Lua antes de agir sobre um paciente.» Circula com a data de 1405 e aparece até na Wikipédia em inglês, sempre sem fonte primária. Nenhum estatuto, ordenança ou regulamento de faculdade foi localizado.',
    'zodiacBody.notVerified.hippocrates':
      '«Um médico sem conhecimento de astrologia não tem direito de se chamar médico», atribuído a Hipócrates. Citação espúria: não consta do Corpus Hipocrático, e a astrologia zodiacal nem sequer estava formada na Grécia do século V a.C.',
    'zodiacBody.notVerified.chauliac':
      'A passagem do Chirurgia Magna de Guy de Chauliac (1363) aplicando a regra do ferro. Sabe-se que ele escreveu sobre o astrolábio e que a obra trata de sangria, mas o trecho astrológico não foi localizado.',
    'zodiacBody.notVerified.humourMap':
      'Uma formulação antiga e fechada do mapa planeta ↔ quatro humores. Não foi localizada em fonte antiga nenhuma.',
  },

  es: {
    'home.card.zodiacbody.title': 'Hombre Zodiacal',
    'home.card.zodiacbody.subtitle': 'Historia, siglos I a XVII',

    'zodiacBody.title': 'Hombre Zodiacal',
    'zodiacBody.subtitle': 'Historia de la astrología médica',
    'zodiacBody.notice.title': 'Esto es historia, no orientación de salud',
    'zodiacBody.notice.body':
      'Esta pantalla describe lo que astrólogos y médicos escribieron entre el siglo I y el siglo XVII. Nada de lo que hay aquí evalúa, describe ni orienta el cuerpo de quien lee, y nada de esto sustituye a un profesional de la salud. Ante un síntoma o una duda de salud, consultá a un médico, no a un almanaque de 1450.',
    'zodiacBody.notice.footer':
      'Registro histórico. Ninguna frase de esta pantalla se aplica a tu cuerpo, hoy ni ningún otro día. Síntoma o duda de salud: consultá a un profesional de la salud.',
    'zodiacBody.expand': 'abrir',
    'zodiacBody.collapse': 'cerrar',

    'zodiacBody.figure.hint': 'Tocá una región de la figura para leer la entrada de ese signo.',
    'zodiacBody.figure.a11y':
      'Figura del hombre zodiacal, con los doce signos distribuidos de la cabeza a los pies.',
    'zodiacBody.figure.regionA11y': '{sign} — {part}',
    'zodiacBody.figure.legendSun': 'Tu signo solar',
    'zodiacBody.figure.legendMoon': 'Dónde está la Luna hoy',

    'zodiacBody.moon.title': 'La Luna hoy',
    'zodiacBody.moon.part': '{sign} respondía por: {part} — es lo que dice la lista antigua de Manilio.',
    'zodiacBody.moon.changes': 'La Luna entra en {sign} — {part} — dentro de {duration}.',
    'zodiacBody.moon.durH': '{h} h',
    'zodiacBody.moon.durDH': '{d} d {h} h',
    'zodiacBody.moon.rate':
      'La Luna recorre los doce signos en unos 27,3 días, cerca de 2,5 días en cada uno. Ese era el reloj de los almanaques.',
    'zodiacBody.moon.practice':
      'Lo que se hacía con esa posición, en el pasado: entre los siglos XIV y XVII, quien seguía el aforismo 20 del Centiloquium trataba la posición de la Luna como un calendario rotativo y dejaba la región del cuerpo ligada al signo lunar fuera de la sangría durante esos dos días y medio. Ese cálculo salió de la medicina hace siglos y está aquí como pieza de historia: no dice nada sobre tu cuerpo, hoy ni ningún otro día.',
    'zodiacBody.moon.unavailable': 'No se pudo calcular la posición de la Luna ahora.',

    'zodiacBody.sun.title': 'Tu signo solar en la lista',
    'zodiacBody.sun.body': 'En la lista antigua de Manilio, {sign} respondía por: {part}.',
    'zodiacBody.sun.caveat':
      'Una salvedad que lo cambia todo: la tradición no leía el cuerpo por el signo de nacimiento. La melotesia — el nombre técnico de ese mapa entre signos y partes del cuerpo — trabajaba con la posición de la LUNA en el instante del procedimiento. Y «mi signo» como identidad personal es invención reciente: nació en las columnas de diario, en la prensa popular del siglo XX, a partir de los años treinta. Esta línea es curiosidad sobre la lista antigua, no una lectura sobre vos.',
    'zodiacBody.sun.none':
      'Tu signo todavía no está registrado, así que no se puede mostrar en qué punto de la lista antigua caería.',
    'zodiacBody.sun.noneCta': 'Registrar mi signo',

    'zodiacBody.entry.label': 'Entrada',
    'zodiacBody.entry.noteLabel': 'Lo que la investigación corrige',
    'zodiacBody.entry.flagLateLayer': 'la versión popular de esta vino mucho después',
    'zodiacBody.confidence.media':
      'Confianza media: la datación de esta pieza es incierta en la propia literatura académica.',

    'zodiacBody.author.manilius': 'Manilio',
    'zodiacBody.author.ptolemy': 'Ptolomeo',
    'zodiacBody.author.culpeper': 'Nicholas Culpeper',
    'zodiacBody.manilius.when': 'siglo I d. C.',

    'zodiacBody.section.planets': 'Regencia planetaria, en Ptolomeo',
    'zodiacBody.section.history': 'Cómo esto llegó a ser medicina, y cómo salió de ella',
    'zodiacBody.section.culpeper': 'Culpeper, 1653: cómo se decidía el planeta de una planta',
    'zodiacBody.section.modern': 'Lo que NO es de la tradición antigua',
    'zodiacBody.section.notVerified': 'Lo que la investigación no pudo confirmar',
    'zodiacBody.section.sources': 'Fuentes',

    'zodiacBody.planets.intro':
      'Aquí conviene deshacer una confusión común: son dos listas antiguas, de dos autores distintos. La de los doce signos (Aries = cabeza…) es del poeta Manilio; la que viene abajo, la de los planetas, es la que Ptolomeo enumera de verdad en el Tetrabiblos. Atribuir la lista Aries-cabeza al Tetrabiblos es un error corriente, incluso en textos que se presentan como serios: Ptolomeo presupone la correspondencia entre signo y parte del cuerpo, pero en ningún momento la escribe.',
    'zodiacBody.planets.qualities':
      'Cada planeta tenía su «temperatura», como si fuera clima — es lo que la tradición llama cualidades elementales: el Sol, calor y sequedad moderada; la Luna, sobre todo húmeda; Saturno, frío y seco (actuaba más por el frío que por la sequedad); Marte, seco y muy caliente; Júpiter, caliente y húmedo en su justa medida; Venus, templada y más húmeda que caliente; Mercurio, ya seco, ya húmedo. El calor y la humedad se tenían por nutritivos; la sequedad y el frío, por destructivos — y de ahí salen Júpiter, Venus y la Luna «benéficos», Saturno y Marte «maléficos», Sol y Mercurio comunes. Todo esto está en Ptolomeo: las cualidades en el Tetrabiblos I.iv, la división nutritivo/destructivo en I.v.',
    'zodiacBody.planets.humours':
      'Salvedad metodológica — ¿y los famosos cuatro humores, la sangre, la flema y las dos bilis, la base de la medicina antigua? El mapa cerrado que se repite por ahí (Júpiter sanguíneo, Marte colérico, Saturno melancólico, Luna y Venus flemáticos) no aparece en ninguno de estos capítulos: Ptolomeo nunca cuelga los humores de Galeno, uno a uno, en los planetas. Ese mapa es una síntesis medieval y renacentista, hecha cruzando a Galeno con el Tetrabiblos. Que la síntesis existió y circuló no está en duda; lo que no se sostiene es atribuirla a un autor antiguo concreto.',

    'zodiacBody.planet.saturn.name': 'Saturno',
    'zodiacBody.planet.saturn.parts': 'La oreja derecha, el bazo, la vejiga, la flema y los huesos.',
    'zodiacBody.planet.saturn.note':
      'Ptolomeo le da a Saturno la FLEMA, no la bilis negra. La ecuación Saturno = bilis negra = melancólico es una síntesis medieval y renacentista posterior, no una frase del Tetrabiblos.',
    'zodiacBody.planet.jupiter.name': 'Júpiter',
    'zodiacBody.planet.jupiter.parts': 'La mano, los pulmones, las arterias y el semen.',
    'zodiacBody.planet.jupiter.note':
      'En la traducción de Ashmand dice «la mano»; en la edición de Robbins, «el tacto». La divergencia es de traducción, no de doctrina.',
    'zodiacBody.planet.mars.name': 'Marte',
    'zodiacBody.planet.mars.parts':
      'La oreja izquierda, los riñones, las venas y las partes pudendas.',
    'zodiacBody.planet.mars.note':
      'Los riñones son de Marte, no de Libra. Y la bilis, en Ptolomeo, es de Mercurio: la relación de Marte con la cólera viene por otra vía — en I.iv es caliente y seco, y caliente con seco es la complexión colérica de Galeno. Es una inferencia de segundo orden, documentada en la tradición medieval, pero no está escrita en el Tetrabiblos.',
    'zodiacBody.planet.sun.name': 'Sol',
    'zodiacBody.planet.sun.parts':
      'Los ojos, el cerebro, el corazón, los tendones y todo el lado derecho.',
    'zodiacBody.planet.sun.note':
      'Aquí está el origen real de la asociación con el corazón: en el planeta, no en el signo de Leo.',
    'zodiacBody.planet.venus.name': 'Venus',
    'zodiacBody.planet.venus.parts': 'Las fosas nasales, el hígado y la carne.',
    'zodiacBody.planet.mercury.name': 'Mercurio',
    'zodiacBody.planet.mercury.parts':
      'El habla, el entendimiento, la bilis, la lengua y el fundamento.',
    'zodiacBody.planet.moon.name': 'Luna',
    'zodiacBody.planet.moon.parts':
      'El paladar, la garganta, el estómago, el vientre, el útero y todo el lado izquierdo.',

    'zodiacBody.sign.aries.name': 'Aries',
    'zodiacBody.sign.aries.part': 'Cabeza',
    'zodiacBody.sign.aries.gloss': 'A Aries le tocó la cabeza, la primera de todas las partes.',
    'zodiacBody.sign.aries.note':
      'Culpeper todavía operaba con esa relación en 1653: registró el romero como planta del Sol «under the celestial Ram» y la betónica como de Júpiter y del signo de Aries.',
    'zodiacBody.sign.touro.name': 'Tauro',
    'zodiacBody.sign.touro.part': 'Cuello',
    'zodiacBody.sign.touro.gloss': 'A Tauro le tocó el bellísimo cuello.',
    'zodiacBody.sign.touro.note':
      '«colla», en latín, es cuello. La extensión hasta la garganta es posterior: en 1653 Culpeper escribió que «Venus rules the throat (it being under Taurus her sign)».',
    'zodiacBody.sign.gemeos.name': 'Géminis',
    'zodiacBody.sign.gemeos.part': 'Brazos, unidos a los hombros',
    'zodiacBody.sign.gemeos.gloss':
      'A Géminis se le atribuyeron los brazos, unidos a los hombros, en partes iguales.',
    'zodiacBody.sign.gemeos.note':
      'El texto antiguo habla de brazos y hombros, y de nada más. Pulmones y sistema nervioso no están ahí: entran con la literatura del siglo XX.',
    'zodiacBody.sign.cancer.name': 'Cáncer',
    'zodiacBody.sign.cancer.part': 'Pecho',
    'zodiacBody.sign.cancer.gloss': 'Bajo Cáncer quedó situado el pecho.',
    'zodiacBody.sign.cancer.note':
      'Manilio escribe solamente «pecho». La ampliación a «estómago y pulmones» aparece en paráfrasis inglesas tardías, como el almanaque impreso para Daniel Brown en 1628. En Ptolomeo el estómago es de la Luna, no de Cáncer.',
    'zodiacBody.sign.leao.name': 'Leo',
    'zodiacBody.sign.leao.part': 'Costados y omóplatos',
    'zodiacBody.sign.leao.gloss': 'A Leo le tocó el dominio de los costados y los omóplatos.',
    'zodiacBody.sign.leao.note':
      'Corrección importante: Manilio no le da el corazón a Leo. El corazón es del SOL, en Ptolomeo. «Leo = corazón» es una deducción posterior, por la cadena Sol → Leo, la misma que Culpeper opera en 1653 al registrar la caléndula como planta del Sol y de Leo.',
    'zodiacBody.sign.virgem.name': 'Virgo',
    'zodiacBody.sign.virgem.part': 'Bajo vientre',
    'zodiacBody.sign.virgem.gloss':
      'A Virgo bajaron, como parte propia, los costados inferiores del vientre.',
    'zodiacBody.sign.virgem.note':
      '«ilia» son los costados bajos del vientre; los almanaques ingleses lo tradujeron como «guts and belly». Intestinos, páncreas y vesícula no están en el original.',
    'zodiacBody.sign.libra.name': 'Libra',
    'zodiacBody.sign.libra.part': 'Nalgas y caderas',
    'zodiacBody.sign.libra.gloss': 'A Libra le tocaron las nalgas.',
    'zodiacBody.sign.libra.note':
      '«Libra = riñones» no está en Manilio. En Ptolomeo los riñones pertenecen a Marte. Es un añadido tardío.',
    'zodiacBody.sign.escorpiao.name': 'Escorpio',
    'zodiacBody.sign.escorpiao.part': 'Ingle',
    'zodiacBody.sign.escorpiao.gloss': 'Y el Escorpión se alegra con la ingle.',
    'zodiacBody.sign.escorpiao.note':
      'Ptolomeo atribuye las partes pudendas a Marte, planeta que en la tradición responde por Escorpio: aquí las dos capas convergen, en lugar de contradecirse.',
    'zodiacBody.sign.sagitario.name': 'Sagitario',
    'zodiacBody.sign.sagitario.part': 'Muslos',
    'zodiacBody.sign.sagitario.gloss': 'Al Centauro se le suman los muslos.',
    'zodiacBody.sign.sagitario.note':
      'Manilio llama al signo «Centauro». En Ptolomeo, Sagitario y Géminis aparecen en otra clave de doctrina, ligada a caídas y a males convulsivos: otra capa, no la melotesia corporal.',
    'zodiacBody.sign.capricornio.name': 'Capricornio',
    'zodiacBody.sign.capricornio.part': 'Las dos rodillas',
    'zodiacBody.sign.capricornio.gloss':
      'A Capricornio le tocó el mando de ambas rodillas: el latín dice «ambas», explícitamente.',
    'zodiacBody.sign.capricornio.note':
      'Huesos, piel y articulaciones vienen de la regencia de Saturno, a quien Ptolomeo atribuye los huesos, y no del signo.',
    'zodiacBody.sign.aquario.name': 'Acuario',
    'zodiacBody.sign.aquario.part': 'Piernas, del muslo hacia abajo',
    'zodiacBody.sign.aquario.gloss':
      'Al Acuario que vierte el agua le tocó el arbitrio sobre las piernas.',
    'zodiacBody.sign.aquario.note':
      '«crura» son las piernas del muslo hacia abajo, las canillas. «Acuario = sistema circulatorio» o «vasos sanguíneos» no tiene ningún respaldo antiguo.',
    'zodiacBody.sign.peixes.name': 'Piscis',
    'zodiacBody.sign.peixes.part': 'Pies',
    'zodiacBody.sign.peixes.gloss': 'Y los Peces reclaman para sí el derecho sobre los pies.',
    'zodiacBody.sign.peixes.note':
      'Cierra la secuencia, de la cabeza a los pies. En Astronomica IV.701-710 Manilio repite la correspondencia en una versión abreviada («namque Aries capiti, Taurus cervicibus haeret…»), pero allí entra como ANALOGÍA: el tema del pasaje es qué tierras rige cada signo, no el cuerpo. La lista corta del libro IV confirma la del libro II — Cáncer con el pecho, Leo con los omóplatos — y no le agrega nada.',

    'zodiacBody.history.origin.title': 'La lista más antigua que quedó',
    'zodiacBody.history.origin.body':
      'La lista de los doce signos sobre el cuerpo, de la cabeza a los pies, es más vieja de lo que parece: el registro más antiguo que llegó entero hasta nosotros — la atestación canónica en texto continuo conservado — está en un poema del siglo I d. C., la Astronomica, de Manilio. Y de ella sale todo lo que vino después.',
    'zodiacBody.history.precursor.title': 'Un precursor mesopotámico',
    'zodiacBody.history.precursor.body':
      'Antes de Roma, Babilonia: existe una tablilla de arcilla, en escritura cuneiforme, con una lista casi idéntica de divisiones del cuerpo — babilonia tardía, publicada por John Z. Wee en 2015. Vale registrar que existe. No vale decir «tradición de 5.000 años»: la datación de la tablilla es incierta, no hay vínculo egipcio comprobado, y lo que se documenta son unos dos mil años de tradición textual.',
    'zodiacBody.history.image.title': 'La imagen que todo el mundo ya vio',
    'zodiacBody.history.image.body':
      'Dos cuerpos desnudos, espalda contra espalda, con los doce signos sobre las regiones correspondientes del cuerpo: es la miniatura del «Homme anatomique», en las Très Riches Heures del Duque de Berry. La literatura la describe como iconografía rara en manuscrito iluminado — libro copiado y pintado a mano.',
    'zodiacBody.history.print.title': 'La difusión por la imprenta',
    'zodiacBody.history.print.body':
      'Con la imprenta, la figura salió del manuscrito de lujo y entró en el calendario popular. El calendario de pastores de 1491 y las ediciones inglesas de 1503 y 1506 traían xilografías del hombre zodiacal junto a las instrucciones de sangría.',
    'zodiacBody.history.rule.title': 'La regla que gobernaba la práctica',
    'zodiacBody.history.rule.body':
      'La regla central de esa práctica pasó siglos con la firma equivocada — y es el punto en el que más se falla hasta hoy. No viene de Ptolomeo: es el aforismo 20 del Centiloquium, una colección de cien aforismos que la Edad Media y la Edad Moderna enteras le atribuyeron a él, pero que es pseudoepigráfica — en criollo, obra firmada con el nombre de otro. Richard Lemay argumentó que el autor real sería Abu Jaʿfar Ahmad ibn Yusuf, astrólogo árabe del siglo X — tesis suya, no consenso cerrado. La primera traducción latina completa es de Barcelona, 1136, y los aforismos vecinos formaban todo un bloque de reglas de calendario terapéutico.',
    'zodiacBody.history.instruments.title': 'Los instrumentos de trabajo',
    'zodiacBody.history.instruments.body':
      'La Luna recorre los doce signos en unos 27,3 días, cerca de 2,5 días en cada uno, así que la regla funcionaba como un calendario rotativo de días impropios para cada región. El instrumento era el almanaque plegable de los siglos XIV y XV — apodado «bat book» porque colgaba boca abajo del cinturón —, que traía el hombre zodiacal junto al diagrama de los puntos de sangría y tablas lunares. También estaba la volvelle, un calendario de discos giratorios para localizar la Luna.',
    'zodiacBody.history.university.title': 'Esto era materia de universidad',
    'zodiacBody.history.university.body':
      'No era folclore. En Bolonia, en los años 1320, Cecco d’Ascoli abría sus clases afirmando que la astrología era parte integrante del estudio de la medicina, y la astrología médica se volvió particularmente fuerte en las universidades italianas de los siglos XIV y XV. París, Padua, Bolonia y Florencia tuvieron cátedras de astrología.',
    'zodiacBody.history.plague.title': 'La Peste Negra explicada por una conjunción',
    'zodiacBody.history.plague.body':
      'El caso mejor documentado es el de la Peste Negra. Cuando barrió Europa, la Facultad de Medicina de París, a pedido de Felipe VI, redactó el Compendium de epidemia (octubre de 1348) — y la explicación era el cielo: una conjunción de Saturno, Júpiter y Marte en Acuario, ocurrida «una hora después del mediodía del 20 de marzo de 1345».',
    'zodiacBody.history.exit.title': 'Cómo salió de la medicina',
    'zodiacBody.history.exit.body':
      'No hubo un decreto único: hubo erosión. La autoridad fue cambiando de dirección — del cielo a la disección y la observación. La Fabrica de Vesalio, en 1543, empujó en ese sentido; el De motu cordis de Harvey, en 1628, empujó de nuevo. En el siglo XVII los médicos universitarios pasaron a invocar la influencia celeste cada vez con menos frecuencia — pero la literatura académica reciente insiste: no existe un punto único de rechazo formal. A fines del siglo XVII la iatromatemática (el nombre de época de la astrología aplicada a la medicina) ya no se enseñaba, pero todavía se practicaba en 1700 «widely and lucratively» — en criollo: por todas partes, y dando dinero. Lo que cambió primero fue el registro social: de controversia pasó a motivo de risa. Los residuos institucionales duraron mucho: los titulares de las cátedras de astronomía de Salamanca y de Bolonia todavía estaban obligados a producir almanaques astrológicos para los estudiantes de medicina hasta 1770 y 1799. Bulas papales condenaron la astrología judiciaria — la que hacía predicciones sobre personas y acontecimientos — en 1586 y en 1631; estas dos fechas quedan con confianza media: sus textos no fueron reverificados en esta investigación.',
    'zodiacBody.history.afterlife.title': 'Dónde fue a parar',
    'zodiacBody.history.afterlife.body':
      'Expulsado de la universidad, el hombre zodiacal migró al almanaque popular: de los calendarios de pastores a los almanaques agrícolas angloamericanos, donde la figura siguió imprimiéndose durante siglos. Es de ahí, y no de la medicina, de donde llega hasta hoy.',

    'zodiacBody.culpeper.who':
      'Nicholas Culpeper (1616-1654) publicó The English Physitian en 1652 y la versión ampliada, The Complete Herbal, en 1653. Escribía en inglés, contra el monopolio del latín, y atacaba de frente a la corporación médica: el libro es pieza de disputa profesional, no consenso médico de la época.',
    'zodiacBody.culpeper.method':
      'La entrada del ajenjo es donde cuenta, sin esconder el juego, cómo decidía la regencia de una planta — su planeta. No es ninguna revelación: es un silogismo escolástico — el razonamiento en tres pasos que se enseñaba en las escuelas medievales — y el argumento es el LUGAR donde la planta crece.',
    'zodiacBody.culpeper.chain':
      'La cadena signo → parte del cuerpo → planeta aparece en su propia frase, a propósito de la garganta:',
    'zodiacBody.culpeper.antipathy':
      'El esquema tenía dos vías, simpatía y antipatía, y el par más opuesto era Marte y Venus:',
    'zodiacBody.culpeper.examplesLabel': 'Atribuciones, en la fórmula fija del libro',
    'zodiacBody.culpeper.politics': 'Y la razón de que todo esto esté escrito en inglés:',
    'zodiacBody.culpeper.warning':
      'Nada de esto aparece aquí como uso posible, ni parafraseado ni con salvedad. De cada entrada quedaron solo la atribución planetaria y el razonamiento; la parte terapéutica fue cortada a propósito. Es el registro de lo que un autor escribió en 1653.',
    'zodiacBody.culpeper.herb.rosemary': 'Romero',
    'zodiacBody.culpeper.herb.marigold': 'Caléndula',
    'zodiacBody.culpeper.herb.woodBetony': 'Betónica',
    'zodiacBody.culpeper.herb.vervain': 'Verbena',
    'zodiacBody.culpeper.herb.camomile': 'Manzanilla',
    'zodiacBody.culpeper.herb.bittersweet': 'Dulcamara',
    'zodiacBody.culpeper.herb.angelica': 'Angélica — y la hora de la recolección',

    'zodiacBody.modern.intro':
      'Mucho de lo que hoy se presenta como «tradición antigua» tiene unos cien años: entró por la literatura teosófica y rosacruz del siglo XX — corrientes esotéricas de aquel comienzo de siglo — con Heinrich Daath (Medical Astrology, manual n.º 9 de la serie de Alan Leo, 1914), Max y Augusta Foss Heindel (1929) y H. L. Cornell (1933). Nada de esto está en Manilio ni en Ptolomeo:',
    'zodiacBody.modern.glands':
      '«Aries rige las suprarrenales», «Libra rige el sistema endocrino», «Piscis rige el sistema linfático», «Géminis rige el sistema nervioso», «Acuario rige el sistema circulatorio», «Virgo rige el páncreas». Las suprarrenales, las glándulas endocrinas, el sistema linfático, la inmunidad y la función del páncreas son conceptos de los siglos XIX y XX: los antiguos no podían conocerlos.',
    'zodiacBody.modern.libraKidneys':
      '«Libra rige los riñones» contradice las dos fuentes antiguas a la vez: Manilio le da a Libra las nalgas, y Ptolomeo les da los riñones a Marte.',
    'zodiacBody.modern.leoHeart':
      '«Leo = corazón» y «Cáncer = estómago» como doctrina antigua son media verdad. Manilio le da a Leo los costados y los omóplatos, y a Cáncer el pecho; el corazón es del Sol y el estómago es de la Luna, en Ptolomeo. La migración de la regencia del planeta al signo que gobierna es deducción posterior.',
    'zodiacBody.modern.outerPlanets':
      'Urano, Neptuno y Plutón en la astrología médica son anacronismo puro: fueron descubiertos en 1781, 1846 y 1930. Ningún autor de esta tradición los conoció.',
    'zodiacBody.modern.chakras':
      'Los chakras mapeados en signos son sincretismo del siglo XX, vía teosofía. La tradición de los chakras es india y no tiene relación histórica con la melotesia grecolatina.',
    'zodiacBody.modern.diet':
      '«Dieta de tu signo», suplemento, vitamina, aceite esencial o sal de Schuessler por signo: las sales bioquímicas de Schuessler son de 1873, y su vinculación con los signos es posterior y comercial. No existe en las fuentes antiguas.',
    'zodiacBody.modern.weakSpot':
      '«Tu signo muestra tu punto débil de salud.» La tradición antigua no hacía eso a partir del signo de nacimiento: la melotesia operaba con la posición de la Luna en el instante del procedimiento. Y el signo solar como identidad personal es invención de la prensa popular del siglo XX.',
    'zodiacBody.modern.consensus':
      '«Era medicina consensuada y todo el mundo creía» es una simplificación. Ya en la época hubo crítica interna, y la literatura académica actual rechaza tanto la narrativa de creencia universal como la de rechazo súbito por un único evento científico.',

    'zodiacBody.notVerified.intro':
      'Cuatro cosas fueron buscadas y no fueron encontradas. Quedan registradas como laguna: decir que no se encontró es más honesto que completar por deducción.',
    'zodiacBody.notVerified.law':
      '«La Europa medieval exigía por ley que el médico consultara la Luna antes de actuar sobre un paciente.» Circula con la fecha de 1405 y aparece hasta en la Wikipedia en inglés, siempre sin fuente primaria. No se localizó ningún estatuto, ordenanza ni reglamento de facultad.',
    'zodiacBody.notVerified.hippocrates':
      '«Un médico sin conocimiento de astrología no tiene derecho a llamarse médico», atribuido a Hipócrates. Cita espuria: no consta en el Corpus Hipocrático, y la astrología zodiacal ni siquiera estaba formada en la Grecia del siglo V a. C.',
    'zodiacBody.notVerified.chauliac':
      'El pasaje del Chirurgia Magna de Guy de Chauliac (1363) aplicando la regla del hierro. Se sabe que escribió sobre el astrolabio y que la obra trata de la sangría, pero el fragmento astrológico no fue localizado.',
    'zodiacBody.notVerified.humourMap':
      'Una formulación antigua y cerrada del mapa planeta ↔ cuatro humores. No fue localizada en ninguna fuente antigua.',
  },

  en: {
    'home.card.zodiacbody.title': 'Zodiac Man',
    'home.card.zodiacbody.subtitle': 'History, 1st to 17th c.',

    'zodiacBody.title': 'Zodiac Man',
    'zodiacBody.subtitle': 'A history of medical astrology',
    'zodiacBody.notice.title': 'This is history, not health guidance',
    'zodiacBody.notice.body':
      'This screen describes what astrologers and physicians wrote between the 1st and the 17th century. Nothing here assesses, describes or directs the body of the person reading it, and nothing here replaces a health professional. For a symptom or a health question, see a doctor — not a 1450 almanac.',
    'zodiacBody.notice.footer':
      'Historical record. No sentence on this screen applies to your body, today or on any other day. Symptom or health question: see a health professional.',
    'zodiacBody.expand': 'open',
    'zodiacBody.collapse': 'close',

    'zodiacBody.figure.hint': 'Tap a region of the figure to read that sign’s entry.',
    'zodiacBody.figure.a11y':
      'Figure of the zodiac man, with the twelve signs laid out from head to feet.',
    'zodiacBody.figure.regionA11y': '{sign} — {part}',
    'zodiacBody.figure.legendSun': 'Your sun sign',
    'zodiacBody.figure.legendMoon': 'Where the Moon is today',

    'zodiacBody.moon.title': 'The Moon today',
    'zodiacBody.moon.part': '{sign} answered for: {part} — that is what Manilius’s old list says.',
    'zodiacBody.moon.changes': 'The Moon enters {sign} — {part} — in {duration}.',
    'zodiacBody.moon.durH': '{h} h',
    'zodiacBody.moon.durDH': '{d} d {h} h',
    'zodiacBody.moon.rate':
      'The Moon runs through the twelve signs in about 27.3 days, roughly 2.5 days in each. That was the clock the almanacs ran on.',
    'zodiacBody.moon.practice':
      'What was done with that position, in the past: between the 14th and the 17th century, anyone following aphorism 20 of the Centiloquium treated the Moon’s position as a rotating calendar and left the body region tied to the lunar sign out of bloodletting for those two and a half days. That calculation left medicine centuries ago and sits here as a piece of history — it says nothing about your body, today or on any other day.',
    'zodiacBody.moon.unavailable': 'The Moon’s position could not be calculated right now.',

    'zodiacBody.sun.title': 'Your sun sign in the list',
    'zodiacBody.sun.body': 'In Manilius’s old list, {sign} answered for: {part}.',
    'zodiacBody.sun.caveat':
      'One caveat changes everything: the tradition did not read the body from the birth sign. Melothesia — the technical name for that map between signs and body parts — worked with the position of the MOON at the moment of the procedure. And “my sign” as personal identity is a recent invention: it was born in newspaper columns, in the 20th-century popular press, from the 1930s on. This line is a curiosity about the old list, not a reading about you.',
    'zodiacBody.sun.none':
      'Your sign has not been entered yet, so there is no way to show where it would fall in the old list.',
    'zodiacBody.sun.noneCta': 'Enter my sign',

    'zodiacBody.entry.label': 'Entry',
    'zodiacBody.entry.noteLabel': 'What the research corrects',
    'zodiacBody.entry.flagLateLayer': 'the popular version of this one came much later',
    'zodiacBody.confidence.media':
      'Medium confidence: the dating of this piece is uncertain in the scholarly literature itself.',

    'zodiacBody.author.manilius': 'Manilius',
    'zodiacBody.author.ptolemy': 'Ptolemy',
    'zodiacBody.author.culpeper': 'Nicholas Culpeper',
    'zodiacBody.manilius.when': '1st century AD',

    'zodiacBody.section.planets': 'Planetary rulership, in Ptolemy',
    'zodiacBody.section.history': 'How this became medicine, and how it left',
    'zodiacBody.section.culpeper': 'Culpeper, 1653: how a plant’s planet was decided',
    'zodiacBody.section.modern': 'What is NOT from the old tradition',
    'zodiacBody.section.notVerified': 'What the research could not confirm',
    'zodiacBody.section.sources': 'Sources',

    'zodiacBody.planets.intro':
      'Worth clearing up a common mix-up here: these are two ancient lists, by two different authors. The one with the twelve signs (Aries = head…) is by the poet Manilius; the one below, the planetary one, is the list Ptolemy actually enumerates in the Tetrabiblos. Crediting the Aries-head list to the Tetrabiblos is a common error, including in texts that present themselves as serious — Ptolemy presupposes the sign-to-body correspondence but never writes it out.',
    'zodiacBody.planets.qualities':
      'Each planet had its own “temperature”, as if it were weather — that is what the tradition calls elemental qualities: the Sun, heat and moderate dryness; the Moon, chiefly moist; Saturn, cold and dry (working more through the cold than through the dryness); Mars, dry and strongly hot; Jupiter, hot and moist in due measure; Venus, temperate and more moist than hot; Mercury, now dry, now moist. Heat and moisture counted as nutritive; dryness and cold, as destructive — and that is where Jupiter, Venus and the Moon as “benefics”, Saturn and Mars as “malefics”, the Sun and Mercury as common all come from. All of it is in Ptolemy: the qualities in Tetrabiblos I.iv, the nutritive/destructive division in I.v.',
    'zodiacBody.planets.humours':
      'A methodological caveat — and the famous four humours, blood, phlegm and the two biles, the basis of ancient medicine? The closed map that circulates everywhere (Jupiter sanguine, Mars choleric, Saturn melancholic, Moon and Venus phlegmatic) appears in none of these chapters: Ptolemy never hangs Galen’s humours, one by one, on the planets. That map is a medieval and Renaissance synthesis, made by crossing Galen with the Tetrabiblos. That the synthesis existed and circulated is not in doubt; what does not hold is crediting it to one specific ancient author.',

    'zodiacBody.planet.saturn.name': 'Saturn',
    'zodiacBody.planet.saturn.parts':
      'The right ear, the spleen, the bladder, the phlegm and the bones.',
    'zodiacBody.planet.saturn.note':
      'Ptolemy gives Saturn the PHLEGM, not black bile. The equation Saturn = black bile = melancholic is a later medieval and Renaissance synthesis, not a sentence from the Tetrabiblos.',
    'zodiacBody.planet.jupiter.name': 'Jupiter',
    'zodiacBody.planet.jupiter.parts': 'The hand, the lungs, the arteries and the seed.',
    'zodiacBody.planet.jupiter.note':
      'The Ashmand translation reads «the hand»; the Robbins edition reads «touch». The divergence is one of translation, not of doctrine.',
    'zodiacBody.planet.mars.name': 'Mars',
    'zodiacBody.planet.mars.parts':
      'The left ear, the kidneys, the veins and the privities.',
    'zodiacBody.planet.mars.note':
      'The kidneys belong to Mars, not to Libra. And bile, in Ptolemy, belongs to Mercury: the link between Mars and choler comes by another route — in I.iv he is hot and dry, and hot with dry is the choleric complexion of Galen. It is a second-order inference, documented in the medieval tradition, but it is not written in the Tetrabiblos.',
    'zodiacBody.planet.sun.name': 'Sun',
    'zodiacBody.planet.sun.parts':
      'The eyes, the brain, the heart, the sinews and the whole right side.',
    'zodiacBody.planet.sun.note':
      'This is where the heart association really comes from: from the planet, not from the sign of Leo.',
    'zodiacBody.planet.venus.name': 'Venus',
    'zodiacBody.planet.venus.parts': 'The nostrils, the liver and the flesh.',
    'zodiacBody.planet.mercury.name': 'Mercury',
    'zodiacBody.planet.mercury.parts':
      'Speech, understanding, the bile, the tongue and the fundament.',
    'zodiacBody.planet.moon.name': 'Moon',
    'zodiacBody.planet.moon.parts':
      'The palate, the throat, the stomach, the belly, the womb and the whole left side.',

    'zodiacBody.sign.aries.name': 'Aries',
    'zodiacBody.sign.aries.part': 'Head',
    'zodiacBody.sign.aries.gloss': 'Aries was allotted the head, first of all the parts.',
    'zodiacBody.sign.aries.note':
      'Culpeper was still working with this link in 1653: he recorded rosemary as a plant of the Sun «under the celestial Ram», and wood betony as belonging to Jupiter and to the sign of Aries.',
    'zodiacBody.sign.touro.name': 'Taurus',
    'zodiacBody.sign.touro.part': 'Neck',
    'zodiacBody.sign.touro.gloss': 'Taurus was allotted the handsome neck.',
    'zodiacBody.sign.touro.note':
      '«colla», in Latin, is the neck. The stretch to the throat is later: in 1653 Culpeper wrote that «Venus rules the throat (it being under Taurus her sign)».',
    'zodiacBody.sign.gemeos.name': 'Gemini',
    'zodiacBody.sign.gemeos.part': 'Arms, joined to the shoulders',
    'zodiacBody.sign.gemeos.gloss':
      'To Gemini were assigned the arms, joined to the shoulders, in equal shares.',
    'zodiacBody.sign.gemeos.note':
      'The ancient text speaks of arms and shoulders, and of nothing else. Lungs and the nervous system are not there: they enter with 20th-century literature.',
    'zodiacBody.sign.cancer.name': 'Cancer',
    'zodiacBody.sign.cancer.part': 'Chest',
    'zodiacBody.sign.cancer.gloss': 'Under Cancer the chest was placed.',
    'zodiacBody.sign.cancer.note':
      'Manilius writes only «chest». The stretch to «stomach and lungs» shows up in late English paraphrases, such as the almanac printed for Daniel Brown in 1628. In Ptolemy the stomach belongs to the Moon, not to Cancer.',
    'zodiacBody.sign.leao.name': 'Leo',
    'zodiacBody.sign.leao.part': 'Flanks and shoulder blades',
    'zodiacBody.sign.leao.gloss': 'Leo was allotted dominion over the flanks and the shoulder blades.',
    'zodiacBody.sign.leao.note':
      'An important correction: Manilius does not give the heart to Leo. The heart belongs to the SUN, in Ptolemy. «Leo = heart» is a later deduction along the Sun → Leo chain — the same chain Culpeper works in 1653 when he records marigold as a plant of the Sun and under Leo.',
    'zodiacBody.sign.virgem.name': 'Virgo',
    'zodiacBody.sign.virgem.part': 'Lower belly',
    'zodiacBody.sign.virgem.gloss':
      'To Virgo descended, as her own share, the lower flanks of the belly.',
    'zodiacBody.sign.virgem.note':
      '«ilia» are the lower flanks of the belly; English almanacs rendered it as «guts and belly». Intestines, pancreas and gallbladder are not in the original.',
    'zodiacBody.sign.libra.name': 'Libra',
    'zodiacBody.sign.libra.part': 'Buttocks and haunches',
    'zodiacBody.sign.libra.gloss': 'Libra was allotted the buttocks.',
    'zodiacBody.sign.libra.note':
      '«Libra = kidneys» is not in Manilius. In Ptolemy the kidneys belong to Mars. It is a late addition.',
    'zodiacBody.sign.escorpiao.name': 'Scorpio',
    'zodiacBody.sign.escorpiao.part': 'Groin',
    'zodiacBody.sign.escorpiao.gloss': 'And the Scorpion delights in the groin.',
    'zodiacBody.sign.escorpiao.note':
      'Ptolemy assigns the privities to Mars, the planet that in the tradition answers for Scorpio — here the two layers converge instead of contradicting each other.',
    'zodiacBody.sign.sagitario.name': 'Sagittarius',
    'zodiacBody.sign.sagitario.part': 'Thighs',
    'zodiacBody.sign.sagitario.gloss': 'To the Centaur the thighs are added.',
    'zodiacBody.sign.sagitario.note':
      'Manilius calls the sign «Centaur». In Ptolemy, Sagittarius and Gemini appear in a different key of doctrine, tied to falls and convulsive illness: another layer, not bodily melothesia.',
    'zodiacBody.sign.capricornio.name': 'Capricorn',
    'zodiacBody.sign.capricornio.part': 'Both knees',
    'zodiacBody.sign.capricornio.gloss':
      'Capricorn was allotted command of both knees — the Latin says «both», explicitly.',
    'zodiacBody.sign.capricornio.note':
      'Bones, skin and joints come from the rulership of Saturn, to whom Ptolemy assigns the bones, and not from the sign.',
    'zodiacBody.sign.aquario.name': 'Aquarius',
    'zodiacBody.sign.aquario.part': 'Legs, from the thigh down',
    'zodiacBody.sign.aquario.gloss':
      'To the water-pouring Aquarius fell the jurisdiction over the legs.',
    'zodiacBody.sign.aquario.note':
      '«crura» are the legs from the thigh down, the shins. «Aquarius = circulatory system» or «blood vessels» has no ancient grounding whatsoever.',
    'zodiacBody.sign.peixes.name': 'Pisces',
    'zodiacBody.sign.peixes.part': 'Feet',
    'zodiacBody.sign.peixes.gloss': 'And the Fishes claim for themselves the right over the feet.',
    'zodiacBody.sign.peixes.note':
      'It closes the sequence, head to feet. In Astronomica IV.701-710 Manilius repeats the correspondence in a shortened version («namque Aries capiti, Taurus cervicibus haeret…»), but there it comes in as an ANALOGY: the subject of the passage is which lands each sign rules, not the body. The short list in Book IV confirms the Book II one — Cancer with the chest, Leo with the shoulder blades — and adds nothing to it.',

    'zodiacBody.history.origin.title': 'The oldest list that survived',
    'zodiacBody.history.origin.body':
      'The list of the twelve signs over the body, head to feet, is older than it looks: the oldest record that reached us whole — the canonical attestation in continuous surviving text — sits in a 1st-century AD poem, the Astronomica, by Manilius. And everything that came later comes out of it.',
    'zodiacBody.history.precursor.title': 'A Mesopotamian precursor',
    'zodiacBody.history.precursor.body':
      'Before Rome, Babylon: there is a clay tablet, in cuneiform script, with an almost identical list of bodily divisions — late Babylonian, published by John Z. Wee in 2015. It is worth recording that it exists. It is not worth saying «a 5,000-year tradition»: the tablet’s dating is uncertain, there is no proven Egyptian link, and what is documented is roughly two thousand years of textual tradition.',
    'zodiacBody.history.image.title': 'The image everyone has already seen',
    'zodiacBody.history.image.body':
      'Two naked bodies, back to back, with the twelve signs over the corresponding regions of the body: that is the «Homme anatomique» miniature, in the Très Riches Heures of the Duke of Berry. The literature describes it as rare iconography in an illuminated manuscript — a book copied and painted by hand.',
    'zodiacBody.history.print.title': 'Spread by the printing press',
    'zodiacBody.history.print.body':
      'With print, the figure left the luxury manuscript and entered the popular calendar. The shepherds’ calendar of 1491 and the English editions of 1503 and 1506 carried woodcuts of the zodiac man beside the bloodletting instructions.',
    'zodiacBody.history.rule.title': 'The rule that governed the practice',
    'zodiacBody.history.rule.body':
      'The central rule of this practice spent centuries under the wrong signature — and it is still the point most often got wrong. It does not come from Ptolemy: it is aphorism 20 of the Centiloquium, a collection of one hundred aphorisms that the whole Middle Ages and early modern period credited to him, but which is pseudepigraphic — in plain words, a work signed with somebody else’s name. Richard Lemay argued the real author was Abu Jaʿfar Ahmad ibn Yusuf, a 10th-century Arab astrologer — his thesis, not settled consensus. The first complete Latin translation is from Barcelona, 1136, and the neighbouring aphorisms formed a whole block of therapeutic-calendar rules.',
    'zodiacBody.history.instruments.title': 'The tools of the trade',
    'zodiacBody.history.instruments.body':
      'The Moon runs through the twelve signs in about 27.3 days, roughly 2.5 days in each, so the rule worked as a rotating calendar of unsuitable days for each region. The tool was the folding almanac of the 14th and 15th centuries — nicknamed a «bat book» because it hung upside down from the belt — which carried the zodiac man beside the diagram of bloodletting points and lunar tables. There was also the volvelle, a calendar of rotating discs for locating the Moon.',
    'zodiacBody.history.university.title': 'This was a university subject',
    'zodiacBody.history.university.body':
      'It was not folklore. In Bologna, in the 1320s, Cecco d’Ascoli opened his lectures by stating that astrology was an integral part of the study of medicine, and medical astrology became particularly strong in the Italian universities of the 14th and 15th centuries. Paris, Padua, Bologna and Florence all had chairs of astrology.',
    'zodiacBody.history.plague.title': 'The Black Death explained by a conjunction',
    'zodiacBody.history.plague.body':
      'The best-documented case is the Black Death. When it swept Europe, the Paris Medical Faculty, at the request of Philip VI, wrote the Compendium de epidemia (October 1348) — and the explanation was the sky: a conjunction of Saturn, Jupiter and Mars in Aquarius, «at one hour after noon on 20 March 1345».',
    'zodiacBody.history.exit.title': 'How it left medicine',
    'zodiacBody.history.exit.body':
      'There was no single decree: there was erosion. Authority slowly changed address — from the sky to dissection and observation. Vesalius’s Fabrica, in 1543, pushed that way; Harvey’s De motu cordis, in 1628, pushed again. In the 17th century university physicians invoked celestial influence ever more rarely — but recent scholarship insists there is no single point of formal rejection. By the end of the 17th century iatromathematics (the period name for astrology applied to medicine) was no longer taught, yet it was still practised in 1700 «widely and lucratively» — in plain words: all over the place, and profitably. What changed first was the social register: from controversy it turned into a joke. Institutional residues lasted a long time: the holders of the astronomy chairs at Salamanca and Bologna were still required to produce astrological almanacs for medical students until 1770 and 1799. Papal bulls condemned judicial astrology — the kind that made predictions about people and events — in 1586 and 1631; those two dates carry medium confidence here: their texts were not re-checked in this research.',
    'zodiacBody.history.afterlife.title': 'Where it ended up',
    'zodiacBody.history.afterlife.body':
      'Thrown out of the university, the zodiac man migrated into the popular almanac — from the shepherds’ calendars to the Anglo-American farming almanacs, where the figure went on being printed for centuries. It reaches us from there, not from medicine.',

    'zodiacBody.culpeper.who':
      'Nicholas Culpeper (1616-1654) published The English Physitian in 1652 and the expanded version, The Complete Herbal, in 1653. He wrote in English, against the monopoly of Latin, and attacked the medical corporation head-on: the book is a piece of professional dispute, not the medical consensus of its day.',
    'zodiacBody.culpeper.method':
      'The wormwood entry is where he tells us, without hiding the trick, how he decided a plant’s rulership — its planet. It is no revelation: it is a scholastic syllogism — the three-step reasoning taught in the medieval schools — and the argument is the PLACE where the plant grows.',
    'zodiacBody.culpeper.chain':
      'The sign → body part → planet chain appears in his own sentence, apropos of the throat:',
    'zodiacBody.culpeper.antipathy':
      'The scheme had two routes, sympathy and antipathy, and the most opposed pair was Mars and Venus:',
    'zodiacBody.culpeper.examplesLabel': 'Attributions, in the book’s fixed formula',
    'zodiacBody.culpeper.politics': 'And the reason all of this was written in English:',
    'zodiacBody.culpeper.warning':
      'None of this appears here as a possible use — not paraphrased, not hedged. From each entry only the planetary attribution and the reasoning were kept; the therapeutic part was cut on purpose. It is the record of what one author wrote in 1653.',
    'zodiacBody.culpeper.herb.rosemary': 'Rosemary',
    'zodiacBody.culpeper.herb.marigold': 'Marigold',
    'zodiacBody.culpeper.herb.woodBetony': 'Wood betony',
    'zodiacBody.culpeper.herb.vervain': 'Vervain',
    'zodiacBody.culpeper.herb.camomile': 'Camomile',
    'zodiacBody.culpeper.herb.bittersweet': 'Bittersweet',
    'zodiacBody.culpeper.herb.angelica': 'Angelica — and the hour of gathering',

    'zodiacBody.modern.intro':
      'A great deal of what is presented today as «ancient tradition» is about a hundred years old: it came in through the theosophical and Rosicrucian literature of the 20th century — esoteric currents of that turn of the century — with Heinrich Daath (Medical Astrology, no. 9 in the Alan Leo series of manuals, 1914), Max and Augusta Foss Heindel (1929) and H. L. Cornell (1933). None of it is in Manilius or in Ptolemy:',
    'zodiacBody.modern.glands':
      '«Aries rules the adrenals», «Libra rules the endocrine system», «Pisces rules the lymphatic system», «Gemini rules the nervous system», «Aquarius rules the circulatory system», «Virgo rules the pancreas». Adrenals, endocrine glands, the lymphatic system, immunity and the function of the pancreas are 19th- and 20th-century concepts: the ancients could not have known them.',
    'zodiacBody.modern.libraKidneys':
      '«Libra rules the kidneys» contradicts both ancient sources at once: Manilius gives Libra the buttocks, and Ptolemy gives the kidneys to Mars.',
    'zodiacBody.modern.leoHeart':
      '«Leo = heart» and «Cancer = stomach» as ancient doctrine are half-truths. Manilius gives Leo the flanks and shoulder blades, and Cancer the chest; the heart belongs to the Sun and the stomach to the Moon, in Ptolemy. Migrating a rulership from the planet to the sign it governs is a later deduction.',
    'zodiacBody.modern.outerPlanets':
      'Uranus, Neptune and Pluto in medical astrology are pure anachronism: they were discovered in 1781, 1846 and 1930. No author in this tradition knew them.',
    'zodiacBody.modern.chakras':
      'Chakras mapped onto signs are 20th-century syncretism, by way of theosophy. The chakra tradition is Indian and has no historical relation to Greco-Latin melothesia.',
    'zodiacBody.modern.diet':
      '«Your sign’s diet», supplement, vitamin, essential oil or Schuessler salt by sign: the Schuessler biochemic salts date from 1873, and their attachment to signs is later and commercial. It does not exist in the ancient sources.',
    'zodiacBody.modern.weakSpot':
      '«Your sign shows your health weak spot.» The ancient tradition did not do that from the birth sign: melothesia worked with the Moon’s position at the moment of the procedure. And the sun sign as personal identity is an invention of the 20th-century popular press.',
    'zodiacBody.modern.consensus':
      '«It was consensus medicine and everybody believed it» is a simplification. There was internal criticism at the time, and current scholarship rejects both the story of universal belief and the story of sudden rejection by a single scientific event.',

    'zodiacBody.notVerified.intro':
      'Four things were looked for and not found. They are recorded as gaps: saying that nothing was found is more honest than filling in by deduction.',
    'zodiacBody.notVerified.law':
      '«Medieval Europe required by law that a physician check the Moon before acting on a patient.» It circulates with the date 1405 and appears even on the English Wikipedia, always without a primary source. No statute, ordinance or faculty regulation was located.',
    'zodiacBody.notVerified.hippocrates':
      '«A physician without a knowledge of astrology has no right to call himself a physician», credited to Hippocrates. A spurious quotation: it is not in the Hippocratic Corpus, and zodiacal astrology was not even formed in 5th-century BC Greece.',
    'zodiacBody.notVerified.chauliac':
      'The passage in Guy de Chauliac’s Chirurgia Magna (1363) applying the iron rule. He is known to have written on the astrolabe, and the work does deal with bloodletting, but the astrological passage was not located.',
    'zodiacBody.notVerified.humourMap':
      'An ancient, closed formulation of the planet ↔ four humours map. It was not located in any ancient source.',
  },
};
Object.assign(PT, ZODIAC_BODY_I18N.pt);
Object.assign(ES, ZODIAC_BODY_I18N.es);
Object.assign(EN, ZODIAC_BODY_I18N.en);

// ---- Homem Zodiacal: a linha de segurança do cartão da Lua de hoje ----
//
// Bloco separado porque entrou depois, na revisão de risco sanitário, e porque
// acrescentar chave é a única escrita permitida neste arquivo enquanto outros
// times mexem nele.
//
// O QUE ELA SUBSTITUI. O cartão "A Lua hoje" mostra astronomia real: onde a Lua
// está agora e que região do corpo a lista de Manílio nomeava ali. Embaixo dele
// havia zodiacBody.moon.practice, explicando que quem seguia o aforismo 20
// deixava aquela região fora da sangria naqueles dois dias e meio. A frase
// estava no passado e com fonte — e mesmo assim o conjunto entregava a conta
// pronta para HOJE, que é momento bom/ruim para procedimento. Foi cortada do
// cartão; a regra continua na seção de história, onde não vem grudada no dia de
// hoje nem no corpo de quem lê. zodiacBody.moon.practice segue aqui, aposentada
// e não renderizada — test/zodiacBody.test.js quebra o build se ela voltar.
//
// Esta chave é a única do bloco que PODE nomear consulta, exame, cirurgia e
// tratamento: ela existe para negá-los, como o aviso do topo da tela. Está na
// lista ISENTAS de test/zodiacBody.test.js por esse motivo.
const ZODIAC_BODY_SAFETY = {
  pt: {
    'zodiacBody.moon.notACalendar':
      'Esta posição é astronomia e nada mais: onde a Lua está agora e o que a lista antiga nomeava ali. Não é calendário de coisa nenhuma — nenhuma linha desta tela é motivo para marcar, adiar ou evitar consulta, exame, cirurgia ou tratamento. Isso se decide com um profissional de saúde.',
  },
  es: {
    'zodiacBody.moon.notACalendar':
      'Esta posición es astronomía y nada más: dónde está la Luna ahora y qué nombraba ahí la lista antigua. No es calendario de nada: ninguna línea de esta pantalla es motivo para agendar, posponer o evitar una consulta, un examen, una cirugía o un tratamiento. Eso se decide con un profesional de la salud.',
  },
  en: {
    'zodiacBody.moon.notACalendar':
      'This position is astronomy and nothing else: where the Moon is right now and what the old list named there. It is not a calendar for anything — no line on this screen is a reason to book, postpone or avoid an appointment, a test, surgery or a treatment. That is decided with a health professional.',
  },
};
Object.assign(PT, ZODIAC_BODY_SAFETY.pt);
Object.assign(ES, ZODIAC_BODY_SAFETY.es);
Object.assign(EN, ZODIAC_BODY_SAFETY.en);

// ---- Som do céu: a data da "tradição" (components/CosmicSoundPlayer.js) ----
//
// Bloco separado porque entrou depois, na revisão de honestidade, e porque
// acrescentar chave é a única escrita permitida neste arquivo enquanto outros
// times mexem nele.
//
// POR QUE ESTA FRASE EXISTE. sound.assoc.396…852 dizem "a tradição associa
// esta frequência a…", que é atribuição honesta — mas "tradição" sem data faz
// o leitor completar com ANTIGA, e é isso mesmo que o mercado de frequências
// vende (a lenda da "escala Solfeggio ancestral" do canto gregoriano). A
// numeração é dos anos 1970, de Joseph Puleo, por leitura numerológica; nunca
// foi notação medieval. Calar a data seria deixar o mito trabalhar a favor do
// app — omissão que vende é publicidade enganosa igual.
//
// Só aparece nos presets de Solfeggio. 432 Hz é outra história (proposta de
// afinação de concerto) e já se declara como tal em sound.assoc.432.
const SOM_DO_CEU_ORIGEM = {
  pt: {
    'sound.assoc.origin':
      'Essa numeração foi proposta nos anos 1970 — não é notação medieval nem tradição antiga.',
  },
  es: {
    'sound.assoc.origin':
      'Esa numeración fue propuesta en los años 1970 — no es notación medieval ni una tradición antigua.',
  },
  en: {
    'sound.assoc.origin':
      'This numbering was proposed in the 1970s — it is not medieval notation or an ancient tradition.',
  },
};
Object.assign(PT, SOM_DO_CEU_ORIGEM.pt);
Object.assign(ES, SOM_DO_CEU_ORIGEM.es);
Object.assign(EN, SOM_DO_CEU_ORIGEM.en);

// ---- Assentar / o ritual de respiração (screens/GroundingScreen.js) ----
//
// Bloco único no fim do arquivo, mesmo padrão de zodiacBody.*/sound.*/offer.*
// acima: outros times acrescentam chaves nas seções de cima ao mesmo tempo, e
// um bloco só evita conflito.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — vale para os TRÊS idiomas
// ===========================================================================
// Respiração e presença são PRÁTICA, nunca tratamento. Nenhuma frase daqui
// pode prometer efeito sobre corpo ou mente — nada de curar, tratar, aliviar,
// reduzir ansiedade, melhorar o sono, baixar pressão, regular hormônio,
// fortalecer imunidade. Nada que possa fazer alguém adiar atendimento de
// saúde.
//
// O QUE PODE: descrever o que a pessoa vai FAZER (inspire, conte, solte) e o
// que a tradição associa, sempre com a fonte e sempre como tradição.
//
// A ARMADILHA DA TRADUÇÃO, e é por isso que este aviso está aqui: o texto
// certo é vizinho do errado, e a diferença mora na preposição de finalidade.
// "Inspire contando até quatro" descreve; "inspire para relaxar" promete.
// Traduzir NÃO é oportunidade de deixar a frase mais "vendável": se a versão
// em espanhol ou em inglês soar como benefício, ela está errada nas três.
// test/grounding.test.js varre estes valores nos três idiomas — vocabulário de
// promessa de saúde E vocabulário de earthing (elétron, radical livre, campo
// eletromagnético, descarga, polaridade) — e falha o build. É de propósito.
//
// AS DUAS EXCEÇÕES, desenhadas e não improvisadas:
//   1. grounding.notice.* e grounding.warning.conditions/.consult — o aviso de
//      contraindicação PRECISA nomear epilepsia, gravidez, ansiedade e mandar
//      procurar um profissional. Ele é o oposto do risco: transfere a decisão
//      para fora do app. Está na lista de isentas do teste por isso.
//   2. grounding.notFound.* — a seção que NOMEIA as alegações (inclusive o
//      earthing e seus elétrons) justamente para dizer que não se sustentam.
//      Se ela não pudesse escrever a palavra, não poderia desmenti-la.
//
// O que NÃO está traduzido, e não deve ser: o inglês verbatim de Ptolomeu
// (tradução Robbins, 1940) e a bibliografia — vivem em lib/grounding.js.
// Traduzir citação verbatim seria falsificá-la.
//
// As famílias grounding.pattern.*, .ruler.*, .element.*, .notFound.* e .phase.*
// são montadas em runtime pelos helpers de lib/grounding.js, então
// test/i18nKeysExist.test.js não as enxerga — quem confere que as três línguas
// têm todas elas é test/grounding.test.js.
// ===========================================================================
const GROUNDING_I18N = {
  pt: {
    'home.card.grounding.title': 'Assentar',
    'home.card.grounding.subtitle': 'Alguns minutos depois de ler',

    'grounding.title': 'Assentar',
    'grounding.subtitle': 'Alguns minutos com o que você acabou de ler',

    'grounding.notice.title': 'Isto é uma prática, não um tratamento',
    'grounding.notice.body':
      'Esta tela oferece respiração contada e alguns minutos de silêncio. Ela não promete nenhum efeito sobre o seu corpo nem sobre o que você sente, e não substitui atendimento de saúde. Se você tem uma dúvida sobre saúde, ela se responde com um profissional — não aqui.',
    'grounding.notice.footer':
      'Prática de atenção. Nada nesta tela avalia, mede ou prevê qualquer coisa sobre você, e nada aqui é motivo para adiar uma consulta. Dúvida sobre saúde se leva a um profissional de saúde.',

    'grounding.warning.title': 'Antes de começar',
    'grounding.warning.conditions':
      'Exercícios de respiração podem apresentar risco para pessoas com certas condições médicas ou neurológicas — entre elas epilepsia, questões cardiovasculares, ansiedade e TEPT — e para quem está grávida.',
    'grounding.warning.consult':
      'Converse com seu médico ou profissional de saúde para saber se respiração guiada serve para você.',
    'grounding.warning.stopAnytime':
      'Se em algum momento ficar desconfortável, volte a respirar do seu jeito normal. Isso não estraga nada, e dá para sair na hora que quiser.',
    'grounding.warning.retention':
      'O padrão escolhido pede que você segure o ar. Se preferir não segurar, escolha Tempos iguais: ele não tem pausa nenhuma.',

    'grounding.section.pattern': 'Como respirar',
    'grounding.section.duration': 'Por quanto tempo',
    'grounding.section.today': 'O que a tradição associa a hoje',
    'grounding.section.notFound': 'O que a pesquisa não achou',
    'grounding.section.sources': 'Fontes',

    'grounding.badge.retention': 'com pausa',
    'grounding.badge.noRetention': 'sem pausa',

    'grounding.duration.option': '{min} min',
    'grounding.duration.hint':
      'Três minutos já é uma sessão inteira. Os outros dois existem para quem quiser ficar mais.',

    'grounding.start': 'Começar',
    'grounding.stop': 'Encerrar',
    'grounding.again': 'De novo',
    'grounding.close': 'Fechar',
    'grounding.expand': 'abrir',
    'grounding.collapse': 'fechar',

    'grounding.running.remaining': 'Faltam {time}',
    'grounding.running.cycles': '{n} ciclos até aqui',

    'grounding.done.title': 'Pronto',
    'grounding.done.body':
      'Você ficou aqui os minutos que escolheu. Se quiser, volte e leia de novo o que recebeu — ou feche o app e siga o dia.',
    'grounding.done.noCount':
      'Não existe pontuação nem sequência própria deste ritual. O que acontece é o mesmo de uma leitura: o dia entra na sua sequência do app.',
    'grounding.stopped.title': 'Você parou',
    'grounding.stopped.body':
      'Parar no meio não é falhar — não há nada para completar aqui, e nada foi perdido. Volte quando quiser.',

    'grounding.today.ruler': 'Hoje é dia de {planet}.',
    'grounding.today.moon': 'A Lua está em {sign} — signo de {element}.',
    'grounding.today.week':
      'Cada dia da semana tem um dos sete planetas antigos por trás — é daí que vêm nomes como «lunes» e «Monday», dias da Lua. O costume está documentado desde a Antiguidade, com origem atribuída ao Egito, e a conta era esta: contando as horas do dia e da noite pela ordem dos astros, cada dia recebe o nome do que rege a sua primeira hora.',
    'grounding.today.unavailable':
      'A posição da Lua não pôde ser calculada agora, então o elemento do dia fica em branco. Nada é preenchido por dedução.',

    'grounding.terra.title': 'A terra, e as ressalvas que vêm junto',
    'grounding.terra.triplicity':
      'Touro, Virgem e Capricórnio formam o trio dos signos de terra — «triplicidade», no nome técnico. Em Ptolomeu, esse trio é atribuído ao domínio de Vênus, que rege de dia, e da Lua, que rege de noite; o capítulo o descreve como meridional (voltado ao sul) e registra uma mistura vinda do leste por meio de Saturno, porque Capricórnio é domicílio dele — o signo onde esse planeta está em casa.',
    'grounding.terra.divergence':
      'Nem os antigos concordavam sobre quem rege esse trio: os regentes de triplicidade divergem entre as autoridades antigas, e isso é conhecido. Doroteu de Sidon e Vétio Valente preservam um esquema mais antigo, de três regentes — diurno, noturno e participante —, em que a terra fica com Vênus, a Lua e Marte. Citar um regente sem dizer de quem é o esquema esconde essa divergência.',
    'grounding.terra.synthesis':
      'A frase inteira — «a terra é fria e seca, e estes são os signos de terra» — não existe em nenhuma das duas fontes: as qualidades são de Aristóteles, os signos são de Ptolomeu, e juntá-las é uma síntese nossa. Fica declarada como tal. Já a leitura de que signos de terra seriam «práticos» ou «aterrados» é contemporânea: não foi localizada fonte antiga que os descreva assim.',

    'grounding.notFound.intro':
      'Quatro coisas que se dizem por aí sobre respiração e sobre terra, e que não foram localizadas nas fontes. Ficam aqui em vez de sumirem — dizer que não se achou é mais honesto do que completar por dedução.',
    'grounding.notFound.upanishads':
      '«A respiração quadrada vem dos Upanishads, tem 2.500 anos.» Repetido em muitas páginas comerciais, sempre de forma genérica e sem passagem. Não foi localizada passagem primária que descreva a razão de quatro tempos iguais. O que se pode dizer com fonte é que a tradição do yoga tem uma família de respirações de tempos iguais, chamada sama vritti.',
    'grounding.notFound.terraPsicologia':
      '«Os signos de terra são práticos e aterrados.» Frio e seco, em Aristóteles, é física dos elementos — não psicologia. Não foi localizada fonte antiga que descreva os signos de terra por traços de temperamento; essa leitura é do mercado astrológico contemporâneo.',
    'grounding.notFound.quatroSeteOito':
      '«O 4-7-8 é melhor do que respirar devagar de qualquer outro jeito.» Não foi localizada base para essa comparação: os poucos ensaios existentes são em populações estreitas, e as revisões descrevem a literatura como limitada e dispersa.',
    'grounding.notFound.earthing':
      '«Pisar descalço na terra transfere elétrons que neutralizam radicais livres e baixam o hormônio do estresse.» Isso é earthing, e é outra coisa. Revisões céticas convergentes apontam ausência de evidência e mecanismos que conflitam com a física e a biologia estabelecidas. A palavra, aliás, foi tomada emprestada da engenharia elétrica, onde aterramento é proteção contra choque. Nada nesta tela usa esse sentido, nem como imagem.',

    'grounding.sound.title': 'Som, se você quiser',
    'grounding.sound.hint':
      'O Som do céu pode ficar tocando junto. É opcional, nunca começa sozinho, e o controle fica na sua mão o tempo todo.',

    'grounding.invite.title': 'Antes de sair',
    'grounding.invite.body':
      'Você acabou de ler alguma coisa. Se quiser, fique alguns minutos com isso: respiração contada e silêncio, sem pressa.',
    'grounding.invite.note': 'Sem pontos, sem contagem, sem nada para completar. Dá para sair no meio.',
    'grounding.invite.cta': 'Ficar alguns minutos',
    'grounding.invite.dismiss': 'Agora não',

    'grounding.phase.inspira': 'Inspire',
    'grounding.phase.seguraCheio': 'Segure',
    'grounding.phase.expira': 'Solte',
    'grounding.phase.seguraVazio': 'Pausa',

    'grounding.pattern.igual.name': 'Tempos iguais',
    'grounding.pattern.igual.rhythm':
      'Inspire contando até quatro. Solte contando até quatro. Sem pausa entre um e outro.',
    'grounding.pattern.igual.about':
      'A tradição do yoga chama de pranayama a regulação do fluxo do ar, e os Yoga Sutras a descrevem em três momentos: entrada, saída e retenção, medidos em duração e lugar. Este padrão usa só os dois primeiros. A família de respirações de tempos iguais tem nome próprio na tradição: sama vritti.',
    'grounding.pattern.igual.caution':
      'É o que abre selecionado, e é o único sem retenção — a parte da prática onde o risco se concentra. Ele não pede que você segure o ar em momento nenhum.',

    'grounding.pattern.quadrado.name': 'Quadrada',
    'grounding.pattern.quadrado.rhythm':
      'Inspire até quatro, segure até quatro, solte até quatro, fique até quatro com os pulmões vazios.',
    'grounding.pattern.quadrado.about':
      'Quatro fases de quatro tempos, daí o nome. Na tradição do yoga corresponde a uma respiração de tempos iguais (sama vritti) com acréscimo de retenção. O nome em inglês e a popularização atual são recentes: vêm de 2012, com Mark Divine, comandante aposentado dos Navy SEALs, que a descreveu como ferramenta de clareza sob pressão.',
    'grounding.pattern.quadrado.caution':
      'Tem retenção, mas curta e do mesmo tamanho das outras fases. Se segurar o ar não for para você, o padrão de tempos iguais percorre o mesmo caminho sem nenhuma pausa.',

    'grounding.pattern.quatroSeteOito.name': '4-7-8',
    'grounding.pattern.quatroSeteOito.rhythm':
      'Inspire contando até quatro, segure contando até sete, solte contando até oito.',
    'grounding.pattern.quatroSeteOito.about':
      'O padrão foi divulgado em 2015 pelo médico Andrew Weil, que o apresenta como adaptação moderna do pranayama. Ficam aqui o padrão e a data; as afirmações que ele faz sobre o que a técnica provoca não são reproduzidas — repetir uma promessa, mesmo entre aspas, é colocar a promessa na tela.',
    'grounding.pattern.quatroSeteOito.caution':
      'É o padrão com a retenção mais longa dos três: sete tempos de ar preso. Por isso ele é o último da lista e nunca vem escolhido de saída. Se alguma das condições do aviso acima é o seu caso, é este que mais pede uma conversa antes.',

    'grounding.ruler.sol.name': 'Sol',
    'grounding.ruler.sol.quality': 'A tradição atribui ao Sol aquecer e, em certo grau, secar.',
    'grounding.ruler.lua.name': 'Lua',
    'grounding.ruler.lua.quality':
      'A tradição atribui à Lua umedecer, por estar próxima da terra e por causa das exalações úmidas que dela vêm; e partilhar moderadamente do poder de aquecer, pela luz que recebe do Sol.',
    'grounding.ruler.marte.name': 'Marte',
    'grounding.ruler.marte.quality':
      'A tradição atribui a Marte secar e queimar, e justifica isso pela cor de fogo do planeta e pela proximidade com o Sol.',
    'grounding.ruler.mercurio.name': 'Mercúrio',
    'grounding.ruler.mercurio.quality':
      'A tradição não atribui a Mercúrio uma qualidade fixa: ora secando, ora umedecendo, alternando depressa — «como que inspirado pela velocidade do seu movimento». É o único dos sete assim.',
    'grounding.ruler.jupiter.name': 'Júpiter',
    'grounding.ruler.jupiter.quality':
      'A tradição atribui a Júpiter uma força temperada, entre o poder que resfria de Saturno e o ardente de Marte: aquece e umedece ao mesmo tempo.',
    'grounding.ruler.venus.name': 'Vênus',
    'grounding.ruler.venus.quality':
      'A tradição atribui a Vênus a mesma natureza temperada de Júpiter, mas ao contrário: aquece pouco e umedece muito.',
    'grounding.ruler.venus.bridge':
      'É também Vênus quem rege de dia a triplicidade de terra em Ptolomeu. Sexta-feira é o dia em que o regente da semana e o elemento desta tela se encontram na mesma fonte.',
    'grounding.ruler.saturno.name': 'Saturno',
    'grounding.ruler.saturno.quality':
      'A tradição atribui a Saturno resfriar e secar, provavelmente por ser o mais distante do calor do Sol e das exalações úmidas em torno da terra.',
    'grounding.ruler.saturno.bridge':
      'Resfriar e secar são as mesmas duas qualidades que Aristóteles dá ao elemento terra. Pela própria fonte, sábado é o dia mais de terra da semana — e o texto que você lê aqui não muda por isso; só a coincidência fica registrada.',

    'grounding.element.fogo.name': 'fogo',
    'grounding.element.fogo.qualities': 'A doutrina clássica atribui ao fogo o quente e o seco.',
    'grounding.element.ar.name': 'ar',
    'grounding.element.ar.qualities': 'A doutrina clássica atribui ao ar o quente e o úmido.',
    'grounding.element.agua.name': 'água',
    'grounding.element.agua.qualities': 'A doutrina clássica atribui à água o frio e o úmido.',
    'grounding.element.terra.name': 'terra',
    'grounding.element.terra.qualities':
      'A doutrina clássica atribui à terra o frio e o seco — e registra que a terra se caracteriza mais pelo seco do que pelo frio, ainda que tenha os dois.',
  },
  es: {
    'home.card.grounding.title': 'Asentar',
    'home.card.grounding.subtitle': 'Unos minutos después de leer',

    'grounding.title': 'Asentar',
    'grounding.subtitle': 'Unos minutos con lo que acabas de leer',

    'grounding.notice.title': 'Esto es una práctica, no un tratamiento',
    'grounding.notice.body':
      'Esta pantalla ofrece respiración contada y unos minutos de silencio. No promete ningún efecto sobre tu cuerpo ni sobre lo que sientes, y no sustituye la atención de salud. Si tienes una duda de salud, se responde con un profesional — no aquí.',
    'grounding.notice.footer':
      'Práctica de atención. Nada en esta pantalla evalúa, mide ni predice nada sobre ti, y nada aquí es motivo para posponer una consulta. Una duda de salud se lleva a un profesional de la salud.',

    'grounding.warning.title': 'Antes de empezar',
    'grounding.warning.conditions':
      'Los ejercicios de respiración pueden presentar riesgo para personas con ciertas condiciones médicas o neurológicas — entre ellas epilepsia, problemas cardiovasculares, ansiedad y TEPT — y para quien está embarazada.',
    'grounding.warning.consult':
      'Habla con tu médico o profesional de la salud para saber si la respiración guiada es adecuada para ti.',
    'grounding.warning.stopAnytime':
      'Si en algún momento te resulta incómodo, vuelve a respirar como respiras siempre. No se estropea nada y puedes salir cuando quieras.',
    'grounding.warning.retention':
      'El patrón elegido pide que retengas el aire. Si prefieres no retener, elige Tiempos iguales: no tiene ninguna pausa.',

    'grounding.section.pattern': 'Cómo respirar',
    'grounding.section.duration': 'Cuánto tiempo',
    'grounding.section.today': 'Lo que la tradición asocia a hoy',
    'grounding.section.notFound': 'Lo que la investigación no encontró',
    'grounding.section.sources': 'Fuentes',

    'grounding.badge.retention': 'con pausa',
    'grounding.badge.noRetention': 'sin pausa',

    'grounding.duration.option': '{min} min',
    'grounding.duration.hint':
      'Tres minutos ya son una sesión entera. Los otros dos existen para quien quiera quedarse más.',

    'grounding.start': 'Empezar',
    'grounding.stop': 'Terminar',
    'grounding.again': 'Otra vez',
    'grounding.close': 'Cerrar',
    'grounding.expand': 'abrir',
    'grounding.collapse': 'cerrar',

    'grounding.running.remaining': 'Faltan {time}',
    'grounding.running.cycles': '{n} ciclos hasta aquí',

    'grounding.done.title': 'Listo',
    'grounding.done.body':
      'Te quedaste los minutos que elegiste. Si quieres, vuelve y lee otra vez lo que recibiste — o cierra la app y sigue con tu día.',
    'grounding.done.noCount':
      'No hay puntuación ni una racha propia de este ritual. Pasa lo mismo que con una lectura: el día entra en tu racha de la app.',
    'grounding.stopped.title': 'Paraste',
    'grounding.stopped.body':
      'Parar a la mitad no es fallar — aquí no hay nada que completar y no se perdió nada. Vuelve cuando quieras.',

    'grounding.today.ruler': 'Hoy es día de {planet}.',
    'grounding.today.moon': 'La Luna está en {sign} — signo de {element}.',
    'grounding.today.week':
      'Cada día de la semana tiene detrás uno de los siete planetas antiguos — de ahí vienen nombres como «lunes», el día de la Luna. La costumbre está documentada desde la Antigüedad, con origen atribuido a Egipto, y la cuenta era esta: contando las horas del día y de la noche por el orden de los astros, cada día recibe el nombre del que rige su primera hora.',
    'grounding.today.unavailable':
      'La posición de la Luna no se pudo calcular ahora, así que el elemento del día queda en blanco. Nada se completa por deducción.',

    'grounding.terra.title': 'La tierra, y las salvedades que vienen con ella',
    'grounding.terra.triplicity':
      'Tauro, Virgo y Capricornio forman el trío de los signos de tierra — «triplicidad», en el nombre técnico. En Ptolomeo ese trío se atribuye al dominio de Venus, que rige de día, y de la Luna, que rige de noche; el capítulo lo describe como meridional (mirando al sur) y registra una mezcla venida del este por medio de Saturno, porque Capricornio es su domicilio — el signo donde ese planeta está en casa.',
    'grounding.terra.divergence':
      'Ni los antiguos se ponían de acuerdo sobre quién rige ese trío: los regentes de triplicidad divergen entre las autoridades antiguas, y eso se sabe. Doroteo de Sidón y Vetio Valente conservan un esquema más antiguo, de tres regentes — diurno, nocturno y participante —, en el que la tierra queda con Venus, la Luna y Marte. Citar un regente sin decir de quién es el esquema esconde esa divergencia.',
    'grounding.terra.synthesis':
      'La frase entera — «la tierra es fría y seca, y estos son los signos de tierra» — no existe en ninguna de las dos fuentes: las cualidades son de Aristóteles, los signos son de Ptolomeo, y juntarlas es una síntesis nuestra. Queda declarada como tal. Y la lectura de que los signos de tierra serían «prácticos» o «asentados» es contemporánea: no se localizó fuente antigua que los describa así.',

    'grounding.notFound.intro':
      'Cuatro cosas que se dicen por ahí sobre la respiración y sobre la tierra, y que no se localizaron en las fuentes. Quedan aquí en vez de desaparecer — decir que no se encontró es más honesto que completar por deducción.',
    'grounding.notFound.upanishads':
      '«La respiración cuadrada viene de los Upanishads, tiene 2.500 años.» Se repite en muchas páginas comerciales, siempre de forma genérica y sin pasaje. No se localizó un pasaje primario que describa la razón de cuatro tiempos iguales. Lo que sí se puede decir con fuente es que la tradición del yoga tiene una familia de respiraciones de tiempos iguales, llamada sama vritti.',
    'grounding.notFound.terraPsicologia':
      '«Los signos de tierra son prácticos y están asentados.» Frío y seco, en Aristóteles, es física de los elementos — no psicología. No se localizó fuente antigua que describa los signos de tierra por rasgos de temperamento; esa lectura es del mercado astrológico contemporáneo.',
    'grounding.notFound.quatroSeteOito':
      '«El 4-7-8 es mejor que respirar despacio de cualquier otra manera.» No se localizó base para esa comparación: los pocos ensayos existentes son en poblaciones estrechas, y las revisiones describen la literatura como limitada y dispersa.',
    'grounding.notFound.earthing':
      '«Pisar descalzo la tierra transfiere electrones que neutralizan radicales libres y bajan la hormona del estrés.» Eso es earthing, y es otra cosa. Revisiones escépticas convergentes señalan ausencia de evidencia y mecanismos que chocan con la física y la biología establecidas. La palabra, además, se tomó prestada de la ingeniería eléctrica, donde la puesta a tierra es protección contra descargas. Nada en esta pantalla usa ese sentido, ni como imagen.',

    'grounding.sound.title': 'Sonido, si quieres',
    'grounding.sound.hint':
      'El Sonido del cielo puede sonar de fondo. Es opcional, nunca empieza solo y el control queda en tu mano todo el tiempo.',

    'grounding.invite.title': 'Antes de salir',
    'grounding.invite.body':
      'Acabas de leer algo. Si quieres, quédate unos minutos con eso: respiración contada y silencio, sin prisa.',
    'grounding.invite.note': 'Sin puntos, sin conteo, sin nada que completar. Puedes salir a la mitad.',
    'grounding.invite.cta': 'Quedarme unos minutos',
    'grounding.invite.dismiss': 'Ahora no',

    'grounding.phase.inspira': 'Inspira',
    'grounding.phase.seguraCheio': 'Sostén',
    'grounding.phase.expira': 'Suelta',
    'grounding.phase.seguraVazio': 'Pausa',

    'grounding.pattern.igual.name': 'Tiempos iguales',
    'grounding.pattern.igual.rhythm':
      'Inspira contando hasta cuatro. Suelta contando hasta cuatro. Sin pausa entre uno y otro.',
    'grounding.pattern.igual.about':
      'La tradición del yoga llama pranayama a la regulación del flujo del aire, y los Yoga Sutras la describen en tres momentos: entrada, salida y retención, medidos en duración y lugar. Este patrón usa solo los dos primeros. La familia de respiraciones de tiempos iguales tiene nombre propio en la tradición: sama vritti.',
    'grounding.pattern.igual.caution':
      'Es el que aparece seleccionado, y es el único sin retención — la parte de la práctica donde se concentra el riesgo. No pide que retengas el aire en ningún momento.',

    'grounding.pattern.quadrado.name': 'Cuadrada',
    'grounding.pattern.quadrado.rhythm':
      'Inspira hasta cuatro, sostén hasta cuatro, suelta hasta cuatro, quédate hasta cuatro con los pulmones vacíos.',
    'grounding.pattern.quadrado.about':
      'Cuatro fases de cuatro tiempos, de ahí el nombre. En la tradición del yoga corresponde a una respiración de tiempos iguales (sama vritti) con retención añadida. El nombre en inglés y la popularización actual son recientes: vienen de 2012, con Mark Divine, comandante retirado de los Navy SEALs, que la describió como herramienta de claridad bajo presión.',
    'grounding.pattern.quadrado.caution':
      'Tiene retención, pero corta y del mismo tamaño que las demás fases. Si retener el aire no es para ti, el patrón de tiempos iguales recorre el mismo camino sin ninguna pausa.',

    'grounding.pattern.quatroSeteOito.name': '4-7-8',
    'grounding.pattern.quatroSeteOito.rhythm':
      'Inspira contando hasta cuatro, sostén contando hasta siete, suelta contando hasta ocho.',
    'grounding.pattern.quatroSeteOito.about':
      'El patrón fue divulgado en 2015 por el médico Andrew Weil, que lo presenta como adaptación moderna del pranayama. Quedan aquí el patrón y la fecha; las afirmaciones que él hace sobre lo que la técnica provoca no se reproducen — repetir una promesa, aunque sea entre comillas, es poner la promesa en la pantalla.',
    'grounding.pattern.quatroSeteOito.caution':
      'Es el patrón con la retención más larga de los tres: siete tiempos de aire retenido. Por eso es el último de la lista y nunca viene elegido de entrada. Si alguna de las condiciones del aviso de arriba es tu caso, este es el que más pide una conversación antes.',

    'grounding.ruler.sol.name': 'Sol',
    'grounding.ruler.sol.quality': 'La tradición atribuye al Sol calentar y, en cierto grado, secar.',
    'grounding.ruler.lua.name': 'Luna',
    'grounding.ruler.lua.quality':
      'La tradición atribuye a la Luna humedecer, por estar cerca de la tierra y por las exhalaciones húmedas que vienen de ella; y compartir moderadamente el poder de calentar, por la luz que recibe del Sol.',
    'grounding.ruler.marte.name': 'Marte',
    'grounding.ruler.marte.quality':
      'La tradición atribuye a Marte secar y quemar, y lo justifica por el color de fuego del planeta y por su cercanía al Sol.',
    'grounding.ruler.mercurio.name': 'Mercurio',
    'grounding.ruler.mercurio.quality':
      'La tradición no atribuye a Mercurio una cualidad fija: unas veces secando, otras humedeciendo, alternando deprisa — «como inspirado por la velocidad de su movimiento». Es el único de los siete así.',
    'grounding.ruler.jupiter.name': 'Júpiter',
    'grounding.ruler.jupiter.quality':
      'La tradición atribuye a Júpiter una fuerza templada, entre el poder que enfría de Saturno y el ardiente de Marte: calienta y humedece a la vez.',
    'grounding.ruler.venus.name': 'Venus',
    'grounding.ruler.venus.quality':
      'La tradición atribuye a Venus la misma naturaleza templada de Júpiter, pero al revés: calienta poco y humedece mucho.',
    'grounding.ruler.venus.bridge':
      'Es también Venus quien rige de día la triplicidad de tierra en Ptolomeo. El viernes es el día en que el regente de la semana y el elemento de esta pantalla se encuentran en la misma fuente.',
    'grounding.ruler.saturno.name': 'Saturno',
    'grounding.ruler.saturno.quality':
      'La tradición atribuye a Saturno enfriar y secar, probablemente por ser el más alejado del calor del Sol y de las exhalaciones húmedas alrededor de la tierra.',
    'grounding.ruler.saturno.bridge':
      'Enfriar y secar son las mismas dos cualidades que Aristóteles da al elemento tierra. Por la propia fuente, el sábado es el día más de tierra de la semana — y el texto que lees aquí no cambia por eso; solo queda registrada la coincidencia.',

    'grounding.element.fogo.name': 'fuego',
    'grounding.element.fogo.qualities': 'La doctrina clásica atribuye al fuego lo caliente y lo seco.',
    'grounding.element.ar.name': 'aire',
    'grounding.element.ar.qualities': 'La doctrina clásica atribuye al aire lo caliente y lo húmedo.',
    'grounding.element.agua.name': 'agua',
    'grounding.element.agua.qualities': 'La doctrina clásica atribuye al agua lo frío y lo húmedo.',
    'grounding.element.terra.name': 'tierra',
    'grounding.element.terra.qualities':
      'La doctrina clásica atribuye a la tierra lo frío y lo seco — y registra que la tierra se caracteriza más por lo seco que por lo frío, aunque tenga ambos.',
  },
  en: {
    'home.card.grounding.title': 'Settle',
    'home.card.grounding.subtitle': 'A few minutes after a reading',

    'grounding.title': 'Settle',
    'grounding.subtitle': 'A few minutes with what you just read',

    'grounding.notice.title': 'This is a practice, not a treatment',
    'grounding.notice.body':
      'This screen offers counted breathing and a few minutes of quiet. It promises no effect on your body or on how you feel, and it does not replace medical care. If you have a health question, it gets answered by a professional — not here.',
    'grounding.notice.footer':
      'A practice of attention. Nothing on this screen assesses, measures or predicts anything about you, and nothing here is a reason to postpone an appointment. A health question goes to a health professional.',

    'grounding.warning.title': 'Before you start',
    'grounding.warning.conditions':
      'Breathing exercises may present a risk of harm for people with certain medical and/or neurological conditions — including epilepsy, cardiovascular issues, anxiety and PTSD — or people who are pregnant.',
    'grounding.warning.consult':
      'Please consult your doctor or medical provider to ensure guided breathing is suitable for you.',
    'grounding.warning.stopAnytime':
      'If at any point it feels uncomfortable, go back to breathing your usual way. Nothing is spoiled, and you can leave whenever you want.',
    'grounding.warning.retention':
      'The pattern you picked asks you to hold your breath. If you would rather not hold it, choose Equal counts: it has no pause at all.',

    'grounding.section.pattern': 'How to breathe',
    'grounding.section.duration': 'For how long',
    'grounding.section.today': 'What tradition associates with today',
    'grounding.section.notFound': 'What the research did not find',
    'grounding.section.sources': 'Sources',

    'grounding.badge.retention': 'with a hold',
    'grounding.badge.noRetention': 'no hold',

    'grounding.duration.option': '{min} min',
    'grounding.duration.hint':
      'Three minutes is already a whole session. The other two are there for anyone who wants to stay longer.',

    'grounding.start': 'Start',
    'grounding.stop': 'End',
    'grounding.again': 'Again',
    'grounding.close': 'Close',
    'grounding.expand': 'open',
    'grounding.collapse': 'close',

    'grounding.running.remaining': '{time} left',
    'grounding.running.cycles': '{n} cycles so far',

    'grounding.done.title': 'Done',
    'grounding.done.body':
      'You stayed for the minutes you chose. If you want, go back and read again what you got — or close the app and get on with your day.',
    'grounding.done.noCount':
      'There is no score here and no streak of its own. What happens is the same as with a reading: the day counts towards your app streak.',
    'grounding.stopped.title': 'You stopped',
    'grounding.stopped.body':
      'Stopping halfway is not failing — there is nothing to complete here and nothing was lost. Come back whenever you like.',

    'grounding.today.ruler': 'Today is a day of {planet}.',
    'grounding.today.moon': 'The Moon is in {sign} — a sign of {element}.',
    'grounding.today.week':
      'Every day of the week has one of the seven ancient planets behind it — that is where names like «Monday», the Moon’s day, come from. The custom is documented from antiquity, credited to Egypt, and the arithmetic ran like this: counting the hours of day and night in the order of the planets, each day takes the name of the one ruling its first hour.',
    'grounding.today.unavailable':
      'The position of the Moon could not be calculated right now, so the element of the day is left blank. Nothing is filled in by guesswork.',

    'grounding.terra.title': 'Earth, and the caveats that come with it',
    'grounding.terra.triplicity':
      'Taurus, Virgo and Capricorn make up the trio of earth signs — «triplicity», in the technical name. In Ptolemy that trio is assigned to the dominion of Venus, ruling by day, and the Moon, ruling by night; the chapter describes it as southern (facing south) and records a mixture from the east through Saturn, because Capricorn is his house — the sign where that planet is at home.',
    'grounding.terra.divergence':
      'Not even the ancients agreed on who rules that trio: the rulers of the triplicities differ between the ancient authorities, and this is well known. Dorotheus of Sidon and Vettius Valens preserve an older scheme of three rulers — diurnal, nocturnal and participating — in which earth gets Venus, the Moon and Mars. Quoting a ruler without saying whose scheme it is hides that disagreement.',
    'grounding.terra.synthesis':
      'The whole sentence — «earth is cold and dry, and these are the signs of earth» — exists in neither source: the qualities are Aristotle, the signs are Ptolemy, and joining them is our own synthesis. It is declared as such. As for reading earth signs as «practical» or «grounded», that is contemporary: no ancient source describing them that way was located.',

    'grounding.notFound.intro':
      'Four things people say about breathing and about earth that were not located in the sources. They stay here instead of disappearing — saying that nothing was found is more honest than filling the gap by deduction.',
    'grounding.notFound.upanishads':
      '«Box breathing comes from the Upanishads, it is 2,500 years old.» Repeated on many commercial pages, always in general terms and with no passage cited. No primary passage describing the four equal counts was located. What can be said with a source is that the yoga tradition has a family of equal-count breaths, called sama vritti.',
    'grounding.notFound.terraPsicologia':
      '«Earth signs are practical and grounded.» Cold and dry, in Aristotle, is the physics of the elements — not psychology. No ancient source describing earth signs by traits of temperament was located; that reading belongs to the contemporary astrology market.',
    'grounding.notFound.quatroSeteOito':
      '«4-7-8 works better than breathing slowly in any other way.» No basis for that comparison was located: the few existing trials are in narrow populations, and reviews describe the literature as limited and scattered.',
    'grounding.notFound.earthing':
      '«Walking barefoot on the ground transfers electrons that neutralise free radicals and lower the stress hormone.» That is earthing, and it is a different thing. Converging sceptical reviews point to an absence of evidence and to mechanisms that conflict with established physics and biology. The word itself was borrowed from electrical engineering, where earthing is protection against shock. Nothing on this screen uses that meaning, not even as an image.',

    'grounding.sound.title': 'Sound, if you want it',
    'grounding.sound.hint':
      'Sky Sound can play alongside. It is optional, it never starts by itself, and the control stays in your hands the whole time.',

    'grounding.invite.title': 'Before you go',
    'grounding.invite.body':
      'You have just read something. If you want, stay a few minutes with it: counted breathing and quiet, no rush.',
    'grounding.invite.note': 'No points, no count, nothing to complete. You can leave halfway.',
    'grounding.invite.cta': 'Stay a few minutes',
    'grounding.invite.dismiss': 'Not now',

    'grounding.phase.inspira': 'Breathe in',
    'grounding.phase.seguraCheio': 'Hold',
    'grounding.phase.expira': 'Breathe out',
    'grounding.phase.seguraVazio': 'Pause',

    'grounding.pattern.igual.name': 'Equal counts',
    'grounding.pattern.igual.rhythm':
      'Breathe in counting to four. Breathe out counting to four. No pause in between.',
    'grounding.pattern.igual.about':
      'The yoga tradition calls the regulation of the flow of air pranayama, and the Yoga Sutras describe it in three movements: in, out and retention, measured by duration and place. This pattern uses only the first two. The family of equal-count breaths has its own name in the tradition: sama vritti.',
    'grounding.pattern.igual.caution':
      'It is the one selected when the screen opens, and the only one with no retention — the part of the practice where the risk is concentrated. It never asks you to hold your breath.',

    'grounding.pattern.quadrado.name': 'Box',
    'grounding.pattern.quadrado.rhythm':
      'Breathe in to four, hold to four, breathe out to four, stay to four with empty lungs.',
    'grounding.pattern.quadrado.about':
      'Four phases of four counts, hence the name. In the yoga tradition it corresponds to an equal-count breath (sama vritti) with retention added. The English name and the current popularity are recent: they come from 2012, with Mark Divine, a retired Navy SEAL commander, who described it as a tool for clarity under pressure.',
    'grounding.pattern.quadrado.caution':
      'It has retention, but short and the same length as the other phases. If holding your breath is not for you, the equal-count pattern covers the same ground with no pause at all.',

    'grounding.pattern.quatroSeteOito.name': '4-7-8',
    'grounding.pattern.quatroSeteOito.rhythm':
      'Breathe in counting to four, hold counting to seven, breathe out counting to eight.',
    'grounding.pattern.quatroSeteOito.about':
      'The pattern was made public in 2015 by the physician Andrew Weil, who presents it as a modern adaptation of pranayama. What stays here is the pattern and the date; the claims he makes about what the technique does are not reproduced — repeating a promise, even in quotation marks, puts the promise on the screen.',
    'grounding.pattern.quatroSeteOito.caution':
      'It has the longest retention of the three: seven counts of held breath. That is why it is last on the list and never comes pre-selected. If any of the conditions in the notice above is your case, this is the one that most calls for a conversation first.',

    'grounding.ruler.sol.name': 'Sun',
    'grounding.ruler.sol.quality': 'Tradition attributes to the Sun heating and, to a certain degree, drying.',
    'grounding.ruler.lua.name': 'Moon',
    'grounding.ruler.lua.quality':
      'Tradition attributes to the Moon humidifying, because it is close to the earth and because of the moist exhalations that come from it; and sharing moderately in the power of heating, through the light it receives from the Sun.',
    'grounding.ruler.marte.name': 'Mars',
    'grounding.ruler.marte.quality':
      'Tradition attributes to Mars drying and burning, and justifies it by the fiery colour of the planet and by its nearness to the Sun.',
    'grounding.ruler.mercurio.name': 'Mercury',
    'grounding.ruler.mercurio.quality':
      'Tradition attributes no fixed quality to Mercury: at times drying, at times humidifying, alternating quickly — «inspired as it were by the speed of his motion». It is the only one of the seven like that.',
    'grounding.ruler.jupiter.name': 'Jupiter',
    'grounding.ruler.jupiter.quality':
      'Tradition attributes to Jupiter a temperate force, between the cooling power of Saturn and the burning one of Mars: it both heats and humidifies.',
    'grounding.ruler.venus.name': 'Venus',
    'grounding.ruler.venus.quality':
      'Tradition attributes to Venus the same temperate nature as Jupiter, but the other way round: it warms moderately and chiefly humidifies.',
    'grounding.ruler.venus.bridge':
      'Venus is also the day ruler of the earth triplicity in Ptolemy. Friday is the day when the ruler of the week and the element of this screen meet in the same source.',
    'grounding.ruler.saturno.name': 'Saturn',
    'grounding.ruler.saturno.quality':
      'Tradition attributes to Saturn cooling and drying, probably because it is furthest removed from the heat of the Sun and from the moist exhalations about the earth.',
    'grounding.ruler.saturno.bridge':
      'Cooling and drying are the same two qualities Aristotle gives to the element earth. By that source alone, Saturday is the most earthy day of the week — and the text you read here does not change because of it; only the coincidence is recorded.',

    'grounding.element.fogo.name': 'fire',
    'grounding.element.fogo.qualities': 'Classical doctrine attributes to fire the hot and the dry.',
    'grounding.element.ar.name': 'air',
    'grounding.element.ar.qualities': 'Classical doctrine attributes to air the hot and the moist.',
    'grounding.element.agua.name': 'water',
    'grounding.element.agua.qualities': 'Classical doctrine attributes to water the cold and the moist.',
    'grounding.element.terra.name': 'earth',
    'grounding.element.terra.qualities':
      'Classical doctrine attributes to earth the cold and the dry — and records that earth is characterised more by the dry than by the cold, although it has both.',
  },
};
Object.assign(PT, GROUNDING_I18N.pt);
Object.assign(ES, GROUNDING_I18N.es);
Object.assign(EN, GROUNDING_I18N.en);

// ---------------------------------------------------------------------------
// HORÓSCOPO — O CÉU CALCULADO (`horoscope.sky.*`), acrescentado em 31/07/2026
// ---------------------------------------------------------------------------
// Mesmo padrão de GROUNDING_I18N acima: bloco próprio + Object.assign, pra uma
// família grande não se perder no meio de mil chaves de UI.
//
// Estas chaves substituem, na tela de Horóscopo, o conteúdo de
// `horoscope.reading.*` (8 textos sorteados por hash), `horoscope.area.*`
// (as barras de nota) e `horoscope.luck.*` (cor/número/hora da sorte). As
// antigas continuam definidas e não são mais usadas — remover chave é assunto
// de outra passada, e chave morta não quebra ninguém.
//
// TRÊS REGRAS QUE VALEM PARA CADA STRING DESTE BLOCO, e lib/dailyHoroscope.js
// explica o porquê de cada uma no cabeçalho:
//
// 1. Nenhuma frase aqui AFIRMA posição de planeta. As posições entram por
//    interpolação ({signoPlaneta}, {signoLua}, {graus}), e quem as calcula é a
//    efeméride. Se alguém escrever "a Lua minguante favorece..." direto numa
//    destas strings, volta o defeito que este bloco veio consertar — era
//    exatamente o caso de `horoscope.reading.ontem.1`.
//
// 2. Toda afirmação de tradição carrega o locus dentro da própria frase
//    (Tetrabiblos I.13, Naturalis Historia XVIII.321, Anthologiae I.2…), e o
//    que é acréscimo moderno é nomeado como moderno, com autor e ano.
//
// 3. Nada de nota, porcentagem ou promessa de resultado — a mesma regra do
//    prompt da persona do assistente no servidor. E nada de saúde, corpo, sono
//    ou humor, nem por metáfora.
//
// Os nomes de planeta e de signo chegam em português dentro das três línguas:
// é o mesmo gap conhecido e documentado no topo deste arquivo (o conteúdo
// astrológico gerado por lib/signs.js ainda não é traduzido). Os nomes de
// planeta que JÁ têm tradução vêm de `grounding.ruler.<slug>.name` e são
// interpolados traduzidos — por isso este bloco não redefine nenhum.
const HOROSCOPE_SKY_I18N = {
  pt: {
    'horoscope.sky.unavailable':
      'O céu deste dia não pôde ser calculado agora. Esta tela prefere não escrever nada a escrever um texto que serviria para qualquer dia.',

    'horoscope.sky.factsTitle': 'O céu calculado deste dia',
    'horoscope.sky.fact.moon': 'Lua',
    'horoscope.sky.fact.phase': 'Fase',
    'horoscope.sky.fact.dayRuler': 'Regente do dia',
    'horoscope.sky.fact.illum': '{pct}% iluminada',

    'horoscope.sky.changeTitle': 'Por que este texto não é o de ontem',
    'horoscope.sky.change.moonSign':
      'A Lua entrou em {novo} — no dia anterior estava em {velho}. Ela troca de signo a cada 2,3 dias em média, e é essa troca que reescreve o bloco seguinte: a relação dela com o seu signo mudou de fato.',
    'horoscope.sky.change.quarter':
      'A Lua virou de quarto: saiu do {velho} e entrou no {novo}. Ptolomeu lê a Lua por quartos (Tetrabiblos I.8) — é a virada de quarto que muda a leitura, não o nome da fase.',
    'horoscope.sky.change.rulerSign':
      'O regente do seu signo, {planeta}, mudou de signo: estava em {velho} e agora está em {novo}. Isso muda a dignidade dele — e é pela condição do regente que a tradição julga o signo.',
    'horoscope.sky.change.retroOn':
      'Mercúrio entrou em movimento retrógrado aparente. É a mudança do dia no céu que esta tela lê.',
    'horoscope.sky.change.retroOff':
      'Mercúrio saiu do movimento retrógrado aparente: a segunda estação já passou.',
    'horoscope.sky.change.dayRuler':
      'A Lua continua em {luaSigno} e o quarto lunar é o mesmo. O que mudou foi o dia — e o planeta que responde por ele, na ordem caldaica (a fila dos sete planetas, do mais lento ao mais rápido): {velho} → {novo}. É pouco — e esta tela prefere dizer que é pouco a inventar novidade.',

    'horoscope.sky.quarterShort.q1': 'quarto úmido, da Nova ao Quarto Crescente',
    'horoscope.sky.quarterShort.q2': 'quarto quente, do Quarto Crescente à Cheia',
    'horoscope.sky.quarterShort.q3': 'quarto seco, da Cheia ao Quarto Minguante',
    'horoscope.sky.quarterShort.q4': 'quarto frio, do Quarto Minguante à Nova',

    'horoscope.sky.rulerTitle': 'O regente do seu signo, neste dia',
    'horoscope.sky.ruler.domicile':
      'Todo signo tem um planeta que responde por ele — o regente. O de {signo} é {planeta}. E a tabela dos domicílios (a "casa" de cada planeta) não é arbitrária: Ptolomeu a deduz no Tetrabiblos I.17 da distância angular máxima de cada planeta ao Sol — quer dizer, do quanto cada um se afasta dele no céu: Vênus nunca mais de dois signos, Mercúrio nunca mais de um.',
    'horoscope.sky.ruler.position':
      'Onde {planeta} está neste dia: {signoPlaneta}. Isso foi calculado da efeméride — a tabela astronômica das posições reais dos planetas —, não sorteado.',
    'horoscope.sky.ruler.dignity.domicilio':
      '{planeta} em {signoPlaneta} está na própria casa. Na tabela do Tetrabiblos I.17 é a condição mais forte que o regente de {signo} pode ter: o planeta age em terreno seu.',
    'horoscope.sky.ruler.dignity.exaltacao':
      '{planeta} em {signoPlaneta} está em exaltação — um lugar onde a tradição vê o planeta com força especial. Na prática: o regente de {signo} está reforçado neste dia. O recibo vem do Tetrabiblos I.19: Ptolomeu dá a exaltação por SIGNO e a explica pela marcha do Sol no ano; os graus famosos que circulam por aí não estão lá, e por isso não aparecem aqui.',
    'horoscope.sky.ruler.dignity.exilio':
      '{planeta} em {signoPlaneta} está no signo oposto à própria casa — o que a tradição chamou de exílio: a condição em que o regente de {signo} tem menos terreno de apoio. O recibo, com a ressalva inteira: Ptolomeu nomeia a queda, não o exílio; esta é a leitura simétrica da tabela de domicílios dele (Tetrabiblos I.17), e vale como tradição, não como palavra dele.',
    'horoscope.sky.ruler.dignity.queda':
      '{planeta} em {signoPlaneta} está em queda — é o regente de {signo} sem terreno de apoio. E descrever não é decretar desfecho. O nome é antigo e tem endereço: Ptolomeu nomeia essa condição no Tetrabiblos I.19, e ela é sempre o signo oposto ao da exaltação.',
    'horoscope.sky.ruler.dignity.peregrino':
      '{planeta} em {signoPlaneta} está de passagem: nem em casa, nem no melhor lugar, nem no pior — a tradição chama isso de peregrino, sem terreno próprio e sem terreno hostil. É a condição mais comum dos planetas, e a mais honesta de admitir: neste dia o regente de {signo} não tem nada de excepcional a dizer. O recibo: peregrino é o que sobra quando o planeta não aparece nas tabelas de domicílio e exaltação do Tetrabiblos (I.17 e I.19), nem nos opostos delas — o exílio e a queda.',
    'horoscope.sky.ruler.retrograde':
      '{planeta} parece andar de ré no céu nesta data — é o movimento retrógrado, e o "aparente" importa: é efeito de perspectiva, não o planeta voltando de verdade. Na fonte antiga isso lê como atraso, e atraso com prazo. Valens, na seção de trânsitos das Anthologiae: passada a primeira estação (o dia em que o planeta parece parar antes de inverter o rumo) os planetas "atrasam expectativas, ações, lucros e empreendimentos"; passada a segunda, "cancelam o atraso e reinstauram as mesmas atividades".',
    'horoscope.sky.ruler.valens':
      'Este bloco vem primeiro de propósito. Valens (Anthologiae I.2) escreve que os nascidos sob um signo serão isto ou aquilo "conforme a relação com o regente da casa": o signo só diz alguma coisa através da condição do regente dele. Ler {signo} sozinho, incondicionalmente, é método do século XX — não da fonte antiga.',

    'horoscope.sky.moonTitle': 'A Lua deste dia e o seu signo',
    'horoscope.sky.moon.position': 'A Lua está em {signoLua} {emoji}.',
    'horoscope.sky.moon.rel.copresenca':
      'É o seu próprio signo: hoje a Lua não olha para {signo} — ela está dentro dele. E há um rigor curioso aqui: Ptolomeu não chama isso de aspecto. No Tetrabiblos I.24, dois corpos no mesmo lugar são "aplicação corporal", categoria à parte; e no I.16, signos coincidentes ficam de fora dos quatro aspectos.',
    'horoscope.sky.moon.rel.alheio30':
      '{signoLua} é vizinho de {signo} na roda — e, por estranho que pareça, vizinho não conversa: hoje a Lua não fala com o seu signo. Isso é informação — e é exatamente o dia em que um horóscopo genérico inventaria alguma coisa. O recibo: é a relação que Ptolomeu chama de disjunta e alheia (Tetrabiblos I.16) — os dois signos não se veem, "sem nenhuma participação nos quatro aspectos".',
    'horoscope.sky.moon.rel.sextil':
      'De {signo} a {signoLua} vão dois signos — é o sextil, um ângulo amigo: a Lua olha para o seu signo em harmonia hoje. O recibo: Ptolomeu classifica o sextil como harmônico (Tetrabiblos I.13) porque une signos do mesmo gênero, e justifica a lista dos quatro aspectos por proporção musical.',
    'horoscope.sky.moon.rel.quadratura':
      'De {signo} a {signoLua} vão três signos — é a quadratura, um ângulo de atrito: a Lua olha para o seu signo em tensão hoje. Tensão descrita, não sentença. O recibo: Ptolomeu a classifica como desarmônica (Tetrabiblos I.13), por unir signos de gêneros opostos — e no IV.5 ele mesmo registra que aspecto duro não encerra uma relação.',
    'horoscope.sky.moon.rel.trigono':
      'De {signo} a {signoLua} vão quatro signos — é o trígono, e a Lua olha para o seu signo no ângulo mais harmônico que a tradição conhece. O recibo: é o harmônico por excelência em Ptolomeu (Tetrabiblos I.13), unindo signos do mesmo gênero — e, na justificativa musical dele, é o terço da oposição.',
    'horoscope.sky.moon.rel.alheio150':
      'Entre {signo} e {signoLua} vão cinco signos — e a resposta honesta é: os dois não se falam hoje. O mercado chama isso de quincunce e trata como aspecto; usar quincunce é inverter Ptolomeu, não continuá-lo, e por isso esta tela não usa. O recibo: o Tetrabiblos I.16 põe esse intervalo entre os disjuntos e alheios — fora dos quatro aspectos.',
    'horoscope.sky.moon.rel.oposicao':
      'De {signo} a {signoLua} vão seis signos: oposição, o eixo inteiro da roda — é o dia em que a Lua está exatamente do outro lado do seu signo. O recibo: Ptolomeu a classifica como desarmônica (Tetrabiblos I.13) — e, de novo, ele descreve tensão, não decreta desfecho.',
    'horoscope.sky.moon.dignity.domicilio':
      'E {signoLua} é a casa da própria Lua: Ptolomeu deduz o domicílio lunar no Tetrabiblos I.17, por ser o mais setentrional dos signos de natureza feminina.',
    'horoscope.sky.moon.dignity.exaltacao':
      'E {signoLua} é a exaltação da Lua — um lugar onde a tradição a vê com força especial. A razão que Ptolomeu dá (Tetrabiblos I.19) é observável: depois da conjunção com o Sol (o encontro dos dois no céu), no signo da exaltação solar, a Lua "mostra a primeira fase e começa a aumentar a sua luz" no primeiro signo do próprio triângulo. Por signo, não por grau — o grau de exaltação lunar que circula por aí vem de tabela helenística posterior, não do Tetrabiblos.',
    'horoscope.sky.moon.dignity.exilio':
      'E {signoLua} é o signo oposto ao domicílio da Lua: exílio, na leitura simétrica da tabela de Tetrabiblos I.17.',
    'horoscope.sky.moon.dignity.queda':
      'E {signoLua} é a queda da Lua — o signo diametralmente oposto à exaltação dela, na letra do Tetrabiblos I.19.',
    'horoscope.sky.moon.wholeSign':
      'A conta acima é por SIGNO INTEIRO, sem orbe em graus: é assim que Ptolomeu conta aspecto (Tetrabiblos I.13), e não existe tabela de orbes no Tetrabiblos. A posição da Lua é cálculo de efeméride; a leitura da distância é doutrina do século II.',

    'horoscope.sky.quarterTitle': 'O quarto lunar',
    'horoscope.sky.quarter.q1':
      'A Lua está a {graus}° do Sol: primeiro quarto, da Nova ao Quarto Crescente. Ptolomeu (Tetrabiblos I.8) diz que nessa passagem ela é "mais produtora de umidade".',
    'horoscope.sky.quarter.q2':
      'A Lua está a {graus}° do Sol: segundo quarto, do Quarto Crescente à Cheia. Ptolomeu (Tetrabiblos I.8) diz que nessa passagem ela é produtora de calor.',
    'horoscope.sky.quarter.q3':
      'A Lua está a {graus}° do Sol: terceiro quarto, da Cheia ao Quarto Minguante. Ptolomeu (Tetrabiblos I.8) diz que nessa passagem ela é produtora de secura.',
    'horoscope.sky.quarter.q4':
      'A Lua está a {graus}° do Sol: quarto quarto, do Quarto Minguante à Nova. Ptolomeu (Tetrabiblos I.8) diz que nessa passagem ela é produtora de frio.',
    'horoscope.sky.quarter.practice.crescente':
      'Lua crescendo, tempo de pôr no mundo o que deve CRESCER — era assim que a lavoura romana funcionava. Trocar a muda pela intenção é leitura do século XXI e fica declarada como nossa; o gesto agrícola é que tem dois mil anos. Os recibos, um por vez: Paládio manda semear tudo com a lua crescente (Opus Agriculturae I.6.12). E Catão planta figueira, oliveira e videira com a lua escura, à tarde (De Agri Cultura 40.1).',
    'horoscope.sky.quarter.practice.minguante':
      'Lua minguando, tempo de CORTAR e GUARDAR — era essa a regra da lavoura romana. E vale dizer o que quase todo app inverte: colher para guardar é minguante, não é Lua Cheia. Os recibos, um por vez: Plínio registra que tudo que se corta, se colhe e se tosquia sofre menos dano com a lua decrescente (Naturalis Historia XVIII.321). E Columela colhe a uva para passa assim (XII.16.1).',
    'horoscope.sky.quarter.eightNames':
      'O nome de oito fases — hoje, {fase} — é convenção de manual de astronomia moderno, e a leitura psicológica das oito fases é de Dane Rudhyar, "The Lunation Cycle", 1967. A divisão com fonte antiga é a de quatro quartos, acima; por isso a leitura sai do quarto e o nome da fase entra só como etiqueta.',

    'horoscope.sky.weekday.0': 'Domingo',
    'horoscope.sky.weekday.1': 'Segunda-feira',
    'horoscope.sky.weekday.2': 'Terça-feira',
    'horoscope.sky.weekday.3': 'Quarta-feira',
    'horoscope.sky.weekday.4': 'Quinta-feira',
    'horoscope.sky.weekday.5': 'Sexta-feira',
    'horoscope.sky.weekday.6': 'Sábado',
    'horoscope.sky.dayTitle': 'O regente do dia',
    'horoscope.sky.day.chaldean':
      'Cada dia da semana tem um planeta que responde por ele — e o de {dia} é {planeta}. É daí que vêm os nomes dos dias em quase toda língua europeia. A sequência é a ordem caldaica (a fila dos sete planetas, do mais lento ao mais rápido), e o recibo é romano: Dião Cássio já a explica na História Romana 37.18-19.',
    'horoscope.sky.day.transposition':
      'A qualidade acima é FÍSICA: Ptolomeu descreve calor, frio, seco e úmido — ventos, exalações e corpos, não estados de ânimo. Ler "dia de Saturno" como um dia mais pesado é transposição nossa, e fica declarada como nossa.',

    'horoscope.sky.retroTitle': 'Mercúrio retrógrado',
    'horoscope.sky.retro.valens':
      'Mercúrio parece andar de ré no céu nesta data — o famoso retrógrado. O "aparente" importa: é efeito de perspectiva, não o planeta voltando de verdade. E foi calculado aqui, comparando a posição dele no céu (a longitude eclíptica) dois dias antes e dois dias depois — não consultado numa lista pronta. Na fonte antiga isso lê como atraso com prazo. Valens: passada a primeira estação os planetas "atrasam expectativas, ações, lucros e empreendimentos"; passada a segunda, "cancelam o atraso e reinstauram as mesmas atividades".',
    'horoscope.sky.retro.folklore':
      'O pacote moderno — aparelho que quebra, contrato que dá errado, ex que reaparece, voo atrasado — não está em fonte antiga nenhuma: é folclore do século XX. O atraso está na fonte (Valens); Ptolomeu, no Tetrabiblos I.8, só trata as estações em termos de qualidade térmica. O resto foi acrescentado depois — e este app não acrescenta.',

    'horoscope.sky.aspectTitle': 'Um aspecto real deste dia',
    'horoscope.sky.aspect.line':
      '{a} e {b} estão em {aspecto} nesta data, a {orb}° do ângulo exato.',
    'horoscope.sky.aspect.orbNote':
      'O ângulo é cálculo real; a tolerância em graus (o "orbe") é convenção moderna de software, não tradição — não existe tabela de orbes no Tetrabiblos, onde aspecto se conta por signo inteiro. Fica dito, para o número não parecer mais antigo do que é.',
    'horoscope.sky.aspect.conjunction':
      'Uma observação que quase todo app pula: conjunção NÃO é aspecto em Ptolomeu. No Tetrabiblos I.24 ela é "aplicação corporal", categoria separada, e no I.16 signos coincidentes ficam fora dos quatro aspectos. Aparece aqui nomeada pelo que é.',
    'horoscope.sky.aspectName.conjuncao': 'conjunção',
    'horoscope.sky.aspectName.sextil': 'sextil',
    'horoscope.sky.aspectName.quadratura': 'quadratura',
    'horoscope.sky.aspectName.trigono': 'trígono',
    'horoscope.sky.aspectName.oposicao': 'oposição',

    'horoscope.sky.footer.tropical':
      'Todos os signos desta tela são do zodíaco TRÓPICO: começam nos equinócios e solstícios, não nas constelações que estão atrás do Sol hoje. Ptolomeu escolhe o trópico e argumenta a escolha (Tetrabiblos I.10 e I.22). Um app sideral daria outros signos — nenhum dos dois mente, são réguas diferentes, e a régua deste app está declarada.',
    'horoscope.sky.footer.noScores':
      'Esta tela não tem nota, porcentagem nem barra por área da vida. Não existe medida numérica de área da vida em fonte antiga, medieval ou renascentista, e o assistente do app é proibido de dar porcentagem exatamente pelo mesmo motivo. Onde havia quatro barras sorteadas, agora há o céu calculado.',
  },

  es: {
    'horoscope.sky.unavailable':
      'El cielo de este día no pudo calcularse ahora. Esta pantalla prefiere no escribir nada antes que escribir un texto que serviría para cualquier día.',

    'horoscope.sky.factsTitle': 'El cielo calculado de este día',
    'horoscope.sky.fact.moon': 'Luna',
    'horoscope.sky.fact.phase': 'Fase',
    'horoscope.sky.fact.dayRuler': 'Regente del día',
    'horoscope.sky.fact.illum': '{pct}% iluminada',

    'horoscope.sky.changeTitle': 'Por qué este texto no es el de ayer',
    'horoscope.sky.change.moonSign':
      'La Luna entró en {novo} — el día anterior estaba en {velho}. Cambia de signo cada 2,3 días en promedio, y es ese cambio el que reescribe el bloque siguiente: su relación con tu signo cambió de verdad.',
    'horoscope.sky.change.quarter':
      'La Luna cambió de cuarto: salió del {velho} y entró en el {novo}. Ptolomeo lee la Luna por cuartos (Tetrabiblos I.8) — es el cambio de cuarto lo que cambia la lectura, no el nombre de la fase.',
    'horoscope.sky.change.rulerSign':
      'El regente de tu signo, {planeta}, cambió de signo: estaba en {velho} y ahora está en {novo}. Eso cambia su dignidad — y es por la condición del regente que la tradición juzga el signo.',
    'horoscope.sky.change.retroOn':
      'Mercurio entró en movimiento retrógrado aparente. Es el cambio del día en el cielo que esta pantalla lee.',
    'horoscope.sky.change.retroOff':
      'Mercurio salió del movimiento retrógrado aparente: la segunda estación ya pasó.',
    'horoscope.sky.change.dayRuler':
      'La Luna sigue en {luaSigno} y el cuarto lunar es el mismo. Lo que cambió fue el día — y el planeta que responde por él, en el orden caldeo (la fila de los siete planetas, del más lento al más rápido): {velho} → {novo}. Es poco — y esta pantalla prefiere decir que es poco antes que inventar una novedad.',

    'horoscope.sky.quarterShort.q1': 'cuarto húmedo, de la Nueva al Cuarto Creciente',
    'horoscope.sky.quarterShort.q2': 'cuarto cálido, del Cuarto Creciente a la Llena',
    'horoscope.sky.quarterShort.q3': 'cuarto seco, de la Llena al Cuarto Menguante',
    'horoscope.sky.quarterShort.q4': 'cuarto frío, del Cuarto Menguante a la Nueva',

    'horoscope.sky.rulerTitle': 'El regente de tu signo, en este día',
    'horoscope.sky.ruler.domicile':
      'Todo signo tiene un planeta que responde por él — el regente. El de {signo} es {planeta}. Y la tabla de los domicilios (la "casa" de cada planeta) no es arbitraria: Ptolomeo la deduce en el Tetrabiblos I.17 de la distancia angular máxima de cada planeta al Sol — es decir, de cuánto se aleja cada uno de él en el cielo: Venus nunca más de dos signos, Mercurio nunca más de uno.',
    'horoscope.sky.ruler.position':
      'Dónde está {planeta} en este día: {signoPlaneta}. Esto se calculó de la efeméride — la tabla astronómica de las posiciones reales de los planetas —, no se sorteó.',
    'horoscope.sky.ruler.dignity.domicilio':
      '{planeta} en {signoPlaneta} está en su propia casa. En la tabla del Tetrabiblos I.17 es la condición más fuerte que el regente de {signo} puede tener: el planeta actúa en terreno suyo.',
    'horoscope.sky.ruler.dignity.exaltacao':
      '{planeta} en {signoPlaneta} está en exaltación — un lugar donde la tradición ve al planeta con fuerza especial. En la práctica: el regente de {signo} está reforzado en este día. El recibo viene del Tetrabiblos I.19: Ptolomeo da la exaltación por SIGNO y la explica por la marcha del Sol en el año; los grados famosos que circulan por ahí no están ahí, y por eso no aparecen aquí.',
    'horoscope.sky.ruler.dignity.exilio':
      '{planeta} en {signoPlaneta} está en el signo opuesto a su propia casa — lo que la tradición llamó exilio: la condición en que el regente de {signo} tiene menos terreno de apoyo. El recibo, con la salvedad entera: Ptolomeo nombra la caída, no el exilio; esta es la lectura simétrica de su tabla de domicilios (Tetrabiblos I.17), y vale como tradición, no como palabra suya.',
    'horoscope.sky.ruler.dignity.queda':
      '{planeta} en {signoPlaneta} está en caída — es el regente de {signo} sin terreno de apoyo. Y describir no es decretar un desenlace. El nombre es antiguo y tiene dirección: Ptolomeo nombra esa condición en el Tetrabiblos I.19, y es siempre el signo opuesto al de la exaltación.',
    'horoscope.sky.ruler.dignity.peregrino':
      '{planeta} en {signoPlaneta} está de paso: ni en casa, ni en el mejor lugar, ni en el peor — la tradición llama a eso peregrino, sin terreno propio y sin terreno hostil. Es la condición más común de los planetas, y la más honesta de admitir: en este día el regente de {signo} no tiene nada excepcional que decir. El recibo: peregrino es lo que queda cuando el planeta no aparece en las tablas de domicilio y exaltación del Tetrabiblos (I.17 y I.19), ni en las opuestas a ellas — el exilio y la caída.',
    'horoscope.sky.ruler.retrograde':
      '{planeta} parece andar marcha atrás en el cielo en esta fecha — es el movimiento retrógrado, y el "aparente" importa: es efecto de perspectiva, no el planeta volviendo de verdad. En la fuente antigua esto se lee como retraso, y retraso con plazo. Valens, en la sección de tránsitos de las Anthologiae: pasada la primera estación (el día en que el planeta parece detenerse antes de invertir el rumbo) los planetas "retrasan expectativas, acciones, ganancias y empresas"; pasada la segunda, "cancelan el retraso y restablecen las mismas actividades".',
    'horoscope.sky.ruler.valens':
      'Este bloque va primero a propósito. Valens (Anthologiae I.2) escribe que los nacidos bajo un signo serán esto o aquello "según la relación con el regente de la casa": el signo solo dice algo a través de la condición de su regente. Leer {signo} solo, incondicionalmente, es método del siglo XX — no de la fuente antigua.',

    'horoscope.sky.moonTitle': 'La Luna de este día y tu signo',
    'horoscope.sky.moon.position': 'La Luna está en {signoLua} {emoji}.',
    'horoscope.sky.moon.rel.copresenca':
      'Es tu propio signo: hoy la Luna no mira a {signo} — está dentro de él. Y hay un rigor curioso aquí: Ptolomeo no llama a esto aspecto. En el Tetrabiblos I.24, dos cuerpos en el mismo lugar son "aplicación corporal", categoría aparte; y en I.16, los signos coincidentes quedan fuera de los cuatro aspectos.',
    'horoscope.sky.moon.rel.alheio30':
      '{signoLua} es vecino de {signo} en la rueda — y, por extraño que parezca, vecino no conversa: hoy la Luna no le habla a tu signo. Eso es información — y es exactamente el día en que un horóscopo genérico inventaría algo. El recibo: es la relación que Ptolomeo llama disjunta y ajena (Tetrabiblos I.16) — los dos signos no se ven, "sin ninguna participación en los cuatro aspectos".',
    'horoscope.sky.moon.rel.sextil':
      'De {signo} a {signoLua} van dos signos — es el sextil, un ángulo amigo: hoy la Luna mira a tu signo en armonía. El recibo: Ptolomeo clasifica el sextil como armónico (Tetrabiblos I.13) porque une signos del mismo género, y justifica la lista de los cuatro aspectos por proporción musical.',
    'horoscope.sky.moon.rel.quadratura':
      'De {signo} a {signoLua} van tres signos — es la cuadratura, un ángulo de roce: hoy la Luna mira a tu signo en tensión. Tensión descrita, no sentencia. El recibo: Ptolomeo la clasifica como disarmónica (Tetrabiblos I.13), por unir signos de géneros opuestos — y en el IV.5 él mismo registra que un aspecto duro no termina una relación.',
    'horoscope.sky.moon.rel.trigono':
      'De {signo} a {signoLua} van cuatro signos — es el trígono, y hoy la Luna mira a tu signo en el ángulo más armónico que conoce la tradición. El recibo: es el armónico por excelencia en Ptolomeo (Tetrabiblos I.13), uniendo signos del mismo género — y, en su justificación musical, es el tercio de la oposición.',
    'horoscope.sky.moon.rel.alheio150':
      'Entre {signo} y {signoLua} van cinco signos — y la respuesta honesta es: los dos no se hablan hoy. El mercado lo llama quincuncio y lo trata como aspecto; usar el quincuncio es invertir a Ptolomeo, no continuarlo, y por eso esta pantalla no lo usa. El recibo: el Tetrabiblos I.16 pone ese intervalo entre los disjuntos y ajenos — fuera de los cuatro aspectos.',
    'horoscope.sky.moon.rel.oposicao':
      'De {signo} a {signoLua} van seis signos: oposición, el eje entero de la rueda — es el día en que la Luna está exactamente del otro lado de tu signo. El recibo: Ptolomeo la clasifica como disarmónica (Tetrabiblos I.13) — y, de nuevo, él describe tensión, no decreta desenlace.',
    'horoscope.sky.moon.dignity.domicilio':
      'Y {signoLua} es la casa de la propia Luna: Ptolomeo deduce el domicilio lunar en el Tetrabiblos I.17, por ser el más septentrional de los signos de naturaleza femenina.',
    'horoscope.sky.moon.dignity.exaltacao':
      'Y {signoLua} es la exaltación de la Luna — un lugar donde la tradición la ve con fuerza especial. La razón que da Ptolomeo (Tetrabiblos I.19) es observable: tras la conjunción con el Sol (el encuentro de los dos en el cielo), en el signo de la exaltación solar, la Luna "muestra su primera fase y empieza a aumentar su luz" en el primer signo de su propio triángulo. Por signo, no por grado — el grado de exaltación lunar que circula por ahí viene de una tabla helenística posterior, no del Tetrabiblos.',
    'horoscope.sky.moon.dignity.exilio':
      'Y {signoLua} es el signo opuesto al domicilio de la Luna: exilio, en la lectura simétrica de la tabla del Tetrabiblos I.17.',
    'horoscope.sky.moon.dignity.queda':
      'Y {signoLua} es la caída de la Luna — el signo diametralmente opuesto a su exaltación, en la letra del Tetrabiblos I.19.',
    'horoscope.sky.moon.wholeSign':
      'La cuenta de arriba es por SIGNO ENTERO, sin orbe en grados: así cuenta el aspecto Ptolomeo (Tetrabiblos I.13), y no existe tabla de orbes en el Tetrabiblos. La posición de la Luna es cálculo de efeméride; la lectura de la distancia es doctrina del siglo II.',

    'horoscope.sky.quarterTitle': 'El cuarto lunar',
    'horoscope.sky.quarter.q1':
      'La Luna está a {graus}° del Sol: primer cuarto, de la Nueva al Cuarto Creciente. Ptolomeo (Tetrabiblos I.8) dice que en ese paso ella es "más productora de humedad".',
    'horoscope.sky.quarter.q2':
      'La Luna está a {graus}° del Sol: segundo cuarto, del Cuarto Creciente a la Llena. Ptolomeo (Tetrabiblos I.8) dice que en ese paso ella es productora de calor.',
    'horoscope.sky.quarter.q3':
      'La Luna está a {graus}° del Sol: tercer cuarto, de la Llena al Cuarto Menguante. Ptolomeo (Tetrabiblos I.8) dice que en ese paso ella es productora de sequedad.',
    'horoscope.sky.quarter.q4':
      'La Luna está a {graus}° del Sol: cuarto cuarto, del Cuarto Menguante a la Nueva. Ptolomeo (Tetrabiblos I.8) dice que en ese paso ella es productora de frío.',
    'horoscope.sky.quarter.practice.crescente':
      'Luna creciendo, tiempo de poner en el mundo lo que debe CRECER — así funcionaba la labranza romana. Cambiar el plantón por la intención es lectura del siglo XXI y queda declarada como nuestra; el gesto agrícola es el que tiene dos mil años. Los recibos, uno por uno: Paladio manda sembrar todo con la luna creciente (Opus Agriculturae I.6.12). Y Catón planta higuera, olivo y vid con la luna oscura, por la tarde (De Agri Cultura 40.1).',
    'horoscope.sky.quarter.practice.minguante':
      'Luna menguando, tiempo de CORTAR y GUARDAR — esa era la regla de la labranza romana. Y vale decir lo que casi toda app invierte: cosechar para guardar es menguante, no es Luna Llena. Los recibos, uno por uno: Plinio registra que todo lo que se corta, se cosecha y se esquila sufre menos daño con la luna decreciente (Naturalis Historia XVIII.321). Y Columela cosecha así la uva para pasa (XII.16.1).',
    'horoscope.sky.quarter.eightNames':
      'El nombre de ocho fases — hoy, {fase} — es convención de manual de astronomía moderno, y la lectura psicológica de las ocho fases es de Dane Rudhyar, "The Lunation Cycle", 1967. La división con fuente antigua es la de cuatro cuartos, arriba; por eso la lectura sale del cuarto y el nombre de la fase entra solo como etiqueta.',

    'horoscope.sky.weekday.0': 'Domingo',
    'horoscope.sky.weekday.1': 'Lunes',
    'horoscope.sky.weekday.2': 'Martes',
    'horoscope.sky.weekday.3': 'Miércoles',
    'horoscope.sky.weekday.4': 'Jueves',
    'horoscope.sky.weekday.5': 'Viernes',
    'horoscope.sky.weekday.6': 'Sábado',
    'horoscope.sky.dayTitle': 'El regente del día',
    'horoscope.sky.day.chaldean':
      'Cada día de la semana tiene un planeta que responde por él — y el de {dia} es {planeta}. De ahí vienen los nombres de los días en casi toda lengua europea. La secuencia es el orden caldeo (la fila de los siete planetas, del más lento al más rápido), y el recibo es romano: Dión Casio ya lo explica en la Historia Romana 37.18-19.',
    'horoscope.sky.day.transposition':
      'La cualidad de arriba es FÍSICA: Ptolomeo describe calor, frío, seco y húmedo — vientos, exhalaciones y cuerpos, no estados de ánimo. Leer "día de Saturno" como un día más pesado es transposición nuestra, y queda declarada como nuestra.',

    'horoscope.sky.retroTitle': 'Mercurio retrógrado',
    'horoscope.sky.retro.valens':
      'Mercurio parece andar marcha atrás en el cielo en esta fecha — el famoso retrógrado. El "aparente" importa: es efecto de perspectiva, no el planeta volviendo de verdad. Y se calculó aquí, comparando su posición en el cielo (la longitud eclíptica) dos días antes y dos días después — no se consultó en una lista hecha. En la fuente antigua esto se lee como retraso con plazo. Valens: pasada la primera estación los planetas "retrasan expectativas, acciones, ganancias y empresas"; pasada la segunda, "cancelan el retraso y restablecen las mismas actividades".',
    'horoscope.sky.retro.folklore':
      'El paquete moderno — el aparato que se rompe, el contrato que sale mal, el ex que reaparece, el vuelo con retraso — no está en ninguna fuente antigua: es folclore del siglo XX. El retraso está en la fuente (Valens); Ptolomeo, en el Tetrabiblos I.8, solo trata las estaciones en términos de cualidad térmica. El resto se añadió después — y esta app no añade.',

    'horoscope.sky.aspectTitle': 'Un aspecto real de este día',
    'horoscope.sky.aspect.line':
      '{a} y {b} están en {aspecto} en esta fecha, a {orb}° del ángulo exacto.',
    'horoscope.sky.aspect.orbNote':
      'El ángulo es cálculo real; la tolerancia en grados (el "orbe") es convención moderna de software, no tradición — no existe tabla de orbes en el Tetrabiblos, donde el aspecto se cuenta por signo entero. Queda dicho, para que el número no parezca más antiguo de lo que es.',
    'horoscope.sky.aspect.conjunction':
      'Una observación que casi toda app se salta: la conjunción NO es un aspecto en Ptolomeo. En el Tetrabiblos I.24 es "aplicación corporal", categoría separada, y en I.16 los signos coincidentes quedan fuera de los cuatro aspectos. Aparece aquí nombrada por lo que es.',
    'horoscope.sky.aspectName.conjuncao': 'conjunción',
    'horoscope.sky.aspectName.sextil': 'sextil',
    'horoscope.sky.aspectName.quadratura': 'cuadratura',
    'horoscope.sky.aspectName.trigono': 'trígono',
    'horoscope.sky.aspectName.oposicao': 'oposición',

    'horoscope.sky.footer.tropical':
      'Todos los signos de esta pantalla son del zodíaco TROPICAL: empiezan en los equinoccios y solsticios, no en las constelaciones que están hoy detrás del Sol. Ptolomeo elige el tropical y argumenta la elección (Tetrabiblos I.10 y I.22). Una app sideral daría otros signos — ninguna de las dos miente, son reglas distintas, y la regla de esta app está declarada.',
    'horoscope.sky.footer.noScores':
      'Esta pantalla no tiene nota, porcentaje ni barra por área de la vida. No existe medida numérica de área de la vida en ninguna fuente antigua, medieval o renacentista, y al asistente de la app se le prohíbe dar porcentajes exactamente por el mismo motivo. Donde había cuatro barras sorteadas, ahora está el cielo calculado.',
  },

  en: {
    'horoscope.sky.unavailable':
      "This day's sky could not be computed right now. This screen would rather write nothing than write a text that would fit any day at all.",

    'horoscope.sky.factsTitle': "This day's computed sky",
    'horoscope.sky.fact.moon': 'Moon',
    'horoscope.sky.fact.phase': 'Phase',
    'horoscope.sky.fact.dayRuler': 'Ruler of the day',
    'horoscope.sky.fact.illum': '{pct}% illuminated',

    'horoscope.sky.changeTitle': "Why this is not yesterday's text",
    'horoscope.sky.change.moonSign':
      'The Moon has entered {novo} — the day before it was in {velho}. It changes sign every 2.3 days on average, and that change is what rewrites the block below: its relation to your sign genuinely changed.',
    'horoscope.sky.change.quarter':
      'The Moon turned a quarter: it left the {velho} and entered the {novo}. Ptolemy reads the Moon by quarters (Tetrabiblos I.8) — it is the turn of the quarter that changes the reading, not the name of the phase.',
    'horoscope.sky.change.rulerSign':
      'The ruler of your sign, {planeta}, changed sign: it was in {velho} and is now in {novo}. That changes its dignity — and it is by the condition of the ruler that the tradition judges the sign.',
    'horoscope.sky.change.retroOn':
      'Mercury has entered apparent retrograde motion. That is the change in the sky this screen reads today.',
    'horoscope.sky.change.retroOff':
      'Mercury has left apparent retrograde motion: the second station is past.',
    'horoscope.sky.change.dayRuler':
      'The Moon is still in {luaSigno} and the lunar quarter is the same. What changed is the day — and the planet that answers for it, in the Chaldean order (the queue of the seven planets, from slowest to fastest): {velho} → {novo}. That is little — and this screen would rather say it is little than invent news.',

    'horoscope.sky.quarterShort.q1': 'moist quarter, from New to First Quarter',
    'horoscope.sky.quarterShort.q2': 'hot quarter, from First Quarter to Full',
    'horoscope.sky.quarterShort.q3': 'dry quarter, from Full to Last Quarter',
    'horoscope.sky.quarterShort.q4': 'cold quarter, from Last Quarter to New',

    'horoscope.sky.rulerTitle': 'The ruler of your sign, on this day',
    'horoscope.sky.ruler.domicile':
      'Every sign has a planet that answers for it — its ruler. The one for {signo} is {planeta}. And the table of domiciles (the "home" of each planet) is not arbitrary: Ptolemy derives it in Tetrabiblos I.17 from the maximum angular distance of each planet from the Sun — that is, from how far each one ever strays from it in the sky: Venus never more than two signs away, Mercury never more than one.',
    'horoscope.sky.ruler.position':
      'Where {planeta} is on this day: {signoPlaneta}. This was computed from the ephemeris — the astronomical table of the real positions of the planets — and not drawn at random.',
    'horoscope.sky.ruler.dignity.domicilio':
      '{planeta} in {signoPlaneta} stands in its own house. In the table of Tetrabiblos I.17 this is the strongest condition the ruler of {signo} can be in: the planet acts on its own ground.',
    'horoscope.sky.ruler.dignity.exaltacao':
      '{planeta} in {signoPlaneta} stands in exaltation — a place where the tradition sees the planet at special strength. In practice: the ruler of {signo} is reinforced on this day. The receipt comes from Tetrabiblos I.19: Ptolemy gives exaltation by SIGN and explains it by the yearly course of the Sun; the famous degrees that circulate everywhere are not there, and so they do not appear here.',
    'horoscope.sky.ruler.dignity.exilio':
      '{planeta} in {signoPlaneta} stands in the sign opposite its own house — what the tradition called detriment: the condition in which the ruler of {signo} has the least supporting ground. The receipt, with the caveat in full: Ptolemy names the fall, not the detriment; this is the symmetrical reading of his own table of domiciles (Tetrabiblos I.17), and it stands as tradition, not as his word.',
    'horoscope.sky.ruler.dignity.queda':
      '{planeta} in {signoPlaneta} stands in fall — it is the ruler of {signo} without supporting ground. And describing is not decreeing an outcome. The name is ancient and it has an address: Ptolemy names this condition in Tetrabiblos I.19, and it is always the sign opposite the exaltation.',
    'horoscope.sky.ruler.dignity.peregrino':
      '{planeta} in {signoPlaneta} is just passing through: not at home, not in its best place, not in its worst either — the tradition calls this peregrine, with no ground of its own and no hostile ground either. It is the commonest condition for a planet, and the most honest one to admit: on this day the ruler of {signo} has nothing exceptional to say. The receipt: peregrine is what is left when the planet appears in neither the domicile nor the exaltation table of the Tetrabiblos (I.17 and I.19), nor in their opposites — detriment and fall.',
    'horoscope.sky.ruler.retrograde':
      '{planeta} looks like it is moving backwards in the sky on this date — this is retrograde motion, and the word "apparent" matters: it is an effect of perspective, not the planet truly going back. In the ancient source this reads as delay, and delay with an end date. Valens, in the transits section of the Anthologiae: past the first station (the day the planet seems to halt before reversing course) the stars "delay expectations, actions, profits, and enterprises"; past the second, they "cancel any delay and reinstate the same activities".',
    'horoscope.sky.ruler.valens':
      'This block comes first on purpose. Valens (Anthologiae I.2) writes that those born under a sign will be one thing or another "depending on its relationship with the houseruler": the sign only says something through the condition of its ruler. Reading {signo} alone, unconditionally, is a 20th-century method — not the ancient source.',

    'horoscope.sky.moonTitle': "This day's Moon and your sign",
    'horoscope.sky.moon.position': 'The Moon is in {signoLua} {emoji}.',
    'horoscope.sky.moon.rel.copresenca':
      'It is your own sign: today the Moon is not looking at {signo} — it is inside it. And there is a curious bit of rigour here: Ptolemy does not call this an aspect. In Tetrabiblos I.24, two bodies in the same place are "bodily application", a separate category; and in I.16, coinciding signs are left out of the four aspects.',
    'horoscope.sky.moon.rel.alheio30':
      '{signoLua} is next to {signo} on the wheel — and, odd as it sounds, next-door neighbours do not talk: today the Moon does not speak to your sign. That is information — and it is exactly the day on which a generic horoscope would invent something. The receipt: it is the relation Ptolemy calls disjunct and alien (Tetrabiblos I.16) — the two signs do not see each other, "entirely without share in the four aforesaid aspects".',
    'horoscope.sky.moon.rel.sextil':
      'From {signo} to {signoLua} is two signs — the sextile, a friendly angle: today the Moon looks at your sign in harmony. The receipt: Ptolemy classes the sextile as harmonious (Tetrabiblos I.13) because it joins signs of the same gender, and he justifies the list of four aspects by musical proportion.',
    'horoscope.sky.moon.rel.quadratura':
      'From {signo} to {signoLua} is three signs — the square, an angle of friction: today the Moon looks at your sign in tension. Tension described, not sentence passed. The receipt: Ptolemy classes it as disharmonious (Tetrabiblos I.13), for joining signs of opposite gender — and in IV.5 he himself records that a hard aspect does not end a relationship.',
    'horoscope.sky.moon.rel.trigono':
      'From {signo} to {signoLua} is four signs — the trine, and today the Moon looks at your sign at the most harmonious angle the tradition knows. The receipt: it is the harmonious aspect par excellence in Ptolemy (Tetrabiblos I.13), joining signs of the same gender — and, in his musical justification, it is a third of the opposition.',
    'horoscope.sky.moon.rel.alheio150':
      'Between {signo} and {signoLua} lie five signs — and the honest answer is: the two are not speaking today. The market calls this a quincunx and treats it as an aspect; using the quincunx inverts Ptolemy rather than continuing him, and so this screen does not use it. The receipt: Tetrabiblos I.16 places that interval among the disjunct and alien ones — outside the four aspects.',
    'horoscope.sky.moon.rel.oposicao':
      'From {signo} to {signoLua} is six signs: opposition, the whole axis of the wheel — it is the day the Moon stands exactly across from your sign. The receipt: Ptolemy classes it as disharmonious (Tetrabiblos I.13) — and again, he describes tension, he does not decree an outcome.',
    'horoscope.sky.moon.dignity.domicilio':
      "And {signoLua} is the Moon's own house: Ptolemy derives the lunar domicile in Tetrabiblos I.17, it being the most northerly of the signs of feminine nature.",
    'horoscope.sky.moon.dignity.exaltacao':
      'And {signoLua} is the exaltation of the Moon — a place where the tradition sees her at special strength. Ptolemy\'s reason (Tetrabiblos I.19) is observable: after conjunction with the Sun (the meeting of the two in the sky), in the sign of the solar exaltation, the Moon "shows her first phase and begins to increase her light" in the first sign of her own triangle. By sign, not by degree — the lunar exaltation degree that circulates everywhere comes from a later Hellenistic table, not from the Tetrabiblos.',
    'horoscope.sky.moon.dignity.exilio':
      "And {signoLua} is the sign opposite the Moon's domicile: detriment, in the symmetrical reading of the table in Tetrabiblos I.17.",
    'horoscope.sky.moon.dignity.queda':
      'And {signoLua} is the fall of the Moon — the sign diametrically opposite her exaltation, in the letter of Tetrabiblos I.19.',
    'horoscope.sky.moon.wholeSign':
      'The count above is by WHOLE SIGN, with no orb in degrees: that is how Ptolemy counts an aspect (Tetrabiblos I.13), and there is no table of orbs in the Tetrabiblos. The position of the Moon is ephemeris arithmetic; the reading of the distance is 2nd-century doctrine.',

    'horoscope.sky.quarterTitle': 'The lunar quarter',
    'horoscope.sky.quarter.q1':
      'The Moon is {graus}° from the Sun: first quarter, from New to First Quarter. Ptolemy (Tetrabiblos I.8) says that in this passage it is "more productive of moisture".',
    'horoscope.sky.quarter.q2':
      'The Moon is {graus}° from the Sun: second quarter, from First Quarter to Full. Ptolemy (Tetrabiblos I.8) says that in this passage it is productive of heat.',
    'horoscope.sky.quarter.q3':
      'The Moon is {graus}° from the Sun: third quarter, from Full to Last Quarter. Ptolemy (Tetrabiblos I.8) says that in this passage it is productive of dryness.',
    'horoscope.sky.quarter.q4':
      'The Moon is {graus}° from the Sun: fourth quarter, from Last Quarter to New. Ptolemy (Tetrabiblos I.8) says that in this passage it is productive of cold.',
    'horoscope.sky.quarter.practice.crescente':
      'Moon waxing, time to put into the world whatever is meant to GROW — that is how Roman farming worked. Swapping the seedling for the intention is a 21st-century reading and is declared here as ours; it is the farming gesture that is two thousand years old. The receipts, one at a time: Palladius orders everything to be sown with the moon waxing (Opus Agriculturae I.6.12). And Cato plants fig, olive and vine by the dark moon, in the afternoon (De Agri Cultura 40.1).',
    'horoscope.sky.quarter.practice.minguante':
      'Moon waning, time to CUT and STORE — that was the rule of Roman farming. And it is worth saying what almost every app gets backwards: harvesting for storage is waning, not Full Moon. The receipts, one at a time: Pliny records that everything cut, harvested or shorn suffers less harm with the moon waning (Naturalis Historia XVIII.321). And Columella harvests grapes for raisins that way (XII.16.1).',
    'horoscope.sky.quarter.eightNames':
      'The eight-phase name — today, {fase} — is a modern astronomy-textbook convention, and the psychological reading of the eight phases is Dane Rudhyar\'s, "The Lunation Cycle", 1967. The division with an ancient source is the four quarters, above; that is why the reading comes from the quarter and the phase name enters only as a label.',

    'horoscope.sky.weekday.0': 'Sunday',
    'horoscope.sky.weekday.1': 'Monday',
    'horoscope.sky.weekday.2': 'Tuesday',
    'horoscope.sky.weekday.3': 'Wednesday',
    'horoscope.sky.weekday.4': 'Thursday',
    'horoscope.sky.weekday.5': 'Friday',
    'horoscope.sky.weekday.6': 'Saturday',
    'horoscope.sky.dayTitle': 'The ruler of the day',
    'horoscope.sky.day.chaldean':
      'Every day of the week has a planet that answers for it — and the one for {dia} is {planeta}. That is where the names of the days come from in almost every European language. The sequence is the Chaldean order (the queue of the seven planets, from slowest to fastest), and the receipt is Roman: Cassius Dio already explains it in Roman History 37.18-19.',
    'horoscope.sky.day.transposition':
      'The quality above is PHYSICAL: Ptolemy describes hot, cold, dry and moist — winds, exhalations and bodies, not states of mind. Reading "day of Saturn" as a heavier day is our transposition, and it is declared as ours.',

    'horoscope.sky.retroTitle': 'Mercury retrograde',
    'horoscope.sky.retro.valens':
      'Mercury looks like it is moving backwards in the sky on this date — the famous retrograde. The word "apparent" matters: it is an effect of perspective, not the planet truly going back. And it was computed here, by comparing its position in the sky (the ecliptic longitude) two days before and two days after — not looked up in a ready-made list. In the ancient source this reads as delay with an end date. Valens: past the first station the stars "delay expectations, actions, profits, and enterprises"; past the second, they "cancel any delay and reinstate the same activities".',
    'horoscope.sky.retro.folklore':
      'The modern package — the device that breaks, the contract that goes wrong, the ex who reappears, the delayed flight — is in no ancient source at all: it is 20th-century folklore. Delay is in the source (Valens); Ptolemy, in Tetrabiblos I.8, treats the stations only in terms of thermal quality. The rest was added later — and this app does not add.',

    'horoscope.sky.aspectTitle': 'A real aspect of this day',
    'horoscope.sky.aspect.line':
      '{a} and {b} are in {aspecto} on this date, {orb}° from the exact angle.',
    'horoscope.sky.aspect.orbNote':
      'The angle is real arithmetic; the tolerance in degrees (the "orb") is a modern software convention, not tradition — there is no table of orbs in the Tetrabiblos, where an aspect is counted by whole sign. Said plainly, so the number does not look older than it is.',
    'horoscope.sky.aspect.conjunction':
      'One point almost every app skips: conjunction is NOT an aspect in Ptolemy. In Tetrabiblos I.24 it is "bodily application", a separate category, and in I.16 coinciding signs fall outside the four aspects. It appears here named for what it is.',
    'horoscope.sky.aspectName.conjuncao': 'conjunction',
    'horoscope.sky.aspectName.sextil': 'sextile',
    'horoscope.sky.aspectName.quadratura': 'square',
    'horoscope.sky.aspectName.trigono': 'trine',
    'horoscope.sky.aspectName.oposicao': 'opposition',

    'horoscope.sky.footer.tropical':
      'Every sign on this screen belongs to the TROPICAL zodiac: the signs begin at the equinoxes and solstices, not at the constellations currently behind the Sun. Ptolemy chooses the tropical zodiac and argues for the choice (Tetrabiblos I.10 and I.22). A sidereal app would give other signs — neither is lying, they are different rulers, and this app declares which one it uses.',
    'horoscope.sky.footer.noScores':
      'There is no score, no percentage and no per-area-of-life bar on this screen. No numeric measure of an area of life exists in any ancient, medieval or Renaissance source, and this app\'s assistant is forbidden to give percentages for exactly the same reason. Where four randomly drawn bars used to be, there is now the computed sky.',
  },
};
Object.assign(PT, HOROSCOPE_SKY_I18N.pt);
Object.assign(ES, HOROSCOPE_SKY_I18N.es);
Object.assign(EN, HOROSCOPE_SKY_I18N.en);

// ---------------------------------------------------------------------------
// O BOTÃO QUE ABRE O MÉTODO — acrescentado em 31/07/2026
// ---------------------------------------------------------------------------
// Auditoria de leitura do horóscopo: renderizados os doze signos no mesmo dia,
// cada um recebia 596 palavras e a sobreposição entre dois signos quaisquer era
// de 0,81 (pior par 0,93). As oito palavras em dez repetidas eram as FONTES —
// a dedução de Ptolomeu em Tetrabiblos I.17, a régua de signo inteiro de I.13,
// Plínio e Columela sobre a lua minguante, o aviso de que a fase de oito nomes
// é de Rudhyar, 1967. O que é sobre ESTE signo HOJE cabia em ~60 palavras e
// ficava soterrado.
//
// Nenhuma dessas linhas saiu do app e nenhuma foi reescrita. Cada uma passou a
// declarar, em lib/dailyHoroscope.js, se é LEITURA (o que o céu calculado diz
// deste signo neste dia) ou MÉTODO (de onde isso vem e o que a fonte não
// autoriza). A tela mostra a leitura e põe o método atrás deste toque, por
// bloco. `assinatura()` continua somando as duas classes, então marcar como
// método não serve para apagar ressalva: o teste quebra.
//
// O rótulo diz o que se ganha ao abrir — "de onde vem isto" —, e não "saiba
// mais": quem toca precisa saber que vai encontrar fonte e ressalva, não
// conteúdo extra de horóscopo.
Object.assign(PT, {
  'horoscope.sky.methodToggle': 'De onde vem isto — fonte e ressalva',
});
Object.assign(ES, {
  'horoscope.sky.methodToggle': 'De dónde viene esto — fuente y advertencia',
});
Object.assign(EN, {
  'horoscope.sky.methodToggle': 'Where this comes from — source and caveat',
});

const DICTS = { pt: PT, es: ES, en: EN };
// Exportado só pra teste de paridade de chaves entre idiomas (test/i18n.test.js)
// — não é pensado pra ser usado direto fora daqui, sempre passar por translate().
export const _DICTS_FOR_TESTS = DICTS;

function interpolate(template, vars) {
  if (!vars) return template;
  return Object.keys(vars).reduce(
    (str, key) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), vars[key]),
    template
  );
}

// Nunca lança: chave desconhecida devolve a própria chave (visível/debugável
// em vez de quebrar a tela), e falta de tradução no idioma atual cai pro PT.
export function translate(lang, key, vars) {
  const dict = DICTS[lang] || DICTS[DEFAULT_LANGUAGE];
  const template = dict[key] ?? DICTS[DEFAULT_LANGUAGE][key] ?? key;
  return interpolate(template, vars);
}

// ===========================================================================
// SINASTRIA POR ASPECTO — acréscimo de 31/07/2026
// ===========================================================================
// Mesmo padrão de GROUNDING_I18N acima: bloco no fim, aplicado por Object.assign
// sobre PT/ES/EN. DICTS guarda REFERÊNCIAS a esses três objetos, então assinar
// depois da definição de DICTS funciona igual — translate() lê no momento da
// chamada.
//
// POR QUE ESTE BLOCO EXISTE. A tela de Compatibilidade mostrava uma
// porcentagem, e o dicionário prometia junto: 'home.compatPercent' era
// '{pct}% de compatibilidade' / '{pct}% de compatibilidad' / '{pct}%
// compatibility'. A porcentagem saiu do app (o motivo inteiro está no cabeçalho
// de lib/synastry.js, "A DECISÃO DA PORCENTAGEM"), e a promessa de precisão que
// vinha com ela não podia sobrar no dicionário.
//
// A chave antiga é REESCRITA aqui, e não só abandonada: chave morta continua
// sendo publicada no bundle, e um "% de compatibilidade" esquecido no
// dicionário é exatamente o tipo de coisa que a próxima tela reaproveita sem
// perceber. Agora ela aponta pro mesmo texto de 'home.compatAspect' — quem
// chamar qualquer uma das duas recebe aspecto e categoria, nunca um número.
//
// TRADUZIDO SÓ O RÓTULO. O nome do aspecto e a categoria existem nos três
// idiomas porque são vocabulário técnico curto e estável. O CORPO da leitura
// (lib/synastry.js) continua em português nos três — é o gap conhecido
// declarado no topo deste arquivo, não esquecimento.
const SINASTRIA_I18N = {
  pt: {
    // Os quatro aspectos de Ptolomeu (I.13), mais os dois estados que ele
    // trata FORA da lista: aversão (I.16) e mesmo signo (co-presença).
    'compat.aspect.trigono': 'Trígono',
    'compat.aspect.sextil': 'Sextil',
    'compat.aspect.quadratura': 'Quadratura',
    'compat.aspect.oposicao': 'Oposição',
    'compat.aspect.aversao': 'Aversão',
    'compat.aspect.copresenca': 'Co-presença',
    'compat.category.harmonico': 'harmônico',
    'compat.category.desarmonico': 'desarmônico',
    'compat.category.semAspecto': 'sem aspecto',
    'compat.category.copresenca': 'co-presença',
    'home.compatAspect': '{aspecto} · {categoria}',
    'home.compatPercent': '{aspecto} · {categoria}',
    // O rótulo que impede a paráfrase do verbatim de passar por citação
    // (feedback do dono, 31/07/2026) — o campo `parafrase` de VERBATIM em
    // lib/synastry.js só pode aparecer na tela debaixo deste aviso.
    'compat.paraphrase.label': 'Em bom português — paráfrase nossa',
    // OS DOIS BLOCOS DA TELA DE COMPATIBILIDADE (31/07/2026). Só os RÓTULOS
    // entram aqui: o corpo das cinco dimensões vive em lib/synastry.js e
    // continua em português nos três idiomas — o mesmo gap conhecido e
    // declarado no topo deste arquivo. Os títulos das dimensões são chamados
    // por chave montada (t(d.chaveTitulo)), e a lista de chaves vive ao lado
    // dos ids em DIMENSOES_VIDA_REAL, pra não ser possível renomear um id sem
    // ver a chave.
    'compat.real.kicker': 'Sem enrolação',
    'compat.real.title': 'Como é na vida real',
    'compat.real.footnote': 'Este bloco é leitura de temperamento contemporânea — quem quiser a fonte antiga, com capítulo e citação, abre "De onde vem isso" logo abaixo.',
    'compat.dim.quimica': 'Química e cama',
    'compat.dim.conversa': 'Conversa',
    'compat.dim.briga': 'Briga',
    'compat.dim.convivencia': 'Convivência',
    'compat.dim.longoPrazo': 'O que segura a longo prazo',
    'compat.source.toggle': 'De onde vem isso',
    'compat.source.caracterologia': 'De quem é o texto lá de cima',
    'quiz.reveal.aspectBadge': 'o aspecto entre os signos de vocês',
    'quiz.reveal.aspectGeometry': '{graus}° · {distancia} signos de distância · {categoria} na conta de Ptolomeu',
    'quiz.reveal.aspectGeometrySame': 'mesmo signo · {categoria}: Ptolomeu não conta isto entre os aspectos',
  },
  es: {
    'compat.aspect.trigono': 'Trígono',
    'compat.aspect.sextil': 'Sextil',
    'compat.aspect.quadratura': 'Cuadratura',
    'compat.aspect.oposicao': 'Oposición',
    'compat.aspect.aversao': 'Aversión',
    'compat.aspect.copresenca': 'Copresencia',
    'compat.category.harmonico': 'armónico',
    'compat.category.desarmonico': 'disarmónico',
    'compat.category.semAspecto': 'sin aspecto',
    'compat.category.copresenca': 'copresencia',
    'home.compatAspect': '{aspecto} · {categoria}',
    'home.compatPercent': '{aspecto} · {categoria}',
    'compat.paraphrase.label': 'En palabras llanas — paráfrasis nuestra',
    'compat.real.kicker': 'Sin rodeos',
    'compat.real.title': 'Cómo es en la vida real',
    'compat.real.footnote': 'Este bloque es lectura de temperamento contemporánea — quien quiera la fuente antigua, con capítulo y cita, abre "De dónde viene esto" aquí abajo.',
    'compat.dim.quimica': 'Química y cama',
    'compat.dim.conversa': 'Conversación',
    'compat.dim.briga': 'Peleas',
    'compat.dim.convivencia': 'Convivencia',
    'compat.dim.longoPrazo': 'Lo que sostiene a largo plazo',
    'compat.source.toggle': 'De dónde viene esto',
    'compat.source.caracterologia': 'De quién es el texto de arriba',
    'quiz.reveal.aspectBadge': 'el aspecto entre sus signos',
    'quiz.reveal.aspectGeometry': '{graus}° · {distancia} signos de distancia · {categoria} según Ptolomeo',
    'quiz.reveal.aspectGeometrySame': 'mismo signo · {categoria}: Ptolomeo no cuenta esto entre los aspectos',
  },
  en: {
    'compat.aspect.trigono': 'Trine',
    'compat.aspect.sextil': 'Sextile',
    'compat.aspect.quadratura': 'Quartile',
    'compat.aspect.oposicao': 'Opposition',
    'compat.aspect.aversao': 'Aversion',
    'compat.aspect.copresenca': 'Co-presence',
    'compat.category.harmonico': 'harmonious',
    'compat.category.desarmonico': 'disharmonious',
    'compat.category.semAspecto': 'no aspect',
    'compat.category.copresenca': 'co-presence',
    'home.compatAspect': '{aspecto} · {categoria}',
    'home.compatPercent': '{aspecto} · {categoria}',
    'compat.paraphrase.label': 'In plain words — our paraphrase',
    'compat.real.kicker': 'No sugarcoating',
    'compat.real.title': 'What it is like in real life',
    'compat.real.footnote': 'This block is contemporary character reading — for the ancient source, with chapter and quotation, open "Where this comes from" below.',
    'compat.dim.quimica': 'Chemistry and bed',
    'compat.dim.conversa': 'Talking',
    'compat.dim.briga': 'Fighting',
    'compat.dim.convivencia': 'Living together',
    'compat.dim.longoPrazo': 'What holds it long term',
    'compat.source.toggle': 'Where this comes from',
    'compat.source.caracterologia': 'Whose text that was, up there',
    'quiz.reveal.aspectBadge': 'the aspect between your signs',
    'quiz.reveal.aspectGeometry': '{graus}° · {distancia} signs apart · {categoria} by Ptolemy\'s reckoning',
    'quiz.reveal.aspectGeometrySame': 'same sign · {categoria}: Ptolemy does not count this among the aspects',
  },
};
Object.assign(PT, SINASTRIA_I18N.pt);
Object.assign(ES, SINASTRIA_I18N.es);
Object.assign(EN, SINASTRIA_I18N.en);

// ===========================================================================
// SAÍDA DO PASSO 2 DO QUIZ DE CASAL — mesmo padrão de bloco no fim.
//
// POR QUE ESTE BLOCO EXISTE. O passo 2 exigia a data de nascimento do PARCEIRO
// para deixar avançar, e a saída de emergência (escolher o signo do par na mão)
// só aparecia depois que `signoAmor` já existia — ou seja, só depois que você
// já não precisava dela. Quem não sabe a data de nascimento do par não tinha
// caminho nenhum para a frente: o quiz inteiro esperava que a pessoa fosse
// perguntar para outra pessoa antes de continuar.
//
// Isso é um beco sem saída literal, e viola a regra do dono: todo lugar do
// funil que PEDE alguma coisa precisa mostrar o caminho de saída junto.
//
// A leitura de compatibilidade só precisa dos NOMES dos signos (sinastria() em
// lib/synastry.js recebe os índices). Data, hora e cidade do parceiro servem
// para Lua e Ascendente dele — que são um bônus, não um requisito. Pedir os
// três como pedágio para uma leitura que não os usa é coleta que não paga de
// volta.
const QUIZ_SAIDA_I18N = {
  pt: {
    'quiz.birth.dontKnowDate': 'não sei a data — escolher o signo',
    'quiz.aviso.needPartnerSign': 'Falta o signo de {name}: escolha a data ou toque em “não sei a data”.',
  },
  es: {
    'quiz.birth.dontKnowDate': 'no sé la fecha — elegir el signo',
    'quiz.aviso.needPartnerSign': 'Falta el signo de {name}: elige la fecha o toca “no sé la fecha”.',
  },
  en: {
    'quiz.birth.dontKnowDate': "don't know the date — pick the sign",
    'quiz.aviso.needPartnerSign': 'Missing {name}’s sign: pick the date or tap “don’t know the date”.',
  },
};
Object.assign(PT, QUIZ_SAIDA_I18N.pt);
Object.assign(ES, QUIZ_SAIDA_I18N.es);
Object.assign(EN, QUIZ_SAIDA_I18N.en);

// ===========================================================================
// BENEFÍCIOS DO PLANO SOLO — sete linhas onde havia duas.
//
// POR QUE ESTE BLOCO EXISTE. Quem assina solo via só planos.benefit.1 e .2, e
// o .2 era UM bullet com nove itens separados por vírgula ("Horóscopo, Mapa
// Astral, Tarô, Compatibilidade, Chat, Palma, Café, Sonhos e Calendário
// Lunar"). O olho lê isso como uma linha, não como nove — o problema não era
// ter poucos benefícios, era ter os nove amontoados num só.
//
// Agora são sete linhas agrupadas por DESEJO, não por tela. Nada inventado:
// os nove são exatamente os nove OneTimeLock do código, o álbum tem 78 cartas
// (COLLECTION_TOTAL) e a assinatura de fato torna todos ilimitados — está
// documentado em PlanosScreen.js:122-124.
//
// O .8 não é benefício da assinatura, é razão para acreditar: planta o
// diferencial no ponto exato da decisão de compra.
//
// As chaves de casal (planos.benefit.1..7) continuam intactas — só o caminho
// solo passa a usar esta lista, via SOLO_BENEFIT_KEYS em PlanosScreen.js.
const PLANOS_SOLO_I18N = {
  pt: {
    'planos.unlockTitleSolo': 'Suas nove leituras, sem limite nenhum',
    'planos.benefit.solo.1': '7 dias grátis pra experimentar tudo — cancela quando quiser',
    'planos.benefit.solo.2': 'Horóscopo e Calendário Lunar sem limite: o céu de hoje e o do mês inteiro, calculados de verdade',
    'planos.benefit.solo.3': 'Seu Mapa Astral completo, quantas vezes você quiser voltar nele',
    'planos.benefit.solo.4': 'Tarô sem limite — e cada carta que sai fica guardada no seu álbum das 78',
    'planos.benefit.solo.5': 'Sonhos, palma da mão e borra de café: conte o sonho ou mande a foto, sem contar quantas vezes',
    'planos.benefit.solo.6': 'Chat Espiritual sempre aberto, pra perguntar o que ficou na cabeça depois da leitura',
    'planos.benefit.solo.7': 'Compatibilidade sem limite, pra comparar com quem você quiser',
    'planos.benefit.solo.8': 'Escrito a partir de fonte primária: quando a tradição e a internet discordam, a gente mostra a fonte',
  },
  es: {
    'planos.unlockTitleSolo': 'Tus nueve lecturas, sin límite alguno',
    'planos.benefit.solo.1': '7 días gratis para probarlo todo — cancela cuando quieras',
    'planos.benefit.solo.2': 'Horóscopo y Calendario Lunar sin límite: el cielo de hoy y el del mes entero, calculados de verdad',
    'planos.benefit.solo.3': 'Tu Carta Astral completa, todas las veces que quieras volver a ella',
    'planos.benefit.solo.4': 'Tarot sin límite — y cada carta que sale queda guardada en tu álbum de 78',
    'planos.benefit.solo.5': 'Sueños, palma de la mano y poso de café: cuenta el sueño o manda la foto, sin contar cuántas veces',
    'planos.benefit.solo.6': 'Chat Espiritual siempre abierto, para preguntar lo que quedó en la cabeza después de la lectura',
    'planos.benefit.solo.7': 'Compatibilidad sin límite, para comparar con quien quieras',
    'planos.benefit.solo.8': 'Escrito desde la fuente primaria: cuando la tradición y el internet no coinciden, mostramos la fuente',
  },
  en: {
    'planos.unlockTitleSolo': 'Your nine readings, with no limit at all',
    'planos.benefit.solo.1': '7 days free to try everything — cancel whenever you want',
    'planos.benefit.solo.2': 'Horoscope and Lunar Calendar with no limit: today’s sky and the whole month, actually calculated',
    'planos.benefit.solo.3': 'Your full Birth Chart, as many times as you want to come back to it',
    'planos.benefit.solo.4': 'Unlimited Tarot — and every card you draw is kept in your album of 78',
    'planos.benefit.solo.5': 'Dreams, palm and coffee grounds: tell the dream or send the photo, without counting how many times',
    'planos.benefit.solo.6': 'Spiritual Chat always open, to ask what stayed on your mind after the reading',
    'planos.benefit.solo.7': 'Unlimited Compatibility, to compare with whoever you want',
    'planos.benefit.solo.8': 'Written from primary sources: when tradition and the internet disagree, we show you the source',
  },
};
Object.assign(PT, PLANOS_SOLO_I18N.pt);
Object.assign(ES, PLANOS_SOLO_I18N.es);
Object.assign(EN, PLANOS_SOLO_I18N.en);

// ===========================================================================
// RITUAIS — o chrome da tela (screens/RituaisScreen.js)
// ===========================================================================
// Mesmo padrão de GROUNDING_I18N e SINASTRIA_I18N: bloco no fim, aplicado por
// Object.assign sobre PT/ES/EN. DICTS guarda REFERÊNCIAS a esses três objetos,
// então assinar depois da definição de DICTS funciona — translate() lê no
// momento da chamada.
//
// O QUE ENTRA AQUI E O QUE NÃO ENTRA. Só o chrome: rótulos, botões, estados
// vazios, o texto do muro. O CONTEÚDO dos 21 rituais (título, os cinco campos,
// nomes e descrições das sete categorias, os três blocos de lastro) vive em
// lib/rituais.js e continua em português nos três idiomas — é o MESMO gap
// conhecido e declarado no topo deste arquivo para lib/signs.js e
// lib/brindes.js, e o caminho de migração está escrito no cabeçalho de
// lib/rituais.js (helpers de chave montada + teste de paridade junto). Não é
// esquecimento.
//
// O AVISO ÉTICO NÃO ESTÁ AQUI, DE PROPÓSITO. Ele é a constante AVISO_ETICO de
// lib/rituais.js, com a instrução literal do dono no cabeçalho de lá: "não
// reescreva, não melhore, não traduza sem o dono", e test/rituais.test.js
// confere a igualdade byte a byte em três lugares. Uma chave de tradução aqui
// abriria a porta pra três versões diferentes do aviso que protege o negócio.
//
// TOM: mesma régua de lib/rituais.js — nenhuma alegação de saúde nem implícita,
// nenhuma promessa de resultado, nenhum mecanismo pseudocientífico. Repare que
// nem o texto do muro promete nada: ele diz o que a assinatura DESTRAVA (os
// outros rituais), nunca o que ela faz acontecer na vida de quem assina.
const RITUAIS_I18N = {
  pt: {
    'rituais.title': 'Rituais',
    'rituais.subtitle': 'Coisas pra fazer com a mão',
    // A PRIMEIRA LINHA QUE A PESSOA LÊ nesta tela. Antes era o rótulo da barra
    // de aviso ("Antes de qualquer ritual") seguido do disclaimer — das três
    // telas novas, Rituais era a única que abria em ressalva em vez de abrir na
    // vida real de hoje. Agora tem intro, como Jornada e Calendário já tinham.
    'rituais.intro': 'Vinte e um rituais que se fazem com a mão: uma carta que não se envia, uma gaveta só, vinte minutos marcados. Hoje o céu casa com alguns deles.',

    // (1) o topo — o casamento com hoje, que é o motivo de voltar amanhã
    'rituais.today.title': 'Rituais de hoje',
    'rituais.today.sky': '{emoji} {fase} · {dia}, dia de {planeta}',
    'rituais.today.dayOnly': '{dia}, dia de {planeta}',
    'rituais.today.skyOff':
      'Neste aparelho o app não conseguiu calcular a fase da Lua agora. Ficam só os rituais que pedem o dia da semana — que é conta de calendário e continua valendo. Nada foi chutado pra encher a lista.',
    'rituais.today.exactTitle': 'Casam a fase e o dia',
    'rituais.today.empty':
      'Hoje nenhum ritual casa com a fase e o dia ao mesmo tempo. Escolha por objetivo aqui embaixo — todos continuam à mão.',
    'rituais.today.partialTitle': 'Casam em parte',
    'rituais.today.partialHint':
      'Estes batem num critério só: ou a fase, ou o dia. Vai escrito em cada um qual foi.',
    'rituais.match': 'Casa com hoje: {motivo}',

    // TAXONOMIA DE UI — a primeira parcela do i18n de lib/rituais.js. Estas
    // entram INTERPOLADAS dentro das frases acima ('{dia}, dia de {planeta}'),
    // e era por elas que a tela em inglês lia "segunda-feira, day of Lua".
    // Os nomes de fase aqui são só RÓTULO: o nome canônico continua sendo a
    // string em português de lib/rituais.js, que é a que casa byte a byte com o
    // motor da Lua — traduzir o canônico faria o app parar de sugerir ritual
    // nenhum, em silêncio e sem erro.
    'rituais.fase.luaNova': 'Lua Nova',
    'rituais.fase.luaCrescente': 'Lua Crescente',
    'rituais.fase.quartoCrescente': 'Quarto Crescente',
    'rituais.fase.gibosaCrescente': 'Lua Gibosa Crescente',
    'rituais.fase.luaCheia': 'Lua Cheia',
    'rituais.fase.gibosaMinguante': 'Lua Gibosa Minguante',
    'rituais.fase.quartoMinguante': 'Quarto Minguante',
    'rituais.fase.luaMinguante': 'Lua Minguante',
    'rituais.dia.0': 'domingo',
    'rituais.dia.1': 'segunda-feira',
    'rituais.dia.2': 'terça-feira',
    'rituais.dia.3': 'quarta-feira',
    'rituais.dia.4': 'quinta-feira',
    'rituais.dia.5': 'sexta-feira',
    'rituais.dia.6': 'sábado',
    'rituais.planeta.sol': 'Sol',
    'rituais.planeta.lua': 'Lua',
    'rituais.planeta.marte': 'Marte',
    'rituais.planeta.mercurio': 'Mercúrio',
    'rituais.planeta.jupiter': 'Júpiter',
    'rituais.planeta.venus': 'Vênus',
    'rituais.planeta.saturno': 'Saturno',
    // O conectivo do resumo do momento ideal ('Lua Nova ou Lua Crescente').
    // Sem chave, o espanhol lia "Luna Nueva ou Luna Creciente".
    'rituais.momento.ou': 'ou',
    'rituais.cat.amor': 'Amor',
    'rituais.cat.amor.desc': 'O que você sente e o que você faz com isso — nunca o que a outra pessoa deveria fazer.',
    'rituais.cat.prosperidade': 'Prosperidade',
    'rituais.cat.prosperidade.desc': 'Olhar o dinheiro de frente, anotar, organizar. O que muda é a clareza, não o saldo.',
    'rituais.cat.protecao': 'Proteção',
    'rituais.cat.protecao.desc': 'Gestos concretos de cuidado com a casa, com o combinado e com o próprio limite.',
    'rituais.cat.limpeza': 'Limpeza',
    'rituais.cat.limpeza.desc': 'Encerrar, esvaziar, largar. É trabalho de mão, e a Lua minguante é a fase que mais aparece escrita nas fontes antigas.',
    'rituais.cat.coragem': 'Coragem',
    'rituais.cat.coragem.desc': 'A ligação adiada, a conversa difícil, a data marcada. Encarar tem passo a passo.',
    'rituais.cat.foco': 'Foco',
    'rituais.cat.foco.desc': 'Escolher uma coisa só e tirar o resto da frente, por um tempo medido.',
    'rituais.cat.autoestima': 'Autoestima',
    'rituais.cat.autoestima.desc': 'Inventário do que você fez de fato — checkável, não elogio genérico.',

    // (2) e (3) as categorias e a lista
    'rituais.categories.title': 'Por objetivo',
    'rituais.categories.hint': 'Sete objetivos. Toque num pra ver a lista.',
    'rituais.category.count': '{n} rituais nesta lista',
    'rituais.card.momento': 'Momento ideal: {momento}',

    // (4) o detalhe — os cinco campos, na ordem aprovada pelo dono
    'rituais.field.intencao': 'INTENÇÃO',
    'rituais.field.materiais': 'MATERIAIS',
    'rituais.field.passos': 'PASSO A PASSO',
    'rituais.field.momento': 'MOMENTO IDEAL',
    'rituais.field.cuidados': 'CUIDADOS E ÉTICA',
    'rituais.detail.sources': 'De onde vem — obra, autor, século',
    'rituais.detail.noSource': 'O que aqui não tem fonte antiga',
    'rituais.detail.noSourceHint':
      'A parte que o mercado vende como milenar e que a pesquisa deste app não achou em fonte antiga nenhuma. Fica escrito, em vez de escondido.',
    'rituais.detail.back': 'Voltar pra lista',
    'rituais.lastro.title': 'De onde sai o "momento ideal"',

    // compartilhar — pedido explícito do dono
    'rituais.share.cta': 'Compartilhar no WhatsApp',
    // A MOLDURA do texto que sai do app e circula em público. Que a ausência
    // dela era esquecimento e não decisão dá pra provar duas linhas abaixo:
    // 'rituais.share.failed', a mensagem de ERRO do compartilhamento, já
    // estava traduzida nos três idiomas; o CONTEÚDO compartilhado, não.
    'rituais.share.line1': '{titulo} — ritual de {categoria}, do Cosmic Guide.',
    'rituais.share.line2': 'Momento ideal: {momento}.',
    'rituais.share.copied': 'Texto copiado. É só colar no WhatsApp.',
    'rituais.share.failed':
      'Este navegador não deixou copiar. Selecione o texto do ritual e copie à mão.',

    // o muro
    'rituais.lock.badge': 'assinatura',
    'rituais.paywall.firstFree':
      'O primeiro ritual que você abrir fica aberto pra sempre neste aparelho — ritual não se lê, se faz, e vários duram dias. Os outros vêm com a assinatura.',
    'rituais.paywall.used':
      'O ritual que ficou seu é "{titulo}" — esse abre sempre. Os outros vêm com a assinatura.',

    'rituais.expand': 'abrir',
    'rituais.collapse': 'fechar',
  },
  es: {
    'rituais.title': 'Rituales',
    'rituais.subtitle': 'Cosas para hacer con la mano',
    'rituais.intro': 'Veintiún rituales que se hacen con la mano: una carta que no se envía, un solo cajón, veinte minutos marcados. Hoy el cielo coincide con algunos de ellos.',

    'rituais.today.title': 'Rituales de hoy',
    'rituais.today.sky': '{emoji} {fase} · {dia}, día de {planeta}',
    'rituais.today.dayOnly': '{dia}, día de {planeta}',
    'rituais.today.skyOff':
      'En este aparato la app no logró calcular la fase de la Luna ahora. Quedan solo los rituales que piden el día de la semana — eso es cuenta de calendario y sigue valiendo. Nada fue inventado para llenar la lista.',
    'rituais.today.exactTitle': 'Coinciden la fase y el día',
    'rituais.today.empty':
      'Hoy ningún ritual coincide con la fase y el día a la vez. Elige por objetivo aquí abajo — todos siguen a mano.',
    'rituais.today.partialTitle': 'Coinciden en parte',
    'rituais.today.partialHint':
      'Estos coinciden en un solo criterio: o la fase, o el día. En cada uno va escrito cuál fue.',
    'rituais.match': 'Coincide con hoy: {motivo}',

    'rituais.fase.luaNova': 'Luna Nueva',
    'rituais.fase.luaCrescente': 'Luna Creciente',
    'rituais.fase.quartoCrescente': 'Cuarto Creciente',
    'rituais.fase.gibosaCrescente': 'Luna Gibosa Creciente',
    'rituais.fase.luaCheia': 'Luna Llena',
    'rituais.fase.gibosaMinguante': 'Luna Gibosa Menguante',
    'rituais.fase.quartoMinguante': 'Cuarto Menguante',
    'rituais.fase.luaMinguante': 'Luna Menguante',
    'rituais.dia.0': 'domingo',
    'rituais.dia.1': 'lunes',
    'rituais.dia.2': 'martes',
    'rituais.dia.3': 'miércoles',
    'rituais.dia.4': 'jueves',
    'rituais.dia.5': 'viernes',
    'rituais.dia.6': 'sábado',
    'rituais.planeta.sol': 'Sol',
    'rituais.planeta.lua': 'Luna',
    'rituais.planeta.marte': 'Marte',
    'rituais.planeta.mercurio': 'Mercurio',
    'rituais.planeta.jupiter': 'Júpiter',
    'rituais.planeta.venus': 'Venus',
    'rituais.planeta.saturno': 'Saturno',
    'rituais.momento.ou': 'o',
    'rituais.cat.amor': 'Amor',
    'rituais.cat.amor.desc': 'Lo que sientes y lo que haces con eso — nunca lo que la otra persona debería hacer.',
    'rituais.cat.prosperidade': 'Prosperidad',
    'rituais.cat.prosperidade.desc': 'Mirar el dinero de frente, anotar, organizar. Lo que cambia es la claridad, no el saldo.',
    'rituais.cat.protecao': 'Protección',
    'rituais.cat.protecao.desc': 'Gestos concretos de cuidado con la casa, con lo acordado y con el propio límite.',
    'rituais.cat.limpeza': 'Limpieza',
    'rituais.cat.limpeza.desc': 'Cerrar, vaciar, soltar. Es trabajo de mano, y la Luna menguante es la fase que más aparece escrita en las fuentes antiguas.',
    'rituais.cat.coragem': 'Coraje',
    'rituais.cat.coragem.desc': 'La llamada aplazada, la conversación difícil, la fecha marcada. Enfrentar tiene su paso a paso.',
    'rituais.cat.foco': 'Foco',
    'rituais.cat.foco.desc': 'Elegir una sola cosa y quitar el resto de en medio, por un tiempo medido.',
    'rituais.cat.autoestima': 'Autoestima',
    'rituais.cat.autoestima.desc': 'Inventario de lo que hiciste de verdad — comprobable, no elogio genérico.',

    'rituais.categories.title': 'Por objetivo',
    'rituais.categories.hint': 'Siete objetivos. Toca uno para ver la lista.',
    'rituais.category.count': '{n} rituales en esta lista',
    'rituais.card.momento': 'Momento ideal: {momento}',

    'rituais.field.intencao': 'INTENCIÓN',
    'rituais.field.materiais': 'MATERIALES',
    'rituais.field.passos': 'PASO A PASO',
    'rituais.field.momento': 'MOMENTO IDEAL',
    'rituais.field.cuidados': 'CUIDADOS Y ÉTICA',
    'rituais.detail.sources': 'De dónde viene — obra, autor, siglo',
    'rituais.detail.noSource': 'Lo que aquí no tiene fuente antigua',
    'rituais.detail.noSourceHint':
      'La parte que el mercado vende como milenaria y que la investigación de esta app no encontró en ninguna fuente antigua. Queda escrito, en vez de escondido.',
    'rituais.detail.back': 'Volver a la lista',
    'rituais.lastro.title': 'De dónde sale el "momento ideal"',

    'rituais.share.cta': 'Compartir por WhatsApp',
    'rituais.share.line1': '{titulo} — ritual de {categoria}, del Cosmic Guide.',
    'rituais.share.line2': 'Momento ideal: {momento}.',
    'rituais.share.copied': 'Texto copiado. Solo falta pegarlo en WhatsApp.',
    'rituais.share.failed':
      'Este navegador no dejó copiar. Selecciona el texto del ritual y cópialo a mano.',

    'rituais.lock.badge': 'suscripción',
    'rituais.paywall.firstFree':
      'El primer ritual que abras queda abierto para siempre en este aparato — un ritual no se lee, se hace, y varios duran días. Los demás vienen con la suscripción.',
    'rituais.paywall.used':
      'El ritual que quedó tuyo es "{titulo}" — ese abre siempre. Los demás vienen con la suscripción.',

    'rituais.expand': 'abrir',
    'rituais.collapse': 'cerrar',
  },
  en: {
    'rituais.title': 'Rituals',
    'rituais.subtitle': 'Things to do with your hands',
    'rituais.intro': 'Twenty-one rituals you do with your hands: a letter you never send, one drawer, twenty minutes on the clock. Today the sky matches a few of them.',

    'rituais.today.title': 'Today’s rituals',
    'rituais.today.sky': '{emoji} {fase} · {dia}, day of {planeta}',
    'rituais.today.dayOnly': '{dia}, day of {planeta}',
    'rituais.today.skyOff':
      'On this device the app could not work out the Moon phase right now. Only the rituals that ask for the day of the week are left — that is calendar arithmetic and still holds. Nothing was made up to fill the list.',
    'rituais.today.exactTitle': 'Phase and day both match',
    'rituais.today.empty':
      'No ritual matches the phase and the day at the same time today. Pick one by goal below — all of them are still here.',
    'rituais.today.partialTitle': 'A partial match',
    'rituais.today.partialHint':
      'These match one criterion only: either the phase or the day. Each one says which.',
    'rituais.match': 'Matches today: {motivo}',

    'rituais.fase.luaNova': 'New Moon',
    'rituais.fase.luaCrescente': 'Waxing Crescent',
    'rituais.fase.quartoCrescente': 'First Quarter',
    'rituais.fase.gibosaCrescente': 'Waxing Gibbous',
    'rituais.fase.luaCheia': 'Full Moon',
    'rituais.fase.gibosaMinguante': 'Waning Gibbous',
    'rituais.fase.quartoMinguante': 'Last Quarter',
    'rituais.fase.luaMinguante': 'Waning Crescent',
    'rituais.dia.0': 'Sunday',
    'rituais.dia.1': 'Monday',
    'rituais.dia.2': 'Tuesday',
    'rituais.dia.3': 'Wednesday',
    'rituais.dia.4': 'Thursday',
    'rituais.dia.5': 'Friday',
    'rituais.dia.6': 'Saturday',
    'rituais.planeta.sol': 'the Sun',
    'rituais.planeta.lua': 'the Moon',
    'rituais.planeta.marte': 'Mars',
    'rituais.planeta.mercurio': 'Mercury',
    'rituais.planeta.jupiter': 'Jupiter',
    'rituais.planeta.venus': 'Venus',
    'rituais.planeta.saturno': 'Saturn',
    'rituais.momento.ou': 'or',
    'rituais.cat.amor': 'Love',
    'rituais.cat.amor.desc': 'What you feel and what you do with it — never what the other person ought to do.',
    'rituais.cat.prosperidade': 'Prosperity',
    'rituais.cat.prosperidade.desc': 'Looking at the money head-on, writing it down, sorting it out. What changes is the clarity, not the balance.',
    'rituais.cat.protecao': 'Protection',
    'rituais.cat.protecao.desc': 'Concrete acts of care for the house, for what was agreed, and for your own limit.',
    'rituais.cat.limpeza': 'Clearing out',
    'rituais.cat.limpeza.desc': 'Closing, emptying, letting go. It is handwork, and the waning Moon is the phase that shows up most often in the ancient sources.',
    'rituais.cat.coragem': 'Courage',
    'rituais.cat.coragem.desc': 'The postponed phone call, the hard conversation, the date on the calendar. Facing things has a step by step.',
    'rituais.cat.foco': 'Focus',
    'rituais.cat.foco.desc': 'Picking one thing only and moving the rest out of the way, for a measured stretch of time.',
    'rituais.cat.autoestima': 'Self-esteem',
    'rituais.cat.autoestima.desc': 'An inventory of what you actually did — checkable, not generic praise.',

    'rituais.categories.title': 'By goal',
    'rituais.categories.hint': 'Seven goals. Tap one to see the list.',
    'rituais.category.count': '{n} rituals in this list',
    'rituais.card.momento': 'Best moment: {momento}',

    'rituais.field.intencao': 'INTENTION',
    'rituais.field.materiais': 'MATERIALS',
    'rituais.field.passos': 'STEP BY STEP',
    'rituais.field.momento': 'BEST MOMENT',
    'rituais.field.cuidados': 'CARE AND ETHICS',
    'rituais.detail.sources': 'Where it comes from — work, author, century',
    'rituais.detail.noSource': 'What here has no ancient source',
    'rituais.detail.noSourceHint':
      'The part the market sells as ancient and that this app’s research found in no ancient source at all. It is written down instead of hidden.',
    'rituais.detail.back': 'Back to the list',
    'rituais.lastro.title': 'Where "best moment" comes from',

    'rituais.share.cta': 'Share on WhatsApp',
    'rituais.share.line1': '{titulo} — a {categoria} ritual, from Cosmic Guide.',
    'rituais.share.line2': 'Best moment: {momento}.',
    'rituais.share.copied': 'Text copied. Just paste it into WhatsApp.',
    'rituais.share.failed':
      'This browser would not let us copy. Select the ritual text and copy it by hand.',

    'rituais.lock.badge': 'subscription',
    'rituais.paywall.firstFree':
      'The first ritual you open stays open forever on this device — a ritual is not read, it is done, and several of them run for days. The others come with the subscription.',
    'rituais.paywall.used':
      'The ritual that became yours is "{titulo}" — that one always opens. The others come with the subscription.',

    'rituais.expand': 'open',
    'rituais.collapse': 'close',
  },
};
Object.assign(PT, RITUAIS_I18N.pt);
Object.assign(ES, RITUAIS_I18N.es);
Object.assign(EN, RITUAIS_I18N.en);

// ===========================================================================
// A JORNADA GUIADA — a moldura de screens/JornadaScreen.js
// ===========================================================================
// Mesmo padrão de GROUNDING_I18N e SINASTRIA_I18N: bloco no fim, aplicado por
// Object.assign sobre PT/ES/EN. DICTS guarda REFERÊNCIAS a esses três objetos,
// então assinar depois da definição de DICTS funciona igual — translate() lê no
// momento da chamada.
//
// O QUE ENTRA AQUI E O QUE NÃO ENTRA. Só a moldura da tela: rótulo, botão,
// estado. O CONTEÚDO das quatro trilhas (título, leitura, pergunta de diário,
// ação, nome e legenda das medalhas) mora em lib/jornada.js e continua em
// português nos três idiomas — é o gap declarado no TODO(i18n) do topo daquele
// arquivo, e é declarado justamente porque migrar aquelas 28 leituras exige
// levar junto a varredura de test/jornada.test.js para os três idiomas. Uma
// alegação de saúde em espanhol não é menos ilegal por estar em espanhol.
//
// TODAS AS CHAVES SÃO LITERAIS, nenhuma é montada em runtime. É de propósito: o
// cabeçalho de test/i18nKeysExist.test.js recusa registrar o prefixo `jornada.`
// como dinâmico ("registrar prefixo de família que ainda não nasceu é abrir
// buraco antes da hora"). Com chave literal, a varredura estática confere a
// família inteira sozinha, e nenhuma exceção precisa existir.
//
// A RÉGUA DE ESCRITA É A MESMA DO CONTEÚDO, e ela vale aqui mesmo sem varredura
// automática: nada de efeito sobre corpo ou mente, nada de promessa de
// resultado, nada de estatística sobre outros usuários. Repare no que as duas
// frases mais delicadas fazem:
//   · 'jornada.esperaAmanha' não diz "bloqueado" nem "você falhou" — diz QUANDO
//     o próximo passo abre. É informação, e informação não é castigo;
//   · 'jornada.umPorDia' termina em "nenhum dia se perde", que não é consolo
//     inventado: normalizarProgresso() guarda o prefixo dos dias concluídos e
//     nada nele expira com o tempo. A frase é descrição do motor.
const JORNADA_I18N = {
  pt: {
    'jornada.title': 'Jornada Guiada',
    'jornada.subtitle': 'Sete dias por trilha. Um por dia.',
    // Abre na vida real ("aquele assunto que você jura que já sabe"), fecha na
    // fonte. É a mesma ordem que test/jornada.test.js cobra das 28 leituras.
    'jornada.intro':
      'Aquele assunto que você jura que já sabe — a Lua, o seu mapa, as cartas — em sete conversas curtas, uma por dia. A fonte vem no fim de cada uma, com obra, autor e século.',
    'jornada.resumo': '{feitas} de {total} trilhas inteiras',
    'jornada.trilhas.title': 'As trilhas',
    'jornada.trilha.progresso': '{feitos} de {total} dias',
    'jornada.trilha.comecar': 'Começar',
    'jornada.trilha.continuar': 'Continuar no dia {dia}',
    'jornada.trilha.rever': 'Reler',
    'jornada.trilha.concluida': 'Trilha inteira',
    'jornada.trilha.travada': 'Entra com a assinatura',
    'jornada.trilha.a11y': '{nome} — {feitos} de {total} dias',
    'jornada.voltar': 'Todas as trilhas',
    'jornada.hoje.kicker': 'O passo de hoje',
    'jornada.dia': 'Dia {dia} de {total}',
    'jornada.recibo': 'De onde vem isso',
    'jornada.pergunta': 'Pergunta pro seu diário',
    'jornada.pergunta.hint':
      'Responda de cabeça ou escreva no Diário Cósmico — as duas valem.',
    // Os seis rótulos de FEATURES (lib/jornada.js seção 2). São NOME DE TELA do
    // próprio app, não citação — e entram interpolados em 'jornada.acao.abrir',
    // que já era traduzida. Sem isto, o botão em inglês lia "Open Diário
    // Cósmico".
    'jornada.feature.taro': 'Tarô',
    'jornada.feature.mapa': 'Mapa Natal',
    'jornada.feature.calendarioLunar': 'Calendário Lunar',
    'jornada.feature.som': 'Som do Céu',
    'jornada.feature.aterramento': 'Assentar',
    'jornada.feature.diario': 'Diário Cósmico',
    'jornada.acao': 'A ação de hoje',
    'jornada.acao.abrir': 'Abrir {feature}',
    'jornada.acao.som': 'O Som do Céu é este controle aqui — é só dar o play.',
    'jornada.concluir': 'Concluir o dia {dia}',
    'jornada.feito': 'Dia {dia} fechado.',
    'jornada.esperaAmanha': 'Você já fechou um dia hoje. O dia {dia} abre amanhã.',
    'jornada.umPorDia': 'Um passo por dia. A trilha espera por você — nenhum dia se perde.',
    'jornada.erro': 'Não deu pra gravar agora. Toque de novo.',
    'jornada.anteriores': 'Dias que você já fechou',
    'jornada.anteriores.rever': 'reler',
    'jornada.futuros': 'O que vem pela frente',
    'jornada.futuros.dia': 'Dia {dia}',
    'jornada.futuros.hint': 'Um por dia, na ordem — cada um abre quando o anterior fecha.',
    'jornada.concluida.title': 'Trilha inteira, do dia 1 ao dia 7.',
    'jornada.concluida.body': 'Os sete dias ficam aqui pra reler quando quiser.',
    'jornada.refazer': 'Refazer do começo',
    'jornada.medalhas': 'Medalhas desta trilha',
    'jornada.medalhas.vazio': 'A primeira aparece quando você fechar o dia 1.',
    'jornada.medalhas.proxima': 'Próxima: {nome}',
    'jornada.medalhas.faltamUm': 'falta 1 dia',
    'jornada.medalhas.faltam': 'faltam {n} dias',
    'jornada.medalhaNova': 'Medalha nova',
    'jornada.medalhasJornada': 'Medalhas da Jornada inteira',
    'jornada.medalhasJornada.vazio': 'Aparecem quando você fechar trilhas inteiras.',
    'jornada.medalhasJornada.proxima': 'Próxima: {nome}',
    'jornada.medalhasJornada.faltamUma': 'falta 1 trilha inteira',
    'jornada.medalhasJornada.faltam': 'faltam {n} trilhas inteiras',
  },
  es: {
    'jornada.title': 'Camino Guiado',
    'jornada.subtitle': 'Siete días por sendero. Uno por día.',
    'jornada.intro':
      'Ese tema que juras que ya sabes — la Luna, tu carta, las cartas del tarot — en siete conversaciones cortas, una por día. La fuente llega al final de cada una, con obra, autor y siglo.',
    'jornada.resumo': '{feitas} de {total} senderos enteros',
    'jornada.trilhas.title': 'Los senderos',
    'jornada.trilha.progresso': '{feitos} de {total} días',
    'jornada.trilha.comecar': 'Empezar',
    'jornada.trilha.continuar': 'Seguir en el día {dia}',
    'jornada.trilha.rever': 'Releer',
    'jornada.trilha.concluida': 'Sendero entero',
    'jornada.trilha.travada': 'Entra con la suscripción',
    'jornada.trilha.a11y': '{nome} — {feitos} de {total} días',
    'jornada.voltar': 'Todos los senderos',
    'jornada.hoje.kicker': 'El paso de hoy',
    'jornada.dia': 'Día {dia} de {total}',
    'jornada.recibo': 'De dónde viene esto',
    'jornada.pergunta': 'Pregunta para tu diario',
    'jornada.pergunta.hint':
      'Contéstala de cabeza o escríbela en el Diario Cósmico — las dos valen.',
    'jornada.feature.taro': 'Tarot',
    'jornada.feature.mapa': 'Carta Natal',
    'jornada.feature.calendarioLunar': 'Calendario Lunar',
    'jornada.feature.som': 'Sonido del Cielo',
    'jornada.feature.aterramento': 'Asentar',
    'jornada.feature.diario': 'Diario Cósmico',
    'jornada.acao': 'La acción de hoy',
    'jornada.acao.abrir': 'Abrir {feature}',
    'jornada.acao.som': 'El Sonido del Cielo es este control de aquí — solo dale al play.',
    'jornada.concluir': 'Cerrar el día {dia}',
    'jornada.feito': 'Día {dia} cerrado.',
    'jornada.esperaAmanha': 'Ya cerraste un día hoy. El día {dia} abre mañana.',
    'jornada.umPorDia': 'Un paso por día. El sendero te espera — ningún día se pierde.',
    'jornada.erro': 'No se pudo guardar ahora. Tócalo de nuevo.',
    'jornada.anteriores': 'Días que ya cerraste',
    'jornada.anteriores.rever': 'releer',
    'jornada.futuros': 'Lo que viene por delante',
    'jornada.futuros.dia': 'Día {dia}',
    'jornada.futuros.hint': 'Uno por día, en orden — cada uno abre cuando se cierra el anterior.',
    'jornada.concluida.title': 'Sendero entero, del día 1 al día 7.',
    'jornada.concluida.body': 'Los siete días quedan aquí para releerlos cuando quieras.',
    'jornada.refazer': 'Rehacer desde el principio',
    'jornada.medalhas': 'Medallas de este sendero',
    'jornada.medalhas.vazio': 'La primera aparece cuando cierres el día 1.',
    'jornada.medalhas.proxima': 'Siguiente: {nome}',
    'jornada.medalhas.faltamUm': 'falta 1 día',
    'jornada.medalhas.faltam': 'faltan {n} días',
    'jornada.medalhaNova': 'Medalla nueva',
    'jornada.medalhasJornada': 'Medallas del Camino entero',
    'jornada.medalhasJornada.vazio': 'Aparecen cuando cierres senderos enteros.',
    'jornada.medalhasJornada.proxima': 'Siguiente: {nome}',
    'jornada.medalhasJornada.faltamUma': 'falta 1 sendero entero',
    'jornada.medalhasJornada.faltam': 'faltan {n} senderos enteros',
  },
  en: {
    'jornada.title': 'Guided Journey',
    'jornada.subtitle': 'Seven days per trail. One a day.',
    'jornada.intro':
      'That subject you swear you already know — the Moon, your chart, the cards — in seven short conversations, one a day. The source comes at the end of each one, with work, author and century.',
    'jornada.resumo': '{feitas} of {total} whole trails',
    'jornada.trilhas.title': 'The trails',
    'jornada.trilha.progresso': '{feitos} of {total} days',
    'jornada.trilha.comecar': 'Start',
    'jornada.trilha.continuar': 'Continue on day {dia}',
    'jornada.trilha.rever': 'Read again',
    'jornada.trilha.concluida': 'Whole trail',
    'jornada.trilha.travada': 'Comes with the subscription',
    'jornada.trilha.a11y': '{nome} — {feitos} of {total} days',
    'jornada.voltar': 'All trails',
    'jornada.hoje.kicker': 'Today’s step',
    'jornada.dia': 'Day {dia} of {total}',
    'jornada.recibo': 'Where this comes from',
    'jornada.pergunta': 'A question for your diary',
    'jornada.pergunta.hint':
      'Answer it in your head or write it in the Cosmic Diary — both count.',
    'jornada.feature.taro': 'Tarot',
    'jornada.feature.mapa': 'Birth Chart',
    'jornada.feature.calendarioLunar': 'Moon Calendar',
    'jornada.feature.som': 'Sound of the Sky',
    'jornada.feature.aterramento': 'Grounding',
    'jornada.feature.diario': 'Cosmic Diary',
    'jornada.acao': 'Today’s action',
    'jornada.acao.abrir': 'Open {feature}',
    'jornada.acao.som': 'Sound of the Sky is this control right here — just hit play.',
    'jornada.concluir': 'Close day {dia}',
    'jornada.feito': 'Day {dia} closed.',
    'jornada.esperaAmanha': 'You already closed a day today. Day {dia} opens tomorrow.',
    'jornada.umPorDia': 'One step a day. The trail waits for you — no day is lost.',
    'jornada.erro': 'It could not be saved right now. Tap again.',
    'jornada.anteriores': 'Days you have closed',
    'jornada.anteriores.rever': 'read again',
    'jornada.futuros': 'What comes next',
    'jornada.futuros.dia': 'Day {dia}',
    'jornada.futuros.hint': 'One a day, in order — each opens when the one before it closes.',
    'jornada.concluida.title': 'The whole trail, from day 1 to day 7.',
    'jornada.concluida.body': 'The seven days stay here to read again whenever you want.',
    'jornada.refazer': 'Start it over',
    'jornada.medalhas': 'Medals from this trail',
    'jornada.medalhas.vazio': 'The first one shows up when you close day 1.',
    'jornada.medalhas.proxima': 'Next: {nome}',
    'jornada.medalhas.faltamUm': '1 day to go',
    'jornada.medalhas.faltam': '{n} days to go',
    'jornada.medalhaNova': 'New medal',
    'jornada.medalhasJornada': 'Medals for the whole Journey',
    'jornada.medalhasJornada.vazio': 'They show up when you close whole trails.',
    'jornada.medalhasJornada.proxima': 'Next: {nome}',
    'jornada.medalhasJornada.faltamUma': '1 whole trail to go',
    'jornada.medalhasJornada.faltam': '{n} whole trails to go',
  },
};
Object.assign(PT, JORNADA_I18N.pt);
Object.assign(ES, JORNADA_I18N.es);
Object.assign(EN, JORNADA_I18N.en);

// ===========================================================================
// CALENDÁRIO CÓSMICO — a grade do mês com as datas reais do céu.
// ===========================================================================
// Mesmo padrão dos blocos acima (GROUNDING_I18N, SINASTRIA_I18N): bloco no fim
// do arquivo, aplicado por Object.assign sobre PT/ES/EN. DICTS guarda
// REFERÊNCIAS a esses três objetos, então assinar depois da definição de DICTS
// funciona igual — translate() lê no momento da chamada.
//
// O QUE ESTÁ AQUI E O QUE NÃO ESTÁ. Só o que a TELA escreve: cabeçalho,
// navegação de mês, nomes de mês e de dia da semana, rótulos da grade, a
// temporada corrente e a oferta. O CONTEÚDO dos eventos (título, parágrafo,
// fonte, bloco de tradição, aviso de idade) nasce em lib/calendarioCosmico.js e
// continua em português nos três idiomas — é o gap CONHECIDO e declarado no
// cabeçalho daquele arquivo e no topo deste, igual ao de lib/synastry.js. O
// cabeçalho do motor descreve a migração dessas strings para um prefixo próprio
// como PLANO, e test/i18nKeysExist.test.js recusa de propósito registrar um
// prefixo dinâmico de família que ainda não nasceu.
//
// NOMES DE MÊS E DE DIA DA SEMANA EM CHAVE, e não em toLocaleDateString: o
// idioma do app é escolhido no LanguageContext (?lang=, storage, navegador) e
// NÃO é o locale do aparelho. screens/LunarCalendarScreen.js ainda formata com
// 'pt-BR' cravado — o que dá o mês em português mesmo com o app em inglês. A
// tela nova não repete isso.
//
// SEM AVISO DEFENSIVO. Não existe aqui "não garante resultados" nem "sem
// promessa de efeito" — o dono mandou tirar todos em 31/07/2026, e um
// calendário de efeméride não precisa se desculpar por dizer que dia 29 tem
// Lua Cheia. O que existe é o contrário disso: 'calendario.unavailable.title',
// que assume em voz alta quando a conta não saiu, em vez de encher a lista.
const CALENDARIO_COSMICO_I18N = {
  pt: {
    'calendario.title': 'Calendário Cósmico',
    'calendario.subtitle': 'As datas de verdade deste mês',
    // A frase humana em PRIMEIRO, a mecânica celeste como explicação — o intro
    // abria com três cláusulas de mecânica e só chegava na vida real na segunda
    // frase, com o gancho enterrado. O modelo certo estava logo abaixo, na
    // mesma tela: 'calendario.season.note'.
    'calendario.intro': 'Você descobre que teve Lua Cheia quando alguém comenta no dia seguinte. Ninguém avisa — e num mês qualquer são só umas poucas datas em que o céu de fato faz alguma coisa: a Lua fecha o ciclo, o Sol troca de signo, um planeta para e volta a andar. Aqui está o mês inteiro, com dia e hora.',
    'calendario.monthLabel': '{mes} de {ano}',
    'calendario.prevMonth': 'Mês anterior',
    'calendario.nextMonth': 'Próximo mês',
    'calendario.backToToday': 'Voltar pra hoje',
    'calendario.mes.1': 'Janeiro',
    'calendario.mes.2': 'Fevereiro',
    'calendario.mes.3': 'Março',
    'calendario.mes.4': 'Abril',
    'calendario.mes.5': 'Maio',
    'calendario.mes.6': 'Junho',
    'calendario.mes.7': 'Julho',
    'calendario.mes.8': 'Agosto',
    'calendario.mes.9': 'Setembro',
    'calendario.mes.10': 'Outubro',
    'calendario.mes.11': 'Novembro',
    'calendario.mes.12': 'Dezembro',
    'calendario.weekday.0': 'Dom',
    'calendario.weekday.1': 'Seg',
    'calendario.weekday.2': 'Ter',
    'calendario.weekday.3': 'Qua',
    'calendario.weekday.4': 'Qui',
    'calendario.weekday.5': 'Sex',
    'calendario.weekday.6': 'Sáb',
    'calendario.legend.event': 'dia com data marcada',
    'calendario.legend.today': 'hoje',
    'calendario.a11y.dayEmpty': 'Dia {dia}, sem nada marcado',
    'calendario.a11y.dayEvents_one': 'Dia {dia}, 1 data marcada',
    'calendario.a11y.dayEvents_other': 'Dia {dia}, {n} datas marcadas',
    'calendario.list.title': 'O mês inteiro, em ordem',
    'calendario.list.count_one': '1 data neste mês',
    'calendario.list.count_other': '{n} datas neste mês',
    'calendario.list.empty': 'Este mês não trouxe data nenhuma — e é isso que está escrito aqui, em vez de encher a lista com qualquer coisa.',
    'calendario.unavailable.title': 'Este mês não foi calculado',
    // As duas razões que o motor devolve. São ERRO DE UI, não conteúdo
    // histórico — por isso viraram chave antes do resto de
    // lib/calendarioCosmico.js.
    'calendario.unavailable.outOfRange': 'Este mês está fora do intervalo que o app calcula.',
    'calendario.unavailable.noEphemeris': 'Hoje não deu pra calcular o céu deste mês. A gente prefere deixar vazio a chutar data.',
    'calendario.event.dateTime': '{data} · {hora}',
    'calendario.event.dayPrecision': 'Deste marco a conta acerta o dia, não a hora — por isso não tem horário ao lado.',
    // RÓTULO de UI, não citação. Ele era a constante MARCA_RECIBO do motor
    // fazendo dois trabalhos ao mesmo tempo — sentinela de corte E texto
    // visível —, e aparecia em português no meio de uma tela em inglês. O
    // sentinela continua lá, sem tradução; o que a pessoa lê é isto.
    'calendario.event.receiptMark': 'Quem escreveu isso:',
    'calendario.event.sourceToggle': 'De onde vem isso',
    'calendario.event.traditionLabel': 'O que faziam com isso',
    'calendario.event.ageLabel': 'O que dizem por aí',
    'calendario.season.kicker': 'Onde o Sol está agora',
    'calendario.season.title': 'Temporada de {signo}',
    'calendario.season.startedAt': 'Começou em {data}, quando o Sol saiu de {anterior}.',
    'calendario.season.endsAt': 'Vai até {data}, quando o Sol entra em {proximo}.',
    'calendario.season.note': 'A gente ouve "temporada de Leão" o ano inteiro e ninguém diz o que é. É isto: o pedaço do ano em que o Sol atravessa aqueles 30° do círculo do zodíaco. A data de entrada muda de ano pra ano porque é um instante medido, não uma casinha fixa do calendário — e sai da mesma conta que marca o ingresso na lista aqui embaixo.',
    'calendario.gate.title': 'Os outros meses abrem com a assinatura',
    'calendario.gate.text': 'O mês que você está vivendo fica sempre aberto, sem contador nenhum. Andar pra frente e pra trás — ver em que dia cai a Lua Cheia de dezembro, conferir o mês do aniversário de alguém — vem junto da assinatura.',
    'calendario.gate.cta': 'Ver a assinatura',
  },
  es: {
    'calendario.title': 'Calendario Cósmico',
    'calendario.subtitle': 'Las fechas de verdad de este mes',
    'calendario.intro': 'Te enteras de que hubo Luna Llena cuando alguien lo comenta al día siguiente. Nadie avisa — y en un mes cualquiera son solo unas pocas fechas en que el cielo de verdad hace algo: la Luna cierra el ciclo, el Sol cambia de signo, un planeta se detiene y vuelve a andar. Aquí está el mes entero, con día y hora.',
    'calendario.monthLabel': '{mes} de {ano}',
    'calendario.prevMonth': 'Mes anterior',
    'calendario.nextMonth': 'Mes siguiente',
    'calendario.backToToday': 'Volver a hoy',
    'calendario.mes.1': 'Enero',
    'calendario.mes.2': 'Febrero',
    'calendario.mes.3': 'Marzo',
    'calendario.mes.4': 'Abril',
    'calendario.mes.5': 'Mayo',
    'calendario.mes.6': 'Junio',
    'calendario.mes.7': 'Julio',
    'calendario.mes.8': 'Agosto',
    'calendario.mes.9': 'Septiembre',
    'calendario.mes.10': 'Octubre',
    'calendario.mes.11': 'Noviembre',
    'calendario.mes.12': 'Diciembre',
    'calendario.weekday.0': 'Dom',
    'calendario.weekday.1': 'Lun',
    'calendario.weekday.2': 'Mar',
    'calendario.weekday.3': 'Mié',
    'calendario.weekday.4': 'Jue',
    'calendario.weekday.5': 'Vie',
    'calendario.weekday.6': 'Sáb',
    'calendario.legend.event': 'día con fecha marcada',
    'calendario.legend.today': 'hoy',
    'calendario.a11y.dayEmpty': 'Día {dia}, sin nada marcado',
    'calendario.a11y.dayEvents_one': 'Día {dia}, 1 fecha marcada',
    'calendario.a11y.dayEvents_other': 'Día {dia}, {n} fechas marcadas',
    'calendario.list.title': 'El mes entero, en orden',
    'calendario.list.count_one': '1 fecha en este mes',
    'calendario.list.count_other': '{n} fechas en este mes',
    'calendario.list.empty': 'Este mes no trajo ninguna fecha — y es eso lo que dice aquí, en vez de llenar la lista con cualquier cosa.',
    'calendario.unavailable.title': 'Este mes no fue calculado',
    'calendario.unavailable.outOfRange': 'Este mes está fuera del intervalo que la app calcula.',
    'calendario.unavailable.noEphemeris': 'Hoy no se pudo calcular el cielo de este mes. Preferimos dejarlo vacío a inventar una fecha.',
    'calendario.event.dateTime': '{data} · {hora}',
    'calendario.event.dayPrecision': 'De este hito la cuenta acierta el día, no la hora — por eso no lleva horario al lado.',
    'calendario.event.receiptMark': 'Quién escribió esto:',
    'calendario.event.sourceToggle': 'De dónde viene esto',
    'calendario.event.traditionLabel': 'Qué hacían con esto',
    'calendario.event.ageLabel': 'Lo que se dice por ahí',
    'calendario.season.kicker': 'Dónde está el Sol ahora',
    'calendario.season.title': 'Temporada de {signo}',
    'calendario.season.startedAt': 'Empezó el {data}, cuando el Sol salió de {anterior}.',
    'calendario.season.endsAt': 'Va hasta el {data}, cuando el Sol entra en {proximo}.',
    'calendario.season.note': 'Uno oye "temporada de Leo" todo el año y nadie dice qué es. Es esto: el pedazo del año en que el Sol atraviesa esos 30° del círculo del zodíaco. La fecha de entrada cambia de un año a otro porque es un instante medido, no una casilla fija del calendario — y sale de la misma cuenta que marca el ingreso en la lista de aquí abajo.',
    'calendario.gate.title': 'Los demás meses abren con la suscripción',
    'calendario.gate.text': 'El mes que estás viviendo queda siempre abierto, sin contador alguno. Andar hacia adelante y hacia atrás — ver qué día cae la Luna Llena de diciembre, mirar el mes del cumpleaños de alguien — viene con la suscripción.',
    'calendario.gate.cta': 'Ver la suscripción',
  },
  en: {
    'calendario.title': 'Cosmic Calendar',
    'calendario.subtitle': 'The real dates in this month',
    'calendario.intro': 'You find out there was a Full Moon when somebody mentions it the next day. Nobody tells you — and in any given month there are only a few dates when the sky actually does something: the Moon closes its cycle, the Sun changes sign, a planet stops and turns around. Here is the whole month, with day and time.',
    'calendario.monthLabel': '{mes} {ano}',
    'calendario.prevMonth': 'Previous month',
    'calendario.nextMonth': 'Next month',
    'calendario.backToToday': 'Back to today',
    'calendario.mes.1': 'January',
    'calendario.mes.2': 'February',
    'calendario.mes.3': 'March',
    'calendario.mes.4': 'April',
    'calendario.mes.5': 'May',
    'calendario.mes.6': 'June',
    'calendario.mes.7': 'July',
    'calendario.mes.8': 'August',
    'calendario.mes.9': 'September',
    'calendario.mes.10': 'October',
    'calendario.mes.11': 'November',
    'calendario.mes.12': 'December',
    'calendario.weekday.0': 'Sun',
    'calendario.weekday.1': 'Mon',
    'calendario.weekday.2': 'Tue',
    'calendario.weekday.3': 'Wed',
    'calendario.weekday.4': 'Thu',
    'calendario.weekday.5': 'Fri',
    'calendario.weekday.6': 'Sat',
    'calendario.legend.event': 'day with a marked date',
    'calendario.legend.today': 'today',
    'calendario.a11y.dayEmpty': 'Day {dia}, nothing marked',
    'calendario.a11y.dayEvents_one': 'Day {dia}, 1 marked date',
    'calendario.a11y.dayEvents_other': 'Day {dia}, {n} marked dates',
    'calendario.list.title': 'The whole month, in order',
    'calendario.list.count_one': '1 date this month',
    'calendario.list.count_other': '{n} dates this month',
    'calendario.list.empty': 'This month brought no dates at all — and that is what it says here, instead of padding the list with something.',
    'calendario.unavailable.title': 'This month was not calculated',
    'calendario.unavailable.outOfRange': 'This month is outside the range the app can calculate.',
    'calendario.unavailable.noEphemeris': 'The sky for this month could not be worked out today. We would rather leave it empty than guess a date.',
    'calendario.event.dateTime': '{data} · {hora}',
    'calendario.event.dayPrecision': 'For this one the maths gets the day right, not the hour — which is why there is no time next to it.',
    'calendario.event.receiptMark': 'Who wrote this:',
    'calendario.event.sourceToggle': 'Where this comes from',
    'calendario.event.traditionLabel': 'What they did with it',
    'calendario.event.ageLabel': 'What people say out there',
    'calendario.season.kicker': 'Where the Sun is right now',
    'calendario.season.title': '{signo} season',
    'calendario.season.startedAt': 'It began on {data}, when the Sun left {anterior}.',
    'calendario.season.endsAt': 'It runs until {data}, when the Sun enters {proximo}.',
    'calendario.season.note': 'You hear "Leo season" all year long and nobody says what it is. This is it: the stretch of the year when the Sun crosses those 30° of the zodiac circle. The entry date shifts from year to year because it is a measured instant, not a fixed box on the calendar — and it comes from the same reckoning that marks the ingress in the list below.',
    'calendario.gate.title': 'The other months open with the subscription',
    'calendario.gate.text': 'The month you are living in stays open forever, with no counter at all. Moving back and forth — seeing which day December brings its Full Moon, checking the month of someone’s birthday — comes with the subscription.',
    'calendario.gate.cta': 'See the subscription',
  },
};
Object.assign(PT, CALENDARIO_COSMICO_I18N.pt);
Object.assign(ES, CALENDARIO_COSMICO_I18N.es);
Object.assign(EN, CALENDARIO_COSMICO_I18N.en);

// ===========================================================================
// AS ENTRADAS DAS TRÊS TELAS NOVAS NA HOME (Rituais, Jornada, Calendário)
// ===========================================================================
// Mesmo padrão dos blocos acima (GROUNDING_I18N, SINASTRIA_I18N): bloco no fim
// do arquivo, aplicado por Object.assign sobre PT/ES/EN. DICTS guarda
// REFERÊNCIAS a esses três objetos, então assinar depois da definição de DICTS
// funciona igual — translate() lê no momento da chamada.
//
// POR QUE ESTAS CHAVES NÃO ENTRARAM NO BLOCO `home.card.*` LÁ DE CIMA. Elas
// entrariam, e a busca por 'home.card.' ficaria num lugar só — mas o precedente
// do repo é o contrário: 'home.card.zodiacbody.*' mora dentro de
// ZODIAC_BODY_I18N e 'home.card.grounding.*' dentro de GROUNDING_I18N, cada
// feature carregando a própria porta de entrada. Seguir o precedente mantém a
// regra "feature nova = um bloco no fim" válida sem exceção.
//
// TÍTULO IGUAL AO DA TELA, DE PROPÓSITO: 'home.card.rituais.title' repete
// 'rituais.title' palavra por palavra (idem jornada e calendário). Card e
// cabeçalho com nomes diferentes fazem a pessoa achar que abriu a coisa errada.
// O subtítulo é que muda — na tela ele explica, no card ele só cabe.
//
// A LINHA DE HOJE ('home.today.*') é a única exceção que sobe pra cima da Home
// (ver o comentário grande em screens/HomeScreen.js). Repare no que ela NÃO
// diz: nada sobre o que o ritual ou o dia da trilha fazem acontecer. Ela dá o
// NOME do que está aberto hoje e o caminho — "prende primeiro" aqui é o
// concreto do dia, e o recibo (obra, autor, século) mora dentro das telas, que
// é onde ele cabe.
//
// O nome da trilha ({nome}) chega em português nos três idiomas: ele vem de
// lib/jornada.js, que é o gap CONHECIDO e declarado no cabeçalho de lá e no
// topo deste arquivo. A moldura em volta dele é que está traduzida.
const HOME_ENTRADAS_I18N = {
  pt: {
    'home.card.rituais.title': 'Rituais',
    'home.card.rituais.subtitle': 'Pra fazer com a mão',
    'home.card.jornada.title': 'Jornada Guiada',
    'home.card.jornada.subtitle': 'Sete dias, um por dia',
    'home.card.calendario.title': 'Calendário Cósmico',
    'home.card.calendario.subtitle': 'As datas deste mês',

    'home.today.jornada': 'Trilha {nome} · dia {dia} de {total}',
    'home.today.jornada.cta': 'Continuar',
    'home.today.ritual': 'Ritual de hoje: {titulo}',
    'home.today.ritual.cta': 'Ver',
  },
  es: {
    'home.card.rituais.title': 'Rituales',
    'home.card.rituais.subtitle': 'Para hacer con la mano',
    'home.card.jornada.title': 'Camino Guiado',
    'home.card.jornada.subtitle': 'Siete días, uno por día',
    'home.card.calendario.title': 'Calendario Cósmico',
    'home.card.calendario.subtitle': 'Las fechas de este mes',

    'home.today.jornada': 'Sendero {nome} · día {dia} de {total}',
    'home.today.jornada.cta': 'Continuar',
    'home.today.ritual': 'Ritual de hoy: {titulo}',
    'home.today.ritual.cta': 'Ver',
  },
  en: {
    'home.card.rituais.title': 'Rituals',
    'home.card.rituais.subtitle': 'To do with your hands',
    'home.card.jornada.title': 'Guided Journey',
    'home.card.jornada.subtitle': 'Seven days, one a day',
    'home.card.calendario.title': 'Cosmic Calendar',
    'home.card.calendario.subtitle': 'This month\'s dates',

    'home.today.jornada': 'Trail {nome} · day {dia} of {total}',
    'home.today.jornada.cta': 'Continue',
    'home.today.ritual': 'Today\'s ritual: {titulo}',
    'home.today.ritual.cta': 'Open',
  },
};
Object.assign(PT, HOME_ENTRADAS_I18N.pt);
Object.assign(ES, HOME_ENTRADAS_I18N.es);
Object.assign(EN, HOME_ENTRADAS_I18N.en);

// ===========================================================================
// A LEVA DE 31/07/2026 — Mito × Fonte, Como você tá?, Você sabia?, Papel de
// Parede + o filtro de favoritos do Diário
// ===========================================================================
// Mesmo padrão dos blocos acima (HOME_ENTRADAS_I18N): bloco no fim do arquivo,
// aplicado por Object.assign sobre PT/ES/EN — DICTS guarda referências, então
// assinar depois funciona igual.
//
// SÓ CHROME entra aqui. O conteúdo das quatro telas vive em PT dentro dos libs
// (lib/mitos.js, lib/emocoes.js, lib/quizCosmico.js, lib/wallpaper.js) e das
// constantes locais das telas — padrão declarado nos cabeçalhos de cada uma.
// Este bloco registra apenas as portas de entrada na Home (home.card.*, título
// igual ao da tela, de propósito — ver o bloco logo acima) e o rótulo do
// filtro de favoritos que o Diário passou a usar ('diary.filter.fav', ao lado
// dos irmãos diary.filter.* definidos lá em cima).
const LEVA_MITOS_EMOCOES_QUIZ_WALLPAPER_I18N = {
  pt: {
    'home.card.mitos.title': 'Mito × Fonte',
    'home.card.mitos.subtitle': 'O que te contaram × a fonte',
    'home.card.comovoceta.title': 'Como você tá?',
    'home.card.comovoceta.subtitle': 'Diz do seu jeito',
    'home.card.quizcosmico.title': 'Você sabia?',
    'home.card.quizcosmico.subtitle': 'Sete perguntas por dia',
    'home.card.wallpaper.title': 'Papel de Parede',
    'home.card.wallpaper.subtitle': 'O céu de hoje na sua tela',

    'diary.filter.fav': 'Favoritos',
  },
  es: {
    'home.card.mitos.title': 'Mito × Fuente',
    'home.card.mitos.subtitle': 'Lo que te contaron × la fuente',
    'home.card.comovoceta.title': '¿Cómo estás?',
    'home.card.comovoceta.subtitle': 'Dilo a tu manera',
    'home.card.quizcosmico.title': '¿Sabías?',
    'home.card.quizcosmico.subtitle': 'Siete preguntas por día',
    'home.card.wallpaper.title': 'Fondo de pantalla',
    'home.card.wallpaper.subtitle': 'El cielo de hoy en tu pantalla',

    'diary.filter.fav': 'Favoritos',
  },
  en: {
    'home.card.mitos.title': 'Myth × Source',
    'home.card.mitos.subtitle': 'What they told you × the source',
    'home.card.comovoceta.title': 'How are you?',
    'home.card.comovoceta.subtitle': 'Say it your way',
    'home.card.quizcosmico.title': 'Did you know?',
    'home.card.quizcosmico.subtitle': 'Seven questions a day',
    'home.card.wallpaper.title': 'Wallpaper',
    'home.card.wallpaper.subtitle': 'Today\'s sky on your screen',

    'diary.filter.fav': 'Favorites',
  },
};
Object.assign(PT, LEVA_MITOS_EMOCOES_QUIZ_WALLPAPER_I18N.pt);
Object.assign(ES, LEVA_MITOS_EMOCOES_QUIZ_WALLPAPER_I18N.es);
Object.assign(EN, LEVA_MITOS_EMOCOES_QUIZ_WALLPAPER_I18N.en);

// ===========================================================================
// CHROME DA TELA DO TARÔ — os rótulos que sobraram cravados em português
// ===========================================================================
// A auditoria de 01/08/2026 achou a tela do Tarô integralmente portuguesa para
// quem usa o app em espanhol ou inglês: o motor já falava os três idiomas (os
// packs de lib/traducoes/tarot.*), mas o CHROME em volta — título, botões,
// rótulos das casas — era literal cravado no JSX.
//
// O pior deles era `POSITIONS[i]` renderizado cru: POSITIONS é a constante
// ['Passado','Presente','Futuro'] usada como CHAVE do motor, e ela aparecia na
// tela como rótulo. Chave interna virando texto de usuário é o mesmo defeito do
// Diário ('diary.filter.all' aparecendo cru) — por isso as chaves continuam em
// português e ganham tradução SÓ na hora de exibir.
const TAROT_CHROME_I18N = {
  pt: {
    'tarot.title': 'Tarô por Tema',
    'tarot.chooseTheme': 'Escolha um tema',
    'tarot.draw': 'Tirar 3 Cartas',
    'tarot.drawAgain': 'Nova Tiragem',
    'tarot.reversedTag': ' (invertida)',
    'tarot.howToRead': 'Como ler o que saiu',
    'tarot.threeTogether': 'As três juntas',
    'tarot.position.Passado': 'Passado',
    'tarot.position.Presente': 'Presente',
    'tarot.position.Futuro': 'Futuro',
  },
  es: {
    'tarot.title': 'Tarot por Tema',
    'tarot.chooseTheme': 'Elegí un tema',
    'tarot.draw': 'Sacar 3 cartas',
    'tarot.drawAgain': 'Nueva tirada',
    'tarot.reversedTag': ' (invertida)',
    'tarot.howToRead': 'Cómo leer lo que salió',
    'tarot.threeTogether': 'Las tres juntas',
    'tarot.position.Passado': 'Pasado',
    'tarot.position.Presente': 'Presente',
    'tarot.position.Futuro': 'Futuro',
  },
  en: {
    'tarot.title': 'Tarot by Theme',
    'tarot.chooseTheme': 'Pick a theme',
    'tarot.draw': 'Draw 3 cards',
    'tarot.drawAgain': 'New spread',
    'tarot.reversedTag': ' (reversed)',
    'tarot.howToRead': 'How to read what came up',
    'tarot.threeTogether': 'The three together',
    'tarot.position.Passado': 'Past',
    'tarot.position.Presente': 'Present',
    'tarot.position.Futuro': 'Future',
  },
};
Object.assign(PT, TAROT_CHROME_I18N.pt);
Object.assign(ES, TAROT_CHROME_I18N.es);
Object.assign(EN, TAROT_CHROME_I18N.en);

// ===========================================================================
// PAYWALL (components/OneTimeLock.js) — estava 100% em português cru
// ===========================================================================
// Achado da auditoria de 01/08/2026, e ele é caro porque é a tela do DINHEIRO:
// em inglês o muro lia "Guided Journey" no cabeçalho (traduzido, vindo da tela)
// e logo abaixo "Você já usou sua leitura gratuita de Guided Journey" +
// "Assine o Cosmic Guide..." + "Assinar agora". Pior: o OfferSummary no meio
// JÁ era traduzido, então a mesma tela misturava os dois idiomas no momento
// exato em que pede o cartão.
//
// O título recebe {feature}, que vem traduzido da tela que chamou.
const PAYWALL_I18N = {
  pt: {
    'onetimelock.freeUsed.title': 'Você já usou sua leitura gratuita de {feature}',
    'onetimelock.freeUsed.text.couple': 'Assine o Cosmic Guide e continue usando esse e todos os outros recursos sem limite, você e seu par.',
    'onetimelock.freeUsed.text.solo': 'Assine o Cosmic Guide e continue usando esse e todos os outros recursos individuais sem limite.',
    'onetimelock.quota.title': 'Suas leituras gratuitas de {feature} acabaram',
    'onetimelock.quota.text.couple': 'A cota gratuita fica na sua conta, não no aparelho. Assine o Cosmic Guide e continue sem limite, você e seu par.',
    'onetimelock.quota.text.solo': 'A cota gratuita fica na sua conta, não no aparelho. Assine o Cosmic Guide e continue sem limite.',
    'onetimelock.login.title': 'Entre na sua conta para usar {feature}',
    'onetimelock.login.text': 'As leituras com foto pedem uma conta — é grátis, leva menos de um minuto e guarda seu histórico.',
    'onetimelock.cta.subscribe': 'Assinar agora',
    'onetimelock.cta.login': 'Criar conta / entrar',
    'onetimelock.invite': 'ou convide seu par pra assinarem juntos →',
  },
  es: {
    'onetimelock.freeUsed.title': 'Ya usaste tu lectura gratuita de {feature}',
    'onetimelock.freeUsed.text.couple': 'Suscribite a Cosmic Guide y seguí usando esta y todas las demás funciones sin límite, vos y tu pareja.',
    'onetimelock.freeUsed.text.solo': 'Suscribite a Cosmic Guide y seguí usando esta y todas las demás funciones individuales sin límite.',
    'onetimelock.quota.title': 'Se te acabaron las lecturas gratuitas de {feature}',
    'onetimelock.quota.text.couple': 'La cuota gratuita vive en tu cuenta, no en el aparato. Suscribite a Cosmic Guide y seguí sin límite, vos y tu pareja.',
    'onetimelock.quota.text.solo': 'La cuota gratuita vive en tu cuenta, no en el aparato. Suscribite a Cosmic Guide y seguí sin límite.',
    'onetimelock.login.title': 'Entrá a tu cuenta para usar {feature}',
    'onetimelock.login.text': 'Las lecturas con foto piden una cuenta — es gratis, lleva menos de un minuto y guarda tu historial.',
    'onetimelock.cta.subscribe': 'Suscribirme ahora',
    'onetimelock.cta.login': 'Crear cuenta / entrar',
    'onetimelock.invite': 'o invitá a tu pareja para suscribirse juntos →',
  },
  en: {
    'onetimelock.freeUsed.title': 'You’ve used your free {feature} reading',
    'onetimelock.freeUsed.text.couple': 'Subscribe to Cosmic Guide and keep using this and every other feature with no limit, you and your partner.',
    'onetimelock.freeUsed.text.solo': 'Subscribe to Cosmic Guide and keep using this and every other individual feature with no limit.',
    'onetimelock.quota.title': 'Your free {feature} readings are used up',
    'onetimelock.quota.text.couple': 'The free quota lives in your account, not on the device. Subscribe to Cosmic Guide and keep going with no limit, you and your partner.',
    'onetimelock.quota.text.solo': 'The free quota lives in your account, not on the device. Subscribe to Cosmic Guide and keep going with no limit.',
    'onetimelock.login.title': 'Sign in to use {feature}',
    'onetimelock.login.text': 'Photo readings need an account — it’s free, takes under a minute, and keeps your history.',
    'onetimelock.cta.subscribe': 'Subscribe now',
    'onetimelock.cta.login': 'Create account / sign in',
    'onetimelock.invite': 'or invite your partner and subscribe together →',
  },
};
Object.assign(PT, PAYWALL_I18N.pt);
Object.assign(ES, PAYWALL_I18N.es);
Object.assign(EN, PAYWALL_I18N.en);

// ===========================================================================
// CHROME QUE SOBROU CRAVADO EM PORTUGUÊS — varredura da auditoria de 01/08/2026
// ===========================================================================
// Estas telas já passavam `lang` para os MOTORES (o conteúdo saía traduzido),
// mas os rótulos em volta eram literais no JSX. O resultado era pior do que
// tela inteira em português: ficava BILÍNGUE, com o recibo em inglês embaixo
// de um título em português, na mesma dobra.
const CHROME_RESTANTE_I18N = {
  pt: {
    'compat.calculate': 'Calcular Compatibilidade',
    'compat.sourceTitle': 'O que a fonte diz',
    'compat.degree': 'Grau {grau} de 4 na escala de Tetrabiblos IV.7 — {nome}.',
    'compat.notTitle': 'Duas coisas que este resultado não é',
    'diary.empty.filtered': 'Nenhuma leitura desse tipo ainda.',
    'diary.empty.fav': 'Você ainda não favoritou nenhuma leitura. Toque no coração de uma que te tocou.',
  },
  es: {
    'compat.calculate': 'Calcular compatibilidad',
    'compat.sourceTitle': 'Lo que dice la fuente',
    'compat.degree': 'Grado {grau} de 4 en la escala de Tetrabiblos IV.7 — {nome}.',
    'compat.notTitle': 'Dos cosas que este resultado no es',
    'diary.empty.filtered': 'Todavía no hay lecturas de este tipo.',
    'diary.empty.fav': 'Todavía no marcaste ninguna lectura como favorita. Tocá el corazón de alguna que te haya tocado.',
  },
  en: {
    'compat.calculate': 'Calculate compatibility',
    'compat.sourceTitle': 'What the source says',
    'compat.degree': 'Degree {grau} of 4 on the Tetrabiblos IV.7 scale — {nome}.',
    'compat.notTitle': 'Two things this result is not',
    'diary.empty.filtered': 'No readings of this kind yet.',
    'diary.empty.fav': 'You haven’t favorited any reading yet. Tap the heart on one that reached you.',
  },
};
Object.assign(PT, CHROME_RESTANTE_I18N.pt);
Object.assign(ES, CHROME_RESTANTE_I18N.es);
Object.assign(EN, CHROME_RESTANTE_I18N.en);

// ===========================================================================
// A BARRA DE ABAS — o texto mais visto do app, e estava só em português
// ===========================================================================
// Achado da auditoria de 01/08/2026. Nenhum Tab.Screen define `tabBarLabel`,
// então o React Navigation cai no `name` da rota — e o name É o literal de
// ROUTES ('Início', 'Tarô', 'Chat', 'Perfil'). Resultado: o rodapé, que fica
// na tela o tempo TODO em qualquer idioma, sempre em português.
//
// As CHAVES de ROUTES continuam em português de propósito: elas são
// identificadores usados em navigation.navigate() por todo o app, e trocá-las
// quebraria rota. O que muda é só o rótulo exibido.
const TABS_I18N = {
  pt: { 'tab.home': 'Início', 'tab.tarot': 'Tarô', 'tab.chat': 'Chat', 'tab.profile': 'Perfil' },
  es: { 'tab.home': 'Inicio', 'tab.tarot': 'Tarot', 'tab.chat': 'Chat', 'tab.profile': 'Perfil' },
  en: { 'tab.home': 'Home', 'tab.tarot': 'Tarot', 'tab.chat': 'Chat', 'tab.profile': 'Profile' },
};
Object.assign(PT, TABS_I18N.pt);
Object.assign(ES, TABS_I18N.es);
Object.assign(EN, TABS_I18N.en);

// ===========================================================================
// FALLBACK DO INSIGHT DA SEMANA — o que aparece quando a IA não responde
// ===========================================================================
// Estava cravado em português dentro de lib/journal.js. É a rede de segurança
// do Insight da Semana: quando a IA falha, é ISSO que a pessoa lê — e ela lia
// em português mesmo usando o app em inglês. O caminho de erro é justamente o
// que ninguém revisa, porque não aparece no uso normal.
//
// Ele NUNCA inventa: só lista os títulos das leituras que a pessoa realmente
// fez na semana. Essa disciplina continua — o que muda é só o idioma.
const INSIGHT_FALLBACK_I18N = {
  pt: {
    'diary.weekly.fallback.title': 'Sua semana em revisão',
    'diary.weekly.fallback.body': 'Essa semana você teve: {titulos}. Vale revisitar cada uma e notar o que se repete entre elas — às vezes o padrão só aparece quando se olha o conjunto.',
  },
  es: {
    'diary.weekly.fallback.title': 'Tu semana en revisión',
    'diary.weekly.fallback.body': 'Esta semana tuviste: {titulos}. Vale la pena volver a cada una y notar qué se repite entre ellas — a veces el patrón solo aparece cuando mirás el conjunto.',
  },
  en: {
    'diary.weekly.fallback.title': 'Your week in review',
    'diary.weekly.fallback.body': 'This week you had: {titulos}. It’s worth going back through each one and noticing what repeats — sometimes the pattern only shows up when you look at the whole set.',
  },
};
Object.assign(PT, INSIGHT_FALLBACK_I18N.pt);
Object.assign(ES, INSIGHT_FALLBACK_I18N.es);
Object.assign(EN, INSIGHT_FALLBACK_I18N.en);

// A Idade Real de Cada Coisa — o card do grid da Home.
const IDADE_REAL_CARD_I18N = {
  pt: {
    'home.card.idadereal.title': 'A idade real de cada coisa',
    'home.card.idadereal.subtitle': 'Superlua tem 47 anos, não 4.000',
  },
  es: {
    'home.card.idadereal.title': 'La edad real de cada cosa',
    'home.card.idadereal.subtitle': 'La Superluna tiene 47 años, no 4.000',
  },
  en: {
    'home.card.idadereal.title': 'How old things really are',
    'home.card.idadereal.subtitle': 'The Supermoon is 47 years old, not 4,000',
  },
};
Object.assign(PT, IDADE_REAL_CARD_I18N.pt);
Object.assign(ES, IDADE_REAL_CARD_I18N.es);
Object.assign(EN, IDADE_REAL_CARD_I18N.en);

// Profecções anuais e mensais — o card do grid da Home. Só o CARD mora aqui;
// tudo o que a tela diz por dentro sai do pack de lib/traducoes/profeccoes.*,
// como manda a arquitetura das telas de tradição.
const PROFECCOES_CARD_I18N = {
  pt: {
    'home.card.profeccoes.title': 'Profecções',
    'home.card.profeccoes.subtitle': 'A casa e o senhor do seu ano de vida',
  },
  es: {
    'home.card.profeccoes.title': 'Profecciones',
    'home.card.profeccoes.subtitle': 'La casa y el señor de tu año de vida',
  },
  en: {
    'home.card.profeccoes.title': 'Profections',
    'home.card.profeccoes.subtitle': 'The house and lord of your year of life',
  },
};
Object.assign(PT, PROFECCOES_CARD_I18N.pt);
Object.assign(ES, PROFECCOES_CARD_I18N.es);
Object.assign(EN, PROFECCOES_CARD_I18N.en);
