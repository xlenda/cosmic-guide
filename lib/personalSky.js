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

// Leituras simbólicas por tipo de aspecto — tom honesto do app (tradição
// astrológica como espelho de reflexão, nunca previsão garantida).
// {t} = planeta em trânsito (hoje), {n} = planeta natal da pessoa.
const ASPECT_MEANING = {
  Conjunção: '{t} de hoje se soma ao seu {n} natal — intensidade extra nessa área, boa pra usar com intenção.',
  Sextil: '{t} de hoje abre uma porta suave pro seu {n} natal — oportunidade leve, basta dar o primeiro passo.',
  Quadratura: '{t} de hoje tensiona seu {n} natal — atrito que convida a um ajuste, não a uma briga.',
  Trígono: '{t} de hoje flui em harmonia com seu {n} natal — essa área tende a andar com menos esforço.',
  Oposição: '{t} de hoje puxa na direção oposta ao seu {n} natal — dia de equilibrar os dois lados em vez de escolher um.',
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

// birth: { date: 'YYYY-MM-DD', time: 'HH:MM' | null }. Retorna os até `max`
// aspectos mais exatos (menor orbe primeiro) entre o céu de HOJE e o mapa
// natal, cada um com o texto simbólico pronto — ou null (sem dado/motor).
// Sem hora de nascimento, a posição natal da Lua é a de meio-dia (aproximação
// clássica de mapa sem hora) — os planetas lentos não mudam no dia.
export function personalSkyToday(birth, max = 3) {
  if (!birth || !birth.date) return null;
  const natal = planetPositions(birth.date, birth.time || undefined);
  const today = planetPositions(todayStr());
  if (!natal || !today) return null;

  const found = [];
  for (const t of today) {
    for (const n of natal) {
      const sep = angularSeparation(t.longitude, n.longitude);
      for (const { type, angle, orb } of ASPECTS_TABLE) {
        const delta = Math.abs(sep - angle);
        if (delta <= orb) {
          found.push({
            transitPlanet: t.planet,
            natalPlanet: n.planet,
            aspectType: type,
            orb: delta,
            text: ASPECT_MEANING[type].replace('{t}', t.planet).replace('{n}', n.planet),
          });
          break;
        }
      }
    }
  }
  found.sort((a, b) => a.orb - b.orb);
  return found.slice(0, max);
}
