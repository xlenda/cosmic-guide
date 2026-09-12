// datos/hechos.js — O ATIVO MAIS CARO DO APP.
//
// ===========================================================================
// O QUE ESTE ARQUIVO SUBSTITUI
// ===========================================================================
// No Heat Game, depois de raspar a carta-surpresa aparece "EITA! 92% dos
// usuarios fizeram check-in nesta posicao!" com o numero animando pra cima.
// Aquele numero e inventado: nao existe medicao, nao existe usuario contado,
// nao existe nada atras dele. E o eixo em que o mercado inteiro trapaceia.
//
// Aqui o mesmo slot recebe um FATO HISTORICO VERIFICAVEL sobre a carta que a
// pessoa acabou de raspar, e o contador anima ate um ANO REAL. A surpresa
// continua existindo — ela so passa a ser verdadeira. E o unico eixo
// (Confianca) onde este produto ganha do mercado, e ele so vale enquanto cada
// linha daqui aguentar ser conferida por quem quiser conferir.
//
// ===========================================================================
// DE ONDE VEIO CADA BLOCO — os tres, com o grau de evidencia de cada um
// ===========================================================================
// BLOCO A — 6 cartas (major-00, 08, 10, 11, 13, 17).
//   Vem de NOTAS_DE_CARTA em `lib/tarotHistoria.js` do Cosmic Guide e da prosa
//   ja escrita em `lib/traducoes/tarotHistoria.es.js`. La cada afirmacao aponta
//   um `doc` da base e uma lista de `provas` — strings LITERAIS que o teste do
//   Cosmic Guide abre e confere no documento. Ou seja: sao as unicas 6 cartas
//   cujo fato ja passou por verificacao de maquina. As FONTES foram mantidas
//   exatamente como estao la; a prosa foi reescrita em espanhol LatAm neutro.
//
// BLOCO B — 10 cartas (major-01, 02, 03, 04, 07, 09, 12, 14, 20, 21).
//   Escritas aqui a partir de `docs/tradicao/05-taro-historia-e-leitura.md`
//   (secoes 1.2, 2.3, 3.2, 4.1, 4.2, 4.3, 4.4 e 5) e de
//   `docs/tradicao/14-simbolismo-comparado.md` (secao 4). Sao 19 documentos de
//   pesquisa em fonte primaria, com grau marcado item a item — [FP] fonte
//   primaria, [TP] tradicao posterior, [IM] invencao moderna, [D] disputado.
//   So entrou aqui o que la esta marcado [FP], e o que e [D] esta declarado
//   como interpretacao dentro do proprio `cuerpo` (ver major-07).
//
// BLOCO C — 6 cartas (major-05, 06, 15, 16, 18, 19).
//   Nao ha fato especifico dessas cartas nos documentos do repo. Em vez de
//   inventar, cada uma recebeu um fato amplamente documentado e conferivel por
//   quem tiver os dois baralhos na mao ou o catalogo aberto: o titulo impresso
//   na carta do padrao de Marselha (Nicolas Conver, 1760) contra o titulo do
//   Rider-Waite-Smith (William Rider & Son, Londres, dezembro de 1909,
//   ilustrado por Pamela Colman Smith sob direcao de Arthur Edward Waite), a
//   iconografia que atravessou de um pro outro, as cartas ausentes do
//   Visconti-Sforza e o monograma PCS. E o bloco mais fraco em evidencia, e
//   esta declarado como tal aqui em cima de proposito.
//
// ===========================================================================
// POR QUE OS 56 MENORES NAO TEM ENTRADA — e isso NAO e buraco
// ===========================================================================
// A carta-surpresa sorteia SO entre os 22 Arcanos Maiores. Com os 22 cobertos,
// e impossivel a tela chegar num slot sem fato — nao existe estado de "sem
// dado" pra tratar, nao existe texto de enchimento pra escrever. Se um dia o
// sorteio abrir para as 78, a resposta certa NAO e escrever 56 curiosidades:
// e `hechoDeCarta` devolver null e a tela nao mostrar o bloco. Nota generica
// com cara de fonte e exatamente o dano que este arquivo existe pra evitar.
//
// ===========================================================================
// REGRA INEGOCIAVEL DE MANUTENCAO
// ===========================================================================
// A tela se anuncia como DADO VERIFICAVEL. Um fato inventado aqui e o pior
// dano possivel ao produto, porque quebra justamente o eixo que o diferencia.
// Quem mexer neste arquivo:
//   1. Sem fonte solida, NAO inventa. Escreve o fato mais geral que sabe ser
//      verdadeiro (a edicao de 1909, Pamela Colman Smith creditada so pelas
//      iniciais, o baralho em dominio publico) e diz na `fuente` a que ele se
//      refere. E melhor um fato geral verdadeiro que um fato especifico falso.
//   2. Onde for interpretacao e nao fato, o `cuerpo` TEM de dizer isso com
//      todas as letras ("os historiadores relacionam com...; o baralho nunca
//      disse isso"). Ver major-06 e major-07.
//   3. Nenhum fato fala de desfecho de relacionamento, de previsao ou de sorte.
//      Fato historico e sobre o BARALHO, nunca sobre a vida de quem raspou.
//   4. Nada de numero redondo sem fonte. Todo `anios` e um ano que aparece
//      textualmente na `fuente` da mesma entrada.
//   5. Zero prova social: nenhuma porcentagem, nenhum contador de gente,
//      nenhum depoimento. Foi pra isso que este arquivo foi escrito.
//
// Portugues do Brasil em todo texto de tela, tratamento por "voce". As citacoes
// de Waite ficam em INGLES nos tres blocos — traduzir uma citacao e falsifica-la;
// a traducao vai ao lado, entre travessoes. Titulo de obra, nome de autor e ANO
// tambem nao se traduzem: sao o recibo. So vira portugues o que e palavra comum
// da fonte ("edicao de", "impresso em") e o exonimo consagrado de cidade
// (Marselha, Londres, Paris, Milao).

/** @typedef {{ anios: number, titular: string, cuerpo: string, fuente: string }} Hecho */

/**
 * Um fato historico por Arcano Maior, de 'major-00' a 'major-21'.
 *
 * `anios`   — inteiro que o contador anima ate ele. E sempre um ano que
 *             aparece textualmente na `fuente` desta mesma entrada.
 * `titular` — a frase que cria a surpresa, no lugar do "92% dos usuarios".
 * `cuerpo`  — 2 a 3 frases explicando o fato.
 * `fuente`  — obra, autor/impressor, cidade e ano. E o recibo: tem de dar pra
 *             conferir sem pedir licenca a ninguem.
 *
 * @type {Record<string, Hecho>}
 */
export const HECHOS = {
  // --- BLOCO A · verificado por teste no Cosmic Guide -----------------------
  'major-00': {
    anios: 1911,
    titular: 'A carta traz um 0, e o autor do baralho escreveu que ela não tem número.',
    cuerpo:
      'Você olha O Louco e vê um zero impresso em cima. No livro que acompanha o baralho, A. E. Waite escreve: "Wherever it ought to be put, the Zero is an unnumbered card" — onde quer que ela deva ser posta, o Zero é uma carta sem número — e na lista de significados dele O Louco aparece depois do 20, não antes do 1. ' +
      'No Tarô de Marselha a carta se chama LE MAT e não leva número nenhum; o "0 no começo" é convenção da Golden Dawn, do fim do século XIX.',
    fuente: 'A. E. Waite, The Pictorial Key to the Tarot, Parte II §3 — William Rider & Son, Londres, 1911 (domínio público)',
  },

  'major-08': {
    anios: 1909,
    titular: 'Esta carta era a 11. Mudou de número por um motivo astrológico.',
    cuerpo:
      'Nos baralhos anteriores A Justiça é a 8 e A Força é a 11. A troca que você vê aqui já estava nos Cipher Manuscripts da Golden Dawn antes de o baralho de 1909 existir: Waite seguiu a ordem da ordem em que se formou, não a inventou. ' +
      'O motivo é de tabela e é simples: com Leão na 8 e Libra na 11, os doze signos ficam em sequência zodiacal.',
    fuente:
      'Golden Dawn, Cipher Manuscripts, fim do século XIX — editados em The Complete Golden Dawn Cipher Manuscript, Golden Dawn Studies nº 1, 1996; a ordem impressa, no baralho Rider-Waite-Smith, William Rider & Son, Londres, 1909',
  },

  'major-10': {
    anios: 1911,
    titular: 'Invertida, esta carta MELHORA no texto original.',
    cuerpo:
      'A regra que circula diz que a carta invertida é a mesma coisa, só que travada. No texto de Waite não é assim: A Roda da Fortuna invertida é "Increase, abundance, superfluity" — aumento, abundância, excesso. ' +
      'A invertida sistemática, carta por carta, quem instituiu foi Etteilla no século XVIII; a chave "invertida é bloqueio" só chegou no século XX, com Eden Gray, Rachel Pollack e Mary K. Greer.',
    fuente: 'A. E. Waite, The Pictorial Key to the Tarot, "Divinatory Meanings" (X) — Londres, 1911',
  },

  'major-11': {
    anios: 1911,
    titular: 'Waite escolheu uma única carta como exemplo, e o exemplo era um processo.',
    cuerpo:
      'A Justiça era a 8 até a Golden Dawn trocar o número dela com o de A Força, e essa mudança já estava nos Cipher Manuscripts, antes do baralho. ' +
      'É, além disso, a única carta que Waite nomeia ao explicar como escolher o significador quando a consulta é sobre um assunto e não sobre uma pessoa: o exemplo textual dele é "haverá processo?", e a carta que ele manda pôr sobre a mesa é o trunfo XI. ' +
      'O detalhe está na descrição que ele faz da Cruz Celta, que ele mesmo intitula "um antigo método céltico" sem oferecer uma única prova de que seja céltico nem antigo.',
    fuente:
      'A. E. Waite, The Pictorial Key to the Tarot, Parte III §7 — Londres, 1911; a troca VIII ⇄ XI, nos Cipher Manuscripts da Golden Dawn, fim do século XIX',
  },

  'major-13': {
    anios: 1911,
    titular: 'A delicadeza com que hoje se lê esta carta é do século XX.',
    cuerpo:
      'Quando sai A Morte, alguém na mesa diz "não é morte literal, é transformação". Essa segunda frase é uma escolha de leitura do século passado — legítima, e é ela que sustenta a leitura de hoje — mas não é o que está escrito em 1911: a entrada de Waite abre com "End, mortality, destruction, corruption". ' +
      'Dizer "a tradição sempre leu esta carta como transformação" é atribuir a Waite uma delicadeza que foi do século seguinte, não dele.',
    fuente: 'A. E. Waite, The Pictorial Key to the Tarot, "Divinatory Meanings" (XIII) — Londres, 1911',
  },

  'major-17': {
    anios: 1911,
    titular: 'Em 1911 esta era uma carta de roubo.',
    cuerpo:
      'Você tirou A Estrela e leu esperança. O livro que Waite escreveu para acompanhar o baralho começa essa entrada por outro lado: "Loss, theft, privation, abandonment" — perda, roubo, privação, abandono. ' +
      'A esperança aparece depois, apresentada como "another reading says". A prioridade entre as duas se inverteu ao longo do século XX, e a leitura de hoje segue a imagem de Pamela Colman Smith, não a lista de palavras de Waite.',
    fuente: 'A. E. Waite, The Pictorial Key to the Tarot, "Divinatory Meanings" (XVII) — Londres, 1911',
  },

  // --- BLOCO B · escrito aqui, sobre os documentos de pesquisa do repo ------
  'major-01': {
    anios: 1854,
    titular: 'Esta carta foi a primeira letra do alfabeto hebraico durante 34 anos.',
    cuerpo:
      'Éliphas Lévi começa a contagem em O Mago e dá a ele Aleph, a primeira letra, deixando O Louco sem número entre o Julgamento e o Mundo. ' +
      'Em 1888 a Golden Dawn puxa O Louco para a frente, dá Aleph a ele, e a O Mago cabe Beth — com isso todas as letras se deslocam um lugar. ' +
      'As duas tabelas circulam hoje como se fossem uma só, e são incompatíveis: quem diz "a correspondência" está escolhendo um lado sem avisar.',
    fuente:
      'Éliphas Lévi, Dogme et Rituel de la Haute Magie — Paris, 1854 e 1856; frente a Golden Dawn, Cipher Manuscripts e "Book T — The Tarot", de 1888 em diante, publicado por Israel Regardie, Chicago, 1937',
  },

  'major-02': {
    anios: 1789,
    titular: 'A Lua desta carta foi escolhida por um cartomante que assinava o sobrenome ao contrário.',
    cuerpo:
      'Jean-Baptiste Alliette inverteu o próprio sobrenome e passou a se chamar Etteilla; em 1789 publicou o Grand Etteilla, o primeiro baralho desenhado de propósito para leitura. ' +
      'Foi ele quem fixou Sacerdotisa = Lua e Imperatriz = Vênus, e a Golden Dawn conservou essas duas quando montou a tabela dela um século depois, descartando o resto do sistema dele por incompatível. ' +
      'A atribuição não vem do Egito nem de Jerusalém: vem de um profissional parisiense do século XVIII que cobrava por consulta.',
    fuente:
      'Jean-Baptiste Alliette, "Etteilla", Grand Etteilla — Paris, 1789; a passagem para a Golden Dawn, em Ronald Decker, Thierry Depaulis e Michael Dummett, A Wicked Pack of Cards, Londres, 1996',
  },

  'major-03': {
    anios: 1911,
    titular: 'Na lista original, esta carta lê melhor invertida do que em pé.',
    cuerpo:
      'A Imperatriz em pé, na lista de Waite, inclui "difficulty, doubt, ignorance" — dificuldade, dúvida, ignorância. A Imperatriz invertida é "Light, truth, the unravelling of involved matters, public rejoicings": luz, verdade, o desenredar de assuntos emaranhados. ' +
      'Ou seja, em 1911 a invertida não era a versão travada de nada, e a chave moderna "invertida = energia bloqueada" é do século XX, com autores de nome conhecido: Eden Gray, Rachel Pollack, Mary K. Greer.',
    fuente:
      'A. E. Waite, The Pictorial Key to the Tarot, "Divinatory Meanings" (III) — Londres, 1911; a leitura contemporânea, em Mary K. Greer, The Complete Book of Tarot Reversals, 2002',
  },

  'major-04': {
    anios: 1944,
    titular: 'Uma única linha de um livro de 1904 mudou a letra desta carta.',
    cuerpo:
      'Aleister Crowley leu no Liber AL vel Legis I:57 a frase "Tzaddi is not the Star" e concluiu que dois trunfos tinham trocado de letra. ' +
      'Em The Book of Thoth, de 1944, O Imperador passa a ser Tzaddi e A Estrela passa a ser Heh; os signos não se mexem — Áries continua no Imperador e Aquário na Estrela — o que se mexe são as letras e, com elas, os caminhos. ' +
      'Quem lê com o baralho de Crowley herda essa mudança; quem lê com o de 1909, não. São dois sistemas, não um.',
    fuente:
      'Aleister Crowley, The Book of Thoth — Londres, 1944, arte de Frieda Harris; a frase citada é do Liber AL vel Legis I:57, 1904',
  },

  'major-07': {
    anios: 1966,
    titular: 'Existe uma tese de que este carro é, literalmente, um carro alegórico de desfile.',
    cuerpo:
      'Gertrude Moakley propôs em 1966 que os 22 trunfos são o programa visual dos desfiles triunfais italianos e dos Triumphi de Petrarca: carros alegóricos que atravessavam a cidade em festa, cada um vencendo o anterior. ' +
      'A palavra trionfo, de onde sai "trunfo", nomeava o desfile antes de nomear o jogo. ' +
      'Cuidado com o grau: os historiadores relacionam a carta com esses desfiles e a tese é influente, mas não é consenso — o baralho nunca disse isso, e nenhum documento do século XV confirma.',
    fuente:
      'Gertrude Moakley, The Tarot Cards Painted by Bonifacio Bembo — New York Public Library, 1966. Tese influente, não consensual',
  },

  'major-09': {
    anios: 1911,
    titular: 'Na lista de 1911, a primeira palavra desta carta é "traição".',
    cuerpo:
      'O significado em pé de O Eremita no livro de Waite inclui "treason, dissimulation, roguery, corruption" — traição, dissimulação, malandragem, corrupção. ' +
      'A leitura de hoje, a do recolhimento e da lâmpada que ilumina o próprio caminho, segue a imagem de Pamela Colman Smith e não essa lista. ' +
      'As duas metades do baralho não contam a mesma história: as listas de palavras descendem da cartomancia francesa, e as imagens carregam simbolismo da Golden Dawn.',
    fuente: 'A. E. Waite, The Pictorial Key to the Tarot, "Divinatory Meanings" (IX) — Londres, 1911',
  },

  'major-12': {
    anios: 1937,
    titular: 'Só três cartas do baralho levam uma letra "mãe". Esta é uma delas.',
    cuerpo:
      'O Sefer Yetzirah, texto do primeiro milênio, divide o alfabeto hebraico em 3 mães, 7 duplas e 12 simples. Quando a Golden Dawn encaixou os trunfos nessa grade, as três mães caíram em O Louco (Aleph, ar), O Enforcado (Mem, água) e O Julgamento (Shin, fogo); Israel Regardie publicou esse material a partir de 1937 e só aí ele pôde ser lido fora da ordem. ' +
      'Muitas tabelas que circulam hoje trazem essa coluna errada: se uma chama de "mãe" Beth, Guímel ou Dálet, está corrompida.',
    fuente:
      '"Book T — The Tarot", Golden Dawn — publicado por Israel Regardie em The Golden Dawn, Chicago, 1937; a divisão 3 mães / 7 duplas / 12 simples é do Sefer Yetzirah, caps. 4 e 5',
  },

  'major-14': {
    anios: 1911,
    titular: 'Das quatro virtudes cardeais, neste baralho falta uma.',
    cuerpo:
      'A Temperança, A Força e A Justiça estão entre os trunfos; a Prudência não. Ela está, sim, na Minchiate florentina do século XVI, um tarô de 97 cartas onde ainda desfilam os doze signos e os quatro elementos — ou seja, a ausência é decisão de fabricante, não enigma. ' +
      'Detalhe da mesma carta: na lista de Waite, a Temperança invertida é "things connected with churches, religions, sects, the priesthood".',
    fuente:
      'A. E. Waite, The Pictorial Key to the Tarot, "Divinatory Meanings" (XIV) — Londres, 1911; a Minchiate florentina de 97 cartas, século XVI, catalogada em Michael Dummett, The Game of Tarot: from Ferrara to Salt Lake City, Londres, 1980',
  },

  'major-20': {
    anios: 1856,
    titular: 'No sistema francês, O Louco se senta exatamente entre esta carta e O Mundo.',
    cuerpo:
      'Éliphas Lévi ordenou os trunfos com O Mago na frente e deixou O Louco sem número, metido entre O Julgamento (XX) e O Mundo (XXI). Com esse arranjo O Julgamento recebe a letra Resh; na tabela da Golden Dawn, três décadas depois, O Julgamento recebe Shin e O Louco vai para o começo. ' +
      'Há três lugares possíveis para uma carta sem número, e a história usou os três: o Comte de Mellet a pôs no fim em 1781, Lévi no penúltimo buraco, a Golden Dawn na frente.',
    fuente:
      'Éliphas Lévi, Dogme et Rituel de la Haute Magie — Paris, 1854 e 1856; o ensaio do Comte de Mellet, em Le Monde primitif, vol. VIII, Paris, 1781; a tabela da Golden Dawn, em "Book T", publicado por Israel Regardie, Chicago, 1937',
  },

  'major-21': {
    anios: 1888,
    titular: 'É o único trunfo em que as duas escolas rivais concordam.',
    cuerpo:
      'A tabela de Lévi e a da Golden Dawn estão deslocadas uma casa inteira: onde uma põe Aleph a outra põe Beth, e assim até o fim. ' +
      'A única carta que recebe a mesma letra nas duas é O Mundo, que é Tav em ambas — a última letra, na última carta. ' +
      'A coincidência é aritmética e não mística: é o que sobra quando dois sistemas começam diferente e terminam no mesmo lugar.',
    fuente:
      'Éliphas Lévi, Dogme et Rituel de la Haute Magie — Paris, 1854 e 1856; frente a Golden Dawn, Cipher Manuscripts e "Book T — The Tarot", de 1888 em diante, publicado por Israel Regardie, Chicago, 1937',
  },

  // --- BLOCO C · fato geral documentado, na falta de fato da carta ----------
  'major-05': {
    anios: 1909,
    titular: 'Durante mais de quatro séculos esta carta se chamou, sem rodeios, "O Papa".',
    cuerpo:
      'Nos trunfos italianos do século XV e no padrão de Marselha a carta traz impresso LE PAPE, e a parceira dela, a número 2, LA PAPESSE. São duas das "condições de vida" que desfilam na série, ao lado do Imperador e da Imperatriz. ' +
      'Os nomes Hierofante e Sacerdotisa aparecem no baralho publicado em Londres em dezembro de 1909: são uma troca de rótulo de pouco mais de um século, não um nome antigo.',
    fuente:
      'Tarot de Nicolas Conver, Marselha, 1760 (base do Ancien Tarot de Marseille de Paul Marteau, Grimaud, 1930); frente ao baralho Rider-Waite-Smith, William Rider & Son, Londres, 1909',
  },

  'major-06': {
    anios: 1909,
    titular: 'A cena que você conhece tem pouco mais de um século. A anterior era outra coisa.',
    cuerpo:
      'No padrão de Marselha a carta mostra um jovem entre duas figuras, com um arqueiro apontando lá de cima: uma cena de escolha, não de casal. ' +
      'A versão que virou padrão — duas figuras nuas, um anjo, duas árvores — é a que Pamela Colman Smith desenhou para o baralho de 1909, e virou padrão porque esse baralho virou padrão. ' +
      'Os historiadores relacionam a cena antiga com o motivo da encruzilhada moral; o baralho nunca disse isso, e essa parte é interpretação.',
    fuente:
      'Tarot de Nicolas Conver, Marselha, 1760; frente ao baralho Rider-Waite-Smith, William Rider & Son, Londres, 1909, arte de Pamela Colman Smith',
  },

  'major-15': {
    anios: 1441,
    titular: 'No tarô pintado mais antigo que sobreviveu, esta carta não está.',
    cuerpo:
      'Os baralhos Visconti-Sforza, pintados à mão com folha de ouro em Milão por volta de 1441–1451, são os tarôs mais velhos que chegaram até hoje — e chegaram incompletos: ao conjunto que hoje se divide entre a Morgan Library e a Accademia Carrara faltam justamente O Diabo e A Torre. ' +
      'Os catálogos não decidem se elas se perderam ou se nunca chegaram a ser pintadas. Qualquer afirmação sobre "o Diabo original" do século XV se faz sobre uma carta que ninguém tem diante dos olhos.',
    fuente:
      'Baralhos Visconti-Sforza, atribuídos em parte a Bonifacio Bembo — Milão, c. 1441–1451 (Morgan Library, Nova York; Accademia Carrara, Bérgamo); catalogados em Stuart R. Kaplan, The Encyclopedia of Tarot, U.S. Games Systems, 1978–2005',
  },

  'major-16': {
    anios: 1760,
    titular: 'No baralho de Marselha esta carta se chama "A Casa de Deus".',
    cuerpo:
      'O tarô de Nicolas Conver, impresso em Marselha em 1760, intitula a carta LA MAISON DIEU: a casa de Deus, não uma torre. O nome "A Torre" é o do baralho londrino de 1909. ' +
      'E o padrão inteiro se chama "de Marselha" bem depois de já existir: quem popularizou foi Paul Marteau com a fábrica Grimaud, em 1930, fixando cores e desenho a partir do Conver.',
    fuente:
      'Tarot de Nicolas Conver, Marselha, 1760; o nome do padrão, popularizado por Paul Marteau, Ancien Tarot de Marseille, Grimaud, Paris, 1930',
  },

  'major-18': {
    anios: 1909,
    titular: 'O crustáceo que sai da água já estava nos baralhos franceses do século XVIII.',
    cuerpo:
      'Duas torres, dois animais uivando e um crustáceo saindo do lago: a cena está no padrão de Marselha muito antes de 1909, e Pamela Colman Smith a manteve quase inteira ao redesenhar o baralho. ' +
      'É uma das poucas cartas em que a continuidade visual entre os dois baralhos se vê a olho nu. O que mudou não foi o desenho: foi o sistema de leitura pendurado em cima dele, montado entre 1781 e 1911.',
    fuente:
      'Tarot de Nicolas Conver, Marselha, 1760; frente ao baralho Rider-Waite-Smith, William Rider & Son, Londres, 1909, arte de Pamela Colman Smith',
  },

  'major-19': {
    anios: 1909,
    titular: 'Existe uma assinatura escondida nas 78 cartas, e são só três letras.',
    cuerpo:
      'Num canto de cada cena está o monograma PCS: é Pamela Colman Smith (1878–1951), a ilustradora que desenhou as 78 a partir de indicações de A. E. Waite, sem esboços dele. ' +
      'O nome dela ficou fora do título do baralho por décadas, e por isso o correto é dizer Rider-Waite-Smith, e não Rider-Waite. ' +
      'Este dado não é exclusivo de O Sol: vale para as 78 cartas, e é o que mais se omite quando se conta de onde saiu este baralho.',
    fuente:
      'Baralho Rider-Waite-Smith — William Rider & Son, Londres, dezembro de 1909; arte de Pamela Colman Smith (1878–1951), estrutura e conceito de Arthur Edward Waite',
  },
};

// Congela em profundidade: conteudo curado nao muda em runtime. Se alguem
// tentar escrever por cima, o objeto simplesmente ignora — e o bug aparece no
// teste e nao na tela da usuaria.
Object.keys(HECHOS).forEach((id) => Object.freeze(HECHOS[id]));
Object.freeze(HECHOS);

/**
 * O fato historico de uma carta, pelo id do baralho ('major-17').
 *
 * Devolve `null` para qualquer id sem entrada — os 56 menores inclusive. Isso
 * e a resposta certa, nao um buraco: a tela nao mostra o bloco. Inventar uma
 * curiosidade para preencher e o unico erro que este arquivo nao pode cometer.
 *
 * @param {string} id
 * @returns {Hecho|null}
 */
export function hechoDeCarta(id) {
  if (typeof id !== 'string') return null;
  return HECHOS[id] || null;
}

export default HECHOS;
