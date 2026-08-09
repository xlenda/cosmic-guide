// lib/proximosEventos.js
// O CÉU NOS PRÓXIMOS DIAS — os próximos eventos astronômicos REAIS a partir de
// "agora", pro card de countdown da Home ("Faltam 2 dias · Lua Cheia").
//
// Este arquivo NÃO calcula astronomia nenhuma. Ele é uma janela sobre
// lib/calendarioCosmico.js — o motor que já data as quatro luas, os ingressos
// do Sol, o retrógrado de Mercúrio e os aspectos exatos, com cache por
// mês+idioma. Recalcular qualquer coisa aqui seria abrir a porta pra duas
// telas discordarem da mesma efeméride, que é exatamente o que o público
// deste app confere em outra fonte.
//
// DOIS MESES, NÃO UM. Só o mês corrente deixaria o card da Home minguando no
// fim do mês (dia 29 sem evento pela frente = card vazio) — então a coleta é
// sempre mês atual + mês seguinte, com a virada de ano tratada. O custo é o
// do próprio calendário, que já é cacheado por mês+idioma.
//
// DIA LOCAL PARA COMPARAR, NUNCA O INSTANTE UTC. Cada evento do calendário
// carrega os dois campos (ver o cabeçalho de lib/calendarioCosmico.js):
// dataISO/dia em UTC pra conferir contra efeméride pública, e dataLocal (via
// lib/localDay.js) que é o dia civil do aparelho — o que a pessoa chama de
// "hoje". O filtro e o faltamDias usam SÓ dataLocal contra localDayStr(agora):
// comparar o instante UTC com "hoje" faria a Lua Cheia de hoje às 3h sumir do
// card às 8h da manhã ("já passou"), quando pra quem lê ela é HOJE.
// A comparação de string é segura porque os dois lados são YYYY-MM-DD com
// zero à esquerda — ordem lexicográfica é ordem de data.
//
// NUNCA FABRICA — mesma disciplina do motor de baixo. Sem efeméride (ou mês
// fora do intervalo), calendarioCosmico devolve ceuDisponivel: false e este
// arquivo devolve null. A tela que recebe null NÃO renderiza o card — nada de
// estado de erro, nada de data estimada. Vazio conferível > chute bonito.
//
// O TÍTULO JÁ VEM NO IDIOMA PEDIDO: `lang` é repassado ao calendário, que
// resolve o pack (pt/es/en, fallback pt). Este arquivo não traduz nada — os
// rótulos de "Hoje"/"Amanhã"/"Faltam {n} dias" são da TELA (chaves i18n),
// porque são chrome de UI, não conteúdo do evento.

import { calendarioCosmico } from './calendarioCosmico';
import { localDayStr } from './localDay';

const MS_DIA = 24 * 60 * 60 * 1000;

// Dias inteiros entre dois YYYY-MM-DD locais. Date.UTC só pra subtrair sem
// horário de verão no meio — mesma técnica de lib/localDay.js e da rotação de
// rituais na Home. 0 = mesmo dia, 1 = amanhã, n = daqui a n dias.
function diasEntre(deStr, ateStr) {
  const [ay, am, ad] = deStr.split('-').map(Number);
  const [by, bm, bd] = ateStr.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / MS_DIA);
}

// Os eventos de UM mês, ou lista vazia se o céu não pôde ser calculado —
// quem soma os dois meses não precisa distinguir "indisponível" de "vazio":
// nos dois casos não há o que anunciar daquele mês.
function eventosDoMes(ano, mes, lang) {
  const cal = calendarioCosmico(ano, mes, lang);
  if (!cal || !cal.ceuDisponivel || !Array.isArray(cal.eventos)) return [];
  return cal.eventos;
}

// Os próximos eventos do céu a partir de `agora` (default: o relógio do
// aparelho — mas a função recebe a data DE PROPÓSITO, pra teste injetar um
// instante fixo em vez de depender do dia em que a suíte roda).
//
// Devolve até `max` itens, ordenados do mais próximo pro mais distante:
//   { titulo, emoji, tipo, data, dataLocal, faltamDias }
//     titulo     — já no idioma pedido (o pack do calendário resolveu)
//     emoji      — o glifo do próprio evento (🌕, ☿, ☉…), dado do motor
//     tipo       — a chave estrutural do calendário (luaCheia, ingressoSolar…)
//     data       — o instante UTC (Date), pra quem quiser conferir
//     dataLocal  — o dia civil do aparelho em YYYY-MM-DD (o que a tela usa)
//     faltamDias — 0 = hoje, 1 = amanhã, n = daqui a n dias
//
// Devolve null quando não há NADA a anunciar — os dois meses indisponíveis/
// vazios, ou nenhum evento de hoje em diante. null significa "não desenhe o
// card", nunca "desenhe um card de erro".
export function proximosEventos(agora = new Date(), lang = 'pt', max = 3) {
  // Data inválida cai pro relógio real — mesma guarda de localDayStr, e pelo
  // mesmo motivo: um NaN aqui viraria filtro que descarta tudo em silêncio.
  const base = agora instanceof Date && !Number.isNaN(agora.getTime()) ? agora : new Date();
  const teto = Number.isInteger(max) && max > 0 ? max : 3;

  // Mês pelo relógio LOCAL — mesma convenção de calendarioCosmicoDoMesAtual:
  // às 22h de 31/07 no Brasil o mês UTC já é agosto, mas o mês de quem lê não.
  const ano = base.getFullYear();
  const mes = base.getMonth() + 1; // 1-12, convenção humana do calendário
  const anoSeguinte = mes === 12 ? ano + 1 : ano;
  const mesSeguinte = mes === 12 ? 1 : mes + 1;

  const eventos = [...eventosDoMes(ano, mes, lang), ...eventosDoMes(anoSeguinte, mesSeguinte, lang)];
  if (eventos.length === 0) return null;

  const hoje = localDayStr(base);
  const futuros = eventos
    .filter((e) => typeof e.dataLocal === 'string' && e.dataLocal >= hoje)
    // O calendário já devolve cada mês ordenado, e mês atual vem antes do
    // seguinte — mas ordenar de novo custa nada e blinda contra qualquer
    // mudança futura na montagem lá de baixo.
    .sort((a, b) => a.data - b.data)
    .slice(0, teto)
    .map((e) => ({
      titulo: e.titulo,
      emoji: e.emoji,
      tipo: e.tipo,
      data: e.data,
      dataLocal: e.dataLocal,
      faltamDias: diasEntre(hoje, e.dataLocal),
    }));

  return futuros.length > 0 ? futuros : null;
}
