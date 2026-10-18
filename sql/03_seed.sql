-- ============================================================
-- SISTEMA DE ORÇAMENTOS E OS
-- 03 - Dados de Exemplo (Seed)
-- Execute APÓS 01_tables.sql e 02_rls_policies.sql
-- ============================================================
--
-- ⚠️  ANTES DE EXECUTAR:
--  1. Crie uma conta no Supabase Auth (via dashboard ou pelo app)
--  2. Copie o UUID do usuário criado
--  3. Substitua o valor de v_user_id abaixo pelo UUID real
--  4. Execute este script no SQL Editor do Supabase
-- ============================================================

DO $$
DECLARE
  -- ⬇️  COLE O UUID DO SEU USUÁRIO AQUI  ⬇️
  v_user_id     uuid := '00000000-0000-0000-0000-000000000001';

  v_client_1    uuid;
  v_client_2    uuid;
  v_budget_id   uuid;
  v_ps_pastilha uuid;
  v_ps_disco    uuid;
  v_ps_mao_obra uuid;
  v_ps_fluido   uuid;
  v_ps_alinham  uuid;
  v_ps_diag     uuid;
BEGIN
  -- ========================
  -- PROFILE DO PRESTADOR
  -- ========================
  INSERT INTO public.profiles (id, owner_name, company_name, phone, address)
  VALUES (
    v_user_id,
    'Carlos Silva',
    'Auto Center Silva',
    '(11) 91234-5678',
    'Rua das Oficinas, 123 - Vila Mecânica, São Paulo/SP'
  )
  ON CONFLICT (id) DO UPDATE SET
    owner_name   = EXCLUDED.owner_name,
    company_name = EXCLUDED.company_name,
    phone        = EXCLUDED.phone,
    address      = EXCLUDED.address;

  -- ========================
  -- CLIENTES
  -- ========================
  INSERT INTO public.clients (user_id, name, phone, email, address)
  VALUES (
    v_user_id,
    'João Carlos de Oliveira',
    '(11) 98765-4321',
    'joao.oliveira@email.com',
    'Av. Brasil, 456 - Centro, São Paulo/SP'
  )
  RETURNING id INTO v_client_1;

  INSERT INTO public.clients (user_id, name, phone, email, address)
  VALUES (
    v_user_id,
    'Maria Fernanda Santos',
    '(11) 97654-3210',
    'maria.santos@email.com',
    'Rua Augusta, 789 - Consolação, São Paulo/SP'
  )
  RETURNING id INTO v_client_2;

  -- ========================
  -- CATÁLOGO DE PEÇAS E SERVIÇOS
  -- ========================
  INSERT INTO public.products_services (user_id, name, description, type, unit_price, unit)
  VALUES (v_user_id, 'Pastilha de freio dianteira (par)', 'Pastilha cerâmica de alta performance', 'product', 189.90, 'un')
  RETURNING id INTO v_ps_pastilha;

  INSERT INTO public.products_services (user_id, name, description, type, unit_price, unit)
  VALUES (v_user_id, 'Disco de freio dianteiro', 'Disco ventilado 280mm', 'product', 245.00, 'un')
  RETURNING id INTO v_ps_disco;

  INSERT INTO public.products_services (user_id, name, description, type, unit_price, unit)
  VALUES (v_user_id, 'Mão de obra - troca de freios', 'Inclui desmontagem, troca e teste', 'service', 350.00, 'hr')
  RETURNING id INTO v_ps_mao_obra;

  INSERT INTO public.products_services (user_id, name, description, type, unit_price, unit)
  VALUES (v_user_id, 'Fluido de freio DOT4 (500ml)', 'Fluido sintético DOT4', 'product', 45.00, 'un')
  RETURNING id INTO v_ps_fluido;

  INSERT INTO public.products_services (user_id, name, description, type, unit_price, unit)
  VALUES (v_user_id, 'Alinhamento e balanceamento', 'Alinhamento 3D + balanceamento 4 rodas', 'service', 175.10, 'un')
  RETURNING id INTO v_ps_alinham;

  INSERT INTO public.products_services (user_id, name, description, type, unit_price, unit)
  VALUES (v_user_id, 'Diagnóstico eletrônico', 'Scanner OBD2 completo', 'service', 120.00, 'un')
  RETURNING id INTO v_ps_diag;

  -- ========================
  -- ORÇAMENTO DE EXEMPLO
  -- Token fixo para testar a página de aprovação:
  --   ?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890
  -- ========================
  INSERT INTO public.budgets (
    user_id, client_id, status, notes, link_token, valid_until
  )
  VALUES (
    v_user_id,
    v_client_1,
    'pendente',
    'Verificar barulho na suspensão dianteira. Cliente solicita revisão completa dos freios.',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    (CURRENT_DATE + INTERVAL '7 days')::date
  )
  RETURNING id INTO v_budget_id;

  -- ========================
  -- ITENS DO ORÇAMENTO
  -- (total_price é calculado automaticamente pela coluna gerada)
  -- (total_amount do budget é atualizado pelo trigger)
  -- ========================
  INSERT INTO public.budget_items (budget_id, product_service_id, description, quantity, unit_price) VALUES
    (v_budget_id, v_ps_pastilha, 'Pastilha de freio dianteira (par)',   1, 189.90),
    (v_budget_id, v_ps_disco,    'Disco de freio dianteiro',            2, 245.00),
    (v_budget_id, v_ps_mao_obra, 'Mão de obra - troca de freios',      1, 350.00),
    (v_budget_id, v_ps_fluido,   'Fluido de freio DOT4 (500ml)',        1,  45.00),
    (v_budget_id, v_ps_alinham,  'Alinhamento e balanceamento',         1, 175.10);

  -- ========================
  -- RESULTADO
  -- ========================
  RAISE NOTICE '✅ Seed concluído com sucesso!';
  RAISE NOTICE '   Prestador: Auto Center Silva (user_id: %)', v_user_id;
  RAISE NOTICE '   Clientes: 2 criados';
  RAISE NOTICE '   Produtos/Serviços: 6 criados';
  RAISE NOTICE '   Orçamento: #% | Total: R$ 1.250,00', (SELECT budget_number FROM public.budgets WHERE id = v_budget_id);
  RAISE NOTICE '   Link de teste: ?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890';
END $$;
