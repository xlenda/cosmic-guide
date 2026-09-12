// lib/entrada.js
// O MARCADOR DA LEITURA DE ENTRADA, E A ANCORA DO ANO DAS 13 LUAS.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE
// ===========================================================================
// A leitura de entrada (as tres cartas com a voz do dono) e o segundo dos tres
// passos do funil, e ela acontece UMA VEZ NA VIDA. Isso significa que tres
// arquivos diferentes precisam falar da mesma chave de disco:
//
//   · screens/LeituraDeEntradaScreen.js  ESCREVE, quando ela conclui;
//   · App.js                             LE, para decidir a rota de abertura;
//   · screens/AjustesScreen.js           LISTA, para o "Apagar tudo" apagar.
//
// Tres copias de uma string nua ('leituraEntrada') em tres arquivos e como
// nasce a chave que o "Apagar tudo" nao apaga: alguem renomeia em dois lugares e
// esquece o terceiro, e a falha e MUDA — o app continua abrindo certo e um dado
// da usuaria fica no aparelho depois de ela ter mandado apagar tudo. Aqui a
// chave tem UM dono, e os tres arquivos importam dele.
//
// ===========================================================================
// DUAS CHAVES, E ELAS SAO SEPARADAS DE PROPOSITO
// ===========================================================================
//   'leituraEntrada'  o marcador. Responde uma pergunta so: ela ja recebeu a
//                     leitura de entrada? Sem isto, quem ja tem perfil no disco
//                     cairia na leitura de entrada a cada abertura do app.
//
//   'ano'             a ANCORA DA JORNADA — o instante em que o dia 1 do plano
//                     de 365 dias comecou. lib/ano.js se RECUSA a numerar
//                     lunacao sem ela (MOTIVOS.SEM_INICIO_DA_JORNADA), e essa
//                     recusa e deliberada: assumir "comecou hoje" faria toda
//                     tela sem ancora exibir a lunacao 1, que e a mentira mais
//                     dificil de notar do projeto. A chave ja estava declarada
//                     em CLAVES_HILO_ROJO antes de existir quem a escrevesse.
//
// Nao sao a mesma chave porque nao sao o mesmo dado. O marcador e um booleano
// sobre uma tela; a ancora e o eixo de treze lunacoes que a tela do plano vai ler
// todo dia por um ano. E a chave 'ano' e compartilhada: o texto que ela escreve
// POR LUNACAO tambem mora la (ver o comentario de CLAVES_HILO_ROJO em
// screens/AjustesScreen.js). Por isso a escrita daqui e um MERGE, nunca um
// overwrite — ver `marcarLeituraDeEntrada`.
//
// ===========================================================================
// A ANCORA NASCE UMA VEZ E NUNCA E REESCRITA
// ===========================================================================
// A leitura de entrada continua alcancavel pelo Perfil, para reouvir os audios —
// as pessoas voltam nesses audios. Se cada visita reescrevesse a ancora, quem
// reouvisse a leitura no mes 7 voltaria para a lunacao 1 e perderia o ano
// inteiro, sem erro nenhum e sem aviso. Por isso `marcarLeituraDeEntrada` so
// grava `inicio` quando ele AINDA NAO EXISTE.
//
// ===========================================================================
// CHAVES NUAS
// ===========================================================================
// 'leituraEntrada' e 'ano', sem o prefixo. lib/almacen.js aplica 'hr.' sozinho e
// SEMPRE: escrever 'hr.ano' aqui gravaria 'hr.hr.ano', a leitura voltaria vazia
// para sempre e a ancora nunca seria encontrada — sem erro nenhum.

import { leerSeguro, guardarSeguro } from './almacen.js';

/** O marcador de "a leitura de entrada ja aconteceu". Chave NUA. */
export const CLAVE_ENTRADA = 'leituraEntrada';

/** O arco de treze lunacoes. Chave NUA, ja listada em CLAVES_HILO_ROJO. */
export const CLAVE_ANO = 'ano';

/* Le uma chave e devolve objeto, ou null. Nunca lanca: JSON pela metade no disco
 * e o mesmo que chave ausente do ponto de vista de quem chama — e tratar as duas
 * como coisas diferentes so multiplicaria caminhos que ninguem testa. */
async function lerObjeto(clave) {
  const bruto = await leerSeguro(clave);
  if (typeof bruto !== 'string' || !bruto.trim()) return null;
  try {
    const dato = JSON.parse(bruto);
    return dato && typeof dato === 'object' && !Array.isArray(dato) ? dato : null;
  } catch {
    return null;
  }
}

/**
 * Ela ja recebeu a leitura de entrada?
 *
 * Qualquer duvida vira `false`, pela mesma disciplina de `hayPerfil` em App.js:
 * o pior caso de um `false` errado e ela reouvir tres audios de 28 segundos que
 * ja gostou de ouvir; o pior caso de um `true` errado e ela nunca receber a
 * leitura que o funil inteiro existe para entregar.
 *
 * @returns {Promise<boolean>}
 */
export async function jaFezLeituraDeEntrada() {
  const dato = await lerObjeto(CLAVE_ENTRADA);
  return !!dato && dato.feita === true;
}

/**
 * O instante em que a jornada das treze luas comecou, como lib/ano.js o aceita
 * (`lunacaoDe(agora, inicio)` / `posicaoNoAno(inicio, agora)`).
 *
 * @returns {Promise<string|null>} ISO 8601, ou null quando ainda nao ha jornada.
 */
export async function inicioDaJornada() {
  const dato = await lerObjeto(CLAVE_ANO);
  const inicio = dato && dato.inicio;
  return typeof inicio === 'string' && inicio.trim() ? inicio : null;
}

/**
 * Conclui a leitura de entrada: marca que ela aconteceu e, se for a primeira
 * vez, ANCORA O DIA 1 do ano das treze luas.
 *
 * Nunca lanca e nunca bloqueia a tela: disco quebrado devolve `false` nos dois
 * campos e a pessoa entra no app do mesmo jeito. Perder o marcador custa uma
 * leitura de entrada repetida na proxima abertura — nunca a entrada no app.
 *
 * @param {Date|string} [agora]  o instante da conclusao. Argumento explicito
 *   para o teste poder fixar a data; sem ele, o relogio do aparelho.
 * @returns {Promise<{marcada: boolean, ancora: string, ancoraNova: boolean}>}
 *   `ancora` e o inicio da jornada que passa a valer — o que ja estava gravado
 *   quando ela so reouviu a leitura, ou o de agora quando ela acabou de comecar.
 */
export async function marcarLeituraDeEntrada(agora = new Date()) {
  const instante = agora instanceof Date ? agora : new Date(agora);
  const iso = Number.isNaN(instante.getTime())
    ? new Date().toISOString()
    : instante.toISOString();

  // A ANCORA PRIMEIRO, e o merge e obrigatorio: a chave 'ano' tambem guarda o
  // que ela escreve por lunacao ao longo do ano. Um `guardarSeguro(CLAVE_ANO,
  // JSON.stringify({ inicio }))` cru apagaria doze meses de texto intimo dela na
  // primeira vez que alguem reabrisse a leitura de entrada pelo Perfil.
  const ano = (await lerObjeto(CLAVE_ANO)) || {};
  const jaTinha = typeof ano.inicio === 'string' && ano.inicio.trim();
  const ancora = jaTinha ? ano.inicio : iso;
  if (!jaTinha) {
    await guardarSeguro(CLAVE_ANO, JSON.stringify({ ...ano, inicio: iso }));
  }

  const marcada = await guardarSeguro(
    CLAVE_ENTRADA,
    JSON.stringify({ feita: true, em: iso })
  );

  return { marcada, ancora, ancoraNova: !jaTinha };
}

export default {
  CLAVE_ENTRADA,
  CLAVE_ANO,
  jaFezLeituraDeEntrada,
  inicioDaJornada,
  marcarLeituraDeEntrada,
};
