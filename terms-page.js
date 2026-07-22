(function () {
  "use strict";

  const translations = new Map([
    ["PRIVACY POLICY & REFUND POLICY", "POLÍTICA DE PRIVACIDADE E POLÍTICA DE REEMBOLSO"],
    ["Polar Point Retail LLC Effective Date: April 16, 2026", "Polar Point Retail LLC — Data de vigência: 16 de abril de 2026"],
    ["1. Information We Collect", "1. Informações que coletamos"],
    ["When you purchase from us we collect your name, email address, phone number, and payment information. Payment details are processed securely through Stripe and are never stored on our servers.", "Quando você compra conosco, coletamos seu nome, endereço de e-mail, número de telefone e informações de pagamento. Os dados de pagamento são processados com segurança pela Stripe e nunca são armazenados em nossos servidores."],
    ["2. How We Use Your Information", "2. Como usamos suas informações"],
    ["We use your information to process your order, deliver your digital product via email, and send you relevant communications. We do not sell or share your personal information with third parties.", "Usamos suas informações para processar seu pedido, entregar seu produto digital por e-mail e enviar comunicações relevantes. Não vendemos nem compartilhamos suas informações pessoais com terceiros."],
    ["3. Digital Product Delivery", "3. Entrega do produto digital"],
    ["All products sold by Polar Point Retail LLC are digital products delivered via email immediately after purchase. By completing your purchase you confirm you understand you are buying a digital product.", "Todos os produtos vendidos pela Polar Point Retail LLC são produtos digitais entregues por e-mail imediatamente após a compra. Ao concluir sua compra, você confirma que entende estar adquirindo um produto digital."],
    ["4. Cookies", "4. Cookies"],
    ["Our website uses cookies to improve your browsing experience. By using our site you consent to our use of cookies.", "Nosso site utiliza cookies para melhorar sua experiência de navegação. Ao utilizar nosso site, você concorda com o uso de cookies."],
    ["5. Contact", "5. Contato"],
    ["For any privacy related questions contact us at: support@[yourdomain].com", "Para dúvidas relacionadas à privacidade, entre em contato pelo e-mail: support@[yourdomain].com"],
    ["TERMS AND CONDITIONS", "TERMOS E CONDIÇÕES"],
    ["1. Agreement", "1. Concordância"],
    ["By purchasing any product from Polar Point Retail LLC you agree to these Terms and Conditions in full. If you do not agree do not complete your purchase.", "Ao adquirir qualquer produto da Polar Point Retail LLC, você concorda integralmente com estes Termos e Condições. Caso não concorde, não conclua sua compra."],
    ["2. Digital Products", "2. Produtos digitais"],
    ["All products sold by Polar Point Retail LLC are digital products. Upon completing your purchase you will receive immediate access to your product via email. There is no physical product and no shipping involved.", "Todos os produtos vendidos pela Polar Point Retail LLC são digitais. Ao concluir sua compra, você receberá acesso imediato ao produto por e-mail. Não há produto físico nem envio envolvido."],
    ["3. All Sales Are Final — No Refund Policy", "3. Todas as vendas são definitivas — Política de não reembolso"],
    ["ALL SALES ARE FINAL. Polar Point Retail LLC does not offer refunds, exchanges, or credits of any kind under any circumstances. By completing your purchase you acknowledge and agree that you are not entitled to a refund for any reason including but not limited to:", "TODAS AS VENDAS SÃO DEFINITIVAS. A Polar Point Retail LLC não oferece reembolsos, trocas ou créditos de qualquer natureza, sob nenhuma circunstância. Ao concluir sua compra, você reconhece e concorda que não terá direito a reembolso por qualquer motivo, incluindo, entre outros:"],
    ["Change of mind after purchase", "Mudança de ideia após a compra"],
    ["Failure to read the product description before purchasing", "Não ter lido a descrição do produto antes da compra"],
    ["Claiming the product did not meet expectations", "Alegar que o produto não atendeu às expectativas"],
    ["Technical difficulties accessing the product on your device", "Dificuldades técnicas para acessar o produto em seu dispositivo"],
    ["Duplicate purchases made in error", "Compras duplicadas realizadas por engano"],
    ["By clicking the purchase button and submitting payment you are entering into a binding agreement and acknowledging that no refund will be issued.", "Ao clicar no botão de compra e efetuar o pagamento, você celebra um acordo vinculante e reconhece que nenhum reembolso será emitido."],
    ["4. Chargebacks and Disputes", "4. Contestações e disputas"],
    ["By completing your purchase you agree that initiating a chargeback or payment dispute with your bank or card issuer for any reason constitutes a breach of these Terms and Conditions. Polar Point Retail LLC reserves the right to contest all chargebacks and disputes with full documentation of your purchase agreement including your acceptance of these Terms and Conditions at the time of checkout. We reserve the right to pursue recovery of disputed amounts through all available legal means.", "Ao concluir sua compra, você concorda que iniciar uma contestação ou disputa de pagamento junto ao banco ou emissor do cartão, por qualquer motivo, constitui violação destes Termos e Condições. A Polar Point Retail LLC reserva-se o direito de contestar todas as disputas com a documentação completa do acordo de compra, incluindo sua aceitação destes Termos e Condições no momento do checkout. Reservamo-nos o direito de buscar a recuperação dos valores contestados por todos os meios legais disponíveis."],
    ["5. Product Delivery", "5. Entrega do produto"],
    ["Your digital product will be delivered to the email address provided at checkout immediately after purchase is confirmed. Polar Point Retail LLC is not responsible for delivery failures caused by incorrect email addresses provided by the customer, emails filtered into spam or promotions folders, or issues with the customer's email provider. If you do not receive your product within 24 hours contact us at support@[yourdomain].com and we will resend it.", "Seu produto digital será entregue ao endereço de e-mail informado no checkout imediatamente após a confirmação da compra. A Polar Point Retail LLC não se responsabiliza por falhas de entrega causadas por endereços de e-mail incorretos informados pelo cliente, mensagens filtradas para as pastas de spam ou promoções ou problemas no provedor de e-mail do cliente. Caso não receba seu produto em até 24 horas, entre em contato pelo e-mail support@[yourdomain].com para que possamos reenviá-lo."],
    ["6. Intellectual Property", "6. Propriedade intelectual"],
    ["All content inside products sold by Polar Point Retail LLC is the intellectual property of Polar Point Retail LLC. You may not reproduce, distribute, resell, or share any purchased content without express written permission from Polar Point Retail LLC.", "Todo o conteúdo dos produtos vendidos pela Polar Point Retail LLC é propriedade intelectual da Polar Point Retail LLC. Você não pode reproduzir, distribuir, revender ou compartilhar qualquer conteúdo adquirido sem autorização expressa e por escrito da Polar Point Retail LLC."],
    ["7. Disclaimer", "7. Aviso legal"],
    ["All products sold by Polar Point Retail LLC are for educational and informational purposes only. Nothing contained in our products constitutes medical advice. Always consult a qualified healthcare provider before making changes to your health routine. Polar Point Retail LLC assumes no liability for any outcomes resulting from use of information contained in our products.", "Todos os produtos vendidos pela Polar Point Retail LLC destinam-se exclusivamente a fins educacionais e informativos. Nada contido em nossos produtos constitui orientação médica. Consulte sempre um profissional de saúde qualificado antes de fazer alterações em sua rotina de saúde. A Polar Point Retail LLC não assume responsabilidade por resultados decorrentes do uso das informações contidas em nossos produtos."],
    ["8. Governing Law", "8. Legislação aplicável"],
    ["These Terms and Conditions are governed by the laws of the United States. Any disputes shall be resolved in the jurisdiction where Polar Point Retail LLC is registered.", "Estes Termos e Condições são regidos pelas leis dos Estados Unidos. Quaisquer disputas serão resolvidas na jurisdição em que a Polar Point Retail LLC estiver registrada."],
    ["9. Changes to These Terms", "9. Alterações destes termos"],
    ["Polar Point Retail LLC reserves the right to update these Terms and Conditions at any time. Continued use of our website constitutes acceptance of any updated terms.", "A Polar Point Retail LLC reserva-se o direito de atualizar estes Termos e Condições a qualquer momento. O uso continuado do nosso site constitui aceitação dos termos atualizados."],
    ["Polar Point Retail LLC All Rights Reserved © 2026", "Polar Point Retail LLC — Todos os direitos reservados © 2026"]
  ]);

  function translatePage() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      const normalized = node.nodeValue.trim();
      if (!translations.has(normalized)) return;
      node.nodeValue = node.nodeValue.replace(normalized, translations.get(normalized));
    });
    document.title = "Termos, Política de Privacidade e Reembolso | Vovó Tereza";
  }

  const editorElementQuery = "img,span,strong,em,p,h1,h2,h3,h4,h5,h6,a,li,label,small";

  function installStableEditorKeys() {
    const counters = new Map();
    document.querySelectorAll(editorElementQuery).forEach(function (element) {
      const owner = element.closest("[id]");
      const ownerKey = owner ? owner.id : "document";
      const ordinal = counters.get(ownerKey) || 0;
      counters.set(ownerKey, ordinal + 1);
      element.dataset.editorKey = ownerKey + "::" + ordinal;
    });
  }

  function reportManagedContent(status, detail) {
    document.documentElement.dataset.managedContentStatus = status;
    document.documentElement.dataset.managedContentDetail = detail || "";
    window.dispatchEvent(new CustomEvent("managed-content-status", { detail: { status: status, message: detail || "" } }));
  }

  function applyManagedImage(element, value) {
    element.src = value;
    element.removeAttribute("srcset");
    element.removeAttribute("sizes");
    element.style.setProperty("background-image", "none", "important");
    element.style.setProperty("background-color", "transparent", "important");
    const picture = element.closest("picture");
    if (picture) picture.querySelectorAll("source").forEach(function (source) { source.srcset = value; });
  }

  async function loadManagedContent() {
    try {
      const response = await fetch("/api/page-content", { cache: "no-store" });
      const rows = await response.json();
      if (!response.ok) throw new Error(rows.error || "Não foi possível carregar as alterações.");
      let applied = 0;
      rows.filter(function (row) { return row.selector.startsWith("legal::"); }).forEach(function (row) {
        const selector = row.selector.slice(7);
        let element;
        try { element = document.querySelector(selector); } catch (_) { return; }
        if (!element) return;
        if (row.content_type === "image" && element.tagName === "IMG") applyManagedImage(element, row.value);
        if (row.content_type === "text") element.textContent = row.value;
        applied += 1;
      });
      reportManagedContent("ready", String(applied));
    } catch (error) { reportManagedContent("error", error.message); }
  }

  translatePage();
  installStableEditorKeys();
  document.documentElement.classList.remove("translation-pending");
  loadManagedContent();
})();
