// lib/lovePhrase.js
// Frase do dia sobre amor, feita pra ser compartilhada com o par — retenção
// dupla: dá um motivo concreto pra abrir o app todo dia (a frase muda) E pra
// compartilhar de verdade fora do app (WhatsApp etc.), o que expõe o Cosmic
// Guide pra quem ainda não usa. Mesmo padrão determinístico-por-data do
// "Pensamento cósmico do dia" (lib/dailyThought.js) — todo mundo vê a mesma
// frase no mesmo dia, muda sozinha à meia-noite, sem precisar de rede.
//
// 3 idiomas (PT/ES/EN), mesmos índices — a frase do dia é a MESMA ideia nos
// 3 (traduzida, não sorteada de novo), então um casal com idiomas diferentes
// compartilha a mesma mensagem do dia. Antes era só PT e quem usava o app em
// espanhol/inglês recebia frase em português (achado real, 26/07/2026).
const LOVE_PHRASES = {
  pt: [
    'Amor não é achar a pessoa perfeita — é escolher a mesma pessoa imperfeita, todo dia, de novo.',
    'Tem gente que ilumina uma sala só de entrar. Você faz isso na minha vida.',
    'A distância entre "eu gosto de você" e "eu te amo" é só o tempo de perceber que já era isso.',
    'Não é sobre nunca brigar — é sobre nunca desistir de resolver.',
    'Você é o motivo de eu acreditar que amor de verdade não precisa ser perfeito, só verdadeiro.',
    'Todo dia ao seu lado é um dia que eu escolheria de novo, sem pensar duas vezes.',
    'O melhor lugar do mundo não é um lugar — é do seu lado.',
    'Amar é decidir, toda manhã, cuidar de quem escolheu você também.',
    'Não existe "para sempre" garantido — existe escolher todo dia, e isso vale mais.',
    'Você não completa minha vida. Você faz ela valer mais a pena.',
    'A gente não precisa de motivo pra se amar. Mas se precisasse, você seria motivo de sobra.',
    'Casa não é endereço. Casa é onde seu abraço me espera.',
    'De todos os "e se", o único que importou foi "e se a gente tentasse". Ainda bem que tentamos.',
    'Amor de verdade não grita — ele fica. Nos dias bons e nos difíceis também.',
    'Você é aquele tipo raro de pessoa que faz o comum virar memória.',
    'Não é sobre ter tudo perfeito. É sobre ter alguém que fica mesmo quando não está.',
    'O seu jeito de amar me ensinou que carinho também é linguagem.',
    'Contigo, até o silêncio é confortável — e isso diz muito.',
    'A gente não precisa de data especial pra lembrar por que se escolheu.',
    'Você é a prova de que esperar valeu a pena.',
    'Amar alguém é decidir que os defeitos dela também merecem paciência.',
    'Não sei o que o futuro guarda, mas sei que quero descobrir do seu lado.',
    'O jeito que você me olha ainda é o meu lugar favorito no mundo.',
    'A gente não é perfeito junto. A gente é real junto — e isso é melhor.',
    'Se um dia eu esquecer as palavras certas, lembra que meus atos sempre vão te escolher.',
    'Amor bom não sufoca, não cobra, não compete — ele soma.',
    'Você não é só quem eu amo. É quem eu escolho todo dia de novo.',
    'A saudade de você, mesmo perto, é a prova de que isso é raro.',
    'Não existe amor sem esforço — mas com você, o esforço nunca pesou.',
    'Cada dia ao seu lado é um capítulo que eu não trocaria por nada.',
    'O carinho que a gente constrói nos dias comuns é o que sustenta os difíceis.',
    'Você transformou "eu" em "nós" sem eu perceber — e isso foi a melhor mudança da minha vida.',
    'Ninguém prometeu que seria fácil. Prometeram que valeria a pena — e você é a prova.',
    'Amar é também escolher ficar quieto e só segurar a mão.',
    'Se hoje eu não disser mais nada, saiba que penso em você em silêncio o dia inteiro.',
    'A gente não precisa de motivo — mas hoje, o motivo é só: eu te amo.',
  ],
  es: [
    'El amor no es encontrar a la persona perfecta — es elegir a la misma persona imperfecta, todos los días, otra vez.',
    'Hay gente que ilumina una sala con solo entrar. Tú haces eso en mi vida.',
    'La distancia entre "me gustas" y "te amo" es solo el tiempo de darse cuenta de que ya era eso.',
    'No se trata de nunca pelear — se trata de nunca dejar de resolver.',
    'Eres la razón por la que creo que el amor de verdad no necesita ser perfecto, solo verdadero.',
    'Cada día a tu lado es un día que elegiría de nuevo, sin pensarlo dos veces.',
    'El mejor lugar del mundo no es un lugar — es a tu lado.',
    'Amar es decidir, cada mañana, cuidar a quien también te eligió.',
    'No existe un "para siempre" garantizado — existe elegir cada día, y eso vale más.',
    'Tú no completas mi vida. Tú haces que valga más la pena.',
    'No necesitamos motivo para amarnos. Pero si lo necesitáramos, tú serías motivo de sobra.',
    'Casa no es una dirección. Casa es donde tu abrazo me espera.',
    'De todos los "y si", el único que importó fue "y si lo intentamos". Qué bueno que lo intentamos.',
    'El amor de verdad no grita — se queda. En los días buenos y en los difíciles también.',
    'Eres ese tipo raro de persona que convierte lo común en memoria.',
    'No se trata de tener todo perfecto. Se trata de tener a alguien que se queda incluso cuando no está.',
    'Tu manera de amar me enseñó que el cariño también es un idioma.',
    'Contigo, hasta el silencio es cómodo — y eso dice mucho.',
    'No necesitamos una fecha especial para recordar por qué nos elegimos.',
    'Eres la prueba de que esperar valió la pena.',
    'Amar a alguien es decidir que sus defectos también merecen paciencia.',
    'No sé qué guarda el futuro, pero sé que quiero descubrirlo a tu lado.',
    'La forma en que me miras sigue siendo mi lugar favorito en el mundo.',
    'No somos perfectos juntos. Somos reales juntos — y eso es mejor.',
    'Si un día olvido las palabras correctas, recuerda que mis actos siempre te van a elegir.',
    'El amor bueno no asfixia, no cobra, no compite — suma.',
    'No eres solo quien amo. Eres a quien elijo cada día de nuevo.',
    'Extrañarte, incluso teniéndote cerca, es la prueba de que esto es raro.',
    'No existe amor sin esfuerzo — pero contigo, el esfuerzo nunca pesó.',
    'Cada día a tu lado es un capítulo que no cambiaría por nada.',
    'El cariño que construimos en los días comunes es lo que sostiene los difíciles.',
    'Convertiste el "yo" en "nosotros" sin que me diera cuenta — y fue el mejor cambio de mi vida.',
    'Nadie prometió que sería fácil. Prometieron que valdría la pena — y tú eres la prueba.',
    'Amar también es elegir quedarse en silencio y solo tomar la mano.',
    'Si hoy no digo nada más, que sepas que pienso en ti en silencio todo el día.',
    'No necesitamos motivo — pero hoy, el motivo es solo: te amo.',
  ],
  en: [
    "Love isn't finding the perfect person — it's choosing the same imperfect person, every day, all over again.",
    'Some people light up a room just by walking in. You do that to my life.',
    'The distance between "I like you" and "I love you" is just the time it takes to realize it was already that.',
    "It's not about never fighting — it's about never giving up on working it out.",
    "You're the reason I believe real love doesn't need to be perfect, just true.",
    "Every day by your side is a day I'd choose again without thinking twice.",
    "The best place in the world isn't a place — it's next to you.",
    'Loving is deciding, every morning, to care for the one who chose you too.',
    'There\'s no guaranteed "forever" — there\'s choosing each other every day, and that\'s worth more.',
    "You don't complete my life. You make it worth more.",
    "We don't need a reason to love each other. But if we did, you'd be reason enough.",
    "Home isn't an address. Home is where your hug waits for me.",
    'Of all the "what ifs", the only one that mattered was "what if we tried". So glad we tried.',
    'Real love doesn\'t shout — it stays. On the good days and the hard ones too.',
    "You're that rare kind of person who turns the ordinary into memory.",
    "It's not about having everything perfect. It's about having someone who stays even when they're away.",
    'The way you love taught me that tenderness is a language too.',
    'With you, even silence is comfortable — and that says a lot.',
    "We don't need a special date to remember why we chose each other.",
    "You're proof that the wait was worth it.",
    "Loving someone is deciding their flaws deserve patience too.",
    "I don't know what the future holds, but I know I want to find out by your side.",
    'The way you look at me is still my favorite place in the world.',
    "We're not perfect together. We're real together — and that's better.",
    'If someday I forget the right words, remember my actions will always choose you.',
    "Good love doesn't smother, doesn't demand, doesn't compete — it adds.",
    "You're not just who I love. You're who I choose all over again, every day.",
    'Missing you even when you\'re near is proof that this is rare.',
    "There's no love without effort — but with you, the effort never felt heavy.",
    "Every day by your side is a chapter I wouldn't trade for anything.",
    'The tenderness we build on ordinary days is what carries us through the hard ones.',
    'You turned "me" into "us" without me noticing — and it was the best change of my life.',
    "Nobody promised it would be easy. They promised it would be worth it — and you're the proof.",
    "Loving is also choosing to stay quiet and just hold hands.",
    "If I say nothing else today, know that I think of you in silence all day long.",
    "We don't need a reason — but today, the reason is simply: I love you.",
  ],
};

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Determinístico pra data de hoje — mesma frase o dia inteiro, muda sozinha à
// meia-noite local. Idioma desconhecido cai pro PT (mesmo fallback do i18n).
export function getTodaysLovePhrase(lang = 'pt') {
  const phrases = LOVE_PHRASES[lang] || LOVE_PHRASES.pt;
  return phrases[hashStr(todayISO()) % phrases.length];
}

// Exposto só pros testes (paridade de tamanho entre os 3 idiomas).
export const _PHRASES_FOR_TESTS = LOVE_PHRASES;
