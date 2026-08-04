// O TEXTO DO "CÉU DE HOJE", nas três línguas.
//
// POR QUE ESTE ARQUIVO EXISTE (03/08/2026): lib/personalSky.js montava a frase
// de cada trânsito a partir de dois objetos em português puro — ASPECT_MEANING
// e TEMPO_INFO — sem receber `lang` nenhum. Resultado: o card mais visível da
// Home, o que a pessoa lê todo dia, saía 100% em português para quem estava
// com o app em espanhol ou inglês. Não era um pedaço solto: era a leitura
// inteira, o nome dos planetas junto.
//
// POR QUE UM ARQUIVO SÓ, e não três (personalSky.pt/es/en como nos outros
// módulos): aqui são 5 frases-modelo e 3 camadas de tempo, não um pack de
// conteúdo com fontes, verbatins e datação. Três arquivos de 20 linhas cada
// custariam mais pra manter em sincronia do que o que economizam.
//
// OS NOMES DOS PLANETAS NÃO MORAM AQUI. Eles já estão traduzidos em
// lib/traducoes/transitoFase.{pt,es,en}.js (PLANETAS_FRASE), que é o pack que
// lê os MESMOS `aspectType` e as MESMAS chaves de planeta que personalSky
// devolve. Duplicar aqui seria criar uma segunda verdade que um dia diverge —
// "Netuno" virando "Neptuno" num arquivo e "Neptuno" no outro.
//
// AS CHAVES CONTINUAM EM PORTUGUÊS ('Conjunção', 'rapido') porque são DADO,
// não texto: é o que personalSkyToday devolve em `aspectType` e `tempo`, e é o
// que transitoFase.js casa do outro lado. Traduzir chave quebraria os dois.
import { PACK as TRANSITO_PT } from './transitoFase.pt';
import { PACK as TRANSITO_ES } from './transitoFase.es';
import { PACK as TRANSITO_EN } from './transitoFase.en';

// A camada temporal de cada trânsito: `quando` entra no meio da frase, `nota`
// vai grudada no fim. A ressalva do trânsito lento é a parte mais importante
// do conjunto — é ela que impede a pessoa de ler "capítulo de vida" como
// "notícia de hoje" — e por isso está inteira nas três línguas, não resumida.
const TEMPO_TEXTO = {
  pt: {
    rapido: { quando: 'de hoje', nota: '' },
    medio: {
      quando: 'destas semanas',
      nota: ' É trânsito de semanas, não do dia — vale acompanhar, não decidir de imediato.',
    },
    lento: {
      quando: 'deste período',
      nota:
        ' É trânsito lento: dura meses e ainda volta a passar por causa das retrogradações. ' +
        'Leia como capítulo de vida, não como notícia do dia.',
    },
  },
  es: {
    rapido: { quando: 'de hoy', nota: '' },
    medio: {
      quando: 'de estas semanas',
      nota: ' Es un tránsito de semanas, no del día — conviene seguirlo, no decidir de inmediato.',
    },
    lento: {
      quando: 'de este período',
      nota:
        ' Es un tránsito lento: dura meses y todavía vuelve a pasar por las retrogradaciones. ' +
        'Léelo como un capítulo de vida, no como noticia del día.',
    },
  },
  en: {
    rapido: { quando: 'today', nota: '' },
    medio: {
      quando: 'these weeks',
      nota: ' This is a transit of weeks, not of the day — worth following, not worth deciding on right away.',
    },
    lento: {
      quando: 'this period',
      nota:
        ' This is a slow transit: it lasts months and comes back around through the retrogrades. ' +
        'Read it as a chapter of your life, not as news of the day.',
    },
  },
};

// {t} = planeta em trânsito, {n} = planeta natal, {quando} = a camada acima.
//
// O TOM É O MESMO DAS TRÊS: espelho, nunca promessa. Nenhuma delas diz o que
// VAI acontecer nem promete resultado — "convida a um ajuste", "tende a andar
// com menos esforço". Traduzir para "will bring" ou "traerá" quebraria a regra
// de promessa que test/semPromessas.test.js trava.
// {seu}/{ao}/{pro} existem SÓ por causa do gênero em português. Dos dez
// planetas, um é feminino: a Lua. O código antigo montava "se soma ao seu Lua
// natal" — errado em português desde sempre, e ninguém tinha reparado porque
// só aparece quando o trânsito cai justo na Lua natal. Espanhol usa "tu" pros
// dois gêneros e inglês usa "your", então lá os três tokens são constantes.
const ASPECTO_TEXTO = {
  pt: {
    'Conjunção': '{t} {quando} se soma {ao} {seu} {n} natal — intensidade extra nessa área, boa pra usar com intenção.',
    'Sextil': '{t} {quando} abre uma porta suave {pro} {seu} {n} natal — oportunidade leve, basta dar o primeiro passo.',
    'Quadratura': '{t} {quando} tensiona {seu} {n} natal — atrito que convida a um ajuste, não a uma briga.',
    'Trígono': '{t} {quando} flui em harmonia com {seu} {n} natal — essa área tende a andar com menos esforço.',
    'Oposição':
      '{t} {quando} puxa na direção oposta {ao} {seu} {n} natal — momento de equilibrar os dois lados em vez de escolher um.',
  },
  es: {
    'Conjunção': '{t} {quando} se suma {ao} {seu} {n} natal — intensidad extra en esa área, buena para usar con intención.',
    'Sextil': '{t} {quando} abre una puerta suave {pro} {seu} {n} natal — oportunidad leve, basta con dar el primer paso.',
    'Quadratura': '{t} {quando} tensiona {seu} {n} natal — roce que invita a un ajuste, no a una pelea.',
    'Trígono': '{t} {quando} fluye en armonía con {seu} {n} natal — esa área tiende a andar con menos esfuerzo.',
    'Oposição':
      '{t} {quando} tira en dirección opuesta {ao} {seu} {n} natal — momento de equilibrar los dos lados en vez de elegir uno.',
  },
  en: {
    'Conjunção': '{t} {quando} adds itself to your natal {n} — extra intensity in that area, good to use on purpose.',
    'Sextil': '{t} {quando} opens a gentle door to your natal {n} — a light opening, it just takes the first step.',
    'Quadratura': '{t} {quando} puts tension on your natal {n} — friction that invites an adjustment, not a fight.',
    'Trígono': '{t} {quando} flows in harmony with your natal {n} — that area tends to move with less effort.',
    'Oposição':
      '{t} {quando} pulls the opposite way from your natal {n} — a moment to balance both sides instead of picking one.',
  },
};

// DUAS FORMAS DE CADA PLANETA, e o lugar decide qual:
//
//   {t} é SUJEITO da frase e leva o artigo    — "el Sol se suma", "the Sun adds"
//   {n} vem depois de possessivo e NÃO leva   — "tu Sol natal", "your natal Sun"
//
// Usar a forma com artigo nos dois lugares produzia "tu el Sol natal" e "your
// the Moon" — o teste pegou isso na primeira rodada. O pack de transitoFase já
// mantinha as duas listas separadas exatamente por isso (`planetas` é o rótulo
// puro, `planetasFrase` é a forma de frase); aqui só apontamos cada uma pro
// buraco certo do modelo.
const PLANETA_SUJEITO = {
  pt: TRANSITO_PT.planetasFrase,
  es: TRANSITO_ES.planetasFrase,
  en: TRANSITO_EN.planetasFrase,
};

const PLANETA_POSSESSIVO = {
  pt: TRANSITO_PT.planetas,
  es: TRANSITO_ES.planetas,
  en: TRANSITO_EN.planetas,
};

// A Lua é o único planeta feminino da lista — a chave é a interna, em PT.
const FEMININOS = new Set(['Lua']);

// A flexão que acompanha o planeta natal em cada língua. Em espanhol as três
// formas não mudam com o gênero ("tu Luna", "tu Sol"), mas passam pelo mesmo
// caminho pra que o modelo da frase seja um só nas duas línguas latinas.
const FLEXAO = {
  pt: {
    feminino: { seu: 'sua', ao: 'à', pro: 'pra' },
    masculino: { seu: 'seu', ao: 'ao', pro: 'pro' },
  },
  es: {
    feminino: { seu: 'tu', ao: 'a', pro: 'a' },
    masculino: { seu: 'tu', ao: 'a', pro: 'a' },
  },
  // Inglês não usa os tokens: os modelos em `en` já vêm escritos inteiros.
  en: {
    feminino: { seu: 'your', ao: 'to', pro: 'to' },
    masculino: { seu: 'your', ao: 'to', pro: 'to' },
  },
};

// Idioma fora dos três cai no PT — mesmo fallback de lib/i18n.js, de
// lib/transitoFase.js e de lib/seita.js.
function normalizar(lang) {
  return lang === 'es' || lang === 'en' ? lang : 'pt';
}

/**
 * A FRASE PRONTA de um trânsito, na língua pedida.
 *
 * `aspectType` e `planetaTransito`/`planetaNatal` são as chaves em PT que
 * personalSkyToday já usa internamente — nada aqui muda o formato do objeto
 * que ele devolve, só o campo `text`.
 *
 * Aspecto ou planeta desconhecido devolve null em vez de uma frase com {t}
 * cru na tela: se um dia entrar um aspecto novo na tabela sem entrar aqui, o
 * card some — não mostra template quebrado pro cliente.
 */
export function textoDoTransito({ aspectType, planetaTransito, planetaNatal, tempo, lang }) {
  const l = normalizar(lang);
  const modelo = ASPECTO_TEXTO[l][aspectType];
  const camada = TEMPO_TEXTO[l][tempo] || TEMPO_TEXTO[l].medio;
  const t = PLANETA_SUJEITO[l][planetaTransito];
  const n = PLANETA_POSSESSIVO[l][planetaNatal];
  if (!modelo || !t || !n) return null;
  const flexao = FLEXAO[l][FEMININOS.has(planetaNatal) ? 'feminino' : 'masculino'];
  return (
    modelo
      .replace('{t}', t)
      .replace('{quando}', camada.quando)
      .replace('{ao}', flexao.ao)
      .replace('{pro}', flexao.pro)
      .replace('{seu}', flexao.seu)
      .replace('{n}', n) + camada.nota
  );
}

export const _PARA_TESTES = { TEMPO_TEXTO, ASPECTO_TEXTO };
