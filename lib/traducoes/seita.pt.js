// lib/traducoes/seita.pt.js
// O PACK PORTUGUÊS da seita — TODA prosa que o usuário lê mora aqui. O motor
// (a conta do horizonte, a tabela de Ptolomeu, a montagem) fica em lib/seita.js.
// Os packs irmãos (seita.es.js, seita.en.js) repetem exatamente esta FORMA:
// mesmas chaves, mesmos campos, funções com a mesma assinatura.
//
// TODAS as regras do cabeçalho de lib/seita.js valem para cada string daqui:
// prende primeiro e fonte depois, locus em toda afirmação histórica, nenhuma
// alegação de saúde, nada de veredito nem de promessa, e — a mais importante
// desta feature — NÃO COMPLETAR A LACUNA: Valente afirma o positivo (maléfico
// na própria seita é doador de bem) e o app não afirma o negativo, porque a
// base não achou a linha antiga que o autorize.
//
// O texto PT é ouro: test/golden/seita.pt.golden.json guarda a saída dos casos
// de referência e test/seita.test.js compara byte a byte. Mudar uma vírgula
// aqui é quebrar o build — de propósito.

// ---------------------------------------------------------------------------
// NOMES — as CHAVES são dados e continuam em PT nos três packs; só o valor muda
// ---------------------------------------------------------------------------
const PLANETAS = {
  'Sol': 'Sol',
  'Lua': 'Lua',
  'Mercúrio': 'Mercúrio',
  'Vênus': 'Vênus',
  'Marte': 'Marte',
  'Júpiter': 'Júpiter',
  'Saturno': 'Saturno',
  'Urano': 'Urano',
  'Netuno': 'Netuno',
  'Plutão': 'Plutão',
};

const SEITA_NOME = { diurno: 'diurno', noturno: 'noturno' };
const SEITA_MAPA = { diurno: 'mapa diurno', noturno: 'mapa noturno' };

// Tetrabiblos I.5. Vocabulário de física antiga, não juízo moral — e o texto de
// tela repete isso sempre que a palavra aparece.
const CLASSES = { benefico: 'benéfico', malefico: 'maléfico', comum: 'comum' };

// Vírgula decimal, uma casa. É o número que a pessoa pode conferir em qualquer
// efeméride, então ele aparece.
function formatarGraus(n) {
  return Number(n).toFixed(1).replace('.', ',');
}

const ESTRELA = { manha: 'da manhã', tarde: 'da tarde' };
const TURNO = { diurno: 'do dia', noturno: 'da noite' };

// ---------------------------------------------------------------------------
// AS CITAÇÕES — verbatim, sem tradução
// ---------------------------------------------------------------------------
// O campo `texto` é o inglês de Robbins (Loeb/Harvard, 1940) e de Riley, e é
// IDÊNTICO nos três packs. O que muda por idioma é a `parafrase` — assinada
// pelo app, nunca entre aspas — e a língua do `locus`.
const VERBATIM = {
  valensMaleficos: {
    texto:
      'even the malefic stars, when they are operative in appropriate places in their own sect, are bestowers of good and indicative of the greatest positions and success; when they are inoperative, they bring about disasters and accusations.',
    parafrase:
      'Até os astros maléficos, quando operam em lugares apropriados e na própria seita, são doadores de bem e sinal das maiores posições; quando estão inoperantes, trazem desastres e acusações.',
    locus: 'Vétio Valente, Anthologiae I.1, trad. Riley',
  },
  ptolomeuMercurio: {
    texto: 'common as before, diurnal when it is a morning star and nocturnal as an evening star',
    parafrase:
      'Mercúrio é comum, como já era: diurno quando aparece no céu antes do Sol, noturno quando aparece depois.',
    locus: 'Ptolomeu, Tetrabiblos I.7, trad. Robbins, 1940',
  },
  ptolomeuBeneficos: {
    texto: 'because of their tempered nature and because they abound in the hot and the moist',
    parafrase:
      'Júpiter, Vênus e a Lua são benéficos pela natureza temperada e por abundarem no quente e no úmido — e repare que a Lua está na lista.',
    locus: 'Ptolomeu, Tetrabiblos I.5, trad. Robbins, 1940',
  },
  ptolomeuMaleficos: {
    texto: 'one because of his excessive cold and the other for his excessive dryness',
    parafrase:
      'Saturno e Marte são maléficos por excesso: um de frio, o outro de secura. É classificação de qualidade elemental, não de caráter.',
    locus: 'Ptolomeu, Tetrabiblos I.5, trad. Robbins, 1940',
  },
  ptolomeuComuns: {
    texto: 'have both powers, because they have a common nature',
    parafrase:
      'Sol e Mercúrio têm os dois poderes, porque a natureza deles é comum — pegam a cor da companhia. O Sol não é benéfico na conta de Ptolomeu.',
    locus: 'Ptolomeu, Tetrabiblos I.5, trad. Robbins, 1940',
  },
  valensDia: {
    texto: 'of the day sect',
    parafrase: 'A etiqueta que Valente dá, planeta a planeta, aos que jogam de dia: Sol, Júpiter e Saturno.',
    locus: 'Vétio Valente, Anthologiae I.1, trad. Riley',
  },
  valensNoite: {
    texto: 'of the night sect',
    parafrase: 'A etiqueta que Valente dá, planeta a planeta, aos que jogam de noite: Lua, Vênus e Marte.',
    locus: 'Vétio Valente, Anthologiae I.1, trad. Riley',
  },
};

// ---------------------------------------------------------------------------
// BLOCO 1 — A CHAMADA. Vida real, sem termo técnico, sem nome próprio, sem
// século. É a primeira coisa que a tela mostra.
// ---------------------------------------------------------------------------
const CHAMADA = {
  diurno: () =>
    'Na hora exata em que você nasceu ainda havia claridade lá fora: o Sol estava acima da linha do horizonte. ' +
    'Parece detalhe de certidão. É a peça que muda a leitura de sete planetas de uma vez.',
  noturno: () =>
    'Na hora exata em que você nasceu já estava escuro lá fora: o Sol estava abaixo da linha do horizonte. ' +
    'Parece detalhe de certidão. É a peça que muda a leitura de sete planetas de uma vez.',
};

// ---------------------------------------------------------------------------
// BLOCO 1 → BLOCO 2 — A EXPLICAÇÃO. Abre concreto e fecha com o recibo.
// ---------------------------------------------------------------------------
const EXPLICACAO = {
  diurno: (c) =>
    `Todo mapa cai de um lado ou do outro dessa linha, sem meio-termo: ou o Sol já tinha nascido e ainda não se posto, ou não. ` +
    `O seu Sol estava a ${formatarGraus(c.graus)} graus acima do horizonte.` +
    `\n\n` +
    `O que isso faz: a astrologia antiga divide os planetas em dois times. Três jogam de dia, três jogam de noite, e um troca de lado conforme o caso. ` +
    `Quem nasceu de dia tem o time do dia jogando em casa. O mesmo Saturno, o mesmo Marte e a mesma Lua não se leem igual nos dois mapas — e é só isso que separa os dois.` +
    `\n\n` +
    `O nome disso na fonte é seita (hairesis, no grego — o time a que cada planeta pertence). ` +
    `A tabela é de Ptolomeu, Tetrabiblos I.7, séc. II: Sol e Júpiter de dia, Lua e Vênus de noite, Mercúrio conforme apareça no céu antes ou depois do Sol. ` +
    `Vétio Valente, no mesmo século, confere planeta por planeta na Anthologiae I.1.` +
    `\n\n` +
    `E Valente acrescenta a frase que quase todo resumo pula: maléfico que opera em lugar apropriado e na própria seita é doador de bem, não de estrago. ` +
    `É por isso que Saturno num mapa diurno — o seu — não é o Saturno de um mapa noturno.`,
  noturno: (c) =>
    `Todo mapa cai de um lado ou do outro dessa linha, sem meio-termo: ou o Sol já tinha nascido e ainda não se posto, ou não. ` +
    `O seu Sol estava a ${formatarGraus(c.graus)} graus abaixo do horizonte.` +
    `\n\n` +
    `O que isso faz: a astrologia antiga divide os planetas em dois times. Três jogam de dia, três jogam de noite, e um troca de lado conforme o caso. ` +
    `Quem nasceu de noite tem o time da noite jogando em casa. O mesmo Marte, o mesmo Saturno e a mesma Lua não se leem igual nos dois mapas — e é só isso que separa os dois.` +
    `\n\n` +
    `O nome disso na fonte é seita (hairesis, no grego — o time a que cada planeta pertence). ` +
    `A tabela é de Ptolomeu, Tetrabiblos I.7, séc. II: Sol e Júpiter de dia, Lua e Vênus de noite, Mercúrio conforme apareça no céu antes ou depois do Sol. ` +
    `Vétio Valente, no mesmo século, confere planeta por planeta na Anthologiae I.1.` +
    `\n\n` +
    `E Valente acrescenta a frase que quase todo resumo pula: maléfico que opera em lugar apropriado e na própria seita é doador de bem, não de estrago. ` +
    `É por isso que Marte num mapa noturno — o seu — não é o Marte de um mapa diurno.`,
};

// ---------------------------------------------------------------------------
// AS RESSALVAS QUE ANDAM JUNTO COM TODA LEITURA
// ---------------------------------------------------------------------------
const NOTA_CONDICAO =
  'Uma ressalva que a própria fonte impõe. Valente pede duas coisas ao mesmo tempo: o planeta estar na própria seita E estar operando em lugar apropriado. ' +
  'A seita este app calcula, e é o que você está lendo aqui. O lugar apropriado, não — isso pede a casa e a condição de cada planeta, que esta tela ainda não lê. ' +
  'Metade da regra, dita como metade.';

const NOTA_LEITURA_DO_APP =
  'O que é conta e o que é leitura. A conta: o app compara a longitude do Sol com o eixo do Ascendente e do Descendente, que é o horizonte desenhado no mapa — hora, cidade e efeméride de verdade, sem tabela. ' +
  'A leitura: quem é do dia e quem é da noite é tabela de Ptolomeu (Tetrabiblos I.7) e de Valente (Anthologiae I.1), os dois do séc. II. ' +
  'O jeito de contar isso em português de hoje é do app, e só isso.';

const NOTA_LIMITROFE = (c) =>
  `Chamada apertada: o Sol estava a ${formatarGraus(c.graus)} graus do horizonte na hora que você informou — perto da virada. ` +
  `Nessa faixa, alguns minutos de diferença trocam o mapa de diurno para noturno. Se a hora que você tem é aproximada, a certidão resolve. ` +
  `(Os 3 graus que o app usa como faixa de atenção são escolha nossa, não regra antiga: no ritmo médio do eixo dão perto de 13 minutos de relógio. Na fonte não há meio-termo — ou está acima, ou está abaixo.)`;

// ---------------------------------------------------------------------------
// MERCÚRIO — o único que troca de lado
// ---------------------------------------------------------------------------
const MERCURIO = {
  manha: (c) =>
    `Mercúrio apareceu no céu antes do Sol naquele dia — estrela da manhã, a ${formatarGraus(c.elongacao)} graus dele. Por esse critério, entra no time do dia.`,
  tarde: (c) =>
    `Mercúrio apareceu no céu depois do Sol naquele dia — estrela da tarde, a ${formatarGraus(c.elongacao)} graus dele. Por esse critério, entra no time da noite.`,
  indeterminado:
    'Mercúrio é o único que troca de lado: entra no dia se aparece no céu antes do Sol, e na noite se aparece depois. Sem o mapa calculado não dá para dizer qual dos dois é o seu, e o app não chuta.',
};

// ---------------------------------------------------------------------------
// A LINHA EXTRA DE CADA PLANETA — é o que a tela pendura embaixo de qualquer
// leitura de planeta. Abre concreto; o recibo vem no campo ao lado.
// ---------------------------------------------------------------------------
const LINHAS = {
  'Sol': {
    naSeita: () =>
      'O Sol está em casa: ele é o dono do turno em que você nasceu. Isso não o torna bonzinho. Ptolomeu não põe o Sol entre os benéficos — põe entre os comuns, que pegam a cor de quem estiver por perto.',
    foraDaSeita: () =>
      'O Sol é do turno do dia e você nasceu de noite: ele está fora da própria seita. Também não vira problema por causa disso. Na conta de Ptolomeu o Sol é comum, e comum é quem pega a cor da companhia.',
  },
  'Lua': {
    naSeita: () =>
      'A Lua está em casa: você nasceu no turno dela. E tem um detalhe que quase ninguém conta — na lista de Ptolomeu a Lua é benéfica, no mesmo grupo de Júpiter e Vênus. O costume é citar os dois e esquecer o luminar.',
    foraDaSeita: () =>
      'A Lua é do turno da noite e você nasceu de dia: fora da própria seita. Continua benéfica na lista de Ptolomeu, junto de Júpiter e Vênus — coisa que quase todo resumo esquece. Só não está no turno dela.',
  },
  'Mercúrio': {
    naSeita: (c) =>
      `Mercúrio é o único que muda de lado, e o critério é a hora em que ele aparece no céu: antes do Sol, é do dia; depois, é da noite. ` +
      `No seu caso ele é estrela ${ESTRELA[c.estrela]} — e caiu no mesmo turno do seu mapa. Está em casa.`,
    foraDaSeita: (c) =>
      `Mercúrio muda de lado conforme apareça antes ou depois do Sol. No seu caso ele é estrela ${ESTRELA[c.estrela]}, o que o põe no turno ${TURNO[c.estrela === 'manha' ? 'diurno' : 'noturno']} — ` +
      `e o seu mapa é ${SEITA_NOME[c.seita]}. Fora da própria seita, então.`,
  },
  'Vênus': {
    naSeita: () =>
      'Vênus está em casa: é do turno da noite, e é nele que você nasceu. Valente resume o que ela move em duas palavras — desejo e afeto — e Ptolomeu a põe entre os benéficos.',
    foraDaSeita: () =>
      'Vênus é do turno da noite e você nasceu de dia: fora da própria seita. Segue benéfica na conta de Ptolomeu — a classificação sai da natureza dela, não do turno.',
  },
  'Marte': {
    naSeita: () =>
      'Marte é maléfico na lista antiga, e aqui vem a virada: você nasceu de noite, que é o turno dele. Marte está na própria seita. ' +
      'Valente escreve, na mesma página em que o chama de maléfico, que maléfico assim colocado é doador de bem. Na fonte, Marte é o que corta, forja e comanda.',
    foraDaSeita: () =>
      'Marte é do turno da noite e você nasceu de dia: fora da própria seita. E aqui o app freia. ' +
      'A frase de Valente sobre doador de bem é para maléfico NA própria seita; a frase oposta dele é sobre maléfico inoperante, que não é a mesma coisa. ' +
      'Nenhum texto antigo desta base diz que Marte de dia é pior, e a lacuna fica declarada em vez de preenchida.',
  },
  'Júpiter': {
    naSeita: () =>
      'Júpiter está em casa: do turno do dia, e é nele que você nasceu. É benéfico na lista de Ptolomeu, e o motivo que ele dá é físico, não moral — ' +
      'Júpiter aquece e umedece na medida, e são essas as duas qualidades que a fonte chama de fecundas.',
    foraDaSeita: () =>
      'Júpiter é do turno do dia e você nasceu de noite: fora da própria seita. Continua benéfico na conta de Ptolomeu — a classificação sai da natureza dele, não do turno.',
  },
  'Saturno': {
    naSeita: () =>
      'Esta é a linha que o resumo de Saturno costuma pular: Saturno é o maléfico do turno do DIA, e você nasceu de dia. Ele está na própria seita. ' +
      'Valente, na mesma página em que o chama de maléfico, escreve que maléfico bem posto na própria seita é doador de bem — e lista cargo, supervisão e administração de bem alheio. ' +
      'O Saturno das lições e do amadurecimento, esse é outro: vem de Liz Greene, 1976.',
    foraDaSeita: () =>
      'Saturno é do turno do dia e você nasceu de noite: fora da própria seita. E aqui o app para. ' +
      'A frase de Valente sobre doador de bem é para maléfico NA própria seita; a frase oposta dele é sobre maléfico inoperante, que não é a mesma coisa. ' +
      'Nenhum texto antigo desta base diz que Saturno de noite é pior, e a lacuna fica declarada em vez de preenchida.',
  },
};

// Os três modernos. A resposta deles é a declaração de que seita não se aplica
// — com a data, que é o argumento inteiro.
const LINHA_MODERNA = {
  'Urano': (c) =>
    `Seita não se aplica a Urano. A doutrina é sobre os sete que se enxergam a olho nu, e Urano só foi descoberto em ${c.ano} — mais de mil e seiscentos anos depois de Ptolomeu escrever a tabela. O app não inventa um lugar para ele nela.`,
  'Netuno': (c) =>
    `Seita não se aplica a Netuno. A tabela é do séc. II e Netuno foi descoberto em ${c.ano}: não há como Ptolomeu ou Valente terem dito qualquer coisa sobre ele. Deixar a linha em branco seria mais honesto que preenchê-la, e dizer isso é mais honesto ainda.`,
  'Plutão': (c) =>
    `Seita não se aplica a Plutão. Ele foi descoberto em ${c.ano} — dezoito séculos depois da tabela. Onde a fonte não fala, o app também não.`,
};

// ---------------------------------------------------------------------------
// OS RECIBOS — a linha miúda ao lado de cada planeta
// ---------------------------------------------------------------------------
const RECIBOS = {
  'Sol': 'Ptolomeu, Tetrabiblos I.7 — o Sol abre a lista dos diurnos. Valente, Anthologiae I.1: "of the day sect". Classe comum: Tetrabiblos I.5.',
  'Lua': 'Ptolomeu, Tetrabiblos I.7 — a Lua abre a lista dos noturnos. Valente, Anthologiae I.1: "of the night sect". Benéfica: Tetrabiblos I.5, junto de Júpiter e Vênus.',
  'Mercúrio':
    'Ptolomeu, Tetrabiblos I.7 — "common as before, diurnal when it is a morning star and nocturnal as an evening star". Estrela da manhã e da tarde: Tetrabiblos I.8. A grade de Valente em I.1, como esta base a registra, não inclui Mercúrio.',
  'Vênus': 'Ptolomeu, Tetrabiblos I.7 — Vênus entre os noturnos. Valente, Anthologiae I.1: "of the night sect", e "Venus is desire and love". Benéfica: Tetrabiblos I.5.',
  'Marte':
    'Ptolomeu, Tetrabiblos I.7 — Marte na seita da noite. Valente, Anthologiae I.1: "of the night sect". Maléfico por secura excessiva: Tetrabiblos I.5. A razão dada para ele entrar na noite — que é úmida e tempera o seco — vem do resumo do capítulo I.7, e esta base não conferiu a frase inteira no original.',
  'Júpiter':
    'Ptolomeu, Tetrabiblos I.7 — Júpiter entre os diurnos. Valente, Anthologiae I.1: "of the day sect". Benéfico: Tetrabiblos I.5, "because of their tempered nature and because they abound in the hot and the moist".',
  'Saturno':
    'Ptolomeu, Tetrabiblos I.7 — Saturno na seita do dia. Valente, Anthologiae I.1: "of the day sect". Maléfico por frio excessivo: Tetrabiblos I.5. A razão dada para ele entrar no dia — que é quente e tempera o frio — vem do resumo do capítulo I.7, e esta base não conferiu a frase inteira no original.',
  'Urano': 'Descoberto em 1781. Não está em Ptolomeu nem em Valente: não há seita antiga a atribuir.',
  'Netuno': 'Descoberto em 1846. Não está em Ptolomeu nem em Valente: não há seita antiga a atribuir.',
  'Plutão': 'Descoberto em 1930. Não está em Ptolomeu nem em Valente: não há seita antiga a atribuir.',
};

// ---------------------------------------------------------------------------
// A BIBLIOGRAFIA
// ---------------------------------------------------------------------------
const FONTES = [
  'Ptolomeu, Tetrabiblos I.7 (trad. F. E. Robbins, Loeb/Harvard, 1940) — a tabela das seitas: Sol e Júpiter diurnos, Lua e Vênus noturnos, Mercúrio comum, diurno como estrela da manhã e noturno como estrela da tarde',
  'Vétio Valente, Anthologiae I.1 (trad. Riley) — a mesma grade planeta a planeta, e a regra do maléfico que opera na própria seita',
  'Ptolomeu, Tetrabiblos I.5 — benéficos, maléficos e comuns, derivados das quatro qualidades: a Lua entre os benéficos, o Sol entre os comuns',
  'Ptolomeu, Tetrabiblos I.8 — oriental e ocidental: o planeta que aparece no céu antes do Sol e o que aparece depois',
  'Ptolomeu, Tetrabiblos I.7 — a razão dada para os dois maléficos entrarem na seita contrária à própria natureza (Saturno no dia, Marte na noite). Vem do resumo do capítulo; esta base não conferiu a frase inteira no original',
  'Liz Greene, Saturn: A New Look at an Old Devil, 1976 — o Saturno das lições e do amadurecimento, que é leitura do séc. XX e não da tradição antiga',
];

// ---------------------------------------------------------------------------
// O QUE FALTA, E ONDE RESOLVER — o app nunca deixa beco sem saída
// ---------------------------------------------------------------------------
const FALTA = {
  data: {
    texto:
      'Sem a data de nascimento não há onde procurar o Sol, e é a posição dele em relação ao horizonte que decide se o mapa é diurno ou noturno.',
    comoResolver: 'Informe sua data de nascimento no Mapa Astral.',
  },
  hora: {
    texto:
      'Falta a hora. Diurno ou noturno é uma pergunta sobre o instante: o Sol estava acima ou abaixo do horizonte quando você nasceu? Meio-dia e meia-noite do mesmo dia dão respostas opostas, então aqui não existe palpite honesto a dar.',
    comoResolver: 'Informe a hora de nascimento no Mapa Astral — é o mesmo campo que destrava o Ascendente.',
  },
  cidade: {
    texto:
      'Falta a cidade. O horizonte é diferente em cada ponto do planeta: a mesma hora do mesmo dia é dia num lugar e noite em outro. Sem o lugar, não há horizonte com que comparar.',
    comoResolver: 'Escolha a cidade de nascimento no Mapa Astral — é o mesmo campo que destrava o Ascendente e as casas.',
  },
  efemeride: {
    texto: 'As posições do céu não puderam ser calculadas agora. O app prefere não mostrar nada a mostrar um céu inventado.',
    comoResolver: 'Tente de novo em instantes, no Mapa Astral.',
  },
};

export const PACK = {
  idioma: 'pt',
  tela: 'Mapa Astral',
  formatarGraus,
  planetas: PLANETAS,
  seitaNome: SEITA_NOME,
  seitaMapa: SEITA_MAPA,
  classes: CLASSES,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  notaCondicao: NOTA_CONDICAO,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaLimitrofe: NOTA_LIMITROFE,
  mercurio: MERCURIO,
  linhas: LINHAS,
  linhaModerna: LINHA_MODERNA,
  recibos: RECIBOS,
  verbatim: VERBATIM,
  fontes: FONTES,
  falta: FALTA,
};

export default PACK;
