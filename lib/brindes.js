// lib/brindes.js
// Catálogo dos BRINDES da Loja — a segunda metade do pedido do dono
// (26/07/2026): "com isso ele ganha brindes como incensos e outras coisas a
// ver com o nicho de espiritualidade".
//
// REGRA DURA da Loja (commit 123078a, bug real de 25/07/2026): só entra na
// lista brinde com EFEITO REAL implementado no resgate. Por isso o catálogo
// nasce em duas camadas:
//   - DIGITAIS: entrega automática NA HORA, dentro do app (conteúdo embutido
//     neste arquivo, sem rede) — wallpapers, guia de ritual, tiragem
//     exclusiva.
//   - FÍSICOS (incenso, cristal): estrutura pronta mas DESLIGADA atrás de
//     BRINDES_FISICOS_ATIVOS=false — prometer objeto físico sem logística
//     resolvida é exatamente o tipo de recompensa-fantasma que a regra proíbe.
//
// A posse dos brindes de conteúdo fica em lib/cosmeticRewards.js
// (grantBrinde/hasBrinde) — compra única, reabre quando quiser na Loja.

// ---------------------------------------------------------------------------
// FÍSICOS: DESLIGADO de propósito. Ligar exige o dono decidir a logística
// inteira ANTES: estoque, custo por envio, prazo, transportadora, coleta de
// endereço (e LGPD do endereço), fluxo de suporte pra extravio. Virar `true`
// só mostra os itens físicos na Loja — o resgate deles ainda precisará do
// fluxo de endereço (hoje é um aviso honesto de indisponível, nunca cobra).
export const BRINDES_FISICOS_ATIVOS = false;

// ---------------------------------------------------------------------------
// Wallpapers místicos gerados aqui dentro (SVG 1080x1920 → data URI): entrega
// real embutida no bundle, zero rede, zero asset pesado. Estrelas são
// determinísticas por seed (nada de Math.random — mesmo brinde pra todo
// mundo, sempre idêntico ao preview).
function estrelas(seed, n) {
  let h = seed >>> 0;
  const rnd = () => {
    h = (h * 1103515245 + 12345) % 2147483648;
    return h / 2147483648;
  };
  let out = '';
  for (let i = 0; i < n; i++) {
    const cx = Math.round(rnd() * 1080);
    const cy = Math.round(rnd() * 1920);
    const r = (rnd() * 2.2 + 0.6).toFixed(1);
    const o = (rnd() * 0.55 + 0.25).toFixed(2);
    out += `<circle cx='${cx}' cy='${cy}' r='${r}' fill='#FFFFFF' opacity='${o}'/>`;
  }
  return out;
}

function wallpaperUri({ de, para, seed, extra = '' }) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920' viewBox='0 0 1080 1920'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${de}'/><stop offset='1' stop-color='${para}'/>` +
    `</linearGradient></defs>` +
    `<rect width='1080' height='1920' fill='url(#g)'/>` +
    estrelas(seed, 90) +
    extra +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Lua crescente = círculo dourado com um segundo círculo da cor do fundo
// "mordendo" — truque clássico de SVG, sem máscara.
const LUA = (fundo) =>
  `<circle cx='790' cy='420' r='130' fill='#FFC85C' opacity='0.92'/>` +
  `<circle cx='850' cy='380' r='120' fill='${fundo}' opacity='0.96'/>`;

export const WALLPAPERS = [
  { nome: 'Céu de Ametista', arquivo: 'ceu-de-ametista', uri: wallpaperUri({ de: '#4A2A8A', para: '#0E0821', seed: 77 }) },
  { nome: 'Lua Dourada', arquivo: 'lua-dourada', uri: wallpaperUri({ de: '#2A1D52', para: '#0E0821', seed: 191, extra: LUA('#221643') }) },
  { nome: 'Névoa Cósmica', arquivo: 'nevoa-cosmica', uri: wallpaperUri({ de: '#7B3FB5', para: '#1A1235', seed: 313 }) },
];

// ---------------------------------------------------------------------------
// Conteúdo entregue por brinde (texto embutido = entrega instantânea e
// honesta). Tom alinhado à honestidade astrológica do app: ritual como
// momento de intenção e autocuidado — nunca promessa de resultado.
export const BRINDE_CONTEUDO = {
  'brinde-ritual-lua': {
    titulo: 'Guia do Ritual de Lua Cheia',
    secoes: [
      {
        t: 'Antes de começar',
        p: 'Confira no Calendário Lunar do app quando é a próxima Lua Cheia. Reserve 20 minutos só seus, de preferência à noite, num canto tranquilo. O ritual é um momento de intenção e autocuidado — o poder está na pausa que você se dá, não em fórmulas mágicas.',
      },
      {
        t: 'Passo 1 — Preparar o espaço',
        p: 'Apague as luzes fortes. Se tiver vela ou incenso, acenda; se não tiver, a luz da própria Lua basta. Deixe o celular no silencioso (depois de abrir este guia 😉).',
      },
      {
        t: 'Passo 2 — Soltar o ciclo que fecha',
        p: 'A Lua Cheia marca o ponto alto do ciclo lunar. Escreva num papel uma coisa que você quer soltar: um hábito, um medo, uma mágoa. Leia em voz alta e dobre o papel — o gesto de nomear já é metade do trabalho.',
      },
      {
        t: 'Passo 3 — Agradecer o que floresceu',
        p: 'Anote três coisas que cresceram na sua vida desde a última Lua Nova, por menores que sejam. Gratidão em ciclo lunar é treino de percepção: o que você percebe, você rega.',
      },
      {
        t: 'Passo 4 — Selar com uma intenção',
        p: 'Feche os olhos, respire fundo três vezes e escolha UMA intenção pra levar até a próxima Lua. Se quiser, registre-a como insight de voz no seu Diário Cósmico — ela fica guardada com a data de hoje.',
      },
      {
        t: 'Dica da casa',
        p: 'Repita o ritual a cada Lua Cheia e compare seus registros no Diário: em três ciclos você já enxerga seus próprios padrões. Constância vale mais que perfeição.',
      },
    ],
  },
  'brinde-tiragem-exclusiva': {
    titulo: 'Tiragem da Lua Interior (exclusiva)',
    secoes: [
      {
        t: 'O que é',
        p: 'Uma tiragem de 3 cartas exclusiva de quem resgatou este brinde — e junto com este guia você recebeu 1 Leitura Bônus de Tarô já creditada (vale mesmo com o tema do dia já consultado).',
      },
      {
        t: 'Como tirar',
        p: 'Abra o Tarô do app e faça uma tiragem de 3 cartas usando sua Leitura Bônus. Antes de virar as cartas, respire e faça mentalmente a pergunta: "o que preciso ver em mim agora?".',
      },
      {
        t: 'Posição 1 — O que ilumina',
        p: 'A primeira carta fala da força que já está acesa em você neste momento — leia o significado dela perguntando: "onde isso já aparece na minha semana?".',
      },
      {
        t: 'Posição 2 — O que a sombra guarda',
        p: 'A segunda carta aponta o que você tem evitado olhar. Não é ameaça: é convite. Leia o texto da carta procurando o incômodo que ela toca — é ali que mora o recado.',
      },
      {
        t: 'Posição 3 — O próximo passo',
        p: 'A terceira carta sugere o movimento possível AGORA, não o destino final. Termine registrando a tiragem no Diário Cósmico com um insight de voz — releia na próxima Lua Cheia.',
      },
    ],
  },
  'brinde-wallpapers': {
    titulo: 'Pack de Wallpapers Místicos',
    secoes: [
      {
        t: 'Seu pack',
        p: 'Três wallpapers exclusivos (1080×1920) criados pro Cosmic Guide: Céu de Ametista, Lua Dourada e Névoa Cósmica. Toque em "Baixar" e defina como fundo de tela do celular.',
      },
    ],
    wallpapers: WALLPAPERS,
  },
};

// ---------------------------------------------------------------------------
// Catálogo. Campos com os MESMOS nomes de REWARDS da Loja (cost/icon/webOnly)
// pra render idêntico, mais:
//   kind: 'conteudo' (compra única, reabre grátis) | 'repetivel' (reservado,
//         hoje sem itens) | 'fisico'
//   grantsBonusReading: credita 1 Leitura Bônus real junto (tiragem exclusiva)
//
// title/description NÃO ficam aqui: são traduzidos, e moram no dicionário como
// loja.brinde.<id>.title / .description (lib/i18n.js) — mesmo esquema das
// REWARDS em screens/LojaScreen.js. Antes ficavam neste arquivo em português
// puro e vazavam para o usuário em es/en com o resto da tela traduzido.
export const BRINDES = [
  {
    id: 'brinde-ritual-lua',
    kind: 'conteudo',
    cost: 35,
    icon: 'moon',
  },
  {
    id: 'brinde-wallpapers',
    kind: 'conteudo',
    cost: 40,
    icon: 'image',
    // Download via <a download> só existe na web (mesmo critério honesto do
    // Tema Dourado: nunca vender efeito que a plataforma não entrega).
    webOnly: true,
  },
  {
    id: 'brinde-tiragem-exclusiva',
    kind: 'conteudo',
    cost: 70,
    icon: 'sparkles',
    grantsBonusReading: true,
  },
  // (Sem "escudo extra" aqui de propósito: a Loja JÁ vende o Escudo da
  // Sequência nas REWARDS pelo mesmo preço e efeito — listar o mesmo produto
  // duas vezes com nomes diferentes só confunde. Achado da auditoria 27/07.)
  // ---- FÍSICOS (estrutura pronta, DESLIGADA — ver BRINDES_FISICOS_ATIVOS) --
  {
    id: 'brinde-incenso',
    kind: 'fisico',
    fisico: true,
    cost: 400,
    icon: 'flame',
  },
  {
    id: 'brinde-cristal',
    kind: 'fisico',
    fisico: true,
    cost: 600,
    icon: 'diamond',
  },
];

// Lista que a Loja deve exibir: físicos só entram com a flag ligada (o filtro
// webOnly continua na tela, igual ao das REWARDS existentes).
export function getBrindesDisponiveis() {
  return BRINDES.filter((b) => !b.fisico || BRINDES_FISICOS_ATIVOS);
}
