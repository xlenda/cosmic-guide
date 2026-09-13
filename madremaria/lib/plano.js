// lib/plano.js
// O PLANO DO DIA — o motor que cruza o ceu (quando existe) com um ritual
// rotativo e uma acao concreta.
//
// ===========================================================================
// A FORMA DO PLANO
// ===========================================================================
//   {
//     dia, diaSemana, nomeDiaSemana, regente,      <- aritmetica, sempre existe
//     ritual: { id, titulo, acao, porque, camera, encaixe },
//     reflexao, afirmacao,                          <- sempre existem
//     ceu: null | { disponivel: true, fase, linha, marco },
//     ceuMotivoTecnico: null | string,              <- log e teste, NUNCA a tela
//     encontro: { estado, titulo, texto, motivo },     <- SEM ancora de ceu
//     contatoDuro: boolean,
//   }
//
// ===========================================================================
// AS TRES LINHAS QUE ESTE MODULO NAO ATRAVESSA
// ===========================================================================
// 1. NUNCA FABRICAR CEU. Sem efemeride, `ceu` e null — "null quer dizer nao
//    desenhe o card", nunca "desenhe um card de erro" e muito menos "estime".
//    O DIA NUNCA DEPENDE DO CEU: ritual, reflexao e afirmacao saem inteiros num
//    aparelho sem astronomy-engine, porque a rotacao e aritmetica de calendario.
//    Foi assim de proposito — um plano diario que some quando falta uma
//    dependencia opcional nao e um plano diario.
// 2. NUNCA PROMETER DESFECHO nem dizer que o ceu ou o ritual agem sobre a outra
//    pessoa. O ceu descreve o DIA. "A Lua Cheia cai na sexta" e medida; "com a
//    Lua Cheia essa pessoa procura voce" e mentira e alegacao sobre terceiro.
//    E a regra vale para a MONTAGEM, nao so para a frase: duas medidas
//    verdadeiras coladas uma na outra afirmam uma terceira coisa que ninguem
//    mediu. Por isso o marco lunar nao entra no bloco de encontro — ver o
//    cabecalho de `encontroDoDia`.
// 3. NUNCA EMPURRAR CONTATO para quem nao tem contato. Com P4 em
//    'le-escribi-no-responde' ou 'cero-contacto' (e tambem com 'bloqueo'), o
//    bloco de encontro sai TRAVADO — visivel, com o motivo escrito, e sem
//    nenhuma das frases de datos/plano.js:ENCONTROS chegando perto da saida.
//    O app reage ao contato; nao provoca.
//
// ===========================================================================
// POR QUE O PLANO E PURO
// ===========================================================================
// `planoDoDia` nao le nem escreve storage. Duas consequencias, as duas
// desejadas: (a) o mesmo instante com as mesmas respostas devolve sempre o mesmo
// plano, e isso e testavel sem mock; (b) NAO ha chave de storage nova, e portanto
// nada a acrescentar em CLAVES_HILO_ROJO de screens/AjustesScreen.js — o "Apagar
// tudo" continua verdadeiro sem ninguem precisar lembrar.
//
// O destravamento do encontro tambem vem daqui: quem destrava e a propria pessoa
// mudando a resposta de P4, nao um botao escondido no plano. O app le a
// declaracao dela; nao a deduz do comportamento de mais ninguem.

/* `rituais()` e `lista()` em vez das quatro constantes: as constantes de
 * datos/plano.js sao o PORTUGUES, e ler elas aqui congelaria o plano do dia em
 * portugues nos tres idiomas. As duas funcoes resolvem pelo idioma ativo com
 * fallback por item para o PT, e devolvem SEMPRE o mesmo comprimento e a mesma
 * ordem — que e o que a rotacao por indice deste arquivo exige.
 * Os portoes de doutrina continuam importando AFIRMACOES/ENCONTROS/REFLEXOES/
 * RITUAIS direto de datos/plano.js: e assim que varrem a copy PT, onde a regra
 * nasce. */
import { lista as listaDoPlano, rituais } from '../datos/plano.js';
import { IDS_CONTACTO_DURO } from '../datos/preguntas.js';
import { lista, t } from '../datos/textos.js';
import { diagnosticoDe } from './diagnostico.js';
import { guardaContacto } from './lectura.js';
/* CUIDADO COM O NOME: `RITUAIS` (de datos/plano.js, importado acima) e OUTRO
 * catalogo. O da estreia e o do GIRO — datos/rituais.js — dai o alias. */
import { getRitual as getRitualDoGiro } from '../datos/rituais.js';
import { ritualDoDia } from './rituaisRotativos.js';
import {
  ceuDoDia,
  diaDaSemana,
  diaLocal,
  diasDesdeEpoca,
  esDiaValido,
  meioDiaLocal,
  regenteDoDia,
} from './ceu.js';
/* O ROTULO das fases e dos planetas. Os VALORES continuam vindo de ceu.js em
 * portugues canonico — sao o que `momento.fasesLua` de datos/rituais.js compara e
 * o que GLIFO_POR_PLANETA indexa. Estas duas funcoes so entram onde o nome vai
 * para DENTRO de uma frase traduzida; fora dai, interpolar o canonico cru
 * produzia "Today's Moon is in Lua Cheia". Ver lib/nomesDoCeu.js. */
import { rotuloDaFase, rotuloDoPlaneta } from './nomesDoCeu.js';

/* =================================================================================
 * CONTRATO COM AS TELAS
 * ================================================================================= */

/** As chaves de datos/textos.js que o plano emite. O portao varre esta lista. */
export const CLAVES_TEXTO_PLANO = Object.freeze([
  'plano.titulo',
  'plano.ceu.vazio',
  'plano.ceu.fase',
  'plano.ceu.marco.hoje',
  'plano.ceu.marco.dia',
  'plano.encaixe.exato',
  'plano.encaixe.parcial',
  'plano.encaixe.nenhum',
  'plano.encaixe.naoDeclara',
  'plano.encaixe.semMedida',
  'plano.encaixe.parcialSemMedida',
  'plano.encaixe.nenhumSemMedida',
  'plano.encaixe.criterio.dia',
  'plano.encaixe.criterio.fase',
  'plano.encontro.titulo',
  'plano.encontro.travado.contatoDuro',
  'plano.encontro.travado.bloqueio',
  'plano.semana.nomes',
  'plano.semana.em',
  'plano.acao.contencao',
  'plano.acao.alternativa',
]);

export const ESTADOS_ENCONTRO = Object.freeze({ ACAO: 'acao', TRAVADO: 'travado' });

export const MOTIVOS_ENCONTRO = Object.freeze({
  CONTATO_DURO: 'contatoDuro',
  BLOQUEIO: 'bloqueio',
});

/* O id de P4 que nao esta em IDS_CONTACTO_DURO e mesmo assim trava o encontro.
 * Bloqueio nao e "pouco contato": e um canal fechado. Propor encontro para quem
 * esta bloqueada nao e otimismo, e ignorar o unico dado duro que ela deu.
 * Fica separado de IDS_CONTACTO_DURO de proposito: aquela lista e do motor de
 * leitura e nao deve mudar de significado por causa desta decisao. */
export const ID_BLOQUEIO = 'bloqueo';

/* HORIZONTE declarado. Dentro dele o plano DATA o marco lunar; fora dele nao diz
 * nada — nao ha "daqui a algumas semanas". O limite e do produto, nao da
 * astronomia: um marco a vinte dias nao muda nada no dia de hoje. */
export const HORIZONTE_DO_MARCO_DIAS = 7;

/* =================================================================================
 * A REDE DE RUNTIME — as guardas de lib/lectura.js rodando sobre a saida
 * =================================================================================
 * datos/plano.js ja e escrito com a disciplina certa, e o portao de teste varre a
 * saida inteira quando o contato e duro. Isso protege as frases que existem HOJE.
 * Nao protege a linha que alguem acrescentar em datos/plano.js daqui a tres meses
 * sem rodar o teste, nem um erro de rotacao que faca ENCONTROS vazar para um
 * estado travado. E o vazamento nao seria cosmetico: seria o app mandando procurar
 * quem ja nao respondeu, que e o jeito mais rapido de a usuaria se machucar usando
 * este produto.
 *
 * Por isso a varredura roda TAMBEM em runtime, sobre o texto ja composto, sempre
 * que o contato e duro. Nao se confia em ter escolhido a frase certa na tabela: a
 * tabela e editada por gente, e rede so serve se estiver embaixo do trapezio nos
 * dias em que ninguem espera cair.
 *
 * O QUE ENTRA NA VARREDURA: tudo que diz a alguem para FAZER alguma coisa — a acao
 * do dia, o porque dela, a reflexao, a afirmacao, o texto do bloco de encontro e,
 * por `ritualSeguroDoDia`, os campos visiveis do ritual ROTATIVO de datos/rituais.js.
 *
 * O BURACO QUE ISTO FECHOU, e ele durou meses: a rede varria `plano.ritual`, que
 * sai de datos/plano.js — e screens/PlanoScreen.js NAO DESENHA aquele ritual. A
 * tela desenha o de datos/rituais.js (`gesto`, `abertura`, `comoFazer[]`, `fecho`),
 * escolhido por lib/rituaisRotativos.js, e esse chegava CRU a tela de quem
 * respondeu 'cero-contacto'. A rede estava ligada no texto morto e desligada no
 * texto vivo, e o portao ficava verde porque varria o mesmo texto morto — a
 * primeira medicao daquele catalogo achou a abertura da mao falando pela outra
 * pessoa ("segue ela com o dedo ate onde ela vai"), que nunca tinha sido lida
 * por guarda nenhuma. Por isso `ritualSeguroDoDia` existe e por isso a tela chama ELE, nunca
 * `ritualDoDia` direto — quem importa a versao crua na tela reabre o buraco.
 *
 * QUANDO A REDE RODA: contato duro (IDS_CONTACTO_DURO) OU bloqueio. O bloqueio
 * entrou junto porque canal fechado e o estado em que um empurrao machuca igual;
 * `contatoDuro` continua espelhando so P4, e nao a decisao desta rede.
 *
 * O QUE FICA DE FORA, E POR QUE: `ceu.linha` e `ceu.marco.linha`. As duas sao
 * enunciados de MEDIDA montados a partir de um template fixo ("A Lua de hoje esta
 * em X", "X cai na sexta-feira, dia 11") — nao tem verbo dirigido a ninguem e nao
 * ha texto de catalogo entrando nelas. Trocar uma medicao por uma frase generica
 * seria o reparo errado: o certo, se algum dia uma delas disparar, e o portao de
 * teste reprovar o template, nao o runtime reescrever um fato astronomico.
 *
 * A alternativa que entra no lugar da frase retirada e a NOSSA, em portugues
 * (`plano.acao.alternativa`). As ALTERNATIVAS de lib/lectura.js estao em espanhol:
 * usa-las aqui costuraria um paragrafo espanhol no meio de um plano portugues — bug
 * de idioma nascido de um patch de seguranca.
 * ================================================================================= */

/* Varre uma frase e devolve { texto, filtrado }. `filtrado` sobe para o campo
 * tecnico: guarda que dispara em silencio e guarda que ninguem conserta.
 *
 * O texto NUNCA volta vazio. lib/lectura.js deixa a parte sair vazia de proposito
 * quando o `libro` ja gastou a alternativa naquela posicao — la isso esta certo,
 * porque a posicao some da leitura e sobram as outras duas. Aqui nao ha "outras
 * duas": um plano do dia com `acao: ''` e um dia sem plano, que e exatamente o que
 * a regra 1 proibe. Entao, se a varredura levar a frase inteira, entra a
 * alternativa mesmo repetida — dia com plano vale mais que copy elegante. */
function varrer(texto, livro) {
  if (typeof texto !== 'string' || !texto) return { texto, filtrado: false };
  const passada = guardaContacto(texto, t('plano.acao.alternativa'), livro);
  const limpo = passada.texto.trim();
  return {
    texto: limpo || t('plano.acao.alternativa'),
    filtrado: passada.filtrado,
  };
}

/* A mesma varredura para um ITEM DE LISTA (os passos de `comoFazer`), com a regra
 * oposta sobre o vazio: aqui o texto PODE voltar vazio, e quem chama descarta o
 * passo. E o contrario de `varrer` de proposito.
 *
 * Um campo do plano vazio e um dia sem plano (regra 1), entao la a alternativa
 * entra mesmo repetida. Um PASSO vazio, nao: a lista tem outros, e repetir o
 * paragrafo de seguranca no lugar do passo 4 de "como fazer o cafe" seria a rede
 * escrevendo um passo que ninguem consegue executar. O primeiro passo retirado ja
 * recebe a alternativa pelo `livro` compartilhado; os seguintes somem. */
function varrerPasso(texto, livro) {
  if (typeof texto !== 'string' || !texto.trim()) return { texto: '', filtrado: false };
  const passada = guardaContacto(texto, t('plano.acao.alternativa'), livro);
  return { texto: passada.texto.trim(), filtrado: passada.filtrado };
}

/**
 * Quando a rede de runtime roda: contato duro OU bloqueio.
 *
 * Exportada porque duas coisas precisam da MESMA resposta — `planoDoDia` e
 * `ritualSeguroDoDia` — e duas condicoes escritas na mao acabam discordando; o dia
 * em que discordassem, uma metade da tela ficaria protegida e a outra nao.
 */
export function precisaDeRede(respuestas) {
  const id = respuestas && typeof respuestas === 'object' ? respuestas.hoy : null;
  return IDS_CONTACTO_DURO.indexOf(id) !== -1 || id === ID_BLOQUEIO;
}

/**
 * O RITUAL ROTATIVO DO DIA, JA PASSADO PELA REDE.
 *
 * E a unica porta que screens/PlanoScreen.js deve usar para pegar o gesto do dia.
 * Devolve a mesma forma de datos/rituais.js (para a tela nao precisar saber de
 * nada), com dois campos a mais: `dia`, que ja vinha de lib/rituaisRotativos.js, e
 * `guardasDisparadas`, que diz quais campos a rede precisou tocar.
 *
 * Sem contato duro e sem bloqueio, devolve a entrada do catalogo intacta — nao ha
 * o que proteger e reescrever texto bom seria dano gratuito.
 *
 * Nao lanca, nao le disco, nao sorteia. `comoFazerTexto` e RECOMPOSTO a partir dos
 * passos que sobraram: deixa-lo vir do catalogo faria o card compartilhavel
 * carregar a frase que a rede acabou de tirar da tela.
 *
 * @param {string|Date} [dia]        'YYYY-MM-DD' (ou Date); invalido cai para hoje.
 * @param {object}      [respuestas] as respostas do onboarding (so `hoy` e lida).
 * @param {object}      [opciones]   { estreia?: boolean } — ver abaixo.
 *
 * A ESTREIA (01/09): a leitura da mao saiu do giro porque a mao e sempre a
 * mesma — repetir a leitura seria enrolacao. Ela virou o gesto do PRIMEIRO dia
 * de plano da vida dela: quem decide se e estreia e a TELA (nenhum dia raspado
 * em lib/veuDoDia — este modulo nao le disco, e a pureza dele e contrato), e
 * este parametro so troca o gesto-base. A rede de contato passa por cima
 * normalmente, como em qualquer outro dia.
 */
export function ritualSeguroDoDia(dia, respuestas, opciones) {
  const estreia = Boolean(opciones && opciones.estreia);
  /* getRitual, e nao RITUAIS_DO_GIRO.find: o getter resolve o IDIOMA ATIVO (ver
   * OS TRES IDIOMAS em datos/rituais.js). Varrer o array cru devolveria o
   * portugues — e so no dia da estreia, que e o PRIMEIRO dia de plano da vida
   * dela: o bug mais caro possivel, porque aparece uma vez por usuaria e some. */
  const daEstreia = estreia ? getRitualDoGiro('mao') : null;
  const base = daEstreia || ritualDoDia(dia);
  if (!precisaDeRede(respuestas)) return base;

  const livro = { usada: false };
  const disparos = [];

  const campo = (nome, texto) => {
    const r = varrer(texto, livro);
    if (r.filtrado) disparos.push(nome);
    return r.texto;
  };

  const gesto = campo('ritual.gesto', base.gesto);
  const abertura = campo('ritual.abertura', base.abertura);

  const passos = [];
  (Array.isArray(base.comoFazer) ? base.comoFazer : []).forEach((paso, i) => {
    const r = varrerPasso(paso, livro);
    if (r.filtrado) disparos.push(`ritual.comoFazer[${i}]`);
    if (r.texto) passos.push(r.texto);
  });

  const fecho = campo('ritual.fecho', base.fecho);

  return Object.freeze({
    ...base,
    gesto,
    abertura,
    comoFazer: Object.freeze(passos),
    comoFazerTexto: passos.join(' '),
    fecho,
    guardasDisparadas: Object.freeze(disparos),
  });
}

/* =================================================================================
 * ROTACAO — aritmetica pura, sem sorteio e sem storage.
 *
 * O indice e a contagem CONTINUA de dias desde a epoca, nunca o dia-do-ano. Com
 * dia-do-ano, 31/12 e 01/01 caem no mesmo indice sempre que o tamanho do catalogo
 * divide o tamanho do ano (5 divide 365) — o unico dia do ano em que a rotacao
 * promete nao repetir e repete. Contagem continua nao tem virada.
 *
 * Cinco rituais, sete reflexoes e onze afirmacoes: primos entre si, entao a
 * combinacao dos tres so volta a se repetir depois de 385 dias.
 * ================================================================================= */
function giroDoDia(dia) {
  const n = diasDesdeEpoca(dia);
  return n === null ? 0 : n;
}

function daVolta(lista, giro) {
  const n = lista.length;
  return lista[((giro % n) + n) % n];
}

function indiceDaVolta(largo, giro) {
  return ((giro % largo) + largo) % largo;
}

/* =================================================================================
 * ENCAIXE — bate hoje, e por que.
 *
 * A parte que importa e a que NAO fala: quando falta efemeride, o eixo da fase
 * fica `null` e o texto do encaixe nao menciona fase nenhuma. Nao e o mesmo que
 * `false`. Dizer "hoje nao bate a fase" sem ter medido a fase seria fabricar ceu
 * pelo avesso — afirmar sobre o ceu uma coisa que nao se sabe.
 *
 * ---------------------------------------------------------------------------
 * OS DOIS TIPOS QUE NASCERAM DE UM BUG MEDIDO (portao test/madremaria-plano.test.js)
 * ---------------------------------------------------------------------------
 * Havia quatro tipos — exato, parcial, nenhum, naoDeclara — e eles conflavam
 * "medi e nao bate" com "nao consegui medir". Sem efemeride:
 *
 *   · 'caminho-de-volta' declara SO fase. Com nenhum eixo medido, ele caia em
 *     `naoDeclara` e a tela dizia "Este gesto nao pede dia nem fase" — uma
 *     afirmacao FALSA sobre o proprio catalogo, produzida por falta de medida.
 *     E a regra 1 furada pelo avesso: em vez de inventar ceu, o app inventava a
 *     AUSENCIA de criterio, que e igualmente uma afirmacao sem lastro.
 *   · um ritual que declara dia E fase, com o dia batendo e a fase nao medida,
 *     caia em `parcial` — "Hoje bate em parte" —, que faz quem le entender que
 *     a outra metade foi conferida e reprovou. Nao foi conferida.
 *
 * Por isso `semMedida` e `parcialSemMedida`, e por isso `falta[]`: o mesmo
 * vocabulario de lib/ceu.js, dizendo o que NAO entrou na conta em vez de deixar
 * o silencio parecer resposta.
 *
 * ---------------------------------------------------------------------------
 * O TERCEIRO CASO, ENCONTRADO NA REVISAO DE CEU FABRICADO
 * ---------------------------------------------------------------------------
 * Faltava a metade negativa do mesmo par. `parcialSemMedida` cobria "o dia bate
 * e a fase nao foi medida"; nada cobria "o dia NAO bate e a fase nao foi
 * medida" — esse caso caia em `nenhum`, e a tela dizia "Hoje nao e o dia mais
 * obvio deste gesto" como quem conferiu os dois criterios e reprovou os dois.
 * Foi MEDIDO, sem efemeride: 'mesa-posta' e 'linha-no-papel' (os dois que
 * declaram dia E fase) caiam em `nenhum` em todo dia da semana que nao fosse o
 * declarado. Um veredito negativo sobre um criterio que ninguem olhou e a mesma
 * afirmacao sem lastro que inventar a Lua seria — so que com o sinal trocado, e
 * por isso ninguem procura por ela.
 *
 * Dai `nenhumSemMedida`. A regra que fecha os quatro casos: NENHUM tipo que
 * fale como quem conferiu (exato, parcial, nenhum, naoDeclara) pode sair com
 * `falta` cheio.
 * ================================================================================= */
function encaixeDoRitual(ritual, diaSemana, nomeDaFase) {
  const declaraDia = ritual.momento.diasSemana.length > 0;
  const declaraFase = ritual.momento.fasesLua.length > 0;

  const bateDia = declaraDia ? ritual.momento.diasSemana.indexOf(diaSemana) !== -1 : null;
  const bateFase =
    declaraFase && nomeDaFase ? ritual.momento.fasesLua.indexOf(nomeDaFase) !== -1 : null;

  const declarados = (declaraDia ? 1 : 0) + (declaraFase ? 1 : 0);
  const medidos = [bateDia, bateFase].filter((v) => v !== null);

  const criterios = [];
  if (bateDia === true) {
    criterios.push(
      t('plano.encaixe.criterio.dia', {
        diaSemana: lista('plano.semana.nomes')[diaSemana],
        regente: rotuloDoPlaneta(regentePorIndice(diaSemana)),
      })
    );
  }
  if (bateFase === true) {
    /* `nomeDaFase` continua sendo o canonico acima, em `indexOf` contra
     * `momento.fasesLua` — so o que entra na FRASE leva rotulo. */
    criterios.push(t('plano.encaixe.criterio.fase', { fase: rotuloDaFase(nomeDaFase) }));
  }

  /* O que foi DECLARADO e nao pode ser MEDIDO. Hoje so a fase cai aqui (o dia da
   * semana e aritmetica e nunca falta), mas a lista existe em vez de um booleano
   * porque o dia em que um criterio novo depender de efemeride, ele entra aqui e
   * o texto se ajusta sozinho — em vez de ser silenciosamente somado ao "nao
   * bate". */
  const falta = [];
  if (declaraFase && bateFase === null) falta.push('fase');

  let tipo;
  if (declarados === 0) tipo = 'naoDeclara';
  else if (medidos.length === 0) tipo = 'semMedida';
  else if (medidos.every(Boolean)) tipo = falta.length > 0 ? 'parcialSemMedida' : 'exato';
  else if (medidos.some(Boolean)) tipo = 'parcial';
  // O veredito NEGATIVO tem a mesma exigencia do positivo: so vale quando tudo
  // que foi declarado foi olhado. Com `falta` cheio, "nao bate" seria um "nao"
  // sobre um criterio que ninguem mediu.
  else tipo = falta.length > 0 ? 'nenhumSemMedida' : 'nenhum';

  const comCriterios = tipo === 'exato' || tipo === 'parcial' || tipo === 'parcialSemMedida';
  const motivo = comCriterios
    ? t(`plano.encaixe.${tipo}`, { criterios: criterios.join(' e ') })
    : t(`plano.encaixe.${tipo}`);

  return Object.freeze({
    tipo,
    diaSemana: bateDia,
    fase: bateFase,
    falta: Object.freeze(falta),
    motivo,
  });
}

function regentePorIndice(indice) {
  // Passa pela mesma tabela de lib/ceu.js, via uma data conhecida daquele dia da
  // semana: 04/01/1970 foi um domingo, entao 1970-01-04 + indice fecha a conta.
  const base = new Date(Date.UTC(1970, 0, 4 + indice));
  const pad = (n, largo = 2) => String(n).padStart(largo, '0');
  return regenteDoDia(
    `${pad(base.getUTCFullYear(), 4)}-${pad(base.getUTCMonth() + 1)}-${pad(base.getUTCDate())}`
  );
}

/* =================================================================================
 * O BLOCO DE ENCONTRO
 *
 * Duas saidas e uma so forma: { estado, titulo, texto, motivo }. A tela tem UM
 * renderizador e a checagem e `if (encontro.estado === 'travado')`.
 *
 * TRAVADO nao e escondido. O bloco aparece, com o motivo escrito, porque esconder
 * ensinaria que o app tem um andar secreto; e ele nao carrega NENHUM pedaco da
 * acao — nem em campo auxiliar, nem "para quando destravar". Uma acao de encontro
 * guardada num campo lateral e exatamente o vazamento que este desenho evita.
 *
 * ---------------------------------------------------------------------------
 * POR QUE O MARCO LUNAR NAO ENTRA AQUI — o campo `quando`, retirado
 * ---------------------------------------------------------------------------
 * Este bloco tinha um campo `quando`, montado como
 * "Se for para escolher o dia: Lua Nova cai na sexta-feira, dia 11" e desenhado
 * DENTRO do cartao de encontro, colado na acao. Cada metade era verdadeira em
 * separado — a data e medida, a acao vem do catalogo —, e mesmo assim o
 * resultado nao era. Encostadas, elas dizem uma terceira coisa que nenhum
 * campo daqui mediu: que a Lua e criterio para escolher o dia de um encontro
 * com outra pessoa, ou seja, que o ceu tem alguma coisa a ver com o que
 * acontece naquela mesa. Isso e previsao vestida de descricao, e e o formato
 * mais dificil de pegar, porque nao ha uma unica palavra proibida nas duas
 * frases.
 *
 * A regra ja estava escrita neste repositorio, no bloco `ano.virada.*` de
 * datos/textos.js: "a tela nao poe este marco no mesmo bloco visual do bloco de
 * encontro: data medida a dois centimetros de um texto sobre reconciliacao
 * deixa de ser medida sem uma palavra proibida aparecer". O plano do dia estava
 * fazendo exatamente o que aquele comentario proibe.
 *
 * O marco NAO foi perdido: ele continua medido e datado em `ceu.marco.linha`,
 * no alto da tela, onde descreve o DIA e nao a decisao de ninguem. O que saiu
 * foi a costura entre os dois. Quem quiser reabrir isso precisa primeiro
 * responder o que o app mediria para sustentar a ligacao — e a resposta hoje e
 * nada.
 * ================================================================================= */
function encontroDoDia({ respuestas, giro }) {
  const idContato = respuestas && typeof respuestas === 'object' ? respuestas.hoy : null;
  const duro = IDS_CONTACTO_DURO.indexOf(idContato) !== -1;
  const bloqueio = idContato === ID_BLOQUEIO;

  if (duro || bloqueio) {
    const motivo = duro ? MOTIVOS_ENCONTRO.CONTATO_DURO : MOTIVOS_ENCONTRO.BLOQUEIO;
    return Object.freeze({
      estado: ESTADOS_ENCONTRO.TRAVADO,
      titulo: t('plano.encontro.titulo'),
      texto: t(`plano.encontro.travado.${motivo}`),
      motivo,
    });
  }

  return Object.freeze({
    estado: ESTADOS_ENCONTRO.ACAO,
    titulo: t('plano.encontro.titulo'),
    texto: daVolta(listaDoPlano('ENCONTROS'), giro),
    motivo: null,
  });
}

/* =================================================================================
 * O CEU DO PLANO
 * ================================================================================= */
function bloqueDeCeu(dia) {
  /* A ancora e o MEIO-DIA LOCAL do dia civil, e ela e passada explicitamente.
   * `ceuDoDia(dia)` com a string de 10 caracteres tambem funcionaria, mas lib/ceu.js
   * a le como meio-dia UTC — e num fuso a leste de +12 esse instante ja e o dia
   * seguinte no relogio de quem le. O plano do dia nao pode falar da lua de outro
   * dia por causa de um argumento mais curto. */
  const bruto = ceuDoDia(meioDiaLocal(dia));
  if (!bruto || !bruto.disponivel || !bruto.lua) {
    return { ceu: null, motivoTecnico: bruto ? bruto.motivo : null };
  }

  /* O marco mais proximo entre Nova e Cheia. `passou` NAO filtra nada aqui de
   * proposito: a busca de lib/ceu.js comeca a meia-noite local, entao uma Cheia
   * hoje as 3h volta com passou:true e faltamDias:0 — e ela e exatamente o marco
   * que o dia de hoje tem para contar. Filtrar por `passou` faria a Lua Cheia
   * sumir do card as 8h da manha do proprio dia da Lua Cheia. */
  const candidatos = [bruto.lua.proximaCheia, bruto.lua.proximaNova]
    .filter((m) => m && Number.isFinite(m.faltamDias) && m.faltamDias >= 0)
    .sort((a, b) => a.faltamDias - b.faltamDias || a.instante.iso.localeCompare(b.instante.iso));

  const semana = lista('plano.semana.em');
  let marco = null;
  const proximo = candidatos[0];
  if (proximo && proximo.faltamDias <= HORIZONTE_DO_MARCO_DIAS) {
    /* Nunca "amanha" nem "daqui a X dias": nome do dia da semana e numero do dia.
     * Nao e preciosismo — 'amanha' e uma das locucoes de futuro que a doutrina
     * proibe no texto do produto, e um marco datado nao precisa dela para nada. */
    const linha =
      proximo.faltamDias === 0
        ? t('plano.ceu.marco.hoje', { fase: rotuloDaFase(proximo.nome) })
        : t('plano.ceu.marco.dia', {
            fase: rotuloDaFase(proximo.nome),
            quando: semana[diaDaSemana(proximo.instante.dia)],
            dia: Number(proximo.instante.dia.slice(8, 10)),
          });
    marco = Object.freeze({
      nome: proximo.nome,
      emoji: proximo.emoji,
      dia: proximo.instante.dia,
      dataISO: proximo.instante.iso,
      faltamDias: proximo.faltamDias,
      linha,
    });
  }

  return {
    ceu: Object.freeze({
      disponivel: true,
      fase: Object.freeze({ nome: bruto.lua.fase.nome, emoji: bruto.lua.fase.emoji }),
      /* `fase.nome` acima fica CANONICO: `encaixeDoRitual` o compara contra
       * `momento.fasesLua` de datos/rituais.js, que e portugues. So a `linha`,
       * que e o que a pessoa le, leva o rotulo do idioma ativo. */
      linha: t('plano.ceu.fase', { fase: rotuloDaFase(bruto.lua.fase.nome) }),
      marco,
    }),
    motivoTecnico: null,
  };
}

/* =================================================================================
 * A FUNCAO PUBLICA
 * ================================================================================= */

/**
 * O plano do dia. Deterministico: mesmo dia + mesmas respostas = mesmo objeto.
 * Nao lanca. Nao toca storage. Nao usa sorteio.
 *
 * @param {object} respuestas  as respostas do onboarding (so `hoy` e lida aqui)
 * @param {object} opciones    { hoy: 'YYYY-MM-DD', agora: Date }
 */
export function planoDoDia(respuestas, opciones = {}) {
  const opts = opciones && typeof opciones === 'object' ? opciones : {};
  const dia = esDiaValido(opts.hoy) ? opts.hoy : diaLocal(opts.agora);

  const giro = giroDoDia(dia);
  const semana = diaDaSemana(dia);
  const { ceu, motivoTecnico } = bloqueDeCeu(dia);

  const ritual = daVolta(rituais(), giro);
  const encaixe = encaixeDoRitual(ritual, semana, ceu ? ceu.fase.nome : null);

  /* A REDE, LIGADA. Ela roda nos dois estados em que um empurrao machuca —
   * contato duro e bloqueio, ver `precisaDeRede` — e sobre TODO campo que manda
   * alguem fazer alguma coisa. `livro` e compartilhado: a alternativa entra uma
   * vez no plano inteiro, e nao uma vez por campo, senao o mesmo paragrafo de
   * seguranca apareceria quatro vezes e o dia soaria automatico.
   *
   * `guardasDisparadas` sobe junto porque uma rede que salva em silencio e uma
   * rede que ninguem conserta: se ela disparar, alguem escreveu no catalogo uma
   * frase que nao devia existir, e o conserto e no catalogo. */
  const duro = IDS_CONTACTO_DURO.indexOf(respuestas && respuestas.hoy) !== -1;
  const rede = precisaDeRede(respuestas);
  const livro = { usada: false };
  const disparos = [];
  const passar = (campo, texto) => {
    if (!rede) return texto;
    const r = varrer(texto, livro);
    if (r.filtrado) disparos.push(campo);
    return r.texto;
  };

  /* O `ceu` NAO entra aqui, e a ausencia do argumento e o contrato: o bloco de
   * encontro nao pode receber marco lunar nenhum. Ver o cabecalho de
   * `encontroDoDia`.
   *
   * E O TEXTO DELE PASSA PELA REDE, o que ate agora nao acontecia — o cabecalho
   * deste arquivo dizia que passava e o codigo devolvia `encontroDoDia()` cru.
   * No estado travado o texto e nosso e hoje esta limpo, mas ele e editado por
   * gente e e lido por exatamente quem nao pode receber a sugestao: uma frase
   * como "propor um encontro seria..." chega inteira a tela dela sem a rede. No
   * estado de acao a rede fica desligada, que e o motivo de ENCONTROS existir. */
  const cruzamento = diagnosticoDe({
    respostas: respuestas,
    genero: respuestas && respuestas.genero,
    hoje: meioDiaLocal(dia),
  });

  const encontroBruto = encontroDoDia({ respuestas, giro });
  const encontro = rede
    ? Object.freeze({
        ...encontroBruto,
        texto: passar('encontro.texto', encontroBruto.texto),
      })
    : encontroBruto;

  return Object.freeze({
    dia,
    diaSemana: semana,
    nomeDiaSemana: lista('plano.semana.nomes')[semana],
    regente: regenteDoDia(dia),

    ritual: Object.freeze({
      id: ritual.id,
      titulo: ritual.titulo,
      acao: passar('ritual.acao', ritual.acao),
      porque: passar('ritual.porque', ritual.porque),
      camera: ritual.camera === true,
      encaixe,
    }),

    reflexao: passar('reflexao', daVolta(listaDoPlano('REFLEXOES'), giro)),
    afirmacao: passar('afirmacao', daVolta(listaDoPlano('AFIRMACOES'), giro)),

    /* O gesto de contencao so existe no estado duro: e a frase para o momento em
     * que bate a vontade de dar o passo para fora. Oferecer isso a quem esta
     * conversando normalmente seria inventar um problema que ela nao tem. */
    contencao: duro ? t('plano.acao.contencao') : null,

    ceu,
    ceuMotivoTecnico: motivoTecnico,

    /* O CRUZAMENTO — lib/diagnostico.js.
     *
     * E o que ocupa o lugar da frase falsa que o fechamento das tres cartas dizia
     * ("daqui para a frente sai do baralho de 78 cartas"). Nao sai carta nenhuma:
     * sai isto — o signo derivado da data, a idade da mesma data e as cinco
     * respostas, cruzados dois a dois, cada linha com a propria conta.
     *
     * O CONTRATO DO PLANO NAO MUDOU, e essa e a parte que importa. O campo e
     * SOMADO; nenhum campo antigo depende dele. Quem nao deu a data recebe o
     * plano inteiro — ritual, encaixe, reflexao, afirmacao, encontro, ceu — e
     * recebe `diagnostico.linhas` com as linhas que existem sem data (a historia,
     * a posicao, o tratamento). A regra 3 de la e a mesma regra 1 daqui: campo
     * que falta nao vira estimativa, vira silencio. Um `diagnostico` que
     * exigisse a data para existir transformaria uma pergunta de FICHA em portao
     * do plano do dia, e ficha nao abre nada — ela fecha.
     *
     * A REDE NAO PASSA POR AQUI, de proposito. `varrer` TROCA o texto pela
     * alternativa quando a guarda dispara, e trocar a frase de um recibo faria o
     * recibo mentir sobre a propria conta. O que protege este bloco e a
     * construcao: os rotulos de diagnostico.js sao nossos e sao sem agente, e o
     * portao de test/madremaria-diagnostico.test.js varre as 1.875 combinacoes com as mesmas
     * guardas de lib/lectura.js. Se alguma linha daqui algum dia disparar, o
     * conserto e no rotulo — nunca no runtime reescrevendo um recibo.
     *
     * A ANCORA DA IDADE e o MEIO-DIA LOCAL do dia do plano, e nao `new Date()`:
     * com o relogio solto, o mesmo `hoy` devolveria idades diferentes conforme a
     * hora em que o teste rodasse, e `planoDoDia` deixaria de ser deterministico
     * — que e a primeira coisa prometida no cabecalho deste arquivo. */
    signo: cruzamento.signo,
    diagnostico: cruzamento,

    encontro,
    contatoDuro: duro,
    guardasDisparadas: Object.freeze(disparos),
  });
}

/** Indices da rotacao de um dia — existe para o portao conferir a rotacao sem
 * depender do texto, e para QA responder "por que este ritual hoje?". */
export function _rotacaoDe(dia) {
  const giro = giroDoDia(dia);
  return {
    giro,
    ritual: indiceDaVolta(rituais().length, giro),
    reflexao: indiceDaVolta(listaDoPlano('REFLEXOES').length, giro),
    afirmacao: indiceDaVolta(listaDoPlano('AFIRMACOES').length, giro),
    encontro: indiceDaVolta(listaDoPlano('ENCONTROS').length, giro),
  };
}

export default {
  CLAVES_TEXTO_PLANO,
  ESTADOS_ENCONTRO,
  MOTIVOS_ENCONTRO,
  HORIZONTE_DO_MARCO_DIAS,
  planoDoDia,
  precisaDeRede,
  ritualSeguroDoDia,
};
