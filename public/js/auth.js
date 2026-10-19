/* ============================================================
   SISTEMA DE ORÇAMENTOS E OS
   Autenticação e Camada de Dados (Admin & FlutterFlow Web)
   ============================================================ */

const CONFIG = {
  SUPABASE_URL:      'https://tuveigrmgzvtbtgjmyem.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable__GowN5kG9iUUCjk0XlIMGQ_QMfFdCVr'
};

// Dados Mock para funcionamento offline / demo
const MOCK_STORAGE_KEY = 'orcamento_app_mock_state_v1';

function getDefaultMockData() {
  return {
    profile: {
      id: '00000000-0000-0000-0000-000000000001',
      owner_name: 'Carlos Silva',
      company_name: 'Auto Center Silva',
      phone: '(11) 91234-5678',
      address: 'Rua das Oficinas, 123 - São Paulo/SP'
    },
    clients: [
      { id: 'c1', name: 'João Carlos de Oliveira', phone: '(11) 98765-4321', email: 'joao@email.com' },
      { id: 'c2', name: 'Maria Fernanda Santos', phone: '(11) 97654-3210', email: 'maria@email.com' },
      { id: 'c3', name: 'Roberto Lima Mecânica', phone: '(11) 93456-7890', email: 'roberto@email.com' }
    ],
    catalog: [
      { id: 'p1', name: 'Pastilha de freio dianteira (par)', type: 'product', unit_price: 189.90, unit: 'un' },
      { id: 'p2', name: 'Disco de freio dianteiro', type: 'product', unit_price: 245.00, unit: 'un' },
      { id: 'p3', name: 'Mão de obra - troca de freios', type: 'service', unit_price: 350.00, unit: 'hr' },
      { id: 'p4', name: 'Fluido de freio DOT4 (500ml)', type: 'product', unit_price: 45.00, unit: 'un' },
      { id: 'p5', name: 'Alinhamento 3D e balanceamento', type: 'service', unit_price: 175.10, unit: 'un' },
      { id: 'p6', name: 'Troca de Óleo + Filtro Motor', type: 'service', unit_price: 220.00, unit: 'un' },
      { id: 'p7', name: 'Diagnóstico Eletrônico Scanner', type: 'service', unit_price: 120.00, unit: 'un' }
    ],
    packages: [
      {
        id: 'pkg1',
        name: 'Revisão Básica',
        icon: '🔧',
        description: 'Troca de óleo, filtro e diagnóstico eletrônico completo',
        items: [
          { description: 'Troca de Óleo + Filtro Motor', quantity: 1, unit_price: 220.00 },
          { description: 'Diagnóstico Eletrônico Scanner', quantity: 1, unit_price: 120.00 }
        ]
      },
      {
        id: 'pkg2',
        name: 'Freio Completo Dianteiro',
        icon: '🛞',
        description: 'Pastilhas cerâmicas, discos dianteiros e fluido novo',
        items: [
          { description: 'Pastilha de freio dianteira (par)', quantity: 1, unit_price: 189.90 },
          { description: 'Disco de freio dianteiro', quantity: 2, unit_price: 245.00 },
          { description: 'Fluido de freio DOT4 (500ml)', quantity: 1, unit_price: 45.00 },
          { description: 'Mão de obra - troca de freios', quantity: 1, unit_price: 350.00 }
        ]
      },
      {
        id: 'pkg3',
        name: 'Alinhamento + Diagnóstico',
        icon: '⚡',
        description: 'Alinhamento 3D de precisão com varredura eletrônica',
        items: [
          { description: 'Alinhamento 3D e balanceamento', quantity: 1, unit_price: 175.10 },
          { description: 'Diagnóstico Eletrônico Scanner', quantity: 1, unit_price: 120.00 }
        ]
      }
    ],
    budgets: [
      {
        id: 'b1',
        budget_number: 42,
        client_id: 'c1',
        client_name: 'João Carlos de Oliveira',
        client_phone: '(11) 98765-4321',
        status: 'pendente',
        total_amount: 1250.00,
        notes: 'Verificar barulho na suspensão dianteira. Cliente solicita revisão completa dos freios.',
        link_token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        valid_until: '2026-10-25',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        items: [
          { description: 'Pastilha de freio dianteira (par)', quantity: 1, unit_price: 189.90, total_price: 189.90 },
          { description: 'Disco de freio dianteiro', quantity: 2, unit_price: 245.00, total_price: 490.00 },
          { description: 'Mão de obra - troca de freios', quantity: 1, unit_price: 350.00, total_price: 350.00 },
          { description: 'Fluido de freio DOT4 (500ml)', quantity: 1, unit_price: 45.00, total_price: 45.00 },
          { description: 'Alinhamento 3D e balanceamento', quantity: 1, unit_price: 175.10, total_price: 175.10 }
        ]
      },
      {
        id: 'b2',
        budget_number: 43,
        client_id: 'c2',
        client_name: 'Maria Fernanda Santos',
        client_phone: '(11) 97654-3210',
        status: 'aprovado',
        total_amount: 340.00,
        notes: 'Troca periódica de óleo e diagnóstico preventivo.',
        link_token: 'b2c3d4e5-f6a7-8901-bcde-fa2345678901',
        valid_until: '2026-10-30',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        approved_at: new Date(Date.now() - 43200000).toISOString(),
        items: [
          { description: 'Troca de Óleo + Filtro Motor', quantity: 1, unit_price: 220.00, total_price: 220.00 },
          { description: 'Diagnóstico Eletrônico Scanner', quantity: 1, unit_price: 120.00, total_price: 120.00 }
        ]
      },
      {
        id: 'b3',
        budget_number: 44,
        client_id: 'c3',
        client_name: 'Roberto Lima Mecânica',
        client_phone: '(11) 93456-7890',
        status: 'em_andamento',
        total_amount: 525.10,
        notes: 'Alinhamento de frota e substituição de pastilhas.',
        link_token: 'c3d4e5f6-a7b8-9012-cdef-ab3456789012',
        valid_until: '2026-10-28',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        approved_at: new Date(Date.now() - 86400000).toISOString(),
        items: [
          { description: 'Pastilha de freio dianteira (par)', quantity: 1, unit_price: 189.90, total_price: 189.90 },
          { description: 'Alinhamento 3D e balanceamento', quantity: 1, unit_price: 175.10, total_price: 175.10 },
          { description: 'Diagnóstico Eletrônico Scanner', quantity: 1, unit_price: 120.00, total_price: 120.00 }
        ]
      }
    ],
    contracts: [
      {
        id: 'ctr-demo-01',
        contract_number: 'CTR-2026/042',
        title: 'Contrato de Prestação de Serviços Mecânicos e Fornecimento de Peças',
        provider_name: 'Auto Center Silva Ltda',
        provider_cnpj: '12.345.678/0001-90',
        provider_phone: '(11) 91234-5678',
        provider_address: 'Rua das Oficinas, 123 - Vila Mecânica, São Paulo/SP',
        client_name: 'João Carlos de Oliveira',
        client_doc: '123.456.789-00',
        client_phone: '(11) 98765-4321',
        client_address: 'Av. Brasil, 456 - Centro, São Paulo/SP',
        service_description: 'Revisão completa do sistema de freios dianteiros, substituição de pastilhas e discos, troca do fluido DOT4, alinhamento 3D e sangria geral.',
        total_amount: 1250.00,
        payment_terms: 'Entrada de R$ 625,00 no ato da assinatura e saldo de R$ 625,00 na entrega do veículo.',
        warranty_days: 90,
        deadline_days: 2,
        status: 'pendente', // 'pendente' ou 'assinado'
        signed_at: null,
        signature_data: null,
        signature_ip: null,
        signature_hash: null,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
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
    if (!localStorage.getItem(MOCK_STORAGE_KEY)) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(getDefaultMockData()));
    } else {
      // Garantir que a chave contracts exista mesmo em storage antigo
      const data = this.getMock();
      if (!data.contracts) {
        data.contracts = getDefaultMockData().contracts;
        this.saveMock(data);
      }
    }
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
  const approvalUrl = `${baseUrl}?token=${token}`;
  
  const formattedTotal = Number(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const text = `Olá! Segue seu orçamento da oficina:\n\n📋 *Orçamento #${String(budgetNumber).padStart(3, '0')}*\n💰 *Total:* ${formattedTotal}\n📅 *Válido até:* ${validUntil || '7 dias'}\n\n👉 *Confira os detalhes e aprove com assinatura digital aqui:*\n${approvalUrl}`;

  const destPhone = cleanPhone.length >= 10 ? (cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone) : '';
  return `https://wa.me/${destPhone}?text=${encodeURIComponent(text)}`;
};

// Helper para montagem de link do WhatsApp (Contrato)
window.generateContractWhatsAppLink = function(phone, contractNumber, clientName, contractId) {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '/contrato.html';
  const contractUrl = `${baseUrl}?id=${contractId || 'ctr-demo-01'}`;
  
  const text = `Olá, *${clientName || 'Cliente'}*!\n\nSegue o seu *Contrato de Prestação de Serviços (${contractNumber})* pronto para conferência e assinatura digital pelo celular:\n\n👉 *Acesse e assine aqui:*\n${contractUrl}\n\nQualquer dúvida estamos à disposição!`;

  const destPhone = cleanPhone.length >= 10 ? (cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone) : '';
  return `https://wa.me/${destPhone}?text=${encodeURIComponent(text)}`;
};
