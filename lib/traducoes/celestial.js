// lib/traducoes/celestial.js
// Textos de activeCelestialEvents(), nos três idiomas.
//
// POR QUE EXISTE (01/08/2026): a Home DESLIGAVA o subtítulo do Calendário em
// espanhol e inglês — o comentário de HomeScreen.js dizia, com todas as
// letras, "melhor a frase genérica do que a frase híbrida". Estava certo como
// paliativo e errado como destino: o gringo perdia a informação em vez de
// recebê-la. Traduzido aqui, o bloco pode voltar a aparecer nos três.
//
// E UMA CORREÇÃO DE CONTEÚDO junto: o detalhe da Lua Cheia dizia "tradição de
// colher, celebrar". É o mesmo engano que lib/lunarCalendar.js e o cartão do
// horóscopo já tinham corrigido ontem — Plínio (Naturalis Historia XVIII.321)
// põe colher-para-guardar na MINGUANTE, e Columela (XI.2.85) põe semeadura na
// cheia. O app não pode se contradizer de uma tela para a outra sobre a mesma
// fonte, e este arquivo era o último lugar onde a versão errada sobrevivia.
export const CELESTIAL_TXT = {
  pt: {
    mercurioTitulo: 'Mercúrio retrógrado',
    mercurioAte: 'Até {data} — época de revisar, reler e reconferir antes de assinar qualquer coisa.',
    mercurioSemData: 'Época de revisar, reler e reconferir antes de assinar qualquer coisa.',
    luaHoje: '{nome} hoje',
    luaEmDias: '{nome} em {n} dia',
    luaEmDiasPlural: '{nome} em {n} dias',
    luaCheiaDetalhe: 'Pico de luz do ciclo. E ao contrário da fama: colher para guardar é da minguante (Plínio, XVIII.321) — na cheia, Columela semeia.',
    luaNovaDetalhe: 'Começo de ciclo — o ponto zero de todo calendário lunisolar antigo.',
    temporadaTitulo: 'Temporada de {signo}',
    temporadaDetalhe: 'O Sol atravessa {signo} ({elemento}) até {dia}/{mes} — a energia coletiva do momento.',
  },
  es: {
    mercurioTitulo: 'Mercurio retrógrado',
    mercurioAte: 'Hasta {data} — época de revisar, releer y reconfirmar antes de firmar cualquier cosa.',
    mercurioSemData: 'Época de revisar, releer y reconfirmar antes de firmar cualquier cosa.',
    luaHoje: '{nome} hoy',
    luaEmDias: '{nome} en {n} día',
    luaEmDiasPlural: '{nome} en {n} días',
    luaCheiaDetalhe: 'Pico de luz del ciclo. Y al contrario de la fama: cosechar para guardar es de la menguante (Plinio, XVIII.321) — en la llena, Columela siembra.',
    luaNovaDetalhe: 'Comienzo de ciclo — el punto cero de todo calendario lunisolar antiguo.',
    temporadaTitulo: 'Temporada de {signo}',
    temporadaDetalhe: 'El Sol atraviesa {signo} ({elemento}) hasta el {dia}/{mes} — la energía colectiva del momento.',
  },
  en: {
    mercurioTitulo: 'Mercury retrograde',
    mercurioAte: 'Until {data} — a time to review, reread and double-check before signing anything.',
    mercurioSemData: 'A time to review, reread and double-check before signing anything.',
    luaHoje: '{nome} today',
    luaEmDias: '{nome} in {n} day',
    luaEmDiasPlural: '{nome} in {n} days',
    luaCheiaDetalhe: 'Peak light of the cycle. And contrary to its reputation: harvesting to store belongs to the waning moon (Pliny, XVIII.321) — at the full moon, Columella sows.',
    luaNovaDetalhe: 'Start of the cycle — the zero point of every ancient lunisolar calendar.',
    temporadaTitulo: '{signo} season',
    temporadaDetalhe: 'The Sun crosses {signo} ({elemento}) until {mes}/{dia} — the collective mood of the moment.',
  },
};

// Nome da fase da Lua e do elemento por idioma. As CHAVES seguem em português
// (são identificadores internos, iguais aos de lib/lunarCalendar.js).
export const FASE_NOME = {
  pt: { 'Lua Cheia': 'Lua Cheia', 'Lua Nova': 'Lua Nova' },
  es: { 'Lua Cheia': 'Luna Llena', 'Lua Nova': 'Luna Nueva' },
  en: { 'Lua Cheia': 'Full Moon', 'Lua Nova': 'New Moon' },
};

export const ELEMENTO_NOME = {
  pt: { fogo: 'Fogo', terra: 'Terra', ar: 'Ar', 'água': 'Água' },
  es: { fogo: 'Fuego', terra: 'Tierra', ar: 'Aire', 'água': 'Agua' },
  en: { fogo: 'Fire', terra: 'Earth', ar: 'Air', 'água': 'Water' },
};

export function txtCelestial(lang = 'pt') {
  return CELESTIAL_TXT[lang] || CELESTIAL_TXT.pt;
}
