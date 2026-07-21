(function () {
  "use strict";

  function translatePage() {
    const translations = new Map([
      ["Vovó Tereza's Natural Remedy Book", "Livro de Remédios Naturais de Vovó Tereza"],
      ["PEOPLE HEALING WITHOUT EXPENSIVE PRESCRIPTIONS & DENTAL BILLS", "PESSOAS SE CUIDANDO SEM RECEITAS CARAS E CONTAS DE DENTISTA"],
      ["GET VOVÓ TEREZA'S ANCIENT REMEDY BOOK TODAY FOR 90% OFF", "ADQUIRA HOJE O LIVRO DE REMÉDIOS ANTIGOS DE VOVÓ TEREZA COM 90% DE DESCONTO"],
      ["53 ANCIENT REMEDIES FROM 50+ YEARS OF HOLISTIC HEALING PRACTICE", "53 REMÉDIOS ANTIGOS REUNIDOS EM MAIS DE 50 ANOS DE PRÁTICA HOLÍSTICA"],
      ["Why The Dental Industry And Big Pharma Are Trying To Shut Down Vovó Tereza's Ancient Remedies", "Por que a indústria odontológica e as grandes farmacêuticas tentam silenciar os remédios antigos de Vovó Tereza"],
      ["Grab Vovó Tereza's Ancient Remedy Book: From Yellow Teeth, Varicose Veins & Gut Issues To Feeling Better Than You Have In Years — Using Ingredients Already In Your Kitchen.", "Conheça o Livro de Remédios Antigos de Vovó Tereza: de dentes amarelados, varizes e problemas intestinais a uma sensação de bem-estar que você não sentia há anos — usando ingredientes que já estão na sua cozinha."],
      ["Get My Ancient Remedy Book: $9.99", "Quero meu Livro de Remédios Antigos: US$ 9,99"],
      ["Join", "Junte-se a"],
      ["People Who Stopped Trusting Big Pharma And Started Healing With Vovó Tereza.", "pessoas que deixaram de confiar nas grandes farmacêuticas e começaram a se cuidar com Vovó Tereza."],
      ["Secure Checkout", "Pagamento seguro"],
      ["Instant Email Delivery", "Entrega imediata por e-mail"],
      ["Read On Any Device", "Leia em qualquer dispositivo"],
      ["Less than one dental visit for what the industry never fixed anyway.", "Menos que uma consulta odontológica por aquilo que a indústria nunca resolveu."],
      ["TODAY ONLY: SAVE 90%", "SOMENTE HOJE: ECONOMIZE 90%"],
      ["THIS 90% DISCOUNT ENDS IN:", "ESTE DESCONTO DE 90% TERMINA EM:"],
      ["HOURS", "HORAS"], ["MINUTES", "MINUTOS"], ["SECONDS", "SEGUNDOS"],
      ["Everything The Dental Industry And Big Pharma Don't Want You To Find Is", "Tudo o que a indústria odontológica e as grandes farmacêuticas não querem que você descubra está"],
      ["Inside This One Book", "Neste único livro"],
      ["Recipe 1", "Receita 1"],
      [": Heal Your Body Without A Single Prescription", ": Cuide do seu corpo sem uma única receita médica"],
      ["The remedies Big Pharma replaced with expensive monthly prescriptions.", "Os remédios que as grandes farmacêuticas substituíram por receitas mensais caras."],
      ["Kidney flush remedy", "Remédio para limpeza dos rins"],
      [": support and cleanse what your doctor said nothing could be done about", ": cuide e limpe aquilo que seu médico disse que não tinha solução"],
      ["Liver cleanse tonic", "Tônico para limpeza do fígado"],
      [": give your liver what 50 years of healing practice recommends from your kitchen", ": ofereça ao seu fígado o que 50 anos de prática recomendam, direto da sua cozinha"],
      ["Gut cleanse remedy", "Remédio para limpeza intestinal"],
      [": wipe out what has been draining your energy and your digestion for months", ": elimine o que vem prejudicando sua energia e sua digestão há meses"],
      ["Circulation remedy", "Remédio para circulação"],
      [": support your veins and your blood flow without a single prescription", ": cuide das veias e do fluxo sanguíneo sem uma única receita médica"],
      ["Covers: Kidneys. Liver. Gut Health. Circulation.", "Inclui: rins, fígado, saúde intestinal e circulação."],
      ["Value if sold separately:", "Valor se vendido separadamente:"],
      ["Recipe 2", "Receita 2"],
      [": Look Younger Without Expensive Treatments", ": Tenha uma aparência mais jovem sem tratamentos caros"],
      ["The remedies the cosmetic and dental industry charges hundreds for every single year.", "Os remédios pelos quais as indústrias cosmética e odontológica cobram centenas todos os anos."],
      ["Teeth whitening remedy", "Remédio para clareamento dos dentes"],
      [": get your teeth white again without a single dental visit or whitening kit", ": recupere dentes mais brancos sem consulta odontológica ou kit de clareamento"],
      ["Skin remedy", "Remédio para a pele"],
      [": clear the bumps, the darkness, and the discoloration with what is already in your kitchen", ": reduza irregularidades, escurecimento e manchas com o que já existe na sua cozinha"],
      ["Hair growth remedy", "Remédio para crescimento capilar"],
      [": restore thickness and stop the thinning naturally without expensive treatments", ": recupere o volume e reduza o afinamento naturalmente, sem tratamentos caros"],
      ["Dark underarm remedy", "Remédio para axilas escurecidas"],
      [": clear what the cosmetic industry has been selling you creams for without results", ": cuide do que a indústria cosmética tenta tratar com cremes sem resultado"],
      ["Covers: Teeth. Skin. Hair. Dark Spots.", "Inclui: dentes, pele, cabelo e manchas escuras."],
      ["Recipe 3", "Receita 3"],
      [": Restore What The Industry Said Was Permanent", ": Recupere o que a indústria disse ser permanente"],
      ["The remedies the wellness aisle sells you at $40 a bottle without ever fixing the root.", "Os remédios vendidos por US$ 40 o frasco nas lojas de bem-estar sem nunca tratar a causa."],
      ["Varicose vein remedy", "Remédio para varizes"],
      [": support your circulation and reduce what has been sitting in your legs for years", ": cuide da circulação e reduza o que se acumulou nas pernas durante anos"],
      ["Swollen ankle remedy", "Remédio para tornozelos inchados"],
      [": bring down what your doctor said was just something to manage", ": reduza aquilo que seu médico disse que só poderia ser controlado"],
      ["Facial puffiness remedy", "Remédio para inchaço facial"],
      [": clear the puffiness that has been sitting on your face every morning", ": reduza o inchaço que aparece no seu rosto todas as manhãs"],
      ["Stretch mark remedy", "Remédio para estrias"],
      [": restore and repair what the cosmetic industry charges hundreds to treat", ": restaure e repare aquilo que a indústria cosmética cobra centenas para tratar"],
      ["Covers: Varicose Veins. Swelling. Puffiness. Skin Repair.", "Inclui: varizes, inchaço, aparência inchada e reparação da pele."],
      ["If You Bought Each Recipe Separately You Would", "Se você comprasse cada receita separadamente, iria"],
      ["Pay $97.", "Pagar US$ 97."],
      ["Today you get all three inside Vovó Tereza's Ancient Remedy Book.", "Hoje você recebe as três no Livro de Remédios Antigos de Vovó Tereza."],
      ["$9.99 Today Only", "US$ 9,99 somente hoje"],
      ["90% off. Every remedy. One book. Your kitchen. Tonight.", "90% de desconto. Todos os remédios. Um livro. Na sua cozinha. Hoje."],
      ["THIS PRICE RETURNS TO $97 WHEN THE TIMER HITS ZERO.", "O PREÇO VOLTA A US$ 97 QUANDO O CONTADOR CHEGAR A ZERO."],
      ["Join 360,000+ People Who Stopped Trusting Big Pharma And Started Healing With Vovó Tereza.", "Junte-se a mais de 360 mil pessoas que deixaram de confiar nas grandes farmacêuticas e começaram a se cuidar com Vovó Tereza."],
      ["Where Should We Send The E-book?", "Para onde devemos enviar o e-book?"],
      ["Save 90% By Purchasing Now!", "Economize 90% comprando agora!"],
      ["Shipping", "Entrega"],
      ["By completing your purchase, you agree to Vovó Tereza's", "Ao concluir sua compra, você concorda com os"],
      ["Terms and Conditions and Refund Policy", "Termos e Condições e a Política de Reembolso de Vovó Tereza"],
      [". Please check the box to proceed.", ". Marque a caixa para continuar."],
      ["Go To Checkout", "Ir para o pagamento"],
      ["We Respect Your Privacy & Information.", "Respeitamos sua privacidade e suas informações."],
      ["Here Is How You Get Vovó Tereza's Ancient Remedy Book.", "Veja como receber o Livro de Remédios Antigos de Vovó Tereza."],
      ["Three simple steps. That is all.", "Apenas três passos simples."],
      ["Step 1 — Purchase", "Etapa 1 — Compra"],
      ["Click the button and complete your order securely. Takes less than 20 seconds.", "Clique no botão e conclua seu pedido com segurança. Leva menos de 20 segundos."],
      ["Step 2 — Check your email", "Etapa 2 — Verifique seu e-mail"],
      ["The moment your purchase goes through I send the book straight to your inbox.", "Assim que sua compra for aprovada, o livro será enviado diretamente para sua caixa de entrada."],
      ["Step 3 — Start healing", "Etapa 3 — Comece a se cuidar"],
      ["Open it on your phone, tablet, or laptop. No app needed. No waiting. No shipping.", "Abra no celular, tablet ou computador. Sem aplicativo, espera ou frete."],
      ["Got Questions? Vovó Tereza Has Answers.", "Tem dúvidas? Vovó Tereza responde."],
      ["What exactly is Vovó Tereza's Ancient Remedy Book?", "O que é exatamente o Livro de Remédios Antigos de Vovó Tereza?"],
      ["It is a digital book containing 53 ancient natural remedies drawn from 50+ years of holistic healing practice and ancient Chinese wellness wisdom. It covers teeth, skin, hair, kidney health, liver support, gut cleansing, circulation, varicose veins, swelling, and more. Everything is written in plain simple language using ingredients you already have at home.", "É um livro digital com 53 remédios naturais antigos, reunidos em mais de 50 anos de prática holística e sabedoria chinesa sobre bem-estar. Aborda dentes, pele, cabelo, saúde dos rins, cuidado do fígado, limpeza intestinal, circulação, varizes, inchaço e muito mais. Tudo é explicado em linguagem simples, usando ingredientes que você já tem em casa."],
      ["Who is Vovó Tereza?", "Quem é Vovó Tereza?"],
      ["Vovó Tereza is a US-based holistic healer with over 50 years of healing experience. She has spent her career studying and applying ancient Chinese wellness wisdom to the conditions that modern medicine and the dental industry have failed to fix. Vovó Tereza's Ancient Remedy Book is her way of putting five decades of healing knowledge into every American kitchen at a price every family can afford.", "Vovó Tereza é uma terapeuta holística radicada nos Estados Unidos, com mais de 50 anos de experiência. Ela dedicou sua carreira ao estudo e à aplicação da antiga sabedoria chinesa de bem-estar em situações que a medicina moderna e a indústria odontológica não conseguiram resolver. O Livro de Remédios Antigos de Vovó Tereza reúne cinco décadas de conhecimento por um preço acessível."],
      ["Do these ancient remedies actually work?", "Esses remédios antigos realmente funcionam?"],
      ["These remedies have not been in practice for 50 years because they failed. Ancient Chinese medicine has addressed these same conditions for centuries — long before the dental industry charged hundreds for whitening kits and Big Pharma put a prescription on every problem. Every remedy in this book has survived because it worked, not because someone put it on a shelf with a price tag.", "Esses remédios não seriam usados há 50 anos se não tivessem utilidade. A medicina chinesa aborda essas mesmas questões há séculos — muito antes de a indústria odontológica cobrar centenas por kits de clareamento e de as grandes farmacêuticas oferecerem uma receita para cada problema. Cada remédio deste livro atravessou gerações por seus resultados, não por ter sido colocado numa prateleira com uma etiqueta de preço."],
      ["How do I receive the book after I purchase?", "Como recebo o livro depois da compra?"],
      ["The moment your purchase is complete I send the book straight to your email. You can open it immediately on your phone, tablet, or laptop. No app needed. No waiting. No shipping.", "Assim que a compra for concluída, o livro será enviado diretamente para seu e-mail. Você poderá abri-lo imediatamente no celular, tablet ou computador. Sem aplicativo, espera ou frete."],
      ["Are the ingredients expensive or hard to find?", "Os ingredientes são caros ou difíceis de encontrar?"],
      ["No. Every single remedy in this book uses ingredients you likely already have in your kitchen. Ginger. Lemon. Garlic. Turmeric. Cinnamon. Honey. Nothing exotic. Nothing expensive. Nothing you need to order online.", "Não. Todos os remédios do livro usam ingredientes que você provavelmente já tem na cozinha: gengibre, limão, alho, cúrcuma, canela e mel. Nada exótico, caro ou que precise ser comprado pela internet."],
      ["Is this safe to use alongside my current medication?", "É seguro usar junto com meus medicamentos atuais?"],
      ["The remedies in this book use natural kitchen ingredients that have been used safely for centuries. However if you are currently on prescription medication I always recommend checking with a healthcare provider before making changes to your routine.", "Os remédios deste livro usam ingredientes naturais de cozinha utilizados há séculos. Entretanto, se você toma medicamentos prescritos, consulte um profissional de saúde antes de fazer mudanças na sua rotina."],
      ["Why is the price only $9.99?", "Por que custa apenas US$ 9,99?"],
      ["Vovó Tereza watched American families pay the dental industry and Big Pharma thousands of dollars for results their kitchen could deliver for free. I made a decision that this knowledge should be accessible to everyone regardless of what they can afford. That is why it is $9.99 today. This price will not last.", "Vovó Tereza viu famílias gastarem milhares de dólares com a indústria odontológica e as grandes farmacêuticas por resultados que poderiam vir da própria cozinha. Ela decidiu tornar esse conhecimento acessível a todos. Por isso, hoje o valor é de US$ 9,99. Esse preço é temporário."],
      ["Why was the original price $97?", "Por que o preço original era US$ 97?"],
      ["Because the three recipe collections inside this book are each worth between $23 and $37 if sold individually. Together they add up to $97. Right now you are getting all three for $9.99. When the timer hits zero the price returns to $97.", "Porque cada uma das três coleções de receitas do livro vale entre US$ 23 e US$ 37 quando vendida separadamente. Juntas, somam US$ 97. Agora você recebe as três por US$ 9,99. Quando o contador chegar a zero, o preço voltará a US$ 97."],
      ["Is my payment secure?", "Meu pagamento é seguro?"],
      ["Yes. Your payment is processed through a fully encrypted secure checkout. Your card details are never stored. Your information is never shared.", "Sim. O pagamento é processado em um ambiente seguro e totalmente criptografado. Os dados do cartão não são armazenados e suas informações não são compartilhadas."],
      ["How quickly will I see results?", "Em quanto tempo verei resultados?"],
      ["Many people notice a difference within days of using their first remedy. Every remedy in this book includes instructions on how and when to use it for best results. Some work best with consistency over one to two weeks.", "Muitas pessoas percebem diferenças poucos dias após usar o primeiro remédio. Cada receita inclui instruções de uso para obter os melhores resultados. Algumas exigem constância durante uma ou duas semanas."],
      ["© Vovó Tereza's Natural Remedy Book. All Rights Reserved.", "© Livro de Remédios Naturais de Vovó Tereza. Todos os direitos reservados."],
      ["Terms and Conditions and Refund Policy Disclaimer", "Termos e Condições, Política de Reembolso e Aviso Legal"],
      [": This book is for educational purposes only and is not intended as medical advice.", ": Este livro tem finalidade exclusivamente educativa e não substitui orientação médica."]
    ]);

    document.title = translations.get(document.title) || document.title;
    document.documentElement.lang = "pt-BR";
    document.querySelectorAll("body *").forEach(function (element) {
      if (/^(STYLE|SCRIPT|SVG|PATH|TEMPLATE)$/.test(element.tagName)) return;
      Array.from(element.childNodes).forEach(function (node) {
        if (node.nodeType !== 3) return;
        const original = node.nodeValue;
        const trimmed = original.trim();
        let translated = translations.get(trimmed);
        if (!translated) {
          for (const entry of translations) {
            if (trimmed.includes(entry[0])) {
              translated = trimmed.replace(entry[0], entry[1]);
              break;
            }
          }
        }
        if (translated) node.nodeValue = original.replace(trimmed, translated);
      });
    });

    const placeholders = {
      name: "Nome completo...", email: "Endereço de e-mail...", phone: "Telefone...",
      address: "Endereço...", city: "Cidade...", zipcode: "CEP..."
    };
    Object.keys(placeholders).forEach(function (name) {
      const field = document.querySelector("[name='" + name + "']");
      if (field) field.placeholder = placeholders[name];
    });
    document.querySelectorAll("button[aria-label*='Ancient Remedy Book']").forEach(function (button) {
      button.setAttribute("aria-label", "Quero meu Livro de Remédios Antigos por US$ 9,99");
    });

    const country = document.querySelector("select[name='country']");
    if (country && typeof Intl.DisplayNames === "function") {
      const names = new Intl.DisplayNames(["pt-BR"], { type: "region" });
      Array.from(country.options).forEach(function (option) {
        if (option.value && /^[A-Z]{2}$/.test(option.value)) option.textContent = names.of(option.value);
      });
    }
  }

  translatePage();

  const cityInput = document.querySelector("input[name='city']");
  if (cityInput && !document.querySelector("input[name='state']")) {
    const stateInput = cityInput.cloneNode(false);
    stateInput.name = "state";
    stateInput.id = "checkout-state";
    stateInput.value = "";
    stateInput.placeholder = "Estado (UF)...";
    stateInput.autocomplete = "address-level1";
    stateInput.maxLength = 80;
    stateInput.removeAttribute("aria-invalid");
    cityInput.insertAdjacentElement("afterend", stateInput);
  }

  document.querySelectorAll('a[href="https://motherjubaremedies.com/tos-privacy-policy-mother-juba"]').forEach(function (link) {
    link.href = "/termos.html";
  });

  function replaceTextContent(transform) {
    document.querySelectorAll("body *").forEach(function (element) {
      if (/^(STYLE|SCRIPT|SVG|PATH|TEMPLATE|OBJECT)$/.test(element.tagName)) return;
      Array.from(element.childNodes).forEach(function (node) {
        if (node.nodeType === 3 && node.nodeValue) node.nodeValue = transform(node.nodeValue);
      });
    });
  }

  function convertPageCurrencyToReal() {
    function normalizeCurrency(text) {
      return text
        .replace(/US\$\s*/g, "R$ ")
        .replace(/(^|[^R])\$(?=\s*\d)/g, function (_, prefix) { return prefix + "R$"; })
        .replace(/R{2,}\$/g, "R$");
    }
    replaceTextContent(function (text) {
      return normalizeCurrency(text);
    });
    document.querySelectorAll("[aria-label]").forEach(function (element) {
      element.setAttribute("aria-label", normalizeCurrency(element.getAttribute("aria-label")));
    });
  }

  convertPageCurrencyToReal();

  const offerPriceStyle = document.createElement("style");
  offerPriceStyle.textContent = [
    ".paragraph-zZDNJDykY54.text-output{font-size:44px!important;white-space:nowrap}",
    "@media screen and (max-width:480px){.paragraph-zZDNJDykY54.text-output{font-size:28px!important;line-height:1.15!important;white-space:normal;overflow-wrap:break-word}.paragraph-zZDNJDykY54.text-output p{max-width:100%;margin-inline:auto}}"
  ].join("");
  document.head.appendChild(offerPriceStyle);
  document.documentElement.classList.remove("translation-pending");

  const order = document.querySelector(".container-order-form-two-step");
  const body = order && order.querySelector(".form-body");
  const submit = order && order.querySelector(".form-btn");
  const terms = order && order.querySelector("#terms-conditions-input");
  const fields = order ? Array.from(order.querySelectorAll("input[name], select[name]")) : [];
  const databaseReady = Boolean(window.OfferDB && OfferDB.configured());
  const adminPreview = new URLSearchParams(location.search).has("admin_preview");
  let visitorSession = sessionStorage.getItem("oferta-organica-visitor-session");
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

  installStableEditorKeys();

  async function loadManagedPageContent() {
    try {
      const response = await fetch("/api/page-content", { cache: "no-store" });
      const rows = await response.json();
      if (!response.ok) throw new Error(rows.error || "Não foi possível carregar as alterações.");
      let applied = 0;
      rows.filter(function (row) { return !row.selector.startsWith("legal::"); }).forEach(function (row) {
        let element;
        try { element = document.querySelector(row.selector); } catch (_) { return; }
        if (!element) return;
        if (row.content_type === "image" && element.tagName === "IMG") element.src = row.value;
        if (row.content_type === "text") element.textContent = row.value;
        applied += 1;
      });
      reportManagedContent("ready", String(applied));
    } catch (error) { reportManagedContent("error", error.message); }
  }

  loadManagedPageContent();

  async function loadLiveOfferPrices() {
    if (!databaseReady) return;
    try {
      const offers = await OfferDB.select("offers", "select=slug,price&active=eq.true", false);
      const bundle = offers.find(function (offer) { return offer.slug === "bundle"; });
      if (!bundle) return;
      const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
      const bundlePrice = brl.format(Number(bundle.price));
      replaceTextContent(function (text) {
        return text.replace(/R\$\s*9[,.]99/g, bundlePrice);
      });
      document.querySelectorAll("[aria-label]").forEach(function (element) {
        element.setAttribute("aria-label", element.getAttribute("aria-label").replace(/R\$\s*9[,.]99/g, bundlePrice));
      });
    } catch (_) { /* O preço estático continua visível se o banco estiver temporariamente indisponível. */ }
  }

  loadLiveOfferPrices();
  if (!visitorSession && window.crypto && crypto.randomUUID) {
    visitorSession = crypto.randomUUID();
    sessionStorage.setItem("oferta-organica-visitor-session", visitorSession);
  }

  function deliveryElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function installDeliveryStyles() {
    if (document.getElementById("paid-delivery-styles")) return;
    const style = document.createElement("style");
    style.id = "paid-delivery-styles";
    style.textContent = ".paid-delivery{padding:28px 20px 22px;text-align:center;animation:paidReveal .45s cubic-bezier(.16,1,.3,1)}" +
      ".paid-delivery-badge{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;background:#e9f5ed;color:#23613a;font:700 12px Arial,sans-serif;letter-spacing:.03em}" +
      ".paid-delivery h3{margin:14px 0 7px;color:#202020;font:800 26px/1.15 Arial,sans-serif}" +
      ".paid-delivery-copy{margin:0 auto 20px;max-width:560px;color:#6d6d6d;font:400 14px/1.55 Arial,sans-serif}" +
      ".paid-delivery-cover{width:min(310px,100%);height:390px;margin:0 auto 18px;border:1px solid #d8dce1;border-radius:8px;background:#fff;box-shadow:0 12px 28px rgba(37,45,55,.13)}" +
      ".paid-delivery-download{display:flex;align-items:center;justify-content:center;width:min(520px,100%);min-height:50px;margin:0 auto;padding:13px 20px;border-radius:5px;background:#1677a8;color:#fff!important;font:800 16px Arial,sans-serif;text-decoration:none!important;transition:transform .25s cubic-bezier(.16,1,.3,1),background-color .25s ease}" +
      ".paid-delivery-download:hover{background:#12658f}.paid-delivery-download:active{transform:translateY(1px) scale(.99)}" +
      ".paid-delivery-note{margin:11px 0 0;color:#8a8a8a;font:400 12px Arial,sans-serif}" +
      ".paid-delivery-loading{height:310px;margin:10px auto 20px;border-radius:8px;background:linear-gradient(100deg,#f1f1f1 20%,#fafafa 36%,#f1f1f1 52%);background-size:220% 100%;animation:deliveryShimmer 1.3s infinite}" +
      ".paid-delivery-error{padding:18px;border:1px solid #e2b8ae;border-radius:8px;background:#fff5f2;color:#8e3024;font:600 14px/1.5 Arial,sans-serif}" +
      "@keyframes deliveryShimmer{to{background-position-x:-220%}}@keyframes paidReveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}";
    document.head.appendChild(style);
  }

  async function showPaidDelivery() {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get("session_id");
    if (query.get("payment") !== "success" || !sessionId || !body) return;
    installDeliveryStyles();
    body.replaceChildren();
    const panel = deliveryElement("section", "paid-delivery");
    panel.setAttribute("aria-live", "polite");
    panel.appendChild(deliveryElement("span", "paid-delivery-badge", "Pagamento confirmado"));
    panel.appendChild(deliveryElement("h3", "", "Preparando seu e-book"));
    panel.appendChild(deliveryElement("p", "paid-delivery-copy", "Estamos validando sua compra e liberando o arquivo com segurança."));
    panel.appendChild(deliveryElement("div", "paid-delivery-loading"));
    body.appendChild(panel);
    try {
      const response = await fetch("/api/payment-delivery?session_id=" + encodeURIComponent(sessionId), { headers: { Accept: "application/json" } });
      const payload = await response.json();
      if (!response.ok || !payload.preview_url) throw new Error(payload.error || "Não foi possível liberar o e-book.");
      panel.replaceChildren();
      panel.appendChild(deliveryElement("span", "paid-delivery-badge", "Pagamento confirmado"));
      panel.appendChild(deliveryElement("h3", "", "Seu e-book está pronto"));
      panel.appendChild(deliveryElement("p", "paid-delivery-copy", "A compra foi aprovada. Você já pode visualizar a capa e baixar o arquivo."));
      const cover = deliveryElement("object", "paid-delivery-cover");
      cover.type = "application/pdf"; cover.data = payload.preview_url + "#page=1&view=FitH";
      cover.setAttribute("aria-label", "Capa do e-book adquirido"); panel.appendChild(cover);
      const download = deliveryElement("a", "paid-delivery-download", "Baixar meu e-book");
      download.href = payload.download_url; download.setAttribute("download", payload.file_name || "ebook.pdf");
      panel.appendChild(download);
      panel.appendChild(deliveryElement("p", "paid-delivery-note", "O link é protegido e vinculado a esta compra."));
    } catch (error) {
      panel.replaceChildren();
      panel.appendChild(deliveryElement("h3", "", "Pagamento confirmado"));
      panel.appendChild(deliveryElement("p", "paid-delivery-error", error.message || "Não foi possível liberar o arquivo agora. Atualize a página para tentar novamente."));
    }
  }

  showPaidDelivery();

  function recordEvent(type, eventData) {
    if (!visitorSession || adminPreview) return Promise.resolve();
    return fetch("/api/site-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: visitorSession, event_type: type, path: location.pathname, event_data: eventData || {} }),
      keepalive: true
    }).catch(function () {});
  }

  if (visitorSession && !adminPreview) {
    recordEvent("page_view");
    recordEvent("heartbeat");
    setInterval(function () { recordEvent("heartbeat"); }, 60000);

    document.addEventListener("click", function (event) {
      const root = document.documentElement;
      const target = event.target.closest && event.target.closest("a,button,input,label,img,h1,h2,h3,h4,p,li,span");
      recordEvent("click", {
        x_ratio: Math.max(0, Math.min(1, event.clientX / Math.max(root.clientWidth, 1))),
        y_ratio: Math.max(0, Math.min(1, (window.scrollY + event.clientY) / Math.max(root.scrollHeight, 1))),
        target: target ? (target.id ? "#" + target.id : target.tagName.toLowerCase()) : "unknown",
        viewport_width: root.clientWidth,
        page_height: root.scrollHeight
      });
    }, true);

    const recordedDepths = new Set();
    let scrollScheduled = false;
    window.addEventListener("scroll", function () {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(function () {
        scrollScheduled = false;
        const root = document.documentElement;
        const percent = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / Math.max(root.scrollHeight, 1)) * 100));
        const milestone = Math.floor(percent / 10) * 10;
        if (milestone >= 10 && !recordedDepths.has(milestone)) {
          recordedDepths.add(milestone);
          recordEvent("scroll_depth", { percent: milestone, page_height: root.scrollHeight });
        }
      });
    }, { passive: true });
  }

  function scrollToOrder() {
    if (!order) return;
    recordEvent("checkout_click");
    order.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () { if (fields[0]) fields[0].focus({ preventScroll: true }); }, 650);
  }

  document.querySelectorAll("button[id^='button-'][id$='_btn']").forEach(function (button) {
    button.type = "button";
    button.addEventListener("click", scrollToOrder);
  });
  const popupTrigger = document.querySelector("#willakane-popup-trigger");
  if (popupTrigger) {
    popupTrigger.addEventListener("click", function (event) {
      event.preventDefault();
      scrollToOrder();
    });
  }

  function setMessage(text, error) {
    if (!body) return;
    let message = body.querySelector(".restored-form-message");
    if (!message) {
      message = document.createElement("p");
      message.className = "restored-form-message";
      message.setAttribute("role", "status");
      message.setAttribute("aria-live", "polite");
      body.insertBefore(message, body.querySelector(".order-form-footer"));
    }
    message.textContent = text;
    message.style.cssText = "margin:10px 0 0;text-align:center;font-size:13px;line-height:1.4;color:" + (error ? "#9f2f22" : "#1b6b3a");
  }

  function fieldIsValid(field) {
    const value = field.value.trim();
    if (!value) return false;
    if (field.name === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (field.name === "phone") return value.replace(/\D/g, "").length >= 8;
    return true;
  }

  function validate(showErrors) {
    let valid = fields.length > 0;
    fields.forEach(function (field) {
      const fieldValid = fieldIsValid(field);
      valid = valid && fieldValid;
      field.setAttribute("aria-invalid", String(!fieldValid));
      if (showErrors || field.dataset.touched) field.style.borderColor = fieldValid ? "" : "#b74432";
    });
    valid = valid && Boolean(terms && terms.checked);
    if (submit) {
      submit.disabled = !valid;
      submit.classList.toggle("disabled", !valid);
      submit.setAttribute("aria-disabled", String(!valid));
    }
    return valid;
  }

  fields.forEach(function (field) {
    field.addEventListener("blur", function () { field.dataset.touched = "true"; validate(false); });
    field.addEventListener("input", function () { validate(false); });
    field.addEventListener("change", function () { validate(false); });
  });
  if (terms) terms.addEventListener("change", function () { validate(false); });

  if (submit) {
    submit.type = "button";
    submit.addEventListener("click", async function () {
      if (!validate(true)) {
        setMessage("Preencha todos os campos e aceite os termos para continuar.", true);
        const invalid = fields.find(function (field) { return !fieldIsValid(field); });
        if (invalid) invalid.focus();
        return;
      }
      submit.disabled = true;
      setMessage("Abrindo o pagamento seguro da Stripe...", false);
      const values = {};
      fields.forEach(function (field) { values[field.name] = field.value.trim(); });
      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.assign({}, values, { session_id: visitorSession }))
        });
        const payload = await response.json();
        if (!response.ok || !payload.url) throw new Error(payload.error || "Não foi possível abrir o checkout.");
        location.assign(payload.url);
      } catch (error) {
        setMessage(error.message || "Não foi possível iniciar o pagamento. Tente novamente.", true);
        submit.disabled = false;
      }
    });
  }
  validate(false);

  const faqItems = Array.from(document.querySelectorAll(".hl-faq-child"));
  function closeFaq(item) {
    const heading = item.querySelector(".hl-faq-child-heading");
    const panel = item.querySelector(".hl-faq-child-panel");
    if (!heading || !panel) return;
    heading.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
    panel.style.height = "0px";
    panel.style.opacity = "0";
    panel.style.paddingTop = "0px";
    panel.style.paddingBottom = "0px";
    item.classList.remove("active");
  }

  faqItems.forEach(function (item, index) {
    const heading = item.querySelector(".hl-faq-child-heading");
    const panel = item.querySelector(".hl-faq-child-panel");
    if (!heading || !panel) return;
    panel.id = "restored-faq-panel-" + index;
    heading.setAttribute("role", "button");
    heading.setAttribute("tabindex", "0");
    heading.setAttribute("aria-controls", panel.id);
    panel.style.overflow = "hidden";
    panel.style.transition = "height .3s ease,opacity .25s ease,padding .3s ease";
    closeFaq(item);

    function toggle() {
      const opening = heading.getAttribute("aria-expanded") !== "true";
      faqItems.forEach(closeFaq);
      if (!opening) return;
      heading.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
      panel.style.paddingTop = "15px";
      panel.style.paddingBottom = "15px";
      panel.style.opacity = "1";
      panel.style.height = panel.scrollHeight + 30 + "px";
      item.classList.add("active");
    }
    heading.addEventListener("click", toggle);
    heading.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); }
    });
  });

  const steps = Array.from(document.querySelectorAll(".willakane-step-item"));
  const progress = document.querySelector("#willakane-glowing-line");
  function selectStep(index) {
    steps.forEach(function (step, stepIndex) {
      step.classList.toggle("active-step", stepIndex === index);
      step.setAttribute("aria-current", stepIndex === index ? "step" : "false");
    });
    if (progress && steps.length > 1) {
      progress.style.width = 10 + (70 * index) / (steps.length - 1) + "%";
      progress.style.transition = "width .45s cubic-bezier(.16,1,.3,1)";
    }
  }
  steps.forEach(function (step, index) {
    step.setAttribute("role", "button");
    step.setAttribute("tabindex", "0");
    step.addEventListener("click", function () { selectStep(index); });
    step.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectStep(index); }
    });
  });
  if (steps.length) selectStep(0);

  function activateTimer(config) {
    const hours = config.hours && document.querySelector(config.hours);
    const minutes = document.querySelector(config.minutes);
    const seconds = document.querySelector(config.seconds);
    if (!minutes || !seconds) return;
    const initialSeconds = Math.max(0,
      (hours ? parseInt(hours.textContent, 10) || 0 : 0) * 3600 +
      (parseInt(minutes.textContent, 10) || 0) * 60 +
      (parseInt(seconds.textContent, 10) || 0)
    );
    const storageKey = config.storageKey;
    let deadline = Number(sessionStorage.getItem(storageKey));
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + initialSeconds * 1000;
      sessionStorage.setItem(storageKey, String(deadline));
    }
    function updateTimer() {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (hours) hours.textContent = String(Math.floor(remaining / 3600)).padStart(2, "0");
      minutes.textContent = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
      seconds.textContent = String(remaining % 60).padStart(2, "0");
      if (!remaining) clearInterval(timerInterval);
    }
    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
  }
  activateTimer({
    minutes: ".wadesfarm-bot-mins-val",
    seconds: ".wadesfarm-bot-secs-val",
    storageKey: "maya-lin-offer-deadline-bottom"
  });
  activateTimer({
    hours: ".willakane-hero-hrs",
    minutes: ".willakane-hero-mins",
    seconds: ".willakane-hero-secs",
    storageKey: "maya-lin-offer-deadline-hero"
  });
})();
