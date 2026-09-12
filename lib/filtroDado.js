// O FILTRO DO DADO REAL — a lei "NUNCA FABRICAR" virada em função.
// (12/09/2026)
//
// POR QUE EXISTE. As peças de diagramação novas (components/TabelaDados.js e
// components/FileiraDeTres.js) mostram dado tabulado, e tabela é justamente
// onde a fabricação entra sem ninguém notar: um traço mudo numa célula, um
// "—", um "0" onde na verdade não se sabe. O dono já recusou número inventado
// duas vezes ("Amor 75%"). Então a decisão de "esta linha entra ou não" não
// fica espalhada no JSX de duas peças: mora aqui, numa função pura, e tem
// teste por mutação em test/filtroDado.test.js.
//
// A REGRA, em três casos:
//   1. tem valor real          -> a linha aparece com o valor;
//   2. não tem valor, mas tem  -> a linha aparece com o CONVITE, marcada
//      convite honesto            como pendente (quem desenha pinta apagado e
//                                 pode tornar tocável pra preencher);
//   3. não tem nem um nem      -> a linha SOME. Não vira traço, não vira
//      outro                      "não informado", não vira zero.
//
// O QUE CONTA COMO "SEM VALOR": null, undefined, string vazia ou só espaços.
// O QUE NÃO CONTA: o número 0 e o booleano false são valores REAIS (zero
// acertos é um dado; "false" numa coluna de sim/não é um dado). Confundir os
// dois é o bug clássico do `if (!valor)`.

/** Um valor é real? (0 e false são reais; vazio e branco não são.) */
export function temValor(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return Number.isFinite(v);
  return true;
}

/**
 * Filtra linhas de tabela / colunas de estatística pela lei de não fabricar.
 *
 * @param {Array<{valor?: any, convite?: string}>} itens
 * @returns {Array} só os itens exibíveis, cada um com `pendente: boolean`
 *                  (true = está mostrando o convite, não um valor)
 */
export function apenasReais(itens) {
  if (!Array.isArray(itens)) return [];
  const saida = [];
  for (const item of itens) {
    if (!item || typeof item !== 'object') continue;
    if (temValor(item.valor)) {
      saida.push({ ...item, pendente: false });
    } else if (temValor(item.convite)) {
      saida.push({ ...item, pendente: true });
    }
    // else: some. É o ponto inteiro deste módulo.
  }
  return saida;
}
