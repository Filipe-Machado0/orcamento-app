-- ============================================================
-- SISTEMA DE ORÇAMENTOS E OS
-- 02 - Row Level Security + Funções RPC
-- Execute APÓS 01_tables.sql
-- ============================================================

-- ========================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ========================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS: PROFILES
-- Cada usuário só acessa o próprio perfil
-- ============================================================
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- INSERT é feito pelo trigger on_auth_user_created (SECURITY DEFINER)
-- DELETE não é permitido (cascade do auth.users cuida disso)

-- ============================================================
-- POLÍTICAS: CLIENTS
-- Prestador só vê/edita seus próprios clientes
-- ============================================================
CREATE POLICY "clients_select_own"
  ON public.clients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "clients_insert_own"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients_update_own"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients_delete_own"
  ON public.clients FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- POLÍTICAS: PRODUCTS_SERVICES
-- Prestador só vê/edita seu próprio catálogo
-- ============================================================
CREATE POLICY "products_services_select_own"
  ON public.products_services FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "products_services_insert_own"
  ON public.products_services FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "products_services_update_own"
  ON public.products_services FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "products_services_delete_own"
  ON public.products_services FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- POLÍTICAS: BUDGETS
-- Prestador só vê/edita seus próprios orçamentos
-- ============================================================
CREATE POLICY "budgets_select_own"
  ON public.budgets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "budgets_insert_own"
  ON public.budgets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "budgets_update_own"
  ON public.budgets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "budgets_delete_own"
  ON public.budgets FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- POLÍTICAS: BUDGET_ITEMS
-- Acesso via orçamento do próprio prestador
-- ============================================================
CREATE POLICY "budget_items_select_own"
  ON public.budget_items FOR SELECT
  TO authenticated
  USING (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "budget_items_insert_own"
  ON public.budget_items FOR INSERT
  TO authenticated
  WITH CHECK (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "budget_items_update_own"
  ON public.budget_items FOR UPDATE
  TO authenticated
  USING (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "budget_items_delete_own"
  ON public.budget_items FOR DELETE
  TO authenticated
  USING (
    budget_id IN (
      SELECT id FROM public.budgets WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- FUNÇÕES RPC PÚBLICAS (para a página de aprovação)
-- Usam SECURITY DEFINER para contornar o RLS de forma segura
-- ============================================================

-- ========================
-- get_budget_by_token(token)
-- Retorna todos os dados necessários para a página de aprovação
-- Acessível pelo role "anon" (sem autenticação)
-- ========================
CREATE OR REPLACE FUNCTION public.get_budget_by_token(p_token uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'budget', json_build_object(
      'id',            b.id,
      'budget_number', b.budget_number,
      'status',        b.status,
      'total_amount',  b.total_amount,
      'notes',         b.notes,
      'valid_until',   b.valid_until,
      'approved_at',   b.approved_at,
      'signature_data', b.signature_data,
      'created_at',    b.created_at
    ),
    'client', json_build_object(
      'name',  c.name,
      'phone', c.phone,
      'email', c.email
    ),
    'provider', json_build_object(
      'company_name', p.company_name,
      'owner_name',   p.owner_name,
      'logo_url',     p.logo_url,
      'phone',        p.phone
    ),
    'items', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'description', bi.description,
            'quantity',     bi.quantity,
            'unit_price',  bi.unit_price,
            'total_price', bi.total_price
          )
          ORDER BY bi.created_at
        )
        FROM public.budget_items bi
        WHERE bi.budget_id = b.id
      ),
      '[]'::json
    )
  )
  INTO v_result
  FROM public.budgets b
  JOIN public.clients c ON c.id = b.client_id
  JOIN public.profiles p ON p.id = b.user_id
  WHERE b.link_token = p_token;

  IF v_result IS NULL THEN
    RETURN json_build_object(
      'error', 'Orçamento não encontrado.'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- ========================
-- approve_budget(token, signature, ip)
-- Aprova o orçamento e salva a assinatura digital
-- Acessível pelo role "anon"
-- ========================
CREATE OR REPLACE FUNCTION public.approve_budget(
  p_token      uuid,
  p_signature  text,
  p_client_ip  text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_budget_id uuid;
  v_status    text;
  v_valid     date;
BEGIN
  -- Buscar orçamento pelo token
  SELECT id, status, valid_until
  INTO v_budget_id, v_status, v_valid
  FROM public.budgets
  WHERE link_token = p_token;

  -- Validações
  IF v_budget_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error',   'Orçamento não encontrado.'
    );
  END IF;

  IF v_status != 'pendente' THEN
    RETURN json_build_object(
      'success', false,
      'error',   'Este orçamento já foi ' || v_status || '.'
    );
  END IF;

  IF v_valid IS NOT NULL AND v_valid < CURRENT_DATE THEN
    RETURN json_build_object(
      'success', false,
      'error',   'Este orçamento expirou em ' || to_char(v_valid, 'DD/MM/YYYY') || '.'
    );
  END IF;

  IF p_signature IS NULL OR trim(p_signature) = '' THEN
    RETURN json_build_object(
      'success', false,
      'error',   'A assinatura é obrigatória para aprovar.'
    );
  END IF;

  -- Aprovar
  UPDATE public.budgets
  SET
    status         = 'aprovado',
    approved_at    = now(),
    signature_data = p_signature,
    client_ip      = p_client_ip,
    updated_at     = now()
  WHERE id = v_budget_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Orçamento aprovado com sucesso!'
  );
END;
$$;

-- ========================
-- PERMISSÕES: Liberar funções para o role anon
-- ========================
GRANT EXECUTE ON FUNCTION public.get_budget_by_token(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.approve_budget(uuid, text, text) TO anon;
