// lib/ano.js
// O CALENDARIO DAS 13 LUAS — o arco de um ano do Fio Vermelho.
//
// ===========================================================================
// O QUE ESTE ARQUIVO E, EM UMA FRASE
// ===========================================================================
// Ele responde tres perguntas e nenhuma outra: em que LUNACAO ela esta, em que
// PONTO do arco ela esta, e QUANDO o tema muda. Nao escolhe carta, nao escolhe
// ritual, nao escreve texto, nao grava nada. E aritmetica sobre um ceu medido.
//
// ===========================================================================
// A DECISAO QUE DEFINE O ARQUIVO: 13 LUNACOES, NAO 365 CASAS
// ===========================================================================
// A implementacao obvia de "um plano de um ano" e um vetor de 365 posicoes
// indexado pelo dia da instalacao. Ela e mais simples, e esta ERRADA aqui, por
// uma razao que nao e estetica:
//
//   Doze lunacoes somam 354,37 dias. Treze somam 383,90. O ano tropico tem
//   365,2422. Os tres numeros sao diferentes e sempre foram — e essa defasagem
//   de ~11 dias por ano e exatamente o que produz o ciclo metonico (19 anos =
//   235 lunacoes, quando as fases voltam as mesmas datas do calendario).
//
// Um calendario de 365 casas que se diz lunar precisa mentir sobre a lua em
// algum ponto do ano — ou esticando lunacoes para caber, ou anunciando "a mesma
// lua voltou" numa data civil em que ela esta 11 dias adiantada. Aqui o tema sai
// da LUA MEDIDA. O ano civil e que fica torto, e isso e o certo: a lua nao deve
// nada ao calendario.
//
// Consequencias, todas assumidas:
//   - o tema 13 abre por volta do dia 355 e fecha por volta do dia 384, FORA do
//     primeiro ano civil;
//   - no ano 2 os blocos (tema, fase) caem ~11 dias antes das datas do ano 1;
//   - nao existe "aniversario de um ano de app" com lua fechando volta. Se um
//     dia alguem quiser esse marco, ele e a 13a lua nova MEDIDA, com data, ou
//     ele nao existe. Ver ANIVERSARIO_LUNAR no fim do arquivo.
//
// ===========================================================================
// DUAS PESSOAS, O MESMO ARCO, CEUS DIFERENTES
// ===========================================================================
// Quem comeca em 3 de marco e quem comeca em 19 de novembro vivem a MESMA
// estrutura — os mesmos 13 temas, na mesma ordem, com os mesmos quatro tons de
// semana. O que muda e a ancora: a lunacao 1 de cada uma e a lunacao real que
// estava correndo no ceu quando ela chegou. Por isso a numeracao e sempre
// relativa a um inicio de jornada, e por isso ela NUNCA e inventada quando esse
// inicio nao foi informado (ver SEM_INICIO_DA_JORNADA).
//
// ===========================================================================
// A REGRA HERDADA DE ceu.js: NUNCA FABRICAR CEU
// ===========================================================================
// Sem efemeride, este modulo devolve `disponivel: false` com motivo, e NENHUM
// numero de lunacao. Nao existe "lunacao aproximada" apresentavel. O que existe
// e uma APROXIMACAO INTERNA, declarada, para que o plano do dia continue tendo
// um tema quando o ceu nao pode ser medido — e ela vem marcada em campo proprio,
// com `apresentavelComoLua: false` gravado no objeto. Ver posicaoNoAno.
//
// A diferenca entre os dois nao e de grau, e de natureza:
//   `lunacao: 4`                      -> medi a lua. Ela esta na quarta lunacao.
//   `aproximacao.lunacao: 4`          -> NAO medi nada. Dividi dias por 29,53.
// A segunda nunca pode chegar a tela dizendo "lua". Ela existe para o app ter o
// que fazer, nao para ter o que afirmar.
//
// ===========================================================================
// UMA ANCORA SO: MEIO-DIA LOCAL (a mesma de ceu.js)
// ===========================================================================
// De quem e o dia em que a lua nova cai as 15h? Do tema velho ou do novo?
// A resposta tinha de ser UMA, e ela e a que ceu.js ja usa para rotular fase: o
// MEIO-DIA LOCAL. Se a lua nova caiu depois do meio-dia, o dia ainda pertence a
// lunacao que estava acabando; o tema novo abre no dia seguinte.
//
// Isso NAO e arredondamento nem estimativa: o instante exato da lua nova sai
// medido e aparece inteiro em `fim.iso`. O que a ancora decide e so a que DIA
// CIVIL a virada pertence — e essa decisao precisa ser unica no app inteiro, ou
// a tela do plano diz "tema 5" enquanto o calendario diz "tema 4" no mesmo dia.
// O molde ja teve tres ancoras concorrentes e mostrou duas fases da lua ao mesmo
// tempo. Aqui e uma, e ela sai declarada em `ancoraDoDia`.
//
// `proximaVirada` respeita a mesma ancora, e e por isso que ela devolve
// `diaDaVirada` alem do instante: no dia em que a lua nova cai as 15h, o
// instante e HOJE mas a virada do tema e AMANHA. Devolver so `faltamDias: 0`
// ali seria verdade sobre o ceu e mentira sobre o app.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO TOCA astronomy-engine DIRETO
// ===========================================================================
// ceu.js e a porta do ceu do DIA, e ele resolve bem o que promete. Mas ele nao
// expoe o que este arquivo precisa: a lua nova ANTERIOR a um instante. Ele so
// olha para frente (`proximoMarcoLunar`, `proximaNova`), e olhar para frente nao
// da o INICIO da lunacao corrente — da o fim dela.
//
// Havia tres saidas. Alterar ceu.js (nao: ele e de outro fluxo e nao se
// sobrescreve arquivo de outro agente). Chamar `ceuDoDia` em datas recuadas ate
// a lua nova aparecer (nao: cada chamada calcula a retrogradacao de OITO
// planetas, e o resultado ainda tem borda errada quando a lua nova caiu nas
// ultimas 17 horas). Ou sondar o motor aqui, para UMA funcao.
//
// E a terceira, com duas amarras que mantem a doutrina inteira:
//   1. a sonda e a mesma de ceu.js (confere que as funcoes existem antes de
//      chamar), e este arquivo usa SOMENTE SearchMoonPhase e MakeTime;
//   2. `motorDoAno()` comeca perguntando `hayEfemeride()` para ceu.js. Se ceu.js
//      esta as escuras — de verdade ou por injecao de teste — este arquivo fica
//      as escuras junto. Os dois nunca discordam sobre haver ceu.
// Todo o resto (dia local, validacao, distancia em dias, rotulo de fase) vem
// importado de ceu.js. Nao ha uma segunda implementacao de nada aqui.

import * as MOTOR_REAL from 'astronomy-engine';

import {
  diaLocal,
  diasEntre,
  diasDesdeEpoca,
  esDiaValido,
  faseDoDia,
  hayEfemeride,
  meioDiaLocal,
  MOTIVOS as MOTIVOS_CEU,
} from './ceu.js';
import { diagnosticoDe } from './diagnostico.js';

/* =================================================================================
 * A SONDA — identica em espirito a de ceu.js, e pelo mesmo motivo.
 *
 * `import` estatico e nao `require` lazy: os modulos do Fio Vermelho sao ESM e
 * rodam sob `node --test`, onde `require` nao existe no escopo. Um try/catch em
 * volta de `require` capturaria o ReferenceError, o motor viraria false e este
 * arquivo devolveria "sem ceu" SEMPRE — verde no teste, vazio no app, com o
 * pacote instalado. O que sobrevive do padrao e a sonda: conferir que o
 * namespace tem as funcoes que serao chamadas, para uma instalacao parcial
 * degradar pelo caminho normal em vez de estourar TypeError dentro de uma tela.
 * ================================================================================= */
const FUNCOES_EXIGIDAS = Object.freeze(['SearchMoonPhase', 'MakeTime']);

let _motorInjetado = null;
let _motorConferido = null;

function motorDoAno() {
  // ceu.js manda. Se ele nao tem ceu, aqui tambem nao tem — inclusive quando o
  // "nao tem" veio de injecao de teste em ceu.js. Um app que mede a lua em um
  // modulo e a declara indisponivel no outro e pior que um app sem lua.
  if (!hayEfemeride()) return false;
  if (_motorInjetado !== null) return _motorInjetado;
  if (_motorConferido !== null) return _motorConferido;
  const m = MOTOR_REAL;
  const completo = !!m && FUNCOES_EXIGIDAS.every((f) => typeof m[f] === 'function');
  _motorConferido = completo ? m : false;
  return _motorConferido;
}

/**
 * Troca o motor de efemeride deste modulo. EXISTE PARA TESTE, e so.
 * `false` simula aparelho sem lua nova calculavel; um objeto simula motor
 * parcial; `null` devolve o modulo ao motor real.
 * Nao substitui o gate de ceu.js: para simular ceu inteiro apagado, injete
 * `false` em ceu.js, que este modulo obedece.
 */
export function _inyectarMotorParaTests(motor) {
  _motorInjetado = motor === null || motor === undefined ? null : motor;
}

/** Devolve a sonda ao estado "ainda nao sondado". */
export function _reiniciarAnoParaTests() {
  _motorInjetado = null;
  _motorConferido = null;
}

/** true quando da para medir lunacao. A tela usa isto para NAO desenhar. */
export function hayLunaciones() {
  return motorDoAno() !== false;
}

/* =================================================================================
 * MOTIVOS — vocabulario TECNICO de indisponibilidade.
 *
 * Herda os tokens de ceu.js em vez de criar sinonimos: um log que as vezes diz
 * `motor_indisponivel` e as vezes `sem_motor` para a mesma coisa e um log que
 * ninguem consegue agregar. Os tres tokens novos sao ausencias que so existem
 * aqui, porque so aqui ha jornada e ha lunacao.
 *
 * Nenhum deles vai para a tela como esta. A frase que a pessoa le mora em
 * datos/textos.js. Log honesto e copy honesta querem coisas diferentes.
 * ================================================================================= */
export const MOTIVOS = Object.freeze({
  ...MOTIVOS_CEU,
  LUNACAO_NAO_ENCONTRADA: 'lunacao_nao_encontrada',
  SEM_INICIO_DA_JORNADA: 'sem_inicio_da_jornada',
  ANTES_DA_JORNADA: 'antes_da_jornada',
});

export const EXPLICACAO_TECNICA = Object.freeze({
  [MOTIVOS.LUNACAO_NAO_ENCONTRADA]:
    'SearchMoonPhase nao fechou as duas luas novas em volta da ancora, ou a duracao veio fora de [29,0; 30,1] dias — nao existe mes sem lua nova, entao isto e falha do motor, nunca ausencia de lunacao',
  [MOTIVOS.SEM_INICIO_DA_JORNADA]:
    'a lunacao foi medida, mas ninguem disse quando a jornada dela comecou — numero e tema sao relativos a esse inicio e nao podem ser chutados',
  [MOTIVOS.ANTES_DA_JORNADA]:
    'o instante pedido e anterior a lunacao em que a jornada comecou — o arco nao tem numero negativo',
});

/* =================================================================================
 * OS 13 TEMAS
 *
 * ISTO E DADO, NAO COPY. `titulo` e `pergunta` sao a forma canonica curta: a
 * mesma disciplina de FASES em ceu.js. Servem de identificador, de rotulo de
 * log e de ultimo recurso. O texto longo de cada lunacao — a abertura, os
 * gestos, o que a tela realmente mostra — mora em datos/textos.js, indexado por
 * `chaveTexto`, porque e la que string mora neste projeto.
 *
 * A ORDEM E A ARQUITETURA. Nao e uma lista de assuntos que poderia ser
 * embaralhada; cada posicao depende do material que a anterior produziu.
 * Mover um tema quebra o arco em silencio — o app continua rodando e passa a
 * fazer a pergunta errada na hora errada. Os tres casos que mais custam:
 *
 *   - o tema 6 (o tamanho da parte) antes do 3 e do 5 vira maquina de culpa:
 *     ela responde "foi tudo eu" e o app assina embaixo, porque ainda nao
 *     escreveu o que era dela antes nem separou o que sabe do que supoe;
 *   - o tema 8 (a raiva) cedo vira roteiro de despeito, e despeito sai do
 *     aparelho como gesto de contato disfarcado;
 *   - o tema 1 tarde perde a razao de existir: ele e a unica linha que todo o
 *     resto do ano cita de volta, e o tema 13 devolve verbatim, com a data.
 *
 * NENHUM TEMA E ETAPA. Todo tema e PERGUNTA. "Treze meses" soa a duracao de
 * tratamento para quem chega no dia 1, e por isso nao existe neste arquivo um
 * campo de progresso, de percentual ou de "faltam N lunacoes para" — nem para
 * uso interno. O que existe e contagem de coisa acontecida, na doutrina de
 * NUDOS em datos/ritual.js.
 *
 * TODO TEMA ACEITA "ESTE MES NAO". Nenhum exige estado emocional para ser
 * cumprido: `exigeEstado` e false nos treze, e esta ali para que qualquer tela
 * ou teste futuro possa conferir isso em vez de confiar na memoria de quem
 * escreveu. O gesto do dia continua sendo o gesto do dia mesmo quando ela nao
 * quer olhar para o tema da lunacao.
 * ================================================================================= */

/** Os cinco blocos do arco. Agrupamento de leitura, nao fase de tratamento.
 *
 * OS VALORES SAO OS IDS DE `ARCO` EM datos/lunacoes.js, e tem de continuar sendo.
 * O quinto se chamava 'volta' aqui e 'fechamento' la: `ARCO[tema.bloco]` devolvia
 * undefined para os temas 12 e 13 — a tela do arquivo e a do fechamento ficavam
 * sem nome de bloco e sem o `porque`, sem erro nenhum e so nos dois ultimos meses
 * do ano, que e onde ninguem testa. Duas tabelas que podem discordar acabam
 * discordando; test/madremaria-ano.test.js confere as duas uma contra a outra. */
export const BLOCOS = Object.freeze({
  CHAO: 'chao',
  LACO: 'laco',
  ALARGAMENTO: 'alargamento',
  CAPACIDADE: 'capacidade',
  FECHAMENTO: 'fechamento',
});

export const TEMAS = Object.freeze([
  Object.freeze({
    numero: 1,
    id: 'nomear-o-que-foi',
    titulo: 'Nomear o que foi',
    pergunta: 'O que aconteceu, dito com as suas palavras e sem arrumar a frase?',
    bloco: BLOCOS.CHAO,
    chaveTexto: 'ano.lunacao.1',
    exigeEstado: false,
    // O deposito que sustenta o espelho. Repete de proposito o dia 1 de
    // datos/ritual.js, em escala de treze lunacoes em vez de sete dias: o que
    // ela escrever aqui e o que a lunacao 13 devolve verbatim, com a data.
    // Primeira posicao porque e o unico dia em que ela ainda nao tem historico
    // dentro do app — e porque quem chega costuma ter uma versao contada para
    // os outros e nenhuma escrita para si.
    ecoadoPor: 12,
    devolvidoPor: 13,
  }),
  Object.freeze({
    numero: 2,
    id: 'a-rotina-que-sobrou',
    titulo: 'A rotina que sobrou',
    pergunta: 'Como é um dia seu agora, do acordar até apagar a luz?',
    bloco: BLOCOS.CHAO,
    chaveTexto: 'ano.lunacao.2',
    exigeEstado: false,
    // O problema imediato tem vinte e quatro horas de comprimento: nao e a
    // historia, e a terca-feira. Perguntar antes de nomear soa a desvio;
    // perguntar no mes 6 e tarde, ela ja tera inventado uma rotina de esperar.
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 3,
    id: 'o-que-ja-era-meu',
    titulo: 'O que já era meu',
    pergunta: 'O que era seu antes desse vínculo e continua sendo seu?',
    bloco: BLOCOS.CHAO,
    chaveTexto: 'ano.lunacao.3',
    exigeEstado: false,
    // Fecha o chao. So funciona depois de o dia ter sido descrito: o material
    // sao coisas concretas do mes 2 (o cafe, o caminho, a musica, a amizade),
    // nao conceitos. Protege o resto do arco — tudo que ela nomear aqui
    // continua verdade nos dois desfechos possiveis, e e o estoque de onde o
    // app tira gesto quando a lunacao ficar dura.
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 4,
    id: 'a-vontade-tem-hora',
    titulo: 'A vontade tem hora',
    pergunta: 'A que horas a vontade de dizer alguma coisa aperta em você?',
    bloco: BLOCOS.LACO,
    chaveTexto: 'ano.lunacao.4',
    exigeEstado: false,
    // O dia 3 de datos/ritual.js esticado em vinte e nove dias. Primeira
    // lunacao que toca no impulso — nunca antes, porque no mes 1 o impulso
    // ainda e a unica coisa que ela tem, e mapea-lo cedo e o app pedindo
    // contencao antes de ter oferecido qualquer coisa em troca. Aqui a vontade
    // nao e regra nem proibicao: e dado com horario, que ela confere sozinha.
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 5,
    id: 'sei-ou-suponho',
    titulo: 'Sei ou suponho',
    pergunta: 'Onde termina o que você sabe e começa o que você reconstrói de cabeça?',
    bloco: BLOCOS.LACO,
    chaveTexto: 'ano.lunacao.5',
    exigeEstado: false,
    // O coracao do bloco do meio, e a lunacao em que o app repete sem eufemismo
    // o proprio limite: nenhuma carta le essa pessoa. Dito no mes 5 isso e
    // honestidade; dito no mes 1 e um app se desqualificando antes de ter
    // servido para alguma coisa.
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 6,
    id: 'o-tamanho-da-parte',
    titulo: 'O tamanho da parte',
    pergunta: 'Qual foi a sua parte, dita sem aumentar e sem diminuir?',
    bloco: BLOCOS.LACO,
    chaveTexto: 'ano.lunacao.6',
    exigeEstado: false,
    // O eixo do arco e o ponto exato onde ele pode ferir. Tem contrapeso porque
    // vem depois de 3 (o que era dela antes) e de 5 (o que sabe x o que supoe).
    // A simetria e obrigatoria em cada texto desta lunacao: nem a historia
    // inteira, nem nada. Nenhuma pergunta daqui pode ser respondida so com uma
    // acusacao a ela mesma sem o app oferecer a outra metade NA MESMA TELA — e
    // e por isso que este tema carrega bandeira propria.
    simetriaObrigatoria: true,
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 7,
    id: 'os-outros-fios',
    titulo: 'Os outros fios',
    pergunta: 'Quem mais está na sua vida, e há quanto tempo você não olha para isso?',
    bloco: BLOCOS.ALARGAMENTO,
    chaveTexto: 'ano.lunacao.7',
    exigeEstado: false,
    // Metade exata do arco, e a primeira lunacao inteira em que a outra pessoa
    // nao e o assunto. Tirar o foco antes disso seria o app mudando de assunto
    // na cara dela. NAO e "faca amizades novas para superar": e inventario do
    // que ja existe — a irma, a colega, a vizinha, o grupo abandonado em marco.
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 8,
    id: 'a-raiva-nao-dita',
    titulo: 'A raiva não dita',
    pergunta: 'O que ficou sem ser dito do lado da raiva?',
    bloco: BLOCOS.ALARGAMENTO,
    chaveTexto: 'ano.lunacao.8',
    exigeEstado: false,
    // Deliberadamente tarde, e depois de "os outros fios" para nao ter ar de
    // camara fechada. Raiva com oito lunacoes de registro atras e informacao
    // sobre o que ela nao aceita mais. Regra dura: nenhum gesto desta lunacao
    // sai do aparelho, e o app nunca sugere que dizer a raiva a alguem resolve
    // alguma coisa.
    gestoSaiDoAparelho: false,
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 9,
    id: 'o-que-eu-quero',
    titulo: 'O que eu quero',
    pergunta: 'O que você quer, dito sem citar ninguém?',
    bloco: BLOCOS.ALARGAMENTO,
    chaveTexto: 'ano.lunacao.9',
    exigeEstado: false,
    // A dobradica que faz o arco servir aos dois desfechos. Separa "quero essa
    // pessoa de volta" de "quero isto que eu tinha" sem dizer qual e a certa —
    // o app nao sabe e nao vota. Exige o mes 8 antes: enquanto a raiva esta sem
    // nome, tudo que ela quer sai formulado contra alguem. Depois desta
    // lunacao, todo desejo que ela escrever continua legivel nos dois futuros.
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 10,
    id: 'confiar-de-novo',
    titulo: 'Confiar de novo',
    pergunta: 'O que você precisaria para confiar de novo — em quem for?',
    bloco: BLOCOS.CAPACIDADE,
    chaveTexto: 'ano.lunacao.10',
    exigeEstado: false,
    // A lunacao mais escorregadia do ano, e a formulacao a salva: "em quem for".
    // Confianca como CAPACIDADE GERAL serve a uma reconciliacao e serve a
    // qualquer vinculo futuro; como preparacao para uma conversa especifica,
    // vira ensaio de um encontro que o app nao pode prometer. A clausula e
    // obrigatoria em cada texto, nao so no titulo — dai a bandeira.
    clausulaObrigatoria: 'em quem for',
    gestoCompletavelSozinhaHoje: true,
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 11,
    id: 'o-que-se-diz',
    titulo: 'O que se diz',
    pergunta: 'O que você diria, e o que fica sendo só seu?',
    bloco: BLOCOS.CAPACIDADE,
    chaveTexto: 'ano.lunacao.11',
    exigeEstado: false,
    // O limite, dito nos dois sentidos: se essa pessoa esta por perto, e a
    // conversa; se nao esta, e a carta que nao se envia e continua tendo valor.
    // Consequencia direta do mes 10 — quem sabe o que precisa para confiar sabe
    // o que precisa dizer. Ultima lunacao de conteudo novo.
    gestoCompletavelSozinhaHoje: true,
    ecoadoPor: 12,
  }),
  Object.freeze({
    numero: 12,
    id: 'o-ano-por-dentro',
    titulo: 'O ano por dentro',
    pergunta: 'O que este ano guardou de você, na sua letra?',
    bloco: BLOCOS.FECHAMENTO,
    chaveTexto: 'ano.lunacao.12',
    exigeEstado: false,
    // A lunacao do arquivo. O app nao resume, nao compara e nao conclui: ele
    // ABRE o que ela escreveu, por lunacao, com as datas, e pergunta. Separar o
    // arquivo (12) do fechamento (13) impede o ultimo mes de fazer as duas
    // coisas e acabar virando veredito. Aqui o app e indice, nao interprete —
    // e e por isso que este tema carrega bandeira de nao-interpretar.
    apenasIndice: true,
  }),
  Object.freeze({
    numero: 13,
    id: 'a-mesma-lua',
    titulo: 'A mesma lua',
    // "esta fechando", e nao "fechou". Esta pergunta fica na tela a lunacao
    // INTEIRA, e na lua nova que abre a decima terceira so DOZE lunacoes se
    // fecharam: a volta de treze fecha na lua nova SEGUINTE, que e exatamente
    // ANIVERSARIO_LUNAR (`lunacaoAbsoluta === 14`) no fim deste arquivo.
    // Escrever "fechou" aqui punha o app contradizendo a propria medida durante
    // um mes inteiro — fabricar ceu no unico tema que existe para nao fabricar
    // nada, e no unico tema cujo argumento e "aqui vai um FATO MEDIDO no lugar
    // de uma conclusao".
    pergunta: 'A lua está fechando uma volta. Qual pergunta você quer abrir na próxima?',
    bloco: BLOCOS.FECHAMENTO,
    chaveTexto: 'ano.lunacao.13',
    exigeEstado: false,
    // Devolve a linha da lunacao 1 verbatim, com a data — mesmo mecanismo do
    // dia 7 de datos/ritual.js, em escala de ano — e entrega um FATO MEDIDO no
    // lugar de uma conclusao: doze lunacoes sao 354 dias, treze sao 384, o ano
    // civil tem 365. A lua voltou ao mesmo ponto; o calendario nao.
    // Nem "supere e siga" nem "e ela voltou": o mes 13 nao sabe e nao torce.
    devolveVerbatimDe: 1,
  }),
]);

export const TOTAL_TEMAS = TEMAS.length;

/** Tema pelo numero 1..13. Fora da faixa devolve null — nunca o tema 1 por engano. */
export function temaPorNumero(numero) {
  if (!Number.isInteger(numero) || numero < 1 || numero > TOTAL_TEMAS) return null;
  return TEMAS[numero - 1];
}

/** Tema pelo id em kebab-case. */
export function temaPorId(id) {
  if (typeof id !== 'string') return null;
  return TEMAS.find((t) => t.id === id) || null;
}

/* =================================================================================
 * AS 4 FASES COMO TONS DE SEMANA
 *
 * POR QUE QUATRO, E NAO OITO. As quatro quadraturas tem fonte primaria:
 * Ptolomeu, Tetrabiblos I.8, que qualifica os quartos como umido, quente, seco e
 * frio. As OITO fases com leitura psicologica sao de Dane Rudhyar, The Lunation
 * Cycle (1967), sobre ideia dos anos 1930-40 — coisa boa, mas do seculo XX e
 * declaradamente autoral. Este arquivo usa QUATRO exatamente por isso: se alguem
 * "melhorar" expandindo para oito, a base de fonte primaria cai junto e o texto
 * vira almanaque. Ver AVISO_RUDHYAR.
 *
 * O TOM MUDA O FORMATO DO DIA, NAO SO AS PALAVRAS. O erro de projeto que mata um
 * app diario no dia 40 nao e repetir palavra, e repetir FORMA: quatro caixas na
 * mesma ordem todo dia (ritual, carta, reflexao, afirmacao) lidas por seis
 * semanas sao identicas mesmo com texto novo. Por isso cada tom carrega
 * `formato`, `pedeEscrita` e `subtrativo`: sao quatro DESENHOS DE TELA girando a
 * cada ~7 dias, e a tela deve obedecer esses campos.
 *
 * A LINHA VERMELHA DE TODOS OS QUATRO: a leitura crescente/minguante aplicada ao
 * VINCULO. "Na crescente as coisas crescem" escorrega em tres palavras para "na
 * crescente ela se aproxima", e nenhuma lista de palavras proibidas pega isso.
 * A contencao e estrutural e esta gravada em cada tom como
 * `terceiraPessoaComoSujeito: false`: no texto de qualquer fase, a outra pessoa
 * NUNCA pode aparecer como sujeito de verbo. O portao de copy tem de varrer os
 * textos de fase procurando sujeito em terceira pessoa, e nao so as palavras
 * "voltar" e "procurar".
 *
 * `permiteGestoDeEncontro` E UM VETO, NUNCA UMA PERMISSAO. Ele responde uma
 * pergunta so — "esta FASE DA LUA proibe gesto de encontro hoje?" — e a resposta
 * `true` significa apenas que a lua nao proibiu. NAO significa que o gesto pode
 * aparecer: quem decide isso e a resposta dela sobre o contato, em lib/plano.js
 * (`plano.encontro.travado.contatoDuro`). Para quem marcou 'le-escribi-no-responde'
 * ou 'cero-contacto' o bloco fica travado nas QUATRO fases, e a lua nao destrava
 * nada. Quem consumir este campo tem de faze-lo em E logico com aquele gate; ler
 * so este campo poria um passo para fora na tela de quem respondeu que nao ha
 * contato — que e a linha dura do produto, e ela nao mora neste arquivo.
 * ================================================================================= */

export const AVISO_RUDHYAR = Object.freeze({
  quadraturas: Object.freeze({
    autor: 'Ptolomeu',
    obra: 'Tetrabiblos',
    locus: 'I.8',
    seculo: 'séc. II',
    oQueDiz: 'os quatro quartos qualificados como úmido, quente, seco e frio',
  }),
  oitoFases: Object.freeze({
    autor: 'Dane Rudhyar',
    obra: 'The Lunation Cycle',
    ano: 1967,
    oQueDiz: 'leitura psicológica das oito fases; formulação do séc. XX, não tradição antiga',
  }),
  regra: 'quatro quadrantes têm fonte primária; oito fases psicológicas não. Não expandir.',
});

export const TONS = Object.freeze([
  Object.freeze({
    quadrante: 0,
    id: 'comecar-no-escuro',
    de: 'Lua Nova',
    ate: 'Quarto Crescente',
    tom: 'Começar no escuro',
    pede: 'Um gesto pequeno, começado hoje, que não produz nada visível hoje.',
    formato: 'curto-um-pedido',
    pedeEscrita: false,
    subtrativo: false,
    permiteGestoDeEncontro: true,
    terceiraPessoaComoSujeito: false,
    // Dias curtos, de um pedido so, sem plateia e sem resultado a vista. A tela
    // desta fase e a mais curta das quatro.
    //
    // O app pede a COISA CONCRETA (o papel dobrado, a caminhada, a xicara),
    // nunca a "intencao plantada". A diferenca tem fonte: plantar de verdade na
    // lua escura esta em Catao, De Agri Cultura 40.1 (figueira, macieira e
    // videira, luna silente, ao entardecer) — dois mil anos de fonte primaria.
    // "Plantar intencoes" e transposicao moderna, popularizada por Jan Spiller
    // em 2001. Se a segunda for usada algum dia, o texto DECLARA que e moderna.
    fontes: Object.freeze([
      Object.freeze({ autor: 'Ptolomeu', obra: 'Tetrabiblos', locus: 'I.8', diz: 'quarto úmido' }),
      Object.freeze({
        autor: 'Catão',
        obra: 'De Agri Cultura',
        locus: '40.1',
        diz: 'figueira, macieira e videira se plantam luna silente, ao entardecer',
      }),
    ]),
    naoConfundirCom: Object.freeze({
      pratica: 'plantar intenções',
      origem: 'Jan Spiller, 2001',
      regra: 'transposição moderna — se usada, o texto declara que é moderna',
    }),
  }),
  Object.freeze({
    quadrante: 1,
    id: 'sustentar',
    de: 'Quarto Crescente',
    ate: 'Lua Cheia',
    tom: 'Sustentar o que já começou, sem aumentar',
    pede: 'Refazer o gesto da fase anterior mais uma vez, do mesmo tamanho.',
    formato: 'repeticao-mesmo-tamanho',
    pedeEscrita: false,
    subtrativo: false,
    permiteGestoDeEncontro: true,
    terceiraPessoaComoSujeito: false,
    // A unica fase que pede constancia, e o antidoto ao mes de janeiro do
    // plano: quem escala o esforco na segunda semana abandona na quarta. O
    // pedido e REPETICAO, nunca intensidade.
    //
    // O texto nunca diz que repetir faz alguma coisa crescer entre ela e
    // ninguem. O que cresce, quando cresce, e o REGISTRO dela — e isso e
    // contavel na tela, que e a unica forma honesta de dizer que cresceu.
    fontes: Object.freeze([
      Object.freeze({ autor: 'Ptolomeu', obra: 'Tetrabiblos', locus: 'I.8', diz: 'quarto quente' }),
      Object.freeze({
        autor: 'Carr',
        obra: 'TAPA 49',
        ano: 1918,
        diz: 'a regra romana extraída do conjunto das fontes latinas: o que se quer que cresça se faz na lua crescente',
      }),
    ]),
  }),
  Object.freeze({
    quadrante: 2,
    id: 'o-que-ja-da-para-ver',
    de: 'Lua Cheia',
    ate: 'Quarto Minguante',
    tom: 'O que já dá para ver',
    pede: 'Registrar por escrito uma coisa que já dá para ver sem interpretar.',
    formato: 'escrita',
    pedeEscrita: true,
    subtrativo: false,
    // A UNICA fase que nao pode carregar gesto de encontro nenhum. Um marco
    // lunar datado na tela e medida e esta certo; a dois centimetros de um
    // texto sobre reconciliacao, vira vespera de acontecimento. O card do ceu
    // tambem nunca compartilha bloco visual com o bloco de encontro.
    permiteGestoDeEncontro: false,
    terceiraPessoaComoSujeito: false,
    // A cheia e a maxima visibilidade por astronomia simples: o disco iluminado
    // inteiro voltado para ca. E um INSTANTE, nao um dia — a olho nu parece
    // cheia por tres noites. E a unica das quatro que pede palavra escrita, e e
    // por isso que cai uma vez a cada ~29 dias e nao toda semana.
    fontes: Object.freeze([
      Object.freeze({ autor: 'Ptolomeu', obra: 'Tetrabiblos', locus: 'I.8', diz: 'quarto seco' }),
      Object.freeze({
        autor: 'Columela',
        obra: 'De Re Rustica',
        locus: 'XI.2.85',
        diz: 'lua cheia é dia de semear fava — não de colher',
      }),
      Object.freeze({
        autor: 'Rotton & Kelly',
        obra: 'meta-análise de 37 estudos',
        ano: 1985,
        diz: 'nenhuma relação entre lua cheia e comportamento',
      }),
    ]),
    // Duas proibicoes proprias desta fase, e a segunda e uma PROTECAO: com
    // Rotton & Kelly na mao, o app pode recusar "estou assim por causa da lua
    // cheia" em vez de alimentar a frase.
    proibicoes: Object.freeze([
      'não dizer "colher" — colher-para-guardar está na minguante (Plínio, NH XVIII.321)',
      'nunca ligar a lua cheia a comportamento, dela ou de ninguém',
    ]),
  }),
  Object.freeze({
    quadrante: 3,
    id: 'tirar',
    de: 'Quarto Minguante',
    ate: 'Lua Nova',
    tom: 'Tirar, cortar, deixar secar',
    pede: 'Tirar uma coisa concreta do dia — uma aba aberta, um horário, um objeto, uma conferida.',
    formato: 'subtracao',
    pedeEscrita: false,
    subtrativo: true,
    permiteGestoDeEncontro: true,
    terceiraPessoaComoSujeito: false,
    // O quarto com melhor lastro primario de todos. E a UNICA fase do ciclo em
    // que o app pede MENOS e nao mais — e essa diferenca de forma e o que
    // impede as quatro semanas de parecerem a mesma semana.
    fontes: Object.freeze([
      Object.freeze({ autor: 'Ptolomeu', obra: 'Tetrabiblos', locus: 'I.8', diz: 'quarto frio' }),
      Object.freeze({
        autor: 'Plínio',
        obra: 'Naturalis Historia',
        locus: 'XVIII.321-322',
        diz: 'na minguante o que corta, colhe para secar e diminui',
      }),
      Object.freeze({ autor: 'Catão', obra: 'De Agri Cultura', locus: '29 e 31.2' }),
      Object.freeze({ autor: 'Columela', obra: 'De Re Rustica', locus: 'II.5.1 e XI.2.11' }),
    ]),
    // A linha vermelha desta fase, e ela e absoluta: o app corta abas de
    // navegador, nao vinculos. Quem decide o que e cortado e ela.
    proibicoes: Object.freeze([
      'jamais "solte essa pessoa"',
      'jamais "corte esse vínculo"',
      'jamais "deixe ir"',
    ]),
  }),
]);

export const TOTAL_TONS = TONS.length;

/* Quadrante da lunacao pela elongacao Lua-Sol em graus.
 * 0: Nova->Quarto Crescente | 1: QC->Cheia | 2: Cheia->Quarto Minguante | 3: QM->Nova
 *
 * Sai da ELONGACAO e nao do rotulo de fase de ceu.js, e a diferenca importa: o
 * rotulo cobre fatia de 45 graus centrada nos multiplos de 45, entao "Lua Nova"
 * vai de 337,5 a 22,5 graus e cruzaria o quadrante 3 para o 0 no meio do rotulo.
 * Mapear rotulo->quadrante poria uma parte da minguante dentro do tom de comecar
 * no escuro. Noventa graus limpos nao tem essa borda. */
export function quadranteDaLongitude(longitude) {
  if (typeof longitude !== 'number' || !Number.isFinite(longitude)) return null;
  const lon = ((longitude % 360) + 360) % 360;
  return Math.floor(lon / 90) % 4;
}

/** O tom de semana de um quadrante 0..3. */
export function tomPorQuadrante(quadrante) {
  if (!Number.isInteger(quadrante) || quadrante < 0 || quadrante >= TOTAL_TONS) return null;
  return TONS[quadrante];
}

/* =================================================================================
 * MEDIDAS DA LUA — numeros, nao opinioes.
 * ================================================================================= */

const MS_DIA = 86400000;

/** Mes sinodico medio, em dias. Varia de ~29,27 a ~29,83 de mes para mes. */
export const SINODICO_MEDIO_DIAS = 29.530588;

/** Doze lunacoes. Menos que o ano civil. */
export const DOZE_LUNACOES_DIAS = 354.37;

/** Treze lunacoes. Mais que o ano civil — e e por isso que o tema 13 sai dele. */
export const TREZE_LUNACOES_DIAS = 383.9;

/** Ano tropico. O terceiro numero, diferente dos outros dois. */
export const ANO_TROPICO_DIAS = 365.2422;

/* O fato que a lunacao 13 entrega no lugar de uma conclusao. Sao MEDIDAS, e
 * ficam aqui em campo estruturado para que a copy nao precise repetir numero de
 * cabeca (numero repetido de cabeca e numero que diverge na terceira tela). */
export const FATO_DA_VOLTA = Object.freeze({
  dozeLunacoes: DOZE_LUNACOES_DIAS,
  trezeLunacoes: TREZE_LUNACOES_DIAS,
  anoCivil: ANO_TROPICO_DIAS,
  diz: 'a lua voltou ao mesmo ponto; o calendário não',
});

/* Janela de busca da lua nova, em dias. O mes sinodico dura ~29,53, entao 45
 * cobre com folga qualquer ponto de partida — e e por isso que voltar vazio aqui
 * significa FALHA DO MOTOR, nunca "nao ha lua nova por perto". Nao existe mes
 * sem lua nova. */
const JANELA_NOVA_DIAS = 45;

/* Guarda de sanidade da lunacao medida. Nenhuma lunacao real dura menos de
 * ~29,27 nem mais de ~29,83 dias; a folga ate [29,0; 30,1] absorve arredondamento
 * sem deixar passar um resultado absurdo. Um motor que devolvesse duas luas
 * novas a 3 dias de distancia produziria `diaDaLunacao` e numero de tema errados
 * SEM ERRO NENHUM, e um numero errado com cara de medida e pior que um vazio. */
const DURACAO_MINIMA_DIAS = 29.0;
const DURACAO_MAXIMA_DIAS = 30.1;

function pad(n, largo = 2) {
  return String(n).padStart(largo, '0');
}

/* A mesma forma de instante de ceu.js: UTC para conferir contra efemeride
 * publica, local para a tela, dia local para o calendario dela. Os tres porque
 * um so sempre engana um dos leitores. */
function instanteEmDuasFormas(d) {
  return Object.freeze({
    iso: d.toISOString(),
    local: `${diaLocal(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    dia: diaLocal(d),
  });
}

/* Aceita ISO 8601 (com Z, com offset, ou sem nada), Date, ou ms. Devolve Date ou
 * null — NUNCA cai para hoje. Uma data pura de 10 caracteres e lida como
 * meio-dia UTC daquele dia, que e a convencao declarada de ceu.js.
 *
 * Cair para hoje aqui esconderia bug de quem chamou dentro de um objeto que
 * parece saudavel: o instante e ARGUMENTO EXPLICITO neste modulo, sempre. */
function normalizarInstante(entrada) {
  if (entrada instanceof Date) {
    return Number.isNaN(entrada.getTime()) ? null : new Date(entrada.getTime());
  }
  if (typeof entrada === 'number') {
    return Number.isFinite(entrada) ? new Date(entrada) : null;
  }
  if (typeof entrada !== 'string') return null;
  const texto = entrada.trim();
  const m = /^(\d{4}-\d{2}-\d{2})(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.exec(texto);
  if (!m || !esDiaValido(m[1])) return null;
  const d = new Date(texto.length === 10 ? `${texto}T12:00:00Z` : texto);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* Lua nova exata a partir de um instante. `paraTras` usa limitDays negativo, que
 * astronomy-engine documenta como busca para o passado. Devolve Date ou null. */
function novaExata(A, desde, paraTras) {
  try {
    const achado = A.SearchMoonPhase(
      0,
      A.MakeTime(desde),
      paraTras ? -JANELA_NOVA_DIAS : JANELA_NOVA_DIAS,
    );
    if (!achado) return null;
    const fecha = achado.date instanceof Date ? achado.date : achado;
    if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return null;
    return fecha;
  } catch {
    return null;
  }
}

/* A lunacao que CONTEM uma ancora: a lua nova imediatamente anterior e a
 * imediatamente seguinte. Devolve { inicio: Date, fim: Date } ou null.
 *
 * Duas buscas e nao uma. Recuar 30 dias e pegar "a proxima" parece equivalente e
 * nao e: quando a lua nova caiu nas ultimas ~17 horas, a lua nova ANTERIOR a ela
 * ainda cabe na janela de 30 dias, e a busca devolve a errada — a lunacao inteira
 * sai deslocada um mes, e com ela o tema. A borda so aparece em ~2% dos dias, que
 * e a pior frequencia possivel: rara demais para alguem tropecar nela testando,
 * comum demais para nao acontecer com gente de verdade. */
function lunacaoQueContem(ancora) {
  const A = motorDoAno();
  if (!A) return null;
  const inicio = novaExata(A, ancora, true);
  const fim = novaExata(A, ancora, false);
  if (!inicio || !fim) return null;
  const duracao = (fim.getTime() - inicio.getTime()) / MS_DIA;
  if (!(duracao >= DURACAO_MINIMA_DIAS && duracao <= DURACAO_MAXIMA_DIAS)) return null;
  return { inicio, fim, duracao };
}

/* O dia civil em que uma virada PASSA A VALER, sob a ancora de meio-dia local.
 * Lua nova as 15h de terca: a terca ainda e do tema velho (meio-dia < 15h), e o
 * tema novo abre na quarta. Lua nova as 3h de terca: a propria terca ja e do
 * tema novo. */
function diaEmQueViraOTema(instanteDaNova) {
  const diaDaNova = diaLocal(instanteDaNova);
  const meioDia = meioDiaLocal(diaDaNova);
  if (!meioDia) return null;
  if (instanteDaNova.getTime() <= meioDia.getTime()) return diaDaNova;
  const seguinte = new Date(meioDia.getTime() + MS_DIA);
  return diaLocal(seguinte);
}

/* Aceita a ancora da jornada em qualquer das duas formas que as telas usam:
 *   lunacaoDe(instante, '2026-03-03')
 *   lunacaoDe(instante, { inicio: '2026-03-03' })
 * Devolve string de instante, ou null. Aceitar as duas evita o bug silencioso de
 * passar o objeto e receber "sem inicio da jornada" sem entender por que. */
function extrairInicio(ancora) {
  if (ancora === null || ancora === undefined) return null;
  if (typeof ancora === 'string' || typeof ancora === 'number' || ancora instanceof Date) return ancora;
  if (typeof ancora === 'object' && 'inicio' in ancora) return ancora.inicio;
  return null;
}

/* Numero da lunacao dela contando luas novas desde a lunacao em que a jornada
 * comecou. Arredondar a divisao pelo sinodico MEDIO e exato para o horizonte
 * deste app com margem enorme: a variacao do mes sinodico e oscilatoria, nao
 * acumulativa, e o desvio da media nunca passa de ~0,7 dia — contra os ~14,8
 * dias de folga que o arredondamento tem antes de errar de lunacao. Contar lua
 * por lua com SearchMoonPhase seria 13 buscas por chamada para chegar ao mesmo
 * inteiro. */
function contarLunacoes(inicioDaPrimeira, inicioDestaLunacao) {
  const delta = (inicioDestaLunacao.getTime() - inicioDaPrimeira.getTime()) / MS_DIA;
  return Math.round(delta / SINODICO_MEDIO_DIAS);
}

/* =================================================================================
 * lunacaoDe — EM QUE LUNACAO ELA ESTA
 * ================================================================================= */

/* Molde do "nao deu". Existe como funcao para que TODO caminho de falha devolva
 * exatamente os mesmos campos: um objeto de erro que omite chaves obriga a tela a
 * escrever `?.` em todo acesso, e o dia em que alguem esquecer um deles a tela
 * quebra em vez de ficar calada. Calada e o comportamento certo. */
function lunacaoVazia(motivo, instanteFmt = null, dia = null) {
  return Object.freeze({
    disponivel: false,
    motivo,
    instante: instanteFmt,
    dia,
    ancoraDoDia: null,
    numero: null,
    lunacaoAbsoluta: null,
    passada: null,
    tema: null,
    origemDoTema: null,
    inicio: null,
    fim: null,
    diaDeAbertura: null,
    diaDaLunacao: null,
    duracaoDias: null,
    fase: null,
    quadrante: null,
    tomDaFase: null,
    semana: null,
  });
}

/**
 * A lunacao de um instante.
 *
 * @param {string|Date|number} instanteISO  ISO 8601, Date ou ms. Data pura de 10
 *   caracteres e lida como meio-dia UTC. Sem argumento, usa o relogio do
 *   aparelho — a unica chamada deste modulo em que isso e aceitavel, porque e a
 *   pergunta "e agora?".
 * @param {string|Date|number|{inicio}} [ancoraDaJornada]  quando a jornada dela
 *   comecou. SEM ISTO o objeto vem completo em ceu (inicio, fim, fase, tom) e com
 *   `numero`, `passada` e `tema` em null, motivo SEM_INICIO_DA_JORNADA. Nao ha
 *   default silencioso: assumir "comecou hoje" faria toda tela sem ancora exibir
 *   a lunacao 1, que e a mentira mais dificil de notar deste arquivo.
 *
 * @returns {Readonly<object>} congelado:
 *   - `disponivel`      true so quando a lunacao inteira fechou
 *   - `motivo`          null quando disponivel; token de MOTIVOS quando nao
 *   - `numero`          1..13, a posicao no arco. null sem ancora de jornada
 *   - `lunacaoAbsoluta` 1, 2, 3... sem voltar a 1. E daqui que sai a segunda
 *                       camada de texto do ano 2 (ver PASSADA, no fim)
 *   - `passada`         1 no primeiro ano, 2 no segundo. floor(absoluta/13)+1
 *   - `tema`            o objeto de TEMAS, ou null
 *   - `origemDoTema`    'lua-medida' quando ha numero. Nunca outra coisa aqui:
 *                       aproximacao mora em posicaoNoAno e nao entra neste campo
 *   - `inicio` / `fim`  as duas luas novas, instantes EXATOS em tres formas
 *   - `diaDaLunacao`    1 no dia em que o tema abriu
 *   - `fase`            { nome, emoji, indice, longitude } de ceu.js
 *   - `quadrante`       0..3 pela elongacao
 *   - `tomDaFase`       o objeto de TONS
 *   - `semana`          1..4, so um apelido de quadrante+1 para leitura de tela
 */
export function lunacaoDe(instanteISO = new Date(), ancoraDaJornada = null) {
  const instante = normalizarInstante(instanteISO);
  if (!instante) return lunacaoVazia(MOTIVOS.INSTANTE_INVALIDO);

  const dia = diaLocal(instante);
  const instanteFmt = instanteEmDuasFormas(instante);

  const A = motorDoAno();
  if (!A) return lunacaoVazia(MOTIVOS.MOTOR_INDISPONIVEL, instanteFmt, dia);

  // A ancora unica do app. Tudo abaixo pende dela, e ela sai no objeto para ser
  // conferivel de fora — quem quiser saber por que o dia caiu neste tema e nao
  // no outro consegue refazer a conta sem ler este arquivo.
  const ancora = meioDiaLocal(dia);
  if (!ancora) return lunacaoVazia(MOTIVOS.INSTANTE_INVALIDO, instanteFmt, dia);

  const lunacao = lunacaoQueContem(ancora);
  if (!lunacao) return lunacaoVazia(MOTIVOS.LUNACAO_NAO_ENCONTRADA, instanteFmt, dia);

  const rotulo = faseDoDia(dia);
  if (!rotulo) return lunacaoVazia(MOTIVOS.FASE_NAO_CALCULADA, instanteFmt, dia);

  const quadrante = quadranteDaLongitude(rotulo.longitude);
  if (quadrante === null) return lunacaoVazia(MOTIVOS.FASE_NAO_CALCULADA, instanteFmt, dia);

  // `diaDaLunacao` conta do dia em que o TEMA ABRIU, e nao do dia civil em que
  // a lua nova caiu. Os dois divergem sempre que a lua nova cai depois do
  // meio-dia, e a divergencia foi medida: com a lua nova de 12/08/2026 as 14h37
  // locais, o tema 7 abre em 13/08 — e contar do dia da lua nova faria a tela
  // dizer "dia 2 da lunacao" no primeiro dia do tema. Seria o app se
  // contradizendo sozinho, que e exatamente o que a ancora unica existe para
  // impedir.
  //
  // Contando da abertura, os dias civis se encaixam sem sobra e sem buraco: a
  // lunacao anterior vai ate 12/08 (seu dia 30) e esta comeca em 13/08 (dia 1).
  // Nenhum dia pertence a duas lunacoes, nenhum dia fica sem lunacao.
  const diaDeAbertura = diaEmQueViraOTema(lunacao.inicio);
  if (!diaDeAbertura) return lunacaoVazia(MOTIVOS.LUNACAO_NAO_ENCONTRADA, instanteFmt, dia);
  const diaDaLunacao = diasEntre(diaDeAbertura, dia) + 1;

  // A partir daqui a LUA ja esta medida e nada mais pode derruba-la. O que pode
  // faltar e a JORNADA — e falta de jornada nao apaga o ceu, so deixa o arco sem
  // numero. Sao dois eixos independentes, e o objeto mostra os dois.
  const base = {
    instante: instanteFmt,
    dia,
    ancoraDoDia: instanteEmDuasFormas(ancora),
    inicio: instanteEmDuasFormas(lunacao.inicio),
    fim: instanteEmDuasFormas(lunacao.fim),
    diaDeAbertura,
    diaDaLunacao,
    duracaoDias: Math.round(lunacao.duracao * 1000) / 1000,
    fase: rotulo,
    quadrante,
    tomDaFase: TONS[quadrante],
    semana: quadrante + 1,
  };

  const inicioBruto = extrairInicio(ancoraDaJornada);
  if (inicioBruto === null) {
    return Object.freeze({
      ...base,
      disponivel: false,
      motivo: MOTIVOS.SEM_INICIO_DA_JORNADA,
      numero: null,
      lunacaoAbsoluta: null,
      passada: null,
      tema: null,
      origemDoTema: null,
    });
  }

  const instanteInicio = normalizarInstante(inicioBruto);
  if (!instanteInicio) {
    return Object.freeze({
      ...base,
      disponivel: false,
      motivo: MOTIVOS.INSTANTE_INVALIDO,
      numero: null,
      lunacaoAbsoluta: null,
      passada: null,
      tema: null,
      origemDoTema: null,
    });
  }

  const ancoraInicio = meioDiaLocal(diaLocal(instanteInicio));
  const primeira = ancoraInicio ? lunacaoQueContem(ancoraInicio) : null;
  if (!primeira) {
    return Object.freeze({
      ...base,
      disponivel: false,
      motivo: MOTIVOS.LUNACAO_NAO_ENCONTRADA,
      numero: null,
      lunacaoAbsoluta: null,
      passada: null,
      tema: null,
      origemDoTema: null,
    });
  }

  const n = contarLunacoes(primeira.inicio, lunacao.inicio);
  if (n < 0) {
    return Object.freeze({
      ...base,
      disponivel: false,
      motivo: MOTIVOS.ANTES_DA_JORNADA,
      numero: null,
      lunacaoAbsoluta: null,
      passada: null,
      tema: null,
      origemDoTema: null,
    });
  }

  const numero = (n % TOTAL_TEMAS) + 1;
  return Object.freeze({
    ...base,
    disponivel: true,
    motivo: null,
    numero,
    lunacaoAbsoluta: n + 1,
    passada: Math.floor(n / TOTAL_TEMAS) + 1,
    tema: TEMAS[numero - 1],
    origemDoTema: ORIGENS_DO_TEMA.LUA_MEDIDA,
  });
}

/* =================================================================================
 * posicaoNoAno — ONDE ELA ESTA NO ARCO
 *
 * O CONTRATO QUE SUSTENTA O APP INTEIRO: `dia` NUNCA e null quando as duas datas
 * sao validas. Ele e diferenca de dias civis, aritmetica pura, e sobrevive a
 * qualquer falha de efemeride. O plano do dia existe sem o ceu — essa e a regra
 * herdada de `encaixeDoRitual` em lib/plano.js e de `regenteDoDia` em ceu.js.
 *
 * A APROXIMACAO, E POR QUE ELA VEM EM CAIXA SEPARADA COM ETIQUETA. Sem lua
 * medida o app ainda precisa saber QUE TEMA MOSTRAR, ou a tela fica em branco por
 * causa de um pacote que nao carregou. A saida e dividir dias corridos por
 * 29,530588. Isso e um numero util e uma afirmacao falsa ao mesmo tempo, entao
 * ele:
 *   1. nunca ocupa o campo `lunacao` — mora em `aproximacao.lunacao`;
 *   2. carrega `apresentavelComoLua: false` gravado no proprio objeto, para que
 *      nenhuma tela precise lembrar da regra de cabeca;
 *   3. carrega `origem: 'dias-corridos'`, que e o que ele realmente e.
 * A tela pode usar o tema. A tela NAO pode dizer "lua", "lunacao", "fase" nem
 * desenhar o card do ceu com ele. Sem efemeride, o app fica CALADO sobre a lua —
 * nunca "aproximadamente minguante", nunca "estimamos".
 *
 * A aproximacao vem SEMPRE, inclusive quando o ceu esta disponivel. E de
 * proposito: assim o caminho degradado e exercitado todo dia por quem le o
 * objeto, e existe como conferir os dois lado a lado num teste. Codigo de
 * emergencia que so roda na emergencia e codigo que nao funciona na emergencia.
 * ================================================================================= */

export const ORIGENS_DO_TEMA = Object.freeze({
  LUA_MEDIDA: 'lua-medida',
  DIAS_CORRIDOS: 'dias-corridos',
});

export const AVISO_APROXIMACAO = Object.freeze({
  origem: ORIGENS_DO_TEMA.DIAS_CORRIDOS,
  conta: 'dias corridos ÷ 29,530588',
  apresentavelComoLua: false,
  regra: 'serve para escolher o tema quando não há efeméride; nunca vai à tela como lua, fase ou lunação',
});

/**
 * A posicao dela no arco.
 *
 * @param {string|Date|number} inicioISO   quando a jornada comecou.
 * @param {string|Date|number} instanteISO o momento perguntado.
 * @param {object} [perfil] OPCIONAL — o que ela deu, no formato de
 *   lib/diagnostico.js: `{ nascimento, signo, genero, respostas, hoje }`. Sem
 *   ele o retorno e identico ao de antes, com `diagnostico: null`. O signo NAO
 *   entra na escolha do tema: ver a nota dentro da funcao.
 *
 * @returns {Readonly<object>} congelado:
 *   - `dia`          1 no dia do inicio. Passa de 365 sem estourar: o tema 13
 *                    fecha por volta do dia 384, FORA do ano civil, e truncar
 *                    em 365 cortaria o fechamento do arco no meio
 *   - `diasCorridos` dia - 1. O mesmo fato, do jeito que a copy costuma querer
 *   - `disponivel`   houve lua medida
 *   - `lunacao`      1..13 medido, ou null
 *   - `passada`      1 no primeiro arco, 2 no segundo
 *   - `semana`       1..4 dentro da lunacao, ou null
 *   - `fase`         rotulo de ceu.js, ou null
 *   - `tomDaFase`    objeto de TONS, ou null
 *   - `tema`         objeto de TEMAS medido, ou null
 *   - `aproximacao`  { lunacao, tema, semana, origem, apresentavelComoLua }
 *                    SEMPRE presente. Leia o bloco acima antes de usar
 *   - `diagnostico`  o cruzamento de lib/diagnostico.js quando `perfil` veio,
 *                    ou null. E RECIBO, nao motor: nao mexe em tema nenhum
 *
 * NAO EXISTE campo de progresso, percentual ou "quanto falta". Uma barra de
 * "ano 3% completo" em fevereiro e uma maquina de culpa com cara de gamificacao,
 * e um app de 365 dias tende a ela sozinho. Aqui so ha fato contavel.
 *
 * E o arco NAO e empurrado pela presenca dela: o tema sai da LUA, nunca de dias
 * registrados. Sumir tres semanas nao atrasa o ano, e voltar no dia 200 entrega o
 * tema do dia 200 — sem cobranca, sem atrasados, sem recuperacao. O retorno e
 * MUDO, igual ao de lib/hilo.js.
 */
export function posicaoNoAno(inicioISO, instanteISO = new Date(), perfil = null) {
  const inicio = normalizarInstante(inicioISO);
  const instante = normalizarInstante(instanteISO);

  /* O CRUZAMENTO, quando o chamador passa o perfil — lib/diagnostico.js.
   *
   * TERCEIRO ARGUMENTO, OPCIONAL, e sem ele nada muda: quem chamava
   * `posicaoNoAno(inicio, agora)` continua recebendo o mesmo objeto, agora com
   * `diagnostico: null`. Nao ha campo antigo dependendo dele e nao ha caminho em
   * que a falta do perfil impeca a medida do arco — o tema sai da LUA, e o
   * cabecalho deste arquivo e explicito em que o arco nao e empurrado por dado
   * nenhum dela.
   *
   * O SIGNO NAO ESCOLHE O TEMA, e e por isso que o cruzamento entra AQUI e nao
   * dentro de `lunacaoDe`. Os treze temas saem da lunacao medida; deixar o signo
   * mexer nessa escolha seria exatamente a leitura determinista que
   * lib/diagnostico.js recusa por escrito. O que este campo faz e dizer, ao lado
   * do tema, de que dados dela o plano esta falando — o recibo, nao o motor.
   *
   * Ele e calculado ANTES do desvio de instante invalido para que as duas saidas
   * tenham a MESMA forma. Duas formas diferentes para o mesmo nome de funcao e
   * como nasce o `undefined` que so aparece no aparelho de quem tem o relogio
   * errado. */
  const diagnostico = perfil && typeof perfil === 'object' ? diagnosticoDe(perfil) : null;

  if (!inicio || !instante) {
    return Object.freeze({
      disponivel: false,
      motivo: MOTIVOS.INSTANTE_INVALIDO,
      diagnostico,
      dia: null,
      diasCorridos: null,
      inicio: null,
      instante: null,
      lunacao: null,
      lunacaoAbsoluta: null,
      passada: null,
      semana: null,
      fase: null,
      quadrante: null,
      tomDaFase: null,
      tema: null,
      origemDoTema: null,
      diaDaLunacao: null,
      aproximacao: null,
    });
  }

  const diaInicio = diaLocal(inicio);
  const dia = diaLocal(instante);

  // Aritmetica pura. Nao pode falhar, e e por isso que o plano do dia continua
  // existindo num aparelho onde a efemeride nao carregou.
  const diasCorridos = diasEntre(diaInicio, dia);
  const numeroDoDia = diasCorridos + 1;

  // A caixa etiquetada. Ela existe ate quando o ceu esta perfeito — ver o bloco
  // acima sobre codigo de emergencia que so roda na emergencia.
  const nAprox = Math.floor(Math.max(0, diasCorridos) / SINODICO_MEDIO_DIAS);
  const numeroAprox = (nAprox % TOTAL_TEMAS) + 1;
  const diaNaLunacaoAprox = Math.max(0, diasCorridos) - nAprox * SINODICO_MEDIO_DIAS;
  const aproximacao = Object.freeze({
    ...AVISO_APROXIMACAO,
    lunacao: numeroAprox,
    lunacaoAbsoluta: nAprox + 1,
    passada: Math.floor(nAprox / TOTAL_TEMAS) + 1,
    tema: TEMAS[numeroAprox - 1],
    // Quarto de lunacao por proporcao de dias. Vale o mesmo aviso: e um quarto
    // de calendario, nao um quarto de lua. Nao desenha card de ceu.
    semana: Math.min(4, Math.floor(diaNaLunacaoAprox / (SINODICO_MEDIO_DIAS / 4)) + 1),
  });

  const medida = lunacaoDe(instante, inicio);

  return Object.freeze({
    disponivel: medida.disponivel,
    motivo: medida.motivo,
    dia: numeroDoDia,
    diasCorridos,
    inicio: instanteEmDuasFormas(inicio),
    instante: instanteEmDuasFormas(instante),
    lunacao: medida.numero,
    lunacaoAbsoluta: medida.lunacaoAbsoluta,
    passada: medida.passada,
    semana: medida.semana,
    fase: medida.fase,
    quadrante: medida.quadrante,
    tomDaFase: medida.tomDaFase,
    tema: medida.tema,
    origemDoTema: medida.origemDoTema,
    diaDaLunacao: medida.diaDaLunacao,
    aproximacao,
    diagnostico,
  });
}

/* =================================================================================
 * proximaVirada — QUANDO O TEMA MUDA
 *
 * Devolve o INSTANTE EXATO da proxima lua nova e, separado dele, o DIA CIVIL em
 * que o tema efetivamente troca sob a ancora de meio-dia local. Os dois campos
 * existem porque nao sao a mesma coisa: com lua nova as 15h de terca, o instante
 * e terca e a virada e quarta. Devolver so um dos dois faria o app se contradizer
 * — a tela diria "o tema muda hoje" e o tema so mudaria amanha.
 *
 * O QUE ESTE CAMPO NAO E. Ele e um MARCO LUNAR, medido. Nao e contagem regressiva
 * para acontecimento nenhum, e a copy que o usar nao pode virar vespera: nada de
 * "faltam 4 lunacoes para", nada de marco de ceu no mesmo bloco visual do bloco
 * de encontro. Um marco datado a dois centimetros de um texto sobre reconciliacao
 * deixa de ser medida e vira promessa, sem uma palavra proibida aparecer.
 * ================================================================================= */

/**
 * @param {string|Date|number} instanteISO
 * @param {string|Date|number|{inicio}} [ancoraDaJornada] so para dizer QUAL tema
 *   entra. Sem ela, a data da virada vem igual e os temas vem null.
 *
 * @returns {Readonly<object>} congelado:
 *   - `disponivel`   houve medida
 *   - `instante`     a lua nova exata, { iso, local, dia }
 *   - `diaDaVirada`  'YYYY-MM-DD' — o primeiro dia cujo meio-dia ja e do tema novo
 *   - `faltamDias`   dias civis daqui ate `diaDaVirada`. 0 significa hoje
 *   - `temaAtual` / `proximoTema`  objetos de TEMAS, ou null sem jornada
 *   - `fechaPassada` true quando a virada fecha um arco de 13 e abre o seguinte
 */
export function proximaVirada(instanteISO = new Date(), ancoraDaJornada = null) {
  const atual = lunacaoDe(instanteISO, ancoraDaJornada);

  // Sem lua medida nao ha virada. Note que `numero` pode ser null (jornada nao
  // informada) e a virada continuar valendo: a data da proxima lua nova nao
  // depende de quando ela instalou o app.
  if (!atual.fim) {
    return Object.freeze({
      disponivel: false,
      motivo: atual.motivo,
      instante: null,
      diaDaVirada: null,
      faltamDias: null,
      temaAtual: null,
      proximoTema: null,
      fechaPassada: null,
    });
  }

  const nova = new Date(atual.fim.iso);
  const diaDaVirada = diaEmQueViraOTema(nova);
  const faltamDias = diaDaVirada && atual.dia ? diasEntre(atual.dia, diaDaVirada) : null;

  const temaAtual = atual.tema;
  const proximoTema =
    atual.numero === null ? null : TEMAS[atual.numero % TOTAL_TEMAS];

  return Object.freeze({
    disponivel: atual.disponivel,
    motivo: atual.motivo,
    instante: atual.fim,
    diaDaVirada,
    faltamDias,
    temaAtual,
    proximoTema,
    fechaPassada: atual.numero === null ? null : atual.numero === TOTAL_TEMAS,
  });
}

/* =================================================================================
 * O PERCURSO DO BARALHO — a folga real de um dia, e a prova de que ela basta
 *
 * A CONTA DE PAPEL: 13 temas x 4 fases x 5 rituais x 78 cartas x 2 orientacoes =
 * 40.560. Ela MENTE POR CIMA e a arquitetura precisa ser honesta sobre isso. Num
 * dia dado, tema e fase NAO sao livres: os dois saem da data. Os graus de
 * liberdade reais de um dia sao 5 x 78 x 2 = 780. Essa e a folga que importa, e
 * ainda e enorme para o que precisa cobrir.
 *
 * A GARANTIA DE NAO REPETIR A QUINTUPLA EM 365 DIAS, em dois casos:
 *   (a) dois dias em blocos (tema, fase) diferentes ja diferem por construcao;
 *   (b) dois dias no mesmo bloco estao a no maximo ~9 dias um do outro (um
 *       quarto de lunacao dura de 6,3 a 8,4 dias), entao basta que a CARTA nao
 *       se repita numa janela de 9 dias.
 *
 * E AQUI ESTA O ERRO QUE ESTE ARQUIVO CORRIGE. A formulacao original da garantia
 * diz: "qualquer janela de 78 dias consecutivos entrega 78 cartas distintas, e
 * 9 << 78". Isso vale DENTRO de uma passada, onde o multiplicador coprimo com 78
 * torna o percurso uma bijecao. Numa janela que ATRAVESSA a virada de passada,
 * nao vale — sao duas bijecoes diferentes coladas, e nada impede a ultima carta
 * de uma de reaparecer logo no comeco da outra.
 *
 * FOI MEDIDO, e o resultado condena a versao ingenua: com deslocamento zero em
 * todas as passadas, a menor distancia entre duas ocorrencias da mesma carta no
 * ciclo de 468 dias e SEIS DIAS. Seis e menor que nove. A garantia inteira caia
 * exatamente no ponto que ela mais promete, seis vezes a cada 468 dias, e nao
 * havia como descobrir isso lendo o codigo — so contando.
 *
 * A CORRECAO sao os DESLOCAMENTOS: um `b` proprio por passada, escolhido por
 * busca para maximizar a menor distancia entre repeticoes. Com a tabela abaixo a
 * menor distancia medida e 15 dias, contra os 9 do pior bloco — margem de 1,6x,
 * e agora a margem e REAL e nao presumida. `verificarBaralho()` recalcula esse
 * numero a partir das tabelas, entao a propriedade nao pode se perder em silencio
 * se alguem mexer nos multiplicadores.
 *
 * SEM DISCO, SEM SORTEIO, SEM ESTADO. Tudo sai de `n = diasDesdeEpoca(dia)`, do
 * mesmo jeito que lib/plano.js e lib/rituaisRotativos.js. Zero Math.random, zero
 * chave nova no storage, zero linha nova em CLAVES_HILO_ROJO — e o modulo
 * continua testavel sem mock.
 *
 * O RITUAL NAO ENTRA NA GARANTIA, de proposito. Cinco rituais numa janela de 9
 * dias repetem por casa dos pombos, e DEVEM repetir: o gesto precisa ficar
 * familiar. A escala de 12 posicoes de lib/rituaisRotativos.js ja impede o unico
 * caso intoleravel — o mesmo ritual dois dias seguidos — e impede por propriedade
 * da fila, sem estado. Nada a fazer aqui.
 * ================================================================================= */

/** Multiplicadores coprimos com 78 (78 = 2 x 3 x 13). Cada um percorre as 78
 *  cartas exatamente uma vez. Trocar a cada passada quebra a ADJACENCIA: a carta
 *  que veio depois da Torre em fevereiro nao e a que vem depois dela em junho. */
export const MULTIPLICADORES = Object.freeze([5, 7, 11, 17, 19, 23]);

/** Deslocamento por passada. NAO sao numeros bonitos: sao o resultado de uma
 *  busca por subida de encosta que maximiza a menor distancia entre repeticoes
 *  na virada de passada. Mexer neles sem rodar verificarBaralho() derruba a
 *  unica garantia deste bloco. */
export const DESLOCAMENTOS = Object.freeze([0, 55, 0, 30, 5, 55]);

export const TAMANHO_BARALHO = 78;
export const PASSADAS_DO_BARALHO = MULTIPLICADORES.length;
export const CICLO_DO_BARALHO = TAMANHO_BARALHO * PASSADAS_DO_BARALHO; // 468

/* Orientacao por um terceiro ciclo de comprimento 7 — coprimo com 78 e com 12,
 * entao ele nao entra em fase com o baralho nem com o ritual.
 *
 * Por que 7 e nao `n % 2`: alternancia simples e VISIVEL A OLHO NU na segunda
 * semana. "Direita, invertida, direita, invertida" e um padrao que a pessoa
 * percebe sem procurar, e no instante em que percebe, o sorteio deixou de
 * parecer sorteio. Tres invertidas em sete (~43%) nao tem esse ritmo. */
export const MASCARA_ORIENTACAO = Object.freeze([0, 1, 1, 0, 1, 0, 0]);
export const CICLO_DA_ORIENTACAO = MASCARA_ORIENTACAO.length;

/** Ciclo do ritual em lib/rituaisRotativos.js. Aqui so para a conta de mmc. */
export const CICLO_DO_RITUAL = 12;

function mod(a, n) {
  return ((a % n) + n) % n;
}

/**
 * O percurso aritmetico de um dia: qual carta, em que orientacao.
 *
 * @param {string|number} dia  'YYYY-MM-DD', ou o inteiro de diasDesdeEpoca.
 * @returns {Readonly<object>|null}
 *   - `indice`        0..77, a posicao no baralho
 *   - `passada`       0..5, qual multiplicador esta em uso
 *   - `invertida`     orientacao da carta
 *   - `multiplicador` / `deslocamento`  para conferir a conta de fora
 *   - `n`             o dia absoluto usado
 *
 * NAO escolhe a carta: devolve o indice. Quem tem o baralho e lib/mazo.js, e
 * este arquivo nao vai reimplementar 78 cartas para ter o que devolver.
 */
export function percursoDoBaralho(dia) {
  const n = typeof dia === 'number' ? (Number.isInteger(dia) ? dia : null) : diasDesdeEpoca(dia);
  if (n === null) return null;
  const passada = mod(Math.floor(n / TAMANHO_BARALHO), PASSADAS_DO_BARALHO);
  const multiplicador = MULTIPLICADORES[passada];
  const deslocamento = DESLOCAMENTOS[passada];
  return Object.freeze({
    n,
    indice: mod(multiplicador * n + deslocamento, TAMANHO_BARALHO),
    passada,
    multiplicador,
    deslocamento,
    invertida: MASCARA_ORIENTACAO[mod(n, CICLO_DA_ORIENTACAO)] === 1,
  });
}

/* =================================================================================
 * O ANO 2 — a unica coisa deste app que fica MELHOR no segundo ano
 *
 * O que de fato se repete no ano 2 sao os 13 TEMAS, na mesma ordem. Isso nao se
 * resolve com combinatoria — nenhuma quantidade de cartas impede a lunacao 14 de
 * ser o tema 1 de novo. Resolve-se com conteudo, em duas camadas, e as duas
 * dependem de `passada` e `lunacaoAbsoluta`, que este arquivo ja entrega:
 *
 *   PRIMEIRA. Cada tema carrega um segundo conjunto de textos, escolhido por
 *   `passada`. A lunacao 14 nao abre com o texto da lunacao 1.
 *
 *   SEGUNDA, e e a que vale o produto. Na segunda passada, cada tema CITA DE
 *   VOLTA, verbatim e com a data, o que ela escreveu naquele mesmo tema na
 *   primeira — o espelho do dia 7 de datos/ritual.js em escala de ano. Esse
 *   conteudo nao precisa ser escrito: e dela. Nao custa uma linha de texto novo
 *   e e a unica coisa do app que melhora sozinha com o tempo.
 *
 * QUANDO A PARTE ARITMETICA VOLTA A SE REPETIR: mmc(468, 12, 7) = 3.276 dias,
 * cerca de 9 anos. So entao a tripla (carta, ritual, orientacao) reencontra a
 * mesma configuracao — e mesmo ai o par (tema, fase) ja sera outro, porque ele
 * nao e aritmetico: sai da lua.
 *
 * O QUE NAO EXISTE, E POR QUE. Nao ha "aniversario de um ano" na data civil de
 * instalacao. Nessa data a lua esta ~11 dias adiantada em relacao ao ponto de
 * partida, e o tema 13 nem comecou ou ja vai fechando. Comemorar "a mesma lua
 * voltou" ali e fabricar ceu. Se um dia o app quiser esse marco, ele e a 13a lua
 * nova MEDIDA — que e exatamente `lunacaoAbsoluta === 14` — ou ele nao existe.
 * ================================================================================= */

export const ANIVERSARIO_LUNAR = Object.freeze({
  quando: 'lunacaoAbsoluta === 14',
  oQueE: 'a 13ª lua nova medida depois do início da jornada',
  oQueNaoE: 'a data civil de instalação mais 365 dias',
  porque: 'na data civil a lua está ~11 dias adiantada; comemorar a volta ali é fabricar céu',
});

/* =================================================================================
 * AS CHAVES DE TEXTO
 *
 * A lista fechada do que este motor emite para datos/textos.js, no mesmo molde de
 * CLAVES_TEXTO_PLANO em lib/plano.js: o portao de copy varre esta lista.
 *
 * O CUSTO DE CONTEUDO QUE PRECISA ESTAR ORCADO ANTES DA PRIMEIRA LINHA ESCRITA:
 * o teto real do app nao e a combinatoria, e o BARALHO. Se o texto de cada carta
 * for fixo por carta, ela reencontra o mesmo texto por volta do dia 78 e mais
 * tres vezes no ano, e os 40.560 do papel nao existem na percepcao. O texto da
 * carta tem de variar pelo menos por EIXO DE FASE — 4 versoes por carta = 312
 * textos — e de preferencia ser lido contra o tema da lunacao. Esse e o preco
 * verdadeiro desta arquitetura.
 * ================================================================================= */
export const CLAVES_TEXTO_ANO = Object.freeze([
  ...TEMAS.map((t) => `${t.chaveTexto}.titulo`),
  ...TEMAS.map((t) => `${t.chaveTexto}.pergunta`),
  ...TEMAS.map((t) => `${t.chaveTexto}.abertura`),
  ...TONS.map((f) => `ano.fase.${f.id}.tom`),
  ...TONS.map((f) => `ano.fase.${f.id}.pede`),
  'ano.virada.hoje',
  'ano.virada.dia',
  'ano.arquivo.titulo',
  'ano.arquivo.vazio',
]);

/* =================================================================================
 * O PORTAO
 *
 * Nao confia na leitura de ninguem: RECALCULA as propriedades que este arquivo
 * promete. Existe porque as tres garantias daqui — bijecao por passada, distancia
 * minima entre repeticoes, e o mmc de ~9 anos — sao invisiveis no codigo e
 * quebram em silencio. A distancia minima ja foi 6 antes desta versao, e nada
 * apontou para isso a nao ser contar.
 * ================================================================================= */

/** Menor distancia, em dias, entre duas aparicoes da mesma carta ao longo de todo
 *  o ciclo de 468 dias (contado ciclicamente, entao a volta do fim para o comeco
 *  tambem e medida — e justamente ali que a versao ingenua falhava). */
export function menorJanelaSemRepetir() {
  const posicoes = Array.from({ length: TAMANHO_BARALHO }, () => []);
  for (let n = 0; n < CICLO_DO_BARALHO; n += 1) {
    posicoes[percursoDoBaralho(n).indice].push(n);
  }
  let menor = Infinity;
  for (const lista of posicoes) {
    if (lista.length === 0) return 0;
    for (let i = 0; i < lista.length; i += 1) {
      const d =
        i + 1 < lista.length ? lista[i + 1] - lista[i] : lista[0] + CICLO_DO_BARALHO - lista[i];
      if (d < menor) menor = d;
    }
  }
  return menor;
}

function mmc(a, b) {
  const mdc = (x, y) => (y === 0 ? x : mdc(y, x % y));
  return (a / mdc(a, b)) * b;
}

/** O maior bloco (tema, fase) possivel, em dias. Um quarto de lunacao vai de 6,3
 *  a 8,4 dias; 9 e o teto com folga, e e o numero contra o qual a garantia do
 *  baralho e medida. */
export const MAIOR_BLOCO_DIAS = 9;

/**
 * Reprova as garantias do arquivo. { ok, problemas, medidas }.
 * Serve de teste e de sonda em desenvolvimento — problemas em vez de excecao,
 * porque quem chama quer a LISTA, nao o primeiro erro.
 */
export function verificarAno() {
  const problemas = [];

  if (TEMAS.length !== 13) problemas.push(`temas: ${TEMAS.length}, esperado 13`);
  TEMAS.forEach((t, i) => {
    if (t.numero !== i + 1) problemas.push(`tema ${i}: numero ${t.numero} fora de ordem`);
  });
  if (new Set(TEMAS.map((t) => t.id)).size !== TEMAS.length) problemas.push('id de tema repetido');
  if (TEMAS.some((t) => t.exigeEstado !== false)) {
    problemas.push('algum tema exige estado emocional — todo tema aceita "este mês não"');
  }

  // Todo bloco de tema tem de ser um valor de BLOCOS, e BLOCOS tem de casar com os
  // ids de ARCO em datos/lunacoes.js. O quinto bloco ja divergiu ('volta' aqui,
  // 'fechamento' la) e o efeito era invisivel: `ARCO[tema.bloco]` undefined nos
  // temas 12 e 13, so nos dois ultimos meses do ano.
  const blocosValidos = new Set(Object.values(BLOCOS));
  TEMAS.forEach((t) => {
    if (!blocosValidos.has(t.bloco)) {
      problemas.push(`tema ${t.numero}: bloco "${t.bloco}" não é um valor de BLOCOS`);
    }
  });

  if (TONS.length !== 4) problemas.push(`tons: ${TONS.length}, esperado 4`);
  TONS.forEach((f, i) => {
    if (f.quadrante !== i) problemas.push(`tom ${i}: quadrante ${f.quadrante} fora de ordem`);
    if (f.terceiraPessoaComoSujeito !== false) {
      problemas.push(`tom ${f.id}: a outra pessoa não pode ser sujeito de verbo`);
    }
  });
  if (TONS.filter((f) => f.pedeEscrita).length !== 1) {
    problemas.push('a escrita é pedida por exatamente uma fase, a cheia');
  }
  if (TONS.filter((f) => f.subtrativo).length !== 1) {
    problemas.push('a subtração é pedida por exatamente uma fase, a minguante');
  }
  const semEncontro = TONS.filter((f) => !f.permiteGestoDeEncontro);
  if (semEncontro.length !== 1 || semEncontro[0].quadrante !== 2) {
    problemas.push('só a fase cheia pode recusar gesto de encontro, e ela tem de recusar');
  }

  // Cada passada percorre as 78 cartas exatamente uma vez.
  for (let p = 0; p < PASSADAS_DO_BARALHO; p += 1) {
    const vistos = new Set();
    for (let k = 0; k < TAMANHO_BARALHO; k += 1) {
      vistos.add(percursoDoBaralho(p * TAMANHO_BARALHO + k).indice);
    }
    if (vistos.size !== TAMANHO_BARALHO) {
      problemas.push(`passada ${p}: ${vistos.size} cartas distintas, esperado ${TAMANHO_BARALHO}`);
    }
  }

  const janela = menorJanelaSemRepetir();
  if (janela <= MAIOR_BLOCO_DIAS) {
    problemas.push(
      `carta repete em ${janela} dias, e o maior bloco (tema, fase) tem ${MAIOR_BLOCO_DIAS} — a quíntupla repete dentro do bloco`,
    );
  }

  const invertidas = MASCARA_ORIENTACAO.filter((b) => b === 1).length;
  if (invertidas === 0 || invertidas === CICLO_DA_ORIENTACAO) {
    problemas.push('a máscara de orientação não pode ser constante');
  }

  const cicloTotal = mmc(mmc(CICLO_DO_BARALHO, CICLO_DO_RITUAL), CICLO_DA_ORIENTACAO);

  return Object.freeze({
    ok: problemas.length === 0,
    problemas: Object.freeze(problemas),
    medidas: Object.freeze({
      temas: TEMAS.length,
      tons: TONS.length,
      blocosPossiveis: TEMAS.length * TONS.length,
      grausDeLiberdadeDoDia: 5 * TAMANHO_BARALHO * 2,
      cicloDoBaralho: CICLO_DO_BARALHO,
      menorJanelaSemRepetir: janela,
      maiorBlocoDias: MAIOR_BLOCO_DIAS,
      margem: Math.round((janela / MAIOR_BLOCO_DIAS) * 100) / 100,
      cicloAritmeticoDias: cicloTotal,
      cicloAritmeticoAnos: Math.round((cicloTotal / ANO_TROPICO_DIAS) * 100) / 100,
    }),
  });
}

export default {
  TEMAS,
  TONS,
  BLOCOS,
  MOTIVOS,
  EXPLICACAO_TECNICA,
  ORIGENS_DO_TEMA,
  AVISO_APROXIMACAO,
  AVISO_RUDHYAR,
  ANIVERSARIO_LUNAR,
  FATO_DA_VOLTA,
  CLAVES_TEXTO_ANO,
  lunacaoDe,
  posicaoNoAno,
  proximaVirada,
  temaPorNumero,
  temaPorId,
  tomPorQuadrante,
  quadranteDaLongitude,
  percursoDoBaralho,
  menorJanelaSemRepetir,
  verificarAno,
  hayLunaciones,
};
