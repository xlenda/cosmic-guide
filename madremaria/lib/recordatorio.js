// lib/recordatorio.js
// O gancho de voltar amanhã. Interface pública em espanhol, comentários em
// português (mesma convenção de theme.js, lib/almacen.js e lib/hilo.js).
//
// ===========================================================================
// O QUE ESTE MÓDULO É
// ===========================================================================
// No funil de WhatsApp, quem trazia a pessoa de volta no dia seguinte era um
// áudio. Aqui é UMA notificação local por dia, no horário que ela escolheu, e
// nada mais que isso. Sem push de re-engajamento, sem "novidades", sem oferta,
// sem duas no mesmo dia, sem "faz 3 dias que você não vem".
//
// AS QUATRO REGRAS DE PRODUTO, e qualquer uma violada estraga o app inteiro:
//
//   1. UMA POR DIA. Toda programação começa cancelando tudo o que estava
//      agendado. Não existe caminho neste arquivo que empilhe dois avisos no
//      mesmo dia — e o `id` de cada aviso é derivado da data justamente para
//      que uma reprogramação SUBSTITUA em vez de somar.
//   2. O TEXTO NÃO PROMETE E NÃO FALA DA OUTRA PESSOA. As três variações vivem
//      em datos/textos.js (`ajustes.recordatorio.aviso.*`) e falam do FIO e da
//      LEITURA DE HOJE. O dia em branco aparece como constatação, nunca como
//      perda — a mesma doutrina de `hilo.rachaRota`.
//   3. QUEM JÁ LEU HOJE NÃO RECEBE O AVISO DE HOJE. Ver "A JANELA", abaixo: é
//      a razão de este módulo agendar dia a dia em vez de usar um gatilho
//      diário repetido, que o sistema operacional não deixa pular uma vez.
//   4. TOCAR NO AVISO ABRE A LEITURA DO DIA. O payload leva `/* RUTAS.PLANO desde 01/09: RUTAS.TIRADA virou so a rota-host das abas
       * (abre no Mapa), e o aviso promete a leitura/acao do DIA. */
      ruta: RUTAS.PLANO`
//      — nunca a home genérica. Um aviso que promete a leitura e entrega um
//      menu é o começo da desinstalação.
//
// ===========================================================================
// A JANELA (por que dia a dia, e não um gatilho diário repetido)
// ===========================================================================
// Um gatilho `repeats: true` diário é uma linha de código e resolve 90% disto —
// mas ele é do sistema operacional, e o sistema não aceita "hoje não". Uma vez
// armado, ele dispara às 21h mesmo para quem leu às 10h da manhã. Esse aviso é
// o pior do app: chega para quem JÁ fez o que ele pede, e ensina a pessoa que o
// aviso não sabe nada sobre ela.
//
// Então este módulo agenda N avisos avulsos, um por data (DIAS_POR_DELANTE), e
// simplesmente NÃO agenda o de hoje quando o nó de hoje já está atado
// (lib/hilo.js → `resumenHilo().hoyAtado`). A janela é rearmada a cada vez que
// `programarDiario()` é chamada — inclusive sem argumento nenhum, que é o que a
// tela da síntese faz logo depois de `atarNudo()`.
//
// O CUSTO ACEITO: quem passar mais de DIAS_POR_DELANTE dias sem abrir o app
// para de receber o aviso. Isso é deliberado e está alinhado com o que a copy já
// promete em `ajustes.recordatorio.pie` — "sin insistir si un día no vienes".
// Um app que continua cutucando quem foi embora há duas semanas é exatamente o
// que este produto decidiu não ser. Sete dias de folga bastam para quem ainda
// está por perto.
//
// ===========================================================================
// CANAL DE AVISOS — por que injetado e não importado
// ===========================================================================
// expo-notifications NÃO está no package.json deste projeto (verificado: não
// está em `dependencies` nem em node_modules). E um `require('expo-notifications')`
// aqui — mesmo dentro de try/catch — NÃO degrada: o Metro resolve dependência de
// forma estática e o bundle inteiro quebra na hora de subir o app. Por isso este
// módulo fala com um ADAPTADOR resolvido em runtime, na mesma convenção que
// screens/AjustesScreen.js já documenta:
//   1. `registrarCanal(canal)` — o caminho do App.js e dos testes;
//   2. `globalThis.HiloRojoAvisos` — registrado no boot, quando a dependência existir;
//   3. nenhum — e TODAS as funções daqui devolvem
//      { ok: false, motivo: MOTIVO_SIN_CANAL, instalar: INSTALAR }.
// Nada quebra, nada lança, nada mente. `estado()` continua devolvendo a hora
// guardada, então a tela desenha o cartão igual.
//
// PARA LIGAR DE VERDADE (um comando e um bloco):
//
//   npx expo install expo-notifications
//
//   // App.js, no boot:
//   import * as N from 'expo-notifications';
//   import { registrarCanal } from './lib/recordatorio';
//
//   N.setNotificationHandler({
//     handleNotification: async () => ({
//       shouldShowBanner: true, shouldPlaySound: false, shouldSetBadge: false,
//     }),
//   });
//
//   registrarCanal({
//     async permiso() {
//       const p = await N.getPermissionsAsync();
//       if (p.status === 'granted') return 'concedido';
//       return p.canAskAgain === false ? 'negado' : 'sin-preguntar';
//     },
//     async pedirPermiso() {
//       const p = await N.requestPermissionsAsync();
//       return p.status === 'granted' ? 'concedido' : 'negado';
//     },
//     async programarEnFecha({ id, fecha, titulo, cuerpo, datos }) {
//       await N.scheduleNotificationAsync({
//         identifier: id,
//         content: { title: titulo, body: cuerpo, data: datos },
//         trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: fecha },
//       });
//       return true;
//     },
//     async cancelar() {
//       await N.cancelAllScheduledNotificationsAsync();
//       return true;
//     },
//     // Só para screens/AjustesScreen.js, cujo `resolverCanal` exige `programar`.
//     // Ver "DUAS COISAS PARA FAZER NO MESMO COMMIT", logo abaixo.
//     async programar({ hora, minuto }) {
//       const r = await programarDiario({ hora, minuto });
//       return r.ok;
//     },
//   });
//
// DUAS COISAS PARA FAZER NO MESMO COMMIT EM QUE A DEPENDÊNCIA ENTRAR, ou o app
// passa a mentir em duas telas:
//   · screens/AjustesScreen.js hoje chama `canal.programar({hora, minuto, titulo,
//     cuerpo})` DIRETO, com o gatilho diário repetido. Ele tem que passar a
//     chamar `programarDiario({hora, minuto})` e `cancelar()` daqui: dois donos
//     agendando é como nascem os dois avisos no mesmo dia (cada um cancela tudo
//     e reagenda o seu). Enquanto não houver canal nenhum, os dois convivem sem
//     efeito e nada quebra.
//   · datos/textos.js → `privacidad.recordatorio` afirma hoje, com todas as
//     letras, que "la app no envía ninguna notificación". No dia em que enviar,
//     essa linha vira mentira numa tela de privacidade — que é o pior lugar
//     possível para uma. Reescrever no mesmo commit.
//
// ===========================================================================
// DISCO
// ===========================================================================
// Uma chave NUA, 'recordatorio' (o prefixo 'hr.' é assunto do lib/almacen.js e
// ninguém o escreve à mão), no formato { activo, hora, minuto } — exatamente o
// mesmo que screens/AjustesScreen.js já lê e sanitiza, e que já está em
// CLAVES_HILO_ROJO, então o "Borrar todo" continua apagando de verdade.
// ===========================================================================

import { t } from '../datos/textos.js';
import { RUTAS } from '../routes.js';
import { guardarSeguro, leerSeguro } from './almacen.js';
import { resumenHilo } from './hilo.js';

// Extensão explícita nos imports acima: o Metro do Expo resolve com ou sem ela,
// mas o `node --test` do `npm test` roda ESM de verdade e recusa caminho
// relativo sem extensão. Com '.js' o mesmo arquivo carrega nos dois.

const CLAVE = 'recordatorio';

/* =================================================================================
 * CONSTANTES PÚBLICAS
 * As telas comparam por igualdade contra estes valores em vez de escrever a
 * string solta — assim o dia de trocar um motivo é um grep só.
 * ================================================================================= */

/** Não há canal de avisos neste build. É o estado de HOJE. */
export const MOTIVO_SIN_CANAL = 'sin-notificaciones';
/** Há um objeto registrado, mas falta algum método do contrato. Erro de fiação. */
export const MOTIVO_CANAL_INCOMPLETO = 'canal-incompleto';
/** O sistema não deu (ou ainda não perguntou) a permissão. Não é erro. */
export const MOTIVO_SIN_PERMISO = 'sin-permiso';
/** A pessoa desligou o recordatório. Rearmar sem argumento não o religa. */
export const MOTIVO_DESACTIVADO = 'desactivado';
/** O canal existe, tem permissão, e mesmo assim nenhum aviso entrou. */
export const MOTIVO_ERROR = 'error-programar';

/** O que falta rodar para o caminho degradado virar o caminho de verdade. */
export const INSTALAR = 'npx expo install expo-notifications';

/**
 * Quantos dias de aviso ficam armados de uma vez. Ver "A JANELA" no cabeçalho:
 * é o número de dias que a pessoa pode passar sem abrir o app antes de o aviso
 * silenciar sozinho. Sete é uma semana — mexer aqui é uma decisão de produto,
 * não de código.
 */
export const DIAS_POR_DELANTE = 7;

/**
 * Os minutos que a hora do aviso aceita. Existe porque
 * screens/AjustesScreen.js oferece exatamente "En punto" e "Y media", e o
 * `normalizarRecordatorio` de lá encaixa qualquer outro valor em 0. Se este
 * módulo aceitasse 15, o disco guardaria 15, a tela mostraria "en punto" e o
 * aviso chegaria quinze minutos depois do que ela leu na tela.
 */
export const MINUTOS_VALIDOS = Object.freeze([0, 30]);

/**
 * TEM QUE BATER com RECORDATORIO_POR_DEFECTO de screens/AjustesScreen.js.
 * Está duplicado de propósito, pela mesma razão que `hoyLocal` está duplicado
 * entre lib/hilo.js e lib/limiteDiario.js: uma lib não importa de uma tela. No
 * dia em que AjustesScreen passar a chamar este módulo (ver o cabeçalho), a
 * constante de lá é apagada e passa a vir daqui.
 */
export const POR_DEFECTO = Object.freeze({ activo: false, hora: 21, minuto: 0 });

/* =================================================================================
 * DATA — tudo em dia LOCAL, nunca UTC
 * Mesma decisão de lib/hilo.js: quem lê às 22h de Buenos Aires está no dia dela.
 * ================================================================================= */

function esFecha(v) {
  return v instanceof Date && Number.isFinite(v.getTime());
}

function ahoraLocal(ahora) {
  return esFecha(ahora) ? ahora : new Date();
}

/** 'YYYY-MM-DD' local — o mesmo formato que lib/hilo.js consome e devolve. */
export function diaISO(fecha) {
  const d = ahoraLocal(fecha);
  const pad = (n, largo = 2) => String(n).padStart(largo, '0');
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * 1..366. Ancorado em duas meias-noites LOCAIS e arredondado: no dia da virada
 * do horário de verão a diferença dá 0,96 ou 1,04 dia, e sem o `round` a
 * variação do texto pularia ou repetiria justamente naquele dia.
 * Exportada só para o teste conseguir exercitar a virada de ano e o horário de
 * verão sem mexer no relógio da máquina.
 */
export function diaDelAnio(fecha) {
  const d = ahoraLocal(fecha);
  const inicio = new Date(d.getFullYear(), 0, 1);
  const hoy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((hoy.getTime() - inicio.getTime()) / 86400000) + 1;
}

/** A data local de daqui a `dias` dias, no horário pedido. Vira mês e ano sozinho. */
function fechaDelAviso(base, dias, hora, minuto) {
  const d = ahoraLocal(base);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + dias, hora, minuto, 0, 0);
}

/* =================================================================================
 * O TEXTO — três variações, alternadas pelo DIA DO ANO
 * ================================================================================= */

// A ordem importa e é contrato: a PRIMEIRA é a que screens/AjustesScreen.js
// desenha na prévia. Trocar a ordem faz a prévia mostrar um texto e o telefone
// receber outro no mesmo dia.
const VARIANTES = Object.freeze([
  Object.freeze({
    titulo: 'ajustes.recordatorio.aviso.titulo',
    cuerpo: 'ajustes.recordatorio.aviso.cuerpo',
  }),
  Object.freeze({
    titulo: 'ajustes.recordatorio.aviso.dos.titulo',
    cuerpo: 'ajustes.recordatorio.aviso.dos.cuerpo',
  }),
  Object.freeze({
    titulo: 'ajustes.recordatorio.aviso.tres.titulo',
    cuerpo: 'ajustes.recordatorio.aviso.tres.cuerpo',
  }),
]);

/**
 * O texto que chega numa data. DETERMINÍSTICO: `(dia do ano - 1) % 3`.
 *
 * Sem Math.random de propósito, e não é preciosismo. Com sorteio, a prévia da
 * tela não teria como dizer a verdade sobre o que vai chegar, dois telefones no
 * mesmo dia receberiam textos diferentes, e nenhum teste conseguiria travar o
 * conteúdo do aviso. Com o dia do ano, o texto de qualquer data é calculável no
 * papel — e a pessoa que recebe 30 dias seguidos não lê a mesma frase 30 vezes.
 *
 * @param {Date} [fecha] a data do aviso; sem ela, hoje.
 * @returns {{titulo: string, cuerpo: string, variante: number}} variante 0..2
 */
export function contenidoDelDia(fecha) {
  const indice = (diaDelAnio(fecha) - 1) % VARIANTES.length;
  const v = VARIANTES[indice];
  return { titulo: t(v.titulo), cuerpo: t(v.cuerpo), variante: indice };
}

/* =================================================================================
 * DESTINO DO TOQUE
 * ================================================================================= */

/**
 * O payload que viaja dentro do aviso. `ruta` é RUTAS.TIRADA e não a home:
 * regra 4 do cabeçalho. `dia` viaja junto para que o App.js consiga descartar o
 * toque num aviso velho (aberto três dias depois, na barra de notificações).
 */
function datosDelAviso(dia) {
  return { ruta: RUTAS.TIRADA, origen: CLAVE, dia };
}

/**
 * Para onde o toque leva. Aceita a resposta inteira do expo-notifications, a
 * notificação solta ou já o objeto de dados — as três formas aparecem conforme
 * o app tenha sido aberto pelo aviso ou já estivesse rodando.
 *
 * Existe para que o contrato do deep link não fique escrito em dois lugares:
 * quem monta o payload é este arquivo, quem o lê também.
 *
 * @returns {{ruta: string, dia: string|null}} sempre uma rota válida; na dúvida,
 *   a leitura do dia. Nunca lança e nunca devolve a home.
 */
export function rutaDelAviso(respuesta) {
  const datos =
    (respuesta
      && (respuesta.ruta
        ? respuesta
        : (respuesta.notification || respuesta).request?.content?.data))
    || null;
  const ruta = datos && typeof datos.ruta === 'string' ? datos.ruta : null;
  const valida = ruta && Object.values(RUTAS).includes(ruta);
  return {
    ruta: valida ? ruta : RUTAS.TIRADA,
    dia: datos && typeof datos.dia === 'string' ? datos.dia : null,
  };
}

/* =================================================================================
 * CANAL
 * ================================================================================= */

let _canal;

/**
 * Registra o adaptador de notificação. Ver o bloco pronto no cabeçalho.
 * Passar `null` desliga o canal e devolve o módulo ao caminho degradado.
 */
export function registrarCanal(canal) {
  _canal = canal || null;
  return _canal;
}

const METODOS = ['permiso', 'pedirPermiso', 'programarEnFecha', 'cancelar'];

// Resolvido a cada chamada (é barato) para que um App.js que registre o canal
// depois do primeiro render seja notado sem ninguém remontar nada.
function resolverCanal() {
  const candidato =
    _canal || (typeof globalThis !== 'undefined' ? globalThis.HiloRojoAvisos : null);
  if (!candidato) return { canal: null, motivo: MOTIVO_SIN_CANAL };
  const falta = METODOS.filter((m) => typeof candidato[m] !== 'function');
  if (falta.length > 0) return { canal: null, motivo: MOTIVO_CANAL_INCOMPLETO, falta };
  return { canal: candidato, motivo: null };
}

// Nenhuma chamada ao canal pode derrubar a tela: o adaptador é código de
// terceiro (expo-notifications) atrás de uma promise, e uma exceção dele viraria
// crash no meio de um `useEffect`. Falhou, é `null` — e quem chamou decide.
async function pedir(canal, metodo, arg) {
  try {
    return await canal[metodo](arg);
  } catch {
    return null;
  }
}

/* =================================================================================
 * DISCO
 * ================================================================================= */

function normalizar(bruto) {
  if (!bruto || typeof bruto !== 'object') return { ...POR_DEFECTO };
  const hora = Number(bruto.hora);
  const minuto = Number(bruto.minuto);
  return {
    activo: bruto.activo === true,
    hora: Number.isInteger(hora) && hora >= 0 && hora <= 23 ? hora : POR_DEFECTO.hora,
    minuto: MINUTOS_VALIDOS.includes(minuto) ? minuto : POR_DEFECTO.minuto,
  };
}

/**
 * O recordatório como está no disco, sanitizado. Não escreve e nunca lança:
 * storage é entrada externa e pode vir editado, truncado ou de outra versão.
 */
export async function leerRecordatorio() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return { ...POR_DEFECTO };
  try {
    return normalizar(JSON.parse(bruto));
  } catch {
    return { ...POR_DEFECTO };
  }
}

async function guardar(config) {
  return guardarSeguro(CLAVE, JSON.stringify(config));
}

// A hora pedida vira a hora que o disco e a tela vão concordar em mostrar.
// Valor fora da faixa cai no padrão em vez de lançar: quem chamou é uma tela.
function horaValida(valor, porDefecto) {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 && n <= 23 ? n : porDefecto;
}

function minutoValido(valor, porDefecto) {
  const n = Number(valor);
  return MINUTOS_VALIDOS.includes(n) ? n : porDefecto;
}

/* =================================================================================
 * A INTERFACE PÚBLICA
 * Quatro funções. Nenhuma lança, todas assíncronas, e sem canal todas devolvem
 * { ok: false, motivo: MOTIVO_SIN_CANAL, instalar: INSTALAR }.
 * ================================================================================= */

function degradado(motivo, extra) {
  return { ok: false, motivo, instalar: INSTALAR, ...extra };
}

/**
 * Pede a permissão do sistema. ABRE A CAIXA DE DIÁLOGO — chame só no toque de um
 * botão, nunca na montagem de uma tela: a caixa só pode ser pedida uma vez por
 * instalação, e um "no" dado de susto fecha o canal para sempre (só os ajustes
 * do telefone reabrem). Quem quer apenas SABER o estado chama `estado()`.
 *
 * @returns {Promise<{ok: boolean, estado: 'concedido'|'negado'|'sin-preguntar',
 *   motivo: string|null, instalar?: string}>}
 */
export async function pedirPermiso() {
  const { canal, motivo } = resolverCanal();
  if (!canal) return degradado(motivo, { estado: 'sin-preguntar' });

  const respuesta = await pedir(canal, 'pedirPermiso');
  const estadoPermiso = respuesta === 'concedido' || respuesta === 'negado'
    ? respuesta
    : 'sin-preguntar';
  return {
    ok: estadoPermiso === 'concedido',
    estado: estadoPermiso,
    motivo: estadoPermiso === 'concedido' ? null : MOTIVO_SIN_PERMISO,
  };
}

/**
 * Arma a janela de avisos: um por dia, no horário pedido, pelos próximos
 * DIAS_POR_DELANTE dias. Cancela tudo antes — é o que garante "nunca vários".
 *
 * DOIS MODOS, e a diferença é ter ou não passado a hora:
 *   programarDiario({ hora, minuto }) → LIGA o recordatório e grava no disco.
 *     É o botão "Activar el recordatorio" e a troca de horário.
 *   programarDiario()                 → REARMA com o que já está no disco, e
 *     não liga nada: se a pessoa desligou, devolve MOTIVO_DESACTIVADO e não
 *     agenda. É a chamada que a tela da síntese faz logo depois de `atarNudo()`,
 *     e é ela que tira o aviso de hoje da janela.
 *
 * O AVISO DE HOJE NÃO ENTRA quando o nó de hoje já está atado (lib/hilo.js) ou
 * quando o horário de hoje já passou. Os outros seis dias entram sempre: se ela
 * não abrir o app amanhã, o aviso de amanhã já está armado desde hoje.
 *
 * Não pede permissão — `pedirPermiso()` é chamada à parte, e de propósito. Sem
 * permissão concedida, esta função devolve MOTIVO_SIN_PERMISO e NÃO grava
 * `activo: true`: a tela não pode mostrar "Activado" sobre um canal mudo.
 *
 * @param {object} [opciones]
 * @param {number} [opciones.hora] 0..23
 * @param {number} [opciones.minuto] 0 ou 30 (ver MINUTOS_VALIDOS)
 * @param {Date}   [opciones.ahora] só os testes passam isto
 * @returns {Promise<{ok: boolean, motivo: string|null, hora: number, minuto: number,
 *   programados: number, saltaHoy: boolean, proximo: string|null, guardado: boolean,
 *   instalar?: string}>}
 *   programados — quantos avisos ficaram armados (0..DIAS_POR_DELANTE)
 *   saltaHoy    — hoje não vai chegar nada, porque a leitura de hoje já aconteceu
 *   proximo     — ISO do primeiro aviso armado, ou null se nenhum
 */
export async function programarDiario(opciones) {
  const opts = opciones || {};
  const pidioHora = opts.hora !== undefined || opts.minuto !== undefined;
  const guardado = await leerRecordatorio();
  const hora = pidioHora ? horaValida(opts.hora, guardado.hora) : guardado.hora;
  const minuto = pidioHora ? minutoValido(opts.minuto, guardado.minuto) : guardado.minuto;
  const base = { hora, minuto, programados: 0, saltaHoy: false, proximo: null, guardado: false };

  const { canal, motivo } = resolverCanal();
  if (!canal) return degradado(motivo, base);

  // Rearme de quem já desligou não religa nada. Só o pedido explícito liga.
  if (!pidioHora && !guardado.activo) {
    return { ...base, ok: false, motivo: MOTIVO_DESACTIVADO };
  }

  const permiso = await pedir(canal, 'permiso');
  if (permiso !== 'concedido') {
    return { ...base, ok: false, motivo: MOTIVO_SIN_PERMISO, permiso: permiso || 'sin-preguntar' };
  }

  // SEMPRE antes de agendar. É esta linha que impede dois avisos no mesmo dia
  // quando a pessoa troca o horário duas vezes seguidas.
  await pedir(canal, 'cancelar');

  const ahora = ahoraLocal(opts.ahora);
  // A única pergunta que este módulo faz sobre a vida da usuária, e ela é local.
  const hilo = await resumenHilo(diaISO(ahora));
  const saltaHoy = hilo.hoyAtado === true;

  let programados = 0;
  let proximo = null;
  for (let d = 0; d < DIAS_POR_DELANTE; d += 1) {
    const fecha = fechaDelAviso(ahora, d, hora, minuto);
    // Hoje sai da janela por dois motivos, e os dois são o mesmo cuidado: não
    // mandar um aviso que já não faz sentido quando ele chegar.
    if (d === 0 && (saltaHoy || fecha.getTime() <= ahora.getTime())) continue;
    const dia = diaISO(fecha);
    const { titulo, cuerpo } = contenidoDelDia(fecha);
    const ok = await pedir(canal, 'programarEnFecha', {
      // Derivado da data: reprogramar o mesmo dia SUBSTITUI em vez de somar.
      id: `hr.${CLAVE}.${dia}`,
      fecha,
      titulo,
      cuerpo,
      datos: datosDelAviso(dia),
    });
    if (ok === false || ok === null) continue;
    programados += 1;
    if (!proximo) proximo = fecha.toISOString();
  }

  if (programados === 0) {
    // O canal aceitou tudo e nada entrou: é falha de verdade, e a tela tem a
    // copy `ajustes.recordatorio.errorProgramar` para ela.
    return { ...base, ok: false, motivo: MOTIVO_ERROR, saltaHoy };
  }

  const persistido = await guardar({ activo: true, hora, minuto });
  return {
    ...base,
    ok: true,
    motivo: null,
    programados,
    saltaHoy,
    proximo,
    guardado: persistido,
  };
}

/**
 * Desliga o recordatório: apaga a janela inteira e grava `activo: false`.
 *
 * A marca no disco é gravada MESMO sem canal. Sem isso, um "Desactivar" tocado
 * numa build sem notificação deixaria o disco dizendo `activo: true`, e o app
 * voltaria a agendar sozinho no primeiro rearme depois de a dependência entrar
 * — avisos que a pessoa já tinha desligado.
 *
 * @returns {Promise<{ok: boolean, motivo: string|null, guardado: boolean, instalar?: string}>}
 */
export async function cancelar() {
  const config = await leerRecordatorio();
  const persistido = await guardar({ ...config, activo: false });

  const { canal, motivo } = resolverCanal();
  if (!canal) return degradado(motivo, { guardado: persistido });

  const ok = await pedir(canal, 'cancelar');
  return {
    ok: ok !== false && ok !== null,
    motivo: ok === false || ok === null ? MOTIVO_ERROR : null,
    guardado: persistido,
  };
}

/**
 * O que a tela precisa saber para desenhar o cartão. Não escreve, não agenda e
 * — importante — NÃO abre a caixa de permissão: só pergunta o que já foi
 * respondido antes.
 *
 * Devolve a hora guardada mesmo sem canal, para que o cartão continue mostrando
 * a prévia e o seletor de horário em vez de sumir.
 *
 * @param {object} [opciones]
 * @param {Date} [opciones.ahora] só os testes passam isto
 * @returns {Promise<{ok: boolean, disponible: boolean, activo: boolean, hora: number,
 *   minuto: number, permiso: string, saltaHoy: boolean, hoy: {titulo: string,
 *   cuerpo: string, variante: number}, motivo: string|null, instalar?: string}>}
 *   ok         — está ligado E há canal para cumprir isso
 *   disponible — existe canal de avisos neste build
 *   saltaHoy   — a leitura de hoje já aconteceu, então hoje não chega nada
 *   hoy        — o texto exato que a data de hoje manda (o da prévia da tela)
 */
export async function estado(opciones) {
  const opts = opciones || {};
  const ahora = ahoraLocal(opts.ahora);
  const config = await leerRecordatorio();
  const hoy = contenidoDelDia(ahora);
  const base = {
    activo: config.activo,
    hora: config.hora,
    minuto: config.minuto,
    hoy,
  };

  const { canal, motivo } = resolverCanal();
  if (!canal) {
    return degradado(motivo, {
      ...base,
      disponible: false,
      permiso: 'sin-preguntar',
      saltaHoy: false,
    });
  }

  const permiso = await pedir(canal, 'permiso');
  const hilo = await resumenHilo(diaISO(ahora));
  const permisoNormalizado =
    permiso === 'concedido' || permiso === 'negado' ? permiso : 'sin-preguntar';

  return {
    ...base,
    ok: config.activo && permisoNormalizado === 'concedido',
    disponible: true,
    permiso: permisoNormalizado,
    saltaHoy: hilo.hoyAtado === true,
    motivo: permisoNormalizado === 'concedido' ? null : MOTIVO_SIN_PERMISO,
  };
}

/* =================================================================================
 * SÓ PARA OS TESTES
 * O canal é por SESSÃO de propósito (registrado uma vez no boot); um teste que
 * injeta um canal falso deixaria todos os seguintes do mesmo arquivo com ele.
 * ================================================================================= */
export function _reiniciarParaTests() {
  _canal = null;
  if (typeof globalThis !== 'undefined') delete globalThis.HiloRojoAvisos;
}

export default {
  pedirPermiso,
  programarDiario,
  cancelar,
  estado,
  registrarCanal,
  contenidoDelDia,
  rutaDelAviso,
  leerRecordatorio,
  DIAS_POR_DELANTE,
  MOTIVO_SIN_CANAL,
  INSTALAR,
};
