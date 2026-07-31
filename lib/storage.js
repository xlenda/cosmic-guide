// lib/storage.js
// O ÚNICO getStorage() do app — e os dois wrappers que de fato tratam a falha.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE (o bug que ele conserta)
// ===========================================================================
// lib/cosmicSound.js e lib/jornada.js carregavam DUAS CÓPIAS do mesmo helper,
// com o mesmo desenho e o mesmo defeito — o cabeçalho de lib/jornada.js dizia,
// com todas as letras, "cópia literal do getStorage de lib/cosmicSound.js".
//
// O defeito: o require preguiçoso NUNCA falha. '@react-native-async-storage/
// async-storage' é dependência dura do package.json e resolve até em Node puro.
// Quem estoura é a CHAMADA — S.getItem() joga "window is not defined" fora do
// runtime RN, e no navegador localStorage pode jogar SecurityError (storage
// particionado, iframe) ou QuotaExceededError. Como o fallback de memória vivia
// no ramo `if (!S)`, ele era código morto: o throw caía no try/catch de baixo,
// que engolia e não gravava nada. Na Jornada isso custava o progresso do
// usuário — concluir o dia devolvia ok:true e o recarregar seguinte trazia a
// lista vazia, apagando a medalha na frente da pessoa.
//
// A CORREÇÃO, e ela é a razão de ser destes wrappers: o fallback mora no CATCH,
// não no `if (!S)`. Na primeira falha de verdade a flag `_semDisco` sobe e, dali
// em diante, esta sessão inteira lê e grava em memória — em vez de tentar de
// novo um disco que já se provou quebrado e devolver null a cada leitura.
//
// O QUE NÃO É: cache por cima de storage que funciona. Enquanto `_semDisco` for
// false toda LEITURA vai no disco. Cache por cima de storage presente é como
// nascem os bugs de "concluí e sumiu quando voltei" — o valor certo estava no
// disco e o errado, na memória. A memória é escrita também no caminho feliz
// (custa um Map) só pra que a primeira falha de ESCRITA não perca o que a
// sessão já tinha gravado antes dela.
// ===========================================================================

let _Storage;

// Require preguiçoso dentro de try/catch — o módulo resolve em Node (então um
// import estático não quebra o teste) mas o objeto que ele devolve estoura na
// chamada fora do runtime RN. Por isso ele resolvendo não prova nada, e é
// justamente essa a armadilha que os wrappers abaixo cobrem.
export function getStorage() {
  if (_Storage !== undefined) return _Storage;
  try {
    const mod = require('@react-native-async-storage/async-storage');
    _Storage = (mod && (mod.default || mod)) || null;
  } catch {
    _Storage = null;
  }
  return _Storage;
}

const _memoria = new Map();
let _semDisco = false;

// Devolve string ou null. NUNCA lança — quem chama trata "não tem" e não
// "quebrou", que são a mesma coisa do ponto de vista da tela.
export async function getItemSeguro(chave) {
  const S = _semDisco ? null : getStorage();
  if (!S) return _memoria.has(chave) ? _memoria.get(chave) : null;
  try {
    const bruto = await S.getItem(chave);
    return bruto === undefined ? null : bruto;
  } catch {
    _semDisco = true;
    return _memoria.has(chave) ? _memoria.get(chave) : null;
  }
}

// Devolve true quando foi ao disco, false quando ficou só em memória. Nenhuma
// tela é obrigada a olhar o retorno — mas quem quiser avisar "não deu pra
// gravar" tem como saber, em vez de descobrir na próxima abertura.
export async function setItemSeguro(chave, valor) {
  const v = String(valor);
  // Memória SEMPRE, inclusive no caminho feliz: se o disco falhar na próxima
  // escrita, o que a sessão já gravou continua legível.
  _memoria.set(chave, v);
  const S = _semDisco ? null : getStorage();
  if (!S) return false;
  try {
    await S.setItem(chave, v);
    return true;
  } catch {
    _semDisco = true;
    return false;
  }
}

export async function removeItemSeguro(chave) {
  _memoria.delete(chave);
  const S = _semDisco ? null : getStorage();
  if (!S) return false;
  try {
    await S.removeItem(chave);
    return true;
  } catch {
    _semDisco = true;
    return false;
  }
}

// Só para os testes: `_semDisco` é por SESSÃO de propósito (uma vez quebrado,
// não se insiste), e um teste que exercita o disco quebrado deixaria a flag
// levantada para todos os testes seguintes do mesmo arquivo.
export function _reiniciarStorageParaTestes() {
  _Storage = undefined;
  _semDisco = false;
  _memoria.clear();
}
