// lib/personalSky.js
// "Céu de hoje pra você" — aspectos REAIS entre os planetas de hoje
// (trânsitos) e as posições natais da pessoa (mapa de nascimento). É o que
// separa horóscopo genérico de leitura pessoal: dois usuários com signos
// iguais mas nascimentos diferentes veem céus diferentes. 100% matemática
// (astronomy-engine via lib/signs.js), zero IA, zero rede — mesma política
// "nunca fabricar": sem data de nascimento ou sem motor, devolve null.
import { planetPositions } from './signs';
import { textoDoTransito } from './traducoes/personalSky';

// Mesma tabela de orbes de lib/signs.js (consenso Wikipedia/Astrotheme) —
// duplicada aqui porque signs.js não exporta a tabela, e trânsito-vs-natal
// costuma usar orbes um pouco mais apertados que céu-vs-céu (menos ruído).
const ASPECTS_TABLE = [
  { type: 'Conjunção', angle: 0, orb: 6 },
  { type: 'Sextil', angle: 60, orb: 4 },
  { type: 'Quadratura', angle: 90, orb: 6 },
  { type: 'Trígono', angle: 120, orb: 6 },
  { type: 'Oposição', angle: 180, orb: 6 },
];

// ORBE ESCALONADO POR VELOCIDADE DO PLANETA EM TRÂNSITO.
//
// Antes o mesmo orbe valia pro trânsito da Lua e pro de Plutão, e como a
// ordenação final era só por menor orbe, os trânsitos lentíssimos entravam no
// topo e ficavam lá: num teste com quatro nascimentos, "Plutão de hoje se soma
// ao seu Vênus natal" aparecia em 30/07, 30/08 e 30/10 de 2026 — a mesma frase
// por seis meses numa tela chamada "Céu de HOJE pra você".
//
// A convenção de orbe é escalonada justamente pra impedir que o lento domine:
// orbe maior para a Lua e os luminares, menor para os planetas lentos.
const ORB_FACTOR = {
  Lua: 1,
  Sol: 0.8, Mercúrio: 0.8, Vênus: 0.8, Marte: 0.8,
  Júpiter: 0.5, Saturno: 0.5,
  Urano: 0.25, Netuno: 0.25, Plutão: 0.25,
};

// Camada de leitura do trânsito. A prática distingue com clareza trânsito
// rápido (o "dia") de trânsito lento (o "capítulo"): ninguém apresenta um
// trânsito de Plutão como notícia do dia — apresenta como período.
const TEMPO = {
  Lua: 'rapido', Sol: 'rapido', Mercúrio: 'rapido', Vênus: 'rapido', Marte: 'rapido',
  Júpiter: 'medio', Saturno: 'medio',
  Urano: 'lento', Netuno: 'lento', Plutão: 'lento',
};

// Só a ORDEM mora aqui agora. O texto de cada camada ('de hoje', a ressalva
// do trânsito lento) mudou pra lib/traducoes/personalSky.js em 03/08/2026,
// junto com as frases de aspecto — eram a razão de o Céu de Hoje sair em
// português nos apps em espanhol e inglês.
const TEMPO_INFO = {
  rapido: { rank: 0 },
  medio: { rank: 1 },
  lento: { rank: 2 },
};

function angularSeparation(lonA, lonB) {
  const diff = Math.abs(lonA - lonB);
  return diff > 180 ? 360 - diff : diff;
}

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// birth: { date: 'YYYY-MM-DD', time: 'HH:MM' | null, city?: objeto de cidade }.
// Retorna os até `max` aspectos mais exatos (menor orbe primeiro) entre o céu
// de HOJE e o mapa natal, cada um com o texto simbólico pronto — ou null (sem
// dado/motor). Sem hora de nascimento, a posição natal da Lua é a de meio-dia
// (aproximação clássica de mapa sem hora) — os planetas lentos não mudam no dia.
//
// `birth.city` (opcional) é o que faz a hora informada ser lida como hora de
// PAREDE e virar o instante UTC certo, com horário de verão — o mesmo 3º
// argumento que BirthChartScreen passa pra moonSign/aspects. Sem ele o natal
// aqui ficaria num instante diferente do natal mostrado no Mapa Astral, que é
// exatamente o tipo de discordância entre telas que este app não pode ter.
export function personalSkyToday(birth, max = 3, lang = 'pt') {
  if (!birth || !birth.date) return null;
  const natal = planetPositions(birth.date, birth.time || undefined, birth.city || undefined);
  const today = planetPositions(todayStr());
  if (!natal || !today) return null;

  const found = [];
  for (const t of today) {
    const tempo = TEMPO[t.planet] || 'medio';
    const factor = ORB_FACTOR[t.planet] ?? 0.5;
    for (const n of natal) {
      const sep = angularSeparation(t.longitude, n.longitude);
      for (const { type, angle, orb } of ASPECTS_TABLE) {
        const delta = Math.abs(sep - angle);
        if (delta <= orb * factor) {
          found.push({
            transitPlanet: t.planet,
            natalPlanet: n.planet,
            aspectType: type,
            orb: delta,
            tempo, // 'rapido' | 'medio' | 'lento' — a tela pode usar pra separar dia de capítulo
            // O TEXTO SAI DO PACK (03/08/2026) — antes era montado aqui, com
            // ASPECT_MEANING e os nomes de planeta em português puro, então o
            // card mais lido do app saía todo em PT pra quem usava es/en.
            // As CHAVES (transitPlanet, natalPlanet, aspectType) continuam em
            // PT de propósito: são dado, e lib/transitoFase.js casa por elas.
            text: textoDoTransito({
              aspectType: type,
              planetaTransito: t.planet,
              planetaNatal: n.planet,
              tempo,
              lang,
            }),
          });
          break;
        }
      }
    }
  }
  // Ordena por CAMADA primeiro (rápido antes de lento) e só depois por orbe.
  // Sem isso, um trânsito de Netuno com orbe de 0,3° empurrava pra fora um
  // trânsito da Lua com orbe de 2° — e é o da Lua que fala do dia de hoje.
  found.sort((a, b) => {
    const ra = TEMPO_INFO[a.tempo].rank;
    const rb = TEMPO_INFO[b.tempo].rank;
    if (ra !== rb) return ra - rb;
    return a.orb - b.orb;
  });
  return found.slice(0, max);
}
