// lib/traducoes/datacao.js
// COMO SE DATA UMA FONTE, nos três idiomas.
//
// Criado em 01/08/2026: fontesDoDia() da Jornada devolvia as 43 datações em
// português nos três idiomas — não só nomes próprios, mas as frases de época
// ("séc. II a.C.", "fim do séc. XIX", "sem datação consensual…").
//
// Em vez de traduzir 43 entradas à mão, traduzimos o PADRÃO: os valores
// distintos de `quando` são só 30, e quase todos seguem duas formas ("séc. X
// a.C./d.C." e um ano solto). Ano solto não se traduz. Nome de OBRA nunca se
// traduz (Tetrabiblos é Tetrabiblos). Nome de AUTOR ganha a forma consagrada
// em cada língua, que é o que o leitor reconhece.
//
// Quem não estiver no mapa volta como veio — melhor o português do que
// esconder a fonte, que é justamente o que dá credibilidade ao app.

// Século: "séc. II a.C." → "2nd c. BC". A regra é a mesma em toda entrada,
// então converte-se a FORMA, não cada string.
const ROMANO = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10,
  XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15, XVI: 16, XVII: 17, XVIII: 18, XIX: 19, XX: 20, XXI: 21 };

function ordinalEn(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const ERA = {
  pt: { ac: 'a.C.', dc: 'd.C.' },
  es: { ac: 'a.C.', dc: 'd.C.' },
  en: { ac: 'BC', dc: 'AD' },
};

const PALAVRA = {
  pt: { sec: 'séc.', fimDo: 'fim do', anos: 'anos', c: 'c.', dezembroDe: 'dezembro de', e: 'e',
        semConsenso: 'sem datação consensual — a atribuição ao tarô é de 1781 em diante' },
  es: { sec: 'siglo', fimDo: 'fines del', anos: 'años', c: 'c.', dezembroDe: 'diciembre de', e: 'y',
        semConsenso: 'sin datación consensuada — la atribución al tarot es de 1781 en adelante' },
  en: { sec: 'c.', fimDo: 'late', anos: '', c: 'c.', dezembroDe: 'December', e: 'and',
        semConsenso: 'no agreed dating — the tarot attribution starts in 1781' },
};

// Nome de autor na forma consagrada de cada língua. Só os que MUDAM entram
// aqui; quem escreve igual nos três (Dane Rudhyar, Paládio→Palladius…) cai no
// fallback e volta como veio.
const AUTORES = {
  es: {
    'Catão, o Velho': 'Catón el Viejo', 'Ptolomeu': 'Ptolomeo', 'Paládio': 'Paladio',
    'Plínio, o Velho': 'Plinio el Viejo', 'Virgílio': 'Virgilio', 'Hesíodo': 'Hesíodo',
    'Columela': 'Columela', 'Firmico Materno': 'Fírmico Materno', 'Vétio Valente': 'Vetio Valente',
    'Paulo de Alexandria': 'Pablo de Alejandría', 'Porfírio de Tiro': 'Porfirio de Tiro',
    'Antíoco de Atenas': 'Antíoco de Atenas', 'Doroteu de Sídon': 'Doroteo de Sidón',
  },
  en: {
    'Catão, o Velho': 'Cato the Elder', 'Ptolomeu': 'Ptolemy', 'Paládio': 'Palladius',
    'Plínio, o Velho': 'Pliny the Elder', 'Virgílio': 'Virgil', 'Hesíodo': 'Hesiod',
    'Columela': 'Columella', 'Firmico Materno': 'Firmicus Maternus', 'Vétio Valente': 'Vettius Valens',
    'Paulo de Alexandria': 'Paulus Alexandrinus', 'Porfírio de Tiro': 'Porphyry of Tyre',
    'Antíoco de Atenas': 'Antiochus of Athens', 'Doroteu de Sídon': 'Dorotheus of Sidon',
  },
};

export function traduzirAutor(autor, lang = 'pt') {
  if (!autor || lang === 'pt') return autor;
  return (AUTORES[lang] && AUTORES[lang][autor]) || autor;
}

// "séc. II a.C." · "c. 150–175 d.C." · "fim do séc. XIX" · "anos 1930" · "1967"
export function traduzirQuando(quando, lang = 'pt') {
  if (!quando || lang === 'pt') return quando;
  const W = PALAVRA[lang] || PALAVRA.pt;
  const E = ERA[lang] || ERA.pt;
  let s = String(quando);

  if (s.startsWith('sem datação consensual')) return W.semConsenso;

  // Século em romano, com ou sem intervalo: "séc. IV–V d.C."
  s = s.replace(/(fim do )?séc\.\s*([IVXLCDM]+)(–([IVXLCDM]+))?/g, (m, fim, r1, _i, r2) => {
    const n1 = ROMANO[r1];
    if (!n1) return m;
    const n2 = r2 ? ROMANO[r2] : null;
    const prefixo = fim ? W.fimDo + ' ' : '';
    if (lang === 'en') {
      const alvo = n2 ? `${ordinalEn(n1)}–${ordinalEn(n2)} ${W.sec}` : `${ordinalEn(n1)} ${W.sec}`;
      return prefixo + alvo;
    }
    return prefixo + (n2 ? `${W.sec} ${r1}–${r2}` : `${W.sec} ${r1}`);
  });

  s = s.replace(/a\.C\./g, E.ac).replace(/d\.C\./g, E.dc);
  if (W.anos) s = s.replace(/\banos\b/g, W.anos);
  else s = s.replace(/\banos\s+/g, ''); // en: "anos 1930" → "1930s"
  if (lang === 'en') s = s.replace(/^(\d{4})s?$/, (m, a) => (quando.includes('anos') ? `${a}s` : a));
  s = s.replace(/dezembro de/g, W.dezembroDe);
  s = s.replace(/\se\s/g, ` ${W.e} `);
  return s;
}
