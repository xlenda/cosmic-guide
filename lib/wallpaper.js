// lib/wallpaper.js
// PAPEL DE PAREDE DO CÉU — a parte PURA da feature: recebe o céu do dia e
// devolve os dados do desenho (gradiente, glifo, frase, data, marca). Quem
// desenha é screens/WallpaperScreen.js, num <canvas> 1080×1920 — código web.
//
// POR QUE ESTA FEATURE EXISTE: é a mecânica do nº 1 do mercado — a pessoa leva
// o app pra tela do celular. Um papel de parede que muda com o céu real é o
// app presente no bolso o dia inteiro, sem notificação nenhuma.
//
// ================== HONESTIDADE (regra inegociável do app) ==================
// Nenhuma string deste arquivo pode alegar efeito sobre corpo ou mente, nem
// prometer resultado, nem inventar fato histórico sem fonte. As frases abaixo
// são convite concreto de vida real ("prende primeiro") e, QUANDO afirmam algo
// histórico, trazem o recibo na própria frase (autor + século) — mesma régua
// de lib/rituais.js e lib/lunarCalendar.js. test/wallpaper.test.js varre tudo
// e aborta se alguém "melhorar" a cópia depois.
// ===========================================================================
//
// SEPARAÇÃO EXPLÍCITA — o que é CÉU MEDIDO e o que é DECISÃO ESTÉTICA MINHA:
//   - fase da Lua, signo lunar, iluminação: MEDIDOS, vêm de getSkyTuning()
//     (lib/cosmicSound.js → lib/lunarCalendar.js → astronomy-engine).
//   - gradiente por fase: DECISÃO ESTÉTICA MINHA. Nenhuma tradição diz "Lua
//     Nova é #050310". A única lógica é a analogia escuro↔claro que o app já
//     usa no som (Lua Nova = timbre fechado): quanto mais luz na Lua, mais o
//     fundo clareia — sempre dentro do escuro, porque papel de parede claro
//     estoura ícone e widget.
//   - glifos dos signos: caracteres Unicode padrão (U+2648–U+2653), os MESMOS
//     do campo emoji de lib/signs.js — o teste confere um a um pra não haver
//     duas fontes de verdade divergindo.
//
// DETERMINÍSTICO POR DIA LOCAL: getSkyTuning já ancora tudo no dia local (ver
// lib/localDay.js — a armadilha das 21h no Brasil). A escolha da frase usa um
// hash do próprio YYYY-MM-DD, então duas chamadas no mesmo dia devolvem
// exatamente o mesmo desenho — o papel de parede da manhã é o da noite.
//
// NUNCA FABRICA CÉU: sem efeméride, getSkyTuning devolve ceuDisponivel: false
// e este módulo devolve gradiente NEUTRO, glifo NEUTRO (uma estrela, não um
// signo — signo seria mentira) e uma frase que DIZ que o céu não foi
// calculado. Fallback honesto, mesma postura de descreverCeu() no som.
//
// ============================ IDIOMAS (31/07/2026) =========================
// `lang` ('pt' | 'es' | 'en', default e fallback 'pt') atravessa
// getWallpaperData/montarWallpaper/formatarDataLonga/textosDaTela e troca SÓ
// palavras: frase do dia, data por extenso, nomes de exibição (fase, signo
// lunar, regente) e o chrome da tela. Os packs vivem em
// lib/traducoes/wallpaper.es.js e wallpaper.en.js.
//
// O DESENHO NÃO MUDA DE IDIOMA: gradiente, glifo, forma da Lua (§2.b) e a
// ESCOLHA determinística da frase (hash do dia) são idênticos nos três — o
// mesmo dia cai na mesma posição do pool, então o papel de parede espanhol é
// literalmente o mesmo desenho do português com outras palavras. Por isso os
// pools traduzidos têm exatamente o mesmo tamanho do PT (o teste cobra).
//
// E OS CAMPOS CANÔNICOS FICAM CANÔNICOS: `fase`, `signoLua` e `regente`
// continuam saindo em português em qualquer idioma, porque são a chave de
// GRADIENTE_POR_FASE, GLIFO_POR_SIGNO e FRASES_POR_FASE. O que a tela imprime
// são os campos `faseTexto`, `signoLuaTexto` e `regenteTexto`, ao lado deles.
// Traduzir a chave quebraria o casamento com o céu em silêncio — o mesmo erro
// que lib/rituais.js documenta pras fases da Lua.
//
// PT É OURO: sem `lang`, ou com 'pt', tudo aqui devolve byte a byte o que
// devolvia antes desta parcela (test/pensamentoIdiomas.test.js trava com
// golden capturado ANTES).
// ===========================================================================

import { getSkyTuning } from './cosmicSound';
import { localDayStr } from './localDay';
import PACK_ES from './traducoes/wallpaper.es';
import PACK_EN from './traducoes/wallpaper.en';

// A marca no rodapé do desenho — pequena, porque papel de parede bom é quase
// vazio e ninguém quer outdoor na tela de bloqueio.
export const MARCA = 'cosmicguide.cloud';

// ---------------------------------------------------------------------------
// 1. GRADIENTE POR FASE — decisão estética, declarada como tal
// ---------------------------------------------------------------------------
// Três paradas por gradiente (topo → base), sempre escuro, roxo da casa
// (família do #0E0821/#1A1235 de theme.js). A claridade acompanha a iluminação
// real da fase: Nova é o fundo mais fechado do mês, Cheia é o mais aberto —
// e "aberto" aqui ainda é escuro o bastante pra relógio branco ler por cima.
export const GRADIENTE_POR_FASE = {
  'Lua Nova': ['#050310', '#0B0620', '#140C30'],
  'Lua Crescente': ['#070420', '#140C38', '#1E1444'],
  'Quarto Crescente': ['#0A0628', '#1C1246', '#2A1A54'],
  'Lua Gibosa Crescente': ['#0C0730', '#241852', '#342463'],
  'Lua Cheia': ['#120A38', '#31205C', '#4A2A8A'],
  'Lua Gibosa Minguante': ['#0D0830', '#251A50', '#30215E'],
  'Quarto Minguante': ['#0A0626', '#1A1040', '#26184E'],
  'Lua Minguante': ['#060318', '#100A28', '#181038'],
};

// Fallback sem efeméride: o gradiente "noite" da casa, sem fase nenhuma
// embutida — neutro de verdade, não uma Lua Nova disfarçada.
export const GRADIENTE_NEUTRO = ['#0E0821', '#160E30', '#1A1235'];

// ---------------------------------------------------------------------------
// 2. GLIFO DO SIGNO LUNAR
// ---------------------------------------------------------------------------
// Os MESMOS caracteres do campo emoji de lib/signs.js (Unicode U+2648–U+2653).
// Mapa local em vez de import de SIGNS de propósito: este módulo só precisa de
// nome → glifo, e o teste confere caractere a caractere contra lib/signs.js —
// se alguém mudar lá, o teste avisa aqui.
export const GLIFO_POR_SIGNO = {
  'Áries': '♈',
  'Touro': '♉',
  'Gêmeos': '♊',
  'Câncer': '♋',
  'Leão': '♌',
  'Virgem': '♍',
  'Libra': '♎',
  'Escorpião': '♏',
  'Sagitário': '♐',
  'Capricórnio': '♑',
  'Aquário': '♒',
  'Peixes': '♓',
};

// Sem efeméride não existe signo lunar calculado — e desenhar um glifo de
// signo seria inventar céu. Uma estrela de quatro pontas (U+2726) é desenho,
// não afirmação astronômica.
export const GLIFO_NEUTRO = '✦';

// ---------------------------------------------------------------------------
// 2.b A FORMA DA LUA — o que o desenho precisa pra traçar a fase de verdade
// ---------------------------------------------------------------------------
// ANTES (até 01/08/2026) o desenho era um MEDIDOR: uma bolinha cinza com alfa
// proporcional à iluminação. Honesto, e feio — o rótulo anunciava "Lua Gibosa
// Minguante · 92% iluminada" e a arte, cujo tema é o céu, entregava um ponto
// chapado. E era honestidade desnecessária: o app JÁ SABE tudo que uma fase
// precisa pra ser desenhada — o NOME canônico diz crescente ou minguante, e a
// iluminação medida diz a largura do terminador. Só faltava juntar os dois.
//
// A conta, que é geometria de esfera e não astrologia: o terminador visto da
// Terra é uma SEMI-ELIPSE cuja semi-largura vale R·|2k−1|, com k = fração
// iluminada. k=0,5 → largura zero (a reta do quarto); k=1 → largura R (o
// terminador vira o próprio limbo e o disco fecha cheio); k=0 → largura R do
// outro lado (nada aceso). Quem desenha é screens/WallpaperScreen.js; o que
// mora aqui é a DECISÃO (que lado, que forma), porque ela sai de dado do app
// e precisa de teste — canvas não se testa em node.
//
// =================== HEMISFÉRIO: o que o app sabe e o que não sabe ==========
// Foi por causa deste parágrafo que a versão anterior desistiu de desenhar a
// fase. Investigado antes de escolher, em 01/08/2026:
//
//   · getSkyTuning(data) (lib/cosmicSound.js) recebe SÓ uma data. Nada no
//     caminho fase → iluminação → signo lunar carrega lugar nenhum. O papel de
//     parede é, por construção, o mesmo céu pra todo mundo no mesmo dia.
//   · lib/cities.js tem `lat` em cada cidade — existe latitude no app. Mas a
//     única latitude que o usuário chega a informar é a da CIDADE DE
//     NASCIMENTO (lib/birthData.js → getAnyBirthData().city, leitura async de
//     SecureStore/AsyncStorage). Onde a pessoa NASCEU não é de onde ela olha o
//     céu hoje: quem nasceu em Recife e mora em Lisboa receberia o crescente
//     virado pro lado errado, e o app teria inventado a posição em silêncio.
//     Nunca fabricar vale aqui como vale pro resto.
//   · o fuso do aparelho (Intl…timeZone) diz onde o aparelho está, mas virar
//     hemisfério exige uma tabela IANA→hemisfério que o app não tem; e o
//     truque de deduzir pelo horário de verão (offset de janeiro vs julho)
//     responde "não sei" exatamente no Brasil, que abandonou o DST em 2019.
//
// Então o hemisfério NÃO é conhecido, e a saída é uma CONVENÇÃO DECLARADA:
// hemisfério NORTE, que é a convenção dos almanaques e — o que pesa mais aqui
// — a dos oito emojis 🌑🌒🌓🌔🌕🌖🌗🌘 que lib/lunarCalendar.js já imprime em
// toda a app (no 🌒 a luz está à DIREITA). Desenhar o lado oposto faria o
// papel de parede contradizer o Calendário Lunar da tela ao lado.
//
// E a contrapartida obrigatória: o DESENHO adota a convenção, mas a IMAGEM não
// afirma nada que dependa dela. Nenhum texto diz "a luz está à direita", nem
// "a leste", nem nomeia hemisfério — o rótulo continua sendo fase + % de
// iluminação, que são iguais no mundo inteiro. Se um dia o app passar a saber
// de onde a pessoa olha, a junta é uma só: o parâmetro `hemisferio` abaixo.
// ===========================================================================
export const HEMISFERIO_CONVENCIONADO = 'norte';

// Que direção cada fase canônica dá ao terminador. É leitura do NOME, não
// cálculo novo: "Crescente" e "Minguante" estão na própria chave.
// 'nova' e 'cheia' NÃO dão lado nenhum — e é de propósito que fiquem assim:
// a fatia da Lua Nova vai de 337,5° a 22,5° (lib/lunarCalendar.js), ou seja
// vai de um fiapo minguante a um fiapo crescente, e o mesmo vale espelhado na
// Cheia. Nesses dois baldes o lado é genuinamente desconhecido — o desenho
// resolve sem inventá-lo (disco apagado com aro, disco cheio), e a diferença
// que ele engole é de no máximo 4% de iluminação.
export const DIRECAO_POR_FASE = {
  'Lua Nova': 'nova',
  'Lua Crescente': 'crescente',
  'Quarto Crescente': 'crescente',
  'Lua Gibosa Crescente': 'crescente',
  'Lua Cheia': 'cheia',
  'Lua Gibosa Minguante': 'minguante',
  'Quarto Minguante': 'minguante',
  'Lua Minguante': 'minguante',
};

// A forma da Lua de hoje, pronta pro canvas — ou `null` quando não dá pra
// desenhar fase nenhuma sem inventar. `null` acontece em dois casos, e os dois
// importam: sem iluminação medida, e com uma fase de nome desconhecido (o
// mesmo cenário de "fase renomeada no futuro" que montarWallpaper já trata).
// Nos dois a tela cai no medidor antigo — que é feio, mas continua honesto, e
// é melhor um medidor do que um terminador chutado.
//
//   luz               0..1, a fração iluminada medida.
//   direcao           'nova' | 'crescente' | 'cheia' | 'minguante'.
//   ladoIluminado     'direita' | 'esquerda' — ou null quando a fase não diz.
//   larguraTerminador |2·luz − 1|, em frações do raio.
export function formaDaLua(fase, iluminacao, hemisferio = HEMISFERIO_CONVENCIONADO) {
  if (!Number.isFinite(iluminacao)) return null;
  const direcao = DIRECAO_POR_FASE[fase] || null;
  if (!direcao) return null;

  const luz = Math.max(0, Math.min(1, iluminacao / 100));
  const sul = hemisferio === 'sul';
  let ladoIluminado = null;
  if (direcao === 'crescente') ladoIluminado = sul ? 'esquerda' : 'direita';
  else if (direcao === 'minguante') ladoIluminado = sul ? 'direita' : 'esquerda';

  return {
    luz,
    direcao,
    ladoIluminado,
    larguraTerminador: Math.abs(2 * luz - 1),
  };
}

// ---------------------------------------------------------------------------
// 3. A FRASE CURTA DO DIA — prende primeiro, fonte depois
// ---------------------------------------------------------------------------
// Regras destas frases (test/wallpaper.test.js trava todas):
//   - curtas (papel de parede não é artigo);
//   - vida real, concreta, em português de conversa — convite de fazer algo
//     hoje, nunca previsão, nunca veredito, nunca efeito sobre o corpo;
//   - fato histórico SÓ com recibo na própria frase. Os dois recibos usados
//     aqui já estão em docs/tradicao/04-lua-fases-e-calendario.md: colher para
//     guardar é da MINGUANTE (Plínio, Naturalis Historia XVIII.321, séc. I) e
//     cortar/capinar também (XVIII.321–322). O resto das frases não afirma
//     nada — pergunta e convida, que é o que uma tela de bloqueio aguenta.
export const FRASES_POR_FASE = {
  'Lua Nova': [
    'Céu escuro, mês zerado. O que você quer deixar nascer até a Lua encher?',
    'Ninguém vê a Lua hoje. Bom dia pra dar, em silêncio, o primeiro passo de algo.',
    'Ponto zero do ciclo. Anota uma coisa só: a que você quer levar este mês.',
  ],
  'Lua Crescente': [
    'A luz está voltando. O que você começou merece dez minutos hoje.',
    'Lua fininha no céu: passo pequeno também é passo. Dá o de hoje.',
    'A Lua cresce um pouco por noite. Tem coisa sua que pode ir no mesmo ritmo.',
  ],
  'Quarto Crescente': [
    'Metade da luz: primeira encruzilhada do mês. O plano ainda é o mesmo?',
    'Meia Lua no céu. Boa hora de revisar a rota antes de seguir.',
    'A semana pede foco num ponto só. Qual?',
  ],
  'Lua Gibosa Crescente': [
    'Quase cheia. Falta pouco: ajuste o detalhe, não recomece do zero.',
    'Mais de meia Lua acesa — é isso que «gibosa» diz. Termina o que está a um passo do fim.',
    'Antes do pico, o retoque. O que dá pra lapidar hoje?',
  ],
  'Lua Cheia': [
    'Pico de luz do mês. Olha pro que já vinha se desenhando na sua vida.',
    'Céu claro a noite toda. Boa hora de ver o todo, não o detalhe.',
    'Dizem que Lua Cheia é dia de colher. A fonte romana punha a colheita na minguante (Plínio, séc. I).',
  ],
  'Lua Gibosa Minguante': [
    'A luz começou a ceder. Repassa pra alguém uma coisa que você aprendeu no mês.',
    'Era agora que a lavoura romana colhia pra guardar (Plínio, séc. I). O que você guarda deste mês?',
    'Depois do pico, a partilha. Conta pra alguém o que deu certo.',
  ],
  'Quarto Minguante': [
    'Metade da luz, caindo. O que sai da sua lista hoje?',
    'Uma coisa a menos hoje: um compromisso, uma aba aberta, um peso na mochila.',
    'Na minguante, o campo romano cortava e capinava (Plínio, séc. I). Corta uma coisa hoje.',
  ],
  'Lua Minguante': [
    'Últimos dias do ciclo. Menos barulho, mais silêncio — o mês novo já vem.',
    'A Lua está sumindo do céu. Bom momento de balanço: o que fica, o que vai?',
    'Fim de ciclo é inventário. Uma linha no diário já conta.',
  ],
};

// Sem efeméride: a frase DIZ que o céu não foi calculado, em vez de fingir.
// Nenhuma delas nomeia fase nem signo — o teste confere isso, porque nomear
// seria exatamente o céu inventado que este ramo existe pra evitar.
export const FRASES_SEM_CEU = [
  'O céu de hoje não pôde ser calculado — e céu a gente não inventa. Fica o convite: um minuto longe da tela.',
  'Sem efeméride agora. No lugar de um céu inventado, uma pergunta: o que você adia desde ontem?',
  'Hoje o app não alcançou o céu. O dia continua sendo seu: escolhe uma coisa pra terminar.',
];

// Defesa contra o futuro: se um dia a fase vier com um NOME que este mapa não
// conhece (alguém renomeou em lib/lunarCalendar.js), cair na frase "sem céu"
// seria mentira — o céu FOI calculado. Frase genérica, sem afirmação nenhuma.
export const FRASES_GENERICAS = [
  'Levanta o olho da tela hoje à noite: o céu de verdade continua aí em cima.',
];

// ---------------------------------------------------------------------------
// 3.b O CHROME DA TELA — os textos de screens/WallpaperScreen.js
// ---------------------------------------------------------------------------
// Moraram na tela como constantes PT até 31/07/2026, com um TODO dizendo
// "promove a chave de i18n quando alguém plugar a rota". Vieram pra cá em vez
// de pra lib/i18n.js porque é aqui que a feature inteira mora e é aqui que o
// teste já varre a linha vermelha — a tela ficou só com desenho e download.
// `titulo`/`subtitulo` são os MESMOS do card da Home ('home.card.wallpaper.*'
// em lib/i18n.js): a feature tem um nome visível só por idioma.
export const TELA_PT = {
  titulo: 'Papel de Parede',
  subtitulo: 'O céu de hoje na sua tela',
  baixar: 'BAIXAR PAPEL DE PAREDE',
  baixado: 'Baixado. Agora é só definir como papel de parede nas configurações do celular.',
  falhou: 'Não deu pra gerar a imagem agora. Tenta de novo.',
  tamanho: '1080 × 1920 — cabe em qualquer tela de celular.',
  amanha: 'Amanhã o céu muda — e o desenho muda junto. Volta aqui.',
  soWeb: 'Baixar a imagem é da versão web por enquanto. Abre cosmicguide.cloud no navegador do celular que o botão aparece.',
  semCeu: 'A posição da Lua não pôde ser calculada agora — o desenho de hoje é neutro e diz isso na própria frase.',
  luaEm: 'LUA EM',
  diaDe: 'DIA DE',
  iluminada: 'iluminada',
};

// ---------------------------------------------------------------------------
// 4. DATA POR EXTENSO — local, sem depender de Intl nem de i18n
// ---------------------------------------------------------------------------
// Constantes locais de propósito: o conteúdo do app vive dentro do lib (padrão
// declarado de lib/synastry.js e lib/rituais.js), e lib/i18n.js é do chrome.
// Intl continua fora de questão: o desenho tem que sair igual em qualquer
// aparelho, e Intl varia com o ICU embarcado.
const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// ---------------------------------------------------------------------------
// 4.b OS PACOTES DE TEXTO — pt derivado das constantes acima, es/en dos packs
// ---------------------------------------------------------------------------
// Os sete regentes da semana, na ordem caldaica de RULER_BY_WEEKDAY
// (lib/dailyThought.js). É o único planeta que o desenho chega a nomear — na
// linha "DIA DE ___" do ramo sem efeméride. Lista local pelo mesmo motivo de
// GLIFO_POR_SIGNO: este módulo só precisa de nome → nome, e o teste compara
// item a item com rulerOfDay, então divergência aparece na hora.
export const REGENTES_CANONICOS = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];

// O pacote 'pt' é MONTADO das constantes deste arquivo, nunca redigitado: é o
// que torna impossível a tradução alterar o português.
const PACOTE_PT = {
  frases: FRASES_POR_FASE,
  frasesSemCeu: FRASES_SEM_CEU,
  frasesGenericas: FRASES_GENERICAS,
  // Nomes de exibição: em português o canônico JÁ é o nome exibido, então os
  // três mapas são identidade — montados das próprias chaves canônicas.
  fases: Object.fromEntries(Object.keys(GRADIENTE_POR_FASE).map((f) => [f, f])),
  signos: Object.fromEntries(Object.keys(GLIFO_POR_SIGNO).map((s) => [s, s])),
  planetas: Object.fromEntries(REGENTES_CANONICOS.map((p) => [p, p])),
  diasSemana: DIAS_SEMANA,
  meses: MESES,
  dataLonga: '{diaSemana}, {dia} de {mes}',
  tela: TELA_PT,
};

const PACOTES = { pt: PACOTE_PT, es: PACK_ES, en: PACK_EN };

// Idioma desconhecido cai no PT — nunca inventa e nunca deixa o desenho mudo.
export function pacoteDoIdioma(lang = 'pt') {
  return PACOTES[lang] || PACOTE_PT;
}

// Os textos da tela no idioma pedido, prontos pra screens/WallpaperScreen.js.
export function textosDaTela(lang = 'pt') {
  return pacoteDoIdioma(lang).tela;
}

function preencher(molde, vars) {
  return String(molde).replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '' : String(vars[k])));
}

// Nome de exibição de fase/signo/regente. A chave é sempre o canônico em
// português; nome que o pacote não conhece sai como está — melhor uma palavra
// em português do que um buraco no desenho.
function nomeExibido(mapa, canonico) {
  if (typeof canonico !== 'string' || !canonico) return canonico ?? null;
  return (mapa && mapa[canonico]) || canonico;
}

// "sexta-feira, 31 de julho" · "viernes, 31 de julio" · "Friday, July 31".
// Meio-dia LOCAL de propósito: data-hora sem sufixo Z parseia como hora local
// (spec ES), então o dia da semana sai do mesmo dia civil que o diaStr nomeia
// — em qualquer fuso (mesma manha de lib/localDay.js). Sem ano: papel de
// parede fica semanas na tela, e o ano só envelheceria o desenho. A ORDEM das
// palavras é do idioma (o inglês põe o mês antes do dia), por isso `dataLonga`
// é um molde no pack e não uma concatenação fixa aqui.
export function formatarDataLonga(diaStr, lang = 'pt') {
  if (typeof diaStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(diaStr)) return '';
  const d = new Date(`${diaStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  const P = pacoteDoIdioma(lang);
  return preencher(P.dataLonga, {
    diaSemana: P.diasSemana[d.getDay()],
    dia: d.getDate(),
    mes: P.meses[d.getMonth()],
  });
}

// ---------------------------------------------------------------------------
// 5. ESCOLHA DETERMINÍSTICA — hash FNV-1a do dia
// ---------------------------------------------------------------------------
// Mesmo desenho de sementeDoDia() em lib/cosmicSound.js (que não é exportada —
// copiar 6 linhas custa menos que abrir a API de lá só pra isto): dois dias
// diferentes caem em frases diferentes com boa distribuição, e o MESMO dia cai
// SEMPRE na mesma — é isso que faz o papel de parede ser "de hoje" e não um
// sorteio a cada abertura da tela.
function indiceDoDia(diaStr, tamanho) {
  if (!tamanho || tamanho < 1) return 0;
  let h = 2166136261;
  for (let i = 0; i < diaStr.length; i++) {
    h ^= diaStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h % tamanho;
}

// ---------------------------------------------------------------------------
// montarWallpaper — puro: afinação do céu entra, dados do desenho saem
// ---------------------------------------------------------------------------
// Separada de getWallpaperData de propósito: o teste do fallback injeta aqui
// uma afinação com ceuDisponivel: false sem precisar arrancar o
// astronomy-engine do processo. E `null`/lixo entram sem quebrar — tela nunca
// pode cair por causa de um papel de parede.
export function montarWallpaper(afinacao, lang = 'pt') {
  const P = pacoteDoIdioma(lang);
  const a = afinacao && typeof afinacao === 'object' ? afinacao : {};
  const dia = typeof a.dia === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(a.dia) ? a.dia : localDayStr(new Date());
  const ceuDisponivel = a.ceuDisponivel === true;

  const fase = ceuDisponivel && typeof a.fase === 'string' ? a.fase : null;
  const signoLua = ceuDisponivel && typeof a.signoLua === 'string' ? a.signoLua : null;
  const iluminacao = ceuDisponivel && Number.isFinite(a.iluminacao) ? a.iluminacao : null;
  // O regente do dia é aritmética de dia da semana (ordem caldaica) — continua
  // real MESMO sem efeméride, exatamente como getSkyTuning documenta. Por isso
  // ele atravessa o fallback em vez de ser apagado junto com a Lua.
  const regente = typeof a.regente === 'string' ? a.regente : null;

  let gradiente = GRADIENTE_NEUTRO;
  let glifo = GLIFO_NEUTRO;
  // O POOL é escolhido pelas chaves CANÔNICAS e pelo tamanho do pool PT; o
  // pack do idioma só empresta as palavras da posição escolhida. Se um pack
  // vier com um pool de tamanho diferente, o índice do dia apontaria pra outra
  // frase e o desenho deixaria de ser "o mesmo céu em outro idioma" — por isso
  // o tamanho sai sempre do PT e o teste cobra a paridade.
  let poolPt = FRASES_SEM_CEU;
  let poolIdioma = P.frasesSemCeu;

  if (ceuDisponivel) {
    gradiente = (fase && GRADIENTE_POR_FASE[fase]) || GRADIENTE_NEUTRO;
    glifo = (signoLua && GLIFO_POR_SIGNO[signoLua]) || GLIFO_NEUTRO;
    const temPoolDaFase = fase && FRASES_POR_FASE[fase];
    poolPt = temPoolDaFase || FRASES_GENERICAS;
    poolIdioma = (temPoolDaFase && P.frases[fase]) || P.frasesGenericas;
  }

  const indice = indiceDoDia(dia, poolPt.length);
  const frase = poolIdioma[indice] ?? poolPt[indice];

  return {
    dia,
    ceuDisponivel,
    // Cópia rasa: quem desenha não pode mutar as constantes compartilhadas.
    gradiente: gradiente.slice(),
    glifo,
    // CANÔNICOS (sempre em português, em qualquer idioma): são as chaves de
    // GRADIENTE_POR_FASE / GLIFO_POR_SIGNO / FRASES_POR_FASE e o que outros
    // módulos casam. Não imprima estes três — imprima os *Texto abaixo.
    signoLua,
    fase,
    iluminacao,
    regente,
    // A FORMA da Lua pro canvas (ver §2.b). Sai daqui, e não da tela, porque
    // depende da chave CANÔNICA da fase — que a tela não pode ler (o teste de
    // idiomas varre screens/WallpaperScreen.js atrás de `dados.fase` justamente
    // pra ninguém imprimir português dentro do desenho inglês). Vem null quando
    // não há fase medida ou o nome da fase é desconhecido: aí não existe lado
    // pra desenhar, e a tela cai no medidor honesto.
    lua: formaDaLua(fase, iluminacao),
    // PRA IMPRIMIR: os mesmos três, no idioma pedido. Em 'pt' são idênticos
    // aos canônicos, e é por isso que o desenho português não mudou um pixel.
    signoLuaTexto: nomeExibido(P.signos, signoLua),
    faseTexto: nomeExibido(P.fases, fase),
    regenteTexto: nomeExibido(P.planetas, regente),
    frase,
    dataFormatada: formatarDataLonga(dia, lang),
    marca: MARCA,
  };
}

// A porta de entrada da tela: o céu de hoje (ou de qualquer data) virando
// desenho. Determinístico por dia local porque getSkyTuning já é — e o idioma
// não entra no cálculo, só nas palavras.
export function getWallpaperData(data = new Date(), lang = 'pt') {
  return montarWallpaper(getSkyTuning(data), lang);
}
