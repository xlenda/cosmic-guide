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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import CityPickerModal from '../components/CityPickerModal';
import {
  SIGNS,
  compatibility,
  cosmicNumbers,
  frequenciaFor,
  CARDS,
  moonSign,
  signoFromDate,
  ascendantSign,
} from '../lib/signs';
import { CHAVES_DE_TRADUCAO } from '../lib/synastry';
import { cityLabel } from '../lib/cities';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';
import { saveOnboardingIntent } from '../lib/onboardingPlan';
import ScratchRevealCard from '../components/ScratchRevealCard';

// Chaves de tradução (não os nomes exibidos) — a exibição real passa por
// t(STEPS[idx]) onde for mostrado; aqui só serve de key/índice estável.
const STEPS = ['quiz.step.voces', 'quiz.step.signoNascimento', 'quiz.step.energia', 'quiz.step.cartas', 'quiz.step.astros'];
const TOTAL = 5;

// Energias: o id é estável (estado/comparações); rótulo e eco exibidos passam
// por t() — o texto PT é o mesmo literal de antes, agora vindo do dicionário.
const ENERGIAS = [
  { id: 'romantica', labelKey: 'quiz.energy.option.romantica', echoKey: 'quiz.energy.echo.romantica' },
  { id: 'apaixonada', labelKey: 'quiz.energy.option.apaixonada', echoKey: 'quiz.energy.echo.apaixonada' },
  { id: 'poderosa', labelKey: 'quiz.energy.option.poderosa', echoKey: 'quiz.energy.echo.poderosa' },
  { id: 'reflexiva', labelKey: 'quiz.energy.option.reflexiva', echoKey: 'quiz.energy.echo.reflexiva' },
  { id: 'distantes', labelKey: 'quiz.energy.option.distantes', echoKey: 'quiz.energy.echo.distantes' },
  { id: 'conflito', labelKey: 'quiz.energy.option.conflito', echoKey: 'quiz.energy.echo.conflito' },
  { id: 'crise', labelKey: 'quiz.energy.option.crise', echoKey: 'quiz.energy.echo.crise' },
  { id: 'recomecando', labelKey: 'quiz.energy.option.recomecando', echoKey: 'quiz.energy.echo.recomecando' },
];

function energiaById(id) {
  return ENERGIAS.find((e) => e.id === id);
}

// Chaves de tradução por elemento — o valor PT é o mesmo texto do antigo
// MOON_NEED local (o MOON_NEED de lib/signs.js segue como gap conhecido).
const MOON_NEED_KEYS = {
  fogo: 'quiz.reveal.moonNeed.fogo',
  terra: 'quiz.reveal.moonNeed.terra',
  ar: 'quiz.reveal.moonNeed.ar',
  água: 'quiz.reveal.moonNeed.agua',
};

const MONTH_KEYS = [
  'quiz.datePicker.month.jan', 'quiz.datePicker.month.feb', 'quiz.datePicker.month.mar',
  'quiz.datePicker.month.apr', 'quiz.datePicker.month.may', 'quiz.datePicker.month.jun',
  'quiz.datePicker.month.jul', 'quiz.datePicker.month.aug', 'quiz.datePicker.month.sep',
  'quiz.datePicker.month.oct', 'quiz.datePicker.month.nov', 'quiz.datePicker.month.dec',
];
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
  const { t } = useLanguage();
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
          <Text style={styles.modalTitle}>{t('quiz.datePicker.title')}</Text>
          <View style={styles.pickerRow}>
            <PickerColumn data={days} selected={Math.min(day, maxDay)} onSelect={setDay} />
            <PickerColumn data={months} selected={month} onSelect={setMonth} renderLabel={(m) => t(MONTH_KEYS[m - 1])} />
            <PickerColumn data={years} selected={year} onSelect={setYear} />
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>{t('quiz.datePicker.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={confirm}>
              <Text style={styles.btnText}>{t('quiz.datePicker.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// A cópia local do CityPickerModal que existia aqui foi removida em
// 26/07/2026 e virou components/CityPickerModal.js (compartilhado com
// BirthChartScreen.js). Ela era uma bottom sheet com altura em porcentagem e
// lista com maxHeight/sem minHeight: ao abrir o teclado, a viewport encolhia e
// a lista colapsava pra 1-2 linhas — o usuário via só "São Paulo, SP — Brasil"
// e concluía que o app tinha uma cidade só. Ver o cabeçalho do componente novo
// para as medições.

export default function QuizScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { save } = useCouple();
  const { t, lang } = useLanguage();

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

  // "Começou o cadastro" também quando a pessoa cai DIRETO aqui, sem passar
  // pela tela de escolha: o deep link /quiz (linking em App.js), o card de
  // compatibilidade vazio da Home e o "convide seu par" dos teasers chegam
  // todos nesta tela. Sem isto o funil mostraria onboarding_done sem
  // onboarding_start pra essa gente. É o MESMO evento do OnboardingChoice e o
  // dedupe de lib/funnel.js (chave 'onboarding_start') garante um só por
  // execução, venha de onde vier.
  useEffect(() => {
    funnel.onboardingStart('couple');
  }, []);

  useEffect(() => {
    funnel.onboardingStep('couple', `step_${step}`, 'view');
  }, [step]);

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

  const compat = signoVoce && signoAmor ? compatibility(signoVoce, signoAmor, lang) : null;
  // 3º argumento = a cidade (mesma razão do 5º do Ascendente logo abaixo): sem
  // ele a hora informada era lida como UTC e a Lua natal saía no instante
  // errado — 5,15% dos nascimentos em São Paulo com o SIGNO lunar trocado.
  // Cidade nula (campo é opcional aqui) mantém o comportamento de sempre.
  const lunaA = moonSign(nascVoce, nascHoraVoce, cidadeVoce || undefined);
  const lunaB = moonSign(nascAmor, nascHoraAmor, cidadeAmor || undefined);
  // Ascendente só é calculado (nunca "chutado") quando hora real + cidade existem
  // pros dois — ascendantSign já devolve null sozinho se faltar hora ou cidade,
  // então cidadeVoce/cidadeAmor nulos (campo pulado) já bastam pra cair no teaser estático.
  // 5º argumento é a CIDADE INTEIRA (não `city.utcOffset`): lib/signs.js usa o
  // fuso IANA `city.timezone` quando existe — é o que acerta o Ascendente de
  // quem nasceu em horário de verão — e cai no `utcOffset` fixo de sempre
  // quando não existe. Mesma mudança de screens/BirthChartScreen.js.
  const ascA = ascendantSign(nascVoce, nascHoraVoce, cidadeVoce?.lat, cidadeVoce?.lon, cidadeVoce);
  const ascB = ascendantSign(nascAmor, nascHoraAmor, cidadeAmor?.lat, cidadeAmor?.lon, cidadeAmor);

  const canNext =
    (step === 1 && !!voce && !!amor) ||
    // `nascAmor` saiu do portão de propósito: a leitura de compatibilidade só
    // precisa dos NOMES dos signos, e o par pode chegar pelo SignGrid manual.
    // A data do parceiro continua sendo pedida — ela dá Lua e Ascendente dele —
    // mas como bônus, não como pedágio.
    (step === 2 && !!nascVoce && !!signoVoce && !!signoAmor) ||
    (step === 3 && !!desejo) ||
    (step === 4 && cartas.length === 3) ||
    step === 5;

  const faltamCartas = 3 - cartas.length;
  const AVISOS = {
    1: !voce ? t('quiz.aviso.needYourName') : !amor ? t('quiz.aviso.needPartnerName') : '',
    2: !nascVoce
      ? t('quiz.aviso.needBirthDate', { name: voce || t('quiz.fallback.voces') })
      : !signoVoce
      ? t('quiz.aviso.checkDates')
      : // O aviso do par aponta as DUAS saídas, em vez de só cobrar a data.
      !signoAmor
      ? t('quiz.aviso.needPartnerSign', { name: amor || t('quiz.fallback.seuAmor') })
      : '',
    3: !desejo ? t('quiz.aviso.chooseEnergy') : '',
    4:
      cartas.length < 3
        ? t(faltamCartas === 1 ? 'quiz.aviso.pickCards_one' : 'quiz.aviso.pickCards_other', { missing: faltamCartas })
        : '',
  };

  function avancar() {
    if (step === 4) {
      const msgs = [
        t('quiz.loading.readingSky', { voce, amor }),
        t('quiz.loading.crossing', { signoVoce, signoAmor }),
        t('quiz.loading.tracing'),
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
      setAviso(AVISOS[step] || t('quiz.aviso.fillStep'));
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
      setAviso(t('quiz.aviso.saveFailed'));
      return;
    }
    // Quem concluiu o fluxo de casal declarou um objetivo relacional de forma
    // inequívoca. Isso só ordena a Home; não altera a sinastria nem as cartas.
    await saveOnboardingIntent('love');
    // 3º degrau: perfil de CASAL salvo de verdade (só depois do ok — este
    // botão já reprovou 100% dos salvamentos web num bug real, ver
    // saveCoupleProfile em lib/coupleData.js; um evento disparado antes do ok
    // teria escondido exatamente esse tipo de falha do relatório).
    funnel.onboardingDone('couple');
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
              <Text style={styles.chipText}>{t(energiaById(desejo)?.labelKey)}</Text>
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
        {/* A ABERTURA numa faixa própria — é a "uma ideia por tela" do
            concorrente: a barra de passos já está no topo, e aqui embaixo dela
            só existe o convite. A faixa sangra pros lados (margem negativa
            contra o padding do ScrollView) porque troca de chão que não
            encosta na borda lê como card, não como seção. */}
        {step === 1 && (
          <FaixaCurva tom="ameixa" semente="quiz-abre" style={styles.faixaSangra} estiloCorpo={styles.faixaAbre}>
            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>{t('quiz.hero.eyebrow')}</Text>
              <Text style={styles.heroStar}>✴</Text>
              <Text style={styles.heroTitle}>{t('quiz.hero.title')}</Text>
              <Text style={styles.heroGold}>{t('quiz.hero.gold')}</Text>
              <ColunaLeitura centralizado>
                <Text style={styles.heroSub}>{t('quiz.hero.sub')}</Text>
              </ColunaLeitura>
            </View>
          </FaixaCurva>
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
            {!!voce.trim() && !!amor.trim() && (
              <View style={styles.answerEchoCard}>
                <Ionicons name="heart" size={18} color={colors.gold} />
                <Text style={styles.answerEchoText}>{t('quiz.names.echo', { voce: voce.trim(), amor: amor.trim() })}</Text>
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>{t('quiz.birth.title')}</Text>
            <Text style={styles.mutedCenter}>
              {t('quiz.birth.subtitle')}
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>{t('quiz.birth.dateOf', { name: voce || t('quiz.fallback.voce') })}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerFor('voce')}>
                <Text style={[styles.dateBtnText, !nascVoce && styles.dateBtnPlaceholder]}>
                  {nascVoce ? formatDateBR(nascVoce) : t('quiz.birth.selectDate')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t('quiz.birth.timeOf', { name: voce || t('quiz.fallback.voce') })}</Text>
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
              <Text style={styles.label}>{t('quiz.birth.cityOf', { name: voce || t('quiz.fallback.voce') })}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setCityPickerFor('voce')}>
                <Text style={[styles.dateBtnText, !cidadeVoce && styles.dateBtnPlaceholder]}>
                  {cidadeVoce ? cityLabel(cidadeVoce) : t('quiz.birth.selectCity')}
                </Text>
              </TouchableOpacity>
            </View>
            {!!signoVoce && (
              <View style={styles.signInfoRow}>
                <Text style={styles.mutedText}>
                  {t('quiz.birth.signOf', { name: voce })} <Text style={styles.signInfoStrong}>{signoVoce}</Text>
                </Text>
                <TouchableOpacity onPress={() => setSignoManualVoce((v) => !v)}>
                  <Text style={styles.linkText}>{signoManualVoce ? t('quiz.birth.hide') : t('quiz.birth.notThisSign')}</Text>
                </TouchableOpacity>
              </View>
            )}
            {signoManualVoce && <SignGrid current={signoVoce} onSelect={setSignoVoce} />}

            <View style={[styles.field, styles.fieldNovoBloco]}>
              <Text style={styles.label}>{t('quiz.birth.dateOf', { name: amor || t('quiz.fallback.seuAmor') })}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerFor('amor')}>
                <Text style={[styles.dateBtnText, !nascAmor && styles.dateBtnPlaceholder]}>
                  {nascAmor ? formatDateBR(nascAmor) : t('quiz.birth.selectDate')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>{t('quiz.birth.timeOf', { name: amor || t('quiz.fallback.seuAmor') })}</Text>
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
              <Text style={styles.label}>{t('quiz.birth.cityOf', { name: amor || t('quiz.fallback.seuAmor') })}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setCityPickerFor('amor')}>
                <Text style={[styles.dateBtnText, !cidadeAmor && styles.dateBtnPlaceholder]}>
                  {cidadeAmor ? cityLabel(cidadeAmor) : t('quiz.birth.selectCity')}
                </Text>
              </TouchableOpacity>
            </View>
            {/* A linha renderiza SEMPRE. Antes era `{!!signoAmor && ...}`, e
                como signoAmor só nasce da data do par, quem não sabia a data
                nunca via o link que abre o SignGrid — a saída só existia depois
                que já não era necessária. Sem signo ainda, o link vira "não sei
                a data"; com signo, continua sendo "não é esse o signo". */}
            <View style={styles.signInfoRow}>
              {!!signoAmor && (
                <Text style={styles.mutedText}>
                  {t('quiz.birth.signOf', { name: amor })} <Text style={styles.signInfoStrong}>{signoAmor}</Text>
                </Text>
              )}
              <TouchableOpacity onPress={() => setSignoManualAmor((v) => !v)}>
                <Text style={styles.linkText}>
                  {signoManualAmor
                    ? t('quiz.birth.hide')
                    : signoAmor
                    ? t('quiz.birth.notThisSign')
                    : t('quiz.birth.dontKnowDate')}
                </Text>
              </TouchableOpacity>
            </View>
            {signoManualAmor && <SignGrid current={signoAmor} onSelect={setSignoAmor} />}
            {!!compat && (
              <View style={styles.compatPreview}>
                <Text style={styles.compatPreviewKicker}>{t('quiz.birth.previewKicker')}</Text>
                <Text style={styles.compatPreviewTitle}>{t('quiz.birth.previewTitle', { voce, amor })}</Text>
                <Text style={styles.compatPreviewBody}>
                  {t('quiz.birth.previewBody', {
                    signA: signoVoce,
                    signB: signoAmor,
                    aspect: t(CHAVES_DE_TRADUCAO.aspecto[compat.familia]),
                  })}
                </Text>
              </View>
            )}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>{t('quiz.energy.title', { voce, amor })}</Text>
            <View style={styles.energyGrid}>
              {ENERGIAS.map((d) => {
                const sel = desejo === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.energyBtn, sel && styles.energyBtnSel]}
                    onPress={() => setDesejo(d.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.energyText, sel && styles.energyTextSel]}>{t(d.labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!!desejo && <Text style={styles.energyEcho}>{t(energiaById(desejo)?.echoKey)}</Text>}
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
                return (
                  <View
                    key={c.name}
                    style={[styles.tarotCardWrap, !flipped && disabled && styles.tarotCardDisabled]}
                  >
                    {flipped ? (
                      <View style={[styles.tarotFace, styles.tarotFront]}>
                        <Text style={styles.tarotEmoji}>{c.emoji}</Text>
                        <Text style={styles.tarotName}>{c.name}</Text>
                      </View>
                    ) : disabled ? (
                      <View style={[styles.tarotFace, styles.tarotBack]}>
                        <Text style={styles.tarotBackGlyph}>✷</Text>
                      </View>
                    ) : (
                      <ScratchRevealCard
                        revealed={false}
                        resetKey={c.name}
                        onReveal={() => {
                          funnel.scratchReveal('couple', `card_${cartas.length + 1}`);
                          toggleCarta(c.name);
                        }}
                        themeColor={colors.accent}
                        scratchLabel={t('tarot.scratch')}
                        tapLabel={t('tarot.scratch.tapAlternative')}
                        accessibilityLabel={t('tarot.scratch.a11y')}
                        style={styles.coupleScratchCard}
                      >
                        <View style={[styles.tarotFace, styles.tarotFront]}>
                          <Text style={styles.tarotEmoji}>{c.emoji}</Text>
                          <Text style={styles.tarotName}>{c.name}</Text>
                        </View>
                      </ScratchRevealCard>
                    )}
                  </View>
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
            {/* O REVELAR — a faixa violeta muda o chão no exato ponto em que a
                tela deixa de perguntar e passa a contar. É o único lugar do
                quiz onde a pessoa só lê, então é aqui que o espaço vale mais.
                A faixa SEMPRE tem conteúdo neste ramo (`compat` já é a
                condição do bloco), então não há estado vazio a proteger. */}
            <FaixaCurva tom="violeta" semente="quiz-revela" style={styles.faixaSangra}>
              <Text style={styles.revealEmojis}>{compat.emojiA} {compat.emojiB}</Text>
              <Text style={styles.revealTitle}>{compat.titulo}</Text>
              <Text style={styles.mutedCenter}>{t('quiz.reveal.energyOf', { voce, amor })}</Text>
            </FaixaCurva>

            {/* Aqui ficava "{pct}%" em 42px dourados, com o texto do ponto
                forte ramificando em >= 88 / >= 80 / resto. A porcentagem saiu do
                app inteiro (o porquê está no cabeçalho de lib/synastry.js): o
                que aparece agora é o ASPECTO — que é geometria conferível — e a
                categoria que a fonte dá a ele. O ponto forte não ramifica mais
                por faixa de nota porque não há mais nota: cada aspecto já traz
                o seu, escrito com os fatos daquele par. */}
            <View style={styles.card}>
              <Text style={styles.aspectName}>{t(CHAVES_DE_TRADUCAO.aspecto[compat.familia])}</Text>
              <Text style={styles.badge}>{t('quiz.reveal.aspectBadge')}</Text>
              <Text style={styles.disclaimer}>
                {compat.distancia === 0
                  ? t('quiz.reveal.aspectGeometrySame', {
                      categoria: t(CHAVES_DE_TRADUCAO.categoria[compat.categoriaId]),
                    })
                  : t('quiz.reveal.aspectGeometry', {
                      graus: compat.graus,
                      distancia: compat.distancia,
                      categoria: t(CHAVES_DE_TRADUCAO.categoria[compat.categoriaId]),
                    })}
              </Text>
              {/* `resumo`, e NÃO `forte`. A versão com porcentagem punha aqui
                  `strongHigh/strongMid/strongLow`, que embrulhavam `forte` num
                  prefixo diferente por faixa de nota ("Elementos que se
                  acendem: …"), então o `forte` repetido três linhas abaixo,
                  onde tem o rótulo "Ponto forte de vocês:", não lia como
                  repetição. Sem as faixas, os dois viraram o MESMO parágrafo
                  duas vezes na mesma tela. `resumo` é a linha que nomeia o par
                  e a figura — é o que a Home já usa neste lugar. */}
              <Text style={styles.revealForte}>{compat.resumo}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.badgeRow}>
                <Text style={styles.badge}>{t('quiz.reveal.elementBadge', { element: compat.elementoA })}</Text>
                <Text style={styles.badge}>{t('quiz.reveal.elementBadge', { element: compat.elementoB })}</Text>
              </View>
              <Text style={styles.compatLine}>{compat.texto}</Text>
              <Text style={styles.compatLine}><Text style={styles.bold}>{t('quiz.reveal.strongPointLabel')}</Text> {compat.forte}</Text>
              <Text style={styles.compatLine}><Text style={styles.bold}>{t('quiz.reveal.careLabel')}</Text> {compat.cuidado}</Text>
              {!!desejo && (
                <Text style={[styles.compatLine, styles.mutedText]}>
                  {t('quiz.reveal.energyNow', { desejo: t(energiaById(desejo)?.labelKey) })}
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('quiz.reveal.trioTitle')}</Text>
              {lunaA && lunaB ? (
                <>
                  <Text style={styles.compatLineCenter}>
                    <Text style={styles.bold}>{voce}</Text>{t('quiz.reveal.moonLine', { sign: lunaA.name, need: t(MOON_NEED_KEYS[lunaA.element]) })}
                  </Text>
                  <Text style={styles.compatLineCenter}>
                    <Text style={styles.bold}>{amor}</Text>{t('quiz.reveal.moonLine', { sign: lunaB.name, need: t(MOON_NEED_KEYS[lunaB.element]) })}
                  </Text>
                  <Text style={styles.compatLineCenter}>
                    {lunaA.element === lunaB.element
                      ? t('quiz.reveal.moonsSame')
                      : t('quiz.reveal.moonsDiff')}
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
                    <Text style={styles.bold}>{voce}</Text>{t('quiz.reveal.ascLine', { sign: ascA.name, emoji: ascA.emoji })}
                  </Text>
                  <Text style={styles.compatLineCenter}>
                    <Text style={styles.bold}>{amor}</Text>{t('quiz.reveal.ascLine', { sign: ascB.name, emoji: ascB.emoji })}
                  </Text>
                  <Text style={styles.disclaimerCenter}>
                    {t('quiz.reveal.ascPrecision')}
                  </Text>
                </>
              ) : (
                <Text style={styles.disclaimerCenter}>
                  {t('quiz.reveal.ascTeaser')}
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('quiz.reveal.cardsTitle')}</Text>
              {cartas.map((name, i) => {
                const c = CARDS.find((x) => x.name === name);
                const rotulo = [t('quiz.cards.position.past'), t('quiz.cards.position.present'), t('quiz.cards.position.future')][i] || '';
                return (
                  <Text key={name} style={styles.compatLineCenter}>
                    <Text style={styles.badgeInline}>{rotulo}</Text> {c.emoji} <Text style={styles.bold}>{c.name}</Text> — {c.meaning}
                  </Text>
                );
              })}
            </View>

            <View style={[styles.card, { alignItems: 'center' }]}>
              <Text style={styles.badge}>✷ {frequenciaFor(`${voce}${amor}${signoVoce}${signoAmor}`)} ✷</Text>
              <Text style={styles.overline}>{t('quiz.reveal.cosmicNumbers')}</Text>
              <Text style={styles.cosmicNumbers}>
                {cosmicNumbers(`${voce}${amor}${signoVoce}${signoAmor}`, 3).join(' · ')}
              </Text>
              <Text style={styles.mutedCenter}>
                {t('quiz.reveal.goldenHour', { time: horaDourada(`${voce}${amor}${signoVoce}${signoAmor}`) })}
              </Text>
              <Text style={styles.disclaimerCenter}>
                {t('quiz.reveal.readingFooter', { voce, amor })}
              </Text>
            </View>

            {/* O FECHO — faixa dourada, o acento quente do epílogo. É o chão
                que diz "a leitura acabou, o próximo passo é este". */}
            <FaixaCurva tom="dourado" semente="quiz-fecho" style={styles.faixaSangraTopo}>
              <View style={styles.fecho}>
                <Text style={styles.cardAccentTitle}>{t('quiz.reveal.todayTitle')}</Text>
                <ColunaLeitura centralizado>
                  <Text style={styles.mutedCenter}>
                    {t('quiz.reveal.todayText')}
                  </Text>
                </ColunaLeitura>
                <TouchableOpacity style={styles.btn} onPress={finalizarQuiz} disabled={saving}>
                  <Text style={styles.btnText}>{saving ? t('quiz.nav.saving') : t('quiz.nav.saveAndSee')}</Text>
                </TouchableOpacity>
              </View>
            </FaixaCurva>
          </View>
        )}
      </ScrollView>

      <View style={[styles.navRow, { paddingBottom: insets.bottom + 12 }]}>
        {step > 1 ? (
          <TouchableOpacity style={styles.btnGhost} onPress={handleBack}>
            <Text style={styles.btnGhostText}>{t('quiz.nav.back')}</Text>
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
        // A data/hora de quem está sendo preenchido vira o `at` da busca: cada
        // cidade já volta com o fuso resolvido pro instante do nascimento.
        birthDate={(cityPickerFor === 'voce' ? nascVoce : nascAmor) || null}
        birthTime={(cityPickerFor === 'voce' ? nascHoraVoce : nascHoraAmor) || null}
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
  loaderRoot: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: space.secao },
  // Glifo: dimensão de desenho, não degrau de leitura.
  loaderOrb: { fontSize: 40, color: colors.accent, marginBottom: space.entre },
  loaderText: { ...type.cartao, color: colors.text, textAlign: 'center', minHeight: 26 },
  loaderTrack: { width: 240, height: 4, borderRadius: 2, backgroundColor: colors.border, marginTop: space.entre, overflow: 'hidden' },
  loaderFill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },

  // A FAIXA SANGRA. O ScrollView tem padding horizontal (o conteúdo do quiz é
  // formulário e precisa dele), mas faixa que não encosta na borda da tela lê
  // como card gigante em vez de "mudou de assunto" — a margem negativa
  // devolve a largura inteira só pra ela.
  faixaSangra: { marginHorizontal: -space.tela },
  faixaSangraTopo: { marginHorizontal: -space.tela, marginTop: space.secao },
  // A barra de passos já fica logo acima com a sua folga: somar 'secao' aqui
  // abriria buraco entre ela e a abertura.
  faixaAbre: { paddingTop: space.bloco },

  // A BARRA DE PASSOS — a peça que o concorrente põe no topo de toda tela de
  // passo a passo, e que esta tela já tinha. Só ganhou respiro.
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: space.bloco, paddingHorizontal: space.entre },
  stepDot: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surfaceElevated,
    borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center',
  },
  stepDotDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepDotNow: { borderColor: colors.accent, borderWidth: 2 },
  stepDotText: { ...type.nota, color: colors.text },
  stepBar: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: space.grudado, maxWidth: 26 },
  stepBarDone: { backgroundColor: colors.accent },

  buildStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: space.junto, paddingHorizontal: space.tela, paddingBottom: space.junto },
  chip: { backgroundColor: colors.surfaceElevated, borderRadius: 12, paddingVertical: space.grudado, paddingHorizontal: space.dentro, borderWidth: 1, borderColor: colors.border },
  chipText: { ...type.nota, color: colors.textSecondary },

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
  // paddingBottom 140 e nao 24 (04/08/2026): no iPhone, a barra do Safari e a
  // pilula do navegador do WhatsApp cobrem ~100px do pe da pagina — o botao de
  // continuar do passo das cartas morava EXATAMENTE ali, e o relato real foi
  // "nao consigo ir pra baixo" no meio do lancamento. O respiro garante que o
  // ultimo elemento sempre tenha pra onde rolar ate ficar visivel. O numero
  // continua cru DE PROPOSITO: e altura de chrome de navegador medida, nao
  // degrau de leitura — nenhum degrau da escala descreve "a barra do Safari".
  scrollContent: { paddingHorizontal: space.tela, paddingBottom: 140, paddingTop: space.junto },

  hero: { alignItems: 'center' },
  heroEyebrow: { ...type.etiqueta, color: colors.accent, textTransform: 'uppercase' },
  heroStar: { fontSize: 34, color: colors.gold, marginVertical: space.bloco },
  heroTitle: { ...type.titulo, color: colors.text, textAlign: 'center' },
  heroGold: { ...type.secao, color: colors.gold, fontStyle: 'italic', marginTop: space.junto },
  heroSub: { ...type.corpo, color: colors.textSecondary, textAlign: 'center', marginTop: space.entre },

  // Título de passo: é hierarquia de tela, o peso aqui é legítimo.
  sectionTitle: { ...type.secao, color: colors.text, textAlign: 'center', marginBottom: space.entre },

  field: { marginBottom: space.entre },
  // O segundo par de campos (os do par) abre outro BLOCO de perguntas: o
  // degrau 'secao' e o que separa dois assuntos, nao dois campos.
  fieldNovoBloco: { marginTop: space.secao },
  // O rótulo se separa do campo por ESPAÇO, não por peso.
  label: { ...type.apoio, color: colors.textSecondary, marginBottom: space.junto },
  input: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: space.bloco, paddingVertical: space.dentro, color: colors.text, ...type.corpoCurto,
  },
  mutedCenter: { ...type.corpoCurto, color: colors.textMuted, textAlign: 'center', marginBottom: space.bloco },
  mutedText: { ...type.apoio, color: colors.textMuted },

  dateBtn: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: space.bloco, paddingVertical: space.dentro,
  },
  dateBtnText: { ...type.corpoCurto, color: colors.text },
  dateBtnPlaceholder: { color: colors.textMuted },

  hourRow: { flexDirection: 'row', alignItems: 'center' },
  hourInput: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: space.bloco, paddingVertical: space.dentro, color: colors.text,
    ...type.corpoCurto, width: 64, textAlign: 'center',
  },
  hourColon: { ...type.corpo, color: colors.textSecondary, marginHorizontal: space.junto },

  signInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.bloco, flexWrap: 'wrap' },
  // O signo resolvido se destaca pela COR (dourado), não por peso.
  signInfoStrong: { color: colors.gold },
  linkText: { ...type.apoio, color: colors.accent, textDecorationLine: 'underline' },

  signGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.junto, marginBottom: space.entre },
  signCell: {
    width: '30%', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingVertical: space.dentro, alignItems: 'center',
  },
  signCellSel: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  signCellEmoji: { fontSize: 20 },
  signCellName: { ...type.nota, color: colors.text, marginTop: space.grudado },
  signCellRange: { ...type.nota, color: colors.textMuted },

  energyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.dentro, justifyContent: 'space-between' },
  energyBtn: {
    width: '47%', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, paddingVertical: space.bloco, alignItems: 'center', marginBottom: space.grudado,
  },
  energyBtnSel: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  // A opção escolhida muda de COR e de BORDA, não de peso.
  energyText: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },
  energyTextSel: { color: colors.text },
  energyEcho: { ...type.corpo, color: colors.textSecondary, textAlign: 'center', marginTop: space.entre },
  answerEchoCard: {
    flexDirection: 'row', alignItems: 'center', gap: space.dentro, marginTop: space.bloco,
    backgroundColor: colors.gold + '12', borderWidth: 1, borderColor: colors.gold + '55',
    borderRadius: 14, padding: space.bloco,
  },
  answerEchoText: { ...type.corpoCurto, flex: 1, color: colors.textSecondary },
  compatPreview: {
    marginTop: space.entre, padding: space.bloco, borderRadius: 16,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent + '66',
  },
  compatPreviewKicker: { ...type.etiqueta, color: colors.gold, textTransform: 'uppercase' },
  compatPreviewTitle: { ...type.cartao, color: colors.text, marginTop: space.junto },
  compatPreviewBody: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.junto },

  tarotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tarotCardWrap: { width: '31%', aspectRatio: 0.75, marginBottom: space.dentro },
  coupleScratchCard: { width: '100%', height: '100%', borderRadius: 14 },
  tarotCardDisabled: { opacity: 0.35 },
  tarotFace: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    backfaceVisibility: 'hidden', borderWidth: 1,
  },
  tarotBack: { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
  tarotBackGlyph: { color: colors.accent, fontSize: 26 },
  tarotFront: { backgroundColor: colors.card, borderColor: colors.accent, paddingHorizontal: space.grudado },
  tarotEmoji: { fontSize: 24 },
  tarotName: { ...type.nota, color: colors.text, marginTop: space.grudado, textAlign: 'center' },

  tray: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.bloco },
  traySlot: {
    flex: 1, marginHorizontal: space.grudado, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surfaceElevated, paddingVertical: space.dentro, alignItems: 'center',
  },
  traySlotFilled: { borderColor: colors.gold },
  trayLabel: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  trayEmoji: { fontSize: 22, marginTop: space.junto },

  revealEmojis: { fontSize: 44, textAlign: 'center', letterSpacing: 10, marginBottom: space.grudado },
  revealTitle: { ...type.titulo, color: colors.text, fontStyle: 'italic', textAlign: 'center', marginBottom: space.junto },
  revealForte: { ...type.corpo, color: colors.textSecondary, textAlign: 'center', marginTop: space.bloco },

  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: space.bloco, marginTop: space.entre, alignItems: 'stretch',
  },
  cardAccent: { borderColor: colors.gold, alignItems: 'center' },
  fecho: { alignItems: 'center', gap: space.bloco },
  cardAccentTitle: { ...type.secao, color: colors.gold, fontStyle: 'italic', textAlign: 'center' },
  cardTitle: { ...type.cartao, color: colors.text, textAlign: 'center', marginBottom: space.bloco },

  // O nome do aspecto é o RESULTADO da tela — display é o degrau da primeira
  // dobra, e aqui ele é literalmente aquilo que a pessoa veio ver.
  aspectName: { ...type.display, color: colors.gold, textAlign: 'center' },
  badge: {
    ...type.etiqueta, color: colors.accent, textAlign: 'center',
    backgroundColor: colors.accent + '22', alignSelf: 'center', borderRadius: 10,
    paddingHorizontal: space.dentro, paddingVertical: space.grudado, marginTop: space.junto,
  },
  badgeInline: {
    ...type.nota, color: colors.accent,
    backgroundColor: colors.accent + '22', borderRadius: 8, paddingHorizontal: space.junto, paddingVertical: space.grudado,
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'center', gap: space.junto, marginBottom: space.bloco, flexWrap: 'wrap' },
  disclaimer: { ...type.nota, color: colors.textMuted, textAlign: 'center', marginTop: space.junto },
  disclaimerCenter: { ...type.nota, color: colors.textMuted, textAlign: 'center', marginTop: space.dentro },

  compatLine: { ...type.corpoCurto, color: colors.textSecondary, marginBottom: space.dentro },
  compatLineCenter: { ...type.corpoCurto, color: colors.textSecondary, marginBottom: space.dentro, textAlign: 'center' },
  // O nome dentro da frase: o destaque é a COR do texto principal contra o
  // secundário da linha. Sem peso — é o inline de dentro de parágrafo, o lugar
  // onde o negrito mais se espalhava.
  bold: { color: colors.text },

  overline: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase', marginTop: space.bloco },
  cosmicNumbers: { ...type.display, color: colors.gold, letterSpacing: 6, marginTop: space.junto, marginBottom: space.bloco },

  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.entre, paddingTop: space.dentro },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: space.bloco, paddingHorizontal: space.entre, alignItems: 'center' },
  btnText: { ...type.botao, color: '#fff' },
  btnGhost: { borderRadius: 14, paddingVertical: space.bloco, paddingHorizontal: space.entre, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { ...type.botao, color: colors.textSecondary },
  aviso: { ...type.apoio, color: colors.gold, textAlign: 'center', paddingBottom: space.dentro, paddingHorizontal: space.entre },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: space.entre },
  modalTitle: { ...type.cartao, color: colors.text, textAlign: 'center', marginBottom: space.bloco },
  pickerRow: { flexDirection: 'row', height: ITEM_HEIGHT * 4 },
  pickerCol: { flex: 1 },
  pickerItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  pickerItemSel: { backgroundColor: colors.accent + '22', borderRadius: 10 },
  pickerItemText: { ...type.corpoCurto, color: colors.textSecondary },
  pickerItemTextSel: { color: colors.text },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.bloco, gap: space.dentro },
  // citySheet/cityList/cityItem/cityItemText saíram daqui junto com o
  // CityPickerModal local (agora em components/CityPickerModal.js).
});
