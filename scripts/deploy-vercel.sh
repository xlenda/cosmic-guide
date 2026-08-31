#!/usr/bin/env bash
# Deploy do Cosmic Guide (web) pra Vercel — cosmicguide.cloud.
#
# Dois problemas reais já resolvidos aqui, pra nunca mais acontecer de novo:
#
# 1. app.json tem `experiments.baseUrl: "/cosmic-guide"` fixo (não condicional
#    como o funil em c:/tmp/gilfforever/web) — então o dist/ sempre espera
#    viver dentro de um subpath /cosmic-guide/, mesmo na Vercel (que por
#    padrão serviria da raiz). Por isso aninhamos dist/ dentro de uma pasta
#    cosmic-guide/ + um index.html de redirect na raiz, replicando a mesma
#    estrutura usada no VPS.
#
# 2. A Vercel IGNORA por padrão qualquer pasta chamada "node_modules" em
#    qualquer lugar da árvore (comportamento hard-coded do CLI, não dá pra
#    desligar via .vercelignore). O Expo nomeia a pasta de assets hasheados
#    reaproveitando o caminho original de node_modules (ex.:
#    dist/assets/node_modules/@expo/vector-icons/.../Ionicons.ttf) — sem o
#    rename abaixo, a Vercel descarta essa pasta inteira no upload e todo
#    ícone do app (Ionicons) e os ícones de navegação somem em produção
#    (bug real encontrado em 17/07/2026: "tudo sem imagem", cartas de Tarô
#    invisíveis porque usam só Ionicons, nenhuma imagem raster).
set -euo pipefail
cd "$(dirname "$0")/.."

# ORDEM DE DEPLOY: BACKEND PRIMEIRO, WEB DEPOIS.
#
# Denunciar e Bloquear (exigência de Conteúdo Gerado pelo Usuário da Play
# Store) e o Denunciar da IA chamam POST /api/moderation/*. Essa rota mora no
# backend da VPS, não na Vercel — se a web nova subir antes, todo toque nesses
# botões devolve 404 e a pessoa vê "não deu" sem entender nada. Nada aqui fala
# com o servidor (zero ssh/rsync): o backend sobe por
# `bash server-patches/deploy.sh`, execução separada e manual.
#
# Por isso o portão abaixo, ANTES de tudo: uma requisição inválida de propósito
# (corpo vazio) que só serve pra saber se a rota EXISTE — 400 significa que o
# backend está no ar com a moderação; 404 significa que não está.
echo "== portão: moderação no ar no backend (a web depende dela) =="
MOD_STATUS="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -X POST -H 'Content-Type: application/json' -d '{}' https://api.cosmicguide.cloud/api/moderation/report || echo 000)"
if [ "$MOD_STATUS" = "404" ] || [ "$MOD_STATUS" = "000" ]; then
  echo ""
  echo "ABORTADO: POST /api/moderation/report respondeu $MOD_STATUS."
  echo "Denunciar e Bloquear quebrariam em silêncio pra quem já usa o app."
  echo "Suba o backend PRIMEIRO:  bash server-patches/deploy.sh"
  echo "Depois rode este script de novo."
  exit 1
fi
echo "  ok (HTTP $MOD_STATUS — a rota existe)"

echo "== npm test =="
npm test

echo "== expo export --platform web =="
rm -rf dist deploy-vercel
npx expo export --platform web

if [ -d "dist/assets/node_modules" ]; then
  echo "== corrigindo pastas 'node_modules' dentro de assets/ (ignoradas pela Vercel) =="
  mv dist/assets/node_modules dist/assets/_modules
  grep -rl 'assets/node_modules/' dist/_expo/static/js/web/*.js | while read -r f; do
    sed -i 's#assets/node_modules/#assets/_modules/#g' "$f"
  done
fi

echo "== montando estrutura aninhada (cosmic-guide/ + redirect na raiz) =="
mkdir -p deploy-vercel/cosmic-guide
cp -r dist/* deploy-vercel/cosmic-guide/
cat > deploy-vercel/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=/cosmic-guide/" />
    <title>Cosmic Guide</title>
  </head>
  <body>
    <script>window.location.replace('/cosmic-guide/');</script>
    <p>Redirecionando para <a href="/cosmic-guide/">Cosmic Guide</a>...</p>
  </body>
</html>
EOF

# X-Frame-Options + frame-ancestors: sem isso, cosmicguide.cloud podia ser
# aberto dentro de um <iframe> de outro site e sobrepor um botão invisível
# por cima do login com Google (clickjacking) — achado real de auditoria,
# 25/07/2026. 'self' (não 'none') porque o próprio app se abre a partir de
# oddpro.pro/cosmic-guide/ (redirect de topo, não iframe), então não precisa
# ser mais restrito que isso.
#
# Permissions-Policy: microphone PRECISA ser (self). Allowlist vazia `()`
# desliga o microfone até para a própria origem — foi assim que o ditado de
# voz do VoiceInsightRecorder quebrou na web (SpeechRecognition dispara
# onerror not-allowed sem nem pedir permissão à pessoa). Quem for endurecer
# isto de novo: test/voiceIntegration.test.js trava a allowlist vazia NA REGRA
# global `/(.*)`. Uma regra NOVA, com outro source, ele nao ve.
#
# Os primeiros rewrites (/excluir-conta e /cosmic-guide/privacidade) vêm ANTES
# do coringa de propósito: são documentos públicos que precisam abrir sem
# sessão e mesmo com JavaScript desligado. Ambos nascem em public/, são
# copiados pro dist/ pelo expo export e não podem cair no onboarding da SPA.
# Rewrite em vez de redirect mantém a URL pública/canônica no navegador.
#
# rewrites (SPA fallback): as rotas do React Navigation viram paths reais na
# URL (/Planos, /Loja, /Tarô…) que NÃO existem como arquivo — sem o
# fallback, apertar F5 (ou abrir um link direto) em qualquer tela interna
# devolvia o 404 da Vercel (achado real, 26/07/2026, pego pelo teste do Tema
# dourado que recarregava a página na Loja). O filesystem tem precedência:
# arquivos reais (/cosmic-guide/*, og-image, ícones) continuam servidos
# direto, só o que não existe cai no index do app.
cat > deploy-vercel/vercel.json << 'EOF'
{
  "redirects": [
    { "source": "/privacidade", "destination": "/cosmic-guide/privacidade", "permanent": true },
    { "source": "/privacidade/", "destination": "/cosmic-guide/privacidade", "permanent": true },
    { "source": "/cosmic-guide/privacidade/", "destination": "/cosmic-guide/privacidade", "permanent": true },
    { "source": "/cosmicguide", "destination": "/cosmic-guide/", "permanent": true },
    { "source": "/cosmicguide/", "destination": "/cosmic-guide/", "permanent": true },
    { "source": "/cosmicguide/:path+", "destination": "/cosmic-guide/:path+", "permanent": true }
  ],
  "rewrites": [
    { "source": "/excluir-conta", "destination": "/cosmic-guide/excluir-conta.html" },
    { "source": "/cosmic-guide/privacidade", "destination": "/cosmic-guide/privacidade.html" },
    { "source": "/:path*", "destination": "/cosmic-guide/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Content-Security-Policy", "value": "frame-ancestors 'self'" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(self), microphone=(self), geolocation=()" }
      ]
    }
  ]
}
EOF

# Suíte de regressão E2E ANTES de publicar — cada cenário é um bug real já
# corrigido (25-26/07/2026); se qualquer mudança reintroduzir um deles, o
# deploy aborta aqui (set -e) em vez de o cliente descobrir primeiro.
echo "== regressão e2e (bloqueia o deploy se falhar) =="
node scripts/e2e-regression.js deploy-vercel

echo "== vercel deploy =="
cd deploy-vercel

# O Node distribuído nesta máquina não herdava automaticamente a autoridade
# certificadora do Windows e a CLI falhava antes de autenticar com
# `unable to verify the first certificate`. Usar a CA do sistema mantém a
# validação TLS ativa; não usamos NODE_TLS_REJECT_UNAUTHORIZED=0 nem qualquer
# outro atalho inseguro.
VERCEL_CLI="$(npm root -g | tr '\\' '/')/vercel/dist/vc.js"
if [ ! -f "$VERCEL_CLI" ]; then
  echo "ABORTADO: CLI global da Vercel não encontrada em $VERCEL_CLI"
  exit 1
fi
node --use-system-ca "$VERCEL_CLI" link --yes --project cosmic-guide
node --use-system-ca "$VERCEL_CLI" --prod --yes
