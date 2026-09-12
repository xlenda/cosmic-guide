// lib/mapaDoAno.js
// Os 365 dias do ano dela, de uma vez — o tabuleiro que a tela do mapa desenha.
//
// A pedido do dono (01/09): "mostrar todas as cartas dos 365 dias de uma vez
// dentro do app, ai ele consegue raspar uma carta no dia e cumprir a funcao do
// dia". Este modulo so MONTA o tabuleiro; quem raspa e o plano do dia, e quem
// lembra o que foi raspado e lib/veuDoDia.js.
//
// ===================================================================================
// OS ESTADOS DE CADA CASA, e o que cada um NAO e
// ===================================================================================
//   'raspado'  ela abriu este dia. Fato.
//   'aberto'   ainda aceita o dedo: o proprio hoje, e o ontem nao raspado
//              (o perdao de um dia — lib/veuDoDia.diaAindaAbre).
//   'passado'  ficou para tras sem raspar. NAO e "perdido", "falhou" nem
//              "quebrou a corrente": lib/ano.js proibe maquina de culpa por
//              escrito, e o portao de copy proibe streak que pune. A tela
//              desenha esta casa APAGADA, nunca marcada de erro.
//   'futuro'   ainda nao chegou. Fechado, sem toque — nao existe raspar amanha.
//
// NAO HA PERCENTUAL nem "quanto falta": os numeros que o mapa mostra sao os
// mesmos fatos contaveis do resto do app (o dia N, a lua M).
import { ANO_TROPICO_DIAS, lunacaoDe } from './ano.js';

/* O total de casas do tabuleiro. E o ano tropico ARREDONDADO PARA BAIXO — 365
 * dias inteiros — e o teste confere que ele nao se descola da medida de
 * lib/ano.js (ANO_TROPICO_DIAS = 365,2422). */
export const TOTAL_DIAS = Math.floor(ANO_TROPICO_DIAS);

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;

/* 'YYYY-MM-DD' -> Date UTC do meio-dia (meio-dia para nunca cair no dia errado
 * por um segundo de fuso; o mapa so compara DIAS, nunca horas). */
function aoMeioDia(dia) {
  const [a, m, d] = dia.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12));
}

function comoDia(t) {
  const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(t.getUTCDate()).padStart(2, '0');
  return `${t.getUTCFullYear()}-${mm}-${dd}`;
}

/**
 * O tabuleiro: um registro por dia, do dia 1 ao TOTAL_DIAS, agrupavel por lua.
 *
 * @param {string} inicioISO   a ancora do ano (lib/entrada.inicioDaJornada)
 * @param {string} hoje        o dia local 'YYYY-MM-DD'
 * @param {string[]} raspados  lib/veuDoDia.diasRaspados()
 * @returns {Array<{dia:string, n:number, lunacao:number|null, estado:string}>|null}
 *   null quando a ancora nao presta — a tela mostra o aviso de "seu ano comeca
 *   na proxima lua nova" em vez de um tabuleiro inventado.
 */
export function mapaDoAno(inicioISO, hoje, raspados) {
  if (!inicioISO || !DIA_RE.test(String(hoje))) return null;
  const inicio = new Date(inicioISO);
  if (Number.isNaN(inicio.getTime())) return null;

  /* O DIA 1 e o dia LOCAL do instante da ancora — nao o dia UTC. A ancora e
   * gravada a noite; no Brasil (UTC-3) as 22h locais ja sao dia seguinte em
   * UTC, e o quadro inteiro nascia deslocado: a lead terminava o funil e via
   * um tabuleiro sem casa aberta (achado do /code-review de 01/09). Os campos
   * LOCAIS do Date sao exatamente o que lib/ceu.diaLocal() usaria. */
  const primeiroDia = comoDia(
    new Date(Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate(), 12))
  );
  const base = aoMeioDia(primeiroDia);
  const setRaspados = new Set(Array.isArray(raspados) ? raspados : []);
  const ontem = comoDia(new Date(aoMeioDia(hoje).getTime() - 86400000));

  const casas = [];
  /* UMA medida por LUNACAO, nao por dia. A primeira versao chamava lunacaoDe
   * 365 vezes — cada chamada faz buscas iterativas de fase no astronomy-engine
   * — e congelava o JS thread por segundos num Android medio (achado do
   * /code-review). O retorno traz `fim` (o instante em que a lunacao fecha):
   * so se remede ao cruzar essa fronteira, ~14 medidas no ano inteiro. */
  let medida = null;
  for (let n = 1; n <= TOTAL_DIAS; n += 1) {
    const t = new Date(base.getTime() + (n - 1) * 86400000);
    const dia = comoDia(t);

    let estado;
    if (setRaspados.has(dia)) estado = 'raspado';
    else if (dia === hoje || dia === ontem) estado = 'aberto';
    else if (dia < hoje) estado = 'passado';
    else estado = 'futuro';

    /* `fim` e um OBJETO ({iso, local, dia}) — comparar com a string inteira
     * nunca disparava e o ano todo caia na lua 1 (pego pelo proprio teste). */
    if (!medida || (medida.fim && medida.fim.iso && t.toISOString() >= medida.fim.iso)) {
      medida = lunacaoDe(t.toISOString(), inicioISO);
    }
    /* O campo da lunacao em `lunacaoDe` chama-se `numero` (1..13); `lunacao` e
     * o campo de posicaoNoAno — confundir os dois devolve undefined mudo. Sem
     * medida disponivel a casa fica sem lua, nunca com chute. */
    const lunacao =
      medida && medida.disponivel && typeof medida.numero === 'number' ? medida.numero : null;

    casas.push({ dia, n, lunacao, estado });
  }
  return casas;
}

export default { mapaDoAno, TOTAL_DIAS };
