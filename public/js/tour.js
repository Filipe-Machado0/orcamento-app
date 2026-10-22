/* ============================================================
   TOUR GUIADO / MANUAL DE UTILIZAÇÃO INTERATIVO
   Motor Mobile-First com Destaque de Elementos e Navegação por Abas
   ============================================================ */

(() => {
  const STORAGE_KEY = 'orcamento_tour_completed_v2';

  const TOUR_STEPS = [
    {
      targetSelector: '.app-nav-bar',
      tab: 'pane-painel',
      badge: 'Passo 1 de 5',
      title: 'Navegação Rápida em Abas',
      text: 'Acesse em 1 toque as 4 áreas do sistema: o Painel de controle, a criação de Novo Orçamento, os Contratos jurídicos e a tela de visualização do Cliente.'
    },
    {
      targetSelector: '.kpi-grid',
      tab: 'pane-painel',
      badge: 'Passo 2 de 5',
      title: 'Métricas & Painel Financeiro',
      text: 'Acompanhe em tempo real a quantidade e os valores acumulados em propostas Pendentes, Aprovadas, Em Execução e Concluídas.'
    },
    {
      targetSelector: '.filter-tabs',
      tab: 'pane-painel',
      badge: 'Passo 3 de 5',
      title: 'Filtros Rápidos por Status',
      text: 'Organize e localize qualquer ordem de serviço ou orçamento em segundos, filtrando de acordo com a situação comercial.'
    },
    {
      targetSelector: '#pane-novo-orcamento .card:first-child',
      fallbackSelector: '#pane-novo-orcamento',
      tab: 'pane-novo-orcamento',
      badge: 'Passo 4 de 5',
      title: 'Criação Rápida de Orçamento',
      text: 'Cadastre novos clientes na hora ou escolha um existente. Depois, adicione itens, mão de obra, descontos e prazos de validade com total praticidade.'
    },
    {
      targetSelector: '#pane-contrato .contract-doc',
      fallbackSelector: '#pane-contrato',
      tab: 'pane-contrato',
      badge: 'Passo 5 de 5',
      title: 'Contrato & Assinatura Digital',
      text: 'Gere contratos formais com validade jurídica e colha a assinatura do cliente diretamente na tela do celular ou envie o link via WhatsApp!'
    }
  ];

  let currentStepIndex = 0;
  let isTourRunning = false;
  let backdropEl = null;
  let spotlightEl = null;
  let cardEl = null;

  // Criação dos elementos visuais no DOM
  function createTourElements() {
    if (backdropEl) return;

    // Fundo
    backdropEl = document.createElement('div');
    backdropEl.className = 'tour-backdrop';
    document.body.appendChild(backdropEl);

    // Holofote
    spotlightEl = document.createElement('div');
    spotlightEl.className = 'tour-spotlight';
    document.body.appendChild(spotlightEl);

    // Cartão do Passo
    cardEl = document.createElement('div');
    cardEl.className = 'tour-card';
    cardEl.innerHTML = `
      <div class="tour-card-header">
        <span class="tour-badge" id="tour-badge-text">Passo 1 de 6</span>
        <button type="button" class="tour-close-btn" id="tour-btn-close" title="Fechar manual">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <h3 class="tour-title" id="tour-title-text"></h3>
      <p class="tour-description" id="tour-desc-text"></p>
      
      <div class="tour-dots-wrapper" id="tour-dots"></div>

      <div class="tour-card-actions">
        <button type="button" class="tour-btn-skip" id="tour-btn-skip">Pular Tour</button>
        <div class="tour-card-actions-right">
          <button type="button" class="tour-btn-prev" id="tour-btn-prev">Anterior</button>
          <button type="button" class="tour-btn-next" id="tour-btn-next">Próximo</button>
        </div>
      </div>
    `;
    document.body.appendChild(cardEl);

    // Event Listeners dos Controles
    document.getElementById('tour-btn-close').addEventListener('click', () => endTour(false));
    document.getElementById('tour-btn-skip').addEventListener('click', () => endTour(true));
    document.getElementById('tour-btn-prev').addEventListener('click', () => prevStep());
    document.getElementById('tour-btn-next').addEventListener('click', () => nextStep());
    backdropEl.addEventListener('click', (e) => {
      // Clique fora fecha o tour suavemente
      if (e.target === backdropEl) {
        endTour(true);
      }
    });

    // Redimensionamento de Tela
    window.addEventListener('resize', () => {
      if (isTourRunning) {
        positionStep(TOUR_STEPS[currentStepIndex]);
      }
    });
  }

  // Alterna a aba do sistema se necessário
  function ensureTab(tabId) {
    const activePane = document.querySelector('.tab-content-pane.active');
    if (activePane && activePane.id === tabId) return;

    // Dispara clique no botão da aba correspondente
    const tabBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabId}"]`);
    if (tabBtn) {
      tabBtn.click();
    }
  }

  // Posiciona o holofote e o cartão com base no elemento alvo
  function positionStep(step) {
    // Remove classe de destaque do elemento anterior
    document.querySelectorAll('.tour-highlighted-target').forEach(el => el.classList.remove('tour-highlighted-target'));

    let target = document.querySelector(step.targetSelector);
    if (!target && step.fallbackSelector) {
      target = document.querySelector(step.fallbackSelector);
    }

    if (!target) {
      // Alvo oculto ou ausente: exibe no centro
      spotlightEl.classList.remove('active');
      cardEl.style.top = '50%';
      cardEl.style.bottom = 'auto';
      cardEl.style.left = '50%';
      cardEl.style.transform = 'translate(-50%, -50%)';
      return;
    }

    // Eleva o elemento para ficar 100% nítido, sem nenhum filtro ou borrado
    target.classList.add('tour-highlighted-target');

    // Rolagem suave até o elemento
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Aguarda o scroll estabilizar
    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const padding = 6;

      // Atualiza o holofote
      spotlightEl.style.top = `${Math.max(4, rect.top - padding)}px`;
      spotlightEl.style.left = `${Math.max(4, rect.left - padding)}px`;
      spotlightEl.style.width = `${Math.min(window.innerWidth - 8, rect.width + padding * 2)}px`;
      spotlightEl.style.height = `${rect.height + padding * 2}px`;
      spotlightEl.classList.add('active');

      // Posicionamento inteligente Mobile-First do cartão
      const windowHeight = window.innerHeight;
      const targetMidY = rect.top + rect.height / 2;

      cardEl.style.left = '50%';

      if (targetMidY < windowHeight * 0.45) {
        // Elemento está na metade superior -> posiciona cartão na parte inferior
        cardEl.style.top = 'auto';
        cardEl.style.bottom = 'max(16px, var(--safe-bottom, 16px))';
        cardEl.style.transform = 'translateX(-50%)';
      } else {
        // Elemento está na metade inferior -> posiciona cartão na parte superior
        cardEl.style.bottom = 'auto';
        cardEl.style.top = 'max(64px, calc(var(--safe-top, 0px) + 64px))';
        cardEl.style.transform = 'translateX(-50%)';
      }
    }, 180);
  }

  // Renderiza o conteúdo do passo atual
  function renderStep(index) {
    if (index < 0 || index >= TOUR_STEPS.length) return;
    currentStepIndex = index;
    const step = TOUR_STEPS[index];

    // Troca de aba se necessário
    if (step.tab) {
      ensureTab(step.tab);
    }

    // Textos
    document.getElementById('tour-badge-text').innerText = step.badge;
    document.getElementById('tour-title-text').innerText = step.title;
    document.getElementById('tour-desc-text').innerText = step.text;

    // Atualização dos Pontos de Progresso
    const dotsContainer = document.getElementById('tour-dots');
    dotsContainer.innerHTML = '';
    TOUR_STEPS.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `tour-dot ${i === index ? 'active' : (i < index ? 'completed' : '')}`;
      dotsContainer.appendChild(dot);
    });

    // Botões
    const btnPrev = document.getElementById('tour-btn-prev');
    const btnNext = document.getElementById('tour-btn-next');

    btnPrev.style.display = index === 0 ? 'none' : 'inline-flex';
    
    if (index === TOUR_STEPS.length - 1) {
      btnNext.innerHTML = `
        <span>Concluir</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    } else {
      btnNext.innerHTML = `
        <span>Próximo</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;
    }

    // Reposiciona o holofote e cartão
    positionStep(step);
  }

  function nextStep() {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      renderStep(currentStepIndex + 1);
    } else {
      endTour(true);
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      renderStep(currentStepIndex - 1);
    }
  }

  function startTour(force = false) {
    createTourElements();
    isTourRunning = true;

    backdropEl.classList.add('active');
    cardEl.classList.add('active');

    renderStep(0);
  }

  function endTour(isCompleted = true) {
    if (!isTourRunning) return;
    isTourRunning = false;

    // Remove qualquer destaque de nitidez
    document.querySelectorAll('.tour-highlighted-target').forEach(el => el.classList.remove('tour-highlighted-target'));

    if (backdropEl) backdropEl.classList.remove('active');
    if (spotlightEl) spotlightEl.classList.remove('active');
    if (cardEl) cardEl.classList.remove('active');

    // Salva preferência no navegador
    if (isCompleted) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }

    // Retorna para a aba principal (Painel)
    ensureTab('pane-painel');

    // Notificação Toast
    if (window.showAppToast) {
      window.showAppToast('Manual concluído! Toque em <strong>Tour</strong> a qualquer momento para rever.', 3000);
    }
  }

  // Inicialização no DOM
  document.addEventListener('DOMContentLoaded', () => {
    // Liga o botão de Ajuda/Tour no cabeçalho
    const btnHeaderTour = document.getElementById('btn-start-tour');
    if (btnHeaderTour) {
      btnHeaderTour.addEventListener('click', () => {
        startTour(true);
      });
    }

    // Inicia automaticamente apenas na primeira visita após breve delay para carregamento da interface
    const hasSeenTour = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenTour) {
      setTimeout(() => {
        startTour(false);
      }, 700);
    }
  });

  // Exporta para escopo global para acionamento externo
  window.startAppTour = startTour;
})();
