// test/madremaria-voz-ausencias.js
// AS AUSENCIAS DECLARADAS DA VOZ — que audio o app pode pedir e AINDA nao existe
// no disco, com o motivo escrito por extenso.
//
// ===========================================================================
// POR QUE ESTA LISTA EXISTE (e o molde e test/madremaria-i18n-orfas.js)
// ===========================================================================
// O portao test/madremaria-voz.test.js varre assets/madremaria/audio/ e cobra,
// para cada um dos 30 ids de madremaria/lib/audios.js e para cada um dos tres
// idiomas, ou UM ARQUIVO ou UMA LINHA AQUI. Nao ha terceira saida: audio que
// some sem aparecer nesta lista quebra o portao, e audio que aparece aqui e
// volta ao disco tambem quebra (a lista nao pode envelhecer em silencio — a
// mesma regra que ORFAS ja segue no placar de i18n).
//
// O CUSTO DE NAO TER ESTA LISTA: um portao que so conta ("faltam 54") nao diz
// QUAL falta. O placar de i18n teve exatamente esse defeito — mostrava so os dez
// primeiros nomes (test/i18nKeysExist.test.js:280) e escondia regressao atras do
// numero. Aqui a lista e nominal e o erro imprime TODOS os nomes.
//
// ===========================================================================
// POR QUE SAO 27 POR IDIOMA, E NAO 30
// ===========================================================================
// O lote gerado no servidor em 12/09/2026 tem 27 arquivos por idioma, na MESMA
// voz clonada do app (FioVermelho-Principal, b8boGhcWbCyPtZnKW69X,
// eleven_multilingual_v2 — a mesma voz fala os tres idiomas). Os tres que faltam
// para fechar os 30 sao carta-4, carta-5 e carta-6, e a ausencia deles nao e
// atraso: e outra natureza de arquivo. Ver o grupo abaixo.
//
// ===========================================================================
// O QUE ACONTECE NA TELA ENQUANTO A AUSENCIA DURA (a degradacao honesta)
// ===========================================================================
// madremaria/lib/audios.js resolve o audio pelo IDIOMA ATIVO desde 12/09, e para
// idioma sem gravacao devolve null — NAO cai no portugues. O cabecalho dele diz
// por que, e a razao e a certa: tocar o PT para quem escolheu ingles e a Madre
// falando outra lingua por cima de uma tela traduzida. Pior que silencio, porque
// a pessoa atribui o erro ao produto, nao a uma pendencia, e nenhuma tela avisa.
// Botao que nao aparece ela entende; voz no idioma errado, nao.
//
// E null nao deixa botao morto: components/BotaoOuvir.js faz `if (!fonte) return
// null`, e as tres telas que pedem voz (LeituraDeEntradaScreen,
// LeituraProfundaScreen, ReouvirTresCartasScreen) passam por `temAudio` antes de
// desenhar. O texto palavra por palavra continua na tela — que e o que a pessoa
// sem fone ja le hoje.
//
// ===========================================================================
// COMO DAR BAIXA
// ===========================================================================
// Chegou o .es.m4a de um id? Tire o id de AUSENTES.es. Nao tirou? O portao acusa
// "chegou e continua declarado ausente". Chegaram todos de um idioma? Apague o
// grupo inteiro.
//
// E NAO BASTA O ARQUIVO: o portao cobra tambem a linha de `require` em
// POR_IDIOMA (madremaria/lib/audios.js). Arquivo no disco sem require e voz que
// nunca toca — o Metro so resolve caminho literal.

/* Os 30 ids de madremaria/lib/audios.js, na ordem em que o mapa os declara. O
 * portao confere que esta lista e EXATAMENTE o mapa: id novo la sem linha aqui
 * quebra o portao no mesmo commit, em vez de virar audio que ninguem cobra. */
const TODOS_OS_IDS = Object.freeze([
  'carta-4', 'carta-5', 'carta-6',
  'profunda-7', 'profunda-8', 'profunda-9', 'profunda-10', 'profunda-11',
  'ritual-cafe', 'ritual-mao', 'ritual-cartas', 'ritual-sonho',
  'ritual-caminhada', 'ritual-canto', 'ritual-respiro',
  'entrada-lenormand-32', 'entrada-lenormand-21', 'entrada-lenormand-22',
  'entrada-lenormand-33', 'entrada-lenormand-35', 'entrada-lenormand-16',
  'entrada-anuncio-extra', 'entrada-anuncio-estrela',
  'entrada-presenca', 'entrada-apresentacao',
  'profunda-b1', 'profunda-b2', 'profunda-b3', 'profunda-b4', 'profunda-b5',
]);

/* Os idiomas que o app fala (datos/textos.js). O portugues e o unico sem sufixo
 * de arquivo: `<id>.m4a`. Os outros dois sao `<id>.<lang>.m4a`. */
const IDIOMAS = Object.freeze(['pt', 'es', 'en']);

/* AS TRES CARTAS DA VOZ DO DONO. carta-4, carta-5 e carta-6 sao as unicas
 * gravacoes do app que NAO sao da voz clonada: sao os originais do proprio dono
 * (C:\TAROT\AUDIO PORTUGUES\4,5,6.ogg, convertidos para .m4a), e o cabecalho de
 * madremaria/datos/lenormand.js conta a historia deles.
 *
 * Por isso ficaram fora do lote de 27: traduzi-las com a voz clonada trocaria a
 * voz do dono pela da Madre no meio da leitura de entrada — quem ouve as tres
 * cartas em portugues e depois em espanhol ouviria duas pessoas diferentes.
 *
 * E ha um segundo motivo, mais duro: o audio do Cavaleiro (carta-6) termina numa
 * PREVISAO DE FUTURO que o produto inteiro nao faz e que test/copy.test.js
 * aborta — o desencontro esta declarado em `avisoDeAudio` no baralho. Gerar o
 * es/en a partir dele carregaria a previsao para mais dois idiomas. A traducao
 * destes tres so pode sair depois que o portugues for regravado. */
const CARTAS_DA_VOZ_DO_DONO = Object.freeze(['carta-4', 'carta-5', 'carta-6']);

const MOTIVO_CARTAS =
  'gravacao original do DONO, nao da voz clonada (ver cabecalho de datos/lenormand.js). '
  + 'Traduzir trocaria a voz no meio da leitura de entrada, e carta-6 ainda carrega a '
  + 'previsao de futuro que test/copy.test.js aborta. So depois de regravar o PT.';

/** idioma -> { motivo, ids }. Idioma sem entrada = nada pode faltar nele. */
const AUSENTES = Object.freeze({
  /* ESPANHOL: os 27 do lote chegaram em 12/09/2026. Sobram as tres do dono. */
  es: Object.freeze({ motivo: MOTIVO_CARTAS, ids: CARTAS_DA_VOZ_DO_DONO }),

  /* INGLES: idem, mesmo lote e mesmo motivo. */
  en: Object.freeze({ motivo: MOTIVO_CARTAS, ids: CARTAS_DA_VOZ_DO_DONO }),
});

/* OS DEZ BLOCOS QUE ACENDEM O TEXTO FRASE A FRASE.
 *
 * No PORTUGUES eles sao medidos num arquivo unico e antigo,
 * madremaria/datos/profunda-tempos.json. No es/en cada um trouxe o seu
 * <id>.<lang>.tempos.json ao lado do .m4a (22 arquivos: os dez blocos mais
 * entrada-apresentacao, vezes dois idiomas).
 *
 * O portao NAO cobra tempos.json de quem nao esta aqui: o ritual e a carta de
 * entrada nunca tiveram realce por frase, e cobrar arquivo que nunca existiu
 * seria inventar pendencia. O que ele faz e o inverso, e e o que importa: TODO
 * <id>.<lang>.tempos.json que EXISTIR no disco e conferido — duracao, trechos, e
 * o texto emendado contra o bloco DAQUELE idioma.
 *
 * Essa ultima checagem e a que pega o erro caro: um tempos.es.json medido do
 * audio PORTUGUES teria duracao positiva e segundos em ordem, passaria por tudo,
 * e acenderia a frase errada enquanto a voz diz outra — pior que nao acender.
 *
 * Esta lista serve de sanidade (os dez que tem tempo no PT continuam tendo) e de
 * endereco para quem for ler a doutrina do realce em datos/profunda.js. */
const COM_TEMPO_MEDIDO = Object.freeze([
  'profunda-7', 'profunda-8', 'profunda-9', 'profunda-10', 'profunda-11',
  'profunda-b1', 'profunda-b2', 'profunda-b3', 'profunda-b4', 'profunda-b5',
]);

/** O nome do arquivo de um id num idioma. PT nao leva sufixo. */
function arquivoDe(id, lang) {
  return lang === 'pt' ? `${id}.m4a` : `${id}.${lang}.m4a`;
}

/** O nome do tempos.json de um id num idioma. */
function temposDe(id, lang) {
  return lang === 'pt' ? `${id}.tempos.json` : `${id}.${lang}.tempos.json`;
}

/** Esta ausencia esta declarada? */
function ausenciaDeclarada(id, lang) {
  const grupo = AUSENTES[lang];
  return Boolean(grupo && grupo.ids.includes(id));
}

module.exports = {
  TODOS_OS_IDS,
  IDIOMAS,
  AUSENTES,
  COM_TEMPO_MEDIDO,
  arquivoDe,
  temposDe,
  ausenciaDeclarada,
};
