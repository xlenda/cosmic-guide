// lib/traducoes/melotesiaDupla.pt.js
// O PACK PORTUGUÊS da melotesia dupla — TODA prosa que o usuário lê mora aqui.
// O motor (as duas listas, a comparação, a contagem, a montagem do recibo) fica
// em lib/melotesiaDupla.js.
//
// Os packs irmãos (melotesiaDupla.es.js, melotesiaDupla.en.js) repetem
// exatamente esta FORMA: mesmas chaves, mesmos campos, funções com a mesma
// assinatura.
//
// TODAS as regras do cabeçalho de lib/melotesiaDupla.js valem para cada string
// daqui, e duas delas mandam mais que as outras neste assunto:
//
//   · NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita. Nada sobre o que uma parte do
//     corpo sente, precisa ou como se ocupar dela. Diga o que a tradição
//     atribuía, no passado, com fonte. Na dúvida sobre uma frase, corte a
//     frase. Melotesia é o assunto em que essa linha é atravessada sem querer.
//   · PRENDE PRIMEIRO, FONTE DEPOIS. Cada `abertura` é uma cena de vida real —
//     a tatuagem, a cadeira do escritório, o provador da loja — e o recibo vem
//     na `leitura`, depois. Nunca o contrário.
//
// E a regra estrutural da feature: as duas colunas NUNCA viram uma. Não existe
// nesta tela nenhuma frase que diga "a parte do corpo de Áries é X" — existe
// "Manílio atribuía X" e "o Sefer Yetzirah atribuía Y".

// ---------------------------------------------------------------------------
// RÓTULOS — as colunas e as peças do recibo
// ---------------------------------------------------------------------------
const ROTULOS = {
  manilio: 'Manílio',
  sefer: 'Sefer Yetzirah',
  capitulo: 'cap.',
  verso: 'verso latino',
  letra: 'letra',
  mes: 'mês de',
  recensao: 'recensão',
};

// A classificação das partes. É leitura do app sobre as duas listas, e a nota
// que diz isso é NOTA_DA_CLASSIFICACAO.
const TIPOS = {
  superficie: 'superfície do tronco ou da cabeça',
  membro: 'braço ou perna',
  viscera: 'órgão de dentro',
};

const RELACOES = {
  concordam: 'as duas nomeiam a mesma parte',
  vizinhas: 'partes diferentes, mesma região do corpo',
  divergem: 'regiões diferentes do corpo',
};

// ---------------------------------------------------------------------------
// OS DOZE ÓRGÃOS DO SEFER YETZIRAH — as chaves são dados (motor), o nome é texto
// ---------------------------------------------------------------------------
// korkeban fica sem traduzir nos três packs, e a razão está em NOTA_KORKEBAN.
const ORGAOS = {
  peDireito: 'Pé direito',
  rimDireito: 'Rim direito',
  peEsquerdo: 'Pé esquerdo',
  maoDireita: 'Mão direita',
  rimEsquerdo: 'Rim esquerdo',
  maoEsquerda: 'Mão esquerda',
  vesicula: 'Vesícula',
  intestino: 'Intestino delgado',
  estomago: 'Estômago (kivah)',
  figado: 'Fígado',
  korkeban: 'Korkeban',
  baco: 'Baço',
};

// ---------------------------------------------------------------------------
// AS DOZE LINHAS — abertura de vida real, leitura com as duas colunas e a fonte
// ---------------------------------------------------------------------------
const SIGNOS = {
  aries: {
    nome: 'Áries',
    parte: 'Cabeça',
    abertura:
      'Você já ouviu mil vezes que Áries é a cabeça. É a primeira coisa que aparece quando alguém desenha aquele bonequinho com os doze signos espalhados pelo corpo.',
    leitura:
      'A lista latina de Manílio, no séc. I, abre o corpo pela cabeça, e é dela que vem a frase que todo mundo repete. A lista hebraica do Sefer Yetzirah, datada entre os séc. II e VI, abre pela outra ponta: em Áries ela põe o pé direito. ' +
      'Não é uma corrigindo a outra — nenhuma das duas conhece a outra. São dois textos distantes que repartiram o mesmo corpo por critérios diferentes, e este é o signo em que a distância entre eles é a maior possível: as duas extremidades.',
  },
  touro: {
    nome: 'Touro',
    parte: 'Pescoço',
    abertura:
      'Aquela tatuagem de touro logo abaixo da nuca. Quem escolheu o lugar estava seguindo, sem saber, uma lista de dois mil anos.',
    leitura:
      'Manílio dá a Touro o pescoço — no verso latino, o belíssimo pescoço. O Sefer Yetzirah dá o rim direito, pela letra Vav, no mês de Iyar. ' +
      'Um está por fora e no alto do tronco; o outro está por dentro e bem mais embaixo. Divergem, e é o segundo signo seguido em que divergem.',
  },
  gemeos: {
    nome: 'Gêmeos',
    parte: 'Braços, ligados aos ombros',
    abertura:
      'Tem gente que não consegue contar uma história com os braços parados. Você já sabe de quem eu estou falando, e provavelmente já imitou a pessoa pelas costas.',
    leitura:
      'Manílio dá a Gêmeos os braços ligados aos ombros. O Sefer Yetzirah dá o pé esquerdo, pela letra Zayin, no mês de Sivan. ' +
      'Divergem — mas repare numa coincidência de natureza que só acontece aqui: nas doze linhas, este é o único signo em que as duas fontes apontam um membro. Partes diferentes, mesma categoria de parte.',
  },
  cancer: {
    nome: 'Câncer',
    parte: 'Peito',
    abertura:
      'A pessoa que te puxa para o abraço e te aperta contra o peito antes de você conseguir dizer oi. Toda família tem uma.',
    leitura:
      'Manílio situa o peito sob Câncer. O Sefer Yetzirah dá a mão direita, pela letra Chet, no mês de Tamuz. ' +
      'Divergem — e esta é uma das duas linhas em que a versão popular também discorda de Manílio, o que faz três mapas diferentes disputando o mesmo signo.',
  },
  leao: {
    nome: 'Leão',
    parte: 'Flancos e omoplatas',
    abertura:
      'Aquele amigo que entra em qualquer lugar com o ombro para trás, ocupando espaço antes mesmo de falar.',
    leitura:
      'Manílio dá a Leão os flancos e as omoplatas — não o coração, que é o que se repete por aí. O Sefer Yetzirah dá o rim esquerdo, pela letra Tet, no mês de Av. ' +
      'E este é um dos dois únicos casos em que as duas listas chegam perto uma da outra: o rim fica no flanco. Perto não é igual, e o app não transforma isso em acordo.',
  },
  virgem: {
    nome: 'Virgem',
    parte: 'Baixo-ventre',
    abertura:
      'Cinto afrouxado no fim do almoço de domingo. Todo mundo conhece a manobra discreta por baixo da toalha da mesa.',
    leitura:
      'Manílio dá a Virgem o baixo-ventre. O Sefer Yetzirah dá a mão esquerda, pela letra Yod, no mês de Elul. ' +
      'Divergem, e de um jeito que mostra o feitio de cada lista: onde a latina está no tronco, a hebraica está no membro.',
  },
  libra: {
    nome: 'Libra',
    parte: 'Nádegas e ancas',
    abertura:
      'Oito horas por dia na mesma cadeira de escritório, e o assunto do grupo do trabalho é sempre a cadeira.',
    leitura:
      'Manílio dá a Libra as nádegas — "Libra regit clunes", no verso latino. Os rins, que o mercado repete há décadas, não estão aí: na lista PLANETÁRIA de Ptolomeu (Tetrabiblos III.xvii, séc. II) eles são de Marte. ' +
      'O Sefer Yetzirah dá a vesícula, pela letra Lamed, no mês de Tishrei. Duas listas antigas, e nenhuma das duas diz o que o mercado diz.',
  },
  escorpiao: {
    nome: 'Escorpião',
    parte: 'Virilha',
    abertura:
      'Escorpião e sexo viraram a mesma piada há décadas. Nesta linha, e só nesta, a piada tem lastro de texto antigo.',
    leitura:
      'Manílio escreve sem rodeio: "et Scorpios inguine gaudet" — o Escorpião se alegra com a virilha. O Sefer Yetzirah dá o intestino delgado, pela letra Nun, no mês de Cheshvan. ' +
      'É o segundo dos dois casos em que as duas listas ficam na mesma região do corpo: virilha e intestino delgado dividem o baixo-ventre. Vizinhas, não iguais.',
  },
  sagitario: {
    nome: 'Sagitário',
    parte: 'Coxas',
    abertura:
      'Calça jeans que aperta na coxa e sobra na cintura. Metade da fila do provador está discutindo exatamente isso agora.',
    leitura:
      'Manílio dá ao Centauro as coxas. O Sefer Yetzirah dá o estômago — kivah, no hebraico —, pela letra Samekh, no mês de Kislev. ' +
      'Divergem: uma lista está na perna, a outra está no meio do tronco e por dentro.',
  },
  capricornio: {
    nome: 'Capricórnio',
    parte: 'Os dois joelhos',
    abertura:
      'Ajoelhar atrás do sofá para achar a tomada, e levantar apoiando a mão no braço da poltrona.',
    leitura:
      'Manílio dá a Capricórnio os dois joelhos, e o verso latino diz que o signo impera sobre ambos. O Sefer Yetzirah dá o fígado, pela letra Ayin, no mês de Tevet. ' +
      'Divergem, e é mais um par em que a lista latina está do lado de fora e a hebraica do lado de dentro.',
  },
  aquario: {
    nome: 'Aquário',
    parte: 'Pernas, da coxa para baixo',
    abertura:
      'A perna que balança embaixo da mesa a reunião inteira, e a pessoa do lado sem coragem de comentar.',
    leitura:
      'Manílio dá a Aquário as pernas, da coxa para baixo. O Sefer Yetzirah dá o korkeban, pela letra Tzadi, no mês de Shevat — e essa é a palavra que as traduções não resolvem. ' +
      'O app deixa o termo transliterado do hebraico em vez de escolher um órgão só para fechar a linha.',
  },
  peixes: {
    nome: 'Peixes',
    parte: 'Pés',
    abertura:
      'Tirar o sapato depois de um dia inteiro em pé. É a primeira coisa que se faz ao entrar em casa, antes até de largar a bolsa.',
    leitura:
      'Manílio fecha a lista onde o corpo acaba: no verso latino, os Peixes reclamam para si o direito sobre os pés. O Sefer Yetzirah dá o baço, pela letra Qof, no mês de Adar. ' +
      'A lista latina termina no pé; a hebraica tinha COMEÇADO no pé, lá em Áries, e termina numa víscera. As duas percorrem caminhos que não se cruzam em nenhum ponto.',
  },
};

// ---------------------------------------------------------------------------
// A CAMADA POPULAR — as duas entradas em que a versão de boca em boca discorda
// do próprio Manílio (lateLayer, em lib/zodiacBody.js)
// ---------------------------------------------------------------------------
const CAMADA_TARDIA = {
  cancer:
    '"Câncer é o estômago" é dedução posterior, não o que Manílio escreveu. O verso latino põe o PEITO sob Câncer. O estômago aparece na lista PLANETÁRIA de Ptolomeu (Tetrabiblos III.xvii, séc. II), atribuído à Lua — e é de lá que a associação escorregou para o signo.',
  leao:
    '"Leão é o coração" é dedução posterior, não o que Manílio escreveu. O verso latino dá a Leão os FLANCOS e as OMOPLATAS. O coração aparece na lista PLANETÁRIA de Ptolomeu (Tetrabiblos III.xvii, séc. II), atribuído ao Sol — e é de lá que a associação escorregou para o signo.',
};

// ---------------------------------------------------------------------------
// BLOCO 1 — A CHAMADA. Vida real, sem nome próprio, sem século, sem termo
// técnico. É a primeira coisa que a tela mostra.
// ---------------------------------------------------------------------------
const CHAMADA =
  'Alguém já te disse, com muita segurança, qual parte do corpo "é" do seu signo. ' +
  'O que essa pessoa não sabia é que existem duas listas antigas dessas, escritas longe uma da outra — e elas não batem em uma linha sequer.';

// ---------------------------------------------------------------------------
// BLOCO 2 — A EXPLICAÇÃO. Abre concreto; a fonte só entra no terceiro parágrafo.
// ---------------------------------------------------------------------------
const EXPLICACAO =
  'Sempre aparece alguém no churrasco jurando que leonino é o coração e que libriano é o rim, com a convicção de quem viu aquilo escrito em algum lugar. ' +
  'E viu mesmo: está escrito em todo canto. A pergunta que ninguém faz é quem escreveu primeiro.' +
  '\n\n' +
  'Foram dois. Não um: dois — e é aí que a história fica boa. Uma das listas é romana, em verso latino, e desce pelo corpo da cabeça aos pés seguindo a ordem do zodíaco. ' +
  'A outra é hebraica, saiu de uma conta sobre as letras do alfabeto, e quase não fala da superfície do corpo: fala do que está por dentro. ' +
  'Foram escritas em mundos diferentes e chegaram a mapas diferentes da mesma pessoa.' +
  '\n\n' +
  'A primeira é de Manílio, Astronomica II.453-465, séc. I — a atestação mais antiga da correspondência em texto contínuo conservado. ' +
  'E não é de Ptolomeu, o que vale insistir porque o erro é corrente: o Tetrabiblos pressupõe a correspondência e nunca enumera os doze signos; o que ele enumera é a lista dos planetas. ' +
  'A segunda é o Sefer Yetzirah, cap. 5, datado entre os séc. II e VI, que reparte as 22 letras hebraicas em 3 mães, 7 duplas e 12 simples, e amarra cada uma das 12 simples a um signo, a um mês e a um órgão.' +
  '\n\n' +
  'Postas lado a lado, as doze linhas não coincidem em nenhuma. Nenhuma mesmo — e o desencontro tem forma: onde Manílio está na superfície e nos membros, o Sefer Yetzirah está nas vísceras. ' +
  'Em dois signos as duas chegam à mesma região do corpo sem nomear a mesma parte, e é o mais perto que elas ficam em dois mil anos.' +
  '\n\n' +
  'Por isso as duas aparecem aqui em colunas separadas e rotuladas, nunca somadas. ' +
  'Somar produziria uma terceira lista, que nunca existiu e não tem autor nem século — que é exatamente o que se encontra hoje na maioria dos sites que repetem o assunto.';

// A conta, escrita. Recebe o objeto de contagem() e não repete nenhum número à
// mão: se a classificação de uma linha mudar no motor, este texto muda junto.
const ESTRUTURA = (c) =>
  `São ${c.total} linhas. Em ${c.concordam} delas as duas fontes nomeiam a mesma parte do corpo — zero, e esse zero é o dado principal desta tela. ` +
  `Em ${c.vizinhas} as duas ficam na mesma região sem nomear a mesma parte; nas outras ${c.divergem}, nem isso.` +
  `\n\n` +
  `E a forma do desencontro cabe em dois números. Na lista de Manílio: ${c.manilioSuperficie} entradas de superfície do tronco ou da cabeça, ${c.manilioMembro} de braço ou perna, ${c.manilioViscera} de órgão de dentro. ` +
  `No Sefer Yetzirah: ${c.seferSuperficie} de superfície, ${c.seferMembro} de membro, ${c.seferViscera} de órgão de dentro. ` +
  `Um mapa foi feito de fora; o outro, de dentro. Não é que discordem sobre onde fica cada coisa — é que estão olhando para coisas diferentes.`;

// ---------------------------------------------------------------------------
// AS RESSALVAS QUE ANDAM JUNTO COM TODA LEITURA
// ---------------------------------------------------------------------------
const NOTA_DA_CLASSIFICACAO =
  'Quem chamou dois pares de "vizinhos" foi o app, não as fontes. Nenhuma das duas listas comenta a outra: Manílio escreve no séc. I e não poderia conhecer um texto datado entre os séc. II e VI. ' +
  '"Vizinhas" aqui quer dizer uma coisa só — as duas partes ficam na mesma região do corpo. É leitura do app sobre as duas listas, e está rotulada como leitura do app.';

const NOTA_NAO_FUNDIR =
  'As duas colunas nunca viram uma só. Misturá-las produziria uma terceira lista, sem autor e sem século, que nenhum dos dois textos sustenta — e é esse o erro mais comum do assunto. ' +
  'Aqui cada atribuição anda com o nome da obra colado, e a tela não tem nenhuma linha que diga "a parte do corpo deste signo é X".';

const NOTA_LEITURA_DO_APP =
  'O que é fonte e o que é app. Fonte: os doze versos latinos de Manílio (Astronomica II.453-465, séc. I) e as doze letras simples do Sefer Yetzirah (cap. 5, séc. II–VI). ' +
  'App: a comparação linha a linha, a contagem, e as etiquetas "concordam", "vizinhas" e "divergem". O jeito de contar isso em português de hoje também é do app, e só isso.';

const NOTA_KORKEBAN =
  'korkeban (קורקבן) fica sem traduzir de propósito. As versões correntes oscilam entre moela, papo e esôfago, e nenhuma delas virou consenso. ' +
  'Escolher uma para deixar a lista redonda seria fixar o que a fonte não fixa.';

// O bloqueio de publicação de docs/tradicao/16 §13, dito ao usuário em vez de
// escondido no código. Enquanto BLOQUEIO.resolvido for false, isto vai em toda
// leitura.
const BLOQUEIO =
  'Uma ressalva que o app faz sobre si mesmo. A coluna hebraica desta tela veio da recensão Gra/Ari, por relato de fonte secundária — não da edição crítica que compara os manuscritos (A. Peter Hayman, Mohr Siebeck, 2004). ' +
  'A ordem dos órgãos varia entre as recensões do Sefer Yetzirah, então esta é uma versão entre várias, e não a palavra final. ' +
  'A coluna latina não tem essa ressalva: o texto de Manílio é conservado e o verso foi conferido na numeração impressa da própria página.';

// ---------------------------------------------------------------------------
// PRECISÃO DO SIGNO SOLAR — quando falta hora ou cidade
// ---------------------------------------------------------------------------
const PRECISAO = {
  meiaDia:
    'Sem a hora de nascimento, o signo solar aqui foi lido ao meio-dia do dia informado — o instante que menos erra dentro do dia. Quem nasceu na virada de um signo pode receber o vizinho por causa disso, e é justamente quem mais repara. A hora da certidão resolve.',
  semCidade:
    'A hora veio, mas sem a cidade não há fuso a aplicar: ela foi lida como hora de Greenwich. Para quem nasceu perto da virada de um signo, isso pode trocar a linha inteira. Escolher a cidade de nascimento resolve.',
};

// ---------------------------------------------------------------------------
// A BIBLIOGRAFIA — a prosa de cada obra. A datação e o autor são montados pelo
// motor, para passarem por lib/traducoes/datacao.js.
// ---------------------------------------------------------------------------
const NOTAS_DE_FONTE = {
  manilio:
    'A lista latina desta tela, verso a verso. É a atestação canônica mais antiga da correspondência signo↔parte do corpo em texto contínuo conservado.',
  sefer:
    'A lista hebraica desta tela. O capítulo reparte as 12 letras simples entre os 12 signos, os 12 meses e os 12 órgãos, sempre na mesma tríade: no universo, no ano, no corpo.',
  hayman:
    'A edição crítica que coteja mais de 19 manuscritos e decide entre as recensões. Esta base NÃO a consultou — é o bloqueio declarado desta tela, e está escrito na tela, não só aqui.',
  kaplan:
    'A tradução por onde a recensão Gra/Ari chegou até esta base. É uma entre várias, e é por isso que a coluna hebraica anda com confiança média em vez de alta.',
  westcott:
    'A tradução vitoriana que circula de graça pela internet e que a bibliografia manda evitar. Fica citada aqui para dizer que NÃO é a base desta tela.',
  ptolomeu:
    'A lista PLANETÁRIA — a que Ptolomeu de fato enumera. É dela, e não do signo de Leão, que sai o coração (do Sol); é dela, e não de Libra, que saem os rins (de Marte). Está aqui para desfazer as duas confusões mais repetidas do assunto.',
};

// ---------------------------------------------------------------------------
// O QUE FALTA, E ONDE RESOLVER — só o par do signo de quem lê depende de dado
// ---------------------------------------------------------------------------
const FALTA = {
  data: {
    texto:
      'Sem a data de nascimento não há signo solar a calcular. E o app não pergunta o signo direto: perguntar o signo é pedir para a pessoa errar justamente quando ela nasceu na virada, que é quando isso mais importa.',
    comoResolver: 'Informe sua data de nascimento no Mapa Astral.',
  },
  efemeride: {
    texto:
      'As posições do céu não puderam ser calculadas agora. O app prefere não mostrar nada a mostrar um céu inventado — a comparação das duas listas continua aberta logo acima, ela não depende de efeméride.',
    comoResolver: 'Tente de novo em instantes, no Mapa Astral.',
  },
};

// ---------------------------------------------------------------------------
// O CHROME DA TELA — só rótulo, e nada além de rótulo
// ---------------------------------------------------------------------------
// A vitrine (o bloco das duas listas dentro de screens/ZodiacBodyScreen.js) não
// redige uma linha: ela repassa o `lang` e imprime o que está aqui. Nenhuma
// string deste bloco faz afirmação histórica nova — toda afirmação continua
// saindo do motor com obra, autor e século colados. Aqui só entram nomes de
// seção, rótulo de botão e o recado de quando falta dado.
//
// Os três packs têm este bloco com as MESMAS chaves. Se uma chave nascer aqui,
// nasce nos outros dois no mesmo commit.
const CHROME = {
  selo: 'Duas listas, não uma',
  secao: 'As duas listas do corpo, lado a lado',
  abrir: 'abrir',
  fechar: 'fechar',
  etiquetaApp:
    'A comparação abaixo é leitura do app sobre as duas listas — nenhuma das duas fontes fala da outra.',
  rotuloSeuSigno: 'A linha do seu signo solar',
  rotuloTabela: 'As doze linhas, lado a lado',
  ajudaTabela: 'Toque num signo para ver as duas colunas inteiras e o recibo de cada uma.',
  rotuloConta: 'A conta, linha a linha',
  rotuloComoSurgiram: 'De onde saíram as duas listas',
  rotuloNatureza: 'Natureza da parte',
  rotuloRecibo: 'Recibo',
  rotuloRessalvas: 'As ressalvas desta tela',
  rotuloBloqueio: 'O que esta tela ainda não conferiu',
  rotuloFontes: 'De onde veio cada linha',
  confianca: { alta: 'confiança alta', media: 'confiança média' },
  signoDeclarado:
    'Esta linha veio do signo que está no seu perfil. Com a data de nascimento, o app lê o signo pela posição real do Sol em vez de aceitar o que foi declarado.',
  irParaMapa: 'Abrir o Mapa Astral',
  compartilhar: 'Compartilhar',
  copiado: 'Texto copiado. É só colar onde quiser.',
  naoCopiou: 'Não deu para copiar aqui. Selecione o texto e copie à mão.',
  marca: 'Cosmic Guide',
  indisponivel:
    'A comparação das duas listas não pôde ser montada agora. O app prefere não mostrar nada a mostrar meia linha.',
};

export const PACK = {
  idioma: 'pt',
  tela: 'Homem Zodiacal',
  telaDoNascimento: 'Mapa Astral',
  chrome: CHROME,
  rotulos: ROTULOS,
  tipos: TIPOS,
  relacoes: RELACOES,
  orgaos: ORGAOS,
  signos: SIGNOS,
  camadaTardia: CAMADA_TARDIA,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  estrutura: ESTRUTURA,
  notaDaClassificacao: NOTA_DA_CLASSIFICACAO,
  notaNaoFundir: NOTA_NAO_FUNDIR,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaKorkeban: NOTA_KORKEBAN,
  bloqueio: BLOQUEIO,
  precisao: PRECISAO,
  notasDeFonte: NOTAS_DE_FONTE,
  falta: FALTA,
};

export default PACK;
