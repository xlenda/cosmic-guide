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
//    O que a tela PODE fazer (feedback do dono, 31/07/2026) é antepor uma
//    PARÁFRASE em português rotulada como paráfrase nossa (campo `parafrase`
//    de cada VERBATIM): o inglês continua na tela como recibo, entre aspas e
//    com locus; a paráfrase nunca ganha aspas nem locus, porque quem assina a
//    paráfrase é o app, não Robbins.
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
// 6. DUAS LÍNGUAS, NESTA ORDEM. Feedback do dono lendo a tela em produção
//    (31/07/2026): "está bem melhor porque fala a real, mas está muito
//    científico tudo, preciso mesclar para o povão entender e deixar
//    científico também". Então toda leitura ABRE em português de conversa —
//    a primeira frase diz o que a figura significa pros dois, sem nenhum
//    termo técnico — e FECHA com a fonte: o nome do aspecto, a geometria e a
//    citação continuam, DEPOIS da frase humana, como quem diz "e isso não sou
//    eu inventando: Ptolomeu já dizia isso no século II". Termo técnico não
//    some: ganha glosa entre parênteses na primeira vez que aparece na
//    leitura. A frase humana obedece às regras 2, 3 e 4 como qualquer outra —
//    povão não é licença pra veredito.
//
// 7. DOIS BLOCOS, E O BLOCO 1 ABRE. Segundo feedback do dono lendo a MESMA tela
//    no mesmo dia: "na parte de compatibilidade de casal tá muito científico
//    ainda, cada as coisas que o povão gosta de ler, fala de sexo entre eles,
//    de conversa, de harmonia, de brigas, se vai ser quente na cama, no início
//    tem que ser algo que prenda atenção. Depois a parte científica." E:
//    "quero criar retenção calorosa". A regra 6 tinha resolvido isso com UMA
//    frase humana antes da fonte — pouco, e ainda abstrato. Agora a leitura tem
//    dois blocos:
//
//      BLOCO 1 — "Como é na vida real" (campo `vidaReal`, mais a `chamada`).
//        Cinco dimensões — química e cama, conversa, briga, convivência, o que
//        segura a longo prazo —, de 2 a 4 frases cada, TODAS compostas com os
//        fatos daquele par. Nenhum termo técnico, nenhum locus, nenhuma citação:
//        é o texto que a pessoa lê primeiro e é a maior parte da tela.
//      BLOCO 2 — "De onde vem isso" (`aspecto`, `categoria`, `graus`,
//        `distancia`, `texto`, `forte`, `cuidado`, `verbatins`, `grau`,
//        `grauNome`, `notaEscala`, `notaGrau`, `ressalvaSignoSolar`,
//        `notaCaracterologia`). Tudo que já existia, sem perder um único item —
//        só deixou de ser a abertura.
//
//    O bloco 1 é CARACTEROLOGIA CONTEMPORÂNEA e o bloco 2 declara isso em voz
//    alta (`NOTA_CARACTEROLOGIA`). A tese (docs/tradicao/00-tese.md, prop. 3)
//    é explícita: "ariano é impulsivo, escorpiano é intenso" é séc. XX, de Alan
//    Leo em diante, e não está em Ptolomeu nem em Manílio. O app não deixa de
//    escrever esse texto — ele o escreve E o data, que é o oposto de fingir que
//    é doutrina antiga.
//
//    Uma consequência prática dessa separação, e ela contradiz em aparência o
//    que está escrito na seção 2 deste arquivo: ali a glosa da modalidade fica
//    presa à imagem SAZONAL de Ptolomeu de propósito, porque "cardeal é quem
//    toma a iniciativa" é psicologia do séc. XX. Continua valendo — no BLOCO 2.
//    No bloco 1, que já está declarado como caracterologia moderna, a leitura
//    moderna da modalidade é permitida, e é ela que responde "quem puxa" nos
//    pares que não formam figura nenhuma. A diferença entre os dois blocos é
//    justamente essa: um responde pela fonte, o outro responde por nós.
//
//    As regras 2, 3, 4 e 5 valem inteiras no bloco 1. Linguagem adulta e direta
//    sobre desejo é permitida; explícito, vulgar ou anatômico não é (o app tem
//    classificação livre). O modelo de tom é coluna de revista boa.
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
//
// O campo `parafrase` (31/07/2026, feedback do dono: "muito científico tudo,
// preciso mesclar para o povão entender") NÃO é tradução: é o que a passagem
// diz, em português de conversa, assinado pelo app e rotulado assim na tela.
// A tela o mostra ANTES do inglês; o inglês fica como recibo, entre aspas e
// com locus — a paráfrase nunca ganha aspas nem locus, porque quem responde
// por ela somos nós. test/synastry.test.js continua exigindo que `texto` seja
// o inglês puro, sem português dentro.
export const VERBATIM = {
  quatroAspectos: {
    texto:
      'Of the parts of the zodiac those first are familiar one to another which are in aspect. These are the ones which are in opposition... those which are in trine... those which are said to be in quartile... and finally those that occupy the sextile position.',
    parafrase:
      'Das partes do zodíaco, têm familiaridade entre si as que se olham em aspecto — e os aspectos são quatro: oposição, trígono, quadratura e sextil.',
    locus: 'Ptolomeu, Tetrabiblos I.13 (Dos aspectos dos signos), trad. Robbins, 1940',
  },
  harmonicos: {
    texto:
      'Of these aspects trine and sextile are called harmonious because they are composed of signs of the same kind, either entirely of feminine or entirely of masculine signs; while quartile and opposition are disharmonious because they are composed of signs of opposite kinds.',
    parafrase:
      'Trígono e sextil são chamados harmônicos porque juntam signos do mesmo gênero — todos masculinos ou todos femininos; quadratura e oposição são desarmônicas porque juntam signos de tipos opostos.',
    locus: 'Ptolomeu, Tetrabiblos I.13, trad. Robbins, 1940',
  },
  disjuntos: {
    texto:
      "'Disjunct' and 'alien' are the names applied to those divisions of the zodiac which have none whatever of the aforesaid familiarities with one another... they are found to be entirely without share in the four aforesaid aspects, opposition, trine, quartile, and sextile, and are either one or five signs apart; for those which are one sign apart are as it were averted from one another...",
    parafrase:
      'Disjuntos e alheios são os signos que não têm familiaridade nenhuma entre si: ficam fora dos quatro aspectos, a um ou a cinco signos de distância — e os que são vizinhos ficam como que desviados um do outro.',
    locus: 'Ptolomeu, Tetrabiblos I.16 (Dos signos disjuntos), trad. Robbins, 1940',
  },
  duradouro: {
    texto:
      "Marriages for the most part are lasting when in both the genitures the luminaries happen to be in harmonious aspect, that is, in trine or in sextile with one another, and particularly when this comes about by exchange; and even more when the husband's moon is in such aspect with the wife's sun.",
    // A MOLDURA DE GÊNERO É DA FONTE, E FICA COM O DONO DELA. O inglês de
    // Robbins continua byte a byte ("the husband's moon... the wife's sun") —
    // traduzir ou maquiar citação é falsificá-la. Mas quem assina a PARÁFRASE é
    // o app (regra 1), e a tela diz isso com todas as letras no rótulo: escrever
    // "a Lua do marido sobre o Sol da esposa" em voz própria seria o app afirmar
    // que união duradoura é marido + esposa e distribuir luminares por sexo,
    // numa tela onde duas pessoas de qualquer gênero escolhem dois signos. Não é
    // fidelidade doutrinária: o próprio arquivo já tem a formulação neutra em
    // RESSALVA_SIGNO_SOLAR ("com peso especial na Lua de um sobre o Sol do
    // outro"). Então a paráfrase descreve a FIGURA e atribui a moldura.
    parafrase:
      'Os casamentos costumam durar quando o Sol e a Lua das duas cartas estão em aspecto harmônico — trígono ou sextil —, sobretudo trocando de lugar, e Ptolomeu dá peso extra à Lua de um sobre o Sol do outro (ele escreve marido e esposa; o app descreve a figura, não o arranjo).',
    locus: 'Ptolomeu, Tetrabiblos IV.5 (Do casamento), trad. Robbins, 1940',
  },
  separacao: {
    texto:
      'Divorces on slight pretexts and complete alienations occur when the aforesaid positions of the luminaries are in disjunct signs, or in opposition or in quartile.',
    parafrase:
      'Divórcios por pretexto pequeno e afastamentos completos acontecem quando essas posições dos luminares caem em signos disjuntos, em oposição ou em quadratura.',
    locus: 'Ptolomeu, Tetrabiblos IV.5, trad. Robbins, 1940',
  },
  modificador: {
    texto:
      'Similarly, when the luminaries are in inharmonious positions, the beneficent planets testifying to the luminaries do not completely terminate the marriages, but bring about renewals and recollections, which preserve kindness and affection.',
    parafrase:
      'Mesmo com os luminares em posição desarmônica, se os planetas benéficos dão testemunho, o casamento não termina de vez: vêm recomeços e lembranças, que preservam gentileza e afeto.',
    locus: 'Ptolomeu, Tetrabiblos IV.5, trad. Robbins, 1940',
  },
  // A ÚNICA escala ordenada de configurações entre duas cartas que a tradição
  // ocidental produziu. É daqui que sai o `grau` de cada leitura — e é ela que
  // põe a oposição no último degrau, junto da aversão, e não no primeiro.
  escala: {
    texto:
      'In inquiries regarding matters of importance we must observe the places in both nativities which have the greatest authority, that is, those of the sun, the moon, the horoscope, and the Lot of Fortune; for if they chance to fall in the same signs of the zodiac, or if they exchange places, either all or most of them... they bring about secure and indissoluble sympathy, unbroken by any quarrel. However, if they are in disjunct signs or opposite signs, they produce the deepest enmities and lasting contentions. If they chance to be situated in neither of these ways, but merely in signs which bear an aspect to one another, if they are in trine or in sextile, they make the sympathies less, and in quartile, the antipathies less.',
    parafrase:
      'Nos assuntos de peso, olham-se os lugares de maior autoridade das duas cartas — Sol, Lua, Ascendente e Parte da Fortuna. Nos mesmos signos, ou trocando de lugar: simpatia firme, que briga nenhuma desfaz. Em signos disjuntos ou opostos: as inimizades mais fundas e as disputas mais duradouras. Em trígono ou sextil, as simpatias são menores; em quadratura, as antipatias são menores.',
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
// Os quatro degraus dizem de QUEM é o adjetivo. O grau 1 era o único que
// afirmava seco — a tela imprime "Grau 1 de 4 na escala de Tetrabiblos IV.7 —
// simpatia segura e indissolúvel", em português, sem aspas e sem dono, o que se
// lê como rótulo do app para aquele casal real; e "indissolúvel" é promessa de
// permanência. NOTA_GRAU logo abaixo diz que nenhum grau é veredito, mas essa é
// a mesma armadilha que este arquivo denuncia ("ressalva não neutraliza
// número"): ressalva também não neutraliza adjetivo. Agora os quatro têm dono na
// própria string que a tela imprime.
export const GRAUS_IV7 = {
  1: 'o que a fonte chama de simpatia segura e indissolúvel',
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
  'Isto compara signo solar com signo solar, e esse recorte é de coluna de jornal: nasceu com R. H. Naylor no Sunday Express de 24 de agosto de 1930 e virou a coluna semanal "Your Stars" — é dali que vem o horóscopo por signo solar para o público. A sinastria antiga é outra coisa — no capítulo do casamento (IV.5) Ptolomeu compara o Sol e a Lua das duas cartas, com peso especial na Lua de um sobre o Sol do outro; e no capítulo de onde sai o grau desta tela (IV.7) ele compara QUATRO lugares de cada carta: Sol, Lua, Ascendente e Parte da Fortuna. O aspecto abaixo é real e a fonte dele está citada; aplicar a escala de IV.7 a um par de signos solares é simplificação deste app, e o app prefere dizer isso a fingir que não.';

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
      'Fonte ocidental antiga dizendo que signo regido por Marte não combina com signo regido por Vênus. Tabelas de amizade e inimizade entre planetas existem (al-Biruni, 1029; e arranjos que divergem entre si em Lilly, Ramesey, Coley e Raphael), mas tratam planeta com planeta e não são aplicadas a casais — e o próprio Ptolomeu contraria o clichê, registrando que Saturno com Vênus produz uniões estáveis. Por isso regência de planeta NÃO entra nesta conta: a casa de cada signo (Tetrabiblos I.17) é usada só como vocabulário de descrição no bloco "Como é na vida real", que está declarado como caracterologia contemporânea, e não move o grau, a categoria nem a figura em lugar nenhum.',
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
  'William Lilly, Christian Astrology, Londres, 1647 — dignidades essenciais e a tabela de fortitudes (intervalo não conferido no original): o único sistema de pontuação realmente tradicional, e ele não mede compatibilidade',
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
// E todo `texto` segue a regra 6 do cabeçalho: ABRE em português de conversa
// (o que a figura significa pros dois, sem termo técnico) e FECHA com a fonte
// (nome do aspecto com glosa, geometria, capítulo). A ordem é essa e não o
// contrário — o povão lê a primeira frase; quem quiser conferir lê o resto.
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
    resumo: `${c.A} e ${c.B} se entendem quase sem esforço — mesmo elemento, ${c.elemA}. Trígono, a figura que a tradição chama de harmônica.`,
    texto:
      `Vocês dois se entendem quase sem esforço — o mesmo tipo de coisa move ${c.A} e ${c.B}, então não há tradução a fazer entre vocês. ` +
      `E isso não somos nós inventando. O nome da figura é Trígono (é quando um signo enxerga o outro de um ângulo fácil): quatro signos de distância, 120 graus. ` +
      `Ptolomeu o chama de harmônico (a palavra da fonte pra encontro de afinidade) — mas junto com o sextil (o outro ângulo fácil), e sem pôr um acima do outro: ` +
      `no livro dele, o Tetrabiblos (IV.7), os dois caem no MESMO degrau (Ptolomeu ordena os encontros numa escada de quatro posições): "they make the sympathies less" (as simpatias são menores). Quem ordena os dois é William Lilly, ` +
      `Christian Astrology (Londres, 1647, p. 106): sextil e trígono são "arguments of Love, Unity and Friendship; but the Trine is more forcible" (laços de amor, união e amizade — e o trígono é o mais forte dos dois). ` +
      `Isso é tradição inglesa do séc. XVII, não Ptolomeu, e por isso não muda o degrau aqui. ` +
      `${c.A} e ${c.B} são do mesmo elemento, ${c.elemA}, e portanto das mesmas duas qualidades: ${c.qA}. ` +
      `O que muda é a modalidade (o jeito de cada signo dentro da estação): ${c.A} é ${c.modA.nome} (${c.modA.glosa}) e ${c.B} é ${c.modB.nome} (${c.modB.glosa}). ` +
      `Muda a hora de entrar, não o que importa.`,
    forte:
      `Reconhecimento sem esforço: ${c.elemA} lendo ${c.elemA}. Vocês não gastam energia explicando o óbvio um pro outro, ` +
      `e no capítulo do casamento é justamente o trígono entre o Sol e a Lua dos dois mapas que Ptolomeu associa às uniões que duram.`,
    cuidado:
      `O que a geometria não entrega aqui é atrito. Trígono descreve facilidade, e facilidade não empurra ninguém do lugar — ` +
      `o que precisar mudar entre ${c.A} e ${c.B} parte de vocês, porque o aspecto não cobra. ` +
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
    resumo: `${c.A} e ${c.B} têm um ponto de encontro de verdade e liberdade pra diferir no resto. Sextil — o ângulo leve, que a fonte chama de harmônico.`,
    texto:
      `Tem liga de verdade entre ${c.A} e ${c.B}, sem cobrança de ser igual: um ponto em comum sustenta a conversa, e o resto cada um resolve do seu jeito. ` +
      `O nome disso é Sextil (é quando dois signos se veem de um ângulo leve): dois signos de distância, 60 graus — ` +
      `harmônico (a palavra da fonte pra encontro de afinidade) em Tetrabiblos I.13, e no mesmo degrau do trígono (o outro ângulo fácil) na escada de quatro posições de Tetrabiblos IV.7, o livro de Ptolomeu. ` +
      `Chamar o sextil de o mais brando dos dois é de William Lilly (Christian Astrology, 1647, p. 106: "the Trine is more forcible" — o trígono é o mais forte dos dois), não de Ptolomeu. ` +
      `Na física antiga, cada elemento é duas coisas: ${c.artA} de ${c.A} é ${c.qA}; ${c.artB} de ${c.B}, ${c.qB}. ` +
      `O que os dois têm em comum é uma qualidade só, o ${q} — não é a identidade do trígono, é meio caminho, e essa conta é nossa, via Aristóteles. ` +
      `O que é de Ptolomeu: a dois signos de distância eles se veem (I.13) e são da mesma polaridade (a fonte diz "mesmo gênero": a lista dos signos alterna um sim, um não, e esses dois caem no mesmo grupo — I.12). ` +
      `As modalidades divergem (${c.A} ${c.modA.nome}, ${c.B} ${c.modB.nome}), então o tempo de cada um é diferente.`,
    forte:
      `Um ponto de contato real — o ${q} — e nenhuma obrigação de ser igual no resto. ` +
      `Ptolomeu põe o sextil ao lado do trígono entre os aspectos de união duradoura.`,
    cuidado:
      `Sextil é contato, não fusão: o encaixe é de uma qualidade só, e as outras duas ficam de fora da conta. ` +
      `Onde um funciona num ritmo que o outro não acompanha, ninguém está errado — são elementos diferentes.`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.duradouro],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — sextil é harmônico; dois signos, 60 graus',
      'Ptolomeu, Tetrabiblos I.12 — os gêneros dos signos alternam um a um: a dois signos de distância, o gênero é sempre o mesmo',
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
      `Pela física de Aristóteles, ${c.artA} e ${c.artB} são contrários absolutos — é o caso mais duro que uma quadratura pode ter ` +
      `(a física é de Aristóteles; graduar uma quadratura como mais dura que outra é leitura deste app, não citação).`
    : `${c.A} é ${c.qA}; ${c.B} é ${c.qB}. Os dois ainda compartilham o ${c.comum[0]} — um fio em comum, e um só. ` +
      `Não é o pior caso da própria quadratura: contrários absolutos, pela física de Aristóteles, seriam elementos sem nenhuma qualidade em comum ` +
      `(a física é de Aristóteles; graduar uma quadratura como mais dura que outra é leitura deste app, não citação).`;
  // A frase humana também distingue os dois casos que a física separa — regra 6.
  const aberturaHumana = contrarios
    ? `O choque entre ${c.A} e ${c.B} é dos grandes: cada um quer levar a vida pra um lado, com a mesma força e ao mesmo tempo — ninguém está errado, é temperamento contra temperamento, sem quase nada de terreno neutro. `
    : `Tem faísca de verdade entre ${c.A} e ${c.B}: cada um puxa pra um lado, com a mesma força e ao mesmo tempo — mas existe um fio segurando as duas pontas, e ele aparece quando a poeira baixa. `;
  return {
    aspecto: 'Quadratura',
    natureza: contrarios ? 'atrito entre contrários absolutos' : 'atrito com um fio em comum',
    categoria: CATEGORIAS.desarmonico,
    resumo: `${c.A} e ${c.B} têm atrito de verdade — um puxa pra cada lado, com a mesma força. Quadratura: desarmônica na fonte, e a fonte não decide o resto.`,
    texto:
      aberturaHumana +
      `O nome disso é Quadratura (é quando dois signos se veem de um ângulo que aperta): três signos de distância, 90 graus. ` +
      `Ptolomeu a lista entre os aspectos DESARMÔNICOS (a palavra da fonte pra encontro de atrito), e dá o motivo — ` +
      `é composta de "signos de tipos opostos". ${abertura} ` +
      `E os dois são ${mod.nome} (${mod.ptolomeu} em Ptolomeu: ${mod.glosa}): mesmo tempo interno, alvos diferentes. ` +
      `Vocês disputam o mesmo território.`,
    forte:
      `Vocês se veem. Quadratura é aspecto — os dois lados se enxergam e se reconhecem, e é exatamente por isso que conseguem brigar, ` +
      `se irritar e eventualmente se acertar. A aversão, que é o "não combina" de verdade da tradição, não permite nem a briga.`,
    cuidado:
      `Aqui dói, e a tradição não finge que não: no capítulo do casamento, Ptolomeu põe a quadratura ao lado da oposição e dos signos disjuntos ` +
      `entre as posições em que ocorrem separações. E, no MESMO capítulo, o próprio Ptolomeu avisa que isso não é sentença — com os planetas que a tradição chama de benéficos (Vênus e Júpiter) ` +
      `apoiando o Sol e a Lua (os "luminares" da fonte), a união em posição desarmônica não termina, e traz "recomeços e lembranças, que preservam gentileza e afeto". ` +
      `Aspecto tenso descreve por que a relação dói onde dói. Não decide o desfecho, e este app não decide por você.`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — quadratura é desarmônica: "signos de tipos opostos"',
      'Ptolomeu, Tetrabiblos IV.5 — separação; e o modificador que impede a sentença',
      ARISTOTELES_LOCUS +
        (contrarios
          ? ` — ${c.elemA} e ${c.elemB} não compartilham nenhuma qualidade`
          : ` — ${c.elemA} e ${c.elemB} compartilham o ${c.comum[0]}`),
      'Ptolomeu, Tetrabiblos I.11 — os grupos de modalidade (aqui, ' + mod.nome + '); que a quadratura caia sempre no mesmo grupo é aritmética do zodíaco (3 signos = mesma coluna do % 3), não afirmação do capítulo',
    ],
  };
}

function lerOposicao(sa, sb) {
  const c = ctx(sa, sb);
  const q = c.comum[0];
  const mod = c.modA; // oposição também é sempre a mesma modalidade
  return {
    aspecto: 'Oposição',
    natureza: 'eixo — as duas pontas do mesmo diâmetro',
    categoria: CATEGORIAS.desarmonico,
    resumo: `${c.A} e ${c.B}: as duas pontas do mesmo eixo — se completam e se enfrentam pelo mesmo motivo. Oposição, desarmônica na fonte.`,
    texto:
      `Um é o avesso do outro: o que atrai e o que atrita entre ${c.A} e ${c.B} nasce do mesmo lugar, e esse cabo de guerra é o desenho do par — não um defeito. ` +
      `O nome disso é Oposição (dois signos de frente um pro outro, cada um numa ponta do mesmo eixo): o eixo ${c.A}–${c.B}, seis signos, 180 graus. ` +
      `Ptolomeu a lista entre os desarmônicos (a palavra da fonte pra encontro de atrito), e o próprio Ptolomeu a liga a Saturno, o planeta do limite, ao explicar as casas (Tetrabiblos I.17). ` +
      `E tem um detalhe honesto: a explicação que Ptolomeu dá pros encontros de atrito nem fecha direito pra este caso — a dureza aqui é de posição, não de temperamento (a aritmética disso está nas fontes, logo abaixo). ` +
      `Pelo elemento também não se explica: ${c.artA} e ${c.artB} compartilham o ${q}, e são exatamente os mesmos pares de elemento que o sextil (o ângulo leve de 60 graus) junta. ` +
      `A dureza da oposição não é de elemento, é de posição — é o eixo (leitura nossa, e aritmética conferível) — e IV.7 a põe no degrau de baixo em vez de entre os harmônicos. ` +
      `Os dois são ${mod.nome} (${mod.glosa}) — dois polos com o mesmo tempo interno.`,
    forte:
      `O que falta em um sobra no outro, e não por acaso: é o mesmo eixo visto dos dois lados. ` +
      `Nenhum outro par de signos se completa por um motivo tão estrutural quanto este. ` +
      `(Na tradição, o lugar do casamento se conta a partir do Ascendente — o mapa completo, não só o signo. ` +
      `Ler o sétimo signo a partir do Sol é atalho deste app, não doutrina antiga.)`,
    cuidado:
      `Encontro de iguais em polos contrários: vocês se completam e se enfrentam pelo mesmo motivo, e o motivo é estrutural, não circunstancial — é o desenho do eixo. ` +
      `Ptolomeu põe a oposição entre as posições de separação — e, na mesma página, registra que os planetas que a tradição chama de benéficos (Vênus e Júpiter), ` +
      `apoiando o Sol e a Lua (os "luminares" da fonte), trazem "recomeços e lembranças, que preservam gentileza e afeto". Descrição da natureza do encontro, não do fim dele.`,
    verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — oposição é desarmônica; seis signos, 180 graus',
      'Ptolomeu, Tetrabiblos I.12 — os gêneros dos signos alternam um a um a partir de Áries: por isso signos opostos são sempre do MESMO gênero, e a justificativa de I.13 não se aplica à oposição',
      'Ptolomeu, Tetrabiblos I.17 (as casas dos planetas) — a oposição ligada a Saturno: os signos opostos aos luminares são dele porque "their diametrical aspect is not consistent with beneficence"',
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
  // A frase humana distingue as duas distâncias, igual ao resto da leitura —
  // aversao30 e aversao150 não podem colapsar nem no português de conversa.
  const aberturaHumana = umSigno
    ? `De saída, ${c.A} e ${c.B} nem se enxergam — não é rixa, é que o assunto não vem pronto: vizinhos de muro que quase não se cruzam. Ponte entre vocês existe, mas é construída na mão. `
    : `De onde estão, ${c.A} e ${c.B} não se avistam — não é inimizade, é distância sem janela: o entendimento que existir entre vocês foi vocês dois que ergueram, tijolo por tijolo. `;
  return {
    aspecto: 'Aversão',
    natureza: umSigno ? 'signos disjuntos — vizinhos que não se veem' : 'signos disjuntos — distantes que não se veem',
    categoria: CATEGORIAS.semAspecto,
    resumo: `${c.A} e ${c.B} de saída nem se enxergam — não é briga, falta ângulo: Ptolomeu não registra aspecto a ${distancia} ${umSigno ? 'signo' : 'signos'} de distância.`,
    texto:
      aberturaHumana +
      `O nome que a fonte dá é Aversão (dois signos que não formam ângulo nenhum entre si — nem o fácil, nem o difícil). ` +
      `${abertura} Isto NÃO é um aspecto: ele chama esses signos de "disjuntos e alheios" (quer dizer: separados e estranhos um ao outro), e diz que não têm familiaridade nenhuma um com o outro. ` +
      `O critério é óptico — signos em aspecto se veem; estes não se veem. ` +
      `E não há nada, nem de um lado nem do outro, pra segurar: ${c.A} é ${c.elemA} e ${c.modA.nome} (${c.modA.glosa}); ${c.B} é ${c.elemB} e ${c.modB.nome} (${c.modB.glosa}). ` +
      `Nem o elemento nem o ritmo da estação (a modalidade) em comum. Este é o "não combina" da tradição — e não a quadratura, como se costuma dizer por aí.`,
    forte:
      `Nada aqui é herdado. Se existe reconhecimento entre ${c.A} e ${c.B}, ele foi construído por vocês dois — ` +
      `a geometria não tem como levar crédito por isso, e a rigor nem tem o que dizer.`,
    cuidado:
      `Aversão não é briga: é ausência de reconhecimento automático, dois signos que não se registram. É o ponto de partida mais desfavorável da tradição, ` +
      `e é também o ponto em que a leitura por signo solar mostra o seu limite — a comparação de casais que Ptolomeu faz (o nome disso é sinastria) não olha só o signo: ` +
      `olha o Sol e a Lua do mapa astral inteiro de cada um. Isto descreve o começo, não o fim: nenhum texto antigo decreta o desfecho de nada a partir de dois signos.`,
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
    resumo: `${sa.name} com ${sa.name}: dois iguais partindo do mesmo lugar. Co-presença, e não aspecto — Ptolomeu enumera quatro, e este não está na lista.`,
    texto:
      `Dois iguais no mesmo lugar: vocês se reconhecem de cara e falam a mesma língua de nascença — o desafio é que ninguém dentro do par enxerga de fora. ` +
      `O nome disso é Co-presença (estar junto no mesmo signo, em vez de se olhar de algum ângulo). ` +
      `E aqui a tradição diz uma coisa que este app faz questão de repetir em voz alta: isto NÃO é um aspecto. ` +
      `Ptolomeu enumera quatro — oposição, trígono, quadratura e sextil — e repete a lista adiante; conjunção (o nome que se usa hoje pra dois astros juntos no mesmo signo) não está nela. ` +
      `Signos no mesmo lugar não se olham: estão juntos. ${sa.name} com ${sa.name} é ${elem} sobre ${elem}, ${qualidadesFrase(elem)} em dobro, ` +
      `os dois ${mod.nome} (${mod.ptolomeu} em Ptolomeu: ${mod.glosa}). Nenhum contraste pra medir. ` +
      `Sobre PLANETAS juntos, Lilly (Christian Astrology, 1647, p. 106) diz que a conjunção é boa ou má conforme quem se junta — sobre dois signos iguais, o que a fonte dá é IV.7.`,
    forte:
      `Vocês partem do mesmo lugar: mesmo elemento, mesmas duas qualidades, mesma modalidade. ` +
      `Não há mal-entendido de temperamento a traduzir entre um e outro.`,
    cuidado:
      `Nem espelho a segurar: o que um exagera, o outro exagera igual, e não há um terceiro ponto de vista dentro do par. ` +
      `E repare no que o app NÃO está fazendo aqui: como a geometria se cala, não há aspecto a nomear — ` +
      `o que a fonte diz do mesmo signo é que ele produz "secure and indissoluble sympathy" (simpatia firme, que não se desfaz) — e é só isso que dá pra dizer. ` +
      `Onde não há figura pra ler, este app prefere se calar junto.`,
    verbatins: [VERBATIM.quatroAspectos, VERBATIM.disjuntos],
    fontes: [
      'Ptolomeu, Tetrabiblos I.13 — a enumeração dos quatro aspectos; conjunção não está entre eles',
      'Ptolomeu, Tetrabiblos I.16 — "the four aforesaid aspects, opposition, trine, quartile, and sextile"',
      'William Lilly, Christian Astrology, Londres, 1647, Livro I, p. 106 — "Conjunctions are good or bad, as the Planets in Conjunction are friends or enemies to one another": doutrina sobre PLANETAS em conjunção, não sobre dois signos solares iguais',
      ARISTOTELES_LOCUS + ` — as duas qualidades do elemento ${elem}`,
      'Ptolomeu, Tetrabiblos I.11 — modalidade ' + mod.nome,
    ],
  };
}

// ---------------------------------------------------------------------------
// 9. O BLOCO 1 — "COMO É NA VIDA REAL"
// ---------------------------------------------------------------------------
// Ver a regra 7 do cabeçalho. Este bloco é o que ABRE a tela e é a maior parte
// do texto. Ele não cita ninguém, não nomeia aspecto e não usa termo técnico —
// quem responde por ele é o app, e o bloco 2 diz isso com todas as letras em
// NOTA_CARACTEROLOGIA.
//
// COMO ELE VARIA NOS 144 PARES, que é o requisito duro. O defeito histórico
// deste app (e do mercado) é escrever um molde por aspecto e trocar o miolo:
// aí Áries+Leão, Áries+Sagitário e Leão+Sagitário — os três trígonos de fogo —
// leem igual. Aqui cada dimensão é COMPOSTA de quatro eixos independentes, e
// nenhum deles sozinho é o texto:
//
//   1. A FIGURA (7 estados) — dá o formato da dinâmica. Vem da distância.
//   2. OS ELEMENTOS (10 pares) — dão a textura. Aristóteles, II.3, é a ossatura;
//      o vocabulário de temperamento pendurado nela é moderno.
//   3. AS MODALIDADES (6 pares) — dão o tempo e os papéis. Tetrabiblos I.11 é a
//      ossatura; ler cardeal como "quem começa" é séc. XX (ver regra 7).
//   4. OS REGENTES (7 planetas, 28 pares) — dão o motivo de cada um. A atribuição
//      de casa é Tetrabiblos I.17; o que cada planeta "quer" é moderno.
//
// Multiplicando o que a geometria permite, os três trígonos de fogo acima saem
// com regentes diferentes (Marte+Sol, Marte+Júpiter, Sol+Júpiter) e modalidades
// diferentes — e por isso leem diferente. E as duas oposições que o dono citou,
// Áries+Libra e Touro+Escorpião, dividem a figura e o par de regentes (Marte e
// Vênus nos dois) mas divergem em elemento (fogo/ar contra terra/água) e em
// modalidade (cardeal contra fixo): dois textos que não se parecem.
//
// O QUE A REGÊNCIA NÃO FAZ, e é importante: ela NÃO entra no grau, não entra na
// categoria e não decide se o par é bom ou ruim. NAO_ACHADO.regentesInimigos
// registra que não existe fonte ocidental antiga dizendo que signo de Marte não
// combina com signo de Vênus — então o planeta aqui é vocabulário de descrição,
// nunca critério de julgamento.

// Casas dos planetas — Ptolomeu, Tetrabiblos I.17. Isto é a atribuição antiga e
// é verificável; o que cada planeta "quer" logo abaixo é que é moderno.
export const PTOLOMEU_REGENCIA_LOCUS = 'Ptolomeu, Tetrabiblos I.17 (Das casas dos planetas)';

export const REGENTES = {
  'Áries': 'Marte',
  'Touro': 'Vênus',
  'Gêmeos': 'Mercúrio',
  'Câncer': 'Lua',
  'Leão': 'Sol',
  'Virgem': 'Mercúrio',
  'Libra': 'Vênus',
  'Escorpião': 'Marte',
  'Sagitário': 'Júpiter',
  'Capricórnio': 'Saturno',
  'Aquário': 'Saturno',
  'Peixes': 'Júpiter',
};

// O que cada planeta move em cada dimensão. Caracterologia contemporânea,
// declarada como tal — as frases estão na 3ª pessoa do singular de propósito,
// porque entram como sujeito "Fulano <frase>" e também como "cada um <frase>".
//
// FORMA DE CENA, NÃO DE CONTRASTE (31/07/2026). Medido em Áries+Libra: as 20
// frases do bloco 1 tinham a MESMA forma sintática — antítese "A faz x e B faz
// y", quatro contrastes empilhados por parágrafo. A monotonia não era de
// vocabulário, era de forma, e é por isso que mesmo as frases boas somavam a
// uma sensação de tabela. A linha do regente é a candidata natural a quebrar o
// padrão: em vez de contraste, CENA — verbo no presente, um objeto concreto,
// duas orações curtas com sujeito único em cada, zero "e… e".
const PLANETA = {
  Marte: {
    quimica: 'chega, pergunta e já sabe a resposta',
    conversa: 'abre pelo problema e quer o problema resolvido hoje',
    briga: 'levanta a voz antes de pensar',
    casa: 'resolve na marra e detesta pedir ajuda',
    prazo: 'precisa de um alvo à frente pra não se entediar',
  },
  'Vênus': {
    quimica: 'deixa a pergunta no ar mais tempo do que precisa, porque a espera é metade do prazer',
    conversa: 'volta sempre pra quem tratou quem de que jeito',
    briga: 'fecha a cara e adia a conversa pro dia seguinte',
    casa: 'ajeita a casa e o clima antes de qualquer visita',
    prazo: 'precisa se sentir escolhido de novo, e com frequência',
  },
  'Mercúrio': {
    quimica: 'manda três mensagens antes de encostar a mão em alguém',
    conversa: 'chega com três assuntos e larga o primeiro no meio',
    briga: 'argumenta pra ganhar, não pra entender',
    casa: 'faz a lista e distribui a tarefa',
    prazo: 'precisa que ainda exista assunto novo entre os dois',
  },
  Lua: {
    quimica: 'quer o cheiro conhecido no travesseiro antes de querer qualquer outra coisa',
    conversa: 'fala do que ficou atravessado três dias depois de ter ficado',
    briga: 'se recolhe e deixa o silêncio pesar',
    casa: 'cuida do miúdo que ninguém vê',
    prazo: 'precisa se sentir em segurança pra continuar aberto',
  },
  Sol: {
    quimica: 'quer ser olhado na hora, e percebe na hora quando não é',
    conversa: 'puxa o plano grande e o que os dois estão construindo',
    briga: 'se fere no orgulho e endurece',
    casa: 'quer ser a referência da casa',
    prazo: 'precisa ouvir o reconhecimento em voz alta',
  },
  'Júpiter': {
    quimica: 'transforma a noite em programa e o programa em história pra contar depois',
    conversa: 'começa falando de viagem e termina falando do sentido das coisas',
    briga: 'solta uma verdade grande demais e passa a semana se arrependendo',
    casa: 'gasta mais do que planejou e promete mais do que cabe',
    prazo: 'precisa de horizonte aberto, não de coleira',
  },
  Saturno: {
    quimica: 'demora, testa o terreno, e quando solta é de uma vez',
    conversa: 'traz trabalho, dinheiro e o que dá pra sustentar até o fim do mês',
    briga: 'fica frio e começa a cobrar o que foi combinado',
    casa: 'controla a conta, a agenda e o que foi combinado',
    prazo: 'precisa de compromisso dito com todas as letras',
  },
};

// As chaves dos dois eixos combinatórios. Ordem explícita em vez de .sort(),
// porque "água" começa com acento e a ordenação padrão de JS depende do byte —
// uma chave que muda sozinha é exatamente o tipo de bug silencioso que este
// arquivo existe pra não ter.
const ORDEM_ELEMENTO = { ar: 0, fogo: 1, terra: 2, 'água': 3 };
const ORDEM_MODALIDADE = { cardeal: 0, fixo: 1, mutavel: 2 };

function chaveDupla(a, b, ordem) {
  return (ordem[a] <= ordem[b] ? [a, b] : [b, a]).join('+');
}

// QUEM PUXA. Duas origens, e a diferença entre elas está declarada em
// NOTA_CARACTEROLOGIA:
//   • onde HÁ figura (sextil, quadratura, trígono) vale a superação
//     (kathuperterisis) — doutrina helenística transmitida por Antíoco, Pórfiro
//     e Retório: predomina o lugar que está no DÉCIMO SIGNO a partir do outro.
//     Confere: o décimo signo a partir de Câncer é Áries, e é Áries que
//     predomina. (Este comentário enunciava a regra ao CONTRÁRIO — "predomina o
//     que está no signo anterior, aquele a partir do qual o outro é o décimo" —
//     e se contradizia sozinho na frase seguinte, com o exemplo certo. O código
//     sempre esteve certo; era a frase que estava de cabeça pra baixo, e ela
//     tinha vazado para NOTA_CARACTEROLOGIA, que é texto de tela. Ver
//     docs/tradicao/02-aspectos-e-sinastria.md §2.4: "o planeta no 10º signo a
//     partir de outro predomina sobre o que está no 4º".)
//   • na oposição a distância é 6 pelos dois lados e nenhum é anterior ao outro;
//     no mesmo signo não há dois lugares. Nos dois casos ninguém puxa.
//   • na aversão NÃO HÁ figura, então não há superação a invocar — e aqui a
//     ordem vem da modalidade lida ao modo moderno, que é leitura do app. As
//     modalidades de dois signos em aversão nunca coincidem, então nunca empata.
function liderancaVida(sa, sb, distancia) {
  if (distancia === 0 || distancia === 6) return null;
  const dAB = (((sb.index - sa.index) % 12) + 12) % 12;
  if (distancia === 2 || distancia === 3 || distancia === 4) {
    return dAB === distancia ? { lider: sa.name, segue: sb.name } : { lider: sb.name, segue: sa.name };
  }
  const peso = { cardeal: 3, mutavel: 2, fixo: 1 };
  const ma = modalidadePorIndice(sa.index).id;
  const mb = modalidadePorIndice(sb.index).id;
  return peso[ma] >= peso[mb] ? { lider: sa.name, segue: sb.name } : { lider: sb.name, segue: sa.name };
}

function ctxVida(sa, sb, distancia) {
  const modA = modalidadePorIndice(sa.index);
  const modB = modalidadePorIndice(sb.index);
  const lid = liderancaVida(sa, sb, distancia);
  // Nome do signo por elemento e por modalidade. Só é chamado onde os dois
  // divergem — a geometria garante isso em cada caso de uso.
  const porElemento = { [sa.element]: sa.name, [sb.element]: sb.name };
  const porModalidade = { [modA.id]: sa.name, [modB.id]: sb.name };
  // A modalidade de QUEM PUXA. A chamada compõe por dois eixos (ver 9.6) e este
  // é o segundo: sem ele, os 24 trígonos abririam com quatro frases (uma por
  // elemento) em vez de doze.
  const modDoLider = !lid ? null : (lid.lider === sa.name ? modA.id : modB.id);
  // O par de signos em ordem de zodíaco, pra tabela chaveada por PAR (a
  // oposição, que não tem par de elementos suficiente pra variar: os seis
  // eixos usam só duas chaves de elemento).
  const chavePar = (sa.index <= sb.index ? [sa.name, sb.name] : [sb.name, sa.name]).join('+');
  return {
    A: sa.name,
    B: sb.name,
    elemA: sa.element,
    elemB: sb.element,
    modA,
    modB,
    distancia,
    lider: lid ? lid.lider : null,
    segue: lid ? lid.segue : null,
    modLider: modDoLider,
    regA: REGENTES[sa.name],
    regB: REGENTES[sb.name],
    el: (elemento) => porElemento[elemento],
    md: (modalidade) => porModalidade[modalidade],
    chaveEl: chaveDupla(sa.element, sb.element, ORDEM_ELEMENTO),
    chaveMod: chaveDupla(modA.id, modB.id, ORDEM_MODALIDADE),
    chavePar,
  };
}

// A frase dos regentes, em três formas — e as três existem porque a primeira
// versão tinha só duas e o resultado era feio de ler:
//
//   • DOIS PLANETAS DIFERENTES (o caso comum): duas orações curtas, uma por
//     signo, cada uma com o seu sujeito.
//   • O MESMO PLANETA em dois signos diferentes — são cinco pares e só cinco
//     (Áries e Escorpião com Marte, Touro e Libra com Vênus, Gêmeos e Virgem
//     com Mercúrio, Sagitário e Peixes com Júpiter, Capricórnio e Aquário com
//     Saturno). Aqui não dá pra repetir a mesma frase duas vezes, então ela
//     muda de forma — e a entrada muda por DIMENSÃO, senão as cinco dimensões
//     do mesmo par abriam com a mesma oração palavra por palavra.
//   • O MESMO SIGNO dos dois lados (co-presença): nem "os dois planetas" nem
//     "o mesmo planeta" fazem sentido — o que faz sentido é dizer que não há
//     contraponto nenhum, que é a leitura da co-presença.
const MESMO_REGENTE_LEAD = {
  quimica: 'correm no mesmo motor',
  conversa: 'puxam do mesmo lugar',
  briga: 'acendem do mesmo jeito',
  casa: 'administram a vida do mesmo jeito',
  prazo: 'precisam da mesma coisa pra continuar de pé',
};

// O RÓTULO MORREU, E O PONTO E VÍRGULA JUNTO (31/07/2026). Isto saía cinco vezes
// por leitura e 390 vezes no app: "No detalhe: Áries quer sem rodeio e gosta da
// conquista; Libra quer ser desejado com calma e capricho." Rótulo mais ponto e
// vírgula é linha de tabela renderizada como prosa — e eram CINCO rótulos em
// cinco parágrafos consecutivos ("No detalhe:", "O assunto que não acaba nasce
// daí:", "Cada um tem o seu pavio:", "Dentro de casa:", "Pra continuar de pé:").
// Era a marca visual mais forte de "aula" no texto inteiro: a pessoa via a
// estrutura antes de ler a frase. Agora não há abertura nenhuma — a linha entra
// como cena, duas orações curtas com sujeito próprio (ver o comentário de
// PLANETA).
function fraseRegentes(c, campo) {
  const a = PLANETA[c.regA][campo];
  const b = PLANETA[c.regB][campo];
  if (c.A === c.B) {
    return `Sendo o mesmo signo nos dois lados, ${c.A} ${a} — e o traço vem em dobro, sem ninguém pra fazer contraponto.`;
  }
  if (c.regA === c.regB) {
    return `${c.A} e ${c.B} ${MESMO_REGENTE_LEAD[campo]}, e o retrato vale pros dois: cada um ${a}.`;
  }
  // UMA frase, não duas. Cada dimensão junta quatro partes e o teste exige de
  // 2 a 4 frases no total ("2 a 4" é literal no pedido do dono; mais que isso
  // vira o ensaio que a tela já era). Quando esta função devolvia
  // "A faz isso. B faz aquilo." o total batia em 5 e derrubava o build — o
  // ponto-e-vírgula une os dois retratos sem colar as duas ideias, e o
  // contraste entre eles é justamente o que se quer mostrar.
  return `${c.A} ${a}; ${c.B} ${b}.`;
}

// --- 9.1 QUÍMICA E CAMA ----------------------------------------------------
// Linguagem adulta e direta, sem nada explícito e sem anatomia: o app tem
// classificação livre e o tom é o de coluna de revista boa. Regra 7.
//
// A LINHA DE CAMA, UMA POR FIGURA. O dono pediu "fala de sexo entre eles, se vai
// ser quente na cama" e o que saía era metáfora de porta e de temperatura: imã,
// "acende pela cabeça", "as duas portas dão no mesmo lugar". A ÚNICA linha
// concreta do motor inteiro era a da quadratura — "o que irrita de dia é
// exatamente o que puxa de noite" —, e ela prova que dá pra ser concreto sem ser
// explícito e sem sair da classificação livre. Agora as sete têm a sua versão,
// no mesmo registro, e ela é o FECHO da frase de figura (a primeira da tela).
// Vive separada porque o card de compartilhar da tela usa esta linha sozinha.
const QUIMICA_CAMA = {
  // "ninguém puxa" é literal de propósito: a superação (kathuperterisis)
  // responde quem dá o primeiro passo, e ela precisa de DOIS lugares em
  // aspecto. No mesmo signo não há dois lugares, então não há líder a apontar —
  // e o texto diz isso em vez de inventar um. Há teste varrendo os 144 pares
  // atrás exatamente desta frase na distância 0 e na 6.
  copresenca: 'vocês querem a mesma coisa na mesma hora, e ninguém puxa: não há de onde um olhar o outro de cima',
  trigono: 'vocês pegam o ritmo na primeira noite, e o problema aqui nunca é falta de vontade',
  sextil: 'começa mais devagar do que os dois esperavam e melhora com o tempo, que é o contrário do que costuma acontecer',
  quadratura: 'o que irrita de dia é exatamente o que puxa de noite',
  oposicao: 'na cama a discussão do dia continua por outros meios, e é aí que ela funciona',
  aversao30: 'no começo um dos dois sempre acha que quer mais que o outro, e quase nunca é verdade: é só o tempo de resposta que é diferente',
  aversao150: 'a vontade não chega junto, chega quando um dos dois decide que chegou',
};

// A primeira letra maiúscula e ponto final — a linha de cama sozinha, do jeito
// que o card de compartilhar da tela precisa dela.
export function fraseDeCama(id) {
  const f = QUIMICA_CAMA[id];
  if (!f) return null;
  return f.charAt(0).toUpperCase() + f.slice(1) + '.';
}

// QUEM PUXA saiu daqui e foi pra CHAMADA, e o motivo é medido: em 60 dos 78
// pares as DUAS primeiras frases da tela diziam a mesma coisa — a chamada
// terminava em "quem dá o primeiro passo quase sempre é Áries" e a linha
// seguinte abria com "quem costuma dar o primeiro passo é Áries". O leitor
// gastava a atenção da abertura relendo o mesmo fato. O espaço que sobrou aqui é
// o que recebe a linha de cama.
//
// E o SUJEITO virou "vocês". Medido em Áries+Libra: 20 frases no bloco 1, 15
// nomeando os dois signos, 30 ocorrências de nome próprio e ZERO de "você".
// O bloco 2 — a parte da fonte — era o único que dizia "vocês dois": a parte
// fria conversava com o leitor e a parte de retenção falava SOBRE ele, em
// terceira pessoa, como ficha de banco de dados. Regra prática: a PRIMEIRA
// frase de cada dimensão fala com vocês; as outras nomeiam os signos, que é
// onde o nome carrega informação (quem faz o quê).
const QUIMICA_FIGURA = {
  copresenca: (c) => `Com ${c.A} dos dois lados o desejo é de espelho: vocês reconhecem a própria vontade no outro e acendem sem precisar traduzir nada — ${QUIMICA_CAMA.copresenca}.`,
  trigono: (c) => `Entre ${c.A} e ${c.B} o desejo corre solto porque os dois querem a mesma coisa e no mesmo idioma — ${QUIMICA_CAMA.trigono}.`,
  sextil: () => `A atração entre vocês é de curiosidade: existe um ponto de encontro de verdade e diferença suficiente pra manter graça — ${QUIMICA_CAMA.sextil}.`,
  quadratura: (c) => `O desejo entre vocês nasce do atrito, e ${c.A} e ${c.B} sabem disso melhor do que admitem: ${QUIMICA_CAMA.quadratura}.`,
  oposicao: () => `Vocês se atraem pelo avesso: o que te fascina no outro é exatamente o que falta em você, e nenhum dos dois admite isso em voz alta — ${QUIMICA_CAMA.oposicao}.`,
  aversao30: () => `Entre vocês o desejo não vem pronto: falta aquela faísca de reconhecimento imediato, e o que existe foi construído no convívio — ${QUIMICA_CAMA.aversao30}.`,
  aversao150: () => `A atração entre vocês costuma nascer de fora pra dentro, porque nada no encontro dos dois é automático — ${QUIMICA_CAMA.aversao150}.`,
};

const QUIMICA_ELEMENTO = {
  'fogo+fogo': () => 'Fogo com fogo acende rápido, esquenta alto e não tem a menor paciência com rodeio.',
  'terra+terra': () => 'Terra com terra é desejo físico e sem pressa: pele, cheiro, repetição, e um gosto declarado por aquilo que já se sabe que funciona.',
  'ar+ar': () => 'Ar com ar acende pela cabeça — uma frase certa na hora certa vale mais aqui do que qualquer investida.',
  'água+água': () => 'Água com água é desejo emocional antes de ser físico: quando o clima está torto, o corpo sabe primeiro.',
  'ar+fogo': (c) => `${c.el('ar')} acende pela cabeça e ${c.el('fogo')} acende pelo corpo, e é esse desencontro de porta de entrada que mantém os dois curiosos.`,
  'terra+água': (c) => `${c.el('água')} entra pelo clima e ${c.el('terra')} entra pelo toque, e as duas portas dão no mesmo lugar — é um desejo mais fácil de sustentar do que de explicar.`,
  'fogo+terra': (c) => `${c.el('fogo')} quer agora e ${c.el('terra')} quer bem feito: o atrito começa no relógio, e é o mesmo atrito que segura a atração.`,
  // "invadido" saiu (31/07/2026). Não era explícito nem vulgar — era a palavra
  // errada: na dimensão que se chama "química e cama", descrever descompasso de
  // desejo como um avançando e o outro se sentindo INVADIDO naturaliza um limite
  // atravessado como traço de temperamento do par. "Recusado/apressado" preserva
  // a assimetria e o desencontro de tempo sem emprestar vocabulário de invasão.
  'fogo+água': (c) => `${c.el('fogo')} avança e ${c.el('água')} sente antes de responder — quando o tempo dos dois coincide é elétrico, e quando não coincide um se sente recusado e o outro apressado.`,
  'ar+terra': (c) => `${c.el('ar')} quer conversar sobre o desejo e ${c.el('terra')} quer praticá-lo em silêncio, e nenhum dos dois entende de imediato por que o outro insiste no contrário.`,
  'ar+água': (c) => `${c.el('água')} precisa de clima e ${c.el('ar')} precisa de leveza: funciona muito bem enquanto ninguém cobra do outro a própria língua.`,
};

// O rótulo "O que esfria:" saiu por dois motivos. Um: era rótulo, como os cinco
// que morreram em fraseRegentes. Dois: esta tabela FECHAVA a seção mais quente
// da tela, então a primeira seção que a pessoa lê — a que existe pra prender
// atenção — terminava no aviso do que dá errado, nos 78 pares. Anticlímax por
// arquitetura. Agora ela vem em segundo lugar no parágrafo (ver
// construirVidaReal) e não anuncia coisa ruim antes de dizê-la.
const QUIMICA_MODALIDADE = {
  'cardeal+cardeal': () => 'O risco é o desejo virar a coisa que os dois adiam, porque os dois só sabem começar.',
  'fixo+fixo': () => 'O risco é o desejo virar hábito e os dois repetirem o mesmo roteiro por meses, sem reclamar e sem mudar nada.',
  'mutavel+mutavel': () => 'O risco é o assunto mudar, o plano mudar e a vontade mudar junto, e faltar a repetição que transforma atração em intimidade.',
  'cardeal+fixo': (c) => `Esfria quando ${c.md('cardeal')} propõe novidade e ${c.md('fixo')} quer o que já deu certo, e um lê o outro como pressa ou como marasmo.`,
  'cardeal+mutavel': (c) => `Esfria quando ${c.md('cardeal')} decide e ${c.md('mutavel')} se adapta, até o dia em que se adaptar sai caro demais.`,
  'fixo+mutavel': (c) => `Esfria quando ${c.md('fixo')} quer garantia e ${c.md('mutavel')} quer liberdade de mudar de ideia, e essa é a conversa que sempre volta pra cama.`,
};

// --- 9.2 CONVERSA ----------------------------------------------------------
const CONVERSA_FIGURA = {
  copresenca: () => `Vocês se entendem pela metade da frase, e o que ninguém puxa é justamente o defeito que os dois têm igual.`,
  trigono: () => `Vocês conversam sem esforço e sem tradução, e o assunto que ninguém puxa é o que exigiria discordar.`,
  sextil: () => `Vocês têm assunto fácil e nenhuma obrigação de concordar, e o que ninguém puxa é o combinado de fundo, porque está tudo funcionando.`,
  quadratura: () => `Vocês discutem bem: a conversa tem tese, contra-tese e placar, e o que ninguém puxa é o pedido de desculpa.`,
  oposicao: () => `Vocês conversam como dois lados da mesma questão, e cada frase de um responde a uma que o outro nem chegou a dizer — o que ninguém puxa é a pergunta de quem abre mão.`,
  aversao30: () => `Entre vocês não existe assunto pronto: a conversa precisa ser puxada, quase sempre pelo mesmo, e o que ninguém puxa é o que exigiria explicar por que aquilo importa.`,
  aversao150: () => `Vocês partem de referências distantes e gastam boa parte do fôlego explicando o óbvio um pro outro, e o que ninguém puxa é o passado de cada um, que fica em caixas separadas.`,
};

const CONVERSA_ELEMENTO = {
  'fogo+fogo': () => 'Dois de fogo falam alto, se empolgam juntos e cortam a frase um do outro sem maldade: o assunto anda mais rápido que a escuta.',
  'terra+terra': () => 'Dois de terra conversam pouco e resolvem muito, e o que os dois chamam de conversa costuma ser um combinado prático.',
  'ar+ar': () => 'Dois de ar conversam por esporte, e o que trava não é falta de assunto — é falta de conclusão.',
  'água+água': () => 'Duas águas dizem muito sem dizer: metade da conversa acontece em olhar, tom e silêncio, e a outra metade fica pra depois.',
  'ar+fogo': (c) => `${c.el('ar')} traz o assunto e ${c.el('fogo')} traz a opinião, e é uma conversa rápida que raramente entedia.`,
  'terra+água': (c) => `${c.el('água')} fala do que sentiu e ${c.el('terra')} responde com o que dá pra fazer, e falta combinar quando um quer solução e quando quer só ser ouvido.`,
  'fogo+terra': (c) => `${c.el('fogo')} fala em bloco e já quer decidir, ${c.el('terra')} pede detalhe antes de concordar, e o que trava é ritmo e não conteúdo.`,
  // Presente habitual, não futuro. Isto dizia "que [água] VAI REMOER por três
  // dias, e o assunto reaparece na semana seguinte do nada": previsão de
  // comportamento de um parceiro nomeado, com duração fechada e recorrência —
  // exatamente o que a regra 2 do cabeçalho proíbe ("qualquer verbo no futuro
  // sobre o casal"), no bloco que é visível por padrão e vai pro Diário Cósmico.
  'fogo+água': (c) => `${c.el('fogo')} diz a coisa direta que ${c.el('água')} costuma remoer por dias, e o assunto às vezes reaparece na semana seguinte.`,
  'ar+terra': (c) => `${c.el('ar')} teoriza e ${c.el('terra')} quer o exemplo concreto: o mal-entendido clássico é um achar o outro raso e o outro achar o primeiro complicado.`,
  'ar+água': (c) => `${c.el('ar')} explica o sentimento e ${c.el('água')} sente a explicação, e quando esquenta um foge pra lógica e o outro foge pro silêncio.`,
};

// A MODALIDADE NÃO PODE REAFIRMAR O QUE O ELEMENTO JÁ DISSE. Esta tabela falava
// de QUEM INTERROMPE — e o eixo do elemento, uma frase antes, já tinha falado de
// corte de fala e de ritmo. Resultado medido: Escorpião+Aquário e Leão+Escorpião
// liam "discutem bem: a conversa tem tese, contra-tese e placar" seguido de
// "Quem interrompe: ninguém — os dois esperam a vez". Contradição dentro do
// mesmo parágrafo, e nada reconcilia. Quem lê não pensa "os eixos são
// independentes": pensa que o app não sabe o que está dizendo, e aí o resto do
// texto perde crédito. Agora a modalidade responde outra pergunta — quem CEDE o
// assunto.
const CONVERSA_MODALIDADE = {
  'cardeal+cardeal': () => 'Quem cede o assunto: nenhum dos dois, e é por isso que a conversa que importa costuma virar duas conversas paralelas.',
  'fixo+fixo': () => 'Quem cede o assunto: ninguém cede, mas os dois arquivam — o tema sai da mesa inteiro e volta igualzinho semanas depois.',
  'mutavel+mutavel': () => 'Quem cede o assunto: os dois, com gosto, e é por isso que o tema que importa fica pro próximo domingo.',
  'cardeal+fixo': (c) => `Quem cede o assunto é ${c.md('cardeal')}, que já quer concluir e passar pro próximo, enquanto ${c.md('fixo')} continua no mesmo ponto.`,
  'cardeal+mutavel': (c) => `Quem cede o assunto é ${c.md('mutavel')}, que muda de rota sem reclamar e só percebe depois que não foi ouvido.`,
  'fixo+mutavel': (c) => `Quem cede o assunto é ${c.md('mutavel')}, e ${c.md('fixo')} recolhe o tema e devolve na frase seguinte, do mesmo jeito.`,
};

// --- 9.3 BRIGA -------------------------------------------------------------
const BRIGA_FIGURA = {
  copresenca: () => `Vocês brigam pelo defeito compartilhado: cada um enxerga no outro o que não suporta em si, e a volta acontece quando os dois cansam ao mesmo tempo.`,
  trigono: () => `O motivo recorrente entre vocês costuma ser pequeno e se dissolve no dia seguinte, porque nenhum dos dois tem gosto por manter conflito de pé.`,
  sextil: () => `O que atravessa entre vocês é distância: nada explode, mas um dos dois some por uns dias e o outro não pergunta.`,
  quadratura: () => `Vocês brigam por território — os dois querem mandar na mesma coisa e na mesma hora —, e a volta costuma vir por cansaço, não por acordo.`,
  oposicao: () => `A briga de vocês é sempre a mesma com nomes diferentes, o quanto cada um abre mão, e a volta costuma ser rápida porque nenhum dos dois se acostuma a ficar sem o contraponto.`,
  aversao30: () => `Entre vocês o motivo recorrente é mal-entendido puro: um disse uma coisa e o outro ouviu outra, e a volta depende de alguém explicar o que parecia óbvio.`,
  aversao150: () => `O que dói entre vocês é a sensação de não ser levado a sério, e a reaproximação costuma vir de fora, por um assunto prático que obriga os dois a se falarem.`,
};

const BRIGA_ELEMENTO = {
  'fogo+fogo': () => 'Os dois explodem, e explodem juntos: sobe em dez segundos e desce quase tão rápido, desde que ninguém guarde.',
  'terra+terra': () => 'Nenhum dos dois grita: os dois emburram, trabalham calados e deixam a conversa envelhecer por dias.',
  'ar+ar': () => 'O desentendimento vira debate, ganha quem argumenta melhor, e é por isso que ninguém sai satisfeito.',
  'água+água': () => 'Ninguém diz o que doeu na hora: os dois se afastam, choram separados e voltam quando o clima muda sozinho.',
  'ar+fogo': (c) => `${c.el('fogo')} explode e ${c.el('ar')} racionaliza, e nada irrita mais quem está com raiva do que ouvir um argumento bem montado.`,
  'terra+água': (c) => `${c.el('água')} se magoa e ${c.el('terra')} endurece, e o silêncio dos dois tem sentidos diferentes que ninguém traduz.`,
  'fogo+terra': (c) => `${c.el('fogo')} bate o pé na hora e ${c.el('terra')} não responde, e volta ao assunto três dias depois com tudo anotado.`,
  'fogo+água': (c) => `${c.el('fogo')} grita e esquece, ${c.el('água')} não grita e não esquece: é diferença de memória, não de amor.`,
  'ar+terra': (c) => `${c.el('ar')} quer discutir a relação e ${c.el('terra')} quer parar de falar e agir, e cada um chama o método do outro de fuga.`,
  // "aliviar" caiu na varredura de alegação de saúde — a palavra é de
  // tratamento, e a regra é de PALAVRA, não de intenção: se ela passa aqui,
  // passa amanhã numa frase que promete alívio de verdade. "desanuviar" diz a
  // mesma coisa sobre clima de conversa e não empresta vocabulário clínico.
  'ar+água': (c) => `${c.el('ar')} vira o assunto em piada pra desanuviar e ${c.el('água')} entende a piada como pouco caso.`,
};

const BRIGA_MODALIDADE = {
  'cardeal+cardeal': () => 'Duração: curta e frequente, porque os dois querem resolver na hora e recomeçar na hora.',
  'fixo+fixo': () => 'Duração: longa, porque nenhum dos dois recua primeiro — e a reaproximação vem por um gesto prático, quase nunca por um pedido de desculpa formal.',
  'mutavel+mutavel': () => 'Duração: indefinida, porque o conflito não termina, se dissolve, e às vezes reaparece meses depois com outra roupa.',
  'cardeal+fixo': (c) => `Duração: ${c.md('cardeal')} quer resolver hoje e ${c.md('fixo')} precisa de tempo, e apressar o segundo é o que mais alonga o assunto.`,
  'cardeal+mutavel': (c) => `Duração: curta, porque ${c.md('mutavel')} cede antes do fim — e ceder cedo demais é o que faz o mesmo motivo voltar.`,
  'fixo+mutavel': (c) => `Duração: ${c.md('fixo')} segura a mágoa enquanto ${c.md('mutavel')} já mudou de assunto, e essa diferença de relógio vira o segundo motivo.`,
};

// --- 9.4 CONVIVÊNCIA -------------------------------------------------------
const CONVIVENCIA_FIGURA = {
  copresenca: (c) => `No dia a dia, ${c.A} e ${c.B} têm as mesmas manias e os mesmos buracos: o que um deixa pra amanhã, o outro também deixa.`,
  trigono: (c) => `No dia a dia, ${c.A} e ${c.B} combinam sem reunião, porque as prioridades já nascem parecidas.`,
  sextil: (c) => `No dia a dia, ${c.A} e ${c.B} se ajudam sem se misturar: cada um tem o seu canto, e as pontas se encontram no fim do mês.`,
  quadratura: (c) => `No dia a dia, ${c.A} e ${c.B} disputam o mesmo lugar da casa e da agenda, e a fricção aparece mais numa terça-feira comum do que numa crise grande.`,
  oposicao: (c) => `No dia a dia, ${c.A} e ${c.B} dividem a vida por polos: o que um faz bem, o outro nem toca — e funciona, até um dos dois se sentir sozinho no próprio setor.`,
  aversao30: (c) => `No dia a dia, ${c.A} e ${c.B} tropeçam no pequeno — horário, louça, quem avisa quem —, e nada disso é grande enquanto tudo isso é diário.`,
  aversao150: (c) => `No dia a dia, ${c.A} e ${c.B} vivem quase em paralelo, cada um com a rotina inteira montada, e é preciso marcar encontro dentro da própria casa.`,
};

const CONVIVENCIA_ELEMENTO = {
  'fogo+fogo': () => 'Dinheiro entra e sai rápido: os dois gastam com o que dá prazer e adiam o que é chato.',
  'terra+terra': () => 'Conta em dia, casa em ordem e divisão combinada — é confortável, e corre o risco de virar só administração.',
  'ar+ar': () => 'A casa vive cheia de gente e de planos, e a rotina é o posto que ninguém quer assumir.',
  'água+água': () => 'A casa vira refúgio: acolhe todo mundo, guarda tudo, e às vezes sobra pouco espaço pros dois.',
  'ar+fogo': (c) => `${c.el('fogo')} decide e ${c.el('ar')} negocia, e nenhum dos dois quer a parte chata, que é a conta que vence dia dez.`,
  'terra+água': (c) => `${c.el('terra')} sustenta a estrutura e ${c.el('água')} sustenta o clima: é uma divisão que funciona bem e que precisa ser dita em voz alta pra não virar cobrança.`,
  'fogo+terra': (c) => `${c.el('fogo')} quer trocar de casa, de carro e de cidade enquanto ${c.el('terra')} quer terminar de pagar a primeira, e dinheiro é o assunto que mais volta.`,
  'fogo+água': (c) => `${c.el('fogo')} toca o barco pra fora e ${c.el('água')} toca o barco pra dentro, e a família de cada um entra na conta mais do que os dois gostariam.`,
  'ar+terra': (c) => `${c.el('terra')} cuida do que é fixo e ${c.el('ar')} cuida do que é variável, e funciona até o dia em que um dos dois cansa do próprio papel.`,
  'ar+água': (c) => `${c.el('ar')} planeja e ${c.el('água')} sente se o plano cabe, e a rotina da casa é o que mais rápido fica pra depois.`,
};

const CONVIVENCIA_MODALIDADE = {
  'cardeal+cardeal': () => 'Quem decide: os dois querem decidir, e o arranjo que funciona é dividir territórios em vez de dividir cada decisão.',
  'fixo+fixo': () => 'Quem decide: quem decidiu da primeira vez, porque o que virou hábito nessa casa tem vida longa.',
  'mutavel+mutavel': () => 'Quem decide: depende do dia, e é aí que a casa fica frágil — vai bem no improviso e mal no que precisa de data.',
  'cardeal+fixo': (c) => `Quem decide: ${c.md('cardeal')} propõe e toca, e ${c.md('fixo')} tem poder de veto e usa.`,
  'cardeal+mutavel': (c) => `Quem decide: ${c.md('cardeal')}, quase sempre, e ${c.md('mutavel')} descobre a própria opinião só depois que ela já foi atropelada.`,
  'fixo+mutavel': (c) => `Quem decide: ${c.md('fixo')} nas coisas de raiz — casa, conta, prazo — e ${c.md('mutavel')} em tudo que muda toda semana.`,
};

// --- 9.5 O QUE SEGURA A LONGO PRAZO ----------------------------------------
const LONGO_FIGURA = {
  copresenca: (c) => `O que segura ${c.A} e ${c.B} é o reconhecimento: ninguém aqui precisa explicar quem é.`,
  trigono: (c) => `O que segura ${c.A} e ${c.B} é a facilidade, e a facilidade é justamente o que não cobra mudança de ninguém.`,
  sextil: (c) => `O que segura ${c.A} e ${c.B} é a liberdade: o vínculo é real e não exige que nenhum dos dois deixe de ser quem é.`,
  quadratura: (c) => `O que segura ${c.A} e ${c.B} é que a disputa é levada a sério pelos dois — atritar por algo que ambos querem é sinal de que ambos ainda querem.`,
  oposicao: (c) => `O que segura ${c.A} e ${c.B} é a necessidade mútua de contraponto: cada um usa o outro pra enxergar o próprio ponto cego.`,
  aversao30: (c) => `O que segura ${c.A} e ${c.B} é o que foi construído na mão, porque nada aqui veio de graça.`,
  aversao150: (c) => `O que segura ${c.A} e ${c.B} é a escolha repetida: sem reconhecimento automático, cada dia junto é uma decisão tomada de novo.`,
};

const LONGO_ELEMENTO = {
  'fogo+fogo': () => 'Dois de fogo duram enquanto tiverem um projeto em comum pra tocar, e o que pede trabalho consciente é o tédio, que aqui vira briga por nada.',
  'terra+terra': () => 'Dois de terra duram por construção, porque o que foi feito junto pesa a favor, e o que pede trabalho consciente é não deixar a vida virar só manutenção.',
  'ar+ar': () => 'Dois de ar duram enquanto continuarem interessantes um pro outro, e o que pede trabalho consciente é o dia em que o assunto rareia.',
  'água+água': () => 'Duas águas duram pelo vínculo emocional, que é forte e dispensa palavra, e o que pede trabalho consciente é aprender a dizer aquilo que os dois já sabem.',
  'ar+fogo': (c) => `${c.el('ar')} e ${c.el('fogo')} duram pelo movimento — enquanto houver plano novo, há gás —, e o que pede trabalho consciente é a parte parada da vida.`,
  'terra+água': (c) => `${c.el('terra')} e ${c.el('água')} duram pelo cuidado mútuo, que aqui é real, e o que pede trabalho consciente é não confundir cuidado com controle.`,
  'fogo+terra': (c) => `${c.el('fogo')} e ${c.el('terra')} duram pelo respeito ao que o outro faz bem, e o que pede trabalho consciente é o tempo, que nunca é o mesmo pros dois.`,
  'fogo+água': (c) => `${c.el('fogo')} e ${c.el('água')} duram pela intensidade, que os dois reconhecem de longe, e o que pede trabalho consciente é a temperatura, que se negocia em vez de se vencer.`,
  'ar+terra': (c) => `${c.el('ar')} e ${c.el('terra')} duram pela complementaridade prática, e o que pede trabalho consciente é a sensação recorrente de estar sozinho acompanhado.`,
  'ar+água': (c) => `${c.el('ar')} e ${c.el('água')} duram pela ternura sem peso, e o que pede trabalho consciente é a hora da conversa séria, que os dois adiam.`,
};

// O fecho é por CATEGORIA e existe pra uma coisa só: impedir que o bloco quente
// vire veredito. Na categoria desarmônica ele carrega, em português de conversa,
// a nuance de Tetrabiblos IV.5 que o bloco 2 traz verbatim — a união em posição
// desarmônica que NÃO termina. Sem isso, quem lê só o bloco 1 leva embora uma
// condenação que a fonte não dá.
const LONGO_FECHO = {
  harmonico: 'Facilidade também não é promessa: o que está descrito aqui é o jeito da coisa, e o desfecho segue sendo de vocês dois.',
  desarmonico: 'E fica dito, porque é o que a tradição registra e o mercado esconde: atrito não é sentença — a mesma fonte que este app cita descreve a união em posição difícil que não termina, e volta a se refazer.',
  semAspecto: 'E isto descreve o começo de vocês, não o fim: falta de reconhecimento automático é ponto de partida, e ponto de partida não decide desfecho nenhum.',
  copresenca: 'Semelhança também não é promessa: o que está descrito aqui é o jeito da coisa, e o desfecho segue sendo de vocês dois.',
};

// --- 9.6 A CHAMADA — a primeira linha que a pessoa lê ----------------------
// Curta, específica do par, e sem termo técnico nenhum. É o que o dono pediu
// com "no início tem que ser algo que prenda atenção" — e ela passa pelo mesmo
// filtro de veredito que todo o resto.
const CHAMADA = {
  copresenca: (c) => `${c.A} com ${c.B}: dois iguais no mesmo lugar, e o espelho mostra tudo — inclusive o que ninguém queria ver.`,
  trigono: (c) => `${c.A} e ${c.B}: mesma língua, mesmo ritmo de desejo, e quem dá o primeiro passo quase sempre é ${c.lider}.`,
  sextil: (c) => `${c.A} e ${c.B}: liga de verdade com espaço de sobra — ${c.lider} puxa, ${c.segue} acompanha, e ninguém se sente sufocado.`,
  quadratura: (c) => `${c.A} e ${c.B}: o que irrita de dia é o que acende de noite, e quem empurra a relação pra frente é ${c.lider}.`,
  oposicao: (c) => `${c.A} e ${c.B}: imã e cabo de guerra na mesma corda. Ninguém cede primeiro, e é isso que puxa e é isso que cansa.`,
  aversao30: (c) => `${c.A} e ${c.B}: nada aqui vem pronto, nem o desejo nem a conversa, e a ponte costuma ser levantada por ${c.lider}.`,
  aversao150: (c) => `${c.A} e ${c.B}: dois mundos que não se cruzam por acaso — ${c.lider} dá o primeiro passo, e o que existe entre os dois foi escolhido.`,
};

// A ordem em que a tela desenha as cinco dimensões, e a chave de tradução do
// título de cada uma. A tela itera esta lista — assim não existe título de
// dimensão escrito à mão em screens/, e não dá pra a tela mostrar quatro
// quando o motor produz cinco.
export const DIMENSOES_VIDA_REAL = [
  { id: 'quimica', chaveTitulo: 'compat.dim.quimica', icone: 'flame' },
  { id: 'conversa', chaveTitulo: 'compat.dim.conversa', icone: 'chatbubbles' },
  { id: 'briga', chaveTitulo: 'compat.dim.briga', icone: 'flash' },
  { id: 'convivencia', chaveTitulo: 'compat.dim.convivencia', icone: 'home' },
  { id: 'longoPrazo', chaveTitulo: 'compat.dim.longoPrazo', icone: 'hourglass' },
];

// A DECLARAÇÃO. Mora no bloco 2 e é obrigatória: a tese (00-tese.md, prop. 3)
// proíbe vender caracterologia de signo solar como doutrina antiga. O app
// escreve o texto quente E diz de quem ele é.
export const NOTA_CARACTEROLOGIA =
  'O bloco "Como é na vida real", que abre esta leitura, é caracterologia contemporânea — e o app prefere dizer isso a deixar você supor outra coisa. Descrever personalidade por signo solar ("ariano é impulsivo", "escorpiano é intenso") não está em Ptolomeu nem em Manílio: é prática do século XX, de Alan Leo em diante, que chegou ao grande público pela coluna de jornal de R. H. Naylor (1930) e pelos livros de Linda Goodman (1968 e 1978). Da fonte antiga vem só a ossatura embaixo daquele texto, e ela é conferível: a distância entre os dois signos e a figura que ela forma (Tetrabiblos I.13 e I.16), os quatro elementos com suas duas qualidades cada (Aristóteles, Da Geração e Corrupção II.3), os três grupos sazonais que hoje se chamam modalidade (Tetrabiblos I.11) e o planeta que tem casa em cada signo (Tetrabiblos I.17). O vocabulário de temperamento pendurado nessa ossatura é nosso, e é moderno. Uma nota a mais, porque é fácil de perder: quando o texto diz quem costuma dar o primeiro passo, isso se apoia na superação (kathuperterisis), doutrina helenística transmitida por Antíoco, Pórfiro e Retório, segundo a qual entre dois lugares em aspecto predomina o que está no signo anterior — aquele a partir do qual o outro é o décimo. Onde não há aspecto nenhum, como na aversão, não há superação a invocar: ali quem decide a ordem é a modalidade lida ao modo moderno, e isso é leitura deste app, não da fonte. Nada disso entra no grau, na categoria ou na figura: a regência de planeta, em particular, não pesa um grama na conta (ver a lacuna registrada em NAO_ACHADO sobre regentes inimigos).';

function construirVidaReal(sa, sb, distancia, id, categoriaId) {
  const c = ctxVida(sa, sb, distancia);
  const el = (tabela) => tabela[c.chaveEl](c);
  const md = (tabela) => tabela[c.chaveMod](c);
  return {
    chamada: CHAMADA[id](c),
    dimensoes: {
      quimica: [
        QUIMICA_FIGURA[id](c),
        el(QUIMICA_ELEMENTO),
        fraseRegentes(c, 'quimica', 'No detalhe:'),
        md(QUIMICA_MODALIDADE),
      ].join(' '),
      conversa: [
        CONVERSA_FIGURA[id](c),
        el(CONVERSA_ELEMENTO),
        fraseRegentes(c, 'conversa', 'O assunto que não acaba nasce daí:'),
        md(CONVERSA_MODALIDADE),
      ].join(' '),
      briga: [
        BRIGA_FIGURA[id](c),
        el(BRIGA_ELEMENTO),
        fraseRegentes(c, 'briga', 'Cada um tem o seu pavio:'),
        md(BRIGA_MODALIDADE),
      ].join(' '),
      convivencia: [
        CONVIVENCIA_FIGURA[id](c),
        el(CONVIVENCIA_ELEMENTO),
        fraseRegentes(c, 'casa', 'Dentro de casa:'),
        md(CONVIVENCIA_MODALIDADE),
      ].join(' '),
      longoPrazo: [
        LONGO_FIGURA[id](c),
        el(LONGO_ELEMENTO),
        fraseRegentes(c, 'prazo', 'Pra continuar de pé:'),
        LONGO_FECHO[categoriaId],
      ].join(' '),
    },
  };
}

// ---------------------------------------------------------------------------
// 10. A PORTA DE ENTRADA
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
  const categoriaId = CATEGORIA_ID_POR_TERMO[leitura.categoria];
  // O BLOCO 1 é montado aqui, depois da leitura, porque o fecho de longo prazo
  // depende da categoria — e é ele que impede o texto quente de virar veredito.
  const vida = construirVidaReal(sa, sb, distancia, id, categoriaId);

  return {
    ...leitura,
    id,
    familia,
    categoriaId,
    // ------------------------------------------------------------------
    // BLOCO 1 — o que a tela mostra PRIMEIRO (regra 7 do cabeçalho).
    // ------------------------------------------------------------------
    chamada: vida.chamada,
    vidaReal: vida.dimensoes,
    // A declaração que autoriza o bloco 1 a existir: ela mora no bloco 2 e a
    // tela é obrigada a mostrá-la. Sem isto, o app estaria vendendo perfil de
    // signo solar como se fosse Ptolomeu — que é exatamente o que a tese proíbe.
    notaCaracterologia: NOTA_CARACTEROLOGIA,
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
