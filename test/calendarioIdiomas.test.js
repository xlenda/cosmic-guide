// test/calendarioIdiomas.test.js
//
// FRENTE 5 DA INTERNACIONALIZAÇÃO — Calendário Cósmico + Calendário Lunar.
// O que este arquivo protege, em ordem de gravidade:
//
//   1. O PT É OURO E NÃO MUDA UM BYTE. As GOLDENS abaixo foram capturadas
//      rodando o motor ANTES da extração dos packs (31/07/2026) — texto
//      exato, gravado aqui dentro. O teste prova que com lang='pt' E sem
//      lang a saída é IDÊNTICA à de antes. E além das amostras, um hash
//      SHA-256 do corpus INTEIRO (2024 + 2026 + as 8 fases) trava o resto:
//      refatoração que altera o texto PT é falha, não melhoria.
//   2. PARIDADE DOS PACKS. calendario.es.js e calendario.en.js têm
//      exatamente as mesmas chaves do .pt.js, nenhum valor vazio, os mesmos
//      placeholders {x} em cada valor, o mesmo sentinela de recibo, e todos
//      os loci (Tetrabiblos I.13, Naturalis Historia XVIII.321, XI.2.85…),
//      anos e números do PT presentes na tradução. Locus não se traduz.
//   3. A LINHA VERMELHA NOS TRÊS IDIOMAS. As palavras proibidas têm primos:
//      em ES aliviar/calmar/sanar/curar/tratar/energizar, em EN relieve/
//      soothe/calm/heal/cure/treat/energize. Nenhuma entra. Nada de promessa,
//      nada de instrução ao leitor nos eventos, nada de aviso defensivo.
//   4. A CORREÇÃO HISTÓRICA SOBREVIVE À TRADUÇÃO. "Colher para guardar é na
//      MINGUANTE" (Plínio XVIII.321; a cheia em Columela XI.2.85 é dia de
//      SEMEAR) tem que sair com a mesma clareza em espanhol e inglês.
//   5. OS VERBATINS DE ROBBINS ficam em inglês nos três idiomas: no EN
//      aparecem direto; no ES aparecem como citação + paráfrase em espanhol.
//
// Mesma mecânica de corpus de test/calendarioCosmico.test.js (que continua
// dono da varredura PT dos eventos — este arquivo cobre PT-golden, ES e EN).

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const {
  calendarioCosmico,
  calendarioCosmicoDoMesAtual,
  MARCA_RECIBO,
  SEM_FONTE_ANTIGA,
} = require('../lib/calendarioCosmico.js');
const { getMoonPhase, getMoonPhaseForMonth } = require('../lib/lunarCalendar.js');

const PACK_PT = require('../lib/traducoes/calendario.pt.js').default;
const PACK_ES = require('../lib/traducoes/calendario.es.js').default;
const PACK_EN = require('../lib/traducoes/calendario.en.js').default;

// ---------------------------------------------------------------------------
// (1) AS GOLDENS — capturadas ANTES da extração, texto exato de produção.
// ---------------------------------------------------------------------------
// GOLDEN_EVENTOS: um evento de cada tipo (e os DOIS ramos de texto do
// aspecto), com mês fixo de 2024. GOLDEN_FASES: as 8 reflexões da Lua nos
// mesmos 8 instantes de test/lunarCalendar.test.js.
const GOLDEN = {
  "eventos": {
    "luaNova": {
      "ano": 2024,
      "mes": 1,
      "dataISO": "2024-01-11T11:57:56.513Z",
      "titulo": "Lua Nova",
      "paragrafo": "A Lua sumiu do céu — e sumiu porque está do mesmo lado que o Sol, com a metade iluminada virada pro lado de lá. É o zero do ciclo: daqui pra frente a luz volta a crescer, por uns 29 dias e meio, até tudo recomeçar. E não é uma faixa de dias: é um instante, o minuto em que Sol e Lua ficam na mesma longitude vistos da Terra. Quem escreveu isso: Cláudio Ptolomeu — o Tetrabiblos I.8 (séc. II d.C.) conta os quatro trechos do mês lunar a partir daqui. E o mês contado dia a dia, do 1º ao 30º, já está em Hesíodo, Os Trabalhos e os Dias, vv. 765-828 (séc. VII a.C.): começar o mês aqui é dos costumes genuinamente antigos.",
      "fonte": "Cláudio Ptolomeu, Tetrabiblos I.8 — séc. II d.C.; Hesíodo, Os Trabalhos e os Dias vv. 765-828 — séc. VII a.C.",
      "avisoDeIdade": "Ler a Lua Nova como hora de \"plantar uma intenção\" é prática popular contemporânea, sem fonte antiga localizada. O que é antigo mesmo é o marco: o mês começava aqui.",
      "tradicao": {
        "texto": "A lavoura romana plantava figueira, macieira, oliveira, pereira e videira na Lua Nova, aquela em que ela some do céu — os romanos chamavam de lua muda, ou interlúnio — e sempre à tarde.",
        "obra": "De Agri Cultura 40.1",
        "autor": "Catão, o Velho",
        "seculo": "séc. II a.C."
      },
      "emoji": "🌑",
      "precisao": "instante"
    },
    "luaCheia": {
      "ano": 2024,
      "mes": 1,
      "dataISO": "2024-01-25T17:54:43.297Z",
      "titulo": "Lua Cheia",
      "paragrafo": "A Lua aparece inteira acesa e nasce mais ou menos na hora em que o Sol se põe. Ela está do lado oposto ao Sol, com a Terra no meio, e por isso a gente enxerga a cara dela toda iluminada. Também é um instante e não uma temporada — os quatro ou cinco dias em que ela \"parece cheia\" são limitação do olho: a conta marca um minuto só. Quem escreveu isso: Cláudio Ptolomeu — o Tetrabiblos I.8 (séc. II d.C.) marca aqui o meio do ciclo, entre os dois quartos.",
      "fonte": "Cláudio Ptolomeu, Tetrabiblos I.8 — séc. II d.C.",
      "avisoDeIdade": "A fama de \"fase da colheita\" inverte a fonte romana: colher para guardar era minguante (Plínio, Naturalis Historia XVIII.321, séc. I d.C.).",
      "tradicao": {
        "texto": "Columela mandava semear favas na véspera ou no próprio dia da lua cheia. E, ao contrário da fama desta fase, não era aqui que se colhia para guardar: Plínio, o Velho registrava que tudo o que se corta, se colhe e se tosquia sofria menos dano com a lua minguante.",
        "obra": "De Re Rustica XI.2.85 e Naturalis Historia XVIII.321",
        "autor": "Columela e Plínio, o Velho",
        "seculo": "séc. I d.C."
      },
      "emoji": "🌕",
      "precisao": "instante"
    },
    "quartoCrescente": {
      "ano": 2024,
      "mes": 1,
      "dataISO": "2024-01-18T03:53:11.505Z",
      "titulo": "Quarto Crescente",
      "paragrafo": "Meio disco aceso, meio disco apagado, com o corte reto no meio: é o que se vê quando a Lua está a 90° do Sol, num ângulo reto visto da Terra. Daqui até a cheia a luz só cresce. Quem escreveu isso: Cláudio Ptolomeu, Tetrabiblos I.8 (séc. II d.C.) — e vale saber que a divisão antiga é essa, de QUATRO quartos. As oito fases com nome e leitura de personalidade são bem mais novas: Dane Rudhyar, The Lunation Cycle, 1967.",
      "fonte": "Cláudio Ptolomeu, Tetrabiblos I.8 — séc. II d.C.",
      "avisoDeIdade": "A moldura de oito fases com significado psicológico é de Dane Rudhyar (The Lunation Cycle, 1967). Chamar as oito de \"tradição milenar\" credita a ele uma idade que ele não tem.",
      "tradicao": {
        "texto": "Ptolomeu descrevia os quatro trechos do mês lunar como qualidades do ar e da matéria: da nova ao quarto crescente, mais produtor de umidade; do quarto crescente à cheia, de calor; da cheia ao quarto minguante, de secura; do quarto minguante ao sumiço, de frio. Era descrição de clima, não de gente.",
        "obra": "Tetrabiblos I.8",
        "autor": "Cláudio Ptolomeu",
        "seculo": "séc. II d.C."
      },
      "emoji": "🌓",
      "precisao": "instante"
    },
    "quartoMinguante": {
      "ano": 2024,
      "mes": 1,
      "dataISO": "2024-01-04T03:31:09.744Z",
      "titulo": "Quarto Minguante",
      "paragrafo": "De novo meio disco aceso, agora do outro lado. A Lua voltou aos 90° do Sol, só que descendo: a luz vai encolher até ela sumir de vez. Quem escreveu isso: Cláudio Ptolomeu, Tetrabiblos I.8 (séc. II d.C.), o mesmo capítulo que parte o mês lunar em quatro e não em oito.",
      "fonte": "Cláudio Ptolomeu, Tetrabiblos I.8 — séc. II d.C.",
      "avisoDeIdade": null,
      "tradicao": {
        "texto": "Este é o trecho do mês que mais aparece escrito na lavoura antiga. Era na lua minguante que se cortava madeira, se colhia para secar, se tosquiava, se capinava e se estercava — tudo o que se queria que diminuísse em vez de crescer.",
        "obra": "Naturalis Historia XVIII.321-322, De Re Rustica XI.2.11 e De Agri Cultura 31.2",
        "autor": "Plínio, o Velho, Columela e Catão, o Velho",
        "seculo": "séc. II a.C. a séc. I d.C."
      },
      "emoji": "🌗",
      "precisao": "instante"
    },
    "ingressoSolar": {
      "ano": 2024,
      "mes": 1,
      "dataISO": "2024-01-20T14:08:00.000Z",
      "titulo": "Sol entra em Aquário",
      "paragrafo": "O Sol troca de signo: sai de Capricórnio e entra em Aquário. E a data muda de ano pra ano, porque não é uma casinha do calendário — é um instante astronômico, o minuto em que o Sol termina mais 30° de caminho no círculo do zodíaco. Outra coisa que confunde muita gente: o signo não é a constelação que está lá atrás. É o pedaço de céu contado a partir do equinócio de março — o instante em que dia e noite empatam e o ano do céu recomeça. Quem escreveu isso: Cláudio Ptolomeu, Tetrabiblos I.22 (séc. II d.C.): os começos dos signos se contam dos equinócios e solstícios \"and from no other source\" — e de nenhuma outra origem.",
      "fonte": "Cláudio Ptolomeu, Tetrabiblos I.22 — séc. II d.C.",
      "avisoDeIdade": "\"Ofiúco, o 13º signo que escondem\" confunde signo com constelação. Os limites das constelações usados pela astronomia são de 1930 (União Astronômica Internacional), e o zodíaco de doze partes iguais é muito anterior a isso.",
      "tradicao": null,
      "emoji": "♒",
      "precisao": "instante"
    },
    "mercurioRetrogradoInicio": {
      "ano": 2024,
      "mes": 4,
      "dataISO": "2024-04-02T12:00:00.000Z",
      "titulo": "Mercúrio começa a retrogradar",
      "paragrafo": "Mercúrio parece andar para trás no céu — e \"parece\" é a palavra certa, porque é ilusão de perspectiva. A Terra está ultrapassando Mercúrio por fora da curva, e o planeta parece recuar contra o fundo de estrelas, do mesmo jeito que o carro do lado parece dar ré quando o seu passa. Nada freia e nada inverte de verdade. Isso acontece três ou quatro vezes por ano, dura umas três semanas, e não tem nada de raro: medindo a efeméride — as tabelas de posição dos planetas que astrônomo e astrólogo usam igual —, em 86% dos dias existe algum planeta retrógrado no céu. Quem escreveu isso: Vétio Valente, Anthologiae V (séc. II d.C.). E o que ele diz é uma coisa só: atraso — planetas retrógrados \"delay expectations, actions, profits, and enterprises\", atrasam expectativas, ações, lucros e empreendimentos.",
      "fonte": "Vétio Valente, Anthologiae V — séc. II d.C.",
      "avisoDeIdade": "\"Mercúrio retrógrado quebra aparelho, derruba contrato e traz ex de volta\" não está em fonte antiga nenhuma: é folclore do século XX e do século XXI. Costuma-se dizer que a primeira menção de \"Mercury retrograde\" no New York Times é de 1996 — isso é relatado por veículos secundários e não foi conferido no arquivo do jornal, então fica como notícia de segunda mão. Valente também não fala de Mercúrio em particular: a regra dele vale igual para Marte, Júpiter e Saturno.",
      "tradicao": {
        "texto": "Ptolomeu nem classificava a retrogradação como boa ou má: para ele era uma fase térmica do ciclo do planeta — da primeira estação (o dia em que o planeta parece parar antes de voltar) ao nascer acrônico (quando o planeta surge no leste bem na hora em que o Sol se põe), calor; do nascer acrônico à segunda estação, secura.",
        "obra": "Tetrabiblos I.8",
        "autor": "Cláudio Ptolomeu",
        "seculo": "séc. II d.C."
      },
      "emoji": "☿",
      "precisao": "dia"
    },
    "mercurioRetrogradoFim": {
      "ano": 2024,
      "mes": 1,
      "dataISO": "2024-01-01T12:00:00.000Z",
      "titulo": "Último dia de Mercúrio retrógrado",
      "paragrafo": "Mercúrio para e volta a andar para frente contra o fundo de estrelas. É a chamada segunda estação — o dia em que o planeta parece parar antes de retomar o rumo —, e a partir do dia seguinte o movimento aparente é direto de novo. Quem escreveu isso: Vétio Valente, Anthologiae V (séc. II d.C.) — e Valente registrava também o outro lado, que a internet costuma cortar fora: passada a segunda estação, os planetas \"cancel any delay and reinstate the same activities\", cancelam o atraso e retomam as mesmas atividades.",
      "fonte": "Vétio Valente, Anthologiae V — séc. II d.C.",
      "avisoDeIdade": "A síntese honesta da tradição sobre retrogradação cabe em três palavras: demora, revisita, contradiz. Nada além disso está em fonte antiga.",
      "tradicao": {
        "texto": "Lilly classificava a retrogradação como debilidade acidental — na régua dele, um planeta em posição fraca, não um planeta ruim —, sinal de assunto que andava para trás e demorava a se resolver, nunca de catástrofe.",
        "obra": "Christian Astrology",
        "autor": "William Lilly",
        "seculo": "séc. XVII (1647/1659)"
      },
      "emoji": "☿",
      "precisao": "dia"
    },
    "aspectoConjuncao": {
      "ano": 2024,
      "mes": 1,
      "dataISO": "2024-01-27T14:56:00.000Z",
      "titulo": "Mercúrio e Marte em conjunção exata",
      "paragrafo": "Mercúrio e Marte ficam hoje no mesmo ponto do círculo do zodíaco, vistos daqui da Terra — é isso que \"conjunção\" quer dizer: mesmo grau, um atrás do outro na nossa linha de visada. Ângulo é ângulo, dá pra conferir em qualquer tabela de posição de planeta, e o encontro tem hora marcada. Quem escreveu isso: Cláudio Ptolomeu, Tetrabiblos I.13 e I.24 (séc. II d.C.) — e aqui vai um detalhe que quase todo aplicativo erra: em Ptolomeu a conjunção NÃO é um aspecto. Os aspectos dele são quatro (oposição 180°, trígono 120°, quadratura 90°, sextil 60°), e a conjunção aparece em I.24 como \"aplicação corporal\", uma categoria à parte.",
      "fonte": "Cláudio Ptolomeu, Tetrabiblos I.13 e I.24 — séc. II d.C.",
      "avisoDeIdade": "Os graus de tolerância (\"orbe\") usados para achar o aspecto — 8° para conjunção, oposição, quadratura e trígono, 6° para sextil — são convenção moderna de software: não existe tabela de orbe em graus no Tetrabiblos. Aqui eles servem só para localizar o par; a hora publicada é a do ângulo exato.",
      "tradicao": {
        "texto": "Ptolomeu chamava trígono e sextil de harmônicos, e quadratura e oposição de desarmônicos. A razão que ele dava era o gênero dos signos: os harmônicos uniriam signos do mesmo gênero, e os desarmônicos, de gêneros opostos. A conta fecha para a quadratura e não fecha para a oposição, porque a seis signos de distância o gênero é sempre o mesmo. O furo é dele, e registrar vale mais do que repetir a frase como se ela fechasse.",
        "obra": "Tetrabiblos I.12-I.13",
        "autor": "Cláudio Ptolomeu",
        "seculo": "séc. II d.C."
      },
      "emoji": "☌",
      "precisao": "instante"
    },
    "aspectoOutro": {
      "ano": 2024,
      "mes": 6,
      "dataISO": "2024-06-21T16:24:00.000Z",
      "titulo": "Mercúrio e Marte em sextil exato",
      "paragrafo": "Vistos daqui da Terra, Mercúrio e Marte ficam hoje a exatos 60° um do outro sobre o círculo do zodíaco — é isso que \"sextil\" quer dizer: um sexto de volta entre os dois. Ângulo é ângulo: dá pra conferir em qualquer tabela de posição de planeta, e o instante tem hora marcada. Quem escreveu isso: Cláudio Ptolomeu — o Tetrabiblos I.13 (séc. II d.C.) reconhece quatro aspectos e só quatro (oposição 180°, trígono 120°, quadratura 90° e sextil 60°), e tira esses ângulos de proporções musicais aplicadas ao semicírculo.",
      "fonte": "Cláudio Ptolomeu, Tetrabiblos I.13 — séc. II d.C.",
      "avisoDeIdade": "Os graus de tolerância (\"orbe\") usados para achar o aspecto — 8° para conjunção, oposição, quadratura e trígono, 6° para sextil — são convenção moderna de software: não existe tabela de orbe em graus no Tetrabiblos. Aqui eles servem só para localizar o par; a hora publicada é a do ângulo exato.",
      "tradicao": {
        "texto": "Ptolomeu chamava trígono e sextil de harmônicos, e quadratura e oposição de desarmônicos. A razão que ele dava era o gênero dos signos: os harmônicos uniriam signos do mesmo gênero, e os desarmônicos, de gêneros opostos. A conta fecha para a quadratura e não fecha para a oposição, porque a seis signos de distância o gênero é sempre o mesmo. O furo é dele, e registrar vale mais do que repetir a frase como se ela fechasse.",
        "obra": "Tetrabiblos I.12-I.13",
        "autor": "Cláudio Ptolomeu",
        "seculo": "séc. II d.C."
      },
      "emoji": "⚹",
      "precisao": "instante"
    }
  },
  "fases": [
    {
      "iso": "2024-01-11T11:57:00.000Z",
      "name": "Lua Nova",
      "emoji": "🌑",
      "reflexao": "Céu escuro, mês começando: a Lua Nova é o ponto zero do ciclo. Fica o convite simbólico à pausa antes de agir — vale anotar o que você quer deixar nascer neste ciclo. E o recibo é honesto: abrir o mês na Lua Nova é costume genuinamente milenar, de todo calendário lunisolar antigo (o que conta os meses pela Lua); já lê-la como hora de «plantar uma intenção» é leitura contemporânea, não antiga."
    },
    {
      "iso": "2024-01-15T04:32:24.000Z",
      "name": "Lua Crescente",
      "emoji": "🌒",
      "reflexao": "A luz está crescendo, e a leitura aqui é de construção: dar os primeiros passos no que começou na Lua Nova. É um lembrete simbólico de manter o ritmo — pequenas ações contam mais que grandes decisões agora. Recibo: essa leitura é contemporânea, não antiga — a moldura de oito fases é de 1967 (Dane Rudhyar, «The Lunation Cycle»)."
    },
    {
      "iso": "2024-01-18T21:07:48.000Z",
      "name": "Quarto Crescente",
      "emoji": "🌓",
      "reflexao": "Metade da luz, primeira encruzilhada do ciclo: o convite simbólico é revisar o plano — vale perguntar o que precisa de mais foco esta semana. Ajuste de rota e tensão criativa são leitura contemporânea, isso fica dito. Mas o marco em si é divisão antiga de verdade: Ptolomeu parte o ciclo em quatro (Tetrabiblos I.8), e é este um dos quatro."
    },
    {
      "iso": "2024-01-22T13:43:12.000Z",
      "name": "Lua Gibosa Crescente",
      "emoji": "🌔",
      "reflexao": "Quase cheia (é isso que «gibosa» quer dizer: mais de meia Lua já iluminada), a hora é de refinar detalhes. Fica o convite simbólico à paciência com o que já está em andamento — ajustar é diferente de recomeçar. Recibo honesto: essa leitura é contemporânea, não herança antiga; a gibosa nem sequer é uma fase nomeada fora da moldura de oito, que é de 1967."
    },
    {
      "iso": "2024-01-26T06:18:36.000Z",
      "name": "Lua Cheia",
      "emoji": "🌕",
      "reflexao": "A Lua está no pico de luz do ciclo — isso é astronomia — e o convite simbólico é ver com clareza: observar o que já vinha se desenhando. Todo mundo repete que Lua Cheia é dia de colheita, mas a fonte romana diz o contrário. Columela põe na cheia o dia de SEMEAR fava (XI.2.85). Colher e guardar é coisa da minguante — é Plínio quem a reserva pra isso (Naturalis Historia XVIII.321). Ou seja: a fama de fase da colheita inverte a fonte."
    },
    {
      "iso": "2024-01-29T22:54:00.000Z",
      "name": "Lua Gibosa Minguante",
      "emoji": "🌖",
      "reflexao": "A luz começou a ceder, e era agora que a lavoura romana colhia para guardar. Gratidão e partilha são a camada contemporânea por cima disso — um convite simbólico a olhar pra trás com mais leveza. Bom momento pra repassar algo que você aprendeu. O recibo da parte antiga: Plínio registra que o que se corta, se colhe e se tosquia sofre menos dano com a lua decrescente (Naturalis Historia XVIII.321)."
    },
    {
      "iso": "2024-02-02T15:29:24.000Z",
      "name": "Quarto Minguante",
      "emoji": "🌗",
      "reflexao": "Metade da luz, agora caindo: é tempo de tirar, não de pôr. Soltar o que não serve mais é o convite simbólico — uma faxina emocional; a transposição pro lado de dentro é contemporânea, isso fica dito. Pergunte a si mesma(o) o que já pode ficar pra trás. E o recibo é dos melhores: dos oito rótulos, este é um dos dois com melhor lastro antigo — Plínio põe na minguante o que é cortar, colher, tosquiar, capinar (Naturalis Historia XVIII.321–322)."
    },
    {
      "iso": "2024-02-06T08:04:48.000Z",
      "name": "Lua Minguante",
      "emoji": "🌘",
      "reflexao": "A Lua está sumindo do céu: são os últimos dias antes de ela se encontrar com o Sol (a conjunção) e o ciclo recomeçar. Descanso e recolhimento são a leitura contemporânea desse esvaziamento — um convite simbólico a desacelerar. Bom momento pra silêncio e balanço pessoal. Recibo: pra lua velha romana, esse fim de mês seguia sendo o de tirar, não o de pôr (Plínio, Naturalis Historia XVIII.321–322)."
    }
  ]
};

// O hash do corpus PT completo (2024 + 2026 + fases), com a serialização
// exata de serializaCorpus(). Capturado antes da extração dos packs.
const HASH_PT_CORPUS = '25117bc6c636100146e1b72ebc015c236c9d5b886f8bb3a9e230f8717486df1f';

function serializaCorpus(lang) {
  const linhas = [];
  for (const ano of [2024, 2026]) {
    for (let mes = 1; mes <= 12; mes++) {
      const r = lang === undefined ? calendarioCosmico(ano, mes) : calendarioCosmico(ano, mes, lang);
      for (const e of r.eventos) {
        linhas.push(JSON.stringify([
          e.tipo, e.dataISO, e.titulo, e.paragrafo, e.fonte, e.avisoDeIdade || '',
          e.tradicao ? [e.tradicao.texto, e.tradicao.obra, e.tradicao.autor, e.tradicao.seculo] : null,
        ]));
      }
    }
  }
  const newMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMs = 29.53 * 24 * 60 * 60 * 1000;
  for (let i = 0; i < 8; i++) {
    const d = new Date(newMoon + (i / 8) * synodicMs);
    const f = lang === undefined ? getMoonPhase(d) : getMoonPhase(d, lang);
    linhas.push(JSON.stringify([f.name, f.emoji, f.reflexao]));
  }
  return linhas.join('\n');
}

function sha256(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function achaEvento(resultado, golden) {
  return resultado.eventos.find((e) => e.tipo === golden.tipoReal && e.dataISO === golden.dataISO && e.titulo === golden.titulo);
}

// Campos de texto de um evento, na forma da golden.
function textosDoEvento(e) {
  return {
    titulo: e.titulo,
    paragrafo: e.paragrafo,
    fonte: e.fonte,
    avisoDeIdade: e.avisoDeIdade,
    tradicao: e.tradicao
      ? { texto: e.tradicao.texto, obra: e.tradicao.obra, autor: e.tradicao.autor, seculo: e.tradicao.seculo }
      : null,
  };
}

const AMOSTRAS = Object.entries(GOLDEN.eventos).map(([nome, g]) => ({
  nome,
  // aspectoConjuncao/aspectoOutro são o mesmo tipo real com ramos diferentes.
  tipoReal: nome.startsWith('aspecto') ? 'aspectoExato' : nome,
  ...g,
}));

test('GOLDEN: sem lang, cada tipo de evento sai byte a byte como antes da extração', () => {
  for (const g of AMOSTRAS) {
    const r = calendarioCosmico(g.ano, g.mes);
    const e = achaEvento(r, g);
    assert.ok(e, `${g.nome}: evento golden não encontrado em ${g.ano}-${g.mes} (${g.dataISO})`);
    assert.deepEqual(
      textosDoEvento(e),
      { titulo: g.titulo, paragrafo: g.paragrafo, fonte: g.fonte, avisoDeIdade: g.avisoDeIdade, tradicao: g.tradicao },
      `${g.nome}: o texto PT mudou — o PT é ouro e não muda um byte`
    );
    assert.equal(e.emoji, g.emoji, `${g.nome}: emoji mudou`);
    assert.equal(e.precisao, g.precisao, `${g.nome}: precisao mudou`);
  }
});

test("GOLDEN: lang='pt' explícito devolve exatamente o mesmo texto de sem lang", () => {
  for (const g of AMOSTRAS) {
    const semLang = achaEvento(calendarioCosmico(g.ano, g.mes), g);
    const comPt = achaEvento(calendarioCosmico(g.ano, g.mes, 'pt'), g);
    assert.ok(semLang && comPt, `${g.nome}: evento sumiu num dos dois caminhos`);
    assert.deepEqual(textosDoEvento(comPt), textosDoEvento(semLang), `${g.nome}: pt explícito difere de sem lang`);
  }
  // E o cache é o MESMO objeto: sem lang cai na chave -pt.
  assert.equal(
    calendarioCosmico(2024, 1),
    calendarioCosmico(2024, 1, 'pt'),
    'sem lang e pt explícito deveriam compartilhar o cache'
  );
});

test('GOLDEN: a reflexão da Lua Cheia (e das outras 7 fases) é idêntica à de antes, com e sem lang', () => {
  for (const fase of GOLDEN.fases) {
    const d = new Date(fase.iso);
    for (const f of [getMoonPhase(d), getMoonPhase(d, 'pt')]) {
      assert.ok(f, `${fase.name}: getMoonPhase devolveu null`);
      assert.equal(f.name, fase.name);
      assert.equal(f.emoji, fase.emoji);
      assert.equal(f.reflexao, fase.reflexao, `${fase.name}: a reflexão PT mudou — o PT é ouro`);
    }
  }
  // O caso mais importante com data real conhecida: a Lua Cheia de 25/01/2024.
  const cheia = getMoonPhase(new Date('2024-01-25T17:54:00Z'));
  const goldenCheia = GOLDEN.fases.find((f) => f.name === 'Lua Cheia');
  assert.equal(cheia.name, 'Lua Cheia');
  assert.equal(cheia.reflexao, goldenCheia.reflexao);
});

test('GOLDEN: o hash do corpus PT inteiro (2024 + 2026 + fases) não mudou', () => {
  assert.equal(sha256(serializaCorpus(undefined)), HASH_PT_CORPUS, 'corpus sem lang divergiu do capturado antes da extração');
  assert.equal(sha256(serializaCorpus('pt')), HASH_PT_CORPUS, "corpus lang='pt' divergiu do capturado antes da extração");
});

test('idioma desconhecido cai em pt — nunca em tela vazia nem em erro', () => {
  for (const ruim of ['fr', 'de', '', null, undefined, 42]) {
    const r = calendarioCosmico(2024, 1, ruim);
    assert.equal(r, calendarioCosmico(2024, 1, 'pt'), `lang=${String(ruim)} deveria cair no cache pt`);
  }
  const f = getMoonPhase(new Date('2024-01-25T17:54:00Z'), 'fr');
  assert.equal(f.name, 'Lua Cheia', 'getMoonPhase com idioma desconhecido deveria cair em pt');
});

// ---------------------------------------------------------------------------
// (2) PARIDADE DOS PACKS — mesma forma, nada vazio, placeholders iguais,
// loci e números preservados.
// ---------------------------------------------------------------------------

function caminhos(obj, prefixo = '') {
  const out = new Map();
  for (const [k, v] of Object.entries(obj)) {
    const p = prefixo ? `${prefixo}.${k}` : k;
    if (v !== null && typeof v === 'object') {
      for (const [pp, vv] of caminhos(v, p)) out.set(pp, vv);
    } else {
      out.set(p, v);
    }
  }
  return out;
}

// O que de um texto PT precisa sobreviver LITERALMENTE à tradução: locus de
// citação (romano.número), anos, números com ponto (40.1), graus/percentuais
// e intervalos de versos (765-828).
function tokensObrigatorios(s) {
  const t = [];
  for (const m of s.matchAll(/[IVXLCDM]+\.[0-9][0-9.]*(?:[-–][0-9]+)?/g)) t.push(m[0]);
  for (const m of s.matchAll(/\b1[0-9]{3}\b|\b20[0-9]{2}\b/g)) t.push(m[0]);
  for (const m of s.matchAll(/\b\d+\.\d+\b/g)) t.push(m[0]);
  for (const m of s.matchAll(/\d+[°%]/g)) t.push(m[0]);
  for (const m of s.matchAll(/\b\d{3}[-–]\d{3}\b/g)) t.push(m[0]);
  return t;
}

function placeholdersDe(s) {
  return [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
}

const PACKS_TRADUZIDOS = [
  ['es', PACK_ES],
  ['en', PACK_EN],
];

test('paridade: es e en têm exatamente as mesmas chaves do pt', () => {
  const mapaPt = caminhos(PACK_PT);
  for (const [lang, pack] of PACKS_TRADUZIDOS) {
    const mapa = caminhos(pack);
    const faltando = [...mapaPt.keys()].filter((k) => !mapa.has(k));
    const sobrando = [...mapa.keys()].filter((k) => !mapaPt.has(k));
    assert.deepEqual(faltando, [], `${lang}: chaves FALTANDO no pack`);
    assert.deepEqual(sobrando, [], `${lang}: chaves SOBRANDO no pack`);
  }
});

test('paridade: nenhum valor vazio, null casa com null, placeholders {x} idênticos', () => {
  const mapaPt = caminhos(PACK_PT);
  for (const [lang, pack] of PACKS_TRADUZIDOS) {
    const mapa = caminhos(pack);
    for (const [chave, vPt] of mapaPt) {
      const v = mapa.get(chave);
      if (vPt === null) {
        assert.equal(v, null, `${lang}:${chave} deveria ser null como no pt`);
        continue;
      }
      assert.equal(typeof v, 'string', `${lang}:${chave} deveria ser string`);
      assert.ok(v.trim().length > 0, `${lang}:${chave} está vazio`);
      assert.deepEqual(
        placeholdersDe(v),
        placeholdersDe(vPt),
        `${lang}:${chave} tem placeholders diferentes do pt`
      );
    }
  }
});

test('paridade: loci, anos e números do pt sobrevivem literalmente em es e en', () => {
  const mapaPt = caminhos(PACK_PT);
  const quebras = [];
  for (const [lang, pack] of PACKS_TRADUZIDOS) {
    const mapa = caminhos(pack);
    for (const [chave, vPt] of mapaPt) {
      if (typeof vPt !== 'string') continue;
      const v = mapa.get(chave);
      for (const token of tokensObrigatorios(vPt)) {
        if (!v.includes(token)) quebras.push(`${lang}:${chave} perdeu "${token}"`);
      }
    }
  }
  assert.deepEqual(quebras, [], `locus/ano/número sumiu na tradução:\n${quebras.join('\n')}`);
});

test('paridade: o sentinela de recibo aparece exatamente onde o pt o tem, uma vez só', () => {
  const mapaPt = caminhos(PACK_PT);
  const conta = (s) => s.split(MARCA_RECIBO).length - 1;
  for (const [lang, pack] of PACKS_TRADUZIDOS) {
    const mapa = caminhos(pack);
    for (const [chave, vPt] of mapaPt) {
      if (typeof vPt !== 'string') continue;
      const nPt = conta(vPt);
      assert.ok(nPt <= 1, `pt:${chave} tem o sentinela ${nPt} vezes`);
      assert.equal(
        conta(mapa.get(chave)),
        nPt,
        `${lang}:${chave} deveria ter o sentinela "${MARCA_RECIBO}" ${nPt} vez(es) — é ele que a tela usa pra cortar conversa/recibo`
      );
    }
  }
});

test('as constantes espelhadas continuam casadas com o motor', () => {
  assert.equal(MARCA_RECIBO, 'Quem escreveu isso:');
  assert.equal(PACK_PT.semFonteAntiga, SEM_FONTE_ANTIGA, 'o pt.semFonteAntiga descolou de SEM_FONTE_ANTIGA do motor');
  for (const [lang, pack] of PACKS_TRADUZIDOS) {
    assert.ok(
      pack.marcosLunares.luaNova.avisoDeIdade.includes(pack.semFonteAntiga),
      `${lang}: o aviso da Lua Nova deixou de usar a frase fixa de "sem fonte antiga"`
    );
  }
});

// ---------------------------------------------------------------------------
// (3) O MOTOR EM ES/EN — mesmas datas, mesmo esqueleto, texto traduzido.
// ---------------------------------------------------------------------------

function corpusEventos(lang) {
  const vistos = new Map();
  for (let mes = 1; mes <= 12; mes++) {
    for (const e of calendarioCosmico(2024, mes, lang).eventos) {
      const chave = `${e.tipo}|${e.titulo}`;
      if (!vistos.has(chave)) vistos.set(chave, e);
    }
  }
  return [...vistos.values()];
}

function corpusFases(lang) {
  const newMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMs = 29.53 * 24 * 60 * 60 * 1000;
  const out = [];
  for (let i = 0; i < 8; i++) out.push(getMoonPhase(new Date(newMoon + (i / 8) * synodicMs), lang));
  return out;
}

function textosDe(evento) {
  const out = [evento.titulo, evento.paragrafo, evento.fonte];
  if (evento.avisoDeIdade) out.push(evento.avisoDeIdade);
  if (evento.tradicao) {
    out.push(evento.tradicao.texto, evento.tradicao.obra, evento.tradicao.autor, evento.tradicao.seculo);
  }
  return out.filter((t) => typeof t === 'string' && t.length > 0);
}

const CORPUS_ES = corpusEventos('es');
const CORPUS_EN = corpusEventos('en');
const FASES_ES = corpusFases('es');
const FASES_EN = corpusFases('en');

test('es/en: as datas e o esqueleto são idênticos ao pt — só o texto muda', () => {
  for (let mes = 1; mes <= 12; mes++) {
    const pt = calendarioCosmico(2024, mes, 'pt');
    for (const lang of ['es', 'en']) {
      const r = calendarioCosmico(2024, mes, lang);
      assert.equal(r.ceuDisponivel, true);
      assert.deepEqual(
        r.eventos.map((e) => `${e.tipo}@${e.dataISO}`),
        pt.eventos.map((e) => `${e.tipo}@${e.dataISO}`),
        `${lang} 2024-${mes}: a lista de eventos divergiu do pt — efeméride não tem idioma`
      );
      for (let i = 0; i < r.eventos.length; i++) {
        const e = r.eventos[i];
        const ePt = pt.eventos[i];
        assert.equal(e.emoji, ePt.emoji);
        assert.equal(e.precisao, ePt.precisao);
        assert.deepEqual(e.lastro, ePt.lastro, `${lang}: lastro mudou com o idioma — lastro é metadado, não texto`);
        // detalhe continua canônico (nomes de lib/signs.js) em qualquer idioma.
        if (e.tipo === 'ingressoSolar') {
          assert.equal(e.detalhe.signoNovo, ePt.detalhe.signoNovo);
          assert.equal(e.detalhe.signoAnterior, ePt.detalhe.signoAnterior);
        }
        if (e.tipo === 'aspectoExato') {
          assert.equal(e.detalhe.planetA, ePt.detalhe.planetA);
          assert.equal(e.detalhe.aspecto, ePt.detalhe.aspecto);
        }
      }
    }
  }
});

test('es/en: os títulos saem traduzidos de verdade', () => {
  const jan = { es: calendarioCosmico(2024, 1, 'es'), en: calendarioCosmico(2024, 1, 'en') };
  const titulo = (r, tipo) => r.eventos.find((e) => e.tipo === tipo).titulo;

  assert.equal(titulo(jan.es, 'luaNova'), 'Luna Nueva');
  assert.equal(titulo(jan.en, 'luaNova'), 'New Moon');
  assert.equal(titulo(jan.es, 'luaCheia'), 'Luna Llena');
  assert.equal(titulo(jan.en, 'luaCheia'), 'Full Moon');
  // Jan/2024: o Sol entra em Aquário (canônico) → rótulo por idioma.
  assert.equal(titulo(jan.es, 'ingressoSolar'), 'El Sol entra en Acuario');
  assert.equal(titulo(jan.en, 'ingressoSolar'), 'Sun enters Aquarius');
  assert.equal(titulo(jan.es, 'mercurioRetrogradoFim'), 'Último día de Mercurio retrógrado');
  assert.equal(titulo(jan.en, 'mercurioRetrogradoFim'), 'Last day of Mercury retrograde');

  // E o display de signo vai junto no detalhe, pro cartão da temporada.
  const ingEs = jan.es.eventos.find((e) => e.tipo === 'ingressoSolar');
  assert.equal(ingEs.detalhe.signoNovo, 'Aquário');
  assert.equal(ingEs.detalhe.signoNovoDisplay, 'Acuario');
  const ingEn = jan.en.eventos.find((e) => e.tipo === 'ingressoSolar');
  assert.equal(ingEn.detalhe.signoNovoDisplay, 'Aquarius');
});

test('es/en: cada idioma tem cache próprio e trocar de idioma não vaza texto', () => {
  const a = calendarioCosmico(2027, 5, 'es');
  const b = calendarioCosmico(2027, 5, 'en');
  const c = calendarioCosmico(2027, 5, 'es');
  assert.equal(a, c, 'o mesmo mês/idioma deveria sair do cache');
  assert.notEqual(a, b);
  assert.equal(a.eventos.length, b.eventos.length);
  assert.notEqual(a.eventos[0].paragrafo, b.eventos[0].paragrafo, 'es e en devolveram o mesmo texto');
});

test('es/en: as 8 fases da Lua saem com nome e reflexão traduzidos, medidas intactas', () => {
  const NOMES = {
    es: ['Luna Nueva', 'Luna Creciente', 'Cuarto Creciente', 'Luna Gibosa Creciente', 'Luna Llena', 'Luna Gibosa Menguante', 'Cuarto Menguante', 'Luna Menguante'],
    en: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
  };
  for (const [lang, fases] of [['es', FASES_ES], ['en', FASES_EN]]) {
    const pt = corpusFases('pt');
    assert.equal(new Set(fases.map((f) => f.name)).size, 8, `${lang}: as 8 fases deveriam ter 8 nomes distintos`);
    for (let i = 0; i < 8; i++) {
      assert.ok(NOMES[lang].includes(fases[i].name), `${lang}: nome inesperado "${fases[i].name}"`);
      assert.ok(fases[i].reflexao && fases[i].reflexao.length > 100, `${lang}: reflexão curta demais`);
      assert.notEqual(fases[i].reflexao, pt[i].reflexao, `${lang}: a reflexão ${i} saiu em português`);
      // O que é medido não muda com o idioma.
      assert.equal(fases[i].emoji, pt[i].emoji);
      assert.equal(fases[i].longitude, pt[i].longitude);
      assert.equal(fases[i].illumination, pt[i].illumination);
    }
  }
  // E getMoonPhaseForMonth propaga o idioma.
  const dias = getMoonPhaseForMonth(2024, 1, 'en');
  assert.ok(dias.every((d) => !d.phase || /Moon|Quarter|Crescent|Gibbous/.test(d.phase.name)));
});

test('o atalho do mês atual aceita idioma', () => {
  const agora = new Date('2025-04-17T09:00:00Z');
  const r = calendarioCosmicoDoMesAtual(agora, 'en');
  assert.equal(r.ceuDisponivel, true);
  assert.ok(r.eventos.some((e) => /^Sun enters /.test(e.titulo) || /Moon$/.test(e.titulo)));
});

// ---------------------------------------------------------------------------
// (4) A LINHA VERMELHA NOS TRÊS IDIOMAS
// ---------------------------------------------------------------------------
// Busca POR INÍCIO DE PALAVRA, como em test/calendarioCosmico.test.js — pelo
// mesmo motivo documentado lá: "cura" solto acusaria "secura" (Ptolomeu
// descrevendo qualidade elementar). Falso positivo corrói a confiança no
// teste até alguém desligá-lo.

const LETRA = 'a-záàâãäéèêëíìîïóòôõöúùûüçñ';

function varre(nomeIdioma, textos, palavras, contexto) {
  for (const { onde, texto } of textos) {
    const alvo = texto.toLowerCase();
    for (const palavra of palavras) {
      const re = new RegExp(`(^|[^${LETRA}])${palavra}`);
      assert.ok(
        !re.test(alvo),
        `${nomeIdioma} / ${onde} usa "${palavra}" — ${contexto}.\nTrecho: ${texto.slice(0, 160)}`
      );
    }
  }
}

function todosOsTextos(corpus, fases) {
  const out = [];
  for (const e of corpus) for (const t of textosDe(e)) out.push({ onde: `${e.tipo} "${e.titulo}"`, texto: t });
  for (const f of fases) out.push({ onde: `fase "${f.name}"`, texto: f.reflexao });
  return out;
}

test('ES: nenhum texto toca saúde — nem os primos de curar/tratar/aliviar', () => {
  const PROIBIDO_ES = [
    'salud', 'sanar', 'sana ', 'curar', 'cura', 'curativ', 'aliviar', 'alivia', 'calmar', 'calmante',
    'tranquiliza', 'relaja', 'energiza', 'revigora', 'recarga', 'tratamiento', 'tratar', 'trata ',
    'terapia', 'terapéut', 'ansiedad', 'estrés', 'insomnio', 'depresi', 'inmunidad', 'cortisol',
    'hormona', 'presión arterial', 'fertilidad', 'embarazo', 'bienestar', 'chakra', 'aura ',
    'vibración', 'frecuencia vibracional', 'cristal', 'sueño reparador', 'dormir mejor',
  ];
  varre('es', todosOsTextos(CORPUS_ES, FASES_ES), PROIBIDO_ES, 'o calendário não fala de saúde, nem por metáfora');
});

test('EN: nenhum texto toca saúde — nem os primos de heal/cure/treat/calm', () => {
  const PROIBIDO_EN = [
    'health', 'heal', 'cure', 'curing', 'treat', 'therapy', 'therapeutic', 'relief', 'reliev',
    'soothe', 'sooth', 'calm', 'anxiety', 'stress', 'insomnia', 'depress', 'immunity', 'cortisol',
    'hormone', 'blood pressure', 'fertility', 'pregnan', 'wellness', 'well-being', 'chakra',
    'energize', 'energiz', 'recharge', 'vibration', 'crystal', 'detox', 'sleep better',
  ];
  varre('en', todosOsTextos(CORPUS_EN, FASES_EN), PROIBIDO_EN, 'the calendar does not talk health, not even by metaphor');
});

test('PT: as fases da Lua (que o teste antigo não varria) também não tocam saúde', () => {
  // Os EVENTOS pt já são varridos por test/calendarioCosmico.test.js; aqui
  // fecha-se o buraco das 8 reflexões.
  const PROIBIDO_PT = [
    'saúde', 'cura', 'curar', 'curativ', 'tratamento', 'tratar', 'terapia', 'ansiedade', 'estresse',
    'insônia', 'depress', 'imunidade', 'cortisol', 'hormôni', 'acalma', 'calmante', 'relaxa',
    'alivia', 'energiza', 'revigora', 'recarrega', 'bem-estar', 'chakra', 'vibração', 'cristal',
  ];
  varre('pt', corpusFases('pt').map((f) => ({ onde: `fase "${f.name}"`, texto: f.reflexao })), PROIBIDO_PT, 'reflexão de fase não fala de saúde');
});

test('ES/EN: nenhum EVENTO promete resultado nem dá instrução ao leitor', () => {
  const PROMESSAS = {
    es: [
      /garantiza/i, /va a atraer/i, /atraerá/i, /favorece/i, /propici/i, /ideal para/i,
      /mejor momento/i, /buen momento para/i, /momento perfecto/i, /aprovecha/i, /trae suerte/i,
      /da suerte/i, /abre caminos/i, /manifiesta/i, /destraba/i, /desbloquea/i,
    ],
    en: [
      /guarantee/i, /will attract/i, /will bring you/i, /brings luck/i, /lucky/i, /best time/i,
      /good time to/i, /perfect time/i, /ideal for/i, /take advantage/i, /opens doors/i,
      /manifest your/i, /unlock/i, /unblock/i, /make the most of/i,
    ],
  };
  const SEGUNDA_PESSOA = {
    es: [/\btú\b/i, /\btu\b/i, /\btuyo\b/i, /\busted\b/i, /\bvos\b/i, /\bte\b/i, /\banota\b/i, /\bescribe\b/i, /\bevita\b/i, /\bfirma\b/i],
    en: [/\byou\b/i, /\byour\b/i, /\bwrite down\b/i, /\bavoid\b/i, /\bmake sure\b/i, /\bdon['’]t sign\b/i],
  };
  for (const [lang, corpus] of [['es', CORPUS_ES], ['en', CORPUS_EN]]) {
    for (const evento of corpus) {
      for (const texto of textosDe(evento)) {
        for (const re of PROMESSAS[lang]) {
          assert.doesNotMatch(texto, re, `${lang} / ${evento.tipo} "${evento.titulo}" promete resultado (${re}).\nTrecho: ${texto.slice(0, 160)}`);
        }
        for (const re of SEGUNDA_PESSOA[lang]) {
          assert.doesNotMatch(texto, re, `${lang} / ${evento.tipo} "${evento.titulo}" fala com o leitor (${re}) — evento de calendário descreve o céu e a Antiguidade, não instrui.\nTrecho: ${texto.slice(0, 160)}`);
        }
      }
    }
  }
});

test('nenhum idioma ganhou aviso defensivo', () => {
  const DEFENSIVO = [
    /não garante/i, /sem garantia/i, /no garantiza/i, /sin garantía/i, /sin promesa/i,
    /does not guarantee/i, /no promise/i, /not guaranteed/i, /resultados podem variar/i,
    /results may vary/i, /los resultados pueden variar/i,
  ];
  for (const [lang, textos] of [
    ['es', todosOsTextos(CORPUS_ES, FASES_ES)],
    ['en', todosOsTextos(CORPUS_EN, FASES_EN)],
    ['pt', todosOsTextos(corpusEventos('pt'), corpusFases('pt'))],
  ]) {
    for (const { onde, texto } of textos) {
      for (const re of DEFENSIVO) {
        assert.doesNotMatch(texto, re, `${lang} / ${onde} ganhou aviso defensivo (${re}) — a régua é não se desculpar por efeméride`);
      }
    }
  }
});

// ---------------------------------------------------------------------------
// (5) A FORMA SOBREVIVE: povão abre, recibo fecha — também em es/en
// ---------------------------------------------------------------------------

const MARCAS_DE_CITACAO = {
  es: ['Ptolomeo', 'Tetrabiblos', 'Valente', 'Anthologiae', 'Plinio', 'Naturalis', 'Columela',
    'De Re Rustica', 'Catón', 'De Agri Cultura', 'Hesíodo', 'Rudhyar', 'Lilly', 'siglo', 'd. C.', 'a. C.'],
  en: ['Ptolemy', 'Tetrabiblos', 'Valens', 'Anthologiae', 'Pliny', 'Naturalis', 'Columella',
    'De Re Rustica', 'Cato the Elder', 'De Agri Cultura', 'Hesiod', 'Rudhyar', 'Lilly', 'century', ' AD', ' BC'],
};

test('es/en: todo parágrafo abre em língua de gente e só depois mostra o recibo', () => {
  for (const [lang, corpus] of [['es', CORPUS_ES], ['en', CORPUS_EN]]) {
    for (const evento of corpus) {
      const p = evento.paragrafo;
      assert.ok(typeof p === 'string' && p.length > 150, `${lang} ${evento.titulo}: parágrafo curto demais`);
      const corte = p.indexOf(MARCA_RECIBO);
      assert.ok(corte > 0, `${lang} ${evento.titulo}: parágrafo sem o sentinela — a tela não sabe onde cortar`);

      const conversa = p.slice(0, corte);
      const recibo = p.slice(corte);
      assert.ok(conversa.length >= 120, `${lang} ${evento.titulo}: a conversa ficou curta (${conversa.length})`);
      for (const marca of MARCAS_DE_CITACAO[lang]) {
        assert.ok(
          !conversa.includes(marca),
          `${lang} ${evento.titulo}: "${marca}" apareceu ANTES do recibo — a ordem é povão primeiro, fonte depois`
        );
      }
      assert.ok(
        MARCAS_DE_CITACAO[lang].slice(0, 13).some((m) => recibo.includes(m)),
        `${lang} ${evento.titulo}: o recibo não nomeia obra nem autor`
      );
      const temSeculo = lang === 'es' ? /siglo [IVXL]+|\b1[0-9]{3}\b/.test(recibo) : /\d+(st|nd|rd|th) century|\b1[0-9]{3}\b/.test(recibo);
      assert.ok(temSeculo, `${lang} ${evento.titulo}: o recibo não diz o século`);
      assert.ok(evento.titulo.length <= 60, `${lang} "${evento.titulo}": título não cabe no cartão`);
    }
  }
});

// ---------------------------------------------------------------------------
// (6) A CORREÇÃO HISTÓRICA E OS VERBATINS SOBREVIVEM À TRADUÇÃO
// ---------------------------------------------------------------------------

test('a correção "colheita é na minguante" atravessa os três idiomas com os loci intactos', () => {
  // Fases da Lua — a Cheia diz SEMEAR (Columela XI.2.85) e aponta a colheita
  // pra minguante (Plínio XVIII.321).
  const cheiaEs = FASES_ES.find((f) => f.name === 'Luna Llena');
  assert.match(cheiaEs.reflexao, /SEMBRAR/, 'es: sumiu o SEMBRAR da Luna Llena');
  assert.match(cheiaEs.reflexao, /menguante/i, 'es: a Luna Llena parou de apontar pra menguante');
  assert.ok(cheiaEs.reflexao.includes('XI.2.85') && cheiaEs.reflexao.includes('XVIII.321'), 'es: loci da Luna Llena sumiram');

  const cheiaEn = FASES_EN.find((f) => f.name === 'Full Moon');
  assert.match(cheiaEn.reflexao, /SOWING/, 'en: sumiu o SOWING da Full Moon');
  assert.match(cheiaEn.reflexao, /waning/i, 'en: a Full Moon parou de apontar pra waning moon');
  assert.ok(cheiaEn.reflexao.includes('XI.2.85') && cheiaEn.reflexao.includes('XVIII.321'), 'en: loci da Full Moon sumiram');

  // E nos EVENTOS do calendário, a mesma correção.
  const evCheiaEs = CORPUS_ES.find((e) => e.tipo === 'luaCheia');
  assert.match(evCheiaEs.tradicao.texto + evCheiaEs.avisoDeIdade, /menguante/i);
  assert.ok(evCheiaEs.avisoDeIdade.includes('XVIII.321'));
  const evCheiaEn = CORPUS_EN.find((e) => e.tipo === 'luaCheia');
  assert.match(evCheiaEn.tradicao.texto + evCheiaEn.avisoDeIdade, /waning/i);
  assert.ok(evCheiaEn.avisoDeIdade.includes('XVIII.321'));

  // E o clichê da colheita só entra pra ser desmentido em seguida.
  assert.match(cheiaEs.reflexao, /pero la fuente romana dice lo contrario/, 'es: o clichê da cosecha ficou sem desmentido');
  assert.match(cheiaEn.reflexao, /but the Roman source says the opposite/, 'en: o clichê do harvest ficou sem desmentido');
});

test('os verbatins de Robbins ficam em inglês nos três idiomas; o es ganha paráfrase', () => {
  const VERBATINS = [
    ['ingressoSolar', 'and from no other source', /de ninguna otra fuente/],
    ['mercurioRetrogradoInicio', 'delay expectations, actions, profits, and enterprises', /atrasan expectativas/],
    ['mercurioRetrogradoFim', 'cancel any delay and reinstate the same activities', /cancelan el atraso/],
  ];
  for (const [tipo, verbatim, parafraseEs] of VERBATINS) {
    const es = CORPUS_ES.find((e) => e.tipo === tipo);
    const en = CORPUS_EN.find((e) => e.tipo === tipo);
    const pt = corpusEventos('pt').find((e) => e.tipo === tipo);
    for (const [lang, e] of [['pt', pt], ['es', es], ['en', en]]) {
      assert.ok(e.paragrafo.includes(verbatim), `${lang} ${tipo}: o verbatim de Robbins "${verbatim}" sumiu ou foi traduzido`);
    }
    assert.match(es.paragrafo, parafraseEs, `es ${tipo}: verbatim sem paráfrase em espanhol`);
  }
  // A conjunção: "bodily application" citado em inglês no es e no en.
  const conjEs = CORPUS_ES.find((e) => e.tipo === 'aspectoExato' && e.detalhe.aspecto === 'Conjunção');
  const conjEn = CORPUS_EN.find((e) => e.tipo === 'aspectoExato' && e.detalhe.aspecto === 'Conjunção');
  assert.ok(conjEs && conjEs.paragrafo.includes('bodily application'), 'es: a conjunção perdeu o termo de Robbins');
  assert.match(conjEs.paragrafo, /aplicación corporal/, 'es: a conjunção ficou sem paráfrase');
  assert.ok(conjEn && conjEn.paragrafo.includes('bodily application'), 'en: a conjunção perdeu o termo de Robbins');
  assert.match(conjEn.paragrafo, /NOT an aspect/, 'en: sumiu a correção de que conjunção não é aspecto em Ptolomeu');
  assert.match(conjEs.paragrafo, /NO es un aspecto/, 'es: sumiu a correção de que conjunção não é aspecto em Ptolomeu');
});

test('es/en: a concordância do título de aspecto não sai torta', () => {
  const femininosEs = ['conjunción', 'cuadratura', 'oposición'];
  for (const e of CORPUS_ES.filter((x) => x.tipo === 'aspectoExato')) {
    const feminino = femininosEs.some((f) => e.titulo.includes(f));
    assert.match(e.titulo, feminino ? /exacta$/ : /exacto$/, `es: concordância errada em "${e.titulo}"`);
  }
  for (const e of CORPUS_EN.filter((x) => x.tipo === 'aspectoExato')) {
    assert.match(e.titulo, /in exact (conjunction|sextile|square|trine|opposition)$/, `en: título de aspecto fora do padrão: "${e.titulo}"`);
  }
});

test('es/en: mensagens de indisponibilidade continuam com mensagemKey (a tela traduz)', () => {
  for (const lang of ['es', 'en']) {
    const r = calendarioCosmico(2024, 13, lang);
    assert.equal(r.ceuDisponivel, false);
    assert.equal(r.mensagemKey, 'calendario.unavailable.outOfRange');
    assert.ok(r.mensagem && r.mensagem.length > 20, 'o fallback pra consumidor fora da tela continua existindo');
  }
});
