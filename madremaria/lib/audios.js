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

/** Devolve o modulo do audio, ou null. Null quer dizer "nao desenhe o botao". */
export function audioDaCarta(id) {
  if (!id) return null;
  return AUDIOS[id] ?? null;
}

export function temAudio(id) {
  return Boolean(audioDaCarta(id));
}

export default AUDIOS;
