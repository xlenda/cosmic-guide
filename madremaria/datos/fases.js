// datos/fases.js
// OS QUATRO TONS DE SEMANA — a tabela de conteudo das quadraturas lunares.
// Sem motor, sem disco, sem tela. Quem mede a lua e lib/ceu.js; aqui so mora
// texto e a fonte que sustenta cada afirmacao.
//
// ===========================================================================
// POR QUE QUATRO, E NUNCA OITO
// ===========================================================================
// A divisao em QUATRO quartos com leitura propria tem fonte primaria:
// Ptolomeu, Tetrabiblos I.8, "Of the Power of the Aspects to the Sun" —
// nova a quarto crescente umido; quarto crescente a cheia quente; cheia a
// quarto minguante seco; quarto minguante a ocultacao frio.
//
// A divisao em OITO fases com leitura PSICOLOGICA e de Dane Rudhyar, formulada
// nos oito tipos sololunares em The Lunation Cycle (1967), sobre ideia que ele
// vinha desenvolvendo desde os anos 1930-40 (The Astrology of Personality,
// 1936). Isso e tradicao posterior com autor e data — nao e milenar.
//
// CONSEQUENCIA DE PROJETO, e ela nao e estetica: se alguem "melhorar" este
// arquivo expandindo para oito tons, a base de fonte primaria cai junto e o
// texto vira almanaque. Os oito ROTULOS de lib/ceu.js continuam existindo como
// DADO (fatia de 45 graus, convencao de astronomia moderna, sem doutrina); o
// que nao se expande e a leitura.
//
// ===========================================================================
// A LINHA QUE NAO SE ATRAVESSA: DESCREVER, NUNCA CAUSAR
// ===========================================================================
// "A crescente e a fase em que a fracao iluminada aumenta ate a cheia" e
// descricao — e medicao, confere com efemeride.
// "Na crescente as coisas crescem na sua vida" e invencao, e escorrega em tres
// palavras para "na crescente essa pessoa se aproxima".
//
// A CONTENCAO E ESTRUTURAL, e nao lexical: em nenhum texto deste arquivo a
// outra pessoa aparece como SUJEITO DE VERBO. Nenhuma lista de palavras
// proibidas pega "com a Lua Cheia essa pessoa procura voce" — o que pega e a
// regra de forma. Este arquivo resolve o problema no limite: a outra pessoa
// nao e mencionada em nenhum campo de texto, em nenhuma das quatro fases.
//
// A lua descreve o DIA. Ela nao age sobre a decisao de ninguem.
//
// ===========================================================================
// O FORMATO DE UMA FASE (todos os campos obrigatorios)
// ===========================================================================
//   fase   — o nome da quadratura, dito pelos dois extremos. Nunca "Crescente"
//            sozinho: sozinho ele vira adjetivo, e adjetivo e o que escorrega.
//   tom    — a forma da semana em quatro a seis palavras. E o que a tela usa
//            como titulo curto.
//   abertura — o que a fase E, em medida. Duas ou tres frases descritivas.
//   oQuePede — o pedido da semana, em UMA frase. Concreto e completavel hoje.
//   comoMudaOPlano — o que muda no DESENHO do dia. Este e o campo que impede o
//            tedio do dia 40: o erro que mata nao e repetir palavra, e repetir
//            FORMA. Quatro caixas na mesma ordem por seis semanas sao identicas
//            mesmo com texto novo.
//
// Campos de recibo, no mesmo espirito do campo `fonte` de lib/ceu.js:
//   quarto      — 1 a 4, a ordem no ciclo.
//   elongacao   — { de, ate } em graus. E a DEFINICAO da quadratura, e e por
//                 ela que se decide a fase de um dia (ver fasePorElongacao).
//   qualidade   — a qualidade elementar de Ptolomeu I.8, com fonte ao lado.
//   fontes      — array de { autor, obra, locus, seculo, oQueDiz }.
//   proibicoes  — o que esta fase especificamente NAO pode dizer, e por que.
//
// ===========================================================================
// IDIOMA
// ===========================================================================
// Portugues do Brasil, como datos/cartas.json e datos/ritual.js. As strings
// moram aqui, junto do campo que elas justificam.
// ===========================================================================

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * A FONTE DAS QUATRO QUADRATURAS — estruturada em campos, nao em frase pronta.
 *
 * Frase pronta aqui viraria copy, e copy que cita fonte tem de poder ser
 * recomposta pela tela sem reescrever a citacao. Mesma convencao de
 * FONTE_SEMANA_PLANETARIA em lib/ceu.js.
 * ================================================================================= */
export const FONTE_QUATRO_QUARTOS = congelar({
  autor: 'Cláudio Ptolomeu',
  obra: 'Tetrabiblos',
  locus: 'I.8',
  seculo: 'séc. II',
  oQueDiz:
    'Divide o mês lunar em quatro quartos e dá a cada um uma qualidade elementar: da Lua Nova ao Quarto Crescente, úmido; do Quarto Crescente à Cheia, quente; da Cheia ao Quarto Minguante, seco; do Quarto Minguante à conjunção, frio.',
});

/* A moldura de OITO fases com leitura de personalidade, registrada aqui para
 * que ninguem a confunda com a de cima. Nao e usada por nenhum texto do app —
 * esta escrita para ser citada no dia em que alguem propuser oito tons. */
export const FONTE_OITO_FASES = congelar({
  autor: 'Dane Rudhyar',
  obra: 'The Lunation Cycle',
  locus: 'os oito tipos sololunares',
  seculo: '1967',
  oQueDiz:
    'A leitura psicológica das oito fases é formulada aqui, sobre ideia que o autor vinha desenvolvendo desde os anos 1930-40 (The Astrology of Personality, 1936). É tradição posterior, com autor e data — não é milenar.',
});

/* =================================================================================
 * AS QUATRO FASES
 * ================================================================================= */
const FASES_BASE = [
  /* --- 1 -------------------------------------------------------------------------
   * COMECAR NO ESCURO. A fase mais curta de tela das quatro, de proposito: e o
   * trecho do mes em que nao ha o que mostrar, e uma tela cheia aqui seria o app
   * inventando resultado onde ele nao existe.
   *
   * O lastro e bom e e antigo: Catao manda plantar figueira, macieira e videira
   * luna silente, ao entardecer — a coisa vai para a terra ANTES de haver o que
   * ver. "Plantar intencoes" e outra coisa, e moderna (Spiller, 2001); se um dia
   * for usada, o texto declara que e moderna. Ver `proibicoes`. */
  {
    id: 'novaACrescente',
    quarto: 1,
    fase: 'Lua Nova a Quarto Crescente',
    tom: 'Começar no escuro',
    elongacao: { de: 0, ate: 90 },
    qualidade: 'úmido',
    abertura:
      'Entre a Lua Nova e o Quarto Crescente a fração iluminada do disco vai de quase nada até metade. É o trecho do mês com menos luz no céu à noite, e é o único em que a fase muda de nome sem que dê para ver a diferença de uma noite para a outra.',
    oQuePede: 'Um gesto pequeno, começado hoje, que não produz nada visível hoje.',
    comoMudaOPlano:
      'A tela do dia é a mais curta das quatro e pede uma coisa só. Sem lista, sem segundo passo, sem nada para conferir no fim do dia — o que se pede aqui é do tipo que ainda não tem resultado.',
    fontes: [
      FONTE_QUATRO_QUARTOS,
      {
        autor: 'Catão, o Velho',
        obra: 'De Agri Cultura',
        locus: '40.1',
        seculo: 'séc. II a.C.',
        oQueDiz:
          'Figueira, macieira, oliveira, pereira e videira plantadas luna silente — com a lua escura —, ao entardecer.',
      },
      {
        autor: 'Paládio',
        obra: 'Opus Agriculturae',
        locus: 'I.6.12',
        seculo: 'séc. IV-V',
        oQueDiz: 'Tudo que se semeia deve ser semeado com a lua crescendo.',
      },
    ],
    proibicoes: [
      'Não trocar o gesto concreto pela "intenção plantada". Plantar de verdade na lua escura tem fonte primária de dois mil anos (Catão 40.1); "plantar intenções" é transposição moderna, popularizada por Jan Spiller em New Moon Astrology (2001). Se a segunda for usada, o texto declara que é moderna.',
      'Não prometer que o gesto de hoje muda o que vem depois. O pedido desta fase é justamente o que não tem resultado à vista.',
    ],
  },

  /* --- 2 -------------------------------------------------------------------------
   * SUSTENTAR SEM AUMENTAR. A unica das quatro que pede repeticao, e o campo
   * `comoMudaOPlano` e onde a regra vive: o tamanho do pedido NAO sobe.
   *
   * CUIDADO — este e o ponto mais escorregadio do arquivo inteiro. A regra
   * romana ("tudo que se quer que cresca se faz na crescente") e sobre semente,
   * e a distancia entre "o que cresce e o registro dela" e "o que cresce e o
   * vinculo" e de uma palavra. Por isso a `nota` esta escrita, e por isso a
   * outra pessoa nao aparece em campo nenhum desta fase. */
  {
    id: 'crescenteACheia',
    quarto: 2,
    fase: 'Quarto Crescente a Lua Cheia',
    tom: 'Sustentar o que já começou, sem aumentar',
    elongacao: { de: 90, ate: 180 },
    qualidade: 'quente',
    abertura:
      'Do Quarto Crescente à Lua Cheia a parte iluminada do disco vai de metade a inteira. É o trecho em que a mesma coisa aparece maior a cada noite sem mudar de natureza: o que muda é quanto dela está voltado para cá.',
    oQuePede: 'Refazer o gesto da fase anterior mais uma vez, do mesmo tamanho.',
    comoMudaOPlano:
      'É a única das quatro fases que pede repetição em vez de novidade. O tamanho do pedido não sobe em nenhum dia desta fase — o gesto é o mesmo, feito de novo.',
    fontes: [
      FONTE_QUATRO_QUARTOS,
      {
        autor: 'W. L. Carr',
        obra: 'The Roman Farmer and the Moon (TAPA 49)',
        locus: 'pp. 67-82',
        seculo: '1918',
        oQueDiz:
          'Levantamento de todas as passagens latinas sobre lua e agricultura. A regra que ele extrai do conjunto: tudo que se quer que cresça se faz na lua crescente; tudo que se quer que seque ou diminua, na minguante.',
      },
    ],
    proibicoes: [
      'Não dizer que repetir faz alguma coisa crescer entre você e outra pessoa. A regra romana é sobre semente. O que a repetição faz crescer, quando cresce, é o seu próprio registro — e isso é contável na tela, sem metáfora.',
      'Não escalar o pedido ao longo da semana. Escalar transforma a fase seguinte numa dívida.',
    ],
  },

  /* --- 3 -------------------------------------------------------------------------
   * O QUE JA DA PARA VER. A unica das quatro que pede palavra escrita — e por
   * isso ela cai uma vez a cada ~29 dias, e nao toda semana.
   *
   * DUAS PROIBICOES PROPRIAS, as duas com fonte:
   * (a) COLHER esta na MINGUANTE (Plinio XVIII.321). Na cheia, Columela XI.2.85
   *     manda semear fava. A copy de internet inverte isso o tempo todo.
   * (b) Lua cheia NAO se liga a comportamento, de ninguem. Rotton & Kelly (1985,
   *     37 estudos) nao encontram relacao. Este fato e ATIVO no produto: ele
   *     protege contra "estou assim por causa da lua cheia".
   *
   * E a fase que NAO pode carregar gesto de encontro nenhum: um marco lunar
   * datado na tela e medida e esta certo, mas a dois centimetros de um texto
   * sobre reconciliacao ele vira vespera de acontecimento. */
  {
    id: 'cheiaAMinguante',
    quarto: 3,
    fase: 'Lua Cheia a Quarto Minguante',
    tom: 'O que já dá para ver',
    elongacao: { de: 180, ate: 270 },
    qualidade: 'seco',
    abertura:
      'A Lua Cheia é a oposição exata entre Sol e Lua: um instante, não um dia — a olho nu o disco parece cheio por cerca de três noites. Deste ponto até o Quarto Minguante a fração iluminada volta de inteira a metade, e é o trecho do mês com mais luz para enxergar o que já está aí.',
    oQuePede: 'Registrar por escrito uma coisa que já dá para ver sem interpretar.',
    comoMudaOPlano:
      'É a única das quatro que pede palavra escrita, e por isso ela aparece uma vez a cada lunação e não toda semana. O card do céu não divide bloco visual com nenhum bloco de encontro, e nesta fase não entra gesto de encontro nenhum.',
    fontes: [
      FONTE_QUATRO_QUARTOS,
      {
        autor: 'Columela',
        obra: 'De Re Rustica',
        locus: 'XI.2.85',
        seculo: 'séc. I',
        oQueDiz: 'Favas semeadas na véspera ou no próprio dia da lua cheia.',
      },
      {
        autor: 'Plínio, o Velho',
        obra: 'Naturalis Historia',
        locus: 'XVIII.321',
        seculo: 'séc. I',
        oQueDiz:
          'Tudo que se corta, se colhe e se tosquia sofre menos dano com a lua minguante — ou seja, colher-para-guardar é da minguante, não da cheia.',
      },
      {
        autor: 'James Rotton e Ivan W. Kelly',
        obra: 'Much Ado about the Full Moon (Psychological Bulletin 97-2)',
        locus: 'pp. 286-306',
        seculo: '1985',
        oQueDiz:
          'Meta-análise de 37 estudos: nenhuma relação entre lua cheia e comportamento humano.',
      },
    ],
    proibicoes: [
      'Não dizer "colher". A fonte romana põe colher-para-guardar na minguante (Plínio, NH XVIII.321), e na cheia Columela (XI.2.85) manda semear fava. A frase corrente na internet inverte a fonte.',
      'Não ligar a Lua Cheia a comportamento, seu ou de quem quer que seja. A meta-análise de Rotton & Kelly (1985, 37 estudos) não encontra relação — e este fato serve de proteção contra "estou assim por causa da lua cheia".',
      'Não pôr gesto de encontro nesta fase, e não deixar o marco datado dividir bloco visual com o bloco de encontro. Data na tela é medida; data ao lado de reconciliação vira véspera de acontecimento.',
    ],
  },

  /* --- 4 -------------------------------------------------------------------------
   * TIRAR, CORTAR, DEIXAR SECAR. O quarto com melhor lastro primario de todos —
   * Plinio, Catao e Columela poem na minguante tudo que corta, colhe para secar,
   * capina e diminui.
   *
   * E a UNICA fase do ciclo em que o pedido e MENOS, e nao mais. Essa diferenca
   * de forma e o que impede as quatro semanas de parecerem a mesma semana.
   *
   * LINHA VERMELHA, escrita com todas as letras em `proibicoes`: o app corta aba
   * de navegador, nao corta vinculo. "Solte essa pessoa" e o app decidindo pela
   * pessoa que esta segurando o telefone — e decidindo o desfecho que ele jurou
   * nao saber. */
  {
    id: 'minguanteANova',
    quarto: 4,
    fase: 'Quarto Minguante a Lua Nova',
    tom: 'Tirar, cortar, deixar secar',
    elongacao: { de: 270, ate: 360 },
    qualidade: 'frio',
    abertura:
      'Do Quarto Minguante à Lua Nova a fração iluminada vai de metade a quase nada, e a Lua nasce cada vez mais tarde. É o quarto com mais fonte antiga de todos: as três grandes fontes latinas põem aqui tudo que corta, colhe para secar, capina e diminui.',
    oQuePede: 'Tirar uma coisa concreta do dia — uma aba aberta, um horário, um objeto, uma conferida.',
    comoMudaOPlano:
      'É a única fase do ciclo em que o pedido é menos, e não mais. A tela do dia subtrai em vez de somar, e essa diferença de forma é o que impede as quatro semanas de parecerem a mesma semana.',
    fontes: [
      FONTE_QUATRO_QUARTOS,
      {
        autor: 'Plínio, o Velho',
        obra: 'Naturalis Historia',
        locus: 'XVIII.321-322',
        seculo: 'séc. I',
        oQueDiz:
          'Tudo que se corta, se colhe e se tosquia sofre menos dano com a lua minguante; esterco e castração também na minguante.',
      },
      {
        autor: 'Catão, o Velho',
        obra: 'De Agri Cultura',
        locus: '29 e 31.2',
        seculo: 'séc. II a.C.',
        oQueDiz: 'Esterco luna silente; corte de madeira luna decrescente, depois do meio-dia.',
      },
      {
        autor: 'Columela',
        obra: 'De Re Rustica',
        locus: 'II.5.1 e XI.2.11',
        seculo: 'séc. I',
        oQueDiz:
          'Capina e esterco na minguante; corte de madeira entre o vigésimo e o trigésimo dia lunar.',
      },
    ],
    proibicoes: [
      'Jamais "solte essa pessoa", "corte esse vínculo", "deixe ir". O que este app corta é aba de navegador, horário e objeto — nunca vínculo. Quem decide o que é cortado é você.',
      'Não transformar a subtração em adição disfarçada ("tire isso e ponha aquilo no lugar"). O pedido desta fase é só a retirada.',
    ],
  },
];

/**
 * FASES — as quatro quadraturas, congeladas.
 * A ordem do array e a ordem do ciclo: indice 0 e o quarto 1.
 */
export const FASES = congelar(FASES_BASE);

/* Mapa de acesso direto por id. Montado a partir de FASES, nunca digitado duas
 * vezes: duas tabelas que podem discordar acabam discordando. */
const POR_ID = Object.freeze(
  FASES.reduce((mapa, f) => {
    mapa[f.id] = f;
    return mapa;
  }, Object.create(null))
);

/* Normaliza para casar nome com e sem acento, com e sem caixa. So para BUSCA:
 * nenhum texto de tela passa por aqui, e nenhum nome canonico e reescrito. */
function chave(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

const POR_CHAVE = Object.freeze(
  FASES.reduce((mapa, f) => {
    mapa[chave(f.id)] = f;
    mapa[chave(f.fase)] = f;
    mapa[chave(f.tom)] = f;
    return mapa;
  }, Object.create(null))
);

/**
 * A fase pelo nome. Aceita o `id` ('cheiaAMinguante'), o nome completo
 * ('Lua Cheia a Quarto Minguante') ou o `tom` ('O que já dá para ver'),
 * com ou sem acento, em qualquer caixa.
 *
 * Devolve undefined para nome desconhecido — nunca lanca, e nunca devolve uma
 * fase "parecida". Fase errada com cara de certa e como se fabrica ceu por
 * engano: a tela mostraria um tom de semana que a lua nao esta fazendo.
 */
export function fasePorNome(nome) {
  if (typeof nome !== 'string') return undefined;
  return POR_CHAVE[chave(nome)];
}

/** A fase pela posicao no ciclo (1 a 4). undefined fora do intervalo. */
export function fasePorQuarto(quarto) {
  return FASES.find((f) => f.quarto === quarto);
}

/**
 * A FASE DE UM DIA, a partir da elongacao Lua-Sol em graus — que e o campo
 * `lua.fase.elongacao` de lib/ceu.js:ceuDoDia.
 *
 * ESTA E A UNICA ROTA CORRETA, e a alternativa obvia esta ERRADA: agrupar os
 * oito ROTULOS de lib/ceu.js em pares (Nova+Crescente, Quarto Crescente+Gibosa
 * Crescente, ...) parece dar as quatro quadraturas e nao da. O rotulo e uma
 * fatia de 45 graus CENTRADA no multiplo de 45, entao a fatia "Quarto
 * Crescente" cobre de 67,5 a 112,5 graus — ela atravessa a fronteira dos 90
 * graus, que e justamente onde o quarto 1 acaba e o quarto 2 comeca. Agrupar
 * rotulo erraria o tom da semana em ate ~1,8 dia por virada, quatro vezes por
 * lunacao, sempre para o mesmo lado.
 *
 * Sem elongacao medida nao ha fase: devolve undefined, e a tela fica CALADA
 * sobre a lua. Nunca "aproximadamente minguante". Mesma regra de lib/ceu.js —
 * o dia continua inteiro por aritmetica; o que some e a justificativa lunar.
 */
export function fasePorElongacao(graus) {
  if (typeof graus !== 'number' || !Number.isFinite(graus)) return undefined;
  const lon = ((graus % 360) + 360) % 360;
  return FASES[Math.min(3, Math.floor(lon / 90))];
}

/** 4. Ninguem digita o numero na tela nem no motor. */
export const TOTAL_FASES = FASES.length;

export default {
  FASES,
  TOTAL_FASES,
  FONTE_QUATRO_QUARTOS,
  FONTE_OITO_FASES,
  fasePorNome,
  fasePorQuarto,
  fasePorElongacao,
};

/* Acesso por id exportado por ultimo, porque e conveniencia e nao contrato:
 * quem tem o id ja pode usar fasePorNome. */
export const FASES_POR_ID = POR_ID;
