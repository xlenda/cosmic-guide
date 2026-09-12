/* ===================================================================================
   A CORRENTE — "faça eles se ligarem um no outro sempre" (o dono, 03/09/2026).

   Cada dia fechado deixa uma DEIXA: uma linha curta do que o dia foi (a
   resposta que ela escreveu, o nome do gesto, o título da missão). O próximo
   dia vivido abre citando essa linha — LITERAL, entre aspas. O app nunca
   parafraseia, interpreta ou comenta o conteúdo: a linha pode falar da outra
   pessoa, e qualquer comentário em cima dela flertaria com promessa ou com
   empurrar contato. Citar é seguro; comentar não é.

   Se ela faltar dias, a deixa ESPERA: quem a abre é o próximo dia vivido,
   e nenhuma copy conta o tempo que passou — ausência nunca quebra nada.

   Uma chave só ('corrente', em CLAVES_HILO_ROJO — sai no "Apagar tudo"),
   sempre sobrescrita pelo dia mais recente fechado.
   =================================================================================== */
import { leerSeguro, guardarSeguro } from './almacen.js';

const CLAVE = 'corrente';
const MAX_DEIXA = 120;

/**
 * Grava a deixa do dia fechado. Texto vazio não grava — dia sem linha não
 * apaga a deixa anterior (a corrente prefere um elo velho a elo nenhum). E a
 * corrente NUNCA anda para trás: fechar ONTEM (o perdão que o mapa permite)
 * depois de já ter fechado hoje não sobrescreve a linha mais nova — sem esta
 * guarda, o cabeçalho ("sempre o dia mais recente fechado") era mentira
 * (achado do /code-review de 03/09). O corte do teto é por CARACTERE
 * (Array.from), nunca por code unit: slice cru partia emoji ao meio na
 * fronteira e a citação chegava corrompida à tela.
 *
 * @returns {Promise<boolean>} false quando não gravou no disco (memória só,
 *   texto vazio, ou deixa mais nova já no lugar).
 */
export async function guardarDeixa(dia, ato, texto) {
  const limpo =
    typeof texto === 'string' ? Array.from(texto.trim()).slice(0, MAX_DEIXA).join('') : '';
  if (!dia || !limpo) return false;
  const atual = await lerDeixa();
  if (atual && String(dia) < atual.dia) return false;
  return guardarSeguro(
    CLAVE,
    JSON.stringify({ dia, ato: typeof ato === 'string' ? ato : '', texto: limpo })
  );
}

/**
 * A última deixa gravada, ou null. Nunca lança: JSON podre é corrente sem
 * elo, não erro.
 *
 * @returns {Promise<{dia: string, ato: string, texto: string}|null>}
 */
export async function lerDeixa() {
  const crudo = await leerSeguro(CLAVE);
  if (!crudo) return null;
  try {
    const d = JSON.parse(crudo);
    if (d && typeof d.dia === 'string' && typeof d.texto === 'string' && d.texto) {
      return { dia: d.dia, ato: typeof d.ato === 'string' ? d.ato : '', texto: d.texto };
    }
  } catch {
    // corrente sem elo
  }
  return null;
}
