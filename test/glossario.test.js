// test/glossario.test.js
// O TESTE DE COMPREENSÃO — o que faltava nos três contratos de tom.
//
// lib/rituais.js, lib/jornada.js e lib/calendarioCosmico.js têm, cada um, um
// teste que garante a ORDEM do texto: povão abre, recibo fecha. Nenhum dos três
// garantia que a metade povão está em português que se entende. Por isso
// atravessaram intactos, até 31/07/2026, termos como "kentra", "nascer
// acrônico", "debilidade acidental", "efeméride", "ordem caldaica", "lastro" e
// "lua muda" — todos na parte do texto que existe justamente para ser a fácil.
//
// A REGRA, e ela já existia sozinha no repo: lib/lunarCalendar.js escreve
// "Quase cheia (é isso que «gibosa» quer dizer: mais de meia Lua já iluminada)".
// Na PRIMEIRA vez que um termo técnico aparece dentro de uma PEÇA, ele vem
// seguido de glosa. Nas outras, não precisa.
//
// O que é uma PEÇA: a unidade que a pessoa lê de uma vez, sozinha, sem as
// outras ao lado. Um ritual (com seus cinco campos), um bloco de lastro, uma
// categoria, um dia de trilha, uma medalha, um evento do calendário. Glosar
// "por arquivo" não serviria de nada: quem abre o card do ritual de quinta não
// viu o card de segunda.
//
// A JANELA é de 120 caracteres depois da ocorrência, e não de 80, por um caso
// real: a medalha "Guardião da Efeméride" tem o termo no NOME e a glosa na
// legenda, depois do fato contável. 80 cortaria a glosa por três caracteres.
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  RITUAIS,
  CATEGORIAS,
  LASTRO_MOMENTO_IDEAL,
  textoCompartilhavel,
} = require('../lib/rituais.js');
const { TRILHAS, MEDALHAS, MEDALHAS_JORNADA } = require('../lib/jornada.js');
const { calendarioCosmico } = require('../lib/calendarioCosmico.js');

const JANELA = 120;

// Cada termo traz o motivo de estar aqui — a lista não é de palavras difíceis em
// geral, é das que ESTE produto usa e que o leitor de 19 anos não tem como
// adivinhar. `padrao` é o que se procura; `nome` é como o erro é reportado.
const TERMOS = [
  ['efeméride', /efem[ée]ride/i],
  ['caldaica', /caldaica/i],
  ['gibosa', /gibosa/i],
  ['eletiva', /eletiva/i],
  ['ikhtiyārāt', /ikhtiy[āa]r[āa]t/i],
  ['kentra', /kentra/i],
  ['daimon', /daimon/i],
  ['luminares', /luminares/i],
  ['acrônico', /acr[ôo]nico/i],
  ['estação (de planeta)', /(primeira|segunda) esta[çc][ãa]o/i],
  ['debilidade acidental', /debilidade acidental/i],
  ['interlúnio', /interl[úu]nio/i],
  ['lua muda', /lua muda/i],
  ['caracterologia', /caracterologia/i],
  ['lunisolar', /lunisolar/i],
  ['arcanos maiores', /arcanos maiores/i],
  ['vaza', /\bvaza\b/i],
  ['lastro', /\blastro\b/i],
];

// A glosa pode vir de três formas, todas já usadas no repo: travessão, aposto
// entre parênteses, ou a fórmula explícita ("quer dizer", "é a", "era o", "o
// nome romano para"). O teste não exige uma delas em particular — exige que
// alguma apareça logo depois do termo.
const MARCA_DE_GLOSA = /—|–|\(|,\s|:|\bquer dizer\b|\b[ée]\b|\bera\b|\bs[ãa]o\b|\beram\b/;

function temGlosa(texto, indiceDepoisDoTermo) {
  const janela = texto.slice(indiceDepoisDoTermo, indiceDepoisDoTermo + JANELA);
  // O piso de tamanho existe para que um ponto final ou uma vírgula solta não
  // contem como tradução. "kentra, os pivôs." tem 11 caracteres e é uma glosa
  // legítima — por isso o piso é baixo e a marca é que faz o trabalho.
  return MARCA_DE_GLOSA.test(janela) && janela.trim().length > 6;
}

// Verifica UMA peça: os textos dela são concatenados na ordem em que a tela os
// mostra, e a primeira ocorrência de cada termo é a que precisa da glosa.
function conferirPeca(onde, textos, erros) {
  const inteiro = textos.filter((t) => typeof t === 'string' && t.length).join(' \n ');
  for (const [nome, padrao] of TERMOS) {
    const m = inteiro.match(padrao);
    if (!m) continue;
    const fim = m.index + m[0].length;
    if (!temGlosa(inteiro, fim)) {
      erros.push(
        `${onde}: "${nome}" aparece sem tradução nos ${JANELA} caracteres seguintes.\n` +
          `      Trecho: …${inteiro.slice(Math.max(0, m.index - 40), fim + 90)}…`
      );
    }
  }
}

test('nenhum termo técnico chega à tela sem tradução na primeira vez que aparece na peça', () => {
  const erros = [];

  // --- lib/rituais.js: cada ritual, cada categoria, cada bloco de lastro -----
  for (const r of RITUAIS) {
    conferirPeca(
      `ritual:${r.id}`,
      [
        r.titulo,
        r.intencao,
        ...(r.materiais || []),
        ...(r.passos || []),
        r.momento && r.momento.texto,
        r.cuidados,
        ...(r.naoTemFonte || []),
        textoCompartilhavel(r),
      ],
      erros
    );
  }
  for (const c of CATEGORIAS) conferirPeca(`categoria:${c.id}`, [c.nome, c.descricao], erros);
  for (const [id, b] of Object.entries(LASTRO_MOMENTO_IDEAL)) {
    conferirPeca(`lastro:${id}`, [b.titulo, b.texto, ...(b.ressalvas || [])], erros);
  }

  // --- lib/jornada.js: cada dia de trilha, cada medalha ---------------------
  for (const t of TRILHAS) {
    conferirPeca(`trilha:${t.id}`, [t.nome, t.subtitulo], erros);
    for (const d of t.dias) {
      conferirPeca(
        `trilha:${t.id}.dia${d.dia}`,
        [d.titulo, d.leitura, d.pergunta, d.acao && d.acao.texto],
        erros
      );
    }
  }
  for (const m of [...MEDALHAS, ...MEDALHAS_JORNADA]) {
    conferirPeca(`medalha:${m.id}`, [m.nome, m.legenda], erros);
  }

  // --- lib/calendarioCosmico.js: cada evento distinto de dois anos ----------
  const vistos = new Map();
  for (let ano = 2024; ano <= 2025; ano++) {
    for (let mes = 1; mes <= 12; mes++) {
      for (const e of calendarioCosmico(ano, mes).eventos) {
        const chave = `${e.tipo}|${e.titulo}`;
        if (!vistos.has(chave)) vistos.set(chave, e);
      }
    }
  }
  assert.ok(vistos.size >= 8, 'o corpus do calendário não montou — o teste perderia o sentido');
  for (const [chave, e] of vistos) {
    conferirPeca(
      `calendario:${chave}`,
      [e.titulo, e.paragrafo, e.tradicao && e.tradicao.texto, e.avisoDeIdade],
      erros
    );
  }

  assert.deepEqual(
    erros,
    [],
    'Termo técnico sem glosa na primeira ocorrência da peça. O padrão está em ' +
      'lib/lunarCalendar.js ("é isso que «gibosa» quer dizer: ..."): traduza inline, ' +
      'com travessão, parênteses ou "quer dizer".\n  ' +
      erros.join('\n  ')
  );
});

test('a lista de termos MORDE — ela pega a frase sem glosa que existe pra pegar', () => {
  // Uma varredura que nunca pega nada passa a vida verde e não protege ninguém.
  const DEVE_PEGAR = [
    ['efeméride', 'dá pra conferir em qualquer efeméride'],
    ['kentra', 'Os gregos chamavam de kentra.'],
    ['estação', 'É a chamada segunda estação.'],
    ['lastro', 'a prática tem lastro documentado'],
  ];
  for (const [nome, frase] of DEVE_PEGAR) {
    const erros = [];
    conferirPeca('teste', [frase], erros);
    assert.equal(erros.length, 1, `a varredura deixou passar "${nome}" em: ${frase}`);
  }

  // E o contrário: a versão glosada não pode disparar, senão o teste vira ruído
  // e alguém o desliga.
  const NAO_PODE_PEGAR = [
    'dá pra conferir em qualquer efeméride — as tabelas de posição dos planetas que astrônomo e astrólogo usam igual',
    'Os gregos chamavam de kentra, os pivôs.',
    'É a chamada segunda estação — o dia em que o planeta parece parar antes de retomar o rumo.',
    'com a lua muda — o nome romano para a Lua Nova, quando ela não aparece no céu',
  ];
  for (const frase of NAO_PODE_PEGAR) {
    const erros = [];
    conferirPeca('teste', [frase], erros);
    assert.deepEqual(erros, [], `falso positivo em: ${frase}`);
  }
});
