// Fio Vermelho — components/Texto.js
// A camada tipografica. Depois deste arquivo, NENHUMA tela escreve fontSize,
// lineHeight, fontFamily ou color de texto na mao: escreve <Cuerpo>, <Titulo>,
// <Micro>. Se um numero de fonte aparecer numa tela, e bug — o lugar dele e
// theme.js (tokens) ou aqui (fiacao).
//
// Duas responsabilidades, so isso:
//   1. Sete wrappers de <Text>, um por estilo de theme.tipo.
//   2. useFuentesListas() — carrega as 9 faces e diz quando pode desenhar.
//
// -------------------------------------------------------------------------------------
// REGRA TRAVADA (theme.js repete, e por isso ela e obrigacao deste arquivo):
// todo italico do app e Cormorant Garamond Italic, que e uma FAMILIA propria.
// Inter NUNCA em italico. E proibido pedir italico com fontStyle:'italic' por cima
// de qualquer familia: no Android nao existe italico sintetico para fonte custom —
// o texto sai reto e ninguem percebe. O italico vem da face, sempre:
//   <NombreCarta>  → CormorantGaramond_600SemiBold_Italic
//   <Fuente>       → CormorantGaramond_500Medium_Italic
// Em __DEV__ este arquivo avisa no console se alguem tentar fontStyle:'italic'.
// -------------------------------------------------------------------------------------

import { StyleSheet, Text } from 'react-native';
import { useFonts } from 'expo-font';

// CADA FACE PELO CAMINHO DIRETO, NUNCA PELO BARREL (11/09/2026).
// O index.js de @expo-google-fonts/* faz require() EAGER das faces todas no
// escopo de modulo — 18 em Inter, 10 em Cormorant. require eager nao e
// tree-shakeable: importar do barrel arrastava as 28 faces (11.315 KB de .ttf)
// pro dist quando estas 9 (4.089 KB) sao as unicas que `familias` nomeia.
// O subdiretorio e o PESO da face sem o prefixo da familia ('400Regular',
// nao 'Inter_400Regular') — conferido em node_modules, nao chutado.
import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_500Medium_Italic } from '@expo-google-fonts/cormorant-garamond/500Medium_Italic';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { CormorantGaramond_600SemiBold_Italic } from '@expo-google-fonts/cormorant-garamond/600SemiBold_Italic';
import { CormorantGaramond_700Bold } from '@expo-google-fonts/cormorant-garamond/700Bold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';

import { familias, tipo } from '../theme';

/* ===================================================================================
   FUENTES — o mapa que o useFonts recebe.
   As CHAVES sao computadas a partir de `familias`, nao digitadas: em React Native o
   fontFamily e resolvido por string e errar o nome nao lanca erro nenhum, so cai
   calado na fonte do sistema. Escrevendo [familias.displaySemiItalica] em vez de
   'CormorantGaramond_600SemiBold_Italic' a fiacao nao pode divergir do tema — se o
   token mudar de nome amanha, a chave muda junto.
   Sao 9 faces, exatamente as 9 de `familias`: 5 Cormorant (500, 500 italica, 600,
   600 italica, 700) e 4 Inter (400, 500, 600, 700), nenhuma Inter italica.
   =================================================================================== */
export const FUENTES = {
  [familias.displayMedia]: CormorantGaramond_500Medium,
  [familias.displayMediaItalica]: CormorantGaramond_500Medium_Italic,
  [familias.displaySemi]: CormorantGaramond_600SemiBold,
  [familias.displaySemiItalica]: CormorantGaramond_600SemiBold_Italic,
  [familias.displayNegrita]: CormorantGaramond_700Bold,
  [familias.cuerpoRegular]: Inter_400Regular,
  [familias.cuerpoMedia]: Inter_500Medium,
  [familias.cuerpoSemi]: Inter_600SemiBold,
  [familias.cuerpoNegrita]: Inter_700Bold,
};

/**
 * Carrega as 9 faces e devolve se ja da para desenhar texto.
 *
 * O false so aparece no primeiro frame frio; depois disso o Expo tem as faces em
 * cache. Quem chama (App.js) segura a arvore enquanto for false — desenhar antes
 * faz o texto nascer na fonte do sistema e pular de tamanho quando a real chega.
 *
 * Se o carregamento FALHAR, devolve true assim mesmo. E deliberado: uma face que
 * nao baixou vira fonte do sistema, o app fica feio por um instante e continua
 * usavel. O contrario — segurar para sempre — e uma tela preta permanente, que e
 * pior que fonte errada. O erro vai para o console em __DEV__.
 *
 * @returns {boolean}
 */
export function useFuentesListas() {
  const [cargadas, error] = useFonts(FUENTES);

  if (__DEV__ && error) {
    console.warn('[Texto] Uma face nao carregou; o texto cai para a fonte do sistema.', error);
  }

  return Boolean(cargadas) || Boolean(error);
}

/* ===================================================================================
   TABULAR — digitos de largura fixa. Liga com a prop `tabular`.
   Serve para numero que MUDA no lugar sem empurrar o que esta ao lado: o contador de
   anos do fato historico animando de 0 ate 1909, o preco do plano, a contagem do hilo.
   Sem isso o "1" e mais estreito que o "8" e a linha inteira treme a cada frame.
   =================================================================================== */
const TABULAR = { fontVariant: ['tabular-nums'] };

/* Aviso de italico sintetico — so em __DEV__, so uma vez por componente, para nao
   virar spam num FlatList. Nao muda nada em producao. */
const yaAvisado = new Set();
const avisarSiItalicoSintetico = (nombre, estilos) => {
  if (!__DEV__ || yaAvisado.has(nombre)) return;
  const plano = StyleSheet.flatten(estilos);
  if (plano && plano.fontStyle === 'italic') {
    yaAvisado.add(nombre);
    console.warn(
      `[Texto] <${nombre}> recebeu fontStyle:'italic'. No Android nao existe italico ` +
        'sintetico para fonte custom: o texto sai reto. Use <NombreCarta> ou ' +
        '<Fuente>, que ja sao familias italicas de Cormorant.'
    );
  }
};

/**
 * Fabrica de wrapper. Todos os sete sao a mesma funcao com outro estilo base.
 *
 * Contrato de cada um:
 *   · espalha o estilo de theme.tipo correspondente;
 *   · aceita `style` (objeto, array ou falsy) e aplica POR CIMA — a tela pode ajustar
 *     margem, alinhamento e cor sem tocar em tamanho de fonte;
 *   · aceita `tabular` para digitos de largura fixa;
 *   · repassa qualquer outra prop de <Text> intacta (numberOfLines, onPress,
 *     accessibilityRole, accessibilityLabel, testID, ref — no React 19 ref e prop
 *     comum, entao <Cuerpo ref={...}> funciona sem forwardRef).
 *
 * `allowFontScaling` fica no padrao (ligado): o app respeita o tamanho de fonte do
 * sistema. Quem precisar de teto usa maxFontSizeMultiplier na chamada.
 */
const crear = (nombre, estiloBase) => {
  const Componente = ({ style, tabular, ...resto }) => {
    const estilos = tabular ? [estiloBase, TABULAR, style] : [estiloBase, style];
    if (__DEV__) avisarSiItalicoSintetico(nombre, estilos);
    return <Text {...resto} style={estilos} />;
  };
  Componente.displayName = nombre;
  return Componente;
};

/* ===================================================================================
   OS SETE. Um por estilo de theme.tipo — nem um a mais.
   =================================================================================== */

/** Titulo de tela. Cormorant 700, 34/40. Um por tela, no maximo. */
export const Titulo = crear('Titulo', tipo.titulo);

/** Nome da carta virada. Cormorant 600 ITALICA, 26/32 — o unico italico grande. */
export const NombreCarta = crear('NombreCarta', tipo.nombreCarta);

/** Rotulo de botao e cabecalho de secao. Inter 600, caixa alta, tracking 1,2. */
export const Rotulo = crear('Rotulo', tipo.rotulo);

/** A linha miuda ACIMA do titulo: posicao da carta, dia do hilo. Inter 500, caixa alta. */
export const Sobreceja = crear('Sobreceja', tipo.sobreceja);

/** Corpo da leitura. Inter 400, 16/25. O texto longo do app inteiro sai daqui. */
export const Cuerpo = crear('Cuerpo', tipo.cuerpo);

/** Apoio, ajuda, rodape de card. Inter 400, 13/19, cinza. */
export const Micro = crear('Micro', tipo.micro);

/**
 * Citacao da fonte historica: obra, autor/impressor, cidade, ano.
 * Cormorant 500 ITALICA. E o lugar do fato verificavel que substitui a prova social
 * inventada (regra 2 do produto) — nunca usar para outra coisa.
 */
export const Fuente = crear('Fuente', tipo.fuente);

export default {
  Titulo,
  NombreCarta,
  Rotulo,
  Sobreceja,
  Cuerpo,
  Micro,
  Fuente,
  useFuentesListas,
  FUENTES,
};
