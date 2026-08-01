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
// OS TRÊS IDIOMAS — onde o texto mora agora (31/07/2026, segunda leva)
// ===========================================================================
// O app é divulgado organicamente no mundo inteiro e o chrome já é traduzido
// (lib/i18n.js) — mas o conteúdo das leituras saía em português pra todo
// mundo. Agora TODA prosa que o usuário lê vive em packs por idioma:
//
//   lib/traducoes/synastry.pt.js   ← o PT original, movido BYTE A BYTE
//   lib/traducoes/synastry.es.js   ← espanhol neutro-latino
//   lib/traducoes/synastry.en.js   ← inglês natural de app americano
//
// Os três packs têm a MESMA forma: mesmas chaves, mesmas tabelas, funções com
// a mesma assinatura. O que NUNCA muda entre eles: o verbatim de Robbins (o
// inglês é citação nos três), os loci (Tetrabiblos I.13 continua Tetrabiblos
// I.13), os números e as CHAVES internas (elementos, modalidades, planetas e
// signos continuam sendo chaves em português nos três packs — só o TEXTO
// exibido muda). `sinastria()` ganhou um terceiro parâmetro `lang` com default
// 'pt': chamada antiga continua produzindo exatamente o PT de sempre, e
// test/golden/synastry.pt.golden.json + test/synastryIdiomas.test.js provam
// isso byte a byte contra a saída capturada ANTES da extração.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string dos packs
// ===========================================================================
// (mesma disciplina de lib/zodiacBody.js e lib/grounding.js — e vale nos TRÊS
// idiomas, sem exceção)
//
// 1. TRADIÇÃO COM FONTE. Toda afirmação sobre o que "a tradição diz" carrega o
//    capítulo. O verbatim inglês de Robbins (1940) fica SEM TRADUÇÃO, como o
//    latim de Manílio em lib/zodiacBody.js — traduzir citação é falsificá-la.
//    O que a tela PODE fazer (feedback do dono, 31/07/2026) é antepor uma
//    PARÁFRASE rotulada como paráfrase nossa (campo `parafrase` de cada
//    VERBATIM): o inglês continua na tela como recibo, entre aspas e com
//    locus; a paráfrase nunca ganha aspas nem locus, porque quem assina a
//    paráfrase é o app, não Robbins. No pack EN a paráfrase é em inglês e o
//    verbatim aparece direto; no ES a paráfrase é em espanhol e o inglês
//    continua como citação.
//
// 2. NUNCA DECRETAR DESTINO. A tradição descreve a NATUREZA do encontro, não o
//    desfecho. PROIBIDO: "vocês não vão dar certo", "essa relação acaba",
//    "termine", "procure outro", qualquer verbo no futuro sobre o casal, e
//    qualquer imperativo que decida pela pessoa. O próprio Ptolomeu, no mesmo
//    capítulo em que põe quadratura e oposição entre as posições de separação,
//    registra a união difícil que NÃO termina — ver VERBATIM.modificador.
//
// 3. INCISIVO NÃO É ASSUSTADOR. O modelo é o Cinco de Copas de Waite: nomeia a
//    perda e ancora o que resta num FATO. Aqui o fato é geométrico: elemento,
//    qualidade compartilhada, modalidade, eixo.
//
// 4. NENHUMA ALEGAÇÃO DE SAÚDE. Sem exceção, e sem metáfora. Nada de "cura",
//    "faz bem", "alivia", "energia que sara" — e os primos nos outros idiomas:
//    em ES aliviar/calmar/sanar/curar/tratar/energizar; em EN relieve/soothe/
//    calm/heal/cure/treat/energize. Nenhum entra, em nenhum pack.
//
// 5. NÃO INVENTAR TRADIÇÃO. O que é leitura do app vem rotulado como leitura do
//    app. O que a pesquisa não achou está em NAO_ACHADO e continua não achado.
//
// 6. DUAS LÍNGUAS, NESTA ORDEM. Toda leitura ABRE em língua de conversa e
//    FECHA com a fonte (feedback do dono, 31/07/2026). Termo técnico ganha
//    glosa entre parênteses na primeira vez que aparece.
//
// 7. DOIS BLOCOS, E O BLOCO 1 ABRE. BLOCO 1 "Como é na vida real" (`chamada` +
//    `vidaReal`, cinco dimensões compostas com os fatos do par, sem termo
//    técnico); BLOCO 2 "De onde vem isso" (tudo que tem fonte). O bloco 1 é
//    caracterologia contemporânea e o bloco 2 declara isso em voz alta
//    (notaCaracterologia). O histórico completo das duas regras está no git e
//    nos comentários do pack PT.
//
// test/synastry.test.js segura tudo isso e falha o build. É de propósito.
// test/synastryIdiomas.test.js segura o PT byte a byte e a paridade dos packs.
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

import { PACK as PACK_PT } from './traducoes/synastry.pt.js';
import { PACK as PACK_ES } from './traducoes/synastry.es.js';
import { PACK as PACK_EN } from './traducoes/synastry.en.js';

// O idioma escolhe o pack; qualquer coisa fora dos três cai no PT — o mesmo
// fallback de lib/i18n.js, e o que garante que chamada antiga (sem lang) não
// muda um byte.
const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// 1. AS QUALIDADES DOS ELEMENTOS (Aristóteles, Da Geração e Corrupção II.3)
// ---------------------------------------------------------------------------
// Cada corpo simples tem duas das quatro qualidades primárias, e os contrários
// não se acoplam — daí só existirem quatro combinações. As chaves casam byte a
// byte com o campo `element` de lib/signs.js, que é de onde os signos chegam.
// Estes tokens são LÓGICA (e chaves nos três packs), não texto de tela — o
// nome exibido de cada qualidade vem do pack do idioma.
export const ARISTOTELES_LOCUS = PACK_PT.aristotelesLocus;

export const QUALIDADES = {
  fogo: ['quente', 'seco'],
  ar: ['quente', 'úmido'],
  água: ['frio', 'úmido'],
  terra: ['frio', 'seco'],
};

// A qualidade que dois elementos têm em comum. Vazio = contrários absolutos
// (fogo-água e ar-terra são os únicos dois casos).
export function qualidadesEmComum(elementoA, elementoB) {
  const a = QUALIDADES[elementoA] || [];
  const b = QUALIDADES[elementoB] || [];
  return a.filter((q) => b.includes(q));
}

export function qualidadesFrase(elemento, lang = 'pt') {
  const pack = packDoIdioma(lang);
  const q = QUALIDADES[elemento];
  return q ? pack.fraseQualidades(q.map((x) => pack.qualidades[x])) : '';
}

// ---------------------------------------------------------------------------
// 2. AS MODALIDADES (Ptolomeu, Tetrabiblos I.11)
// ---------------------------------------------------------------------------
// Ptolomeu não fala em "modalidade": ele nomeia signos SOLSTICIAIS E
// EQUINOCIAIS, SÓLIDOS e BICORPÓREOS, e o critério dele é sazonal. A glosa (no
// pack de cada idioma) fica presa à imagem SAZONAL da fonte, de propósito:
// descrever cardeal como "quem toma a iniciativa" é psicologia do séc. XX, e o
// BLOCO 2 não faz esse salto (o bloco 1, declarado caracterologia moderna, faz
// — ver notaCaracterologia).
//
// A modalidade é ARITMÉTICA no zodíaco (índice % 3) — por isso a ordem dos ids
// mora aqui e o texto mora no pack, e não pode haver divergência com
// lib/signs.js.
export const PTOLOMEU_MODALIDADE_LOCUS = 'Ptolomeu, Tetrabiblos I.11';

const MODALIDADE_IDS = ['cardeal', 'fixo', 'mutavel'];

// Export de compatibilidade: a MESMA lista de sempre, em PT.
export const MODALIDADES = MODALIDADE_IDS.map((id) => PACK_PT.modalidades[id]);

export function modalidadePorIndice(indice, lang = 'pt') {
  const id = MODALIDADE_IDS[((indice % 3) + 3) % 3];
  return packDoIdioma(lang).modalidades[id];
}

// ---------------------------------------------------------------------------
// 3. AS CITAÇÕES — verbatim de Robbins (Loeb/Harvard, 1940), SEM tradução
// ---------------------------------------------------------------------------
// O texto vive no pack de cada idioma (o campo `texto` é o MESMO inglês nos
// três — test/synastryIdiomas.test.js confere byte a byte). Este export é o
// PT, pra quem já importava VERBATIM daqui.
export const VERBATIM = PACK_PT.verbatim;

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
// Os quatro degraus dizem de QUEM é o adjetivo — o texto de cada um vive no
// pack (grausIV7), com o dono do adjetivo na própria string.
export const GRAUS_IV7 = PACK_PT.grausIV7;

export const ESCALA = {
  copresenca: 1,
  trigono: 2,
  sextil: 2,
  quadratura: 3,
  oposicao: 4,
  aversao: 4,
};

// Categorias — o vocabulário da própria tradição, que é o que substitui a nota
// como resultado principal da tela. O texto por idioma vive no pack; este
// export é o PT de sempre.
export const CATEGORIAS = PACK_PT.categorias;

// A categoria de cada família é ESTRUTURA, não texto — por isso mora aqui e
// não no pack. O pack só dá o nome exibido (pack.categorias[categoriaId]).
const CATEGORIA_POR_FAMILIA = {
  trigono: 'harmonico',
  sextil: 'harmonico',
  quadratura: 'desarmonico',
  oposicao: 'desarmonico',
  aversao: 'semAspecto',
  copresenca: 'copresenca',
};

// As chaves de tradução do NOME do aspecto e da CATEGORIA (chrome da tela, em
// lib/i18n.js). Ficam aqui, ao lado dos ids que elas traduzem, pra não ser
// possível renomear um id sem ver a chave.
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
// O texto vive no pack de cada idioma; estes exports são o PT de sempre.
export const NOTA_ESCALA = PACK_PT.notaEscala;
export const NOTA_GRAU = PACK_PT.notaGrau;
export const RESSALVA_SIGNO_SOLAR = PACK_PT.ressalvaSignoSolar;

// ---------------------------------------------------------------------------
// O NOME DO SIGNO NO IDIOMA DA TELA — um acessor só, para o app inteiro
// ---------------------------------------------------------------------------
// Criado em 01/08/2026 depois que a auditoria achou o mesmo defeito em cinco
// telas: o nome do signo vinha sempre de constante PORTUGUESA (SIGNS em
// lib/signs.js, sign.pt em theme.js) enquanto o conteúdo logo abaixo já vinha
// traduzido. Na Home em inglês dava "Hi, Gêmeos" dois centímetros acima de um
// pensamento que dizia "♊ Gemini" — o mesmo signo, dois idiomas, na mesma
// dobra. Na compatibilidade, o título "♊ Gêmeos + Escorpião ♏" coroava um
// corpo inteiro em inglês.
//
// O mapa já existia dentro de cada pack (bloco `signos`, chaveado pelo nome
// PT, que é o identificador interno do app). Faltava só um lugar de onde
// pedir. Corrigir aqui é uma linha por tela em vez de uma tabela por tela.
//
// Nome desconhecido volta como veio: melhor mostrar o português do que
// esconder o signo da pessoa.
export function nomeDoSigno(nomePt, lang = 'pt') {
  if (!nomePt) return nomePt;
  const pack = PACKS[lang] || PACK_PT;
  return (pack.signos && pack.signos[nomePt]) || nomePt;
}

// ---------------------------------------------------------------------------
// 7. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/grounding.js e NOT_VERIFIED em
// lib/zodiacBody.js: dizer que não se achou impede que a próxima pessoa a
// editar preencha a lacuna com a versão que circula por aí. Isto é registro de
// pesquisa (não é renderizado em tela), então fica no motor e em PT.
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
// 8. O CONTEXTO DA LEITURA (bloco 2)
// ---------------------------------------------------------------------------
// Cada aspecto tem seu próprio construtor NO PACK do idioma, e cada construtor
// monta a frase com os FATOS DAQUELE PAR. O motor prepara os fatos (este ctx)
// e o pack escreve a prosa — é a única divisão de trabalho entre os dois.
//
// `sa` e `sb` são { name, element, emoji, index }.

function ctx(sa, sb, pack) {
  const modA = modalidadePorIndicePack(sa.index, pack);
  const modB = modalidadePorIndicePack(sb.index, pack);
  const comum = qualidadesEmComum(sa.element, sb.element);
  const nome = (n) => pack.signos[n] || n;
  const fraseQ = (el) => pack.fraseQualidades(QUALIDADES[el].map((q) => pack.qualidades[q]));
  return {
    A: nome(sa.name),
    B: nome(sb.name),
    // O token cru (chave de lógica). O pack PT o exibe direto — em PT o token
    // É o nome do elemento; es/en usam nomeElemA/nomeElemB.
    elemA: sa.element,
    elemB: sb.element,
    nomeElemA: pack.elementos[sa.element],
    nomeElemB: pack.elementos[sb.element],
    artA: pack.artigos[sa.element],
    artB: pack.artigos[sb.element],
    qA: fraseQ(sa.element),
    qB: fraseQ(sb.element),
    modA,
    modB,
    // As qualidades em comum CRUAS (pra lógica: length 0 = contrários
    // absolutos) e a primeira delas LOCALIZADA (pra prosa es/en).
    comum,
    qComum: comum.length ? pack.qualidades[comum[0]] : null,
  };
}

function modalidadePorIndicePack(indice, pack) {
  return pack.modalidades[MODALIDADE_IDS[((indice % 3) + 3) % 3]];
}

// ---------------------------------------------------------------------------
// 9. O BLOCO 1 — "COMO É NA VIDA REAL"
// ---------------------------------------------------------------------------
// A prosa vive nos packs; aqui ficam os quatro eixos combinatórios que fazem
// os 144 pares lerem diferente (figura × elementos × modalidades × regentes) e
// a montagem. Ver o histórico completo nos comentários do pack PT.

// Casas dos planetas — Ptolomeu, Tetrabiblos I.17. Isto é a atribuição antiga e
// é verificável; o que cada planeta "quer" (tabela `planeta` dos packs) é que é
// moderno. As chaves são dados: continuam em PT nos três idiomas.
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
// notaCaracterologia:
//   • onde HÁ figura (sextil, quadratura, trígono) vale a superação
//     (kathuperterisis) — doutrina helenística transmitida por Antíoco, Pórfiro
//     e Retório: predomina o lugar que está no DÉCIMO SIGNO a partir do outro.
//     Confere: o décimo signo a partir de Câncer é Áries, e é Áries que
//     predomina. (Ver docs/tradicao/02-aspectos-e-sinastria.md §2.4.)
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
  const ma = MODALIDADE_IDS[((sa.index % 3) + 3) % 3];
  const mb = MODALIDADE_IDS[((sb.index % 3) + 3) % 3];
  return peso[ma] >= peso[mb] ? { lider: sa.name, segue: sb.name } : { lider: sb.name, segue: sa.name };
}

function ctxVida(sa, sb, distancia, pack) {
  const idModA = MODALIDADE_IDS[((sa.index % 3) + 3) % 3];
  const idModB = MODALIDADE_IDS[((sb.index % 3) + 3) % 3];
  const modA = pack.modalidades[idModA];
  const modB = pack.modalidades[idModB];
  const lid = liderancaVida(sa, sb, distancia);
  const nome = (n) => pack.signos[n] || n;
  // Nome do signo por elemento e por modalidade. Só é chamado onde os dois
  // divergem — a geometria garante isso em cada caso de uso.
  const porElemento = { [sa.element]: nome(sa.name), [sb.element]: nome(sb.name) };
  const porModalidade = { [idModA]: nome(sa.name), [idModB]: nome(sb.name) };
  // A modalidade de QUEM PUXA — decidida nos nomes CRUS, antes da localização.
  const modDoLider = !lid ? null : (lid.lider === sa.name ? idModA : idModB);
  // O par de signos em ordem de zodíaco (chave crua, não exibida).
  const chavePar = (sa.index <= sb.index ? [sa.name, sb.name] : [sb.name, sa.name]).join('+');
  return {
    A: nome(sa.name),
    B: nome(sb.name),
    elemA: sa.element,
    elemB: sb.element,
    modA,
    modB,
    distancia,
    lider: lid ? nome(lid.lider) : null,
    segue: lid ? nome(lid.segue) : null,
    modLider: modDoLider,
    regA: REGENTES[sa.name],
    regB: REGENTES[sb.name],
    el: (elemento) => porElemento[elemento],
    md: (modalidade) => porModalidade[modalidade],
    chaveEl: chaveDupla(sa.element, sb.element, ORDEM_ELEMENTO),
    chaveMod: chaveDupla(idModA, idModB, ORDEM_MODALIDADE),
    chavePar,
  };
}

// A linha de cama sozinha, com maiúscula e ponto final — do jeito que o card
// de compartilhar da tela precisa dela.
export function fraseDeCama(id, lang = 'pt') {
  const f = packDoIdioma(lang).quimicaCama[id];
  if (!f) return null;
  return f.charAt(0).toUpperCase() + f.slice(1) + '.';
}

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

// A DECLARAÇÃO que autoriza o bloco 1 a existir — texto no pack; este export é
// o PT de sempre.
export const NOTA_CARACTEROLOGIA = PACK_PT.notaCaracterologia;

function construirVidaReal(sa, sb, distancia, id, categoriaId, pack) {
  const c = ctxVida(sa, sb, distancia, pack);
  const el = (tabela) => tabela[c.chaveEl](c);
  const md = (tabela) => tabela[c.chaveMod](c);
  return {
    chamada: pack.chamada[id](c),
    dimensoes: {
      quimica: [
        pack.quimicaFigura[id](c),
        el(pack.quimicaElemento),
        pack.fraseRegentes(c, 'quimica'),
        md(pack.quimicaModalidade),
      ].join(' '),
      conversa: [
        pack.conversaFigura[id](c),
        el(pack.conversaElemento),
        pack.fraseRegentes(c, 'conversa'),
        md(pack.conversaModalidade),
      ].join(' '),
      briga: [
        pack.brigaFigura[id](c),
        el(pack.brigaElemento),
        pack.fraseRegentes(c, 'briga'),
        md(pack.brigaModalidade),
      ].join(' '),
      convivencia: [
        pack.convivenciaFigura[id](c),
        el(pack.convivenciaElemento),
        pack.fraseRegentes(c, 'casa'),
        md(pack.convivenciaModalidade),
      ].join(' '),
      longoPrazo: [
        pack.longoFigura[id](c),
        el(pack.longoElemento),
        pack.fraseRegentes(c, 'prazo'),
        pack.longoFecho[categoriaId],
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
//
// `lang` tem default 'pt' de propósito: toda chamada existente continua
// recebendo EXATAMENTE o texto de sempre (test/golden/synastry.pt.golden.json
// prova). A tela passa o idioma que já tem do useLanguage().
export function sinastria(sa, sb, lang = 'pt') {
  if (!sa || !sb || typeof sa.index !== 'number' || typeof sb.index !== 'number') return null;
  const pack = packDoIdioma(lang);
  const distancia = distanciaEmSignos(sa.index, sb.index);
  const familia = ASPECTO_POR_DISTANCIA[distancia];
  const id = ID_POR_DISTANCIA[distancia];

  const c = ctx(sa, sb, pack);
  const leitura = familia === 'aversao' ? pack.leituras.aversao(c, distancia) : pack.leituras[familia](c);

  const modA = modalidadePorIndicePack(sa.index, pack);
  const modB = modalidadePorIndicePack(sb.index, pack);
  const grau = ESCALA[familia];
  const categoriaId = CATEGORIA_POR_FAMILIA[familia];
  // O BLOCO 1 é montado aqui, depois da leitura, porque o fecho de longo prazo
  // depende da categoria — e é ele que impede o texto quente de virar veredito.
  const vida = construirVidaReal(sa, sb, distancia, id, categoriaId, pack);

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
    notaCaracterologia: pack.notaCaracterologia,
    // A posição na escala ordinal de IV.7 — e a citação que a sustenta vai
    // junto de TODA leitura, exatamente pra ninguém poder mostrar o grau sem
    // mostrar de onde ele saiu.
    grau,
    grauNome: pack.grausIV7[grau],
    distancia,
    graus: grausDoAspecto(distancia),
    elementoA: sa.element,
    elementoB: sb.element,
    modalidadeA: modA.nome,
    modalidadeB: modB.nome,
    qualidadesA: QUALIDADES[sa.element],
    qualidadesB: QUALIDADES[sb.element],
    qualidadesEmComum: qualidadesEmComum(sa.element, sb.element),
    verbatins: [...leitura.verbatins, pack.verbatim.escala],
    notaEscala: pack.notaEscala,
    notaGrau: pack.notaGrau,
    ressalvaSignoSolar: pack.ressalvaSignoSolar,
  };
}
