// lib/horoscopoLocalizado.js
//
// Os LOCALIZADORES do horóscopo do dia — o que traduz o que lib/dailyHoroscope.js
// calcula. Até 11/09/2026 estas funções moravam dentro de
// screens/HoroscopeScreen.js. Saíram de lá porque a Home ganhou um carrossel
// com o mesmo texto (itensDoCarrossel, embaixo), e duplicar a tradução em duas
// telas era o caminho mais curto pra Home e Horóscopo discordarem no mesmo
// idioma. Nada mudou de comportamento: é o MESMO código, importado de volta
// pela tela — test/horoscopoLocalizado.test.js compara contra uma cópia
// congelada da versão antiga.
//
// lib/dailyHoroscope.js é puro e não conhece idioma: devolve vars que podem
// ser string (nome de signo, graus) ou { i18n: 'chave' } (nome de planeta, dia
// da semana). A resolução acontece aqui, com o `t` do idioma ativo que a tela
// passa. Este módulo NÃO importa o LanguageContext de propósito — assim roda
// em teste puro (node:test) e serve a qualquer tela.
import { zodiacSigns } from '../theme';
import { nomeDoSigno } from './synastry';
import { horoscopeFor } from './dailyHoroscope';

// Mapa LITERAL (não template) pra varredura estática de
// test/i18nKeysExist.test.js enxergar cada chave.
const PHASE_LABEL_KEYS = {
  'Lua Nova': 'rituais.fase.luaNova',
  'Lua Crescente': 'rituais.fase.luaCrescente',
  'Quarto Crescente': 'rituais.fase.quartoCrescente',
  'Lua Gibosa Crescente': 'rituais.fase.gibosaCrescente',
  'Lua Cheia': 'rituais.fase.luaCheia',
  'Lua Gibosa Minguante': 'rituais.fase.gibosaMinguante',
  'Quarto Minguante': 'rituais.fase.quartoMinguante',
  'Lua Minguante': 'rituais.fase.luaMinguante',
};

const ZODIAC_NAMES = new Set(zodiacSigns.map((sign) => sign.name));

export function localizeAstroValue(value, t, lang) {
  if (value && typeof value === 'object' && value.i18n) return t(value.i18n);
  if (typeof value !== 'string') return value;
  if (ZODIAC_NAMES.has(value)) return nomeDoSigno(value, lang);
  return PHASE_LABEL_KEYS[value] ? t(PHASE_LABEL_KEYS[value]) : value;
}

export function resolveVars(vars, t, lang) {
  if (!vars) return undefined;
  const out = {};
  for (const k of Object.keys(vars)) {
    out[k] = localizeAstroValue(vars[k], t, lang);
  }
  return out;
}

// A primeira linha de LEITURA do dia (o método fica de fora) — é o corpo da
// entrada do Diário Cósmico. Sem céu calculado devolve null e o Diário não
// recebe entrada, em vez de guardar uma frase inventada para sempre.
export function resumoLocalizadoDoDia(signName, date, t, lang) {
  const leitura = horoscopeFor(signName, date);
  if (!leitura.available) return null;
  const primeiraLinha = leitura.blocks
    .flatMap((bloco) => bloco.lines)
    .find((line) => line.role !== 'metodo');
  return primeiraLinha ? t(primeiraLinha.key, resolveVars(primeiraLinha.vars, t, lang)) : null;
}

// Mesmo mapa de lib/dailyHoroscope.js — só para o chip do regente do dia
// reaproveitar o nome já traduzido em grounding.ruler.<slug>.name.
export function slugPlaneta(planeta) {
  return {
    'Sol': 'sol', 'Lua': 'lua', 'Mercúrio': 'mercurio', 'Vênus': 'venus',
    'Marte': 'marte', 'Júpiter': 'jupiter', 'Saturno': 'saturno',
  }[planeta] || 'sol';
}

// OS CARDS DO CARROSSEL DA HOME (11/09/2026) — um card por bloco de leitura:
// o título do bloco e as linhas de LEITURA (o método fica de fora, como fica
// fora da primeira vista na tela do Horóscopo) juntadas com espaço e cortadas
// em ~140 caracteres. O card é convite pra abrir a tela, não a leitura
// inteira. Sem céu calculado (available false) não há card: a Home não
// inventa horóscopo, exatamente como a tela não escreve sem efeméride.
const CORTE = 140;

export function itensDoCarrossel(signName, date, t, lang) {
  const leitura = horoscopeFor(signName, date);
  if (!leitura.available) return [];
  return leitura.blocks.map((bloco) => {
    const texto = bloco.lines
      .filter((line) => line.role !== 'metodo')
      .map((line) => t(line.key, resolveVars(line.vars, t, lang)))
      .join(' ');
    return {
      id: bloco.id,
      titulo: t(bloco.titleKey),
      texto: texto.length > CORTE ? `${texto.slice(0, CORTE).trimEnd()}…` : texto,
    };
  });
}
