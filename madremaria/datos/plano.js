// datos/plano.js
// O CONTEUDO DO PLANO DO DIA: cinco rituais rotativos, as reflexoes e as
// afirmacoes. O motor mora em lib/plano.js; a copy de tela mora em
// datos/textos.js, bloco `plano.*`. Este arquivo so tem o material.
//
// (Mesma divisao de datos/ritual.js + o bloco `ritual.*` de textos.js: o ritual
// de sete dias ja foi montado assim e nao ha motivo para um segundo desenho.)
//
// ===========================================================================
// AS TRES LINHAS QUE ESTE ARQUIVO NAO ATRAVESSA
// ===========================================================================
// 1. Nenhum texto daqui depende do ceu. O ceu ENTRA no plano quando existe e
//    some quando nao existe — o ritual, a reflexao e a afirmacao do dia sao
//    sempre inteiros. Um ritual que so fizesse sentido "na Lua Cheia" viraria
//    um dia vazio no aparelho sem efemeride.
// 2. Nenhum texto promete desfecho nem diz o que a outra pessoa faz, sente ou
//    decide. O ceu descreve o DIA; o ritual descreve um gesto DELA.
// 3. Nenhum gesto empurra para fora: nao ha aqui procurar, ligar, insistir,
//    aparecer. Nem sequer nas versoes suaves ("deixa um sinal", "faz saber").
//    O app reage ao contato; nao provoca.
//
// ===========================================================================
// POR QUE OS GESTOS SAO OBSERVAVEIS
// ===========================================================================
// Todo `acao` termina em algo que pode ser respondido com sim ou nao no fim do
// dia: a foto foi tirada ou nao, o papel foi guardado ou nao. "Reconecte-se com
// sua essencia" nao e uma acao, e um enfeite — e um plano diario feito de
// enfeites e indistinguivel de nao ter plano nenhum.

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * OS CINCO RITUAIS
 *
 * Forma de cada item (o esquema vem do app que serviu de molde, o conteudo nao):
 *   { id, titulo, acao, porque, camera,
 *     momento: { fasesLua: [], diasSemana: [] } }
 *
 * `momento` declara QUANDO aquele gesto cai melhor, e as duas listas tem a mesma
 * semantica: lista VAZIA quer dizer "nao declaro este criterio" e nunca "nenhum".
 * O motor usa isso para dizer se hoje bate — e, sem efemeride, para calar sobre a
 * fase em vez de fingir que ela nao bate.
 *
 * `camera` marca o unico gesto que pede a camera. Ele nao pode cair todo dia: um
 * plano diario que pede foto sempre vira tarefa, e tarefa e a primeira coisa que
 * se abandona.
 *
 * `diasSemana` usa o indice de Date.getDay(): 0 = domingo.
 * ================================================================================= */
export const RITUAIS = congelar([
  {
    id: 'cafe-da-manha',
    titulo: 'O café de hoje',
    acao: 'Faça o café com calma e tire uma foto da xícara antes do primeiro gole.',
    porque: 'A foto fica neste telefone. É um registro do seu dia, não um recado para ninguém.',
    camera: true,
    momento: { fasesLua: [], diasSemana: [1, 2, 3, 4, 5] },
  },
  {
    id: 'linha-no-papel',
    titulo: 'Uma linha no papel',
    acao: 'Anote em um papel a frase que ficou entalada e guarde o papel na gaveta.',
    porque:
      'Sem nome nenhum no papel: com nome, o gesto deixa de ser sobre o que você sente e vira algo dirigido a outra pessoa.',
    camera: false,
    momento: { fasesLua: ['Lua Nova', 'Lua Crescente'], diasSemana: [5] },
  },
  {
    id: 'leitura-da-mao',
    titulo: 'A leitura da mão',
    acao: 'Abra a mão sob uma luz boa e siga a linha mais longa com o dedo, do começo ao fim, três vezes.',
    porque:
      'Ler a própria mão é prática antiga e aqui ela serve de pausa. A mão que você está olhando é a sua.',
    camera: false,
    momento: { fasesLua: [], diasSemana: [3] },
  },
  {
    id: 'caminho-de-volta',
    titulo: 'Dez minutos de rua',
    acao: 'Saia por dez minutos e volte por um caminho diferente do que você fez na ida.',
    porque: 'Trocar o trajeto troca o que você repara. É só isso, e já é bastante para um dia.',
    camera: false,
    // Os nomes de fase sao NOME CANONICO, nao texto: casam byte a byte com FASES
    // de lib/ceu.js. Tirar o "Lua " de "Lua Gibosa Minguante" nao quebra nada —
    // so faz este ritual parar de casar com a fase, EM SILENCIO, para sempre.
    momento: {
      fasesLua: ['Lua Gibosa Minguante', 'Quarto Minguante', 'Lua Minguante'],
      diasSemana: [],
    },
  },
  {
    id: 'mesa-posta',
    titulo: 'A mesa posta',
    acao: 'Ponha a mesa para você — prato, copo, guardanapo — e coma sentada, sem telefone.',
    porque: 'Comer de pé é o jeito mais rápido de um dia inteiro passar sem você dentro dele.',
    camera: false,
    momento: { fasesLua: ['Lua Cheia'], diasSemana: [5, 6] },
  },
]);

/* =================================================================================
 * REFLEXOES — sete, uma por rotacao.
 * Todas sao PERGUNTA, e toda pergunta e sobre ela. Nenhuma pergunta pelo que a
 * outra pessoa pensa: essa e a pergunta que o app nao tem como responder e que,
 * feita todo dia, vira ruminacao.
 * ================================================================================= */
export const REFLEXOES = congelar([
  'O que você sentiu falta hoje: da pessoa ou da rotina que vocês tinham?',
  'Do que aconteceu, qual parte ainda dói e qual parte só incomoda?',
  'Se ninguém estivesse olhando, o que você faria com esta tarde?',
  'Qual coisa boa desse vínculo já existia antes dele e continua sua?',
  'O que você aprendeu a fazer sozinha nestes últimos meses?',
  'Você está esperando um sinal ou está esperando uma decisão sua?',
  'Qual limite você deixou passar uma vez e não deixaria de novo?',
]);

/* =================================================================================
 * AFIRMACOES — onze, uma por rotacao.
 *
 * Onze e sete sao primos entre si e com cinco: as tres rotacoes so voltam a
 * coincidir a cada 385 dias, entao a combinacao do dia quase nunca se repete
 * dentro de um ano. Nenhum sorteio, nenhum Math.random — so aritmetica de dia.
 *
 * Todas no presente. Afirmacao no futuro ("um dia eu vou entender") e promessa
 * com outra roupa, e promessa e o que este produto nao vende.
 * ================================================================================= */
export const AFIRMACOES = congelar([
  'Eu posso sentir saudade e ainda assim não dar nenhum passo hoje.',
  'O meu extremo do fio é meu, e é o único que eu seguro.',
  'Eu não devo explicação sobre o tempo que estou levando.',
  'Hoje eu cuido da minha parte, que é a parte que existe de fato.',
  'Eu tenho o direito de mudar de ideia sem avisar ninguém.',
  'Silêncio não é resposta, e também não é castigo.',
  'Eu não preciso entender tudo hoje para viver o dia de hoje.',
  'A minha calma não está guardada com mais ninguém.',
  'Eu escolho o que faço com a minha noite.',
  'Nada em mim está quebrado por essa história não ter fechado.',
  'Eu sou a pessoa mais constante desta história.',
]);

/* =================================================================================
 * ENCONTROS — a acao concreta de encontro.
 *
 * ESTA LISTA SO EXISTE PARA QUEM TEM CONTATO. Com 'le-escribi-no-responde',
 * 'cero-contacto' ou bloqueio, o motor NAO le este array: o bloco de encontro sai
 * travado, com o motivo escrito, e nenhuma destas frases chega perto da tela.
 * Por isso elas podem falar de mesa, de hora e de encontro sem rodeio — e por isso
 * o portao varre a saida inteira, e nao so o campo `encontro`, quando o contato e
 * duro: um vazamento destas quatro linhas para aquele estado e o pior bug possivel
 * deste modulo.
 *
 * Nenhuma delas promete desfecho, mesmo com contato ativo. Marcar uma mesa e uma
 * acao dela; o que acontece na mesa nao e assunto de um app de tarot.
 * ================================================================================= */
export const ENCONTROS = congelar([
  'Escolha um lugar onde você já foi feliz sozinha e reserve a hora no seu dia.',
  'Deixe uma noite livre de verdade na agenda, sem plano B e sem hora de acabar.',
  'Ofereça uma mesa e um horário, curtos e claros: um café de trinta minutos basta.',
  'Marque algo que você faria de qualquer jeito, e abra uma cadeira.',
]);

/* =================================================================================
 * OS TRES IDIOMAS
 * =================================================================================
 * PT fica ACIMA e continua sendo o que os portoes varrem (test/madremaria-plano.js
 * e a rede de runtime de lib/plano.js leem a copy portuguesa, que e onde a regra
 * nasce). ES e EN moram em arquivos VIZINHOS — datos/plano.es.js e
 * datos/plano.en.js —, um por idioma, disjuntos.
 *
 * O que NAO esta nos vizinhos, de proposito: `id`, `camera` e `momento`
 * (fasesLua/diasSemana). Sao estrutura, e os nomes de fase casam BYTE A BYTE com
 * FASES de lib/ceu.js — traduzir 'Lua Cheia' faria o ritual parar de casar com a
 * fase em silencio. Daqui sai sempre o item PT inteiro com os tres campos de
 * TEXTO (titulo, acao, porque) trocados.
 *
 * A CONTAGEM E A ORDEM continuam sendo as do PT: lib/plano.js roda a rotacao por
 * INDICE (indiceDaVolta(REFLEXOES.length, giro)) e 5/7/11 sao primos entre si de
 * proposito. As listas traduzidas sao lidas POSICAO A POSICAO do PT, e uma lista
 * curta cai no portugues naquela posicao em vez de encurtar a rotacao.
 *
 * Fallback por ITEM, nunca por lista, e `??` e nao `||`: string vazia e defeito de
 * traducao a ser visto, nao silenciado (mesma regra de valorDe() em textos.js).
 * ================================================================================= */

import { idiomaMadre } from './textos.js';
import {
  AFIRMACOES_EN,
  ENCONTROS_EN,
  REFLEXOES_EN,
  RITUAIS_EN,
} from './plano.en.js';
import {
  AFIRMACOES_ES,
  ENCONTROS_ES,
  REFLEXOES_ES,
  RITUAIS_ES,
} from './plano.es.js';

const RITUAIS_POR_IDIOMA = Object.freeze({ pt: null, es: RITUAIS_ES, en: RITUAIS_EN });
const LISTAS_POR_IDIOMA = Object.freeze({
  REFLEXOES: { pt: null, es: REFLEXOES_ES, en: REFLEXOES_EN },
  AFIRMACOES: { pt: null, es: AFIRMACOES_ES, en: AFIRMACOES_EN },
  ENCONTROS: { pt: null, es: ENCONTROS_ES, en: ENCONTROS_EN },
});

/**
 * Os CINCO rituais no idioma ativo: mesma ordem, mesmos ids, mesmo `camera` e
 * mesmo `momento` do PT — so titulo/acao/porque trocam. Campo sem traducao cai no
 * portugues.
 */
export function rituais() {
  const dict = RITUAIS_POR_IDIOMA[idiomaMadre()];
  if (!dict) return RITUAIS;
  return congelar(
    RITUAIS.map((r) => {
      const t = dict[r.id];
      if (!t) return r;
      return {
        ...r,
        titulo: t.titulo ?? r.titulo,
        acao: t.acao ?? r.acao,
        porque: t.porque ?? r.porque,
      };
    })
  );
}

/**
 * Uma das tres listas de frase no idioma ativo: 'REFLEXOES', 'AFIRMACOES' ou
 * 'ENCONTROS'. MESMO comprimento do PT sempre — a rotacao do plano depende dele.
 * Posicao sem traducao devolve a frase portuguesa daquela posicao.
 * Nome desconhecido devolve [] (nunca undefined: quem chama indexa).
 */
export function lista(nome) {
  const familia = LISTAS_POR_IDIOMA[nome];
  if (!familia) return [];
  const pt = { REFLEXOES, AFIRMACOES, ENCONTROS }[nome];
  const traduzida = familia[idiomaMadre()];
  if (!traduzida) return pt;
  return congelar(pt.map((frase, i) => traduzida[i] ?? frase));
}

export default congelar({ RITUAIS, REFLEXOES, AFIRMACOES, ENCONTROS });
