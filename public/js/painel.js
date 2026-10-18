/* ============================================================
   SISTEMA DE ORÇAMENTOS E OS
   Lógica do Painel do Prestador (Dashboard)
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.AppStore;

  // Estado da tela
  let allBudgets = [];
  let currentFilter = 'todos';

  // Logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => store.logout());
  }

  // Abas de filtro
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      renderBudgets();
    });
  });

  // Carregar dados iniciais
  async function loadData() {
    try {
      allBudgets = await store.getBudgets();
      updateKPIs();
      renderBudgets();
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      document.getElementById('budgets-feed').innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--danger-500);">
          ❌ Erro ao carregar orçamentos. Atualize a página.
        </div>
      `;
    }
  }

  // Atualizar estatísticas e KPIs
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

    const fmt = val => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // KPIs topo
    document.getElementById('kpi-pending-count').textContent = stats.pendente.count;
    document.getElementById('kpi-pending-total').textContent = fmt(stats.pendente.total);

    document.getElementById('kpi-approved-count').textContent = stats.aprovado.count;
    document.getElementById('kpi-approved-total').textContent = fmt(stats.aprovado.total);

    document.getElementById('kpi-progress-count').textContent = stats.em_andamento.count;
    document.getElementById('kpi-progress-total').textContent = fmt(stats.em_andamento.total);

    document.getElementById('kpi-done-count').textContent = stats.concluido.count;
    document.getElementById('kpi-done-total').textContent = fmt(stats.concluido.total);

    // Contadores das abas
    document.getElementById('count-todos').textContent = allBudgets.length;
    document.getElementById('count-pendente').textContent = stats.pendente.count;
    document.getElementById('count-aprovado').textContent = stats.aprovado.count;
    document.getElementById('count-em_andamento').textContent = stats.em_andamento.count;
    document.getElementById('count-concluido').textContent = stats.concluido.count;
  }

  // Renderizar cartões de orçamento
  function renderBudgets() {
    const container = document.getElementById('budgets-feed');
    container.innerHTML = '';

    const filtered = allBudgets.filter(b => {
      if (currentFilter === 'todos') return true;
      return b.status === currentFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="background: white; border-radius: var(--radius-lg); border: 1px dashed var(--gray-300); padding: 48px 24px; text-align: center; color: var(--gray-500);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📭</div>
          <p style="font-weight: 600;">Nenhum orçamento encontrado com este status.</p>
          <a href="novo-orcamento.html" class="btn-primary" style="display: inline-block; margin-top: 16px; text-decoration: none; padding: 8px 16px; border-radius: 9999px;">
            + Criar Orçamento Agora
          </a>
        </div>
      `;
      return;
    }

    filtered.forEach(budget => {
      const card = document.createElement('div');
      card.className = 'budget-feed-card';

      const itemsText = (budget.items || [])
        .map(i => `${i.quantity}x ${i.description}`)
        .join(' · ') || 'Sem itens cadastrados';

      const fmtTotal = Number(budget.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const numFmt = '#' + String(budget.budget_number || 0).padStart(3, '0');
      const waLink = window.generateWhatsAppLink(
        budget.client_phone,
        budget.budget_number,
        budget.total_amount,
        budget.valid_until,
        budget.link_token
      );
      const viewLink = `index.html?token=${budget.link_token}`;

      card.innerHTML = `
        <div class="budget-feed-header">
          <div>
            <span class="budget-num-title">${numFmt}</span>
            <span style="font-size: 0.75rem; color: var(--gray-400); margin-left: 8px;">
              ${new Date(budget.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <span class="status-badge status-badge--${budget.status}" style="font-size: 0.72rem; padding: 2px 10px;">
            ${getStatusLabel(budget.status)}
          </span>
        </div>

        <div class="budget-client-name">
          👤 ${escapeHtml(budget.client_name || 'Cliente')} 
          ${budget.client_phone ? `<span style="font-weight: normal; color: var(--gray-500); font-size: 0.8rem;">(${budget.client_phone})</span>` : ''}
        </div>

        <div class="budget-items-summary">
          🔧 ${escapeHtml(itemsText)}
        </div>

        <div class="budget-feed-footer">
          <div>
            <div style="font-size: 0.7rem; color: var(--gray-400); text-transform: uppercase; font-weight: 600;">Total</div>
            <div class="budget-feed-total">${fmtTotal}</div>
          </div>

          <div class="budget-feed-actions">
            <!-- Mudar Status Rápido -->
            <select class="select-status-quick" data-id="${budget.id}">
              <option value="pendente" ${budget.status === 'pendente' ? 'selected' : ''}>⏳ Pendente</option>
              <option value="aprovado" ${budget.status === 'aprovado' ? 'selected' : ''}>✅ Aprovado</option>
              <option value="em_andamento" ${budget.status === 'em_andamento' ? 'selected' : ''}>🔧 Em Andamento</option>
              <option value="concluido" ${budget.status === 'concluido' ? 'selected' : ''}>🏁 Concluído</option>
              <option value="cancelado" ${budget.status === 'cancelado' ? 'selected' : ''}>❌ Cancelado</option>
            </select>

            <!-- Ações -->
            <a href="${waLink}" target="_blank" class="btn-feed-action btn-whatsapp-action" title="Mandar link de aprovação no WhatsApp">
              <span>📱</span> WhatsApp
            </a>
            <a href="${viewLink}" target="_blank" class="btn-feed-action btn-view-action" title="Abrir página do cliente">
              <span>👁️</span> Ver
            </a>
          </div>
        </div>
      `;

      // Evento de alteração de status
      const selectStatus = card.querySelector('.select-status-quick');
      selectStatus.addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        selectStatus.disabled = true;
        try {
          await store.updateBudgetStatus(budget.id, newStatus);
          budget.status = newStatus;
          updateKPIs();
          renderBudgets();
        } catch (err) {
          alert('Erro ao atualizar status.');
          selectStatus.disabled = false;
        }
      });

      container.appendChild(card);
    });
  }

  function getStatusLabel(status) {
    const labels = {
      'pendente': 'Pendente',
      'aprovado': 'Aprovado',
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Iniciar
  await loadData();
});
