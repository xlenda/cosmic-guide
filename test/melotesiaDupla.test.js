// test/melotesiaDupla.test.js
// MELOTESIA DUPLA — Manílio × Sefer Yetzirah, e as travas que impedem esta
// feature de virar (a) invenção e (b) conselho de saúde.
//
// Sete leis, e a terceira é a razão de este arquivo existir:
//
//   1. AS DUAS LISTAS SÃO DUAS. Nenhuma função devolve "a parte do corpo do
//      signo": devolve duas colunas rotuladas, cada uma com o nome da obra
//      grudado. Fundir as duas fabricaria uma terceira lista que nunca
//      existiu — o erro que a auditoria do Homem Zodiacal achou nos sites.
//   2. A COLUNA LATINA NÃO É CÓPIA. O latim de Manílio vem de
//      lib/zodiacBody.js por importação; se alguém colar o verso aqui, os dois
//      podem divergir em silêncio. O teste lê o código-fonte para garantir.
//   3. NENHUMA ALEGAÇÃO DE SAÚDE, nos três idiomas, nem implícita. Melotesia é
//      o assunto em que essa linha é atravessada sem querer: basta uma frase
//      sobre o que a parte do corpo "sente" ou "precisa". Varredura de PALAVRA
//      (saúde, procedimento, orientação ao corpo de quem lê) nos três packs
//      inteiros, não só no que a leitura exercita por acaso.
//   4. PRENDE PRIMEIRO, FONTE DEPOIS. Chamada e aberturas sem nome próprio, sem
//      século, sem capítulo. O primeiro parágrafo da explicação também.
//   5. A CONTA É CONTA. concordam = 0 sai da comparação linha a linha, não de
//      um número escrito à mão — e o texto que a narra usa os mesmos números.
//   6. A DATAÇÃO PASSA POR datacao.js. Obra não traduz, autor ganha a forma
//      consagrada, século ganha a forma da língua.
//   7. O BLOQUEIO FICA VISÍVEL. Enquanto a edição crítica de Hayman não for
//      consultada, toda leitura carrega a ressalva na cara do usuário.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const M = require('../lib/melotesiaDupla.js');
const { ZODIAC_BODY } = require('../lib/zodiacBody.js');
const { SIGNS, signoFromDate } = require('../lib/signs.js');
const PT = require('../lib/traducoes/melotesiaDupla.pt.js').PACK;
const ES = require('../lib/traducoes/melotesiaDupla.es.js').PACK;
const EN = require('../lib/traducoes/melotesiaDupla.en.js').PACK;

const LANGS = { pt: PT, es: ES, en: EN };
const IDIOMAS = ['pt', 'es', 'en'];
const SP = { id: 'sao-paulo-br', name: 'São Paulo', lat: -23.5505, lon: -46.6333, utcOffset: -3, timezone: 'America/Sao_Paulo' };

const TELA = { pt: 'Homem Zodiacal', es: 'Hombre Zodiacal', en: 'Zodiac Man' };
const TELA_NASCIMENTO = { pt: 'Mapa Astral', es: 'Carta Astral', en: 'Birth Chart' };
// A OBRA não traduz; o ponteiro de capítulo, sim.
const CAP_SEFER = { pt: 'Sefer Yetzirah, cap. 5', es: 'Sefer Yetzirah, cap. 5', en: 'Sefer Yetzirah, ch. 5' };

const LEITURA = {};
for (const lang of IDIOMAS) LEITURA[lang] = M.melotesiaDupla(lang);

// ===========================================================================
// 1. AS DUAS LISTAS — integridade dos dados
// ===========================================================================

test('as doze linhas cobrem os doze signos de lib/zodiacBody.js, na ordem, com as duas colunas', () => {
  assert.equal(M.MELOTESIA_DUPLA.length, 12);
  assert.ok(M.cobreOsDoze(), 'a lista dupla divergiu de ZODIAC_BODY — a tela ficaria com buraco silencioso');
  for (let i = 0; i < 12; i++) {
    const l = M.MELOTESIA_DUPLA[i];
    assert.equal(l.id, ZODIAC_BODY[i].id);
    assert.equal(l.signo, ZODIAC_BODY[i].sign);
    assert.equal(l.signo, SIGNS[i].name, `${l.id}: o nome do signo saiu do trilho de lib/signs.js`);
    assert.ok(l.manilio.latim && l.manilio.locus, `${l.id}: coluna latina incompleta`);
    assert.ok(l.sefer && l.sefer.letra && l.sefer.orgao, `${l.id}: coluna hebraica incompleta`);
  }
});

test('a coluna latina é IMPORTADA de lib/zodiacBody.js, não copiada', () => {
  for (const l of M.MELOTESIA_DUPLA) {
    const fonte = ZODIAC_BODY.find((e) => e.id === l.id);
    assert.equal(l.manilio.latim, fonte.latin, `${l.id}: o latim divergiu da fonte`);
    assert.equal(l.manilio.locus, fonte.locus, `${l.id}: o verso divergiu da fonte`);
    assert.match(l.manilio.locus, /^Astronomica II\./, `${l.id}: locus suspeito`);
    assert.doesNotMatch(l.manilio.locus, /Tetrabiblos/i, `${l.id}: a lista dos doze signos é de Manílio, não de Ptolomeu`);
  }
  // Se alguém colar o verso latino aqui, os dois arquivos podem divergir sem
  // ninguém ver. O motor não pode conter latim de Manílio.
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'melotesiaDupla.js'), 'utf8');
  for (const trecho of ['caput est ante omnia', 'pulcherrima colla', 'Piscesque pedum', 'inguine gaudet']) {
    assert.ok(!src.includes(trecho), `lib/melotesiaDupla.js copiou o latim ("${trecho}") em vez de importar de zodiacBody`);
  }
});

test('as doze letras simples, os doze meses e os doze órgãos são doze coisas distintas', () => {
  const letras = M.SEFER_YETZIRAH.map((s) => s.letra);
  const meses = M.SEFER_YETZIRAH.map((s) => s.mes);
  const orgaos = M.SEFER_YETZIRAH.map((s) => s.orgao);
  assert.equal(new Set(letras).size, 12, 'letra repetida na lista hebraica');
  assert.equal(new Set(meses).size, 12, 'mês repetido na lista hebraica');
  assert.equal(new Set(orgaos).size, 12, 'órgão repetido na lista hebraica');
  for (const s of M.SEFER_YETZIRAH) {
    assert.match(s.letraHebraica, /^[֐-׿]$/, `${s.id}: o glifo hebraico não é hebraico`);
    assert.ok(M.TIPOS.includes(s.tipo), `${s.id}: tipo fora do vocabulário`);
  }
  // Os quatro membros e as oito vísceras — a forma da lista hebraica.
  assert.equal(M.SEFER_YETZIRAH.filter((s) => s.tipo === 'membro').length, 4);
  assert.equal(M.SEFER_YETZIRAH.filter((s) => s.tipo === 'viscera').length, 8);
});

test('o nome do órgão nunca é chave crua, e existe nos três idiomas', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.deepEqual(
      Object.keys(pack.orgaos).sort(),
      M.SEFER_YETZIRAH.map((s) => s.orgao).sort(),
      `${lang}: as chaves de órgão divergiram do motor`
    );
    for (const [chave, nome] of Object.entries(pack.orgaos)) {
      assert.ok(nome.trim().length > 2, `${lang}/${chave} vazio`);
      assert.notEqual(nome, chave, `${lang}/${chave} saiu como chave crua`);
    }
  }
});

// ===========================================================================
// 2. NÃO FUNDIR — a regra estrutural da feature
// ===========================================================================

test('nenhuma leitura devolve "a parte do corpo do signo" — devolve duas colunas rotuladas', () => {
  for (const lang of IDIOMAS) {
    for (const par of LEITURA[lang].pares) {
      assert.ok(par.manilio.tradicao && par.sefer.tradicao, `${lang}/${par.id}: coluna sem rótulo de tradição`);
      assert.notEqual(par.manilio.tradicao, par.sefer.tradicao, `${lang}/${par.id}: as duas colunas têm o mesmo rótulo`);
      assert.ok(par.manilio.parte && par.sefer.orgao, `${lang}/${par.id}: coluna sem parte`);
      assert.notEqual(par.manilio.parte, par.sefer.orgao, `${lang}/${par.id}: as duas colunas nomearam a mesma parte`);
      // Cada coluna carrega o próprio locus e a própria datação.
      assert.ok(par.manilio.locus.includes('Astronomica'), `${lang}/${par.id}`);
      assert.ok(par.sefer.locus.startsWith('Sefer Yetzirah'), `${lang}/${par.id}`);
      assert.notEqual(par.manilio.quando, par.sefer.quando, `${lang}/${par.id}: as duas datações viraram uma`);
      // E a ressalva de não fundir anda junto.
      assert.ok(par.notaNaoFundir.length > 120, `${lang}/${par.id}`);
    }
    assert.ok(LEITURA[lang].notaNaoFundir.length > 120, lang);
  }
});

test('não existe campo nenhum que some, escolha ou meça as duas listas', () => {
  for (const lang of IDIOMAS) {
    const r = LEITURA[lang];
    assert.equal(r.parte, undefined, 'apareceu uma parte única — isso é a terceira lista nascendo');
    assert.equal(r.consenso, undefined);
    assert.equal(r.media, undefined);
    for (const par of r.pares) {
      assert.equal(par.parte, undefined, `${lang}/${par.id}: parte fora das colunas`);
      assert.equal(par.orgao, undefined, `${lang}/${par.id}: órgão fora das colunas`);
      assert.equal(par.vencedor, undefined);
      assert.equal(par.score, undefined);
      assert.equal(par.pct, undefined);
    }
  }
});

// ===========================================================================
// 3. A CONTA — aritmética sobre as duas listas, não número escrito à mão
// ===========================================================================

test('a contagem fecha: zero coincidências, duas vizinhanças, dez divergências', () => {
  const c = M.contagem();
  assert.equal(c.total, 12);
  assert.equal(c.concordam + c.vizinhas + c.divergem, 12, 'a soma das relações não fecha em 12');
  assert.equal(c.concordam, 0, 'apareceu uma coincidência entre as listas — reconferir contra as fontes antes de aceitar');
  assert.equal(c.vizinhas, 2);
  assert.equal(c.divergem, 10);
  // As duas vizinhanças são Leão (rim no flanco) e Escorpião (virilha e
  // intestino no baixo-ventre). Nenhuma outra.
  assert.deepEqual(
    M.MELOTESIA_DUPLA.filter((l) => l.relacao === 'vizinhas').map((l) => l.id),
    ['leao', 'escorpiao']
  );
  // Só Gêmeos tem as duas colunas na mesma categoria de parte.
  assert.deepEqual(M.MELOTESIA_DUPLA.filter((l) => l.mesmoTipo).map((l) => l.id), ['gemeos']);
  assert.equal(c.mesmoTipo, 1);
});

test('a forma do desencontro: Manílio não tem víscera nenhuma, o Sefer Yetzirah não tem superfície nenhuma', () => {
  const c = M.contagem();
  assert.equal(c.manilioViscera, 0, 'entrou uma víscera na lista de Manílio — ele não tem nenhuma');
  assert.equal(c.seferSuperficie, 0, 'entrou uma superfície na lista hebraica — ela não tem nenhuma');
  assert.equal(c.manilioSuperficie + c.manilioMembro + c.manilioViscera, 12);
  assert.equal(c.seferSuperficie + c.seferMembro + c.seferViscera, 12);
  assert.equal(c.manilioSuperficie, 7);
  assert.equal(c.manilioMembro, 5);
  assert.equal(c.seferMembro, 4);
  assert.equal(c.seferViscera, 8);
});

test('o texto da estrutura usa os números da contagem, nos três idiomas', () => {
  const c = M.contagem();
  for (const lang of IDIOMAS) {
    const texto = LEITURA[lang].estrutura;
    for (const n of [c.total, c.vizinhas, c.divergem, c.manilioSuperficie, c.seferViscera]) {
      assert.ok(texto.includes(String(n)), `${lang}: a estrutura não cita ${n}`);
    }
    assert.ok(texto.includes('0'), `${lang}: o zero de coincidências sumiu do texto`);
    assert.ok(texto.split('\n\n').length >= 2, `${lang}: a estrutura veio num bloco só`);
  }
});

// ===========================================================================
// 4. OS TRÊS IDIOMAS — paridade, e nada por interpolar
// ===========================================================================

function forma(v) {
  if (typeof v === 'function') return 'fn';
  if (Array.isArray(v)) return v.map(forma);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = forma(v[k]);
    return o;
  }
  return typeof v;
}

function varrerStrings(v, caminho, cb) {
  if (typeof v === 'string') return cb(caminho, v);
  if (Array.isArray(v)) return v.forEach((x, i) => varrerStrings(x, `${caminho}[${i}]`, cb));
  if (v && typeof v === 'object') for (const k of Object.keys(v)) varrerStrings(v[k], `${caminho}.${k}`, cb);
}

test('es e en têm EXATAMENTE a mesma forma do pt — mesmas chaves, mesmos tipos', () => {
  const formaPt = forma(PT);
  assert.deepEqual(forma(ES), formaPt, 'o pack es divergiu da forma do pt');
  assert.deepEqual(forma(EN), formaPt, 'o pack en divergiu da forma do pt');
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.deepEqual(Object.keys(pack.signos).sort(), M.MELOTESIA_DUPLA.map((l) => l.id).sort(), lang);
    assert.deepEqual(Object.keys(pack.relacoes).sort(), [...M.RELACOES].sort(), lang);
    assert.deepEqual(Object.keys(pack.tipos).sort(), [...M.TIPOS].sort(), lang);
    assert.deepEqual(Object.keys(pack.camadaTardia).sort(), ['cancer', 'leao'], lang);
    // O nome da tela é o do idioma — é o que a fiação vai usar no cabeçalho e
    // o que o "onde resolver" precisa citar.
    assert.equal(pack.tela, TELA[lang], `${lang}: nome da tela fora do idioma`);
    assert.equal(pack.telaDoNascimento, TELA_NASCIMENTO[lang], lang);
    assert.equal(pack.idioma, lang);
  }
});

test('nenhum valor de nenhum pack é vazio', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    varrerStrings(pack, lang, (caminho, s) => assert.ok(s.trim().length > 0, `${caminho} está vazio`));
  }
});

// Tudo que o usuário lê, num idioma.
function corpusDaTela(r) {
  const pedacos = [r.chamada, r.explicacao, r.estrutura, r.notaDaClassificacao, r.notaNaoFundir, r.notaLeituraDoApp, r.notaKorkeban, r.bloqueio, ...r.fonte];
  for (const p of r.pares) {
    pedacos.push(
      p.signoNome, p.abertura, p.leitura, p.recibo, p.relacaoNome,
      p.manilio.tradicao, p.manilio.parte, p.manilio.quando, p.manilio.tipoNome, p.manilio.camadaTardia,
      p.sefer.tradicao, p.sefer.orgao, p.sefer.quando, p.sefer.tipoNome, p.sefer.notaDaPalavra
    );
  }
  return pedacos.filter(Boolean).join(' \n ');
}

test('a tela sai INTEIRA nos três idiomas — nenhum campo perdido, nada por interpolar', () => {
  for (const lang of IDIOMAS) {
    const r = LEITURA[lang];
    assert.equal(r.pares.length, 12, lang);
    assert.equal(r.fonte.length, 6, lang);
    for (const campo of ['chamada', 'explicacao', 'estrutura', 'notaDaClassificacao', 'notaNaoFundir', 'notaLeituraDoApp', 'notaKorkeban', 'bloqueio']) {
      assert.ok(r[campo] && r[campo].length > 80, `${lang} perdeu ${campo}`);
    }
    const c = corpusDaTela(r);
    assert.ok(!c.includes('undefined'), `${lang} vazou "undefined"`);
    assert.ok(!c.includes('[object Object]'), `${lang} vazou objeto`);
    assert.ok(!c.includes('NaN'), `${lang} vazou NaN`);
    assert.ok(!/\$\{|\{\w+\}/.test(c), `${lang} vazou placeholder sem interpolar`);
    for (const p of r.pares) {
      assert.ok(p.abertura.length > 60, `${lang}/${p.id}: abertura curta demais`);
      assert.ok(p.leitura.length > 200, `${lang}/${p.id}: leitura curta demais`);
      assert.ok(p.recibo.includes(p.manilio.latim), `${lang}/${p.id}: o recibo perdeu o verso latino`);
      assert.ok(p.recibo.includes(p.sefer.letraHebraica), `${lang}/${p.id}: o recibo perdeu a letra hebraica`);
    }
  }
});

test('es e en não vazam português, e não repetem o pt', () => {
  const PT_MARCADO = /\bvocê\b|\bnão\b|\bsão\b|\bmês\b|\bórgão\b|\bcorpo\b|\bcabeça\b|\bpescoço\b|\bf[íi]gado\b|\bbaço\b|\brecens[ãa]o\b|\bleitura\b|\bvizinhas\b/i;
  for (const lang of ['es', 'en']) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      assert.ok(!PT_MARCADO.test(s), `${caminho} vazou português: ${s.match(PT_MARCADO)}`);
    });
    for (let i = 0; i < 12; i++) {
      assert.notEqual(LEITURA[lang].pares[i].abertura, LEITURA.pt.pares[i].abertura, `${lang} abertura igual ao pt`);
      assert.notEqual(LEITURA[lang].pares[i].leitura, LEITURA.pt.pares[i].leitura, `${lang} leitura igual ao pt`);
    }
    assert.notEqual(LEITURA[lang].chamada, LEITURA.pt.chamada);
    assert.notEqual(LEITURA[lang].explicacao, LEITURA.pt.explicacao);
  }
});

test('os DADOS não mudam com o idioma — mesma relação, mesma letra, mesmo verso', () => {
  for (let i = 0; i < 12; i++) {
    const pt = LEITURA.pt.pares[i];
    for (const lang of ['es', 'en']) {
      const outro = LEITURA[lang].pares[i];
      assert.equal(outro.id, pt.id);
      assert.equal(outro.relacao, pt.relacao);
      assert.equal(outro.manilio.latim, pt.manilio.latim, 'o latim não se traduz');
      assert.equal(outro.manilio.locus, pt.manilio.locus, 'o locus não se traduz');
      assert.equal(outro.sefer.letra, pt.sefer.letra);
      assert.equal(outro.sefer.letraHebraica, pt.sefer.letraHebraica);
      assert.equal(outro.sefer.mes, pt.sefer.mes);
      assert.equal(outro.sefer.recensao, pt.sefer.recensao);
    }
  }
  assert.deepEqual(M.contagem(), M.contagem());
});

test("lang ausente e lang='pt' são a MESMA leitura; idioma desconhecido cai no PT", () => {
  assert.deepEqual(M.parDeSigno('aries'), M.parDeSigno('aries', 'pt'));
  assert.deepEqual(M.parDeSigno('aries', 'fr'), M.parDeSigno('aries', 'pt'));
  assert.deepEqual(M.melotesiaDupla().chamada, M.melotesiaDupla('pt').chamada);
  assert.deepEqual(M.parDoNascimento('1990-06-15', null, null), M.parDoNascimento('1990-06-15', null, null, 'pt'));
});

// ===========================================================================
// 5. A LINHA VERMELHA, NOS TRÊS IDIOMAS
// ===========================================================================
// Lista de PALAVRA, não de intenção. Melotesia é justamente o assunto em que a
// frase proibida entra sozinha: basta dizer o que a parte do corpo "sente".

const SAUDE = {
  pt: [
    /\b(alivi\w*|acalm\w*|cur(a|as|ar|am|ando)|sar(a|ar|am)|trat(a|am|ar|amento|amentos)|energiz\w*|terapia|terap[êe]utic\w*|rem[ée]dio|sintoma\w*|doen[çc]a\w*)\b/i,
    /\bfertilidade\b|\bf[ée]rtil\b|engravidar|gravidez|ansiedade|depress[ãa]o|ins[ôo]nia|\bsa[úu]de\b/i,
  ],
  es: [
    /\b(alivi\w*|calm\w*|san(a|an|ar|aci[óo]n)|cur(a|an|ar|aci[óo]n)|trat(a|an|ar|amiento|amientos)|energiz\w*|terapia|terap[ée]utic\w*|remedio|s[íi]ntoma\w*|enfermedad\w*)\b/i,
    /\bfertilidad\b|\bf[ée]rtil\b|embarazo|embarazada|ansiedad|depresi[óo]n|insomnio|\bsalud\b/i,
  ],
  en: [
    /\b(relieve[sd]?|relief|sooth\w*|calm\w*|heal\w*|cure[sd]?|curing|treat(s|ed|ing|ment|ments)?|energiz\w*|therapy|therapeutic|remedy|remedies|symptom\w*|disease\w*|illness\w*)\b/i,
    /\bfertility\b|\bfertile\b|pregnan\w*|anxiety|depression|insomnia/i,
  ],
};

// Momento bom ou ruim para mexer no corpo — a herança direta da iatromatemática,
// e a fronteira que lib/zodiacBody.js já guarda na outra tela.
const PROCEDIMENTO = [
  /sangri(a|ar|as)/i, /sangr(í|i)a/i, /bloodlett?ing/i, /flebotom/i,
  /cirurgi/i, /cirug(í|i)a/i, /\bsurgery\b/i,
  /procedimento/i, /procedimiento/i, /\bprocedure\b/i,
  /tratamento/i, /tratamiento/i, /\btreatment\b/i,
  /\bexame\b/i, /\bexamen\b/i, /\blancet/i, /\bdieta\b/i, /\bdiet\b/i,
];

// Verbo dirigido ao corpo de quem lê. Sempre com \b, para não pegar a forma no
// passado ("os médicos evitavam"), que é a forma PERMITIDA.
const ORIENTACAO = [
  /\bcuide\b/i, /\bevite\b/i, /\bfortale(ç|c)a\b/i, /\bproteja\b/i, /\bprevina\b/i,
  /\bponto fraco\b/i, /\bbom momento para\b/i, /\btend(ê|e)ncia a (ter|sofrer|desenvolver)\b/i,
  /\bcuida\b/i, /\bcuid[aá] /i, /\bevita\b/i, /\bevit[aá] /i, /\bfortalece\b/i, /\bprotege\b/i,
  /punto d(é|e)bil/i, /\bbuen momento para\b/i,
  /\btake care of\b/i, /\bwatch out for\b/i, /\bbe careful with\b/i, /\bgood time to\b/i,
  /\bweak (point|spot)\b/i, /\byou should\b/i, /\bavoid\b/i, /\bstrengthen\b/i,
];

const PROMESSA = {
  pt: [/\bvocê vai\b/i, /\bvai (ter|conseguir|ganhar|dar certo|acontecer)\b/i, /garant\w+/i, /sorte grande/i, /\bisso significa que você\b/i],
  es: [/\bvas a (tener|lograr|conseguir|ganar)\b/i, /garantiz\w+/i, /suerte grande/i, /\beso significa que eres\b/i],
  en: [/\byou will\b/i, /\byou'?re going to\b/i, /guarantee\w*/i, /destined to/i, /\bfated to\b/i, /\bthis means you are\b/i],
};

test('nenhum texto, em nenhum idioma, usa linguagem de saúde', () => {
  for (const [lang, regexes] of Object.entries(SAUDE)) {
    const c = corpusDaTela(LEITURA[lang]);
    for (const re of regexes) assert.ok(!re.test(c), `${lang} — linha vermelha na tela: ${c.match(re)}`);
    // E o pack inteiro, inclusive o que a leitura não exercita por acaso.
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — linha vermelha: ${s.match(re)}`);
    });
  }
  // Contrapartida: varredura que não morde não protege ninguém.
  assert.ok(SAUDE.pt.some((re) => re.test('isso alivia a dor e cura o fígado')));
  assert.ok(SAUDE.es.some((re) => re.test('esto calma y sana el hígado')));
  assert.ok(SAUDE.en.some((re) => re.test('this will heal and soothe the liver')));
});

test('nenhum texto vira calendário de procedimento nem orienta o corpo de quem lê', () => {
  for (const lang of IDIOMAS) {
    const c = corpusDaTela(LEITURA[lang]);
    for (const re of [...PROCEDIMENTO, ...ORIENTACAO]) {
      assert.ok(!re.test(c), `${lang} — a tela orientou o corpo ou marcou procedimento: ${c.match(re)}`);
    }
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of [...PROCEDIMENTO, ...ORIENTACAO]) {
        assert.ok(!re.test(s), `${caminho} — orientação ao corpo: ${s.match(re)}`);
      }
    });
  }
  assert.ok(PROCEDIMENTO.some((re) => re.test('bom dia para uma cirurgia')));
  assert.ok(ORIENTACAO.some((re) => re.test('cuide dos joelhos neste período')));
});

test('nenhum texto promete resultado, decreta veredito ou mostra porcentagem', () => {
  for (const [lang, regexes] of Object.entries(PROMESSA)) {
    const c = corpusDaTela(LEITURA[lang]);
    for (const re of regexes) assert.ok(!re.test(c), `${lang} — promessa: ${c.match(re)}`);
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — promessa: ${s.match(re)}`);
    });
    assert.ok(!c.includes('%'), `${lang} mostra porcentagem`);
  }
  assert.ok(PROMESSA.pt.some((re) => re.test('você vai conseguir')));
  assert.ok(PROMESSA.en.some((re) => re.test('you will get it')));
});

// Nenhum aviso defensivo: eles foram removidos do app de propósito, e escrever
// um novo é bug.
test('nenhum aviso defensivo voltou a aparecer', () => {
  const DEFENSIVO = [
    /apenas entretenimento/i, /n[ãa]o garante resultados/i, /sem valor cient[íi]fico/i,
    /solo entretenimiento/i, /no garantiza/i,
    /for entertainment (purposes )?only/i, /does not guarantee/i, /not a substitute for/i,
  ];
  for (const lang of IDIOMAS) {
    const c = corpusDaTela(LEITURA[lang]);
    for (const re of DEFENSIVO) assert.ok(!re.test(c), `${lang} — aviso defensivo: ${c.match(re)}`);
  }
});

// ===========================================================================
// 6. PRENDE PRIMEIRO, FONTE DEPOIS
// ===========================================================================

const JARGAO = [
  /Man[íi]lio|Manilius|Ptolomeu|Ptolomeo|Ptolemy|Tetrabiblos|Astronomica|Sefer|Yetzirah|Hayman|Kaplan|Westcott/i,
  /\bs[ée]c\.|\bsiglo\b|\bcentury\b|\bsiglos\b/i,
  /\b[IVX]+\.\d+\b/,
  /melotesia|melothesia/i,
  /recens[ãa]o|recensi[óo]n|recension/i,
  /latim|lat[íi]n|verbatim/i,
];

test('a CHAMADA abre na vida real: nenhum nome próprio, nenhum século, nenhum termo técnico', () => {
  for (const lang of IDIOMAS) {
    for (const re of JARGAO) {
      assert.ok(!re.test(LEITURA[lang].chamada), `${lang}: a chamada abriu com jargão — ${LEITURA[lang].chamada.match(re)}`);
    }
    assert.ok(LEITURA[lang].chamada.length > 150 && LEITURA[lang].chamada.length < 420, `${lang}: chamada com ${LEITURA[lang].chamada.length}`);
  }
});

test('a ABERTURA de cada um dos doze signos é cena de vida real, não erudição', () => {
  for (const lang of IDIOMAS) {
    for (const par of LEITURA[lang].pares) {
      for (const re of JARGAO) {
        assert.ok(!re.test(par.abertura), `${lang}/${par.id}: abertura com jargão — ${par.abertura.match(re)}`);
      }
      // E a fonte está na leitura, que vem depois.
      assert.match(par.leitura, /Manílio|Manilio|Manilius/);
      assert.match(par.leitura, /Sefer Yetzirah/);
    }
  }
});

test('o PRIMEIRO parágrafo da explicação também é vida real; a fonte vem DEPOIS', () => {
  for (const lang of IDIOMAS) {
    const paragrafos = LEITURA[lang].explicacao.split('\n\n');
    assert.ok(paragrafos.length >= 4, `${lang}: a explicação tem ${paragrafos.length} parágrafos`);
    for (const re of JARGAO) {
      assert.ok(!re.test(paragrafos[0]), `${lang}: a abertura vazou jargão — ${paragrafos[0].match(re)}`);
    }
    const texto = LEITURA[lang].explicacao;
    assert.match(texto, /Astronomica II\.453-465/);
    assert.match(texto, /Sefer Yetzirah/);
    assert.ok(texto.indexOf('Astronomica') > paragrafos[0].length, `${lang}: a fonte abriu a leitura`);
    assert.ok(texto.length > 1200, `${lang}: explicação curta demais (${texto.length})`);
  }
});

// ===========================================================================
// 7. A FONTE, E SÓ A FONTE
// ===========================================================================

test('toda afirmação histórica carrega obra, autor e século', () => {
  for (const lang of IDIOMAS) {
    const fonte = LEITURA[lang].fonte;
    assert.equal(fonte.length, 6);
    assert.ok(fonte.some((f) => f.includes('Astronomica II.453-465')), `${lang}: sumiu a obra de Manílio`);
    assert.ok(fonte.some((f) => f.includes(CAP_SEFER[lang])), `${lang}: sumiu a obra hebraica`);
    assert.ok(fonte.some((f) => f.includes('Tetrabiblos III.xvii')), `${lang}: sumiu a lista planetária`);
    assert.ok(fonte.some((f) => f.includes('Hayman')), `${lang}: sumiu a edição crítica`);
    assert.ok(fonte.some((f) => f.includes('2004')), `${lang}: a edição crítica perdeu o ano`);
    for (const par of LEITURA[lang].pares) {
      assert.ok(par.recibo.includes(par.manilio.locus), `${lang}/${par.id}: recibo sem o verso`);
      assert.ok(par.recibo.includes(CAP_SEFER[lang]), `${lang}/${par.id}: recibo sem o capítulo hebraico`);
      assert.equal(par.sefer.locus, CAP_SEFER[lang], `${lang}/${par.id}: o ponteiro de capítulo não falou a língua`);
      assert.ok(par.recibo.includes(par.sefer.recensao), `${lang}/${par.id}: recibo sem a recensão`);
      assert.ok(par.recibo.includes(par.manilio.quando) && par.recibo.includes(par.sefer.quando), `${lang}/${par.id}: recibo sem datação`);
    }
  }
});

test('a datação passa por traducoes/datacao.js: obra não traduz, autor e século sim', () => {
  const q = { pt: 'séc. I d.C.', es: 'siglo I d.C.', en: '1st c. AD' };
  const qSefer = { pt: 'séc. II–VI d.C.', es: 'siglo II–VI d.C.', en: '2nd–6th c. AD' };
  const autor = { pt: 'Manílio', es: 'Manilio', en: 'Manilius' };
  for (const lang of IDIOMAS) {
    const par = M.parDeSigno('aries', lang);
    assert.equal(par.manilio.quando, q[lang], `${lang}: o século de Manílio não falou a língua`);
    assert.equal(par.sefer.quando, qSefer[lang], `${lang}: o século do Sefer Yetzirah não falou a língua`);
    assert.equal(par.manilio.autor, autor[lang], `${lang}: o autor não ganhou a forma consagrada`);
    assert.ok(par.recibo.startsWith(autor[lang]), `${lang}: o recibo abre com o autor na língua errada`);
    // A OBRA nunca traduz, em nenhum dos três.
    assert.ok(par.manilio.locus.startsWith('Astronomica II.'), lang);
    assert.equal(par.sefer.locus, CAP_SEFER[lang], lang);
    assert.ok(par.sefer.locus.startsWith('Sefer Yetzirah'), 'o título da obra não traduz em nenhum idioma');
  }
  assert.equal(M.autorNaLingua('Ptolomeu', 'en'), 'Ptolemy', 'o mapa canônico de datacao.js deixou de responder');
  assert.equal(M.autorNaLingua('Manílio', 'pt'), 'Manílio');
});

test('a lista PLANETÁRIA de Ptolomeu aparece para desfazer coração-de-Leão e rins-de-Libra', () => {
  for (const lang of IDIOMAS) {
    const leao = LEITURA[lang].pares.find((p) => p.id === 'leao');
    const libra = LEITURA[lang].pares.find((p) => p.id === 'libra');
    assert.ok(leao.manilio.camadaTardia, `${lang}: Leão perdeu a nota da camada popular`);
    assert.match(leao.manilio.camadaTardia, /Tetrabiblos III\.xvii/, lang);
    assert.match(libra.leitura, /Tetrabiblos III\.xvii/, `${lang}: Libra sem o recibo dos rins de Marte`);
    // E os dez restantes não inventam camada popular nenhuma.
    const comCamada = LEITURA[lang].pares.filter((p) => p.manilio.camadaTardia).map((p) => p.id);
    assert.deepEqual(comCamada, ['cancer', 'leao'], lang);
  }
  // O motor tira isso de lateLayer, em lib/zodiacBody.js — não de lista própria.
  assert.deepEqual(ZODIAC_BODY.filter((e) => e.lateLayer).map((e) => e.id), ['cancer', 'leao']);
});

test('a confiança de cada coluna é declarada, e a hebraica NÃO é alta', () => {
  for (const lang of IDIOMAS) {
    for (const par of LEITURA[lang].pares) {
      assert.equal(par.manilio.confianca, 'alta', `${lang}/${par.id}`);
      assert.equal(par.sefer.confianca, 'media', `${lang}/${par.id}: a coluna hebraica não pode andar como alta antes de Hayman`);
    }
  }
});

test('o BLOQUEIO de publicação fica visível em toda leitura enquanto não for resolvido', () => {
  assert.equal(M.BLOQUEIO.resolvido, false);
  assert.match(M.BLOQUEIO.obra, /Hayman/);
  assert.ok(M.BLOQUEIO.texto.length > 200);
  for (const lang of IDIOMAS) {
    assert.ok(LEITURA[lang].bloqueio, `${lang}: a tela perdeu a ressalva de Hayman`);
    assert.match(LEITURA[lang].bloqueio, /Hayman/, lang);
    assert.match(LEITURA[lang].bloqueio, /2004/, lang);
    for (const par of LEITURA[lang].pares) assert.ok(par.bloqueio, `${lang}/${par.id}`);
    assert.ok(M.parDoNascimento(null, null, null, lang).bloqueio, `${lang}: a ressalva sumiu quando faltou dado`);
  }
});

test('a classificação vem rotulada como leitura do app, não como afirmação das fontes', () => {
  const MARCA = { pt: /leitura do app/i, es: /lectura de la app/i, en: /reading by the app/i };
  for (const lang of IDIOMAS) {
    assert.match(LEITURA[lang].notaDaClassificacao, MARCA[lang], lang);
    assert.match(LEITURA[lang].notaLeituraDoApp, /Astronomica II\.453-465/, lang);
    assert.match(LEITURA[lang].notaLeituraDoApp, /Sefer Yetzirah/, lang);
    for (const par of LEITURA[lang].pares) assert.match(par.notaDaClassificacao, MARCA[lang], `${lang}/${par.id}`);
  }
});

test('korkeban fica sem traduzir, e a nota que explica isso só aparece onde ele aparece', () => {
  for (const lang of IDIOMAS) {
    const aquario = LEITURA[lang].pares.find((p) => p.id === 'aquario');
    assert.match(aquario.sefer.orgao, /Korkeban/i, lang);
    assert.ok(aquario.sefer.notaDaPalavra, `${lang}: Aquário perdeu a nota da palavra`);
    assert.match(aquario.sefer.notaDaPalavra, /קורקבן/, `${lang}: a nota perdeu o hebraico`);
    const outros = LEITURA[lang].pares.filter((p) => p.sefer.notaDaPalavra).map((p) => p.id);
    assert.deepEqual(outros, ['aquario'], lang);
  }
});

test('o que a pesquisa não achou continua não achado, e está escrito', () => {
  const ids = M.NAO_ACHADO.map((x) => x.id).sort();
  assert.deepEqual(ids, [
    'contatoEntreAsListas', 'datacaoDoSefer', 'orgaoNaListaLatina',
    'razaoDoPeDireito', 'recensaoUnica', 'traducaoDeKorkeban',
  ]);
  for (const x of M.NAO_ACHADO) assert.ok(x.texto.length > 150, `${x.id} declarado de qualquer jeito`);
  assert.match(M.NAO_ACHADO.find((x) => x.id === 'contatoEntreAsListas').texto, /independentes|cite o outro/);
});

// ===========================================================================
// 8. O SIGNO DE QUEM ESTÁ LENDO — sem fabricar céu
// ===========================================================================

test('parDeSigno aceita id e nome do signo, com ou sem acento, em qualquer caixa', () => {
  const alvo = M.parDeSigno('aries');
  assert.deepEqual(M.parDeSigno('Áries'), alvo);
  assert.deepEqual(M.parDeSigno('ARIES'), alvo);
  assert.deepEqual(M.parDeSigno('  aries  '), alvo);
  assert.equal(M.parDeSigno('Gêmeos').id, 'gemeos');
  assert.equal(M.parDeSigno('gemeos').id, 'gemeos');
  assert.equal(M.parDeSigno('Capricórnio').id, 'capricornio');
  assert.equal(M.parDeSigno('Ofiúco'), null, 'signo inexistente tem que devolver null, nunca um chute');
  assert.equal(M.parDeSigno(''), null);
  assert.equal(M.parDeSigno(null), null);
  assert.equal(M.parDeSigno(42), null);
});

test('sem data de nascimento, declara indisponível e diz ONDE informar — nunca chuta o signo', () => {
  for (const lang of IDIOMAS) {
    for (const data of [null, '', '15/06/1990', '1990-02-30', 42]) {
      const r = M.parDoNascimento(data, '14:30', SP, lang);
      assert.equal(r.disponivel, false, `${lang}: ${data}`);
      assert.equal(r.par, null);
      assert.equal(r.signo, null);
      assert.equal(r.precisao, null);
      assert.deepEqual(r.falta, ['data']);
      assert.ok(r.explicacao.length > 80, `${lang}: a explicação do que falta não pode ser rótulo seco`);
      assert.ok(r.comoResolver.includes(TELA_NASCIMENTO[lang]), `${lang}: não disse onde informar — ${r.comoResolver}`);
      // A doutrina não some porque falta um campo.
      assert.equal(r.fonte.length, 6);
    }
  }
});

test('hora e cidade PODEM faltar: o par sai, e a perda de precisão é declarada', () => {
  const comTudo = M.parDoNascimento('1990-06-15', '14:30', SP);
  assert.equal(comTudo.disponivel, true);
  assert.equal(comTudo.precisao, 'instante');
  assert.equal(comTudo.notaPrecisao, null, 'com data, hora e cidade não há ressalva de precisão a fazer');
  assert.equal(comTudo.signo, signoFromDate('1990-06-15', '14:30', SP));
  assert.equal(comTudo.par.id, 'gemeos');

  const semHora = M.parDoNascimento('1990-06-15', null, SP);
  assert.equal(semHora.disponivel, true);
  assert.equal(semHora.precisao, 'meiaDia');
  assert.ok(semHora.notaPrecisao.length > 100);
  assert.equal(semHora.par.id, 'gemeos');

  const semCidade = M.parDoNascimento('1990-06-15', '14:30', null);
  assert.equal(semCidade.disponivel, true);
  assert.equal(semCidade.precisao, 'semCidade');
  assert.ok(semCidade.notaPrecisao.length > 100);

  const soData = M.parDoNascimento('1990-06-15', null, null);
  assert.equal(soData.disponivel, true);
  assert.equal(soData.precisao, 'meiaDia');

  // Hora inválida não vira exceção nem palpite silencioso: cai no meio-dia
  // declarado, igual a não ter hora.
  assert.equal(M.parDoNascimento('1990-06-15', '25:99', SP).precisao, 'meiaDia');
});

test('a nota de precisão existe nos três idiomas e diz o que pode sair errado', () => {
  for (const lang of IDIOMAS) {
    const semHora = M.parDoNascimento('1990-06-15', null, SP, lang);
    assert.ok(semHora.notaPrecisao.length > 100, lang);
    // A ressalva tem que dizer o que pode sair errado — o signo vizinho para
    // quem nasceu na virada —, não só "faltou um campo".
    assert.match(semHora.notaPrecisao, { pt: /vizinho/i, es: /vecino/i, en: /neighboring/i }[lang], lang);
    const semCidade = M.parDoNascimento('1990-06-15', '14:30', null, lang);
    assert.notEqual(semCidade.notaPrecisao, semHora.notaPrecisao, `${lang}: as duas perdas de precisão dizem a mesma coisa`);
    assert.match(semCidade.notaPrecisao, { pt: /Greenwich/, es: /Greenwich/, en: /Greenwich/ }[lang], lang);
  }
});

test('o signo sai da longitude real do Sol (lib/signs.js), não de tabela de calendário', () => {
  // 23/10/2010 é o caso de fronteira que a tese cita: tabela diz Escorpião, o
  // Sol está a 209,98° (Libra). O par tem que seguir a efeméride.
  const r = M.parDoNascimento('2010-10-23', '12:00', SP);
  assert.equal(r.signo, signoFromDate('2010-10-23', '12:00', SP));
  assert.equal(r.par.signo, r.signo);
  assert.ok(['Libra', 'Escorpião'].includes(r.signo));
  // E o par devolvido é o do signo calculado, nunca outro.
  assert.equal(r.par.id, M.parDeSigno(r.signo).id);
});

test('a tela das duas listas NÃO depende de dado de nascimento — responde sempre', () => {
  for (const lang of IDIOMAS) {
    const r = M.melotesiaDupla(lang);
    assert.equal(r.disponivel, true);
    assert.equal(r.pares.length, 12);
    assert.equal(r.pares.filter((p) => p.disponivel).length, 12);
  }
});

test('lib/melotesiaDupla.js não fala com AsyncStorage — nem direto, nem por require', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'melotesiaDupla.js'), 'utf8');
  assert.ok(!/AsyncStorage/.test(src), 'storage aqui só via lib/storage.js — e esta feature não precisa de storage nenhum');
  assert.ok(!/@react-native-async-storage/.test(src));
});
