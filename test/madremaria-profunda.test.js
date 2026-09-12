// Portao da LEITURA PROFUNDA — o carrossel de cinco audios.
//
// O que este arquivo impede, e cada item ja tem um defeito conhecido atras:
//
//   1. o texto da tela deixar de ser o que a voz diz. E a regra que faz o
//      carrossel funcionar no onibus: quem le tudo nao perde nada. Um resumo
//      escrito por cima do audio quebra isso EM SILENCIO — o app continua
//      desenhando, e so quem ouve e le ao mesmo tempo percebe.
//   2. um bloco apontar para um audio que nao existe, ou que ninguem registrou
//      em lib/audios.js (o Metro so resolve require estatico: um id sem entrada
//      la vira botao que nunca aparece, sem erro nenhum).
//   3. a chave 'profunda' escapar do "Apagar tudo".
//   4. o carrossel tocar sozinho, ou reancorar o ano das treze luas.
//   5. o progresso andar para tras — quem chegou no card 4 nao volta a 1 por ter
//      deslizado de volta, e quem ouviu nao vira "ainda nao ouviu".
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import TEMPOS from '../madremaria/datos/profunda-tempos.json' with { type: 'json' };
import {
  BLOQUES_PROFUNDA,
  BLOQUES_PROFUNDA_B,
  TOTAL_PROFUNDA,
  bloqueDe,
  duracaoDe,
  paragrafosDe,
  trechosDe,
} from '../madremaria/datos/profunda.js';
import {
  INTERVALO_MINIMO_VIBRACAO,
  deveVibrar,
  indiceEm,
} from '../madremaria/hooks/useFraseAtual.js';
import {
  _inyectarAlmacenParaTests,
  _reiniciarParaTests,
} from '../madremaria/lib/almacen.js';
import { lerGenero, normalizarGenero } from '../madremaria/lib/genero.js';
import {
  CLAVE_PROFUNDA,
  lerProfunda,
  marcarCardVisto,
  marcarFimDaProfunda,
  marcarOuvido,
} from '../madremaria/lib/profunda.js';

/* FUSAO COSMIC GUIDE: a raiz do app da Madre deixou de ser a raiz do repo —
 * ela agora mora em madremaria/. Tudo que este arquivo le por RAIZ (lib/,
 * datos/, screens/) esta la dentro.
 *
 * __dirname e NAO import.meta.url, ao contrario do original: o `npm test` do
 * Cosmic roda `node --require ./test/setup.js`, que passa tudo por
 * @babel/register + babel-preset-expo (alvo Hermes) e transpila para CommonJS.
 * Nesse alvo `import.meta` e erro de SINTAXE ("not supported in Hermes") e
 * derruba o arquivo inteiro antes do primeiro teste; __dirname existe.
 * Verificado nos dois sentidos: com import.meta o arquivo morre no
 * runner real; com __dirname passa. Nao trocar de volta. */
const RAIZ = join(__dirname, '..', 'madremaria');

const fonte = (relativo) => readFileSync(join(RAIZ, relativo), 'utf8');

/* So o CODIGO, sem comentario — a mesma tecnica de `textoDeInterface` em
 * test/copy.test.js e pelo mesmo motivo: os comentarios deste projeto explicam
 * as regras citando exatamente as palavras proibidas ("a tela nao inventa
 * autoplay", "a ancora e assunto de marcarLeituraDeEntrada"), e um portao que le
 * comentario acusa a documentacao da propria regra. */
const codigo = (relativo) =>
  fonte(relativo)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((linha) => {
      const l = linha.trim();
      return !l.startsWith('//') && !l.startsWith('*');
    })
    .join('\n');

/* Storage falso, o mesmo de test/entrada.test.js: um Map que aceita o require e
 * responde como o AsyncStorage real, com as chaves visiveis para o teste poder
 * conferir o ENDERECO gravado e nao so o valor. */
function almacenFalso(inicial = {}) {
  const disco = new Map(Object.entries(inicial));
  return {
    disco,
    async getItem(k) {
      return disco.has(k) ? disco.get(k) : null;
    },
    async setItem(k, v) {
      disco.set(k, v);
    },
    async removeItem(k) {
      disco.delete(k);
    },
  };
}

/* ===========================================================================
 * 1 — OS CINCO BLOCOS
 * =========================================================================== */

test('sao cinco blocos, na ordem dos audios, sem id repetido', () => {
  assert.equal(TOTAL_PROFUNDA, 5);
  assert.equal(BLOQUES_PROFUNDA.length, 5);
  assert.deepEqual(
    BLOQUES_PROFUNDA.map((b) => b.id),
    ['profunda-7', 'profunda-8', 'profunda-9', 'profunda-10', 'profunda-11'],
    'a ordem e conteudo: o 8 responde ao 7 e o 11 fecha o que o 9 abriu'
  );
});

test('nenhum bloco tem campo vazio, e o texto e leitura de verdade', () => {
  for (const b of [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B]) {
    for (const campo of ['id', 'audio', 'titulo', 'texto']) {
      assert.ok(
        typeof b[campo] === 'string' && b[campo].trim().length > 0,
        `${b.id}: campo '${campo}' vazio`
      );
    }
    // O audio mais curto tem 46 segundos. Um texto de duas linhas debaixo de um
    // audio de 46 segundos e a prova de que alguem resumiu em vez de transcrever.
    assert.ok(
      b.texto.length >= 300,
      `${b.id}: texto curto demais (${b.texto.length} chars) para um audio de quase um minuto`
    );
    assert.ok(paragrafosDe(b).length >= 2, `${b.id}: o texto virou um paragrafo unico`);
  }
});

test('bloqueDe acha pelo id e devolve null no que nao existe', () => {
  assert.equal(bloqueDe('profunda-9').titulo, BLOQUES_PROFUNDA[2].titulo);
  assert.equal(bloqueDe('profunda-99'), null);
  assert.equal(bloqueDe(''), null);
  assert.equal(bloqueDe(undefined), null);
});

/* ===========================================================================
 * 2 — O TEXTO E O QUE A VOZ DIZ
 * ===========================================================================
 * A comparacao e contra docs/ROTEIRO-LEITURA-PROFUNDA.md, que e o roteiro a
 * partir do qual os audios 8, 9, 10 e 11 foram gravados.
 *
 * O AUDIO 7 FICA DE FORA, e a ausencia esta documentada: aquele audio ja estava
 * gravado quando o roteiro nasceu, e o documento so registra "ja feito, 54s" —
 * nao ha texto la para conferir. O texto do bloco 7 em datos/profunda.js foi
 * transcrito do proprio .m4a. Enquanto o roteiro nao ganhar aquele trecho, este
 * portao nao tem como vigiar o bloco 7, e fingir que vigia seria pior do que
 * dizer que nao vigia. */
const ROTEIRO = fonte('docs/ROTEIRO-LEITURA-PROFUNDA.md');

// Tira a marca de citacao do markdown e achata todo espaco: o roteiro quebra as
// linhas em 90 colunas e o texto do app nao, entao comparar cru so acusaria a
// largura do editor de quem escreveu o documento.
const achatar = (texto) =>
  texto
    .replace(/^>\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

test('o texto dos blocos 8 a 11 e o do roteiro, palavra por palavra', () => {
  const roteiro = achatar(ROTEIRO);
  const faltando = [];

  /* AS TRES VERSOES DO 11 ENTRAM, nao so a que esta no array. O fecho tem uma
   * afirmacao por genero, e as outras duas nunca passariam por aqui se a
   * varredura olhasse so BLOQUES_PROFUNDA — que e exatamente onde um texto
   * gravado e um texto de tela divergem sem ninguem ver. */
  const blocos = [
    ...BLOQUES_PROFUNDA.slice(1, -1),
    bloqueDe('profunda-11'),
  ];

  for (const b of blocos) {
    for (const paragrafo of paragrafosDe(b)) {
      if (!roteiro.includes(achatar(paragrafo))) {
        faltando.push(`${b.audio}: "${paragrafo.slice(0, 60)}..."`);
      }
    }
  }

  assert.deepEqual(
    faltando,
    [],
    'Paragrafo que nao esta no roteiro gravado. O texto da tela TEM de ser o que a voz '
      + 'diz: quem esta sem fone le tudo e nao perde nada, e um resumo escrito por cima '
      + `do audio quebra isso sem acusar erro nenhum.\n  ${faltando.join('\n  ')}`
  );
});

test('o bloco 7 continua sem roteiro, e o codigo diz isso', () => {
  // Nao e um teste de conteudo: e o lembrete vivo da pendencia. No dia em que o
  // roteiro ganhar o texto do audio 7, este teste falha e quem passar por aqui
  // move o bloco 7 para a varredura de cima.
  assert.ok(
    !achatar(ROTEIRO).includes(achatar(paragrafosDe(BLOQUES_PROFUNDA[0])[0])),
    'O roteiro passou a trazer o texto do audio 7: inclua o bloco 7 na varredura acima '
      + '(BLOQUES_PROFUNDA.slice(1) vira BLOQUES_PROFUNDA) e apague este teste.'
  );
  assert.match(
    fonte('datos/profunda.js'),
    /transcrito do proprio assets\/audio\/profunda-7\.m4a/,
    'a origem do texto do bloco 7 precisa continuar escrita no arquivo'
  );
});

/* ===========================================================================
 * 3 — OS ARQUIVOS DE AUDIO
 * =========================================================================== */

test('todo bloco tem o .m4a no disco e a entrada em lib/audios.js', () => {
  const audios = fonte('lib/audios.js');
  for (const b of [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B]) {
    assert.ok(
      existsSync(join(RAIZ, '..', 'assets', 'madremaria', 'audio', `${b.audio}.m4a`)),
      `${b.audio}.m4a nao esta em assets/madremaria/audio`
    );
    // O Metro resolve require ESTATICO: sem esta linha o botao de ouvir some em
    // silencio, e o carrossel vira texto mudo.
    assert.ok(
      audios.includes(`'${b.audio}': require(`),
      `${b.audio} nao esta registrado em lib/audios.js`
    );
  }
});

/* ===========================================================================
 * 4 — O PROGRESSO NO DISCO
 * =========================================================================== */

test('a chave nua vira endereco prefixado uma vez so, nunca mm-hr.mm-hr.', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  await marcarCardVisto(2);

  const enderecos = [...falso.disco.keys()];
  assert.deepEqual(enderecos, ['mm-hr.profunda'], `enderecos gravados: ${enderecos}`);

  _reiniciarParaTests();
});

test('o card visto nunca anda para tras', async () => {
  _inyectarAlmacenParaTests(almacenFalso());

  await marcarCardVisto(0);
  await marcarCardVisto(3);
  // Ela deslizou de volta para reler o card 2.
  await marcarCardVisto(1);

  assert.equal((await lerProfunda()).visto, 3, 'voltar um card apagaria onde ela chegou');

  _reiniciarParaTests();
});

test('o que ela ouviu nao se perde nem se duplica', async () => {
  _inyectarAlmacenParaTests(almacenFalso());

  await marcarOuvido('profunda-7');
  await marcarOuvido('profunda-7');
  await marcarOuvido('profunda-9');

  assert.deepEqual((await lerProfunda()).ouvidos, ['profunda-7', 'profunda-9']);

  _reiniciarParaTests();
});

test('gravacoes disparadas juntas nao se apagam entre si', async () => {
  // O caso real: ela desliza para o card 3 e toca o audio no mesmo segundo. Sem
  // a fila de escrita as duas leem o mesmo estado antigo, a segunda vence, e o
  // Perfil passa a dizer "voce ainda nao ouviu" para quem ouviu.
  _inyectarAlmacenParaTests(almacenFalso());

  await Promise.all([
    marcarCardVisto(2),
    marcarOuvido('profunda-9'),
    marcarCardVisto(3),
    marcarFimDaProfunda(),
  ]);

  const estado = await lerProfunda();
  assert.equal(estado.visto, 3);
  assert.deepEqual(estado.ouvidos, ['profunda-9']);
  assert.equal(estado.fim, true);

  _reiniciarParaTests();
});

test('o fim nunca volta a ser falso', async () => {
  _inyectarAlmacenParaTests(almacenFalso());

  await marcarFimDaProfunda();
  await marcarCardVisto(0);
  await marcarOuvido('profunda-8');

  assert.equal((await lerProfunda()).fim, true, 'uma segunda passada nao desfaz a primeira');

  _reiniciarParaTests();
});

test('progresso podre nao vira progresso inventado', async () => {
  for (const podre of ['', '   ', 'null', '[]', '{', '"sim"', '{"visto":"tres"}', '{"ouvidos":3}']) {
    _inyectarAlmacenParaTests(almacenFalso({ 'mm-hr.profunda': podre }));
    const estado = await lerProfunda();
    assert.equal(estado.visto, 0, `"${podre}" nao pode virar card visto`);
    assert.deepEqual(estado.ouvidos, [], `"${podre}" nao pode virar audio ouvido`);
    assert.equal(estado.fim, false, `"${podre}" nao pode virar leitura concluida`);
    _reiniciarParaTests();
  }
});

/* ===========================================================================
 * 5 — OS PORTOES DE INTEGRACAO
 * ===========================================================================
 * Lidos da FONTE de proposito: as telas tem JSX e nao carregam sob `node --test`
 * — mesma tecnica de test/entrada.test.js e test/gamificacao.test.js. */

test('a chave da leitura profunda esta na lista que o "Apagar tudo" percorre', () => {
  const bloco = fonte('screens/AjustesScreen.js').match(
    /CLAVES_HILO_ROJO\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/
  );
  assert.ok(bloco, 'CLAVES_HILO_ROJO sumiu de screens/AjustesScreen.js');

  const literais = [...bloco[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
  assert.ok(
    literais.includes(CLAVE_PROFUNDA),
    `'${CLAVE_PROFUNDA}' nao esta em CLAVES_HILO_ROJO. Sem esta linha, o registro do que `
      + 'ela ouviu e do que pulou sobrevive ao "Apagar tudo" e a tela de privacidade mente. '
      + `Literais encontrados: ${literais.join(', ')}`
  );
});

test('a rota da leitura profunda existe, esta registrada e alguem navega para ela', () => {
  assert.match(fonte('routes.js'), /LEITURA_PROFUNDA:\s*'LeituraProfunda'/);

  /* FUSAO COSMIC GUIDE: o App.js da Madre virou MadreMariaApp.js — a arvore
   * dela agora e um navegador ANINHADO dentro do HomeStack do Cosmic, e o
   * App.js da raiz e o do Cosmic. O que este portao guarda nao mudou: a tela
   * registrada no Stack DELA. */
  const app = fonte('MadreMariaApp.js');
  assert.ok(
    app.includes('name={RUTAS.LEITURA_PROFUNDA}'),
    'a tela nao esta registrada no Stack de MadreMariaApp.js: navigate() para rota nao '
      + 'registrada nao lanca, so avisa em __DEV__ — o dedo bate e a tela nao muda'
  );
  assert.ok(
    app.includes('LeituraProfundaScreen'),
    'MadreMariaApp.js nao importa a tela'
  );

  // A ligacao do funil: as tres cartas passam a levar ao carrossel.
  assert.ok(
    fonte('screens/LeituraDeEntradaScreen.js').includes('RUTAS.LEITURA_PROFUNDA'),
    'a leitura de entrada voltou a entrar direto no app: o passo 3 do funil ficou orfao'
  );
  // E a porta do Perfil, que e o que torna o "Pular" uma saida e nao uma perda.
  assert.ok(
    fonte('screens/PerfilScreen.js').includes('RUTAS.LEITURA_PROFUNDA'),
    'sem a linha no Perfil, quem pulou o carrossel perde os cinco audios para sempre'
  );
});

test('o carrossel nao toca sozinho e nao reancora o ano das treze luas', () => {
  const tela = codigo('screens/LeituraProfundaScreen.js');

  // Autoplay: a tela nao pode chamar play() por conta propria. Quem toca e o
  // dedo, dentro de components/BotaoOuvir.js.
  assert.ok(
    !/\.play\s*\(/.test(tela),
    'a tela chamou play(): audio que comeca sozinho e invasao — a pessoa pode estar '
      + 'em qualquer lugar quando abre'
  );
  assert.ok(
    !/autoPlay|autoplay/.test(tela),
    'a tela pediu autoplay'
  );

  // A ancora do ano nasce uma vez so, na conclusao das tres cartas. Reescreve-la
  // aqui devolveria a lunacao 1 para quem reouve no mes 7 — sem erro nenhum.
  assert.ok(
    !/CLAVE_ANO|marcarLeituraDeEntrada|guardarSeguro/.test(tela),
    'a tela escreveu fora de lib/profunda.js. O unico disco do carrossel e o progresso '
      + 'dele; a ancora do ano e assunto de lib/entrada.js e nao se reescreve.'
  );

  // E a parada do audio ao trocar de card: duas vozes juntas nao e leitura.
  assert.ok(
    tela.includes('pararAudioAtual'),
    'trocar de card precisa parar o audio do card anterior'
  );
});

/* ===========================================================================
 * 6 — O TEXTO ACOMPANHANDO A VOZ
 * ===========================================================================
 * O que este bloco impede:
 *
 *   a. o texto que a tela desenha deixar de ser o texto do bloco. O card nao
 *      desenha mais `paragrafosDe(bloco)`: desenha as FRASES de
 *      `trechosDe(bloco.id)`. Se uma frase se perder, se duplicar ou trocar de
 *      ordem, a regra "ler basta" quebra em silencio — a tela continua bonita e
 *      a leitura fica com um buraco. Emendadas, as frases TEM de dar de volta o
 *      `texto` do bloco, palavra por palavra.
 *   b. a matematica da sincronia errar sem ninguem ver. `indiceEm` decide qual
 *      frase acende; um erro de borda nela nao aparece em screenshot nenhum, so
 *      em quem esta ouvindo e lendo junto.
 *   c. a rajada de haptico. Ha pares de frases a 0,49 s de distancia nos audios
 *      medidos: sem o piso sao tres toquinhos num segundo, e quem recebe isso
 *      desliga a vibracao inteira em Ajustes — perdendo tambem a raspadinha e o
 *      no do dia.
 *   d. a tela criar player por fora do botao, ou o texto que ainda nao veio ser
 *      escondido de quem quer ler adiantado. */

const achatarTexto = (texto) => String(texto).replace(/\s+/g, ' ').trim();

test('as frases emendadas dao de volta o texto do bloco, palavra por palavra', () => {
  for (const b of [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B]) {
    const trechos = trechosDe(b.id);
    assert.ok(trechos.length > 0, `${b.id}: ficou sem frase nenhuma para desenhar`);
    assert.equal(
      achatarTexto(trechos.map((tr) => tr.texto).join(' ')),
      achatarTexto(b.texto),
      `${b.id}: as frases desenhadas na tela nao sao mais o texto do bloco. A tela passou `
        + 'a mostrar coisa diferente do que a voz diz, que e a regra que faz o carrossel '
        + 'funcionar para quem esta sem fone.'
    );
  }
});

test('cada frase pertence ao paragrafo certo, e o respiro do texto nao se perde', () => {
  for (const b of [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B]) {
    const paragrafos = paragrafosDe(b).map(achatarTexto);
    const remontados = [];
    for (const trecho of trechosDe(b.id)) {
      const p = trecho.paragrafo;
      assert.ok(
        Number.isInteger(p) && p >= 0 && p < paragrafos.length,
        `${b.id}: frase apontando para o paragrafo ${p}, que nao existe`
      );
      remontados[p] = remontados[p]
        ? `${remontados[p]} ${achatarTexto(trecho.texto)}`
        : achatarTexto(trecho.texto);
    }
    assert.deepEqual(
      remontados,
      paragrafos,
      `${b.id}: o agrupamento por paragrafo saiu torto — a tela perderia a linha em branco `
        + 'e o texto viraria a parede que paragrafosDe existe para evitar'
    );
  }
});

test('os tempos cobrem o audio inteiro, em ordem, sem buraco', () => {
  for (const b of [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B]) {
    const trechos = trechosDe(b.id);
    assert.ok(duracaoDe(b.id) > 0, `${b.id}: sem duracao medida`);

    let anterior = -1;
    for (const trecho of trechos) {
      assert.ok(Number.isFinite(trecho.ini), `${b.id}: frase sem inicio medido`);
      assert.ok(trecho.fim >= trecho.ini, `${b.id}: frase que acaba antes de comecar`);
      assert.ok(trecho.ini >= anterior, `${b.id}: os inicios sairam da ordem`);
      anterior = trecho.ini;
    }
    assert.equal(trechos[0].ini, 0, `${b.id}: o audio nao comeca na primeira frase`);
  }
});

test('indiceEm acha a frase de cada instante dos cinco audios', () => {
  for (const b of [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B]) {
    const trechos = trechosDe(b.id);

    // O primeiro instante de cada frase e o meio dela tem de cair nela mesma: a
    // borda e onde um `<` no lugar de um `<=` passa despercebido.
    trechos.forEach((trecho, i) => {
      assert.equal(indiceEm(trechos, trecho.ini), i, `${b.id}: o inicio da frase ${i} errou`);
      assert.equal(
        indiceEm(trechos, (trecho.ini + trecho.fim) / 2),
        i,
        `${b.id}: o meio da frase ${i} errou`
      );
    });

    // E o audio inteiro, de decimo em decimo: o destaque nunca volta enquanto a
    // voz avanca.
    let ultimo = -1;
    for (let s = 0; s < duracaoDe(b.id); s += 0.1) {
      const i = indiceEm(trechos, s);
      assert.ok(
        i >= ultimo,
        `${b.id}: em ${s.toFixed(1)}s o destaque voltou de ${ultimo} para ${i}`
      );
      ultimo = i;
    }
    assert.equal(ultimo, trechos.length - 1, `${b.id}: a ultima frase nunca chega a acender`);
  }
});

test('indiceEm devolve -1 em vez de inventar destaque', () => {
  const trechos = trechosDe('profunda-7');
  assert.equal(indiceEm(trechos, NaN), -1, 'player recem-criado devolve NaN em currentTime');
  assert.equal(indiceEm(trechos, -1), -1);
  assert.equal(indiceEm([], 5), -1);
  assert.equal(indiceEm(null, 5), -1);
  // Sem tempo medido (`ini: null`, o caminho de degradacao de trechosDe) ninguem
  // acende, e a tela volta a ser a pagina de texto de antes.
  assert.equal(indiceEm([{ ini: null, fim: null }], 5), -1);
});

test('trechosDe e uma tabela estavel, e id desconhecido nao explode', () => {
  assert.deepEqual(trechosDe('profunda-99'), []);
  assert.equal(duracaoDe('profunda-99'), 0);
  assert.equal(
    trechosDe('profunda-7'),
    trechosDe('profunda-7'),
    'a mesma instancia tem de sair em toda chamada: o hook tem os trechos numa lista de '
      + 'dependencias, e um array novo a cada render reiniciaria o relogio do audio'
  );
});

test('duas frases coladas nao viram rajada de vibracao', () => {
  assert.equal(deveVibrar(10, 10.49), false, 'meio segundo depois nao pode vibrar de novo');
  assert.equal(deveVibrar(10, 10 + INTERVALO_MINIMO_VIBRACAO), true, 'no piso, vibra');
  assert.equal(deveVibrar(null, 0), true, 'a primeira frase do audio sempre vibra');
  // Ela tocou de novo desde o inicio: o piso nao pode deixar o replay mudo.
  assert.equal(deveVibrar(50, 0), true);
  assert.equal(deveVibrar(10, NaN), false, 'frase sem tempo nao vibra');

  // E o efeito nos audios de verdade: nenhum par sobrevivente abaixo do piso.
  for (const b of [...BLOQUES_PROFUNDA, ...BLOQUES_PROFUNDA_B]) {
    let ultimo = null;
    for (const trecho of trechosDe(b.id)) {
      if (!deveVibrar(ultimo, trecho.ini)) continue;
      if (ultimo !== null) {
        assert.ok(
          trecho.ini - ultimo >= INTERVALO_MINIMO_VIBRACAO,
          `${b.id}: passou um par a ${(trecho.ini - ultimo).toFixed(2)}s`
        );
      }
      ultimo = trecho.ini;
    }
  }
});

test('a tela le o tempo do player sem criar player nenhum por fora do botao', () => {
  const tela = codigo('screens/LeituraProfundaScreen.js');

  assert.ok(
    tela.includes('onPlayer'),
    'sem o onPlayer do BotaoOuvir a tela nao tem de onde ler o tempo, e o texto nunca acende'
  );
  assert.ok(
    !/createAudioPlayer/.test(tela),
    'a tela criou o proprio player: quem cria, para e descarta audio neste app e '
      + 'components/BotaoOuvir.js, e dois donos do mesmo som e o defeito que ele existe '
      + 'para nao ter'
  );
  assert.ok(
    tela.includes('ativo={i === indice}'),
    'o relogio precisa andar so no card visivel: os cinco ficam montados ao mesmo tempo'
  );
});

test('o onPlayer do BotaoOuvir nao pode derrubar o audio de quem nao o usa', () => {
  const botao = codigo('components/BotaoOuvir.js');

  // O efeito que descarta o player depende de [parar]. Com `onPlayer` dentro
  // dele, um pai que passe funcao inline recriaria o efeito a cada render e a
  // limpeza chamaria remove() NO MEIO da reproducao.
  assert.ok(
    /avisarPlayer\s*=\s*useRef/.test(botao),
    'o onPlayer precisa viver num ref, fora das listas de dependencias'
  );
  assert.ok(
    !/\[\s*onPlayer\s*,\s*parar\s*\]|\[\s*parar\s*,\s*onPlayer\s*\]/.test(botao),
    'onPlayer entrou nas dependencias do efeito de descarte: o audio vai morrer sozinho'
  );
});

test('a vibracao da leitura profunda passa pela preferencia e nunca sai na web', () => {
  const ritmo = codigo('components/TextoNoRitmo.js');

  assert.ok(
    ritmo.includes('leerAjustes'),
    'o toquinho ignorou a chave "ajustes": quem desligou a vibracao receberia 56 mesmo assim'
  );
  assert.match(
    ritmo,
    /Platform\.OS === 'web'/,
    'falta a checagem de Platform: na web o expo-haptics e no-op HOJE, e depender disso e '
      + 'depender de a lib nao mudar'
  );
  assert.ok(
    ritmo.includes('deveVibrar'),
    'o piso entre duas vibracoes sumiu: os audios tem frases a meio segundo uma da outra'
  );
  // So com a voz TOCANDO. Rolar o texto com o dedo, pausar ou trocar de card nao
  // pode fazer o aparelho tremer.
  assert.match(
    ritmo,
    /if \(!tocando\) return;/,
    'o haptico deixou de ser preso ao audio tocando'
  );
});

test('o texto que ainda nao veio continua legivel: nunca escondido, nunca borrado', () => {
  const ritmo = codigo('components/TextoNoRitmo.js');

  assert.ok(
    !/blurRadius|display:\s*'none'/.test(ritmo),
    'alguem borrou ou escondeu as frases que ainda nao chegaram — o oposto do que esta '
      + 'tela faz: quem le mais rapido que a voz pode ler adiantado'
  );

  // O piso de contraste: colores.ceniza a 90% sobre colores.noche da 4,53:1, o
  // minimo de AA para texto de corpo. A 85% cai para 4,04:1 e reprova.
  const opacidade = ritmo.match(/porVir:\s*\{[^}]*opacity:\s*([\d.]+)/);
  assert.ok(opacidade, 'o estado "ainda nao veio" perdeu o estilo proprio');
  assert.ok(
    Number(opacidade[1]) >= 0.9,
    `opacidade ${opacidade[1]} sobre colores.ceniza reprova no contraste AA`
  );
});

/* A tabela de tempos e por AUDIO, nao por bloco: o bloco 11 e um id so com tres
 * arquivos (o fecho muda com o genero dela) e cada um tem a sua duracao. A lista
 * esperada e DERIVADA dos blocos e dos generos — digitar os sete nomes a mao
 * faria este portao parar de vigiar no dia em que um audio entrasse ou saisse. */
const AUDIOS_ESPERADOS = [
  ...BLOQUES_PROFUNDA.filter((b) => b.id !== 'profunda-11').map((b) => b.audio),
  'profunda-11',
  // A leitura B (08/09): cinco audios, fecho neutro — id e audio iguais.
  ...BLOQUES_PROFUNDA_B.map((b) => b.audio),
];

test('o arquivo de tempos cobre os sete audios e nada mais', () => {
  assert.deepEqual(
    Object.keys(TEMPOS).sort(),
    [...AUDIOS_ESPERADOS].sort(),
    'datos/profunda-tempos.json saiu de sincronia com os audios'
  );
  /* 233 frases. A conta foi 79 -> 137 (fecho em tres generos) -> 164 -> 168
   * (01/09) -> 265 (08/09, com a leitura B) -> 233 em 11/09, quando DUAS coisas
   * aconteceram no mesmo commit: o fecho perdeu as tres versoes de genero (tres
   * audios viraram UM, ver a nota em datos/profunda.js) e os dois fechos
   * ganharam a escada do degelo — o trecho que diz o que espera do outro lado,
   * degrau por degrau. Hoje: 128 nos quatro primeiros blocos da A + 58 no fecho
   * unico + 47 nos quatro primeiros da B + 45 no fecho da B. Em 11/09 (tarde)
   * caiu para 231: o peso do numero saiu da copy ("um ano inteiro",
   * "trezentos e sessenta e quatro") e cinco audios foram regravados.
   *
   * Este numero so se mexe junto com um .m4a novo em assets/audio. Alguem que o
   * ajuste para calar este teste sem ter regravado esta escondendo exatamente o
   * que ele existe para acusar: texto e voz dizendo coisas diferentes. */
  assert.equal(
    Object.values(TEMPOS).reduce((soma, bloco) => soma + bloco.trechos.length, 0),
    231,
    'o numero de frases medidas mudou sem que ninguem regravasse audio'
  );
});

/* ===========================================================================
 * 7 — O FECHO QUE FALA COM QUEM ESTA OUVINDO
 * ===========================================================================
 * O bloco 11 afirma quem ela passa a ser depois das treze luas, e ate 01/09 essa
 * afirmacao dizia "uma mulher que sabe isso e outra mulher" para todo mundo. O
 * que este bloco de testes impede:
 *
 *   a. uma versao ficar sem .m4a, sem require ou sem tempos — e o unico defeito
 *      aqui que NAO aparece na tela: o texto sai certo e a voz some;
 *   b. o texto de uma versao deixar de ser o que aquele arquivo diz;
 *   c. o padrao virar 'mulher' de novo por um `||` mal colocado. Quem nao
 *      respondeu ouve a neutra, e isso e decisao de produto, nao acaso.
 */

test('o fecho e UM so, com arquivo, require e tempos, e vale para qualquer pessoa', () => {
  const audios = fonte('lib/audios.js');

  const bloco = bloqueDe('profunda-11');
  assert.equal(bloco.audio, 'profunda-11', 'o fecho deixou de ter um audio so');
  assert.equal(bloco.id, 'profunda-11', 'o id do BLOCO e o que lib/profunda.js guarda como ouvido');
  assert.ok(existsSync(join(RAIZ, '..', 'assets', 'madremaria', 'audio', `${bloco.audio}.m4a`)), `sem arquivo: ${bloco.audio}`);
  assert.ok(audios.includes(`'${bloco.audio}': require(`), 'o fecho perdeu o require estatico');
  // E os tres arquivos antigos por genero nao podem voltar.
  for (const velho of ['profunda-11-mulher', 'profunda-11-homem', 'profunda-11-neutro']) {
    assert.ok(!audios.includes(`'${velho}'`), `${velho} voltou a lib/audios.js — o fecho e um so`);
  }
  assert.ok(duracaoDe('profunda-11') > 0, 'sem duracao medida');
  assert.equal(
    achatarTexto(trechosDe('profunda-11').map((tr) => tr.texto).join(' ')),
    achatarTexto(bloco.texto),
    'as frases medidas nao sao mais o texto do fecho'
  );

  /* O FECHO VALE PARA QUALQUER PESSOA (11/09). Ate aqui havia tres versoes
   * porque uma frase afirmava "uma mulher que sabe isso e outra mulher". A
   * neutra virou a unica, e nenhuma flexao de genero de QUEM OUVE pode voltar:
   * ela excluiria metade das pessoas justamente na frase mais importante da
   * leitura. (O genero de quem esta do outro lado ja e vigiado por
   * test/copy.test.js, e continua sendo "essa pessoa".) */
  for (const proibido of [
    /\buma mulher que\b/i, /\bum homem que\b/i,
    /\bvoc[eê] (est[aá]|fica|ficou) (sozinh|cansad|pront|perdid|segur)[ao]\b/i,
    /\bamiga\b/i, /\bquerida\b/i,
  ]) {
    assert.doesNotMatch(bloco.texto, proibido, `o fecho voltou a falar com so metade das pessoas: ${proibido}`);
  }
});

test('normalizarGenero nao inventa genero a partir de lixo', () => {
  assert.equal(normalizarGenero('mulher'), 'mulher');
  assert.equal(normalizarGenero('Feminino'), 'mulher');
  assert.equal(normalizarGenero('homem'), 'homem');
  assert.equal(normalizarGenero('Masculino'), 'homem');
  assert.equal(normalizarGenero('Não binário'), 'neutro');
  assert.equal(normalizarGenero('outro'), 'neutro');

  // O caso que um objeto literal engoliria: 'constructor' viria da cadeia de
  // prototipos e sairia daqui como se fosse resposta gravada.
  assert.equal(normalizarGenero('constructor'), 'neutro');
  assert.equal(normalizarGenero('toString'), 'neutro');
  assert.equal(normalizarGenero(''), 'neutro');
  assert.equal(normalizarGenero(null), 'neutro');
  assert.equal(normalizarGenero(undefined), 'neutro');
  assert.equal(normalizarGenero({ genero: 'homem' }), 'neutro');
});

test('o genero sai do perfil, e um perfil sem resposta nao vira chute', async () => {
  const casos = [
    [JSON.stringify({ genero: 'homem' }), 'homem'],
    [JSON.stringify({ respuestas: { genero: 'mulher' } }), 'mulher'],
    [JSON.stringify({ respuestas: { nombre: 'Ana' } }), 'neutro', 'perfil antigo, sem a pergunta'],
    ['{quebrado', 'neutro', 'JSON pela metade'],
    ['', 'neutro', 'nada gravado'],
  ];

  for (const [gravado, esperado, porque] of casos) {
    _inyectarAlmacenParaTests(almacenFalso(gravado ? { 'mm-hr.perfil': gravado } : {}));
    assert.equal(await lerGenero(), esperado, porque || gravado);
    _reiniciarParaTests();
  }
});

test('a tela escolhe o audio pelo genero, e le os tempos pelo AUDIO', () => {
  const tela = codigo('screens/LeituraProfundaScreen.js');

  assert.ok(
    tela.includes('lerGenero'),
    'a tela deixou de ler o genero — ele ainda serve a outras partes do app'
  );
  /* Desde 08/09 a tela monta os cards por blocosDaVariante(variante, genero)
   * (datos/profunda.js), que e quem chama bloqueDe(b.id, genero) para a A.
   * O que se vigia continua o mesmo: o genero dela chega ate o fecho. */
  assert.ok(
    /blocosDaVariante\(\s*variante\s*\)/.test(tela),
    'os cards deixaram de ser montados pela variante'
  );
  const dados = codigo('datos/profunda.js');

  // O defeito silencioso: com `bloco.id` aqui, quem ouve a versao de homem ve o
  // texto acendendo nos tempos da neutra — segundos fora, sem erro no console.
  assert.ok(
    tela.includes('trechosDe(bloco.audio)') && tela.includes('duracaoDe(bloco.audio)'),
    'o Card voltou a ler os tempos pelo id do bloco em vez do arquivo de audio'
  );
});
