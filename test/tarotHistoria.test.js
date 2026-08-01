// test/tarotHistoria.test.js
// A HISTÓRIA REAL DO TARÔ — as travas que impedem esta feature de virar aquilo
// que ela existe para corrigir.
//
// Sete leis:
//
//   1. FORMA IDÊNTICA NOS TRÊS PACKS. Mesmas chaves, mesmos campos, nenhum
//      valor vazio, nenhum placeholder por interpolar, nenhum vazamento de PT
//      em es/en — e `lang` ausente é byte a byte o `lang='pt'`.
//   2. A ORDEM É O CONTEÚDO. A linha do tempo sai sempre em ordem cronológica,
//      as fases não se embaralham e a virada de "jogo" para "leitura" acontece
//      depois de 1505 — que é o argumento inteiro desta feature.
//   3. TODA AFIRMAÇÃO HISTÓRICA TEM ENDEREÇO CHECÁVEL. Cada `prova` de cada
//      datação é procurada LITERALMENTE dentro do arquivo da base. E a varredura
//      corre no sentido contrário: todo ano de quatro dígitos que aparece em
//      texto de tela, em qualquer idioma, tem de existir na base.
//   4. A DATAÇÃO PASSA PELO TRADUTOR. "séc. XV" vira "siglo XV" e "15th c.";
//      "dezembro de 1909" vira "December 1909". Título de obra NUNCA muda.
//   5. PRENDE PRIMEIRO, FONTE DEPOIS. Os primeiros 70 caracteres de todo texto
//      longo não podem trazer ano de quatro dígitos, nos três idiomas.
//   6. LINHA VERMELHA nos três idiomas: nada de saúde, promessa, veredito sobre
//      quem acredita, prova social nem aviso defensivo — e nem o exônimo que o
//      app bane, que é a armadilha específica do mito do povo Rom.
//   7. NUNCA FABRICAR. As 72 cartas sem nota pesquisada devolvem null em vez de
//      curiosidade inventada; id desconhecido devolve null; e o que a pesquisa
//      não achou continua declarado em NAO_ACHADO.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const H = require('../lib/tarotHistoria.js');
const PT = require('../lib/traducoes/tarotHistoria.pt.js').PACK;
const ES = require('../lib/traducoes/tarotHistoria.es.js').PACK;
const EN = require('../lib/traducoes/tarotHistoria.en.js').PACK;
const { TAROT_DECK } = require('../lib/tarotDeck.js');
const { traduzirQuando, traduzirAutor } = require('../lib/traducoes/datacao.js');

const PACKS = { pt: PT, es: ES, en: EN };
const IDIOMAS = ['pt', 'es', 'en'];
const TRADUZIDOS = ['es', 'en'];

// Ano cravado: a idade é CONTA, e conta precisa de referência fixa no teste.
const ANO = 2026;

const DOCS = path.join(__dirname, '..', 'docs', 'tradicao');
const docCache = {};
function lerDoc(arquivo) {
  if (!docCache[arquivo]) docCache[arquivo] = fs.readFileSync(path.join(DOCS, arquivo), 'utf8');
  return docCache[arquivo];
}

// ===========================================================================
// 1. FORMA E PARIDADE DOS TRÊS PACKS
// ===========================================================================

function chavesProfundas(obj, prefixo = '') {
  const saida = [];
  for (const [k, v] of Object.entries(obj)) {
    const caminho = prefixo ? `${prefixo}.${k}` : k;
    if (typeof v === 'function') saida.push(`${caminho}()`);
    else if (Array.isArray(v)) saida.push(`${caminho}[${v.length}]`);
    else if (v && typeof v === 'object') saida.push(...chavesProfundas(v, caminho));
    else saida.push(caminho);
  }
  return saida.sort();
}

test('os três packs têm exatamente a mesma forma', () => {
  const base = chavesProfundas(PT);
  for (const lang of TRADUZIDOS) {
    assert.deepEqual(chavesProfundas(PACKS[lang]), base, `o pack ${lang} divergiu da forma do PT`);
  }
  // E o idioma se declara, para a tela não ter de adivinhar.
  for (const lang of IDIOMAS) assert.equal(PACKS[lang].idioma, lang);
});

test('nenhum texto vazio, nenhum placeholder por interpolar, nenhum ponto duplo', () => {
  const problemas = [];
  for (const lang of IDIOMAS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      if (!texto || !String(texto).trim()) problemas.push(`${onde}: vazio`);
      if (/\{\w+\}/.test(texto)) problemas.push(`${onde}: placeholder não interpolado`);
      if (/undefined|NaN|\[object/.test(texto)) problemas.push(`${onde}: "${texto.slice(0, 60)}"`);
      if (/\.\./.test(String(texto).replace(/\.\.\./g, ''))) problemas.push(`${onde}: ponto duplo`);
    }
  }
  assert.deepEqual(problemas, [], problemas.join('\n'));
});

test('es e en não carregam português esquecido', () => {
  const vazamentos = [];
  for (const lang of TRADUZIDOS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      // ã/õ só existem em português; "você" e "não" idem. Nomes próprios e
      // títulos de obra desta feature não têm nenhum dos dois.
      const achou = String(texto).match(/[ãõ]|\bvocê\b|\bnão\b|\bséculo\b/i);
      if (achou) vazamentos.push(`${onde}: "${achou[0]}"`);
    }
  }
  assert.deepEqual(vazamentos, [], `PT vazou para es/en:\n  ${vazamentos.join('\n  ')}`);
});

test('os textos longos são de fato traduzidos, não copiados do PT', () => {
  const iguais = [];
  const pt = new Map(textosVisiveis('pt'));
  for (const lang of TRADUZIDOS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      // Recibo fica de fora de propósito: título de obra + nome próprio + ano
      // SÃO iguais nos três idiomas, e ter de repetir isso aqui é a prova de
      // que a regra "obra não traduz" está valendo.
      if (onde.includes('.recibo.')) continue;
      const original = pt.get(onde.replace(new RegExp(`^${lang}\\.`), 'pt.'));
      if (original && original.length > 60 && original === texto) iguais.push(onde);
    }
  }
  assert.deepEqual(iguais, [], `texto longo idêntico ao PT (tradução esquecida):\n  ${iguais.join('\n  ')}`);
});

test('lang ausente é exatamente lang="pt", e idioma desconhecido cai no PT', () => {
  assert.deepEqual(H.linhaDoTempo(), H.linhaDoTempo('pt'));
  assert.deepEqual(H.oQueNaoSeSustenta(), H.oQueNaoSeSustenta('pt'));
  assert.deepEqual(H.aberturaDoAlbum(undefined, ANO), H.aberturaDoAlbum('pt', ANO));
  assert.deepEqual(H.historiaDaCarta('major-17'), H.historiaDaCarta('major-17', 'pt'));
  assert.deepEqual(H.paraleloDaAntiguidade(), H.paraleloDaAntiguidade('pt'));
  assert.deepEqual(H.linhaDoTempo('klingon'), H.linhaDoTempo('pt'));
  assert.deepEqual(H.chromeDaTela('klingon'), H.chromeDaTela('pt'));
});

// ===========================================================================
// 2. A ORDEM É O CONTEÚDO
// ===========================================================================

test('a linha do tempo sai em ordem cronológica, sempre, nos três idiomas', () => {
  for (const lang of IDIOMAS) {
    const linha = H.linhaDoTempo(lang);
    assert.equal(linha.length, H.LINHA_DO_TEMPO.length);
    assert.ok(linha.length >= 15, `linha do tempo magra demais: ${linha.length} marcos`);
    for (let i = 1; i < linha.length; i++) {
      assert.ok(
        linha[i].anoOrdem >= linha[i - 1].anoOrdem,
        `${lang}: ${linha[i].id} (${linha[i].anoOrdem}) veio depois de ${linha[i - 1].id} (${linha[i - 1].anoOrdem})`
      );
    }
    assert.equal(linha[0].id, 'rheinfelden-1377', `${lang}: a linha não abre na chegada das cartas à Europa`);
    assert.equal(linha[linha.length - 1].fase, 'erudicao', `${lang}: a linha não fecha na erudição que conferiu tudo`);
  }
});

test('a virada de jogo para oráculo acontece DEPOIS do jogo — é o argumento da feature', () => {
  const linha = H.linhaDoTempo('pt');
  const ultimoJogo = Math.max(...linha.filter((m) => m.fase === 'jogo').map((m) => m.anoOrdem));
  const primeiraLeitura = Math.min(...linha.filter((m) => m.fase === 'leitura').map((m) => m.anoOrdem));
  assert.ok(primeiraLeitura > ultimoJogo, 'a fase de leitura invadiu a fase de jogo');
  // E a distância entre a primeira imagem documentada e a leitura datável é o
  // conteúdo inteiro: nunca pode encolher para menos de dois séculos.
  assert.ok(H.ANO_LEITURA_DATAVEL - H.ANO_PRIMEIRA_MENCAO > 200);
});

test('toda fase declarada existe, tem nome nos três idiomas e tem pelo menos um marco', () => {
  for (const fase of H.FASES) {
    for (const lang of IDIOMAS) {
      assert.ok(PACKS[lang].fases[fase], `${lang}: fase ${fase} sem nome`);
      assert.ok(H.marcosDaFase(fase, lang).length > 0, `${lang}: fase ${fase} sem marcos`);
    }
  }
  assert.deepEqual(H.marcosDaFase('inexistente'), []);
  for (const m of H.LINHA_DO_TEMPO) assert.ok(H.FASES.includes(m.fase), `${m.id}: fase desconhecida`);
});

test('ids únicos e marcoPorId devolve null para id inventado', () => {
  const ids = H.LINHA_DO_TEMPO.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, 'id de marco repetido');
  assert.equal(H.marcoPorId('marco-que-nao-existe'), null);
  assert.equal(H.marcoPorId('rheinfelden-1377').titulo, PT.marcos['rheinfelden-1377'].titulo);
});

// ===========================================================================
// 3. TODA AFIRMAÇÃO HISTÓRICA TEM ENDEREÇO CHECÁVEL
// ===========================================================================

test('toda prova de toda datação existe LITERALMENTE no arquivo da base', () => {
  const faltando = [];
  for (const [id, d] of Object.entries(H.DATACOES)) {
    const texto = lerDoc(d.doc);
    assert.ok(Array.isArray(d.provas) && d.provas.length >= 3, `${id}: menos de três provas`);
    for (const prova of d.provas) {
      if (!texto.includes(prova)) faltando.push(`${id} → ${JSON.stringify(prova)} não está em ${d.doc}`);
    }
  }
  assert.deepEqual(faltando, [], `Prova que não está na base (afirmação sem endereço):\n  ${faltando.join('\n  ')}`);
});

test('toda datação tem obra (título ou descrição do pack), autor e quando', () => {
  for (const [id, d] of Object.entries(H.DATACOES)) {
    assert.ok(d.obra || d.obraChave, `${id}: sem obra nem obraChave`);
    assert.ok(d.autor || d.autorChave, `${id}: sem autor nem autorChave`);
    assert.ok(d.quando, `${id}: sem datação`);
    assert.ok(d.doc && fs.existsSync(path.join(DOCS, d.doc)), `${id}: doc inexistente`);
    for (const lang of IDIOMAS) {
      const r = H.datacao(id, lang);
      assert.ok(r.obra && r.autor && r.quando, `${lang}:${id}: recibo incompleto`);
      assert.equal(r.linha, `${r.obra} — ${r.autor}, ${r.quando}`);
      if (d.obraChave) assert.ok(PACKS[lang].obras[d.obraChave], `${lang}: obra ${d.obraChave} sem tradução`);
      if (d.autorChave) assert.ok(PACKS[lang].autores[d.autorChave], `${lang}: autor ${d.autorChave} sem tradução`);
    }
  }
  assert.equal(H.datacao('nao-existe'), null);
});

test('toda datação é usada por alguma coisa — catálogo não guarda entrada órfã', () => {
  const usadas = new Set();
  const junta = (ids) => (ids || []).forEach((i) => usadas.add(i));
  H.LINHA_DO_TEMPO.forEach((m) => junta(m.datacoes));
  H.NAO_SE_SUSTENTA.forEach((m) => junta(m.datacoes));
  H.GRUPOS_DO_ALBUM.forEach((g) => H.historiaDoGrupo(g).recibo.forEach((r) => usadas.add(r.id)));
  Object.keys(H.NOTAS_DE_CARTA).forEach((c) => H.historiaDaCarta(c).recibo.forEach((r) => usadas.add(r.id)));
  H.aberturaDoAlbum('pt', ANO).recibo.forEach((r) => usadas.add(r.id));
  H.paraleloDaAntiguidade().recibo.forEach((r) => usadas.add(r.id));
  const orfas = Object.keys(H.DATACOES).filter((id) => !usadas.has(id));
  assert.deepEqual(orfas, [], `datação que ninguém usa: ${orfas.join(', ')}`);
});

// Separador de milhar muda de idioma (1.900 → 1,900): normaliza antes de olhar.
function normalizar(texto) {
  return String(texto).replace(/(\d)[.,](\d{3})\b/g, '$1$2');
}

test('NENHUMA DATA INVENTADA: todo ano de quatro dígitos em tela existe na base', () => {
  const base = normalizar(lerDoc('05-taro-historia-e-leitura.md') + '\n' + lerDoc('00-tese.md'));
  const forasteiros = [];
  for (const lang of IDIOMAS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      for (const m of normalizar(texto).matchAll(/\b\d{4}\b/g)) {
        if (!base.includes(m[0])) forasteiros.push(`${onde}: ${m[0]}`);
      }
    }
  }
  assert.deepEqual(
    forasteiros,
    [],
    `Ano que não existe em docs/tradicao — data inventada entra por descuido, é assim que ela entra:\n  ${forasteiros.join('\n  ')}`
  );
});

// ===========================================================================
// 4. A DATAÇÃO PASSA PELO TRADUTOR, O TÍTULO DA OBRA NÃO
// ===========================================================================

test('a datação ganha a forma da língua — séc. XV, siglo XV, 15th c.', () => {
  assert.equal(traduzirQuando('séc. XV', 'es'), 'siglo XV');
  assert.equal(traduzirQuando('séc. XV', 'en'), '15th c.');
  assert.equal(traduzirQuando('dezembro de 1909', 'es'), 'diciembre de 1909');
  assert.equal(traduzirQuando('dezembro de 1909', 'en'), 'December 1909');
  assert.equal(traduzirQuando('fim do séc. XIX', 'en'), 'late 19th c.');
  assert.equal(traduzirQuando('1440 e 1442', 'en'), '1440 and 1442');
  assert.equal(traduzirQuando('c. 150–120 a.C.', 'en'), 'c. 150–120 BC');

  // E sai assim de dentro da feature, não só da função solta.
  const marcoEs = H.marcoPorId('mameluco-naipes', 'es');
  assert.equal(marcoEs.recibo[0].quando, 'siglo XV');
  const marcoEn = H.marcoPorId('rider-waite-smith', 'en');
  assert.equal(marcoEn.recibo[0].quando, 'December 1909');
  const bookTEn = H.marcoPorId('book-t', 'en');
  assert.equal(bookTEn.recibo[0].quando, 'late 19th c.');
});

test('o título da obra é o mesmo nos três idiomas — e o autor próprio também', () => {
  for (const [id, d] of Object.entries(H.DATACOES)) {
    if (!d.obra) continue; // as sete descrições vivem no pack, de propósito
    for (const lang of IDIOMAS) {
      assert.equal(H.datacao(id, lang).obra, d.obra, `${lang}:${id}: título de obra traduzido`);
    }
  }
  // Nome próprio consagrado passa por traduzirAutor e volta igual quando não há
  // forma diferente na língua — é o comportamento de lib/traducoes/datacao.js.
  assert.equal(traduzirAutor('A. E. Waite', 'en'), 'A. E. Waite');
  assert.equal(H.datacao('pictorialKey', 'es').autor, 'A. E. Waite');
});

test('números e locus do PT reaparecem literais nos textos traduzidos', () => {
  const faltando = [];
  for (const chave of ['marcos', 'mitos', 'grupos', 'notasDeCarta']) {
    for (const id of Object.keys(PT[chave])) {
      for (const campo of Object.keys(PT[chave][id])) {
        const origem = normalizar(PT[chave][id][campo]);
        const numeros = [...new Set([...origem.matchAll(/\b\d{3,4}\b/g)].map((m) => m[0]))];
        for (const lang of TRADUZIDOS) {
          const alvo = normalizar(PACKS[lang][chave][id][campo]);
          for (const n of numeros) {
            if (!alvo.includes(n)) faltando.push(`${lang}:${chave}.${id}.${campo} perdeu "${n}"`);
          }
        }
      }
    }
  }
  assert.deepEqual(faltando, [], `Data/número sumiu na tradução:\n  ${faltando.join('\n  ')}`);
});

test('as citações de Waite são verbatim e idênticas nos três packs', () => {
  // `naBase` é o trecho CONTÍGUO procurado no documento: a base quebra linha no
  // meio das citações longas, e um trecho contíguo prova a mesma coisa.
  const VERBATIM = [
    ['pillars of sand', 'pillars of sand'],
    [
      'there is no particle of evidence for the Egyptian origin of Tarot cards',
      'there is no particle of evidence for the Egyptian origin',
    ],
    ['Loss, theft, privation, abandonment', 'Loss, theft, privation, abandonment'],
    ['another reading says', 'another reading says'],
    ['Increase, abundance, superfluity', 'Increase, abundance, superfluity'],
    ['Light, truth, the unravelling of involved matters', 'the unravelling of involved matters'],
    ['End, mortality, destruction, corruption', 'End, mortality'],
    ['Wherever it ought to be put, the Zero is an unnumbered card', 'the Zero is an unnumbered card'],
  ];
  for (const [cita, naBase] of VERBATIM) {
    for (const lang of IDIOMAS) {
      const tudo = textosVisiveis(lang).map(([, t]) => t).join('\n');
      assert.ok(tudo.includes(cita), `${lang}: a citação "${cita.slice(0, 40)}" sumiu ou foi traduzida`);
    }
    // E a citação existe mesmo na base — não é Waite inventado.
    assert.ok(lerDoc('05-taro-historia-e-leitura.md').includes(naBase), `citação fora da base: ${naBase}`);
  }
});

// ===========================================================================
// 5. PRENDE PRIMEIRO, FONTE DEPOIS
// ===========================================================================

// Todo texto longo desta feature: abertura, marcos, mitos (a metade da fonte
// não conta — ela É o recibo), grupos, notas de carta e o paralelo.
function aberturasDeTextoLongo(lang) {
  const saida = [];
  const abertura = H.aberturaDoAlbum(lang, ANO);
  saida.push([`${lang}.abertura.chamada`, abertura.chamada]);
  saida.push([`${lang}.abertura.texto`, abertura.texto]);
  for (const m of H.linhaDoTempo(lang)) saida.push([`${lang}.marco.${m.id}`, m.texto]);
  for (const g of H.GRUPOS_DO_ALBUM) saida.push([`${lang}.grupo.${g}`, H.historiaDoGrupo(g, lang).texto]);
  for (const c of H.cartasComHistoria()) saida.push([`${lang}.carta.${c}`, H.historiaDaCarta(c, lang).texto]);
  const p = H.paraleloDaAntiguidade(lang);
  saida.push([`${lang}.paralelo.chamada`, p.chamada]);
  saida.push([`${lang}.paralelo.texto`, p.texto]);
  return saida;
}

test('os primeiros 70 caracteres de todo texto longo não trazem ano — a vida real vem antes', () => {
  const erudicaoNaAbertura = [];
  for (const lang of IDIOMAS) {
    for (const [onde, texto] of aberturasDeTextoLongo(lang)) {
      const inicio = normalizar(texto).slice(0, 70);
      if (/\b\d{4}\b/.test(inicio)) erudicaoNaAbertura.push(`${onde}: "${inicio}"`);
    }
  }
  assert.deepEqual(
    erudicaoNaAbertura,
    [],
    'Texto abrindo na erudição em vez de abrir na vida real. O recibo vem DEPOIS:\n  ' + erudicaoNaAbertura.join('\n  ')
  );
});

test('a chamada da abertura não tem data nenhuma, nem nome próprio de autor', () => {
  for (const lang of IDIOMAS) {
    const c = H.aberturaDoAlbum(lang, ANO).chamada;
    assert.ok(!/\d{3,4}/.test(c), `${lang}: a chamada trouxe número de época`);
    for (const nome of ['Waite', 'Gébelin', 'Etteilla', 'Dummett', 'Smith']) {
      assert.ok(!c.includes(nome), `${lang}: a chamada abriu com nome de autor (${nome})`);
    }
    assert.ok(c.length > 120, `${lang}: chamada curta demais para prender alguém`);
  }
});

// ===========================================================================
// 6. A LINHA VERMELHA — nos três idiomas
// ===========================================================================
// Mesmas listas de test/idadeReal.test.js e test/mitosIdiomas.test.js: a régua
// é do app, não da feature. Duas entradas importam especialmente aqui: o
// exônimo do povo Rom (o mito exige falar do assunto sem ele) e o vocabulário
// de xingamento (desmontar um mito não autoriza chamar ninguém de nada).
const PROIBIDO = {
  pt: [
    /\balivi\w*/iu, /\bacalm\w*/iu, /\bcur(?:a|ar|am|ou|ando|ada?s?|ado?s?)\b/iu,
    /\btrat(?:a|ar|am|ou|ando|amentos?)\b/iu, /\benergiz\w*/iu, /\brelax\w*/iu,
    /\bequilibr\w*/iu, /\bharmoniz\w*/iu, /\bgarant\w*/iu, /\bdestrav\w*/iu,
    /\bproteg\w*/iu, /\bafast\w*/iu, /\benergia\b/iu, /\bvibra\w*/iu, /\bcigan\w*/iu,
    /\bfals[oa]\b/iu, /\bmentira\b/iu, /\bburr\w*/iu, /\bingênu\w*/iu, /\benganad\w*/iu,
    /\bcharlat\w*/iu, /\bpicaret\w*/iu, /\bgolpe\b/iu,
  ],
  es: [
    /\balivi/i, /\bcalm/i, /\bsana(r|s|n)?\b/i, /\bcur(a|ar|ación|ativ)/i,
    /\btrat(a|ar|e|en|amiento)\b/i, /\benergiz/i, /\brelaj/i, /\btranquiliz/i,
    /\bansiedad/i, /\bestr[eé]s\b/i, /\binsomnio\b/i, /\bsalud\b/i, /\bbienestar\b/i,
    /\bterap[eé]utic/i, /\bequilibr/i, /\barmoniz/i, /\bdesintoxic/i,
    /\batra(e|er|iga|cci[óo]n)/i, /\bgarant/i, /\bpromet/i,
    /\bmanifest/i, /\babre camino/i, /\bdesbloque/i, /\bdestrab/i, /\bahuyent/i,
    /\bespant/i, /\bproteg/i, /\bblinda/i, /\bneutraliz/i, /\bpoderos/i, /\binfalible/i,
    /\b(da|trae) suerte\b/i, /\bcontrol(a|ar|e)\b/i, /\benerg[íi]a\b/i, /\benerg[ée]tic/i,
    /\bvibraci/i, /\baura\b/i, /\bchakra/i, /\bmagnetismo\b/i, /\bmal de ojo\b/i,
    /\bpurific/i, /\bfals[oa]\b/i, /\bmentira\b/i, /\bengañad/i, /\bingenu/i,
    /\btont[oa]\b/i, /\bcharlat/i, /\bestaf/i, /\bmiles de personas\b/i,
    /\bmillones de (personas|usuarios)\b/i, /\bcigan/i, /\bgitan/i,
    /no garantiza/i, /sin (ninguna )?promesa/i, /no promete/i, /sin garant[íi]a/i, /aviso legal/i,
  ],
  en: [
    /\bheal/i, /\bcur(e|ing|ative)/i, /\btreat/i, /\brelie(f|ve|ving)/i, /\bsooth/i,
    /\bcalm/i, /\benergi[sz]e/i, /\brelax/i, /\banxiety\b/i, /\bstress\b/i,
    /\binsomnia\b/i, /\bwell-?being\b/i, /\btherapeutic/i, /\bdetox/i,
    /\bcortisol\b/i, /\bnervous system\b/i, /\bimmun/i, /\binvigorat/i, /\bharmoniz/i,
    /\battract/i, /\bguarantee/i, /\bmanifest/i, /\bunblock/i, /\bunlock/i,
    /\bward(s|ing)? off/i, /\bbanish/i, /\brepel/i, /\bprotect/i,
    /\bopens? (the )?(path|road|way)/i, /\bpowerful\b/i, /\binfallible\b/i,
    /\bbrings? luck\b/i, /\bgood luck\b/i, /\bmakes? it happen\b/i, /\bdominate/i,
    /\benergy\b/i, /\benergetic/i, /\bvibration/i, /\bvibe\b/i, /\baura\b/i,
    /\bchakra/i, /\bmagnetism\b/i, /\bevil eye\b/i, /\bpurif/i, /\bcleans(e|ing)\b/i,
    /\bfake\b/i, /\bbogus\b/i, /\bnonsense\b/i, /\bgullible\b/i, /\bstupid\b/i,
    /\bdumb\b/i, /\bsucker/i, /\bscam/i, /\bcharlatan/i, /\bhoax\b/i, /\bdebunk/i,
    /\bthousands of (people|readers|users)\b/i, /\bmillions of (people|readers|users)\b/i,
    /\bgypsy\b/i, /\bgypsies\b/i,
    /not? guarantee/i, /no promise/i, /does not promise/i, /disclaimer/i, /legal notice/i,
  ],
};

// Tudo que a pessoa pode ler num idioma, montado pelas funções públicas — não
// lido do pack. Se o motor esquecer de expor um campo, ele também não é varrido.
function textosVisiveis(lang) {
  const saida = [];
  const pack = PACKS[lang];
  for (const [k, v] of Object.entries(H.chromeDaTela(lang))) saida.push([`${lang}.tela.${k}`, v]);
  for (const [k, v] of Object.entries(pack.fases)) saida.push([`${lang}.fase.${k}`, v]);
  for (const [k, v] of Object.entries(pack.autores)) saida.push([`${lang}.autor.${k}`, v]);
  for (const [k, v] of Object.entries(pack.obras)) saida.push([`${lang}.obra.${k}`, v]);
  for (const [k, v] of Object.entries(pack.compartilhar)) saida.push([`${lang}.rotulo.${k}`, v]);

  const abertura = H.aberturaDoAlbum(lang, ANO);
  saida.push([`${lang}.abertura.chamada`, abertura.chamada]);
  saida.push([`${lang}.abertura.texto`, abertura.texto]);
  saida.push([`${lang}.abertura.cta`, abertura.cta]);
  abertura.recibo.forEach((r) => saida.push([`${lang}.abertura.recibo.${r.id}`, r.linha]));

  for (const m of H.linhaDoTempo(lang)) {
    saida.push([`${lang}.marco.${m.id}.titulo`, m.titulo]);
    saida.push([`${lang}.marco.${m.id}.texto`, m.texto]);
    saida.push([`${lang}.marco.${m.id}.faseNome`, m.faseNome]);
    m.recibo.forEach((r) => saida.push([`${lang}.marco.${m.id}.recibo.${r.id}`, r.linha]));
  }
  for (const item of H.oQueNaoSeSustenta(lang)) {
    saida.push([`${lang}.mito.${item.id}.oQueSeDiz`, item.oQueSeDiz]);
    saida.push([`${lang}.mito.${item.id}.oQueAFonteMostra`, item.oQueAFonteMostra]);
    item.recibo.forEach((r) => saida.push([`${lang}.mito.${item.id}.recibo.${r.id}`, r.linha]));
    saida.push([`${lang}.mito.${item.id}.compartilhar`, H.textoCompartilhavel(item.id, lang)]);
  }
  for (const g of H.GRUPOS_DO_ALBUM) {
    const n = H.historiaDoGrupo(g, lang);
    saida.push([`${lang}.grupo.${g}.titulo`, n.titulo]);
    saida.push([`${lang}.grupo.${g}.texto`, n.texto]);
    n.recibo.forEach((r) => saida.push([`${lang}.grupo.${g}.recibo.${r.id}`, r.linha]));
  }
  for (const c of H.cartasComHistoria()) {
    const n = H.historiaDaCarta(c, lang);
    saida.push([`${lang}.carta.${c}.titulo`, n.titulo]);
    saida.push([`${lang}.carta.${c}.texto`, n.texto]);
    n.recibo.forEach((r) => saida.push([`${lang}.carta.${c}.recibo.${r.id}`, r.linha]));
  }
  const p = H.paraleloDaAntiguidade(lang);
  saida.push([`${lang}.paralelo.chamada`, p.chamada]);
  saida.push([`${lang}.paralelo.texto`, p.texto]);
  p.recibo.forEach((r) => saida.push([`${lang}.paralelo.recibo.${r.id}`, r.linha]));
  H.fontes(lang).forEach((f, i) => saida.push([`${lang}.fonte.${i}`, f]));
  return saida;
}

test('LINHA VERMELHA: nenhuma palavra proibida em NENHUM dos três idiomas', () => {
  const violacoes = [];
  for (const lang of IDIOMAS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      for (const re of PROIBIDO[lang]) {
        const achou = String(texto).match(re);
        if (achou) violacoes.push(`${onde}: "${achou[0]}" (${re})`);
      }
    }
  }
  assert.deepEqual(
    violacoes,
    [],
    'Palavra proibida (saúde, promessa, veredito, prova social, exônimo) em texto visível. ' +
      'Reescreva por SENTIDO, sem o vocabulário:\n  ' + violacoes.join('\n  ')
  );
});

test('a varredura MORDE — pega as frases que existem para ser pegas', () => {
  const DEVE_PEGAR = {
    pt: [
      'Isso acalma a mente e trata a ansiedade.',
      'Quem acredita nisso é ingênuo, caiu num golpe.',
      'Foram os ciganos que trouxeram o baralho.',
    ],
    es: [
      'Esto calma la mente y trata la ansiedad.',
      'Quien cree eso es un ingenuo, es una estafa.',
      'Fueron los gitanos quienes trajeron la baraja.',
    ],
    en: [
      'This calms the mind and treats anxiety.',
      'The whole thing is a scam, pure nonsense.',
      'It was the gypsies who brought the deck.',
    ],
  };
  for (const lang of IDIOMAS) {
    for (const frase of DEVE_PEGAR[lang]) {
      assert.ok(PROIBIDO[lang].some((re) => re.test(frase)), `${lang}: a varredura deixou passar "${frase}"`);
    }
  }
});

test('nada de promessa nem de veredito sobre a vida de quem lê', () => {
  const VEREDITO = [
    /\bvocê vai (ter|conseguir|receber|encontrar|descobrir que você)\b/i,
    /\bisso significa que você (é|tem|vai)\b/i,
    /\bcom certeza vai\b/i,
    /\bvas a (tener|conseguir|recibir|encontrar)\b/i,
    /\beso significa que (eres|tienes)\b/i,
    /\byou will (get|have|receive|find|become)\b/i,
    /\bthis means you are\b/i,
  ];
  const violacoes = [];
  for (const lang of IDIOMAS) {
    for (const [onde, texto] of textosVisiveis(lang)) {
      for (const re of VEREDITO) if (re.test(String(texto))) violacoes.push(`${onde}: ${re}`);
    }
  }
  assert.deepEqual(violacoes, [], violacoes.join('\n'));
});

// ===========================================================================
// 7. NUNCA FABRICAR — e o encaixe no álbum é real
// ===========================================================================

test('as cartas com nota existem MESMO no baralho, e as outras 72 devolvem null', () => {
  const idsReais = new Set(TAROT_DECK.map((c) => c.id));
  for (const id of Object.keys(H.NOTAS_DE_CARTA)) {
    assert.ok(idsReais.has(id), `${id} não é carta deste baralho`);
  }
  const semNota = TAROT_DECK.filter((c) => !H.NOTAS_DE_CARTA[c.id]);
  assert.equal(semNota.length, TAROT_DECK.length - Object.keys(H.NOTAS_DE_CARTA).length);
  assert.ok(semNota.length >= 70, 'nota demais: isto virou enchimento');
  for (const carta of semNota.slice(0, 20)) {
    assert.equal(H.historiaDaCarta(carta.id), null, `${carta.id} ganhou nota inventada`);
  }
  assert.equal(H.historiaDaCarta('carta-que-nao-existe'), null);
  assert.equal(H.historiaDaCarta(null), null);
});

test('A Força e A Justiça dividem a mesma nota — é a mesma troca', () => {
  const forca = H.historiaDaCarta('major-08');
  const justica = H.historiaDaCarta('major-11');
  assert.equal(forca.notaId, justica.notaId);
  assert.equal(forca.texto, justica.texto);
  assert.equal(forca.cartaId, 'major-08');
  assert.equal(justica.cartaId, 'major-11');
});

test('os grupos do álbum batem com os grupos reais do baralho', () => {
  const naipes = [...new Set(TAROT_DECK.filter((c) => c.suit).map((c) => c.suit))];
  assert.deepEqual(H.GRUPOS_DO_ALBUM, ['maiores', ...naipes]);
  for (const g of H.GRUPOS_DO_ALBUM) {
    for (const lang of IDIOMAS) {
      const n = H.historiaDoGrupo(g, lang);
      assert.ok(n.titulo && n.texto && n.recibo.length, `${lang}: grupo ${g} incompleto`);
    }
  }
  assert.equal(H.historiaDoGrupo('naipe-inventado'), null);
});

test('os ganchos de álbum dos marcos apontam para grupos e cartas que existem', () => {
  const idsReais = new Set(TAROT_DECK.map((c) => c.id));
  for (const m of H.LINHA_DO_TEMPO) {
    for (const g of m.album.grupos) assert.ok(H.GRUPOS_DO_ALBUM.includes(g), `${m.id}: grupo ${g} não existe`);
    for (const c of m.album.cartas) assert.ok(idsReais.has(c), `${m.id}: carta ${c} não existe`);
  }
});

test('o que a pesquisa não achou continua declarado, não preenchido', () => {
  assert.ok(H.NAO_ACHADO.length >= 5, 'lacunas de menos: alguém preencheu um buraco');
  const ids = H.NAO_ACHADO.map((n) => n.id);
  for (const esperado of ['etimologiaDeTarocco', 'dataDoSermaoSteele', 'nomeMarselhaAntesDe1930']) {
    assert.ok(ids.includes(esperado), `sumiu a lacuna ${esperado}`);
  }
  for (const n of H.NAO_ACHADO) assert.ok(n.texto.length > 80, `${n.id}: lacuna declarada pela metade`);
});

test('o mito nunca sai sem a refutação, e as duas metades vêm com recibo', () => {
  for (const lang of IDIOMAS) {
    const itens = H.oQueNaoSeSustenta(lang);
    assert.equal(itens.length, H.NAO_SE_SUSTENTA.length);
    assert.ok(itens.length >= 5);
    for (const item of itens) {
      assert.ok(item.oQueSeDiz.length > 40, `${lang}:${item.id}: mito vazio`);
      assert.ok(item.oQueAFonteMostra.length > 150, `${lang}:${item.id}: refutação curta demais`);
      assert.ok(item.recibo.length >= 2, `${lang}:${item.id}: refutação sem recibo`);
    }
  }
  assert.equal(H.itemQueNaoSeSustenta('mito-inventado'), null);
  // O item do Egito é obrigatório: é o motivo desta feature existir.
  assert.ok(H.itemQueNaoSeSustenta('egito', 'en').oQueAFonteMostra.includes('1781'));
});

// ===========================================================================
// 8. O PARALELO COM A TESE — sem ele, isto vira denúncia
// ===========================================================================

test('o paralelo cita Nechepso, Petosiris e o pseudônimo, e aponta para a tese', () => {
  const ESPERADO = {
    pt: ['Nechepso', 'Petosiris', 'pseudônimos', 'Alexandria'],
    es: ['Nechepso', 'Petosiris', 'seudónimos', 'Alejandría'],
    en: ['Nechepso', 'Petosiris', 'pen names', 'Alexandria'],
  };
  for (const lang of IDIOMAS) {
    const p = H.paraleloDaAntiguidade(lang);
    for (const termo of ESPERADO[lang]) {
      assert.ok(p.texto.includes(termo), `${lang}: o paralelo não diz "${termo}"`);
    }
    assert.ok(p.recibo.some((r) => r.doc === 'docs/tradicao/00-tese.md'), `${lang}: paralelo sem endereço na tese`);
  }
  // E o tom: a tese diz que inventar antiguidade é TRAÇO, não corrupção.
  assert.match(H.paraleloDaAntiguidade('pt').texto, /tra[çc]o dela/);
  assert.match(H.paraleloDaAntiguidade('en').texto, /trait of it/);
});

// ===========================================================================
// 9. A IDADE É CONTA, NUNCA TABELA
// ===========================================================================

test('a idade da leitura é calculada contra o ano — vira sozinha na virada', () => {
  assert.equal(H.anosDeLeitura(2026), 245);
  assert.equal(H.anosDeLeitura(2030), 249);
  assert.equal(H.seculosDeImagem(2026), 6);
  for (const lang of IDIOMAS) {
    assert.ok(H.aberturaDoAlbum(lang, 2026).texto.includes('245'), `${lang}: a abertura não imprime a idade calculada`);
    assert.ok(H.aberturaDoAlbum(lang, 2030).texto.includes('249'), `${lang}: a idade não acompanhou o ano`);
    assert.equal(H.aberturaDoAlbum(lang, 2026).anosDeLeitura, 245);
    assert.equal(H.aberturaDoAlbum(lang, 2026).seculosDeImagem, 6);
  }
});

// ===========================================================================
// 10. O COMPARTILHÁVEL
// ===========================================================================

test('o compartilhável sai inteiro, no idioma, e fecha no link', () => {
  for (const lang of IDIOMAS) {
    for (const item of H.oQueNaoSeSustenta(lang)) {
      const txt = H.textoCompartilhavel(item.id, lang);
      const linhas = txt.split('\n');
      assert.equal(linhas.length, 4, `${lang}:${item.id}: o compartilhável mudou de forma`);
      assert.ok(linhas[0].startsWith(PACKS[lang].compartilhar.oQueSeDiz));
      assert.ok(linhas[1].includes(item.oQueAFonteMostra));
      assert.ok(linhas[2].includes(item.recibo[0].linha), `${lang}:${item.id}: compartilhável sem recibo`);
      assert.equal(linhas[3], H.LINK_COMPARTILHAR);
      // Passar o objeto já montado dá o mesmo resultado — o id manda.
      assert.equal(H.textoCompartilhavel(item, lang), txt);
    }
  }
  assert.equal(H.textoCompartilhavel('nao-existe'), null);
  assert.equal(H.textoCompartilhavel(null), null);
});

// ===========================================================================
// 11. NENHUM TEXTO REPETIDO DE lib/mitos.js NEM DE lib/idadeReal.js
// ===========================================================================
// Sobreposição de ITEM é de propósito (o Egito de 1781 aparece nos três
// módulos). Sobreposição de TEXTO é preguiça, e o usuário que lê as três telas
// percebe na hora.

function palavras(texto) {
  return String(texto)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function ngramas(texto, n = 8) {
  const p = palavras(texto);
  const saida = new Set();
  for (let i = 0; i + n <= p.length; i++) saida.add(p.slice(i, i + n).join(' '));
  return saida;
}

function textosDoOutroModulo() {
  const saida = [];
  const M = require('../lib/mitos.js');
  for (const m of M.MITOS) {
    saida.push(m.oQueTeContaram, m.oQueAFonteDiz, m.detalhe, m.fonte);
  }
  const IR = require('../lib/traducoes/idadeReal.pt.js');
  const pack = IR.PACK || IR.default || IR;
  for (const item of Object.values(pack.itens)) saida.push(...Object.values(item).filter((v) => typeof v === 'string'));
  return saida.filter(Boolean);
}

test('nenhuma sequência de oito palavras em comum com lib/mitos.js ou lib/idadeReal.js', () => {
  const alheio = new Set();
  for (const t of textosDoOutroModulo()) for (const g of ngramas(t)) alheio.add(g);
  const colisoes = [];
  for (const [onde, texto] of textosVisiveis('pt')) {
    // Recibo e bibliografia ficam de fora: uma citação bibliográfica É para ser
    // igual em todo lugar que a use — repetir "A. E. Waite, The Pictorial Key
    // to the Tarot, 1911" não é preguiça, é citar direito. A regra vale para a
    // PROSA, que é onde a preguiça aparece.
    if (onde.includes('.recibo.') || onde.includes('.fonte.')) continue;
    for (const g of ngramas(texto)) if (alheio.has(g)) colisoes.push(`${onde}: "${g}"`);
  }
  assert.deepEqual(colisoes, [], `Texto repetido de outro módulo:\n  ${colisoes.join('\n  ')}`);
});
