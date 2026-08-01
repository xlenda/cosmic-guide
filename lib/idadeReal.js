// lib/idadeReal.js
// A IDADE REAL DE CADA COISA — a tabela navegável das trinta coisas que o
// mercado vende como milenares, com o ano em que cada uma apareceu.
//
// ===========================================================================
// DE ONDE VEM ESTE ARQUIVO — e por que nada aqui é opinião nossa
// ===========================================================================
// A fonte é a tabela "ISSO É MILENAR?" de docs/tradicao/10-historia-da-
// astrologia.md §13, que já nasceu datada e com grau de verificação. As 28
// linhas dela estão todas aqui. As outras duas ("Lua de Sangue" e o dicionário
// de símbolos da borra de café) vêm da mesma base, dos docs 04 §4.6 e 06 §6.1,
// e entraram porque são as duas peças mais jovens e mais datáveis que o §13
// não listou. Cada entrada carrega `base` com arquivo e locus; o teste abre o
// caminho e reprova se o arquivo não existir.
//
// Nada entra sem endereço. É a regra de ouro nº 1 da base
// (docs/tradicao/00-LEIA-PRIMEIRO.md): ou tem obra, autor e século, ou não vai
// para a tela — e fonte inventada é pior que ausência de fonte. As três linhas
// que a pesquisa procurou e NÃO conseguiu datar (porcentagem de
// compatibilidade, frequência em Hz por signo, "Mercúrio retrógrado quebra
// aparelho") estão aqui com `anoOrigem: null` e dizem isso na cara: sem data,
// sem autor, e a ausência é o resultado — não é preguiça.
//
// ===========================================================================
// POR QUE ISTO NÃO É lib/mitos.js
// ===========================================================================
// `lib/mitos.js` é "te contaram X, a fonte diz Y" — card viral, um por vez,
// com o mito riscado em cima. Aqui é outra coisa: uma TABELA DE IDADES,
// navegável e ordenável (por idade, por tema), em que a peça de informação
// principal é um NÚMERO. Há sobreposição de itens de propósito — Superlua
// aparece nos dois —, mas nenhum texto se repete: test/idadeReal.test.js varre
// os dois catálogos e reprova qualquer sequência de oito palavras em comum.
//
// ===========================================================================
// A IDADE É CONTA, NUNCA TABELA — e isto é a proposição 1 da tese
// ===========================================================================
// docs/tradicao/00-tese.md §1: "nenhuma afirmação astronômica no app pode vir
// de tabela; vem de efeméride calculada". O pior bug da história do app nasceu
// de tabelar o que era para ser calculado. A mesma disciplina vale aqui: a
// entrada guarda `anoOrigem` (o ano de origem que a base dá) e `arredondar` (o
// passo de arredondamento que a própria base usou), e a IDADE É CALCULADA
// contra o ano corrente. Por isso "Superlua tem 47 anos" vira 48 sozinho na
// virada do ano, sem ninguém editar nada — e por isso a tela pode mostrar de
// onde o número saiu.
//
// DIVERGÊNCIA REGISTRADA, porque a base manda mostrar em vez de escolher em
// silêncio: o §13 imprime ~2.100 anos para as Casas Inteiras e para os cinco
// aspectos, e ~2.150 para o mapa natal, embora as três nasçam do MESMO
// intervalo (Alexandria, c. 150–120 a.C.). Aqui a conta é a mesma para as três,
// porque a data de origem é a mesma — dá ~2.150 nas três. O §13 imprime ~1.950
// para o Homem Zodiacal a partir de "séc. I d.C."; tomando o meio do século, a
// conta dá ~2.000. As diferenças são de arredondamento sobre a mesma data
// citada, e o app prefere o número que se confere a partir do campo `quando`.
//
// Sobre o ano zero: para as entradas anteriores à era comum, `anoOrigem` é
// negativo e a conta é `anoRef - anoOrigem`, que ignora a ausência do ano 0 do
// calendário. O erro é de um ano em cima de dois mil e poucos, e o
// arredondamento de 50 o engole — está dito aqui para não parecer descuido.
//
// ===========================================================================
// A REGRA DE ESCRITA: PRENDE PRIMEIRO, FONTE DEPOIS
// ===========================================================================
// A mesma de lib/mitos.js e lib/rituais.js, travada por teste. `detalhe` abre
// na vida real, em português de conversa — a manchete, o feed, o carrossel, o
// post de retorno de Saturno — e o recibo (obra, autor, ano) chega depois. Os
// primeiros 60 caracteres não podem trazer ano de quatro dígitos nem "séc.".
// Termo técnico ganha glosa na primeira aparição, no molde de
// lib/lunarCalendar.js ("é isso que «gibosa» quer dizer: …").
//
// A LINHA VERMELHA (regra de PALAVRA, não de intenção): nenhuma alegação de
// saúde nem implícita, nenhuma promessa de resultado, nenhum mecanismo
// pseudocientífico, nenhum veredito sobre quem acredita, nenhuma prova social
// inventada, nenhum aviso defensivo. E a palavra banida por docs/tradicao/06
// §2 não entra em texto nenhum. O tom é o da tese, não o de denúncia:
// "inventar antiguidade não é a corrupção da tradição, é um traço da tradição"
// — está lá desde Nechepso e Petosiris, c. 150 a.C.
//
// ===========================================================================
// TRÊS IDIOMAS DESDE O NASCIMENTO
// ===========================================================================
// Este arquivo é MOTOR: ids, tema, grau, ano de origem, passo de
// arredondamento e endereço na base. TODO texto que a pessoa lê mora nos packs
// lib/traducoes/idadeReal.{pt,es,en}.js, com a MESMA forma nos três — é o
// padrão de lib/synastry.js. Toda função que devolve texto tem `lang` com
// default 'pt'. O PT é a fonte de verdade e está travado byte a byte contra
// test/golden/idadeReal.pt.golden.json.
//
// STORAGE: sempre via lib/storage.js (getItemSeguro/setItemSeguro) — nunca
// require direto de AsyncStorage. O helper existe porque o fallback errado
// apagava progresso (a história está no cabeçalho de lib/storage.js).
import { getItemSeguro, setItemSeguro } from './storage';
import PACK_PT from './traducoes/idadeReal.pt';
import PACK_ES from './traducoes/idadeReal.es';
import PACK_EN from './traducoes/idadeReal.en';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma desconhecido cai no PT — nunca numa tradução inventada na hora.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// Mesmo destino de lib/mitos.js e lib/rituais.js — é o link que fecha todo
// texto que sai do app. Endereço não se traduz: é o mesmo nos três idiomas.
export const LINK_COMPARTILHAR = 'https://cosmicguide.cloud/cosmic-guide/';

// ---------------------------------------------------------------------------
// OS TEMAS — só ids e ordem; os nomes moram nos packs
// ---------------------------------------------------------------------------
// A ordem é narrativa (o céu, o mapa, os planetas, a Lua, os oráculos, o jeito
// de ler, o mercado) e é ela que a tela usa quando a pessoa ordena por tema.
export const TEMAS = ['zodiaco', 'mapa', 'planetas', 'lua', 'oraculos', 'leitura', 'mercado'];

// Os quatro graus de origem da base (docs/tradicao/00-LEIA-PRIMEIRO.md).
// [FP] fonte primária · [TP] tradição posterior · [IR] invenção recente ·
// [AM] academia moderna. O nome e a glosa de cada um moram nos packs.
export const GRAUS = ['FP', 'TP', 'IR', 'AM'];

// ---------------------------------------------------------------------------
// O CATÁLOGO — 30 coisas, cada uma com ano de origem e endereço na base
// ---------------------------------------------------------------------------
// Campos:
//   id          — estável, kebab-case; é o que o storage grava e a chave do pack.
//   tema        — um dos TEMAS.
//   grau        — um dos GRAUS, copiado da base.
//   anoOrigem   — ano de origem que a base dá. Negativo = antes da era comum.
//                 `null` quando a pesquisa procurou e não achou data.
//   arredondar  — passo de arredondamento da idade (1 = exato). É o mesmo passo
//                 que o §13 usa: 1 para data cravada, 5/10/50 para período.
//   base        — arquivo + locus em docs/tradicao/ onde isto foi conferido.
//
// A ORDEM DESTE ARRAY é a ordem canônica do catálogo (agrupada por tema, na
// ordem de TEMAS) e serve de desempate estável em toda ordenação. A tela nunca
// mostra nesta ordem por padrão — ela abre pela mais nova.
export const IDADE_REAL = [
  // --- zodíaco -------------------------------------------------------------
  {
    id: 'zodiaco-12',
    tema: 'zodiaco',
    grau: 'FP',
    anoOrigem: -425,
    arredondar: 50,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§1.2; tabela §13' },
  },
  {
    id: 'homem-zodiacal',
    tema: 'zodiaco',
    grau: 'FP',
    anoOrigem: 50,
    arredondar: 50,
    base: { arquivo: 'docs/tradicao/01-astrologia-fundamentos.md', locus: '§3.2–3.4; tabela: 10 §13' },
  },

  // --- o mapa --------------------------------------------------------------
  {
    id: 'mapa-natal',
    tema: 'mapa',
    grau: 'FP',
    anoOrigem: -135,
    arredondar: 50,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§2.1–2.2; tabela §13' },
  },
  {
    id: 'aspectos-maiores',
    tema: 'mapa',
    grau: 'FP',
    anoOrigem: -135,
    arredondar: 50,
    base: { arquivo: 'docs/tradicao/02-aspectos-e-sinastria.md', locus: '§3.6–3.12; tabela: 10 §13' },
  },
  {
    id: 'casas-inteiras',
    tema: 'mapa',
    grau: 'FP',
    anoOrigem: -135,
    arredondar: 50,
    base: { arquivo: 'docs/tradicao/03-casas-e-mapa-natal.md', locus: '§7.10; tabela: 10 §13' },
  },
  {
    id: 'horaria',
    tema: 'mapa',
    grau: 'TP',
    anoOrigem: 850,
    arredondar: 50,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§4.4; tabela §13' },
  },
  {
    id: 'partes-arabes',
    tema: 'mapa',
    grau: 'TP',
    anoOrigem: 850,
    arredondar: 50,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§4.4; tabela §13' },
  },
  {
    id: 'aspectos-menores',
    tema: 'mapa',
    grau: 'TP',
    anoOrigem: 1619,
    arredondar: 50,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§14.15; obra: 02 §3 e bibliografia' },
  },
  {
    id: 'placidus',
    tema: 'mapa',
    grau: 'TP',
    anoOrigem: 1650,
    arredondar: 10,
    base: { arquivo: 'docs/tradicao/03-casas-e-mapa-natal.md', locus: '§7.1–7.2; tabela: 10 §13' },
  },

  // --- os planetas ---------------------------------------------------------
  {
    id: 'urano-aquario',
    tema: 'planetas',
    grau: 'IR',
    anoOrigem: 1826,
    arredondar: 5,
    base: { arquivo: 'docs/tradicao/11-planetas-em-profundidade.md', locus: '§8.3; tabela: 10 §13' },
  },
  {
    id: 'saturno-mestre',
    tema: 'planetas',
    grau: 'TP',
    anoOrigem: 1976,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/15-campo-contemporaneo-e-autores.md', locus: '§6; tabela: 10 §13' },
  },
  {
    id: 'mercurio-retrogrado',
    tema: 'planetas',
    grau: 'IR',
    anoOrigem: null,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/11-planetas-em-profundidade.md', locus: '§8.5; tabela: 10 §13' },
  },

  // --- a Lua ---------------------------------------------------------------
  {
    id: 'superlua',
    tema: 'lua',
    grau: 'IR',
    anoOrigem: 1979,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§4.5; tabela: 10 §13' },
  },
  {
    id: 'oito-fases',
    tema: 'lua',
    grau: 'TP',
    anoOrigem: 1936,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§3.1; tabela: 10 §13' },
  },
  {
    id: 'luas-cheias-nomes',
    tema: 'lua',
    grau: 'TP',
    anoOrigem: 1935,
    arredondar: 10,
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§4; tabela: 10 §13' },
  },
  {
    id: 'lua-de-sangue',
    tema: 'lua',
    grau: 'IR',
    anoOrigem: 2008,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§4.6' },
  },

  // --- os oráculos ---------------------------------------------------------
  {
    id: 'taro-divinatorio',
    tema: 'oraculos',
    grau: 'TP',
    anoOrigem: 1781,
    arredondar: 5,
    base: { arquivo: 'docs/tradicao/05-taro-historia-e-leitura.md', locus: '§5.1–5.2; tabela: 10 §13' },
  },
  {
    id: 'rider-waite',
    tema: 'oraculos',
    grau: 'FP',
    anoOrigem: 1910,
    arredondar: 5,
    base: { arquivo: 'docs/tradicao/05-taro-historia-e-leitura.md', locus: '§5.8, §5.10; tabela: 10 §13' },
  },
  {
    id: 'simbolos-borra-cafe',
    tema: 'oraculos',
    grau: 'TP',
    anoOrigem: 1900,
    arredondar: 5,
    base: { arquivo: 'docs/tradicao/06-oniromancia-e-artes-corporais.md', locus: '§6.1' },
  },

  // --- o jeito de ler ------------------------------------------------------
  {
    id: 'signo-personalidade',
    tema: 'leitura',
    grau: 'TP',
    anoOrigem: 1910,
    arredondar: 5,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§8.3, §14.8; tabela §13' },
  },
  {
    id: 'retratos-goodman',
    tema: 'leitura',
    grau: 'TP',
    anoOrigem: 1968,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§13' },
  },
  {
    id: 'potencial-psicologico',
    tema: 'leitura',
    grau: 'TP',
    anoOrigem: 1936,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§10.1, §14.10; tabela §13' },
  },
  {
    id: 'nao-e-previsao',
    tema: 'leitura',
    grau: 'AM',
    anoOrigem: 1915,
    arredondar: 5,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§8.3; tabela §13' },
  },
  {
    id: 'karma-mapa',
    tema: 'leitura',
    grau: 'TP',
    anoOrigem: 1875,
    arredondar: 5,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§14.11; tabela §13' },
  },
  {
    id: 'nodos-missao',
    tema: 'leitura',
    grau: 'TP',
    anoOrigem: 1875,
    arredondar: 5,
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§5; tabela: 10 §13' },
  },
  {
    id: 'astrologia-tradicional',
    tema: 'leitura',
    grau: 'AM',
    anoOrigem: 1993,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§11.1, §14.14; tabela §13' },
  },

  // --- o mercado -----------------------------------------------------------
  {
    id: 'horoscopo-jornal',
    tema: 'mercado',
    grau: 'TP',
    anoOrigem: 1930,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§9.1, §14.9; tabela §13' },
  },
  {
    id: 'porcentagem-compatibilidade',
    tema: 'mercado',
    grau: 'IR',
    anoOrigem: null,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/02-aspectos-e-sinastria.md', locus: '§3.1; tabela: 10 §13' },
  },
  {
    id: 'frequencias-hz',
    tema: 'mercado',
    grau: 'IR',
    anoOrigem: null,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/01-astrologia-fundamentos.md', locus: '§3.15; tabela: 10 §13' },
  },
  {
    id: 'app-astrologia',
    tema: 'mercado',
    grau: 'AM',
    anoOrigem: 2017,
    arredondar: 1,
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: 'Parte XII; tabela §13' },
  },
];

// Índice por id — a busca é por chave em toda a API pública.
const POR_ID = new Map(IDADE_REAL.map((e, i) => [e.id, { entrada: e, ordem: i }]));

// ---------------------------------------------------------------------------
// MOLDE → TEXTO
// ---------------------------------------------------------------------------
// Chave ausente fica como está, à vista, em vez de virar "undefined" no meio da
// frase: erro de moldura tem que aparecer, não se disfarçar de conteúdo.
// (Mesmo `preencher` de lib/mitos.js.)
export function preencher(molde, vars = {}) {
  return String(molde).replace(/\{(\w+)\}/g, (bruto, chave) =>
    Object.prototype.hasOwnProperty.call(vars, chave) ? String(vars[chave]) : bruto
  );
}

// O chrome da tela no idioma pedido.
export function chromeDaTela(lang = 'pt') {
  return packDoIdioma(lang).tela;
}

// Os nomes dos temas, na ordem canônica de TEMAS.
export function temasParaIdioma(lang = 'pt') {
  const p = packDoIdioma(lang);
  return TEMAS.map((id) => ({ id, nome: p.temas[id] }));
}

// Grau de origem com nome e glosa — a tela imprime a sigla e explica.
export function grauParaIdioma(sigla, lang = 'pt') {
  return packDoIdioma(lang).graus[sigla] || null;
}

// ---------------------------------------------------------------------------
// A CONTA DA IDADE
// ---------------------------------------------------------------------------
// `anoAtual` existe como função (e não como constante) para a tela não
// congelar o ano no bundle: um app aberto na virada do ano recalcula.
export function anoAtual(agora = new Date()) {
  return agora.getFullYear();
}

function arredondarPara(n, passo) {
  if (!passo || passo <= 1) return n;
  return Math.round(n / passo) * passo;
}

// Idade em anos, já arredondada pelo passo da entrada. Devolve `null` quando a
// pesquisa não achou data — e isso NÃO é zero, é ausência declarada.
export function idadeEmAnos(entradaOuId, anoRef = anoAtual()) {
  const e = typeof entradaOuId === 'string' ? entradaCrua(entradaOuId) : entradaOuId;
  if (!e || e.anoOrigem === null || e.anoOrigem === undefined) return null;
  return arredondarPara(anoRef - e.anoOrigem, e.arredondar);
}

function entradaCrua(id) {
  const achado = POR_ID.get(id);
  return achado ? achado.entrada : null;
}

// Separador de milhar do idioma: 2.450 em pt/es, 2,450 em en. Mora no pack
// porque é convenção de língua, não de conteúdo.
function formatarNumero(n, lang) {
  const sep = packDoIdioma(lang).formato.separadorMilhar;
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

// O rótulo pronto: "47 anos", "cerca de 2.450 anos", "sem data". Idade exata
// (arredondar === 1) sai sem o "cerca de" — a diferença importa, porque é ela
// que separa o que a fonte crava do que ela estima.
export function rotuloDeIdade(entradaOuId, lang = 'pt', anoRef = anoAtual()) {
  const e = typeof entradaOuId === 'string' ? entradaCrua(entradaOuId) : entradaOuId;
  const tela = chromeDaTela(lang);
  if (!e) return '';
  const anos = idadeEmAnos(e, anoRef);
  if (anos === null) return tela.semData;
  const molde = e.arredondar > 1 ? tela.idadeAnosAprox : tela.idadeAnos;
  return preencher(molde, { n: formatarNumero(anos, lang) });
}

// ---------------------------------------------------------------------------
// BUSCA — a entrada vestida com o texto do idioma
// ---------------------------------------------------------------------------
// SÓ texto vem do pack. `id`, `tema`, `grau`, `anoOrigem`, `arredondar` e
// `base` ficam canônicos: o id é a chave do storage (traduzi-lo apagaria o
// progresso de quem trocasse de idioma), a base é endereço de arquivo, e o ano
// é número. `idadeReal` e `anosAtras` são CALCULADOS aqui — nunca tabelados.
function vestir(e, lang, anoRef) {
  const tr = packDoIdioma(lang).itens[e.id];
  return {
    id: e.id,
    tema: e.tema,
    grau: e.grau,
    anoOrigem: e.anoOrigem,
    arredondar: e.arredondar,
    base: e.base,
    coisa: tr.coisa,
    oQuePensam: tr.oQuePensam,
    idadeReal: rotuloDeIdade(e, lang, anoRef),
    anosAtras: idadeEmAnos(e, anoRef),
    quemInventou: tr.quemInventou,
    quando: tr.quando,
    fonte: tr.fonte,
    detalhe: tr.detalhe,
  };
}

export function idadeRealPorId(id, lang = 'pt', anoRef = anoAtual()) {
  const e = entradaCrua(id);
  return e ? vestir(e, lang, anoRef) : null;
}

// O catálogo inteiro, na ORDEM CANÔNICA de IDADE_REAL.
export function idadesReais(lang = 'pt', anoRef = anoAtual()) {
  return IDADE_REAL.map((e) => vestir(e, lang, anoRef));
}

// ---------------------------------------------------------------------------
// AS DUAS ORDENAÇÕES DA TELA
// ---------------------------------------------------------------------------
// Nenhuma delas mexe no array recebido — devolvem sempre lista nova.
//
// Por idade: MAIS NOVA PRIMEIRO por padrão, porque é aí que mora o choque —
// a primeira linha da tela é "o app de astrologia como categoria" com um
// número de um dígito. Empate desempata pela ordem canônica do catálogo, para
// a lista nunca dançar entre dois carregamentos. O que a pesquisa não datou vai
// para o fim nas duas direções: ausência não é "muito novo" nem "muito antigo".
export function ordenarPorIdade(lista, { crescente = true } = {}) {
  const posicao = new Map(IDADE_REAL.map((e, i) => [e.id, i]));
  return [...lista].sort((a, b) => {
    const semA = a.anosAtras === null || a.anosAtras === undefined;
    const semB = b.anosAtras === null || b.anosAtras === undefined;
    if (semA !== semB) return semA ? 1 : -1;
    if (!semA && a.anosAtras !== b.anosAtras) {
      return crescente ? a.anosAtras - b.anosAtras : b.anosAtras - a.anosAtras;
    }
    return (posicao.get(a.id) ?? 0) - (posicao.get(b.id) ?? 0);
  });
}

// Por tema: grupos na ordem de TEMAS, e dentro de cada grupo a mesma régua da
// ordenação por idade (mais nova primeiro). Grupo vazio não vira seção.
export function agruparPorTema(lista, lang = 'pt') {
  const nomes = packDoIdioma(lang).temas;
  return TEMAS.map((id) => ({
    tema: id,
    nome: nomes[id],
    itens: ordenarPorIdade(lista.filter((x) => x.tema === id)),
  })).filter((g) => g.itens.length > 0);
}

// ---------------------------------------------------------------------------
// COMPARTILHAR — o único texto daqui que sai do app
// ---------------------------------------------------------------------------
// Mesmo desenho de lib/mitos.js: linhas simples, legíveis no grupo da família,
// sem urgência e sem emoji — e a ÚLTIMA linha é sempre o link.
//
// `lang` é IDEMPOTENTE: passar o id, o item em PT ou o item já localizado dá
// exatamente o mesmo texto, porque a localização se resolve pelo `id`, que
// nunca é traduzido.
export const ROTULOS_COMPARTILHAR_CHAVES = ['idade', 'pensam', 'quem', 'recibo'];

// Ponto final sem ponto duplo. Existe por causa de "c. 450–400 a.C.", que já
// termina em ponto: sem isto o compartilhável saía com "a.C.." — erro pequeno
// que aparece grande no print.
function pontoFinal(texto) {
  const s = String(texto).trim();
  return /[.!?…]$/.test(s) ? s : `${s}.`;
}

export function textoCompartilhavel(itemOuId, lang = 'pt', anoRef = anoAtual()) {
  const id = typeof itemOuId === 'string' ? itemOuId : itemOuId && itemOuId.id;
  const item = id ? idadeRealPorId(id, lang, anoRef) : null;
  if (!item) return '';
  const r = packDoIdioma(lang).compartilhar;
  return [
    item.coisa,
    `${r.idade} ${pontoFinal(item.idadeReal)}`,
    `${r.pensam} ${pontoFinal(item.oQuePensam)}`,
    `${r.quem} ${pontoFinal(`${item.quemInventou} — ${item.quando}`)}`,
    `${r.recibo} ${pontoFinal(item.fonte)}`,
    LINK_COMPARTILHAR,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// O QUE A PESSOA JÁ ABRIU — progresso leve, via lib/storage.js
// ---------------------------------------------------------------------------
// Grava os ids já expandidos, para a tela poder dizer "você já abriu 7 de 30".
// Regras herdadas de lib/storage.js: nunca lança, falha de disco cai para
// memória de sessão, e leitura suja (JSON inválido, id que saiu do catálogo)
// volta limpa em vez de quebrar a tela.
export const CHAVE_IDADE_VISTAS = 'cosmic-idade-real-vistas';

export async function lerIdadesVistas() {
  const bruto = await getItemSeguro(CHAVE_IDADE_VISTAS);
  if (!bruto) return [];
  try {
    const lista = JSON.parse(bruto);
    if (!Array.isArray(lista)) return [];
    const vivos = [];
    for (const id of lista) {
      if (typeof id === 'string' && POR_ID.has(id) && !vivos.includes(id)) vivos.push(id);
    }
    return vivos;
  } catch {
    return [];
  }
}

// Devolve a lista atualizada (a tela usa o length). Id desconhecido não grava.
export async function marcarIdadeVista(id) {
  const vistas = await lerIdadesVistas();
  if (!POR_ID.has(id) || vistas.includes(id)) return vistas;
  const novas = [...vistas, id];
  await setItemSeguro(CHAVE_IDADE_VISTAS, JSON.stringify(novas));
  return novas;
}
