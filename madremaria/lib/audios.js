// Mapa estatico de audio -> require do arquivo.
//
// Mesma razao do lib/imagenes.js: o Metro so resolve require com caminho
// ESTATICO. `require('../../assets/madremaria/audio/' + id + '.m4a')` nao funciona em React
// Native — a resolucao acontece no build, nao em runtime.
//
// FORMATO: os originais do dono sao .ogg, que o iOS NAO toca. Foram convertidos
// para .m4a (AAC), que toca nas tres plataformas — iOS, Android e web. A
// conversao esta registrada em scripts/converter-audios.sh para poder ser
// refeita quando chegarem as outras 33 cartas.
//
// IDIOMA: o mapa de baixo (POR_IDIOMA) e a razao deste import. textos.js nao
// importa nada de lib/, entao nao ha ciclo; e ele so puxa os dicionarios, que
// a Madre ja carrega em toda tela.
import { IDIOMA_PADRAO, idiomaMadre } from '../datos/textos';

const AUDIOS = {
  // AS TRES CARTAS da leitura de entrada (screens/LeituraDeEntradaScreen.js).
  'carta-4': require('../../assets/madremaria/audio/carta-4.m4a'),
  'carta-5': require('../../assets/madremaria/audio/carta-5.m4a'),
  'carta-6': require('../../assets/madremaria/audio/carta-6.m4a'),

  // OS CINCO BLOCOS DA LEITURA PROFUNDA — o carrossel que vem logo depois das
  // tres cartas (screens/LeituraProfundaScreen.js), na MESMA voz clonada. Sao
  // 6,7 minutos ao todo, e o texto de cada um esta em datos/profunda.js, palavra
  // por palavra: quem esta sem fone le tudo e nao perde nada.
  //
  // A numeracao salta de 6 para 7 porque ela e a do FUNIL de WhatsApp, onde os
  // audios 1 a 6 sao a abertura e as tres cartas. Renumerar aqui para 1..5
  // quebraria a correspondencia com os arquivos que o dono grava e envia.
  'profunda-7': require('../../assets/madremaria/audio/profunda-7.m4a'),
  'profunda-8': require('../../assets/madremaria/audio/profunda-8.m4a'),
  'profunda-9': require('../../assets/madremaria/audio/profunda-9.m4a'),
  'profunda-10': require('../../assets/madremaria/audio/profunda-10.m4a'),

  // O BLOCO 11 — O FECHO. Um arquivo so desde 11/09.
  //
  // Ate aqui eram tres (mulher/homem/neutro), porque uma frase do fecho afirmava
  // quem ela passa a ser depois das treze luas e aquela frase nao falava com
  // todo mundo. O dono cortou: a versao neutra virou a unica, e ela se sustenta
  // sozinha para qualquer pessoa ("quem sabe isso ja nao e a mesma pessoa").
  // Tres audios de ~4,6 min viraram um; a tabela de tempos tambem.
  'profunda-11': require('../../assets/madremaria/audio/profunda-11.m4a'),

  // A VOZ NOS GESTOS (03/09) — a abertura de cada ritual de datos/rituais.js,
  // PALAVRA POR PALAVRA (texto ja auditado pela doutrina; o audio nao diz nada
  // que a tela nao diga), na mesma voz clonada do funil. A retencao do funil
  // vem da voz; o dia do app ganha a mesma voz. Chave = 'ritual-' + ritual.id.
  'ritual-cafe': require('../../assets/madremaria/audio/ritual-cafe.m4a'),
  'ritual-mao': require('../../assets/madremaria/audio/ritual-mao.m4a'),
  'ritual-cartas': require('../../assets/madremaria/audio/ritual-cartas.m4a'),
  'ritual-sonho': require('../../assets/madremaria/audio/ritual-sonho.m4a'),
  'ritual-caminhada': require('../../assets/madremaria/audio/ritual-caminhada.m4a'),
  'ritual-canto': require('../../assets/madremaria/audio/ritual-canto.m4a'),
  'ritual-respiro': require('../../assets/madremaria/audio/ritual-respiro.m4a'),

  // AS CARTAS DAS DUAS TIRAGENS DE ENTRADA (08/09) — a `leitura` de cada carta
  // de datos/lenormand.js lida palavra por palavra na voz clonada. A extra da
  // A (A Lua) e as cinco da B. As tres da A seguem com carta-4/5/6, gravadas.
  // Chave = 'entrada-' + id da carta, NUNCA o campo `audio` do baralho (que e
  // a ordem da narracao futura do dono — ver o cabecalho de datos/lenormand.js).
  'entrada-lenormand-32': require('../../assets/madremaria/audio/entrada-lenormand-32.m4a'),
  'entrada-lenormand-21': require('../../assets/madremaria/audio/entrada-lenormand-21.m4a'),
  'entrada-lenormand-22': require('../../assets/madremaria/audio/entrada-lenormand-22.m4a'),
  'entrada-lenormand-33': require('../../assets/madremaria/audio/entrada-lenormand-33.m4a'),
  'entrada-lenormand-35': require('../../assets/madremaria/audio/entrada-lenormand-35.m4a'),
  'entrada-lenormand-16': require('../../assets/madremaria/audio/entrada-lenormand-16.m4a'),

  // OS ANUNCIOS DA VOZ na entrada (08/09): a carta extra, a estrela (so na B)
  // e a pergunta de presenca antes da profunda. Transcricoes em datos/textos.js
  // ('entrada.extra.anuncio', 'entrada.estrela.anuncio', 'entrada.presenca.texto').
  'entrada-anuncio-extra': require('../../assets/madremaria/audio/entrada-anuncio-extra.m4a'),
  'entrada-anuncio-estrela': require('../../assets/madremaria/audio/entrada-anuncio-estrela.m4a'),
  'entrada-presenca': require('../../assets/madremaria/audio/entrada-presenca.m4a'),
  'entrada-apresentacao': require('../../assets/madremaria/audio/entrada-apresentacao.m4a'), // "Sou eu de novo, a Madre Maria"
  // A APRESENTACAO (primeira tela) nao tem audio proprio desde 10/09: e o
  // VIDEO dela (assets/video/madre-maria.mp4, screens/ApresentacaoScreen.js).

  // A LEITURA PROFUNDA B (08/09) — cinco blocos, um audio cada, fecho neutro.
  // Texto palavra por palavra em datos/profunda.js (BLOQUES_PROFUNDA_B) e os
  // tempos por frase em datos/profunda-tempos.json, os dois do mesmo commit.
  'profunda-b1': require('../../assets/madremaria/audio/profunda-b1.m4a'),
  'profunda-b2': require('../../assets/madremaria/audio/profunda-b2.m4a'),
  'profunda-b3': require('../../assets/madremaria/audio/profunda-b3.m4a'),
  'profunda-b4': require('../../assets/madremaria/audio/profunda-b4.m4a'),
  'profunda-b5': require('../../assets/madremaria/audio/profunda-b5.m4a'),
};

/* =====================================================================
 * A MESMA VOZ NOS TRES IDIOMAS (12/09)
 * =====================================================================
 * O mapa de cima e o PORTUGUES. Espanhol e ingles moram aqui embaixo, um
 * mapa por idioma, chaveados pelo MESMO id - `ritual-cafe` em POR_IDIOMA.es
 * e o `ritual-cafe.es.m4a`, nao um id novo. Assim nenhuma tela precisa saber
 * que existe idioma: ela segue passando o id que sempre passou.
 *
 * POR QUE NAO UMA CHAVE SO ('ritual-cafe.es'): as telas montam o id na mao
 * ('ritual-' + ritual.id, carta.audio, bloco.audio). Cada uma teria de
 * aprender a colar o idioma no fim - sete lugares para errar, e o que erra
 * fica MUDO, que e o defeito que ninguem ve no QA.
 *
 * POR QUE 54 LINHAS ESCRITAS A MAO, e nao um laco: pelo mesmo motivo do mapa
 * de cima - o Metro resolve require no BUILD, com caminho literal. Montar
 * 'audio/' + id + '.' + lang + '.m4a' nao resolve nada.
 *
 * A LISTA e a saida de _montar-lote.js, que colhe o texto pela mesma porta que
 * a tela usa (getRitual / blocosDaVariante / t) - sao os 27 ids que tem
 * traducao de verdade, em ES e EN. A ordem espelha a do mapa PT, para as duas
 * se lerem lado a lado.
 *
 * carta-4/5/6 NAO estao aqui, e NAO devem entrar por geracao: sao as TRES
 * UNICAS gravacoes ORIGINAIS deste app - a voz do proprio dono, gravada por
 * ele (datos/lenormand.js:6 aponta a origem: C:\TAROT\AUDIO PORTUGUES\4,5,6.ogg).
 * Todo o resto do app e a voz clonada. Gerar essas tres em ES/EN poria a voz
 * sintetica no lugar da voz dele no meio da leitura de entrada, e ninguem
 * perceberia a troca: mesmo nome de arquivo, duracao parecida.
 * Fora do portugues elas ficam MUDAS (o fallback abaixo devolve null e o botao
 * some). E ausencia honesta, nao defeito - so o dono pode regrava-las.
 * ===================================================================== */
const POR_IDIOMA = {
  es: {
    'ritual-cafe': require('../../assets/madremaria/audio/ritual-cafe.es.m4a'),
    'ritual-mao': require('../../assets/madremaria/audio/ritual-mao.es.m4a'),
    'ritual-cartas': require('../../assets/madremaria/audio/ritual-cartas.es.m4a'),
    'ritual-sonho': require('../../assets/madremaria/audio/ritual-sonho.es.m4a'),
    'ritual-caminhada': require('../../assets/madremaria/audio/ritual-caminhada.es.m4a'),
    'ritual-canto': require('../../assets/madremaria/audio/ritual-canto.es.m4a'),
    'ritual-respiro': require('../../assets/madremaria/audio/ritual-respiro.es.m4a'),
    'entrada-lenormand-32': require('../../assets/madremaria/audio/entrada-lenormand-32.es.m4a'),
    'entrada-lenormand-21': require('../../assets/madremaria/audio/entrada-lenormand-21.es.m4a'),
    'entrada-lenormand-22': require('../../assets/madremaria/audio/entrada-lenormand-22.es.m4a'),
    'entrada-lenormand-33': require('../../assets/madremaria/audio/entrada-lenormand-33.es.m4a'),
    'entrada-lenormand-35': require('../../assets/madremaria/audio/entrada-lenormand-35.es.m4a'),
    'entrada-lenormand-16': require('../../assets/madremaria/audio/entrada-lenormand-16.es.m4a'),
    'entrada-anuncio-extra': require('../../assets/madremaria/audio/entrada-anuncio-extra.es.m4a'),
    'entrada-anuncio-estrela': require('../../assets/madremaria/audio/entrada-anuncio-estrela.es.m4a'),
    'entrada-presenca': require('../../assets/madremaria/audio/entrada-presenca.es.m4a'),
    'entrada-apresentacao': require('../../assets/madremaria/audio/entrada-apresentacao.es.m4a'),
    'profunda-7': require('../../assets/madremaria/audio/profunda-7.es.m4a'),
    'profunda-8': require('../../assets/madremaria/audio/profunda-8.es.m4a'),
    'profunda-9': require('../../assets/madremaria/audio/profunda-9.es.m4a'),
    'profunda-10': require('../../assets/madremaria/audio/profunda-10.es.m4a'),
    'profunda-11': require('../../assets/madremaria/audio/profunda-11.es.m4a'),
    'profunda-b1': require('../../assets/madremaria/audio/profunda-b1.es.m4a'),
    'profunda-b2': require('../../assets/madremaria/audio/profunda-b2.es.m4a'),
    'profunda-b3': require('../../assets/madremaria/audio/profunda-b3.es.m4a'),
    'profunda-b4': require('../../assets/madremaria/audio/profunda-b4.es.m4a'),
    'profunda-b5': require('../../assets/madremaria/audio/profunda-b5.es.m4a'),
  },
  en: {
    'ritual-cafe': require('../../assets/madremaria/audio/ritual-cafe.en.m4a'),
    'ritual-mao': require('../../assets/madremaria/audio/ritual-mao.en.m4a'),
    'ritual-cartas': require('../../assets/madremaria/audio/ritual-cartas.en.m4a'),
    'ritual-sonho': require('../../assets/madremaria/audio/ritual-sonho.en.m4a'),
    'ritual-caminhada': require('../../assets/madremaria/audio/ritual-caminhada.en.m4a'),
    'ritual-canto': require('../../assets/madremaria/audio/ritual-canto.en.m4a'),
    'ritual-respiro': require('../../assets/madremaria/audio/ritual-respiro.en.m4a'),
    'entrada-lenormand-32': require('../../assets/madremaria/audio/entrada-lenormand-32.en.m4a'),
    'entrada-lenormand-21': require('../../assets/madremaria/audio/entrada-lenormand-21.en.m4a'),
    'entrada-lenormand-22': require('../../assets/madremaria/audio/entrada-lenormand-22.en.m4a'),
    'entrada-lenormand-33': require('../../assets/madremaria/audio/entrada-lenormand-33.en.m4a'),
    'entrada-lenormand-35': require('../../assets/madremaria/audio/entrada-lenormand-35.en.m4a'),
    'entrada-lenormand-16': require('../../assets/madremaria/audio/entrada-lenormand-16.en.m4a'),
    'entrada-anuncio-extra': require('../../assets/madremaria/audio/entrada-anuncio-extra.en.m4a'),
    'entrada-anuncio-estrela': require('../../assets/madremaria/audio/entrada-anuncio-estrela.en.m4a'),
    'entrada-presenca': require('../../assets/madremaria/audio/entrada-presenca.en.m4a'),
    'entrada-apresentacao': require('../../assets/madremaria/audio/entrada-apresentacao.en.m4a'),
    'profunda-7': require('../../assets/madremaria/audio/profunda-7.en.m4a'),
    'profunda-8': require('../../assets/madremaria/audio/profunda-8.en.m4a'),
    'profunda-9': require('../../assets/madremaria/audio/profunda-9.en.m4a'),
    'profunda-10': require('../../assets/madremaria/audio/profunda-10.en.m4a'),
    'profunda-11': require('../../assets/madremaria/audio/profunda-11.en.m4a'),
    'profunda-b1': require('../../assets/madremaria/audio/profunda-b1.en.m4a'),
    'profunda-b2': require('../../assets/madremaria/audio/profunda-b2.en.m4a'),
    'profunda-b3': require('../../assets/madremaria/audio/profunda-b3.en.m4a'),
    'profunda-b4': require('../../assets/madremaria/audio/profunda-b4.en.m4a'),
    'profunda-b5': require('../../assets/madremaria/audio/profunda-b5.en.m4a'),
  },
};

/** Devolve o modulo do audio no IDIOMA ATIVO, ou null.
 *  Null quer dizer "nao desenhe o botao" — components/BotaoOuvir.js faz
 *  `if (!fonte ...) return null`, entao nao sobra botao morto na tela.
 *
 *  SEM GRAVACAO NO IDIOMA, NAO CAI NO PORTUGUES. Tocar o PT para quem
 *  escolheu ingles seria a Madre falando outra lingua por cima de uma tela
 *  traduzida — pior que o silencio, porque quebra a ilusao inteira em vez de
 *  so faltar. Sumir o botao ja e o comportamento da casa para audio ausente
 *  (o cabecalho deste arquivo: "Sem arquivo, o botao nao renderiza"), e a tela
 *  continua com o texto palavra por palavra, que e o que a pessoa le hoje sem
 *  fone. Nada de meia-voz.
 *
 *  Idioma novo com a tela ABERTA nao trava: MadreMariaApp.js monta a arvore
 *  com `key={lang}`, entao trocar no Perfil descarta e remonta tudo, e este
 *  resolver roda de novo. Nenhum consumidor guarda o modulo em useMemo/useState
 *  — BotaoOuvir chama audioDaCarta a cada render e as telas so passam o id. */
export function audioDaCarta(id) {
  if (!id) return null;
  const lang = idiomaMadre();
  if (lang !== IDIOMA_PADRAO) return POR_IDIOMA[lang]?.[id] ?? null;
  return AUDIOS[id] ?? null;
}

export function temAudio(id) {
  return Boolean(audioDaCarta(id));
}

export default AUDIOS;
