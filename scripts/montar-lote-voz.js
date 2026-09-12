#!/usr/bin/env node
// scripts/montar-lote-voz.js — monta o lote de gravacao ES/EN da Madre Maria.
//
// E A FONTE DA VERDADE da lista de ids traduzidos: madremaria/lib/audios.js
// (POR_IDIOMA) e test/madremaria-audio-por-idioma.test.js (IDS_TRADUZIDOS)
// apontam para este arquivo. Rode-o antes de gravar, e a saida diz exatamente
// o que gravar e o que ficou de fora, com o motivo.
//
//   node --require ./test/setup.js scripts/montar-lote-voz.js
//   -> C:/tmp/lote-voz.json, consumido por gerar-voz.py no servidor
//
// USA A PORTA OFICIAL DO APP (getRitual / blocosDaVariante / t + setIdiomaMadre),
// nunca le os arquivos de traducao na mao. datos/traduzir.js funde PT + idioma
// no momento da chamada, e e esse texto fundido que a tela mostra — ler o mapa
// cru daria um texto que ninguem ve.
//
// TRES ARMADILHAS QUE ISTO JA EVITOU (12/09/2026), e por isso o arquivo existe:
//
// 1. A PORTA ERRADA DEVOLVE PORTUGUES EM SILENCIO. `bloqueDe(id)` le o array
//    congelado no import e ignora o idioma; `blocosDaVariante()` (a que a TELA
//    usa, LeituraProfundaScreen.js:323) aplica. Usar a primeira geraria 10
//    audios da Madre falando portugues com nome .es/.en.
// 2. POR ISSO A CHECAGEM CONTRA O PT. Se o texto "traduzido" volta IGUAL ao
//    portugues, nao ha traducao — e fallback. Gravar assim custa credito e
//    produz um audio que mente. A checagem disparou 12 vezes no primeiro uso.
// 3. O NOME DA CHAVE NAO SE ADIVINHA. E `entrada.presenca.texto`, nao
//    `entrada.presenca`. Uma chave errada sai como "sem traducao" e o audio
//    simplesmente nao e gravado, sem erro nenhum.
//
// carta-4/5/6 NAO entram, e nao por esquecimento: sao as tres unicas gravacoes
// ORIGINAIS do app — a voz do proprio dono (datos/lenormand.js:6). Ver o
// cabecalho de madremaria/lib/audios.js.
const fs = require('fs');

const textos = require('../madremaria/datos/textos.js');
const rituais = require('../madremaria/datos/rituais.js');
const lenormand = require('../madremaria/datos/lenormand.js');
const profunda = require('../madremaria/datos/profunda.js');

const achatar = (t) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
const lote = [];
const semTexto = [];

// --- o texto em PT, para comparar (ver armadilha 2) ---------------------
textos.setIdiomaMadre('pt');

const IDS_RITUAL = (rituais.IDS_RITUAIS || []).slice();
const CARTAS_COM_AUDIO = [
  'lenormand-32', 'lenormand-21', 'lenormand-22',
  'lenormand-33', 'lenormand-35', 'lenormand-16',
];
const getFigura = lenormand.cartaLenormandPorId;

// blocosDaVariante() e a porta que a tela usa — ver armadilha 1.
const blocosNoIdioma = () => [
  ...profunda.blocosDaVariante('a'),
  ...profunda.blocosDaVariante('b'),
];

const CHAVES_AVULSAS = {
  'entrada-apresentacao': { chave: 'entrada.apresentacao', tempos: true },
  'entrada-presenca': { chave: 'entrada.presenca.texto', tempos: false },
  'entrada-anuncio-extra': { chave: 'entrada.extra.anuncio', tempos: false },
  'entrada-anuncio-estrela': { chave: 'entrada.estrela.anuncio', tempos: false },
};

const ptRitual = {};
for (const id of IDS_RITUAL) ptRitual[id] = achatar(rituais.getRitual(id).abertura);
const ptCarta = {};
for (const id of CARTAS_COM_AUDIO) ptCarta[id] = achatar(getFigura(id).leitura);
const ptBloco = blocosNoIdioma().map((b) => achatar(b.texto));
const IDS_BLOCO = blocosNoIdioma().map((b) => b.audio || b.id);
const ptAvulsa = {};
for (const [id, { chave }] of Object.entries(CHAVES_AVULSAS)) ptAvulsa[id] = achatar(textos.t(chave));

// --- agora cada idioma --------------------------------------------------
for (const lang of ['es', 'en']) {
  textos.setIdiomaMadre(lang);

  const guarda = (id, texto, ptRef, comTempos) => {
    const limpo = achatar(texto);
    if (!limpo) { semTexto.push(`${id}.${lang} (vazio)`); return; }
    if (limpo === ptRef) { semTexto.push(`${id}.${lang} (igual ao PT = sem traducao)`); return; }
    lote.push({ id, lang, texto: limpo, comTempos });
  };

  for (const id of IDS_RITUAL) {
    guarda(`ritual-${id}`, rituais.getRitual(id).abertura, ptRitual[id], false);
  }
  for (const id of CARTAS_COM_AUDIO) {
    guarda(`entrada-${id}`, getFigura(id).leitura, ptCarta[id], false);
  }
  const blocos = blocosNoIdioma();
  for (let i = 0; i < blocos.length; i += 1) {
    guarda(IDS_BLOCO[i], blocos[i].texto, ptBloco[i], true);
  }
  for (const [id, { chave, tempos }] of Object.entries(CHAVES_AVULSAS)) {
    guarda(id, textos.t(chave), ptAvulsa[id], tempos);
  }
}

textos.setIdiomaMadre('pt');

const chars = lote.reduce((s, i) => s + i.texto.length, 0);
console.log(`no lote: ${lote.length} audios`);
console.log(`caracteres: ${chars} (custo no ElevenLabs)`);
console.log(`com tempos (o texto acende na tela): ${lote.filter((i) => i.comTempos).length}`);

if (semTexto.length) {
  console.log(`\nFICAM DE FORA (${semTexto.length}):`);
  semTexto.forEach((s) => console.log('   ' + s));
}

const destino = process.argv[2] || 'C:/tmp/lote-voz.json';
fs.writeFileSync(destino, JSON.stringify(lote, null, 1));
console.log(`\nlote em ${destino}`);
