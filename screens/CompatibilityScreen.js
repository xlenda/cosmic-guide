import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients, zodiacSigns } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { compatibility } from '../lib/signs.js';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import OneTimeLock from '../components/OneTimeLock';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';

const FEATURE_KEY = 'compatibility';
const HIGH_COMPAT_OFFER_KEY = 'offer-shown-compat-high';

// A MANCHETE DE CADA CATEGORIA — o que substituiu a roda de porcentagem.
//
// O que havia aqui: um círculo com "{pct}%" e a palavra "Combinação", e um
// título que ramificava em >= 80 / >= 60 / resto. Como o piso da tabela antiga
// era 74, o terceiro ramo ("Requer dedicação e diálogo") era CÓDIGO MORTO —
// nunca executou uma vez sequer. O app tinha dois veredictos, os dois positivos.
//
// Agora a manchete é a categoria da própria fonte, e os quatro ramos são
// alcançáveis: harmônico (48 dos 144 pares), desarmônico (36), sem aspecto (48)
// e co-presença (12). Nenhuma das quatro frases decreta desfecho — a regra 2 do
// cabeçalho de lib/synastry.js vale aqui na tela também, e test/synastry.test.js
// varre estas strings junto com as do motor.
//
// E a manchete fala as DUAS línguas da regra 6 de lib/synastry.js (feedback do
// dono, 31/07/2026: "muito científico tudo, preciso mesclar para o povão"):
// primeiro o que significa em conversa de gente, depois o termo da fonte — o
// termo não some, muda de posição.
const MANCHETE = {
  harmonico: 'Vocês se entendem fácil — a fonte chama isto de aspecto harmônico',
  desarmonico: 'Tem atrito de verdade aqui — e a tradição não para na palavra dura',
  semAspecto: 'Esses dois signos nem se enxergam de saída — sem aspecto na fonte',
  copresenca: 'Dois iguais no mesmo lugar — mesmo signo, co-presença, não aspecto',
};

export default function CompatibilityScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed } = useCouple();
  const [signA, setSignA] = useState(zodiacSigns[0]);
  const [signB, setSignB] = useState(zodiacSigns[5]);
  const [picking, setPicking] = useState(null); // 'A' | 'B' | null
  const [result, setResult] = useState(null);
  const [locked, setLocked] = useState(false);
  // Motor de Oferta (pico emocional): compatibilidade alta é O momento de
  // empolgação — uma única oferta contextual, UMA vez na vida (AsyncStorage),
  // nunca insistindo. Tom honesto: sem contador falso, sem urgência inventada.
  const [highCompatOffer, setHighCompatOffer] = useState(false);

  useEffect(() => {
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess, accessConfirmed]);

  const compute = () => {
    // Guarda o uso-único-na-vida aqui dentro, não só no gate de render — sem
    // isso, reapertar "Calcular Compatibilidade" sem trocar de signo nunca
    // zera `result` (compatibility() é determinística),
    // então o gate baseado em `!result` nunca voltaria a bloquear (achado por
    // verificação adversarial: dava cálculos grátis infinitos no mesmo par).
    if (!hasAccess && locked) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const compat = compatibility(signA.name, signB.name);
    if (!compat) { setResult(null); return; }
    setResult(compat);
    // Oferta de pico emocional: reancorada no que o cálculo novo produz.
    // Era `pct >= 80`, que com a tabela antiga pegava 6 dos 10 baldes de
    // elemento; agora dispara nos aspectos que a FONTE chama de harmônicos
    // (trígono e sextil) — 48 dos 144 pares, um terço. Uma vez na vida, checa e
    // marca juntos pra nunca repetir.
    if (compat.categoriaId === 'harmonico' && !hasAccess) {
      AsyncStorage.getItem(HIGH_COMPAT_OFFER_KEY).then((shown) => {
        if (shown) return;
        AsyncStorage.setItem(HIGH_COMPAT_OFFER_KEY, 'true');
        setHighCompatOffer(true);
      });
    }
    // Vira entrada no Diário Cósmico — antes essa tela não deixava rastro
    // nenhum de uso real (achado real de auditoria de retenção, 25/07/2026).
    // O título guardava "{pct}% de combinação". Guarda o aspecto: é o que o
    // app calcula de fato, e não envelhece toda vez que a escala mudar.
    recordReadingCompletion({
      type: 'compatibility',
      typeLabel: 'Compatibilidade',
      title: `${signA.pt} + ${signB.pt} — ${compat.aspecto} (${compat.categoria})`,
      body: compat.texto,
    });
    markFeatureUsedOnce(FEATURE_KEY);
    // Sem isso, `locked` só seria relido do AsyncStorage no próximo mount da
    // tela — trocar de signo e calcular de novo na mesma sessão deixaria
    // repetir o uso grátis várias vezes antes do bloqueio realmente pegar
    // (achado por verificação adversarial).
    if (!hasAccess) setLocked(true);
  };

  const pick = (z) => {
    Haptics.selectionAsync();
    if (picking === 'A') setSignA(z);
    else setSignB(z);
    setPicking(null);
    setResult(null);
  };

  // `!result` importa aqui: marcamos `locked=true` no instante em que a
  // leitura grátis é consumida (compute), mas a pessoa ainda precisa VER o
  // resultado que acabou de ganhar — só bloqueamos de fato na próxima
  // tentativa (troca de signo, que chama setResult(null) em pick()).
  if (!hasAccess && locked && !result) {
    return <OneTimeLock featureTitle="Compatibilidade" gradient={['#B5286B', '#7B3FB5']} />;
  }

  return (
    <View style={styles.root}>
      {/* O subtítulo descreve o que a tela FAZ, sem prometer desfecho. O
          anterior ("Encontre seu par celestial") era resquício da roda de
          porcentagem: prometia na manchete o que o rodapé desmente — a regra 2
          de lib/synastry.js vale pro header também, e test/synastry.test.js
          varre esta string junto com as MANCHETE. */}
      <GradientHeader title="Compatibilidade" subtitle="Compare dois signos — e veja o que a tradição diz" onBack={() => navigation.goBack()} gradient={['#B5286B', '#7B3FB5']} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.pairRow}>
          <SignSlot sign={signA} onPress={() => setPicking(picking === 'A' ? null : 'A')} active={picking === 'A'} />
          <View style={styles.plusWrap}>
            <Ionicons name="heart" size={26} color={colors.pink} />
          </View>
          <SignSlot sign={signB} onPress={() => setPicking(picking === 'B' ? null : 'B')} active={picking === 'B'} />
        </View>

        {picking && (
          <View style={styles.pickerGrid}>
            {zodiacSigns.map((z) => (
              <TouchableOpacity key={z.name} style={[styles.pickerItem, { borderColor: z.color + '55' }]} onPress={() => pick(z)}>
                <Text style={[styles.pickerGlyph, { color: z.color }]}>{z.icon}</Text>
                <Text style={styles.pickerName}>{z.pt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!picking && !hasAccess && locked && result && (
          // compute() já recusa recalcular nesse caso — aqui é só pra não
          // deixar um botão "morto" que não faz nada visível ao tocar.
          <>
            <Text style={styles.lockedNote}>
              Essa foi sua leitura grátis — assine para calcular outras combinações quando quiser.
            </Text>
            {/* O texto acima SUBSTITUI o botão "Calcular Compatibilidade"
                (ternário logo abaixo) — pedia assinatura e não levava a lugar
                nenhum, deixando o voltar como única saída. Mesmo destino do
                CTA da oferta de pico emocional, no mesmo HomeStack. */}
            <TouchableOpacity
              style={[styles.offerBtn, { marginTop: 14 }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(ROUTES.PLANOS)}
            >
              <Text style={styles.offerBtnText}>{t('compat.locked.cta')}</Text>
            </TouchableOpacity>
          </>
        )}

        {!picking && !(!hasAccess && locked && result) && (
          <TouchableOpacity activeOpacity={0.85} onPress={compute} style={styles.btnWrap}>
            <LinearGradient colors={gradients.pink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
              <Ionicons name="analytics" size={18} color="#fff" />
              <Text style={styles.btnText}>Calcular Compatibilidade</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {result && (
          <>
            <View style={styles.resultCard}>
              <LinearGradient colors={gradients.card} style={styles.resultInner}>
                <View style={styles.circleWrap}>
                  <LinearGradient colors={gradients.pink} style={styles.circle}>
                    {/* Onde havia "92%" agora há "Trígono". O que sobrou de
                        número no círculo é a GEOMETRIA — graus e signos de
                        distância —, que é fato conferível em qualquer
                        efeméride, e não uma nota que ninguém sabe de onde vem. */}
                    <Text style={styles.circleAspect}>{result.aspecto}</Text>
                    <Text style={styles.circleLabel}>
                      {result.distancia === 0
                        ? 'mesmo signo'
                        : `${result.graus}° · ${result.distancia} ${result.distancia === 1 ? 'signo' : 'signos'}`}
                    </Text>
                  </LinearGradient>
                </View>
                <Text style={styles.categoryChip}>{result.categoria}</Text>
                <Text style={styles.resultTitle}>{MANCHETE[result.categoriaId]}</Text>
                <Text style={styles.resultDesc}>{result.texto}</Text>
              </LinearGradient>
            </View>

            <View style={styles.traitCard}>
              <View style={[styles.traitIcon, { backgroundColor: colors.pink + '22' }]}>
                <Ionicons name="heart-circle" size={20} color={colors.pink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.traitLabel}>Ponto forte</Text>
                <Text style={styles.traitText}>{result.forte}</Text>
              </View>
            </View>

            <View style={styles.traitCard}>
              <View style={[styles.traitIcon, { backgroundColor: colors.accent + '22' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.traitLabel}>Atenção</Text>
                <Text style={styles.traitText}>{result.cuidado}</Text>
              </View>
            </View>

            {/* A FONTE, na tela. O verbatim de Robbins fica SEM tradução (mesma
                regra do latim de Manílio em lib/zodiacBody.js) e o locus vem
                logo abaixo — a pessoa pode ir conferir. É o que separa este
                resultado de um texto de revista: ele diz de onde veio.

                NA FRENTE do inglês vem a paráfrase em português (feedback do
                dono, 31/07/2026: o povão não é obrigado a ler Robbins pra
                entender a própria leitura). A paráfrase é ASSINADA COMO NOSSA
                pelo rótulo, nunca entre aspas e nunca com locus — o inglês
                fica como recibo, não como leitura obrigatória. Quem confere,
                confere no verbatim; quem só quer entender, entende na linha
                de cima. */}
            <View style={styles.sourceCard}>
              <Text style={styles.sourceTitle}>O que a fonte diz</Text>
              {result.verbatins.map((v) => (
                <View key={v.locus + v.texto.slice(0, 24)} style={styles.sourceItem}>
                  {!!v.parafrase && (
                    <>
                      <Text style={styles.sourceParaphraseLabel}>{t('compat.paraphrase.label')}</Text>
                      <Text style={styles.sourceParaphrase}>{v.parafrase}</Text>
                    </>
                  )}
                  <Text style={styles.sourceQuote}>“{v.texto}”</Text>
                  <Text style={styles.sourceLocus}>{v.locus}</Text>
                </View>
              ))}
              <Text style={styles.sourceDegree}>
                Grau {result.grau} de 4 na escala de Tetrabiblos IV.7 — {result.grauNome}.
              </Text>
              {/* NOTA_GRAU vem COLADA no grau, e não lá embaixo com as outras
                  ressalvas. Motivo: "Grau 4 de 4" é um número numa escala, ou
                  seja exatamente a forma que este trabalho inteiro tirou da
                  tela — e ele cai em 60 dos 144 pares. Sem a linha abaixo, o
                  app troca "74%" por "grau 4 de 4" e não corrige nada. O
                  cabeçalho de lib/synastry.js já exige que a citação ande junto
                  do grau; até aqui `notaGrau` era calculado e nunca renderizado
                  em tela nenhuma. */}
              <Text style={styles.sourceDegreeNote}>{result.notaGrau}</Text>
            </View>

            {/* AS RESSALVAS. Ficam depois do conteúdo e antes de qualquer
                oferta, de propósito: quem leu o resultado precisa ler também o
                que ele não é. A primeira explica a ausência da porcentagem; a
                segunda admite que comparar signo solar com signo solar é
                recorte de jornal de 1930, e não a sinastria da fonte. */}
            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Duas coisas que este resultado não é</Text>
              <Text style={styles.noteText}>{result.notaEscala}</Text>
              <Text style={styles.noteText}>{result.ressalvaSignoSolar}</Text>
            </View>

            {highCompatOffer && (
              <View style={styles.offerCard}>
                <Text style={styles.offerTitle}>✨ {result.aspecto} entre vocês!</Text>
                <Text style={styles.offerText}>
                  Um aspecto que a tradição chama de harmônico merece ser explorado por inteiro — leituras sem limite, Tarô todo dia e o céu de vocês dois. 7 dias grátis pra testar.
                </Text>
                <TouchableOpacity
                  style={styles.offerBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate(ROUTES.PLANOS)}
                >
                  <Text style={styles.offerBtnText}>Começar meus 7 dias grátis →</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SignSlot({ sign, onPress, active }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.slot, active && { borderColor: sign.color }]}>
      <View style={[styles.slotGlyphWrap, { backgroundColor: sign.color + '22' }]}>
        <Text style={[styles.slotGlyph, { color: sign.color }]}>{sign.icon}</Text>
      </View>
      <Text style={styles.slotName}>{sign.pt}</Text>
      <Text style={styles.slotDates}>{sign.dates}</Text>
      <View style={styles.changeRow}>
        <Ionicons name="swap-vertical" size={12} color={colors.accent} />
        <Text style={styles.changeText}>Trocar</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  lockedNote: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 19, paddingHorizontal: 10, marginTop: 4 },
  pairRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  slot: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  slotGlyphWrap: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  slotGlyph: { fontSize: 30 },
  slotName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  slotDates: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  changeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 3 },
  changeText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  plusWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8, borderWidth: 1, borderColor: colors.border },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  pickerItem: { width: '31%', backgroundColor: colors.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1 },
  pickerGlyph: { fontSize: 22 },
  pickerName: { color: colors.textSecondary, fontSize: 11, marginTop: 4, fontWeight: '600' },
  btnWrap: { borderRadius: 12, overflow: 'hidden' },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  resultCard: { marginTop: 20, borderRadius: 18, overflow: 'hidden' },
  resultInner: { padding: 20, borderWidth: 1, borderColor: colors.border, borderRadius: 18, alignItems: 'center' },
  circleWrap: { marginBottom: 16 },
  circle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  // Era `circlePct` (fontSize 32, pra caber "92%"). O nome do aspecto é mais
  // comprido que dois dígitos — "Co-presença" é o pior caso —, daí 20 e o
  // adjustsFontSizeToFit não ser necessário nas larguras de tela reais.
  circleAspect: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  circleLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, textAlign: 'center' },
  categoryChip: {
    color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 0.5,
    backgroundColor: colors.accent + '1F', borderRadius: 10, overflow: 'hidden',
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10,
  },
  resultTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  resultDesc: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  sourceCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colors.border },
  sourceTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 8 },
  sourceItem: { marginBottom: 10 },
  // A paráfrase lê ANTES e MAIOR que o inglês (14 vs 13, cor de texto cheia):
  // ela é a leitura; o verbatim é o recibo. O rótulo em cima é o que a impede
  // de passar por citação — sem ele, isto seria tradução, que a regra 1 de
  // lib/synastry.js proíbe.
  sourceParaphraseLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 2 },
  sourceParaphrase: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 6 },
  sourceQuote: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  sourceLocus: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  sourceDegree: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 2 },
  sourceDegreeNote: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 6, fontStyle: 'italic' },
  noteCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colors.border },
  noteTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 8 },
  noteText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 8 },
  traitCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  traitIcon: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  traitLabel: { color: colors.text, fontSize: 14, fontWeight: '800' },
  traitText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 3 },
  offerCard: {
    marginTop: 16, padding: 18, borderRadius: 16,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.pink + '77',
  },
  offerTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  offerText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
  offerBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  offerBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
