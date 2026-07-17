// Quiz do casal — porta fiel do miniapp web em
// c:/tmp/gilfforever/web/app/(funil)/quiz/page.js: mesmos 5 passos (Vocês, Signo e
// Nascimento, Energia, Cartas, Astros), mesma lógica de validação/avanço e mesmo
// conteúdo astrológico (sinastria, cartas, números cósmicos, frequência), com a
// cópia de tela traduzida para PT-BR e adaptada aos primitivos do React Native
// (sem <input type="date">, sem CSS de flip 3D, sem localStorage/html2canvas).
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import {
  SIGNS,
  compatibility,
  compatPercent,
  cosmicNumbers,
  frequenciaFor,
  CARDS,
  moonSign,
  signoFromDate,
  ascendantSign,
} from '../lib/signs';
import { searchCities, cityLabel } from '../lib/cities';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';

// Chaves de tradução (não os nomes exibidos) — a exibição real passa por
// t(STEPS[idx]) onde for mostrado; aqui só serve de key/índice estável.
const STEPS = ['quiz.step.voces', 'quiz.step.signoNascimento', 'quiz.step.energia', 'quiz.step.cartas', 'quiz.step.astros'];
const TOTAL = 5;

const ENERGIAS = [
  'Romântica 💕',
  'Apaixonada 🔥',
  'Poderosa ⚡',
  'Reflexiva 🌙',
  'Distantes 🌫️',
  'Em conflito 😔',
  'Em crise 💔',
  'Recomeçando 🌱',
];

const ENERGIA_ECO = {
  'Romântica 💕': 'Dá pra notar — este mapa vai mostrar de onde nasce essa faísca.',
  'Apaixonada 🔥': 'Intensa. Vamos ver o que sustenta isso quando a chama abaixar.',
  'Poderosa ⚡': 'Duas forças juntas. Esse poder também precisa de cuidado.',
  'Reflexiva 🌙': 'Um momento de olhar pra dentro, os dois.',
  'Distantes 🌫️': 'A distância também tem mapa — e caminho de volta, juntos.',
  'Em conflito 😔': 'Vocês estão aqui, juntos, buscando isso. Isso já diz muito.',
  'Em crise 💔': 'Momentos assim apertam. Vocês dois aqui já é um bom começo.',
  'Recomeçando 🌱': 'Recomeçar é corajoso. Vamos começar pelo céu de vocês.',
};

const MOON_NEED = {
  fogo: 'precisa de faísca e movimento para se sentir em casa',
  terra: 'precisa de constância e gestos concretos para se sentir em paz',
  ar: 'precisa conversar e entender para se sentir perto',
  água: 'precisa de ternura e contato para se sentir seguro(a)',
};

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const ITEM_HEIGHT = 44;
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;

function pad2(n) {
  return String(n).padStart(2, '0');
}

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function formatDateBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Números "cósmicos"/hora dourada — mesmo hash determinístico do original (horaDorada).
function horaDourada(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hh = h % 24;
  const mm = (h >> 3) % 60;
  return `${pad2(hh)}:${pad2(mm)}`;
}

function SignGrid({ current, onSelect }) {
  return (
    <View style={styles.signGrid}>
      {SIGNS.map((s) => {
        const sel = current === s.name;
        return (
          <TouchableOpacity
            key={s.name}
            style={[styles.signCell, sel && styles.signCellSel]}
            onPress={() => onSelect(s.name)}
            activeOpacity={0.8}
          >
            <Text style={styles.signCellEmoji}>{s.emoji}</Text>
            <Text style={styles.signCellName}>{s.name}</Text>
            <Text style={styles.signCellRange}>{s.range}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
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

function DatePickerModal({ visible, initialDate, onClose, onConfirm }) {
  const [year, setYear] = useState(CURRENT_YEAR - 25);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);

  useEffect(() => {
    if (!visible) return;
    if (initialDate) {
      const [y, m, d] = initialDate.split('-').map(Number);
      setYear(y);
      setMonth(m);
      setDay(d);
    } else {
      setYear(CURRENT_YEAR - 25);
      setMonth(6);
      setDay(15);
    }
  }, [visible, initialDate]);

  const maxDay = daysInMonth(month, year);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);

  function confirm() {
    const safeDay = Math.min(day, maxDay);
    onConfirm(`${year}-${pad2(month)}-${pad2(safeDay)}`);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Data de nascimento</Text>
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

// Cidade de nascimento é opcional (assim como a hora) — modal de busca reaproveita
// o mesmo Modal/estilo de sheet do DatePickerModal acima, trocando os PickerColumn
// por um TextInput + FlatList filtrando lib/cities.js (busca acento-insensível).
function CityPickerModal({ visible, hasSelection, onClose, onSelect, onClear }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const results = searchCities(query);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, styles.citySheet]}>
          <Text style={styles.modalTitle}>Cidade de nascimento</Text>
          <TextInput
            style={styles.input}
            placeholder="Buscar cidade..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            style={styles.cityList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={styles.mutedCenter}>Nenhuma cidade encontrada.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cityItem} onPress={() => onSelect(item)}>
                <Text style={styles.cityItemText}>{cityLabel(item)}</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.modalActions}>
            {hasSelection ? (
              <TouchableOpacity style={styles.btnGhost} onPress={onClear}>
                <Text style={styles.btnGhostText}>Remover cidade</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
                <Text style={styles.btnGhostText}>Pular (opcional)</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btn} onPress={onClose}>
              <Text style={styles.btnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function QuizScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { save } = useCouple();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [voce, setVoce] = useState('');
  const [amor, setAmor] = useState('');
  const [signoVoce, setSignoVoce] = useState('');
  const [signoAmor, setSignoAmor] = useState('');
  const [nascVoce, setNascVoce] = useState('');
  const [nascAmor, setNascAmor] = useState('');
  const [nascHoraVoce, setNascHoraVoce] = useState('');
  const [nascHoraAmor, setNascHoraAmor] = useState('');
  const [horaVoceH, setHoraVoceH] = useState('');
  const [horaVoceM, setHoraVoceM] = useState('');
  const [horaAmorH, setHoraAmorH] = useState('');
  const [horaAmorM, setHoraAmorM] = useState('');
  const [signoManualVoce, setSignoManualVoce] = useState(false);
  const [signoManualAmor, setSignoManualAmor] = useState(false);
  const [cidadeVoce, setCidadeVoce] = useState(null); // objeto de lib/cities.js | null (campo opcional)
  const [cidadeAmor, setCidadeAmor] = useState(null);
  const [desejo, setDesejo] = useState('');
  const [cartas, setCartas] = useState([]);
  const [datePickerFor, setDatePickerFor] = useState(null); // null | 'voce' | 'amor'
  const [cityPickerFor, setCityPickerFor] = useState(null); // null | 'voce' | 'amor'
  const [aviso, setAviso] = useState('');
  const [analisando, setAnalisando] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState([]);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [saving, setSaving] = useState(false);

  const amorInputRef = useRef(null);
  // Guarda os ids do setInterval/setTimeout do loading do passo 4->5 para
  // poder cancelá-los se a tela desmontar (voltar pelo hardware back, reset de
  // stack) enquanto a animação de ~1.4s ainda está rodando — sem isso, os
  // timers seguem disparando setState num componente já desmontado.
  const timersRef = useRef([]);
  useEffect(() => {
    return () => {
      timersRef.current.forEach(({ type, id }) => {
        if (type === 'interval') clearInterval(id);
        else clearTimeout(id);
      });
      timersRef.current = [];
    };
  }, []);
  const flipAnimsRef = useRef(null);
  if (!flipAnimsRef.current) {
    flipAnimsRef.current = {};
    CARDS.forEach((c) => {
      flipAnimsRef.current[c.name] = new Animated.Value(0);
    });
  }
  const flipAnims = flipAnimsRef.current;

  // Hora opcional: combina HH + MM em "HH:MM" só quando os dois campos são números válidos
  // (mesmo comportamento do <input type="time"> opcional do original — some fica igual a "").
  useEffect(() => {
    const h = parseInt(horaVoceH, 10);
    const m = parseInt(horaVoceM, 10);
    if (!Number.isNaN(h) && !Number.isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      setNascHoraVoce(`${pad2(h)}:${pad2(m)}`);
    } else {
      setNascHoraVoce('');
    }
  }, [horaVoceH, horaVoceM]);

  useEffect(() => {
    const h = parseInt(horaAmorH, 10);
    const m = parseInt(horaAmorM, 10);
    if (!Number.isNaN(h) && !Number.isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      setNascHoraAmor(`${pad2(h)}:${pad2(m)}`);
    } else {
      setNascHoraAmor('');
    }
  }, [horaAmorH, horaAmorM]);

  // Anima o flip de cada carta sempre que a seleção mudar (inclusive ao desmarcar).
  useEffect(() => {
    CARDS.forEach((c) => {
      const flipped = cartas.includes(c.name);
      Animated.timing(flipAnims[c.name], {
        toValue: flipped ? 1 : 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });
  }, [cartas]);

  useEffect(() => {
    setAviso('');
  }, [voce, amor, signoVoce, signoAmor, nascVoce, nascAmor, desejo, cartas.length]);

  function onNascVoceChange(dateStr) {
    setNascVoce(dateStr);
    // DatePickerModal chama onConfirm a cada toque em "Confirmar", mesmo sem
    // mudar a data. Se o usuário já tocou em "não é esse o signo" e escolheu
    // manualmente, não pode reconfirmar a data e apagar essa escolha.
    if (signoManualVoce) return;
    const auto = signoFromDate(dateStr);
    if (auto) setSignoVoce(auto);
  }

  function onNascAmorChange(dateStr) {
    setNascAmor(dateStr);
    if (signoManualAmor) return;
    const auto = signoFromDate(dateStr);
    if (auto) setSignoAmor(auto);
  }

  // Uma vez escolhida, a carta fica travada — sem voltar atrás e trocar por
  // outra. Antes, tocar numa carta já escolhida a desmarcava (permitindo
  // reescolher); agora só adiciona novas cartas até completar as 3.
  function toggleCarta(name) {
    setCartas((prev) => {
      if (prev.includes(name) || prev.length >= 3) return prev;
      return [...prev, name];
    });
  }

  const compat = signoVoce && signoAmor ? compatibility(signoVoce, signoAmor) : null;
  const pct = signoVoce && signoAmor ? compatPercent(signoVoce, signoAmor) : null;
  const lunaA = moonSign(nascVoce, nascHoraVoce);
  const lunaB = moonSign(nascAmor, nascHoraAmor);
  // Ascendente só é calculado (nunca "chutado") quando hora real + cidade existem
  // pros dois — ascendantSign já devolve null sozinho se faltar hora ou cidade,
  // então cidadeVoce/cidadeAmor nulos (campo pulado) já bastam pra cair no teaser estático.
  const ascA = ascendantSign(nascVoce, nascHoraVoce, cidadeVoce?.lat, cidadeVoce?.lon, cidadeVoce?.utcOffset);
  const ascB = ascendantSign(nascAmor, nascHoraAmor, cidadeAmor?.lat, cidadeAmor?.lon, cidadeAmor?.utcOffset);

  const canNext =
    (step === 1 && !!voce && !!amor) ||
    (step === 2 && !!nascVoce && !!nascAmor && !!signoVoce && !!signoAmor) ||
    (step === 3 && !!desejo) ||
    (step === 4 && cartas.length === 3) ||
    step === 5;

  const AVISOS = {
    1: !voce ? 'Escreva seu nome para continuar.' : !amor ? 'Falta o nome do seu amor.' : '',
    2: !nascVoce
      ? `Falta a data de nascimento de ${voce || 'vocês'}.`
      : !nascAmor
      ? `Falta a data de nascimento de ${amor || 'seu amor'}.`
      : !signoVoce || !signoAmor
      ? 'Confira as datas — não conseguimos calcular o signo.'
      : '',
    3: !desejo ? 'Escolha a energia de vocês agora.' : '',
    4: cartas.length < 3 ? `Escolham 3 cartas — faltam ${3 - cartas.length}.` : '',
  };

  function avancar() {
    if (step === 4) {
      const msgs = [
        `Lendo o céu de ${voce} & ${amor}…`,
        `Cruzando ${signoVoce} com ${signoAmor}…`,
        `Traçando o mapa de vocês…`,
      ];
      setLoadingMsgs(msgs);
      setLoadingPhase(0);
      setAnalisando(true);
      let phase = 0;
      const id = setInterval(() => {
        phase += 1;
        if (phase >= msgs.length) {
          clearInterval(id);
          const timeoutId = setTimeout(() => {
            setAnalisando(false);
            setStep(5);
          }, 350);
          timersRef.current.push({ type: 'timeout', id: timeoutId });
        } else {
          setLoadingPhase(phase);
        }
      }, 350);
      timersRef.current.push({ type: 'interval', id });
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleContinuar() {
    if (!canNext) {
      setAviso(AVISOS[step] || 'Preencha esta etapa para continuar.');
      return;
    }
    setAviso('');
    Keyboard.dismiss();
    avancar();
  }

  function handleBack() {
    if (step > 1) {
      setAviso('');
      setStep((s) => s - 1);
    } else {
      navigation.goBack();
    }
  }

  async function finalizarQuiz() {
    if (saving) return;
    setSaving(true);
    const ok = await save({
      voce,
      amor,
      sa: signoVoce,
      sb: signoAmor,
      birthA: { date: nascVoce, time: nascHoraVoce || null },
      birthB: { date: nascAmor, time: nascHoraAmor || null },
    });
    setSaving(false);
    if (!ok) {
      // Perfil e/ou datas de nascimento falharam ao salvar — não navega como
      // se tivesse dado certo. O botão volta a ficar habilitado para retry.
      setAviso('Não foi possível salvar. Tente novamente.');
      return;
    }
    // No gate automático (usuário sem perfil) este Stack não tem pai — o
    // Gate em App.js já troca para o Tab.Navigator sozinho assim que
    // coupleData deixa de ser null. Como tela normal empurrada a partir do
    // Profile (refazer o quiz), há um Tab.Navigator pai para voltar à Home.
    if (navigation.getParent()) {
      navigation.navigate(ROUTES.HOME_TAB, { screen: ROUTES.HOME_MAIN });
    }
  }

  if (analisando) {
    const idx = Math.min(loadingPhase, loadingMsgs.length - 1);
    return (
      <View style={[styles.root, styles.loaderRoot, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.loaderOrb}>✴</Text>
        <Text style={styles.loaderText}>{loadingMsgs[idx]}</Text>
        <View style={styles.loaderTrack}>
          <View style={[styles.loaderFill, { width: `${((idx + 1) / loadingMsgs.length) * 100}%` }]} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GradientHeader
        title={t('quiz.headerTitle')}
        subtitle={t('quiz.headerSubtitle', { step, total: TOTAL, stepName: t(STEPS[step - 1]) })}
        onBack={handleBack}
      />

      <View style={styles.stepper}>
        {STEPS.map((label, idx) => {
          const n = idx + 1;
          const done = n < step;
          const now = n === step;
          return (
            <React.Fragment key={label}>
              {idx > 0 && <View style={[styles.stepBar, (done || now) && styles.stepBarDone]} />}
              <View style={[styles.stepDot, done && styles.stepDotDone, now && styles.stepDotNow]}>
                <Text style={styles.stepDotText}>{done ? '✓' : n}</Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {step > 1 && (voce || amor || signoVoce || signoAmor || desejo || cartas.length > 0) && (
        <View style={styles.buildStrip}>
          {voce && amor && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{voce} & {amor}</Text>
            </View>
          )}
          {signoVoce ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>☉ {signoVoce}</Text>
            </View>
          ) : null}
          {signoAmor ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>☉ {signoAmor}</Text>
            </View>
          ) : null}
          {desejo ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{desejo}</Text>
            </View>
          ) : null}
          {cartas.map((name) => {
            const c = CARDS.find((x) => x.name === name);
            return (
              <View key={name} style={styles.chip}>
                <Text style={styles.chipText}>{c?.emoji}</Text>
              </View>
            );
          })}
        </View>
      )}

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View style={styles.hero}>
            <Text style={styles.heroEyebrow}>{t('quiz.hero.eyebrow')}</Text>
            <Text style={styles.heroStar}>✴</Text>
            <Text style={styles.heroTitle}>{t('quiz.hero.title')}</Text>
            <Text style={styles.heroGold}>{t('quiz.hero.gold')}</Text>
            <Text style={styles.heroSub}>{t('quiz.hero.sub')}</Text>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>{t('quiz.names.title')}</Text>
            <View style={styles.field}>
              <Text style={styles.label}>{t('quiz.names.yourName')}</Text>
              <TextInput
                style={styles.input}
                autoFocus
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                value={voce}
                onChangeText={setVoce}
                onSubmitEditing={() => amorInputRef.current?.focus()}
                placeholder={t('quiz.names.yourNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t('quiz.names.partnerName')}</Text>
              <TextInput
                ref={amorInputRef}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                value={amor}
                onChangeText={setAmor}
                onSubmitEditing={() => {
                  if (voce && amor) handleContinuar();
                }}
                placeholder={t('quiz.names.partnerNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Data de nascimento de cada um</Text>
            <Text style={styles.mutedCenter}>
              Com a data já sabemos o signo de cada um. A hora é opcional — mas revela o Ascendente.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Data de {voce || 'você'}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerFor('voce')}>
                <Text style={[styles.dateBtnText, !nascVoce && styles.dateBtnPlaceholder]}>
                  {nascVoce ? formatDateBR(nascVoce) : 'Selecionar data'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Hora de {voce || 'você'} (opcional)</Text>
              <View style={styles.hourRow}>
                <TextInput
                  style={styles.hourInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor={colors.textMuted}
                  value={horaVoceH}
                  onChangeText={setHoraVoceH}
                />
                <Text style={styles.hourColon}>:</Text>
                <TextInput
                  style={styles.hourInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor={colors.textMuted}
                  value={horaVoceM}
                  onChangeText={setHoraVoceM}
                />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Cidade de nascimento de {voce || 'você'} (opcional)</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setCityPickerFor('voce')}>
                <Text style={[styles.dateBtnText, !cidadeVoce && styles.dateBtnPlaceholder]}>
                  {cidadeVoce ? cityLabel(cidadeVoce) : 'Selecionar cidade'}
                </Text>
              </TouchableOpacity>
            </View>
            {!!signoVoce && (
              <View style={styles.signInfoRow}>
                <Text style={styles.mutedText}>
                  Signo de {voce}: <Text style={styles.signInfoStrong}>{signoVoce}</Text>
                </Text>
                <TouchableOpacity onPress={() => setSignoManualVoce((v) => !v)}>
                  <Text style={styles.linkText}>{signoManualVoce ? 'ocultar' : 'não é esse o signo'}</Text>
                </TouchableOpacity>
              </View>
            )}
            {signoManualVoce && <SignGrid current={signoVoce} onSelect={setSignoVoce} />}

            <View style={[styles.field, { marginTop: 18 }]}>
              <Text style={styles.label}>Data de {amor || 'seu amor'}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerFor('amor')}>
                <Text style={[styles.dateBtnText, !nascAmor && styles.dateBtnPlaceholder]}>
                  {nascAmor ? formatDateBR(nascAmor) : 'Selecionar data'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Hora de {amor || 'seu amor'} (opcional)</Text>
              <View style={styles.hourRow}>
                <TextInput
                  style={styles.hourInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor={colors.textMuted}
                  value={horaAmorH}
                  onChangeText={setHoraAmorH}
                />
                <Text style={styles.hourColon}>:</Text>
                <TextInput
                  style={styles.hourInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor={colors.textMuted}
                  value={horaAmorM}
                  onChangeText={setHoraAmorM}
                />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Cidade de nascimento de {amor || 'seu amor'} (opcional)</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setCityPickerFor('amor')}>
                <Text style={[styles.dateBtnText, !cidadeAmor && styles.dateBtnPlaceholder]}>
                  {cidadeAmor ? cityLabel(cidadeAmor) : 'Selecionar cidade'}
                </Text>
              </TouchableOpacity>
            </View>
            {!!signoAmor && (
              <View style={styles.signInfoRow}>
                <Text style={styles.mutedText}>
                  Signo de {amor}: <Text style={styles.signInfoStrong}>{signoAmor}</Text>
                </Text>
                <TouchableOpacity onPress={() => setSignoManualAmor((v) => !v)}>
                  <Text style={styles.linkText}>{signoManualAmor ? 'ocultar' : 'não é esse o signo'}</Text>
                </TouchableOpacity>
              </View>
            )}
            {signoManualAmor && <SignGrid current={signoAmor} onSelect={setSignoAmor} />}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>{t('quiz.energy.title', { voce, amor })}</Text>
            <View style={styles.energyGrid}>
              {ENERGIAS.map((d) => {
                const sel = desejo === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.energyBtn, sel && styles.energyBtnSel]}
                    onPress={() => setDesejo(d)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.energyText, sel && styles.energyTextSel]}>{d}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!!desejo && <Text style={styles.energyEcho}>{ENERGIA_ECO[desejo]}</Text>}
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.sectionTitle}>{t('quiz.cards.title', { voce, amor })}</Text>
            <Text style={styles.mutedCenter}>
              {cartas.length < 3
                ? t('quiz.cards.progress', {
                    position: t([
                      'quiz.cards.position.past',
                      'quiz.cards.position.present',
                      'quiz.cards.position.future',
                    ][cartas.length]),
                    count: cartas.length,
                  })
                : t('quiz.cards.done', { voce, amor })}
            </Text>

            <View style={styles.tarotGrid}>
              {CARDS.map((c) => {
                const flipped = cartas.includes(c.name);
                // Travada assim que virada (não dá pra tocar de novo pra desmarcar) e
                // as demais desabilitam quando as 3 já foram escolhidas.
                const disabled = flipped || cartas.length >= 3;
                const anim = flipAnims[c.name];
                const rotateBack = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
                const rotateFront = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
                const backOpacity = anim.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [1, 1, 0, 0] });
                const frontOpacity = anim.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [0, 0, 1, 1] });
                return (
                  <TouchableOpacity
                    key={c.name}
                    activeOpacity={0.85}
                    disabled={disabled}
                    onPress={() => toggleCarta(c.name)}
                    style={[styles.tarotCardWrap, !flipped && disabled && styles.tarotCardDisabled]}
                  >
                    <Animated.View
                      style={[
                        styles.tarotFace,
                        styles.tarotBack,
                        { opacity: backOpacity, transform: [{ perspective: 800 }, { rotateY: rotateBack }] },
                      ]}
                    >
                      <Text style={styles.tarotBackGlyph}>✷</Text>
                    </Animated.View>
                    <Animated.View
                      style={[
                        styles.tarotFace,
                        styles.tarotFront,
                        { opacity: frontOpacity, transform: [{ perspective: 800 }, { rotateY: rotateFront }] },
                      ]}
                    >
                      <Text style={styles.tarotEmoji}>{c.emoji}</Text>
                      <Text style={styles.tarotName}>{c.name}</Text>
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.tray}>
              {['quiz.cards.position.past', 'quiz.cards.position.present', 'quiz.cards.position.future'].map((rolKey, i) => {
                const name = cartas[i];
                const c = name && CARDS.find((x) => x.name === name);
                return (
                  <View key={rolKey} style={[styles.traySlot, c && styles.traySlotFilled]}>
                    <Text style={styles.trayLabel}>{t(rolKey)}</Text>
                    <Text style={styles.trayEmoji}>{c ? c.emoji : '·'}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {step === 5 && compat && (
          <View>
            <Text style={styles.revealEmojis}>{compat.emojiA} {compat.emojiB}</Text>
            <Text style={styles.revealTitle}>{compat.titulo}</Text>
            <Text style={styles.mutedCenter}>A energia de {voce} & {amor}</Text>

            <View style={styles.card}>
              <Text style={styles.pct}>{pct}%</Text>
              <Text style={styles.badge}>compatibilidade do casal</Text>
              <Text style={styles.disclaimer}>
                Afinidade entre os elementos de vocês ({compat.elementoA} + {compat.elementoB}) · leitura astrológica, por diversão
              </Text>
              <Text style={styles.revealForte}>
                {pct >= 88
                  ? `Elementos que se acendem: ${compat.forte}`
                  : pct >= 80
                  ? `Se equilibram bem: ${compat.forte}`
                  : `Diferentes e magnéticos: ${compat.forte}`}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.badgeRow}>
                <Text style={styles.badge}>Elemento {compat.elementoA}</Text>
                <Text style={styles.badge}>Elemento {compat.elementoB}</Text>
              </View>
              <Text style={styles.compatLine}>{compat.texto}</Text>
              <Text style={styles.compatLine}><Text style={styles.bold}>Ponto forte de vocês:</Text> {compat.forte}</Text>
              <Text style={styles.compatLine}><Text style={styles.bold}>Um cuidado especial:</Text> {compat.cuidado}</Text>
              {!!desejo && (
                <Text style={[styles.compatLine, styles.mutedText]}>
                  E a energia de vocês agora — "{desejo}" — combina com esse momento. 💛
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sol · Lua · Ascendente</Text>
              {lunaA && lunaB ? (
                <>
                  <Text style={styles.compatLineCenter}>
                    <Text style={styles.bold}>{voce}</Text>: a Lua em {lunaA.name} {MOON_NEED[lunaA.element]}.
                  </Text>
                  <Text style={styles.compatLineCenter}>
                    <Text style={styles.bold}>{amor}</Text>: a Lua em {lunaB.name} {MOON_NEED[lunaB.element]}.
                  </Text>
                  <Text style={styles.compatLineCenter}>
                    {lunaA.element === lunaB.element
                      ? 'As Luas de vocês pedem a mesma coisa: se acalmam de forma parecida — aí está um refúgio de vocês.'
                      : 'As Luas de vocês pedem coisas diferentes: é dali que nascem quase todos os mal-entendidos… e também a saída.'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.compatLineCenter}>
                    <Text style={styles.bold}>{voce}</Text> — ☉ {signoVoce}{lunaA ? ` · ☽ ${lunaA.name}` : ''}
                  </Text>
                  <Text style={styles.compatLineCenter}>
                    <Text style={styles.bold}>{amor}</Text> — ☉ {signoAmor}{lunaB ? ` · ☽ ${lunaB.name}` : ''}
                  </Text>
                </>
              )}
              {ascA && ascB ? (
                <>
                  <Text style={styles.compatLineCenter}>
                    <Text style={styles.bold}>{voce}</Text>: Ascendente em {ascA.name} {ascA.emoji}.
                  </Text>
                  <Text style={styles.compatLineCenter}>
                    <Text style={styles.bold}>{amor}</Text>: Ascendente em {ascB.name} {ascB.emoji}.
                  </Text>
                  <Text style={styles.disclaimerCenter}>
                    O Ascendente usa a hora exata e a cidade de nascimento de cada um — quanto mais precisas essas informações, mais confiável o resultado. Pequena diferença de horário pode mudar o signo do Ascendente.
                  </Text>
                </>
              ) : (
                <Text style={styles.disclaimerCenter}>
                  O Ascendente — a primeira impressão que vocês passam e a couraça que usam sob pressão — se calcula com a hora e a cidade de nascimento. É uma das partes que se abrem dentro do app.
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>As cartas de vocês</Text>
              {cartas.map((name, i) => {
                const c = CARDS.find((x) => x.name === name);
                const rotulo = ['Passado', 'Presente', 'Futuro'][i] || '';
                return (
                  <Text key={name} style={styles.compatLineCenter}>
                    <Text style={styles.badgeInline}>{rotulo}</Text> {c.emoji} <Text style={styles.bold}>{c.name}</Text> — {c.meaning}
                  </Text>
                );
              })}
            </View>

            <View style={[styles.card, { alignItems: 'center' }]}>
              <Text style={styles.badge}>✷ {frequenciaFor(`${voce}${amor}${signoVoce}${signoAmor}`)} ✷</Text>
              <Text style={styles.overline}>Números cósmicos do casal</Text>
              <Text style={styles.cosmicNumbers}>
                {cosmicNumbers(`${voce}${amor}${signoVoce}${signoAmor}`, 3).join(' · ')}
              </Text>
              <Text style={styles.mutedCenter}>
                ✷ Hora dourada de vocês: {horaDourada(`${voce}${amor}${signoVoce}${signoAmor}`)} ✷
              </Text>
              <Text style={styles.disclaimerCenter}>
                Leitura de {voce} & {amor} — feita hoje. Ninguém escolheu isso por vocês: vocês começaram isso, hoje, juntos. O que vem depois se escreve com o que vocês fizerem a partir daqui.
              </Text>
            </View>

            <View style={[styles.card, styles.cardAccent]}>
              <Text style={styles.cardAccentTitle}>Essa foi a leitura de hoje 💫</Text>
              <Text style={styles.mutedCenter}>
                O mapa astral completo do casal — com mais camadas sobre como vocês se comunicam e se aproximam — continua se construindo agora, no painel de vocês.
              </Text>
              <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={finalizarQuiz} disabled={saving}>
                <Text style={styles.btnText}>{saving ? t('quiz.nav.saving') : t('quiz.nav.saveAndSee')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.navRow, { paddingBottom: insets.bottom + 12 }]}>
        {step > 1 ? (
          <TouchableOpacity style={styles.btnGhost} onPress={handleBack}>
            <Text style={styles.btnGhostText}>Voltar</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
        {step < TOTAL && (
          <TouchableOpacity style={styles.btn} onPress={handleContinuar}>
            <Text style={styles.btnText}>{step === 4 ? t('quiz.nav.seeReveal') : t('quiz.nav.continue')}</Text>
          </TouchableOpacity>
        )}
      </View>
      {!!aviso && <Text style={styles.aviso}>{aviso}</Text>}

      <DatePickerModal
        visible={!!datePickerFor}
        initialDate={datePickerFor === 'voce' ? nascVoce : nascAmor}
        onClose={() => setDatePickerFor(null)}
        onConfirm={(dateStr) => {
          if (datePickerFor === 'voce') onNascVoceChange(dateStr);
          else onNascAmorChange(dateStr);
        }}
      />

      <CityPickerModal
        visible={!!cityPickerFor}
        hasSelection={!!(cityPickerFor === 'voce' ? cidadeVoce : cidadeAmor)}
        onClose={() => setCityPickerFor(null)}
        onSelect={(city) => {
          if (cityPickerFor === 'voce') setCidadeVoce(city);
          else setCidadeAmor(city);
          setCityPickerFor(null);
        }}
        onClear={() => {
          if (cityPickerFor === 'voce') setCidadeVoce(null);
          else setCidadeAmor(null);
          setCityPickerFor(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loaderRoot: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  loaderOrb: { fontSize: 40, color: colors.accent, marginBottom: 18 },
  loaderText: { color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center', minHeight: 26 },
  loaderTrack: { width: 240, height: 4, borderRadius: 2, backgroundColor: colors.border, marginTop: 18, overflow: 'hidden' },
  loaderFill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },

  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surfaceElevated,
    borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center',
  },
  stepDotDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepDotNow: { borderColor: colors.accent, borderWidth: 2 },
  stepDotText: { color: colors.text, fontSize: 11, fontWeight: '700' },
  stepBar: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 4, maxWidth: 26 },
  stepBarDone: { backgroundColor: colors.accent },

  buildStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingBottom: 8 },
  chip: { backgroundColor: colors.surfaceElevated, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },

  // Sem isso, o ScrollView não fica limitado à altura disponível na tela — no
  // React Native Web ele pode simplesmente crescer com o conteúdo em vez de
  // rolar internamente, empurrando o navRow (fixo, fora do ScrollView) pra fora
  // da área visível. Fica mais visível no passo 4 (Cartas), quando o buildStrip
  // já acumulou o maior número de chips (nomes, 2 signos, energia) de todos os passos.
  // minHeight: 0 é o pedaço que faltava: no CSS flexbox (react-native-web), um
  // filho flex:1 não encolhe abaixo do tamanho do seu próprio conteúdo por
  // padrão (min-height:auto do browser) — ele empurra os irmãos/a página
  // inteira em vez de ativar o scroll interno. Sem isso, e como o Expo
  // desativa o scroll da página (body{overflow:hidden}, ver expo-reset no
  // index.html), não sobra nenhum jeito de rolar quando o conteúdo é alto o
  // bastante — como no passo 5 (Astros), que empilha 6 blocos de conteúdo.
  scrollFlex: { flex: 1, minHeight: 0 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },

  hero: { alignItems: 'center', marginBottom: 20 },
  heroEyebrow: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  heroStar: { fontSize: 34, color: colors.gold, marginVertical: 8 },
  heroTitle: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  heroGold: { color: colors.gold, fontSize: 18, fontStyle: 'italic', marginTop: 2 },
  heroSub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 10, maxWidth: 340 },

  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 16 },

  field: { marginBottom: 16 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 16,
  },
  mutedCenter: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 16, lineHeight: 19 },
  mutedText: { color: colors.textMuted, fontSize: 13 },

  dateBtn: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  dateBtnText: { color: colors.text, fontSize: 16 },
  dateBtnPlaceholder: { color: colors.textMuted },

  hourRow: { flexDirection: 'row', alignItems: 'center' },
  hourInput: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 16, width: 64, textAlign: 'center',
  },
  hourColon: { color: colors.textSecondary, fontSize: 18, marginHorizontal: 8 },

  signInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap' },
  signInfoStrong: { color: colors.gold, fontWeight: '700' },
  linkText: { color: colors.accent, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },

  signGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  signCell: {
    width: '30%', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
  },
  signCellSel: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  signCellEmoji: { fontSize: 20 },
  signCellName: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 2 },
  signCellRange: { color: colors.textMuted, fontSize: 10, marginTop: 1 },

  energyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  energyBtn: {
    width: '47%', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 4,
  },
  energyBtnSel: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  energyText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  energyTextSel: { color: colors.text },
  energyEcho: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 18, lineHeight: 20 },

  tarotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tarotCardWrap: { width: '31%', aspectRatio: 0.75, marginBottom: 12 },
  tarotCardDisabled: { opacity: 0.35 },
  tarotFace: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    backfaceVisibility: 'hidden', borderWidth: 1,
  },
  tarotBack: { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
  tarotBackGlyph: { color: colors.accent, fontSize: 26 },
  tarotFront: { backgroundColor: colors.card, borderColor: colors.accent, paddingHorizontal: 4 },
  tarotEmoji: { fontSize: 24 },
  tarotName: { color: colors.text, fontSize: 11, fontWeight: '700', marginTop: 4, textAlign: 'center' },

  tray: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  traySlot: {
    flex: 1, marginHorizontal: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surfaceElevated, paddingVertical: 12, alignItems: 'center',
  },
  traySlotFilled: { borderColor: colors.gold },
  trayLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  trayEmoji: { fontSize: 22, marginTop: 6 },

  revealEmojis: { fontSize: 44, textAlign: 'center', letterSpacing: 10, marginBottom: 4 },
  revealTitle: { color: colors.text, fontSize: 20, fontWeight: '800', fontStyle: 'italic', textAlign: 'center', marginBottom: 4 },
  revealForte: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 14, lineHeight: 20 },

  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 18, marginTop: 14, alignItems: 'stretch',
  },
  cardAccent: { borderColor: colors.gold, alignItems: 'center' },
  cardAccentTitle: { color: colors.gold, fontSize: 17, fontWeight: '800', fontStyle: 'italic', textAlign: 'center', marginBottom: 8 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 12 },

  pct: { color: colors.gold, fontSize: 42, fontWeight: '800', textAlign: 'center' },
  badge: {
    color: colors.accent, fontSize: 12, fontWeight: '700', textAlign: 'center',
    backgroundColor: colors.accent + '22', alignSelf: 'center', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  badgeInline: {
    color: colors.accent, fontSize: 11, fontWeight: '700',
    backgroundColor: colors.accent + '22', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8, lineHeight: 16 },
  disclaimerCenter: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 10, lineHeight: 16 },

  compatLine: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 8 },
  compatLineCenter: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 8, textAlign: 'center' },
  bold: { color: colors.text, fontWeight: '700' },

  overline: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 14 },
  cosmicNumbers: { color: colors.gold, fontSize: 28, fontWeight: '800', letterSpacing: 6, marginTop: 6, marginBottom: 12 },

  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 26, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  btnGhost: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
  aviso: { color: colors.gold, textAlign: 'center', fontSize: 13, paddingBottom: 12, paddingHorizontal: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  pickerRow: { flexDirection: 'row', height: ITEM_HEIGHT * 4 },
  pickerCol: { flex: 1 },
  pickerItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  pickerItemSel: { backgroundColor: colors.accent + '22', borderRadius: 10 },
  pickerItemText: { color: colors.textSecondary, fontSize: 16 },
  pickerItemTextSel: { color: colors.text, fontWeight: '800' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 10 },

  citySheet: { maxHeight: '75%' },
  cityList: { marginTop: 12, maxHeight: 320 },
  cityItem: {
    paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  cityItemText: { color: colors.text, fontSize: 15 },
});
