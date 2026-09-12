// datos/preguntas.js
// As 7 perguntas do onboarding do Fio Vermelho. Interface publica em portugues
// do Brasil, comentarios idem (mesma convencao de theme.js e lib/almacen.js).
//
// ===========================================================================
// O MOLDE (Heat Game) E O QUE MUDA AQUI
// ===========================================================================
// Do Heat Game vem a mecanica: perguntas curtas, UMA por tela, opcoes entrando
// em cascata, botao que so acende quando a resposta e valida. Nada de barra
// "passo 3 de 12", nada de formulario com scroll.
//
// O que muda: o assunto e reconciliacao, nao sexo. E o material registra uma
// falha do original — "nenhuma promessa antes de pedir dados": o Heat Game
// abre pedindo. Aqui existe PANTALLA_CERO, que responde "o que este app faz"
// ANTES da P1. Quem le e decide nao entrar nao deixou nenhum dado para tras.
//
// ===========================================================================
// QUENTE PRIMEIRO, FICHA DEPOIS — por que a ordem e esta
// ===========================================================================
// P1 a P5 sao a HISTORIA: o nome, o que aconteceu, ha quanto tempo, como esta o
// contato, o que ela quer entender. Sao as perguntas que a propria pessoa quer
// responder, e sao elas que abrem a aplicacao.
// P6 e P7 sao a FICHA: data de nascimento e genero. Ficha nao abre nada — ela
// fecha. Pedir data de nascimento na primeira tela, antes de o app ter dito
// qualquer coisa util, e o jeito mais rapido de perder alguem que ja estava
// disposta a contar o que aconteceu.
//
// ===========================================================================
// O QUE SE PERGUNTA, O QUE SE DERIVA E O QUE NUNCA SE COLETA (01/09)
// ===========================================================================
// MUDOU: o app passou a perguntar DATA DE NASCIMENTO (P6) e GENERO DELA (P7).
// Antes este comentario dizia "nao ha idade, nao ha signo, nao ha data de
// nascimento" — e a copy da tela de privacidade dizia o mesmo. Manter aquilo de
// pe depois de acrescentar os campos nao seria um texto desatualizado: seria uma
// declaracao falsa numa ficha de loja.
//
// O SIGNO NAO E PERGUNTADO, E DERIVADO. Sai da data por lib/signo.js. Pedir a
// data E o signo seria pedir duas vezes o mesmo dado e ainda abrir a porta para
// os dois se contradizerem dentro do mesmo perfil.
//
// O QUE CONTINUA VALENDO, e continua sendo o argumento de marca:
//  · tudo fica no aparelho — nao ha conta, nao ha e-mail, nao ha servidor;
//  · NADA sobre a outra pessoa e coletado: nem nome, nem signo, nem genero, nem
//    como ela e. Essa ponta do fio nao esta neste app e nao vai estar;
//  · nao ha hora nem lugar de nascimento (so o dia), nao ha localizacao, nao ha
//    contatos, nao ha camera.
//
// A regra de campo novo nao mudou: se o dado nao entra em nenhuma conta que o
// app faz de verdade, ele nao entra no onboarding. Data de nascimento entra
// porque signo e idade compoem o plano; genero entra porque o fechamento da
// leitura profunda e dito NO GENERO DELA.
//
// ===========================================================================
// CONTRATO DE PRODUTO (o mesmo de theme.js, aplicado a texto)
// 1. Nunca prometer desfecho. Nenhuma opcao pergunta pelo futuro da outra pessoa.
// 2. Zero prova social inventada.
// 3. Nenhuma alegacao de saude.
// 4. O genero de quem esta do outro lado nunca e assumido: "essa pessoa".
//    ATENCAO: esta regra fala da OUTRA PESSOA, e continua inteira. O genero DELA
//    (P7) e outra coisa — e perguntado, e respondido por ela, e usado so para
//    falar COM ela. Um app que sabe como se dirigir a quem esta segurando o
//    telefone nao e um app que adivinha quem esta do outro lado.
// 5. Portugues do Brasil, tratamento por "voce". Nunca "tu", nunca "senhora",
//    nunca apelido ("meu anjo", "meu bem") — isso e do funil, nao do app.
// ===========================================================================

import { esFechaReal, idadeEm, signoFromDate } from '../lib/signo.js';

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * OS LIMITES DA DATA DE NASCIMENTO
 * =================================================================================
 * ANO_MINIMO_NACIMIENTO existe para que um dedo escorregado no campo do ano
 * ("0989") nao vire um perfil com 1.037 anos. E o piso, nao um julgamento: quem
 * nasceu antes de 1900 nao esta usando este app.
 *
 * IDADE_MAXIMA_PLAUSIBLE fecha o teto pelo outro lado, e ele depende do dia de
 * hoje — por isso NAO mora dentro de esValida(). Ver a nota em
 * fechaDeNacimientoPlausible() logo abaixo dela.
 * ================================================================================= */
export const ANO_MINIMO_NACIMIENTO = 1900;
export const IDADE_MAXIMA_PLAUSIBLE = 120;

/* =================================================================================
 * PANTALLA_CERO — a promessa que abre, antes da P1.
 * Uma tela, tres campos, zero coleta. O corpo responde "o que este app faz" e ja
 * entrega o limite honesto na mesma respiracao: e o limite que da autoridade ao
 * resto. A tela nao tem campo nenhum — sair daqui nao custa dado nenhum.
 * ================================================================================= */
export const PANTALLA_CERO = congelar({
  titulo: 'Três cartas para a história que ficou pela metade',
  cuerpo:
    'A Madre Maria te dá hoje uma leitura de tarô sobre esse vínculo que não se fechou: onde ele se enredou, o que o mantém esticado e qual parte do fio você segura. Não adivinha o final, porque nenhuma carta lê a outra pessoa.',
  boton: 'Ver as minhas três cartas',
});

/* =================================================================================
 * PREGUNTAS — sete, nesta ordem, uma por tela.
 *
 * Formato de cada item:
 *   { id, texto, microcopy, tipo, opciones? }
 *   tipo 'texto'  -> campo livre  (traz placeholder e maxLargo)
 *   tipo 'opcion' -> lista unica  (traz opciones: [{ id, texto }])
 *   tipo 'fecha'  -> data         (traz campos: [{ id, rotulo, placeholder, largo }]
 *                                  e anoMinimo; o valor guardado e 'YYYY-MM-DD')
 *
 * CADA pergunta carrega microcopy dizendo para que aquele dado serve — as sete,
 * nao so a ultima. Microcopy que so enfeita e ruido: aqui ela e a justificativa do
 * campo. Campo que nao consegue escrever a propria justificativa nao existe.
 *
 * Os `id` das opcoes sao chaves tecnicas (sem acento, sem caixa alta). Sao eles que
 * o motor de leitura le — nunca o texto visivel.
 * ================================================================================= */
export const PREGUNTAS = congelar([
  /* --- P1 ------------------------------------------------------------------------
   * O nome coletado cedo e devolvido no momento de maior carga emocional (o padrao
   * 6 dos 16): ele nao aparece nesta tela nem na seguinte, aparece na sintese.
   * Por isso e a primeira pergunta e nao a ultima. */
  {
    id: 'nombre',
    texto: 'Como você se chama?',
    microcopy:
      'Para te chamar pelo nome na parte da leitura que mais pesa, e não com um "olá" de formulário. Fica neste telefone: não tem conta, não tem e-mail, não é enviado para lugar nenhum.',
    tipo: 'texto',
    placeholder: 'Seu nome',
    maxLargo: 24,
  },

  /* --- P2 ------------------------------------------------------------------------
   * Alimenta a primeira carta (O NO). As cinco opcoes cobrem o mapa inteiro do
   * rompimento sem forcar a usuaria a escrever nada: briga, afastamento, termino,
   * arrependimento de quem terminou, e o que nunca chegou a comecar — esse ultimo
   * existe porque parte do publico deste app nunca teve namoro nenhum para retomar. */
  {
    id: 'corte',
    texto: 'O que aconteceu entre vocês?',
    microcopy:
      'Define a primeira carta, a do nó. Sem saber onde o fio se enredou, a leitura falaria de qualquer história menos da sua.',
    tipo: 'opcion',
    opciones: [
      { id: 'pelea', texto: 'Uma discussão forte e tudo se rompeu ali' },
      { id: 'distancia', texto: 'A gente foi se afastando aos poucos, sem briga' },
      { id: 'ruptura', texto: 'Terminamos: foi dito com todas as letras' },
      { id: 'me-arrepenti', texto: 'Fui eu que terminei e me arrependi' },
      { id: 'nunca-empezo', texto: 'Nunca chegou a começar de verdade' },
    ],
  },

  /* --- P3 ------------------------------------------------------------------------
   * Alimenta a segunda carta (A TENSAO). Unico dado de calendario do app: e uma
   * faixa, nao uma data — a leitura nao precisa de precisao maior que isso. */
  {
    id: 'cuando',
    texto: 'Faz quanto tempo?',
    microcopy:
      'Muda a carta do meio: a tensão de uma semana não se parece com a de um ano. É o único dado de calendário que pedimos, e por isso é uma faixa e não uma data.',
    tipo: 'opcion',
    opciones: [
      { id: 'dias', texto: 'Faz dias' },
      { id: 'semanas', texto: 'Umas semanas' },
      { id: 'meses-1-3', texto: 'Entre um e três meses' },
      { id: 'meses-3-12', texto: 'Entre três meses e um ano' },
      { id: 'mas-de-un-ano', texto: 'Mais de um ano' },
    ],
  },

  /* --- P4 ------------------------------------------------------------------------
   * Filtro duro da acao final. Os ids 'le-escribi-no-responde' e 'cero-contacto'
   * sao lidos pelo motor de leitura: com qualquer um dos dois, toda acao do tipo
   * "escreva para essa pessoa" fica FORA do resultado. Conselho que manda insistir com quem ja nao
   * respondeu e o jeito mais rapido de a usuaria se machucar usando o app.
   * Se renomear um destes ids, ver IDS_CONTACTO_DURO no fim do arquivo. */
  {
    id: 'hoy',
    texto: 'Como está o contato hoje?',
    microcopy:
      'Filtra a ação com que a leitura termina. Tem conselho que não faz sentido se você já escreveu e ninguém respondeu: com esta resposta ele fica de fora, em vez de aparecer e te empurrar a insistir.',
    tipo: 'opcion',
    opciones: [
      { id: 'hablamos', texto: 'A gente se fala, mesmo que diferente de antes' },
      { id: 'le-escribi-no-responde', texto: 'Escrevi e não veio resposta' },
      { id: 'cero-contacto', texto: 'Contato zero faz tempo, dos dois lados' },
      { id: 'me-escribe-a-veces', texto: 'Às vezes essa pessoa me escreve, sem um padrão claro' },
      { id: 'bloqueo', texto: 'Tem um bloqueio no meio' },
    ],
  },

  /* --- P5 ------------------------------------------------------------------------
   * Da o tom da terceira carta (A SUA PONTA), a que fala so da usuaria.
   * Nenhuma opcao pergunta pelo desfecho: as cinco falam de ENTENDER e de DECIDIR
   * — coisas que dependem de quem esta segurando o telefone. Prever nao esta na
   * lista porque nao esta no produto. */
  {
    id: 'intencion',
    texto: 'O que você quer entender hoje?',
    microcopy:
      'Decide o tom da terceira carta, a que fala só de você. Aqui não existe opção para adivinhar o final: esta leitura serve para entender, não para prever.',
    tipo: 'opcion',
    opciones: [
      { id: 'entender-que-paso', texto: 'Entender o que se rompeu de verdade' },
      { id: 'entender-mi-parte', texto: 'Ver qual foi a minha parte nisso' },
      { id: 'decidir-insistir-o-soltar', texto: 'Decidir se continuo insistindo ou se solto' },
      { id: 'entender-que-diria', texto: 'Saber o que eu diria se houvesse uma conversa' },
      { id: 'entender-para-cerrar', texto: 'Entender o suficiente para fechar o assunto' },
    ],
  },

  /* --- P6 ------------------------------------------------------------------------
   * A DATA DE NASCIMENTO. Primeira pergunta de FICHA, e a primeira que o app
   * pede depois de ja ter mostrado para que serve (quente primeiro, ficha depois).
   *
   * O SIGNO NAO E PERGUNTADO. Ele sai daqui por lib/signo.js, com a longitude
   * ecliptica do Sol — nao com tabela de datas fixas, que erra 1,11% das datas e
   * erra SEMPRE na cuspide, em cima de quem mais repara. Uma lista de doze signos
   * na tela seria pedir de novo um dado que a data ja tem.
   *
   * SO O DIA: nao ha hora, nao ha cidade, nao ha fuso. Sem hora nao ha
   * Ascendente e nao ha Lua, e o app nao finge ter nenhum dos dois.
   *
   * DADO SENSIVEL: mora dentro da chave 'perfil' (a mesma do nome e das outras
   * respostas), portanto ja esta em CLAVES_HILO_ROJO e sai no "Apagar tudo" —
   * conferido por screens/AjustesScreen.js. */
  {
    id: 'nacimiento',
    texto: 'Que dia você nasceu?',
    microcopy:
      'Daqui saem duas coisas: o seu signo, que o app calcula sozinho — você não precisa procurar numa lista —, e a sua idade. São elas que fazem o plano dos próximos dias falar com a sua fase da vida em vez de falar com uma pessoa qualquer. Não pedimos a hora nem o lugar. Fica neste telefone e sai no "Apagar tudo".',
    tipo: 'fecha',
    campos: [
      { id: 'dia', rotulo: 'DIA', placeholder: 'DD', largo: 2 },
      { id: 'mes', rotulo: 'MÊS', placeholder: 'MM', largo: 2 },
      { id: 'ano', rotulo: 'ANO', placeholder: 'AAAA', largo: 4 },
    ],
    anoMinimo: ANO_MINIMO_NACIMIENTO,
  },

  /* --- P7 ------------------------------------------------------------------------
   * O GENERO DELA — e so dela. A regra 4 do contrato continua inteira: sobre quem
   * esta do outro lado o app nao pergunta nada e nao assume nada.
   *
   * PARA QUE SERVE, exatamente: o fechamento da leitura profunda termina falando
   * COM ela ("uma mulher que sabe isso e outra mulher"). Dizer "mulher" para quem
   * nao e mulher e o mesmo erro, do lado de ca, que assumir o genero da outra
   * pessoa e do lado de la.
   *
   * A TERCEIRA OPCAO NAO E ENFEITE. 'prefiro-nao-dizer' e uma resposta valida e
   * completa: o app inteiro funciona com ela, e o fechamento tem uma versao
   * neutra escrita de proposito — nao um remendo que troca a palavra por "pessoa"
   * no ultimo segundo. Quem escolhe esta opcao nao recebe menos leitura. */
  {
    id: 'genero',
    texto: 'E como a gente fala com você?',
    microcopy:
      'Muda só as palavras com que a leitura se dirige a você — o fechamento é dito no seu gênero, e não no de outra pessoa. Não muda nenhuma carta, não muda o que sai na tiragem e não diz nada sobre quem está do outro lado: sobre essa pessoa o app continua sem perguntar nada.',
    tipo: 'opcion',
    opciones: [
      { id: 'mulher', texto: 'Sou mulher' },
      { id: 'homem', texto: 'Sou homem' },
      { id: 'prefiro-nao-dizer', texto: 'Prefiro não dizer' },
    ],
  },
]);

/* =================================================================================
 * CONTRATO PARA AS TELAS E PARA O MOTOR
 * ================================================================================= */

/** Ordem canonica dos ids. A tela avanca por indice; ninguem escreve 'nombre' na mao. */
export const IDS_PREGUNTAS = congelar(PREGUNTAS.map((p) => p.id));

/** 7. Usado no contador "{n} de {total}" — nunca digitar o numero na tela. */
export const TOTAL_PREGUNTAS = PREGUNTAS.length;

/**
 * Os tres ids de P7. Existe pelo mesmo motivo de IDS_CONTACTO_DURO: quem precisa
 * escolher a versao do fechamento importa daqui em vez de escrever 'mulher' na
 * mao, e renomear uma opcao quebra na hora em vez de quebrar em silencio.
 */
export const IDS_GENERO = congelar(['mulher', 'homem', 'prefiro-nao-dizer']);

/**
 * A resposta neutra — e o PADRAO de quem nao respondeu.
 * Nao existe caminho em que o app precise adivinhar um genero: sem resposta, a
 * versao neutra e a resposta certa, e ela e uma versao inteira e nao um remendo.
 */
export const GENERO_NEUTRO = 'prefiro-nao-dizer';

/**
 * Os dois ids de P4 que o motor de leitura usa como filtro duro.
 * Existe para que o motor importe daqui em vez de repetir a string literal:
 * assim, renomear uma opcao quebra na hora e nao em silencio.
 */
export const IDS_CONTACTO_DURO = congelar(['le-escribi-no-responde', 'cero-contacto']);

/** Busca por id. Devolve undefined quando nao existe — nunca lanca. */
export function getPregunta(id) {
  return PREGUNTAS.find((p) => p.id === id);
}

/**
 * Regra do botao que acende. Deterministica e sem efeito colateral:
 *  - tipo 'texto'  -> pelo menos 1 caractere depois do trim, ate maxLargo
 *  - tipo 'opcion' -> o valor tem de ser um id que existe nas opcoes
 *  - tipo 'fecha'  -> 'YYYY-MM-DD' de um dia que EXISTE no calendario, com o ano
 *                     entre ANO_MINIMO_NACIMIENTO e 2100
 * Qualquer outra coisa (id errado, valor nulo, opcao inventada) e false.
 *
 * POR QUE O FUTURO NAO E CONFERIDO AQUI. Esta funcao e chamada de dentro de
 * lib/lectura.js (via onboardingCompleto), e aquele motor e PURO por contrato —
 * mesma entrada, mesma saida, sem relogio. Ler `new Date()` aqui plantaria o
 * relogio no meio da composicao da leitura. O teto que depende de hoje mora em
 * fechaDeNacimientoPlausible(), que a tela do onboarding chama antes de gravar.
 */
export function esValida(idPregunta, valor) {
  const p = getPregunta(idPregunta);
  if (!p) return false;
  if (p.tipo === 'texto') {
    if (typeof valor !== 'string') return false;
    const limpio = valor.trim();
    return limpio.length >= 1 && limpio.length <= (p.maxLargo || 24);
  }
  if (p.tipo === 'opcion') {
    return Array.isArray(p.opciones) && p.opciones.some((o) => o.id === valor);
  }
  if (p.tipo === 'fecha') {
    if (!esFechaReal(valor)) return false;
    const ano = Number(String(valor).slice(0, 4));
    return ano >= (p.anoMinimo || ANO_MINIMO_NACIMIENTO) && ano <= 2100;
  }
  return false;
}

/**
 * O teto que so o dia de hoje sabe: a data nao pode estar no futuro nem passar de
 * IDADE_MAXIMA_PLAUSIBLE anos. Fica separada de esValida() de proposito (ver a
 * nota la em cima) e recebe `hoje` por parametro para continuar testavel sem
 * depender do relogio de quem roda o teste.
 *
 * @param {string} valor  'YYYY-MM-DD'
 * @param {Date}   [hoje] referencia; por padrao, agora
 */
export function fechaDeNacimientoPlausible(valor, hoje = new Date()) {
  if (!esValida('nacimiento', valor)) return false;
  const anos = idadeEm(valor, hoje);
  // null aqui so acontece com data no futuro — idadeEm ja recusou o resto.
  return anos !== null && anos <= IDADE_MAXIMA_PLAUSIBLE;
}

/** true quando as sete respostas passam. E o portao para gerar a tirada. */
export function onboardingCompleto(respuestas) {
  if (!respuestas || typeof respuestas !== 'object') return false;
  return PREGUNTAS.every((p) => esValida(p.id, respuestas[p.id]));
}

/**
 * O SIGNO DELA — derivado da data de P6, nunca perguntado.
 * Devolve o nome ('Leão') ou null quando ainda nao ha data valida guardada.
 */
export function signoDe(respuestas) {
  const fecha = respuestas && respuestas.nacimiento;
  return esValida('nacimiento', fecha) ? signoFromDate(fecha) : null;
}

/** A idade em anos completos, da mesma data. null quando nao da para saber. */
export function idadeDe(respuestas, hoje = new Date()) {
  const fecha = respuestas && respuestas.nacimiento;
  return esValida('nacimiento', fecha) ? idadeEm(fecha, hoje) : null;
}

/**
 * O GENERO DELA, sempre um dos tres ids de IDS_GENERO.
 * Resposta ausente, gravada por uma versao antiga do app ou corrompida no disco
 * cai em GENERO_NEUTRO — nunca em 'mulher' por ser o caso mais comum. O padrao
 * de um dado que a pessoa nao deu nao pode ser um palpite sobre ela.
 */
export function generoDe(respuestas) {
  const valor = respuestas && respuestas.genero;
  return IDS_GENERO.includes(valor) ? valor : GENERO_NEUTRO;
}

/* =================================================================================
 * OS TRES IDIOMAS
 * =================================================================================
 * PT fica ACIMA, nos exports originais, e continua sendo o que os portoes varrem
 * (test/madremaria-lectura.test.js, -signo, -ritual e -apresentacao importam
 * PREGUNTAS/getPregunta direto). ES e EN moram em arquivos VIZINHOS —
 * datos/preguntas.es.js e datos/preguntas.en.js —, um por idioma, disjuntos.
 *
 * O QUE OS VIZINHOS NAO CARREGAM, e nao e esquecimento:
 *   · `id` de pergunta e de OPCAO. Os ids das opcoes sao o contrato do motor:
 *     lib/lectura.js, lib/plano.js e lib/diagnostico.js decidem por eles, e
 *     'le-escribi-no-responde' + 'cero-contacto' sao IDS_CONTACTO_DURO — o filtro
 *     que tira do caminho toda acao de "escreva para essa pessoa". Um id traduzido
 *     nao daria erro: desligaria a protecao em silencio naquele idioma.
 *   · `tipo`, `maxLargo`, `largo`, `anoMinimo`, e a ORDEM das sete perguntas e das
 *     opcoes de cada uma. A tela avanca por indice.
 * Daqui sai sempre a pergunta PT inteira, com os campos de TEXTO trocados.
 *
 * Fallback por CAMPO, e `??` e nao `||`: string vazia e defeito de traducao a ser
 * visto, nao silenciado (mesma regra de valorDe() em datos/textos.js).
 *
 * POR QUE FUNCAO E NAO CONSTANTE: o idioma muda em runtime (espelho de modulo de
 * datos/textos.js, empurrado por setIdiomaMadre). Uma constante montada na carga
 * congelaria o onboarding no idioma da primeira importacao — no app, sempre o
 * padrao.
 * ================================================================================= */

import { idiomaMadre } from './textos.js';
import { PANTALLA_CERO_EN, PREGUNTAS_EN } from './preguntas.en.js';
import { PANTALLA_CERO_ES, PREGUNTAS_ES } from './preguntas.es.js';

const CERO_POR_IDIOMA = Object.freeze({ pt: null, es: PANTALLA_CERO_ES, en: PANTALLA_CERO_EN });
const PREGUNTAS_POR_IDIOMA = Object.freeze({ pt: null, es: PREGUNTAS_ES, en: PREGUNTAS_EN });

/** A PANTALLA_CERO no idioma ativo. Campo sem traducao cai no portugues. */
export function pantallaCero() {
  const t = CERO_POR_IDIOMA[idiomaMadre()];
  if (!t) return PANTALLA_CERO;
  return congelar({
    titulo: t.titulo ?? PANTALLA_CERO.titulo,
    cuerpo: t.cuerpo ?? PANTALLA_CERO.cuerpo,
    boton: t.boton ?? PANTALLA_CERO.boton,
  });
}

/* Traduz UMA pergunta: os campos de texto trocam, o resto e o objeto PT. As
 * opcoes e os campos da data sao casados por ID — nunca por posicao —, para que
 * uma traducao fora de ordem nao troque o texto de uma opcao pelo de outra. */
function traduzir(pregunta, dict) {
  const t = dict && dict[pregunta.id];
  if (!t) return pregunta;
  const saida = {
    ...pregunta,
    texto: t.texto ?? pregunta.texto,
    microcopy: t.microcopy ?? pregunta.microcopy,
  };
  if (pregunta.placeholder !== undefined) {
    saida.placeholder = t.placeholder ?? pregunta.placeholder;
  }
  if (Array.isArray(pregunta.opciones)) {
    saida.opciones = pregunta.opciones.map((o) => ({
      ...o,
      texto: (t.opciones && t.opciones[o.id]) ?? o.texto,
    }));
  }
  if (Array.isArray(pregunta.campos)) {
    saida.campos = pregunta.campos.map((c) => {
      const tc = t.campos && t.campos[c.id];
      if (!tc) return c;
      return { ...c, rotulo: tc.rotulo ?? c.rotulo, placeholder: tc.placeholder ?? c.placeholder };
    });
  }
  return saida;
}

/** As SETE perguntas no idioma ativo: mesma ordem, mesmos ids, mesmos tipos. */
export function preguntas() {
  const dict = PREGUNTAS_POR_IDIOMA[idiomaMadre()];
  if (!dict) return PREGUNTAS;
  return congelar(PREGUNTAS.map((p) => traduzir(p, dict)));
}

/** getPregunta() no idioma ativo. undefined quando o id nao existe — nunca lanca.
 *  Quem precisa do texto que a PESSOA ve (screens/PerfilScreen.js monta o espelho
 *  com as palavras dela) chama ESTA, nao getPregunta(). */
export function pregunta(id) {
  const achada = getPregunta(id);
  if (!achada) return undefined;
  const dict = PREGUNTAS_POR_IDIOMA[idiomaMadre()];
  return dict ? congelar(traduzir(achada, dict)) : achada;
}

export default congelar({
  PANTALLA_CERO,
  PREGUNTAS,
  IDS_PREGUNTAS,
  TOTAL_PREGUNTAS,
  IDS_CONTACTO_DURO,
  IDS_GENERO,
  GENERO_NEUTRO,
});
