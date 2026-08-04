// O LEMBRETE DIÁRIO DO CHECK-IN — um Web Push por dia, só pra quem pediu.
//
// A ideia (04/08/2026): o check-in de um toque ("Como está seu coração hoje?")
// é o loop de retenção mais honesto do app — todo número que ele mostra é
// contagem de coisa real que a pessoa respondeu. Mas um loop diário que só
// existe quando alguém lembra de abrir o app não é um loop: é sorte. Este
// script é o toque no ombro, e nada além disso.
//
// SÓ QUEM PEDIU: a lista NÃO é "todo mundo com push ativo". É a tabela
// push_daily_reminder (migração 014), preenchida exclusivamente pelo toggle
// "Lembrete diário" que aparece DENTRO do bloco de check-in, e só depois do
// primeiro check-in da pessoa. Quem nunca ligou o toggle nunca recebe nada
// daqui — mesmo tendo push ativo pro pensamento do dia.
//
// NA LÍNGUA DA PESSOA: a marcação guarda o `lang` do app (pt/es/en), então o
// texto sai traduzido em vez de português pra todo mundo — que era o
// comportamento dos crons antigos (send-daily-push.js e companhia). O texto em
// si mora em src/infrastructure/checkinReminderContent.js, separado pra poder
// ser conferido por teste sem subir banco nem rede.
//
// O TEXTO CONVIDA, NUNCA PROMETE: sem promessa de resultado, sem linguagem de
// saúde/humor clínico, sem porcentagem inventada. É a mesma doutrina do resto
// do produto, e test/lembreteCheckin.test.js falha se alguém "melhorar" a copy.
//
// POR QUE CRON E NÃO SCHEDULER EM MEMÓRIA: mesma razão de
// scripts/gerar-cards-do-dia.js — "1x por dia" é exatamente o que o cron faz,
// e um script avulso que morre no fim não segura estado nem memória dentro do
// processo pm2 que precisa ficar de pé.
//
// FALHA NÃO FICA CALADA: qualquer envio que falhe por motivo que não seja
// "inscrição expirada" conta como falha e o processo sai com código != 0 — o
// cron registra o erro no log em vez de sumir com ele. Inscrição expirada
// (404/410) não é falha: é limpeza, e é feita na hora.
//
// USO:
//   node scripts/enviar-lembrete-checkin.js
//   node scripts/enviar-lembrete-checkin.js --seco   (não envia nada; só conta)
//
// CRONTAB (esta linha é do lead instalar, não deste script) —
// `crontab -e` no servidor, 09:00 no fuso do servidor:
//
//   0 9 * * * cd /root/forja-backend && /usr/bin/node scripts/enviar-lembrete-checkin.js >> /var/log/cosmic-lembrete-checkin.log 2>&1
//
const fs = require("node:fs");
const path = require("node:path");

const RAIZ = path.join(__dirname, "..");

// O .env na mão, sem depender do dotenv estar instalado (mesmo padrão de
// scripts/gerar-cards-do-dia.js — o script roda por cron, fora do bootstrap do
// servidor, então não herda o --env-file do `npm start`).
//
// Duas diferenças de propósito em relação ao gerar-cards: (1) arquivo ausente
// não derruba nada — quem já exporta VAPID_* no ambiente do cron não precisa de
// .env; (2) o que JÁ está em process.env vence o arquivo, senão um teste ou uma
// execução manual com variável na frente do comando seria silenciosamente
// sobrescrita pelo .env de produção.
const CAMINHO_ENV = path.join(RAIZ, ".env");
if (fs.existsSync(CAMINHO_ENV)) {
  for (const linha of fs.readFileSync(CAMINHO_ENV, "utf8").split("\n")) {
    const i = linha.indexOf("=");
    if (i <= 0 || linha.trim().startsWith("#")) continue;
    const chave = linha.slice(0, i).trim();
    if (process.env[chave] === undefined) process.env[chave] = linha.slice(i + 1).trim();
  }
}

const webpush = require("web-push");
const { DailyReminderRepository } = require("../src/infrastructure/DailyReminderRepository");
const { PushSubscriptionRepository } = require("../src/infrastructure/PushSubscriptionRepository");
const { isAllowedPushEndpoint } = require("../src/infrastructure/pushAllowlist");
const { textoDoLembrete } = require("../src/infrastructure/checkinReminderContent");

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "";

const SECO = process.argv.includes("--seco");

async function main() {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error("VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY não configurados");
  }
  webpush.setVapidDetails(VAPID_SUBJECT || "mailto:contato@cosmicguide.cloud", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const lembretes = new DailyReminderRepository();
  const inscricoes = new PushSubscriptionRepository();

  // Faxina primeiro: marcação cujo endpoint já saiu de push_subscriptions não
  // representa mais ninguém (pessoa desativou o push, limpou o navegador). O
  // JOIN abaixo já as ignoraria, mas sem apagar elas ficariam pra sempre.
  const orfaos = lembretes.removeOrphans();
  if (orfaos > 0) console.log(`[lembrete-checkin] ${orfaos} marcação(ões) órfã(s) removida(s)`);

  const todos = lembretes.allWithSubscription();
  // Revalidar a allowlist AQUI, e não só na rota, é o que fecha o SSRF
  // residual: a rota valida na entrada, mas um endpoint legado (salvo antes da
  // allowlist existir) continuaria recebendo sendNotification todo dia. Mesmo
  // achado real de auditoria que blindou send-daily-push.js (25/07/2026).
  const alvos = todos.filter((row) => isAllowedPushEndpoint(row.endpoint));
  const bloqueados = todos.length - alvos.length;
  console.log(
    `[lembrete-checkin] ${alvos.length} inscrição(ões) com lembrete ligado` +
      (bloqueados ? `, ${bloqueados} bloqueada(s) pela allowlist` : "") +
      (SECO ? " — modo seco, nada será enviado" : "")
  );

  let enviados = 0;
  let expirados = 0;
  let falhas = 0;

  for (const row of alvos) {
    const { title, body } = textoDoLembrete(row.lang);
    if (SECO) {
      console.log(`[lembrete-checkin] (seco) ${row.lang}: ${title}`);
      enviados++;
      continue;
    }

    const payload = JSON.stringify({ title, body });
    const inscricao = { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } };

    try {
      await webpush.sendNotification(inscricao, payload);
      enviados++;
    } catch (err) {
      // 404/410 = a inscrição não existe mais no navegador (desinstalou, limpou
      // dados). Não é falha: é limpeza — sai das DUAS tabelas pra não tentar de
      // novo amanhã nem deixar marcação órfã pra trás.
      if (err.statusCode === 404 || err.statusCode === 410) {
        inscricoes.remove(row.endpoint);
        lembretes.disable(row.endpoint);
        expirados++;
      } else {
        falhas++;
        console.error(
          `[lembrete-checkin] falha ao enviar (endpoint ${String(row.endpoint).slice(0, 40)}...): ${err.message}`
        );
      }
    }
  }

  console.log(
    `[lembrete-checkin] concluído: ${enviados} enviado(s), ${expirados} inscrição(ões) expirada(s) removida(s), ${falhas} falha(s).`
  );

  // Saída != 0 quando ALGUÉM que pediu não recebeu — o cron precisa distinguir
  // "ninguém tinha lembrete ligado hoje" (sucesso legítimo, 0 envios) de
  // "tentei e quebrou". Só o segundo caso é vermelho.
  if (falhas > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(`[lembrete-checkin] ERRO: ${e.message}`);
  process.exit(1);
});
