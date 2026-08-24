// =============================================================================
// A VOZ DO TARÔ — o portão que impede o genérico de voltar
// =============================================================================
// Este arquivo existe por causa de uma frase do dono do app:
//
//   "eu tava tirando o tarot de cartas, muito genérico as cartas tiradas, ele
//    não é impactante e incisivo, fica enrolando linguiça"
//
// O defeito não era de gosto, era mensurável: a leitura era montada a partir
// de um punhado de frases-molde, e a carta sorteada só trocava o miolo. O teste
// abaixo transforma "genérico" num número, declara o teto desse número e quebra
// o build quando ele sobe.
//
// -----------------------------------------------------------------------------
// A MÉTRICA, declarada
// -----------------------------------------------------------------------------
// SOBREPOSIÇÃO(A, B) = maior fração dos 4-gramas de palavras de um texto que
// também aparecem no outro (contenção nas duas direções, fica a maior).
// Texto normalizado: minúsculas, sem acento, sem pontuação.
//
// 4-gramas e não palavras soltas de propósito: "amor", "carta" e "Golden Dawn"
// SE REPETEM legitimamente entre cartas. O que não pode se repetir é a
// SEQUÊNCIA — quatro palavras na mesma ordem em duas cartas diferentes é
// moldura, não leitura.
//
// A comparação é sempre entre duas cartas DIFERENTES no MESMO tema, na MESMA
// casa e na MESMA orientação — que é exatamente o teste que o dono descreveu:
// troque a carta e leia de novo; se o texto continuar servindo, ele não dizia
// nada. São 78 × 77 / 2 pares × 5 temas × 3 casas × 2 orientações = 90.090
// comparações. O universo inteiro, não uma amostra.
//
// -----------------------------------------------------------------------------
// OS NÚMEROS QUE JUSTIFICAM CADA TETO (medidos em 31/07/2026)
// -----------------------------------------------------------------------------
//                              ANTES desta passagem   DEPOIS   TETO AQUI
//   pior par do baralho              0,541             0,452     0,50
//   percentil 99 dos pares           0,453             0,358     0,40
//   média de todos os pares          0,233             0,150     0,19
//   mesma carta, pior caso           0,899             0,718     0,78
//   mesma carta, média               0,857             0,585     0,68
//
// Repare nas duas últimas linhas, que são as mais graves: ANTES, a mesma carta
// em duas casas diferentes dividia em média 86% do texto — a casa era um rabicho
// colado no fim. E na TELA do app o número era 1,000, porque
// screens/TarotScreen.js chamava getThemedMeaning sem passar a casa: as três
// leituras da tiragem saíam literalmente idênticas embaixo de três rótulos
// diferentes.
//
// O teto da mesma carta é o mais alto de todos (0,78), e isso é deliberado: é a
// MESMA carta. A cena desenhada nela e o significado dela têm de aparecer nas
// três casas — mudar isso seria trocar de carta, não de casa. O que a casa muda
// é o enunciado, o recorte dos dados tradicionais e a existência do conselho.
//
// Cada teto está acima do valor de hoje (folga para o texto evoluir) e ABAIXO
// do valor de ontem (a implementação anterior reprova nos quatro). É isso que
// faz deste um portão de regressão e não um enfeite: voltar ao estilo antigo
// derruba o build.
//
// -----------------------------------------------------------------------------
// TERCEIRA PASSAGEM (31/07/2026) — o buraco que este teste tinha, e o tapa
// -----------------------------------------------------------------------------
// Uma auditoria cética leu 30 tiragens como usuário e achou molde que este
// arquivo, com 90.090 comparações, deixava passar. Vale entender por quê, para
// não repetir: o teste de estrutura media FRASE INTEIRA repetida em 3+ cartas, e
// o molde que sobrou era todo SUB-FRASE.
//
// O caso: "um Arcano Maior põe em jogo o eixo da relação, não o episódio" —
// doze palavras iguais nos 22 Arcanos Maiores, dentro de uma frase que terminava
// no nome e no número da carta. Frase inteira? Diferente em cada arcano. Molde?
// Óbvio — e o cabeçalho de lib/tarotThemes.js já usava exatamente essa
// afirmação como EXEMPLO do defeito que ele dizia ter consertado.
//
// O PORTÃO NOVO mede sequência de SEIS palavras dentro da frase. Se uma
// sequência de seis palavras aparece em cinco cartas ou mais, ela tem de estar
// declarada — ou como TEXTO DE NAIPE (descreve o naipe, não a carta, e por isso
// vale para as 14) ou como ressalva de doutrina. Não há terceira categoria.
//
// -----------------------------------------------------------------------------
// POR QUE DOIS TETOS SUBIRAM, e não é para acomodar regressão
// -----------------------------------------------------------------------------
// A mesma passagem cortou a leitura de 82 para 65 palavras — tirou a lista de
// keywords que o uprightMeaning já repetia (em 61 das 78 cartas), tirou "Agora,
// sem rodeio:" das 78, e tirou três ressalvas que vinham coladas carta a carta.
//
// Consequência aritmética: a SOBREPOSIÇÃO É UMA FRAÇÃO. O que separava a mesma
// carta em duas casas era, em boa parte, justamente aquela moldura — e ela era
// moldura genérica entre CARTAS ao mesmo tempo em que era diferença entre CASAS.
// Tirando 17 palavras compartilhadas do denominador, a fração entre casas sobe
// mesmo sem nenhuma perda de conteúdo próprio de casa. Os dois efeitos, medidos:
//
//                              2ª passagem   3ª passagem   TETO AQUI
//   pior par do baralho            0,452        0,355        0,40   ↓ mais duro
//   percentil 99 dos pares         0,358        0,290        0,33   ↓ mais duro
//   média de todos os pares        0,150        0,074        0,09   ↓ mais duro
//   mesma carta, pior caso         0,718        0,852        0,88   ↑ ver abaixo
//   mesma carta, média             0,585        0,688        0,72   ↑ ver abaixo
//   palavras por leitura              82           65          —
//
// Encher o texto de novo para o número entre casas voltar a cair seria otimizar
// a métrica contra o leitor — e é o erro que a seção seguinte deste cabeçalho já
// avisava, só que no sentido inverso. Em vez disso entrou uma medida que NÃO
// depende do tamanho do texto: quantos 4-gramas cada casa tem que a outra não
// tem, em número absoluto. Uma leitura curta com conteúdo próprio de casa passa;
// a leitura de 25/07, em que a tela nem passava a casa, tinha ZERO e reprovava.
// Hoje o pior caso do baralho é 9. O piso é 6.
// -----------------------------------------------------------------------------
// O QUE ESTE TESTE NÃO CONSEGUE FAZER, dito na cara
// -----------------------------------------------------------------------------
// Um número não sabe se o texto é BOM. Dá para baixar a métrica escrevendo
// frases curtas e sem sentido. Por isso a segunda metade do arquivo checa
// SUBSTÂNCIA: que toda leitura carrega a cena desenhada na carta, que carrega
// os dados tradicionais exclusivos dela, que a casa do Passado não dá conselho,
// que carta dura diz a coisa dura sem suavizar, que a invertida não é o oposto
// simples, e que nada disso vira alegação de saúde nem promessa de futuro.
//
// Base de tradição: docs/tradicao/05-taro-historia-e-leitura.md.
// =============================================================================

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getThemedMeaning,
  getWaiteNote,
  getCardElement,
  getElementalDignity,
  THEME_KEYS,
  POSITION_KEYS,
} = require('../lib/tarotThemes.js');
const { TAROT_DECK, getCardById, getSpreadPattern } = require('../lib/tarotDeck.js');

// ---------------------------------------------------------------------------
// A métrica
// ---------------------------------------------------------------------------
const N_GRAMA = 4;

function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function gramas(texto) {
  const palavras = normalizar(texto);
  const conjunto = new Set();
  for (let i = 0; i + N_GRAMA <= palavras.length; i += 1) {
    conjunto.add(palavras.slice(i, i + N_GRAMA).join(' '));
  }
  return conjunto;
}

function contencao(a, b) {
  if (!a.size) return 0;
  let dentro = 0;
  for (const g of a) if (b.has(g)) dentro += 1;
  return dentro / a.size;
}

function sobreposicao(textoA, textoB) {
  const a = gramas(textoA);
  const b = gramas(textoB);
  return Math.max(contencao(a, b), contencao(b, a));
}

// Varredura completa, calculada uma vez e reaproveitada pelos três testes de
// número (são 90.090 pares; refazer a conta três vezes seria desperdício).
let _pares = null;
function todosOsPares() {
  if (_pares) return _pares;
  const valores = [];
  let pior = { v: -1 };
  for (const tema of THEME_KEYS) {
    for (const casa of POSITION_KEYS) {
      for (const invertida of [false, true]) {
        const textos = TAROT_DECK.map((carta) => ({
          carta,
          g: gramas(getThemedMeaning(carta, tema, invertida, casa)),
        }));
        for (let i = 0; i < textos.length; i += 1) {
          for (let j = i + 1; j < textos.length; j += 1) {
            const v = Math.max(
              contencao(textos[i].g, textos[j].g),
              contencao(textos[j].g, textos[i].g)
            );
            valores.push(v);
            if (v > pior.v) {
              pior = { v, a: textos[i].carta.name, b: textos[j].carta.name, tema, casa, invertida };
            }
          }
        }
      }
    }
  }
  valores.sort((x, y) => y - x);
  _pares = {
    valores,
    pior,
    media: valores.reduce((s, v) => s + v, 0) / valores.length,
    p99: valores[Math.floor(valores.length * 0.01)],
  };
  return _pares;
}

const TETO_PIOR_PAR = 0.40;
const TETO_P99 = 0.33;
const TETO_MEDIA = 0.09;
const TETO_MESMA_CARTA_OUTRA_CASA = 0.88;
const TETO_MESMA_CARTA_MEDIA = 0.72;

// A medida que NÃO depende do tamanho do texto: quantos 4-gramas a leitura de
// uma casa tem que a leitura da outra casa não tem, em número absoluto, nas duas
// direções. É ela que garante o que a fração prometia e deixou de garantir
// quando o texto encurtou: que a casa chega no texto. Medido hoje: mínimo 9 no
// baralho inteiro. Com o bug de 25/07 (a tela não passava a casa) seria 0.
const PISO_4GRAMAS_EXCLUSIVOS_POR_CASA = 6;

// O TESTE DA TROCA APLICADO AO TEMA, que este arquivo nunca mediu — e é a
// dívida conhecida desta tela, não uma conquista.
//
// Mesma carta, mesma casa, temas diferentes: a sobreposição MEDIANA é de 0,82.
// Quem pergunta de Amor e quem pergunta de Dinheiro lê quase o mesmo texto,
// porque a carta tem UM uprightMeaning e UM conselho e o tema só troca o
// território do naipe. O piso absoluto é 3 4-gramas próprios de tema (medido
// hoje: 5), e ele existe para provar o mínimo: que o tema chega no texto.
//
// POR QUE ISTO ENTRA COMO TETO E NÃO COMO CONSERTO: baixar de verdade exige
// conteúdo por carta E por tema — 78 × 5 = 390 leituras escritas na tradição.
// Simular a diferença com uma moldura de 20 células (uma por naipe × tema) faria
// o número cair e seria o mesmo erro dos 25 moldes de 30/07 e do molde dos 22
// Maiores de 31/07. O teto trava a piora; o conserto está escrito como dívida no
// cabeçalho de lib/tarotThemes.js.
const TETO_TROCA_TEMA_PIOR = 0.95;
const TETO_TROCA_TEMA_MEDIANA = 0.86;
const PISO_4GRAMAS_EXCLUSIVOS_POR_TEMA = 3;

// ---------------------------------------------------------------------------
// 1. OS NÚMEROS
// ---------------------------------------------------------------------------

test('nenhum par de cartas diferentes passa do teto de sobreposição', () => {
  const { pior } = todosOsPares();
  assert.ok(
    pior.v <= TETO_PIOR_PAR,
    `Voltou moldura compartilhada. Pior par: ${pior.v.toFixed(3)} (teto ${TETO_PIOR_PAR}) ` +
      `entre "${pior.a}" e "${pior.b}" em ${pior.tema}/${pior.casa}` +
      `${pior.invertida ? '/invertida' : ''}. ` +
      'Duas cartas diferentes estão dizendo a mesma coisa com o mesmo desenho de frase.'
  );
});

test('o percentil 99 dos pares fica abaixo do teto', () => {
  const { p99 } = todosOsPares();
  assert.ok(
    p99 <= TETO_P99,
    `p99 = ${p99.toFixed(3)} (teto ${TETO_P99}). O pior par pode ser exceção; o p99 não. ` +
      'Se ele subiu, a moldura voltou no atacado.'
  );
});

test('a média de sobreposição do baralho inteiro fica abaixo do teto', () => {
  const { media } = todosOsPares();
  assert.ok(
    media <= TETO_MEDIA,
    `média = ${media.toFixed(4)} (teto ${TETO_MEDIA}). É a medida mais difícil de enganar: ` +
      'ela só sobe quando o texto genérico é distribuído por todas as cartas.'
  );
});

test('a mesma carta lê diferente em cada casa da tiragem', () => {
  // "A posição faz parte do significado" é a afirmação mais antiga e mais
  // segura da leitura documentada (Etteilla, 1770/1783; Waite, 1911) —
  // docs/tradicao/05, §3.1. Se este teste falhar, a casa virou rótulo de novo.
  let pior = { v: -1 };
  const valores = [];
  for (const carta of TAROT_DECK) {
    for (const tema of THEME_KEYS) {
      for (const invertida of [false, true]) {
        for (let i = 0; i < POSITION_KEYS.length; i += 1) {
          for (let j = i + 1; j < POSITION_KEYS.length; j += 1) {
            const v = sobreposicao(
              getThemedMeaning(carta, tema, invertida, POSITION_KEYS[i]),
              getThemedMeaning(carta, tema, invertida, POSITION_KEYS[j])
            );
            valores.push(v);
            if (v > pior.v) pior = { v, carta: carta.name, tema, a: POSITION_KEYS[i], b: POSITION_KEYS[j] };
          }
        }
      }
    }
  }
  const media = valores.reduce((s, v) => s + v, 0) / valores.length;
  assert.ok(
    pior.v <= TETO_MESMA_CARTA_OUTRA_CASA,
    `${pior.carta} lê quase igual em ${pior.a} e ${pior.b} (${pior.v.toFixed(3)}, teto ` +
      `${TETO_MESMA_CARTA_OUTRA_CASA}). A casa voltou a ser enfeite em cima da carta.`
  );
  assert.ok(
    media <= TETO_MESMA_CARTA_MEDIA,
    `média de ${media.toFixed(3)} entre casas (teto ${TETO_MESMA_CARTA_MEDIA}). ` +
      'No baralho inteiro a casa parou de mudar a leitura.'
  );
});

function exclusivos(a, b) {
  let n = 0;
  for (const g of a) if (!b.has(g)) n += 1;
  return n;
}

test('cada casa tem conteúdo próprio em número absoluto, não só em proporção', () => {
  // A fração acima é sensível ao TAMANHO do texto: encurtar a leitura (que é o
  // que o dono pediu) faz a fração subir sem que a casa perca nada de próprio.
  // Esta medida não tem esse defeito — conta 4-gramas exclusivos, um a um, nas
  // duas direções. É a que reprova de verdade o bug original, em que a tela
  // chamava getThemedMeaning sem a casa e as três leituras saíam idênticas: ali
  // o número seria 0.
  let pior = { n: Infinity };
  for (const carta of TAROT_DECK) {
    for (const tema of THEME_KEYS) {
      for (const invertida of [false, true]) {
        for (let i = 0; i < POSITION_KEYS.length; i += 1) {
          for (let j = i + 1; j < POSITION_KEYS.length; j += 1) {
            const a = gramas(getThemedMeaning(carta, tema, invertida, POSITION_KEYS[i]));
            const b = gramas(getThemedMeaning(carta, tema, invertida, POSITION_KEYS[j]));
            const n = Math.min(exclusivos(a, b), exclusivos(b, a));
            if (n < pior.n) {
              pior = { n, carta: carta.name, tema, a: POSITION_KEYS[i], b: POSITION_KEYS[j], invertida };
            }
          }
        }
      }
    }
  }
  assert.ok(
    pior.n >= PISO_4GRAMAS_EXCLUSIVOS_POR_CASA,
    `${pior.carta} em ${pior.a} × ${pior.b} (${pior.tema}${pior.invertida ? '/invertida' : ''}) ` +
      `tem só ${pior.n} 4-gramas próprios de casa (piso ${PISO_4GRAMAS_EXCLUSIVOS_POR_CASA}). ` +
      'A casa virou rótulo: ela precisa mudar o que a carta DIZ, não só onde ela aparece.'
  );
});

test('o teste da troca aplicado ao TEMA — e o número é ruim, de propósito medido', () => {
  // Troque o tema e leia de novo: se o texto continuar servindo, o seletor de
  // tema é decoração. Hoje ele quase é — mediana de 0,82 —, e este teste existe
  // para (a) travar a piora e (b) manter o número visível em vez de escondido.
  // A leitura completa desta dívida está junto dos tetos, lá em cima.
  const valores = [];
  let pior = { v: -1 };
  let piorExclusivo = { n: Infinity };
  for (const carta of TAROT_DECK) {
    for (const casa of POSITION_KEYS) {
      for (let i = 0; i < THEME_KEYS.length; i += 1) {
        for (let j = i + 1; j < THEME_KEYS.length; j += 1) {
          const ta = getThemedMeaning(carta, THEME_KEYS[i], false, casa);
          const tb = getThemedMeaning(carta, THEME_KEYS[j], false, casa);
          const v = sobreposicao(ta, tb);
          valores.push(v);
          if (v > pior.v) pior = { v, carta: carta.name, casa, a: THEME_KEYS[i], b: THEME_KEYS[j] };
          const n = Math.min(exclusivos(gramas(ta), gramas(tb)), exclusivos(gramas(tb), gramas(ta)));
          if (n < piorExclusivo.n) {
            piorExclusivo = { n, carta: carta.name, casa, a: THEME_KEYS[i], b: THEME_KEYS[j] };
          }
        }
      }
    }
  }
  valores.sort((x, y) => y - x);
  const mediana = valores[Math.floor(valores.length / 2)];

  assert.ok(
    pior.v <= TETO_TROCA_TEMA_PIOR,
    `${pior.carta} em ${pior.casa} lê igual em ${pior.a} e ${pior.b} ` +
      `(${pior.v.toFixed(3)}, teto ${TETO_TROCA_TEMA_PIOR}).`
  );
  assert.ok(
    mediana <= TETO_TROCA_TEMA_MEDIANA,
    `mediana da troca de tema = ${mediana.toFixed(3)} (teto ${TETO_TROCA_TEMA_MEDIANA}). ` +
      'O seletor de tema está virando enfeite no atacado.'
  );
  assert.ok(
    piorExclusivo.n >= PISO_4GRAMAS_EXCLUSIVOS_POR_TEMA,
    `${piorExclusivo.carta} em ${piorExclusivo.casa}: só ${piorExclusivo.n} 4-gramas separam ` +
      `${piorExclusivo.a} de ${piorExclusivo.b} (piso ${PISO_4GRAMAS_EXCLUSIVOS_POR_TEMA}). ` +
      'Neste par o tema não chega no texto de jeito nenhum.'
  );
});

// ---------------------------------------------------------------------------
// 2. A ESTRUTURA — frase que serve para qualquer carta
// ---------------------------------------------------------------------------

// Existem exatamente duas frases que o app repete de propósito em todas as
// cartas, e as duas são ressalvas de doutrina, não interpretação:
//   • "É terreno, não notícia."      — a casa do Passado é descritiva.
//   • "Vetor, não fato consumado."   — a casa do Futuro não promete evento.
// A segunda é a mais importante do app inteiro: é ela que impede a leitura de
// virar previsão. Ela PRECISA ser idêntica sempre, e por isso está declarada.
const MOLDURA_DECLARADA = ['É terreno, não notícia.', 'Vetor, não fato consumado.'];
const LIMITE_PALAVRAS_MOLDURA = 6;

// A SEGUNDA — e última — categoria de texto compartilhado: a frase que descreve
// o NAIPE dentro do tema. Ela é igual nas 14 cartas de um naipe porque o que ela
// descreve é o naipe, e não a carta; a carta fala nas outras quatro frases. São
// exatamente 4 naipes × 5 temas = 20 frases, e a forma delas é fixa e conferida
// abaixo: abre pelo tema, nomeia o naipe, diz o território, e acaba.
//
// Isto é uma concessão declarada, não uma brecha: sem ela o tema não apareceria
// em lugar nenhum da leitura das 56 menores. O preço está medido no teste da
// troca de tema, e o limite de palavras impede que ela cresça e vire leitura.
const LIMITE_PALAVRAS_TEXTO_DE_NAIPE = 14;
const NAIPES_ESPERADOS = ['Paus', 'Copas', 'Espadas', 'Ouros'];

function frasesDeNaipe() {
  // Extraídas do texto real, não copiadas à mão: uma cópia à mão sai de sincronia
  // com lib/tarotThemes.js na primeira revisão e o teste passa a aprovar o que
  // não existe mais.
  const achadas = new Set();
  for (const carta of TAROT_DECK) {
    if (!carta.suit) continue;
    for (const tema of THEME_KEYS) {
      for (const casa of POSITION_KEYS) {
        for (const frase of getThemedMeaning(carta, tema, false, casa).split(/(?<=[.!?])\s+/)) {
          if (/^(No amor|Na carreira|Nas finanças|Na energia|Na saúde), (Paus|Copas|Espadas|Ouros) cobre /.test(frase.trim())) {
            achadas.add(frase.trim());
          }
        }
      }
    }
  }
  return achadas;
}

test('o texto de naipe é 4 × 5, curto, e não cresce para virar leitura', () => {
  const frases = [...frasesDeNaipe()];
  assert.equal(
    frases.length,
    20,
    `o texto de naipe deveria ser 4 naipes × 5 temas = 20 frases, e são ${frases.length}. ` +
      'Se apareceu uma 21ª, alguém começou a escrever leitura dentro da frase do naipe.'
  );
  for (const naipe of NAIPES_ESPERADOS) {
    assert.equal(
      frases.filter((f) => f.includes(`, ${naipe} cobre `)).length,
      5,
      `${naipe} não tem exatamente uma frase de território por tema.`
    );
  }
  for (const f of frases) {
    const palavras = f.split(/\s+/).length;
    assert.ok(
      palavras <= LIMITE_PALAVRAS_TEXTO_DE_NAIPE,
      `"${f}" tem ${palavras} palavras (limite ${LIMITE_PALAVRAS_TEXTO_DE_NAIPE}). ` +
        'Texto de naipe é rótulo de território. Passou disso, virou leitura — e leitura ' +
        'compartilhada por 14 cartas é exatamente o defeito que este arquivo persegue.'
    );
  }
});

test('nenhuma frase longa é compartilhada por três cartas ou mais', () => {
  const porFrase = new Map();
  for (const tema of THEME_KEYS) {
    for (const casa of POSITION_KEYS) {
      for (const invertida of [false, true]) {
        for (const carta of TAROT_DECK) {
          const frases = getThemedMeaning(carta, tema, invertida, casa)
            .split(/(?<=[.!?])\s+/)
            .map((f) => f.trim())
            .filter(Boolean);
          for (const frase of frases) {
            if (!porFrase.has(frase)) porFrase.set(frase, new Set());
            porFrase.get(frase).add(carta.id);
          }
        }
      }
    }
  }

  const compartilhadas = [...porFrase.entries()]
    .filter(([, ids]) => ids.size >= 3)
    .map(([frase, ids]) => ({ frase, cartas: ids.size, palavras: frase.split(/\s+/).length }));

  const naipe = frasesDeNaipe();

  for (const item of compartilhadas) {
    if (naipe.has(item.frase)) continue; // texto de naipe: declarado e conferido acima
    const declarada = MOLDURA_DECLARADA.includes(item.frase);
    assert.ok(
      declarada,
      `Frase idêntica em ${item.cartas} cartas e não declarada como ressalva de ` +
        `doutrina: "${item.frase}". Se ela serve para ${item.cartas} cartas, ela não ` +
        'diz nada sobre nenhuma. Ou some com ela, ou entra em MOLDURA_DECLARADA — ' +
        'e entrar lá é assumir por escrito que é ressalva, não leitura.'
    );
    assert.ok(
      item.palavras <= LIMITE_PALAVRAS_MOLDURA,
      `A ressalva "${item.frase}" tem ${item.palavras} palavras (limite ` +
        `${LIMITE_PALAVRAS_MOLDURA}). Ressalva de doutrina é curta; frase longa ` +
        'repetida em todas as cartas é enrolação.'
    );
  }

  assert.ok(
    MOLDURA_DECLARADA.length <= 3,
    'A lista de moldura declarada virou depósito. Três é o teto.'
  );
});

// ---------------------------------------------------------------------------
// 2b. O PORTÃO QUE FALTAVA — molde de SUB-FRASE
// ---------------------------------------------------------------------------
// O teste acima olha frase inteira, e foi por isso que ele deixou passar, em
// duas reescritas seguidas, as doze palavras "um Arcano Maior põe em jogo o eixo
// da relação, não o episódio" repetidas nos 22 Arcanos Maiores: a frase toda
// terminava no nome e no número de cada carta, então nunca era idêntica.
//
// Aqui a unidade é a sequência de SEIS palavras dentro de uma frase (nunca
// atravessando o ponto final — molde é uma construção, não uma coincidência de
// vizinhança). Seis e não quatro porque quatro pega colocação normal do
// português; seis já é desenho de frase.
//
// Cinco cartas é o corte, e ele tem motivo: a leitura do GRAU (RANK_ROLE, "o
// grau da crise…") é a mesma para os quatro Cincos porque o grau é o mesmo nos
// quatro elementos — isso é doutrina do Book T, aparece em exatamente 4 cartas,
// e tem de continuar passando. Em 5 já não há justificativa estrutural.
const N_GRAMA_MOLDE = 6;
const MAX_CARTAS_POR_SEQUENCIA = 4;

test('nenhuma sequência de seis palavras é compartilhada por cinco cartas ou mais', () => {
  const naipe = frasesDeNaipe();
  const achados = [];

  for (const tema of THEME_KEYS) {
    for (const casa of POSITION_KEYS) {
      for (const invertida of [false, true]) {
        const porSequencia = new Map();
        for (const carta of TAROT_DECK) {
          const vistas = new Set();
          for (const frase of getThemedMeaning(carta, tema, invertida, casa).split(/(?<=[.!?])\s+/)) {
            const limpa = frase.trim();
            if (!limpa || naipe.has(limpa) || MOLDURA_DECLARADA.includes(limpa)) continue;
            const palavras = normalizar(limpa);
            for (let i = 0; i + N_GRAMA_MOLDE <= palavras.length; i += 1) {
              vistas.add(palavras.slice(i, i + N_GRAMA_MOLDE).join(' '));
            }
          }
          for (const seq of vistas) {
            if (!porSequencia.has(seq)) porSequencia.set(seq, new Set());
            porSequencia.get(seq).add(carta.id);
          }
        }
        for (const [seq, ids] of porSequencia) {
          if (ids.size > MAX_CARTAS_POR_SEQUENCIA) {
            achados.push({ seq, cartas: ids.size, tema, casa, invertida });
          }
        }
      }
    }
  }

  achados.sort((a, b) => b.cartas - a.cartas);
  assert.equal(
    achados.length,
    0,
    achados.length
      ? `Molde de sub-frase de volta. Pior: "${achados[0].seq}" em ${achados[0].cartas} cartas ` +
          `(${achados[0].tema}/${achados[0].casa}${achados[0].invertida ? '/invertida' : ''}), ` +
          `e ao todo ${achados.length} sequências passam de ${MAX_CARTAS_POR_SEQUENCIA} cartas. ` +
          'Seis palavras iguais em cinco cartas é desenho de frase compartilhado: a carta parou ' +
          'de falar e a moldura voltou a falar por ela. Ou o texto vira específico, ou a frase ' +
          'entra em MOLDURA_DECLARADA (com no máximo 6 palavras) — não há terceira saída.'
      : ''
  );
});

// ---------------------------------------------------------------------------
// 3. A SUBSTÂNCIA — o número não sabe se o texto é bom; isto sabe um pouco
// ---------------------------------------------------------------------------

test('toda leitura fala da cena desenhada NAQUELA carta', () => {
  // O método é o argumento visual: a leitura sai da imagem de Pamela Colman
  // Smith, carta a carta. Sem a cena o texto vira moldura reciclada por naipe.
  for (const carta of TAROT_DECK) {
    assert.ok(carta.cena, `${carta.name} (${carta.id}) está sem cena — as 78 precisam ter.`);
    for (const casa of POSITION_KEYS) {
      const texto = getThemedMeaning(carta, 'Amor', false, casa);
      assert.ok(
        texto.includes(carta.cena),
        `${carta.name} em ${casa}: a leitura não descreve a carta.`
      );
    }
  }
});

test('toda leitura carrega os dados tradicionais exclusivos daquela carta', () => {
  // É o que impede duas cartas de saírem irreconhecíveis uma da outra: nas
  // numeradas o título Golden Dawn e o decanato; nas cortes e nos Ases o
  // elemento composto / a raiz; nos Maiores o número, a letra hebraica e o
  // caminho na Árvore da Vida.
  for (const carta of TAROT_DECK) {
    for (const casa of POSITION_KEYS) {
      const texto = getThemedMeaning(carta, 'Carreira', false, casa);

      if (carta.arcana === 'maior') {
        assert.ok(carta.letra, `${carta.name} está sem letra hebraica.`);
        assert.ok(carta.caminho, `${carta.name} está sem caminho na Árvore da Vida.`);
        // Cada casa puxa um recorte diferente da MESMA grade Golden Dawn: a
        // raiz mostra a letra, o presente mostra o planeta/signo, o futuro
        // mostra o caminho na Árvore da Vida. É esse recorte que faz a casa
        // mudar a leitura de um Arcano Maior sem inventar dado nenhum.
        const esperado = {
          Passado: [`arcano ${carta.number}`, `letra ${carta.letra}`],
          Presente: [`arcano ${carta.number}`, String(carta.element)],
          Futuro: [`caminho ${carta.caminho}`, String(carta.element)],
          Situação: [`arcano ${carta.number}`, `letra ${carta.letra}`],
          Tensão: [`letra ${carta.letra}`, String(carta.element)],
          'Próximo passo': [`arcano ${carta.number}`, `caminho ${carta.caminho}`],
        }[casa];
        for (const trecho of esperado) {
          assert.ok(
            texto.toLowerCase().includes(trecho.toLowerCase()),
            `${carta.name} em ${casa}: falta "${trecho}" na leitura.`
          );
        }
        continue;
      }

      assert.ok(carta.astro, `${carta.name} está sem atribuição Golden Dawn.`);
      assert.ok(
        texto.includes(carta.astro),
        `${carta.name} em ${casa}: a atribuição "${carta.astro}" não aparece na leitura.`
      );
      if (carta.tituloGD && casa !== 'Passado') {
        assert.ok(
          texto.includes(carta.tituloGD),
          `${carta.name} em ${casa}: o título "${carta.tituloGD}" não aparece.`
        );
      }
    }
  }
});

test('quando o app cita astrologia de carta, ele diz de quem é a tabela', () => {
  // Há pelo menos três atribuições incompatíveis (Golden Dawn; continental de
  // Lévi/Papus; Thoth de Crowley). Escrever "a correspondência astrológica do
  // tarô" é esconder uma escolha. docs/tradicao/05, §4.
  for (const carta of TAROT_DECK) {
    for (const tema of THEME_KEYS) {
      for (const casa of POSITION_KEYS) {
        const texto = getThemedMeaning(carta, tema, false, casa);
        assert.ok(
          /Golden Dawn/.test(texto),
          `${carta.name}/${tema}/${casa}: cita atribuição sem nomear a tabela.`
        );
      }
    }
  }
});

test('a casa do Passado descreve e cala; Presente e Futuro é que aconselham', () => {
  // Não se aconselha o que já aconteceu. Em Waite a casa "atrás dele" é
  // descritiva e é na última que ele manda concentrar o juízo. É também o que
  // mais separa as três casas na prática.
  for (const carta of TAROT_DECK) {
    if (!carta.conselho) continue;
    const passado = getThemedMeaning(carta, 'Amor', false, 'Passado');
    const presente = getThemedMeaning(carta, 'Amor', false, 'Presente');
    const futuro = getThemedMeaning(carta, 'Amor', false, 'Futuro');
    assert.ok(!passado.includes(carta.conselho), `${carta.name}: o Passado deu conselho.`);
    assert.ok(presente.includes(carta.conselho), `${carta.name}: o Presente ficou sem conselho.`);
    assert.ok(
      futuro.includes(carta.conselho.slice(1)),
      `${carta.name}: o Futuro ficou sem o conselho que muda o vetor.`
    );
  }
});

test('carta dura diz a coisa dura, sem suavizar e sem apavorar', () => {
  // A tradição descreve tensão, não decreta destino. O registro de Waite para a
  // Torre é uma lista de oito substantivos e ponto; o do Cinco de Copas nomeia
  // a perda inteira ANTES de dizer que duas taças seguem de pé. O que não pode
  // é o app trocar o diagnóstico por consolo — nem transformá-lo em sentença.
  const DURAS = {
    'major-16': ['ruptura', 'derruba'],
    'major-15': ['apego', 'prendem'],
    'espadas-03': ['dor', 'traição'],
    'espadas-10': ['colapso', 'ponto mais baixo'],
    'copas-05': ['perda', 'luto'],
  };
  for (const [id, obrigatorias] of Object.entries(DURAS)) {
    const carta = getCardById(id);
    assert.ok(carta, `carta ${id} sumiu do baralho`);
    for (const tema of THEME_KEYS) {
      for (const casa of POSITION_KEYS) {
        const texto = getThemedMeaning(carta, tema, false, casa).toLowerCase();
        for (const palavra of obrigatorias) {
          assert.ok(
            texto.includes(palavra),
            `${carta.name}/${tema}/${casa} não diz "${palavra}". Carta dura suavizada é mentira.`
          );
        }
      }
    }
  }
});

test('a invertida é a energia travada, e não o oposto simples', () => {
  // Correção de 30/07/2026, preservada: a invertida NÃO afirma as palavras da
  // leitura direta e o corpo do texto é o reversedMeaning da própria carta.
  // Nota de honestidade que o app já assume: ler invertida como bloqueio /
  // excesso / interiorização é escola contemporânea (Gray, Pollack, Greer), não
  // é Waite — em 1911 a invertida costuma ser lateral e às vezes melhor que a
  // direta. docs/tradicao/05, §3.4 e §5 item 12.
  for (const carta of TAROT_DECK) {
    for (const casa of POSITION_KEYS) {
      const texto = getThemedMeaning(carta, 'Energia', true, casa);
      assert.ok(
        texto.includes(carta.reversedMeaning) ||
          texto.includes(carta.reversedMeaning.replace(/\.$/, '')),
        `${carta.name} invertida em ${casa}: não usa o significado invertido da carta.`
      );
      assert.ok(
        !texto.includes(carta.uprightMeaning),
        `${carta.name} invertida em ${casa}: afirma a leitura DIRETA. Invertida não é o direto com aviso.`
      );
      assert.ok(
        /travad/.test(texto),
        `${carta.name} invertida em ${casa}: não nomeia a inversão como energia travada.`
      );
      if (carta.conselhoInvertido) {
        assert.ok(
          !texto.includes(carta.conselho),
          `${carta.name} invertida em ${casa}: usou o conselho da carta direta.`
        );
      }
    }
  }
});

test('a casa do Futuro é vetor, nunca promessa de acontecimento', () => {
  const PROMESSAS = ['você vai', 'vai acontecer', 'com certeza', 'está escrito', 'garantido', 'sem falta'];
  for (const carta of TAROT_DECK) {
    for (const tema of THEME_KEYS) {
      for (const invertida of [false, true]) {
        const texto = getThemedMeaning(carta, tema, invertida, 'Futuro');
        assert.ok(
          /Vetor, não fato consumado\.|Direção, não sentença\./.test(texto),
          `${carta.name}/${tema}: a casa do Futuro perdeu a ressalva de vetor.`
        );
        for (const p of PROMESSAS) {
          assert.ok(
            !texto.toLowerCase().includes(p),
            `${carta.name}/${tema}: o Futuro virou promessa ("${p}").`
          );
        }
      }
    }
  }
});

test('nenhuma leitura de tarô faz alegação de saúde — em nenhum tema', () => {
  // A linha que não se atravessa, igual à de lib/grounding.js e
  // lib/zodiacBody.js. Vale para os cinco temas, e vale com força dobrada no
  // tema Saúde, que é onde a tentação mora. Falhar aqui = não pode publicar.
  const PROIBIDO = [
    'cura', 'curar', 'curam', 'remédio', 'medicament', 'diagnóstic', 'tratamento',
    'terapêut', 'terapia', 'sintoma', 'doença', 'previne', 'prevenir', 'imunidade',
    'melhora o sono', 'reduz a ansiedade', 'alivia a', 'pressão arterial', 'sangria',
  ];
  for (const carta of TAROT_DECK) {
    for (const tema of THEME_KEYS) {
      for (const casa of POSITION_KEYS) {
        for (const invertida of [false, true]) {
          const texto = getThemedMeaning(carta, tema, invertida, casa).toLowerCase();
          for (const termo of PROIBIDO) {
            assert.ok(
              !texto.includes(termo),
              `ALEGAÇÃO DE SAÚDE em ${carta.name}/${tema}/${casa}: "${termo}".`
            );
          }
        }
      }
    }
  }
});

test('o app nunca vende a tiragem de três como antiga, nem repete o mito egípcio', () => {
  // A tiragem de três Passado/Presente/Futuro é popularização do séc. XX: não
  // está em Waite, não está no "Book T", e não há fonte primária datada.
  // docs/tradicao/05, §3.6 e §5 (itens 1 a 4, 16).
  const MITOS = ['clássica', 'egito', 'egípci', 'livro de thoth', 'milenar', '5.000 anos', 'cigano'];
  for (const carta of TAROT_DECK) {
    for (const tema of THEME_KEYS) {
      for (const casa of POSITION_KEYS) {
        const texto = getThemedMeaning(carta, tema, false, casa).toLowerCase();
        for (const mito of MITOS) {
          assert.ok(!texto.includes(mito), `${carta.name}/${tema}/${casa} repete "${mito}".`);
        }
      }
    }
  }

  // BURACO REAL QUE ISTO FECHA (31/07/2026): a varredura acima só olhava a
  // leitura da CARTA. O texto da TIRAGEM inteira passou a ir pra tela em
  // screens/TarotScreen.js na mesma passagem, e ele dizia "na leitura clássica
  // isso pesa mais que cada carta isolada" e "a tradição lê isso como…" — dois
  // rótulos de antiguidade numa leitura transversal que docs/tradicao/05 §3.5
  // marca como [TP], prática consolidada do século XX. O teste passava verde e
  // o mito estava na tela. Agora as duas camadas são varridas.
  const AMOSTRA_TIRAGENS = [
    ['paus-05', 'copas-05', 'espadas-05'],   // grau repetido
    ['major-13', 'major-16', 'copas-06'],    // concentração de Maiores
    ['ouros-02', 'ouros-07', 'ouros-10'],    // naipe dominante
    ['paus-02', 'espadas-05', 'copas-06'],   // dignidade elemental
    ['paus-03', 'major-01', 'ouros-04'],     // Maior planetário no meio
  ];
  for (const ids of AMOSTRA_TIRAGENS) {
    const cartas = ids.map(getCardById);
    for (const texto of [getSpreadPattern(cartas), getElementalDignity(cartas)]) {
      if (!texto) continue;
      const t = texto.toLowerCase();
      for (const mito of MITOS) {
        assert.ok(!t.includes(mito), `a leitura da tiragem [${ids.join(', ')}] repete "${mito}".`);
      }
    }
  }
});

test('a leitura transversal da tiragem se declara do século XX, e a elemental cita o Book T', () => {
  // Duas camadas, duas idades diferentes, e cada uma tem de dizer a sua.
  // docs/tradicao/05 §3.5: dignidades elementares e contagem/emparelhamento
  // são [FP] Golden Dawn; grau repetido, naipe dominante e proporção
  // Maiores × menores são [TP] do séc. XX. Misturar as duas idades numa nota
  // só é exatamente o que faz o usuário achar que comprou tradição antiga.
  const grauRepetido = getSpreadPattern(['paus-05', 'copas-05', 'espadas-05'].map(getCardById));
  assert.ok(/séc\. XX|contemporânea/.test(grauRepetido), 'o grau repetido não datou a própria leitura');

  const muitosMaiores = getSpreadPattern(['major-13', 'major-16', 'copas-06'].map(getCardById));
  assert.ok(
    /contemporânea/.test(muitosMaiores) && !/a tradição lê/.test(muitosMaiores),
    'a proporção de Maiores voltou a se vender como tradição'
  );

  const elemental = getElementalDignity(['paus-02', 'espadas-05', 'copas-06'].map(getCardById));
  assert.ok(/Book T/.test(elemental), 'a dignidade elemental parou de nomear a fonte que ela realmente tem');
});

// ---------------------------------------------------------------------------
// 4. A TIRAGEM INTEIRA — três cartas não são três leituras soltas
// ---------------------------------------------------------------------------

test('a leitura da tríade sai quando a doutrina se aplica, e cala quando não', () => {
  // Regra da tríade do "Book T": a carta do MEIO é a principal e é modificada
  // pelas duas ao lado. Arcano Maior de atribuição planetária no meio fica FORA
  // da regra (a doutrina é sobre os quatro elementos) — e aí a função devolve
  // null em vez de inventar um elemento para Mercúrio.
  const tresEspadas = getCardById('espadas-05');
  const doisPaus = getCardById('paus-02');
  const seisCopas = getCardById('copas-06');
  const nota = getElementalDignity([doisPaus, tresEspadas, seisCopas]);
  assert.ok(nota, 'a tríade com centro de naipe deveria produzir leitura elemental');
  assert.ok(nota.includes(tresEspadas.name), 'a nota tem que nomear a carta do meio');
  assert.ok(/Book T|Mathers/.test(nota), 'a nota tem que dizer de onde vem a regra');

  const mago = getCardById('major-01'); // Mercúrio: planeta, fora da regra
  assert.equal(getCardElement(mago), null, 'atribuição planetária não vira elemento');
  assert.equal(
    getElementalDignity([doisPaus, mago, seisCopas]),
    null,
    'com Maior planetário no meio a função tem que calar, não inventar'
  );
});

test('grau repetido na tiragem é lido, e tiragem sem padrão não inventa padrão', () => {
  const cincos = ['paus-05', 'copas-05', 'espadas-05'].map(getCardById);
  const comPadrao = getSpreadPattern(cincos);
  assert.ok(comPadrao, 'três Cincos têm leitura na tradição e o app precisa dizê-la');
  assert.ok(/grau/i.test(comPadrao), 'a leitura de três Cincos é sobre o grau');

  const semPadrao = [getCardById('paus-02'), getCardById('copas-06'), getCardById('espadas-09')];
  assert.equal(getSpreadPattern(semPadrao), null, 'sem padrão, o app não fabrica padrão');
});

// ---------------------------------------------------------------------------
// 5. A FONTE — Waite verbatim, e a grade da Golden Dawn
// ---------------------------------------------------------------------------

test('a citação de Waite só existe onde foi conferida, e nunca vai solta', () => {
  // 11 das 78. Nas outras 67 o campo é null de propósito: "não encontrei a
  // fonte" é resposta melhor do que uma citação plausível. E onde existe, vem
  // sempre acompanhada da nota que diz o que o app faz com ela — porque em
  // quase todos esses casos a leitura moderna diverge de Waite, e omitir isso
  // seria mentir pelo silêncio.
  const comCitacao = TAROT_DECK.filter((c) => c.waite1911);
  assert.equal(comCitacao.length, 11, 'mudou o conjunto de citações conferidas');

  for (const carta of comCitacao) {
    const nota = getWaiteNote(carta);
    assert.ok(nota.verbatim && nota.verbatim.length > 20, `${carta.name}: verbatim vazio`);
    assert.ok(nota.nota && nota.nota.length > 40, `${carta.name}: citação sem a nota que a enquadra`);
    assert.ok(/1911/.test(nota.titulo), `${carta.name}: a nota não datou a fonte`);
    assert.ok(
      ['direta', 'invertida'].includes(carta.waite1911.orientacao),
      `${carta.name}: a citação não diz a que orientação pertence na lista dele`
    );
  }

  // TRECHO tem de estar marcado como trecho (correção de 31/07/2026). O
  // Eremita era o caso grave: a lista direta dele em Waite ABRE com "Prudence,
  // circumspection" e o app citava só o rabo dela — "treason, dissimulation,
  // roguery, corruption" — afirmando que "a lista de 1911 tem esta cara". A
  // base (docs/tradicao/05, §5.14) diz que o significado direto "INCLUI" essas
  // palavras, não que se resume a elas. Citação aparada no ponto que convém é
  // uma tese disfarçada de fonte, e é o defeito que este arquivo inteiro existe
  // para não deixar entrar.
  const eremita = getCardById('major-09');
  assert.ok(
    eremita.waite1911.verbatim.startsWith('…'),
    'a citação do Eremita voltou a se apresentar como a lista inteira de Waite'
  );
  assert.ok(
    /trecho|inclui/i.test(eremita.waite1911.nota),
    'a nota do Eremita precisa dizer que a citação é um trecho'
  );

  // A Morte e A Estrela precisam estar aqui: são os dois casos em que a leitura
  // moderna INVERTEU a prioridade de Waite, e é justamente onde o app tem de
  // mostrar a costura em vez de escondê-la.
  assert.ok(getWaiteNote(getCardById('major-13')), 'A Morte precisa da citação de 1911');
  assert.ok(getWaiteNote(getCardById('major-17')), 'A Estrela precisa da citação de 1911');

  // E a citação NÃO entra no corpo da leitura: é história do baralho, não é o
  // app dizendo "mortality" sobre a vida de quem consultou.
  const morte = getCardById('major-13');
  for (const casa of POSITION_KEYS) {
    assert.ok(
      !getThemedMeaning(morte, 'Saúde', false, casa).includes('mortality'),
      'a lista de 1911 vazou para dentro da leitura'
    );
  }
});

test('a grade do Sepher Yetzirah é 3 mães, 7 duplas e 12 simples — e são estas', () => {
  // A armadilha registrada em docs/tradicao/05, §4.1: esta coluna está ERRADA
  // em muita tabela que circula, inclusive em páginas que se dizem Golden Dawn.
  // Se alguém "corrigir" o app com uma dessas, este teste quebra.
  const maes = TAROT_DECK.filter((c) => c.classeSY === 'mãe').map((c) => c.letra).sort();
  const duplas = TAROT_DECK.filter((c) => c.classeSY === 'dupla').map((c) => c.letra).sort();
  const simples = TAROT_DECK.filter((c) => c.classeSY === 'simples');

  assert.deepEqual(maes, ['Aleph', 'Mem', 'Shin'].sort());
  assert.deepEqual(duplas, ['Beth', 'Daleth', 'Gimel', 'Kaph', 'Peh', 'Resh', 'Tav'].sort());
  assert.equal(simples.length, 12);

  // Os doze signos caem nas doze simples, em ordem zodiacal natural — é o que
  // torna esta atribuição coerente, e a razão pela qual a Golden Dawn trocou
  // Força VIII com Justiça XI antes do baralho existir.
  const ZODIACO = [
    'áries', 'touro', 'gêmeos', 'câncer', 'leão', 'virgem',
    'libra', 'escorpião', 'sagitário', 'capricórnio', 'aquário', 'peixes',
  ];
  const naOrdem = simples.sort((a, b) => a.number - b.number).map((c) => c.element);
  assert.deepEqual(naOrdem, ZODIACO, 'os signos saíram da ordem zodiacal nas letras simples');

  // Caminhos 11 a 32, um por arcano, sem buraco e sem repetição.
  const caminhos = TAROT_DECK.filter((c) => c.caminho).map((c) => c.caminho).sort((a, b) => a - b);
  assert.deepEqual(caminhos, Array.from({ length: 22 }, (_, i) => i + 11));
});

test('a raiz elemental dos Ases concorda em gênero', () => {
  // Bug real que aparecia na tela: "raiz das forças do Água".
  assert.ok(getCardById('copas-01').astro.includes('da Água'));
  assert.ok(getCardById('ouros-01').astro.includes('da Terra'));
  assert.ok(getCardById('paus-01').astro.includes('do Fogo'));
  assert.ok(getCardById('espadas-01').astro.includes('do Ar'));
});
