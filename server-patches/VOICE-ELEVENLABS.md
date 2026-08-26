# Voz neural (ElevenLabs)

Este patch fica desligado com segurança enquanto `ELEVENLABS_API_KEY` não
existir no ambiente do backend. A chave nunca pertence ao app, ao Git ou a uma
URL. O cliente chama apenas `https://api.cosmicguide.cloud/api/voice/*`.

## Configuração esperada no backend

Obrigatória e secreta:

```dotenv
ELEVENLABS_API_KEY=<valor somente no servidor>
```

Vozes escolhidas (IDs públicos, recomendável deixá-los explícitos no `.env`):

```dotenv
ELEVENLABS_VOICE_ID_PT=UZ8QqWVrz7tMdxiglcLh
ELEVENLABS_VOICE_ID_ES=MA970ZNagubdplnfHEiJ
ELEVENLABS_VOICE_ID_EN=pFZP5JQG7iQjIQuC4Bku
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

- PT: **Livia — Warmth You Can Hear**, profissional, português brasileiro,
  narrativa calorosa e calma.
- ES: **Melodie narradora**, profissional, narrativa calma e com espanhol
  verificado no catálogo da conta.
- EN: **Lily — Velvety Actress**, premade, inglês britânico, narrativa quente
  e clara.

O código tem esses três IDs como defaults não secretos. As variáveis permitem
trocar cada idioma sem publicar outro app. Nenhuma voz clonada/pessoal da conta
foi usada.

Limites opcionais, com defaults seguros:

```dotenv
VOICE_MAX_TEXT_CHARACTERS=10000
VOICE_DAILY_REQUEST_LIMIT=6
VOICE_DAILY_CHARACTER_LIMIT=12000
VOICE_GLOBAL_DAILY_REQUEST_LIMIT=100
VOICE_GLOBAL_DAILY_CHARACTER_LIMIT=100000
VOICE_CACHE_TTL_MS=86400000
VOICE_CACHE_MAX_BYTES=134217728
ELEVENLABS_TIMEOUT_MS=55000
ELEVENLABS_MAX_AUDIO_BYTES=12582912
```

## Como colocar a chave sem vazar

1. Abra uma sessão SSH interativa e edite `/root/forja-backend/.env` no próprio
   servidor. Não passe a chave na linha de comando, em URL, mensagem ou commit.
2. Garanta permissão `600` no `.env` e não execute comandos que imprimam o
   ambiente (`cat .env`, `printenv`, `pm2 env`).
3. Registre as três variáveis `ELEVENLABS_VOICE_ID_*` acima e a chave secreta.
4. Quando houver autorização de publicação, use somente o script oficial e a
   ordem do projeto: backend antes da web. Este patch não executa deploy.
5. Depois do restart, `GET /api/voice/status` deve devolver `available: true` e
   `languages: ["pt", "es", "en"]`. A resposta nunca contém chave ou voice ID.

`POST /api/voice/synthesize` exige JWT Supabase e e-mail confirmado, aceita só
PT/ES/EN, recusa voice ID enviado pelo cliente, limita corpo/custo, usa timeout,
devolve MP3 e mantém cache interno por hash por até 24 horas. O texto não é
gravado como chave, nome de arquivo, métrica ou log.
