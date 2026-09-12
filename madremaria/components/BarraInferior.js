// components/BarraInferior.js — A BARRA DE TRES ZONAS
//
// ===========================================================================
// O QUE ESTE ARQUIVO RESOLVE
// ===========================================================================
// Ate agora o Fio Vermelho era um Stack puro: uma tela empilhada sobre a outra,
// sem nada permanente na moldura. No navegador isso le como pagina, nao como
// app — o dono viu e disse exatamente isso. O que falta a um app de telefone e
// a barra: o unico elemento que NAO troca quando a tela troca, e que por isso
// prova o tempo todo que existe um lugar para onde voltar.
//
// A geometria e a do Heat Game, descrita em docs/DIAGRAMACION.md secao 5:
//
//     +-----------------------------------------------+
//     |                     ( o )   <- FAB, sobe acima |
//     |  [icone]            (nudo)          [icone]    |
//     |  MI HILO                            PERFIL     |
//     +-----------------------------------------------+
//        esquerda           centro           direita
//
//   ESQUERDA  Mi Hilo — a racha, o patrimonio dela.
//   CENTRO    o botao redondo, elevado, em colores.hilo, com o NO do fio.
//             Abre O PLANO DO DIA (RUTAS.PLANO) — o ritual de hoje, a pergunta,
//             a frase e a acao. A tiragem continua a um toque: ela e o gesto do
//             dia de 'cartas', e o plano abre a tela dela pelo botao proprio.
//             E o UNICO elemento que quebra a linha da barra por cima; se um dia
//             a esquerda ou a direita tambem subir, a hierarquia morre e a barra
//             vira tres botoes iguais.
//   DIREITA   Perfil — a ficha honesta e a porta de tudo o que nao e leitura.
//
// ===========================================================================
// POR QUE O CENTRO NAO TEM ROTULO
// ===========================================================================
// No molde o FAB e so o mascote dentro do circulo. Escrever "HOY" embaixo dele
// alinharia o centro com as duas zonas laterais e ele deixaria de ser o botao
// para virar mais uma aba. Quem enxerga reconhece o circulo vermelho; quem nao
// enxerga recebe accessibilityLabel + accessibilityHint, que dizem em palavras
// o que o circulo diz em forma. Ninguem fica sem a informacao — ela so viaja
// por canais diferentes.
//
// ===========================================================================
// A ALTURA E O TOQUE (a armadilha do Android)
// ===========================================================================
// O FAB sobe SALIENTE px acima da linha da barra. A tentacao e desenhar a barra
// com a altura dela e deixar o circulo vazar para fora com um margin negativo —
// e o resultado seria um botao que no iOS funciona e no Android nao responde ao
// toque, calado: la o toque fora dos limites do pai simplesmente nao chega ao
// filho, e nenhum log acusa.
//
// Por isso o contenedor tem a altura INTEIRA (saliente + barra + safe area) e e
// transparente na faixa de cima. O que se ve como "barra" e a superficie
// absoluta colada embaixo. O FAB fica dentro dos limites do contenedor do
// comeco ao fim, e o toque chega nele nas duas plataformas.
//
// Como o BottomTabView (v6) empilha cena e barra numa coluna, essa altura
// inteira e descontada da cena: o circulo nunca cobre o conteudo da tela, ele
// flutua sobre o fundo `noche` do app. E o efeito do molde, sem sobreposicao.
//
// ===========================================================================
// REGRAS DO PROJETO QUE ESTE ARQUIVO CUMPRE
// ===========================================================================
//  · Regra 7 — nenhum hex literal: toda cor sai de theme.js.
//  · Regra 8 — colores.hilo nunca e cor de TEXTO. Aqui ele e FUNDO do circulo e
//    o traco do icone e colores.papel (5,0:1 sobre hilo, passa AA). O rotulo das
//    zonas e papel (ativa) ou ceniza (inativa), os dois sobre penumbra.
//  · Toda palavra visivel vem de t() (datos/textos.js).
//  · Nenhuma biblioteca de icone instalada: os tres desenhos sao react-native-svg,
//    que ja e dependencia do projeto.
//  · Alvo de toque >= 44 nas tres zonas (as laterais tem 64 de altura util, o
//    circulo tem 62 de diametro).
//  · Nenhum Alert e nenhuma vibracao: a barra e navegacao, nao evento.

import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { t } from '../datos/textos';
import { RUTAS } from '../routes';
import { colores, espacio, sombra } from '../theme';
import { Sobreceja } from './Texto';

/* ===================================================================================
   GEOMETRIA — os quatro numeros que sustentam o desenho inteiro.

   ALTURA_BARRA e SALIENTE somados dao a altura que o navegador de abas desconta da
   cena. Mexer em qualquer um dos dois muda quanto o FAB sobe E quanto a tela encolhe:
   sao a mesma conta, e por isso moram juntos aqui em cima em vez de espalhados pelo
   StyleSheet.
   =================================================================================== */

/** A superficie visivel da barra, sem a safe area (que entra por cima, do sistema). */
const ALTURA_BARRA = 64;

/** Quanto o circulo do centro sobe acima da linha da barra. */
const SALIENTE = 24;

/** Diametro do FAB. Acima dos 44 de alvo minimo com folga, porque ele e O botao. */
const DIAMETRO_FAB = 62;

/** O anel em `noche` que recorta o FAB da superficie — e o que faz ele parecer solto. */
const ANILLO_FAB = 4;

/** Icone das zonas laterais e icone do centro. O do centro e maior de proposito. */
const ICONO_ZONA = 26;
const ICONO_FAB = 30;

/* ===================================================================================
   OS TRES ICONES
   Todos no mesmo viewBox 32x32, todos recebendo `color` de fora: nenhum icone
   decide a propria cor, senao o estado ativo/inativo teria de ser reimplementado
   tres vezes.

   Nos dois icones que desenham FIO, o traco entra em x=0 e sai em x=32 — ou seja,
   as duas pontas caem fora do quadro e sao recortadas. E a mesma regra de marca de
   components/HiloFondo.js: ponta visivel sugere fim, e este produto nao promete
   desfecho. O fio so ATRAVESSA o icone.
   =================================================================================== */

/** O Mapa do ano: o fio atravessando tres casas do tabuleiro.
 *  Mesma regra dos outros icones de fio: o traco entra em x=0 e sai em x=32 —
 *  as pontas caem fora do quadro, porque ponta visivel sugere fim. */
function IconoMapa({ color, tamano }) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 32 32" fill="none">
      <Path
        d="M0 16 C 8 16 10 16 16 16 C 22 16 24 16 32 16"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* As tres casas sobre o fio, em proporcao de carta (mais altas que
          largas), so contorno: fill em icone de 26px vira borrao. A do meio e
          um traco mais gordo — a casa de hoje, a peca. */}
      <Rect x={2.5} y={10} width={8} height={12} rx={2} stroke={color} strokeWidth={1.8} />
      <Rect x={12.5} y={9} width={9} height={14} rx={2} stroke={color} strokeWidth={2.6} />
      <Rect x={23} y={10} width={8} height={12} rx={2} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

/* IconoHilo saiu junto com a zona do Fio (01/09) — codigo morto engana o
   proximo redesenho. O icone vive no git se o Fio voltar a barra. */


/** Perfil: cabeca e ombros. O desenho mais neutro possivel — nao ha avatar, nao ha
 *  nivel e nao ha ranking neste app, entao o icone tambem nao promete nenhum. */
function IconoPerfil({ color, tamano }) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 32 32" fill="none">
      <Circle cx={16} cy={12} r={5} stroke={color} strokeWidth={2} />
      <Path
        d="M6 27 C 6 19.5 26 19.5 26 27"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** O NO — o icone do centro, e a marca. Duas mechas que se cruzam em (16,16).
 *  Cada mecha e um par de cubicos C1-continuo na emenda: o vetor que chega ao
 *  cruzamento e igual ao que sai dele, entao o cruzamento e liso e nao um bico. */
function IconoNudo({ color, tamano }) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 32 32" fill="none">
      <Path
        d="M0 22 C 9 22 9 10 16 16 C 23 22 23 10 32 10"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Path
        d="M0 10 C 9 10 9 22 16 16 C 23 10 23 22 32 22"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ===================================================================================
   UMA ZONA LATERAL
   =================================================================================== */
function Zona({ Icono, rotulo, activa, alTocar, alTocarLargo }) {
  // O unico lugar do arquivo onde ativo e inativo se separam. papel (16,2:1) para a
  // zona onde a pessoa esta; ceniza (5,2:1, AA) para a outra. Nunca hilo: sobre
  // fundo escuro ele reprova AA como texto, e a barra tem texto.
  const color = activa ? colores.papel : colores.ceniza;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activa }}
      accessibilityLabel={rotulo}
      onPress={alTocar}
      onLongPress={alTocarLargo}
      hitSlop={espacio.sm}
      style={({ pressed }) => [estilos.zona, pressed && estilos.zonaPresionada]}
    >
      <Icono color={color} tamano={ICONO_ZONA} />
      <Sobreceja numberOfLines={1} style={[estilos.rotulo, { color }]}>
        {rotulo}
      </Sobreceja>
    </Pressable>
  );
}

/* ===================================================================================
   A BARRA
   Recebe as props que o @react-navigation/bottom-tabs entrega a `tabBar`:
   { state, descriptors, navigation, insets }. `descriptors` nao e usado de
   proposito — as tres zonas sao fixas por CONTRATO (routes.js), nao por opcao de
   tela: nenhuma tela pode inventar um quarto icone aqui mudando screenOptions.
   =================================================================================== */
export default function BarraInferior({ state, navigation, insets }) {
  // A safe area de baixo (barra de gestos do iPhone, gesture pill do Android). Vem
  // por prop do proprio navegador de abas, que ja resolveu o contexto — pedir de
  // novo com useSafeAreaInsets() aqui seria uma segunda fonte para o mesmo numero.
  const abajo = Math.max(0, (insets && insets.bottom) || 0);

  const alturaSuperficie = ALTURA_BARRA + abajo;
  const alturaTotal = alturaSuperficie + SALIENTE;

  // Indice por NOME, nao por posicao: assim a esquerda continua sendo Mi Hilo mesmo
  // que amanha alguem reordene as <Tab.Screen> em navegacion.js.
  const porNombre = {};
  state.routes.forEach((route, indice) => {
    porNombre[route.name] = { route, indice };
  });

  /**
   * O caminho oficial de troca de aba do React Navigation 6: emitir 'tabPress'
   * (que a tela pode cancelar, e o que permite "tocar de novo para voltar ao topo")
   * e so entao navegar. Chamar navigate() direto pularia esse evento.
   */
  const abrir = (entrada) => {
    if (!entrada) return;
    const enfocada = state.index === entrada.indice;
    const evento = navigation.emit({
      type: 'tabPress',
      target: entrada.route.key,
      canPreventDefault: true,
    });
    if (!enfocada && !evento.defaultPrevented) {
      navigation.navigate(entrada.route.name, entrada.route.params);
    }
  };

  const alLargo = (entrada) => {
    if (!entrada) return;
    navigation.emit({ type: 'tabLongPress', target: entrada.route.key });
  };

  /* A ZONA ESQUERDA E O MAPA — decisao do dono, 01/09: "o lead tem que ver
   * inteiro o mapa dos 365 dias, igual um jogo de tabuleiro". O Fio nao sumiu:
   * continua montado como aba sem zona (igual a Tirada foi) e ganhou porta nos
   * acessos do Perfil. */
  const mapa = porNombre[RUTAS.MAPA_ANO];
  const perfil = porNombre[RUTAS.PERFIL];

  /* O CENTRO E O PLANO DO DIA, e nao mais a tirada direta.
   *
   * A troca nao e cosmetica: a tirada continua sendo uma <Tab.Screen>, mas deixou
   * de ser um destino da barra. Ela virou UM dos cinco gestos que giram (o dia de
   * 'cartas' em datos/rituais.js) e quem a abre e o botao dentro do plano, no dia
   * dela. Um app que oferece a mesma leitura todo dia no mesmo botao vira
   * notificacao ignorada na terceira semana; o plano tem cinco caras.
   *
   * Se a rota do plano nao estiver montada, o FAB nao desenha — mesmo
   * comportamento que a barra ja tinha, e melhor do que um circulo que nao leva a
   * lugar nenhum. */
  const plano = porNombre[RUTAS.PLANO];
  const planoActivo = !!plano && state.index === plano.indice;

  return (
    // box-none: a faixa transparente de cima nao intercepta o toque — ela existe so
    // para dar espaco ao circulo. Sem isto, os 24px acima da barra virariam uma
    // parede invisivel sobre o rodape da tela.
    <View pointerEvents="box-none" style={[estilos.contenedor, { height: alturaTotal }]}>
      {/* A superficie: o que a pessoa le como "a barra". */}
      <View style={[estilos.superficie, { height: alturaSuperficie }]} />

      {/* As duas zonas laterais, com o vao do circulo entre elas. */}
      <View
        style={[estilos.zonas, { height: alturaSuperficie, paddingBottom: abajo }]}
        pointerEvents="box-none"
      >
        {mapa ? (
          <Zona
            Icono={IconoMapa}
            rotulo={t('barra.mapa')}
            activa={state.index === mapa.indice}
            alTocar={() => abrir(mapa)}
            alTocarLargo={() => alLargo(mapa)}
          />
        ) : (
          <View style={estilos.zona} />
        )}

        <View style={estilos.hueco} pointerEvents="none" />

        {perfil ? (
          <Zona
            Icono={IconoPerfil}
            rotulo={t('barra.perfil')}
            activa={state.index === perfil.indice}
            alTocar={() => abrir(perfil)}
            alTocarLargo={() => alLargo(perfil)}
          />
        ) : (
          <View style={estilos.zona} />
        )}
      </View>

      {/* O FAB. Ultimo na arvore de proposito: assim ele pinta por cima da
          superficie e do anel sem depender de zIndex, que se comporta diferente
          entre iOS, Android e web. */}
      {plano ? (
        <View pointerEvents="box-none" style={estilos.cajaFab}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: planoActivo }}
            accessibilityLabel={t('barra.plano')}
            accessibilityHint={t('barra.plano.pista')}
            onPress={() => abrir(plano)}
            onLongPress={() => alLargo(plano)}
            style={({ pressed }) => [estilos.fab, pressed && estilos.fabPresionado]}
          >
            <IconoNudo color={colores.papel} tamano={ICONO_FAB} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  // Sem cor: a faixa de cima tem de deixar ver o fundo do app atras do circulo.
  contenedor: {
    width: '100%',
  },

  superficie: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colores.penumbra,
    borderTopWidth: 1,
    borderTopColor: colores.bordeSuave,
  },

  zonas: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  zona: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.xs,
    // Na web o Pressable nasce com o cursor de texto; sem isto a barra nao parece
    // clicavel no navegador, que e justamente onde o app estava parecendo pagina.
    ...Platform.select({ web: { cursor: 'pointer' }, default: null }),
  },

  // O feedback e opacidade e nao cor: trocar o fundo de uma aba inteira piscaria
  // um retangulo de cor no rodape a cada toque.
  zonaPresionada: {
    opacity: 0.6,
  },

  rotulo: {
    marginTop: espacio.xs,
  },

  // O vao onde o circulo pousa. Largura = diametro + respiro dos dois lados, para
  // que o rotulo da zona lateral nunca encoste no FAB.
  hueco: {
    width: DIAMETRO_FAB + espacio.lg,
  },

  cajaFab: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  fab: {
    width: DIAMETRO_FAB,
    height: DIAMETRO_FAB,
    borderRadius: DIAMETRO_FAB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.hilo,
    // O anel em `noche` e o recorte: ele separa o circulo da superficie da barra e
    // e o que faz o olho ler "este botao esta POR CIMA", e nao "coladinho".
    borderWidth: ANILLO_FAB,
    borderColor: colores.noche,
    ...sombra.halo,
    ...Platform.select({ web: { cursor: 'pointer' }, default: null }),
  },

  // nudo = hilo escurecido. Mesma linguagem de estado pressed do BotonPrimario.
  fabPresionado: {
    backgroundColor: colores.nudo,
  },
});

export { ALTURA_BARRA, DIAMETRO_FAB, SALIENTE };
