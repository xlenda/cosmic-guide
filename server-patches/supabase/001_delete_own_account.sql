-- EXCLUSÃO DE CONTA DE VERDADE — exigência da política de Exclusão de Dados do
-- Google Play (obrigatória desde 2024 para todo app que permite criar conta).
--
-- ⚠️ ISTO NÃO É UMA MIGRAÇÃO DO BANCO DA API. Este arquivo é PostgreSQL do
-- projeto Supabase ("guia cósmico", kroadufkgvymsfzulfzn), e mora numa pasta
-- separada de propósito: o runner de src/infrastructure/migrations/ compara o
-- número do arquivo com o user_version do SQLite e executa tudo que estiver lá
-- no boot do pm2 — este SQL derrubaria a API inteira na primeira linha
-- (`security definer` e `auth.uid()` não existem no SQLite).
--
-- COMO APLICAR (uma vez, na mão): painel do Supabase → SQL Editor → colar →
-- Run. Não há CLI de migração ligada neste projeto.
--
-- POR QUE UMA FUNÇÃO, E NÃO A CHAVE DE ADMIN: apagar de auth.users exige
-- privilégio que o cliente não tem — o caminho "óbvio" seria
-- supabase.auth.admin.deleteUser() com a service_role key. Essa chave é
-- proibida neste projeto (ver lib/supabaseClient.js e a migração 009 da API):
-- ela abre o banco INTEIRO, ignora RLS, e no app ela viveria dentro do bundle
-- JS publicado, ou seja, à vista de qualquer um que abrisse o DevTools.
--
-- SECURITY DEFINER resolve sem chave nenhuma: a função roda com o privilégio de
-- quem a criou, mas o único alvo possível é `auth.uid()` — o `sub` do JWT que o
-- próprio Supabase verificou nesta requisição. Quem chama não escolhe o id, não
-- passa parâmetro, não tem como apagar a conta de outra pessoa. Sem sessão,
-- auth.uid() é NULL e o DELETE não casa com linha nenhuma.
--
-- `set search_path = ''` (com os nomes todos qualificados) é o que impede o
-- ataque clássico de SECURITY DEFINER: sem isso, quem chama pode plantar uma
-- tabela/função no search_path dele e fazer o corpo da função executar código
-- dele com o privilégio do dono.
--
-- O QUE ISSO LEVA JUNTO: tudo que o GoTrue pendura em auth.users
-- (auth.identities, auth.sessions, auth.refresh_tokens) tem FK com
-- ON DELETE CASCADE e some na mesma transação. O app não tem NENHUMA tabela
-- própria no Supabase — não existe `supabase.from(...)` em lugar nenhum do
-- código (Supabase aqui é só login). Os dados que vivem na API própria são
-- apagados pelo DELETE /api/subscription/account, chamado DEPOIS desta função
-- (ver screens/ProfileScreen.js — esta é a chamada 1 de 3).
--
-- POR QUE ESTA VEM PRIMEIRO (19/08/2026, decisão registrada porque duas
-- revisões discordaram): a política do Google Play exige que a CONTA seja
-- apagada — conta que sobrevive é violação frontal. O que pode sobrar do outro
-- lado é lixo órfão no nosso backend (uma assinatura desvinculada, uma cota de
-- IA), recuperável pelo suporte com o e-mail da pessoa. Risco de política vs.
-- risco de faxina.
--
-- O JWT continua autenticando o passo seguinte mesmo com a conta já apagada: o
-- backend próprio valida a ASSINATURA do token contra o JWKS
-- (server-patches/src/http/socialAuth.js) e usa só o `sub` do payload — nenhuma
-- consulta ao usuário — então o token vale até o `exp`. É por isso que o app
-- captura o token ANTES de chamar esta função.

create or replace function public.delete_own_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

-- CREATE FUNCTION concede EXECUTE a PUBLIC por padrão — sem este revoke, a
-- função ficaria chamável também pelo papel `anon` (o do visitante deslogado).
-- Na prática o DELETE não acharia linha (auth.uid() seria NULL), mas rota
-- destrutiva exposta a quem não tem sessão não deve existir.
revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;

-- CONFERÊNCIA depois de rodar (o esperado é uma linha só, "authenticated"):
--   select grantee from information_schema.routine_privileges
--    where routine_name = 'delete_own_account' and privilege_type = 'EXECUTE';
