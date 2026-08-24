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
  // REVISÃO DE COPY 04/08/2026 (propostas 10 e 11), na tela de maior tráfego
  // medido do app — 118 sessões chegam aqui, 22 concluem:
  //
  //   · O card do casal pedia FÉ ("Descubram juntos a energia e a
  //     compatibilidade de vocês") do lado de um card solo que mostrava o
  //     cardápio inteiro. Lado a lado, concreto ganha de abstrato — e a decisão
  //     é exatamente onde se perde gente. Agora ele nomeia três coisas que
  //     existem no código (sinastria por aspecto, Frase do Dia, Reconectar) e
  //     fecha com a vantagem real da oferta.
  //     NÃO ENTRA AQUI "a primeira de cada é sua": as 5 telas de casal usam
  //     VÉU (components/FeatureGate.js), não uso grátis. A promessa da primeira
  //     grátis é verdadeira só do lado individual, e é lá que ela fica.
  //   · O botão era a MESMA chave nos dois cards e dizia "Começar" — processo,
  //     não destino. O caminho solo cai num grid de 12 signos que aparecia sem
  //     aviso (é ali que a pessoa some, ver o comentário de escolherSolo em
  //     screens/OnboardingChoiceScreen.js). Duas chaves agora, cada uma dizendo
  //     o que acontece no toque. Sem "→" no texto: quem desenha a seta é o
  //     Ionicons ao lado, e duas setas seguidas é defeito visual, não ênfase.
  'onboarding.solo.title': 'Pra mim',
  'onboarding.solo.desc': 'O céu de hoje, seu mapa de nascimento, as cartas, o que a sua mão e os seus sonhos contam. A primeira leitura de cada uma é sua.',
  'onboarding.solo.cta': 'Escolher meu signo',
  'onboarding.couple.title': 'Eu e meu par',
  'onboarding.couple.desc': 'A compatibilidade de vocês pela distância real entre os signos, a frase do dia pra mandar pro seu amor e as rotas pra reconectar. Uma assinatura vale pros dois.',
  'onboarding.couple.cta': 'Montar o nosso mapa',
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
  'login.recovery.title': 'Crie uma nova senha',
  'login.recovery.body': 'O link foi confirmado. Agora escolha a senha que vai usar para entrar.',
  'login.recovery.newPassword': 'Nova senha',
  'login.recovery.confirmPassword': 'Repita a nova senha',
  'login.recovery.mismatch': 'As duas senhas precisam ser iguais.',
  'login.recovery.save': 'Salvar nova senha',
  'login.recovery.note': 'Use pelo menos 6 caracteres. A alteração só acontece quando você toca em salvar.',

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
  // REVISÃO DE COPY 04/08/2026 (proposta 13). "Compartilhar" descreve o
  // mecanismo do botão, não o que a pessoa quer fazer — e o rótulo agora muda
  // com quem está olhando (casal × solo), porque o card aparece nos dois.
  // A tagline existe pelo mesmo motivo: o link ia PELADO ("💜 <url>"), e link
  // sem promessa colada nele é link que quem recebe não abre. "Amanhã tem
  // outra" não é promessa de resultado, é o funcionamento literal do motor —
  // a frase é determinística por data (lib/lovePhrase.js), então amanhã tem
  // outra mesmo.
  'home.lovePhrase.share': 'Mandar pro meu amor →',
  'home.lovePhrase.shareSolo': 'Mandar pra alguém →',
  'home.lovePhrase.shareTagline': '💜 Frase de hoje no Cosmic Guide — amanhã tem outra:',
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
  'home.card.diary.title': 'Diário Cósmico',
  'home.card.diary.subtitle': 'Suas leituras guardadas',
  'home.card.social.title': 'Comunidade',
  'home.card.social.subtitle': 'Conversas entre signos',
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
  // A PRIMEIRA FRASE DO FUNIL DO CASAL — reescrita em 04/08/2026.
  //
  // O que havia: "Sol + Ascendente + Lua. Cartas. Compatibilidade do casal. O
  // mapa cósmico de vocês, completo." Quatro pedaços de jargão empilhados na
  // tela onde alguém decide se preenche o formulário ou fecha o app. Quem já
  // sabe o que é Ascendente não precisa da linha; quem não sabe (que é quase
  // todo mundo, e é justamente quem o app quer) lê uma lista de palavras
  // técnicas e não encontra motivo nenhum pra continuar.
  //
  // O que entrou: a curiosidade que o próprio quiz já usa dois passos adiante
  // ("a hora é opcional — mas revela o Ascendente"), agora na porta, com o
  // benefício em coisa concreta. Sem promessa de efeito, sem número, sem "mais
  // de X casais" — a doutrina do app vale mais na tela de conversão, não menos.
  'quiz.hero.sub':
    'Na astrologia ninguém tem um signo só: são três — e o terceiro depende da hora em que você ' +
    'nasceu, por isso quase ninguém sabe o próprio. Aqui vocês veem os três de cada um lado a ' +
    'lado, com as cartas e a distância real entre os signos de vocês.',
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
  // REVISÃO DE COPY 04/08/2026 (propostas 7 e 8) — a lista do CASAL recebeu o
  // mesmo tratamento que a do solo já tinha (bloco PLANOS_SOLO_I18N no fim
  // deste arquivo):
  //
  //   · A headline era vapor ("experiência completa"). Adjetivo não se checa;
  //     a vantagem real da oferta — UM pagamento, DUAS pessoas — não aparecia
  //     em headline nenhuma do funil, e ela é a única coisa que o concorrente
  //     grátis não tem como igualar de graça.
  //   · 'planos.benefit.2' FOI APAGADA. Ela amontoava as nove leituras numa
  //     vírgula só ("Horóscopo, Mapa Astral, Tarô, Compatibilidade, Chat,
  //     Palma, Café, Sonhos e Calendário Lunar") e o olho lê isso como UMA
  //     linha, não como nove. As nove agora entram na lista do casal pelas
  //     MESMAS chaves do solo ('planos.benefit.solo.2..7', agrupadas por
  //     desejo) — uma fonte só de verdade, em vez de duas redações do mesmo
  //     fato envelhecendo em paralelo. Quem monta a ordem é COUPLE_BENEFIT_KEYS
  //     em screens/PlanosScreen.js. Apagada e não deixada morta pelo mesmo
  //     motivo de 'gate.teaser.price' logo abaixo: chave morta é o rascunho que
  //     a próxima tela copia sem perceber.
  //   · 'planos.benefit.8' é NOVA e não é benefício: é razão para acreditar, e
  //     por isso fecha a lista. Nenhuma lista de features fecha venda sem uma.
  //     É a doutrina da casa virada em bullet (docs/tradicao/00-tese.md), a
  //     versão longa da 'planos.benefit.solo.8' — aqui cabe o "obra, autor e
  //     século" inteiro porque é o último item que a pessoa lê antes do preço.
  'planos.unlockTitle': 'Tudo do app pros dois — com uma assinatura só',
  'planos.unlockTitleSolo': 'Desbloqueie as leituras individuais sem limite',
  'planos.benefit.1': '7 dias grátis pra testar, sem compromisso',
  'planos.benefit.3': 'Reconectar — rotas de reconexão pro casal',
  'planos.benefit.4': 'Descobrir — jogos e ideias de encontro',
  'planos.benefit.5': 'Agir — metas da semana',
  'planos.benefit.6': 'Progresso e Retrospectiva da jornada de vocês',
  'planos.benefit.7': 'Linha do tempo e cápsulas do tempo guardadas',
  'planos.benefit.8': 'Escrito a partir de fonte primária: quando a tradição e a internet discordam, a gente mostra a fonte — obra, autor e século.',
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
  // "Melhor oferta" é elogio próprio; o irmão mais barato mostrava aritmética
  // ("Economize 33%") e ganhava a comparação no plano que a casa MAIS quer
  // vender. A conta é a do próprio PLANS em screens/PlanosScreen.js:
  // US$5 × 12 = US$60 contra US$20 no anual → 67%. É porcentagem de PREÇO,
  // não de sorte, compatibilidade ou vida — a regra proibida não é essa.
  'planos.plan.annual.badge': 'Economize 67%',
  'planos.currencyNote': 'Cobrança em dólar americano (USD) pela Hotmart. O checkout mostra o valor final antes da confirmação.',
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
  'loja.brinde.brinde-tiragem-exclusiva.description': 'Tiragem exclusiva de 3 posições + 1 Leitura Bônus de Tarô creditada junto no resgate.',
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
  'loja.alert.deliveryFailed.title': 'Resgate não concluído',
  'loja.alert.deliveryFailed.refundedText': 'Não conseguimos guardar a Leitura Bônus. O resgate foi cancelado e {cost} tokens voltaram ao seu saldo ({balance} disponíveis).',
  'loja.alert.deliveryFailed.unconfirmedText': 'Não conseguimos guardar a Leitura Bônus nem confirmar o estorno. O saldo que conseguimos ler agora é {balance}. Não tente de novo antes de fechar e reabrir a Loja.',
  'loja.alert.storageError.title': 'Não foi possível resgatar agora',
  'loja.alert.storageError.text': 'O aparelho não confirmou a cobrança, então nenhum token foi gasto. Feche e reabra a Loja antes de tentar novamente.',
  'loja.refund.reason': 'Estorno · {title}',
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
  //
  // REVISÃO DE COPY 04/08/2026 (propostas 5 e 6). O véu (SubscribeTeaser) foi
  // desenhado pra criar UMA pergunta na cabeça de quem bate nele — "o que tem
  // embaixo?" — e o texto respondia falando de contrato ("Continue com a
  // assinatura" / "Assinar →"). Agora ele responde a pergunta que a própria
  // tela fez. E o cartão do solo abria dizendo "isso não é pra você", que é
  // rejeição no pico do interesse: o MESMO fato virou convite com dois passos
  // concretos. A frase do acesso herdado não é promessa nova — é a regra de
  // 29/07 que já está no código (`&acesso=` em lib/coupleInvite.js +
  // combineAccessResults em lib/coupleData.js).
  //
  // 'gate.teaser.price' FOI APAGADA aqui, não só abandonada: ela guardava o
  // preço DIGITADO À MÃO ("$5 USD/mês") e já não era lida por ninguém desde que
  // OfferSummary passou a ler a mesma chave do card de Planos
  // (components/FeatureGate.js). Chave morta continua sendo publicada no bundle
  // e é a primeira coisa que alguém copia ao criar uma tela nova — mesmo
  // motivo, e mesmo desfecho, de 'home.compatPercent' em 31/07/2026.
  'gate.teaser.title': 'O resto desta tela está logo aí embaixo',
  'gate.teaser.cta': 'Ver o resto — 7 dias grátis →',
  'gate.solo.title': 'Esta tela precisa de vocês dois',
  'gate.solo.text': 'Rotas de reconexão, jogos, ideias de encontro e retrospectiva se abrem quando o par entra. Você preenche o quiz, manda o link — e ele entra pela sua assinatura, sem pagar de novo.',
  'gate.solo.cta': 'Assinar agora →',
  'gate.solo.inviteCta': 'ou convide seu par pra desbloquear isso →',

  // Convite do casal (lib/coupleInvite.js) — REVISÃO DE COPY 04/08/2026
  // (proposta 12). A mensagem estava CRAVADA EM PORTUGUÊS dentro do lib e
  // dizia "criei nosso espaço no Cosmic Guide": espaço não é curiosidade nem é
  // notícia, e ela chega no WhatsApp do par SEM vendedor junto — precisa
  // carregar sozinha o que tem lá dentro e o custo que não existe.
  //
  // DUAS VARIANTES, E ELAS NÃO SÃO ESTILO: o accessCode só entra na URL de
  // quem tem assinatura (buildInviteUrl), então "seu acesso já vai neste link"
  // é fato pra uns e mentira pra outros. Quem escolhe é o próprio link.
  'invite.share.withAccess': '{amor}, fiz o nosso mapa no Cosmic Guide — dá pra ver o que combina e o que atrita entre a gente. Seu acesso já vai neste link, é só abrir: {url}',
  'invite.share.plain': '{amor}, fiz o nosso mapa no Cosmic Guide — dá pra ver o que combina e o que atrita entre a gente. Abre aqui: {url}',

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
  'profile.delete.text': 'Isso apaga sua conta de vez: o login, o vínculo com a sua assinatura e os dados salvos neste aparelho (nomes, signos, datas e sequência do casal). Não dá pra desfazer. Se você tem assinatura ativa, cancele antes na Hotmart — apagar a conta aqui não interrompe a cobrança.',
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
  'ai.unavailable.title': 'A leitura não foi gerada',
  'ai.unavailable.body': 'Não conseguimos concluir esta leitura agora. Sua entrada foi preservada e nenhuma resposta genérica foi colocada no lugar. Tente novamente em alguns instantes.',

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
  'album.cardHiddenHint': 'Toque para descobrir como revelar esta carta',
  'album.cardHiddenTitle': 'Esta carta ainda está guardada',
  'album.cardHiddenBody': 'Ela entra no seu álbum depois de aparecer em uma tiragem. Continue tirando cartas para revelar a coleção aos poucos.',
  'album.continueCta': 'Continuar no álbum',
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
  // O DISCLAIMER DA TELA DE SONHOS — reescrito em 04/08/2026, e trazido pro
  // dicionário no mesmo movimento (era literal em português dentro de
  // screens/DreamScreen.js, então quem lia o app em espanhol ou inglês recebia
  // a ressalva mais importante do app em outra língua).
  //
  // Por que a reescrita: ele ABRIA a tela — é a primeira linha, antes até do
  // campo de digitar — e abria por Artemidoro e Jung. Dois nomes próprios e dois
  // séculos como cartão de visita, antes de uma palavra sobre a pessoa que
  // acordou às três da manhã com um pesadelo. A ordem agora é a lei da casa: a
  // cena real primeiro (você acorda com aquilo na cabeça), a linhagem depois,
  // como recibo de onde vem esse jeito de ler.
  //
  // O que não pode voltar: promessa de efeito, autoridade clínica emprestada
  // (test/screenDisclaimers.test.js varre a família *.disclaimer inteira) e a
  // frase que manda procurar gente de verdade NÃO sai daqui — ela é a única do
  // app com essa função, e sonho é a porta por onde entra quem está sofrendo.
  'dream.disclaimer':
    'Você acorda com uma cena na cabeça e ela não sai o dia inteiro. O que vem aqui é uma leitura ' +
    'simbólica dessa cena: o que ela pode estar dizendo sobre o momento que você está vivendo, ' +
    'para pensar em cima — não para decidir nada por ela. Esse jeito de ler sonho tem endereço: o ' +
    'grego Artemidoro já o organizava na Antiguidade, e Carl Jung (1875-1961) voltou a tratá-los ' +
    'como material simbólico séculos depois; o texto em si é escrito por IA a partir do que você ' +
    'contou. Não substitui acompanhamento profissional.',
  'tarot.subtitle': 'Três cartas. Uma pergunta. Um caminho para refletir.',
  'tarot.album': 'Álbum',
  'tarot.tap': 'Toque',
  'missions.today': 'Missões de hoje',
  'missions.storeLink': 'trocar tokens por recompensas na Loja',

  // --- Lote 2 dos textos que estavam fixos no JSX (03/08/2026) --------------
  // Gravador de insight de voz, Retrospectiva, Progresso, Agir, Palma, Mapa
  // Astral, Feed Social, Retrospectiva Mensal, Compatibilidade e o seletor de
  // cidade. Quatro desses arquivos nao tinham nem o hook de idioma.
  'voice.saved': 'Insight guardado no seu Diário Cósmico',
  'voice.seeInDiary': 'Ver no Diário Cósmico',
  'voice.polishing': 'Organizando seu insight com IA...',
  'voice.yourInsight': 'Seu insight',
  'voice.saveAsIs': 'Salvar assim',
  'voice.polish': 'Lapidar com IA',
  'voice.recording': 'Gravando insight...',
  'voice.finish': 'Finalizar',
  'voice.ask': 'Quer guardar um insight dessa leitura?',
  'voice.record': 'Gravar meu insight',
  'voice.noMic': 'Seu navegador não grava voz aqui — escreva seu insight:',
  'voice.continue': 'Continuar',
  'voice.orWrite': 'ou escreva',
  'voice.placeholder': 'O que essa leitura despertou em você?',
  'voice.hearingError': 'Não consegui ouvir direito — tente de novo ou escreva seu insight.',
  'voice.loginRequired': 'Seu insight foi salvo. Crie sua conta (é grátis) para lapidar com IA.',
  'voice.quotaReached': 'Seu insight foi salvo. Suas lapidações gratuitas com IA acabaram — assine para continuar.',
  'voice.polishError': 'Não consegui lapidar com IA agora, mas seu insight original foi salvo.',
  'retro.needQuiz': 'Complete o quiz do casal primeiro',
  'retro.doQuiz': 'Fazer o quiz do casal',
  'retro.empty.title': 'O ano de vocês ainda está sendo escrito',
  'retro.empty.desc': 'Comecem a guardar memórias na Linha do Tempo 💛',
  'retro.empty.cta': 'Guardar a primeira memória →',
  'retro.yearTotal': 'Total do ano',
  'retro.yearSummary': 'Resumo do ano',
  'retro.missionsDone': 'missões de reconexão completadas desde o início',
  'retro.longestStreak': 'sequência mais longa de dias seguidos',
  'retro.keepYear': '🎁 Guardem esse ano',
  'retro.share': 'Compartilhar',
  'progresso.monthSummary': 'Resumo do mês',
  'progresso.memories': '📸 memórias',
  'progresso.capsules': '⏳ cápsulas',
  'progresso.missions': '💞 missões',
  'progresso.gestures': '🎯 gestos',
  'agir.markDone': 'Marcar como cumprida 💛',
  'agir.done': 'Meta cumprida! Que orgulho de vocês dois.',
  'agir.swapGoal': 'trocar meta',
  'agir.dreams': 'Sonhos do casal',
  'agir.dreamsDesc': 'Metas maiores, sem prazo — ficam aqui até vocês cumprirem.',
  'agir.add': 'Adicionar',
  'agir.empty.title': 'Ainda não há sonhos guardados',
  'agir.empty.desc': 'Adicionem sua primeira meta grande e fiquem aqui até cumpri-la.',
  'agir.remove': 'remover',
  'palm.chooseType': 'Escolha o tipo de leitura',
  'palm.takePhoto': 'Tirar foto',
  'palm.pickPhoto': 'Escolher da galeria',
  'palm.analyzing': 'Analisando…',
  'palm.analyze': 'Analisar',
  'palm.changePhoto': 'Trocar foto',
  'palm.subscribe': 'Assinar →',
  'palm.newReading': 'Nova leitura',
  'chart.houses': 'Casas (Casas Inteiras)',
  'chart.aspects': 'Aspectos',
  'chart.noAspects': 'Nenhum aspecto maior encontrado dentro do orbe padrão para esta data.',
  'chart.aspectsError': 'Não foi possível calcular os aspectos agora.',
  'chart.astrocarto': 'Astrocartografia (prévia por cidades)',
  'chart.noAngular': 'Nenhum planeta caiu angular em nenhuma das cidades notáveis para esta data/hora.',
  'chart.birthData': 'Dados de nascimento',
  'chart.timeOptional': 'Hora é opcional, mas revela o Ascendente (junto com a cidade).',
  'chart.generate': 'Gerar Mapa Astral',
  'social.createProfile.title': 'Crie seu perfil social',
  'social.createProfile.desc': 'Escolha como quer aparecer pros outros leitores no feed.',
  'social.createProfile.cta': 'Criar perfil',
  'social.profile': 'Perfil',
  'social.comments': 'Comentários',
  'social.noComments': 'Nenhum comentário ainda.',
  'social.follow': 'Seguir',
  'social.loginNeeded': 'Faça login para usar o Feed Social',
  'social.loginCta': 'Fazer login →',
  'wrapped.empty': 'Esse mês ainda não tem registros',
  'wrapped.back': 'Voltar',
  'wrapped.swipe': 'deslize',
  'wrapped.title': 'Sua Retrospectiva Cósmica',
  'wrapped.favorite': 'Sua leitura favorita',
  'wrapped.presence': 'Sua presença',
  'wrapped.harvest': 'Sua colheita',
  'wrapped.glance': 'Seu mês em uma olhada',
  'wrapped.share': 'Compartilhar',
  'compat.strength': 'Ponto forte',
  'compat.watch': 'Atenção',
  'compat.trialCta': 'Começar meus 7 dias grátis →',
  'compat.swap': 'Trocar',
  'city.title': 'Cidade de nascimento',
  'city.retry': 'Tentar de novo',
  'city.remove': 'Remover cidade',
  'city.skip': 'Pular (opcional)',

  // --- Check-in de um toque + termometro da lunacao (04/08/2026) -----------
  // Encantamento HONESTO: todo numero destas chaves e contagem de coisa real
  // (respostas da pessoa, presenca, avanco astronomico da Lua). Prometer
  // sorte/vida em % quebra test/semPromessas e a tese do produto.
  'checkin.pergunta': 'Como está seu coração hoje?',
  'checkin.leve': 'leve',
  'checkin.neutro': 'tranquilo',
  'checkin.pesado': 'pesado',
  'checkin.hoje': 'Hoje: {emoji} {humor}',
  'checkin.semana': '{n} de {total} dias leves esta semana',
  'checkin.semana.comparacao': 'semana passada: {prev}',
  'checkin.lunacao': '🌒 {pct}% desta lunação — você esteve aqui {dias} dias',
  'checkin.lunacao.um': '🌒 {pct}% desta lunação — você esteve aqui 1 dia',

  'home.thought.share': 'Compartilhar como card',

  'checkin.mes.maisLeve': '✨ {n} dias leves nos últimos 30 — eram {prev} no mês anterior',

  // --- Lembrete diário do check-in (04/08/2026) -----------------------------
  // O toggle discreto que só aparece DEPOIS do primeiro check-in. O texto
  // AVISA, nunca PROMETE: nada de "seu dia vai render mais", nada de saúde,
  // humor clínico ou porcentagem. É um toque no ombro pra uma coisa que a
  // pessoa já escolheu fazer. O texto do push em si mora no servidor
  // (server-patches/src/infrastructure/checkinReminderContent.js), nos mesmos
  // três idiomas.
  'checkin.lembrete.rotulo': 'Lembrete diário',
  'checkin.lembrete.ajuda': 'Um aviso por dia pra não esquecer do seu check-in.',
};

const ES = {
  // Onboarding — a escolha "só eu / eu e meu par", 1ª tela de quem chega pelo link
  'onboarding.headerTitle': 'Nueve lecturas.\nLa primera de cada una, gratis.',
  'onboarding.headerSub': 'Horóscopo, carta astral, tarot, sueños, palma de la mano, poso de café y más. Sin tarjeta para empezar.',
  'onboarding.solo.title': 'Para mí',
  'onboarding.solo.desc': 'El cielo de hoy, tu carta natal, las cartas, lo que cuentan tu mano y tus sueños. La primera lectura de cada una es tuya.',
  'onboarding.solo.cta': 'Elegir mi signo',
  'onboarding.couple.title': 'Mi pareja y yo',
  'onboarding.couple.desc': 'La compatibilidad de ustedes por la distancia real entre los signos, la frase del día para mandarle a tu amor y las rutas para reconectar. Una sola suscripción vale para los dos.',
  'onboarding.couple.cta': 'Armar nuestro mapa',
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
  'login.recovery.title': 'Crea una nueva contraseña',
  'login.recovery.body': 'El enlace fue confirmado. Ahora elige la contraseña que usarás para entrar.',
  'login.recovery.newPassword': 'Nueva contraseña',
  'login.recovery.confirmPassword': 'Repite la nueva contraseña',
  'login.recovery.mismatch': 'Las dos contraseñas deben ser iguales.',
  'login.recovery.save': 'Guardar nueva contraseña',
  'login.recovery.note': 'Usa al menos 6 caracteres. El cambio solo ocurre cuando tocas guardar.',

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
  'home.lovePhrase.share': 'Mandarla a mi amor →',
  'home.lovePhrase.shareSolo': 'Mandarla a alguien →',
  'home.lovePhrase.shareTagline': '💜 Frase de hoy en Cosmic Guide — mañana hay otra:',
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
  'home.card.diary.title': 'Diario Cósmico',
  'home.card.diary.subtitle': 'Tus lecturas guardadas',
  'home.card.social.title': 'Comunidad',
  'home.card.social.subtitle': 'Conversaciones entre signos',
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
  'quiz.hero.sub':
    'En astrología nadie tiene un solo signo: son tres — y el tercero depende de la hora en que ' +
    'naciste, por eso casi nadie sabe cuál es el suyo. Acá ven los tres de cada uno lado a lado, ' +
    'con las cartas y la distancia real entre los signos de ustedes.',
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
  'planos.unlockTitle': 'Todo el app para los dos — con una sola suscripción',
  'planos.unlockTitleSolo': 'Desbloquea las lecturas individuales sin límite',
  'planos.benefit.1': '7 días gratis para probar, sin compromiso',
  'planos.benefit.3': 'Reconectar — rutas de reconexión para la pareja',
  'planos.benefit.4': 'Descubrir — juegos e ideas para citas',
  'planos.benefit.5': 'Actuar — metas de la semana',
  'planos.benefit.6': 'Progreso y Retrospectiva del camino de ustedes',
  'planos.benefit.7': 'Línea de tiempo y cápsulas del tiempo guardadas',
  'planos.benefit.8': 'Escrito desde la fuente primaria: cuando la tradición y el internet no coinciden, mostramos la fuente — obra, autor y siglo.',
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
  'planos.plan.annual.badge': 'Ahorra 67%',
  'planos.currencyNote': 'Cobro en dólares estadounidenses (USD) por Hotmart. El checkout muestra el importe final antes de confirmar.',
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
  'loja.brinde.brinde-tiragem-exclusiva.description': 'Tirada exclusiva de 3 posiciones + 1 Lectura Bonus de Tarot acreditada junto con el canje.',
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
  'loja.alert.deliveryFailed.title': 'Canje no completado',
  'loja.alert.deliveryFailed.refundedText': 'No pudimos guardar la Lectura Bonus. El canje se canceló y {cost} tokens volvieron a tu saldo ({balance} disponibles).',
  'loja.alert.deliveryFailed.unconfirmedText': 'No pudimos guardar la Lectura Bonus ni confirmar el reembolso. El saldo que podemos leer ahora es {balance}. No lo intentes de nuevo antes de cerrar y volver a abrir la Tienda.',
  'loja.alert.storageError.title': 'No se pudo canjear ahora',
  'loja.alert.storageError.text': 'El dispositivo no confirmó el cobro, así que no se gastó ningún token. Cierra y vuelve a abrir la Tienda antes de intentarlo de nuevo.',
  'loja.refund.reason': 'Reembolso · {title}',
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
  'gate.teaser.title': 'El resto de esta pantalla está justo ahí abajo',
  'gate.teaser.cta': 'Ver el resto — 7 días gratis →',
  'gate.solo.title': 'Esta pantalla necesita a los dos',
  'gate.solo.text': 'Las rutas de reconexión, los juegos, las ideas para citas y la retrospectiva se abren cuando entra tu pareja. Completas el quiz, le mandas el enlace — y entra por tu suscripción, sin pagar de nuevo.',
  'gate.solo.cta': 'Suscribirme ahora →',
  'gate.solo.inviteCta': 'o invita a tu pareja para desbloquear esto →',
  'invite.share.withAccess': '{amor}, hice nuestro mapa en Cosmic Guide — se ve lo que combina y lo que roza entre nosotros. Tu acceso ya va en este enlace, solo tienes que abrirlo: {url}',
  'invite.share.plain': '{amor}, hice nuestro mapa en Cosmic Guide — se ve lo que combina y lo que roza entre nosotros. Ábrelo aquí: {url}',

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
  'profile.delete.text': 'Esto elimina tu cuenta para siempre: el acceso, el vínculo con tu suscripción y los datos guardados en este dispositivo (nombres, signos, fechas y la racha de la pareja). No se puede deshacer. Si tienes una suscripción activa, cancélala antes en Hotmart — eliminar la cuenta aquí no detiene el cobro.',
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
  'ai.unavailable.title': 'La lectura no se generó',
  'ai.unavailable.body': 'No pudimos completar esta lectura ahora. Tu entrada se conservó y no pusimos una respuesta genérica en su lugar. Inténtalo de nuevo en unos instantes.',

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
  'album.cardHiddenHint': 'Toca para descubrir cómo revelar esta carta',
  'album.cardHiddenTitle': 'Esta carta todavía está guardada',
  'album.cardHiddenBody': 'Entrará en tu álbum después de aparecer en una tirada. Sigue sacando cartas para revelar la colección poco a poco.',
  'album.continueCta': 'Seguir en el álbum',
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
  'dream.disclaimer':
    'Te despertás con una escena en la cabeza y no se te va en todo el día. Lo que viene acá es ' +
    'una lectura simbólica de esa escena: lo que puede estar diciendo sobre el momento que estás ' +
    'viviendo, para pensarlo — no para decidir nada por ella. Esta forma de leer los sueños tiene ' +
    'dirección: el griego Artemidoro ya la ordenaba en la Antigüedad, y Carl Jung (1875-1961) ' +
    'volvió a tratarlos como material simbólico siglos después; el texto en sí lo escribe una IA ' +
    'a partir de lo que contaste. No sustituye acompañamiento profesional.',
  'tarot.subtitle': 'Tres cartas. Una pregunta. Un camino para reflexionar.',
  'tarot.album': 'Álbum',
  'tarot.tap': 'Toca',
  'missions.today': 'Misiones de hoy',
  'missions.storeLink': 'cambiar fichas por recompensas en la Tienda',

  'voice.saved': 'Insight guardado en tu Diario Cósmico',
  'voice.seeInDiary': 'Ver en el Diario Cósmico',
  'voice.polishing': 'Organizando tu insight con IA...',
  'voice.yourInsight': 'Tu insight',
  'voice.saveAsIs': 'Guardar así',
  'voice.polish': 'Pulir con IA',
  'voice.recording': 'Grabando insight...',
  'voice.finish': 'Finalizar',
  'voice.ask': '¿Quieres guardar un insight de esta lectura?',
  'voice.record': 'Grabar mi insight',
  'voice.noMic': 'Tu navegador no graba voz aquí — escribe tu insight:',
  'voice.continue': 'Continuar',
  'voice.orWrite': 'o escribe',
  'voice.placeholder': '¿Qué despertó esta lectura en ti?',
  'voice.hearingError': 'No pude oírte bien — inténtalo otra vez o escribe tu insight.',
  'voice.loginRequired': 'Tu insight fue guardado. Crea tu cuenta gratis para pulirlo con IA.',
  'voice.quotaReached': 'Tu insight fue guardado. Tus pulidos gratuitos con IA se terminaron — suscríbete para continuar.',
  'voice.polishError': 'No pude pulirlo con IA ahora, pero tu insight original fue guardado.',
  'retro.needQuiz': 'Completen primero el quiz de la pareja',
  'retro.doQuiz': 'Hacer el quiz de la pareja',
  'retro.empty.title': 'El año de ustedes todavía se está escribiendo',
  'retro.empty.desc': 'Empiecen a guardar recuerdos en la Línea del Tiempo 💛',
  'retro.empty.cta': 'Guardar el primer recuerdo →',
  'retro.yearTotal': 'Total del año',
  'retro.yearSummary': 'Resumen del año',
  'retro.missionsDone': 'misiones de reconexión completadas desde el inicio',
  'retro.longestStreak': 'racha más larga de días seguidos',
  'retro.keepYear': '🎁 Guarden este año',
  'retro.share': 'Compartir',
  'progresso.monthSummary': 'Resumen del mes',
  'progresso.memories': '📸 recuerdos',
  'progresso.capsules': '⏳ cápsulas',
  'progresso.missions': '💞 misiones',
  'progresso.gestures': '🎯 gestos',
  'agir.markDone': 'Marcar como cumplida 💛',
  'agir.done': 'Meta cumplida. Qué orgullo de ustedes dos.',
  'agir.swapGoal': 'cambiar meta',
  'agir.dreams': 'Sueños de la pareja',
  'agir.dreamsDesc': 'Metas mayores, sin plazo — se quedan aquí hasta que las cumplan.',
  'agir.add': 'Añadir',
  'agir.empty.title': 'Todavía no hay sueños guardados',
  'agir.empty.desc': 'Añadan su primera meta grande y quédense aquí hasta cumplirla.',
  'agir.remove': 'quitar',
  'palm.chooseType': 'Elige el tipo de lectura',
  'palm.takePhoto': 'Tomar foto',
  'palm.pickPhoto': 'Elegir de la galería',
  'palm.analyzing': 'Analizando…',
  'palm.analyze': 'Analizar',
  'palm.changePhoto': 'Cambiar foto',
  'palm.subscribe': 'Suscribirse →',
  'palm.newReading': 'Nueva lectura',
  'chart.houses': 'Casas (Casas Enteras)',
  'chart.aspects': 'Aspectos',
  'chart.noAspects': 'Ningún aspecto mayor dentro del orbe estándar para esta fecha.',
  'chart.aspectsError': 'No se pudieron calcular los aspectos ahora.',
  'chart.astrocarto': 'Astrocartografía (vista previa por ciudades)',
  'chart.noAngular': 'Ningún planeta quedó angular en ninguna de las ciudades notables para esta fecha/hora.',
  'chart.birthData': 'Datos de nacimiento',
  'chart.timeOptional': 'La hora es opcional, pero revela el Ascendente (junto con la ciudad).',
  'chart.generate': 'Generar Carta Astral',
  'social.createProfile.title': 'Crea tu perfil social',
  'social.createProfile.desc': 'Elige cómo quieres aparecer ante los otros lectores del feed.',
  'social.createProfile.cta': 'Crear perfil',
  'social.profile': 'Perfil',
  'social.comments': 'Comentarios',
  'social.noComments': 'Todavía no hay comentarios.',
  'social.follow': 'Seguir',
  'social.loginNeeded': 'Inicia sesión para usar el Feed Social',
  'social.loginCta': 'Iniciar sesión →',
  'wrapped.empty': 'Este mes todavía no tiene registros',
  'wrapped.back': 'Volver',
  'wrapped.swipe': 'desliza',
  'wrapped.title': 'Tu Retrospectiva Cósmica',
  'wrapped.favorite': 'Tu lectura favorita',
  'wrapped.presence': 'Tu presencia',
  'wrapped.harvest': 'Tu cosecha',
  'wrapped.glance': 'Tu mes de un vistazo',
  'wrapped.share': 'Compartir',
  'compat.strength': 'Punto fuerte',
  'compat.watch': 'Atención',
  'compat.trialCta': 'Empezar mis 7 días gratis →',
  'compat.swap': 'Cambiar',
  'city.title': 'Ciudad de nacimiento',
  'city.retry': 'Intentar de nuevo',
  'city.remove': 'Quitar ciudad',
  'city.skip': 'Saltar (opcional)',

  'checkin.pergunta': '¿Cómo está tu corazón hoy?',
  'checkin.leve': 'ligero',
  'checkin.neutro': 'tranquilo',
  'checkin.pesado': 'pesado',
  'checkin.hoje': 'Hoy: {emoji} {humor}',
  'checkin.semana': '{n} de {total} días ligeros esta semana',
  'checkin.semana.comparacao': 'la semana pasada: {prev}',
  'checkin.lunacao': '🌒 {pct}% de esta lunación — estuviste aquí {dias} días',
  'checkin.lunacao.um': '🌒 {pct}% de esta lunación — estuviste aquí 1 día',

  'home.thought.share': 'Compartir como tarjeta',

  'checkin.mes.maisLeve': '✨ {n} días ligeros en los últimos 30 — eran {prev} el mes anterior',

  'checkin.lembrete.rotulo': 'Recordatorio diario',
  'checkin.lembrete.ajuda': 'Un aviso por día para no olvidar tu check-in.',
};

const EN = {
  // Onboarding — a escolha "só eu / eu e meu par", 1ª tela de quem chega pelo link
  'onboarding.headerTitle': 'Nine readings.\nThe first of each, free.',
  'onboarding.headerSub': 'Horoscope, birth chart, tarot, dreams, palm, coffee grounds and more. No card to get started.',
  'onboarding.solo.title': 'For me',
  'onboarding.solo.desc': 'Today’s sky, your birth chart, the cards, what your hand and your dreams say. The first reading of each is yours.',
  'onboarding.solo.cta': 'Choose my sign',
  'onboarding.couple.title': 'My partner and me',
  'onboarding.couple.desc': 'Your compatibility from the real distance between your signs, the phrase of the day to send to your love, and the routes to reconnect. One subscription covers you both.',
  'onboarding.couple.cta': 'Build our chart',
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
  'login.recovery.title': 'Create a new password',
  'login.recovery.body': 'The link was confirmed. Now choose the password you will use to log in.',
  'login.recovery.newPassword': 'New password',
  'login.recovery.confirmPassword': 'Repeat the new password',
  'login.recovery.mismatch': 'Both passwords must match.',
  'login.recovery.save': 'Save new password',
  'login.recovery.note': 'Use at least 6 characters. The change only happens when you tap save.',

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
  'home.lovePhrase.share': 'Send it to my love →',
  'home.lovePhrase.shareSolo': 'Send it to someone →',
  'home.lovePhrase.shareTagline': '💜 Today’s phrase on Cosmic Guide — there’s another one tomorrow:',
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
  'home.card.diary.title': 'Cosmic Diary',
  'home.card.diary.subtitle': 'Your saved readings',
  'home.card.social.title': 'Community',
  'home.card.social.subtitle': 'Conversations between signs',
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
  'quiz.hero.sub':
    'In astrology nobody has just one sign: there are three — and the third one depends on the ' +
    'hour you were born, which is why almost nobody knows their own. Here you see all three for ' +
    'each of you, side by side, with the cards and the real distance between your two signs.',
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
  'planos.unlockTitle': 'Everything in the app for both of you — with a single subscription',
  'planos.unlockTitleSolo': 'Unlock unlimited individual readings',
  'planos.benefit.1': '7-day free trial, no commitment',
  'planos.benefit.3': 'Reconnect — reconnection routes for couples',
  'planos.benefit.4': 'Discover — games and date ideas',
  'planos.benefit.5': 'Take Action — weekly goals',
  'planos.benefit.6': 'Progress and Retrospective of your journey',
  'planos.benefit.7': 'Timeline and saved time capsules',
  'planos.benefit.8': 'Written from primary sources: when tradition and the internet disagree, we show you the source — work, author and century.',
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
  'planos.plan.annual.badge': 'Save 67%',
  'planos.currencyNote': 'Charged in U.S. dollars (USD) by Hotmart. Checkout shows the final amount before confirmation.',
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
  'loja.brinde.brinde-tiragem-exclusiva.description': 'An exclusive 3-position spread + 1 Bonus Tarot Reading credited with the redemption.',
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
  'loja.alert.deliveryFailed.title': 'Redemption not completed',
  'loja.alert.deliveryFailed.refundedText': 'We could not save the Bonus Reading. The redemption was cancelled and {cost} tokens returned to your balance ({balance} available).',
  'loja.alert.deliveryFailed.unconfirmedText': 'We could not save the Bonus Reading or confirm the refund. The balance we can read now is {balance}. Do not try again before closing and reopening the Shop.',
  'loja.alert.storageError.title': 'Could not redeem right now',
  'loja.alert.storageError.text': 'The device did not confirm the charge, so no tokens were spent. Close and reopen the Shop before trying again.',
  'loja.refund.reason': 'Refund · {title}',
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
  'gate.teaser.title': 'The rest of this screen is right below',
  'gate.teaser.cta': 'See the rest — 7 days free →',
  'gate.solo.title': 'This screen needs the two of you',
  'gate.solo.text': 'Reconnection routes, games, date ideas and the retrospective open up when your partner joins. You fill in the quiz, send the link — and they come in on your subscription, without paying again.',
  'gate.solo.cta': 'Subscribe now →',
  'gate.solo.inviteCta': 'or invite your partner to unlock this →',
  'invite.share.withAccess': '{amor}, I made our chart on Cosmic Guide — you can see what fits and what grates between us. Your access is already in this link, just open it: {url}',
  'invite.share.plain': '{amor}, I made our chart on Cosmic Guide — you can see what fits and what grates between us. Open it here: {url}',

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
  'profile.delete.text': 'This deletes your account for good: your login, the link to your subscription and the data saved on this device (names, signs, dates and the couple streak). It cannot be undone. If you have an active subscription, cancel it on Hotmart first — deleting your account here does not stop the billing.',
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
  'ai.unavailable.title': 'The reading was not generated',
  'ai.unavailable.body': 'We could not complete this reading right now. Your input was preserved, and we did not replace it with a generic response. Try again in a moment.',

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
  'album.cardHiddenHint': 'Tap to learn how to reveal this card',
  'album.cardHiddenTitle': 'This card is still sealed',
  'album.cardHiddenBody': 'It joins your album after appearing in a reading. Keep drawing cards to reveal your collection little by little.',
  'album.continueCta': 'Continue in the album',
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
  'dream.disclaimer':
    'You wake up with a scene stuck in your head and it follows you all day. What comes next is a ' +
    'symbolic reading of that scene: what it might be saying about the stretch of life you are in ' +
    'right now, to think with — not to decide anything by. This way of reading dreams has an ' +
    'address: the Greek Artemidorus was already organising it in antiquity, and Carl Jung ' +
    '(1875-1961) went back to treating dreams as symbolic material centuries later; the text ' +
    'itself is written by AI from what you typed. It does not replace professional support.',
  'tarot.subtitle': 'Three cards. One question. One path to reflect on.',
  'tarot.album': 'Album',
  'tarot.tap': 'Tap',
  'missions.today': "Today's missions",
  'missions.storeLink': 'trade tokens for rewards in the Store',

  'voice.saved': 'Insight saved to your Cosmic Journal',
  'voice.seeInDiary': 'See it in the Cosmic Journal',
  'voice.polishing': 'Organizing your insight with AI...',
  'voice.yourInsight': 'Your insight',
  'voice.saveAsIs': 'Save it as is',
  'voice.polish': 'Polish with AI',
  'voice.recording': 'Recording insight...',
  'voice.finish': 'Finish',
  'voice.ask': 'Want to keep an insight from this reading?',
  'voice.record': 'Record my insight',
  'voice.noMic': 'Your browser will not record voice here — write your insight:',
  'voice.continue': 'Continue',
  'voice.orWrite': 'or write',
  'voice.placeholder': 'What did this reading bring up for you?',
  'voice.hearingError': 'I could not hear you clearly — try again or write your insight.',
  'voice.loginRequired': 'Your insight was saved. Create your free account to polish it with AI.',
  'voice.quotaReached': 'Your insight was saved. You have used your free AI polishes — subscribe to continue.',
  'voice.polishError': 'I could not polish it with AI right now, but your original insight was saved.',
  'retro.needQuiz': 'Finish the couple quiz first',
  'retro.doQuiz': 'Take the couple quiz',
  'retro.empty.title': 'Your year is still being written',
  'retro.empty.desc': 'Start keeping memories on the Timeline 💛',
  'retro.empty.cta': 'Keep the first memory →',
  'retro.yearTotal': 'Total for the year',
  'retro.yearSummary': 'Summary of the year',
  'retro.missionsDone': 'reconnection missions completed since the start',
  'retro.longestStreak': 'longest run of days in a row',
  'retro.keepYear': '🎁 Keep this year',
  'retro.share': 'Share',
  'progresso.monthSummary': 'Summary of the month',
  'progresso.memories': '📸 memories',
  'progresso.capsules': '⏳ capsules',
  'progresso.missions': '💞 missions',
  'progresso.gestures': '🎯 gestures',
  'agir.markDone': 'Mark it done 💛',
  'agir.done': 'Goal done. Proud of you both.',
  'agir.swapGoal': 'swap goal',
  'agir.dreams': 'Dreams of the two of you',
  'agir.dreamsDesc': 'Bigger goals, no deadline — they stay here until you get there.',
  'agir.add': 'Add',
  'agir.empty.title': 'No dreams kept yet',
  'agir.empty.desc': 'Add your first big goal and stay with it until it is done.',
  'agir.remove': 'remove',
  'palm.chooseType': 'Choose the kind of reading',
  'palm.takePhoto': 'Take a photo',
  'palm.pickPhoto': 'Choose from the gallery',
  'palm.analyzing': 'Reading…',
  'palm.analyze': 'Read it',
  'palm.changePhoto': 'Change photo',
  'palm.subscribe': 'Subscribe →',
  'palm.newReading': 'New reading',
  'chart.houses': 'Houses (Whole Sign)',
  'chart.aspects': 'Aspects',
  'chart.noAspects': 'No major aspect within the standard orb for this date.',
  'chart.aspectsError': 'The aspects could not be calculated right now.',
  'chart.astrocarto': 'Astrocartography (preview by city)',
  'chart.noAngular': 'No planet fell angular in any of the notable cities for this date and time.',
  'chart.birthData': 'Birth details',
  'chart.timeOptional': 'The time is optional, but it reveals the Ascendant (together with the city).',
  'chart.generate': 'Generate Birth Chart',
  'social.createProfile.title': 'Create your social profile',
  'social.createProfile.desc': 'Choose how you want to appear to other readers in the feed.',
  'social.createProfile.cta': 'Create profile',
  'social.profile': 'Profile',
  'social.comments': 'Comments',
  'social.noComments': 'No comments yet.',
  'social.follow': 'Follow',
  'social.loginNeeded': 'Sign in to use the Social Feed',
  'social.loginCta': 'Sign in →',
  'wrapped.empty': 'This month has no entries yet',
  'wrapped.back': 'Back',
  'wrapped.swipe': 'swipe',
  'wrapped.title': 'Your Cosmic Recap',
  'wrapped.favorite': 'Your favorite reading',
  'wrapped.presence': 'Your presence',
  'wrapped.harvest': 'Your harvest',
  'wrapped.glance': 'Your month at a glance',
  'wrapped.share': 'Share',
  'compat.strength': 'Strong point',
  'compat.watch': 'Watch out',
  'compat.trialCta': 'Start my 7 free days →',
  'compat.swap': 'Change',
  'city.title': 'City of birth',
  'city.retry': 'Try again',
  'city.remove': 'Remove city',
  'city.skip': 'Skip (optional)',

  'checkin.pergunta': 'How is your heart today?',
  'checkin.leve': 'light',
  'checkin.neutro': 'steady',
  'checkin.pesado': 'heavy',
  'checkin.hoje': 'Today: {emoji} {humor}',
  'checkin.semana': '{n} of {total} light days this week',
  'checkin.semana.comparacao': 'last week: {prev}',
  'checkin.lunacao': '🌒 {pct}% of this lunation — you were here {dias} days',
  'checkin.lunacao.um': '🌒 {pct}% of this lunation — you were here 1 day',

  'home.thought.share': 'Share as a card',

  'checkin.mes.maisLeve': '✨ {n} light days in the last 30 — it was {prev} the month before',

  'checkin.lembrete.rotulo': 'Daily reminder',
  'checkin.lembrete.ajuda': 'One notice a day so you don\'t forget your check-in.',
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
    'planos.benefit.solo.6': 'Conversar com Órbi sempre aberto, pra organizar o que ficou na cabeça depois da leitura',
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
    'planos.benefit.solo.6': 'Conversar con Órbi siempre abierto, para ordenar lo que quedó en tu cabeza después de la lectura',
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
    'planos.benefit.solo.6': 'Talk with Órbi anytime, to organize what stayed on your mind after a reading',
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
    'tarot.theme.Amor': 'Amor',
    'tarot.theme.Carreira': 'Carreira',
    'tarot.theme.Dinheiro': 'Dinheiro',
    'tarot.theme.Energia': 'Energia',
    'tarot.theme.Saúde': 'Saúde',
    'tarot.focusQuestion': 'Concentre-se na sua pergunta sobre {theme}',
    'tarot.dailyBlocked': 'Você já consultou {theme} hoje. Essa tiragem é única por dia; volte amanhã para uma nova.',
    'tarot.previewBlocked': 'Sua leitura gratuita de Tarô é única e não renova amanhã. Você ainda pode usar uma Leitura Bônus ou assinar para tirar cartas todos os dias.',
    'tarot.bonusUse': 'Usar Leitura Bônus ({count})',
    'tarot.previewAfter': 'Sua prévia grátis de Tarô é uma só e não renova amanhã — assine para tirar cartas todo dia, em qualquer tema.',
    'tarot.dailyAfter': 'Essa foi sua tiragem de {theme} de hoje. Volte amanhã para uma nova; os outros temas continuam disponíveis hoje.',
    'tarot.note.major': 'Saiu um Arcano Maior. Nesta leitura, ele aponta para o eixo da situação, não apenas para uma tarefa isolada.',
    'tarot.note.court': 'Saiu uma figura de corte. Ela pode representar uma pessoa ou uma postura sua; a leitura acima mostra o contexto desta carta.',
    'tarot.note.reversed': 'Saiu uma carta invertida. Aqui ela indica a mesma energia travada, excessiva ou voltada para dentro — não o simples oposto da carta.',
    'tarot.note.system': 'As atribuições astrológicas seguem a Golden Dawn (“Book T”). Existem outras tabelas incompatíveis; este app escolhe uma e informa qual.',
    'tarot.diary.type': 'Leitura de Tarô',
    'tarot.diary.title': 'Tarô de {theme} — Passado, Presente e Futuro',
    'tarot.albumA11y': 'Abrir Álbum de Cartas',
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
    'tarot.theme.Amor': 'Amor',
    'tarot.theme.Carreira': 'Carrera',
    'tarot.theme.Dinheiro': 'Dinero',
    'tarot.theme.Energia': 'Energía',
    'tarot.theme.Saúde': 'Bienestar',
    'tarot.focusQuestion': 'Concentrate en tu pregunta sobre {theme}',
    'tarot.dailyBlocked': 'Ya consultaste {theme} hoy. Esta tirada es única por día; vuelve mañana para una nueva.',
    'tarot.previewBlocked': 'Tu lectura gratuita de Tarot es única y no se renueva mañana. Todavía puedes usar una Lectura Bonus o suscribirte para sacar cartas todos los días.',
    'tarot.bonusUse': 'Usar Lectura Bonus ({count})',
    'tarot.previewAfter': 'Tu prueba gratuita de Tarot es única y no se renueva mañana — suscríbete para sacar cartas todos los días, en cualquier tema.',
    'tarot.dailyAfter': 'Esta fue tu tirada de {theme} de hoy. Vuelve mañana para una nueva; los demás temas siguen disponibles hoy.',
    'tarot.note.major': 'Salió un Arcano Mayor. En esta lectura señala el eje de la situación, no solo una tarea aislada.',
    'tarot.note.court': 'Salió una figura de corte. Puede representar a una persona o una postura tuya; la lectura de arriba muestra el contexto de esta carta.',
    'tarot.note.reversed': 'Salió una carta invertida. Aquí indica la misma energía bloqueada, excesiva o vuelta hacia dentro — no el simple opuesto de la carta.',
    'tarot.note.system': 'Las atribuciones astrológicas siguen la Golden Dawn (“Book T”). Existen otras tablas incompatibles; esta app elige una y dice cuál.',
    'tarot.diary.type': 'Lectura de Tarot',
    'tarot.diary.title': 'Tarot de {theme} — Pasado, Presente y Futuro',
    'tarot.albumA11y': 'Abrir el Álbum de Cartas',
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
    'tarot.theme.Amor': 'Love',
    'tarot.theme.Carreira': 'Career',
    'tarot.theme.Dinheiro': 'Money',
    'tarot.theme.Energia': 'Energy',
    'tarot.theme.Saúde': 'Well-being',
    'tarot.focusQuestion': 'Focus on your question about {theme}',
    'tarot.dailyBlocked': 'You already consulted {theme} today. This spread is available once a day; come back tomorrow for a new one.',
    'tarot.previewBlocked': 'Your free Tarot reading is a one-time preview and does not renew tomorrow. You can still use a Bonus Reading or subscribe for daily spreads.',
    'tarot.bonusUse': 'Use Bonus Reading ({count})',
    'tarot.previewAfter': 'Your free Tarot preview is one-time and does not renew tomorrow — subscribe to draw cards every day, on any theme.',
    'tarot.dailyAfter': 'That was today’s {theme} spread. Come back tomorrow for a new one; the other themes remain available today.',
    'tarot.note.major': 'A Major Arcana card appeared. In this reading, it points to the situation’s central axis, not just an isolated task.',
    'tarot.note.court': 'A court card appeared. It may represent a person or one of your own stances; the reading above gives this card’s context.',
    'tarot.note.reversed': 'A reversed card appeared. Here it means the same energy is blocked, excessive, or turned inward — not simply the card’s opposite.',
    'tarot.note.system': 'The astrological attributions follow the Golden Dawn (“Book T”). Other incompatible tables exist; this app chooses one and names it.',
    'tarot.diary.type': 'Tarot Reading',
    'tarot.diary.title': '{theme} Tarot — Past, Present and Future',
    'tarot.albumA11y': 'Open Card Album',
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
//
// REVISÃO DE COPY 04/08/2026 (design/propostas-copy.md, propostas 1 a 3) — três
// mudanças no muro mais movimentado do app (as nove leituras individuais passam
// por aqui):
//
//   1. O TÍTULO ABRIA COM DÉBITO. "Você já usou sua leitura gratuita" começa a
//      venda numa contabilidade negativa, e contra a promessa que trouxe a
//      pessoa até aqui ('onboarding.headerTitle': "A primeira de cada, grátis").
//      O MESMO fato virou presente já entregue. Nada de novo é prometido.
//   2. O TEXTO DIZIA "RECURSOS". Adjetivo de feature não compete com o app
//      grátis que a pessoa já tem no celular; o que não dá pra copiar sem
//      refazer o trabalho é a fonte primária (docs/tradicao/00-tese.md). Agora
//      o mecanismo aparece no ponto da interrupção, não só na oitava linha da
//      lista de planos. "Nove leituras" = os 9 OneTimeLock do código.
//   3. O CTA PEDIA A ESCADA INTEIRA. "Assinar agora" é o compromisso grande no
//      segundo de maior medo de preço. O rótulo passou a nomear o próximo
//      degrau — e o VERBO é "Ver", não "Começar", porque o toque leva à ESCOLHA
//      DE PLANO (ROUTES.PLANOS), não ao checkout: quem começa mesmo os 7 dias é
//      'planos.cta.trial', uma tela adiante. Ressalva da própria proposta,
//      acatada; a continuidade do botão vive na expressão "meus 7 dias grátis",
//      que sobrevive nas duas telas.
//
// A variante 'quota' (cota da CONTA, 402 do servidor) fica intocada de
// propósito: lá a primeira grátis não é mais "presente recém-dado", é assunto
// encerrado, e o texto honesto de sempre continua valendo.
const PAYWALL_I18N = {
  pt: {
    'onetimelock.freeUsed.title': '{feature}: a primeira foi por conta da casa',
    'onetimelock.freeUsed.text.couple': 'Da segunda em diante é com assinatura: as nove leituras individuais, mais as telas de vocês dois, sem limite. Quando há fonte histórica rastreável, ela aparece; sínteses de IA e convenções modernas são identificadas como tais.',
    'onetimelock.freeUsed.text.solo': 'Da segunda em diante é com assinatura: as nove leituras individuais sem limite. Quando há fonte histórica rastreável, ela aparece; sínteses de IA e convenções modernas são identificadas como tais.',
    'onetimelock.quota.title': 'Suas leituras gratuitas de {feature} acabaram',
    'onetimelock.quota.text.couple': 'A cota gratuita fica na sua conta, não no aparelho. Assine o Cosmic Guide e continue sem limite, você e seu par.',
    'onetimelock.quota.text.solo': 'A cota gratuita fica na sua conta, não no aparelho. Assine o Cosmic Guide e continue sem limite.',
    'onetimelock.login.title': 'Entre na sua conta para usar {feature}',
    'onetimelock.login.text': 'As leituras com foto pedem uma conta — é grátis, leva menos de um minuto e guarda seu histórico.',
    'onetimelock.cta.subscribe': 'Ver meus 7 dias grátis →',
    'onetimelock.cta.login': 'Criar conta / entrar',
    'onetimelock.invite': 'uma assinatura vale pra vocês dois — convide seu par →',
  },
  es: {
    'onetimelock.freeUsed.title': '{feature}: la primera corrió por cuenta de la casa',
    'onetimelock.freeUsed.text.couple': 'De la segunda en adelante va con suscripción: las nueve lecturas individuales, más las pantallas de los dos, sin límite. Cuando existe una fuente histórica rastreable, se muestra; las síntesis de IA y las convenciones modernas se identifican como tales.',
    'onetimelock.freeUsed.text.solo': 'De la segunda en adelante va con suscripción: las nueve lecturas individuales sin límite. Cuando existe una fuente histórica rastreable, se muestra; las síntesis de IA y las convenciones modernas se identifican como tales.',
    'onetimelock.quota.title': 'Se te acabaron las lecturas gratuitas de {feature}',
    'onetimelock.quota.text.couple': 'La cuota gratuita vive en tu cuenta, no en el aparato. Suscribite a Cosmic Guide y seguí sin límite, vos y tu pareja.',
    'onetimelock.quota.text.solo': 'La cuota gratuita vive en tu cuenta, no en el aparato. Suscribite a Cosmic Guide y seguí sin límite.',
    'onetimelock.login.title': 'Entrá a tu cuenta para usar {feature}',
    'onetimelock.login.text': 'Las lecturas con foto piden una cuenta — es gratis, lleva menos de un minuto y guarda tu historial.',
    'onetimelock.cta.subscribe': 'Ver mis 7 días gratis →',
    'onetimelock.cta.login': 'Crear cuenta / entrar',
    'onetimelock.invite': 'una sola suscripción vale para los dos — invita a tu pareja →',
  },
  en: {
    'onetimelock.freeUsed.title': '{feature}: the first one was on us',
    'onetimelock.freeUsed.text.couple': 'From the second one on it takes a subscription: the nine individual readings, plus the screens for the two of you, with no limit. When a traceable historical source exists, it is shown; AI summaries and modern conventions are labeled as such.',
    'onetimelock.freeUsed.text.solo': 'From the second one on it takes a subscription: the nine individual readings with no limit. When a traceable historical source exists, it is shown; AI summaries and modern conventions are labeled as such.',
    'onetimelock.quota.title': 'Your free {feature} readings are used up',
    'onetimelock.quota.text.couple': 'The free quota lives in your account, not on the device. Subscribe to Cosmic Guide and keep going with no limit, you and your partner.',
    'onetimelock.quota.text.solo': 'The free quota lives in your account, not on the device. Subscribe to Cosmic Guide and keep going with no limit.',
    'onetimelock.login.title': 'Sign in to use {feature}',
    'onetimelock.login.text': 'Photo readings need an account — it’s free, takes under a minute, and keeps your history.',
    'onetimelock.cta.subscribe': 'See my 7 days free →',
    'onetimelock.cta.login': 'Create account / sign in',
    'onetimelock.invite': 'one subscription covers you both — invite your partner →',
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
  pt: { 'tab.home': 'Início', 'tab.tarot': 'Tarô', 'tab.chat': 'Órbi', 'tab.profile': 'Perfil' },
  es: { 'tab.home': 'Inicio', 'tab.tarot': 'Tarot', 'tab.chat': 'Órbi', 'tab.profile': 'Perfil' },
  en: { 'tab.home': 'Home', 'tab.tarot': 'Tarot', 'tab.chat': 'Órbi', 'tab.profile': 'Profile' },
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

// ===========================================================================
// RETROSPECTIVA DA LUA CHEIA — 04/08/2026
// ===========================================================================
// O balanço do ciclo desde a última Lua Nova (lib/retroLunacao.js): dias de
// presença, placar do check-in e leituras do Diário, abertos no dia da Lua
// Cheia. Bloco no FIM com Object.assign, igual a IDADE_REAL_CARD_I18N e
// PROFECCOES_CARD_I18N logo acima — DICTS guarda referências a PT/ES/EN, então
// assinar aqui embaixo chega no dicionário do mesmo jeito.
//
// LINHA VERMELHA DESTE BLOCO, e ela é testada (test/retroLunacao.test.js):
// nenhuma destas chaves promete sorte, saúde, resultado ou previsão, e nenhuma
// carrega '%'. Todo número que entra por interpolação é CONTAGEM de coisa que a
// pessoa fez — a tentação de escrever "seu ciclo foi 40% mais leve" é
// exatamente o que a varredura existe pra parar.
const RETRO_LUA_I18N = {
  pt: {
    'home.card.retrolua.title': 'Retrospectiva da Lua Cheia',
    'home.card.retrolua.subtitle': 'Seu ciclo desde a última Lua Nova',
    'home.card.retrolua.subtitleHoje': '🌕 Hoje: seu ciclo está fechando',

    'retroLua.title': 'Retrospectiva da Lua Cheia',
    'retroLua.ciclo': 'Dia {dia} de {duracao} deste ciclo lunar',
    'retroLua.desdeNova': 'Desde a Lua Nova de {data}',

    'retroLua.presenca': 'Sua presença',
    'retroLua.presenca.caption_one': 'dia em que você marcou como estava',
    'retroLua.presenca.caption_other': 'dias em que você marcou como estava',

    'retroLua.placar': 'Como você respondeu',
    'retroLua.placar.caption_one': '1 resposta desde a Lua Nova',
    'retroLua.placar.caption_other': '{n} respostas desde a Lua Nova',
    'retroLua.placar.dominante': 'a resposta que mais se repetiu foi: {humor}',
    'retroLua.placar.empate': 'nenhuma resposta se repetiu mais que as outras',

    'retroLua.leituras': 'Suas leituras',
    'retroLua.leituras.caption_one': 'leitura registrada no Diário neste ciclo',
    'retroLua.leituras.caption_other': 'leituras registradas no Diário neste ciclo',

    'retroLua.resumo': 'O ciclo de relance',
    'retroLua.resumo.presenca': '📅 {n} dias de presença',
    'retroLua.resumo.leituras': '🔮 {n} leituras no Diário',
    'retroLua.resumo.leves': '💛 {n} dias marcados como leves',
    'retroLua.share': 'Compartilhar',
    'retroLua.share.message': 'Meu ciclo até esta Lua Cheia: {dias} dias de presença e {leituras} leituras registradas 🌕 — cosmicguide.cloud',
    'retroLua.swipe': 'deslize',
    'retroLua.back': 'Voltar',
    'retroLua.disclaimer': 'Os números são a contagem do que você mesmo registrou aqui; as datas da Lua vêm de efeméride. Nada nesta tela foi estimado. Leituras são tradição simbólica, para reflexão e entretenimento.',

    'retroLua.aguarde.title': 'Esta tela abre na Lua Cheia',
    'retroLua.aguarde.desc': 'Ela conta o seu ciclo desde a última Lua Nova, e a Lua Cheia é o meio dele. A próxima é em {data}.',
    'retroLua.aguarde.descSemData': 'Ela conta o seu ciclo desde a última Lua Nova, e a Lua Cheia é o meio dele. Volte quando a Lua estiver cheia.',
    'retroLua.aguarde.cta': 'Ver o calendário lunar',

    'retroLua.indisponivel.title': 'Sem a Lua, sem retrospectiva',
    'retroLua.indisponivel.desc': 'O ciclo é medido pela Lua real, e a efeméride não está disponível agora. Preferimos não mostrar número nenhum a mostrar um número inventado.',

    'retroLua.vazio.title': 'Este ciclo ainda não tem registro seu',
    'retroLua.vazio.desc': 'A retrospectiva só conta o que você mesmo marcou aqui — um check-in, uma leitura. Comece hoje e na próxima Lua Cheia ela terá o que contar.',
    'retroLua.vazio.cta': 'Ir para as leituras',
  },
  es: {
    'home.card.retrolua.title': 'Retrospectiva de la Luna Llena',
    'home.card.retrolua.subtitle': 'Tu ciclo desde la última Luna Nueva',
    'home.card.retrolua.subtitleHoje': '🌕 Hoy: tu ciclo se está cerrando',

    'retroLua.title': 'Retrospectiva de la Luna Llena',
    'retroLua.ciclo': 'Día {dia} de {duracao} de este ciclo lunar',
    'retroLua.desdeNova': 'Desde la Luna Nueva del {data}',

    'retroLua.presenca': 'Tu presencia',
    'retroLua.presenca.caption_one': 'día en que marcaste cómo estabas',
    'retroLua.presenca.caption_other': 'días en que marcaste cómo estabas',

    'retroLua.placar': 'Cómo respondiste',
    'retroLua.placar.caption_one': '1 respuesta desde la Luna Nueva',
    'retroLua.placar.caption_other': '{n} respuestas desde la Luna Nueva',
    'retroLua.placar.dominante': 'la respuesta que más se repitió fue: {humor}',
    'retroLua.placar.empate': 'ninguna respuesta se repitió más que las otras',

    'retroLua.leituras': 'Tus lecturas',
    'retroLua.leituras.caption_one': 'lectura registrada en el Diario en este ciclo',
    'retroLua.leituras.caption_other': 'lecturas registradas en el Diario en este ciclo',

    'retroLua.resumo': 'El ciclo de un vistazo',
    'retroLua.resumo.presenca': '📅 {n} días de presencia',
    'retroLua.resumo.leituras': '🔮 {n} lecturas en el Diario',
    'retroLua.resumo.leves': '💛 {n} días marcados como ligeros',
    'retroLua.share': 'Compartir',
    'retroLua.share.message': 'Mi ciclo hasta esta Luna Llena: {dias} días de presencia y {leituras} lecturas registradas 🌕 — cosmicguide.cloud',
    'retroLua.swipe': 'desliza',
    'retroLua.back': 'Volver',
    'retroLua.disclaimer': 'Los números son el conteo de lo que vos mismo registraste acá; las fechas de la Luna vienen de efemérides. Nada en esta pantalla fue estimado. Las lecturas son tradición simbólica, para reflexión y entretenimiento.',

    'retroLua.aguarde.title': 'Esta pantalla abre en Luna Llena',
    'retroLua.aguarde.desc': 'Cuenta tu ciclo desde la última Luna Nueva, y la Luna Llena es la mitad de él. La próxima es el {data}.',
    'retroLua.aguarde.descSemData': 'Cuenta tu ciclo desde la última Luna Nueva, y la Luna Llena es la mitad de él. Volvé cuando la Luna esté llena.',
    'retroLua.aguarde.cta': 'Ver el calendario lunar',

    'retroLua.indisponivel.title': 'Sin la Luna, no hay retrospectiva',
    'retroLua.indisponivel.desc': 'El ciclo se mide por la Luna real, y las efemérides no están disponibles ahora. Preferimos no mostrar ningún número antes que mostrar uno inventado.',

    'retroLua.vazio.title': 'Este ciclo todavía no tiene registro tuyo',
    'retroLua.vazio.desc': 'La retrospectiva sólo cuenta lo que vos mismo marcaste acá — un check-in, una lectura. Empezá hoy y en la próxima Luna Llena va a tener qué contar.',
    'retroLua.vazio.cta': 'Ir a las lecturas',
  },
  en: {
    'home.card.retrolua.title': 'Full Moon Recap',
    'home.card.retrolua.subtitle': 'Your cycle since the last New Moon',
    'home.card.retrolua.subtitleHoje': '🌕 Today: your cycle is closing',

    'retroLua.title': 'Full Moon Recap',
    'retroLua.ciclo': 'Day {dia} of {duracao} in this lunar cycle',
    'retroLua.desdeNova': 'Since the New Moon of {data}',

    'retroLua.presenca': 'Your presence',
    'retroLua.presenca.caption_one': 'day you logged how you were',
    'retroLua.presenca.caption_other': 'days you logged how you were',

    'retroLua.placar': 'How you answered',
    'retroLua.placar.caption_one': '1 answer since the New Moon',
    'retroLua.placar.caption_other': '{n} answers since the New Moon',
    'retroLua.placar.dominante': 'the answer that came up most was: {humor}',
    'retroLua.placar.empate': 'no answer came up more than the others',

    'retroLua.leituras': 'Your readings',
    'retroLua.leituras.caption_one': 'reading saved to your Journal this cycle',
    'retroLua.leituras.caption_other': 'readings saved to your Journal this cycle',

    'retroLua.resumo': 'The cycle at a glance',
    'retroLua.resumo.presenca': '📅 {n} days present',
    'retroLua.resumo.leituras': '🔮 {n} readings in your Journal',
    'retroLua.resumo.leves': '💛 {n} days logged as light',
    'retroLua.share': 'Share',
    'retroLua.share.message': 'My cycle up to this Full Moon: {dias} days present and {leituras} readings saved 🌕 — cosmicguide.cloud',
    'retroLua.swipe': 'swipe',
    'retroLua.back': 'Back',
    'retroLua.disclaimer': 'The numbers are a count of what you logged here yourself; the Moon dates come from ephemeris data. Nothing on this screen was estimated. Readings are symbolic tradition, for reflection and entertainment.',

    'retroLua.aguarde.title': 'This screen opens on the Full Moon',
    'retroLua.aguarde.desc': 'It tells the story of your cycle since the last New Moon, and the Full Moon is its midpoint. The next one is on {data}.',
    'retroLua.aguarde.descSemData': 'It tells the story of your cycle since the last New Moon, and the Full Moon is its midpoint. Come back when the Moon is full.',
    'retroLua.aguarde.cta': 'Open the lunar calendar',

    'retroLua.indisponivel.title': 'No Moon, no recap',
    'retroLua.indisponivel.desc': 'The cycle is measured by the real Moon, and ephemeris data is unavailable right now. We would rather show no number at all than show a made-up one.',

    'retroLua.vazio.title': 'This cycle has nothing of yours in it yet',
    'retroLua.vazio.desc': 'The recap only counts what you logged here yourself — a check-in, a reading. Start today and by the next Full Moon it will have something to tell.',
    'retroLua.vazio.cta': 'Go to the readings',
  },
};
Object.assign(PT, RETRO_LUA_I18N.pt);
Object.assign(ES, RETRO_LUA_I18N.es);
Object.assign(EN, RETRO_LUA_I18N.en);

// ===========================================================================
// O ARCO DE 7 DIAS — a seção de constância dentro da Jornada
// ===========================================================================
// O motor é lib/arco.js; esta é a moldura inteira dela (não existe pack de
// tradução aqui porque não existe CONTEÚDO — existe rótulo).
//
// A LINHA VERMELHA DESTE BLOCO, e ela vale nos três idiomas: nenhum texto aqui
// pode prometer efeito. O convite descreve um GESTO que a pessoa consegue
// provar que fez ("escrever 1 linha", "beber 1 copo d'água"), nunca o que ele
// causaria ("dormir melhor", "acalmar", "dar sorte"). O número que acompanha é
// contagem do que aconteceu — por isso 'arco.nota' diz isso com todas as
// letras, em vez de deixar subentendido.
//
// test/arco.test.js varre estas chaves nos três idiomas atrás de vocabulário de
// promessa e de saúde. Frase nova aqui passa por lá antes de existir — em
// espanhol e em inglês também, que é a mesma régua de test/grounding.test.js:
// uma alegação de saúde não fica menos alegação por estar traduzida.
const ARCO_I18N = {
  pt: {
    'arco.kicker': 'Arco de 7 dias',
    'arco.escolha.title': 'Escolha um convite',
    'arco.escolha.body':
      'Um só, por sete dias. O app não faz nada além de contar os dias em que você veio.',
    'arco.categoria.mente': 'Mente',
    'arco.categoria.corpo': 'Corpo',
    'arco.categoria.espirito': 'Espírito',
    'arco.convite.linha': 'Escrever 1 linha antes de dormir',
    'arco.convite.nomear': 'Nomear 1 coisa que aconteceu no dia',
    'arco.convite.respirar': '1 minuto de respiração ao acordar',
    'arco.convite.agua': 'Beber 1 copo d’água ao abrir o app',
    'arco.convite.ceu': 'Olhar o céu por um instante',
    'arco.convite.silencio': '2 minutos sem tela',
    'arco.dia': 'Dia {dia} de {total}',
    'arco.todosOsDias': 'você veio todos os dias',
    'arco.contagem': '{feitos} dias marcados até aqui',
    'arco.contagem.um': '1 dia marcado até aqui',
    'arco.contagem.zero': 'nenhum dia marcado ainda',
    'arco.marcar': 'Marcar hoje',
    'arco.marcado': 'Hoje está marcado.',
    'arco.a11y': 'Arco de 7 dias — dia {dia} de {total}, {feitos} dias marcados',
    'arco.nota': 'O número conta o que você fez, e só isso.',
    'arco.selo.title': 'Arco fechado',
    'arco.selo.convite': 'O convite era: {convite}',
    'arco.selo.placar': '{feitos} de {total} dias marcados',
    'arco.selo.sequencia': 'maior sequência: {n} dias seguidos',
    'arco.selo.sequencia.um': 'maior sequência: 1 dia',
    'arco.novo': 'Escolher outro convite',
    'arco.selos': 'Arcos que você fechou: {n}',
    'arco.trocar': 'Trocar de convite',
    'arco.trocar.confirma':
      'Trocar agora apaga este arco — ele não vira selo. Toque de novo pra confirmar.',
  },
  es: {
    'arco.kicker': 'Arco de 7 días',
    'arco.escolha.title': 'Elegí una invitación',
    'arco.escolha.body':
      'Una sola, por siete días. El app no hace nada más que contar los días en que viniste.',
    'arco.categoria.mente': 'Mente',
    'arco.categoria.corpo': 'Cuerpo',
    'arco.categoria.espirito': 'Espíritu',
    'arco.convite.linha': 'Escribir 1 línea antes de dormir',
    'arco.convite.nomear': 'Nombrar 1 cosa que pasó en el día',
    'arco.convite.respirar': '1 minuto de respiración al despertar',
    'arco.convite.agua': 'Tomar 1 vaso de agua al abrir el app',
    'arco.convite.ceu': 'Mirar el cielo por un instante',
    'arco.convite.silencio': '2 minutos sin pantalla',
    'arco.dia': 'Día {dia} de {total}',
    'arco.todosOsDias': 'viniste todos los días',
    'arco.contagem': '{feitos} días marcados hasta acá',
    'arco.contagem.um': '1 día marcado hasta acá',
    'arco.contagem.zero': 'ningún día marcado todavía',
    'arco.marcar': 'Marcar hoy',
    'arco.marcado': 'Hoy ya está marcado.',
    'arco.a11y': 'Arco de 7 días — día {dia} de {total}, {feitos} días marcados',
    'arco.nota': 'El número cuenta lo que hiciste, y nada más.',
    'arco.selo.title': 'Arco cerrado',
    'arco.selo.convite': 'La invitación era: {convite}',
    'arco.selo.placar': '{feitos} de {total} días marcados',
    'arco.selo.sequencia': 'racha más larga: {n} días seguidos',
    'arco.selo.sequencia.um': 'racha más larga: 1 día',
    'arco.novo': 'Elegir otra invitación',
    'arco.selos': 'Arcos que cerraste: {n}',
    'arco.trocar': 'Cambiar de invitación',
    'arco.trocar.confirma':
      'Cambiar ahora borra este arco — no se convierte en sello. Tocá de nuevo para confirmar.',
  },
  en: {
    'arco.kicker': '7-day arc',
    'arco.escolha.title': 'Pick one invitation',
    'arco.escolha.body':
      'Just one, for seven days. The app does nothing but count the days you showed up.',
    'arco.categoria.mente': 'Mind',
    'arco.categoria.corpo': 'Body',
    'arco.categoria.espirito': 'Spirit',
    'arco.convite.linha': 'Write 1 line before bed',
    'arco.convite.nomear': 'Name 1 thing that happened today',
    'arco.convite.respirar': '1 minute of breathing when you wake up',
    'arco.convite.agua': 'Drink 1 glass of water when you open the app',
    'arco.convite.ceu': 'Look at the sky for a moment',
    'arco.convite.silencio': '2 minutes with no screen',
    'arco.dia': 'Day {dia} of {total}',
    'arco.todosOsDias': 'you showed up every day',
    'arco.contagem': '{feitos} days marked so far',
    'arco.contagem.um': '1 day marked so far',
    'arco.contagem.zero': 'no days marked yet',
    'arco.marcar': 'Mark today',
    'arco.marcado': 'Today is marked.',
    'arco.a11y': '7-day arc — day {dia} of {total}, {feitos} days marked',
    'arco.nota': 'The number counts what you did, and nothing else.',
    'arco.selo.title': 'Arc closed',
    'arco.selo.convite': 'The invitation was: {convite}',
    'arco.selo.placar': '{feitos} of {total} days marked',
    'arco.selo.sequencia': 'longest run: {n} days in a row',
    'arco.selo.sequencia.um': 'longest run: 1 day',
    'arco.novo': 'Pick another invitation',
    'arco.selos': 'Arcs you closed: {n}',
    'arco.trocar': 'Switch invitation',
    'arco.trocar.confirma':
      'Switching now erases this arc — it will not become a seal. Tap again to confirm.',
  },
};
Object.assign(PT, ARCO_I18N.pt);
Object.assign(ES, ARCO_I18N.es);
Object.assign(EN, ARCO_I18N.en);

// ---------------------------------------------------------------------------
// ONDA DE DIAGRAMAÇÃO (08/08/2026) — três blocos independentes, um por frente
// de trabalho, seguindo a convenção do ARCO_I18N (dicionário próprio +
// Object.assign no fim). Blocos separados de propósito: permitem trabalho
// paralelo sem duas edições disputarem a mesma região do arquivo.
// ---------------------------------------------------------------------------

// [BLOCO-ELEMENTOS] — Elementos com % no Mapa Astral
// A porcentagem é aritmética real (lib/elementos.js: 10 planetas, % =
// contagem × 10) e o recibo diz a conta na cara. As leituras de dominante são
// CONVITE ("repare se..."), nunca promessa — doutrina do app. As chaves
// reading.* usam o identificador do motor (fogo/terra/ar/agua) como sufixo.
const ELEMENTOS_I18N = {
  pt: {
    'birthchart.elements.title': 'Seus elementos',
    'birthchart.elements.fire': 'Fogo',
    'birthchart.elements.earth': 'Terra',
    'birthchart.elements.air': 'Ar',
    'birthchart.elements.water': 'Água',
    'birthchart.elements.reading.fogo':
      'Fogo é o que mais aparece no seu céu — repare se você costuma começar as coisas pelo impulso, com um entusiasmo que acende rápido.',
    'birthchart.elements.reading.terra':
      'Terra é o que mais aparece no seu céu — repare se você confia mais no que dá pra tocar, medir e manter: o concreto costuma falar mais alto.',
    'birthchart.elements.reading.ar':
      'Ar é o que mais aparece no seu céu — repare se conversar e entender costuma vir antes de sentir: as ideias são o seu primeiro idioma.',
    'birthchart.elements.reading.agua':
      'Água é o que mais aparece no seu céu — repare se o clima de um lugar ou de uma pessoa chega em você antes de qualquer palavra.',
    'birthchart.elements.reading.equilibrio':
      'Nenhum elemento manda sozinho no seu céu: a contagem empatou lá em cima. Repare qual desses jeitos você reconhece mais no seu dia a dia.',
    'birthchart.elements.receipt':
      'Conta: o signo de cada um dos 10 planetas do seu céu de nascimento — {n} em {elemento} = {pct}%.',
    'birthchart.elements.receiptNoTime':
      'Sem hora de nascimento, as posições usam o meio-dia como aproximação.',
  },
  es: {
    'birthchart.elements.title': 'Tus elementos',
    'birthchart.elements.fire': 'Fuego',
    'birthchart.elements.earth': 'Tierra',
    'birthchart.elements.air': 'Aire',
    'birthchart.elements.water': 'Agua',
    'birthchart.elements.reading.fogo':
      'El Fuego es lo que más aparece en tu cielo — fíjate si sueles empezar las cosas por impulso, con un entusiasmo que prende rápido.',
    'birthchart.elements.reading.terra':
      'La Tierra es lo que más aparece en tu cielo — fíjate si confías más en lo que se puede tocar, medir y sostener: lo concreto suele hablar más fuerte.',
    'birthchart.elements.reading.ar':
      'El Aire es lo que más aparece en tu cielo — fíjate si conversar y entender suele llegar antes que sentir: las ideas son tu primer idioma.',
    'birthchart.elements.reading.agua':
      'El Agua es lo que más aparece en tu cielo — fíjate si el clima de un lugar o de una persona te llega antes que cualquier palabra.',
    'birthchart.elements.reading.equilibrio':
      'Ningún elemento manda solo en tu cielo: el conteo quedó empatado arriba. Fíjate cuál de estos estilos reconoces más en tu día a día.',
    'birthchart.elements.receipt':
      'La cuenta: el signo de cada uno de los 10 planetas de tu cielo de nacimiento — {n} en {elemento} = {pct}%.',
    'birthchart.elements.receiptNoTime':
      'Sin hora de nacimiento, las posiciones usan el mediodía como aproximación.',
  },
  en: {
    'birthchart.elements.title': 'Your elements',
    'birthchart.elements.fire': 'Fire',
    'birthchart.elements.earth': 'Earth',
    'birthchart.elements.air': 'Air',
    'birthchart.elements.water': 'Water',
    'birthchart.elements.reading.fogo':
      'Fire shows up most in your sky — notice whether you tend to start things on impulse, with an enthusiasm that catches quickly.',
    'birthchart.elements.reading.terra':
      'Earth shows up most in your sky — notice whether you trust what you can touch, measure and keep: the concrete tends to speak loudest.',
    'birthchart.elements.reading.ar':
      'Air shows up most in your sky — notice whether talking and understanding tend to come before feeling: ideas are your first language.',
    'birthchart.elements.reading.agua':
      'Water shows up most in your sky — notice whether the mood of a place or a person reaches you before any words do.',
    'birthchart.elements.reading.equilibrio':
      'No single element runs your sky: the count is tied at the top. Notice which of these styles you recognize most in your day-to-day.',
    'birthchart.elements.receipt':
      'The math: the sign of each of the 10 planets in your birth sky — {n} in {elemento} = {pct}%.',
    'birthchart.elements.receiptNoTime':
      'Without a birth time, positions use noon as an approximation.',
  },
};
Object.assign(PT, ELEMENTOS_I18N.pt);
Object.assign(ES, ELEMENTOS_I18N.es);
Object.assign(EN, ELEMENTOS_I18N.en);

// [BLOCO-EVENTOS] — Countdown de eventos do céu na Home
// O card "O céu nos próximos dias" (HomeScreen) mostra o próximo evento REAL
// do Calendário Cósmico com contagem regressiva. Aqui vive só o CHROME do
// card: rótulo, contagem e CTA. O título do evento em si vem do motor
// (lib/proximosEventos.js → lib/calendarioCosmico.js), já traduzido pelos
// packs de lib/traducoes/ — nenhuma string de evento entra neste dicionário.
// Plural por construção: 0 é a chave de hoje, 1 a de amanhã, então a chave
// com {n} só recebe n >= 2 — "dias/días/days" está sempre no plural certo.
// A seta no CTA segue o precedente de home.sky.inviteCta: texto-link sem
// Ionicons ao lado desenha a própria seta.
const EVENTOS_I18N = {
  pt: {
    'home.eventos.label': 'O céu nos próximos dias',
    'home.eventos.hoje': 'Hoje',
    'home.eventos.amanha': 'Amanhã',
    'home.eventos.dias': 'Faltam {n} dias',
    'home.eventos.cta': 'Ver calendário completo →',
  },
  es: {
    'home.eventos.label': 'El cielo en los próximos días',
    'home.eventos.hoje': 'Hoy',
    'home.eventos.amanha': 'Mañana',
    'home.eventos.dias': 'Faltan {n} días',
    'home.eventos.cta': 'Ver calendario completo →',
  },
  en: {
    'home.eventos.label': 'The sky in the coming days',
    'home.eventos.hoje': 'Today',
    'home.eventos.amanha': 'Tomorrow',
    'home.eventos.dias': 'In {n} days',
    'home.eventos.cta': 'See full calendar →',
  },
};
Object.assign(PT, EVENTOS_I18N.pt);
Object.assign(ES, EVENTOS_I18N.es);
Object.assign(EN, EVENTOS_I18N.en);

// [BLOCO-STORIES] — Modo história (leituras em slides)
// Só o CHROME do leitor (components/StoriesReader.js) e o botão de abrir nas
// três telas de leitura longa. O conteúdo dos slides nunca passa por aqui: é a
// própria leitura, fatiada por lib/storySlides.js sem mudar um byte.
const STORIES_I18N = {
  pt: {
    'stories.ver': 'Ver como história',
    'stories.fechar': 'Fechar',
    'stories.avancar': 'Avançar',
    'stories.voltar': 'Voltar',
    'stories.concluir': 'Concluir',
    'stories.contador': 'Slide {i} de {n}',
  },
  es: {
    'stories.ver': 'Ver como historia',
    'stories.fechar': 'Cerrar',
    'stories.avancar': 'Avanzar',
    'stories.voltar': 'Volver',
    'stories.concluir': 'Concluir',
    'stories.contador': 'Diapositiva {i} de {n}',
  },
  en: {
    'stories.ver': 'View as story',
    'stories.fechar': 'Close',
    'stories.avancar': 'Next',
    'stories.voltar': 'Back',
    'stories.concluir': 'Done',
    'stories.contador': 'Slide {i} of {n}',
  },
};
Object.assign(PT, STORIES_I18N.pt);
Object.assign(ES, STORIES_I18N.es);
Object.assign(EN, STORIES_I18N.en);

// [BLOCO-OUVIR] — Botão "Ouvir" (leitura em voz alta com a voz do aparelho)
// Só o CHROME do botão (components/BotaoOuvir.js): o rótulo de tocar e o de
// parar. O texto FALADO é a própria leitura, já resolvida no idioma do app —
// nunca passa por aqui. A voz é a do navegador (Web Speech API, lib/voz.js):
// custo zero, offline, e utterance.lang segue o idioma do app.
const OUVIR_I18N = {
  pt: {
    'ouvir.ouvir': 'Ouvir',
    'ouvir.parar': 'Parar',
  },
  es: {
    'ouvir.ouvir': 'Escuchar',
    'ouvir.parar': 'Detener',
  },
  en: {
    'ouvir.ouvir': 'Listen',
    'ouvir.parar': 'Stop',
  },
};
Object.assign(PT, OUVIR_I18N.pt);
Object.assign(ES, OUVIR_I18N.es);
Object.assign(EN, OUVIR_I18N.en);

// ---------------------------------------------------------------------------
// DÍVIDA DE CHROME (09/08/2026, auditoria das 8 ondas): texto PT cravado nas
// telas reformadas — quem usa es/en via chrome em português. Três blocos
// independentes (um por tela) pra correção paralela sem colisão.
// ---------------------------------------------------------------------------

// [BLOCO-CHROME-MAPA] — BirthChartScreen
// Só o CHROME da tela: recibo do instante, grade de casas, avisos de "falta
// hora e cidade", conectivos da astrocartografia e o formulário de nascimento.
// Nome de signo/planeta/cidade é DADO do motor (lib/signs.js) e não passa por
// aqui — os templates recebem o dado pronto em {placeholder}. O título "Mapa
// Astral" reusa home.card.birthchart.title (mesmo precedente do Horóscopo).
const CHROME_MAPA_I18N = {
  pt: {
    // O sufixo do recibo do hero — irmão do 'birthchart.noTime' na mesma linha.
    'birthchart.dst': 'horário de verão',
    'birthchart.header.subtitle': 'Seu retrato cósmico',
    // Grade de casas (Casas Inteiras) — o número é dado, o rótulo é chrome.
    'birthchart.houseNumber': 'Casa {n}',
    'birthchart.housesNeed':
      'As Casas pedem hora exata e cidade de nascimento (mesma exigência do Ascendente) — adicione os dois para descobrir.',
    // Recibo do aspecto/ângulo — {deg} já chega formatado (uma casa decimal).
    'birthchart.orb': 'orbe {deg}°',
    'birthchart.astroPreviewNote':
      'Prévia textual com cidades notáveis — ainda não é um mapa interativo completo.',
    // {planet}/{point}/{city} são dados do motor; só os conectivos traduzem.
    'birthchart.astroLine': '{planet} perto de {point} em {city}',
    'birthchart.astroNeed':
      'A astrocartografia pede hora exata e cidade de nascimento (mesma exigência do Ascendente) — adicione os dois para descobrir.',
    // Formulário de nascimento (solo e casal).
    'birthchart.form.addCityAsc': 'Adicionar cidade (para o Ascendente)',
    'birthchart.form.birthDate': 'Data de nascimento',
    'birthchart.form.hourPlaceholder': 'Hora',
    'birthchart.form.minPlaceholder': 'Min',
    'birthchart.form.cityOptional': 'Cidade de nascimento (opcional)',
    'birthchart.couple.missingDate':
      'Não encontramos a data de nascimento de {name}. Refaça o Quiz do Casal (em Perfil) para calcular o mapa astral.',
  },
  es: {
    'birthchart.dst': 'horario de verano',
    'birthchart.header.subtitle': 'Tu retrato cósmico',
    'birthchart.houseNumber': 'Casa {n}',
    'birthchart.housesNeed':
      'Las Casas piden hora exacta y ciudad de nacimiento (la misma exigencia del Ascendente) — añade las dos para descubrirlas.',
    'birthchart.orb': 'orbe {deg}°',
    'birthchart.astroPreviewNote':
      'Vista previa en texto con ciudades notables — todavía no es un mapa interactivo completo.',
    'birthchart.astroLine': '{planet} cerca de {point} en {city}',
    'birthchart.astroNeed':
      'La astrocartografía pide hora exacta y ciudad de nacimiento (la misma exigencia del Ascendente) — añade las dos para descubrirla.',
    'birthchart.form.addCityAsc': 'Añadir ciudad (para el Ascendente)',
    'birthchart.form.birthDate': 'Fecha de nacimiento',
    'birthchart.form.hourPlaceholder': 'Hora',
    'birthchart.form.minPlaceholder': 'Min',
    'birthchart.form.cityOptional': 'Ciudad de nacimiento (opcional)',
    'birthchart.couple.missingDate':
      'No encontramos la fecha de nacimiento de {name}. Vuelve a hacer el Quiz de Pareja (en Perfil) para calcular la carta astral.',
  },
  en: {
    'birthchart.dst': 'daylight saving time',
    'birthchart.header.subtitle': 'Your cosmic portrait',
    'birthchart.houseNumber': 'House {n}',
    'birthchart.housesNeed':
      'The Houses need your exact birth time and city (the same requirement as the Ascendant) — add both to find out.',
    'birthchart.orb': 'orb {deg}°',
    'birthchart.astroPreviewNote':
      'A text preview across notable cities — not a full interactive map yet.',
    'birthchart.astroLine': '{planet} near {point} in {city}',
    'birthchart.astroNeed':
      'Astrocartography needs your exact birth time and city (the same requirement as the Ascendant) — add both to find out.',
    'birthchart.form.addCityAsc': 'Add a city (for the Ascendant)',
    'birthchart.form.birthDate': 'Birth date',
    'birthchart.form.hourPlaceholder': 'Hour',
    'birthchart.form.minPlaceholder': 'Min',
    'birthchart.form.cityOptional': 'Birth city (optional)',
    'birthchart.couple.missingDate':
      "We couldn't find {name}'s birth date. Redo the Couple Quiz (in Profile) to calculate the birth chart.",
  },
};
Object.assign(PT, CHROME_MAPA_I18N.pt);
Object.assign(ES, CHROME_MAPA_I18N.es);
Object.assign(EN, CHROME_MAPA_I18N.en);

// [BLOCO-CHROME-COMPAT] — CompatibilityScreen
// Só o CHROME da tela: header, as quatro manchetes de categoria, a nota do
// 1-uso-grátis, a geometria do círculo e a oferta de pico emocional. A PROSA
// das leituras vem dos packs de lib/traducoes/synastry.* e não passa por aqui.
//
// LINHAS VERMELHAS DESTE BLOCO:
//   · compat.manchete.* obedece à regra 2 de lib/synastry.js — nenhuma frase
//     decreta desfecho, e test/synastry.test.js varre os valores nos três
//     idiomas com o mesmo filtro FATALISMO do motor;
//   · compat.header.subtitle descreve o que a tela FAZ ("Encontre seu par
//     celestial" é o tipo de promessa que o mesmo teste recusa);
//   · compat.geometry.signs_one/_other resolvem o plural por CHAVE (o ternário
//     da tela escolhe), sem lógica de plural no dicionário — o padrão de
//     arco.contagem/arco.contagem.um.
const CHROME_COMPAT_I18N = {
  pt: {
    'compat.header.title': 'Compatibilidade',
    'compat.header.subtitle': 'Como é na vida real — e de onde isso vem',
    'compat.manchete.harmonico': 'Vocês se entendem fácil — a fonte chama isto de aspecto harmônico',
    'compat.manchete.desarmonico': 'Tem atrito de verdade aqui — e a tradição não para na palavra dura',
    'compat.manchete.semAspecto': 'Esses dois signos nem se enxergam de saída — sem aspecto na fonte',
    'compat.manchete.copresenca': 'Dois iguais no mesmo lugar — mesmo signo, co-presença, não aspecto',
    'compat.locked.note': 'Essa foi sua leitura grátis — assine para calcular outras combinações quando quiser.',
    'compat.geometry.sameSign': 'mesmo signo',
    'compat.geometry.signs_one': '{graus}° · {distancia} signo',
    'compat.geometry.signs_other': '{graus}° · {distancia} signos',
    'compat.offer.title': '✨ {aspecto} entre vocês!',
    'compat.offer.body':
      'Um aspecto que a tradição chama de harmônico merece ser explorado por inteiro — leituras sem limite, Tarô todo dia e o céu de vocês dois. 7 dias grátis pra testar.',
  },
  es: {
    'compat.header.title': 'Compatibilidad',
    'compat.header.subtitle': 'Cómo es en la vida real — y de dónde viene esto',
    'compat.manchete.harmonico': 'Ustedes se entienden fácil — la fuente llama a esto aspecto armónico',
    'compat.manchete.desarmonico': 'Hay fricción de verdad acá — y la tradición no se queda en la palabra dura',
    'compat.manchete.semAspecto': 'Estos dos signos ni se ven de entrada — sin aspecto en la fuente',
    'compat.manchete.copresenca': 'Dos iguales en el mismo lugar — mismo signo, copresencia, no aspecto',
    'compat.locked.note': 'Esa fue tu lectura gratis — suscribite para calcular otras combinaciones cuando quieras.',
    'compat.geometry.sameSign': 'mismo signo',
    'compat.geometry.signs_one': '{graus}° · {distancia} signo',
    'compat.geometry.signs_other': '{graus}° · {distancia} signos',
    'compat.offer.title': '✨ ¡{aspecto} entre ustedes!',
    'compat.offer.body':
      'Un aspecto que la tradición llama armónico merece explorarse por completo — lecturas sin límite, Tarot todos los días y el cielo de los dos. 7 días gratis para probar.',
  },
  en: {
    'compat.header.title': 'Compatibility',
    'compat.header.subtitle': 'What it is like in real life — and where it comes from',
    'compat.manchete.harmonico': 'You two get each other easily — the source calls this a harmonious aspect',
    'compat.manchete.desarmonico': 'There is real friction here — and the tradition does not stop at the harsh word',
    'compat.manchete.semAspecto': 'These two signs do not even see each other at first — no aspect in the source',
    'compat.manchete.copresenca': 'Two of a kind in the same place — same sign, co-presence, not an aspect',
    'compat.locked.note': 'That was your free reading — subscribe to calculate other combinations whenever you want.',
    'compat.geometry.sameSign': 'same sign',
    'compat.geometry.signs_one': '{graus}° · {distancia} sign',
    'compat.geometry.signs_other': '{graus}° · {distancia} signs',
    'compat.offer.title': '✨ {aspecto} between you two!',
    'compat.offer.body':
      'An aspect the tradition calls harmonious deserves to be explored in full — unlimited readings, Tarot every day and the sky of you both. 7 free days to try it.',
  },
};
Object.assign(PT, CHROME_COMPAT_I18N.pt);
Object.assign(ES, CHROME_COMPAT_I18N.es);
Object.assign(EN, CHROME_COMPAT_I18N.en);

// [BLOCO-CHROME-LUA] — LunarCalendarScreen
// Só o CHROME antigo da tela: título (que também é o featureTitle do
// OneTimeLock e o typeLabel gravado no Diário), subtítulo, linha de iluminação,
// fallback de efeméride e o DISCLAIMER de honestidade. O CONTEÚDO não passa por
// aqui: nome/reflexão das fases saem de lib/lunarCalendar.js e todo o bloco da
// Lua fora de curso sai de lib/traducoes/luaForaDeCurso.{pt,es,en}.js — regra
// do cabeçalho da própria tela.
// O disclaimer é contrato com o leitor (astronomia de verdade na conta, a
// idade de cada moldura dita com nome e ano, convite em vez de promessa) — as
// traduções mantêm as três partes fielmente, e test/screenDisclaimers.test.js
// varre a chave nos três idiomas por credencial clínica.
const CHROME_LUA_I18N = {
  pt: {
    'lunar.title': 'Calendário Lunar',
    'lunar.subtitle': 'Fases da Lua em tempo real',
    'lunar.illuminatedToday': '{n}% iluminada hoje',
    'lunar.unavailable':
      'Não foi possível calcular a fase da Lua agora. Tente novamente mais tarde.',
    'lunar.disclaimer':
      'A fase da Lua é calculada com astronomia real (posição Sol-Lua). As reflexões que ' +
      'acompanham cada fase misturam duas idades, e a tela diz qual é qual: a divisão em quatro ' +
      'quartos e o calendário agrícola romano são antigos; a leitura das oito fases nomeadas é ' +
      'de 1967 (Dane Rudhyar). Convite simbólico, não garantia de resultado.',
  },
  es: {
    'lunar.title': 'Calendario Lunar',
    'lunar.subtitle': 'Fases de la Luna en tiempo real',
    'lunar.illuminatedToday': '{n}% iluminada hoy',
    'lunar.unavailable':
      'No fue posible calcular la fase de la Luna ahora. Inténtalo de nuevo más tarde.',
    'lunar.disclaimer':
      'La fase de la Luna se calcula con astronomía real (posición Sol-Luna). Las reflexiones ' +
      'que acompañan cada fase mezclan dos edades, y la pantalla dice cuál es cuál: la división ' +
      'en cuatro cuartos y el calendario agrícola romano son antiguos; la lectura de las ocho ' +
      'fases con nombre es de 1967 (Dane Rudhyar). Invitación simbólica, no garantía de resultado.',
  },
  en: {
    'lunar.title': 'Lunar Calendar',
    'lunar.subtitle': 'Moon phases in real time',
    'lunar.illuminatedToday': '{n}% illuminated today',
    'lunar.unavailable':
      "We couldn't calculate the Moon's phase right now. Please try again later.",
    'lunar.disclaimer':
      "The Moon's phase is calculated with real astronomy (Sun-Moon position). The reflections " +
      'that come with each phase mix two ages, and the screen says which is which: the division ' +
      'into four quarters and the Roman agricultural calendar are ancient; the reading of the ' +
      'eight named phases dates from 1967 (Dane Rudhyar). A symbolic invitation, not a guarantee of results.',
  },
};
Object.assign(PT, CHROME_LUA_I18N.pt);
Object.assign(ES, CHROME_LUA_I18N.es);
Object.assign(EN, CHROME_LUA_I18N.en);

// [BLOCO-PLANOS] — redesign premium da tela de Planos (09/08/2026)
//
// Duas chaves, as duas amarradas a fato verificável — doutrina do app:
//   · badge.bestValue: o selo só é RENDERIZADO se a aritmética da tela
//     confirmar (MELHOR_VALOR_ID em screens/PlanosScreen.js: anual US$ 20 <
//     12 × US$ 5 = US$ 60). O texto não afirma número nenhum; os números
//     ficam na pílula de economia (planos.plan.*.badge), que também só
//     aparece quando economiaPct() > 0.
//   · trust: repete SÓ o que os Termos e o FAQ já garantem por escrito
//     (terms.payments.body / help.faq.cancel.answer): cancela quando quiser
//     na área de compras da Hotmart e o acesso vai até o fim do período pago.
//     Nada de "sem risco", nada de promessa de resultado.
const PLANOS_I18N = {
  pt: {
    'planos.badge.bestValue': 'MELHOR VALOR',
    'planos.trust': 'Cancele quando quiser, direto na sua área de compras da Hotmart — o acesso continua até o fim do período já pago.',
    // Pill flutuante de assinar (components/PillPremium.js) — oferta real,
    // visível só pra quem comprovadamente não assina.
    'planos.pill.top': 'Acesse tudo',
    'planos.pill.premium': 'Premium',
  },
  es: {
    'planos.badge.bestValue': 'MEJOR VALOR',
    'planos.trust': 'Cancelá cuando quieras, directo en tu área de compras de Hotmart — el acceso sigue hasta el final del período ya pagado.',
    'planos.pill.top': 'Accedé a todo',
    'planos.pill.premium': 'Premium',
  },
  en: {
    'planos.badge.bestValue': 'BEST VALUE',
    'planos.trust': 'Cancel anytime, right in your Hotmart purchases area — access continues until the end of the period you already paid for.',
    'planos.pill.top': 'Unlock everything',
    'planos.pill.premium': 'Premium',
  },
};
Object.assign(PT, PLANOS_I18N.pt);
Object.assign(ES, PLANOS_I18N.es);
Object.assign(EN, PLANOS_I18N.en);

// [BLOCO-ESPERA] — estados de espera/vazio ilustrados (09/08/2026)
// Enquanto a IA gera (Sonhos, Café, Palma), o spinner seco virou um bloco com
// a arte da tela pulsando e UMA frase de espera — descrição honesta do que
// está acontecendo agora, nunca promessa de resultado. Os rodapés que já
// existiam (dream.interpreting, coffee.analyzing, palm.analyzing) seguem
// intocados, embaixo do bloco, ao lado do indicador pequeno.
// [AUTO-DECISION] uma frase POR TELA em vez de uma genérica: cada espera lê
// uma coisa diferente (o sonho digitado, a foto da borra, a foto do corpo) e
// a frase certa custa só três chaves. A de Palma fala da FOTO, não da palma,
// porque a tela é um hub de 4 modos (Palma/Rosto/Pé/Pintas) e a mesma frase
// precisa servir aos quatro.
const ESPERA_I18N = {
  pt: {
    'espera.dream': 'Lendo os símbolos do seu sonho…',
    'espera.coffee': 'Olhando com calma os desenhos da borra…',
    'espera.palm': 'Percorrendo os traços da sua foto…',
  },
  es: {
    'espera.dream': 'Leyendo los símbolos de tu sueño…',
    'espera.coffee': 'Mirando con calma los dibujos de la borra…',
    'espera.palm': 'Recorriendo los trazos de tu foto…',
  },
  en: {
    'espera.dream': 'Reading the symbols of your dream…',
    'espera.coffee': 'Taking a slow look at the shapes in the grounds…',
    'espera.palm': 'Tracing the lines of your photo…',
  },
};
Object.assign(PT, ESPERA_I18N.pt);
Object.assign(ES, ESPERA_I18N.es);
Object.assign(EN, ESPERA_I18N.en);

// [BLOCO-ONBOARDING] — o onboarding-recompensa (perguntas passo a passo com
// devolução visual a cada resposta, 09/08/2026). SÓ chrome: título de passo,
// rótulo de botão, moldura dos slides. A LEITURA em si nunca nasce aqui — os
// slides reusam os dados do Mapa e acrescentam um retrato solar específico de
// cada signo, rotulado no próprio texto como leitura contemporânea. Tom de
// convite, zero promessa de efeito — a única "promessa" aqui é
// factual: hora exata e cidade são, de fato, o que o Ascendente exige
// (lib/signs.js ascendantSign devolve null sem elas).
const ONBOARDING_I18N = {
  pt: {
    'quiz.names.echo': '{voce} e {amor}: daqui em diante cada resposta vai acrescentar uma camada real ao mapa de vocês.',
    'quiz.birth.previewKicker': 'Primeira devolução',
    'quiz.birth.previewTitle': '{voce} + {amor}',
    'quiz.birth.previewBody': '{signA} e {signB} formam {aspect}. Isso é a geometria entre os signos solares — ainda não é uma nota nem a leitura completa.',
    'onboarding.entry.title': 'Uma pergunta. Uma revelação. Um próximo passo.',
    'onboarding.entry.subtitle': 'Conte o que você quer entender agora. O app monta um primeiro caminho com leituras que já existem — sem inventar previsão.',
    'onboarding.entry.primary': 'Ver minha primeira leitura grátis',
    'onboarding.entry.couple': 'Quero fazer isso com meu par',
    'onboarding.intro.skip': 'Pular introdução',
    'onboarding.intro.focus': 'Tem algo que você quer entender melhor hoje.',
    'onboarding.intro.name': 'Eu sou Órbi.',
    'onboarding.intro.promise': 'Responda três perguntas curtas e eu organizo seu primeiro caminho.',
    'onboarding.intro.control': 'Cada escolha muda o próximo passo. Você continua no controle.',
    'onboarding.intro.primary': 'Começar meu caminho',
    'onboarding.intro.shortcut': 'Já sei meu signo',
    'onboarding.intent.title': 'O que você quer entender agora?',
    'onboarding.intent.subtitle': 'A resposta muda a ordem do seu primeiro caminho. Ela não muda cartas, cálculos ou significados.',
    'onboarding.intent.love.label': 'Amor e relações',
    'onboarding.intent.love.description': 'Entender vínculos, aproximações e padrões.',
    'onboarding.intent.love.echo': 'Seu caminho começa pelos vínculos: primeiro uma leitura, depois o céu do dia e um lugar para guardar o que fez sentido.',
    'onboarding.intent.decision.label': 'Uma decisão',
    'onboarding.intent.decision.description': 'Olhar uma escolha por outro ângulo.',
    'onboarding.intent.decision.echo': 'Seu caminho começa pela pergunta: cartas para abrir perspectivas, mapa para reconhecer padrões e Diário para comparar depois.',
    'onboarding.intent.self.label': 'Me entender melhor',
    'onboarding.intent.self.description': 'Reconhecer forças, necessidades e ciclos.',
    'onboarding.intent.self.echo': 'Seu caminho começa pelo que é calculável no nascimento, continua no céu de hoje e termina no que você decidir guardar.',
    'onboarding.intent.work.label': 'Trabalho e direção',
    'onboarding.intent.work.description': 'Organizar foco, escolhas e próximos passos.',
    'onboarding.intent.work.echo': 'Seu caminho começa com uma pergunta concreta, ganha contexto no mapa e volta ao que muda no céu de hoje.',
    'onboarding.intent.curiosity.label': 'Quero me surpreender',
    'onboarding.intent.curiosity.description': 'Descobrir o app sem escolher um tema.',
    'onboarding.intent.curiosity.echo': 'Seu caminho começa pela experiência mais visual e depois abre as camadas do seu mapa e do céu de hoje.',
    'onboarding.intent.planTitle': 'Seu primeiro caminho',
    'onboarding.intent.planStep': '{number}. {feature}',
    'onboarding.intent.planNote': 'Você poderá trocar de caminho e explorar todas as leituras depois.',
    'onboarding.adaptive.first': 'Primeira de três perguntas',
    'onboarding.adaptive.understood': 'Entendi o seu foco',
    'onboarding.adaptive.next': 'Só mais uma camada',
    'onboarding.situation.love.title': 'Qual dessas situações parece mais com a sua?',
    'onboarding.situation.decision.title': 'O que está tornando essa decisão difícil?',
    'onboarding.situation.self.title': 'Onde você mais quer se entender?',
    'onboarding.situation.work.title': 'O que mais pesa no trabalho agora?',
    'onboarding.situation.curiosity.title': 'Por onde você quer começar?',
    'onboarding.situation.loveBeginning.label': 'Estou conhecendo alguém',
    'onboarding.situation.loveBeginning.echo': 'Existe algo começando, e você quer enxergar esse vínculo sem apressar uma resposta.',
    'onboarding.situation.loveRelationship.label': 'Já estou em uma relação',
    'onboarding.situation.loveRelationship.echo': 'Você quer olhar a relação que já existe: os padrões, a proximidade e o que merece conversa.',
    'onboarding.situation.loveDistance.label': 'Existe distância ou dúvida',
    'onboarding.situation.loveDistance.echo': 'A incerteza está ocupando espaço. Seu caminho vai abrir perspectivas sem prometer o que a outra pessoa fará.',
    'onboarding.situation.loveClosure.label': 'Estou fechando um ciclo',
    'onboarding.situation.loveClosure.echo': 'Você está reorganizando o que ficou dessa história. O plano vai priorizar clareza e registro, não previsão.',
    'onboarding.situation.decisionOptions.label': 'Tenho dois caminhos',
    'onboarding.situation.decisionOptions.echo': 'Há mais de uma possibilidade real. Vamos começar separando perspectiva de impulso.',
    'onboarding.situation.decisionTiming.label': 'Não sei se esta é a hora',
    'onboarding.situation.decisionTiming.echo': 'Sua dúvida é sobre momento. O plano vai colocar o céu de hoje antes de qualquer conclusão.',
    'onboarding.situation.decisionFear.label': 'Sei o que quero, mas tenho medo',
    'onboarding.situation.decisionFear.echo': 'A direção parece existir; o difícil é sustentar o movimento. Seu caminho começa pelo que devolve presença.',
    'onboarding.situation.decisionPressure.label': 'A opinião dos outros pesa',
    'onboarding.situation.decisionPressure.echo': 'Antes de escolher, você precisa distinguir o seu padrão das expectativas ao redor.',
    'onboarding.situation.selfPatterns.label': 'Repito os mesmos padrões',
    'onboarding.situation.selfPatterns.echo': 'Você quer reconhecer o desenho que volta. O mapa e o Diário entram para comparar, não para rotular.',
    'onboarding.situation.selfEmotions.label': 'Minhas emoções me confundem',
    'onboarding.situation.selfEmotions.echo': 'Você quer dar nome ao que sente sem reduzir tudo a uma resposta pronta.',
    'onboarding.situation.selfDirection.label': 'Estou sem direção',
    'onboarding.situation.selfDirection.echo': 'O que falta agora é um ponto de partida. Seu caminho vai transformar reflexão em uma próxima pergunta concreta.',
    'onboarding.situation.selfConfidence.label': 'Quero confiar mais em mim',
    'onboarding.situation.selfConfidence.echo': 'Você quer reconhecer recursos próprios antes de buscar validação fora.',
    'onboarding.situation.workChange.label': 'Estou pensando em mudar',
    'onboarding.situation.workChange.echo': 'Existe uma mudança no horizonte. Primeiro vamos abrir os ângulos da escolha; depois, olhar padrões e momento.',
    'onboarding.situation.workGrowth.label': 'Quero crescer onde estou',
    'onboarding.situation.workGrowth.echo': 'Seu foco é crescimento com mais consciência das forças que você já usa.',
    'onboarding.situation.workBlock.label': 'Estou travado ou esgotado',
    'onboarding.situation.workBlock.echo': 'Antes de exigir outra decisão, seu caminho começa recuperando presença e separando cansaço de direção.',
    'onboarding.situation.workPurpose.label': 'Quero mais sentido no que faço',
    'onboarding.situation.workPurpose.echo': 'Você quer aproximar trabalho e identidade. O plano começa pelo mapa e volta a ações observáveis.',
    'onboarding.situation.curiositySign.label': 'Quero entender meu signo',
    'onboarding.situation.curiositySign.echo': 'Vamos começar pelo signo solar e mostrar onde ele é só a primeira camada.',
    'onboarding.situation.curiosityMap.label': 'Quero abrir meu mapa',
    'onboarding.situation.curiosityMap.echo': 'Seu interesse está nas camadas do nascimento. Data, hora e cidade vão determinar o que pode ser calculado.',
    'onboarding.situation.curiosityTarot.label': 'Quero experimentar o Tarô',
    'onboarding.situation.curiosityTarot.echo': 'Você quer começar pela experiência mais tátil: uma pergunta, cartas reveladas e espaço para interpretar.',
    'onboarding.situation.curiositySky.label': 'Quero ver o céu de hoje',
    'onboarding.situation.curiositySky.echo': 'Seu ponto de entrada é o momento atual. O plano começa pelo que muda hoje e depois abre o mapa.',
    'onboarding.outcome.title': 'O que seria mais útil receber primeiro?',
    'onboarding.outcome.clarity.label': 'Entender melhor o que está acontecendo',
    'onboarding.outcome.clarity.echo': 'A prioridade será clareza: abrir perspectivas antes de sugerir qualquer próximo passo.',
    'onboarding.outcome.nextStep.label': 'Sair com um próximo passo',
    'onboarding.outcome.nextStep.echo': 'Seu plano vai terminar cada leitura com algo pequeno e possível de observar ou fazer.',
    'onboarding.outcome.patterns.label': 'Reconhecer um padrão que se repete',
    'onboarding.outcome.patterns.echo': 'Vamos priorizar comparação e registro para que o padrão apareça nos seus próprios dados.',
    'onboarding.outcome.timing.label': 'Entender o momento antes de agir',
    'onboarding.outcome.timing.echo': 'O céu do dia entra primeiro como contexto de tempo, nunca como ordem ou garantia.',
    'onboarding.q.name.title': 'Como podemos te chamar?',
    'onboarding.q.name.placeholder': 'Seu nome',
    'onboarding.q.name.hint': 'É assim que a sua leitura vai falar com você.',
    'onboarding.q.birth.title': 'Quando você nasceu?',
    'onboarding.q.birth.pick': 'Escolher a data',
    'onboarding.q.reward.sun': 'Seu signo solar',
    'onboarding.q.time.title': 'Que horas você nasceu?',
    'onboarding.q.time.why': 'A hora exata é o que abre o seu Ascendente.',
    'onboarding.q.time.skip': 'Não sei a hora →',
    'onboarding.q.time.skipNote': 'Sem a hora, o app usa o meio do dia: o Sol continua certo, e o Ascendente fica pra quando você souber.',
    'onboarding.q.city.title': 'Onde você nasceu?',
    'onboarding.q.city.why': 'A cidade coloca o céu no lugar certo — é o que falta pro seu Ascendente.',
    'onboarding.q.city.pick': 'Buscar minha cidade',
    'onboarding.q.city.skip': 'Pular por enquanto',
    'onboarding.q.continue': 'Continuar',
    'onboarding.q.reveal.title': 'O seu céu de nascimento',
    'onboarding.q.reveal.cta': 'Ver minha leitura',
    'onboarding.q.shortcut': 'Já sei meu signo — escolher direto',
    'onboarding.q.slides.title': 'Sua primeira leitura',
    'onboarding.q.slides.greeting': '{name}, o seu céu de nascimento está montado.',
    'onboarding.q.slides.greetingNoName': 'O seu céu de nascimento está montado.',
    'onboarding.signStory.aries': 'Áries é fogo cardinal. Na leitura contemporânea do signo solar, o foco cai em iniciar, abrir passagem e agir antes que tudo esteja resolvido; hora e cidade mostram onde esse impulso realmente aparece no seu mapa.',
    'onboarding.signStory.taurus': 'Touro é terra fixa. Na leitura contemporânea do signo solar, o foco cai em sustentar, dar forma e proteger o que tem valor; o mapa completo mostra onde constância ajuda e onde pode virar resistência.',
    'onboarding.signStory.gemini': 'Gêmeos é ar mutável. Na leitura contemporânea do signo solar, o foco cai em conectar ideias, testar perguntas e mudar de linguagem quando o contexto muda; Lua e Ascendente mostram o que existe por baixo dessa mobilidade.',
    'onboarding.signStory.cancer': 'Câncer é água cardinal. Na leitura contemporânea do signo solar, o foco cai em criar pertencimento, proteger vínculos e começar a partir do que se sente; a hora de nascimento mostra como essa proteção encontra o mundo.',
    'onboarding.signStory.leo': 'Leão é fogo fixo. Na leitura contemporânea do signo solar, o foco cai em sustentar expressão, autoria e presença sem depender de aplauso; o mapa completo mostra onde essa luz ganha palco e responsabilidade.',
    'onboarding.signStory.virgo': 'Virgem é terra mutável. Na leitura contemporânea do signo solar, o foco cai em observar detalhes, aperfeiçoar processos e separar o útil do ruído; Lua e Ascendente mostram quando o cuidado vira apoio ou cobrança.',
    'onboarding.signStory.libra': 'Libra é ar cardinal. Na leitura contemporânea do signo solar, o foco cai em iniciar acordos, enxergar o outro e buscar equilíbrio sem apagar a própria posição; o mapa completo mostra como você entra nas relações.',
    'onboarding.signStory.scorpio': 'Escorpião é água fixa. Na leitura contemporânea do signo solar, o foco cai em profundidade, confiança, limites e no que continua agindo mesmo sem ser dito; Lua e Ascendente mostram como essa intensidade se protege.',
    'onboarding.signStory.sagittarius': 'Sagitário é fogo mutável. Na leitura contemporânea do signo solar, o foco cai em ampliar horizonte, ligar experiência a sentido e seguir uma direção maior; o mapa completo mostra onde expansão pede detalhe e medida.',
    'onboarding.signStory.capricorn': 'Capricórnio é terra cardinal. Na leitura contemporânea do signo solar, o foco cai em construir estrutura, assumir responsabilidade e pensar no que permanece; hora e cidade mostram em que área essa ambição ganha forma.',
    'onboarding.signStory.aquarius': 'Aquário é ar fixo. Na leitura contemporânea do signo solar, o foco cai em questionar padrões, pensar sistemas e preservar independência dentro do coletivo; o mapa completo mostra onde diferença vira contribuição concreta.',
    'onboarding.signStory.pisces': 'Peixes é água mutável. Na leitura contemporânea do signo solar, o foco cai em imaginação, empatia e percepção do que não cabe em palavras; Lua e Ascendente mostram onde sensibilidade precisa de contorno.',
    'onboarding.q.slides.closing': 'Essa é a primeira página. O seu mapa completo já está aí dentro.',
  },
  es: {
    'quiz.names.echo': '{voce} y {amor}: de acá en adelante cada respuesta va a sumar una capa real al mapa de ustedes.',
    'quiz.birth.previewKicker': 'Primera devolución',
    'quiz.birth.previewTitle': '{voce} + {amor}',
    'quiz.birth.previewBody': '{signA} y {signB} forman {aspect}. Esa es la geometría entre los signos solares; todavía no es una puntuación ni la lectura completa.',
    'onboarding.entry.title': 'Una pregunta. Una revelación. Un próximo paso.',
    'onboarding.entry.subtitle': 'Cuéntanos qué quieres entender ahora. La app arma un primer camino con lecturas que ya existen, sin inventar predicciones.',
    'onboarding.entry.primary': 'Ver mi primera lectura gratis',
    'onboarding.entry.couple': 'Quiero hacerlo con mi pareja',
    'onboarding.intro.skip': 'Omitir introducción',
    'onboarding.intro.focus': 'Hay algo que quieres entender mejor hoy.',
    'onboarding.intro.name': 'Soy Órbi.',
    'onboarding.intro.promise': 'Responde tres preguntas breves y organizaré tu primer camino.',
    'onboarding.intro.control': 'Cada elección cambia el siguiente paso. Tú mantienes el control.',
    'onboarding.intro.primary': 'Empezar mi camino',
    'onboarding.intro.shortcut': 'Ya sé mi signo',
    'onboarding.intent.title': '¿Qué quieres entender ahora?',
    'onboarding.intent.subtitle': 'Tu respuesta cambia el orden de tu primer camino. No cambia cartas, cálculos ni significados.',
    'onboarding.intent.love.label': 'Amor y relaciones',
    'onboarding.intent.love.description': 'Entender vínculos, acercamientos y patrones.',
    'onboarding.intent.love.echo': 'Tu camino empieza por los vínculos: primero una lectura, después el cielo de hoy y un lugar donde guardar lo que tuvo sentido.',
    'onboarding.intent.decision.label': 'Una decisión',
    'onboarding.intent.decision.description': 'Mirar una elección desde otro ángulo.',
    'onboarding.intent.decision.echo': 'Tu camino empieza por la pregunta: cartas para abrir perspectivas, carta natal para reconocer patrones y Diario para comparar después.',
    'onboarding.intent.self.label': 'Entenderme mejor',
    'onboarding.intent.self.description': 'Reconocer fuerzas, necesidades y ciclos.',
    'onboarding.intent.self.echo': 'Tu camino empieza por lo calculable en el nacimiento, sigue en el cielo de hoy y termina en lo que decidas guardar.',
    'onboarding.intent.work.label': 'Trabajo y dirección',
    'onboarding.intent.work.description': 'Ordenar enfoque, elecciones y próximos pasos.',
    'onboarding.intent.work.echo': 'Tu camino empieza con una pregunta concreta, gana contexto en la carta natal y vuelve a lo que cambia hoy en el cielo.',
    'onboarding.intent.curiosity.label': 'Quiero sorprenderme',
    'onboarding.intent.curiosity.description': 'Descubrir la app sin elegir un tema.',
    'onboarding.intent.curiosity.echo': 'Tu camino empieza por la experiencia más visual y después abre las capas de tu carta y del cielo de hoy.',
    'onboarding.intent.planTitle': 'Tu primer camino',
    'onboarding.intent.planStep': '{number}. {feature}',
    'onboarding.intent.planNote': 'Después podrás cambiar de camino y explorar todas las lecturas.',
    'onboarding.adaptive.first': 'Primera de tres preguntas',
    'onboarding.adaptive.understood': 'Entendí tu enfoque',
    'onboarding.adaptive.next': 'Solo una capa más',
    'onboarding.situation.love.title': '¿Cuál de estas situaciones se parece más a la tuya?',
    'onboarding.situation.decision.title': '¿Qué está haciendo difícil esta decisión?',
    'onboarding.situation.self.title': '¿Dónde quieres entenderte mejor?',
    'onboarding.situation.work.title': '¿Qué pesa más en el trabajo ahora?',
    'onboarding.situation.curiosity.title': '¿Por dónde quieres empezar?',
    'onboarding.situation.loveBeginning.label': 'Estoy conociendo a alguien',
    'onboarding.situation.loveBeginning.echo': 'Hay algo que comienza y quieres mirar ese vínculo sin apresurar una respuesta.',
    'onboarding.situation.loveRelationship.label': 'Ya estoy en una relación',
    'onboarding.situation.loveRelationship.echo': 'Quieres mirar la relación que ya existe: los patrones, la cercanía y lo que merece conversación.',
    'onboarding.situation.loveDistance.label': 'Hay distancia o dudas',
    'onboarding.situation.loveDistance.echo': 'La incertidumbre está ocupando espacio. Tu camino abrirá perspectivas sin prometer lo que hará la otra persona.',
    'onboarding.situation.loveClosure.label': 'Estoy cerrando un ciclo',
    'onboarding.situation.loveClosure.echo': 'Estás reorganizando lo que quedó de esa historia. El plan priorizará claridad y registro, no predicción.',
    'onboarding.situation.decisionOptions.label': 'Tengo dos caminos',
    'onboarding.situation.decisionOptions.echo': 'Hay más de una posibilidad real. Empezaremos separando perspectiva de impulso.',
    'onboarding.situation.decisionTiming.label': 'No sé si es el momento',
    'onboarding.situation.decisionTiming.echo': 'Tu duda es sobre el momento. El plan pondrá el cielo de hoy antes de cualquier conclusión.',
    'onboarding.situation.decisionFear.label': 'Sé lo que quiero, pero tengo miedo',
    'onboarding.situation.decisionFear.echo': 'La dirección parece existir; lo difícil es sostener el movimiento. Tu camino empieza por recuperar presencia.',
    'onboarding.situation.decisionPressure.label': 'La opinión de otros pesa',
    'onboarding.situation.decisionPressure.echo': 'Antes de elegir, necesitas distinguir tu patrón de las expectativas que te rodean.',
    'onboarding.situation.selfPatterns.label': 'Repito los mismos patrones',
    'onboarding.situation.selfPatterns.echo': 'Quieres reconocer el dibujo que vuelve. La carta y el Diario sirven para comparar, no para etiquetarte.',
    'onboarding.situation.selfEmotions.label': 'Mis emociones me confunden',
    'onboarding.situation.selfEmotions.echo': 'Quieres poner nombre a lo que sientes sin reducirlo todo a una respuesta preparada.',
    'onboarding.situation.selfDirection.label': 'Estoy sin dirección',
    'onboarding.situation.selfDirection.echo': 'Ahora falta un punto de partida. Tu camino convertirá la reflexión en una próxima pregunta concreta.',
    'onboarding.situation.selfConfidence.label': 'Quiero confiar más en mí',
    'onboarding.situation.selfConfidence.echo': 'Quieres reconocer tus propios recursos antes de buscar validación fuera.',
    'onboarding.situation.workChange.label': 'Estoy pensando en cambiar',
    'onboarding.situation.workChange.echo': 'Hay un cambio en el horizonte. Primero abriremos los ángulos de la elección; después, patrones y momento.',
    'onboarding.situation.workGrowth.label': 'Quiero crecer donde estoy',
    'onboarding.situation.workGrowth.echo': 'Tu enfoque es crecer con más conciencia de las fortalezas que ya utilizas.',
    'onboarding.situation.workBlock.label': 'Estoy bloqueado o agotado',
    'onboarding.situation.workBlock.echo': 'Antes de exigir otra decisión, tu camino comienza recuperando presencia y separando cansancio de dirección.',
    'onboarding.situation.workPurpose.label': 'Quiero más sentido en lo que hago',
    'onboarding.situation.workPurpose.echo': 'Quieres acercar trabajo e identidad. El plan empieza por la carta y vuelve a acciones observables.',
    'onboarding.situation.curiositySign.label': 'Quiero entender mi signo',
    'onboarding.situation.curiositySign.echo': 'Empezaremos por el signo solar y mostraremos dónde es solo la primera capa.',
    'onboarding.situation.curiosityMap.label': 'Quiero abrir mi carta',
    'onboarding.situation.curiosityMap.echo': 'Tu interés está en las capas del nacimiento. Fecha, hora y ciudad determinarán lo que puede calcularse.',
    'onboarding.situation.curiosityTarot.label': 'Quiero probar el Tarot',
    'onboarding.situation.curiosityTarot.echo': 'Quieres empezar por la experiencia más táctil: una pregunta, cartas reveladas y espacio para interpretar.',
    'onboarding.situation.curiositySky.label': 'Quiero ver el cielo de hoy',
    'onboarding.situation.curiositySky.echo': 'Tu punto de entrada es el momento actual. El plan comienza por lo que cambia hoy y después abre la carta.',
    'onboarding.outcome.title': '¿Qué sería más útil recibir primero?',
    'onboarding.outcome.clarity.label': 'Entender mejor lo que está pasando',
    'onboarding.outcome.clarity.echo': 'La prioridad será la claridad: abrir perspectivas antes de sugerir un siguiente paso.',
    'onboarding.outcome.nextStep.label': 'Salir con un próximo paso',
    'onboarding.outcome.nextStep.echo': 'Tu plan terminará cada lectura con algo pequeño y posible de observar o hacer.',
    'onboarding.outcome.patterns.label': 'Reconocer un patrón que se repite',
    'onboarding.outcome.patterns.echo': 'Priorizaremos comparación y registro para que el patrón aparezca en tus propios datos.',
    'onboarding.outcome.timing.label': 'Entender el momento antes de actuar',
    'onboarding.outcome.timing.echo': 'El cielo del día entra primero como contexto temporal, nunca como orden o garantía.',
    'onboarding.q.name.title': '¿Cómo podemos llamarte?',
    'onboarding.q.name.placeholder': 'Tu nombre',
    'onboarding.q.name.hint': 'Así va a hablarte tu lectura.',
    'onboarding.q.birth.title': '¿Cuándo naciste?',
    'onboarding.q.birth.pick': 'Elegir la fecha',
    'onboarding.q.reward.sun': 'Tu signo solar',
    'onboarding.q.time.title': '¿A qué hora naciste?',
    'onboarding.q.time.why': 'La hora exacta es lo que abre tu Ascendente.',
    'onboarding.q.time.skip': 'No sé la hora →',
    'onboarding.q.time.skipNote': 'Sin la hora, la app usa el mediodía: el Sol sigue siendo el correcto, y el Ascendente queda para cuando la sepas.',
    'onboarding.q.city.title': '¿Dónde naciste?',
    'onboarding.q.city.why': 'La ciudad pone el cielo en su lugar — es lo que le falta a tu Ascendente.',
    'onboarding.q.city.pick': 'Buscar mi ciudad',
    'onboarding.q.city.skip': 'Saltar por ahora',
    'onboarding.q.continue': 'Continuar',
    'onboarding.q.reveal.title': 'Tu cielo de nacimiento',
    'onboarding.q.reveal.cta': 'Ver mi lectura',
    'onboarding.q.shortcut': 'Ya sé mi signo — elegir directo',
    'onboarding.q.slides.title': 'Tu primera lectura',
    'onboarding.q.slides.greeting': '{name}, tu cielo de nacimiento está montado.',
    'onboarding.q.slides.greetingNoName': 'Tu cielo de nacimiento está montado.',
    'onboarding.signStory.aries': 'Aries es fuego cardinal. En la lectura contemporánea del signo solar, el foco está en iniciar, abrir camino y actuar antes de que todo esté resuelto; la hora y la ciudad muestran dónde aparece realmente ese impulso en tu carta.',
    'onboarding.signStory.taurus': 'Tauro es tierra fija. En la lectura contemporánea del signo solar, el foco está en sostener, dar forma y proteger lo que tiene valor; la carta completa muestra dónde la constancia ayuda y dónde puede volverse resistencia.',
    'onboarding.signStory.gemini': 'Géminis es aire mutable. En la lectura contemporánea del signo solar, el foco está en conectar ideas, probar preguntas y cambiar de lenguaje cuando cambia el contexto; la Luna y el Ascendente muestran qué hay debajo de esa movilidad.',
    'onboarding.signStory.cancer': 'Cáncer es agua cardinal. En la lectura contemporánea del signo solar, el foco está en crear pertenencia, proteger vínculos y empezar desde lo que se siente; la hora de nacimiento muestra cómo esa protección encuentra el mundo.',
    'onboarding.signStory.leo': 'Leo es fuego fijo. En la lectura contemporánea del signo solar, el foco está en sostener expresión, autoría y presencia sin depender del aplauso; la carta completa muestra dónde esa luz gana escenario y responsabilidad.',
    'onboarding.signStory.virgo': 'Virgo es tierra mutable. En la lectura contemporánea del signo solar, el foco está en observar detalles, mejorar procesos y separar lo útil del ruido; la Luna y el Ascendente muestran cuándo el cuidado se vuelve apoyo o exigencia.',
    'onboarding.signStory.libra': 'Libra es aire cardinal. En la lectura contemporánea del signo solar, el foco está en iniciar acuerdos, ver al otro y buscar equilibrio sin borrar la propia posición; la carta completa muestra cómo entras en las relaciones.',
    'onboarding.signStory.scorpio': 'Escorpio es agua fija. En la lectura contemporánea del signo solar, el foco está en la profundidad, la confianza, los límites y lo que sigue actuando aunque no se diga; la Luna y el Ascendente muestran cómo se protege esa intensidad.',
    'onboarding.signStory.sagittarius': 'Sagitario es fuego mutable. En la lectura contemporánea del signo solar, el foco está en ampliar horizontes, unir experiencia y sentido, y seguir una dirección mayor; la carta completa muestra dónde la expansión pide detalle y medida.',
    'onboarding.signStory.capricorn': 'Capricornio es tierra cardinal. En la lectura contemporánea del signo solar, el foco está en construir estructura, asumir responsabilidad y pensar en lo que permanece; la hora y la ciudad muestran en qué área toma forma esa ambición.',
    'onboarding.signStory.aquarius': 'Acuario es aire fijo. En la lectura contemporánea del signo solar, el foco está en cuestionar patrones, pensar sistemas y preservar independencia dentro del colectivo; la carta completa muestra dónde la diferencia se vuelve contribución concreta.',
    'onboarding.signStory.pisces': 'Piscis es agua mutable. En la lectura contemporánea del signo solar, el foco está en la imaginación, la empatía y la percepción de lo que no cabe en palabras; la Luna y el Ascendente muestran dónde la sensibilidad necesita contorno.',
    'onboarding.q.slides.closing': 'Esta es la primera página. Tu carta completa ya está ahí dentro.',
  },
  en: {
    'quiz.names.echo': '{voce} and {amor}: from here on, every answer adds a real layer to your shared map.',
    'quiz.birth.previewKicker': 'First result',
    'quiz.birth.previewTitle': '{voce} + {amor}',
    'quiz.birth.previewBody': '{signA} and {signB} form {aspect}. That is the geometry between your Sun signs — it is not a score or the full reading yet.',
    'onboarding.entry.title': 'One question. One reveal. One next step.',
    'onboarding.entry.subtitle': 'Tell us what you want to understand now. The app builds a first path from readings that already exist, without inventing predictions.',
    'onboarding.entry.primary': 'See my first free reading',
    'onboarding.entry.couple': 'I want to do this with my partner',
    'onboarding.intro.skip': 'Skip introduction',
    'onboarding.intro.focus': 'There’s something you want to understand more clearly today.',
    'onboarding.intro.name': 'I’m Órbi.',
    'onboarding.intro.promise': 'Answer three short questions and I’ll shape your first path.',
    'onboarding.intro.control': 'Each choice changes what comes next. You stay in control.',
    'onboarding.intro.primary': 'Start my path',
    'onboarding.intro.shortcut': 'I know my sign',
    'onboarding.intent.title': 'What do you want to understand now?',
    'onboarding.intent.subtitle': 'Your answer changes the order of your first path. It does not change cards, calculations or meanings.',
    'onboarding.intent.love.label': 'Love and relationships',
    'onboarding.intent.love.description': 'Understand bonds, closeness and patterns.',
    'onboarding.intent.love.echo': 'Your path starts with bonds: first a reading, then today’s sky and a place to keep what felt useful.',
    'onboarding.intent.decision.label': 'A decision',
    'onboarding.intent.decision.description': 'Look at a choice from another angle.',
    'onboarding.intent.decision.echo': 'Your path starts with the question: cards to open perspectives, a birth chart to spot patterns and the Diary to compare later.',
    'onboarding.intent.self.label': 'Understand myself',
    'onboarding.intent.self.description': 'Recognize strengths, needs and cycles.',
    'onboarding.intent.self.echo': 'Your path starts with what can be calculated from birth, continues with today’s sky and ends with what you choose to keep.',
    'onboarding.intent.work.label': 'Work and direction',
    'onboarding.intent.work.description': 'Organize focus, choices and next steps.',
    'onboarding.intent.work.echo': 'Your path starts with a concrete question, gains context from your chart and returns to what changes in today’s sky.',
    'onboarding.intent.curiosity.label': 'Surprise me',
    'onboarding.intent.curiosity.description': 'Discover the app without picking a theme.',
    'onboarding.intent.curiosity.echo': 'Your path starts with the most visual experience, then opens the layers of your chart and today’s sky.',
    'onboarding.intent.planTitle': 'Your first path',
    'onboarding.intent.planStep': '{number}. {feature}',
    'onboarding.intent.planNote': 'You can change paths and explore every reading afterwards.',
    'onboarding.adaptive.first': 'First of three questions',
    'onboarding.adaptive.understood': 'I understand your focus',
    'onboarding.adaptive.next': 'One more layer',
    'onboarding.situation.love.title': 'Which of these feels closest to your situation?',
    'onboarding.situation.decision.title': 'What is making this decision difficult?',
    'onboarding.situation.self.title': 'Where do you most want to understand yourself?',
    'onboarding.situation.work.title': 'What weighs on you most at work right now?',
    'onboarding.situation.curiosity.title': 'Where would you like to begin?',
    'onboarding.situation.loveBeginning.label': 'I am getting to know someone',
    'onboarding.situation.loveBeginning.echo': 'Something is beginning, and you want to look at the bond without rushing an answer.',
    'onboarding.situation.loveRelationship.label': 'I am already in a relationship',
    'onboarding.situation.loveRelationship.echo': 'You want to look at the relationship that already exists: its patterns, closeness and what deserves a conversation.',
    'onboarding.situation.loveDistance.label': 'There is distance or uncertainty',
    'onboarding.situation.loveDistance.echo': 'Uncertainty is taking up space. Your path will open perspectives without promising what the other person will do.',
    'onboarding.situation.loveClosure.label': 'I am closing a chapter',
    'onboarding.situation.loveClosure.echo': 'You are reorganizing what remains of that story. The plan will prioritize clarity and reflection, not prediction.',
    'onboarding.situation.decisionOptions.label': 'I am choosing between two paths',
    'onboarding.situation.decisionOptions.echo': 'There is more than one real possibility. We will begin by separating perspective from impulse.',
    'onboarding.situation.decisionTiming.label': 'I am not sure this is the right time',
    'onboarding.situation.decisionTiming.echo': 'Your doubt is about timing. The plan will place today\'s sky before any conclusion.',
    'onboarding.situation.decisionFear.label': 'I know what I want, but I am afraid',
    'onboarding.situation.decisionFear.echo': 'The direction seems to exist; sustaining the movement is the hard part. Your path starts by regaining presence.',
    'onboarding.situation.decisionPressure.label': 'Other people\'s opinions weigh on me',
    'onboarding.situation.decisionPressure.echo': 'Before choosing, you need to distinguish your pattern from the expectations around you.',
    'onboarding.situation.selfPatterns.label': 'I repeat the same patterns',
    'onboarding.situation.selfPatterns.echo': 'You want to recognize what keeps returning. The chart and Diary help you compare, not label yourself.',
    'onboarding.situation.selfEmotions.label': 'My emotions confuse me',
    'onboarding.situation.selfEmotions.echo': 'You want to name what you feel without reducing it to a prepared answer.',
    'onboarding.situation.selfDirection.label': 'I feel directionless',
    'onboarding.situation.selfDirection.echo': 'What is missing now is a starting point. Your path will turn reflection into one concrete next question.',
    'onboarding.situation.selfConfidence.label': 'I want to trust myself more',
    'onboarding.situation.selfConfidence.echo': 'You want to recognize your own resources before seeking validation outside yourself.',
    'onboarding.situation.workChange.label': 'I am thinking about a change',
    'onboarding.situation.workChange.echo': 'A change is on the horizon. First we will open the angles of the choice, then look at patterns and timing.',
    'onboarding.situation.workGrowth.label': 'I want to grow where I am',
    'onboarding.situation.workGrowth.echo': 'Your focus is growth with more awareness of the strengths you already use.',
    'onboarding.situation.workBlock.label': 'I feel stuck or burned out',
    'onboarding.situation.workBlock.echo': 'Before demanding another decision, your path begins by regaining presence and separating exhaustion from direction.',
    'onboarding.situation.workPurpose.label': 'I want more meaning in my work',
    'onboarding.situation.workPurpose.echo': 'You want to bring work and identity closer. The plan starts with your chart and returns to observable actions.',
    'onboarding.situation.curiositySign.label': 'I want to understand my sign',
    'onboarding.situation.curiositySign.echo': 'We will begin with your Sun sign and show where it is only the first layer.',
    'onboarding.situation.curiosityMap.label': 'I want to open my birth chart',
    'onboarding.situation.curiosityMap.echo': 'Your interest is in the layers of birth. Date, time and city will determine what can be calculated.',
    'onboarding.situation.curiosityTarot.label': 'I want to try Tarot',
    'onboarding.situation.curiosityTarot.echo': 'You want to start with the most tactile experience: one question, revealed cards and room to interpret.',
    'onboarding.situation.curiositySky.label': 'I want to see today\'s sky',
    'onboarding.situation.curiositySky.echo': 'Your entry point is the present moment. The plan starts with what changes today, then opens your chart.',
    'onboarding.outcome.title': 'What would be most useful to receive first?',
    'onboarding.outcome.clarity.label': 'Understand what is happening more clearly',
    'onboarding.outcome.clarity.echo': 'Clarity comes first: opening perspectives before suggesting a next step.',
    'onboarding.outcome.nextStep.label': 'Leave with one next step',
    'onboarding.outcome.nextStep.echo': 'Your plan will end each reading with something small and possible to observe or do.',
    'onboarding.outcome.patterns.label': 'Recognize a repeating pattern',
    'onboarding.outcome.patterns.echo': 'We will prioritize comparison and reflection so the pattern appears in your own data.',
    'onboarding.outcome.timing.label': 'Understand the timing before I act',
    'onboarding.outcome.timing.echo': 'Today\'s sky comes first as timing context, never as an order or guarantee.',
    'onboarding.q.name.title': 'What should we call you?',
    'onboarding.q.name.placeholder': 'Your name',
    'onboarding.q.name.hint': 'This is how your reading will talk to you.',
    'onboarding.q.birth.title': 'When were you born?',
    'onboarding.q.birth.pick': 'Pick the date',
    'onboarding.q.reward.sun': 'Your sun sign',
    'onboarding.q.time.title': 'What time were you born?',
    'onboarding.q.time.why': 'The exact time is what unlocks your Ascendant.',
    'onboarding.q.time.skip': "I don't know the time →",
    'onboarding.q.time.skipNote': "Without the time, the app uses midday: your Sun stays right, and the Ascendant waits until you know it.",
    'onboarding.q.city.title': 'Where were you born?',
    'onboarding.q.city.why': "The city puts the sky in the right place — it's what your Ascendant is missing.",
    'onboarding.q.city.pick': 'Find my city',
    'onboarding.q.city.skip': 'Skip for now',
    'onboarding.q.continue': 'Continue',
    'onboarding.q.reveal.title': 'Your birth sky',
    'onboarding.q.reveal.cta': 'See my reading',
    'onboarding.q.shortcut': 'I know my sign — pick it directly',
    'onboarding.q.slides.title': 'Your first reading',
    'onboarding.q.slides.greeting': '{name}, your birth sky is set.',
    'onboarding.q.slides.greetingNoName': 'Your birth sky is set.',
    'onboarding.signStory.aries': 'Aries is cardinal fire. In contemporary sun-sign reading, the focus is on starting, opening a path and acting before everything is settled; birth time and city show where that drive actually appears in your chart.',
    'onboarding.signStory.taurus': 'Taurus is fixed earth. In contemporary sun-sign reading, the focus is on sustaining, giving form and protecting what has value; the full chart shows where consistency helps and where it can become resistance.',
    'onboarding.signStory.gemini': 'Gemini is mutable air. In contemporary sun-sign reading, the focus is on connecting ideas, testing questions and changing language as context changes; the Moon and Ascendant show what sits beneath that mobility.',
    'onboarding.signStory.cancer': 'Cancer is cardinal water. In contemporary sun-sign reading, the focus is on creating belonging, protecting bonds and beginning from what is felt; birth time shows how that protection meets the world.',
    'onboarding.signStory.leo': 'Leo is fixed fire. In contemporary sun-sign reading, the focus is on sustaining expression, authorship and presence without depending on applause; the full chart shows where that light gains a stage and responsibility.',
    'onboarding.signStory.virgo': 'Virgo is mutable earth. In contemporary sun-sign reading, the focus is on noticing detail, refining processes and separating what is useful from noise; the Moon and Ascendant show when care becomes support or pressure.',
    'onboarding.signStory.libra': 'Libra is cardinal air. In contemporary sun-sign reading, the focus is on initiating agreements, seeing the other person and seeking balance without erasing your own position; the full chart shows how you enter relationships.',
    'onboarding.signStory.scorpio': 'Scorpio is fixed water. In contemporary sun-sign reading, the focus is on depth, trust, boundaries and what keeps working even when it is not said; the Moon and Ascendant show how that intensity protects itself.',
    'onboarding.signStory.sagittarius': 'Sagittarius is mutable fire. In contemporary sun-sign reading, the focus is on widening horizons, connecting experience to meaning and following a larger direction; the full chart shows where expansion needs detail and proportion.',
    'onboarding.signStory.capricorn': 'Capricorn is cardinal earth. In contemporary sun-sign reading, the focus is on building structure, taking responsibility and thinking about what lasts; birth time and city show where that ambition takes form.',
    'onboarding.signStory.aquarius': 'Aquarius is fixed air. In contemporary sun-sign reading, the focus is on questioning patterns, thinking in systems and preserving independence within the collective; the full chart shows where difference becomes a concrete contribution.',
    'onboarding.signStory.pisces': 'Pisces is mutable water. In contemporary sun-sign reading, the focus is on imagination, empathy and sensing what does not fit into words; the Moon and Ascendant show where sensitivity needs an edge.',
    'onboarding.q.slides.closing': 'This is the first page. Your full chart is already inside.',
  },
};
Object.assign(PT, ONBOARDING_I18N.pt);
Object.assign(ES, ONBOARDING_I18N.es);
Object.assign(EN, ONBOARDING_I18N.en);

// [BLOCO-ÓRBI] — uma única voz de produto. A conversa continua sendo IA,
// declarada no detalhe, mas a vitrine apresenta primeiro o trabalho concreto:
// organizar uma pergunta com o contexto que a própria pessoa escolheu.
const ORBI_I18N = {
  pt: {
    'orbi.name': 'Órbi',
    'orbi.home.eyebrow': 'Órbi · continuidade',
    'orbi.home.title': 'Ficou alguma pergunta?',
    'orbi.home.body': 'Eu posso ajudar a organizar o que apareceu nas suas leituras, uma questão por vez.',
    'orbi.home.cta': 'Conversar com Órbi',
    'orbi.chat.title': 'Conversar com Órbi',
    'orbi.chat.subtitle': 'Uma pergunta por vez, com o seu contexto',
    'orbi.chat.kicker': 'Seu guia dentro do app',
    'orbi.chat.intro': 'Conte o que está acontecendo; eu ajudo a organizar a questão sem tratar símbolos como previsão.',
    'orbi.chat.disclosure': 'Este espaço usa IA da Anthropic. Órbi não é pessoa nem consultor. Quando seu signo e as três escolhas estão disponíveis juntos, eles acompanham a pergunta; seu Diário e o histórico importado não são enviados.',
    'orbi.chat.suggestions': 'Comece pelo que você já contou',
    'orbi.chat.prompt.situation': '{situation}. O que vale observar sem presumir o futuro?',
    'orbi.chat.prompt.outcome': '{outcome}: por onde começo de forma concreta?',
    'orbi.chat.prompt.sign': 'O que {sign} pode simbolizar nesta questão — e quais são os limites dessa leitura?',
    'orbi.chat.prompt.organize': 'Tenho algo na cabeça. Você me ajuda a organizar a pergunta?',
    'orbi.chat.prompt.symbols': 'Como usar uma leitura simbólica sem tratá-la como previsão?',
    'orbi.chat.prompt.nextQuestion': 'Qual pergunta concreta pode me ajudar a olhar esta situação?',
    'orbi.chat.typing': 'Órbi está organizando a resposta…',
    'orbi.chat.loading': 'Preparando seu contexto com segurança…',
    'orbi.chat.you': 'Você',
    'orbi.chat.placeholder': 'Escreva o que você quer entender…',
    'orbi.chat.send': 'Enviar mensagem para Órbi',
    'orbi.chat.completion': 'Primeiro fio encontrado. Você pode aprofundar ou transformar isso numa pergunta mais concreta.',
    'orbi.chat.legacy': 'Mensagens anteriores disponíveis neste aparelho foram importadas só para consulta; elas não são enviadas ao Órbi.',
    'orbi.chat.legacySpeaker': 'Histórico importado',
    'orbi.chat.lockTitle': 'Conversar com Órbi',
    'orbi.chat.diaryLabel': 'Conversa com Órbi',
    'wrapped.orbiEnergy': 'Mês de conversa — o papo com Órbi foi seu ritual mais constante.',
    'missions.orbi.title': 'Converse com Órbi',
    'missions.orbi.desc': 'Leve uma pergunta concreta para o guia do app.',
  },
  es: {
    'orbi.name': 'Órbi',
    'orbi.home.eyebrow': 'Órbi · continuidad',
    'orbi.home.title': '¿Te quedó alguna pregunta?',
    'orbi.home.body': 'Puedo ayudarte a ordenar lo que apareció en tus lecturas, una pregunta a la vez.',
    'orbi.home.cta': 'Conversar con Órbi',
    'orbi.chat.title': 'Conversar con Órbi',
    'orbi.chat.subtitle': 'Una pregunta a la vez, con tu contexto',
    'orbi.chat.kicker': 'Tu guía dentro de la app',
    'orbi.chat.intro': 'Cuéntame qué está pasando; te ayudo a ordenar la pregunta sin tratar los símbolos como predicción.',
    'orbi.chat.disclosure': 'Este espacio usa IA de Anthropic. Órbi no es una persona ni un consultor. Cuando tu signo y las tres elecciones están disponibles juntos, acompañan la pregunta; tu Diario y el historial importado no se envían.',
    'orbi.chat.suggestions': 'Empieza por lo que ya contaste',
    'orbi.chat.prompt.situation': '{situation}. ¿Qué conviene observar sin suponer el futuro?',
    'orbi.chat.prompt.outcome': '{outcome}: ¿por dónde empiezo de forma concreta?',
    'orbi.chat.prompt.sign': '¿Qué puede simbolizar {sign} en esta cuestión y cuáles son los límites de esa lectura?',
    'orbi.chat.prompt.organize': 'Tengo algo en la cabeza. ¿Me ayudas a ordenar la pregunta?',
    'orbi.chat.prompt.symbols': '¿Cómo uso una lectura simbólica sin tratarla como predicción?',
    'orbi.chat.prompt.nextQuestion': '¿Qué pregunta concreta puede ayudarme a mirar esta situación?',
    'orbi.chat.typing': 'Órbi está ordenando la respuesta…',
    'orbi.chat.loading': 'Preparando tu contexto de forma segura…',
    'orbi.chat.you': 'Tú',
    'orbi.chat.placeholder': 'Escribe lo que quieres entender…',
    'orbi.chat.send': 'Enviar mensaje a Órbi',
    'orbi.chat.completion': 'Primer hilo encontrado. Puedes profundizar o convertirlo en una pregunta más concreta.',
    'orbi.chat.legacy': 'Los mensajes anteriores disponibles en este dispositivo se importaron solo para consulta; no se envían a Órbi.',
    'orbi.chat.legacySpeaker': 'Historial importado',
    'orbi.chat.lockTitle': 'Conversar con Órbi',
    'orbi.chat.diaryLabel': 'Conversación con Órbi',
    'wrapped.orbiEnergy': 'Mes de conversación: hablar con Órbi fue tu ritual más constante.',
    'missions.orbi.title': 'Conversa con Órbi',
    'missions.orbi.desc': 'Lleva una pregunta concreta al guía de la app.',
  },
  en: {
    'orbi.name': 'Órbi',
    'orbi.home.eyebrow': 'Órbi · continuity',
    'orbi.home.title': 'Did a question stay with you?',
    'orbi.home.body': 'I can help organize what came up in your readings, one question at a time.',
    'orbi.home.cta': 'Talk with Órbi',
    'orbi.chat.title': 'Talk with Órbi',
    'orbi.chat.subtitle': 'One question at a time, with your context',
    'orbi.chat.kicker': 'Your guide inside the app',
    'orbi.chat.intro': 'Tell me what is happening; I will help organize the question without treating symbols as prediction.',
    'orbi.chat.disclosure': 'This space uses Anthropic AI. Órbi is not a person or consultant. When your sign and all three choices are available together, they travel with the question; your Diary and imported history are not sent.',
    'orbi.chat.suggestions': 'Start with what you already shared',
    'orbi.chat.prompt.situation': '{situation}. What is worth noticing without assuming the future?',
    'orbi.chat.prompt.outcome': '{outcome}: where can I begin in a concrete way?',
    'orbi.chat.prompt.sign': 'What could {sign} symbolize in this question — and what are the limits of that reading?',
    'orbi.chat.prompt.organize': 'Something is on my mind. Can you help me organize the question?',
    'orbi.chat.prompt.symbols': 'How can I use a symbolic reading without treating it as prediction?',
    'orbi.chat.prompt.nextQuestion': 'What concrete question could help me look at this situation?',
    'orbi.chat.typing': 'Órbi is organizing the response…',
    'orbi.chat.loading': 'Preparing your context securely…',
    'orbi.chat.you': 'You',
    'orbi.chat.placeholder': 'Write what you want to understand…',
    'orbi.chat.send': 'Send message to Órbi',
    'orbi.chat.completion': 'First thread found. You can go deeper or turn it into a more concrete question.',
    'orbi.chat.legacy': 'Previous messages available on this device were imported for reference only; they are not sent to Órbi.',
    'orbi.chat.legacySpeaker': 'Imported history',
    'orbi.chat.lockTitle': 'Talk with Órbi',
    'orbi.chat.diaryLabel': 'Conversation with Órbi',
    'wrapped.orbiEnergy': 'A month of conversation — talking with Órbi was your most consistent ritual.',
    'missions.orbi.title': 'Talk with Órbi',
    'missions.orbi.desc': 'Bring one concrete question to the app guide.',
  },
};
Object.assign(PT, ORBI_I18N.pt);
Object.assign(ES, ORBI_I18N.es);
Object.assign(EN, ORBI_I18N.en);

const FUNIL_3S_I18N = {
  pt: {
    'tarot.scratch': 'Raspe para revelar',
    'tarot.scratch.tapAlternative': 'ou toque para abrir',
    'tarot.scratch.a11y': 'Carta fechada. Raspe com o dedo ou ative para revelar.',
    'home.firstPath.eyebrow': 'Seu primeiro caminho',
    'home.firstPath.title': 'Primeiro passo: {feature}',
    'home.firstPath.body': 'Você escolheu “{intent}”. Seu primeiro passo está pronto.',
    'home.firstPath.cta': 'Abrir agora',
    'home.firstPath.honesty': 'Sua escolha organiza o caminho; ela não altera cartas, cálculos ou significados.',
    'home.forYou.eyebrow': 'Para você agora',
    'home.forYou.title': 'Continue por {feature}',
    'home.forYou.body': 'Seu caminho continua organizado pela resposta “{intent}”.',
    'home.forYou.next': 'Depois, você pode explorar',
    'home.explore.open': 'Explorar todas as experiências',
    'home.explore.close': 'Recolher o catálogo',
    'home.explore.hint': 'Leituras, práticas, datas e curiosidades ficam aqui quando você quiser escolher livremente.',
  },
  es: {
    'tarot.scratch': 'Raspa para revelar',
    'tarot.scratch.tapAlternative': 'o toca para abrir',
    'tarot.scratch.a11y': 'Carta cerrada. Raspa con el dedo o actívala para revelarla.',
    'home.firstPath.eyebrow': 'Tu primer camino',
    'home.firstPath.title': 'Primer paso: {feature}',
    'home.firstPath.body': 'Elegiste “{intent}”. Tu primer paso está listo.',
    'home.firstPath.cta': 'Abrir ahora',
    'home.firstPath.honesty': 'Tu elección ordena el camino; no cambia cartas, cálculos ni significados.',
    'home.forYou.eyebrow': 'Para ti ahora',
    'home.forYou.title': 'Continúa por {feature}',
    'home.forYou.body': 'Tu camino sigue organizado por tu respuesta “{intent}”.',
    'home.forYou.next': 'Después, puedes explorar',
    'home.explore.open': 'Explorar todas las experiencias',
    'home.explore.close': 'Cerrar el catálogo',
    'home.explore.hint': 'Lecturas, prácticas, fechas y curiosidades quedan aquí cuando quieras elegir libremente.',
  },
  en: {
    'tarot.scratch': 'Scratch to reveal',
    'tarot.scratch.tapAlternative': 'or tap to open',
    'tarot.scratch.a11y': 'Closed card. Scratch with your finger or activate it to reveal.',
    'home.firstPath.eyebrow': 'Your first path',
    'home.firstPath.title': 'First step: {feature}',
    'home.firstPath.body': 'You chose “{intent}”. Your first step is ready.',
    'home.firstPath.cta': 'Open now',
    'home.firstPath.honesty': 'Your choice orders the path; it does not change cards, calculations or meanings.',
    'home.forYou.eyebrow': 'For you now',
    'home.forYou.title': 'Continue with {feature}',
    'home.forYou.body': 'Your path remains organized around your answer “{intent}”.',
    'home.forYou.next': 'Next, you can explore',
    'home.explore.open': 'Explore every experience',
    'home.explore.close': 'Collapse the catalog',
    'home.explore.hint': 'Readings, practices, dates and curiosities stay here whenever you want to choose freely.',
  },
};
Object.assign(PT, FUNIL_3S_I18N.pt);
Object.assign(ES, FUNIL_3S_I18N.es);
Object.assign(EN, FUNIL_3S_I18N.en);

// [BLOCO-PLAY-STORE] — chrome exigido pela política do Google Play (19/08/2026).
// Frentes que nascem do mesmo motivo, por isso um bloco só:
//   · profile.delete.* — exclusão de conta DE VERDADE (dois toques, estado de
//     "apagando", erro que não desloga e a saída parcial: conta apagada mas
//     backend fora do ar).
//   · report.* — canal de denúncia de resposta de IA, obrigatório pra app que
//     publica conteúdo gerado. Vai o motivo e a resposta denunciada; nada do
//     que a pessoa escreveu.
//   · privacy.* — a ficha honesta da tela de Privacidade: o que fica no
//     aparelho, o que sai daqui (checkout, busca de cidade, conta/Google, IA,
//     feed social, push), o que medimos e os direitos de LGPD. É o que o
//     formulário Data Safety precisa espelhar.
//   · help.* — FAQ e contato da tela de Ajuda, que antes eram literais em PT.
//   · social.mod.* — denunciar e bloquear no feed, exigência de app com
//     conteúdo de usuário.
//   · palm.moles.* — aviso bloqueante antes da câmera na Leitura de Pintas:
//     é simbólica e NÃO avalia pele (política de saúde do Google).
//   · planos.*Store / terms.payments.bodyStore / help.faq.cancel.*Store — a
//     variante Android do texto de cobrança. No Android o app entra GRÁTIS: a
//     tela de Planos explica que a assinatura ainda não abriu, oferece login e
//     restauração de compras. As chaves sem sufixo "Store" continuam sendo as
//     da web/Hotmart — as duas convivem de propósito.
const PLAY_STORE_I18N = {
  pt: {
    'profile.delete.localText': 'Isso apaga os dados salvos neste aparelho (nomes, signos, datas e sequência do casal). Você não está logado, então não há conta pra apagar — se quiser excluir sua conta, entre nela primeiro.',
    'profile.delete.confirmAccount': 'Apagar minha conta',
    'profile.delete.finalTitle': 'Tem certeza absoluta?',
    'profile.delete.finalText': 'Última confirmação. Ao tocar em "Apagar de vez", sua conta e seus dados somem na hora e não têm como voltar — nem pelo suporte.',
    'profile.delete.finalConfirm': 'Apagar de vez',
    'profile.delete.deleting': 'Apagando...',
    'profile.delete.failTitle': 'Não foi possível apagar',
    'profile.delete.failText': 'Sua conta e seus dados continuam intactos — nada foi apagado. Confira sua conexão e tente de novo em alguns instantes.',
    'profile.delete.failWipeLocal': 'Apagar só deste aparelho',
    'profile.delete.partialTitle': 'Conta apagada',
    'profile.delete.partialText': 'Sua conta foi apagada. Alguns dados ligados à sua assinatura podem não ter saído do nosso servidor agora — se quiser confirmação, ou precisar da assinatura de volta, escreva pra contato@cosmicguide.cloud com o e-mail que você usava aqui.',
    'report.cta': 'Reportar esta resposta',
    'report.title': 'Reportar esta resposta',
    'report.body': 'Esta resposta foi gerada por IA. Escolha o motivo e a resposta que está na tela é enviada e guardada para revisão. Na conversa com Órbi, ela pode repetir trechos do que você escreveu.',
    'report.reason.offensive': 'Ofensivo ou perigoso',
    'report.reason.wrong': 'Impreciso ou errado',
    'report.cancel': 'Cancelar',
    'report.thanks.title': 'Recebido',
    'report.thanks.body': 'Obrigado por sinalizar. Vamos revisar esse tipo de resposta.',
    'report.fail.title': 'Não deu pra enviar',
    'report.fail.body': 'Sua denúncia não chegou até nós agora. Tente de novo em alguns instantes.',
    'privacy.local.city': 'Cidade de nascimento (quando informada)',
    'privacy.local.journal': 'Suas leituras salvas e o que você escreve no Diário Cósmico',
    'privacy.local.intent': 'O tema, a situação e o objetivo que você escolheu para ordenar o primeiro caminho',
    'privacy.local.chat': 'O histórico da conversa com Órbi, inclusive o histórico antigo que foi importado',
    'privacy.ai.face': 'Foto do rosto (Leitura do Rosto)',
    'privacy.ai.foot': 'Foto do pé (Leitura do Pé)',
    'privacy.ai.moles': 'Foto de pintas e marcas da pele (Leitura de Pintas)',
    'privacy.ai.weekly': 'Suas leituras salvas e o placar do check-in (Insight da Semana e Resumo da Semana do Café)',
    'privacy.ai.voice': 'A reflexão que você escreve ou dita depois de uma leitura (Lapidar com IA)',
    'privacy.track.country': 'O país de onde veio o acesso, deduzido do endereço de internet — o endereço em si não é guardado',
    'privacy.use.localFirst': 'Nomes, datas, horários e signos servem para calcular a sinastria (compatibilidade astrológica) e o horóscopo do dia. Esse cálculo é feito aqui dentro do aparelho, e é aqui que esses dados ficam guardados. Estas são as situações em que algum dado sai deste aparelho:',
    'privacy.use.exceptionCheckout': 'Assinatura. Ao abrir o checkout, o nome de vocês dois (no modo casal), o seu e-mail e o plano escolhido vão para o nosso servidor e para a Hotmart, que processa o pagamento — é por eles que o suporte consegue achar a sua assinatura depois.',
    'privacy.use.exceptionCity': 'Busca da cidade de nascimento. O que você digita vai para o nosso servidor e, junto com ele, a data e a hora de nascimento que você acabou de informar — isso vale nas perguntas iniciais, no quiz do casal e no Mapa Astral, nos três — para achar as coordenadas e o fuso horário certos daquele instante. Essa busca não é ligada à sua conta nem guardada num perfil; como em qualquer site, o registro técnico de acesso do servidor guarda a chamada por um tempo.',
    'privacy.use.account': 'Conta de login. Se você cria conta com e-mail e senha, os dois vão para o Supabase, que é quem guarda o login (a senha fica cifrada lá — nem nós vemos). Se você escolhe entrar com o Google, quem confirma quem você é é o Google, e o seu e-mail e o nome da sua conta chegam ao Supabase por esse caminho. Sem conta, nada disso existe.',
    'privacy.use.ai': 'Leituras de IA. A foto ou o texto que você envia — Palma, Rosto, Pé, Pintas, Café, Sonhos, Conversar com Órbi, Insight da Semana e a reflexão que você manda lapidar — passa pelo nosso servidor e é enviado a um serviço de IA de terceiros (Anthropic), que gera a interpretação. Na conversa com Órbi, o signo e as três escolhas do primeiro caminho (tema, situação e objetivo) só acompanham a mensagem quando os quatro estão disponíveis juntos; nenhuma entrada do Diário nem mensagem do histórico importado é enviada nessa conversa. O nosso servidor não guarda o conteúdo da chamada: fica só a contagem de quantas leituras foram feitas no dia. O que a Anthropic mantém segue a política dela e não está sob o nosso controle. Uma exceção: se você tocar em "Reportar esta resposta", a resposta denunciada é guardada — leia o item de denúncia logo abaixo.',
    'privacy.rights.sharing': 'Saber com quem compartilhamos: Anthropic (gera as leituras de IA), Hotmart (cobra a assinatura), Supabase (guarda o login) e Google (só se você escolher entrar com a conta Google). A medição de uso e o feed social ficam no nosso servidor e não vão para mais ninguém.',
    'privacy.contact.retention': 'Para apagar a sua CONTA de login e o vínculo dela com a assinatura, vá em Perfil > Deletar conta: isso apaga o login no Supabase e desfaz o vínculo da assinatura no nosso servidor. Não saem por aí: o que você publicou no feed social (apague publicação por publicação dentro do feed ANTES, porque depois não sobra login para fazer isso pelo app), as denúncias e os bloqueios, e o recibo do pagamento, que fica por obrigação fiscal sem estar mais ligado a você. O botão vermelho abaixo limpa só este aparelho.',
    'privacy.delete.message': 'Isso apaga para sempre, neste aparelho, os nomes, signos, datas e horas de nascimento, a cidade, as três escolhas do primeiro caminho, o histórico da conversa com Órbi e a sequência salva — e apaga também, no nosso servidor, o histórico anônimo de passos deste aparelho e a inscrição do lembrete diário. NÃO saem por aqui: o que está no Diário Cósmico (cada entrada é apagada dentro do próprio Diário), a sua conta de login e o vínculo dela com a assinatura (Perfil > Deletar conta), o que você publicou no feed social (apagado por você, publicação por publicação, dentro do próprio feed) e as denúncias e bloqueios que você fez. Essa ação não pode ser desfeita.',
    'privacy.local.title': 'O que fica guardado neste aparelho',
    'privacy.local.names': 'Nomes de vocês dois (quando o modo casal é preenchido)',
    'privacy.local.dates': 'Datas de nascimento',
    'privacy.local.times': 'Horários de nascimento (quando informados)',
    'privacy.local.signs': 'Signos derivados das datas',
    'privacy.ai.title': 'O que sai daqui para gerar leituras de IA',
    'privacy.ai.palm': 'Foto da palma da mão (Leitura de Palma)',
    'privacy.ai.coffee': 'Foto da borra de café (Ritual do Café)',
    'privacy.ai.dream': 'Texto do sonho que você descreve (Sonhos)',
    'privacy.ai.chat': 'Mensagens da conversa com Órbi e, quando disponíveis juntos, seu signo e as três escolhas do primeiro caminho (nunca o Diário nem o histórico importado)',
    'privacy.track.title': 'O que medimos para melhorar o app',
    'privacy.track.steps': 'Que passos você deu no app (abriu, viu uma leitura, chegou nos planos)',
    'privacy.track.code': 'Um código aleatório do aparelho, criado aqui e sem ligação com você, sua conta ou seu e-mail',
    'privacy.track.noContent': 'Nunca o conteúdo: nada de nomes, datas de nascimento, leituras, diário ou conversas',
    'privacy.track.note': 'Isso fica só no nosso servidor (não vai para Google, Meta nem nenhuma outra empresa), serve para descobrir onde o app está confuso e é apagado sozinho depois de 90 dias. Apagar os dados aqui embaixo apaga também esse código e esse histórico de passos, no aparelho e no servidor.',
    'privacy.use.title': 'Quando algum dado sai daqui',
    'privacy.use.social': 'Feed social. Se você entra no feed (é preciso ter conta), o apelido, o @, o emoji do avatar e tudo que você publica ou comenta ficam no nosso servidor e são visíveis para os outros usuários do app. Cada publicação sua é apagada por você, dentro do próprio feed.',
    'privacy.use.push': 'Lembrete diário, no app aberto pelo navegador. Ligar o lembrete manda para o nosso servidor o endereço de notificação do navegador, o seu signo, a sua sequência e a data — nunca o texto — do seu último registro no Diário. Desligar o lembrete apaga essa inscrição.',
    'privacy.rights.title': 'Seus direitos (LGPD)',
    'privacy.rights.access': 'Confirmar se tratamos algum dado seu e acessá-lo',
    'privacy.rights.fix': 'Corrigir dados incompletos, inexatos ou desatualizados',
    'privacy.rights.erase': 'Pedir a eliminação dos dados tratados com seu consentimento',
    'privacy.contact.title': 'Fale conosco',
    'privacy.contact.intro': 'Para exercer qualquer um desses direitos, ou tirar dúvidas sobre como tratamos seus dados, escreva para',
    'privacy.delete.cta': 'Apagar os dados deste aparelho',
    'privacy.delete.title': 'Apagar os dados deste aparelho',
    'privacy.delete.confirm': 'Apagar tudo',
    'help.faq.title': 'Perguntas frequentes',
    'help.faq.couple.q': 'Como funciona o modo casal?',
    'help.faq.couple.answer': 'Vocês dois preenchem nomes, signos e datas de nascimento uma única vez no quiz do casal. A partir daí o app calcula a sinastria (compatibilidade astrológica) e gera horóscopos e leituras pensados pra dupla, não só individualmente.',
    'help.faq.readings.q': 'Minhas leituras são salvas?',
    'help.faq.readings.answer': 'As leituras que você salva ficam no Diário Cósmico, neste aparelho, junto com os dados de nascimento. Fotos e textos das leituras de IA passam pelo nosso servidor e pela Anthropic para gerar a resposta; nosso servidor não guarda o conteúdo da chamada, e o tratamento da Anthropic segue a política dela. Na conversa com Órbi, o signo e as três escolhas só acompanham a pergunta quando estão disponíveis juntos; o Diário e o histórico importado nunca são enviados. O histórico atual da conversa fica neste aparelho. O que você publica no feed social fica no nosso servidor e é visível para outros usuários. A lista completa está em Perfil > Privacidade.',
    'help.faq.cancel.q': 'Como cancelo minha assinatura?',
    'help.faq.account.q': 'Preciso criar uma conta pra usar o app?',
    'help.faq.account.answer': 'Para as leituras, não: o app funciona sem login. A conta é necessária para assinar, para usar o feed social e para levar o seu acesso para outro aparelho.',
    'help.contact.title': 'Fale conosco',
    'help.contact.intro': 'Não achou o que precisava? Manda sua dúvida, sugestão ou problema — a gente responde o quanto antes — para',
    'help.faq.cancel.answerStore': 'A qualquer momento, sem falar com ninguém. Se você assinou aqui pelo app, quem cobra é o Google Play: abra a Play Store, vá em Assinaturas, escolha o Cosmic Guide e toque em cancelar. Se você assinou pelo site, quem cobra é a Hotmart: entre na área de compras com o e-mail que você usou, abra a assinatura do Cosmic Guide e toque em cancelar. Nos dois casos o acesso continua até o fim do período já pago.',
    'help.faq.cancel.ctaStore': 'Abrir minhas assinaturas na Play Store',
    'social.mod.cta': 'Denunciar ou bloquear',
    'social.mod.menuBody': 'Escolha o que fazer com este conteúdo.',
    'social.mod.report': 'Denunciar',
    'social.mod.reportBody': 'Conte o que houve. O conteúdo denunciado vai junto, pra equipe conseguir analisar.',
    'social.mod.reasonSpam': 'Spam ou golpe',
    'social.mod.block': 'Bloquear',
    'social.mod.blockBody': 'Você deixa de ver as publicações e os comentários dessa pessoa — e ela deixa de ver os seus.',
    'social.mod.blockedTitle': 'Pessoa bloqueada',
    'social.mod.blockedBody': 'Nada dela aparece mais pra você por aqui. Vocês dois deixaram de se seguir, e desbloquear devolve o acesso mas não refaz esse vínculo.',
    'social.mod.undo': 'Desbloquear',
    'social.mod.failed': 'Não deu',
    'palm.moles.warnTitle': 'Isto não avalia a sua pele',
    'palm.moles.warnBody': 'A Leitura de Pintas é simbólica: ela vem da moleosofia, tradição popular, e NÃO analisa, não avalia e não acompanha a sua pele. Ela não identifica nada sobre a sua saúde e não substitui um dermatologista. Se alguma pinta mudou de cor, tamanho ou formato, procure um dermatologista.',
    'palm.moles.warnOk': 'Entendi, continuar',
    'planos.store.soonTitle': 'A assinatura ainda não abriu por aqui',
    'planos.store.soonText': 'Tudo que você já usa continua funcionando normalmente, de graça. Se você já assinou pelo site, entre com a mesma conta e o seu acesso vem junto — em qualquer aparelho. Quando a assinatura abrir aqui dentro, ela aparece nesta tela.',
    'planos.store.loginCta': 'Entrar na minha conta',
    'planos.store.restore': 'Restaurar compras',
    'planos.store.restoreNone': 'Não encontramos nenhuma assinatura ativa nesta conta do Google Play.',
    'planos.trustStore': 'Cancele quando quiser em Play Store > Assinaturas — o acesso continua até o fim do período já pago.',
    'planos.legal.billingNoteStore': 'Assinou aqui pelo app? A cobrança é do Google Play e o cancelamento é em Play Store > Assinaturas. Assinou pelo site? A cobrança é da Hotmart e o cancelamento é na sua área de compras. Nos dois casos renova sozinho no fim de cada período e você cancela quando quiser.',
    'terms.payments.bodyStore': 'Se você assinou dentro do app, a cobrança é feita pelo Google Play: a assinatura renova automaticamente no fim de cada período (mensal, trimestral ou anual) até você cancelar, e o cancelamento é em Play Store > Assinaturas, na sua conta do Google, a qualquer momento e sem justificativa. Se você assinou pelo site, quem processa e cobra é a Hotmart, e o cancelamento é na área de compras da Hotmart, com o e-mail usado na compra. Nos dois casos o acesso continua até o fim do período já pago, sem cobrança nova, e assinaturas com 7 dias grátis não geram cobrança se forem canceladas dentro desse prazo. Reembolsos seguem a política de quem processou a compra (Google Play ou Hotmart) e o Código de Defesa do Consumidor.',
    'planos.store.confirmando': 'A Google Play confirmou o pagamento. Falta o acesso aparecer na sua conta: isso acontece sozinho assim que a confirmação chega, e esta tela se atualiza quando você abrir ela de novo. Se depois de alguns minutos continuar trancado, fale com o suporte aqui embaixo.',
    'planos.store.pagamentoPendente': 'A Google Play ainda não confirmou este pagamento — pode estar aguardando aprovação ou processamento. Por isso nada foi liberado ainda. Quando a Play confirmar, o acesso abre na sua conta; dá pra acompanhar em Play Store > Assinaturas.',
    'privacy.use.report': 'Denúncia e bloqueio. Ao denunciar uma resposta de IA ou algo do feed, vão para o nosso servidor o motivo, o texto denunciado (a resposta de IA que estava na tela, ou uma cópia do post ou comentário e de quem o escreveu) e, se você estiver com a conta aberta, o identificador dela. Isso fica guardado sem prazo para sair: é o que permite julgar a denúncia depois que o conteúdo original é apagado, e não sai quando você apaga a sua conta. Bloquear alguém guarda quem bloqueou quem. Denunciar uma resposta de IA não exige conta.',
    'profile.delete.partialDevice': 'Os dados guardados neste aparelho podem não ter sido limpos. Dá pra apagar só deste aparelho pelo botão vermelho aqui do Perfil.',
    'social.mod.failedBody': 'Não deu pra concluir agora. Tente de novo em alguns instantes.',
    'social.profileUnavailable': 'Este perfil não está disponível.',
    'login.error.generic': 'Não foi possível concluir. Tente de novo em instantes.',
    'login.error.credentials': 'E-mail ou senha incorretos.',
    'login.error.alreadyRegistered': 'Já existe uma conta com esse e-mail.',
    'login.error.weakPassword': 'A senha precisa ter pelo menos 6 caracteres.',
    'login.error.invalidEmail': 'E-mail inválido.',
    'login.error.googleOff': 'O login com Google não está disponível agora. Use e-mail e senha.',
  },
  es: {
    'profile.delete.localText': 'Esto borra los datos guardados en este dispositivo (nombres, signos, fechas y la racha de la pareja). No has iniciado sesión, así que no hay cuenta que eliminar — si quieres eliminar tu cuenta, inicia sesión primero.',
    'profile.delete.confirmAccount': 'Eliminar mi cuenta',
    'profile.delete.finalTitle': '¿Estás completamente seguro?',
    'profile.delete.finalText': 'Última confirmación. Al tocar "Eliminar definitivamente", tu cuenta y tus datos desaparecen al instante y no hay forma de recuperarlos — ni con soporte.',
    'profile.delete.finalConfirm': 'Eliminar definitivamente',
    'profile.delete.deleting': 'Eliminando...',
    'profile.delete.failTitle': 'No se pudo eliminar',
    'profile.delete.failText': 'Tu cuenta y tus datos siguen intactos — no se borró nada. Revisa tu conexión e inténtalo de nuevo en unos instantes.',
    'profile.delete.failWipeLocal': 'Borrar solo de este dispositivo',
    'profile.delete.partialTitle': 'Cuenta eliminada',
    'profile.delete.partialText': 'Tu cuenta fue eliminada. Puede que algunos datos ligados a tu suscripción no hayan salido de nuestro servidor ahora mismo — si quieres confirmación, o necesitas recuperar la suscripción, escribe a contato@cosmicguide.cloud con el correo que usabas aquí.',
    'report.cta': 'Reportar esta respuesta',
    'report.title': 'Reportar esta respuesta',
    'report.body': 'Esta respuesta fue generada por IA. Elige el motivo y la respuesta que está en pantalla se envía y se guarda para revisión. En la conversación con Órbi puede repetir partes de lo que escribiste.',
    'report.reason.offensive': 'Ofensivo o peligroso',
    'report.reason.wrong': 'Impreciso o incorrecto',
    'report.cancel': 'Cancelar',
    'report.thanks.title': 'Recibido',
    'report.thanks.body': 'Gracias por avisar. Vamos a revisar este tipo de respuesta.',
    'report.fail.title': 'No se pudo enviar',
    'report.fail.body': 'Tu reporte no llegó hasta nosotros ahora. Inténtalo de nuevo en unos instantes.',
    'privacy.local.city': 'Ciudad de nacimiento (cuando se informa)',
    'privacy.local.journal': 'Tus lecturas guardadas y lo que escribes en el Diario Cósmico',
    'privacy.local.intent': 'El tema, la situación y el objetivo que elegiste para ordenar tu primer camino',
    'privacy.local.chat': 'El historial de la conversación con Órbi, incluido el historial anterior que fue importado',
    'privacy.ai.face': 'Foto del rostro (Lectura del Rostro)',
    'privacy.ai.foot': 'Foto del pie (Lectura del Pie)',
    'privacy.ai.moles': 'Foto de lunares y marcas de la piel (Lectura de Lunares)',
    'privacy.ai.weekly': 'Tus lecturas guardadas y el marcador del check-in (Insight de la Semana y Resumen de la Semana del Café)',
    'privacy.ai.voice': 'La reflexión que escribes o dictas después de una lectura (Pulir con IA)',
    'privacy.track.country': 'El país desde donde vino el acceso, deducido de la dirección de internet — la dirección en sí no se guarda',
    'privacy.use.localFirst': 'Nombres, fechas, horas y signos sirven para calcular la sinastría (compatibilidad astrológica) y el horóscopo del día. Ese cálculo se hace aquí dentro del dispositivo, y es aquí donde esos datos quedan guardados. Estas son las situaciones en las que algún dato sale de este dispositivo:',
    'privacy.use.exceptionCheckout': 'Suscripción. Al abrir el checkout, el nombre de ustedes dos (en modo pareja), tu correo y el plan elegido van a nuestro servidor y a Hotmart, que procesa el pago — es por ellos que el soporte logra encontrar tu suscripción después.',
    'privacy.use.exceptionCity': 'Búsqueda de la ciudad de nacimiento. Lo que escribes va a nuestro servidor y, junto con eso, la fecha y la hora de nacimiento que acabas de informar — vale en las preguntas iniciales, en el test de pareja y en la Carta Astral, en los tres — para encontrar las coordenadas y el huso horario correctos de ese instante. Esa búsqueda no se vincula a tu cuenta ni se guarda en un perfil; como en cualquier sitio, el registro técnico de acceso del servidor guarda la llamada por un tiempo.',
    'privacy.use.account': 'Cuenta de acceso. Si creas cuenta con correo y contraseña, los dos van a Supabase, que es quien guarda el acceso (la contraseña queda cifrada allí — ni nosotros la vemos). Si eliges entrar con Google, quien confirma quién eres es Google, y tu correo y el nombre de tu cuenta llegan a Supabase por ese camino. Sin cuenta, nada de eso existe.',
    'privacy.use.ai': 'Lecturas de IA. La foto o el texto que envías — Palma, Rostro, Pie, Lunares, Café, Sueños, Conversar con Órbi, Insight de la Semana y la reflexión que mandas pulir — pasa por nuestro servidor y se envía a un servicio de IA de terceros (Anthropic), que genera la interpretación. En la conversación con Órbi, el signo y las tres elecciones del primer camino (tema, situación y objetivo) solo acompañan el mensaje cuando los cuatro están disponibles juntos; ninguna entrada del Diario ni mensaje del historial importado se envía en esa conversación. Nuestro servidor no guarda el contenido de la llamada: solo queda el conteo de lecturas del día. Lo que Anthropic conserva sigue su propia política y no está bajo nuestro control. Una excepción: si tocas "Reportar esta respuesta", la respuesta reportada sí se guarda — lee el punto de reportes justo abajo.',
    'privacy.rights.sharing': 'Saber con quién compartimos: Anthropic (genera las lecturas de IA), Hotmart (cobra la suscripción), Supabase (guarda el acceso) y Google (solo si eliges entrar con la cuenta de Google). La medición de uso y el feed social quedan en nuestro servidor y no van a nadie más.',
    'privacy.contact.retention': 'Para eliminar tu CUENTA de acceso y su vínculo con la suscripción, ve a Perfil > Eliminar cuenta: eso borra el acceso en Supabase y deshace el vínculo de la suscripción en nuestro servidor. No salen por ahí: lo que publicaste en el feed social (bórralo publicación por publicación dentro del feed ANTES, porque después no queda acceso para hacerlo desde la app), los reportes y los bloqueos, y el recibo del pago, que se conserva por obligación fiscal sin seguir ligado a ti. El botón rojo de abajo limpia solo este dispositivo.',
    'privacy.delete.message': 'Esto borra para siempre, en este dispositivo, los nombres, signos, fechas y horas de nacimiento, la ciudad, las tres elecciones del primer camino, el historial de la conversación con Órbi y la racha guardada — y borra también, en nuestro servidor, el historial anónimo de pasos de este dispositivo y la suscripción del recordatorio diario. NO se van por aquí: lo que está en el Diario Cósmico (cada entrada se borra dentro del propio Diario), tu cuenta de acceso y su vínculo con la suscripción (Perfil > Eliminar cuenta), lo que publicaste en el feed social (lo borras tú, publicación por publicación, dentro del feed) y los reportes y bloqueos que hiciste. Esta acción no se puede deshacer.',
    'privacy.local.title': 'Lo que queda guardado en este dispositivo',
    'privacy.local.names': 'Los nombres de ustedes dos (cuando se completa el modo pareja)',
    'privacy.local.dates': 'Fechas de nacimiento',
    'privacy.local.times': 'Horas de nacimiento (cuando se informan)',
    'privacy.local.signs': 'Signos derivados de las fechas',
    'privacy.ai.title': 'Lo que sale de aquí para generar lecturas de IA',
    'privacy.ai.palm': 'Foto de la palma de la mano (Lectura de Palma)',
    'privacy.ai.coffee': 'Foto de la borra de café (Ritual del Café)',
    'privacy.ai.dream': 'El texto del sueño que describes (Sueños)',
    'privacy.ai.chat': 'Los mensajes de la conversación con Órbi y, cuando están disponibles juntos, tu signo y las tres elecciones del primer camino (nunca el Diario ni el historial importado)',
    'privacy.track.title': 'Lo que medimos para mejorar la app',
    'privacy.track.steps': 'Qué pasos diste en la app (abriste, viste una lectura, llegaste a los planes)',
    'privacy.track.code': 'Un código aleatorio del dispositivo, creado aquí y sin vínculo con vos, tu cuenta o tu correo',
    'privacy.track.noContent': 'Nunca el contenido: nada de nombres, fechas de nacimiento, lecturas, diario ni conversaciones',
    'privacy.track.note': 'Esto queda solo en nuestro servidor (no va a Google, Meta ni a ninguna otra empresa), sirve para descubrir dónde la app confunde y se borra solo después de 90 días. Borrar los datos aquí abajo borra también ese código y ese historial de pasos, en el dispositivo y en el servidor.',
    'privacy.use.title': 'Cuándo algún dato sale de aquí',
    'privacy.use.social': 'Feed social. Si entras al feed (hace falta cuenta), el apodo, el @, el emoji del avatar y todo lo que publicas o comentas quedan en nuestro servidor y son visibles para los demás usuarios de la app. Cada publicación tuya la borras vos, dentro del propio feed.',
    'privacy.use.push': 'Recordatorio diario, en la app abierta por el navegador. Activar el recordatorio manda a nuestro servidor la dirección de notificación del navegador, tu signo, tu racha y la fecha — nunca el texto — de tu último registro en el Diario. Desactivar el recordatorio borra esa suscripción.',
    'privacy.rights.title': 'Tus derechos (protección de datos)',
    'privacy.rights.access': 'Confirmar si tratamos algún dato tuyo y acceder a él',
    'privacy.rights.fix': 'Corregir datos incompletos, inexactos o desactualizados',
    'privacy.rights.erase': 'Pedir la eliminación de los datos tratados con tu consentimiento',
    'privacy.contact.title': 'Habla con nosotros',
    'privacy.contact.intro': 'Para ejercer cualquiera de esos derechos, o resolver dudas sobre cómo tratamos tus datos, escribe a',
    'privacy.delete.cta': 'Borrar los datos de este dispositivo',
    'privacy.delete.title': 'Borrar los datos de este dispositivo',
    'privacy.delete.confirm': 'Borrar todo',
    'help.faq.title': 'Preguntas frecuentes',
    'help.faq.couple.q': '¿Cómo funciona el modo pareja?',
    'help.faq.couple.answer': 'Ustedes dos completan nombres, signos y fechas de nacimiento una sola vez en el test de pareja. A partir de ahí la app calcula la sinastría (compatibilidad astrológica) y genera horóscopos y lecturas pensados para los dos, no solo individualmente.',
    'help.faq.readings.q': '¿Mis lecturas se guardan?',
    'help.faq.readings.answer': 'Las lecturas que guardas quedan en el Diario Cósmico, en este dispositivo, junto con tus datos de nacimiento. Las fotos y los textos de las lecturas de IA pasan por nuestro servidor y por Anthropic para generar la respuesta; nuestro servidor no guarda el contenido de la llamada y el tratamiento de Anthropic sigue su propia política. En la conversación con Órbi, el signo y las tres elecciones solo acompañan la pregunta cuando están disponibles juntos; el Diario y el historial importado nunca se envían. El historial actual de la conversación queda en este dispositivo. Lo que publicas en el feed social queda en nuestro servidor y es visible para otros usuarios. La lista completa está en Perfil > Privacidad.',
    'help.faq.cancel.q': '¿Cómo cancelo mi suscripción?',
    'help.faq.account.q': '¿Necesito crear una cuenta para usar la app?',
    'help.faq.account.answer': 'Para las lecturas, no: la app funciona sin iniciar sesión. La cuenta hace falta para suscribirte, para usar el feed social y para llevar tu acceso a otro dispositivo.',
    'help.contact.title': 'Habla con nosotros',
    'help.contact.intro': '¿No encontraste lo que necesitabas? Manda tu duda, sugerencia o problema — respondemos lo antes posible — a',
    'help.faq.cancel.answerStore': 'Cuando quieras, sin hablar con nadie. Si te suscribiste acá por la app, quien cobra es Google Play: abrí la Play Store, andá a Suscripciones, elegí Cosmic Guide y tocá cancelar. Si te suscribiste por el sitio, quien cobra es Hotmart: entrá en tu área de compras con el correo que usaste, abrí la suscripción de Cosmic Guide y tocá cancelar. En los dos casos el acceso sigue hasta el final del período ya pagado.',
    'help.faq.cancel.ctaStore': 'Abrir mis suscripciones en la Play Store',
    'social.mod.cta': 'Denunciar o bloquear',
    'social.mod.menuBody': 'Elige qué hacer con este contenido.',
    'social.mod.report': 'Denunciar',
    'social.mod.reportBody': 'Cuéntanos qué pasó. El contenido denunciado va junto, para que el equipo pueda revisarlo.',
    'social.mod.reasonSpam': 'Spam o estafa',
    'social.mod.block': 'Bloquear',
    'social.mod.blockBody': 'Dejas de ver las publicaciones y los comentarios de esa persona — y ella deja de ver los tuyos.',
    'social.mod.blockedTitle': 'Persona bloqueada',
    'social.mod.blockedBody': 'Ya no verás nada de ella por aquí. Los dos dejaron de seguirse, y desbloquear devuelve el acceso pero no rehace ese vínculo.',
    'social.mod.undo': 'Desbloquear',
    'social.mod.failed': 'No funcionó',
    'palm.moles.warnTitle': 'Esto no evalúa tu piel',
    'palm.moles.warnBody': 'La Lectura de Lunares es simbólica: viene de la moleosofía, tradición popular, y NO analiza, no evalúa ni hace seguimiento de tu piel. No identifica nada sobre tu salud y no sustituye a un dermatólogo. Si un lunar cambió de color, tamaño o forma, acude a un dermatólogo.',
    'palm.moles.warnOk': 'Entendido, continuar',
    'planos.store.soonTitle': 'La suscripción todavía no se abrió por acá',
    'planos.store.soonText': 'Todo lo que ya usás sigue funcionando normalmente, gratis. Si ya te suscribiste por el sitio, entrá con la misma cuenta y tu acceso viene con vos — en cualquier dispositivo. Cuando la suscripción se abra acá adentro, aparece en esta pantalla.',
    'planos.store.loginCta': 'Entrar en mi cuenta',
    'planos.store.restore': 'Restaurar compras',
    'planos.store.restoreNone': 'No encontramos ninguna suscripción activa en esta cuenta de Google Play.',
    'planos.trustStore': 'Cancelá cuando quieras en Play Store > Suscripciones — el acceso sigue hasta el final del período ya pagado.',
    'planos.legal.billingNoteStore': '¿Te suscribiste acá por la app? El cobro es de Google Play y la cancelación es en Play Store > Suscripciones. ¿Te suscribiste por el sitio? El cobro es de Hotmart y la cancelación es en tu área de compras. En los dos casos se renueva solo al final de cada período y lo cancelás cuando quieras.',
    'terms.payments.bodyStore': 'Si te suscribiste dentro de la app, el cobro lo hace Google Play: la suscripción se renueva automáticamente al final de cada período (mensual, trimestral o anual) hasta que la canceles, y la cancelación es en Play Store > Suscripciones, en tu cuenta de Google, en cualquier momento y sin justificación. Si te suscribiste por el sitio, quien procesa y cobra es Hotmart, y la cancelación es en el área de compras de Hotmart, con el correo usado en la compra. En los dos casos el acceso sigue hasta el final del período ya pagado, sin cobro nuevo, y las suscripciones con 7 días gratis no generan cobro si se cancelan dentro de ese plazo. Los reembolsos siguen la política de quien procesó la compra (Google Play u Hotmart) y la ley de defensa del consumidor aplicable.',
    'planos.store.confirmando': 'Google Play confirmó el pago. Falta que el acceso aparezca en tu cuenta: eso pasa solo apenas llega la confirmación, y esta pantalla se actualiza cuando la abres de nuevo. Si después de unos minutos sigue bloqueado, escríbenos por soporte aquí abajo.',
    'planos.store.pagamentoPendente': 'Google Play todavía no confirmó este pago — puede estar esperando aprobación o procesamiento. Por eso todavía no se liberó nada. Cuando Play confirme, el acceso se abre en tu cuenta; puedes seguirlo en Play Store > Suscripciones.',
    'privacy.use.report': 'Reportes y bloqueos. Al reportar una respuesta de IA o algo del feed, van a nuestro servidor el motivo, el texto reportado (la respuesta de IA que estaba en pantalla, o una copia del post o comentario y de quien lo escribió) y, si tienes la sesión abierta, el identificador de tu cuenta. Eso queda guardado sin plazo para salir: es lo que permite juzgar el reporte después de que el contenido original se borra, y no se va cuando borras tu cuenta. Bloquear a alguien guarda quién bloqueó a quién. Reportar una respuesta de IA no exige cuenta.',
    'profile.delete.partialDevice': 'Puede que los datos guardados en este dispositivo no se hayan borrado. Puedes borrar solo este dispositivo con el botón rojo aquí en Perfil.',
    'social.mod.failedBody': 'No se pudo completar ahora. Inténtalo de nuevo en unos instantes.',
    'social.profileUnavailable': 'Este perfil no está disponible.',
    'login.error.generic': 'No se pudo completar. Inténtalo de nuevo en unos instantes.',
    'login.error.credentials': 'Correo o contraseña incorrectos.',
    'login.error.alreadyRegistered': 'Ya existe una cuenta con ese correo.',
    'login.error.weakPassword': 'La contraseña necesita al menos 6 caracteres.',
    'login.error.invalidEmail': 'Correo electrónico inválido.',
    'login.error.googleOff': 'El inicio de sesión con Google no está disponible ahora. Usa correo y contraseña.',
  },
  en: {
    'profile.delete.localText': 'This erases the data saved on this device (names, signs, dates and the couple streak). You are not signed in, so there is no account to delete — sign in first if you want to delete your account.',
    'profile.delete.confirmAccount': 'Delete my account',
    'profile.delete.finalTitle': 'Are you absolutely sure?',
    'profile.delete.finalText': 'Last confirmation. Tapping "Delete permanently" removes your account and your data right away, with no way to get them back — not even through support.',
    'profile.delete.finalConfirm': 'Delete permanently',
    'profile.delete.deleting': 'Deleting...',
    'profile.delete.failTitle': "Couldn't delete",
    'profile.delete.failText': 'Your account and your data are still intact — nothing was deleted. Check your connection and try again in a moment.',
    'profile.delete.failWipeLocal': 'Erase only on this device',
    'profile.delete.partialTitle': 'Account deleted',
    'profile.delete.partialText': 'Your account was deleted. Some data tied to your subscription may not have left our server just now — if you want confirmation, or need your subscription back, write to contato@cosmicguide.cloud and mention the email you used here.',
    'report.cta': 'Report this response',
    'report.title': 'Report this response',
    'report.body': 'This response was generated by AI. Pick a reason and the response on screen is sent and stored for review. In the conversation with Órbi, it may repeat parts of what you wrote.',
    'report.reason.offensive': 'Offensive or harmful',
    'report.reason.wrong': 'Inaccurate or wrong',
    'report.cancel': 'Cancel',
    'report.thanks.title': 'Received',
    'report.thanks.body': "Thanks for flagging. We'll review this kind of response.",
    'report.fail.title': 'Could not send',
    'report.fail.body': 'Your report did not reach us just now. Please try again in a moment.',
    'privacy.local.city': 'Birth city (when provided)',
    'privacy.local.journal': 'Your saved readings and whatever you write in the Cosmic Diary',
    'privacy.local.intent': 'The theme, situation and goal you chose to order your first path',
    'privacy.local.chat': 'Your conversation history with Órbi, including the previous history that was imported',
    'privacy.ai.face': 'Photo of your face (Face Reading)',
    'privacy.ai.foot': 'Photo of your foot (Foot Reading)',
    'privacy.ai.moles': 'Photo of moles and skin marks (Mole Reading)',
    'privacy.ai.weekly': 'Your saved readings and your check-in tally (Weekly Insight and Coffee Weekly Summary)',
    'privacy.ai.voice': 'The reflection you type or dictate after a reading (Polish with AI)',
    'privacy.track.country': 'The country the visit came from, inferred from the internet address — the address itself is never stored',
    'privacy.use.localFirst': 'Names, dates, times and signs are used to calculate your synastry (astrological compatibility) and your horoscope for the day. That calculation happens right here on the device, and this is where those details are kept. These are the situations where data does leave this device:',
    'privacy.use.exceptionCheckout': 'Subscription. When you open checkout, both your names (in couple mode), your email and the plan you picked go to our server and to Hotmart, which processes the payment — that is how support can find your subscription later.',
    'privacy.use.exceptionCity': "Birth city search. What you type goes to our server and, along with it, the birth date and time you just entered — this applies in the opening questions, in the couple quiz and in the Birth Chart, all three — so we can find the right coordinates and time zone for that exact moment. The search is not tied to your account and is not kept in any profile; as on any website, the server's technical access log holds the request for a while.",
    'privacy.use.account': 'Login account. If you create an account with email and password, both go to Supabase, which is what holds the login (the password is stored encrypted there — not even we can see it). If you choose to sign in with Google, it is Google that confirms who you are, and your email and account name reach Supabase through that route. Without an account, none of this exists.',
    'privacy.use.ai': "AI readings. The photo or text you send — Palm, Face, Foot, Moles, Coffee, Dreams, Talk with Órbi, Weekly Insight and the reflection you ask us to polish — passes through our server and is sent to a third-party AI service (Anthropic), which generates the interpretation. In the conversation with Órbi, the sign and three first-path choices (theme, situation and goal) only travel with the message when all four are available together; no Diary entry or imported-history message is sent in that conversation. Our server does not store the call content: only the day's reading count remains. Whatever Anthropic keeps follows Anthropic's own policy and is outside our control. One exception: if you tap \"Report this response\", the reported response is stored — see the reporting item just below.",
    'privacy.rights.sharing': 'Know who we share it with: Anthropic (generates the AI readings), Hotmart (bills the subscription), Supabase (holds the login) and Google (only if you choose to sign in with a Google account). Usage measurement and the social feed stay on our own server and go nowhere else.',
    'privacy.contact.retention': 'To delete your login ACCOUNT and its link to the subscription, go to Profile > Delete account: that erases the login on Supabase and unlinks the subscription on our server. These do not go with it: whatever you posted in the social feed (delete it post by post inside the feed FIRST, because afterwards no login is left to do it from the app), the reports and the blocks, and the payment receipt, which is kept to meet tax obligations and is no longer linked to you. The red button below only wipes this device.',
    'privacy.delete.message': "This permanently erases, on this device, the names, signs, birth dates and times, the city, the three first-path choices, your conversation history with Órbi and the saved streak — and also erases, on our server, this device's anonymous history of steps and the daily reminder subscription. These do NOT go away here: whatever is in the Cosmic Diary (each entry is deleted from inside the Diary itself), your login account and its link to the subscription (Profile > Delete account), whatever you posted in the social feed (deleted by you, post by post, inside the feed itself) and the reports and blocks you made. This action cannot be undone.",
    'privacy.local.title': 'What stays on this device',
    'privacy.local.names': 'Both names (when couple mode is completed)',
    'privacy.local.dates': 'Birth dates',
    'privacy.local.times': 'Birth times (when provided)',
    'privacy.local.signs': 'Signs derived from those dates',
    'privacy.ai.title': 'What leaves this device to generate AI readings',
    'privacy.ai.palm': 'Photo of your palm (Palm Reading)',
    'privacy.ai.coffee': 'Photo of the coffee grounds (Coffee Ritual)',
    'privacy.ai.dream': 'The dream you describe in writing (Dreams)',
    'privacy.ai.chat': 'Messages in the conversation with Órbi and, when available together, your sign and three first-path choices (never your Diary or imported history)',
    'privacy.track.title': 'What we measure to improve the app',
    'privacy.track.steps': 'Which steps you took in the app (opened it, saw a reading, reached the plans)',
    'privacy.track.code': 'A random device code, created here and not linked to you, your account or your email',
    'privacy.track.noContent': 'Never the content: no names, birth dates, readings, diary or conversations',
    'privacy.track.note': 'This stays on our own server (it never goes to Google, Meta or any other company), it exists to show us where the app confuses people, and it deletes itself after 90 days. Erasing your data below also erases that code and that history of steps, both on the device and on the server.',
    'privacy.use.title': 'When data leaves this device',
    'privacy.use.social': 'Social feed. If you join the feed (an account is required), your display name, your @handle, your avatar emoji and everything you post or comment stay on our server and are visible to other people using the app. Each of your posts is deleted by you, from inside the feed itself.',
    'privacy.use.push': "Daily reminder, in the app opened through a browser. Turning the reminder on sends our server your browser's notification address, your sign, your streak and the date — never the text — of your last Diary entry. Turning the reminder off deletes that subscription.",
    'privacy.rights.title': 'Your rights (data protection)',
    'privacy.rights.access': 'Confirm whether we handle any data of yours, and see it',
    'privacy.rights.fix': 'Correct data that is incomplete, inaccurate or out of date',
    'privacy.rights.erase': 'Ask for deletion of the data handled with your consent',
    'privacy.contact.title': 'Talk to us',
    'privacy.contact.intro': 'To exercise any of these rights, or to ask how we handle your data, write to',
    'privacy.delete.cta': 'Erase the data on this device',
    'privacy.delete.title': 'Erase the data on this device',
    'privacy.delete.confirm': 'Erase everything',
    'help.faq.title': 'Frequently asked questions',
    'help.faq.couple.q': 'How does couple mode work?',
    'help.faq.couple.answer': 'The two of you fill in names, signs and birth dates once, in the couple quiz. From there the app calculates your synastry (astrological compatibility) and generates horoscopes and readings made for the pair, not just for one person.',
    'help.faq.readings.q': 'Are my readings saved?',
    'help.faq.readings.answer': 'The readings you save stay in the Cosmic Diary on this device, together with your birth details. Photos and text for AI readings pass through our server and Anthropic to generate the response; our server does not store the call content, and Anthropic handles it under its own policy. In an Órbi conversation, the sign and three choices travel only when all four are available together; your Diary and imported history are never sent. The current conversation history stays on this device. Social-feed posts stay on our server and are visible to other users. The full list is in Profile > Privacy.',
    'help.faq.cancel.q': 'How do I cancel my subscription?',
    'help.faq.account.q': 'Do I need an account to use the app?',
    'help.faq.account.answer': 'Not for the readings: the app works without signing in. An account is needed to subscribe, to use the social feed and to carry your access to another device.',
    'help.contact.title': 'Talk to us',
    'help.contact.intro': "Didn't find what you needed? Send your question, suggestion or problem — we answer as soon as we can — to",
    'help.faq.cancel.answerStore': 'Anytime, without talking to anyone. If you subscribed here in the app, Google Play does the billing: open the Play Store, go to Subscriptions, pick Cosmic Guide and tap cancel. If you subscribed on the website, Hotmart does the billing: sign in to your purchases area with the email you used, open the Cosmic Guide subscription and tap cancel. Either way, access continues until the end of the period you already paid for.',
    'help.faq.cancel.ctaStore': 'Open my Play Store subscriptions',
    'social.mod.cta': 'Report or block',
    'social.mod.menuBody': 'Choose what to do with this content.',
    'social.mod.report': 'Report',
    'social.mod.reportBody': 'Tell us what happened. The reported content goes with it, so the team can review it.',
    'social.mod.reasonSpam': 'Spam or scam',
    'social.mod.block': 'Block',
    'social.mod.blockBody': "You stop seeing that person's posts and comments — and they stop seeing yours.",
    'social.mod.blockedTitle': 'Person blocked',
    'social.mod.blockedBody': 'Nothing from them shows up here anymore. You both stopped following each other, and unblocking restores access but not the follow.',
    'social.mod.undo': 'Unblock',
    'social.mod.failed': "Didn't work",
    'palm.moles.warnTitle': 'This does not assess your skin',
    'palm.moles.warnBody': 'The Mole Reading is symbolic: it comes from moleosophy, a folk tradition, and does NOT analyze, assess or monitor your skin. It identifies nothing about your health and does not replace a dermatologist. If a mole has changed color, size or shape, see a dermatologist.',
    'palm.moles.warnOk': 'I understand, continue',
    'planos.store.soonTitle': "Subscriptions aren't open here yet",
    'planos.store.soonText': "Everything you already use keeps working, for free. If you already subscribed on the website, sign in with the same account and your access comes with you — on any device. When subscriptions open inside the app, they'll show up on this screen.",
    'planos.store.loginCta': 'Sign in to my account',
    'planos.store.restore': 'Restore purchases',
    'planos.store.restoreNone': "We couldn't find an active subscription on this Google Play account.",
    'planos.trustStore': 'Cancel anytime in Play Store > Subscriptions — access continues until the end of the period you already paid for.',
    'planos.legal.billingNoteStore': 'Subscribed here in the app? Billing is handled by Google Play and you cancel in Play Store > Subscriptions. Subscribed on the website? Billing is handled by Hotmart and you cancel in your purchases area. Either way it renews on its own at the end of each period and you can cancel whenever you want.',
    'terms.payments.bodyStore': 'If you subscribed inside the app, billing is handled by Google Play: the subscription renews automatically at the end of each period (monthly, quarterly or yearly) until you cancel, and cancellation is done in Play Store > Subscriptions, in your Google account, at any time and without giving a reason. If you subscribed on the website, Hotmart processes and bills it, and cancellation is done in the Hotmart purchases area with the email used at purchase. Either way, access continues until the end of the period already paid for, with no new charge, and subscriptions with a 7-day free trial are not charged if cancelled within that window. Refunds follow the policy of whoever processed the purchase (Google Play or Hotmart) and applicable consumer protection law.',
    'planos.store.confirmando': "Google Play confirmed your payment. Now the access has to show up in your account: that happens on its own as soon as the confirmation arrives, and this screen updates when you open it again. If it's still locked after a few minutes, reach out through the support link below.",
    'planos.store.pagamentoPendente': "Google Play hasn't confirmed this payment yet — it may be waiting for approval or still processing. That's why nothing is unlocked yet. Once Play confirms, access opens in your account; you can track it in Play Store > Subscriptions.",
    'privacy.use.report': 'Reports and blocks. When you report an AI response or something in the feed, our server receives the reason, the reported text (the AI response that was on screen, or a copy of the post or comment and of whoever wrote it) and, if you are signed in, your account identifier. That is stored with no expiry date: it is what makes a report judgeable after the original content is deleted, and it does not go away when you delete your account. Blocking someone stores who blocked whom. Reporting an AI response does not require an account.',
    'profile.delete.partialDevice': 'The data stored on this device may not have been cleared. You can erase just this device with the red button here in Profile.',
    'social.mod.failedBody': "Couldn't complete that right now. Try again in a moment.",
    'social.profileUnavailable': "This profile isn't available.",
    'login.error.generic': "We couldn't complete that. Please try again in a moment.",
    'login.error.credentials': 'Incorrect email or password.',
    'login.error.alreadyRegistered': "There's already an account with that email.",
    'login.error.weakPassword': 'Your password needs at least 6 characters.',
    'login.error.invalidEmail': 'Invalid email address.',
    'login.error.googleOff': "Google sign-in isn't available right now. Use email and password instead.",
  },
};
Object.assign(PT, PLAY_STORE_I18N.pt);
Object.assign(ES, PLAY_STORE_I18N.es);
Object.assign(EN, PLAY_STORE_I18N.en);

// LOTE 2 — ritual tátil, contexto privado e ponte segura para a comunidade.
// As cartas e os significados canônicos não mudam com a resposta: estes textos
// apenas deixam visível qual lente a pessoa escolheu e o que pode ser público.
const TAROT_LOTE_2_I18N = {
  pt: {
    'tarot.scratch.tapAlternative': 'Revelar sem raspar',
    'tarot.question.eyebrow': 'CONTEXTO OPCIONAL',
    'tarot.question.title': 'Quer levar uma pergunta para as cartas?',
    'tarot.question.placeholder': 'Escreva sua pergunta em uma frase…',
    'tarot.question.help': 'Se preferir, deixe em branco. A pergunta orienta a síntese; as cartas continuam sendo sorteadas.',
    'tarot.question.private': 'Fica só no seu aparelho e não entra no Feed.',
    'tarot.question.profileLens': 'Você pediu {outcome}. Vou usar isso como lente, sem alterar nenhum significado.',
    'tarot.draw.saveErrorTitle': 'A leitura não foi consumida',
    'tarot.draw.saveErrorBody': 'Não consegui guardar as cartas com segurança neste aparelho. Libere espaço e tente de novo; seu limite e seu bônus continuam intactos.',
    'tarot.draw.progressErrorBody': 'A carta abriu, mas o progresso não pôde ser guardado. Mantenha esta tela aberta até concluir a leitura.',
    'tarot.draw.bonusUnavailableTitle': 'O bônus não foi consumido',
    'tarot.draw.bonusUnavailableBody': 'O saldo mudou antes da confirmação. Nenhuma leitura foi iniciada; confira a Loja e tente novamente.',
    'tarot.ritual.step': 'CARTA {current} DE {total}',
    'tarot.ritual.next': 'Ir para a próxima carta',
    'tarot.ritual.complete': 'As três cartas estão abertas',
    'tarot.personal.title': 'O fio da sua leitura',
    'tarot.personal.withQuestion': 'Você trouxe “{question}” para uma leitura sobre {theme}.',
    'tarot.personal.withoutQuestion': 'Você escolheu olhar para {theme} sem fechar a leitura em uma pergunta única.',
    'tarot.personal.bridge': '{past} dá o contexto, {present} concentra o ponto de atenção e {future} abre uma possibilidade — não uma promessa.',
    'tarot.personal.prompt.clarity': 'Para buscar clareza: o que ficou mais nítido quando você comparou o presente com o contexto que veio antes?',
    'tarot.personal.prompt.nextStep': 'Para encontrar um próximo passo: qual gesto pequeno cabe nas próximas 24 horas sem depender da decisão de outra pessoa?',
    'tarot.personal.prompt.patterns': 'Para reconhecer padrões: o que parece se repetir entre o contexto, o presente e a possibilidade mostrada pelas cartas?',
    'tarot.personal.prompt.timing': 'Para pensar em timing: o que ainda precisa amadurecer e qual sinal concreto mostraria que é hora de agir?',
    'tarot.personal.disclaimer': 'A pergunta aparece como contexto da síntese; ela não transforma possibilidade em certeza nem muda o significado das cartas.',
    'tarot.reflection.title': 'O que você leva desta leitura?',
    'tarot.reflection.body': 'Guarde uma frase sua enquanto a impressão ainda está fresca.',
    'tarot.reflection.placeholder': 'Minha anotação…',
    'tarot.reflection.save': 'Guardar no Diário',
    'tarot.reflection.saved': 'Guardado no Diário',
    'tarot.reflection.private': 'Anotação privada · não será compartilhada',
    'tarot.diary.question': 'Sua pergunta privada',
    'tarot.diary.reflection': 'Sua anotação privada',
    'tarot.community.title': 'Leve as cartas para a comunidade',
    'tarot.community.body': 'Compartilhe a tiragem com quem segue você ou abra o Feed para acompanhar os perfis que você segue.',
    'tarot.community.privacy': 'Sua pergunta e sua anotação nunca entram na publicação.',
    'tarot.community.share': 'Compartilhar só as cartas',
    'tarot.community.view': 'Ver comunidade',
    'tarot.community.login': 'Entrar para compartilhar',
    'tarot.community.couplePrivate': 'Leituras feitas no modo casal continuam privadas.',
    'tarot.community.sharing': 'Compartilhando…',
    'tarot.community.sharedTitle': 'Publicado',
    'tarot.community.sharedBody': 'As cartas e a leitura pública já apareceram no Feed. Sua pergunta e sua anotação ficaram privadas.',
    'tarot.community.sharedCta': 'Cartas publicadas',
    'tarot.community.ok': 'Ficar aqui',
    'tarot.community.errorTitle': 'Não foi possível compartilhar',
    'tarot.community.previewTitle': 'O que vai para o Feed',
    'tarot.community.previewBody': 'Serão publicados o tema, as cartas e a interpretação da tiragem. Sua pergunta, seus dados pessoais e sua anotação ficam neste aparelho.',
    'tarot.community.cancel': 'Manter só para mim',
    'tarot.community.publish': 'Publicar cartas',
    'tarot.community.profileTitle': 'Crie seu perfil da comunidade',
    'tarot.community.profileBody': 'Antes da primeira publicação, escolha o nome, o @usuário e o emoji que vão aparecer no Feed.',
    'tarot.community.profileCta': 'Criar perfil',
    'tarot.community.errorBody': 'Tente novamente em alguns instantes.',
    'tarot.community.privateBodyMissing': 'Esta leitura contém contexto privado e não tem uma versão pública segura. Ela continuará apenas no seu Diário.',
  },
  es: {
    'tarot.scratch.tapAlternative': 'Revelar sin raspar',
    'tarot.question.eyebrow': 'CONTEXTO OPCIONAL',
    'tarot.question.title': '¿Quieres llevar una pregunta a las cartas?',
    'tarot.question.placeholder': 'Escribe tu pregunta en una frase…',
    'tarot.question.help': 'Si prefieres, déjalo en blanco. La pregunta orienta la síntesis; las cartas se siguen sorteando.',
    'tarot.question.private': 'Se queda solo en tu dispositivo y no va al Feed.',
    'tarot.question.profileLens': 'Pediste {outcome}. Lo usaré como lente, sin cambiar ningún significado.',
    'tarot.draw.saveErrorTitle': 'La lectura no fue consumida',
    'tarot.draw.saveErrorBody': 'No pude guardar las cartas de forma segura en este dispositivo. Libera espacio e inténtalo de nuevo; tu límite y tu bonus siguen intactos.',
    'tarot.draw.progressErrorBody': 'La carta se abrió, pero no se pudo guardar el progreso. Mantén esta pantalla abierta hasta terminar la lectura.',
    'tarot.draw.bonusUnavailableTitle': 'El bonus no fue consumido',
    'tarot.draw.bonusUnavailableBody': 'El saldo cambió antes de la confirmación. No se inició ninguna lectura; revisa la Tienda e inténtalo de nuevo.',
    'tarot.ritual.step': 'CARTA {current} DE {total}',
    'tarot.ritual.next': 'Ir a la carta siguiente',
    'tarot.ritual.complete': 'Las tres cartas están abiertas',
    'tarot.personal.title': 'El hilo de tu lectura',
    'tarot.personal.withQuestion': 'Trajiste “{question}” a una lectura sobre {theme}.',
    'tarot.personal.withoutQuestion': 'Elegiste mirar {theme} sin cerrar la lectura en una sola pregunta.',
    'tarot.personal.bridge': '{past} da el contexto, {present} concentra el punto de atención y {future} abre una posibilidad — no una promesa.',
    'tarot.personal.prompt.clarity': 'Para buscar claridad: ¿qué quedó más nítido al comparar el presente con el contexto anterior?',
    'tarot.personal.prompt.nextStep': 'Para encontrar un próximo paso: ¿qué gesto pequeño cabe en las próximas 24 horas sin depender de la decisión de otra persona?',
    'tarot.personal.prompt.patterns': 'Para reconocer patrones: ¿qué parece repetirse entre el contexto, el presente y la posibilidad mostrada por las cartas?',
    'tarot.personal.prompt.timing': 'Para pensar el momento: ¿qué necesita madurar todavía y qué señal concreta mostraría que es hora de actuar?',
    'tarot.personal.disclaimer': 'La pregunta aparece como contexto de la síntesis; no convierte una posibilidad en certeza ni cambia el significado de las cartas.',
    'tarot.reflection.title': '¿Qué te llevas de esta lectura?',
    'tarot.reflection.body': 'Guarda una frase tuya mientras la impresión todavía está fresca.',
    'tarot.reflection.placeholder': 'Mi nota…',
    'tarot.reflection.save': 'Guardar en el Diario',
    'tarot.reflection.saved': 'Guardado en el Diario',
    'tarot.reflection.private': 'Nota privada · no será compartida',
    'tarot.diary.question': 'Tu pregunta privada',
    'tarot.diary.reflection': 'Tu nota privada',
    'tarot.community.title': 'Lleva las cartas a la comunidad',
    'tarot.community.body': 'Comparte la tirada con quienes te siguen o abre el Feed para acompañar a los perfiles que sigues.',
    'tarot.community.privacy': 'Tu pregunta y tu nota nunca entran en la publicación.',
    'tarot.community.share': 'Compartir solo las cartas',
    'tarot.community.view': 'Ver comunidad',
    'tarot.community.login': 'Entrar para compartir',
    'tarot.community.couplePrivate': 'Las lecturas hechas en modo pareja siguen siendo privadas.',
    'tarot.community.sharing': 'Compartiendo…',
    'tarot.community.sharedTitle': 'Publicado',
    'tarot.community.sharedBody': 'Las cartas y la lectura pública ya aparecieron en el Feed. Tu pregunta y tu nota quedaron privadas.',
    'tarot.community.sharedCta': 'Cartas publicadas',
    'tarot.community.ok': 'Quedarme aquí',
    'tarot.community.errorTitle': 'No se pudo compartir',
    'tarot.community.previewTitle': 'Lo que irá al Feed',
    'tarot.community.previewBody': 'Se publicarán el tema, las cartas y la interpretación de la tirada. Tu pregunta, tus datos personales y tu nota quedan en este dispositivo.',
    'tarot.community.cancel': 'Mantener solo para mí',
    'tarot.community.publish': 'Publicar cartas',
    'tarot.community.profileTitle': 'Crea tu perfil de comunidad',
    'tarot.community.profileBody': 'Antes de tu primera publicación, elige el nombre, el @usuario y el emoji que aparecerán en el Feed.',
    'tarot.community.profileCta': 'Crear perfil',
    'tarot.community.errorBody': 'Inténtalo de nuevo en unos instantes.',
    'tarot.community.privateBodyMissing': 'Esta lectura contiene contexto privado y no tiene una versión pública segura. Seguirá solo en tu Diario.',
  },
  en: {
    'tarot.scratch.tapAlternative': 'Reveal without scratching',
    'tarot.question.eyebrow': 'OPTIONAL CONTEXT',
    'tarot.question.title': 'Would you like to bring a question to the cards?',
    'tarot.question.placeholder': 'Write your question in one sentence…',
    'tarot.question.help': 'Leave it blank if you prefer. The question guides the synthesis; the cards are still drawn at random.',
    'tarot.question.private': 'It stays on this device and never goes to the Feed.',
    'tarot.question.profileLens': 'You asked for {outcome}. I’ll use that as a lens without changing any meaning.',
    'tarot.draw.saveErrorTitle': 'The reading was not used',
    'tarot.draw.saveErrorBody': 'I could not store the cards safely on this device. Free some space and try again; your limit and bonus remain intact.',
    'tarot.draw.progressErrorBody': 'The card opened, but its progress could not be saved. Keep this screen open until you finish the reading.',
    'tarot.draw.bonusUnavailableTitle': 'The bonus was not used',
    'tarot.draw.bonusUnavailableBody': 'The balance changed before confirmation. No reading was started; check the Store and try again.',
    'tarot.ritual.step': 'CARD {current} OF {total}',
    'tarot.ritual.next': 'Go to the next card',
    'tarot.ritual.complete': 'All three cards are open',
    'tarot.personal.title': 'The thread through your reading',
    'tarot.personal.withQuestion': 'You brought “{question}” to a reading about {theme}.',
    'tarot.personal.withoutQuestion': 'You chose to look at {theme} without narrowing the reading to one question.',
    'tarot.personal.bridge': '{past} provides the context, {present} holds the point of attention, and {future} opens a possibility — not a promise.',
    'tarot.personal.prompt.clarity': 'To seek clarity: what became sharper when you compared the present with the context that came before?',
    'tarot.personal.prompt.nextStep': 'To find a next step: what small action fits in the next 24 hours without depending on someone else’s decision?',
    'tarot.personal.prompt.patterns': 'To recognize patterns: what seems to repeat across the context, the present, and the possibility shown by the cards?',
    'tarot.personal.prompt.timing': 'To think about timing: what still needs to mature, and what concrete sign would show that it is time to act?',
    'tarot.personal.disclaimer': 'The question appears as context for the synthesis; it does not turn possibility into certainty or change what the cards mean.',
    'tarot.reflection.title': 'What are you taking from this reading?',
    'tarot.reflection.body': 'Keep one sentence of your own while the impression is still fresh.',
    'tarot.reflection.placeholder': 'My note…',
    'tarot.reflection.save': 'Save to Diary',
    'tarot.reflection.saved': 'Saved to Diary',
    'tarot.reflection.private': 'Private note · it will not be shared',
    'tarot.diary.question': 'Your private question',
    'tarot.diary.reflection': 'Your private note',
    'tarot.community.title': 'Bring the cards to the community',
    'tarot.community.body': 'Share the spread with people who follow you, or open the Feed to keep up with profiles you follow.',
    'tarot.community.privacy': 'Your question and your note are never included in the post.',
    'tarot.community.share': 'Share only the cards',
    'tarot.community.view': 'View community',
    'tarot.community.login': 'Sign in to share',
    'tarot.community.couplePrivate': 'Readings made in couple mode stay private.',
    'tarot.community.sharing': 'Sharing…',
    'tarot.community.sharedTitle': 'Published',
    'tarot.community.sharedBody': 'The cards and public reading are now in the Feed. Your question and note stayed private.',
    'tarot.community.sharedCta': 'Cards published',
    'tarot.community.ok': 'Stay here',
    'tarot.community.errorTitle': 'Could not share',
    'tarot.community.previewTitle': 'What will go to the Feed',
    'tarot.community.previewBody': 'The theme, cards, and spread interpretation will be published. Your question, personal details, and note stay on this device.',
    'tarot.community.cancel': 'Keep it to myself',
    'tarot.community.publish': 'Publish cards',
    'tarot.community.profileTitle': 'Create your community profile',
    'tarot.community.profileBody': 'Before your first post, choose the name, @username, and emoji that will appear in the Feed.',
    'tarot.community.profileCta': 'Create profile',
    'tarot.community.errorBody': 'Please try again in a moment.',
    'tarot.community.privateBodyMissing': 'This reading contains private context and has no safe public version. It will remain only in your Diary.',
  },
};
Object.assign(PT, TAROT_LOTE_2_I18N.pt);
Object.assign(ES, TAROT_LOTE_2_I18N.es);
Object.assign(EN, TAROT_LOTE_2_I18N.en);

// Superfície social completa: todo o chrome da tela existente passa por estas
// chaves. Conteúdo publicado por usuários permanece no idioma em que foi
// escrito; ele não é texto de interface e não deve ser alterado pelo app.
const SOCIAL_SURFACE_I18N = {
  pt: {
    'tab.community': 'Comunidade',
    'social.header.title': 'Comunidade',
    'social.header.subtitle': 'Converse com outros leitores',
    'social.createProfile.displayNamePlaceholder': 'Nome de exibição',
    'social.createProfile.usernamePlaceholder': '@usuário (letras, números e _)',
    'social.createProfile.required': 'Preencha o nome e o @usuário.',
    'social.profile.close': 'Fechar perfil',
    'social.profile.followers_one': '{count} seguidor',
    'social.profile.followers_other': '{count} seguidores',
    'social.profile.following': '{count} seguindo',
    'social.profile.noShared': 'Nenhuma leitura compartilhada ainda.',
    'social.profile.followToSee': 'Siga essa pessoa para ver as leituras compartilhadas.',
    'social.unfollow': 'Deixar de seguir',
    'social.like': 'Curtir publicação',
    'social.unlike': 'Descurtir publicação',
    'social.comments.open': 'Abrir comentários',
    'social.comments.close': 'Fechar comentários',
    'social.comments.placeholder': 'Escreva um comentário…',
    'social.comments.send': 'Enviar comentário',
    'social.search.open': 'Procurar leitores',
    'social.search.placeholder': 'Buscar por @usuário para seguir',
    'social.empty.body': 'Seu feed está vazio. Procure leitores para seguir ou compartilhe uma leitura do seu Diário Cósmico.',
    'social.delete.title': 'Apagar publicação?',
    'social.delete.body': 'Essa ação não pode ser desfeita.',
    'social.delete.cta': 'Apagar',
    'social.error.title': 'Não foi possível concluir',
    'social.error.profileSave': 'Não foi possível criar seu perfil agora. Tente novamente.',
    'social.error.follow': 'Não foi possível atualizar esse perfil agora. Tente novamente.',
    'social.error.comment': 'Não foi possível publicar seu comentário agora. Tente novamente.',
    'social.error.deletePost': 'Não foi possível apagar a publicação agora. Tente novamente.',
    'social.time.justNow': 'agora',
    'social.time.minutes': '{count} min',
    'social.time.hours': '{count} h',
    'social.time.days': '{count} d',
    'community.room.plaza.title': 'Praça do Céu',
    'community.room.plaza.desc': 'Um espaço aberto para trocar perguntas, leituras e descobertas.',
    'community.room.mirrors.title': 'Espelhos',
    'community.room.mirrors.desc': 'O mesmo signo visto por experiências diferentes.',
    'community.room.bridges.title': 'Pontes',
    'community.room.bridges.desc': 'Conversas entre signos em sextil ou trígono por signo inteiro.',
    'community.room.sparks.title': 'Faíscas',
    'community.room.sparks.desc': 'Tensões e aprendizados entre signos em quadratura.',
    'community.room.poles.title': 'Polos',
    'community.room.poles.desc': 'Perspectivas que se encontram pela oposição.',
    'community.room.between.title': 'Entrelinhas',
    'community.room.between.desc': 'Signos sem aspecto entre si na tradição de signo inteiro.',
    'community.sign.aries': 'Áries',
    'community.sign.taurus': 'Touro',
    'community.sign.gemini': 'Gêmeos',
    'community.sign.cancer': 'Câncer',
    'community.sign.leo': 'Leão',
    'community.sign.virgo': 'Virgem',
    'community.sign.libra': 'Libra',
    'community.sign.scorpio': 'Escorpião',
    'community.sign.sagittarius': 'Sagitário',
    'community.sign.capricorn': 'Capricórnio',
    'community.sign.aquarius': 'Aquário',
    'community.sign.pisces': 'Peixes',
    'community.relation.copresenca': 'mesmo signo',
    'community.relation.alheio30': 'aversão por signo inteiro',
    'community.relation.sextil': 'sextil por signo inteiro',
    'community.relation.quadratura': 'quadratura por signo inteiro',
    'community.relation.trigono': 'trígono por signo inteiro',
    'community.relation.alheio150': 'aversão por signo inteiro',
    'community.relation.oposicao': 'oposição por signo inteiro',
  },
  es: {
    'tab.community': 'Comunidad',
    'social.header.title': 'Comunidad',
    'social.header.subtitle': 'Conversa con otros lectores',
    'social.createProfile.displayNamePlaceholder': 'Nombre visible',
    'social.createProfile.usernamePlaceholder': '@usuario (letras, números y _)',
    'social.createProfile.required': 'Completa el nombre y el @usuario.',
    'social.profile.close': 'Cerrar perfil',
    'social.profile.followers_one': '{count} seguidor',
    'social.profile.followers_other': '{count} seguidores',
    'social.profile.following': '{count} siguiendo',
    'social.profile.noShared': 'Todavía no hay lecturas compartidas.',
    'social.profile.followToSee': 'Sigue a esta persona para ver las lecturas compartidas.',
    'social.unfollow': 'Dejar de seguir',
    'social.like': 'Dar me gusta a la publicación',
    'social.unlike': 'Quitar me gusta de la publicación',
    'social.comments.open': 'Abrir comentarios',
    'social.comments.close': 'Cerrar comentarios',
    'social.comments.placeholder': 'Escribe un comentario…',
    'social.comments.send': 'Enviar comentario',
    'social.search.open': 'Buscar lectores',
    'social.search.placeholder': 'Buscar por @usuario para seguir',
    'social.empty.body': 'Tu feed está vacío. Busca lectores para seguir o comparte una lectura de tu Diario Cósmico.',
    'social.delete.title': '¿Borrar publicación?',
    'social.delete.body': 'Esta acción no se puede deshacer.',
    'social.delete.cta': 'Borrar',
    'social.error.title': 'No se pudo completar',
    'social.error.profileSave': 'No se pudo crear tu perfil ahora. Inténtalo de nuevo.',
    'social.error.follow': 'No se pudo actualizar ese perfil ahora. Inténtalo de nuevo.',
    'social.error.comment': 'No se pudo publicar tu comentario ahora. Inténtalo de nuevo.',
    'social.error.deletePost': 'No se pudo borrar la publicación ahora. Inténtalo de nuevo.',
    'social.time.justNow': 'ahora',
    'social.time.minutes': '{count} min',
    'social.time.hours': '{count} h',
    'social.time.days': '{count} d',
    'community.room.plaza.title': 'Plaza del Cielo',
    'community.room.plaza.desc': 'Un espacio abierto para compartir preguntas, lecturas y descubrimientos.',
    'community.room.mirrors.title': 'Espejos',
    'community.room.mirrors.desc': 'El mismo signo visto desde experiencias diferentes.',
    'community.room.bridges.title': 'Puentes',
    'community.room.bridges.desc': 'Conversaciones entre signos en sextil o trígono por signo entero.',
    'community.room.sparks.title': 'Chispas',
    'community.room.sparks.desc': 'Tensiones y aprendizajes entre signos en cuadratura.',
    'community.room.poles.title': 'Polos',
    'community.room.poles.desc': 'Perspectivas que se encuentran mediante la oposición.',
    'community.room.between.title': 'Entre líneas',
    'community.room.between.desc': 'Signos sin aspecto entre sí en la tradición de signo entero.',
    'community.sign.aries': 'Aries',
    'community.sign.taurus': 'Tauro',
    'community.sign.gemini': 'Géminis',
    'community.sign.cancer': 'Cáncer',
    'community.sign.leo': 'Leo',
    'community.sign.virgo': 'Virgo',
    'community.sign.libra': 'Libra',
    'community.sign.scorpio': 'Escorpio',
    'community.sign.sagittarius': 'Sagitario',
    'community.sign.capricorn': 'Capricornio',
    'community.sign.aquarius': 'Acuario',
    'community.sign.pisces': 'Piscis',
    'community.relation.copresenca': 'mismo signo',
    'community.relation.alheio30': 'aversión por signo entero',
    'community.relation.sextil': 'sextil por signo entero',
    'community.relation.quadratura': 'cuadratura por signo entero',
    'community.relation.trigono': 'trígono por signo entero',
    'community.relation.alheio150': 'aversión por signo entero',
    'community.relation.oposicao': 'oposición por signo entero',
  },
  en: {
    'tab.community': 'Community',
    'social.header.title': 'Community',
    'social.header.subtitle': 'Connect with other readers',
    'social.createProfile.displayNamePlaceholder': 'Display name',
    'social.createProfile.usernamePlaceholder': '@username (letters, numbers, and _)',
    'social.createProfile.required': 'Enter your name and @username.',
    'social.profile.close': 'Close profile',
    'social.profile.followers_one': '{count} follower',
    'social.profile.followers_other': '{count} followers',
    'social.profile.following': '{count} following',
    'social.profile.noShared': 'No shared readings yet.',
    'social.profile.followToSee': 'Follow this person to see their shared readings.',
    'social.unfollow': 'Unfollow',
    'social.like': 'Like post',
    'social.unlike': 'Unlike post',
    'social.comments.open': 'Open comments',
    'social.comments.close': 'Close comments',
    'social.comments.placeholder': 'Write a comment…',
    'social.comments.send': 'Send comment',
    'social.search.open': 'Find readers',
    'social.search.placeholder': 'Search by @username to follow',
    'social.empty.body': 'Your feed is empty. Find readers to follow or share a reading from your Cosmic Diary.',
    'social.delete.title': 'Delete post?',
    'social.delete.body': 'This action cannot be undone.',
    'social.delete.cta': 'Delete',
    'social.error.title': 'Could not complete',
    'social.error.profileSave': 'Your profile could not be created right now. Please try again.',
    'social.error.follow': 'That profile could not be updated right now. Please try again.',
    'social.error.comment': 'Your comment could not be posted right now. Please try again.',
    'social.error.deletePost': 'The post could not be deleted right now. Please try again.',
    'social.time.justNow': 'now',
    'social.time.minutes': '{count} min',
    'social.time.hours': '{count} h',
    'social.time.days': '{count} d',
    'community.room.plaza.title': 'Sky Plaza',
    'community.room.plaza.desc': 'An open space to share questions, readings, and discoveries.',
    'community.room.mirrors.title': 'Mirrors',
    'community.room.mirrors.desc': 'The same sign seen through different experiences.',
    'community.room.bridges.title': 'Bridges',
    'community.room.bridges.desc': 'Conversations between signs in whole-sign sextile or trine.',
    'community.room.sparks.title': 'Sparks',
    'community.room.sparks.desc': 'Tensions and lessons between signs in a square.',
    'community.room.poles.title': 'Poles',
    'community.room.poles.desc': 'Perspectives that meet through an opposition.',
    'community.room.between.title': 'Between the Lines',
    'community.room.between.desc': 'Signs with no aspect between them in the whole-sign tradition.',
    'community.sign.aries': 'Aries',
    'community.sign.taurus': 'Taurus',
    'community.sign.gemini': 'Gemini',
    'community.sign.cancer': 'Cancer',
    'community.sign.leo': 'Leo',
    'community.sign.virgo': 'Virgo',
    'community.sign.libra': 'Libra',
    'community.sign.scorpio': 'Scorpio',
    'community.sign.sagittarius': 'Sagittarius',
    'community.sign.capricorn': 'Capricorn',
    'community.sign.aquarius': 'Aquarius',
    'community.sign.pisces': 'Pisces',
    'community.relation.copresenca': 'same sign',
    'community.relation.alheio30': 'whole-sign aversion',
    'community.relation.sextil': 'whole-sign sextile',
    'community.relation.quadratura': 'whole-sign square',
    'community.relation.trigono': 'whole-sign trine',
    'community.relation.alheio150': 'whole-sign aversion',
    'community.relation.oposicao': 'whole-sign opposition',
  },
};
Object.assign(PT, SOCIAL_SURFACE_I18N.pt);
Object.assign(ES, SOCIAL_SURFACE_I18N.es);
Object.assign(EN, SOCIAL_SURFACE_I18N.en);

// Termos, Diretrizes da Comunidade e ciclo de vida legal do UGC. Este bloco
// sobrescreve as descrições antigas de Privacidade porque a exclusão de conta
// agora remove os dados sociais identificáveis e os bloqueios; apenas recibos
// fiscais sem vínculo, contagem antiabuso e denúncias necessárias anonimizadas
// podem permanecer.
const COMMUNITY_LEGAL_I18N = {
  pt: {
    'terms.intro': 'Estes Termos explicam as regras de uso do Cosmic Guide. Ao usar o serviço, você concorda em respeitá-las; se não concordar, não use o app nem publique na Comunidade.',
    'terms.service.title': 'Sobre o serviço',
    'terms.service.body': 'O Cosmic Guide é um app de entretenimento e reflexão pessoal baseado em tradições simbólicas, como astrologia, tarô, quiromancia, sonhos e borra de café. Conforme a experiência, o conteúdo pode ser calculado, editorial ou gerado por IA. Ele não constitui aconselhamento médico, psicológico, financeiro, jurídico ou profissional, e decisões importantes não devem depender das leituras do app.',
    'terms.account.title': 'Sua conta',
    'terms.account.body': 'Boa parte do app funciona sem conta. Uma conta é necessária para assinar, participar da Comunidade e levar o acesso a outro aparelho. Você deve fornecer dados verdadeiros, proteger sua senha e avisar o suporte se perceber uso não autorizado.',
    'terms.payments.title': 'Pagamentos e assinatura',
    'terms.community.title': 'Comunidade e conteúdo publicado',
    'terms.community.body': 'Seu perfil social, suas publicações e seus comentários podem ser vistos por outras pessoas no app. Publique somente conteúdo seu ou que você tenha autorização para compartilhar. O uso da Comunidade também segue as Diretrizes da Comunidade e está sujeito a denúncia, bloqueio e moderação. Diário, perguntas privadas, dados natais e contexto de casal não são publicados automaticamente.',
    'terms.acceptable.title': 'Uso aceitável',
    'terms.acceptable.body': 'Não publique conteúdo ilegal, ameaçador, discriminatório, sexualmente exploratório, que envolva abuso de menores, assédio, perseguição, exposição de dados pessoais, spam, golpe ou violação de direitos de terceiros. Não tente contornar limites ou segurança do serviço. Podemos remover conteúdo e restringir ou suspender contas quando isso for necessário para proteger pessoas, cumprir a lei ou aplicar estas regras.',
    'terms.deletion.title': 'Exclusão da conta',
    'terms.deletion.body': 'Em Perfil > Deletar conta, você remove o login, o vínculo da assinatura e os dados identificáveis da Comunidade, inclusive perfil, publicações, comentários, curtidas, relações de seguir e bloqueios. Denúncias necessárias à moderação podem permanecer anonimizadas; o recibo fiscal do pagamento e a contagem antiabuso das leituras grátis podem permanecer sem vínculo com a conta. Excluir a conta não cancela uma assinatura ativa: cancele antes no Google Play ou na Hotmart, conforme o local da compra.',
    'terms.contact.title': 'Fale conosco',
    'terms.contact.body': 'Dúvidas sobre estes Termos ou sobre uma decisão de moderação? Escreva para {email}.',
    'community.guidelines.header': 'Diretrizes da Comunidade',
    'community.guidelines.updated': 'Atualizado em 24 de agosto de 2026',
    'community.guidelines.intro': 'A Comunidade existe para conversas respeitosas sobre símbolos, experiências e escolhas. Estas regras valem para perfis, publicações, comentários e qualquer conteúdo compartilhado.',
    'community.guidelines.before.title': 'Antes de publicar',
    'community.guidelines.before.body': 'Outras pessoas no app podem ver o que você compartilha. Não publique perguntas privadas, Diário, dados de nascimento, contexto de casal ou informações de outra pessoa sem autorização.',
    'community.guidelines.rules.title': 'O que esperamos de cada pessoa',
    'community.guidelines.respect.title': 'Respeite pessoas, não estereótipos',
    'community.guidelines.respect.body': 'Não permitimos assédio, bullying, humilhação, ameaça, perseguição nem ataque baseado em raça, cor, origem, religião, deficiência, idade, sexo, orientação sexual, identidade de gênero ou outra característica protegida. Um signo nunca justifica atacar alguém.',
    'community.guidelines.privacy.title': 'Proteja a privacidade',
    'community.guidelines.privacy.body': 'Não exponha nome completo, contato, endereço, localização, imagens, mensagens, dados de nascimento ou identidade de outra pessoa sem autorização. Não se passe por alguém, não persiga e não incentive exposição pública de dados.',
    'community.guidelines.safety.title': 'Não coloque ninguém em risco',
    'community.guidelines.safety.body': 'São proibidos conteúdo sexual explícito, exploração sexual, qualquer conteúdo sexual envolvendo menores, incentivo a automutilação, violência ou atividade ilegal, além de ameaças reais ou instruções que facilitem dano.',
    'community.guidelines.integrity.title': 'Contribua com honestidade',
    'community.guidelines.integrity.body': 'Publique apenas conteúdo próprio ou autorizado. Não envie spam, propaganda repetitiva, golpe, phishing, malware, perfil falso ou manipulação coordenada de conversas e reações.',
    'community.guidelines.symbolic.title': 'Símbolo não é sentença',
    'community.guidelines.symbolic.body': 'Astrologia e tarô são lentes simbólicas. Não apresente uma leitura como diagnóstico, tratamento, certeza jurídica ou financeira, garantia de futuro ou veredito sobre a compatibilidade e o valor de uma pessoa.',
    'community.guidelines.moderation.title': 'Como a moderação funciona',
    'community.guidelines.reports.title': 'Denuncie e bloqueie pelo app',
    'community.guidelines.reports.body': 'Use o menu do conteúdo para denunciar uma publicação ou comentário e bloquear a pessoa. A denúncia envia o motivo e uma cópia do conteúdo para análise; o bloqueio impede que vocês vejam o conteúdo um do outro.',
    'community.guidelines.consequences.title': 'Conteúdo e contas podem ser restringidos',
    'community.guidelines.consequences.body': 'Podemos ocultar ou remover conteúdo, limitar recursos ou suspender uma conta conforme a gravidade, a repetição e o risco. Violações graves podem levar a ação imediata.',
    'community.guidelines.accountDeletion.title': 'O que acontece ao excluir a conta',
    'community.guidelines.accountDeletion.body': 'Perfil, publicações, comentários, curtidas, relações de seguir e bloqueios ligados à conta são removidos. Denúncias ainda necessárias podem permanecer anonimizadas, sem o identificador nem o conteúdo da conta excluída.',
    'community.guidelines.contact.title': 'Precisa falar com a equipe?',
    'community.guidelines.contact.body': 'Para dúvidas, revisão de moderação ou uma situação de segurança, escreva para {email}.',
    'community.guidelines.contact.cta': 'Escrever para o suporte',
    'privacy.use.social': 'Comunidade. É preciso ter conta para publicar ou comentar. Seu nome de exibição, @usuário, emoji, publicações e comentários ficam no nosso servidor e podem ser vistos por outras pessoas no app; curtidas, relações de seguir e bloqueios também ficam no servidor para a Comunidade funcionar. Ao excluir a conta, removemos o perfil social e todas as publicações, comentários, curtidas, relações de seguir e bloqueios ligados a ela.',
    'privacy.use.report': 'Denúncias e bloqueios. Ao denunciar uma resposta de IA ou algo da Comunidade, vão para o nosso servidor o motivo, uma cópia do conteúdo denunciado e os identificadores necessários para a análise. Enquanto a conta existe, a denúncia pode estar ligada a quem denunciou e a quem foi denunciado. Ao excluir a conta, os bloqueios são removidos. Denúncias ainda necessárias à moderação podem permanecer sem prazo definido, mas são anonimizadas em relação à conta excluída: saem seus identificadores, detalhes livres e qualquer cópia do conteúdo dela.',
    'privacy.contact.retention': 'Para apagar sua CONTA, vá em Perfil > Deletar conta. Isso apaga o login no Supabase, desfaz o vínculo da assinatura e remove perfil, publicações, comentários, curtidas, relações de seguir e bloqueios da Comunidade ligados a você. Denúncias necessárias podem permanecer anonimizadas, sem o vínculo com a conta excluída. O recibo do pagamento pode ser mantido por obrigação fiscal, com o e-mail da compra mas sem vínculo com a conta; a contagem antiabuso das leituras grátis permanece vinculada somente ao UUID opaco de uma conta que já não existe, sem e-mail nem perfil. O Diário Cósmico continua neste aparelho até você apagar suas entradas. O botão vermelho abaixo limpa só este aparelho.',
    'privacy.delete.message': 'Isso apaga para sempre, neste aparelho, nomes, signos, datas e horas de nascimento, cidade, escolhas do primeiro caminho, histórico da conversa com Órbi e sequência salva — e apaga no nosso servidor o histórico anônimo de passos deste aparelho e a inscrição do lembrete diário. NÃO apaga por aqui o Diário Cósmico, sua conta, o vínculo da assinatura nem perfil, conteúdo, relações e bloqueios da Comunidade. Para remover os dados ligados à conta, use Perfil > Deletar conta. Esta ação não pode ser desfeita.',
    'profile.delete.text': 'Isso apaga de vez sua conta, o login, o vínculo da assinatura e os dados identificáveis da Comunidade, além dos dados locais cobertos pela limpeza deste aparelho. O Diário permanece até você apagar suas entradas. Denúncias necessárias podem ficar anonimizadas; recibo fiscal e contagem antiabuso podem permanecer sem vínculo com a conta. A cobrança não é cancelada: cancele antes no Google Play ou na Hotmart, conforme a compra.',
    'profile.delete.finalText': 'Última confirmação. Ao tocar em “Apagar de vez”, seu login e os dados identificáveis da Comunidade são removidos e não podem ser recuperados. O Diário continua neste aparelho; denúncias anonimizadas, recibo fiscal sem vínculo e contagem antiabuso podem permanecer pelos motivos descritos em Privacidade. A assinatura precisa ser cancelada separadamente.',
    'profile.delete.partialText': 'Sua conta de login foi apagada, mas alguns dados da assinatura ou da Comunidade podem não ter saído do nosso servidor agora. Escreva para contato@cosmicguide.cloud com o e-mail que você usava para pedirmos a limpeza do que restou.',
  },
  es: {
    'terms.intro': 'Estos Términos explican las reglas de uso de Cosmic Guide. Al usar el servicio, aceptas respetarlas; si no estás de acuerdo, no uses la app ni publiques en la Comunidad.',
    'terms.service.title': 'Sobre el servicio',
    'terms.service.body': 'Cosmic Guide es una app de entretenimiento y reflexión personal basada en tradiciones simbólicas, como astrología, tarot, quiromancia, sueños y posos de café. Según la experiencia, el contenido puede ser calculado, editorial o generado por IA. No constituye asesoramiento médico, psicológico, financiero, jurídico ni profesional, y las decisiones importantes no deben depender de las lecturas de la app.',
    'terms.account.title': 'Tu cuenta',
    'terms.account.body': 'Buena parte de la app funciona sin cuenta. Hace falta una cuenta para suscribirte, participar en la Comunidad y llevar el acceso a otro dispositivo. Debes proporcionar datos verdaderos, proteger tu contraseña y avisar a soporte si detectas un uso no autorizado.',
    'terms.payments.title': 'Pagos y suscripción',
    'terms.community.title': 'Comunidad y contenido publicado',
    'terms.community.body': 'Tu perfil social, tus publicaciones y tus comentarios pueden ser vistos por otras personas en la app. Publica solo contenido propio o que tengas autorización para compartir. El uso de la Comunidad también sigue las Directrices de la Comunidad y está sujeto a reportes, bloqueos y moderación. El Diario, las preguntas privadas, los datos natales y el contexto de pareja no se publican automáticamente.',
    'terms.acceptable.title': 'Uso aceptable',
    'terms.acceptable.body': 'No publiques contenido ilegal, amenazante, discriminatorio, sexualmente explotador, que implique abuso de menores, acoso, persecución, exposición de datos personales, spam, estafa o vulneración de derechos de terceros. No intentes eludir los límites ni la seguridad del servicio. Podemos eliminar contenido y restringir o suspender cuentas cuando sea necesario para proteger a las personas, cumplir la ley o aplicar estas reglas.',
    'terms.deletion.title': 'Eliminación de la cuenta',
    'terms.deletion.body': 'En Perfil > Eliminar cuenta, eliminas el acceso, el vínculo de la suscripción y los datos identificables de la Comunidad, incluidos perfil, publicaciones, comentarios, Me gusta, relaciones de seguimiento y bloqueos. Los reportes necesarios para moderación pueden permanecer anonimizados; el comprobante fiscal del pago y el conteo antiabuso de lecturas gratis pueden permanecer sin vínculo con la cuenta. Eliminar la cuenta no cancela una suscripción activa: cancélala antes en Google Play o Hotmart, según dónde compraste.',
    'terms.contact.title': 'Contáctanos',
    'terms.contact.body': '¿Tienes dudas sobre estos Términos o sobre una decisión de moderación? Escribe a {email}.',
    'community.guidelines.header': 'Directrices de la Comunidad',
    'community.guidelines.updated': 'Actualizado el 24 de agosto de 2026',
    'community.guidelines.intro': 'La Comunidad existe para conversar con respeto sobre símbolos, experiencias y decisiones. Estas reglas se aplican a perfiles, publicaciones, comentarios y cualquier contenido compartido.',
    'community.guidelines.before.title': 'Antes de publicar',
    'community.guidelines.before.body': 'Otras personas en la app pueden ver lo que compartes. No publiques preguntas privadas, Diario, datos de nacimiento, contexto de pareja ni información de otra persona sin autorización.',
    'community.guidelines.rules.title': 'Lo que esperamos de cada persona',
    'community.guidelines.respect.title': 'Respeta a las personas, no los estereotipos',
    'community.guidelines.respect.body': 'No permitimos acoso, bullying, humillación, amenazas, persecución ni ataques por raza, color, origen, religión, discapacidad, edad, sexo, orientación sexual, identidad de género u otra característica protegida. Un signo nunca justifica atacar a alguien.',
    'community.guidelines.privacy.title': 'Protege la privacidad',
    'community.guidelines.privacy.body': 'No expongas el nombre completo, contacto, dirección, ubicación, imágenes, mensajes, datos de nacimiento o identidad de otra persona sin autorización. No suplantes a nadie, no persigas y no fomentes la exposición pública de datos.',
    'community.guidelines.safety.title': 'No pongas a nadie en riesgo',
    'community.guidelines.safety.body': 'Se prohíben el contenido sexual explícito, la explotación sexual, cualquier contenido sexual con menores, el fomento de autolesiones, violencia o actividad ilegal, además de amenazas reales o instrucciones que faciliten daños.',
    'community.guidelines.integrity.title': 'Participa con honestidad',
    'community.guidelines.integrity.body': 'Publica solo contenido propio o autorizado. No envíes spam, publicidad repetitiva, estafas, phishing, malware, perfiles falsos ni manipulación coordinada de conversaciones y reacciones.',
    'community.guidelines.symbolic.title': 'Un símbolo no es una sentencia',
    'community.guidelines.symbolic.body': 'La astrología y el tarot son lentes simbólicas. No presentes una lectura como diagnóstico, tratamiento, certeza jurídica o financiera, garantía del futuro ni veredicto sobre la compatibilidad o el valor de una persona.',
    'community.guidelines.moderation.title': 'Cómo funciona la moderación',
    'community.guidelines.reports.title': 'Reporta y bloquea desde la app',
    'community.guidelines.reports.body': 'Usa el menú del contenido para reportar una publicación o comentario y bloquear a la persona. El reporte envía el motivo y una copia del contenido para revisión; el bloqueo impide que ambos vean el contenido del otro.',
    'community.guidelines.consequences.title': 'El contenido y las cuentas pueden restringirse',
    'community.guidelines.consequences.body': 'Podemos ocultar o eliminar contenido, limitar funciones o suspender una cuenta según la gravedad, la repetición y el riesgo. Las infracciones graves pueden generar una acción inmediata.',
    'community.guidelines.accountDeletion.title': 'Qué ocurre al eliminar la cuenta',
    'community.guidelines.accountDeletion.body': 'Se eliminan el perfil, las publicaciones, los comentarios, los Me gusta, las relaciones de seguimiento y los bloqueos ligados a la cuenta. Los reportes todavía necesarios pueden permanecer anonimizados, sin el identificador ni el contenido de la cuenta eliminada.',
    'community.guidelines.contact.title': '¿Necesitas hablar con el equipo?',
    'community.guidelines.contact.body': 'Para dudas, revisión de moderación o una situación de seguridad, escribe a {email}.',
    'community.guidelines.contact.cta': 'Escribir a soporte',
    'privacy.use.social': 'Comunidad. Hace falta una cuenta para publicar o comentar. Tu nombre visible, @usuario, emoji, publicaciones y comentarios quedan en nuestro servidor y pueden ser vistos por otras personas en la app; los Me gusta, las relaciones de seguimiento y los bloqueos también quedan en el servidor para que la Comunidad funcione. Al eliminar la cuenta, quitamos el perfil social y todas las publicaciones, comentarios, Me gusta, relaciones de seguimiento y bloqueos ligados a ella.',
    'privacy.use.report': 'Reportes y bloqueos. Al reportar una respuesta de IA o algo de la Comunidad, van a nuestro servidor el motivo, una copia del contenido reportado y los identificadores necesarios para revisarlo. Mientras la cuenta existe, el reporte puede estar ligado a quien reportó y a quien fue reportado. Al eliminar la cuenta, se eliminan los bloqueos. Los reportes todavía necesarios para moderación pueden permanecer sin plazo definido, pero se anonimizan respecto de la cuenta eliminada: se quitan sus identificadores, detalles libres y cualquier copia de su contenido.',
    'privacy.contact.retention': 'Para eliminar tu CUENTA, ve a Perfil > Eliminar cuenta. Eso borra el acceso en Supabase, deshace el vínculo de la suscripción y elimina el perfil, publicaciones, comentarios, Me gusta, relaciones de seguimiento y bloqueos de la Comunidad ligados a ti. Los reportes necesarios pueden permanecer anonimizados, sin vínculo con la cuenta eliminada. El comprobante de pago puede conservarse por obligación fiscal, con el correo de compra pero sin vínculo con la cuenta; el conteo antiabuso de lecturas gratis queda vinculado solo al UUID opaco de una cuenta que ya no existe, sin correo ni perfil. El Diario Cósmico sigue en este dispositivo hasta que borres sus entradas. El botón rojo de abajo limpia solo este dispositivo.',
    'privacy.delete.message': 'Esto borra para siempre, en este dispositivo, nombres, signos, fechas y horas de nacimiento, ciudad, elecciones del primer camino, historial de la conversación con Órbi y racha guardada; y borra en nuestro servidor el historial anónimo de pasos de este dispositivo y la suscripción al recordatorio diario. NO borra por aquí el Diario Cósmico, tu cuenta, el vínculo de la suscripción ni el perfil, contenido, relaciones y bloqueos de la Comunidad. Para eliminar los datos ligados a la cuenta, usa Perfil > Eliminar cuenta. Esta acción no se puede deshacer.',
    'profile.delete.text': 'Esto elimina para siempre tu cuenta, el acceso, el vínculo de la suscripción y los datos identificables de la Comunidad, además de los datos locales cubiertos por la limpieza de este dispositivo. El Diario permanece hasta que borres sus entradas. Los reportes necesarios pueden quedar anonimizados; el comprobante fiscal y el conteo antiabuso pueden permanecer sin vínculo con la cuenta. El cobro no se cancela: cancélalo antes en Google Play o Hotmart, según la compra.',
    'profile.delete.finalText': 'Última confirmación. Al tocar “Eliminar definitivamente”, se eliminan tu acceso y los datos identificables de la Comunidad y no se pueden recuperar. El Diario sigue en este dispositivo; los reportes anonimizados, el comprobante fiscal sin vínculo y el conteo antiabuso pueden permanecer por los motivos descritos en Privacidad. La suscripción debe cancelarse por separado.',
    'profile.delete.partialText': 'Tu cuenta de acceso fue eliminada, pero puede que algunos datos de la suscripción o de la Comunidad no hayan salido ahora de nuestro servidor. Escribe a contato@cosmicguide.cloud con el correo que usabas para que solicitemos la limpieza de lo que quedó.',
  },
  en: {
    'terms.intro': 'These Terms explain the rules for using Cosmic Guide. By using the service, you agree to follow them; if you do not agree, do not use the app or post in the Community.',
    'terms.service.title': 'About the service',
    'terms.service.body': 'Cosmic Guide is an entertainment and personal-reflection app based on symbolic traditions such as astrology, tarot, palmistry, dreams, and coffee grounds. Depending on the experience, content may be calculated, editorial, or generated by AI. It is not medical, psychological, financial, legal, or other professional advice, and important decisions should not depend on app readings.',
    'terms.account.title': 'Your account',
    'terms.account.body': 'Much of the app works without an account. An account is required to subscribe, join the Community, and carry access to another device. You must provide accurate information, protect your password, and contact support if you notice unauthorized use.',
    'terms.payments.title': 'Payments and subscription',
    'terms.community.title': 'Community and published content',
    'terms.community.body': 'Your social profile, posts, and comments may be seen by other people in the app. Post only your own content or content you are authorized to share. Community use is also governed by the Community Guidelines and is subject to reporting, blocking, and moderation. Diary entries, private questions, birth details, and couple context are not published automatically.',
    'terms.acceptable.title': 'Acceptable use',
    'terms.acceptable.body': 'Do not post content that is illegal, threatening, discriminatory, sexually exploitative, involves child abuse, harassment, stalking, exposure of personal data, spam, scams, or infringement of third-party rights. Do not try to bypass service limits or security. We may remove content and restrict or suspend accounts when needed to protect people, comply with the law, or enforce these rules.',
    'terms.deletion.title': 'Account deletion',
    'terms.deletion.body': 'In Profile > Delete account, you remove the login, subscription link, and identifiable Community data, including the profile, posts, comments, likes, follow relationships, and blocks. Reports needed for moderation may remain anonymized; the tax payment receipt and anti-abuse count for free readings may remain without an account link. Deleting the account does not cancel an active subscription: cancel first through Google Play or Hotmart, depending on where you purchased it.',
    'terms.contact.title': 'Contact us',
    'terms.contact.body': 'Questions about these Terms or a moderation decision? Write to {email}.',
    'community.guidelines.header': 'Community Guidelines',
    'community.guidelines.updated': 'Updated August 24, 2026',
    'community.guidelines.intro': 'The Community exists for respectful conversations about symbols, experiences, and choices. These rules apply to profiles, posts, comments, and any shared content.',
    'community.guidelines.before.title': 'Before you post',
    'community.guidelines.before.body': 'Other people in the app may see what you share. Do not post private questions, Diary entries, birth details, couple context, or another person’s information without permission.',
    'community.guidelines.rules.title': 'What we expect from everyone',
    'community.guidelines.respect.title': 'Respect people, not stereotypes',
    'community.guidelines.respect.body': 'We do not allow harassment, bullying, humiliation, threats, stalking, or attacks based on race, color, origin, religion, disability, age, sex, sexual orientation, gender identity, or another protected characteristic. A sign never justifies attacking someone.',
    'community.guidelines.privacy.title': 'Protect privacy',
    'community.guidelines.privacy.body': 'Do not expose another person’s full name, contact details, address, location, images, messages, birth details, or identity without permission. Do not impersonate, stalk, or encourage the public exposure of personal data.',
    'community.guidelines.safety.title': 'Do not put anyone at risk',
    'community.guidelines.safety.body': 'Explicit sexual content, sexual exploitation, any sexual content involving minors, encouragement of self-harm, violence, or illegal activity, as well as credible threats or instructions that enable harm, are prohibited.',
    'community.guidelines.integrity.title': 'Contribute honestly',
    'community.guidelines.integrity.body': 'Post only content you own or are authorized to share. Do not send spam, repetitive advertising, scams, phishing, malware, fake profiles, or coordinated manipulation of conversations and reactions.',
    'community.guidelines.symbolic.title': 'A symbol is not a sentence',
    'community.guidelines.symbolic.body': 'Astrology and tarot are symbolic lenses. Do not present a reading as a diagnosis, treatment, legal or financial certainty, guarantee of the future, or verdict on a person’s compatibility or worth.',
    'community.guidelines.moderation.title': 'How moderation works',
    'community.guidelines.reports.title': 'Report and block in the app',
    'community.guidelines.reports.body': 'Use the content menu to report a post or comment and block the person. A report sends the reason and a copy of the content for review; blocking prevents each of you from seeing the other’s content.',
    'community.guidelines.consequences.title': 'Content and accounts may be restricted',
    'community.guidelines.consequences.body': 'We may hide or remove content, limit features, or suspend an account based on severity, repetition, and risk. Serious violations may lead to immediate action.',
    'community.guidelines.accountDeletion.title': 'What happens when you delete your account',
    'community.guidelines.accountDeletion.body': 'The profile, posts, comments, likes, follow relationships, and blocks linked to the account are removed. Reports that are still needed may remain anonymized, without the deleted account’s identifier or content.',
    'community.guidelines.contact.title': 'Need to contact the team?',
    'community.guidelines.contact.body': 'For questions, moderation review, or a safety concern, write to {email}.',
    'community.guidelines.contact.cta': 'Email support',
    'privacy.use.social': 'Community. An account is required to post or comment. Your display name, @handle, emoji, posts, and comments stay on our server and may be seen by other people in the app; likes, follow relationships, and blocks also stay on the server so the Community can work. When you delete the account, we remove the social profile and every post, comment, like, follow relationship, and block linked to it.',
    'privacy.use.report': 'Reports and blocks. When you report an AI response or something in the Community, our server receives the reason, a copy of the reported content, and the identifiers needed for review. While the account exists, the report may be linked to the reporter and the reported person. When you delete the account, blocks are removed. Reports still needed for moderation may remain with no defined expiry, but they are anonymized in relation to the deleted account: its identifiers, free-form details, and any copy of its content are removed.',
    'privacy.contact.retention': 'To delete your ACCOUNT, go to Profile > Delete account. This erases the Supabase login, unlinks the subscription, and removes the Community profile, posts, comments, likes, follow relationships, and blocks linked to you. Reports that are still needed may remain anonymized, with no link to the deleted account. The payment receipt may be retained for tax obligations, with the purchase email but no account link; the anti-abuse count for free readings remains tied only to the opaque UUID of an account that no longer exists, with no email or profile. The Cosmic Diary stays on this device until you delete its entries. The red button below wipes only this device.',
    'privacy.delete.message': 'This permanently erases, on this device, names, signs, birth dates and times, city, first-path choices, Órbi conversation history, and the saved streak; and it erases from our server this device’s anonymous step history and daily reminder subscription. It does NOT erase the Cosmic Diary, your account, the subscription link, or the Community profile, content, relationships, and blocks here. To remove data linked to the account, use Profile > Delete account. This action cannot be undone.',
    'profile.delete.text': 'This permanently deletes your account, login, subscription link, and identifiable Community data, along with the local data covered by this device wipe. The Diary remains until you delete its entries. Reports that are still needed may remain anonymized; the tax receipt and anti-abuse count may remain without an account link. Billing is not cancelled: cancel first through Google Play or Hotmart, depending on the purchase.',
    'profile.delete.finalText': 'Last confirmation. Tapping “Delete permanently” removes your login and identifiable Community data, and they cannot be recovered. The Diary stays on this device; anonymized reports, an unlinked tax receipt, and the anti-abuse count may remain for the reasons described in Privacy. The subscription must be cancelled separately.',
    'profile.delete.partialText': 'Your login account was deleted, but some subscription or Community data may not have left our server just now. Write to contato@cosmicguide.cloud from the email you used so we can request cleanup of what remains.',
  },
};
Object.assign(PT, COMMUNITY_LEGAL_I18N.pt);
Object.assign(ES, COMMUNITY_LEGAL_I18N.es);
Object.assign(EN, COMMUNITY_LEGAL_I18N.en);

// Textos do Hub da Comunidade. As três versões mantêm o mesmo contrato:
// descoberta por signos solares, consentimento mínimo e nenhuma promessa de
// compatibilidade, sinastria ou previsão.
const COMMUNITY_HUB_I18N = {
  pt: {
    'community.header.title': 'Comunidade',
    'community.header.subtitle': 'Conversas reais, afinidade simbólica',
    'community.discovery.eyebrow': 'CONVERSAS ENTRE SIGNOS',
    'community.discovery.title': 'Encontre novas perspectivas no céu de outras pessoas',
    'community.discovery.body': 'Entre na Praça do Céu ou explore conversas organizadas pela relação simbólica entre signos solares.',
    'community.discovery.signature': 'Seu signo sugere. A conversa revela.',
    'community.discovery.roomsTitle': 'Escolha uma sala',
    'community.discovery.roomsHint': 'Seis espaços compartilhados, sem placar nem promessa de compatibilidade.',
    'community.discovery.conversationsTitle': 'Combinações para explorar',
    'community.discovery.conversationsHint': 'Uma lente simbólica para começar a conversa — não um veredito.',
    'community.discovery.noSignTitle': 'Mostre seu signo para receber sugestões pessoais',
    'community.discovery.noSignBody': 'As salas continuam abertas. Se quiser sugestões, escolha apenas o signo que deseja exibir.',
    'community.discovery.following': 'Quem eu sigo',
    'community.discovery.compose': 'Iniciar conversa',
    'community.discovery.loading': 'Carregando a Comunidade',
    'community.discovery.emptyTitle': 'Seja a primeira voz desta conversa',
    'community.discovery.emptyBody': 'Ainda não há conteúdo real aqui. Abra uma pergunta com respeito e intenção.',
    'community.discovery.emptyCta': 'Iniciar a primeira conversa',
    'community.signConsent.title': 'Seu signo pode orientar a descoberta',
    'community.signConsent.body': 'Se você escolher mostrar seu signo, dos seus dados astrológicos enviamos ao servidor somente o signo selecionado para organizar salas e sugestões.',
    'community.signConsent.privacy': 'Esta escolha nunca envia para a Comunidade sua data, hora ou cidade de nascimento, nem dados do seu parceiro. Você pode ocultar o signo quando quiser.',
    'community.signConsent.choose': 'Escolher meu signo',
    'community.signConsent.save': 'Salvar e mostrar',
    'community.signConsent.hide': 'Ocultar meu signo',
    'community.signConsent.notNow': 'Agora não',
    'community.targetSign.title': 'Com qual signo você quer conversar?',
    'community.targetSign.body': 'Escolha um signo para ver a relação simbólica e a sala correspondente.',
    'community.targetSign.choose': 'Escolher signo',
    'community.room.open': 'Abrir sala',
    'community.composer.title': 'Iniciar uma conversa',
    'community.composer.body': 'Faça uma pergunta ou compartilhe uma experiência que possa abrir uma conversa respeitosa.',
    'community.composer.titlePlaceholder': 'Título da conversa',
    'community.composer.bodyPlaceholder': 'O que você quer compartilhar ou perguntar?',
    'community.composer.commentPlaceholder': 'Escreva um comentário respeitoso',
    'community.composer.publish': 'Publicar conversa',
    'community.composer.cancel': 'Cancelar',
    'community.guidelines.accept.title': 'Antes da primeira conversa',
    'community.guidelines.accept.body': 'Para publicar, leia e aceite as Diretrizes da Comunidade. Elas protegem pessoas, privacidade e conversas honestas.',
    'community.guidelines.accept.checkbox': 'Li e aceito as Diretrizes da Comunidade',
    'community.guidelines.accept.cta': 'Aceitar e continuar',
    'community.guidelines.accept.open': 'Ler Diretrizes',
    'community.success.conversationPublished': 'Sua conversa foi publicada.',
    'community.success.postDeleted': 'A conversa foi apagada.',
    'community.success.commentDeleted': 'Comentário apagado.',
    'community.success.signSaved': 'Seu signo agora pode orientar as sugestões.',
    'community.success.signHidden': 'Seu signo foi ocultado da Comunidade.',
    'community.success.guidelinesAccepted': 'Diretrizes aceitas. Você já pode conversar.',
    'community.error.title': 'Não foi possível concluir',
    'community.error.generic': 'Tente novamente em alguns instantes.',
    'community.error.deleteComment': 'Não foi possível apagar o comentário agora. Tente novamente.',
    'community.error.retry': 'Tentar novamente',
    'community.error.community_guidelines_required': 'Aceite as Diretrizes da Comunidade antes de publicar.',
    'community.error.community_public_sign_required': 'Escolha um signo público para abrir esta combinação. Você pode ocultá-lo depois.',
    'community.error.community_room_mismatch': 'Essa combinação pertence a outra sala. Atualize a seleção e tente novamente.',
    'community.error.community_suspended': 'Sua participação na Comunidade está suspensa. Você ainda pode usar as outras áreas do app.',
    'community.comment.delete': 'Apagar comentário',
    'community.comment.deleteTitle': 'Apagar este comentário?',
    'community.comment.deleteBody': 'O comentário será removido da conversa. Esta ação não pode ser desfeita.',
    'community.comment.deleteConfirm': 'Apagar',
    'community.relation.label': 'Conversa entre {signA} e {signB}',
    'community.relation.disclaimer': 'Seu signo sugere a sala. A conversa decide o encontro. Esta é uma relação simbólica entre signos solares, não uma sinastria nem uma previsão de relacionamento.',
  },
  es: {
    'community.header.title': 'Comunidad',
    'community.header.subtitle': 'Conversaciones reales, afinidad simbólica',
    'community.discovery.eyebrow': 'CONVERSACIONES ENTRE SIGNOS',
    'community.discovery.title': 'Encuentra nuevas perspectivas en el cielo de otras personas',
    'community.discovery.body': 'Entra en la Plaza del Cielo o explora conversaciones organizadas por la relación simbólica entre signos solares.',
    'community.discovery.signature': 'Tu signo sugiere. La conversación revela.',
    'community.discovery.roomsTitle': 'Elige una sala',
    'community.discovery.roomsHint': 'Seis espacios compartidos, sin puntuaciones ni promesas de compatibilidad.',
    'community.discovery.conversationsTitle': 'Combinaciones para explorar',
    'community.discovery.conversationsHint': 'Una lente simbólica para iniciar la conversación, no un veredicto.',
    'community.discovery.noSignTitle': 'Muestra tu signo para recibir sugerencias personales',
    'community.discovery.noSignBody': 'Las salas siguen abiertas. Si quieres sugerencias, elige solo el signo que deseas mostrar.',
    'community.discovery.following': 'A quién sigo',
    'community.discovery.compose': 'Iniciar conversación',
    'community.discovery.loading': 'Cargando la Comunidad',
    'community.discovery.emptyTitle': 'Sé la primera voz de esta conversación',
    'community.discovery.emptyBody': 'Todavía no hay contenido real aquí. Abre una pregunta con respeto e intención.',
    'community.discovery.emptyCta': 'Iniciar la primera conversación',
    'community.signConsent.title': 'Tu signo puede orientar el descubrimiento',
    'community.signConsent.body': 'Si eliges mostrar tu signo, de tus datos astrológicos enviamos al servidor únicamente el signo seleccionado para organizar salas y sugerencias.',
    'community.signConsent.privacy': 'Esta elección nunca envía a la Comunidad tu fecha, hora o ciudad de nacimiento ni los datos de tu pareja. Puedes ocultar el signo cuando quieras.',
    'community.signConsent.choose': 'Elegir mi signo',
    'community.signConsent.save': 'Guardar y mostrar',
    'community.signConsent.hide': 'Ocultar mi signo',
    'community.signConsent.notNow': 'Ahora no',
    'community.targetSign.title': '¿Con qué signo quieres conversar?',
    'community.targetSign.body': 'Elige un signo para ver la relación simbólica y la sala correspondiente.',
    'community.targetSign.choose': 'Elegir signo',
    'community.room.open': 'Abrir sala',
    'community.composer.title': 'Iniciar una conversación',
    'community.composer.body': 'Haz una pregunta o comparte una experiencia que pueda abrir una conversación respetuosa.',
    'community.composer.titlePlaceholder': 'Título de la conversación',
    'community.composer.bodyPlaceholder': '¿Qué quieres compartir o preguntar?',
    'community.composer.commentPlaceholder': 'Escribe un comentario respetuoso',
    'community.composer.publish': 'Publicar conversación',
    'community.composer.cancel': 'Cancelar',
    'community.guidelines.accept.title': 'Antes de la primera conversación',
    'community.guidelines.accept.body': 'Para publicar, lee y acepta las Directrices de la Comunidad. Protegen a las personas, la privacidad y las conversaciones honestas.',
    'community.guidelines.accept.checkbox': 'He leído y acepto las Directrices de la Comunidad',
    'community.guidelines.accept.cta': 'Aceptar y continuar',
    'community.guidelines.accept.open': 'Leer Directrices',
    'community.success.conversationPublished': 'Tu conversación fue publicada.',
    'community.success.postDeleted': 'La conversación fue eliminada.',
    'community.success.commentDeleted': 'Comentario eliminado.',
    'community.success.signSaved': 'Tu signo ya puede orientar las sugerencias.',
    'community.success.signHidden': 'Tu signo fue ocultado de la Comunidad.',
    'community.success.guidelinesAccepted': 'Directrices aceptadas. Ya puedes conversar.',
    'community.error.title': 'No se pudo completar',
    'community.error.generic': 'Inténtalo de nuevo en unos instantes.',
    'community.error.deleteComment': 'No se pudo eliminar el comentario ahora. Inténtalo de nuevo.',
    'community.error.retry': 'Intentar de nuevo',
    'community.error.community_guidelines_required': 'Acepta las Directrices de la Comunidad antes de publicar.',
    'community.error.community_public_sign_required': 'Elige un signo público para abrir esta combinación. Puedes ocultarlo después.',
    'community.error.community_room_mismatch': 'Esta combinación pertenece a otra sala. Actualiza la selección e inténtalo de nuevo.',
    'community.error.community_suspended': 'Tu participación en la Comunidad está suspendida. Aún puedes usar las demás áreas de la app.',
    'community.comment.delete': 'Eliminar comentario',
    'community.comment.deleteTitle': '¿Eliminar este comentario?',
    'community.comment.deleteBody': 'El comentario se quitará de la conversación. Esta acción no se puede deshacer.',
    'community.comment.deleteConfirm': 'Eliminar',
    'community.relation.label': 'Conversación entre {signA} y {signB}',
    'community.relation.disclaimer': 'Tu signo sugiere la sala. La conversación decide el encuentro. Esta es una relación simbólica entre signos solares, no una sinastría ni una predicción de la relación.',
  },
  en: {
    'community.header.title': 'Community',
    'community.header.subtitle': 'Real conversations, symbolic affinity',
    'community.discovery.eyebrow': 'CONVERSATIONS BETWEEN SIGNS',
    'community.discovery.title': 'Find new perspectives in other people’s skies',
    'community.discovery.body': 'Enter the Sky Plaza or explore conversations organized by the symbolic relationship between Sun signs.',
    'community.discovery.signature': 'Your sign suggests. Conversation reveals.',
    'community.discovery.roomsTitle': 'Choose a room',
    'community.discovery.roomsHint': 'Six shared spaces, with no score or promise of compatibility.',
    'community.discovery.conversationsTitle': 'Combinations to explore',
    'community.discovery.conversationsHint': 'A symbolic lens for starting a conversation—not a verdict.',
    'community.discovery.noSignTitle': 'Show your sign to receive personal suggestions',
    'community.discovery.noSignBody': 'The rooms remain open. If you want suggestions, choose only the sign you wish to display.',
    'community.discovery.following': 'People I follow',
    'community.discovery.compose': 'Start a conversation',
    'community.discovery.loading': 'Loading the Community',
    'community.discovery.emptyTitle': 'Be the first voice in this conversation',
    'community.discovery.emptyBody': 'There is no real content here yet. Open a question with respect and intention.',
    'community.discovery.emptyCta': 'Start the first conversation',
    'community.signConsent.title': 'Your sign can guide discovery',
    'community.signConsent.body': 'If you choose to show your sign, the only astrological data we send to the server is the selected sign, used to organize rooms and suggestions.',
    'community.signConsent.privacy': 'This choice never sends your birth date, time, or city—or your partner’s data—to the Community. You can hide your sign whenever you wish.',
    'community.signConsent.choose': 'Choose my sign',
    'community.signConsent.save': 'Save and show',
    'community.signConsent.hide': 'Hide my sign',
    'community.signConsent.notNow': 'Not now',
    'community.targetSign.title': 'Which sign would you like to talk with?',
    'community.targetSign.body': 'Choose a sign to see the symbolic relationship and its corresponding room.',
    'community.targetSign.choose': 'Choose a sign',
    'community.room.open': 'Open room',
    'community.composer.title': 'Start a conversation',
    'community.composer.body': 'Ask a question or share an experience that can open a respectful conversation.',
    'community.composer.titlePlaceholder': 'Conversation title',
    'community.composer.bodyPlaceholder': 'What would you like to share or ask?',
    'community.composer.commentPlaceholder': 'Write a respectful comment',
    'community.composer.publish': 'Publish conversation',
    'community.composer.cancel': 'Cancel',
    'community.guidelines.accept.title': 'Before your first conversation',
    'community.guidelines.accept.body': 'To publish, read and accept the Community Guidelines. They protect people, privacy, and honest conversations.',
    'community.guidelines.accept.checkbox': 'I have read and accept the Community Guidelines',
    'community.guidelines.accept.cta': 'Accept and continue',
    'community.guidelines.accept.open': 'Read Guidelines',
    'community.success.conversationPublished': 'Your conversation was published.',
    'community.success.postDeleted': 'The conversation was deleted.',
    'community.success.commentDeleted': 'Comment deleted.',
    'community.success.signSaved': 'Your sign can now guide suggestions.',
    'community.success.signHidden': 'Your sign was hidden from the Community.',
    'community.success.guidelinesAccepted': 'Guidelines accepted. You can now join the conversation.',
    'community.error.title': 'Could not complete the action',
    'community.error.generic': 'Please try again in a moment.',
    'community.error.deleteComment': 'The comment could not be deleted right now. Please try again.',
    'community.error.retry': 'Try again',
    'community.error.community_guidelines_required': 'Accept the Community Guidelines before publishing.',
    'community.error.community_public_sign_required': 'Choose a public sign to open this combination. You can hide it later.',
    'community.error.community_room_mismatch': 'This combination belongs in another room. Update your selection and try again.',
    'community.error.community_suspended': 'Your Community participation is suspended. You can still use the other areas of the app.',
    'community.comment.delete': 'Delete comment',
    'community.comment.deleteTitle': 'Delete this comment?',
    'community.comment.deleteBody': 'The comment will be removed from the conversation. This action cannot be undone.',
    'community.comment.deleteConfirm': 'Delete',
    'community.relation.label': 'Conversation between {signA} and {signB}',
    'community.relation.disclaimer': 'Your sign suggests the room. The conversation shapes the encounter. This is a symbolic relationship between Sun signs, not synastry or a relationship prediction.',
  },
};
Object.assign(PT, COMMUNITY_HUB_I18N.pt);
Object.assign(ES, COMMUNITY_HUB_I18N.es);
Object.assign(EN, COMMUNITY_HUB_I18N.en);

// ---- Alinhe seu céu · entrada editorial da Home -------------------------
// As quatro chaves home.alignment.* descrevem somente a porta editorial da
// Home. alignment.* cobre o chrome da tela própria, inclusive gesto e recibo.
const SKY_ALIGNMENT_I18N = {
  pt: {
    'home.alignment.title': 'Alinhe seu céu',
    'home.alignment.instruction': 'Arraste o céu de agora sobre o seu mapa.',
    'home.alignment.body': 'Um dado seu. Um gesto. Um encontro calculado — com a conta na tela.',
    'home.alignment.cta': 'Entrar no alinhamento',
    'alignment.header.title': 'Alinhe seu céu',
    'alignment.header.subtitle': 'Um encontro calculado, com a conta na tela',
    'alignment.eyebrow': 'UM DADO SEU · UM GESTO',
    'alignment.title': 'Arraste o céu de agora sobre o seu mapa.',
    'alignment.body': 'O gesto revela um encontro entre o céu de hoje e o seu mapa. Não escolhe nem muda o céu.',
    'alignment.signature': 'Um dado seu. Um gesto. Um encontro calculado — com a conta na tela.',
    'alignment.differentiation': 'Tarô raspa. Cosmic Guide alinha.',
    'alignment.disk.natal': 'Meu mapa',
    'alignment.disk.current': 'Céu de agora',
    'alignment.instruction': 'Aproxime os centros até o encaixe.',
    'alignment.manual': 'Alinhar por mim',
    'alignment.aligned': 'Céus alinhados',
    'alignment.status.idle': 'Arraste o disco do céu até o seu mapa.',
    'alignment.status.dragging': 'Continue aproximando os dois centros.',
    'alignment.status.magnetic': 'Encaixe encontrado. Solte para alinhar.',
    'alignment.dragA11y': 'Céu de agora, disco móvel',
    'alignment.dragHint': 'Arraste até o centro do seu mapa ou use Alinhar por mim.',
    'alignment.live': 'Céus alinhados. O resultado calculado foi revelado.',
    'alignment.loading': 'Calculando o céu de agora…',
    'alignment.missing.title': 'Falta um mapa para alinhar',
    'alignment.missing.body': 'Precisamos da sua data de nascimento para comparar o céu de agora com o seu mapa. Sem ela, não mostramos um encontro inventado.',
    'alignment.missing.cta': 'Preencher meu Mapa Astral',
    'alignment.error.title': 'O céu não pôde ser calculado agora',
    'alignment.error.body': 'Nenhum resultado foi improvisado. Tente novamente em instantes.',
    'alignment.error.retry': 'Tentar de novo',
    'alignment.result.eyebrow': 'ENCONTRO CALCULADO',
    'alignment.noAspect.title': 'Hoje não há encontro dentro do alcance',
    'alignment.noAspect.body': 'Nenhum planeta do céu de agora está perto o bastante de um ponto do seu mapa para formar um dos cinco ângulos usados nesta leitura.',
    'alignment.nextEvent.eyebrow': 'PRÓXIMO EVENTO REAL DO CÉU',
    'alignment.nextEvent.date': 'Em {date}',
    'alignment.receipt.title': 'Recibo Cósmico',
    'alignment.receipt.data': 'Dado usado',
    'alignment.receipt.calculation': 'Como foi calculado',
    'alignment.receipt.aspect': 'Aspecto',
    'alignment.receipt.orb': 'Orbe',
    'alignment.receipt.source': 'Fonte',
    'alignment.receipt.limit': 'Limite',
    'alignment.receipt.dataExact': 'Nascimento: {birthDate}, {birthTime}, {city}. Céu usado: {skyDate}.',
    'alignment.receipt.dataFixedOffset': 'Nascimento: {birthDate}, {birthTime}. Offset UTC guardado: {offset}. Céu usado: {skyDate}.',
    'alignment.receipt.dataDateOnly': 'Nascimento: {birthDate}, usando apenas a data (aproximação ao meio-dia). Céu usado: {skyDate}.',
    'alignment.receipt.calculationValue': '{transit} de agora × {natal} de nascimento · {aspect} de {angle}°',
    'alignment.receipt.eventCalculationValue': 'Efeméride coletiva: {event} · {date}.',
    'alignment.receipt.orbValue': 'Orbe medido: {orb}°. Limite aplicado: {limit}°.',
    'alignment.receipt.sourceValue': 'Aspectos e fases: Ptolomeu e Vétio Valente, séc. II. O limite numérico de orbe é convenção moderna do Cosmic Guide; Lilly é comparação histórica, não a fonte deste número.',
    'alignment.receipt.limitValue': 'O gesto apenas revelou um cálculo de posições. Ele não leu energia, não escolheu este encontro e não prevê que um acontecimento ocorrerá.',
    'alignment.receipt.orbConventionShort': 'O limite de orbe aplicado é uma convenção moderna do app, não um número atribuído às fontes antigas.',
    'alignment.receipt.sourcesShow': 'Ver base completa e convenção do orbe',
    'alignment.receipt.sourcesHide': 'Ocultar base completa',
    'alignment.receipt.warningDateOnly': 'Ao usar apenas a data, as posições natais são aproximadas para o meio-dia; Ascendente e casas ficam fora do cálculo.',
    'alignment.receipt.warningFixedOffset': 'Este cadastro antigo guarda um offset fixo, não o histórico completo do fuso. O horário informado foi usado como aproximação; confirme a cidade no mapa natal para uma conta verificável.',
    'alignment.receipt.warningNoLocation': 'Cidade de nascimento não informada. Este resultado não usa Ascendente nem casas.',
    'alignment.action.diary': 'Abrir o Diário',
    'alignment.action.calendar': 'Abrir o Calendário Cósmico',
    'alignment.action.map': 'Ver meu Mapa Astral',
  },
  es: {
    'home.alignment.title': 'Alinea tu cielo',
    'home.alignment.instruction': 'Arrastra el cielo de ahora sobre tu carta.',
    'home.alignment.body': 'Un dato tuyo. Un gesto. Un encuentro calculado — con la cuenta a la vista.',
    'home.alignment.cta': 'Entrar en la alineación',
    'alignment.header.title': 'Alinea tu cielo',
    'alignment.header.subtitle': 'Un encuentro calculado, con la cuenta a la vista',
    'alignment.eyebrow': 'UN DATO TUYO · UN GESTO',
    'alignment.title': 'Arrastra el cielo de ahora sobre tu carta.',
    'alignment.body': 'El gesto revela un encuentro entre el cielo de hoy y tu carta. No elige ni cambia el cielo.',
    'alignment.signature': 'Un dato tuyo. Un gesto. Un encuentro calculado — con la cuenta a la vista.',
    'alignment.differentiation': 'El tarot se raspa. Cosmic Guide alinea.',
    'alignment.disk.natal': 'Mi carta',
    'alignment.disk.current': 'Cielo de ahora',
    'alignment.instruction': 'Acerca los centros hasta que encajen.',
    'alignment.manual': 'Alinear por mí',
    'alignment.aligned': 'Cielos alineados',
    'alignment.status.idle': 'Arrastra el disco del cielo hasta tu carta.',
    'alignment.status.dragging': 'Sigue acercando los dos centros.',
    'alignment.status.magnetic': 'Encaje encontrado. Suelta para alinear.',
    'alignment.dragA11y': 'Cielo de ahora, disco móvil',
    'alignment.dragHint': 'Arrástralo hasta el centro de tu carta o usa Alinear por mí.',
    'alignment.live': 'Cielos alineados. Se reveló el resultado calculado.',
    'alignment.loading': 'Calculando el cielo de ahora…',
    'alignment.missing.title': 'Falta una carta para alinear',
    'alignment.missing.body': 'Necesitamos tu fecha de nacimiento para comparar el cielo de ahora con tu carta. Sin ella, no mostramos un encuentro inventado.',
    'alignment.missing.cta': 'Completar mi Carta Astral',
    'alignment.error.title': 'No se pudo calcular el cielo ahora',
    'alignment.error.body': 'No improvisamos ningún resultado. Inténtalo de nuevo en unos instantes.',
    'alignment.error.retry': 'Intentar de nuevo',
    'alignment.result.eyebrow': 'ENCUENTRO CALCULADO',
    'alignment.noAspect.title': 'Hoy no hay un encuentro dentro del alcance',
    'alignment.noAspect.body': 'Ningún planeta del cielo de ahora está lo bastante cerca de un punto de tu carta para formar uno de los cinco ángulos usados en esta lectura.',
    'alignment.nextEvent.eyebrow': 'PRÓXIMO EVENTO REAL DEL CIELO',
    'alignment.nextEvent.date': 'El {date}',
    'alignment.receipt.title': 'Recibo Cósmico',
    'alignment.receipt.data': 'Dato usado',
    'alignment.receipt.calculation': 'Cómo se calculó',
    'alignment.receipt.aspect': 'Aspecto',
    'alignment.receipt.orb': 'Orbe',
    'alignment.receipt.source': 'Fuente',
    'alignment.receipt.limit': 'Límite',
    'alignment.receipt.dataExact': 'Nacimiento: {birthDate}, {birthTime}, {city}. Cielo usado: {skyDate}.',
    'alignment.receipt.dataFixedOffset': 'Nacimiento: {birthDate}, {birthTime}. Desfase UTC guardado: {offset}. Cielo usado: {skyDate}.',
    'alignment.receipt.dataDateOnly': 'Nacimiento: {birthDate}, usando solo la fecha (aproximación al mediodía). Cielo usado: {skyDate}.',
    'alignment.receipt.calculationValue': '{transit} de ahora × {natal} de nacimiento · {aspect} de {angle}°',
    'alignment.receipt.eventCalculationValue': 'Efeméride colectiva: {event} · {date}.',
    'alignment.receipt.orbValue': 'Orbe medido: {orb}°. Límite aplicado: {limit}°.',
    'alignment.receipt.sourceValue': 'Aspectos y fases: Ptolomeo y Vetio Valente, s. II. El límite numérico del orbe es una convención moderna de Cosmic Guide; Lilly es una comparación histórica, no la fuente de este número.',
    'alignment.receipt.limitValue': 'El gesto solo reveló un cálculo de posiciones. No leyó energía, no eligió este encuentro ni predice que ocurrirá un acontecimiento.',
    'alignment.receipt.orbConventionShort': 'El límite de orbe aplicado es una convención moderna de la app, no un número atribuido a las fuentes antiguas.',
    'alignment.receipt.sourcesShow': 'Ver la base completa y la convención del orbe',
    'alignment.receipt.sourcesHide': 'Ocultar la base completa',
    'alignment.receipt.warningDateOnly': 'Al usar solo la fecha, las posiciones natales se aproximan al mediodía; el Ascendente y las casas quedan fuera del cálculo.',
    'alignment.receipt.warningFixedOffset': 'Este registro antiguo guarda un desfase fijo, no el historial completo de la zona horaria. La hora indicada se usó como aproximación; confirma la ciudad en la carta natal para un cálculo verificable.',
    'alignment.receipt.warningNoLocation': 'No indicaste la ciudad de nacimiento. Este resultado no usa Ascendente ni casas.',
    'alignment.action.diary': 'Abrir el Diario',
    'alignment.action.calendar': 'Abrir el Calendario Cósmico',
    'alignment.action.map': 'Ver mi Carta Astral',
  },
  en: {
    'home.alignment.title': 'Align your sky',
    'home.alignment.instruction': 'Drag the sky now over your chart.',
    'home.alignment.body': 'One of your data points. One gesture. One calculated encounter — with the calculation on screen.',
    'home.alignment.cta': 'Begin alignment',
    'alignment.header.title': 'Align your sky',
    'alignment.header.subtitle': 'One calculated encounter, with the calculation on screen',
    'alignment.eyebrow': 'ONE PERSONAL DATA POINT · ONE GESTURE',
    'alignment.title': 'Drag the sky now over your chart.',
    'alignment.body': 'The gesture reveals an encounter between today’s sky and your chart. It does not choose or change the sky.',
    'alignment.signature': 'One personal data point. One gesture. One calculated encounter — with the calculation on screen.',
    'alignment.differentiation': 'Tarot scratches. Cosmic Guide aligns.',
    'alignment.disk.natal': 'My chart',
    'alignment.disk.current': 'Sky now',
    'alignment.instruction': 'Bring the centers together until they lock.',
    'alignment.manual': 'Align for me',
    'alignment.aligned': 'Skies aligned',
    'alignment.status.idle': 'Drag the sky disc toward your chart.',
    'alignment.status.dragging': 'Keep bringing the two centers together.',
    'alignment.status.magnetic': 'Lock found. Release to align.',
    'alignment.dragA11y': 'Sky now, movable disc',
    'alignment.dragHint': 'Drag it to the center of your chart or use Align for me.',
    'alignment.live': 'Skies aligned. The calculated result has been revealed.',
    'alignment.loading': 'Calculating the sky now…',
    'alignment.missing.title': 'A chart is needed to align',
    'alignment.missing.body': 'We need your birth date to compare the sky now with your chart. Without it, we do not show an invented encounter.',
    'alignment.missing.cta': 'Complete my Birth Chart',
    'alignment.error.title': 'The sky could not be calculated right now',
    'alignment.error.body': 'No result was improvised. Please try again in a moment.',
    'alignment.error.retry': 'Try again',
    'alignment.result.eyebrow': 'CALCULATED ENCOUNTER',
    'alignment.noAspect.title': 'There is no encounter within range today',
    'alignment.noAspect.body': 'No planet in the sky now is close enough to a point in your chart to form one of the five angles used in this reading.',
    'alignment.nextEvent.eyebrow': 'NEXT REAL SKY EVENT',
    'alignment.nextEvent.date': 'On {date}',
    'alignment.receipt.title': 'Cosmic Receipt',
    'alignment.receipt.data': 'Data used',
    'alignment.receipt.calculation': 'How it was calculated',
    'alignment.receipt.aspect': 'Aspect',
    'alignment.receipt.orb': 'Orb',
    'alignment.receipt.source': 'Source',
    'alignment.receipt.limit': 'Limit',
    'alignment.receipt.dataExact': 'Birth: {birthDate}, {birthTime}, {city}. Sky used: {skyDate}.',
    'alignment.receipt.dataFixedOffset': 'Birth: {birthDate}, {birthTime}. Saved UTC offset: {offset}. Sky used: {skyDate}.',
    'alignment.receipt.dataDateOnly': 'Birth: {birthDate}, using the date only (midday approximation). Sky used: {skyDate}.',
    'alignment.receipt.calculationValue': '{transit} now × natal {natal} · {angle}° {aspect}',
    'alignment.receipt.eventCalculationValue': 'Collective ephemeris: {event} · {date}.',
    'alignment.receipt.orbValue': 'Measured orb: {orb}°. Applied limit: {limit}°.',
    'alignment.receipt.sourceValue': 'Aspects and phases: Ptolemy and Vettius Valens, 2nd c. The numeric orb limit is Cosmic Guide’s modern convention; Lilly is a historical comparison, not the source of this number.',
    'alignment.receipt.limitValue': 'The gesture only revealed a position calculation. It did not read energy, choose this encounter, or predict that an event will occur.',
    'alignment.receipt.orbConventionShort': 'The applied orb limit is the app’s modern convention, not a number attributed to the ancient sources.',
    'alignment.receipt.sourcesShow': 'View full sources and orb convention',
    'alignment.receipt.sourcesHide': 'Hide full sources',
    'alignment.receipt.warningDateOnly': 'When only the date is used, natal positions are approximated to midday; the Ascendant and houses stay outside the calculation.',
    'alignment.receipt.warningFixedOffset': 'This older profile stores a fixed offset, not the timezone’s full historical record. The reported time was used as an approximation; confirm the city in your birth chart for a verifiable calculation.',
    'alignment.receipt.warningNoLocation': 'No birth city was provided. This result does not use the Ascendant or houses.',
    'alignment.action.diary': 'Open the Diary',
    'alignment.action.calendar': 'Open the Cosmic Calendar',
    'alignment.action.map': 'View my Birth Chart',
  },
};
Object.assign(PT, SKY_ALIGNMENT_I18N.pt);
Object.assign(ES, SKY_ALIGNMENT_I18N.es);
Object.assign(EN, SKY_ALIGNMENT_I18N.en);

// ---- Tarô · guia personalizado e revelação carta a carta ---------------
// O conteúdo dos 15 caminhos, 12 lentes solares e duas estruturas mora nos
// packs puros tarotRitualGuide.*. Aqui fica apenas o chrome visível da tela.
const TAROT_LOTE_B_I18N = {
  pt: {
    'tarot.guide.eyebrow': 'ÓRBI · ANTES DAS CARTAS',
    'tarot.guide.title': 'Dê nome ao que pede clareza.',
    'tarot.guide.body': 'Eu não decido por você. São poucas escolhas, e cada uma muda a pergunta, a estrutura ou o caminho desta leitura.',
    'tarot.guide.focusTitle': 'O que você quer compreender agora?',
    'tarot.guide.signLens': 'LENTE DE {sign}',
    'tarot.guide.spreadTitle': 'Como você quer olhar para isso?',
    'tarot.guide.questionLabel': 'PERGUNTA DESTA LEITURA',
    'tarot.guide.questionEdit': 'Editar',
    'tarot.guide.questionDone': 'Concluir',
    'tarot.guide.loading': 'Preparando sua leitura…',
    'tarot.ritual.interpretation': 'O QUE ESTA CARTA COLOCA EM FOCO',
    'tarot.scratch.revealed': '{card} revelada. A interpretação individual está logo abaixo.',
    'tarot.personal.bridge.timeline': '{first} mostra a origem; {second}, o agora; {third}, uma possibilidade — não uma promessa.',
    'tarot.personal.bridge.situation': '{first} descreve a situação; {second}, a tensão; {third}, um próximo passo possível.',
  },
  es: {
    'tarot.guide.eyebrow': 'ÓRBI · ANTES DE LAS CARTAS',
    'tarot.guide.title': 'Ponle nombre a lo que pide claridad.',
    'tarot.guide.body': 'No decido por ti. Son pocas elecciones, y cada una cambia la pregunta, la estructura o el camino de esta lectura.',
    'tarot.guide.focusTitle': '¿Qué quieres comprender ahora?',
    'tarot.guide.signLens': 'LENTE DE {sign}',
    'tarot.guide.spreadTitle': '¿Cómo quieres mirar esto?',
    'tarot.guide.questionLabel': 'PREGUNTA DE ESTA LECTURA',
    'tarot.guide.questionEdit': 'Editar',
    'tarot.guide.questionDone': 'Listo',
    'tarot.guide.loading': 'Preparando tu lectura…',
    'tarot.ritual.interpretation': 'LO QUE ESTA CARTA PONE EN FOCO',
    'tarot.scratch.revealed': '{card} revelada. La interpretación individual está justo debajo.',
    'tarot.personal.bridge.timeline': '{first} muestra el origen; {second}, el ahora; {third}, una posibilidad, no una promesa.',
    'tarot.personal.bridge.situation': '{first} describe la situación; {second}, la tensión; {third}, un siguiente paso posible.',
  },
  en: {
    'tarot.guide.eyebrow': 'ÓRBI · BEFORE THE CARDS',
    'tarot.guide.title': 'Name what is asking for clarity.',
    'tarot.guide.body': 'I do not decide for you. There are only a few choices, and each one changes the question, structure, or path of this reading.',
    'tarot.guide.focusTitle': 'What would you like to understand now?',
    'tarot.guide.signLens': '{sign} LENS',
    'tarot.guide.spreadTitle': 'How would you like to look at this?',
    'tarot.guide.questionLabel': 'QUESTION FOR THIS READING',
    'tarot.guide.questionEdit': 'Edit',
    'tarot.guide.questionDone': 'Done',
    'tarot.guide.loading': 'Preparing your reading…',
    'tarot.ritual.interpretation': 'WHAT THIS CARD BRINGS INTO FOCUS',
    'tarot.scratch.revealed': '{card} revealed. Its individual interpretation is directly below.',
    'tarot.personal.bridge.timeline': '{first} shows the origin; {second}, the present; {third}, a possibility — not a promise.',
    'tarot.personal.bridge.situation': '{first} describes the situation; {second}, the tension; {third}, one possible next step.',
  },
};
Object.assign(PT, TAROT_LOTE_B_I18N.pt);
Object.assign(ES, TAROT_LOTE_B_I18N.es);
Object.assign(EN, TAROT_LOTE_B_I18N.en);
