// lib/traducoes/luaForaDeCurso.pt.js
// O PACK PORTUGUÊS da Lua fora de curso. TODO texto que o usuário lê mora aqui;
// o motor (busca de instante exato, geometria das duas definições) mora em
// lib/luaForaDeCurso.js. Os packs irmãos (.es.js e .en.js) repetem exatamente
// esta FORMA: mesmas chaves, mesmas funções com a mesma assinatura.
//
// TODAS as regras do cabeçalho de lib/luaForaDeCurso.js valem para cada string
// deste arquivo, e as três que mais mordem aqui:
//
//   • NENHUMA ORDEM À PESSOA. Nada de "não assine", "evite", "aproveite para".
//     O app descreve o céu (que é conta) e descreve o que cada autor escreveu
//     (que é citação). A decisão é de quem lê, e o texto termina dizendo isso.
//   • O CONSELHO DE AGENDA NÃO É ANTIGO. Quem o criou tem nome e data: Al H.
//     Morrison, a partir de ~1970. Em Lilly (1647) o critério julga uma
//     PERGUNTA de astrologia horária.
//   • CITAÇÃO NÃO SE TRADUZ. O inglês de Lilly e o de Morrison são idênticos
//     nos três packs; a paráfrase ao lado é do app e vem sem aspas.
//
// O PT é ouro: test/luaForaDeCurso.test.js compara as saídas byte a byte com o
// que está escrito aqui. Mudar uma vírgula é quebrar o build — de propósito.

// ---------------------------------------------------------------------------
// NOMES — as CHAVES são dado (PT, iguais nos três packs); só o valor localiza
// ---------------------------------------------------------------------------
const SIGNOS = {
  'Áries': 'Áries',
  'Touro': 'Touro',
  'Gêmeos': 'Gêmeos',
  'Câncer': 'Câncer',
  'Leão': 'Leão',
  'Virgem': 'Virgem',
  'Libra': 'Libra',
  'Escorpião': 'Escorpião',
  'Sagitário': 'Sagitário',
  'Capricórnio': 'Capricórnio',
  'Aquário': 'Aquário',
  'Peixes': 'Peixes',
};

const PLANETAS = {
  'Sol': 'Sol',
  'Mercúrio': 'Mercúrio',
  'Vênus': 'Vênus',
  'Marte': 'Marte',
  'Júpiter': 'Júpiter',
  'Saturno': 'Saturno',
};

const ASPECTOS = {
  conjuncao: 'Conjunção',
  sextil: 'Sextil',
  quadratura: 'Quadratura',
  trigono: 'Trígono',
  oposicao: 'Oposição',
};

// Glosa na primeira aparição: o termo técnico nunca entra sozinho.
const ASPECTOS_COM_GLOSA = {
  conjuncao: 'uma conjunção (os dois no mesmo grau do zodíaco)',
  sextil: 'um sextil (60° entre os dois)',
  quadratura: 'uma quadratura (90° entre os dois)',
  trigono: 'um trígono (120° entre os dois)',
  oposicao: 'uma oposição (180°, um bem em frente ao outro)',
};

// A forma que entra no meio da frase, com artigo e adjetivo concordando. Existe
// porque em português (e em espanhol) o gênero muda de aspecto para aspecto:
// «uma conjunção exata», mas «um sextil exato». Sem esta tabela, ou o texto
// erra a concordância ou perde o adjetivo.
const ASPECTOS_EXATO = {
  conjuncao: 'uma conjunção exata',
  sextil: 'um sextil exato',
  quadratura: 'uma quadratura exata',
  trigono: 'um trígono exato',
  oposicao: 'uma oposição exata',
};

// ---------------------------------------------------------------------------
// FORMATAÇÃO — cada idioma escreve número do jeito dele
// ---------------------------------------------------------------------------
function dur(h) {
  const min = Math.round((h || 0) * 60);
  if (min < 1) return 'menos de um minuto';
  if (min < 60) return `${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  const horas = Math.floor(min / 60);
  const resto = min % 60;
  if (resto === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas}h${String(resto).padStart(2, '0')}`;
}

function graus(g) {
  return `${(g || 0).toFixed(1).replace('.', ',')}°`;
}

// O que fecha a janela em cada régua, dito em língua de conversa.
function fimDaRegua(c) {
  return c.definicaoId === 'porfirio' ? 'andar 30°' : 'trocar de signo';
}

// ---------------------------------------------------------------------------
// AS DUAS RÉGUAS
// ---------------------------------------------------------------------------
const DEFINICOES = {
  moderna: {
    nome: 'por fronteira de signo',
    // `naFrase` é a mesma coisa flexionada para caber depois de «a régua ___».
    // Cada idioma resolve isso do jeito dele: o inglês, por exemplo, não usa
    // preposição nenhuma nessa posição.
    naFrase: 'da fronteira de signo',
    criterio:
      'a Lua está fora de curso quando não fecha mais nenhum ângulo exato com os outros seis antes de trocar de signo',
    autor: 'William Lilly',
    seculo: '1647',
    locus: 'William Lilly, Christian Astrology, Londres, 1647, p. 112',
    quemUsa:
      'é a régua das tabelas de «dia livre» que circulam hoje, levada ao grande público por Al H. Morrison a partir de ~1970',
    porQueEssa:
      'A tela abre nesta porque é a que você já viu em algum lugar. A outra fica do lado, calculada também, porque as duas existem e não dão o mesmo período.',
  },
  porfirio: {
    nome: 'pelos 30° seguintes',
    naFrase: 'dos 30° seguintes',
    criterio:
      'a Lua está fora de curso quando não fecha nenhum ângulo exato com os outros seis nos 30° seguintes do caminho dela — e fronteira de signo não entra na conta',
    autor: 'Porfírio de Tiro (a primeira definição conhecida é de Antíoco de Atenas)',
    seculo: 'séc. III d.C. (Antíoco, séc. II)',
    locus:
      'Porfírio de Tiro, Introdução ao Tetrabiblos, séc. III (trad. James H. Holden, Porphyry the Philosopher, AFA, 2009); Antíoco de Atenas, séc. II, em Eduardo Gramaglia, Astrología Hermética, p. 188',
    quemUsa: 'é a definição helenística, a mais antiga que se conhece — e quase nenhum app usa',
    porQueEssa:
      'Esta é a régua antiga, e ela é mais exigente que a moderna: pede 30° limpos de caminho, não só o pedaço que ainda falta até a troca de signo.',
  },
};

// ---------------------------------------------------------------------------
// CITAÇÕES — inglês verbatim, idêntico nos três packs; paráfrase é nossa
// ---------------------------------------------------------------------------
const VERBATIM = {
  lilly: {
    texto:
      'A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other.',
    parafrase:
      'Um planeta está fora de curso quando acabou de se separar de outro e não vai, logo em seguida, aplicar a nenhum outro enquanto estiver naquele signo.',
    locus: 'William Lilly, Christian Astrology, Londres, 1647, p. 112',
  },
  // A citação de Morrison entra CORTADA de propósito, e o corte está declarado
  // na paráfrase: a lista de práticas que ele enumera está no documento de
  // pesquisa (doc 04 §3.4) e não tem por que aparecer num app. O que interessa
  // aqui é a moldura — é ela que prova a virada de horária para agenda.
  morrison: {
    texto:
      'Every couple of days there comes a time which is best used to subjective, spiritual non-material concerns…',
    parafrase:
      'A cada dois dias, mais ou menos, chega um período que ele descreve como melhor aproveitado em coisas subjetivas e não materiais. A citação está cortada de propósito: a lista de práticas que ele dá em seguida está no documento de pesquisa, e um app não é lugar de sugerir prática nenhuma a ninguém.',
    locus: 'Al H. Morrison, The Void of Course Moon, a partir de ~1970',
  },
};

// ---------------------------------------------------------------------------
// BLOCO 1 — A ABERTURA. Vida real primeiro, fonte depois (nunca o contrário)
// ---------------------------------------------------------------------------
function abertura(c) {
  if (c.foraDeCurso) {
    // O trecho vazio é OUTRO em cada régua, e a abertura não pode empurrar o
    // signo para dentro da conta de Porfírio, que não fala de signo nenhum.
    const trecho = c.definicaoId === 'porfirio'
      ? `a Lua tem 30° inteiros de caminho pela frente, de ${c.signo} em diante,`
      : `a Lua atravessa o resto de ${c.signo}`;
    return `Sabe aquele print que aparece toda semana — «não assine nada agora, a Lua está fora de curso»? Ele nasce desta conta. Neste momento ${trecho} sem fechar mais nenhum ângulo exato com nenhum dos outros seis corpos que a astrologia antiga acompanhava: um trecho de caminho sem encontro marcado. Os gregos chamavam isso de kenodromia — correr no vazio.`;
  }
  return `Sabe aquele print que aparece toda semana — «não assine nada agora, a Lua está fora de curso»? Ele nasce desta conta, e neste momento ela dá o contrário: a Lua tem encontro marcado. Daqui a ${dur(c.horasAteProximo)} ela fecha ${c.aspectoExato} com ${c.planeta}, antes de ${fimDaRegua(c)}. Enquanto há encontro à frente, ela não está correndo no vazio — que é o que os gregos chamavam de kenodromia.`;
}

function estado(c) {
  if (c.foraDeCurso) {
    const fim = c.definicaoId === 'porfirio'
      ? 'faltarem 30° de caminho para o próximo encontro'
      : `ela entrar em ${c.proximoSigno}`;
    return `Leitura do app, pela régua ${c.definicaoNaFrase}: a Lua está fora de curso. O trecho começou ${dur(c.horasDecorridas)} atrás, quando ela fechou ${c.aspectoAnteriorExato} com ${c.planetaAnterior}, e segue até ${fim} — mais ${dur(c.horasQueFaltam)}.`;
  }
  return `Leitura do app, pela régua ${c.definicaoNaFrase}: a Lua não está fora de curso agora. O último encontro dela foi ${c.aspectoAnteriorExato} com ${c.planetaAnterior}, ${dur(c.horasDesdeAnterior)} atrás, e o próximo chega antes de ela ${fimDaRegua(c)}.`;
}

function janela(c) {
  if (c.foraDeCurso) {
    if (c.definicaoId === 'porfirio') {
      return `A janela inteira dura ${dur(c.horasDeJanela)}: vai do encontro com ${c.planetaAnterior} até o ponto em que faltam 30° de caminho para o próximo. Onde a Lua troca de signo no meio disso não importa aqui — Porfírio não fala de signo nenhum.`;
    }
    return `A janela inteira dura ${dur(c.horasDeJanela)}: vai do encontro com ${c.planetaAnterior} até a entrada em ${c.proximoSigno}. Assim que ela troca de signo, a conta recomeça do zero.`;
  }
  if (c.temJanelaFutura) {
    return `Agora não há janela aberta. A próxima começa daqui a ${dur(c.horasAteJanela)} e dura ${dur(c.horasDeJanelaFutura)}.`;
  }
  const d = c.diasVarridos;
  return `Agora não há janela aberta — e nos próximos ${d} ${d === 1 ? 'dia' : 'dias'}, que é até onde esta varredura foi, também não aparece nenhuma por esta régua.`;
}

function proximoEncontro(c) {
  const onde = c.proximoNoSignoAtual
    ? `Ele se fecha ainda em ${c.signo}.`
    : `Ele só se fecha depois que ela entra em ${c.proximoSigno}.`;
  // A observação sobre a discordância só entra quando as duas réguas REALMENTE
  // discordam agora. Sem esta guarda, o texto anunciava divergência em instante
  // de concordância — e afirmação que não corresponde à conta é o defeito que
  // este app existe pra não ter.
  const nota = !c.proximoNoSignoAtual && c.divergem
    ? ' E é justamente esse detalhe que faz as duas réguas discordarem agora.'
    : '';
  return `O próximo ângulo exato é ${c.aspectoComGlosa} com ${c.planeta}: daqui a ${dur(c.horasAteProximo)}, depois de mais ${graus(c.grausAteProximo)} de caminho da Lua. ${onde}${nota}`;
}

// A RELAÇÃO FIXA entre as duas réguas é aritmética, e é conferível na tela: o
// pedaço que falta até a troca de signo nunca passa de 30°.
const RELACAO_FIXA =
  'A relação entre elas é fixa e dá pra conferir: tudo que a régua dos 30° chama de vazio, a de fronteira de signo também chama — nunca o contrário, porque o pedaço que falta até a troca de signo nunca passa de 30°.';

function divergencia(c) {
  if (!c.divergem) {
    if (c.foraDeCurso) {
      return `Neste instante as duas réguas dizem a mesma coisa: as duas veem a Lua correndo no vazio. ${RELACAO_FIXA}`;
    }
    return `Neste instante as duas réguas dizem a mesma coisa: nenhuma das duas vê vazio agora. ${RELACAO_FIXA}`;
  }
  const sim = c.foraDeCurso ? c.definicaoNaFrase : c.outraDefinicaoNaFrase;
  const nao = c.foraDeCurso ? c.outraDefinicaoNaFrase : c.definicaoNaFrase;
  return `Neste instante as duas réguas discordam: a régua ${sim} diz que a Lua está fora de curso, e a régua ${nao} diz que não. Não é erro de conta — são dois critérios com uns 1.400 anos entre um e outro, recortando o mesmo dia de jeitos diferentes. ${RELACAO_FIXA} É por isso que a mesma noite aparece como «dia livre» num app e como noite comum em outro.`;
}

// ---------------------------------------------------------------------------
// BLOCO 2 — DE ONDE VEM. Tudo aqui carrega obra, autor e século
// ---------------------------------------------------------------------------
const RECIBO = {
  moderna:
    'A régua que está na tela é a da fronteira de signo, que é a das tabelas de «dia livre». Ela vem de William Lilly, Christian Astrology, Londres, 1647, p. 112: "A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other." Repare no "during his being in that Signe" — é exatamente aí que o signo entra na definição. Nos gregos ele não estava.',
  porfirio:
    'A régua que está na tela é a antiga: Porfírio de Tiro, séc. III, na Introdução ao Tetrabiblos, mede pelos 30° seguintes do caminho da Lua e não menciona fronteira de signo nenhuma. A primeira definição conhecida é ainda mais velha — Antíoco de Atenas, séc. II —, e Gramaglia (Astrología Hermética, p. 188) registra nele uma variante medida em tempo: um dia e uma noite, uns 13° de arco.',
};

// 📐 MEDIÇÃO DO APP, e está rotulada como tal na última frase. Os números saem
// de janelasForaDeCurso() varrendo 2026 inteiro, e test/luaForaDeCurso.test.js
// os refaz a cada build: se a conta mudar, o texto quebra o teste em vez de
// mentir em silêncio.
const O_QUANTO_ISSO_MUDA =
  'E dá pra medir o tamanho da diferença, em vez de só dizer que ela existe. Rodando 2026 inteiro neste mesmo motor: pela régua da fronteira de signo são 159 janelas no ano, e a Lua passa 23,6% do tempo fora de curso — quase um quarto. Pela régua dos 30° de Porfírio são 5 janelas no ano todo, 0,65% do tempo. A mesma expressão, nas duas pontas da tradição, descreve uma coisa cotidiana e uma coisa rara. Isto é medição deste app, não afirmação de fonte antiga.';

const COMO_O_MERCADO_USA =
  'O conselho de agenda não é antigo, e vale saber de onde ele veio. Em Lilly, 1647, «fora de curso» é julgamento de astrologia horária: responde a uma pergunta feita ao astrólogo e sinaliza que nada virá daquele assunto. Quem transformou isso em regra de dia a dia foi Al H. Morrison (1916–1995), que a partir de ~1970 publicou tabelas de Void-of-Course Moon e levou o assunto ao grande público. O astrólogo contemporâneo Anthony Louis (2013 e 2021) sustenta que essa leitura é um mal-entendido de Lilly. As três posições estão aqui porque as três existem; o que fazer com elas é decisão de quem lê.';

const O_QUE_NAO_SE_ACHOU =
  'E o que a pesquisa não achou fica dito: nenhum texto antigo manda deixar de começar coisas com a Lua fora de curso. Também não achamos quem trocou o critério dos 30° pelo da fronteira de signo — a virada acontece em algum ponto entre Fírmico Materno (séc. IV) e Mashallah e Abu Ma\'shar (séc. VIII–IX), e o texto que a documentaria não foi localizado.';

const OS_SETE_E_OS_TRES =
  'A conta usa os sete corpos da astrologia antiga: a Lua e os seis com quem ela pode se encontrar — Sol, Mercúrio, Vênus, Marte, Júpiter e Saturno. Urano, Netuno e Plutão ficam de fora porque nenhuma das definições citadas aqui os conhecia: Urano só foi visto em 1781. Isso muda o resultado, e a direção da mudança é aritmética — corpo a mais só pode acrescentar encontro, e encontro a mais só pode encurtar janela. Um app que some os três modernos mostra períodos menores que os daqui.';

const NOTA_CONJUNCAO =
  'Um detalhe que o app não esconde: Ptolomeu enumera quatro aspectos (oposição, trígono, quadratura e sextil) e a conjunção não está entre eles — dois corpos no mesmo grau não se olham, estão juntos. As definições de fora de curso contam cinco, com a conjunção incluída, porque o que elas medem é o encontro que se aperfeiçoa. São duas contas convivendo dentro da mesma tradição, e o app prefere mostrar isso a arredondar.';

const COMO_FOI_CALCULADO =
  'Como isto foi calculado: para cada um dos seis corpos, o app procura o instante em que o ângulo com a Lua fica exato — 0°, 60°, 90°, 120° ou 180° —, não «dentro do orbe». A troca de signo é o instante em que a longitude da Lua cruza o múltiplo de 30°. Tudo por efeméride calculada, nunca por tabela: é o mesmo motor que o app usa para o resto do céu.';

const LEITURA_DO_APP =
  'O que é conta e o que é atribuição: os instantes acima são medidos, e quem quiser conferir consegue. O sentido que cada época deu a esse vazio é atribuição — e aqui cada camada aparece com o nome e o século de quem a escreveu.';

const SEM_DADO_PESSOAL =
  'Esta leitura não pede nada seu: não usa hora de nascimento nem cidade, porque a Lua está no mesmo ponto do céu para todo mundo ao mesmo tempo. O que a sua cidade muda é só o relógio em que esses instantes aparecem.';

const GLOSA =
  '«Fora de curso» traduz uma palavra grega: κενοδρομία, kenodromia — kenós, vazio, mais drómos, curso. Correndo no vazio.';

// Nunca fabricar céu: quando não dá para calcular, o app diz que não dá, diz por
// quê, e diz o que resolve.
const INDISPONIVEL = {
  semEfemeride:
    'O motor de efeméride não respondeu agora, então não há como dizer onde a Lua está. O app prefere dizer isso a estimar: horário estimado aqui seria invenção. Abrir a tela de novo em instantes costuma resolver.',
  dataInvalida:
    'A data recebida não é uma data válida, então não existe céu para calcular. Com uma data real — ano, mês e dia —, a conta volta na hora.',
  buscaNaoConvergiu:
    'A busca pelo instante exato do próximo encontro não fechou dentro da precisão que o app exige. Em vez de arredondar um horário e mostrar como se fosse certo, o app não mostra nenhum.',
};

function resumoJanela(c) {
  if (c.definicaoId === 'porfirio') {
    return `Fora de curso por ${dur(c.duracaoHoras)}, de ${c.aspecto.toLowerCase()} com ${c.planeta} até faltarem 30° para ${c.aspectoSeguinte.toLowerCase()} com ${c.planetaSeguinte}.`;
  }
  return `Fora de curso por ${dur(c.duracaoHoras)}, de ${c.aspecto.toLowerCase()} com ${c.planeta} até a entrada em ${c.proximoSigno}.`;
}

// ---------------------------------------------------------------------------
// O CHROME DA TELA — tudo que screens/LunarCalendarScreen.js escreve na tela
// ---------------------------------------------------------------------------
// A tela é VITRINE: ela mostra o que o motor exporta e não redige uma linha.
// Rótulo, título, botão e recado de erro moram AQUI, nos três packs, com
// paridade exata de chaves — nada disso passa por lib/i18n.js.
//
// As mesmas regras do resto do arquivo valem para cada string deste bloco, e
// duas delas mordem justamente aqui:
//
//   • O SELO NÃO É VEREDITO. Ele diz «esta régua vê vazio agora», não «hoje é
//     dia livre». A frase tem sujeito: quem vê é a régua, não o app, e não é o
//     seu dia que está sendo julgado.
//   • O QUE ESTÁ ENTRE « » É CITAÇÃO DO MERCADO, nunca a voz do app — é o print
//     que circula por aí, que é o assunto da tela.
//
// `locale` é DADO, não texto: é com ele que a tela formata hora e data. Fica no
// pack pelo mesmo motivo de todo o resto — para a tela não escolher idioma.
// `marca` é o domínio, e não se traduz em idioma nenhum.
const MARCA = 'cosmicguide.cloud';

// O texto que sai no compartilhar. Ele é COSTURA de textos do motor (o estado
// pelas duas réguas e a divergência entre elas), nunca prosa nova — e fecha no
// endereço, como nas outras telas que compartilham.
function textoCompartilhavel(c) {
  return `${c.termo} — ${c.quando}\n\n${c.primeira}\n\n${c.segunda}\n\n${c.divergencia}\n\n${MARCA}`;
}

const TELA = {
  locale: 'pt-BR',
  kicker: 'LUA FORA DE CURSO',
  titulo: 'As duas contas, lado a lado',
  intro:
    'Toda semana circula um print dizendo que a Lua está fora de curso e que hoje não é dia de resolver nada. O que quase nunca vem junto é o principal: não existe UMA Lua fora de curso. Existem pelo menos duas contas, com uns 1.400 anos entre uma e outra, e elas recortam o mesmo dia em pedaços diferentes. Esta tela calcula as duas e mostra as duas — inclusive quando elas discordam, que é quando o assunto fica interessante.',
  porQueDuas:
    'A régua que quase todo app usa é a de William Lilly, Christian Astrology, Londres, 1647, p. 112: o vazio vale enquanto a Lua não trocar de signo. A régua mais antiga que se conhece é grega — Antíoco de Atenas, séc. II, e Porfírio de Tiro, séc. III — e mede pelos 30° seguintes do caminho da Lua, sem olhar para signo nenhum. Nenhuma das duas é «a verdadeira»: as duas foram escritas, por gente diferente, com séculos entre elas.',
  naoDamosVeredito:
    'Por que esta tela não fecha num «dia livre»: escolher uma das duas contas em silêncio é o que o mercado faz, e é isso que dá a impressão de que existe um veredito sobre o seu dia. Aqui as duas aparecem com o nome de quem defende cada uma, e o que fazer com elas continua sendo de quem lê.',
  calculando: 'Calculando as duas contas com efeméride…',
  rotuloReguas: 'AS DUAS RÉGUAS',
  seloVazio: 'esta régua vê vazio agora',
  seloCheio: 'esta régua não vê vazio agora',
  rotuloDefende: 'QUEM DEFENDE',
  rotuloCriterio: 'O CRITÉRIO',
  rotuloQuemUsa: 'QUEM USA',
  rotuloJanelaAgora: 'A JANELA DE AGORA',
  rotuloProximo: 'O PRÓXIMO ENCONTRO',
  rotuloRecibo: 'DE ONDE VEM ESTA RÉGUA',
  rotuloDivergencia: 'A DIVERGÊNCIA',
  divergemSim: 'as duas discordam agora',
  divergemNao: 'as duas concordam agora',
  rotuloHoje: 'AS JANELAS DE HOJE',
  hojeIntro:
    'As janelas que tocam o dia de hoje, uma lista por régua, no relógio do seu aparelho. Quando uma lista vem cheia e a outra vem vazia, a divergência deixa de ser assunto de livro e vira o seu dia.',
  semJanelaHoje: 'Por esta régua, hoje não tem nenhuma janela.',
  janelasIndisponiveis:
    'A varredura do dia não fechou dentro da precisão que o app exige, então a lista de hoje não aparece. Lista pela metade seria pior que lista nenhuma: mostraria «não há janela» onde há.',
  faixa: (c) => `de ${c.inicio} até ${c.fim}`,
  abrir: 'Ver a régua inteira',
  fechar: 'Fechar',
  verFontes: 'De onde vem tudo isto',
  fecharFontes: 'Fechar',
  rotuloNoOriginal: 'NO ORIGINAL, SEM TRADUÇÃO',
  rotuloParafrase: 'EM NOSSAS PALAVRAS',
  rotuloFontes: 'FONTES',
  compartilhar: 'Compartilhar',
  copiado: 'Texto copiado — cola onde quiser.',
  naoCopiou: 'Não deu pra copiar aqui — seleciona o texto e copia.',
  marca: MARCA,
  indisponivelTitulo: 'Sem céu para calcular agora',
  textoCompartilhavel,
};

// ---------------------------------------------------------------------------
// BIBLIOGRAFIA — traduz a descrição, nunca o locus
// ---------------------------------------------------------------------------
const FONTE = [
  'Antíoco de Atenas, séc. II d.C. — a primeira definição conhecida de κενοδρομία (Lua fora de curso), transmitida em compilações posteriores; citada em Eduardo Gramaglia, Astrología Hermética, p. 188, que registra também a variante medida em tempo, «um dia e uma noite», uns 13° de arco',
  'Porfírio de Tiro, Introdução ao Tetrabiblos, séc. III d.C. — define pelos 30° seguintes, sem falar em fronteira de signo (trad. James H. Holden, Porphyry the Philosopher, AFA, 2009)',
  'William Lilly, Christian Astrology, Londres, 1647, p. 112 — "A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other": é aqui que a fronteira de signo entra no critério',
  'Al H. Morrison (1916–1995), The Void of Course Moon — tabelas e boletins a partir de ~1970: o ponto em que um critério de astrologia horária vira conselho de agenda diária',
  'Anthony Louis, «Will the Real Void-of-Course Moon Please Stand Up?» (2013) e «Lilly\'s definition of the Void of Course Moon» (2021), tonylouis.wordpress.com — a crítica de que a leitura de Morrison é um mal-entendido de Lilly',
  'Chris Brennan, Hellenistic Astrology: The Study of Fate and Fortune, Amor Fati, 2017 — κενοδρομία no contexto helenístico',
  'Ptolomeu, Tetrabiblos I.13 (Dos aspectos dos signos), trad. F. E. Robbins, Loeb/Harvard, 1940 — os aspectos que dão o vocabulário desta conta',
];

export const PACK = {
  lang: 'pt',
  termo: 'Lua fora de curso',
  glosa: GLOSA,
  signos: SIGNOS,
  planetas: PLANETAS,
  aspectos: ASPECTOS,
  aspectosComGlosa: ASPECTOS_COM_GLOSA,
  aspectosExato: ASPECTOS_EXATO,
  definicoes: DEFINICOES,
  verbatim: VERBATIM,
  abertura,
  estado,
  janela,
  proximoEncontro,
  divergencia,
  resumoJanela,
  recibo: RECIBO,
  oQuantoIssoMuda: O_QUANTO_ISSO_MUDA,
  comoOMercadoUsa: COMO_O_MERCADO_USA,
  oQueNaoSeAchou: O_QUE_NAO_SE_ACHOU,
  osSeteEOsTres: OS_SETE_E_OS_TRES,
  notaConjuncao: NOTA_CONJUNCAO,
  comoFoiCalculado: COMO_FOI_CALCULADO,
  leituraDoApp: LEITURA_DO_APP,
  semDadoPessoal: SEM_DADO_PESSOAL,
  indisponivel: INDISPONIVEL,
  tela: TELA,
  fonte: FONTE,
};
