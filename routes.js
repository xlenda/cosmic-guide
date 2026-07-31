// Nomes de rota centralizados (tabs + stacks) — evita strings soltas espalhadas
// por App.js e pelas telas. Os valores são os mesmos nomes já usados antes (não
// mudam o deep-linking nem o estado de navegação salvo), só ficam num único lugar.
export const ROUTES = {
  HOME_TAB: 'Início',
  TAROT_TAB: 'Tarô',
  CHAT_TAB: 'Chat',
  PROFILE_TAB: 'Perfil',

  ONBOARDING_CHOICE: 'OnboardingChoice',

  HOME_MAIN: 'HomeMain',
  HOROSCOPE: 'Horoscope',
  BIRTH_CHART: 'BirthChart',
  DREAM: 'Dream',
  PALM: 'Palm',
  LUNAR_CALENDAR: 'LunarCalendar',
  // Calendário Cósmico — a grade do mês com as datas reais do céu (lua exata,
  // ingresso do Sol, retrógrado, aspecto exato). É a casa das "Temporadas do
  // Céu" que saíram da Home em 31/07/2026.
  CALENDARIO_COSMICO: 'CalendarioCosmico',
  ZODIAC_BODY: 'ZodiacBody',
  GROUNDING: 'Grounding',
  RITUAIS: 'Rituais',
  // A Jornada Guiada (trilhas de 7 dias, lib/jornada.js). Mora no HomeStack
  // como as outras telas de conteúdo — as ações do dia levam pra features que
  // já existem, e o Tarô é a única que fica em outra aba.
  JORNADA: 'Jornada',
  COFFEE: 'Coffee',
  COMPATIBILITY: 'Compatibility',
  QUIZ: 'Quiz',
  TIMELINE: 'Timeline',
  RECONECTAR: 'Reconectar',
  DESCOBRIR: 'Descobrir',
  AGIR: 'Agir',
  PROGRESSO: 'Progresso',
  RETROSPECTIVA: 'Retrospectiva',
  PLANOS: 'Planos',
  LOGIN: 'Login',

  TAROT_MAIN: 'TarotMain',
  TAROT_ALBUM: 'TarotAlbum',
  MONTHLY_WRAPPED: 'MonthlyWrapped',

  PROFILE_MAIN: 'ProfileMain',
  PRIVACY: 'Privacy',
  DIARY: 'Diary',
  TOKENS: 'Tokens',
  LOJA: 'Loja',
  HELP_SUPPORT: 'HelpSupport',
  TERMS: 'Terms',
  REPORTS: 'Reports',
  SOCIAL: 'Social',
};
