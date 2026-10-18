/* ============================================================
   SISTEMA DE ORÇAMENTOS E OS
   Lógica do Orçamento Relâmpago ⚡
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.AppStore;

  // Estado do Orçamento em Rascunho
  let clients = [];
  let packages = [];
  let catalog = [];
  let draftItems = [];

  // Elementos DOM
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

  // Inicializar dados
  async function init() {
    try {
      [clients, packages, catalog] = await Promise.all([
        store.getClients(),
        store.getPackages(),
        store.getCatalog()
      ]);

      populateClientsSelect();
      renderPackages();
      renderFavorites();
      updateItemsView();
    } catch (err) {
      console.error('Erro na inicialização:', err);
    }
  }

  // Preencher Select de Clientes
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

  // Alternar formulário inline de novo cliente
  btnToggleNewClient.addEventListener('click', () => {
    newClientForm.classList.toggle('hidden');
    selectClientWrapper.classList.toggle('hidden');
  });

  btnCancelInlineClient.addEventListener('click', () => {
    newClientForm.classList.add('hidden');
    selectClientWrapper.classList.remove('hidden');
  });

  // Salvar novo cliente inline
  btnSaveInlineClient.addEventListener('click', async () => {
    const name = document.getElementById('new-client-name').value.trim();
    const phone = document.getElementById('new-client-phone').value.trim();

    if (!name) {
      alert('Por favor informe o nome do cliente.');
      return;
    }

    try {
      const newClient = await store.addClient({ name, phone });
      clients.unshift(newClient);
      populateClientsSelect(newClient.id);
      newClientForm.classList.add('hidden');
      selectClientWrapper.classList.remove('hidden');
      document.getElementById('new-client-name').value = '';
      document.getElementById('new-client-phone').value = '';
    } catch (err) {
      alert('Erro ao salvar cliente.');
    }
  });

  // Renderizar Pacotes Relâmpago (1 Toque)
  function renderPackages() {
    packagesList.innerHTML = '';
    packages.forEach(pkg => {
      const card = document.createElement('div');
      card.className = 'package-card';
      
      const totalPkg = (pkg.items || []).reduce((acc, i) => acc + (i.quantity * i.unit_price), 0);
      const fmtTotal = Number(totalPkg).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      card.innerHTML = `
        <span class="package-add-badge">+ Adicionar</span>
        <div class="package-icon">${pkg.icon || '⚡'}</div>
        <div class="package-name">${escapeHtml(pkg.name)}</div>
        <div class="package-desc">${escapeHtml(pkg.description || '')}</div>
        <div class="package-price">${fmtTotal}</div>
      `;

      card.addEventListener('click', () => {
        addPackageToDraft(pkg);
      });

      packagesList.appendChild(card);
    });
  }

  // Adicionar todos os itens de um pacote
  function addPackageToDraft(pkg) {
    (pkg.items || []).forEach(it => {
      addItemToDraft(it.description, it.quantity, it.unit_price);
    });
    flashNotice(`⚡ Pacote "${pkg.name}" adicionado!`);
  }

  // Renderizar Favoritos / Catálogo
  function renderFavorites() {
    favoritesChips.innerHTML = '';
    catalog.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-btn';
      const fmtPrice = Number(item.unit_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      btn.innerHTML = `<span>+</span> <span>${escapeHtml(item.name)}</span> <span style="color: var(--gray-400); font-weight: normal;">${fmtPrice}</span>`;

      btn.addEventListener('click', () => {
        addItemToDraft(item.name, 1, item.unit_price);
      });

      favoritesChips.appendChild(btn);
    });
  }

  // Adicionar item ao rascunho (se já existir com mesma descrição e preço, apenas soma quantidade)
  function addItemToDraft(description, quantity = 1, unitPrice = 0) {
    const existing = draftItems.find(it => it.description.toLowerCase() === description.toLowerCase());
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      draftItems.push({
        id: 'it_' + Math.random().toString(36).substring(2, 9),
        description,
        quantity: Number(quantity),
        unit_price: Number(unitPrice)
      });
    }
    updateItemsView();
  }

  // Adicionar Item Manual
  btnAddManualItem.addEventListener('click', () => {
    addItemToDraft('Novo Serviço / Peça', 1, 100.00);
  });

  // Clonar Último Orçamento
  btnCloneLast.addEventListener('click', async () => {
    try {
      const allBudgets = await store.getBudgets();
      if (!allBudgets || allBudgets.length === 0) {
        alert('Nenhum orçamento anterior encontrado para clonar.');
        return;
      }
      const last = allBudgets[0];
      if (last.items && last.items.length > 0) {
        draftItems = last.items.map(it => ({
          id: 'it_' + Math.random().toString(36).substring(2, 9),
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price
        }));
        // Se houver cliente correspondente, pré-seleciona
        if (last.client_id) {
          clientSelect.value = last.client_id;
        }
        updateItemsView();
        flashNotice(`📋 Itens do orçamento #${String(last.budget_number).padStart(3, '0')} clonados com sucesso!`);
      } else {
        alert('O último orçamento não continha itens.');
      }
    } catch (err) {
      alert('Erro ao clonar orçamento.');
    }
  });

  // Atualizar visualização dos itens em rascunho
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
          <button type="button" class="btn-remove-item" title="Remover item">🗑️</button>
        </div>
        <div class="draft-item-bottom">
          <div class="qty-control">
            <button type="button" class="btn-qty btn-minus">−</button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1" step="1">
            <button type="button" class="btn-qty btn-plus">+</button>
          </div>
          <div class="price-input-wrapper">
            <span>R$</span>
            <input type="number" class="price-input" value="${item.unit_price.toFixed(2)}" step="0.50" min="0">
          </div>
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--gray-800); min-width: 70px; text-align: right;">
            ${Number(subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>
      `;

      // Eventos de edição da linha
      const descInput = row.querySelector('.draft-item-input-desc');
      descInput.addEventListener('change', (e) => {
        item.description = e.target.value;
      });

      const qtyInput = row.querySelector('.qty-input');
      row.querySelector('.btn-minus').addEventListener('click', () => {
        if (item.quantity > 1) {
          item.quantity--;
          updateItemsView();
        }
      });
      row.querySelector('.btn-plus').addEventListener('click', () => {
        item.quantity++;
        updateItemsView();
      });
      qtyInput.addEventListener('change', (e) => {
        const val = Math.max(1, parseFloat(e.target.value) || 1);
        item.quantity = val;
        updateItemsView();
      });

      const priceInput = row.querySelector('.price-input');
      priceInput.addEventListener('change', (e) => {
        const val = Math.max(0, parseFloat(e.target.value) || 0);
        item.unit_price = val;
        updateItemsView();
      });

      row.querySelector('.btn-remove-item').addEventListener('click', () => {
        draftItems.splice(index, 1);
        updateItemsView();
      });

      draftItemsList.appendChild(row);
    });

    draftTotalDisplay.textContent = Number(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Coleta dados e valida
  function getPayload() {
    const clientId = clientSelect.value;
    if (!clientId) {
      alert('Por favor selecione ou cadastre um cliente.');
      clientSelect.focus();
      return null;
    }

    if (draftItems.length === 0) {
      alert('Adicione pelo menos um item ou serviço ao orçamento.');
      return null;
    }

    const selectedClient = clients.find(c => c.id === clientId);
    const validityDays = parseInt(document.getElementById('budget-validity').value || '7', 10);
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + validityDays);

    return {
      client_id: clientId,
      client_name: selectedClient ? selectedClient.name : 'Cliente',
      client_phone: selectedClient ? selectedClient.phone : '',
      items: draftItems,
      notes: document.getElementById('budget-notes-input').value.trim(),
      valid_until: validUntilDate.toISOString().split('T')[0]
    };
  }

  // Salvar Orçamento
  async function saveBudget(openWhatsApp = false) {
    const payload = getPayload();
    if (!payload) return;

    const btn = openWhatsApp ? btnSaveAndSendWa : btnSaveDraft;
    const oldText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Salvando...';

    try {
      const created = await store.createBudget(payload);

      if (openWhatsApp) {
        const waLink = window.generateWhatsAppLink(
          created.client_phone,
          created.budget_number,
          created.total_amount,
          created.valid_until,
          created.link_token
        );
        // Abrir WhatsApp em nova aba
        window.open(waLink, '_blank');
      }

      // Redirecionar para o painel
      window.location.href = 'painel.html';

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar orçamento. Tente novamente.');
      btn.disabled = false;
      btn.innerHTML = oldText;
    }
  }

  btnSaveDraft.addEventListener('click', () => saveBudget(false));
  btnSaveAndSendWa.addEventListener('click', () => saveBudget(true));

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function flashNotice(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--gray-900);
      color: white;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: fadeIn 0.2s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  await init();
});
