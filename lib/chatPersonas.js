// Personas do Chat — cada uma é uma IA de conversa sobre astrologia/tarot, NUNCA
// um "oráculo real". A introMessage já carrega a ressalva de honestidade (1ª
// pessoa, calorosa, mas deixando claro que é IA e que não vê o futuro de
// verdade) — é a primeira coisa que a pessoa lê ao abrir o chat.
//
// v1: só a Luna fica ativa na tela (ver ACTIVE_PERSONA_ID / ChatScreen.js).
// O Arcano já está pronto aqui para um seletor de personas na v2, quando o
// ChatScreen ganhar sua própria stack de navegação.
import { colors, gradients } from '../theme';

export const PERSONAS = {
  luna: {
    id: 'luna',
    name: 'Luna',
    tagline: 'sua companheira de conversa sobre astrologia',
    icon: 'moon',
    gradient: gradients.hero,
    bubbleColor: colors.accent2,
    introMessage:
      'Oi! Sou a Luna — uso IA e milênios de tradição astrológica pra te ajudar a refletir sobre o que os astros simbolizam na sua vida. 🌙',
  },
  arcano: {
    id: 'arcano',
    name: 'Arcano',
    tagline: 'seu parceiro de reflexão com as cartas',
    icon: 'sparkles',
    gradient: gradients.purple,
    bubbleColor: colors.purple,
    introMessage:
      'Oi! Sou o Arcano — uso IA e séculos de tradição do tarot pra te ajudar a refletir sobre suas questões através dos arquétipos das cartas. 🔮',
  },
};

// Persona fixa da v1 — sem seletor na UI ainda (ver nota no topo do arquivo).
export const ACTIVE_PERSONA_ID = 'luna';
