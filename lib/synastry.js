// lib/synastry.js
// SINASTRIA POR ASPECTO — o motor de compatibilidade entre dois signos.
//
// ===========================================================================
// O DEFEITO QUE ESTE ARQUIVO EXISTE PRA CORRIGIR (medido em 31/07/2026)
// ===========================================================================
// A versão anterior vivia em lib/signs.js, em duas tabelas de 10 entradas
// chaveadas só pelo PAR DE ELEMENTOS (`fogo+água`, `ar+ar`…). Consequências
// medidas, rodando as 144 combinações:
//
//   • 144 pares colapsavam em 10 textos e 10 notas — Áries+Leão, Áries+Sagitário
//     e Leão+Sagitário recebiam a MESMA frase, palavra por palavra;
//   • a nota mínima era 74 e a máxima 92, média 83,5. ZERO pares abaixo de 70.
//     Todo mundo combinava com todo mundo, e num app de astrologia isso não é
//     gentileza: é o usuário percebendo que a conta não existe;
//   • distância entre os signos — que é o ÚNICO dado que a tradição usa pra
//     falar de afinidade — não entrava na conta em lugar nenhum. Áries+Câncer
//     (quadratura, que Ptolomeu chama desarmônica) e Áries+Escorpião (aversão,
//     que ele chama "disjunta e alheia") recebiam os dois 74, porque os dois
//     são "fogo+água";
//   • `PCT[key] || 82` tinha um fallback inalcançável — as 10 chaves sempre
//     existiam —, o que escondia que o domínio da função era de 10 valores.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string daqui
// ===========================================================================
// (mesma disciplina de lib/zodiacBody.js e lib/grounding.js)
//
// 1. TRADIÇÃO COM FONTE. Toda afirmação sobre o que "a tradição diz" carrega o
//    capítulo. O verbatim inglês de Robbins (1940) fica SEM TRADUÇÃO, como o
//    latim de Manílio em lib/zodiacBody.js — traduzir citação é falsificá-la.
//
// 2. NUNCA DECRETAR DESTINO. A tradição descreve a NATUREZA do encontro, não o
//    desfecho. PROIBIDO: "vocês não vão dar certo", "essa relação acaba",
//    "termine", "procure outro", qualquer verbo no futuro sobre o casal, e
//    qualquer imperativo que decida pela pessoa. O próprio Ptolomeu, no mesmo
//    capítulo em que põe quadratura e oposição entre as posições de separação,
//    registra a união difícil que NÃO termina — ver VERBATIM.modificador.
//
// 3. INCISIVO NÃO É ASSUSTADOR. O modelo é o Cinco de Copas de Waite: nomeia a
//    perda ("é uma carta de perda") e ancora o que resta num FATO da imagem
//    ("três foram levadas, duas ficaram") — nunca num chavão de consolo. Aqui o
//    fato é geométrico: elemento, qualidade compartilhada, modalidade, eixo.
//
// 4. NENHUMA ALEGAÇÃO DE SAÚDE. Sem exceção, e sem metáfora. Nada de "cura",
//    "faz bem", "alivia", "energia que sara". Astrologia de relação descreve
//    relação.
//
// 5. NÃO INVENTAR TRADIÇÃO. O que é leitura do app vem rotulado como leitura do
//    app. O que a pesquisa não achou está em NAO_ACHADO e continua não achado —
//    não completar a lacuna com o que circula por aí.
//
// test/synastry.test.js segura tudo isso e falha o build. É de propósito.
// ===========================================================================
//
// ===========================================================================
// A DECISÃO DA PORCENTAGEM — o número saiu, e por quê
// ===========================================================================
// A pesquisa é categórica: NÃO existe percentual de compatibilidade em nenhuma
// fonte antiga, medieval ou renascentista. Ptolomeu dá CATEGORIAS qualitativas
// (harmônico, desarmônico, disjunto) e uma ESCALA ORDINAL de quatro degraus
// (IV.7) — nunca um número de 0 a 100. Pontuação numérica tradicional existe no
// Ocidente, mas mede outra coisa: a tabela de dignidades essenciais de Lilly
// (Christian Astrology, 1647) dá a FORÇA DE UM PLANETA numa carta, não a
// afinidade entre duas pessoas. (O intervalo exato dessa tabela não foi
// conferido no original nesta pesquisa — por isso nenhum número dela aparece
// em texto de tela.) A única pontuação de compatibilidade realmente tradicional
// que a pesquisa achou é o Ashtakoota indiano, de 36 pontos, por nakshatra e
// signo lunar: outra tradição, outro dado de entrada, e não legitima nada aqui.
// Nem Linda
// Goodman, que popularizou a compatibilidade por signo solar em 1968/1978, usa
// nota: ela escreve em prosa. Quem converteu isso em 0–100% é lacuna não
// fechada (ver NAO_ACHADO).
//
// Havia duas saídas possíveis: (a) trocar o número por rótulo qualitativo com o
// nome do aspecto, ou (b) manter um número declarando na tela que é índice do
// app. ESCOLHEMOS (a), inteira. Quatro razões, e a primeira é da própria casa:
//
//   1. O APP JÁ PROÍBE ISSO — PRA SI MESMO. O prompt da persona Luna
//      (server-patches/src/infrastructure/AnthropicChatProvider.js, "TRÊS
//      PROIBIÇÕES QUE NÃO TÊM EXCEÇÃO", item 3) diz literalmente: "Não atribua
//      porcentagem a compatibilidade nem a nada mais. Número de dois dígitos é
//      a forma mais forte de afirmar precisão que existe, e a tradição não
//      sustenta essa promessa." Com o número na roda, a Luna se recusa a dar
//      uma porcentagem no chat enquanto a tela ao lado imprime uma em 32px. O
//      produto discutindo consigo mesmo, e o usuário no meio.
//   2. RESSALVA NÃO NEUTRALIZA NÚMERO. Quem lê "54%" leva o 54; a linha miúda
//      embaixo dizendo "isto é índice do app" não é o que fica na cabeça nem o
//      que vai pro print no WhatsApp. Manter o número declarando que ele não
//      mede nada é pedir pro rodapé desmentir a manchete.
//   3. SETE VALORES FANTASIADOS DE CEM. O cálculo novo tem SETE resultados
//      possíveis. Exibi-los numa escala de 0 a 100 promete resolução de 1 em
//      100 sobre uma grandeza que tem 7 estados — é a mesma mentira de antes,
//      só com números melhores.
//   4. O ARGUMENTO DE COMPATIBILIDADE NÃO SE SUSTENTAVA. Diziam que o número
//      preservava o histórico já salvo no Diário Cósmico. Não preserva: se
//      Áries+Libra sai de 92 pra 54, a entrada antiga fica incoerente do mesmo
//      jeito. Já que a escala quebra em qualquer cenário, quebra pra melhor.
//
// O que entra no lugar: o NOME DO ASPECTO e a CATEGORIA da fonte — Trígono
// (harmônico), Aversão (sem aspecto) —, mais a geometria verificável (graus e
// signos de distância, que são fato, não nota). Ver ESCALA e NOTA_ESCALA.
// ===========================================================================
//
// ===========================================================================
// A ESCALA, E DE QUEM ELA É
// ===========================================================================
// CAMADA 1 — A CATEGORIA. Tem fonte antiga e não é opinião de ninguém:
//   trígono e sextil ......... HARMÔNICOS      (Tetrabiblos I.13, verbatim)
//   quadratura e oposição .... DESARMÔNICOS    (Tetrabiblos I.13, verbatim)
//   aversão (1 e 5 signos) ... SEM ASPECTO     (Tetrabiblos I.16, verbatim)
//   mesmo signo .............. CO-PRESENÇA     (não é aspecto: Ptolomeu enumera
//                                               quatro, e conjunção não está)
//
// CAMADA 2 — A ORDEM. Também é da fonte, e é ORDINAL de quatro degraus, não
// contínua. Ptolomeu, Tetrabiblos IV.7 (Dos amigos e inimigos), é o único lugar
// em que a tradição ocidental ordena configurações entre DUAS cartas:
//
//   grau 1  mesmo signo / troca de lugares .... "secure and indissoluble
//                                                sympathy, unbroken by any
//                                                quarrel"
//   grau 2  trígono ou sextil .................. "they make the sympathies less"
//   grau 3  quadratura ......................... "in quartile, the antipathies
//                                                less"
//   grau 4  disjuntos (aversão) ou oposição .... "the deepest enmities and
//                                                lasting contentions"
//
// Três coisas que essa escala corrige de uma vez, e nenhuma delas é invenção
// nossa — está no texto:
//   • a OPOSIÇÃO não é o topo. Ela está no ÚLTIMO degrau, junto da aversão.
//     No app antigo era a nota máxima (Áries+Libra = 92).
//   • a AVERSÃO não é a quadratura. São degraus diferentes (4 e 3), e a
//     quadratura é explicitamente a antipatia MENOR.
//   • o TRÍGONO não é o melhor vínculo possível: o mesmo signo está acima dele.
//     Māshāʾallāh (Book of Aristotle III.7.11) aponta na mesma direção.
//
// E uma coisa que a escala NÃO faz, de propósito: separar trígono de sextil.
// IV.7 põe os dois no mesmo degrau ("they make the sympathies less"), e I.13 os
// chama de harmônicos sem hierarquia. Quem ordena os dois é William Lilly
// (Christian Astrology, 1647, p. 106: "the Trine is more forcible") — séc. XVII,
// inglês, e por isso a diferença aparece no TEXTO, nomeada como dele, e nunca
// no grau. Dizer "o trígono é o mais harmônico dos aspectos de Ptolomeu" seria
// atribuir a Ptolomeu uma ordem que ele não escreve.
//
// A OPOSIÇÃO tem ainda uma ressalva que o texto dela carrega inteira: a
// justificativa que Ptolomeu dá em I.13 para chamá-la de desarmônica ("signos
// de tipos opostos") NÃO fecha para ela. Os "tipos" são os gêneros de I.12, que
// alternam um a um a partir de Áries; a seis signos de distância o gênero é
// sempre o MESMO. A razão sustenta a quadratura, não a oposição — e é por isso
// que a leitura da oposição cita o furo em vez de repetir a frase como se ela
// fechasse.
//
// O grau é ORDEM, não medida: 4 não é "o dobro de ruim" de 2, e não vira
// porcentagem em lugar nenhum. E ele descreve a NATUREZA do encontro — o que
// IV.5 impede de virar sentença está em VERBATIM.modificador, que acompanha
// TODA leitura de aspecto duro.
//
// O que continua sendo leitura DO APP, e está dito como tal na própria frase:
//   • distinguir a quadratura de contrários absolutos (fogo-água, ar-terra) da
//     quadratura que compartilha uma qualidade (fogo-terra, ar-água). A física
//     é de Aristóteles (Da Geração e Corrupção II.3); usá-la pra graduar
//     quadraturas é nosso. Por isso NÃO muda o grau — só o texto.
//   • dizer que a dureza da oposição é de POSIÇÃO e não de elemento. Isso é
//     aritmética conferível (signos opostos compartilham uma qualidade, e são
//     os mesmos pares de elemento que o sextil junta), e é o motivo de este
//     arquivo nunca explicar a oposição por "elementos incompatíveis" — seria
//     falso, e é o erro que a tabela antiga cometia.
// ===========================================================================

// ---------------------------------------------------------------------------
// 1. AS QUALIDADES DOS ELEMENTOS (Aristóteles, Da Geração e Corrupção II.3)
// ---------------------------------------------------------------------------
// Cada corpo simples tem duas das quatro qualidades primárias, e os contrários
// não se acoplam — daí só existirem quatro combinações. As chaves casam byte a
// byte com o campo `element` de lib/signs.js, que é de onde os signos chegam.
export const ARISTOTELES_LOCUS = 'Aristóteles, Da Geração e Corrupção II.3';

export const QUALIDADES = {
  fogo: ['quente', 'seco'],
  ar: ['quente', 'úmido'],
  água: ['frio', 'úmido'],
  terra: ['frio', 'seco'],
};

const ARTIGO = { fogo: 'o fogo', ar: 'o ar', água: 'a água', terra: 'a terra' };

// A qualidade que dois elementos têm em comum. Vazio = contrários absolutos
// (fogo-água e ar-terra são os únicos dois casos).
export function qualidadesEmComum(elementoA, elementoB) {
  const a = QUALIDADES[elementoA] || [];
  const b = QUALIDADES[elementoB] || [];
  return a.filter((q) => b.includes(q));
}

export function qualidadesFrase(elemento) {
  const q = QUALIDADES[elemento];
  return q ? `${q[0]} e ${q[1]}` : '';
}

// ---------------------------------------------------------------------------
// 2. AS MODALIDADES (Ptolomeu, Tetrabiblos I.11)
// ---------------------------------------------------------------------------
// Ptolomeu não fala em "modalidade": ele nomeia signos SOLSTICIAIS E
// EQUINOCIAIS, SÓLIDOS e BICORPÓREOS, e o critério dele é sazonal — o que o Sol
// faz com a estação quando entra em cada grupo. "Cardeal/fixo/mutável" é o nome
// posterior corrente para os mesmos três grupos, e a glosa abaixo fica presa à
// imagem SAZONAL da fonte, de propósito: descrever cardeal como "quem toma a
// iniciativa" e fixo como "quem é teimoso" é psicologia do séc. XX, não
// Tetrabiblos, e este arquivo não faz esse salto.
//
// A modalidade é ARITMÉTICA no zodíaco (índice % 3) — por isso não há tabela
// aqui, e por isso não pode haver divergência com lib/signs.js.
export const PTOLOMEU_MODALIDADE_LOCUS = 'Ptolomeu, Tetrabiblos I.11';

export const MODALIDADES = [
  {
    id: 'cardeal',
    nome: 'cardeal',
    ptolomeu: 'solsticial ou equinocial',
    glosa: 'a estação vira quando o Sol entra neles',
  },
  {
    id: 'fixo',
    nome: 'fixo',
    ptolomeu: 'sólido',
    glosa: 'a estação já está firmada quando o Sol está neles',
  },
  {
    id: 'mutavel',
    nome: 'mutável',
    ptolomeu: 'bicorpóreo',
    glosa: 'ficam entre duas estações e participam das duas',
  },
];

export function modalidadePorIndice(indice) {
  return MODALIDADES[((indice % 3) + 3) % 3];
}

// ---------------------------------------------------------------------------
// 3. AS CITAÇÕES — verbatim de Robbins (Loeb/Harvard, 1940), SEM tradução
// ---------------------------------------------------------------------------
// Mesma regra do latim de Manílio em lib/zodiacBody.js. A tela mostra o inglês
// e, ao lado, o que ele estabelece — nunca uma "tradução" nossa passando por
// citação.
export const VERBATIM = {
  quatroAspectos: {
    texto:
      'Of the parts of the zodiac those first are familiar one to another which are in aspect. These are the ones which are in opposition... those which are in trine... those which are said to be in quartile... and finally those that occupy the sextile position.',
    locus: 'Ptolomeu, Tetrabiblos I.13 (Dos aspectos dos signos), trad. Robbins, 1940',
  },
  harmonicos: {
    texto:
      'Of these aspects trine and sextile are called harmonious because they are composed of signs of the same kind, either entirely of feminine or entirely of masculine signs; while quartile and opposition are disharmonious because they are composed of signs of opposite kinds.',
    locus: 'Ptolomeu, Tetrabiblos I.13, trad. Robbins, 1940',
  },
  disjuntos: {
    texto:
      "'Disjunct' and 'alien' are the names applied to those divisions of the zodiac which have none whatever of the aforesaid familiarities with one another... they are found to be entirely without share in the four aforesaid aspects, opposition, trine, quartile, and sextile, and are either one or five signs apart; for those which are one sign apart are as it were averted from one another...",
    locus: 'Ptolomeu, Tetrabiblos I.16 (Dos signos disjuntos), trad. Robbins, 1940',
  },
  duradouro: {
    texto:
      "Marriages for the most part are lasting when in both the genitures the luminaries happen to be in harmonious aspect, that is, in trine or in sextile with one another, and particularly when this comes about by exchange, and even more when the husband's moon is in such aspect with the wife's sun.",
    locus: 'Ptolomeu, Tetrabiblos IV.5 (Do casamento), trad. Robbins, 1940',
  },
  separacao: {
    texto:
      'Divorces on slight pretexts and complete alienations occur when the aforesaid positions of the luminaries are in disjunct signs, or in opposition or in quartile.',
    locus: 'Ptolomeu, Tetrabiblos IV.5, trad. Robbins, 1940',
  },
  modificador: {
    texto:
      'When the luminaries are in inharmonious positions, the beneficent planets testifying to the luminaries do not completely terminate the marriages, but bring about renewals and recollections, which preserve kindness and affection.',
    locus: 'Ptolomeu, Tetrabiblos IV.5, trad. Robbins, 1940',
  },
  // A ÚNICA escala ordenada de configurações entre duas cartas que a tradição
  // ocidental produziu. É daqui que sai o `grau` de cada leitura — e é ela que
  // põe a oposição no último degrau, junto da aversão, e não no primeiro.
  escala: {
    texto:
      'In inquiries regarding matters of importance we must observe the places in both nativities which have the greatest authority, that is, those of the sun, the moon, the horoscope, and the Lot of Fortune; for if they chance to fall in the same signs of the zodiac, or if they exchange places, either all or most of them... they bring about secure and indissoluble sympathy, unbroken by any quarrel. However, if they are in disjunct signs or opposite signs, they produce the deepest enmities and lasting contentions. If they chance to be situated in neither of these ways, but merely in signs which bear an aspect to one another, if they are in trine or in sextile, they make the sympathies less, and in quartile, the antipathies less.',
    locus: 'Ptolomeu, Tetrabiblos IV.7 (Dos amigos e inimigos), trad. Robbins, 1940',
  },
};

// ---------------------------------------------------------------------------
// 4. A GEOMETRIA
// ---------------------------------------------------------------------------
// Distância em SIGNOS pelo caminho mais curto: 0 a 6. Aspecto por signo inteiro
// (whole sign), que é como Ptolomeu raciocina em I.13 — ele conta signos, não
// graus, e é por isso que o app pode falar de aspecto tendo só o signo solar.
export function distanciaEmSignos(indiceA, indiceB) {
  const d = (((indiceB - indiceA) % 12) + 12) % 12;
  return d > 6 ? 12 - d : d;
}

export function grausDoAspecto(distancia) {
  return distancia * 30;
}

// distância (0-6) → identidade do aspecto. Repare no 1 e no 5: os dois são
// aversão, e é essa a única leitura fiel de I.16 ("either one or five signs
// apart"). O 0 NÃO é conjunção: Ptolomeu enumera quatro aspectos e conjunção
// não está entre eles — signos no mesmo lugar não se olham, estão juntos.
//
// Duas chaves, de propósito:
//   ASPECTO_POR_DISTANCIA  → a FAMÍLIA (o nome do aspecto). 'aversao' aparece
//                            duas vezes porque as duas distâncias são o mesmo
//                            aspecto na fonte.
//   ID_POR_DISTANCIA       → o ID ÚNICO das SETE relações. Aversão de 30° e de
//                            150° são leituras diferentes (o texto de cada uma
//                            fala da distância real), e nada no app pode
//                            colapsar as duas de novo.
const ASPECTO_POR_DISTANCIA = ['copresenca', 'aversao', 'sextil', 'quadratura', 'trigono', 'aversao', 'oposicao'];
const ID_POR_DISTANCIA = ['copresenca', 'aversao30', 'sextil', 'quadratura', 'trigono', 'aversao150', 'oposicao'];

// ---------------------------------------------------------------------------
// 5. A ESCALA — ordinal, de quatro degraus, e de Ptolomeu IV.7
// ---------------------------------------------------------------------------
// Ver o cabeçalho "A ESCALA, E DE QUEM ELA É". Isto NÃO é nota e NÃO vira
// porcentagem: é a ordem em que a própria fonte põe as configurações entre duas
// cartas. `grau` vai de 1 (o vínculo que IV.7 chama de indissolúvel) a 4 (o
// grupo que ele põe no fundo — aversão E oposição, juntas).
//
// Por que o grau existe, se o nome do aspecto já aparece na tela: porque sem
// ordem explícita a próxima pessoa a mexer aqui inventa uma. Já aconteceu: a
// tabela antiga ordenava por elemento e deixava a oposição no topo.
export const GRAUS_IV7 = {
  1: 'simpatia segura e indissolúvel',
  2: 'simpatia, e a fonte diz que menor',
  3: 'antipatia, e a fonte diz que menor',
  4: 'o grupo que a fonte põe no fundo',
};

export const ESCALA = {
  copresenca: 1,
  trigono: 2,
  sextil: 2,
  quadratura: 3,
  oposicao: 4,
  aversao: 4,
};

// Categorias — o vocabulário da própria tradição, que é o que substitui a nota
// como resultado principal da tela. O `id` é o que a tela usa pra achar a
// tradução; o valor é o termo em português.
export const CATEGORIAS = {
  harmonico: 'harmônico',
  desarmonico: 'desarmônico',
  semAspecto: 'sem aspecto',
  copresenca: 'co-presença',
};

// As chaves de tradução do NOME do aspecto e da CATEGORIA. Ficam aqui, ao lado
// dos ids que elas traduzem, pra não ser possível renomear um id sem ver a
// chave — foi assim que a tela e o motor se desencontraram na versão antiga.
// Só o rótulo é traduzido: o corpo da leitura continua em português nos três
// idiomas, o mesmo gap conhecido e documentado no cabeçalho de lib/i18n.js.
export const CHAVES_DE_TRADUCAO = {
  aspecto: {
    trigono: 'compat.aspect.trigono',
    sextil: 'compat.aspect.sextil',
    quadratura: 'compat.aspect.quadratura',
    oposicao: 'compat.aspect.oposicao',
    aversao: 'compat.aspect.aversao',
    copresenca: 'compat.aspect.copresenca',
  },
  categoria: {
    harmonico: 'compat.category.harmonico',
    desarmonico: 'compat.category.desarmonico',
    semAspecto: 'compat.category.semAspecto',
    copresenca: 'compat.category.copresenca',
  },
};

// ---------------------------------------------------------------------------
// 6. AS RESSALVAS QUE ANDAM JUNTO COM TODA LEITURA
// ---------------------------------------------------------------------------
export const NOTA_ESCALA =
  'Aqui não tem porcentagem, e a ausência é deliberada. Não existe nota de compatibilidade entre signos em nenhuma fonte ocidental antiga, medieval ou renascentista: Ptolomeu dá categorias — harmônico, desarmônico, disjunto — e, no capítulo dos amigos e inimigos, uma escala de quatro degraus e uma contagem de quantos lugares concordam ("either all or most of them"), sem unidade. Pontuação numérica tradicional existe no Ocidente, mas é outra coisa: a tabela de dignidades essenciais de William Lilly (Christian Astrology, Londres, 1647) mede a força de UM planeta numa carta, não a afinidade entre duas pessoas. E a única pontuação de compatibilidade de fato tradicional que a pesquisa achou não é ocidental — é o Ashtakoota indiano, de 36 pontos, calculado por nakshatra e signo lunar, jamais por signo solar; outra tradição, outra escala, outro dado de entrada. Um número de dois dígitos é a forma mais forte de afirmar precisão que existe, e nada aqui sustenta essa promessa — então o app mostra o aspecto, que é geometria conferível, e o que a fonte diz dele.';

export const NOTA_GRAU =
  'O grau é ordem, não medida. Vem de Ptolomeu, Tetrabiblos IV.7, que ordena as configurações entre duas cartas em quatro degraus e para por aí: grau 4 não é "o dobro de ruim" de grau 2, e nenhum dos quatro é um veredito. No mesmo Tetrabiblos, IV.5, ele registra a união em posição desarmônica que NÃO termina.';

export const RESSALVA_SIGNO_SOLAR =
  'Isto compara signo solar com signo solar, e esse recorte é de coluna de jornal: nasceu com R. H. Naylor no Sunday Express de 24 de agosto de 1930, virou a coluna semanal "Your Stars" e passou a dividir os leitores em doze blocos por data de nascimento. A sinastria antiga é outra coisa — no capítulo do casamento (IV.5) Ptolomeu compara o Sol e a Lua das duas cartas, com peso especial na Lua de um sobre o Sol do outro; e no capítulo de onde sai o grau desta tela (IV.7) ele compara QUATRO lugares de cada carta: Sol, Lua, Ascendente e Parte da Fortuna. O aspecto abaixo é real e a fonte dele está citada; aplicar a escala de IV.7 a um par de signos solares é simplificação deste app, e o app prefere dizer isso a fingir que não.';

// ---------------------------------------------------------------------------
// 7. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/grounding.js e NOT_VERIFIED em
// lib/zodiacBody.js: dizer que não se achou impede que a próxima pessoa a
// editar preencha a lacuna com a versão que circula por aí.
export const NAO_ACHADO = [
  {
    id: 'percentual',
    texto:
      'Quem, quando e onde converteu as categorias de Ptolomeu numa nota de 0 a 100%. Não achamos e não completamos a lacuna. O que dá pra afirmar é o negativo: o percentual não está em Ptolomeu, não está na astrologia tradicional e nem sequer está em Linda Goodman, que escreve em prosa, signo por signo.',
  },
  {
    id: 'regentesInimigos',
    texto:
      'Fonte ocidental antiga dizendo que signo regido por Marte não combina com signo regido por Vênus. Tabelas de amizade e inimizade entre planetas existem (al-Biruni, 1029; e arranjos que divergem entre si em Lilly, Ramesey, Coley e Raphael), mas tratam planeta com planeta e não são aplicadas a casais — e o próprio Ptolomeu contraria o clichê, registrando que Saturno com Vênus produz uniões estáveis. Por isso regência de planeta NÃO entra nesta conta.',
  },
  {
    id: 'graduacaoQuadraturas',
    texto:
      'Texto antigo que gradue uma quadratura como pior que outra. A física dos elementos de Aristóteles é antiga e verificável, e é dela que sai a distinção entre quadratura de contrários absolutos e quadratura que compartilha uma qualidade — mas o uso dela para ordenar quadraturas é leitura deste app, não citação.',
  },
  {
    id: 'firmicus',
    texto:
      'A passagem verbatim de Firmicus Materno (Mathesis, séc. IV) sobre o sétimo lugar como casa do casamento. A atribuição é consenso na astrologia helenística e por isso é citada; a linha exata não foi conferida no original.',
  },
  {
    id: 'tomDeVoz',
    texto:
      'Qualquer prescrição antiga sobre o TOM de uma leitura — direto, ambíguo, aberto. O tom deste app não se justifica pela antiguidade: ele imita o registro seco das fontes e segue ética contemporânea de leitor, que é contemporânea mesmo.',
  },
];

export const FONTES = [
  'Ptolomeu, Tetrabiblos I.13, Dos aspectos dos signos (trad. F. E. Robbins, Loeb/Harvard, 1940) — os quatro aspectos; trígono e sextil harmônicos, quadratura e oposição desarmônicas — https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Ptolemy/Tetrabiblos/1B*.html',
  'Ptolomeu, Tetrabiblos I.16, Dos signos disjuntos — aversão a 1 e 5 signos: sem nenhuma familiaridade, "disjunct and alien"',
  'Ptolomeu, Tetrabiblos I.11 — signos solsticiais e equinociais, sólidos e bicorpóreos (o que hoje se chama modalidade)',
  'Ptolomeu, Tetrabiblos IV.5, Do casamento — a sinastria antiga compara os luminares das duas cartas; e o modificador que impede o determinismo — https://www.skyscript.co.uk/tet4.html',
  'Aristóteles, Da Geração e Corrupção II.3 — quente, frio, seco e úmido: as qualidades dos quatro elementos — https://sacred-texts.com/cla/ari/ogc/ogc13.htm',
  'Julius Firmicus Maternus, Mathesis, séc. IV — o sétimo lugar (o Descendente) como lugar da união (atribuição consensual; passagem não conferida verbatim)',
  'William Lilly, Christian Astrology, Londres, 1647 — dignidades essenciais e a tabela de fortitudes (+38 a −38): o único sistema de pontuação realmente tradicional, e ele não mede compatibilidade',
  'R. H. Naylor, Sunday Express, 24/08/1930 — o nascimento do horóscopo por signo solar na imprensa — https://en.wikipedia.org/wiki/R._H._Naylor',
  'Linda Goodman, Sun Signs (1968) e Love Signs (1978) — a popularização da compatibilidade por signo solar, em prosa e sem percentuais',
  'Nicholas Campion, A History of Western Astrology, vol. II, Continuum, 2009 — cap. sobre o séc. XX, a psicologia e a imprensa popular',
];

// ---------------------------------------------------------------------------
// 8. A LEITURA
// ---------------------------------------------------------------------------
// Cada aspecto tem seu próprio construtor, e cada construtor monta a frase com
// os FATOS DAQUELE PAR: os dois elementos pelo nome, as qualidades de cada um,
// a qualidade que compartilham (ou a ausência dela), as duas modalidades, o
// eixo quando é oposição, a distância exata quando é aversão. É de propósito
// que não exista um molde único com o miolo trocado — foi exatamente esse o
// defeito que o dono apontou no Tarô, e ele vale igual aqui.
//
// `sa` e `sb` são { name, element, emoji, index }.

function ctx(sa, sb) {
  const modA = modalidadePorIndice(sa.index);
  const modB = modalidadePorIndice(sb.index);
  const comum = qualidadesEmComum(sa.element, sb.element);
  return {
    A: sa.name,
    B: sb.name,
    elemA: sa.element,
    elemB: sb.element,
    artA: ARTIGO[sa.element],
    artB: ARTIGO[sb.element],
    qA: qualidadesFrase(sa.element),
    qB: qualidadesFrase(sb.element),
    modA,
    modB,
    comum,
  };
}

function lerTrigono(sa, sb) {
  const c = ctx(sa, sb);
  return {
    aspecto: 'Trígono',
    natureza: 'afinidade por identidade',
    categoria: CATEGORIAS.harmonico,
    resumo: `${c.A} e ${c.B} em trígono: quatro signos, mesmo elemento — ${c.elemA}. A tradição chama esta figura de harmônica.`,
    texto:
      `Trígono: quatro signos de distância, 120 graus. Ptolomeu o chama de harmônico — mas junto com o sextil, e sem pôr um acima do outro: ` +
      `em Tetrabiblos IV.7 os dois caem no MESMO degrau ("they make the sympathies less"). Quem ordena os dois é William Lilly, ` +
      `Christian Astrology (Londres, 1647, p. 106): sextil e trígono são "arguments of Love, Unity and Friendship; but the Trine is more forcible". ` +
      `Isso é tradição inglesa do séc. XVII, não Ptolomeu, e por isso não muda o degrau aqui. ` +
      `${c.A} e ${c.B} são do mesmo elemento, ${c.elemA}, e portanto das mesmas duas qualidades: ${c.qA}. ` +
      `Não há tradução a fazer entre vocês — o mesmo tipo de coisa move os dois. ` +
      `O que muda é a modalidade: ${c.A} é ${c.modA.nome} (${c.modA.glosa}) e ${c.B} é ${c.modB.nome} (${c.modB.glosa}). ` +
      `Muda a hora de entrar, não o que importa.`,
    forte:
      `Reconhecimento sem esforço: ${c.elemA} lendo ${c.elemA}. Vocês não gastam energia explicando o óbvio um pro outro, ` +
      `e no capítulo do casamento é justamente o trígono entre os luminares que Ptolomeu associa às uniões que duram.`,
    cuidado:
      `O que a geometria não entrega aqui é atrito. Trígono descreve facilidade, e facilidade não empurra ninguém do lugar — ` +
      `o que precisar mudar entre ${c.A} e ${c.B} vai ter que partir de vocês, porque o aspecto não vai cobrar. ` +
      `(Esta última frase é leitura do app: Ptolomeu diz "harmônico" e para por aí.)`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.duradouro],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — trígono é harmônico; quatro signos, 120 graus',
      'Ptolomeu, Tetrabiblos IV.7 — trígono e sextil no MESMO degrau: "they make the sympathies less"',
      'William Lilly, Christian Astrology, Londres, 1647, Livro I, p. 106 — "the Trine is more forcible": a ordem entre os dois harmônicos é dele, não de Ptolomeu',
      'Ptolomeu, Tetrabiblos IV.5 — luminares em trígono entre as duas cartas: uniões duradouras',
      ARISTOTELES_LOCUS + ' — as duas qualidades do elemento ' + c.elemA,
    ],
  };
}

function lerSextil(sa, sb) {
  const c = ctx(sa, sb);
  const q = c.comum[0];
  return {
    aspecto: 'Sextil',
    natureza: 'afinidade por uma qualidade em comum',
    categoria: CATEGORIAS.harmonico,
    resumo: `${c.A} e ${c.B} em sextil: dois signos, e o ${q} em comum. Harmônico em Tetrabiblos I.13.`,
    texto:
      `Sextil: dois signos de distância, 60 graus — harmônico em Tetrabiblos I.13, e no MESMO degrau do trígono em IV.7. ` +
      `Chamar o sextil de o mais brando dos dois é de William Lilly (Christian Astrology, 1647, p. 106: "the Trine is more forcible"), não de Ptolomeu. ` +
      `${c.A} é ${c.qA}; ${c.B} é ${c.qB}. O que os dois têm em comum é uma qualidade só: o ${q}. ` +
      `Não é a identidade do trígono, é meio caminho — e meio caminho, na conta de Ptolomeu, já basta pra dois signos se verem: ` +
      `${c.artA} e ${c.artB} são da mesma polaridade. As modalidades divergem (${c.A} ${c.modA.nome}, ${c.B} ${c.modB.nome}), então o tempo de cada um é diferente.`,
    forte:
      `Um ponto de contato real — o ${q} — e nenhuma obrigação de ser igual no resto. ` +
      `Ptolomeu põe o sextil ao lado do trígono entre os aspectos de união duradoura.`,
    cuidado:
      `Sextil é contato, não fusão: o encaixe é de uma qualidade só, e as outras duas ficam de fora da conta. ` +
      `Onde ${c.A} é ${c.qA.split(' e ')[1]} e ${c.B} não é, ninguém está errado — está apenas em outro elemento.`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.duradouro],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — sextil é harmônico; dois signos, 60 graus',
      'Ptolomeu, Tetrabiblos IV.7 — sextil e trígono no MESMO degrau: "they make the sympathies less"',
      'William Lilly, Christian Astrology, Londres, 1647, Livro I, p. 106 — "the Trine is more forcible": a ordem entre os dois harmônicos é dele, não de Ptolomeu',
      'Ptolomeu, Tetrabiblos IV.5 — luminares em sextil: uniões duradouras',
      ARISTOTELES_LOCUS + ` — ${c.elemA} e ${c.elemB} compartilham o ${q}`,
    ],
  };
}

function lerQuadratura(sa, sb) {
  const c = ctx(sa, sb);
  const contrarios = c.comum.length === 0;
  const mod = c.modA; // quadratura é sempre a MESMA modalidade — aritmética do zodíaco
  const abertura = contrarios
    ? `${c.A} é ${c.qA}; ${c.B} é ${c.qB}: nenhuma qualidade em comum. ` +
      `Pela física de Aristóteles, ${c.artA} e ${c.artB} são contrários absolutos — é o caso mais duro que uma quadratura pode ter.`
    : `${c.A} é ${c.qA}; ${c.B} é ${c.qB}. Os dois ainda compartilham o ${c.comum[0]} — um fio em comum, e um só. ` +
      `Não é o pior caso da própria quadratura: contrários absolutos, pela física de Aristóteles, seriam elementos sem nenhuma qualidade em comum.`;
  return {
    aspecto: 'Quadratura',
    natureza: contrarios ? 'atrito entre contrários absolutos' : 'atrito com um fio em comum',
    categoria: CATEGORIAS.desarmonico,
    resumo: `${c.A} e ${c.B} em quadratura: três signos, os dois ${mod.nome}. Desarmônica na fonte — atrito, e a fonte não decide o resto.`,
    texto:
      `Quadratura: três signos de distância, 90 graus. Ptolomeu a lista entre os aspectos DESARMÔNICOS, e dá o motivo — ` +
      `é composta de "signos de tipos opostos". ${abertura} ` +
      `E os dois são ${mod.nome} (${mod.ptolomeu} em Ptolomeu: ${mod.glosa}): mesmo tempo interno, alvos diferentes. ` +
      `Vocês disputam o mesmo território.`,
    forte:
      `Vocês se veem. Quadratura é aspecto — os dois lados se enxergam e se reconhecem, e é exatamente por isso que conseguem brigar, ` +
      `se irritar e eventualmente se acertar. A aversão, que é o "não combina" de verdade da tradição, não permite nem a briga.`,
    cuidado:
      `Aqui dói, e a tradição não finge que não: no capítulo do casamento, Ptolomeu põe a quadratura ao lado da oposição e dos signos disjuntos ` +
      `entre as posições em que ocorrem separações. E, no MESMO capítulo, ele nega o determinismo — com os benéficos testemunhando os luminares, ` +
      `a união em posição desarmônica não termina, e traz "recomeços e lembranças, que preservam gentileza e afeto". ` +
      `Aspecto tenso descreve por que a relação dói onde dói. Não decide o desfecho, e este app não decide por você.`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — quadratura é desarmônica: "signos de tipos opostos"',
      'Ptolomeu, Tetrabiblos IV.5 — separação; e o modificador que impede a sentença',
      ARISTOTELES_LOCUS +
        (contrarios
          ? ` — ${c.elemA} e ${c.elemB} não compartilham nenhuma qualidade`
          : ` — ${c.elemA} e ${c.elemB} compartilham o ${c.comum[0]}`),
      'Ptolomeu, Tetrabiblos I.11 — quadratura cai sempre entre signos da mesma modalidade (aqui, ' + mod.nome + ')',
    ],
  };
}

function lerOposicao(sa, sb) {
  const c = ctx(sa, sb);
  const q = c.comum[0];
  const mod = c.modA; // oposição também é sempre a mesma modalidade
  return {
    aspecto: 'Oposição',
    natureza: 'eixo — o confronto que a tradição chama de lugar da união',
    categoria: CATEGORIAS.desarmonico,
    resumo: `${c.A} e ${c.B} no mesmo eixo: seis signos, 180 graus. Desarmônica na fonte, e a tensão é de posição — não de elemento.`,
    texto:
      `Oposição: o eixo ${c.A}–${c.B}, seis signos, 180 graus. Ptolomeu a lista entre os desarmônicos, e a tradição a atribui a Saturno. ` +
      `Só que o motivo que ele mesmo dá NÃO fecha aqui, e isto é aritmética que qualquer pessoa confere: em I.13 quadratura e oposição seriam desarmônicas ` +
      `"porque são compostas de signos de tipos opostos", e os tipos são os gêneros de I.12, que se alternam um a um a partir de Áries — ` +
      `logo dois signos a SEIS de distância caem sempre no MESMO gênero. A justificativa sustenta a quadratura; a oposição, não. ` +
      `Pelo elemento também não se explica: ${c.artA} e ${c.artB} compartilham o ${q}, e são exatamente os mesmos pares de elemento que o sextil junta. ` +
      `A dureza da oposição não é de elemento, é de posição — é o eixo, e é como eixo que IV.7 a põe no degrau de baixo em vez de entre os harmônicos. ` +
      `Os dois são ${mod.nome} (${mod.glosa}) — dois polos com o mesmo tempo interno.`,
    forte:
      `O que falta em um sobra no outro, e não por acaso: é o mesmo eixo visto dos dois lados. ` +
      `Nenhum outro par de signos se completa por um motivo tão estrutural quanto este. ` +
      `(Na tradição o lugar da união é o sétimo LUGAR, o Descendente, e ele se conta a partir do Ascendente — não do signo solar. ` +
      `Ler o sétimo signo a partir do Sol é atalho deste app, não doutrina antiga.)`,
    cuidado:
      `Encontro de iguais em polos contrários: vocês se completam e se enfrentam pelo mesmo motivo, e o motivo não vai embora. ` +
      `Ptolomeu põe a oposição entre as posições de separação — e, na mesma página, registra que benéficos testemunhando os luminares ` +
      `trazem "recomeços e lembranças, que preservam gentileza e afeto". Descrição da natureza do encontro, não do fim dele.`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — oposição é desarmônica; seis signos, 180 graus',
      'Ptolomeu, Tetrabiblos I.12 — os gêneros dos signos alternam um a um a partir de Áries: por isso signos opostos são sempre do MESMO gênero, e a justificativa de I.13 não se aplica à oposição',
      'Ptolomeu, Tetrabiblos IV.5 — separação; e o modificador que impede a sentença',
      ARISTOTELES_LOCUS + ` — ${c.elemA} e ${c.elemB} compartilham o ${q}: elementos compatíveis`,
      'Julius Firmicus Maternus, Mathesis, séc. IV — o sétimo LUGAR (o Descendente, contado do Ascendente) como lugar da união (atribuição consensual; verbatim não conferido)',
    ],
  };
}

function lerAversao(sa, sb, distancia) {
  const c = ctx(sa, sb);
  const umSigno = distancia === 1;
  const abertura = umSigno
    ? `${c.A} e ${c.B} estão a UM signo de distância, 30 graus. Ptolomeu descreve esses signos como estando "como que desviados um do outro".`
    : `${c.A} e ${c.B} estão a CINCO signos de distância, 150 graus. Ptolomeu os põe fora dos quatro aspectos, junto com os vizinhos de 30 graus.`;
  return {
    aspecto: 'Aversão',
    natureza: umSigno ? 'signos disjuntos — vizinhos que não se veem' : 'signos disjuntos — distantes que não se veem',
    categoria: CATEGORIAS.semAspecto,
    resumo: `${c.A} e ${c.B} a ${distancia} ${umSigno ? 'signo' : 'signos'} de distância: Ptolomeu não registra aspecto entre estes dois — eles não se veem.`,
    texto:
      `${abertura} Isto NÃO é um aspecto: ele chama esses signos de "disjuntos e alheios", e diz que não têm familiaridade nenhuma um com o outro. ` +
      `O critério é óptico — signos em aspecto se veem; estes não se veem. ` +
      `E não há nada nos dois eixos pra segurar: ${c.A} é ${c.elemA} ${c.modA.nome}, ${c.B} é ${c.elemB} ${c.modB.nome}. ` +
      `Nem elemento nem modalidade em comum. Este é o "não combina" da tradição — e não a quadratura, como se costuma dizer por aí.`,
    forte:
      `Nada aqui é herdado. Se existe reconhecimento entre ${c.A} e ${c.B}, ele foi construído por vocês dois — ` +
      `a geometria não tem como levar crédito por isso, e a rigor nem tem o que dizer.`,
    cuidado:
      `Aversão não é briga: é ausência de reconhecimento automático, dois signos que não se registram. É o ponto de partida mais desfavorável da tradição, ` +
      `e é também o ponto em que a leitura por signo solar mostra o seu limite — a sinastria de Ptolomeu não compara signo solar com signo solar, ` +
      `compara o Sol e a Lua das duas cartas inteiras. Isto descreve o começo, não o fim: nenhum texto antigo decreta o desfecho de nada a partir de dois signos.`,
    verbatins: [VERBATIM.disjuntos, VERBATIM.separacao],
    fontes: [
      'Ptolomeu, Tetrabiblos I.16 — signos disjuntos e alheios, a um ou a cinco signos de distância',
      'Ptolomeu, Tetrabiblos IV.5 — luminares em signos disjuntos entre as posições de separação',
      ARISTOTELES_LOCUS + ` — ${c.elemA} e ${c.elemB}: elementos distintos`,
      'Ptolomeu, Tetrabiblos I.11 — modalidades distintas (' + c.modA.nome + ' e ' + c.modB.nome + ')',
    ],
  };
}

function lerCopresenca(sa) {
  const mod = modalidadePorIndice(sa.index);
  const elem = sa.element;
  return {
    aspecto: 'Co-presença',
    natureza: 'mesmo signo — a geometria se cala',
    categoria: CATEGORIAS.copresenca,
    resumo: `${sa.name} com ${sa.name}: mesmo signo. Co-presença, e não aspecto — Ptolomeu enumera quatro, e este não está entre eles.`,
    texto:
      `Mesmo signo. E aqui a tradição diz uma coisa que este app faz questão de repetir em voz alta: isto NÃO é um aspecto. ` +
      `Ptolomeu enumera quatro — oposição, trígono, quadratura e sextil — e repete a lista adiante; conjunção não está nela. ` +
      `Signos no mesmo lugar não se olham: estão juntos. ${sa.name} com ${sa.name} é ${elem} sobre ${elem}, ${qualidadesFrase(elem)} em dobro, ` +
      `os dois ${mod.nome} (${mod.ptolomeu} em Ptolomeu: ${mod.glosa}). Nenhum contraste pra medir. ` +
      `O efeito, na tradição, depende inteiramente de QUEM está junto — não da geometria.`,
    forte:
      `Vocês partem do mesmo lugar: mesmo elemento, mesmas duas qualidades, mesma modalidade. ` +
      `Não há mal-entendido de temperamento a traduzir entre um e outro.`,
    cuidado:
      `Nem espelho a segurar: o que um exagera, o outro exagera igual, e não há um terceiro ponto de vista dentro do par. ` +
      `E repare no que o app NÃO está fazendo aqui: como a geometria se cala, não há aspecto a nomear — ` +
      `o que a fonte diz do mesmo signo é que ele produz "secure and indissoluble sympathy", e é só isso que dá pra dizer. ` +
      `Onde não há figura pra ler, este app prefere se calar junto.`,
    verbatins: [VERBATIM.quatroAspectos, VERBATIM.disjuntos],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — a enumeração dos quatro aspectos; conjunção não está entre eles',
      'Ptolomeu, Tetrabiblos I.16 — "the four aforesaid aspects, opposition, trine, quartile, and sextile"',
      ARISTOTELES_LOCUS + ` — as duas qualidades do elemento ${elem}`,
      'Ptolomeu, Tetrabiblos I.11 — modalidade ' + mod.nome,
    ],
  };
}

// ---------------------------------------------------------------------------
// 9. A PORTA DE ENTRADA
// ---------------------------------------------------------------------------
// Recebe os dois registros de signo já resolvidos ({ name, element, emoji,
// index }) e devolve a leitura inteira. Puro, síncrono e determinístico —
// mesma disciplina do resto de lib/signs.js.
// `id` das SETE relações (aversao30 e aversao150 são distintas) → chave de
// tradução do NOME do aspecto na tela. `familia` é a de quatro-mais-duas.
const CATEGORIA_ID_POR_TERMO = {
  [CATEGORIAS.harmonico]: 'harmonico',
  [CATEGORIAS.desarmonico]: 'desarmonico',
  [CATEGORIAS.semAspecto]: 'semAspecto',
  [CATEGORIAS.copresenca]: 'copresenca',
};

export function sinastria(sa, sb) {
  if (!sa || !sb || typeof sa.index !== 'number' || typeof sb.index !== 'number') return null;
  const distancia = distanciaEmSignos(sa.index, sb.index);
  const familia = ASPECTO_POR_DISTANCIA[distancia];
  const id = ID_POR_DISTANCIA[distancia];

  let leitura;
  if (familia === 'trigono') leitura = lerTrigono(sa, sb);
  else if (familia === 'sextil') leitura = lerSextil(sa, sb);
  else if (familia === 'quadratura') leitura = lerQuadratura(sa, sb);
  else if (familia === 'oposicao') leitura = lerOposicao(sa, sb);
  else if (familia === 'aversao') leitura = lerAversao(sa, sb, distancia);
  else leitura = lerCopresenca(sa);

  const modA = modalidadePorIndice(sa.index);
  const modB = modalidadePorIndice(sb.index);
  const grau = ESCALA[familia];

  return {
    ...leitura,
    id,
    familia,
    categoriaId: CATEGORIA_ID_POR_TERMO[leitura.categoria],
    // A posição na escala ordinal de IV.7 — e a citação que a sustenta vai
    // junto de TODA leitura, exatamente pra ninguém poder mostrar o grau sem
    // mostrar de onde ele saiu.
    grau,
    grauNome: GRAUS_IV7[grau],
    distancia,
    graus: grausDoAspecto(distancia),
    elementoA: sa.element,
    elementoB: sb.element,
    modalidadeA: modA.nome,
    modalidadeB: modB.nome,
    qualidadesA: QUALIDADES[sa.element],
    qualidadesB: QUALIDADES[sb.element],
    qualidadesEmComum: qualidadesEmComum(sa.element, sb.element),
    verbatins: [...leitura.verbatins, VERBATIM.escala],
    notaEscala: NOTA_ESCALA,
    notaGrau: NOTA_GRAU,
    ressalvaSignoSolar: RESSALVA_SIGNO_SOLAR,
  };
}
