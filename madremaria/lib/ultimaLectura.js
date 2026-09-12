// lib/ultimaLectura.js
// A ULTIMA LEITURA DO DIA, guardada no disco — a rede que segura a Sintesis
// quando a pessoa recarrega a pagina.
// Interface publica em espanhol, comentarios em portugues (mesma convencao de
// lib/hilo.js, lib/almacen.js e lib/lectura.js).
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE (o bug que ele conserta)
// ===========================================================================
// O estado da leitura viaja por PARAMETRO DE ROTA: a TiradaScreen empilha a
// Sintesis com { respuestas, tirada, lectura, hilo }. No aparelho isso basta —
// o objeto vive na memoria do navegador de telas e ninguem recarrega nada.
//
// Na WEB nao basta, e por dois motivos que se somam:
//   1. parametro de rota que nao esta no caminho da URL vira query string, e
//      objeto virava "[object Object]" na barra de enderecos (corrigido no
//      `stringify` do linking, em App.js e navegacion.js: os objetos agora
//      simplesmente NAO entram na URL);
//   2. mesmo com a URL limpa, recarregar /sintesis remonta o app do zero. O
//      React Navigation reconstroi a rota a partir do CAMINHO, e caminho nao
//      carrega objeto nenhum: a tela nasce sem params.
//
// Sem este modulo, o (2) entrega uma Sintesis com as tabelas genericas e ZERO
// cartas — titulo, saudacao sem nome e uma tarjeta vazia. Nao quebra, o que e
// pior: parece uma leitura, e nao e a leitura dela.
//
// A correcao e guardar o MINIMO para recompor: as respostas e os tres ids com a
// orientacao. O texto nao se guarda — lib/lectura.js e puro e deterministico,
// entao componerLectura() sobre a mesma entrada devolve exatamente a mesma
// leitura, palavra por palavra. Guardar o texto seria guardar uma copia que
// envelhece sozinha na primeira vez que uma tabela mudar.
//
// ===========================================================================
// SO VALE PARA HOJE
// ===========================================================================
// O registro carrega o dia local em que foi feito e `leerUltimaLectura()`
// devolve null quando o dia virou. Nao e faxina: o disco fica como esta. E que
// a Sintesis se chama "Tu hilo, hoy" — restaurar a leitura de ontem como se
// fosse a de hoje seria a unica forma de este arquivo mentir.
//
// Nada aqui lanca. Toda duvida vira null, e o pior caso e a tela mandar a
// pessoa de volta para as abas — nunca uma tela morta.

import { guardarSeguro, leerSeguro } from './almacen.js';
import { cartaPorId } from './mazo.js';

// Chave NUA: o prefixo 'hr.' e assunto do lib/almacen.js e escrever
// 'hr.ultimaLectura' aqui geraria 'hr.hr.ultimaLectura'.
const CLAVE = 'ultimaLectura';

// Quantas cartas tem a tirada. O mesmo 3 de lib/lectura.js (CLAVES_POSICION),
// escrito aqui porque este modulo nao interpreta posicao nenhuma: ele so conta.
const TOTAL_CARTAS = 3;

// Duplicado de proposito, como lib/hilo.js ja duplica de lib/limiteDiario.js:
// sao motores independentes e nenhum deve quebrar porque o outro mudou.
// Dia LOCAL, nunca UTC — quem le as 22h de Buenos Aires esta no dia dela.
function hoyLocal() {
  const d = new Date();
  const pad = (n, largo = 2) => String(n).padStart(largo, '0');
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Reduz a tirada ao que precisa ser guardado: id + orientacao. Aceita as duas
 * formas que lib/lectura.js ja aceita ({ carta, invertida } e a carta achatada
 * com `invertida` dentro), porque este modulo nao pode ser mais exigente do que
 * o motor que consome o mesmo dado.
 *
 * @returns {Array<{id: string, invertida: boolean}>|null} null quando nao ha 3.
 */
function comprimir(tirada) {
  if (!Array.isArray(tirada) || tirada.length !== TOTAL_CARTAS) return null;
  const salida = [];
  for (const entrada of tirada) {
    if (!entrada || typeof entrada !== 'object') return null;
    const carta = entrada.carta && typeof entrada.carta === 'object' ? entrada.carta : entrada;
    if (!carta || typeof carta.id !== 'string' || !carta.id) return null;
    const marca = entrada.invertida !== undefined ? entrada.invertida : carta.invertida;
    salida.push({ id: carta.id, invertida: Boolean(marca) });
  }
  return salida;
}

/** O caminho de volta: dos ids para as cartas inteiras do baralho. */
function descomprimir(cartas) {
  if (!Array.isArray(cartas) || cartas.length !== TOTAL_CARTAS) return null;
  const salida = [];
  for (const entrada of cartas) {
    if (!entrada || typeof entrada !== 'object') return null;
    const carta = cartaPorId(entrada.id);
    // Id que nao existe mais no baralho (versao antiga do app, disco editado a
    // mao): a leitura inteira e descartada. Meia tirada seria pior que nenhuma.
    if (!carta) return null;
    salida.push({ carta, invertida: Boolean(entrada.invertida) });
  }
  return salida;
}

/**
 * Guarda a leitura entregue hoje. Chamada UMA vez, no fecho do ritual.
 *
 * @param {object} entrada
 * @param {object} [entrada.respuestas] as respostas do onboarding em uso
 * @param {Array}  entrada.tirada       as tres cartas, como sacarTres() devolve
 * @param {string} [entrada.dia]        dia YYYY-MM-DD; so os testes passam isto
 * @returns {Promise<boolean>} true quando foi ao disco de verdade
 */
export async function guardarUltimaLectura(entrada) {
  const datos = entrada && typeof entrada === 'object' ? entrada : {};
  const cartas = comprimir(datos.tirada);
  // Sem as tres cartas nao ha o que restaurar, e gravar meia leitura so criaria
  // um registro que a leitura seguinte teria de aprender a desconfiar.
  if (!cartas) return false;

  const respuestas =
    datos.respuestas && typeof datos.respuestas === 'object' ? datos.respuestas : null;

  const registro = {
    dia: typeof datos.dia === 'string' && datos.dia ? datos.dia : hoyLocal(),
    respuestas,
    cartas,
  };

  try {
    return await guardarSeguro(CLAVE, JSON.stringify(registro));
  } catch {
    // guardarSeguro nao lanca por contrato; o catch cobre um JSON.stringify que
    // esbarre em referencia circular vinda de um chamador futuro.
    return false;
  }
}

/**
 * A leitura de HOJE, pronta para entrar em componerLectura(). null quando nao
 * ha registro, quando ele nao serve, ou quando ele e de outro dia.
 *
 * @param {string} [hoy] dia YYYY-MM-DD; so os testes passam isto.
 * @returns {Promise<{respuestas: object|null, tirada: Array}|null>}
 */
export async function leerUltimaLectura(hoy) {
  const dia = typeof hoy === 'string' && hoy ? hoy : hoyLocal();
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return null;

  let registro;
  try {
    registro = JSON.parse(bruto);
  } catch {
    return null;
  }
  if (!registro || typeof registro !== 'object') return null;
  if (registro.dia !== dia) return null;

  const tirada = descomprimir(registro.cartas);
  if (!tirada) return null;

  return {
    respuestas:
      registro.respuestas && typeof registro.respuestas === 'object' ? registro.respuestas : null,
    tirada,
  };
}

export default { guardarUltimaLectura, leerUltimaLectura };
