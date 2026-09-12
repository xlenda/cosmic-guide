// lib/diagnostico.js
// O CRUZAMENTO — as linhas que o app monta cruzando o que ELA deu, e o recibo
// de cada uma.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE (01/09)
// ===========================================================================
// O fechamento das tres cartas dizia: "daqui para a frente a leitura sai do
// baralho de 78 cartas, uma tirada por dia, e essa sim e embaralhada na hora".
// Era FALSO no lugar em que estava escrito — a promessa daquele paragrafo e
// sobre o que vem DEPOIS da leitura de entrada, e o que vem depois e o plano,
// que nao tira carta nenhuma.
//
// Uma copy falsa se conserta de dois jeitos. O barato e apagar a frase. O caro,
// e o unico que vale, e fazer existir a coisa que a frase prometia. Este modulo
// e a coisa: o app cruza o signo (derivado da data, nunca perguntado), a idade
// (da mesma data) e as cinco respostas da historia, e cada linha que sai daqui
// CARREGA A PROPRIA CONTA.
//
// ===========================================================================
// O RECIBO — o mesmo principio do Cosmic Guide
// ===========================================================================
// Toda linha traz `conta`: os dados crus que entraram nela, do jeito que estao
// gravados ('P4 = "cero-contacto"', '1994-07-13 -> Cancer (agua)'). Nao e
// enfeite de transparencia: e o que impede o proximo a editar de escrever uma
// linha que soa pessoal sem estar ligada a dado nenhum. Linha sem conta nao sai
// daqui, porque nao ha como escrever a conta de uma coisa que ninguem mediu.
//
// ===========================================================================
// AS QUATRO REGRAS DURAS
// ===========================================================================
// 1. DESCREVE, NUNCA PREVE. Nenhuma linha diz o que vai acontecer. O signo NAO
//    determina comportamento e este arquivo nao diz que determina: ele entra
//    como VOCABULARIO (o elemento e a imagem com que a lunacao fala), e a
//    propria linha do signo escreve isso na cara — "imagem e vocabulario, nao
//    causa". Uma frase do tipo "pessoas de Aries sao assim" nao existe aqui e
//    nao pode existir: nenhuma linha fala de um grupo, todas falam DELA.
//
// 2. NUNCA FALA DA OUTRA PESSOA. O app nao coleta nada sobre quem esta do outro
//    lado e nunca vai coletar. Por isso os rotulos de P4 daqui sao NOSSOS e sao
//    SEM AGENTE ("chegam mensagens sem padrao"), e nao o texto da opcao, que diz
//    "essa pessoa me escreve". A diferenca parece cosmetica e nao e: com o texto
//    da opcao entrando cru, a unica coisa que separaria este modulo de falar
//    pela outra pessoa seria a sorte de ninguem ter escrito uma opcao pior.
//    Com rotulo proprio, o portao de test/diagnostico.test.js pode ser cego e
//    absoluto — nenhuma linha contem 'ela', 'ele', 'essa pessoa' — e um portao
//    absoluto e o unico que nao envelhece.
//
// 3. DADO QUE FALTA = LINHA QUE NAO RENDERIZA. Sem aproximacao, sem
//    "provavelmente", sem versao curta. Isso vale ATE para o genero: datos/
//    preguntas.js:generoDe() devolve 'prefiro-nao-dizer' quando nao ha resposta,
//    e ali esta certo (o app precisa de um jeito de falar). Aqui NAO: 'prefiro-
//    nao-dizer' e uma resposta que ela deu, e ausencia de resposta e ausencia.
//    Usar o padrao aqui faria a linha do tratamento aparecer para quem nunca
//    respondeu P7 — uma linha do recibo cobrando um dado que ninguem deu.
//
// 4. CADA LINHA CRUZA DOIS OU MAIS DADOS. Uma linha de um dado so nao e
//    cruzamento: e a resposta dela devolvida em outra fonte. O portao mede isso.
//
// ===========================================================================
// PURO E DETERMINISTICO
// ===========================================================================
// Nao le disco, nao ve tela, nao sorteia, nao lanca. O UNICO relogio e o default
// de `hoje` (a idade precisa de uma referencia), e ele e argumento justamente
// para o teste poder fixar a data — a mesma disciplina de
// fechaDeNacimientoPlausible() em datos/preguntas.js.
//
// E NAO DEPENDE DE EFEMERIDE. lib/ano.js e lib/ceu.js podem estar mudos num
// aparelho sem astronomy-engine; o cruzamento sai inteiro do mesmo jeito, porque
// tudo que ele usa e a data dela, a aritmetica do calendario e cinco ids.

import { IDS_GENERO } from '../datos/preguntas.js';
import { SIGNOS, esFechaReal, idadeEm, nomeDoSigno, signoInfoFromDate } from './signo.js';

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * O VOCABULARIO DOS DADOS
 * =================================================================================
 * `usados` nao pode ser texto livre: e o recibo, e recibo com nome inventado a
 * cada linha nao se confere. Estes sao os nove dados que existem, e nenhuma
 * linha pode declarar um decimo.
 * ================================================================================= */
export const DADOS = Object.freeze({
  NASCIMENTO: 'nascimento',
  SIGNO: 'signo',
  IDADE: 'idade',
  GENERO: 'genero',
  NOME: 'nome',
  CORTE: 'corte',
  TEMPO: 'tempo',
  CONTATO: 'contato',
  INTENCAO: 'intencao',
});

/** A ordem canonica do recibo. `usados` do topo sai SEMPRE nesta ordem, e nao na
 *  ordem em que as linhas calharam de sair: assim duas execucoes iguais dao a
 *  mesma lista, e o teste compara sem ordenar. */
export const ORDEM_DOS_DADOS = Object.freeze([
  DADOS.NASCIMENTO,
  DADOS.SIGNO,
  DADOS.IDADE,
  DADOS.GENERO,
  DADOS.NOME,
  DADOS.CORTE,
  DADOS.TEMPO,
  DADOS.CONTATO,
  DADOS.INTENCAO,
]);

/* =================================================================================
 * OS ROTULOS — nossos, e por que nao sao o texto das opcoes
 * =================================================================================
 * Cada tabela cobre TODOS os ids da pergunta correspondente em datos/preguntas.js.
 * Id sem rotulo devolve null e a linha some (regra 3), entao acrescentar uma
 * opcao la sem acrescentar o rotulo aqui nao produz frase errada — produz
 * silencio, que e o modo certo de falhar. O portao mede a cobertura das cinco
 * tabelas contra as opcoes reais, para que esse silencio nao passe despercebido.
 *
 * SEM AGENTE, sempre. Os rotulos de P4 descrevem um ESTADO que ela declarou
 * ("houve uma mensagem sua e nenhuma resposta"), nunca uma acao de quem esta do
 * outro lado. Ver a regra 2 no cabecalho.
 * ================================================================================= */

const ROTULO_CORTE = congelar({
  pelea: 'uma discussão forte que rompeu tudo de uma vez',
  distancia: 'um afastamento aos poucos, sem briga',
  ruptura: 'um término dito com todas as letras',
  'me-arrepenti': 'um término que partiu de você e do qual você se arrependeu',
  'nunca-empezo': 'algo que nunca chegou a começar',
});

const ROTULO_TEMPO = congelar({
  dias: 'faz dias',
  semanas: 'faz umas semanas',
  'meses-1-3': 'faz de um a três meses',
  'meses-3-12': 'faz de três meses a um ano',
  'mas-de-un-ano': 'faz mais de um ano',
});

const ROTULO_CONTATO = congelar({
  hablamos: 'há conversa, mesmo que diferente da de antes',
  'le-escribi-no-responde': 'houve uma mensagem sua e nenhuma resposta',
  'cero-contacto': 'não há contato nenhum dos dois lados',
  'me-escribe-a-veces': 'chegam mensagens de vez em quando, sem regularidade nenhuma',
  bloqueo: 'há um bloqueio no meio',
});

const ROTULO_INTENCAO = congelar({
  'entender-que-paso': 'entender o que se rompeu',
  'entender-mi-parte': 'ver qual foi a sua parte',
  'decidir-insistir-o-soltar': 'decidir entre insistir e soltar',
  'entender-que-diria': 'saber o que você diria numa conversa',
  'entender-para-cerrar': 'entender o suficiente para fechar o assunto',
});

/* P7. A terceira opcao tem rotulo INTEIRO, e nao um remendo que troca a palavra
 * no ultimo segundo: quem escolhe 'prefiro-nao-dizer' recebe a mesma linha, com
 * a mesma conta, so que dita sem marca de genero. */
const ROTULO_TRATAMENTO = congelar({
  mulher: 'no feminino',
  homem: 'no masculino',
  'prefiro-nao-dizer': 'sem marca de gênero',
});

/** Exportadas para o portao conferir cobertura contra datos/preguntas.js — e para
 *  QA responder "de onde saiu esta frase?" sem abrir o codigo. */
export const ROTULOS = congelar({
  corte: ROTULO_CORTE,
  tempo: ROTULO_TEMPO,
  contato: ROTULO_CONTATO,
  intencao: ROTULO_INTENCAO,
  tratamento: ROTULO_TRATAMENTO,
});

/* =================================================================================
 * LEITURA DA ENTRADA — nada aqui chuta
 * ================================================================================= */

function texto(valor) {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : null;
}

function rotulo(tabela, id) {
  const chave = texto(id);
  return chave && Object.prototype.hasOwnProperty.call(tabela, chave) ? tabela[chave] : null;
}

/* A data de nascimento aceita as DUAS grafias: 'nacimiento' e a chave gravada em
 * datos/preguntas.js (P6) e continua sendo o nome no disco; 'nascimento' e o
 * nome do argumento deste modulo. Ler so uma das duas faria o cruzamento sumir
 * conforme quem chamou — e sumir em silencio, que e a regra 3 virando bug. */
function fechaDe(entrada, respostas) {
  const candidatos = [
    entrada.nascimento,
    entrada.nacimiento,
    respostas.nacimiento,
    respostas.nascimento,
  ];
  for (const c of candidatos) {
    const s = texto(c);
    if (s && esFechaReal(s)) return s;
  }
  return null;
}

/* =================================================================================
 * A FUNCAO PUBLICA
 * ================================================================================= */

/**
 * O cruzamento.
 *
 * @param {object} entrada
 * @param {string} [entrada.nascimento] 'YYYY-MM-DD'. Data que nao existe no
 *   calendario e o mesmo que data ausente — nunca e "corrigida".
 * @param {string} [entrada.signo] RESERVA. O signo e DERIVADO da data
 *   (datos/preguntas.js nao o pergunta), entao com data valida a data GANHA e
 *   este argumento e ignorado; ele so entra quando nao ha data. Divergencia
 *   entre os dois sobe em `conflitoDeSigno` para QA — nao lanca e nao escolhe o
 *   argumento "porque o chamador insistiu".
 * @param {string} [entrada.genero] um dos tres ids de IDS_GENERO. Qualquer outra
 *   coisa (inclusive ausencia) e ausencia: aqui NAO ha padrao neutro. Ver a
 *   regra 3 no cabecalho.
 * @param {object} [entrada.respostas] as respostas do onboarding.
 * @param {Date}   [entrada.hoje] referencia da idade. Unico relogio do modulo.
 * @param {number} [entrada.idade] atalho para quem ja calculou. Ignorado quando
 *   nao e inteiro >= 0.
 *
 * @returns {Readonly<object>} congelado:
 *   - `linhas`  [{ id, texto, conta, usados }], na ordem fixa deste arquivo.
 *               Cada uma cruza DOIS OU MAIS dados e declara quais.
 *   - `usados`  a uniao dos `usados` das linhas, em ORDEM_DOS_DADOS.
 *   - `faltando` os dados que nao vieram, em ORDEM_DOS_DADOS. Existe para a tela
 *               poder dizer o que ainda nao entrou na conta — nunca para
 *               preencher a falta com estimativa.
 *   - `signo` / `idade` / `elemento`  o que foi derivado, ou null.
 *   - `conflitoDeSigno` null, ou { daData, doArgumento }.
 */
export function diagnosticoDe(entrada = {}) {
  const e = entrada && typeof entrada === 'object' ? entrada : {};
  const respostas = e.respostas && typeof e.respostas === 'object' ? e.respostas : {};

  /* --- os dados, um a um. Cada um vira valor ou null; nenhum vira palpite. --- */
  const fecha = fechaDe(e, respostas);

  const infoDaData = fecha ? signoInfoFromDate(fecha) : null;
  const doArgumento = nomeDoSigno(e.signo);
  const conflitoDeSigno =
    infoDaData && doArgumento && doArgumento !== infoDaData.nome
      ? Object.freeze({ daData: infoDaData.nome, doArgumento })
      : null;
  /* A data ganha. Ela e a fonte declarada em datos/preguntas.js e e a unica das
   * duas que o app pode conferir. */
  const info = infoDaData || (doArgumento ? signoInfoPorNome(doArgumento) : null);
  const signo = info ? info.nome : null;
  const elemento = info ? info.elemento : null;

  const idadeDada = Number.isInteger(e.idade) && e.idade >= 0 ? e.idade : null;
  const idade = idadeDada !== null ? idadeDada : fecha ? idadeEm(fecha, hojeDe(e.hoje)) : null;

  const genero = IDS_GENERO.includes(e.genero) ? e.genero : null;
  const nome = texto(respostas.nombre) || texto(respostas.nome);

  const corte = rotulo(ROTULO_CORTE, respostas.corte);
  const tempo = rotulo(ROTULO_TEMPO, respostas.cuando);
  const contato = rotulo(ROTULO_CONTATO, respostas.hoy);
  const intencao = rotulo(ROTULO_INTENCAO, respostas.intencion);
  const tratamento = genero ? ROTULO_TRATAMENTO[genero] : null;

  const linhas = [];
  const juntar = (id, campos, corpo, conta) => {
    // A linha so nasce com TODOS os campos dela em pe (regra 3) e so vale como
    // cruzamento com dois ou mais (regra 4). As duas condicoes moram aqui, num
    // lugar so, para que nenhuma linha nova possa escapar de uma delas.
    if (campos.some((c) => c === null || c === undefined)) return;
    const usados = ordenar(dedup(campos.map((c) => c.dado)));
    if (usados.length < 2) return;
    linhas.push(Object.freeze({ id, texto: corpo, conta, usados: Object.freeze(usados) }));
  };

  const D = (dado, valor) => (valor === null || valor === undefined ? null : { dado, valor });

  /* --- 1. A HISTORIA: o que se rompeu x ha quanto tempo ---------------------- */
  juntar(
    'historia',
    [D(DADOS.CORTE, corte), D(DADOS.TEMPO, tempo)],
    `Você marcou ${corte}, e ${tempo}. É desse par que sai o ponto por onde o plano começa: `
      + 'o plano não escolhe entre as duas respostas, usa as duas.',
    `P2 = "${respostas.corte}" + P3 = "${respostas.cuando}"`
  );

  /* --- 2. A POSICAO: o contato declarado x o que ela pediu -------------------
   * Este par e o que trava ou destrava a acao do dia em lib/plano.js. A linha
   * DIZ isso, porque um filtro que age sem ser dito e o mesmo que uma camada
   * secreta — e datos/textos.js ja promete que nao ha nenhuma. */
  juntar(
    'posicao',
    [D(DADOS.CONTATO, contato), D(DADOS.INTENCAO, intencao)],
    `Hoje ${contato}, e o que você pediu foi ${intencao}. O plano lê as duas juntas: `
      + 'o que você quer entender passa pelo contato que você declarou ter, e não pelo contrário.',
    `P4 = "${respostas.hoy}" + P5 = "${respostas.intencion}"`
  );

  /* --- 3. OS DOIS NUMEROS: a idade x a distancia do corte -------------------- */
  juntar(
    'numeros',
    [D(DADOS.IDADE, idade), D(DADOS.TEMPO, tempo)],
    `Você tem ${idade} anos completos e marcou que ${tempo}. São os dois números que o plano `
      + 'usa para dosar o ritmo, e nenhum dos dois foi arredondado.',
    `${fecha || '—'} → ${idade} anos completos + P3 = "${respostas.cuando}"`
  );

  /* --- 4. O SIGNO: derivado da data x o que ela pediu ------------------------
   * A linha mais perigosa do arquivo, e por isso e a que mais se explica. O
   * signo entra como IMAGEM — o elemento vira o vocabulario da lunacao — e a
   * propria frase recusa a leitura determinista na mesma respiracao. Sem essa
   * recusa escrita, "Cancer, elemento agua" ao lado de uma intencao vira, para
   * quem le, uma causa; e ninguem precisa escrever "pessoas de Cancer sao
   * assim" para que a frase diga isso. */
  juntar(
    'signo',
    [D(DADOS.NASCIMENTO, fecha), D(DADOS.SIGNO, signo), D(DADOS.INTENCAO, intencao)],
    `${signo} não foi perguntado: saiu da data que você deu. É um signo de ${elemento}, e `
      + `${elemento} é a imagem com que o plano fala de ${intencao}. Imagem é vocabulário, não `
      + 'causa: o signo não decide nada do que você faz.',
    `${fecha} → ${signo} (${elemento}) + P5 = "${respostas.intencion}"`
  );

  /* --- 5. O TRATAMENTO: o nome dela x o genero dela --------------------------
   * O unico uso do genero no app inteiro, dito na cara. E ele e sobre ELA: sobre
   * quem esta do outro lado o app continua sem perguntar nada. */
  juntar(
    'tratamento',
    [D(DADOS.NOME, nome), D(DADOS.GENERO, tratamento)],
    `${nome}, você pediu que a leitura falasse com você ${tratamento}. É só isso que essa `
      + 'resposta muda: as palavras com que a leitura se dirige a você, e mais nada.',
    `P1 = "${nome}" + P7 = "${respostas.genero || e.genero}"`
  );

  const usados = ordenar(dedup(linhas.flatMap((l) => l.usados)));
  const presentes = {
    [DADOS.NASCIMENTO]: fecha,
    [DADOS.SIGNO]: signo,
    [DADOS.IDADE]: idade,
    [DADOS.GENERO]: genero,
    [DADOS.NOME]: nome,
    [DADOS.CORTE]: corte,
    [DADOS.TEMPO]: tempo,
    [DADOS.CONTATO]: contato,
    [DADOS.INTENCAO]: intencao,
  };
  const faltando = ORDEM_DOS_DADOS.filter(
    (d) => presentes[d] === null || presentes[d] === undefined
  );

  return Object.freeze({
    linhas: Object.freeze(linhas),
    usados: Object.freeze(usados),
    faltando: Object.freeze(faltando),
    signo,
    elemento,
    idade,
    conflitoDeSigno,
  });
}

/* =================================================================================
 * FERRAMENTAS
 * ================================================================================= */

function hojeDe(valor) {
  return valor instanceof Date && !Number.isNaN(valor.getTime()) ? valor : new Date();
}

function dedup(lista) {
  return [...new Set(lista)];
}

function ordenar(lista) {
  return ORDEM_DOS_DADOS.filter((d) => lista.includes(d));
}

/* O objeto do signo a partir do NOME canonico. lib/signo.js expoe a busca pela
 * DATA (signoInfoFromDate) e a normalizacao (nomeDoSigno); falta a ponte entre
 * as duas, e ela so serve ao caso de reserva do argumento `signo`.
 *
 * O mapa e montado a partir de SIGNOS — a lista de lib/signo.js, nunca uma
 * copia. Uma tabela de doze signos escrita aqui seria a segunda tabela que
 * discorda da primeira, que e o defeito que BLOCOS/ARCO ja custou em lib/ano.js. */
const SIGNOS_POR_NOME = new Map(SIGNOS.map((s) => [s.nome, s]));

function signoInfoPorNome(nome) {
  return SIGNOS_POR_NOME.get(nome) || null;
}

export default {
  DADOS,
  ORDEM_DOS_DADOS,
  ROTULOS,
  diagnosticoDe,
};
