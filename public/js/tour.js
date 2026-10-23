/* ============================================================
   TOUR GUIADO / MANUAL DE APRESENTAÇÃO E CONVERSÃO INTERATIVO
   Motor Mobile-First com Backdrop Blur, Textos Curtos e Dinâmicos
   ============================================================ */

(() => {
  const STORAGE_KEY = 'orcamento_tour_completed_v4';

  const TOUR_STEPS = [
    {
      type: 'intro',
      badge: 'Tour Rápido • 1 Minuto',
      title: 'Mais aprovações no seu WhatsApp',
      text: 'Passe mais credibilidade e feche orçamentos de celular em poucos toques.',
      bullets: [
        'Propostas com peças e valores em 1 minuto',
        'Link oficial de aprovação para o cliente',
        'Termo de garantia com assinatura na tela'
      ],
      primaryCtaText: 'Ver Demonstração (1 min)',
      secondaryCtaText: 'Pular e Explorar Direto'
    },
    {
      type: 'step',
      targetSelector: '.app-nav-bar',
      tab: 'pane-painel',
      badge: 'Passo 1 de 5',
      title: 'Gestão Comercial em 1 Toque',
      text: 'Navegue com facilidade entre o Painel, Novo Orçamento, Contrato e a Visão do Cliente.'
    },
    {
      type: 'step',
      targetSelector: '.kpi-grid',
      tab: 'pane-painel',
      badge: 'Passo 2 de 5',
      title: 'Faturamento em Tempo Real',
      text: 'Acompanhe valores e ordens em bancada: pendentes, aprovadas e concluídas.'
    },
    {
      type: 'step',
      targetSelector: '#pane-novo-orcamento .card:first-child',
      fallbackSelector: '#pane-novo-orcamento',
      tab: 'pane-novo-orcamento',
      badge: 'Passo 3 de 5',
      title: 'Orçamento Rápido de Bancada',
      text: 'Selecione o aparelho e insira peças (tela, bateria, conector) em poucos cliques.'
    },
    {
      type: 'step',
      targetSelector: '.mobile-action-bar',
      fallbackSelector: '#pane-novo-orcamento',
      tab: 'pane-novo-orcamento',
      badge: 'Passo 4 de 5',
      title: 'Envio Oficial no WhatsApp',
      text: 'Gere a mensagem formatada com link seguro para o cliente conferir e aprovar na hora.'
    },
    {
      type: 'step',
      targetSelector: '#pane-contrato .contract-doc',
      fallbackSelector: '#pane-contrato',
      tab: 'pane-contrato',
      badge: 'Passo 5 de 5',
      title: 'Garantia e Assinatura na Tela',
      text: 'Colha a assinatura eletrônica do cliente direto na tela do smartphone, sem papelada.'
    },
    {
      type: 'outro',
      badge: 'Ativação Oficial',
      title: 'Gostou da Demonstração?',
      text: 'Coloque a sua marca e comece a fechar serviços com orçamentos profissionais.',
      bullets: [
        'Sua logomarca no sistema e contratos',
        'Modelos prontos para celulares',
        'Acesso imediato sem instalação'
      ],
      primaryCtaText: 'Ativar para Minha Assistência',
      secondaryCtaText: 'Continuar no Painel'
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
        <span class="tour-badge" id="tour-badge-text">Passo 1 de 5</span>
        <button type="button" class="tour-close-btn" id="tour-btn-close" title="Fechar manual">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <h3 class="tour-title" id="tour-title-text"></h3>
      <p class="tour-description" id="tour-desc-text"></p>
      
      <div class="tour-bullets-box" id="tour-bullets-box" style="display: none;"></div>

      <div class="tour-dots-wrapper" id="tour-dots"></div>

      <!-- Ações padrão (Anterior, Próximo, Pular) -->
      <div class="tour-card-actions" id="tour-standard-actions">
        <button type="button" class="tour-btn-skip" id="tour-btn-skip">Pular Tour</button>
        <div class="tour-card-actions-right">
          <button type="button" class="tour-btn-prev" id="tour-btn-prev">Anterior</button>
          <button type="button" class="tour-btn-next" id="tour-btn-next">Próximo</button>
        </div>
      </div>

      <!-- Ações especiais (Intro & Outro de Conversão) -->
      <div class="tour-card-cta-actions" id="tour-custom-actions" style="display: none;">
        <button type="button" class="tour-cta-btn-primary" id="tour-btn-cta-primary">
          <span>Ação Primária</span>
        </button>
        <button type="button" class="tour-cta-btn-secondary" id="tour-btn-cta-secondary">
          <span>Ação Secundária</span>
        </button>
      </div>
    `;
    document.body.appendChild(cardEl);

    // Event Listeners dos Controles
    document.getElementById('tour-btn-close').addEventListener('click', () => endTour(false));
    document.getElementById('tour-btn-skip').addEventListener('click', () => endTour(true));
    document.getElementById('tour-btn-prev').addEventListener('click', () => prevStep());
    document.getElementById('tour-btn-next').addEventListener('click', () => nextStep());

    document.getElementById('tour-btn-cta-primary').addEventListener('click', () => {
      const step = TOUR_STEPS[currentStepIndex];
      if (step.type === 'intro') {
        nextStep();
      } else if (step.type === 'outro') {
        endTour(true);
        if (window.openActivationModal) {
          window.openActivationModal();
        }
      }
    });

    document.getElementById('tour-btn-cta-secondary').addEventListener('click', () => {
      endTour(true);
    });

    backdropEl.addEventListener('click', (e) => {
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

    const tabBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabId}"]`);
    if (tabBtn) {
      tabBtn.click();
    }
  }

  // Posiciona o holofote e o cartão com base no elemento alvo
  function positionStep(step) {
    document.querySelectorAll('.tour-highlighted-target').forEach(el => el.classList.remove('tour-highlighted-target'));

    // Remove estilos inline que poderiam sobrepor as classes CSS
    cardEl.style.left = '';
    cardEl.style.right = '';
    cardEl.style.top = '';
    cardEl.style.bottom = '';
    cardEl.style.transform = '';

    if (step.type === 'intro' || step.type === 'outro' || !step.targetSelector) {
      spotlightEl.classList.remove('active');
      cardEl.classList.remove('pos-top', 'pos-bottom');
      cardEl.classList.add('pos-center');
      return;
    }

    let target = document.querySelector(step.targetSelector);
    if (!target && step.fallbackSelector) {
      target = document.querySelector(step.fallbackSelector);
    }

    if (!target) {
      spotlightEl.classList.remove('active');
      cardEl.classList.remove('pos-top', 'pos-bottom');
      cardEl.classList.add('pos-center');
      return;
    }

    target.classList.add('tour-highlighted-target');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const padding = 6;

      spotlightEl.style.top = `${Math.max(4, rect.top - padding)}px`;
      spotlightEl.style.left = `${Math.max(4, rect.left - padding)}px`;
      spotlightEl.style.width = `${Math.min(window.innerWidth - 8, rect.width + padding * 2)}px`;
      spotlightEl.style.height = `${rect.height + padding * 2}px`;
      spotlightEl.classList.add('active');

      const windowHeight = window.innerHeight;
      const targetMidY = rect.top + rect.height / 2;

      cardEl.classList.remove('pos-center');
      if (targetMidY < windowHeight * 0.45) {
        cardEl.classList.remove('pos-top');
        cardEl.classList.add('pos-bottom');
      } else {
        cardEl.classList.remove('pos-bottom');
        cardEl.classList.add('pos-top');
      }
    }, 180);
  }

  // Renderiza o conteúdo do passo atual
  function renderStep(index) {
    if (index < 0 || index >= TOUR_STEPS.length) return;
    currentStepIndex = index;
    const step = TOUR_STEPS[index];

    if (step.tab) {
      ensureTab(step.tab);
    }

    document.getElementById('tour-badge-text').innerText = step.badge;
    document.getElementById('tour-title-text').innerText = step.title;
    document.getElementById('tour-desc-text').innerText = step.text;

    // Bullets de benefício se existirem
    const bulletsBox = document.getElementById('tour-bullets-box');
    if (Array.isArray(step.bullets) && step.bullets.length > 0) {
      bulletsBox.style.display = 'flex';
      bulletsBox.innerHTML = step.bullets.map(b => `
        <div class="tour-bullet-item">
          <span class="tour-bullet-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          <span>${b}</span>
        </div>
      `).join('');
    } else {
      bulletsBox.style.display = 'none';
      bulletsBox.innerHTML = '';
    }

    // Ações: Padrão vs Customizadas (Intro / Outro)
    const stdActions = document.getElementById('tour-standard-actions');
    const ctaActions = document.getElementById('tour-custom-actions');

    if (step.type === 'intro' || step.type === 'outro') {
      stdActions.style.display = 'none';
      ctaActions.style.display = 'flex';
      
      const primaryBtn = document.getElementById('tour-btn-cta-primary');
      const secondaryBtn = document.getElementById('tour-btn-cta-secondary');
      
      primaryBtn.querySelector('span').innerText = step.primaryCtaText;
      secondaryBtn.querySelector('span').innerText = step.secondaryCtaText;
    } else {
      stdActions.style.display = 'flex';
      ctaActions.style.display = 'none';

      // Botões padrão
      const btnPrev = document.getElementById('tour-btn-prev');
      const btnNext = document.getElementById('tour-btn-next');

      btnPrev.style.display = index === 0 ? 'none' : 'inline-flex';
      
      if (index === TOUR_STEPS.length - 2) {
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
    }

    // Atualização dos Pontos de Progresso (apenas para os 5 passos interativos do meio)
    const dotsContainer = document.getElementById('tour-dots');
    dotsContainer.innerHTML = '';
    
    if (step.type === 'step') {
      dotsContainer.style.display = 'flex';
      const actualSteps = TOUR_STEPS.filter(s => s.type === 'step');
      const stepIdx = index - 1; // pois index 0 é intro
      actualSteps.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = `tour-dot ${i === stepIdx ? 'active' : (i < stepIdx ? 'completed' : '')}`;
        dotsContainer.appendChild(dot);
      });
    } else {
      dotsContainer.style.display = 'none';
    }

    // Feedback de animação dinâmica suave
    if (cardEl) {
      cardEl.classList.remove('anim-pop');
      void cardEl.offsetWidth;
      cardEl.classList.add('anim-pop');
    }

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

  const VISIT_COUNT_KEY = 'orcamento_tour_visit_count';

  function getVisitCount() {
    return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
  }

  function registerVisit() {
    const count = getVisitCount() + 1;
    localStorage.setItem(VISIT_COUNT_KEY, count.toString());
    return count;
  }

  function startTour(force = false) {
    createTourElements();
    isTourRunning = true;

    if (!force) {
      registerVisit();
    }

    const visits = getVisitCount();
    const isRecurring = visits > 1;

    const btnSkip = document.getElementById('tour-btn-skip');
    if (btnSkip) {
      if (isRecurring) {
        btnSkip.classList.add('prominent');
        btnSkip.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>Pular Tour</span>
        `;
      } else {
        btnSkip.classList.remove('prominent');
        btnSkip.innerHTML = '<span>Pular Tour</span>';
      }
    }

    backdropEl.classList.add('active');
    cardEl.classList.add('active');

    renderStep(0);
  }

  function endTour(isCompleted = true) {
    if (!isTourRunning) return;
    isTourRunning = false;

    document.querySelectorAll('.tour-highlighted-target').forEach(el => el.classList.remove('tour-highlighted-target'));

    if (backdropEl) backdropEl.classList.remove('active');
    if (spotlightEl) spotlightEl.classList.remove('active');
    if (cardEl) cardEl.classList.remove('active');

    ensureTab('pane-painel');

    if (window.showAppToast) {
      window.showAppToast('Apresentação concluída! Toque em <strong>Tour</strong> a qualquer momento para rever.', 3000);
    }
  }

  // Inicialização no DOM
  document.addEventListener('DOMContentLoaded', () => {
    const btnHeaderTour = document.getElementById('btn-start-tour');
    if (btnHeaderTour) {
      btnHeaderTour.addEventListener('click', () => {
        startTour(true);
      });
    }

    // Inicia na abertura da página
    setTimeout(() => {
      startTour(false);
    }, 700);
  });

  window.startAppTour = startTour;
})();
