# Guia de Integração com Supabase

Este guia descreve como configurar o Travel.AI para usar o Supabase como banco de dados PostgreSQL.

## Pré-requisitos

1. Ter uma conta no [Supabase](https://supabase.com)
2. Ter criado um projeto no Supabase

## Passos para configuração

### 1. Obter credenciais do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard/projects)
2. Selecione seu projeto
3. Clique em "Settings" no menu lateral, depois em "Database"
4. Na seção "Connection Pooling", copie a URI de conexão
5. Substitua `[YOUR-PASSWORD]` pela senha que você definiu ao criar o projeto

### 2. Configurar variáveis de ambiente

1. Edite o arquivo `.env` na raiz do projeto
2. Adicione ou atualize a variável `DATABASE_URL` com a string de conexão do Supabase:

```
DATABASE_URL=postgres://postgres:[SUPABASE_PASSWORD]@db.[SUPABASE_PROJECT_ID].supabase.co:5432/postgres
```

3. Adicione também (opcional):

```
SUPABASE_URL=https://[SUPABASE_PROJECT_ID].supabase.co
SUPABASE_KEY=[SUPABASE_ANON_KEY]
```

### 3. Verificar a conexão

Execute o script de verificação de conexão:

```
tsx scripts/check-db-connection.ts
```

Você deverá ver uma mensagem de sucesso se a conexão estiver funcionando corretamente.

### 4. Executar migrações

Para criar as tabelas necessárias no banco de dados:

```
node run-migration.js
```

### 5. Gerar dados iniciais (opcional)

Para popular o banco de dados com dados de exemplo:

```
tsx scripts/seed-db.ts
```

## Recursos adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Drizzle ORM](https://orm.drizzle.team)

## Solução de problemas

### Erro de conexão SSL

Se você estiver enfrentando erros de SSL, verifique se o valor de `ssl` está correto em `server/db.ts`. Em ambiente de desenvolvimento, geralmente é configurado como `false`, enquanto em produção, é configurado como `{ rejectUnauthorized: false }`.

### Tabelas não encontradas

Se o aplicativo estiver reclamando sobre tabelas inexistentes, verifique se as migrações foram executadas com sucesso. Execute novamente o script de migração.

### Restrições de acesso

Verifique as configurações de Row Level Security (RLS) no Supabase se estiver enfrentando problemas de permissão. Por padrão, a RLS está ativada no Supabase, o que pode restringir operações de banco de dados.