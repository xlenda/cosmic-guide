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

import { getSkyTuning } from './cosmicSound';
import { localDayStr } from './localDay';

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
// 4. DATA POR EXTENSO — local, em PT, sem depender de Intl nem de i18n
// ---------------------------------------------------------------------------
// Constantes locais de propósito: o conteúdo do app vive em PT dentro do lib
// (padrão declarado de lib/synastry.js e lib/rituais.js), e lib/i18n.js é do
// integrador da fase 2 — este arquivo não toca lá.
const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// "sexta-feira, 31 de julho". Meio-dia LOCAL de propósito: data-hora sem
// sufixo Z parseia como hora local (spec ES), então o dia da semana sai do
// mesmo dia civil que o diaStr nomeia — em qualquer fuso (mesma manha de
// lib/localDay.js). Sem ano: papel de parede fica semanas na tela, e o ano só
// envelheceria o desenho.
export function formatarDataLonga(diaStr) {
  if (typeof diaStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(diaStr)) return '';
  const d = new Date(`${diaStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
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
export function montarWallpaper(afinacao) {
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
  let pool = FRASES_SEM_CEU;

  if (ceuDisponivel) {
    gradiente = (fase && GRADIENTE_POR_FASE[fase]) || GRADIENTE_NEUTRO;
    glifo = (signoLua && GLIFO_POR_SIGNO[signoLua]) || GLIFO_NEUTRO;
    pool = (fase && FRASES_POR_FASE[fase]) || FRASES_GENERICAS;
  }

  return {
    dia,
    ceuDisponivel,
    // Cópia rasa: quem desenha não pode mutar as constantes compartilhadas.
    gradiente: gradiente.slice(),
    glifo,
    signoLua,
    fase,
    iluminacao,
    regente,
    frase: pool[indiceDoDia(dia, pool.length)],
    dataFormatada: formatarDataLonga(dia),
    marca: MARCA,
  };
}

// A porta de entrada da tela: o céu de hoje (ou de qualquer data) virando
// desenho. Determinístico por dia local porque getSkyTuning já é.
export function getWallpaperData(data = new Date()) {
  return montarWallpaper(getSkyTuning(data));
}
