// lib/fichas.js
// O contador de fichas — o primitivo transacional, e NADA alem dele.
// Interface publica em espanhol, comentarios em portugues.
//
// ===========================================================================
// LEIA ISTO ANTES DE LIGAR QUALQUER COISA AQUI
// ===========================================================================
// Este modulo nasce DESLIGADO (`FICHAS_ACTIVAS === false`) e a decisao e
// deliberada, no mesmo padrao do catalogo de brindes do Cosmic Guide, que ficou
// atras de uma flag com o custo real escrito no comentario.
//
// O estudo que precedeu esta pasta e explicito: moeda local so existe para
// gastar numa loja, loja so existe com catalogo, e catalogo e a SEGUNDA
// hierarquia que compete com a leitura do dia — que e a unica mecanica do app.
// Junto com a moeda vem, obrigatoriamente, todo o aparato de defesa: extrato,
// teto diario de ganho, anti-farm de relogio e saga de estorno. Nada disso
// existe aqui, e nada disso deve nascer sem que alguem decida, por escrito, que
// a segunda hierarquia vale o preco.
//
// O que ESTE arquivo e: o primitivo transacional, testado, para o dia em que
// existir um beneficio REAL implementado. O que ele NAO e, e nao pode virar sem
// essa decisao: uma economia. Enquanto `FICHAS_ACTIVAS` for false:
//   · nenhuma tela mostra saldo;
//   · nenhum caminho do app credita ficha;
//   · nenhuma recompensa e prometida em lugar nenhum.
// "Recompensa que nao existe nao entra no catalogo" — a regra herdada, e ela
// vale tambem para a moeda que compraria a recompensa.
//
// E a regra que vale mesmo depois de ligado: ficha NUNCA compra recuperacao de
// sequencia. O fio que fica parado nao pune, entao nao ha dano do qual se
// proteger, e vender o escudo obrigaria o produto a INVENTAR a punicao primeiro.
//
// ===========================================================================
// A ORDEM DAS OPERACOES EM `gastar` (e o motivo de cada passo)
// ===========================================================================
//   1. valida o custo          → custo invalido nao move nada;
//   2. le o saldo;
//   3. saldo insuficiente      → SAI. `entregar` NAO e chamado. Nao existe
//                                saldo negativo neste arquivo, em caminho
//                                nenhum;
//   4. debita e GRAVA;
//   5. gravacao falhou         → desfaz o debito e SAI. `entregar` NAO e
//                                chamado. Cobranca que nao ficou registrada nao
//                                pode virar beneficio entregue: no proximo
//                                boot o saldo volta cheio e a pessoa teria
//                                levado de graca — ou, pior, o beneficio some e
//                                a ficha tambem;
//   6. entrega;
//   7. entrega devolveu null/false/undefined → ESTORNA. O estorno grava o saldo
//      primeiro e so depois se preocupa com o resto: falha em registro
//      acessorio nao pode desfazer dinheiro que ja voltou para o bolso.
//
// Disco: UMA chave nua, 'fichas', com { saldo, ultimoDia, sellos }. A chave esta
// em CLAVES_HILO_ROJO (screens/AjustesScreen.js) — sem isso ela sobreviveria ao
// "Apagar tudo".
//
// ===========================================================================
// DUAS CAMADAS NESTE ARQUIVO (e por que a de baixo nao conhece a de cima)
// ===========================================================================
// EMBAIXO, o primitivo descrito acima: `leerSaldo`, `abonar` e `gastar`. Ele so
// sabe de numeros — quantas fichas entram, quantas saem, e a saga de entrega.
// Nao sabe de onde a ficha veio nem para que serviu, e e por isso que ele e
// testavel sem que exista produto nenhum em volta.
//
// EM CIMA, a camada de MOTIVO: `leerFichas`, `ganharFichas` e `gastarFichas`.
// Ela responde as perguntas que o primitivo nao pode responder — "esta leitura
// de hoje ja pagou?", "esta carta nova ja pagou?" — e responde com um CARIMBO
// gravado junto do saldo.
//
// A separacao importa porque os dois problemas de duplicacao sao diferentes e
// exigem defesas diferentes, e uma nao substitui a outra:
//   · a FILA (embaixo) mata a CORRIDA: dois toques no mesmo instante leriam o
//     mesmo saldo antigo e a segunda escrita comeria a primeira;
//   · o CARIMBO (em cima) mata o EVENTO REPETIDO: a tela da sintese remontar, a
//     pessoa voltar e reabrir a leitura, o app morrer no meio e reabrir. Nada
//     disso e um evento novo, e nenhuma fila do mundo saberia disso sozinha.
//
// ===========================================================================
// DE ONDE VEM E PARA ONDE VAI (a camada de cima)
// ===========================================================================
// GANHA-SE em quatro motivos, e todos sao coisas que a pessoa JA faz — nenhuma
// acao nova foi inventada so para haver o que premiar (e o erro que o
// lib/missions.js do Cosmic Guide registra: duas missoes ficaram impossiveis de
// completar porque verificavam acao que nenhuma tela gravava):
//   'leitura'  → concluiu a leitura do dia          (a tela da sintese)
//   'ritual'   → fechou um dia do ritual de sete    (datos/ritual.js)
//   'missao'   → completou uma missao               (se e quando existirem)
//   'carta:ID' → encontrou uma carta NOVA no album  (lib/album.js)
//
// GASTA-SE em UMA coisa: uma leitura a mais no mesmo dia. Um gasto so significa
// que nao ha catalogo para equilibrar, nao ha item morto ("em breve") e nao ha
// preco relativo a inventar. E A LEITURA DE HOJE CONTINUA GRATIS: a ficha nunca
// e o portao da leitura diaria, so o caminho para a segunda do mesmo dia.
//
// NAO HA TETO DIARIO DE GANHO, e vale escrever por que — o lib/tokens.js do
// Cosmic Guide precisou de um depois de um bug real (assinante clicando "nova
// leitura" para esvaziar a loja em minutos). Aqui a torneira nao existe:
// 'leitura', 'ritual' e 'missao' pagam uma vez por dia cada um (o carimbo recusa
// o segundo), 'carta:ID' paga uma vez por carta na vida, e a leitura extra custa
// mais do que as tres cartas novas que ela pode render — gastar para ganhar da
// prejuizo, entao nao ha ciclo. No dia em que entrar um motivo sem limite
// natural, o teto do tokens.js volta a ser necessario no mesmo commit.
// ===========================================================================

import { guardarSeguro, leerSeguro } from './almacen.js';

const CLAVE = 'fichas';

/**
 * O interruptor. Enquanto for false, nenhuma tela pode mostrar ficha e nenhum
 * caminho do app pode creditar. Ligar isto e uma decisao de produto, nao de
 * refatoracao — ver o cabecalho.
 */
export const FICHAS_ACTIVAS = false;

function enteroSeguro(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

// Fila de escrita do modulo: duas operacoes cruzadas liam o mesmo saldo e a
// segunda sobrescrevia a primeira, que e como uma moeda local perde dinheiro.
let cola = Promise.resolve();
function enFila(tarea) {
  const siguiente = cola.then(tarea, tarea);
  cola = siguiente.then(
    () => undefined,
    () => undefined
  );
  return siguiente;
}

/* =================================================================================
 * DIA LOCAL
 *
 * Duplicado de proposito em lib/hilo.js e lib/limiteDiario.js — sao motores
 * independentes e nenhum deve quebrar porque o outro mudou. Dia LOCAL, nunca
 * UTC: quem le as 22h de Buenos Aires esta no dia dela, e um dia UTC criaria
 * buracos que a pessoa jura nao ter tido. Ano com 4 digitos para a comparacao de
 * strings continuar sendo comparacao de calendario em qualquer relogio.
 * ================================================================================= */

function hoyLocal() {
  const d = new Date();
  const pad = (n, largo = 2) => String(n).padStart(largo, '0');
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function esDiaValido(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(anio, mes - 1, dd));
  // Round-trip: mata '2026-02-31' e '2026-13-01', que passam no regex.
  return t.getUTCFullYear() === anio && t.getUTCMonth() === mes - 1 && t.getUTCDate() === dd;
}

/**
 * O dia que vale para o ganho.
 *
 * MESMA ASSIMETRIA de lib/limiteDiario.js, e pelo mesmo motivo: adiantar o
 * relogio, ganhar as fichas do "amanha" e voltar nao devolve o dia de hoje. O
 * dia guardado mais alto continua valendo ate o calendario real alcanca-lo.
 *
 *   guardado > hoje → vence o guardado (relogio adiantado nao rende duas vezes)
 *   guardado < hoje → vence hoje       (dia novo, motivos liberados de novo)
 *
 * Note a diferenca para lib/hilo.js, onde o relogio para tras e NEUTRO: la o no
 * e um presente e nao se pune por causa de um relogio; aqui a ficha e o que paga
 * a leitura extra, entao ela segue a regra do custo, nao a do presente.
 *
 * Exportada so para os testes exercitarem a virada de dia sem mexer no relogio
 * da maquina.
 */
export function _diaEfectivo(guardado, hoy) {
  const dia = esDiaValido(hoy) ? hoy : hoyLocal();
  if (!esDiaValido(guardado)) return dia;
  return guardado > dia ? guardado : dia;
}

/* =================================================================================
 * DISCO
 *
 * TETO DO `sellos`, decidido antes de escrever e com a consequencia assumida:
 * 200 carimbos, os mais recentes. Um dia cheio gasta no maximo seis (uma
 * leitura, um dia de ritual, uma missao, tres cartas novas), entao 200 cobrem
 * mais de um mes de uso pesado. A CONSEQUENCIA de cortar: um carimbo que caiu da
 * janela deixa de recusar um pagamento repetido daquele mesmo (motivo|dia). Na
 * pratica so acontece se alguem chamar `ganharFichas` com um `dia` antigo depois
 * de 200 eventos novos — coisa que so os testes fazem. O caminho real (hoje,
 * agora) esta sempre dentro da janela por larga margem.
 *
 * NAO HA EXTRATO. O carimbo ja diz o que foi pago; um extrato so existiria para
 * uma tela de historico que nao existe, e cada campo guardado e um campo a
 * limpar, a migrar e a declarar na tela de privacidade.
 * ================================================================================= */

/** Quantos carimbos de idempotencia ficam guardados. Ver acima. */
export const TOPE_SELLOS = 200;

// Storage e entrada externa: pode ter sido editado no devtools, ter sobrado de
// uma versao anterior ou vir truncado. Nada aqui lanca — ilegivel vira estado
// vazio. O pior que acontece e a pessoa comecar do zero; o contrario (deixar um
// saldo inventado passar) seria o app pagando por um arquivo de texto.
function normalizar(bruto) {
  if (!bruto || typeof bruto !== 'object') return { saldo: 0, ultimoDia: null, sellos: [] };
  return {
    saldo: enteroSeguro(bruto.saldo),
    ultimoDia: esDiaValido(bruto.ultimoDia) ? bruto.ultimoDia : null,
    sellos: Array.isArray(bruto.sellos)
      ? bruto.sellos.filter((s) => typeof s === 'string' && s.length > 0).slice(0, TOPE_SELLOS)
      : [],
  };
}

async function leerEstado() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return { saldo: 0, ultimoDia: null, sellos: [] };
  try {
    return normalizar(JSON.parse(bruto));
  } catch {
    return { saldo: 0, ultimoDia: null, sellos: [] };
  }
}

// TODA escrita do arquivo passa por aqui, e e de proposito: gravar
// `{ saldo }` cru — como o primitivo fazia quando so existia saldo — apagaria os
// carimbos junto, e o app voltaria a pagar tudo de novo na proxima abertura.
function guardarEstado(estado) {
  return guardarSeguro(
    CLAVE,
    JSON.stringify({
      saldo: enteroSeguro(estado.saldo),
      ultimoDia: esDiaValido(estado.ultimoDia) ? estado.ultimoDia : null,
      sellos: Array.isArray(estado.sellos) ? estado.sellos.slice(0, TOPE_SELLOS) : [],
    })
  );
}

async function leerCrudo() {
  const estado = await leerEstado();
  return estado.saldo;
}

/**
 * O saldo. Espera a fila antes de ler: sem isso, uma leitura disparada durante
 * a janela assincrona de uma gravacao enxerga o valor antigo.
 * Nunca negativo, nunca lanca.
 * @returns {Promise<number>}
 */
export function leerSaldo() {
  return enFila(() => leerCrudo());
}

/**
 * Credita fichas.
 * @param {number} cuantas inteiro positivo
 * @returns {Promise<{ok: boolean, motivo: string|null, saldo: number, persistido: boolean}>}
 */
export function abonar(cuantas) {
  return enFila(async () => {
    const monto = enteroSeguro(cuantas);
    const estado = await leerEstado();
    const saldo = estado.saldo;
    if (monto <= 0) return { ok: false, motivo: 'monto', saldo, persistido: false };
    const nuevo = saldo + monto;
    const persistido = await guardarEstado({ ...estado, saldo: nuevo });
    // Credito que nao foi ao disco continua valendo NA SESSAO (lib/almacen.js
    // mantem memoria), e por isso devolvemos o saldo novo com `persistido:
    // false` em vez de mentir que nada aconteceu. O oposto do gasto, e de
    // proposito: errar a favor da pessoa.
    return { ok: true, motivo: null, saldo: nuevo, persistido };
  });
}

/**
 * Gasta fichas por um beneficio. TRANSACIONAL: o beneficio so e entregue depois
 * de a cobranca ter sido efetivamente gravada, e uma entrega que falha estorna.
 *
 * @param {number} costo inteiro positivo
 * @param {Function} entregar funcao que entrega o beneficio. Deve devolver algo
 *   verdadeiro quando entregou. `null`, `false` e `undefined` significam "nao
 *   entreguei" e disparam o estorno. Se ela lancar, tambem estorna.
 * @returns {Promise<{ok: boolean, motivo: string|null, saldo: number,
 *   entregado: boolean, resultado: any, persistido: boolean}>}
 *   motivo — 'costo' | 'saldo' | 'disco' | 'entrega' | null
 */
export function gastar(costo, entregar) {
  return enFila(async () => {
    const monto = enteroSeguro(costo);
    const estado = await leerEstado();
    const saldo = estado.saldo;

    const sinCambio = (motivo) => ({
      ok: false,
      motivo,
      saldo,
      entregado: false,
      resultado: null,
      persistido: false,
    });

    if (monto <= 0) return sinCambio('costo');
    if (typeof entregar !== 'function') return sinCambio('entrega');

    // PASSO 3. Saldo insuficiente sai aqui, antes de qualquer escrita e antes
    // de `entregar` existir para o mundo. Nao ha ramo neste arquivo que
    // produza saldo negativo: o unico decremento e este, e ele esta atras
    // desta guarda.
    if (saldo < monto) return sinCambio('saldo');

    // PASSO 4/5. Cobra e confirma a gravacao ANTES de entregar.
    const restante = saldo - monto;
    const persistido = await guardarEstado({ ...estado, saldo: restante });
    if (!persistido) {
      // Devolve o saldo (best-effort) e sai sem entregar nada.
      await guardarEstado(estado);
      return sinCambio('disco');
    }

    // PASSO 6/7.
    let resultado = null;
    try {
      resultado = await entregar();
    } catch {
      resultado = null;
    }

    if (resultado === null || resultado === undefined || resultado === false) {
      await guardarEstado(estado);
      return { ok: false, motivo: 'entrega', saldo, entregado: false, resultado: null, persistido: true };
    }

    return { ok: true, motivo: null, saldo: restante, entregado: true, resultado, persistido: true };
  });
}

/* =================================================================================
 * CAMADA DE MOTIVO — MOTIVOS
 *
 * Estas strings vao para o DISCO dentro do carimbo. Troca-las apaga a memoria do
 * que ja foi pago (e faz o app pagar tudo de novo), entao elas mudam de valor
 * tanto quanto uma chave de storage muda: nao mudam. Sao chave tecnica, nao texto
 * de tela — o texto que a pessoa le mora em datos/textos.js e sai por
 * TEXTO_MOTIVO.
 * ================================================================================= */

/** Concluiu a leitura de hoje. */
export const MOTIVO_LEITURA = 'leitura';
/** Fechou um dia do ritual de sete. */
export const MOTIVO_RITUAL = 'ritual';
/** Completou uma missao — se e quando existirem missoes. */
export const MOTIVO_MISSAO = 'missao';
/** Prefixo do motivo de carta nova: `carta:major-00`. Ver `motivoCarta`. */
export const PREFIJO_CARTA = 'carta:';
/** O unico gasto do v1. Tambem chave tecnica: nunca aparece na tela. */
export const GASTO_LEITURA_EXTRA = 'leitura-extra';

/**
 * O motivo de uma carta nova no album.
 *
 * Um motivo por CARTA (e nao um generico 'carta') porque o carimbo e
 * (motivo|dia): com um motivo so, a segunda e a terceira carta nova do mesmo dia
 * seriam recusadas como se fossem repeticao da primeira.
 *
 * @param {string} id id da carta, como em datos/cartas.json ('major-00')
 */
export function motivoCarta(id) {
  return PREFIJO_CARTA + String(id);
}

/**
 * Quanto vale cada motivo.
 *
 * A calibragem tem uma regra so, e ela e o que impede o ciclo: a leitura extra
 * custa MAIS do que a leitura extra pode render. Tres cartas novas (o maximo de
 * uma tiragem) valem menos que o preco, entao gastar para ganhar da prejuizo.
 * Quem mexer nestes numeros confere isso antes de mexer.
 */
export const GANHOS = Object.freeze({
  [MOTIVO_LEITURA]: 2,
  [MOTIVO_RITUAL]: 2,
  [MOTIVO_MISSAO]: 1,
  carta: 1,
});

/** O preco da segunda leitura do mesmo dia. */
export const PRECO_LEITURA_EXTRA = 12;

/**
 * Motivo -> chave de datos/textos.js. Nenhuma string de tela mora neste arquivo:
 * e exatamente a conta que o brindes.js do Cosmic Guide ja pagou, com titulo e
 * descricao escritos dentro do modulo, vazando para quem lia o app noutro idioma.
 */
export const TEXTO_MOTIVO = Object.freeze({
  [MOTIVO_LEITURA]: 'fichas.motivo.leitura',
  [MOTIVO_RITUAL]: 'fichas.motivo.ritual',
  [MOTIVO_MISSAO]: 'fichas.motivo.missao',
  carta: 'fichas.motivo.carta',
  [GASTO_LEITURA_EXTRA]: 'fichas.gasto.leituraExtra',
});

/* --- FALHAS ---------------------------------------------------------------------
 * O porque de uma chamada nao ter concedido nada. As telas comparam por igualdade
 * contra estes valores em vez de escrever a string solta, como ja fazem com os
 * MOTIVO_* de lib/recordatorio.js. */

/** Motivo desconhecido: erro de fiacao, nao estado da pessoa. */
export const FALLA_MOTIVO = 'motivo-desconhecido';
/** Este (motivo|dia) ja tinha sido pago. Nao e erro: e a idempotencia agindo. */
export const FALLA_REPETIDO = 'ja-pago';
/** Faltam fichas. E o unico "nao" que a pessoa ve, e ele nunca e punicao. */
export const FALLA_SEM_SALDO = 'sem-saldo';
/** A escrita do debito nao ficou registrada, entao nao houve cobranca. */
export const FALLA_DISCO = 'disco';

// Quanto vale um motivo. Carta tem prefixo; os outros sao o proprio nome.
function valorDe(motivo) {
  if (typeof motivo !== 'string' || motivo.length === 0) return 0;
  if (motivo.startsWith(PREFIJO_CARTA)) {
    return motivo.length > PREFIJO_CARTA.length ? GANHOS.carta : 0;
  }
  return enteroSeguro(GANHOS[motivo]);
}

/* =================================================================================
 * CAMADA DE MOTIVO — API
 * ================================================================================= */

/**
 * O saldo e o dia mais alto ja carimbado. Nao escreve e nao lanca.
 *
 * Espera a fila antes de ler, pelo mesmo motivo que `leerSaldo`: consultar no
 * meio de uma escrita devolveria o numero anterior.
 *
 * @returns {Promise<{saldo: number, ultimoDia: string|null}>}
 */
export function leerFichas() {
  return enFila(async () => {
    const estado = await leerEstado();
    return { saldo: estado.saldo, ultimoDia: estado.ultimoDia };
  });
}

/**
 * Paga as fichas de um motivo. Idempotente por (motivo, dia).
 *
 * QUEM CHAMA E DONO DA REGRA DE NEGOCIO; este modulo e dono do evento repetido.
 * Ou seja: `motivoCarta('major-00')` so deve ser chamado quando lib/album.js
 * disser que a carta e NOVA de verdade — o carimbo daqui defende do toque duplo,
 * do remonte de tela e do app que morreu no meio, nao de um chamador que resolveu
 * pagar carta velha. E a mesma divisao do tarotCollection.js do Cosmic Guide,
 * onde carta "de brinde" e proibida dentro do proprio modulo do album.
 *
 * ERRA A FAVOR DA PESSOA, igual a `abonar`: um ganho que nao foi ao disco
 * continua valendo na sessao (lib/almacen.js mantem memoria) e sai com
 * `persistido: false`, em vez de a funcao mentir que nada aconteceu. E o oposto
 * do gasto, e de proposito — recusar a ficha por causa de um disco quebrado
 * puniria a pessoa por um defeito que nao e dela.
 *
 * @param {string} motivo MOTIVO_LEITURA | MOTIVO_RITUAL | MOTIVO_MISSAO | motivoCarta(id)
 * @param {string} [dia] dia YYYY-MM-DD; so os testes passam isto.
 * @returns {Promise<{ok: boolean, saldo: number, ganho: number, dia: string,
 *   persistido: boolean, falla: string|null}>}
 *   ok         — este chamado concedeu fichas
 *   ganho      — quantas (0 quando nao concedeu)
 *   dia        — o dia em que o ganho foi carimbado (pode ser um dia guardado no
 *                futuro, por causa da protecao de relogio)
 *   persistido — foi ao disco? false = so na memoria da sessao; o ganho vale
 *                igual, e quem quiser avisa com `errores.guardado`
 *   falla      — null quando concedeu; FALLA_REPETIDO ou FALLA_MOTIVO quando nao
 */
export function ganharFichas(motivo, dia) {
  return enFila(async () => {
    const estado = await leerEstado();
    const cuando = _diaEfectivo(estado.ultimoDia, dia);
    const valor = valorDe(motivo);

    if (valor <= 0) {
      return {
        ok: false,
        saldo: estado.saldo,
        ganho: 0,
        dia: cuando,
        persistido: false,
        falla: FALLA_MOTIVO,
      };
    }

    const sello = `${motivo}|${cuando}`;
    if (estado.sellos.includes(sello)) {
      return {
        ok: false,
        saldo: estado.saldo,
        ganho: 0,
        dia: cuando,
        persistido: false,
        falla: FALLA_REPETIDO,
      };
    }

    // O carimbo entra no MESMO objeto que o saldo novo, e os dois vao ao disco de
    // uma vez. Gravar em dois passos abriria a janela em que o saldo ja subiu e o
    // carimbo ainda nao existe — o app morrendo ali pagaria de novo na volta.
    const persistido = await guardarEstado({
      saldo: estado.saldo + valor,
      ultimoDia: cuando,
      sellos: [sello, ...estado.sellos].slice(0, TOPE_SELLOS),
    });

    return {
      ok: true,
      saldo: estado.saldo + valor,
      ganho: valor,
      dia: cuando,
      persistido,
      falla: null,
    };
  });
}

/**
 * Cobra fichas por um motivo. Hoje ha um gasto so: a leitura a mais no mesmo dia.
 *
 * ORDEM DE CHAMADA, e ela importa: cobre PRIMEIRO e so abra a leitura extra
 * quando `ok` for true. A ordem contraria (abrir e cobrar depois) entrega a
 * leitura de graca toda vez que a escrita falhar — e a escrita falhando e
 * exatamente o momento em que a contabilidade parou de defender qualquer coisa.
 *
 * ATENCAO — A ENTREGA AINDA NAO EXISTE, e isto e o que segura a flag fechada.
 *
 * `gastar(quanto, () => true)` cobra e devolve `true` sem abrir leitura nenhuma.
 * Nao ha, em lib/limiteDiario.js, funcao que reabra o dia: `puedeLeerHoy` e
 * `registrarLectura` sao tudo o que existe, e nenhuma das duas devolve a leitura
 * gasta. Ou seja: hoje esta cobranca tira 12 fichas e NAO entrega nada.
 *
 * Enquanto `FICHAS_ACTIVAS` for false ninguem chega aqui — nenhuma tela mostra
 * saldo, nenhum caminho credita — e por isso a promessa de
 * 'hilo.panel.fichasPara' ("abrem mais uma leitura no mesmo dia") nunca chega a
 * ser feita a ninguem. A regra herdada do Cosmic Guide e essa: recompensa que
 * nao existe nao entra no catalogo, e uma que nao tem EFEITO e o mesmo caso.
 *
 * O portao nao e este comentario: test/madremaria-gamificacao.test.js amarra
 * FICHAS_ACTIVAS a existencia do efeito. Ligar a flag sem implementar a reabertura
 * do dia deixa o teste vermelho — que e a unica defesa que sobrevive ao dia em
 * que alguem quiser "so ver como fica".
 *
 * QUANDO O EFEITO EXISTIR, o caminho e passar a entrega de verdade como callback
 * para `gastar` (a que reabre o dia, devolvendo algo verdadeiro so quando
 * reabriu). A saga transacional ja esta ali, pronta, e nao precisa ser
 * reinventada aqui: cobranca que nao gravou nao entrega, e entrega que falhou
 * estorna.
 *
 * @param {number} quanto quantas fichas cobrar (use PRECO_LEITURA_EXTRA)
 * @param {string} motivo GASTO_LEITURA_EXTRA — chave tecnica, nao texto de tela
 * @returns {Promise<{ok: boolean, saldo: number, gasto: number,
 *   persistido: boolean, falla: string|null}>}
 *   ok    — so true quando o novo saldo JA foi escrito
 *   saldo — o saldo depois desta chamada (inalterado quando `ok` e false)
 *   falla — null quando cobrou; FALLA_SEM_SALDO, FALLA_MOTIVO ou FALLA_DISCO
 */
export async function gastarFichas(quanto, motivo) {
  if (typeof motivo !== 'string' || motivo.length === 0) {
    const saldo = await leerSaldo();
    return { ok: false, saldo, gasto: 0, persistido: false, falla: FALLA_MOTIVO };
  }

  const r = await gastar(quanto, () => true);

  // Traducao dos motivos do primitivo para as falhas desta camada. 'costo' e
  // 'entrega' so acontecem por erro de fiacao (custo <= 0, callback ausente) e
  // por isso caem no mesmo balde de FALLA_MOTIVO: nao sao estado da pessoa.
  const falla = r.ok
    ? null
    : r.motivo === 'saldo'
      ? FALLA_SEM_SALDO
      : r.motivo === 'disco'
        ? FALLA_DISCO
        : FALLA_MOTIVO;

  return {
    ok: r.ok,
    saldo: r.saldo,
    gasto: r.ok ? enteroSeguro(quanto) : 0,
    persistido: r.ok ? r.persistido : false,
    falla,
  };
}

export default {
  FICHAS_ACTIVAS,
  leerSaldo,
  abonar,
  gastar,
  MOTIVO_LEITURA,
  MOTIVO_RITUAL,
  MOTIVO_MISSAO,
  PREFIJO_CARTA,
  GASTO_LEITURA_EXTRA,
  GANHOS,
  PRECO_LEITURA_EXTRA,
  TEXTO_MOTIVO,
  motivoCarta,
  leerFichas,
  ganharFichas,
  gastarFichas,
};
