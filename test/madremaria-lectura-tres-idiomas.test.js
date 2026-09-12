// test/madremaria-lectura-tres-idiomas.test.js
//
// O PORTAO DO MOTOR DE LEITURA NOS TRES IDIOMAS.
//
// ===========================================================================
// O BURACO QUE ESTE ARQUIVO FECHA
// ===========================================================================
// A tela da SINTESE e o climax do funil: e o que a pessoa recebe depois das tres
// cartas. Ate hoje ela saia MEIO traduzida, e o defeito nao era chave faltando —
// era um caminho de traducao que nao existia. Medido com idioma 'en':
//
//     "titulo": "Your thread, today"            <- traduzido (vem de t())
//     "rotulo": "WHAT THE THREE CARDS SHOW"     <- traduzido (vem de t())
//     "texto":  "As tres se leem sobre uma historia que se cortou..."  <- PT
//
// Os rotulos traduziam porque sao chave de datos/textos.js. O CONTEUDO nao,
// porque os ~8 mil caracteres de copy do motor (TABLAS com preguntaNudo,
// fraseNudo, tiempo, contacto, accion...; ALTERNATIVAS com as 9 frases do filtro
// de contato duro; SALUDO_SIN_NOMBRE) estavam escritos em PORTUGUES DENTRO de
// madremaria/lib/lectura.js, fora de qualquer dicionario.
//
// E por isso o PLACAR DE COBERTURA (test/madremaria-i18n.test.js) nunca acusou:
// aquelas strings nao eram chave do PT. Um portao que conta chaves nao ve texto
// que nunca foi chave. Este arquivo olha a SAIDA, que e o que a pessoa le.
//
// ===========================================================================
// POR QUE ARQUIVO IRMAO, E NAO CHAVE DE DICIONARIO
// ===========================================================================
// Duas formas eram possiveis, e a medida decidiu:
//
//  (a) virar chave de datos/textos.js (+ .es + .en). Cabe no portao de cobertura
//      de graca, mas: TABLAS e uma TABELA INDEXADA POR RESPOSTA — o motor pede
//      TABLAS.accion['entender-mi-parte'] —, e achatar isso daria ~76 chaves
//      pontuadas feias, trocando uma tabela que o motor ja le por 76 chaves
//      soltas sem dono. E, decisivo: aquelas chaves entrariam em
//      datos/textos.es.js e textos.en.js, que sao os arquivos de OUTRA onda de
//      traducao rodando em paralelo — conflito de escrita garantido.
//
//  (b) arquivos irmaos lib/lectura.es.js e lib/lectura.en.js espelhando a
//      estrutura. Natural para tabela indexada, e ja e o MOLDE DA CASA:
//      datos/lecturas.js faz exatamente isto com datos/lecturas.es.js, por
//      datos/traduzir.js. O custo e precisar de portao proprio — e o portao
//      proprio e este arquivo.
//
// Escolhida a (b). O PT ficou onde estava, porque test/madremaria-lectura.test.js
// varre TABLAS e ALTERNATIVAS como objeto portugues com Object.entries: mover o
// PT cegaria aquele portao.
//
// ===========================================================================
// O QUE ESTE ARQUIVO IMPEDE
// ===========================================================================
// 1. a sintese (ou qualquer posicao) voltar a sair em portugues com idioma
//    'es'/'en' ativo — a regra que o chamado pediu;
// 2. uma ALTERNATIVA traduzida conter palavra de contato. Esta e a pior: a
//    alternativa e o que SUBSTITUI o convite quando a guarda de contato duro
//    morde. Se ela propria falar de escrever/ligar/mandar, a guarda come a
//    alternativa e quem esta em bloqueio recebe justamente o que a protecao
//    existia para evitar. Em ES a guarda pega (PATRONES_CONTACTO tem a rede
//    espanhola viva); em EN a guarda e CEGA, e e este teste que segura;
// 3. promessa de desfecho em qualquer idioma (delega ao portao da doutrina);
// 4. voseo no espanhol, e genero atribuido a outra pessoa em ES/EN;
// 5. chave que existe num idioma e nao no outro — forma divergente e o jeito
//    silencioso de uma posicao sair vazia na tela.
//
// ===========================================================================
// RUNNER: node --require ./test/setup.js --test test/madremaria-lectura-tres-idiomas.test.js
// Transpila para CommonJS (alvo Hermes): `import.meta` e ERRO DE SINTAXE aqui.
// ===========================================================================

import assert from 'node:assert/strict';
import test from 'node:test';

import { IDIOMA_PADRAO, setIdiomaMadre } from '../madremaria/datos/textos.js';
import {
  ALTERNATIVAS,
  SALUDO_SIN_NOMBRE,
  TABLAS,
  componerLectura,
  hablaDelFuturo,
  saludoSinNombre,
  sugiereContacto,
} from '../madremaria/lib/lectura.js';
import * as EN from '../madremaria/lib/lectura.en.js';
import * as ES from '../madremaria/lib/lectura.es.js';

/* O motor guarda o idioma num espelho de MODULO: teste que o deixa sujo
 * contamina o arquivo seguinte da suite. Volta sempre ao PT. */
test.afterEach(() => setIdiomaMadre(IDIOMA_PADRAO));

const OUTROS = { es: ES, en: EN };

/* =====================================================================
 * 1 · A ENTRADA DE REFERENCIA
 * =====================================================================
 * A MESMA para os tres idiomas: e a unica forma de a diferenca na saida ser o
 * idioma e nada mais. Carta montada aqui, e nao tirada do baralho, porque
 * datos/cartas.json so existe em portugues — a lente (carta.amor) e a citacao
 * do consejo VAO EM PORTUGUES por contrato em qualquer idioma, e misturar isso
 * com a copy do motor esconderia o defeito que este arquivo persegue. */
const CARTA = Object.freeze({
  id: 'teste-neutra',
  nombre: 'Neutra',
  amor: 'LENTE',
  consejo: 'CONSEJO',
  consejoInv: 'CONSEJO-INV',
  claves: Object.freeze(['a', 'b']),
});

const TIRADA = Object.freeze([
  Object.freeze({ carta: CARTA, invertida: false }),
  Object.freeze({ carta: CARTA, invertida: true }),
  Object.freeze({ carta: CARTA, invertida: false }),
]);

const RESPUESTAS = Object.freeze({
  nombre: 'Ana',
  corte: 'pelea',
  cuando: 'dias',
  hoy: 'me-escribe-a-veces',
  intencion: 'entender-que-paso',
});

function leer(lang, respuestas) {
  setIdiomaMadre(lang);
  return componerLectura({ respuestas: respuestas || RESPUESTAS, tirada: TIRADA });
}

/** Todo texto que o MOTOR compos, e so ele.
 *
 *  Fora de proposito: a lente (`cuerpo`), a citacao dentro de «», os rotulos que
 *  vem de t() e os LIMITES. Os dois primeiros sao conteudo do BARALHO, que so
 *  existe em PT; os dois ultimos sao chave de datos/textos.js, cobrados pelo
 *  placar de cobertura e pertencentes a outra onda de traducao. Varrer aqui o
 *  que outro portao ja cobra so produz falha duplicada e ruido. */
function textosDoMotor(r) {
  const fora = [];
  r.posiciones.forEach((p) => {
    fora.push([`posiciones.${p.clave}.pregunta`, p.pregunta]);
    fora.push([`posiciones.${p.clave}.frase`, p.frase]);
    fora.push([`posiciones.${p.clave}.aviso`, p.aviso]);
    /* Da linha citada so entra a ENTRADA (o "Em pe nesta posicao, a carta...");
     * o consejo entre «» e citacao do baralho. Corta no «. */
    if (typeof p.linea === 'string') {
      const corte = p.linea.indexOf('«');
      fora.push([`posiciones.${p.clave}.linea.entrada`, corte === -1 ? p.linea : p.linea.slice(0, corte)]);
    }
  });
  fora.push(['sintesis.saludo', r.sintesis.saludo]);
  fora.push(['sintesis.lectura', r.sintesis.lectura.texto]);
  fora.push(['sintesis.tuParte', r.sintesis.tuParte.texto]);
  fora.push(['sintesis.accion', r.sintesis.accion.texto]);
  return fora.filter(([, v]) => typeof v === 'string' && v.trim() !== '');
}

/* =====================================================================
 * 2 · AS MARCAS DE PORTUGUES
 * =====================================================================
 * Palavras e formas que existem em portugues e NAO em espanhol nem em ingles.
 * Lista fechada e medida contra a copy real dos tres arquivos, nunca regra
 * ampla: "nao"/"no" e "a"/"a" sao comuns as tres linguas e acusariam tudo.
 *
 * Cada marca e uma palavra INTEIRA, com a borda que funciona com acento (o \b do
 * JavaScript e ASCII puro e perde justo a forma acentuada — mesmo motivo e mesma
 * forma de madremaria/lib/lectura.js:115). */
const LETRA = '0-9A-Za-zÀ-ÖØ-öø-ÿ';
const palavra = (corpo) => new RegExp(`(?:^|[^${LETRA}])(?:${corpo})(?![${LETRA}])`, 'i');

/* A LISTA E DE MARCAS EXCLUSIVAS, e isso foi MEDIDO, nao suposto.
 *
 * A primeira versao deste portao usava "que", "hoy/hoje", "carta", "dos", "da" —
 * e acusou as QUINZE saidas espanholas, todas corretamente traduzidas. Motivo:
 * portugues e espanhol compartilham essas palavras inteiras, e um detector de
 * idioma feito de vocabulario comum acusa o idioma irmao sempre. O falso
 * positivo aqui e caro: ele ensina a afrouxar o portao.
 *
 * Entao a regra e: so entra forma que NAO EXISTE em espanhol nem em ingles.
 * Sobram tres familias, e as tres sao morfologicas (ortografia e desinencia),
 * nao lexicais:
 *   · o TIL (a~, o~) — o espanhol nao tem essas letras, o ingles nao tem nenhuma;
 *   · as terminacoes -cao/-coes e -lh-/-nh- — digrafos que o espanhol escreve
 *     de outra forma (-cion/-ciones, -ll-, -n~-);
 *   · um punhado de palavras-funcao gramaticais inconfundiveis: voce, nao,
 *     voces, isto/isso, entao, muito, tambem, porque (com acento),
 *     e as contracoes com til/acento.
 * Todas sao CASE-INSENSITIVE e com a borda que funciona com acento (o \b do
 * JavaScript e ASCII puro e perderia justo a forma acentuada — mesmo motivo e
 * mesma forma de madremaria/lib/lectura.js:115).
 *
 * Conferida nos dois sentidos: o bloco 1c prova que ela ACUSA o portugues de
 * verdade, e o 1a que ela NAO acusa o espanhol nem o ingles desta obra. */
const MARCAS_PT = Object.freeze([
  { re: /[ãõÃÕ]/, diz: 'til (a~/o~): letra que nao existe em ES nem EN' },
  { re: palavra('voc[ê]s?'), diz: 'tratamento portugues "voce/voces"' },
  { re: palavra('n[ã]o'), diz: 'negacao portuguesa "nao"' },
  { re: palavra('(?:isto|isso|ent[ã]o|tamb[é]m|muito|muita|ningu[é]m|algu[é]m)'), diz: 'palavra-funcao portuguesa' },
  { re: palavra('[a-zà-ú]*ç[ãõ]?[a-zà-ú]*'), diz: 'cedilha (c,) em posicao portuguesa' },
  { re: palavra('[a-zà-ú]{2,}(?:lh|nh)[aeiou][a-zà-ú]*'), diz: 'digrafo portugues -lh-/-nh-' },
  /* `est[á]` e `d[á]` SAIRAM: "está" e "da" sao espanhol correntissimo (estar na
   * terceira pessoa, e a preposicao/artigo). Ficam so as formas que o espanhol
   * escreve de outro jeito: é/sao/tem/ve/le/vao viram es/son/tiene/ve.../van. */
  { re: palavra('(?:é|s[ã]o|t[ê]m|l[ê]|v[ã]o)'), diz: 'verbo portugues acentuado (e/sao/tem/le/vao)' },
]);

/** As marcas de portugues que `texto` carrega. */
function marcasDe(texto) {
  return MARCAS_PT.filter(({ re }) => re.test(texto)).map(({ diz }) => diz);
}

/* =====================================================================
 * 3 · A REGRA QUE O CHAMADO PEDIU
 * ===================================================================== */

test('1a. componerLectura em ES e EN nao devolve portugues em nenhum campo do motor', () => {
  const achados = [];

  for (const lang of ['es', 'en']) {
    const r = leer(lang);
    for (const [campo, texto] of textosDoMotor(r)) {
      const marcas = marcasDe(texto);
      if (marcas.length > 0) achados.push({ lang, campo, texto, marcas });
    }
  }

  assert.equal(
    achados.length,
    0,
    'A TELA CENTRAL SAIU EM PORTUGUES.\n'
      + '\nO motor compoe esses campos de TABLAS/ALTERNATIVAS. Campo em portugues\n'
      + 'com idioma es/en ativo significa que a chave nao existe no irmao\n'
      + '(madremaria/lib/lectura.es.js / lectura.en.js) e caiu no fallback do PT.\n'
      + `\n${achados.length} campo(s):`
      + achados
        .map(
          (a, i) =>
            `\n  ${i + 1}. [${a.lang.toUpperCase()}] ${a.campo}\n`
            + `     marcas : ${a.marcas.join('; ')}\n`
            + `     texto  : ${a.texto}`
        )
        .join('')
  );
});

test('1b. a varredura tem o que ler: o motor compoe texto em todos os tres idiomas', () => {
  /* Sem este piso, 1a ficaria verde por varrer ZERO campo — o modo mais facil de
   * um portao virar decoracao. */
  for (const lang of ['pt', 'es', 'en']) {
    const lidos = textosDoMotor(leer(lang));
    assert.ok(lidos.length >= 10, `${lang}: so ${lidos.length} campos compostos pelo motor`);
    for (const [campo, texto] of lidos) {
      assert.ok(texto.trim().length > 0, `${lang}: ${campo} saiu vazio`);
      assert.ok(!/undefined|null|\[object/.test(texto), `${lang}: ${campo} vazou valor tecnico: ${texto}`);
    }
  }
});

test('1c. o PT continua em portugues — a traducao nao virou o padrao por acidente', () => {
  /* O espelho de idioma e variavel de MODULO: um setIdiomaMadre esquecido em
   * outro arquivo deixaria o app inteiro noutra lingua. Este teste e a ancora. */
  const r = leer('pt');
  const pregunta = r.posiciones[0].pregunta;
  assert.equal(pregunta, TABLAS.preguntaNudo.pelea, 'o PT deixou de vir do TABLAS deste arquivo');
  assert.ok(marcasDe(pregunta).length > 0, 'a pergunta em PT nao parece portuguesa — marcas quebradas?');
  assert.equal(r.sintesis.saludo.includes('Ana'), true);
});

/* =====================================================================
 * 4 · AS ALTERNATIVAS — a parte que protege quem esta em bloqueio
 * =====================================================================
 * A alternativa e o que entra NO LUGAR da frase retirada. Se ela propria pedir
 * contato, a guarda a retira tambem e quem esta em contato duro recebe o
 * empurrao que a protecao existia para evitar.
 *
 * Em ES a propria guarda responde: PATRONES_CONTACTO de lib/lectura.js carrega a
 * rede espanhola viva (escribele, llamar, habla, dile, espera respuesta).
 * Em EN a guarda e CEGA — nao ha um unico padrao ingles nela —, e por isso o
 * ingles e conferido contra uma lista explicita aqui. */

/* O CRITERIO E O QUE lib/lectura.js JA DECLARA PARA O PORTUGUES, aplicado ao
 * ingles: "forma que so existe como ORDEM entra sozinha; forma que tambem existe
 * como NARRACAO so entra acompanhada de um objeto ou de um destinatario".
 *
 * Medido: a lista ingenua (o substantivo "contact" solto) acusou
 * ALTERNATIVAS.contacto.generica — "With contact the way it stands today, this
 * reading asks for no step outward" —, que e a DESCRICAO DO ESTADO e a traducao
 * literal do portugues "Com o contato do jeito que esta hoje". E a frase que
 * PROTEGE a pessoa, e um portao que a reprova estaria pedindo para ser
 * afrouxado na semana seguinte. Mesmo raciocinio da RECUSA em
 * test/madremaria-promessa-tres-idiomas.test.js.
 *
 * Entao o substantivo sai e o VERBO entra. "contact"/"reach" so casam com
 * destinatario ("contact them", "reach out"); "message" e "text" so como verbo
 * ou com alvo. O que empurra para fora continua caindo. */
const CONTATO_EN = Object.freeze([
  /* verbos de saida cuja forma so existe como instrucao aqui */
  palavra('(?:write|writing|wrote|texting|texted|messaging|messaged|calling|called|phoning|emailing)'),
  palavra('(?:reply|replies|replying|respond|responding|answering)'),
  palavra('(?:send|sending|sent|dm|email|e-mail)'),
  /* verbo ambiguo + destinatario: e o alvo que separa ordem de descricao */
  /\b(?:contact|reach|approach|call|text|message|tell|ask|talk to|speak to)\s+(?:them|him|her|that person|the person|your ex)\b/i,
  /* locucoes que nao precisam de verbo de contato para empurrar para fora */
  /\breach out\b/i,
  /\bget in touch\b/i,
  /\bfirst (?:step|move)\b/i,
  /\bbreak the ice\b/i,
  /\bwait(?:ing)? for (?:a|an|any|some)?\s*(?:reply|answer|sign|response|word)\b/i,
  /\bdon(?:'|’)?t give up on (?:writing|calling|trying)\b/i,
]);

/* Futuro e promessa em ingles — a morfologia de hablaDelFuturo() e PT/ES e nao
 * ve "will". Sem esta lista, "that person will come back" passaria inteiro. */
const FUTURO_EN = Object.freeze([
  /\b(?:will|won['’]t|shall)\b/i,
  /\b(?:is|are|am)\s+going\s+to\b/i,
  /\bsooner or later\b/i,
  /\bone day\b/i,
  /\bin time\b/i,
  /\bwhen (?:he|she|they|that person)\b/i,
]);

/* Genero atribuido a outra pessoa: a doutrina manda "esa persona"/"that person",
 * nunca el/ella/him/her. Item 4 do contrato de lib/lectura.js. */
const GENERO = Object.freeze({
  es: [palavra('(?:él|ella|ellos|ellas)')],
  en: [palavra('(?:he|she|him|her|hers|his)')],
});

/* Voseo e ustedes: o espanhol e "tu", LatAm neutro.
 *
 * SO AS FORMAS ACENTUADAS, e isso e o ponto: o voseo se distingue do tuteo pela
 * TONICA, nao pela letra. `sab[ée]s` com a vogal alternativa casaria "sabes",
 * que e tuteo correto — e foi exatamente o falso positivo que este portao deu na
 * primeira rodada, acusando "lo que sabes y lo que estas suponiendo". Tem de ser
 * `sab[é]s` e nada mais. Mesmo criterio para as outras: tenes/podes/queres com
 * acento sao voseo; sem acento sao tuteo e TEM de passar. */
const VOSEO = Object.freeze([
  palavra('(?:vos|vosotros|vosotras|usted|ustedes)'),
  palavra('(?:sos|tenés|podés|querés|sabés|tené|mirá|decí|andá|hacé|hacés|sentí)'),
]);

function cadaAlternativa(mod) {
  const fora = [];
  for (const grupo of ['contacto', 'futuro']) {
    for (const [clave, texto] of Object.entries(mod.ALTERNATIVAS[grupo])) {
      fora.push([`ALTERNATIVAS.${grupo}.${clave}`, texto]);
    }
  }
  fora.push(['ALTERNATIVAS.aviso', mod.ALTERNATIVAS.aviso]);
  return fora;
}

test('2a. ES: nenhuma alternativa casa com a propria guarda que ela substitui', () => {
  /* A guarda espanhola de lib/lectura.js esta viva, entao aqui a prova e direta:
   * a propria funcao do motor julga a copy espanhola. */
  for (const [campo, texto] of cadaAlternativa(ES)) {
    assert.equal(
      sugiereContacto(texto),
      false,
      `${campo} (ES) casa com PATRONES_CONTACTO — a guarda comeria a propria `
        + `alternativa e quem esta em bloqueio receberia o empurrao:\n  ${texto}`
    );
    assert.equal(hablaDelFuturo(texto), false, `${campo} (ES) casa com PATRONES_FUTURO:\n  ${texto}`);
  }
});

test('2b. EN: nenhuma alternativa contem palavra de contato nem futuro', () => {
  /* A guarda do motor nao conhece ingles. Este teste E a guarda do ingles. */
  for (const [campo, texto] of cadaAlternativa(EN)) {
    for (const re of CONTATO_EN) {
      assert.equal(
        re.test(texto),
        false,
        `${campo} (EN) contem palavra de contato (${re}) — em ingles a guarda do `
          + `motor e cega, entao esta lista e a unica protecao:\n  ${texto}`
      );
    }
    for (const re of FUTURO_EN) {
      assert.equal(re.test(texto), false, `${campo} (EN) fala do futuro (${re}):\n  ${texto}`);
    }
  }
});

test('2c. as alternativas dos TRES idiomas nunca atribuem genero a outra pessoa', () => {
  for (const [lang, mod] of Object.entries(OUTROS)) {
    for (const [campo, texto] of cadaAlternativa(mod)) {
      for (const re of GENERO[lang]) {
        assert.equal(
          re.test(texto),
          false,
          `${campo} (${lang.toUpperCase()}) atribui genero a outra pessoa (${re}). `
            + `A doutrina manda "esa persona"/"that person":\n  ${texto}`
        );
      }
    }
  }
});

test('2d. o espanhol do motor inteiro e "tu" — nunca vos, vosotros ou usted', () => {
  const achados = [];
  const ver = (campo, texto) => {
    for (const re of VOSEO) if (re.test(texto)) achados.push(`${campo}: ${texto}`);
  };
  andar(ES.TABLAS, 'TABLAS', ver);
  andar(ES.ALTERNATIVAS, 'ALTERNATIVAS', ver);
  ver('SALUDO_SIN_NOMBRE', ES.SALUDO_SIN_NOMBRE);
  assert.equal(achados.length, 0, `VOSEO NO ESPANHOL DA MADRE:\n  ${achados.join('\n  ')}`);
});

/** Anda por objeto/string chamando ver(caminho, texto) em toda string. */
function andar(valor, caminho, ver) {
  if (typeof valor === 'string') return ver(caminho, valor);
  if (!valor || typeof valor !== 'object') return;
  for (const [k, v] of Object.entries(valor)) andar(v, caminho ? `${caminho}.${k}` : k, ver);
}

/* =====================================================================
 * 5 · A FORMA — chave que falta num idioma sai vazia na tela
 * ===================================================================== */

/** Todos os caminhos de string de um objeto, ordenados. */
function caminhos(obj) {
  const fora = [];
  andar(obj, '', (c) => fora.push(c));
  return fora.sort();
}

test('3a. ES e EN tem EXATAMENTE as chaves do PT em TABLAS e ALTERNATIVAS', () => {
  for (const [lang, mod] of Object.entries(OUTROS)) {
    for (const [nome, pt, tr] of [
      ['TABLAS', TABLAS, mod.TABLAS],
      ['ALTERNATIVAS', ALTERNATIVAS, mod.ALTERNATIVAS],
    ]) {
      const esperadas = caminhos(pt);
      const achadas = caminhos(tr);
      const faltam = esperadas.filter((c) => !achadas.includes(c));
      const sobram = achadas.filter((c) => !esperadas.includes(c));
      assert.deepEqual(
        faltam,
        [],
        `${nome} (${lang.toUpperCase()}): ${faltam.length} chave(s) do PT sem traducao — `
          + `a tela cai no portugues nesses campos: ${faltam.join(', ')}`
      );
      assert.deepEqual(
        sobram,
        [],
        `${nome} (${lang.toUpperCase()}): chave que nao existe no PT — o motor nunca `
          + `vai pedi-la: ${sobram.join(', ')}`
      );
    }
  }
});

test('3b. o saudo sem nome existe traduzido nos tres, e nunca vira virgula solta', () => {
  /* SALUDO_SIN_NOMBRE e a PRIMEIRA linha da sintese. Foi TRADUZIDO nos tres, e
   * nao deixado em PT de proposito: uma frase portuguesa no topo de um bloco
   * traduzido e o defeito exato de feedback-app-inteiro-no-mesmo-idioma. */
  const vistos = new Set();
  for (const lang of ['pt', 'es', 'en']) {
    setIdiomaMadre(lang);
    const frase = saludoSinNombre();
    assert.equal(typeof frase, 'string');
    assert.ok(frase.trim().length > 0, `${lang}: saudacao sem nome vazia`);
    assert.ok(!frase.startsWith(','), `${lang}: saudacao virou virgula solta: ${frase}`);
    assert.ok(!frase.includes('{'), `${lang}: marcador nao interpolado em: ${frase}`);
    vistos.add(frase);

    /* E ela tem de CHEGAR na saida quando o nome nao veio. */
    const r = componerLectura({ respuestas: { ...RESPUESTAS, nombre: '' }, tirada: TIRADA });
    assert.equal(r.sintesis.saludo, frase, `${lang}: a sintese nao usou a saudacao sem nome`);
  }
  assert.equal(vistos.size, 3, 'dois idiomas compartilham a mesma saudacao — algum nao traduziu');
  assert.equal(SALUDO_SIN_NOMBRE, 'Isto é o que ficou sobre a mesa.', 'a constante PT mudou');
});

test('3c. LIMITES segue o idioma ATIVO, e nao o idioma do instante do import', () => {
  /* Era um objeto de modulo (t() avaliado uma vez, no topo do arquivo, ANTES de
   * o provider empurrar idioma nenhum): a tela trocava de idioma e os limites
   * ficavam em portugues para sempre. Virou funcao. Aqui a prova usa o proprio
   * dicionario em memoria, igual ao teste de lista() de madremaria-i18n. */
  const { _DICTS_PARA_TESTE } = require('../madremaria/datos/textos.js');
  const en = _DICTS_PARA_TESTE.en;
  const antes = { t: en['limites.titulo'], l: en['limites.lineas'], p: en['limites.pie'] };
  try {
    en['limites.titulo'] = 'TITULO-EN';
    en['limites.lineas'] = ['L1-EN', 'L2-EN', 'L3-EN'];
    en['limites.pie'] = 'PIE-EN';

    const ptR = leer('pt');
    assert.notEqual(ptR.limites.titulo, 'TITULO-EN', 'o PT pegou o titulo ingles');

    const enR = leer('en');
    assert.equal(enR.limites.titulo, 'TITULO-EN', 'LIMITES nao seguiu o idioma ativo');
    assert.deepEqual(enR.limites.lineas, ['L1-EN', 'L2-EN', 'L3-EN'], 'limites.lineas nao seguiu o idioma');
    assert.equal(enR.limites.pie, 'PIE-EN');
    /* lineas tem de continuar ARRAY: a tela indexa por posicao. */
    assert.ok(Array.isArray(enR.limites.lineas));
  } finally {
    en['limites.titulo'] = antes.t;
    en['limites.lineas'] = antes.l;
    en['limites.pie'] = antes.p;
  }
});

/* =====================================================================
 * 6 · AS GUARDAS CONTINUAM RODANDO NOS OUTROS IDIOMAS
 * =====================================================================
 * Traduzir nao pode ter desligado a protecao. O caso que importa e o filtro
 * duro: a pessoa diz "escrevi e ninguem respondeu" ou "zero contato", e a
 * leitura NAO pode responder com um empurrao. */

test('4a. o filtro de contato duro continua mordendo com idioma es/en ativo', () => {
  const VENENO = Object.freeze({
    ...CARTA,
    /* O consejo e o que a guarda varre (a lente vai verbatim). Frase em ES
     * porque a rede espanhola do motor e a que esta viva, e assim a MESMA carta
     * prova a guarda nos tres idiomas. */
    consejo: 'Escríbele hoy y mandále un mensaje.',
    consejoInv: 'Escríbele hoy y mandále un mensaje.',
  });
  const tirada = [0, 1, 2].map(() => ({ carta: VENENO, invertida: false }));

  for (const lang of ['pt', 'es', 'en']) {
    setIdiomaMadre(lang);
    const r = componerLectura({ respuestas: { ...RESPUESTAS, hoy: 'cero-contacto' }, tirada });
    assert.equal(r.filtros.contactoDuro, true, `${lang}: o filtro duro nao ligou`);
    assert.equal(r.filtros.contactoAplicado, true, `${lang}: a guarda de contato nao disparou`);
    for (const p of r.posiciones) {
      assert.equal(
        sugiereContacto(p.texto),
        false,
        `${lang}/${p.clave}: a posicao chegou a tela pedindo contato:\n${p.texto}`
      );
    }
  }
});

test('4b. A SUA PONTA nunca fala do futuro, em nenhum idioma', () => {
  for (const lang of ['pt', 'es', 'en']) {
    setIdiomaMadre(lang);
    const r = componerLectura({ respuestas: RESPUESTAS, tirada: TIRADA });
    const extremo = r.posiciones.find((p) => p.clave === 'extremo');
    for (const parte of [extremo.pregunta, extremo.frase, r.sintesis.accion.texto]) {
      if (typeof parte !== 'string' || !parte.trim()) continue;
      assert.equal(hablaDelFuturo(parte), false, `${lang}: A SUA PONTA falou do futuro:\n${parte}`);
      for (const re of FUTURO_EN) {
        assert.equal(re.test(parte), false, `${lang}: futuro ingles (${re}) em:\n${parte}`);
      }
    }
  }
});

/* =====================================================================
 * 7 · O MOTOR CONTINUA PURO E DETERMINISTICO COM TRES IDIOMAS
 * ===================================================================== */

test('5a. mesma entrada + mesmo idioma = mesma saida; e trocar idioma troca o texto', () => {
  const a = JSON.stringify(leer('en'));
  const b = JSON.stringify(leer('en'));
  assert.equal(a, b, 'o motor deixou de ser deterministico');

  const pt = leer('pt').sintesis.tuParte.texto;
  const es = leer('es').sintesis.tuParte.texto;
  const en = leer('en').sintesis.tuParte.texto;
  assert.equal(new Set([pt, es, en]).size, 3, 'dois idiomas devolveram o MESMO texto de sintese');
});

test('5b. idioma que a Madre nao fala cai no PT, sem quebrar', () => {
  setIdiomaMadre('pt');
  const esperado = leer('pt').sintesis.tuParte.texto;
  setIdiomaMadre('klingon'); // ignorado por setIdiomaMadre: o anterior continua
  const r = componerLectura({ respuestas: RESPUESTAS, tirada: TIRADA });
  assert.equal(r.sintesis.tuParte.texto, esperado);
});

test('5c. traducao INCOMPLETA nunca vira undefined: cai na generica do idioma, e so depois no PT', () => {
  /* O caso real do dia em que uma chave nova nascer no PT antes de ser traduzida.
   *
   * A ORDEM DO FALLBACK, MEDIDA (e ela e melhor do que a que eu supunha ao
   * escrever este teste): uma chave que falta na tabela do idioma cai primeiro na
   * `generica` DAQUELA MESMA LINGUA — porque elegir() resolve a generica dentro
   * da tabela escolhida — e so cai no PORTUGUES quando a tabela inteira nao
   * existe no irmao. Esta e a degradacao certa: quem le em ingles recebe uma
   * frase inglesa generica, e nao um paragrafo portugues solto no meio da tela,
   * que e justamente o defeito que feedback-app-inteiro-no-mesmo-idioma nomeia.
   *
   * A falta e simulada trocando o TABLAS do namespace do modulo, e nao escrevendo
   * dentro dele: a tabela vem congelada em profundidade de proposito (congelar()
   * em lectura.en.js), e um teste que conseguisse escrever nela estaria provando
   * que o congelamento nao funciona. */
  const original = EN.TABLAS;
  const semAChave = { ...original.tuParte };
  delete semAChave['entender-que-paso'];
  EN.TABLAS = Object.freeze({ ...original, tuParte: Object.freeze(semAChave) });
  try {
    const r = leer('en');
    assert.equal(
      r.sintesis.tuParte.texto,
      original.tuParte.generica,
      'chave faltando no EN nao caiu na generica inglesa'
    );
    assert.equal(marcasDe(r.sintesis.tuParte.texto).length, 0, 'o fallback trouxe portugues para a tela inglesa');
    /* e o resto da tela continua ingles: a degradacao e por CAMPO, nao por tela */
    assert.equal(r.sintesis.accion.texto, original.accion['entender-que-paso']);
    assert.ok(!/undefined/.test(JSON.stringify(r)), 'vazou undefined para a tela');
  } finally {
    EN.TABLAS = original;
  }
  assert.equal(EN.TABLAS, original, 'o teste nao restaurou o modulo');
});

test('5d. tabela que NAO existe no irmao cai no portugues inteira, sem quebrar', () => {
  /* O outro degrau do fallback: o arquivo de idioma novo que nasce pela metade
   * (um tradutor comeca por TABLAS.accion e deixa o resto para depois). A tela
   * tem de sair, e tem de sair em portugues NAQUELA tabela — nunca undefined. */
  const original = EN.TABLAS;
  const semTabela = { ...original };
  delete semTabela.tuParte;
  EN.TABLAS = Object.freeze(semTabela);
  try {
    const r = leer('en');
    assert.equal(
      r.sintesis.tuParte.texto,
      TABLAS.tuParte['entender-que-paso'],
      'tabela ausente no EN nao caiu no portugues'
    );
    assert.ok(!/undefined/.test(JSON.stringify(r)), 'vazou undefined para a tela');
  } finally {
    EN.TABLAS = original;
  }
});
