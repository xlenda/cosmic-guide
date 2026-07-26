// lib/lovePhrase.js
// Frase do dia sobre amor, feita pra ser compartilhada com o par — retenção
// dupla: dá um motivo concreto pra abrir o app todo dia (a frase muda) E pra
// compartilhar de verdade fora do app (WhatsApp etc.), o que expõe o Cosmic
// Guide pra quem ainda não usa. Mesmo padrão determinístico-por-data do
// "Pensamento cósmico do dia" (lib/dailyThought.js) — todo mundo vê a mesma
// frase no mesmo dia, muda sozinha à meia-noite, sem precisar de rede.
const LOVE_PHRASES = [
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
];

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

// Determinístico pra data de hoje — mesma frase o dia inteiro, muda sozinha
// à meia-noite local, sem precisar de rede nem repetir a mesma sequência
// toda vez que o dia recomeça do início do array.
export function getTodaysLovePhrase() {
  return LOVE_PHRASES[hashStr(todayISO()) % LOVE_PHRASES.length];
}
