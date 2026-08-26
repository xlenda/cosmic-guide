// Nomes de rota centralizados (tabs + stacks) — evita strings soltas espalhadas
// por App.js e pelas telas. Os valores são os mesmos nomes já usados antes (não
// mudam o deep-linking nem o estado de navegação salvo), só ficam num único lugar.
export const ROUTES = {
  HOME_TAB: 'Início',
  TAROT_TAB: 'Tarô',
  COMMUNITY_TAB: 'Comunidade',
  CHAT_TAB: 'Chat',
  PROFILE_TAB: 'Perfil',

  ONBOARDING_CHOICE: 'OnboardingChoice',

  HOME_MAIN: 'HomeMain',
  EXPLORE: 'Explore',
  HOROSCOPE: 'Horoscope',
  BIRTH_CHART: 'BirthChart',
  SKY_ALIGNMENT: 'SkyAlignment',
  DREAM: 'Dream',
  PALM: 'Palm',
  LUNAR_CALENDAR: 'LunarCalendar',
  // Calendário Cósmico — a grade do mês com as datas reais do céu (lua exata,
  // ingresso do Sol, retrógrado, aspecto exato). É a casa das "Temporadas do
  // Céu" que saíram da Home em 31/07/2026.
  CALENDARIO_COSMICO: 'CalendarioCosmico',
  // Retrospectiva da Lua Cheia — o balanço do ciclo desde a última Lua Nova
  // (lib/retroLunacao.js). Vizinha das duas telas de calendário porque é a
  // terceira que só existe por causa de uma data do céu: ela abre no dia em que
  // a Lua está cheia e, fora dele, diz quando volta.
  RETRO_LUA: 'RetroLuaCheia',
  ZODIAC_BODY: 'ZodiacBody',
  GROUNDING: 'Grounding',
  RITUAIS: 'Rituais',
  // A Jornada Guiada (trilhas de 7 dias, lib/jornada.js). Mora no HomeStack
  // como as outras telas de conteúdo — as ações do dia levam pra features que
  // já existem, e o Tarô é a única que fica em outra aba.
  JORNADA: 'Jornada',
  // A leva de 31/07/2026 — quatro telas de conteúdo no HomeStack: Mito × Fonte
  // (lib/mitos.js), a entrada por emoção "Como você tá?" (lib/emocoes.js), o
  // quiz "Você sabia?" (lib/quizCosmico.js) e o Papel de Parede do céu
  // (lib/wallpaper.js). Mesmo padrão das telas de conteúdo acima.
  MITOS: 'Mitos',
  COMO_VOCE_TA: 'ComoVoceTa',
  QUIZ_COSMICO: 'QuizCosmico',
  WALLPAPER: 'Wallpaper',
  // A Idade Real de Cada Coisa — a tabela de 30 datacoes do doc 10 §13. A base
  // chama de "a peca mais compartilhavel que este app pode ter", e e conteudo
  // puro: zero efemeride, zero dependencia de hora ou cidade.
  IDADE_REAL: 'IdadeReal',
  PROFECCOES: 'Profeccoes',
  COMO_DECIDE: 'ComoDecide',
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

  COMMUNITY_MAIN: 'CommunityMain',
  COMMUNITY_GUIDELINES: 'CommunityGuidelines',

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
