#!/bin/bash
# scripts/somar-musica-de-fundo.sh — põe a música de fundo sob as vozes geradas.
#
# POR QUE ISTO EXISTE
# As gravações originais do dono (carta-4/5/6) sempre tiveram uma música sutil
# por baixo da voz: tom fundamental em 393 Hz, cerca de 30 dB abaixo da fala.
# É invisível em qualquer medição de nível médio — e mesmo assim o dono OUVIU a
# falta dela duas vezes: em 10/09/2026 nas vozes clonadas do Fio Vermelho, e em
# 12/09/2026 nas 54 vozes ES/EN geradas para o Cosmic Guide.
#
# Voz nova nasce sem música. Tem de passar por aqui antes de entrar no app,
# senão o ouvido percebe a troca de ambiente no meio da leitura.
#
#   bash scripts/somar-musica-de-fundo.sh <arquivo.m4a> [outro.m4a ...]
#   bash scripts/somar-musica-de-fundo.sh assets/madremaria/audio/*.es.m4a
#
# O QUE ELE FAZ, e de onde cada número veio (AGENTS.md do Fio Vermelho, §7.1):
#   1. extrai 26,70-27,90s de carta-4.m4a — um trecho SEM voz, só música;
#   2. transforma em volta contínua por acrossfade (período real 0,941s);
#   3. soma sob a voz a 27 dB abaixo dela (a faixa medida foi 26-28 dB);
#   4. guarda o original em originais-sem-musica/ antes de sobrescrever.
#
# O ORIGINAL NUNCA SE PERDE: se o resultado não agradar, é só copiar de volta
# de originais-sem-musica/. Foi assim que o Fio Vermelho fez, e é o que permite
# refazer com outro volume sem regravar nada.
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
AUDIO="$RAIZ/assets/madremaria/audio"
FONTE="$AUDIO/carta-4.m4a"          # a gravação do dono, onde a música vive
GUARDA="$AUDIO/originais-sem-musica"
INI=26.70                            # trecho sem voz de carta-4
DUR=1.20
ABAIXO_DB=22                         # quanto a musica fica abaixo da voz

[ -f "$FONTE" ] || { echo "ERRO: não achei $FONTE (a fonte da música)"; exit 1; }
[ $# -gt 0 ] || { echo "uso: $0 <arquivo.m4a> [...]"; exit 1; }

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$GUARDA"

# --- 1. o pedaço de música, isolado e levado a um nível conhecido -------
# O trecho cru mede ~-47 dB: é a música JÁ atenuada dentro da gravação. Somá-la
# "27 dB abaixo" desse valor a levaria a -74 dB — inaudível, e o AAC a
# descartaria. Na primeira tentativa (12/09) o script rodou, reescreveu os
# arquivos e não mudou NADA: medi o mesmo instante antes e depois e deu
# idêntico. Por isso aqui a música sobe a um nível conhecido primeiro, e só
# depois desce o tanto certo em relação à voz de CADA arquivo.
# O passa-faixa 200-2000 Hz descarta o ruído de fundo fora da região da música
# (fundamental 393 Hz + harmônicos em 786/1179/1572).
ffmpeg -v error -y -ss "$INI" -t "$DUR" -i "$FONTE" -ac 1 \
  -af "highpass=f=200,lowpass=f=2000,volume=40dB,alimiter=limit=0.9" \
  "$tmp/trecho.wav"

# nível da música depois do ganho — medido, não suposto
NIVEL_MUSICA=$(ffmpeg -v info -i "$tmp/trecho.wav" -af volumedetect -f null - 2>&1 \
  | grep -oE "mean_volume: -?[0-9.]+" | grep -oE "\-?[0-9.]+$")

# --- 2. volta contínua: acrossfade consigo mesmo tira a emenda seca ------
# Sem o crossfade, o loop dá um "clique" a cada volta — audível justamente
# no silêncio, que é onde a música existe para ser notada.
ffmpeg -v error -y -i "$tmp/trecho.wav" -i "$tmp/trecho.wav" \
  -filter_complex "[0][1]acrossfade=d=0.13:c1=tri:c2=tri" "$tmp/loop.wav"

feitos=0; pulados=0
for alvo in "$@"; do
  [ -f "$alvo" ] || { echo "  pulei (não existe): $alvo"; pulados=$((pulados+1)); continue; }
  nome=$(basename "$alvo")

  # já passou por aqui? não somar duas vezes.
  if [ -f "$GUARDA/$nome" ]; then
    echo "  pulei (já tem música): $nome"
    pulados=$((pulados+1)); continue
  fi

  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$alvo" | tr -d '\r')

  # --- 3. quanto baixar a música NESTE arquivo --------------------------
  # O alvo é a música ficar ABAIXO_DB abaixo da VOZ deste arquivo. Cada voz tem
  # seu nível, então a conta é por arquivo, com valores medidos dos dois lados:
  #   ganho = (voz - ABAIXO_DB) - musica
  nivel_voz=$(ffmpeg -v info -i "$alvo" -af volumedetect -f null - 2>&1 \
    | grep -oE "mean_volume: -?[0-9.]+" | grep -oE "\-?[0-9.]+$")
  ganho=$(awk "BEGIN{printf \"%.1f\", ($nivel_voz - $ABAIXO_DB) - $NIVEL_MUSICA}")

  # --- 4. música em loop, no comprimento da voz, somada por baixo -------
  ffmpeg -v error -y -i "$alvo" -stream_loop -1 -i "$tmp/loop.wav" \
    -filter_complex "[1:a]atrim=0:${dur},volume=${ganho}dB,afade=t=in:d=0.5,afade=t=out:st=$(awk "BEGIN{print $dur-0.5}"):d=0.5[m];[0:a][m]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[out]" \
    -map "[out]" -c:a aac -b:a 56k -ac 1 -movflags +faststart "$tmp/saida.m4a"

  # --- 4. guarda o original ANTES de trocar ----------------------------
  cp "$alvo" "$GUARDA/$nome"
  mv "$tmp/saida.m4a" "$alvo"
  feitos=$((feitos+1))
  printf "  ok %-34s %s\n" "$nome" "$(du -h "$alvo" | cut -f1)"
done

cat > "$GUARDA/LEIA-ME.txt" <<'TXT'
AS VOZES ANTES DA MÚSICA DE FUNDO

Cópia intacta das vozes como saíram do ElevenLabs, SEM a música.

As gravações originais do dono (carta-4/5/6) sempre tiveram uma música sutil
por baixo, ~30 dB abaixo da voz, tom fundamental em 393 Hz. Voz clonada nasce
sem ela, e o dono ouve a diferença — ouviu duas vezes, em 10/09 e 12/09/2026.

A música é extraída de carta-4.m4a (26,70-27,90s, trecho sem voz), vira volta
contínua por acrossfade e é somada a 27 dB abaixo da voz.

Para desfazer: copiar estes arquivos de volta para assets/madremaria/audio/.
Para refazer com outro volume: desfazer primeiro, depois rodar
scripts/somar-musica-de-fundo.sh com ABAIXO_DB ajustado.
TXT

echo
echo "música somada em $feitos arquivo(s); $pulados pulado(s)."
echo "originais guardados em $GUARDA/"
