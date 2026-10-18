# 📋 Sistema de Orçamentos e OS

Sistema web para prestadores de serviço criarem orçamentos e receberem aprovação digital via WhatsApp.

## Stack

- **Frontend (App):** FlutterFlow (PWA)
- **Backend / DB:** Supabase (PostgreSQL + Auth + RLS)
- **Página de Aprovação:** HTML5 + CSS3 + JavaScript vanilla

## Estrutura do Projeto

```
orcamento-app/
├── public/                      ← Página pública de aprovação
│   ├── index.html               ← Página principal
│   ├── css/
│   │   └── style.css            ← Estilos mobile-first
│   └── js/
│       └── app.js               ← Lógica da página
├── sql/                         ← Scripts de banco de dados
│   ├── 01_tables.sql            ← Criação das tabelas
│   ├── 02_rls_policies.sql      ← Segurança (RLS) + funções RPC
│   └── 03_seed.sql              ← Dados de exemplo
└── README.md
```

## Setup Rápido

### 1. Banco de Dados (Supabase)

1. Crie um projeto no [Supabase](https://supabase.com)
2. Vá em **SQL Editor** e execute os scripts em ordem:
   - `sql/01_tables.sql` — cria as 5 tabelas + triggers
   - `sql/02_rls_policies.sql` — ativa RLS + funções públicas
   - `sql/03_seed.sql` — insere dados de exemplo (ajuste o `v_user_id`)

### 2. Página de Aprovação

1. Abra `public/js/app.js`
2. Altere as variáveis de configuração:
   ```javascript
   const CONFIG = {
     SUPABASE_URL:      'https://SEU-PROJETO.supabase.co',
     SUPABASE_ANON_KEY: 'sua-chave-anon-aqui'
   };
   ```
3. Faça deploy da pasta `public/` em qualquer hosting estático:
   - [Vercel](https://vercel.com) (grátis)
   - [Netlify](https://netlify.com) (grátis)
   - [GitHub Pages](https://pages.github.com) (grátis)

### 3. Testar Localmente

```bash
# Qualquer servidor HTTP simples funciona
npx serve public
# ou
python -m http.server 8000 --directory public
```

Abra no navegador: `http://localhost:8000?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890`

> **Modo Demo:** Se o Supabase não estiver configurado, a página carrega automaticamente com dados fictícios para demonstração.

## Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados do prestador (extensão de `auth.users`) |
| `clients` | Clientes do prestador |
| `products_services` | Catálogo de peças e serviços |
| `budgets` | Orçamentos / OS |
| `budget_items` | Itens de cada orçamento |

## Segurança (RLS)

- **Multi-tenant:** Cada prestador só acessa seus próprios dados (`user_id = auth.uid()`)
- **Página pública:** Acessa dados via funções `SECURITY DEFINER` (RPC), sem acesso direto às tabelas
- **Aprovação:** Só pode aprovar orçamentos com status `pendente` e dentro da validade

## Funções RPC (para a página de aprovação)

| Função | Descrição |
|--------|-----------|
| `get_budget_by_token(p_token)` | Retorna todos os dados do orçamento para visualização |
| `approve_budget(p_token, p_signature, p_client_ip)` | Aprova e salva a assinatura digital |

## Link do WhatsApp

Monte o link no FlutterFlow com esta estrutura:

```
https://wa.me/{telefone_cliente}?text=Olá! Segue seu orçamento da *{nome_empresa}*:%0A%0A📋 Orçamento #{numero}%0A💰 Total: R$ {total}%0A📅 Válido até: {validade}%0A%0AConfira e aprove aqui 👇%0A{url_pagina}?token={link_token}
```

## Tecnologias da Página

- **[signature_pad.js](https://github.com/szimek/signature_pad)** — Captura de assinatura digital via canvas
- **[Supabase JS](https://supabase.com/docs/reference/javascript)** — Client para chamadas RPC
- **[Inter Font](https://fonts.google.com/specimen/Inter)** — Tipografia profissional
