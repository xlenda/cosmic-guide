// lib/signo.js
// O SIGNO SOLAR A PARTIR DA DATA DE NASCIMENTO — e a idade que sai da mesma data.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE
// ===========================================================================
// A partir de 01/09 o onboarding pergunta a DATA DE NASCIMENTO (P6). O signo
// nao e perguntado: ele e DERIVADO daqui. Pedir a data e depois pedir o signo
// numa lista seria pedir duas vezes o mesmo dado e ainda por cima abrir a porta
// para os dois se contradizerem dentro do mesmo perfil.
//
// Modulo PURO e sincrono: nao le disco, nao ve tela, nao sorteia nada. Recebe
// uma string 'YYYY-MM-DD' e devolve um nome de signo (ou null). Nunca lanca.
//
// ===========================================================================
// A ARMADILHA QUE JA CUSTOU CARO — e por que aqui NAO existe tabela de datas
// ===========================================================================
// Este calculo e portado do Cosmic Guide (lib/signs.js: signoFromDate;
// lib/synastry.js: nomeDoSigno). O codigo foi COPIADO, nao importado: os dois
// projetos nao se enxergam, e um import entre repositorios seria uma dependencia
// invisivel que quebra no dia em que aquela pasta mudar de lugar.
//
// O que se porta e a VERSAO CERTA, e o registro do erro vem junto porque ele e a
// razao de a versao certa existir:
//
//   Havia la uma tabela de datas fixas ("21/03 a 19/04 e Aries"). Medida contra
//   a efemeride real em 22.280 datas de 1950 a 2010, ela errava 248 — 1,11%, uma
//   a cada noventa. E o erro nao era aleatorio: as cuspides do calendario andam
//   quase um dia a cada quatro anos por causa dos bissextos, entao a tabela
//   chegava SEMPRE atrasada e devolvia o signo SEGUINTE a quem nasceu na virada.
//   So Escorpiao->Libra eram 39 datas.
//
//   No lugar dela entrou a longitude ecliptica do Sol pela formula de baixa
//   precisao do Astronomical Almanac (USNO, secao C): quatro linhas, erro abaixo
//   de 0,02 grau entre 1950 e 2050 — cerca de 30 minutos de movimento solar.
//   Medida contra o proprio motor astronomico em 36.890 datas, ela erra 4
//   (0,011%), e as quatro caem a menos de meio grau da cuspide exata.
//
// Por isso NAO EXISTE NESTE ARQUIVO NENHUMA TABELA DE INTERVALOS DE DATA — nem
// para exibir. Um campo "21/03 a 19/04" ao lado do nome do signo e um convite
// para o proximo a editar decidir o signo por ele "porque ja estava ali". O que
// decide e o Sol, e ele mora nas duas contas abaixo.
//
// Errar o signo de alguem nao e um detalhe: e errar a unica coisa que a pessoa ja
// sabia antes de abrir o app — e o erro cai justamente em quem nasceu na
// fronteira, que e quem MAIS presta atencao nisso.
//
// ===========================================================================
// OS DOIS CAMINHOS, E POR QUE ELES CONCORDAM
// ===========================================================================
// 1. astronomy-engine (ja e dependencia do package.json): longitude ecliptica
//    APARENTE do Sol na data. E o caminho do aparelho.
// 2. A formula do USNO: reserva para quando o require nao resolver — e o que
//    acontece nos testes em Node ESM, onde `require` nem existe. E de proposito:
//    o portao de test/signo.test.js compara os DOIS caminhos data a data, entao a
//    reserva e medida contra o motor real a cada `npm test`.
//
// O require e preguicoso e protegido por try/catch pelo mesmo motivo de
// lib/almacen.js: o modulo resolver nao prova nada, quem estoura e a chamada.
//
// ===========================================================================
// HORA E LUGAR DE NASCIMENTO: NAO SE PEDE, E NAO SE FINGE QUE SE TEM
// ===========================================================================
// O app pergunta o DIA e mais nada — sem hora, sem cidade, sem fuso. A leitura e
// feita ao meio-dia UTC, que e o instante que menos erra dentro do dia: o Sol
// anda cerca de 1 grau por dia, entao a metade do dia e o ponto de menor
// distancia ate qualquer hora real de nascimento. Quem nasceu nas horas exatas de
// uma virada de signo pode receber o vizinho — e isso e honesto e conhecido,
// diferente de inventar uma hora que a pessoa nunca deu.
//
// Nao ha Ascendente, nao ha Lua e nao ha mapa: essas contas precisam de hora e de
// lugar, e este app nao coleta nem um nem outro (screens/PrivacidadScreen.js).

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/**
 * Os doze, NA ORDEM DO ZODIACO — e a ordem e o contrato: o indice de cada um e
 * o resultado de Math.floor(longitude / 30). Reordenar esta lista troca o signo
 * de todo mundo, entao ela nao se ordena por nada que nao seja o ceu.
 *
 * `id` e chave tecnica (sem acento, minusculo), na mesma convencao dos ids de
 * datos/preguntas.js: e o que o codigo compara. `nome` e o que a tela mostra.
 */
export const SIGNOS = congelar([
  { id: 'aries', nome: 'Áries', elemento: 'fogo', emoji: '♈' },
  { id: 'touro', nome: 'Touro', elemento: 'terra', emoji: '♉' },
  { id: 'gemeos', nome: 'Gêmeos', elemento: 'ar', emoji: '♊' },
  { id: 'cancer', nome: 'Câncer', elemento: 'água', emoji: '♋' },
  { id: 'leao', nome: 'Leão', elemento: 'fogo', emoji: '♌' },
  { id: 'virgem', nome: 'Virgem', elemento: 'terra', emoji: '♍' },
  { id: 'libra', nome: 'Libra', elemento: 'ar', emoji: '♎' },
  { id: 'escorpiao', nome: 'Escorpião', elemento: 'água', emoji: '♏' },
  { id: 'sagitario', nome: 'Sagitário', elemento: 'fogo', emoji: '♐' },
  { id: 'capricornio', nome: 'Capricórnio', elemento: 'terra', emoji: '♑' },
  { id: 'aquario', nome: 'Aquário', elemento: 'ar', emoji: '♒' },
  { id: 'peixes', nome: 'Peixes', elemento: 'água', emoji: '♓' },
]);

/**
 * Valida estritamente uma data 'YYYY-MM-DD'. Rejeita o formato errado E as datas
 * impossiveis do calendario ('2023-02-29' fora de bissexto, '2023-04-31') que o
 * construtor Date aceitaria em silencio "rolando" para o mes seguinte.
 * Devolve { ano, mes, dia } quando a data e real, ou null — nunca fabrica.
 */
export function partesDaFecha(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return null;
  const ano = +m[1];
  const mes = +m[2];
  const dia = +m[3];
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  // O calendario de verdade: 31/04 e 29/02 de ano comum morrem aqui.
  const d = new Date(Date.UTC(ano, mes - 1, dia, 12));
  if (Number.isNaN(d.getTime())) return null;
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() + 1 !== mes || d.getUTCDate() !== dia) {
    return null;
  }
  return { ano, mes, dia };
}

/** true quando a string e uma data real do calendario. Sem faixa de anos: a
 *  faixa plausivel e regra de PRODUTO e mora em datos/preguntas.js, junto do
 *  campo que a pede. Aqui so se responde "existe este dia?". */
export function esFechaReal(dateStr) {
  return partesDaFecha(dateStr) !== null;
}

// O motor astronomico. Mesmo padrao de lib/almacen.js: require preguicoso dentro
// de try/catch. Em Node ESM (os testes) `require` nao existe, o catch pega o
// ReferenceError e o calculo cai na formula do USNO — que e exatamente o caminho
// que test/signo.test.js mede contra o motor.
let _Astronomia;
function getAstronomia() {
  if (_Astronomia !== undefined) return _Astronomia;
  try {
    // eslint-disable-next-line no-undef
    const mod = require('astronomy-engine');
    _Astronomia = (mod && (mod.default || mod)) || null;
  } catch {
    _Astronomia = null;
  }
  return _Astronomia;
}

/** So para o teste: esquece o motor ja resolvido. Nunca chamado em producao. */
export function _reiniciarMotorParaTests() {
  _Astronomia = undefined;
}

/**
 * Longitude ecliptica aparente do Sol, em graus [0, 360), ao MEIO-DIA UTC do dia
 * pedido, pela formula de baixa precisao do Astronomical Almanac (USNO, secao C).
 * Quatro linhas, erro abaixo de 0,02 grau entre 1950 e 2050.
 */
function longitudeSolarUSNO({ ano, mes, dia }) {
  const diasJ2000 = (Date.UTC(ano, mes - 1, dia, 12) - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const rad = Math.PI / 180;
  const g = (357.528 + 0.9856003 * diasJ2000) * rad; // anomalia media
  const L = 280.46 + 0.9856474 * diasJ2000; // longitude media
  const lon = L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  return ((lon % 360) + 360) % 360;
}

/**
 * O SIGNO SOLAR de uma data 'YYYY-MM-DD'.
 *
 * Devolve o NOME do signo (string de SIGNOS[].nome) ou null quando a data nao e
 * uma data real. Nunca lanca e nunca chuta: sem data valida nao ha signo.
 *
 * @param {string} dateStr data de nascimento no formato 'YYYY-MM-DD'
 * @returns {string|null}
 */
export function signoFromDate(dateStr) {
  const partes = partesDaFecha(dateStr);
  if (!partes) return null;

  const A = getAstronomia();
  if (A && typeof A.Ecliptic === 'function' && typeof A.GeoVector === 'function') {
    try {
      const instante = new Date(Date.UTC(partes.ano, partes.mes - 1, partes.dia, 12));
      // Longitude ecliptica APARENTE da data — o mesmo referencial tropico que a
      // tradicao usa desde Ptolomeu (Tetrabiblos I.22: os signos comecam nos
      // equinocios e solsticios, que sao INSTANTES e nao datas de calendario).
      const sol = A.Ecliptic(A.GeoVector(A.Body.Sun, instante, true));
      const lon = ((sol.elon % 360) + 360) % 360;
      const s = SIGNOS[Math.floor(lon / 30)];
      if (s) return s.nome;
    } catch {
      // cai na reserva abaixo
    }
  }

  return SIGNOS[Math.floor(longitudeSolarUSNO(partes) / 30)].nome;
}

/** O objeto inteiro do signo (nome, elemento, emoji) a partir da data. */
export function signoInfoFromDate(dateStr) {
  const nome = signoFromDate(dateStr);
  return nome ? SIGNOS.find((s) => s.nome === nome) || null : null;
}

/**
 * O nome canonico de um signo, aceitando o `id`, o proprio nome, ou o nome sem
 * acento e em qualquer caixa ("leao", "LEÃO", "Leão" -> "Leão").
 *
 * Portado de nomeDoSigno() do Cosmic Guide, que la traduzia entre packs de
 * idioma. Aqui o app fala uma lingua so (portugues do Brasil), entao a funcao
 * faz o que sobra dela e continua sendo util: NORMALIZAR. Serve para que
 * nenhuma tela precise comparar strings acentuadas na mao.
 *
 * Devolve null quando nao e signo nenhum — nunca devolve a entrada crua, porque
 * isso deixaria lixo digitado passar por nome de signo.
 */
export function nomeDoSigno(bruto) {
  if (!bruto || typeof bruto !== 'string') return null;
  const chave = normalizar(bruto);
  const achado = SIGNOS.find((s) => normalizar(s.nome) === chave || s.id === chave);
  return achado ? achado.nome : null;
}

/** minusculo, sem acento e sem espaco nas pontas. Base da comparacao acima. */
function normalizar(texto) {
  return String(texto)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * A IDADE EM ANOS COMPLETOS na data de referencia.
 *
 * Conta por aniversario e nao por divisao de milissegundos: (hoje - nascimento)
 * / 365,25 erra em quem tem aniversario perto de hoje, e essa e justamente a
 * conta que aparece na tela de alguem no dia do proprio aniversario.
 *
 * @param {string} dateStr    nascimento 'YYYY-MM-DD'
 * @param {Date}   [hoje]     referencia; por padrao, agora
 * @returns {number|null}     anos completos, ou null se a data nao for real ou
 *                            estiver no futuro (idade negativa nao existe)
 */
export function idadeEm(dateStr, hoje = new Date()) {
  const p = partesDaFecha(dateStr);
  if (!p) return null;
  const ref = hoje instanceof Date && !Number.isNaN(hoje.getTime()) ? hoje : new Date();
  const anoRef = ref.getFullYear();
  const mesRef = ref.getMonth() + 1;
  const diaRef = ref.getDate();

  let anos = anoRef - p.ano;
  // Ainda nao fez aniversario neste ano: desconta um.
  if (mesRef < p.mes || (mesRef === p.mes && diaRef < p.dia)) anos -= 1;
  return anos < 0 ? null : anos;
}

export default congelar({
  SIGNOS,
});
