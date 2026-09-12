// test/copy-promessa-app-inteiro.test.js
//
// O PORTAO DA DOUTRINA SOBRE O APP INTEIRO — lib/i18n.js, PT/ES/EN.
//
// ===========================================================================
// O BURACO QUE ESTE ARQUIVO FECHA
// ===========================================================================
// test/madremaria-promessa-tres-idiomas.test.js vigia a Madre Maria: os
// dicionarios de tela dela, madremaria/datos/*.js e as tabelas do motor de
// leitura. E um portao bom, e ate esta onda era o UNICO lugar do repo onde a
// regra existia em codigo executavel.
//
// So que a Madre Maria e uma parte do Cosmic Guide, e nao a maior. Medido:
//
//     lib/i18n.js     2481 chaves POR IDIOMA, 7443 nos tres
//                     ~140 mil caracteres de copy por idioma
//
// Sao a Home, o Onboarding, o Quiz, o Login, o Horoscopo, o Mapa Astral, Agir,
// Descobrir, Reconectar, a Linha do Tempo, o Diario, a Assinatura, a Loja, os
// Tokens, o Perfil, a Comunidade. E a superficie que o revisor da Play Store
// abre PRIMEIRO — a ficha da loja e as telas iniciais —, e ela nao tinha guarda
// nenhuma contra promessa de desfecho.
//
// A politica que reprova nao e a doutrina da Madre: e Misrepresentation, do
// Google, que pega AFIRMACAO DE EFICACIA — o app dizendo que produz resultado
// real no mundo. Ela se aplica a tela de Horoscopo igual a de tarot. Entao a
// regra que ja estava escrita para a Madre passa a valer para o app inteiro.
//
// ===========================================================================
// POR QUE ISTO NAO E UMA SEGUNDA LISTA DE PADROES
// ===========================================================================
// A tentacao obvia era copiar as ~70 formulas para ca. Seria o erro: duas
// listas divergem no primeiro conserto, e o conserto de uma nao chega na outra
// — e o jeito mais silencioso de um portao virar decoracao.
//
// Entao o motor saiu de dentro do teste da Madre e virou test/promessa-scanner.js.
// Os dois portoes chamam o MESMO violacoesDe(). Uma formula estreitada por causa
// de um falso positivo aqui vale para a Madre no mesmo commit, e vice-versa.
//
// A PROVA POR MUTACAO do motor continua no arquivo da Madre (blocos 7 a
// 7-sexies), porque ela prova as FORMULAS e nao a superficie. Este arquivo tem a
// sua propria prova por mutacao, e ela e de outra natureza: prova que a
// varredura esta REALMENTE ligada em lib/i18n.js — que plantar promessa numa
// chave real derruba ESTE teste. Ver o bloco 3.
//
// ===========================================================================
// O QUE ESTE PORTAO **NAO** DECIDE
// ===========================================================================
// Ele nao julga se a copy e boa, emocional ou persuasiva. A linha do que PODE —
// pergunta que abre desejo, jornada, o comeco dela, nomear o sentimento, o que o
// ceu diz — esta em docs/LINHA-DA-PERSUASAO.md, com dez exemplos de cada lado.
//
// O portao so diz NAO, e so para uma coisa: promessa de desfecho. Quem escreve
// copy deve escrever ATE o limite e deixar este portao julgar — e para isso que
// ele existe. Um "Quando voce vai encontrar seu verdadeiro amor?" passa aqui, e
// tem de passar: e pergunta, nao promessa.
//
// FALHA AQUI = NAO PODE PUBLICAR. E de proposito.

import test from 'node:test';
import assert from 'node:assert/strict';

import { LANGUAGES, _DICTS_FOR_TESTS } from '../lib/i18n.js';
import { violacoesDe, relatorio, CHAVE_FORA } from './promessa-scanner.js';

/* =====================================================================
 * 1 · A VARREDURA
 * =====================================================================
 * LANGUAGES e _DICTS_FOR_TESTS sao lidos do proprio lib/i18n.js, nao de uma
 * lista escrita aqui: um quarto idioma entra varrido sem ninguem editar este
 * arquivo, pelo mesmo motivo que a descoberta pelo disco existe no portao da
 * Madre. O esquecimento seria SILENCIOSO — portao verde, idioma sem guarda.
 *
 * Os valores do dicionario sao todos string (medido: 2481 de 2481 em cada
 * idioma), entao aqui nao ha o andador de objeto do outro portao — a chave E o
 * caminho, e ela e o que a mensagem de falha precisa mostrar para quem for
 * consertar. */

test('nenhuma chave de lib/i18n.js promete desfecho, em nenhum dos tres idiomas', () => {
  const achados = [];
  let lidas = 0;

  for (const lang of LANGUAGES) {
    const dict = _DICTS_FOR_TESTS[lang];
    for (const [chave, texto] of Object.entries(dict)) {
      // Chave tecnica (audio, icone, rota, cor, slug, id) nao e copy visivel.
      if (CHAVE_FORA.test(chave)) continue;
      if (typeof texto !== 'string') continue;
      lidas += 1;
      for (const v of violacoesDe(texto, lang)) {
        achados.push({ lang, arquivo: 'lib/i18n.js', campo: chave, texto, ...v });
      }
    }
  }

  assert.equal(
    achados.length,
    0,
    relatorio(achados, 'COPY DO APP PROMETENDO DESFECHO (lib/i18n.js).')
  );

  /* PISO DE COBERTURA. Sem ele este teste ficaria verde por varrer ZERO chave —
   * se alguem renomear _DICTS_FOR_TESTS, trocar a forma do dicionario ou quebrar
   * o import, a varredura leria nada e passaria feliz. Era 7443 quando foi
   * medido (2481 por idioma); o piso e folgado de proposito para nao brigar com
   * quem adiciona ou remove chave, e apertado o bastante para pegar o dicionario
   * inteiro sumindo. */
  assert.ok(
    lidas > 7000,
    `so ${lidas} chaves de lib/i18n.js varridas — eram 7443 nos tres idiomas. `
      + 'A varredura perdeu o dicionario: confira o import de _DICTS_FOR_TESTS.'
  );
});

/* =====================================================================
 * 2 · OS TRES IDIOMAS ESTAO MESMO SENDO LIDOS
 * =====================================================================
 * O teste de cima somaria 7443 mesmo que um idioma estivesse sendo varrido tres
 * vezes e os outros dois nenhuma. Este bloco custa quatro linhas e fecha isso:
 * exige que cada idioma tenha sido lido, com volume de copy de verdade.
 *
 * Ele tambem e o que faz um quarto idioma NASCER exigido: entrou em LANGUAGES,
 * tem de ter dicionario com conteudo, ou o portao acusa. */

test('os tres idiomas de lib/i18n.js entram na varredura, e nenhum entra vazio', () => {
  assert.deepEqual([...LANGUAGES].sort(), ['en', 'es', 'pt']);

  for (const lang of LANGUAGES) {
    const dict = _DICTS_FOR_TESTS[lang];
    assert.ok(dict, `lib/i18n.js nao expoe dicionario para "${lang}"`);
    const chaves = Object.keys(dict);
    assert.ok(
      chaves.length > 2000,
      `o dicionario "${lang}" tem so ${chaves.length} chaves — eram 2481 quando medido`
    );
    const caracteres = chaves.reduce(
      (n, k) => n + (typeof dict[k] === 'string' ? dict[k].length : 0),
      0
    );
    assert.ok(
      caracteres > 100000,
      `o dicionario "${lang}" tem so ${caracteres} caracteres de copy — `
        + 'eram ~140 mil por idioma quando medido. Idioma vazio nao e vigiado.'
    );
  }
});

/* =====================================================================
 * 3 · PROVA POR MUTACAO — a varredura esta LIGADA em lib/i18n.js
 * =====================================================================
 * O bloco 7 do portao da Madre prova que as FORMULAS mordem. Ele nao prova que
 * ELAS estao ligadas AQUI: se alguem trocar o import por um dicionario vazio,
 * inverter o `continue` do CHAVE_FORA ou passar o idioma errado para
 * violacoesDe(), aquele teste continua verde e este passaria a ser decoracao.
 *
 * Entao esta prova e sobre a LIGACAO, e nao sobre a regex. Ela pega chaves que
 * existem de verdade no dicionario, planta a promessa DENTRO do texto real
 * delas — do jeito que um copywriter apressado plantaria, no fim da frase — e
 * exige que a varredura do bloco 1, com o mesmo codigo, morda.
 *
 * As tres chaves sao de telas diferentes e de alto trafego, e sao verificadas:
 * se alguma sumir do dicionario, o teste falha dizendo qual — o que tambem e
 * util, porque chave que some da Home e coisa que se quer saber. */

const MUTACOES = Object.freeze([
  { lang: 'pt', chave: 'onboarding.headerSub', promessa: ' Ele vai voltar para você em 30 dias, garantido.' },
  { lang: 'es', chave: 'onboarding.headerSub', promessa: ' Él va a volver a ti en 30 días, garantizado.' },
  { lang: 'en', chave: 'onboarding.headerSub', promessa: ' He will come back to you in 30 days, guaranteed.' },
]);

test('MUTACAO: promessa plantada numa chave REAL de lib/i18n.js e pega, nos tres idiomas', () => {
  const cegas = [];

  for (const { lang, chave, promessa } of MUTACOES) {
    const original = _DICTS_FOR_TESTS[lang][chave];
    assert.equal(
      typeof original,
      'string',
      `a chave "${chave}" nao existe mais no dicionario "${lang}" — escolha outra `
        + 'chave real para a mutacao, nunca uma inventada.'
    );

    // A copy REAL tem de estar limpa antes: senao a mutacao provaria nada.
    assert.deepEqual(
      violacoesDe(original, lang).map((v) => v.diz),
      [],
      `a chave "${chave}" (${lang}) ja esta acusada ANTES da mutacao`
    );

    const mutada = original + promessa;
    const achados = violacoesDe(mutada, lang);
    if (achados.length === 0) cegas.push(`[${lang}] ${chave}: "${promessa.trim()}"`);
  }

  assert.deepEqual(
    cegas,
    [],
    'A VARREDURA DESTE ARQUIVO ESTA CEGA. A promessa foi plantada dentro do texto '
      + 'real de uma chave de lib/i18n.js e passou. Portao cego e PIOR que portao '
      + 'nenhum: da a sensacao de que ha guarda enquanto a loja reprova o app.'
  );
});

/* =====================================================================
 * 3-bis · E A COPY APROVADA CONTINUA PASSANDO
 * =====================================================================
 * A outra metade da trava, e a mais importante para quem vier depois. O dono JA
 * recusou um titulo por promessa ("Traga seu amor de volta" virou "Sua
 * reconquista comeca aqui") — o portao existe para segurar aquilo, nao para
 * proibir o vocabulario do nicho nem a emocao.
 *
 * Estas frases sao o TOM que ele pediu: pergunta que abre desejo, jornada,
 * comeco, o sentimento nomeado, o que o ceu diz. Se uma delas ficar vermelha, a
 * formula ficou larga e o conserto e ESTREITAR a formula nomeada na falha —
 * nunca apagar o caso daqui, e nunca afrouxar o portao. Ja aconteceu de alguem
 * afrouxar o portao inteiro para destravar copy legitima.
 *
 * Cada uma destas e um dos cinco padroes de docs/LINHA-DA-PERSUASAO.md. */

test('MUTACAO AO CONTRARIO: a copy emocional e aprovada NAO e acusada', () => {
  const honestas = [
    // PERGUNTA que abre desejo — o padrao do concorrente, e ele passa.
    ['pt', 'Quando você vai encontrar seu verdadeiro amor?'],
    ['es', '¿Cuándo vas a encontrar tu verdadero amor?'],
    ['en', 'When will you find your true love?'],
    // JORNADA
    ['pt', 'O próximo passo rumo à autodescoberta.'],
    ['es', 'El próximo paso hacia el autoconocimiento.'],
    ['en', 'The next step toward self-discovery.'],
    // O COMECO dela — o titulo aprovado pelo dono, e seus irmaos.
    ['pt', 'Sua reconquista começa aqui'],
    ['es', 'Tu reconquista empieza aquí'],
    ['en', 'Your comeback starts here'],
    // NOMEAR O SENTIMENTO
    ['pt', 'Para quando a saudade aperta.'],
    ['es', 'Para cuando la nostalgia aprieta.'],
    ['en', 'For when you miss them the most.'],
    // O QUE O CEU DIZ
    ['pt', 'O que a Lua revela sobre você hoje.'],
    ['es', 'Lo que la Luna revela sobre ti hoy.'],
    ['en', 'What the Moon reveals about you today.'],
    /* E o limite pelo lado de dentro: a frase que fala do FUTURO sem prometer
     * desfecho, e a que devolve a acao para quem le. As duas sao o formato que
     * a doutrina pede, e as duas usam palavras que a lista de formulas encosta
     * — "vai", "will", "volta" — sem serem promessa.
     *
     * REPARE NO SUJEITO NOMEADO na frase do meio ("esta linha", "esta linea",
     * "this line"), e nao num pronome. Nao e enfeite: o filtro de artefato
     * (bloco 3-ter do scanner) julga FRASE por frase e nao resolve anafora, entao
     * "No setimo dia ELA volta pra voce" — com o antecedente na frase anterior —
     * e acusado, e com razao, porque lido isolado nao da para saber se "ela" e a
     * linha ou a outra pessoa. A copy do app ja aprendeu isso: ritual.js:130 diz
     * "esta mesma linha volta para voce". Este caso esta aqui escrito do jeito
     * CERTO de proposito — e o modelo que docs/LINHA-DA-PERSUASAO.md manda
     * seguir, e a prova de que o jeito certo passa. */
    ['pt', 'Você vai escrever uma linha por dia. No sétimo dia esta linha volta pra você.'],
    ['es', 'Vas a escribir una línea por día. El séptimo día este aparato te devuelve esta línea.'],
    ['en', 'You will write one line a day. On the seventh day this device hands this line back to you.'],
    ['pt', 'O que essa pessoa faz não está nas suas mãos. O gesto de hoje está.'],
    ['es', 'Lo que hace esa persona no está en tus manos. El gesto de hoy sí.'],
    ['en', 'What that person does is not in your hands. Today’s gesture is.'],
  ];

  const acusadas = honestas
    .map(([lang, texto]) => [lang, texto, violacoesDe(texto, lang)])
    .filter((p) => p[2].length > 0);

  assert.deepEqual(
    acusadas.map(([l, t, v]) => `[${l}] "${t}" -> ${v.map((x) => x.diz).join(' | ')}`),
    [],
    'FALSO POSITIVO. A formula ficou larga e acusou copy que PODE — possivelmente '
      + 'o proprio titulo aprovado pelo dono, ou um dos cinco padroes de '
      + 'docs/LINHA-DA-PERSUASAO.md. O conserto e ESTREITAR a formula nomeada '
      + 'acima (em test/promessa-scanner.js), nunca remover o caso desta lista e '
      + 'nunca afrouxar o portao.'
  );
});
