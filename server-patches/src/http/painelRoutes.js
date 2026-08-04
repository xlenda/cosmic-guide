// O PAINEL DO DONO — os números do negócio numa página, feita pro celular.
//
// Pedido do Lenda (04/08/2026): ele está divulgando no orgânico e não tinha
// NENHUM número na mão — quantos entraram, quantos leram, quantos bateram no
// paywall, quantos assinaram. Tudo isso o servidor já gravava (funnel_events,
// subscriptions, ai_usage, push, chama); faltava só a vitrine.
//
// DUAS ROTAS, e a divisão é de segurança:
//   GET /painel              — o HTML, público e VAZIO de dados: é só a casca
//                              com o campo de senha. Nenhum número sai daqui.
//   GET /api/admin/metrics   — os números, atrás do MESMO X-Admin-Token das
//                              rotas admin (timing-safe, 503 sem configurar).
//
// O login guarda o token no localStorage do aparelho do dono; o atalho
// /painel?t=TOKEN grava e LIMPA a URL (replaceState) pra não ficar token em
// histórico de navegação.
//
// CADA BLOCO DE MÉTRICA É INDEPENDENTE (try/catch próprio devolvendo null):
// uma tabela com schema diferente do esperado derruba SÓ o card dela, nunca o
// painel inteiro — o dono abrindo o painel e vendo erro 500 às 23h é
// exatamente o tipo de susto que esta página existe pra evitar.
const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const { db } = require("../infrastructure/db");
const { timingSafeStringEqual } = require("../infrastructure/timingSafeCompare");

// Dia local do SERVIDOR (UTC) — mesmo referencial do countAiUsage e do cron.
function diaISO(offset = 0) {
  const d = new Date(Date.now() - offset * 86400000);
  return d.toISOString().slice(0, 10);
}

// E-mail nunca sai inteiro do servidor: o painel mostra o bastante pro dono
// reconhecer ("g...s@gmail.com"), não o bastante pra vazar a base se alguém
// olhar por cima do ombro dele no ônibus.
function mascarar(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) return "—";
  const [antes, depois] = email.split("@");
  const inicio = antes.slice(0, 1);
  const fim = antes.length > 2 ? antes.slice(-1) : "";
  return `${inicio}***${fim}@${depois}`;
}

// Um bloco por assunto; falha vira null e o motivo vai pro log, não pro corpo.
function bloco(nome, fn) {
  try {
    return fn();
  } catch (err) {
    console.error(`[painel] bloco "${nome}" falhou: ${err.message}`);
    return null;
  }
}

function coletarMetricas() {
  const hoje = diaISO(0);
  const inicio14 = diaISO(13);

  const funil = bloco("funil", () => {
    // Sessões DISTINTAS por evento por dia — o mesmo aparelho abrindo o app
    // cinco vezes numa sessão conta uma, que é como se lê um funil.
    const linhas = db
      .prepare(
        `SELECT substr(created_at, 1, 10) AS dia, event, COUNT(DISTINCT session_id) AS n
         FROM funnel_events WHERE substr(created_at, 1, 10) >= ?
         GROUP BY dia, event`
      )
      .all(inicio14);
    return linhas;
  });

  const assinaturas = bloco("assinaturas", () => {
    const porStatus = db.prepare(`SELECT status, COUNT(*) AS n FROM subscriptions GROUP BY status`).all();
    const novasPorDia = db
      .prepare(
        `SELECT substr(created_at, 1, 10) AS dia, COUNT(*) AS n
         FROM subscriptions WHERE substr(created_at, 1, 10) >= ? AND status != 'pending'
         GROUP BY dia`
      )
      .all(inicio14);
    const ultimas = db
      .prepare(`SELECT customer_email, plan, status, substr(created_at, 1, 16) AS quando
                FROM subscriptions ORDER BY created_at DESC LIMIT 5`)
      .all()
      .map((r) => ({ email: mascarar(r.customer_email), plan: r.plan || "—", status: r.status, quando: r.quando }));
    return { porStatus, novasPorDia, ultimas };
  });

  const ia = bloco("ia", () => {
    const porDia = db
      .prepare(`SELECT day AS dia, endpoint, count AS n FROM ai_usage WHERE day >= ? ORDER BY day`)
      .all(diaISO(6));
    return porDia;
  });

  const push = bloco("push", () => ({
    inscritos: db.prepare(`SELECT COUNT(*) AS n FROM push_subscriptions`).get().n,
    lembreteDiario: db.prepare(`SELECT COUNT(*) AS n FROM push_daily_reminder`).get().n,
  }));

  const chama = bloco("chama", () =>
    db.prepare(`SELECT COUNT(DISTINCT couple_key) AS n FROM flame_checkins WHERE day = ?`).get(hoje).n
  );

  const paises = bloco("paises", () => ({
    // Sessões distintas por país — a pergunta literal do dono ("de quais
    // países são?"). NULL vira '??' (evento anterior à coluna, ou IP que a
    // base local não conhece) — mostrar o buraco é mais honesto que somá-lo
    // no maior país.
    hoje: db
      .prepare(
        `SELECT COALESCE(country, '??') AS pais, COUNT(DISTINCT session_id) AS n
         FROM funnel_events WHERE substr(created_at,1,10) = ? AND event = 'app_open'
         GROUP BY pais ORDER BY n DESC LIMIT 12`
      )
      .all(hoje),
    d7: db
      .prepare(
        `SELECT COALESCE(country, '??') AS pais, COUNT(DISTINCT session_id) AS n
         FROM funnel_events WHERE substr(created_at,1,10) >= ? AND event = 'app_open'
         GROUP BY pais ORDER BY n DESC LIMIT 12`
      )
      .all(diaISO(6)),
  }));

  const receita = bloco("receita", () =>
    // Dinheiro DE VERDADE, não projeção: soma do que as assinaturas vivas
    // pagaram (amount_cents gravado pelo servidor no checkout — preço nunca
    // veio do cliente). past_due entra: dunning ainda é cliente.
    db.prepare(`SELECT COALESCE(SUM(amount_cents),0) AS cents FROM subscriptions
                WHERE status IN ('active','past_due')`).get().cents
  );

  const planosClicados = bloco("planosClicados", () =>
    // O que a pessoa ESCOLHE quando vê os preços (plan_select do funil, 14d).
    // Intenção não é venda — mas diz qual oferta chama, antes do cartão.
    db.prepare(`SELECT json_extract(props,'$.plan') AS plano, COUNT(*) AS n
                FROM funnel_events
                WHERE event='plan_select' AND substr(created_at,1,10) >= ?
                GROUP BY plano ORDER BY n DESC`).all(inicio14)
  );

  const horas = bloco("horas", () =>
    // Sessões por hora (UTC — o cliente converte pra hora do Brasil): a
    // resposta de "que horas meu público entra?", que é a resposta de "que
    // horas postar no orgânico".
    db.prepare(`SELECT substr(created_at,12,2) AS h, COUNT(DISTINCT session_id) AS n
                FROM funnel_events WHERE event='app_open' AND substr(created_at,1,10) >= ?
                GROUP BY h`).all(diaISO(6))
  );

  const paisesLeram = bloco("paisesLeram", () =>
    db.prepare(`SELECT COALESCE(country,'??') AS pais, COUNT(DISTINCT session_id) AS n
                FROM funnel_events WHERE event='reading_done' AND substr(created_at,1,10) >= ?
                GROUP BY pais`).all(diaISO(6))
  );

  const cards = bloco("cards", () => {
    const manifesto = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "..", "data", "daily-cards", "latest.json"), "utf8")
    );
    return manifesto.date;
  });

  return { geradoEm: new Date().toISOString(), hoje, funil, assinaturas, ia, push, chama, paises, receita, planosClicados, horas, paisesLeram, cardsDoDia: cards };
}

// ---------------------------------------------------------------------------
// A CASCA — HTML único, zero dependência externa, zero dado embutido.
// ---------------------------------------------------------------------------
const HTML = `<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Cosmic Guide · Painel</title>
<style>
  :root { --fundo:#0A0626; --card:#161038; --borda:rgba(232,199,102,.18); --ouro:#E8C766; --texto:#F4EEDF; --mudo:#9C93BE; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:var(--fundo); color:var(--texto); font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif; padding:16px; max-width:640px; margin:0 auto; }
  h1 { font-size:18px; color:var(--ouro); display:flex; justify-content:space-between; align-items:baseline; margin-bottom:14px; }
  h1 small { color:var(--mudo); font-weight:400; font-size:12px; }
  h2 { font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:var(--mudo); margin:22px 0 8px; }
  .card { background:var(--card); border:1px solid var(--borda); border-radius:14px; padding:14px; }
  .tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:10px; }
  .tile { background:var(--card); border:1px solid var(--borda); border-radius:14px; padding:12px 14px; }
  .tile b { display:block; font-size:26px; color:var(--ouro); font-variant-numeric:tabular-nums; }
  .tile span { font-size:12px; color:var(--mudo); }
  .linha { display:flex; align-items:center; gap:10px; margin:7px 0; font-size:13px; }
  .linha .nome { width:118px; color:var(--mudo); flex:none; }
  .linha .barra { flex:1; height:10px; background:rgba(255,255,255,.06); border-radius:5px; overflow:hidden; }
  .linha .barra i { display:block; height:100%; background:var(--ouro); border-radius:5px; }
  .linha .n { width:38px; text-align:right; font-variant-numeric:tabular-nums; }
  .dias { display:flex; align-items:flex-end; gap:3px; height:56px; margin-top:8px; }
  .dias div { flex:1; background:var(--ouro); opacity:.85; border-radius:3px 3px 0 0; min-height:2px; }
  .dias div.zero { background:rgba(255,255,255,.10); }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  td { padding:5px 4px; border-top:1px solid rgba(255,255,255,.06); color:var(--mudo); }
  td:first-child { color:var(--texto); }
  #login { margin-top:28vh; text-align:center; }
  #login input { width:100%; max-width:280px; padding:12px; border-radius:10px; border:1px solid var(--borda); background:var(--card); color:var(--texto); font-size:15px; text-align:center; }
  #login button { margin-top:10px; padding:11px 26px; border:0; border-radius:10px; background:var(--ouro); color:#241a04; font-weight:700; font-size:14px; }
  #erro { color:#ff9d9d; font-size:13px; margin-top:10px; min-height:18px; }
  #sair { background:none; border:0; color:var(--mudo); font-size:11px; text-decoration:underline; }
  .rodape { color:var(--mudo); font-size:11px; text-align:center; margin:24px 0 8px; }
</style></head><body>
<div id="login"><h1 style="justify-content:center">✦ Painel do Cosmic Guide</h1>
  <input id="tok" type="password" placeholder="token de acesso" autocomplete="current-password">
  <div><button onclick="entrar()">Entrar</button></div><div id="erro"></div>
</div>
<div id="painel" style="display:none"></div>
<script>
const CHAVE = 'cg-painel-token';
// Atalho ?t=TOKEN: guarda e LIMPA a URL — token não fica em histórico.
const u = new URL(location.href);
if (u.searchParams.get('t')) { localStorage.setItem(CHAVE, u.searchParams.get('t')); history.replaceState(null,'',u.pathname); }

function entrar() { localStorage.setItem(CHAVE, document.getElementById('tok').value.trim()); carregar(); }
function sair() { localStorage.removeItem(CHAVE); location.reload(); }

function soma(linhas, filtro) { return (linhas||[]).filter(filtro).reduce((a,r)=>a+r.n,0); }
function porDia(linhas, filtro, dias) {
  const mapa = {}; (linhas||[]).filter(filtro).forEach(r => { mapa[r.dia]=(mapa[r.dia]||0)+r.n; });
  return dias.map(d => mapa[d]||0);
}
function ultimosDias(n){ const out=[]; for(let i=n-1;i>=0;i--) out.push(new Date(Date.now()-i*86400000).toISOString().slice(0,10)); return out; }
function barras(vals){ const max=Math.max(1,...vals); return '<div class="dias">'+vals.map(v=>'<div class="'+(v?'':'zero')+'" style="height:'+Math.max(4,Math.round(v/max*100))+'%" title="'+v+'"></div>').join('')+'</div>'; }

async function carregar() {
  const tok = localStorage.getItem(CHAVE);
  if (!tok) return;
  const r = await fetch('/api/admin/metrics', { headers: { 'X-Admin-Token': tok } });
  if (!r.ok) { document.getElementById('erro').textContent = r.status===401 ? 'token errado' : 'erro '+r.status; localStorage.removeItem(CHAVE); return; }
  const m = await r.json();
  const dias14 = ultimosDias(14), hoje = m.hoje;
  const f = m.funil||[];
  const evHoje = ev => soma(f, r=>r.dia===hoje && r.event===ev);
  const ev7 = ev => soma(f, r=>r.dia>=dias14[7] && r.event===ev);

  // O funil de hoje, do topo ao dinheiro:
  const degraus = [['Abriram o app','app_open'],['Chegaram na Home','home_view'],['Leitura concluída','reading_done'],['Viram o paywall','paywall_view'],['Clicaram assinar','checkout_click'],['Checkout abriu','checkout_open']];
  const topo = Math.max(1, evHoje('app_open'));

  const st = {}; ((m.assinaturas||{}).porStatus||[]).forEach(r=>st[r.status]=r.n);
  const ativas = (st.active||0)+(st.past_due||0);

  let html = '<h1>✦ Cosmic Guide <small>'+hoje+' · <button id="sair" onclick="sair()">sair</button></small></h1>';
  html += '<div class="tiles">'
    + '<div class="tile"><b>'+evHoje('app_open')+'</b><span>sessões hoje</span></div>'
    + '<div class="tile"><b>'+ativas+'</b><span>assinaturas ativas</span></div>'
    + '<div class="tile"><b>'+(st.pending||0)+'</b><span>pendentes</span></div>'
    + '<div class="tile"><b>'+soma((m.ia||[]),r=>r.dia===hoje)+'</b><span>leituras de IA hoje</span></div>'
    + '<div class="tile"><b>US$ '+(((m.receita||0)/100).toFixed(0))+'</b><span>receita ativa</span></div>' 
    + '</div>';

  html += '<h2>Funil de hoje (sessões)</h2><div class="card">';
  degraus.forEach(([nome,ev])=>{ const n=evHoje(ev); html+='<div class="linha"><span class="nome">'+nome+'</span><span class="barra"><i style="width:'+Math.round(n/topo*100)+'%"></i></span><span class="n">'+n+'</span></div>'; });
  html += '</div>';

  const bandeira = c => c==='??' ? '🌐 ?' : String.fromCodePoint(...[...c].map(x=>127397+x.charCodeAt(0)))+' '+c;
  const ps = (m.paises||{});
  if ((ps.hoje||[]).length || (ps.d7||[]).length) {
    const lista = (ps.hoje||[]).length ? ps.hoje : ps.d7;
    const titulo = (ps.hoje||[]).length ? 'Países · hoje' : 'Países · 7 dias';
    const maxP = Math.max(1, ...lista.map(r=>r.n));
    html += '<h2>'+titulo+' (sessões)</h2><div class="card">';
    const leram = {}; (m.paisesLeram||[]).forEach(r=>leram[r.pais]=r.n);
    lista.forEach(r=>{ const l=leram[r.pais]; html+='<div class="linha"><span class="nome">'+bandeira(r.pais)+(l?' · '+l+' leram':'')+'</span><span class="barra"><i style="width:'+Math.round(r.n/maxP*100)+'%"></i></span><span class="n">'+r.n+'</span></div>'; });
    html += '</div>';
  }
  // Conversão dos últimos 7 dias — % sobre quem abriu o app.
  const a7 = Math.max(1, ev7('app_open'));
  const pc = ev => Math.round(ev7(ev)/a7*100);
  html += '<div class="rodape" style="margin:8px 0 0">7 dias: '+ev7('app_open')+' sessões · '+pc('reading_done')+'% leram · '+pc('paywall_view')+'% viram paywall · '+pc('checkout_click')+'% clicaram assinar</div>';

  // Qual leitura de IA é a favorita (7d) — onde investir conteúdo.
  const iaTop = {};
  (m.ia||[]).forEach(r=>{ iaTop[r.endpoint]=(iaTop[r.endpoint]||0)+r.n; });
  const iaLista = Object.entries(iaTop).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if (iaLista.length) {
    const maxIa = Math.max(1, ...iaLista.map(x=>x[1]));
    html += '<h2>Leituras de IA · 7 dias</h2><div class="card">';
    iaLista.forEach(([nome,n])=>{ html+='<div class="linha"><span class="nome">'+nome+'</span><span class="barra"><i style="width:'+Math.round(n/maxIa*100)+'%"></i></span><span class="n">'+n+'</span></div>'; });
    html += '</div>';
  }

  // Qual plano chama quando a pessoa vê os preços (cliques, 14d).
  const planos = (m.planosClicados||[]).filter(r=>r.plano);
  if (planos.length) {
    const maxPl = Math.max(1, ...planos.map(r=>r.n));
    html += '<h2>Planos clicados · 14 dias</h2><div class="card">';
    planos.forEach(r=>{ html+='<div class="linha"><span class="nome">'+r.plano+'</span><span class="barra"><i style="width:'+Math.round(r.n/maxPl*100)+'%"></i></span><span class="n">'+r.n+'</span></div>'; });
    html += '</div>';
  }

  // Horário de pico em hora do BRASIL — a resposta de "que horas postar".
  const hs = new Array(24).fill(0);
  (m.horas||[]).forEach(r=>{ hs[(parseInt(r.h,10)+21)%24] += r.n; });
  if (hs.some(v=>v>0)) {
    html += '<h2>Horário das sessões · 7 dias (hora BR)</h2><div class="card">'+barras(hs)+'<div class="rodape" style="margin-top:4px">0h ————————— 12h ————————— 23h</div></div>';
  }

  html += '<h2>Sessões · 14 dias</h2><div class="card">'+barras(porDia(f,r=>r.event==='app_open',dias14))+'</div>';
  html += '<h2>Assinaturas novas · 14 dias</h2><div class="card">'+barras(porDia(((m.assinaturas||{}).novasPorDia||[]),()=>true,dias14))+'</div>';

  html += '<h2>Últimas assinaturas</h2><div class="card"><table>';
  (((m.assinaturas||{}).ultimas)||[]).forEach(r=>{ html+='<tr><td>'+r.email+'</td><td>'+r.plan+'</td><td>'+r.status+'</td><td>'+r.quando.replace('T',' ')+'</td></tr>'; });
  html += '</table></div>';

  html += '<div class="tiles" style="margin-top:22px">'
    + '<div class="tile"><b>'+((m.push||{}).inscritos ?? '—')+'</b><span>push inscritos</span></div>'
    + '<div class="tile"><b>'+((m.push||{}).lembreteDiario ?? '—')+'</b><span>lembrete diário</span></div>'
    + '<div class="tile"><b>'+(m.chama ?? '—')+'</b><span>chamas hoje</span></div>'
    + '<div class="tile"><b>'+ev7('paywall_view')+'</b><span>paywall · 7d</span></div>'
    + '</div>';
  html += '<div class="rodape">atualiza sozinho a cada 60s · fundo do card: '+(m.cardsDoDia||'—')+'</div>';

  document.getElementById('login').style.display='none';
  const p = document.getElementById('painel'); p.style.display='block'; p.innerHTML = html;
}
carregar(); setInterval(carregar, 60000);
</script></body></html>`;

function buildPainelRouter({ adminToken }) {
  const router = express.Router();

  router.get("/painel", (_req, res) => {
    res.set("Cache-Control", "no-store");
    // O helmet() global manda script-src 'self' + script-src-attr 'none' — o
    // que MATAVA esta página: o <script> inline nunca rodava e o botão
    // "Entrar" ficava morto (bug relatado pelo dono em 04/08/2026, "coloco
    // entrar não vai"). Esta página é um arquivo único de propósito, então o
    // CSP dela precisa permitir inline — e em troca fecha todo o resto mais
    // duro que o global: nenhuma origem externa, nenhum frame, nenhum form.
    res.set(
      "Content-Security-Policy",
      "default-src 'none'; script-src 'unsafe-inline'; script-src-attr 'unsafe-inline'; " +
        "style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; " +
        "base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
    );
    res.type("html").send(HTML);
  });

  router.get("/api/admin/metrics", (req, res) => {
    // Mesma disciplina das rotas admin: sem token configurado a porta nem
    // existe (503), e a comparação é timing-safe.
    if (!adminToken) return res.status(503).json({ error: "painel não configurado (ADMIN_TOKEN ausente)" });
    const recebido = req.headers["x-admin-token"];
    if (!recebido || !timingSafeStringEqual(recebido, adminToken)) {
      return res.status(401).json({ error: "não autorizado" });
    }
    res.set("Cache-Control", "no-store");
    res.json(coletarMetricas());
  });

  return router;
}

module.exports = { buildPainelRouter, _paraTestes: { mascarar, coletarMetricas } };
