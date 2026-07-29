#!/usr/bin/env bash
# Deploy do backend corrigido do Cosmic Guide (forja-backend) na VPS.
#
# O que faz, nesta ordem:
#   1. Backup do banco E do código atual (rollback em um comando se der errado)
#   2. Copia os arquivos corrigidos de server-patches/src/, /scripts/ e /test/
#   3. Reinicia o pm2 — as migrações pendentes (008+) são aplicadas sozinhas no boot,
#      pelo runner de migrations/ que compara user_version (hoje 7)
#   4. Verifica saúde e mostra a versão do schema depois
#
# COMO RODAR (uma linha, funciona no PowerShell e no Git Bash):
#   bash "C:/Users/XuXa/Downloads/Cosmic Guide/server-patches/deploy.sh"
#
# ROLLBACK (se algo quebrar — o caminho exato é impresso no fim):
#   ssh servidor "cd /root/forja-backend; rm -rf src; mv src.bak-<TS> src; cp data/backups/forja-pre-deploy-<TS>.sqlite data/forja.sqlite; pm2 restart forja-backend"

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE="servidor"
APP_DIR="/root/forja-backend"
TS="$(date +%Y%m%d-%H%M%S)"

echo "=============================================="
echo " Deploy backend Cosmic Guide — $TS"
echo "=============================================="

# --- 0. Sanidade: os arquivos existem? -------------------------------------
if [ ! -d "$REPO_DIR/src" ]; then
  echo "ERRO: $REPO_DIR/src não existe. Nada a subir."
  exit 1
fi
echo ""
echo "Arquivos que serão enviados:"
find "$REPO_DIR/src" "$REPO_DIR/scripts" "$REPO_DIR/test" -type f 2>/dev/null | sed "s|$REPO_DIR/|  |"

# --- 1. Backup --------------------------------------------------------------
echo ""
echo "[1/4] Backup do banco e do código atual..."
ssh -o ConnectTimeout=25 "$REMOTE" "
  set -e
  cd $APP_DIR
  mkdir -p data/backups
  cp data/forja.sqlite data/backups/forja-pre-deploy-$TS.sqlite
  cp -r src src.bak-$TS
  echo '  banco  -> data/backups/forja-pre-deploy-$TS.sqlite'
  echo '  codigo -> src.bak-$TS'
"

# --- 2. Envio ---------------------------------------------------------------
echo ""
echo "[2/4] Enviando arquivos corrigidos..."
# -r preserva a estrutura de diretórios (src/infrastructure/..., src/application/...)
scp -o ConnectTimeout=25 -r "$REPO_DIR/src/." "$REMOTE:$APP_DIR/src/"
if [ -d "$REPO_DIR/scripts" ]; then
  ssh -o ConnectTimeout=25 "$REMOTE" "mkdir -p $APP_DIR/scripts"
  scp -o ConnectTimeout=25 -r "$REPO_DIR/scripts/." "$REMOTE:$APP_DIR/scripts/"
  # Os .sh de scripts/ são chamados pelo CRON (healthcheck.sh de 5 em 5 min,
  # canary-check.sh de 15 em 15). Vindo de um scp a partir do Windows, o bit
  # de execução não sobrevive — e um cron que perde o +x falha CALADO: some do
  # log, nenhuma task de alerta é criada, e o monitoramento fica "verde" por
  # ausência de notícias. Também normaliza CRLF, que faria o bash reclamar de
  # "\r: command not found" na primeira linha.
  ssh -o ConnectTimeout=25 "$REMOTE" "
    cd $APP_DIR/scripts
    for f in *.sh; do [ -f \"\$f\" ] && sed -i 's/\r$//' \"\$f\" && chmod +x \"\$f\"; done
    echo '  scripts .sh normalizados e executáveis.'
  "
fi
# Os testes vão junto (o servidor já tem supertest em devDependencies). Sem
# isto, os testes escritos aqui nunca chegam a rodar contra o código que está
# de fato em produção — e foi assim que a rota /api/track ficou pronta, testada
# e SEM a linha de mount no server.js: a suíte que teria pego isso vivia só na
# máquina de quem escreveu. Nomes não colidem com os testes que já existem lá.
# Nada em test/ é carregado pelo pm2, então não muda nada em tempo de execução.
if [ -d "$REPO_DIR/test" ]; then
  ssh -o ConnectTimeout=25 "$REMOTE" "mkdir -p $APP_DIR/test"
  scp -o ConnectTimeout=25 -r "$REPO_DIR/test/." "$REMOTE:$APP_DIR/test/"
fi
echo "  enviado."

# --- 3. Restart (migrações aplicam sozinhas no boot) ------------------------
echo ""
echo "[3/4] Reiniciando o serviço..."
ssh -o ConnectTimeout=25 "$REMOTE" "cd $APP_DIR && pm2 restart forja-backend --update-env >/dev/null && sleep 3 && echo '  reiniciado.'"

# --- 4. Verificação ---------------------------------------------------------
echo ""
echo "[4/4] Verificando..."
ssh -o ConnectTimeout=25 "$REMOTE" "
  cd $APP_DIR
  printf '  health local: '
  curl -s --max-time 8 http://127.0.0.1:3005/health || echo '(SEM RESPOSTA)'
  echo ''
  printf '  user_version do banco: '
  node -e \"const D=require('better-sqlite3');const db=new D('./data/forja.sqlite',{readonly:true});console.log(db.pragma('user_version',{simple:true}));db.close();\"
  echo '  --- migrações aplicadas neste boot ---'
  pm2 logs forja-backend --lines 40 --nostream 2>/dev/null | grep -i 'migration' | tail -5 || echo '  (nenhuma linha de migração no log)'
  echo '  --- erros recentes ---'
  pm2 logs forja-backend --lines 20 --nostream --err 2>/dev/null | tail -5
"

echo ""
echo "=============================================="
echo " Deploy concluído."
echo ""
echo " Se precisar reverter:"
echo "   ssh servidor \"cd $APP_DIR; rm -rf src; mv src.bak-$TS src; cp data/backups/forja-pre-deploy-$TS.sqlite data/forja.sqlite; pm2 restart forja-backend\""
echo "=============================================="
