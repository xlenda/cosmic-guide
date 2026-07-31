// lib/emocoes.js
// ENTRADA POR EMOÇÃO — a pessoa diz como está, em vez de escolher no menu.
//
// A mecânica é a do concorrente nº 1: em vez de um grid de features ("Tarô",
// "Horóscopo", "Compatibilidade"), a tela pergunta como a pessoa TÁ, do jeito
// que ela falaria com uma amiga — e cada estado aponta pra 1-2 features que já
// existem no app. Nenhuma tela nova de conteúdo nasce aqui: isto é uma PORTA,
// não um destino.
//
// ===========================================================================
// A REGRA DA PONTE — assunto, nunca tratamento. Leia antes de escrever aqui.
// ===========================================================================
// A frase-ponte descreve O QUE A LEITURA COBRE ("a tiragem de três cartas tem
// uma casa só pra frente"), NUNCA o efeito sobre a pessoa. A diferença é a
// mesma de lib/rituais.js e lib/grounding.js: "o tarô de futuro olha essa
// pergunta" descreve; "o tarô vai te acalmar sobre o futuro" promete — e
// promessa de efeito é a linha vermelha do produto inteiro.
//
// PROIBIDO, por palavra e não por intenção (test/emocoes.test.js varre e
// aborta): os vocabulários de SAÚDE, PROMESSA e MECANISMO das outras
// bibliotecas, mais o verbo "ajudar" — porque "isso ajuda com o que você tá
// sentindo" é exatamente a ponte de tratamento que esta tela não faz.
//
// A pessoa PODE se dizer "ansiosa" — é o estado dela, dito por ela, e calar
// isso seria calar a mecânica inteira. O que não pode é a RESPOSTA do app
// tratar o estado: a ponte muda de assunto (o que a leitura cobre), não de
// dono (o que a pessoa sente).
//
// ===========================================================================
// O QUE NÃO ENTRA NA LISTA — sofrimento pesado
// ===========================================================================
// Luto, desespero, ideação, pânico: NÃO são estados desta lista, de propósito.
// Não somos o lugar disso, e fingir que somos seria a pior versão da promessa
// de efeito. O teste varre os textos e reprova se alguém adicionar um estado
// desse peso aqui — a resposta certa pra essa pessoa não é uma feature.
//
// ===========================================================================
// AS FERRAGENS
// ===========================================================================
// • Texto de conteúdo em PT, dentro do lib — padrão declarado de
//   lib/synastry.js e lib/rituais.js. O PT é o canônico e mora nas tabelas
//   daqui, byte a byte como sempre foi (test/emocoesIdiomas.test.js guarda a
//   saída dourada capturada antes do refactor de idiomas). Os packs es/en
//   (lib/traducoes/emocoes.es.js / .en.js) trocam SÓ texto: id, emoji, destino,
//   rota e abaPai vêm sempre daqui — mesma arquitetura de lib/jornada.js.
//   lib/i18n.js continua fora: até o chrome da tela viaja pelos packs.
// • `rota` vem IMPORTADA de routes.js, nunca copiada — renomear uma rota tem
//   que quebrar o teste, não o botão em produção. Mesma decisão de FEATURES em
//   lib/jornada.js.
// • O Tarô é a única feature que mora em OUTRA aba (TarotStack dentro de
//   TAROT_TAB). `abaPai` marca isso, e alvoDeNavegacao() devolve o alvo certo
//   — é o mesmo desenho do getParent() de screens/JornadaScreen.js.
// • As pontes não fazem NENHUMA afirmação histórica — nada de autor, obra ou
//   século. Não é esquecimento, é desenho: afirmação histórica exige locus da
//   base docs/tradicao/, e o lugar dela é DENTRO da feature (rituais, jornada,
//   tarô já citam as suas). A porta só aponta; quem recebe entrega a fonte.
//   O teste tranca isso: "séc." e ano de quatro dígitos reprovam aqui.
import { ROUTES } from '../routes';
import PACK_EMOCOES_ES from './traducoes/emocoes.es';
import PACK_EMOCOES_EN from './traducoes/emocoes.en';

// ---------------------------------------------------------------------------
// 1. OS DESTINOS — as features que já existem, com a rota real de cada uma
// ---------------------------------------------------------------------------
// `rotulo` é o nome da feature como a tela apresenta; `botao` é o texto do
// CTA. `abaPai` só existe quando a rota mora em outra aba do Tab.Navigator.
export const DESTINOS = {
  taro: {
    rotulo: 'Tarô',
    botao: 'Abrir o Tarô',
    rota: ROUTES.TAROT_MAIN,
    abaPai: ROUTES.TAROT_TAB,
  },
  horoscopo: {
    rotulo: 'Horóscopo do dia',
    botao: 'Ver o horóscopo de hoje',
    rota: ROUTES.HOROSCOPE,
  },
  compatibilidade: {
    rotulo: 'Compatibilidade',
    botao: 'Abrir Compatibilidade',
    rota: ROUTES.COMPATIBILITY,
  },
  sonhos: {
    rotulo: 'Leitura de sonhos',
    botao: 'Contar o sonho',
    rota: ROUTES.DREAM,
  },
  diario: {
    rotulo: 'Diário Cósmico',
    botao: 'Escrever no Diário',
    rota: ROUTES.DIARY,
  },
  aterramento: {
    rotulo: 'Assentar',
    botao: 'Abrir o Assentar',
    rota: ROUTES.GROUNDING,
  },
  rituais: {
    rotulo: 'Rituais',
    botao: 'Ver os Rituais',
    rota: ROUTES.RITUAIS,
  },
  jornada: {
    rotulo: 'Jornada Guiada',
    botao: 'Começar a Jornada',
    rota: ROUTES.JORNADA,
  },
  calendarioCosmico: {
    rotulo: 'Calendário Cósmico',
    botao: 'Abrir o Calendário Cósmico',
    rota: ROUTES.CALENDARIO_COSMICO,
  },
};

// ---------------------------------------------------------------------------
// 2. OS ESTADOS — como a pessoa fala, não como o menu classifica
// ---------------------------------------------------------------------------
// Cada estado: `fala` (a frase da pessoa, curta o bastante pra caber num chip)
// e 1-2 `pontes`. Cada ponte: `destino` (id de DESTINOS) + `texto` — a frase
// que descreve o que aquela leitura cobre. Assunto, nunca efeito.
export const ESTADOS = [
  {
    id: 'ansiosaComOFuturo',
    emoji: '🌫️',
    fala: 'Tô ansiosa com o futuro',
    pontes: [
      {
        destino: 'taro',
        texto:
          'A tiragem de três cartas tem uma casa só pra frente: o Futuro, lido como direção — pra onde o assunto aponta se nada mudar. É exatamente essa pergunta que a casa cobre.',
      },
      {
        destino: 'horoscopo',
        texto:
          'O horóscopo de hoje descreve o céu do seu dia, pro seu signo — o dia que vem aí é exatamente o assunto que ele cobre.',
      },
    ],
  },
  {
    id: 'brigueiComQuemAmo',
    emoji: '💔',
    fala: 'Briguei com quem eu amo',
    pontes: [
      {
        destino: 'compatibilidade',
        texto:
          'A leitura de compatibilidade nomeia a relação entre os dois signos — inclusive as combinações duras, que ela chama pelo nome em vez de maquiar com nota alta.',
      },
      {
        destino: 'diario',
        texto:
          'O diário é a página sem plateia: a sua versão da briga, escrita com data, pra reler quando a poeira baixar.',
      },
    ],
  },
  {
    id: 'semRumo',
    emoji: '🧭',
    fala: 'Não sei que rumo tomar',
    pontes: [
      {
        destino: 'taro',
        texto:
          'A tiragem de três casas divide a pergunta em partes: de onde o assunto vem, onde ele está e pra onde aponta. Rumo é exatamente o que ela olha.',
      },
      {
        destino: 'jornada',
        texto:
          'A Jornada é uma trilha de sete dias com um passo marcado por dia — pra quem quer começar a andar sem ter que decidir o mapa inteiro hoje.',
      },
    ],
  },
  {
    id: 'saudadeDeAlguem',
    emoji: '💌',
    fala: 'Tô com saudade de alguém',
    pontes: [
      {
        destino: 'rituais',
        texto:
          'Na prateleira de Amor dos Rituais existe um gesto feito pra esse assunto: a carta que não se envia — escrever o que você sente, ler em voz alta e guardar.',
      },
      {
        destino: 'diario',
        texto:
          'O diário guarda a saudade com data. Daqui a um mês dá pra reler e ver o que ela virou.',
      },
    ],
  },
  {
    id: 'medoDeDecidirErrado',
    emoji: '⚖️',
    fala: 'Medo de tomar a decisão errada',
    pontes: [
      {
        destino: 'taro',
        texto:
          'O tarô abre a decisão em três casas — de onde ela vem, onde ela está, pra onde aponta. É leitura da situação, com a escolha ficando na sua mão.',
      },
      {
        destino: 'diario',
        texto:
          'No diário dá pra escrever os dois lados da decisão, com data — e voltar depois pra conferir o que você já tinha visto.',
      },
    ],
  },
  {
    id: 'querendoRecomecar',
    emoji: '🌱',
    fala: 'Querendo recomeçar',
    pontes: [
      {
        destino: 'jornada',
        texto:
          'A Jornada começa do dia um de propósito: sete dias, um passo por dia, progresso marcado na tela. Recomeço com trilho.',
      },
      {
        destino: 'rituais',
        texto:
          'A prateleira de Limpeza dos Rituais é toda de encerramento — esvaziar, largar, fechar o que ficou aberto, com a própria mão.',
      },
    ],
  },
  {
    id: 'cabecaCheia',
    emoji: '🌀',
    fala: 'Cabeça cheia, pensamento que não desliga',
    pontes: [
      {
        destino: 'aterramento',
        texto:
          'O Assentar é respiração contada: quatro tempos, começo e fim marcados no relógio. A tela só conta o ritmo — o resto é seu.',
      },
      {
        destino: 'diario',
        texto:
          'O diário aceita a lista inteira, do jeito que ela está — despejar no papel é um gesto, e a página guarda com data.',
      },
    ],
  },
  {
    id: 'sonhoQueNaoLargou',
    emoji: '🌙',
    fala: 'Sonhei uma coisa estranha e ela não me largou',
    pontes: [
      {
        destino: 'sonhos',
        texto:
          'A leitura de sonhos parte da imagem que ficou: você conta o que sonhou e a leitura percorre o que essa imagem carrega na tradição.',
      },
    ],
  },
  {
    id: 'divididaEntreDuasPessoas',
    emoji: '💞',
    fala: 'Dividida entre duas pessoas',
    pontes: [
      {
        destino: 'compatibilidade',
        texto:
          'A compatibilidade lê um par por vez — dá pra rodar as duas duplas e comparar a relação que sai nomeada em cada uma.',
      },
      {
        destino: 'taro',
        texto:
          'No tarô, o tema de Amor lê as cartas pela pergunta do vínculo — o desejo, o que ainda não virou palavra, o que precisa ser dito.',
      },
    ],
  },
  {
    id: 'granaApertada',
    emoji: '💸',
    fala: 'A grana apertou esse mês',
    pontes: [
      {
        destino: 'taro',
        texto:
          'O tarô tem um tema só de dinheiro: as mesmas cartas, lidas pelo número olhado de frente, sem a história em volta.',
      },
      {
        destino: 'rituais',
        texto:
          'A prateleira de Prosperidade dos Rituais começa com as contas na mesa, literalmente — papel, caneta e o tamanho real do que existe.',
      },
    ],
  },
  {
    id: 'conheciAlguem',
    emoji: '✨',
    fala: 'Conheci alguém e já tô sonhando alto',
    pontes: [
      {
        destino: 'compatibilidade',
        texto:
          'A leitura de compatibilidade pega os dois signos e diz que relação existe entre eles — relação com nome, não porcentagem solta.',
      },
      {
        destino: 'taro',
        texto:
          'O tema de Amor do tarô recebe exatamente esse tipo de pergunta — o vínculo que está nascendo, lido carta a carta.',
      },
    ],
  },
  {
    id: 'diaGrandeAmanha',
    emoji: '🗓️',
    fala: 'Amanhã é um dia grande pra mim',
    pontes: [
      {
        destino: 'calendarioCosmico',
        texto:
          'O Calendário Cósmico mostra o que o céu tem marcado pra data: fase exata da Lua, ingresso do Sol, retrógrado — tudo calculado, nada tabelado.',
      },
      {
        destino: 'horoscopo',
        texto:
          'O horóscopo do dia lê o céu de hoje pro seu signo — o retrato do céu na véspera do seu dia grande.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2.5 O CHROME DA TELA — as quatro frases fixas de ComoVoceTaScreen
// ---------------------------------------------------------------------------
// Moradia nova, bytes velhos: estas strings viviam como constantes PT locais
// da tela e vieram pra cá SEM mudar um caractere (o golden prova), porque o
// idioma delas agora viaja pelos mesmos packs do conteúdo — lib/i18n.js segue
// intocado, como o cabeçalho manda.
export const CHROME_TELA = {
  titulo: 'Como você tá?',
  subtitulo: 'Diz do seu jeito',
  intro: 'Toca no que mais parece com você agora. Cada estado aponta pra leitura que cobre esse assunto.',
  overlinePontes: 'Onde esse assunto mora no app',
};

// ---------------------------------------------------------------------------
// 2.6 IDIOMAS — os packs es/en por cima das tabelas PT
// ---------------------------------------------------------------------------
// Mesma arquitetura de lib/jornada.js: o PT é canônico e mora nas tabelas
// acima; os packs trocam SÓ o texto (fala, texto de ponte, rótulo, botão,
// chrome). `lang` desconhecido cai em PT de propósito — a chamada antiga, sem
// argumento, não muda nada, e test/emocoesIdiomas.test.js prova byte a byte.
const PACKS = { es: PACK_EMOCOES_ES, en: PACK_EMOCOES_EN };

// A forma canônica dos textos, num objeto só — o pack pt é DERIVADO das
// tabelas (nunca uma segunda cópia), e é contra ele que o teste de paridade
// compara as chaves de es/en.
export function packDeTextos(lang = 'pt') {
  if (lang !== 'pt') return PACKS[lang] || null;
  const estados = {};
  for (const e of ESTADOS) {
    estados[e.id] = { fala: e.fala, pontes: e.pontes.map((p) => p.texto) };
  }
  const destinos = {};
  for (const [id, d] of Object.entries(DESTINOS)) {
    destinos[id] = { rotulo: d.rotulo, botao: d.botao };
  }
  return { tela: { ...CHROME_TELA }, estados, destinos };
}

// Memo por idioma: as tabelas são estáticas, montar uma vez basta. Para 'pt'
// (e para idioma desconhecido) devolve a PRÓPRIA referência de ESTADOS/
// DESTINOS — identidade, não cópia: a garantia mais forte de que o caminho PT
// não passou pelo refactor.
const _estadosPorIdioma = {};
const _destinosPorIdioma = {};

export function estadosParaIdioma(lang = 'pt') {
  const pack = PACKS[lang];
  if (!pack) return ESTADOS;
  if (!_estadosPorIdioma[lang]) {
    _estadosPorIdioma[lang] = ESTADOS.map((e) => {
      const pe = (pack.estados || {})[e.id] || {};
      const textos = Array.isArray(pe.pontes) ? pe.pontes : [];
      return {
        ...e,
        fala: pe.fala || e.fala,
        // A ponte localizada preserva o `destino` (id canônico, com rota e
        // abaPai vindos das tabelas) — só o texto muda de idioma.
        pontes: e.pontes.map((p, i) => ({ ...p, texto: textos[i] || p.texto })),
      };
    });
  }
  return _estadosPorIdioma[lang];
}

export function destinosParaIdioma(lang = 'pt') {
  const pack = PACKS[lang];
  if (!pack) return DESTINOS;
  if (!_destinosPorIdioma[lang]) {
    const saida = {};
    for (const [id, d] of Object.entries(DESTINOS)) {
      const pd = (pack.destinos || {})[id] || {};
      saida[id] = { ...d, rotulo: pd.rotulo || d.rotulo, botao: pd.botao || d.botao };
    }
    _destinosPorIdioma[lang] = saida;
  }
  return _destinosPorIdioma[lang];
}

export function chromeDaTela(lang = 'pt') {
  const pack = PACKS[lang];
  return (pack && pack.tela) || CHROME_TELA;
}

// ---------------------------------------------------------------------------
// 3. RESOLVEDORES — o que a tela usa, e o que o teste exercita
// ---------------------------------------------------------------------------
export function estadoPorId(id, lang = 'pt') {
  return estadosParaIdioma(lang).find((e) => e.id === id) || null;
}

export function destinoDe(idDestino, lang = 'pt') {
  return destinosParaIdioma(lang)[idDestino] || null;
}

// O alvo de navegação, resolvido AQUI (puro, testável) e não na tela.
// Devolve { viaAbaPai, nome }: quando a feature mora em outra aba do
// Tab.Navigator, quem navega é o navigator PAI, pro nome da ABA — é o caso do
// Tarô, e é o mesmo desenho de screens/JornadaScreen.js. Nas demais, a rota é
// da própria stack em que a tela vive.
export function alvoDeNavegacao(destino) {
  if (!destino || !destino.rota) return null;
  if (destino.abaPai) return { viaAbaPai: true, nome: destino.abaPai };
  return { viaAbaPai: false, nome: destino.rota };
}

// Todo texto que a pessoa pode ler nesta biblioteca, como [caminho, texto] —
// a matéria-prima das varreduras de test/emocoes.test.js (PT) e de
// test/emocoesIdiomas.test.js (os três idiomas). Mesmo desenho de
// textosVisiveis() em lib/rituais.js: a lista anda sozinha quando alguém
// adiciona estado ou destino, sem lista de campos escrita à mão pra esquecer.
// Sem `lang` a saída é EXATAMENTE a de antes do refactor de idiomas — o
// chrome da tela não entra aqui de propósito (varredura própria no teste de
// idiomas), pra manter esta lista byte-idêntica ao golden.
export function textosVisiveis(lang = 'pt') {
  const saida = [];
  for (const e of estadosParaIdioma(lang)) {
    saida.push([`estado:${e.id}.fala`, e.fala]);
    (e.pontes || []).forEach((p, i) => {
      saida.push([`estado:${e.id}.ponte[${i}]`, p.texto]);
    });
  }
  for (const [id, d] of Object.entries(destinosParaIdioma(lang))) {
    saida.push([`destino:${id}.rotulo`, d.rotulo]);
    saida.push([`destino:${id}.botao`, d.botao]);
  }
  return saida;
}
