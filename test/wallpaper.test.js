// Testes de lib/wallpaper.js — o Papel de Parede do Céu.
//
// O que está travado aqui, e por quê:
//
// (a) DETERMINISMO POR DIA LOCAL: o papel de parede da manhã tem que ser byte
//     a byte o da noite — a pessoa baixa duas vezes e o arquivo não pode
//     "mudar sozinho" às 21h quando o dia UTC vira (mesma armadilha de
//     lib/localDay.js, mesma trava de test/cosmicSound.test.js).
//
// (b) VARREDURA DE ALEGAÇÃO DE SAÚDE / PROMESSA / MECANISMO em toda frase que
//     pode parar numa tela de bloqueio. Mesma régua de test/rituais.test.js —
//     as três listas vieram de lá, porque o risco é o mesmo: alguém "melhorar"
//     a cópia daqui a três meses e a frase virar promessa sem ninguém notar.
//
// (c) FALLBACK HONESTO: sem efeméride, o desenho tem que continuar VÁLIDO
//     (gradiente e glifo de verdade, nada de undefined no canvas) mas sem
//     INVENTAR céu — glifo neutro que não é signo, frase que diz que o céu
//     não foi calculado e que não nomeia fase nem signo nenhum.
//
// (d) UMA FONTE DE VERDADE PROS GLIFOS: o mapa local de lib/wallpaper.js tem
//     que bater caractere a caractere com lib/signs.js — se alguém mudar lá,
//     este teste aponta a divergência aqui.

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getWallpaperData,
  montarWallpaper,
  formatarDataLonga,
  GRADIENTE_POR_FASE,
  GRADIENTE_NEUTRO,
  GLIFO_POR_SIGNO,
  GLIFO_NEUTRO,
  FRASES_POR_FASE,
  FRASES_SEM_CEU,
  FRASES_GENERICAS,
  MARCA,
  DIRECAO_POR_FASE,
  HEMISFERIO_CONVENCIONADO,
  formaDaLua,
} = require('../lib/wallpaper.js');
const { SIGNS } = require('../lib/signs.js');

// Meio-dia local de propósito (mesma convenção de test/cosmicSound.test.js):
// 12:00 cai no mesmo dia civil em qualquer fuso do planeta. Com 00:30 ou 23:30
// o teste passaria aqui e quebraria no CI em outro fuso.
function dia(iso) {
  return new Date(`${iso}T12:00:00`);
}

const HEX = /^#[0-9A-Fa-f]{6}$/;

// 45 dias corridos > 1 ciclo sinódico (29,5 dias): garante que TODAS as 8
// fases passam pela frente dos asserts, sem depender de datas decoradas.
function amostraDeDias() {
  const saida = [];
  for (let i = 0; i < 45; i++) {
    const d = dia('2026-07-01');
    d.setDate(d.getDate() + i);
    saida.push(d);
  }
  return saida;
}

// ===========================================================================
// (a) DETERMINISMO
// ===========================================================================

test('mesmo dia local em horas diferentes devolve exatamente o mesmo desenho', () => {
  const manha = getWallpaperData(new Date('2026-07-30T07:15:00'));
  const noite = getWallpaperData(new Date('2026-07-30T23:40:00'));
  assert.deepEqual(manha, noite);
  assert.equal(manha.dia, '2026-07-30');
});

test('dias diferentes têm dia diferente e o desenho acompanha o céu', () => {
  const hoje = getWallpaperData(dia('2026-07-30'));
  const semanaDepois = getWallpaperData(dia('2026-08-06'));
  assert.notEqual(hoje.dia, semanaDepois.dia);
  // Uma semana muda a fase da Lua com folga (cada fatia dura ~3,7 dias) —
  // então gradiente OU frase OU glifo tem que ter mudado. Se nada mudou, o
  // papel de parede não é "do céu de hoje", é um poster fixo.
  const mudou =
    hoje.frase !== semanaDepois.frase ||
    hoje.glifo !== semanaDepois.glifo ||
    hoje.gradiente.join() !== semanaDepois.gradiente.join();
  assert.ok(mudou, 'uma semana de céu não pode dar o mesmo desenho');
});

// ===========================================================================
// SEMPRE VÁLIDO — gradiente, glifo, frase, data, marca em 45 dias corridos
// ===========================================================================

test('45 dias seguidos: todo desenho sai completo e válido, sem buraco', () => {
  const fasesVistas = new Set();
  for (const d of amostraDeDias()) {
    const w = getWallpaperData(d);

    assert.ok(Array.isArray(w.gradiente) && w.gradiente.length >= 2, `${w.dia}: gradiente precisa de 2+ paradas`);
    for (const cor of w.gradiente) assert.match(cor, HEX, `${w.dia}: cor inválida "${cor}"`);

    assert.equal(typeof w.glifo, 'string');
    assert.ok(w.glifo.length > 0, `${w.dia}: glifo vazio`);

    assert.equal(typeof w.frase, 'string');
    assert.ok(w.frase.length > 0, `${w.dia}: frase vazia`);
    assert.ok(w.frase.length <= 140, `${w.dia}: frase longa demais pra papel de parede (${w.frase.length})`);

    assert.ok(w.dataFormatada.length > 0, `${w.dia}: data por extenso vazia`);
    assert.equal(w.marca, MARCA);
    assert.match(w.dia, /^\d{4}-\d{2}-\d{2}$/);

    // Com efeméride presente (que é o caso deste ambiente de teste), o céu
    // TEM que estar disponível — e aí o desenho vem do céu, não do fallback.
    assert.equal(w.ceuDisponivel, true, `${w.dia}: astronomy-engine está no node_modules, céu tinha que estar disponível`);
    assert.ok(GRADIENTE_POR_FASE[w.fase], `${w.dia}: fase "${w.fase}" sem gradiente próprio`);
    assert.deepEqual(w.gradiente, GRADIENTE_POR_FASE[w.fase]);
    assert.equal(w.glifo, GLIFO_POR_SIGNO[w.signoLua], `${w.dia}: glifo não bate com o signo lunar ${w.signoLua}`);
    assert.ok(FRASES_POR_FASE[w.fase].includes(w.frase), `${w.dia}: frase fora do pool da fase "${w.fase}"`);
    assert.ok(Number.isFinite(w.iluminacao) && w.iluminacao >= 0 && w.iluminacao <= 100, `${w.dia}: iluminação ${w.iluminacao}`);

    fasesVistas.add(w.fase);
  }
  assert.equal(fasesVistas.size, 8, `45 dias cobrem um ciclo sinódico inteiro — era pra ver as 8 fases, vi ${fasesVistas.size}`);
});

test('as 8 fases têm gradiente e pool de frases, sem sobra nem falta', () => {
  const fases = Object.keys(GRADIENTE_POR_FASE);
  assert.equal(fases.length, 8);
  assert.deepEqual(Object.keys(FRASES_POR_FASE).sort(), fases.slice().sort());
  for (const f of fases) {
    assert.ok(FRASES_POR_FASE[f].length >= 2, `fase "${f}" com pool pequeno demais pra variar entre dias`);
  }
});

// ===========================================================================
// (e) A FORMA DA LUA — a fase desenhada de verdade, sem hemisfério inventado
// ===========================================================================
// Até 01/08/2026 o desenho era uma bolinha cinza com alfa = iluminação, e o
// comentário do canvas dizia que a fase de verdade "exigiria terminadores e
// lado certo por hemisfério". A largura do terminador sai da iluminação
// medida e o lado sai do NOME canônico da fase — as duas coisas já estavam no
// módulo. O que continua NÃO sabido é o hemisfério de quem olha (lib/
// wallpaper.js §2.b lista o que foi investigado): daí a convenção declarada,
// e daí estes testes, que travam as duas metades — a geometria é medida, o
// lado é convenção explícita, e onde a fase não informa lado ninguém chuta.

test('DIRECAO_POR_FASE cobre exatamente as 8 fases — nem sobra nem falta', () => {
  assert.deepEqual(Object.keys(DIRECAO_POR_FASE).sort(), Object.keys(GRADIENTE_POR_FASE).sort());
  // O nome canônico É a fonte da direção: quem tem "Crescente" no nome cresce.
  for (const [fase, direcao] of Object.entries(DIRECAO_POR_FASE)) {
    if (/Crescente/.test(fase)) assert.equal(direcao, 'crescente', `${fase} tinha que crescer`);
    else if (/Minguante/.test(fase)) assert.equal(direcao, 'minguante', `${fase} tinha que minguar`);
    else assert.ok(['nova', 'cheia'].includes(direcao), `${fase}: direção inesperada "${direcao}"`);
  }
});

test('a largura do terminador é geometria de esfera: |2k−1| do raio', () => {
  // Quarto = terminador de largura ZERO (a reta que corta a Lua ao meio).
  assert.ok(Math.abs(formaDaLua('Quarto Crescente', 50).larguraTerminador) < 1e-9);
  assert.ok(Math.abs(formaDaLua('Quarto Minguante', 50).larguraTerminador) < 1e-9);
  // Cheia = largura R (o terminador vira o próprio limbo e o disco fecha).
  assert.ok(Math.abs(formaDaLua('Lua Cheia', 100).larguraTerminador - 1) < 1e-9);
  // Nova = largura R do outro lado (nada aceso).
  assert.ok(Math.abs(formaDaLua('Lua Nova', 0).larguraTerminador - 1) < 1e-9);
  // Gibosa a 92% (o caso real que ficou feio na tela): terminador estreito.
  assert.ok(Math.abs(formaDaLua('Lua Gibosa Minguante', 92).larguraTerminador - 0.84) < 1e-9);
  // E a luz é sempre 0..1, mesmo com número fora da faixa vindo de fora.
  for (const i of [-30, 0, 37, 100, 180]) {
    const f = formaDaLua('Lua Crescente', i);
    assert.ok(f.luz >= 0 && f.luz <= 1, `iluminação ${i} escapou da faixa 0..1`);
  }
});

test('crescente e minguante caem em lados OPOSTOS, e o sul espelha o norte', () => {
  // A convenção da casa é o hemisfério norte — o mesmo lado dos emojis
  // 🌒🌘 que lib/lunarCalendar.js já imprime no app inteiro.
  assert.equal(HEMISFERIO_CONVENCIONADO, 'norte');
  assert.equal(formaDaLua('Lua Crescente', 20).ladoIluminado, 'direita');
  assert.equal(formaDaLua('Lua Gibosa Crescente', 80).ladoIluminado, 'direita');
  assert.equal(formaDaLua('Lua Minguante', 20).ladoIluminado, 'esquerda');
  assert.equal(formaDaLua('Lua Gibosa Minguante', 92).ladoIluminado, 'esquerda');
  // O parâmetro existe pro dia em que o app souber de onde a pessoa olha: é a
  // ÚNICA junta que precisaria mudar, e ela espelha os dois lados de uma vez.
  for (const fase of Object.keys(DIRECAO_POR_FASE)) {
    const norte = formaDaLua(fase, 60, 'norte');
    const sul = formaDaLua(fase, 60, 'sul');
    assert.equal(norte.larguraTerminador, sul.larguraTerminador, `${fase}: a forma não muda com o hemisfério`);
    if (norte.ladoIluminado === null) assert.equal(sul.ladoIluminado, null, `${fase}: sem lado no norte, sem lado no sul`);
    else assert.notEqual(norte.ladoIluminado, sul.ladoIluminado, `${fase}: o sul tem que espelhar o norte`);
  }
});

test('Nova e Cheia não afirmam lado nenhum — o nome da fase não diz onde está a luz', () => {
  // A fatia da Lua Nova vai de 337,5° a 22,5° (lib/lunarCalendar.js): ela
  // atravessa o zero, ou seja vai de um fiapo minguante a um fiapo crescente.
  // Dizer de que lado está aquele fiapo seria inventar. Mesmo espelhado na
  // Cheia. O desenho resolve sem lado (disco apagado / disco cheio).
  assert.equal(formaDaLua('Lua Nova', 2).ladoIluminado, null);
  assert.equal(formaDaLua('Lua Cheia', 99).ladoIluminado, null);
  assert.equal(formaDaLua('Lua Nova', 2).direcao, 'nova');
  assert.equal(formaDaLua('Lua Cheia', 99).direcao, 'cheia');
});

test('sem dado não há forma: iluminação ausente ou fase desconhecida devolvem null', () => {
  for (const ruim of [null, undefined, NaN, '80', Infinity]) {
    assert.equal(formaDaLua('Lua Cheia', ruim), null, `iluminação ${String(ruim)} tinha que dar null`);
  }
  // Fase renomeada no futuro: a iluminação é real, mas sem o nome canônico não
  // dá pra saber se cresce ou mingua — e chutar o lado seria fabricar. Quem
  // desenha cai no medidor honesto (contorno + alfa), que é o desenho antigo.
  assert.equal(formaDaLua('Lua Renomeada', 80), null);
  assert.equal(formaDaLua(null, 80), null);
});

test('45 dias de céu real: toda fase do céu vira uma forma desenhável', () => {
  for (const d of amostraDeDias()) {
    const w = getWallpaperData(d);
    assert.ok(w.lua, `${w.dia}: céu disponível e fase conhecida tinham que dar forma`);
    assert.deepEqual(w.lua, formaDaLua(w.fase, w.iluminacao), `${w.dia}: a forma no desenho ≠ formaDaLua(fase, iluminação)`);
    // A luz desenhada é a MEDIDA, não uma aproximação da fatia: o rótulo diz
    // "92% iluminada" e o traço tem que ser o de 92%.
    assert.ok(Math.abs(w.lua.luz * 100 - w.iluminacao) < 1e-9, `${w.dia}: a forma não bate com a iluminação do rótulo`);
    if (w.lua.direcao === 'crescente' || w.lua.direcao === 'minguante') {
      assert.ok(['direita', 'esquerda'].includes(w.lua.ladoIluminado), `${w.dia}: fase com direção e sem lado`);
    }
  }
});

test('sem céu não existe forma pra desenhar — desenhar uma Lua ali seria inventar', () => {
  const w = montarWallpaper({ dia: '2026-07-31', ceuDisponivel: false, regente: 'Vênus' });
  assert.equal(w.lua, null);
});

// ===========================================================================
// (d) GLIFOS — uma fonte de verdade só
// ===========================================================================

test('o mapa de glifos bate caractere a caractere com lib/signs.js', () => {
  assert.equal(Object.keys(GLIFO_POR_SIGNO).length, 12);
  for (const s of SIGNS) {
    assert.equal(
      GLIFO_POR_SIGNO[s.name],
      s.emoji,
      `glifo de ${s.name} divergiu de lib/signs.js — duas fontes de verdade é como nascem os bugs de conteúdo`
    );
  }
  // E o neutro NÃO pode ser um signo: seria inventar céu no ramo sem efeméride.
  assert.ok(!Object.values(GLIFO_POR_SIGNO).includes(GLIFO_NEUTRO));
});

// ===========================================================================
// (b) LINHA VERMELHA — saúde, promessa, mecanismo pseudocientífico
// ===========================================================================
// Mesmas três listas de test/rituais.test.js (a régua da casa), aplicadas a
// TODA frase que este módulo pode pôr numa tela de bloqueio — os pools
// inteiros, não só a frase sorteada de hoje.

const SAUDE = [
  /\bcur(a|ar|as|am|ativ)/i,
  /\btrata(r|mento)?\b/i,
  /\bregenera/i,
  /\bansiedade\b/i,
  /\bdepress(ão|ao|iva|ivo)\b/i,
  /\bins[oô]nia\b/i,
  /\bdores?\b/i,
  /\bterap[eê]utic/i,
  /\bimunidade\b/i,
  /\brem[ée]dio\b/i,
  /\bsono\b/i,
  /\bdormir\b/i,
  /\bestresse\b/i,
  /\brelaxa/i,
  /\bacalma\b/i,
  /\bcalmante\b/i,
  /\btranquiliza/i,
  /\balivi(a|ar|o)\b/i,
  /\bal[ií]vio\b/i,
  /\bharmoniza/i,
  /\bequilibra\b/i,
  /\bbem-estar\b/i,
  /\bsa[uú]de\b/i,
  /\benergiza/i,
  /\brevigora/i,
  /\bmelhora o\b/i,
  /\bfaz bem\b/i,
];

const PROMESSA = [
  /\batra(i|ir|em|irá|ia)\b/i,
  /\bgarant(e|em|ia|ias|ido|ida|ir)\b/i,
  /\bpromet(e|em|er|ido)\b/i,
  /\bmanifesta(r|ção)?\b/i,
  /\babre caminhos?\b/i,
  /\bdestrava\b/i,
  /\bafasta\b/i,
  /\bprotege\b/i,
  /\bd[áa] sorte\b/i,
  /\bvai dar certo\b/i,
  /\bfunciona mesmo\b/i,
];

const MECANISMO = [
  /\benergia (negativa|positiva|ruim|pesada)\b/i,
  /\benerg[ée]tic/i,
  /\bvibra[çc][ãa]o\b/i,
  /\baura\b/i,
  /\bchakra/i,
  /\bpurifica/i,
];

// A palavra banida por docs/tradicao/06 §2 — literal, sem exceção nem entre
// aspas. Mesma trava de test/mitos.test.js e test/quizCosmico.test.js.
const BANIDA = [/\bcigan\w*/iu];

function todasAsFrases() {
  const saida = [];
  for (const [fase, pool] of Object.entries(FRASES_POR_FASE)) {
    pool.forEach((f, i) => saida.push([`FRASES_POR_FASE["${fase}"][${i}]`, f]));
  }
  FRASES_SEM_CEU.forEach((f, i) => saida.push([`FRASES_SEM_CEU[${i}]`, f]));
  FRASES_GENERICAS.forEach((f, i) => saida.push([`FRASES_GENERICAS[${i}]`, f]));
  return saida;
}

function varrer(regras, rotulo) {
  const violacoes = [];
  for (const [caminho, texto] of todasAsFrases()) {
    for (const re of regras) {
      if (re.test(texto)) violacoes.push(`${caminho} → ${re} (${rotulo})`);
    }
  }
  return violacoes;
}

test('NENHUMA frase faz alegação de saúde, nem implícita', () => {
  const violacoes = varrer(SAUDE, 'saúde');
  assert.equal(violacoes.length, 0, 'Papel de parede é desenho, nunca tratamento:\n  ' + violacoes.join('\n  '));
});

test('NENHUMA frase promete resultado', () => {
  const violacoes = varrer(PROMESSA, 'promessa');
  assert.equal(violacoes.length, 0, 'A frase convida a fazer, nunca diz o que o universo devolve:\n  ' + violacoes.join('\n  '));
});

test('NENHUMA frase usa mecanismo pseudocientífico', () => {
  const violacoes = varrer(MECANISMO, 'mecanismo');
  assert.equal(violacoes.length, 0, 'Nem como imagem poética (regra de docs/tradicao/08):\n  ' + violacoes.join('\n  '));
});

test('NENHUMA frase usa a palavra banida por docs/tradicao/06 §2', () => {
  const violacoes = varrer(BANIDA, 'palavra banida');
  assert.equal(violacoes.length, 0, 'A regra é literal: a palavra não entra em nenhum texto do app. Nunca:\n  ' + violacoes.join('\n  '));
});

test('frase que cita autor traz o século junto — recibo na própria frase', () => {
  // Regra da tese (docs/tradicao/00-tese.md): afirmação histórica tem dono e
  // data. Numa frase de papel de parede o recibo é curto, mas existe.
  for (const [caminho, f] of todasAsFrases()) {
    if (/Plínio|Columela|Ptolomeu|Rudhyar|Manílio/i.test(f)) {
      assert.match(f, /séc\.\s*[IVX]+|\b1[0-9]{3}\b/, `${caminho}: autor citado sem século/ano — "${f}"`);
    }
  }
});

// ===========================================================================
// (c) FALLBACK HONESTO — sem efeméride, sem céu inventado
// ===========================================================================

test('sem céu: gradiente neutro, glifo neutro, frase que confessa — nada inventado', () => {
  const w = montarWallpaper({
    dia: '2026-07-31',
    ceuDisponivel: false,
    regente: 'Vênus',
    fase: null,
    iluminacao: null,
    signoLua: null,
  });
  assert.equal(w.ceuDisponivel, false);
  assert.deepEqual(w.gradiente, GRADIENTE_NEUTRO);
  assert.equal(w.glifo, GLIFO_NEUTRO);
  assert.equal(w.fase, null);
  assert.equal(w.signoLua, null);
  assert.equal(w.iluminacao, null);
  // O regente atravessa o fallback porque é aritmética de dia da semana —
  // dado verdadeiro mesmo sem efeméride (mesma decisão de getSkyTuning).
  assert.equal(w.regente, 'Vênus');
  assert.ok(FRASES_SEM_CEU.includes(w.frase), 'a frase do fallback tem que vir do pool que confessa a ausência');
  assert.equal(w.marca, MARCA);
  assert.equal(w.dataFormatada, formatarDataLonga('2026-07-31'));
});

test('as frases sem céu não nomeiam fase nem signo — senão seria céu inventado', () => {
  const nomesProibidos = [...Object.keys(GRADIENTE_POR_FASE), ...Object.keys(GLIFO_POR_SIGNO)];
  for (const f of FRASES_SEM_CEU) {
    for (const nome of nomesProibidos) {
      assert.ok(!f.includes(nome), `FRASES_SEM_CEU não pode citar "${nome}": "${f}"`);
    }
  }
});

test('lixo na entrada não derruba a tela: montarWallpaper aguenta null e objeto vazio', () => {
  for (const entrada of [null, undefined, {}, { dia: 'não-é-data' }, 42]) {
    const w = montarWallpaper(entrada);
    assert.equal(w.ceuDisponivel, false);
    assert.deepEqual(w.gradiente, GRADIENTE_NEUTRO);
    assert.equal(w.glifo, GLIFO_NEUTRO);
    assert.ok(FRASES_SEM_CEU.includes(w.frase));
    assert.match(w.dia, /^\d{4}-\d{2}-\d{2}$/, 'sem dia válido, usa o dia local de hoje — nunca NaN');
  }
});

test('fase renomeada no futuro não vira mentira: céu disponível + fase desconhecida cai na frase genérica', () => {
  const w = montarWallpaper({
    dia: '2026-07-31',
    ceuDisponivel: true,
    regente: 'Vênus',
    fase: 'Lua Renomeada',
    iluminacao: 80,
    signoLua: 'Peixes',
  });
  // O céu FOI calculado — dizer "não pôde ser calculado" seria mentira.
  assert.ok(!FRASES_SEM_CEU.includes(w.frase), 'frase de "sem céu" com céu presente é mentira');
  assert.ok(FRASES_GENERICAS.includes(w.frase));
  // Sem gradiente próprio, cai no neutro — desenho continua válido.
  assert.deepEqual(w.gradiente, GRADIENTE_NEUTRO);
  // O signo é conhecido, então o glifo é o do signo: esse dado é real.
  assert.equal(w.glifo, GLIFO_POR_SIGNO['Peixes']);
});

// ===========================================================================
// DATA POR EXTENSO
// ===========================================================================

test('formatarDataLonga: dia da semana e mês em português, sem ano', () => {
  assert.equal(formatarDataLonga('2026-07-31'), 'sexta-feira, 31 de julho');
  assert.equal(formatarDataLonga('2026-01-01'), 'quinta-feira, 1 de janeiro');
  assert.equal(formatarDataLonga('2026-12-25'), 'sexta-feira, 25 de dezembro');
});

test('formatarDataLonga: entrada inválida devolve string vazia, nunca NaN na tela', () => {
  for (const ruim of ['31/07/2026', '2026-7-31', '', null, undefined, 'amanhã']) {
    assert.equal(formatarDataLonga(ruim), '');
  }
});
