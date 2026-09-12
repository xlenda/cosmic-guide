/* ===================================================================================
   A VARIANTE DA LEITURA DE ENTRADA — o sorteio 50/50 (08/09).

   Decisão do dono: quando um lead entra, ou recebe a leitura A (a de sempre:
   O Coração, As Nuvens, O Cavaleiro + a carta extra) ou a B (A Montanha, Os
   Caminhos, A Chave + extra + estrela), cada uma com a sua leitura profunda —
   "só pra ter variedade": mesma essência, mesmo final, abordagem diferente.

   O sorteio acontece UMA vez, na primeira abertura da mesa, e fica gravado:
   a mesma pessoa vê sempre a mesma leitura (o reouvir do Perfil mostra a
   dela). É a única moeda do app — todos os outros motores são determinísticos
   por data, e este não pode ser: duas pessoas no mesmo dia precisam poder
   cair em leituras diferentes.

   Chave 'variante' em CLAVES_HILO_ROJO: guarda só a letra.
   =================================================================================== */
import { leerSeguro, guardarSeguro } from './almacen.js';

const CLAVE = 'variante';

export const VARIANTES = Object.freeze(['a', 'b']);
export const VARIANTE_PADRAO = 'a';

export function normalizarVariante(bruto) {
  return VARIANTES.includes(bruto) ? bruto : VARIANTE_PADRAO;
}

/** A variante já gravada, ou null (ainda não sorteou). Nunca lança. */
export async function varianteGravada() {
  try {
    const crudo = await leerSeguro(CLAVE);
    return VARIANTES.includes(crudo) ? crudo : null;
  } catch {
    return null;
  }
}

/**
 * A variante desta pessoa: a gravada, ou sorteia agora e grava. Disco quebrado
 * não trava a leitura — cai na padrão sem gravar (a próxima abertura sorteia de
 * novo, e o pior caso é uma pessoa ver as duas leituras em dias diferentes).
 */
export async function varianteDaEntrada(sorteio = Math.random) {
  const gravada = await varianteGravada();
  if (gravada) return gravada;
  const sorteada = sorteio() < 0.5 ? 'a' : 'b';
  try {
    await guardarSeguro(CLAVE, sorteada);
  } catch {
    /* fica na memória da sessão; ver o cabeçalho */
  }
  return sorteada;
}
