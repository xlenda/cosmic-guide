// test/ano.test.js
// O PORTAO DO ANO DAS 13 LUAS.
//
// ===========================================================================
// O QUE ESTE ARQUIVO FAZ, E POR QUE ELE NAO E UMA AMOSTRA
// ===========================================================================
// Ele monta o dia inteiro do Fio Vermelho — tema da lunacao, tom da fase,
// ritual, reflexao, afirmacao, contencao e carta — para 365 DIAS CORRIDOS, um
// por um, e cobra do ano as coisas que so aparecem no ano: repeticao, buraco,
// e a frase errada num dia que ninguem ia olhar.
//
// Nao e amostragem. Rodar o ano inteiro custa menos de dois segundos porque
// tudo aqui e funcao pura de data — sem storage, sem sorteio, sem rede — e uma
// amostra de 30 dias e exatamente a ferramenta que nao encontra o problema do
// dia 212. Se um dia o custo subir, o nome do teste tem de dizer que virou
// amostragem deterministica. Enquanto disser 365, sao 365.
//
// ===========================================================================
// O DIA E COMPOSTO AQUI, DE PROPOSITO
// ===========================================================================
// Nenhum modulo compoe o dia do ano hoje: lib/ano.js responde tema e fase,
// lib/rituaisRotativos.js responde o gesto, datos/bancos.js responde as tres
// perguntas e lib/mazo.js tem o baralho. `planoDoAno` abaixo e a montagem que a
// tela vai fazer, escrita uma vez aqui para que o portao cobre a JUNCAO — que e
// onde moram os defeitos deste desenho. A repeticao nunca esta dentro de um
// modulo; ela nasce entre dois que giram em periodos que se encaixam mal.
//
// ===========================================================================
// A DOUTRINA E COBRADA COM AS GUARDAS DO PRODUTO, NAO COM UMA COPIA
// ===========================================================================
// sugiereContacto() e hablaDelFuturo() vem de lib/lectura.js — as MESMAS que o
// motor de leitura usa. Uma copia local envelheceria em silencio, que e como um
// portao para de proteger sem nunca ficar vermelho. Se a doutrina apertar la,
// ela aperta aqui no mesmo commit.
//
// ===========================================================================
// AS DUAS QUARENTENAS, E POR QUE ELAS SAO SUBCONJUNTO E NAO IGUALDADE
// ===========================================================================
// Duas fontes de texto do dia pertencem a outros donos: datos/rituais.js (que
// outro fluxo esta escrevendo agora) e datos/cartas.json (o baralho, coberto
// por test/copy.test.js e por test/lectura.test.js). Achado que ja existe nelas
// entra numa lista NOMEADA, endereco por endereco. A assercao e
// `achados ⊆ QUARENTENA`:
//   · achado NOVO em qualquer lugar -> vermelho, que e o que um portao serve;
//   · achado da lista consertado pelo dono -> continua verde, sem me obrigar a
//     editar o arquivo de outro agente para o meu teste passar.
// Igualdade exata faria este portao brigar com quem esta consertando o defeito.
// A lista tambem e o relatorio: ela e a divida escrita, com endereco.
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AFIRMACOES,
  CONTENCOES,
  LUNACOES_DE_ARQUIVO,
  afirmacaoDoDia,
  contencaoDoDia,
  ehLunacaoDeArquivo,
  reflexaoDoDia,
  verificarBancos,
} from '../madremaria/datos/bancos.js';
import {
  MOTIVOS,
  ORIGENS_DO_TEMA,
  TEMAS,
  TONS,
  _reiniciarAnoParaTests,
  menorJanelaSemRepetir,
  percursoDoBaralho,
  posicaoNoAno,
  verificarAno,
} from '../madremaria/lib/ano.js';
import {
  FASES,
  _inyectarMotorParaTests as _inyectarCielo,
  _reiniciarCieloParaTests,
} from '../madremaria/lib/ceu.js';
import { hablaDelFuturo, sugiereContacto } from '../madremaria/lib/lectura.js';
import { MAZO } from '../madremaria/lib/mazo.js';
import { ritualDoDia, verificarEscala } from '../madremaria/lib/rituaisRotativos.js';

/* =================================================================================
 * FERRAMENTAS
 * ================================================================================= */

/* A jornada comeca numa data FIXA e escrita. Nao `new Date()`: um portao que
 * muda de entrada todo dia e um portao que fica vermelho sozinho num sabado e
 * ninguem sabe por que. 03/03/2026 e uma terca-feira comum, com efemeride
 * disponivel e sem nada de especial — que e exatamente o que se quer de uma
 * ancora. */
const INICIO = '2026-03-03';
const DIAS = 365;

const pad = (n, largo = 2) => String(n).padStart(largo, '0');

/* O instante de cada dia e o MEIO-DIA LOCAL, que e a ancora unica declarada em
 * lib/ano.js e em lib/ceu.js. Passar a string 'YYYY-MM-DD' funcionaria, mas ela
 * e lida como meio-dia UTC — e num fuso a leste esse instante ja e outro dia
 * civil. O portao nao pode medir o ano com uma ancora diferente da do app. */
function diaDaJornada(indice) {
  const [anio, mes, dd] = INICIO.split('-').map(Number);
  const d = new Date(anio, mes - 1, dd + indice, 12, 0, 0, 0);
  return {
    dia: `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    instante: d,
  };
}

/**
 * O DIA INTEIRO. Deterministico, sem storage e sem sorteio — como o app.
 *
 * Quando o ceu nao pode ser medido, o tema vem da caixa etiquetada de
 * posicaoNoAno (`aproximacao`), e `fase`, `tom` e `lunacao` ficam NULL. Isso nao
 * e degradacao cosmetica: e a regra "nunca fabricar ceu" escrita em objeto. O
 * dia continua inteiro, e o app fica calado sobre a lua.
 */
function planoDoAno(indice) {
  const { dia, instante } = diaDaJornada(indice);
  const posicao = posicaoNoAno(INICIO, instante);
  const comCeu = posicao.disponivel === true;

  const lunacao = comCeu ? posicao.lunacao : null;
  const tema = comCeu ? posicao.tema : posicao.aproximacao.tema;

  const percurso = percursoDoBaralho(dia);
  const carta = MAZO[percurso.indice];

  return {
    dia,
    numeroDoDia: posicao.dia,
    comCeu,
    motivo: posicao.motivo,

    // O eixo do ano. `origemDoTema` diz de onde ele veio, e a tela e obrigada a
    // ler isso antes de escrever a palavra "lua" em qualquer lugar.
    lunacao,
    lunacaoAbsoluta: comCeu ? posicao.lunacaoAbsoluta : posicao.aproximacao.lunacaoAbsoluta,
    tema,
    origemDoTema: comCeu ? posicao.origemDoTema : ORIGENS_DO_TEMA.DIAS_CORRIDOS,
    apresentavelComoLua: comCeu,

    // O bloco do ceu. Existe inteiro ou nao existe.
    fase: comCeu ? posicao.fase : null,
    tom: comCeu ? posicao.tomDaFase : null,
    semana: comCeu ? posicao.semana : null,

    ritual: ritualDoDia(dia),
    reflexao: reflexaoDoDia(dia, lunacao),
    afirmacao: afirmacaoDoDia(dia),
    contencao: contencaoDoDia(dia),

    carta: { ...carta, invertida: percurso.invertida },
  };
}

function oAnoInteiro(dias = DIAS) {
  const ano = [];
  for (let i = 0; i < dias; i += 1) ano.push(planoDoAno(i));
  return ano;
}

/* =================================================================================
 * A SUPERFICIE VARRIDA — enumerada a mao, e conferida
 * =================================================================================
 * A lista e explicita de proposito: uma varredura que anda pelo objeto sozinha
 * pega tambem `tom.fontes` e `tom.proibicoes`, que sao a DOUTRINA CITANDO A SI
 * MESMA ("nunca ligar a lua cheia a comportamento") — a regra seria reprovada
 * por conter a palavra que ela proibe, e o portao viraria ruido.
 *
 * O preco de enumerar e que um campo renomeado sai da varredura em silencio.
 * Por isso `cadeiasDoPlano` e cobrada por um teste proprio: numero minimo de
 * cadeias e a lista de enderecos esperados. Varredura vazia e a unica forma de
 * um portao ficar verde por nao estar olhando.
 * ================================================================================= */
function cadeiasDoPlano(plano) {
  const fora = [];
  const por = (campo, texto) => {
    if (typeof texto === 'string' && texto.trim()) fora.push({ campo, texto });
  };

  por('tema.titulo', plano.tema.titulo);
  por('tema.pergunta', plano.tema.pergunta);
  if (plano.tom) {
    por('tom.tom', plano.tom.tom);
    por('tom.pede', plano.tom.pede);
  }

  por('ritual.nome', plano.ritual.nome);
  por('ritual.gesto', plano.ritual.gesto);
  por('ritual.abertura', plano.ritual.abertura);
  plano.ritual.comoFazer.forEach((passo, i) => por(`ritual.comoFazer[${i}]`, passo));
  por('ritual.fecho', plano.ritual.fecho);

  por('reflexao.texto', plano.reflexao.texto);
  por('afirmacao.texto', plano.afirmacao.texto);
  por('contencao.texto', plano.contencao.texto);

  por('carta.nombre', plano.carta.nombre);
  por('carta.escena', plano.carta.escena);
  // So a orientacao do dia: a tela nao mostra os dois conselhos.
  por('carta.consejo', plano.carta.invertida ? plano.carta.consejoInv : plano.carta.consejo);
  por('carta.amor', plano.carta.amor);

  return fora;
}

/* O endereco de um achado, para casar com a quarentena. Ritual e carta carregam
 * o id da entrada, porque o dono conserta por id e nao por dia do ano. */
function enderecoDoAchado(plano, campo) {
  if (campo.startsWith('ritual.')) return `rituais.js:${plano.ritual.id}.${campo.slice(7)}`;
  if (campo.startsWith('carta.')) return `cartas.json:${plano.carta.id}.${campo.slice(6)}`;
  return `ano:${campo}`;
}

/* =================================================================================
 * AS QUARENTENAS — divida de outro dono, escrita com endereco e data
 * ================================================================================= */

/* datos/rituais.js — OUTRO FLUXO ESTA ESCREVENDO ESTE ARQUIVO AGORA (31/08).
 * Duas frases falam do que vem depois. Nenhuma delas fala da outra pessoa nem
 * pede contato: sao futuro sobre o proprio app ("vai dizer", "vai estar aqui"),
 * que a doutrina deste repositorio tambem nao aceita — ver o teste "nenhum texto
 * do ritual fala do futuro" em test/ritual.test.js, que cobra a mesma coisa do
 * ritual de sete dias. */
const QUARENTENA_FUTURO = Object.freeze([
  'rituais.js:cafe.abertura', // "Ninguém aqui vai dizer o que a figura é"
  'rituais.js:sonho.fecho', // "Daqui a um mês ele ainda vai estar aqui"
  'rituais.js:sonho.comoFazer[4]', // "O app não vai te dar significado nenhum"
]);

/* datos/cartas.json — o baralho, corpus do motor de leitura. Ele ja tem dois
 * portoes proprios (test/copy.test.js e test/lectura.test.js) e uma rede de
 * runtime em lib/lectura.js que varre a posicao antes de compor a leitura. O
 * ano nao vai reescrever 78 cartas; o ano registra o endereco de cada achado
 * para que a divida seja contavel e nao possa crescer sem ficar vermelha. */
const QUARENTENA_CONTATO = Object.freeze([
  'cartas.json:major-15.consejo',
  'cartas.json:major-20.consejo',
  'cartas.json:paus-08.consejo',
  'cartas.json:paus-13.consejo',
  'cartas.json:copas-10.amor',
  'cartas.json:espadas-05.consejo',
  'cartas.json:espadas-07.consejo',
  'cartas.json:espadas-12.consejo',
  'cartas.json:espadas-12.amor',
  'cartas.json:ouros-02.amor',
  'cartas.json:ouros-07.amor',
]);

const QUARENTENA_FUTURO_BARALHO = Object.freeze([
  'cartas.json:major-13.consejo',
  'cartas.json:major-15.consejo',
  'cartas.json:major-15.amor',
  'cartas.json:paus-13.consejo',
]);

/* =================================================================================
 * 0. PRE-CONDICAO — os tres motores se conferem sozinhos antes de o ano rodar
 *
 * Nao e cerimonia: se a escala de rituais perdeu um id ou um bolo de reflexoes
 * caiu abaixo de 31, TODOS os testes abaixo falham ao mesmo tempo e por motivos
 * que parecem outra coisa. Este teste faz o diagnostico chegar primeiro.
 * ================================================================================= */
test('pre-condicao: ano, escala e bancos passam nas proprias verificacoes', () => {
  const ano = verificarAno();
  assert.deepEqual(ano.problemas, [], 'lib/ano.js reprovou a si mesmo');
  assert.equal(ano.ok, true);

  const escala = verificarEscala();
  assert.deepEqual(escala.problemas, [], 'lib/rituaisRotativos.js reprovou a escala');

  assert.deepEqual(verificarBancos(), [], 'datos/bancos.js reprovou os bancos');

  /* A desigualdade que sustenta a arquitetura inteira: maior bloco (tema, fase)
   * = 9 dias, menor janela sem repetir carta = 15. Se um dia a segunda descer
   * ate 9, a quintupla passa a repetir DENTRO de um bloco e o teste 2 abaixo
   * fica vermelho — mas so depois de 365 dias de conta. Aqui a causa aparece. */
  assert.equal(menorJanelaSemRepetir(), 15, 'a janela minima do baralho mudou');
  assert.equal(ano.medidas.maiorBlocoDias, 9);
});

/* Contrato explicito que datos/bancos.js pede a este arquivo: as lunacoes de
 * arquivo (12 e 13) sao as que trabalham material ja escrito por ela, e
 * lib/ano.js grava isso em bandeira. Duas fontes para o mesmo fato so servem
 * enquanto alguem compara as duas. */
test('as lunacoes de arquivo batem com as bandeiras dos temas', () => {
  assert.deepEqual([...LUNACOES_DE_ARQUIVO], [12, 13]);
  assert.equal(TEMAS[11].apenasIndice, true, 'o tema 12 tinha de ser indice, nao entrevistador');
  assert.equal(TEMAS[12].devolveVerbatimDe, 1, 'o tema 13 devolve verbatim a linha da lunacao 1');
  for (let n = 1; n <= 13; n += 1) {
    const bandeira = TEMAS[n - 1].apenasIndice === true || TEMAS[n - 1].devolveVerbatimDe === 1;
    assert.equal(
      ehLunacaoDeArquivo(n),
      bandeira,
      `lunacao ${n}: datos/bancos.js e lib/ano.js discordam sobre ser lunacao de arquivo`
    );
  }
});

/* =================================================================================
 * 1. COBERTURA — 365 dias, nenhum buraco
 * ================================================================================= */
test('365 dias corridos devolvem plano completo: nenhum undefined, vazio ou [object Object]', () => {
  const ano = oAnoInteiro();
  assert.equal(ano.length, DIAS);

  const problemas = [];
  ano.forEach((p, i) => {
    const onde = `dia ${i + 1} (${p.dia})`;

    if (p.numeroDoDia !== i + 1) problemas.push(`${onde}: numeroDoDia ${p.numeroDoDia}`);
    if (!p.tema || typeof p.tema.numero !== 'number') problemas.push(`${onde}: sem tema`);
    if (!p.ritual || !p.ritual.id) problemas.push(`${onde}: sem ritual`);
    if (!p.reflexao) problemas.push(`${onde}: sem reflexao`);
    if (!p.afirmacao) problemas.push(`${onde}: sem afirmacao`);
    if (!p.contencao) problemas.push(`${onde}: sem contencao`);
    if (!p.carta || !p.carta.id) problemas.push(`${onde}: sem carta`);
    if (typeof p.carta.invertida !== 'boolean') problemas.push(`${onde}: orientacao indefinida`);

    // Com efemeride, o bloco do ceu vem inteiro ou nao vem — nunca pela metade.
    if (p.comCeu) {
      if (!p.fase || !p.fase.nome) problemas.push(`${onde}: ceu disponivel sem fase`);
      if (!p.tom || !p.tom.tom) problemas.push(`${onde}: ceu disponivel sem tom`);
      if (!(p.lunacao >= 1 && p.lunacao <= 13)) problemas.push(`${onde}: lunacao ${p.lunacao}`);
      if (p.semana < 1 || p.semana > 4) problemas.push(`${onde}: semana ${p.semana}`);
    }

    for (const { campo, texto } of cadeiasDoPlano(p)) {
      if (!texto.trim()) problemas.push(`${onde}: ${campo} vazio`);
      if (texto.includes('[object Object]')) problemas.push(`${onde}: ${campo} = [object Object]`);
      if (texto.includes('undefined')) problemas.push(`${onde}: ${campo} contem "undefined"`);
      if (/\{\w+\}/.test(texto)) problemas.push(`${onde}: ${campo} com placeholder nao trocado`);
    }
  });

  assert.deepEqual(problemas.slice(0, 12), [], `${problemas.length} buracos no ano`);
});

/* A varredura precisa estar olhando. Sem este teste, renomear `abertura` para
 * `intro` esvaziaria metade da superficie e todos os testes de doutrina abaixo
 * ficariam verdes por nao terem o que ler. */
test('a varredura enxerga a superficie inteira do dia', () => {
  const p = planoDoAno(0);
  const campos = cadeiasDoPlano(p).map((c) => c.campo);

  for (const esperado of [
    'tema.titulo',
    'tema.pergunta',
    'tom.tom',
    'tom.pede',
    'ritual.nome',
    'ritual.gesto',
    'ritual.abertura',
    'ritual.comoFazer[0]',
    'ritual.fecho',
    'reflexao.texto',
    'afirmacao.texto',
    'contencao.texto',
    'carta.nombre',
    'carta.escena',
    'carta.consejo',
    'carta.amor',
  ]) {
    assert.ok(campos.includes(esperado), `a varredura perdeu o campo ${esperado}`);
  }
  assert.ok(campos.length >= 16, `so ${campos.length} cadeias no dia — a varredura encolheu`);
});

/* =================================================================================
 * 2. SEM REPETICAO — a quintupla nao volta em 365 dias
 *
 * A garantia do desenho tem uma linha so: dois dias do MESMO bloco (tema, fase)
 * estao a no maximo 9 dias, e a carta nao repete em menos de 15. Aqui a linha e
 * conferida por forca bruta, com a carta DE FORA da chave — porque a prova de
 * papel usa a carta como desempate e um teste que a inclui provaria o trivial.
 * ================================================================================= */
test('a combinacao (tema, fase, ritual, reflexao, afirmacao) nao se repete em 365 dias', (t) => {
  const ano = oAnoInteiro();
  const vistos = new Map();
  const choques = [];

  for (const p of ano) {
    const chave = [
      p.tema.id,
      p.tom ? p.tom.id : 'sem-fase',
      p.ritual.id,
      p.reflexao.id,
      p.afirmacao.id,
    ].join(' | ');
    if (vistos.has(chave)) choques.push(`${vistos.get(chave)} e ${p.dia}: ${chave}`);
    else vistos.set(chave, p.dia);
  }

  t.diagnostic(`combinacoes distintas: ${vistos.size} de ${DIAS} dias`);
  assert.deepEqual(choques, [], 'a quintupla se repetiu dentro do ano');
  assert.equal(vistos.size, DIAS);
});

/* =================================================================================
 * 3. SEM REPETICAO PROXIMA — nada volta dentro da mesma lunacao
 *
 * A distancia que importa nao e a do ano, e a da lunacao: a mesma pergunta duas
 * vezes em vinte dias e percebida; a mesma pergunta com onze meses de intervalo
 * nao e. O agrupamento e por `lunacaoAbsoluta` (que nao volta a 1) e nao por
 * `lunacao` — senao a lunacao 1 do ano 1 e a 14a se misturariam na mesma cesta.
 * ================================================================================= */
test('reflexao e afirmacao nao caem duas vezes dentro da mesma lunacao', () => {
  const ano = oAnoInteiro();
  const cestas = new Map();
  const choques = [];

  for (const p of ano) {
    if (!cestas.has(p.lunacaoAbsoluta)) {
      cestas.set(p.lunacaoAbsoluta, { reflexoes: new Map(), afirmacoes: new Map(), dias: 0 });
    }
    const cesta = cestas.get(p.lunacaoAbsoluta);
    cesta.dias += 1;

    if (cesta.reflexoes.has(p.reflexao.id)) {
      choques.push(
        `lunacao ${p.lunacaoAbsoluta}: reflexao "${p.reflexao.id}" em ${cesta.reflexoes.get(p.reflexao.id)} e ${p.dia}`
      );
    }
    if (cesta.afirmacoes.has(p.afirmacao.id)) {
      choques.push(
        `lunacao ${p.lunacaoAbsoluta}: afirmacao "${p.afirmacao.id}" em ${cesta.afirmacoes.get(p.afirmacao.id)} e ${p.dia}`
      );
    }
    cesta.reflexoes.set(p.reflexao.id, p.dia);
    cesta.afirmacoes.set(p.afirmacao.id, p.dia);
  }

  // A prova de datos/bancos.js so vale se a lunacao couber em 31 dias civis.
  // Uma cesta maior que isso quer dizer que a lua foi medida errado, e a garantia
  // do bolo de 31 deixa de valer sem ninguem tocar no banco.
  for (const [numero, cesta] of cestas) {
    assert.ok(cesta.dias <= 31, `lunacao ${numero} tocou ${cesta.dias} dias civis — o piso de 31 nao cobre`);
  }
  assert.deepEqual(choques, [], 'material repetido dentro de uma lunacao');
});

/* =================================================================================
 * 4. ROTACAO DE RITUAL — o gesto nunca abre dois dias iguais
 *
 * Cinco rituais numa janela de nove dias repetem por casa dos pombos, e devem:
 * o gesto precisa ficar familiar. O unico caso intoleravel e o dia seguinte, e
 * a escala de 12 posicoes de lib/rituaisRotativos.js o impede por propriedade da
 * fila (inclusive na volta da posicao 11 para a 0), sem estado nenhum.
 * ================================================================================= */
test('o mesmo ritual nao cai dois dias seguidos em nenhum dos 365', () => {
  const ano = oAnoInteiro();
  const choques = [];
  for (let i = 1; i < ano.length; i += 1) {
    if (ano[i].ritual.id === ano[i - 1].ritual.id) {
      choques.push(`${ano[i - 1].dia} e ${ano[i].dia}: "${ano[i].ritual.id}" duas vezes`);
    }
  }
  assert.deepEqual(choques, [], 'ritual repetido em dias consecutivos');

  // E todos os cinco aparecem: ritual escrito e nunca exibido e trabalho jogado
  // fora, e ninguem descobre olhando a tela.
  assert.equal(new Set(ano.map((p) => p.ritual.id)).size, 5);
});

/* =================================================================================
 * 5. CEU INDISPONIVEL — o ano continua inteiro, e o app fica CALADO sobre a lua
 *
 * Esta e a regra mais facil de furar pelo avesso. Sem efemeride a tentacao e
 * dizer "aproximadamente minguante" — e "aproximadamente" e o momento em que o
 * app comeca a fabricar ceu. A saida certa e o silencio: o dia roda inteiro por
 * aritmetica, o tema vem da caixa etiquetada, e nenhuma palavra de lua aparece.
 *
 * A injecao e em lib/ceu.js e nao em lib/ano.js de proposito: lib/ano.js obedece
 * a ceu.js (`motorDoAno` comeca perguntando `hayEfemeride()`), e apagar o ceu na
 * fonte prova essa obediencia junto.
 * ================================================================================= */
test('com o ceu apagado, os 365 dias continuam inteiros e sem uma linha de lua', () => {
  _inyectarCielo(false);
  _reiniciarAnoParaTests();
  try {
    const ano = oAnoInteiro();
    const problemas = [];

    // "Lua Nova", "Quarto Crescente"... — os rotulos que so um ceu medido pode
    // produzir. Nenhum deles pode aparecer em campo nenhum do dia.
    const rotulos = FASES.map((f) => (typeof f === 'string' ? f : f.nome)).filter(Boolean);
    const inventando = [
      /aproximadament/i,
      /aproximad[oa]/i,
      /estimad[oa]/i,
      /por volta d[aeo]/i,
      /provavelment/i,
      /\bdeve estar\b/i,
      ...rotulos.map((r) => new RegExp(r.replace(/\s+/g, '\\s+'), 'i')),
    ];

    ano.forEach((p, i) => {
      const onde = `dia ${i + 1} (${p.dia})`;

      // 1. o dia continua inteiro
      if (p.numeroDoDia !== i + 1) problemas.push(`${onde}: numeroDoDia ${p.numeroDoDia}`);
      if (!p.tema) problemas.push(`${onde}: sem tema com o ceu apagado`);
      if (!p.ritual || !p.ritual.id) problemas.push(`${onde}: sem ritual`);
      if (!p.reflexao || !p.afirmacao || !p.contencao) problemas.push(`${onde}: banco vazio`);
      if (!p.carta || !p.carta.id) problemas.push(`${onde}: sem carta`);

      // 2. e o ceu nao existe — nem pela metade, nem "mais ou menos"
      if (p.comCeu) problemas.push(`${onde}: ceu disponivel com o motor apagado`);
      if (p.fase !== null) problemas.push(`${onde}: fase inventada`);
      if (p.tom !== null) problemas.push(`${onde}: tom de fase sem fase medida`);
      if (p.lunacao !== null) problemas.push(`${onde}: numero de lunacao sem lua medida`);
      if (p.apresentavelComoLua !== false) problemas.push(`${onde}: aproximacao apresentavel como lua`);
      if (p.origemDoTema !== ORIGENS_DO_TEMA.DIAS_CORRIDOS) {
        problemas.push(`${onde}: origemDoTema "${p.origemDoTema}" com o ceu apagado`);
      }
      if (p.motivo !== MOTIVOS.MOTOR_INDISPONIVEL) problemas.push(`${onde}: motivo "${p.motivo}"`);

      // 3. e nenhuma palavra de ceu vazou para o texto
      for (const { campo, texto } of cadeiasDoPlano(p)) {
        for (const padrao of inventando) {
          if (padrao.test(texto)) problemas.push(`${onde}: ${campo} fala de ceu sem medida — ${padrao}`);
        }
      }
    });

    assert.deepEqual(problemas.slice(0, 12), [], `${problemas.length} problemas com o ceu apagado`);
  } finally {
    _reiniciarCieloParaTests();
    _reiniciarAnoParaTests();
  }
});

/* =================================================================================
 * 6. DOUTRINA EM 365 DIAS — o teste mais importante deste arquivo
 *
 * 365 dias e superficie demais para conferir a olho, e o dia que machuca e
 * sempre o que ninguem leu. Os dois estados duros sao os unicos que importam
 * aqui: quem escreveu e nao teve resposta, e quem esta em contato zero. Para
 * essas duas, uma unica frase que empurre para fora e o app entregando o dano
 * que ele existe para evitar.
 *
 * O dia do ano NAO muda com a resposta do onboarding — tema, fase, ritual e
 * banco saem da data, e essa independencia e proposital (o arco nao e empurrado
 * pela presenca nem pela situacao dela). E exatamente por isso que a varredura
 * roda para os dois estados: se um dia alguem ramificar o conteudo por estado, o
 * portao ja esta cobrindo os dois lados da ramificacao.
 * ================================================================================= */
const ESTADOS_DUROS = Object.freeze(['sem-contato', 'escrevi-sem-resposta']);

test('nenhum dos 365 dias sugere contato, em nenhum dos dois estados duros', () => {
  const ano = oAnoInteiro();
  const foraDaQuarentena = [];
  const dentro = new Set();

  for (const estado of ESTADOS_DUROS) {
    for (const p of ano) {
      for (const { campo, texto } of cadeiasDoPlano(p)) {
        if (!sugiereContacto(texto)) continue;
        const endereco = enderecoDoAchado(p, campo);
        if (QUARENTENA_CONTATO.includes(endereco)) {
          dentro.add(endereco);
          continue;
        }
        foraDaQuarentena.push(`${estado} / ${p.dia} / ${endereco}: "${texto}"`);
      }
    }
  }

  assert.deepEqual(
    [...new Set(foraDaQuarentena)].slice(0, 10),
    [],
    'Um dia do ano empurra a usuaria para fora. Para quem esta em contato zero ou '
      + 'escreveu sem resposta, isso e o app entregando o dano que ele existe para '
      + `evitar. ${foraDaQuarentena.length} ocorrencias.`
  );

  // A quarentena so pode encolher. Se ela crescer, a lista acima ja ficou
  // vermelha; se um endereco sair dela, o dono consertou e o portao segue verde.
  for (const endereco of dentro) {
    assert.ok(QUARENTENA_CONTATO.includes(endereco), `${endereco} escapou da quarentena`);
  }
});

test('nenhum dos 365 dias fala do futuro, fora da divida declarada', () => {
  const ano = oAnoInteiro();
  const perdoados = new Set([...QUARENTENA_FUTURO, ...QUARENTENA_FUTURO_BARALHO]);
  const novos = [];

  for (const p of ano) {
    for (const { campo, texto } of cadeiasDoPlano(p)) {
      if (!hablaDelFuturo(texto)) continue;
      const endereco = enderecoDoAchado(p, campo);
      if (perdoados.has(endereco)) continue;
      novos.push(`${p.dia} / ${endereco}: "${texto}"`);
    }
  }

  assert.deepEqual(
    [...new Set(novos)].slice(0, 10),
    [],
    'Texto novo falando do que vem depois. O dia descreve hoje e devolve um gesto; '
      + `nunca o depois. ${novos.length} ocorrencias.`
  );
});

/* Os bancos do ANO — reflexoes, afirmacoes, contencoes — nao tem quarentena e
 * nao vao ter. Sao o material que este arco escreve, e o portao e absoluto ali:
 * eles sao a unica superficie do dia que este fluxo controla inteira. */
test('os tres bancos do ano estao limpos, sem quarentena nenhuma', () => {
  const ano = oAnoInteiro();
  const sujos = [];
  for (const p of ano) {
    for (const { campo, texto } of cadeiasDoPlano(p)) {
      if (!campo.startsWith('reflexao') && !campo.startsWith('afirmacao') && !campo.startsWith('contencao')) {
        continue;
      }
      if (sugiereContacto(texto)) sujos.push(`${p.dia} ${campo} (contato): "${texto}"`);
      if (hablaDelFuturo(texto)) sujos.push(`${p.dia} ${campo} (futuro): "${texto}"`);
    }
  }
  assert.deepEqual([...new Set(sujos)].slice(0, 10), [], `${sujos.length} ocorrencias nos bancos do ano`);
});

/* =================================================================================
 * 7. AS AFIRMACOES — sobre ela, e sobre mais ninguem
 *
 * A afirmacao e a unica frase do dia escrita na PRIMEIRA pessoa, e por isso e a
 * mais perigosa: "eu sei que essa pessoa volta" tem a mesma forma gramatical de
 * "eu consigo passar por hoje" e o oposto exato do efeito. Duas linhas, as duas
 * cobradas sobre o banco inteiro e nao so sobre os dias sorteados — um texto que
 * so aparece no dia 400 tem de estar limpo hoje.
 * ================================================================================= */

/* Falar DA outra pessoa. Pronome solto nao entra: em portugues "ela" retoma
 * substantivo feminino ("a memória... ela é minha") e uma regra ampla apagaria
 * frase boa. So casa pronome com verbo de intencao, pronome com preposicao
 * (que so cabe em pessoa) e os substantivos que nomeiam alguem.
 * O plural "neles/nelas" fica FORA de proposito: a outra pessoa e uma, e o app
 * nunca assume o genero dela — "as minhas amizades... chegar nelas" e a frase
 * que a regra ampla matava. */
const FALA_DA_OUTRA_PESSOA = Object.freeze([
  /\b(dele|dela|nele|nela)\b/i,
  /\b(com|pra|para|por|at[ée]|sobre|de|em)\s+(ele|ela|eles|elas)\b/i,
  /\b(ele|ela|eles|elas)\s+(te|me|vai|v[ãa]o|quer|sente|pensa|volta|voltou|procura|procurou|ligou|escreveu|precisa|sabe|entende|merece)\b/i,
  /\bessa pessoa\b/i,
  /\ba outra pessoa\b/i,
  /\b(o|a) ex\b/i,
  /\b(namorad[oa]|marido|esposa|companheir[oa]|parceir[oa])\b/i,
]);

/* Afirmar desfecho. Herda o vocabulario de test/copy.test.js em vez de inventar
 * sinonimos: duas listas diferentes para a mesma regra e como uma delas para de
 * ser atualizada. */
const AFIRMA_DESFECHO = Object.freeze([
  /\bvoltar[aá]\b/i,
  /\bvai voltar\b/i,
  /\bvai te (procurar|buscar|chamar|ligar)\b/i,
  /\bcom certeza (volta|vai|d[áa])\b/i,
  /\bvai dar certo\b/i,
  /\breconquist/i,
  /\bgarante(mos)? que\b/i,
  /\bno fim (das contas )?(volta|d[áa] certo)\b/i,
  /\btudo (vai|se) (voltar|resolver|ajeitar)\b/i,
]);

test('nenhuma afirmacao menciona a outra pessoa nem afirma desfecho', () => {
  const achados = [];

  for (const a of AFIRMACOES) {
    for (const padrao of FALA_DA_OUTRA_PESSOA) {
      const m = a.texto.match(padrao);
      if (m) achados.push(`AFIRMACOES."${a.id}" fala da outra pessoa ("${m[0]}"): ${a.texto}`);
    }
    for (const padrao of AFIRMA_DESFECHO) {
      const m = a.texto.match(padrao);
      if (m) achados.push(`AFIRMACOES."${a.id}" afirma desfecho ("${m[0]}"): ${a.texto}`);
    }
    // As guardas do produto, sobre a mesma frase.
    if (sugiereContacto(a.texto)) achados.push(`AFIRMACOES."${a.id}" sugere contato: ${a.texto}`);
    if (hablaDelFuturo(a.texto)) achados.push(`AFIRMACOES."${a.id}" fala do futuro: ${a.texto}`);
  }

  assert.deepEqual(
    achados,
    [],
    'A afirmacao e a unica frase do dia na primeira pessoa. Ela fala de quem le, '
      + `nunca de quem foi embora, e nunca do que vai acontecer.\n  ${achados.join('\n  ')}`
  );

  // A varredura tem de ter tido o que ler.
  assert.ok(AFIRMACOES.length >= 31, `so ${AFIRMACOES.length} afirmacoes — abaixo do piso da lunacao`);

  // E a rede tem de estar armada: se os padroes acima parassem de casar com
  // qualquer coisa, o teste ficaria verde por nao estar olhando.
  assert.ok(FALA_DA_OUTRA_PESSOA.some((p) => p.test('Eu sei que ele volta.')));
  assert.ok(AFIRMA_DESFECHO.some((p) => p.test('Eu vou reconquistar o que era meu.')));
});

/* A contencao e o gesto para o momento em que bate a vontade de mandar. Ela e o
 * FREIO, e o freio nao pode carregar o empurrao: "manda a mensagem" numa
 * contencao e a pior linha possivel deste app. */
test('nenhuma contencao empurra para fora, e o gesto nao sai do aparelho', () => {
  const achados = [];
  for (const c of CONTENCOES) {
    if (sugiereContacto(c.texto)) achados.push(`CONTENCOES."${c.id}" sugere contato: ${c.texto}`);
    if (hablaDelFuturo(c.texto)) achados.push(`CONTENCOES."${c.id}" fala do futuro: ${c.texto}`);
  }
  assert.deepEqual(achados, [], `Contencao que empurra.\n  ${achados.join('\n  ')}`);
  assert.ok(CONTENCOES.length >= 31, `so ${CONTENCOES.length} contencoes — abaixo do piso da lunacao`);
});

/* =================================================================================
 * 8. DETERMINISMO — a mesma data de inicio entrega o mesmo ano, sempre
 *
 * Sem isto, nada acima significa nada: um ano que muda entre duas leituras nao
 * pode ser garantido por medida nenhuma. E e a propriedade que a arquitetura
 * promete de graca — aritmetica de dia, sem Math.random, sem storage, sem
 * relogio de parede — entao ela precisa de um teste que a cobre, ou o primeiro
 * `Math.random()` bem-intencionado entra sem barulho.
 * ================================================================================= */
test('a mesma data de inicio produz o mesmo ano inteiro, duas vezes seguidas', () => {
  const primeira = oAnoInteiro();
  const segunda = oAnoInteiro();

  assert.equal(primeira.length, segunda.length);
  for (let i = 0; i < primeira.length; i += 1) {
    const a = primeira[i];
    const b = segunda[i];
    const resumo = (p) => ({
      dia: p.dia,
      tema: p.tema.id,
      tom: p.tom ? p.tom.id : null,
      lunacao: p.lunacao,
      ritual: p.ritual.id,
      reflexao: p.reflexao.id,
      afirmacao: p.afirmacao.id,
      contencao: p.contencao.id,
      carta: p.carta.id,
      invertida: p.carta.invertida,
    });
    assert.deepEqual(resumo(b), resumo(a), `o dia ${i + 1} mudou entre duas leituras`);
  }
});

/* O ano 2 nao pode repetir as datas do ano 1. Doze lunacoes somam 354,37 dias e
 * o ano civil tem 365,2422: a defasagem de ~11 dias e o que impede o calendario
 * de virar um loop de 365 casas. Se um dia alguem "simplificar" o motor para um
 * vetor indexado por dia-do-ano, ESTE teste e o que cai. */
test('nenhuma data do ano 2 recebe a mesma quintupla que recebeu no ano 1', () => {
  const doisAnos = oAnoInteiro(730);
  const choques = [];
  for (let i = 0; i < 365; i += 1) {
    const a = doisAnos[i];
    const b = doisAnos[i + 365];
    const chave = (p) => [p.tema.id, p.tom ? p.tom.id : '-', p.ritual.id, p.reflexao.id, p.afirmacao.id].join('|');
    if (chave(a) === chave(b)) choques.push(`${a.dia} e ${b.dia}: ${chave(a)}`);
  }
  assert.deepEqual(choques, [], 'o calendario virou um loop de 365 casas');
});
