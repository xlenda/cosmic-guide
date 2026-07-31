// lib/grounding.js
// ASSENTAR — os minutos de respiração e presença oferecidos DEPOIS de uma
// leitura (Tarô, Sonho, Palma, Café), pra pessoa ficar um pouco com o que
// acabou de ler antes de fechar o app.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string daqui
// ===========================================================================
// Respiração e presença são PRÁTICA, nunca tratamento.
//
// PROIBIDO, sem exceção: "cura", "trata", "alivia", "reduz a ansiedade",
// "melhora o sono", "baixa a pressão", "regula o cortisol", "fortalece a
// imunidade" — e qualquer outra promessa de efeito físico ou mental
// mensurável. Nada que sugira que isto substitui ou adia atendimento de saúde.
//
// PERMITIDO: descrever o que a pessoa VAI FAZER ("inspire contando até
// quatro"), o que a tradição associa (sempre com a fonte, sempre no registro
// de tradição) e o convite ("alguns minutos em silêncio com o que você acabou
// de ler").
//
// TESTE PARA CADA FRASE: se alguém pudesse ler e decidir NÃO procurar ajuda
// por causa dela, ela está errada. Reescreva como ação observável, ou corte.
//
// A ARMADILHA DE ESCRITA, específica desta tela: o texto CORRETO de respiração
// é vizinho do proibido, e a diferença mora na preposição de finalidade.
// "Inspire contando até quatro" descreve; "inspire para relaxar" promete.
// Todo verbo aqui é de AÇÃO OBSERVÁVEL (inspire, conte, solte, repare) e
// nenhum é de RESULTADO (relaxe, acalme, solte a tensão, esvazie a mente).
// "Esvazie a mente" é ruim por um segundo motivo: é instrução impossível, e
// instrução impossível produz sensação de fracasso em quem acabou de ler algo
// que a mexeu.
//
// test/grounding.test.js varre TODOS os valores grounding.* do dicionário nos
// três idiomas atrás desse vocabulário e falha o build. É de propósito.
// ===========================================================================
//
// ===========================================================================
// EARTHING NÃO ENTRA — nem como metáfora
// ===========================================================================
// "Aterramento" tem dois sentidos e esta tela usa só um.
//
// (a) GROUNDING SOMÁTICO — prática de atenção e presença, trazer o foco de
//     volta ao momento atual por via sensorial, cognitiva ou física. O termo
//     vem da tradição somática (bioenergética de Alexander Lowen, 1976/1993) e
//     tem uso clínico documentado. É ESTE, e como PRÁTICA, nunca como
//     intervenção.
//
// (b) EARTHING — a alegação de que o contato da pele com o solo transferiria
//     elétrons que neutralizam radicais livres, baixam hormônio de estresse e
//     protegem de campos eletromagnéticos. Não tem lastro: revisões céticas
//     convergentes apontam ausência de evidência e mecanismos que conflitam
//     com física e biologia estabelecidas. (Detalhe que vale saber: "earthing"
//     tem significado estrito em engenharia elétrica — aterramento de proteção
//     contra choque — e foi apropriado pela medicina alternativa, emprestando
//     à alegação uma respeitabilidade científica que ela não tem.)
//
// Por isso VOCABULARIO_EARTHING abaixo é uma lista de palavras banidas do
// texto da tela, e o teste a aplica. Nem como imagem poética: "descarregar a
// energia negativa no chão" é earthing de roupa nova, e o leitor não faz essa
// distinção. Quando quisermos a imagem da terra, ela entra pelo lado
// ASTROLÓGICO (elemento Terra, Aristóteles + Ptolomeu), que é declaradamente
// tradição — não mecanismo.
//
// A ÚNICA exceção é a seção "o que a pesquisa não achou", que NOMEIA a
// alegação para dizer que ela não se sustenta. Se ela não pudesse escrever a
// palavra, não poderia desmenti-la.
// ===========================================================================
//
// ONDE MORA O TEXTO. O traduzível vive em lib/i18n.js sob o prefixo
// `grounding.` e é lido por chave montada com os helpers deste arquivo. O que
// NÃO é traduzível vive aqui: o verbatim inglês de Ptolomeu (tradução Robbins,
// 1940) e a bibliografia. Traduzir citação verbatim seria falsificá-la — mesma
// regra de lib/zodiacBody.js.
//
// O QUE A EVIDÊNCIA CLÍNICA DIZ, e por que ela NÃO entra na tela: existe
// sinal e ele é pequeno (meta-análise de ensaios randomizados sobre
// breathwork: g = -0,35; revisões registram risco de viés moderado a alto e
// pedem cautela explícita). Efeito médio pequeno em grupo não permite prometer
// nada a uma pessoa específica numa noite específica, e a literatura é sobre
// breathwork EM GERAL — não sobre padrão nenhum em particular. Ou seja:
// escrever como prática não é só a opção segura, é a única descrição honesta
// do que se sabe.
import { moonSign } from './signs';
import { rulerOfDay } from './dailyThought';
import { localDayStr } from './localDay';

// ---------------------------------------------------------------------------
// 1. OS PADRÕES DE RESPIRAÇÃO
// ---------------------------------------------------------------------------
// SEGURANÇA POR DESENHO, ANTES DE QUALQUER AVISO. O risco concreto da prática
// está concentrado na RETENÇÃO — e é justamente o elemento que a tradição mais
// valoriza (no Hatha Yoga Pradipika o kumbhaka recebe as instruções mais
// extensas, com puraka e rechaka organizados em torno dele). Essa tensão se
// resolve no desenho, não no texto:
//
//   1. O padrão PADRÃO não tem retenção nenhuma. Quem só apertou começar
//      recebe entrada e saída de tempos iguais e mais nada. Retenção é escolha
//      explícita, nunca o que acontece por omissão.
//   2. Os padrões estão ordenados por retenção CRESCENTE, e o teste segura
//      essa ordem. O 4-7-8, que tem a retenção mais longa, é o último — nunca
//      o primeiro da lista, nunca o pré-selecionado.
//   3. `temRetencao` existe pra tela poder marcar o padrão e oferecer, ao
//      lado, a alternativa sem pausa.
//
// `tempos` é em segundos. Fase de 0 segundo simplesmente não existe no ciclo
// (ver faseEm) — não é uma pausa de zero, é uma fase que não acontece.
export const FASES = ['inspira', 'seguraCheio', 'expira', 'seguraVazio'];

export const PADROES = [
  {
    // Sama vritti sem retenção. A tradição do yoga tem uma família de
    // respirações de tempos iguais com esse nome; os Yoga Sutras II.49-50
    // definem pranayama como a regulação do fluxo de entrada e saída e
    // descrevem os movimentos (inspiração, expiração, retenção) regulados
    // quanto a duração e lugar. Aqui ficam só os dois primeiros.
    id: 'igual',
    tempos: { inspira: 4, seguraCheio: 0, expira: 4, seguraVazio: 0 },
    temRetencao: false,
    locus: 'Patanjali, Yoga Sutras II.49-50',
  },
  {
    // Respiração quadrada. Quatro fases de quatro tempos — daí o nome. É sama
    // vritti COM acréscimo de retenção, e a retenção é curta e igual às outras
    // fases (o motivo de ela vir antes do 4-7-8 na lista).
    // NÃO ESCREVER que "vem dos Upanishads": não foi localizada passagem
    // primária descrevendo a razão 4-4-4-4 (ver NAO_ACHADO).
    id: 'quadrado',
    tempos: { inspira: 4, seguraCheio: 4, expira: 4, seguraVazio: 4 },
    temRetencao: true,
    locus: 'Patanjali, Yoga Sutras II.50; nome moderno divulgado por Mark Divine, 2012',
  },
  {
    // 4-7-8. A autoria e a data são fato verificável e podem ser ditas.
    // O QUE NÃO PODE, nem entre aspas e com atribuição: as afirmações do
    // próprio Weil sobre a técnica ("tranquilizante natural do sistema
    // nervoso", "dorme em 60 segundos"). Citar a promessa é colocar a promessa
    // na tela — a atribuição não a neutraliza. Fica o padrão, sai a alegação.
    // `id` em camelCase, sem hífen, de propósito: ele vira segmento de chave
    // de i18n, e chave com hífen escapa da varredura estática de
    // test/i18nKeysExist.test.js (armadilha já documentada em
    // components/CosmicSoundPlayer.js).
    id: 'quatroSeteOito',
    tempos: { inspira: 4, seguraCheio: 7, expira: 8, seguraVazio: 0 },
    temRetencao: true,
    locus: 'Padrão divulgado em 2015 pelo médico Andrew Weil',
  },
];

// O que abre selecionado. É o único sem retenção, e isso não é coincidência.
export const PADRAO_PADRAO = 'igual';

export function padraoPorId(id) {
  return PADROES.find((p) => p.id === id) || PADROES.find((p) => p.id === PADRAO_PADRAO);
}

// A MEDIDA DE RISCO É A RETENÇÃO MAIS LONGA, NÃO A SOMA — e a diferença não é
// detalhe. Somando os tempos de pausa do ciclo, o quadrado (4+4=8) parece mais
// pesado que o 4-7-8 (7+0=7), e a lista sairia ordenada ao contrário do que
// importa. O que exige esforço é quanto tempo se passa numa ÚNICA apneia:
// quatro tempos de ar preso e sete tempos de ar preso não são a mesma coisa,
// mesmo que a soma diga que sim. Por isso a ordenação da lista (e o teste que
// a segura) usa o máximo, não o total. Escrito aqui porque a versão errada é
// a intuitiva.
export function retencaoMaisLonga(padrao) {
  const p = padrao && padrao.tempos ? padrao : padraoPorId(padrao);
  return Math.max(p.tempos.seguraCheio || 0, p.tempos.seguraVazio || 0);
}

// ---------------------------------------------------------------------------
// 2. DURAÇÃO
// ---------------------------------------------------------------------------
// Três minutos é o convite de verdade — cabe depois de uma leitura sem virar
// compromisso. Os outros dois existem pra quem quiser ficar.
export const DURACOES_MIN = [3, 10, 20];
export const DURACAO_PADRAO_MIN = 3;

// ---------------------------------------------------------------------------
// 3. A MÁQUINA DE ESTADOS — pura, determinística, testável sem tela
// ---------------------------------------------------------------------------
// Nenhuma destas funções lê relógio: quem chama passa o tempo decorrido. É o
// que permite o teste percorrer uma sessão inteira sem timer e a tela usar
// relógio de parede (Date.now) em vez de contar tiques — aba em segundo plano
// tem setInterval estrangulado pelo navegador, lição já documentada em
// context/CosmicSoundContext.js.

// As fases que realmente acontecem neste padrão, com duração > 0.
export function fasesAtivas(padrao) {
  const p = padrao && padrao.tempos ? padrao : padraoPorId(padrao);
  return FASES.filter((f) => (p.tempos[f] || 0) > 0).map((f) => ({ fase: f, duracao: p.tempos[f] }));
}

export function cicloSegundos(padrao) {
  return fasesAtivas(padrao).reduce((soma, f) => soma + f.duracao, 0);
}

// Onde a pessoa está AGORA no ciclo.
// → { fase, duracaoFase, decorridoNaFase, restanteNaFase, contagem, progresso, ciclo }
//   `contagem` é o número que aparece na tela: 1..duracaoFase (a contagem que
//   se conta em voz baixa, não um cronômetro decrescente).
//   `progresso` é 0..1 dentro da fase — é o que a animação consome.
export function faseEm(padrao, decorridoS) {
  const p = padrao && padrao.tempos ? padrao : padraoPorId(padrao);
  const ativas = fasesAtivas(p);
  const ciclo = cicloSegundos(p);
  const t = Number.isFinite(decorridoS) && decorridoS > 0 ? decorridoS : 0;
  const dentro = ciclo > 0 ? t % ciclo : 0;
  const numeroDoCiclo = ciclo > 0 ? Math.floor(t / ciclo) : 0;

  let acumulado = 0;
  for (const f of ativas) {
    if (dentro < acumulado + f.duracao) {
      const decorridoNaFase = dentro - acumulado;
      return {
        fase: f.fase,
        duracaoFase: f.duracao,
        decorridoNaFase,
        restanteNaFase: f.duracao - decorridoNaFase,
        contagem: Math.min(f.duracao, Math.floor(decorridoNaFase) + 1),
        progresso: f.duracao > 0 ? decorridoNaFase / f.duracao : 0,
        ciclo: numeroDoCiclo,
      };
    }
    acumulado += f.duracao;
  }
  // Só chega aqui se o padrão não tiver fase nenhuma — impossível com os
  // padrões deste arquivo, e o teste garante que continue impossível.
  return null;
}

// A sessão inteira. → { terminou, decorridoS, restanteS, ciclosCompletos, ...faseEm }
export function sessaoEm(padrao, duracaoMin, decorridoS) {
  const p = padrao && padrao.tempos ? padrao : padraoPorId(padrao);
  const totalS = Math.max(0, Math.round((Number(duracaoMin) || 0) * 60));
  const t = Number.isFinite(decorridoS) && decorridoS > 0 ? decorridoS : 0;
  const terminou = t >= totalS;
  // Depois do fim, a fase congela no último instante válido em vez de dar a
  // volta: a tela do fim não pode mostrar o círculo continuando a inspirar.
  const base = faseEm(p, terminou ? Math.max(0, totalS - 0.001) : t) || {};
  return {
    ...base,
    terminou,
    decorridoS: Math.min(t, totalS),
    restanteS: Math.max(0, totalS - t),
    totalS,
    ciclosCompletos: Math.floor(Math.min(t, totalS) / Math.max(1, cicloSegundos(p))),
  };
}

// mm:ss — a tela mostra tempo, não segundos crus.
export function formatarTempo(segundos) {
  const s = Math.max(0, Math.ceil(Number(segundos) || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// 4. O QUE A TRADIÇÃO ASSOCIA AO DIA DE HOJE
// ---------------------------------------------------------------------------
// A semana planetária é fato documentado: Dião Cássio (História Romana
// 37.18-19) registra que o costume de referir os dias aos sete astros foi
// instituído pelos egípcios, e dá duas derivações — o princípio do tetracorde
// e a das horas (cada dia recebe o nome do astro que rege sua PRIMEIRA hora).
// As duas produzem a mesma sequência. É a mesma ordem caldaica que
// lib/dailyThought.js já usa, e é de lá que `rulerOfDay` vem: uma fonte só de
// regente no app inteiro.
export const SEMANA_LOCUS = 'Dião Cássio, História Romana 37.18-19';

// As sete qualidades saem de UM capítulo só — Ptolomeu, Tetrabiblos I.4, "Do
// Poder dos Planetas" (tradução Robbins, 1940, domínio público). Isso é
// deliberado e vale mais do que juntar sete fontes bonitas: é um sistema
// coerente, do séc. II, com vocabulário próprio (quente/frio/seco/úmido) que
// se aplica igual aos sete.
//
// AVISO DE USO, e é o ponto mais delicado desta tela: Ptolomeu descreve
// efeitos FÍSICOS E METEOROLÓGICOS — ventos, exalações, corpos —, não estados
// de ânimo. Transformar "Saturno resfria" em "sábado é dia de esfriar a
// cabeça" é um salto NOSSO, não dele. Por isso o vocabulário térmico fica
// SEMPRE com o planeta como sujeito da frase: "a tradição atribui a Saturno
// resfriar e secar". Nunca aplicado a quem lê — perto de um exercício de
// respiração, "resfriar" ou "aquecer" dirigidos a uma pessoa leem como efeito
// fisiológico. O teste exige que toda glosa se declare como atribuição de
// tradição.
//
// `verbatim` é o inglês de Robbins, sem tradução (mesma regra do latim de
// Manílio em lib/zodiacBody.js).
export const PLANETAS_LOCUS = 'Ptolomeu, Tetrabiblos I.4';
export const REGENTES = [
  {
    id: 'sol',
    planeta: 'Sol',
    diaSemana: 0,
    verbatim: "The active power of the sun's essential nature is found to be heating and, to a certain degree, drying.",
    temPonte: false,
  },
  {
    id: 'lua',
    planeta: 'Lua',
    diaSemana: 1,
    // CORTE DELIBERADO: o mesmo capítulo diz que a ação da Lua é amolecer e
    // causar putrefação nos corpos. Fica de fora — é imagem de decomposição
    // física e, numa tela de ritual, só pode dar errado. "Umedecer" e a
    // proximidade com a terra são da mesma passagem e bastam.
    verbatim: "Most of the moon's power consists of humidifying...",
    temPonte: false,
  },
  {
    id: 'marte',
    planeta: 'Marte',
    diaSemana: 2,
    // Ptolomeu justifica pela COR do planeta — detalhe verificável, e do tipo
    // que dá credibilidade a uma tela histórica.
    verbatim: 'The nature of Mars is chiefly to dry and to burn, in conformity with his fiery colour and by reason of his nearness to the sun.',
    temPonte: false,
  },
  {
    id: 'mercurio',
    planeta: 'Mercúrio',
    diaSemana: 3,
    // O único dos sete SEM qualidade fixa: a alternância rápida é a qualidade.
    // Para um ritual que muda com o dia, quarta-feira é literalmente o dia sem
    // textura fixa — e isso está na fonte antiga, não é achado nosso.
    verbatim: 'Mercury in general is found at certain times alike to be drying and absorptive of moisture... inspired as it were by the speed of his motion.',
    temPonte: false,
  },
  {
    id: 'jupiter',
    planeta: 'Júpiter',
    diaSemana: 4,
    verbatim: 'Jupiter has a temperate active force... both heats and humidifies.',
    temPonte: false,
  },
  {
    id: 'venus',
    planeta: 'Vênus',
    diaSemana: 5,
    verbatim: 'Venus has the same powers and tempered nature as Jupiter, but acts in the opposite way; for she warms moderately... but chiefly humidifies.',
    // A ponte: Vênus é a regente diurna da triplicidade de TERRA no próprio
    // Ptolomeu (I.xxi). Sexta-feira é o dia em que regente e elemento se
    // encontram na mesma fonte — ligação legítima, não inventada.
    temPonte: true,
  },
  {
    id: 'saturno',
    planeta: 'Saturno',
    diaSemana: 6,
    verbatim: "It is Saturn's quality chiefly to cool and... to dry, probably because he is furthest removed both from the sun's heat and the moist exhalations about the earth.",
    // A ponte: resfriar e secar são as MESMAS duas qualidades que Aristóteles
    // dá ao elemento Terra. Sábado é, pela própria fonte, o dia mais "de
    // terra" da semana.
    temPonte: true,
  },
];

const REGENTE_POR_PLANETA = REGENTES.reduce((acc, r) => {
  acc[r.planeta] = r;
  return acc;
}, {});

export function regentePorPlaneta(nome) {
  return REGENTE_POR_PLANETA[nome] || null;
}

// ---------------------------------------------------------------------------
// 5. OS QUATRO ELEMENTOS
// ---------------------------------------------------------------------------
// Aristóteles, Da Geração e Corrupção II.3: os elementos se compõem de quatro
// contrários primários — quente, frio, seco, úmido — e cada corpo simples tem
// dois; os contrários não se acoplam, então só há quatro combinações. Fogo é
// quente e seco; Ar, quente e úmido; Água, fria e úmida; Terra, fria e seca.
// (Ele acrescenta que a Terra se caracteriza mais pelo seco do que pelo frio,
// embora tenha ambos.)
//
// `id` é sem acento porque vira chave de i18n; `elementoApp` casa byte a byte
// com o campo `element` de lib/signs.js, que é de onde o signo lunar chega.
export const ARISTOTELES_LOCUS = 'Aristóteles, Da Geração e Corrupção II.3';
export const ELEMENTOS = [
  { id: 'fogo', elementoApp: 'fogo' },
  { id: 'ar', elementoApp: 'ar' },
  { id: 'agua', elementoApp: 'água' },
  { id: 'terra', elementoApp: 'terra' },
];

const ELEMENTO_POR_APP = ELEMENTOS.reduce((acc, e) => {
  acc[e.elementoApp] = e;
  return acc;
}, {});

export function elementoPorNomeApp(nome) {
  return ELEMENTO_POR_APP[nome] || null;
}

// A TRIPLICIDADE DE TERRA — e três ressalvas de rigor, no espírito do que já
// está em lib/zodiacBody.js:
//
// (1) O eixo organizador de Ptolomeu em I.xxi é VENTO E DIREÇÃO, não "elemento"
//     como rótulo: o capítulo fala em triplicidade meridional, mistura do
//     leste, ventos do sul. A nomenclatura elemental limpa é o modo padrão da
//     tradição POSTERIOR de nomear as mesmas quatro triplicidades. Não existe
//     no Tetrabiblos uma frase dizendo "esta é a triplicidade da terra e a
//     terra é fria e seca" — isso é síntese de duas fontes, e a tela apresenta
//     como síntese.
// (2) Os regentes de triplicidade DIVERGEM entre autoridades, e isso é
//     conhecido: Ptolomeu dá dois (Vênus de dia, Lua de noite); Doroteu de
//     Sidon e Valente preservam um esquema mais antigo de três — diurno,
//     noturno e participante — em que a terra fica com Vênus, Lua e MARTE.
//     Citar regente de triplicidade sem dizer de quem é o esquema é o tipo de
//     erro que esta tela existe pra não cometer.
// (3) A associação Terra = corpo, concretude, lentidão é INTERPRETAÇÃO MODERNA
//     CORRENTE, não texto antigo. Frio-e-seco em Aristóteles é física dos
//     elementos, não psicologia. Não foi localizada fonte antiga que descreva
//     signos de terra como "práticos" ou "aterrados" no sentido que o mercado
//     usa — ver NAO_ACHADO. Este é o ponto onde a tela mais correria risco de
//     inventar tradição, justamente porque a associação parece óbvia por ser
//     onipresente hoje.
export const TRIPLICIDADE_TERRA = {
  signos: ['Touro', 'Virgem', 'Capricórnio'],
  locus: 'Ptolomeu, Tetrabiblos I.xxi',
  divergenciaLocus: 'Doroteu de Sidon; Vétio Valente',
};

// ---------------------------------------------------------------------------
// 6. O CÉU DE HOJE, SEM FABRICAR NADA
// ---------------------------------------------------------------------------
// Determinístico por DIA LOCAL, igual getSkyTuning em lib/cosmicSound.js: duas
// chamadas no mesmo dia devolvem o mesmo resultado mesmo com horas de
// diferença, e a sessão de vinte minutos não troca de texto no meio.
//
// NUNCA FABRICA. Sem efeméride (astronomy-engine ausente), só a parte lunar se
// perde: o regente do dia continua real, porque a ordem caldaica é aritmética
// de dia da semana e não depende de efeméride nenhuma. `ceuDisponivel: false`
// é o que a tela usa pra dizer, com todas as letras, que não sabe onde a Lua
// está — em vez de mostrar um elemento plausível.
export function guiaDoDia(data = new Date()) {
  const quando = data instanceof Date ? data : new Date(data);
  const diaStr = localDayStr(quando);
  const regenteDoDia = rulerOfDay(quando);
  const regente = regentePorPlaneta(regenteDoDia.planet);

  const lua = moonSign(diaStr);
  const elemento = lua && lua.element ? elementoPorNomeApp(lua.element) : null;

  return {
    dia: diaStr,
    planeta: regenteDoDia.planet,
    emoji: regenteDoDia.emoji,
    regente,
    ceuDisponivel: !!lua,
    signoLua: lua ? lua.name : null,
    emojiLua: lua ? lua.emoji : null,
    elemento,
    // Dia em que o elemento do signo lunar é o mesmo que a tela usa como
    // imagem central. Não significa nada além de coincidirem — e a tela diz
    // exatamente isso.
    elementoTerra: !!(elemento && elemento.id === 'terra'),
  };
}

// ---------------------------------------------------------------------------
// 7. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Fica na tela, mesmo padrão de NOT_VERIFIED em lib/zodiacBody.js: dizer que
// não se achou é mais honesto do que completar por dedução, e impede que a
// próxima pessoa a editar preencha a lacuna com a versão que circula por aí.
export const NAO_ACHADO = [
  'upanishads',     // passagem primária dos Upanishads com a razão 4-4-4-4
  'terraPsicologia', // fonte antiga ligando signos de terra a praticidade/"estar aterrado"
  'quatroSeteOito',  // evidência de que o 4-7-8 seja superior a respirar devagar de outro jeito
  'earthing',        // qualquer base para o mecanismo de transferência de elétrons
];

// Palavras banidas do texto da tela (ver o cabeçalho EARTHING NÃO ENTRA). O
// teste aplica esta lista a todas as chaves grounding.*, nos três idiomas,
// exceto a seção que nomeia a alegação pra desmenti-la.
export const VOCABULARIO_EARTHING = [
  'elétron', 'eletron', 'electron', 'electrón',
  'radical livre', 'radicales libres', 'free radical',
  'campo eletromagnético', 'campo electromagnético', 'electromagnetic field',
  'íon negativo', 'ion negativo', 'iones negativos', 'negative ion',
  'descarregar', 'descarga', 'descargar', 'discharge',
  'polaridade', 'polarity',
  'energia da terra', 'energía de la tierra', "earth's energy", 'earth energy',
];

// ---------------------------------------------------------------------------
// 8. BIBLIOGRAFIA
// ---------------------------------------------------------------------------
// Citações neutras, sem tradução (mesma regra do cabeçalho). Fica na tela,
// recolhida, como em lib/zodiacBody.js.
export const FONTES = [
  'Patanjali, Yoga Sutras II.49-51 (definição de pranayama; os três movimentos e o quarto) — https://www.wisdomlib.org/hinduism/book/yoga-sutras-study/d/doc628758.html',
  'Hatha Yoga Pradipika, sobre kumbhaka (antara e bahya) — https://en.wikipedia.org/wiki/Kumbhaka',
  'Cleveland Clinic, Box Breathing (associação com sama vritti pranayama) — https://health.clevelandclinic.org/box-breathing-benefits',
  'Cleveland Clinic, 4-7-8 Breathing Method — https://health.clevelandclinic.org/4-7-8-breathing',
  'Aristóteles, Da Geração e Corrupção II.3 (as quatro qualidades; terra = fria e seca) — https://sacred-texts.com/cla/ari/ogc/ogc13.htm',
  'Ptolomeu, Tetrabiblos I.4, Do Poder dos Planetas (trad. Robbins, 1940) — https://astrolibrary.org/library/tetrabiblos/tetrabiblos-6/',
  'Ptolomeu, Tetrabiblos I.xxi, Das Triplicidades — https://sacred-texts.com/astro/ptb/ptb24.htm',
  'Dião Cássio, História Romana 37.18-19 (a semana planetária e a ordem caldaica) — https://penelope.uchicago.edu/thayer/e/roman/texts/cassius_dio/37*.html',
  'Divergência de regentes de triplicidade entre Ptolomeu e Doroteu/Valente — https://denovastella.wordpress.com/articles/triplicities/',
  'Psychology Tools, Grounding Techniques (recurso clínico; grounding como habilidade de atenção) — https://www.psychologytools.com/resource/grounding-techniques',
  'Effect of breathwork on stress and mental health: a meta-analysis of randomised-controlled trials, Scientific Reports — https://www.nature.com/articles/s41598-022-27247-y',
  'The Effect of Slow-Paced Breathing on Cardiovascular and Emotion Functions, Mindfulness (Springer) — https://link.springer.com/article/10.1007/s12671-023-02294-2',
  'Contraindicações de breathwork (gravidez, cardiovascular, epilepsia, pânico) — https://thebreathefestival.co.uk/contraindications-to-breathwork',
  'Skeptic, Barefoot in Sedona: Bogus Claims About Grounding Your Feet to Earth — https://www.skeptic.com/article/barefoot-in-sedona-bogus-claims-about-grounding-your-feet-to-earth-promote-medical-pseudoscience/',
];

// ---------------------------------------------------------------------------
// 9. HELPERS DE CHAVE i18n
// ---------------------------------------------------------------------------
// Sempre por template literal, nunca literal solto — pra ninguém escrever uma
// chave à mão e ela divergir do dicionário (mesma disciplina de
// lib/zodiacBody.js). test/grounding.test.js confere a família inteira nos três
// idiomas, porque test/i18nKeysExist.test.js não enxerga chave montada em
// runtime.
export function padraoKey(id, campo) {
  return `grounding.pattern.${id}.${campo}`;
}
export function regenteKey(id, campo) {
  return `grounding.ruler.${id}.${campo}`;
}
export function elementoKey(id, campo) {
  return `grounding.element.${id}.${campo}`;
}
export function naoAchadoKey(id) {
  return `grounding.notFound.${id}`;
}
export function faseKey(fase) {
  return `grounding.phase.${fase}`;
}
