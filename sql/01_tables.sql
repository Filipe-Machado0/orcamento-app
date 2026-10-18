-- ============================================================
-- SISTEMA DE ORÇAMENTOS E OS
-- 01 - Criação das Tabelas
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ========================
-- 1. PROFILES
-- Extensão de auth.users — dados do prestador
-- ========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name    text NOT NULL DEFAULT 'Novo Usuário',
  company_name  text,
  logo_url      text,
  phone         text,
  address       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Dados do prestador de serviço (extensão de auth.users)';

-- ========================
-- 2. CLIENTS
-- Clientes do prestador (isolados por user_id)
-- ========================
CREATE TABLE IF NOT EXISTS public.clients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          text NOT NULL,
  phone         text,
  email         text,
  address       text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.clients IS 'Clientes cadastrados por cada prestador';

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- ========================
-- 3. PRODUCTS_SERVICES
-- Catálogo de peças e serviços reutilizáveis
-- ========================
CREATE TABLE IF NOT EXISTS public.products_services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text,
  type          text NOT NULL CHECK (type IN ('product', 'service')),
  unit_price    numeric(12,2) NOT NULL DEFAULT 0,
  unit          text NOT NULL DEFAULT 'un',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products_services IS 'Catálogo de peças e serviços do prestador';
COMMENT ON COLUMN public.products_services.type IS 'product = peça/material, service = mão de obra/serviço';
COMMENT ON COLUMN public.products_services.unit IS 'Unidade: un, hr, mt, kg, m², etc.';

CREATE INDEX IF NOT EXISTS idx_products_services_user_id ON public.products_services(user_id);

-- ========================
-- 4. BUDGETS
-- Orçamento principal — coração do sistema
-- ========================
CREATE TABLE IF NOT EXISTS public.budgets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  budget_number   integer NOT NULL DEFAULT nextval('budgets_budget_number_seq'),
  status          text NOT NULL DEFAULT 'pendente'
                    CHECK (status IN ('pendente', 'aprovado', 'em_andamento', 'concluido', 'cancelado')),
  total_amount    numeric(12,2) NOT NULL DEFAULT 0,
  notes           text,
  link_token      uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  valid_until     date,
  approved_at     timestamptz,
  signature_data  text,
  client_ip       text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Criar a sequence antes (o DEFAULT acima referencia ela)
CREATE SEQUENCE IF NOT EXISTS budgets_budget_number_seq
  AS integer START WITH 1 INCREMENT BY 1;

COMMENT ON TABLE public.budgets IS 'Orçamentos/OS criados pelo prestador';
COMMENT ON COLUMN public.budgets.link_token IS 'Token UUID público para o link de aprovação do cliente';
COMMENT ON COLUMN public.budgets.signature_data IS 'Assinatura digital do cliente em Base64 (PNG)';
COMMENT ON COLUMN public.budgets.client_ip IS 'IP do cliente no momento da aprovação (prova)';

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON public.budgets(client_id);
CREATE INDEX IF NOT EXISTS idx_budgets_link_token ON public.budgets(link_token);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON public.budgets(status);

-- ========================
-- 5. BUDGET_ITEMS
-- Itens (peças/serviços) de cada orçamento
-- ========================
CREATE TABLE IF NOT EXISTS public.budget_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id           uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  product_service_id  uuid REFERENCES public.products_services(id) ON DELETE SET NULL,
  description         text NOT NULL,
  quantity            numeric(10,3) NOT NULL DEFAULT 1,
  unit_price          numeric(12,2) NOT NULL DEFAULT 0,
  total_price         numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.budget_items IS 'Itens individuais de cada orçamento';
COMMENT ON COLUMN public.budget_items.total_price IS 'Coluna gerada automaticamente: quantity × unit_price';

CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON public.budget_items(budget_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- ----- updated_at automático -----
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_products_services_updated_at
  BEFORE UPDATE ON public.products_services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----- Total automático do orçamento -----
-- Recalcula budgets.total_amount sempre que budget_items mudar
CREATE OR REPLACE FUNCTION public.update_budget_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_budget_id uuid;
BEGIN
  v_budget_id := COALESCE(NEW.budget_id, OLD.budget_id);

  UPDATE public.budgets
  SET total_amount = (
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    FROM public.budget_items
    WHERE budget_id = v_budget_id
  )
  WHERE id = v_budget_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_budget_total_on_insert
  AFTER INSERT ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION public.update_budget_total();

CREATE TRIGGER update_budget_total_on_update
  AFTER UPDATE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION public.update_budget_total();

CREATE TRIGGER update_budget_total_on_delete
  AFTER DELETE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION public.update_budget_total();

-- ----- Profile automático no signup -----
-- Cria um registro em profiles quando um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, owner_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Novo Usuário')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
