/* ============================================================
   SISTEMA DE ORÇAMENTOS E OS
   Página de Aprovação — Lógica JavaScript
   ============================================================ */

// ============================================================
// CONFIGURAÇÃO — ALTERE AQUI PARA CONECTAR AO SUPABASE
// ============================================================
const CONFIG = {
  SUPABASE_URL:      'https://tuveigrmgzvtbtgjmyem.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable__GowN5kG9iUUCjk0XlIMGQ_QMfFdCVr'
};

// ============================================================
// DADOS DE DEMONSTRAÇÃO (usados quando Supabase não está configurado)
// ============================================================
const DEMO_DATA = {
  budget: {
    id:            'demo-id',
    budget_number: 42,
    status:        'pendente',
    total_amount:  1250.00,
    notes:         'Verificar barulho na suspensão dianteira. Cliente solicita revisão completa dos freios.',
    valid_until:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    approved_at:   null,
    signature_data: null,
    created_at:    new Date().toISOString()
  },
  client: {
    name:  'João Carlos de Oliveira',
    phone: '(11) 98765-4321',
    email: 'joao.oliveira@email.com'
  },
  provider: {
    company_name: 'Auto Center Silva',
    owner_name:   'Carlos Silva',
    logo_url:     null,
    phone:        '(11) 91234-5678'
  },
  items: [
    { description: 'Pastilha de freio dianteira (par)', quantity: 1, unit_price: 189.90, total_price: 189.90 },
    { description: 'Disco de freio dianteiro',          quantity: 2, unit_price: 245.00, total_price: 490.00 },
    { description: 'Mão de obra - troca de freios',     quantity: 1, unit_price: 350.00, total_price: 350.00 },
    { description: 'Fluido de freio DOT4 (500ml)',      quantity: 1, unit_price:  45.00, total_price:  45.00 },
    { description: 'Alinhamento e balanceamento',       quantity: 1, unit_price: 175.10, total_price: 175.10 }
  ]
};

// ============================================================
// APLICAÇÃO PRINCIPAL
// ============================================================
const App = {
  // Estado
  supabase:     null,
  signaturePad: null,
  data:         null,
  token:        null,
  isDemo:       false,

  // ========================
  // INICIALIZAÇÃO
  // ========================
  init() {
    this.token = this.getTokenFromURL();
    this.isDemo = !this.isSupabaseConfigured();

    if (this.isDemo) {
      console.log('⚡ Modo demonstração ativo (Supabase não configurado)');
      // Tentar buscar do mock compartilhado do painel
      let mockItem = null;
      try {
        const mockStore = JSON.parse(localStorage.getItem('orcamento_app_mock_state_v1'));
        if (mockStore && mockStore.budgets) {
          const found = mockStore.budgets.find(b => b.link_token === this.token);
          if (found) {
            mockItem = {
              budget: found,
              client: {
                name: found.client_name,
                phone: found.client_phone,
                email: 'cliente@exemplo.com'
              },
              provider: mockStore.profile,
              items: found.items || []
            };
          }
        }
      } catch (e) {
        console.warn('Erro ao ler mock compartilhado', e);
      }

      this.data = mockItem || DEMO_DATA;
      this.render(this.data);
      this.showScreen('screen-budget');
      document.getElementById('demo-banner').classList.remove('hidden');
    } else {
      this.initSupabase();
      this.fetchBudget();
    }
  },

  // ========================
  // HELPERS
  // ========================
  getTokenFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('token');
  },

  isSupabaseConfigured() {
    return (
      CONFIG.SUPABASE_URL !== 'SUA_URL_AQUI' &&
      CONFIG.SUPABASE_ANON_KEY !== 'SUA_CHAVE_ANON_AQUI' &&
      CONFIG.SUPABASE_URL.startsWith('https://')
    );
  },

  initSupabase() {
    this.supabase = window.supabase.createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_ANON_KEY
    );
  },

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
  },

  showError(message) {
    document.getElementById('error-message').textContent = message;
    this.showScreen('screen-error');
  },

  formatCurrency(value) {
    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatQuantity(qty) {
    const n = Number(qty);
    return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
  },

  getStatusLabel(status) {
    const labels = {
      'pendente':      '⏳ Pendente',
      'aprovado':      '✅ Aprovado',
      'em_andamento':  '🔧 Em Andamento',
      'concluido':     '🏁 Concluído',
      'cancelado':     '❌ Cancelado'
    };
    return labels[status] || status;
  },

  isExpired(validUntil) {
    if (!validUntil) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(validUntil) < today;
  },

  // ========================
  // BUSCAR DADOS DO SUPABASE
  // ========================
  async fetchBudget() {
    if (!this.token) {
      this.showError('Link inválido: token não encontrado na URL.');
      return;
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_budget_by_token', { p_token: this.token });

      if (error) throw error;
      if (!data || data.error) {
        this.showError(data?.error || 'Orçamento não encontrado.');
        return;
      }

      this.data = data;
      this.render(data);
      this.showScreen('screen-budget');

    } catch (err) {
      console.error('Erro ao buscar orçamento:', err);
      this.showError('Erro ao carregar o orçamento. Tente novamente.');
    }
  },

  // ========================
  // RENDERIZAR PÁGINA
  // ========================
  render(data) {
    const { budget, client, provider, items } = data;

    // --- Provider Header ---
    const logoEl = document.getElementById('provider-logo');
    const logoPlaceholder = document.getElementById('provider-logo-placeholder');

    if (provider.logo_url) {
      logoEl.src = provider.logo_url;
      logoEl.classList.remove('hidden');
      logoPlaceholder.classList.add('hidden');
    }

    document.getElementById('provider-name').textContent =
      provider.company_name || provider.owner_name || 'Prestador';
    document.getElementById('provider-phone').textContent =
      provider.phone ? `📞 ${provider.phone}` : '';

    // --- Status Badge ---
    const expired = this.isExpired(budget.valid_until);
    const statusBadge = document.getElementById('status-badge');
    if (expired && budget.status === 'pendente') {
      statusBadge.textContent = '⏰ Expirado';
      statusBadge.className = 'status-badge status-badge--expirado';
    } else {
      statusBadge.textContent = this.getStatusLabel(budget.status);
      statusBadge.className = `status-badge status-badge--${budget.status}`;
    }

    // --- Budget Info ---
    document.getElementById('budget-number').textContent = `#${String(budget.budget_number).padStart(3, '0')}`;
    document.getElementById('budget-date').textContent = this.formatDate(budget.created_at);
    document.getElementById('budget-valid-until').textContent =
      budget.valid_until ? this.formatDate(budget.valid_until) : 'Sem validade';

    // --- Client Info ---
    document.getElementById('client-name').textContent = client.name;
    document.getElementById('client-phone').textContent = client.phone ? `📞 ${client.phone}` : '';
    document.getElementById('client-email').textContent = client.email ? `✉️ ${client.email}` : '';

    // --- Items ---
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';

    if (items && items.length > 0) {
      items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item-card';
        itemEl.innerHTML = `
          <div class="item-description">${this.escapeHtml(item.description)}</div>
          <div class="item-details">
            <div class="item-qty-price">
              <span>${this.formatQuantity(item.quantity)}x</span>
              <span>${this.formatCurrency(item.unit_price)}</span>
            </div>
            <span class="item-subtotal">${this.formatCurrency(item.total_price)}</span>
          </div>
        `;
        itemsList.appendChild(itemEl);
      });
    } else {
      itemsList.innerHTML = '<p style="padding: 1rem; color: #94a3b8; text-align: center;">Nenhum item</p>';
    }

    // --- Total ---
    document.getElementById('total-amount').textContent = this.formatCurrency(budget.total_amount);

    // --- Notes ---
    if (budget.notes) {
      document.getElementById('budget-notes').textContent = budget.notes;
      document.getElementById('notes-section').classList.remove('hidden');
    }

    // --- Signature (if already approved) ---
    if (budget.signature_data) {
      document.getElementById('signature-image').src = budget.signature_data;
      document.getElementById('approved-at-text').textContent =
        budget.approved_at ? `Aprovado em ${this.formatDateTime(budget.approved_at)}` : '';
      document.getElementById('signature-section').classList.remove('hidden');
    }

    // --- Action area ---
    const canApprove = budget.status === 'pendente' && !expired;

    if (canApprove) {
      document.getElementById('action-area').classList.remove('hidden');
      document.getElementById('btn-approve').addEventListener('click', () => this.openSignatureModal());
    } else if (budget.status !== 'pendente') {
      // Orçamento já processado
      const msgEl = document.getElementById('status-message');
      const msgText = document.getElementById('status-message-text');

      const messages = {
        'aprovado':      '✅ Este orçamento já foi aprovado.',
        'em_andamento':  '🔧 Este serviço está em andamento.',
        'concluido':     '🏁 Este serviço foi concluído.',
        'cancelado':     '❌ Este orçamento foi cancelado.'
      };

      msgText.textContent = messages[budget.status] || '';
      msgEl.classList.remove('hidden');
    } else if (expired) {
      const msgEl = document.getElementById('status-message');
      document.getElementById('status-message-text').textContent =
        `⏰ Este orçamento expirou em ${this.formatDate(budget.valid_until)}. Entre em contato com o prestador.`;
      msgEl.classList.remove('hidden');
    }

    // --- Update page title ---
    document.title = `Orçamento #${String(budget.budget_number).padStart(3, '0')} — ${provider.company_name || provider.owner_name || 'Orçamento'}`;
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // ========================
  // MODAL DE ASSINATURA
  // ========================
  openSignatureModal() {
    const modal = document.getElementById('signature-modal');
    modal.classList.remove('hidden');

    // Inicializar Signature Pad
    const canvas = document.getElementById('signature-pad');
    this.resizeCanvas(canvas);
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(248, 250, 252)', // gray-50
      penColor: 'rgb(30, 41, 59)',            // gray-800
      minWidth: 1,
      maxWidth: 3,
      velocityFilterWeight: 0.7
    });

    // Event listeners
    document.getElementById('btn-clear').onclick = () => this.signaturePad.clear();
    document.getElementById('btn-cancel').onclick = () => this.closeSignatureModal();
    document.getElementById('btn-confirm').onclick = () => this.confirmApproval();

    // Fechar clicando no overlay
    document.querySelector('.modal-overlay').onclick = () => this.closeSignatureModal();

    // Resize canvas on orientation change
    window.addEventListener('resize', () => this.resizeCanvas(canvas));
  },

  closeSignatureModal() {
    const modal = document.getElementById('signature-modal');
    modal.classList.add('hidden');
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  },

  resizeCanvas(canvas) {
    const wrapper = canvas.parentElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = wrapper.offsetWidth * ratio;
    canvas.height = 200 * ratio;
    canvas.style.width = wrapper.offsetWidth + 'px';
    canvas.style.height = '200px';

    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);

    // Limpar e re-aplicar background
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  },

  // ========================
  // CONFIRMAR APROVAÇÃO
  // ========================
  async confirmApproval() {
    // Validar assinatura
    if (this.signaturePad.isEmpty()) {
      alert('Por favor, assine antes de confirmar.');
      return;
    }

    // Obter dados da assinatura
    const signatureData = this.signaturePad.toDataURL('image/png');

    // Desabilitar botão
    const btnConfirm = document.getElementById('btn-confirm');
    const btnOriginalText = btnConfirm.textContent;
    btnConfirm.disabled = true;
    btnConfirm.textContent = '⏳ Enviando...';

    if (this.isDemo) {
      // Simular aprovação no modo demo e persistir no storage compartilhado
      await new Promise(resolve => setTimeout(resolve, 800));
      try {
        const mockStore = JSON.parse(localStorage.getItem('orcamento_app_mock_state_v1'));
        if (mockStore && mockStore.budgets) {
          const b = mockStore.budgets.find(item => item.link_token === this.token);
          if (b) {
            b.status = 'aprovado';
            b.approved_at = new Date().toISOString();
            b.signature_data = signatureData;
            localStorage.setItem('orcamento_app_mock_state_v1', JSON.stringify(mockStore));
          }
        }
      } catch (err) {
        console.warn('Erro ao atualizar mock:', err);
      }
      this.showSuccessScreen();
      return;
    }

    try {
      // Obter IP do cliente (opcional, melhor esforço)
      let clientIp = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        clientIp = ipData.ip;
      } catch {
        // IP não é crítico, continuar sem ele
        console.warn('Não foi possível obter o IP do cliente');
      }

      // Chamar função de aprovação no Supabase
      const { data, error } = await this.supabase
        .rpc('approve_budget', {
          p_token:     this.token,
          p_signature: signatureData,
          p_client_ip: clientIp
        });

      if (error) throw error;

      if (data && data.success) {
        this.showSuccessScreen();
      } else {
        alert(data?.error || 'Erro ao aprovar o orçamento.');
        btnConfirm.disabled = false;
        btnConfirm.textContent = btnOriginalText;
      }

    } catch (err) {
      console.error('Erro ao aprovar:', err);
      alert('Erro ao enviar a aprovação. Verifique sua conexão e tente novamente.');
      btnConfirm.disabled = false;
      btnConfirm.textContent = btnOriginalText;
    }
  },

  // ========================
  // TELA DE SUCESSO
  // ========================
  showSuccessScreen() {
    const { budget, provider } = this.data;

    document.getElementById('success-budget-number').textContent =
      `#${String(budget.budget_number).padStart(3, '0')}`;
    document.getElementById('success-total').textContent =
      this.formatCurrency(budget.total_amount);
    document.getElementById('success-date').textContent =
      this.formatDateTime(new Date().toISOString());

    // Atualizar título
    document.title = `✅ Orçamento Aprovado — ${provider.company_name || provider.owner_name || ''}`;

    this.showScreen('screen-success');
  }
};

// ============================================================
// INICIAR APP
// ============================================================
document.addEventListener('DOMContentLoaded', () => App.init());
