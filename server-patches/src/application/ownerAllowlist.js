// ALLOWLIST DE DONO/TESTADOR — acesso total ao app, de graça, para os e-mails
// listados na env var OWNER_EMAILS.
//
// ---------------------------------------------------------------------------
// PRA QUE SERVE
// ---------------------------------------------------------------------------
// O dono do produto precisa usar o app EXATAMENTE como um cliente pagante usa
// (paywall aberto, telas de casal liberadas, card de "já é assinante") sem
// comprar a própria assinatura. Hoje ele vê paywall — e vê CERTO: não existe
// assinatura pra esse e-mail no banco, e o app já resolve acesso pela CONTA
// (GET /api/subscription/me).
//
// O app tem um bypass parecido do lado do cliente (OWNER_EMAIL em
// context/CoupleContext.js), mas ele só cobre as 5 telas de casal do
// withFeatureGate — hasAccess, prévia grátis (lib/featureUsage.js) e a tela de
// Planos continuam vendo "não assinante". Esta allowlist resolve no servidor,
// que é a fonte autoritativa, e vale pra qualquer build (web, nativo, antigo).
//
// ---------------------------------------------------------------------------
// POR QUE NÃO UMA LINHA 'active' DE MENTIRA NO BANCO
// ---------------------------------------------------------------------------
// Uma assinatura falsa em `subscriptions` polui receita, funil e relatório para
// sempre, e vira dívida escondida: daqui a seis meses ninguém lembra que aquela
// linha não é venda. A allowlist é explícita, não inventa assinatura nenhuma,
// não escreve NADA no banco, não passa por webhook, e sai do ar apagando uma
// linha do .env.
//
// ---------------------------------------------------------------------------
// COMO LIGAR / DESLIGAR
// ---------------------------------------------------------------------------
//   ligar:     OWNER_EMAILS=sanches925@gmail.com          (linha no .env)
//   vários:    OWNER_EMAILS=dono@x.com,testador@y.com     (separado por vírgula)
//   desligar:  apagar a linha do .env (ou deixar OWNER_EMAILS=) e reiniciar
// Vale só no arranque do processo (`node --env-file=.env`), então toda mudança
// exige `pm2 restart forja-backend`. Passo a passo em ATIVAR-ALLOWLIST.txt.
//
// ---------------------------------------------------------------------------
// ⚠️ AVISO
// ---------------------------------------------------------------------------
// E-MAIL NESTA LISTA TEM ACESSO TOTAL AO PRODUTO, DE GRAÇA, ENQUANTO ESTIVER
// LISTADO. Não é desconto, não é trial: é o app inteiro liberado. Só coloque
// e-mail que você controla. Um e-mail listado por engano é um cliente pagante a
// menos, e ninguém vai notar porque ele não aparece em relatório nenhum.
//
// Trava de segurança: só casa com e-mail VERIFICADO vindo do token do Supabase
// (req.userEmail + isEmailVerified do payload). Se não fosse assim, qualquer um
// criaria uma conta com o e-mail do dono e ganharia o produto de graça — o
// vínculo por e-mail é a única via sem prova de posse (ver accountAuth.js).

const OWNER_ACCESS_SOURCE = "owner_allowlist";

// Só ASCII imprimível sem espaço. Existe por um motivo concreto, não por
// purismo: `toLowerCase()` do JS NÃO é uma função ASCII. Varrendo o Unicode
// inteiro (U+0080 até U+2FFFF) existe EXATAMENTE um caractere não-ASCII cujo
// minúsculo vira uma letra ASCII simples — o SINAL DE KELVIN U+212A:
//
//     "K".toLowerCase() === "k"   // true
//
// Ou seja: com uma entrada tipo `luKe@x.com` na lista, o endereço
// `lu<U+212A>e@x.com` — que é OUTRO endereço, registrável por outra pessoa —
// normalizaria pra `luke@x.com` e casaria com a allowlist. O e-mail de hoje
// (sanches925@gmail.com) não tem "k", então isso não é explorável agora; a
// linha abaixo é o que garante que continue não sendo quando alguém acrescentar
// um segundo e-mail de testador daqui a três meses sem lembrar deste detalhe.
//
// Homoglifos (а cirílico, ａ de largura fixa) já não casariam de qualquer jeito,
// mas cair fora aqui também é de graça. Entrada não-ASCII na lista é descartada
// (configuração estranha falha FECHADA) e e-mail não-ASCII no token nunca casa.
const ASCII_EMAIL_RE = /^[\x21-\x7e]+$/;

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isAsciiEmail(value) {
  return typeof value === "string" && ASCII_EMAIL_RE.test(value);
}

// Lê OWNER_EMAILS e devolve a lista normalizada (minúsculas, sem espaço, sem
// repetição). Aceita array também, pra teste.
//
// ARMADILHA CLÁSSICA que esta função existe pra matar: `"".split(",")` devolve
// `[""]` — uma lista de UM item vazio. Sem o filtro abaixo, `list.includes("")`
// daria true e QUALQUER requisição com e-mail vazio/ausente viraria dono. Por
// isso entrada vazia é descartada aqui, e ainda por cima isOwnerEmail() recusa
// e-mail vazio do outro lado (defesa dupla, de propósito).
//
// Entrada sem "@" também é descartada: assim "*", "all", "true" ou um comentário
// solto no .env NUNCA viram curinga — aqui não existe curinga, só igualdade
// exata. Configuração estranha falha FECHADA (ninguém entra), nunca aberta.
function parseOwnerEmails(raw) {
  const items = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  const list = [];
  for (const item of items) {
    // ASCII conferido no valor CRU, ANTES do toLowerCase() — conferir depois
    // não serviria de nada: o toLowerCase() já teria dobrado o U+212A em "k" e
    // a entrada passaria como ASCII limpinha (ver ASCII_EMAIL_RE).
    if (!isAsciiEmail(typeof item === "string" ? item.trim() : "")) continue;
    const email = normalizeEmail(item);
    if (!email) continue;
    if (!email.includes("@")) continue;
    if (!list.includes(email)) list.push(email);
  }
  return list;
}

// `emailVerified` é o resultado de isEmailVerified(req.authPayload), calculado
// na rota a partir do token JÁ verificado — nunca de body/query. Exigir === true
// (e não "truthy") faz o caso "quem chamou esqueceu de passar o flag" cair no
// lado seguro: sem acesso.
function isOwnerEmail({ email, emailVerified, allowlist }) {
  if (emailVerified !== true) return false;
  const list = Array.isArray(allowlist) ? allowlist : [];
  if (list.length === 0) return false; // lista vazia/ausente não libera ninguém
  // O e-mail CRU do token precisa ser ASCII: se ele tem caractere fora do ASCII,
  // recusa antes de normalizar. Sem isso o toLowerCase() poderia transformar um
  // endereço diferente no endereço da lista (SINAL DE KELVIN, ver ASCII_EMAIL_RE).
  if (!isAsciiEmail(typeof email === "string" ? email.trim() : "")) return false;
  const normalized = normalizeEmail(email);
  if (!normalized) return false; // e-mail vazio/nulo nunca casa com nada
  return list.includes(normalized);
}

// Log de UMA linha por e-mail por processo. Sem isso seriam ~288 linhas por dia
// por aparelho (o app rechecha o acesso a cada 5 min, CoupleContext.js).
const jaLogado = new Set();

function logOwnerAccessOnce(email) {
  const normalized = normalizeEmail(email);
  if (!normalized || jaLogado.has(normalized)) return;
  jaLogado.add(normalized);
  console.log(
    `[ownerAllowlist] acesso total concedido a ${normalized} por OWNER_EMAILS — NÃO é assinatura, não conta em receita.`
  );
}

// Aplica o acesso de dono SOBRE o resultado real da conta.
//
// É UNIÃO, nunca substituição: o que o banco disser continua ali (a lista de
// assinaturas sai inteira, o correlationCode continua sendo o real). Se o dono
// tiver uma assinatura de verdade um dia, os dados reais dela é que aparecem —
// a allowlist só garante que o acesso não pode ser negado. Nada escreve no banco.
//
// status/plan/scope/currentPeriodEnd são a exceção: só são herdados do resultado
// real quando ele JÁ concedia acesso — a REGRA DA HERANÇA, detalhada no fim
// deste comentário, logo acima da função.
//
// DECISÕES DE FORMATO (o app não pode precisar de nenhuma mudança — ver
// normalizeAccountPayload em lib/accountSubscription.js):
//
//   hasCoupleAccess: true — SIM, de propósito. As 5 telas exclusivas de casal
//     (Reconectar/Descobrir/Agir/Progresso/Retrospectiva) são gateadas por
//     hasCoupleAccess em components/FeatureGate.js; sem isso o dono liberaria
//     metade do produto e continuaria sem conseguir testar a outra metade, que
//     é justamente a mais cara de verificar. Não há risco de "entregar produto
//     não comprado" aqui: quem está na lista é o próprio dono.
//
//   currentPeriodEnd: null — não existe ciclo de cobrança, então não existe data
//     de renovação. Inventar uma data (2099, +30 dias) seria escrever ficção num
//     campo que a tela mostra ao usuário: PlanosScreen renderiza "renova em
//     DD/MM/AAAA" quando o campo vem preenchido. Com null a linha simplesmente
//     não aparece (formatarDataBR já trata null), e nenhum acesso depende dela —
//     hasAccess é decidido por status, nunca por data.
//
//   status 'active' / plan 'owner' — status precisa ser 'active' pra tela de
//     Planos mostrar o card de assinante em vez de reoferecer o checkout (é o
//     comportamento que o dono quer testar). plan 'owner' não é renderizado em
//     lugar nenhum (a lista de planos é estática) e deixa óbvio na resposta que
//     aquilo não é uma compra.
//
//   source 'owner_allowlist' + ownerAccess: true — a marca. O app ignora (ele
//     sobrescreve source com 'account'), mas em log, curl e depuração fica
//     escrito que aquele acesso não é receita.
//   REGRA DA HERANÇA — só herda o que o resultado real dizia QUANDO ele já
//     concedia acesso (base.hasAccess === true). Isso não é preciosismo: sem
//     essa condição a resposta sai internamente contraditória — hasAccess:true
//     junto de status:'pending'/'expired', que significa exatamente o contrário.
//     E o app LÊ esse par. PlanosScreen.js decide o card de assinante com
//
//         if (relevantAccess && subscriptionStatus && subscriptionStatus !== 'pending')
//
//     então status:'pending' derruba o card e a tela volta a oferecer o
//     checkout — justamente uma das três coisas que a allowlist promete.
//     Não é hipótese: `best` é a "melhor" linha da conta, e sem nenhuma linha
//     que conceda acesso a melhor é uma PENDENTE. O dono testando o funil de
//     compra com o próprio e-mail cria pendência com customer_email igual ao
//     login, o email_match do /me vincula ela na conta dele no mesmo instante,
//     e a partir daí ele fica com acesso liberado e a tela de Planos vendendo o
//     produto pra ele (o banco tem 17 pendências hoje, 3 com e-mail preenchido).
//     currentPeriodEnd também é zerado nesse caso: herdar a data de uma
//     assinatura EXPIRADA mostraria "renova em <data no passado>" na tela.
function applyOwnerAccess(account, email) {
  const base = account || {};
  logOwnerAccessOnce(email);
  const acessoReal = base.hasAccess === true;
  return {
    ...base,
    source: OWNER_ACCESS_SOURCE,
    ownerAccess: true,
    hasAccess: true,
    hasCoupleAccess: true,
    status: acessoReal ? base.status || "active" : "active",
    plan: acessoReal ? base.plan || "owner" : "owner",
    scope: acessoReal ? base.scope || "couple" : "couple",
    currentPeriodEnd: acessoReal ? base.currentPeriodEnd || null : null,
  };
}

module.exports = {
  OWNER_ACCESS_SOURCE,
  parseOwnerEmails,
  isOwnerEmail,
  applyOwnerAccess,
  normalizeEmail,
  isAsciiEmail,
};
