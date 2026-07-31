// Checkout real (Hotmart), embutido nesta tela via Checkout Elements — o backend
// (api-forja) gera um correlationCode server-side; a assinatura só ativa de fato
// quando o webhook de pagamento chega (assíncrono), então esta tela nunca assume
// acesso liberado na hora — só reconsulta o servidor (refreshAccess) ao focar.
//
// Mirror quase 1:1 de gilfforever/web/app/(funil)/planos/page.js
// (cargarScriptHotmart/abrirCheckout) — a única diferença estrutural é o ponto de
// montagem: RN's View não aceita `id`, então usamos `nativeID`, que o
// react-native-web repassa como o atributo `id` do <div> real no DOM.
//
// No nativo (Platform.OS !== 'web'), o checkout embutido via Elements não é
// viável (é um script/DOM), então abrirCheckoutNativo abre o fallback Hotmart
// num navegador in-app (expo-web-browser) e anexa o xcod do correlationCode já
// criado por initiateCheckout(), pra manter a mesma correlação que o webhook
// (HotmartPaymentProvider.parseWebhookEvent) já sabe ler em data.purchase.origin.xcod.
//
// ORDEM DOS TOQUES — mudou em 29/07/2026. Antes, quem estava deslogado batia
// num cartão de cadeado (LoginRequiredCard) e NÃO VIA PREÇO NENHUM: criar
// conta, digitar e-mail e senha, sair do app pra confirmar o e-mail e voltar
// — tudo isso ANTES do primeiro número aparecer na tela. Nenhum outro ponto
// do app mostra o preço, então o visitante deslogado simplesmente nunca
// descobria quanto custava (~40 visitantes, ZERO checkouts iniciados; medido
// ao vivo no site publicado). Agora a oferta vem primeiro: qualquer pessoa vê
// os 3 planos, os preços e os benefícios sem conta nenhuma. A conta só é
// pedida no TOQUE DO CTA, porque é aí que o backend precisa do token/e-mail
// pra correlacionar o pagamento (ver initiateCheckout/initiateSoloCheckout) —
// e o retorno do login cai de volta no MESMO plano escolhido: pela rota
// (route.params.plan) no login por e-mail, e por lib/checkoutIntent.js no
// login com Google e na confirmação de e-mail, que recarregam a página
// inteira e fariam a pessoa reaparecer na Home, longe da oferta.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import { useCouple } from '../context/CoupleContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { initiateCheckout, initiateSoloCheckout } from '../lib/coupleData';
import { getAuthToken } from '../lib/accountSubscription';
import { trackInitiateCheckout } from '../lib/conversionTracking';
// Funil próprio (lib/funnel.js). Anda LADO A LADO com o trackInitiateCheckout
// acima, que continua exatamente como estava — aquilo é pro Meta Ads/GA4 no
// dia em que o dono configurar os IDs; isto grava no banco do próprio dono e
// funciona hoje, inclusive pra quem usa bloqueador de anúncio.
import { funnel } from '../lib/funnel';
// Plano escolhido sobrevive ao login que recarrega a página inteira (Google /
// confirmação de e-mail) — quem devolve a pessoa pra cá é o App.js.
import { saveCheckoutIntent, clearCheckoutIntent } from '../lib/checkoutIntent';
import GradientHeader from '../components/GradientHeader';

const HOTMART_CHECKOUT_ELEMENTS_SRC = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js';
// Link avulso de checkout por oferta (confirmado real pelo Lenda, 25/07/2026)
// — usado no fallback da web (quando o Checkout Elements embutido falha) e no
// fluxo nativo inteiro (que nunca usa Elements, é sempre um browser in-app).
// Antes só existia 1 link fixo (?bid=...) pro plano mensal; agora os 3 planos
// abrem o checkout certo em qualquer um dos dois casos.
const HOTMART_PAY_URLS = {
  trial: 'https://pay.hotmart.com/W105128423R?off=aqwv9uci',
  quarterly: 'https://pay.hotmart.com/W105128423R?off=7b1wqipw',
  annual: 'https://pay.hotmart.com/W105128423R?off=lb6plj87',
};
const MOUNT_ID = 'hotmart-checkout-mount';

function loadHotmartScript() {
  return new Promise((resolve, reject) => {
    if (window.checkoutElements) return resolve();
    // Se uma tentativa anterior falhou (rede instável), a tag <script> falha
    // continua no DOM — o browser não redispara load/error num script já
    // resolvido, então um retry que só reanexasse listeners nela nunca
    // resolveria nem rejeitaria de novo, travando "Preparando o checkout
    // seguro…" pra sempre (achado real de auditoria, 25/07/2026). Por isso
    // toda falha remove a tag: a próxima chamada sempre cria uma tag nova e
    // ganha eventos load/error de verdade.
    const existente = document.querySelector(`script[src="${HOTMART_CHECKOUT_ELEMENTS_SRC}"]`);
    if (existente) {
      existente.addEventListener('load', () => resolve());
      existente.addEventListener('error', () => {
        existente.remove();
        reject(new Error('script falhou'));
      });
      return;
    }
    const script = document.createElement('script');
    script.src = HOTMART_CHECKOUT_ELEMENTS_SRC;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error('script falhou'));
    };
    document.body.appendChild(script);
  });
}

// Mapeia o subscriptionStatus (snake_case, vem do backend) pra chave i18n
// (camelCase) — 'pending' nunca chega aqui porque quem chama já trata esse
// caso como "ainda oferecer o checkout".
const STATUS_I18N_KEY = {
  active: 'planos.status.active',
  past_due: 'planos.status.pastDue',
  pending: 'planos.status.pending',
  canceled: 'planos.status.canceled',
  expired: 'planos.status.expired',
};

// Parse simples de um ISO8601 (ex.: "2026-08-07T00:00:00.000Z") pra DD/MM/AAAA,
// sem lib nova. Retorna null se `iso` vier vazio/inválido.
function formatarDataBR(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// Lista real do que a assinatura libera — pedido explícito do Lenda pra
// deixar claro "tudo que ela vai poder usufruir" antes de assinar (21/07/2026).
// As 9 primeiras já são grátis (1 uso) sem assinatura; as 5 seguintes hoje
// também ganharam 1 uso grátis (ver components/FeatureGate.js) — a assinatura
// é o que torna TODAS elas ilimitadas, não a única forma de ver cada uma.
// Traduzido (PT/ES/EN) — chaves planos.benefit.1..7 em lib/i18n.js.
// Solo (sem coupleData) só vê os benefícios 1-2 (trial + as 9 leituras
// individuais) — os benefícios 3-7 são as 5 telas exclusivas de casal
// (Reconectar/Descobrir/Agir/Progresso-Retrospectiva/Linha do tempo), que a
// assinatura solo não desbloqueia (só formar casal desbloqueia, ver
// components/FeatureGate.js e OneTimeLock.js).
const COUPLE_BENEFIT_KEYS = [1, 2, 3, 4, 5, 6, 7].map((n) => `planos.benefit.${n}`);
// Solo tinha DUAS linhas, e a segunda amontoava as nove leituras separadas por
// vírgula — o olho lê isso como uma linha só, não como nove. As oito chaves
// próprias (bloco PLANOS_SOLO_I18N em lib/i18n.js) desmontam o amontoado em
// linhas agrupadas por desejo. A oitava não é benefício, é razão para
// acreditar, e por isso fica por último.
const SOLO_BENEFIT_KEYS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `planos.benefit.solo.${n}`);

function BenefitsList({ isCouple }) {
  const { t } = useLanguage();
  const keys = isCouple ? COUPLE_BENEFIT_KEYS : SOLO_BENEFIT_KEYS;
  return (
    <View style={styles.benefitsList}>
      {keys.map((key) => (
        <View key={key} style={styles.benefitRow}>
          <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
          <Text style={styles.benefitText}>{t(key)}</Text>
        </View>
      ))}
    </View>
  );
}

// As 3 ofertas reais já cadastradas no mesmo produto Hotmart (Forja del amor)
// — mesmas features pras 3, a diferença é só o compromisso/economia. Preço
// mensal efetivo calculado só pra deixar a economia óbvia (não é cobrado
// assim, é sempre cobrado no valor cheio a cada ciclo). Pedido explícito do
// Lenda: oferecer o benefício de cada plano e deixar a pessoa escolher antes
// de abrir o checkout (25/07/2026).
// Os 3 planos têm 7 dias grátis (confirmado no painel Hotmart) — por isso
// o detalhe de cada card sempre menciona o trial, não só o mensal. price é
// universal (US$ é o mesmo símbolo nos 3 idiomas) — só label/cycle/detail/
// badge são traduzidos via lib/i18n.js (planos.plan.<id>.*).
const PLANS = [
  { id: 'trial', price: 'US$ 5' },
  { id: 'quarterly', price: 'US$ 10' },
  { id: 'annual', price: 'US$ 20' },
];
const PLAN_IDS = PLANS.map((p) => p.id);
const PLANO_PADRAO = 'trial';

// Plano que a tela abre selecionado. Normalmente 'trial', mas quando a pessoa
// volta do login (route.params.plan, posto lá pelo LoginScreen ou pelo resgate
// da intenção no App.js) ela reencontra EXATAMENTE o plano que tinha
// escolhido. Id desconhecido/adulterado cai no padrão em vez de quebrar o
// checkout com uma oferta que não existe.
function usePlanoDaRota(route) {
  const planoDaRota = PLAN_IDS.includes(route?.params?.plan) ? route.params.plan : null;
  const [selectedPlan, setSelectedPlan] = useState(planoDaRota || PLANO_PADRAO);
  useEffect(() => {
    if (planoDaRota) setSelectedPlan(planoDaRota);
  }, [planoDaRota]);
  return [selectedPlan, setSelectedPlan];
}

// O toque no CTA estando deslogado. Guarda o plano nos DOIS lugares que
// importam, porque são dois caminhos de volta diferentes: nos params da rota
// (login por e-mail/senha, que volta pela pilha de navegação) e no storage
// (login com Google e confirmação de e-mail, que recarregam a página e são
// resgatados pelo App.js). Uma função só, usada pela web e pelo nativo.
//
// O 9º degrau do funil ("o app pediu login") é registrado pela própria
// LoginScreen no mount, com source 'planos' quando o motivo é este —
// registrar aqui também não somaria nada (o dedupe de lib/funnel.js é por
// nome de evento, então o segundo seria descartado de qualquer jeito).
function pedirLogin(navigation, plan) {
  saveCheckoutIntent(plan);
  navigation.navigate(ROUTES.LOGIN, {
    returnTo: ROUTES.PLANOS,
    returnParams: { plan, resume: true },
    reason: 'checkout',
  });
}

function PlanPicker({ selected, onSelect }) {
  const { t } = useLanguage();
  return (
    <View style={styles.planRow}>
      {PLANS.map((plan) => {
        const isSelected = plan.id === selected;
        const badge = t(`planos.plan.${plan.id}.badge`);
        const hasBadge = badge && badge !== `planos.plan.${plan.id}.badge`;
        return (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.85}
            // 8º degrau do funil: escolheu um plano. Aqui dentro do PlanPicker
            // (e não em cada tela) porque web e nativo compartilham este mesmo
            // componente — instrumentar nos dois lugares duplicaria o evento.
            // Dedupe por plano ('plan_select:annual'), então trocar de card
            // ida-e-volta não infla o número.
            onPress={() => {
              funnel.planSelect(plan.id);
              onSelect(plan.id);
            }}
            style={[styles.planCard, isSelected && styles.planCardSelected]}
          >
            {hasBadge && (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{badge}</Text>
              </View>
            )}
            <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>{t(`planos.plan.${plan.id}.label`)}</Text>
            <Text style={[styles.planPrice, isSelected && styles.planLabelSelected]}>{plan.price}</Text>
            <Text style={styles.planCycle}>{t(`planos.plan.${plan.id}.cycle`)}</Text>
            <Text style={styles.planDetail}>{t(`planos.plan.${plan.id}.detail`)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Reusado pela versão web e pela nativa: quem já é assinante nunca deve ver o
// botão de checkout de novo (esse era o bug original de reoferecer "Começar 7
// dias grátis" pra quem já paga) — por isso este card não tem CTA nenhum.
function SubscriptionStatusCard({ status, currentPeriodEnd, onBack }) {
  const { t } = useLanguage();
  const label = STATUS_I18N_KEY[status] ? t(STATUS_I18N_KEY[status]) : status;
  const dataRenovacao = formatarDataBR(currentPeriodEnd);
  return (
    <View style={styles.root}>
      <GradientHeader title={t('planos.header.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Ionicons name="checkmark-circle" size={40} color={colors.accent} />
          <Text style={styles.cardTitle}>{t('planos.alreadySubscriber')}</Text>
          <Text style={styles.cardText}>{t('planos.statusLine', { status: label })}</Text>
          {dataRenovacao && <Text style={styles.cardText}>{t('planos.renewsOn', { date: dataRenovacao })}</Text>}
        </View>
        {/* Também aqui, e não só no paywall: esta é a tela que o assinante abre
            por "Gerenciar assinatura" no Perfil — é o lugar mais provável do
            app pra alguém estar procurando como cancelar. */}
        <LegalFooter />
      </ScrollView>
    </View>
  );
}

// Rodapé legal do paywall. Três coisas que uma pessoa prestes a digitar o
// cartão precisa alcançar SEM sair da tela onde está digitando: os Termos, a
// Privacidade e um jeito de falar com alguém. As três telas já existiam — só
// não havia link nenhum pra elas daqui: pra ler os Termos antes de pagar era
// preciso abandonar o checkout, ir na aba Perfil e caçar o item na lista. Todo
// checkout que se leva a sério (e todo processador de pagamento, Hotmart
// inclusive) espera esse rodapé; a ausência dele é lida como "não sei quem
// está do outro lado" na hora exata em que a pessoa decide confiar ou não.
//
// A nota de cobrança acima dos links diz QUEM cobra e ONDE se cancela, porque
// era a dúvida que o app respondia errado em três telas até hoje (ver
// TermsScreen.js e o FAQ de HelpSupportScreen.js).
//
// Os destinos vivem no ProfileStack e esta tela vive no HomeStack, então o
// salto é o mesmo padrão já usado no app (getParent() sobe pro Tab.Navigator,
// igual ao "Fazer o quiz do casal" do HelpSupportScreen).
function LegalFooter() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const abrir = (screen) => navigation.getParent()?.navigate(ROUTES.PROFILE_TAB, { screen });
  return (
    <View style={styles.legalFooter}>
      <Text style={styles.legalNote}>{t('planos.legal.billingNote')}</Text>
      <View style={styles.legalLinks}>
        <TouchableOpacity onPress={() => abrir(ROUTES.TERMS)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
          <Text style={styles.legalLink}>{t('planos.legal.terms')}</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity onPress={() => abrir(ROUTES.PRIVACY)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
          <Text style={styles.legalLink}>{t('planos.legal.privacy')}</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity onPress={() => abrir(ROUTES.HELP_SUPPORT)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
          <Text style={styles.legalLink}>{t('planos.legal.support')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PlanosScreenWeb() {
  const navigation = useNavigation();
  const { coupleData, refreshAccess, hasAccess, hasCoupleAccess, subscriptionStatus, currentPeriodEnd } = useCouple();
  const isCouple = !!coupleData;
  // O que decide se ainda há algo a comprar AQUI: pra casal, só a assinatura
  // de CASAL conta (uma assinatura solo ativa não desbloqueia as telas de
  // casal — ver hasCoupleAccess em CoupleContext.js); pra solo, o hasAccess
  // combinado. Sem essa distinção, um assinante solo que formava casal caía
  // num beco sem saída: o teaser mandava "Assinar" pra desbloquear as telas
  // de casal, mas esta tela respondia "Você já é assinante" sem nenhum CTA —
  // impossível comprar o upgrade (achado real de auditoria adversarial,
  // confirmado ao vivo, 26/07/2026).
  const relevantAccess = isCouple ? hasCoupleAccess : hasAccess;
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const route = useRoute();
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [selectedPlan, setSelectedPlan] = usePlanoDaRota(route);
  // Resposta `alreadyActive: true` do backend — "essa conta já assina ESTE
  // escopo, não criei pendência nenhuma". Guardado em estado próprio pra tela
  // trocar pro cartão de assinante na hora, sem depender da corrida do
  // refreshAccess (que também é disparado, pra manter o contexto coerente).
  const [jaAssinante, setJaAssinante] = useState(null);

  const abrirCheckout = useCallback(async () => {
    // Token do Supabase: é ele que torna o /api/checkout/initiate IDEMPOTENTE
    // POR CONTA. Sem ele, cada toque em "Assinar" criava uma pendência nova E
    // repontava o aparelho pra ela — o laço que fazia o acesso de quem já
    // tinha pago sumir (26/07/2026, 4 checkouts). Buscado ANTES de tudo agora,
    // porque ele também é a resposta pra "essa pessoa está logada?": o `user`
    // do contexto pode estar hidratando, e mandar um assinante logado pro
    // login por causa dessa corrida seria pior que o bug que estamos tirando.
    const authToken = await getAuthToken();
    if (!authToken) {
      pedirLogin(navigation, selectedPlan);
      return;
    }
    // A intenção já cumpriu o papel dela (a pessoa está aqui, logada, abrindo
    // o checkout) — some daqui pra ninguém ser levado pra esta tela de novo na
    // próxima abertura do app.
    clearCheckoutIntent();

    // 11º degrau: clicou em assinar. DEPOIS do freio de login, nunca antes.
    // No relatório (server-patches/scripts/funil.js) este degrau vem ABAIXO de
    // login_view/login_done, então contar aqui o toque de quem está DESLOGADO
    // fazia duas coisas erradas de uma vez: inflava "Clicou em assinar" com
    // gente que só foi parar na tela de login, e — porque o dedupe é por plano
    // (`checkout_click:trial`) — DESCARTAVA o clique de verdade, o que de fato
    // chega no backend depois do login. O buraco checkout_click→checkout_open
    // passava a medir "desistiu no login" em vez de "clicou e o formulário não
    // abriu", que é justamente o número que esta tela existe pra vigiar.
    // Quem toca no CTA deslogado já é contado inteiro pelo login_view com
    // source 'planos' (registrado pela LoginScreen no mount).
    // Continua ANTES do initiateCheckout: se o backend falhar, o clique ainda
    // aparece no relatório e a perda fica visível.
    funnel.checkoutClick(selectedPlan);

    trackInitiateCheckout();
    setErro('');
    setCarregando(true);
    setAberto(true);
    try {
      const data = isCouple
        ? await initiateCheckout(coupleData?.voce, coupleData?.amor, user?.email, selectedPlan, authToken)
        : await initiateSoloCheckout(user?.email, selectedPlan, authToken);

      // Já assina: NÃO abre a Hotmart, não cobra de novo e não mexe no
      // ponteiro local (initiateCheckout já se recusa a sobrescrever quando
      // alreadyActive). Sem este ramo, `data.checkoutConfig.offerCode`
      // estouraria um TypeError e a pessoa veria só "erro genérico".
      if (data?.alreadyActive === true || !data?.checkoutConfig) {
        setCarregando(false);
        if (data?.alreadyActive === true) {
          setAberto(false);
          setJaAssinante({ status: data.status || 'active', currentPeriodEnd: data.currentPeriodEnd || null });
        } else {
          // Sem checkoutConfig e sem alreadyActive é resposta inesperada —
          // mantém `aberto` pra o card de erro (com o link de outra aba)
          // aparecer, em vez de voltar pro botão como se nada tivesse havido.
          setErro(t('planos.errorGeneric'));
        }
        refreshAccess();
        return;
      }

      await loadHotmartScript();
      window.checkoutElements
        .init('inlineCheckout', {
          offer: data.checkoutConfig.offerCode,
          xcod: data.checkoutConfig.xcod,
          ...(data.checkoutConfig.prefilledInfo || {}),
        })
        .mount(`#${MOUNT_ID}`);
      // 12º e último degrau: o checkout da Hotmart montou de fato na tela.
      // Depois do .mount() e não antes — a diferença entre checkout_click e
      // checkout_open é exatamente "quantos perdemos entre o clique e o
      // formulário aparecer" (script fora do ar, initiate falhando, etc.).
      funnel.checkoutOpen(selectedPlan);
      setCarregando(false);
    } catch (err) {
      setErro(t('planos.errorGeneric'));
      setCarregando(false);
    }
  }, [coupleData, isCouple, navigation, refreshAccess, user, selectedPlan, t]);

  const fecharCheckout = useCallback(() => {
    setAberto(false);
    setErro('');
  }, []);

  // A ativação real só chega pelo webhook do Hotmart, nunca na hora — então em
  // vez de assumir acesso liberado ao fechar o painel, só reconsultamos o
  // servidor sempre que a tela ganha foco de novo (voltar do checkout, etc.).
  useFocusEffect(
    useCallback(() => {
      refreshAccess();
    }, [refreshAccess])
  );

  // Quem já é assinante DO QUE ESTA TELA VENDE (trial, ativo, past_due,
  // cancelado, expirado) não tem mais nada pra comprar aqui — ver os returns
  // logo abaixo. Calculado antes porque o retomar-do-login também precisa
  // saber disso: sem esse freio, quem voltasse do login já assinante abriria
  // um checkout no ar só pra o backend responder "você já assina".
  const mostrandoAssinatura = !!jaAssinante || (relevantAccess && !!subscriptionStatus && subscriptionStatus !== 'pending');

  // Voltou do login com o plano escolhido na bagagem → abre o checkout na
  // hora, sem obrigar a pessoa a caçar o botão de novo (é o que ela já tinha
  // pedido antes de a conta ser exigida). Uma vez só por montagem: o ref
  // segura mesmo com o abrirCheckout mudando de identidade a cada render.
  const jaRetomou = useRef(false);
  useEffect(() => {
    if (jaRetomou.current || !route.params?.resume) return;
    if (authLoading || !user || mostrandoAssinatura) return;
    jaRetomou.current = true;
    abrirCheckout();
  }, [route.params?.resume, authLoading, user, mostrandoAssinatura, abrirCheckout]);

  // Quem já é assinante DO QUE ESTA TELA VENDE (trial, ativo, past_due,
  // cancelado, expirado) nunca deve ver o fluxo de checkout de novo — só
  // 'pending' (aguardando confirmação do webhook) ainda cai no fluxo normal
  // abaixo, porque nesse ponto o checkout pode não ter sido concluído de fato.
  // `jaAssinante` cobre o caso em que quem descobriu isso foi o próprio
  // backend, no toque em "Assinar" (alreadyActive) — antes do refreshAccess
  // voltar com a resposta nova.
  if (jaAssinante) {
    return (
      <SubscriptionStatusCard
        status={jaAssinante.status}
        currentPeriodEnd={jaAssinante.currentPeriodEnd}
        onBack={() => navigation.goBack()}
      />
    );
  }
  if (relevantAccess && subscriptionStatus && subscriptionStatus !== 'pending') {
    return (
      <SubscriptionStatusCard
        status={subscriptionStatus}
        currentPeriodEnd={currentPeriodEnd}
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('planos.header.title')}
        subtitle={t('planos.header.subtitle')}
        onBack={() => (aberto ? fecharCheckout() : navigation.goBack())}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!aberto && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t(isCouple ? 'planos.unlockTitle' : 'planos.unlockTitleSolo')}</Text>
            <PlanPicker selected={selectedPlan} onSelect={setSelectedPlan} />
            <BenefitsList isCouple={isCouple} />
            {/* Enquanto a sessão do Supabase não resolve, o botão vira spinner:
                clicar nesse meio-tempo mandaria pro login quem JÁ está logado. */}
            {authLoading ? (
              <ActivityIndicator color={colors.accent} size="large" style={styles.ctaLoader} />
            ) : (
              <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={abrirCheckout}>
                <Text style={styles.btnText}>{t(`planos.cta.${selectedPlan}`)}</Text>
              </TouchableOpacity>
            )}
            {/* Deslogado vê o preço primeiro e só depois a conta — mas fica
                sabendo do passo antes de tocar, em vez de ser surpreendido por
                um formulário de cadastro. */}
            {!user && !authLoading && (
              <Text style={styles.loginNote}>{t('planos.loginRequired.text')}</Text>
            )}
          </View>
        )}

        {aberto && carregando && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.centerText}>{t('planos.preparing')}</Text>
          </View>
        )}

        {aberto && erro !== '' && (
          <View style={styles.card}>
            <Text style={styles.errorText}>{erro}</Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(HOTMART_PAY_URLS[selectedPlan] || HOTMART_PAY_URLS.trial)}
            >
              <Text style={styles.btnGhostText}>{t('planos.openOtherTab')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ponto de montagem do Hotmart Checkout Elements. RN's View não aceita
            `id` — `nativeID` é o que react-native-web repassa como o atributo
            `id` do <div> real, exatamente o seletor que checkoutElements.mount()
            espera (#hotmart-checkout-mount, igual ao funil web). */}
        {aberto && (
          <View nativeID={MOUNT_ID} style={carregando ? styles.mountHidden : styles.mount} />
        )}

        {aberto && !carregando && (
          <TouchableOpacity style={styles.backLink} onPress={fecharCheckout}>
            <Text style={styles.backLinkText}>{t('planos.back')}</Text>
          </TouchableOpacity>
        )}

        {/* FORA do `!aberto`: fica visível também com o checkout da Hotmart
            montado logo acima — ou seja, na tela onde o cartão é digitado, que
            é justamente onde alguém procura os Termos antes de confirmar. */}
        <LegalFooter />
      </ScrollView>
    </View>
  );
}

// Fluxo nativo (iOS/Android da loja): o Hotmart Checkout Elements é um script
// carregado no DOM, então não roda aqui — em vez disso abrimos o link avulso
// da oferta escolhida (HOTMART_PAY_URLS[selectedPlan]) num navegador in-app
// via expo-web-browser, com o xcod do correlationCode já criado por
// initiateCheckout() anexado à URL, pra o webhook
// (HotmartPaymentProvider.parseWebhookEvent) conseguir correlacionar a compra
// a este casal do mesmo jeito que faz no funil web. Antes os 3 planos abriam
// o mesmo link fixo do mensal — corrigido com os links reais de cada oferta
// (confirmados pelo Lenda, 25/07/2026).
function PlanosScreenNative() {
  const navigation = useNavigation();
  const { coupleData, hasAccess, hasCoupleAccess, subscriptionStatus, currentPeriodEnd, refreshAccess } = useCouple();
  const isCouple = !!coupleData;
  // Mesma distinção da versão web (ver comentário em PlanosScreenWeb).
  const relevantAccess = isCouple ? hasCoupleAccess : hasAccess;
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const route = useRoute();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [selectedPlan, setSelectedPlan] = usePlanoDaRota(route);
  // Ver comentário do mesmo estado em PlanosScreenWeb.
  const [jaAssinante, setJaAssinante] = useState(null);

  useFocusEffect(
    useCallback(() => {
      refreshAccess();
    }, [refreshAccess])
  );

  const abrirCheckoutNativo = useCallback(async () => {
    // Mesma regra da web: o token é a fonte da verdade sobre estar logado, e
    // sem ele a pessoa vai pro login levando o plano escolhido.
    const authToken = await getAuthToken();
    if (!authToken) {
      pedirLogin(navigation, selectedPlan);
      return;
    }
    clearCheckoutIntent();

    // Mesmo degrau da versão web, pelo mesmo motivo (ver comentário lá): só
    // conta como "clicou em assinar" o toque de quem já tem conta — o toque de
    // quem está deslogado é o login_view com source 'planos'.
    funnel.checkoutClick(selectedPlan);

    trackInitiateCheckout();
    setErro('');
    setCarregando(true);
    try {
      const data = isCouple
        ? await initiateCheckout(coupleData?.voce, coupleData?.amor, user?.email, selectedPlan, authToken)
        : await initiateSoloCheckout(user?.email, selectedPlan, authToken);

      // Já assina: não abre navegador nenhum, não cobra de novo e o ponteiro
      // local fica onde está (ver initiateCheckout).
      if (data?.alreadyActive === true) {
        setCarregando(false);
        setJaAssinante({ status: data.status || 'active', currentPeriodEnd: data.currentPeriodEnd || null });
        refreshAccess();
        return;
      }

      const xcod = data?.checkoutConfig?.xcod;
      const baseUrl = HOTMART_PAY_URLS[selectedPlan] || HOTMART_PAY_URLS.trial;
      const url = xcod ? `${baseUrl}&xcod=${encodeURIComponent(xcod)}` : baseUrl;
      // Último degrau, equivalente nativo do .mount() da web: o navegador
      // in-app com a oferta vai abrir. Enfileirado ANTES do await porque
      // openBrowserAsync só resolve quando a pessoa FECHA o navegador — medir
      // depois transformaria "abriu o checkout" em "desistiu e voltou".
      funnel.checkoutOpen(selectedPlan);
      await WebBrowser.openBrowserAsync(url);
      setCarregando(false);
      // A ativação real só chega pelo webhook (assíncrono) — isso só reflete o
      // que já processou até agora, igual ao refreshAccess-no-foco da web.
      refreshAccess();
    } catch (err) {
      setErro(t('planos.errorGeneric'));
      setCarregando(false);
      refreshAccess();
    }
  }, [coupleData, isCouple, navigation, refreshAccess, user, selectedPlan, t]);

  // Ver o mesmo bloco em PlanosScreenWeb — retomar o checkout de quem acabou
  // de logar, sem repetir o toque, e sem retomar nada pra quem já assina.
  const mostrandoAssinatura = !!jaAssinante || (relevantAccess && !!subscriptionStatus && subscriptionStatus !== 'pending');
  const jaRetomou = useRef(false);
  useEffect(() => {
    if (jaRetomou.current || !route.params?.resume) return;
    if (authLoading || !user || mostrandoAssinatura) return;
    jaRetomou.current = true;
    abrirCheckoutNativo();
  }, [route.params?.resume, authLoading, user, mostrandoAssinatura, abrirCheckoutNativo]);

  if (jaAssinante) {
    return (
      <SubscriptionStatusCard
        status={jaAssinante.status}
        currentPeriodEnd={jaAssinante.currentPeriodEnd}
        onBack={() => navigation.goBack()}
      />
    );
  }
  if (relevantAccess && subscriptionStatus && subscriptionStatus !== 'pending') {
    return (
      <SubscriptionStatusCard
        status={subscriptionStatus}
        currentPeriodEnd={currentPeriodEnd}
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('planos.header.title')}
        subtitle={t('planos.header.subtitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t(isCouple ? 'planos.unlockTitle' : 'planos.unlockTitleSolo')}</Text>
          <PlanPicker selected={selectedPlan} onSelect={setSelectedPlan} />
          <BenefitsList isCouple={isCouple} />
          {carregando || authLoading ? (
            <ActivityIndicator color={colors.accent} size="large" style={styles.nativeLoader} />
          ) : (
            <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={abrirCheckoutNativo}>
              <Text style={styles.btnText}>{t(`planos.cta.${selectedPlan}`)}</Text>
            </TouchableOpacity>
          )}
          {/* Mesma nota da web: a conta é o passo seguinte, e a pessoa sabe
              disso antes de tocar — depois de já ter visto preço e benefício. */}
          {!user && !authLoading && !carregando && (
            <Text style={styles.loginNote}>{t('planos.loginRequired.text')}</Text>
          )}
          {erro !== '' && <Text style={[styles.errorText, styles.nativeErrorSpacing]}>{erro}</Text>}
        </View>
        {/* Mesmo rodapé da web — no nativo o checkout abre num navegador
            in-app, então esta é a última tela do app antes do cartão. */}
        <LegalFooter />
      </ScrollView>
    </View>
  );
}

// O cartão de cadeado que ficava aqui (LoginRequiredCard) foi REMOVIDO em
// 29/07/2026: ele era a primeira e única coisa que um visitante deslogado via
// nesta tela, sem preço, sem plano e sem benefício nenhum. A conta continua
// obrigatória pra assinar (é ela que liga a assinatura a uma pessoa
// recuperável, em vez de depender só do correlationCode gravado num aparelho
// que pode ser trocado ou limpo) — só que agora é pedida DEPOIS da oferta, no
// toque do CTA, por pedirLogin() logo acima.

export default function PlanosScreen() {
  // 7º degrau pelo caminho direto: abriu a tela de Planos (pelo teaser, pelo
  // card de marco de sequência, pela Espiada de Amanhã…). Fica AQUI, no
  // componente de cima, e não dentro de PlanosScreenWeb/Native: assim vale
  // pros dois. Efeito no mount — esta tela re-renderiza a cada refreshAccess
  // do foco, e o dedupe ('paywall_view:planos:Planos') cobre o resto.
  useEffect(() => {
    funnel.paywallView('planos', ROUTES.PLANOS);
  }, []);

  // Sem espera de sessão aqui: a oferta aparece na hora, logado ou não. Quem
  // depende de saber se há sessão é só o CTA (ver abrirCheckout), que resolve
  // isso no próprio toque.
  if (Platform.OS !== 'web') return <PlanosScreenNative />;
  return <PlanosScreenWeb />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, padding: 22, alignItems: 'center',
  },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  benefitsList: { alignSelf: 'stretch', marginTop: 16, gap: 10 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  benefitText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  cardText: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10 },
  errorText: { color: colors.gold, fontSize: 14, textAlign: 'center', fontWeight: '600' },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, marginTop: 18, alignSelf: 'stretch', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  center: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16 },
  centerText: { color: colors.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  mount: { minHeight: 480, marginTop: 16 },
  mountHidden: { minHeight: 0 },
  backLink: { alignItems: 'center', marginTop: 20 },
  backLinkText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  nativeLoader: { marginTop: 18 },
  nativeErrorSpacing: { marginTop: 14 },
  // Spinner ocupando o lugar exato do CTA enquanto a sessão resolve — mesma
  // altura de respiro do botão, pra o cartão não "pular" quando ele aparece.
  ctaLoader: { marginTop: 18, alignSelf: 'stretch' },
  // Nota discreta sob o CTA de quem está deslogado: menor e mais apagada que o
  // botão de propósito, ela informa o próximo passo sem competir com ele.
  loginNote: { color: colors.textMuted, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 12 },

  // Rodapé legal: presente e alcançável, mas discreto de propósito — quem
  // procura já sabe o que procura, e quem não procura não deve ser distraído
  // do CTA logo acima.
  legalFooter: { marginTop: 22, alignItems: 'center' },
  legalNote: { color: colors.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', paddingHorizontal: 8 },
  legalLinks: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 },
  legalLink: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline' },
  legalSep: { color: colors.textMuted, fontSize: 12 },

  planRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 16 },
  planCard: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', backgroundColor: colors.surfaceElevated,
  },
  planCardSelected: { borderColor: colors.accent, backgroundColor: colors.accent + '18' },
  planBadge: {
    position: 'absolute', top: -10, backgroundColor: colors.gold, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  planBadgeText: { color: '#2A1D00', fontSize: 9, fontWeight: '800' },
  planLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginTop: 6 },
  planLabelSelected: { color: colors.text },
  planPrice: { color: colors.textSecondary, fontSize: 18, fontWeight: '800', marginTop: 4 },
  planCycle: { color: colors.textMuted, fontSize: 11 },
  planDetail: { color: colors.gold, fontSize: 11, fontWeight: '700', marginTop: 6, textAlign: 'center' },
});
