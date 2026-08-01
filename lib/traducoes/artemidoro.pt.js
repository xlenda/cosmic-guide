// lib/traducoes/artemidoro.pt.js
// O PACK PORTUGUÊS das cinco espécies de sonho — TODA prosa que o usuário lê
// mora aqui. O motor (a rota das perguntas, a tabela de 1.2.45–55, a montagem)
// fica em lib/artemidoro.js. Os packs irmãos (artemidoro.es.js,
// artemidoro.en.js) repetem exatamente esta FORMA: mesmas chaves, mesmos
// campos, funções com a mesma assinatura.
//
// TODAS as regras do cabeçalho de lib/artemidoro.js valem para cada string
// daqui: prende primeiro e fonte depois, locus em toda afirmação histórica,
// nenhuma alegação de saúde, nada de veredito nem de promessa, e — a que mais
// importa nesta feature — CLASSIFICAR NÃO É INTERPRETAR. Em lugar nenhum sai
// "seu sonho significa que…".
//
// A elisão do sexto item de 1.9 (o estado do corpo de quem sonha) está
// declarada em verbatim.checklist19.elisao e repetida em checklist.corpo. Não
// é para ser silenciosa: a regra do app é não falar do corpo de ninguém, e
// dizer que existe um item que ele não usa é mais honesto do que entregar uma
// lista de cinco fingindo que a fonte tinha cinco.

// ---------------------------------------------------------------------------
// O RECIBO — a linha miúda que fecha cada peça de conteúdo
// ---------------------------------------------------------------------------
// A datação chega pronta do motor (que a passa por traduzirQuando); aqui só se
// decide a ORDEM e a pontuação. Nome de obra nunca traduz.
function recibo({ autor, obra, locus, quando }) {
  return `${autor}, ${obra} ${locus}, ${quando}`;
}

// Forma consagrada do nome de cada autor em português. Só entram os que
// lib/traducoes/datacao.js ainda não conhece — quando ele aprender, ele manda.
const AUTORES = {
  oneirocritica: 'Artemidoro de Daldis',
  macrobio: 'Macróbio',
  edicaoPack: 'Roger A. Pack',
  harrisMcCoy: 'Daniel E. Harris-McCoy',
  hammondThonemann: 'Martin Hammond e Peter Thonemann',
};

// ---------------------------------------------------------------------------
// AS CITAÇÕES — verbatim, sem tradução
// ---------------------------------------------------------------------------
// O campo `texto` é a tradução inglesa de attalus.org e é IDÊNTICO nos três
// packs. O que muda por idioma é a `parafrase` — assinada pelo app, nunca
// entre aspas — e a língua do `locus`.
const VERBATIM = {
  definicao11: {
    texto: 'A dream differs from a vision in that the one is indicative of what is to come, the other of what is.',
    parafrase:
      'Um dos dois aponta para o que vem; o outro, para o que já é. É a linha que separa o enhypnion do oneiros — e as traduções inglesas discordam sobre qual palavra inglesa usar para cada termo grego, motivo pelo qual este app fica com o grego.',
    locus: 'Artemidoro de Daldis, Oneirocritica 1.1, trad. inglesa de attalus.org',
    elisao: null,
  },
  checklist19: {
    texto:
      "[the interpreter must know] the dreamer's identity, occupation, birth, financial status, … and age. Also, the nature of the dream itself must be examined accurately.",
    parafrase:
      'Antes de interpretar, é preciso saber quem a pessoa é, o que ela faz da vida, de onde vem, quanto tem e que idade tem — e examinar o próprio sonho com cuidado.',
    locus: 'Artemidoro de Daldis, Oneirocritica 1.9, trad. inglesa de attalus.org',
    elisao:
      'A elisão nas reticências é nossa, e fica dita: ali a lista original traz um sexto item, o estado do corpo de quem sonha. Ele existe, está na Oneirocritica 1.9 para quem quiser conferir, e o app não o usa — porque não fala do corpo de ninguém.',
  },
  prefacio: {
    texto:
      'I did not rely upon any simple theory of probabilities but rather on experience and the testimony of actual dream-fulfillments.',
    parafrase:
      'Ele se apresenta como quem juntou desfechos verificados, não como quem recebeu revelação — e é isso que justifica o Livro V, com os 95 casos.',
    locus: 'Artemidoro de Daldis, Oneirocritica, prefácio, trad. inglesa de attalus.org',
    elisao: null,
  },
};

// ---------------------------------------------------------------------------
// A CHAMADA — vida real, sem nome próprio, sem parágrafo, sem grego. É a
// primeira coisa que a tela mostra.
// ---------------------------------------------------------------------------
const CHAMADA = {
  neutra:
    'Você discutiu com alguém às sete da noite e sonhou com a mesma discussão à meia-noite. Isso é recado, ou é o dia voltando? ' +
    'Antes de perguntar o que um sonho quer dizer, vem uma pergunta que quase nenhum app faz — e é ela que decide se há alguma coisa a dizer.',
  enhypnion:
    'Pelo que você respondeu, o sonho devolveu o dia que você teve. Quem vai dormir com fome sonha que come; quem vai dormir com raiva do chefe sonha com o chefe. ' +
    'Isso tem nome, tem dono e tem quase dois mil anos — e a primeira coisa que o nome faz é tirar o peso de cima do seu sonho.',
  oneiros:
    'Pelo que você respondeu, não foi o seu dia voltando: entrou no sonho gente, lugar ou cena que você não viveu naquele dia. ' +
    'É a partir daqui que vem a segunda pergunta, a que quase ninguém faz — de quem é este sonho?',
};

// ---------------------------------------------------------------------------
// A EXPLICAÇÃO — abre concreto, fecha com o recibo. Sempre nesta ordem.
// ---------------------------------------------------------------------------
const EXPLICACAO = {
  neutra:
    'Dia infernal no trabalho, o chefe em cima o tempo todo, e à noite lá está ele no sonho. De manhã a pessoa digita "sonhar com chefe" no Google e o primeiro site responde que é medo de autoridade. ' +
    'Só que o que aconteceu às cinco da tarde explica melhor.' +
    '\n\n' +
    'Quem separou essas duas coisas por escrito — o sonho que devolve o dia e o sonho que traz outra coisa — foi Artemidoro de Daldis, na Oneirocritica, séc. II d.C. ' +
    'São cinco livros: o quarto é sobre método e o quinto é uma coleção de 95 sonhos com o desfecho registrado. Não é um dicionário de símbolos; é um manual de como perguntar.' +
    '\n\n' +
    'Ele tem uma palavra para cada tipo. Enhypnion (no grego — o sonho que espelha o que a pessoa está vivendo) é o do faminto que sonha que come, o do sedento que sonha que bebe, o do medroso que vê o que teme, o de quem ama e sonha que está com quem ama: os exemplos são dele, em 1.2. ' +
    'Oneiros é o outro, o sonho significativo do que virá (1.1).' +
    '\n\n' +
    'Só depois disso vêm as cinco espécies, e elas respondem outra pergunta: de quem é o sonho — só seu, de outra pessoa que você conhece, de vocês dois, da sua cidade ou do mundo (1.2.45–55). ' +
    'Responda e o app diz em que gaveta o seu relato cai, com o parágrafo do lado. Ele não diz o que o sonho quer dizer: na conta de Artemidoro isso depende de quem é você, e ele lista em 1.9 o que precisaria saber antes.',
  enhypnion:
    'Dia infernal no trabalho, o chefe em cima o tempo todo, e à noite lá está ele no sonho. De manhã vem a busca no Google, e o primeiro site responde que chefe em sonho é medo de autoridade. ' +
    'Só que o que aconteceu às cinco da tarde explica melhor: o sonho devolveu o dia.' +
    '\n\n' +
    'Isso tem nome desde o séc. II d.C. Artemidoro de Daldis, na Oneirocritica, chama de enhypnion (no grego — o sonho que espelha o que a pessoa está vivendo) o sonho feito do agora. ' +
    'Os exemplos são dele, em 1.2: o faminto sonha que come, o sedento que bebe, o medroso vê o que teme, quem ama sonha que está com quem ama. Na conta dele, esse tipo não anuncia nada — é espelho do que já é, não aviso do que vem.' +
    '\n\n' +
    'A frase que separa os dois tipos está em 1.1 e é curta: "A dream differs from a vision in that the one is indicative of what is to come, the other of what is." ' +
    'As traduções inglesas discordam sobre qual palavra usar para cada termo grego, e é por isso que este app fica com o grego: enhypnion para o sonho do que é, oneiros para o do que virá.' +
    '\n\n' +
    'Nada disso é veredito sobre a sua noite. É a gaveta em que a fonte põe o relato que você deu, com o parágrafo do lado. ' +
    'Se amanhã você reparar melhor e responder diferente, a gaveta muda — e era assim que ele trabalhava mesmo: pelo relato inteiro e por quem relatou (1.9).',
  oneiros:
    'Tem sonho que o dia não explica. Você não pensou naquela pessoa, não passou perto daquele lugar, não estava com raiva nem com medo de nada — e mesmo assim a cena veio inteira, com gente, endereço e hora.' +
    '\n\n' +
    'Para esse, Artemidoro de Daldis usa outra palavra: oneiros (no grego — o sonho significativo do que virá), e ele a separa do enhypnion, que é o sonho feito do que a pessoa já estava vivendo. ' +
    'A distinção está na Oneirocritica 1.1–1.2, séc. II d.C., e a frase é esta: "A dream differs from a vision in that the one is indicative of what is to come, the other of what is."' +
    '\n\n' +
    'Cair desse lado não quer dizer que o sonho anuncie o que você espera, nem coisa boa nem coisa ruim. Quer dizer só isto, e só pelo seu relato: ele não é o seu dia voltando.' +
    '\n\n' +
    'É aqui que entram as cinco espécies. Antes de qualquer símbolo, ele pergunta de quem é o sonho: só seu, de outra pessoa que você conhece, de vocês dois, da sua cidade ou do mundo (1.2.45–55). ' +
    'É pergunta estrutural, tirada do texto, e é a que o app faz a seguir — em vez de abrir um dicionário de imagens.',
};

// ---------------------------------------------------------------------------
// AS CINCO ESPÉCIES — Oneirocritica 1.2.45–55
// ---------------------------------------------------------------------------
const ESPECIES = {
  idioi: {
    nome: 'só seu',
    oQueE: 'O sonho é seu do começo ao fim: você é quem faz e quem passa por tudo, e ninguém mais entra na cena com papel.',
    exemplo: 'Você está atrasado, corre, perde o ônibus e perde a entrevista — e não tem mais ninguém ali.',
  },
  allotrioi: {
    nome: 'de outra pessoa',
    oQueE: 'O sonho é sobre outra pessoa, e é gente que você conhece: sua mãe, seu chefe, seu ex. Você está lá como quem assiste.',
    exemplo: 'Sua mãe entra numa casa que você nunca viu, e você fica parado na porta, olhando.',
  },
  koina: {
    nome: 'de vocês dois',
    oQueE: 'Você e mais alguém, juntos na mesma cena, os dois com papel no que acontece.',
    exemplo: 'Você e a pessoa com quem você dorme discutem dentro de um carro parado, e os dois falam.',
  },
  demosia: {
    nome: 'da sua cidade',
    oQueE: 'O sonho não é de ninguém em particular: é do lugar que é de todo mundo — a praça, a rua, o porto, o templo.',
    exemplo: 'A praça do centro cheia de gente que você não conhece, e alguma coisa acontecendo ali no meio.',
  },
  kosmika: {
    nome: 'do mundo',
    oQueE: 'O céu e o tempo: o que aparece lá em cima e pega todo mundo junto.',
    exemplo: 'O céu fica vermelho no meio da tarde e a rua inteira para para olhar.',
  },
};

const ESPECIE_TEXTO = (e) =>
  `Pelo que você respondeu, o sonho é ${e.nome} — ${e.transliteracao} (${e.grego}), na lista das cinco. ${e.oQueE}`;

const SEM_ESPECIE = {
  faltaResposta:
    'Ainda falta uma resposta para dizer de quem é o sonho — e o app prefere dizer que falta a escolher uma das cinco no chute.',
  pessoaDesconhecida:
    'Você disse que não conhece a pessoa que apareceu, e aqui o app para. A segunda das cinco espécies é definida com todas as letras como outra pessoa CONHECIDA de quem sonhou (1.2.45). ' +
    'O que Artemidoro faz com o desconhecido esta pesquisa não leu — e empurrar o seu relato para a gaveta mais parecida seria inventar método em nome dele.',
  foraDaLista:
    'As cinco espécies dizem de QUEM o sonho é: você, outra pessoa que você conhece, vocês dois, a cidade, o mundo (1.2.45–55). ' +
    'Você respondeu que não é nada disso, e a lista acaba aí — não existe uma sexta gaveta na fonte, e o app não abre uma. Fica sem espécie, e fica dito.',
};

// ---------------------------------------------------------------------------
// O VOCABULÁRIO DE 1.1–1.2
// ---------------------------------------------------------------------------
const VOCABULARIO = {
  enhypnion: {
    nome: 'o sonho que devolve o dia',
    oQueE:
      'Espelha o que a pessoa está vivendo enquanto dorme: a fome, o medo, a saudade, a briga que não saiu da cabeça. Na conta de Artemidoro, esse tipo não anuncia nada — e os exemplos são dele.',
  },
  oneiros: {
    nome: 'o sonho que traz outra coisa',
    oQueE: 'O sonho significativo do que virá. É o que sobra quando o dia não explica a cena.',
  },
  theorematikoi: {
    nome: 'o sonho direto',
    oQueE:
      'Acontece exatamente como foi visto. O exemplo é dele: um homem sonhou com um naufrágio, e o naufrágio veio como no sonho. Só dá para saber depois, o que é justamente o problema.',
  },
  allegorikoi: {
    nome: 'o sonho alegórico',
    oQueE: 'Diz uma coisa por meio de outra. As cinco espécies são subdivisões deste — não do sonho em geral.',
  },
  horama: {
    nome: 'a visão',
    oQueE:
      'Uma visão ligada aos sonhos significativos. A definição exata não chegou clara até nós, e o app diz isso em vez de completar o que falta.',
  },
  chrematismos: {
    nome: 'o sonho em que alguém fala',
    oQueE:
      'Uma pessoa ou uma divindade fala e instrui quem dorme. Esta pesquisa leu a entrada em resumo, não a passagem inteira — e por isso a descrição para aqui.',
  },
  phantasma: {
    nome: 'a imagem do limiar',
    oQueE:
      'A imagem estranha que aparece na beira do sono, sem conteúdo de futuro. Esta pesquisa leu a entrada em resumo, não a passagem inteira — e por isso a descrição para aqui.',
  },
};

// ---------------------------------------------------------------------------
// AS PERGUNTAS
// ---------------------------------------------------------------------------
const PERGUNTAS = {
  diaAnterior: {
    pergunta:
      'O que apareceu no sonho é o que você viveu naquele dia? Fome, medo, saudade, a briga das sete, o assunto que não saiu da sua cabeça.',
    opcoes: {
      sim: 'Sim — o meu dia está ali dentro',
      nao: 'Não — veio coisa que eu não vivi',
    },
  },
  quemApareceu: {
    pergunta: 'De quem é o sonho? Pense em quem tem papel na cena, não em quem passa no fundo.',
    opcoes: {
      'so-voce': 'Só eu',
      'outra-pessoa': 'Outra pessoa, e eu olhando',
      'voce-e-outra': 'Eu e mais alguém, os dois na cena',
      'a-cidade': 'A cidade: rua, praça, um lugar que é de todo mundo',
      'o-mundo': 'O céu, o tempo, alguma coisa que pega todo mundo junto',
      'nada-disso': 'Nada disso',
    },
  },
  conheceQuemApareceu: {
    pergunta: 'Você conhece essa pessoa na vida real?',
    opcoes: { sim: 'Conheço', nao: 'Não conheço' },
  },
  aindaComVoce: {
    pergunta: 'O sonho continuou com você depois de acordar?',
    opcoes: {
      sim: 'Continuou — passei o dia com aquilo',
      nao: 'Passou assim que eu levantei',
    },
  },
};

const PERGUNTA_DO_APP =
  'Esta pergunta é do app, não da fonte: nenhum texto antigo desta pesquisa a usa como critério. Ela serve para você reparar melhor — e não muda a classificação.';

// ---------------------------------------------------------------------------
// O CHECKLIST DE 1.9
// ---------------------------------------------------------------------------
const CHECKLIST_INTRO =
  'Antes de dizer o que qualquer imagem quer dizer, Artemidoro exige saber quem sonhou. A lista é dele, tem seis itens, e é o que separa o método dele de um dicionário:';

const CHECKLIST = {
  identidade: 'quem a pessoa é',
  oficio: 'o que ela faz da vida',
  nascimento: 'de onde ela vem',
  dinheiro: 'quanto ela tem',
  corpo:
    'como está o corpo dela — este item está na lista dele e o app não usa: aqui não se fala do corpo de ninguém. Fica citado para você poder conferir a lista inteira na fonte.',
  idade: 'que idade ela tem',
};

// ---------------------------------------------------------------------------
// O PORQUÊ — a frase que liga a resposta dada à gaveta escolhida
// ---------------------------------------------------------------------------
const PORQUE_CAMADA = {
  enhypnion:
    'Você respondeu que o seu dia está ali dentro, e é essa resposta que decide: pela pergunta de Artemidoro (1.2), o sonho que espelha o que a pessoa está vivendo é o enhypnion.',
  oneiros:
    'Você respondeu que veio coisa que não viveu naquele dia, e é essa resposta que decide: o sonho que não espelha o agora é o que ele chama de oneiros (1.1).',
};

const PORQUE_ESPECIE = {
  'so-voce': 'E você disse que só você aparece na cena — é o que põe o relato na primeira das cinco espécies.',
  'outra-pessoa-conhecida':
    'E você disse que quem aparece é outra pessoa, que você conhece — é exatamente a definição da segunda espécie.',
  'outra-pessoa-desconhecida':
    'Sobre a espécie, o app parou: você disse que não conhece a pessoa que apareceu, e a definição da fonte pede que ela seja conhecida.',
  'voce-e-outra': 'E você disse que estão os dois na cena, cada um com papel — é o que a terceira espécie abrange.',
  'a-cidade': 'E você disse que o sonho é do lugar que é de todo mundo — rua, praça, porto, templo. É a quarta espécie.',
  'o-mundo': 'E você disse que é o céu, o tempo, o que pega todo mundo junto — é a quinta.',
  'nada-disso': 'Sobre a espécie, não deu: as cinco dizem de quem o sonho é, e você respondeu que não é de nenhum deles.',
};

// ---------------------------------------------------------------------------
// AS RESSALVAS QUE ANDAM JUNTO COM TODA CLASSIFICAÇÃO
// ---------------------------------------------------------------------------
const NOTA_SUBESPECIE =
  'Um detalhe que muda o tamanho da afirmação. As cinco espécies são subdivisões do sonho alegórico — o que diz uma coisa por meio de outra (Oneirocritica 1.2.1). ' +
  'O outro tipo, o sonho direto, é o que acontece exatamente como foi visto: o exemplo do próprio Artemidoro é um homem que sonhou com um naufrágio, e o naufrágio veio como no sonho. ' +
  'Só o desfecho separa um do outro, e desfecho o app não tem. Por isso ele nomeia a espécie pela pessoa que apareceu e não decreta que o seu sonho é alegórico.';

const NOTA_NAO_E_DICIONARIO =
  'Por que aqui não tem dicionário de símbolos. "Água é emoção, cair é perder o controle, voar é liberdade" não está em Artemidoro nem em fonte antiga nenhuma desta pesquisa — é dicionário moderno, de revista. ' +
  'O método dele é o contrário: o mesmo sonho muda de leitura conforme quem sonhou. O caso que ele registra é o mais limpo que existe — um escravo sonhou que tinha três pênis; foi libertado e, na alforria, passou a ter três nomes, como todo cidadão romano (5.91). ' +
  'Num homem que já era livre, o mesmo sonho não diria nada disso. Em 1.79 é o dinheiro que muda tudo: a leitura depende do que o sonhador tem e do que a mãe dele tem. ' +
  'É por isso que este app classifica o relato e não vende significado de imagem.';

const NOTA_LEITURA_DO_APP =
  'O que é fonte e o que é app. A separação entre o sonho que devolve o dia e o sonho que traz outra coisa é de Artemidoro de Daldis, Oneirocritica 1.1–1.2, séc. II d.C.; as cinco espécies são de 1.2.45–55; a exigência de saber quem sonhou é de 1.9. ' +
  'O que é nosso: as perguntas em português de hoje, a ordem em que elas aparecem e uma delas inteira — a de o sonho ter continuado depois de acordar, que nenhum texto antigo desta pesquisa autoriza como critério e que, por isso, não decide nada.';

const NOTA_DISCORDANCIA = (c) =>
  c.camada === 'enhypnion'
    ? 'Suas duas respostas puxam para lados diferentes: você disse que o seu dia está ali dentro e, ao mesmo tempo, que o sonho continuou com você depois de acordar. ' +
      'O app não desempata sozinho e não esconde a discordância. Quem decide aqui é a pergunta de Artemidoro (1.2), porque a outra é nossa.'
    : 'Suas duas respostas puxam para lados diferentes: você disse que veio coisa que não viveu naquele dia e, ao mesmo tempo, que o sonho passou assim que você levantou. ' +
      'O app não desempata sozinho e não esconde a discordância. Quem decide aqui é a pergunta de Artemidoro (1.2), porque a outra é nossa.';

// ---------------------------------------------------------------------------
// O QUE FALTA, E ONDE RESPONDER — o app nunca deixa beco sem saída
// ---------------------------------------------------------------------------
const FALTA = {
  diaAnterior: {
    texto:
      'Falta a primeira pergunta, e é a que decide todo o resto: o que apareceu no sonho é o que você viveu naquele dia? ' +
      'Sem ela não dá para saber se o sonho devolveu o seu dia ou trouxe outra coisa, e essas duas gavetas não se parecem em nada. O app não escolhe uma no seu lugar.',
    comoResolver: 'Responda a primeira pergunta na tela de Sonhos.',
  },
  quemApareceu: {
    texto:
      'Falta dizer de quem é o sonho. As cinco espécies de Artemidoro separam o sonho que é só seu, o que é de outra pessoa, o de vocês dois, o da cidade e o do mundo — e a diferença entre elas é quem tem papel na cena. ' +
      'Sem essa resposta o app não tem como escolher, e não vai escolher por conta.',
    comoResolver: 'Responda de quem é o sonho, na tela de Sonhos.',
  },
  conheceQuemApareceu: {
    texto:
      'Falta uma resposta curta, e ela é decisiva: você conhece a pessoa que apareceu? A segunda espécie é definida como outra pessoa conhecida de quem sonhou (1.2.45), ' +
      'então conhecer ou não conhecer troca a gaveta — e, quando não conhece, esta pesquisa não sabe qual é a gaveta.',
    comoResolver: 'Responda se você conhece a pessoa, na tela de Sonhos.',
  },
};

// ---------------------------------------------------------------------------
// A BIBLIOGRAFIA
// ---------------------------------------------------------------------------
const FONTES = [
  'Artemidoro de Daldis, Oneirocritica (Ὀνειροκριτικά), séc. II d.C. — cinco livros, escritos por volta de 170–200 d.C.; o Livro IV é sobre método e o Livro V reúne 95 sonhos com o desfecho registrado',
  'Oneirocritica 1.1–1.2 — enhypnion e oneiros, a divisão entre sonho direto (theorematikoi) e alegórico (allegorikoi), e as cinco espécies do alegórico em 1.2.45–55',
  'Oneirocritica 1.9 — o que o intérprete precisa saber sobre quem sonhou antes de interpretar qualquer imagem',
  'Oneirocritica 5.91 e 1.79 — os dois casos em que o mesmo sonho muda de leitura conforme a situação de quem sonhou: o escravo que ganhou três nomes e o pobre de mãe rica',
  'Tradução inglesa parcial e gratuita em attalus.org/translate/artemidorus.html; edição grega de referência de Roger A. Pack (Teubner, 1963); tradução e comentário de Daniel E. Harris-McCoy (Oxford, 2012); tradução de Martin Hammond com introdução de Peter Thonemann (Oxford World\'s Classics, 2020)',
  'Papiro Chester Beatty III (Egito, c. 1220 a.C.) e a série Ziqīqu (tabuinhas de Assurbanípal, séc. VII a.C.) — os dicionários de equivalência fixa que vieram antes, e de que o método de Artemidoro é o contrário',
  'Macróbio, Commentarii in Somnium Scipionis, c. 430 d.C. — a SEGUNDA taxonomia de cinco espécies da Antiguidade tardia, de outro autor e outro século; esta pesquisa não conferiu os termos dele em edição, e por isso o app não os lista',
];

export const PACK = {
  idioma: 'pt',
  tela: 'Sonhos',
  autores: AUTORES,
  recibo,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  especies: ESPECIES,
  especieTexto: ESPECIE_TEXTO,
  semEspecie: SEM_ESPECIE,
  vocabulario: VOCABULARIO,
  perguntas: PERGUNTAS,
  perguntaDoApp: PERGUNTA_DO_APP,
  checklistIntro: CHECKLIST_INTRO,
  checklist: CHECKLIST,
  porqueCamada: PORQUE_CAMADA,
  porqueEspecie: PORQUE_ESPECIE,
  notaSubespecie: NOTA_SUBESPECIE,
  notaNaoEDicionario: NOTA_NAO_E_DICIONARIO,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaDiscordancia: NOTA_DISCORDANCIA,
  falta: FALTA,
  verbatim: VERBATIM,
  fontes: FONTES,
};

export default PACK;
