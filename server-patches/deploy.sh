#!/usr/bin/env bash
# Deploy do backend corrigido do Cosmic Guide (forja-backend) na VPS.
#
# O que faz, nesta ordem:
#   1. Envia uma cópia isolada para /tmp e instala o lockfile exato ali
#   2. Faz backup consistente do banco e dos artefatos que serão promovidos
#   3. Aplica as migrações NUMA CÓPIA do banco e roda a suíte completa
#   4. Só então copia os arquivos validados e reinicia o pm2
#   5. Verifica saúde e a versão do schema real
#
# COMO RODAR (uma linha, funciona no PowerShell e no Git Bash):
#   bash "C:/Users/XuXa/Downloads/Cosmic Guide/server-patches/deploy.sh"
#
# ORDEM: ESTE SCRIPT VEM ANTES DA WEB. O app chama POST /api/moderation/*
# (Denunciar e Bloquear, exigência de UGC da Play Store), que só existe aqui —
# publicar a Vercel primeiro deixa esses botões devolvendo 404 pra quem já usa
# o app. scripts/deploy-vercel.sh tem um portão que aborta se esta rota não
# estiver no ar, então a ordem errada trava sozinha em vez de vazar pro usuário.
#
# Se a promoção, o restart ou a verificação falharem, este script para o
# serviço, restaura o release anterior e reinicia. O banco atual é preservado
# porque as migrações são aditivas; voltar a um snapshot antigo apagaria UGC,
# pagamentos e webhooks recebidos enquanto a suíte rodava.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE="servidor"
APP_DIR="/root/forja-backend"
TS="$(date +%Y%m%d-%H%M%S)"
STAGE_DIR="/tmp/cosmic-guide-preflight-$TS"
PACKAGE_JSON="$REPO_DIR/package.json"
PACKAGE_LOCK="$REPO_DIR/package-lock.json"
CODE_BACKUP_DIR="$APP_DIR/deploy-backups/$TS"
LOCK_DIR="/tmp/cosmic-guide-deploy.lock"
PROMOTION_ATTEMPTED=0
LOCK_ACQUIRED=0
STAGE_CREATED=0

case "$STAGE_DIR" in
  /tmp/cosmic-guide-preflight-*) ;;
  *) echo "ERRO: caminho de preflight inesperado: $STAGE_DIR"; exit 1 ;;
esac

cleanup_stage() {
  if [ "$STAGE_CREATED" -eq 1 ]; then
    ssh -o ConnectTimeout=25 "$REMOTE" "rm -rf -- '$STAGE_DIR'" >/dev/null 2>&1 || true
    STAGE_CREATED=0
  fi
  if [ "$LOCK_ACQUIRED" -eq 1 ]; then
    ssh -o ConnectTimeout=25 "$REMOTE" "rmdir -- '$LOCK_DIR'" >/dev/null 2>&1 || true
    LOCK_ACQUIRED=0
  fi
}

rollback_remote() {
  local original_status="$1"
  trap - ERR
  set +e

  if [ "$PROMOTION_ATTEMPTED" -eq 1 ]; then
    echo ""
    echo "ERRO: a promoção não ficou saudável. Restaurando a versão anterior..."
    ssh -o ConnectTimeout=25 "$REMOTE" "
      set -u
      cd '$APP_DIR' || exit 1
      pm2 stop forja-backend >/dev/null 2>&1 || true

      if [ -d 'src.bak-$TS' ]; then
        [ ! -e 'src.failed-$TS' ] || exit 1
        [ ! -e src ] || mv src 'src.failed-$TS'
        mv 'src.bak-$TS' src || exit 1
      fi

      if [ -d 'node_modules.bak-$TS' ]; then
        [ ! -e 'node_modules.failed-$TS' ] || exit 1
        [ ! -e node_modules ] || mv node_modules 'node_modules.failed-$TS'
        mv 'node_modules.bak-$TS' node_modules || exit 1
      fi

      for name in scripts test; do
        if [ -e '$CODE_BACKUP_DIR/'\"\$name\" ]; then
          [ ! -e \"\$name.failed-$TS\" ] || exit 1
          [ ! -e \"\$name\" ] || mv \"\$name\" \"\$name.failed-$TS\"
          cp -a '$CODE_BACKUP_DIR/'\"\$name\" \"\$name\" || exit 1
        elif [ -f '$CODE_BACKUP_DIR/.missing-'\"\$name\" ]; then
          [ ! -e \"\$name.failed-$TS\" ] || exit 1
          [ ! -e \"\$name\" ] || mv \"\$name\" \"\$name.failed-$TS\"
        fi
      done

      for name in package.json package-lock.json; do
        if [ -f '$CODE_BACKUP_DIR/'\"\$name\" ]; then
          cp '$CODE_BACKUP_DIR/'\"\$name\" \"\$name\" || exit 1
        elif [ -f '$CODE_BACKUP_DIR/.missing-'\"\$name\" ]; then
          rm -f -- \"\$name\"
        fi
      done

      node -e \"const D=require('better-sqlite3');const db=new D('./data/forja.sqlite',{readonly:true});const check=db.pragma('quick_check',{simple:true});db.close();if(check!=='ok'){console.error(check);process.exit(1);}\" || exit 1
      pm2 restart forja-backend --update-env >/dev/null || exit 1
      sleep 3
      curl -fsS --max-time 8 http://127.0.0.1:3005/health >/dev/null || exit 1
    "
    local rollback_status=$?
    if [ "$rollback_status" -eq 0 ]; then
      echo "Rollback automático concluído; a versão anterior voltou ao ar."
    else
      echo "ERRO CRÍTICO: o rollback automático também falhou. Verifique o serviço imediatamente." >&2
    fi
  fi

  cleanup_stage
  exit "$original_status"
}

trap 'rollback_remote $?' ERR
trap cleanup_stage EXIT

if ! ssh -o ConnectTimeout=25 "$REMOTE" "mkdir -- '$LOCK_DIR'"; then
  echo "ERRO: já existe um deploy do Cosmic Guide em andamento ($LOCK_DIR)." >&2
  exit 1
fi
LOCK_ACQUIRED=1

echo "=============================================="
echo " Deploy backend Cosmic Guide — $TS"
echo "=============================================="

# --- 0. Sanidade: os arquivos existem? -------------------------------------
if [ ! -d "$REPO_DIR/src" ]; then
  echo "ERRO: $REPO_DIR/src não existe. Nada a subir."
  exit 1
fi

# Estes imports já ficaram presentes só na VPS, escondendo ausências no
# repositório. O deploy falha antes do primeiro byte remoto se a fonte da
# verdade não consegue mais iniciar num diretório limpo.
REQUIRED_FILES=(
  "$PACKAGE_JSON"
  "$PACKAGE_LOCK"
  "$REPO_DIR/src/http/server.js"
  "$REPO_DIR/src/infrastructure/db.js"
  "$REPO_DIR/src/infrastructure/imageProcessing.js"
  "$REPO_DIR/src/infrastructure/SubscriptionRepository.js"
  "$REPO_DIR/src/infrastructure/PushSubscriptionRepository.js"
  "$REPO_DIR/src/domain/Subscription.js"
  "$REPO_DIR/src/domain/PaymentProvider.js"
)
for required_file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$required_file" ]; then
    echo "ERRO: $required_file não existe. O backend não iniciaria em ambiente limpo."
    exit 1
  fi
done

LATEST_MIGRATION="$(find "$REPO_DIR/src/infrastructure/migrations" -maxdepth 1 -type f -name '[0-9][0-9][0-9]_*.sql' | sort | tail -1)"
EXPECTED_SCHEMA="$(basename "$LATEST_MIGRATION" | cut -d_ -f1 | sed 's/^0*//')"
if [ -z "$EXPECTED_SCHEMA" ]; then
  echo "ERRO: não foi possível descobrir a última migração."
  exit 1
fi
echo ""
echo "Arquivos que serão enviados:"
find "$REPO_DIR/src" "$REPO_DIR/scripts" "$REPO_DIR/test" -type f 2>/dev/null | sed "s|$REPO_DIR/|  |"
echo "  package.json"
echo "  package-lock.json"

# --- 1. Staging isolado -----------------------------------------------------
echo ""
echo "[1/5] Preparando cópia isolada no servidor..."
ssh -o ConnectTimeout=25 "$REMOTE" "set -e; [ ! -e '$STAGE_DIR' ]; umask 077; install -d -m 700 '$STAGE_DIR'"
STAGE_CREATED=1
scp -o ConnectTimeout=25 -r \
  "$REPO_DIR/src" \
  "$REPO_DIR/scripts" \
  "$REPO_DIR/test" \
  "$PACKAGE_JSON" \
  "$PACKAGE_LOCK" \
  "$REMOTE:$STAGE_DIR/"
ssh -o ConnectTimeout=25 "$REMOTE" "
  set -e
  mkdir -p '$STAGE_DIR/data'
  chmod 700 '$STAGE_DIR/data'
  cd '$STAGE_DIR'
  npm ci --no-audit --no-fund
  cd '$STAGE_DIR/scripts'
  for f in *.sh; do [ -f \"\$f\" ] && sed -i 's/\r$//' \"\$f\" && chmod +x \"\$f\"; done
"

# --- 2. Backups consistentes -----------------------------------------------
echo ""
echo "[2/5] Fazendo backups consistentes do banco e dos arquivos promovidos..."
ssh -o ConnectTimeout=25 "$REMOTE" "
  set -e
  cd '$APP_DIR'
  mkdir -p data/backups
  mkdir -p '$CODE_BACKUP_DIR'
  for name in scripts test package.json package-lock.json; do
    if [ -e \"\$name\" ]; then
      cp -a \"\$name\" '$CODE_BACKUP_DIR/'
    else
      touch '$CODE_BACKUP_DIR/.missing-'\"\$name\"
    fi
  done
  node -e \"const D=require('better-sqlite3');const db=new D('./data/forja.sqlite',{readonly:true});db.backup('./data/backups/forja-pre-deploy-$TS.sqlite').then(function(){db.close();}).catch(function(error){console.error(error.message);process.exit(1);});\"
  cp 'data/backups/forja-pre-deploy-$TS.sqlite' '$STAGE_DIR/data/forja.sqlite'
  chmod 600 '$STAGE_DIR/data/forja.sqlite'
  echo '  banco -> data/backups/forja-pre-deploy-$TS.sqlite'
  echo '  arquivos -> deploy-backups/$TS/'
"

# --- 3. Migração e testes fora de produção --------------------------------
echo ""
echo "[3/5] Aplicando schema numa cópia e rodando a suíte completa..."
ssh -o ConnectTimeout=25 "$REMOTE" "
  set -e
  cd '$STAGE_DIR'
  DATA_DIR='$STAGE_DIR/data' EXPECTED_SCHEMA='$EXPECTED_SCHEMA' node -e \"const opened=require('./src/infrastructure/db').db;const version=opened.pragma('user_version',{simple:true});const integrity=opened.pragma('quick_check',{simple:true});console.log('  preflight schema='+version+' integrity='+integrity);opened.close();if(String(version)!==process.env.EXPECTED_SCHEMA||integrity!=='ok')process.exit(1);\"
  npm ls --depth=0 >/dev/null
  node -e \"const fs=require('fs'),path=require('path'),lock=require('./package-lock.json');const drift=[];for(const [relative,meta] of Object.entries(lock.packages||{})){if(!relative.startsWith('node_modules/')||!meta.version)continue;const manifest=path.join(process.cwd(),relative,'package.json');if(!fs.existsSync(manifest))continue;const live=require(manifest).version;if(live!==meta.version)drift.push(relative+': lock='+meta.version+' runtime='+live);}if(drift.length){console.error(drift.join('\\\\n'));process.exit(1);}console.log('  lock e runtime instalados: idênticos');\"
  npm test
"

# --- 4. Promoção e restart ------------------------------------------------
echo ""
echo "[4/5] Promovendo os arquivos validados e reiniciando..."
PROMOTION_ATTEMPTED=1
ssh -o ConnectTimeout=25 "$REMOTE" "
  set -e
  cd '$APP_DIR'
  if [ -e 'src.bak-$TS' ]; then
    echo 'ERRO: src.bak-$TS já existe.' >&2
    exit 1
  fi
  if [ -e 'node_modules.bak-$TS' ]; then
    echo 'ERRO: node_modules.bak-$TS já existe.' >&2
    exit 1
  fi
  mv src 'src.bak-$TS'
  if ! cp -r '$STAGE_DIR/src' src; then
    mv 'src.bak-$TS' src
    exit 1
  fi
  mv node_modules 'node_modules.bak-$TS'
  if ! mv '$STAGE_DIR/node_modules' node_modules; then
    [ ! -e node_modules ] || mv node_modules 'node_modules.failed-$TS'
    mv 'node_modules.bak-$TS' node_modules
    exit 1
  fi
  mkdir -p scripts test
  cp -r '$STAGE_DIR/scripts/.' scripts/
  cp -r '$STAGE_DIR/test/.' test/
  cp '$STAGE_DIR/package.json' package.json
  cp '$STAGE_DIR/package-lock.json' package-lock.json
  cd scripts
  for f in *.sh; do [ -f \"\$f\" ] && chmod +x \"\$f\"; done
  cd '$APP_DIR'
  pm2 restart forja-backend --update-env >/dev/null
  sleep 3
  echo '  reiniciado.'
"

# --- 5. Verificação ---------------------------------------------------------
echo ""
echo "[5/5] Verificando produção..."
ssh -o ConnectTimeout=25 "$REMOTE" "
  set -e
  cd '$APP_DIR'
  printf '  health local: '
  curl -fsS --max-time 8 http://127.0.0.1:3005/health
  echo ''
  VERSION=\$(node -e \"const D=require('better-sqlite3');const db=new D('./data/forja.sqlite',{readonly:true});process.stdout.write(String(db.pragma('user_version',{simple:true})));db.close();\")
  echo \"  user_version do banco: \$VERSION\"
  if [ \"\$VERSION\" != '$EXPECTED_SCHEMA' ]; then
    echo 'ERRO: schema de produção não chegou a $EXPECTED_SCHEMA.' >&2
    exit 1
  fi
  QUICK_CHECK=\$(node -e \"const D=require('better-sqlite3');const db=new D('./data/forja.sqlite',{readonly:true});process.stdout.write(String(db.pragma('quick_check',{simple:true})));db.close();\")
  echo \"  quick_check do banco: \$QUICK_CHECK\"
  if [ \"\$QUICK_CHECK\" != 'ok' ]; then
    echo 'ERRO: quick_check do banco de produção falhou.' >&2
    exit 1
  fi
  COMMUNITY_STATUS=\$(curl -sS --max-time 8 -o /dev/null -w '%{http_code}' http://127.0.0.1:3005/api/social/community/plaza)
  echo \"  rota Comunidade sem sessão: HTTP \$COMMUNITY_STATUS\"
  if [ \"\$COMMUNITY_STATUS\" != '401' ]; then
    echo 'ERRO: a rota da Comunidade não respondeu com o contrato de autenticação esperado.' >&2
    exit 1
  fi
  VOICE_STATUS_JSON=\$(curl -fsS --max-time 8 http://127.0.0.1:3005/api/voice/status)
  VOICE_STATUS_JSON="\$VOICE_STATUS_JSON" node -e \"const status=JSON.parse(process.env.VOICE_STATUS_JSON);const languages=[...(status.languages||[])].sort().join(',');if(status.available!==true||languages!=='en,es,pt'||status.maxCharacters!==10000||status.requiresLogin!==true||status.requiresVerifiedEmail!==true){console.error('status de voz fora do contrato');process.exit(1)}\"
  echo '  rota Voz: disponível em PT/ES/EN, limite 10000, login e e-mail confirmado obrigatórios'
  VOICE_SYNTH_STATUS=\$(curl -sS --max-time 8 -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' http://127.0.0.1:3005/api/voice/synthesize)
  echo \"  rota Voz sem sessão: HTTP \$VOICE_SYNTH_STATUS\"
  if [ \"\$VOICE_SYNTH_STATUS\" != '401' ]; then
    echo 'ERRO: a síntese de voz não exigiu a autenticação esperada.' >&2
    exit 1
  fi
  MODERATION_STATUS=\$(curl -sS --max-time 8 -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' http://127.0.0.1:3005/api/moderation/report)
  echo \"  rota Moderação com corpo inválido: HTTP \$MODERATION_STATUS\"
  if [ \"\$MODERATION_STATUS\" != '400' ]; then
    echo 'ERRO: a rota de Moderação não respondeu com o contrato esperado.' >&2
    exit 1
  fi
  # Prova que ADMIN_TOKEN está configurado sem ler nem imprimir o segredo.
  # Sem a env a rota responde 503; configurada e sem header precisa responder
  # 401. Assim o deploy não deixa a fila humana virar uma tela inoperante.
  ADMIN_STATUS=\$(curl -sS --max-time 8 -o /dev/null -w '%{http_code}' http://127.0.0.1:3005/api/admin/metrics)
  echo \"  painel admin sem credencial: HTTP \$ADMIN_STATUS\"
  if [ \"\$ADMIN_STATUS\" != '401' ]; then
    echo 'ERRO: ADMIN_TOKEN ausente ou proteção do Painel fora do contrato (esperado 401 sem credencial).' >&2
    exit 1
  fi
  echo '  --- migrações aplicadas neste boot ---'
  pm2 logs forja-backend --lines 40 --nostream 2>/dev/null | grep -i 'migration' | tail -5 || echo '  (nenhuma linha de migração no log)'
  echo '  --- erros recentes ---'
  pm2 logs forja-backend --lines 20 --nostream --err 2>/dev/null | tail -5
"

echo ""
echo "=============================================="
echo " Deploy concluído."
echo ""
echo " Backend no ar. AGORA sim dá pra publicar a web:"
echo "   bash scripts/deploy-vercel.sh"
echo ""
echo " Se precisar reverter:"
echo "   o rollback automático restaura o release e mantém as escritas atuais no banco"
echo "   snapshot SQLite de emergência (restaurar apenas offline): data/backups/forja-pre-deploy-$TS.sqlite"
echo "   backup auxiliar de scripts/package: $CODE_BACKUP_DIR"
echo "   dependências anteriores: $APP_DIR/node_modules.bak-$TS"
echo "=============================================="
