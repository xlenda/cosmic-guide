// Fonte unica dos textos de loja do Cosmic Guide.
//
// Este arquivo e CommonJS de proposito: os testes e os geradores de assets
// rodam direto no Node, sem depender do Babel/Expo. O app em producao nao
// importa este modulo.

const STORE_LOCALES = ['pt-BR', 'es-419', 'en-US'];
const APP_STORE_LOCALE_BY_LISTING = Object.freeze({
  'pt-BR': 'pt-BR',
  'es-419': 'es-MX',
  'en-US': 'en-US',
});

const listings = {
  'pt-BR': {
    language: 'Português (Brasil)',
    googlePlay: {
      title: 'Cosmic Guide: Mapa Astral',
      shortDescription: 'Tarô para raspar, horóscopo diário, compatibilidade e astrologia com fontes.',
      fullDescription: `Arraste o céu de agora sobre o seu mapa natal e revele um aspecto calculado — com orbe, fonte e limite na tela.

No Cosmic Guide, o céu é calculado; as leituras são símbolos para reflexão, não previsões do futuro.

ALINHE SEU CÉU

Sobreponha o céu atual ao seu mapa astral com um gesto. Quando os discos se alinham, o app mostra um aspecto real, a margem usada no cálculo e a fonte. Você vê de onde a leitura veio — e também o que ela não pode afirmar.

MAPA ASTRAL E HORÓSCOPO

Calcule Sol, Lua, Ascendente, casas e aspectos a partir da sua data, hora e cidade de nascimento. Se faltar um dado, a parte que depende dele fica indisponível em vez de ser inventada. Acompanhe também o horóscopo diário, a fase da Lua e eventos do céu.

TARÔ PARA RASPAR

Escolha um tema e uma pergunta. Raspe três cartas grandes, uma por vez, e leia cada posição antes de seguir. O baralho tem 78 cartas, normais e invertidas, com tiragens por Amor, Carreira, Dinheiro, Energia e Saúde. Seus encontros ficam no Álbum do Tarô para você reconhecer repetições e favoritos.

COMPATIBILIDADE SEM VEREDITOS

Compare dois signos em cinco áreas da vida. A leitura explica encontros, tensões e caminhos de conversa sem reduzir a relação a uma porcentagem ou chamar uma combinação de destino.

SEU REGISTRO, NO SEU RITMO

Guarde reflexões no Diário Cósmico deste aparelho, reveja tiragens no álbum e compartilhe apenas o que escolher. Na Comunidade, as salas por signo exigem login, regras aceitas e oferecem denúncia e bloqueio.

MAIS PARA EXPLORAR

Calendário lunar, jornadas guiadas, rituais, mitos com fontes, papel de parede do céu, leituras simbólicas por foto e outras experiências ficam organizadas no Explorar. O app está disponível em português, espanhol e inglês.

TRANSPARÊNCIA

Recursos gerados por inteligência artificial são identificados. Algumas leituras e repetições podem exigir acesso Premium; o limite aparece antes da ação. Fotos usadas em leituras passam pelos serviços informados na Política de Privacidade.

Cosmic Guide é uma experiência de entretenimento e reflexão simbólica. Não oferece diagnóstico nem aconselhamento médico, jurídico ou financeiro e não prevê o futuro.`,
    },
    appStore: {
      name: 'Cosmic Guide: Mapa Astral',
      subtitle: 'Tarô, signos e horóscopo',
      promotionalText: 'Raspe uma tiragem por tema, alinhe o céu de hoje ao seu mapa e veja o cálculo por trás da leitura — sem transformar símbolos em certezas.',
      keywords: 'ascendente,lua,compatibilidade,sinastria,natal,casas,planetas,efemerides,transitos,fases,calendario',
      description: null,
    },
    featureGraphic: {
      eyebrow: 'ASTROLOGIA COM MÉTODO VISÍVEL',
      headline: 'Seu céu, calculado de verdade',
      subheadline: 'Mapa astral, tarô e horóscopo com fontes e limites na tela.',
    },
    screenshots: [
      {
        slug: '01-ceu-calculado',
        eyebrow: 'ALINHE SEU CÉU',
        headline: 'Seu céu, calculado de verdade',
        altText: 'Tela Alinhe seu céu com os discos natal e atual sobrepostos e um aspecto calculado.',
        scene: 'alignment-stage',
      },
      {
        slug: '02-recibo-cosmico',
        eyebrow: 'RECIBO CÓSMICO',
        headline: 'Veja o aspecto, o orbe e a fonte',
        altText: 'Recibo Cósmico mostrando data, cálculo, aspecto, orbe, fonte e limite da leitura.',
        scene: 'alignment-receipt',
      },
      {
        slug: '03-taro-raspar',
        eyebrow: 'TARÔ POR TEMA',
        headline: 'Raspe 3 cartas. Leia uma por vez',
        altText: 'Tiragem de tarô com uma carta grande sendo revelada pelo gesto de raspar.',
        scene: 'tarot-scratch',
      },
      {
        slug: '04-album-taro',
        eyebrow: 'SEUS PADRÕES',
        headline: '78 cartas. Seu álbum. Seus encontros',
        altText: 'Álbum do Tarô com cartas encontradas, busca, filtros e favoritos.',
        scene: 'tarot-album',
      },
      {
        slug: '05-mapa-astral',
        eyebrow: 'MAPA ASTRAL',
        headline: 'Sol, Lua e Ascendente no seu mapa',
        altText: 'Mapa astral preenchido com Sol, Lua, Ascendente, casas e aspectos.',
        scene: 'birth-chart',
      },
      {
        slug: '06-compatibilidade',
        eyebrow: 'A DOIS',
        headline: 'Compare dois signos sem vereditos',
        altText: 'Compatibilidade entre dois signos com leitura por áreas, sem nota ou porcentagem.',
        scene: 'compatibility',
      },
      {
        slug: '07-horoscopo',
        eyebrow: 'CÉU DE HOJE',
        headline: 'Veja como seu horóscopo é calculado',
        altText: 'Horóscopo diário com blocos de leitura e a opção de abrir o método usado.',
        scene: 'horoscope',
      },
      {
        slug: '08-explorar',
        eyebrow: 'TUDO NO LUGAR',
        headline: 'Escolha pelo que faz sentido agora',
        altText: 'Tela Explorar com leituras e práticas organizadas em seções simples.',
        scene: 'explore',
      },
    ],
  },

  'es-419': {
    language: 'Español (Latinoamérica)',
    googlePlay: {
      title: 'Cosmic Guide: Carta Astral',
      shortDescription: 'Tarot para raspar, horóscopo diario, compatibilidad y astrología con fuentes.',
      fullDescription: `Arrastra el cielo actual sobre tu carta natal y revela un aspecto calculado, con orbe, fuente y límites en pantalla.

En Cosmic Guide, el cielo se calcula; las lecturas son símbolos para reflexionar, no predicciones del futuro.

ALINEA TU CIELO

Superpone el cielo actual a tu carta astral con un gesto. Cuando los discos se alinean, la app muestra un aspecto real, el margen usado en el cálculo y la fuente. Puedes ver de dónde sale la lectura y también lo que no puede afirmar.

CARTA ASTRAL Y HORÓSCOPO

Calcula Sol, Luna, Ascendente, casas y aspectos a partir de tu fecha, hora y ciudad de nacimiento. Si falta un dato, la parte que depende de él queda no disponible en lugar de inventarse. Sigue también el horóscopo diario, la fase lunar y los eventos del cielo.

TAROT PARA RASPAR

Elige un tema y una pregunta. Raspa tres cartas grandes, una por una, y lee cada posición antes de continuar. La baraja incluye 78 cartas, al derecho e invertidas, con tiradas para Amor, Carrera, Dinero, Energía y Bienestar. Tus encuentros quedan en el Álbum del Tarot para reconocer repeticiones y favoritos.

COMPATIBILIDAD SIN VEREDICTOS

Compara dos signos en cinco áreas de la vida. La lectura explica encuentros, tensiones y caminos de conversación sin reducir la relación a un porcentaje ni llamar destino a una combinación.

TU REGISTRO, A TU RITMO

Guarda reflexiones en el Diario Cósmico de este dispositivo, revisa tiradas en el álbum y comparte solo lo que elijas. En la Comunidad, las salas por signo requieren iniciar sesión, aceptar las reglas y ofrecen denuncia y bloqueo.

MÁS PARA EXPLORAR

Calendario lunar, recorridos guiados, rituales, mitos con fuentes, fondo de pantalla del cielo, lecturas simbólicas por foto y otras experiencias están organizadas en Explorar. La app está disponible en español, portugués e inglés.

TRANSPARENCIA

Las funciones generadas por inteligencia artificial están identificadas. Algunas lecturas y repeticiones pueden requerir acceso Premium; el límite aparece antes de la acción. Las fotos usadas en lecturas pasan por los servicios indicados en la Política de Privacidad.

Cosmic Guide es una experiencia de entretenimiento y reflexión simbólica. No ofrece diagnósticos ni asesoramiento médico, jurídico o financiero y no predice el futuro.`,
    },
    appStore: {
      name: 'Cosmic Guide: Carta Astral',
      subtitle: 'Tarot, signos y horóscopo',
      promotionalText: 'Raspa una tirada por tema, alinea el cielo de hoy con tu carta y mira el cálculo detrás de la lectura, sin convertir símbolos en certezas.',
      keywords: 'ascendente,luna,compatibilidad,sinastria,natal,casas,planetas,efemerides,transitos,fases,calendario',
      description: null,
    },
    featureGraphic: {
      eyebrow: 'ASTROLOGÍA CON MÉTODO VISIBLE',
      headline: 'Tu cielo, calculado de verdad',
      subheadline: 'Carta astral, tarot y horóscopo con fuentes y límites en pantalla.',
    },
    screenshots: [
      {
        slug: '01-cielo-calculado',
        eyebrow: 'ALINEA TU CIELO',
        headline: 'Tu cielo, calculado de verdad',
        altText: 'Pantalla Alinea tu cielo con los discos natal y actual superpuestos y un aspecto calculado.',
        scene: 'alignment-stage',
      },
      {
        slug: '02-recibo-cosmico',
        eyebrow: 'RECIBO CÓSMICO',
        headline: 'Mira el aspecto, el orbe y la fuente',
        altText: 'Recibo Cósmico con fecha, cálculo, aspecto, orbe, fuente y límite de la lectura.',
        scene: 'alignment-receipt',
      },
      {
        slug: '03-tarot-raspar',
        eyebrow: 'TAROT POR TEMA',
        headline: 'Raspa 3 cartas. Lee una por una',
        altText: 'Tirada de tarot con una carta grande que se revela con el gesto de raspar.',
        scene: 'tarot-scratch',
      },
      {
        slug: '04-album-tarot',
        eyebrow: 'TUS PATRONES',
        headline: '78 cartas. Tu álbum. Tus encuentros',
        altText: 'Álbum del Tarot con cartas encontradas, búsqueda, filtros y favoritas.',
        scene: 'tarot-album',
      },
      {
        slug: '05-carta-astral',
        eyebrow: 'CARTA ASTRAL',
        headline: 'Sol, Luna y Ascendente en tu carta',
        altText: 'Carta astral completa con Sol, Luna, Ascendente, casas y aspectos.',
        scene: 'birth-chart',
      },
      {
        slug: '06-compatibilidad',
        eyebrow: 'DE A DOS',
        headline: 'Compara dos signos sin veredictos',
        altText: 'Compatibilidad entre dos signos por áreas, sin puntaje ni porcentaje.',
        scene: 'compatibility',
      },
      {
        slug: '07-horoscopo',
        eyebrow: 'CIELO DE HOY',
        headline: 'Mira cómo se calcula tu horóscopo',
        altText: 'Horóscopo diario con bloques de lectura y la opción de abrir el método usado.',
        scene: 'horoscope',
      },
      {
        slug: '08-explorar',
        eyebrow: 'TODO EN SU LUGAR',
        headline: 'Elige lo que tiene sentido ahora',
        altText: 'Pantalla Explorar con lecturas y prácticas organizadas en secciones simples.',
        scene: 'explore',
      },
    ],
  },

  'en-US': {
    language: 'English (United States)',
    googlePlay: {
      title: 'Cosmic Guide: Birth Chart',
      shortDescription: 'Scratch tarot, daily horoscope, compatibility and astrology with sources.',
      fullDescription: `Drag the current sky over your birth chart and reveal a calculated aspect, with the orb, source and limits on screen.

Cosmic Guide calculates the sky and presents readings as symbols for reflection—not predictions of the future.

ALIGN YOUR SKY

Overlay the current sky on your natal chart with one gesture. When the discs align, the app shows a real aspect, the margin used in the calculation and the source. You can see where the reading came from—and what it cannot claim.

BIRTH CHART & HOROSCOPE

Calculate your Sun, Moon, Rising sign, houses and aspects from your birth date, time and city. If a detail is missing, anything that depends on it stays unavailable instead of being made up. Follow your daily horoscope, the Moon phase and current sky events too.

SCRATCH-REVEAL TAROT

Choose a theme and a question. Scratch three large cards, one at a time, and read each position before moving on. The deck has 78 upright and reversed cards, with readings for Love, Career, Money, Energy and Well-being. Your draws stay in the Tarot Album so you can notice repeats and favorites.

COMPATIBILITY WITHOUT VERDICTS

Compare two zodiac signs across five areas of life. The reading explains harmony, tension and possible conversations without reducing a relationship to a percentage or calling a pairing destiny.

YOUR RECORD, AT YOUR PACE

Save reflections in the Cosmic Journal on this device, revisit draws in the album and share only what you choose. Community sign rooms require sign-in and accepted rules, and include reporting and blocking.

MORE TO EXPLORE

Moon calendar, guided journeys, rituals, sourced myths, a sky wallpaper, symbolic photo readings and other experiences are organized in Explore. The app is available in English, Portuguese and Spanish.

TRANSPARENCY

AI-generated features are labeled. Some readings and repeats may require Premium access; the limit appears before the action. Photos used for readings pass through the services named in the Privacy Policy.

Cosmic Guide is an entertainment and symbolic-reflection experience. It does not diagnose, provide medical, legal or financial advice, or predict the future.`,
    },
    appStore: {
      name: 'Cosmic Guide: Birth Chart',
      subtitle: 'Tarot, zodiac & horoscope',
      promotionalText: 'Scratch a themed spread, align today’s sky with your chart and see the calculation behind the reading—without turning symbols into certainty.',
      keywords: 'astrology,moon,compatibility,synastry,ascendant,star signs,planets,ephemeris,transit,calendar,phase',
      description: null,
    },
    featureGraphic: {
      eyebrow: 'ASTROLOGY WITH A VISIBLE METHOD',
      headline: 'Your sky, actually calculated',
      subheadline: 'Birth chart, tarot and horoscope with sources and limits on screen.',
    },
    screenshots: [
      {
        slug: '01-calculated-sky',
        eyebrow: 'ALIGN YOUR SKY',
        headline: 'Your sky, actually calculated',
        altText: 'Align Your Sky screen with natal and current discs overlaid and a calculated aspect.',
        scene: 'alignment-stage',
      },
      {
        slug: '02-cosmic-receipt',
        eyebrow: 'COSMIC RECEIPT',
        headline: 'See the aspect, orb and source',
        altText: 'Cosmic Receipt showing date, calculation, aspect, orb, source and reading limit.',
        scene: 'alignment-receipt',
      },
      {
        slug: '03-scratch-tarot',
        eyebrow: 'THEMED TAROT',
        headline: 'Scratch 3 cards. Read one at a time',
        altText: 'Tarot spread with one large card being revealed by the scratch gesture.',
        scene: 'tarot-scratch',
      },
      {
        slug: '04-tarot-album',
        eyebrow: 'YOUR PATTERNS',
        headline: '78 cards. Your album. Your encounters',
        altText: 'Tarot Album with encountered cards, search, filters and favorites.',
        scene: 'tarot-album',
      },
      {
        slug: '05-birth-chart',
        eyebrow: 'BIRTH CHART',
        headline: 'Sun, Moon and Rising in your chart',
        altText: 'Completed birth chart with Sun, Moon, Rising sign, houses and aspects.',
        scene: 'birth-chart',
      },
      {
        slug: '06-compatibility',
        eyebrow: 'TOGETHER',
        headline: 'Compare two signs—without verdicts',
        altText: 'Compatibility between two zodiac signs by area, without a score or percentage.',
        scene: 'compatibility',
      },
      {
        slug: '07-horoscope',
        eyebrow: 'TODAY’S SKY',
        headline: 'See how your horoscope is built',
        altText: 'Daily horoscope with reading sections and an option to open the method used.',
        scene: 'horoscope',
      },
      {
        slug: '08-explore',
        eyebrow: 'EVERYTHING IN PLACE',
        headline: 'Choose what makes sense right now',
        altText: 'Explore screen with readings and practices organized into simple sections.',
        scene: 'explore',
      },
    ],
  },
};

for (const locale of STORE_LOCALES) {
  listings[locale].appStore.description = listings[locale].googlePlay.fullDescription;
}

const shared = {
  appId: 'cloud.cosmicguide.app',
  googlePlayCategory: 'Lifestyle',
  appStorePrimaryCategory: 'Lifestyle',
  appStoreSecondaryCategory: 'Entertainment',
  privacyPolicyUrl: 'https://cosmicguide.cloud/privacidade',
  accountDeletionUrl: 'https://cosmicguide.cloud/excluir-conta',
  // A App Store exige uma pagina de suporte com contato real. A caixa atual
  // ainda nao recebe; null impede o pacote de fingir que o requisito esta pronto.
  supportUrl: null,
};

module.exports = { APP_STORE_LOCALE_BY_LISTING, STORE_LOCALES, listings, shared };
