// lib/conquistas.js
// As doze conquistas do Fio Vermelho. Módulo 100% LEITURA: ele não abre o
// disco, não grava nada e não tem chave de storage. Comentários em português,
// como no resto de lib/.
//
// ===========================================================================
// A DECISÃO QUE FAZ ESTE ARQUIVO SER PEQUENO
// ===========================================================================
// Porte da ideia do lib/activity.js do Cosmic Guide, que declara no topo:
// "nenhuma chave nova é lida ou escrita, só combinamos o que já existe. Não
// grava nada: módulo 100% leitura". É o acerto estrutural daquele arquivo, e a
// consequência prática é grande:
//
//   · conquista não tem estado próprio, então não existe conquista PERDIDA;
//   · não há chave nova, então não há linha nova em CLAVES_HILO_ROJO e nada a
//     mais para o "Borrar todo" apagar (e nada a mais para a tela de privacidade
//     ter de declarar);
//   · não há migração no dia em que uma conquista mudar de critério;
//   · e o marco NUNCA diverge do número que a outra tela mostra, porque é o
//     mesmo número, lido do mesmo lugar.
//
// O contraste com o resto do Cosmic Guide é o argumento inteiro: o álbum e as
// missões de lá gravam estado e por isso precisam de fila, lock, janela de
// idempotência e reparo de índice. Isto aqui é uma função pura sobre um objeto,
// e por isso não precisa de nada.
//
// POR ISSO `calcularConquistas` RECEBE O ESTADO em vez de ir buscá-lo. Quem
// monta o retrato é a tela (com `resumenHilo()`, o resumo do álbum e o do
// ritual), e assim este arquivo não importa nem depende de módulo nenhum que
// grave — nem sequer existe a tentação de ele começar a gravar.
//
// ===========================================================================
// AS REGRAS QUE UMA CONQUISTA NÃO PODE QUEBRAR
// ===========================================================================
//  1. TODO NÚMERO É MEDIDO NESTE APARELHO. Nenhuma conquista é "87% das
//     usuárias", nenhuma compara com outra pessoa e nenhuma vem de fora deste
//     telefone. Não há prova social e não há contador de gente.
//  2. NENHUMA PUNE. Não existe conquista que se perde, não existe barra que
//     regride e não existe "você deixou de". A conquista de FALTAR é justamente
//     a que celebra a VOLTA — ver `a-volta`, abaixo, que é a peça mais
//     importante deste arquivo.
//  3. NÃO SE MOSTRA O QUE FALTA. Este módulo devolve `lograda: true|false` e
//     mais nada: nenhum "faltam 12 cartas", nenhuma porcentagem, nenhum
//     contador regressivo. Retrospectiva é rito, não cobrança — e conquista
//     trancada com dívida na cara é a mesma cobrança em outra roupa.
//  4. NENHUMA PROMETE DESFECHO. Nenhum texto de conquista fala do que a outra
//     pessoa vai fazer. Elas descrevem o que ESTA pessoa fez, no passado.
//  5. NENHUMA STRING MORA AQUI. Cada conquista carrega duas CHAVES de
//     datos/textos.js. É a conta que o brindes.js do Cosmic Guide já pagou:
//     título e descrição escritos dentro do módulo, vazando para quem lia o app
//     em outro idioma.
//  6. RECOMPENSA QUE NÃO EXISTE NÃO ENTRA. Nenhuma destas doze paga ficha,
//     desconto ou brinde: conquista aqui é uma marca e uma linha de texto, e é
//     tudo o que ela promete ser.
//
// ===========================================================================
// POR QUE NÃO HÁ CONQUISTA DE MISSÃO
// ===========================================================================
// O retrato aceita um campo `misiones` (o app pode vir a ter missões), mas
// nenhuma das doze depende dele — de propósito. O lib/missions.js do Cosmic
// Guide registra o desfecho de ter feito o contrário: duas missões ficaram
// IMPOSSÍVEIS de completar porque verificavam uma ação que nenhuma tela
// gravava. Conquista amarrada a coisa que ainda não existe é conquista morta na
// lista, e conquista morta ensina a pessoa a não olhar mais para a lista. No dia
// em que houver missões com registro de verdade, entra a décima terceira — e não
// antes.
//
// ===========================================================================
// O DENOMINADOR DO BARALHO (a única fragilidade deste arquivo, escrita na cara)
// ===========================================================================
// `meio-baralho` e `baralho-inteiro` usam o tamanho do PRÓPRIO baralho
// (lib/mazo.js), nunca um 78 escrito à mão — mesma regra que o álbum do Cosmic
// Guide segue ao derivar os grupos do deck em vez de manter uma lista paralela
// que diverge.
//
// O PREÇO DISSO: como o módulo não guarda estado, uma conquista é recalculada a
// cada abertura. Se o baralho um dia CRESCER, quem já tinha "o baralho inteiro"
// veria a marca sumir — exatamente a regressão que a doutrina proíbe. A regra que
// fecha esse buraco não é código, é decisão: o baralho não cresce depois do
// lançamento. Se algum dia crescer, estas duas conquistas precisam de um
// carimbo persistido do momento em que foram feitas — e é o momento em que este
// arquivo deixa de ser 100% leitura, com tudo o que isso arrasta junto.
// ===========================================================================

import { MAZO } from './mazo.js';

// Extensão explícita no import: o Metro do Expo resolve com ou sem ela, mas o
// `node --test` do `npm test` roda ESM de verdade e recusa caminho relativo sem
// extensão. Com '.js' o mesmo arquivo carrega nos dois.

/** Quantas cartas o baralho tem HOJE. Ver "O DENOMINADOR DO BARALHO". */
export const CARTAS_DEL_MAZO = MAZO.length;

/* =================================================================================
 * O RETRATO — e por que ele é exatamente o que os outros motores já devolvem
 *
 * O objeto que `calcularConquistas` recebe. Todos os campos são opcionais: um
 * retrato pela metade (o álbum ainda não montado, o ritual nem começado) devolve
 * as conquistas daquele pedaço como não feitas, em vez de quebrar a tela.
 *
 *   const albumEstado = await leerAlbum();
 *   calcularConquistas({
 *     hilo:     await resumenHilo(),                                  // lib/hilo.js
 *     album:    { ...resumenAlbum(albumEstado), cartas: albumEstado.cartas },
 *     ritual:   await resumenRitual(),                                // lib/ritual.js
 *     misiones: await estadoMissoes(),                                // lib/missoes.js
 *   });
 *
 * Os nomes dos campos são os NOMES QUE AQUELES MÓDULOS JÁ USAM — `encontradas` e
 * `grupos` do resumenAlbum, `diasHechos` e `completo` do resumenRitual, `record`
 * e `total` do hilo. Isso não é preguiça de nomenclatura: uma camada de tradução
 * entre os motores e este arquivo seria mais um lugar onde um campo renomeado lá
 * vira conquista silenciosamente sempre-falsa aqui, e conquista que nunca acende
 * é indistinguível de conquista difícil.
 *
 * `album.cartas` é o mapa cru do álbum ({ id: { veces, invertidas, ... } }), e é
 * de onde saem as duas coisas que o resumo do álbum não calcula: quantas cartas
 * já vieram invertidas e quantas vezes a carta mais repetida voltou. Sem ele,
 * essas duas conquistas ficam em false — e não quebram.
 * ================================================================================= */

function enteroSeguro(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function objeto(v) {
  return v && typeof v === 'object' ? v : {};
}

// Quantas cartas do álbum já apareceram ao menos uma vez INVERTIDAS, e quantas
// vezes a carta mais repetida voltou. Uma passada só sobre o mapa cru: são dois
// números que ninguém mais calcula, e calcular aqui é mais barato que pedir ao
// álbum um resumo maior do que a tela dele precisa.
function delMapaDeCartas(cartas) {
  let invertidas = 0;
  let repeticionMaxima = 0;
  for (const id of Object.keys(cartas)) {
    const c = objeto(cartas[id]);
    if (enteroSeguro(c.invertidas) >= 1) invertidas += 1;
    const veces = enteroSeguro(c.veces);
    if (veces > repeticionMaxima) repeticionMaxima = veces;
  }
  return { invertidas, repeticionMaxima };
}

/**
 * Achata o retrato num objeto raso de números, no mesmo espírito do collectData
 * do Cosmic Guide: cada conquista é um `check(d)` puro sobre ESTE objeto, e
 * nenhuma delas volta a navegar a árvore de entrada. Isso mantém as doze
 * regras legíveis numa linha cada e impede que uma delas leia um campo que as
 * outras onze não conhecem.
 *
 * Exportada para os testes conseguirem provar a normalização (retrato vazio,
 * campos negativos, número em string) sem passar pelas doze regras.
 */
export function _retrato(estado) {
  const e = objeto(estado);
  const hilo = objeto(e.hilo);
  const album = objeto(e.album);
  const ritual = objeto(e.ritual);
  const misiones = objeto(e.misiones);

  const cartas = objeto(album.cartas);
  const doMapa = delMapaDeCartas(cartas);
  const grupos = Array.isArray(album.grupos) ? album.grupos : [];

  return {
    // Fio — lib/hilo.js (leerHilo ou resumenHilo)
    nudosTotal: enteroSeguro(hilo.total),
    nudosRecord: enteroSeguro(hilo.record),
    nudosActual: enteroSeguro(hilo.actual),

    // Álbum — lib/album.js (resumenAlbum + o mapa cru de leerAlbum)
    // `encontradas` é o nome do resumenAlbum; `vistas` fica aceito para quem
    // monta o retrato à mão (os testes).
    cartasVistas: enteroSeguro(album.encontradas) || enteroSeguro(album.vistas),
    cartasTotal: enteroSeguro(album.total) || CARTAS_DEL_MAZO,
    // Quem conta grupo fechado é o álbum, que deriva os grupos do próprio
    // baralho. Aqui só se contam os que ele marcou `completo` — duplicar a regra
    // de agrupamento seria a lista paralela que o Cosmic Guide evitou de
    // propósito.
    gruposCerrados:
      enteroSeguro(album.gruposCerrados) || grupos.filter((g) => objeto(g).completo === true).length,
    cartasInvertidas: enteroSeguro(album.invertidas) || doMapa.invertidas,
    repeticionMaxima: enteroSeguro(album.repeticionMaxima) || doMapa.repeticionMaxima,

    // Ritual — lib/ritual.js (resumenRitual). `dias` fica aceito para o retrato
    // montado à mão.
    ritualDias: enteroSeguro(ritual.diasHechos) || enteroSeguro(ritual.dias),
    ritualCompleto: ritual.completo === true,

    // Aceito e hoje não usado. Ver "POR QUE NÃO HÁ CONQUISTA DE MISSÃO".
    misionesCumplidas: enteroSeguro(misiones.feitas) || enteroSeguro(misiones.cumplidas),
  };
}

/* =================================================================================
 * AS DOZE
 *
 * Campos de cada uma:
 *   id           — chave técnica. Vai para a `key` da lista e pode acabar num
 *                  log; não é texto de tela e não se traduz.
 *   grupo        — 'fio' | 'baralho' | 'ritual'. Só para a tela agrupar; nenhuma
 *                  regra depende disto.
 *   claveTitulo  — chave de datos/textos.js com o nome da conquista
 *   claveTexto   — chave de datos/textos.js com a linha que explica o que foi
 *                  feito, sempre no passado e sempre sobre ESTA pessoa
 *   check(d)     — função PURA sobre o retrato achatado. Sem disco, sem Date,
 *                  sem aleatório: o mesmo retrato dá sempre a mesma resposta, e
 *                  é isso que torna o teste possível.
 *
 * A ordem do array é a ordem da tela. Ela sobe do que quase todo mundo faz para
 * o que quase ninguém faz — e não é ranking: é só o caminho.
 * ================================================================================= */

export const CONQUISTAS = Object.freeze(
  [
    {
      id: 'primeira-leitura',
      grupo: 'fio',
      claveTitulo: 'conquistas.primeira-leitura.titulo',
      claveTexto: 'conquistas.primeira-leitura.texto',
      check: (d) => d.nudosTotal >= 1,
    },
    {
      id: 'tres-nos',
      grupo: 'fio',
      claveTitulo: 'conquistas.tres-nos.titulo',
      claveTexto: 'conquistas.tres-nos.texto',
      // Recorde, não sequência corrente: uma conquista que dependesse do
      // `actual` DESAPARECERIA no dia seguinte a uma falta. Marca não se perde.
      check: (d) => d.nudosRecord >= 3,
    },
    {
      id: 'sete-nos',
      grupo: 'fio',
      claveTitulo: 'conquistas.sete-nos.titulo',
      claveTexto: 'conquistas.sete-nos.texto',
      check: (d) => d.nudosRecord >= 7,
    },
    {
      id: 'trinta-nos',
      grupo: 'fio',
      claveTitulo: 'conquistas.trinta-nos.titulo',
      claveTexto: 'conquistas.trinta-nos.texto',
      check: (d) => d.nudosRecord >= 30,
    },
    {
      id: 'a-volta',
      grupo: 'fio',
      claveTitulo: 'conquistas.a-volta.titulo',
      claveTexto: 'conquistas.a-volta.texto',
      // A PEÇA IMPORTANTE DESTE ARQUIVO.
      //
      // Como se mede "faltou e voltou" sem guardar nada e sem nunca ter marcado
      // a falta: `total > record`. O total conta os dias em que ela veio; o
      // recorde conta a maior fileira SEGUIDA. Um total maior que o recorde só é
      // possível se houve pelo menos duas fileiras — ou seja, um buraco no meio
      // E dias depois dele. A volta é a única coisa que este número prova, e é
      // exatamente a que se quer celebrar.
      //
      // Repare no que NÃO existe por causa disso: nenhum registro de falta,
      // nenhum contador de dias perdidos, nenhum lugar onde a ausência dela
      // fique escrita. O app sabe que ela voltou sem nunca ter anotado que ela
      // faltou. É a diferença entre acompanhar e cobrar.
      check: (d) => d.nudosTotal > d.nudosRecord,
    },
    {
      id: 'primeira-invertida',
      grupo: 'baralho',
      claveTitulo: 'conquistas.primeira-invertida.titulo',
      claveTexto: 'conquistas.primeira-invertida.texto',
      check: (d) => d.cartasInvertidas >= 1,
    },
    {
      id: 'dez-cartas',
      grupo: 'baralho',
      claveTitulo: 'conquistas.dez-cartas.titulo',
      claveTexto: 'conquistas.dez-cartas.texto',
      check: (d) => d.cartasVistas >= 10,
    },
    {
      id: 'um-grupo',
      grupo: 'baralho',
      claveTitulo: 'conquistas.um-grupo.titulo',
      claveTexto: 'conquistas.um-grupo.texto',
      // Um grupo = os 22 Maiores, ou um dos quatro naipes. Quem decide o que é
      // grupo é lib/album.js, que os deriva do próprio baralho.
      check: (d) => d.gruposCerrados >= 1,
    },
    {
      id: 'carta-que-volta',
      grupo: 'baralho',
      claveTitulo: 'conquistas.carta-que-volta.titulo',
      claveTexto: 'conquistas.carta-que-volta.texto',
      // Só existe porque o modelo de encontro do álbum guarda `veces`. É uma
      // constatação sobre o baralho dela, nunca um presságio: a carta que
      // voltou três vezes não "está dizendo" nada.
      check: (d) => d.repeticionMaxima >= 3,
    },
    {
      id: 'meio-baralho',
      grupo: 'baralho',
      claveTitulo: 'conquistas.meio-baralho.titulo',
      claveTexto: 'conquistas.meio-baralho.texto',
      // ceil: com baralho ímpar, "metade" é a metade de cima. Nunca se arredonda
      // para baixo um marco — dar a marca antes da hora é o mesmo tipo de mentira
      // que o álbum inflado com carta de brinde.
      check: (d) => d.cartasTotal > 0 && d.cartasVistas >= Math.ceil(d.cartasTotal / 2),
    },
    {
      id: 'baralho-inteiro',
      grupo: 'baralho',
      claveTitulo: 'conquistas.baralho-inteiro.titulo',
      claveTexto: 'conquistas.baralho-inteiro.texto',
      check: (d) => d.cartasTotal > 0 && d.cartasVistas >= d.cartasTotal,
    },
    {
      id: 'ritual-completo',
      grupo: 'ritual',
      claveTitulo: 'conquistas.ritual-completo.titulo',
      claveTexto: 'conquistas.ritual-completo.texto',
      // Duas portas para o mesmo fato: o motor do ritual pode declarar
      // `completo`, e se não declarar, sete dias fechados são sete dias
      // fechados. datos/ritual.js exporta DURACION = 7; usar o número dele aqui
      // acoplaria os dois módulos por um dado que não muda.
      check: (d) => d.ritualCompleto || d.ritualDias >= 7,
    },
  ].map((c) => Object.freeze(c))
);

/**
 * Todas as chaves de datos/textos.js que este módulo aponta, incluindo o cromo
 * da tela. Existe pelo mesmo motivo que CLAVES_TEXTO_MISSOES em lib/missoes.js:
 * dá ao teste uma lista fechada para varrer com `existe(clave)` e para passar as
 * guardas de lib/lectura.js por cima de toda a copy de conquista.
 *
 * Chave que aponta para nada não quebra o app (t() devolve a própria chave), e é
 * exatamente por isso que ela precisa de um teste — senão vira o nome cru na
 * tela de quem baixou, e não na de quem escreveu.
 */
export const CLAVES_TEXTO_CONQUISTAS = Object.freeze([
  'conquistas.titulo',
  'conquistas.sub',
  'conquistas.pendente',
  'conquistas.pie',
  ...CONQUISTAS.flatMap((c) => [c.claveTitulo, c.claveTexto]),
]);

/**
 * O estado das doze, para o retrato dado. Função PURA: não abre disco, não
 * chama Date e não sorteia nada.
 *
 * Devolve `lograda` e mais nada sobre o que falta — de propósito. Uma conquista
 * ainda não feita aparece na lista pelo título, sem contador regressivo e sem
 * porcentagem: a tela convida, não cobra.
 *
 * @param {object} [estado] o retrato; ver "O RETRATO", acima. Aceita vazio.
 * @returns {Array<{id: string, grupo: string, claveTitulo: string,
 *   claveTexto: string, lograda: boolean}>} na ordem de CONQUISTAS
 */
export function calcularConquistas(estado) {
  const d = _retrato(estado);
  return CONQUISTAS.map((c) => ({
    id: c.id,
    grupo: c.grupo,
    claveTitulo: c.claveTitulo,
    claveTexto: c.claveTexto,
    lograda: c.check(d) === true,
  }));
}

export default { CONQUISTAS, calcularConquistas };
