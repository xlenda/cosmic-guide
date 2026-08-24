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
// O login guarda o token no localStorage do aparelho do dono; o atalho de
// entrada é /painel#t=TOKEN — FRAGMENTO, não query string. Fragmento é a única
// parte da URL que o navegador nunca manda pro servidor, então o token não cai
// no access.log do nginx (que grava query string e é compartilhado com os
// outros sites do servidor). O antigo ?t=TOKEN foi removido por isso mesmo
// (auditoria de 19/08/2026): virou risco de verdade quando a moderação deu a
// este token o poder de APAGAR conteúdo. Depois do primeiro acesso o link nem
// é mais preciso — o token fica no localStorage do aparelho.
//
// CADA BLOCO DE MÉTRICA É INDEPENDENTE (try/catch próprio devolvendo null):
// uma tabela com schema diferente do esperado derruba SÓ o card dela, nunca o
// painel inteiro — o dono abrindo o painel e vendo erro 500 às 23h é
// exatamente o tipo de susto que esta página existe pra evitar.
const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const rateLimit = require("express-rate-limit");
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
  const corte24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

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

  // A FILA DE MODERAÇÃO (migração 016). É aqui que a denúncia "chega em
  // alguém": o dono já abre este painel no celular, então a fila mora onde ele
  // olha, em vez de virar uma rota que só existe pra um curl que ninguém dá.
  // O trecho vem de `content` (instantâneo do post/comentário) e cai pra
  // `detail` quando é denúncia de saída de IA, que não tem linha em tabela.
  const denuncias = bloco("denuncias", () => {
    const resumo = db
      .prepare(
        `SELECT COUNT(*) AS abertas,
                MIN(created_at) AS mais_antiga_em,
                SUM(CASE WHEN created_at <= ? THEN 1 ELSE 0 END) AS vencidas_24h
           FROM moderation_reports
          WHERE status = 'open'`
      )
      .get(corte24h);
    return {
      abertas: resumo.abertas || 0,
      maisAntigaEm: resumo.mais_antiga_em || null,
      vencidas24h: resumo.vencidas_24h || 0,
      fila: db
      .prepare(
        `SELECT id, kind, reason, target_id, target_user_id,
                substr(created_at, 1, 16) AS quando,
                substr(COALESCE(content, detail, ''), 1, 280) AS trecho
         FROM moderation_reports
        WHERE status = 'open'
        ORDER BY created_at ASC, id ASC
        LIMIT 30`
      )
      .all(),
    };
  });

  const suspensoes = bloco("suspensoes", () =>
    db
      .prepare(
        `SELECT s.user_id, s.report_id, s.reason, s.created_at,
                r.kind AS report_kind, r.reason AS report_reason,
                substr(COALESCE(r.content, r.detail, ''), 1, 280) AS trecho
           FROM social_suspensions s
           LEFT JOIN moderation_reports r ON r.id = s.report_id
          ORDER BY s.created_at DESC
          LIMIT 100`
      )
      .all()
  );

  const acoesModeracao = bloco("acoesModeracao", () =>
    db
      .prepare(
        `SELECT a.id, a.report_id, a.action, a.reason, a.created_at,
                r.kind, r.target_user_id
           FROM moderation_actions a
           LEFT JOIN moderation_reports r ON r.id = a.report_id
          ORDER BY a.id DESC
          LIMIT 30`
      )
      .all()
  );

  const cards = bloco("cards", () => {
    const manifesto = JSON.parse(
      fs.readFileSync(path.join(__dirname, "..", "..", "data", "daily-cards", "latest.json"), "utf8")
    );
    return manifesto.date;
  });

  return {
    geradoEm: new Date().toISOString(),
    hoje,
    funil,
    assinaturas,
    ia,
    push,
    chama,
    paises,
    receita,
    planosClicados,
    horas,
    paisesLeram,
    denuncias,
    suspensoes,
    acoesModeracao,
    cardsDoDia: cards,
  };
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
  #estado { display:none; position:sticky; top:8px; z-index:10; margin-bottom:12px; background:#491c24; border:1px solid #d66b78; color:#ffd7dc; border-radius:12px; padding:11px 13px; font-weight:700; }
  #sair { background:none; border:0; color:var(--mudo); font-size:11px; text-decoration:underline; }
  .den { border-top:1px solid rgba(255,255,255,.06); padding:10px 0; }
  .den:first-child { border-top:0; padding-top:0; }
  .dencab { font-size:11px; color:var(--mudo); letter-spacing:.04em; }
  .dentrecho { font-size:13px; margin:5px 0 8px; white-space:pre-wrap; word-break:break-word; }
  .denbtns button { border:0; border-radius:8px; padding:9px 14px; font-size:12px; font-weight:700; margin-right:8px; background:#c0392b; color:#fff; }
  .denbtns button.warn { background:#b86b18; }
  .denbtns button.alt { background:rgba(255,255,255,.10); color:var(--texto); }
  .filaok { color:#9dd9aa; }
  .filaatrasada { color:#ffb0a8; }
  .rodape { color:var(--mudo); font-size:11px; text-align:center; margin:24px 0 8px; }
</style></head><body>
<div id="login"><h1 style="justify-content:center">✦ Painel do Cosmic Guide</h1>
  <input id="tok" type="password" placeholder="token de acesso" autocomplete="current-password">
  <div><button onclick="entrar()">Entrar</button></div><div id="erro"></div>
</div>
<div id="estado" role="alert"></div>
<div id="painel" style="display:none"></div>
<script>
const CHAVE = 'cg-painel-token';
let suspensoesAtuais = [];
let ultimoGeradoEm = null;
let carregamentoAtual = 0;
// Atalho #t=TOKEN (FRAGMENTO): guarda e LIMPA a URL. O fragmento nunca sai do
// navegador — não vai pro log do nginx, ao contrário do ?t= que existia aqui.
const u = new URL(location.href);
const doFragmento = new URLSearchParams(u.hash.slice(1)).get('t');
if (doFragmento) { localStorage.setItem(CHAVE, doFragmento); history.replaceState(null,'',u.pathname); }
else if (u.searchParams.get('t')) {
  // Favorito antigo. O token JÁ foi parar no log do servidor só de abrir isto,
  // então aceitá-lo não protegeria nada — recusa e avisa, uma vez só, até ele
  // trocar o "?" por "#" no favorito.
  history.replaceState(null,'',u.pathname);
  alert('O atalho ?t= saiu de circulação: a query string vai inteira pro log do servidor. Troque o "?" por "#" no seu favorito (/painel#t=SEUTOKEN) ou cole o token no campo abaixo.');
}

function entrar() { localStorage.setItem(CHAVE, document.getElementById('tok').value.trim()); carregar(); }
function sair() { localStorage.removeItem(CHAVE); location.reload(); }

function marcarDesatualizado(detalhe) {
  const estado = document.getElementById('estado');
  const ultima = ultimoGeradoEm ? ' Última atualização confirmada: '+ultimoGeradoEm+'.' : '';
  estado.textContent = 'Dados desatualizados — não significa fila zero. '+detalhe+'.'+ultima;
  estado.style.display = 'block';
}
function limparDesatualizado() {
  const estado = document.getElementById('estado');
  estado.textContent = '';
  estado.style.display = 'none';
}
async function fetchComPrazo(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(function(){ controller.abort(); }, 12000);
  try {
    return await fetch(url, Object.assign({}, options || {}, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

// Texto denunciado é conteúdo de usuário indo pra innerHTML — escapar aqui é
// o que impede uma denúncia virar XSS na tela de quem modera.
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
// Valores vindos da API nunca entram em contexto CSS/JS como texto. Contagens
// saem do SQLite como número hoje, mas normalizar na borda impede que uma
// resposta corrompida transforme atributos de estilo, título ou handler em outro
// contexto executável. Texto visível passa sempre por esc().
function numero(v, fallback){ const n=Number(v); return Number.isFinite(n)?n:(fallback==null?0:fallback); }
function inteiroPositivo(v){ const n=Number(v); return Number.isSafeInteger(n)&&n>0?n:null; }
function paisSeguro(v){ const c=String(v==null?'':v).toUpperCase(); return /^[A-Z]{2}$/.test(c)?c:'??'; }
// Código numérico evita aninhar aspas dentro desta template literal do Node.
// 0=arquivar, 1=remover, 2=suspender.
async function moderar(id, codigo) {
  const acao = codigo === 1 ? 'remove' : codigo === 2 ? 'suspend' : 'dismiss';
  let motivo = '';
  if (acao === 'remove') {
    if (!confirm('Remover este conteúdo de vez? A cópia da denúncia permanece no histórico de moderação.')) return;
    motivo = 'conteúdo removido pelo Painel do Dono';
  } else if (acao === 'suspend') {
    if (!confirm('Suspender esta pessoa da Comunidade? O perfil e o conteúdo social serão removidos. Evidências e bloqueios serão preservados.')) return;
    motivo = String(prompt('Motivo interno da suspensão (obrigatório):') || '').trim();
    if (!motivo) return;
  } else {
    motivo = 'denúncia arquivada pelo Painel do Dono';
  }
  try {
    const r = await fetchComPrazo('/api/admin/reports/'+id, {
      method:'POST',
      headers:{ 'X-Admin-Token': localStorage.getItem(CHAVE), 'Content-Type':'application/json' },
      body: JSON.stringify({ action: acao, reason: motivo })
    });
    if (!r.ok) {
      const erro = await r.json().catch(function(){ return {}; });
      alert(erro.error || ('falhou: '+r.status));
      return;
    }
    await carregar();
  } catch (_error) {
    marcarDesatualizado('a ação não pôde ser confirmada; recarregue antes de tentar novamente');
    alert('A ação pode ter chegado ao servidor, mas não foi confirmada. Recarregue a fila antes de tentar novamente.');
  }
}

async function reverterSuspensao(indice) {
  const item = suspensoesAtuais[indice];
  if (!item || !item.user_id) return;
  const motivo = String(prompt('Motivo da reversão (obrigatório e guardado no histórico):') || '').trim();
  if (!motivo) return;
  if (!confirm('Reverter a suspensão? O conteúdo removido não volta; a pessoa poderá criar um novo perfil social.')) return;
  try {
    const r = await fetchComPrazo('/api/admin/social-suspensions/'+encodeURIComponent(item.user_id), {
      method:'DELETE',
      headers:{ 'X-Admin-Token': localStorage.getItem(CHAVE), 'Content-Type':'application/json' },
      body: JSON.stringify({ reason: motivo })
    });
    if (!r.ok) {
      const erro = await r.json().catch(function(){ return {}; });
      alert(erro.error || ('falhou: '+r.status));
      return;
    }
    await carregar();
  } catch (_error) {
    marcarDesatualizado('a reversão não pôde ser confirmada; recarregue antes de tentar novamente');
    alert('A reversão pode ter chegado ao servidor, mas não foi confirmada. Recarregue a fila antes de tentar novamente.');
  }
}
function soma(linhas, filtro) { return (linhas||[]).filter(filtro).reduce((a,r)=>a+numero(r.n),0); }
function porDia(linhas, filtro, dias) {
  const mapa = {}; (linhas||[]).filter(filtro).forEach(r => { mapa[r.dia]=(mapa[r.dia]||0)+numero(r.n); });
  return dias.map(d => mapa[d]||0);
}
function ultimosDias(n){ const out=[]; for(let i=n-1;i>=0;i--) out.push(new Date(Date.now()-i*86400000).toISOString().slice(0,10)); return out; }
function barras(vals){ const seguros=(vals||[]).map(v=>numero(v)); const max=Math.max(1,...seguros); return '<div class="dias">'+seguros.map(v=>'<div class="'+(v?'':'zero')+'" style="height:'+Math.max(4,Math.round(v/max*100))+'%" title="'+v+'"></div>').join('')+'</div>'; }

async function carregar() {
  const tok = localStorage.getItem(CHAVE);
  if (!tok) return;
  const requestId = carregamentoAtual + 1;
  carregamentoAtual = requestId;
  let r;
  try {
    r = await fetchComPrazo('/api/admin/metrics', { headers: { 'X-Admin-Token': tok } });
  } catch (_error) {
    if (carregamentoAtual !== requestId) return;
    marcarDesatualizado('não foi possível alcançar o servidor');
    return;
  }
  if (carregamentoAtual !== requestId) return;
  if (!r.ok) {
    document.getElementById('erro').textContent = r.status===401 ? 'token errado' : (r.status===429 ? 'muitas tentativas — espere alguns minutos' : 'erro '+r.status);
    // SÓ o 401 apaga o token salvo. Antes, qualquer 429/500 passageiro (o
    // painel recarrega sozinho de 60 em 60s) deslogava o dono por um erro que
    // não era dele. E quando o token realmente morre, a tela de login volta —
    // senão o painel ficaria congelado com número velho depois de uma rotação.
    if (r.status === 401) {
      localStorage.removeItem(CHAVE);
      document.getElementById('login').style.display='block';
      document.getElementById('painel').style.display='none';
      limparDesatualizado();
    } else {
      marcarDesatualizado('o servidor respondeu com erro '+r.status);
    }
    return;
  }
  let m;
  try {
    m = await r.json();
  } catch (_error) {
    if (carregamentoAtual !== requestId) return;
    marcarDesatualizado('a resposta do servidor não pôde ser lida');
    return;
  }
  if (carregamentoAtual !== requestId) return;
  if (!m || typeof m !== 'object') {
    marcarDesatualizado('a resposta do servidor veio incompleta');
    return;
  }
  const instante = new Date(m.geradoEm);
  ultimoGeradoEm = Number.isFinite(instante.getTime()) ? instante.toLocaleString('pt-BR') : 'horário não informado';
  document.getElementById('erro').textContent = '';
  limparDesatualizado();
  const dias14 = ultimosDias(14), hoje = m.hoje;
  const f = m.funil||[];
  const evHoje = ev => soma(f, r=>r.dia===hoje && r.event===ev);
  const ev7 = ev => soma(f, r=>r.dia>=dias14[7] && r.event===ev);

  // O funil de hoje, do topo ao dinheiro:
  const degraus = [['Abriram o app','app_open'],['Chegaram na Home','home_view'],['Leitura concluída','reading_done'],['Viram o paywall','paywall_view'],['Clicaram assinar','checkout_click'],['Checkout abriu','checkout_open']];
  const topo = Math.max(1, evHoje('app_open'));

  const st = {}; ((m.assinaturas||{}).porStatus||[]).forEach(r=>st[r.status]=numero(r.n));
  const ativas = (st.active||0)+(st.past_due||0);
  const den = m.denuncias;
  const denDisponivel = den && typeof den === 'object' && Array.isArray(den.fila);
  const idadeFila = denDisponivel && den.maisAntigaEm
    ? Math.max(0, Math.floor((Date.now()-Date.parse(den.maisAntigaEm))/3600000))
    : 0;

  let html = '<h1>✦ Cosmic Guide <small>'+esc(hoje)+' · dados '+esc(ultimoGeradoEm)+' · <button id="sair" onclick="sair()">sair</button></small></h1>';
  html += '<div class="tiles">'
    + '<div class="tile"><b>'+evHoje('app_open')+'</b><span>sessões hoje</span></div>'
    + '<div class="tile"><b>'+ativas+'</b><span>assinaturas ativas</span></div>'
    + '<div class="tile"><b>'+(st.pending||0)+'</b><span>pendentes</span></div>'
    + '<div class="tile"><b>'+soma((m.ia||[]),r=>r.dia===hoje)+'</b><span>leituras de IA hoje</span></div>'
    + '<div class="tile"><b>US$ '+(((m.receita||0)/100).toFixed(0))+'</b><span>receita ativa</span></div>'
    + '<div class="tile"><b>'+(denDisponivel ? numero(den.abertas) : '—')+'</b><span>denúncias abertas</span></div>'
    + '<div class="tile"><b>'+(denDisponivel ? numero(den.vencidas24h) : '—')+'</b><span>abertas há mais de 24h</span></div>'
    + '</div>';

  // Fila de moderação PRIMEIRO quando tem coisa aberta: é a única parte deste
  // painel que espera uma decisão, e denúncia parada é o que reprova o app.
  html += '<h2>Moderação · revisar de manhã e à noite</h2>';
  if (!denDisponivel) {
    html += '<div class="card filaatrasada">Fila de denúncias indisponível neste carregamento. Isso não significa zero: verifique o servidor antes do turno de moderação.</div>';
  } else if (den.fila.length) {
    html += '<div class="rodape '+(den.vencidas24h ? 'filaatrasada' : '')+'" style="margin:0 0 8px;text-align:left">'
      + numero(den.abertas)+' aberta(s) · mais antiga há '+numero(idadeFila)+'h'
      + (numero(den.vencidas24h) ? ' · '+numero(den.vencidas24h)+' ultrapassaram 24h' : '')+'</div><div class="card">';
    den.fila.forEach(function(d){
      const reportId = inteiroPositivo(d.id);
      html += '<div class="den"><div class="dencab">#'+esc(reportId||'—')+' · '+esc(d.kind)+' · '+esc(d.reason)+' · '+esc(String(d.quando||'').replace('T',' '))+'</div>'
        + (d.target_user_id ? '<div class="dencab">pessoa: '+esc(d.target_user_id)+'</div>' : '')
        + '<div class="dentrecho">'+esc(d.trecho||'(conteúdo não disponível — apagado antes da análise)')+'</div>'
        + '<div class="denbtns">'
        + (reportId && (d.kind === 'post' || d.kind === 'comment') ? '<button onclick="moderar('+reportId+',1)">Remover</button>' : '')
        + (reportId && d.target_user_id && (d.kind === 'post' || d.kind === 'comment' || d.kind === 'user')
          ? '<button class="warn" onclick="moderar('+reportId+',2)">Suspender pessoa</button>' : '')
        + (reportId ? '<button class="alt" onclick="moderar('+reportId+',0)">Arquivar</button>' : '')+'</div></div>';
    });
    html += '</div>';
  } else {
    html += '<div class="card filaok">Fila aberta zerada neste carregamento. Conferir novamente no segundo turno do dia.</div>';
  }

  const suspensoesDisponiveis = Array.isArray(m.suspensoes);
  suspensoesAtuais = suspensoesDisponiveis ? m.suspensoes : [];
  if (!suspensoesDisponiveis) {
    html += '<div class="card filaatrasada">Participações suspensas indisponíveis. Nenhuma ausência nesta tela confirma que a lista está vazia.</div>';
  } else if (suspensoesAtuais.length) {
    html += '<h2>Participações suspensas · '+suspensoesAtuais.length+'</h2><div class="card">';
    suspensoesAtuais.forEach(function(s, indice){
      html += '<div class="den"><div class="dencab">pessoa: '+esc(s.user_id)+' · denúncia #'+esc(s.report_id||'—')+'</div>'
        + '<div class="dentrecho">'+esc(s.reason||s.report_reason||'motivo não registrado')+'</div>'
        + (s.trecho ? '<div class="dentrecho">'+esc(s.trecho)+'</div>' : '')
        + '<div class="denbtns"><button class="alt" onclick="reverterSuspensao('+indice+')">Reverter suspensão</button></div></div>';
    });
    html += '</div>';
  }

  const acoesDisponiveis = Array.isArray(m.acoesModeracao);
  const acoes = acoesDisponiveis ? m.acoesModeracao : [];
  if (!acoesDisponiveis) {
    html += '<div class="card filaatrasada">Histórico de moderação indisponível. Não tome a ausência de registros como confirmação de que nada foi feito.</div>';
  } else if (acoes.length) {
    const rotulos = { remove:'removeu conteúdo', dismiss:'arquivou denúncia', suspend:'suspendeu participação', unsuspend:'reverteu suspensão' };
    html += '<h2>Histórico de moderação</h2><div class="card"><table>';
    acoes.slice(0,12).forEach(function(a){
      html += '<tr><td>#'+esc(a.report_id||'—')+' · '+esc(rotulos[a.action]||a.action)+'</td><td>'+esc(a.reason)+'</td><td>'+esc(String(a.created_at||'').slice(0,16).replace('T',' '))+'</td></tr>';
    });
    html += '</table></div>';
  }

  html += '<h2>Funil de hoje (sessões)</h2><div class="card">';
  degraus.forEach(([nome,ev])=>{ const n=evHoje(ev); html+='<div class="linha"><span class="nome">'+nome+'</span><span class="barra"><i style="width:'+Math.round(n/topo*100)+'%"></i></span><span class="n">'+n+'</span></div>'; });
  html += '</div>';

  const bandeira = valor => { const c=paisSeguro(valor); return c==='??' ? '🌐 ?' : String.fromCodePoint(...[...c].map(x=>127397+x.charCodeAt(0)))+' '+c; };
  const ps = (m.paises||{});
  if ((ps.hoje||[]).length || (ps.d7||[]).length) {
    const lista = (ps.hoje||[]).length ? ps.hoje : ps.d7;
    const titulo = (ps.hoje||[]).length ? 'Países · hoje' : 'Países · 7 dias';
    const maxP = Math.max(1, ...lista.map(r=>numero(r.n)));
    html += '<h2>'+titulo+' (sessões)</h2><div class="card">';
    const leram = {}; (m.paisesLeram||[]).forEach(r=>leram[r.pais]=r.n);
    lista.forEach(r=>{ const n=numero(r.n), l=numero(leram[r.pais]); html+='<div class="linha"><span class="nome">'+esc(bandeira(r.pais))+(l?' · '+l+' leram':'')+'</span><span class="barra"><i style="width:'+Math.round(n/maxP*100)+'%"></i></span><span class="n">'+n+'</span></div>'; });
    html += '</div>';
  }
  // Conversão dos últimos 7 dias — % sobre quem abriu o app.
  const a7 = Math.max(1, ev7('app_open'));
  const pc = ev => Math.round(ev7(ev)/a7*100);
  html += '<div class="rodape" style="margin:8px 0 0">7 dias: '+ev7('app_open')+' sessões · '+pc('reading_done')+'% leram · '+pc('paywall_view')+'% viram paywall · '+pc('checkout_click')+'% clicaram assinar</div>';

  // Qual leitura de IA é a favorita (7d) — onde investir conteúdo.
  const iaTop = {};
  (m.ia||[]).forEach(r=>{ iaTop[r.endpoint]=(iaTop[r.endpoint]||0)+numero(r.n); });
  const iaLista = Object.entries(iaTop).sort((a,b)=>b[1]-a[1]).slice(0,6);
  if (iaLista.length) {
    const maxIa = Math.max(1, ...iaLista.map(x=>x[1]));
    html += '<h2>Leituras de IA · 7 dias</h2><div class="card">';
    iaLista.forEach(([nome,n])=>{ html+='<div class="linha"><span class="nome">'+esc(nome)+'</span><span class="barra"><i style="width:'+Math.round(n/maxIa*100)+'%"></i></span><span class="n">'+n+'</span></div>'; });
    html += '</div>';
  }

  // Qual plano chama quando a pessoa vê os preços (cliques, 14d).
  const planos = (m.planosClicados||[]).filter(r=>r.plano);
  if (planos.length) {
    const maxPl = Math.max(1, ...planos.map(r=>numero(r.n)));
    html += '<h2>Planos clicados · 14 dias</h2><div class="card">';
    planos.forEach(r=>{ const n=numero(r.n); html+='<div class="linha"><span class="nome">'+esc(r.plano)+'</span><span class="barra"><i style="width:'+Math.round(n/maxPl*100)+'%"></i></span><span class="n">'+n+'</span></div>'; });
    html += '</div>';
  }

  // Horário de pico em hora do BRASIL — a resposta de "que horas postar".
  const hs = new Array(24).fill(0);
  (m.horas||[]).forEach(r=>{ const h=parseInt(r.h,10); if(Number.isInteger(h)&&h>=0&&h<24) hs[(h+21)%24] += numero(r.n); });
  if (hs.some(v=>v>0)) {
    html += '<h2>Horário das sessões · 7 dias (hora BR)</h2><div class="card">'+barras(hs)+'<div class="rodape" style="margin-top:4px">0h ————————— 12h ————————— 23h</div></div>';
  }

  html += '<h2>Sessões · 14 dias</h2><div class="card">'+barras(porDia(f,r=>r.event==='app_open',dias14))+'</div>';
  html += '<h2>Assinaturas novas · 14 dias</h2><div class="card">'+barras(porDia(((m.assinaturas||{}).novasPorDia||[]),()=>true,dias14))+'</div>';

  html += '<h2>Últimas assinaturas</h2><div class="card"><table>';
  (((m.assinaturas||{}).ultimas)||[]).forEach(r=>{ html+='<tr><td>'+esc(r.email)+'</td><td>'+esc(r.plan)+'</td><td>'+esc(r.status)+'</td><td>'+esc(String(r.quando||'').replace('T',' '))+'</td></tr>'; });
  html += '</table></div>';

  html += '<div class="tiles" style="margin-top:22px">'
    + '<div class="tile"><b>'+((m.push||{}).inscritos == null ? '—' : numero((m.push||{}).inscritos))+'</b><span>push inscritos</span></div>'
    + '<div class="tile"><b>'+((m.push||{}).lembreteDiario == null ? '—' : numero((m.push||{}).lembreteDiario))+'</b><span>lembrete diário</span></div>'
    + '<div class="tile"><b>'+(m.chama == null ? '—' : numero(m.chama))+'</b><span>chamas hoje</span></div>'
    + '<div class="tile"><b>'+ev7('paywall_view')+'</b><span>paywall · 7d</span></div>'
    + '</div>';
  html += '<div class="rodape">atualiza sozinho a cada 60s · fundo do card: '+esc(m.cardsDoDia||'—')+'</div>';

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

  // Freio de força bruta no ADMIN_TOKEN, mesmo padrão do adminLimiter de
  // adminRoutes.js. Não é redundância com ele: hoje o adminRouter está montado
  // ANTES no server.js e acaba cobrindo esta rota por acidente de ordem — uma
  // reordenação silenciosa devolveria a porta aberta. O freio mora junto da
  // rota que ele protege.
  //
  // skipSuccessfulRequests: só tentativa QUE FALHOU gasta o balde. O painel se
  // atualiza sozinho de 60 em 60s; se acerto contasse, o dono deixando a página
  // aberta se auto-bloquearia em 30 minutos.
  const metricsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "muitas tentativas — tente novamente em alguns minutos" },
  });

  router.get("/api/admin/metrics", metricsLimiter, (req, res) => {
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
