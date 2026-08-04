// Testes de lib/cosmicSound.js — o "Som do Céu".
//
// Duas metades bem diferentes:
//   1. MAPEAMENTO céu→som: puro, sem áudio nenhum, roda direto (o motor
//      astrológico real de lib/signs.js + lib/lunarCalendar.js já funciona em
//      Node, é o mesmo caminho que test/signs.test.js exercita).
//   2. MOTOR de áudio: Web Audio API não existe em Node, então há um mock
//      abaixo. O ponto dos testes de motor NÃO é "gerou som bonito" — é o bug
//      clássico desta feature: oscilador que continua vivo depois do stop.
//      Áudio vazado não aparece em nenhuma tela, só na bateria do usuário.
//
// Ordem importa em um ponto: o fake do AsyncStorage é injetado no require.cache
// ANTES de qualquer coisa carregar lib/cosmicSound.js, porque getStorage() lá
// memoriza o módulo na primeira chamada. O AsyncStorage real resolve em Node
// mas estoura "window is not defined" em runtime — sem o fake, o teste de
// persistência de volume passaria por acidente (tudo cai no default).

const test = require("node:test");
const { mock } = require("node:test");
const assert = require("node:assert/strict");

// --- fake do AsyncStorage, injetado antes do módulo sob teste -------------
const memoriaStorage = new Map();
const caminhoStorage = require.resolve("@react-native-async-storage/async-storage");
require.cache[caminhoStorage] = {
  id: caminhoStorage,
  filename: caminhoStorage,
  loaded: true,
  exports: {
    default: {
      async getItem(k) {
        return memoriaStorage.has(k) ? memoriaStorage.get(k) : null;
      },
      async setItem(k, v) {
        memoriaStorage.set(k, String(v));
      },
    },
  },
};

const {
  getSkyTuning,
  descreverCeu,
  NOTA_POR_REGENTE,
  PRESETS,
  AVISO_PRESETS,
  presetPorId,
  ganhoPerceptual,
  carregarVolume,
  salvarVolume,
  carregarPreset,
  salvarPreset,
  audioDisponivel,
  createCosmicSound,
  camadasDrone,
  dobrarParaRegistro,
  LIMITE_REGISTRO_HZ,
  ENVELOPE_DIRETO,
  ENVELOPE_RETROGRADO,
} = require("../lib/cosmicSound.js");
const { rulerOfDay } = require("../lib/dailyThought.js");

// Meio-dia local de propósito em todas as datas: localDayStr() usa os getters
// locais, então 12:00 cai no mesmo dia civil em qualquer fuso do planeta. Com
// 00:30 ou 23:30 o teste passaria aqui e quebraria no CI em outro fuso.
function dia(iso) {
  return new Date(`${iso}T12:00:00`);
}

// ===========================================================================
// 1. MAPEAMENTO CÉU → SOM
// ===========================================================================

test("mesmo dia local em horas diferentes devolve exatamente a mesma afinação", () => {
  // Por que isto importa: a feature existe pra ficar aberta por horas. Se a
  // afinação fosse ancorada em `new Date()` cru, o timbre mudaria sozinho às
  // 21h no Brasil (quando o dia UTC vira) no meio da sessão da pessoa.
  const manha = getSkyTuning(new Date("2026-07-30T07:15:00"));
  const noite = getSkyTuning(new Date("2026-07-30T23:40:00"));
  assert.deepEqual(manha, noite);
  assert.equal(manha.dia, "2026-07-30");
});

test("dias diferentes soam diferente (o som não é o mesmo todo dia)", () => {
  const hoje = getSkyTuning(dia("2026-07-30"));
  const amanha = getSkyTuning(dia("2026-07-31"));
  assert.notEqual(hoje.dia, amanha.dia);
  assert.notEqual(hoje.notaHz, amanha.notaHz, "regente muda todo dia, nota base também");
});

test("a nota base segue o regente do dia pela ordem caldaica, os 7 dias", () => {
  const vistos = new Set();
  for (let i = 0; i < 7; i++) {
    const d = dia("2026-07-26"); // domingo
    d.setDate(d.getDate() + i);
    const t = getSkyTuning(d);
    const esperado = rulerOfDay(d).planet;
    assert.equal(t.regente, esperado, `dia ${t.dia}`);
    assert.equal(t.notaHz, NOTA_POR_REGENTE[esperado], `nota de ${esperado}`);
    vistos.add(esperado);
  }
  assert.equal(vistos.size, 7, "a semana inteira precisa cobrir os 7 regentes");
});

test("todo regente tem nota, e as 7 notas são distintas e audíveis", () => {
  const hz = Object.values(NOTA_POR_REGENTE);
  assert.equal(hz.length, 7);
  assert.equal(new Set(hz).size, 7, "dois regentes com a mesma nota apagariam a distinção");
  for (const f of hz) assert.ok(f >= 20 && f <= 120, `${f} Hz fora do registro de drone grave`);
  // A direção escolhida (documentada no módulo): Saturno é o mais grave, Lua o
  // mais agudo. Se alguém inverter isso sem querer, este teste avisa.
  assert.equal(Math.min(...hz), NOTA_POR_REGENTE["Saturno"]);
  assert.equal(Math.max(...hz), NOTA_POR_REGENTE["Lua"]);
});

test("Lua Nova soa mais fechada e Lua Cheia mais aberta (fase → brilho)", () => {
  // Datas reais já validadas em test/lunarCalendar.test.js.
  const nova = getSkyTuning(dia("2024-01-11"));
  const cheia = getSkyTuning(dia("2024-01-25"));
  assert.equal(nova.fase, "Lua Nova");
  assert.equal(cheia.fase, "Lua Cheia");
  assert.ok(nova.corteHz < cheia.corteHz, `nova ${nova.corteHz} deveria ser < cheia ${cheia.corteHz}`);
  assert.ok(nova.aberturaHarmonica < cheia.aberturaHarmonica);
  // Nunca sai da faixa declarada, em nenhuma fase. Faixa 480–3200 desde
  // 31/07/2026: subiu junto com o pad de acordes, porque o corte antigo de
  // 320 Hz na Lua Nova estrangulava a única camada que alto-falante de
  // celular reproduz (feedback do dono: "som chato que não dá pra ouvir").
  for (const t of [nova, cheia]) {
    assert.ok(t.corteHz >= 480 && t.corteHz <= 3200, `corte ${t.corteHz}`);
    assert.ok(t.aberturaHarmonica > 0 && t.aberturaHarmonica <= 1);
  }
});

test("o elemento do signo lunar escolhe a textura de ruído, e os 4 elementos dão 4 texturas distintas", () => {
  // A Lua passa pelos 12 signos em ~27 dias, então 30 dias cobrem os 4
  // elementos com folga.
  const porElemento = new Map();
  for (let i = 0; i < 30; i++) {
    const d = dia("2026-01-05");
    d.setDate(d.getDate() + i);
    const t = getSkyTuning(d);
    assert.ok(t.elemento, `${t.dia} sem elemento`);
    assert.ok(t.textura && t.textura.filtro && t.textura.descricao, `${t.dia} sem textura`);
    if (!porElemento.has(t.elemento)) porElemento.set(t.elemento, new Set());
    porElemento.get(t.elemento).add(JSON.stringify(t.textura));
  }
  assert.equal(porElemento.size, 4, "30 dias precisam cobrir fogo, terra, ar e água");
  for (const [elemento, texturas] of porElemento) {
    assert.equal(texturas.size, 1, `${elemento} não pode ter duas texturas diferentes`);
  }
  const todas = new Set([...porElemento.values()].map((s) => [...s][0]));
  assert.equal(todas.size, 4, "cada elemento precisa de uma textura própria");
});

test("aspecto exato do dia acende a segunda voz de pulso — e só ele", () => {
  const pessoais = new Set(["Sol", "Lua", "Mercúrio", "Vênus", "Marte"]);
  let comAspecto = 0;
  let semAspecto = 0;
  for (let i = 0; i < 60; i++) {
    const d = dia("2026-03-01");
    d.setDate(d.getDate() + i);
    const t = getSkyTuning(d);
    if (t.aspectoExato) {
      comAspecto++;
      assert.equal(t.vozesDePulso, 2, `${t.dia} tem aspecto exato mas 1 voz`);
      assert.ok(t.aspectoExato.orb <= 1, `orbe ${t.aspectoExato.orb} não é "exato"`);
      assert.ok(
        pessoais.has(t.aspectoExato.planetA) || pessoais.has(t.aspectoExato.planetB),
        "par de planetas lentos fica em orbe por meses — não é aspecto 'de hoje'"
      );
    } else {
      semAspecto++;
      assert.equal(t.vozesDePulso, 1, `${t.dia} sem aspecto mas com 2 vozes`);
    }
  }
  assert.ok(comAspecto > 0, "60 dias sem nenhum aspecto exato indica mapeamento quebrado");
  assert.ok(semAspecto > 0, "60 dias com aspecto exato TODO dia indica orbe frouxo demais");
});

test("Mercúrio retrógrado inverte o envelope do pulso (e só nesses dias)", () => {
  const retro = getSkyTuning(dia("2024-04-15")); // período retrógrado real confirmado
  const direto = getSkyTuning(dia("2024-06-01")); // bem fora dos 3 períodos de 2024
  assert.equal(retro.mercurioRetrogrado, true);
  assert.equal(direto.mercurioRetrogrado, false);
  assert.deepEqual(retro.envelopePulso, ENVELOPE_RETROGRADO);
  assert.deepEqual(direto.envelopePulso, ENVELOPE_DIRETO);
  assert.ok(
    ENVELOPE_RETROGRADO.ataqueFrac > ENVELOPE_DIRETO.ataqueFrac,
    "retrógrado = sobe devagar e corta curto; é a inversão que dá o efeito"
  );
});

test("sem efeméride o módulo não fabrica céu, mas não joga fora o regente (que é real)", () => {
  // Simula astronomy-engine ausente derrubando a fase: getSkyTuning entra no
  // ramo de fallback. O dia da semana é aritmética pura, então a nota base
  // continua verdadeira — o que fica marcado como indisponível é o céu
  // observado.
  const lunar = require("../lib/lunarCalendar.js");
  const original = Object.getOwnPropertyDescriptor(lunar, "faseDoDia");
  // getSkyTuning passou a perguntar por DIA (faseDoDia), nao por instante:
  // o duble tem que cobrir a porta que o modulo realmente usa.
  Object.defineProperty(lunar, "faseDoDia", { value: () => null, configurable: true });
  try {
    const t = getSkyTuning(dia("2026-07-30")); // quinta = Júpiter
    assert.equal(t.ceuDisponivel, false);
    assert.equal(t.regente, "Júpiter");
    assert.equal(t.notaHz, NOTA_POR_REGENTE["Júpiter"]);
    assert.equal(t.fase, null);
    assert.equal(t.signoLua, null);
    assert.equal(t.aspectoExato, null);
    assert.ok(t.textura, "ainda precisa de uma textura pra tocar algo");
    const frase = descreverCeu(t);
    assert.match(frase, /não é o céu de hoje/i, "a tela precisa poder dizer que não é o céu real");
  } finally {
    if (original) Object.defineProperty(lunar, "faseDoDia", original);
  }
});

test("descreverCeu explica o som pelo que foi calculado, sem inventar", () => {
  const t = getSkyTuning(dia("2026-07-30"));
  const frase = descreverCeu(t);
  assert.ok(frase.includes(t.regente));
  assert.ok(frase.includes(t.fase));
  assert.ok(frase.includes(t.signoLua));
  assert.ok(frase.includes(t.elemento));
});

// ===========================================================================
// 2. REGISTRO / AFINAÇÃO — cuidado com o ouvido em sessão longa
// ===========================================================================

test("as notas graves do céu recebem apoio ACIMA; os presets agudos, ABAIXO", () => {
  const grave = camadasDrone(73.42, 1); // nota do Sol
  assert.deepEqual(grave.map((c) => c.razao), [1, 1.5, 2]);

  const agudo = camadasDrone(852, 1); // preset mais alto
  assert.equal(agudo[0].razao, 1, "o fundamental continua sendo EXATAMENTE a frequência pedida");
  for (const c of agudo.slice(1)) {
    assert.ok(c.razao < 1, "acima de 220 Hz o apoio desce, senão vira apito em sessão longa");
    assert.ok(852 * c.razao >= 200, "mas não pode desabar pro inaudível");
  }
  // A troca acontece no limite documentado, não em outro lugar.
  assert.ok(camadasDrone(LIMITE_REGISTRO_HZ, 1)[2].razao > 1);
  assert.ok(camadasDrone(LIMITE_REGISTRO_HZ + 1, 1)[2].razao < 1);
});

test("abertura harmônica controla só as camadas de apoio, nunca o fundamental", () => {
  const fechado = camadasDrone(73.42, 0);
  const aberto = camadasDrone(73.42, 1);
  assert.equal(fechado[0].ganho, aberto[0].ganho, "o fundamental não some na Lua Nova");
  assert.equal(fechado[1].ganho, 0);
  assert.equal(fechado[2].ganho, 0);
  assert.ok(aberto[1].ganho > 0 && aberto[2].ganho > 0);
});

test("dobrarParaRegistro mantém a nota (oitavas) e não escapa da faixa audível confortável", () => {
  // 852 Hz × 4 (razão justa) × 3 (segunda voz) = 10 224 Hz: um apito. Dobrado,
  // continua sendo a mesma nota, três oitavas abaixo.
  const dobrado = dobrarParaRegistro(852 * 4 * 3);
  assert.ok(dobrado >= 180 && dobrado <= 1400, `${dobrado} Hz fora da faixa`);
  const razao = (852 * 4 * 3) / dobrado;
  assert.ok(Number.isInteger(Math.log2(razao)), "só pode ter mudado por oitavas inteiras");

  assert.ok(dobrarParaRegistro(55) >= 180, "grave demais também é corrigido, pra cima");
  // Entradas absurdas não travam a aba nem devolvem NaN.
  for (const ruim of [0, -1, NaN, Infinity, null, undefined]) {
    const r = dobrarParaRegistro(ruim);
    assert.ok(Number.isFinite(r) && r > 0, `entrada ${ruim} devolveu ${r}`);
  }
});

// ===========================================================================
// 3. VOLUME — curva perceptual + memória
// ===========================================================================

test("ganhoPerceptual é logarítmico, monotônico, e 0 é silêncio de verdade", () => {
  assert.equal(ganhoPerceptual(0), 0, "slider no zero tem que ser silêncio absoluto, não 'quase'");
  assert.equal(ganhoPerceptual(1), 1);
  // Meio do curso ≈ −20 dB. Uma curva linear devolveria 0.5 aqui — o teste
  // existe justamente pra impedir que alguém "simplifique" de volta pro linear.
  const meio = ganhoPerceptual(0.5);
  assert.ok(Math.abs(meio - 0.1) < 0.001, `esperado ~0.1 (−20 dB), veio ${meio}`);
  assert.ok(meio < 0.5, "curva perceptual, não linear");
  let anterior = -1;
  for (let v = 0; v <= 1.0001; v += 0.05) {
    const g = ganhoPerceptual(v);
    assert.ok(g > anterior, `não monotônico em ${v}`);
    anterior = g;
  }
});

test("ganhoPerceptual clampa entrada inválida em vez de devolver NaN", () => {
  for (const ruim of [NaN, undefined, null, "alto", -5]) {
    assert.equal(ganhoPerceptual(ruim), 0, `entrada ${ruim}`);
  }
  assert.equal(ganhoPerceptual(99), 1);
});

test("o volume salva e restaura entre sessões", async () => {
  memoriaStorage.clear();
  assert.equal(await carregarVolume(), 0.45, "sem nada salvo, cai no padrão");
  await salvarVolume(0.8);
  assert.equal(memoriaStorage.get("cosmic-sound-volume"), "0.8");
  assert.equal(await carregarVolume(), 0.8);
  // Fora da faixa é clampado na hora de salvar, não na hora de tocar.
  await salvarVolume(3);
  assert.equal(await carregarVolume(), 1);
  await salvarVolume(-1);
  assert.equal(await carregarVolume(), 0);
});

test("valor corrompido no storage não deixa o som mudo nem estourado", async () => {
  memoriaStorage.set("cosmic-sound-volume", "abacaxi");
  assert.equal(await carregarVolume(), 0.45);
  memoriaStorage.set("cosmic-sound-volume", "7");
  assert.equal(await carregarVolume(), 0.45, "fora de 0..1 no storage volta pro padrão");
  memoriaStorage.clear();
});

test("o preset salva, restaura, e id desconhecido cai no céu de hoje", async () => {
  memoriaStorage.clear();
  assert.equal(await carregarPreset(), "ceu-de-hoje");
  await salvarPreset("solfeggio-528");
  assert.equal(await carregarPreset(), "solfeggio-528");
  await salvarPreset("preset-que-nao-existe");
  assert.equal(await carregarPreset(), "ceu-de-hoje", "nunca fica num preset inválido");
  assert.equal(presetPorId(null).id, "ceu-de-hoje");
  memoriaStorage.clear();
});

// ===========================================================================
// 4. HONESTIDADE — o teste que protege o app (CDC / propaganda enganosa)
// ===========================================================================

test("nenhum texto voltado ao usuário faz alegação de saúde", () => {
  // Régua do projeto: o app inteiro se sustenta em "tradição simbólica, pra
  // reflexão e entretenimento". Uma única frase com promessa terapêutica
  // transforma isso em propaganda enganosa. Este teste é a trava permanente —
  // quem for acrescentar texto novo aqui esbarra nele.
  const proibidas = [
    /\bcur(a|ar|as|am|ativ)/i,
    /\btrata(r|mento)?\b/i,
    /\bregenera/i,
    /\bDNA\b/,
    /\bansiedade\b/i,
    /\bdepress(ão|ao|iva|ivo)\b/i,
    /\bins[oô]nia\b/i,
    /\bdores?\b/i,
    /\bterap[eê]utic/i,
    /\bemagre/i,
    /\bimunidade\b/i,
    /\bremédio\b/i,
    /\bcicatriz/i,
  ];

  const textos = [AVISO_PRESETS];
  for (const p of PRESETS) {
    textos.push(p.nome, p.associacaoTradicional || "", p.usoPratico || "");
  }
  // Varre também as frases geradas dinamicamente, num ano inteiro de céus
  // diferentes — é aí que entrariam adjetivos por descuido.
  for (let i = 0; i < 365; i += 11) {
    const d = dia("2026-01-01");
    d.setDate(d.getDate() + i);
    textos.push(descreverCeu(getSkyTuning(d)));
  }

  for (const texto of textos) {
    for (const re of proibidas) {
      assert.ok(!re.test(texto), `alegação proibida (${re}) em: "${texto}"`);
    }
  }
});

test("todo preset de frequência declara que é tradição, nunca fato", () => {
  const frequencias = PRESETS.filter((p) => p.baseHz !== null);
  assert.ok(frequencias.length >= 6, "os presets pedidos pelo dono precisam existir");
  for (const p of frequencias) {
    assert.ok(p.associacaoTradicional, `${p.id} sem enquadramento declarado`);
    assert.match(
      p.associacaoTradicional,
      /tradi(ção|cional)|afinação alternativa/i,
      `${p.id} afirma em vez de atribuir à tradição: "${p.associacaoTradicional}"`
    );
    assert.ok(p.usoPratico, `${p.id} sem uso prático descrito`);
    assert.ok(p.baseHz > 0 && p.baseHz < 2000, `${p.id} com frequência absurda`);
  }
  // As 6 de Solfeggio pedidas explicitamente.
  for (const hz of [396, 417, 528, 639, 741, 852]) {
    assert.ok(frequencias.some((p) => p.baseHz === hz), `faltou o preset de ${hz} Hz`);
  }
  // O QUE ESTE GUARDA EXIGE MUDOU EM 31/07/2026, e a razão importa.
  //
  // Antes ele pedia as frases "sem confirmação científica" e "sem qualquer
  // promessa de efeito". O dono removeu esse tipo de aviso do app inteiro
  // ("não quero avisando que não dá resultado") — e ele tem razão de produto:
  // o app pedia desculpa por existir em cima de um player de música.
  //
  // Mas o PROPÓSITO do guarda continua valendo, e é aqui que ele mais importa:
  // Solfeggio é justamente o que o mercado vende como cura. O que impede o
  // app de virar isso não é negar efeito em voz alta — é DATAR. "Proposta em
  // 1974, não é notação medieval" já diz ao leitor que a coisa não é
  // estabelecida, e ainda informa em vez de só negar. É mais forte: quem lê
  // "sem confirmação científica" ignora; quem lê "1974" entende sozinho.
  //
  // Então o guarda passou a exigir a DATAÇÃO, que é o que carrega a honestidade.
  assert.match(AVISO_PRESETS, /1974|anos 1970/i, 'o aviso precisa DATAR a numeração Solfeggio — é a datação que impede a leitura de "cura milenar"');
  assert.match(AVISO_PRESETS, /não é notação medieval|nao e notacao medieval/i, 'o aviso precisa negar explicitamente a origem medieval, que é a lenda que o mercado vende');
});

test("o preset padrão é o céu de hoje, e ele não tem frequência fixa", () => {
  assert.equal(PRESETS[0].id, "ceu-de-hoje");
  assert.equal(PRESETS[0].baseHz, null, "o padrão tem que nascer do céu, não de um número fixo");
  assert.equal(PRESETS[0].associacaoTradicional, null);
});

// ---------------------------------------------------------------------------
// 4b. A MESMA TRAVA, NAS FRASES QUE A PESSOA REALMENTE LÊ
// ---------------------------------------------------------------------------
// O bloco acima varre PRESETS, AVISO_PRESETS e descreverCeu — e NENHUM DOS TRÊS
// chega à tela: components/CosmicSoundPlayer.js renderiza as chaves sound.* de
// lib/i18n.js, em três idiomas. Ou seja, o texto protegido não era o texto
// publicado. Este teste fecha o buraco: varre o dicionário de verdade, nos três
// idiomas, e por isso a lista de palavras vem em português, espanhol e inglês.
//
// Uma alegação de saúde em espanhol não é menos ilegal por estar em espanhol.
test("nenhuma string sound.* renderizada faz alegação de saúde, em nenhum idioma", () => {
  const { _DICTS_FOR_TESTS, LANGUAGES } = require("../lib/i18n.js");

  const proibidas = [
    // pt
    /\bcur(a|ar|as|am|ativ)/i, /\btrata(r|mento)?\b/i, /\bregenera/i,
    /\bansiedade\b/i, /\bdepress(ão|ao|iva|ivo)\b/i, /\bins[oô]nia\b/i,
    /\bdores?\b/i, /\bterap[eê]utic/i, /\bemagre/i, /\bimunidade\b/i,
    /\bremédio\b/i, /\bcicatriz/i, /\bsono\b/i, /\bdormir\b/i, /\bestresse\b/i,
    /\brelaxa/i, /\bacalma/i, /\balivi(a|ar|o)\b/i, /\bharmoniza/i,
    /\bequilibra/i, /\bbem-estar\b/i, /\bsaúde\b/i,
    // es
    /\btrata(miento)?\b/i, /\bansiedad\b/i, /\bdepresión\b/i, /\binsomnio\b/i,
    /\bdolor(es)?\b/i, /\bterapéutic/i, /\binmunidad\b/i, /\bremedio\b/i,
    /\bsueño\b/i, /\bestrés\b/i, /\brelaja/i, /\bcalma\b/i, /\barmoniza/i,
    /\bbienestar\b/i, /\bsalud\b/i,
    // en
    /\bcure[sd]?\b/i, /\bheal(s|ing|ed)?\b/i, /\btreat(s|ment|ing)?\b/i,
    /\banxiety\b/i, /\bdepression\b/i, /\binsomnia\b/i, /\bpain\b/i,
    /\btherapeutic\b/i, /\bimmun/i, /\bremedy\b/i, /\bsleep\b/i, /\bstress\b/i,
    /\brelax/i, /\bsoothe?s?\b/i, /\brelieve/i, /\bharmoni[sz]e/i,
    /\bwell-?being\b/i, /\bwellness\b/i, /\bhealth\b/i,
    // qualquer idioma
    /\bDNA\b/, /\bADN\b/,
  ];

  let varridas = 0;
  for (const lang of LANGUAGES) {
    const dict = _DICTS_FOR_TESTS[lang];
    for (const chave of Object.keys(dict)) {
      if (!chave.startsWith("sound.")) continue;
      varridas++;
      const texto = String(dict[chave]);
      for (const re of proibidas) {
        assert.ok(!re.test(texto), `alegação proibida (${re}) em ${lang}/${chave}: "${texto}"`);
      }
    }
  }
  assert.ok(varridas > 100, `varreu só ${varridas} strings sound.* — o dicionário sumiu?`);
});

test("na tela, frequência é sempre atribuída à tradição — e a tradição é datada", () => {
  const { _DICTS_FOR_TESTS, LANGUAGES } = require("../lib/i18n.js");

  for (const lang of LANGUAGES) {
    const dict = _DICTS_FOR_TESTS[lang];

    // As seis de Solfeggio: atribuição explícita, nunca afirmação própria.
    for (const hz of [396, 417, 528, 639, 741, 852]) {
      const frase = dict[`sound.assoc.${hz}`];
      assert.ok(frase, `falta sound.assoc.${hz} em ${lang}`);
      assert.match(
        frase,
        /tradi(ção|ción|tion)/i,
        `${lang}/sound.assoc.${hz} afirma em vez de atribuir: "${frase}"`
      );
    }

    // A data. "Tradição" sem data é lida como ANTIGA, e a lenda da escala
    // Solfeggio ancestral é justamente o que vende frequência por aí. A
    // numeração é dos anos 1970 — a tela precisa dizer isso.
    const origem = dict["sound.assoc.origin"];
    assert.ok(origem, `falta sound.assoc.origin em ${lang}`);
    assert.match(origem, /19\s?70/, `${lang}/sound.assoc.origin sem a década: "${origem}"`);

    // 432 Hz não é Solfeggio e não pode ser datado junto: é proposta de
    // afinação, e a frase dele tem que continuar dizendo isso.
    assert.match(
      dict["sound.assoc.432"],
      /afina(ção|ción)|tuning/i,
      `${lang}/sound.assoc.432 perdeu o enquadramento de afinação`
    );

    // E o aviso que acompanha toda frequência na tela.
    const aviso = dict["sound.disclaimer"];
    assert.ok(aviso, `falta sound.disclaimer em ${lang}`);
    // Mesma troca explicada no guarda de AVISO_PRESETS: o aviso parou de NEGAR
    // efeito e passou a DATAR a origem, que é o que de fato impede a leitura de
    // "escala de cura ancestral". Nos três idiomas.
    assert.match(
      aviso,
      /1974|19\s?70/,
      `${lang}/sound.disclaimer sem a data da numeração Solfeggio: "${aviso}"`
    );
    assert.match(
      aviso,
      /medieval/i,
      `${lang}/sound.disclaimer não nega a origem medieval, que é a lenda vendida por aí: "${aviso}"`
    );
  }
});

// ===========================================================================
// 5. MOTOR DE ÁUDIO — mock da Web Audio API
// ===========================================================================

// Mock enxuto mas fiel no que importa aqui: quem criou o quê, quem começou,
// quem parou, quem desconectou, e se algum parâmetro foi mexido por atribuição
// direta (o "corte seco" que produz clique) em vez de rampa.
function criarMockWebAudio() {
  const registro = { osciladores: [], ganhos: [], filtros: [], fontesBuffer: [], contextos: [] };

  function criarParam(inicial) {
    let v = inicial;
    const p = {
      atribuicoesDiretas: 0,
      eventos: [],
      get value() {
        return v;
      },
      set value(nv) {
        p.atribuicoesDiretas++;
        v = nv;
      },
      setValueAtTime(x, t) {
        p.eventos.push({ tipo: "set", x, t });
        v = x;
        return p;
      },
      linearRampToValueAtTime(x, t) {
        p.eventos.push({ tipo: "linear", x, t });
        v = x;
        return p;
      },
      exponentialRampToValueAtTime(x, t) {
        p.eventos.push({ tipo: "exp", x, t });
        v = x;
        return p;
      },
      cancelScheduledValues(t) {
        p.eventos.push({ tipo: "cancel", t });
        return p;
      },
      // NÃO acrescentar connect() aqui. AudioParam de verdade NÃO tem connect
      // — quem conecta é o nó (gain.connect(param)). O mock antigo dava esse
      // método ao parâmetro e, com isso, o guarda de criarLFO() passava no
      // teste e reprovava no Chrome: os quatro LFOs eram pulados em silêncio
      // em produção e ninguém via. Manter o mock fiel à API real é o que faz
      // este arquivo valer alguma coisa.
    };
    return p;
  }

  function base(tipo) {
    return {
      tipo,
      conectadoA: [],
      desconectado: false,
      connect(destino) {
        this.conectadoA.push(destino);
        return destino;
      },
      disconnect() {
        this.desconectado = true;
      },
    };
  }

  class MockAudioContext {
    constructor() {
      this.state = MockAudioContext.estadoInicial;
      this.sampleRate = 44100;
      this.currentTime = 0;
      this.destination = base("destination");
      this.fechado = false;
      registro.contextos.push(this);
    }
    createGain() {
      const n = Object.assign(base("gain"), { gain: criarParam(1) });
      registro.ganhos.push(n);
      return n;
    }
    createOscillator() {
      const n = Object.assign(base("oscillator"), {
        frequency: criarParam(440),
        detune: criarParam(0),
        type: "sine",
        iniciado: false,
        parado: false,
        onended: null,
        start() {
          this.iniciado = true;
        },
        stop() {
          this.parado = true;
        },
      });
      registro.osciladores.push(n);
      return n;
    }
    createBiquadFilter() {
      const n = Object.assign(base("filter"), {
        frequency: criarParam(350),
        Q: criarParam(1),
        type: "lowpass",
      });
      registro.filtros.push(n);
      return n;
    }
    createBufferSource() {
      const n = Object.assign(base("bufferSource"), {
        buffer: null,
        loop: false,
        iniciado: false,
        parado: false,
        onended: null,
        start() {
          this.iniciado = true;
        },
        stop() {
          this.parado = true;
        },
      });
      registro.fontesBuffer.push(n);
      return n;
    }
    createBuffer(_canais, tamanho) {
      const dados = new Float32Array(tamanho);
      return { length: tamanho, getChannelData: () => dados };
    }
    async resume() {
      if (!MockAudioContext.recusaResume) this.state = "running";
    }
    async suspend() {
      this.state = "suspended";
    }
    async close() {
      this.state = "closed";
      this.fechado = true;
    }
  }
  MockAudioContext.estadoInicial = "running";
  MockAudioContext.recusaResume = false;

  return { registro, MockAudioContext };
}

// Instala o mock + timers falsos (os pulsos são espaçados de 7 a 23 SEGUNDOS —
// sem timer falso, testar a trama de pulsos levaria minutos de relógio real).
function comAudio(t, opcoes = {}) {
  const { registro, MockAudioContext } = criarMockWebAudio();
  MockAudioContext.estadoInicial = opcoes.estadoInicial || "running";
  MockAudioContext.recusaResume = !!opcoes.recusaResume;
  globalThis.AudioContext = MockAudioContext;
  mock.timers.enable({ apis: ["setTimeout"] });
  t.after(() => {
    mock.timers.reset();
    delete globalThis.AudioContext;
  });
  return { registro, MockAudioContext };
}

// Adianta o relógio falso SEM perder timers agendados de dentro de promessas.
// tick() só dispara o que já está na agenda: setPreset(), por exemplo, grava no
// storage (await) antes de chamar stop(), então um tick síncrono logo depois
// passa reto e o timer do fade nasce órfão — a promessa nunca resolve e o teste
// pendura. Alternar "drenar microtasks" e "andar o relógio" resolve.
// Versão síncrona, pros pulsos (que se reagendam com setTimeout puro, sem
// promessa no meio). Precisa ser fatiada: um tick(3_600_000) único só dispara
// os timers que já estavam na agenda — o pulso seguinte, agendado DENTRO do
// callback, fica pra trás e a trama inteira some. Fatias menores que o menor
// intervalo de pulso (7 s) garantem que cada reagendamento seja visto.
function adiantarRelogio(ms, fatiaMs = 1000) {
  for (let decorrido = 0; decorrido < ms; decorrido += fatiaMs) mock.timers.tick(fatiaMs);
}

async function adiantar(ms, fatiaMs = 200) {
  for (let decorrido = 0; decorrido < ms; decorrido += fatiaMs) {
    for (let i = 0; i < 5; i++) await Promise.resolve();
    mock.timers.tick(fatiaMs);
  }
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

// stop() só resolve depois do fade-out (setTimeout interno).
async function pararEsperando(som) {
  const p = som.stop();
  await adiantar(6_000);
  return p;
}

function todasAsFontes(registro) {
  return [...registro.osciladores, ...registro.fontesBuffer];
}

test("sem Web Audio API o módulo não quebra — só recusa educadamente", async () => {
  assert.equal(typeof globalThis.AudioContext, "undefined", "pré-condição: Node puro");
  assert.equal(audioDisponivel(), false);

  const som = createCosmicSound();
  assert.deepEqual(await som.start(), { ok: false, motivo: "sem-suporte" });
  assert.equal(som.isPlaying(), false);
  // Nada de exceção em nenhum caminho — a tela pode chamar tudo às cegas.
  await som.setVolume(0.7);
  await som.setPreset("solfeggio-528");
  await som.carregarPreferencias();
  await som.stop();
  await som.dispose();
  const estado = som.inspecionar();
  assert.equal(estado.nos, 0);
  assert.equal(estado.fontes, 0);
  assert.equal(estado.temporizadores, 0);
});

test("start() monta o grafo completo e inicia todas as fontes", async (t) => {
  const { registro } = comAudio(t);
  assert.equal(audioDisponivel(), true);

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  const r = await som.start();
  assert.equal(r.ok, true);
  assert.equal(som.isPlaying(), true);

  // 3 camadas de drone + 6 do pad de acordes (3 vozes × 2 osciladores
  // desafinados) + 4 LFOs; 1 fonte de ruído. O pad entrou em 31/07/2026 —
  // é a camada que o alto-falante de celular consegue reproduzir.
  assert.equal(registro.osciladores.length, 13);
  assert.equal(registro.fontesBuffer.length, 1);
  assert.ok(registro.fontesBuffer[0].loop, "o ruído precisa ser contínuo");
  for (const f of todasAsFontes(registro)) {
    assert.ok(f.iniciado, `${f.tipo} criado mas nunca iniciado`);
    assert.ok(!f.parado);
  }
  assert.ok(som.inspecionar().nos >= 15);

  await pararEsperando(som);
});

test("o grafo reflete o céu do dia: preset agudo desce o apoio, Lua muda o corte", async (t) => {
  const { registro } = comAudio(t);

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.setPreset("solfeggio-852");
  await som.start();

  const freqs = registro.osciladores.slice(0, 3).map((o) => o.frequency.value);
  assert.equal(freqs[0], 852, "o fundamental é exatamente a frequência escolhida");
  assert.ok(freqs[1] < 852 && freqs[2] < 852, "apoio desce em vez de virar apito");

  const afinacao = som.inspecionar().afinacao;
  const filtroDrone = registro.filtros[0];
  assert.equal(filtroDrone.frequency.value, afinacao.corteHz, "o corte vem da fase da Lua");

  await pararEsperando(som);
});

test("stop() libera TODOS os nós e não deixa oscilador órfão", async (t) => {
  // Este é o teste central da feature. Um oscilador que sobrevive ao stop
  // continua consumindo CPU e bateria sem nada na tela indicando isso — e o
  // usuário deixa o app aberto por horas justamente porque a feature pede.
  const { registro } = comAudio(t);

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.start();

  // Deixa a trama rodar: 5 minutos disparam vários pulsos (intervalo 4–9 s).
  adiantarRelogio(300_000);
  const durantePulsos = som.inspecionar();
  // Intervalo de 4 a 9 s ⇒ entre 33 e 75 disparos em 5 min — e em dia de
  // aspecto exato (30/07/2026 é um) cada disparo ganha uma SEGUNDA voz 1,4 s
  // depois, então o teto dobra: 33 a 150 osciladores de pulso. Uma faixa, não
  // um "> 0": se o reagendamento quebrar e só o primeiro pulso disparar, o
  // teste frouxo passaria e a trama teria virado uma nota solitária.
  const pulsos = registro.osciladores.length - 13;
  assert.ok(pulsos >= 33 && pulsos <= 150, `${pulsos} pulsos em 5 min (esperado 33–150)`);
  assert.ok(durantePulsos.temporizadores > 0, "a trama tem que ter o próximo pulso agendado");

  await pararEsperando(som);

  const depois = som.inspecionar();
  assert.equal(depois.nos, 0, "sobrou nó registrado depois do stop");
  assert.equal(depois.fontes, 0, "sobrou fonte registrada depois do stop");
  assert.equal(depois.temporizadores, 0, "sobrou timer agendado depois do stop");
  assert.equal(depois.estadoContexto, "suspended", "o contexto tem que ser suspenso, não só silenciado");
  assert.equal(som.isPlaying(), false);

  for (const f of todasAsFontes(registro)) {
    assert.ok(f.parado, `${f.tipo} ficou tocando depois do stop (vazamento de áudio)`);
    assert.ok(f.desconectado, `${f.tipo} não foi desconectado`);
  }
  for (const g of registro.ganhos) assert.ok(g.desconectado, "ganho não desconectado");
  for (const flt of registro.filtros) assert.ok(flt.desconectado, "filtro não desconectado");
});

test("pulsos se limpam sozinhos durante a sessão (o grafo não cresce por horas)", async (t) => {
  // Sem isso, `nos` cresceria a cada pulso e uma sessão de 3 h acumularia
  // centenas de nós mortos — vazamento lento, o pior tipo de achar.
  const { registro } = comAudio(t);

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.start();
  const baseNos = som.inspecionar().nos;

  adiantarRelogio(300_000);
  const inflado = som.inspecionar();
  assert.ok(inflado.nos > baseNos, "os pulsos precisam mesmo entrar no grafo");

  // O navegador chama onended quando a nota curta termina; aqui simulamos isso.
  for (const o of registro.osciladores.slice(13)) {
    if (typeof o.onended === "function") o.onended();
  }
  assert.equal(som.inspecionar().nos, baseNos, "os nós dos pulsos não voltaram ao número base");
  assert.equal(som.inspecionar().fontes, 14, "3 drone + 6 pad + 4 LFO + 1 ruído");

  await pararEsperando(som);
});

test("contexto suspenso que o navegador recusa retomar: pede gesto e não cria nó nenhum", async (t) => {
  // Autoplay policy: sem gesto do usuário o contexto nasce 'suspended' e
  // resume() não resolve pra 'running'. O erro clássico é montar o grafo
  // mesmo assim — fica tudo pendurado, silencioso, e o próximo start duplica.
  const { registro } = comAudio(t, { estadoInicial: "suspended", recusaResume: true });

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  const r = await som.start();
  assert.deepEqual(r, { ok: false, motivo: "gesto-necessario" });
  assert.equal(som.isPlaying(), false);
  assert.equal(registro.osciladores.length, 0, "montou o grafo com o contexto suspenso");
  assert.equal(som.inspecionar().nos, 0);
  assert.equal(som.inspecionar().temporizadores, 0);
});

test("contexto suspenso que retoma com o toque toca normalmente", async (t) => {
  const { registro } = comAudio(t, { estadoInicial: "suspended", recusaResume: false });

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  const r = await som.start();
  assert.equal(r.ok, true);
  assert.equal(registro.contextos[0].state, "running");
  assert.ok(registro.osciladores.length > 0);

  await pararEsperando(som);
});

test("os quatro LFOs conectam mesmo — em AudioParam, que não tem connect()", async (t) => {
  // Regressão do bug que só aparecia no navegador: com o guarda errado em
  // criarLFO(), o grafo saía com 3 osciladores em vez de 7 e o som ficava
  // completamente estático — nenhuma varredura, nenhum batimento, nenhuma
  // respiração no ruído. A promessa de "nunca repete" virava letra morta.
  const { registro } = comAudio(t);
  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.start();

  assert.equal(registro.osciladores.length, 13, "3 do drone + 6 do pad + 4 LFOs");
  // Um AudioParam se distingue de um nó por ter agenda de automação e NÃO ter
  // o campo `tipo` que o mock põe em todo nó.
  const ganhosEmParam = registro.ganhos.filter((g) =>
    g.conectadoA.some((d) => d && typeof d.setValueAtTime === "function" && !d.tipo)
  );
  assert.equal(ganhosEmParam.length, 4, "algum LFO não chegou a modular nada");

  await pararEsperando(som);
  assert.equal(som.inspecionar().nos, 0);
});

test("dois toques no play antes de o navegador liberar o áudio não montam dois grafos", async (t) => {
  // Chrome/Safari entregam o AudioContext SUSPENSO até o primeiro gesto: é
  // exatamente aí que start() dorme num await e o guarda `tocando` ainda é
  // false. Dois toques rápidos (ou o botão do dock + o do card da Home)
  // montavam dois grafos completos: volume dobrado e CPU dobrada.
  const { registro } = comAudio(t, { estadoInicial: "suspended" });
  const som = createCosmicSound({ agora: () => dia("2026-07-30") });

  const a = som.start();
  const b = som.start();
  const [ra, rb] = await Promise.all([a, b]);

  assert.equal(ra.ok, true);
  assert.equal(rb.ok, true);
  assert.equal(registro.osciladores.length, 13, "montou o grafo duas vezes (volume e CPU dobrados)");
  assert.equal(registro.fontesBuffer.length, 1, "duas camadas de ruído tocando juntas");
  assert.equal(som.inspecionar().fontes, 14, "3 drone + 6 pad + 4 LFO + 1 ruído");

  await pararEsperando(som);
  assert.equal(som.inspecionar().nos, 0, "sobrou nó vivo depois do stop");
});

test("pausar enquanto o navegador libera o áudio para de verdade — o som não sobe sozinho depois", async (t) => {
  comAudio(t, { estadoInicial: "suspended" });
  const som = createCosmicSound({ agora: () => dia("2026-07-30") });

  const p = som.start();
  const s = som.stop();
  await adiantar(6_000);
  await p;
  await s;

  assert.equal(som.isPlaying(), false, "a pessoa apertou pausar e o som começou assim mesmo");
  assert.equal(som.inspecionar().nos, 0, "grafo vivo depois de um pause que devia ter valido");
  assert.equal(som.inspecionar().temporizadores, 0);
});

test("start() duas vezes seguidas não duplica o grafo", async (t) => {
  const { registro } = comAudio(t);

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.start();
  const depoisDoPrimeiro = registro.osciladores.length;
  const r = await som.start();
  assert.deepEqual(r, { ok: true, motivo: "ja-tocando" });
  assert.equal(registro.osciladores.length, depoisDoPrimeiro, "segundo start dobrou o volume real");

  await pararEsperando(som);
});

test("stop() duas vezes seguidas é seguro e não desmonta duas vezes", async (t) => {
  comAudio(t);
  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.start();

  const a = som.stop();
  const b = som.stop();
  await adiantar(6_000);
  await a;
  await b;
  assert.equal(som.isPlaying(), false);
  assert.deepEqual(await som.stop(), { ok: true, motivo: "ja-parado" });
});

test("toda transição é em rampa — nenhum parâmetro é atribuído direto com o som tocando", async (t) => {
  // Atribuir `.value` num parâmetro que já está soando produz um degrau de
  // amostra: o clique audível. Toda mudança precisa passar por rampa.
  const { registro } = comAudio(t);

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.start();
  const master = registro.ganhos.find((g) => g.conectadoA.includes(registro.contextos[0].destination));
  assert.ok(master, "o master precisa estar ligado no destination");

  const linhaDeBase = master.gain.atribuicoesDiretas; // montagem, ainda em silêncio
  assert.ok(
    master.gain.eventos.some((e) => e.tipo === "linear"),
    "o fade-in tem que ser rampa"
  );

  await som.setVolume(0.9);
  await som.setVolume(0.2);
  assert.equal(master.gain.atribuicoesDiretas, linhaDeBase, "setVolume cortou seco em vez de rampar");

  const eventosAntesDoStop = master.gain.eventos.length;
  await pararEsperando(som);
  assert.ok(master.gain.eventos.length > eventosAntesDoStop, "o fade-out também tem que ser rampa");
  assert.equal(master.gain.atribuicoesDiretas, linhaDeBase, "stop cortou seco");

  // E o fade sempre termina no silêncio.
  const ultimo = master.gain.eventos[master.gain.eventos.length - 1];
  assert.equal(ultimo.x, 0);
});

test("o fade-in sobe do silêncio até o ganho perceptual do volume", async (t) => {
  const { registro } = comAudio(t);
  memoriaStorage.clear();

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.setVolume(0.5);
  await som.start();
  const master = registro.ganhos.find((g) => g.conectadoA.includes(registro.contextos[0].destination));

  const primeiro = master.gain.eventos.find((e) => e.tipo === "set");
  assert.equal(primeiro.x, 0, "sempre entra do silêncio absoluto");
  const alvo = master.gain.eventos.find((e) => e.tipo === "linear");
  // 0.5 no slider = −20 dB = 0.1, vezes o teto de headroom 0.6.
  assert.ok(Math.abs(alvo.x - 0.1 * 0.6) < 1e-6, `alvo ${alvo.x}`);

  await pararEsperando(som);
  memoriaStorage.clear();
});

test("trocar de preset tocando remonta com rampa dos dois lados, sem oscilador órfão", async (t) => {
  const { registro } = comAudio(t);

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.start();
  const primeiraLeva = [...registro.osciladores];

  const troca = som.setPreset("solfeggio-528");
  await adiantar(10_000); // libera o stop interno e deixa o start remontar
  await troca;

  assert.equal(som.getPreset().id, "solfeggio-528");
  assert.equal(som.isPlaying(), true, "trocar preset não pode deixar o som mudo");
  for (const o of primeiraLeva) {
    assert.ok(o.parado, "oscilador da leva antiga sobreviveu à troca de preset");
  }
  assert.equal(registro.osciladores.slice(primeiraLeva.length)[0].frequency.value, 528);

  await pararEsperando(som);
});

test("dispose() fecha o contexto e deixa o motor reutilizável", async (t) => {
  const { registro } = comAudio(t);

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.start();

  const disposto = som.dispose();
  await adiantar(10_000);
  await disposto;

  assert.equal(registro.contextos[0].fechado, true, "o contexto precisa ser fechado, não só suspenso");
  assert.equal(som.inspecionar().nos, 0);
  assert.equal(som.inspecionar().estadoContexto, null);
  for (const f of todasAsFontes(registro)) assert.ok(f.parado);

  // Depois de dispose, um start novo cria um contexto novo em vez de estourar.
  const r = await som.start();
  assert.equal(r.ok, true);
  assert.equal(registro.contextos.length, 2);
  await pararEsperando(som);
});

test("carregarPreferencias traz volume e preset salvos pro motor", async (t) => {
  comAudio(t);
  memoriaStorage.clear();
  await salvarVolume(0.31);
  await salvarPreset("solfeggio-639");

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  const prefs = await som.carregarPreferencias();
  assert.deepEqual(prefs, { volume: 0.31, presetId: "solfeggio-639" });
  assert.equal(som.getVolume(), 0.31);
  assert.equal(som.getPreset().id, "solfeggio-639");
  memoriaStorage.clear();
});

test("a trama de pulsos nunca cai em loop: intervalos e alturas não se repetem em ciclo", async (t) => {
  // A promessa é "nunca repete". Um PRNG com período curto ou um intervalo fixo
  // seriam detectados aqui.
  const { registro } = comAudio(t);

  const som = createCosmicSound({ agora: () => dia("2026-07-30") });
  await som.start();
  adiantarRelogio(3_600_000); // 1 hora

  const pulsos = registro.osciladores.slice(13);
  assert.ok(pulsos.length >= 20, `só ${pulsos.length} pulsos em 1 h`);
  const alturas = pulsos.map((o) => o.frequency.value);
  assert.ok(new Set(alturas).size > 1, "todos os pulsos na mesma nota é loop disfarçado");
  for (const f of alturas) {
    // 330–1100 desde 31/07/2026: abaixo disso o celular não reproduz, acima
    // vira apito com horas de uso.
    assert.ok(f >= 330 && f <= 1100, `pulso em ${f} Hz, fora da faixa confortável`);
  }

  await pararEsperando(som);
});

test("dois dias diferentes geram tramas de pulso diferentes", async (t) => {
  const { registro } = comAudio(t);

  async function alturasDoDia(iso) {
    const marca = registro.osciladores.length;
    const som = createCosmicSound({ agora: () => dia(iso) });
    await som.start();
    adiantarRelogio(600_000);
    const alturas = registro.osciladores.slice(marca + 13).map((o) => Math.round(o.frequency.value));
    await pararEsperando(som);
    return alturas;
  }

  const a = await alturasDoDia("2026-07-30");
  const b = await alturasDoDia("2026-08-02");
  assert.ok(a.length > 3 && b.length > 3);
  assert.notDeepEqual(a, b, "o som de dois dias diferentes não pode ser idêntico");
});
