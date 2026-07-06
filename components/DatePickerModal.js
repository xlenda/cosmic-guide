// Seletor de data (dia/mês/ano em três colunas roláveis) genérico, extraído do
// modal que já existia embutido em screens/QuizScreen.js. QuizScreen.js continua
// com sua própria cópia interna intacta (não foi tocado); este componente é usado
// pela TimelineScreen, que precisa do mesmo padrão de seleção de dia tanto para a
// data de uma lembrança (normalmente no passado) quanto para o `unlockAt` de uma
// cápsula do tempo (normalmente no futuro) — por isso o intervalo de anos aqui é
// mais amplo que o do quiz (que só lida com datas de nascimento) e configurável
// via props minYear/maxYear.
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { colors } from '../theme';

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ITEM_HEIGHT = 44;
const CURRENT_YEAR = new Date().getFullYear();

function pad2(n) {
  return String(n).padStart(2, '0');
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function PickerColumn({ data, selected, onSelect, renderLabel }) {
  const index = Math.max(0, data.indexOf(selected));
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item)}
      style={styles.pickerCol}
      showsVerticalScrollIndicator={false}
      initialScrollIndex={index}
      getItemLayout={(_, i) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * i, index: i })}
      renderItem={({ item }) => {
        const sel = item === selected;
        return (
          <TouchableOpacity style={[styles.pickerItem, sel && styles.pickerItemSel]} onPress={() => onSelect(item)}>
            <Text style={[styles.pickerItemText, sel && styles.pickerItemTextSel]}>
              {renderLabel ? renderLabel(item) : item}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

export default function DatePickerModal({
  visible,
  title = 'Selecionar data',
  initialDate,
  minYear = CURRENT_YEAR - 100,
  maxYear = CURRENT_YEAR + 15,
  onClose,
  onConfirm,
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());

  useEffect(() => {
    if (!visible) return;
    if (initialDate) {
      const [y, m, d] = initialDate.split('-').map(Number);
      setYear(y);
      setMonth(m);
      setDay(d);
    } else {
      setYear(today.getFullYear());
      setMonth(today.getMonth() + 1);
      setDay(today.getDate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialDate]);

  const maxDay = daysInMonth(month, year);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  function confirm() {
    const safeDay = Math.min(day, maxDay);
    onConfirm(`${year}-${pad2(month)}-${pad2(safeDay)}`);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.pickerRow}>
            <PickerColumn data={days} selected={Math.min(day, maxDay)} onSelect={setDay} />
            <PickerColumn data={months} selected={month} onSelect={setMonth} renderLabel={(m) => MONTHS_PT[m - 1]} />
            <PickerColumn data={years} selected={year} onSelect={setYear} />
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={confirm}>
              <Text style={styles.btnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  pickerRow: { flexDirection: 'row', height: ITEM_HEIGHT * 4 },
  pickerCol: { flex: 1 },
  pickerItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  pickerItemSel: { backgroundColor: colors.accent + '22', borderRadius: 10 },
  pickerItemText: { color: colors.textSecondary, fontSize: 16 },
  pickerItemTextSel: { color: colors.text, fontWeight: '800' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 26, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  btnGhost: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
});
