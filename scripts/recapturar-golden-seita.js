// RECAPTURA DO GOLDEN DA SEITA — deliberada, nunca automática.
//
// test/golden/seita.pt.golden.json trava a prosa em português byte a byte. Ele
// existe pra que uma mudança de texto NUNCA passe despercebida, então este
// script não roda sozinho em lugar nenhum: quem muda o texto de propósito
// chama ele na mão, LÊ o diff que ele imprime, e só então confirma com
// --confirmar.
//
// Uso:
//   node -r ./test/setup.js scripts/recapturar-golden-seita.js              (só mostra)
//   node -r ./test/setup.js scripts/recapturar-golden-seita.js --confirmar  (grava)
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const S = require('../lib/seita.js');

const RAIZ = path.join(__dirname, '..');
const CAMINHO = path.join(RAIZ, 'test', 'golden', 'seita.pt.golden.json');
const GOLDEN = JSON.parse(fs.readFileSync(CAMINHO, 'utf8'));

const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
// IDÊNTICO ao canon de test/seita.test.js — e tem que continuar sendo. Ele
// arredonda em 6 casas (senão o último bit do float viraria "mudança de
// texto") e ordena as chaves (pra o hash não depender da ordem de inserção).
// Se um dia divergir, este script grava um golden que o teste rejeita.
function canon(v) {
  if (typeof v === 'number') return Number(v.toFixed(6));
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = canon(v[k]);
    return o;
  }
  return v;
}

const CIDADES = { SP: GOLDEN.cidades.SP, NY: GOLDEN.cidades.NY };

// A MESMA LISTA E A MESMA ORDEM do teste (linha 52 de test/seita.test.js).
// A ordem importa de verdade: `linhas` é um objeto, JSON.stringify respeita a
// ordem de inserção, e o hash é feito em cima dela. Deduzir a lista a partir
// das chaves do golden dava o mesmo CONJUNTO em outra ORDEM — e outro hash.
const TODOS_OS_PLANETAS = [...S.ORDEM_DOS_SETE, ...Object.keys(S.MODERNOS)];

function recapturar() {
  const pares = {};
  // As entradas moram em GOLDEN.casos ([data, hora, cidade]); GOLDEN.pares
  // guarda o RESULTADO capturado de cada uma. Mesma leitura do teste.
  for (const [chave, [data, hora, cid]] of Object.entries(GOLDEN.casos)) {
    pares[chave] = canon(S.seitaDoMapa(data, hora, CIDADES[cid]));
  }
  const semDado = {
    'sem-data': canon(S.seitaDoMapa(null, '14:30', CIDADES.SP)),
    'sem-hora': canon(S.seitaDoMapa('1990-06-15', null, CIDADES.SP)),
    'sem-cidade': canon(S.seitaDoMapa('1990-06-15', '14:30', null)),
    'data-impossivel': canon(S.seitaDoMapa('1990-02-30', '14:30', CIDADES.SP)),
  };
  const varredura = {};
  for (const cid of ['SP', 'NY']) {
    for (const d of GOLDEN.varreduraDatas) {
      for (const h of GOLDEN.varreduraHoras) varredura[`${cid}|${d}|${h}`] = canon(S.seitaDoMapa(d, h, CIDADES[cid]));
    }
  }
  const mapaDia = S.seitaDoMapa('1990-06-15', '14:30', CIDADES.SP);
  const mapaNoite = S.seitaDoMapa('1990-06-15', '23:30', CIDADES.SP);
  const linhas = {};
  for (const nome of TODOS_OS_PLANETAS) {
    linhas[`${nome}|mapa-diurno`] = canon(S.linhaDeSeita(nome, mapaDia));
    linhas[`${nome}|mapa-noturno`] = canon(S.linhaDeSeita(nome, mapaNoite));
    linhas[`${nome}|so-diurno`] = canon(S.linhaDeSeita(nome, 'diurno'));
    linhas[`${nome}|so-noturno`] = canon(S.linhaDeSeita(nome, 'noturno'));
    linhas[`${nome}|sem-mapa`] = canon(S.linhaDeSeita(nome, null));
  }
  return { pares, semDado, varredura, linhas };
}

// Percorre os dois objetos em paralelo e lista só as folhas que mudaram.
function diferencas(velho, novo, trilha = [], saida = []) {
  if (typeof velho !== 'object' || velho === null || typeof novo !== 'object' || novo === null) {
    if (JSON.stringify(velho) !== JSON.stringify(novo)) saida.push({ campo: trilha.join('.'), velho, novo });
    return saida;
  }
  for (const k of new Set([...Object.keys(velho), ...Object.keys(novo)])) {
    diferencas(velho[k], novo[k], [...trilha, k], saida);
  }
  return saida;
}

const nova = recapturar();
const difs = diferencas(GOLDEN.pares, nova.pares);

console.log('=== campos que mudaram nos casos de referência ===\n');
const vistos = new Set();
for (const d of difs) {
  const assinatura = `${String(d.velho).slice(0, 40)}=>${String(d.novo).slice(0, 40)}`;
  if (vistos.has(assinatura)) continue;
  vistos.add(assinatura);
  console.log('  campo : %s', d.campo);
  console.log('  antes : %s', String(d.velho).slice(0, 200));
  console.log('  agora : %s\n', String(d.novo).slice(0, 200));
}
console.log('%d folhas mudaram, %d mudanças distintas.\n', difs.length, vistos.size);

if (!process.argv.includes('--confirmar')) {
  console.log('Nada foi gravado. Se o diff acima é o que você queria, rode de novo com --confirmar.');
  process.exit(0);
}

// IDÊNTICO ao apenasTexto de test/seita.test.js. Ele NÃO remove números: junta
// só as STRINGS numa lista e troca cada numeral por "<n>" dentro delas. É isso
// que faz o hash de texto sobreviver a uma atualização de efeméride (o "46,0
// graus" vira "<n>,<n> graus") enquanto ainda pega qualquer palavra trocada.
//
// Minha primeira versão devolvia um objeto com os números anulados — parecia
// equivalente e dava outro hash, e o teste continuou vermelho até eu ler o
// original em vez de deduzir.
function apenasTexto(v, saida) {
  if (typeof v === 'string') saida.push(v.replace(/\d+([.,]\d+)?/g, '<n>'));
  else if (Array.isArray(v)) v.forEach((x) => apenasTexto(x, saida));
  else if (v && typeof v === 'object') for (const k of Object.keys(v).sort()) apenasTexto(v[k], saida);
  return saida;
}

GOLDEN.pares = nova.pares;
GOLDEN.semDado = nova.semDado;
GOLDEN.linhas = nova.linhas;
GOLDEN.hashTexto = sha(apenasTexto(nova, []));
GOLDEN.hashCompleto = sha(nova);
fs.writeFileSync(CAMINHO, JSON.stringify(GOLDEN, null, 2) + '\n', 'utf8');
console.log('golden regravado: %s', path.relative(RAIZ, CAMINHO));
