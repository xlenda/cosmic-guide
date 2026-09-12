// CABEÇALHO DE IDENTIDADE — Sol, Lua e Ascendente da pessoa no topo da Home,
// com os quatro elementos desenhados em anel (referência do dono, 11/09/2026:
// o cabeçalho do concorrente que "diz quem você é" antes de qualquer card).
//
// Este componente NÃO calcula nada: recebe `identidade` já pronta de
// lib/identidadeCeleste.js (carregarIdentidade) e só desenha. Regra "NUNCA
// FABRICAR": sem data de nascimento salva `identidade` chega null, e aqui isso
// vira um convite pra preencher — nunca um signo chutado. Ascendente sem hora
// ou cidade chega null e aparece como '—' apagado, pelo mesmo motivo.
//
// Nome do signo: o motor devolve o nome canônico em PT ('Touro'); a tradução é
// a MESMA função da saudação da Home (nomeDoSigno de lib/synastry), pra os dois
// textos nunca discordarem no mesmo idioma.
//
// OS ANÉIS GANHARAM A ARTE QUE JÁ EXISTIA (12/09/2026, pedido do dono olhando a
// foto 20.55.48 do concorrente: "Seus elementos" como ILUSTRAÇÃO grande, com o
// nome e uma seta convidando a entrar).
//
// COMPLEMENTAR, NÃO SUBSTITUIR — a regra desta obra. Nada foi tirado:
//   · o anel FICA, com o mesmo pct, a mesma cor e a mesma conta (é a única
//     vantagem medível que a Home tinha sobre o concorrente, que naquele mesmo
//     lugar mostra "Amor 82%" — número que não sai de conta nenhuma);
//   · a % FICA, mudou de lugar: do miolo pro chip do canto superior direito,
//     que é exatamente o desenho do concorrente e a receita que a tela do Mapa
//     já tinha escrita (`elementoChip` em BirthChartScreen.js);
//   · o que ENTRA é a arte de assets/ilustracoes/elemento-*.jpg, que existia no
//     repo desde 31/08/2026, estava exportada em ELEMENTOS_ARTE e NÃO APARECIA
//     EM PIXEL NENHUM do app — `elementoImagem()` não tinha um só call site.
//     Ela ocupa o miolo, que eram 52px de escuro vazio dentro do arco.
//   · a seta ENTRA porque os quatro anéis não eram tocáveis: dado real que não
//     levava a lugar nenhum. Agora vão pro Mapa, onde a leitura mora.
//
// PESO ZERO: as quatro imagens (52,5 KB) já viajavam no bundle que a pessoa
// baixa — estavam sendo pagas sem serem vistas. Nenhum arquivo novo foi gerado.
//
// SEM DATA DE NASCIMENTO NADA DISSO APARECE: o bloco inteiro está atrás de
// `identidade.elementos`, e `identidade` chega null (convite). Elemento chutado
// e porcentagem inventada continuam impossíveis aqui.
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { nomeDoSigno } from '../lib/synastry';
import { elementoImagem } from '../lib/ilustracoes';
import AnelProgresso from './AnelProgresso';

// Chaves LITERAIS (não template) pra varredura estática de
// test/i18nKeysExist.test.js enxergar cada uma.
const CHIPS = [
  { campo: 'sun', icone: 'sunny-outline', rotulo: 'home.identidade.sol' },
  { campo: 'moon', icone: 'moon-outline', rotulo: 'home.identidade.lua' },
  { campo: 'asc', icone: 'trending-up-outline', rotulo: 'home.identidade.asc' },
];

// Mesma ordem e mesmas cores de ELEMENTOS_META em BirthChartScreen.js — o anel
// da Home e o do Mapa precisam ser reconhecidos como a mesma coisa.
const ELEMENTOS = [
  { key: 'fogo', labelKey: 'birthchart.elements.fire', cor: '#FF8C5C' },
  { key: 'terra', labelKey: 'birthchart.elements.earth', cor: colors.green },
  { key: 'ar', labelKey: 'birthchart.elements.air', cor: colors.teal },
  { key: 'agua', labelKey: 'birthchart.elements.water', cor: colors.blue },
];

export default function CabecalhoIdentidade({ identidade, onMapa }) {
  const { t, lang } = useLanguage();

  // TRÊS ESTADOS, não dois (11/09/2026, apontado pelos dois revisores):
  // `undefined` = ainda carregando → não desenha NADA. Antes o convite
  // "Adicionar data de nascimento" piscava por ~25ms na abertura pra quem JÁ
  // tinha data salva, até readSecureItem + astronomy-engine resolverem.
  // `null` = carregou e não há data → convite. Objeto = a ficha.
  if (identidade === undefined) return null;
  if (!identidade) {
    return (
      <View style={styles.raiz}>
        <TouchableOpacity
          onPress={onMapa}
          style={styles.pill}
          accessibilityRole="button"
          testID="home-identidade-convite"
        >
          <Ionicons name="planet-outline" size={16} color={colors.gold} accessible={false} />
          <Text style={styles.pillTexto}>{t('home.identidade.adicionar')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.raiz} testID="home-identidade">
      <View style={styles.chips}>
        {CHIPS.map((c) => {
          const nome = identidade[c.campo];
          return (
            <View key={c.campo} style={styles.chip}>
              <Ionicons name={c.icone} size={14} color={colors.textMuted} accessible={false} />
              <Text style={styles.chipRotulo}>{t(c.rotulo)}</Text>
              <Text style={[styles.chipValor, !nome && styles.chipMudo]}>
                {nome ? nomeDoSigno(nome, lang) : '—'}
              </Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={onMapa}
        style={styles.pill}
        accessibilityRole="button"
        testID="home-identidade-mapa"
      >
        <Ionicons name="planet-outline" size={16} color={colors.gold} accessible={false} />
        <Text style={styles.pillTexto}>{t('home.identidade.mapa')}</Text>
      </TouchableOpacity>

      {identidade.elementos && (
        <View style={styles.aneis}>
          {ELEMENTOS.map((e) => {
            const pct = identidade.elementos.pct[e.key];
            const arte = elementoImagem(e.key);
            const nome = t(e.labelKey);
            return (
              <TouchableOpacity
                key={e.key}
                style={styles.anelCol}
                onPress={onMapa}
                accessibilityRole="button"
                accessibilityLabel={`${nome} ${pct}%`}
                testID={`home-elemento-${e.key}`}
              >
                {/* O anel é redundante ao número, e o número agora mora no chip;
                    o rótulo de acessibilidade acima já diz os dois. */}
                <View accessible={false}>
                  <AnelProgresso pct={pct} size={62} espessura={5} cor={e.cor}>
                    {arte ? (
                      /* A MOLDURA É CORTADA PELA JANELA, NÃO PELO ARQUIVO
                         (12/09/2026). A janela redonda recorta (overflow), e a
                         arte é desenhada MAIOR que ela — o excesso, que é onde
                         mora a moldura quadrada, cai fora. Nenhum arquivo de
                         assets/ é tocado: a lei é complementar, e o mesmo JPG
                         continua servindo qualquer outra tela inteiro. */
                      <View style={[styles.anelJanela, { borderColor: e.cor + '66' }]}>
                        <Image source={arte} style={styles.anelArte} resizeMode="cover" />
                      </View>
                    ) : (
                      <Text style={[styles.anelPct, { color: e.cor }]}>{pct}%</Text>
                    )}
                  </AnelProgresso>
                  {/* O chip só existe quando a arte tomou o miolo: sem arte o
                      número continua no centro e um chip seria a % duas vezes. */}
                  {arte && (
                    <View style={[styles.anelChip, { borderColor: e.cor }]}>
                      <Text style={[styles.anelChipTexto, { color: e.cor }]}>{pct}%</Text>
                    </View>
                  )}
                </View>
                <View style={styles.anelRodape}>
                  <Text style={styles.anelRotulo}>{nome}</Text>
                  <Ionicons name="chevron-forward" size={11} color={colors.textMuted} accessible={false} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { marginHorizontal: 20, marginTop: 6, marginBottom: 4, alignItems: 'center' },
  chips: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipRotulo: { color: colors.textMuted, fontSize: 11 },
  chipValor: { color: colors.text, fontSize: 13, fontWeight: '700' },
  chipMudo: { color: colors.textMuted },
  // Dourado é a única cor de ação do app (ver FeatureCard.js); o '99' no fim
  // é o alpha da borda, pra não competir com o texto.
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.gold + '99', borderRadius: 22,
    paddingVertical: 10, paddingHorizontal: 18, marginTop: 12,
  },
  pillTexto: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  aneis: { flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch', marginTop: 14 },
  anelCol: { alignItems: 'center' },
  // A ARTE DO ELEMENTO PREENCHE O MIOLO (12/09/2026). O anel tem 62px com 5px
  // de borda: 52px de miolo livre. 46px deixa 3px de folga em volta pra arte
  // não encostar no arco — encostada, o JPG e a borda viram uma mancha só.
  // O recorte redondo é o mesmo cinto-e-suspensório do Mapa (BirthChartScreen
  // `elementoArte`): borderRadius no filho, porque RN Web antigo não recorta
  // filho pelo raio do pai. MEDIDO no print: o recorte funciona nos quatro (o
  // pixel a 45° do canto é o fundo da página nos quatro — design/lote-elementos).
  //
  // A BORDA FINA NÃO É DECORAÇÃO. Duas das quatro artes têm fundo CLARO
  // (medido nos bytes: elemento-agua tem os quatro cantos em 178,131,247 e
  // elemento-ar em 57,48,115, contra 13–20 de fogo e terra). Sem um contorno,
  // o disco claro encosta direto no arco e os dois viram uma mancha só. O anel
  // de 1px na cor do elemento fecha o disco como medalhão — que é o desenho do
  // concorrente — e vale igual pras quatro, clara ou escura.
  // alignItems/justifyContent CENTRAM a arte maior dentro da janela. Sem isso
  // o filho de 56 começa no canto superior esquerdo e o corte sai todo do lado
  // direito e de baixo — a moldura sobrevivia à esquerda numa meia-lua lilás
  // (visto no print antes desta linha existir). Centrado, os 10px de excesso
  // viram 5px de cada lado, que é o que a medição pedia.
  anelJanela: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 1,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  // 56 numa janela de 46 = 22% de zoom, que descarta ~11% de cada lado.
  // O NÚMERO SAIU DE MEDIÇÃO, não de gosto: varrendo os bytes de cada JPG, a
  // moldura de fundo mede 9,8% da largura em elemento-agua (cantos 178,131,247
  // — a única arte do pack com fundo CLARO) e 6,2% em elemento-ar. 11% cobre as
  // duas com folga e mal encosta em fogo/terra, cujo fundo já é noite e cujo
  // desenho é centrado. Se uma arte nova vier com moldura mais grossa, este é o
  // número a refazer — medindo de novo, não chutando.
  anelArte: { width: 56, height: 56 },
  // Fallback: chave sem arte mantém a % no centro, como era antes. Arte nova
  // que não exista nunca deixa o anel vazio.
  anelPct: { fontSize: 12, fontWeight: '800' },
  // O CHIP DE %: pill sobreposta no canto superior direito do círculo — é o
  // desenho do concorrente (foto 20.55.48), e a receita é a que a tela do Mapa
  // já tinha escrito (`elementoChip`). Fundo do cenário + borda na cor do
  // elemento, pra ler como etiqueta pendurada e não como botão.
  // O NÚMERO NÃO SUMIU: mudou de lugar, e continua vindo da mesma conta.
  // MEDIDO E ENCOLHIDO (12/09/2026): no primeiro print o chip saía do mesmo
  // tamanho do do Mapa (fonte 12, padding 7) e, num anel de 62px em vez de 72,
  // ele cobria o arco e disputava a atenção com a arte — o contrário do que a
  // referência faz, onde a % é etiqueta pequena e a ilustração é o assunto.
  anelChip: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  anelChipTexto: { fontSize: 9, fontWeight: '800' },
  // Nome + seta na mesma linha: a seta é o convite de entrar que o concorrente
  // põe ao lado do nome ("Fogo >"). Sem ela os quatro anéis eram pixel morto —
  // dado bonito que não levava a lugar nenhum.
  anelRodape: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: space.grudado },
  anelRotulo: { color: colors.textMuted, fontSize: 11 },
});
