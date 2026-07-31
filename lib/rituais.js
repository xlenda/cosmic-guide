// lib/rituais.js
// A BIBLIOTECA DE RITUAIS — 21 rituais em 7 objetivos (Amor, Prosperidade,
// Proteção, Limpeza, Coragem, Foco, Autoestima), cada um com os cinco campos
// aprovados: INTENÇÃO · MATERIAIS · PASSO A PASSO · MOMENTO IDEAL · CUIDADOS E
// ÉTICA.
//
// TODO(i18n) — PARCIALMENTE FEITO. A primeira parcela saiu, e ela foi
// escolhida por DANO, não por tamanho: a TAXONOMIA DE UI (nome e descrição das
// 7 categorias, nome e planeta dos 7 dias, os 8 nomes de fase). São poucas
// strings e são exatamente as que entram INTERPOLADAS dentro de frase já
// traduzida — 'rituais.today.dayOnly' em inglês é "{dia}, day of {planeta}" e
// saía "segunda-feira, day of Lua". Agora cada uma tem chave irmã (`nomeKey`,
// `planetaKey`, FASE_KEYS) e os helpers nomeDaCategoria/nomeDoDia/nomeDaFase
// resolvem por t(). SEM t() o valor devolvido continua sendo o português
// literal de sempre — nada no motor nem nos testes mudou de forma.
//
// A SEGUNDA PARCELA SAIU (31/07/2026): título e os cinco campos dos 21
// rituais, o AVISO_ETICO, os três blocos de lastro e os recibos de fonte agora
// têm pack por idioma em lib/traducoes/rituais.es.js e rituais.en.js — mesma
// forma do PT, cobrada por test/rituaisIdiomas.test.js (paridade de chaves +
// golden que prova que o PT não mudou um byte). O motor ganhou `lang` opcional
// (default 'pt') em ritualPorId/rituaisPorCategoria/rituaisPara/rituaisDeHoje/
// textoCompartilhavel/recibo, e avisoEtico(lang)/lastroMomentoIdeal(lang)
// novos. O texto destas TABELAS continua sendo a fonte de verdade e não é
// tocado por tradução nenhuma.
//
// AS CHAVES SÃO LITERAIS, nunca montadas por template. É o que permite
// test/i18nKeysExist.test.js enxergar cada uma na varredura estática e cobrar
// os três idiomas — por isso `rituais.` NÃO precisa entrar em
// PREFIXOS_DINAMICOS, e não deve: registrar o prefixo isentaria também as
// chaves de chrome que hoje são conferidas uma a uma.
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de escrever qualquer string daqui
// ===========================================================================
// Mesma régua de lib/grounding.js, endurecida em dois pontos porque ritual é
// terreno mais escorregadio que respiração.
//
// (1) NENHUMA ALEGAÇÃO DE SAÚDE, nem implícita. Proibido "acalma", "reduz a
//     ansiedade", "melhora o sono", "energiza", "alivia", "relaxa",
//     "equilibra", "harmoniza", "faz bem". A armadilha aqui é a mesma da tela
//     de respiração: o texto certo é vizinho do proibido, e a diferença mora
//     na finalidade. "Escreva três frases e leia em voz alta" descreve;
//     "escreva três frases para acalmar a mente" promete.
//
// (2) NENHUMA PROMESSA DE RESULTADO. Proibido "vai atrair", "garante", "faz
//     acontecer", "abre caminhos", "afasta", "protege", "destrava". Um ritual
//     é o que a pessoa FAZ, não o que o universo devolve. Todo verbo de passo
//     é de ação observável (escreva, acenda, dobre, guarde, ligue, risque) e
//     nenhum é de efeito.
//
// (3) NENHUM MECANISMO PSEUDOCIENTÍFICO. "Energia negativa", "vibração",
//     "campo energético", "limpeza energética" não entram nem como imagem
//     poética — é a mesma decisão que baniu o vocabulário de earthing de
//     lib/grounding.js. docs/tradicao/08-o-que-o-mercado-diz.md nomeia
//     exatamente isto ("simpatias de amor, limpeza energética, água azul,
//     pulseira vermelha") como a divergência de RESPONSABILIDADE entre este
//     app e o mercado.
//
// test/rituais.test.js varre TODO texto visível deste arquivo atrás desses
// três vocabulários e ABORTA o build. É de propósito.
// ===========================================================================
//
// ===========================================================================
// O TOM — feedback literal do dono, 31/07/2026
// ===========================================================================
// "muito científico, preciso mesclar para o povão entender e deixar científico
// também."
//
// A regra que saiu disso, e o teste a aplica: TODA peça de prosa ABRE em
// português de conversa e FECHA com o recibo. Nunca o contrário. Quem chega
// pela primeira vez lê "É pôr todas as contas do mês em cima da mesa" e
// entende na hora; quem quiser conferir chega no fim e acha "Columela, De Re
// Rustica XI.2.85, séc. I".
//
// Concretamente: os primeiros 60 caracteres de `intencao` e de `momento.texto`
// não podem conter nome de autor, nome de obra nem século — e o ÚLTIMO recibo
// do texto tem que estar na segunda metade dele.
// ===========================================================================
//
// ===========================================================================
// A REGRA DE FONTE — e a separação que é o produto
// ===========================================================================
// Toda afirmação histórica precisa de OBRA + AUTOR + SÉCULO, e precisa existir
// na base docs/tradicao/. Cada entrada de FONTES_TRADICAO traz o caminho do
// documento onde ela foi conferida.
//
// O que a fonte antiga NÃO diz vai marcado, com a frase literal
// SEM_FONTE_ANTIGA — nunca completado por dedução. "Vela rosa para amor",
// "Júpiter é o planeta do dinheiro", "Lua Nova é dia de lista de desejos":
// nada disso está em fonte antiga, e o app diz isso na cara em vez de
// esconder. É a proposição 3 da tese (docs/tradicao/00-tese.md): quase tudo
// que o mercado vende como antigo é moderno, datável, e tem autor.
//
// UMA CORREÇÃO DE ENDEREÇO, registrada aqui porque ela importa. O briefing
// mandava citar a astrologia eletiva a partir de
// docs/tradicao/13-tecnicas-preditivas.md. O 13 é sobre TÉCNICA PREDITIVA
// (trânsito, progressão, profecção, revolução solar, firdaria) e não trata de
// eleição. A eletiva está em docs/tradicao/10-historia-da-astrologia.md §4.2
// (a carta de fundação de Bagdá, 762) e §4.4 (o mundo islâmico a
// sistematiza). É de lá que sai o lastro citado abaixo.
//
// E UMA HONESTIDADE SOBRE DOROTEU. O briefing pedia Doroteu de Sídon, Carmen
// Astrologicum, séc. I, como fonte da eletiva. A obra existe, está na
// bibliografia da base (docs/tradicao/09-bibliografia-e-fontes.md) e
// docs/tradicao/10 §17.4 fala em "tradição documentada de Doroteu aos árabes"
// — mas docs/tradicao/99-o-que-falta.md registra, com todas as letras, que
// Carmen Astrologicum NUNCA FOI LIDO nesta pesquisa, e
// docs/tradicao/11-planetas-em-profundidade.md §10.4 repete o aviso. Por isso
// Doroteu entra com `atribuicaoNaoLida: true` e o texto do ritual diz que é
// atribuição registrada, não leitura própria. Citar o que não se leu como se
// se tivesse lido é exatamente o erro que a tese existe pra impedir.
import { getMoonPhase } from './lunarCalendar';
// O MESMO helper de storage de lib/jornada.js e lib/cosmicSound.js. Ver a
// seção 11, no fim do arquivo, pro porquê de a regra do uso grátis ter saído da
// tela e vindo morar aqui.
import { getItemSeguro, setItemSeguro } from './storage';
// A SEGUNDA PARCELA DO i18n — os packs de conteúdo por idioma. O PORTUGUÊS
// DESTE ARQUIVO CONTINUA SENDO A FONTE DE VERDADE e não mudou um byte: os packs
// carregam SÓ texto traduzido, na mesma forma (test/rituaisIdiomas.test.js
// cobra paridade de chaves, de tamanhos de array e de placeholders). O motor
// ganhou um parâmetro `lang` com default 'pt' em toda função que devolve texto
// — chamada antiga, sem o parâmetro, devolve exatamente o que sempre devolveu,
// e é isso que os goldens do teste novo provam.
import PACK_RITUAIS_ES from './traducoes/rituais.es';
import PACK_RITUAIS_EN from './traducoes/rituais.en';

const PACKS = { es: PACK_RITUAIS_ES, en: PACK_RITUAIS_EN };

// 'pt' (e qualquer idioma desconhecido) devolve null: sem pack, o texto sai da
// fonte de verdade — nunca de uma tradução inventada na hora.
function packDoIdioma(lang) {
  return (lang && PACKS[lang]) || null;
}

// ---------------------------------------------------------------------------
// 1. O AVISO ÉTICO — texto literal do dono, palavra por palavra
// ---------------------------------------------------------------------------
// Não reescreva, não "melhore", não traduza sem o dono. Ele aparece em TODO
// ritual (campo `aviso`, fim do campo `cuidados` e no texto de compartilhar) e
// o teste confere a igualdade byte a byte nos três lugares.
//
// REESCRITO EM 31/07/2026, e a razão importa. A versão anterior era "Rituais
// são ferramentas de intenção, NÃO GARANTIAS MÁGICAS. Use sempre com respeito,
// sem tentar controlar vontade alheia." O trecho em maiúsculas é aviso
// DEFENSIVO — nega uma eficácia que ninguém alegou —, e é o mesmo padrão que o
// dono mandou tirar do Som do Céu no mesmo dia ("sem qualquer promessa de
// efeito"). Aqui pesava mais que em qualquer outro lugar: a frase estava
// pinned fora do ScrollView, colada no fim dos 21 rituais, e ainda saía do app
// no texto de compartilhar.
//
// A jogada é a mesma do commit que limpou o Som do Céu: TROCAR A NEGAÇÃO PELO
// FATO CONCRETO que faz o mesmo trabalho, sem afrouxar nada. O que ficou é só
// o limite real de conduta — que não é defensivo, é ética de terceiros: sobre
// vontade alheia não se mexe. E o fato de o ritual ser gesto da própria mão
// sobre a própria vida já diz, sem se desculpar, o que ele é.
//
// Efeito colateral desejado: o texto novo não tropeça em nenhum padrão de
// SAUDE/PROMESSA/MECANISMO, então a isenção cirúrgica semOAviso() que existia
// só por causa dele saiu de test/rituais.test.js. Um aviso que precisa de
// isenção pra passar na própria varredura é um aviso com forma de promessa.
export const AVISO_ETICO =
  'Estes rituais são gestos de intenção, feitos com a própria mão e sobre a própria vida. Sobre vontade alheia não se mexe.';

// O aviso no idioma pedido. Sem idioma (ou com 'pt'), é a constante literal —
// mesma string, mesmo objeto. A tradução foi feita mantendo a força do
// original: a última frase é limite de conduta ("La voluntad ajena no se
// toca." / "Other people’s will is not yours to touch."), nunca ressalva
// defensiva — test/rituaisIdiomas.test.js varre os três contra os padrões de
// aviso defensivo, igual ao teste PT.
export function avisoEtico(lang) {
  const p = packDoIdioma(lang);
  return p ? p.avisoEtico : AVISO_ETICO;
}

// A frase que substitui a antiguidade inventada. Literal, sempre igual — o
// teste exige que toda entrada de `naoTemFonte` termine exatamente com ela.
export const SEM_FONTE_ANTIGA = 'prática popular contemporânea, sem fonte antiga localizada';

export const LINK_COMPARTILHAR = 'https://cosmicguide.cloud/cosmic-guide/';

// ---------------------------------------------------------------------------
// 2. AS FONTES — obra + autor + século, cada uma conferível na base
// ---------------------------------------------------------------------------
// `token` é o pedaço de texto pelo qual o teste reconhece a citação dentro da
// prosa. Se um ritual escreve "Plínio" no corpo, ele é obrigado a listar uma
// fonte com esse token em `fontes` — e vice-versa: recibo declarado que não
// aparece no texto é recibo morto, e o teste reprova.
//
// `provas` são strings LITERAIS que TÊM que aparecer no(s) arquivo(s) citados em
// `base`. É o mesmo mecanismo de DATACOES em lib/jornada.js, portado para cá
// depois que a auditoria mostrou o buraco: até então o teste conferia só o
// FORMATO do caminho (`/^docs\/tradicao\//`) e nunca abria o arquivo — foi por
// isso que "Kitāb al-Tafhīm" como veículo da carta de Bagdá passou verde.
export const FONTES_TRADICAO = {
  dioCassio: {
    token: 'Dião Cássio',
    autor: 'Dião Cássio',
    obra: 'História Romana 37.18-19',
    seculo: 'séc. III',
    // A base tinha uma contradição: docs/tradicao/14 §3.2 marca a passagem como
    // CONFERIDA no texto de Cary (LacusCurtius), com o verbatim transcrito,
    // enquanto 11 §10.8 e 99 §1.3 listavam Dião entre os "nunca lidos". Quem
    // tem o verbatim tem a leitura: a lista de não lidos foi corrigida em
    // 31/07/2026 e o endereço da leitura mora aqui.
    base: 'docs/tradicao/14-simbolismo-comparado.md §3.2 (conferido no texto de Cary, LacusCurtius)',
    provas: ['Dio Cássio', '37.18–19', 'comparatively recent', 'Cary'],
    // O detalhe que vale ouro e que o mercado nunca conta: a fonte primária da
    // semana planetária diz que o costume é NOVO. "The custom, however, of
    // referring the days to the seven stars called planets was instituted by
    // the Egyptians, but is now found among all mankind, though its adoption
    // has been comparatively recent" — e acrescenta que os gregos antigos não
    // o conheciam. Quem chama a semana planetária de imemorial está
    // contrariando a própria fonte que cita.
    nota: 'O próprio Dião chama o costume dos dias planetários de "comparatively recent" e diz que os gregos antigos não o conheciam.',
  },
  ptolomeuI4: {
    token: 'Ptolomeu',
    autor: 'Cláudio Ptolomeu',
    obra: 'Tetrabiblos I.4',
    seculo: 'séc. II',
    base: 'docs/tradicao/01-astrologia-fundamentos.md §2.5; lib/grounding.js §4',
    provas: ['Tetrabiblos', 'I.4', 'to cool and', 'fiery colour'],
    // AVISO DE USO, herdado de lib/grounding.js e igualmente obrigatório aqui:
    // Ptolomeu descreve efeitos FÍSICOS E METEOROLÓGICOS, não estados de
    // ânimo. O planeta é sempre o sujeito da frase ("a tradição atribui a
    // Saturno resfriar e secar"), nunca aplicado a quem lê.
    nota: 'Qualidades físicas e meteorológicas dos sete planetas. O planeta é sempre o sujeito da frase, nunca quem lê.',
  },
  ptolomeuI8: {
    token: 'Ptolomeu',
    autor: 'Cláudio Ptolomeu',
    obra: 'Tetrabiblos I.8',
    seculo: 'séc. II',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.1',
    provas: ['Tetrabiblos', 'I.8', 'Ptolomeu'],
    nota: 'A divisão ANTIGA do ciclo lunar é em QUATRO quartos com qualidades elementares — não em oito fases.',
  },
  plinioColheita: {
    token: 'Plínio',
    autor: 'Plínio, o Velho',
    obra: 'Naturalis Historia XVIII.321-322',
    seculo: 'séc. I',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
    provas: ['Naturalis Historia', 'XVIII.321', 'decrescente luna', 'Plínio, o Velho'],
    nota: 'Plínio escrevia "omnia quae caeduntur, carpuntur, tondentur, innocentius decrescente luna": o que se cortava, se colhia e se tosquiava sofria menos dano com a lua minguante.',
  },
  columelaFava: {
    token: 'Columela',
    autor: 'Columela',
    obra: 'De Re Rustica XI.2.85',
    seculo: 'séc. I',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
    provas: ['De Re Rustica', 'XI.2.85', 'Columela'],
    nota: 'Columela mandava semear favas na véspera ou no próprio dia da lua cheia. É a exceção que impede o app de dizer que cheia é fase de colher.',
  },
  columelaPassa: {
    token: 'Columela',
    autor: 'Columela',
    obra: 'De Re Rustica XII.16.1',
    seculo: 'séc. I',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
    provas: ['De Re Rustica', 'XII.16.1'],
    nota: 'Columela colhia uva para passa com a luna decrescente.',
  },
  columelaEsterco: {
    token: 'Columela',
    autor: 'Columela',
    obra: 'De Re Rustica II.5.1',
    seculo: 'séc. I',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
    provas: ['De Re Rustica', 'II.5.1'],
    // Antes esta nota dizia "A lua minguante mata as sementes de erva daninha
    // no esterco" — presente do indicativo, sem dono, efeito lunar AFIRMADO em
    // vez de citado. Era o único ponto da biblioteca em que isso acontecia.
    nota: 'Columela escrevia que se estercava na lua minguante para que as sementes de erva daninha presentes no esterco não brotassem.',
  },
  columelaMadeira: {
    token: 'Columela',
    autor: 'Columela',
    obra: 'De Re Rustica XI.2.11',
    seculo: 'séc. I',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
    provas: ['De Re Rustica', 'XI.2.11'],
    nota: 'Columela cortava madeira nos dias 20 a 30 do mês lunar, com a luna decrescente.',
  },
  cataoPlantio: {
    token: 'Catão',
    autor: 'Catão, o Velho',
    obra: 'De Agri Cultura 40.1',
    seculo: 'séc. II a.C.',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
    provas: ['De Agri Cultura', '40.1', 'luna silente'],
    nota: 'Catão plantava figueira, macieira, oliveira, pereira e videira luna silente (a lua muda), à tarde.',
  },
  cataoEsterco: {
    token: 'Catão',
    autor: 'Catão, o Velho',
    obra: 'De Agri Cultura 29',
    seculo: 'séc. II a.C.',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
    provas: ['De Agri Cultura', 'Catão 29', 'luna silente'],
    nota: 'Catão estercava luna silente.',
  },
  paladio: {
    token: 'Paládio',
    autor: 'Paládio',
    obra: 'Opus Agriculturae I.6.12',
    seculo: 'séc. IV-V',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §1 e §3.2',
    provas: ['Opus Agriculturae', 'I.6.12', 'Paládio'],
    nota: 'Paládio escrevia "omnia quae seruntur crescente luna... sunt serenda": tudo que se semeava, com a lua crescendo.',
  },
  hesiodo: {
    token: 'Hesíodo',
    autor: 'Hesíodo',
    obra: 'Os Trabalhos e os Dias, vv. 765-828',
    seculo: 'séc. VII a.C.',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §1 e §3.2',
    provas: ['Os Trabalhos e os Dias', 'Hesíodo', '765–828'],
    nota: 'Hesíodo contava o MÊS LUNAR dia a dia (1 a 30) — dias, não fases. Quem transpõe para "Lua Gibosa" inventa equivalência.',
  },
  virgilio: {
    token: 'Virgílio',
    autor: 'Virgílio',
    obra: 'Geórgicas I.276-286',
    seculo: 'séc. I a.C.',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
    provas: ['Geórgicas', 'Virgílio', 'quintam fuge'],
    nota: 'Virgílio escrevia "quintam fuge" — fuja do quinto dia — e dava o décimo sétimo por feliz para plantar a vinha. De novo: dias do mês lunar, não fases.',
  },
  mashaallahBagda: {
    token: "Māshā'allāh",
    autor: "Māshā'allāh ibn Atharī",
    obra: 'carta de fundação de Bagdá (762)',
    seculo: 'séc. VIII',
    base: 'docs/tradicao/10-historia-da-astrologia.md §4.2 e §4.3',
    provas: ["Māshā'allāh ibn Atharī", '762', 'ikhtiyārāt', 'Nawbakht'],
    // A base é explícita sobre quem elegeu: Nawbakht, o Persa, com a assistência
    // do jovem Māshā'allāh. O app creditava só o assistente.
    nota: 'O caso documentado de astrologia ELETIVA (ikhtiyārāt): Nawbakht, o Persa, assistido pelo jovem Māshā\'allāh, elegeu o momento de começar a construção da nova capital.',
  },
  mashaallahVenus: {
    token: "Māshā'allāh",
    autor: "Māshā'allāh",
    obra: 'Book of Aristotle III.7.11',
    seculo: 'séc. VIII',
    base: 'docs/tradicao/02-aspectos-e-sinastria.md §2.7.3',
    provas: ['Book of Aristotle', 'III.7.11', 'insoluble'],
    nota: '"the traversal of Venus and the Moon in the same sign denotes the insoluble concord of the conjugal agreement."',
  },
  albiruni: {
    token: 'al-Bīrūnī',
    autor: 'al-Bīrūnī',
    // OBRA CORRIGIDA. O app creditava a transmissão da carta de Bagdá ao Kitāb
    // al-Tafhīm (1029), que é o MANUAL de astrologia descrito em 10 §4.3 — obra
    // diferente. Quem transmite a carta, segundo 10 §4.2, é a Cronologia das
    // Nações Antigas. Autor certo, livro errado.
    obra: 'Cronologia das Nações Antigas (al-Āthār al-bāqiya)',
    seculo: 'séc. XI',
    base: 'docs/tradicao/10-historia-da-astrologia.md §4.2',
    provas: ['al-Bīrūnī', 'Cronologia das Nações'],
    nota: 'É por al-Bīrūnī, na Cronologia das Nações Antigas, que a carta de fundação de Bagdá chega até nós.',
  },
  doroteu: {
    token: 'Doroteu',
    autor: 'Doroteu de Sídon',
    obra: 'Carmen Astrologicum',
    seculo: 'séc. I',
    base: 'docs/tradicao/09-bibliografia-e-fontes.md; ressalva em docs/tradicao/99-o-que-falta.md',
    provas: ['Carmen Astrologicum', 'Doroteu de Sídon'],
    // A ressalva é a razão de este item existir do jeito que existe. Ver o
    // cabeçalho: a base registra a obra e NÃO a leu.
    atribuicaoNaoLida: true,
    nota: 'Atribuição registrada na base, obra NÃO lida diretamente (docs/tradicao/99-o-que-falta.md). Citada como atribuição, nunca como leitura própria.',
  },
  rudhyar: {
    token: 'Rudhyar',
    autor: 'Dane Rudhyar',
    obra: 'The Lunation Cycle',
    seculo: 'séc. XX (1967)',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.1',
    provas: ['The Lunation Cycle', 'Dane Rudhyar', '1967'],
    nota: 'As OITO fases nomeadas com leitura psicológica são dele, de 1967. Não são milenares — e o app diz isso.',
  },
};

// Recibo pronto, pra tela que quiser renderizar a lista de fontes de um ritual
// em vez de deixá-la só dentro da prosa.
//
// `lang` é opcional e segue a regra de tradução do pack: obra e locus ficam
// como estão (Tetrabiblos I.4 é Tetrabiblos I.4 em qualquer idioma), nome
// consagrado de autor e a palavra de século trocam (Plínio, o Velho → Pliny
// the Elder / Plinio el Viejo; séc. I → 1st century / siglo I). Sem `lang`, a
// saída é byte a byte a de sempre.
export function recibo(ids, lang) {
  const p = packDoIdioma(lang);
  return (ids || [])
    .map((id) => {
      const f = FONTES_TRADICAO[id];
      if (!f) return null;
      const tf = p && p.fontes && p.fontes[id];
      return tf ? { ...f, ...tf } : f;
    })
    .filter(Boolean)
    .map((f) => `${f.autor}, ${f.obra}, ${f.seculo}`)
    .join(' · ');
}

// ---------------------------------------------------------------------------
// 3. AS CATEGORIAS
// ---------------------------------------------------------------------------
// `nome`/`descricao` continuam aqui em português: são a fonte de verdade do
// motor e o que os testes de conteúdo varrem. `nomeKey`/`descricaoKey` são o
// que a TELA usa via nomeDaCategoria() — chave literal, pra varredura estática
// de test/i18nKeysExist.test.js enxergar.
export const CATEGORIAS = [
  { id: 'amor', nome: 'Amor', nomeKey: 'rituais.cat.amor', descricaoKey: 'rituais.cat.amor.desc', descricao: 'O que você sente e o que você faz com isso — nunca o que a outra pessoa deveria fazer.' },
  { id: 'prosperidade', nome: 'Prosperidade', nomeKey: 'rituais.cat.prosperidade', descricaoKey: 'rituais.cat.prosperidade.desc', descricao: 'Olhar o dinheiro de frente, anotar, organizar. O que muda é a clareza, não o saldo.' },
  { id: 'protecao', nome: 'Proteção', nomeKey: 'rituais.cat.protecao', descricaoKey: 'rituais.cat.protecao.desc', descricao: 'Gestos concretos de cuidado com a casa, com o combinado e com o próprio limite.' },
  { id: 'limpeza', nome: 'Limpeza', nomeKey: 'rituais.cat.limpeza', descricaoKey: 'rituais.cat.limpeza.desc', descricao: 'Encerrar, esvaziar, largar. É trabalho de mão, e a Lua minguante é a fase que mais aparece escrita nas fontes antigas.' },
  { id: 'coragem', nome: 'Coragem', nomeKey: 'rituais.cat.coragem', descricaoKey: 'rituais.cat.coragem.desc', descricao: 'A ligação adiada, a conversa difícil, a data marcada. Encarar tem passo a passo.' },
  { id: 'foco', nome: 'Foco', nomeKey: 'rituais.cat.foco', descricaoKey: 'rituais.cat.foco.desc', descricao: 'Escolher uma coisa só e tirar o resto da frente, por um tempo medido.' },
  { id: 'autoestima', nome: 'Autoestima', nomeKey: 'rituais.cat.autoestima', descricaoKey: 'rituais.cat.autoestima.desc', descricao: 'Inventário do que você fez de fato — checável, não elogio genérico.' },
];

export const CATEGORIA_IDS = CATEGORIAS.map((c) => c.id);

// Os três resolvedores de taxonomia. Sem `t` devolvem o português literal — é
// o que mantém motor e testes exatamente como estavam.
export function nomeDaCategoria(categoria, t) {
  const c = typeof categoria === 'string' ? CATEGORIAS.find((x) => x.id === categoria) : categoria;
  if (!c) return typeof categoria === 'string' ? categoria : '';
  return t && c.nomeKey ? t(c.nomeKey) : c.nome;
}

export function descricaoDaCategoria(categoria, t) {
  const c = typeof categoria === 'string' ? CATEGORIAS.find((x) => x.id === categoria) : categoria;
  if (!c) return '';
  return t && c.descricaoKey ? t(c.descricaoKey) : c.descricao;
}

// ---------------------------------------------------------------------------
// 4. FASES E DIAS
// ---------------------------------------------------------------------------
// Os oito nomes têm que casar BYTE A BYTE com PHASES de lib/lunarCalendar.js —
// é de lá que vem `getMoonPhase(...).name`, e é por esse nome que o casamento
// do ritual com o dia de hoje acontece. Um acento diferente aqui faria o app
// nunca sugerir ritual nenhum, em silêncio, sem erro. O teste percorre 400 dias
// reais com a efeméride e confere que os oito nomes saem mesmo do motor.
export const FASES_LUA = [
  'Lua Nova',
  'Lua Crescente',
  'Quarto Crescente',
  'Lua Gibosa Crescente',
  'Lua Cheia',
  'Lua Gibosa Minguante',
  'Quarto Minguante',
  'Lua Minguante',
];

export const FASES_MINGUANTES = ['Lua Gibosa Minguante', 'Quarto Minguante', 'Lua Minguante'];
export const FASES_CRESCENTES = ['Lua Crescente', 'Quarto Crescente', 'Lua Gibosa Crescente'];

// O nome canônico continua sendo a string PT acima (é ela que casa com o motor
// da Lua). Isto aqui é só o rótulo de EXIBIÇÃO — traduzir o canônico faria o
// app parar de sugerir ritual nenhum, em silêncio, que é a armadilha descrita
// logo acima.
export const FASE_KEYS = {
  'Lua Nova': 'rituais.fase.luaNova',
  'Lua Crescente': 'rituais.fase.luaCrescente',
  'Quarto Crescente': 'rituais.fase.quartoCrescente',
  'Lua Gibosa Crescente': 'rituais.fase.gibosaCrescente',
  'Lua Cheia': 'rituais.fase.luaCheia',
  'Lua Gibosa Minguante': 'rituais.fase.gibosaMinguante',
  'Quarto Minguante': 'rituais.fase.quartoMinguante',
  'Lua Minguante': 'rituais.fase.luaMinguante',
};

export function nomeDaFase(fase, t) {
  const chave = FASE_KEYS[fase];
  return t && chave ? t(chave) : fase || '';
}

// Regentes dos dias da semana — derivados da ordem caldaica pelo salto de 3.
// ATENÇÃO AO NOME: esta tabela NÃO é a ordem caldaica. A caldaica é
// Saturno·Júpiter·Marte·Sol·Vênus·Mercúrio·Lua (do mais lento ao mais rápido);
// a fila dos DIAS sai dela pulando três posições a cada volta de 24 horas
// planetárias (24 mod 7 = 3), e é isso que docs/tradicao/14 §3.1-3.2 chama de
// "justamente o ponto interessante". Confundir as duas foi erro do app por 14
// lugares. `diaSemana` é o índice de Date.getDay(): 0 = domingo.
// FONTE ÚNICA NO APP: esta tabela tem que bater com REGENTES de
// lib/grounding.js, que por sua vez bate com rulerOfDay de lib/dailyThought.js.
// O teste compara as duas — se alguém mexer em uma e esquecer a outra, quebra.
//
// `nome` e `planeta` ganharam chave irmã porque os DOIS entram interpolados na
// mesma frase traduzida ('rituais.today.dayOnly' → "{dia}, day of {planeta}"):
// traduzir só o dia deixaria "Monday, day of Lua", que é meio caminho.
export const DIAS_SEMANA = [
  { diaSemana: 0, nome: 'domingo', nomeKey: 'rituais.dia.0', planeta: 'Sol', planetaKey: 'rituais.planeta.sol' },
  { diaSemana: 1, nome: 'segunda-feira', nomeKey: 'rituais.dia.1', planeta: 'Lua', planetaKey: 'rituais.planeta.lua' },
  { diaSemana: 2, nome: 'terça-feira', nomeKey: 'rituais.dia.2', planeta: 'Marte', planetaKey: 'rituais.planeta.marte' },
  { diaSemana: 3, nome: 'quarta-feira', nomeKey: 'rituais.dia.3', planeta: 'Mercúrio', planetaKey: 'rituais.planeta.mercurio' },
  { diaSemana: 4, nome: 'quinta-feira', nomeKey: 'rituais.dia.4', planeta: 'Júpiter', planetaKey: 'rituais.planeta.jupiter' },
  { diaSemana: 5, nome: 'sexta-feira', nomeKey: 'rituais.dia.5', planeta: 'Vênus', planetaKey: 'rituais.planeta.venus' },
  { diaSemana: 6, nome: 'sábado', nomeKey: 'rituais.dia.6', planeta: 'Saturno', planetaKey: 'rituais.planeta.saturno' },
];

export function diaSemanaPorIndice(n) {
  return DIAS_SEMANA.find((d) => d.diaSemana === n) || null;
}

export function nomeDoDia(diaSemana, t) {
  const d = diaSemanaPorIndice(diaSemana);
  if (!d) return '';
  return t && d.nomeKey ? t(d.nomeKey) : d.nome;
}

export function nomeDoPlaneta(diaSemana, t) {
  const d = diaSemanaPorIndice(diaSemana);
  if (!d) return '';
  return t && d.planetaKey ? t(d.planetaKey) : d.planeta;
}

// ---------------------------------------------------------------------------
// 5. O LASTRO DO "MOMENTO IDEAL" — a explicação que a tela mostra uma vez
// ---------------------------------------------------------------------------
// Três blocos, porque são três lastros de qualidade diferente e misturá-los
// seria repetir o erro do mercado. Cada um abre em conversa e fecha no recibo.
export const LASTRO_MOMENTO_IDEAL = {
  eletiva: {
    titulo: 'Escolher a hora de começar é coisa antiga mesmo',
    texto:
      'Marcar o dia e a hora de começar uma coisa importante não é invenção de aplicativo: é um ramo inteiro da astrologia antiga — escolher a hora de começar —, que os árabes chamavam de ikhtiyārāt, as escolhas. E tem caso registrado com data e endereço. Em 762 o califa al-Manṣūr encomendou a escolha do momento de começar a construção de Bagdá; quem elegeu foi Nawbakht, o Persa, assistido pelo jovem Māshā\'allāh ibn Atharī, séc. VIII. A carta chega até nós por al-Bīrūnī, Cronologia das Nações Antigas, séc. XI.',
    fontes: ['mashaallahBagda', 'albiruni'],
    ressalvas: [
      'Isso a gente registra mas não leu — a obra existe na bibliografia e ninguém aqui abriu. Fica como atribuição: Doroteu de Sídon, Carmen Astrologicum, séc. I.',
      'O critério antigo era o céu inteiro de um instante (onde estava cada planeta, em que pedaço do céu, e o que estava subindo no horizonte), não "fase da Lua e dia da semana". Reduzir a escolha do momento a esses dois dados é simplificação nossa, e por isso vai marcada em cada ritual.',
    ],
  },
  semana: {
    titulo: 'Por que cada dia tem um planeta',
    texto:
      'Segunda é da Lua, terça de Marte, quarta de Mercúrio — e isso não é palpite de almanaque. Vem da fila antiga dos planetas, a chamada ordem caldaica: os sete enfileirados do mais lento para o mais rápido. A fila dos dias sai dela por conta: cada hora do dia recebe um planeta na ordem da fila, e como o dia tem 24 horas e a fila tem 7 nomes, a cada volta pula-se três posições — é por isso que a sequência dos dias não é a mesma da fila. Quem registra é Dião Cássio, História Romana 37.18-19, séc. III, e ele dá duas explicações concorrentes para a mesma coisa, porque ele mesmo não sabia qual era a certa.',
    fontes: ['dioCassio'],
    ressalvas: [
      'Nem para um romano isso era coisa imemorial: o próprio autor que registra chama o costume de "comparatively recent" e diz que os gregos antigos não o conheciam. Dião Cássio, História Romana 37.18-19, séc. III.',
      'Na fonte antiga os planetas esquentam, secam e molham — não têm personalidade. Ptolomeu, Tetrabiblos I.4, séc. II.',
      'O apelido "caldaica" é uso greco-romano para "babilônico" em sentido largo. A pesquisa deste app não conseguiu verificar que essa ordem específica seja a ordem canônica dos textos astronômicos babilônicos — fica como apelido corrente, não como fato conferido.',
    ],
  },
  fases: {
    titulo: 'O que a lavoura antiga fazia em cada fase, segundo quem escreveu',
    texto:
      'A regra é curta e vem da roça: o que se queria ver crescer ia para a terra com a Lua crescendo, e o que se queria secar ou diminuir era feito na minguante. Tem fonte nas duas pontas — Paládio, Opus Agriculturae I.6.12, séc. IV-V, para semear na crescente; Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I, para cortar, colher e tosquiar na minguante.',
    fontes: ['paladio', 'plinioColheita'],
    ressalvas: [
      'A divisão antiga do ciclo lunar é em QUATRO quartos, com qualidades elementares — Ptolomeu, Tetrabiblos I.8, séc. II. As oito fases nomeadas com leitura psicológica são de Dane Rudhyar, The Lunation Cycle, séc. XX (1967).',
      'A fama de a Lua Cheia ser fase de colheita inverte a fonte antiga: Columela, De Re Rustica XI.2.85, séc. I, semeia fava na cheia, e é a minguante que Plínio reserva para colher e guardar.',
      'A fonte fala de planta, madeira e animal. Transpor "podar galho" para "encerrar assinatura" é leitura nossa, contemporânea, e cada ritual marca onde faz isso.',
    ],
  },
};

// O lastro no idioma pedido. A ESTRUTURA vem sempre da fonte de verdade acima
// (inclusive `fontes`, que é id técnico); do pack vêm só titulo/texto/
// ressalvas. Sem `lang`, devolve o próprio LASTRO_MOMENTO_IDEAL — mesmo
// objeto, zero cópia.
export function lastroMomentoIdeal(lang) {
  const p = packDoIdioma(lang);
  if (!p || !p.momentoIdeal) return LASTRO_MOMENTO_IDEAL;
  const saida = {};
  for (const [chave, bloco] of Object.entries(LASTRO_MOMENTO_IDEAL)) {
    const tb = p.momentoIdeal[chave];
    saida[chave] = tb
      ? { ...bloco, titulo: tb.titulo, texto: tb.texto, ressalvas: tb.ressalvas }
      : bloco;
  }
  return saida;
}

// ---------------------------------------------------------------------------
// 6. OS RITUAIS
// ---------------------------------------------------------------------------
// Cada entrada tem os cinco campos aprovados pelo dono:
//   intencao        → INTENÇÃO
//   materiais       → MATERIAIS
//   passos          → PASSO A PASSO
//   momento         → MOMENTO IDEAL (fasesLua e/ou diasSemana + o texto que
//                     explica o lastro, com o recibo no fim)
//   cuidados        → CUIDADOS E ÉTICA (termina SEMPRE no AVISO_ETICO literal)
//
// Mais dois campos de rigor, que não são decoração:
//   fontes          → ids de FONTES_TRADICAO efetivamente citados na prosa
//   naoTemFonte     → o que o mercado diz e a fonte antiga NÃO sustenta, cada
//                     linha terminando na frase literal SEM_FONTE_ANTIGA
//
// `aviso` não é escrito aqui: ele é colado em todo ritual pelo `.map` do fim
// do arquivo, pra ser impossível esquecer um.
const RITUAIS_BASE = [
  // ===================== AMOR =====================
  {
    id: 'amor-carta-que-nao-se-envia',
    categoria: 'amor',
    titulo: 'A carta que não se envia',
    intencao:
      'É pra você colocar no papel o que sente por alguém, ler em voz alta uma vez e guardar. O destino da carta é a gaveta, não a pessoa — o que se faz aqui é ficar com o que é seu, sem mexer com quem está do outro lado. Escrever afeto para si mesmo é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: [
      'Uma folha de papel e uma caneta',
      'Um envelope',
      'Uma vela branca, se você quiser (é opcional e não muda nada do que está escrito aqui)',
    ],
    passos: [
      'Sente numa mesa, celular em outro cômodo, e escreva no alto da folha a data de hoje — sem o nome da pessoa.',
      'Escreva em primeira pessoa: o que você sente, o que gostaria de ter dito, o que você não vai dizer.',
      'Leia o texto em voz alta, uma vez só, do começo ao fim.',
      'Dobre a folha, coloque no envelope e escreva a data de hoje por fora.',
      'Guarde o envelope num lugar seu. Se acender a vela, apague antes de sair do cômodo.',
    ],
    momento: {
      fasesLua: ['Lua Nova', 'Lua Crescente'],
      diasSemana: [5],
      texto:
        'Sexta é o dia em que dá pra parar e olhar o que você sente sem a semana empurrando. E o nome do dia carrega Vênus desde a Antiguidade: ele sai da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido —, de onde a sequência dos dias é derivada pulando três posições a cada volta de 24 horas. Vênus aparece mesmo em juízo antigo sobre casal: Māshā\'allāh, Book of Aristotle III.7.11, séc. VIII, olha Vênus e a Lua no mesmo signo. A Lua Nova entra como começo do mês lunar, que é marcação de calendário antiga de verdade. Quem registra a fila dos dias é Dião Cássio, História Romana 37.18-19, séc. III — e ele mesmo diz que o costume era novidade no tempo dele —; quem conta o mês lunar dia a dia é Hesíodo, Os Trabalhos e os Dias, vv. 765-828, séc. VII a.C.',
      fontes: ['dioCassio', 'mashaallahVenus', 'hesiodo'],
    },
    cuidados:
      'Este ritual é sobre o que você sente, e para aí. Não escreva o nome de ninguém no papel: com nome, o exercício deixa de ser sobre o que você sente e vira gesto dirigido a outra pessoa. Não escreva pedindo que a outra pessoa mude de ideia, não mande a carta depois e não use o nome de ninguém como alvo. Se o assunto envolve alguém que pediu distância, respeite a distância. ' +
      AVISO_ETICO,
    fontes: ['dioCassio', 'mashaallahVenus', 'hesiodo'],
    naoTemFonte: [
      'Acender vela num gesto de afeto, de qualquer cor, inclusive branca: prática popular contemporânea, sem fonte antiga localizada.',
      'Escrever uma carta para não enviar: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'amor-mesa-posta-pra-dois',
    categoria: 'amor',
    titulo: 'A mesa posta pra dois',
    intencao:
      'É pra tirar uma noite do automático com quem você já está: mesa posta, telefone longe, uma conversa que não seja logística de casa. O que se faz aqui é dar atenção de propósito a quem está do seu lado. Jantar como gesto de vínculo é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: [
      'Uma mesa e duas cadeiras',
      'A comida de que vocês dois gostam (pode ser simples)',
      'Duas velas, ou qualquer luz baixa',
      'Um combinado: os dois telefones em outro cômodo',
    ],
    passos: [
      'Combinem o dia com antecedência, os dois de acordo. Ritual marcado por um só vira cobrança.',
      'Ponha a mesa antes: prato, copo, a luz baixa.',
      'Deixem os dois telefones em outro cômodo.',
      'Cada um fala, sem ser interrompido, uma coisa que reparou no outro este mês.',
      'Depois conversem sobre qualquer coisa que não seja conta, agenda nem trabalho.',
      'Apaguem as velas juntos no fim.',
    ],
    momento: {
      fasesLua: ['Lua Gibosa Crescente', 'Lua Cheia'],
      diasSemana: [5],
      texto:
        'Sexta cai bem por motivo prático — é quando dá pra ficar acordado sem pensar no despertador — e o nome do dia carrega Vênus por herança da fila antiga dos planetas, a ordem caldaica: os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. A Lua Cheia entra por ser o pico de luz do ciclo, o que é astronomia; já lê-la como hora de ver com clareza é leitura de hoje, e a fonte antiga dá outro uso pra ela. Quem registra a fila dos dias é Dião Cássio, História Romana 37.18-19, séc. III; quem semeia fava na véspera ou no próprio dia da cheia é Columela, De Re Rustica XI.2.85, séc. I.',
      fontes: ['dioCassio', 'columelaFava'],
    },
    cuidados:
      'Combine antes. Um ritual de casal decidido por uma pessoa só deixa de ser ritual e vira teste. Se a outra pessoa não quiser, não insista e não remarque por conta própria. ' +
      AVISO_ETICO,
    fontes: ['dioCassio', 'columelaFava'],
    naoTemFonte: [
      'Jantar à luz de velas como ritual de casal: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'amor-lista-do-que-eu-quero-sentir',
    categoria: 'amor',
    titulo: 'A lista do que eu quero sentir',
    intencao:
      'É uma lista curta, escrita à mão, do que você quer sentir numa relação — e não de quem você quer que apareça. A diferença é o ponto do exercício: nome de pessoa vira cobrança, sensação vira critério seu. Lista de intenções na Lua Nova é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Papel e caneta', 'Dez minutos sem interrupção'],
    passos: [
      'Escreva no alto da folha: "o que eu quero sentir".',
      'Liste no máximo sete itens, um por linha, cada um começando por um verbo.',
      'Risque tudo que for nome de pessoa. Se sobrar linha vazia, deixe vazia.',
      'Leia a lista uma vez em voz alta.',
      'Guarde o papel onde você vai reencontrar sem procurar — dentro de um livro que você usa.',
    ],
    momento: {
      fasesLua: ['Lua Nova', 'Lua Crescente'],
      diasSemana: [],
      texto:
        'Começar no escuro da Lua é um gesto velho, e ele é agrícola antes de ser simbólico. A lavoura romana plantava figueira, macieira, oliveira, pereira e videira com a lua muda — o nome romano para a Lua Nova, quando ela não aparece no céu —, sempre à tarde. Quem manda isso é Catão, o Velho, De Agri Cultura 40.1, séc. II a.C.; e Paládio, Opus Agriculturae I.6.12, séc. IV-V, repete a regra de semear com a lua crescendo. Trocar a semente por uma intenção é transposição nossa, e fica dito: prática popular contemporânea, sem fonte antiga localizada.',
      fontes: ['cataoPlantio', 'paladio'],
    },
    cuidados:
      'Não escreva nome de gente na lista. O exercício perde o sentido e vira tentativa de mexer na vida de outra pessoa. Se a lista virar cobrança contra você mesmo, rasgue e escreva uma menor. ' +
      AVISO_ETICO,
    fontes: ['cataoPlantio', 'paladio'],
    naoTemFonte: [
      'Lista de desejos na Lua Nova: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },

  // ===================== PROSPERIDADE =====================
  {
    id: 'prosperidade-conta-na-mesa',
    categoria: 'prosperidade',
    titulo: 'A conta na mesa',
    intencao:
      'É pôr todas as contas do mês em cima da mesa, em papel, e olhar de uma vez em vez de olhar uma por uma no susto. O que se faz aqui é enxergar o tamanho real do que existe. Olhar as contas juntas é organização doméstica, não tradição: prática popular contemporânea, sem fonte antiga localizada.',
    materiais: [
      'Todas as contas e boletos do mês, impressos ou anotados',
      'Uma folha de papel',
      'Uma caneta',
      'Uma mesa livre',
    ],
    passos: [
      'Esvazie a mesa por completo antes de começar.',
      'Coloque cada conta aberta sobre a mesa, todas visíveis ao mesmo tempo.',
      'Na folha, escreva três colunas: vence esta semana, vence este mês, pode esperar.',
      'Passe cada papel para uma coluna. Nenhum papel fica de fora.',
      'Some cada coluna e escreva o total embaixo, com a data de hoje.',
      'Guarde a folha à vista e recolha as contas.',
    ],
    momento: {
      fasesLua: [],
      diasSemana: [4],
      texto:
        'Quinta é o dia que a semana ainda dá pra consertar: o que aparecer aqui ainda cabe em sexta. E o nome do dia carrega Júpiter desde a Antiguidade, por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. Sobre o próprio Júpiter, a fonte antiga fala de física, não de dinheiro: aquecer e umedecer, numa força chamada de temperada. Ligar Júpiter a dinheiro é leitura de hoje: prática popular contemporânea, sem fonte antiga localizada. Quem registra a fila dos dias é Dião Cássio, História Romana 37.18-19, séc. III — e ele mesmo avisa que o costume era recente no tempo dele —; a física do planeta é de Ptolomeu, Tetrabiblos I.4, séc. II.',
      fontes: ['dioCassio', 'ptolomeuI4'],
    },
    cuidados:
      'Isto é um inventário, não um plano de pagamento. Se o total assustar, o próximo passo é conversar com quem entende de dívida — não repetir o ritual. E não faça este com a conta de outra pessoa sem que ela esteja junto. ' +
      AVISO_ETICO,
    fontes: ['dioCassio', 'ptolomeuI4'],
    naoTemFonte: [
      'Júpiter como planeta do dinheiro: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'prosperidade-semear-na-cheia',
    categoria: 'prosperidade',
    titulo: 'Semear na cheia',
    intencao:
      'É plantar alguma coisa de verdade — um vaso, uma muda, um punhado de feijão no algodão — no dia da Lua Cheia, e cuidar dela por um mês. O que se faz aqui é assumir um trabalho que só depende de você aparecer todo dia. E a data tem fonte agrícola direta: Columela, De Re Rustica XI.2.85, séc. I, semeia fava na véspera ou no próprio dia da lua cheia.',
    materiais: [
      'Um vaso com terra, ou um pote com algodão',
      'Sementes (feijão serve, e é o parente mais próximo da fava da fonte)',
      'Água',
      'Um lugar com luz',
    ],
    passos: [
      'No dia da cheia, prepare a terra ou molhe o algodão.',
      'Ponha as sementes e cubra.',
      'Escreva num papelzinho a data e uma frase curta sobre o que você está começando neste mês.',
      'Deixe o papel embaixo do vaso.',
      'Regue todo dia, no mesmo horário, até a próxima Lua Cheia.',
      'Na cheia seguinte, leia o papel e escreva embaixo o que aconteceu de fato.',
    ],
    momento: {
      fasesLua: ['Lua Cheia'],
      diasSemana: [],
      texto:
        'Aqui a data não é enfeite: é o dia que a fonte manda mesmo. Columela, De Re Rustica XI.2.85, séc. I, semeia fava na véspera ou no próprio dia da lua cheia — e essa é a exceção interessante, porque a regra geral da lavoura romana é a oposta: Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I, põe na minguante tudo que se corta, colhe e tosquia. Cheia para pôr, minguante para tirar. O que a fonte não diz é que isso valha para dinheiro — essa parte é prática popular contemporânea, sem fonte antiga localizada.',
      fontes: ['columelaFava', 'plinioColheita'],
    },
    cuidados:
      'A planta é uma planta. Se ela morrer, não significa nada sobre você nem sobre o seu mês — significa que faltou água, faltou luz ou a semente não vingou. Não decida nada de dinheiro em cima do que a muda fez ou deixou de fazer. ' +
      AVISO_ETICO,
    fontes: ['columelaFava', 'plinioColheita'],
    naoTemFonte: [
      'Plantar semente para assunto de dinheiro: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'prosperidade-caderno-do-que-entra',
    categoria: 'prosperidade',
    titulo: 'O caderno do que entra',
    intencao:
      'É abrir um caderno só para anotar o que entra de dinheiro, linha por linha, durante um ciclo inteiro da Lua. O que se faz aqui é olhar de frente um número que a maioria de nós evita. Caderno de entradas é hábito de gestão doméstica: prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Um caderno pequeno, só para isto', 'Uma caneta', 'Cinco minutos por dia'],
    passos: [
      'Comece na Lua Nova. Escreva a data na primeira página.',
      'Toda vez que entrar dinheiro, anote: data, valor, de onde veio.',
      'Não anote saída neste caderno. Ele é só de entrada, de propósito.',
      'Na Lua Cheia, some o que tem até ali e escreva o subtotal.',
      'Na Lua Nova seguinte, feche o ciclo com o total e uma frase sobre o que você viu.',
    ],
    momento: {
      fasesLua: ['Lua Nova'],
      diasSemana: [],
      texto:
        'Começa na Lua Nova por um motivo de contagem: o mês da Lua é medido de uma nova até a nova seguinte, 29 dias e meio, e isso é marcação de tempo, não simbolismo. O mês lunar contado dia a dia, do primeiro ao trigésimo, já está em Hesíodo, Os Trabalhos e os Dias, vv. 765-828, séc. VII a.C. O que a fonte não faz é ligar esse começo a dinheiro — isso é prática popular contemporânea, sem fonte antiga localizada.',
      fontes: ['hesiodo'],
    },
    cuidados:
      'Anotar entrada não muda quanto entra. Se o caderno mostrar que não fecha, o passo seguinte é procurar ajuda concreta — orientação de crédito, renegociação, um trabalho a mais. ' +
      AVISO_ETICO,
    fontes: ['hesiodo'],
    naoTemFonte: [
      'Caderno de entradas fechado por ciclo lunar: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },

  // ===================== PROTEÇÃO =====================
  {
    id: 'protecao-volta-pela-casa',
    categoria: 'protecao',
    titulo: 'A volta pela casa',
    intencao:
      'É dar uma volta pela sua casa, cômodo por cômodo, conferindo o que fecha e o que está solto: porta, janela, registro de gás, tomada, o que precisa ficar fora do alcance de criança. O que se faz aqui é cuidado prático com o lugar onde você mora. Ronda de conferência é hábito doméstico: prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Cinco minutos', 'Um papel para anotar o que precisa de conserto'],
    passos: [
      'Comece pela porta da frente e siga sempre no mesmo sentido.',
      'Em cada cômodo, confira o que fecha: janela, registro, tomada, botijão.',
      'Anote o que estiver quebrado em vez de tentar consertar na hora.',
      'Termine na porta da frente e escreva no papel a data e a hora em que você fechou a ronda.',
      'No dia seguinte, resolva o primeiro item da lista.',
    ],
    momento: {
      fasesLua: [],
      diasSemana: [6],
      texto:
        'Sábado é o dia em que a casa está cheia de gente e dá pra olhar tudo de uma vez, sem correr. O nome dele carrega Saturno por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. Sobre Saturno em si, a fonte antiga descreve física e clima, não guarda de porta: resfriar e secar. Fazer disso um "dia de fechar a casa" é salto nosso, e o salto fica declarado: prática popular contemporânea, sem fonte antiga localizada. Quem registra a fila dos dias é Dião Cássio, História Romana 37.18-19, séc. III; a física do planeta é de Ptolomeu, Tetrabiblos I.4, séc. II.',
      fontes: ['dioCassio', 'ptolomeuI4'],
    },
    cuidados:
      'Isto é conferência, não escudo. Se alguma coisa da lista envolver risco — fiação, gás, estrutura —, chame profissional em vez de repetir a ronda. ' +
      AVISO_ETICO,
    fontes: ['dioCassio', 'ptolomeuI4'],
    naoTemFonte: [
      'Sábado como dia de resguardo da casa: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'protecao-hora-escolhida',
    categoria: 'protecao',
    titulo: 'A hora escolhida',
    intencao:
      'É escolher com antecedência o dia e a hora de começar uma coisa importante — mudança, viagem, primeira reunião, assinatura — em vez de começar no dia que sobrou. O que se faz aqui é chegar decidido. E a prática está documentada, com data e endereço: em 762 quem elegeu a hora de fundar Bagdá foi Nawbakht, o Persa, assistido pelo jovem Māshā\'allāh ibn Atharī, séc. VIII, e o episódio chega até nós por al-Bīrūnī, Cronologia das Nações Antigas, séc. XI.',
    materiais: ['Um calendário', 'A agenda das pessoas envolvidas', 'Papel e caneta'],
    passos: [
      'Escreva em uma linha o que vai começar. Uma linha só.',
      'Escolha três datas possíveis nas próximas quatro semanas.',
      'Para cada data, anote a fase da Lua e o dia da semana.',
      'Escolha uma e escreva o horário, com hora e minuto.',
      'Avise as pessoas envolvidas da data escolhida.',
      'No dia, comece no horário marcado, mesmo que seja com um gesto pequeno.',
    ],
    momento: {
      fasesLua: ['Lua Crescente', 'Quarto Crescente'],
      diasSemana: [],
      texto:
        'Escolher a hora de começar é um ramo inteiro da astrologia antiga — escolher o momento —, que os árabes chamavam de ikhtiyārāt, as escolhas. E ele tem caso com data e endereço: a tarde de 31 de julho de 762 foi eleita para iniciar a construção de Bagdá por Nawbakht, o Persa, assistido pelo jovem Māshā\'allāh ibn Atharī, séc. VIII, e a carta chega até nós por al-Bīrūnī, Cronologia das Nações Antigas, séc. XI. Duas honestidades. A base de pesquisa deste app registra também Doroteu de Sídon, Carmen Astrologicum, séc. I, como origem dessa linhagem, mas não leu a obra diretamente — fica como atribuição registrada, não como leitura própria. E o critério antigo era o céu inteiro do instante — onde estava cada planeta, em que pedaço do céu, e o que estava subindo no horizonte —, não "lua crescente e pronto": usar só a fase é simplificação nossa, prática popular contemporânea, sem fonte antiga localizada.',
      fontes: ['mashaallahBagda', 'albiruni', 'doroteu'],
    },
    cuidados:
      'Escolher a data decide quando você começa, e só isso — o que vem depois dela continua sendo trabalho. Não adie decisão urgente esperando fase da Lua, e nunca adie consulta marcada, prazo legal ou providência de segurança por causa de calendário. ' +
      AVISO_ETICO,
    fontes: ['mashaallahBagda', 'albiruni', 'doroteu'],
    naoTemFonte: [
      'Reduzir a eleição do momento a "fase da Lua + dia da semana": prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'protecao-limite-escrito',
    categoria: 'protecao',
    titulo: 'O limite escrito',
    intencao:
      'É escrever, em uma frase, o que você não vai mais aceitar — e escrever também o que você vai fazer quando acontecer de novo. O que se faz aqui é sair do "eu deveria ter dito" e já ter a frase pronta. Escrever o limite antes da conversa é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Papel e caneta', 'Um lugar onde ninguém vai ler por cima do ombro'],
    passos: [
      'Escreva a situação em uma frase, sem adjetivo: o que acontece, com quem, com que frequência.',
      'Escreva o limite em uma frase que comece com "eu".',
      'Escreva o que você vai fazer da próxima vez. Precisa ser algo que dependa só de você.',
      'Leia as três frases em voz alta.',
      'Guarde o papel na carteira, ou fotografe e guarde no celular.',
    ],
    momento: {
      fasesLua: [],
      diasSemana: [2],
      texto:
        'Terça é dia útil cedo o bastante para a frase escrita aqui ainda valer a semana toda. O nome do dia leva Marte por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. E a fonte antiga sobre Marte é bem menos épica que a fama: secar e queimar, pela cor de fogo do planeta — é física, não caráter. Usar terça como dia de assunto difícil é escolha nossa: prática popular contemporânea, sem fonte antiga localizada. Quem registra a fila dos dias é Dião Cássio, História Romana 37.18-19, séc. III; a física do planeta é de Ptolomeu, Tetrabiblos I.4, séc. II.',
      fontes: ['dioCassio', 'ptolomeuI4'],
    },
    cuidados:
      'Limite é sobre a sua conduta, não sobre obrigar ninguém a nada. Se a situação envolver violência ou ameaça, isto aqui não serve: procure delegacia, rede de apoio ou alguém de confiança hoje mesmo. ' +
      AVISO_ETICO,
    fontes: ['dioCassio', 'ptolomeuI4'],
    naoTemFonte: [
      'Marte como planeta da coragem e do limite: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },

  // ===================== LIMPEZA =====================
  // Esta é a categoria com o melhor lastro antigo de toda a biblioteca, e não
  // por acaso: "tirar na minguante" é a regra latina mais repetida e mais bem
  // documentada que existe sobre a Lua (doc 04 §3.2).
  {
    id: 'limpeza-cortar-o-que-ja-secou',
    categoria: 'limpeza',
    titulo: 'Cortar o que já secou',
    intencao:
      'É escolher uma coisa que claramente acabou — uma assinatura que você não usa, um grupo que só ocupa espaço, uma pilha de papel velho — e encerrar de fato, hoje. O que se faz aqui é o corte, em vez do adiamento. E o gesto de cortar na Lua minguante tem fonte: Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I, escreve que tudo que se corta, se colhe e se tosquia sofre menos dano com a lua decrescente.',
    materiais: [
      'Uma lista das coisas que você vem adiando encerrar',
      'Celular ou computador, se o cancelamento for online',
      'Um saco de lixo ou uma caixa de doação, se for coisa física',
    ],
    passos: [
      'Escolha UMA coisa. Só uma.',
      'Escreva o nome dela num papel.',
      'Faça o encerramento agora: cancele, saia do grupo, jogue fora, doe.',
      'Risque o nome no papel.',
      'Guarde o papel riscado até a próxima Lua minguante e escolha a próxima.',
    ],
    momento: {
      fasesLua: FASES_MINGUANTES,
      diasSemana: [],
      texto:
        'Este é o ritual com a fonte mais direta da biblioteca inteira, e vale dizer por quê: a lavoura antiga TIRA na minguante, e isso está escrito, não é folclore. Tudo que se corta, se colhe e se tosquia sofria menos dano com a lua decrescente, e a uva para passa era colhida na minguante. Transpor "podar galho" para "cancelar assinatura" é nosso, contemporâneo: prática popular contemporânea, sem fonte antiga localizada. Quem escreve as duas coisas é Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I, e Columela, De Re Rustica XII.16.1, séc. I.',
      fontes: ['plinioColheita', 'columelaPassa'],
    },
    cuidados:
      'Encerre só o que é seu para encerrar. Não cancele, não jogue fora e não apague coisa de outra pessoa. E se a vontade de cortar estiver mirando um vínculo com gente, espere um dia antes de fazer qualquer coisa. ' +
      AVISO_ETICO,
    fontes: ['plinioColheita', 'columelaPassa'],
    naoTemFonte: [
      'Aplicar a regra da minguante a assinatura, grupo ou compromisso: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'limpeza-uma-gaveta-so',
    categoria: 'limpeza',
    titulo: 'Uma gaveta só',
    intencao:
      'É escolher uma gaveta — uma, não o armário inteiro — esvaziar em cima da cama e devolver só o que você usou nos últimos doze meses. O que se faz aqui é terminar alguma coisa hoje, em vez de começar uma reforma. Arrumar uma gaveta por vez é método doméstico corrente: prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Uma gaveta', 'Duas caixas: uma de doação, uma de lixo', 'Um pano úmido'],
    passos: [
      'Escolha a gaveta antes de começar e não mude de ideia no meio.',
      'Esvazie tudo em cima da cama ou do chão.',
      'Passe o pano no fundo da gaveta vazia.',
      'Devolva só o que você usou nos últimos doze meses.',
      'O resto vai para a caixa de doação ou de lixo hoje, antes de o dia acabar.',
      'Feche a gaveta e não abra até amanhã.',
    ],
    momento: {
      fasesLua: ['Quarto Minguante', 'Lua Minguante'],
      diasSemana: [],
      texto:
        'A minguante é a metade do mês lunar em que a lavoura antiga tira em vez de pôr, e isso está escrito em mais de um lugar. Estercava-se e capinava-se com a lua decrescente; escrevia-se que o esterco espalhado na minguante não fazia brotar a erva daninha que vinha dentro dele; e já se estercava com a lua muda — o nome romano para a Lua Nova, quando ela não aparece no céu. Chamar gaveta bagunçada de "erva daninha" é figura nossa: prática popular contemporânea, sem fonte antiga localizada. Os três recibos: Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I; Columela, De Re Rustica II.5.1, séc. I; Catão, o Velho, De Agri Cultura 29, séc. II a.C.',
      fontes: ['plinioColheita', 'columelaEsterco', 'cataoEsterco'],
    },
    cuidados:
      'Uma gaveta. Se você abrir o armário inteiro, o ritual vira mudança e fica pela metade. E não jogue fora coisa que é de outra pessoa da casa sem perguntar. ' +
      AVISO_ETICO,
    fontes: ['plinioColheita', 'columelaEsterco', 'cataoEsterco'],
    naoTemFonte: [
      'Arrumação de casa como assunto de fase lunar: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'limpeza-o-que-ja-pode-ficar-pra-tras',
    categoria: 'limpeza',
    titulo: 'O que já pode ficar pra trás',
    intencao:
      'É escrever, à mão, três coisas que você ainda carrega e que já podem ficar onde estão — e depois rasgar ou queimar o papel. O que se faz aqui é o gesto de largar, e ele vale por si. Escrever para rasgar é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: [
      'Papel e caneta',
      'Uma pia, ou um prato fundo com um pouco de água',
      'Se for queimar: um prato de louça e a torneira por perto',
    ],
    passos: [
      'Escreva três frases curtas, uma por linha, começando com "já pode ficar".',
      'Leia as três em voz alta, devagar.',
      'Rasgue o papel em pedaços pequenos, ou queime em cima do prato de louça, com a torneira aberta ao lado.',
      'Jogue os pedaços fora, ou molhe as cinzas antes de descartar.',
      'Lave as mãos e volte para o que você estava fazendo.',
    ],
    momento: {
      fasesLua: ['Quarto Minguante', 'Lua Minguante'],
      diasSemana: [1],
      texto:
        'Segunda é o dia de tirar da frente o que ficou pendurado do mês passado. O nome dele leva a Lua por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. A fase importa aqui pelo mesmo motivo dos outros rituais de limpeza: a minguante é onde a lavoura antiga punha tudo que se corta, colhe e tosquia. E vale saber que a divisão em oito fases nomeadas que o app mostra na tela não é antiga; a antiga é em quatro quartos. Os recibos: Dião Cássio, História Romana 37.18-19, séc. III, para a fila dos dias; Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I, para a minguante; Ptolomeu, Tetrabiblos I.8, séc. II, para os quatro quartos; e Dane Rudhyar, The Lunation Cycle, séc. XX (1967), para as oito fases psicológicas.',
      fontes: ['dioCassio', 'plinioColheita', 'rudhyar', 'ptolomeuI8'],
    },
    cuidados:
      'Se for queimar, faça na pia, com água aberta ao lado, e nunca perto de cortina ou de álcool. Se as três frases forem sobre uma pessoa, escreva o que VOCÊ vai fazer, não o que ela deveria fazer. ' +
      AVISO_ETICO,
    fontes: ['dioCassio', 'plinioColheita', 'rudhyar', 'ptolomeuI8'],
    naoTemFonte: [
      'Queimar papel escrito como encerramento simbólico: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },

  // ===================== CORAGEM =====================
  {
    id: 'coragem-ligacao-que-voce-adia',
    categoria: 'coragem',
    titulo: 'A ligação que você adia',
    intencao:
      'É fazer hoje uma ligação que você vem empurrando há semanas — a do dentista, a do banco, a do parente. O que se faz aqui é riscar da lista um item que está lá há tempo demais. Encarar a pendência com hora marcada é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: [
      'O número de telefone, já anotado',
      'Um relógio',
      'Duas frases escritas: como você vai abrir e o que precisa perguntar',
    ],
    passos: [
      'Escreva o número num papel, à mão.',
      'Escreva a primeira frase que você vai dizer, inteira.',
      'Escreva a pergunta principal. Uma só.',
      'Marque a hora: nos próximos trinta minutos.',
      'Ligue. Se cair na caixa, deixe recado com a primeira frase.',
      'Risque o número do papel.',
    ],
    momento: {
      fasesLua: [],
      diasSemana: [2],
      texto:
        'Terça é cedo o bastante na semana pra ligação ainda ser resolvida antes de sexta. O nome do dia leva Marte por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. Marte como planeta da coragem é leitura de personalidade, e é recente: a fonte antiga só fala de calor e secura — secar e queimar, pela cor de fogo do planeta. Usar terça como dia de encarar pendência é escolha nossa: prática popular contemporânea, sem fonte antiga localizada. Os recibos: Dião Cássio, História Romana 37.18-19, séc. III, que conta que o costume era novo no tempo dele; e Ptolomeu, Tetrabiblos I.4, séc. II.',
      fontes: ['dioCassio', 'ptolomeuI4'],
    },
    cuidados:
      'Se a ligação for para alguém que pediu para não ser procurado, não ligue. O que se encara aqui é a sua pendência, nunca o limite de outra pessoa. ' +
      AVISO_ETICO,
    fontes: ['dioCassio', 'ptolomeuI4'],
    naoTemFonte: [
      'Terça-feira como dia de encarar pendência: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'coragem-tres-linhas-antes',
    categoria: 'coragem',
    titulo: 'Três linhas antes',
    intencao:
      'É escrever três linhas antes de uma conversa difícil: o que você quer dizer, o que você não vai dizer, e como você quer sair da sala. O que se faz aqui é entrar com um plano em vez de improvisar. Roteirizar conversa antes é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Um cartão ou meia folha de papel', 'Caneta', 'Cinco minutos antes da conversa'],
    passos: [
      'Linha 1: a frase que abre. Escreva inteira, palavra por palavra.',
      'Linha 2: o que você decidiu não dizer, mesmo que apareça a chance.',
      'Linha 3: como você quer sair — o que você quer ter combinado ao fim.',
      'Leia as três em voz alta, uma vez.',
      'Dobre o papel e leve no bolso.',
      'Depois da conversa, escreva atrás o que de fato aconteceu.',
    ],
    momento: {
      fasesLua: ['Lua Crescente', 'Quarto Crescente'],
      diasSemana: [2],
      texto:
        'A fase crescente entra pela regra geral da lavoura antiga, e ela é simples: o que se queria ver crescer ia para a terra com a Lua crescendo. Terça leva o nome de Marte por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. E o encaixe entre "lua crescente" e "conversa difícil" é nosso: prática popular contemporânea, sem fonte antiga localizada. Os recibos: Paládio, Opus Agriculturae I.6.12, séc. IV-V, para semear na crescente; Dião Cássio, História Romana 37.18-19, séc. III, para a fila dos dias.',
      fontes: ['paladio', 'dioCassio'],
    },
    cuidados:
      'Conversa difícil combinada é melhor que conversa difícil de emboscada: avise a pessoa que você quer falar. Se houver risco de agressão, não faça sozinho e não faça em casa. ' +
      AVISO_ETICO,
    fontes: ['paladio', 'dioCassio'],
    naoTemFonte: [
      'Marcar conversa difícil pela fase da Lua: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'coragem-o-dia-escolhido',
    categoria: 'coragem',
    titulo: 'O dia escolhido',
    intencao:
      'É marcar no calendário, com dia e hora, aquela coisa que você adia há meses — a inscrição, a entrevista, o pedido. O que se faz aqui é transformar "um dia eu faço" em uma linha na agenda. Escolher a data como forma de se comprometer é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: [
      'Um calendário à vista',
      'Caneta que não apaga',
      'Uma pessoa para quem você vai contar a data',
    ],
    passos: [
      'Escreva a coisa em uma linha.',
      'Escolha uma data nos próximos vinte e um dias.',
      'Escreva no calendário, à mão, com hora.',
      'Conte a data para uma pessoa hoje.',
      'Na véspera, releia a linha que você escreveu.',
    ],
    momento: {
      fasesLua: FASES_CRESCENTES,
      diasSemana: [],
      texto:
        'Escolher um dia bom para começar é coisa velha, e é mais literal do que parece: Hesíodo, Os Trabalhos e os Dias, vv. 765-828, séc. VII a.C., lista dia por dia do mês lunar quais são bons e quais não são; Virgílio, Geórgicas I.276-286, séc. I a.C., manda fugir do quinto dia e chama o décimo sétimo de feliz para plantar a vinha. Duas ressalvas honestas: os dois contam DIAS do mês lunar, de 1 a 30, e não fases — converter isso em "Lua Crescente" é conta nossa; e a lista deles é sobre lavoura e casa, não sobre inscrição em concurso. Nas duas pontas, o que sobra é prática popular contemporânea, sem fonte antiga localizada.',
      fontes: ['hesiodo', 'virgilio'],
    },
    cuidados:
      'Marcar a data não faz o trabalho. Se chegar o dia e você não estiver pronto, remarque uma vez e escreva por quê — remarcar três vezes é sinal de que o passo está grande demais e precisa ser quebrado em pedaços menores. ' +
      AVISO_ETICO,
    fontes: ['hesiodo', 'virgilio'],
    naoTemFonte: [
      'Converter os dias do mês lunar de Hesíodo e Virgílio em fases nomeadas: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },

  // ===================== FOCO =====================
  {
    id: 'foco-uma-coisa-so',
    categoria: 'foco',
    titulo: 'Uma coisa só',
    intencao:
      'É escolher, no começo do dia, uma única coisa que precisa acontecer — e escrever num papel que fica na frente do teclado. O que se faz aqui é ter um critério pronto para dizer "isso não é hoje". Escolher uma tarefa principal por dia é método de trabalho corrente: prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Um papel pequeno', 'Caneta', 'Um lugar fixo onde o papel fica visível'],
    passos: [
      'Antes de abrir qualquer mensagem, escreva a única coisa do dia.',
      'Escreva embaixo o que você combina consigo de NÃO fazer hoje.',
      'Coloque o papel na frente do teclado, ou na porta da geladeira.',
      'Ao fim do dia, escreva atrás: feito, meio feito ou não feito.',
      'Guarde os papéis da semana juntos e olhe todos no domingo.',
    ],
    momento: {
      fasesLua: [],
      diasSemana: [3],
      texto:
        'Quarta é o meio da semana: o dia em que dá pra ver se a semana está indo ou não. O nome dele leva Mercúrio por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. E tem um detalhe bonito na fonte antiga: Mercúrio é o único dos sete sem qualidade fixa, ora secando, ora absorvendo umidade, como que inspirado pela rapidez do próprio movimento. Ligar isso a estudo e escrita é convenção de hoje: prática popular contemporânea, sem fonte antiga localizada. Os recibos: Dião Cássio, História Romana 37.18-19, séc. III; e Ptolomeu, Tetrabiblos I.4, séc. II.',
      fontes: ['dioCassio', 'ptolomeuI4'],
    },
    cuidados:
      'Uma coisa por dia é um critério, não uma cobrança. Dia em que não deu, escreva "não feito" e siga — a pilha de papéis existe para você ver o padrão da semana, não para virar prova contra você. ' +
      AVISO_ETICO,
    fontes: ['dioCassio', 'ptolomeuI4'],
    naoTemFonte: [
      'Quarta-feira como dia de estudo e escrita: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'foco-mesa-vazia',
    categoria: 'foco',
    titulo: 'A mesa vazia',
    intencao:
      'É deixar a mesa de trabalho com nada em cima além do que você vai usar na próxima hora. O que se faz aqui é tirar da vista o que compete pela sua atenção. Mesa vazia como método é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Uma caixa vazia', 'Um pano', 'Dez minutos'],
    passos: [
      'Tire TUDO da mesa e coloque dentro da caixa.',
      'Passe o pano na mesa vazia.',
      'Devolva apenas o que você vai usar na próxima hora.',
      'Ponha a caixa fora do campo de visão.',
      'Trabalhe uma hora. Depois decida, item por item, o que volta.',
    ],
    momento: {
      fasesLua: ['Quarto Minguante', 'Lua Minguante'],
      diasSemana: [3],
      texto:
        'A ideia de tirar coisas na fase que diminui vem da lavoura romana, e ela é literal: na lua decrescente ia tudo que se corta, colhe e tosquia, e a madeira era cortada entre os dias 20 e 30 do mês lunar. Quarta leva o nome de Mercúrio por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. O pulo de "colher trigo" para "esvaziar a mesa" é nosso: prática popular contemporânea, sem fonte antiga localizada. Os recibos: Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I; Columela, De Re Rustica XI.2.11, séc. I; e Dião Cássio, História Romana 37.18-19, séc. III.',
      fontes: ['plinioColheita', 'columelaMadeira', 'dioCassio'],
    },
    cuidados:
      'Não jogue nada fora neste ritual — tudo vai para a caixa. Decisão de descarte é outro ritual, em outro dia. ' +
      AVISO_ETICO,
    fontes: ['plinioColheita', 'columelaMadeira', 'dioCassio'],
    naoTemFonte: [
      'Esvaziar a mesa de trabalho na minguante: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'foco-vinte-minutos-marcados',
    categoria: 'foco',
    titulo: 'Vinte minutos marcados',
    intencao:
      'É trabalhar vinte minutos cronometrados numa coisa só, com o telefone em outro cômodo, e parar quando o cronômetro tocar mesmo que esteja rendendo. O que se faz aqui é completar um bloco inteiro em vez de picar a tarde. Blocos cronometrados são método de trabalho de hoje: prática popular contemporânea, sem fonte antiga localizada.',
    materiais: [
      'Um cronômetro (o do fogão serve)',
      'A tarefa já escolhida antes de começar',
      'O telefone em outro cômodo',
    ],
    passos: [
      'Escolha a tarefa e escreva o nome dela num papel.',
      'Leve o telefone para outro cômodo.',
      'Marque vinte minutos.',
      'Trabalhe só nessa tarefa. Se lembrar de outra coisa, anote no papel e continue.',
      'Quando tocar, pare. Mesmo rendendo.',
      'Escreva no papel até onde chegou.',
    ],
    momento: {
      fasesLua: ['Quarto Crescente', 'Lua Gibosa Crescente'],
      diasSemana: [],
      texto:
        'A fase crescente entra pela regra agrícola geral: o que se quer que cresça vai com a Lua crescendo, segundo Paládio, Opus Agriculturae I.6.12, séc. IV-V. E o quarto crescente é uma das divisões que têm fonte antiga de verdade: Ptolomeu, Tetrabiblos I.8, séc. II, parte o ciclo em quatro quartos e dá uma qualidade a cada um. As oito fases nomeadas que você vê no app são convenção moderna, e a leitura psicológica delas é de Dane Rudhyar, The Lunation Cycle, séc. XX (1967).',
      fontes: ['paladio', 'ptolomeuI8', 'rudhyar'],
    },
    cuidados:
      'Vinte minutos é um bloco, não uma meta. Se você não conseguir os vinte, anote quantos foram e pare — número anotado serve para ajustar o próximo bloco, não para cobrar. ' +
      AVISO_ETICO,
    fontes: ['paladio', 'ptolomeuI8', 'rudhyar'],
    naoTemFonte: [
      'Bloco cronometrado de trabalho na fase crescente: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },

  // ===================== AUTOESTIMA =====================
  {
    id: 'autoestima-o-que-eu-fiz',
    categoria: 'autoestima',
    titulo: 'O que eu fiz',
    intencao:
      'É escrever, numa folha, o que você de fato fez nos últimos sete dias — inclusive o pequeno, inclusive o chato. O que se faz aqui é ler a lista inteira de uma vez, porque separada ela some. Fazer inventário do que foi feito é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Uma folha inteira', 'Caneta', 'A agenda ou o histórico do celular, para lembrar'],
    passos: [
      'Escreva no alto os sete dias, um embaixo do outro.',
      'Em cada dia, escreva pelo menos uma coisa que você fez. Lavar louça conta.',
      'Não escreva o que faltou. Esta folha é só do que aconteceu.',
      'Leia a folha inteira em voz alta, do começo ao fim.',
      'Guarde e repita no domingo seguinte.',
    ],
    momento: {
      fasesLua: [],
      diasSemana: [0],
      texto:
        'Domingo é quando a semana já acabou e a próxima ainda não começou — é a única hora em que dá pra olhar as duas. O nome dele leva o Sol por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. E a fonte antiga sobre o Sol fala de calor e secura, não de brilho pessoal: aquecer e, em certa medida, secar. Domingo como dia de olhar a semana é combinação nossa, de calendário de trabalho: prática popular contemporânea, sem fonte antiga localizada. Os recibos: Dião Cássio, História Romana 37.18-19, séc. III; e Ptolomeu, Tetrabiblos I.4, séc. II.',
      fontes: ['dioCassio', 'ptolomeuI4'],
    },
    cuidados:
      'Se a folha sair curta, ela está certa assim — semana curta existe. Não transforme a lista em comparação com a semana de outra pessoa. ' +
      AVISO_ETICO,
    fontes: ['dioCassio', 'ptolomeuI4'],
    naoTemFonte: [
      'Domingo como dia de balanço pessoal: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'autoestima-espelho-e-tres-frases',
    categoria: 'autoestima',
    titulo: 'O espelho e três frases',
    intencao:
      'É ficar de frente para o espelho e dizer, em voz alta, três frases sobre coisas que você fez — checáveis, não elogio genérico. O que se faz aqui é ouvir a própria voz dizendo algo que pode ser conferido. Falar ao espelho é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Um espelho', 'As três frases escritas antes, num papel', 'A porta fechada'],
    passos: [
      'Escreva as três frases antes, no papel. Cada uma tem que citar um fato: o que você fez, quando.',
      'Feche a porta e fique de frente para o espelho.',
      'Leia a primeira frase em voz alta, olhando para você.',
      'Repita com a segunda e a terceira.',
      'Dobre o papel e guarde. Não jogue fora.',
    ],
    momento: {
      fasesLua: ['Lua Cheia'],
      diasSemana: [0],
      texto:
        'A Lua Cheia é o pico de luz do ciclo, e isso é astronomia, não interpretação. Ler a cheia como hora de ver com clareza já é leitura de hoje, e a fonte antiga dá outro uso pra ela. Domingo leva o nome do Sol por herança da fila antiga dos planetas — a ordem caldaica, os sete enfileirados do mais lento para o mais rápido, de onde a sequência dos dias é derivada pulando três posições a cada 24 horas planetárias. Os recibos: Columela, De Re Rustica XI.2.85, séc. I, que semeia fava na cheia; Ptolomeu, Tetrabiblos I.8, séc. II, que marca a passagem da cheia ao quarto minguante como o trecho seco do ciclo; e Dião Cássio, História Romana 37.18-19, séc. III, para a fila dos dias.',
      fontes: ['columelaFava', 'ptolomeuI8', 'dioCassio'],
    },
    cuidados:
      'A frase tem que ser checável. Se você não acreditar no que está dizendo, troque por um fato menor e mais verdadeiro — frase que soa falsa não serve para nada aqui. ' +
      AVISO_ETICO,
    fontes: ['columelaFava', 'ptolomeuI8', 'dioCassio'],
    naoTemFonte: [
      'Falar ao espelho na Lua Cheia: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
  {
    id: 'autoestima-carta-de-um-ano',
    categoria: 'autoestima',
    titulo: 'A carta de um ano',
    intencao:
      'É escrever uma carta para você mesmo daqui a um ano, com data, e guardar lacrada. O que se faz aqui é registrar quem você é hoje, com as suas palavras, para conferir depois. Carta para o eu futuro é prática popular contemporânea, sem fonte antiga localizada.',
    materiais: ['Papel e caneta', 'Um envelope', 'Um lugar seguro para guardar por doze meses'],
    passos: [
      'Escreva a data de hoje no alto.',
      'Conte em que ponto você está: trabalho, casa, gente por perto, o que está difícil.',
      'Escreva três perguntas para o você de daqui a um ano.',
      'Não escreva metas. Escreva perguntas.',
      'Lacre o envelope, escreva a data de abertura por fora e guarde.',
      'Na data, abra e responda por escrito.',
    ],
    momento: {
      fasesLua: ['Lua Cheia'],
      diasSemana: [],
      texto:
        'A cheia entra aqui pela luz, que é medida, e vale separar o que é medida do que é leitura. Ptolomeu, Tetrabiblos I.8, séc. II, divide o ciclo lunar em quatro quartos com qualidades — essa é a doutrina antiga de fases, e é só ela. As oito fases nomeadas com leitura de personalidade são de Dane Rudhyar, The Lunation Cycle, séc. XX (1967). E escrever carta para o eu futuro na cheia não está em fonte nenhuma: prática popular contemporânea, sem fonte antiga localizada.',
      fontes: ['ptolomeuI8', 'rudhyar'],
    },
    cuidados:
      'Um ano é muito tempo. Escreva de um jeito que não cobre nada de quem vai abrir — quem abre é você, e pode estar em outro lugar da vida. ' +
      AVISO_ETICO,
    fontes: ['ptolomeuI8', 'rudhyar'],
    naoTemFonte: [
      'Carta para o eu futuro escrita na Lua Cheia: prática popular contemporânea, sem fonte antiga localizada.',
    ],
  },
];

// O aviso ético é COLADO aqui, não escrito ritual a ritual. Escrito à mão em 21
// lugares, o vigésimo segundo ritual nasceria sem ele e ninguém perceberia.
export const RITUAIS = RITUAIS_BASE.map((r) => ({ ...r, aviso: AVISO_ETICO }));

// Veste um ritual com o pack do idioma. SÓ TEXTO troca: id, categoria, fontes,
// fasesLua e diasSemana ficam canônicos — as fases são a chave do casamento
// com lib/lunarCalendar.js e traduzi-las faria o app parar de sugerir ritual
// em silêncio (a armadilha da seção 4). Sem pack (lang ausente, 'pt' ou id
// fora do pack), devolve o MESMO objeto que recebeu — é isso que mantém o PT
// intocado byte a byte e o teste golden verde.
//
// `cuidados` do pack vem SEM o aviso e o aviso é colado aqui — o mesmo desenho
// do `.map` acima, pra ser impossível um idioma esquecer o aviso.
function localizarRitual(r, lang) {
  if (!r) return r;
  const p = packDoIdioma(lang);
  const tr = p && p.rituais && p.rituais[r.id];
  if (!tr) return r;
  return {
    ...r,
    titulo: tr.titulo,
    intencao: tr.intencao,
    materiais: tr.materiais,
    passos: tr.passos,
    momento: { ...r.momento, texto: tr.momentoTexto },
    cuidados: `${tr.cuidados} ${p.avisoEtico}`,
    aviso: p.avisoEtico,
    naoTemFonte: tr.naoTemFonte,
  };
}

export function ritualPorId(id, lang) {
  const r = RITUAIS.find((x) => x.id === id) || null;
  return r ? localizarRitual(r, lang) : null;
}

export function rituaisPorCategoria(categoriaId, lang) {
  return RITUAIS.filter((r) => r.categoria === categoriaId).map((r) => localizarRitual(r, lang));
}

// ---------------------------------------------------------------------------
// 7. O MOMENTO IDEAL, LEGÍVEL
// ---------------------------------------------------------------------------
// A linha curta que vai no cabeçalho do card e no texto de compartilhar:
// "Lua Minguante ou Quarto Minguante · segunda-feira".
//
// `t` é OPCIONAL: sem ele a saída é byte a byte a de sempre (é o que o motor e
// os testes consomem). Com ele, fases e dias saem traduzidos e o "ou" também —
// senão o espanhol leria "Luna Nueva ou Luna Creciente".
export function resumoDoMomento(ritual, t) {
  const r = typeof ritual === 'string' ? ritualPorId(ritual) : ritual;
  if (!r || !r.momento) return '';
  const ou = t ? t('rituais.momento.ou') : 'ou';
  const partes = [];
  const fases = r.momento.fasesLua || [];
  const dias = r.momento.diasSemana || [];
  if (fases.length) partes.push(fases.map((f) => nomeDaFase(f, t)).join(` ${ou} `));
  if (dias.length) {
    partes.push(
      dias
        .map((n) => nomeDoDia(n, t))
        .filter(Boolean)
        .join(` ${ou} `)
    );
  }
  return partes.join(' · ');
}

// ---------------------------------------------------------------------------
// 8. O CASAMENTO COM AGORA — o que alimenta a sugestão diária
// ---------------------------------------------------------------------------
// Semântica E, não OU: um ritual que declara fase E dia só bate quando os dois
// batem. Foi decisão consciente e ela tem um custo — combinação de fase com dia
// acontece poucas vezes por ano. É por isso que `rituaisDeHoje` devolve também
// `parciais`: os que batem em UM critério. A tela nunca fica vazia, e o motivo
// de cada sugestão vai declarado em `motivo`, em vez de o app fingir que o
// encaixe foi perfeito.
//
// Matcher puro, sem relógio nem efeméride — dá pra varrer as 8 fases × 7 dias
// no teste sem depender de data nenhuma.
// `lang` e `t` são opcionais e chegaram juntos: o pack traduz o CONTEÚDO do
// ritual, e `t` traduz o MOTIVO do encaixe (nome de fase e de dia, que já têm
// chave em lib/i18n.js desde a primeira parcela). Sem os dois, a saída é byte
// a byte a de sempre.
export function rituaisPara({ faseLua = null, diaSemana = null } = {}, lang, t) {
  return RITUAIS.filter((r) => {
    const fases = (r.momento && r.momento.fasesLua) || [];
    const dias = (r.momento && r.momento.diasSemana) || [];
    const faseOk = fases.length === 0 ? true : faseLua != null && fases.includes(faseLua);
    const diaOk = dias.length === 0 ? true : diaSemana != null && dias.includes(diaSemana);
    return faseOk && diaOk;
  }).map((r) => ({
    ...localizarRitual(r, lang),
    motivo: motivoDoEncaixe(r, faseLua, diaSemana, lang, t),
  }));
}

function motivoDoEncaixe(r, faseLua, diaSemana, lang, t) {
  const p = packDoIdioma(lang);
  const fases = (r.momento && r.momento.fasesLua) || [];
  const dias = (r.momento && r.momento.diasSemana) || [];
  const partes = [];
  if (fases.length && faseLua && fases.includes(faseLua)) partes.push(nomeDaFase(faseLua, t));
  if (dias.length && diaSemana != null && dias.includes(diaSemana)) {
    const d = diaSemanaPorIndice(diaSemana);
    if (d) {
      const dia = nomeDoDia(diaSemana, t);
      const planeta = nomeDoPlaneta(diaSemana, t);
      // A moldura "(dia de X)" vem do pack porque não existe chave de chrome
      // pra ela — e lib/i18n.js é de outro time neste momento. Sem pack, o
      // literal português de sempre.
      partes.push(
        p && p.motivoDia
          ? p.motivoDia.replace('{dia}', dia).replace('{planeta}', planeta)
          : `${dia} (dia de ${planeta})`
      );
    }
  }
  return partes.join(' · ');
}

// A função que a tela chama. Devolve o que bate com AGORA.
//
// NUNCA FABRICA, mesma disciplina de guiaDoDia em lib/grounding.js: sem
// astronomy-engine, `getMoonPhase` devolve null e este módulo NÃO chuta uma
// fase plausível. Nesse caso `ceuDisponivel` vem false, `faseLua` vem null, e
// só entram os rituais que dependem exclusivamente do dia da semana — porque
// dia da semana é aritmética de calendário e continua verdadeiro sem efeméride
// nenhuma. Ritual que pede fase da Lua some da lista, e a tela pode dizer por
// quê em vez de mostrar sugestão inventada.
export function rituaisDeHoje(agora = new Date(), lang, t) {
  const quando = agora instanceof Date ? agora : new Date(agora);
  const valido = !Number.isNaN(quando.getTime());
  const base = valido ? quando : new Date();

  const fase = getMoonPhase(base);
  const faseLua = fase ? fase.name : null;
  const diaSemana = base.getDay();
  const dia = diaSemanaPorIndice(diaSemana);

  const rituais = rituaisPara({ faseLua, diaSemana }, lang, t);
  const idsExatos = new Set(rituais.map((r) => r.id));

  // Parciais: bateu a fase mas não o dia, ou o dia mas não a fase. Servem de
  // segunda prateleira e vão SEMPRE com o motivo escrito, pra tela poder dizer
  // "bate a fase, não bate o dia" em vez de misturar com os exatos.
  const parciais = RITUAIS.filter((r) => {
    if (idsExatos.has(r.id)) return false;
    const fases = (r.momento && r.momento.fasesLua) || [];
    const dias = (r.momento && r.momento.diasSemana) || [];
    const bateFase = !!(faseLua && fases.includes(faseLua));
    const bateDia = dias.includes(diaSemana);
    return bateFase || bateDia;
  }).map((r) => ({
    ...localizarRitual(r, lang),
    motivo: motivoDoEncaixe(r, faseLua, diaSemana, lang, t),
  }));

  return {
    data: base,
    diaSemana,
    diaNome: dia ? dia.nome : null,
    planetaDoDia: dia ? dia.planeta : null,
    ceuDisponivel: !!fase,
    faseLua,
    emojiLua: fase ? fase.emoji : null,
    rituais,
    parciais,
  };
}

// ---------------------------------------------------------------------------
// 9. O TEXTO DE COMPARTILHAR (botão de WhatsApp)
// ---------------------------------------------------------------------------
// Curto, sem promessa, com o aviso ético literal e terminando no link. O que
// ele NÃO tem é tão importante quanto o que tem: nada de "faça este ritual e
// veja o que acontece", nada de emoji de dinheiro, nada de urgência. Quem
// recebe no grupo da família tem que conseguir ler sem que pareça corrente.
//
// `t` É OPCIONAL E FOI ACRESCENTADO DEPOIS, por um motivo que valia o conserto:
// este é o ÚNICO artefato destas telas que sai do app e circula em público, e
// ele saía 100% em português para quem usa o app em inglês ou espanhol — com o
// nome da marca junto. Que foi esquecimento e não decisão dá pra provar dentro
// do próprio dicionário: 'rituais.share.failed', a mensagem de ERRO do
// compartilhamento, já estava traduzida nos três idiomas; o CONTEÚDO
// compartilhado, não.
//
// As duas linhas de MOLDURA saem de chave; o miolo (título do ritual) continua
// vindo do motor até a segunda parcela da migração. LINK_COMPARTILHAR fica como
// está — é URL, não texto.
// `lang` fecha o que faltava no conserto descrito acima: com ele, o TÍTULO sai
// do pack e o aviso ético sai traduzido — o texto inteiro circula no idioma de
// quem compartilha. LINK_COMPARTILHAR continua literal nos três idiomas: é
// URL, não texto. Sem `lang` (e sem `t`), a saída é byte a byte a de sempre.
export function textoCompartilhavel(ritual, t, lang) {
  const base = typeof ritual === 'string' ? ritualPorId(ritual) : ritual;
  if (!base) return '';
  // Idempotente de propósito: se a tela já passou um ritual localizado, vestir
  // de novo pelo id devolve os mesmos campos.
  const r = localizarRitual(base, lang);
  const categoria = nomeDaCategoria(r.categoria, t);
  const momento = resumoDoMomento(r, t);
  const linha1 = t
    ? t('rituais.share.line1', { titulo: r.titulo, categoria })
    : `${r.titulo} — ritual de ${categoria}, do Cosmic Guide.`;
  const linha2 = t ? t('rituais.share.line2', { momento }) : `Momento ideal: ${momento}.`;
  const linhas = [linha1, linha2, avisoEtico(lang), LINK_COMPARTILHAR];
  return linhas.join('\n');
}

// ---------------------------------------------------------------------------
// 10. VARREDURA — a lista de tudo que a pessoa vê
// ---------------------------------------------------------------------------
// Existe para o teste não depender de uma lista de campos escrita à mão: campo
// novo em um ritual entra automaticamente na varredura de alegação de saúde e
// de promessa. O teste também percorre o objeto por conta própria; esta função
// é o atalho para quem quiser auditar de fora (ou para uma tela de revisão).
export function textosVisiveis(ritual) {
  const r = typeof ritual === 'string' ? ritualPorId(ritual) : ritual;
  if (!r) return [];
  const fora = new Set(['id', 'categoria', 'fontes']);
  const saida = [];
  const anda = (valor, chave) => {
    if (fora.has(chave)) return;
    if (typeof valor === 'string') saida.push(valor);
    else if (Array.isArray(valor)) valor.forEach((v) => anda(v, chave));
    else if (valor && typeof valor === 'object') {
      for (const [k, v] of Object.entries(valor)) anda(v, k);
    }
  };
  anda(r, null);
  saida.push(textoCompartilhavel(r));
  saida.push(resumoDoMomento(r));
  return saida.filter((s) => s && s.trim().length > 0);
}

// ---------------------------------------------------------------------------
// 11. QUAL RITUAL GASTOU O USO GRÁTIS
// ---------------------------------------------------------------------------
// Isto morava dentro de screens/RituaisScreen.js, com import estático de
// AsyncStorage e um setItem fire-and-forget. Duas consequências práticas, e a
// segunda é a que doía:
//
//   1. era a ÚNICA regra de negócio que decide se o paywall de Rituais abre, e
//      ficava fora do alcance do node:test — as 969 linhas de
//      test/rituais.test.js não mencionavam a chave uma vez sequer, e não
//      tinham como: a tela não é importável sob node:test (react-native).
//   2. a tela já mudava o estado de forma otimista enquanto o setItem seguia
//      sozinho com `.catch(() => {})`. Storage que falha fazia a pessoa reabrir
//      o app com OUTRO ritual grátis.
//
// Aqui vira o mesmo desenho da Jornada: helper de storage compartilhado
// (lib/storage.js), que já trata o throw e cai pra memória de sessão em vez de
// perder a marca em silêncio. `marcarRitualLivre` devolve se foi ao disco, pra
// quem chamar poder decidir o que fazer — a tela não precisa, mas o teste sim.
export const CHAVE_RITUAL_LIVRE = 'cosmic-ritual-livre';

export async function lerRitualLivre() {
  const bruto = await getItemSeguro(CHAVE_RITUAL_LIVRE);
  if (!bruto) return null;
  // Id que não existe mais no catálogo (ritual removido entre versões) vira
  // null: melhor a pessoa reganhar o uso grátis do que a tela guardar um
  // ponteiro morto e trancar tudo.
  return ritualPorId(bruto) ? bruto : null;
}

export async function marcarRitualLivre(id) {
  if (!ritualPorId(id)) return false;
  return setItemSeguro(CHAVE_RITUAL_LIVRE, id);
}
