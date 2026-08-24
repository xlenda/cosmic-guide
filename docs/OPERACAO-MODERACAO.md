# Operação humana da Comunidade

Este documento descreve a parte que o código não consegue cumprir sozinho:
alguém precisa abrir a fila, ler o contexto e tomar uma decisão. O Painel ajuda
a executar e registrar a decisão; ele não decide se uma pessoa violou as
Diretrizes.

## Acesso seguro

- Painel: `https://api.cosmicguide.cloud/painel`.
- O atalho aceito é `/painel#t=TOKEN`. Nunca use `?t=TOKEN`, porque query string
  vai para logs de acesso.
- O token fica no `localStorage` do aparelho do dono. Use apenas aparelho
  protegido, não compartilhe o token e toque em **sair** num aparelho alheio.
- O deploy oficial prova apenas que `ADMIN_TOKEN` está configurado: sem enviar
  credencial, `/api/admin/metrics` precisa responder `401`. Ele nunca imprime o
  segredo.

## Rotina obrigatória: dois turnos por dia

Abra o Painel uma vez de manhã e outra à noite.

Em cada turno:

1. Confira **denúncias abertas**, **abertas há mais de 24h** e a idade da mais
   antiga.
2. Leia motivo, tipo, pessoa identificada e o instantâneo do conteúdo.
3. Resolva cada linha com uma destas ações:
   - **Remover:** apaga o post ou comentário. A cópia da denúncia permanece como
     evidência de moderação.
   - **Arquivar:** fecha uma denúncia sem violação ou sem elemento suficiente.
   - **Suspender pessoa:** remove a presença social e impede que ela volte à
     Comunidade até revisão. Denúncias, evidências e bloqueios são preservados.
4. Confirme que a fila voltou a zero ou registre por que algum caso ficou
   pendente.
5. Confira **Participações suspensas** e qualquer recurso recebido.

Uma denúncia que passa de 24 horas aparece destacada. Isso é indicador de
cadência, não atendimento automático: se ninguém abrir o Painel, ninguém
revisa.

Se o Painel mostrar **dados desatualizados** ou qualquer bloco de moderação
como **indisponível**, não trate contadores antigos, traços ou ausência de linhas
como fila zerada. Recarregue, confira a saúde do servidor e só encerre o turno
depois de obter um carregamento novo com horário visível no cabeçalho.

## Severidade e resposta

### Imediata

- risco crível e atual de violência;
- exploração sexual ou qualquer conteúdo sexual envolvendo menores;
- exposição de endereço, telefone, localização ou outro dado que coloque uma
  pessoa em risco;
- incentivo direto a automutilação ou suicídio;
- ameaça concreta ou instrução que facilite dano.

Preserve a denúncia, remova o conteúdo e suspenda a presença quando necessário.
Escalonamento a autoridades ou serviços de emergência depende do caso, da
jurisdição e de decisão humana; o Cosmic Guide não é um canal de emergência.

### No mesmo turno

- assédio, perseguição, discurso de ódio ou humilhação dirigida;
- fraude, phishing, golpe, spam persistente ou malware;
- impersonação e publicação de conteúdo privado sem autorização;
- reincidência depois de orientação ou remoção anterior.

### Padrão

- conflito sem ameaça;
- conteúdo fora de tema;
- publicidade repetitiva de baixo risco;
- denúncia sem evidência suficiente.

Remova apenas quando houver violação. Arquive quando não houver; não use
suspensão como atalho para esvaziar a fila.

## Suspensão e reversão

- O Painel exige um motivo interno para suspender e outro para reverter.
- Registre a regra violada e o contexto necessário, sem copiar dados pessoais
  que não sejam indispensáveis à decisão.
- Cada ação entra em `moderation_actions`; o histórico não é substituído pela
  decisão seguinte e o banco recusa alteração ou exclusão dessas linhas.
- Suspender remove perfil, posts, comentários, curtidas e vínculos de seguir.
- Bloqueios e evidências permanecem. Se houver reversão, os bloqueios antigos
  continuam protegendo as mesmas pessoas.
- Reverter permite criar um novo perfil social, mas não restaura conteúdo
  removido. Explique isso em qualquer recurso aceito.

## Recursos e contato

As Diretrizes e os Termos apontam para `contato@cosmicguide.cloud`. Em
24/08/2026 o domínio continuava **sem MX e sem SPF/TXT**, portanto essa caixa
não recebe mensagens. Esta é uma dependência externa do dono, não algo que um
deploy de código consiga corrigir.

Antes de chamar o canal de operacional, o dono precisa:

1. criar a caixa;
2. publicar MX e autenticação de e-mail (SPF/DKIM e, de preferência, DMARC);
3. enviar e responder uma mensagem real de fora do domínio;
4. conferir a caixa nos mesmos dois turnos da fila;
5. registrar no histórico o motivo quando um recurso reverter suspensão.

Enquanto isso não for feito, não afirmar que recursos por e-mail estão sendo
recebidos. Se o dono escolher um endereço provisório que funcione, deve atualizar
a fonte central `lib/supportContact.js` e todos os textos/testes que ainda
possuem o endereço literal.

## Verificação técnica depois de mudança

1. Rode os testes do backend, incluindo `moderation.http.test.js` e
   `painel.test.js`.
2. Confirme que a migração mais recente virou o `user_version` esperado e que
   `quick_check` está `ok`.
3. Publique somente pelo script oficial do backend.
4. Confirme os probes de Comunidade, Moderação e Painel no fim do script.
5. Só depois publique a web pelo script oficial.

Não consulte nem altere o SQLite de produção para “resolver rápido”. Ações de
moderação passam pelas rotas administrativas para permanecerem transacionais e
auditáveis.
