// Mapa estatico id -> arte da carta do baralho cigano.
//
// Mesma razao do lib/imagenes.js (tarô) e do lib/audios.js: o Metro so resolve
// require com caminho ESTATICO. Template string nao funciona em React Native.
//
// AS ARTES: geradas com gemini-3-pro-image a partir da cena descrita em
// datos/lenormand.js, no estilo da marca — gravura de buril em carmim sobre
// noite, detalhes em latao, e o fio vermelho entrando por uma borda do quadro
// e saindo pela outra. O fio NUNCA tem ponta visivel dentro da arte: ponta
// sugere fim, fim sugere desfecho, e este app nao promete desfecho.
//
// O prompt e o processo estao em scripts/gerar-carta.sh (roda na VPS, onde a
// chave vive; a chave nunca entra no repositorio).
const ARTES = {
  'lenormand-01': require('../../assets/madremaria/lenormand/lenormand-01.jpg'), // O Cavaleiro
  'lenormand-06': require('../../assets/madremaria/lenormand/lenormand-06.jpg'), // As Nuvens
  'lenormand-24': require('../../assets/madremaria/lenormand/lenormand-24.jpg'), // O Coração

  // AS CARTAS DAS DUAS TIRAGENS DE ENTRADA (08/09): geradas no mesmo estilo
  // (gravura carmim sobre noite, fio atravessando o quadro sem ponta) com o
  // gerador gratuito da casa (Cloudflare flux-1-schnell, ~/.claude/zeus-imagem.js)
  // e enquadradas na moldura de papel das tres originais (816x1312, margem 75).
  'lenormand-32': require('../../assets/madremaria/lenormand/lenormand-32.jpg'), // A Lua (extra da A)
  'lenormand-21': require('../../assets/madremaria/lenormand/lenormand-21.jpg'), // A Montanha
  'lenormand-22': require('../../assets/madremaria/lenormand/lenormand-22.jpg'), // Os Caminhos
  'lenormand-33': require('../../assets/madremaria/lenormand/lenormand-33.jpg'), // A Chave
  'lenormand-35': require('../../assets/madremaria/lenormand/lenormand-35.jpg'), // A Âncora (extra da B)
  'lenormand-16': require('../../assets/madremaria/lenormand/lenormand-16.jpg'), // As Estrelas (estrela da B)
};

/** Devolve a arte, ou null. Null quer dizer "desenhe o verso", nunca um quadrado vazio. */
export function arteDaCartaCigana(id) {
  if (!id) return null;
  return ARTES[id] ?? null;
}

export function temArte(id) {
  return Boolean(arteDaCartaCigana(id));
}

export default ARTES;
