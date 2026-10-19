/* ============================================================
   SISTEMA DE ORÇAMENTOS E OS — ALL-IN-ONE SINGLE PAGE APP
   Gerenciador Unificado de Abas: Painel, Criação, Contrato e Cliente
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.AppStore;

  // Estado Geral da Aplicação
  let activeTab = 'pane-painel';
  let allBudgets = [];
  let clients = [];
  let packages = [];
  let catalog = [];
  let currentContract = null;
  let activeBudgetForClient = null;
  let signaturePad = null;
  let signContext = 'contract'; // 'contract' ou 'budget'

  // ============================================================
  // NAVEGAÇÃO ENTRE ABAS
  // ============================================================
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const panes = document.querySelectorAll('.tab-content-pane');

  function switchTab(targetPaneId) {
    activeTab = targetPaneId;
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === targetPaneId);
    });
    panes.forEach(pane => {
      pane.classList.toggle('active', pane.id === targetPaneId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Recarregar dados específicos ao entrar na aba
    if (targetPaneId === 'pane-painel') {
      renderPainel();
    } else if (targetPaneId === 'pane-contrato') {
      loadContract();
    } else if (targetPaneId === 'pane-cliente') {
      renderClientView();
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // ============================================================
  // MODAL DE ASSINATURA COMPARTILHADO
  // ============================================================
  const modal = document.getElementById('signature-modal');
  const canvas = document.getElementById('signature-pad');
  const btnClearSig = document.getElementById('btn-clear-sig');
  const btnCancelSig = document.getElementById('btn-cancel-sig');
  const btnConfirmSig = document.getElementById('btn-confirm-sig');

  function openSignaturePad(context, title) {
    signContext = context;
    document.getElementById('modal-sign-title').textContent = title || '✍️ Assine na tela';
    modal.classList.remove('hidden');
    resizeCanvas();

    if (!signaturePad) {
      signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(248, 250, 252)',
        penColor: 'rgb(30, 41, 59)',
        minWidth: 1.5,
        maxWidth: 3.5
      });
    } else {
      signaturePad.clear();
    }
  }

  function resizeCanvas() {
    const wrapper = canvas.parentElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = wrapper.offsetWidth * ratio;
    canvas.height = 200 * ratio;
    canvas.style.width = wrapper.offsetWidth + 'px';
    canvas.style.height = '200px';

    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
  }

  window.addEventListener('resize', () => {
    if (!modal.classList.contains('hidden')) resizeCanvas();
  });

  btnClearSig.addEventListener('click', () => signaturePad && signaturePad.clear());
  btnCancelSig.addEventListener('click', () => modal.classList.add('hidden'));
  document.querySelector('.modal-overlay').addEventListener('click', () => modal.classList.add('hidden'));

  btnConfirmSig.addEventListener('click', async () => {
    if (!signaturePad || signaturePad.isEmpty()) {
      alert('Por favor assine no campo antes de confirmar.');
      return;
    }

    const signatureData = signaturePad.toDataURL('image/png');
    btnConfirmSig.disabled = true;
    btnConfirmSig.textContent = 'Gravando...';

    try {
      if (signContext === 'contract') {
        await store.signContract(currentContract.id, signatureData);
        modal.classList.add('hidden');
        await loadContract();
        alert('Contrato assinado eletronicamente com sucesso.');
      } else if (signContext === 'budget') {
        await store.updateBudgetStatus(activeBudgetForClient.id, 'aprovado');
        activeBudgetForClient.status = 'aprovado';
        activeBudgetForClient.signature_data = signatureData;
        activeBudgetForClient.approved_at = new Date().toISOString();
        
        // Atualizar mock store
        const m = store.getMock();
        const bFound = m.budgets.find(item => item.id === activeBudgetForClient.id);
        if (bFound) {
          bFound.status = 'aprovado';
          bFound.signature_data = signatureData;
          bFound.approved_at = new Date().toISOString();
          store.saveMock(m);
        }

        modal.classList.add('hidden');
        renderClientView();
        alert('Proposta aprovada com assinatura eletrônica registrada.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao confirmar assinatura.');
    } finally {
      btnConfirmSig.disabled = false;
      btnConfirmSig.textContent = 'Confirmar Assinatura';
    }
  });

  // ============================================================
  // SEÇÃO 1: PAINEL / DASHBOARD
  // ============================================================
  let currentFilter = 'todos';

  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      renderBudgetList();
    });
  });

  async function renderPainel() {
    allBudgets = await store.getBudgets();
    updateKPIs();
    renderBudgetList();
  }

  function updateKPIs() {
    const stats = {
      pendente: { count: 0, total: 0 },
      aprovado: { count: 0, total: 0 },
      em_andamento: { count: 0, total: 0 },
      concluido: { count: 0, total: 0 }
    };

    allBudgets.forEach(b => {
      const st = b.status || 'pendente';
      if (stats[st]) {
        stats[st].count++;
        stats[st].total += Number(b.total_amount || 0);
      }
    });

    const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    document.getElementById('kpi-pending-count').textContent = stats.pendente.count;
    document.getElementById('kpi-pending-total').textContent = fmt(stats.pendente.total);

    document.getElementById('kpi-approved-count').textContent = stats.aprovado.count;
    document.getElementById('kpi-approved-total').textContent = fmt(stats.aprovado.total);

    document.getElementById('kpi-progress-count').textContent = stats.em_andamento.count;
    document.getElementById('kpi-progress-total').textContent = fmt(stats.em_andamento.total);

    document.getElementById('kpi-done-count').textContent = stats.concluido.count;
    document.getElementById('kpi-done-total').textContent = fmt(stats.concluido.total);

    document.getElementById('count-todos').textContent = allBudgets.length;
    document.getElementById('count-pendente').textContent = stats.pendente.count;
    document.getElementById('count-aprovado').textContent = stats.aprovado.count;
    document.getElementById('count-em_andamento').textContent = stats.em_andamento.count;
    document.getElementById('count-concluido').textContent = stats.concluido.count;
  }

  function renderBudgetList() {
    const container = document.getElementById('budgets-feed');
    container.innerHTML = '';

    const filtered = allBudgets.filter(b => {
      if (currentFilter === 'todos') return true;
      return b.status === currentFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="background: white; border-radius: var(--radius-md); border: 1px dashed var(--gray-300); padding: 36px 16px; text-align: center; color: var(--gray-500);">
          <p style="font-weight: 600; font-size: 0.9rem; color: var(--gray-700);">Nenhuma ordem de serviço localizada neste filtro.</p>
          <button type="button" class="btn-corp btn-corp-primary" style="margin-top: 12px; font-size: 0.8rem;" onclick="document.querySelector('[data-tab=pane-novo-orcamento]').click()">
            + Cadastrar Nova Proposta
          </button>
        </div>
      `;
      return;
    }

    filtered.forEach(b => {
      const card = document.createElement('div');
      card.className = 'budget-feed-card';

      const itemsText = (b.items || []).map(i => `${i.quantity}x ${i.description}`).join(' · ') || 'Sem itens discriminados';
      const fmtTotal = Number(b.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const numFmt = '#' + String(b.budget_number || 0).padStart(3, '0');
      const waLink = window.generateWhatsAppLink(b.client_phone, b.budget_number, b.total_amount, b.valid_until, b.link_token);

      const statusLabels = {
        'pendente': 'Pendente',
        'aprovado': 'Aprovado',
        'em_andamento': 'Em Execução',
        'concluido': 'Concluído',
        'cancelado': 'Cancelado'
      };

      card.innerHTML = `
        <div class="budget-feed-header">
          <div>
            <span class="budget-num-title">${numFmt}</span>
            <span style="font-size: 0.72rem; color: var(--gray-500); margin-left: 8px;">
              ${new Date(b.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <span class="status-badge" style="font-size: 0.72rem; padding: 2px 8px; border: 1px solid var(--gray-300); background: var(--gray-50); color: var(--gray-800);">
            <span class="status-dot ${b.status}"></span>${statusLabels[b.status] || b.status}
          </span>
        </div>

        <div class="budget-client-name" style="font-size: 0.9rem;">
          ${escapeHtml(b.client_name || 'Cliente')} 
          ${b.client_phone ? `<span style="font-weight: normal; color: var(--gray-500); font-size: 0.8rem;">· ${b.client_phone}</span>` : ''}
        </div>

        <div class="budget-items-summary" style="color: var(--gray-600); font-size: 0.78rem;">
          ${escapeHtml(itemsText)}
        </div>

        <div class="budget-feed-footer">
          <div>
            <div style="font-size: 0.65rem; color: var(--gray-400); text-transform: uppercase; font-weight: 700;">Valor Total</div>
            <div class="budget-feed-total" style="color: #0f172a; font-size: 1.1rem;">${fmtTotal}</div>
          </div>

          <div class="budget-feed-actions">
            <select class="select-status-quick" data-id="${b.id}" style="font-size: 0.75rem; padding: 4px 6px;">
              <option value="pendente" ${b.status === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="aprovado" ${b.status === 'aprovado' ? 'selected' : ''}>Aprovado</option>
              <option value="em_andamento" ${b.status === 'em_andamento' ? 'selected' : ''}>Em Execução</option>
              <option value="concluido" ${b.status === 'concluido' ? 'selected' : ''}>Concluído</option>
              <option value="cancelado" ${b.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>

            <a href="${waLink}" target="_blank" class="btn-corp btn-corp-wa" style="font-size: 0.75rem; padding: 5px 10px;" title="Enviar pelo WhatsApp">
              WhatsApp
            </a>
            <button type="button" class="btn-corp btn-corp-secondary btn-inspect-client" style="font-size: 0.75rem; padding: 5px 10px;" data-id="${b.id}">
              Visualizar
            </button>
          </div>
        </div>
      `;

      // Evento de alteração de status
      const selStatus = card.querySelector('.select-status-quick');
      selStatus.addEventListener('change', async (e) => {
        const val = e.target.value;
        await store.updateBudgetStatus(b.id, val);
        b.status = val;
        updateKPIs();
        renderBudgetList();
      });

      // Evento para abrir direto na Visão do Cliente (Aba 4)
      card.querySelector('.btn-inspect-client').addEventListener('click', () => {
        activeBudgetForClient = b;
        switchTab('pane-cliente');
      });

      container.appendChild(card);
    });
  }

  // ============================================================
  // SEÇÃO 2: NOVO ORÇAMENTO RELÂMPAGO
  // ============================================================
  let draftItems = [];
  const clientSelect = document.getElementById('client-select');
  const btnToggleNewClient = document.getElementById('btn-toggle-new-client');
  const newClientForm = document.getElementById('new-client-form');
  const selectClientWrapper = document.getElementById('select-client-wrapper');
  const btnSaveInlineClient = document.getElementById('btn-save-inline-client');
  const btnCancelInlineClient = document.getElementById('btn-cancel-inline-client');
  const packagesList = document.getElementById('packages-list');
  const favoritesChips = document.getElementById('favorites-chips');
  const draftItemsList = document.getElementById('draft-items-list');
  const emptyPlaceholder = document.getElementById('empty-items-placeholder');
  const draftTotalDisplay = document.getElementById('draft-total-display');
  const itemsCountBadge = document.getElementById('items-count-badge');
  const btnAddManualItem = document.getElementById('btn-add-manual-item');
  const btnCloneLast = document.getElementById('btn-clone-last');
  const btnSaveDraft = document.getElementById('btn-save-draft');
  const btnSaveAndSendWa = document.getElementById('btn-save-and-send-wa');

  async function loadNovoOrcamentoData() {
    [clients, packages, catalog] = await Promise.all([
      store.getClients(),
      store.getPackages(),
      store.getCatalog()
    ]);
    populateClientsSelect();
    renderPackages();
    renderFavorites();
    updateItemsView();
  }

  function populateClientsSelect(selectedId = null) {
    clientSelect.innerHTML = '<option value="">Selecione um cliente...</option>';
    clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.phone || 'Sem fone'})`;
      if (selectedId && c.id === selectedId) opt.selected = true;
      clientSelect.appendChild(opt);
    });
  }

  btnToggleNewClient.addEventListener('click', () => {
    newClientForm.classList.toggle('hidden');
    selectClientWrapper.classList.toggle('hidden');
  });

  btnCancelInlineClient.addEventListener('click', () => {
    newClientForm.classList.add('hidden');
    selectClientWrapper.classList.remove('hidden');
  });

  btnSaveInlineClient.addEventListener('click', async () => {
    const name = document.getElementById('new-client-name').value.trim();
    const phone = document.getElementById('new-client-phone').value.trim();
    if (!name) { alert('Informe o nome do cliente'); return; }

    const newClient = await store.addClient({ name, phone });
    clients.unshift(newClient);
    populateClientsSelect(newClient.id);
    newClientForm.classList.add('hidden');
    selectClientWrapper.classList.remove('hidden');
  });

  function renderPackages() {
    packagesList.innerHTML = '';
    packages.forEach(pkg => {
      const card = document.createElement('div');
      card.className = 'package-card';
      const totalPkg = (pkg.items || []).reduce((acc, i) => acc + (i.quantity * i.unit_price), 0);
      const fmtTotal = Number(totalPkg).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      card.innerHTML = `
        <span class="package-add-badge" style="background: #0f172a; font-size: 0.65rem;">+ Adicionar</span>
        <div class="package-name" style="font-size: 0.85rem; font-weight: 700; color: #0f172a;">${escapeHtml(pkg.name)}</div>
        <div class="package-desc" style="font-size: 0.72rem; color: var(--gray-500); margin: 6px 0;">${escapeHtml(pkg.description || '')}</div>
        <div class="package-price" style="font-size: 0.85rem; font-weight: 800; color: #0284c7;">${fmtTotal}</div>
      `;
      card.addEventListener('click', () => {
        (pkg.items || []).forEach(it => addItemToDraft(it.description, it.quantity, it.unit_price));
      });
      packagesList.appendChild(card);
    });
  }

  function renderFavorites() {
    favoritesChips.innerHTML = '';
    catalog.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-btn';
      const fmtPrice = Number(item.unit_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      btn.innerHTML = `<span style="font-weight: bold; color: var(--gray-400);">+</span> <span style="font-weight: 600;">${escapeHtml(item.name)}</span> <span style="color: var(--gray-500); font-size: 0.75rem;">(${fmtPrice})</span>`;
      btn.addEventListener('click', () => addItemToDraft(item.name, 1, item.unit_price));
      favoritesChips.appendChild(btn);
    });
  }

  function addItemToDraft(description, quantity = 1, unitPrice = 0) {
    const existing = draftItems.find(it => it.description.toLowerCase() === description.toLowerCase());
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      draftItems.push({
        id: 'it_' + Math.random().toString(36).substring(2, 8),
        description,
        quantity: Number(quantity),
        unit_price: Number(unitPrice)
      });
    }
    updateItemsView();
  }

  btnAddManualItem.addEventListener('click', () => addItemToDraft('Novo Serviço / Peça', 1, 100.00));

  btnCloneLast.addEventListener('click', () => {
    if (allBudgets.length > 0 && allBudgets[0].items) {
      draftItems = allBudgets[0].items.map(i => ({ ...i }));
      if (allBudgets[0].client_id) clientSelect.value = allBudgets[0].client_id;
      updateItemsView();
    } else {
      alert('Nenhum orçamento anterior para clonar.');
    }
  });

  function updateItemsView() {
    itemsCountBadge.textContent = draftItems.length;

    if (draftItems.length === 0) {
      draftItemsList.innerHTML = '';
      draftItemsList.appendChild(emptyPlaceholder);
      emptyPlaceholder.classList.remove('hidden');
      draftTotalDisplay.textContent = 'R$ 0,00';
      return;
    }

    emptyPlaceholder.classList.add('hidden');
    draftItemsList.innerHTML = '';
    let total = 0;

    draftItems.forEach((item, index) => {
      const subtotal = item.quantity * item.unit_price;
      total += subtotal;

      const row = document.createElement('div');
      row.className = 'draft-item-row';
      row.innerHTML = `
        <div class="draft-item-top">
          <input type="text" class="draft-item-input-desc" value="${escapeHtml(item.description)}">
          <button type="button" class="btn-remove-item">🗑️</button>
        </div>
        <div class="draft-item-bottom">
          <div class="qty-control">
            <button type="button" class="btn-qty btn-minus">−</button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1">
            <button type="button" class="btn-qty btn-plus">+</button>
          </div>
          <div class="price-input-wrapper">
            <span>R$</span>
            <input type="number" class="price-input" value="${item.unit_price.toFixed(2)}" step="1">
          </div>
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--gray-800);">
            ${Number(subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>
      `;

      row.querySelector('.draft-item-input-desc').addEventListener('change', e => { item.description = e.target.value; });
      row.querySelector('.btn-minus').addEventListener('click', () => { if (item.quantity > 1) { item.quantity--; updateItemsView(); } });
      row.querySelector('.btn-plus').addEventListener('click', () => { item.quantity++; updateItemsView(); });
      row.querySelector('.qty-input').addEventListener('change', e => { item.quantity = Math.max(1, parseFloat(e.target.value) || 1); updateItemsView(); });
      row.querySelector('.price-input').addEventListener('change', e => { item.unit_price = Math.max(0, parseFloat(e.target.value) || 0); updateItemsView(); });
      row.querySelector('.btn-remove-item').addEventListener('click', () => { draftItems.splice(index, 1); updateItemsView(); });

      draftItemsList.appendChild(row);
    });

    draftTotalDisplay.textContent = Number(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  async function handleSaveBudget(openWa = false) {
    const clientId = clientSelect.value;
    if (!clientId) { alert('Selecione ou cadastre um cliente'); return; }
    if (draftItems.length === 0) { alert('Adicione pelo menos 1 item ao orçamento'); return; }

    const selClient = clients.find(c => c.id === clientId);
    const validityDays = parseInt(document.getElementById('budget-validity').value || '7', 10);
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + validityDays);

    const payload = {
      client_id: clientId,
      client_name: selClient ? selClient.name : 'Cliente',
      client_phone: selClient ? selClient.phone : '',
      items: draftItems,
      notes: document.getElementById('budget-notes-input').value.trim(),
      valid_until: validUntilDate.toISOString().split('T')[0]
    };

    const created = await store.createBudget(payload);
    draftItems = [];
    updateItemsView();

    if (openWa) {
      const waLink = window.generateWhatsAppLink(created.client_phone, created.budget_number, created.total_amount, created.valid_until, created.link_token);
      window.open(waLink, '_blank');
    }

    // Alternar para o painel com o orçamento já na lista
    activeBudgetForClient = created;
    switchTab('pane-painel');
  }

  btnSaveDraft.addEventListener('click', () => handleSaveBudget(false));
  btnSaveAndSendWa.addEventListener('click', () => handleSaveBudget(true));

  // ============================================================
  // SEÇÃO 3: CONTRATO DE PRESTAÇÃO DE SERVIÇOS
  // ============================================================
  const btnOpenSignModal = document.getElementById('btn-open-sign-modal');
  const btnShareContractWa = document.getElementById('btn-share-contract-wa');

  async function loadContract() {
    currentContract = await store.getContractById('ctr-demo-01');
    if (!currentContract) return;

    document.getElementById('contract-number-badge').textContent = currentContract.contract_number;
    document.getElementById('c-provider-name').textContent = currentContract.provider_name;
    document.getElementById('c-provider-cnpj').textContent = currentContract.provider_cnpj;
    document.getElementById('c-provider-phone').textContent = currentContract.provider_phone;
    document.getElementById('c-client-name').textContent = currentContract.client_name;
    document.getElementById('c-client-doc').textContent = currentContract.client_doc;
    document.getElementById('c-client-phone').textContent = currentContract.client_phone;
    document.getElementById('c-service-desc').textContent = currentContract.service_description;
    document.getElementById('c-total-amount').textContent = Number(currentContract.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('c-payment-terms').textContent = currentContract.payment_terms;

    const pBox = document.getElementById('contract-pending-box');
    const sBox = document.getElementById('contract-signed-box');

    if (currentContract.status === 'assinado' && currentContract.signature_data) {
      pBox.classList.add('hidden');
      sBox.classList.remove('hidden');
      document.getElementById('cert-signature-img').src = currentContract.signature_data;
      document.getElementById('cert-signer-name').textContent = currentContract.client_name;
      document.getElementById('cert-timestamp').textContent = new Date(currentContract.signed_at).toLocaleString('pt-BR');
      document.getElementById('cert-hash').textContent = currentContract.signature_hash || 'DOC-VERIFIED';
    } else {
      pBox.classList.remove('hidden');
      sBox.classList.add('hidden');
    }
  }

  btnOpenSignModal.addEventListener('click', () => {
    openSignaturePad('contract', 'Assinatura Eletrônica do Contrato');
  });

  if (btnShareContractWa) {
    btnShareContractWa.addEventListener('click', () => {
      const waLink = window.generateContractWhatsAppLink(
        currentContract.client_phone,
        currentContract.contract_number,
        currentContract.client_name,
        currentContract.id
      );
      window.open(waLink, '_blank');
    });
  }

  // ============================================================
  // SEÇÃO 4: VISÃO DO CLIENTE (APROVAÇÃO DO ORÇAMENTO)
  // ============================================================
  const cliBtnApprove = document.getElementById('cli-btn-approve');

  function renderClientView() {
    const b = activeBudgetForClient || allBudgets[0];
    if (!b) return;

    activeBudgetForClient = b;
    document.getElementById('cli-budget-number').textContent = '#' + String(b.budget_number).padStart(3, '0');
    document.getElementById('cli-budget-date').textContent = new Date(b.created_at || Date.now()).toLocaleDateString('pt-BR');
    document.getElementById('cli-budget-valid').textContent = b.valid_until ? new Date(b.valid_until).toLocaleDateString('pt-BR') : '7 dias';
    document.getElementById('cli-client-name').textContent = b.client_name || 'Cliente';
    document.getElementById('cli-client-phone').textContent = b.client_phone ? `Contato: ${b.client_phone}` : '';
    document.getElementById('cli-total-amount').textContent = Number(b.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Status Badge Corporativo
    const badge = document.getElementById('cli-status-badge');
    const isApproved = b.status === 'aprovado';
    badge.innerHTML = `<span class="status-dot ${b.status}"></span>${isApproved ? 'Proposta Aprovada' : 'Proposta Pendente'}`;

    // Lista de Itens
    const itemsList = document.getElementById('cli-items-list');
    itemsList.innerHTML = '';
    (b.items || []).forEach(it => {
      const el = document.createElement('div');
      el.className = 'item-card';
      el.innerHTML = `
        <div class="item-description">${escapeHtml(it.description)}</div>
        <div class="item-details">
          <span>${it.quantity}x ${Number(it.unit_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          <span class="item-subtotal">${Number(it.quantity * it.unit_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
      `;
      itemsList.appendChild(el);
    });

    const actionArea = document.getElementById('cli-action-area');
    const sigView = document.getElementById('cli-signature-view');

    if (b.status === 'aprovado' && b.signature_data) {
      actionArea.classList.add('hidden');
      sigView.classList.remove('hidden');
      document.getElementById('cli-signature-img').src = b.signature_data;
      document.getElementById('cli-approved-text').textContent = `Aprovado com assinatura digital em ${new Date(b.approved_at || Date.now()).toLocaleString('pt-BR')}`;
    } else {
      actionArea.classList.remove('hidden');
      sigView.classList.add('hidden');
    }
  }

  cliBtnApprove.addEventListener('click', () => {
    openSignaturePad('budget', '✍️ Assinar e Aprovar Orçamento');
  });

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // ============================================================
  // INICIALIZAÇÃO GERAL
  // ============================================================
  await Promise.all([
    renderPainel(),
    loadNovoOrcamentoData(),
    loadContract()
  ]);

  // Se a URL tiver ?tab=..., abre direto nela
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get('tab');
  if (requestedTab && document.getElementById(requestedTab)) {
    switchTab(requestedTab);
  }
});
