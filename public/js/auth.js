/* ============================================================
   SISTEMA DE ORÇAMENTOS E OS
   Autenticação e Camada de Dados (Admin & FlutterFlow Web)
   ============================================================ */

const CONFIG = {
  SUPABASE_URL:      'https://tuveigrmgzvtbtgjmyem.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable__GowN5kG9iUUCjk0XlIMGQ_QMfFdCVr'
};

const MOCK_STORAGE_KEY = 'orcamento_mock_data';

// Dicionário dos Segmentos de Demonstração (Incluindo Modelo Universal / Genérico)
const NICHES_DATA = {
  generico: {
    key: 'generico',
    name: 'Prestação de Serviços em Geral (Universal)',
    company_name: 'Prestadora de Serviços & Soluções',
    phone: '(11) 91234-5678',
    address: 'Av. Paulista, 1500 - Bela Vista, São Paulo/SP',
    clients: [
      { id: 'c1', name: 'Empresa Soluções Comerciais Ltda', phone: '(11) 98765-4321', email: 'contato@solucoes.com' },
      { id: 'c2', name: 'Grupo Delta Gestão & Condomínios', phone: '(11) 97654-3210', email: 'adm@grupodelta.com' },
      { id: 'c3', name: 'Dr. Marcos Vinícius Consultoria', phone: '(11) 93456-7890', email: 'marcos@consultoria.com' },
      { id: 'c4', name: 'Juliana Fernandes Imóveis', phone: '(11) 99123-4567', email: 'juliana@imoveis.com' }
    ],
    catalog: [
      { id: 'p1', name: 'Execução de Serviço Especializado / Mão de Obra', type: 'service', unit_price: 450.00, unit: 'dia' },
      { id: 'p2', name: 'Consultoria e Avaliação Técnica Presencial', type: 'service', unit_price: 250.00, unit: 'hr' },
      { id: 'p3', name: 'Manutenção Preventiva e Calibração Operacional', type: 'service', unit_price: 320.00, unit: 'un' },
      { id: 'p4', name: 'Fornecimento de Peças e Insumos de Reposição', type: 'product', unit_price: 180.00, unit: 'un' },
      { id: 'p5', name: 'Taxa de Visita Técnica e Diagnóstico Preliminar', type: 'service', unit_price: 120.00, unit: 'un' },
      { id: 'p6', name: 'Suporte Técnico e Relatório de Conformidade', type: 'service', unit_price: 190.00, unit: 'un' }
    ],
    packages: [
      {
        id: 'pkg_g1',
        name: 'Diagnóstico Preliminar e Manutenção Padrão',
        description: 'Visita técnica no local, laudo diagnóstico e execução de reparo preventivo',
        items: [
          { description: 'Taxa de Visita Técnica e Diagnóstico Preliminar', quantity: 1, unit_price: 120.00 },
          { description: 'Manutenção Preventiva e Calibração Operacional', quantity: 1, unit_price: 320.00 }
        ]
      },
      {
        id: 'pkg_g2',
        name: 'Serviço Completo com Fornecimento de Insumos',
        description: 'Execução técnica integral de serviço com peças e insumos homologados inclusos',
        items: [
          { description: 'Execução de Serviço Especializado / Mão de Obra', quantity: 1, unit_price: 450.00 },
          { description: 'Fornecimento de Peças e Insumos de Reposição', quantity: 1, unit_price: 180.00 }
        ]
      }
    ],
    budgets: [
      {
        id: 'bg1',
        budget_number: 101,
        client_name: 'Empresa Soluções Comerciais Ltda',
        client_phone: '(11) 98765-4321',
        status: 'pendente',
        total_amount: 750.00,
        notes: 'Prestação de serviços técnicos especializados conforme especificações do escopo acordado.',
        link_token: 'b1-generico-token',
        valid_until: '2026-10-30',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        items: [
          { description: 'Taxa de Visita Técnica e Diagnóstico Preliminar', quantity: 1, unit_price: 120.00, total_price: 120.00 },
          { description: 'Execução de Serviço Especializado / Mão de Obra', quantity: 1, unit_price: 450.00, total_price: 450.00 },
          { description: 'Fornecimento de Peças e Insumos de Reposição', quantity: 1, unit_price: 180.00, total_price: 180.00 }
        ]
      },
      {
        id: 'bg2',
        budget_number: 102,
        client_name: 'Grupo Delta Gestão & Condomínios',
        client_phone: '(11) 97654-3210',
        status: 'aprovado',
        total_amount: 1220.00,
        notes: 'Manutenção preventiva periódica e atendimento operacional com fornecimento de peças.',
        link_token: 'b2-generico-token',
        valid_until: '2026-10-25',
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        approved_at: new Date(Date.now() - 3600000 * 15).toISOString(),
        signature_data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M 12 40 Q 60 10, 110 32 T 205 28" stroke="%230f172a" stroke-width="2.5" fill="none"/></svg>',
        items: [
          { description: 'Execução de Serviço Especializado / Mão de Obra', quantity: 2, unit_price: 450.00, total_price: 900.00 },
          { description: 'Manutenção Preventiva e Calibração Operacional', quantity: 1, unit_price: 320.00, total_price: 320.00 }
        ]
      },
      {
        id: 'bg3',
        budget_number: 103,
        client_name: 'Dr. Marcos Vinícius Consultoria',
        client_phone: '(11) 93456-7890',
        status: 'em_andamento',
        total_amount: 750.00,
        notes: 'Consultoria e adequação técnica no local com emissão de parecer.',
        link_token: 'b3-generico-token',
        valid_until: '2026-10-22',
        created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
        items: [
          { description: 'Consultoria e Avaliação Técnica Presencial', quantity: 3, unit_price: 250.00, total_price: 750.00 }
        ]
      },
      {
        id: 'bg4',
        budget_number: 104,
        client_name: 'Juliana Fernandes Imóveis',
        client_phone: '(11) 99123-4567',
        status: 'concluido',
        total_amount: 640.00,
        notes: 'Serviço técnico concluído com emissão de termo de entrega e garantia.',
        link_token: 'b4-generico-token',
        valid_until: '2026-10-15',
        created_at: new Date(Date.now() - 3600000 * 75).toISOString(),
        items: [
          { description: 'Execução de Serviço Especializado / Mão de Obra', quantity: 1, unit_price: 450.00, total_price: 450.00 },
          { description: 'Suporte Técnico e Relatório de Conformidade', quantity: 1, unit_price: 190.00, total_price: 190.00 }
        ]
      }
    ],
    contract: {
      id: 'ctr-demo-01',
      contract_number: 'CTR-SERV/2026-101',
      title: 'Contrato de Prestação de Serviços Técnicos e Fornecimento',
      provider_name: 'Prestadora de Serviços & Soluções Ltda',
      provider_cnpj: '10.987.654/0001-20',
      provider_phone: '(11) 91234-5678',
      provider_address: 'Av. Paulista, 1500 - Bela Vista, São Paulo/SP',
      client_name: 'Empresa Soluções Comerciais Ltda',
      client_doc: '18.765.432/0001-99',
      client_phone: '(11) 98765-4321',
      client_address: 'Rua do Comércio, 500 - Centro, São Paulo/SP',
      service_description: 'Execução técnica de serviços especializados, suporte operacional, manutenção e fornecimento de insumos conforme discriminado na Proposta Comercial vinculada.',
      total_amount: 750.00,
      payment_terms: 'Entrada de 50% na contratação e saldo de 50% na entrega e homologação dos serviços.',
      warranty_days: 90,
      deadline_days: 5,
      status: 'pendente',
      signed_at: null,
      signature_data: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  },

  marcenaria: {
    key: 'marcenaria',
    name: 'Marcenaria & Móveis Planejados',
    company_name: 'Silva Marcenaria & Planejados',
    phone: '(11) 91234-5678',
    address: 'Av. dos Marceneiros, 450 - São Paulo/SP',
    clients: [
      { id: 'c1', name: 'Juliana Mendes Arquitetura', phone: '(11) 98765-4321', email: 'juliana@arquiteta.com' },
      { id: 'c2', name: 'Condomínio Reserva dos Ipês', phone: '(11) 97654-3210', email: 'contato@reservaipes.com' },
      { id: 'c3', name: 'Lucas Pinheiro Residencial', phone: '(11) 93456-7890', email: 'lucas@email.com' },
      { id: 'c4', name: 'Espaço Gourmet Buffet & Eventos', phone: '(11) 99123-4567', email: 'gourmet@eventos.com' }
    ],
    catalog: [
      { id: 'p1', name: 'Painel Ripado em MDF Freijó 18mm (m²)', type: 'product', unit_price: 380.00, unit: 'm²' },
      { id: 'p2', name: 'Corrediça Telescópica Oculta com Amortecedor', type: 'product', unit_price: 75.00, unit: 'un' },
      { id: 'p3', name: 'Dobradiça Caneco 35mm com Pistão Anti-Impacto', type: 'product', unit_price: 28.50, unit: 'un' },
      { id: 'p4', name: 'Mão de Obra de Marcenaria e Montagem Fina', type: 'service', unit_price: 450.00, unit: 'dia' },
      { id: 'p5', name: 'Instalação de Fita LED Embutida com Perfil Alumínio', type: 'service', unit_price: 160.00, unit: 'mt' }
    ],
    packages: [
      {
        id: 'pkg_m1',
        name: 'Painel de TV Ripado com Fita LED',
        description: 'Fabricação sob medida de painel ripado em MDF com iluminação indireta',
        items: [
          { description: 'Painel Ripado em MDF Freijó 18mm (m²)', quantity: 3, unit_price: 380.00 },
          { description: 'Instalação de Fita LED Embutida com Perfil Alumínio', quantity: 2, unit_price: 160.00 },
          { description: 'Mão de Obra de Marcenaria e Montagem Fina', quantity: 1, unit_price: 450.00 }
        ]
      },
      {
        id: 'pkg_m2',
        name: 'Revitalização de Armários e Gavetas',
        description: 'Substituição de todas as corrediças e dobradiças antigas por amortecidas',
        items: [
          { description: 'Corrediça Telescópica Oculta com Amortecedor', quantity: 6, unit_price: 75.00 },
          { description: 'Dobradiça Caneco 35mm com Pistão Anti-Impacto', quantity: 8, unit_price: 28.50 },
          { description: 'Mão de Obra de Marcenaria e Montagem Fina', quantity: 1, unit_price: 450.00 }
        ]
      }
    ],
    budgets: [
      {
        id: 'bm1',
        budget_number: 104,
        client_name: 'Juliana Mendes Arquitetura',
        client_phone: '(11) 98765-4321',
        status: 'pendente',
        total_amount: 1910.00,
        notes: 'Móvel planejado conforme projeto executivo anexo. Acabamento amadeirado acetinado.',
        link_token: 'b1-marcenaria-token',
        valid_until: '2026-10-30',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        items: [
          { description: 'Painel Ripado em MDF Freijó 18mm (m²)', quantity: 3, unit_price: 380.00, total_price: 1140.00 },
          { description: 'Instalação de Fita LED Embutida com Perfil Alumínio', quantity: 2, unit_price: 160.00, total_price: 320.00 },
          { description: 'Mão de Obra de Marcenaria e Montagem Fina', quantity: 1, unit_price: 450.00, total_price: 450.00 }
        ]
      },
      {
        id: 'bm2',
        budget_number: 103,
        client_name: 'Condomínio Reserva dos Ipês',
        client_phone: '(11) 97654-3210',
        status: 'aprovado',
        total_amount: 3850.00,
        notes: 'Armário sob medida para guarita e área de apoio com portas de correr.',
        link_token: 'b2-marcenaria-token',
        valid_until: '2026-10-25',
        created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
        approved_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        signature_data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M 10 35 Q 50 5, 100 30 T 200 25" stroke="%230f172a" stroke-width="2.5" fill="none"/></svg>',
        items: [
          { description: 'Armário em MDF Ultra Naval com Portas Deslizantes', quantity: 1, unit_price: 2600.00, total_price: 2600.00 },
          { description: 'Corrediça Telescópica Oculta com Amortecedor', quantity: 8, unit_price: 75.00, total_price: 600.00 },
          { description: 'Mão de Obra de Marcenaria e Montagem Fina', quantity: 1.5, unit_price: 450.00, total_price: 650.00 }
        ]
      },
      {
        id: 'bm3',
        budget_number: 102,
        client_name: 'Lucas Pinheiro Residencial',
        client_phone: '(11) 93456-7890',
        status: 'em_andamento',
        total_amount: 2450.00,
        notes: 'Gabinete de cozinha e balcão de ilha central em acabamento grafite.',
        link_token: 'b3-marcenaria-token',
        valid_until: '2026-10-20',
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        items: [
          { description: 'Bancada em MDF Ultra com Divisórias Internas', quantity: 1, unit_price: 1550.00, total_price: 1550.00 },
          { description: 'Mão de Obra de Marcenaria e Montagem Fina', quantity: 2, unit_price: 450.00, total_price: 900.00 }
        ]
      },
      {
        id: 'bm4',
        budget_number: 101,
        client_name: 'Espaço Gourmet Buffet & Eventos',
        client_phone: '(11) 99123-4567',
        status: 'concluido',
        total_amount: 4200.00,
        notes: 'Fabricação e montagem de prateleiras aéreas e balcão buffet.',
        link_token: 'b4-marcenaria-token',
        valid_until: '2026-10-15',
        created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
        items: [
          { description: 'Prateleiras Aéreas Estruturadas em Madeira Freijó', quantity: 4, unit_price: 600.00, total_price: 2400.00 },
          { description: 'Mão de Obra de Marcenaria e Montagem Fina', quantity: 4, unit_price: 450.00, total_price: 1800.00 }
        ]
      }
    ],
    contract: {
      id: 'ctr-demo-01',
      contract_number: 'CTR-MARC/2026-104',
      title: 'Contrato de Fabricação e Instalação de Móveis Sob Medida',
      provider_name: 'Silva Marcenaria & Planejados Ltda',
      provider_cnpj: '28.987.654/0001-32',
      provider_phone: '(11) 91234-5678',
      provider_address: 'Av. dos Marceneiros, 450 - São Paulo/SP',
      client_name: 'Juliana Mendes Arquitetura',
      client_doc: '456.789.123-00',
      client_phone: '(11) 98765-4321',
      client_address: 'Rua das Flores, 88 - Jardins, São Paulo/SP',
      service_description: 'Fabricação, acabamento fino e montagem de painel ripado sob medida em MDF Freijó 18mm com perfil e fita LED embutida, além de ferragens amortecedoras.',
      total_amount: 1910.00,
      payment_terms: 'Entrada de 50% na aprovação do projeto e saldo de 50% na conclusão da instalação.',
      warranty_days: 365,
      deadline_days: 15,
      status: 'pendente',
      signed_at: null,
      signature_data: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  },

  celular: {
    key: 'celular',
    name: 'Assistência Técnica de Celulares & TI',
    company_name: 'Silva Tech Assistência & Celulares',
    phone: '(11) 91234-5678',
    address: 'Rua da Tecnologia, 80 - Centro, São Paulo/SP',
    clients: [
      { id: 'c1', name: 'Fernanda Oliveira (iPhone 14 Pro)', phone: '(11) 98765-4321', email: 'fernanda@email.com' },
      { id: 'c2', name: 'Marcelo Santos (Galaxy S23)', phone: '(11) 93456-7890', email: 'marcelo@email.com' },
      { id: 'c3', name: 'Empresa Alpha Logística (Frotas)', phone: '(11) 97654-3210', email: 'frota@alphalog.com' },
      { id: 'c4', name: 'Camila Rodrigues (iPhone 12)', phone: '(11) 98234-5678', email: 'camila@email.com' }
    ],
    catalog: [
      { id: 'p1', name: 'Display Frontal Original OLED (Substituição)', type: 'product', unit_price: 680.00, unit: 'un' },
      { id: 'p2', name: 'Bateria Homologada Alta Capacidade com Garantia', type: 'product', unit_price: 240.00, unit: 'un' },
      { id: 'p3', name: 'Desoxidação e Banho Ultrassônico em Placa-Mãe', type: 'service', unit_price: 180.00, unit: 'un' },
      { id: 'p4', name: 'Substituição de Conector de Carga Flex Tipo-C', type: 'service', unit_price: 150.00, unit: 'un' },
      { id: 'p5', name: 'Reparo Avançado em Linha de Carga / Micro-solda', type: 'service', unit_price: 320.00, unit: 'un' }
    ],
    packages: [
      {
        id: 'pkg_c1',
        name: 'Troca de Tela + Aplicação de Película 9D',
        description: 'Display de alta definição homologado com teste biométrico e blindagem',
        items: [
          { description: 'Display Frontal Original OLED (Substituição)', quantity: 1, unit_price: 680.00 },
          { description: 'Substituição de Conector de Carga Flex Tipo-C', quantity: 1, unit_price: 150.00 }
        ]
      },
      {
        id: 'pkg_c2',
        name: 'Manutenção Preventiva e Bateria Nova',
        description: 'Bateria homologada com 100% de saúde e limpeza interna do chassi',
        items: [
          { description: 'Bateria Homologada Alta Capacidade com Garantia', quantity: 1, unit_price: 240.00 },
          { description: 'Desoxidação e Banho Ultrassônico em Placa-Mãe', quantity: 1, unit_price: 180.00 }
        ]
      }
    ],
    budgets: [
      {
        id: 'bc1',
        budget_number: 308,
        client_name: 'Fernanda Oliveira (iPhone 14 Pro)',
        client_phone: '(11) 98765-4321',
        status: 'pendente',
        total_amount: 830.00,
        notes: 'Aparelho deu entrada com tela trincada e falha no conector. Todos os componentes testados.',
        link_token: 'b1-celular-token',
        valid_until: '2026-10-28',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        items: [
          { description: 'Display Frontal Original OLED (Substituição)', quantity: 1, unit_price: 680.00, total_price: 680.00 },
          { description: 'Substituição de Conector de Carga Flex Tipo-C', quantity: 1, unit_price: 150.00, total_price: 150.00 }
        ]
      },
      {
        id: 'bc2',
        budget_number: 307,
        client_name: 'Marcelo Santos (Galaxy S23)',
        client_phone: '(11) 93456-7890',
        status: 'aprovado',
        total_amount: 420.00,
        notes: 'Troca de bateria com desoxidação de placa após contato com líquido.',
        link_token: 'b2-celular-token',
        valid_until: '2026-10-25',
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        approved_at: new Date(Date.now() - 3600000 * 16).toISOString(),
        signature_data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M 12 40 Q 60 10, 110 35 T 200 30" stroke="%230f172a" stroke-width="2.5" fill="none"/></svg>',
        items: [
          { description: 'Bateria Homologada Alta Capacidade com Garantia', quantity: 1, unit_price: 240.00, total_price: 240.00 },
          { description: 'Desoxidação e Banho Ultrassônico em Placa-Mãe', quantity: 1, unit_price: 180.00, total_price: 180.00 }
        ]
      },
      {
        id: 'bc3',
        budget_number: 306,
        client_name: 'Empresa Alpha Logística (Frotas)',
        client_phone: '(11) 97654-3210',
        status: 'em_andamento',
        total_amount: 1280.00,
        notes: 'Lote de 4 coletores e smartphones com falha em CI de carga e conectores USB-C.',
        link_token: 'b3-celular-token',
        valid_until: '2026-10-22',
        created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
        items: [
          { description: 'Reparo Avançado em Linha de Carga / Micro-solda', quantity: 2, unit_price: 320.00, total_price: 640.00 },
          { description: 'Substituição de Conector de Carga Flex Tipo-C', quantity: 4, unit_price: 150.00, total_price: 600.00 },
          { description: 'Limpeza e Testes de Bateria', quantity: 1, unit_price: 40.00, total_price: 40.00 }
        ]
      },
      {
        id: 'bc4',
        budget_number: 305,
        client_name: 'Camila Rodrigues (iPhone 12)',
        client_phone: '(11) 98234-5678',
        status: 'concluido',
        total_amount: 390.00,
        notes: 'Substituição de módulo de alto-falante auricular e limpeza de chassi.',
        link_token: 'b4-celular-token',
        valid_until: '2026-10-18',
        created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
        items: [
          { description: 'Substituição de Módulo Auricular + Sensor Proximidade', quantity: 1, unit_price: 250.00, total_price: 250.00 },
          { description: 'Desoxidação e Banho Ultrassônico em Placa-Mãe', quantity: 1, unit_price: 140.00, total_price: 140.00 }
        ]
      }
    ],
    contract: {
      id: 'ctr-demo-01',
      contract_number: 'OS-TECH/2026-308',
      title: 'Termo de Ordem de Serviço e Reparação Eletrônica',
      provider_name: 'Silva Tech Assistência & Celulares Ltda',
      provider_cnpj: '33.123.456/0001-78',
      provider_phone: '(11) 91234-5678',
      provider_address: 'Rua da Tecnologia, 80 - Centro, São Paulo/SP',
      client_name: 'Fernanda Oliveira',
      client_doc: '321.654.987-11',
      client_phone: '(11) 98765-4321',
      client_address: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP',
      service_description: 'Substituição do módulo frontal display OLED homologado e troca do conector flex de alimentação com testes laboratoriais de touchscreen, FaceID e condutividade.',
      total_amount: 830.00,
      payment_terms: 'Pagamento integral na entrega do aparelho reparado (Cartão em até 3x sem juros ou PIX).',
      warranty_days: 90,
      deadline_days: 1,
      status: 'pendente',
      signed_at: null,
      signature_data: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  },

  mecanica: {
    key: 'mecanica',
    name: 'Oficinas Mecânicas & Centros Automotivos',
    company_name: 'Auto Center Silva',
    phone: '(11) 91234-5678',
    address: 'Rua das Oficinas, 123 - São Paulo/SP',
    clients: [
      { id: 'c1', name: 'João Carlos de Oliveira (Civic 2021)', phone: '(11) 98765-4321', email: 'joao@email.com' },
      { id: 'c2', name: 'Maria Fernanda Santos (Compass Diesel)', phone: '(11) 97654-3210', email: 'maria@email.com' },
      { id: 'c3', name: 'Roberto Lima Frotas (Strada Working)', phone: '(11) 93456-7890', email: 'roberto@email.com' },
      { id: 'c4', name: 'Guilherme Antunes (Corolla 2020)', phone: '(11) 99876-1234', email: 'guilherme@email.com' }
    ],
    catalog: [
      { id: 'p1', name: 'Pastilha de freio dianteira cerâmica (par)', type: 'product', unit_price: 189.90, unit: 'un' },
      { id: 'p2', name: 'Disco de freio dianteiro ventilado', type: 'product', unit_price: 245.00, unit: 'un' },
      { id: 'p3', name: 'Mão de obra técnica de freios e sangria', type: 'service', unit_price: 350.00, unit: 'hr' },
      { id: 'p4', name: 'Fluido de freio sintético DOT4 (500ml)', type: 'product', unit_price: 45.00, unit: 'un' },
      { id: 'p5', name: 'Geometria de direção e alinhamento 3D', type: 'service', unit_price: 175.10, unit: 'un' },
      { id: 'p6', name: 'Troca de Óleo 5W30 Sintético + Filtro', type: 'service', unit_price: 220.00, unit: 'un' }
    ],
    packages: [
      {
        id: 'pkg1',
        name: 'Revisão Preventiva e Troca de Óleo',
        description: 'Óleo sintético 5W30, filtro e varredura diagnóstica via scanner',
        items: [
          { description: 'Troca de Óleo 5W30 Sintético + Filtro', quantity: 1, unit_price: 220.00 },
          { description: 'Geometria de direção e alinhamento 3D', quantity: 1, unit_price: 175.10 }
        ]
      },
      {
        id: 'pkg2',
        name: 'Manutenção Completa de Freios Dianteiros',
        description: 'Pastilhas cerâmicas, discos dianteiros e sangria técnica com fluido DOT4',
        items: [
          { description: 'Pastilha de freio dianteira cerâmica (par)', quantity: 1, unit_price: 189.90 },
          { description: 'Disco de freio dianteiro ventilado', quantity: 2, unit_price: 245.00 },
          { description: 'Fluido de freio sintético DOT4 (500ml)', quantity: 1, unit_price: 45.00 },
          { description: 'Mão de obra técnica de freios e sangria', quantity: 1, unit_price: 350.00 }
        ]
      }
    ],
    budgets: [
      {
        id: 'b1',
        budget_number: 42,
        client_name: 'João Carlos de Oliveira',
        client_phone: '(11) 98765-4321',
        status: 'pendente',
        total_amount: 1074.90,
        notes: 'Revisão do sistema de freios dianteiros com teste em pista.',
        link_token: 'b1-mecanica-token',
        valid_until: '2026-10-30',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        items: [
          { description: 'Pastilha de freio dianteira cerâmica (par)', quantity: 1, unit_price: 189.90, total_price: 189.90 },
          { description: 'Disco de freio dianteiro ventilado', quantity: 2, unit_price: 245.00, total_price: 490.00 },
          { description: 'Mão de obra técnica de freios e sangria', quantity: 1, unit_price: 350.00, total_price: 350.00 },
          { description: 'Fluido de freio sintético DOT4 (500ml)', quantity: 1, unit_price: 45.00, total_price: 45.00 }
        ]
      },
      {
        id: 'b2',
        budget_number: 41,
        client_name: 'Maria Fernanda Santos',
        client_phone: '(11) 97654-3210',
        status: 'aprovado',
        total_amount: 560.00,
        notes: 'Troca periódica de lubrificante sintético 5W30 com higienização de ar e alinhamento.',
        link_token: 'b2-mecanica-token',
        valid_until: '2026-10-26',
        created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
        approved_at: new Date(Date.now() - 3600000 * 14).toISOString(),
        signature_data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M 10 38 Q 70 8, 120 32 T 205 28" stroke="%230f172a" stroke-width="2.5" fill="none"/></svg>',
        items: [
          { description: 'Troca de Óleo 5W30 Sintético + Filtro', quantity: 1, unit_price: 220.00, total_price: 220.00 },
          { description: 'Filtro de Ar Condicionado + Oxi-sanitização', quantity: 1, unit_price: 165.00, total_price: 165.00 },
          { description: 'Geometria de direção e alinhamento 3D', quantity: 1, unit_price: 175.00, total_price: 175.00 }
        ]
      },
      {
        id: 'b3',
        budget_number: 40,
        client_name: 'Roberto Lima Frotas',
        client_phone: '(11) 93456-7890',
        status: 'em_andamento',
        total_amount: 1480.00,
        notes: 'Substituição preventiva de correia dentada, bomba d\'água e arrefecimento.',
        link_token: 'b3-mecanica-token',
        valid_until: '2026-10-21',
        created_at: new Date(Date.now() - 3600000 * 32).toISOString(),
        items: [
          { description: 'Kit Correia Dentada e Tensor Original', quantity: 1, unit_price: 480.00, total_price: 480.00 },
          { description: 'Bomba d\'Água Original Pressurizada', quantity: 1, unit_price: 360.00, total_price: 360.00 },
          { description: 'Líquido de Arrefecimento Sintético + Limpeza', quantity: 4, unit_price: 60.00, total_price: 240.00 },
          { description: 'Mão de obra de desmontagem e sincronismo motor', quantity: 1, unit_price: 400.00, total_price: 400.00 }
        ]
      },
      {
        id: 'b4',
        budget_number: 39,
        client_name: 'Guilherme Antunes',
        client_phone: '(11) 99876-1234',
        status: 'concluido',
        total_amount: 890.00,
        notes: 'Suspensão dianteira revisada e entregue com laudo técnico.',
        link_token: 'b4-mecanica-token',
        valid_until: '2026-10-14',
        created_at: new Date(Date.now() - 3600000 * 80).toISOString(),
        items: [
          { description: 'Par de Bieletas e Buchas de Barra Estabilizadora', quantity: 1, unit_price: 290.00, total_price: 290.00 },
          { description: 'Amortecedores Dianteiros Pressurizados (Par)', quantity: 1, unit_price: 420.00, total_price: 420.00 },
          { description: 'Geometria de suspensão e alinhamento 3D', quantity: 1, unit_price: 180.00, total_price: 180.00 }
        ]
      }
    ],
    contract: {
      id: 'ctr-demo-01',
      contract_number: 'CTR-AUTO/2026-042',
      title: 'Contrato de Prestação de Serviços Mecânicos e Fornecimento de Peças',
      provider_name: 'Auto Center Silva Ltda',
      provider_cnpj: '12.345.678/0001-90',
      provider_phone: '(11) 91234-5678',
      provider_address: 'Rua das Oficinas, 123 - Vila Mecânica, São Paulo/SP',
      client_name: 'João Carlos de Oliveira',
      client_doc: '123.456.789-00',
      client_phone: '(11) 98765-4321',
      client_address: 'Av. Brasil, 456 - Centro, São Paulo/SP',
      service_description: 'Revisão completa do sistema de freios dianteiros, substituição de pastilhas cerâmicas e discos ventilados, sangria e teste de frenagem.',
      total_amount: 1074.90,
      payment_terms: 'Entrada de 50% na aprovação e saldo de 50% na liberação do veículo.',
      warranty_days: 90,
      deadline_days: 2,
      status: 'pendente',
      signed_at: null,
      signature_data: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  },

  climatizacao: {
    key: 'climatizacao',
    name: 'Climatização, Refrigeração & Elétrica',
    company_name: 'Silva Climatização & Refrigeração',
    phone: '(11) 91234-5678',
    address: 'Rua do Frio, 220 - São Paulo/SP',
    clients: [
      { id: 'c1', name: 'Clínica Odontológica Sorriso', phone: '(11) 98765-4321', email: 'contato@clinicasorriso.com' },
      { id: 'c2', name: 'Restaurante Sabor & Arte', phone: '(11) 97654-3210', email: 'adm@restaurantesabor.com' },
      { id: 'c3', name: 'Carlos Eduardo Residencial', phone: '(11) 93456-7890', email: 'carlos@email.com' },
      { id: 'c4', name: 'Advocacia Castro & Associados', phone: '(11) 98112-3344', email: 'adm@castroadv.com' }
    ],
    catalog: [
      { id: 'p1', name: 'Instalação de Ar Split 9.000 a 12.000 BTUs', type: 'service', unit_price: 550.00, unit: 'un' },
      { id: 'p2', name: 'Higienização Química Completa e Bactericida', type: 'service', unit_price: 180.00, unit: 'un' },
      { id: 'p3', name: 'Carga de Gás Refrigerante Ecológico R410A / R32', type: 'service', unit_price: 220.00, unit: 'un' },
      { id: 'p4', name: 'Tubulação de Cobre com Isolamento Térmico (mt adicional)', type: 'product', unit_price: 65.00, unit: 'mt' },
      { id: 'p5', name: 'Suporte de Condensadora Reforçado Galvanizado', type: 'product', unit_price: 85.00, unit: 'un' }
    ],
    packages: [
      {
        id: 'pkg_f1',
        name: 'Instalação Padrão Split + Suporte Reforçado',
        description: 'Fixação técnica com teste de vácuo, estanqueidade e suporte externo galvanizado',
        items: [
          { description: 'Instalação de Ar Split 9.000 a 12.000 BTUs', quantity: 1, unit_price: 550.00 },
          { description: 'Suporte de Condensadora Reforçado Galvanizado', quantity: 1, unit_price: 85.00 }
        ]
      },
      {
        id: 'pkg_f2',
        name: 'Manutenção Preventiva e Higienização Química',
        description: 'Limpeza profunda de serpentina, aplicação de bactericida e recarga de gás refrigerante',
        items: [
          { description: 'Higienização Química Completa e Bactericida', quantity: 2, unit_price: 180.00 },
          { description: 'Carga de Gás Refrigerante Ecológico R410A / R32', quantity: 1, unit_price: 220.00 }
        ]
      }
    ],
    budgets: [
      {
        id: 'bf1',
        budget_number: 215,
        client_name: 'Clínica Odontológica Sorriso',
        client_phone: '(11) 98765-4321',
        status: 'pendente',
        total_amount: 635.00,
        notes: 'Instalação em sala cirúrgica com teste de estanqueidade e dreno vedado.',
        link_token: 'b1-climatizacao-token',
        valid_until: '2026-10-29',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        items: [
          { description: 'Instalação de Ar Split 9.000 a 12.000 BTUs', quantity: 1, unit_price: 550.00, total_price: 550.00 },
          { description: 'Suporte de Condensadora Reforçado Galvanizado', quantity: 1, unit_price: 85.00, total_price: 85.00 }
        ]
      },
      {
        id: 'bf2',
        budget_number: 214,
        client_name: 'Restaurante Sabor & Arte',
        client_phone: '(11) 97654-3210',
        status: 'aprovado',
        total_amount: 1150.00,
        notes: 'Higienização periódica de 3 evaporadoras de salão e reposição de fluído térmico.',
        link_token: 'b2-climatizacao-token',
        valid_until: '2026-10-24',
        created_at: new Date(Date.now() - 3600000 * 15).toISOString(),
        approved_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        signature_data: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M 15 42 Q 65 12, 115 36 T 205 32" stroke="%230f172a" stroke-width="2.5" fill="none"/></svg>',
        items: [
          { description: 'Higienização Química Completa e Bactericida', quantity: 3, unit_price: 180.00, total_price: 540.00 },
          { description: 'Carga de Gás Refrigerante Ecológico R410A / R32', quantity: 2, unit_price: 220.00, total_price: 440.00 },
          { description: 'Troca de Filtros Antimicrobianos', quantity: 3, unit_price: 56.67, total_price: 170.00 }
        ]
      },
      {
        id: 'bf3',
        budget_number: 213,
        client_name: 'Carlos Eduardo Residencial',
        client_phone: '(11) 93456-7890',
        status: 'em_andamento',
        total_amount: 850.00,
        notes: 'Remanejamento de condensadora externa e extensão de tubulação frigorígena.',
        link_token: 'b3-climatizacao-token',
        valid_until: '2026-10-21',
        created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
        items: [
          { description: 'Desinstalação técnica e Remanejamento de Split', quantity: 1, unit_price: 380.00, total_price: 380.00 },
          { description: 'Tubulação de Cobre com Isolamento Térmico (mt adicional)', quantity: 6, unit_price: 65.00, total_price: 390.00 },
          { description: 'Teste de Vácuo com Vacuômetro Digital', quantity: 1, unit_price: 80.00, total_price: 80.00 }
        ]
      },
      {
        id: 'bf4',
        budget_number: 212,
        client_name: 'Advocacia Castro & Associados',
        client_phone: '(11) 98112-3344',
        status: 'concluido',
        total_amount: 1780.00,
        notes: 'Instalação de Multi-Split para 3 salas com pressurização a nitrogênio.',
        link_token: 'b4-climatizacao-token',
        valid_until: '2026-10-12',
        created_at: new Date(Date.now() - 3600000 * 84).toISOString(),
        items: [
          { description: 'Instalação de Ar Split 9.000 a 12.000 BTUs', quantity: 2, unit_price: 550.00, total_price: 1100.00 },
          { description: 'Suporte de Condensadora Reforçado Galvanizado', quantity: 2, unit_price: 85.00, total_price: 170.00 },
          { description: 'Carga e Teste de Estanqueidade Pressurizado', quantity: 1, unit_price: 510.00, total_price: 510.00 }
        ]
      }
    ],
    contract: {
      id: 'ctr-demo-01',
      contract_number: 'CTR-CLIMA/2026-215',
      title: 'Contrato de Instalação e Manutenção de Sistemas de Climatização',
      provider_name: 'Silva Climatização & Refrigeração Ltda',
      provider_cnpj: '45.678.901/0001-22',
      provider_phone: '(11) 91234-5678',
      provider_address: 'Rua do Frio, 220 - São Paulo/SP',
      client_name: 'Clínica Odontológica Sorriso',
      client_doc: '11.222.333/0001-44',
      client_phone: '(11) 98765-4321',
      client_address: 'Rua da Saúde, 300 - São Paulo/SP',
      service_description: 'Instalação técnica de unidade evaporadora e condensadora de ar condicionado split com realização de vácuo mínimo de 500 microns, teste de estanqueidade por pressurização e fixação em suportes galvanizados.',
      total_amount: 635.00,
      payment_terms: 'Pagamento de 100% no ato da entrega técnica e teste térmico.',
      warranty_days: 180,
      deadline_days: 2,
      status: 'pendente',
      signed_at: null,
      signature_data: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  }
};

function getDefaultMockData(nicheKey = 'generico') {
  if (nicheKey === 'geral' || nicheKey === 'padrao' || nicheKey === 'universal') nicheKey = 'generico';
  const chosen = NICHES_DATA[nicheKey] || NICHES_DATA.generico || NICHES_DATA.marcenaria;
  return {
    current_niche: chosen.key,
    profile: {
      id: '00000000-0000-0000-0000-000000000001',
      owner_name: 'Carlos Silva',
      company_name: chosen.company_name,
      phone: chosen.phone,
      address: chosen.address
    },
    clients: chosen.clients,
    catalog: chosen.catalog,
    packages: chosen.packages,
    budgets: chosen.budgets,
    contracts: [chosen.contract]
  };
}

class Store {
  constructor() {
    this.isSupabase = (
      CONFIG.SUPABASE_URL !== 'SUA_URL_AQUI' &&
      CONFIG.SUPABASE_ANON_KEY !== 'SUA_CHAVE_ANON_AQUI' &&
      CONFIG.SUPABASE_URL.startsWith('https://')
    );
    this.supabase = this.isSupabase && window.supabase 
      ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY) 
      : null;
    
    this.initMock();
  }

  initMock() {
    let urlNiche = null;
    try {
      if (typeof window !== 'undefined' && window.location) {
        const params = new URLSearchParams(window.location.search);
        urlNiche = params.get('nicho') || params.get('segmento');
        if (urlNiche === 'geral' || urlNiche === 'padrao') urlNiche = 'generico';
      }
    } catch (e) {}

    const MOCK_VERSION = 'v5_universal_generico_and_niches';
    const storedVersion = localStorage.getItem('orcamento_mock_ver');
    const existing = localStorage.getItem(MOCK_STORAGE_KEY);

    // Se for uma versão anterior de mock, força a atualização para carregar os clientes e ordens demonstrativas
    if (!existing || storedVersion !== MOCK_VERSION) {
      localStorage.setItem('orcamento_mock_ver', MOCK_VERSION);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(getDefaultMockData(urlNiche || 'generico')));
      return;
    }

    const data = this.getMock();
    if (urlNiche && NICHES_DATA[urlNiche] && data.current_niche !== urlNiche) {
      this.saveMock(getDefaultMockData(urlNiche));
    } else if (!data.budgets || data.budgets.length <= 1 || !data.clients || data.clients.length <= 1) {
      this.saveMock(getDefaultMockData(data.current_niche || urlNiche || 'generico'));
    }
  }

  getNiche() {
    return this.getMock().current_niche || 'generico';
  }

  setNiche(key) {
    if (key === 'geral' || key === 'padrao') key = 'generico';
    if (!NICHES_DATA[key]) return this.getMock();
    const data = getDefaultMockData(key);
    this.saveMock(data);
    return data;
  }

  getAllNiches() {
    return NICHES_DATA;
  }

  getMock() {
    try {
      return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY)) || getDefaultMockData();
    } catch {
      return getDefaultMockData();
    }
  }

  saveMock(data) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
  }

  // Modo público irrestrito para demonstração sem exigência de login
  isDemoMode() {
    return true;
  }

  async getSession() {
    return { user: { id: '00000000-0000-0000-0000-000000000001', email: 'demo@autocenter.com' } };
  }

  async logout() {
    window.location.href = 'painel.html';
  }

  async getBudgets() {
    if (this.isDemoMode()) {
      return this.getMock().budgets;
    }
    const { data, error } = await this.supabase
      .from('budgets')
      .select('*, client:clients(name, phone, email), items:budget_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(b => ({
      ...b,
      client_name: b.client?.name || 'Cliente Sem Nome',
      client_phone: b.client?.phone || ''
    }));
  }

  async updateBudgetStatus(budgetId, newStatus) {
    if (this.isDemoMode()) {
      const mock = this.getMock();
      const b = mock.budgets.find(item => item.id === budgetId);
      if (b) {
        b.status = newStatus;
        if (newStatus === 'aprovado' && !b.approved_at) {
          b.approved_at = new Date().toISOString();
        }
        this.saveMock(mock);
      }
      return b;
    }
    const { data, error } = await this.supabase
      .from('budgets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', budgetId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getClients() {
    if (this.isDemoMode()) {
      return this.getMock().clients;
    }
    const { data, error } = await this.supabase.from('clients').select('*').order('name');
    if (error) throw error;
    return data;
  }

  async addClient(clientData) {
    if (this.isDemoMode()) {
      const mock = this.getMock();
      const newClient = {
        id: 'c_' + Date.now(),
        ...clientData
      };
      mock.clients.unshift(newClient);
      this.saveMock(mock);
      return newClient;
    }
    const user = (await this.getSession())?.user;
    const { data, error } = await this.supabase
      .from('clients')
      .insert({ ...clientData, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getCatalog() {
    if (this.isDemoMode()) {
      return this.getMock().catalog;
    }
    const { data, error } = await this.supabase.from('products_services').select('*').order('name');
    if (error) throw error;
    return data;
  }

  async getPackages() {
    if (this.isDemoMode()) {
      return this.getMock().packages;
    }
    // Caso conecte ao Supabase
    const { data, error } = await this.supabase
      .from('service_packages')
      .select('*, items:package_items(*)');
    if (error) return this.getMock().packages;
    return data;
  }

  async createBudget(payload) {
    const token = payload.link_token || crypto.randomUUID();
    if (this.isDemoMode()) {
      const mock = this.getMock();
      const nextNum = (mock.budgets[0]?.budget_number || 40) + 1;
      const newBudget = {
        id: 'b_' + Date.now(),
        budget_number: nextNum,
        client_id: payload.client_id,
        client_name: payload.client_name,
        client_phone: payload.client_phone,
        status: 'pendente',
        total_amount: payload.items.reduce((acc, cur) => acc + (cur.quantity * cur.unit_price), 0),
        notes: payload.notes || '',
        link_token: token,
        valid_until: payload.valid_until,
        created_at: new Date().toISOString(),
        items: payload.items.map(it => ({
          ...it,
          total_price: it.quantity * it.unit_price
        }))
      };
      mock.budgets.unshift(newBudget);
      this.saveMock(mock);
      return newBudget;
    }

    const user = (await this.getSession())?.user;
    const { data: budgetData, error: bErr } = await this.supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        client_id: payload.client_id,
        notes: payload.notes,
        valid_until: payload.valid_until,
        status: 'pendente',
        link_token: token
      })
      .select()
      .single();
    if (bErr) throw bErr;

    const itemsToInsert = payload.items.map(it => ({
      budget_id: budgetData.id,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price
    }));

    const { error: itemsErr } = await this.supabase
      .from('budget_items')
      .insert(itemsToInsert);
    if (itemsErr) throw itemsErr;

    return {
      ...budgetData,
      link_token: token,
      client_name: payload.client_name,
      client_phone: payload.client_phone,
      total_amount: payload.items.reduce((acc, cur) => acc + (cur.quantity * cur.unit_price), 0)
    };
  }

  // Métodos de Contrato de Demonstração
  async getContracts() {
    return this.getMock().contracts || [];
  }

  async getContractById(id) {
    const list = await this.getContracts();
    return list.find(c => c.id === id) || list[0] || null;
  }

  async signContract(id, signatureData, ip = '189.120.45.10') {
    const mock = this.getMock();
    const contract = (mock.contracts || []).find(c => c.id === id);
    if (!contract) throw new Error('Contrato não encontrado');

    const now = new Date();
    // Gerar um código hash de autenticidade demonstrativa
    const hashHex = 'DOC-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + now.getTime().toString(36).toUpperCase();

    contract.status = 'assinado';
    contract.signed_at = now.toISOString();
    contract.signature_data = signatureData;
    contract.signature_ip = ip;
    contract.signature_hash = hashHex;

    this.saveMock(mock);
    return contract;
  }
}

// Instância única global
window.AppStore = new Store();

// Helper para montagem de link do WhatsApp (Orçamento)
window.generateWhatsAppLink = function(phone, budgetNumber, total, validUntil, token) {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '/index.html';
  const approvalUrl = `${baseUrl}?token=${token}&tab=pane-cliente`;
  
  const mock = window.AppStore ? window.AppStore.getMock() : null;
  const companyName = mock?.profile?.company_name || 'Nossa Empresa';
  const formattedTotal = Number(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const text = `Olá! Segue a proposta comercial de ${companyName}:\n\n*Orçamento #${String(budgetNumber).padStart(3, '0')}*\n*Valor Total:* ${formattedTotal}\n*Válido até:* ${validUntil || '7 dias'}\n\n*Para conferir os detalhes e formalizar com assinatura digital, acesse:*\n${approvalUrl}`;

  const destPhone = cleanPhone.length >= 10 ? (cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone) : '';
  return `https://wa.me/${destPhone}?text=${encodeURIComponent(text)}`;
};

// Helper para montagem de link do WhatsApp (Contrato)
window.generateContractWhatsAppLink = function(phone, contractNumber, clientName, contractId) {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '/index.html';
  const contractUrl = `${baseUrl}?tab=pane-contrato&id=${contractId || 'ctr-demo-01'}`;
  
  const mock = window.AppStore ? window.AppStore.getMock() : null;
  const companyName = mock?.profile?.company_name || 'Nossa Empresa';
  const text = `Olá, *${clientName || 'Cliente'}*!\n\nSegue o seu *Contrato de Prestação de Serviços (${contractNumber})* emitido por *${companyName}* para conferência e assinatura digital:\n\n*Acesse e assine aqui:*\n${contractUrl}\n\nQualquer dúvida permanecemos à disposição.`;

  const destPhone = cleanPhone.length >= 10 ? (cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone) : '';
  return `https://wa.me/${destPhone}?text=${encodeURIComponent(text)}`;
};
