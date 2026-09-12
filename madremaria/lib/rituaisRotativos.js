// lib/rituaisRotativos.js
// A ROTACAO DO RITUAL DO DIA. Conteudo em datos/rituais.js; aqui vive so a
// escolha. Comentarios em portugues, como em lib/ritual.js e lib/hilo.js.
//
// ===========================================================================
// ATENCAO AO NOME: ESTE ARQUIVO NAO E lib/ritual.js
// ===========================================================================
//   lib/ritual.js        — o motor do RITUAL DE SETE DIAS. Grava progresso no
//                          disco (chave 'ritual'), tem pacto, tem fim no dia 7.
//   lib/rituaisRotativos.js (este) — o gesto de HOJE, escolhido entre cinco que
//                          giram. Nao grava nada, nao tem progresso, nao acaba.
// Os dois convivem de proposito. Se voce veio consertar "o ritual" e nao sabe
// qual, abriu o arquivo errado.
//
// ===========================================================================
// O QUE ESTE MODULO E
// ===========================================================================
// Uma funcao pura da data local para um dos cinco rituais de datos/rituais.js.
// Sem disco, sem rede, sem relogio alem do calendario, sem Math.random. Isso
// nao e purismo: e o que faz a promessa do produto ser verdade.
//
// TRES PROPRIEDADES, e as tres sao testaveis:
//
//   1. MESMO DIA = MESMO RITUAL EM QUALQUER APARELHO. Duas pessoas conversando
//      no mesmo fuso veem o mesmo gesto no mesmo dia. Com Math.random cada
//      aparelho teria o seu, e "hoje e dia do cafe" viraria frase sem
//      referente. Tambem e o que permite escrever "amanha e dia da mao" sem
//      guardar nada e sem perguntar a ninguem.
//
//   2. VIRA SOZINHO A MEIA-NOITE — a da PESSOA, nao a de Greenwich. O dia sai
//      dos campos LOCAIS da data (getFullYear/getMonth/getDate), como em
//      lib/limiteDiario.js: quem abre o app as 22h esta no dia dela. Usar UTC
//      aqui trocaria o ritual as 21h para metade do continente.
//
//   3. NUNCA DOIS DIAS SEGUIDOS O MESMO. Ver a ESCALA, abaixo.
//
// ===========================================================================
// COMO A ESCOLHA E FEITA — escala fixa, indexada por dia absoluto
// ===========================================================================
// Nao ha sorteio, nem embaralhamento por semente, nem historico consultado. Ha
// uma ESCALA escrita a mao — uma fila de 12 posicoes — e um indice:
//
//     indice = (dias desde 1970-01-01) modulo 12
//
// O ritual de hoje e ESCALA[indice]. E so isso, e a simplicidade e o ponto: a
// regra "nunca dois dias seguidos o mesmo" nao e verificada em tempo de
// execucao, ela e PROPRIEDADE DA FILA. Basta que nenhum vizinho na escala se
// repita (inclusive o ultimo com o primeiro, porque ela da a volta) para que
// nenhum par de dias consecutivos possa repetir, para sempre, sem estado.
// `verificarEscala()` confere isso e test/ existe para cobrar.
//
// POR QUE "DIAS DESDE 1970" E NAO "DIA DO ANO". Dia do ano zera em 1o de
// janeiro, e o salto de 365 para 1 quebra a vizinhanca: a garantia de nao
// repetir valeria 364 dias por ano e falharia exatamente na virada, uma vez a
// cada doze meses, no dia mais dificil de reproduzir num teste manual. Dia
// absoluto e monotono e nao tem virada nenhuma — nem de ano, nem de mes, nem de
// bissexto.
//
// O numero e calculado com Date.UTC sobre os campos LOCAIS. Parece contraditorio
// e nao e: os campos ja vem do calendario da pessoa, e o UTC entra so como
// aritmetica limpa (sem horario de verao, sem hora que "nao existe" na virada).
// Mesma tecnica do desempate por dia do ano de um app irmao.
//
// ===========================================================================
// A ESCALA — por que estas 12 posicoes, e o que cada numero compra
// ===========================================================================
// Doze posicoes com cinco rituais dentro, distribuidos assim:
//
//     cartas 3 · respiro 3 · cafe 2 · sonho 2 · mao 2
//
// · DOZE, e nao cinco. Uma fila de cinco faria cada ritual cair a cada cinco
//   dias, cravado — e o cafe (o unico com camera) cairia 73 vezes por ano.
//   Doze posicoes deixam a frequencia ser escolhida ritual a ritual em vez de
//   ser imposta pelo tamanho do catalogo.
// · DOZE, e nao sete nem quatorze. Multiplo de semana congela o ritual no dia da
//   semana: cafe cairia toda terça, para sempre. Com 12 contra 7 a fila anda
//   pela semana e so se repete no mesmo dia da semana a cada 84 dias.
// · CAFE DUAS VEZES em 12 e o teto da camera. E o unico ritual que pede
//   aparelho, xicara e cafe pronto — cai a cada 5 ou 7 dias, nunca em dias
//   seguidos, e quem nao toma cafe tem 10 dias em 12 sem esbarrar nele. Camera
//   todo dia seria o jeito mais rapido de a rotacao virar obrigacao.
// · CARTAS E RESPIRO SAO OS MAIS FREQUENTES, e por motivos opostos: cartas e o
//   centro do produto (a tiragem que ja existe) e respiro e o unico que nao pede
//   nada — e o que segura o dia em que a pessoa nao tem material nem vontade.
//
// MUDAR A ESCALA e mudar o ritmo do app inteiro. Se mexer: mantenha vizinhos
// diferentes, inclusive entre a ultima e a primeira posicao, e rode
// `verificarEscala()`. Trocar a ORDEM de datos/rituais.js, por outro lado, nao
// muda nada aqui — ordem de catalogo nunca vira ordem de exibicao.
//
// ===========================================================================
// O QUE ESTE MODULO NAO FAZ
// ===========================================================================
// · NAO GRAVA NADA. Nenhuma chave de armazenamento nova, entao nada a
//   acrescentar em CLAVES_HILO_ROJO (screens/AjustesScreen.js). Se um dia
//   alguem quiser guardar "os rituais que ela ja fez", a chave nova entra
//   NAQUELA lista antes de qualquer outra coisa — fora dela, sobrevive ao
//   "Borrar todo" e a politica de privacidade da ficha de loja vira declaracao
//   falsa.
// · NAO OLHA O CEU. Nao ha lua, transito nem efemeride aqui. Quem cruzar este
//   gesto com o ceu faz isso em outro modulo, e la vale a regra dura: sem
//   efemeride o bloco NAO RENDERIZA, nao existe lua estimada. A rotacao continua
//   inteira num aparelho sem astronomia nenhuma, porque calendario nao e ceu.
// · NAO PUNE FALTA, e nao tem como punir: nao existe aqui a nocao de "dia
//   perdido". Quem sumiu tres semanas volta e ve o ritual de hoje, igual a
//   todo mundo. Isso e OMISSAO DELIBERADA (mesma doutrina de lib/hilo.js e
//   lib/ritual.js) e nao deve ser "melhorado" depois.
// · NAO FILTRA POR CONTATO, e nao precisa: nenhum dos cinco manda procurar,
//   escrever ou aparecer para ninguem (ver datos/rituais.js). Se um dia entrar
//   na escala um ritual de encontro, ele nasce TRAVADO para quem respondeu
//   'le-escribi-no-responde' ou 'cero-contacto' na pergunta 4
//   (IDS_CONTACTO_DURO em datos/preguntas.js) — visivel, mas travado ate a
//   propria pessoa declarar que o contato voltou. O app reage ao contato; nao
//   provoca.
// · NAO LANCA. Data invalida, id inventado, n absurdo: tudo vira o
//   comportamento razoavel mais proximo, nunca uma excecao. Esta funcao roda no
//   primeiro render da tela inicial, e uma excecao aqui e tela branca.
// ===========================================================================

import { IDS_RITUAIS, RITUAIS, getRitual } from '../datos/rituais.js';

const MS_DIA = 86400000;

/* =================================================================================
 * A ESCALA. Doze posicoes, vizinhos sempre diferentes, inclusive na volta
 * (posicao 11 -> posicao 0). E o unico lugar do app que decide o ritmo dos dias.
 * ================================================================================= */
/* A ESCALA FOI REFEITA em 01/09 por decisao do dono, com a regua "so gesto que
 * MUDA a cada vez fica no giro":
 *   · 'mao' saiu — a mao e sempre a mesma; virou o gesto de ESTREIA (o primeiro
 *     dia de plano da vida dela, uma vez — ver `estreia` em lib/plano.js).
 *   · 'cartas' saiu — a releitura fixa cansa no giro; continua viva no Perfil.
 *   · Entraram 'caminhada' (a rua muda todo dia) e 'canto' (o canto e outro a
 *     cada vez). Distribuicao: caminhada 3 · respiro 3 · cafe 2 · sonho 2 ·
 *     canto 2 — cafe segue no teto de camera, posicoes 2 e 7. */
/* Gestos que EXISTEM no catalogo mas nao giram — cada um com seu porque:
 *   'mao'    — a mao nao muda; e o gesto de ESTREIA (primeiro dia de plano da
 *              vida dela, uma vez — lib/plano.js).
 *   'cartas' — a releitura das tres saiu do giro a pedido do dono ("esquece
 *              isso"); a tela de reouvir continua viva no Perfil.
 * Um id aqui e uma DECLARACAO consciente; a verificacao da escala exige que
 * todo ritual do catalogo esteja na escala OU nesta lista, nunca no limbo. */
export const FORA_DO_GIRO = Object.freeze(['mao', 'cartas']);

export const ESCALA = Object.freeze([
  'caminhada', // 0
  'respiro', // 1
  'cafe', // 2   <- camera
  'canto', // 3
  'caminhada', // 4
  'sonho', // 5
  'respiro', // 6
  'cafe', // 7   <- camera (5 dias depois da anterior)
  'canto', // 8
  'caminhada', // 9
  'sonho', // 10
  'respiro', // 11  <- vizinho da posicao 0 na volta: 'respiro' != 'caminhada'
]);

/** 12. Ninguem digita esse numero em outro lugar. */
export const TAMANHO_CICLO = ESCALA.length;

/* --- DIA LOCAL ------------------------------------------------------------------
 * Mesma regra e mesmo formato de lib/limiteDiario.js: 'YYYY-MM-DD' montado com
 * os campos LOCAIS, ano com 4 digitos para a comparacao de string funcionar.
 * Duplicado ali e aqui de proposito — sao dois contratos independentes, e nenhum
 * deve quebrar porque o outro mudou. */
const pad = (n, largo = 2) => String(n).padStart(largo, '0');

function hojeLocal() {
  const d = new Date();
  return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function esDiaValido(dia) {
  if (typeof dia !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [anio, mes, dd] = dia.split('-').map(Number);
  const t = new Date(Date.UTC(anio, mes - 1, dd));
  // Rejeita data IMPOSSIVEL ('2026-02-30'), que o construtor aceitaria rolando
  // para o mes seguinte em silencio — e um dia que nao existe nao pode virar um
  // ritual com cara de certo.
  return t.getUTCFullYear() === anio && t.getUTCMonth() === mes - 1 && t.getUTCDate() === dd;
}

/**
 * Normaliza a entrada para 'YYYY-MM-DD'.
 *
 * Aceita: undefined (hoje), um Date, ou a string 'YYYY-MM-DD'. Qualquer outra
 * coisa — Date invalido, '31/08/2026', null, numero, '2026-02-30' — CAI PARA
 * HOJE, nunca devolve undefined nem lanca. A escolha e a mesma que um app irmao
 * fez depois de uma data invalida derrubar a tela inicial: um ritual do dia
 * errado e um aborrecimento; nenhum ritual e uma tela quebrada.
 *
 * Exportada com underscore so para os testes exercitarem a virada de dia sem
 * mexer no relogio da maquina.
 */
export function _diaLocal(dia) {
  if (dia instanceof Date) {
    if (Number.isNaN(dia.getTime())) return hojeLocal();
    return `${pad(dia.getFullYear(), 4)}-${pad(dia.getMonth() + 1)}-${pad(dia.getDate())}`;
  }
  return esDiaValido(dia) ? dia : hojeLocal();
}

/**
 * Dias inteiros desde 1970-01-01, contados sobre os campos locais ja
 * normalizados. Monotono: nao tem virada de ano, de mes nem de bissexto, e e
 * por isso que a garantia de "nunca dois dias seguidos o mesmo" vale sempre, e
 * nao 364 dias por ano.
 *
 * Pode ser negativo para datas antes de 1970 — o modulo abaixo trata.
 */
export function _numeroDoDia(diaStr) {
  const [anio, mes, dd] = _diaLocal(diaStr).split('-').map(Number);
  return Math.floor(Date.UTC(anio, mes - 1, dd) / MS_DIA);
}

// Modulo que devolve sempre 0..TAMANHO_CICLO-1, inclusive para numero negativo.
// O `%` de JavaScript devolve -3 para -3 % 12, e um indice negativo daria
// undefined na escala — ou seja, nenhum ritual, num app que so precisava de um.
function indiceDeCiclo(n) {
  return ((n % TAMANHO_CICLO) + TAMANHO_CICLO) % TAMANHO_CICLO;
}

/** O indice da escala para um dia. Exportado para os testes lerem a fila direto. */
export function _indiceDoDia(dia) {
  return indiceDeCiclo(_numeroDoDia(dia));
}

// Soma dias a uma data 'YYYY-MM-DD' pela aritmetica de UTC — que nao tem hora,
// entao nao tem horario de verao nem hora inexistente na virada. Atravessa mes,
// ano e bissexto sem caso especial.
function somarDias(diaStr, quantos) {
  const [anio, mes, dd] = diaStr.split('-').map(Number);
  const t = new Date(Date.UTC(anio, mes - 1, dd) + quantos * MS_DIA);
  return `${pad(t.getUTCFullYear(), 4)}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

// A entrada do catalogo com o dia colado. O spread e proposital: RITUAIS
// continua congelado e intocado, e quem recebe isto tem o texto e a data no
// mesmo objeto — que e o que a tela e o card compartilhavel consomem. Congelado
// tambem, para ninguem "corrigir" o texto do ritual em cima da referencia da
// tela.
function comDia(id, dia, extras) {
  const base = getRitual(id);
  if (!base) return null;
  return Object.freeze({ ...base, dia, ...extras });
}

/**
 * O RITUAL DE HOJE — ou de qualquer dia que voce passar.
 *
 * @param {Date|string} [dia] Date, 'YYYY-MM-DD', ou nada para hoje. Entrada
 *   invalida cai para hoje (ver _diaLocal).
 * @returns {object} a entrada de datos/rituais.js com um campo `dia` a mais
 *   ('YYYY-MM-DD'). Nunca null: a escala e conferida contra o catalogo e, se
 *   ainda assim algo estiver fora do lugar, devolve o primeiro do catalogo em
 *   vez de nada — a tela sempre tem um gesto para mostrar.
 */
export function ritualDoDia(dia) {
  const dl = _diaLocal(dia);
  const id = ESCALA[_indiceDoDia(dl)];
  return comDia(id, dl) || Object.freeze({ ...RITUAIS[0], dia: dl });
}

/**
 * OS PROXIMOS. Comeca em AMANHA, nao em hoje: o dia de hoje ja tem o cartao
 * dele (ritualDoDia), e repetir o de hoje dentro de "os proximos" faria a tela
 * anunciar duas vezes a mesma coisa. `faltamDias` vai de 1 em diante, e 1 e
 * amanha — o mesmo vocabulario do cartao de "amanha e dia do cafe".
 *
 * @param {Date|string} [dia] o dia de referencia (o "hoje" de quem pergunta).
 * @param {number} [n=3] quantos dias para a frente. Coagido a inteiro e limitado
 *   a 0..MAX_PROXIMOS — n absurdo vindo de uma tela nao deve virar um laco de
 *   dez mil voltas no primeiro render.
 * @returns {Array<object>} lista (possivelmente vazia, nunca null) de entradas
 *   do catalogo com `dia` e `faltamDias`. Lista vazia significa "nao desenhe o
 *   cartao", nunca "desenhe um cartao de erro".
 */
export const MAX_PROXIMOS = 60;

export function proximosRituais(dia, n = 3) {
  const dl = _diaLocal(dia);
  const bruto = Number(n);
  if (!Number.isFinite(bruto)) return [];
  const quantos = Math.min(Math.max(Math.trunc(bruto), 0), MAX_PROXIMOS);

  const fila = [];
  for (let i = 1; i <= quantos; i += 1) {
    const dd = somarDias(dl, i);
    const item = comDia(ESCALA[_indiceDoDia(dd)], dd, { faltamDias: i });
    if (item) fila.push(item);
  }
  return fila;
}

/**
 * O ritual pelo id, direto do catalogo (sem campo `dia`). Devolve undefined
 * quando o id nao existe — nunca lanca. Reexportado daqui para que as telas
 * tenham uma porta so para a rotacao e nao precisem importar dois modulos.
 */
export function ritualPorId(id) {
  return getRitual(id);
}

/**
 * O PORTAO DA ESCALA. Nao roda sozinho e nao lanca — quem cobra e o teste.
 *
 * Confere as tres coisas que, quebradas, estragam a rotacao em silencio, sem
 * erro nenhum no console:
 *   1. todo id da escala existe em datos/rituais.js (id renomeado no catalogo
 *      deixaria um dia sem ritual);
 *   2. nenhum vizinho se repete, INCLUSIVE o ultimo com o primeiro (e a volta
 *      que da a garantia de nunca repetir dois dias seguidos);
 *   3. todo ritual do catalogo aparece pelo menos uma vez (ritual escrito e
 *      nunca exibido e trabalho jogado fora, e ninguem descobre olhando a tela).
 *
 * @returns {{ok: boolean, problemas: string[]}}
 */
export function verificarEscala() {
  const problemas = [];

  ESCALA.forEach((id, i) => {
    if (!getRitual(id)) problemas.push(`posicao ${i}: id "${id}" nao existe em datos/rituais.js`);
  });

  for (let i = 0; i < TAMANHO_CICLO; i += 1) {
    const seguinte = (i + 1) % TAMANHO_CICLO;
    if (ESCALA[i] === ESCALA[seguinte]) {
      problemas.push(
        `posicoes ${i} e ${seguinte} repetem "${ESCALA[i]}": dois dias seguidos com o mesmo ritual`
      );
    }
  }

  IDS_RITUAIS.forEach((id) => {
    if (!ESCALA.includes(id) && !FORA_DO_GIRO.includes(id))
      problemas.push(`o ritual "${id}" existe no catalogo, nao esta na escala e nao esta declarado em FORA_DO_GIRO`);
  });

  return { ok: problemas.length === 0, problemas };
}

export default { ritualDoDia, proximosRituais, ritualPorId };
