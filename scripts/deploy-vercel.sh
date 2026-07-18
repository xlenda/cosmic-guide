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

echo "== vercel deploy =="
cd deploy-vercel
npx vercel link --yes --project cosmic-guide
npx vercel --prod --yes
