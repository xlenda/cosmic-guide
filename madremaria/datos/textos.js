// datos/textos.js
// TODA a copy do Fio Vermelho em um dicionario plano. TRES idiomas (pt/es/en),
// no mesmo molde de lib/i18n.js do Cosmic: um objeto por idioma, um mapa DICTS,
// e uma funcao que cai no PT quando falta traducao.
//
// ===========================================================================
// ONDE MORA CADA IDIOMA, E POR QUE SEPARADO
// ===========================================================================
// O PT mora NESTE arquivo (o objeto PT logo abaixo). Ele e a fonte de verdade
// e a coisa que os testes de doutrina varrem como TEXTO-FONTE — dois deles
// (test/madremaria-sinastria.js e test/madremaria-escada-do-degelo.test.js)
// abrem este arquivo com readFileSync e casam regex contra a copy crua. Mover
// o PT para um arquivo vizinho cegaria exatamente os portoes que guardam a
// doutrina. Ele fica.
//
// ES e EN moram em arquivos proprios, vizinhos e VAZIOS hoje:
//     datos/textos.es.js   ->  export const ES = { ... }
//     datos/textos.en.js   ->  export const EN = { ... }
// Um arquivo por idioma porque dois tradutores trabalham em paralelo: cada um
// edita o seu e nunca ha conflito de merge entre eles, nem com quem mexe no PT.
//
// ===========================================================================
// O IDIOMA ATIVO VEM DO COSMIC, NAO DAQUI
// ===========================================================================
// Quem decide e context/LanguageContext.js do Cosmic (chave 'app-language').
// Este arquivo nao le AsyncStorage, nao importa React e nao detecta locale —
// ele nao pode: metade de madremaria/lib/* e exercitada em node:test puro, sem
// React e sem AsyncStorage.
//
// A ponte e a MESMA que o Cosmic ja usa para lib/aiClient.js: o provider chama
// setIdiomaMadre(lang) e este modulo guarda o idioma num espelho de modulo.
// t() le esse espelho na hora da chamada. Ver o bloco REDESENHO mais abaixo.
//
// FALLBACK, em ordem, e sem nunca lancar:
//   1. o valor no idioma ativo;
//   2. o valor em PT (traducao que falta NAO deixa a tela em branco e NAO
//      inventa texto: mostra o portugues, que e verdadeiro);
//   3. a propria chave (chave morta: bug visivel em QA, nunca tela branca).
//
// ===========================================================================
// POR QUE PLANO, E POR QUE UM IDIOMA SO
// ===========================================================================
// Chave pontuada ('tirada.rotulo.nudo'), valor string. Nao ha objeto aninhado:
// aninhar convida a `T.tirada.rotulo.nudo` espalhado pelas telas, e uma chave
// removida vira crash em runtime la no meio de um render. Aqui a busca e uma
// leitura de propriedade simples e o pior caso e a chave crua aparecendo na
// tela — bug visivel em QA, nao tela branca no telefone de quem pagou.
//
// O segundo e o terceiro idioma nasceram do jeito que este cabecalho previa:
// MESMAS chaves, arquivo proprio, e um seletor que ja existia (o do Cosmic).
// Nenhum andaime novo: DICTS tem tres entradas e t() tem um `??` a mais.
//
// ===========================================================================
// CONTRATO DE COPY (o mesmo de theme.js — aqui ele e o proprio conteudo)
// 1. Nunca prometer desfecho: nenhum texto diz o que a outra pessoa fara.
//    A lista literal de verbos proibidos esta em test/copy-promessa-app-inteiro.test.js, que e quem
//    aborta o deploy. Todo texto descreve o que a carta mostra e termina em uma
//    acao da USUARIA.
// 2. Zero prova social inventada: sem porcentagem de usuarias, sem contador de
//    gente, sem depoimento. O lugar dessa linha e do FATO HISTORICO VERIFICAVEL,
//    com obra, autor e ano — ver o bloco `hecho.*`.
// 3. Nenhuma alegacao de saude: o app nao trata e nao resolve sintoma.
// 4. O genero de quem esta do outro lado nunca e assumido: "essa pessoa",
//    "quem esta do outro lado".
// 5. A terceira posicao (A SUA PONTA) fala so da usuaria e nunca do futuro.
// 6. Racha que quebra nao pune: sem perda anunciada, sem chama apagada, sem
//    oferta de recuperacao paga. Ver `hilo.rachaRota`.
// 7. Portugues do Brasil, tratamento por VOCE. Nunca "tu", nunca "senhora", nunca apelido.
// 8. Nenhum hex aqui: cor sai de theme.js. Este arquivo so tem palavra.
// ===========================================================================

import { SUPPORT_EMAIL } from '../../lib/supportContact.js';

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * PT — o dicionario portugues, e a FONTE DE VERDADE das chaves. Chave pontuada ->
 * string (ou array de strings, quando o texto e uma lista fechada que a tela
 * renderiza em ordem: `limites.lineas`, `privacidad.guarda.lineas`,
 * `privacidad.no.lineas`, `ritual.meses`, `plano.semana.nomes`, `plano.semana.em`,
 * `metodo.respuestas.si.lineas` e `metodo.respuestas.no.lineas` — OITO chaves, e
 * elas continuam array nos TRES idiomas; o portao de cobertura exige isso).
 *
 * ES e EN estao em datos/textos.es.js e datos/textos.en.js. O portao de cobertura
 * (test/madremaria-i18n.test.js) compara chave por chave contra ESTE objeto.
 * ================================================================================= */
export const PT = congelar({
  /* --- APP ---------------------------------------------------------------------- */
  'app.nombre': 'Madre Maria',
  'app.tagline': 'Três cartas para a história que ficou pela metade',

  /* --- ONBOARDING ----------------------------------------------------------------
   * As perguntas em si vivem em datos/preguntas.js (texto e microcopy de cada campo
   * ficam junto do campo). Aqui fica so o cromo da tela. */
  'onboarding.progreso': '{n} de {total}',
  'onboarding.errorNombre': 'Escreva pelo menos uma letra para seguir.',
  /* A UNICA mensagem de erro de campo do onboarding, e a excecao esta explicada
   * em screens/OnboardingScreen.js: uma data pode estar errada de um jeito que
   * a usuaria nao enxerga, e botao apagado nao explica 31 de fevereiro. */
  'onboarding.errorFecha':
    'Confira o dia, o mês e o ano: essa data não existe no calendário — ou ainda não chegou.',
  /* MUDOU EM 01/09, junto com as perguntas 6 e 7. A frase antiga dizia que o app
   * "não pergunta a sua idade, o seu signo, a sua data de nascimento" — e ele
   * passou a perguntar a data (e a tirar signo e idade dela). O que sobrou aqui
   * e o que continua verdadeiro E continua sendo o argumento: a lista do que se
   * pede e curta, cabe numa linha, e nada dela e sobre a outra pessoa. */
  'onboarding.datosNo':
    'A gente pergunta o seu nome, o que aconteceu, a sua data de nascimento e como falar com você. Mais nada: nada sobre a outra pessoa, nenhuma localização, nenhum contato da sua agenda. O que a leitura não usa, não se pede.',
  'onboarding.privacidad':
    'Tudo fica neste telefone. Não há conta, não há e-mail, não há servidor.',
  'onboarding.listo': 'Pronto. As suas três cartas já estão sobre a mesa.',

  /* --- TIRADA --------------------------------------------------------------------
   * Tres posicoes fixas. O rotulo e a sub sao um par: o rotulo nomeia, a sub diz em
   * uma linha o que aquela posicao esta olhando. */
  'tirada.titulo': 'A sua tiragem de hoje',
  'tirada.sobreceja': 'TRÊS CARTAS',
  'tirada.instruccion': 'Raspe as três. Uma de cada vez, sem pressa.',
  'tirada.progreso': '{n} de 3 reveladas',

  'tirada.rotulo.nudo': 'O NÓ',
  'tirada.rotulo.nudo.sub': 'Onde se enredou',
  'tirada.rotulo.tension': 'A TENSÃO',
  'tirada.rotulo.tension.sub': 'O que puxa hoje',
  'tirada.rotulo.extremo': 'A SUA PONTA',
  'tirada.rotulo.extremo.sub': 'A ponta do fio que você segura',

  /* Linha fixa, sempre visivel sob a terceira carta. Nunca condicional, nunca
   * escondida atras de um "ver mas": e ela que impede a leitura de virar promessa. */
  'tirada.avisoOtraPersona':
    'Nenhuma carta lê a outra pessoa. Essa ponta do fio não está neste app.',

  'tirada.carta.derecha': 'Direita',
  'tirada.carta.invertida': 'Invertida',
  'tirada.carta.claves': 'Chaves',
  'tirada.continuar': 'Ver o seu fio de hoje',

  /* --- RASPADINHA (scratch) ------------------------------------------------------
   * `scratch.tap` existe porque raspar com o dedo e um gesto fino: quem tem a mao
   * tremida, luva, tela quebrada ou usa leitor de tela precisa do mesmo resultado em
   * um toque. Nao e um atalho premium nem um botao escondido. */
  'scratch.label': 'Raspe para revelar',
  'scratch.tap': 'Revelar sem raspar',
  'scratch.a11y':
    'Lâmina de metal sobre a carta de {posicion}. Raspe com o dedo, ou ative para revelar a carta inteira.',
  'scratch.revelada': '{carta} revelada. A leitura dela está logo abaixo.',
  'scratch.casi': 'Mais um pouco e ela aparece inteira',

  /* --- LEITURA DE ENTRADA --------------------------------------------------------
   * A tela que vem logo depois das perguntas do inicio: as tres cartas do baralho
   * cigano, com a voz gravada. E o funil do dono virado app — no WhatsApp e o que
   * faz a pessoa ficar —, e por isso a copy daqui tem tres obrigacoes que nenhum
   * outro bloco tem:
   *
   *   1. NUNCA FINGIR UM SORTEIO. tirarTresLenormand() nao sorteia, e isso e
   *      decisao de produto (datos/lenormand.js explica): a voz fala "vossa
   *      PRIMEIRA carta", "a sua SEGUNDA", "a sua TERCEIRA e ultima", e sortear
   *      faria a narracao mentir. Ate 10/09 a tela DIZIA isso em voz alta numa
   *      linha embaixo da grade ('entrada.fixas'); o dono tirou a frase, porque
   *      explicar o proprio mecanismo no meio do momento esfria o momento. A
   *      regra que fica: nenhuma chave deste bloco pode AFIRMAR sorteio, acaso
   *      ou "as suas cartas foram escolhidas para voce". Nao dizer nao e o mesmo
   *      que mentir; inventar um sorteio seria a mentira mais barata do produto
   *      inteiro, e a mais facil de descobrir: duas pessoas lado a lado.
   *   2. NAO REPETIR A PREVISAO DO AUDIO. O audio do Cavaleiro termina em "algo
   *      ira vir em sua direcao". E previsao, o app nao faz previsao e
   *      test/copy-promessa-app-inteiro.test.js aborta o build por isso. Nenhuma chave deste bloco
   *      repete aquela frase, e nenhuma promete desfecho para compensar.
   *   3. DIZER QUE O TEXTO BASTA. Quem esta sem fone le tudo e nao perde nada:
   *      'entrada.audioNota' e a linha que impede o audio de virar conteudo
   *      exclusivo de quem pode ouvir agora.
   *
   * Os rotulos de posicao seguem a VOZ, nao o baralho: primeira, segunda, terceira
   * e ultima — exatamente as palavras que a gravacao usa. */
  'entrada.sobreceja': 'A SUA LEITURA DE ENTRADA',
  'entrada.titulo': 'Três cartas, lidas em voz alta',
  'entrada.saudacao': '{nombre}, as suas três cartas já estão na mesa.',
  'entrada.saudacaoSemNome': 'As suas três cartas já estão na mesa.',
  'entrada.abertura':
    'São três cartas do baralho cigano, uma de cada vez. Você raspa a carta com o dedo, ouve a leitura na voz de quem lê, e o mesmo texto fica escrito logo abaixo.',
  /* O botao da abertura NAO leva mais direto a primeira carta: leva a mesa com
   * os seis versos, onde ela toca em tres. Prometer "a primeira carta" ali seria
   * anunciar uma tela que nao e a proxima — o mesmo defeito que 'entrada.seguir'
   * corrigiu no fechamento. 'entrada.comecar' continua existindo e passou a ser
   * o botao que aparece DEPOIS do terceiro toque, onde ele volta a ser verdade. */
  'entrada.escolha.abrir': 'Ver as cartas na mesa',
  'entrada.comecar': 'Ver a primeira carta',

  /* --- A MESA DOS SEIS VERSOS -----------------------------------------------
   * A tela mostra seis cartas viradas e ela toca em tres. O que a copy pode
   * dizer e exatamente o que acontece: as cartas abrem NA ORDEM EM QUE ELA
   * TOCAR. Nenhuma linha daqui diz que ela escolhe QUAIS cartas saem — porque
   * nao escolhe, e as tres continuam sendo as mesmas para todo mundo.
   *
   * Ate 10/09 havia embaixo da grade uma linha ('entrada.fixas') dizendo que as
   * tres eram as mesmas para todo mundo. O dono tirou: com os seis versos na
   * tela, aquilo entregava o mecanismo justamente no instante que precisa ficar
   * de pe. O que sustenta a honestidade agora e o silencio sobre o assunto —
   * nenhuma linha promete sorteio — e nao uma confissao no meio do gesto.
   *
   * Escrever na tela "a sua escolha e de posicao, nao de carta" seria explicar o
   * truque no meio do momento e nao sobraria momento nenhum; o lugar dessa
   * explicacao e o cabecalho de screens/LeituraDeEntradaScreen.js, para quem
   * mantem o app. O que a usuaria precisa saber — que as tres sao as mesmas para
   * todo mundo — ela le aqui, na cara. */
  'entrada.escolha.titulo': 'Seis cartas viradas',
  'entrada.escolha.texto':
    'Toque em três delas. Elas abrem uma de cada vez, na ordem em que você tocar, e você raspa cada uma com o dedo.',
  'entrada.escolha.contagem': '{n} de {total} tocadas',
  'entrada.escolha.verso': 'Carta virada, {n} de {total}. Toque para levar esta.',
  'entrada.escolha.versoEscolhido':
    'Carta virada, {n} de {total}. Já está com você: foi a sua número {ordem}.',

  'entrada.progresso': 'Carta {n} de {total}',
  'entrada.posicao.1': 'A PRIMEIRA',
  'entrada.posicao.2': 'A SEGUNDA',
  'entrada.posicao.3': 'A TERCEIRA E ÚLTIMA',
  /* --- AS DUAS TIRAGENS (08/09) — sorteio de lib/variante.js ------------------------
   * A carta extra (nas duas) e a estrela (so na B) chegam DEPOIS da "terceira e
   * ultima" das tres: o rotulo delas nao conta, nomeia o papel. Os anuncios sao
   * a transcricao da voz do guia (assets/audio/entrada-anuncio-*.m4a). */
  'entrada.posicao.4': 'A CARTA EXTRA',
  'entrada.posicao.5': 'A CARTA ESTRELA',
  /* A NARRADORA TEM NOME (09/09): Madre Maria. Ela se apresenta UMA vez, na
   * primeira tela do funil (screens/ApresentacaoScreen.js, audio
   * madre-maria-abertura) — antes das perguntas, contando o caminho inteiro. Na
   * abertura das cartas ela volta ("sou eu de novo", audio entrada-apresentacao),
   * nunca se apresenta duas vezes. Os botoes da voz dela levam o nome. Os dois
   * textos sao a transcricao exata dos audios: mudar um e regravar o outro. */
  'apresentacao.sobreceja': 'QUEM VAI LER AS SUAS CARTAS',
  'apresentacao.titulo': 'Madre Maria',
  /* O TEXTO E O QUE ELA DIZ NO VIDEO (assets/video/madre-maria.mp4, 10/09):
   * o roteiro "O telefone virado pra baixo", palavra por palavra. Mudar um e
   * regravar o outro. Os tempos por frase estao em datos/apresentacao-tempos.json. */
  'apresentacao.texto':
    'Você já olhou o telefone hoje. Mais de uma vez. E virou a tela pra baixo pra fingir que não olhou. Eu sou a Madre Maria. Não tem vergonha nisso. Você chegou aqui com uma pessoa no pensamento. Agora eu vou te fazer algumas perguntas. Depois a gente lê as suas cartas. E eu caminho com você pelas treze luas, um ato por dia. Senta aqui comigo?',
  'apresentacao.video.assistir': 'Assistir a Madre Maria',
  'apresentacao.video.pausar': 'Pausar',
  'apresentacao.video.denovo': 'Assistir de novo',
  'apresentacao.video.nota': 'Toque no vídeo para ouvir. O que ela diz está escrito logo abaixo.',
  'apresentacao.botao': 'Vamos começar',
  'entrada.anuncio.ouvir': 'Ouvir a Madre Maria',
  'entrada.apresentacao':
    'Sou eu de novo, a Madre Maria. Agora é a vez das suas cartas. Uma de cada vez, sem pressa. Eu leio cada uma pra você.',
  'entrada.extra.anuncio':
    'Espera, ainda não acabou. Olha a mesa de novo. Ainda tem carta fechada aí. Antes de eu aprofundar, raspa mais uma. Sem pressa. Essa eu deixei ali de propósito.',
  'entrada.estrela.anuncio':
    'Essa agora eu virei por você: a Estrela. As outras falaram do que está entre você e essa pessoa. Essa fala do seu próximo passo. Não do passo dessa pessoa. Do seu.',
  'entrada.presenca.titulo': 'Está aqui comigo?',
  'entrada.presenca.texto':
    'Agora eu vou aprofundar. Isso não é pra ouvir de passagem. Deixa o resto de lado um minuto. Você está aqui comigo?',
  'entrada.presenca.botao': 'Estou aqui — abrir a leitura profunda',
  'entrada.fim.cartas':
    'Essas cartas são a porta. Daqui para a frente não sai carta nenhuma — o app cruza o que você já deu: o seu signo, que ele calculou da sua data, a sua idade e as cinco respostas. É desse cruzamento que sai o plano do ano, e cada linha dele mostra de quais das suas respostas foi feita.',
  'entrada.instrucao': 'Raspe a carta com o dedo para ver qual é.',
  'entrada.audioNota':
    'O áudio não começa sozinho: toque quando quiser ouvir. O texto abaixo diz o mesmo por escrito — sem fone, você não perde nada.',
  'entrada.convite.rotulo': 'O QUE FICA COM VOCÊ',
  /* A alternativa do filtro duro. Escrita no molde das de lib/lectura.js e pelo
   * mesmo motivo: quando a resposta P4 e 'cero-contacto' ou 'le-escribi-no-responde',
   * um convite que empurre para fora e a pior frase possivel na tela. Nenhuma
   * palavra dela pode casar com PATRONES_CONTACTO — senao a guarda comeria a
   * propria alternativa e a tela ficaria sem convite. */
  'entrada.convite.alternativa':
    'Com o contato do jeito que está hoje, esta carta não pede nenhum passo para fora. O que ela pede se faz deste lado do fio.',
  'entrada.proxima': 'Ver a próxima carta',
  'entrada.fechar': 'Ver o fechamento',
  'entrada.fim.titulo': 'As três já estão lidas',
  /* O FECHAMENTO DAS TRES CARTAS — e a frase que estava FALSA aqui (01/09).
   *
   * Ela dizia: "Daqui para a frente a leitura é outra — sai do baralho de 78
   * cartas, uma tirada por dia, e essa sim é embaralhada na hora". Isso nao
   * descrevia o que vem depois. O que vem depois desta tela e o PLANO, e o plano
   * nao tira carta nenhuma: ele cruza o que ela ja deu — o signo (calculado da
   * data, nunca perguntado), a idade da mesma data e as cinco respostas — em
   * lib/diagnostico.js, com a conta de cada linha a vista.
   *
   * Era o pior tipo de copy falsa: a que promete um mecanismo MAIOR do que o
   * real. Quem chegasse no dia seguinte procurando a tiragem diaria prometida
   * aqui descobriria sozinha que o paragrafo mais importante do funil tinha sido
   * escrito no chute — e essa descoberta contamina tudo o que o app diz depois,
   * inclusive o que e verdade.
   *
   * A frase nova nao troca uma promessa por outra: ela nomeia os dados que o app
   * TEM e diz o que faz com eles. A prova de que nao e conversa esta na tela do
   * plano, onde cada linha do cruzamento aparece com a propria conta. */
  'entrada.fim.texto':
    'Estas três são a porta: o afeto que existe, o que está encoberto e o que depende de você mover. Daqui para a frente não sai carta nenhuma — o app cruza o que você já deu: o seu signo, que ele calculou da sua data, a sua idade e as cinco respostas. É desse cruzamento que sai o plano do ano, e cada linha dele mostra de quais das suas respostas foi feita.',
  'entrada.fim.ano':
    'O app conta o tempo em treze lunações. Uma de cada vez, sem cobrança de dia perdido.',
  'entrada.entrar': 'Entrar no app',
  /* O fechamento das tres cartas NAO entra mais direto no app: ele abre a
   * leitura profunda (screens/LeituraProfundaScreen.js), que e o passo 3 do
   * funil. O rotulo diz para onde vai de verdade — "Entrar no app" ali seria a
   * promessa de uma tela que nao e a proxima. Quem reabriu a leitura pelo Perfil
   * continua vendo 'entrada.entrar', porque naquele caminho a saida e voltar. */
  'entrada.seguir': 'Ouvir a leitura profunda',

  /* --- REOUVIR AS TRES CARTAS -----------------------------------------------
   * A leitura de entrada acontece UMA VEZ na vida: com ela feita, a tela dos
   * seis versos nao volta por caminho nenhum (screens/LeituraDeEntradaScreen.js
   * explica por que as duas coisas andam juntas). Mas as pessoas VOLTAM nos
   * audios — e o que segura a lead no WhatsApp —, entao o Perfil continua tendo
   * a porta: ela leva a screens/ReouvirTresCartasScreen.js, que e leitura pura,
   * sem escolha e sem raspagem.
   *
   * O texto diz na cara que nada foi sorteado de novo. Uma tela de reouvir que
   * encenasse uma segunda tiragem seria a prova, para a propria usuaria, de que
   * a primeira tambem era encenacao. */
  /* Sem contar as cartas (08/09): a tiragem A tem quatro e a B cinco, e o
   * reouvir mostra a dela inteira. */
  'entrada.reouvir.titulo': 'A leitura da Madre Maria, de novo',
  'entrada.reouvir.texto':
    'São as mesmas da sua leitura de entrada, com o mesmo áudio e o mesmo texto. Nada foi tirado outra vez: esta leitura acontece uma vez só, e ela já aconteceu.',

  /* --- LEITURA PROFUNDA -----------------------------------------------------------
   * O carrossel de cinco audios que vem logo depois das tres cartas: 6,7 minutos
   * na mesma voz. O CONTEUDO (titulo e texto de cada bloco) mora em
   * datos/profunda.js, palavra por palavra igual ao que a voz diz — aqui ficam
   * so os rotulos da tela.
   *
   * Duas obrigacoes de copy deste bloco:
   *
   *   1. DIZER QUE LER BASTA. 'profunda.audioNota' e a mesma promessa de
   *      'entrada.audioNota', e ela e o que impede a voz de virar conteudo
   *      exclusivo de quem tem fone agora. Metade das pessoas abre isto no
   *      onibus.
   *   2. NAO PUNIR QUEM PULA. Sao 6,7 minutos entre a leitura e a primeira tela
   *      do produto, e e ali que mais gente sai. 'profunda.pular' e um convite
   *      neutro: nada de "tem certeza?", nada de perda anunciada. A leitura
   *      continua na lista do Perfil, e quem pulou volta quando quiser. */
  'profunda.sobreceja': 'A SUA LEITURA PROFUNDA',
  'profunda.posicao': '{n} de {total}',
  'profunda.audioNota':
    'O áudio não começa sozinho: toque quando quiser ouvir. O texto abaixo é o mesmo que a voz diz, palavra por palavra — sem fone, você não perde nada.',
  /* O rotulo do botao de ouvir DESTA tela. O padrao de components/BotaoOuvir.js
   * e 'audio.ouvir' ("Ouvir a carta"), que e verdade nas tres cartas da leitura
   * de entrada e mentira aqui: no carrossel nao ha carta nenhuma, ha uma parte
   * da leitura. Botao que nomeia errado o que faz e a primeira trinca de
   * confianca numa tela que pede 6,7 minutos. */
  'profunda.ouvir': 'Ouvir esta parte',
  'profunda.pausar': 'Pausar',
  'profunda.proximo': 'Ver a próxima parte',
  /* A frase do fim do áudio 11, na letra: a voz termina em "a sua primeira lua
   * começa agora", e o botão repete exatamente isso. */
  'profunda.entrar': 'A sua primeira lua começa agora',
  'profunda.pular': 'Pular e entrar no app',

  /* --- A LUA MEDIDA ---------------------------------------------------------------
   * A ÚNICA urgência que este produto aceita, e a razão é dura: prazo inventado é
   * o que o dossiê mediu derrubando concorrente (contador de "suas histórias
   * expiram em 2:56:53" e média real de 3,3 nas resenhas escritas). Aqui a pressa
   * não é fabricada — ela está no céu, tem dia e hora, e qualquer calendário do
   * mundo confere.
   *
   * QUEM ESCREVE ESTAS DUAS LINHAS é lib/proximaLua.js, e ele só as escreve
   * quando a efeméride foi medida. Sem medida, a linha NÃO RENDERIZA: não existe
   * "por volta de", não existe hoje + 29,53 dias. Uma data de lua errada por um
   * dia é conferível em cinco segundos e derruba junto tudo o que o app diz sobre
   * medir em vez de inventar.
   *
   * 'lua.nota' é consequência, não ameaça: ela diz qual lunação será a primeira
   * dela, e as duas respostas possíveis são igualmente boas. Nada aqui pune quem
   * entra depois — a lua seguinte é uma lua inteira, não um castigo. */
  'lua.sobreceja': 'A PRÓXIMA LUA NOVA',
  'lua.quando': '{diaSemana}, {dia} de {mes}, às {hora}.',
  'lua.nota':
    'Se você entrar antes dela, essa lua nova é a sua. Se entrar depois, a sua é a seguinte — e a seguinte é daqui a vinte e nove dias e meio. Isso não é regra nossa: é a lua.',

  /* --- SORPRESA ------------------------------------------------------------------
   * O momento gratuito do app: uma carta extra que ninguem pediu. `sorpresa.pie` e a
   * linha honesta que sustenta a surpresa — nao ha magia nem sorte, ha um baralho
   * embaralhado com a data de hoje. Deterministico e verificavel. */
  'sorpresa.titulo': 'Espere. Saiu uma carta para você.',
  'sorpresa.pie':
    'Ninguém escolheu por você, nem nós. O baralho foi embaralhado com a data de hoje: a cada dia sai outra.',

  /* --- HECHO ---------------------------------------------------------------------
   * Este bloco e o substituto do "92% de los usuarios" do molde. No lugar de prova
   * social inventada entra um fato historico verificavel — obra, autor e ano —
   * renderizado com o estilo tipo.fuente de theme.js.
   * Os fatos em si moram em datos/hechos.js, no formato que test/madremaria-contenido.test.js
   * ja cobra: HECHOS['major-00'] = { anios, titular, cuerpo, fuente }, com a fonte
   * carregando obra, autor e ano de 4 digitos. Aqui fica so o enquadre. */
  'hecho.sobreceja': 'DADO VERIFICÁVEL',
  'hecho.antiguedad': 'Há {anios} anos',
  'hecho.fuenteFormato': 'Fonte: {fuente}',
  'hecho.pie':
    'Você pode conferir por conta própria: a obra, o autor e o ano estão aí em cima. Aqui nunca há porcentagem de usuárias nem frase de gente que não existe.',

  /* --- LIMITES -------------------------------------------------------------------
   * Aparece na sintese, antes do resultado e nao depois. Tres linhas, exatamente as
   * tres coisas que a usuaria mais quer e que uma carta nao entrega. Dizer isso na
   * cara e o que da valor ao que vem em seguida. */
  'limites.titulo': 'O que esta leitura NÃO pode te dizer',
  'limites.lineas': [
    'Se essa pessoa reaparece ou não. Isso não está escrito em carta nenhuma.',
    'O que está sentindo quem está do outro lado. Essa ponta do fio não está neste app.',
    'Quando. O tarô não marca data, e quem te der uma está inventando.',
  ],
  'limites.pie':
    'Nada disso é falha do app. É o limite honesto de uma leitura simbólica, e por isso está escrito antes do seu resultado e não depois.',

  /* --- SINTESIS ------------------------------------------------------------------
   * A tela de maior carga emocional: e aqui que o nome pedido na P1 volta.
   * Tres blocos, nesta ordem: o que as cartas mostram, a parte que e dela, e uma
   * acao para hoje. A acao NUNCA depende da outra pessoa. */
  'sintesis.titulo': 'O seu fio, hoje',
  'sintesis.saludo': '{nombre}, isto é o que ficou sobre a mesa.',
  'sintesis.bloque.lectura': 'O QUE AS TRÊS CARTAS MOSTRAM',
  'sintesis.bloque.tuparte': 'A PARTE QUE VOCÊ SEGURA',
  'sintesis.bloque.accion': 'UMA AÇÃO PARA HOJE',
  'sintesis.accionNota':
    'Esta ação é sua e se completa sozinha: não precisa que mais ninguém faça nada.',
  'sintesis.metodo':
    'Esta é uma leitura simbólica. As cartas não sabem nada da sua história: o que elas fazem é te dar três imagens fixas — o nó, a tensão e a sua ponta — para você olhar o que é seu de fora e com outras palavras. O que você leu descreve o que cada carta mostra e termina em algo que você pode fazer. Não é previsão, não fala por mais ninguém e não decide nada por você.',
  'sintesis.cierre':
    'Até aqui vai a leitura, {nombre}. O que vem depois acontece fora do app.',
  'sintesis.guardada': 'Guardada em Meu Fio',

  /* --- HILO (la racha) -----------------------------------------------------------
   * Um nudo por dia em que ela veio ler. Quando o dia passa em branco, o app nao
   * pune: nao anuncia perda, nao apaga chama nenhuma e nao vende recuperacao.
   * O fio nao arrebenta, so fica parado — e o recorde fica onde estava, porque foi
   * conquistado de verdade. */
  // --- audio da carta (components/BotaoOuvir.js) -----------------------------
  // Sem arquivo de audio o botao nao renderiza, entao estas duas chaves so
  // aparecem quando existe voz de verdade para aquela carta.
  /* A VELOCIDADE DA VOZ (11/09). O fecho da leitura profunda tem 4:33; quem le
   * rapido quer acelerar em vez de ouvir tudo no ritmo da fala. O rotulo E o
   * estado: o botao mostra a velocidade atual e cicla ao ser tocado. */
  'audio.velocidade.1': '1x',
  'audio.velocidade.1.5': '1,5x',
  'audio.velocidade.2': '2x',
  'audio.velocidade.rotulo': 'Velocidade da voz: {valor}',
  'audio.velocidade.ajuda': 'Toque para trocar entre 1x, 1,5x e 2x.',
  'audio.ouvir': 'Ouvir a carta',
  'audio.pausar': 'Pausar',

  'hilo.titulo': 'Meu Fio',
  'hilo.sub': 'Um nó para cada dia em que você veio ler.',
  'hilo.unidad': 'nós',
  'hilo.conteo': '{n} {unidad}',
  'hilo.hoyListo': 'O nó de hoje já está feito.',
  'hilo.vacio': 'Ainda não há nós. O primeiro se faz com a leitura de hoje.',
  'hilo.rachaRota': 'O fio não se rompeu. Ficou parado.',
  'hilo.record': 'Seu fio mais longo continua sendo {n}. Isso não se apaga.',
  'hilo.retomar': 'Retomar de onde parou',

  /* --- HILO / O PAINEL -----------------------------------------------------------
   * ESCRITO EM PORTUGUES DE PROPOSITO, como os blocos novos abaixo.
   *
   * A tela do fio deixou de ser so o contador e virou o painel do progresso: as
   * tres de hoje, o album em miniatura, as fichas e o dia do ritual. Estas
   * chaves sao SO o que nao existia em nenhum outro bloco — o resto a tela
   * reaproveita de `missoes.*`, `album.*` e `ritual.*`, para que a mesma coisa
   * nunca tenha duas redacoes que divergem no primeiro ajuste.
   *
   * AS TRES REGRAS DESTE BLOCO:
   *   1. Nenhuma linha aqui mede o buraco. Nao existe "faltam N cartas", nao
   *      existe porcentagem e nao existe barra: `album.conteo` conta o que ja
   *      esta la. Album vazio nao vira "0 de 78" — vira convite
   *      (`hilo.panel.albumVazio`), pelo mesmo motivo que a tela nunca imprime
   *      "0 nudos".
   *   2. Nenhuma linha cobra dia nenhum. O ritual aparece pelo que ja foi
   *      fechado; o dia que ainda nao abriu usa `ritual.hecho.proximo`, que
   *      informa e nao cobra.
   *   3. A ficha nunca e o portao da leitura de hoje. `hilo.panel.fichasPara`
   *      diz na mesma frase que a leitura do dia continua de graca — e este
   *      bloco inteiro so aparece com FICHAS_ACTIVAS ligado e saldo na mao. */
  'hilo.panel.albumVazio': 'O álbum começa na sua primeira leitura.',
  'hilo.panel.albumVer': 'Abrir o álbum',
  'hilo.panel.ritualTitulo': 'O ritual de sete dias',
  'hilo.panel.ritualProgresso': '{n} de {total} dias fechados.',
  'hilo.panel.ritualAbrir': 'Abrir o ritual',
  'hilo.panel.fichasTitulo': 'Suas fichas',
  'hilo.panel.fichasSaldo': '{n} {unidade}',
  'hilo.panel.fichasPara':
    'Elas abrem mais uma leitura no mesmo dia, por {preco}.',

  /* --- MISSOES (as tres de hoje) -------------------------------------------------
   * ESCRITO EM PORTUGUES DE PROPOSITO, mesma decisao do bloco RITUAL abaixo:
   * conteudo novo ja nasce na lingua de destino.
   *
   * O motor esta em lib/missoes.js e a lista de chaves daqui vive la, em
   * CLAVES_TEXTO_MISSOES — e por ela que o teste varre `existe(clave)` e passa
   * `sugiereContacto()` de lib/lectura.js em cima de toda a copy de missao.
   *
   * AS DUAS REGRAS DURAS, e elas moram no TEXTO antes de morarem no codigo:
   *   1. Nenhuma missao pede contato com quem esta do outro lado. Nenhuma delas
   *      depende de outra pessoa responder — missao que depende de terceiro pode
   *      falhar, e missao que falha vira culpa.
   *   2. Nenhuma missao cobra constancia. Nao existe "nao perca hoje", nao existe
   *      "voce faltou ontem", nao existe sequencia de missoes. O titulo CONVIDA e
   *      a pista diz o que fecha a missao — nada mais. A ausencia dessas chaves e
   *      a implementacao da regra: quem for escrever essa frase um dia vai ter de
   *      escreve-la aqui, onde este comentario esta.
   *
   * Nao ha chave de premio porque nao ha premio: sem moeda, sem loja, sem bonus
   * por fechar as tres. `missoes.todasFeitas` e constatacao, nao recompensa. */
  'missoes.titulo': 'As três de hoje',
  'missoes.sub': 'A data escolhe as três. No dia seguinte, são outras.',
  'missoes.progresso': '{n} de {total}',
  'missoes.feita': 'Feita',
  'missoes.todasFeitas': 'As três de hoje estão feitas.',
  'missoes.pie':
    'As três são sobre você e o seu tempo. Nenhuma delas envolve quem está do outro lado.',

  'missoes.leitura-do-dia.titulo': 'Tire as três cartas de hoje',
  'missoes.leitura-do-dia.pista': 'Fecha quando a terceira carta estiver virada. Sem hora marcada.',
  /* A PISTA NÃO PODE NOMEAR O ATALHO COMO ERRO. Ela já disse "Sem o atalho de
   * revelar", e essa frase transformava o botão "revelar sem raspar" — que é o
   * caminho de acessibilidade obrigatório da carta — na maneira errada de abrir.
   * Quem usa TalkBack não tem gesto de raspagem: a frase cobrava dela um dedo
   * que ela não tem. A pista agora diz o que FECHA a missão e cala sobre o
   * resto; o atalho continua ali, sem ser chamado de atalho. Ver a ressalva
   * inteira em lib/missoes.js, na entrada 'raspar-sem-pular'. */
  'missoes.raspar-sem-pular.titulo': 'Raspe as três com o dedo',
  'missoes.raspar-sem-pular.pista': 'Uma de cada vez, no seu tempo. O véu sai onde o dedo passa.',
  'missoes.ler-ate-o-fim.titulo': 'Leia a síntese até a última linha',
  'missoes.ler-ate-o-fim.pista': 'Descer até o fim conta. É onde a leitura termina de verdade.',

  'missoes.resposta-do-ritual.titulo': 'Deixe a sua resposta no dia de hoje do ritual',
  'missoes.resposta-do-ritual.pista': 'Uma linha basta. Fica neste telefone, e é só sua.',
  'missoes.voltar-a-leitura.titulo': 'Volte à leitura de hoje mais tarde',
  'missoes.voltar-a-leitura.pista':
    'Abrir de novo e reler o que ficou na mesa. Ela continua ali o dia inteiro.',
  'missoes.olhar-o-fio.titulo': 'Abra o seu fio e veja o tamanho dele',
  'missoes.olhar-o-fio.pista': 'Só olhar. O fio conta os dias em que você veio, e nada além disso.',
  'missoes.reler-suas-respostas.titulo': 'Releia as suas respostas do início',
  'missoes.reler-suas-respostas.pista': 'Estão no seu perfil, do jeito que você deixou.',

  /* As duas pistas de DESCOBERTA dizem o gesto REAL que fecha a missão. Elas já
   * descreveram um gesto que não existe ("Escolha uma carta e veja", "a caixa
   * dos limites, aberta") — e pista que descreve o que a tela não faz é a
   * versão mais cruel da missão impossível: a pessoa procura o botão, não acha,
   * e conclui que o erro é dela. */
  'missoes.fonte-de-uma-carta.titulo': 'Confira de onde sai uma carta',
  'missoes.fonte-de-uma-carta.pista':
    'A tela do Método nomeia a obra de onde sai cada texto. Abrir e olhar já conta.',
  'missoes.o-que-nao-diz.titulo': 'Leia o que esta leitura não pode dizer',
  'missoes.o-que-nao-diz.pista':
    'A caixa dos limites fica no fim da tela do Método. Descer até lá conta.',
  'missoes.carta-nova-no-album.titulo': 'Encontre uma carta que você ainda não tinha visto',
  'missoes.carta-nova-no-album.pista':
    'Ela entra no álbum na hora em que aparecer numa leitura de verdade.',

  /* --- RITUAL (los siete dias) ---------------------------------------------------
   * ESCRITO EM PORTUGUES DE PROPOSITO. A copy do app ainda esta em espanhol e sera
   * traduzida em bloco; o conteudo novo ja nasce na lingua de destino em vez de
   * nascer em espanhol para ser traduzido duas semanas depois.
   *
   * O QUE ESTE BLOCO PODE E O QUE NAO PODE (a linha que sustenta o produto)
   * O desejo da usuaria e que a pessoa volte. O app nao nega esse desejo e nao
   * finge que ela deveria querer outra coisa. Mas aqui dentro:
   *   · nenhuma linha promete desfecho;
   *   · nenhuma linha diz ou insinua que o ritual age sobre a outra pessoa,
   *     atrai, chama ou aproxima — o gesto e dela e se completa nela;
   *   · nenhuma linha descreve EFEITO no corpo ou na mente. Descreve-se o gesto,
   *     nunca o que ele faz (isso e alegacao de saude e reprova no lint);
   *   · FALTAR UM DIA NAO CUSTA NADA. Nao existe aqui, e nao pode ganhar, chave de
   *     "voce ficou X dias fora", de sequencia perdida ou de recuperacao. Quem
   *     volta depois de sumir encontra o dia que faltava do jeito que estava, e a
   *     tela nao comenta a ausencia. A ausencia de chave e a implementacao da
   *     regra: se um dia alguem escrever essa frase, ela vai ter de nascer aqui,
   *     onde este comentario esta.
   *
   * O dia 7 e o ESPELHO e e a peca mais forte e mais escorregadia do app: ele SO
   * cita, com data, o que ela mesma escreveu. No instante em que o texto comparar
   * ("voce estava assim, agora esta assim") ou concluir ("voce mudou"), virou
   * veredito sobre a vida dela — e por isso `ritual.espejo.pie` diz na cara que o
   * app nao compara e nao conclui.
   *
   * `ritual.meses` e dado de calendario, nao copy de produto: ele existe aqui, e
   * nao dentro da tela, porque a tela nao pode ter string solta e porque no dia da
   * traducao os doze nomes tem de viajar junto com o resto. */
  'ritual.sobreceja': 'DIA {n} DE {total}',
  'ritual.titulo': 'O fio de sete dias',
  'ritual.cargando': 'Um momento.',

  'ritual.carta.rotulo': 'A CARTA DE HOJE',
  /* As duas linhas abaixo entram no LUGAR de uma frase do baralho que as guardas de
   * lib/lectura.js retiraram — a mesma varredura que a tela da leitura aplica, agora
   * tambem sobre a carta do ritual. Elas tem de fazer sentido no meio de um paragrafo
   * e nao podem casar com os proprios padroes que as chamaram.
   *
   * E elas nao podem REPETIR o que retiraram. A primeira dizia "uma parte desta carta
   * pedia procurar alguém": nenhuma palavra proibida (a guarda procura 'procure', nao
   * 'procurar'), e mesmo assim a tela entregava a instrucao que a guarda tinha acabado
   * de tirar — para quem esta com o dedo em cima da conversa, ler que a carta mandava
   * procurar e a propria sugestao, agora com a autoridade do baralho por tras. A linha
   * diz que algo saiu e para que lado apontava; nunca o gesto que estava escrito. */
  'ritual.carta.sinContacto':
    'Uma parte desta carta apontava para fora, e ficou de fora: o dia de hoje se completa em você.',
  'ritual.carta.sinFuturo':
    'Uma parte desta carta falava do que vem depois, e ficou de fora: nenhuma carta lê o que ainda não aconteceu.',
  /* "Amanhã sai outra" era a linha daqui e o portao do ritual reprovou depois que
   * as guardas viraram portugues: 'amanhã' e locucao de futuro pela mesma regra
   * que veta "vai voltar" (a mesma nota que ja estava em 'plano.*'). Antes ela
   * passava por um bug de borda — /\bamanh[ãa]\b/ nao casa "amanhã", porque para
   * o \b do JavaScript o "ã" nao e letra. A regra e a mesma; agora ela e vista. */
  'ritual.carta.nota':
    'Sorteada agora, entre os 22 arcanos maiores. Ninguém escolheu por você, nem nós. A cada dia sai outra.',

  'ritual.pregunta.rotulo': 'A PERGUNTA DE HOJE',
  /* Era 'Escreva aqui, do seu jeito', e o portao do ritual (test/madremaria-ritual.test.js,
   * agora varrendo TAMBEM este bloco) reprovou com razao: `sugiereContacto()` le
   * o imperativo "escreva" como verbo de saida — o mesmo verbo de "escreva pra
   * ela". Aqui ele significava o contrario, mas um portao que aprende excecoes
   * para a copy da casa para de valer para a copy nova. A voz sem imperativo e a
   * dos sete placeholders de datos/ritual.js ("Do jeito que sair"), e ela diz o
   * mesmo sem pedir nada a ninguem. */
  'ritual.campo.placeholder': 'Do jeito que sair, sem arrumar a frase.',
  /* A linha vale para os SETE dias, e por isso ela nao promete o dia 7: so a linha
   * do dia 1 volta no ultimo dia (lib/ritual.js, espejoDelDia1), e escrever isso
   * embaixo do campo do dia 3 seria uma promessa que o app nao cumpre. Quem anuncia
   * o dia 7 e a abertura do dia 1, onde a frase e verdadeira. */
  'ritual.campo.nota':
    'Escrever é opcional. O que você escrever fica neste telefone, com a data, e você relê quando quiser.',

  'ritual.gesto.rotulo': 'O GESTO DE HOJE',
  'ritual.gesto.nota':
    'Cabe em cinco minutos e é seu: se completa sozinho, sem precisar que mais ninguém faça nada.',

  'ritual.cerrar': 'Fechar o dia {n}',

  /* O dia ja fechado hoje. A trava de um passo por dia e o que da valor ao formato
   * — e e tambem o lugar onde é fácil escorregar para o castigo. `ritual.hecho.porque`
   * explica a trava pelo lado do desenho ("é isso que faz caber em cinco minutos"),
   * nunca pelo lado da ameaça: nada de "volte amanhã para não perder". */
  'ritual.hecho.rotulo': 'DIA {n} FECHADO',
  /* Sem "amanhã" pelo mesmo motivo de 'ritual.carta.nota': a linha diz qual e o
   * proximo dia, nao quando ele chega. Data e o que o app nunca marca. */
  'ritual.hecho.proximo': 'O próximo é o dia {n}.',
  'ritual.hecho.porque':
    'É um passo por dia, e é isso que faz caber em cinco minutos. O dia {n} fica aqui esperando, do jeito que está.',
  'ritual.hecho.escrito': 'O QUE VOCÊ ESCREVEU HOJE',
  'ritual.hecho.sinTexto': 'Hoje você não escreveu nada. O nó do dia está dado do mesmo jeito.',

  /* O ESPELHO do dia 7. Tem de funcionar TAMBÉM para quem não escreveu nada no dia 1
   * — senão a melhor cena do produto quebra justamente para quem só tocou nos botões.
   * É para isso que existe `ritual.espejo.sinTexto`, que devolve o dado que existe
   * de verdade: a data. */
  'ritual.espejo.rotulo': 'O QUE VOCÊ ESCREVEU NO DIA {n}',
  'ritual.espejo.fecha': 'Dia {n}, em {fecha}.',
  'ritual.espejo.pie':
    'É o seu texto, com a data em que você escreveu. O app guarda e devolve: não compara os dois dias e não conclui nada sobre você.',
  'ritual.espejo.sinTexto':
    'No dia {n} você não escreveu nada. O que ficou registrado é a data: {fecha}.',

  /* O fim. Sem medalha de estado ("Livre", "Renascida", "Pronta"): a legenda é fato
   * contável — sete dias, sete nós — porque o que se premia é o que ela FEZ, nunca o
   * que ela virou. */
  'ritual.fin.sobreceja': 'SETE DE SETE',
  'ritual.fin.titulo': 'Sete dias, sete nós.',
  'ritual.fin.cuerpo':
    'Chegou ao fim, e o fim estava marcado desde o dia 1. Foram sete dias em que você veio, e cada um deles está com data aqui embaixo.',
  /* ESTA LINHA E A VERDADE SOBRE reiniciarRitual(), e nao um enfeite: lib/ritual.js
   * APAGA a chave inteira ao recomecar (borrarSeguro), entao dizer "nao apaga nada"
   * seria mentira dentro do bloco mais sensivel do app. Se um dia o motor passar a
   * arquivar os sete registros, e esta frase que muda primeiro. */
  'ritual.fin.guardado':
    'Começar de novo abre um dia 1 em branco e apaga estes sete registros deste aparelho. Os nós do seu fio não se apagam.',
  'ritual.fin.reiniciar': 'Começar de novo, no dia 1',

  'ritual.fecha': '{dia} de {mes}',
  'ritual.meses': [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ],

  /* --- BARRA INFERIOR ------------------------------------------------------------
   * As tres zonas de components/BarraInferior.js. Rotulo curto de proposito: a
   * zona tem ~110px e o estilo `sobreceja` sobe tudo para caixa alta — duas
   * palavras e o teto antes de o texto quebrar em duas linhas.
   *
   * O centro (o FAB) NAO tem rotulo visivel: no molde ele e so o mascote dentro do
   * circulo, e escrever embaixo dele mataria o unico elemento que sobe acima da
   * barra. Por isso `barra.plano` existe apenas como nome para o leitor de tela —
   * quem nao ve o icone precisa ouvir para onde o botao leva, e "Hoje" sozinho nao
   * diz nada. A pista completa a frase sem prometer nada sobre o resultado. */
  'barra.hilo': 'Meu Fio',
  /* O centro passou a abrir o PLANO DO DIA. A pista nomeia as tres coisas que a
   * pessoa vai encontrar la, em vez de prometer o que ela vai sentir. */
  'barra.plano': 'O plano de hoje',
  'barra.plano.pista': 'Abre o ritual de hoje, a pergunta do dia e a ação.',
  /* Continuam vivas: a tirada segue sendo uma aba (sem icone na barra) e o nome
   * dela e o que o leitor de tela anuncia quando o plano abre a leitura. */
  'barra.tirada': 'Sua tiragem de hoje',
  'barra.tirada.pista': 'Abre a leitura de hoje.',
  'barra.perfil': 'Perfil',

  /* --- ALBUM (as 78) -------------------------------------------------------------
   * ESCRITO EM PORTUGUES DE PROPOSITO, como o bloco do ritual: conteudo novo ja
   * nasce na lingua de destino.
   *
   * O album e o equivalente honesto da grade de cadeados do molde. Tres regras
   * estao dentro destas linhas:
   *   · nao existe modal de "bloqueado na cara": tocar numa carta que ainda nao
   *     veio abre o CONVITE da leitura de hoje (`album.invite`), nunca um aviso
   *     de que falta pagar ou completar outra coisa;
   *   · nao existe "faltam 12 cartas" nem porcentagem: o texto conta o que ja
   *     esta la ({n} de {total}), porque numero que mede o buraco vira divida;
   *   · `album.legado` diz na cara que a carta ja tinha vindo antes de o album
   *     existir. O app NAO inventa a data daquele encontro. */
  'album.sobreceja': 'O álbum',
  'album.titulo': 'Álbum das 78',
  'album.sub': 'Uma carta entra aqui no dia em que ela vem numa leitura sua.',
  'album.cargando': 'Abrindo o álbum...',
  'album.conteo': '{n} de {total}',
  /* O álbum ainda vazio. Diz o que ABRE as três primeiras casas, nunca o que
   * falta: "faltam 78" seria a dívida que este bloco existe para não escrever. */
  'album.vacio': 'Nenhuma carta entrou ainda. A leitura de hoje abre as três primeiras.',
  'album.oculta': 'Ainda não veio',
  'album.invite': 'Essa ainda não veio até você. A leitura de hoje pode trazer.',
  'album.veces': 'Veio {n} vezes.',
  'album.veces.una': 'Veio uma vez.',
  'album.primera': 'Primeira vez: {dia}.',
  'album.ultima': 'Última vez: {dia}.',
  'album.legado':
    'Essa já tinha vindo antes de o álbum existir. O histórico com data começa no próximo encontro.',
  'album.grupo.completo': 'Grupo completo.',
  'album.grupo.major': 'Arcanos Maiores',
  'album.grupo.paus': 'Paus',
  'album.grupo.copas': 'Copas',
  'album.grupo.espadas': 'Espadas',
  'album.grupo.ouros': 'Ouros',

  /* O CARTAO de uma carta ja encontrada. `album.amor` e so o rotulo: o texto da
   * lente vem do proprio baralho (datos/cartas.json), verbatim, como em toda
   * leitura — reescrever aqui faria a mesma carta dizer uma coisa na tirada e
   * outra no album. */
  'album.amor': 'A lente de amor',
  'album.cerrar': 'Fechar',

  /* O CONVITE de uma carta que ainda nao veio. Nao existe "desbloquear", nao
   * existe cadeado e nao existe nada a comprar: ou ha leitura hoje e o botao
   * abre, ou a de hoje ja foi feita e a tela diz isso na cara, sem botao —
   * adiantar nao e possivel, e botao que nao leva a lugar nenhum e pior que
   * botao nenhum. */
  'album.abrir': 'Abrir a leitura de hoje',
  'album.hoy.hecha': 'A leitura de hoje já foi feita. Amanhã as cartas voltam para a mesa.',

  /* O rodape do album. Fecha a porta que o molde deixa aberta: aqui nao ha outro
   * caminho para abrir uma carta que nao seja uma leitura de verdade. */
  'album.pie':
    'Cada carta entra aqui de um jeito só: aparecendo numa leitura sua. Não há atalho para abrir uma, nem pago nem de graça.',

  /* As chaves das missoes NAO moram aqui: elas sao `missoes.*`, logo acima, e
   * pertencem a lib/missoes.js. Este arquivo chegou a ter um segundo bloco
   * ('misiones.*' / 'mision.*') de um modulo paralelo que foi removido — duas
   * listas de "as tres de hoje" discordando entre si e pior que qualquer uma
   * delas sozinha. As chaves das conquistas sao `conquistas.*`, de
   * lib/conquistas.js, pelo mesmo motivo. */

  /* --- PERFIL --------------------------------------------------------------------
   * A terceira zona da barra: o "avatar". No molde ele e vaidade (nivel, ranking,
   * pontos); aqui ele e uma FICHA — so o que o aparelho realmente mediu e so o que
   * a propria usuaria escreveu.
   *
   * O bloco `perfil.espejo.*` e o unico "espelho" que este app se permite: ele
   * devolve a resposta dela com as palavras dela (as opcoes de datos/preguntas.js),
   * nunca uma interpretacao nossa sobre quem ela e. Por isso `perfil.espejo.pie`
   * esta escrito na cara — e o que separa devolver dado de fingir leitura de perfil.
   *
   * `perfil.hilo.total` diz "Días con lectura" e nao "lecturas": lib/hilo.js conta
   * UM nudo por dia, entao chamar isso de total de leituras seria inflar um numero
   * que o aparelho nao mediu. E `perfil.hilo.nota` fecha a porta do molde: sem
   * nivel, sem ranking, sem pontos. */
  'perfil.sobreceja': 'ESTE TELEFONE',
  'perfil.sinNombre': 'Ainda sem nome',
  'perfil.cargando': 'Um momento.',

  'perfil.espejo.sobreceja': 'O QUE VOCÊ RESPONDEU',
  'perfil.espejo.separador': ' · ',
  'perfil.espejo.vacio': 'Ainda não há respostas guardadas neste telefone.',
  'perfil.espejo.pie':
    'Está com as suas palavras, não com as nossas: é o que você escolheu nas perguntas do início. O app não deduz mais nada sobre você.',

  'perfil.hilo.sobreceja': 'MEU FIO',
  'perfil.hilo.actual': 'Nós agora',
  'perfil.hilo.record': 'Fio mais longo',
  'perfil.hilo.total': 'Dias com leitura',
  'perfil.hilo.nota':
    'Os três números saem deste telefone e de mais nada. Um dia com leitura conta uma vez, mesmo que você abra o app várias vezes. Aqui não há nível, nem ranking, nem pontos.',
  'perfil.hilo.ver': 'Ver Meu Fio completo',

  'perfil.suscripcion.sobreceja': 'ASSINATURA',
  'perfil.suscripcion.activa': 'Ativa neste telefone.',
  'perfil.suscripcion.inactiva': 'Sem assinatura.',
  /* A porta do Perfil para o paywall. Ela nomeia o que a TELA DE DESTINO mostra,
   * e a tela de destino passou a falar do ano em treze luas — um rotulo sobre o
   * tamanho do baralho levaria a uma tela que nao fala de baralho nenhum. */
  'perfil.suscripcion.ver': 'Ver o que se abre nas treze luas',
  'perfil.suscripcion.gestionar': 'Gerenciar',
  'perfil.suscripcion.gestionarNota':
    'Abre a sua conta da loja: é lá que se troca o plano ou se cancela, sem falar com ninguém e sem explicar por quê.',
  /* SEM NOMEAR LOJA (13/09/2026). Estas duas linhas diziam "App Store ou
   * Google Play". Dentro do Cosmic Guide quem cobra e a Hotmart na web e o
   * Play Billing no app nativo — "App Store" nao existe no dicionario do
   * Cosmic. Nomear a plataforma errada numa tela de assinatura manda a pessoa
   * procurar o cancelamento no lugar em que ele nao esta. A redacao nova
   * aponta pra onde a assinatura vive sem cravar um nome que muda por
   * plataforma. */
  'perfil.suscripcion.gestionarError':
    'Não deu para abrir daqui. A sua assinatura fica na conta da plataforma onde você comprou.',
  'perfil.suscripcion.gestionarWeb':
    'A assinatura é administrada onde você comprou, na conta da plataforma de pagamento.',
  'perfil.restaurar.ok': 'Pronto. A sua compra ficou ativa neste telefone.',
  'perfil.restaurar.sinTienda':
    'Ainda não há loja conectada, então não há compra nenhuma para restaurar. Nada do que é seu mudou.',

  'perfil.accesos.sobreceja': 'MAIS',
  /* A leitura de entrada, para reouvir. "As tres cartas" e nao "a sua leitura":
   * o rotulo diz O QUE ela vai encontrar do outro lado, e as cartas sao sempre
   * as mesmas tres (datos/lenormand.js). Nao promete leitura nova — voltar aqui
   * esperando um sorteio e sair com as mesmas tres seria o app quebrando a
   * palavra numa lista de tres palavras. */
  'perfil.acceso.entrada': 'A leitura da Madre Maria',
  /* A LEITURA PROFUNDA, o passo que vem depois das tres cartas. Ela precisa
   * existir nesta lista mais do que qualquer outra linha: existe "Pular" desde o
   * primeiro card do carrossel (sao 6,7 minutos entre a leitura e a primeira
   * tela do produto, e e ali que mais gente sai), e sem esta porta quem pulou
   * ficaria sem nenhuma forma de voltar aos cinco audios.
   *
   * As duas notas abaixo saem de lib/profunda.js e nao inventam nada: a primeira
   * so aparece quando NENHUM audio foi tocado, e a segunda diz onde ela parou.
   * Nenhuma das duas cobra, e nenhuma anuncia perda — quem pulou nao perdeu
   * nada, a leitura esta aqui inteira. */
  'perfil.acceso.profunda': 'A leitura profunda, em cinco partes',
  'perfil.acceso.profunda.naoOuvida': 'Você ainda não ouviu esta',
  'perfil.acceso.profunda.parou': 'Você parou na parte {n} de {total}',
  // Nomeia o formato e o FIM dele: sete dias, nao um habito para sempre. O
  // rotulo nao promete desfecho e nao fala da outra pessoa — so diz que
  // existe, e quanto dura.
  'perfil.acceso.ritual': 'O ritual de sete dias',
  /* Em portugues, como o resto do conteudo novo. E a unica porta do album: tela
   * registrada sem entrada e o mesmo toque morto que uma rota sem tela. */
  'perfil.acceso.album': 'O álbum das 78',
  'perfil.acceso.ajustes': 'Ajustes',
  'perfil.acceso.metodo': 'Como este app decide',
  'perfil.acceso.ayuda': 'Ajuda',
  'perfil.acceso.privacidad': 'Privacidade',
  'perfil.acceso.terminos': 'Termos',

  'perfil.rehacer': 'Refazer as minhas respostas',
  'perfil.rehacer.nota':
    'Você volta às perguntas do início e o seu fio fica como está: refazer não é começar do zero. Os nós que você já deu continuam contados.',

  /* --- PAYWALL -------------------------------------------------------------------
   * Os quatro beneficios sao ENTREGAVEIS: coisas que o app passa a fazer. Nenhum
   * deles e um resultado na vida amorosa dela — isso nao esta a venda aqui e nao
   * esta a venda em lugar nenhum.
   * A linha de saida e tao visivel quanto a de compra: a leitura diaria e gratis e
   * continua gratis, com ou sem assinatura.
   *
   * ===========================================================================
   * A TROCA DE 31/08: A TELA PASSOU A FALAR DO ANO, E TRES LINHAS CAIRAM
   * ===========================================================================
   * O paywall mudou de lugar — ele agora fecha o carrossel da leitura profunda,
   * antes de a pessoa entrar no app (screens/LeituraProfundaScreen.js). O que
   * vem ANTES dele sao 6,7 minutos de voz falando do ano em treze luas; um
   * titulo sobre o tamanho do baralho respondia uma pergunta que ninguem tinha
   * acabado de fazer.
   *
   * As tres linhas que sairam nao sairam por estilo. Elas apontavam para codigo
   * que NAO EXISTE, e docs/PERSUASAO.md chama isso pelo nome ("a divida que
   * volta como reembolso e nota um"):
   *
   *   · 'beneficio.mazo' — "o baralho completo: 78 cartas". lib/mazo.js
   *     `sacarTres()` ja sorteia entre as 78 para todo mundo, assinando ou nao.
   *     Nao ha baralho reduzido para destravar.
   *   · 'beneficio.cinco' — "a tiragem de cinco cartas". Ela nao existe: o
   *     modulo tem `sacarTres` e `sacarMayor`, e mais nada.
   *   · 'beneficio.historial' — "o seu historico completo de cada leitura".
   *     Nao existe tela de historico, e screens/AjustesScreen.js afirma por
   *     escrito, em outra tela do mesmo app, que historico nao e guardado.
   *
   * O QUE FICOU E O QUE ENTROU aponta, cada um, para um arquivo:
   *   · 'beneficio.lunas'     -> lib/ano.js (TEMAS, lunacaoDe) + datos/lunacoes.js
   *   · 'beneficio.espelho'   -> lib/ano.js (devolveVerbatimDe: 1) e o mesmo
   *                              mecanismo em sete dias, ja rodando, em lib/ritual.js
   *   · 'beneficio.gestos'    -> datos/rituais.js + lib/rituaisRotativos.js, com
   *                              as duas telas que ja existem (RitualCafeScreen,
   *                              RitualMaoScreen)
   *   · 'beneficio.sinLimite' -> o UNICO portao de assinatura que roda hoje
   *                              (lib/limiteDiario.js + estaSuscrito(), em
   *                              screens/TiradaScreen.js e screens/AlbumScreen.js).
   *                              Nao apagar sem apagar aqueles dois portoes junto.
   *
   * NAO EXISTE MAIS 'paywall.gratis'. Ela dizia, na mesma altura dos beneficios,
   * o que NAO dependia de pagar — e foi tirada em 01/09 por decisao do dono: o
   * comportamento continua igual (o dia abre sem cobrar), mas anunciar isso
   * dentro do paywall entregava a razao de nao pagar na propria tela de venda.
   * Se um dia voltar, volta AQUI, na mesma altura — nunca no rodape. */
  'paywall.titulo': 'O que vem agora são treze luas.',
  'paywall.sub': 'Isto é o que se abre, e nada além disto:',
  'paywall.beneficio.lunas':
    'As treze luas do ano: treze temas, um por lunação, e cada um abre na lua nova medida no céu — não numa data do calendário.',
  'paywall.beneficio.espelho':
    'O espelho: o que você escrever na primeira lua volta na décima terceira, com a data do dia em que você escreveu, sem uma vírgula mudada.',
  /* O TEXTO DESTE BENEFICIO E A DESCRICAO DO PORTAO, e nao um slogan. Quem nao
   * assina ve no plano o nome do gesto, a frase dele, a duracao e a fonte; o que
   * fica deste lado sao os PASSOS e o botao que abre a tela do gesto (o ramo de
   * `assina` em screens/PlanoScreen.js).
   *
   * NAO NOMEAR OS GESTOS AQUI — decisao do dono, 01/09. "A xicara, a mao, o
   * sonho..." dava de graça, na propria tela de venda, o mapa do que o bloco 10
   * agora so contorna. O paywall vende o plano montado para ELA, nao o catalogo. */
  'paywall.beneficio.gestos':
    'O trabalho de cada dia, montado para você: um gesto com nome e hora certa, escolhido pelo céu daquele dia e pelo que você contou. O gesto do dia você vê de qualquer jeito; o como se faz abre aqui.',
  'paywall.plan.mensual.nombre': 'Mensal',
  'paywall.plan.mensual.precio': '{precio} por mês',
  'paywall.plan.anual.nombre': 'Anual',
  'paywall.plan.anual.precio': '{precio} por ano',
  'paywall.plan.anual.equivalente': 'Fica em {precioMes} por mês.',
  'paywall.plan.nota': 'O preço quem põe é a loja, na sua moeda. Aqui não há letra miúda.',
  /* O rotulo diz o que o toque ABRE, e nao o que ele vai produzir — a mesma
   * regra de 'plano.tela.ritual.abrir.*'. "Abrir o baralho completo" descrevia
   * um destravamento que nao existe (ver o bloco acima). */
  'paywall.boton': 'Abrir as treze luas',
  'paywall.restaurar': 'Restaurar compra',
  'paywall.salida': 'O que você já abriu continua seu.',
  /* Mesma correcao de 'perfil.suscripcion.gestionar*' (13/09/2026). */
  'paywall.comoCancelar':
    'Cancela quando você quiser, pela sua conta na plataforma onde comprou, sem falar com ninguém e sem explicar por quê. O que você já pagou fica ativo até o fim do período.',

  /* --- LEGAL (comum as duas telas de documento) ----------------------------------
   * Duas chaves partilhadas por PrivacidadScreen e TerminosScreen. Ficam fora dos
   * dois blocos de proposito: a caixa de contato e a versao sao a MESMA coisa nas
   * duas telas, e duplica-las e o jeito classico de uma ficar desatualizada. */

  // O CANAL DE SUPORTE E O DO APP HOSPEDEIRO (13/09/2026).
  //
  // Ate hoje esta chave dizia 'contato@fiovermelho.app' — sobra do tempo em
  // que a Madre Maria era um app avulso chamado Fio Vermelho, com dominio
  // proprio. Depois da fusao ela nao e mais um app: e um modulo dentro do
  // Cosmic Guide, instalado sob a ficha do Cosmic Guide, e quem escreve para
  // o suporte esta escrevendo para o Cosmic Guide.
  //
  // Pior que desatualizado, estava MORTO: fiovermelho.app devolve NXDOMAIN
  // (conferido em 13/09/2026 contra 8.8.8.8) — o dominio nao existe, nao e so
  // falta de MX. O endereco aparecia na AyudaScreen como mailto tocavel e
  // dentro dos Termos; toda mensagem voltava com erro permanente, inclusive a
  // do revisor da loja, que e recusa direta da ficha.
  //
  // Agora vem de lib/supportContact.js, o unico lugar do repo onde o canal de
  // contato mora. Trocar o endereco passa a ser uma linha, nao uma cacada em
  // dois apps.
  //
  // ⚠️ PENDENTE DO DONO, E NAO E CODIGO: cosmicguide.cloud existe mas ainda
  // NAO TEM registro MX (conferido no mesmo dia, no nameserver autoritativo).
  // A caixa nao recebe. O passo a passo esta no cabecalho de
  // lib/supportContact.js — sao registros DNS, nada aqui destrava isso.
  'legal.correo': SUPPORT_EMAIL,
  'legal.version': 'Madre Maria · versão 2 · setembro de 2026',

  /* --- PRIVACIDAD ----------------------------------------------------------------
   * Esta tela e uma descricao do app que existe HOJE, nao um modelo juridico.
   * Cada linha abaixo pode ser conferida por quem abrir o codigo:
   *  · o que se guarda   -> lib/almacen.js ('perfil', 'hilo', 'limite', 'suscripcion',
   *                         'recordatorio' e 'ajustes' — a lista completa esta em
   *                         CLAVES_HILO_ROJO, em screens/AjustesScreen.js)
   *  · o que se pede     -> datos/preguntas.js (as 7 perguntas, e so elas)
   *  · nao ha rede       -> nao existe fetch() em nenhum arquivo do projeto
   * Quem mexer numa dessas tres coisas mexe nesta copy no mesmo commit, ou a tela
   * passa a mentir. Nao existe clausula aqui sobre coisa que o app nao faz.
   *
   * MUDOU EM 01/09: entraram a DATA DE NASCIMENTO (P6) e o GENERO DELA (P7).
   * A data de nascimento e DADO SENSIVEL, e por isso ela nao entra de penetra
   * numa linha generica: tem linha propria em `guarda.lineas` dizendo onde fica
   * e para que serve, e `borrar.cuerpo` diz com todas as letras que ela sai no
   * "Apagar tudo". Ela mora dentro da chave 'perfil', que ja esta em
   * CLAVES_HILO_ROJO (screens/AjustesScreen.js) — conferido.
   * A linha que dizia "nao pedimos a sua data de nascimento, a sua idade e o seu
   * signo" saiu de `no.lineas`. Uma politica de privacidade que ficou para tras
   * nao e um texto velho: e uma declaracao falsa numa ficha de loja. */
  'privacidad.sobreceja': 'PRIVACIDADE',
  /* O TITULO E A ENTRADA, DEPOIS DA SOLDA (13/09/2026).
   * Diziam "Tudo fica neste telefone" e "nao tem conta nem senha (…) nada sai
   * dele". Eram verdade no app avulso. Dentro do Cosmic Guide deixaram de ser:
   * o app que a pessoa instalou TEM conta (lib/supabaseClient.js), TEM servidor
   * (IA, Comunidade, Memoria Cosmica, busca de cidade) e a tela de Privacidade
   * DELE declara isso corretamente — duas telas do mesmo app se contradiziam, e
   * a revisao da loja le as duas.
   * A correcao segue a doutrina que o bloco 'privacidad.red.*' logo abaixo ja
   * usa: a frase continua verdadeira sobre a MADRE e nomeia a fronteira, em vez
   * de virar promessa categorica sobre o app inteiro. O que ela guarda continua
   * sendo tudo o que esta na lista de 'privacidad.guarda.lineas' — isso nao
   * mudou e nao esta sendo suavizado. */
  'privacidad.titulo': 'O que é da Madre fica neste telefone',
  'privacidad.entrada':
    'A Madre Maria não pede conta nem senha, e não manda nada para fora: o que você escreve nas perguntas dela fica no seu aparelho. Ela mora dentro do Cosmic Guide, que é um app maior e tem conta e servidor próprios — o que for dele está descrito na tela de Privacidade do Cosmic.',

  'privacidad.guarda.titulo': 'O QUE FICA GUARDADO NO SEU TELEFONE',
  'privacidad.guarda.lineas': [
    'O nome que você escreveu na primeira pergunta.',
    'As suas quatro respostas sobre a história: o que aconteceu, há quanto tempo, como está o contato hoje e o que você quer entender.',
    'A sua data de nascimento. É dado sensível e fica tratado como tal: dela saem o seu signo e a sua idade, que são o que faz o plano falar com a sua fase da vida. Não pedimos a hora nem o lugar, e ela sai no "Apagar tudo" junto com o resto.',
    'Como falar com você — mulher, homem ou nenhum dos dois. Muda só as palavras com que a leitura se dirige a você.',
    'O seu fio: os dias em que você veio ler, a conta de hoje e o seu recorde.',
    'Uma marca do dia, para saber se você já abriu a leitura de hoje.',
    'Os seus ajustes: a hora do lembrete, o movimento reduzido e a vibração.',
    'O que você escreve nos campos do dia — a resposta da pergunta e, no dia do sonho, o sonho. Fica com a data, ninguém mais lê, e sai no "Apagar tudo".',
    /* A FOTO SAIU DESTA LISTA. Cafe e palma sao UM SO no app (decisao do dono,
     * 11/09/2026): screens/RitualCafeScreen.js e screens/RitualMaoScreen.js nao
     * vieram na copia e lib/visao.js saiu com elas. Nenhuma foto sai deste modulo,
     * entao a linha que prometia o leitor de visao virou MENTIRA aqui dentro — e
     * mentira numa tela de privacidade e a pior especie de texto desatualizado.
     * TODO(fusao-cosmic): quando o ★ PONTO DE SOLDA (screens/PlanoScreen.js) ligar
     * cafe/mao as telas do Cosmic Guide, quem faz a chamada e o COSMIC, e e a
     * privacidade DELE que responde pela foto. Se esta lista voltar a falar disso,
     * tem de descrever a chamada do Cosmic, nao a que existia aqui. */
    'O coração de cada dia (leve, neutro ou pesado) e o registro das missões — aceitou, cumpriu e a nota que você deu. Contagens suas, no seu telefone.',
    'O signo da pessoa amada, se você quiser dar — um entre doze, pedido só na sexta, para o ritmo de vocês dois. Não identifica ninguém, dá pra trocar quando quiser, e sai no "Apagar tudo" com o resto.',
    'A linha que o seu dia fechado deixa para o seguinte — o "fio de ontem", que o app cita de volta pra você no próximo dia vivido. É a última linha, fica só neste telefone e sai no "Apagar tudo".',
    /* O CIRCULO FICA DE FORA da fusao (decisao do dono, 11/09/2026): lib/circulo.js
     * nao veio e o cartao saiu do Perfil. Nada sobe para salao nenhum a partir
     * daqui, entao a linha que descrevia o apelido, os dias e a palavra do mural
     * saiu junto. As chaves 'circulo.*' seguem no dicionario, sem consumidor, para
     * o dia em que o recurso voltar. O Madre Maria autonomo continua com ele. */
    'Em que degrau do caminho você está: as missões que envolvem a outra pessoa vêm em ordem, da mais leve para a que pede mais coragem, e o app guarda só o número do degrau e o dia em que você subiu. É um número de um a nove neste telefone, e sai no "Apagar tudo".',
    'Uma letra, A ou B: qual das duas leituras de entrada o app sorteou para você na primeira vez — para que o "reouvir" mostre as suas cartas, e não as outras. Fica neste telefone e sai no "Apagar tudo".',
  ],
  'privacidad.guarda.pie':
    'Essa é a lista completa. Fica no armazenamento local do sistema — a mesma gaveta onde qualquer app deixa as preferências dele — e fica ali até você apagar.',
  'privacidad.recordatorio':
    'Ainda não há lembretes: o app não envia notificação nenhuma. Se um dia a gente colocar, a única coisa guardada seria a hora que você escolher, neste mesmo telefone.',

  'privacidad.no.titulo': 'O QUE NÃO SE PEDE NEM SE RECOLHE',
  'privacidad.no.lineas': [
    'A hora e o lugar onde você nasceu. Pedimos só o dia; sem hora não há mapa nenhum, e o app não finge ter um.',
    'A sua localização. O app nunca pergunta onde você está.',
    /* A CAMERA SAIU DESTA LINHA (11/09/2026, com a solda de cafe/mao). Enquanto
     * as duas leituras com foto nao existiam aqui, "a sua câmera" nesta lista era
     * verdade. Agora o plano do dia abre a tela do Cosmic Guide nos dias de borra
     * e de mao, e essa tela pede a foto — entao manter a camera na lista do que
     * "não se pede" seria a tela de privacidade desmentindo o botao que ela mesma
     * oferece. A camera continua NAO sendo pedida por este modulo: quem pede, e
     * quem responde por ela, e o Cosmic — e a linha diz exatamente isso. */
    'Os seus contatos, as suas fotos e o seu microfone. A câmera a Madre também não pede: nos dias de borra e de mão quem abre a câmera é a tela do Cosmic Guide, e é a privacidade dele que responde pela foto.',
    'Da outra pessoa: o nome, o nascimento, o gênero, uma foto ou como chegar até ela — nunca. O único dado que pode existir aqui sobre essa pessoa é o signo solar, um entre doze, e só se você quiser dar (ele está na lista de cima).',
    'O seu e-mail e o seu telefone. Não há cadastro, então não há quem identificar.',
  ],
  'privacidad.no.pie':
    'Não há publicidade, não há rastreador e não há análise de terceiros. O que a leitura não usa, não se pede.',

  'privacidad.red.titulo': 'NÃO HÁ REDE',
  /* DENTRO DO COSMIC GUIDE O TITULO VIROU LITERAL (11/09/2026). A frase antiga
   * abria uma excecao — "so duas coisas usam a rede": a foto da xicara/palma e o
   * Circulo. As duas sairam da copia (lib/visao.js, lib/api.js e lib/circulo.js nao
   * vieram), e o modulo da Madre aqui dentro nao faz UMA chamada de rede. Medido:
   * zero fetch/XMLHttpRequest em madremaria/.
   * A SOLDA ACONTECEU (11/09/2026) e esta frase foi revisada JUNTO, como o aviso
   * mandava. O titulo 'NAO HA REDE' continua verdadeiro para a Madre: ela segue
   * sem uma unica chamada de rede (zero fetch/XMLHttpRequest em madremaria/). O
   * que mudou e que dois dias do giro levam a uma tela do Cosmic que TEM rede, e
   * o corpo do texto agora nomeia essa porta em vez de deixar a usuaria concluir
   * que nada em lugar nenhum sai. Nao se promete o que o Cosmic faz com a foto:
   * isso e a privacidade DELE, e apontar para la e mais honesto do que resumir. */
  'privacidad.red.cuerpo':
    'As cartas saem do baralho, da data de hoje e das suas respostas, e o texto se monta aqui dentro com conteúdo que já vem dentro do app: dá para ler em modo avião. Nada do que você escreve aqui sai deste telefone. Há uma porta para fora, e ela é só sua de abrir: nos dias de borra e de mão o plano leva você à leitura com foto do Cosmic Guide, que é outra tela e envia a foto para ser lida. Se você não abrir essa porta, nada sai.',

  'privacidad.borrar.titulo': 'COMO APAGAR TUDO',
  'privacidad.borrar.cuerpo':
    'Em Ajustes há um botão, "Apagar tudo". Deixa o telefone como no primeiro dia: sem nome, sem respostas, sem a sua data de nascimento e sem fio. É imediato e não dá para desfazer. E se você desinstalar o app, o sistema leva o que tinha sobrado. Não temos cópia de nada, porque nunca tivemos.',

  'privacidad.pago.titulo': 'QUANDO A ASSINATURA EXISTIR',
  /* A LOJA NOMEADA ESTAVA ERRADA (13/09/2026). Dizia "App Store ou Google
   * Play". Quem cobra no Cosmic Guide e a HOTMART ('terms.payments.body' e
   * 'planos.legal.billingNote' do lib/i18n.js) — e a string "App Store" nao
   * existe em lugar nenhum do dicionario do Cosmic. Nomear um processador de
   * pagamento que o app nao usa e afirmacao factual falsa numa tela legal.
   * O "hoje nao ha cobranca" continua correto: lib/paywallGlobal.js tem
   * TUDO_LIBERADO = true. */
  'privacidad.pago.cuerpo':
    'Hoje não há cobrança dentro do app. Quando houver, quem processa o pagamento é a plataforma que cobra pelo Cosmic Guide, com os dados que você informar lá. A Madre Maria não vê o seu cartão, não recebe e não guarda: deste lado fica uma única marca no telefone dizendo que a assinatura está ativa.',

  'privacidad.cierre':
    'Esta tela descreve a versão que você tem instalada hoje. Se um dia o app precisar mandar alguma coisa para fora, isto é reescrito antes e a mudança fica à vista.',

  /* --- TERMINOS ------------------------------------------------------------------
   * Curto de proposito. As quatro coisas que a revisao das lojas procura num app
   * da categoria adivinhacao estao nos quatro primeiros blocos: o que e (entretenimento
   * simbolico), idade minima, o que NAO se promete, e como se cancela a assinatura.
   * O quinto bloco e a linha de apoio humano — visivel, sem promessa e sem alegacao
   * de saude: a app nao trata nada e diz isso com todas as letras. */
  'terminos.sobreceja': 'TERMOS DE USO',
  'terminos.titulo': 'O que você aceita ao usar o app',
  'terminos.entrada':
    'Curto e sem letra miúda. Se você usa a Madre Maria, é isto que está aceitando.',

  'terminos.que.titulo': 'O QUE É ISTO',
  'terminos.que.cuerpo':
    'A Madre Maria é uma leitura simbólica de tarô e um caminho de treze luas, feitos para entreter e para te dar outras palavras sobre algo que fica dando voltas. Não é previsão. Não é conselho profissional — nem jurídico, nem financeiro, nem de qualquer outra ordem —, não é diagnóstico e não substitui o atendimento de um profissional de saúde mental. As cartas não sabem nada da sua história: o que elas fazem é te dar três imagens fixas para você olhar o que é seu de fora.',

  'terminos.edad.titulo': 'IDADE MÍNIMA: 18 ANOS',
  /* MUDOU EM 01/09. A frase antiga dizia "a gente não pergunta a sua idade", e o
   * app passou a perguntar a data de nascimento. O texto novo diz o que ele faz
   * de verdade e para de fingir uma verificação que não existe: a data fica no
   * telefone, ninguém do outro lado confere, e a responsabilidade continua sendo
   * de quem instala. Prometer verificação seria a mentira maior. */
  /* MUDOU DE NOVO EM 13/09/2026. A frase dizia que a data de nascimento "nao e
   * enviada a ninguem". Isso valia no app avulso. No Cosmic Guide, o instante de
   * nascimento SAI do aparelho na busca de cidade (lib/cities.js manda `at=` pro
   * servidor) — e a tela de Privacidade do proprio Cosmic ja declara essa
   * excecao ('privacy.use.exceptionCity'). A Madre nao faz esse envio, mas a
   * pessoa nao instalou "a Madre": instalou o Cosmic. O texto agora diz o que a
   * MADRE faz com a data, e para de falar pelo app inteiro. */
  'terminos.edad.cuerpo':
    'O app é para pessoas maiores de 18 anos. A gente pergunta a sua data de nascimento — é dela que saem o seu signo e a sua idade —, mas não verifica nada: aqui na Madre ela fica neste telefone. Então isto continua do seu lado: se você tem menos de 18, este app ainda não é para você.',

  'terminos.promesa.titulo': 'O QUE O APP NÃO PROMETE',
  'terminos.promesa.cuerpo':
    'Nenhuma leitura promete um resultado sobre o seu vínculo, e nenhuma carta lê a outra pessoa: essa ponta do fio não está neste app. O que você decidir fazer depois de ler é seu, e a responsabilidade dessa decisão também. Se alguém — aqui ou em qualquer outro lugar — te der uma data ou te assegurar um final, está inventando.',

  'terminos.suscripcion.titulo': 'A ASSINATURA',
  /* MESMA CORRECAO DE 'privacidad.pago.cuerpo' (13/09/2026): a loja nomeada
   * nao e a que cobra. No Cosmic Guide quem processa e a Hotmart, e o
   * cancelamento se faz na area do comprador dela
   * (HOTMART_BUYER_AREA_URL em lib/supportContact.js). */
  'terminos.suscripcion.cuerpo':
    'Hoje não há cobrança nenhuma nesta versão, porque a assinatura ainda não está conectada. Quando ela abrir, funciona assim: quem cobra é a plataforma de pagamento do Cosmic Guide, na sua moeda; ela se renova sozinha no fim de cada período, a menos que você cancele antes; e o cancelamento se faz na sua conta dessa plataforma, sem falar com ninguém e sem explicar por quê. O que você já pagou fica ativo até o fim do período em curso. Os reembolsos são tratados por ela, com as regras dela.',

  'terminos.datos.titulo': 'OS SEUS DADOS',
  /* MUDOU EM 13/09/2026, pelo mesmo motivo de 'terminos.edad.cuerpo'. "Nao ha
   * conta, nao ha servidor" era uma afirmacao sobre o APP, e o app hospedeiro
   * tem os dois. Continua verdadeiro, e continua dito, que a Madre nao manda
   * nada para fora — o que sai e a fronteira nomeada, nao a garantia apagada. */
  'terminos.datos.cuerpo':
    'O que você escreve para a Madre fica neste telefone, inclusive a sua data de nascimento: ela não abre conta, não manda nada para um servidor e não guarda cópia. A Madre mora dentro do Cosmic Guide, que tem conta e servidor próprios — o detalhe completo está nas telas de Privacidade das duas.',

  'terminos.apoyo.titulo': 'SE VOCÊ ESTÁ PASSANDO MAL',
  'terminos.apoyo.cuerpo':
    'Uma carta não acompanha ninguém. Se o que você sente está pesando de verdade, procure gente de carne e osso: alguém de confiança, um profissional, ou a linha de atenção em crise do seu país. Este app não é esse lugar e não pretende ser.',

  'terminos.cambios.titulo': 'MUDANÇAS E CONTATO',
  'terminos.cambios.cuerpo':
    'Se estes termos mudarem, a versão nova aparece nesta mesma tela. Para dúvidas ou reclamações, escreva para {correo}.',

  /* --- AYUDA ---------------------------------------------------------------------
   * O quarto S, "Seguro" — a tela onde nenhum concorrente pontua.
   *
   * COBRANCA e a reclamacao numero 1 da categoria (29,1% das avaliacoes negativas do
   * nicho), e a resposta util para cobranca nunca e um formulario: e resolver ali
   * mesmo. Por isso cada categoria abre um PASSO QUE RESOLVE antes de existir a
   * opcao de escrever, e o "Escríbenos" so acende depois de a pessoa dizer o que
   * esta acontecendo — assim o correio ja chega classificado e ninguem perde uma ida
   * e volta perguntando o que ja daria para saber.
   *
   * O correio leva SO diagnostico tecnico (versao, plataforma, sistema, categoria).
   * Nunca o nome, nunca as respostas, nunca uma linha da leitura. E a tela
   * mostra o payload inteiro, linha por linha, ANTES de abrir o app de correio:
   * confianca que nao da para conferir e so mais uma promessa.
   *
   * A caixa de contato e `legal.correo`, partilhada com Privacidad e Terminos —
   * um endereco so em todo o app, para que nao exista o dia em que um deles fica
   * velho. */
  'ayuda.sobreceja': 'SUPORTE',
  'ayuda.titulo': 'Resolver um problema',
  'ayuda.entrada':
    'Escolha o que está acontecendo. Quase tudo se resolve aqui mesmo, num toque, sem falar com ninguém e sem esperar alguém responder.',

  'ayuda.cat.cobro': 'Cobrança e assinatura',
  'ayuda.cat.cobro.sub': 'Uma cobrança que você não reconhece, cancelar, ou pagou e não abriu.',
  'ayuda.cat.acceso': 'Não consigo entrar ou falta alguma coisa',
  'ayuda.cat.acceso.sub': 'O app não abre, fica carregando, ou você não vê o que já tinha.',
  'ayuda.cat.contenido': 'Alguma coisa do conteúdo',
  'ayuda.cat.contenido.sub':
    'Um texto que não encaixa, uma carta estranha, uma dúvida sobre como se decide.',
  'ayuda.cat.tecnico': 'Erro técnico',
  'ayuda.cat.tecnico.sub': 'Fecha sozinho, trava ou alguma coisa parou de responder.',
  'ayuda.cat.otro': 'Outra coisa',
  'ayuda.cat.otro.sub': 'Nada do que está aí em cima.',

  'ayuda.pasos.sobreceja': 'TENTE ISTO PRIMEIRO',
  'ayuda.pasos.vacio':
    'Para isto não há um botão que resolva sozinho. Use o campo aqui embaixo e conte o que aconteceu.',

  'ayuda.paso.restaurar.titulo': 'Restaurar a sua compra',
  'ayuda.paso.restaurar.cuerpo':
    'Se você já pagou e o app não reconhece — trocou de telefone, reinstalou, entrou com outra conta —, isto devolve: pergunta para a loja o que a sua conta comprou. Não cobra nada de novo.',
  'ayuda.paso.restaurar.boton': 'Restaurar compra',
  'ayuda.paso.restaurar.sinTienda':
    'Ainda não há loja conectada nesta versão, então não há compra nenhuma para restaurar. Nada do que é seu mudou.',

  'ayuda.paso.tienda.titulo': 'Cancelar ou conferir a cobrança',
  'ayuda.paso.tienda.cuerpo':
    'A assinatura vive na sua conta da loja, não aqui. Naquela tela estão o preço, a data da próxima cobrança e o botão de cancelar, sem falar com ninguém e sem explicar por quê.',
  'ayuda.paso.tienda.apple': 'Abrir na App Store',
  'ayuda.paso.tienda.google': 'Abrir na Google Play',
  /* 'ayuda.paso.tienda.web' (13/09/2026): no navegador quem cobra pelo Cosmic
   * Guide e a Hotmart, nao as lojas — ver o comentario de TIENDAS_VISIBLES em
   * screens/AyudaScreen.js. */
  'ayuda.paso.tienda.web': 'Abrir a área do comprador',
  'ayuda.paso.tienda.error':
    'Não deu para abrir daqui. A assinatura fica na conta da plataforma onde você comprou, na seção de assinaturas.',

  'ayuda.paso.reembolso.titulo': 'Uma cobrança que você não reconhece',
  'ayuda.paso.reembolso.cuerpo':
    'Quem processa a cobrança é a loja: não vemos o seu cartão, não recebemos o pagamento e não conseguimos devolver uma cobrança daqui. O reembolso se pede naquela mesma tela da loja, e aí sim ele chega a quem pode resolver. É o caminho curto, não um jeito de se livrar de você.',

  'ayuda.paso.recargar.titulo': 'Fechar e abrir de novo',
  'ayuda.paso.recargar.cuerpo':
    'Feche por completo — o app inteiro, não só esta tela — e abra de novo. Você não perde nada: o seu nome, as suas respostas e os seus nós estão guardados neste telefone, não na tela que travou.',
  'ayuda.paso.recargar.boton': 'Recarregar agora',

  'ayuda.paso.metodo.titulo': 'Veja como o app decide',
  'ayuda.paso.metodo.cuerpo':
    'Quase toda dúvida de conteúdo se responde ali: como as cartas são sorteadas, o que as suas respostas mudam e o que elas não mudam, e de onde sai o texto de cada carta. Se depois de ler continuar sem encaixar, o erro é nosso e a gente quer ver.',
  'ayuda.paso.metodo.boton': 'Ver como este app decide',

  /* O passo destrutivo e o ULTIMO da lista de propósito, e a confirmacao mora na
   * propria tela (nada de Alert do sistema, que no web e um no-op silencioso).
   * A marca de assinatura NAO entra na varredura: ela nao e um dado sobre a pessoa,
   * e apaga-la so tiraria acesso ja pago sem devolver privacidade nenhuma. */
  'ayuda.paso.borrar.titulo': 'Apagar o que o app guardou',
  'ayuda.paso.borrar.cuerpo':
    'Deixa este telefone como no primeiro dia: sem nome, sem respostas, sem fio. É a última coisa a tentar, porque é imediato e não dá para desfazer: não temos cópia de nada, porque nunca tivemos.',
  'ayuda.paso.borrar.boton': 'Apagar o que está guardado',
  'ayuda.paso.borrar.confirma':
    'Apaga agora e não volta. A sua assinatura não é tocada: ela não é um dado seu que a gente guarde aqui, vive na sua conta da loja.',
  'ayuda.paso.borrar.si': 'Sim, apagar',
  'ayuda.paso.borrar.no': 'Melhor não',
  'ayuda.paso.borrar.hecho': 'Pronto. Este telefone não guarda mais nada seu.',
  'ayuda.paso.borrar.parcial':
    'O desta sessão foi apagado, mas o telefone não deixou gravar no disco. Feche o app e abra de novo para conferir.',

  'ayuda.escribir.sobreceja': 'SE NADA DISSO RESOLVEU',
  'ayuda.escribir.titulo': 'Fale com a gente',
  'ayuda.escribir.cuerpo':
    'Abre o seu app de e-mail com o assunto e o diagnóstico técnico já escritos. O que aconteceu quem conta é você, com as suas palavras: isso o app não preenche.',
  'ayuda.escribir.boton': 'Abrir o meu e-mail',
  'ayuda.escribir.falta':
    'Escolha aí em cima o que está acontecendo. Assim o e-mail chega já classificado e a gente não te pergunta de volta o que você já sabe.',
  'ayuda.escribir.asunto': 'Madre Maria · {categoria}',
  'ayuda.escribir.error':
    'Não deu para abrir o seu e-mail daqui. Use o endereço {correo} de onde você preferir e copie à mão as quatro linhas de cima.',
  'ayuda.escribir.directo': 'Ou use direto o endereço {correo}.',

  'ayuda.diagnostico.titulo': 'ISTO É A ÚNICA COISA QUE SAI DAQUI',
  'ayuda.diagnostico.version': 'Versão do app',
  'ayuda.diagnostico.plataforma': 'Plataforma',
  'ayuda.diagnostico.sistema': 'Sistema',
  'ayuda.diagnostico.categoria': 'Categoria',
  'ayuda.diagnostico.sinCategoria': 'ainda sem escolher',
  'ayuda.diagnostico.sinDato': 'sem dado',
  'ayuda.diagnostico.pie':
    'Nada além disso. Não vai o seu nome, não vão as suas respostas e não vai uma linha sequer da sua leitura: o app não consegue anexar, porque elas nunca saem deste telefone. Se você quiser contar alguma coisa da sua leitura, é você quem digita dentro do e-mail, e essa é uma decisão sua e não um anexo automático.',

  'ayuda.correo.cuerpo':
    'Conte o que aconteceu (digite aqui):\n\n\n\n———\nDiagnóstico técnico. Quem escreveu foi o app; não inclui o seu nome, as suas respostas nem a sua leitura.\n{diagnostico}\n',

  'ayuda.pie': 'Aconteça o que acontecer com isto, nada do que é seu se perde.',

  /* --- METODO --------------------------------------------------------------------
   * A tela que declara o mecanismo. E o argumento de marca do app: o oposto exato de
   * "o servico e amador, nao consigo confiar na informacao" — que e a avaliacao mais
   * curtida do maior app de astrologia da regiao.
   *
   * TODA linha daqui e conferivel no codigo, e essa e a unica razao de a tela poder
   * existir. Quem mexer num destes tres arquivos mexe nesta copy no MESMO commit,
   * ou a tela passa a mentir:
   *  · o sorteio                -> lib/mazo.js (Fisher-Yates parcial, Math.random,
   *                                sem semente e sem ponto de injecao)
   *  · o que as respostas mudam -> lib/lectura.js (TABLAS + guardaContacto)
   *  · o texto de cada carta    -> datos/cartas.json, campo `amor`, verbatim
   *
   * Os numeros que a tela mostra (as 78 cartas, o numero de perguntas, a probabilidade de
   * invertida) NAO sao digitados aqui: chegam por interpolacao, importados dos
   * proprios modulos. Numero digitado a mao e a primeira coisa que fica velha. */
  'metodo.sobreceja': 'COMO ESTE APP DECIDE',
  'metodo.titulo': 'O método, sem mistério',
  'metodo.entrada':
    'Um app de tarô pode dizer qualquer coisa sobre como funciona por dentro, porque ninguém vê por dentro. Esta tela é o contrário: aqui está o mecanismo completo, escrito para você poder discutir. Se alguma coisa disto não bater com o que você vê no app, o erro é nosso.',

  'metodo.sorteo.titulo': 'Como as suas três cartas são sorteadas',
  'metodo.sorteo.cuerpo':
    'Elas são embaralhadas com Fisher-Yates, o algoritmo padrão de embaralhamento: a cada passo ele escolhe ao acaso uma carta entre as que ainda não saíram e a tira do saco. Isso faz duas coisas ao mesmo tempo — que as {cartas} cartas tenham exatamente a mesma probabilidade de sair, e que elas não possam se repetir dentro de uma tiragem. Ele para na terceira.',
  'metodo.sorteo.orientacion':
    'A orientação é sorteada à parte, carta por carta, com {prob} de probabilidade de sair invertida. Por isso podem sair as três direitas, ou as três invertidas: as duas coisas são resultados normais do sorteio e não significam nada a mais.',

  'metodo.ficha.titulo': 'A FICHA DO SORTEIO',
  'metodo.ficha.algoritmo': 'Algoritmo',
  'metodo.ficha.algoritmo.valor': 'Fisher-Yates parcial, uniforme',
  'metodo.ficha.azar': 'Fonte do acaso',
  'metodo.ficha.azar.valor': 'O gerador do sistema, sem nada por cima',
  'metodo.ficha.semilla': 'Semente',
  'metodo.ficha.semilla.valor': 'Nenhuma',
  'metodo.ficha.entrada': 'O que entra no sorteio',
  'metodo.ficha.entrada.valor': 'Nada seu',
  'metodo.ficha.repetidas': 'Cartas repetidas',
  'metodo.ficha.repetidas.valor': 'Impossíveis por construção',
  'metodo.ficha.pie':
    'Ao sorteio não chega o seu nome, nem as suas respostas, nem a hora, nem quantas vezes você abriu o app. Não é promessa de marca: é que a função que reparte não tem por onde receber esses dados, e está escrita para que não dê para passá-los a ela.',

  'metodo.respuestas.titulo': 'O que as suas {preguntas} respostas mudam',
  'metodo.respuestas.si': 'O QUE ELAS MUDAM',
  'metodo.respuestas.si.lineas': [
    'A pergunta que cada posição faz. O nó se calibra com o que aconteceu entre vocês; a tensão, com o tempo que passou e com como está o contato hoje; a sua ponta, com o que você quer entender.',
    'O filtro de contato. Se você respondeu que escreveu e não teve resposta, ou que não há contato nenhum, toda frase que te empurre para fora fica de fora. Não é que se escolha outra frase: o texto já montado é varrido e substituído, então não passa nem um conselho escrito meses atrás.',
  ],
  'metodo.respuestas.no': 'O QUE ELAS NÃO MUDAM',
  'metodo.respuestas.no.lineas': [
    'Quais cartas saem. Nenhuma. Você poderia responder todas as perguntas ao contrário e o baralho repartiria exatamente igual.',
    'O que cada carta diz. O texto de uma carta está escrito de antemão e entra tal como é, sem retoque para você.',
  ],
  'metodo.respuestas.pie':
    'É a diferença entre personalizar a pergunta e personalizar a resposta. Aqui se personaliza a pergunta. A resposta quem dá é o baralho, e por isso às vezes cai uma carta incômoda: se as suas respostas pudessem mexer no resultado, isto seria um espelho e não uma leitura.',

  'metodo.texto.titulo': 'De onde sai o texto de cada carta',
  'metodo.texto.cuerpo':
    'Da tradição Rider-Waite-Smith: o baralho que Pamela Colman Smith ilustrou e que Arthur Edward Waite ordenou, publicado em Londres em 1909 e hoje em domínio público. É o vocabulário que quase todo o tarô moderno usa. O que fizemos foi uma leitura editorial dessas {cartas} imagens com uma lente só — os vínculos que ficaram pela metade —, escrita à mão, carta por carta, antes de a sua tiragem existir.',
  'metodo.texto.fuente':
    'Rider-Waite-Smith Tarot. Pamela Colman Smith e A. E. Waite, William Rider & Son, Londres, 1909. Domínio público.',
  'metodo.texto.pie':
    'Por isso o texto de uma carta é o mesmo para todo mundo: ele não é reescrito para você. O que é seu é qual carta te saiu e em que posição ela caiu.',

  'metodo.offline.titulo': 'Não há inteligência artificial e não há internet',
  'metodo.offline.cuerpo':
    'A leitura é montada inteira dentro do seu telefone. Não há modelo de linguagem escrevendo frases, não há servidor devolvendo o texto e não há consulta nenhuma saindo para a rede: todo o conteúdo já vinha dentro do app quando você instalou.',
  'metodo.offline.prueba':
    'E dá para conferir sem acreditar na gente: ponha o telefone em modo avião e peça a sua tiragem. Sai igual.',
  /* O PE GANHOU A RESSALVA DA SOLDA (11/09/2026). O titulo e o corpo acima
   * continuam verdadeiros e nao foram tocados: eles falam da LEITURA da Madre,
   * que e montada inteira no telefone e sai igual em modo aviao — o teste de
   * 'metodo.offline.prueba' continua passando. Mas "como nada sai" era uma
   * afirmacao sobre o app INTEIRO, e desde a solda ha dois dias no giro em que o
   * plano leva a leitura com foto do Cosmic. Sem esta ressalva, quem lesse esta
   * pagina depois de fotografar a xicara pegaria o app mentindo. */
  'metodo.offline.pie':
    'Como nada sai, também nada sobe. O seu nome e as suas respostas ficam neste telefone: não há conta, não há e-mail, não há servidor. Isto vale para tudo o que você lê aqui. A exceção é declarada: nos dias de borra e de mão, o plano leva você a uma leitura com foto do Cosmic Guide — essa é outra tela, ela usa rede e inteligência artificial, e só acontece se você abrir.',

  'metodo.limites.titulo': 'Onde o método acaba',
  'metodo.limites.entrada':
    'Um método honesto também diz onde ele termina. Esta é a mesma caixa que aparece antes de cada resultado, e aqui ela diz exatamente o mesmo que lá:',

  'metodo.cierre':
    'Esse é o mecanismo completo: um baralho embaralhado sem saber nada de você, as suas respostas escolhendo a pergunta, e um texto escrito de antemão por pessoas. Não há uma camada secreta embaixo. Se um dia houver, esta tela diz antes.',
  'metodo.ayuda': 'Resolver um problema',

  /* --- AJUSTES -------------------------------------------------------------------
   * A regra da tela esta escrita para a usuaria em `ajustes.sub`, e ela vale para
   * quem escrever copy nova aqui: so entra controle que muda alguma coisa HOJE.
   * Nao ha seletor de idioma (o v1 fala espanhol e so espanhol), nao ha tema
   * claro (theme.js e um tema unico e congelado) e nao ha "sincronizar" (nao
   * existe conta nem servidor).
   *
   * O bloco `recordatorio.aviso.*` E o texto que chega no telefone. Sao TRES
   * variacoes e nao uma: lib/recordatorio.js alterna entre elas pelo dia do ano
   * (deterministico, sem sorteio), para que o mesmo aviso repetido 30 dias
   * seguidos nao vire ruido que a pessoa aprende a ignorar.
   *
   * A previa da tela desenha a PRIMEIRA (`aviso.titulo` / `aviso.cuerpo`) e
   * `previa.variantes` diz na cara que ha tres — senao a previa vira promessa
   * pela metade. Nenhuma das tres pode divergir do que o agendador manda: sao
   * exatamente estas chaves que lib/recordatorio.js le.
   *
   * As tres obedecem a mesma regra: falam do FIO e da LEITURA DE HOJE, nunca da
   * outra pessoa e nunca do que vai acontecer. Nao cobram e nao ameacam; convidam.
   * E o dia que passa em branco aparece como constatacao ("o fio fica parado"),
   * igual a `hilo.rachaRota` — nunca como perda.
   *
   * As duas confirmacoes de `datos` tem SEMPRE as duas metades — o que apaga e o
   * que NAO apaga. Confirmacao que so ameaca e confirmacao que a pessoa aceita
   * sem ler, e apagar Mi Hilo por engano nao tem volta. */
  'ajustes.sobreceja': 'SÓ O QUE FAZ ALGUMA COISA',
  'ajustes.titulo': 'Ajustes',
  'ajustes.sub':
    'Cada controle daqui muda alguma coisa de verdade, e tudo vive neste telefone. O que ainda não funciona, não está aqui.',

  'ajustes.recordatorio.titulo': 'Lembrete diário',
  'ajustes.recordatorio.sub': 'Um aviso por dia, na hora que você escolher.',
  'ajustes.recordatorio.previa': 'É isto que chega para você',
  'ajustes.recordatorio.previa.variantes':
    'O aviso muda de palavras conforme o dia, e este é um dos três. Os três dizem o mesmo: que o seu dia de hoje está aberto no tabuleiro.',
  'ajustes.recordatorio.aviso.app': 'Madre Maria',
  'ajustes.recordatorio.aviso.cuando': 'agora',
  'ajustes.recordatorio.aviso.titulo': 'A casa de hoje abriu',
  'ajustes.recordatorio.aviso.cuerpo':
    'O seu dia já está no tabuleiro, com o gesto e a missão de hoje. Quando você quiser, é só raspar.',
  'ajustes.recordatorio.aviso.dos.titulo': 'O nó de hoje espera por você',
  'ajustes.recordatorio.aviso.dos.cuerpo':
    'Ele se dá quando o dia de hoje se cumpre. E se hoje você não vier, o fio fica parado e espera do mesmo jeito.',
  'ajustes.recordatorio.aviso.tres.titulo': 'Uns minutos seus, sem pressa',
  'ajustes.recordatorio.aviso.tres.cuerpo':
    'O seu dia de hoje está pronto aqui dentro. Uns minutos para você, e nada além disso.',
  'ajustes.recordatorio.pie':
    'Nada além disso: um aviso por dia, sempre na mesma hora. Sem novidades, sem ofertas e sem insistir se um dia você não vier.',
  'ajustes.recordatorio.antesDelPermiso':
    'Ao ativar, o seu telefone pergunta se você permite os avisos. Se você disser que não, o app continua funcionando igual.',
  'ajustes.recordatorio.activar': 'Ativar o lembrete',
  'ajustes.recordatorio.desactivar': 'Desativar o lembrete',
  'ajustes.recordatorio.estadoActivo': 'Ativado. Todos os dias às {hora}.',
  'ajustes.recordatorio.estadoInactivo': 'Desativado. Agora mesmo não chega aviso nenhum.',
  'ajustes.recordatorio.hora': 'Hora do aviso',
  'ajustes.recordatorio.horaMenos': 'Uma hora a menos',
  'ajustes.recordatorio.horaMas': 'Uma hora a mais',
  'ajustes.recordatorio.enPunto': 'Em ponto',
  'ajustes.recordatorio.yMedia': 'E meia',
  'ajustes.recordatorio.negado':
    'O seu telefone está com os avisos bloqueados para a Madre Maria. Eles se desbloqueiam nos ajustes do sistema, e de lá você volta para cá.',
  'ajustes.recordatorio.abrirSistema': 'Abrir os ajustes do telefone',
  'ajustes.recordatorio.sinCanal':
    'Esta versão ainda não consegue te enviar avisos. Quando ela conseguir, liga-se por aqui e com este mesmo aviso.',
  'ajustes.recordatorio.errorProgramar': 'Não deu para programar o aviso. Tente de novo.',

  'ajustes.movimiento.titulo': 'Movimento reduzido',
  'ajustes.movimiento.sub':
    'As animações do app: as cartas, o botão que acende e as telas que aparecem.',
  'ajustes.movimiento.sistema': 'Seguir o sistema',
  'ajustes.movimiento.forzado': 'Sempre reduzido',
  'ajustes.movimiento.sistemaReduce':
    'O seu sistema está pedindo movimento reduzido agora mesmo, e o app respeita.',
  'ajustes.movimiento.sistemaNormal': 'O seu sistema não está pedindo movimento reduzido agora mesmo.',
  'ajustes.movimiento.forzadoNota':
    'O app reduz o movimento sempre, diga o que disser o sistema.',

  'ajustes.haptica.titulo': 'Vibração',
  'ajustes.haptica.sub': 'O toquinho curto ao raspar uma carta e ao dar o nó do dia.',
  'ajustes.haptica.prueba': 'É assim que se sente. Se você não notou nada, o seu telefone está com ela desligada.',

  'ajustes.datos.titulo': 'Os seus dados',
  'ajustes.datos.sub':
    'Nada disso saiu nunca deste telefone: não há conta, não há e-mail, não há servidor.',
  'ajustes.datos.respuestas': 'Apagar as minhas respostas',
  'ajustes.datos.todo': 'Apagar tudo',

  'ajustes.confirmar.borra': 'APAGA',
  'ajustes.confirmar.queda': 'NÃO APAGA',
  'ajustes.confirmar.cancelar': 'Melhor não',
  'ajustes.confirmar.respuestas.titulo': 'Apagar as suas respostas?',
  'ajustes.confirmar.respuestas.borra':
    'O seu nome e as respostas do início — inclusive a sua data de nascimento. Na próxima vez que você abrir o app, ele pergunta de novo.',
  'ajustes.confirmar.respuestas.queda':
    'Meu Fio inteiro: os seus nós e o seu recorde ficam onde estão. A sua assinatura também não é tocada.',
  'ajustes.confirmar.respuestas.boton': 'Sim, apagar as minhas respostas',
  'ajustes.confirmar.todo.titulo': 'Apagar tudo?',
  'ajustes.confirmar.todo.borra':
    'O seu nome, as suas respostas — a sua data de nascimento junto —, Meu Fio completo — os nós e também o recorde —, o lembrete e estes ajustes. Não há cópia em nenhum outro lugar, então não há como desfazer.',
  /* Mesma correcao de 'perfil.suscripcion.gestionar*' (13/09/2026). */
  'ajustes.confirmar.todo.queda':
    'A sua assinatura: ela vive na sua conta da plataforma onde você comprou, não aqui. Se um dia você precisar dela, se recupera com "Restaurar compra".',
  'ajustes.confirmar.todo.boton': 'Sim, apagar tudo',

  'ajustes.borrado.respuestas': 'Pronto. As suas respostas não estão mais neste telefone.',
  'ajustes.borrado.todo': 'Pronto. Não sobrou nada seu neste telefone.',
  'ajustes.borrado.parcial': 'Ficou alguma coisa sem apagar neste telefone. Tente de novo.',
  'ajustes.noGuardado':
    'Não deu para guardar este ajuste no telefone. Ele vale enquanto o app estiver aberto.',

  'ajustes.version': 'Versão {version}',
  'ajustes.privacidad': 'Privacidade',
  'ajustes.privacidad.borrar':
    'Para apagar o que está guardado não é preciso falar com ninguém: faz-se aqui em cima, em "Os seus dados", e é imediato.',

  /* --- COMUNES -------------------------------------------------------------------
   * Nota para quem mexer no linter de copy: o proibido e a conjugacao de futuro
   * ("... a persona X fara Y"), nao o infinitivo solto. O rotulo do botao de voltar
   * e 'Voltar' e assim continua — a regra tem de casar com o futuro, e por isso os
   * padroes de test/copy-promessa-app-inteiro.test.js exigem \b...[aá]\b: 'voltar' seco nao casa, 'voltara'
   * casa. */
  'comunes.siguiente': 'Continuar',
  'comunes.empezar': 'Começar',
  'comunes.volver': 'Voltar',
  'comunes.compartir': 'Compartilhar',
  'comunes.guardar': 'Guardar',
  'comunes.cerrar': 'Fechar',
  'comunes.pronto': 'Em breve',

  /* --- CONQUISTAS ----------------------------------------------------------------
   * ESCRITO EM PORTUGUES DE PROPOSITO, mesma decisao dos blocos MISSOES e RITUAL:
   * conteudo novo ja nasce na lingua de destino.
   *
   * O motor esta em lib/conquistas.js, e ele e 100% LEITURA: nao grava nada, nao
   * tem chave de storage e nao entra em CLAVES_HILO_ROJO. Cada conquista e uma
   * funcao pura sobre o que o fio, o album e o ritual JA guardaram — por isso
   * conquista aqui nunca se perde, nunca migra e nunca diverge do numero que a
   * outra tela mostra. A lista de chaves deste bloco vive la, em
   * CLAVES_TEXTO_CONQUISTAS.
   *
   * AS QUATRO REGRAS DURAS, e elas moram no TEXTO antes de morarem no codigo:
   *   1. Todo numero e medido NESTE aparelho. Nenhuma conquista compara com
   *      outra pessoa, nenhuma diz "X% das usuarias" e nenhuma conta gente.
   *   2. Nenhuma diz o que falta. Nao existe "faltam 12 cartas", nao existe
   *      porcentagem e nao existe contagem regressiva. A conquista ainda nao
   *      feita aparece pelo titulo e mais nada: a tela convida, nao cobra. A
   *      ausencia dessas chaves e a implementacao da regra.
   *   3. Nenhuma pune. Nao ha conquista que se perde e nao ha marca que apaga.
   *      `conquistas.a-volta` e a prova disso: a unica que fala de uma falta
   *      celebra o RETORNO, e o app sabe que ela voltou sem nunca ter anotado
   *      que ela faltou.
   *   4. Nenhuma promete desfecho. Todas falam no passado e todas falam DELA.
   *
   * Nao ha chave de premio porque nao ha premio: conquista aqui e uma marca e
   * uma linha de texto, e e tudo o que ela promete ser. */
  'conquistas.titulo': 'O que você já fez',
  'conquistas.sub': 'Tudo aqui foi contado neste telefone, a partir do que você fez.',
  'conquistas.pendente': 'Ainda não',
  'conquistas.pie':
    'Nenhuma delas tem prazo e nenhuma delas se perde. O que está marcado fica marcado.',

  'conquistas.primeira-leitura.titulo': 'A primeira leitura',
  'conquistas.primeira-leitura.texto': 'Você abriu as três cartas pela primeira vez.',
  'conquistas.tres-nos.titulo': 'Três nós',
  'conquistas.tres-nos.texto': 'Três dias seguidos em que você veio. O fio começou a ter tamanho.',
  'conquistas.sete-nos.titulo': 'Sete nós',
  'conquistas.sete-nos.texto': 'Uma semana inteira de nós, um atrás do outro.',
  'conquistas.trinta-nos.titulo': 'Trinta nós',
  'conquistas.trinta-nos.texto': 'Trinta dias seguidos. Isso é raro, e é seu.',
  'conquistas.a-volta.titulo': 'A volta',
  'conquistas.a-volta.texto':
    'Um dia passou em branco e você voltou. O fio estava do tamanho que você tinha deixado.',

  'conquistas.primeira-invertida.titulo': 'A primeira invertida',
  'conquistas.primeira-invertida.texto':
    'Uma carta caiu de cabeça para baixo e você leu assim mesmo.',
  'conquistas.dez-cartas.titulo': 'Dez cartas',
  'conquistas.dez-cartas.texto': 'Dez cartas diferentes já apareceram nas suas leituras.',
  'conquistas.um-grupo.titulo': 'Um grupo fechado',
  'conquistas.um-grupo.texto': 'Todas as cartas de um grupo do baralho já passaram por aqui.',
  'conquistas.carta-que-volta.titulo': 'A carta que volta',
  'conquistas.carta-que-volta.texto':
    'Uma mesma carta apareceu três vezes para você. É o baralho sendo baralho.',
  'conquistas.meio-baralho.titulo': 'Meio baralho',
  'conquistas.meio-baralho.texto': 'Metade das cartas já apareceu em alguma leitura sua.',
  'conquistas.baralho-inteiro.titulo': 'O baralho inteiro',
  'conquistas.baralho-inteiro.texto': 'Todas as cartas do baralho já apareceram para você.',

  'conquistas.ritual-completo.titulo': 'Os sete dias',
  'conquistas.ritual-completo.texto': 'Você fez o ritual inteiro, do primeiro dia ao sétimo.',

  /* --- FICHAS --------------------------------------------------------------------
   * ESCRITO EM PORTUGUES DE PROPOSITO, como os blocos acima.
   *
   * NENHUMA TELA MOSTRA ISTO HOJE. lib/fichas.js nasce com FICHAS_ACTIVAS false,
   * e estas chaves existem porque o modulo aponta para elas em TEXTO_MOTIVO —
   * motivo e chave tecnica ('leitura', 'carta:major-00') e nunca vai a tela; o
   * que a pessoa leria e isto aqui.
   *
   * Se as fichas forem ligadas um dia, duas frases NAO podem aparecer neste
   * bloco, e e melhor que fique escrito antes de alguem ter a ideia:
   *   · nada que venda recuperacao de sequencia. O fio parado nao pune, entao
   *     nao ha dano a reparar, e o escudo obrigaria o produto a inventar a
   *     punicao primeiro.
   *   · nada que faca a ficha parecer o portao da leitura de hoje. A leitura do
   *     dia e gratis e continua gratis; a ficha so paga a SEGUNDA do mesmo dia. */
  'fichas.unidade': 'ficha',
  'fichas.unidade.plural': 'fichas',
  'fichas.motivo.leitura': 'Leitura de hoje',
  'fichas.motivo.ritual': 'Um dia do ritual',
  'fichas.motivo.missao': 'Uma missão do dia',
  'fichas.motivo.carta': 'Carta nova no álbum',
  'fichas.gasto.leituraExtra': 'Mais uma leitura hoje',

  /* --- PLANO DO DIA ---------------------------------------------------------------
   * A copy de tela do plano diario. O material (os cinco rituais, as reflexoes, as
   * afirmacoes e as acoes de encontro) mora em datos/plano.js; o motor, em
   * lib/plano.js. A lista fechada de chaves que o motor emite e CLAVES_TEXTO_PLANO,
   * e e por ela que o portao varre este bloco.
   *
   * AS TRES REGRAS, aplicadas linha a linha aqui:
   *  1. Nada aqui inventa ceu. `plano.ceu.*` so e emitido quando houve MEDIDA; sem
   *     efemeride o bloco inteiro nao renderiza, e a unica frase disponivel e
   *     `plano.ceu.vazio` — que diz que nao deu, e nao chuta.
   *  2. Nada aqui promete desfecho nem fala pela outra pessoa. O ceu descreve o
   *     dia: "Lua Cheia na sexta" e medida.
   *  3. `plano.encontro.travado.*` e o texto de quem NAO tem contato. Ele nao pede
   *     nada, nao insinua nada e diz onde fica a chave — que e a resposta dela na
   *     pergunta do contato, em Ajustes. O app reage ao contato; nao provoca.
   *
   * POR QUE NENHUMA DESTAS LINHAS DIZ "AMANHA": 'amanha' e locucao de futuro pela
   * mesma regra que veta "vai voltar". Um marco lunar datado nao precisa dela — o
   * nome do dia da semana e o numero do dia dizem mais e nao prometem nada. */
  'plano.titulo': 'O plano de hoje',

  /* A REDE DE RUNTIME. `plano.acao.alternativa` é o que entra no lugar de uma
   * frase que a guarda de contato retirar da saída, com o contato duro ligado.
   * Ela existe em português de propósito: as ALTERNATIVAS de lib/lectura.js estão
   * em espanhol, e costurá-las aqui emendaria um parágrafo espanhol no meio de um
   * plano português — bug de idioma nascido de um patch de segurança.
   *
   * Esta linha é o texto que a pessoa lê no exato momento em que o app está
   * protegendo ela. Ela existir de verdade não é detalhe: sem a chave, t()
   * devolve a própria chave e a tela mostra "plano.acao.alternativa".
   * Ela também não pode casar com as guardas que a chamaram — nada de escrever,
   * ligar, procurar aqui dentro. */
  'plano.acao.alternativa':
    'Com o contato como está hoje, o plano não te pede nenhum passo para fora. O que há para fazer hoje se faz deste lado do fio.',
  'plano.acao.contencao':
    'Se hoje bater a vontade de dar um passo para fora, este é o gesto que segura a mão: faça o do plano, inteiro, e deixe o dia terminar.',

  'plano.ceu.vazio':
    'Hoje não deu para calcular o céu neste telefone. A gente prefere deixar em branco a chutar.',
  'plano.ceu.fase': 'A Lua de hoje está em {fase}.',
  'plano.ceu.marco.hoje': '{fase} é hoje.',
  'plano.ceu.marco.dia': '{fase} cai {quando}, dia {dia}.',

  'plano.encaixe.exato': 'Hoje é o dia deste gesto: {criterios}.',
  'plano.encaixe.parcial': 'Hoje bate em parte: {criterios}.',
  'plano.encaixe.nenhum': 'Hoje não é o dia mais óbvio deste gesto. Ele vale assim mesmo.',
  'plano.encaixe.naoDeclara': 'Este gesto não pede dia nem fase. Serve para hoje.',
  /* As duas linhas abaixo existem por um bug medido: sem efeméride, um gesto que
   * pede fase caía em `naoDeclara` e a tela afirmava "não pede dia nem fase" — o
   * app inventando a AUSÊNCIA de critério, que é uma afirmação sem lastro do
   * mesmo jeito que inventar a Lua seria. Elas dizem o que ficou de fora da
   * conta, em vez de deixar o silêncio passar por resposta. */
  'plano.encaixe.semMedida':
    'Hoje não deu para conferir o momento deste gesto neste telefone. Ele vale assim mesmo.',
  'plano.encaixe.parcialSemMedida':
    'Hoje bate no que deu para conferir: {criterios}. A fase da Lua ficou fora desta conta.',
  /* A metade negativa do par acima, e ela faltava. Sem efeméride, um gesto que
   * declara dia E fase, com o dia não batendo, caía em `nenhum` — e "hoje não é
   * o dia mais óbvio deste gesto" soa como quem conferiu os dois critérios e
   * reprovou os dois. Um "não" sobre uma fase que ninguém olhou é uma afirmação
   * sem lastro igual a inventar a Lua, só que com o sinal trocado. */
  'plano.encaixe.nenhumSemMedida':
    'Do que deu para conferir, hoje não é o dia mais óbvio deste gesto. A fase da Lua ficou fora desta conta, e ele vale assim mesmo.',
  'plano.encaixe.criterio.dia': '{diaSemana}, dia de {regente}',
  'plano.encaixe.criterio.fase': '{fase}',

  'plano.encontro.titulo': 'O encontro',
  /* NÃO EXISTE 'plano.encontro.quando', e a ausência é o contrato.
   *
   * Existia: 'Se for para escolher o dia: {marco}', com {marco} sendo a linha
   * medida do marco lunar ("Lua Nova cai na sexta-feira, dia 11"), desenhada
   * dentro do cartão de encontro, colada na ação. As duas metades eram
   * verdadeiras em separado e o conjunto não era: encostadas, elas afirmam que
   * a Lua é critério para escolher o dia de um encontro com outra pessoa — uma
   * previsão vestida de descrição, sem uma única palavra proibida à vista.
   *
   * A regra já estava escrita neste arquivo, no bloco `ano.virada.*`: data
   * medida a dois centímetros de um texto sobre reconciliação deixa de ser
   * medida. O marco continua no alto da tela, em `plano.ceu.marco.*`, onde
   * descreve o DIA. */
  'plano.encontro.travado.contatoDuro':
    'Este bloco fica travado hoje. Pelo que você marcou sobre o contato, o plano do dia é sobre você — e nenhum passo daqui aponta para fora. Se o contato voltar por conta própria, atualize a resposta em Ajustes e o bloco abre.',
  /* A frase desta linha já custou uma reescrita, e vale registrar por quê: ela
   * dizia "propor um encontro seria ignorar o único dado duro que você deu". A
   * intenção era negar, mas a guarda de contato (PATRONES_CONTACTO, lib/lectura.js)
   * não lê negação — e não deve ler, porque negação é onde o empurrão se disfarça.
   * O texto do bloco TRAVADO é lido por exatamente quem não pode receber a
   * sugestão, então ele tem de passar pela mesma varredura que tudo o mais. Não
   * escreva aqui "propor", "buscar" ou "tentar" seguido de encontro, contato ou
   * conversa — nem para dizer que não. */
  'plano.encontro.travado.bloqueio':
    'Este bloco fica travado hoje. Com um bloqueio no meio, o plano não aponta para fora: seria ignorar o único dado duro que você deu. Se isso mudar, atualize a resposta em Ajustes e o bloco abre.',

  /* --- PLANO DO DIA · A TELA -------------------------------------------------------
   * O bloco acima (`plano.*`) e o que o MOTOR emite, e a lista fechada dele e
   * CLAVES_TEXTO_PLANO em lib/plano.js. Este bloco (`plano.tela.*`) e o que a TELA
   * escreve por conta propria — rotulo de secao, rotulo de botao, nota de rodape —
   * e por isso ele fica separado: o portao varre a saida do motor, e uma chave de
   * moldura entrando naquela lista faria o portao cobrar de lib/plano.js uma frase
   * que lib/plano.js nunca emite.
   *
   * AS TRES REGRAS, aqui:
   *  1. Nenhuma linha daqui fala do ceu. A unica frase de ceu da tela vem do motor
   *     (`plano.ceu.fase`, `plano.ceu.marco.*`) e so quando houve medida. Nao ha
   *     aqui um "hoje o ceu nao deu": motivo tecnico e log, e log nao e copy.
   *  2. Nenhuma linha promete desfecho nem fala pela outra pessoa.
   *  3. Nenhuma linha empurra para o contato — nem no rotulo do botao. O unico
   *     botao que aponta para fora do plano abre AJUSTES, que e onde ela muda a
   *     propria resposta sobre o contato. */
  /* A linha da data, com o regente do dia ao lado. O regente NAO e ceu: a fila dos
   * sete dias e aritmetica de calendario (ordem caldaica com salto de 3, registrada
   * em Dião Cássio) e continua verdadeira num aparelho sem efeméride nenhuma — e
   * por isso esta linha sobrevive inteira quando o bloco do céu não renderiza.
   *
   * O planeta entra como ETIQUETA ("· ☉ Sol"), sem preposição, e isso é decisão de
   * gramática, não de estilo: os nomes canônicos vêm de REGENTE_POR_DIA (lib/ceu.js)
   * e casam byte a byte com o motor, então o molde tem de servir para os sete sem
   * exceção — e "dia de Sol" e "dia de Lua" saem errados em português, enquanto
   * "dia de Vênus" sai certo. Um molde com preposição obrigaria a uma segunda
   * tabela de artigos, e tabela de artigo é o tipo de coisa que sai de sincronia
   * com os nomes canônicos sem ninguém perceber. */
  'plano.tela.linhaDoDia': '{diaSemana}, {dia} de {mes} · {glifo} {regente}',

  'plano.tela.ritual.rotulo': 'O RITUAL DE HOJE',
  'plano.tela.ritual.ouvir': 'Ouvir o gesto de hoje',
  /* O preco em tempo, declarado antes do gesto — o mesmo preco do PACTO do ritual
   * de sete dias. Dois numeros diferentes no mesmo app viram desconfiança. */
  'plano.tela.ritual.duracao': 'Custa {duracao}.',
  'plano.tela.ritual.passos': 'COMO FAZER',

  /* --- O RITUAL TRANCADO ---------------------------------------------------------
   * O QUE ELA VE SEM ASSINAR, de proposito: o nome do gesto, a frase dele, quanto
   * custa em minutos, a abertura e o recibo da fonte. O QUE FICA DO OUTRO LADO: os
   * passos e o botao que abre a tela do gesto.
   *
   * A divisao nao e arbitraria — e a unica que deixa as duas frases verdadeiras ao
   * mesmo tempo: o audio 11 pode dizer que os rituais exigem assinatura (dizem), e a
   * tela nao finge que o dia esta vazio (nao esta: ela ve o que e). Vender uma lista
   * de passos que qualquer um pode ler embaixo seria as duas coisas erradas.
   *
   * {n} e a contagem REAL dos passos daquele dia, nao um numero fixo: a rede de
   * contato pode retirar um passo inteiro do catalogo (ritualSeguroDoDia, em
   * lib/plano.js) e anunciar "sao 4" quando restaram 3 seria o portao mentindo sobre
   * o tamanho do que vende. */
  'plano.tela.ritual.travado.corpo':
    'São {n} passos, e é neles que mora o que fazer. O gesto de hoje é este e não se repete amanhã: cada um dos dias das treze luas tem o seu.',
  'plano.tela.ritual.travado.boton': 'Abrir as treze luas',
  /* "SE UM DIA EXISTIR, ESTA LINHA MUDA POR DECISAO DE PRODUTO" — e o dia chegou
   * (11/09/2026, a solda de cafe/mao). O texto antigo dizia 'nada aqui analisa a
   * imagem, e quem escolhe o que viu e voce', o que era verdade enquanto o Fio
   * Vermelho nao tinha servidor de visao. Agora este aviso aparece EXATAMENTE
   * acima do botao que abre a leitura com foto do Cosmic, que analisa a imagem —
   * era a mentira mais proxima do dedo da usuaria em todo o modulo.
   * A linha nova ainda declara a fronteira (a Madre nao fica com a foto) e
   * devolve a escolha a ela: a palavra continua sendo dela, mesmo com a leitura. */
  'plano.tela.ritual.camera':
    'Este é o único gesto que pede a câmera, e a foto vai para a leitura da borra do Cosmic Guide, que analisa a imagem e devolve um texto. A Madre não guarda a foto nem a lê. A palavra final sobre o que você viu continua sendo sua.',
  /* Os rotulos do botao do gesto, um por ritual QUE TEM TELA. A chave e derivada
   * do id do ritual (DESTINO_POR_RITUAL em screens/PlanoScreen.js), entao 'sonho'
   * e 'respiro' nao aparecem aqui de propósito: aqueles dois gestos acontecem fora
   * do aparelho e o cartao deles nao ganha botao.
   * Todos dizem o que o toque ABRE, nunca o que ele vai produzir. */
  'plano.tela.ritual.abrir.cartas': 'Reabrir a minha leitura',
  'plano.tela.ritual.abrir.cafe': 'Abrir a leitura da borra',
  'plano.tela.ritual.abrir.mao': 'Abrir a leitura da mão',
  'plano.tela.ritual.fonte': '{obra}, {autor} — {quando}',

  'plano.tela.reflexao.rotulo': 'A PERGUNTA DE HOJE',
  'plano.tela.reflexao.placeholder': 'Do jeito que sair, sem arrumar a frase.',
  /* Diz onde o texto fica e diz onde ele se apaga. A segunda metade só é verdade
   * porque a chave 'plano' entrou em CLAVES_HILO_ROJO (screens/AjustesScreen.js)
   * no mesmo commit da tela: se ela sair de lá, esta linha vira mentira. */
  'plano.tela.reflexao.nota':
    'O que você escreve aqui fica neste telefone, com a data de hoje. Ninguém mais lê, e o "Apagar tudo" de Ajustes leva isto junto.',
  'plano.tela.reflexao.falhou':
    'Não deu para guardar neste telefone. O que você escreveu continua na tela enquanto ela estiver aberta.',

  'plano.tela.afirmacao.rotulo': 'A FRASE DE HOJE',

  /* O selo do bloco travado. Ele é VISÍVEL de propósito: esconder o bloco
   * ensinaria que o app tem um andar secreto, e o motivo honesto (que vem do
   * motor, em `plano.encontro.travado.*`) é o que fica no lugar da ação. */
  /* --- O RITMO DE VOCES DOIS (sexta, dia de Venus) --------------------------------
   * O unico bloco do plano que fala da OUTRA pessoa — e por isso o mais vigiado.
   * As regras, na ordem em que ja doeram em outros lugares do app:
   *   1. SO ABRE NA SEXTA. Venus rege a sexta no calendario planetario que o
   *      plano inteiro ja usa; fora dela o bloco nao existe, nem como teaser.
   *   2. O SIGNO E OPCIONAL, um entre doze, e a tela diz isso antes de pedir.
   *      Nome, data, foto ou contato da pessoa: nunca. A tela de privacidade
   *      lista a chave 'sinastria' e o Apagar tudo a leva junto.
   *   3. SEM VEREDITO: prosa, nunca placar (a tradicao citada e prosa sem
   *      percentual). 'limites' fica na tela SEMPRE que a leitura aparece.
   *   4. 'QUANDO HOUVER CONVERSA' respeita o contato: com o encontro travado
   *      (lib/plano.js), o paragrafo pratico NAO renderiza — mesma disciplina
   *      do bloco do encontro logo abaixo dele. */
  /* --- O MAPA DO ANO ---------------------------------------------------------------
   * O tabuleiro dos 365 (screens/MapaDoAnoScreen.js). O 'pe' e a unica frase da
   * tela sobre dias que ficaram para tras, e ela e deliberadamente SEM culpa:
   * lib/ano.js proibe maquina de culpa por escrito. */
  'barra.mapa': 'Mapa',

  /* --- OS CAMPOS QUE DIZEM QUANDO GUARDARAM ---------------------------------------
   * O disco grava no silencio (debounce) e a pessoa ficava esperando um botao
   * de concluir que nunca existiu — bug de 01/09. Agora o campo fala. */
  /* --- A CELULA NOVA DO DIA (cronogramacao 01/09) ---------------------------------
   * A frase e a missao nao prometem nada; o coracao conta e nunca qualifica. */
  'plano.frase.rotulo': 'A FRASE DE ABERTURA',
  'plano.passo.seguir': 'Continuar',
  'plano.passo.fechar': 'Fechar o dia',

  /* --- UM DIA, UM ATO + A CORRENTE (03/09) ----------------------------------------
   * O dia pede UMA coisa; os dias se ligam: a linha que o dia fechado deixou
   * volta LITERAL no próximo dia vivido ("o fio de ontem"), e o fecho mostra
   * só o TIPO de amanhã com a frase cortada — convite, nunca promessa, e o
   * gesto de amanhã continua sem spoiler (o áudio 10 promete isso). */
  'plano.fio.rotulo': 'O FIO DE ONTEM',
  'plano.fio.abre': 'Da última vez, você deixou aqui:',
  'plano.fio.ponte.gesto': 'Hoje o dia pede um gesto. Leva essa linha junto.',
  'plano.fio.ponte.missao': 'Hoje o dia pede uma missão. Leva essa linha junto.',
  'plano.fio.ponte.pergunta': 'Hoje o dia pergunta. A resposta pode começar daí.',
  'plano.fio.ponte.ritmo': 'Hoje é o dia de Vênus: o ritmo de vocês dois.',
  'plano.fio.ponte.encontro': 'Hoje o dia é de abrir horizonte.',
  'plano.ato.gesto': 'Um gesto pequeno',
  'plano.ato.missao': 'Uma missão',
  'plano.ato.pergunta': 'Uma pergunta sua',
  'plano.ato.ritmo': 'O ritmo de vocês dois',
  'plano.ato.encontro': 'O convite do fim de semana',
  'plano.amanha.rotulo': 'AMANHÃ',
  'plano.amanha.nota': 'A frase inteira abre com a casa de amanhã.',

  /* --- A LUA NO SIGNO DELA (04/09) ---------------------------------------------------
   * Trânsito MEDIDO (lib/luaNoSigno.js, astronomy-engine): a Lua passa 2-3
   * dias por mês no signo dela. A copy DESCREVE o céu ("está no seu signo")
   * e não promete nada — "dia de sorte" é proibido por doutrina. */
  'mapa.seuDia': 'SEU DIA',
  'plano.luaNoSigno': 'A Lua passa por {signo} hoje — o céu está no seu signo.',

  /* --- A APOSTA DO CORAÇÃO (04/09) ---------------------------------------------------
   * "E amanhã, como você acha que chega?" — 1 toque. Revela contra o PRÓXIMO
   * coração registrado (faltar não expira nem é citado). As 9 frases
   * DESCREVEM, nenhuma julga: sem "melhor/pior", sem "errou/acertou em
   * falta" — errar a aposta é tão informação quanto acertar, e só o acerto
   * vira número. */
  'coracao.aposta.rotulo': 'A APOSTA DE AMANHÃ',
  'coracao.aposta.convite': 'E amanhã, como você acha que chega?',
  'coracao.aposta.guardada': 'Guardada. Ela abre na próxima vez que você registrar o coração.',
  'coracao.aposta.acertos': 'Você já se acertou {n} vezes.',
  'coracao.aposta.leve.leve': 'Você apostou leve e chegou leve. Você se conhece.',
  'coracao.aposta.leve.neutro': 'Você apostou leve. Chegou neutro. Perto — e o dia foi seu.',
  'coracao.aposta.leve.pesado':
    'Você apostou leve. Chegou pesado. Dias mudam — você registrou de verdade.',
  'coracao.aposta.neutro.leve': 'Você apostou neutro. Chegou leve. O dia surpreendeu.',
  'coracao.aposta.neutro.neutro': 'Você apostou neutro e chegou neutro. Leitura fina do seu ritmo.',
  'coracao.aposta.neutro.pesado':
    'Você apostou neutro. Chegou pesado. Você olhou de frente e anotou.',
  'coracao.aposta.pesado.leve':
    'Você apostou pesado. Chegou leve. Você foi mais forte do que a véspera dizia.',
  'coracao.aposta.pesado.neutro':
    'Você apostou pesado. Chegou neutro. A véspera pesava mais que o dia.',
  'coracao.aposta.pesado.pesado':
    'Você apostou pesado e chegou pesado. Você se ouviu — e veio assim mesmo.',

  /* --- O CARIMBO DO FECHAMENTO (04/09) — recompensa por coisa real feita. */
  'plano.fecho.selo': 'O dia se fechou.',

  /* --- O CÍRCULO (04/09) -----------------------------------------------------------
   * A comunidade dentro do app. Opt-in com apelido; sobe apelido + dias
   * fechados + a palavra do mural, e NADA mais (Privacidade declara). O
   * contador conta e não julga; o ranking é de dias ACUMULADOS — nunca zera,
   * ninguém "cai": a mesma lei do fio (lib/hilo.js). */
  'circulo.rotulo': 'O CÍRCULO',
  'circulo.chamada': 'Tem mais gente neste caminho. Conhecer o Círculo',
  'circulo.membro': 'Você está no Círculo como {apelido}.',
  'circulo.fora': 'O Círculo não respondeu agora. O seu dia não depende dele.',
  'circulo.hoje': 'Hoje, {n} pessoas fecharam o dia com você.',
  'circulo.hoje.uma': 'Você abriu o Círculo de hoje — a primeira a fechar o dia.',
  'circulo.convite.corpo':
    'O Círculo é o salão de quem está no mesmo caminho das treze luas. Você escolhe um apelido — sem nome, sem e-mail, sem foto — e passa a ver quantas pessoas fecharam o dia, o mural de palavras e os dias de fio de cada uma.',
  'circulo.convite.campo': 'Escolha um apelido',
  'circulo.convite.entrar': 'Entrar no Círculo',
  'circulo.convite.falhou': 'O Círculo não respondeu agora. Tenta de novo daqui a pouco.',
  'circulo.convite.nota':
    'Sobe só isto: o apelido, os dias que você fechar e a palavra que soltar no mural. Está declarado em Privacidade.',
  'circulo.mural.rotulo': 'O MURAL DE HOJE',
  'circulo.mural.vazio': 'O mural de hoje ainda está em branco.',
  'circulo.mural.convite': 'Deixa uma palavra sobre o seu dia — uma só, anônima, junto das outras.',
  'circulo.mural.campo': 'uma palavra',
  'circulo.mural.soltar': 'Soltar no mural',
  'circulo.mural.recusada': 'Essa não entra no mural: só letras, uma palavra.',
  'circulo.ranking.rotulo': 'DIAS DE FIO — QUEM CAMINHA JUNTO',
  'circulo.ranking.dias': '{n} dias de fio',
  'circulo.ranking.nota':
    'Os dias somam e nunca zeram: quem parou uns dias continua com tudo o que andou.',
  /* SAIR, DENUNCIAR, OCULTAR (10/09): o que a loja exige quando ha conteudo de
   * outras pessoas. Denuncia vai para o servico do Circulo (o dono revisa);
   * ocultar e local; sair apaga o apelido e os dias no servidor. */
  'circulo.sair': 'Sair do Círculo',
  'circulo.sair.nota': 'Sair apaga o seu apelido, os seus dias e as suas palavras do Círculo. O seu fio aqui no telefone fica.',
  'circulo.sair.falhou': 'O Círculo não respondeu agora. Tenta sair de novo daqui a pouco.',
  'circulo.denuncia.abrir': 'Algum apelido ou palavra te incomodou? Denunciar ou ocultar',
  'circulo.denuncia.campo': 'O apelido ou a palavra',
  'circulo.denuncia.enviar': 'Denunciar',
  'circulo.denuncia.ocultar': 'Ocultar neste telefone',
  'circulo.denuncia.feita': 'Denúncia enviada. Uma pessoa revisa, e o que fere as regras sai do Círculo.',
  'circulo.denuncia.ocultado': 'Ocultado. Esse apelido não aparece mais para você.',
  'circulo.denuncia.falhou': 'Não deu agora. Confere o que você escreveu e tenta de novo.',
  'circulo.regras':
    'As regras do Círculo: um apelido, sem contato, sem link, sem ofensa. Quem fere isso sai.',
  'plano.missao.rotulo': 'A MISSÃO DE HOJE',
  'plano.missao.porque': 'POR QUE ISSO',
  'plano.missao.aceitar': 'Aceito a missão',
  'plano.missao.cumpri': 'Cumpri',
  'plano.missao.comoFoi': 'De 0 a 10, como foi?',
  'plano.missao.palavra': 'Uma palavra sobre como foi (se quiser).',
  'plano.missao.guardada': 'Missão de hoje cumprida e guardada, com a data.',
  'plano.missao.travadaContato':
    'A missão de hoje é sua, inteira: pelo que você marcou sobre o contato, nenhum passo daqui aponta para fora.',
  'plano.coracao.rotulo': 'O CORAÇÃO DE HOJE',
  'plano.coracao.pergunta': 'Como está o seu coração hoje?',
  'plano.coracao.leve': 'Leve',
  'plano.coracao.neutro': 'Neutro',
  'plano.coracao.pesado': 'Pesado',
  'plano.coracao.placar': '{n} de {total} manhãs leves nesta semana. Na semana passada, {antes}.',
  'plano.coracao.nota': 'Um toque, e é só seu. O placar conta; quem lê o número é você.',

  'plano.campo.escrevendo': 'escrevendo…',
  'plano.campo.guardado': 'Guardado neste telefone, com a data de hoje.',
  'plano.sonho.placeholder': 'O pedaço que ficou — do jeito que sair, sem arrumar.',
  'plano.sonho.nota':
    'O que você escrever aqui fica guardado com a data, por noventa dias. Ninguém mais lê.',

  /* --- A LEITURA DA BORRA (a visao, opt-in) --------------------------------------
   * O aviso e ANTES do toque e diz a unica coisa que importa: a foto sai do
   * telefone uma vez, para a leitura, e nao fica guardada. O recibo depois
   * diz quem leu. A privacidade lista o canal. */
  'mao.leitura.fotografar': 'Fotografar a minha palma',
  'mao.leitura.umToque': 'Fotografar e pedir a leitura',
  'mao.leitura.refazer': 'Fotografar de novo',
  'mao.leitura.pratica': 'A PRÁTICA DE HOJE',
  'mao.leitura.lendo': 'Lendo a sua palma…',
  'mao.leitura.lendoNota': 'A foto foi, a leitura vem. Leva uns segundos.',
  'mao.leitura.boton': 'Pedir a leitura da palma',
  'mao.leitura.aviso':
    'A foto é opcional. Ao pedir a leitura, ela sai do telefone uma vez, só para isso, e não fica guardada. Quem segue a linha com o dedo continua sendo você.',
  'mao.leitura.rotulo': 'A SEGUNDA OPINIÃO',
  'mao.leitura.recibo':
    'Lida por um modelo de visão, pela quiromancia tradicional como lente. Não é veredito — e a foto já morreu no caminho de volta.',
  'mao.leitura.cancelada': 'Sem foto — tudo bem: a linha e o dedo bastam.',

  'cafe.leitura.boton': 'Pedir a leitura da borra',
  'cafe.leitura.aviso':
    'Ao tocar, a foto sai do telefone uma vez, só para a leitura, e não fica guardada em lugar nenhum. Quem lê a xícara continua sendo você — isto é uma segunda opinião.',
  'cafe.leitura.rotulo': 'A SEGUNDA OPINIÃO',
  'cafe.leitura.recibo':
    'Lida por um modelo de visão, pela tasseografia tradicional. É lente, não veredito — e a foto já morreu no caminho de volta.',

  'mapa.rotulo': 'O MAPA DO ANO',
  'mapa.hojeSoDia': 'Hoje é o dia {n}.',
  'perfil.acceso.hilo': 'O meu fio — os dias em que você veio',
  'perfil.acceso.mao': 'A leitura da minha mão — com foto, se você quiser',
  'paywall.livre.nota':
    'Nesta versão, tudo isto está aberto — é só entrar. A assinatura chega mais adiante, e nada do que é seu muda quando chegar.',
  'perfil.suscripcion.livre':
    'Tudo aberto nesta versão. A assinatura chega mais adiante — e nada do que é seu muda quando chegar.',
  'mapa.abrir': 'Ver o mapa do ano',
  'mapa.hoje': 'Hoje é o dia {n}, na lua {lua}.',
  'mapa.como':
    'Cada casa é um dia, e cada dia se abre raspando — no plano, um por vez. A de hoje está com o fio vivo; a de ontem ainda aceita o dedo, se ficou fechada.',
  'mapa.lua': 'LUA {lua}',
  'mapa.abrirDia': 'Abrir o dia {n}',
  'mapa.semAncora':
    'O seu mapa nasce quando o seu ano começa — na primeira lua nova depois da sua leitura. Ele aparece aqui sozinho, com as suas trezentas e sessenta e cinco casas.',
  'mapa.pe':
    'Casa apagada é só um dia que passou. O ano não cobra nada: a lua segue, e a casa de hoje abre igual.',

  /* --- O VEU DO DIA ----------------------------------------------------------------
   * A orquestracao do plano (decisao do dono, 01/09, no molde do Heat Game): o
   * cartao do ritual nasce COBERTO pela mesma lamina do funil, e a pergunta, a
   * frase, o encontro e o ritmo so montam DEPOIS que ela raspou. Um dia por vez,
   * na ordem: primeiro o fazer, depois o resto. O raspado vale so para o dia —
   * amanha o veu volta, e e isso que faz a abertura do app ter gosto de abrir
   * alguma coisa. */
  'plano.veu.raspe': 'Raspe para abrir o seu dia',
  'plano.veu.abrir': 'Abrir sem raspar',
  'plano.veu.anuncio': 'O dia abriu. O ritual de hoje está na tela.',

  'plano.ritmo.rotulo': 'O RITMO DE VOCÊS DOIS',
  'plano.ritmo.venus':
    'Sexta é o dia de Vênus no calendário antigo — o dia do desejo. É o único dia da semana em que este bloco abre.',
  'plano.ritmo.convite':
    'Se você quiser, me diga o signo dessa pessoa. Só o signo: um entre doze, sem nome, sem data, sem identificar ninguém. Com ele eu leio o ritmo de vocês dois — como acende, como conversa, como briga.',
  'plano.ritmo.naoHoje': 'Hoje não',
  'plano.ritmo.par': '{dela} e {daPessoa} — {figura}.',
  'plano.ritmo.cama': 'NA CAMA',
  'plano.ritmo.conversa': 'NA CONVERSA',
  'plano.ritmo.briga': 'NA BRIGA',
  'plano.ritmo.falar': 'QUANDO HOUVER CONVERSA',
  'plano.ritmo.limites':
    'Isto é uma lente, não um veredito: dois signos solares não decidem nada — quem decide são duas pessoas. Nada aqui afirma o que essa pessoa sente.',
  'plano.ritmo.trocar': 'Trocar o signo',
  'plano.ritmo.fonte': 'Ptolomeu, Tetrabiblos I.13 e I.16 — as figuras entre os signos',
  'plano.ritmo.fonteNota':
    'A leitura em prosa vem da tradição que Linda Goodman popularizou em 1968 — prosa, sem porcentagem: número aqui viraria veredito, e figura não é destino.',

  'plano.tela.encontro.travado': 'TRAVADO HOJE',
  'plano.tela.encontro.ajustes': 'Abrir Ajustes',

  'plano.tela.compartir': 'Compartilhar o card de hoje',
  'plano.tela.compartir.falhou': 'Não deu para abrir o compartilhamento neste aparelho.',
  /* Vai junto no card. É a linha que impede o print de virar promessa dentro da
   * conversa de outra pessoa — a versão portuguesa de 'tirada.avisoOtraPersona'. */
  'plano.tela.compartir.aviso':
    'Nenhuma carta lê a outra pessoa. Essa ponta do fio não está neste app.',

  'plano.semana.nomes': [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ],
  'plano.semana.em': [
    'no domingo',
    'na segunda-feira',
    'na terça-feira',
    'na quarta-feira',
    'na quinta-feira',
    'na sexta-feira',
    'no sábado',
  ],

  /* --- LEITURAS (o que a xícara e a mão têm em comum) -----------------------------
   * As duas telas de leitura — screens/RitualCafeScreen.js e
   * screens/RitualMaoScreen.js — terminam igual: uma figura escolhida por ELA, o
   * que a tradição registra sobre aquela forma (com obra, autor e quando), uma
   * pergunta que fica, e o nó do dia no fio. Este bloco é a moldura compartilhada;
   * o conteúdo das figuras e das linhas mora em datos/lecturas.js.
   *
   * 'leituras.fio.nota' é a linha mais importante das treze: ela diz o que o app
   * NÃO guardou. As telas só chamam atarNudo() (lib/hilo.js), e a figura escolhida
   * não é gravada em lugar nenhum — dizer "sua leitura ficou salva" seria a
   * mentira barata que nenhuma outra linha do app comete. */
  'leituras.tradicion.rotulo': 'DE QUANDO É ISTO',
  'leituras.fonte.rotulo': 'A OBRA',
  'leituras.fonte': '{obra}, de {autor} — {quando}',
  'leituras.semFonte.rotulo': 'SEM FONTE ANTIGA',
  'leituras.pergunta.rotulo': 'A PERGUNTA QUE FICA',
  'leituras.pergunta.nota':
    'A pergunta não tem resposta certa e o app não recolhe nenhuma. Ela fica com você.',
  'leituras.comoE.rotulo': 'COMO RECONHECER',

  'leituras.fio.boton': 'Marcar o dia no meu fio',
  'leituras.fio.hecho': 'Pronto. O dia de hoje está marcado no seu fio.',
  'leituras.fio.nota':
    'Só a marca do dia entrou no fio. A figura que você escolheu e o que você pensou aqui não ficam gravados em lugar nenhum.',
  'leituras.fio.erro':
    'Não deu para gravar neste telefone. O que está na tela continua aqui enquanto você não sair.',
  'leituras.otra': 'Escolher outra',
  'leituras.volver': 'Voltar',

  /* --- CAFÉ: O RITUAL DA XÍCARA --------------------------------------------------
   * O gesto proprietário do app (docs/RITUAL-DA-XICARA.md). Três coisas desta copy
   * são inegociáveis e cada uma tem a sua chave:
   *
   *   'cafe.foto.aviso'     — a frase que sustenta o desenho inteiro. Sem servidor
   *                           de visão, fingir que o app "lê" a borra seria a
   *                           mentira mais cara possível neste nicho. A saída é
   *                           melhor que a análise: quem lê é ela.
   *   'cafe.foto.nuncaSai'  — a foto não sobe, não é analisada e não é gravada.
   *   'cafe.permiso.*'      — a pré-permissão desenhada. O diálogo do sistema só
   *                           pode ser aberto UMA vez por instalação; por isso o
   *                           app explica antes o que vai ser perguntado, e diz na
   *                           mesma tela que dizer não não quebra nada.
   *
   * 'cafe.foto.semCanal' é o estado honesto de um aparelho sem a dependência de
   * câmera instalada: a etapa some (não aparece apagada) e o caminho sem foto vira
   * o principal — que é como o ritual foi desenhado desde o começo. */
  'cafe.sobreceja': 'O RITUAL DA XÍCARA',
  'cafe.titulo': 'A borra do café',
  'cafe.pasos.rotulo': 'COMO FAZER',
  'cafe.foto.rotulo': 'A FOTO',
  'cafe.foto.aviso':
    'A foto é sua. Quem lê a xícara é você — o app organiza o que a tradição diz sobre a figura que você viu.',
  'cafe.foto.nuncaSai':
    'A foto não sai deste telefone nem fica gravada: ela vive nesta tela e some quando você sai daqui. Só sai uma vez, e só se você pedir a leitura da borra.',
  'cafe.foto.opcional':
    'A foto é opcional. Dá para ir direto para as figuras, olhando a xícara de verdade na sua frente.',
  'cafe.foto.semCanal':
    'Neste aparelho o app não consegue abrir a câmera. O ritual funciona igual sem ela: olhe a xícara e escolha a figura.',
  'cafe.boton.foto': 'Fotografar a xícara',
  'cafe.boton.galeria': 'Usar uma foto já tirada',
  'cafe.boton.semFoto': 'Seguir sem foto',

  'cafe.permiso.sobreceja': 'ANTES DE O TELEFONE PERGUNTAR',
  'cafe.permiso.titulo': 'Quem pede a câmera é o sistema',
  'cafe.permiso.cuerpo':
    'O pedido vem do próprio aparelho, não do app: ele pergunta se a câmera pode ser usada para você fotografar a xícara, e nada além disso.',
  'cafe.permiso.nota':
    'Dizer não aqui não quebra nada: o ritual segue inteiro sem foto. Este pedido não aparece de novo sozinho.',
  'cafe.permiso.boton': 'Pode perguntar',
  'cafe.permiso.negado':
    'Sem acesso à câmera, tudo bem: escolha a figura olhando a xícara de verdade. Se você mudar de ideia, o acesso se reabre nos ajustes do telefone.',
  'cafe.permiso.cancelado': 'A foto não foi tirada. Você pode tentar de novo ou seguir sem ela.',

  'cafe.previa.rotulo': 'A SUA XÍCARA',
  'cafe.previa.nota': 'Esta foto está só aqui, nesta tela.',
  'cafe.previa.boton': 'Escolher a figura',
  'cafe.previa.otra': 'Tirar outra',

  'cafe.figura.sobreceja': 'A FIGURA',
  'cafe.figura.titulo': 'O que você viu na borra?',
  'cafe.figura.instruccion':
    'Olhe o desenho por alguns segundos antes de decidir. Toque na figura mais perto do que você enxergou.',
  'cafe.figura.nadaEncaixa':
    'Se nada aqui encaixa, isso também é uma resposta: nenhuma lista de figuras cobre o que uma borra faz. Sair sem escolher é uma opção legítima.',
  'cafe.lectura.sobreceja': 'O QUE A TRADIÇÃO DIZ',

  /* --- MÃO: A LINHA DA PRÓPRIA MÃO -----------------------------------------------
   * Mesma lógica da xícara, e SEM CÂMERA — não por limite, por decisão. Foto de mão
   * é dado biométrico numa ficha de loja, e o gesto não fica melhor por causa dela.
   * 'mao.semCamera' diz isso na tela em vez de deixar a ausência parecer um recurso
   * que faltou implementar.
   *
   * 'mao.aviso.saude' é obrigatório e fica sempre visível: os manuais de quiromancia
   * falam de tempo de vida e de corpo o tempo todo, e esta é a linha que impede a
   * tradição citada de escorregar para alegação de saúde. */
  'mao.sobreceja': 'A LINHA DA PRÓPRIA MÃO',
  'mao.titulo': 'A sua palma',
  'mao.pasos.rotulo': 'COMO FAZER',
  'mao.semCamera':
    'Aqui não tem foto. A sua mão não é fotografada, não é medida e não é analisada — você abre a palma, olha, e escolhe a linha que quer ler.',
  'mao.aviso.saude':
    'Nenhuma linha da mão informa sobre o corpo de ninguém. Isto é um desenho que você olha, e nada aqui substitui exame médico.',
  'mao.boton.comecar': 'Escolher uma linha',
  'mao.linha.sobreceja': 'AS QUATRO LINHAS',
  'mao.linha.titulo': 'Qual linha você quer ler hoje?',
  'mao.linha.instruccion':
    'Abra a mão que você usa menos, sob uma luz direta. Toque na linha que puxar o seu olho primeiro.',
  'mao.linha.onde.rotulo': 'ONDE ELA FICA',
  'mao.lectura.sobreceja': 'O QUE A TRADIÇÃO DIZ',

  /* --- O ANO DAS TREZE LUAS -------------------------------------------------------
   * A copy de tela do arco de treze lunações. O motor mora em lib/ano.js, a tabela
   * dos temas em datos/lunacoes.js, os quatro tons de semana em datos/fases.js e os
   * três bancos do dia em datos/bancos.js. A lista fechada do que o motor emite é
   * CLAVES_TEXTO_ANO (lib/ano.js), e é contra ela que test/madremaria-ano.test.js confere que
   * nenhuma destas chaves falta — sem isso a tela renderiza 'ano.lunacao.7.abertura'
   * como texto, que é o modo de falhar deste dicionário.
   *
   * AS QUATRO LINHAS QUE NENHUMA DESTAS FRASES ATRAVESSA, e elas são de um plano de
   * 365 dias, não de um de 7:
   *
   *  1. CHEGAR AO FIM NÃO PRODUZ NADA. Nenhuma frase liga completar o arco a um
   *     desfecho: nada de "no fim do ano você vai entender", nada de "quando o ciclo
   *     fechar, o resto se acomoda". O ano é FORMA (treze perguntas, a lua fechando
   *     voltas, o espelho no fim), nunca resultado. Nenhum tema é etapa; todo tema é
   *     pergunta.
   *  2. O FIM NÃO DÁ VEREDITO. A lunação 13 não diz "supere e siga" e não sugere
   *     volta: ela devolve a linha da lunação 1, com a data, e pergunta. O app não
   *     sabe qual dos dois desfechos vem, e não vota em nenhum.
   *  3. A LUA DESCREVE O DIA E NÃO AGE SOBRE NINGUÉM. Em nenhuma frase de fase a
   *     outra pessoa aparece como sujeito de verbo — é a contenção estrutural, e ela
   *     pega o que lista de palavra proibida não pega ("na crescente ela se
   *     aproxima" não tem uma única palavra vetada).
   *  4. NÃO SE COBRA DIA PERDIDO. Não há percentual, não há "faltam N lunações",
   *     não há "você perdeu 40 dias". O tema sai da LUA, não da assiduidade: quem
   *     volta no dia 200 encontra o tema do dia 200, sem fatura. Vale a doutrina de
   *     NUDOS em datos/ritual.js e o retorno mudo de lib/hilo.js.
   *
   * Os treze títulos e as treze perguntas saem verbatim de TEMAS (lib/ano.js) e de
   * LUNACOES (datos/lunacoes.js). Os dois arquivos são conferidos um contra o outro
   * em test/madremaria-ano.test.js: duas tabelas que podem discordar acabam discordando. */
  'ano.lunacao.1.titulo': 'Nomear o que foi',
  'ano.lunacao.2.titulo': 'A rotina que sobrou',
  'ano.lunacao.3.titulo': 'O que já era meu',
  'ano.lunacao.4.titulo': 'A vontade tem hora',
  'ano.lunacao.5.titulo': 'Sei ou suponho',
  'ano.lunacao.6.titulo': 'O tamanho da parte',
  'ano.lunacao.7.titulo': 'Os outros fios',
  'ano.lunacao.8.titulo': 'A raiva não dita',
  'ano.lunacao.9.titulo': 'O que eu quero',
  'ano.lunacao.10.titulo': 'Confiar de novo',
  'ano.lunacao.11.titulo': 'O que se diz',
  'ano.lunacao.12.titulo': 'O ano por dentro',
  'ano.lunacao.13.titulo': 'A mesma lua',

  'ano.lunacao.1.pergunta': 'O que aconteceu, dito com as suas palavras e sem arrumar a frase?',
  'ano.lunacao.2.pergunta': 'Como é um dia seu agora, do acordar até apagar a luz?',
  'ano.lunacao.3.pergunta': 'O que era seu antes desse vínculo e continua sendo seu?',
  'ano.lunacao.4.pergunta': 'A que horas a vontade de dizer alguma coisa aperta em você?',
  'ano.lunacao.5.pergunta': 'Onde termina o que você sabe e começa o que você reconstrói de cabeça?',
  'ano.lunacao.6.pergunta': 'Qual foi a sua parte, dita sem aumentar e sem diminuir?',
  'ano.lunacao.7.pergunta': 'Quem mais está na sua vida, e há quanto tempo você não olha para isso?',
  'ano.lunacao.8.pergunta': 'O que ficou sem ser dito do lado da raiva?',
  'ano.lunacao.9.pergunta': 'O que você quer, dito sem citar ninguém?',
  'ano.lunacao.10.pergunta': 'O que você precisaria para confiar de novo — em quem for?',
  'ano.lunacao.11.pergunta': 'O que você diria, e o que fica sendo só seu?',
  'ano.lunacao.12.pergunta': 'O que este ano guardou de você, na sua letra?',
  /* "está fechando", e não "fechou": esta pergunta fica na tela a lunação inteira, e
   * na lua nova que abre a décima terceira só DOZE lunações se fecharam. A volta de
   * treze fecha na lua nova seguinte — que é ANIVERSARIO_LUNAR em lib/ano.js,
   * `lunacaoAbsoluta === 14`. Dizer "fechou" aqui seria fabricar céu por um mês. */
  'ano.lunacao.13.pergunta': 'A lua está fechando uma volta. Qual pergunta você quer abrir na próxima?',

  /* As aberturas entram na LUA NOVA de cada lunação — a fase 1 de datos/fases.js. */
  'ano.lunacao.1.abertura':
    'Esta lunação começa pelo começo: o que aconteceu, escrito por você, do jeito que sair. Não precisa ficar bonito nem fazer sentido para mais ninguém — fica neste aparelho.',
  'ano.lunacao.2.abertura':
    'Depois de nomear o que foi, sobra uma coisa de vinte e quatro horas de comprimento: a terça-feira. Esta lunação olha para a forma do seu dia, não para a história.',
  'ano.lunacao.3.abertura':
    'Esta lunação pede coisas concretas e não conceitos: o café, o caminho, a música, a amizade. O material vem do mês que passou, que já está anotado aqui.',
  'ano.lunacao.4.abertura':
    'A vontade de dizer alguma coisa costuma ter horário, e cada pessoa tem o seu. Esta lunação não pede contenção: pede que você repare qual é o seu.',
  'ano.lunacao.5.abertura':
    'Nenhuma carta lê essa pessoa, e este aparelho também não. O que dá para fazer é separar o que você sabe do que você vem supondo.',
  'ano.lunacao.6.abertura':
    'A sua parte não é a história inteira, e também não é nada. Esta lunação pede o tamanho dela, com as duas metades na mesma tela.',
  'ano.lunacao.7.abertura':
    'Esta lunação inteira não é sobre essa pessoa: é inventário do que já existe. A irmã, o colega, a vizinha, o grupo que ficou parado em março.',
  'ano.lunacao.8.abertura':
    'Esta lunação abre um lugar para o que ficou sem ser dito do lado da raiva. Não estar com raiva neste mês é resposta legítima, e o dia continua igual.',
  'ano.lunacao.9.abertura':
    'A regra desta lunação é uma só: escrever o que você quer sem citar ninguém. O app não sabe o que você deveria querer, e não vota.',
  'ano.lunacao.10.abertura':
    'A formulação desta lunação é "em quem for", e ela vale em todo dia daqui até a próxima lua nova. Confiança aqui é capacidade geral, não preparação para uma conversa específica.',
  'ano.lunacao.11.abertura':
    'Esta lunação trabalha os dois lados do limite: o que se diz e o que fica sendo só seu. A carta que não se envia conta igual.',
  'ano.lunacao.12.abertura':
    'Esta lunação é arquivo. O app abre o que você escreveu, lunação por lunação, com as datas, e não resume nada.',
  /* O fato medido no lugar da conclusão — e ele é sobre o CÉU, nunca sobre a vida de
   * quem lê. Mesmo motivo da pergunta acima: a volta ainda está fechando. */
  'ano.lunacao.13.abertura':
    'Esta é a décima terceira lunação, e é ela que fecha a volta. Doze lunações somam 354 dias, treze somam 384 e o ano civil tem 365: a lua e o calendário não fecham juntos, e nunca fecharam.',

  /* --- OS QUATRO TONS DE SEMANA ---------------------------------------------------
   * Quatro quadraturas, e nunca oito. As quatro têm fonte primária (Ptolomeu,
   * Tetrabiblos I.8); as oito fases com leitura psicológica são de Dane Rudhyar,
   * 1967 — coisa boa, do século XX e declaradamente autoral. Expandir para oito
   * derruba a base de fonte junto.
   *
   * O tom muda o FORMATO do dia, não só as palavras: nova é curta e de um pedido só,
   * crescente repete o gesto anterior, cheia é a única que pede escrita, minguante
   * subtrai. São quatro desenhos de tela girando a cada ~7 dias, e é isso que impede
   * o dia 40 de parecer o dia 12.
   *
   * Em nenhuma das oito frases abaixo a outra pessoa aparece — nem como sujeito, nem
   * como complemento. A crescente não faz nada crescer entre ninguém: o que cresce,
   * quando cresce, é o registro dela, e isso é contável na tela sem metáfora. */
  'ano.fase.comecar-no-escuro.tom': 'Começar no escuro',
  'ano.fase.comecar-no-escuro.pede': 'Um gesto pequeno, começado hoje, que não produz nada visível hoje.',
  'ano.fase.sustentar.tom': 'Sustentar o que já começou, sem aumentar',
  'ano.fase.sustentar.pede': 'Refazer o gesto da fase anterior mais uma vez, do mesmo tamanho.',
  'ano.fase.o-que-ja-da-para-ver.tom': 'O que já dá para ver',
  'ano.fase.o-que-ja-da-para-ver.pede': 'Registrar por escrito uma coisa que já dá para ver sem interpretar.',
  'ano.fase.tirar.tom': 'Tirar, cortar, deixar secar',
  'ano.fase.tirar.pede': 'Tirar uma coisa concreta do dia — uma aba aberta, um horário, um objeto, uma conferida.',

  /* --- A VIRADA DO TEMA -----------------------------------------------------------
   * MARCO LUNAR MEDIDO, e nada além disso. Não é contagem regressiva: não existe
   * "faltam 4 lunações para" nem véspera de acontecimento nenhum. Por isso as duas
   * frases dizem o que a LUA faz e o que o APP faz — nunca o que vai acontecer.
   * A tela também não põe este marco no mesmo bloco visual do bloco de encontro:
   * data medida a dois centímetros de um texto sobre reconciliação deixa de ser
   * medida sem uma palavra proibida aparecer. */
  'ano.virada.hoje': 'Hoje a lua nova fecha esta lunação. O tema muda a partir de agora.',
  'ano.virada.dia': 'A lua nova fecha esta lunação no dia {dia}. O tema muda ali.',

  /* --- O ARQUIVO (lunação 12) -----------------------------------------------------
   * Aqui o app é índice, não intérprete: ele abre o que ela escreveu, com a data, e
   * não resume, não compara e não conclui.
   *
   * 'ano.arquivo.vazio' é a linha anti-culpa deste arco inteiro, e ela é a mais fácil
   * de escrever errado. Nada de "você deixou 12 lunações em branco", nada de oferta
   * de recuperar atrasado: lunação sem nada escrito é lunação sem nada escrito, e o
   * retorno é MUDO — sumir um dia e sumir trinta dão o mesmo texto. */
  'ano.arquivo.titulo': 'O que você escreveu',
  'ano.arquivo.vazio':
    'Nesta lunação não ficou nada escrito. Não há o que recuperar e não há atraso: o arquivo mostra o que existe, e segue.',

  /* --- ERRORES -------------------------------------------------------------------
   * Alinhados com lib/almacen.js: quando o disco falha, a sessao inteira passa a
   * viver em memoria. A tela nao mente dizendo "guardado". */
  'errores.guardado':
    'Não deu para guardar neste telefone. A sua leitura continua na tela enquanto você não fechar.',
  'errores.compartir': 'Não deu para abrir o compartilhamento. Tente de novo.',
  'errores.generico': 'Algo deu errado deste lado. Tente de novo.',
});

/* =================================================================================
 * OS OUTROS DOIS IDIOMAS
 * =================================================================================
 * Import estatico, nao dinamico: o bundler do Expo (Metro) precisa ver as tres
 * pontas em tempo de build, e um `await import()` aqui tornaria t() assincrono —
 * o que derrubaria as 47 telas e libs que chamam t() de dentro de um render.
 * Hoje os dois objetos estao VAZIOS; cada chave que um tradutor preenche entra em
 * producao sem nenhuma mudanca neste arquivo. */
import { ES } from './textos.es.js';
import { EN } from './textos.en.js';

/* =================================================================================
 * API
 * ================================================================================= */

/* O mapa, no mesmo molde do DICTS de lib/i18n.js do Cosmic. */
const DICTS = { pt: PT, es: ES, en: EN };

/* Exportado SO para o portao de cobertura (test/madremaria-i18n.test.js), igual ao
 * _DICTS_FOR_TESTS do Cosmic. Nenhuma tela le isto: tela chama t(). */
export const _DICTS_PARA_TESTE = DICTS;

/* Os tres idiomas que a Madre fala, nesta ordem. Nao e importado de lib/i18n.js do
 * Cosmic de proposito: este arquivo roda em node:test puro, e o i18n.js do Cosmic
 * arrasta 800 KB de dicionario que nenhum teste de lib da Madre precisa carregar.
 * test/madremaria-i18n.test.js e quem confere que as duas listas nao divergiram. */
export const IDIOMAS = ['pt', 'es', 'en'];
export const IDIOMA_PADRAO = 'pt';

/* =================================================================================
 * REDESENHO — por que um espelho de modulo, e nao um contexto
 * =================================================================================
 * t() e importado no escopo de MODULO em 47 arquivos, e metade deles e logica pura
 * (lib/plano.js, lib/missoes.js, lib/ano.js...) exercitada por node:test SEM React.
 * Virar hook obrigaria a reescrever os 47 e mataria essas suites de uma vez.
 *
 * Entao a dependencia anda no sentido contrario, exatamente como o Cosmic ja faz
 * com lib/aiClient.js (ver context/LanguageContext.js, `setLanguageProvider`): o
 * provider EMPURRA o idioma para ca, e t() le o espelho na hora da chamada.
 *
 * O espelho sozinho nao redesenha nada — React nao observa variavel de modulo. Quem
 * redesenha e a REMONTAGEM: MadreMariaApp.js le `lang` do useLanguage() do Cosmic e
 * poe `key={lang}` na arvore da Madre. Trocar de idioma no seletor do Perfil
 * descarta a arvore inteira e monta outra, com todo t() reavaliado. E bruto de
 * proposito: memoizar 19 telas por idioma seria 19 chances de uma tela ficar em
 * portugues depois da troca, e trocar de idioma nao e gesto de cada frame.
 * ================================================================================= */

let idiomaAtivo = IDIOMA_PADRAO;

/** Chamado pelo LanguageProvider do Cosmic. Idioma que nao falamos e ignorado:
 *  melhor seguir no idioma anterior do que cair em dicionario inexistente. */
export function setIdiomaMadre(lang) {
  if (IDIOMAS.includes(lang)) idiomaAtivo = lang;
}

/** O idioma que t() esta usando agora. So leitura — quem grava e o provider. */
export function idiomaMadre() {
  return idiomaAtivo;
}

const RE_VAR = /\{(\w+)\}/g;

/* Marcador sem valor fica na tela como {nombre}: bug que QA ve na hora. O oposto —
 * trocar por string vazia — produz "Ate aqui vai a leitura, ." e passa batido. */
function interpolar(texto, vars) {
  if (!vars) return texto;
  return texto.replace(RE_VAR, (marca, nombre) =>
    Object.prototype.hasOwnProperty.call(vars, nombre) && vars[nombre] != null
      ? String(vars[nombre])
      : marca
  );
}

/* O valor CRU da chave no idioma pedido, com o fallback ja resolvido e sem
 * interpolar. Uma funcao so, porque t() e lista() tem de concordar sobre o que
 * "existe" quer dizer.
 *
 * `=== undefined` e nao `||`: string vazia em ES NAO cai no PT escondido. Ela e um
 * defeito de traducao, e o portao de cobertura e quem reclama dela — se caisse no
 * fallback, a tradutora veria portugues na tela e concluiria que o arquivo dela nao
 * salvou. */
function valorDe(clave, lang) {
  const dict = DICTS[lang] || DICTS[IDIOMA_PADRAO];
  const valor = dict[clave];
  if (valor !== undefined && valor !== null) return valor;
  const pt = PT[clave];
  if (pt !== undefined && pt !== null) return pt;
  return undefined;
}

/**
 * t('sintesis.saludo', { nombre: 'Ana' }) -> 'Ana, isto e o que ficou sobre a mesa.'
 * O NOME DA VARIAVEL CONTINUA {nombre}, e nao {nome}: quem chama t() passa por
 * esse nome. Traduzir o marcador quebraria a interpolacao em silencio — e o portao
 * de cobertura confere que ES e EN usam os MESMOS marcadores do PT.
 *
 * OS TRES CAMINHOS, nesta ordem:
 *   1. chave traduzida no idioma ativo    -> o texto de la;
 *   2. chave sem traducao no idioma ativo -> o PORTUGUES (fallback honesto: nunca
 *      a chave crua na cara da pessoa, nunca texto inventado);
 *   3. chave que nao existe em idioma nenhum -> a propria chave, como sempre foi.
 *
 * Nunca lanca, nunca devolve undefined.
 * Chave de valor array (limites.lineas) devolve um array novo, ja interpolado — em
 * qualquer idioma, porque o portao exige que array continue array nos tres.
 */
export function t(clave, vars) {
  const valor = valorDe(clave, idiomaAtivo);
  if (valor === undefined) return String(clave);
  if (Array.isArray(valor)) return valor.map((linea) => interpolar(linea, vars));
  return interpolar(valor, vars);
}

/** Para teste de cobertura de chave: nenhuma tela deveria chamar t() de chave morta.
 *  Pergunta sobre o CONJUNTO de chaves do app, que e o do PT — uma chave existe ou
 *  nao existe independente de estar traduzida. */
export function existe(clave) {
  return Object.prototype.hasOwnProperty.call(PT, clave);
}

/** Lista de todas as chaves. Usada pelo teste que varre as telas. */
export function claves() {
  return Object.keys(PT);
}

/** O array CRU de uma chave-lista, no idioma ATIVO e com fallback para PT.
 *  Existe porque lib/plano.js e lib/proximaLua.js precisam de `ritual.meses` e
 *  `plano.semana.nomes` como ARRAY indexavel, e t() interpolaria. Antes eles liam
 *  `T['ritual.meses']` direto — o que, com tres idiomas, congelaria o calendario
 *  em portugues para sempre.
 *  Chave que nao e lista devolve [] (nunca undefined: quem chama indexa). */
export function lista(clave) {
  const valor = valorDe(clave, idiomaAtivo);
  return Array.isArray(valor) ? valor : [];
}

/* T continua exportado e continua sendo O PORTUGUES, de proposito:
 *   · os testes de doutrina varrem T (plano, ritual) e varrem a copy que a regra
 *     descreve, que e a portuguesa — a regra nasce em PT e as traducoes a herdam;
 *   · o portao de cobertura precisa de um lado fixo para comparar.
 * Quem precisa do texto que a PESSOA ve chama t(); quem precisa de array chama
 * lista(). Ler T esperando o idioma ativo e o erro que lista() existe para evitar. */
export const T = PT;

export default PT;
