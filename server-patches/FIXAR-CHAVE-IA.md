# A chave da IA está só na memória — precisa ir pro arquivo

**Risco:** todas as leituras de IA (sonho, palma, café, rosto, pé, pintas, chat e
"lapidar insight") viram texto enlatado, em silêncio, no dia em que o processo
subir sem a chave. Nenhum erro aparece pro usuário — só uma leitura genérica no
lugar da personalizada, que foi exatamente a queixa do testador em 29/07.

## O que está acontecendo

O processo `forja-backend` sobe com `node --env-file=.env`, mas a
`ANTHROPIC_API_KEY` **não está no `.env`**. Ela existe só na memória do processo,
provavelmente porque foi passada na linha de comando quando o pm2 iniciou o app
pela primeira vez, e desde então vive no `dump.pm2`.

Verificado em 30/07/2026:

```
grep -c '^ANTHROPIC_API_KEY=' .env        →  0   (não está no arquivo)
tr '\0' '\n' < /proc/<pid>/environ | grep -c '^ANTHROPIC_API_KEY='  →  1   (está na memória)
```

O código lê `process.env.ANTHROPIC_API_KEY` e, sem ela, monta `aiProvider = null`
— aí toda rota de IA responde 503 e o app cai no fallback enlatado. Está escrito
no próprio `server.js`: *"Sem chave configurada, os endpoints respondem 503 em vez
de derrubar o processo"*. Isso é bom pra não derrubar o servidor, e ruim porque
falha caladinho.

## Quando isso explode

- `pm2 delete` seguido de `pm2 start` (o dump é reescrito sem a chave)
- reinstalação do pm2 ou perda do `~/.pm2/dump.pm2`
- migração de VPS (aconteceu uma vez em 29/07 — o disco veio junto, mas o dump
  poderia não ter vindo)
- qualquer pessoa que suba o serviço "do jeito documentado", já que a documentação
  diz que a config vive no `.env`

## Como resolver (2 minutos, no servidor)

Você precisa da chave em mãos. Pegue no processo que está rodando agora — enquanto
ele estiver vivo, ela existe lá:

```bash
ssh servidor
cd /root/forja-backend
PID=$(pm2 pid forja-backend)
tr '\0' '\n' < /proc/$PID/environ | grep '^ANTHROPIC_API_KEY='
```

Copie a linha inteira que aparecer e acrescente ao `.env`:

```bash
nano /root/forja-backend/.env
# cole a linha ANTHROPIC_API_KEY=... no fim do arquivo, salve com Ctrl+O e Ctrl+X
```

Reinicie lendo o arquivo e confirme que a chave agora vem de lá:

```bash
pm2 restart forja-backend --update-env
grep -c '^ANTHROPIC_API_KEY=' /root/forja-backend/.env    # tem que dar 1
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:3005/api/dream \
  -H 'Content-Type: application/json' -d '{"dreamText":"teste"}'   # tem que dar 200
```

Se der `503` no último comando, a chave não foi lida — confira se a linha está sem
espaços em volta do `=` e sem aspas.

## Por que eu não fiz isso sozinho

Ler o valor de uma chave de API e gravá-la em outro lugar é manipulação de segredo:
o valor apareceria no histórico desta sessão e nos logs. Prefiro que ele nunca passe
por aqui. São dois comandos seus e o segredo não sai do servidor.

## Enquanto não fizer

O app continua funcionando normalmente — a chave está viva na memória e o serviço
não vai cair sozinho. O risco só se realiza num restart "limpo" do pm2 ou numa
migração. Mas quando acontecer, a falha é silenciosa: você só descobre quando um
cliente reclamar que a leitura veio genérica.
