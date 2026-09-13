// lib/genero.js — O GENERO DELA, e so o dela.
//
// ===========================================================================
// AS DUAS PERGUNTAS DE GENERO DESTE APP, QUE NAO SAO A MESMA
// ===========================================================================
// Este arquivo existe porque as duas foram confundidas uma vez, e o preco foi o
// fecho da leitura falando com a pessoa errada.
//
//   · O GENERO DE QUEM ESTA DO OUTRO LADO — a pessoa por quem ela sente alguma
//     coisa. NUNCA e assumido, NUNCA e perguntado e nunca vai ser coletado. Em
//     todo o produto aquilo e "essa pessoa", e test/copy-promessa-app-inteiro.test.js reprova o
//     deploy que escrever "ele te ama" ou "a namorada dele". Nada neste arquivo
//     afrouxa aquilo: as duas regras convivem inteiras.
//
//   · O GENERO DELA — de quem esta segurando o telefone. Este e PERGUNTADO no
//     onboarding, ela responde, e o app usa a resposta. Assumir o genero de
//     quem respondeu nao e delicadeza, e desperdicio da resposta dela.
//
// ===========================================================================
// PARA QUE SERVE HOJE
// ===========================================================================
// O fecho da leitura profunda (bloco 11) afirma quem ela passa a ser depois das
// treze luas. Ate 01/09 essa afirmacao dizia "uma mulher que sabe isso e outra
// mulher" para todo mundo — e para um homem ouvindo, a frase mais importante da
// leitura inteira falava de outra pessoa. Agora ha tres audios e tres textos, e
// e este arquivo que diz qual dos tres.
//
// ===========================================================================
// O PADRAO E A VERSAO NEUTRA, SEMPRE
// ===========================================================================
// Perfil antigo (gravado antes de a pergunta existir), campo em branco, disco
// quebrado, valor estranho: tudo isso vira 'neutro'. A neutra nao e um caminho
// degradado — ela foi escrita para ser a unica que existe (datos/profunda.js,
// FECHOS). Chutar 'mulher' "porque a maioria e" seria repetir exatamente o
// defeito que as tres versoes existem para consertar.
//
// ===========================================================================
// DISCO: SO LEITURA
// ===========================================================================
// Quem GRAVA o genero e o onboarding, junto do resto do perfil, na chave nua
// 'perfil' — a mesma que screens/PerfilScreen.js e App.js ja leem, e que ja
// esta em CLAVES_HILO_ROJO (screens/AjustesScreen.js). Este arquivo nunca
// escreve: um segundo dono da mesma chave e como o valor certo vira o errado.
/* A extensao .js e obrigatoria: os testes rodam sob `node --test`, que resolve
 * como ESM e nao adivinha extensao. Sem ela o arquivo carrega no app (o Metro
 * adivinha) e derruba a suite inteira — o pior lugar para descobrir. */
import { leerSeguro } from './almacen.js';

/* A chave NUA. lib/almacen.js aplica o prefixo 'hr.' sozinho — escrever
 * 'hr.perfil' aqui geraria 'hr.hr.perfil' e o genero nunca seria encontrado,
 * sem erro nenhum: todo mundo ouviria a versao neutra para sempre. */
const CLAVE_PERFIL = 'perfil';

export const GENERO_PADRAO = 'neutro';

/* As tres respostas que o app entende, e os sinonimos que ja apareceram nos dois
 * lados da virada de idioma. A lista existe para que uma resposta gravada como
 * 'feminino' num formulario antigo nao caia calada no neutro — e a chave e
 * comparada em minusculas e sem acento, para 'Não binário' e 'nao binario'
 * valerem o mesmo.
 *
 * E um Map, e nao um objeto literal: num objeto, 'constructor' e 'toString' vem da
 * cadeia de prototipos e sairiam daqui como se fossem respostas gravadas. O Map
 * so conhece o que foi posto nele. */
const SINONIMOS = new Map([
  ['mulher', 'mulher'],
  ['feminino', 'mulher'],
  ['mujer', 'mulher'],
  ['f', 'mulher'],

  ['homem', 'homem'],
  ['masculino', 'homem'],
  ['hombre', 'homem'],
  ['m', 'homem'],

  ['neutro', 'neutro'],
  ['outro', 'neutro'],
  ['outre', 'neutro'],
  ['nao binario', 'neutro'],
  ['nao binarie', 'neutro'],
  ['prefiro nao dizer', 'neutro'],
]);

const semAcento = (texto) =>
  String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

/**
 * Normaliza o que veio do disco. Puro e exportado para poder ser provado com
 * valores de verdade: e a funcao que, quando erra, erra em silencio — ninguem
 * ve num screenshot que a voz esta dizendo "mulher" para um homem.
 *
 * @param {unknown} bruto
 * @returns {'mulher'|'homem'|'neutro'}
 */
export function normalizarGenero(bruto) {
  if (typeof bruto !== 'string') return GENERO_PADRAO;
  return SINONIMOS.get(semAcento(bruto)) || GENERO_PADRAO;
}

/* O perfil e gravado em dois formatos, e os dois estao vivos: as respostas cruas
 * e o envelope { respuestas: {...} }. App.js ja aceita os dois (hayPerfil) e
 * este leitor faz o mesmo — olhar so um deles daria neutro para metade das
 * pessoas dependendo de quando elas instalaram o app. */
function generoNoPerfil(dato) {
  if (!dato || typeof dato !== 'object') return null;
  if (typeof dato.genero === 'string') return dato.genero;
  const respuestas = dato.respuestas;
  if (respuestas && typeof respuestas === 'object' && typeof respuestas.genero === 'string') {
    return respuestas.genero;
  }
  return null;
}

/**
 * O genero dela, lido do perfil. NUNCA lanca e nunca devolve null: sem resposta,
 * sem perfil ou com o disco quebrado o retorno e 'neutro', e a leitura sai
 * inteira do mesmo jeito.
 *
 * @returns {Promise<'mulher'|'homem'|'neutro'>}
 */
export async function lerGenero() {
  const bruto = await leerSeguro(CLAVE_PERFIL);
  if (typeof bruto !== 'string' || !bruto.trim()) return GENERO_PADRAO;
  try {
    return normalizarGenero(generoNoPerfil(JSON.parse(bruto)));
  } catch {
    return GENERO_PADRAO;
  }
}

export default lerGenero;
