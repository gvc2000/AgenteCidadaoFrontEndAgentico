# 🛡️ Guia de Backup do Supabase

## ✨ Opção 1: Via Dashboard (Conta Gratuita - Recomendado)

A forma mais simples sem instalar nada:

### 1.1 Backup da Estrutura (Schema)

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Cole e execute:
```sql
-- Gera DDL de todas as tabelas do schema public
SELECT 
  'CREATE TABLE ' || table_name || ' (' ||
  string_agg(column_name || ' ' || data_type, ', ') || ');'
FROM information_schema.columns 
WHERE table_schema = 'public'
GROUP BY table_name;
```
6. Copie o resultado e salve em um arquivo `.sql`

### 1.2 Backup dos Dados (Tabela por Tabela)

1. Vá em **Table Editor** (menu lateral)
2. Selecione a tabela desejada (ex: `requests`)
3. Clique nos **3 pontinhos** (⋮) no canto superior direito
4. Escolha **Export to CSV**
5. Repita para cada tabela importante

### 1.3 Backup Completo via SQL (Melhor Opção)

1. Vá em **SQL Editor**
2. Clique em **New Query**
3. Cole e execute cada query abaixo, salvando os resultados:

**Listar todas as tabelas:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

**Exportar estrutura de uma tabela específica:**
```sql
SELECT pg_get_tabledef('public.requests');
```

**Exportar dados como INSERT:**
```sql
SELECT * FROM requests;
-- Copie o resultado em formato CSV ou JSON
```

---

## 💻 Opção 2: Via CLI (Sem Docker)

Use a connection string direta para evitar necessidade de Docker:

### 1. Obter Connection String

1. Acesse seu projeto no Dashboard
2. Clique em **Connect** (botão no topo)
3. Copie a **Direct connection string**

### 2. Executar Dump

```bash
supabase db dump --db-url "postgresql://postgres.[REF]:[SENHA]@db.[REF].supabase.co:5432/postgres" --schema public -f supabase/schema_dump.sql
```

> ⚠️ Se sua senha tiver `@`, `#`, etc., codifique-os (ex: `@` → `%40`)

---

## 🔄 Como Restaurar

1. Vá no **SQL Editor** do Supabase
2. Cole o conteúdo do arquivo `.sql`
3. Execute (Run)

> ⚠️ Restaurar pode causar conflitos se tabelas já existirem. Em caso de "desastre total", limpe o schema antes.
