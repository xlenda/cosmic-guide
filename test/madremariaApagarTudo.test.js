// O "APAGAR MEUS DADOS" LEVA A MADRE MARIA JUNTO (11/09/2026).
//
// ===========================================================================
// A TERCEIRA VEZ DO MESMO DEFEITO — leia antes de mexer em deleteAllCoupleData
// ===========================================================================
// Esta e a terceira vez que dado sobrevive ao "Apagar meus dados" neste app,
// sempre pelo mesmo motivo estrutural:
//
//   01/08/2026  'cosmic-active-days' ficava para tras
//   11/09/2026  'cosmic-active-types' ficava para tras
//   11/09/2026  as 24 chaves da Madre Maria embutida ficavam para tras
//
// As duas primeiras foram consertadas acrescentando UMA LINHA a lista literal
// de keysToRemove. O defeito voltou nas duas vezes seguintes porque a lista
// literal E o defeito: toda chave nova nasce fora dela, ninguem e avisado, e o
// sintoma (dado intimo sobrevivendo) e invisivel de dentro do app.
//
// Por isso o conserto desta vez foi POR PREFIXO, e e isso que este arquivo
// vigia: a varredura tem de pegar chave que este teste NUNCA VIU — senao ela
// nao e varredura, e uma lista disfarcada.
//
// O QUE A MADRE GUARDA, e por que nao pode ficar num aparelho emprestado ou
// vendido: as respostas do onboarding dela (quem terminou com quem, ha quanto
// tempo, se houve bloqueio), o nome, a data de nascimento, o diario dos dias, o
// registro do que a pessoa ouviu.
process.env.TZ = 'America/Sao_Paulo';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

// --- mocks (mesmo padrao de test/atividadeTipos.test.js) --------------------
const mem = { async: new Map(), falharGetAllKeys: false };

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return mem.async.has(k) ? mem.async.get(k) : null;
    },
    async setItem(k, v) {
      mem.async.set(k, v);
    },
    async removeItem(k) {
      mem.async.delete(k);
    },
    async multiRemove(keys) {
      keys.forEach((k) => mem.async.delete(k));
    },
    /* O mock PRECISA ter getAllKeys: sem ele a varredura por prefixo cairia no
     * catch de deleteAllCoupleData e este teste passaria sem provar nada — o
     * portao decorativo que este projeto ja pegou antes. */
    async getAllKeys() {
      if (mem.falharGetAllKeys) throw new Error('getAllKeys falhou');
      return [...mem.async.keys()];
    },
  },
};

const secureStoreMock = {
  __esModule: true,
  async getItemAsync() {
    throw new Error('sem SecureStore');
  },
  async setItemAsync() {
    throw new Error('sem SecureStore');
  },
  async deleteItemAsync() {
    throw new Error('sem SecureStore');
  },
};

const reactNativeMock = { __esModule: true, Platform: { OS: 'node' } };

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'expo-secure-store') return secureStoreMock;
  if (request === 'react-native') return reactNativeMock;
  return originalLoad.call(this, request, parent, isMain);
};

const { deleteAllCoupleData } = require('../lib/coupleData.js');
const { PREFIJO } = require('../madremaria/lib/almacen.js');

/** As chaves da Madre, como o app dela grava de verdade (nuas + prefixo). */
const CHAVES_DA_MADRE = [
  'perfil', 'hilo', 'plano', 'ano', 'leituraEntrada', 'profunda',
  'sonho', 'coracao', 'missao', 'corrente', 'escada', 'variante',
].map((nua) => PREFIJO + nua);

function plantar() {
  mem.async.clear();
  mem.falharGetAllKeys = false;
  for (const chave of CHAVES_DA_MADRE) mem.async.set(chave, '{"dado":"intimo"}');
  // E as do Cosmic, para provar que o apagar continua fazendo o que ja fazia.
  mem.async.set('cosmic-active-days', '{"2026-09-11":true}');
  mem.async.set('userSign', '{"name":"Touro"}');
}

test('APAGAR TUDO leva as chaves da Madre Maria embutida', async () => {
  plantar();
  await deleteAllCoupleData();

  const sobreviventes = CHAVES_DA_MADRE.filter((k) => mem.async.has(k));
  assert.deepEqual(
    sobreviventes,
    [],
    'dado da Madre sobreviveu ao "Apagar meus dados": '
      + `${sobreviventes.join(', ')}. Num aparelho emprestado ou vendido, e o `
      + 'onboarding dela (quem terminou com quem, se houve bloqueio) ficando para '
      + 'a proxima pessoa.'
  );

  // O que ja era apagado continua sendo.
  assert.equal(mem.async.has('cosmic-active-days'), false, 'o Cosmic parou de apagar o que apagava');
  assert.equal(mem.async.has('userSign'), false);
});

test('a varredura pega chave que este teste nunca viu (e prefixo, nao lista)', async () => {
  plantar();
  /* O CORACAO DESTE ARQUIVO. Uma chave inventada agora, que nao esta em lista
   * nenhuma do codigo nem deste teste — exatamente a situacao de amanha, quando
   * alguem acrescentar um recurso novo a Madre. Se ela sobreviver, o conserto
   * virou uma lista literal disfarcada e o defeito vai voltar pela quarta vez. */
  const chaveDoFuturo = `${PREFIJO}recurso-que-ainda-nao-existe`;
  mem.async.set(chaveDoFuturo, '{"segredo":"da pessoa"}');

  await deleteAllCoupleData();

  assert.equal(
    mem.async.has(chaveDoFuturo),
    false,
    'a chave nova sobreviveu: o apagar voltou a depender de alguem lembrar de '
      + 'cadastrar cada chave — que e como o mesmo defeito ja aconteceu tres vezes.'
  );
});

test('a varredura NAO apaga chave de fora do espaco da Madre', async () => {
  plantar();
  // Nem tudo que esta no storage e assunto desta funcao.
  mem.async.set('outro-app-qualquer', 'nao me apague');
  mem.async.set('mm-sem-ponto', 'prefixo parecido, mas nao e o da Madre');
  mem.async.set('cosmic-journal', 'o Diario e texto da pessoa: fica de proposito');

  await deleteAllCoupleData();

  assert.equal(mem.async.get('outro-app-qualquer'), 'nao me apague');
  assert.equal(mem.async.get('mm-sem-ponto'), 'prefixo parecido, mas nao e o da Madre');
  assert.equal(mem.async.get('cosmic-journal'), 'o Diario e texto da pessoa: fica de proposito');
});

test('getAllKeys quebrado nao derruba o Apagar tudo', async () => {
  plantar();
  mem.falharGetAllKeys = true;

  await deleteAllCoupleData(); // nao pode lancar

  // A varredura falhou, entao as da Madre ficam — mas o resto foi apagado. Uma
  // limpeza parcial e melhor que nenhuma, e e por isso que o catch existe.
  assert.equal(mem.async.has('cosmic-active-days'), false, 'a lista literal parou de funcionar');
  assert.equal(mem.async.has('userSign'), false);
});

test('o prefixo vem do almacen da Madre, nao de uma copia', () => {
  /* Se alguem escrever 'mm-hr.' a mao em coupleData.js, as duas strings podem
   * divergir no dia em que o prefixo mudar — e o sintoma de divergirem e
   * exatamente o vazamento que este arquivo existe para impedir. */
  const fs = require('node:fs');
  const path = require('node:path');
  const fonte = fs.readFileSync(path.join(__dirname, '..', 'lib', 'coupleData.js'), 'utf8');

  assert.match(
    fonte,
    /import \{ PREFIJO as MADRE_MARIA_PREFIXO \} from '\.\.\/madremaria\/lib\/almacen'/,
    'coupleData.js parou de importar o prefixo da fonte unica'
  );
  assert.doesNotMatch(
    fonte.replace(/\/\*[\s\S]*?\*\//g, ''),
    /'mm-hr\.'/,
    'coupleData.js tem o prefixo escrito a mao: duas verdades sobre a mesma string'
  );
});
