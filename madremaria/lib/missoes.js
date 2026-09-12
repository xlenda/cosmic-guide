// lib/missoes.js
// AS TRÊS DE HOJE — as missões do dia do Fio Vermelho.
// Interface e comentários em português do Brasil (o app está virando português;
// ver docs/TRADUCAO.md).
//
// ===========================================================================
// POR QUE O SORTEIO É DETERMINÍSTICO, E POR QUE ISSO É O CORAÇÃO DO MÓDULO
// ===========================================================================
// As três missões saem de um hash da DATA LOCAL. Não há `Math.random`, não há
// rede, não há servidor e não há estado guardado do sorteio: `missoesDeHoje()`
// é uma função pura de uma string 'YYYY-MM-DD'.
//
// Três consequências práticas, e cada uma delas é o motivo de fazer assim:
//   1. Todo aparelho vê as MESMAS três missões no mesmo dia. Isso é o que
//      permite falar delas fora do app — no anúncio, no story, no grupo — sem
//      inventar nada e sem backend para sincronizar.
//   2. Elas viram sozinhas à meia-noite local. Nenhum agendamento, nenhum job,
//      nenhuma escrita no disco na virada: o dia mudou, o hash mudou.
//   3. O sorteio é reprodutível no teste sem mexer no relógio da máquina —
//      basta passar o dia.
//
// Dia LOCAL, nunca UTC, com ano de 4 dígitos: a mesma convenção duplicada de
// propósito em lib/hilo.js e lib/limiteDiario.js. Quem lê às 22h está no dia
// dela; `toISOString()` daria o dia de Londres e criaria buracos que a pessoa
// jura não ter tido.
//
// ===========================================================================
// A REGRA DURA (ela vale mais que qualquer linha de código aqui)
// ===========================================================================
//   · NENHUMA missão pede contato com quem está do outro lado. Nem uma. Não
//     existe "mande uma mensagem", não existe "dê o primeiro passo", não
//     existe missão que dependa de outra pessoa responder. Missão que depende
//     de terceiro pode "falhar" — e missão que falha vira culpa, que é
//     exatamente o que o produto inteiro se recusa a vender.
//   · NENHUMA missão cobra constância. Não há "não perca hoje", não há "você
//     faltou ontem", não há série de missões, não há barra que regride. A
//     missão CONVIDA: título no imperativo gentil, pista dizendo o que ela é.
//     Dia sem missão feita não deixa rastro nenhum — o estado do dia anterior
//     simplesmente não é lido.
//   · NENHUM PRÊMIO. Não há moeda, não há loja, não há bônus por fechar as
//     três. Fechar as três devolve `todasFeitas: true` e a tela escreve uma
//     linha; nada mais é entregue porque nada mais existe implementado, e a
//     regra herdada do Cosmic Guide é dura: recompensa que não existe não
//     entra no catálogo. Sem moeda também não há teto diário para calibrar,
//     nem farm de relógio para fechar, nem extrato para auditar — três
//     módulos que simplesmente não precisam nascer.
//
// O portão dessas regras não mora aqui: mora no teste, varrendo
// CLAVES_TEXTO_MISSOES com `sugiereContacto()` de lib/lectura.js — o mesmo
// varredor que protege o baralho e o ritual. Copy de missão é copy como
// qualquer outra.
//
// ===========================================================================
// A EVIDÊNCIA: QUEM CHAMA `completarMissao`
// ===========================================================================
// O missions.js do Cosmic Guide registra um bug que custou caro: duas missões
// ficaram IMPOSSÍVEIS de completar porque verificavam uma ação que nenhuma
// tela gravava. A regra que sai disso, e que este catálogo obedece:
//
//   NENHUMA missão entra ativa sem uma tela que possa prová-la HOJE.
//
// Por isso cada entrada carrega DOIS campos, e o segundo nasceu de uma auditoria
// que encontrou aqui exatamente o bug de lá:
//   `prova`        — em texto, quem chama `completarMissao(id)` e em que momento;
//   `archivoProva` — o caminho DESSE arquivo, em formato que o teste consegue
//                    abrir.
//
// O texto sozinho não segurou nada. Em 31/08 este catálogo tinha OITO missões
// ativas e UMA tela chamando `completarMissao` (a HiloScreen, 'olhar-o-fio'):
// sete das oito eram impossíveis, o sorteio é 1+1+1 por grupo, e em dois dias de
// cada três NENHUMA das três do dia podia fechar. A tela mostrava "0 de 3" para
// sempre — número que mente, com uma lista de tarefas em cima dele. Cada `prova`
// estava escrito e nenhum era verdade, porque comentário não é executável.
//
// `archivoProva` é: o portão em test/gamificacao.test.js abre o arquivo de cada
// missão ATIVA e exige encontrar, no fonte, o id da missão e `completarMissao`.
// Missão ativa que ninguém marca deixa o teste vermelho antes do commit sair da
// máquina — que é o único lugar onde essa regra podia morar. E é por
// isso que "reler a leitura de ontem" NÃO está aqui: lib/ultimaLectura.js só
// devolve a leitura quando `registro.dia === hoje`, então a de ontem não
// existe mais no disco e a missão seria impossível no dia 1. No lugar dela
// entrou "voltar à leitura de hoje", que é exatamente o que aquele módulo faz.
//
// A entrada `carta-nova-no-album` nasce com `activa: false` pelo mesmo motivo.
// O que ainda falta para virar a chave está escrito na própria entrada.
// Missão inativa NUNCA é sorteada e nunca aparece na tela, nem como "em breve".
//
// E O CAMPO `prova` SÓ VALE SE ALGUÉM CONFERIR. Três entradas deste catálogo
// nasceram com uma `prova` escrita que NENHUMA tela cumpria — o texto descrevia
// uma tela que não chamava `completarMissao`, uma caixa que não abre e um
// componente que não distingue raspar de tocar. O efeito era a punição mais
// muda possível: as três de hoje ficavam pendentes para sempre, o contador
// dizia "0 de 3" todo dia, e nada no app explicava por quê. Regra que sai
// disso, e ela é de auditoria, não de escrita:
//
//   PROVA É AFIRMAÇÃO VERIFICÁVEL. `grep -rn "completarMissao" screens/` tem de
//   devolver, para cada entrada ativa, a tela que a `prova` dela nomeia.
//
// ===========================================================================
// ATENÇÃO A QUEM FOR PLUGAR UMA TELA: EXISTE UM SEGUNDO MÓDULO DE MISSÕES
// ===========================================================================
// lib/misiones.js foi escrito em paralelo com outra arquitetura: interface em
// espanhol, ZERO disco, e as missões DERIVADAS do que lib/hilo.js e
// lib/album.js já gravaram (`misionesDelDia` + `evaluarMisiones`), com grupos
// rito/album/fio. Aqui a arquitetura é a oposta: a tela que prova a ação chama
// `completarMissao`, e o dia fica marcado numa chave própria.
//
// OS DOIS NÃO PODEM VIVER NO APP AO MESMO TEMPO — duas listas de "as três de
// hoje" discordando entre si é pior que qualquer uma delas sozinha. Antes de
// ligar qualquer tela, escolher UM:
//   · o derivado (lib/misiones.js) só consegue verificar o que já está no
//     disco por outro motivo: fio e álbum. Nada de "raspou sem pular", "leu até
//     o fim" ou "abriu o Método" — essas ações ninguém grava.
//   · este aqui cobre essas ações, ao preço de uma chave de storage e de uma
//     linha em cada tela que prova a ação.
// O que NÃO se faz é manter os dois e deixar a decisão para o dia do deploy.
//
// ===========================================================================
// DISCO
// ===========================================================================
// UMA chave NUA: 'missoes' (o prefixo 'hr.' é assunto do lib/almacen.js e
// ninguém o escreve à mão), guardando { dia, feitas: [id] }.
//
// TETO DE CRESCIMENTO, declarado antes de escrever: a gravação só guarda os
// ids do sorteio DAQUELE dia, então o registro tem no máximo três ids e uma
// data — ele não cresce nunca, em nenhum cenário. Id que não está mais no
// catálogo é filtrado na LEITURA e na ESCRITA, então storage sujo de uma
// versão anterior não vira contagem inflada.
//
// A chave 'missoes' está em CLAVES_HILO_ROJO (screens/AjustesScreen.js). Sem
// isso ela sobreviveria ao "Apagar tudo" e a política de privacidade viraria
// declaração falsa numa ficha de loja.

import { guardarSeguro, leerSeguro } from './almacen.js';

const CLAVE = 'missoes';

/** A chave nua deste módulo. Importe daqui em vez de digitar 'missoes' na mão. */
export const CLAVE_MISSOES = CLAVE;

/** Quantas missões um dia tem. Uma por grupo, e os grupos são três. */
export const MISSOES_POR_DIA = 3;

/**
 * Os grupos, na ordem em que a tela lista.
 *
 * A composição 1+1+1 não é estética: ela garante que todo dia tem uma missão
 * da LEITURA (o centro do app, que qualquer pessoa consegue fazer), uma de
 * PRESENÇA (voltar ao que já é dela: o ritual, a leitura de hoje, o fio, as
 * respostas) e uma de DESCOBERTA (o método, os limites, o baralho). Sem isso o
 * sorteio poderia dar três missões do mesmo canto e o dia ficaria torto.
 */
export const GRUPOS = Object.freeze(['leitura', 'presenca', 'descoberta']);

/* =================================================================================
 * DIA LOCAL — a mesma convenção de lib/hilo.js e lib/limiteDiario.js, duplicada
 * de propósito: são motores independentes e nenhum deve quebrar porque o outro
 * mudou. São dez linhas triviais.
 * ================================================================================= */

function hojeLocal() {
  const d = new Date();
  const pad = (n, largo = 2) => String(n).padStart(largo, '0');
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ehDiaValido(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [ano, mes, dd] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(ano, mes - 1, dd));
  // Round-trip: mata '2026-02-31' e '2026-13-01', que passam no regex.
  return t.getUTCFullYear() === ano && t.getUTCMonth() === mes - 1 && t.getUTCDate() === dd;
}

/**
 * O dia que vale.
 *
 * Assimétrico de propósito, como em lib/limiteDiario.js:
 *   guardado < hoje  → vence HOJE. Dia novo, três missões novas, e o dia
 *                      anterior não deixa rastro (não existe "você faltou").
 *   guardado > hoje  → vence O GUARDADO. Só existe registro no futuro se o
 *                      relógio foi adiantado e voltou; nesse caso a pessoa
 *                      continua com o conjunto que estava fazendo, em vez de
 *                      ver o mesmo dia recomeçar do zero a cada flip.
 *
 * Aqui isso NÃO é anti-farm — não há prêmio para farmar, e por isso nada é
 * tirado de ninguém: quem cruzou fuso continua com três missões de um dia, só
 * que as do dia guardado. É coerência de virada de dia, e ela é a mesma do
 * limite diário para que os dois motores não discordem sobre que dia é hoje.
 * No dia em que missão pagar QUALQUER coisa, esta função e o teto diário do
 * missions.js original voltam a ser defesa de verdade — e entram juntos.
 *
 * Exportada só para os testes exercitarem a virada sem mexer no relógio.
 */
export function _diaEfetivo(guardado, hoje) {
  const dia = ehDiaValido(hoje) ? hoje : hojeLocal();
  if (!ehDiaValido(guardado)) return dia;
  // Ambos são YYYY-MM-DD com ano padronizado: comparação de string é
  // comparação de calendário.
  return guardado > dia ? guardado : dia;
}

/* =================================================================================
 * O CATÁLOGO
 *
 * Dez entradas, três grupos, e o sorteio do dia pega uma de cada. Cada uma
 * declara:
 *   id          — chave técnica, sem acento. É o que vai para o disco.
 *   grupo       — 'leitura' | 'presenca' | 'descoberta'.
 *   claveTitulo — chave de datos/textos.js com o convite (imperativo gentil).
 *   clavePista  — chave de datos/textos.js dizendo o que fecha a missão.
 *   prova       — EM TEXTO, quem chama completarMissao() e quando. É o campo
 *                 que impede missão impossível de entrar na lista.
 *   archivoProva— o MESMO fato em caminho de arquivo, para o teste conseguir
 *                 abrir. Obrigatório em toda missão ativa; null nas desligadas,
 *                 que por definição não têm tela. Ver o cabeçalho: o `prova` em
 *                 prosa esteve certo e mentiroso ao mesmo tempo por sete
 *                 entradas de uma vez, porque comentário não roda.
 *   activa      — false só enquanto a prova não existir no app. Missão inativa
 *                 não é sorteada e não aparece em lugar nenhum.
 *
 * NENHUMA string de tela aqui: título e pista moram em datos/textos.js. O
 * brindes.js do Cosmic Guide já pagou essa conta — title e description moravam
 * dentro do módulo, em português puro, e vazavam para quem usava o app em
 * outro idioma.
 * ================================================================================= */

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

export /* CATALOGO SEM TIRAGEM — 01/09: 'leitura-do-dia', 'raspar-sem-pular' e
 * 'carta-nova-no-album' foram REMOVIDAS junto com a TiradaScreen e o album
 * (decisao do dono: nenhuma carta dentro do app alem da leitura dela).
 * Sortear uma missao que manda raspar o que nao existe seria a tela dando
 * ordem impossivel. */
const CATALOGO = congelar([
  /* --- LEITURA — o centro do app. Sempre há uma destas no dia. -------------- */
  {
    id: 'ler-ate-o-fim',
    grupo: 'leitura',
    claveTitulo: 'missoes.ler-ate-o-fim.titulo',
    clavePista: 'missoes.ler-ate-o-fim.pista',
    prova: 'SintesisScreen, quando o scroll da síntese chega ao fim.',
    archivoProva: 'screens/SintesisScreen.js',
    activa: true,
  },

  /* --- PRESENÇA — voltar ao que já é dela. Nada aqui empurra para fora. ------ */
  {
    id: 'resposta-do-ritual',
    grupo: 'presenca',
    claveTitulo: 'missoes.resposta-do-ritual.titulo',
    clavePista: 'missoes.resposta-do-ritual.pista',
    prova: 'A tela do ritual, quando o dia de hoje é concluído com a nota escrita (lib/ritual.js).',
    archivoProva: null,
    // DESLIGADA, e pelo MESMO motivo de `carta-nova-no-album` logo abaixo: esta
    // missão é estruturalmente impossível em dias que a pessoa não escolheu, e
    // sortear missão que ela não pode fechar é cobrança disfarçada.
    //
    // Três estados em que ela nasce fechada, e nenhum depende de fiação:
    //   1. o passo do ritual de hoje JÁ foi dado. A trava de um-passo-por-dia é
    //      o que dá valor ao formato (lib/ritual.js), então quem cumpriu o
    //      ritual cedo encontra, mais tarde, uma missão que o próprio app
    //      proíbe de completar;
    //   2. o ritual TERMINOU. Depois do sétimo dia não há dia a concluir, e a
    //      missão passa a ser impossível para sempre — justamente para quem fez
    //      a trilha inteira;
    //   3. a nota é OPCIONAL por decisão de produto ('ritual.campo.nota': "Escrever
    //      é opcional"), e esta prova exige a nota escrita. A missão transforma
    //      em requisito o que a tela do ritual promete não cobrar.
    // O sorteio é uma função pura da data, sem acesso ao disco (é o que faz todo
    // aparelho ver as mesmas três), então não há como tirá-la do sorteio nos dias
    // em que ela não cabe. Ligar isto exige antes ou uma missão de PRESENÇA que o
    // ritual sempre possa fechar (abrir e ler o dia de hoje, que não depende da
    // trava), ou um sorteio que conheça o estado — e aí some a propriedade que
    // fez o sorteio ser assim. Enquanto for false, não é sorteada nem exibida.
    activa: false,
  },
  {
    id: 'voltar-a-leitura',
    grupo: 'presenca',
    claveTitulo: 'missoes.voltar-a-leitura.titulo',
    clavePista: 'missoes.voltar-a-leitura.pista',
    // "Reler a de ONTEM" seria impossível: lib/ultimaLectura.js só restaura a
    // leitura quando o registro é do dia corrente. Esta é a missão que aquele
    // módulo realmente sustenta.
    prova: 'SintesisScreen, na segunda abertura do dia — leitura restaurada por lib/ultimaLectura.js.',
    archivoProva: 'screens/SintesisScreen.js',
    activa: true,
  },
  {
    id: 'olhar-o-fio',
    grupo: 'presenca',
    claveTitulo: 'missoes.olhar-o-fio.titulo',
    clavePista: 'missoes.olhar-o-fio.pista',
    // Só olhar. Nenhuma meta de nós, nenhuma cobrança de sequência: o fio é
    // constatação, e lib/hilo.js existe justamente para que ele nunca puna.
    prova: 'HiloScreen, na abertura.',
    archivoProva: 'screens/HiloScreen.js',
    activa: true,
  },
  {
    id: 'reler-suas-respostas',
    grupo: 'presenca',
    claveTitulo: 'missoes.reler-suas-respostas.titulo',
    clavePista: 'missoes.reler-suas-respostas.pista',
    prova: 'PerfilScreen, na abertura da ficha com as respostas do início.',
    archivoProva: 'screens/PerfilScreen.js',
    activa: true,
  },

  /* --- DESCOBERTA — de onde a leitura sai, e o que ela não pode dizer. ------- */
  {
    id: 'fonte-de-uma-carta',
    grupo: 'descoberta',
    claveTitulo: 'missoes.fonte-de-uma-carta.titulo',
    clavePista: 'missoes.fonte-de-uma-carta.pista',
    // A prova ANTERIOR ("quando a fonte de uma carta é aberta") descrevia uma
    // interação que a MetodoScreen não tem: a fonte é a seção 03, um parágrafo
    // fixo, e não há carta a escolher nem nada a abrir. Missão impossível pela
    // mesma porta de sempre — verificar uma ação que nenhuma tela grava. A prova
    // agora é o que a tela realmente sabe: ela foi aberta.
    prova: 'MetodoScreen, na abertura — é a tela que declara a obra de onde sai cada texto.',
    archivoProva: 'screens/MetodoScreen.js',
    activa: true,
  },
  {
    id: 'o-que-nao-diz',
    grupo: 'descoberta',
    claveTitulo: 'missoes.o-que-nao-diz.titulo',
    clavePista: 'missoes.o-que-nao-diz.pista',
    // A prova ANTERIOR ("quando a caixa é aberta até o fim") supunha uma caixa
    // que abre e fecha; components/CajaLimites.js não tem estado nenhum — ela
    // desenha o conteúdo inteiro sempre. O que a tela SABE é a rolagem, e a
    // caixa é a última seção antes do fecho: chegar ao fim da MetodoScreen é
    // ter passado por ela inteira. É a mesma medida de fim de leitura que a
    // SintesisScreen já usa.
    prova: 'MetodoScreen, quando a rolagem chega ao fim — CajaLimites é a última seção.',
    archivoProva: 'screens/MetodoScreen.js',
    activa: true,
  },
]);

const POR_ID = new Map(CATALOGO.map((m) => [m.id, m]));
const IDS_VALIDOS = new Set(CATALOGO.map((m) => m.id));

/**
 * TODAS as chaves de datos/textos.js que a tela de missões precisa, achatadas.
 * Existe pelo mesmo motivo de CLAVES_TEXTO_RITUAL em lib/ritual.js: chave morta
 * vira texto cru na tela, e é aqui que o teste varre `existe(clave)` e passa
 * `sugiereContacto()` em cima de toda a copy de missão numa linha só.
 */
export const CLAVES_TEXTO_MISSOES = Object.freeze([
  'missoes.titulo',
  'missoes.sub',
  'missoes.progresso',
  'missoes.feita',
  'missoes.todasFeitas',
  'missoes.pie',
  ...CATALOGO.flatMap((m) => [m.claveTitulo, m.clavePista]),
]);

/* =================================================================================
 * MOTIVOS — por que uma chamada não marcou nada.
 *
 * Devolvidos, nunca lançados (mesma escolha de lib/ritual.js): a tela precisa
 * do motivo para escrever a frase certa. Note que `jaFeita` NÃO é erro — vem
 * com `ok: true` e `novaFeita: false`, porque marcar duas vezes a mesma missão
 * é o caminho normal de uma tela que remonta.
 * ================================================================================= */
export const MOTIVOS = Object.freeze({
  naoSorteada: 'naoSorteada',
  jaFeita: 'jaFeita',
});

/* =================================================================================
 * O SORTEIO
 * ================================================================================= */

// Mesmo hash determinístico do missions.js do Cosmic Guide (e do lovePhrase).
// Barato, estável entre plataformas, e nenhum caminho deste módulo chama
// Math.random.
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Ranqueia por hash(dia|id) e desempata pelo id em ordem alfabética. O
// desempate importa: `Math.abs` colide, e sem ele duas datas diferentes
// poderiam devolver ordens diferentes para o mesmo empate dependendo da
// implementação do sort.
function ranquear(lista, dia) {
  return lista
    .map((m) => ({ m, rank: hash(`${dia}|${m.id}`) }))
    .sort((a, b) => a.rank - b.rank || (a.m.id < b.m.id ? -1 : 1))
    .map((x) => x.m);
}

/**
 * As três missões do dia. PURA: não lê disco, não escreve, não sabe o que já
 * foi feito — só a data decide.
 *
 * Uma por grupo, na ordem de GRUPOS. Se algum grupo ficar sem missão ativa (só
 * acontece se alguém desligar um grupo inteiro), o dia é completado com as
 * melhores ranqueadas do que sobrou, para que a tela nunca mostre menos de
 * três sem necessidade. Com menos de três missões ativas no catálogo inteiro,
 * devolve o que existe — nunca repete uma missão para encher.
 *
 * @param {string} [dia] dia YYYY-MM-DD; a tela não passa nada, os testes passam.
 * @returns {Array<{id: string, grupo: string, claveTitulo: string, clavePista: string,
 *   prova: string, activa: boolean}>} as entradas do catálogo, congeladas.
 */
export function missoesDeHoje(dia) {
  const d = ehDiaValido(dia) ? dia : hojeLocal();
  const ativas = CATALOGO.filter((m) => m.activa);

  const escolhidas = [];
  for (const grupo of GRUPOS) {
    const doGrupo = ranquear(ativas.filter((m) => m.grupo === grupo), d);
    if (doGrupo.length > 0) escolhidas.push(doGrupo[0]);
  }

  if (escolhidas.length < MISSOES_POR_DIA) {
    const jaEscolhidas = new Set(escolhidas.map((m) => m.id));
    for (const m of ranquear(ativas.filter((x) => !jaEscolhidas.has(x.id)), d)) {
      if (escolhidas.length >= MISSOES_POR_DIA) break;
      escolhidas.push(m);
    }
  }

  return escolhidas.slice(0, MISSOES_POR_DIA);
}

/* =================================================================================
 * DISCO
 * ================================================================================= */

const ESTADO_VAZIO = { dia: null, feitas: [] };

// Storage é entrada externa: pode vir editado no devtools, truncado ou de uma
// versão anterior. Nada aqui lança — ilegível vira "dia sem registro", e o pior
// que acontece é a pessoa poder marcar de novo uma missão que já tinha feito.
//
// O filtro por IDS_VALIDOS roda na LEITURA (e de novo na escrita): id que saiu
// do catálogo nunca vira contagem, e a lista nunca passa do tamanho do
// catálogo. Duplicata some no Set.
async function lerEstado() {
  const bruto = await leerSeguro(CLAVE);
  if (!bruto) return { ...ESTADO_VAZIO };
  try {
    const obj = JSON.parse(bruto);
    if (!obj || typeof obj !== 'object') return { ...ESTADO_VAZIO };
    const dia = ehDiaValido(obj.dia) ? obj.dia : null;
    if (!dia) return { ...ESTADO_VAZIO };
    const feitas = Array.isArray(obj.feitas)
      ? [...new Set(obj.feitas.filter((id) => IDS_VALIDOS.has(id)))]
      : [];
    return { dia, feitas };
  } catch {
    return { ...ESTADO_VAZIO };
  }
}

// As feitas que valem para este dia. Registro de OUTRO dia não conta — e é
// exatamente por isso que faltar não deixa rastro: o dia anterior não é lido,
// não é comparado e não é mostrado.
function feitasDoDia(estado, dia) {
  return estado.dia === dia ? estado.feitas : [];
}

// Monta o resumo que a tela consome. Uma função só, usada por estadoMissoes() e
// por completarMissao(), para que as duas nunca discordem sobre o mesmo dia.
function resumir(dia, feitas) {
  const marcadas = new Set(feitas);
  const missoes = missoesDeHoje(dia).map((m) => ({ ...m, feita: marcadas.has(m.id) }));
  const total = missoes.length;
  const quantasFeitas = missoes.filter((m) => m.feita).length;
  return {
    dia,
    missoes,
    total,
    feitas: quantasFeitas,
    todasFeitas: total > 0 && quantasFeitas === total,
  };
}

/* =================================================================================
 * FILA DE ESCRITA
 *
 * `completarMissao` lê, decide e grava. Sem fila, dois toques rápidos (ou duas
 * telas marcando missões diferentes no mesmo instante) leem o mesmo estado
 * "antes" e a segunda escrita apaga a primeira — a pessoa faz duas missões e
 * só uma aparece. Não há transação no AsyncStorage; a fila faz o papel dela
 * dentro do módulo.
 * ================================================================================= */
let fila = Promise.resolve();
function naFila(fn) {
  const corrida = fila.then(fn, fn);
  fila = corrida.then(
    () => {},
    () => {}
  );
  return corrida;
}

/* =================================================================================
 * API
 * ================================================================================= */

/**
 * O estado das três de hoje. Não escreve nada.
 *
 * @param {string} [dia] dia YYYY-MM-DD; só os testes passam isto.
 * @returns {Promise<{dia: string, missoes: Array, total: number, feitas: number,
 *   todasFeitas: boolean}>}
 *   dia         — o dia que valeu (pode ser um dia guardado no futuro; ver _diaEfetivo)
 *   missoes     — as três entradas do catálogo, cada uma com `feita: boolean`
 *   feitas      — quantas das três já foram marcadas hoje
 *   todasFeitas — as três fechadas. É só uma constatação: nada é pago por isso.
 */
export async function estadoMissoes(dia) {
  const estado = await lerEstado();
  const d = _diaEfetivo(estado.dia, dia);
  return resumir(d, feitasDoDia(estado, d));
}

/**
 * Marca uma missão de hoje como feita.
 *
 * Chamada pela tela que PROVA a ação, no momento em que ela acontece — ver o
 * campo `prova` de cada entrada do catálogo. Este módulo não verifica nada
 * sozinho de propósito: ele não conhece as telas, e inventar aqui um
 * verificador para uma evidência que ninguém grava é como nascem as missões
 * impossíveis.
 *
 * Idempotente: marcar dez vezes a mesma missão no mesmo dia marca uma vez. A
 * segunda chamada volta `ok: true` com `novaFeita: false` — remontar a tela ou
 * voltar e reabrir não é erro, e não pode virar mensagem de erro.
 *
 * Id que não está no sorteio de hoje (missão de ontem, missão inativa, typo)
 * não grava nada e volta `ok: false` com `motivo: 'naoSorteada'`.
 *
 * @param {string} id id da missão (do catálogo)
 * @param {string} [dia] dia YYYY-MM-DD; só os testes passam isto.
 * @returns {Promise<{ok: boolean, motivo: string|null, novaFeita: boolean,
 *   persistido: boolean, dia: string, missoes: Array, total: number,
 *   feitas: number, todasFeitas: boolean}>}
 *   persistido — foi ao disco de verdade. False quando não havia o que gravar E
 *                false quando o disco falhou (ver lib/almacen.js); quem precisa
 *                avisar "não deu pra gravar" cruza com `novaFeita`.
 */
export function completarMissao(id, dia) {
  return naFila(async () => {
    const estado = await lerEstado();
    const d = _diaEfetivo(estado.dia, dia);
    const feitas = feitasDoDia(estado, d);

    const doDia = missoesDeHoje(d);
    const missao = POR_ID.get(id);
    if (!missao || !doDia.some((m) => m.id === id)) {
      return {
        ok: false,
        motivo: MOTIVOS.naoSorteada,
        novaFeita: false,
        persistido: false,
        ...resumir(d, feitas),
      };
    }

    if (feitas.indexOf(id) !== -1) {
      return {
        ok: true,
        motivo: MOTIVOS.jaFeita,
        novaFeita: false,
        persistido: false,
        ...resumir(d, feitas),
      };
    }

    // Grava só os ids do sorteio DESTE dia, na ordem do sorteio: o registro
    // nunca passa de três ids, e id que sobrou de outro dia ou de outra versão
    // do catálogo morre aqui em vez de ficar no disco para sempre.
    const marcadas = new Set([...feitas, id]);
    const siguientes = doDia.filter((m) => marcadas.has(m.id)).map((m) => m.id);
    const persistido = await guardarSeguro(CLAVE, JSON.stringify({ dia: d, feitas: siguientes }));

    return {
      ok: true,
      motivo: null,
      novaFeita: true,
      persistido,
      ...resumir(d, siguientes),
    };
  });
}

export default {
  CLAVE_MISSOES,
  MISSOES_POR_DIA,
  GRUPOS,
  CATALOGO,
  CLAVES_TEXTO_MISSOES,
  MOTIVOS,
  missoesDeHoje,
  estadoMissoes,
  completarMissao,
};
