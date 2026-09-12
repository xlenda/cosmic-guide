// lib/proximaLua.js — A DATA DA PROXIMA LUA NOVA, EM PALAVRAS, OU NADA.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE
// ===========================================================================
// Duas telas precisam da MESMA frase, no mesmo instante da mesma sessao:
//
//   · screens/LeituraProfundaScreen.js — o audio 11 diz, com a voz da leitura,
//     "ela comeca na proxima lua nova, que ja tem dia e hora marcados no ceu —
//     e voce esta vendo esses dois escritos aqui na tela, agora". Enquanto a
//     tela nao desenhasse a data, a voz apontava para um lugar vazio. O
//     cabecalho de datos/profunda.js registra essa divida pelo nome.
//   · screens/PaywallScreen.js — a mesma lua e o argumento da tela, e ela e o
//     UNICO tipo de urgencia que este produto aceita: nao ha contador
//     regressivo, nao ha "so hoje", nao ha vaga acabando. Ha uma efemeride, que
//     qualquer calendario do mundo confere.
//
// Duas telas escrevendo a mesma data por conta propria acabam divergindo — e
// divergir sobre um FATO MEDIDO e pior do que nao mostrar fato nenhum.
//
// ===========================================================================
// A REGRA UNICA: OU E MEDIDO, OU NAO RENDERIZA
// ===========================================================================
// `proximaLuaNova()` devolve `null` sempre que qualquer peca faltar — motor de
// efemeride ausente, instante fora de forma, tabela de mes ou de dia da semana
// que nao veio. NAO existe data aproximada, NAO existe "por volta de", NAO
// existe media de 29,53 dias somada a hoje. Quem chama desenha a linha quando
// vem objeto e NAO DESENHA NADA quando vem null (a mesma disciplina de
// `plano.ceu` em screens/PlanoScreen.js: null quer dizer "nao desenhe o card",
// nunca "desenhe vazio").
//
// Uma data de lua errada por um dia e conferivel por qualquer pessoa em cinco
// segundos, e derruba junto tudo o que o app diz sobre medir em vez de
// inventar. Vazio nao derruba nada.
//
// ===========================================================================
// QUAL DOS DOIS INSTANTES ESTE ARQUIVO USA
// ===========================================================================
// `proximaVirada` (lib/ano.js) devolve DOIS campos que nao sao a mesma coisa:
// `instante`, a lua nova exata, e `diaDaVirada`, o dia civil em que o tema
// troca sob a ancora de meio-dia local. Aqui a frase e sobre A LUA — "a proxima
// lua nova e quinta, as 3h47" —, entao o campo certo e `instante`. `diaDaVirada`
// responde outra pergunta (quando o TEMA muda) e nao aparece nesta frase.
//
// E usa `instante.local`, nao `instante.iso`: a pessoa confere a lua no relogio
// dela, nao em UTC. lib/ano.js ja entrega as duas formas exatamente por isso.
//
// ===========================================================================
// SEM ANCORA DE JORNADA, DE PROPOSITO
// ===========================================================================
// `proximaVirada(agora)` e chamada sem o inicio da jornada. Ela devolve
// `disponivel: false` (motivo SEM_INICIO_DA_JORNADA) e ainda assim traz
// `instante` preenchido — e esta certo: a data da proxima lua nova nao depende
// de quando ninguem instalou nada. Por isso o portao deste arquivo olha para
// `instante`, e NUNCA para `disponivel`, que responde sobre o ARCO dela.

import { lista, t } from '../datos/textos.js';
import { proximaVirada } from './ano.js';

/* 'YYYY-MM-DDTHH:MM:SS' — a forma de `instante.local` em lib/ano.js. Os
 * segundos entram na captura mas nao na frase: "as 3h47" e hora de gente; "as
 * 3h47min12s" e leitura de instrumento. */
const RE_LOCAL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/**
 * A proxima lua nova, ja em palavras.
 *
 * @param {Date|string|number} [agora] o instante de referencia. O padrao e o
 *   relogio do aparelho, que e a unica pergunta que esta funcao responde
 *   ("e a proxima a partir de agora?").
 * @returns {Readonly<{iso:string, dia:string, quando:string, nota:string}>|null}
 *   `null` sempre que nao houver medida. Quem chama nao desenha nada nesse caso.
 *   - `quando` a frase pronta: 'quinta-feira, 12 de agosto, às 3h47.'
 *   - `nota`   a consequencia, que tambem e verdade: entrar antes ou depois
 *              dela decide qual lunacao e a primeira dela.
 */
export function proximaLuaNova(agora = new Date()) {
  const virada = proximaVirada(agora);
  const instante = virada ? virada.instante : null;
  const local = instante && typeof instante.local === 'string' ? instante.local : null;
  if (!local) return null;

  const partes = RE_LOCAL.exec(local);
  if (!partes) return null;

  const [, ano, mesN, diaN, hh, mm] = partes;

  // As duas tabelas de calendario que o app ja tem, no IDIOMA ATIVO. lista() e o
  // mesmo caminho de lib/plano.js: t() interpolaria, e aqui o valor e um array.
  // Ler T direto (como era antes dos tres idiomas) devolveria sempre portugues.
  const meses = lista('ritual.meses');
  const semana = lista('plano.semana.nomes');
  if (!Array.isArray(meses) || !Array.isArray(semana)) return null;

  const mes = meses[Number(mesN) - 1];

  // O dia da semana sai de um Date LOCAL ancorado ao meio-dia. Meia-noite
  // escorregaria de dia em fuso com meia hora de offset, e a lua nova das 00h10
  // viraria "quarta" numa tela que diz "quinta" duas linhas acima.
  const civil = new Date(Number(ano), Number(mesN) - 1, Number(diaN), 12, 0, 0);
  if (Number.isNaN(civil.getTime())) return null;
  const diaSemana = semana[civil.getDay()];

  if (!mes || !diaSemana) return null;

  return Object.freeze({
    iso: instante.iso,
    dia: instante.dia,
    quando: t('lua.quando', {
      diaSemana,
      dia: Number(diaN),
      mes,
      // '3h47'. Hora sem zero a esquerda, minuto com ele: e como se le em voz
      // alta, e e como o audio 11 fala.
      hora: `${Number(hh)}h${mm}`,
    }),
    nota: t('lua.nota'),
  });
}

export default proximaLuaNova;
