-- ============================================================
-- SISTEMA DE ORÇAMENTOS E OS
-- 04 - Pacotes Relâmpago (Combos e Predefinições)
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ========================
-- 1. SERVICE_PACKAGES
-- Pacotes de serviços pré-configurados para criação em 1 toque
-- ========================
CREATE TABLE IF NOT EXISTS public.service_packages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          text NOT NULL,
  icon          text DEFAULT '⚡',
  description   text,
  estimated_price numeric(12,2) DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.service_packages IS 'Pacotes de serviços predefinidos para agilizar a montagem de orçamentos';

CREATE INDEX IF NOT EXISTS idx_service_packages_user_id ON public.service_packages(user_id);

-- ========================
-- 2. PACKAGE_ITEMS
-- Itens vinculados a cada pacote de serviço
-- ========================
CREATE TABLE IF NOT EXISTS public.package_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id          uuid NOT NULL REFERENCES public.service_packages(id) ON DELETE CASCADE,
  product_service_id  uuid REFERENCES public.products_services(id) ON DELETE SET NULL,
  description         text NOT NULL,
  quantity            numeric(10,3) NOT NULL DEFAULT 1,
  unit_price          numeric(12,2) NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_package_items_package_id ON public.package_items(package_id);

-- ========================
-- RLS PARA PACOTES
-- ========================
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_packages_select_own"
  ON public.service_packages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "service_packages_insert_own"
  ON public.service_packages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_packages_update_own"
  ON public.service_packages FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_packages_delete_own"
  ON public.service_packages FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "package_items_all_own"
  ON public.package_items FOR ALL
  TO authenticated
  USING (
    package_id IN (
      SELECT id FROM public.service_packages WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    package_id IN (
      SELECT id FROM public.service_packages WHERE user_id = auth.uid()
    )
  );

-- Trigger de updated_at
CREATE TRIGGER set_service_packages_updated_at
  BEFORE UPDATE ON public.service_packages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
