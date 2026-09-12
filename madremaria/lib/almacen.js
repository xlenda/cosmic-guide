// lib/almacen.js
// O ÚNICO getAlmacen() do Fio Vermelho — e os três wrappers que de fato tratam a
// falha. Interface pública em espanhol, comentários em português.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE (o bug que ele conserta)
// ===========================================================================
// O desenho ingênuo carrega uma cópia do helper de storage em cada módulo que
// precisa persistir algo, todas com o mesmo defeito: o require preguiçoso NUNCA
// falha. '@react-native-async-storage/async-storage' é dependência dura do
// package.json e resolve até em Node puro. Quem estoura é a CHAMADA —
// S.getItem() joga "window is not defined" fora do runtime RN, e no navegador
// localStorage pode jogar SecurityError (storage particionado, iframe) ou
// QuotaExceededError. Quando o fallback de memória mora no ramo `if (!S)`, ele
// vira código morto: o throw cai no try/catch de baixo, que engole e não grava
// nada. Isso custa o progresso do usuário — a tela devolve "salvo" e o
// recarregar seguinte traz vazio, apagando o que a pessoa acabou de fazer.
//
// A CORREÇÃO, e ela é a razão de ser destes wrappers: o fallback mora no CATCH,
// não no `if (!S)`. Na primeira falha de verdade a flag `_sinDisco` sobe e, dali
// em diante, esta sessão inteira lê e grava em memória — em vez de tentar de
// novo um disco que já se provou quebrado e devolver null a cada leitura.
//
// O QUE NÃO É: cache por cima de storage que funciona. Enquanto `_sinDisco` for
// false toda LEITURA vai no disco. Cache por cima de storage presente é como
// nascem os bugs de "salvei e sumiu quando voltei" — o valor certo estava no
// disco e o errado, na memória. A memória é escrita também no caminho feliz
// (custa um Map) só pra que a primeira falha de ESCRITA não perca o que a
// sessão já tinha gravado antes dela.
//
// PREFIXO: quem chama passa a chave nua ('hilo') e este módulo grava 'hr.hilo'.
// O prefixo é aplicado SEMPRE, sem checar se já está lá — assim a chave gravada
// é função pura da chave pedida, e não existe o caso ambíguo de uma chave
// legítima que por acaso comece com 'hr.'. Nenhum chamador deve escrever o
// prefixo à mão.
// ===========================================================================

// PREFIXO DENTRO DO COSMIC GUIDE (11/09/2026): o Madre Maria passou a morar
// dentro do Cosmic Guide, que compartilha o mesmo AsyncStorage. 'mm-' isola o
// espaco de chaves dos dois apps. Medido antes de fixar: nenhuma chave do
// Cosmic comeca com 'mm-' nem com 'hr.' (grep em lib/ screens/ components/
// context/ deu zero). Este e o UNICO lugar onde o prefixo entra — as chaves
// nuas ('perfil', 'hilo', ...) e a lista CLAVES_HILO_ROJO de AjustesScreen
// continuam NUAS. Prefixar tambem la geraria 'mm-hr.mm-hr.perfil': o app
// abriria sempre no onboarding e o 'Apagar tudo' varreria o espaco errado.
// EXPORTADO (e nao mais privado) porque o "Apagar meus dados" do Cosmic precisa
// dele: lib/coupleData.js varre o AsyncStorage e apaga tudo que comeca com este
// prefixo. Uma segunda copia da string la seria a chance de as duas divergirem —
// e o sintoma de divergirem e dado intimo sobrevivendo ao Apagar tudo, sem erro
// nenhum em lugar nenhum.
export const PREFIJO = 'mm-hr.';

// Único ponto onde a chave do chamador vira chave de disco. O Map de memória
// também é indexado pela chave JÁ prefixada, para que memória e disco falem
// exatamente do mesmo endereço.
function conPrefijo(clave) {
  return PREFIJO + String(clave);
}

let _Almacen;

// Require preguiçoso dentro de try/catch — o módulo resolve em Node (então um
// import estático não quebra o teste) mas o objeto que ele devolve estoura na
// chamada fora do runtime RN. Por isso ele resolvendo não prova nada, e é
// justamente essa a armadilha que os wrappers abaixo cobrem.
export function getAlmacen() {
  if (_Almacen !== undefined) return _Almacen;
  try {
    const mod = require('@react-native-async-storage/async-storage');
    _Almacen = (mod && (mod.default || mod)) || null;
  } catch {
    _Almacen = null;
  }
  return _Almacen;
}

const _memoria = new Map();
let _sinDisco = false;

// Devolve string ou null. NUNCA lança — quem chama trata "não tem" e não
// "quebrou", que são a mesma coisa do ponto de vista da tela.
export async function leerSeguro(clave) {
  const k = conPrefijo(clave);
  const A = _sinDisco ? null : getAlmacen();
  if (!A) return _memoria.has(k) ? _memoria.get(k) : null;
  try {
    const bruto = await A.getItem(k);
    return bruto === undefined ? null : bruto;
  } catch {
    // AQUI mora o fallback: o storage existia e estourou na chamada. A partir
    // desta falha a sessão inteira vive em memória.
    _sinDisco = true;
    return _memoria.has(k) ? _memoria.get(k) : null;
  }
}

// Devolve true quando foi ao disco, false quando ficou só em memória. Nenhuma
// tela é obrigada a olhar o retorno — mas quem quiser avisar "não deu pra
// gravar" tem como saber, em vez de descobrir na próxima abertura.
export async function guardarSeguro(clave, valor) {
  const k = conPrefijo(clave);
  const v = String(valor);
  // Memória SEMPRE, inclusive no caminho feliz: se o disco falhar na próxima
  // leitura ou escrita, o que a sessão já gravou continua legível.
  _memoria.set(k, v);
  const A = _sinDisco ? null : getAlmacen();
  if (!A) return false;
  try {
    await A.setItem(k, v);
    return true;
  } catch {
    _sinDisco = true;
    return false;
  }
}

export async function borrarSeguro(clave) {
  const k = conPrefijo(clave);
  _memoria.delete(k);
  const A = _sinDisco ? null : getAlmacen();
  if (!A) return false;
  try {
    await A.removeItem(k);
    return true;
  } catch {
    _sinDisco = true;
    return false;
  }
}

// Só para os testes: `_sinDisco` é por SESSÃO de propósito (uma vez quebrado,
// não se insiste), e um teste que exercita o disco quebrado deixaria a flag
// levantada para todos os testes seguintes do mesmo arquivo.
export function _reiniciarParaTests() {
  _Almacen = undefined;
  _sinDisco = false;
  _memoria.clear();
}

// Só para os testes: injeta um storage falso no lugar do require.
//
// Existe porque o comportamento que mais importa aqui — o fallback que mora no
// CATCH — é justamente o que NÃO dá para exercitar sem um storage que aceite o
// require e estoure na chamada. Em Node o require falha antes, `getAlmacen()`
// devolve null, e todo teste passaria pelo ramo `if (!A)` sem nunca tocar no
// catch: cobertura verde provando nada. Com a injeção, o teste consegue ser de
// mutação de verdade — quebra a regra no código e vê o teste falhar.
export function _inyectarAlmacenParaTests(falso) {
  _Almacen = falso;
  _sinDisco = false;
  _memoria.clear();
}
