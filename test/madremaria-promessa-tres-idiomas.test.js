// test/madremaria-promessa-tres-idiomas.test.js
//
// O PORTAO DA DOUTRINA NOS TRES IDIOMAS.
//
// ===========================================================================
// O BURACO QUE ESTE ARQUIVO FECHA
// ===========================================================================
// A doutrina de madremaria/theme.js:80 diz, no CONTRATO DE PRODUTO, item 1:
//
//     "A leitura descreve o que a carta mostra e devolve uma acao para a
//      usuaria. Nunca um desfecho, nunca uma promessa sobre o que a outra
//      pessoa vai fazer."
//
// Ela e cobrada hoje por SETE portoes espalhados, e TODOS eles tem lista de
// padrao escrita contra o PORTUGUES (ou, em um caso, contra o espanhol legado
// do baralho). Inventario do que existia antes deste arquivo:
//
//   test/madremaria-celula.test.js:19        PROIBIDAS  — /vai voltar/, /garant/,
//                                           /alma gemea/, /destino/, /%/ ... so PT.
//                                           Varre FRASES e as 419 missoes.
//   test/madremaria-ano.test.js:654          AFIRMA_DESFECHO — /voltara/, /vai
//                                           voltar/, /reconquist/ ... so PT.
//                                           Varre AFIRMACOES (31+).
//   test/madremaria-diagnostico.test.js:99   PROIBIDO — /voltara/, /vai voltar/,
//                                           /com certeza/ ... so PT. Varre a
//                                           saida do diagnostico.
//   test/madremaria-contenido.test.js:89     PROIBIDO — /volvera/, /va a volver/,
//                                           /garantiza/ ... so ES (o baralho
//                                           nasceu em espanhol). Varre cartas.json.
//   test/madremaria-gamificacao.test.js:397  usa hablaDelFuturo() nos titulos e
//                                           pistas de missao.
//   madremaria/lib/lectura.js:422            hablaDelFuturo() — morfologia de
//                                           futuro PT+ES (-ra/-rao/-ran). NAO
//                                           cobre ingles: "will come back" nao
//                                           tem terminacao nenhuma para morder.
//   madremaria/lib/lectura.js:416            sugiereContacto() — PT+ES.
//
// Conclusao medida: um "volvera" espanhol passa por SEIS dos sete (so o que
// herdou o espanhol legado o pegaria, e ele varre apenas cartas.json); um
// "will come back" ingles passa por TODOS OS SETE. Quando textos.es.js e
// textos.en.js sairem do vazio, e quando os arquivos de conteudo ganharem seus
// vizinhos .es.js/.en.js, dois tercos do app ficam sem guarda — e o espanhol e
// o publico ORIGINAL deste funil.
//
// Este arquivo NAO inventa doutrina nova. Ele pega a mesma regra dos sete
// portoes acima e a escreve nas tres linguas, sobre TODA a superficie visivel.
//
// ===========================================================================
// O QUE ELE VARRE (e por que a descoberta e DINAMICA)
// ===========================================================================
//   1. OS DICIONARIOS DE TELA — PT (objeto no proprio datos/textos.js), ES
//      (datos/textos.es.js) e EN (datos/textos.en.js), lidos por
//      _DICTS_PARA_TESTE. Hoje ES/EN estao vazios: o portao passa por vacuidade
//      e ACORDA sozinho na primeira chave traduzida. Nao ha lista de chave aqui.
//
//   2. OS ARQUIVOS DE CONTEUDO — datos/*.js varridos do DISCO, nao de uma lista
//      escrita a mao. O PT de hoje (missoes365, lenormand, bancos, lecturas,
//      lunacoes, hechos, rituais, ritual, fases, preguntas, profunda, sinastria,
//      plano, escada, frases) e, no minuto em que existirem, os vizinhos
//      missoes365.es.js, missoes365.en.js, lenormand.es.js e o resto.
//
//      POR QUE DINAMICO, e nao uma lista: uma lista escrita hoje nao conhece os
//      arquivos que a Onda 2 vai criar. O tradutor que cria lenormand.en.js
//      amanha nao tem como saber que precisa vir aqui adicionar o nome dele — e
//      a falha desse esquecimento e SILENCIOSA (portao verde, arquivo sem
//      guarda, promessa na loja). A descoberta pelo disco e o conserto de raiz:
//      arquivo novo em datos/ ja nasce varrido.
//
//      O IDIOMA DE CADA ARQUIVO sai do NOME: `x.es.js` e espanhol, `x.en.js` e
//      ingles, `x.js` e portugues. Mesma convencao de textos.es.js/textos.en.js,
//      que a Onda 1 ja fixou, e de cartas.es.json.
//
// ===========================================================================
// O QUE ELE **NAO** VARRE, e cada exclusao tem um motivo verificado
// ===========================================================================
//   · CHAVES TECNICAS (id, clave, slug, tipo, grupo, rota, variante...) — nao
//     sao texto visivel. 'volver-a-empezar' como id de capitulo e dado, nao copy.
//   · audio — nome de arquivo .m4a resolvido por require estatico do Metro.
//   · fonte/fuente/obra/autor/quando — CITACAO BIBLIOGRAFICA REAL. "Telling
//     Fortunes by Tea Leaves" (Cicely Kent, Londres 1922) e "A Manual of
//     Cheirosophy" sao livros que existem; `autor` e nome de pessoa e `quando` e
//     lugar+ano. Nenhum dos tres se traduz, e nenhum dos tres pode casar com um
//     padrao de promessa — sao nome proprio e data.
//     ATENCAO: `nota` DENTRO de fonte NAO e excluida — ela e prosa da Madre
//     sobre a obra (o que a fonte NAO sustenta), e prosa se traduz e se vigia.
//   · 'Madre Maria' — nome proprio. Nao e promessa em nenhum idioma.
//
// ===========================================================================
// O FALSO POSITIVO QUE NAO PODEMOS COMETER
// ===========================================================================
// "reconquista" (PT/ES) e "comeback" (EN) NOMEIAM o que a PESSOA faz, e sao o
// assunto do produto: o titulo aprovado pelo dono e "Sua reconquista comeca
// aqui". Proibir a PALAVRA reprovaria o proprio titulo honesto — e o proximo
// agente, vendo o portao acusar copy aprovada, afrouxaria o portao INTEIRO.
//
// Entao: proibimos a PROMESSA, nunca a palavra. "sua reconquista" passa.
// "reconquiste em 30 dias" nao. "lo recuperaras" nao. A regra e a gramatica da
// garantia (futuro cujo sujeito e a outra pessoa, prazo, selo de certeza), nao
// o vocabulario do nicho. O bloco 7-bis deste arquivo e a trava disso: ele
// exige que o titulo aprovado PASSE, e existe para que um falso positivo seja
// consertado ESTREITANDO a formula, nunca afrouxando o portao.
//
// NOTA: test/madremaria-ano.test.js:661 proibe /\breconquist/ inteiro — mas so
// sobre AFIRMACOES, que sao a frase do dia na PRIMEIRA PESSOA ("Eu vou
// reconquistar o que era meu" e promessa a si mesma). Regra estreita e
// deliberada, de uma superficie so. Este portao e amplo e por isso NAO herda
// aquela: se herdasse, reprovaria o titulo da Home.
//
// ===========================================================================
// PROVA POR MUTACAO
// ===========================================================================
// Os blocos 7 e 7-bis plantam promessa nos TRES idiomas e exigem que a
// varredura MORDA, e plantam copy honesta e exigem que ela PASSE. Sem eles uma
// regex quebrada deixaria o portao verde para sempre, e decoracao neste lugar
// especifico e pior que nada: da a sensacao de que ha guarda.
//
// ===========================================================================
// ONDE MORA CADA BLOCO (depois da extracao do motor)
// ===========================================================================
// Os blocos 1 a 3 — as formulas por idioma, a fronteira que funciona com acento
// (1-bis), a RECUSA (3), o filtro de sujeito (3-ter), as excecoes nomeadas
// (3-quater) e a varredura (3-bis) — mudaram para test/promessa-scanner.js, com
// a numeracao intacta: uma referencia a "bloco 3-ter" neste arquivo se acha la,
// com o mesmo nome. O que ficou aqui sao as VARREDURAS da Madre (blocos 4 a 6) e
// a PROVA POR MUTACAO do motor (blocos 7 a 7-sexies).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { IDIOMAS, _DICTS_PARA_TESTE } from '../madremaria/datos/textos.js';

/* FUSAO COSMIC GUIDE: o pipeline transpila para CommonJS com alvo Hermes, que
 * rejeita `import.meta`. __dirname existe nesse alvo. Mesmo criterio de
 * test/madremaria-contenido.test.js. */
const DATOS = join(__dirname, '..', 'madremaria', 'datos');
const LIB = join(__dirname, '..', 'madremaria', 'lib');

/* =====================================================================
 * 1 · O MOTOR MORA EM test/promessa-scanner.js
 * =====================================================================
 * As formulas por idioma, a RECUSA, o filtro de artefato, as excecoes nomeadas
 * e a varredura SAIRAM deste arquivo e viraram modulo — sem uma virgula de
 * mudanca na doutrina. O motivo esta no cabecalho de promessa-scanner.js, e em
 * uma linha: a mesma regra tem de vigiar tambem lib/i18n.js, onde vivem 2481
 * chaves POR IDIOMA (Home, Quiz, Onboarding, Horoscopo, Loja...), e copiar as
 * ~70 formulas para um segundo arquivo daria duas listas que divergem no
 * primeiro conserto.
 *
 * Hoje ha DOIS portoes e UMA lista:
 *   este arquivo                          — madremaria/ (datos, lib, telas)
 *   test/copy-promessa-app-inteiro.test.js — lib/i18n.js nos tres idiomas
 *
 * A PROVA POR MUTACAO DO MOTOR CONTINUA AQUI (blocos 7 a 7-sexies). Ela nasceu
 * neste arquivo e prova o motor INTEIRO, nao so a Madre: quem estreitar uma
 * formula por causa de um falso positivo na Home vai ver a falha aqui, que e
 * onde estao as frases plantadas nos tres idiomas. Nao mova esses blocos para
 * junto do portao novo — eles nao sao sobre a Madre nem sobre a Home, sao sobre
 * as formulas. */
import {
  FORMULAS,
  violacoesDe,
  ehRecusa,
  falaDoArtefato,
  EXCECOES,
  andar,
  varrerModulo,
  relatorio,
  CHAVE_FORA,
} from './promessa-scanner.js';


/* =====================================================================
 * 4 · OS DICIONARIOS DE TELA — PT, ES, EN
 * ===================================================================== */

test('nenhuma chave de tela promete desfecho, em nenhum dos tres idiomas', () => {
  const achados = [];
  let lidas = 0;

  for (const lang of IDIOMAS) {
    const dict = _DICTS_PARA_TESTE[lang];
    for (const [clave, valor] of Object.entries(dict)) {
      if (CHAVE_FORA.test(clave)) continue;
      andar(valor, clave, (campo, texto) => {
        lidas += 1;
        for (const v of violacoesDe(texto, lang)) {
          achados.push({
            lang,
            arquivo: `madremaria/datos/textos${lang === 'pt' ? '' : `.${lang}`}.js`,
            campo,
            texto,
            ...v,
          });
        }
      }, new WeakSet());
    }
  }

  assert.equal(achados.length, 0, relatorio(achados, 'COPY DE TELA PROMETENDO DESFECHO.'));

  // A varredura tem de ter tido o que ler. O PT sozinho ja garante isso; ES e
  // EN podem estar vazios hoje (obra em andamento) sem cegar o portao: quando
  // a primeira chave traduzida entrar, ela entra JA varrida.
  assert.ok(lidas > 700, `so ${lidas} textos de tela lidos — o PT tinha 775 chaves`);
});

/* =====================================================================
 * 5 · OS ARQUIVOS DE CONTEUDO — descobertos do DISCO
 * ===================================================================== */

/** Todo datos/*.js de conteudo, com o idioma tirado do NOME do arquivo.
 *  textos*.js fica fora: ele e o dicionario de tela, varrido no bloco 4. */
function arquivosDeConteudo() {
  return readdirSync(DATOS)
    .filter((f) => f.endsWith('.js'))
    .filter((f) => !/^textos(?:\.(?:es|en))?\.js$/.test(f))
    .map((f) => {
      const m = f.match(/^(.+?)\.(es|en)\.js$/);
      return { arquivo: f, base: m ? m[1] : f.replace(/\.js$/, ''), lang: m ? m[2] : 'pt' };
    });
}

test('nenhum arquivo de conteudo promete desfecho, em nenhum idioma que exista no disco', async () => {
  const achados = [];
  const varridos = [];

  for (const { arquivo, lang } of arquivosDeConteudo()) {
    /* import() em vez de readFileSync: queremos os VALORES finais (congelados,
     * derivados, montados por map), nao o texto-fonte — comentario de codigo
     * cita frase proibida de proposito (inclusive neste arquivo) e viraria
     * falso positivo. Mesmo criterio de test/madremaria-contenido.test.js. */
    const modulo = await import(`file://${join(DATOS, arquivo).replace(/\\/g, '/')}`);
    varrerModulo(modulo, lang, `madremaria/datos/${arquivo}`, achados);
    varridos.push(`${arquivo} (${lang})`);
  }

  assert.equal(achados.length, 0, relatorio(achados, 'CONTEUDO LONGO PROMETENDO DESFECHO.'));

  // Piso de cobertura: os arquivos de conteudo PT de hoje. Se alguem apagar um,
  // o portao acusa em vez de ficar verde por ter menos o que ler.
  assert.ok(
    varridos.length >= 13,
    `so ${varridos.length} arquivos de conteudo varridos: ${varridos.join(', ')}`
  );
});

/* =====================================================================
 * 5-bis · A COPY QUE MORA EM lib/ — as tabelas do MOTOR DE LEITURA
 * =====================================================================
 * O bloco 5 descobre conteudo varrendo madremaria/datos/. Isso deixava UM ponto
 * cego, e era o pior possivel: madremaria/lib/lectura.js guarda ~8 mil
 * caracteres de copy (TABLAS com preguntaNudo/fraseNudo/tiempo/contacto/accion,
 * ALTERNATIVAS com as frases do filtro de contato duro, o saudo sem nome) que
 * montam A TELA DA SINTESE — o climax do funil, o que a pessoa recebe depois das
 * tres cartas. Nao e datos/, nao e chave de textos.js, e por isso nem este
 * portao nem o placar de cobertura a viam.
 *
 * Agora ela entra aqui, pelos MESMOS mecanismos: as formulas por idioma, a
 * RECUSA, o filtro de artefato e as excecoes nomeadas. O idioma sai do NOME do
 * arquivo, igual ao bloco 5 — lectura.js e pt, lectura.es.js e es,
 * lectura.en.js e en —, entao um quarto idioma nasce varrido sem edicao aqui.
 * ===================================================================== */

/** Os arquivos de lib/ que carregam COPY, com o idioma tirado do nome.
 *  Lista nomeada, e nao readdirSync de lib/ inteiro: lib/ e quase todo motor
 *  (almacen, signo, proximaLua...), e varrer 40 modulos de logica para achar
 *  copy em tres so produziria import caro e falso positivo em nome de variavel. */
function arquivosDeCopyEmLib() {
  return [
    { arquivo: 'lectura.js', lang: 'pt' },
    { arquivo: 'lectura.es.js', lang: 'es' },
    { arquivo: 'lectura.en.js', lang: 'en' },
  ];
}

test('nenhuma tabela do MOTOR DE LEITURA promete desfecho, em nenhum dos tres idiomas', async () => {
  const achados = [];
  const varridos = [];

  for (const { arquivo, lang } of arquivosDeCopyEmLib()) {
    /* import() e nao readFileSync, pelo motivo do bloco 5: queremos os VALORES
     * finais e nao o texto-fonte. lib/lectura.js cita frase proibida nos
     * comentarios de proposito (e a documentacao das guardas), e uma varredura
     * de fonte acusaria a propria explicacao da regra. */
    const modulo = await import(`file://${join(LIB, arquivo).replace(/\\/g, '/')}`);
    /* So as tabelas de copy. O resto do modulo e motor: PATRONES_CONTACTO e
     * PATRONES_FUTURO sao LISTAS DE REGEX cujo proprio conteudo e a frase
     * proibida — varre-las seria acusar a rede de pescar peixe. */
    for (const nome of ['TABLAS', 'ALTERNATIVAS', 'SALUDO_SIN_NOMBRE', 'SOBRE_LA_MESA']) {
      if (modulo[nome] === undefined) continue;
      andar(modulo[nome], nome, (campo, texto) => {
        for (const v of violacoesDe(texto, lang)) {
          achados.push({ lang, arquivo: `madremaria/lib/${arquivo}`, campo, texto, ...v });
        }
      }, new WeakSet());
    }
    varridos.push(`${arquivo} (${lang})`);
  }

  assert.equal(achados.length, 0, relatorio(achados, 'A COPY DO MOTOR DE LEITURA PROMETENDO DESFECHO.'));

  assert.equal(
    varridos.length,
    3,
    `esperados 3 arquivos de copy em lib/, varridos ${varridos.length}: ${varridos.join(', ')}`
  );
});

test('a varredura de lib/ tem mesmo o que ler, e classifica o idioma pelo nome', async () => {
  /* Sem este piso o teste de cima ficaria verde por varrer ZERO string — o jeito
   * mais facil de um portao virar decoracao. */
  let lidas = 0;
  for (const { arquivo } of arquivosDeCopyEmLib()) {
    const modulo = await import(`file://${join(LIB, arquivo).replace(/\\/g, '/')}`);
    for (const nome of ['TABLAS', 'ALTERNATIVAS', 'SALUDO_SIN_NOMBRE']) {
      if (modulo[nome] === undefined) continue;
      andar(modulo[nome], nome, () => { lidas += 1; }, new WeakSet());
    }
  }
  assert.ok(lidas > 200, `so ${lidas} textos do motor lidos — eram 76 por idioma, 228 nos tres`);

  const classificar = (f) => {
    const m = f.match(/^(.+?)\.(es|en)\.js$/);
    return m ? m[2] : 'pt';
  };
  assert.equal(classificar('lectura.js'), 'pt');
  assert.equal(classificar('lectura.es.js'), 'es');
  assert.equal(classificar('lectura.en.js'), 'en');
});

/* =====================================================================
 * 6 · A COBERTURA E AUTOMATICA — quem cria o vizinho .es.js/.en.js nao
 *     precisa vir aqui
 * =====================================================================
 * Este teste existe para que o bloco 5 nao possa virar decoracao por omissao:
 * ele prova que a descoberta pelo disco REALMENTE classifica os idiomas pelo
 * nome, e que um arquivo novo entra varrido sem edicao aqui. */

test('a descoberta pelo disco classifica o idioma pelo nome do arquivo', () => {
  const lidos = arquivosDeConteudo();

  // O PT de hoje esta todo coberto — a lista medida campo a campo da Onda 2.
  const pt = lidos.filter((a) => a.lang === 'pt').map((a) => a.arquivo);
  for (const esperado of [
    'missoes365.js', 'lenormand.js', 'bancos.js', 'lecturas.js', 'lunacoes.js',
    'hechos.js', 'rituais.js', 'ritual.js', 'fases.js', 'preguntas.js',
    'profunda.js', 'sinastria.js', 'plano.js',
  ]) {
    assert.ok(pt.includes(esperado), `${esperado} nao esta sendo varrido`);
  }

  // E o dicionario de tela NAO entra aqui (ele e varrido no bloco 4, com a
  // chave como caminho, que da mensagem de erro melhor).
  assert.ok(
    !lidos.some((a) => a.arquivo.startsWith('textos')),
    'textos*.js vazou para a varredura de conteudo'
  );

  // A classificacao por nome, provada na mao: e o que fara missoes365.es.js
  // nascer varrido com a lista espanhola sem ninguem editar este arquivo.
  const classificar = (f) => {
    const m = f.match(/^(.+?)\.(es|en)\.js$/);
    return m ? m[2] : 'pt';
  };
  assert.equal(classificar('missoes365.js'), 'pt');
  assert.equal(classificar('missoes365.es.js'), 'es');
  assert.equal(classificar('missoes365.en.js'), 'en');
  assert.equal(classificar('lenormand.en.js'), 'en');
  assert.equal(classificar('bancos.es.js'), 'es');
});

/* =====================================================================
 * 7 · PROVA POR MUTACAO — a varredura MORDE nos tres idiomas
 * =====================================================================
 * Sem este bloco, uma regex quebrada deixaria tudo verde para sempre. */

test('MUTACAO: promessa plantada e pega nos tres idiomas', () => {
  const plantadas = [
    // PT
    ['pt', 'Ela vai voltar e voce vai sentir.'],
    ['pt', 'Essa pessoa voltará antes da próxima lua.'],
    ['pt', 'Ele vai te procurar nesta semana.'],
    ['pt', 'Resultado garantido: em 30 dias ele volta.'],
    ['pt', 'Reconquiste em 21 dias, sem falha.'],
    ['pt', 'Este gesto traz ele de volta pra sua vida.'],
    ['pt', 'Com certeza volta, é só questão de tempo.'],
    ['pt', 'O destino vai trazer essa pessoa de novo.'],
    /* A ARMADILHA DO `\b` (bloco 1-bis), plantada NA GRAFIA ACENTUADA — que e a
     * grafia que a copy real usa. Antes da Onda 3 estas nove linhas PASSAVAM
     * pelo portao: `\b` depois de `ê`/`ç`/`á` nunca casa, porque para o motor do
     * JS eles nao sao caractere de palavra. Era o buraco mais perigoso do
     * arquivo, porque a formula LIA certo e a versao SEM acento era pega — quem
     * testasse com "volta para voce" veria o portao morder e iria dormir em paz.
     *
     * Se uma destas voltar a passar, alguem reescreveu uma formula com `\b`.
     * (P() hoje recusa `\b` e estoura; o bloco 7-ter e a outra metade da trava.) */
    ['pt', 'Ele vai voltar para você.'],
    ['pt', 'Essa pessoa volta para você quando entender.'],
    ['pt', 'Este gesto traz ele de volta pros seus braços.'],
    ['pt', 'Ela volta pra você, é questão de tempo.'],
    ['pt', 'Com certeza dá, pode confiar.'],
    ['pt', 'O destino trará essa pessoa de volta.'],
    ['es', 'Él va a llamarte el viernes.'],
    ['es', 'Él te buscará antes de la luna.'],
    ['es', 'Seguro que volverá, ya lo verás.'],
    ['es', 'El destino lo traerá de nuevo.'],
    /* A RECUSA NAO E UM PASSE LIVRE. "nao" solto no comeco da frase nao absolve:
     * so o VERBO DE DIZER negado absolve. Sem estes tres casos, a lista RECUSA
     * viraria o buraco novo — bastaria escrever "nao se preocupe" antes da
     * promessa para passar por este portao. */
    ['pt', 'Não se preocupe: ela vai voltar.'],
    ['es', 'No te preocupes: va a volver.'],
    ['en', 'Do not worry, they will come back.'],
    // ES
    ['es', 'Esa persona volverá antes de la próxima luna.'],
    ['es', 'Va a volver, ya lo verás.'],
    ['es', 'Vuelve a ti en cuanto cierres el nudo.'],
    ['es', 'Lo recuperarás con este gesto.'],
    ['es', 'Recupera a tu ex en 21 días, garantizado.'],
    ['es', 'Te va a escribir esta semana.'],
    ['es', 'Seguro que vuelve: el destino lo traerá.'],
    ['es', 'Ella va a llamarte el viernes.'],
    // EN
    ['en', 'They will come back before the next moon.'],
    ['en', 'That person is coming back to you.'],
    ['en', 'Get them back with this one gesture.'],
    ['en', 'Win them back in 21 days, guaranteed.'],
    ['en', 'She will text you this week.'],
    ['en', 'He is destined to return.'],
    ['en', 'This never fails and works every time.'],
    ['en', 'Your comeback in 30 days.'],
  ];

  const cegas = plantadas.filter(([lang, texto]) => violacoesDe(texto, lang).length === 0);
  assert.deepEqual(
    cegas.map(([l, t]) => `[${l}] ${t}`),
    [],
    'A varredura deixou passar promessa plantada. Portao cego e PIOR que portao '
      + 'nenhum: da a sensacao de que ha guarda.'
  );
});

/* =====================================================================
 * 7-bis · A MUTACAO AO CONTRARIO — a copy HONESTA tem de passar
 * =====================================================================
 * Esta e a trava que impede o proximo agente de afrouxar o portao inteiro.
 * "Sua reconquista comeca aqui" e o titulo aprovado pelo dono — se este teste
 * ficar vermelho, a formula ficou larga e o conserto e REFINAR A FORMULA
 * nomeada na falha, nunca remover o caso daqui. */

test('MUTACAO AO CONTRARIO: a copy honesta do produto NAO e acusada', () => {
  const honestas = [
    // O titulo aprovado e seus irmaos — a PALAVRA do nicho passa.
    ['pt', 'Sua reconquista começa aqui'],
    ['pt', 'A reconquista não é dela: é sua.'],
    ['pt', 'Esta carta mostra onde a conversa se enroscou. Hoje, escreva uma linha sobre o que você sentiu.'],
    ['pt', 'O gesto de hoje é seu. O que a outra pessoa faz não está nas suas mãos.'],
    ['pt', 'Volte para o seu corpo: respire três vezes antes de abrir o celular.'],
    ['pt', 'Um passo atrás e você vê o nó inteiro.'],
    ['pt', 'Em sete dias você terá escrito sete linhas sobre si mesma.'],
    ['es', 'Tu reconquista empieza aquí'],
    ['es', 'La reconquista no es de esa persona: es tuya.'],
    ['es', 'Esta carta muestra dónde se enredó. Hoy, escribe una línea sobre lo que sentiste.'],
    ['es', 'Vuelve a tu cuerpo: respira tres veces antes de abrir el teléfono.'],
    ['es', 'El Rey de Copas habla de lo que ya fue nombrado.'],
    ['es', 'Lo que hace esa persona no está en tus manos.'],
    ['en', 'Your comeback starts here'],
    ['en', 'The comeback is not theirs: it is yours.'],
    ['en', 'This card shows where it got tangled. Today, write one line about what you felt.'],
    ['en', 'Come back to your body: breathe three times before opening your phone.'],
    ['en', 'What that person does is not in your hands.'],
    /* A RECUSA — a copy mais honesta do app, e o que este portao acusou na
     * primeira rodada. E a doutrina dita em voz alta, medida em
     * madremaria/datos/profunda.js:102 e :438. Se um destes ficar vermelho,
     * alguem estreitou a lista RECUSA e reprovou a propria declaracao da regra. */
    ['pt', 'Eu não vou te dizer que essa pessoa vai voltar. Ninguém pode te dizer isso, e quem diz está inventando.'],
    ['pt', 'Eu não vou te dizer que essa pessoa vai atravessar essa montanha na sua direção. Ninguém pode te dizer isso. Quem diz está inventando.'],
    ['pt', 'Ninguém pode te garantir que ele volta. Não existe como prever isso.'],
    ['es', 'No voy a decirte que esa persona volverá. Nadie puede decirte eso, y quien lo dice está inventando.'],
    ['es', 'Nadie puede garantizar que vuelve. No hay forma de saberlo.'],
    ['en', 'I will not tell you that they will come back. No one can tell you that, and whoever says that is making it up.'],
    ['en', 'Nobody can promise they will text you. There is no way of knowing.'],
    /* O pronome que NAO e a outra pessoa — datos/frases.js:83, medido. "ela" e a
     * imaginacao da frase anterior, e "a mesa" e o almoco de quem le. */
    ['pt', 'Preocupação é imaginação apontada pro lugar errado. Traga ela de volta pra mesa.'],
    /* O MECANISMO DO DIA 7 — o sujeito que volta e A LINHA QUE ELA ESCREVEU.
     * Medido em ritual.js:130, textos.js:998 e nos vizinhos ES/EN que a Onda 2 ja
     * reescreveu para nomear o sujeito. Ver o bloco 3-ter; o 7-quater prova as
     * duas direcoes do filtro. */
    ['pt', 'No sétimo dia esta mesma linha volta para você com a data de hoje ao lado.'],
    ['pt', 'É esta linha que volta no sétimo dia.'],
    ['es', 'Es esta línea la que vuelve el séptimo día.'],
    ['en', 'Kept with today’s date. This is the line that comes back on the seventh day.'],
    // Citacao bibliografica real — nenhuma formula pode morder um titulo de livro.
    ['en', 'Telling Fortunes by Tea Leaves'],
    ['en', 'A Manual of Cheirosophy'],
    ['en', 'A. E. Waite, The Pictorial Key to the Tarot'],
  ];

  const acusadas = honestas
    .map(([lang, texto]) => [lang, texto, violacoesDe(texto, lang)])
    .filter((par) => par[2].length > 0);

  assert.deepEqual(
    acusadas.map(([l, t, v]) => `[${l}] "${t}" -> ${v.map((x) => x.diz).join(' | ')}`),
    [],
    'FALSO POSITIVO. A formula ficou larga e acusou copy honesta — possivelmente '
      + 'o proprio titulo aprovado pelo dono. O conserto e ESTREITAR a formula '
      + 'nomeada acima, nunca remover o caso desta lista nem afrouxar o portao.'
  );
});

/* =====================================================================
 * 7-ter · A TRAVA DA ARMADILHA DO ACENTO — mecanica, nao escrita a mao
 * =====================================================================
 * Os blocos 7 e 7-bis sao listas escritas a mao: provam as frases que alguem
 * pensou em escrever. A armadilha do `\b` (bloco 1-bis) escapou deles por nove
 * formulas porque ninguem pensou em plantar a versao ACENTUADA — e e justamente
 * a versao acentuada que a copy real usa.
 *
 * Este bloco nao depende de ninguem pensar. Ele pega CADA formula das tres
 * listas, expande o proprio padrao nas suas variantes literais (alternancias e
 * classes de caractere) e exige que a formula CASE A PROPRIA EXPANSAO. Uma
 * formula que nao casa o texto que ela mesma descreve esta cega — e foi
 * exatamente esse o defeito: /voc[eê]\b/ descreve "você" e nao casava "você".
 *
 * Por que isso impede a armadilha de voltar em QUALQUER idioma: a expansao gera
 * as duas grafias de cada classe ([eê] da 'e' e 'ê', [cç] da 'c' e 'ç', [aá] da
 * 'a' e 'á'), e a forma acentuada so casa se a fronteira estiver correta. O
 * construtor P() ja recusa `\b` estourando; este bloco pega o caso em que alguem
 * escreve a fronteira errada na mao, sem usar `\b`. As duas travas juntas
 * fecham o buraco. */

/** Expande o miolo de um padrao nas suas variantes literais.
 *  Resolve alternancia `(?:a|b)`, classe `[eê]`, `?` opcional e os atalhos de
 *  espaco; devolve null quando o padrao nao e expansivel (curinga, lookahead,
 *  quantificador largo) — esses ficam fora da prova, e sao poucos. */
function expandir(corpo) {
  if (/\\[pdwSPW]|\[\^|\{|\(\?[=!]/.test(corpo)) return null;   // nao expansivel
  let c = corpo.replace(/\\s\+/g, ' ').replace(/\\s\*/g, ' ').replace(/\\s/g, ' ');
  let saidas = [''];
  let i = 0;
  while (i < c.length) {
    if (saidas.length > 4000) return null;
    if (c.startsWith('(?:', i)) {
      let d = 0;
      let j = i;
      for (; j < c.length; j++) {
        if (c[j] === '(') d += 1;
        else if (c[j] === ')') { d -= 1; if (d === 0) break; }
      }
      const dentro = c.slice(i + 3, j);
      let depois = j + 1;
      let opcional = false;
      if (c[depois] === '?') { opcional = true; depois += 1; }
      else if (c[depois] === '+' || c[depois] === '*') return null;
      const alts = [];
      let prof = 0;
      let ini = 0;
      for (let k = 0; k < dentro.length; k += 1) {
        if (dentro[k] === '(') prof += 1;
        else if (dentro[k] === ')') prof -= 1;
        else if (dentro[k] === '[') { while (k < dentro.length && dentro[k] !== ']') k += 1; }
        else if (dentro[k] === '|' && prof === 0) { alts.push(dentro.slice(ini, k)); ini = k + 1; }
      }
      alts.push(dentro.slice(ini));
      const sub = [];
      for (const a of alts) {
        const e = expandir(a);
        if (e === null) return null;
        sub.push(...e);
      }
      if (opcional) sub.push('');
      const nova = [];
      for (const s of saidas) for (const t of sub) nova.push(s + t);
      saidas = nova;
      i = depois;
      continue;
    }
    if (c[i] === '[') {
      let j = i + 1;
      while (j < c.length && c[j] !== ']') j += 1;
      const cls = c.slice(i + 1, j);
      let depois = j + 1;
      let opcional = false;
      if (c[depois] === '?') { opcional = true; depois += 1; }
      else if (c[depois] === '+' || c[depois] === '*') return null;
      const chars = [];
      for (let k = 0; k < cls.length; k += 1) {
        if (cls[k + 1] === '-' && cls[k + 2]) {
          for (let cc = cls.charCodeAt(k); cc <= cls.charCodeAt(k + 2); cc += 1) {
            chars.push(String.fromCharCode(cc));
          }
          k += 2;
        } else chars.push(cls[k]);
      }
      const nova = [];
      for (const s of saidas) for (const t of chars) nova.push(s + t);
      if (opcional) nova.push(...saidas);
      saidas = nova;
      i = depois;
      continue;
    }
    const ch = c[i];
    const prox = c[i + 1];
    if (prox === '?') {
      const nova = [];
      for (const s of saidas) { nova.push(s + ch); nova.push(s); }
      saidas = nova;
      i += 2;
      continue;
    }
    if (prox === '+' || prox === '*') return null;
    saidas = saidas.map((s) => s + ch);
    i += 1;
  }
  return saidas;
}

test('MUTACAO: toda formula casa a PROPRIA grafia acentuada (a armadilha do \\b)', () => {
  const cegas = [];
  let provadas = 0;
  let foraDaProva = 0;
  let comAcento = 0;

  for (const lang of ['pt', 'es', 'en']) {
    for (const { re, diz, corpo, aberta } of FORMULAS[lang]) {
      const exp = expandir(corpo);
      if (exp === null) { foraDaProva += 1; continue; }
      for (const variante of exp) {
        provadas += 1;
        if (/[À-ɏ]/.test(variante)) comAcento += 1;
        /* (1) FALSO NEGATIVO — o defeito do `\b`. Testa a variante SOZINHA e
         * EMBUTIDA numa frase: embutida prova a fronteira ESQUERDA; sozinha
         * prova a DIREITA (fim de cadeia). */
        if (!re.test(variante) || !re.test(`e ${variante} hoje`)) {
          cegas.push(`[${lang}] "${variante}"  nao casa a formula que o descreve: ${diz}`);
        }
        /* (2) FALSO POSITIVO — o defeito OPOSTO, e ele e real: uma fronteira
         * escrita com classe ASCII ([^A-Za-z0-9_]) conserta o falso negativo e
         * abre um falso positivo, porque passa a tratar 'á'/'ç'/'ñ' como
         * NAO-letra e aceita fronteira no MEIO de uma palavra acentuada.
         * Medido: com a fronteira ASCII, /volta para ti/ casa "volta para tiá" e
         * "çvolta para ti". Sem esta metade, trocar \p{L} por A-Za-z passava
         * verde — foi o que a mutacao desta onda pegou.
         *
         * Entao: colada numa letra ACENTUADA, a variante NAO pode casar.
         *
         * A fronteira ESQUERDA vale para TODA formula. A DIREITA so para as
         * fechadas: P_ABERTA nao tem fronteira direita de proposito (o padrao
         * segue num curinga ou num lookahead proprio), e exigi-la ali mataria o
         * padrao. Marcadas com `aberta` no construtor. */
        /* A fronteira ESQUERDA: grudar o acento e exigir que, se houver casamento,
         * ele NAO comece no acento grudado. Nao basta `!re.test('á'+v)`: a
         * formula pode casar legitimamente um trecho MAIS A DIREITA (alguma
         * alternativa interna que comeca no meio, como "vai" dentro de
         * "voce vai reconquistar"), e isso nao e defeito de fronteira. */
        for (const acento of ['á', 'ç']) {
          const m = re.exec(`${acento}${variante}`);
          if (m && m.index === 0) {
            cegas.push(
              `[${lang}] "${variante}"  casa colada a letra ACENTUADA A ESQUERDA `
              + `(fronteira ASCII?) na formula: ${diz}`
            );
          }
        }
        if (!aberta && (re.test(`${variante}á`) || re.test(`${variante}ñ`))) {
          cegas.push(
            `[${lang}] "${variante}"  casa colada a letra ACENTUADA A DIREITA `
            + `(fronteira ASCII?) na formula: ${diz}`
          );
        }
      }
    }
  }

  assert.deepEqual(
    cegas,
    [],
    'FORMULA CEGA PARA A PROPRIA GRAFIA. Quase sempre e a armadilha do bloco '
      + '1-bis: `\\b` (ou uma fronteira escrita a mao com [A-Za-z...]) encostado '
      + 'em letra acentuada NUNCA casa, porque em JS `ê`/`ç`/`á`/`ñ` nao sao '
      + 'caractere de palavra. Use P()/P_ABERTA e escreva so o miolo; a fronteira '
      + 'correta (\\p{L} com a flag u) e montada no bloco 1-bis.'
  );

  // A prova tem de ter tido o que provar, e tem de ter visto acento — senao ela
  // passaria por vacuidade e a armadilha voltaria sem ninguem notar.
  assert.ok(provadas > 2000, `so ${provadas} variantes provadas`);
  assert.ok(comAcento > 100, `so ${comAcento} variantes ACENTUADAS provadas`);
  // E as formulas nao expansiveis (curinga, prazo, porcentagem) sao poucas: se
  // esse numero crescer muito, a prova esta virando decoracao.
  assert.ok(foraDaProva <= 18, `${foraDaProva} formulas fora da prova — demais`);
});

/* =====================================================================
 * 7-quater · O SUJEITO — as duas direcoes do filtro do bloco 3-ter
 * =====================================================================
 * O filtro de artefato e uma ABERTURA no portao, e toda abertura tem de ser
 * medida nos dois sentidos: ele tem de deixar passar a copy do mecanismo E tem
 * de continuar morchendo a promessa. Sem a segunda metade, "nomeie a linha em
 * qualquer lugar da frase e prometa o que quiser" seria o buraco novo. */

test('MUTACAO: o filtro de sujeito abre para o artefato e NAO abre para a promessa', () => {
  // Passa: o sujeito que volta e o que ELA escreveu.
  const mecanismo = [
    ['pt', 'No sétimo dia esta mesma linha volta para você com a data de hoje ao lado.'],
    ['pt', 'O "fio de ontem" é o que o app cita de volta pra você no próximo dia vivido.'],
    ['es', 'El séptimo día este aparato te devuelve esta misma línea, con la fecha de hoy al lado.'],
    ['es', 'Es esta línea la que vuelve el séptimo día.'],
    ['en', 'On the seventh day this device hands this same line back to you, with today’s date beside it.'],
    ['en', 'This is the line that comes back to you on the seventh day.'],
  ];
  const acusadas = mecanismo
    .map(([lang, t]) => [lang, t, violacoesDe(t, lang)])
    .filter((p) => p[2].length > 0);
  assert.deepEqual(
    acusadas.map(([l, t, v]) => `[${l}] "${t}" -> ${v.map((x) => x.diz).join(' | ')}`),
    [],
    'O filtro de sujeito (bloco 3-ter) nao reconheceu o artefato. O sujeito que '
      + 'volta aqui e a LINHA QUE ELA ESCREVEU, devolvida pelo aparelho no dia 7 — '
      + 'e o mecanismo do produto, nao um desfecho sobre a outra pessoa.'
  );

  // NAO passa: nomear a linha nao absolve uma promessa sobre a outra pessoa, nem
  // um selo de garantia, nem um prazo. O filtro desarma SO as formulas de "algo
  // voltando", e so elas.
  const aindaPromessa = [
    ['pt', 'Escreva a linha e ela vai voltar antes da lua cheia.'],
    ['pt', 'A linha fica no aparelho e ele vai te procurar nesta semana.'],
    ['pt', 'Guarde o texto: em 7 dias ela volta, garantido.'],
    ['pt', 'Deixe a linha aqui e essa pessoa voltará.'],
    ['es', 'Escribe la línea y él te buscará esta semana.'],
    ['es', 'Guarda el texto en el aparato: va a volver.'],
    ['en', 'Write the line on this device and they will come back.'],
    ['en', 'Keep the text and win them back in 21 days, guaranteed.'],
  ];
  const escaparam = aindaPromessa.filter(([lang, t]) => violacoesDe(t, lang).length === 0);
  assert.deepEqual(
    escaparam.map(([l, t]) => `[${l}] ${t}`),
    [],
    'O filtro de sujeito virou PASSE LIVRE: bastou nomear a linha/o app para '
      + 'prometer o que quiser. Ele tem de desarmar SO as formulas de "algo '
      + 'voltando" (FORMULA_DEPENDE_DO_SUJEITO), nunca garantia, prazo, nem a '
      + 'outra pessoa agindo.'
  );
});

/* =====================================================================
 * 7-quinquies · AS EXCECOES EXPIRAM SOZINHAS
 * =====================================================================
 * Uma excecao nomeada e divida tecnica. Esta prova e o juros: cada entrada de
 * EXCECOES tem de (a) ainda casar a formula que a justificou — senao ela nao
 * protege mais nada e esta so enfraquecendo o portao — e (b) ainda existir na
 * copy do arquivo que ela cita. Quando a copy for corrigida (a saida proposta no
 * bloco 3-ter), esta prova falha e manda apagar a excecao. */

test('cada excecao nomeada ainda e necessaria — e a lista e pequena', () => {
  assert.ok(
    EXCECOES.length <= 3,
    `${EXCECOES.length} excecoes nomeadas. A lista tem de ser pequena e auditavel: `
      + 'se ela cresce, a formula e que tem de ser estreitada.'
  );

  for (const e of EXCECOES) {
    // (a) a frase ainda casa a formula nomeada — se nao casa, a excecao e letra
    //     morta e tem de sair.
    const formula = FORMULAS[e.lang].find((f) => f.diz === e.formula);
    assert.ok(formula, `excecao de ${e.arquivo} cita formula inexistente: "${e.formula}"`);
    assert.ok(
      formula.re.test(e.frase),
      `A excecao de ${e.arquivo} nao casa mais a formula "${e.formula}". Ela nao `
        + 'protege nada e tem de ser APAGADA do bloco 3-quater.'
    );
    // (b) e, com a excecao valendo, a frase passa.
    assert.equal(
      violacoesDe(e.frase, e.lang).length,
      0,
      `A excecao de ${e.arquivo} nao esta surtindo efeito na varredura.`
    );
    /* (c) a excecao tem de ser LOAD-BEARING: nem a RECUSA nem o filtro de
     *     artefato podem ja estar absolvendo esta frase. Se um deles estiver, a
     *     excecao e redundante e tem de sair — excecao redundante e a que ninguem
     *     revisa, e fica la absolvendo copy nova por acidente. */
    assert.ok(
      !ehRecusa(e.frase, e.lang),
      `A excecao de ${e.arquivo} e REDUNDANTE: a RECUSA ja absolve esta frase.`
    );
    assert.ok(
      !falaDoArtefato(e.frase, e.lang),
      `A excecao de ${e.arquivo} e REDUNDANTE: o filtro de artefato (bloco 3-ter) `
        + 'ja absolve esta frase. Apague a excecao.'
    );
  }
});

/* =====================================================================
 * 7-sexies · O 'THEY' DO INGLES — as duas direcoes do estreitamento
 * =====================================================================
 * ACHADO DA ONDA QUE ESTENDEU O PORTAO AO APP INTEIRO. Quando o motor passou a
 * varrer lib/i18n.js (7443 chaves nos tres idiomas), ele acusou exatamente DUAS
 * linhas, e as duas eram falso positivo do MESMO defeito:
 *
 *   lib/i18n.js  agir.gesture.g5
 *     "Leave a sweet little note where THEY'LL find it."     ('they' = o bilhete)
 *   lib/i18n.js  planos.store.soonText
 *     "When subscriptions open inside the app, THEY'LL show up on this screen."
 *                                                       ('they' = as assinaturas)
 *
 * Em ingles 'they' e ao mesmo tempo o pronome da outra pessoa e o plural
 * generico de COISA — a mesma ambiguidade que ja tinha tirado 'el' sem til da
 * lista espanhola (bloco 1 do scanner) e o substantivo nu 'guarantee' da
 * inglesa. E, como naquelas duas vezes, a assimetria e de IDIOMA e nao de
 * doutrina: os irmaos PT e ES das duas chaves passam limpos.
 *
 * O conserto foi ESTREITAR a formula ('they' so conta com verbo de relacao ou
 * falando com a usuaria), nunca afrouxar o portao nem abrir excecao nomeada
 * para as duas chaves — excecao ali teria calado o sintoma e deixado a proxima
 * frase com 'they' nascer acusada.
 *
 * Este bloco trava as DUAS direcoes, que e o que impede o estreitamento de
 * virar buraco: a coisa passa, a pessoa nao. Se alguem alargar de novo 'they'
 * para o miolo solto, a primeira metade fica vermelha; se alguem tirar 'they'
 * da lista para calar a primeira, a segunda fica vermelha. */

test('MUTACAO: o "they" do ingles passa quando e COISA e morde quando e PESSOA', () => {
  // PASSA: 'they' e uma coisa — o bilhete, a assinatura, a carta, a anotacao.
  // As duas primeiras sao copy REAL de lib/i18n.js, citada pela chave.
  const coisa = [
    "Leave a sweet little note where they'll find it.",              // agir.gesture.g5
    "When subscriptions open inside the app, they'll show up on this screen.", // planos.store.soonText
    'The cards are shuffled; they will be revealed one by one.',
    'When the doors open, they will close again at midnight.',
    'Your notes are saved; they will stay here.',
  ];
  const acusadas = coisa
    .map((t) => [t, violacoesDe(t, 'en')])
    .filter((p) => p[1].length > 0);
  assert.deepEqual(
    acusadas.map(([t, v]) => `"${t}" -> ${v.map((x) => x.diz).join(' | ')}`),
    [],
    'O "they" voltou a acusar COISA. As duas primeiras frases sao copy real do '
      + 'app (lib/i18n.js, chaves agir.gesture.g5 e planos.store.soonText): um '
      + 'bilhete nao te procura e uma assinatura nao sente sua falta. O conserto e '
      + 'ESTREITAR a formula de sujeito do ingles, nunca abrir excecao para a chave.'
  );

  // MORDE: 'they' e a outra pessoa — verbo de relacao, ou falando com quem le.
  const pessoa = [
    'They will come back before the next moon.',
    'They will text you this week.',
    "They'll reach out when the moon turns.",
    'They will forgive you.',
    "They'll miss you soon.",
    "They'll return to you.",
    'They will be back in three days.',
    // e os pronomes INEQUIVOCOS continuam soltos, sem condicao nenhuma
    'He will come back.',
    "She'll text you.",
    'That person will decide.',
  ];
  const escaparam = pessoa.filter((t) => violacoesDe(t, 'en').length === 0);
  assert.deepEqual(
    escaparam,
    [],
    'O estreitamento do "they" virou BURACO: promessa sobre a outra pessoa passou. '
      + 'A condicao vale SO para "they" (que em ingles tambem nomeia coisa) — "he", '
      + '"she" e "that person" continuam soltos, e o verbo de relacao ou o "you" '
      + 'adiante e o que distingue gente de bilhete.'
  );
});

/* =====================================================================
 * 7-septies · O TITULO QUE O DONO RECUSOU — o caso fundador
 * =====================================================================
 * "Traga seu amor de volta" e a frase que fez esta doutrina existir neste
 * projeto: um revisor apontou que ela promete o que uma TERCEIRA pessoa vai
 * fazer, e o dono a trocou por "Sua reconquista comeca aqui" — o titulo que o
 * bloco 7-bis protege desde entao.
 *
 * E ate esta onda o portao NAO a pegava. Achado conferindo, uma por uma, as
 * frases de docs/LINHA-DA-PERSUASAO.md contra a varredura: a formula de "traga"
 * exigia objeto NOMEADO (para nao acusar "traga ela de volta pra mesa", de
 * datos/frases.js:83) e a lista de nomes tinha so 'essa pessoa' e as quatro
 * formas de 'ex'. "seu amor" nao estava la. Nem "your love" na lista inglesa,
 * nem o verbo TRAER na espanhola.
 *
 * Ou seja: o portao guardava a copy honesta que nasceu da decisao do dono, e
 * deixava passar a frase que motivou a decisao. E o tipo de buraco que so
 * aparece quando alguem escreve o exemplo e o RODA — por isso o guia e
 * verificado, e nao so escrito.
 *
 * Este bloco trava as tres linguas nos dois sentidos. A segunda metade e a que
 * importa mais: os nomes que entraram sao todos GENTE, e nenhum pode reabrir o
 * falso positivo de frases.js:83, que depende de o objeto ser COISA. */

test('MUTACAO: "traga seu amor de volta" e seus irmaos ES/EN sao pegos', () => {
  const promessas = [
    ['pt', 'Traga seu amor de volta.'],
    ['pt', 'Traga seu amor de volta para você.'],
    ['pt', 'Vou trazer sua pessoa de volta.'],
    ['pt', 'Traga seu namorado de volta.'],
    ['es', 'Trae a tu amor de vuelta.'],
    ['es', 'Recupera a tu amor.'],
    ['es', 'Voy a traer a esa persona de vuelta.'],
    ['en', 'Bring your love back.'],
    ['en', 'Get your love back.'],
    ['en', 'Win your love back.'],
    ['en', 'Bring your partner back.'],
  ];
  const escaparam = promessas.filter(([lang, t]) => violacoesDe(t, lang).length === 0);
  assert.deepEqual(
    escaparam.map(([l, t]) => `[${l}] ${t}`),
    [],
    'O CASO FUNDADOR ESCAPOU. "Traga seu amor de volta" e a frase que o dono '
      + 'recusou por prometer o que uma terceira pessoa vai fazer. Se ela passa, o '
      + 'portao esta guardando a copy honesta e deixando entrar a que a motivou. '
      + 'O objeto da formula de "traga"/"bring"/"traer" tem de nomear GENTE — '
      + 'confira ALVO_EN e a lista PT em test/promessa-scanner.js.'
  );

  /* E o falso positivo que a exigencia de objeto nomeado existe para evitar
   * continua evitado: aqui o objeto e COISA, e nenhuma das listas novas o
   * alcanca. A primeira e copy real de madremaria/datos/frases.js:83. */
  const coisas = [
    ['pt', 'Preocupação é imaginação apontada pro lugar errado. Traga ela de volta pra mesa.'],
    ['pt', 'Traga o foco de volta para a respiração.'],
    ['pt', 'Traga sua atenção de volta ao corpo.'],
    ['es', 'Trae la atención de vuelta al cuerpo.'],
    ['en', 'Bring your attention back to your breath.'],
    ['en', 'Bring the focus back to the page.'],
  ];
  const acusadas = coisas
    .map(([lang, t]) => [lang, t, violacoesDe(t, lang)])
    .filter((p) => p[2].length > 0);
  assert.deepEqual(
    acusadas.map(([l, t, v]) => `[${l}] "${t}" -> ${v.map((x) => x.diz).join(' | ')}`),
    [],
    'A lista de objeto nomeado ficou larga e voltou a acusar COISA. A primeira '
      + 'frase e copy real (madremaria/datos/frases.js:83), onde "ela" e a '
      + 'IMAGINACAO da frase anterior. So entra na lista nome que so pode ser '
      + 'GENTE — nunca um pronome solto, nunca "o foco", nunca "a atencao".'
  );
});
