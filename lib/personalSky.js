// lib/personalSky.js
// "Céu de hoje pra você" — aspectos REAIS entre os planetas de hoje
// (trânsitos) e as posições natais da pessoa (mapa de nascimento). É o que
// separa horóscopo genérico de leitura pessoal: dois usuários com signos
// iguais mas nascimentos diferentes veem céus diferentes. 100% matemática
// (astronomy-engine via lib/signs.js), zero IA, zero rede — mesma política
// "nunca fabricar": sem data de nascimento ou sem motor, devolve null.
import { planetPositions } from './signs';

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

const TEMPO_INFO = {
  rapido: { rank: 0, quando: 'de hoje', nota: '' },
  medio: { rank: 1, quando: 'destas semanas', nota: ' É trânsito de semanas, não do dia — vale acompanhar, não decidir de imediato.' },
  lento: { rank: 2, quando: 'deste período', nota: ' É trânsito lento: dura meses e ainda volta a passar por causa das retrogradações. Leia como capítulo de vida, não como notícia do dia.' },
};

// Leituras simbólicas por tipo de aspecto — tom honesto do app (tradição
// astrológica como espelho de reflexão, nunca previsão garantida).
// {t} = planeta em trânsito, {n} = planeta natal da pessoa, {quando} = a camada
// temporal real daquele trânsito (ver TEMPO_INFO).
const ASPECT_MEANING = {
  Conjunção: '{t} {quando} se soma ao seu {n} natal — intensidade extra nessa área, boa pra usar com intenção.',
  Sextil: '{t} {quando} abre uma porta suave pro seu {n} natal — oportunidade leve, basta dar o primeiro passo.',
  Quadratura: '{t} {quando} tensiona seu {n} natal — atrito que convida a um ajuste, não a uma briga.',
  Trígono: '{t} {quando} flui em harmonia com seu {n} natal — essa área tende a andar com menos esforço.',
  Oposição: '{t} {quando} puxa na direção oposta ao seu {n} natal — momento de equilibrar os dois lados em vez de escolher um.',
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
export function personalSkyToday(birth, max = 3) {
  if (!birth || !birth.date) return null;
  const natal = planetPositions(birth.date, birth.time || undefined, birth.city || undefined);
  const today = planetPositions(todayStr());
  if (!natal || !today) return null;

  const found = [];
  for (const t of today) {
    const tempo = TEMPO[t.planet] || 'medio';
    const info = TEMPO_INFO[tempo];
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
            text:
              ASPECT_MEANING[type]
                .replace('{t}', t.planet)
                .replace('{quando}', info.quando)
                .replace('{n}', n.planet) + info.nota,
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
