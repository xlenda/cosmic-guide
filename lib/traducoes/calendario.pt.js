// lib/traducoes/calendario.pt.js
// PACK DE TEXTO — PORTUGUÊS (o original, a régua dos outros dois).
//
// ESTE ARQUIVO É O OURO. As strings daqui saíram byte a byte de
// lib/calendarioCosmico.js e lib/lunarCalendar.js na extração de i18n de
// 31/07/2026 — test/calendarioIdiomas.test.js compara a saída do motor com
// as goldens capturadas ANTES da extração e falha se um byte mudar. Editar
// texto aqui é editar o produto em produção; não é lugar de "melhoria de
// estilo" casual.
//
// A FORMA é o contrato compartilhado com calendario.es.js e calendario.en.js:
// mesmas chaves, mesmos placeholders {x} em cada valor, mesma posição do
// sentinela de recibo. O teste de paridade cobra isso chave a chave.
//
// O SENTINELA 'Quem escreveu isso:' (MARCA_RECIBO do motor) NÃO é texto de
// tela: a tela corta o parágrafo nele e o descarta, imprimindo o rótulo
// traduzido 'calendario.event.receiptMark'. Por isso ele fica IGUAL nos três
// packs — é marcador de corte, não frase.
//
// O QUE NUNCA SE TRADUZ (vale para os três packs): nomes de obra e locus
// (Tetrabiblos I.13, Naturalis Historia XVIII.321, De Re Rustica XI.2.85,
// De Agri Cultura 40.1, Anthologiae V), números, datas e os verbatins de
// Robbins, que já são ingleses. Nomes próprios consagrados TRADUZEM
// (Ptolomeu → Ptolomeo/Ptolemy), título de obra com tradução consagrada
// também (Os Trabalhos e os Dias → Los trabajos y los días / Works and Days).
//
// A LINHA VERMELHA de lib/calendarioCosmico.js vale inteira aqui e nos três
// idiomas: nenhuma alegação de saúde, nenhuma promessa de resultado, nenhuma
// instrução ao leitor, toda afirmação histórica com obra + autor + século.

// Sentinela de corte — mesma string nos três packs, ver cabeçalho.
const R = 'Quem escreveu isso:';

// A frase exata para quando a pesquisa NÃO achou fonte antiga (espelha
// SEM_FONTE_ANTIGA do motor; o teste confere).
const SFA = 'prática popular contemporânea, sem fonte antiga localizada';

export default {
  semFonteAntiga: SFA,

  // -------------------------------------------------------------------------
  // 1. AS QUATRO LUAS (eventos do Calendário Cósmico)
  // -------------------------------------------------------------------------
  marcosLunares: {
    luaNova: {
      titulo: 'Lua Nova',
      paragrafo:
        'A Lua sumiu do céu — e sumiu porque está do mesmo lado que o Sol, com a metade iluminada virada pro lado de lá. É o zero do ciclo: daqui pra frente a luz volta a crescer, por uns 29 dias e meio, até tudo recomeçar. E não é uma faixa de dias: é um instante, o minuto em que Sol e Lua ficam na mesma longitude vistos da Terra. ' +
        R +
        ' Cláudio Ptolomeu — o Tetrabiblos I.8 (séc. II d.C.) conta os quatro trechos do mês lunar a partir daqui. E o mês contado dia a dia, do 1º ao 30º, já está em Hesíodo, Os Trabalhos e os Dias, vv. 765-828 (séc. VII a.C.): começar o mês aqui é dos costumes genuinamente antigos.',
      fonte: 'Cláudio Ptolomeu, Tetrabiblos I.8 — séc. II d.C.; Hesíodo, Os Trabalhos e os Dias vv. 765-828 — séc. VII a.C.',
      tradicao: {
        texto:
          'A lavoura romana plantava figueira, macieira, oliveira, pereira e videira na Lua Nova, aquela em que ela some do céu — os romanos chamavam de lua muda, ou interlúnio — e sempre à tarde.',
        obra: 'De Agri Cultura 40.1',
        autor: 'Catão, o Velho',
        seculo: 'séc. II a.C.',
      },
      avisoDeIdade:
        'Ler a Lua Nova como hora de "plantar uma intenção" é ' +
        SFA +
        '. O que é antigo mesmo é o marco: o mês começava aqui.',
    },
    quartoCrescente: {
      titulo: 'Quarto Crescente',
      paragrafo:
        'Meio disco aceso, meio disco apagado, com o corte reto no meio: é o que se vê quando a Lua está a 90° do Sol, num ângulo reto visto da Terra. Daqui até a cheia a luz só cresce. ' +
        R +
        ' Cláudio Ptolomeu, Tetrabiblos I.8 (séc. II d.C.) — e vale saber que a divisão antiga é essa, de QUATRO quartos. As oito fases com nome e leitura de personalidade são bem mais novas: Dane Rudhyar, The Lunation Cycle, 1967.',
      fonte: 'Cláudio Ptolomeu, Tetrabiblos I.8 — séc. II d.C.',
      tradicao: {
        texto:
          'Ptolomeu descrevia os quatro trechos do mês lunar como qualidades do ar e da matéria: da nova ao quarto crescente, mais produtor de umidade; do quarto crescente à cheia, de calor; da cheia ao quarto minguante, de secura; do quarto minguante ao sumiço, de frio. Era descrição de clima, não de gente.',
        obra: 'Tetrabiblos I.8',
        autor: 'Cláudio Ptolomeu',
        seculo: 'séc. II d.C.',
      },
      avisoDeIdade:
        'A moldura de oito fases com significado psicológico é de Dane Rudhyar (The Lunation Cycle, 1967). Chamar as oito de "tradição milenar" credita a ele uma idade que ele não tem.',
    },
    luaCheia: {
      titulo: 'Lua Cheia',
      paragrafo:
        'A Lua aparece inteira acesa e nasce mais ou menos na hora em que o Sol se põe. Ela está do lado oposto ao Sol, com a Terra no meio, e por isso a gente enxerga a cara dela toda iluminada. Também é um instante e não uma temporada — os quatro ou cinco dias em que ela "parece cheia" são limitação do olho: a conta marca um minuto só. ' +
        R +
        ' Cláudio Ptolomeu — o Tetrabiblos I.8 (séc. II d.C.) marca aqui o meio do ciclo, entre os dois quartos.',
      fonte: 'Cláudio Ptolomeu, Tetrabiblos I.8 — séc. II d.C.',
      tradicao: {
        texto:
          'Columela mandava semear favas na véspera ou no próprio dia da lua cheia. E, ao contrário da fama desta fase, não era aqui que se colhia para guardar: Plínio, o Velho registrava que tudo o que se corta, se colhe e se tosquia sofria menos dano com a lua minguante.',
        obra: 'De Re Rustica XI.2.85 e Naturalis Historia XVIII.321',
        autor: 'Columela e Plínio, o Velho',
        seculo: 'séc. I d.C.',
      },
      avisoDeIdade:
        'A fama de "fase da colheita" inverte a fonte romana: colher para guardar era minguante (Plínio, Naturalis Historia XVIII.321, séc. I d.C.).',
    },
    quartoMinguante: {
      titulo: 'Quarto Minguante',
      paragrafo:
        'De novo meio disco aceso, agora do outro lado. A Lua voltou aos 90° do Sol, só que descendo: a luz vai encolher até ela sumir de vez. ' +
        R +
        ' Cláudio Ptolomeu, Tetrabiblos I.8 (séc. II d.C.), o mesmo capítulo que parte o mês lunar em quatro e não em oito.',
      fonte: 'Cláudio Ptolomeu, Tetrabiblos I.8 — séc. II d.C.',
      tradicao: {
        texto:
          'Este é o trecho do mês que mais aparece escrito na lavoura antiga. Era na lua minguante que se cortava madeira, se colhia para secar, se tosquiava, se capinava e se estercava — tudo o que se queria que diminuísse em vez de crescer.',
        obra: 'Naturalis Historia XVIII.321-322, De Re Rustica XI.2.11 e De Agri Cultura 31.2',
        autor: 'Plínio, o Velho, Columela e Catão, o Velho',
        seculo: 'séc. II a.C. a séc. I d.C.',
      },
      avisoDeIdade: null,
    },
  },

  // -------------------------------------------------------------------------
  // 2. O SOL MUDANDO DE SIGNO
  // -------------------------------------------------------------------------
  ingresso: {
    titulo: 'Sol entra em {signo}',
    abertura:
      'O Sol troca de signo: sai de {anterior} e entra em {novo}. ' +
      'E a data muda de ano pra ano, porque não é uma casinha do calendário — é um instante astronômico, ' +
      'o minuto em que o Sol termina mais 30° de caminho no círculo do zodíaco. ' +
      'Outra coisa que confunde muita gente: o signo não é a constelação que está lá atrás. ' +
      'É o pedaço de céu contado a partir do equinócio de março — o instante em que dia e noite ' +
      'empatam e o ano do céu recomeça{complemento}. ',
    complementoAries: ', e este ingresso é exatamente ele — o Sol volta ao grau zero de onde tudo se conta',
    complementoCardinal: ', e este ingresso é exatamente {evento} — {explica}',
    recibo:
      R +
      ' Cláudio Ptolomeu, Tetrabiblos I.22 (séc. II d.C.): os começos dos signos se contam dos equinócios e solstícios "and from no other source" — e de nenhuma outra origem.',
    fonte: 'Cláudio Ptolomeu, Tetrabiblos I.22 — séc. II d.C.',
    tradicaoTexto:
      'Para Ptolomeu isto não era coincidência de calendário: o zodíaco dele é o ano solar repartido em doze, e {evento} é um dos quatro pontos de onde a contagem parte. Ele escolheu esse referencial de propósito e explicou por quê.',
    tradicaoObra: 'Tetrabiblos I.22',
    tradicaoAutor: 'Cláudio Ptolomeu',
    tradicaoSeculo: 'séc. II d.C.',
    avisoDeIdade:
      '"Ofiúco, o 13º signo que escondem" confunde signo com constelação. Os limites das constelações usados pela astronomia são de 1930 (União Astronômica Internacional), e o zodíaco de doze partes iguais é muito anterior a isso.',
    cardinais: {
      'Áries': { evento: 'o equinócio de março', explica: 'o instante em que dia e noite têm quase a mesma duração no mundo inteiro' },
      'Câncer': { evento: 'o solstício de junho', explica: 'o instante em que o Sol alcança o ponto mais ao norte do ano, o que faz o dia mais curto aqui no hemisfério sul e o mais longo no norte' },
      'Libra': { evento: 'o equinócio de setembro', explica: 'o outro instante do ano em que dia e noite quase empatam' },
      'Capricórnio': { evento: 'o solstício de dezembro', explica: 'o instante em que o Sol alcança o ponto mais ao sul do ano, o que faz o dia mais longo aqui no hemisfério sul e o mais curto no norte' },
    },
  },

  // -------------------------------------------------------------------------
  // 3. MERCÚRIO RETRÓGRADO
  // -------------------------------------------------------------------------
  retro: {
    inicio: {
      titulo: 'Mercúrio começa a retrogradar',
      paragrafo:
        'Mercúrio parece andar para trás no céu — e "parece" é a palavra certa, porque é ilusão de perspectiva. ' +
        'A Terra está ultrapassando Mercúrio por fora da curva, e o planeta parece recuar contra o fundo de estrelas, ' +
        'do mesmo jeito que o carro do lado parece dar ré quando o seu passa. Nada freia e nada inverte de verdade. ' +
        'Isso acontece três ou quatro vezes por ano, dura umas três semanas, e não tem nada de raro: medindo a efeméride ' +
        '— as tabelas de posição dos planetas que astrônomo e astrólogo usam igual —, ' +
        'em 86% dos dias existe algum planeta retrógrado no céu. ' +
        R +
        ' Vétio Valente, Anthologiae V (séc. II d.C.). E o que ele diz é uma coisa só: atraso — planetas retrógrados ' +
        '"delay expectations, actions, profits, and enterprises", atrasam expectativas, ações, lucros e empreendimentos.',
      fonte: 'Vétio Valente, Anthologiae V — séc. II d.C.',
      tradicao: {
        texto:
          'Ptolomeu nem classificava a retrogradação como boa ou má: para ele era uma fase térmica do ciclo do planeta — da primeira estação (o dia em que o planeta parece parar antes de voltar) ao nascer acrônico (quando o planeta surge no leste bem na hora em que o Sol se põe), calor; do nascer acrônico à segunda estação, secura.',
        obra: 'Tetrabiblos I.8',
        autor: 'Cláudio Ptolomeu',
        seculo: 'séc. II d.C.',
      },
      avisoDeIdade:
        '"Mercúrio retrógrado quebra aparelho, derruba contrato e traz ex de volta" não está em fonte antiga nenhuma: é folclore do século XX e do século XXI. Costuma-se dizer que a primeira menção de "Mercury retrograde" no New York Times é de 1996 — isso é relatado por veículos secundários e não foi conferido no arquivo do jornal, então fica como notícia de segunda mão. Valente também não fala de Mercúrio em particular: a regra dele vale igual para Marte, Júpiter e Saturno.',
    },
    fim: {
      titulo: 'Último dia de Mercúrio retrógrado',
      paragrafo:
        'Mercúrio para e volta a andar para frente contra o fundo de estrelas. É a chamada segunda estação — o dia em que ' +
        'o planeta parece parar antes de retomar o rumo —, e a partir do dia seguinte o movimento aparente é direto de novo. ' +
        R +
        ' Vétio Valente, Anthologiae V (séc. II d.C.) — e Valente registrava também o outro lado, que a internet costuma cortar fora: ' +
        'passada a segunda estação, os planetas "cancel any delay and reinstate the same activities", cancelam o atraso e retomam as mesmas atividades.',
      fonte: 'Vétio Valente, Anthologiae V — séc. II d.C.',
      tradicao: {
        texto:
          'Lilly classificava a retrogradação como debilidade acidental — na régua dele, um planeta em posição fraca, não um planeta ruim —, sinal de assunto que andava para trás e demorava a se resolver, nunca de catástrofe.',
        obra: 'Christian Astrology',
        autor: 'William Lilly',
        seculo: 'séc. XVII (1647/1659)',
      },
      avisoDeIdade:
        'A síntese honesta da tradição sobre retrogradação cabe em três palavras: demora, revisita, contradiz. Nada além disso está em fonte antiga.',
    },
  },

  // -------------------------------------------------------------------------
  // 4. ASPECTO EXATO ENTRE OS PLANETAS PESSOAIS
  // -------------------------------------------------------------------------
  aspecto: {
    titulo: '{planetA} e {planetB} em {aspecto} {exato}',
    aberturaConjuncao:
      '{planetA} e {planetB} ficam hoje no mesmo ponto do círculo do zodíaco, vistos daqui da Terra — é isso que "conjunção" quer dizer: {glosa}. Ângulo é ângulo, dá pra conferir em qualquer tabela de posição de planeta, e o encontro tem hora marcada. ',
    aberturaOutros:
      'Vistos daqui da Terra, {planetA} e {planetB} ficam hoje a exatos {grau}° um do outro sobre o círculo do zodíaco — é isso que "{aspecto}" quer dizer: {glosa}. Ângulo é ângulo: dá pra conferir em qualquer tabela de posição de planeta, e o instante tem hora marcada. ',
    reciboConjuncao:
      R +
      ' Cláudio Ptolomeu, Tetrabiblos I.13 e I.24 (séc. II d.C.) — e aqui vai um detalhe que quase todo aplicativo erra: em Ptolomeu a conjunção NÃO é um aspecto. Os aspectos dele são quatro (oposição 180°, trígono 120°, quadratura 90°, sextil 60°), e a conjunção aparece em I.24 como "aplicação corporal", uma categoria à parte.',
    reciboOutros:
      R +
      ' Cláudio Ptolomeu — o Tetrabiblos I.13 (séc. II d.C.) reconhece quatro aspectos e só quatro (oposição 180°, trígono 120°, quadratura 90° e sextil 60°), e tira esses ângulos de proporções musicais aplicadas ao semicírculo.',
    fonteConjuncao: 'Cláudio Ptolomeu, Tetrabiblos I.13 e I.24 — séc. II d.C.',
    fonteOutros: 'Cláudio Ptolomeu, Tetrabiblos I.13 — séc. II d.C.',
    tradicao: {
      texto:
        'Ptolomeu chamava trígono e sextil de harmônicos, e quadratura e oposição de desarmônicos. A razão que ele dava era o gênero dos signos: os harmônicos uniriam signos do mesmo gênero, e os desarmônicos, de gêneros opostos. A conta fecha para a quadratura e não fecha para a oposição, porque a seis signos de distância o gênero é sempre o mesmo. O furo é dele, e registrar vale mais do que repetir a frase como se ela fechasse.',
      obra: 'Tetrabiblos I.12-I.13',
      autor: 'Cláudio Ptolomeu',
      seculo: 'séc. II d.C.',
    },
    avisoDeIdade:
      'Os graus de tolerância ("orbe") usados para achar o aspecto — 8° para conjunção, oposição, quadratura e trígono, 6° para sextil — são convenção moderna de software: não existe tabela de orbe em graus no Tetrabiblos. Aqui eles servem só para localizar o par; a hora publicada é a do ângulo exato.',
    nomes: {
      'Conjunção': 'Conjunção',
      'Sextil': 'Sextil',
      'Quadratura': 'Quadratura',
      'Trígono': 'Trígono',
      'Oposição': 'Oposição',
    },
    glosa: {
      'Conjunção': 'mesmo grau, um atrás do outro na nossa linha de visada',
      'Sextil': 'um sexto de volta entre os dois',
      'Quadratura': 'um quarto de volta entre os dois',
      'Trígono': 'um terço de volta entre os dois',
      'Oposição': 'meia volta entre os dois, cada um num lado do círculo',
    },
    exato: {
      'Conjunção': 'exata',
      'Sextil': 'exato',
      'Quadratura': 'exata',
      'Trígono': 'exato',
      'Oposição': 'exata',
    },
  },

  // -------------------------------------------------------------------------
  // 5. AS OITO FASES DA LUA (lib/lunarCalendar.js)
  // -------------------------------------------------------------------------
  // CUIDADO redobrado nas duas fases que citam Plínio e Columela: a correção
  // histórica "colher para guardar é na MINGUANTE, não na Cheia" tem que
  // sobreviver a qualquer edição — e os loci XI.2.85 e XVIII.321 são
  // intocáveis nos três idiomas.
  fases: {
    luaNova: {
      nome: 'Lua Nova',
      reflexao:
        'Céu escuro, mês começando: a Lua Nova é o ponto zero do ciclo. Fica o convite simbólico à pausa antes de agir — vale anotar o que você quer deixar nascer neste ciclo. E o recibo é honesto: abrir o mês na Lua Nova é costume genuinamente milenar, de todo calendário lunisolar antigo (o que conta os meses pela Lua); já lê-la como hora de «plantar uma intenção» é leitura contemporânea, não antiga.',
    },
    luaCrescente: {
      nome: 'Lua Crescente',
      reflexao:
        'A luz está crescendo, e a leitura aqui é de construção: dar os primeiros passos no que começou na Lua Nova. É um lembrete simbólico de manter o ritmo — pequenas ações contam mais que grandes decisões agora. Recibo: essa leitura é contemporânea, não antiga — a moldura de oito fases é de 1967 (Dane Rudhyar, «The Lunation Cycle»).',
    },
    quartoCrescente: {
      nome: 'Quarto Crescente',
      reflexao:
        'Metade da luz, primeira encruzilhada do ciclo: o convite simbólico é revisar o plano — vale perguntar o que precisa de mais foco esta semana. Ajuste de rota e tensão criativa são leitura contemporânea, isso fica dito. Mas o marco em si é divisão antiga de verdade: Ptolomeu parte o ciclo em quatro (Tetrabiblos I.8), e é este um dos quatro.',
    },
    gibosaCrescente: {
      nome: 'Lua Gibosa Crescente',
      reflexao:
        'Quase cheia (é isso que «gibosa» quer dizer: mais de meia Lua já iluminada), a hora é de refinar detalhes. Fica o convite simbólico à paciência com o que já está em andamento — ajustar é diferente de recomeçar. Recibo honesto: essa leitura é contemporânea, não herança antiga; a gibosa nem sequer é uma fase nomeada fora da moldura de oito, que é de 1967.',
    },
    luaCheia: {
      nome: 'Lua Cheia',
      reflexao:
        'A Lua está no pico de luz do ciclo — isso é astronomia — e o convite simbólico é ver com clareza: observar o que já vinha se desenhando. Todo mundo repete que Lua Cheia é dia de colheita, mas a fonte romana diz o contrário. Columela põe na cheia o dia de SEMEAR fava (XI.2.85). Colher e guardar é coisa da minguante — é Plínio quem a reserva pra isso (Naturalis Historia XVIII.321). Ou seja: a fama de fase da colheita inverte a fonte.',
    },
    gibosaMinguante: {
      nome: 'Lua Gibosa Minguante',
      reflexao:
        'A luz começou a ceder, e era agora que a lavoura romana colhia para guardar. Gratidão e partilha são a camada contemporânea por cima disso — um convite simbólico a olhar pra trás com mais leveza. Bom momento pra repassar algo que você aprendeu. O recibo da parte antiga: Plínio registra que o que se corta, se colhe e se tosquia sofre menos dano com a lua decrescente (Naturalis Historia XVIII.321).',
    },
    quartoMinguante: {
      nome: 'Quarto Minguante',
      reflexao:
        'Metade da luz, agora caindo: é tempo de tirar, não de pôr. Soltar o que não serve mais é o convite simbólico — uma faxina emocional; a transposição pro lado de dentro é contemporânea, isso fica dito. Pergunte a si mesma(o) o que já pode ficar pra trás. E o recibo é dos melhores: dos oito rótulos, este é um dos dois com melhor lastro antigo — Plínio põe na minguante o que é cortar, colher, tosquiar, capinar (Naturalis Historia XVIII.321–322).',
    },
    luaMinguante: {
      nome: 'Lua Minguante',
      reflexao:
        'A Lua está sumindo do céu: são os últimos dias antes de ela se encontrar com o Sol (a conjunção) e o ciclo recomeçar. Descanso e recolhimento são a leitura contemporânea desse esvaziamento — um convite simbólico a desacelerar. Bom momento pra silêncio e balanço pessoal. Recibo: pra lua velha romana, esse fim de mês seguia sendo o de tirar, não o de pôr (Plínio, Naturalis Historia XVIII.321–322).',
    },
  },

  // -------------------------------------------------------------------------
  // NOMES — os RÓTULOS por idioma. As chaves são os nomes canônicos de
  // lib/signs.js e nunca mudam; `detalhe` dos eventos continua canônico.
  // -------------------------------------------------------------------------
  signos: {
    'Áries': 'Áries',
    'Touro': 'Touro',
    'Gêmeos': 'Gêmeos',
    'Câncer': 'Câncer',
    'Leão': 'Leão',
    'Virgem': 'Virgem',
    'Libra': 'Libra',
    'Escorpião': 'Escorpião',
    'Sagitário': 'Sagitário',
    'Capricórnio': 'Capricórnio',
    'Aquário': 'Aquário',
    'Peixes': 'Peixes',
  },
  planetas: {
    'Sol': 'Sol',
    'Mercúrio': 'Mercúrio',
    'Vênus': 'Vênus',
    'Marte': 'Marte',
  },
};
