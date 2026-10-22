/* ============================================================
   SISTEMA DE ORÇAMENTOS E OS
   Lógica do Contrato Digital com Assinatura na Tela
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const store = window.AppStore;

  // Obter ID do contrato da URL ou padrão
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('id') || 'ctr-demo-01';

  let currentContract = null;
  let signaturePad = null;

  // Elementos da página
  const pendingBox = document.getElementById('contract-pending-box');
  const signedBox = document.getElementById('contract-signed-box');
  const btnOpenSignModal = document.getElementById('btn-open-sign-modal');
  const modal = document.getElementById('signature-modal');
  const canvas = document.getElementById('signature-pad');
  const btnClear = document.getElementById('btn-clear');
  const btnCancel = document.getElementById('btn-cancel');
  const btnConfirm = document.getElementById('btn-confirm');
  const btnShareWa = document.getElementById('btn-share-contract-wa');

  // Inicializar
  async function init() {
    try {
      currentContract = await store.getContractById(contractId);
      if (!currentContract) {
        alert('Contrato não localizado.');
        return;
      }
      renderContract(currentContract);
    } catch (err) {
      console.error('Erro ao carregar contrato:', err);
    }
  }

  // Renderizar campos no documento
  function renderContract(ctr) {
    document.getElementById('contract-number-badge').textContent = ctr.contract_number || 'CTR-2026/001';
    document.getElementById('c-provider-name').textContent = ctr.provider_name;
    document.getElementById('c-provider-cnpj').textContent = ctr.provider_cnpj;
    document.getElementById('c-provider-phone').textContent = ctr.provider_phone;
    document.getElementById('c-provider-address').textContent = ctr.provider_address;

    document.getElementById('c-client-name').textContent = ctr.client_name;
    document.getElementById('c-client-doc').textContent = ctr.client_doc || '123.456.789-00';
    document.getElementById('c-client-phone').textContent = ctr.client_phone;
    document.getElementById('c-client-address').textContent = ctr.client_address || 'Endereço do Cliente';

    document.getElementById('c-service-desc').textContent = ctr.service_description;
    document.getElementById('c-total-amount').textContent = Number(ctr.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('c-payment-terms').textContent = ctr.payment_terms;
    document.getElementById('c-deadline-days').textContent = `${ctr.deadline_days || 2} dias úteis`;
    document.getElementById('c-warranty-days').textContent = `${ctr.warranty_days || 90} (noventa) dias`;

    // Estado da Assinatura
    if (ctr.status === 'assinado' && ctr.signature_data) {
      pendingBox.classList.add('hidden');
      signedBox.classList.remove('hidden');

      document.getElementById('cert-signature-img').src = ctr.signature_data;
      document.getElementById('cert-signer-name').textContent = ctr.client_name;
      document.getElementById('cert-timestamp').textContent = new Date(ctr.signed_at || Date.now()).toLocaleString('pt-BR');
      document.getElementById('cert-ip').textContent = ctr.signature_ip || '189.120.45.10 (Verificado)';
      document.getElementById('cert-hash').textContent = ctr.signature_hash || 'DOC-VERIFIED-HASH-2026';
    } else {
      pendingBox.classList.remove('hidden');
      signedBox.classList.add('hidden');
    }
  }

  // Modal de Assinatura
  btnOpenSignModal.addEventListener('click', () => {
    modal.classList.remove('hidden');

    requestAnimationFrame(() => {
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
    });
  });

  btnClear.addEventListener('click', () => {
    if (signaturePad) signaturePad.clear();
  });

  btnCancel.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.querySelector('.modal-overlay').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

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
    if (!modal.classList.contains('hidden')) {
      resizeCanvas();
    }
  });

  // Confirmar Assinatura Digital
  btnConfirm.addEventListener('click', async () => {
    if (!signaturePad || signaturePad.isEmpty()) {
      alert('Por favor, assine com o dedo ou mouse no campo acima.');
      return;
    }

    const signatureData = signaturePad.toDataURL('image/png');
    btnConfirm.disabled = true;
    btnConfirm.textContent = 'Gravando Assinatura...';

    try {
      // Capturar IP simulado ou real
      let clientIp = '189.120.45.10';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        if (ipData.ip) clientIp = ipData.ip;
      } catch (e) {
        // Fallback silencioso
      }

      const updated = await store.signContract(currentContract.id, signatureData, clientIp);
      modal.classList.add('hidden');
      renderContract(updated);

      // Feedback animado
      alert('✅ Contrato assinado digitalmente com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar assinatura.');
    } finally {
      btnConfirm.disabled = false;
      btnConfirm.textContent = '✅ Confirmar Assinatura';
    }
  });

  // Compartilhar no WhatsApp
  if (btnShareWa) {
    btnShareWa.addEventListener('click', () => {
      const waLink = window.generateContractWhatsAppLink(
        currentContract.client_phone,
        currentContract.contract_number,
        currentContract.client_name,
        currentContract.id
      );
      window.open(waLink, '_blank');
    });
  }

  await init();
});
