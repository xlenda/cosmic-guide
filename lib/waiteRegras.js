// lib/waiteRegras.js
// AS QUATRO REGRAS DE PRÁTICA DE WAITE — o preparo que vem ANTES da tiragem.
//
// ===========================================================================
// O QUE ESTA FEATURE É, EM UMA FRASE
// ===========================================================================
// A. E. Waite anexou ao próprio livro quatro notas de prática — dizer a
// pergunta em voz alta, embaralhar com a mente em branco, pôr o viés de lado,
// e a constatação de que ler para um estranho é mais fácil do que ler para si
// mesmo. Elas cabem exatamente no vão que hoje está vazio: o segundo entre
// escolher o tema e apertar "tirar". O usuário já está esperando de qualquer
// jeito; esta tela transforma a espera em gesto.
//
// Fonte PRIMÁRIA: A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte
// III §8 ("An Alternative Method of Reading the Tarot Cards" — as notas de
// prática que ele anexa ao método). Domínio público.
// Referência interna: docs/tradicao/05-taro-historia-e-leitura.md §3.3 (o
// texto-fonte das quatro), §3.4, §3.6 e §6.2 · docs/tradicao/16 §5.
//
// ===========================================================================
// POR QUE ISTO É UM MÓDULO DE lib/ E NÃO TEXTO SOLTO NA TELA
// ===========================================================================
// Porque texto de tela nasce em um idioma, escapa de teste e apodrece. Aqui
// as quatro regras entram nos três packs desde o primeiro commit, e a linha
// vermelha (saúde, promessa, veredito, aviso defensivo) é varrida por
// test/waiteRegras.test.js nos três — que falha o build. É o mesmo desenho de
// lib/seita.js e lib/zodiacBody.js, e é de propósito.
//
// ===========================================================================
// A DECISÃO MAIS IMPORTANTE DESTE ARQUIVO: NÃO PÔR AS QUATRO ENTRE ASPAS
// ===========================================================================
// Esta base registra as quatro notas em português, marcadas [FP] (doc 05
// §3.3), mas NÃO registra o inglês literal delas no original de 1911. Então o
// app RELATA as quatro — "a primeira nota de prática de Waite é..." — e não as
// apresenta como citação. Aspas aqui seriam uma citação plausível, e citação
// plausível é pior que ausência de citação (é a mesma regra de WAITE_1911 em
// lib/tarotDeck.js, que devolve null em 67 das 78 cartas).
//
// A ÚNICA frase entre aspas neste módulo é a que a base registra verbatim:
// "Shuffle the entire pack and turn some of the cards round, so as to invert
// their tops" — a abertura do mesmo §8. Ela vale ouro porque é o endereço
// exato de onde a CARTA INVERTIDA entra na prática: do método alternativo de
// Waite, não da Cruz Celta dele, que não menciona invertida em lugar nenhum.
// Ver NAO_ACHADO.verbatimDasQuatroNotas.
//
// ===========================================================================
// DUAS MEDIDAS SÃO DO APP, E ESTÃO DECLARADAS ONDE APARECEM
// ===========================================================================
// Waite pede a mente "o mais em branco possível" e não dá duração; pede a
// pergunta "definidamente" e não diz como se mede isso. O app precisa de um
// número nos dois lugares para ter gesto — vinte segundos e quatro palavras.
// Os dois são escolha nossa, ficam em constantes exportadas, e o texto de tela
// diz que são nossos. Mesmo padrão de LIMIAR_LIMITROFE_GRAUS em lib/seita.js:
// número do app se declara como número do app.
//
// ===========================================================================
// O APP NÃO TRANCA O BOTÃO
// ===========================================================================
// Waite chamou os quatro itens de NOTAS DE PRÁTICA, não de condições. Gatear a
// tiragem seria inventar uma regra que a fonte não tem — e inventar rigor é o
// mesmo pecado de inventar antiguidade. progressoDoPreparo() devolve
// `completo` para a tela mudar o rótulo do botão, nunca para desabilitá-lo.
//
// ===========================================================================
// A QUARTA REGRA ACUSA O PRÓPRIO APP, E ISSO FICA NO TEXTO
// ===========================================================================
// Waite diz que ler para um estranho é mais fácil do que ler para si mesmo ou
// para um amigo. Este app faz, na maior parte do tempo, exatamente o caso que
// ele chama de mais difícil. Esconder isso seria a coisa fácil; dizer é a tese
// (docs/tradicao/00-tese.md §2 e §7 — mostrar a discordância é mais forte que
// escondê-la, e honestidade é fosso). O texto da quarta regra diz.
//
// ===========================================================================
// NÃO HÁ CÉU AQUI — E POR ISSO NÃO HÁ CÉU A FABRICAR
// ===========================================================================
// Esta feature não lê data, hora, cidade nem efeméride. Não importa
// lib/signs.js, lib/birthData.js nem astronomy-engine, e test/waiteRegras
// .test.js lê o próprio fonte para garantir que continue assim. O preparo é o
// mesmo para todo mundo: é sobre o que a pessoa faz na cadeira, não sobre onde
// os planetas estavam. Entrada desconhecida devolve null (regraDaTiragem) ou o
// sinal 'vazia' (avaliarPergunta) — nunca um palpite.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string dos packs
// ===========================================================================
// 1. PRENDE PRIMEIRO, FONTE DEPOIS. Toda regra abre em `chamada`, que é vida
//    real e língua de conversa — a briga, a conta de sexta, a mãe perguntando.
//    Waite, o ano e o capítulo só aparecem em `recibo`, que vem depois. O
//    teste reprova nome próprio, ano de quatro dígitos e "§" dentro de
//    qualquer `chamada` e dentro do primeiro parágrafo da `abertura`.
// 2. TODA AFIRMAÇÃO HISTÓRICA CARREGA O LOCUS: obra, autor, ano, parte. O que
//    é leitura do app vem rotulado (notaLeituraDoApp, avaliarPergunta).
// 3. NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita, em nenhum idioma. É regra de
//    PALAVRA: pt aliviar/acalmar/curar/tratar/sarar/energizar; es aliviar/
//    calmar/sanar/curar/tratar; en relieve/soothe/calm/heal/cure/treat. Repare
//    que "acalmar a mente" seria a tentação óbvia da segunda regra — e é
//    justamente por isso que ela não entra: o texto diz o que Waite mandava
//    fazer, não o que o corpo de quem lê vai sentir.
// 4. NADA DE PROMESSA NEM DE VEREDITO. O preparo descreve um gesto, não
//    prevê o resultado da tiragem nem decreta como a pessoa é.
// 5. NENHUM AVISO DEFENSIVO. Os do app foram removidos de propósito; escrever
//    um novo aqui é bug.
//
// ===========================================================================
// OS TRÊS IDIOMAS
// ===========================================================================
// Toda prosa vive em lib/traducoes/waiteRegras.{pt,es,en}.js, com a MESMA
// forma: mesmas chaves, mesmos campos, funções com a mesma assinatura. O que
// NUNCA muda entre eles: o verbatim inglês (traduzir citação é falsificá-la),
// o nome da OBRA (The Pictorial Key to the Tarot continua The Pictorial Key to
// the Tarot em espanhol e em português), os anos, e as CHAVES internas — os
// ids das quatro regras continuam em português nos três packs, porque são
// dados, não texto de tela. Toda função pública tem `lang` com default 'pt'.
//
// A DATAÇÃO passa por lib/traducoes/datacao.js, como em lib/jornada.js: a obra
// não traduz, o autor ganha a forma consagrada de cada língua, e a datação
// ganha a forma da língua ("anos 1890" → "años 1890" → "1890s"; "dezembro de
// 1909" → "diciembre de 1909" → "December 1909"). Nenhum dos quatro autores
// desta feature está no mapa de traduzirAutor — "A. E. Waite" e "Pamela Colman
// Smith" se escrevem igual nos três idiomas —, e o fallback devolvê-los
// intactos é o comportamento certo, não um esquecimento.

import { traduzirAutor, traduzirQuando } from './traducoes/datacao';
import { PACK as PACK_PT } from './traducoes/waiteRegras.pt.js';
import { PACK as PACK_ES } from './traducoes/waiteRegras.es.js';
import { PACK as PACK_EN } from './traducoes/waiteRegras.en.js';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma fora dos três cai no PT — o mesmo fallback de lib/i18n.js e de
// lib/seita.js, e o que garante que chamada sem `lang` nunca quebre.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// 1. AS QUATRO, NA ORDEM EM QUE WAITE AS ESCREVEU
// ---------------------------------------------------------------------------
// A ordem é dele e não se mexe: a pergunta vem antes do embaralho, o viés
// antes da leitura, e a nota sobre o estranho fecha a lista porque é a
// consequência das outras três (é o "por isso" do texto: por causa do viés, é
// mais fácil para um estranho).
export const ORDEM_DAS_REGRAS = ['pergunta', 'embaralhar', 'vies', 'estranho'];

// Os dois números do app. Ver "DUAS MEDIDAS SÃO DO APP" no cabeçalho.
export const SEGUNDOS_DO_EMBARALHO = 20;
export const MINIMO_DE_PALAVRAS = 4;

// Dados estruturais de cada regra — o que a TELA precisa para escolher a
// interface, sem ler texto. `gesto` é o tipo de afordância; `pedeTexto` marca
// a única que precisa de campo de digitação; `segundos` só existe onde há
// contagem.
export const REGRAS = {
  pergunta: { ordem: 1, gesto: 'dizer', segundos: null, pedeTexto: true },
  embaralhar: { ordem: 2, gesto: 'esperar', segundos: SEGUNDOS_DO_EMBARALHO, pedeTexto: false },
  vies: { ordem: 3, gesto: 'dizer', segundos: null, pedeTexto: false },
  estranho: { ordem: 4, gesto: 'trocar-de-lugar', segundos: null, pedeTexto: false },
};

// Para quem é a leitura. Muda só a quarta regra — é a única em que a fonte
// distingue os casos. Default 'voce', que é o que o app faz quase sempre.
export const PARA_QUEM = ['voce', 'outra'];

// ---------------------------------------------------------------------------
// 2. A DATAÇÃO — obra, autor, quando. PT canônico; a tradução é no acesso.
// ---------------------------------------------------------------------------
// `obra` é nome próprio de coisa e NUNCA traduz. `autor` passa por
// traduzirAutor (e volta intacto, porque nenhum destes quatro tem forma
// consagrada diferente por língua). `quando` passa por traduzirQuando, e aí
// sim muda: "dezembro de 1909" e "anos 1890" saem diferentes nos três.
// `obra: null` onde a base não registra um título — Etteilla está datado em
// doc 05 §3.4 pelo ano, não por uma obra específica, e inventar o título seria
// exatamente o erro que este módulo existe para não cometer.
export const DATACOES = {
  pictorialKey: { obra: 'The Pictorial Key to the Tarot', autor: 'A. E. Waite', quando: '1911', grau: 'FP' },
  baralhoRWS: { obra: 'Rider-Waite-Smith', autor: 'Pamela Colman Smith', quando: 'dezembro de 1909', grau: 'FP' },
  etteilla: { obra: null, autor: 'Etteilla', quando: '1770', grau: 'FP' },
  cruzCelta: { obra: null, autor: 'Hermetic Order of the Golden Dawn', quando: 'anos 1890', grau: 'TP' },
};

export const ORDEM_DAS_DATACOES = ['pictorialKey', 'baralhoRWS', 'etteilla', 'cruzCelta'];

// Os graus de origem da base (docs/tradicao/00-LEIA-PRIMEIRO.md). Esta feature
// só cita dois — fonte primária e tradição posterior —, então só dois entram:
// rótulo que nenhuma entrada usa é string morta esperando virar erro.
export const GRAUS = ['FP', 'TP'];

// ---------------------------------------------------------------------------
// 3. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/seita.js e lib/synastry.js: declarar o
// buraco impede que a próxima pessoa a editar o preencha com a versão que
// circula por aí. É registro de pesquisa, não é renderizado em tela — por isso
// fica no motor e em PT.
export const NAO_ACHADO = [
  {
    id: 'verbatimDasQuatroNotas',
    texto:
      'O inglês literal das quatro notas de prática no original de 1911. A base registra as quatro em português, marcadas [FP], em docs/tradicao/05 §3.3, e registra verbatim apenas a frase de abertura do mesmo parágrafo ("Shuffle the entire pack and turn some of the cards round, so as to invert their tops"). Por isso o app RELATA as quatro e não as põe entre aspas. Quem for conferir no Pictorial Key e trouxer o inglês exato pode promover cada uma a citação — até lá, relato.',
  },
  {
    id: 'tiragemDeTresCartas',
    texto:
      'Fonte primária datada para a tiragem de três cartas rotuladas passado, presente e futuro — que é justamente a que o app usa. Doc 05 §3.6: não está no Pictorial Key (Waite dá três métodos, de 10, 42 e 35 cartas), não é a tiragem da Golden Dawn (que é a Opening of the Key), e a popularização é do séc. XX. A ideia de dividir em três tempos existe na cartomancia francesa dos séc. XVIII–XIX (passé, présent, avenir), mas a tiragem de exatamente três cartas com esses rótulos não foi localizada em fonte datada. Consequência que este módulo respeita: as quatro regras de preparo servem para qualquer tiragem, e em nenhum texto a tiragem de três é chamada de clássica ou tradicional.',
  },
  {
    id: 'duracaoDoEmbaralho',
    texto:
      'Qualquer duração na fonte para a segunda regra. Waite pede a mente o mais em branco possível enquanto se embaralha e não diz por quanto tempo. Os SEGUNDOS_DO_EMBARALHO = 20 são escolha deste app para dar ao gesto uma medida (e casam com o tempo da animação de embaralhar). O texto de tela diz que o número é nosso.',
  },
  {
    id: 'criterioDePerguntaDefinida',
    texto:
      'Qualquer critério na fonte para o que conta como pergunta "formulada definidamente". Waite pede a formulação definida e não a define. MINIMO_DE_PALAVRAS = 4 e a contagem de pontos de interrogação são mecânica deste app, aplicada ao TEXTO e nunca à vida de quem escreveu, e avaliarPergunta() se rotula como leitura do app em todos os idiomas.',
  },
  {
    id: 'tecnicaParaLerParaSiMesmo',
    texto:
      'Uma técnica, em Waite, para contornar a dificuldade que ele mesmo aponta. Ele constata que ler para um estranho é mais fácil do que ler para si mesmo ou para um amigo, e para por aí — não ensina o que fazer quando a leitura é a sua. O truque de dizer em voz alta o que se diria a uma amiga é do app, e a quarta regra diz isso.',
  },
];

// A bibliografia em PT, para quem importar do motor. A versão localizada de
// cada idioma vive no pack e é a que sai no campo `fonte` do preparo.
export const FONTES = PACK_PT.fontes;

// ---------------------------------------------------------------------------
// 4. MONTAGEM
// ---------------------------------------------------------------------------
function contexto(opcoes) {
  const o = opcoes && typeof opcoes === 'object' ? opcoes : {};
  return { paraQuem: PARA_QUEM.includes(o.paraQuem) ? o.paraQuem : 'voce' };
}

function montarRegra(id, c, pack) {
  const base = REGRAS[id];
  const p = pack.regras[id];
  return {
    id,
    ordem: base.ordem,
    gesto: base.gesto,
    segundos: base.segundos,
    pedeTexto: base.pedeTexto,
    paraQuem: c.paraQuem,
    // BLOCO 1 — vida real. É o que a tela mostra primeiro.
    titulo: p.titulo,
    chamada: p.chamada,
    // BLOCO 2 — o gesto e o motivo, ainda em língua de conversa.
    oQueVoceFaz: p.oQueVoceFaz(c),
    porQue: p.porQue(c),
    // BLOCO 3 — o recibo. Obra, autor, ano, parte.
    recibo: p.recibo,
    proxima: proximaRegra(id),
  };
}

/**
 * A REGRA SEGUINTE, ou null se esta é a última.
 * `id` — um dos quatro de ORDEM_DAS_REGRAS. Desconhecido devolve null.
 */
export function proximaRegra(id) {
  const i = ORDEM_DAS_REGRAS.indexOf(id);
  if (i < 0 || i === ORDEM_DAS_REGRAS.length - 1) return null;
  return ORDEM_DAS_REGRAS[i + 1];
}

/**
 * UMA REGRA SÓ — para a tela que mostra passo a passo.
 *
 * `id`     — 'pergunta' | 'embaralhar' | 'vies' | 'estranho'. Os ids são dados
 *            e continuam em PT nos três idiomas. Desconhecido devolve null.
 * `opcoes` — { paraQuem: 'voce' (default) | 'outra' }.
 * `lang`   — 'pt' (default), 'es' ou 'en'.
 */
export function regraDaTiragem(id, opcoes = {}, lang = 'pt') {
  if (!REGRAS[id]) return null;
  return montarRegra(id, contexto(opcoes), packDoIdioma(lang));
}

/**
 * A DATAÇÃO DE TUDO QUE ESTA TELA CITA, no idioma pedido.
 *
 * Devolve, na ordem de ORDEM_DAS_DATACOES, `{ id, obra, autor, quando, grau,
 * grauNome, nota, linha }`. `linha` já vem montada para a linha miúda do
 * rodapé; `obra` pode ser null (ver DATACOES).
 */
export function fontesDatadas(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return ORDEM_DAS_DATACOES.map((id) => {
    const base = DATACOES[id];
    const autor = traduzirAutor(base.autor, lang);
    const quando = traduzirQuando(base.quando, lang);
    return {
      id,
      obra: base.obra,
      autor,
      quando,
      grau: base.grau,
      grauNome: pack.graus[base.grau],
      nota: pack.notasDeDatacao[id],
      linha: [autor, base.obra, quando].filter(Boolean).join(', '),
    };
  });
}

/**
 * O PREPARO INTEIRO — a porta de entrada da tela.
 *
 * `opcoes` — { paraQuem: 'voce' (default) | 'outra' }.
 * `lang`   — 'pt' (default), 'es' ou 'en'.
 *
 * Devolve sempre a mesma forma: `{ titulo, abertura, paraQuem, regras (4),
 * total, verbatins, notaSemTranca, notaLeituraDoApp, botao, fonte, datacao }`.
 * Não há caso indisponível: esta feature não depende de dado nenhum da pessoa.
 */
export function preparoDaTiragem(opcoes = {}, lang = 'pt') {
  const pack = packDoIdioma(lang);
  const c = contexto(opcoes);
  return {
    titulo: pack.titulo,
    abertura: pack.abertura,
    paraQuem: c.paraQuem,
    regras: ORDEM_DAS_REGRAS.map((id) => montarRegra(id, c, pack)),
    total: ORDEM_DAS_REGRAS.length,
    // A única citação entre aspas deste módulo. Ver o cabeçalho.
    verbatins: [pack.verbatim.embaralhar],
    notaSemTranca: pack.notaSemTranca,
    notaLeituraDoApp: pack.notaLeituraDoApp,
    botao: pack.botao,
    fonte: pack.fontes,
    datacao: fontesDatadas(lang),
  };
}

/**
 * A PRIMEIRA REGRA, COM RETORNO — o app olhando para o TEXTO da pergunta.
 *
 * Mecânica pura e declarada como leitura do app: conta palavras e conta pontos
 * de interrogação. Nada aqui julga a vida de quem escreveu, e nada aqui é
 * atribuído a Waite além do que ele escreveu (formular a pergunta
 * definidamente). Ver NAO_ACHADO.criterioDePerguntaDefinida.
 *
 * `texto` — o que a pessoa digitou. null, vazio ou não-string vira 'vazia'.
 * `lang`  — 'pt' (default), 'es' ou 'en'.
 *
 * Devolve `{ texto, palavras, interrogacoes, sinal, definida, mensagem,
 * proximoPasso, exemplos, recibo }`.
 * `sinal` ∈ 'vazia' | 'curta' | 'duasPerguntas' | 'definida'.
 */
export function avaliarPergunta(texto, lang = 'pt') {
  const pack = packDoIdioma(lang);
  const limpo = typeof texto === 'string' ? texto.trim() : '';
  const palavras = limpo ? limpo.split(/\s+/).filter(Boolean).length : 0;
  const interrogacoes = (limpo.match(/[?？]/g) || []).length;

  let sinal = 'definida';
  if (!limpo) sinal = 'vazia';
  else if (palavras < MINIMO_DE_PALAVRAS) sinal = 'curta';
  else if (interrogacoes >= 2) sinal = 'duasPerguntas';

  return {
    texto: limpo,
    palavras,
    interrogacoes,
    minimoDePalavras: MINIMO_DE_PALAVRAS,
    sinal,
    definida: sinal === 'definida',
    mensagem: pack.pergunta.avaliacao[sinal],
    // O passo que falta mesmo quando a frase está boa: a regra é DIZER.
    proximoPasso: pack.pergunta.emVozAlta,
    exemplos: pack.pergunta.exemplos,
    recibo: pack.regras.pergunta.recibo,
  };
}

/**
 * O PROGRESSO DAS QUATRO — para o rótulo do botão e a linha de estado.
 *
 * `feitas` — array com os ids já feitos, em qualquer ordem. Repetido conta uma
 *            vez; id desconhecido é ignorado (não inventa progresso).
 * `lang`   — 'pt' (default), 'es' ou 'en'.
 *
 * Devolve `{ feitas, faltam, quantas, total, completo, texto, botao }`.
 * `completo` serve para TROCAR O RÓTULO do botão, nunca para desabilitá-lo —
 * ver "O APP NÃO TRANCA O BOTÃO" no cabeçalho.
 */
export function progressoDoPreparo(feitas = [], lang = 'pt') {
  const pack = packDoIdioma(lang);
  const lista = Array.isArray(feitas) ? feitas : [];
  const feitasValidas = ORDEM_DAS_REGRAS.filter((id) => lista.includes(id));
  const faltam = ORDEM_DAS_REGRAS.filter((id) => !feitasValidas.includes(id));
  const completo = faltam.length === 0;

  let texto;
  if (completo) texto = pack.progresso.completo;
  else if (feitasValidas.length === 0) texto = pack.progresso.nenhuma;
  else texto = pack.progresso.parcial({ feitas: feitasValidas.length, total: ORDEM_DAS_REGRAS.length, proxima: pack.regras[faltam[0]].titulo });

  return {
    feitas: feitasValidas,
    faltam,
    quantas: feitasValidas.length,
    total: ORDEM_DAS_REGRAS.length,
    completo,
    texto,
    botao: completo ? pack.botao.depois : pack.botao.antes,
  };
}
