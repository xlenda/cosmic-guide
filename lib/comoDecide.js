// lib/comoDecide.js
// COMO ESTE APP DECIDE — o card de transparência, feature por feature.
//
// ===========================================================================
// O QUE ESTA FEATURE É, EM UMA FRASE
// ===========================================================================
// Em cada tela do app, três coisas diferentes chegam misturadas ao usuário: o
// que foi CALCULADO (efeméride, número conferível), o que foi LIDO na tradição
// (atribuição de alguém, em algum século) e o que é LEITURA DO APP (o jeito de
// contar, a ordem, o recorte). Este módulo separa as três, tela por tela, e
// diz também o que o app SE RECUSA a fazer.
//
// É a materialização da regra operacional 1 de docs/tradicao/00-tese.md ("três
// camadas, sempre separadas") e a proposta nº 4 de
// docs/tradicao/16-oportunidades-de-conteudo.md. A proposta pedia três
// declarações — regências, casas, zodíaco. Este arquivo entrega seis (as três
// mais efeméride, ausência de nota e o papel da IA) e uma entrada por tela,
// porque declarar a convenção sem dizer onde ela é usada resolve metade do
// problema: o usuário lê "Escorpião → Marte" na tela do horóscopo, não na
// página de convenções.
//
// ===========================================================================
// A DECISÃO QUE GOVERNA O ARQUIVO INTEIRO: NÃO INVENTAR O QUE O APP FAZ
// ===========================================================================
// Um card de transparência que descreve o app errado é pior que card nenhum —
// é a mesma falha que ele existe pra corrigir, com selo de honestidade em
// cima. Por isso cada linha de `calculado` foi conferida no código em
// 01/08/2026, símbolo por símbolo, e não na tabela do doc 16 (que já tinha
// envelhecido em dois pontos):
//
//   horóscopo      lib/dailyHoroscope.js  → ceuDoDia, DOMICILIO_POR_SIGNO,
//                                           dignidadeDe, relacaoSignoInteiro,
//                                           quartoLunar, âncora de meio-dia UTC
//   mapa           lib/signs.js           → signoFromDate, moonSign,
//                                           ascendantSign, houses (Casas
//                                           Inteiras), planetPositions, aspects
//   céu de hoje    lib/personalSky.js     → personalSkyToday, ORB_FACTOR
//   tarô           lib/tarotDeck.js       → TAROT_DECK, GOLDEN_DAWN via `astro`,
//                                           waite1911; sorteio Math.random em
//                                           screens/TarotScreen.js
//   compatibilidade lib/synastry.js       → distanciaEmSignos, CATEGORIAS,
//                                           ESCALA (IV.7), sem nota nenhuma
//   calendário lunar lib/lunarCalendar.js → getMoonPhase, nextExactMoonPhase
//   calendário cósmico lib/calendarioCosmico.js → fases, ingresso solar,
//                                           estações de Mercúrio, aspecto exato
//   rituais        lib/rituais.js         → rituaisDeHoje (fase E dia), parciais
//   sonhos         server-patches/…/AnthropicChatProvider.js → DREAM_SYSTEM_PROMPT
//   corpo          lib/zodiacBody.js      → ZODIAC_BODY (Manílio), moonBodyTransit
//   fotos          screens/PalmScreen.js  → hub de 4 modos; prompts de visão
//   café           screens/CoffeeScreen.js + prompt de tasseografia
//   chat           blocoContexto() do servidor: o céu chega calculado, o modelo
//                                           não pode afirmar o que não está lá
//
// Onde o app hoje é omisso, o card diz que é omisso (as células de casa do
// Mapa Astral dizem "Casa N — signo" e nada mais). Onde a pesquisa não achou
// fonte, o card diz que não achou (NAO_ACHADO). Card de transparência que só
// elogia é folheto.
//
// ===========================================================================
// A REGRA DE DATAÇÃO — por que nada aqui é string solta
// ===========================================================================
// Toda afirmação histórica carrega { obra, autor, quando } como DADO, no
// motor, em português canônico — e a prosa que a acompanha vive nos packs.
// Quem monta o recibo é reciboDaFonte(), que passa o autor por traduzirAutor()
// e a datação por traduzirQuando() de lib/traducoes/datacao.js. Consequência,
// e é a regra da casa: a OBRA nunca traduz (De Agri Cultura continua De Agri
// Cultura em inglês), o AUTOR ganha a forma consagrada (Catão, o Velho / Catón
// el Viejo / Cato the Elder) e a DATAÇÃO ganha a forma da língua (séc. II a.C.
// / siglo II a.C. / 2nd c. BC).
//
// datacao.js ainda não conhece quatro autores que este card usa (Manílio,
// Artemidoro, Dião Cássio, Aristóteles) e devolve o português como veio. Como
// aquele arquivo é compartilhado e há outras frentes escrevendo no repositório
// hoje, o complemento mora em `pack.autores` — e a ORDEM é deliberada:
// datacao.js manda, o pack só preenche o que ele ainda não sabe. No dia em que
// os quatro entrarem lá, o pack vira redundante e some sem quebrar nada.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string
// ===========================================================================
// (mesma disciplina de lib/seita.js, lib/zodiacBody.js, lib/grounding.js e
// lib/synastry.js — vale nos TRÊS idiomas, sem exceção)
//
// 1. PRENDE PRIMEIRO, FONTE DEPOIS. Toda entrada abre na vida real de quem lê
//    — a discussão de signo com a amiga, a foto da mão na luz da cozinha, a
//    pergunta das duas da manhã no chat — e só então mostra o recibo. Uma tela
//    sobre método é justamente a que mais corre risco de abrir em erudição.
// 2. NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita, em nenhum idioma.
// 3. NADA DE PROMESSA NEM DE VEREDITO. Este card descreve o app, não a vida de
//    quem lê.
// 4. NADA DE AVISO DEFENSIVO. "Apenas entretenimento" e "não garante
//    resultados" foram removidos do app de propósito; dizer o que a conta é e
//    de quem é a leitura faz o trabalho que a ressalva fingia fazer.
// 5. SEM PORCENTAGEM, nem para citar a que o app não usa. Número de dois
//    dígitos lê como medida mesmo dentro de uma negação — é por isso que o
//    texto escreve "número de dois dígitos" em vez do símbolo.
//
// test/comoDecide.test.js segura tudo isso e falha o build. É de propósito.
//
// ===========================================================================
// OS TRÊS IDIOMAS
// ===========================================================================
// Toda prosa vive em lib/traducoes/comoDecide.{pt,es,en}.js, com a MESMA
// forma: mesmas chaves, mesmas funções, mesma assinatura. O que NUNCA muda
// entre eles: o verbatim inglês de Robbins e de Cary (traduzir citação é
// falsificá-la), as obras, as datas e as CHAVES internas — ids de feature e de
// item continuam em português nos três packs, porque são dados, não texto de
// tela. As funções públicas têm `lang` com default 'pt'.

import { traduzirAutor, traduzirQuando } from './traducoes/datacao.js';
import { PACK as PACK_PT } from './traducoes/comoDecide.pt.js';
import { PACK as PACK_ES } from './traducoes/comoDecide.es.js';
import { PACK as PACK_EN } from './traducoes/comoDecide.en.js';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma fora dos três cai no PT — mesmo fallback de lib/i18n.js, de
// lib/synastry.js e de lib/seita.js.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// 1. AS FONTES — dado, em português canônico, traduzido só na hora de exibir
// ---------------------------------------------------------------------------
// `autor: null` é legítimo: o Yavanajātaka, o Maine Farmers' Almanac e o
// manualzinho de 1742 são obras sem autor conhecido, e fingir um seria o mesmo
// gesto que a tese denuncia (Nechepso e Petosiris eram pseudônimos).
const F = {
  ptolomeuI4: { obra: 'Tetrabiblos I.4', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI8: { obra: 'Tetrabiblos I.8', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI11: { obra: 'Tetrabiblos I.11', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI13: { obra: 'Tetrabiblos I.13', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI14: { obra: 'Tetrabiblos I.14', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI15: { obra: 'Tetrabiblos I.15', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI16: { obra: 'Tetrabiblos I.16', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI17: { obra: 'Tetrabiblos I.17', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI19: { obra: 'Tetrabiblos I.19', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI22: { obra: 'Tetrabiblos I.22', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuI24: { obra: 'Tetrabiblos I.24', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuIII17: { obra: 'Tetrabiblos III.xvii', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  ptolomeuIV7: { obra: 'Tetrabiblos IV.7', autor: 'Ptolomeu', quando: 'séc. II d.C.' },
  valenteI2: { obra: 'Anthologiae I.2', autor: 'Vétio Valente', quando: 'séc. II d.C.' },
  manilio: { obra: 'Astronomica II.453-465', autor: 'Manílio', quando: 'séc. I d.C.' },
  paulo: { obra: 'Eisagogika, cap. 24', autor: 'Paulo de Alexandria', quando: '378 d.C.' },
  firmico: { obra: 'Mathesis VI.32.3', autor: 'Firmico Materno', quando: 'c. 335 d.C.' },
  plinio: { obra: 'Naturalis Historia XVIII.321-322', autor: 'Plínio, o Velho', quando: 'séc. I d.C.' },
  catao: { obra: 'De Agri Cultura 40.1', autor: 'Catão, o Velho', quando: 'séc. II a.C.' },
  columela: { obra: 'De Re Rustica XI.2.85', autor: 'Columela', quando: 'séc. I d.C.' },
  hesiodo: { obra: 'Erga kai Hemerai, vv. 765-828', autor: 'Hesíodo', quando: 'séc. VII a.C.' },
  dioCassio: { obra: 'Historia Romana 37.18-19', autor: 'Dião Cássio', quando: 'séc. III d.C.' },
  artemidoro12: { obra: 'Oneirocritica 1.2', autor: 'Artemidoro', quando: 'séc. II d.C.' },
  artemidoro19: { obra: 'Oneirocritica 1.9', autor: 'Artemidoro', quando: 'séc. II d.C.' },
  aristoteles: { obra: 'Historia Animalium I.15', autor: 'Aristóteles', quando: 'séc. IV a.C.' },
  yavanajataka: { obra: 'Yavanajātaka', autor: null, quando: 'séc. II d.C.' },
  gebelin: { obra: 'Le Monde primitif, vol. 8', autor: 'Antoine Court de Gébelin', quando: '1781' },
  bookT: { obra: 'Book T', autor: 'Golden Dawn', quando: '1888' },
  waite: { obra: 'The Pictorial Key to the Tarot', autor: 'A. E. Waite', quando: '1911' },
  culpeper: { obra: 'The Complete Herbal', autor: 'Nicholas Culpeper', quando: '1653' },
  rudhyar: { obra: 'The Lunation Cycle', autor: 'Dane Rudhyar', quando: '1967' },
  almanaque: { obra: "Maine Farmers' Almanac", autor: null, quando: 'anos 1930' },
  chirognomie: { obra: 'La Chirognomie', autor: "D'Arpentigny", quando: '1839' },
  benham: { obra: 'The Laws of Scientific Hand Reading', autor: 'William Benham', quando: '1900' },
  wahrsagerin: { obra: 'Die Wahrsagerin aus dem Coffee-Schälgen', autor: null, quando: '1742' },
  kent: { obra: 'Telling Fortunes by Tea Leaves', autor: 'Cicely Kent', quando: '1922' },
};

export const FONTES_CANONICAS = F;

// Nome de autor na língua do leitor. datacao.js é a AUTORIDADE; o pack só
// preenche o que ele ainda não conhece (ver o cabeçalho).
export function autorNoIdioma(autor, lang = 'pt') {
  if (!autor) return null;
  const viaDatacao = traduzirAutor(autor, lang);
  if (viaDatacao && viaDatacao !== autor) return viaDatacao;
  const pack = packDoIdioma(lang);
  return (pack.autores && pack.autores[autor]) || autor;
}

/**
 * O recibo de uma fonte, na língua pedida.
 * `fonte` — { obra, autor, quando } ou null.
 * Com `null` devolve a marca de "sem fonte primária lida nesta base", que é
 * uma resposta e não um buraco: ela existe para os dois pontos em que a
 * pesquisa tem data mas não tem edição lida (ver NAO_ACHADO).
 */
export function reciboDaFonte(fonte, lang = 'pt') {
  const pack = packDoIdioma(lang);
  if (!fonte) return pack.semFonte;
  // A pontuação da datação é do MOTOR, não dos moldes: metade das formas já
  // termina em ponto ("séc. II d.C.") e a outra metade não ("2nd c. AD").
  // Deixar isso para o molde produzia "séc. II d.C.." em português e em
  // espanhol — e produziria "1930s" sem ponto nenhum em inglês.
  const cru = traduzirQuando(fonte.quando, lang);
  const quando = cru.endsWith('.') ? cru : `${cru}.`;
  const autor = autorNoIdioma(fonte.autor, lang);
  return autor
    ? pack.recibo({ autor, obra: fonte.obra, quando })
    : pack.reciboSemAutor({ obra: fonte.obra, quando });
}

// ---------------------------------------------------------------------------
// 2. AS CONVENÇÕES — o que vale no app inteiro
// ---------------------------------------------------------------------------
// Ordem de tela: primeiro o que resolve discussão de boteco (o signo, a
// fronteira, o regente), depois o que resolve discussão de app (casas, nota,
// IA).
export const CONVENCOES = [
  { id: 'zodiaco', fontes: [F.ptolomeuI22, F.yavanajataka], verbatim: ['ptolomeuZodiaco'] },
  { id: 'efemeride', fontes: [F.ptolomeuI22], verbatim: [] },
  { id: 'regencias', fontes: [F.ptolomeuI17], verbatim: [] },
  { id: 'casas', fontes: [F.paulo, F.firmico], verbatim: [] },
  { id: 'semNota', fontes: [F.ptolomeuIV7], verbatim: ['ptolomeuAversao'] },
  { id: 'ia', fontes: [], verbatim: [] },
];

export const IDS_DE_CONVENCAO = CONVENCOES.map((c) => c.id);

// ---------------------------------------------------------------------------
// 3. AS DECISÕES, TELA POR TELA
// ---------------------------------------------------------------------------
// `calculado`  — o que sai de conta. `exige` lista o dado de nascimento que a
//                conta precisa ('data', 'hora', 'cidade'); vazio = não precisa
//                de nada de quem lê.
// `tradicao`   — o que sai de leitura, cada item com a fonte. `fonte: null` é
//                a declaração explícita de que a base tem a informação e NÃO
//                tem edição primária lida — e todo item assim é obrigado a ter
//                entrada em NAO_ACHADO (o teste cobra).
// `leituraDoApp` e `naoFaz` — ids de texto no pack.
// `verbatim`   — ids de citação no pack, para as três telas em que a frase da
//                fonte diz mais que qualquer paráfrase. Vazio nas outras: quem
//                pendura verbatim em tudo ensina o usuário a pular todos.
export const DECISOES = [
  {
    id: 'horoscopo',
    calculado: [
      { id: 'regente', exige: ['data'] },
      { id: 'lua', exige: [] },
      { id: 'mudanca', exige: [] },
    ],
    tradicao: [
      { id: 'domicilios', fonte: F.ptolomeuI17 },
      { id: 'dignidades', fonte: F.ptolomeuI19 },
      { id: 'signoInteiro', fonte: F.ptolomeuI13 },
      { id: 'regentePrimeiro', fonte: F.valenteI2 },
      { id: 'quartos', fonte: F.ptolomeuI8 },
    ],
    leituraDoApp: ['ordem', 'ancora'],
    verbatim: [],
    naoFaz: ['semBarras', 'semCeuInventado'],
  },
  {
    id: 'mapa',
    calculado: [
      { id: 'sol', exige: ['data'] },
      { id: 'lua', exige: ['data'] },
      { id: 'ascendente', exige: ['data', 'hora', 'cidade'] },
      { id: 'casas', exige: ['data', 'hora', 'cidade'] },
      { id: 'planetas', exige: ['data'] },
    ],
    tradicao: [
      { id: 'zodiaco', fonte: F.ptolomeuI22 },
      { id: 'casasInteiras', fonte: F.paulo },
      { id: 'firmico', fonte: F.firmico },
      { id: 'domicilios', fonte: F.ptolomeuI17 },
    ],
    leituraDoApp: ['rotuloDoSistema', 'semPlacidus'],
    verbatim: ['ptolomeuZodiaco'],
    naoFaz: ['semHoraSemAscendente', 'casaSemSignificado'],
  },
  {
    id: 'ceu',
    calculado: [
      { id: 'cruzamento', exige: ['data'] },
      { id: 'orbe', exige: ['data'] },
      { id: 'tresMaisApertados', exige: ['data'] },
    ],
    tradicao: [
      { id: 'quatroAspectos', fonte: F.ptolomeuI13 },
      { id: 'conjuncao', fonte: F.ptolomeuI24 },
    ],
    leituraDoApp: ['rapidoELento'],
    verbatim: [],
    naoFaz: ['semMapaSemTela'],
  },
  {
    id: 'taro',
    calculado: [{ id: 'sorteio', exige: [] }],
    tradicao: [
      { id: 'waite', fonte: F.waite },
      { id: 'goldenDawn', fonte: F.bookT },
      { id: 'gebelin', fonte: F.gebelin },
    ],
    leituraDoApp: ['posicoes', 'textoDaCarta'],
    verbatim: [],
    naoFaz: ['semEgito', 'semFuturo'],
  },
  {
    id: 'compatibilidade',
    calculado: [{ id: 'distancia', exige: [] }],
    tradicao: [
      { id: 'quatroAspectos', fonte: F.ptolomeuI13 },
      { id: 'comandantes', fonte: F.ptolomeuI14 },
      { id: 'seVeem', fonte: F.ptolomeuI15 },
      { id: 'aversao', fonte: F.ptolomeuI16 },
      { id: 'escala', fonte: F.ptolomeuIV7 },
    ],
    leituraDoApp: ['traducaoParaCasal', 'soSignoSolar'],
    verbatim: ['ptolomeuAversao'],
    naoFaz: ['semNota', 'semEsconderAversao'],
  },
  {
    id: 'lua',
    calculado: [
      { id: 'elongacao', exige: [] },
      { id: 'instanteExato', exige: [] },
    ],
    tradicao: [
      { id: 'quatroQuartos', fonte: F.ptolomeuI8 },
      { id: 'hesiodo', fonte: F.hesiodo },
      { id: 'oitoFases', fonte: F.rudhyar },
      { id: 'nomesDeLua', fonte: F.almanaque },
      { id: 'colheita', fonte: F.plinio },
    ],
    leituraDoApp: ['oitoFatias'],
    verbatim: [],
    naoFaz: ['semMilenar', 'semInstrucao'],
  },
  {
    id: 'calendario',
    calculado: [
      { id: 'eventos', exige: [] },
      { id: 'bisseccao', exige: [] },
    ],
    tradicao: [
      { id: 'ingressos', fonte: F.ptolomeuI22 },
      { id: 'conjuncao', fonte: F.ptolomeuI24 },
      { id: 'quartos', fonte: F.ptolomeuI8 },
    ],
    leituraDoApp: ['reciboPorEvento', 'semFonteAntiga'],
    verbatim: [],
    naoFaz: ['semAgenda'],
  },
  {
    id: 'rituais',
    calculado: [
      { id: 'faseEDia', exige: [] },
      { id: 'semEfemeride', exige: [] },
    ],
    tradicao: [
      { id: 'diasPlanetarios', fonte: F.dioCassio },
      { id: 'qualidades', fonte: F.ptolomeuI4 },
      { id: 'lavoura', fonte: F.plinio },
      { id: 'catao', fonte: F.catao },
      { id: 'columela', fonte: F.columela },
    ],
    leituraDoApp: ['vinteEUm', 'semFonteAntiga'],
    verbatim: ['dioCassio'],
    naoFaz: ['semPromessa', 'semCorpo'],
  },
  {
    id: 'sonhos',
    calculado: [{ id: 'semCeu', exige: [] }],
    tradicao: [
      { id: 'especies', fonte: F.artemidoro12 },
      { id: 'quemSonhou', fonte: F.artemidoro19 },
    ],
    leituraDoApp: ['regrasDoModelo', 'camadaModerna'],
    verbatim: [],
    naoFaz: ['semDiagnostico', 'semTerceiro'],
  },
  {
    id: 'corpo',
    calculado: [{ id: 'luaAgora', exige: [] }],
    tradicao: [
      { id: 'manilio', fonte: F.manilio },
      { id: 'naoEPtolomeu', fonte: F.ptolomeuIII17 },
      { id: 'culpeper', fonte: F.culpeper },
    ],
    leituraDoApp: ['historiaNaoConselho'],
    verbatim: [],
    naoFaz: ['semCorpo'],
  },
  {
    id: 'fotos',
    calculado: [{ id: 'semConta', exige: [] }],
    tradicao: [
      { id: 'quiromanciaModerna', fonte: F.chirognomie },
      { id: 'benham', fonte: F.benham },
      { id: 'linhaDaVida', fonte: F.aristoteles },
      { id: 'rostoEPe', fonte: null },
    ],
    leituraDoApp: ['nomeiaATradicao', 'descreveAntes'],
    verbatim: [],
    naoFaz: ['semPele', 'semTempoDeVida'],
  },
  {
    id: 'cafe',
    calculado: [{ id: 'semConta', exige: [] }],
    tradicao: [
      { id: 'manual1742', fonte: F.wahrsagerin },
      { id: 'dicionarioDeSalao', fonte: F.kent },
      { id: 'istambul', fonte: null },
    ],
    leituraDoApp: ['geografiaDaXicara'],
    verbatim: [],
    naoFaz: ['semNomeSemData'],
  },
  {
    id: 'chat',
    calculado: [
      { id: 'contexto', exige: ['data'] },
      { id: 'semDadoSemAfirmacao', exige: [] },
    ],
    tradicao: [
      { id: 'vocabulario', fonte: F.ptolomeuI11 },
      { id: 'qualidades', fonte: F.ptolomeuI4 },
    ],
    leituraDoApp: ['regraDura', 'testeDoBarnum'],
    verbatim: [],
    naoFaz: ['semBaralho', 'semNota'],
  },
];

export const IDS_DE_FEATURE = DECISOES.map((d) => d.id);

const POR_ID = {};
for (const d of DECISOES) POR_ID[d.id] = d;

// ---------------------------------------------------------------------------
// 4. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de NAO_ACHADO em lib/seita.js, lib/synastry.js e
// lib/grounding.js: declarar o buraco impede que a próxima pessoa o preencha
// com a versão que circula por aí. Registro de pesquisa, em PT, não é
// renderizado em tela — mas os dois itens marcados `fonte: null` acima têm
// entrada obrigatória aqui, e o teste cobra a amarração.
export const NAO_ACHADO = [
  {
    id: 'autorDaRegenciaModerna',
    texto:
      'Quem primeiro atribuiu Urano a Aquário, Netuno a Peixes e Plutão a Escorpião, e quando. A literatura de referência descreve as três como "consenso" de astrólogos e não nomeia autor nem data; atribuições do tipo "foi Fulano em 18xx" circulam sem verificação. Enquanto ninguém achar a fonte, o app usa os sete de Tetrabiblos I.17 no bloco principal e diz por quê, em vez de misturar as duas camadas em silêncio (doc 01 §2.6).',
  },
  {
    id: 'significadoDeCasa',
    texto:
      'O significado das doze casas com fonte lida ponta a ponta — Paulo de Alexandria cap. 24, Valente II, Fírmico II. Sem isso, as células do Mapa Astral dizem "Casa N — signo" e nada mais. É a situação mais segura possível (o app não afirma significado nenhum) e é lacuna declarada, não esquecimento: o perigo nº 1 do doc 12 é preencher aquelas células pela "roda natural", que fabrica significado a partir do signo correspondente.',
  },
  {
    id: 'rostoEPe',
    texto:
      'Edição primária de mian xiang e de samudrika shastra. As duas tradições são nomeadas na tela porque são as que as leituras de rosto e de pé seguem, e nomear é melhor que chamar de "leitura energética". Mas o levantamento registra ~600 manuscritos de samudrika, na maioria anônimos ou atribuídos a figuras lendárias — citar "o samudrika shastra diz X" sem manuscrito é citar um corpus, não uma obra. Por isso este item entra com fonte nula e o texto diz isso na cara do usuário (doc 06 §3.2 e §4).',
  },
  {
    id: 'istambul',
    texto:
      'Fonte primária para a chegada do café a Istambul por volta de 1555. O levantamento chama a data de sólida, e ela é o que derruba o rótulo "milenar" da leitura de borra — mas quem foi lido de verdade nesta base são o manualzinho anônimo de 1742 e o léxico de salão britânico consolidado em 1922. O card mostra a diferença de peso entre as três em vez de apresentá-las como se fossem a mesma coisa (doc 06 §7.1).',
  },
  {
    id: 'anoDeCicelyKent',
    texto:
      'O ano de Telling Fortunes by Tea Leaves, de Cicely Kent, está marcado como "verificar" na bibliografia da base (doc 06 §9). O app usa 1922, que é o ano que circula na literatura secundária; se a conferência mudar o número, muda aqui e no card.',
  },
  {
    id: 'tabelaDePintas',
    texto:
      'A tabela zona do corpo ↔ planeta usada na leitura de pintas não foi localizada em nenhuma fonte primária, e as três fontes antigas que existem divergem dela: Cardano põe os sete planetas na testa inteira, Cocles lê o rosto pelo zodíaco, pseudo-Melampo não tem planeta nenhum. O card não a apresenta como tradição documentada; a correção sugerida pelo doc 06 §5.2 é trocar planeta por signo, usando a melotesia que o app já auditou.',
  },
  {
    id: 'camadaModernaDoSonho',
    texto:
      'Edição primária da camada de psicologia analítica que o prompt de sonhos usa (compensação, figuras do sonho como partes de quem sonha, ampliação em vez de equivalência de dicionário). Artemidoro está lido; a camada do séc. XX chegou por literatura secundária, e o card a nomeia como leitura moderna em vez de emprestar a ela a idade da Oneirocritica.',
  },
];

const IDS_NAO_ACHADO = NAO_ACHADO.map((x) => x.id);

// ---------------------------------------------------------------------------
// 5. O DADO DE NASCIMENTO — dizer o que falta, nunca preencher
// ---------------------------------------------------------------------------
// Este módulo NÃO lê storage (mesma disciplina de lib/seita.js): a tela passa o
// que lib/birthData.js → getAnyBirthData() devolveu, que é
// { date, time (pode ser null), city (pode ser null) }. Sem esse objeto, cada
// conta que depende de dado seu vem com `disponivelParaVoce: null` — não é
// "indisponível", é "o app não sabe", e as duas coisas são diferentes.
const ROTULO_EXIGENCIA = ['data', 'hora', 'cidade'];

function temDado(nascimento, campo) {
  if (!nascimento || typeof nascimento !== 'object') return false;
  const v = campo === 'data' ? nascimento.date : campo === 'hora' ? nascimento.time : nascimento.city;
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
}

function estadoDaConta(exige, nascimento, pack) {
  const lista = Array.isArray(exige) ? exige.filter((e) => ROTULO_EXIGENCIA.includes(e)) : [];
  if (lista.length === 0) {
    return { exige: [], disponivelParaVoce: null, falta: [], aviso: null, comoResolver: null };
  }
  const nomes = lista.map((e) => pack.exigencia.rotulos[e]);
  if (!nascimento) {
    return {
      exige: lista,
      disponivelParaVoce: null,
      falta: [],
      aviso: pack.exigencia.precisa(nomes),
      comoResolver: pack.exigencia.comoResolver,
    };
  }
  const falta = lista.filter((e) => !temDado(nascimento, e));
  if (falta.length === 0) {
    return { exige: lista, disponivelParaVoce: true, falta: [], aviso: pack.exigencia.pronto, comoResolver: null };
  }
  return {
    exige: lista,
    disponivelParaVoce: false,
    falta,
    aviso: pack.exigencia.falta(falta.map((e) => pack.exigencia.rotulos[e])),
    comoResolver: pack.exigencia.comoResolver,
  };
}

// ---------------------------------------------------------------------------
// 6. A MONTAGEM
// ---------------------------------------------------------------------------
function textoDe(pack, featureId, itemId) {
  const f = pack.features[featureId];
  return (f && f.textos[itemId]) || null;
}

function itemDeTradicao(pack, featureId, item, lang) {
  return {
    id: item.id,
    texto: textoDe(pack, featureId, item.id),
    obra: item.fonte ? item.fonte.obra : null,
    autor: item.fonte ? autorNoIdioma(item.fonte.autor, lang) : null,
    quando: item.fonte ? traduzirQuando(item.fonte.quando, lang) : null,
    recibo: reciboDaFonte(item.fonte, lang),
    // Sem edição primária lida: o card diz isso e o motivo inteiro está em
    // NAO_ACHADO, que é registro de pesquisa e não vai pra tela.
    semFontePrimaria: !item.fonte,
  };
}

function verbatinsDe(pack, ids) {
  return (ids || []).map((id) => pack.verbatim[id]).filter(Boolean);
}

/**
 * UMA CONVENÇÃO DO APP, na língua pedida.
 * `id`   — 'zodiaco' | 'efemeride' | 'regencias' | 'casas' | 'semNota' | 'ia'
 * `lang` — 'pt' (default), 'es' ou 'en'.
 * Id desconhecido devolve null.
 */
export function convencao(id, lang = 'pt') {
  const c = CONVENCOES.find((x) => x.id === id);
  if (!c) return null;
  const pack = packDoIdioma(lang);
  const t = pack.convencoes[c.id];
  return {
    id: c.id,
    nome: t.nome,
    chamada: t.chamada,
    texto: t.texto,
    verbatins: verbatinsDe(pack, c.verbatim),
    fontes: c.fontes.map((f) => reciboDaFonte(f, lang)),
  };
}

/** As seis convenções, na ordem de tela. */
export function convencoesDoApp(lang = 'pt') {
  return CONVENCOES.map((c) => convencao(c.id, lang));
}

/**
 * COMO O APP DECIDE, NUMA FEATURE.
 *
 * `featureId`  — 'horoscopo', 'mapa', 'ceu', 'taro', 'compatibilidade', 'lua',
 *                'calendario', 'rituais', 'sonhos', 'corpo', 'fotos', 'cafe',
 *                'chat'. Id desconhecido devolve null.
 * `lang`       — 'pt' (default), 'es' ou 'en'.
 * `nascimento` — OPCIONAL, { date, time, city } como getAnyBirthData()
 *                devolve. Sem ele, cada conta que depende de dado seu vem com
 *                `disponivelParaVoce: null` (o app não sabe) em vez de false
 *                (o app sabe que falta).
 *
 * Devolve { id, nome, tela, chamada, calculado, tradicao, leituraDoApp,
 * naoFaz, verbatins, blocos, fontes, rotulos } — `blocos` é a mesma coisa em
 * ordem de render, para a tela não precisar montar a sequência à mão.
 */
export function comoDecide(featureId, lang = 'pt', nascimento = null) {
  const d = POR_ID[featureId];
  if (!d) return null;
  const pack = packDoIdioma(lang);
  const f = pack.features[featureId];

  const calculado = d.calculado.map((item) => ({
    id: item.id,
    texto: textoDe(pack, featureId, item.id),
    ...estadoDaConta(item.exige, nascimento, pack),
  }));

  const tradicao = d.tradicao.map((item) => itemDeTradicao(pack, featureId, item, lang));
  const leituraDoApp = d.leituraDoApp.map((id) => ({ id, texto: textoDe(pack, featureId, id) }));
  const naoFaz = d.naoFaz.map((id) => ({ id, texto: textoDe(pack, featureId, id) }));

  return {
    id: d.id,
    nome: f.nome,
    tela: f.tela,
    chamada: f.chamada,
    calculado,
    tradicao,
    leituraDoApp,
    naoFaz,
    verbatins: verbatinsDe(pack, d.verbatim),
    blocos: [
      { tipo: 'calculado', titulo: pack.rotulos.calculado, itens: calculado },
      { tipo: 'tradicao', titulo: pack.rotulos.tradicao, itens: tradicao },
      { tipo: 'leituraDoApp', titulo: pack.rotulos.leituraDoApp, itens: leituraDoApp },
      { tipo: 'naoFaz', titulo: pack.rotulos.naoFaz, itens: naoFaz },
    ],
    fontes: tradicao.map((x) => x.recibo),
    rotulos: pack.rotulos,
  };
}

/** As treze features, na ordem de tela. */
export function todasAsDecisoes(lang = 'pt', nascimento = null) {
  return DECISOES.map((d) => comoDecide(d.id, lang, nascimento));
}

/**
 * A BIBLIOGRAFIA DO CARD — cada obra uma vez só, na ordem em que aparece.
 * Itens sem fonte primária lida não entram: eles não são bibliografia, são
 * pendência, e a pendência aparece no próprio item.
 */
export function bibliografia(lang = 'pt') {
  const vistos = new Set();
  const saida = [];
  const todas = [
    ...CONVENCOES.flatMap((c) => c.fontes),
    ...DECISOES.flatMap((d) => d.tradicao.map((t) => t.fonte)),
  ];
  for (const fonte of todas) {
    if (!fonte) continue;
    if (vistos.has(fonte.obra)) continue;
    vistos.add(fonte.obra);
    saida.push(reciboDaFonte(fonte, lang));
  }
  return saida;
}

/**
 * O CARD INTEIRO, pronto para a tela: abertura, as seis convenções, as treze
 * features e a bibliografia. É esta a função que a tela chama.
 */
export function cardComoDecide(lang = 'pt', nascimento = null) {
  const pack = packDoIdioma(lang);
  return {
    idioma: pack.idioma,
    titulo: pack.abertura.titulo,
    chamada: pack.abertura.chamada,
    explicacao: pack.abertura.explicacao,
    rotulos: pack.rotulos,
    convencoes: convencoesDoApp(lang),
    decisoes: todasAsDecisoes(lang, nascimento),
    fontes: bibliografia(lang),
  };
}

// A bibliografia em PT, para quem importar do motor. A versão localizada sai
// por bibliografia(lang) e é a que a tela mostra.
export const FONTES = bibliografia('pt');

// Amarração conferida no teste: todo item de tradição sem fonte primária lida
// precisa ter entrada em NAO_ACHADO com o MESMO id. Exportado porque é a
// verificação que dá sentido ao `fonte: null` — sem ela, nulo vira desleixo.
export const IDS_SEM_FONTE_PRIMARIA = DECISOES.flatMap((d) =>
  d.tradicao.filter((t) => !t.fonte).map((t) => t.id)
);

export function lacunaDeclarada(id) {
  return IDS_NAO_ACHADO.includes(id);
}
