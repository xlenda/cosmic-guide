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
// No nativo (loja) NÃO existe checkout externo: a política de Pagamentos do
// Google exige Google Play Billing pra conteúdo digital consumido no app.
// Até 19/08/2026 esta tela abria a Hotmart num navegador in-app — foi
// substituído por lib/purchases.js (RevenueCat). Enquanto a chave/produtos não
// estiverem configurados (LOJA_ATIVA=false), o nativo não mostra botão de
// assinar nenhum: o app entra grátis na loja e a venda liga por configuração.
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
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme';
import { CENAS } from '../lib/ilustracoes';
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
// Compra pela loja (Google Play Billing via RevenueCat) + o gate de
// configuração que decide se existe botão de assinar no nativo.
import { LOJA_ATIVA, carregarLoja, comprarPlano, restaurarCompras } from '../lib/purchases';

const HOTMART_CHECKOUT_ELEMENTS_SRC = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js';
// Link avulso de checkout por oferta (confirmado real pelo Lenda, 25/07/2026)
// — SÓ na web, e só como fallback de quando o Checkout Elements embutido
// falha. O nativo não toca nisto: app de loja não manda ninguém pagar fora
// (ver PlanosScreenNative e lib/purchases.js).
const HOTMART_PAY_URLS = {
  trial: 'https://pay.hotmart.com/W105128423R?off=aqwv9uci',
  quarterly: 'https://pay.hotmart.com/W105128423R?off=7b1wqipw',
  annual: 'https://pay.hotmart.com/W105128423R?off=lb6plj87',
};
const MOUNT_ID = 'hotmart-checkout-mount';

// Quem cobra muda com a VENDA CONFIGURADA, não com a plataforma: cobrança da
// Google Play só existe onde LOJA_ATIVA é true. Na primeira build publicada o
// gate está desligado e nada é vendido pela Play — dizer ali que a assinatura
// é comprada e cancelada na Play seria descrever uma cobrança que o binário
// não faz. Com o gate ligado, o texto cobre os dois casos (assinou aqui =
// Play; assinou pelo site e entrou com a conta = Hotmart).

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
// Traduzido (PT/ES/EN) em lib/i18n.js. Solo (sem coupleData) NÃO vê as cinco
// telas exclusivas de casal (Reconectar/Descobrir/Agir/Progresso-Retrospectiva/
// Linha do tempo): a assinatura solo não as desbloqueia — só formar casal
// desbloqueia (ver components/FeatureGate.js e OneTimeLock.js). É por isso que
// as duas listas existem, e é o que SOLO_BENEFIT_KEYS mantém verdadeiro.
// A lista do casal recebeu em 04/08/2026 o MESMO tratamento que a do solo já
// tinha (proposta 8 de design/propostas-copy.md). Ela era: trial, UM bullet com
// as nove leituras amontoadas numa vírgula só (a antiga chave de nº 2), as
// cinco telas de casal, e nenhuma razão para acreditar no fim.
//
// Agora a ordem é: trial → as nove leituras DESMONTADAS por desejo (as mesmas
// seis chaves que o solo usa, 'planos.benefit.solo.2..7' — uma fonte só de
// verdade, em vez de duas redações do mesmo fato) → as cinco telas exclusivas
// de casal → a chave de nº 8, que não é benefício e sim razão para acreditar,
// e por isso fecha. A de nº 2 foi APAGADA do dicionário junto, nos três
// idiomas, pra ninguém reencontrar o amontoado e achar que ainda vale.
const COUPLE_BENEFIT_KEYS = [
  'planos.benefit.1',
  ...[2, 3, 4, 5, 6, 7].map((n) => `planos.benefit.solo.${n}`),
  ...[3, 4, 5, 6, 7].map((n) => `planos.benefit.${n}`),
  'planos.benefit.8',
];
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

// ARITMÉTICA DOS SELOS (09/08/2026) — nenhum selo desta tela nasce de texto
// solto: tudo sai da conta feita AQUI, com os mesmos preços reais dos cards
// acima. Doutrina do app: economia inventada, âncora riscada e "-70%" de
// fantasia quebram o build — o que se mostra é só o que a divisão confirma.
//   · mensal cheio: US$ 5/mês (plano 'trial')
//   · trimestral:   US$ 10 ÷ 3  = US$ 3,33/mês → economia real de 33%
//   · anual:        US$ 20 ÷ 12 = US$ 1,67/mês → economia real de 67%
// Os textos "Economize 33%/67%" de planos.plan.*.badge são exatamente esses
// arredondamentos — a pílula só aparece se a conta continuar dando economia,
// então mudar um preço sem refazer o badge apaga a pílula em vez de mentir.
const PRECO_NUM = { trial: 5, quarterly: 10, annual: 20 };
const MESES_POR_CICLO = { trial: 1, quarterly: 3, annual: 12 };

function mensalEquivalente(planId) {
  return PRECO_NUM[planId] / MESES_POR_CICLO[planId];
}

// % de economia REAL do plano frente a pagar o mensal cheio o período todo.
// 0 quando não há economia — e 0 significa "sem pílula", nunca número forjado.
function economiaPct(planId) {
  const cheio = PRECO_NUM.trial;
  const equivalente = mensalEquivalente(planId);
  if (!(equivalente < cheio)) return 0;
  return Math.round((1 - equivalente / cheio) * 100);
}

// O selo "MELHOR VALOR" só existe se houver um plano comprovadamente mais
// barato por mês que o mensal (hoje: anual, US$ 20 < 12 × US$ 5 = US$ 60).
// Se os preços mudarem e nenhum plano economizar de verdade, MELHOR_VALOR_ID
// vira null e o selo some sozinho — sem selo é melhor que selo falso.
const MELHOR_VALOR_ID = (() => {
  let melhor = null;
  for (const p of PLANS) {
    if (economiaPct(p.id) > 0 && (melhor === null || mensalEquivalente(p.id) < mensalEquivalente(melhor))) {
      melhor = p.id;
    }
  }
  return melhor;
})();

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

// REDESENHO PREMIUM (09/08/2026) — os 3 cards deixaram de ser colunas magras
// lado a lado (preço 18px espremido em ~100px de largura) e viraram fileiras
// empilhadas com hierarquia de verdade: rótulo + detalhe à esquerda, preço
// grande (28/800) com o ciclo embaixo à direita — a diagramação do concorrente
// premium, SEM as fraudes dele (nenhuma âncora riscada, nenhum contador). O
// plano que a aritmética de MELHOR_VALOR_ID confirma ganha borda dourada e o
// selo "MELHOR VALOR"; a pílula de economia reusa o texto real de
// planos.plan.*.badge e só aparece quando economiaPct() > 0. Comportamento
// intacto: mesmo funnel.planSelect, mesma seleção, mesmas chaves i18n.
// `precos` (só no nativo) troca o preço do site pelo priceString que a Google
// Play devolve — moeda e valor locais, exatamente o que vai ser cobrado. Com
// ele, DUAS coisas mudam por honestidade, não por estilo:
//   · a lista mostra só os planos que a loja realmente oferece (um produto
//     ainda não publicado sumiria do checkout e viraria toque no vazio);
//   · os selos de economia somem, porque a aritmética de economiaPct é feita
//     sobre os preços do site (PRECO_NUM) e não sobre o que a Play cobra —
//     manter "Economize 67%" ali seria número forjado, que é justamente o que
//     a doutrina desta tela proíbe.
function PlanPicker({ selected, onSelect, precos }) {
  const { t } = useLanguage();
  return (
    <View style={styles.planStack}>
      {(precos ? PLANS.filter((p) => precos[p.id]) : PLANS).map((plan) => {
        const isSelected = plan.id === selected;
        const destaque = !precos && plan.id === MELHOR_VALOR_ID;
        const badge = t(`planos.plan.${plan.id}.badge`);
        const hasBadge = !precos && badge && badge !== `planos.plan.${plan.id}.badge` && economiaPct(plan.id) > 0;
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
            style={[styles.planCard, destaque && styles.planCardDestaque, isSelected && styles.planCardSelected]}
          >
            {destaque && (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{t('planos.badge.bestValue')}</Text>
              </View>
            )}
            <View style={styles.planInfo}>
              <View style={styles.planLabelRow}>
                <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>{t(`planos.plan.${plan.id}.label`)}</Text>
                {hasBadge && (
                  <View style={styles.savePill}>
                    <Text style={styles.savePillText}>{badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planDetail}>{t(`planos.plan.${plan.id}.detail`)}</Text>
            </View>
            <View style={styles.planPriceCol}>
              <Text style={[styles.planPrice, isSelected && styles.planLabelSelected]}>{precos ? precos[plan.id].preco : plan.price}</Text>
              <Text style={styles.planCycle}>{t(`planos.plan.${plan.id}.cycle`)}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// TOPO CÊNICO (09/08/2026) — a cena do pack (lib/ilustracoes.js) sangrando as
// bordas no padrão das âncoras (Loja/Tarô/Sonhos): margens negativas anulam o
// padding:20 do content, a arte cola no header, e o LinearGradient funde o
// terço inferior no fundo. O título de desbloqueio (o MESMO texto de
// planos.unlockTitle/unlockTitleSolo que antes abria o card) pousa sobre o
// fade. Casal vê o casal ao pôr-do-sol (cena-onboarding); solo vê a cena de
// amor — decorativa nos dois casos (accessible=false), o texto é o título.
function HeroCena({ isCouple, title }) {
  return (
    <View style={styles.cenaWrap}>
      <Image source={isCouple ? CENAS.onboarding : CENAS.amor} style={styles.cenaImg} resizeMode="cover" accessible={false} />
      <LinearGradient colors={['transparent', colors.background]} style={styles.cenaFade} pointerEvents="none" />
      <Text style={styles.heroTitle}>{title}</Text>
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
      <Text style={styles.legalNote}>{t(LOJA_ATIVA ? 'planos.legal.billingNoteStore' : 'planos.legal.billingNote')}</Text>
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
        {/* Só no estado de oferta: com o checkout da Hotmart montado, a cena
            empurraria o formulário do cartão pra fora da dobra. */}
        {!aberto && (
          <HeroCena isCouple={isCouple} title={t(isCouple ? 'planos.unlockTitle' : 'planos.unlockTitleSolo')} />
        )}
        {!aberto && (
          <View style={styles.card}>
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
            {/* Rodapé de confiança do CTA — só afirma o que os Termos e o FAQ
                já garantem por escrito (cancelamento a qualquer momento na área
                de compras da Hotmart, acesso até o fim do período pago). */}
            <Text style={styles.trustNote}>{t('planos.trust')}</Text>
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

// Fluxo nativo (app de loja). NENHUM caminho daqui leva a pagamento externo:
// o checkout da Hotmart (Elements na web, navegador in-app no nativo até
// 19/08/2026) é conteúdo digital consumido dentro do app, e a política de
// Pagamentos do Google exige Google Play Billing pra isso. A compra agora é
// lib/purchases.js (RevenueCat sobre o Play Billing).
//
// UM caminho de código só, decidido por configuração:
//   · sem chave/produtos (LOJA_ATIVA=false) OU sem offering utilizável →
//     nenhum botão de assinar, nenhum preço, e um cartão que diz o que a
//     pessoa tem hoje (o app grátis continua inteiro; quem já assinou pelo
//     site entra com a conta e mantém o acesso, porque quem concede acesso é
//     o GET /api/subscription/me da conta — ver lib/accountSubscription.js,
//     que não tem nada de específico de plataforma).
//   · com configuração → o MESMO botão, agora comprando na Play, com o preço
//     que a própria Play devolve.
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
  // O QUE A TELA PODE AFIRMAR DEPOIS DE UMA COMPRA. Quem diz "você é
  // assinante" é o backend (GET /api/subscription/me, via refreshAccess); o
  // entitlement local do RevenueCat só prova que a Play cobrou. Entre a
  // cobrança e o webhook gravar a assinatura na conta existe uma janela em que
  // trocar a tela pelo cartão de assinante seria mentira na cara: a pessoa
  // leria "você é assinante" e NENHUMA tela paga abriria (o acesso vem da
  // conta, não do aparelho). Então aqui guardamos só o que de fato aconteceu,
  // e o cartão de assinante continua aparecendo pelo caminho de sempre
  // (relevantAccess + subscriptionStatus), quando o servidor confirmar.
  const [aviso, setAviso] = useState('');
  // Ofertas reais da loja: null = não há o que vender aqui (gate desligado,
  // produto ainda não publicado, ou a Play não respondeu). `lojaPronta` evita
  // o piscar entre "carregando" e o cartão de indisponível.
  const [loja, setLoja] = useState(null);
  const [lojaPronta, setLojaPronta] = useState(!LOJA_ATIVA);

  useFocusEffect(
    useCallback(() => {
      refreshAccess();
    }, [refreshAccess])
  );

  useEffect(() => {
    if (!LOJA_ATIVA) return undefined;
    let vivo = true;
    carregarLoja(user?.id)
      .then((p) => {
        if (!vivo) return;
        setLoja(p);
        // O plano padrão ('trial') pode não estar publicado na loja — cair no
        // primeiro que existe evita CTA apontando pra oferta inexistente.
        if (p) setSelectedPlan((atual) => (p[atual] ? atual : Object.keys(p)[0]));
      })
      // Falhar aqui não vira mensagem de erro: sem preço da loja a tela cai no
      // mesmo cartão de "ainda não dá pra assinar por aqui", que é verdade e
      // não é beco sem saída.
      .catch(() => {})
      .finally(() => vivo && setLojaPronta(true));
    return () => {
      vivo = false;
    };
  }, [user?.id]);

  const comprarNaLoja = useCallback(async () => {
    // Mesma regra da web: o token é a fonte da verdade sobre estar logado, e
    // sem ele a pessoa vai pro login levando o plano escolhido. Aqui ele vale
    // dobrado — é o `sub` da conta que vira o app_user_id do RevenueCat, e é
    // por ele que o backend liga a compra da Play a esta pessoa.
    const authToken = await getAuthToken();
    if (!authToken) {
      pedirLogin(navigation, selectedPlan);
      return;
    }
    // Plano vindo da rota (retomada do login) pode não existir na loja —
    // comprar "o primeiro disponível" seria vender uma coisa e cobrar outra.
    const oferta = loja?.[selectedPlan];
    if (!oferta) {
      setErro(t('planos.errorGeneric'));
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
      // Último degrau, equivalente nativo do .mount() da web: a folha de
      // pagamento da Play vai abrir. Antes do await pelo mesmo motivo de
      // sempre — o await só resolve quando a pessoa fecha a folha.
      funnel.checkoutOpen(selectedPlan);
      const compra = await comprarPlano(oferta.pkg);
      setCarregando(false);
      // Desistiu na folha da Play: não é erro, não mostra nada em vermelho.
      if (!compra) return;
      // ativo=false é caminho REAL de dinheiro, não bug: pagamento pendente,
      // aprovação de responsável no Android, entitlement ainda não propagado.
      // Ficar mudo aqui era o pior dos dois — a pessoa fechava a folha da Play
      // e a tela estava idêntica, sem uma palavra sobre o que aconteceu.
      setAviso(t(compra.ativo ? 'planos.store.confirmando' : 'planos.store.pagamentoPendente'));
      // O acesso das telas continua vindo da conta (webhook do RevenueCat ->
      // backend), então reconsulta em vez de assumir.
      refreshAccess();
    } catch (err) {
      setErro(t('planos.errorGeneric'));
      setCarregando(false);
      refreshAccess();
    }
  }, [loja, navigation, refreshAccess, selectedPlan, t]);

  // Reinstalou o app, trocou de aparelho ou limpou os dados: a Play guarda a
  // compra e sem isto a pessoa fica pagando sem acesso.
  const restaurar = useCallback(async () => {
    // Sem conta, restaurar não restaura nada de útil: o entitlement fica na
    // conta do Google Play e o acesso do app fica na CONTA — deslogado, o app
    // continuaria trancado inteiro. E sem appUserId o SDK restaura na
    // identidade anônima (ou na do dono anterior do aparelho), o que atribui a
    // compra à conta errada. Login SEM resume de propósito: quem tocou em
    // "restaurar" não pediu pra comprar, e o retomar-do-login abre a folha de
    // pagamento da Play.
    //
    // Variável com nome próprio ("logado") porque os freios chamados
    // authToken nesta tela são os DO CHECKOUT, um por versão, e o
    // test/paywallFunnelOrder.test.js casa cada um deles com o
    // funnel.checkoutClick que vem logo depois. Restaurar não é degrau do
    // funil de compra: um terceiro freio com o mesmo nome desalinharia esses
    // pares e o teste passaria a comparar coisas diferentes.
    const logado = await getAuthToken();
    if (!logado) {
      navigation.navigate(ROUTES.LOGIN, { returnTo: ROUTES.PLANOS });
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const r = await restaurarCompras(user?.id);
      if (r.ativo) setAviso(t('planos.store.confirmando'));
      else setErro(t('planos.store.restoreNone'));
      refreshAccess();
    } catch (err) {
      setErro(t('planos.errorGeneric'));
    }
    setCarregando(false);
  }, [navigation, refreshAccess, t, user?.id]);

  // Ver o mesmo bloco em PlanosScreenWeb — retomar a compra de quem acabou
  // de logar, sem repetir o toque, e sem retomar nada pra quem já assina nem
  // enquanto a loja não tiver oferta pra vender.
  const mostrandoAssinatura = !!(relevantAccess && subscriptionStatus && subscriptionStatus !== 'pending');
  const jaRetomou = useRef(false);
  useEffect(() => {
    if (jaRetomou.current || !route.params?.resume) return;
    if (authLoading || !user || mostrandoAssinatura || !loja) return;
    jaRetomou.current = true;
    comprarNaLoja();
  }, [route.params?.resume, authLoading, user, mostrandoAssinatura, loja, comprarNaLoja]);

  if (relevantAccess && subscriptionStatus && subscriptionStatus !== 'pending') {
    return (
      <SubscriptionStatusCard
        status={subscriptionStatus}
        currentPeriodEnd={currentPeriodEnd}
        onBack={() => navigation.goBack()}
      />
    );
  }

  // Só existe vitrine quando existe preço REAL da loja pra mostrar.
  const vendendo = LOJA_ATIVA && !!loja;

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('planos.header.title')}
        subtitle={t('planos.header.subtitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mesmo topo cênico da web — no nativo a compra abre na folha da
            Play, então a cena nunca disputa espaço com formulário. */}
        <HeroCena isCouple={isCouple} title={t(isCouple ? 'planos.unlockTitle' : 'planos.unlockTitleSolo')} />
        <View style={styles.card}>
          {!lojaPronta ? (
            <ActivityIndicator color={colors.accent} size="large" style={styles.nativeLoader} />
          ) : aviso ? (
            // A Play cobrou; a conta ainda não sabe. Nem afirma que a pessoa é
            // assinante (só o servidor pode dizer isso) nem reoferece o botão
            // de assinar pra quem acabou de pagar: diz o que está acontecendo e
            // sai da frente. Quando o refreshAccess (foco da tela / volta pro
            // app) trouxer o acesso, o return lá em cima troca isto pelo cartão
            // de assinante sozinho — não é beco sem saída.
            <>
              <Ionicons name="time-outline" size={36} color={colors.accent} />
              <Text style={styles.cardText}>{aviso}</Text>
            </>
          ) : vendendo ? (
            <>
              <PlanPicker selected={selectedPlan} onSelect={setSelectedPlan} precos={loja} />
              <BenefitsList isCouple={isCouple} />
              {carregando || authLoading ? (
                <ActivityIndicator color={colors.accent} size="large" style={styles.nativeLoader} />
              ) : (
                <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={comprarNaLoja}>
                  <Text style={styles.btnText}>{t(`planos.cta.${selectedPlan}`)}</Text>
                </TouchableOpacity>
              )}
              {/* Cancelamento e cobrança do jeito que valem numa loja. */}
              <Text style={styles.trustNote}>{t('planos.trustStore')}</Text>
              {/* Mesma nota da web: a conta é o passo seguinte, e a pessoa sabe
                  disso antes de tocar — depois de já ter visto preço e benefício. */}
              {!user && !authLoading && !carregando && (
                <Text style={styles.loginNote}>{t('planos.loginRequired.text')}</Text>
              )}
              {!carregando && (
                <TouchableOpacity onPress={restaurar} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
                  <Text style={styles.restoreLink}>{t('planos.store.restore')}</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // GATE: sem venda configurada, a tela não some nem vira beco — ela
            // diz o que a pessoa tem hoje e o caminho de quem já assinou.
            <>
              <Ionicons name="sparkles" size={36} color={colors.accent} />
              <Text style={styles.cardTitle}>{t('planos.store.soonTitle')}</Text>
              <Text style={styles.cardText}>{t('planos.store.soonText')}</Text>
              {!user && !authLoading && (
                <TouchableOpacity
                  style={styles.btn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate(ROUTES.LOGIN, { returnTo: ROUTES.PLANOS })}
                >
                  <Text style={styles.btnText}>{t('planos.store.loginCta')}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          {erro !== '' && <Text style={[styles.errorText, styles.nativeErrorSpacing]}>{erro}</Text>}
        </View>
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

  // TOPO CÊNICO — full-bleed no padrão das âncoras (Loja/Tarô): margens
  // negativas anulam o padding:20 do content, a arte cola no header e o fade
  // funde o terço inferior no fundo. O título pousa sobre o fade, com sombra
  // sutil pra continuar legível sobre qualquer trecho claro da arte.
  cenaWrap: { marginTop: -20, marginHorizontal: -20, marginBottom: 14 },
  cenaImg: { width: '100%', height: 180 },
  cenaFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64 },
  heroTitle: {
    position: 'absolute', left: 24, right: 24, bottom: 8,
    color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center',
    textShadowColor: 'rgba(14, 8, 33, 0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8,
  },

  // CARDS EMPILHADOS — fileiras com hierarquia: rótulo+detalhe à esquerda,
  // preço grande à direita. O destaque (MELHOR_VALOR_ID) tem borda dourada e
  // mais respiro; a seleção continua sendo a borda accent + fundo tingido, e
  // vem DEPOIS do destaque no array de estilos pra vencer quando os dois
  // coincidem no mesmo card.
  planStack: { alignSelf: 'stretch', marginTop: 16, gap: 10 },
  planCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 14, backgroundColor: colors.surfaceElevated,
  },
  planCardDestaque: { borderColor: colors.gold, paddingVertical: 18 },
  planCardSelected: { borderColor: colors.accent, backgroundColor: colors.accent + '18' },
  planBadge: {
    position: 'absolute', top: -10, right: 14, backgroundColor: colors.gold, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  planBadgeText: { color: '#2A1D00', fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  planInfo: { flex: 1 },
  planLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  planLabel: { color: colors.textSecondary, fontSize: 15, fontWeight: '800' },
  planLabelSelected: { color: colors.text },
  // Pílula de economia — o texto real de planos.plan.*.badge (33%/67%, a conta
  // verdadeira feita em economiaPct), agora inline em vez de selo flutuante,
  // porque o slot flutuante passou a ser do "MELHOR VALOR".
  savePill: {
    backgroundColor: colors.gold + '26', borderWidth: 1, borderColor: colors.gold + '66',
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1,
  },
  savePillText: { color: colors.gold, fontSize: 10, fontWeight: '800' },
  planPriceCol: { alignItems: 'flex-end' },
  planPrice: { color: colors.textSecondary, fontSize: 28, fontWeight: '800', lineHeight: 32 },
  planCycle: { color: colors.textMuted, fontSize: 11 },
  planDetail: { color: colors.gold, fontSize: 11, fontWeight: '700', marginTop: 4 },

  // Rodapé de confiança do CTA: menor e mais quieto que o botão, como a
  // loginNote — informa, não compete.
  trustNote: { color: colors.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 10 },
  // "Restaurar compras" — obrigatório num app de loja (reinstalou/trocou de
  // aparelho), e discreto de propósito: quem procura já sabe o que procura.
  restoreLink: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', textDecorationLine: 'underline', marginTop: 14 },
});
