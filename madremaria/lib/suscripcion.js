// lib/suscripcion.js
// A fachada de assinatura do Fio Vermelho. Interface pública em espanhol,
// comentários em português.
//
// ===========================================================================
// LEIA ANTES DE MEXER — este arquivo é um STUB HONESTO, e é de propósito
// ===========================================================================
// A ASSINATURA (estaSuscrito / comprar / restaurar) já é a que o RevenueCat vai
// implementar depois. O CORPO não é: no v1 não existe cobrança nenhuma. Não há
// backend, não há webhook, não há SDK de loja instalado. Por isso:
//
//   NÃO INVENTAR FLUXO DE PAGAMENTO. Nada de tela de cartão, nada de "processando",
//   nada de sucesso simulado, nada de `estaSuscrito` virando true porque a pessoa
//   tocou no botão. Um fluxo falso que "funciona" na tela e não cobra nada é como
//   o app entrega acesso pago de graça hoje e quebra a conta de todo mundo no dia
//   em que o pagamento de verdade entrar.
//
//   NÃO SUBMETER ÀS LOJAS COM BOTÃO DE COMPRA MORTO. App Store (Guideline 2.1 /
//   3.1.1) e Google Play reprovam botão de assinatura que não abre uma compra
//   real — e reprovação por isso queima o histórico da conta de desenvolvedor.
//   O v1 é WEB e TESTFLIGHT INTERNO. Enquanto `comprar()` devolver
//   'sin-backend', o app NÃO vai para revisão pública com esse botão vivo.
//
// O QUE A TELA FAZ com {ok:false, motivo:'sin-backend'}: mostra "Pronto" (em
// breve) e segue. Não mostra erro vermelho — não quebrou nada, simplesmente
// ainda não abriu. E a linha de saída do paywall continua verdadeira: a leitura
// diária é grátis, com ou sem assinatura.
//
// QUANDO O WEBHOOK EXISTIR: só o CORPO destas três funções muda. `comprar` passa
// a chamar Purchases.purchasePackage e, no sucesso, grava a marca; `restaurar`
// passa a chamar Purchases.restorePurchases; `estaSuscrito` passa a olhar o
// customerInfo (com a marca local como cache offline). Nenhuma tela precisa ser
// tocada, porque a forma do retorno já é esta desde hoje.
// ===========================================================================

// Extensão explícita no import: o Metro do Expo resolve com ou sem ela, mas o
// `node --test` do `npm test` roda ESM de verdade e recusa caminho relativo sem
// extensão. Com '.js' o mesmo arquivo carrega nos dois.
import { leerSeguro } from './almacen.js';

// A chave é NUA de propósito: almacen.js aplica o prefixo 'hr.' sozinho.
// Nenhum chamador deste projeto escreve 'hr.' à mão.
const CLAVE = 'suscripcion';

// Único valor gravado que conta como assinatura ativa. Comparação exata, e não
// "qualquer string não vazia", porque um resto de escrita antiga ('false',
// 'null', '0', 'undefined') no disco não pode virar acesso pago por acidente.
const MARCA_ACTIVA = 'activa';

// O motivo é constante e público para que a tela case por igualdade em vez de
// comparar string solta, e para que o dia da troca seja um grep só.
export const MOTIVO_SIN_BACKEND = 'sin-backend';

// Os dois planos que o paywall desenha (textos.js: paywall.plan.mensual.* e
// paywall.plan.anual.*). Ficam aqui porque quem valida o plano é esta camada,
// não a tela — e porque o RevenueCat vai precisar mapear exatamente estes ids
// para os identificadores de produto das lojas.
export const PLANES = Object.freeze(['mensual', 'anual']);

/**
 * Está assinando?
 * @returns {Promise<boolean>} false por padrão. NUNCA lança — leerSeguro já
 *   engole a falha de disco, e qualquer valor inesperado (null, lixo, string de
 *   outra versão) cai no false. Portão fechado é o estado seguro: no pior caso
 *   a pessoa vê o paywall de novo; o inverso liberaria o mazo completo de graça.
 */
/* ===========================================================================
 * MODO ACESSO LIVRE — AGORA QUEM MANDA E O COSMIC (11/09/2026).
 *
 * Era `export const ACCESO_LIBRE = true` fixo aqui (decisao do dono, 01/09:
 * "dar acesso, mesmo tudo completo, depois eu vejo assinatura"). Dentro do
 * Cosmic Guide isso virou um SEGUNDO interruptor para a mesma pergunta, e o
 * dono recusou dois paywalls: o do Cosmic manda.
 *
 * Entao ACCESO_LIBRE passou a LER lib/paywallGlobal.js — o mesmo modulo folha
 * que context/CoupleContext.js do Cosmic le para decidir hasAccess. Um valor,
 * dois lados, um gesto para desligar.
 *
 * POR QUE UM MODULO FOLHA E NAO O CONTEXTO: estaSuscrito() e async e e chamada
 * de FORA do render (PlanoScreen:757, PerfilScreen:407, SintesisScreen:416,
 * AlbumScreen:376, TiradaScreen:225) — hook nao roda ali. E importar o contexto
 * arrastaria React, react-native e AsyncStorage para dentro de uma lib que o
 * `node --test` precisa carregar.
 *
 * O QUE NAO MUDOU: a FORMA do retorno. estaSuscrito() continua Promise<boolean>,
 * comprar()/restaurar() continuam {ok,motivo}. As 6 telas nao foram tocadas —
 * se a ponte trocasse o formato, o bug seria silencioso (tela renderizando
 * vazio, sem erro).
 *
 * O QUE CONFERIR NO DIA EM QUE VIRAR FALSE (em lib/paywallGlobal.js): o audio 11
 * volta a ser verdade ("o como se faz nao abre sozinho"), o paywall volta a
 * aparecer no funil, e o botao do ritual do dia da Madre passa a levar a um
 * OneTimeLock do Cosmic quando o ritual e Cafe (CoffeeScreen cobra por
 * featureUsage, 1 uso gratis vitalicio) — o texto do botao nao avisa isso hoje. */
import { TUDO_LIBERADO } from '../../lib/paywallGlobal.js';

export const ACCESO_LIBRE = TUDO_LIBERADO;

export async function estaSuscrito() {
  if (ACCESO_LIBRE) return true;
  const bruto = await leerSeguro(CLAVE);
  return bruto === MARCA_ACTIVA;
}

/**
 * Comprar um plano. No v1 não compra nada, e diz isso na cara.
 * @param {'mensual'|'anual'} plan
 * @returns {Promise<{ok: false, motivo: 'sin-backend', plan: string|null}>}
 *
 * Devolve `ok:false` SEMPRE, inclusive para um plano válido. O `plan` volta no
 * retorno (normalizado, ou null se não for um dos PLANES) só para a tela poder
 * dizer qual cartão foi tocado — não é confirmação de nada.
 *
 * É async e não síncrona de propósito: a versão com RevenueCat vai ser async, e
 * uma tela escrita hoje contra uma função síncrona quebraria naquele dia.
 */
export async function comprar(plan) {
  const normalizado = typeof plan === 'string' && PLANES.includes(plan) ? plan : null;
  return { ok: false, motivo: MOTIVO_SIN_BACKEND, plan: normalizado };
}

/**
 * Restaurar compra.
 * @returns {Promise<{ok: false, motivo: 'sin-backend'}>}
 *
 * Não lê o disco de propósito. Restaurar é perguntar À LOJA o que esta conta já
 * comprou; devolver `ok:true` porque existe uma marca local seria transformar um
 * arquivo do aparelho em comprovante de pagamento — exatamente o buraco que o
 * RevenueCat existe para fechar. Sem loja, não há o que restaurar.
 */
export async function restaurar() {
  return { ok: false, motivo: MOTIVO_SIN_BACKEND };
}

export default { estaSuscrito, comprar, restaurar, PLANES, MOTIVO_SIN_BACKEND };
