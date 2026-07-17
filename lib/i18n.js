// lib/i18n.js
// Dicionário de tradução PT/ES — escopo inicial: telas Home e Quiz (as duas de
// maior tráfego pra quem chega pelo funil web em espanhol, ver
// context/LanguageContext.js pra detecção/persistência do idioma).
//
// NÃO cobre ainda: os textos de conteúdo astrológico gerados por lib/signs.js
// (compatibility(), MOON_NEED, etc.) nem o restante das ~20 telas do app —
// ficam em português mesmo com o app em "es", até uma próxima fase traduzir
// o resto. Documentado como gap conhecido, não esquecimento.
//
// Uso: t('home.greetingCouple', { voce, amor }) — {chave} dentro do template
// vira interpolação simples via replace.

export const LANGUAGES = ['pt', 'es'];
export const DEFAULT_LANGUAGE = 'pt';

const PT = {
  'home.greetingCouple': 'Olá, {voce} & {amor}',
  'home.greetingSolo': 'Olá, {sign}',
  'home.compatPercent': '{pct}% de compatibilidade',
  'home.compatSeeMore': 'Ver compatibilidade completa',
  'home.compatTitleEmpty': 'Compatibilidade do casal',
  'home.compatSubtitleEmpty': 'Ainda não calculada',
  'home.compatTextEmpty': 'Convide seu par para descobrir a compatibilidade entre os signos de vocês e acompanhar a sequência diária.',
  'home.compatLinkEmpty': 'Convidar meu par',
  'home.sectionExplore': 'Explore o cosmos',
  'home.sectionCosmicEvent': 'Evento cósmico',
  'home.cosmicEventTitle': '{planetA} em {aspect} com {planetB}',
  'home.cosmicEventTitleEmpty': 'Nenhum aspecto maior em orbe estreito hoje',
  'home.cosmicEventDesc': 'Aspecto real do céu de hoje, calculado pela posição exata dos planetas (orbe de {orb}°).',
  'home.cosmicEventDescEmpty': 'Os planetas clássicos estão sem aspectos maiores em orbe estreito no céu de hoje.',
  'home.cosmicEventDate': 'Hoje · {date}',

  'home.card.horoscope.title': 'Horóscopo', 'home.card.horoscope.subtitle': 'Previsão diária',
  'home.card.birthchart.title': 'Mapa Astral', 'home.card.birthchart.subtitle': 'Sol, Lua e Asc.',
  'home.card.tarot.title': 'Tarô por Tema', 'home.card.tarot.subtitle': 'Passado · Futuro',
  'home.card.compatibility.title': 'Compatibilidade', 'home.card.compatibility.subtitle': 'Match celestial',
  'home.card.timeline.title': 'Linha do Tempo', 'home.card.timeline.subtitle': 'Memórias do casal',
  'home.card.reconectar.title': 'Reconectar', 'home.card.reconectar.subtitle': 'Fortaleça o vínculo',
  'home.card.descobrir.title': 'Descobrir', 'home.card.descobrir.subtitle': 'Conheçam-se mais',
  'home.card.agir.title': 'Agir', 'home.card.agir.subtitle': 'Pequenos gestos',
  'home.card.progresso.title': 'Progresso', 'home.card.progresso.subtitle': 'Sequência e conquistas',
  'home.card.retrospectiva.title': 'Retrospectiva', 'home.card.retrospectiva.subtitle': 'O ano de vocês',
  'home.card.dream.title': 'Sonhos', 'home.card.dream.subtitle': 'Interprete já',
  'home.card.lunarCalendar.title': 'Calendário Lunar', 'home.card.lunarCalendar.subtitle': 'Fase da Lua hoje',
  'home.card.palm.title': 'Leitura de Palma', 'home.card.palm.subtitle': 'Sua mão revela',
  'home.card.coffee.title': 'Ritual do Café', 'home.card.coffee.subtitle': 'Borra mística',
  'home.card.chat.title': 'Chat Espiritual', 'home.card.chat.subtitle': 'Conselho rápido',

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
};

const ES = {
  'home.greetingCouple': 'Hola, {voce} & {amor}',
  'home.greetingSolo': 'Hola, {sign}',
  'home.compatPercent': '{pct}% de compatibilidad',
  'home.compatSeeMore': 'Ver compatibilidad completa',
  'home.compatTitleEmpty': 'Compatibilidad de pareja',
  'home.compatSubtitleEmpty': 'Aún no calculada',
  'home.compatTextEmpty': 'Invita a tu pareja para descubrir la compatibilidad entre sus signos y seguir la racha diaria.',
  'home.compatLinkEmpty': 'Invitar a mi pareja',
  'home.sectionExplore': 'Explora el cosmos',
  'home.sectionCosmicEvent': 'Evento cósmico',
  'home.cosmicEventTitle': '{planetA} en {aspect} con {planetB}',
  'home.cosmicEventTitleEmpty': 'Ningún aspecto mayor en orbe estrecho hoy',
  'home.cosmicEventDesc': 'Aspecto real del cielo de hoy, calculado por la posición exacta de los planetas (orbe de {orb}°).',
  'home.cosmicEventDescEmpty': 'Los planetas clásicos no tienen aspectos mayores en orbe estrecho en el cielo de hoy.',
  'home.cosmicEventDate': 'Hoy · {date}',

  'home.card.horoscope.title': 'Horóscopo', 'home.card.horoscope.subtitle': 'Predicción diaria',
  'home.card.birthchart.title': 'Carta Astral', 'home.card.birthchart.subtitle': 'Sol, Luna y Asc.',
  'home.card.tarot.title': 'Tarot por Tema', 'home.card.tarot.subtitle': 'Pasado · Futuro',
  'home.card.compatibility.title': 'Compatibilidad', 'home.card.compatibility.subtitle': 'Match celestial',
  'home.card.timeline.title': 'Línea de Tiempo', 'home.card.timeline.subtitle': 'Recuerdos de pareja',
  'home.card.reconectar.title': 'Reconectar', 'home.card.reconectar.subtitle': 'Fortalezcan el vínculo',
  'home.card.descobrir.title': 'Descubrir', 'home.card.descobrir.subtitle': 'Conózcanse más',
  'home.card.agir.title': 'Actuar', 'home.card.agir.subtitle': 'Pequeños gestos',
  'home.card.progresso.title': 'Progreso', 'home.card.progresso.subtitle': 'Racha y logros',
  'home.card.retrospectiva.title': 'Retrospectiva', 'home.card.retrospectiva.subtitle': 'El año de ustedes',
  'home.card.dream.title': 'Sueños', 'home.card.dream.subtitle': 'Interpreta ya',
  'home.card.lunarCalendar.title': 'Calendario Lunar', 'home.card.lunarCalendar.subtitle': 'Fase lunar de hoy',
  'home.card.palm.title': 'Lectura de Palma', 'home.card.palm.subtitle': 'Tu mano revela',
  'home.card.coffee.title': 'Ritual del Café', 'home.card.coffee.subtitle': 'Borra mística',
  'home.card.chat.title': 'Chat Espiritual', 'home.card.chat.subtitle': 'Consejo rápido',

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
};

const DICTS = { pt: PT, es: ES };

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
