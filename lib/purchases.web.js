// lib/purchases.web.js
// A LOJA NÃO EXISTE NA WEB — e este arquivo existe pra o bundle da web nem
// saber que ela existe.
//
// O require tardio de react-native-purchases em lib/purchases.js impede a
// EXECUÇÃO na web, não o EMPACOTAMENTO: o Metro resolve `require` com string
// literal estaticamente, então o SDK entrava no chunk do paywall junto com
// @revenuecat/purchases-js-hybrid-mappings (~750 KB já minificados) — ~200 KB
// de gzip baixados no exato momento da conversão, de código que nunca roda.
// Medido em 19/08/2026: PlanosScreen-*.js saiu de 21 KB pra 929 KB.
//
// Extensão de plataforma é o conserto de verdade: o Metro prefere .web.js na
// resolução da web e .js no nativo, então quem importa '../lib/purchases'
// continua igual e o SDK simplesmente não é referenciado do lado da web.
//
// Os quatro nomes existem só pro import da tela continuar válido; nenhum é
// chamado, porque LOJA_ATIVA é false e a web vende pela Hotmart dentro da
// própria PlanosScreen.
export const LOJA_ATIVA = false;

export async function carregarLoja() {
  return null;
}

export async function comprarPlano() {
  return null;
}

export async function restaurarCompras() {
  return { ativo: false, expiraEm: null };
}
