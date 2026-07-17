// Banco de respostas MOCK para o Chat (Luna/Arcano). Tudo aqui é lógica local,
// sem chamada de rede — é só um placeholder até existir IA de verdade por trás.
//
// TODO(real-AI): trocar o corpo desta função por uma chamada à API real
// quando houver uma ANTHROPIC_API_KEY (ou similar) disponível. Como este é
// um app RN client-side, a chave NÃO pode viver aqui — precisa de um
// endpoint de proxy no backend Express (mesmo padrão do backend Hotmart
// já existente), ex.: POST /api/chat { personaId, message } -> resposta da IA,
// mantendo a key só no servidor.

// Palavras-chave testadas em ordem — a primeira categoria que bater vence.
const KEYWORD_RULES = [
  { category: 'amor', pattern: /amor|paix[aã]o|relacionamento|namorad|casament|ex\b/i },
  { category: 'trabalho', pattern: /trabalh|carreira|dinheiro|emprego|profiss/i },
  { category: 'futuro', pattern: /futuro|vai acontecer|previs[aã]o|prever|vai dar certo|vou conseguir/i },
];

const REPLIES = {
  luna: {
    amor: [
      'O jeito como Vênus se move no seu mapa pode dizer bastante sobre como você se conecta no amor. Me conta um pouco mais sobre o que está pegando aí?',
      'Assuntos do coração combinam bem com olhar pra Lua e Vênus. O que você sente que está travando essa relação?',
      'Astrologia não resolve o coração por você, mas pode ajudar a nomear o que você já sente. O que pesa mais agora: medo, dúvida ou cansaço?',
      'Cada signo lida com amor de um jeito. Me diz os signos de vocês dois que penso em como isso pode estar se refletindo aí.',
    ],
    trabalho: [
      'Carreira costuma se conectar com a Casa 10 e com Saturno no mapa. Me conta o que tá em jogo: uma decisão, uma mudança, uma estagnação?',
      'Se motivação e direção tão em xeque, vale olhar como Marte anda passando pelo seu mapa. O que você sente que falta agora — coragem ou clareza?',
      'Trabalho mexe com segurança e propósito. Quer me contar o que te deixou inquieta(o) com isso?',
      'Cada fase profissional pede uma postura diferente. Me diz mais: é sobre começar algo novo ou aguentar o que já existe?',
    ],
    futuro: [
      'A astrologia trabalha com ciclos e trânsitos — uma linguagem simbólica que a humanidade usa há milênios pra pensar o tempo. Me conta o que você mais quer entender sobre a fase que vem por aí?',
      'Não trabalho com certezas, trabalho com espelhos: a astrologia ajuda a nomear o que você já sente se desenhando. O que você teme ou espera que aconteça?',
      'Prefiro falar de ciclos a falar de certezas — é assim que a astrologia enxerga o tempo há milênios. Qual ciclo da sua vida te chamou atenção ultimamente?',
      'Os símbolos não garantem nada, mas ajudam a organizar o que você já sente que está por vir. Me conta o que te deixa mais curiosa(o) ou ansiosa(o).',
    ],
    generic: [
      'Me conta mais sobre o que está passando pela sua cabeça — gosto de pensar junto usando o simbolismo dos astros.',
      'Todo mundo carrega um pedacinho de céu dentro de si. O que você quer explorar hoje?',
      'Posso não ter respostas certas — só reflexões emprestadas dos astros. Qual assunto tá mais na sua mente agora?',
      'Vamos conversar com calma. O que te motivou a abrir esse chat hoje?',
    ],
  },
  arcano: {
    amor: [
      'O Dois de Copas costuma aparecer quando duas pessoas topam se abrir de verdade. Me conta o que está em jogo nesse vínculo?',
      'As cartas do amor falam de vulnerabilidade antes de falar de final feliz. O que você sente que ainda não disse pra essa pessoa (ou pra você mesma(o))?',
      'Cartas não resolvem o coração — só ajudam a enxergar o que já está entalado. O que pesa mais: dúvida, medo ou saudade?',
      'Se eu puxasse uma carta agora pra representar esse momento, queria entender antes: você busca resposta ou só um espaço pra desabafar?',
    ],
    trabalho: [
      'O Mago fala de ferramentas que já estão nas suas mãos — só falta usar. O que você sente que está represando sua carreira agora?',
      'Trabalho pede ancoragem, tipo o Quatro de Paus: estrutura antes de crescimento. Me conta o que está em jogo — mudança, estagnação, decisão?',
      'Cada arquétipo do tarot fala de uma fase. Me diz mais: você tá começando algo ou tentando sair de algo?',
      'As cartas gostam de simbolizar o que a gente evita nomear. O que você não tá dizendo pra si sobre o seu trabalho?',
    ],
    futuro: [
      'O tarot fala a língua dos arquétipos, não das certezas — é assim há séculos. Posso puxar o simbolismo de uma carta pra te ajudar a pensar no que vem. O que você mais quer refletir sobre o futuro?',
      'O tarot não garante nada, mas ajuda a organizar o que já ronda sua cabeça através dos arquétipos. O que vem por aí que você quer entender melhor?',
      'Não existe carta que garanta o futuro, mas dá pra usar os arquétipos pra olhar pros seus medos e desejos. Qual deles pesa mais agora?',
      'O que posso oferecer é um espelho simbólico pro que você já sente que está se desenhando, com base nos arquétipos do tarot. Me conta mais?',
    ],
    generic: [
      'Cada carta é um espelho, não uma resposta pronta. Sobre o que você quer refletir hoje?',
      'Gosto de pensar que as cartas só emprestam palavras pro que a gente já sente. O que está passando pela sua cabeça?',
      'Posso não prever nada de verdade, mas adoro trocar ideia usando os arquétipos do tarot. Qual assunto te trouxe aqui?',
      'Vamos com calma — me conta o que te motivou a abrir esse chat.',
    ],
  },
};

function detectCategory(userText) {
  const normalized = (userText || '').toLowerCase();
  const rule = KEYWORD_RULES.find((r) => r.pattern.test(normalized));
  return rule ? rule.category : 'generic';
}

// Evita repetir a mesma variação duas vezes seguidas dentro da mesma
// categoria/persona (não precisa persistir entre sessões, só durante o uso).
const lastPickByKey = {};

function pickVariation(pool, key) {
  if (pool.length === 1) return pool[0];
  let index = Math.floor(Math.random() * pool.length);
  if (index === lastPickByKey[key]) {
    index = (index + 1) % pool.length;
  }
  lastPickByKey[key] = index;
  return pool[index];
}

// Ponto único de "IA" do app hoje: recebe a persona ativa e o texto do
// usuário, devolve uma resposta mockada e honesta (nunca finge prever o
// futuro de verdade). Quando houver backend real, essa função vira uma
// chamada assíncrona pro proxy — ver TODO(real-AI) no topo do arquivo.
export function getMockReply(personaId, userText) {
  const personaReplies = REPLIES[personaId] || REPLIES.luna;
  const category = detectCategory(userText);
  const pool = personaReplies[category] || personaReplies.generic;
  return pickVariation(pool, `${personaId}:${category}`);
}
