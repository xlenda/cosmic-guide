// A FAIXA CURVA — a seção cuja borda de cima é uma ONDA. (12/09/2026)
//
// O QUE É. Um envelope de seção: um chão de cor própria cuja borda superior é
// uma curva, não uma linha reta. Empilhando duas ou três com cores vizinhas, o
// rolo lê como PAISAGEM — "mudou de assunto" sem precisar de título nem de
// linha divisória. É o recurso nº 1 dos 66 prints do concorrente e o que mais
// falta no Cosmic, onde tudo corre junto sobre o mesmo fundo e por isso parece
// lista.
//
// QUANDO USAR. Em volta de uma SEÇÃO inteira de uma tela rolável: o bloco
// "Como funciona", o bloco dos seus dados, o bloco da oferta. Duas a quatro por
// tela. Cinco ou mais e volta a ser textura.
//
// O QUE NÃO É.
//   · Não é card. Card tem borda nos quatro lados e some no meio da tela; a
//     faixa sangra de ponta a ponta e é o CHÃO embaixo dos cards.
//   · Não é divisor. components/WaveDivider.js desenha só a borda e não muda o
//     chão — continua servindo pra um corte solto, mas uma seção de verdade
//     quer esta peça.
//   · Não é fundo de tela. O fundo é components/CosmicScene.js, e ele continua
//     por trás: a faixa é TRANSLÚCIDA de propósito (ver abaixo).
//   · Não anima, não reage a scroll e não recebe toque próprio — os filhos é
//     que são tocáveis.
//
// OPACO OU TRANSLÚCIDO: TESTADO, E O TRANSLÚCIDO GANHOU. Com a faixa opaca o
// céu estrelado do CosmicScene SOME embaixo dela, e o app perde exatamente a
// atmosfera que o dono quer preservar — vira cartão de cor chapada colado sobre
// um fundo bonito que ninguém mais vê. Em alfa ~0.82 as estrelas continuam
// atravessando de leve e a mudança de chão ainda se lê sem esforço. Por isso os
// TONS abaixo são rgba, não hex. Quem precisar de faixa 100% opaca (um
// paywall que não pode competir com nada) passa `opaco`.
//
// SVG OU BORDER-RADIUS: SVG. react-native-svg ^15.12.1 ESTÁ nas dependências
// (package.json, conferido 12/09/2026 — os comentários antigos de CosmicScene.js
// e ZodiacBody.js dizendo que não está são anteriores à instalação) e já roda em
// components/SkyAlignmentStage.js e em seis arquivos da Madre Maria. O truque
// sem-SVG (View com borderRadius gigante + rotação) só produz UM formato de
// curva: gira e engorda quanto quiser, é sempre a mesma elipse, e a exigência
// aqui é justamente que cada faixa tenha uma onda diferente. Com Path o desenho
// vem de lib/ondaPath.js e varia de verdade.
//
// EMPILHAMENTO SEM FRESTA. A onda é desenhada em uma caixa de ONDA_ALTURA px no
// topo, e o corpo tem a MESMA cor logo abaixo — as duas encostam sem vão. A
// faixa seguinte sobe marginTop: -1 (`grude`) pra matar a meia-linha de
// antialias que o navegador deixa entre dois preenchimentos vizinhos. Sem
// sobreposição: a de baixo não cobre conteúdo da de cima.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { space } from '../theme';
import { ondaPath, ONDA_ALTURA } from '../lib/ondaPath';

// TONS — a paleta do COSMIC, não a do concorrente. Decisão do dono: trazer o
// recurso com a cara dele. São os roxos/ameixa de theme.js em alfa, mais o
// dourado como ACENTO (alfa baixo de propósito: dourado chapado numa seção
// inteira vira outdoor; ele entra como calor por baixo do conteúdo).
const TONS = {
  // O chão NEUTRO — o degrau que separa sem colorir.
  //
  // MEDIDO E CORRIGIDO (12/09/2026). O valor anterior era
  // rgba(33,25,37,0.82) (família surfaceElevated #211925) e NÃO mudava o
  // chão: fotografado na Home, o pixel da faixa 'noite' dava rgb(29,21,34)
  // contra um céu de rgb(24,13,49) no mesmo x — contraste 1.13 e ΔE 7.6.
  // Abaixo do limiar: o olho lia "a faixa acabou", não "mudou de assunto",
  // e o recurso nº 1 do diagnóstico simplesmente não acontecia.
  //
  // POR QUE NÃO BASTAVA CLAREAR. Clarear na direção da ameixa resolve o
  // contraste contra o fundo e QUEBRA o contraste contra a ameixa, que é a
  // vizinha de cima na Home: testados #2A2130, #302538 e #342A3E, todos
  // levaram ΔE(noite,ameixa) de 12,4 pra 1,0–2,8 — as duas faixas viravam
  // o mesmo chão. Ir pro azul (#282438, #2C2840) tem o mesmo defeito pelo
  // outro lado: ΔE contra a ameixa cai pra 7–9.
  //
  // O MEIO-TERMO, E POR QUE ESTE. #33313C é ardósia: sobe a LUZ sem entrar
  // na ameixa, porque é dessaturado onde a ameixa é cromática. Medido:
  //   contra o fundo   ΔE 7,6 -> 15,1   (a ameixa, que já lê, tem 19,6)
  //   contra a ameixa  ΔE 12,4 -> 13,2  (a separação MELHOROU, não piorou)
  //   contraste/fundo  1,130 -> 1,399
  // E fica abaixo do violeta (1,869), que é o tom que o lote da Home mediu
  // "lavando a tela" em faixa longa — o teto que este valor não podia
  // encostar. O alfa continua 0.82: as estrelas seguem atravessando.
  noite: 'rgba(51, 49, 60, 0.82)',      // ardósia #33313C
  // Ameixa com mais cor: a faixa "principal" de uma tela.
  ameixa: 'rgba(59, 35, 64, 0.82)',     // família gradients.hero #3B2340
  // Violeta: para a seção que precisa se destacar das vizinhas. MEDIDO na
  // vitrine (12/09/2026): a primeira tentativa era rgba(80,88,168,.55) e lia
  // AZUL no meio das ameixas — cor de outro app. Puxado de volta pro accent
  // #9B6AC8, que é a família roxa do Cosmic.
  violeta: 'rgba(91, 62, 124, 0.80)',
  // Rosa: a família do pink #D96E9C — o chão dos assuntos de amor/casal.
  rosa: 'rgba(96, 44, 74, 0.62)',
  // Dourado: ACENTO — o chão QUENTE, pro epílogo e pra oferta.
  //
  // MEDIDO na vitrine: alfa 0.14 sobre fundo quase preto é invisível — a
  // faixa "dourada" saía cinza, um acento que não acenta. O dourado precisa
  // de um chão ameixa por baixo pra ter o que aquecer, então o tom é a
  // mistura já resolvida, não o dourado puro em alfa.
  //
  // SEGUNDA CORREÇÃO (12/09/2026): a mistura estava quente DEMAIS e pro lado
  // errado. rgba(93,66,40,0.72) resolve em rgb(70,49,34), e medindo o matiz
  // em Lab isso dá hue 61° — AMARELO-MARROM. O resto da paleta vive entre
  // 302° e 321° (ameixa 320°, violeta 310°, rosa 339°). Um bloco a 61° no
  // meio disso não lê como "acento quente da casa", lê como sépia — fundo de
  // OUTRO app, que foi exatamente a reclamação no epílogo da Home.
  //
  // O CONSERTO é puxar o matiz pra dentro da família sem apagar o calor: em
  // vez de tirar do dourado puro (amarelo), a mistura sai do ameixa com o
  // vermelho do dourado por cima. #5E3E44 resolve em rgb(71,47,54):
  //   hue          61° -> 360°  (borda quente da família, não amarelo)
  //   contraste    1,636 -> 1,640 (o calor e o peso do chão não mudaram)
  //   ΔE/ameixa    28,5 -> 15,4  (continua sendo outro assunto, sem gritar)
  // Fica entre a ameixa (320°) e o rosa (339°) na mesma roda — a faixa
  // parece o mesmo app, esquentada.
  dourado: 'rgba(94, 62, 68, 0.72)',
};

export const FAIXA_TONS = Object.keys(TONS);

// A COR de um tom, pra quem precisa CASAR com a faixa em vez de desenhá-la.
// Caso real (PlanosScreen, 12/09/2026): a arte do topo tem um fade no pé
// que existe pra manter o título legível sobre o trecho claro do céu. Com
// a faixa subindo por cima da arte, esse fade precisa terminar na COR DA
// FAIXA — terminando no fundo da tela ele pinta uma tira escura por cima
// dela e engole a crista da onda. Sem esta função a tela teria que
// duplicar o literal rgba e as duas cores sairiam do lugar no dia em que
// o tom mudasse aqui.
export function corDoTom(tom) {
  return TONS[tom] || TONS.noite;
}

export default function FaixaCurva({
  tom = 'noite',
  semente,           // identidade da onda; o nome da seção serve ('sobre', 'dados'…)
  grude = false,     // true quando esta faixa vem logo abaixo de outra
  opaco = false,     // mata a translucidez (paywall, tela que não pode competir)
  // A ONDA BAIXA, pra seção FINA (12/09/2026, item 1 do conserto de
  // diagramação). A caixa da onda tem ONDA_ALTURA (56px) fixos, e acima da
  // crista ela é transparente — mas na BORDA da tela, onde a curva desce, a
  // caixa fica quase toda preenchida: medido na Home em estado vazio, 54px de
  // chão liso antes da primeira palavra. Numa seção cheia isso é a entrada
  // que a faixa merece. Numa seção fina — o convite pra preencher o Mapa, um
  // comprimido de 39px — é mais chão do que conteúdo, e a faixa lê como bloco
  // de cor em vez de seção.
  //
  // `rasa` corta a caixa pela METADE (28px). A onda NÃO é redesenhada: o mesmo
  // `d` da mesma semente estica pra caixa menor, porque o viewBox é 100×100 com
  // preserveAspectRatio="none" — a curva continua sendo A curva daquela seção,
  // só mais rasa. Sem isto, encolher a onda exigiria uma segunda semente e a
  // seção trocaria de identidade ao ganhar conteúdo, que é pior.
  rasa = false,
  style,
  // O respiro DENTRO da faixa, quando o conteúdo já traz o seu. Caso real
  // (Home, 12/09/2026): a faixa que abre logo abaixo do cabeçalho da tela —
  // o cabeçalho já tem folga embaixo, e somar o paddingTop 'secao' da faixa
  // abria um buraco visível entre os dois. Passar { paddingTop: 0 } corrige
  // sem mexer no degrau padrão, que continua certo para as outras faixas.
  estiloCorpo,
  children,
  testID,
}) {
  const cor = TONS[tom] || TONS.noite;
  // opaco: reaproveita o mesmo tom sem alfa. rgba(...,a) -> rgb(...).
  const fill = opaco ? cor.replace(/rgba\(([^)]+),\s*[\d.]+\)/, 'rgb($1)') : cor;
  const d = ondaPath(semente == null ? tom : semente);

  return (
    // box-none: a faixa é chão e nunca é alvo de toque, mas os filhos
    // (cards, botões) continuam vivos. "none" mataria o toque deles.
    <View pointerEvents="box-none" style={[grude && styles.grude, style]} testID={testID}>
      {/* A onda. preserveAspectRatio="none" faz o viewBox 100×100 esticar pra
          qualquer largura de tela — nada é recalculado por breakpoint, e a
          curva fica igualmente rasa em 390px e em 1200px. */}
      <Svg
        width="100%"
        height={rasa ? ONDA_ALTURA / 2 : ONDA_ALTURA}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        <Path d={d} fill={fill} />
      </Svg>
      {/* O corpo: mesma cor, encostado na onda. marginTop -1 mata a meia-linha
          de antialias entre o Path e a View. */}
      <View pointerEvents="box-none" style={[styles.corpo, { backgroundColor: fill }, estiloCorpo]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corpo: {
    marginTop: -1,
    // O respiro DENTRO da faixa. `secao` em cima e embaixo é o degrau que faz
    // a tela deles respirar — o degrau que o app quase não usava.
    paddingTop: space.secao,
    paddingBottom: space.secao,
    paddingHorizontal: space.tela,
  },
  // -1px: sem isto o navegador desenha um fio do fundo entre duas faixas.
  grude: { marginTop: -1 },
});
