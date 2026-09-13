// lib/album.js
// O Album das 78 — o cofre que SO a leitura enche.
// Interface publica em espanhol (como o resto de lib/), comentarios em portugues.
//
// ===========================================================================
// A REGRA QUE E O PRODUTO INTEIRO
// ===========================================================================
// Uma carta entra aqui quando ela apareceu numa tiragem de verdade. Nao existe
// — e nao pode passar a existir — nenhuma outra porta: nada de "marcar todas",
// nada de brinde de onboarding pre-marcado, nada de desbloqueio por assinatura.
// Album inflado mata a graca de colecionar, e a graca de colecionar e a unica
// coisa neste app que faz a leitura de amanha ser diferente da de hoje.
//
// A defesa e a superficie: este modulo exporta UMA funcao que escreve
// (`registrarEncuentro`) e um atalho que so a chama tres vezes
// (`registrarTirada`). O portao em test/madremaria-gamificacao.test.js trava a lista de
// exports exatamente por isso — no dia em que alguem acrescentar
// `desbloquearTodo`, o teste fica vermelho antes de o commit sair da maquina.
//
// ===========================================================================
// IDEMPOTENCIA POR OCORRENCIA (o motivo de `ocurrenciaId` existir)
// ===========================================================================
// A tela da sintese pode remontar, a pessoa pode voltar e reabrir a leitura, o
// app pode morrer no meio da gravacao, o dedo pode tocar duas vezes. Nenhuma
// dessas coisas e um encontro novo. Quem sorteia gera um id de ocorrencia no
// momento do sorteio e o carrega junto da tirada; este modulo guarda a janela
// dos ultimos ids e recusa repetir.
//
// O ramo `duplicado` NAO e um simples "ja vi, tchau": se o evento ja esta na
// janela mas a carta sumiu do indice (app morto entre as duas gravacoes, ou
// storage truncado), ele REPARA o indice sem contar o encontro de novo. Sem
// isso, a carta ficaria eternamente oculta no album por causa de uma queda de
// meio segundo, e a pessoa juraria que ela tinha vindo — porque tinha.
//
// TETO DA JANELA, e a consequencia assumida por escrito: `TECHO_EVENTOS` ids.
// A tres cartas por dia isso cobre ~200 dias. Passado esse ponto, o id mais
// antigo cai fora da janela, e um encontro daquele dia remoto que fosse
// reenviado contaria de novo. Preferimos esse risco (que exige remontar uma
// tela de 200 dias atras) a deixar o storage crescer sem limite no aparelho.
//
// ===========================================================================
// DISCO
// ===========================================================================
// UMA chave nua: 'album'. O prefixo 'hr.' e assunto do lib/almacen.js.
// A chave esta em CLAVES_HILO_ROJO (screens/AjustesScreen.js) — sem isso ela
// sobreviveria ao "Apagar tudo" e a politica de privacidade viraria declaracao
// falsa numa ficha de loja.
// ===========================================================================

import { guardarSeguro, leerSeguro } from './almacen.js';
import { MAZO } from './mazo.js';

const CLAVE = 'album';

/** Quantos ids de ocorrencia a janela de idempotencia guarda. Ver o cabecalho. */
export const TECHO_EVENTOS = 600;

// Duplicado de proposito em lib/hilo.js e lib/limiteDiario.js: tres motores
// independentes, e nenhum deve quebrar porque o outro mudou. Dia LOCAL, nunca
// UTC — quem le as 22h esta no dia dela. Ano com 4 digitos para a comparacao de
// strings continuar valida em qualquer relogio.
function hoyLocal() {
  const d = new Date();
  const pad = (n, largo = 2) => String(n).padStart(largo, '0');
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function esDiaValido(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(anio, mes - 1, dd));
  return t.getUTCFullYear() === anio && t.getUTCMonth() === mes - 1 && t.getUTCDate() === dd;
}

// Os grupos saem do PROPRIO baralho, na ordem de aparicao — nunca de uma lista
// paralela escrita a mao. Se o baralho mudar, o album acompanha em vez de
// divergir em silencio, e o denominador nunca fica mentindo na tela.
function derivarGrupos(mazo) {
  const orden = [];
  const mapa = new Map();
  for (const carta of mazo) {
    const clave = String(carta.id).split('-')[0];
    if (!mapa.has(clave)) {
      mapa.set(clave, []);
      orden.push(clave);
    }
    mapa.get(clave).push(carta.id);
  }
  return Object.freeze(
    orden.map((clave) => Object.freeze({ clave, cartas: Object.freeze(mapa.get(clave)) }))
  );
}

/** Os grupos do album, derivados do baralho: 22 Maiores + os quatro naipes. */
export const GRUPOS = derivarGrupos(MAZO);

/** O denominador. Nunca escrito a mao: e o tamanho do baralho carregado. */
export const TOTAL_CARTAS = MAZO.length;

// Filtro de id vale na LEITURA e na ESCRITA. Storage sujo de uma versao antiga
// (ou editado a mao no devtools) nunca pode fazer a contagem passar do total.
const IDS_VALIDOS = new Set(MAZO.map((c) => c.id));

function enteroSeguro(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

// Um encontro guardado, sanitizado.
//
// O campo `legado` e a resposta honesta para a carta vista antes de a metrica
// existir: dizemos "houve ao menos um encontro anterior" e NAO fabricamos uma
// data. Inventar `primera` aqui seria mais bonito na tela e falso no dado — e o
// app inteiro se sustenta em nao inventar numero.
function normalizarEncuentro(bruto) {
  if (bruto === true) {
    return { veces: 1, derechas: 0, invertidas: 0, primera: null, ultima: null, legado: true };
  }
  if (typeof bruto === 'number') {
    return {
      veces: Math.max(1, enteroSeguro(bruto)),
      derechas: 0,
      invertidas: 0,
      primera: null,
      ultima: null,
      legado: true,
    };
  }
  if (!bruto || typeof bruto !== 'object') return null;

  const derechas = enteroSeguro(bruto.derechas);
  const invertidas = enteroSeguro(bruto.invertidas);
  // Existir a entrada significa que houve ao menos um encontro: a correcao e
  // sempre para cima, como em lib/hilo.js. Album que encolhe e album que mente.
  const veces = Math.max(1, enteroSeguro(bruto.veces), derechas + invertidas);
  const primera = esDiaValido(bruto.primera) ? bruto.primera : null;
  const ultima = esDiaValido(bruto.ultima) ? bruto.ultima : null;

  return {
    veces,
    derechas,
    invertidas,
    primera,
    // Sem data nenhuma gravada, a entrada e de antes da metrica: `legado` diz
    // isso na cara em vez de a tela mostrar um traco sem explicacao.
    ultima,
    legado: bruto.legado === true || (!primera && !ultima),
  };
}

function normalizar(bruto) {
  const cartas = {};
  const eventos = [];
  if (bruto && typeof bruto === 'object') {
    if (bruto.cartas && typeof bruto.cartas === 'object') {
      for (const id of Object.keys(bruto.cartas)) {
        if (!IDS_VALIDOS.has(id)) continue;
        const encuentro = normalizarEncuentro(bruto.cartas[id]);
        if (encuentro) cartas[id] = encuentro;
      }
    }
    if (Array.isArray(bruto.eventos)) {
      for (const ev of bruto.eventos) {
        if (typeof ev === 'string' && ev) eventos.push(ev);
      }
    }
  }
  return { cartas, eventos: eventos.slice(-TECHO_EVENTOS) };
}

/**
 * O album como esta no disco, sanitizado. Nao escreve e nunca lanca.
 * @returns {Promise<{cartas: object, eventos: string[]}>}
 */
export async function leerAlbum() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return { cartas: {}, eventos: [] };
  try {
    return normalizar(JSON.parse(bruto));
  } catch {
    return { cartas: {}, eventos: [] };
  }
}

/** Essa carta ja foi encontrada? Funcao pura sobre o estado ja lido. */
export function estaEncontrada(estado, cartaId) {
  if (!estado || typeof estado !== 'object' || !estado.cartas) return false;
  return Object.prototype.hasOwnProperty.call(estado.cartas, cartaId);
}

/**
 * A mesma pergunta, para quem nao tem o estado na mao (uma tela que so precisa
 * saber de UMA carta, sem montar o resumo inteiro). Le disco, nunca lanca, e id
 * desconhecido devolve false.
 * @param {string} cartaId
 * @returns {Promise<boolean>}
 */
export async function fueEncontrada(cartaId) {
  if (typeof cartaId !== 'string' || !IDS_VALIDOS.has(cartaId)) return false;
  return estaEncontrada(await leerAlbum(), cartaId);
}

/**
 * Os ids das cartas ja encontradas, NA ORDEM DO BARALHO — nunca na ordem em que
 * entraram: a grade tem de ficar no mesmo lugar entre duas aberturas da tela.
 *
 * Devolve SO as encontradas. Nao existe, e nao pode passar a existir, a funcao
 * espelho ("faltantes"): a grade desenha as ocultas a partir da CONTAGEM, e uma
 * lista de faltantes entregaria de bandeja o nome da proxima carta — a surpresa
 * acabaria antes de acontecer.
 * @returns {Promise<string[]>}
 */
export async function cartasEncontradas() {
  const estado = await leerAlbum();
  return MAZO.map((c) => c.id).filter((id) => estaEncontrada(estado, id));
}

/**
 * O que a tela do album mostra. Funcao PURA sobre o estado ja lido: nao le
 * disco, nao escreve, nao lanca.
 *
 * `encontradas` nunca pode regredir por mudanca de baralho: se o denominador
 * crescer, a barra fica menor em porcentagem, e por isso a tela mostra "{n} de
 * {total}" e nao uma barra. Numero que anda para tras na cara da pessoa e
 * exatamente a punicao disfarcada que este app nao faz.
 */
export function resumenAlbum(estado) {
  const cartas = estado && estado.cartas ? estado.cartas : {};
  const grupos = GRUPOS.map((grupo) => {
    const encontradas = grupo.cartas.filter((id) =>
      Object.prototype.hasOwnProperty.call(cartas, id)
    ).length;
    return {
      clave: grupo.clave,
      total: grupo.cartas.length,
      encontradas,
      completo: encontradas === grupo.cartas.length,
    };
  });
  return {
    total: TOTAL_CARTAS,
    encontradas: grupos.reduce((soma, g) => soma + g.encontradas, 0),
    grupos,
  };
}

// Fila de escrita do modulo. Duas gravacoes que se cruzam liam o mesmo estado e
// a segunda sobrescrevia a primeira — numa tirada de tres cartas registradas em
// paralelo isso perde duas. A fila serializa; nao protege contra outra aba
// (nao existe aba num app nativo).
let cola = Promise.resolve();
function enFila(tarea) {
  const siguiente = cola.then(tarea, tarea);
  cola = siguiente.then(
    () => undefined,
    () => undefined
  );
  return siguiente;
}

function contarEncontradas(estado) {
  return Object.keys(estado.cartas).length;
}

/**
 * O id do evento. Duas origens, nesta ordem:
 *
 *   1. `ocurrenciaId`, nascido no sorteio e carregado junto da tirada. E o
 *      preferido, e e o unico que distingue duas tiradas do MESMO dia que por
 *      acaso deem a MESMA carta na MESMA posicao.
 *   2. na falta dele, um id DERIVADO de (dia + cartaId + posicion). Existe para
 *      que quem so tem a carta na mao — uma tela que registra um encontro solto,
 *      um teste — nao seja obrigado a inventar um identificador, que e onde
 *      nasce o pior de todos os bugs deste modulo: id novo a cada tentativa, e
 *      o toque duplo passa a contar dois encontros.
 *
 * O CUSTO DO DERIVADO, dito na cara: no caminho 2, duas tiradas no mesmo dia
 * com a mesma carta na mesma posicao viram um encontro so, e o `veces` daquela
 * carta fica um abaixo do real. E o erro na direcao certa (nunca infla, so
 * deixa de contar) e so alcanca quem faz mais de uma leitura por dia — que hoje
 * e o assinante, ja que lib/limiteDiario.js da uma por dia. Quem nao quiser
 * pagar esse preco passa `ocurrenciaId`, e e por isso que `registrarTirada` o
 * exige.
 *
 * O prefixo 'auto:' mantem os dois espacos de nomes separados: um id derivado
 * nunca pode colidir com um id vindo do sorteio.
 */
function idDeOcurrencia({ ocurrenciaId, fecha, cartaId, posicion }) {
  if (typeof ocurrenciaId === 'string' && ocurrenciaId) return ocurrenciaId;
  const n = Number(posicion);
  const pos = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  return `auto:${fecha}|${cartaId}|${pos}`;
}

function fallo(motivo, estado) {
  return {
    ok: false,
    motivo,
    nuevo: false,
    duplicado: false,
    reparado: false,
    veces: 0,
    encontradas: contarEncontradas(estado),
    persistido: false,
  };
}

/**
 * Registra UM encontro real. E a unica funcao deste arquivo que escreve.
 *
 * @param {object} args
 * @param {string} args.cartaId      id do baralho ('major-00', 'copas-07'...)
 * @param {string} [args.ocurrenciaId] id do evento, gerado no sorteio e carregado
 *                                   junto da tirada. E o caminho preferido: um id
 *                                   nascido no sorteio distingue duas tiradas que
 *                                   por acaso deem a mesma carta na mesma posicao
 *                                   no mesmo dia.
 * @param {boolean} [args.invertida]
 * @param {string} [args.dia]        YYYY-MM-DD local; so os testes passam isto.
 * @param {number} [args.posicion]   posicao na tirada (0, 1, 2). So e usada
 *                                   quando NAO vem `ocurrenciaId`: nesse caso o
 *                                   id do evento e DERIVADO de
 *                                   (dia + cartaId + posicion), que ja e estavel
 *                                   o bastante para o caso normal do app — uma
 *                                   tirada por dia. Ver a nota abaixo.
 * @returns {Promise<{ok: boolean, motivo: string|null, nuevo: boolean,
 *   duplicado: boolean, reparado: boolean, veces: number, encontradas: number,
 *   persistido: boolean}>}
 *   nuevo     — a carta passou a aparecer no album agora
 *   duplicado — esta ocorrencia ja tinha sido registrada; nada foi contado
 *   reparado  — a ocorrencia ja existia mas a carta faltava no indice, e o
 *               indice foi remendado sem contar o encontro de novo
 */
export function registrarEncuentro(args) {
  const { cartaId, ocurrenciaId, invertida = false, dia, posicion } = args || {};

  return enFila(async () => {
    const estado = await leerAlbum();

    if (typeof cartaId !== 'string' || !IDS_VALIDOS.has(cartaId)) return fallo('carta', estado);

    const fecha = esDiaValido(dia) ? dia : hoyLocal();
    const evento = idDeOcurrencia({ ocurrenciaId, fecha, cartaId, posicion });
    if (!evento) return fallo('ocurrencia', estado);

    const yaRegistrado = estado.eventos.includes(evento);
    const previo = Object.prototype.hasOwnProperty.call(estado.cartas, cartaId)
      ? estado.cartas[cartaId]
      : null;

    // Caminho normal do duplicado: o evento ja passou por aqui e a carta esta no
    // indice. Nada muda, nada e gravado, e o retorno diz a verdade.
    if (yaRegistrado && previo) {
      return {
        ok: true,
        motivo: null,
        nuevo: false,
        duplicado: true,
        reparado: false,
        veces: previo.veces,
        encontradas: contarEncontradas(estado),
        persistido: false,
      };
    }

    // O REPARO. Evento conhecido, carta ausente: o app caiu entre as duas
    // gravacoes. Remendamos o indice com um encontro, sem consumir um evento
    // novo — o total nunca infla, e a carta para de ficar presa fora do album.
    if (yaRegistrado && !previo) {
      const cartas = {
        ...estado.cartas,
        [cartaId]: {
          veces: 1,
          derechas: invertida ? 0 : 1,
          invertidas: invertida ? 1 : 0,
          primera: fecha,
          ultima: fecha,
          legado: false,
        },
      };
      const siguiente = { cartas, eventos: estado.eventos };
      const persistido = await guardarSeguro(CLAVE, JSON.stringify(siguiente));
      return {
        ok: true,
        motivo: null,
        nuevo: true,
        duplicado: true,
        reparado: true,
        veces: 1,
        encontradas: Object.keys(cartas).length,
        persistido,
      };
    }

    const base = previo || {
      veces: 0,
      derechas: 0,
      invertidas: 0,
      primera: null,
      ultima: null,
      legado: false,
    };
    const encuentro = {
      veces: base.veces + 1,
      derechas: base.derechas + (invertida ? 0 : 1),
      invertidas: base.invertidas + (invertida ? 1 : 0),
      // `primera` so nasce agora quando nao havia data nenhuma. Carta de legado
      // ganha a primeira data medida aqui, e `legado` continua true para a tela
      // poder dizer que o historico detalhado comeca neste encontro.
      primera: base.primera || fecha,
      ultima: fecha,
      legado: base.legado === true,
    };

    // O evento entra ANTES de o encontro valer, e a gravacao e uma so: se o
    // disco falhar, nem o evento nem a contagem sobrevivem, e a proxima
    // tentativa da mesma ocorrencia funciona. Preferimos perder um registro a
    // contar dois.
    const eventos = [...estado.eventos, evento].slice(-TECHO_EVENTOS);
    const cartas = { ...estado.cartas, [cartaId]: encuentro };
    const persistido = await guardarSeguro(CLAVE, JSON.stringify({ cartas, eventos }));

    return {
      ok: true,
      motivo: null,
      nuevo: !previo,
      duplicado: false,
      reparado: false,
      veces: encuentro.veces,
      encontradas: Object.keys(cartas).length,
      persistido,
    };
  });
}

/**
 * Atalho para a tirada de tres. Cada posicao vira uma ocorrencia propria
 * (`${ocurrenciaId}#0`, `#1`, `#2`) — assim remontar a sintese nao conta seis
 * cartas, e uma tirada gravada pela metade completa na proxima tentativa.
 *
 * @param {Array<{carta: object, invertida: boolean}>} tirada
 * @param {string} ocurrenciaId
 * @param {string} [dia]
 */
export async function registrarTirada(tirada, ocurrenciaId, dia) {
  const lista = Array.isArray(tirada) ? tirada : [];
  const salidas = [];
  for (let i = 0; i < lista.length; i += 1) {
    const item = lista[i] || {};
    const carta = item.carta || {};
    salidas.push(
      // eslint-disable-next-line no-await-in-loop
      await registrarEncuentro({
        cartaId: carta.id,
        ocurrenciaId: `${ocurrenciaId}#${i}`,
        invertida: item.invertida === true,
        dia,
      })
    );
  }
  return salidas;
}

export default {
  leerAlbum,
  registrarEncuentro,
  registrarTirada,
  resumenAlbum,
  estaEncontrada,
  fueEncontrada,
  cartasEncontradas,
};
