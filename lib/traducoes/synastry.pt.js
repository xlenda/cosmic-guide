// lib/traducoes/synastry.pt.js
// O PACK PORTUGUÊS da sinastria — TODO texto que o usuário lê saiu de
// lib/synastry.js e mora aqui, byte a byte. O motor (geometria, escala,
// superação, montagem) ficou lá; a prosa ficou aqui, e os packs irmãos
// (synastry.es.js, synastry.en.js) repetem exatamente esta FORMA: mesmas
// chaves, mesmos campos, mesmas funções com a mesma assinatura.
//
// A REGRA DESTE ARQUIVO: o texto PT é ouro e não muda um byte. A extração foi
// verificada contra test/golden/synastry.pt.golden.json — a saída dos 144
// pares capturada ANTES da mudança. Se test/synastryIdiomas.test.js acusar
// diferença, o erro está aqui, não no golden.
//
// TODAS as regras do cabeçalho de lib/synastry.js valem para cada string
// deste arquivo: tradição com fonte, nunca decretar destino, incisivo não é
// assustador, nenhuma alegação de saúde, não inventar tradição, as duas
// línguas nesta ordem, e os dois blocos com o bloco 1 abrindo.

// ---------------------------------------------------------------------------
// NOMES — identidade em PT (os packs es/en localizam; as CHAVES nunca mudam)
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

const ELEMENTOS = { fogo: 'fogo', ar: 'ar', 'água': 'água', terra: 'terra' };

const ARTIGOS = { fogo: 'o fogo', ar: 'o ar', 'água': 'a água', terra: 'a terra' };

const QUALIDADES_NOME = { quente: 'quente', frio: 'frio', seco: 'seco', 'úmido': 'úmido' };

// Recebe as DUAS qualidades já localizadas e as junta do jeito da língua.
function fraseQualidades(q) {
  return `${q[0]} e ${q[1]}`;
}

// As modalidades (Ptolomeu, Tetrabiblos I.11) — texto de exibição. A ordem e
// os ids são do motor; a glosa fica presa à imagem SAZONAL da fonte de
// propósito (ver a seção 2 de lib/synastry.js).
const MODALIDADES = {
  cardeal: {
    id: 'cardeal',
    nome: 'cardeal',
    ptolomeu: 'solsticial ou equinocial',
    glosa: 'a estação vira quando o Sol entra neles',
  },
  fixo: {
    id: 'fixo',
    nome: 'fixo',
    ptolomeu: 'sólido',
    glosa: 'a estação já está firmada quando o Sol está neles',
  },
  mutavel: {
    id: 'mutavel',
    nome: 'mutável',
    ptolomeu: 'bicorpóreo',
    glosa: 'ficam entre duas estações e participam das duas',
  },
};

const ARISTOTELES_LOCUS = 'Aristóteles, Da Geração e Corrupção II.3';

// Categorias — o vocabulário da própria tradição, que é o que substitui a nota
// como resultado principal da tela.
const CATEGORIAS = {
  harmonico: 'harmônico',
  desarmonico: 'desarmônico',
  semAspecto: 'sem aspecto',
  copresenca: 'co-presença',
};

// Os quatro degraus de Tetrabiblos IV.7, com o dono do adjetivo na própria
// string (ver o comentário da seção 5 de lib/synastry.js).
const GRAUS_IV7 = {
  1: 'o que a fonte chama de simpatia segura e indissolúvel',
  2: 'simpatia, e a fonte diz que menor',
  3: 'antipatia, e a fonte diz que menor',
  4: 'o grupo que a fonte põe no fundo',
};

// ---------------------------------------------------------------------------
// AS CITAÇÕES — verbatim de Robbins (Loeb/Harvard, 1940), SEM tradução
// ---------------------------------------------------------------------------
// O campo `texto` é o inglês de Robbins e é IDÊNTICO nos três packs — traduzir
// citação é falsificá-la. O que muda por idioma é a `parafrase` (assinada pelo
// app, nunca entre aspas nem com locus) e a língua do `locus`.
const VERBATIM = {
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
    // A MOLDURA DE GÊNERO É DA FONTE, E FICA COM O DONO DELA — ver o comentário
    // original em lib/synastry.js (a paráfrase descreve a FIGURA e atribui a
    // moldura; quem assina a paráfrase é o app).
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
  // ocidental produziu. É daqui que sai o `grau` de cada leitura.
  escala: {
    texto:
      'In inquiries regarding matters of importance we must observe the places in both nativities which have the greatest authority, that is, those of the sun, the moon, the horoscope, and the Lot of Fortune; for if they chance to fall in the same signs of the zodiac, or if they exchange places, either all or most of them... they bring about secure and indissoluble sympathy, unbroken by any quarrel. However, if they are in disjunct signs or opposite signs, they produce the deepest enmities and lasting contentions. If they chance to be situated in neither of these ways, but merely in signs which bear an aspect to one another, if they are in trine or in sextile, they make the sympathies less, and in quartile, the antipathies less.',
    parafrase:
      'Nos assuntos de peso, olham-se os lugares de maior autoridade das duas cartas — Sol, Lua, Ascendente e Parte da Fortuna. Nos mesmos signos, ou trocando de lugar: simpatia firme, que briga nenhuma desfaz. Em signos disjuntos ou opostos: as inimizades mais fundas e as disputas mais duradouras. Em trígono ou sextil, as simpatias são menores; em quadratura, as antipatias são menores.',
    locus: 'Ptolomeu, Tetrabiblos IV.7 (Dos amigos e inimigos), trad. Robbins, 1940',
  },
};

// ---------------------------------------------------------------------------
// AS RESSALVAS QUE ANDAM JUNTO COM TODA LEITURA
// ---------------------------------------------------------------------------
const NOTA_ESCALA =
  'Aqui não tem porcentagem, e a ausência é deliberada. Não existe nota de compatibilidade entre signos em nenhuma fonte ocidental antiga, medieval ou renascentista: Ptolomeu dá categorias — harmônico, desarmônico, disjunto — e, no capítulo dos amigos e inimigos, uma escala de quatro degraus e uma contagem de quantos lugares concordam ("either all or most of them"), sem unidade. Pontuação numérica tradicional existe no Ocidente, mas é outra coisa: a tabela de dignidades essenciais de William Lilly (Christian Astrology, Londres, 1647) mede a força de UM planeta numa carta, não a afinidade entre duas pessoas. E a única pontuação de compatibilidade de fato tradicional que a pesquisa achou não é ocidental — é o Ashtakoota indiano, de 36 pontos, calculado por nakshatra e signo lunar, jamais por signo solar; outra tradição, outra escala, outro dado de entrada. Um número de dois dígitos é a forma mais forte de afirmar precisão que existe, e nada aqui sustenta essa promessa — então o app mostra o aspecto, que é geometria conferível, e o que a fonte diz dele.';

const NOTA_GRAU =
  'O grau é ordem, não medida. Vem de Ptolomeu, Tetrabiblos IV.7, que ordena as configurações entre duas cartas em quatro degraus e para por aí: grau 4 não é "o dobro de ruim" de grau 2, e nenhum dos quatro é um veredito. No mesmo Tetrabiblos, IV.5, ele registra a união em posição desarmônica que NÃO termina.';

const RESSALVA_SIGNO_SOLAR =
  'Isto compara signo solar com signo solar, e esse recorte é de coluna de jornal: nasceu com R. H. Naylor no Sunday Express de 24 de agosto de 1930 e virou a coluna semanal "Your Stars" — é dali que vem o horóscopo por signo solar para o público. A sinastria antiga é outra coisa — no capítulo do casamento (IV.5) Ptolomeu compara o Sol e a Lua das duas cartas, com peso especial na Lua de um sobre o Sol do outro; e no capítulo de onde sai o grau desta tela (IV.7) ele compara QUATRO lugares de cada carta: Sol, Lua, Ascendente e Parte da Fortuna. O aspecto abaixo é real e a fonte dele está citada; aplicar a escala de IV.7 a um par de signos solares é simplificação deste app, e o app prefere dizer isso a fingir que não.';

const NOTA_CARACTEROLOGIA =
  'O bloco "Como é na vida real", que abre esta leitura, é caracterologia contemporânea — e o app prefere dizer isso a deixar você supor outra coisa. Descrever personalidade por signo solar ("ariano é impulsivo", "escorpiano é intenso") não está em Ptolomeu nem em Manílio: é prática do século XX, de Alan Leo em diante, que chegou ao grande público pela coluna de jornal de R. H. Naylor (1930) e pelos livros de Linda Goodman (1968 e 1978). Da fonte antiga vem só a ossatura embaixo daquele texto, e ela é conferível: a distância entre os dois signos e a figura que ela forma (Tetrabiblos I.13 e I.16), os quatro elementos com suas duas qualidades cada (Aristóteles, Da Geração e Corrupção II.3), os três grupos sazonais que hoje se chamam modalidade (Tetrabiblos I.11) e o planeta que tem casa em cada signo (Tetrabiblos I.17). O vocabulário de temperamento pendurado nessa ossatura é nosso, e é moderno. Uma nota a mais, porque é fácil de perder: quando o texto diz quem costuma dar o primeiro passo, isso se apoia na superação (kathuperterisis), doutrina helenística transmitida por Antíoco, Pórfiro e Retório, segundo a qual entre dois lugares em aspecto predomina o que está no signo anterior — aquele a partir do qual o outro é o décimo. Onde não há aspecto nenhum, como na aversão, não há superação a invocar: ali quem decide a ordem é a modalidade lida ao modo moderno, e isso é leitura deste app, não da fonte. Nada disso entra no grau, na categoria ou na figura: a regência de planeta, em particular, não pesa um grama na conta (ver a lacuna registrada em NAO_ACHADO sobre regentes inimigos).';

// ---------------------------------------------------------------------------
// AS LEITURAS DO BLOCO 2 — uma por família, compostas com os fatos do par
// ---------------------------------------------------------------------------
// `c` chega pronto do motor: A, B, elemA, elemB, artA, artB, qA, qB, modA,
// modB, comum (qualidades cruas, pra lógica) e qComum (localizada, pra tela).
// Cada leitura ABRE em português de conversa e FECHA com a fonte — regra 6.
//
// ===========================================================================
// O CAMPO `caminho` — o que fazer com o diagnóstico (feedback do dono, 04/08/2026)
// ===========================================================================
// "nos pares difíceis o app já fala a real (mantém!) — mas agora todo par
// difícil precisa sair com um caminho prático de convivência."
//
// O defeito era de saída, não de conteúdo: `cuidado` nomeia a dor com precisão
// e para ali. Quem lê "aqui dói, e a tradição não finge que não" fecha a tela
// sabendo exatamente o que dói e nada sobre o que fazer com isso — e um app que
// só diagnostica é um app que cobra pra dar má notícia.
//
// `caminho` existe SÓ nas leituras TENSAS (quadratura, oposição e as duas
// aversões — categorias desarmonico e semAspecto, 84 dos 144 pares). Trígono,
// sextil e co-presença não recebem: o `cuidado` deles não é diagnóstico de
// dificuldade, e inventar "como conviver" onde não há atrito é encher linguiça.
//
// AS QUATRO REGRAS DO CAMPO — as mesmas do resto do arquivo, mais uma:
//   1. SEM PROMESSA. "costuma ajudar", "costuma render mais", "vale traduzir".
//      Nunca "vai resolver", "basta", "garantido", "com certeza". A regra 2 do
//      cabeçalho de lib/synastry.js proíbe decretar desfecho — e prometer que
//      um gesto resolve é decretar desfecho pelo lado bonito.
//   2. CONCRETO, NÃO EDIFICANTE. "combinar antes quem decide o quê, assunto por
//      assunto" é um gesto que cabe numa terça-feira. "aprendam a se comunicar"
//      não é caminho, é adjetivo.
//   3. A FONTE, ONDE ELA EXISTE. A quadratura tem a melhor de todas e o app
//      nunca a tinha usado: Lilly (Christian Astrology, 1647, p. 106) a chama de
//      "imperfect enmity" e, no exemplo horário da MESMA página, deriva daí que
//      "the matter is not yet so farre gone, but there may be hopes of
//      reconciliation betwixt them" — briga com conserto possível, dito em 1647.
//      A aversão pega IV.7, onde Ptolomeu registra que o laço tem TIPO (escolha,
//      necessidade, prazer e dor). Ver docs/tradicao/02-aspectos-e-sinastria.md
//      §2.4, §2.5 e §2.7.2. Onde a aplicação prática é nossa, está dito que é.
//   4. NENHUMA ALEGAÇÃO DE SAÚDE e NENHUMA PORCENTAGEM, como no resto.
//
// test/synastry.test.js e test/synastryIdiomas.test.js travam as quatro, nos
// três idiomas, e travam também que par tenso nenhum saia sem caminho.

const LEITURAS = {
  trigono(c) {
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
  },

  sextil(c) {
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
  },

  quadratura(c) {
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
      caminho: contrarios
        ? `Por onde começar, na prática: sem nenhuma qualidade em comum entre ${c.artA} e ${c.artB}, o terreno neutro não vem pronto — ` +
          `combinar ANTES quem decide o quê, assunto por assunto, costuma render mais do que acertar isso no calor da hora. ` +
          `E vale lembrar o que a fonte diz da figura: William Lilly (Christian Astrology, Londres, 1647, p. 106) chama a quadratura de "imperfect enmity" ` +
          `(inimizade imperfeita) e, na mesma página, tira daí que "the matter is not yet so farre gone" — é a briga em que ainda há reconciliação possível.`
        : `Por onde começar, na prática: o fio em comum é o ${c.comum[0]}, e é dele que costuma sair o terreno neutro — ` +
          `voltar ao que os dois já compartilham antes de discutir o que os separa é o gesto mais barato que este par tem à mão. ` +
          `E vale lembrar o que a fonte diz da figura: William Lilly (Christian Astrology, Londres, 1647, p. 106) chama a quadratura de "imperfect enmity" ` +
          `(inimizade imperfeita) e, na mesma página, tira daí que "the matter is not yet so farre gone" — é a briga em que ainda há reconciliação possível.`,
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
  },

  oposicao(c) {
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
      caminho:
        `Por onde começar, na prática: o eixo é UM só, então quase nunca há o que ganhar sozinho aqui — ` +
        `alternar quem conduz, tema por tema, costuma sustentar mais do que insistir em convencer o outro a atravessar pro seu lado. ` +
        `E o terreno comum é conferível, não é consolo: ${c.artA} e ${c.artB} compartilham o ${q}, o mesmo par de elementos que o ângulo leve de 60 graus junta — ` +
        `começar uma conversa dura por aí é usar o que já existe (a aritmética é da física de Aristóteles; usá-la assim é leitura deste app).`,
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
  },

  aversao(c, distancia) {
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
      caminho: umSigno
        ? `Por onde começar, na prática: nada aqui chega por reconhecimento automático, então dizer em voz alta o que ficaria subentendido — ` +
          `o que cada um espera da semana, e em que dia — costuma poupar mais atrito do que qualquer acerto feito depois do fato. ` +
          `E a fonte dá uma pista que serve: em Tetrabiblos IV.7 Ptolomeu registra que o laço tem TIPO — por escolha, por necessidade, ou por prazer e dor —, ` +
          `e onde a geometria não entrega familiaridade nenhuma o que sobra é a escolha, dita com todas as letras (a aplicação prática é leitura deste app).`
        : `Por onde começar, na prática: sem ângulo entre os dois, o encontro não acontece por acaso — ` +
          `marcar um ponto fixo na semana que seja dos dois, e repetir, costuma render mais aqui do que qualquer conversa sobre a relação. ` +
          `E vale traduzir em vez de supor: ${c.A} e ${c.B} não compartilham elemento nem modalidade, então o que parece óbvio pra um raramente chegou inteiro ao outro ` +
          `(a falta de familiaridade é de Tetrabiblos I.16; a tradução prática é leitura deste app).`,
      verbatins: [VERBATIM.disjuntos, VERBATIM.separacao],
      fontes: [
        'Ptolomeu, Tetrabiblos I.16 — signos disjuntos e alheios, a um ou a cinco signos de distância',
        'Ptolomeu, Tetrabiblos IV.5 — luminares em signos disjuntos entre as posições de separação',
        ARISTOTELES_LOCUS + ` — ${c.elemA} e ${c.elemB}: elementos distintos`,
        'Ptolomeu, Tetrabiblos I.11 — modalidades distintas (' + c.modA.nome + ' e ' + c.modB.nome + ')',
      ],
    };
  },

  copresenca(c) {
    return {
      aspecto: 'Co-presença',
      natureza: 'mesmo signo — a geometria se cala',
      categoria: CATEGORIAS.copresenca,
      resumo: `${c.A} com ${c.A}: dois iguais partindo do mesmo lugar. Co-presença, e não aspecto — Ptolomeu enumera quatro, e este não está na lista.`,
      texto:
        `Dois iguais no mesmo lugar: vocês se reconhecem de cara e falam a mesma língua de nascença — o desafio é que ninguém dentro do par enxerga de fora. ` +
        `O nome disso é Co-presença (estar junto no mesmo signo, em vez de se olhar de algum ângulo). ` +
        `E aqui a tradição diz uma coisa que este app faz questão de repetir em voz alta: isto NÃO é um aspecto. ` +
        `Ptolomeu enumera quatro — oposição, trígono, quadratura e sextil — e repete a lista adiante; conjunção (o nome que se usa hoje pra dois astros juntos no mesmo signo) não está nela. ` +
        `Signos no mesmo lugar não se olham: estão juntos. ${c.A} com ${c.A} é ${c.elemA} sobre ${c.elemA}, ${c.qA} em dobro, ` +
        `os dois ${c.modA.nome} (${c.modA.ptolomeu} em Ptolomeu: ${c.modA.glosa}). Nenhum contraste pra medir. ` +
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
        ARISTOTELES_LOCUS + ` — as duas qualidades do elemento ${c.elemA}`,
        'Ptolomeu, Tetrabiblos I.11 — modalidade ' + c.modA.nome,
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// O BLOCO 1 — "COMO É NA VIDA REAL" (caracterologia contemporânea, declarada)
// ---------------------------------------------------------------------------

// O que cada planeta move em cada dimensão. As frases estão na 3ª pessoa do
// singular de propósito, porque entram como sujeito "Fulano <frase>" e também
// como "cada um <frase>". Forma de CENA, não de contraste (ver lib/synastry.js).
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

const MESMO_REGENTE_LEAD = {
  quimica: 'correm no mesmo motor',
  conversa: 'puxam do mesmo lugar',
  briga: 'acendem do mesmo jeito',
  casa: 'administram a vida do mesmo jeito',
  prazo: 'precisam da mesma coisa pra continuar de pé',
};

// A frase dos regentes, em três formas (mesmo signo / mesmo planeta / dois
// planetas) — ver o comentário original em lib/synastry.js.
function fraseRegentes(c, campo) {
  const a = PLANETA[c.regA][campo];
  const b = PLANETA[c.regB][campo];
  if (c.A === c.B) {
    return `Sendo o mesmo signo nos dois lados, ${c.A} ${a} — e o traço vem em dobro, sem ninguém pra fazer contraponto.`;
  }
  if (c.regA === c.regB) {
    return `${c.A} e ${c.B} ${MESMO_REGENTE_LEAD[campo]}, e o retrato vale pros dois: cada um ${a}.`;
  }
  return `${c.A} ${a}; ${c.B} ${b}.`;
}

// --- QUÍMICA E CAMA ---------------------------------------------------------
// A linha de cama, uma por figura — o fecho da frase de figura, e a linha que
// o card de compartilhar usa sozinha (fraseDeCama no motor).
const QUIMICA_CAMA = {
  copresenca: 'vocês querem a mesma coisa na mesma hora, e ninguém puxa: não há de onde um olhar o outro de cima',
  trigono: 'vocês pegam o ritmo na primeira noite, e o problema aqui nunca é falta de vontade',
  sextil: 'começa mais devagar do que os dois esperavam e melhora com o tempo, que é o contrário do que costuma acontecer',
  quadratura: 'o que irrita de dia é exatamente o que puxa de noite',
  oposicao: 'na cama a discussão do dia continua por outros meios, e é aí que ela funciona',
  aversao30: 'no começo um dos dois sempre acha que quer mais que o outro, e quase nunca é verdade: é só o tempo de resposta que é diferente',
  aversao150: 'a vontade não chega junto, chega quando um dos dois decide que chegou',
};

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
  'fogo+água': (c) => `${c.el('fogo')} avança e ${c.el('água')} sente antes de responder — quando o tempo dos dois coincide é elétrico, e quando não coincide um se sente recusado e o outro apressado.`,
  'ar+terra': (c) => `${c.el('ar')} quer conversar sobre o desejo e ${c.el('terra')} quer praticá-lo em silêncio, e nenhum dos dois entende de imediato por que o outro insiste no contrário.`,
  'ar+água': (c) => `${c.el('água')} precisa de clima e ${c.el('ar')} precisa de leveza: funciona muito bem enquanto ninguém cobra do outro a própria língua.`,
};

const QUIMICA_MODALIDADE = {
  'cardeal+cardeal': () => 'O risco é o desejo virar a coisa que os dois adiam, porque os dois só sabem começar.',
  'fixo+fixo': () => 'O risco é o desejo virar hábito e os dois repetirem o mesmo roteiro por meses, sem reclamar e sem mudar nada.',
  'mutavel+mutavel': () => 'O risco é o assunto mudar, o plano mudar e a vontade mudar junto, e faltar a repetição que transforma atração em intimidade.',
  'cardeal+fixo': (c) => `Esfria quando ${c.md('cardeal')} propõe novidade e ${c.md('fixo')} quer o que já deu certo, e um lê o outro como pressa ou como marasmo.`,
  'cardeal+mutavel': (c) => `Esfria quando ${c.md('cardeal')} decide e ${c.md('mutavel')} se adapta, até o dia em que se adaptar sai caro demais.`,
  'fixo+mutavel': (c) => `Esfria quando ${c.md('fixo')} quer garantia e ${c.md('mutavel')} quer liberdade de mudar de ideia, e essa é a conversa que sempre volta pra cama.`,
};

// --- CONVERSA ----------------------------------------------------------------
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
  'fogo+água': (c) => `${c.el('fogo')} diz a coisa direta que ${c.el('água')} costuma remoer por dias, e o assunto às vezes reaparece na semana seguinte.`,
  'ar+terra': (c) => `${c.el('ar')} teoriza e ${c.el('terra')} quer o exemplo concreto: o mal-entendido clássico é um achar o outro raso e o outro achar o primeiro complicado.`,
  'ar+água': (c) => `${c.el('ar')} explica o sentimento e ${c.el('água')} sente a explicação, e quando esquenta um foge pra lógica e o outro foge pro silêncio.`,
};

const CONVERSA_MODALIDADE = {
  'cardeal+cardeal': () => 'Quem cede o assunto: nenhum dos dois, e é por isso que a conversa que importa costuma virar duas conversas paralelas.',
  'fixo+fixo': () => 'Quem cede o assunto: ninguém cede, mas os dois arquivam — o tema sai da mesa inteiro e volta igualzinho semanas depois.',
  'mutavel+mutavel': () => 'Quem cede o assunto: os dois, com gosto, e é por isso que o tema que importa fica pro próximo domingo.',
  'cardeal+fixo': (c) => `Quem cede o assunto é ${c.md('cardeal')}, que já quer concluir e passar pro próximo, enquanto ${c.md('fixo')} continua no mesmo ponto.`,
  'cardeal+mutavel': (c) => `Quem cede o assunto é ${c.md('mutavel')}, que muda de rota sem reclamar e só percebe depois que não foi ouvido.`,
  'fixo+mutavel': (c) => `Quem cede o assunto é ${c.md('mutavel')}, e ${c.md('fixo')} recolhe o tema e devolve na frase seguinte, do mesmo jeito.`,
};

// --- BRIGA --------------------------------------------------------------------
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

// --- CONVIVÊNCIA ---------------------------------------------------------------
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

// --- O QUE SEGURA A LONGO PRAZO -------------------------------------------------
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
// vire veredito.
const LONGO_FECHO = {
  harmonico: 'Facilidade também não é promessa: o que está descrito aqui é o jeito da coisa, e o desfecho segue sendo de vocês dois.',
  desarmonico: 'E fica dito, porque é o que a tradição registra e o mercado esconde: atrito não é sentença — a mesma fonte que este app cita descreve a união em posição difícil que não termina, e volta a se refazer.',
  semAspecto: 'E isto descreve o começo de vocês, não o fim: falta de reconhecimento automático é ponto de partida, e ponto de partida não decide desfecho nenhum.',
  copresenca: 'Semelhança também não é promessa: o que está descrito aqui é o jeito da coisa, e o desfecho segue sendo de vocês dois.',
};

// --- A CHAMADA — a primeira linha que a pessoa lê -------------------------------
const CHAMADA = {
  copresenca: (c) => `${c.A} com ${c.B}: dois iguais no mesmo lugar, e o espelho mostra tudo — inclusive o que ninguém queria ver.`,
  trigono: (c) => `${c.A} e ${c.B}: mesma língua, mesmo ritmo de desejo, e quem dá o primeiro passo quase sempre é ${c.lider}.`,
  sextil: (c) => `${c.A} e ${c.B}: liga de verdade com espaço de sobra — ${c.lider} puxa, ${c.segue} acompanha, e ninguém se sente sufocado.`,
  quadratura: (c) => `${c.A} e ${c.B}: o que irrita de dia é o que acende de noite, e quem empurra a relação pra frente é ${c.lider}.`,
  oposicao: (c) => `${c.A} e ${c.B}: imã e cabo de guerra na mesma corda. Ninguém cede primeiro, e é isso que puxa e é isso que cansa.`,
  aversao30: (c) => `${c.A} e ${c.B}: nada aqui vem pronto, nem o desejo nem a conversa, e a ponte costuma ser levantada por ${c.lider}.`,
  aversao150: (c) => `${c.A} e ${c.B}: dois mundos que não se cruzam por acaso — ${c.lider} dá o primeiro passo, e o que existe entre os dois foi escolhido.`,
};

export const PACK = {
  lang: 'pt',
  signos: SIGNOS,
  elementos: ELEMENTOS,
  artigos: ARTIGOS,
  qualidades: QUALIDADES_NOME,
  fraseQualidades,
  modalidades: MODALIDADES,
  categorias: CATEGORIAS,
  grausIV7: GRAUS_IV7,
  aristotelesLocus: ARISTOTELES_LOCUS,
  notaEscala: NOTA_ESCALA,
  notaGrau: NOTA_GRAU,
  ressalvaSignoSolar: RESSALVA_SIGNO_SOLAR,
  notaCaracterologia: NOTA_CARACTEROLOGIA,
  verbatim: VERBATIM,
  leituras: LEITURAS,
  planeta: PLANETA,
  mesmoRegenteLead: MESMO_REGENTE_LEAD,
  fraseRegentes,
  quimicaCama: QUIMICA_CAMA,
  quimicaFigura: QUIMICA_FIGURA,
  quimicaElemento: QUIMICA_ELEMENTO,
  quimicaModalidade: QUIMICA_MODALIDADE,
  conversaFigura: CONVERSA_FIGURA,
  conversaElemento: CONVERSA_ELEMENTO,
  conversaModalidade: CONVERSA_MODALIDADE,
  brigaFigura: BRIGA_FIGURA,
  brigaElemento: BRIGA_ELEMENTO,
  brigaModalidade: BRIGA_MODALIDADE,
  convivenciaFigura: CONVIVENCIA_FIGURA,
  convivenciaElemento: CONVIVENCIA_ELEMENTO,
  convivenciaModalidade: CONVIVENCIA_MODALIDADE,
  longoFigura: LONGO_FIGURA,
  longoElemento: LONGO_ELEMENTO,
  longoFecho: LONGO_FECHO,
  chamada: CHAMADA,
};
