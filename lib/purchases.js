// lib/purchases.js
// COBRANÇA DENTRO DA LOJA (Google Play Billing via RevenueCat).
//
// POR QUE ESTE ARQUIVO EXISTE: a política de Pagamentos do Google exige que
// conteúdo digital consumido dentro do app seja vendido por Google Play
// Billing. Até 19/08/2026 a versão nativa abria o checkout da Hotmart num
// navegador in-app (WebBrowser.openBrowserAsync em PlanosScreen.js) — isso é
// reprovação certa. Na WEB nada muda: lá o checkout da Hotmart continua sendo
// o único caminho, porque a loja não tem nada a ver com o site.
//
// O GATE (o ponto central): a venda nativa só existe se EXISTIR CONFIGURAÇÃO.
// Sem a chave pública do RevenueCat no build, LOJA_ATIVA é false, o botão de
// assinar simplesmente não é renderizado no Android e o app entra na Play
// grátis, sem risco de reprovar por vender de um jeito que não existe ainda.
// Quando o dono publicar os produtos e setar a chave, o mesmo caminho de
// código passa a vender sozinho — não há dois fluxos, só uma condição.
// Mesmo padrão já usado em lib/conversionTracking.js (EXPO_PUBLIC_* com
// fallback vazio = recurso desligado).
//
// PRÉ-REQUISITO DE BACKEND, e não é opcional: quem libera as telas do app é o
// GET /api/subscription/me (lib/accountSubscription.js), que hoje só conhece
// assinatura da Hotmart. Antes de setar a chave, o webhook do RevenueCat
// precisa gravar a assinatura no backend com o app_user_id — que é
// exatamente o `sub` do Supabase, porque é isso que passamos em configure().
// Sem esse passo a compra acontece e o app continua trancado.
import { Platform } from 'react-native';

// Chave PÚBLICA do SDK (não é segredo — ela vai no binário de qualquer jeito).
// iOS já entra aqui de graça: se um dia o app for pra App Store, a regra é a
// mesma e o gate já está pronto.
const RC_KEY =
  (Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_RC_IOS_KEY : process.env.EXPO_PUBLIC_RC_ANDROID_KEY) || '';

// Entitlement do RevenueCat que representa "tem acesso". Configurável porque
// é escolha de painel, não constante do produto.
const ENTITLEMENT = process.env.EXPO_PUBLIC_RC_ENTITLEMENT || 'premium';

// Plano da tela -> identificador do Package na offering. Os defaults são os
// identificadores padrão do RevenueCat ($rc_monthly/$rc_three_month/
// $rc_annual); quem montar a offering com nomes próprios sobrescreve por env
// sem tocar em código.
const PACOTE_DO_PLANO = {
  trial: process.env.EXPO_PUBLIC_RC_PACKAGE_TRIAL || '$rc_monthly',
  quarterly: process.env.EXPO_PUBLIC_RC_PACKAGE_QUARTERLY || '$rc_three_month',
  annual: process.env.EXPO_PUBLIC_RC_PACKAGE_ANNUAL || '$rc_annual',
};

// A ÚNICA pergunta que a tela faz: dá pra vender aqui? Sem checar plataforma:
// a web nunca chega neste arquivo — o Metro resolve lib/purchases.web.js lá
// (extensão de plataforma), e é isso que mantém o SDK fora do bundle web.
export const LOJA_ATIVA = !!RC_KEY;

// require e não import estático porque react-native-purchases monta um
// NativeEventEmitter no topo do módulo: importar cedo executaria isso na
// abertura do app, antes do gate. O que ele NÃO faz é proteger a web —
// require com string literal é resolvido estaticamente pelo Metro, então o
// SDK entrava no bundle web mesmo nunca sendo executado. Quem protege a web é
// lib/purchases.web.js.
function rc() {
  return require('react-native-purchases').default;
}

let configurado = false;

// appUserId = `sub` do Supabase. É a ponte entre a compra na Play e a conta:
// o webhook do RevenueCat chega no backend com esse mesmo id, e é assim que
// quem assina no Android é reconhecido em qualquer aparelho — e quem assinou
// na WEB continua entrando pelo caminho de sempre (a conta), sem passar por
// aqui.
async function configurar(appUserId) {
  const P = rc();
  if (!configurado) {
    P.configure({ apiKey: RC_KEY, appUserID: appUserId || null });
    configurado = true;
    return;
  }
  // Logou depois de a tela já ter configurado o SDK (anônimo): transfere a
  // identidade em vez de reconfigurar.
  if (appUserId) await P.logIn(appUserId);
}

// Ofertas reais da loja. Devolve { [planoId]: { preco, pkg } } ou null quando
// não há offering utilizável — e null é resposta legítima: sem preço vindo da
// Play a tela NÃO mostra preço nenhum. Anunciar US$ 5 e a Play cobrar outro
// valor é mentira na vitrine, e é assim que se reprova numa revisão.
export async function carregarLoja(appUserId) {
  if (!LOJA_ATIVA) return null;
  await configurar(appUserId);
  const offerings = await rc().getOfferings();
  const pacotes = offerings?.current?.availablePackages || [];
  const porPlano = {};
  for (const [plano, id] of Object.entries(PACOTE_DO_PLANO)) {
    const pkg = pacotes.find((p) => p.identifier === id);
    // Sem priceString não entra: a tela cairia no preço cravado do site
    // (US$ 5/10/20) enquanto a Play cobra outro valor em outra moeda — a
    // mentira na vitrine que este arquivo existe pra impedir.
    if (pkg?.product?.priceString) porPlano[plano] = { preco: pkg.product.priceString, pkg };
  }
  return Object.keys(porPlano).length ? porPlano : null;
}

function lerEntitlement(customerInfo) {
  const ent = customerInfo?.entitlements?.active?.[ENTITLEMENT];
  return { ativo: !!ent, expiraEm: ent?.expirationDate || null };
}

// Abre a folha de pagamento da Play. Devolve null quando a pessoa desistiu —
// desistir não é erro e não pode virar mensagem vermelha na tela.
export async function comprarPlano(pkg) {
  try {
    const { customerInfo } = await rc().purchasePackage(pkg);
    return lerEntitlement(customerInfo);
  } catch (err) {
    if (err?.userCancelled) return null;
    throw err;
  }
}

// Reinstalou, trocou de aparelho, ou comprou antes de criar conta: a Play
// guarda a compra, e sem este caminho a pessoa fica pagando sem acesso.
// appUserId pelo mesmo motivo de carregarLoja: sem ele o restore roda na
// identidade que estiver configurada no SDK — que num aparelho compartilhado
// (ou depois de trocar de conta) é a do dono ANTERIOR, e atribuir compra à
// conta errada é pior que não restaurar.
export async function restaurarCompras(appUserId) {
  await configurar(appUserId);
  return lerEntitlement(await rc().restorePurchases());
}
