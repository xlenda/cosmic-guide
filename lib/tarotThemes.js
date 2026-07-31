// lib/tarotThemes.js
// Camada de interpretação do Tarô por Tema.
//
// NÃO redefine as cartas (isso continua em lib/tarotDeck.js). Pega a carta REAL
// sorteada e a lê — pela imagem dela, pelo nome tradicional dela e pelo
// conselho dela — através da pergunta que a pessoa escolheu (Amor, Carreira,
// Dinheiro, Energia, Saúde).
//
// ===========================================================================
// POR QUE ESTE ARQUIVO FOI REFEITO (31/07/2026)
// ===========================================================================
// A versão anterior montava a leitura a partir de 25 frases-molde
// (5 categorias de carta × 5 temas). Resultado medido: 78 cartas colapsavam em
// 25 formas de dizer a mesma coisa. Cinco de Espadas e O Sol saíam com a MESMA
// estrutura, mudando só o miolo. Pior: os 22 Arcanos Maiores dividiam UM
// template por tema — "não é episódio de rotina, é o eixo da relação sendo
// mexido" serve para qualquer arcano e por isso não diz nada de nenhum.
//
// O dono do app resumiu assim: "muito genérico as cartas tiradas, ele não é
// impactante e incisivo, fica enrolando linguiça".
//
// A REGRA DE ESCRITA QUE VALE AQUI AGORA, e o teste que a cobra:
//   TODA frase da leitura carrega pelo menos um dado exclusivo DAQUELA carta.
//   Se uma frase serviria para outra carta, ela está errada.
//   test/tarotVoice.test.js quebra o build quando duas cartas diferentes, no
//   mesmo tema e na mesma casa, produzem frases iguais ou textos com
//   sobreposição de 4-gramas acima do teto declarado lá. Os tetos, a métrica e
//   os números de antes e depois estão escritos naquele arquivo.
//
// ===========================================================================
// DE ONDE VEM O MÉTODO (é tradição, e tem data)
// ===========================================================================
// 1. A CARTA NÃO FALA SOZINHA, e o significado nasce da imagem.
//    A. E. Waite, "The Pictorial Key to the Tarot" (1911), no prefácio:
//    "The true Tarot is symbolism; it speaks no other language and offers no
//    other signs" e, na sequência, as cartas são "a kind of alphabet which is
//    capable of indefinite combinations and makes true sense in all".
//    Por isso a leitura aqui abre pela CENA (card.cena, a imagem de Pamela
//    Colman Smith carta a carta) e infere dali — método que Camelia Elias
//    ("Marseille Tarot: Towards the Art of Reading", Eyecorner Press, 2014)
//    chama de argumento visual.
//
// 2. UMA PALAVRA POR CARTA, ENCADEADA — o antídoto documentado contra enrolar.
//    Golden Dawn, método "Opening of the Key" (S. L. MacGregor Mathers,
//    "Book T", fim do séc. XIX; publicado por Israel Regardie em "The Golden
//    Dawn", 1937-1940): reduzir cada carta a uma palavra e encadear as
//    palavras numa narrativa. É a primeira linha de toda leitura daqui.
//
// 3. O REGISTRO É SECO. As "Divinatory Meanings" de Waite são listas de
//    substantivos, sem hedge e sem consolo. A Torre, verbatim: "Misery,
//    distress, indigence, adversity, calamity, disgrace, deception, ruin. It
//    is a card in particular of unforeseen catastrophe." Oito substantivos e
//    ponto. Três de Espadas termina com Waite se RECUSANDO a explicar, porque
//    a imagem já disse: "and all that the design signifies naturally, being
//    too simple and obvious to call for specific enumeration."
//
// 4. A POSIÇÃO É PARTE DO SIGNIFICADO. Etteilla (Jean-Baptiste Alliette),
//    "Manière de se récréer avec le jeu de cartes nommées tarots" (1785), é o
//    primeiro a publicar tiragens com significado por POSIÇÃO e a modificar a
//    leitura de uma carta pelas adjacentes. Por isso getThemedMeaning recebe
//    `position` e a mesma carta lê diferente em Passado, Presente e Futuro.
//
// 5. CARTA DURA SE DIZ INTEIRA, E SÓ DEPOIS O QUE RESTA. O modelo é o Cinco de
//    Copas de Waite, verbatim: "It is a card of loss, but something remains
//    over; three have been taken, but two are left". Nomeia a perda sem
//    suavizar, e o que sobra vem de um FATO DA IMAGEM (duas taças em pé), não
//    de um chavão. Mary K. Greer, sobre o Dez de Espadas (02/03/2008), diz a
//    mesma coisa por outro lado: "it is only by knowing the true state and
//    feelings of the person on this card that we have any chance of knowing
//    its blessings" — o alívio só é legítimo depois de a dificuldade ter sido
//    dita por inteiro.
//
// 6. DIGNIDADES ELEMENTAIS: a carta muda conforme as vizinhas. Doutrina
//    escrita, do "Book T" de Mathers, publicada por Regardie: mesmo elemento
//    fortalece muito; fogo/água e ar/terra são contrários e enfraquecem;
//    fogo/terra e ar/água são neutros. Aplicação canônica em TRÍADE — a carta
//    do centro é a principal e é modificada pelas duas ao lado. A tiragem
//    deste app é exatamente uma tríade. Ver getElementalDignity().
//
// ===========================================================================
// O QUE NÃO ENTRA — a linha que já vale no resto do app
// ===========================================================================
// Ver os cabeçalhos de lib/zodiacBody.js e lib/grounding.js: tradição com
// FONTE, nunca alegação de saúde, nunca invenção apresentada como milenar.
//
// • Nada de previsão de doença, de morte ou de efeito sobre o corpo. Isso é
//   convergência entre o registro de Waite e os códigos de ética de leitores
//   profissionais contemporâneos (American Tarot Association e equivalentes) —
//   que são CONTEMPORÂNEOS, não milenares, e não devem ser vendidos como tal.
// • Incisivo não é assustador nem determinista. A carta descreve a natureza da
//   situação; não decreta desfecho e não decide pela pessoa. Por isso a casa do
//   Futuro é enunciada como VETOR, nunca como fato consumado.
// • Nada de conselho imperativo inventado em cima da keyword crua ("invista em
//   dificuldade", "é hora de agir com sobrecarga"). O conselho vem de
//   card.conselho / card.conselhoInvertido, escrito carta a carta na tradição.
// • A INVERSÃO (corrigida em 30/07/2026) não é oposto simples e não usa as
//   palavras da leitura direta como se fossem afirmação: é a MESMA energia
//   bloqueada, em excesso ou virada para dentro, com o conselho vindo do campo
//   invertido da própria carta. Isso está preservado abaixo, de propósito.
// ===========================================================================

// ===========================================================================
// SEGUNDA PASSAGEM (31/07/2026) — o que ainda estava genérico depois da
// primeira, e como foi medido
// ===========================================================================
// A primeira reescrita tirou os 25 moldes, mas sobraram três buracos, todos
// medidos com a métrica que agora vive em test/tarotVoice.test.js
// (sobreposição de 4-gramas entre os textos de duas cartas diferentes, no
// mesmo tema, na mesma casa e na mesma orientação):
//
// 1. A POSIÇÃO NÃO CHEGAVA NA TELA. screens/TarotScreen.js chamava
//    getThemedMeaning(card, tema, invertida) sem o quarto argumento. As três
//    casas eram rótulo em cima da carta e nada mais: A Torre no Passado e A
//    Torre no Futuro saíam com texto IDÊNTICO. Medido: 0,83 de sobreposição
//    entre a mesma carta em casas diferentes.
// 2. A CASA ERA UM RABICHO, NÃO UMA LEITURA. POSITION_FRAMES colava uma frase
//    fixa no fim ("Na casa do Passado, X é raiz…"), igual para as 78 cartas.
//    Isso é exatamente uma frase que serve para qualquer carta.
// 3. OS 22 MAIORES AINDA DIVIDIAM UMA FRASE. A linha de tradição deles tinha
//    UM dado exclusivo (o planeta/signo) dentro de ~25 palavras compartilhadas.
//    Pior par medido no baralho inteiro: 0,54.
//
// O QUE MUDOU AQUI:
// • A casa agora REESCREVE a leitura em vez de comentá-la. Passado, Presente e
//   Futuro têm composição diferente: enunciam o sentido da carta com outro
//   verbo, puxam um SUBCONJUNTO DIFERENTE dos dados tradicionais da carta, e a
//   casa do Passado não dá conselho nenhum — não se aconselha o que já
//   aconteceu. Isso é doutrina, não estilo: em Waite a quinta casa da Cruz
//   Celta ("this is behind him") é descritiva, e a décima ("what will come") é
//   onde ele manda concentrar o juízo.
// • Os Maiores ganharam dados exclusivos de verdade: letra hebraica, classe no
//   Sepher Yetzirah e caminho na Árvore da Vida, tudo da mesma tabela Golden
//   Dawn que o app já usava (ver lib/tarotDeck.js, MAJOR_GD_PATH).
// • Ás, carta numerada e figura de corte passaram a ter formas de frase
//   distintas: eram elas que produziam os piores pares (Ás de Ouros × Valete
//   de Ouros), porque nenhuma das duas tem título Golden Dawn e as duas caíam
//   na mesma moldura.
//
// A métrica e o teto estão declarados em test/tarotVoice.test.js. Se alguém
// reintroduzir moldura compartilhada, o número sobe e o build quebra.
// ===========================================================================

// ===========================================================================
// TERCEIRA PASSAGEM (31/07/2026) — auditoria cética, e o que ela achou
// ===========================================================================
// A segunda passagem baixou o número. Uma leitura de 30 tiragens com olho de
// usuário, não de programador, achou quatro coisas que o número NÃO pegava —
// porque o teste media frase INTEIRA repetida em 3+ cartas, e o que sobrou de
// molde era todo SUB-FRASE. Os quatro, medidos:
//
// 1. O APP DIZIA A MESMA COISA DUAS VEZES, em toda carta. A abertura despejava
//    a lista inteira de keywords e, duas frases depois, o uprightMeaning
//    repetia as mesmas palavras dentro de uma oração. Medido: em 61 das 78
//    cartas, metade ou mais das keywords reaparecia LITERALMENTE no
//    uprightMeaning; média de 0,66 do baralho. "salto de fé, novos começos,
//    espontaneidade, liberdade" seguido de "início de uma jornada, inocência e
//    disposição para arriscar" é a definição operacional de enrolar linguiça:
//    a segunda frase não acrescenta nada à primeira.
//    O cabeçalho deste arquivo já mandava o contrário — item 2, "UMA PALAVRA
//    POR CARTA, ENCADEADA", o método Opening of the Key. O código fazia
//    words.join(', '). A abertura agora é a UMA palavra que o método pede, que
//    também era o que o ramo da carta invertida já fazia desde 30/07.
//
// 2. "AGORA, SEM RODEIO:" nas 78 cartas da casa do Presente. Uma frase que
//    ANUNCIA que vai ser direta é, ela própria, o rodeio. Saiu. No Presente a
//    carta agora só diz o que diz — é isso que faz dele o presente.
//
// 3. O MOLDE DOS 22 MAIORES NUNCA TINHA SAÍDO, SÓ TROCADO DE ROUPA. O
//    cabeçalho acima cita, como exemplo do defeito antigo, a frase "não é
//    episódio de rotina, é o eixo da relação sendo mexido" — e a versão que ele
//    estava documentando escrevia "um Arcano Maior põe em jogo o eixo da
//    relação, não o episódio", nas mesmas 22 cartas. É a mesma afirmação, e ela
//    continua verdadeira para os 22 arcanos e por isso continua não dizendo
//    nada de nenhum. MAJOR_TERRITORY morreu.
//
// 4. RESSALVA DE DOUTRINA REPETIDA CARTA A CARTA vira ruído. Três ressalvas
//    eram coladas em toda carta que se encaixasse: "que pode ser uma pessoa ou
//    uma postura sua" (16 cortes), "travado, em excesso ou virado pra dentro"
//    (78, invertidas), e a de Arcano Maior. Ressalva é verdadeira UMA vez por
//    leitura; repetida três vezes na mesma tela ela deixa de ser lida. As três
//    subiram para uma nota única em screens/TarotScreen.js, que aparece só
//    quando a tiragem tem carta invertida / corte / Arcano Maior.
//
// O PORTÃO NOVO que impede o item 3 de acontecer pela terceira vez: o teste
// deixou de medir só frase inteira e passou a medir SEQUÊNCIA DE 6 PALAVRAS
// dentro da frase. Qualquer sequência de 6 palavras que apareça em 5 cartas ou
// mais tem de estar DECLARADA em test/tarotVoice.test.js como texto de naipe ou
// ressalva de doutrina. Foi exatamente essa granularidade que faltou: o molde
// dos Maiores tinha 12 palavras e vivia dentro de uma frase que terminava
// diferente em cada carta, então passava batido pelo teste de frase inteira.
//
// O QUE ESTA PASSAGEM NÃO CONSEGUIU CONSERTAR, dito na cara:
// O TEMA QUASE NÃO MUDA A LEITURA. Medido no teste da troca aplicado ao tema —
// mesma carta, mesma casa, temas diferentes: sobreposição mediana de 0,82 antes
// desta passagem. Quem pergunta de Amor e quem pergunta de Dinheiro recebe
// quase o mesmo texto, porque a carta tem UM uprightMeaning e UM conselho, e o
// tema só escolhe o território do naipe. Consertar isso de verdade custa
// conteúdo novo por carta E por tema (78 × 5 = 390 leituras escritas na
// tradição), e inventar uma moldura de 20 células para simular diferença seria
// repetir exatamente o erro que este arquivo já cometeu duas vezes. Fica
// medido, com teto, em test/tarotVoice.test.js — para não piorar — e fica
// escrito aqui como a maior dívida conhecida desta tela.
// ===========================================================================

const THEME_KEYS = ['Amor', 'Carreira', 'Dinheiro', 'Energia', 'Saúde'];

// Como a pergunta é aberta em cada tema. Uma preposição, não uma tese.
const THEME_OPENER = {
  Amor: 'No amor',
  Carreira: 'Na carreira',
  Dinheiro: 'Nas finanças',
  Energia: 'Na energia',
  Saúde: 'Na saúde',
};

// TERRITÓRIO DO NAIPE por tema. Repare no que isto é e no que NÃO é: é o
// rótulo do território que aquele naipe cobre naquela pergunta — três a seis
// palavras — e NUNCA a leitura da carta. A leitura inteira vem da carta.
//
// É o ÚNICO texto que este arquivo compartilha de propósito entre cartas, e por
// isso ele está declarado em test/tarotVoice.test.js (TEXTO_DE_NAIPE): a frase
// vale para as 14 cartas do naipe porque descreve o NAIPE, não a carta. Tudo o
// mais que aparecer em cinco cartas ou mais derruba o build.
//
// Nota de honestidade que o app deve a esta tabela: naipe↔elemento é atribuição
// da Golden Dawn, de 1888, e houve versões rivais no séc. XIX (Lévi e Thierens
// trocam Espadas com Ouros). Os naipes chegaram à Europa por volta de 1370, das
// cartas mamelucas, sem elemento nenhum. Ver docs/tradicao/14, §2.5.
const SUIT_TERRITORY = {
  paus: {
    Amor: 'desejo e iniciativa',
    Carreira: 'ímpeto e projeto',
    Dinheiro: 'dinheiro que só se move por iniciativa',
    Energia: 'vigor — e quanto dele já foi gasto',
    Saúde: 'corpo em movimento, entre vigor e exaustão',
  },
  copas: {
    Amor: 'vínculo e o que ainda não virou palavra',
    Carreira: 'clima e pessoas',
    Dinheiro: 'decisão movida por valor afetivo',
    Energia: 'estado emocional',
    Saúde: 'estado emocional, que sustenta o resto',
  },
  espadas: {
    Amor: 'aquilo que precisa ser dito',
    Carreira: 'análise, estratégia e a conversa difícil',
    Dinheiro: 'número olhado sem a história em volta',
    Energia: 'cabeça, e o quanto ela deixa o resto rodar',
    Saúde: 'sono e pensamento',
  },
  ouros: {
    Amor: 'sentimento virado em gesto concreto',
    Carreira: 'ofício, prazo e resultado que se vê',
    Dinheiro: 'matéria, e aqui o naipe joga em casa',
    Energia: 'corpo físico e o que ele aguenta',
    Saúde: 'hábito e rotina que se sustentam no tempo',
  },
};

// MAJOR_TERRITORY MORREU EM 31/07/2026, e não deve voltar.
//
// Eram cinco frases — uma por tema — repartidas entre os 22 Arcanos Maiores.
// "um Arcano Maior põe em jogo o eixo da relação, não o episódio" aparecia em
// 22 cartas por tema. O cabeçalho deste arquivo já usava essa mesma afirmação
// como EXEMPLO do defeito que a primeira reescrita ia consertar; ela sobreviveu
// às duas reescritas, só reordenada.
//
// O problema não é ela ser falsa — é ela ser verdadeira para os 22. Um enunciado
// que descreve igualmente bem O Louco, A Torre e O Sol não distingue nenhum dos
// três, e o teste do dono ("troque a carta e leia de novo") reprova.
//
// A afirmação continua no app, porque é doutrina de verdade: um Arcano Maior é
// assunto de outra ordem de grandeza. Ela só migrou para onde ressalva pertence
// — UMA vez por tiragem, em screens/TarotScreen.js, e só quando saiu Maior.
// Cada Maior, na leitura dele, fala pelos quatro dados que só ele tem: nome,
// número, letra hebraica / caminho na Árvore da Vida, e a atribuição.

const SUIT_LABEL = { paus: 'Paus', copas: 'Copas', espadas: 'Espadas', ouros: 'Ouros' };

const POSITION_KEYS = ['Passado', 'Presente', 'Futuro'];

// O GRAU, em uma oração. É a camada que liga os quatro naipes entre si: os
// quatro Cincos são o MESMO grau em quatro elementos. A versão longa mora em
// RANK_GRADES (lib/tarotDeck.js) e é usada na leitura da TIRAGEM inteira; aqui
// entra a versão curta, porque dentro da frase de uma carta só a versão curta
// cabe sem virar parágrafo.
const RANK_ROLE = {
  1: 'a raiz do elemento, ainda inteira',
  2: 'o grau da polaridade, com duas forças se encarando antes de qualquer coisa acontecer',
  3: 'o grau em que o plano sai do plano e aparece no mundo',
  4: 'o grau da forma que já começa a pesar',
  5: 'o grau da crise, onde o equilíbrio do elemento se perde',
  6: 'o grau do restabelecimento depois da crise',
  7: 'o grau da prova, que se passa longe da plateia',
  8: 'o grau do movimento, quando o assunto volta a andar',
  9: 'o grau da culminação, com o que ela tem de solitário',
  10: 'o grau do limite, completude que já virou excesso',
  11: 'a figura que ainda aprende o elemento',
  12: 'a figura que lança o elemento para fora',
  13: 'a figura que sustenta o elemento por dentro',
  14: 'a figura que administra o elemento no mundo',
};

// A classe da letra no Sepher Yetzirah, dita com o NÚMERO da classe dentro.
// O número não é enfeite: é ele que denuncia tabela corrompida. São três mães,
// sete duplas e doze simples — e é porque as simples são doze que os signos
// cabem nelas em ordem zodiacal. Ver docs/tradicao/05, §4.1.
const SY_CLASS_PHRASE = {
  mãe: 'uma das três mães',
  dupla: 'uma das sete duplas',
  simples: 'uma das doze simples',
};

// Categoria de uma carta: naipe (paus/copas/espadas/ouros) ou 'maior' para os
// Arcanos Maiores (que não têm suit).
export function getCardCategory(card) {
  return card.suit || 'maior';
}

function lowerFirst(text) {
  if (!text) return '';
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function upperFirst(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Tira o ponto final para poder embutir a frase da carta no meio de outra sem
// produzir "…não sustentavam mais. — já aconteceu".
function stripPeriod(text) {
  if (!text) return '';
  return text.replace(/\s*\.\s*$/, '');
}

// A primeira linha: UMA palavra.
//
// É o método "Opening of the Key" da Golden Dawn (Mathers, "Book T", fim do
// séc. XIX, publicado por Regardie 1937-1940), citado no item 2 do cabeçalho:
// reduzir cada carta a uma palavra e encadear as palavras. keywords[0] é
// escolhida carta a carta em lib/tarotDeck.js justamente para ser essa palavra
// — o comentário de O Louco lá diz isso com todas as letras ("salto de fé é o
// eixo real da carta, não 'novos começos' genérico").
//
// ANTES daqui a função despejava a lista inteira (words.join(', ')), e duas
// frases adiante o uprightMeaning repetia as mesmas palavras numa oração:
// em 61 das 78 cartas metade ou mais das keywords reaparecia literalmente
// (média 0,66 do baralho). Dizer duas vezes a mesma coisa com palavras
// diferentes é exatamente o que o dono chamou de enrolar linguiça — e o ramo da
// carta invertida já fazia certo desde 30/07, com uma palavra só.
function dryOpening(card, themeKey, isReversed) {
  const eixo = Array.isArray(card.keywords) ? card.keywords[0] : null;
  if (!eixo) return `${themeKey}.`;
  if (isReversed) return `${themeKey} — ${eixo} pelo avesso.`;
  return `${themeKey} — ${eixo}.`;
}

// -------------------------------------------------------------------------
// O SENTIDO DA CARTA, ENUNCIADO PELA CASA EM QUE ELA CAIU
// -------------------------------------------------------------------------
// "A mesma carta significa coisas diferentes conforme a casa em que cai" é a
// afirmação mais antiga e mais segura da leitura documentada: está em Etteilla
// (1770/1783) e está no "Pictorial Key" (1911). Ver docs/tradicao/05, §3.1 —
// que é [FP], fonte primária, enquanto a tiragem de TRÊS casas rotuladas
// Passado/Presente/Futuro é popularização do séc. XX e por isso este app nunca
// a chama de "clássica" nem de "tradicional".
//
// Por isso a casa não comenta a leitura: ela É a leitura. O mesmo
// uprightMeaning entra em três enunciados diferentes, e o campo só aparece uma
// vez no texto — não existe "frase da carta" e depois "frase da casa".
function meaningLine(card, isReversed, position) {
  const eixo = card.keywords?.[0];

  if (isReversed) {
    // DOUTRINA PRESERVADA (correção de 30/07/2026, não desfazer): a invertida
    // não é o oposto simples e o eixo da carta direta só aparece MARCADO como
    // travado — nunca como afirmação. O corpo do texto é o reversedMeaning da
    // própria carta. Isso é a escola contemporânea (Gray, Pollack, Greer), e o
    // app diz que é contemporânea: em Waite a invertida costuma ser lateral, e
    // às vezes melhor que a direta (ver card.waite1911 na Roda e na Imperatriz).
    // "o eixo — X — apareceu travado" e não "X apareceu travado": as
    // keywords têm gênero e número próprios ("ciclos", "salto de fé",
    // "escolhas") e concordar com elas exigiria flexionar 78 palavras. O
    // sujeito da oração é sempre "o eixo", que é masculino singular, e a carta
    // entra aposta entre travessões.
    //
    // O QUE SAIU EM 31/07/2026: a trinca "travado, em excesso ou virado pra
    // dentro" vinha colada nas 78 cartas, nas três casas. É a definição da
    // inversão, é verdadeira, e por ser a definição ela não diz nada sobre
    // ESTA carta — qual das três é o caso está no reversedMeaning dela, que
    // vem logo em seguida. A definição subiu para a nota única da tela, onde
    // ressalva é lida uma vez em vez de três.
    const eixoNome = eixo ? `o eixo — ${eixo} —` : 'o eixo';
    if (position === 'Passado') {
      return `Ali ${eixoNome} já estava travado. ${card.reversedMeaning}`;
    }
    if (position === 'Futuro') {
      return `${upperFirst(eixoNome)} segue travado. ${stripPeriod(card.reversedMeaning)}. Vetor, não fato consumado.`;
    }
    return `${upperFirst(eixoNome)} está travado. ${card.reversedMeaning}`;
  }

  if (position === 'Passado') {
    return `Raiz já cumprida: ${stripPeriod(lowerFirst(card.uprightMeaning))}. É terreno, não notícia.`;
  }
  if (position === 'Futuro') {
    return `Sem mudar a condução: ${stripPeriod(lowerFirst(card.uprightMeaning))}. Vetor, não fato consumado.`;
  }
  if (position === 'Presente') {
    // Sem conector. A versão anterior abria com "Agora, sem rodeio:" nas 78
    // cartas — uma frase que anuncia que vai ser direta é, ela mesma, o rodeio,
    // e ainda por cima prometia incisão e entregava a paráfrase que já estava
    // vindo. No presente a carta só diz o que diz; é isso que faz dele o
    // presente, e é o que separa esta casa das outras duas sem gastar palavra.
    return upperFirst(card.uprightMeaning);
  }
  return card.uprightMeaning;
}

// -------------------------------------------------------------------------
// A LINHA DE TRADIÇÃO — o tema, e no mesmo fôlego os dados exclusivos da carta
// -------------------------------------------------------------------------
// Cada casa puxa um SUBCONJUNTO DIFERENTE dos dados tradicionais, e cada
// família de carta (Maior, Ás, numerada, corte) tem forma de frase própria.
// As duas coisas juntas são o que impede duas cartas de saírem com o mesmo
// desenho de frase — e o que faz a mesma carta soar diferente em cada casa.
//
// Regra que vale em toda linha daqui: quando o app cita astrologia de carta,
// ele diz DE QUEM É A TABELA. São pelo menos três, incompatíveis entre si
// (docs/tradicao/05, §4). Este app usa a Golden Dawn e escreve o nome dela.
// Duas frases, e cada uma tem um dono declarado:
//   • a do TERRITÓRIO pertence ao naipe e é compartilhada pelas 14 cartas dele
//     de propósito (declarada em test/tarotVoice.test.js como TEXTO_DE_NAIPE);
//   • a da GRADE pertence só a esta carta, e o conector nela é curto justamente
//     para não virar molde: "na grade da Golden Dawn" tem cinco palavras, e
//     abaixo das seis que o portão de n-gramas persegue.
// Separadas em vez de encaixadas uma dentro da outra porque, encaixadas, o
// pedaço compartilhado do naipe engolia o dado exclusivo da carta no meio de
// uma oração longa — foi assim que "e a Golden Dawn chama esta carta de Senhor"
// acabou em 36 cartas sem ninguém ver.
function traditionLine(card, themeKey, position) {
  const opener = THEME_OPENER[themeKey] || THEME_OPENER.Amor;
  const category = getCardCategory(card);

  if (category === 'maior') {
    // Nos 22 Maiores não há naipe e não há território: a frase é só a grade,
    // e cada casa puxa um recorte diferente dela — a raiz mostra a letra
    // hebraica, o presente mostra o planeta/signo, o futuro mostra o caminho na
    // Árvore da Vida. Mesma tabela Golden Dawn, três recortes, nenhum inventado.
    const attr = card.element ? upperFirst(card.element) : 'o próprio símbolo';
    if (position === 'Passado' && card.letra) {
      return `${opener}: ${card.name}, arcano ${card.number}, letra ${card.letra} na grade da Golden Dawn.`;
    }
    if (position === 'Futuro' && card.caminho) {
      return `${opener}: ${card.name}, caminho ${card.caminho} da Árvore da Vida, sob ${attr} na grade da Golden Dawn.`;
    }
    return `${opener}: ${card.name}, arcano ${card.number}, sob ${attr} na grade da Golden Dawn.`;
  }

  const territory = (SUIT_TERRITORY[category] || {})[themeKey] || '';
  const label = SUIT_LABEL[category] || 'o naipe';
  const role = RANK_ROLE[card.number];
  const astro = card.astro;
  const campo = territory ? `${opener}, ${label} cobre ${territory}.` : `${opener}, fala ${label}.`;

  // Ás — raiz elemental. Não tem título Golden Dawn nem decanato, e é por isso
  // que precisa de forma própria: caindo na moldura das numeradas ele saía
  // quase idêntico ao Valete do mesmo naipe (pior par medido em 30/07: 0,54
  // entre Ás de Ouros e Valete de Ouros).
  if (card.number === 1) {
    if (position === 'Passado') {
      return `${campo} O Ás é ${astro}, e naquele ponto o potencial estava inteiro — pela grade da Golden Dawn.`;
    }
    if (position === 'Futuro') {
      return `${campo} O Ás é ${astro} — semente, não colheita (grade da Golden Dawn).`;
    }
    return `${campo} O Ás é ${astro}, potencial ainda não gasto — pela grade da Golden Dawn.`;
  }

  // Figuras de corte — elemento composto, sem decanato e sem título. A ressalva
  // de que corte pode ser uma pessoa OU uma postura sua saiu daqui em
  // 31/07/2026: era a mesma oração nas 16 cortes, e ressalva repetida 16 vezes
  // deixa de ser lida. Ela vive agora na nota única de screens/TarotScreen.js,
  // que só aparece quando a tiragem tem corte.
  if (card.number >= 11) {
    if (position === 'Passado') {
      return `${campo} Golden Dawn: ${astro}, ${role}.`;
    }
    // No Futuro a corte entra pelo que ela FAZ com o elemento (quem conduz), e
    // o grau curto fica de fora: é o mesmo recorte-por-casa dos Maiores, e é o
    // que impede a leitura de Futuro de ser a de Presente com um prefixo.
    if (position === 'Futuro') {
      return `${campo} Golden Dawn: ${astro} — quem conduz daqui.`;
    }
    return `${campo} Golden Dawn: ${astro} — ${role}.`;
  }

  // Numeradas de 2 a 10 — as 36 que têm decanato e título Golden Dawn.
  if (card.tituloGD && astro) {
    if (position === 'Passado') {
      return `${campo} Golden Dawn: ${astro}, ${role}.`;
    }
    if (position === 'Futuro') {
      return `${campo} Golden Dawn: ${card.tituloGD}, ${astro} — quem conduz daqui.`;
    }
    return `${campo} Golden Dawn: ${card.tituloGD}, ${astro} — ${role}.`;
  }

  return `${campo} É dali que esta carta fala, na grade da Golden Dawn.`;
}

// O conselho da própria carta, e onde ele CABE. Não se aconselha o passado:
// na casa da raiz o app descreve e cala. Isso é o que mais separa as três
// casas na prática, e é a postura de Waite — a casa "atrás dele" é descritiva,
// e é na última que ele manda concentrar o juízo.
function adviceLine(card, isReversed, position) {
  if (position === 'Passado') return null;
  const conselho = isReversed ? card.conselhoInvertido : card.conselho;
  if (!conselho) return null;
  // Dois-pontos e não travessão: metade dos 78 conselhos já tem um travessão
  // dentro ("o passo pede confiança, não garantia — mas olhe onde pisa"), e o
  // prefixo com travessão produzia dois travessões na mesma frase, que o olho
  // lê como aposto e embaralha quem está dizendo o quê.
  if (position === 'Futuro') return `Muda o vetor: ${lowerFirst(conselho)}`;
  return conselho;
}

// Retorna o texto de interpretação da carta.
// - card: a carta de lib/tarotDeck.js
// - themeKey: 'Amor' | 'Carreira' | 'Dinheiro' | 'Energia' | 'Saúde'
// - isReversed: carta invertida
// - position: 'Passado' | 'Presente' | 'Futuro' (opcional). Sem posição a
//   leitura sai sem casa — é o comportamento de "carta do dia", e é por isso
//   que nenhuma frase crava tempo sem saber a casa.
export function getThemedMeaning(card, themeKey, isReversed = false, position = null) {
  if (!card) return '';
  const theme = THEME_KEYS.includes(themeKey) ? themeKey : THEME_KEYS[0];
  const pos = POSITION_KEYS.includes(position) ? position : null;
  const parts = [];

  // 1. A palavra seca (Opening of the Key + registro de Waite).
  parts.push(dryOpening(card, theme, isReversed));

  // 2. A CENA. O que está desenhado na carta, concreto. É daqui que a leitura
  //    tradicional sai de verdade — e é o que impede 14 cartas de um naipe de
  //    lerem com a mesma forma de frase.
  if (card.cena) parts.push(`Na carta, ${card.cena}.`);

  // 3. O que a cena diz, JÁ na casa em que a carta caiu.
  parts.push(meaningLine(card, isReversed, pos));

  // 4. O tema + os dados tradicionais exclusivos desta carta, escolhidos pela
  //    casa.
  parts.push(traditionLine(card, theme, pos));

  // 5. O conselho da própria carta — e só onde ele cabe. Carta dura é
  //    diagnóstico: o conselho dela aponta o que a imagem mostra, nunca manda
  //    a pessoa cultivar o próprio problema.
  const advice = adviceLine(card, isReversed, pos);
  if (advice) parts.push(advice);

  return parts.join(' ');
}

// A citação verbatim de Waite (1911) para esta carta, quando ela existe
// conferida — com a nota que diz o que o app faz com ela. Devolve null nas 67
// cartas em que a citação NÃO foi conferida no texto, e isso é de propósito:
// "não encontrei a fonte" é resposta melhor do que uma citação plausível.
//
// Não entra no corpo da leitura. Vai numa nota à parte, rotulada, porque é
// história do baralho — não é o que o app está dizendo sobre a vida de quem
// consultou. Ver lib/tarotDeck.js, WAITE_1911.
export function getWaiteNote(card) {
  if (!card || !card.waite1911) return null;
  const { orientacao, verbatim, nota } = card.waite1911;
  return {
    titulo: `O que A. E. Waite escreveu em 1911 — a carta ${orientacao} na lista dele`,
    verbatim,
    nota,
  };
}

// ---------------------------------------------------------------------------
// DIGNIDADES ELEMENTAIS — a carta lida pelas vizinhas (Book T)
// ---------------------------------------------------------------------------
// Doutrina de S. L. MacGregor Mathers, "Book T" (manuscrito da Hermetic Order
// of the Golden Dawn, fim do séc. XIX), publicada por Israel Regardie em "The
// Golden Dawn" (1937-1940). Regra da tríade: a carta do CENTRO é a principal e
// é modificada pelas duas que a ladeiam.
//
// HONESTIDADE SOBRE A FONTE: o verbatim do Book T não foi conferido no
// manuscrito original. O que está aqui segue a literatura secundária
// consistente (Mary K. Greer, "Elemental Dignities", 2008; Anthony Louis,
// "Elemental Dignities in Tarot Readings", 2022): mesmo elemento fortalece
// muito, para o bem ou para o mal; fogo e água são contrários, assim como ar e
// terra, e "mal dignificam" as cartas envolvidas; fogo com terra e ar com água
// são passivos, nem ajudam nem atrapalham.
//
// LIMITE DELIBERADO: a doutrina é sobre os QUATRO ELEMENTOS. Arcano Maior de
// atribuição planetária (O Mago/Mercúrio, A Roda/Júpiter, A Torre/Marte...)
// não entra na conta — devolvemos null em vez de inventar um elemento para
// ele. Arcano de atribuição por SIGNO entra pelo elemento do signo, que é a
// mesma classificação que Ptolomeu usa nas triplicidades.
const SIGN_ELEMENT = {
  áries: 'fogo', leão: 'fogo', sagitário: 'fogo',
  touro: 'terra', virgem: 'terra', capricórnio: 'terra',
  gêmeos: 'ar', libra: 'ar', aquário: 'ar',
  câncer: 'água', escorpião: 'água', peixes: 'água',
};

const ELEMENT_LABEL = { fogo: 'fogo', terra: 'terra', ar: 'ar', água: 'água' };

export function getCardElement(card) {
  if (!card) return null;
  if (card.suit) {
    const bySuit = { paus: 'fogo', copas: 'água', espadas: 'ar', ouros: 'terra' };
    return bySuit[card.suit] || null;
  }
  const el = card.element;
  if (!el) return null;
  if (ELEMENT_LABEL[el]) return el; // O Louco (ar), O Enforcado (água), O Julgamento (fogo)
  return SIGN_ELEMENT[el] || null; // signo → elemento da triplicidade; planeta → null
}

const FRIENDLY = { fogo: 'ar', ar: 'fogo', água: 'terra', terra: 'água' };
const CONTRARY = { fogo: 'água', água: 'fogo', ar: 'terra', terra: 'ar' };

// 'igual' | 'amiga' | 'contrária' | 'passiva' | null
export function getElementalRelation(a, b) {
  if (!a || !b) return null;
  if (a === b) return 'igual';
  if (FRIENDLY[a] === b) return 'amiga';
  if (CONTRARY[a] === b) return 'contrária';
  return 'passiva';
}

// Nota de dignidade elemental da TIRAGEM de três. Devolve string ou null —
// nunca fabrica leitura quando a doutrina não se aplica.
export function getElementalDignity(cards) {
  if (!Array.isArray(cards) || cards.length !== 3) return null;
  const [left, center, right] = cards;
  const elC = getCardElement(center);
  if (!elC) return null;
  const elL = getCardElement(left);
  const elR = getCardElement(right);
  if (!elL && !elR) return null;

  const relL = getElementalRelation(elC, elL);
  const relR = getElementalRelation(elC, elR);
  const rels = [relL, relR].filter(Boolean);

  const iguais = rels.filter((r) => r === 'igual').length;
  const amigas = rels.filter((r) => r === 'amiga').length;
  const contrarias = rels.filter((r) => r === 'contrária').length;

  let veredito;
  if (contrarias === 2) {
    veredito = `${center.name} sai mal dignificada: os dois lados são contrários ao elemento dela, e a tradição diz que aí ela perde força — o assunto do meio não encontra apoio em nenhuma das duas casas vizinhas.`;
  } else if (contrarias === 1 && (iguais + amigas) === 1) {
    veredito = `${center.name} fica dividida: um lado sustenta o elemento dela e o outro é contrário, então a força dela depende de qual das duas casas você olhar.`;
  } else if (contrarias === 1) {
    veredito = `${center.name} sai enfraquecida por um dos lados, sem nada do outro que compense.`;
  } else if (iguais === 2) {
    veredito = `${center.name} sai muito reforçada: os três são do mesmo elemento, e a regra vale para os dois lados — reforça tanto o que a carta tem de bom quanto o que ela tem de duro.`;
  } else if (iguais + amigas === 2) {
    veredito = `${center.name} sai fortalecida: as duas vizinhas são do mesmo elemento ou de elemento amigo, e a tradição lê isso como energia que corre sem obstáculo.`;
  } else if (iguais + amigas === 1) {
    veredito = `${center.name} recebe apoio de um lado só; o outro é passivo, nem ajuda nem atrapalha.`;
  } else {
    veredito = `${center.name} fica em terreno passivo: nenhuma vizinha reforça nem contraria o elemento dela.`;
  }

  const vizinhas = [
    elL ? `${left.name} (${elL})` : `${left.name} (carta de planeta — fica fora desta regra)`,
    elR ? `${right.name} (${elR})` : `${right.name} (carta de planeta — fica fora desta regra)`,
  ].join(' e ');

  return `Nesta mesa de três, a carta do meio não se lê sozinha: as duas vizinhas reforçam ou enfraquecem a força dela, conforme o elemento de cada uma — fogo, água, ar ou terra. Aqui o meio é ${center.name}, de ${elC}, ladeado por ${vizinhas}. ${veredito} E não sou eu inventando: é a dignidade elemental, regra da tríade do "Book T" (S. L. MacGregor Mathers, fim do séc. XIX, publicada por Regardie em 1937-1940).`;
}

// Nota de tradição da carta, para quem quiser ver a costura por baixo: a
// atribuição Golden Dawn (decanato/elemento composto/raiz) com o título
// tradicional, e a leitura do grau. Devolve null quando a carta não tem esse
// dado (os 22 Maiores, cuja atribuição já está em card.element).
export function getCardTraditionNote(card) {
  if (!card) return null;
  const bits = [];
  if (card.astro) bits.push(card.tituloGD ? `${card.tituloGD} (${card.astro})` : card.astro);
  // Nos 22 Maiores a costura é a letra hebraica e a classe dela no Sepher
  // Yetzirah. A CLASSE vive aqui, e não na leitura, por uma razão de escrita:
  // "uma das doze simples" é verdadeira para doze cartas, e na leitura ela
  // gastava seis palavras dizendo o que só o número da classe torna útil — são
  // três mães, sete duplas e doze simples, e é porque as simples são doze que
  // os doze signos cabem nelas em ordem zodiacal. Isso é nota de rodapé, não é
  // o que a carta tem a dizer sobre a pergunta. Ver docs/tradicao/05, §4.1.
  if (card.letra) {
    const classe = SY_CLASS_PHRASE[card.classeSY];
    bits.push(classe ? `letra hebraica ${card.letra}, ${classe} do Sepher Yetzirah — o "Livro da Formação", texto antigo da mística judaica` : `letra hebraica ${card.letra}`);
  }
  if (card.caminho) bits.push(`caminho ${card.caminho} da Árvore da Vida, o mapa da Cabala`);
  if (card.grau) bits.push(card.grau);
  return bits.length ? bits.join(' · ') : null;
}

export { THEME_KEYS, POSITION_KEYS, RANK_ROLE };
export default getThemedMeaning;
