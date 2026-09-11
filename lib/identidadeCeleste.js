// lib/identidadeCeleste.js
// A "identidade celeste" da pessoa — Sol, Lua, Ascendente e a distribuição de
// elementos — pronta pra Home mostrar no cabeçalho SEM a pessoa abrir o Mapa
// de Nascimento (decidido em 11/09/2026: quem já preencheu o Mapa via o próprio
// céu só lá dentro; a Home, tela mais visitada, não dizia nada sobre ela).
//
// DE ONDE VEM CADA DADO — nada aqui é conta nova, é a MESMA conta do Mapa:
//   - date/time/city: 'birthChartSolo' via readSecureItemWithMirror
//     (lib/birthData.js) — SecureStore no celular, espelho '-mirror' no
//     AsyncStorage na web. É exatamente o que BirthChartScreen grava e relê.
//   - sun/moon/asc: signoFromDate / moonSign / ascendantSign de lib/signs.js,
//     chamados com os MESMOS argumentos de BirthChartScreen.buildChart
//     (inclusive `city || undefined` na Lua e a cidade inteira como 5º
//     argumento do Ascendente, que é o que resolve horário de verão). Se a
//     Home e o Mapa divergissem num signo, o app se contradiria em duas telas
//     vizinhas — copiar a semântica, não reinventar, é a proteção.
//   - elementos: distribuicaoDeElementos (lib/elementos.js), a única % que a
//     doutrina permite (contagem × 10, refazível à mão).
//
// NUNCA FABRICA: sem 'birthChartSolo' salvo, JSON inválido ou sem `date`, o
// retorno é null e a Home mostra o convite pra preencher o Mapa. Ascendente
// sem hora E cidade é null (o motor já garante isso; aqui só repetimos a
// condição de buildChart pra nem chamar). Esta função nunca lança: um erro de
// storage ou de motor vira null, nunca um cabeçalho quebrado.
import { readSecureItemWithMirror } from './birthData';
import { signoFromDate, moonSign, ascendantSign } from './signs';
import { distribuicaoDeElementos } from './elementos';

// Promise<null | { date, time, city, sun, moon, asc, elementos }>
//   sun:  nome canônico PT do signo (ex.: 'Touro') — quem exibe localiza.
//   moon: idem ou null; asc: idem, e null sem hora+cidade.
//   elementos: o objeto inteiro de distribuicaoDeElementos ({ pct, dominante,
//   contagem, planetasPorElemento, total }) ou null.
export async function carregarIdentidade() {
  try {
    const raw = await readSecureItemWithMirror('birthChartSolo');
    if (!raw) return null;
    const salvo = JSON.parse(raw);
    if (!salvo || !salvo.date) return null;

    const date = salvo.date;
    const time = salvo.time || null;
    const city = salvo.city || null;

    const sun = signoFromDate(date);
    if (!sun) return null; // data salva mas inválida (ex.: 30/02) — o motor recusa, e nós também.

    return {
      date,
      time,
      city,
      sun,
      moon: moonSign(date, time, city || undefined)?.name || null,
      asc: time && city ? ascendantSign(date, time, city.lat, city.lon, city)?.name || null : null,
      elementos: distribuicaoDeElementos(date, time, city || undefined),
    };
  } catch {
    return null;
  }
}
