// datos/sinastria.js
// O CONTEUDO do ritmo dos dois — os textos, e so os textos. A logica (distancia,
// aspecto, resolucao de placeholder, persistencia) mora em lib/sinastria.js.
//
// ===================================================================================
// DE ONDE ISTO VEIO
// ===================================================================================
// Portado em 01/09/2026 do motor de sinastria do Cosmic Guide (lib/synastry.js e
// traducoes/synastry.pt.js do outro app do dono), que le DOIS SIGNOS SOLARES e
// nada mais. As fontes de la valem aqui:
//
//   · Ptolomeu, Tetrabiblos I.13 — trigono e sextil harmonicos; quadratura e
//     oposicao desarmonicos. I.16 — signos a 1 e a 5 de distancia nao se veem
//     ("disjunct and alien"): e a aversao, e 30 e 150 tem leituras DIFERENTES.
//   · Aristoteles, Da Geracao e Corrupcao II.3 — os quatro elementos.
//   · Linda Goodman, Sun Signs (1968) e Love Signs (1978) — a popularizacao da
//     compatibilidade por signo solar EM PROSA E SEM PERCENTUAL. E por isso que
//     aqui nao existe placar, nota nem porcentagem: a tradicao inteira e prosa.
//
// A REGRA DA CASA, herdada de la e reafirmada pela doutrina deste app: isto e uma
// lente para conversar, nunca um veredito. Nenhum texto abaixo afirma o que a
// outra pessoa sente, promete desfecho, ou da nota ao par.
//
// {el:fogo} / {el:terra} / {el:ar} / {el:agua} — placeholder resolvido em
// lib/sinastria.js pelo NOME DO SIGNO daquele lado do par (ex.: "Peixes").
// A chave dos pares mistos usa os dois elementos em ordem alfabetica SEM acento
// ("agua" e nao "água") — decisao de portabilidade: chave com acento e fragil a
// normalizacao unicode, e busca byte-sensivel com acento ja quebrou no app de
// origem (a ORDEM_ELEMENTO de la existe exatamente para nao depender de sort).

/* NA CAMA, pela FIGURA entre os signos (a distancia no zodiaco). */
export const CAMA_POR_ASPECTO = Object.freeze({
  copresenca:
    'vocês querem a mesma coisa na mesma hora, e ninguém puxa: não há de onde um olhar o outro de cima',
  trigono:
    'vocês pegam o ritmo na primeira noite, e o problema aqui nunca é falta de vontade',
  sextil:
    'começa mais devagar do que os dois esperavam e melhora com o tempo, que é o contrário do que costuma acontecer',
  quadratura: 'o que irrita de dia é exatamente o que puxa de noite',
  oposicao:
    'na cama a discussão do dia continua por outros meios, e é aí que ela funciona',
  aversao30:
    'no começo um dos dois sempre acha que quer mais que o outro, e quase nunca é verdade: é só o tempo de resposta que é diferente',
  aversao150:
    'a vontade não chega junto, chega quando um dos dois decide que chegou',
});

/* NA CAMA, pelo PAR DE ELEMENTOS. */
export const CAMA_POR_ELEMENTOS = Object.freeze({
  'fogo+fogo':
    'Fogo com fogo acende rápido, esquenta alto e não tem a menor paciência com rodeio.',
  'terra+terra':
    'Terra com terra é desejo físico e sem pressa: pele, cheiro, repetição, e um gosto declarado por aquilo que já se sabe que funciona.',
  'ar+ar':
    'Ar com ar acende pela cabeça — uma frase certa na hora certa vale mais aqui do que qualquer investida.',
  'agua+agua':
    'Água com água é desejo emocional antes de ser físico: quando o clima está torto, o corpo sabe primeiro.',
  'ar+fogo':
    '{el:ar} acende pela cabeça e {el:fogo} acende pelo corpo, e é esse desencontro de porta de entrada que mantém os dois curiosos.',
  'agua+terra':
    '{el:agua} entra pelo clima e {el:terra} entra pelo toque, e as duas portas dão no mesmo lugar — é um desejo mais fácil de sustentar do que de explicar.',
  'fogo+terra':
    '{el:fogo} quer agora e {el:terra} quer bem feito: o atrito começa no relógio, e é o mesmo atrito que segura a atração.',
  'agua+fogo':
    '{el:fogo} avança e {el:agua} sente antes de responder — quando o tempo dos dois coincide é elétrico, e quando não coincide um se sente recusado e o outro apressado.',
  'ar+terra':
    '{el:ar} quer conversar sobre o desejo e {el:terra} quer praticá-lo em silêncio, e nenhum dos dois entende de imediato por que o outro insiste no contrário.',
  'agua+ar':
    '{el:agua} precisa de clima e {el:ar} precisa de leveza: funciona muito bem enquanto ninguém cobra do outro a própria língua.',
});

/* NA CONVERSA, pelo par de elementos. */
export const CONVERSA_POR_ELEMENTOS = Object.freeze({
  'fogo+fogo':
    'Dois de fogo falam alto, se empolgam juntos e cortam a frase um do outro sem maldade: o assunto anda mais rápido que a escuta.',
  'terra+terra':
    'Dois de terra conversam pouco e resolvem muito, e o que os dois chamam de conversa costuma ser um combinado prático.',
  'ar+ar':
    'Dois de ar conversam por esporte, e o que trava não é falta de assunto — é falta de conclusão.',
  'agua+agua':
    'Duas águas dizem muito sem dizer: metade da conversa acontece em olhar, tom e silêncio, e a outra metade fica pra depois.',
  'ar+fogo':
    '{el:ar} traz o assunto e {el:fogo} traz a opinião, e é uma conversa rápida que raramente entedia.',
  'agua+terra':
    '{el:agua} fala do que sentiu e {el:terra} responde com o que dá pra fazer, e falta combinar quando um quer solução e quando quer só ser ouvido.',
  'fogo+terra':
    '{el:fogo} fala em bloco e já quer decidir, {el:terra} pede detalhe antes de concordar, e o que trava é ritmo e não conteúdo.',
  'agua+fogo':
    '{el:fogo} diz a coisa direta que {el:agua} costuma remoer por dias, e o assunto às vezes reaparece na semana seguinte.',
  'ar+terra':
    '{el:ar} teoriza e {el:terra} quer o exemplo concreto: o mal-entendido clássico é um achar o outro raso e o outro achar o primeiro complicado.',
  'agua+ar':
    '{el:ar} explica o sentimento e {el:agua} sente a explicação, e quando esquenta um foge pra lógica e o outro foge pro silêncio.',
});

/* NA BRIGA, pelo par de elementos. */
export const BRIGA_POR_ELEMENTOS = Object.freeze({
  'fogo+fogo':
    'Os dois explodem, e explodem juntos: sobe em dez segundos e desce quase tão rápido, desde que ninguém guarde.',
  'terra+terra':
    'Nenhum dos dois grita: os dois emburram, trabalham calados e deixam a conversa envelhecer por dias.',
  'ar+ar':
    'O desentendimento vira debate, ganha quem argumenta melhor, e é por isso que ninguém sai satisfeito.',
  'agua+agua':
    'Ninguém diz o que doeu na hora: os dois se afastam, choram separados e voltam quando o clima muda sozinho.',
  'ar+fogo':
    '{el:fogo} explode e {el:ar} racionaliza, e nada irrita mais quem está com raiva do que ouvir um argumento bem montado.',
  'agua+terra':
    '{el:agua} se magoa e {el:terra} endurece, e o silêncio dos dois tem sentidos diferentes que ninguém traduz.',
  'fogo+terra':
    '{el:fogo} bate o pé na hora e {el:terra} não responde, e volta ao assunto três dias depois com tudo anotado.',
  'agua+fogo':
    '{el:fogo} grita e esquece, {el:agua} não grita e não esquece: é diferença de memória, não de amor.',
  'ar+terra':
    '{el:ar} quer discutir a relação e {el:terra} quer parar de falar e agir, e cada um chama o método do outro de fuga.',
  'agua+ar':
    '{el:ar} vira o assunto em piada pra desanuviar e {el:agua} entende a piada como pouco caso.',
});

/* QUANDO HOUVER CONVERSA — o passo pratico, pelo ELEMENTO DA OUTRA PESSOA.
 *
 * Escrito nesta casa (nao veio do Cosmic Guide). As regras que estes quatro
 * paragrafos obedecem, e test/madremaria-sinastria.test.js confere:
 *   · condicional sempre — "quando houver conversa", nunca "va falar com";
 *   · descreve COMO falar, nunca o que a outra pessoa vai responder;
 *   · neutro de genero: fala do SIGNO, nunca de "ele" ou "ela". */
export const FALAR_POR_ELEMENTO = Object.freeze({
  fogo: 'Com um signo de fogo, a conversa boa é curta e direta: diga o que você quer no primeiro minuto, sem preparar o terreno. Rodeio, pra fogo, soa como armadilha.',
  terra:
    'Com um signo de terra, a palavra dita vale menos que a coisa feita: uma proposta concreta, com dia e hora, abre mais porta que qualquer declaração.',
  ar: 'Com um signo de ar, comece por uma ideia, não por uma cobrança: ar entra pela conversa interessante e sai da conversa pesada. Leveza primeiro, o resto depois.',
  agua: 'Com um signo de água, o tom importa mais que a frase: escolha a hora calma e diga o que você sentiu, não o que a pessoa fez. Acusação fecha água na hora.',
});

/* O nome de cada figura, para a linha do par na tela. "Sem aspecto" e o nome
 * honesto da aversao — Ptolomeu (I.16) diz que esses signos nao se veem, e
 * inventar um nome mais bonito seria fabricar ceu. */
export const NOME_DO_ASPECTO = Object.freeze({
  copresenca: 'o mesmo signo',
  trigono: 'trígono, a figura fácil',
  sextil: 'sextil, a figura amiga',
  quadratura: 'quadratura, a figura de atrito',
  oposicao: 'oposição, a figura de espelho',
  aversao30: 'sem aspecto — signos vizinhos não se veem',
  aversao150: 'sem aspecto — a distância que não se vê',
});

/* =================================================================================
 * OS TRES IDIOMAS
 * =================================================================================
 * PT fica ACIMA, nos exports originais, e continua sendo o que os portoes de
 * doutrina varrem (test/madremaria-sinastria.test.js importa CAMA_POR_ASPECTO e as
 * outras quatro tabelas direto). ES e EN moram em arquivos VIZINHOS
 * — datos/sinastria.es.js e datos/sinastria.en.js —, um por idioma, disjuntos.
 *
 * O idioma ativo chega por datos/textos.js (espelho de modulo, empurrado por
 * setIdiomaMadre no corpo do render de MadreMariaApp.js). Nao e hook de proposito:
 * lib/sinastria.js e logica pura, exercitada por node:test sem React.
 *
 * FALLBACK POR CHAVE, nao por tabela: chave sem traducao cai no PORTUGUES, nunca
 * na chave crua nem em texto inventado. `?? PT[k]` e nao `|| PT[k]` de proposito —
 * string vazia numa traducao e defeito a ser visto, nao silenciado (mesma regra de
 * valorDe() em datos/textos.js).
 *
 * POR QUE FUNCAO E NAO CONSTANTE: o idioma muda em runtime. Uma constante montada
 * na carga do modulo congelaria a tabela no idioma da primeira importacao — que,
 * no app, e sempre o padrao.
 * ================================================================================= */

import { idiomaMadre } from './textos.js';
import {
  BRIGA_POR_ELEMENTOS_EN,
  CAMA_POR_ASPECTO_EN,
  CAMA_POR_ELEMENTOS_EN,
  CONVERSA_POR_ELEMENTOS_EN,
  FALAR_POR_ELEMENTO_EN,
  NOME_DO_ASPECTO_EN,
} from './sinastria.en.js';
import {
  BRIGA_POR_ELEMENTOS_ES,
  CAMA_POR_ASPECTO_ES,
  CAMA_POR_ELEMENTOS_ES,
  CONVERSA_POR_ELEMENTOS_ES,
  FALAR_POR_ELEMENTO_ES,
  NOME_DO_ASPECTO_ES,
} from './sinastria.es.js';

/* Uma entrada por tabela. A CHAVE de cada tabela e tecnica e identica nos tres
 * idiomas ('agua+fogo', 'aversao30'): e isso que faz o fallback por chave valer. */
const POR_IDIOMA = Object.freeze({
  CAMA_POR_ASPECTO: { pt: CAMA_POR_ASPECTO, es: CAMA_POR_ASPECTO_ES, en: CAMA_POR_ASPECTO_EN },
  CAMA_POR_ELEMENTOS: {
    pt: CAMA_POR_ELEMENTOS,
    es: CAMA_POR_ELEMENTOS_ES,
    en: CAMA_POR_ELEMENTOS_EN,
  },
  CONVERSA_POR_ELEMENTOS: {
    pt: CONVERSA_POR_ELEMENTOS,
    es: CONVERSA_POR_ELEMENTOS_ES,
    en: CONVERSA_POR_ELEMENTOS_EN,
  },
  BRIGA_POR_ELEMENTOS: {
    pt: BRIGA_POR_ELEMENTOS,
    es: BRIGA_POR_ELEMENTOS_ES,
    en: BRIGA_POR_ELEMENTOS_EN,
  },
  FALAR_POR_ELEMENTO: { pt: FALAR_POR_ELEMENTO, es: FALAR_POR_ELEMENTO_ES, en: FALAR_POR_ELEMENTO_EN },
  NOME_DO_ASPECTO: { pt: NOME_DO_ASPECTO, es: NOME_DO_ASPECTO_ES, en: NOME_DO_ASPECTO_EN },
});

/**
 * A tabela `nome` no idioma ATIVO, com fallback por chave para o portugues.
 * `nome` e um dos seis: 'CAMA_POR_ASPECTO', 'CAMA_POR_ELEMENTOS',
 * 'CONVERSA_POR_ELEMENTOS', 'BRIGA_POR_ELEMENTOS', 'FALAR_POR_ELEMENTO',
 * 'NOME_DO_ASPECTO'. Nome desconhecido devolve {} — nunca lanca.
 */
export function tabela(nome) {
  const familia = POR_IDIOMA[nome];
  if (!familia) return {};
  const pt = familia.pt;
  const traduzido = familia[idiomaMadre()];
  if (!traduzido || traduzido === pt) return pt;
  const saida = {};
  for (const k of Object.keys(pt)) saida[k] = traduzido[k] ?? pt[k];
  return Object.freeze(saida);
}
