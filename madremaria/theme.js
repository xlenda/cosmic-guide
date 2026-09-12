// REGRA TRAVADA: colores.hilo (#C1121F) e PROIBIDO como cor de TEXTO sobre o fundo
// do app — 3,2:1, reprova WCAG AA; so traco, icone, fundo de botao e barra de
// progresso. (Medido de novo apos a fusao: sobre o fundo do Cosmic da 3,20:1 —
// a regra continua valendo pelo MESMO motivo, nao por heranca.)
//
// Fio Vermelho (Madre Maria) — fonte unica de design tokens DESTE modulo.
// Tudo congelado nivel a nivel e deterministico. Nenhum hex literal fora deste
// arquivo: toda cor de componente ou tela sai de `colores`.
//
// =====================================================================================
// FUSAO COSMIC GUIDE — 11/09/2026. "Cores do Cosmic Guide, alma dela INTEIRA."
// =====================================================================================
// Este modulo mora DENTRO do Cosmic Guide. As cores ESTRUTURAIS (fundo, superficie,
// texto, borda) passam a LER de ../theme.js, para que a Madre pareca o mesmo app.
// As cores da ALMA ficam literais aqui: elas sao a marca dela, nao decoracao.
//
// REGRA PARA QUEM MEXER DEPOIS: nao troque um token da alma por um token do Cosmic
// "para uniformizar". O fio e vermelho porque o projeto se chama Fio Vermelho.
//
// ------------------------------- MAPA DE-PARA ---------------------------------------
// TOKEN        ANTES      DEPOIS                      DECISAO
// noche        #0B0708 -> cosmic.background #0B0712   ESTRUTURAL. O fundo do app.
// penumbra     #160C0E -> cosmic.card       #19121F   ESTRUTURAL. Card/sheet/campo.
//                                                     `card` e nao `surface`: penumbra
//                                                     e um degrau ACIMA do fundo, que
//                                                     e exatamente o papel de `card`.
// papel        #EFE6D6 -> cosmic.text       #FAF5EA   ESTRUTURAL. Texto principal.
//                                                     18,3:1 sobre o fundo novo.
// ceniza       #8C8079 -> cosmic.textSecondary #C9BFCB ESTRUTURAL. Texto secundario.
//                                                     Sobe de 5,2:1 para 11,2:1.
// bordeSuave   ceniza22% -> cosmic.border   #3A2E3D   ESTRUTURAL. Divisor e borda.
// escenario    #000000 -> cosmic.background           ESTRUTURAL-MORTO. So o
//                                                     MarcoTelefono usa, e ele NAO
//                                                     entra na fusao (o Cosmic ja tem
//                                                     moldura em CSS, public/index.html
//                                                     :78-83). Fica apontando para o
//                                                     fundo para nunca abrir um buraco
//                                                     preto se alguem montar o Marco.
//
// hilo         #C1121F -> FICA                        ALMA. E o fio vermelho do destino
//                                                     e o NOME do projeto. Nao vira
//                                                     cosmic.red nem cosmic.pink.
// nudo         #7A0B14 -> FICA                        ALMA. O no do fio: pressed, halo,
//                                                     borda viva. E o hilo escurecido —
//                                                     sai junto com ele ou nao sai.
// aguja        #C9A227 -> FICA                        ALMA. A agulha de latao que costura
//                                                     o fio: numero, dia da racha, o
//                                                     metal na lua atual. O gold do
//                                                     Cosmic (#E3B85F) e outro latao,
//                                                     mais claro — trocar apagaria a
//                                                     assinatura do tabuleiro.
// foil         #3E2F33 -> FICA                        ALMA. O veu raspavel. E o gesto que
//                                                     faz ser ritual e nao lista. Precisa
//                                                     continuar ESCURO (e para ser
//                                                     removido) e continuar HEX LITERAL:
//                                                     ScratchRevealCard.js:226 parseia os
//                                                     canais RGB dele em runtime — um
//                                                     rgba() ou um token quebraria o veu.
// velo         noche 86% -> deriva do fundo NOVO      ESTRUTURAL. Fundo de modal/sheet.
// bordeHilo    hilo 45% -> FICA                       ALMA. Borda de item ativo, derivada
//                                                     do fio.
//
// ---------------------------- TOKEN NOVO (conserto de raiz) --------------------------
// foilTexto    (nao existia) #9A8A80                  `foil` estava fazendo DOIS
//   trabalhos com um nome so: (a) superficie de metal a ser raspada — escuro, correto;
//   (b) COR DE TEXTO em 21 lugares de PlanoScreen e MapaDoAnoScreen — onde escuro e
//   invisivel. Medido: foil sobre penumbra = 1,52:1. `linkMapa` (um LINK) e o medalhao
//   da lua atual ("o portal do capitulo") estavam ilegiveis. Bug PRE-EXISTENTE, herdado
//   da copia, nao introduzido pela fusao — e presente tambem no Madre Maria original.
//   Conserto na RAIZ: o token se divide em vez de editar 21 call sites. `foil` continua
//   sendo o metal do veu; `foilTexto` e o mesmo metal levado ao contraste legivel.
//   NOTA: na PaywallScreen (a UNICA tela clara do app, fundo `papel`) `foil` como texto
//   da 10,2:1 e esta CORRETO — por isso o conserto NAO pode ser feito mudando `foil`,
//   so acrescentando um irmao. As trocas para `foilTexto` sao so nas telas ESCURAS.
// =====================================================================================
//
// -------------------------------------------------------------------------------------
// CONTRATO DE PRODUTO (vale para qualquer texto que use estes tokens — nao so para cor)
// 1. A leitura descreve o que a carta mostra e devolve uma acao para a usuaria.
//    Nunca um desfecho, nunca uma promessa sobre o que a outra pessoa vai fazer.
// 2. Zero prova social inventada: sem porcentagem de usuarias, sem contador de gente,
//    sem depoimento. O lugar dessa linha e ocupado por um fato historico verificavel
//    com obra, autor e ano — e por isso existe o estilo `tipo.fuente`, que e a citacao.
// 3. Nenhuma alegacao de saude: o app nao trata, nao cura e nao alivia sintoma.
// 4. O genero de quem esta do outro lado nunca e assumido: "esa persona",
//    "quien esta del otro lado".
// 5. A terceira posicao (Tu Extremo) fala so da usuaria e nunca do futuro.
// 6. Streak que quebra nao pune: sem perda anunciada, sem chama apagada,
//    sem oferta paga de recuperacao. Por isso nao existe token de cor "erro/punicao".
// 7. Espanhol LatAm neutro: "tu". Nunca "vos", nunca "vosotros".
// 8. v1 e local e deterministico: sem IA, sem rede, sem backend.
// -------------------------------------------------------------------------------------

// A paleta estrutural vem do Cosmic Guide (ver MAPA DE-PARA acima). Import de VALOR,
// nao de funcao: theme.js do Cosmic muta o proprio objeto `colors` na carga quando o
// Tema Dourado esta ligado, e isso acontece de forma SINCRONA no topo daquele modulo —
// entao quando esta linha roda os valores ja sao os finais. Ler no topo, como aqui, e
// o unico jeito de o StyleSheet.create das telas capturar a cor certa.
import { colors as cosmic } from '../theme';

/** Congela o objeto e tudo que esta dentro dele. Chamado uma vez por token, na carga. */
const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};


/* ===================================================================================
   COLORES
   A identidade e o fio vermelho do destino sobre a noite. Depois da fusao (11/09/2026)
   a NOITE e a do Cosmic Guide e o FIO continua sendo dela — ver o MAPA DE-PARA no topo.
   Contraste medido contra `noche`, que agora vale cosmic.background (#0B0712).
   =================================================================================== */

/** ALFA sobre um hex #RRGGBB -> string rgba(). Existe porque `velo` e `bordeSuave`
 *  eram derivados de hex FIXOS; agora que a base vem do Cosmic, derivar na mao
 *  congelaria o valor antigo e o modal deixaria de casar com o fundo no dia em que
 *  o Cosmic mudar de paleta (a Loja troca `background`? nao hoje — mas o tema
 *  dourado ja troca `accent`, `border` e os gradientes no mesmo arquivo). */
const conAlfa = (hex, alfa) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
};

export const colores = congelar({
  // --- ESTRUTURAIS: leem do Cosmic Guide para a Madre parecer o mesmo app ----------

  // noche — a noite em que o fio aparece. E o vazio atras de tudo: fundo do app.
  noche: cosmic.background,

  // penumbra — a meia-luz, um degrau acima do fundo: carta, card, sheet, campo.
  penumbra: cosmic.card,

  // papel — a carta de papel velho, nao o branco de tela. Texto principal. 18,3:1.
  papel: cosmic.text,

  // ceniza — a cinza da vela ja apagada. Texto secundario e legenda. 11,2:1.
  ceniza: cosmic.textSecondary,

  // escenario — o preto que ficava ATRAS da moldura de telefone na web. A moldura
  // (components/MarcoTelefono.js) NAO entra na fusao: o Cosmic ja tem a dele em CSS
  // (public/index.html:78-83). O token fica apontando para o fundo do app para que,
  // se alguem montar o Marco por engano, apareca o fundo e nao um buraco preto.
  escenario: cosmic.background,

  // --- ALMA: literais. Sao a marca dela. Ver o MAPA DE-PARA no topo antes de mexer --

  // hilo — o fio vermelho do destino. E a marca e o NOME do projeto. So traco, icone,
  // fundo de botao e barra de progresso: como TEXTO sobre o fundo da 3,2:1 e reprova
  // AA — proibido. Como FUNDO ele passa: papel sobre hilo da 5,0:1 (rotulo do botao).
  hilo: '#C1121F',

  // nudo — o no do fio, o ponto onde ele aperta. Hilo escurecido: estado pressed,
  // halo e borda viva. Papel sobre nudo da 9,2:1.
  nudo: '#7A0B14',

  // aguja — a agulha de latao que costura o fio. Numero, destaque, dia da racha e o
  // metal na lua atual. 8,3:1. Nao virou cosmic.gold: e outro latao, mais claro.
  aguja: '#C9A227',

  // foil — a lamina metalica da raspadinha: o veu que cobre a carta antes de raspar.
  // O gesto que faz a Madre ser ritual e nao lista. Ele existe para ser REMOVIDO, por
  // isso continua escuro. NAO TROCAR POR rgba() NEM POR TOKEN: ScratchRevealCard.js
  // (paletaDeVelo/aCanales) le os canais RGB deste hex em runtime para gerar os
  // quatro tons da lamina.
  foil: '#3E2F33',

  // foilTexto — o mesmo metal, levado ao contraste legivel.
  // Para TEXTO em tela ESCURA onde antes se usava `foil` e nada se lia (1,5:1).
  // 6,0:1 sobre noche, 5,5:1 sobre penumbra.
  // Em tela CLARA (PaywallScreen, fundo papel) continua-se usando `foil`: la ele
  // e escuro sobre claro e da 10,2:1, que esta certo.
  foilTexto: '#9A8A80',

  // --- derivados: nao sao cores novas, sao as de cima com alfa. Existem para que
  // --- nenhum componente precise escrever rgba() na mao (regra 8).
  bordeSuave: conAlfa(cosmic.border, 0.55), //  border do Cosmic 55% — divisor, borda de card
  bordeHilo: 'rgba(193, 18, 31, 0.45)', //      hilo 45% — borda de item ativo (ALMA)
  velo: conAlfa(cosmic.background, 0.86), //    fundo 86% — fundo de modal e sheet
  transparente: 'transparent',
});

/* ===================================================================================
   ESPACIO — escala de 4. Toda margem, padding e gap sai daqui.
   =================================================================================== */
export const espacio = congelar({
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
});

/* ===================================================================================
   RADIO — cantos. sm: chip e tag | md: campo e botao | lg: carta | xl: sheet e modal.
   =================================================================================== */
export const radio = congelar({
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
});

/* ===================================================================================
   FAMILIAS
   Cormorant Garamond = display e TODO italico. Inter = corpo, e Inter NUNCA em italico.
   As strings abaixo sao os nomes das faces de @expo-google-fonts/*; quem chamar
   useFonts precisa registrar exatamente estas nove chaves, porque em React Native o
   fontFamily e resolvido por string — errar o nome nao quebra, so cai calado na fonte
   do sistema. Nunca aplicar fontStyle:'italic' por cima: no Android nao existe italico
   sintetico para fonte custom e o texto sai reto. O italico vem da familia, sempre.
   =================================================================================== */
export const familias = congelar({
  displayMedia: 'CormorantGaramond_500Medium',
  displayMediaItalica: 'CormorantGaramond_500Medium_Italic',
  displaySemi: 'CormorantGaramond_600SemiBold',
  displaySemiItalica: 'CormorantGaramond_600SemiBold_Italic',
  displayNegrita: 'CormorantGaramond_700Bold',
  cuerpoRegular: 'Inter_400Regular',
  cuerpoMedia: 'Inter_500Medium',
  cuerpoSemi: 'Inter_600SemiBold',
  cuerpoNegrita: 'Inter_700Bold',
});

/* ===================================================================================
   TIPO — sete estilos nomeados, prontos para espalhar: <Text style={tipo.cuerpo} />
   Cada estilo carrega as duas leituras da mesma verdade, escritas de uma so vez:
     · as chaves que o React Native entende (fontFamily, fontSize, lineHeight,
       letterSpacing, color, textTransform) — enumeraveis, sao o estilo;
     · os apelidos legiveis do token (familia, tamano, entrelinea, tracking, color) —
       nao enumeraveis de proposito: descrevem o estilo, nao sao estilo. Fossem
       enumeraveis, o react-native-web despejaria "familia"/"tamano" no DOM e o React
       avisaria "Unsupported style property" a cada render. `color` serve as duas.
   =================================================================================== */
const estilo = (familia, tamano, entrelinea, tracking, color, extra) =>
  Object.defineProperties(
    {
      fontFamily: familia,
      fontSize: tamano,
      lineHeight: entrelinea,
      letterSpacing: tracking,
      color,
      ...extra,
    },
    {
      familia: { value: familia },
      tamano: { value: tamano },
      entrelinea: { value: entrelinea },
      tracking: { value: tracking },
    }
  );

export const tipo = congelar({
  // Titulo de tela. Cormorant 700, peso de capa de baralho.
  titulo: estilo(familias.displayNegrita, 34, 40, -0.2, colores.papel),

  // Nome da carta virada. Italico obrigatorio — e o unico italico grande do app.
  nombreCarta: estilo(familias.displaySemiItalica, 26, 32, 0, colores.papel),

  // Rotulo de botao, aba e cabecalho de secao. Caixa alta com tracking largo.
  rotulo: estilo(familias.cuerpoSemi, 13, 16, 1.2, colores.papel, {
    textTransform: 'uppercase',
  }),

  // Sobreceja: a linha miuda acima do titulo (posicao da carta, dia da racha).
  sobreceja: estilo(familias.cuerpoMedia, 11, 14, 1.6, colores.ceniza, {
    textTransform: 'uppercase',
  }),

  // Corpo da leitura. Entrelinha 1,55 (16 → 25) — texto longo, lido na cama, luz baixa.
  cuerpo: estilo(familias.cuerpoRegular, 16, 25, 0, colores.papel),

  // Apoio, ajuda, rodape de card.
  micro: estilo(familias.cuerpoRegular, 13, 19, 0, colores.ceniza),

  // Citacao da fonte historica (obra, autor, ano) — o lugar do fato verificavel
  // que substitui a prova social inventada (regra 2).
  fuente: estilo(familias.displayMediaItalica, 13, 18, 0.1, colores.ceniza),
});

/* ===================================================================================
   SOMBRA — elevacao e halo. Espalhar direto no style da View.
   `halo` usa hilo como luz, nao como texto — permitido pela regra travada.
   Android nao renderiza sombra colorida: por isso elevation fica 0 nos dois halos, e
   o brilho la e feito com borda (colores.bordeHilo) ou uma View de fundo em nudo.
   =================================================================================== */
export const sombra = congelar({
  ninguna: {
    shadowColor: colores.transparente,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  carta: {
    shadowColor: colores.noche,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 6,
  },
  elevada: {
    shadowColor: colores.noche,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  },
  halo: {
    shadowColor: colores.hilo,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 0,
  },
  nudo: {
    shadowColor: colores.nudo,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 0,
  },
});

export default congelar({ colores, espacio, radio, familias, tipo, sombra });
