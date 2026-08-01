// lib/traducoes/decanatoPorque.pt.js
// O PACK PORTUGUÊS do "por que esta carta é este decanato" — TODA prosa que o
// usuário lê mora aqui. O motor (a reconstrução dos 36, a conferência contra o
// baralho, a montagem) fica em lib/decanatoPorque.js. Os packs irmãos
// (decanatoPorque.es.js, decanatoPorque.en.js) repetem exatamente esta FORMA:
// mesmas chaves, mesmos campos, funções com a mesma assinatura.
//
// TODAS as regras do cabeçalho de lib/decanatoPorque.js valem para cada string
// daqui: prende primeiro e fonte depois, locus em toda afirmação histórica,
// nenhuma alegação de saúde, nada de veredito nem de promessa, nenhum aviso
// defensivo — e a específica desta feature: NÃO LER A VIDA DE NINGUÉM. Esta
// tela explica um encaixe. No segundo em que um texto daqui começar a dizer o
// que a carta significa PARA A PESSOA, ele saiu do escopo e vira o conteúdo que
// todas as outras telas já entregam.
//
// O que NÃO está aqui, de propósito: os 36 títulos Golden Dawn ("Senhor do
// Domínio") e os 36 rótulos ("Marte em Áries"). Eles já existem em
// lib/tarotDeck.js e o motor lê de lá — duplicar seria criar 216 strings
// capazes de dessincronizar em silêncio.

// ---------------------------------------------------------------------------
// NOMES — as CHAVES são dados e continuam em PT nos três packs; só o valor muda
// ---------------------------------------------------------------------------
const PLANETAS = {
  'Saturno': 'Saturno',
  'Júpiter': 'Júpiter',
  'Marte': 'Marte',
  'Sol': 'Sol',
  'Vênus': 'Vênus',
  'Mercúrio': 'Mercúrio',
  'Lua': 'Lua',
};

const SIGNOS = {
  'Áries': 'Áries', 'Touro': 'Touro', 'Gêmeos': 'Gêmeos', 'Câncer': 'Câncer',
  'Leão': 'Leão', 'Virgem': 'Virgem', 'Libra': 'Libra', 'Escorpião': 'Escorpião',
  'Sagitário': 'Sagitário', 'Capricórnio': 'Capricórnio', 'Aquário': 'Aquário', 'Peixes': 'Peixes',
};

// A palavra que liga planeta e signo no rótulo publicado pelo baralho
// ("Marte em Áries"). O motor monta o rótulo com ela e compara com o baralho —
// se um dia divergir, o teste pega.
const CONECTOR = 'em';

const NAIPES = { paus: 'Paus', copas: 'Copas', espadas: 'Espadas', ouros: 'Ouros' };
const ELEMENTOS = { fogo: 'Fogo', agua: 'Água', ar: 'Ar', terra: 'Terra' };
const MODALIDADES = { cardinal: 'cardinal', fixo: 'fixo', mutavel: 'mutável' };
const ORDINAIS = { 1: 'primeiro', 2: 'segundo', 3: 'terceiro' };
const NUMERO_EXTENSO = {
  2: 'Dois', 3: 'Três', 4: 'Quatro', 5: 'Cinco', 6: 'Seis',
  7: 'Sete', 8: 'Oito', 9: 'Nove', 10: 'Dez',
};

// Nomes de autor que lib/traducoes/datacao.js ainda não conhece — ele cobre o
// elenco antigo (Ptolomeu, Valente, Catão…), não a Golden Dawn nem Dio Cássio,
// e este arquivo não pode editar aquele. Extensão local, com as MESMAS chaves
// nos três packs; ela perde para o mapa compartilhado no dia em que ele
// aprender os nomes. Ver autorNaLingua() no motor.
const AUTORES = {
  'Dio Cássio': 'Dio Cássio',
  'Ordem Hermética da Golden Dawn': 'Ordem Hermética da Golden Dawn',
  'Israel Regardie': 'Israel Regardie',
};

// A nota que acompanha cada fonte das camadas. Vive no pack, e não no motor,
// porque é PROSA: "trad." é "trans." em inglês, e a nota do Regardie é uma
// frase inteira. As chaves são as de CAMADAS[].fontes[].notaChave no motor e
// são as MESMAS nos três packs.
const NOTAS_DE_FONTE = {
  robbins: 'trad. Robbins, 1940',
  cary: 'trad. Cary, LacusCurtius',
  regardie: 'a publicação que tirou o Book T do círculo fechado',
};

function lista(itens) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

function faixa(c) {
  return `de ${c.grauInicio}° a ${c.grauFim}° de ${c.signoNome}`;
}

// ---------------------------------------------------------------------------
// AS CITAÇÕES — verbatim, sem tradução
// ---------------------------------------------------------------------------
// O campo `texto` é o inglês de Robbins (Loeb/Harvard, 1940) e é IDÊNTICO nos
// três packs. O que muda por idioma é a `parafrase` — assinada pelo app, nunca
// entre aspas — e a língua do locus, que o motor monta com traduzirAutor e
// traduzirQuando.
const VERBATIM = {
  ptolomeuRejeita: {
    texto:
      'These matters, as they have only plausible and not natural, but, rather, unfounded, arguments in their favour, we shall omit.',
    parafrase:
      'O astrólogo mais influente do mundo antigo olha para os decanatos e diz que os argumentos a favor deles são plausíveis, não naturais e, no fundo, sem base — e por isso vai deixá-los de fora. Deixou. Eles sobreviveram sem ele.',
    obra: 'Tetrabiblos I.22',
    autor: 'Ptolomeu',
    quando: 'séc. II',
    nota: 'trad. Robbins, 1940',
  },
  ptolomeuFace: {
    texto:
      "The planets are said to be in their 'proper face' when an individual planet keeps to the sun or moon the same aspect which its house has to their houses",
    parafrase:
      'A "face própria" dele é um planeta guardar, com o Sol ou com a Lua, o mesmo ângulo que a casa desse planeta guarda com as casas dos dois. É relação de ângulo. Não é o pedaço de dez graus do signo — mesmo nome, outra coisa.',
    obra: 'Tetrabiblos I.23',
    autor: 'Ptolomeu',
    quando: 'séc. II',
    nota: 'trad. Robbins, 1940',
  },
};

// ---------------------------------------------------------------------------
// BLOCO 1 — A CHAMADA. Vida real, sem termo técnico, sem nome próprio, sem
// século. Varia por naipe porque o momento de tirar carta é diferente em cada
// território, e porque a mesma abertura em 36 cartas vira moldura reciclada.
// ---------------------------------------------------------------------------
const CHAMADA = {
  paus: () =>
    'Você embaralhou com uma decisão entalada na garganta — se vai, se fica, se manda a mensagem. Saiu esta carta. ' +
    'Qual carta sai é sorte, e amanhã pode sair outra. Que pedaço de céu esta carta é, não é sorte nenhuma: já estava decidido antes de o baralho chegar na sua mão.',
  copas: () =>
    'Você embaralhou pensando numa pessoa. Talvez naquela conversa que ficou pela metade, talvez na que nem começou. Saiu esta carta. ' +
    'Qual carta sai é sorte. Que pedaço de céu esta carta é, não é: já estava decidido antes de o baralho chegar na sua mão.',
  espadas: () =>
    'Você embaralhou depois da discussão — daquelas em que a resposta boa só aparece três horas depois. Saiu esta carta. ' +
    'Qual carta sai é sorte. Que pedaço de céu esta carta é, não é: já estava decidido antes de o baralho chegar na sua mão.',
  ouros: () =>
    'Você embaralhou com a conta do mês na cabeça, ou com o trabalho que não anda. Saiu esta carta. ' +
    'Qual carta sai é sorte, e amanhã pode sair outra. Que pedaço de céu esta carta é, não é sorte nenhuma: já estava decidido antes de o baralho chegar na sua mão.',
};

// ---------------------------------------------------------------------------
// BLOCO 2 — A EXPLICAÇÃO. Cinco parágrafos: abre na vida real, mostra a regra,
// mostra a conta fechando, e só então entrega o recibo com obra, autor e século.
// ---------------------------------------------------------------------------
const EXPLICACAO = (c) =>
  `Tem uma coisa que quase ninguém separa quando tira carta. O sorteio decide QUAL carta chega na sua mão — e decide só isso. ` +
  `O que aquela carta é, o pedaço de céu que ela ocupa, o nome antigo que ela carrega: nada disso foi sorteado junto. ` +
  `Foi escrito antes, numa regra que não abriu exceção para nenhuma das trinta e seis cartas numeradas. E a regra cabe em quatro passos.` +
  `\n\n` +
  `Passo um: o naipe dá o elemento. ${c.naipeNome} é ${c.elementoNome}, e ${c.elementoNome} tem três signos — ${lista(c.signosDoElemento)}. ` +
  `Passo dois: o número escolhe qual dos três. Dois, Três e Quatro vão para o signo cardinal do elemento; Cinco, Seis e Sete para o fixo; Oito, Nove e Dez para o mutável. ` +
  `Esta é um ${c.numeroExtenso}, e o signo ${c.modalidadeNome} de ${c.elementoNome} é ${c.signoNome}. ` +
  `Passo três: o número também escolhe o pedaço. Cada signo tem trinta graus e se parte em três fatias de dez — é isso que a tradição chama de decanato, um terço de signo. ` +
  `Dois, Cinco e Oito pegam o primeiro terço; Três, Seis e Nove o segundo; Quatro, Sete e Dez o terceiro. O ${c.numeroExtenso} pega o ${c.ordinal}: ${faixa(c)}.` +
  `\n\n` +
  `Passo quatro, o mais bonito: o planeta sai de uma contagem. Enfileire os trinta e seis terços em ordem, do primeiro de ${c.ariesNome} ao último de ${c.peixesNome}. ` +
  `Agora distribua os sete planetas em roda, sempre nesta ordem — ${lista(c.ordemCaldaicaNome)} —, um por terço, começando com ${c.planetaQueAbre} no terço número um. ` +
  `${c.posicao === 1
      ? `Este é o terço número um, e é por isso que o planeta é ${c.planetaNome}.`
      : `Este aqui é o terço número ${c.posicao} de trinta e seis: são ${c.passos} passos de ${c.planetaQueAbre} até ele, e ${c.passos} passos na roda de sete param em ${c.planetaNome}.`} ` +
  `É por isso que esta carta é ${c.rotulo}. O nome tradicional que ela carrega, ${c.tituloGD}, vem da mesma tabela.` +
  `\n\n` +
  `E repare como a conta fecha. Doze signos, três terços em cada um: trinta e seis. O elemento anda de quatro em quatro signos e o trio de números anda de três em três; ` +
  `como três e quatro não têm divisor comum, cada naipe recebe cada trio exatamente uma vez. É por isso que os quatro naipes têm Dois, Três, Quatro, Cinco, Seis, Sete, Oito, Nove e Dez completos — não sobra carta e não falta carta. ` +
  `Já os planetas não fecham redondo: trinta e seis dividido por sete dá cinco e sobra um. ${c.planetaQueAbre} aparece ${c.vezesDoPlanetaQueAbre} vezes na volta, os outros seis aparecem ${c.vezesDosOutros} cada. A sobra é ${c.planetaQueAbre}, e por isso a volta abre nele e fecha nele.` +
  `\n\n` +
  `Agora o recibo, porque as três camadas disso têm idades muito diferentes e o mercado vende as três como se fossem uma. ` +
  `Os terços de dez graus já eram correntes e já eram briga na antiguidade: ${c.autorPtolomeu}, no Tetrabiblos I.22, ${c.quandoPtolomeu}, escreve sobre eles "we shall omit" — o astrólogo mais sistemático do mundo antigo jogou os decanatos fora, e eles sobreviveram assim mesmo. ` +
  `A ordem dos sete planetas usada na contagem está em ${c.autorDio}, Historia Romana 37.18–19, ${c.quandoDio}. ` +
  `E quem encaixou os trinta e seis terços nas trinta e seis cartas foi a ${c.autorGoldenDawn}, no Book T — The Tarot, ${c.anoBookT}, publicado por ${c.autorRegardie} em The Golden Dawn, ${c.quandoRegardie}. ` +
  `A estrutura do céu é antiga; o encaixe nas cartas tem pouco mais de cem anos. Vale saber qual é qual.`;

// ---------------------------------------------------------------------------
// A REGRA EM QUATRO PASSOS — para a tela que quiser lista numerada em vez de
// texto corrido. Mesmos fatos da explicação, já com os valores DESTA carta.
// ---------------------------------------------------------------------------
const A_REGRA = [
  {
    titulo: 'O naipe dá o elemento',
    texto: (c) =>
      `${c.naipeNome} é ${c.elementoNome}. E ${c.elementoNome}, no céu, são três signos: ${lista(c.signosDoElemento)}. ` +
      `Nenhuma carta numerada de ${c.naipeNome} cai fora desses três.`,
  },
  {
    titulo: 'O número escolhe qual dos três',
    texto: (c) =>
      `Dois, Três e Quatro vão para o signo cardinal do elemento; Cinco, Seis e Sete para o fixo; Oito, Nove e Dez para o mutável. ` +
      `Esta carta é um ${c.numeroExtenso}, e o signo ${c.modalidadeNome} de ${c.elementoNome} é ${c.signoNome}.`,
  },
  {
    titulo: 'O número também escolhe o terço',
    texto: (c) =>
      `Cada signo tem trinta graus e se parte em três fatias de dez — decanato é isso, um terço de signo. ` +
      `Dois, Cinco e Oito pegam o primeiro terço; Três, Seis e Nove o segundo; Quatro, Sete e Dez o terceiro. ` +
      `O ${c.numeroExtenso} pega o ${c.ordinal}: ${faixa(c)}.`,
  },
  {
    titulo: 'A contagem dá o planeta',
    texto: (c) =>
      `Enfileire os trinta e seis terços em ordem, do primeiro de ${c.ariesNome} ao último de ${c.peixesNome}, e distribua os sete planetas em roda — ` +
      `${lista(c.ordemCaldaicaNome)} —, começando com ${c.planetaQueAbre} no terço número um. ` +
      `${c.posicao === 1
        ? `Este é o terço número um: a contagem começa exatamente aqui, e o planeta é ${c.planetaNome}.`
        : `Este é o terço número ${c.posicao} de trinta e seis; ${c.passos} passos na roda a partir de ${c.planetaQueAbre} param em ${c.planetaNome}.`} ` +
      `Daí o rótulo: ${c.rotulo}.`,
  },
];

const A_CONTA = (c) =>
  c.posicao === 1
    ? `Terço número ${c.posicao} de 36. A contagem começa exatamente aqui: ${c.planetaQueAbre} abre a volta, e o planeta desta carta é ${c.planetaNome}.`
    : `Terço número ${c.posicao} de 36. São ${c.passos} passos de ${c.planetaQueAbre} até aqui, e ${c.passos} passos na roda de sete param em ${c.planetaNome}.`;

const NOTA_DA_VOLTA = (c) =>
  `Os sete não fecham redondo em trinta e seis: trinta e seis dividido por sete dá cinco e sobra um. ` +
  `${c.planetaQueAbre} aparece ${c.vezesDoPlanetaQueAbre} vezes na volta e cada um dos outros seis aparece ${c.vezesDosOutros}. ` +
  `A sobra é ${c.planetaQueAbre} — e é por isso que a volta abre nele, no primeiro terço de ${c.ariesNome}, e fecha nele, no último de ${c.peixesNome}.`;

const NOTA_DO_PRIMEIRO_TERCO = (c) =>
  `Uma regra que parece existir e quase existe — e vale ver de perto, porque é desse tipo de quase que nasce lenda. ` +
  `O primeiro terço de ${c.ariesNome} cai em ${c.planetaQueAbre}, que é justamente o dono de ${c.ariesNome} na tabela de domicílios de ${c.autorPtolomeu} (Tetrabiblos I.17, ${c.quandoPtolomeu}). ` +
  `Dá vontade de concluir que cada signo abre com o próprio dono. Não é isso: entre os doze, isso acontece em ${c.signosQueAbremComODono.length} — ${lista(c.signosQueAbremComODono)} —, e os dois são casas de ${c.planetaQueAbre}, que é quem abre a contagem. ` +
  `Nos outros dez não bate: ${c.touroNome} abre em ${c.abreTouro} e o dono dele é ${c.donoDeTouro}; ${c.gemeosNome} abre em ${c.abreGemeos} e o dono é ${c.donoDeGemeos}. ` +
  `Dois em doze é efeito colateral do ponto de partida, não princípio. E nenhum texto antigo desta base diz por que a contagem começa em ${c.planetaQueAbre} — a falta fica declarada em vez de preenchida com um motivo bonito.`;

const CONFERENCIA_TEXTO = (c) =>
  `Conferido agora, com esta tela aberta: o app refez os quatro passos para as trinta e seis cartas e comparou cada uma com a tabela do baralho. Batem ${c.conferem} de ${c.total}.`;

// ---------------------------------------------------------------------------
// AS TRÊS CAMADAS — a corrente inteira, cada elo com a sua idade
// ---------------------------------------------------------------------------
const CAMADAS = {
  decanatos: {
    titulo: 'Os terços de dez graus',
    idade: 'antiguidade, sem data fechada',
    texto:
      'Dividir cada signo em três fatias de dez graus é a peça mais velha da corrente, e esta base não conseguiu fixar obra e autor para a origem dela. O que está conferido é o teto: no séc. II os decanatos já eram correntes e já eram disputados, porque Ptolomeu os conhece e os descarta com todas as letras. Sobreviveram apesar dele.',
  },
  ordemDosPlanetas: {
    titulo: 'A ordem dos sete',
    idade: 'antiga, com fonte datada',
    texto:
      'Saturno, Júpiter, Marte, Sol, Vênus, Mercúrio, Lua: os sete por período aparente decrescente, do mais lento ao mais rápido, lidos como distância à Terra. A mesma sequência gera as horas planetárias e os nomes dos dias da semana. Quem aplicou essa ordem aos trinta e seis terços começando por Marte foi a astrologia helenística, nas chamadas faces — e esse elo específico esta base não leu em fonte primária.',
  },
  asTrintaESeisCartas: {
    titulo: 'O encaixe nas trinta e seis cartas',
    idade: 'séc. XIX',
    texto:
      'Esta é a camada nova, e é a que costuma ser vendida como antiga. Pôr os trinta e seis terços nas trinta e seis cartas numeradas, em ordem zodiacal, começando pelo Dois de Paus, é obra da Golden Dawn. Não existe equivalente disso em Lévi, em Etteilla nem no tarô italiano. A estrutura do céu é milenar; esta correspondência não.',
  },
};

// ---------------------------------------------------------------------------
// AS RESSALVAS QUE ANDAM JUNTO COM TODA LEITURA
// ---------------------------------------------------------------------------
const NOTA_ATRIBUICAO_RIVAL = () =>
  'Uma frase que este app não escreve: "a atribuição astrológica do tarô". Não existe uma. ' +
  'Existem pelo menos três, incompatíveis entre si — a da Golden Dawn (Book T, 1888), que é a usada aqui; a continental de Éliphas Lévi (Dogme et Rituel de la Haute Magie, 1854–1856) e de Papus (1889), que desloca todas as letras em uma casa; e a de Aleister Crowley (The Book of Thoth, 1944), que troca duas. ' +
  'Dizer "a" atribuição seria esconder que houve escolha. A escolha deste app está dita, e é a de 1888.';

const NOTA_ARMADILHA_PTOLOMEU = (c) =>
  `A armadilha de citação desta matéria, e ela é comum até em manual impresso. ` +
  `${c.autorPtolomeu} tem um capítulo sobre "face" — Tetrabiblos I.23, ${c.quandoPtolomeu} — e mais de um livro moderno o cita como se fosse a fonte do decanato. Não é. ` +
  `Ali, "face" é um planeta guardando com o Sol ou com a Lua o mesmo ângulo que a casa dele guarda com as casas dos dois: relação de ângulo, não fatia de dez graus. Mesmo nome, outra coisa. ` +
  `E no capítulo anterior, I.22, o mesmo autor rejeita os decanatos. Quem cita I.23 para justificar decanato está citando contra si mesmo.`;

const NOTA_LEITURA_DO_APP = (c) =>
  `O que é fonte e o que é leitura do app, separado. A fonte: a tabela das trinta e seis cartas é da ${c.autorGoldenDawn}, Book T — The Tarot, ${c.anoBookT}, e o app não mudou uma linha dela. ` +
  `A leitura do app: os quatro passos que você acabou de ler são a NOSSA maneira de contar a conta — a fonte publica a tabela pronta, não a receita. ` +
  `O que o app fez foi refazer o percurso, de dez em dez graus e de sete em sete planetas, e conferir carta a carta se ele reproduz as trinta e seis entradas. Reproduz, sem exceção, e a conferência roda toda vez que esta tela abre. ` +
  `Se um dia uma carta não bater, esta tela vai dizer que não bateu em vez de contar a história mesmo assim.`;

// ---------------------------------------------------------------------------
// A BIBLIOGRAFIA
// ---------------------------------------------------------------------------
const FONTES = [
  'Ptolomeu, Tetrabiblos I.22 (trad. F. E. Robbins, Loeb/Harvard, 1940), séc. II — os decanatos já são correntes e ele os rejeita: "we shall omit". É o que prova a antiguidade deles, pela boca de quem não os queria',
  'Ptolomeu, Tetrabiblos I.23, séc. II — a "face própria" dele é relação de ângulo com o Sol e a Lua, e NÃO o terço de dez graus. Nunca citar I.23 para justificar decanato',
  'Ptolomeu, Tetrabiblos I.17, séc. II — os domicílios dos sete, usados aqui só para mostrar que "cada signo abre com o próprio dono" bate em dois signos dos doze, Áries e Escorpião, e que os dois são casas de Marte, que é quem abre a contagem',
  'Dio Cássio, Historia Romana 37.18–19 (trad. Cary, LacusCurtius), séc. III — a ordem dos sete: Saturno, Júpiter, Marte, Sol, Vênus, Mercúrio, Lua. Ele mesmo chama o costume planetário de recente para a época dele',
  'Ordem Hermética da Golden Dawn, Book T — The Tarot, 1888 — o encaixe dos trinta e seis decanatos nas trinta e seis cartas numeradas, com os títulos ("Senhor do Domínio", "Senhor da Ruína")',
  'Israel Regardie, The Golden Dawn, 1937–1940 — a publicação que tirou o Book T do círculo fechado da Ordem',
  'Éliphas Lévi, Dogme et Rituel de la Haute Magie, 1854–1856, e Papus, 1889 — a atribuição continental rival, que desloca todas as letras em uma casa',
  'Aleister Crowley, The Book of Thoth, 1944 — a terceira atribuição, que troca Heh e Tzaddi e mantém os signos',
];

// ---------------------------------------------------------------------------
// QUANDO A CARTA NÃO TEM DECANATO — e cada motivo é um motivo diferente
// ---------------------------------------------------------------------------
// "Esta carta não tem" sem dizer por quê é exatamente o silêncio que esta
// feature existe para não repetir.
const FALTA = {
  maior: {
    texto:
      'Os vinte e dois Arcanos Maiores não entram nesta conta, e não é esquecimento: na mesma tabela de 1888 eles recebem outra coisa — uma letra hebraica cada um, e com ela um signo, um planeta ou um elemento. Decanato é assunto das trinta e seis cartas numeradas de Dois a Dez. Somando: vinte e dois Maiores, quatro Ases, dezesseis cortes e trinta e seis numeradas dão as setenta e oito do baralho.',
    comoResolver: 'A atribuição desta carta aparece na ficha dela, em Tarô por Tema.',
  },
  as: {
    texto:
      'O Ás não é um pedaço do céu. Na mesma tabela de 1888 ele é a raiz do elemento do naipe inteiro — a força ainda sem lugar, antes de qualquer divisão em graus. Os quatro Ases ficam de fora dos trinta e seis decanatos de propósito, e é por isso que a conta do baralho fecha.',
    comoResolver: 'A atribuição desta carta aparece na ficha dela, em Tarô por Tema.',
  },
  corte: {
    texto:
      'As dezesseis cartas de corte recebem elemento composto, não decanato. E aqui a própria tabela tem duas versões rivais: a Golden Dawn usa Cavaleiro, Rainha, Príncipe e Princesa, e este baralho é Rider-Waite-Smith, que tem Rei e Valete no lugar de Príncipe e Princesa. O app usa a adaptação corrente e registra que é adaptação, em vez de fingir que só existe uma convenção.',
    comoResolver: 'A atribuição desta carta aparece na ficha dela, em Tarô por Tema.',
  },
  carta: {
    texto:
      'Esta carta não foi reconhecida no baralho, então não há encaixe a explicar. O app prefere dizer isso a montar uma explicação em cima de uma carta que ele não achou.',
    comoResolver: 'Volte para a tiragem em Tarô por Tema e toque na carta de novo.',
  },
  divergencia: {
    texto: (e) =>
      `A regra e a tabela do baralho discordam nesta carta: a contagem produz "${e.daRegra}" e o baralho publica "${e.doBaralho}". ` +
      'Quando isso acontece, o app não explica um encaixe que ele não conseguiu conferir — mostrar a divergência é mais honesto do que escolher um dos dois em silêncio.',
    comoResolver: 'Nada a fazer aqui: é um desencontro dentro do próprio app, e ele fica registrado nesta tela.',
  },
};

export const PACK = {
  idioma: 'pt',
  tela: 'Tarô por Tema',
  autores: AUTORES,
  planetas: PLANETAS,
  signos: SIGNOS,
  conector: CONECTOR,
  naipes: NAIPES,
  elementos: ELEMENTOS,
  modalidades: MODALIDADES,
  ordinais: ORDINAIS,
  numeroExtenso: NUMERO_EXTENSO,
  notasDeFonte: NOTAS_DE_FONTE,
  lista,
  faixa,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  aRegra: A_REGRA,
  aConta: A_CONTA,
  notaDaVolta: NOTA_DA_VOLTA,
  notaDoPrimeiroTerco: NOTA_DO_PRIMEIRO_TERCO,
  conferenciaTexto: CONFERENCIA_TEXTO,
  camadas: CAMADAS,
  notaAtribuicaoRival: NOTA_ATRIBUICAO_RIVAL,
  notaArmadilhaPtolomeu: NOTA_ARMADILHA_PTOLOMEU,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  verbatim: VERBATIM,
  fontes: FONTES,
  falta: FALTA,
};

export default PACK;
