// lib/calendarioCosmico.js
// CALENDÁRIO CÓSMICO — os eventos astronômicos REAIS de um mês, um a um, com
// um parágrafo que explica o que é aquilo em língua de conversa e só então
// mostra o recibo (obra, autor, século).
//
// i18n FECHADO (31/07/2026). Todo o TEXTO dos eventos vive em packs por
// idioma — lib/traducoes/calendario.pt.js / .es.js / .en.js — com a mesma
// forma exata (mesmas chaves, mesmos placeholders). O motor recebe `lang`
// com default 'pt': chamada antiga continua devolvendo o PT byte a byte
// (test/calendarioIdiomas.test.js compara contra goldens capturadas ANTES
// da extração). A tela passa o idioma que já tem do useLanguage().
//
// O que fica NESTE arquivo: a astronomia (datas, bissecção, orbes), os
// campos estruturais (tipo, emoji, lastro, detalhe) e as duas mensagens de
// indisponibilidade (ERRO DE UI, resolvido por `mensagemKey` na tela).
// `detalhe` continua CANÔNICO em qualquer idioma (signos e planetas com os
// nomes de lib/signs.js) — é dado, não rótulo; os rótulos por idioma saem
// nos campos *Display.
// O que NUNCA se traduz: obra, locus e os verbatins de Robbins/latinos.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de escrever qualquer string daqui
// ===========================================================================
// Mesma linha vermelha de lib/grounding.js, lib/zodiacBody.js e
// lib/cosmicSound.js, e ela vale aqui inteira:
//
// 1. NENHUMA alegação de saúde, nem implícita. Nada de "acalma", "reduz a
//    ansiedade", "melhora o sono", "energiza", "recarrega". Um evento
//    astronômico não faz nada com o corpo de ninguém, e este arquivo não
//    sugere que faça — nem por metáfora.
// 2. NENHUMA promessa de resultado. Nada de "vai atrair", "garante",
//    "favorece", "é o melhor momento para". O céu é medido; o que acontece com
//    a vida de quem lê não é nosso para afirmar (docs/tradicao/00-tese.md,
//    proposição 1 e regra operacional 1).
// 3. NENHUMA instrução ao leitor. Nem ao corpo dele, nem à agenda dele. Este
//    módulo descreve o que acontece no céu e o que a Antiguidade FAZIA — no
//    passado, com dono. "A lavoura romana plantava X" é permitido. "Plante X"
//    é proibido, e "bom momento para plantar" é a mesma proibição de gravata.
// 4. TODA afirmação histórica carrega obra + autor + século, e a fonte precisa
//    EXISTIR em docs/tradicao/. Onde não houver fonte antiga, o texto diz
//    exatamente isso: "prática popular contemporânea, sem fonte antiga
//    localizada". Nunca se inventa antiguidade — inventar antiguidade é o
//    padrão de 2.000 anos que a tese denuncia (00-tese.md, proposição 3), não
//    algo que a gente repete.
//
// test/calendarioCosmico.test.js varre todos os textos atrás desse vocabulário
// e falha o build. É de propósito.
// ===========================================================================
//
// ===========================================================================
// A FORMA DE TODO PARÁGRAFO: POVÃO ABRE, RECIBO FECHA
// ===========================================================================
// Feedback literal do dono: "muito científico, preciso mesclar para o povão
// entender e deixar científico também". A resposta não é diluir a fonte — é
// inverter a ORDEM. Todo parágrafo abre explicando a coisa como se explica pra
// alguém na fila do mercado, e só depois vem a citação, atrás do marcador
// literal MARCA_RECIBO ("Quem escreveu isso:").
//
// Isso não é estilo, é contrato: o teste corta o parágrafo nesse marcador,
// exige que a PRIMEIRA metade não tenha nenhum nome de autor nem "séc.", e
// exige que a SEGUNDA metade tenha obra, autor e século. Quem inverter a ordem
// quebra o build.
// ===========================================================================
//
// ===========================================================================
// NUNCA FABRICA — mesmo contrato de lib/cosmicSound.js
// ===========================================================================
// Sem astronomy-engine, `calendarioCosmico()` devolve `eventos: []` e
// `ceuDisponivel: false`. Não estima, não interpola, não cai numa tabela de
// datas médias. Um calendário de eventos celestes que chuta datas é pior que
// um calendário vazio, porque o vazio é conferível e o chute não.
//
// A sonda de disponibilidade é UMA só — getMoonPhase() devolvendo null —,
// igual getSkyTuning() em lib/cosmicSound.js. Uma sonda só significa um único
// ponto de falha declarado, e um único ponto para o teste simular.
// ===========================================================================
//
// ===========================================================================
// UTC PARA CALCULAR, DIA LOCAL PARA MOSTRAR
// ===========================================================================
// O INSTANTE de todo evento é UTC, e tem que ser: efeméride é UTC, e um mesmo
// instante não muda de nome porque o telefone mudou de fuso.
//
// O RÓTULO de dia, não. lib/localDay.js é a convenção única do app ("o dia
// LOCAL do aparelho, nunca UTC") e existe por causa de bugs reais: às 22h no
// Brasil o dia UTC já é amanhã. Caso medido em julho/2026: um aspecto exato em
// 2026-07-13T01:28Z é 12/07 às 22:28 no Brasil, e o objeto saía com `dia: 13`.
//
// Por isso cada evento leva os DOIS campos, com nome dizendo qual é qual:
//   dia / dataISO      → UTC, para conferir contra efeméride pública
//   diaLocal/dataLocal → o dia civil do aparelho, que é o que a TELA consome
// A janela do mês continua sendo UTC de ponta a ponta; quem exibe usa os
// campos locais e nunca precisa escrever "UTC" ao lado da hora.
// ===========================================================================

import { getMoonPhase, nextExactMoonPhase } from './lunarCalendar';
import { SIGNS, signoFromDate, isMercuryRetrograde, aspects } from './signs';
import { localDayStr } from './localDay';
import PACK_PT from './traducoes/calendario.pt';
import PACK_ES from './traducoes/calendario.es';
import PACK_EN from './traducoes/calendario.en';

// Os packs de texto por idioma. Qualquer valor desconhecido de `lang` cai em
// 'pt' — compatibilidade total com quem chama sem idioma.
const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

function idiomaValido(lang) {
  return lang === 'es' || lang === 'en' ? lang : 'pt';
}

// Preenche placeholders {x} de um template do pack. Placeholder sem valor
// fica como está — melhor um "{x}" visível (e testável) do que texto sumido.
function preenche(template, vars) {
  return template.replace(/\{(\w+)\}/g, (tudo, chave) =>
    Object.prototype.hasOwnProperty.call(vars, chave) ? String(vars[chave]) : tudo
  );
}

// ---------------------------------------------------------------------------
// POR QUE getMoonPhaseForMonth() NÃO DATA MARCO NENHUM AQUI
// ---------------------------------------------------------------------------
// getMoonPhaseForMonth(ano, mes) devolve o RÓTULO de fase de cada dia, e o
// rótulo vem de uma fatia de 45° do ciclo — ou seja, ~3,7 dias. O próprio
// cabeçalho de lib/lunarCalendar.js documenta a armadilha: em julho de 2026 os
// dias 28, 29, 30 e 31 são todos rotulados "Lua Cheia", enquanto a Cheia real
// acontece em 29/07 às 14:36 UTC. Varrer os rótulos procurando o primeiro dia
// "Cheia" anunciaria o evento um dia antes e continuaria anunciando dois dias
// depois.
//
// Marco lunar tem data E HORA únicas, e é isso que um calendário promete. Por
// isso as quatro luas saem de nextExactMoonPhase() (SearchMoonPhase), que
// devolve o instante; getMoonPhase() entra só para ler a iluminação NAQUELE
// instante, que é uso legítimo de rótulo — descrever um momento, não datá-lo.
// ---------------------------------------------------------------------------

const MS_MINUTO = 60 * 1000;
const MS_HORA = 60 * MS_MINUTO;
const MS_DIA = 24 * MS_HORA;

// O marcador que separa a conversa do recibo. É lido pelo teste.
//
// ELE É SENTINELA, NÃO RÓTULO. Está embutido no meio dos parágrafos deste
// arquivo (que são português) só pra a tela saber ONDE cortar. O rótulo que a
// pessoa lê é 'calendario.event.receiptMark', traduzido nos três idiomas — ver
// partesDoParagrafo() em screens/CalendarioCosmicoScreen.js, que corta aqui e
// descarta o sentinela. Antes as duas funções eram a mesma string, e o
// resultado era "Quem escreveu isso:" aparecendo em português numa tela em
// inglês.
export const MARCA_RECIBO = 'Quem escreveu isso:';

// A frase exata para quando a pesquisa NÃO achou fonte antiga. Constante para
// não virar dez variações amenizadas espalhadas pelo arquivo.
export const SEM_FONTE_ANTIGA = 'prática popular contemporânea, sem fonte antiga localizada';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function dataStrUTC(d) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function horaStrUTC(d) {
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
}

// ---------------------------------------------------------------------------
// 1. AS QUATRO LUAS
// ---------------------------------------------------------------------------
// Os alvos são os mesmos de nextExactMoonPhase: 0 = Nova, 90 = Quarto
// Crescente, 180 = Cheia, 270 = Quarto Minguante — a diferença de longitude
// eclíptica entre Lua e Sol.
//
// E há um fato de fonte que vale registrar aqui em vez de esconder: as quatro
// luas SÃO os aspectos Sol–Lua. O capítulo que as descreve, Tetrabiblos I.8,
// se chama literalmente "Of the Power of the Aspects to the Sun". Conjunção,
// quadratura, oposição, quadratura de novo. É por isso que a Lua fica fora da
// varredura de aspectos da seção 4 sem que nada se perca: os aspectos dela com
// o Sol já são estes quatro eventos, com instante exato em vez de amostragem.
// SÓ o esqueleto: texto (titulo, paragrafo, fonte, tradicao, avisoDeIdade)
// vive nos packs de lib/traducoes/, indexado pelo MESMO `tipo` daqui. O
// `lastro` fica no motor porque é metadado de teste (prova contra a base em
// docs/tradicao/), não texto de tela — e não muda com o idioma.
const MARCOS_LUNARES = [
  {
    tipo: 'luaNova',
    longitudeAlvo: 0,
    emoji: '🌑',
    lastro: {
      doc: '04-lua-fases-e-calendario.md',
      provas: ['Tetrabiblos', 'I.8', 'Hesíodo', '765–828', 'De Agri Cultura', '40.1', 'luna silente'],
    },
  },
  {
    tipo: 'quartoCrescente',
    longitudeAlvo: 90,
    emoji: '🌓',
    lastro: {
      doc: '04-lua-fases-e-calendario.md',
      provas: ['Tetrabiblos', 'I.8', 'The Lunation Cycle', 'Dane Rudhyar', '1967'],
    },
  },
  {
    tipo: 'luaCheia',
    longitudeAlvo: 180,
    emoji: '🌕',
    lastro: {
      doc: '04-lua-fases-e-calendario.md',
      provas: ['Tetrabiblos', 'I.8', 'De Re Rustica', 'XI.2.85', 'Naturalis Historia', 'XVIII.321'],
    },
  },
  {
    tipo: 'quartoMinguante',
    longitudeAlvo: 270,
    emoji: '🌗',
    lastro: {
      doc: '04-lua-fases-e-calendario.md',
      provas: [
        'Tetrabiblos',
        'I.8',
        'Naturalis Historia',
        'XVIII.321',
        'De Re Rustica',
        'XI.2.11',
        'De Agri Cultura',
        '31.2',
      ],
    },
  },
];

// Todos os instantes de um marco lunar dentro da janela [inicioMs, fimMs).
// O laço existe porque um mês de calendário pode conter DOIS do mesmo marco —
// o ciclo sinódico tem 29,53 dias e um mês tem até 31. É daí que vem a "lua
// azul", que não é evento astronômico nenhum, é aritmética de calendário.
function instantesDoMarco(longitudeAlvo, inicioMs, fimMs) {
  const achados = [];
  let cursor = new Date(inicioMs);
  // Teto de 3 voltas: proteção contra laço infinito, nunca alcançado na prática.
  for (let i = 0; i < 3; i++) {
    const encontrado = nextExactMoonPhase(longitudeAlvo, cursor, 40);
    if (!encontrado) break;
    const ms = encontrado.getTime();
    if (Number.isNaN(ms) || ms >= fimMs) break;
    if (ms >= inicioMs) achados.push(new Date(ms));
    cursor = new Date(ms + MS_HORA);
  }
  return achados;
}

function eventosLunares(inicioMs, fimMs, T) {
  const out = [];
  for (const marco of MARCOS_LUNARES) {
    const textos = T.marcosLunares[marco.tipo];
    for (const data of instantesDoMarco(marco.longitudeAlvo, inicioMs, fimMs)) {
      const fase = getMoonPhase(data);
      out.push({
        tipo: marco.tipo,
        emoji: marco.emoji,
        titulo: textos.titulo,
        paragrafo: textos.paragrafo,
        fonte: textos.fonte,
        lastro: marco.lastro,
        tradicao: textos.tradicao,
        avisoDeIdade: textos.avisoDeIdade,
        precisao: 'instante',
        data,
        detalhe: {
          longitudeAlvo: marco.longitudeAlvo,
          iluminacao: fase ? fase.illumination : null,
        },
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 2. O SOL MUDANDO DE SIGNO — as "estações" do zodíaco
// ---------------------------------------------------------------------------
// A autoridade sobre QUAL é o signo é signoFromDate() de lib/signs.js, e isso
// não é preguiça: é a única forma de o calendário nunca discordar do resto do
// app sobre onde o Sol está. Se um dia a definição mudar lá, muda aqui junto.
//
// E a data do ingresso NÃO sai de tabela. Ptolomeu (Tetrabiblos I.22) já sabia
// que os signos começam nos equinócios e solstícios, que são INSTANTES — a
// tabela fixa de calendário errava 293 dias em 29.585 nesta base (00-tese.md,
// proposição 1). Então: varre-se dia a dia ao meio-dia UTC procurando a virada
// e depois se faz bissecção no intervalo de 24 h, chamando a MESMA
// signoFromDate com hora, até o minuto. Onze passos de bissecção por virada,
// uma ou duas viradas por mês.
// Quais signos são cardinais (têm equinócio/solstício no ingresso) é
// ESTRUTURA e fica aqui; o texto de cada um ('o equinócio de março' + a
// explicação) é idioma e vive em T.ingresso.cardinais, sob as MESMAS chaves.
const SIGNOS_CARDINAIS = ['Áries', 'Câncer', 'Libra', 'Capricórnio'];

function signoNoInstante(ms) {
  const d = new Date(ms);
  return signoFromDate(dataStrUTC(d), horaStrUTC(d));
}

// Primeiro minuto UTC já no signo novo, dentro de (msA, msB]. Pressupõe
// signo(msA) !== signo(msB) e resolve por bissecção alinhada ao minuto — sem
// alinhar, o truncamento de segundos de signoFromDate faria o laço empacar.
function bisseccaoIngresso(msA, msB) {
  const signoA = signoNoInstante(msA);
  if (!signoA) return null;
  let lo = msA;
  let hi = msB;
  let guarda = 0;
  while (hi - lo > MS_MINUTO && guarda++ < 64) {
    let mid = Math.floor((lo + (hi - lo) / 2) / MS_MINUTO) * MS_MINUTO;
    if (mid <= lo) mid = lo + MS_MINUTO;
    if (mid >= hi) break;
    if (signoNoInstante(mid) === signoA) lo = mid;
    else hi = mid;
  }
  return hi;
}

function eventosIngressoSolar(inicioMs, fimMs, T) {
  const out = [];
  // Um dia de folga de cada lado: a virada pode acontecer entre o meio-dia do
  // último dia do mês anterior e o meio-dia do dia 1 (e a mesma coisa na
  // outra ponta). Só se publica o que cair DENTRO do mês.
  const primeiroMeioDia = inicioMs + 12 * MS_HORA - MS_DIA;
  const ultimoMeioDia = fimMs + 12 * MS_HORA;

  let anterior = { ms: primeiroMeioDia, signo: signoNoInstante(primeiroMeioDia) };
  for (let ms = primeiroMeioDia + MS_DIA; ms <= ultimoMeioDia; ms += MS_DIA) {
    const signo = signoNoInstante(ms);
    if (!signo || !anterior.signo) {
      anterior = { ms, signo };
      continue;
    }
    if (signo !== anterior.signo) {
      const instante = bisseccaoIngresso(anterior.ms, ms);
      if (instante !== null && instante >= inicioMs && instante < fimMs) {
        out.push(montaIngresso(new Date(instante), anterior.signo, signo, T));
      }
    }
    anterior = { ms, signo };
  }
  return out;
}

function montaIngresso(data, signoAnterior, signoNovo, T) {
  const ficha = SIGNS.find((s) => s.name === signoNovo) || null;
  const ehCardinal = SIGNOS_CARDINAIS.includes(signoNovo);
  const cardinal = ehCardinal ? T.ingresso.cardinais[signoNovo] : null;

  // Rótulos por idioma; `detalhe` continua com os nomes canônicos.
  const anteriorDisplay = T.signos[signoAnterior] || signoAnterior;
  const novoDisplay = T.signos[signoNovo] || signoNovo;

  // A glosa de "equinócio" vivia SÓ dentro do bloco cardinal — ou seja, em
  // quatro dos doze ingressos do ano. Nos outros oito a palavra ficava solta no
  // meio da metade que deveria ser povão. Agora ela é da abertura comum, e o
  // bloco cardinal entra depois sem repetir a definição.
  const complemento = !cardinal
    ? ''
    : signoNovo === 'Áries'
      ? T.ingresso.complementoAries
      : preenche(T.ingresso.complementoCardinal, { evento: cardinal.evento, explica: cardinal.explica });

  const abertura = preenche(T.ingresso.abertura, {
    anterior: anteriorDisplay,
    novo: novoDisplay,
    complemento,
  });

  return {
    tipo: 'ingressoSolar',
    emoji: ficha && ficha.emoji ? ficha.emoji : '☉',
    titulo: preenche(T.ingresso.titulo, { signo: novoDisplay }),
    paragrafo: abertura + T.ingresso.recibo,
    fonte: T.ingresso.fonte,
    lastro: {
      doc: '00-tese.md',
      provas: ['Tetrabiblos', 'I.22', 'equinócios e solstícios', '1930'],
    },
    tradicao: cardinal
      ? {
          texto: preenche(T.ingresso.tradicaoTexto, { evento: cardinal.evento }),
          obra: T.ingresso.tradicaoObra,
          autor: T.ingresso.tradicaoAutor,
          seculo: T.ingresso.tradicaoSeculo,
        }
      : null,
    avisoDeIdade: T.ingresso.avisoDeIdade,
    precisao: 'instante',
    data,
    detalhe: {
      signoAnterior,
      signoNovo,
      // Os rótulos no idioma pedido — é o que a tela interpola na temporada.
      signoAnteriorDisplay: anteriorDisplay,
      signoNovoDisplay: novoDisplay,
      elemento: ficha ? ficha.element : null,
      cardinal: ehCardinal,
    },
  };
}

// ---------------------------------------------------------------------------
// 3. MERCÚRIO RETRÓGRADO — começo e fim
// ---------------------------------------------------------------------------
// isMercuryRetrograde() de lib/signs.js compara a longitude de Mercúrio dois
// dias antes e dois dias depois da data: é uma diferença CENTRADA, então a
// virada que ela detecta fica bem perto da estação real, mas a resolução é de
// UM DIA. Por isso estes dois eventos saem com `precisao: 'dia'` e a data é
// ancorada ao meio-dia UTC — anunciar hora exata aqui seria fingir uma
// precisão que o cálculo não tem, que é o oposto do que este app faz.
//
// A convenção do FIM é a mesma de lib/celestialSeasons.js: o ÚLTIMO dia ainda
// retrógrado, não o primeiro dia já direto. O banner da Home já esticava o
// retrógrado um dia a mais uma vez; duas telas discordando da mesma efeméride
// é exatamente o que o público deste app confere em outra fonte.
// Texto nos packs (T.retro.inicio / T.retro.fim); aqui fica só o esqueleto.
//
// O dado do NYT (aviso do início) é marcado ⚠️ na base (11 §10, item 10:
// "Relatada por dois veículos; não fui ao arquivo do jornal confirmar") — e o
// texto dos três idiomas diz isso na cara, notícia de segunda mão.
// E "destrava" segue proibida nos três idiomas (unlock/destraba): num
// calendário ela vira "no dia 23 as coisas destravam" — promessa de resultado
// com data marcada. test/calendarioIdiomas.test.js varre.
const RETRO_INICIO = {
  tipo: 'mercurioRetrogradoInicio',
  emoji: '☿',
  lastro: {
    doc: '11-planetas-em-profundidade.md',
    provas: ['Anthologiae', 'delay expectations', 'Tetrabiblos', '1996'],
  },
};

const RETRO_FIM = {
  tipo: 'mercurioRetrogradoFim',
  emoji: '☿',
  lastro: {
    doc: '11-planetas-em-profundidade.md',
    provas: ['Anthologiae', 'Christian Astrology', 'Lilly', '1647'],
  },
};

function eventosMercurioRetrogrado(inicioMs, fimMs, T) {
  // Um dia de folga de cada lado para saber se o dia 1 e o último dia são
  // transição ou continuação de um retrógrado que atravessa o mês.
  const estados = [];
  for (let ms = inicioMs - MS_DIA; ms <= fimMs; ms += MS_DIA) {
    const d = new Date(ms + 12 * MS_HORA);
    estados.push({ ms, data: d, retro: isMercuryRetrograde(dataStrUTC(d)) });
  }

  const out = [];
  for (let i = 1; i < estados.length - 1; i++) {
    const atual = estados[i];
    if (atual.retro !== true) continue;
    if (atual.ms < inicioMs || atual.ms >= fimMs) continue;
    if (estados[i - 1].retro === false) {
      out.push({ ...RETRO_INICIO, ...T.retro.inicio, precisao: 'dia', data: atual.data, detalhe: { retrogrado: true } });
    }
    if (estados[i + 1].retro === false) {
      out.push({ ...RETRO_FIM, ...T.retro.fim, precisao: 'dia', data: atual.data, detalhe: { retrogrado: true } });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 4. ASPECTO EXATO ENTRE OS PLANETAS PESSOAIS
// ---------------------------------------------------------------------------
// POR QUE A LUA FICA DE FORA DESTA LISTA, e não é para poupar linha:
//
//   (a) Os aspectos da Lua com o SOL já são os quatro eventos da seção 1 — o
//       capítulo que os descreve, Tetrabiblos I.8, se chama "Of the Power of
//       the Aspects to the Sun". Repetir aqui seria contar duas vezes.
//   (b) Os aspectos da Lua com os planetas são uns vinte por mês e duram
//       horas. Publicar vinte eventos de algumas horas afogaria os seis ou oito
//       que importam, e a amostragem usada aqui não tem resolução para datá-los
//       com honestidade.
//
// Sobram Sol, Mercúrio, Vênus e Marte: seis pares, todos com movimento
// relativo abaixo de ~3,6°/dia, que é o que torna esta varredura confiável.
//
// COMO SE ACHA O INSTANTE EXATO, em três passadas, todas em cima da MESMA
// aspects() de lib/signs.js:
//   1. dia a dia ao meio-dia UTC → candidatos (mínimos locais de orbe ≤ 2,5°;
//      com 3,6°/dia de movimento relativo, a amostra diária mais próxima de um
//      aspecto exato fica sempre a menos de 1,8°, então 2,5° não deixa passar);
//   2. de hora em hora, ±30 h em volta do candidato;
//   3. de 4 em 4 minutos, ±1 h em volta da melhor hora.
// Só é publicado o que fechar com orbe ≤ ORBE_EXATO (0,02°) — nessa resolução
// um aspecto que de fato cruza o ângulo fecha em milésimos de grau, e um que
// só chega perto e volta (planeta que estaciona no meio da aproximação) fecha
// bem acima. A diferença entre "exato" e "quase" é medida, não arbitrada.
export const PLANETAS_DO_ASPECTO = ['Sol', 'Mercúrio', 'Vênus', 'Marte'];

// Espelha a tabela de ASPECTS_TABLE de lib/signs.js, que é privada de lá. Não
// é uma segunda definição da matemática — é só o ângulo canônico de cada nome
// devolvido por aspects(). O teste confere `orb ≈ |exactAngle - ângulo|` contra
// a saída real de aspects() e quebra se lib/signs.js mudar a tabela.
export const ANGULO_DO_ASPECTO = {
  'Conjunção': 0,
  'Sextil': 60,
  'Quadratura': 90,
  'Trígono': 120,
  'Oposição': 180,
};

// A glosa de cada aspecto ("um quarto de volta entre os dois"), o nome por
// idioma e a concordância de "exato/exata" vivem nos packs (T.aspecto.glosa,
// T.aspecto.nomes, T.aspecto.exato), chaveados pelo nome canônico de
// aspects(). O glifo é notação, não idioma — fica aqui.
const GLIFO_DO_ASPECTO = {
  'Conjunção': '☌',
  'Sextil': '⚹',
  'Quadratura': '□',
  'Trígono': '△',
  'Oposição': '☍',
};

const ORBE_CANDIDATO = 2.5;
const ORBE_EXATO = 0.02;

function aspectosPessoais(dataStr, horaStr) {
  const todos = aspects(dataStr, horaStr);
  if (!todos) return null;
  const mapa = new Map();
  for (const a of todos) {
    if (!PLANETAS_DO_ASPECTO.includes(a.planetA)) continue;
    if (!PLANETAS_DO_ASPECTO.includes(a.planetB)) continue;
    if (!(a.aspectType in ANGULO_DO_ASPECTO)) continue;
    mapa.set(`${a.planetA}|${a.planetB}|${a.aspectType}`, a);
  }
  return mapa;
}

function orbeEm(ms, chave) {
  const d = new Date(ms);
  const mapa = aspectosPessoais(dataStrUTC(d), horaStrUTC(d));
  if (!mapa) return Infinity;
  const achado = mapa.get(chave);
  return achado ? achado.orb : Infinity;
}

// Menor orbe dentro de [de, ate] amostrando de `passo` em `passo`.
function minimoNaJanela(chave, de, ate, passo) {
  let melhorMs = de;
  let melhorOrbe = Infinity;
  for (let ms = de; ms <= ate; ms += passo) {
    const orbe = orbeEm(ms, chave);
    if (orbe < melhorOrbe) {
      melhorOrbe = orbe;
      melhorMs = ms;
    }
  }
  return { ms: melhorMs, orbe: melhorOrbe };
}

function eventosAspectoExato(inicioMs, fimMs, T) {
  const primeiroMeioDia = inicioMs + 12 * MS_HORA - MS_DIA;
  const ultimoMeioDia = fimMs + 12 * MS_HORA;

  // Passada 1 — série diária de orbes por par+aspecto.
  const serie = [];
  for (let ms = primeiroMeioDia; ms <= ultimoMeioDia; ms += MS_DIA) {
    const d = new Date(ms);
    const mapa = aspectosPessoais(dataStrUTC(d), horaStrUTC(d));
    if (!mapa) return [];
    serie.push({ ms, mapa });
  }

  const candidatos = [];
  for (let i = 1; i < serie.length - 1; i++) {
    for (const [chave, a] of serie[i].mapa) {
      if (a.orb > ORBE_CANDIDATO) continue;
      const antes = serie[i - 1].mapa.has(chave) ? serie[i - 1].mapa.get(chave).orb : Infinity;
      const depois = serie[i + 1].mapa.has(chave) ? serie[i + 1].mapa.get(chave).orb : Infinity;
      if (a.orb <= antes && a.orb <= depois) candidatos.push({ chave, ms: serie[i].ms, aspecto: a });
    }
  }

  const out = [];
  const vistos = new Set();
  for (const cand of candidatos) {
    const porHora = minimoNaJanela(cand.chave, cand.ms - 30 * MS_HORA, cand.ms + 30 * MS_HORA, MS_HORA);
    if (!Number.isFinite(porHora.orbe)) continue;
    const fino = minimoNaJanela(cand.chave, porHora.ms - MS_HORA, porHora.ms + MS_HORA, 4 * MS_MINUTO);
    if (fino.orbe > ORBE_EXATO) continue;
    if (fino.ms < inicioMs || fino.ms >= fimMs) continue;
    const assinatura = `${cand.chave}|${Math.round(fino.ms / (12 * MS_HORA))}`;
    if (vistos.has(assinatura)) continue;
    vistos.add(assinatura);
    out.push(montaAspecto(new Date(fino.ms), cand.aspecto, fino.orbe, T));
  }
  return out;
}

function montaAspecto(data, aspecto, orbeFinal, T) {
  const { planetA, planetB, aspectType } = aspecto;
  const grau = ANGULO_DO_ASPECTO[aspectType];
  const ehConjuncao = aspectType === 'Conjunção';

  // Rótulos por idioma; `detalhe` continua canônico (nomes de lib/signs.js).
  const planetADisplay = T.planetas[planetA] || planetA;
  const planetBDisplay = T.planetas[planetB] || planetB;
  const nomeAspecto = (T.aspecto.nomes[aspectType] || aspectType).toLowerCase();

  const abertura = ehConjuncao
    ? preenche(T.aspecto.aberturaConjuncao, {
        planetA: planetADisplay,
        planetB: planetBDisplay,
        glosa: T.aspecto.glosa[aspectType],
      })
    : preenche(T.aspecto.aberturaOutros, {
        planetA: planetADisplay,
        planetB: planetBDisplay,
        grau,
        aspecto: nomeAspecto,
        glosa: T.aspecto.glosa[aspectType],
      });

  const recibo = ehConjuncao ? T.aspecto.reciboConjuncao : T.aspecto.reciboOutros;

  return {
    tipo: 'aspectoExato',
    emoji: GLIFO_DO_ASPECTO[aspectType] || '✶',
    titulo: preenche(T.aspecto.titulo, {
      planetA: planetADisplay,
      planetB: planetBDisplay,
      aspecto: nomeAspecto,
      // Concordância por idioma: "conjunção exata" mas "trígono exato" (no
      // inglês é sempre "exact"). Sem isto o título sai "em conjunção exato",
      // que é o tipo de detalhe que faz o leitor desconfiar do resto — e o
      // resto aqui é efeméride.
      exato: T.aspecto.exato[aspectType] || 'exato',
    }),
    paragrafo: abertura + recibo,
    // A fonte fica nos packs escrita por extenso nos dois ramos de propósito.
    // Um número de capítulo sozinho dentro de aspas (letra, ponto, número) tem
    // exatamente a cara de uma chave de tradução, e test/i18nKeysExist.test.js
    // — que varre TODO literal com dois segmentos separados por ponto nas
    // pastas lib/, screens/, components/ e context/, comentário incluído —
    // acusaria o capítulo como chave ausente do dicionário.
    fonte: ehConjuncao ? T.aspecto.fonteConjuncao : T.aspecto.fonteOutros,
    lastro: {
      doc: '01-astrologia-fundamentos.md',
      provas: ['Tetrabiblos', 'I.13', 'I.24', 'bodily application'],
    },
    tradicao: T.aspecto.tradicao,
    avisoDeIdade: T.aspecto.avisoDeIdade,
    precisao: 'instante',
    data,
    detalhe: {
      planetA,
      planetB,
      aspecto: aspectType,
      grauExato: grau,
      orbeNoInstante: Math.round(orbeFinal * 1000) / 1000,
    },
  };
}

// ---------------------------------------------------------------------------
// A FUNÇÃO PÚBLICA
// ---------------------------------------------------------------------------
// `mes` é 1-12 (humano), mesma convenção de getMoonPhaseForMonth — pra a
// pegadinha do Date 0-based do JS não vazar pra quem chama.
//
// `lang` ('pt' | 'es' | 'en', default e fallback 'pt') escolhe o pack de
// TEXTO — datas, detalhes e lastro são idênticos nos três idiomas, porque
// efeméride não tem idioma. Chamada antiga (sem lang) devolve o PT de sempre.
//
// Devolve SEMPRE o mesmo formato, com ou sem efeméride:
//   { ano, mes, ceuDisponivel, eventos, motivoIndisponivel, mensagem }
//
// DOIS CAMPOS PARA A INDISPONIBILIDADE, e a separação não é preciosismo:
//   motivoIndisponivel → técnico, para log e para o teste ("astronomy-engine
//                        ausente"). Nunca vai pra tela.
//   mensagem           → o que a pessoa lê. Nome de pacote npm e a palavra
//                        "efeméride" não entram aqui.
//
// CUSTO E CACHE. Medido nesta máquina: 138 ms na primeira chamada de um mês e
// ~52 ms nas seguintes — o grosso é eventosAspectoExato (amostragem diária +
// horária + fina, recalculando sete planetas por amostra). Em Hermes num
// Android mediano isso trava a thread JS por centenas de ms, e navegar mês a
// mês recalculava tudo de novo toda vez. O resultado é determinístico, então
// vira cache por `${ano}-${mes}-${idioma}` — o idioma ENTRA na chave, senão
// navegar em espanhol depois de abrir em português serviria texto do cache no
// idioma errado.
//
// O cache é consultado DEPOIS da sonda de efeméride, de propósito: sem
// efeméride a resposta continua sendo "indisponível" mesmo que o mês já tenha
// sido calculado antes. Cache que responde por cima de uma sonda que falhou é
// exatamente o "nunca fabrica" sendo furado por dentro.
const _cache = new Map();

export function calendarioCosmico(ano, mes, lang = 'pt') {
  const idioma = idiomaValido(lang);
  const T = PACKS[idioma];
  const anoOk = Number.isInteger(ano) && ano >= 1700 && ano <= 2400;
  const mesOk = Number.isInteger(mes) && mes >= 1 && mes <= 12;
  if (!anoOk || !mesOk) {
    return {
      ano,
      mes,
      ceuDisponivel: false,
      eventos: [],
      motivoIndisponivel: 'mês ou ano fora do intervalo aceito (mês 1-12, ano 1700-2400)',
      // `mensagemKey` é o que a tela imprime; `mensagem` fica como fallback em
      // português pra quem consumir o motor fora da tela (teste, script). Isto
      // é ERRO DE UI, não conteúdo histórico — por isso foi das primeiras
      // strings do arquivo a virar chave.
      mensagemKey: 'calendario.unavailable.outOfRange',
      mensagem: 'Este mês está fora do intervalo que o app calcula.',
    };
  }

  const inicioMs = Date.UTC(ano, mes - 1, 1, 0, 0, 0);
  const fimMs = Date.UTC(ano, mes, 1, 0, 0, 0);

  // Sonda única de efeméride, igual getSkyTuning() em lib/cosmicSound.js.
  // Sem ela, nada é estimado: devolve-se lista vazia e o sinalizador.
  if (!getMoonPhase(new Date(inicioMs + 12 * MS_HORA))) {
    return {
      ano,
      mes,
      ceuDisponivel: false,
      eventos: [],
      motivoIndisponivel:
        'sem efeméride disponível (astronomy-engine ausente) — o calendário fica vazio em vez de estimar datas',
      mensagemKey: 'calendario.unavailable.noEphemeris',
      mensagem: 'Hoje não deu pra calcular o céu deste mês. A gente prefere deixar vazio a chutar data.',
    };
  }

  const chave = `${ano}-${mes}-${idioma}`;
  if (_cache.has(chave)) return _cache.get(chave);

  const eventos = [
    ...eventosLunares(inicioMs, fimMs, T),
    ...eventosIngressoSolar(inicioMs, fimMs, T),
    ...eventosMercurioRetrogrado(inicioMs, fimMs, T),
    ...eventosAspectoExato(inicioMs, fimMs, T),
  ];

  eventos.sort((a, b) => a.data - b.data);

  const resultado = {
    ano,
    mes,
    ceuDisponivel: true,
    motivoIndisponivel: null,
    mensagem: null,
    eventos: eventos.map((e) => ({
      ...e,
      // UTC: o instante, para conferir contra efeméride pública.
      dia: e.data.getUTCDate(),
      dataISO: e.data.toISOString(),
      // LOCAL: o rótulo, que é o que a tela mostra. Ver o cabeçalho.
      diaLocal: e.data.getDate(),
      dataLocal: localDayStr(e.data),
    })),
  };
  _cache.set(chave, resultado);
  return resultado;
}

// Atalho para o mês corrente — o caso mais comum de tela. O mês é escolhido
// pelo relógio LOCAL, mesma convenção de lib/localDay.js e dos rótulos acima.
export function calendarioCosmicoDoMesAtual(agora = new Date(), lang = 'pt') {
  return calendarioCosmico(agora.getFullYear(), agora.getMonth() + 1, lang);
}
