// test/decanatoPorque.test.js
// POR QUE ESTA CARTA É ESTE DECANATO — as travas que impedem esta feature de
// virar invenção.
//
// Este arquivo guarda seis leis:
//
//   1. A REGRA GERA A TABELA. Os quatro passos reconstroem as 36 atribuições do
//      zero e batem, carta a carta, com GOLDEN_DAWN_DECANS de lib/tarotDeck.js
//      — nos TRÊS idiomas. Se alguém mexer na tabela do baralho por engano, ou
//      inverter um passo da regra aqui, o build cai. É a única feature do app em
//      que a fonte pode ser REPRODUZIDA em vez de só citada, e esta é a prova.
//   2. NUNCA FABRICAR ENCAIXE. Maior, Ás, corte e carta desconhecida declaram
//      indisponível com o motivo certo — e são quatro motivos diferentes, com
//      quatro textos diferentes. E se a regra discordar do baralho, a função
//      recusa a explicação em vez de escolher um dos dois em silêncio.
//   3. A ARITMÉTICA QUE O TEXTO AFIRMA É VERDADE. 36 = 12 signos × 3; cada
//      naipe recebe 2 a 10 exatamente uma vez; Marte aparece 6 vezes e os
//      outros 5; a volta abre e fecha em Marte; e a regra "cada signo abre com
//      o próprio dono" bate em DOIS signos dos doze — Áries e Escorpião, as
//      duas casas de Marte —, o que a torna efeito do ponto de partida.
//   4. PARIDADE DOS TRÊS PACKS. Mesma forma, mesmas chaves, nenhum valor vazio,
//      nenhum placeholder por interpolar, nenhum vazamento de PT em es/en. E
//      `lang` ausente é byte a byte o `lang='pt'`.
//   5. LINHA VERMELHA nos três idiomas: nada de saúde nem seus primos, nada de
//      veredito, nada de promessa, nada de porcentagem, nada de aviso defensivo.
//   6. PRENDE PRIMEIRO, FONTE DEPOIS — e a fonte, quando vem, vem com obra,
//      autor e século, com a datação passando por traduzirQuando/traduzirAutor.
//      Inclusive a trava mais específica desta feature: o app nunca escreve "a
//      atribuição astrológica", sempre a da Golden Dawn de 1888.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const D = require('../lib/decanatoPorque.js');
const { TAROT_DECK, getCardById } = require('../lib/tarotDeck.js');
const tarotEs = require('../lib/traducoes/tarot.es.js').default;
const tarotEn = require('../lib/traducoes/tarot.en.js').default;
const PT = require('../lib/traducoes/decanatoPorque.pt.js').PACK;
const ES = require('../lib/traducoes/decanatoPorque.es.js').PACK;
const EN = require('../lib/traducoes/decanatoPorque.en.js').PACK;

const LANGS = { pt: PT, es: ES, en: EN };
const IDIOMAS = ['pt', 'es', 'en'];

// As 36 numeradas de 2 a 10, e as 42 que ficam de fora.
const AS_36 = TAROT_DECK.filter((c) => c.arcana === 'menor' && c.number >= 2 && c.number <= 10).map((c) => c.id);
const FORA_DOS_36 = TAROT_DECK.filter((c) => !(c.arcana === 'menor' && c.number >= 2 && c.number <= 10)).map((c) => c.id);

// ===========================================================================
// 1. A REGRA GERA A TABELA
// ===========================================================================

test('a regra reconstrói as 36 atribuições do baralho, carta a carta, em PT', () => {
  assert.equal(D.DECANATOS.length, 36);
  for (const d of D.DECANATOS) {
    const carta = getCardById(d.cartaId);
    assert.ok(carta, `a regra produziu ${d.cartaId}, que não existe no baralho`);
    assert.equal(
      carta.astro,
      `${PT.planetas[d.planeta]} em ${PT.signos[d.signo]}`,
      `${d.cartaId}: a regra diz "${d.planeta} em ${d.signo}" e o baralho diz "${carta.astro}"`
    );
  }
});

test('a regra reconstrói as 36 também em es e en — os rótulos batem byte a byte', () => {
  for (const lang of IDIOMAS) {
    const r = D.conferirContraOBaralho(lang);
    assert.equal(r.total, 36, lang);
    assert.deepEqual(r.divergencias, [], `${lang}: ${JSON.stringify(r.divergencias)}`);
    assert.equal(r.conferem, 36, lang);
  }
  // E os packs es/en do baralho são realmente outros objetos — não é o PT
  // passando duas vezes pelo mesmo caminho.
  assert.equal(tarotEs.cards['copas-05'].astro, 'Marte en Escorpio');
  assert.equal(tarotEn.cards['copas-05'].astro, 'Mars in Scorpio');
  assert.equal(getCardById('copas-05').astro, 'Marte em Escorpião');
});

test('a CONFERENCIA de carga do módulo é 36 de 36 e sai na leitura', () => {
  assert.deepEqual(D.CONFERENCIA, { total: 36, conferem: 36, divergencias: [] });
  for (const lang of IDIOMAS) {
    const r = D.porqueEsteDecanato('paus-02', lang);
    assert.equal(r.conferencia.conferem, 36);
    assert.equal(r.conferencia.total, 36);
    assert.deepEqual(r.conferencia.divergencias, []);
    assert.ok(r.conferencia.texto.includes('36'), `${lang} não mostra o número da conferência`);
  }
});

test('os quatro cantos da tabela, conferidos à mão contra o Book T', () => {
  const esperado = {
    'paus-02': ['Marte', 'Áries', 1, 'Senhor do Domínio'],
    'ouros-05': ['Mercúrio', 'Touro', 4, 'Senhor da Dificuldade Material'],
    'espadas-10': ['Sol', 'Gêmeos', 9, 'Senhor da Ruína'],
    'copas-05': ['Marte', 'Escorpião', 22, 'Senhor da Perda no Prazer'],
    'copas-10': ['Marte', 'Peixes', 36, 'Senhor do Sucesso Perfeito'],
    'ouros-10': ['Mercúrio', 'Virgem', 18, 'Senhor da Riqueza'],
  };
  for (const [id, [planeta, signo, posicao, titulo]] of Object.entries(esperado)) {
    const d = D.decanatoDaCarta(id);
    assert.equal(d.planeta, planeta, id);
    assert.equal(d.signo, signo, id);
    assert.equal(d.posicao, posicao, id);
    assert.equal(getCardById(id).tituloGD, titulo, id);
  }
});

test('a sequência é UM ciclo caldaico ininterrupto — cada passo é o próximo da roda', () => {
  const ordem = D.ORDEM_CALDAICA;
  assert.deepEqual(ordem, ['Saturno', 'Júpiter', 'Marte', 'Sol', 'Vênus', 'Mercúrio', 'Lua']);
  for (let i = 1; i < D.DECANATOS.length; i += 1) {
    const anterior = ordem.indexOf(D.DECANATOS[i - 1].planeta);
    const atual = ordem.indexOf(D.DECANATOS[i].planeta);
    assert.equal(atual, (anterior + 1) % 7, `quebra do ciclo entre o decanato ${i} e o ${i + 1}`);
  }
  // E a volta começa em Marte, no primeiro terço de Áries.
  assert.equal(D.PLANETA_QUE_ABRE, 'Marte');
  assert.equal(D.DECANATOS[0].planeta, 'Marte');
  assert.equal(D.DECANATOS[0].signo, 'Áries');
  assert.equal(D.DECANATOS[0].ordemNoSigno, 1);
});

test('a volta zodiacal e a faixa de graus estão certas nas 36', () => {
  for (let i = 0; i < 36; i += 1) {
    const d = D.DECANATOS[i];
    assert.equal(d.posicao, i + 1);
    assert.equal(d.signo, D.ZODIACO[Math.floor(i / 3)]);
    assert.equal(d.ordemNoSigno, (i % 3) + 1);
    assert.equal(d.grauInicio, (i % 3) * 10);
    assert.equal(d.grauFim, d.grauInicio + 10);
    assert.equal(d.grauAbsolutoInicio, i * 10);
    assert.equal(d.grauAbsolutoFim, (i + 1) * 10);
    assert.equal(d.passosDesdeMarte, i);
  }
  assert.equal(D.DECANATOS[35].grauAbsolutoFim, 360, 'a volta tem que fechar em 360°');
});

test('aVoltaCaldaica devolve as 36 localizadas, todas conferindo, nos três idiomas', () => {
  for (const lang of IDIOMAS) {
    const volta = D.aVoltaCaldaica(lang);
    assert.equal(volta.length, 36, lang);
    for (const item of volta) {
      assert.equal(item.confere, true, `${lang}/${item.cartaId} não confere com o baralho`);
      assert.ok(item.cartaNome, `${lang}/${item.cartaId} sem nome de carta`);
      assert.ok(item.tituloGD, `${lang}/${item.cartaId} sem título Book T`);
      assert.ok(item.faixa.includes('°'), `${lang}/${item.cartaId} sem a faixa de graus`);
    }
    assert.equal(new Set(volta.map((x) => x.cartaId)).size, 36, `${lang}: carta repetida na volta`);
  }
});

// ===========================================================================
// 2. NUNCA FABRICAR ENCAIXE
// ===========================================================================

const NOME_DA_TELA = { pt: 'Tarô por Tema', es: 'Tarot por Tema', en: 'Tarot by Theme' };

test('Maior, Ás, corte e carta desconhecida declaram indisponível — cada um com o seu motivo', () => {
  const casos = [
    ['major-00', 'maior'], ['major-13', 'maior'], ['major-21', 'maior'],
    ['paus-01', 'as'], ['copas-01', 'as'], ['espadas-01', 'as'], ['ouros-01', 'as'],
    ['paus-11', 'corte'], ['copas-12', 'corte'], ['espadas-13', 'corte'], ['ouros-14', 'corte'],
    ['bastos-05', 'carta'], ['', 'carta'], [null, 'carta'], [undefined, 'carta'],
    ['paus-99', 'carta'], ['paus-2', 'carta'], [42, 'carta'],
  ];
  for (const [entrada, motivo] of casos) {
    for (const lang of IDIOMAS) {
      const r = D.porqueEsteDecanato(entrada, lang);
      assert.equal(r.disponivel, false, `${lang}/${entrada}`);
      assert.equal(r.motivo, motivo, `${lang}/${entrada}`);
      assert.equal(r.chamada, null);
      assert.equal(r.rotulo, null);
      assert.equal(r.decanato, null);
      assert.equal(r.conferencia, null);
      assert.deepEqual(r.aRegra, []);
      assert.ok(r.explicacao.length > 120, `${lang}/${entrada}: motivo explicado de qualquer jeito`);
      assert.ok(r.comoResolver.length > 20, `${lang}/${entrada}`);
      // A fonte e as ressalvas continuam junto: a doutrina não some porque a
      // carta não tem decanato.
      assert.equal(r.fonte.length, 8, `${lang}/${entrada}`);
      assert.equal(r.camadas.length, 3, `${lang}/${entrada}`);
      assert.ok(r.notaAtribuicaoRival.length > 100);
    }
  }
});

test('os quatro motivos têm QUATRO textos diferentes, e nenhum é "não tem e pronto"', () => {
  for (const lang of IDIOMAS) {
    const textos = ['maior', 'as', 'corte', 'carta'].map((m) => LANGS[lang].falta[m].texto);
    assert.equal(new Set(textos).size, 4, `${lang}: motivo reciclado`);
    for (const t of textos) assert.ok(t.length > 150, `${lang}: motivo curto demais`);
    for (const m of ['maior', 'as', 'corte', 'carta']) {
      assert.ok(
        LANGS[lang].falta[m].comoResolver.includes(NOME_DA_TELA[lang]),
        `${lang}/${m} não diz onde a informação está: ${LANGS[lang].falta[m].comoResolver}`
      );
    }
  }
  // E cada um diz POR QUE fica de fora, não só que fica.
  assert.match(PT.falta.maior.texto, /letra hebraica/);
  assert.match(PT.falta.as.texto, /raiz do elemento/);
  assert.match(PT.falta.corte.texto, /Príncipe e Princesa/);
});

test('a conta do baralho fecha: 36 com decanato + 42 sem = 78', () => {
  assert.equal(D.CARTAS_DO_BARALHO, 78);
  assert.equal(AS_36.length, 36);
  assert.equal(FORA_DOS_36.length, 42);
  for (const id of AS_36) assert.ok(D.decanatoDaCarta(id), `${id} deveria ter decanato`);
  for (const id of FORA_DOS_36) assert.equal(D.decanatoDaCarta(id), null, `${id} não pode ter decanato`);
});

test('as 36 respondem disponível nos três idiomas, e nenhuma repete a leitura de outra', () => {
  for (const lang of IDIOMAS) {
    const rotulos = new Set();
    for (const id of AS_36) {
      const r = D.porqueEsteDecanato(id, lang);
      assert.equal(r.disponivel, true, `${lang}/${id}`);
      assert.equal(r.motivo, null);
      assert.equal(r.cartaId, id);
      assert.ok(r.cartaNome, `${lang}/${id} sem nome`);
      assert.ok(r.tituloGD, `${lang}/${id} sem título Book T`);
      assert.equal(r.aRegra.length, 4, `${lang}/${id}`);
      rotulos.add(r.rotulo);
    }
    assert.equal(rotulos.size, 36, `${lang}: só ${rotulos.size} rótulos distintos em 36`);
  }
});

test('a porta de entrada aceita id, objeto de carta e { suit, number }', () => {
  const porId = D.porqueEsteDecanato('copas-05');
  const porObjeto = D.porqueEsteDecanato(getCardById('copas-05'));
  const porPar = D.porqueEsteDecanato({ suit: 'copas', number: 5 });
  const porIdMaiusculo = D.porqueEsteDecanato('COPAS-05');
  assert.deepEqual(porObjeto, porId);
  assert.deepEqual(porPar, porId);
  assert.deepEqual(porIdMaiusculo, porId);
  assert.equal(D.decanatoDaCarta({ suit: 'copas', number: 1 }), null, 'o Ás não tem decanato');
  assert.equal(D.decanatoDaCarta({ suit: 'nada', number: 5 }), null);
});

test('se a regra discordasse do baralho, a leitura recusaria a explicação', () => {
  // Não dá para sujar a tabela do baralho num teste sem quebrar os outros
  // arquivos, então o que se prova aqui é que o caminho EXISTE e está ligado:
  // o texto do motivo, a chave `divergencia`, e a leitura recusada.
  for (const lang of IDIOMAS) {
    const f = LANGS[lang].falta.divergencia;
    assert.equal(typeof f.texto, 'function', `${lang}: o motivo de divergência precisa dos dois rótulos`);
    const texto = f.texto({ daRegra: 'Marte em Áries', doBaralho: 'Sol em Áries' });
    assert.ok(texto.includes('Marte em Áries') && texto.includes('Sol em Áries'), `${lang} não mostra os dois lados`);
    assert.ok(texto.length > 150, lang);
  }
  const fonte = fs.readFileSync(path.join(__dirname, '..', 'lib', 'decanatoPorque.js'), 'utf8');
  assert.match(fonte, /doBaralho\.astro !== daRegra/, 'a trava de divergência sumiu do motor');
  assert.match(fonte, /'divergencia'/, 'o motivo de divergência sumiu do motor');
});

test('lib/decanatoPorque.js não fala com AsyncStorage nem com rede', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'decanatoPorque.js'), 'utf8');
  assert.ok(!/AsyncStorage/.test(src), 'storage aqui só via lib/storage.js — e esta feature não precisa de storage');
  assert.ok(!/@react-native-async-storage/.test(src));
  assert.ok(!/\bfetch\(/.test(src), 'esta feature é uma tabela: não pede nada a servidor nenhum');
});

// ===========================================================================
// 3. A ARITMÉTICA QUE O TEXTO AFIRMA
// ===========================================================================

test('cada naipe recebe 2 a 10 exatamente uma vez — 3 e 4 coprimos, como o texto diz', () => {
  for (const naipe of ['paus', 'copas', 'espadas', 'ouros']) {
    const numeros = D.DECANATOS.filter((d) => d.naipe === naipe).map((d) => d.numero).sort((a, b) => a - b);
    assert.deepEqual(numeros, [2, 3, 4, 5, 6, 7, 8, 9, 10], naipe);
  }
  // E o elemento do naipe é sempre o do signo — passo 1 da regra.
  for (const d of D.DECANATOS) {
    assert.equal(D.ELEMENTO_DO_NAIPE[d.naipe], d.elemento, d.cartaId);
    assert.equal(D.ELEMENTO_DO_SIGNO[d.signo], d.elemento, d.cartaId);
  }
});

test('o número escolhe a modalidade: 2·3·4 cardinal, 5·6·7 fixo, 8·9·10 mutável', () => {
  for (const d of D.DECANATOS) {
    const esperado = d.numero <= 4 ? 'cardinal' : d.numero <= 7 ? 'fixo' : 'mutavel';
    assert.equal(d.modalidade, esperado, `${d.cartaId} é ${d.numero} e caiu em ${d.modalidade}`);
    assert.equal(D.MODALIDADE_DO_SIGNO[d.signo], esperado, d.cartaId);
    assert.equal(D.TRIO_DA_MODALIDADE[d.modalidade][d.ordemNoSigno - 1], d.numero, d.cartaId);
  }
});

test('36 = 5×7 + 1: Marte aparece 6 vezes, os outros 5, e a volta abre e fecha nele', () => {
  assert.equal(D.VEZES_POR_PLANETA['Marte'], 6);
  for (const p of D.ORDEM_CALDAICA) {
    if (p !== 'Marte') assert.equal(D.VEZES_POR_PLANETA[p], 5, p);
  }
  assert.equal(Object.values(D.VEZES_POR_PLANETA).reduce((a, b) => a + b, 0), 36);
  assert.equal(D.DECANATOS[0].planeta, 'Marte');
  assert.equal(D.DECANATOS[35].planeta, 'Marte');
});

// 📐 Este teste derrubou a primeira versão do texto, que dizia "vale só para
// Áries". São DOIS — e os dois são casas de Marte, que é quem abre a contagem,
// o que transforma a coincidência em consequência do ponto de partida. Ficou
// registrado no cabeçalho do motor porque é para isso que a varredura existe.
test('📐 "cada signo abre com o próprio dono" bate em Áries e Escorpião — as duas casas de Marte', () => {
  const abrem = D.DECANATOS.filter((d) => d.ordemNoSigno === 1);
  assert.equal(abrem.length, 12);
  const coincidem = abrem.filter((d) => d.abreComOProprioDono).map((d) => d.signo);
  assert.deepEqual(coincidem, ['Áries', 'Escorpião'], `a lista mudou: ${coincidem.join(', ')}`);
  // E os dois são casas do planeta que abre a contagem — é isso que explica a
  // coincidência sem precisar de doutrina.
  for (const signo of coincidem) assert.equal(D.DOMICILIO_POR_SIGNO[signo], D.PLANETA_QUE_ABRE, signo);
  // Os dois contraexemplos que o texto cita, conferidos no dado.
  const touro = abrem.find((d) => d.signo === 'Touro');
  assert.equal(touro.planeta, 'Mercúrio');
  assert.equal(D.DOMICILIO_POR_SIGNO['Touro'], 'Vênus');
  const gemeos = abrem.find((d) => d.signo === 'Gêmeos');
  assert.equal(gemeos.planeta, 'Júpiter');
  assert.equal(D.DOMICILIO_POR_SIGNO['Gêmeos'], 'Mercúrio');
});

test('a conta que o texto mostra confere com a posição da carta', () => {
  for (const id of AS_36) {
    const d = D.decanatoDaCarta(id);
    const r = D.porqueEsteDecanato(id);
    assert.ok(r.aConta.includes(String(d.posicao)), `${id}: a conta não cita a posição ${d.posicao}`);
    if (d.posicao > 1) {
      assert.ok(r.aConta.includes(String(d.passosDesdeMarte)), `${id}: a conta não cita os ${d.passosDesdeMarte} passos`);
    }
    assert.ok(r.aConta.includes(PT.planetas[d.planeta]), `${id}: a conta não chega no planeta`);
  }
});

// ===========================================================================
// 4. PARIDADE DOS TRÊS PACKS
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
  return undefined;
}

test('es e en têm EXATAMENTE a mesma forma do pt — mesmas chaves, mesmos tipos', () => {
  const formaPt = forma(PT);
  assert.deepEqual(forma(ES), formaPt, 'o pack es divergiu da forma do pt');
  assert.deepEqual(forma(EN), formaPt, 'o pack en divergiu da forma do pt');
});

test('as CHAVES de planeta, signo, naipe e elemento são as mesmas nos três packs, e são as do motor', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.deepEqual(Object.keys(pack.planetas).sort(), [...D.ORDEM_CALDAICA].sort(), lang);
    assert.deepEqual(Object.keys(pack.signos).sort(), [...D.ZODIACO].sort(), lang);
    assert.deepEqual(Object.keys(pack.naipes).sort(), Object.keys(D.ELEMENTO_DO_NAIPE).sort(), lang);
    assert.deepEqual(Object.keys(pack.elementos).sort(), Object.keys(D.NAIPE_DO_ELEMENTO).sort(), lang);
    assert.deepEqual(Object.keys(pack.modalidades).sort(), Object.keys(D.TRIO_DA_MODALIDADE).sort(), lang);
    assert.deepEqual(Object.keys(pack.camadas).sort(), D.CAMADAS.map((c) => c.id).sort(), lang);
    assert.deepEqual(Object.keys(pack.chamada).sort(), Object.keys(D.ELEMENTO_DO_NAIPE).sort(), lang);
    assert.deepEqual(Object.keys(pack.numeroExtenso).map(Number).sort((a, b) => a - b), [2, 3, 4, 5, 6, 7, 8, 9, 10], lang);
    // A extensão local de autores tem as mesmas chaves nos três — senão um
    // idioma perde o nome consagrado sem ninguém notar.
    assert.deepEqual(Object.keys(pack.autores).sort(), ['Dio Cássio', 'Israel Regardie', 'Ordem Hermética da Golden Dawn'], lang);
  }
});

test('nenhum valor de nenhum pack é vazio', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    varrerStrings(pack, lang, (caminho, s) => assert.ok(s.trim().length > 0, `${caminho} está vazio`));
  }
});

// Tudo que o usuário lê numa leitura, num idioma.
function corpus(r) {
  return [
    r.chamada, r.explicacao, r.cartaNome, r.rotulo, r.tituloGD, r.aConta,
    r.notaDaVolta, r.notaDoPrimeiroTerco, r.notaAtribuicaoRival,
    r.notaArmadilhaPtolomeu, r.notaLeituraDoApp, r.comoResolver,
    r.decanato ? r.decanato.faixa : null,
    r.conferencia ? r.conferencia.texto : null,
    ...r.aRegra.map((p) => `${p.titulo} ${p.texto}`),
    // `f.nota` entra junto com `f.linha`: a nota é prosa que a tela mostra, e
    // varrer só a linha deixou passar um vazamento de PT em es/en.
    ...r.camadas.map((x) => `${x.titulo} ${x.idade} ${x.texto} ${x.fontes.map((f) => [f.linha, f.nota].filter(Boolean).join(' ')).join(' ')}`),
    ...r.verbatins.map((v) => `${v.texto} ${v.parafrase} ${v.locus}`),
    ...r.fonte,
  ]
    .filter(Boolean)
    .join(' \n ');
}

// Uma leitura por idioma para cada naipe, cada modalidade e cada terço, mais os
// dois extremos da volta e os quatro casos indisponíveis.
const AMOSTRA_IDS = ['paus-02', 'copas-07', 'espadas-10', 'ouros-04', 'copas-10', 'paus-05', 'ouros-09', 'espadas-06'];
const AMOSTRA = {};
for (const lang of IDIOMAS) {
  AMOSTRA[lang] = [
    ...AMOSTRA_IDS.map((id) => D.porqueEsteDecanato(id, lang)),
    D.porqueEsteDecanato('major-13', lang),
    D.porqueEsteDecanato('paus-01', lang),
    D.porqueEsteDecanato('ouros-14', lang),
    D.porqueEsteDecanato('nada-99', lang),
  ];
}

test('a leitura sai INTEIRA nos três idiomas — nenhum campo perdido, nada por interpolar', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      const c = corpus(r);
      assert.ok(!c.includes('undefined'), `${lang} vazou "undefined"`);
      assert.ok(!c.includes('[object Object]'), `${lang} vazou objeto`);
      assert.ok(!c.includes('NaN'), `${lang} vazou NaN`);
      assert.ok(!/\$\{|\{\w+\}/.test(c), `${lang} vazou placeholder sem interpolar`);
      assert.ok(!c.includes('null'), `${lang} vazou null no texto`);
      // Pontuação dobrada: "séc. II" e "2nd c." terminam em ponto, e uma frase
      // que fecha logo depois deles produz "2nd c..". Aconteceu em en na
      // primeira versão — a varredura fica.
      assert.ok(!/\.\.(?!\.)/.test(c), `${lang} produziu ponto dobrado: ${(c.match(/.{28}\.\.(?!\.)/) || [])[0]}`);
      assert.ok(!/ {2}|\s,|,,/.test(c), `${lang} produziu espaço ou vírgula dobrada`);
      assert.equal(r.camadas.length, 3, lang);
      assert.equal(r.verbatins.length, 2, lang);
      assert.equal(r.fonte.length, 8, lang);
      if (r.disponivel) {
        assert.ok(r.explicacao.length > 1500, `${lang} explicação curta demais: ${r.explicacao.length}`);
        assert.ok(r.chamada.length > 150 && r.chamada.length < 420, `${lang} chamada com ${r.chamada.length}`);
        for (const p of r.aRegra) assert.ok(p.texto.length > 80, `${lang} passo curto: ${p.titulo}`);
      }
    }
  }
});

test('es e en não vazam português, e não repetem o pt', () => {
  // Só marcadores exclusivos do PT: "Júpiter", "Libra", "Sol" e "Marte" são os
  // mesmos em espanhol e não podem entrar nesta lista.
  const PT_MARCADO = /\bvocê\b|\bnão\b|\bsão\b|\btambém\b|\bdepois\b|\bc[ée]u\b|Áries|Gêmeos|Câncer|Leão|Virgem|Escorpião|Sagitário|Capricórnio|Aquário|Peixes|Vênus|Mercúrio|\bLua\b|\bPaus\b|\bOuros\b|\bFogo\b|\bÁgua\b|\bTerra\b/;
  for (const lang of ['es', 'en']) {
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      // O verbatim inglês é o mesmo nos três — e não é português.
      assert.ok(!PT_MARCADO.test(s), `${caminho} vazou português: ${s.match(PT_MARCADO)}`);
    });
    for (let i = 0; i < AMOSTRA.pt.length; i++) {
      assert.notEqual(AMOSTRA[lang][i].explicacao, AMOSTRA.pt[i].explicacao, `${lang} explicação igual ao pt`);
      if (AMOSTRA.pt[i].chamada) {
        assert.notEqual(AMOSTRA[lang][i].chamada, AMOSTRA.pt[i].chamada, `${lang} chamada igual ao pt`);
      }
    }
  }
  // Contrapartida: varredura que não morde não protege ninguém.
  assert.ok(PT_MARCADO.test('o céu de Áries'));
});

test('a tabela não muda com o idioma — planeta, signo, posição e graus são os mesmos', () => {
  for (const id of AS_36) {
    const pt = D.porqueEsteDecanato(id, 'pt');
    for (const lang of ['es', 'en']) {
      const outro = D.porqueEsteDecanato(id, lang);
      assert.equal(outro.planeta, pt.planeta, id);
      assert.equal(outro.signo, pt.signo, id);
      assert.equal(outro.decanato.posicao, pt.decanato.posicao, id);
      assert.equal(outro.decanato.grauInicio, pt.decanato.grauInicio, id);
      assert.notEqual(outro.rotulo, undefined);
    }
  }
});

test("lang ausente e lang='pt' são a MESMA leitura; idioma desconhecido cai no PT", () => {
  const semLang = D.porqueEsteDecanato('espadas-03');
  for (const lang of ['pt', undefined, null, 'fr', 'de-DE', 42, {}]) {
    assert.deepEqual(D.porqueEsteDecanato('espadas-03', lang), semLang, String(lang));
  }
  assert.deepEqual(D.aVoltaCaldaica('fr'), D.aVoltaCaldaica());
  assert.deepEqual(D.conferirContraOBaralho('fr'), D.conferirContraOBaralho());
});

// ===========================================================================
// 5. A LINHA VERMELHA, NOS TRÊS IDIOMAS
// ===========================================================================
// Lista de PALAVRA, não de intenção: se a palavra passa hoje numa frase
// inocente, amanhã passa numa frase que promete tratamento.

const SAUDE = {
  pt: [
    /\b(alivi\w*|acalm\w*|cur(a|as|ar|am|ando)|sar(a|ar|am)|trat(a|am|ar|amento|amentos)|energiz\w*|terapia|terap[êe]utic\w*|rem[ée]dio)\b/i,
    /\bfertilidade\b|\bf[ée]rtil\b|engravidar|gravidez|ansiedade|depress[ãa]o|ins[ôo]nia/i,
  ],
  es: [
    /\b(alivi\w*|calm\w*|san(a|an|ar|aci[óo]n)|cur(a|an|ar|aci[óo]n)|trat(a|an|ar|amiento|amientos)|energiz\w*|terapia|terap[ée]utic\w*|remedio)\b/i,
    /\bfertilidad\b|\bf[ée]rtil\b|embarazo|embarazada|ansiedad|depresi[óo]n|insomnio/i,
  ],
  en: [
    /\b(relieve[sd]?|relief|sooth\w*|calm\w*|heal\w*|cure[sd]?|curing|treat(s|ed|ing|ment|ments|ise|ises)?|energiz\w*|therapy|therapeutic|remedy|remedies)\b/i,
    /\bfertility\b|\bfertile\b|pregnan\w*|anxiety|depression|insomnia/i,
  ],
};

const PROMESSA = {
  pt: [
    /\bvocê vai\b/i, /\bvai (ter|conseguir|ganhar|dar certo|acontecer)\b/i, /garant\w+/i,
    /com certeza você/i, /sorte grande/i, /destino selado/i, /\bcerteza de que\b/i,
    /\bisso significa que você\b/i,
  ],
  es: [
    /\bvas a (tener|lograr|conseguir|ganar)\b/i, /garantiz\w+/i, /suerte grande/i, /destino sellado/i,
    /\besto significa que vos\b/i,
  ],
  en: [
    /\byou will\b/i, /\byou'?re going to\b/i, /guarantee\w*/i, /destined to/i, /\bfated to\b/i,
    /\bthis means you are\b/i,
  ],
};

// Aviso defensivo: foi removido do app de propósito. Escrever um novo é bug.
const DEFENSIVO = [
  /apenas entretenimento|somente entretenimento|fins de entretenimento/i,
  /não garante resultados|não substitui/i,
  /solo entretenimiento|con fines de entretenimiento|no sustituye/i,
  /entertainment purposes|does not replace|no guarantee of results/i,
];

test('nenhuma leitura, em nenhum idioma, usa linguagem de saúde ou seus primos', () => {
  for (const [lang, regexes] of Object.entries(SAUDE)) {
    for (const r of AMOSTRA[lang]) {
      const c = corpus(r);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — linha vermelha na leitura: ${c.match(re)}`);
    }
    // E o pack inteiro, inclusive o que nenhuma leitura exercita por acaso.
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — linha vermelha: ${s.match(re)}`);
    });
  }
  // Contrapartida: varredura que não morde não protege ninguém.
  assert.ok(SAUDE.pt.some((re) => re.test('isso alivia a ansiedade')));
  assert.ok(SAUDE.es.some((re) => re.test('esto calma y sana')));
  assert.ok(SAUDE.en.some((re) => re.test('this will heal and soothe you')));
});

test('nenhuma leitura promete resultado, decreta desfecho ou escreve aviso defensivo', () => {
  for (const [lang, regexes] of Object.entries(PROMESSA)) {
    for (const r of AMOSTRA[lang]) {
      const c = corpus(r);
      for (const re of regexes) assert.ok(!re.test(c), `${lang} — promessa: ${c.match(re)}`);
      for (const re of DEFENSIVO) assert.ok(!re.test(c), `${lang} — aviso defensivo: ${c.match(re)}`);
    }
    varrerStrings(LANGS[lang], lang, (caminho, s) => {
      for (const re of regexes) assert.ok(!re.test(s), `${caminho} — promessa: ${s.match(re)}`);
      for (const re of DEFENSIVO) assert.ok(!re.test(s), `${caminho} — aviso defensivo: ${s.match(re)}`);
    });
  }
  assert.ok(PROMESSA.pt.some((re) => re.test('você vai conseguir tudo')));
  assert.ok(PROMESSA.en.some((re) => re.test('you will get the job')));
  assert.ok(DEFENSIVO.some((re) => re.test('conteúdo apenas entretenimento')));
});

test('não existe porcentagem, nota nem score em lugar nenhum', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      assert.ok(!corpus(r).includes('%'), `${lang} mostra porcentagem`);
      assert.equal(r.pct, undefined);
      assert.equal(r.nota, undefined);
      assert.equal(r.score, undefined);
    }
  }
});

// ===========================================================================
// 6. PRENDE PRIMEIRO, FONTE DEPOIS — e a fonte com obra, autor e século
// ===========================================================================

const JARGAO = [
  /Ptolomeu|Ptolomeo|Ptolemy|Dio C[áa]ssio|Di[óo]n Casio|Cassius Dio|Regardie|Crowley|L[ée]vi|Papus|Etteilla/i,
  /Tetrabiblos|Almagesto|Historia Romana|Book T|Golden Dawn|Rider-Waite/i,
  /\b[IVX]+\.\d+\b/,
  /decanat\w*|\bdecan\b|\bdecans\b/i,
  /caldaic\w*|caldaic\w*|chaldean/i,
  /zodiacal|eclíptic\w*|ecl[íi]ptic\w*/i,
  /s[ée]c\.|siglo|\b\d+(st|nd|rd|th) c\./i,
];

test('a CHAMADA abre na vida real: nenhum nome próprio, nenhum capítulo, nenhum termo técnico', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      if (!r.chamada) continue;
      for (const re of JARGAO) {
        assert.ok(!re.test(r.chamada), `${lang}: a chamada abriu com jargão — ${r.chamada.match(re)}`);
      }
    }
  }
});

test('a chamada muda com o naipe — o mesmo gancho em 36 cartas seria moldura reciclada', () => {
  for (const lang of IDIOMAS) {
    const ganchos = new Set(['paus-02', 'copas-02', 'espadas-02', 'ouros-02'].map((id) => D.porqueEsteDecanato(id, lang).chamada));
    assert.equal(ganchos.size, 4, `${lang}: só ${ganchos.size} ganchos distintos em 4 naipes`);
  }
});

test('o PRIMEIRO parágrafo da explicação também é vida real; a fonte vem DEPOIS', () => {
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      if (!r.disponivel) continue;
      const paragrafos = r.explicacao.split('\n\n');
      assert.equal(paragrafos.length, 5, `${lang}: a explicação tem ${paragrafos.length} parágrafos`);
      for (const re of JARGAO) {
        assert.ok(!re.test(paragrafos[0]), `${lang}: a abertura vazou jargão — ${paragrafos[0].match(re)}`);
      }
      // E o recibo está lá, no fim.
      assert.match(r.explicacao, /Tetrabiblos I\.22/);
      assert.match(r.explicacao, /Historia Romana 37\.18–19/);
      assert.match(r.explicacao, /Book T — The Tarot/);
      assert.ok(
        r.explicacao.indexOf('Tetrabiblos') > r.explicacao.length / 2,
        `${lang}: a fonte apareceu antes da metade do texto`
      );
    }
  }
});

test('o termo técnico ganha glosa na primeira aparição', () => {
  const r = { pt: D.porqueEsteDecanato('paus-02', 'pt'), es: D.porqueEsteDecanato('paus-02', 'es'), en: D.porqueEsteDecanato('paus-02', 'en') };
  assert.match(r.pt.explicacao, /decanato, um terço de signo/);
  assert.match(r.es.explicacao, /decanato, un tercio de signo/);
  assert.match(r.en.explicacao, /a decan, one third of a sign/);
});

test('TODA afirmação histórica carrega obra, autor e século — nas três camadas', () => {
  const SECULO = { pt: /séc\. [IVX]+|\b1[89]\d{2}\b/, es: /siglo [IVX]+|\b1[89]\d{2}\b/, en: /\d+(st|nd|rd|th) c\.|\b1[89]\d{2}\b/ };
  for (const lang of IDIOMAS) {
    const r = D.porqueEsteDecanato('copas-05', lang);
    assert.equal(r.camadas.length, 3);
    for (const camada of r.camadas) {
      assert.ok(camada.titulo.length > 5, `${lang}/${camada.id}`);
      assert.ok(camada.texto.length > 200, `${lang}/${camada.id}`);
      assert.ok(camada.fontes.length >= 1, `${lang}/${camada.id} sem fonte`);
      for (const f of camada.fontes) {
        assert.ok(f.obra && f.obra.length > 3, `${lang}/${camada.id} sem obra`);
        assert.ok(f.autor && f.autor.length > 3, `${lang}/${camada.id} sem autor`);
        assert.match(f.quando, SECULO[lang], `${lang}/${camada.id} datou fora da língua: ${f.quando}`);
        assert.ok(f.linha.includes(f.obra) && f.linha.includes(f.autor) && f.linha.includes(f.quando), `${lang}/${camada.id}`);
      }
    }
  }
});

test('a OBRA nunca traduz e o AUTOR ganha a forma consagrada de cada língua', () => {
  const porLang = Object.fromEntries(IDIOMAS.map((l) => [l, D.porqueEsteDecanato('copas-05', l)]));
  const obras = (r) => r.camadas.flatMap((c) => c.fontes.map((f) => f.obra));
  // Mesmas obras, byte a byte, nos três idiomas.
  assert.deepEqual(obras(porLang.es), obras(porLang.pt));
  assert.deepEqual(obras(porLang.en), obras(porLang.pt));
  assert.ok(obras(porLang.en).includes('Tetrabiblos I.22'));
  assert.ok(obras(porLang.en).includes('Book T — The Tarot'));
  // Autores mudam. Ptolomeu vem do mapa compartilhado (datacao.js); Dio Cássio e
  // a Golden Dawn vêm da extensão local do pack, até datacao.js aprendê-los.
  const autores = (r) => r.camadas.flatMap((c) => c.fontes.map((f) => f.autor));
  assert.ok(autores(porLang.pt).includes('Ptolomeu'));
  assert.ok(autores(porLang.es).includes('Ptolomeo'));
  assert.ok(autores(porLang.en).includes('Ptolemy'));
  assert.ok(autores(porLang.pt).includes('Dio Cássio'));
  assert.ok(autores(porLang.es).includes('Dión Casio'));
  assert.ok(autores(porLang.en).includes('Cassius Dio'));
  assert.ok(autores(porLang.en).includes('Hermetic Order of the Golden Dawn'));
  assert.ok(autores(porLang.es).includes('Orden Hermética de la Golden Dawn'));
  // E a DATAÇÃO ganha a forma da língua.
  const quandos = (r) => r.camadas.flatMap((c) => c.fontes.map((f) => f.quando));
  assert.ok(quandos(porLang.pt).includes('séc. II'));
  assert.ok(quandos(porLang.es).includes('siglo II'));
  assert.ok(quandos(porLang.en).includes('2nd c.'));
  assert.ok(quandos(porLang.en).includes('3rd c.'));
  assert.ok(quandos(porLang.en).includes('1888'), 'ano solto não se traduz');
});

test('a NOTA de cada fonte também é traduzida — ela é prosa, não dado', () => {
  // Regressão: a nota morava escrita no motor e saía em português nos três
  // idiomas ("a publicação que tirou o Book T do círculo fechado" em EN).
  // Agora a chave está no motor e a prosa no pack.
  const chaves = D.CAMADAS.flatMap((c) => c.fontes.map((f) => f.notaChave)).filter(Boolean);
  assert.deepEqual([...new Set(chaves)].sort(), ['cary', 'regardie', 'robbins']);
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.deepEqual(Object.keys(pack.notasDeFonte).sort(), ['cary', 'regardie', 'robbins'], lang);
  }
  const notas = (l) => D.porqueEsteDecanato('copas-05', l).camadas.flatMap((c) => c.fontes.map((f) => f.nota));
  // Fonte sem nota continua sem nota — Book T não ganha nota inventada.
  assert.ok(notas('pt').includes(null));
  assert.ok(notas('pt').includes('trad. Robbins, 1940'));
  assert.ok(notas('en').includes('trans. Robbins, 1940'), 'EN diz "trans.", não "trad."');
  assert.ok(notas('en').includes('trans. Cary, LacusCurtius'));
  // E nenhuma nota de es/en repete a prosa portuguesa.
  for (const lang of ['es', 'en']) {
    assert.ok(!notas(lang).includes('a publicação que tirou o Book T do círculo fechado'), lang);
  }
  assert.notDeepEqual(notas('en'), notas('pt'));
  assert.notDeepEqual(notas('es'), notas('pt'));
});

test('o verbatim é BYTE A BYTE o mesmo nos três packs — citação não se traduz', () => {
  for (const chave of Object.keys(PT.verbatim)) {
    assert.equal(ES.verbatim[chave].texto, PT.verbatim[chave].texto, `es/${chave} mexeu na citação`);
    assert.equal(EN.verbatim[chave].texto, PT.verbatim[chave].texto, `en/${chave} mexeu na citação`);
    assert.match(PT.verbatim[chave].texto, /\b(the|of|and|are|when|shall)\b/, `${chave} não parece inglês`);
  }
  // As duas frases centrais desta feature, conferidas inteiras.
  assert.equal(
    PT.verbatim.ptolomeuRejeita.texto,
    'These matters, as they have only plausible and not natural, but, rather, unfounded, arguments in their favour, we shall omit.'
  );
  assert.equal(
    PT.verbatim.ptolomeuFace.texto,
    "The planets are said to be in their 'proper face' when an individual planet keeps to the sun or moon the same aspect which its house has to their houses"
  );
});

test('cada locus mantém o mesmo capítulo nos três idiomas, e a paráfrase é do app', () => {
  const CAPITULO = { ptolomeuRejeita: /Tetrabiblos I\.22/, ptolomeuFace: /Tetrabiblos I\.23/ };
  for (const lang of IDIOMAS) {
    const r = D.porqueEsteDecanato('paus-02', lang);
    for (const v of r.verbatins) {
      assert.match(v.locus, CAPITULO[v.id], `${lang}/${v.id} trocou de capítulo`);
      assert.ok(v.parafrase.trim().length > 60, `${lang}/${v.id} sem paráfrase`);
      assert.notEqual(v.parafrase, v.texto, `${lang}/${v.id}`);
      assert.match(v.locus, /Robbins, 1940/);
    }
  }
  // Nome consagrado TRADUZ, e é assim que o locus fala a língua do leitor.
  assert.match(D.porqueEsteDecanato('paus-02', 'pt').verbatins[0].locus, /^Ptolomeu/);
  assert.match(D.porqueEsteDecanato('paus-02', 'es').verbatins[0].locus, /^Ptolomeo/);
  assert.match(D.porqueEsteDecanato('paus-02', 'en').verbatins[0].locus, /^Ptolemy/);
});

test('o app NUNCA escreve "a atribuição astrológica" — sempre a da Golden Dawn, 1888', () => {
  const PROIBIDO = {
    pt: /\ba atribuição astrológica\b/i,
    es: /\bla atribución astrológica\b/i,
    en: /\bthe astrological attribution\b/i,
  };
  const EXIGIDO = { pt: /Golden Dawn/, es: /Golden Dawn/, en: /Golden Dawn/ };
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      // A única aparição permitida da frase proibida é dentro da nota que existe
      // justamente para desmenti-la — e ali ela vem entre aspas.
      const semANota = corpus(r).replace(r.notaAtribuicaoRival, '');
      assert.ok(!PROIBIDO[lang].test(semANota), `${lang} escreveu "a atribuição astrológica" fora da nota que a desmente`);
      assert.match(r.notaAtribuicaoRival, EXIGIDO[lang], lang);
      assert.match(r.notaAtribuicaoRival, /1888/, lang);
      assert.match(r.notaAtribuicaoRival, /1944/, `${lang}: a nota precisa citar as rivais, não só a nossa`);
    }
  }
});

test('a armadilha de I.23 está escrita, e nas três línguas', () => {
  for (const lang of IDIOMAS) {
    const r = D.porqueEsteDecanato('ouros-03', lang);
    assert.match(r.notaArmadilhaPtolomeu, /I\.23/, lang);
    assert.match(r.notaArmadilhaPtolomeu, /I\.22/, `${lang}: a nota precisa dizer que o capítulo anterior rejeita os decanatos`);
    assert.ok(r.notaArmadilhaPtolomeu.length > 300, lang);
  }
});

test('o que é conta e o que é leitura do app vem separado, e os quatro passos são nossos', () => {
  const MARCA = { pt: /NOSSA maneira/, es: /NUESTRA manera/, en: /OUR way/ };
  for (const lang of IDIOMAS) {
    for (const r of AMOSTRA[lang]) {
      assert.match(r.notaLeituraDoApp, MARCA[lang], `${lang}: os quatro passos não estão rotulados como leitura do app`);
      assert.match(r.notaLeituraDoApp, /Book T/, lang);
      assert.match(r.notaLeituraDoApp, /1888/, lang);
      assert.ok(r.notaLeituraDoApp.length > 400, lang);
    }
  }
  assert.ok(D.NAO_ACHADO.some((x) => x.id === 'regraEscritaNoBookT'));
});

test('a nota da volta e a do primeiro terço trazem os números que o dado confirma', () => {
  for (const lang of IDIOMAS) {
    const r = D.porqueEsteDecanato('paus-07', lang);
    assert.ok(r.notaDaVolta.includes('6') && r.notaDaVolta.includes('5'), `${lang}: a nota da volta perdeu a contagem`);
    assert.ok(r.notaDoPrimeiroTerco.includes(LANGS[lang].signos['Touro']), lang);
    assert.ok(r.notaDoPrimeiroTerco.includes(LANGS[lang].signos['Gêmeos']), lang);
    assert.ok(r.notaDoPrimeiroTerco.includes(LANGS[lang].signos['Escorpião']), `${lang}: a nota perdeu o segundo signo que bate`);
    assert.match(r.notaDoPrimeiroTerco, /I\.17/, `${lang}: o domicílio precisa de capítulo`);
  }
});

test('o que a pesquisa não achou continua não achado, e está escrito', () => {
  const ids = D.NAO_ACHADO.map((x) => x.id).sort();
  assert.deepEqual(ids, [
    'apelidoCaldaico', 'decanatoDosAsesECortes', 'obraDaFaceHelenistica',
    'origemEgipciaDosDecanatos', 'razaoDeComecarEmMarte', 'regraEscritaNoBookT',
  ]);
  for (const x of D.NAO_ACHADO) assert.ok(x.texto.length > 200, `${x.id} declarado de qualquer jeito`);
  assert.match(D.NAO_ACHADO.find((x) => x.id === 'razaoDeComecarEmMarte').texto, /Touro abre com Mercúrio/);
  assert.match(D.NAO_ACHADO.find((x) => x.id === 'origemEgipciaDosDecanatos').texto, /não fixou um texto datado/);
});

test('a bibliografia tem oito entradas, todas com obra e data, nos três idiomas', () => {
  for (const [lang, pack] of Object.entries(LANGS)) {
    assert.equal(pack.fontes.length, 8, lang);
    for (const f of pack.fontes) {
      assert.ok(f.length > 80, `${lang}: fonte curta demais — ${f}`);
      assert.match(f, /\b1[5-9]\d{2}\b|\b19[0-4]\d\b|I\.\d+|37\.18/, `${lang}: fonte sem data nem capítulo — ${f}`);
    }
  }
});
