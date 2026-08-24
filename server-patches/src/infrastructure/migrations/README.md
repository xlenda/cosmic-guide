# Migrations do forja-backend

## Regra

Nenhuma alteração de schema é aplicada manualmente em produção. Toda mudança —
inclusive `ADD COLUMN` — vira um arquivo `NNN_descricao.sql`. O bloco de criação
em `db.js` é o baseline congelado de `user_version=0`.

## Como criar

1. Use três dígitos e o próximo número da sequência.
2. Escreva apenas SQL aceito pelo SQLite da produção.
3. Teste contra banco limpo e contra cópia do banco real.
4. O runner de `db.js` aplica arquivos com número maior que `PRAGMA user_version`
   dentro de uma transação e só então avança a versão.

## Limites do SQLite

- Coluna simples aceita `ALTER TABLE ... ADD COLUMN` e default constante.
- Mudanças estruturais complexas exigem tabela nova, cópia, remoção da antiga e
  renomeação, tudo na mesma transação.
- Índices novos devem usar `CREATE INDEX IF NOT EXISTS`.

Faça backup antes de toda migração que toque dados reais, especialmente
`subscriptions` e conteúdo da Comunidade.
