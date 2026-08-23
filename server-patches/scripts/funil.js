// O relatório que RESPONDE A PERGUNTA: "as ~40 pessoas que entraram no app
// pararam ONDE?".
//
// Uso (no servidor, dentro de /root/forja-backend):
//   node scripts/funil.js              → últimos 7 dias
//   node scripts/funil.js --dias 30    → últimos 30 dias
//   node scripts/funil.js --ajuda
//
// Lê a tabela funnel_events (migração 010), alimentada por POST /api/track
// (src/http/trackRoutes.js). Sem dependência nova: só node + o better-sqlite3
// que o backend já usa.
//
// PRIVACIDADE: este relatório é CONTAGEM. Ele nunca imprime session_id, nunca
// imprime conteúdo (não existe conteúdo na tabela) e nunca cruza com conta,
// e-mail ou assinatura. É "quantas pessoas passaram por cada degrau", nada
// mais — que é exatamente o suficiente pra saber onde consertar o produto.
const { db } = require("../src/infrastructure/db");

// ---------------------------------------------------------------------------
// O FUNIL. A ordem aqui é a ordem dos degraus no relatório; os nomes têm que
// bater com a allowlist de src/http/trackRoutes.js (EVENTS). Se o app começar
// a mandar um evento novo que não esteja aqui, ele aparece no fim do relatório
// como "fora do funil" em vez de sumir em silêncio.
// ---------------------------------------------------------------------------
const FUNIL = [
  { event: "app_open", label: "Abriu o app" },
  { event: "onboarding_start", label: "Viu o onboarding (solo/casal)" },
  { event: "onboarding_done", label: "Concluiu o onboarding" },
  { event: "home_view", label: "Chegou na Home" },
  { event: "reading_start", label: "Pediu a 1ª leitura" },
  { event: "reading_done", label: "Recebeu a leitura" },
  { event: "paywall_view", label: "Bateu no paywall / Planos" },
  { event: "plan_select", label: "Escolheu um plano" },
  { event: "login_view", label: "Caiu na tela de login" },
  { event: "login_done", label: "Entrou na conta" },
  { event: "checkout_click", label: "Clicou em assinar" },
  { event: "checkout_open", label: "Checkout abriu" },
];

// Os dias do relatório são dias do BRASIL (UTC-3), não dias UTC — created_at é
// gravado em UTC, então uma sessão das 22h de terça cairia na quarta se o
// agrupamento fosse UTC cru, e o dono leria o gráfico errado.
const OFFSET_HORAS = Number.parseInt(process.env.TRACK_TZ_OFFSET_HOURS || "-3", 10) || -3;
const MODIFICADOR_TZ = `${OFFSET_HORAS >= 0 ? "+" : ""}${OFFSET_HORAS} hours`;

const cores = process.stdout.isTTY
  ? {
      reset: "\x1b[0m",
      neg: "\x1b[1m",
      dim: "\x1b[2m",
      ciano: "\x1b[36m",
      verde: "\x1b[32m",
      amarelo: "\x1b[33m",
      vermelho: "\x1b[31m",
      roxo: "\x1b[35m",
    }
  : new Proxy({}, { get: () => "" });

function parseArgs(argv) {
  let dias = 7;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--ajuda" || arg === "--help" || arg === "-h") return { ajuda: true };
    if (arg === "--dias" || arg === "-d") {
      const n = Number.parseInt(argv[i + 1], 10);
      if (!Number.isFinite(n) || n < 1 || n > 365) {
        return { erro: "--dias precisa ser um inteiro entre 1 e 365" };
      }
      dias = n;
      i++;
    } else if (arg.startsWith("--dias=")) {
      const n = Number.parseInt(arg.slice("--dias=".length), 10);
      if (!Number.isFinite(n) || n < 1 || n > 365) {
        return { erro: "--dias precisa ser um inteiro entre 1 e 365" };
      }
      dias = n;
    } else {
      return { erro: `argumento desconhecido: ${arg}` };
    }
  }
  return { dias };
}

// Início (em UTC) do dia LOCAL de N dias atrás — assim `--dias 7` são 7 dias de
// calendário fechados incluindo hoje, e não "168 horas atrás", que cortaria o
// dia mais antigo pela metade e faria a primeira barra parecer um tombo.
function inicioDoDiaLocalIso(diasAtras) {
  const deslocado = new Date(Date.now() + OFFSET_HORAS * 3600 * 1000);
  deslocado.setUTCHours(0, 0, 0, 0);
  deslocado.setUTCDate(deslocado.getUTCDate() - diasAtras);
  return new Date(deslocado.getTime() - OFFSET_HORAS * 3600 * 1000).toISOString();
}

function pct(parte, total) {
  if (!total) return 0;
  return (parte / total) * 100;
}

function fmtPct(valor) {
  return `${valor.toFixed(1)}%`.padStart(6);
}

function barra(valor, maximo, largura) {
  if (!maximo) return "";
  const cheios = Math.round((valor / maximo) * largura);
  return "█".repeat(Math.max(valor > 0 ? 1 : 0, cheios));
}

function linha(char = "─", n = 78) {
  return char.repeat(n);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.ajuda) {
    console.log("uso: node scripts/funil.js [--dias N]   (padrão: 7, máximo: 365)");
    return;
  }
  if (args.erro) {
    console.error(`erro: ${args.erro}`);
    process.exitCode = 1;
    return;
  }

  const dias = args.dias;
  const desde = inicioDoDiaLocalIso(dias - 1);

  let porEvento;
  let porDia;
  let totalSessoes;
  let porPasso = [];
  let porRaspagem = [];
  try {
    porEvento = db
      .prepare(
        `SELECT event, COUNT(DISTINCT session_id) AS sessoes, COUNT(*) AS eventos
         FROM funnel_events WHERE created_at >= ? GROUP BY event`
      )
      .all(desde);
    porDia = db
      .prepare(
        `SELECT strftime('%Y-%m-%d', created_at, ?) AS dia,
                COUNT(DISTINCT session_id) AS sessoes,
                COUNT(*) AS eventos
         FROM funnel_events WHERE created_at >= ?
         GROUP BY dia ORDER BY dia`
      )
      .all(MODIFICADOR_TZ, desde);
    totalSessoes = db
      .prepare("SELECT COUNT(DISTINCT session_id) AS c FROM funnel_events WHERE created_at >= ?")
      .get(desde).c;
    porPasso = db
      .prepare(
        `SELECT json_extract(props, '$.mode') AS mode,
                json_extract(props, '$.screen') AS step,
                json_extract(props, '$.source') AS action,
                COUNT(DISTINCT session_id) AS sessoes
         FROM funnel_events
         WHERE created_at >= ? AND event = 'onboarding_step'
         GROUP BY mode, step, action ORDER BY mode, MIN(created_at)`
      )
      .all(desde);
    porRaspagem = db
      .prepare(
        `SELECT json_extract(props, '$.kind') AS kind,
                json_extract(props, '$.screen') AS screen,
                COUNT(DISTINCT session_id) AS sessoes
         FROM funnel_events
         WHERE created_at >= ? AND event = 'scratch_reveal'
         GROUP BY kind, screen ORDER BY kind, screen`
      )
      .all(desde);
  } catch (err) {
    if (String(err.message).includes("no such table")) {
      console.error("A tabela funnel_events não existe — a migração 010 ainda não foi aplicada.");
      console.error("Ela roda sozinha na inicialização do backend: pm2 restart forja-backend");
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const sessoesPor = new Map(porEvento.map((r) => [r.event, r.sessoes]));
  const eventosPor = new Map(porEvento.map((r) => [r.event, r.eventos]));
  const totalEventos = porEvento.reduce((soma, r) => soma + r.eventos, 0);

  console.log("");
  console.log(`${cores.neg}${cores.roxo}FUNIL DO COSMIC GUIDE${cores.reset}  ${cores.dim}(últimos ${dias} dia(s), fuso UTC${OFFSET_HORAS})${cores.reset}`);
  console.log(`${cores.dim}desde ${desde} · ${totalSessoes} sessão(ões) anônima(s) · ${totalEventos} evento(s)${cores.reset}`);
  console.log(linha("═"));

  if (totalEventos === 0) {
    console.log("");
    console.log(`${cores.amarelo}Nenhum evento no período.${cores.reset}`);
    console.log("");
    console.log("Isso quase sempre significa uma destas três coisas:");
    console.log("  1. o app ainda não está chamando POST /api/track (lado do app não subiu);");
    console.log("  2. a linha de mount do trackRoutes.js não entrou no server.js;");
    console.log("  3. ninguém abriu o app no período (aí é problema de tráfego, não de funil).");
    console.log("");
    console.log(`Teste rápido do endpoint: ${cores.ciano}curl -i -X POST https://api.cosmicguide.cloud/api/track \\`);
    console.log(`  -H 'Content-Type: application/json' \\`);
    console.log(`  -d '{"sessionId":"teste-manual-0000000000","events":[{"event":"app_open"}]}'${cores.reset}`);
    console.log(`(esperado: HTTP/1.1 204)`);
    console.log("");
    return;
  }

  // -------------------------------------------------------------------------
  // 1) Sessões únicas por dia
  // -------------------------------------------------------------------------
  console.log("");
  console.log(`${cores.neg}SESSÕES ÚNICAS POR DIA${cores.reset}`);
  console.log("");
  const mapaDias = new Map(porDia.map((r) => [r.dia, r]));
  const maxDia = porDia.reduce((m, r) => Math.max(m, r.sessoes), 0);
  for (let i = dias - 1; i >= 0; i--) {
    const iso = inicioDoDiaLocalIso(i);
    const rotulo = new Date(new Date(iso).getTime() + OFFSET_HORAS * 3600 * 1000).toISOString().slice(0, 10);
    const linhaDia = mapaDias.get(rotulo);
    const sessoes = linhaDia ? linhaDia.sessoes : 0;
    const eventos = linhaDia ? linhaDia.eventos : 0;
    const hoje = i === 0 ? `${cores.dim} (hoje, parcial)${cores.reset}` : "";
    console.log(
      `  ${rotulo}  ${String(sessoes).padStart(5)} ${cores.ciano}${barra(sessoes, maxDia, 30)}${cores.reset}` +
        ` ${cores.dim}${eventos} ev.${cores.reset}${hoje}`
    );
  }

  // -------------------------------------------------------------------------
  // 2) O funil em cascata
  // -------------------------------------------------------------------------
  const topoBruto = sessoesPor.get(FUNIL[0].event) || 0;
  const topo = topoBruto || totalSessoes;
  const semTopo = topoBruto === 0;

  console.log("");
  console.log(linha("═"));
  console.log(`${cores.neg}O FUNIL — de ${topo} sessão(ões) no topo, quantas sobrevivem a cada degrau${cores.reset}`);
  if (semTopo) {
    console.log(
      `${cores.amarelo}aviso:${cores.reset} nenhum evento "app_open" no período — usando o total de sessões como topo.`
    );
  }
  console.log("");
  console.log(
    `${cores.dim}` +
      "  #  " +
      "DEGRAU".padEnd(33) +
      "SESSÕES".padStart(7) +
      "  " +
      "% TOPO" +
      "   " +
      `MORRE AQUI${cores.reset}`
  );
  console.log(linha());

  let anterior = topo;
  let anteriorLabel = semTopo ? "topo" : FUNIL[0].label;
  const quedas = [];

  FUNIL.forEach((passo, i) => {
    const sessoes = sessoesPor.get(passo.event);
    const nuncaDisparado = sessoes === undefined;
    const valor = sessoes || 0;
    const sobrevive = pct(valor, topo);

    let colunaMorte;
    if (i === 0) {
      colunaMorte = `${cores.dim}—${cores.reset}`;
    } else if (nuncaDisparado) {
      // Degrau que o app ainda não instrumentou é MUITO diferente de degrau
      // onde ninguém passou — confundir os dois faz o dono "consertar" uma tela
      // que está funcionando.
      colunaMorte = `${cores.dim}sem dado (evento nunca chegou)${cores.reset}`;
    } else if (valor > anterior) {
      // Cada degrau conta "sessões que dispararam ESTE evento em algum momento",
      // sem exigir ordem — então dá pra um degrau ser MAIOR que o anterior
      // (alguém que pulou o passo de cima, ex.: caiu direto no paywall por um
      // link). Isso é informação, não erro: mostrar como queda negativa
      // esconderia o que está acontecendo.
      colunaMorte = `${cores.dim}+${valor - anterior} (pulou o degrau acima)${cores.reset}`;
    } else if (valor === anterior) {
      colunaMorte = `${cores.dim}0 (todos seguiram)${cores.reset}`;
    } else {
      const perdidos = anterior - valor;
      const taxa = pct(perdidos, anterior);
      quedas.push({ i, passo, perdidos, taxa, de: anteriorLabel, para: passo.label, anterior, valor });
      const cor = taxa >= 50 ? cores.vermelho : taxa >= 25 ? cores.amarelo : cores.reset;
      colunaMorte = `${cor}-${perdidos} (${taxa.toFixed(1)}%)${cores.reset}`;
    }

    // Sem cor no rótulo de propósito: padEnd conta os bytes do código ANSI e
    // desalinharia a tabela inteira. O aviso de "evento nunca chegou" vai na
    // ÚLTIMA coluna, que pode transbordar sem quebrar o alinhamento.
    const rotulo = passo.label.slice(0, 33);
    console.log(
      ` ${String(i + 1).padStart(2)}. ${rotulo.padEnd(33)}` +
        `${String(valor).padStart(7)}  ${fmtPct(sobrevive)}   ${colunaMorte}`
    );
    if (valor > 0) console.log(`     ${cores.roxo}${barra(valor, topo, 34)}${cores.reset}`);

    if (!nuncaDisparado) {
      anterior = valor;
      anteriorLabel = passo.label;
    }
  });

  console.log(linha());
  const fim = sessoesPor.get(FUNIL[FUNIL.length - 1].event) || 0;
  console.log(
    `  Conversão ponta a ponta (abriu → checkout abriu): ${cores.neg}${fim}/${topo} = ${pct(fim, topo).toFixed(2)}%${cores.reset}`
  );

  // -------------------------------------------------------------------------
  // 3) O degrau onde mais gente desiste — a resposta que interessa
  // -------------------------------------------------------------------------
  console.log("");
  if (quedas.length === 0) {
    console.log(`${cores.dim}Ainda não há queda medida entre degraus (falta dado nos passos intermediários).${cores.reset}`);
  } else {
    // Critério: quem PERDE MAIS GENTE em número absoluto. Percentual sozinho
    // engana quando o degrau já está no fim do funil com 3 pessoas — o que
    // decide onde mexer primeiro é quantas pessoas se perderam ali.
    const pior = quedas.slice().sort((a, b) => b.perdidos - a.perdidos || b.taxa - a.taxa)[0];
    console.log(linha("═"));
    console.log(`${cores.neg}${cores.vermelho}⚠ MAIOR VAZAMENTO${cores.reset}`);
    console.log("");
    console.log(`  ${cores.neg}${pior.de}  →  ${pior.para}${cores.reset}`);
    console.log(
      `  ${pior.anterior} pessoas chegaram, ${pior.valor} passaram — ${cores.vermelho}${cores.neg}${pior.perdidos} desistiram (${pior.taxa.toFixed(1)}%)${cores.reset}`
    );
    console.log("");
    console.log(`  ${cores.dim}É aqui que mexer primeiro. Qualquer melhoria em outro degrau move menos gente.${cores.reset}`);

    const restantes = quedas
      .filter((q) => q !== pior)
      .sort((a, b) => b.perdidos - a.perdidos)
      .slice(0, 3);
    if (restantes.length) {
      console.log("");
      console.log(`  ${cores.dim}depois deste:${cores.reset}`);
      for (const q of restantes) {
        console.log(`  ${cores.dim}  · ${q.de} → ${q.para}: -${q.perdidos} (${q.taxa.toFixed(1)}%)${cores.reset}`);
      }
    }
    console.log(linha("═"));
  }

  // -------------------------------------------------------------------------
  // 4) O miolo que antes era caixa-preta
  // -------------------------------------------------------------------------
  if (porPasso.length) {
    console.log("");
    console.log(`${cores.neg}PASSOS DO ONBOARDING${cores.reset}`);
    for (const row of porPasso) {
      console.log(`  ${String(row.mode || '?').padEnd(7)} ${String(row.step || '?').padEnd(16)} ${String(row.action || '?').padEnd(9)} ${row.sessoes}`);
    }
  }
  if (porRaspagem.length) {
    console.log("");
    console.log(`${cores.neg}CARTAS RASPADAS ATÉ O FIM${cores.reset}`);
    for (const row of porRaspagem) {
      console.log(`  ${String(row.kind || '?').padEnd(9)} ${String(row.screen || '?').padEnd(16)} ${row.sessoes}`);
    }
  }

  // -------------------------------------------------------------------------
  // 5) Eventos fora do funil (nome novo que o app começou a mandar)
  // -------------------------------------------------------------------------
  const conhecidos = new Set(FUNIL.map((p) => p.event));
  conhecidos.add('onboarding_step');
  conhecidos.add('scratch_reveal');
  const fora = porEvento.filter((r) => !conhecidos.has(r.event));
  if (fora.length) {
    console.log("");
    console.log(`${cores.amarelo}Eventos gravados que não têm degrau neste relatório:${cores.reset}`);
    for (const r of fora) {
      console.log(`  · ${r.event}: ${r.sessoes} sessão(ões), ${r.eventos} evento(s)`);
    }
    console.log(`${cores.dim}  (adicione o degrau em FUNIL, no topo deste arquivo)${cores.reset}`);
  }

  console.log("");
  console.log(
    `${cores.dim}Cada degrau conta SESSÕES ANÔNIMAS distintas que dispararam aquele evento no período,` +
      ` em qualquer ordem — por isso um degrau pode ser maior que o de cima (alguém pulou).` +
      ` Contagem de eventos por evento: ${FUNIL.map((p) => `${p.event}=${eventosPor.get(p.event) || 0}`).join(" ")}${cores.reset}`
  );
  console.log("");
}

try {
  main();
} finally {
  // Fecha a conexão em qualquer saída (inclusive nos returns de erro) — o
  // banco está em WAL e é compartilhado com o processo do backend.
  try {
    db.close();
  } catch {}
}
