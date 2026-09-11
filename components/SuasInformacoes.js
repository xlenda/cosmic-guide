// SUAS INFORMAÇÕES — cartão em cima da tiragem de tarô com o que a pessoa
// contou sobre si (gênero, idade, profissão, relacionamento) e um lápis que
// abre o formulário (referência do dono, 11/09/2026: o concorrente mostra
// isso antes das cartas e a leitura fala com a pessoa, não com "alguém").
//
// Este componente NÃO carrega nem salva nada: recebe `perfil` (de
// lib/perfilLeitura.getPerfilLeitura, pode ser null), `idadeSugerida`
// (idadeDeNascimento, pode ser null) e devolve o perfil novo em onSalvar —
// quem usa grava com setPerfilLeitura. Regra "NUNCA FABRICAR": sem nada
// preenchido o cartão mostra o convite apagado; a idade só vem pré-preenchida
// quando há data de nascimento real salva.
//
// Modal do react-native, não Alert.alert: Alert é no-op na web (Expo web), e
// aqui precisa de campos de texto — um modal simples é a UI própria do repo
// (mesmo padrão de components/AlertHost.js).
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

// Chaves LITERAIS (não template) pra varredura estática de
// test/i18nKeysExist.test.js enxergar cada uma. Ids = enums de lib/perfilLeitura.
const GENEROS = [
  { id: 'feminino', rotulo: 'tarot.info.genero.feminino' },
  { id: 'masculino', rotulo: 'tarot.info.genero.masculino' },
  { id: 'outro', rotulo: 'tarot.info.genero.outro' },
];
const ESTADOS_CIVIS = [
  { id: 'solteiro', rotulo: 'tarot.info.estadoCivil.solteiro' },
  { id: 'namorando', rotulo: 'tarot.info.estadoCivil.namorando' },
  { id: 'casado', rotulo: 'tarot.info.estadoCivil.casado' },
  { id: 'separado', rotulo: 'tarot.info.estadoCivil.separado' },
];

function rotuloDe(opcoes, id, t) {
  const op = opcoes.find((o) => o.id === id);
  return op ? t(op.rotulo) : null;
}

// Linha de chips de escolha única; tocar no já escolhido desmarca (a pessoa
// pode preferir não dizer — null é um valor válido no perfil).
function Chips({ opcoes, valor, onChange, t }) {
  return (
    <View style={styles.chips}>
      {opcoes.map((o) => {
        const ativo = o.id === valor;
        return (
          <TouchableOpacity
            key={o.id}
            onPress={() => onChange(ativo ? null : o.id)}
            style={[styles.chip, ativo && styles.chipAtivo]}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
            // react-native-web 0.21 não mapeia accessibilityState.selected pro DOM
            // (revisor adversarial, 11/09/2026); aria-* passa direto.
            aria-selected={ativo}
          >
            <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{t(o.rotulo)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function SuasInformacoes({ perfil, idadeSugerida, onSalvar }) {
  const { t } = useLanguage();
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState(null);

  const p = perfil || {};
  const resumo = [
    rotuloDe(GENEROS, p.genero, t),
    p.idade != null ? String(p.idade) : null,
    p.profissao,
    rotuloDe(ESTADOS_CIVIS, p.estadoCivil, t),
  ]
    .filter(Boolean)
    .join(', ');

  // O rascunho nasce ao ABRIR (não no mount) pra refletir o perfil atual e a
  // idade sugerida do momento — idadeDeNascimento chega assíncrona e pode
  // resolver depois do primeiro render.
  function abrir() {
    const idadeInicial = p.idade != null ? p.idade : idadeSugerida;
    setRascunho({
      genero: p.genero || null,
      idade: idadeInicial != null ? String(idadeInicial) : '',
      profissao: p.profissao || '',
      estadoCivil: p.estadoCivil || null,
    });
    setAberto(true);
  }

  function salvar() {
    const idade = parseInt(rascunho.idade, 10);
    onSalvar({
      genero: rascunho.genero,
      idade: Number.isFinite(idade) ? idade : null,
      profissao: rascunho.profissao.trim() || null,
      estadoCivil: rascunho.estadoCivil,
    });
    setAberto(false);
  }

  function mudar(campo, valor) {
    setRascunho((r) => ({ ...r, [campo]: valor }));
  }

  return (
    <View style={styles.cartao} testID="tarot-info">
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>{t('tarot.info.title')}</Text>
        <TouchableOpacity
          onPress={abrir}
          style={styles.lapis}
          accessibilityRole="button"
          accessibilityLabel={t('tarot.info.editar')}
          testID="tarot-info-editar"
        >
          <Ionicons name="create-outline" size={18} color={colors.gold} accessible={false} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.resumo, !resumo && styles.vazio]}>{resumo || t('tarot.info.vazio')}</Text>

      <Modal transparent animationType="fade" visible={aberto} onRequestClose={() => setAberto(false)}>
        <View style={styles.fundo}>
          {rascunho && (
            <View style={styles.modal}>
              <Text style={styles.modalTitulo}>{t('tarot.info.title')}</Text>

              <Text style={styles.rotulo}>{t('tarot.info.genero')}</Text>
              <Chips opcoes={GENEROS} valor={rascunho.genero} onChange={(v) => mudar('genero', v)} t={t} />

              <Text style={styles.rotulo}>{t('tarot.info.idade')}</Text>
              <TextInput
                value={rascunho.idade}
                onChangeText={(v) => mudar('idade', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
                style={[styles.campo, styles.campoCurto]}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.rotulo}>{t('tarot.info.profissao')}</Text>
              <TextInput
                value={rascunho.profissao}
                onChangeText={(v) => mudar('profissao', v)}
                autoCapitalize="words"
                maxLength={40}
                style={styles.campo}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.rotulo}>{t('tarot.info.estadoCivil')}</Text>
              <Chips opcoes={ESTADOS_CIVIS} valor={rascunho.estadoCivil} onChange={(v) => mudar('estadoCivil', v)} t={t} />

              <TouchableOpacity
                onPress={salvar}
                style={styles.salvar}
                accessibilityRole="button"
                testID="tarot-info-salvar"
              >
                <Text style={styles.salvarTexto}>{t('tarot.info.salvar')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    marginHorizontal: 20, marginBottom: 14, padding: 14,
    backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titulo: { color: colors.text, fontSize: 14, fontWeight: '800' },
  lapis: { padding: 4 },
  resumo: { color: colors.textSecondary, fontSize: 13, marginTop: 6 },
  vazio: { color: colors.textMuted },
  // Mesmo fundo/cartão de AlertHost.js — o app só tem um jeito de modal.
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal: {
    width: '100%', maxWidth: 380, backgroundColor: colors.card, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, padding: 22,
  },
  modalTitulo: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 4 },
  rotulo: { color: colors.textMuted, fontSize: 12, marginTop: 14, marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 7, paddingHorizontal: 12 },
  chipAtivo: { borderColor: colors.gold, backgroundColor: colors.gold + '22' },
  chipTexto: { color: colors.textSecondary, fontSize: 13 },
  chipTextoAtivo: { color: colors.gold, fontWeight: '700' },
  campo: {
    color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingVertical: 9, paddingHorizontal: 12, backgroundColor: colors.surface,
  },
  campoCurto: { width: 90 },
  // Dourado é a única cor de ação do app (ver FeatureCard.js).
  salvar: { marginTop: 20, backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  salvarTexto: { color: colors.background, fontSize: 14, fontWeight: '800' },
});
