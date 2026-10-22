/* ============================================================
   SISTEMA DE ORÇAMENTOS E OS
   Autenticação e Camada de Dados (Admin & FlutterFlow Web)
   ============================================================ */

const CONFIG = {
  SUPABASE_URL:      'https://tuveigrmgzvtbtgjmyem.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable__GowN5kG9iUUCjk0XlIMGQ_QMfFdCVr'
};

// Dicionário dos 4 Nichos de Demonstração
const NICHES_DATA = {
  marcenaria: {
    key: 'marcenaria',
    name: 'Marcenaria & Móveis Planejados',
    company_name: 'Silva Marcenaria & Planejados',
    phone: '(11) 91234-5678',
    address: 'Av. dos Marceneiros, 450 - São Paulo/SP',
    clients: [
      { id: 'c1', name: 'Juliana Mendes Arquitetura', phone: '(11) 98765-4321', email: 'juliana@arquiteta.com' },
      { id: 'c2', name: 'Condomínio Reserva dos Ipês', phone: '(11) 97654-3210', email: 'contato@reservaipes.com' },
      { id: 'c3', name: 'Lucas Pinheiro Residencial', phone: '(11) 93456-7890', email: 'lucas@email.com' }
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
      { id: 'c2', name: 'Empresa Alpha Logística (Frotas)', phone: '(11) 97654-3210', email: 'frota@alphalog.com' },
      { id: 'c3', name: 'Marcelo Santos (Galaxy S23)', phone: '(11) 93456-7890', email: 'marcelo@email.com' }
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
      { id: 'c1', name: 'João Carlos de Oliveira', phone: '(11) 98765-4321', email: 'joao@email.com' },
      { id: 'c2', name: 'Maria Fernanda Santos', phone: '(11) 97654-3210', email: 'maria@email.com' },
      { id: 'c3', name: 'Roberto Lima Frotas', phone: '(11) 93456-7890', email: 'roberto@email.com' }
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
      { id: 'c3', name: 'Carlos Eduardo Residencial', phone: '(11) 93456-7890', email: 'carlos@email.com' }
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

function getDefaultMockData(nicheKey = 'marcenaria') {
  const chosen = NICHES_DATA[nicheKey] || NICHES_DATA.marcenaria;
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
      }
    } catch (e) {}

    const existing = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(getDefaultMockData(urlNiche || 'marcenaria')));
    } else {
      const data = this.getMock();
      if (urlNiche && NICHES_DATA[urlNiche] && data.current_niche !== urlNiche) {
        this.saveMock(getDefaultMockData(urlNiche));
      } else if (!data.contracts || !data.current_niche) {
        data.contracts = data.contracts || getDefaultMockData().contracts;
        data.current_niche = data.current_niche || 'marcenaria';
        this.saveMock(data);
      }
    }
  }

  getNiche() {
    return this.getMock().current_niche || 'marcenaria';
  }

  setNiche(key) {
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
