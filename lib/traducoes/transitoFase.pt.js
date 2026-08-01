// lib/traducoes/transitoFase.pt.js
// O PACK PORTUGUÊS do aplicativo × separativo — TODA prosa que o usuário lê
// mora aqui. O motor (o resíduo assinado, a direção pelo movimento, o horizonte
// medido) fica em lib/transitoFase.js. Os packs irmãos (transitoFase.es.js,
// transitoFase.en.js) repetem exatamente esta FORMA: mesmas chaves, mesmos
// campos, funções com a mesma assinatura.
//
// TODAS as regras do cabeçalho de lib/transitoFase.js valem para cada string
// daqui: prende primeiro e fonte depois, locus em toda afirmação histórica,
// nenhuma alegação de saúde, nada de veredito nem de promessa, e — a mais
// importante desta feature — NÃO COMPLETAR A LACUNA: a astrologia moderna diz
// que o aspecto aplicativo é mais forte que o separativo, e esta base não achou
// a linha antiga que autorize. O app descreve os dois e não os ordena.
//
// A DATAÇÃO NÃO É ESCRITA À MÃO. "séc. II" passa por traduzirQuando() e
// "Ptolomeu" por traduzirAutor(), de lib/traducoes/datacao.js — é lá que mora a
// regra de que a OBRA nunca traduz, o AUTOR ganha a forma consagrada e a
// DATAÇÃO ganha a forma da língua.

import { traduzirAutor, traduzirQuando } from './datacao.js';

const LANG = 'pt';
const PTOLOMEU = traduzirAutor('Ptolomeu', LANG);
const VALENTE = traduzirAutor('Vétio Valente', LANG);
const SEC_II = traduzirQuando('séc. II', LANG);
const SEC_XX = traduzirQuando('séc. XX', LANG);
const ANO_LILLY = traduzirQuando('1647', LANG);

// ---------------------------------------------------------------------------
// NOMES — as CHAVES são dados (vêm assim de personalSky.js) e continuam em PT
// nos três packs; só o valor muda
// ---------------------------------------------------------------------------
const PLANETAS = {
  'Sol': 'Sol',
  'Lua': 'Lua',
  'Mercúrio': 'Mercúrio',
  'Vênus': 'Vênus',
  'Marte': 'Marte',
  'Júpiter': 'Júpiter',
  'Saturno': 'Saturno',
  'Urano': 'Urano',
  'Netuno': 'Netuno',
  'Plutão': 'Plutão',
};

// A MESMA lista, na forma que entra no meio de uma frase. Português e espanhol
// pedem artigo em alguns e não em outros ("o Sol está", mas "Mercúrio está"), e
// inglês pede "the Sun". Sem estas duas listas o texto sai "Sol está a 3 graus",
// que é o tipo de emenda que denuncia gerador de frase.
const PLANETAS_FRASE = {
  'Sol': 'o Sol',
  'Lua': 'a Lua',
  'Mercúrio': 'Mercúrio',
  'Vênus': 'Vênus',
  'Marte': 'Marte',
  'Júpiter': 'Júpiter',
  'Saturno': 'Saturno',
  'Urano': 'Urano',
  'Netuno': 'Netuno',
  'Plutão': 'Plutão',
};

const ASPECTOS = {
  'Conjunção': 'Conjunção',
  'Sextil': 'Sextil',
  'Quadratura': 'Quadratura',
  'Trígono': 'Trígono',
  'Oposição': 'Oposição',
};

// O verbo, que é a feature inteira.
const FASE_NOME = {
  aplicativo: 'está se formando',
  separativo: 'está se desfazendo',
  estacionario: 'não está se movendo',
};

// O termo técnico com a glosa colada — nunca aparece sem ela na primeira vez.
const FASE_TERMO = {
  aplicativo: 'aplicativo (o ângulo que ainda vai fechar)',
  separativo: 'separativo (o ângulo que já fechou e está abrindo)',
  estacionario: 'estacionário (o planeta praticamente não anda no céu)',
};

// ---------------------------------------------------------------------------
// NÚMEROS — vírgula decimal. São conferíveis em qualquer efeméride, então saem.
// ---------------------------------------------------------------------------
function formatarGraus(n, casas = 2) {
  return Number(Math.abs(n)).toFixed(casas).replace('.', ',');
}

function graus(n, casas = 2) {
  const s = formatarGraus(n, casas);
  return Number(s.replace(',', '.')) === 1 ? '1 grau' : `${s} graus`;
}

function duracao(dias) {
  const d = Math.abs(dias);
  if (d < 1 / 24) return 'menos de uma hora';
  if (d < 1) {
    const h = Math.max(1, Math.round(d * 24));
    return h === 1 ? 'cerca de uma hora' : `cerca de ${h} horas`;
  }
  let inteiros = Math.floor(d);
  let horas = Math.round((d - inteiros) * 24);
  if (horas === 24) {
    inteiros += 1;
    horas = 0;
  }
  const parteDias = inteiros === 1 ? 'cerca de um dia' : `cerca de ${inteiros} dias`;
  if (!horas) return parteDias;
  return `${parteDias} e ${horas === 1 ? 'uma hora' : `${horas} horas`}`;
}

// ---------------------------------------------------------------------------
// AS CITAÇÕES — verbatim, sem tradução
// ---------------------------------------------------------------------------
// O campo `texto` é o inglês de Robbins (Loeb/Harvard, 1940) e de Riley, e é
// IDÊNTICO nos três packs. O que muda por idioma é a `parafrase` — assinada
// pelo app, nunca entre aspas — e a língua do `locus`.
const VERBATIM = {
  ptolomeuI24: {
    texto:
      "In general those which precede are said to 'apply' to those which follow, and those that follow to 'be separated' from those that precede, when the interval between them is not great.",
    parafrase:
      'Em geral, os que vêm antes se dizem "aplicar-se" aos que vêm depois, e os que vêm depois "separar-se" dos que vieram antes, quando o intervalo entre eles não é grande. É a definição dos dois estados, e é posicional: supõe o planeta andando para a frente.',
    locus: `${PTOLOMEU}, Tetrabiblos I.24, "Of Applications and Separations and the Other Powers", trad. Robbins, 1940 — ${SEC_II}`,
  },
  valenteJupiterRetrogrado: {
    texto:
      'If Jupiter is ahead <of the Ascendant> and is found to have a retrograde configuration, its beneficial effect will be strong because it is being carried towards the position of the Ascendant.',
    parafrase:
      'Júpiter à frente do Ascendente e em marcha retrógrada está sendo LEVADO na direção dele — ou seja, se aproximando, e não se afastando. É a fonte antiga que resolve o caso que a definição posicional não cobre.',
    locus: `${VALENTE}, Anthologiae IX.3, trad. Riley — ${SEC_II}`,
  },
  valenteEstacoes: {
    texto:
      'If the stars are passed the first stationary point and are found to be retrograde, they delay expectations, actions, profits, and enterprises. […] If they are at <or passed> the second stationary point, they cancel any delay and reinstate the same activities.',
    parafrase:
      'Marcha para trás é atraso — e só atraso. E a segunda parada cancela o atraso e devolve as mesmas atividades. A tradição tem um fim de história embutido que o folclore moderno cortou fora.',
    locus: `${VALENTE}, Anthologiae IV.14, "The Phases and Transits of the Stars", trad. Riley — ${SEC_II}`,
  },
};

// ---------------------------------------------------------------------------
// BLOCO 1 — A CHAMADA. Vida real, sem termo técnico, sem nome próprio, sem
// século. É a primeira coisa que a tela mostra.
// ---------------------------------------------------------------------------
const CHAMADA = {
  aplicativo: () =>
    'Tem coisa que a gente sente chegando antes de chegar. A conversa que ainda não teve e já está pesando. A conta que ainda não venceu. ' +
    'O clima que mudou em casa e ninguém comentou. Este aqui é desse tipo: ainda não é — está vindo.',
  separativo: () =>
    'Tem briga que terminou na segunda e continua ocupando a quinta. Tem semana pesada que já passou e o corpo ainda anda devagar. ' +
    'Tem conversa encerrada que você segue respondendo dentro da cabeça, três dias depois. Este aqui é desse tipo: já foi — o que está aí é o rastro.',
  estacionario: () =>
    'Tem momento em que nada anda. Não chega e não passa. É o mais difícil de aguentar, porque não dá para dizer se aquilo acabou ou se ainda nem começou — ' +
    'e você fica sem saber se arruma ou se espera. Este aqui está exatamente aí, parado.',
};

// ---------------------------------------------------------------------------
// OS PARÁGRAFOS DE RECIBO — compartilhados pelas três fases, e sempre DEPOIS
// da abertura de vida real
// ---------------------------------------------------------------------------
const RECIBO_PTOLOMEU =
  `Os dois estados têm nome, e o nome é velho. ${PTOLOMEU} escreveu um capítulo inteiro só sobre isso no Tetrabiblos I.24, ${SEC_II} — ` +
  `o título é "Of Applications and Separations and the Other Powers". A frase: "${VERBATIM.ptolomeuI24.texto}" ` +
  `O que vem antes se APLICA ao que vem depois; o que vem depois se SEPARA do que veio antes. ` +
  `Daí os dois termos que o app usa: aplicativo, o ângulo que ainda vai fechar, e separativo, o que já fechou e está abrindo.`;

const RECIBO_VALENTE =
  `E aqui está o buraco na definição de ${PTOLOMEU}, que vale mais citar do que esconder: ela é POSICIONAL. Quem vem antes na ordem dos signos se aplica a quem vem depois — ` +
  `e isso só funciona se o planeta andar para a frente. Visto daqui, ele anda para trás com frequência. Quem registrou o caso foi ${VALENTE}, na Anthologiae IX.3, do mesmo ${SEC_II}, ` +
  `falando de um Júpiter em marcha retrógrada: "${VERBATIM.valenteJupiterRetrogrado.texto}" — sendo levado NA DIREÇÃO do ponto, e não se afastando dele. ` +
  `Este app segue ${VALENTE} e mede o movimento, não a ordem dos signos. Fizemos a conta dos dois jeitos em 66.445 aspectos entre 2020 e 2029: ` +
  `os dois critérios discordam em pouco mais de um a cada oito, e as discordâncias são, sem uma única exceção, planeta retrógrado.`;

const RECIBO_DATA =
  `Uma última coisa, e ela é sobre o que este prazo NÃO é. O ângulo fecha na hora que a conta diz, e isso é astronomia: qualquer efeméride confere. ` +
  `Já a ideia de que o dia do ângulo exato seja o dia de um acontecimento não vem de fonte antiga nenhuma — é do ${SEC_XX} e nasceu junto com o software de efeméride barato. ` +
  `${VALENTE}, que é quem mais usa trânsito na antiguidade, o lê como gatilho de um período que outro fator já governava, nunca sozinho: ` +
  `"Be aware of the transits of the stars and their changes of sign at the various chronocratorships" (Anthologiae IX.3).`;

const RECIBO_ESTACOES =
  `A tradição antiga tem o que dizer sobre planeta parado, e é modesto. ${VALENTE}, Anthologiae IV.14, ${SEC_II} — o capítulo se chama "The Phases and Transits of the Stars": ` +
  `"${VERBATIM.valenteEstacoes.texto}" Atraso na primeira parada, atraso cancelado na segunda. É isso que a fonte diz, e só isso.`;

// ---------------------------------------------------------------------------
// BLOCO 2 — A LEITURA. Abre na vida real e fecha com o recibo. Sempre.
// ---------------------------------------------------------------------------
const ABERTURA_COMUM =
  'A diferença entre uma coisa que está chegando e uma coisa que já passou é a informação mais útil que alguém pode receber sobre o próprio dia — e quase ninguém a recebe. ' +
  'Chegando, você ainda escolhe como recebe. Já passou, o que sobra é arrumar o que ficou. São dois avisos diferentes, e a maioria dos apps entrega o mesmo texto para os dois.';

function comoOAppMede(c) {
  return (
    `A conta é fácil de conferir: o app olha onde ${c.transitoNome} está hoje, olha onde estará amanhã, e vê se o vão até o encontro com ${c.natalNome} do seu mapa de nascimento ` +
    `encolheu ou cresceu. É a mesma efeméride do Mapa Astral, sem tabela e sem chute.`
  );
}

const LEITURA = {
  aplicativo: (c) =>
    ABERTURA_COMUM +
    `\n\n` +
    `Hoje é o primeiro caso: ${c.transitoNome} está a ${graus(c.residuoGraus)} do ângulo exato com ${c.natalNome} do seu mapa de nascimento, e essa distância está diminuindo. ` +
    `${PRAZO(c)} ${comoOAppMede(c)}` +
    `\n\n` +
    RECIBO_PTOLOMEU +
    `\n\n` +
    RECIBO_VALENTE +
    `\n\n` +
    RECIBO_DATA,
  separativo: (c) =>
    ABERTURA_COMUM +
    `\n\n` +
    `Hoje é o segundo caso: ${c.transitoNome} JÁ passou pelo ângulo exato com ${c.natalNome} do seu mapa de nascimento — está a ${graus(c.residuoGraus)} dele agora, e essa distância está crescendo. ` +
    `${PRAZO(c)} ${comoOAppMede(c)}` +
    `\n\n` +
    RECIBO_PTOLOMEU +
    `\n\n` +
    RECIBO_VALENTE +
    `\n\n` +
    RECIBO_DATA,
  estacionario: (c) =>
    'Tem momento em que nada se move. Não é bom nem ruim: é sem resposta. Você não sabe se arruma o que ficou ou se espera o que vem, porque não dá para dizer qual dos dois é. ' +
    'Aguentar isso é diferente de aguentar uma coisa difícil que anda.' +
    `\n\n` +
    `Hoje é esse caso, e ele é literal: ${c.transitoNome} praticamente não se moveu no céu — andou ${graus(c.movimentoDiario, 4)} em vinte e quatro horas. ` +
    `Com o planeta sem se mover, o ângulo com ${c.natalNome} do seu mapa de nascimento não está encolhendo nem crescendo, e o app não escolhe um verbo por você. ` +
    `O que dá para dizer é a distância: ${graus(c.residuoGraus)} até o encontro exato. ${comoOAppMede(c)}` +
    `\n\n` +
    RECIBO_ESTACOES +
    `\n\n` +
    RECIBO_PTOLOMEU +
    `\n\n` +
    RECIBO_DATA,
};

// ---------------------------------------------------------------------------
// O PRAZO — "quanto falta" ou "quanto faz". Nunca inventado.
// ---------------------------------------------------------------------------
function PRAZO(c) {
  if (c.fase === 'estacionario') {
    return `Sem prazo: com ${c.transitoNome} sem se mover no céu, a conta dividiria por quase zero, e o app não põe número em cima disso.`;
  }
  if (!c.dentroDoHorizonte) {
    return (
      `O app não põe prazo neste: a estimativa passa de ${c.horizonte} dias, e é aí que a conta deixa de se sustentar. ` +
      `O que dá para dizer é medida, não projeção — ${graus(c.residuoGraus)} separam ${c.transitoNome} do ângulo exato agora, e o movimento de hoje é de ${graus(c.movimentoDiario, 3)} por dia.`
    );
  }
  if (c.diasParaExato > 0) {
    return c.exatoNoDia
      ? `O ângulo exato fecha hoje, daqui a ${duracao(c.diasParaExato)}.`
      : `O ângulo exato fecha em ${duracao(c.diasParaExato)}.`;
  }
  return c.exatoNoDia
    ? `O ângulo exato fechou hoje, faz ${duracao(c.diasParaExato)}.`
    : `O ângulo exato fechou faz ${duracao(c.diasParaExato)}.`;
}

// ---------------------------------------------------------------------------
// A LINHA ÚNICA — o que a tela pendura embaixo do card que o Céu de Hoje já
// desenha, sem abrir a leitura inteira
// ---------------------------------------------------------------------------
const LINHA_CURTA = {
  aplicativo: (c) =>
    c.dentroDoHorizonte
      ? `Está se formando: o ângulo exato fecha em ${duracao(c.diasParaExato)}.`
      : `Está se formando: faltam ${graus(c.residuoGraus)} para o ângulo exato.`,
  separativo: (c) =>
    c.dentroDoHorizonte
      ? `Já está se desfazendo: o ângulo exato fechou faz ${duracao(c.diasParaExato)}.`
      : `Já está se desfazendo: passou do ângulo exato faz ${graus(c.residuoGraus)}.`,
  estacionario: (c) =>
    `Sem movimento: ${c.transitoNome} praticamente não andou nas últimas vinte e quatro horas, e o ângulo não está nem fechando nem abrindo.`,
};

// ---------------------------------------------------------------------------
// AS RESSALVAS QUE ANDAM JUNTO COM TODA LEITURA
// ---------------------------------------------------------------------------
const NOTA_MARCHA = {
  direto: (c) =>
    `Hoje ${c.transitoNome} está em marcha direta: andou ${graus(c.movimentoDiario, 3)} para a frente nas últimas vinte e quatro horas. ` +
    `Nesse caso a ordem dos signos e o movimento real dizem a mesma coisa, e os dois critérios da tradição concordam.`,
  retrogrado: (c) =>
    `Hoje ${c.transitoNome} está em marcha retrógrada: andou ${graus(c.movimentoDiario, 3)} PARA TRÁS nas últimas vinte e quatro horas. ` +
    `É o caso em que o verbo se inverte — o que estava indo embora volta, o que estava chegando se afasta — e é onde este app deixa a definição posicional de ${PTOLOMEU} (Tetrabiblos I.24) ` +
    `e segue a de ${VALENTE} (Anthologiae IX.3), que é a que olha o movimento. ` +
    `Sobre a marcha para trás em si, o que a fonte antiga diz é uma coisa só e é modesta: "If the stars are passed the first stationary point and are found to be retrograde, they delay expectations, actions, profits, and enterprises" ` +
    `(${VALENTE}, Anthologiae IV.14, ${SEC_II}). Atraso. E a segunda parada cancela o atraso — "they cancel any delay and reinstate the same activities" —, ` +
    `que é a metade que o folclore moderno cortou fora.`,
};

const NOTA_HORIZONTE = (c) =>
  `Por que não há data aqui. O prazo sai de uma reta traçada com vinte e quatro horas de movimento, e ela só se sustenta perto do encontro. ` +
  `Conferimos contra a efeméride real em 3.735 aspectos: até três dias o erro mediano ficou abaixo de uma hora; de uma semana em diante ele chega a passar de um mês, ` +
  `porque o planeta muda de velocidade e pode parar e voltar antes de chegar lá. Fora dos ${c.horizonte} dias o app diz grau, que é medida, e cala sobre dia, que seria projeção.`;

const NOTA_ORBE =
  `De quem é o orbe desta tela — orbe é a distância a partir da qual o app considera que o ângulo já conta. ` +
  `É convenção moderna nossa, não da fonte: ${PTOLOMEU} não dá orbe nenhum (em Tetrabiblos I.13, ${SEC_II}, os aspectos são entre signos inteiros), ` +
  `e em I.24 a condição é só "when the interval between them is not great" — que não é grau. ` +
  `Na tradição posterior o orbe pertence ao PLANETA e não ao aspecto, e quem tabula isso é William Lilly, Christian Astrology, Livro I, p. 107, Londres, ${ANO_LILLY}.`;

const NOTA_LEITURA_DO_APP =
  `O que é conta e o que é leitura. A conta: o app pega a posição do planeta hoje, a mesma posição amanhã e a posição do seu mapa de nascimento, com efeméride de verdade, ` +
  `e vê se o vão até o ângulo exato encolheu ou cresceu. Isso é astronomia, e qualquer efeméride confere. ` +
  `A leitura: chamar um estado de aplicativo e o outro de separativo é ${PTOLOMEU} (Tetrabiblos I.24) e ${VALENTE} (Anthologiae IX.3), os dois do ${SEC_II}. ` +
  `Escolher o movimento real em vez da ordem dos signos, quando os dois discordam, é escolha deste app — declarada aqui em vez de escondida. ` +
  `E o que o app NÃO diz: que um dos dois estados vale mais que o outro. A astrologia moderna repete isso o tempo todo; esta base não achou a linha antiga que autorize, ` +
  `e a lacuna fica declarada em vez de preenchida.`;

const NOTA_DATA_DE_EVENTO =
  `O que este prazo não é. O ângulo fecha na hora que a conta diz — isso é astronomia e dá para conferir. ` +
  `Que o dia do ângulo exato seja o dia de um acontecimento é ideia do ${SEC_XX}, nascida junto com o software de efeméride barato, e não está em fonte antiga nenhuma. ` +
  `${VALENTE} lê o trânsito como gatilho de um período que outro fator já governava, nunca sozinho: ` +
  `"Be aware of the transits of the stars and their changes of sign at the various chronocratorships" (Anthologiae IX.3, trad. Riley, ${SEC_II}).`;

// ---------------------------------------------------------------------------
// A BIBLIOGRAFIA
// ---------------------------------------------------------------------------
const FONTES = [
  `${PTOLOMEU}, Tetrabiblos I.24, "Of Applications and Separations and the Other Powers" (trad. F. E. Robbins, Loeb/Harvard, 1940), ${SEC_II} — a definição dos dois estados: o que precede se aplica, o que segue se separa`,
  `${VALENTE}, Anthologiae IX.3 (trad. Mark T. Riley), ${SEC_II} — o Júpiter em marcha retrógrada "being carried towards the position of the Ascendant": a fonte antiga que registra o caso que a definição posicional não cobre`,
  `${VALENTE}, Anthologiae IV.14, "The Phases and Transits of the Stars" (trad. Riley), ${SEC_II} — as estações: atraso na primeira, atraso cancelado na segunda`,
  `${VALENTE}, Anthologiae IX.3 (trad. Riley), ${SEC_II} — "Be aware of the transits of the stars and their changes of sign at the various chronocratorships": na fonte, o trânsito é gatilho e quem define o assunto é o senhor do tempo`,
  `${PTOLOMEU}, Tetrabiblos I.13, ${SEC_II} — os quatro aspectos, e a ausência de qualquer orbe: em ${PTOLOMEU} o aspecto é entre signos inteiros`,
  `William Lilly, Christian Astrology, Livro I, p. 107, Londres, ${ANO_LILLY} — a tabela de orbes e a regra da metade: na tradição posterior o orbe pertence ao planeta, não ao aspecto`,
];

// ---------------------------------------------------------------------------
// O QUE FALTA, E ONDE RESOLVER — o app nunca deixa beco sem saída
// ---------------------------------------------------------------------------
const FALTA = {
  data: {
    texto:
      'Sem a data de nascimento não há mapa com que comparar o céu de hoje, e é dessa comparação que sai tudo: se o ângulo está se formando ou se já se desfez. O app prefere não mostrar nada a mostrar um mapa inventado.',
    comoResolver: 'Informe sua data de nascimento no Mapa Astral.',
  },
  aspecto: {
    texto:
      'Não deu para reconhecer o aspecto informado. Esta leitura trabalha em cima de um encontro entre um planeta do céu de hoje e um ponto do seu mapa de nascimento, com um dos cinco ângulos que o app calcula — e sem os três nomes não há o que medir.',
    comoResolver: 'Abra o Céu de hoje pra você a partir do Mapa Astral, que é de onde estes aspectos saem.',
  },
  efemeride: {
    texto:
      'As posições do céu não puderam ser calculadas agora. Sem elas não há como comparar a posição de hoje com a de amanhã, que é a conta inteira desta leitura. O app prefere não mostrar nada a mostrar um céu inventado.',
    comoResolver: 'Tente de novo em instantes, no Mapa Astral.',
  },
  horaParaLuaNatal: {
    texto:
      'Falta a hora de nascimento, e aqui ela não é detalhe. Este encontro toca a sua Lua de nascimento, e a Lua é o único ponto do mapa que anda depressa: até 7,69 graus em vinte e quatro horas — mais do que a distância inteira que esta tela considera. ' +
      'Sem a hora, o app usaria meio-dia. Medimos o que isso faz: comparando a Lua natal de meio-dia com a de meia-noite e a de 23h59 em 6.334 encontros, das 12.668 comparações 10.054 saíram de alcance, 2.613 continuaram em alcance mas viraram o verbo, e exatamente uma sobreviveu igual. ' +
      'Dizer "está se formando" em cima disso seria cara ou coroa com cara de conta.',
    comoResolver: 'Informe a hora de nascimento no Mapa Astral — é o mesmo campo que destrava o Ascendente.',
  },
};

// ---------------------------------------------------------------------------
// O CHROME DA TELA — tudo que a VITRINE desenha em volta da leitura
// ---------------------------------------------------------------------------
// Criado em 01/08/2026, quando este módulo entrou em
// screens/CalendarioCosmicoScreen.js. A tela não redige uma linha: título,
// cabeçalho, rótulos, avisos e texto de compartilhar nascem aqui e existem nos
// TRÊS packs com paridade exata de chaves.
//
// O bloco se chama `chrome` e não `tela` porque `tela` já é, neste pack, o NOME
// da tela no idioma ('Mapa Astral'), usado pelo campo `comoResolver` de FALTA —
// renomear quebraria a trava de test/transitoFase.test.js que cobra o nome da
// tela em cada idioma.
//
// Valem aqui todas as regras do cabeçalho de lib/transitoFase.js — inclusive a
// mais difícil: NÃO COMPLETAR A LACUNA. Nenhuma string deste bloco diz que um
// dos dois estados vale mais que o outro.
const LINK_COMPARTILHAR = 'https://cosmicguide.cloud/cosmic-guide/';

// O cabeçalho do card: quem é o planeta de hoje, quem é o ponto de nascimento.
function tituloDoCard(r) {
  return `${r.transitoRotulo} de hoje × ${r.natalRotulo} de nascimento`;
}

// O ângulo, em número, embaixo do título. Vem vazio quando o aspecto não foi
// reconhecido — e nesse caso a tela simplesmente não desenha a linha.
function subtituloDoCard(r) {
  if (!r.aspectoNome || typeof r.angulo !== 'number') return '';
  return `${r.aspectoNome} · ${r.angulo}°`;
}

// O compartilhável fecha no link, como em lib/idadeReal.js e lib/mitos.js. Sem
// leitura disponível não há o que compartilhar — e aí devolve vazio em vez de
// um print com metade da frase.
function textoCompartilhavel(r) {
  if (!r || !r.disponivel) return '';
  return [
    tituloDoCard(r),
    r.linhaCurta,
    `O nome disso na tradição é ${r.faseTermo}.`,
    `${PTOLOMEU}, Tetrabiblos I.24, ${SEC_II} — o capítulo que separa os dois estados.`,
    LINK_COMPARTILHAR,
  ].join('\n');
}

const CHROME = {
  marca: 'cosmicguide.cloud',
  kicker: 'Chegando ou indo embora',
  titulo: 'A direção dos encontros de hoje',
  intro:
    'Duas coisas podem estar à mesma distância de hoje e não ter nada em comum: a conversa marcada para depois de amanhã e a discussão que acabou anteontem. ' +
    'Uma ainda vai chegar; a outra já foi, e o que sobrou dela é rastro. De que lado a coisa está muda o que se faz com ela — e é justamente isso que quase nenhum app diz.',
  porQue:
    'O calendário aí em cima marca o dia dos encontros do céu com ele mesmo. Esta parte é outra: ela olha o céu de hoje contra o seu mapa de nascimento e diz a DIREÇÃO de cada encontro. ' +
    'O ângulo que ainda vai fechar e o que já fechou e está abrindo aparecem com a MESMA distância em graus — o que os separa é o sinal, e é o sinal que dá o verbo.',
  divergencia:
    `Os dois estados têm nome desde o ${SEC_II}, e existe um capítulo inteiro só sobre eles: ${PTOLOMEU}, Tetrabiblos I.24, "Of Applications and Separations and the Other Powers" (trad. Robbins). ` +
    `Só que as duas fontes do mesmo século não dizem a mesma coisa. ${PTOLOMEU} define por POSIÇÃO — o que vem antes se aplica ao que vem depois —, e isso só fecha se o planeta andar sempre para a frente. ` +
    `${VALENTE}, Anthologiae IX.3, registra o caso que sobra: um Júpiter em marcha retrógrada "is being carried towards the position of the Ascendant" — indo na direção do ponto, de costas. ` +
    `Este app mede o movimento e segue ${VALENTE}; onde os dois critérios discordam, o planeta está retrógrado, sem uma única exceção na varredura que fizemos. A escolha fica escrita aqui em vez de escondida.`,
  rotuloLista: 'Um a um, com a direção',
  abrir: 'Ver a leitura inteira',
  fechar: 'Fechar a leitura',
  rotuloRecibo: 'De onde isso vem',
  rotuloVerbatim: 'As fontes, palavra por palavra',
  rotuloNotas: 'O que é conta e o que é leitura',
  compartilhar: 'Compartilhar',
  copiado: 'Copiado. É só colar onde quiser.',
  naoCopiou: 'Não deu para copiar por aqui. Selecione o texto acima e copie à mão.',
  semAspectos:
    'Hoje nenhum planeta do céu está perto o bastante de um ponto do seu mapa de nascimento para esta leitura. ' +
    'Não é falta de dado: é um dia sem encontro dentro do alcance que o app usa, e amanhã a lista muda sozinha.',
  semNascimento: {
    texto:
      'Esta parte só existe com a sua data de nascimento: ela compara o céu de hoje com o mapa do seu nascimento e diz de que lado do encontro cada planeta está. ' +
      'Sem a data, o app prefere não mostrar nada a mostrar um mapa inventado.',
    cta: 'Informar no Mapa Astral',
  },
  bloqueado: {
    titulo: 'O primeiro é aberto. O resto vem com o plano.',
    texto:
      'O encontro mais exato do dia fica sempre aberto aqui. Os outros do seu céu de hoje, cada um com a sua direção e as fontes inteiras, ficam na assinatura.',
    cta: 'Ver os planos',
  },
  // O selo curto do card fechado. É rótulo de leitura, e os três são só estado
  // — nenhum deles carrega valor sobre o outro.
  selo: {
    aplicativo: 'Chegando',
    separativo: 'Indo embora',
    estacionario: 'Parado',
  },
  tituloDoCard,
  subtituloDoCard,
  textoCompartilhavel,
};

export const PACK = {
  idioma: 'pt',
  tela: 'Mapa Astral',
  telaCeu: 'Céu de hoje pra você',
  chrome: CHROME,
  formatarGraus,
  graus,
  duracao,
  planetas: PLANETAS,
  planetasFrase: PLANETAS_FRASE,
  aspectos: ASPECTOS,
  faseNome: FASE_NOME,
  faseTermo: FASE_TERMO,
  chamada: CHAMADA,
  leitura: LEITURA,
  prazo: PRAZO,
  linhaCurta: LINHA_CURTA,
  notaMarcha: NOTA_MARCHA,
  notaHorizonte: NOTA_HORIZONTE,
  notaOrbe: NOTA_ORBE,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaDataDeEvento: NOTA_DATA_DE_EVENTO,
  verbatim: VERBATIM,
  fontes: FONTES,
  falta: FALTA,
};

export default PACK;
