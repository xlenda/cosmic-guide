// components/CajaLimites.js
// A caixa "Lo que esta lectura NO puede decirte".
//
// ===========================================================================
// POR QUE ISTO E UM COMPONENTE E NAO UM TRECHO SOLTO DE TELA
// ===========================================================================
// Por dois motivos, e o segundo e o que paga a conta:
//
// 1. E OBRIGATORIA NA SINTESE. A caixa aparece ANTES do resultado, nunca
//    depois (ver o bloco `limites.*` de datos/textos.js). Dizer na cara as
//    tres coisas que a usuaria mais quer e que uma carta nao entrega e o que
//    da valor ao que vem em seguida — e o que mantem o app do lado honesto
//    da regra 1 do contrato de produto ("nunca prometer desfecho").
//
// 2. PRECISA APARECER EM SCREENSHOT DA FICHA DA LOJA. App de tarot cai na
//    revisao de categoria adivinhacao; o que faz passar na primeira
//    submissao — em vez de voltar com pedido de esclarecimento — e a loja
//    ver, na propria arte da ficha, que o app declara o que NAO faz. Uma
//    caixa fechada e autossuficiente pode ser montada sozinha para essa arte
//    sem arrastar junto a tela inteira da sintese.
//
// ===========================================================================
// O CONTEUDO NUNCA VEM POR PROP
// ===========================================================================
// A unica prop e `style`, e ela so posiciona a caixa (margem, largura). O
// texto sai SEMPRE de datos/textos.js. Nao existe prop de titulo, de linhas,
// de "compacto" nem de "ocultar": se a copy pudesse ser injetada de fora, uma
// tela poderia esvaziar a caixa sem querer, e a promessa de honestidade
// viraria opcional. Aqui ela e estrutural — quem renderiza o componente
// renderiza a declaracao inteira.
//
// Contrato de copy respeitado nesta caixa (mesmo de theme.js/textos.js):
//  · regra 1 — a caixa e o oposto exato de uma promessa;
//  · regra 4 — as linhas dizem "esa persona" / "quien esta del otro lado",
//    nunca um genero;
//  · regra 8 — nenhum hex e nenhum alfa escrito aqui; tudo sai de theme.js;
//  · regra 9 — colores.hilo aparece so como TRACO (a borda e os tres riscos),
//    nunca como cor de texto.
//
// Todo texto passa pelos wrappers de components/Texto.js, que e a camada
// tipografica do app: aqui nao se escreve fontSize, lineHeight, fontFamily nem
// cor de texto na mao. Esta caixa e conteudo puro — sem animacao, sem estado,
// sem medicao — entao nao tem nenhuma das razoes tecnicas que levam
// BotonPrimario e ContadorAnio a falar com <Text> direto.
// ===========================================================================

import { StyleSheet, View } from 'react-native';

import { t } from '../datos/textos';
import { colores, espacio, radio, tipo } from '../theme';
import { Cuerpo, Micro } from './Texto';

// Espessura da borda e do risco de cada linha: 1px, o traco mais fino que o
// app desenha. Fica em constante porque o alinhamento do risco e calculado a
// partir dela logo abaixo.
const GROSOR = 1;

// As tres linhas sao lidas UMA VEZ, na carga do modulo: t() nao recebe
// variavel nenhuma aqui, entao o resultado e sempre o mesmo e nao ha motivo
// para reconstruir o array a cada render. O guard existe porque t() de chave
// morta devolve a propria chave (uma string) em vez de lancar — e uma string
// nao tem .map(). Preferimos a caixa com uma linha errada, visivel em QA, a
// uma tela branca na sintese.
const LINEAS = (() => {
  const valor = t('limites.lineas');
  return Array.isArray(valor) ? valor : [String(valor)];
})();

/**
 * A caixa das limitacoes. Conteudo fixo, vindo de datos/textos.js.
 *
 * @param {object} [props]
 * @param {import('react-native').StyleProp<import('react-native').ViewStyle>} [props.style]
 *        So posicionamento (margem, largura, alinhamento). Cor de fundo, borda
 *        e raio sao da caixa e nao devem ser sobrescritos.
 */
export default function CajaLimites({ style }) {
  return (
    <View style={[estilos.caja, style]} testID="caja-limites">
      {/* A borda vive em uma View propria, e nao em borderWidth da caixa, por
          causa da regra 8: o desenho pede hilo a 30% de alfa e theme.js so
          expoe hilo cheio e bordeHilo (45%). Em vez de escrever um alfa na
          mao — que e exatamente o que os derivados de theme.js existem para
          impedir —, o alfa vem de `opacity` sobre uma camada que so tem borda.
          Sem filhos e sem toque: nao entra na leitura de tela nem no gesto. */}
      <View
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no"
        style={estilos.borde}
      />

      {/* <Cuerpo> e nao <Rotulo>: o titulo carrega o "NO" em caixa alta vindo
          da propria copy, e <Rotulo> aplica textTransform:'uppercase', que
          apagaria essa enfase junto com o resto da frase. A hierarquia vem do
          contraste com as linhas abaixo — 16px em papel contra 13px em ceniza —
          e nao de peso de fonte, que exigiria escrever fontFamily na mao. */}
      <Cuerpo accessibilityRole="header" style={estilos.titulo}>
        {t('limites.titulo')}
      </Cuerpo>

      {LINEAS.map((linea) => (
        <View key={linea} style={estilos.linea}>
          {/* O risco vermelho e um fio cortado, nao um bullet de texto:
              colores.hilo como glifo seria texto vermelho sobre fundo escuro
              (3,2:1, reprova AA). Como traco, e permitido e vira a assinatura
              visual da marca dentro da caixa. */}
          <View style={estilos.risco} />
          <Micro style={estilos.textoLinea}>{linea}</Micro>
        </View>
      ))}

      {/* O pe fecha o argumento: o limite nao e defeito do app, e a natureza
          de uma leitura simbolica. E a frase que a revisao da loja le junto
          com as tres linhas — por isso mora DENTRO da caixa, e a tela da
          sintese nao deve repeti-la. */}
      <Micro style={estilos.pie}>{t('limites.pie')}</Micro>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: {
    backgroundColor: colores.penumbra,
    borderRadius: radio.md,
    padding: espacio.lg,
  },

  borde: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: GROSOR,
    borderColor: colores.hilo,
    borderRadius: radio.md,
    opacity: 0.3,
  },

  // So espacamento: tamanho, entrelinha, familia e cor sao de <Cuerpo>.
  titulo: {
    marginBottom: espacio.md,
  },

  linea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: espacio.sm,
  },

  // O risco alinha com a PRIMEIRA linha do texto ao lado: metade da entrelinha
  // de tipo.micro (a mesma que <Micro> usa), menos metade da propria espessura.
  // Ler o token aqui e o contrario de escrever um numero de fonte na mao — se a
  // escala tipografica mudar amanha, o risco continua alinhado sozinho.
  risco: {
    width: espacio.md,
    height: GROSOR,
    marginRight: espacio.md,
    marginTop: (tipo.micro.entrelinea - GROSOR) / 2,
    backgroundColor: colores.hilo,
  },

  // flex:1 e o que faz a linha quebrar dentro da caixa em vez de estourar para
  // fora dela em telefone estreito.
  textoLinea: {
    flex: 1,
  },

  pie: {
    marginTop: espacio.lg,
    paddingTop: espacio.lg,
    borderTopWidth: GROSOR,
    borderTopColor: colores.bordeSuave,
  },
});
