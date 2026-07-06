// Astrologia do casal — lógica de sinastria/compatibilidade portada de
// c:/tmp/gilfforever/web/lib/signs.es.js (mesma matemática de PAIRS/PCT, mesmos
// limiares de data), com o conteúdo em português já usado no restante do app
// (hub/horóscopo web usam esses mesmos nomes de signo, elementos e textos).
// Módulo puro, síncrono e determinístico — sem localStorage/window/document,
// portanto sem nenhuma dependência de browser a remover para rodar no React Native.

export const SIGNS = [
  { name: "Áries", element: "fogo", emoji: "♈", range: "21/03–19/04" },
  { name: "Touro", element: "terra", emoji: "♉", range: "20/04–20/05" },
  { name: "Gêmeos", element: "ar", emoji: "♊", range: "21/05–20/06" },
  { name: "Câncer", element: "água", emoji: "♋", range: "21/06–22/07" },
  { name: "Leão", element: "fogo", emoji: "♌", range: "23/07–22/08" },
  { name: "Virgem", element: "terra", emoji: "♍", range: "23/08–22/09" },
  { name: "Libra", element: "ar", emoji: "♎", range: "23/09–22/10" },
  { name: "Escorpião", element: "água", emoji: "♏", range: "23/10–21/11" },
  { name: "Sagitário", element: "fogo", emoji: "♐", range: "22/11–21/12" },
  { name: "Capricórnio", element: "terra", emoji: "♑", range: "22/12–19/01" },
  { name: "Aquário", element: "ar", emoji: "♒", range: "20/01–18/02" },
  { name: "Peixes", element: "água", emoji: "♓", range: "19/02–20/03" },
];

export function signByName(name) {
  return SIGNS.find((s) => s.name === name) || null;
}

// Detecta o signo solar a partir da data de nascimento (YYYY-MM-DD), pra preencher sem perguntar separado.
export function signoFromDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00");
  if (Number.isNaN(d.getTime())) return null;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricórnio";
  if (m === 1 || (m === 2 && day <= 18)) return "Aquário";
  if (m === 2 || (m === 3 && day <= 20)) return "Peixes";
  if (m === 3 || (m === 4 && day <= 19)) return "Áries";
  if (m === 4 || (m === 5 && day <= 20)) return "Touro";
  if (m === 5 || (m === 6 && day <= 20)) return "Gêmeos";
  if (m === 6 || (m === 7 && day <= 22)) return "Câncer";
  if (m === 7 || (m === 8 && day <= 22)) return "Leão";
  if (m === 8 || (m === 9 && day <= 22)) return "Virgem";
  if (m === 9 || (m === 10 && day <= 22)) return "Libra";
  if (m === 10 || (m === 11 && day <= 21)) return "Escorpião";
  return "Sagitário"; // m === 11 (dia ≥22) ou m === 12 (dia ≤21)
}

const PAIRS = {
  "fogo+fogo": {
    texto: "Dois signos de fogo: intensidade em dobro. Vocês vivem tudo com paixão e movimento.",
    forte: "Energia e entusiasmo que contagia.",
    cuidado: "Lembrem de esfriar a cabeça antes de discutir no calor do momento.",
  },
  "fogo+terra": {
    texto: "Fogo e terra: paixão encontra estabilidade. Um acende, o outro sustenta.",
    forte: "Vocês se equilibram — sonho com pé no chão.",
    cuidado: "Respeitem os ritmos: um corre, o outro constrói devagar.",
  },
  "ar+fogo": {
    texto: "Fogo e ar: o ar alimenta a chama. Juntos, viram ideia em ação rapidinho.",
    forte: "Cumplicidade, aventura e muita conversa.",
    cuidado: "Cuidado pra não começar mil coisas e terminar poucas.",
  },
  "fogo+água": {
    texto: "Fogo e água: intensidade encontra profundidade. Atração forte que pede jogo de cintura.",
    forte: "Quando se sintonizam, é profundo e apaixonado.",
    cuidado: "Falem sobre o que sentem — evita mágoa guardada.",
  },
  "terra+terra": {
    texto: "Dois signos de terra: solidez pura. Vocês constroem uma base que dura.",
    forte: "Confiança, lealdade e projetos de longo prazo.",
    cuidado: "Reservem espaço pra espontaneidade e surpresa.",
  },
  "ar+terra": {
    texto: "Terra e ar: praticidade encontra ideias. Um traça o plano, o outro faz acontecer.",
    forte: "Complementares — pensamento + execução.",
    cuidado: "Alinhem expectativas: lógica e emoção falam línguas diferentes.",
  },
  "terra+água": {
    texto: "Terra e água: a água nutre a terra. Cuidado e crescimento andam juntos aqui.",
    forte: "Aconchego, segurança e afeto que floresce.",
    cuidado: "Não deixem o conforto virar acomodação.",
  },
  "ar+ar": {
    texto: "Dois signos de ar: leveza e conexão mental. Vocês nunca ficam sem assunto.",
    forte: "Amizade, humor e liberdade.",
    cuidado: "Tragam mais presença e toque pro dia a dia.",
  },
  "ar+água": {
    texto: "Ar e água: sensibilidade encontra comunicação. Sentir e falar sobre o sentir.",
    forte: "Vocês conseguem nomear o que sentem — raro e bonito.",
    cuidado: "Equilibrem razão e emoção nas decisões.",
  },
  "água+água": {
    texto: "Dois signos de água: profundidade emocional. Uma conexão que sente tudo fundo.",
    forte: "Empatia e intimidade fora do comum.",
    cuidado: "Cuidem pra não se afogar nas emoções um do outro — respirem.",
  },
};

export function compatibility(nameA, nameB) {
  const a = signByName(nameA);
  const b = signByName(nameB);
  if (!a || !b) return null;
  const key = [a.element, b.element].sort().join("+");
  const data = PAIRS[key];
  return {
    titulo: `${a.emoji} ${a.name} + ${b.name} ${b.emoji}`,
    elementoA: a.element,
    elementoB: b.element,
    emojiA: a.emoji,
    emojiB: b.emoji,
    ...data,
  };
}

const PCT = {
  "ar+ar": 87, "ar+fogo": 92, "ar+terra": 76, "ar+água": 80,
  "fogo+fogo": 90, "fogo+terra": 78, "fogo+água": 74,
  "terra+terra": 88, "terra+água": 91, "água+água": 89,
};
export function compatPercent(nameA, nameB) {
  const a = signByName(nameA);
  const b = signByName(nameB);
  if (!a || !b) return null;
  const key = [a.element, b.element].sort().join("+");
  return PCT[key] || 82;
}

// Números "cósmicos" do casal — só por diversão, determinístico pela semente (nomes/signos).
export function cosmicNumbers(seed, count = 3) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out = [];
  while (out.length < count) {
    h = (h * 1103515245 + 12345) >>> 0;
    const num = (h % 99) + 1;
    if (!out.includes(num)) out.push(num);
  }
  return out;
}

const FREQUENCIAS = [
  "528Hz · frequência do amor",
  "639Hz · conexão e relacionamentos",
  "432Hz · harmonia",
  "741Hz · expressão",
];
export function frequenciaFor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return FREQUENCIAS[h % FREQUENCIAS.length];
}

// Cartas do casal — mecânica "escolham 3 cartas", com significados positivos (entretenimento).
export const CARDS = [
  { name: "O Coração", emoji: "❤️", meaning: "amor e conexão sincera" },
  { name: "A Estrela", emoji: "✨", meaning: "esperança e sonhos que vocês compartilham" },
  { name: "A Viagem", emoji: "🧭", meaning: "aventuras esperando por vocês" },
  { name: "O Sol", emoji: "☀️", meaning: "alegria e dias luminosos juntos" },
  { name: "A Lua", emoji: "🌙", meaning: "intuição e intimidade" },
  { name: "O Laço", emoji: "🎀", meaning: "compromisso e cumplicidade" },
  { name: "A Chave", emoji: "🗝️", meaning: "um novo capítulo se abrindo" },
  { name: "O Brinde", emoji: "🥂", meaning: "celebração e momentos a dois" },
  { name: "O Lar", emoji: "🏡", meaning: "construir um lar juntos" },
];

// Lua — cálculo real de posição astronômica via astronomy-engine (pure JS, sem código nativo).
// Guardado em try/catch: se o pacote não estiver instalado no app RN, moonSign
// simplesmente retorna null em vez de quebrar o require/Metro bundling.
let _Astronomy = null;
function getAstronomy() {
  if (_Astronomy) return _Astronomy;
  try {
    _Astronomy = require("astronomy-engine");
  } catch {
    _Astronomy = false;
  }
  return _Astronomy;
}

export function moonSign(dateStr, timeStr) {
  if (!dateStr) return null;
  const A = getAstronomy();
  if (!A) return null;
  const iso = `${dateStr}T${timeStr || "12:00"}:00Z`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const eclip = A.EclipticGeoMoon(d);
  const lon = ((eclip.lon % 360) + 360) % 360;
  const idx = Math.floor(lon / 30);
  return SIGNS[idx];
}

// Ascendente — cálculo real via astronomy-engine (Astronomy.SiderealTime +
// Astronomy.e_tilt), fórmula clássica de Duffett-Smith expressa com atan2 pra
// não precisar de correção manual de quadrante:
//   RAMC = ((GAST + longitude/15) * 15) mod 360      // longitude: Leste = +, Oeste = −
//   y    = cos(RAMC)
//   x    = -(sin(eps) * tan(lat) + cos(eps) * sin(RAMC))
//   Asc  = atan2(y, x) normalizado pra [0, 360)
// (Sinal de y/x conferido empiricamente: no instante exato do nascer do Sol,
// o Ascendente tem que coincidir com a longitude eclíptica do próprio Sol —
// validado em vários pares lat/long com astronomy-engine antes de fechar o sinal;
// a forma "espelhada" ingênua desse mesmo formulário devolve o Descendente, 180° errado.)
//
// Ao contrário de moonSign (que aceita hora ausente e usa meio-dia como
// aproximação aceitável pro sinal da Lua), o Ascendente muda de signo quase a
// cada 2 horas — uma hora ausente ou "chutada" é quase cara-ou-coroa entre
// signos. Por isso esta função exige hora E localização reais: retorna null
// (nunca um valor fabricado) se faltar timeStr, latitude ou longitude.
//
// utcOffsetHours é o fuso padrão do local de nascimento (ex.: -3 pro horário
// de Brasília) usado pra converter a hora local informada em UTC antes do
// cálculo — sem isso, hora local seria tratada como se já fosse UTC (mesma
// lacuna que moonSign tem hoje, preservada ali para não mudar seu
// comportamento existente).
export function ascendantSign(dateStr, timeStr, latitude, longitude, utcOffsetHours) {
  if (!dateStr || !timeStr) return null;
  if (typeof latitude !== "number" || typeof longitude !== "number" || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }
  const A = getAstronomy();
  if (!A) return null;

  const offset = typeof utcOffsetHours === "number" && !Number.isNaN(utcOffsetHours) ? utcOffsetHours : 0;
  // Trata "YYYY-MM-DDTHH:MM:00Z" como se os campos informados já fossem UTC,
  // só pra fazer a aritmética de data — depois subtrai o offset do fuso local
  // pra chegar no instante UTC real (ex.: 21:00 local em UTC-3 → 00:00Z do dia seguinte).
  const localAsUtcMs = new Date(`${dateStr}T${timeStr}:00Z`).getTime();
  if (Number.isNaN(localAsUtcMs)) return null;
  const utcMs = localAsUtcMs - offset * 3600 * 1000;
  const d = new Date(utcMs);

  const gastHours = A.SiderealTime(d); // Greenwich Apparent Sidereal Time, em horas siderais
  const tilt = A.e_tilt(A.MakeTime(d));
  const epsRad = (tilt.tobl * Math.PI) / 180; // obliquidade verdadeira da eclíptica
  const latRad = (latitude * Math.PI) / 180;

  const ramcDeg = (((gastHours + longitude / 15) * 15) % 360 + 360) % 360;
  const ramcRad = (ramcDeg * Math.PI) / 180;

  const y = Math.cos(ramcRad);
  const x = -(Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(ramcRad));
  const ascDeg = ((Math.atan2(y, x) * 180) / Math.PI % 360 + 360) % 360;

  const idx = Math.floor(ascDeg / 30);
  return SIGNS[idx];
}
