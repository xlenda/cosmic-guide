// O BOTÃO "OUVIR" — pill discreta que lê a leitura em voz alta com a voz do
// aparelho (lib/voz.js, Web Speech API — custo zero, offline, três idiomas).
//
// Contrato:
//   · Props { texto, style }. O idioma vem do useLanguage() — a fala segue o
//     idioma do APP, não o do navegador.
//   · Dois estados: parado (play + "Ouvir") e falando (stop + "Parar"); o
//     toque alterna. As chaves vivem no [BLOCO-OUVIR] de lib/i18n.js.
//   · Sem Web Speech API (nativo, browser antigo) o componente devolve null:
//     nenhum botão morto, nenhum erro — mesma filosofia do tema dourado, que
//     nunca oferece efeito que a plataforma não entrega.
//   · TROCAR DE TELA NUNCA DEIXA VOZ FALANDO: o cleanup do useEffect chama
//     parar() no desmonte. E se o TEXTO trocar embaixo do botão montado
//     (aba Ontem→Hoje no Horóscopo, slide avançado no StoriesReader), a fala
//     antiga também para — senão a tela mostraria um texto e a voz leria
//     outro.
//
// iOS Safari só fala após gesto do usuário (armadilha 1 de lib/voz.js): o
// onPress deste botão É o gesto, então falar() daqui sempre funciona.
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { vozDisponivel, falar, parar } from '../lib/voz';

export default function BotaoOuvir({ texto, style }) {
  const { t, lang } = useLanguage();
  const [tocando, setTocando] = useState(false);
  // O callback de fim de fala chega DEPOIS que o componente pode ter morrido
  // (parar() do cleanup dispara onerror da fila) — o ref evita setState em
  // componente desmontado.
  const vivo = useRef(true);

  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
      parar();
    };
  }, []);

  // AUDITORIA 09/08/2026: o cleanup de desmonte NÃO cobre trocar de aba nem
  // push (React Navigation mantém a tela montada — achado real, o próprio
  // ChatScreen documenta o unmountOnBlur=false). Sem isto, "Ouvir" no
  // Horóscopo + tocar a aba Tarô deixava a voz narrando por cima da outra
  // aba sem botão de parar à vista. O evento 'blur' da tela dona cobre os
  // dois casos; useContext (e não useNavigation) porque fora de navegação
  // ele devolve undefined em vez de lançar.
  const navigation = useContext(NavigationContext);
  useEffect(() => {
    if (!navigation) return undefined;
    return navigation.addListener('blur', () => {
      parar();
      if (vivo.current) setTocando(false);
    });
  }, [navigation]);

  // Texto ou idioma trocaram com o botão montado: a fala antiga não pode
  // continuar por cima do conteúdo novo. Pula o primeiro render — no mount
  // não há fala nossa, e parar() cancelaria a de um irmão.
  const primeiroRender = useRef(true);
  useEffect(() => {
    if (primeiroRender.current) {
      primeiroRender.current = false;
      return;
    }
    parar();
    setTocando(false);
  }, [texto, lang]);

  if (!vozDisponivel()) return null;

  const alternar = () => {
    if (tocando) {
      setTocando(false);
      parar();
      return;
    }
    setTocando(true);
    // falar() já cancela qualquer fala anterior (inclusive de outro
    // BotaoOuvir da mesma tela) — só existe uma voz no app por vez.
    falar(texto, lang, () => {
      if (vivo.current) setTocando(false);
    });
  };

  const rotulo = tocando ? t('ouvir.parar') : t('ouvir.ouvir');

  return (
    <TouchableOpacity
      style={[styles.pill, style]}
      activeOpacity={0.8}
      onPress={alternar}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
    >
      <Ionicons name={tocando ? 'stop' : 'play'} size={16} color={colors.accent2} />
      <Text style={styles.rotulo}>{rotulo}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Pill discreta: acompanha a leitura sem competir com ela.
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  rotulo: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
});
