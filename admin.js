(function () {
  "use strict";

  let orders = [];
  let checkoutLeads = [];
  let customers = [];
  let currentSelectedOrderId = null;
  let deliverySettings = {};
  let selectedEbookFile = null;
  let ebookObjectUrl = "";
  let selectedPageElement = null;
  let pageEditorImageObjectUrl = "";
  let pageEditorStarted = false;
  let pageEditorPath = "/receitas";
  let clarityStarted = false;
  let clarityLoading = false;
  let clarityFrameReady = false;
  let clarityRefreshTimer = null;
  let clarityPeriod = "today";
  let liveVisitorsTimer = null;
  let liveVisitorsLoading = false;

  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const number = new Intl.NumberFormat("pt-BR");
  const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

  function showToast(message, type) {
    const toast = document.getElementById("toast");
    document.getElementById("toast-message").textContent = message;
    toast.style.backgroundColor = type === "error" ? "#CE372E" : "#1B6B3A";
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 3500);
  }

  function statusMeta(status) {
    if (status === "success") return { text: "Entregue", css: "success" };
    if (status === "failed") return { text: "Falhou", css: "failed" };
    if (status === "refunded") return { text: "Reembolsado", css: "failed" };
    return { text: "Pendente", css: "pending" };
  }

  function normalizeOrder(row) {
    return {
      id: row.id,
      number: row.order_number,
      name: row.customer_name,
      email: row.email,
      phone: row.phone || "—",
      addressLine: row.address || "",
      city: row.city || "",
      state: row.state || "",
      country: row.country || "",
      zipcode: row.zipcode || "",
      address: [row.address, row.city, row.state, row.country, row.zipcode].filter(Boolean).join(", ") || "—",
      date: dateTime.format(new Date(row.created_at)),
      createdAt: row.created_at,
      amount: Number(row.amount || 0),
      status: row.status,
      billingType: row.billing_type || "payment",
      stripeCustomerId: row.stripe_customer_id || "",
      stripeSubscriptionId: row.stripe_subscription_id || "",
      subscriptionStatus: row.subscription_status || "",
      sourceType: row.source_type || "direct",
      sourcePlatform: row.source_platform || "direct"
    };
  }

  function emptyRow(tbody, columns, message) {
    tbody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = columns;
    cell.textContent = message;
    cell.style.cssText = "padding:34px;text-align:center;color:var(--text-muted)";
    row.appendChild(cell); tbody.appendChild(row);
  }

  function renderRecentOrders() {
    const tbody = document.querySelector("#recent-orders-table tbody");
    if (!orders.length) return emptyRow(tbody, 3, "Nenhum pedido registrado no banco.");
    tbody.innerHTML = "";
    orders.slice(0, 5).forEach(function (order) {
      const meta = statusMeta(order.status);
      const row = document.createElement("tr");
      row.innerHTML = "<td><div style='font-weight:700'></div><div style='font-size:12px;color:var(--text-muted)'></div></td>" +
        "<td style='font-family:var(--font-numeric);font-weight:700'></td><td><span class='status-badge " + meta.css + "'></span></td>";
      row.cells[0].children[0].textContent = order.name;
      row.cells[0].children[1].textContent = order.email;
      row.cells[1].textContent = money.format(order.amount);
      row.cells[2].querySelector("span").textContent = meta.text;
      tbody.appendChild(row);
    });
  }

  function renderOrdersTable() {
    const tbody = document.querySelector("#orders-table tbody");
    const query = document.getElementById("order-search").value.trim().toLowerCase();
    const filter = document.getElementById("order-status-filter").value;
    const filtered = orders.filter(function (order) {
      return (!query || order.email.toLowerCase().includes(query) || order.name.toLowerCase().includes(query) || order.number.toLowerCase().includes(query)) &&
        (filter === "all" || order.status === filter);
    });
    if (!filtered.length) return emptyRow(tbody, 6, "Nenhum pedido corresponde aos filtros.");
    tbody.innerHTML = "";
    filtered.forEach(function (order) {
      const meta = statusMeta(order.status);
      const row = document.createElement("tr");
      row.innerHTML = "<td style='font-family:var(--font-numeric);font-weight:700;color:var(--color-rust)'></td>" +
        "<td><div style='font-weight:700'></div><div style='font-size:12px;color:var(--text-muted)'></div></td>" +
        "<td></td><td style='font-family:var(--font-numeric);font-weight:700'></td>" +
        "<td><span class='status-badge " + meta.css + "'></span></td><td style='text-align:right'></td>";
      row.cells[0].textContent = order.number;
      row.cells[1].children[0].textContent = order.name;
      row.cells[1].children[1].textContent = order.email;
      row.cells[2].textContent = order.date;
      row.cells[3].textContent = money.format(order.amount);
      row.cells[4].querySelector("span").textContent = meta.text;
      const details = document.createElement("button");
      details.className = "btn-icon-only"; details.title = "Ver detalhes";
      details.innerHTML = '<i class="fa-solid fa-eye"></i>';
      details.addEventListener("click", function () { openOrderDetails(order.id); });
      const resend = document.createElement("button");
      resend.className = "btn-icon-only"; resend.title = "Reenviar e-book";
      resend.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
      resend.disabled = order.status !== "success";
      resend.addEventListener("click", function () { queueEmailDelivery(order.id); });
      row.cells[5].append(details, resend);
      tbody.appendChild(row);
    });
  }

  function buildCustomers() {
    const map = new Map();
    function customerKey(email, phone, sessionId) {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const normalizedPhone = String(phone || "").replace(/\D/g, "");
      return normalizedEmail ? "email:" + normalizedEmail : (normalizedPhone ? "phone:" + normalizedPhone : "session:" + sessionId);
    }
    checkoutLeads.forEach(function (lead) {
      const key = customerKey(lead.email, lead.phone, lead.session_id);
      map.set(key, {
        name: lead.customer_name || "Nome não informado", email: lead.email || "E-mail não informado", phone: lead.phone || "—",
        address: [lead.address, lead.city, lead.state, lead.country, lead.zipcode].filter(Boolean).join(", ") || "—",
        city: lead.city || "", state: lead.state || "", country: lead.country || "", zipcode: lead.zipcode || "",
        purchases: 0, totalSpent: 0, sent: false, lastPurchase: "Nenhuma compra confirmada", subscriptions: [],
        lifecycle: lead.status === "checkout" ? "checkout" : (lead.status === "converted" ? "paid" : "lead"),
        sourceType: lead.source_type || "direct", sourcePlatform: lead.source_platform || "direct",
        lastActivityAt: lead.last_seen_at || lead.first_seen_at
      });
    });
    orders.forEach(function (order) {
      const key = customerKey(order.email, order.phone, order.id);
      const current = map.get(key) || {
        name: order.name, email: order.email, phone: order.phone, address: order.address,
        city: order.city, state: order.state, country: order.country, zipcode: order.zipcode,
        purchases: 0, totalSpent: 0, sent: false, lastPurchase: order.date, subscriptions: [], lifecycle: "checkout",
        sourceType: order.sourceType, sourcePlatform: order.sourcePlatform, lastActivityAt: order.createdAt
      };
      current.name = order.name || current.name; current.email = order.email || current.email; current.phone = order.phone || current.phone;
      current.address = order.address || current.address; current.city = order.city || current.city; current.state = order.state || current.state;
      current.country = order.country || current.country; current.zipcode = order.zipcode || current.zipcode;
      if (order.status === "success") {
        current.purchases += 1; current.totalSpent += order.amount; current.sent = true; current.lifecycle = "paid"; current.lastPurchase = order.date;
      } else if (current.lifecycle !== "paid") {
        current.lifecycle = "checkout";
      }
      if (order.stripeSubscriptionId && !current.subscriptions.some(function (item) { return item.id === order.stripeSubscriptionId; })) {
        current.subscriptions.push({ id: order.stripeSubscriptionId, orderId: order.id, status: order.subscriptionStatus || "active" });
      }
      map.set(key, current);
    });
    customers = Array.from(map.values()).sort(function (a, b) { return new Date(b.lastActivityAt || 0) - new Date(a.lastActivityAt || 0); });
    populateCustomerRegionFilters();
    populateCustomerSourceFilter();
    renderCityRanking();
  }

  function sourceLabel(customer) {
    if (customer.sourceType === "social") return "Rede social: " + customer.sourcePlatform;
    if (customer.sourceType === "blog") return "Blog";
    if (customer.sourceType === "search") return "Busca: " + customer.sourcePlatform;
    if (customer.sourceType === "referral") return "Referência: " + customer.sourcePlatform;
    if (customer.sourceType === "campaign") return "Campanha: " + customer.sourcePlatform;
    return "Acesso direto";
  }

  function populateCustomerSourceFilter() {
    const select = document.getElementById("customer-source-filter"); if (!select) return;
    const selected = select.value;
    const sources = Array.from(new Set(customers.map(function (item) { return item.sourceType + "|" + item.sourcePlatform; }))).sort();
    select.innerHTML = '<option value="all">Todas as origens</option>';
    sources.forEach(function (value) {
      const parts = value.split("|"); const option = document.createElement("option"); option.value = value;
      option.textContent = sourceLabel({ sourceType: parts[0], sourcePlatform: parts.slice(1).join("|") }); select.appendChild(option);
    });
    select.value = sources.includes(selected) ? selected : "all";
  }

  function replaceSelectOptions(select, values, allLabel, selected) {
    select.innerHTML = "";
    const all = document.createElement("option"); all.value = "all"; all.textContent = allLabel; select.appendChild(all);
    values.forEach(function (value) { const option = document.createElement("option"); option.value = value; option.textContent = value; select.appendChild(option); });
    select.value = values.includes(selected) ? selected : "all";
  }

  function populateCustomerRegionFilters() {
    const stateSelect = document.getElementById("customer-state-filter");
    const citySelect = document.getElementById("customer-city-filter");
    if (!stateSelect || !citySelect) return;
    const selectedState = stateSelect.value;
    const selectedCity = citySelect.value;
    const states = Array.from(new Set(customers.map(function (item) { return item.state; }).filter(Boolean))).sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });
    replaceSelectOptions(stateSelect, states, "Todos os estados", selectedState);
    const activeState = stateSelect.value;
    const cities = Array.from(new Set(customers.filter(function (item) { return activeState === "all" || item.state === activeState; }).map(function (item) { return item.city; }).filter(Boolean))).sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });
    replaceSelectOptions(citySelect, cities, "Todas as cidades", selectedCity);
  }

  function addCustomerDetail(parent, label, value) {
    const detail = document.createElement("div"); detail.className = "customer-detail";
    const caption = document.createElement("span"); caption.textContent = label;
    const content = document.createElement("strong"); content.textContent = value || "Não informado";
    detail.append(caption, content); parent.appendChild(detail);
  }

  function subscriptionLabel(status) {
    const labels = { active: "Assinatura ativa", trialing: "Em período de teste", past_due: "Pagamento atrasado", unpaid: "Não paga", canceled: "Assinatura cancelada", incomplete: "Incompleta", incomplete_expired: "Expirada" };
    return labels[status] || status || "Assinatura";
  }

  function canCancelSubscription(status) { return ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(status); }

  function renderCustomersTable() {
    const container = document.getElementById("customer-cards");
    const query = document.getElementById("customer-search").value.trim().toLowerCase();
    const state = document.getElementById("customer-state-filter").value;
    const city = document.getElementById("customer-city-filter").value;
    const lifecycle = document.getElementById("customer-lifecycle-filter").value;
    const source = document.getElementById("customer-source-filter").value;
    const filtered = customers.filter(function (customer) {
      const matchesQuery = !query || customer.email.toLowerCase().includes(query) || customer.name.toLowerCase().includes(query) || customer.phone.toLowerCase().includes(query);
      const customerSource = customer.sourceType + "|" + customer.sourcePlatform;
      return matchesQuery && (state === "all" || customer.state === state) && (city === "all" || customer.city === city) &&
        (lifecycle === "all" || customer.lifecycle === lifecycle) && (source === "all" || customerSource === source);
    });
    container.innerHTML = "";
    if (!filtered.length) { const empty = document.createElement("div"); empty.className = "customer-empty"; empty.textContent = "Nenhum cliente corresponde aos filtros."; container.appendChild(empty); return; }
    filtered.forEach(function (customer) {
      const card = document.createElement("article"); card.className = "customer-card";
      const head = document.createElement("div"); head.className = "customer-card-head";
      const identity = document.createElement("div"); const title = document.createElement("h3"); title.textContent = customer.name; const email = document.createElement("p"); email.textContent = customer.email; identity.append(title, email);
      const lifecycleMeta = customer.lifecycle === "paid" ? { text: customer.purchases + (customer.purchases === 1 ? " compra" : " compras"), css: "success" } :
        (customer.lifecycle === "checkout" ? { text: "Checkout iniciado", css: "pending" } : { text: "Lead sem pagamento", css: "failed" });
      const purchaseBadge = document.createElement("span"); purchaseBadge.className = "status-badge " + lifecycleMeta.css; purchaseBadge.textContent = lifecycleMeta.text; head.append(identity, purchaseBadge);
      const details = document.createElement("div"); details.className = "customer-details";
      addCustomerDetail(details, "Telefone", customer.phone);
      addCustomerDetail(details, "Endereço", customer.address);
      addCustomerDetail(details, "Cidade / Estado", [customer.city, customer.state].filter(Boolean).join(" / "));
      addCustomerDetail(details, "CEP / País", [customer.zipcode, customer.country].filter(Boolean).join(" / "));
      addCustomerDetail(details, "Total confirmado", money.format(customer.totalSpent));
      addCustomerDetail(details, "Última compra", customer.lastPurchase);
      addCustomerDetail(details, "Origem", sourceLabel(customer));
      addCustomerDetail(details, "Última atividade", customer.lastActivityAt ? dateTime.format(new Date(customer.lastActivityAt)) : "Não informado");
      card.append(head, details);
      customer.subscriptions.forEach(function (subscription) {
        const section = document.createElement("div"); section.className = "customer-subscription";
        const badge = document.createElement("span"); badge.className = "status-badge " + (canCancelSubscription(subscription.status) ? "success" : "failed"); badge.textContent = subscriptionLabel(subscription.status); section.appendChild(badge);
        if (canCancelSubscription(subscription.status)) {
          const cancel = document.createElement("button"); cancel.className = "btn btn-secondary btn-sm"; cancel.innerHTML = '<i class="fa-solid fa-ban"></i> Cancelar assinatura';
          cancel.addEventListener("click", function () { cancelCustomerSubscription(subscription.orderId, cancel); }); section.appendChild(cancel);
        }
        card.appendChild(section);
      });
      container.appendChild(card);
    });
  }

  function renderCityRanking() {
    const list = document.getElementById("customer-city-ranking"); if (!list) return;
    const grouped = new Map();
    orders.filter(function (order) { return order.status === "success" && order.city; }).forEach(function (order) {
      const key = order.city + "|" + order.state; const current = grouped.get(key) || { city: order.city, state: order.state, sales: 0, revenue: 0 };
      current.sales += 1; current.revenue += order.amount; grouped.set(key, current);
    });
    const ranking = Array.from(grouped.values()).sort(function (a, b) { return b.sales - a.sales || b.revenue - a.revenue; }).slice(0, 5);
    list.innerHTML = "";
    if (!ranking.length) { const empty = document.createElement("li"); empty.className = "clarity-empty"; empty.textContent = "Ainda não há cidades com compras confirmadas."; list.appendChild(empty); return; }
    ranking.forEach(function (item, index) {
      const row = document.createElement("li"); row.className = "city-ranking-item";
      const position = document.createElement("span"); position.className = "city-ranking-position"; position.textContent = index + 1;
      const place = document.createElement("div"); place.className = "city-ranking-name"; const city = document.createElement("strong"); city.textContent = item.city; const state = document.createElement("span"); state.textContent = item.state || "Estado não informado"; place.append(city, state);
      const total = document.createElement("span"); total.className = "city-ranking-total"; total.textContent = item.sales + (item.sales === 1 ? " compra" : " compras"); row.append(position, place, total); list.appendChild(row);
    });
  }

  async function cancelCustomerSubscription(orderId, button) {
    const order = orders.find(function (item) { return item.id === orderId; });
    if (!order || !order.stripeSubscriptionId || !window.confirm("Cancelar esta assinatura imediatamente na Stripe? O cliente não receberá novas cobranças.")) return;
    const original = button.innerHTML; button.disabled = true; button.textContent = "Cancelando...";
    try {
      const token = await OfferDB.auth.accessToken();
      const response = await fetch("/api/cancel-subscription", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ order_id: orderId }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Não foi possível cancelar a assinatura.");
      orders.forEach(function (item) { if (item.stripeSubscriptionId === order.stripeSubscriptionId) item.subscriptionStatus = payload.subscription_status || "canceled"; });
      buildCustomers(); renderCustomersTable(); showToast("Assinatura cancelada na Stripe.");
    } catch (error) { button.disabled = false; button.innerHTML = original; showToast(error.message, "error"); }
  }

  async function queueEmailDelivery(orderId) {
    try {
      await OfferDB.insert("email_delivery_jobs", [{ order_id: orderId }], true);
      showToast("Reenvio adicionado à fila do banco.");
    } catch (error) { showToast(error.message, "error"); }
  }

  function openOrderDetails(orderId) {
    const order = orders.find(function (item) { return item.id === orderId; });
    if (!order) return;
    currentSelectedOrderId = orderId;
    document.getElementById("modal-order-id").textContent = "Detalhes do pedido " + order.number;
    document.getElementById("modal-client-name").textContent = order.name;
    document.getElementById("modal-client-email").textContent = order.email;
    document.getElementById("modal-order-date").textContent = order.date;
    document.getElementById("modal-order-total").textContent = money.format(order.amount);
    document.getElementById("btn-modal-resend").disabled = order.status !== "success";
    document.getElementById("order-modal").classList.add("show");
  }

  function closeModal() { document.getElementById("order-modal").classList.remove("show"); }
  function queueResendFromModal() { if (currentSelectedOrderId) queueEmailDelivery(currentSelectedOrderId); }

  async function loadOrders() {
    const results = await Promise.all([
      OfferDB.select("orders", "select=*&order=created_at.desc&limit=1000", true),
      OfferDB.select("checkout_leads", "select=*&order=last_seen_at.desc&limit=1000", true)
    ]);
    orders = results[0].map(normalizeOrder); checkoutLeads = results[1]; buildCustomers(); renderRecentOrders(); renderOrdersTable(); renderCustomersTable();
  }

  function updateChart(points) {
    const values = points.map(function (point) { return Number(point.revenue || 0); });
    const maximum = Math.max.apply(null, values.concat([1]));
    const coordinates = values.map(function (value, index) {
      return { x: 10 + index * 90, y: 205 - (value / maximum) * 165 };
    });
    const line = coordinates.map(function (point, index) { return (index ? "L " : "M ") + point.x + " " + point.y; }).join(" ");
    document.querySelector(".chart-line").setAttribute("d", line);
    document.querySelector(".chart-area").setAttribute("d", line + " L 550 205 L 10 205 Z");
    document.querySelectorAll(".chart-point").forEach(function (circle, index) {
      const point = coordinates[index]; circle.setAttribute("cx", point.x); circle.setAttribute("cy", point.y);
      circle.setAttribute("title", money.format(values[index]));
    });
  }

  async function loadMetrics() {
    const metricsRows = await OfferDB.rpc("admin_dashboard_metrics", {}, true);
    const metrics = metricsRows[0] || {};
    document.getElementById("stat-revenue").textContent = money.format(Number(metrics.total_revenue || 0));
    document.getElementById("stat-sales").textContent = number.format(Number(metrics.total_sales || 0));
    document.getElementById("stat-conversion").textContent = Number(metrics.conversion_rate || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%";
    document.getElementById("stat-checkout-clicks").textContent = number.format(Number(metrics.checkout_clicks || 0));
    document.querySelectorAll(".metric-trend").forEach(function (trend) { trend.textContent = "Dados consolidados do banco"; });
    const sales = await OfferDB.rpc("admin_sales_last_7_days", {}, true);
    updateChart(sales);
  }

  async function loadLiveVisitors() {
    if (liveVisitorsLoading || document.visibilityState !== "visible") return;
    liveVisitorsLoading = true;
    try {
      const token = await OfferDB.auth.accessToken();
      const response = await fetch("/api/live-visitors", { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Falha ao consultar visitantes.");
      document.getElementById("live-counter").textContent = number.format(Number(payload.visitors || 0));
    } catch (_) {
      document.getElementById("live-counter").textContent = "—";
    } finally { liveVisitorsLoading = false; }
  }

  function startLiveVisitors() {
    if (liveVisitorsTimer) return;
    loadLiveVisitors();
    liveVisitorsTimer = setInterval(loadLiveVisitors, 1000);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") loadLiveVisitors(); });
  }

  async function loadProductsForm() {
    const rows = await OfferDB.select("offers", "select=*&order=sort_order.asc", true);
    [1, 2, 3].forEach(function (index) {
      const offer = rows.find(function (row) { return row.slug === "recipe-" + index; });
      if (!offer) return;
      document.getElementById("recipe" + index + "-title").value = offer.title;
      document.getElementById("recipe" + index + "-price").value = offer.price;
      document.getElementById("recipe" + index + "-desc").value = offer.description;
    });
    const bundle = rows.find(function (row) { return row.slug === "bundle"; });
    if (bundle) document.getElementById("input-bundle-price").value = bundle.price;
  }

  async function saveProductsForm() {
    const rows = [1, 2, 3].map(function (index) {
      return {
        slug: "recipe-" + index,
        title: document.getElementById("recipe" + index + "-title").value.trim(),
        price: Number(document.getElementById("recipe" + index + "-price").value),
        description: document.getElementById("recipe" + index + "-desc").value.trim(),
        sort_order: index, active: true, updated_at: new Date().toISOString()
      };
    });
    rows.push({ slug: "bundle", title: "Livro completo de Remédios Antigos", description: "As três coleções reunidas em um e-book.", price: Number(document.getElementById("input-bundle-price").value), sort_order: 4, active: true, updated_at: new Date().toISOString() });
    try { await OfferDB.upsert("offers", rows, "slug", true); showToast("Ofertas salvas no banco."); await loadMetrics(); }
    catch (error) { showToast(error.message, "error"); }
  }

  async function loadSettings() {
    const rows = await OfferDB.select("app_settings", "select=*&key=eq.funnel", true);
    const value = rows[0] ? rows[0].value : {};
    document.getElementById("setting-webhook").value = value.webhook_url || "";
    document.getElementById("setting-email-provider").value = value.email_provider || "leadconnector";
    document.getElementById("setting-email-sender").value = value.email_sender || "";
  }

  async function saveSettings() {
    const row = { key: "funnel", value: {
      webhook_url: document.getElementById("setting-webhook").value.trim(),
      email_provider: document.getElementById("setting-email-provider").value,
      email_sender: document.getElementById("setting-email-sender").value.trim()
    }, updated_at: new Date().toISOString() };
    try { await OfferDB.upsert("app_settings", [row], "key", true); showToast("Configurações salvas no banco."); }
    catch (error) { showToast(error.message, "error"); }
  }

  async function loadGatewaySettings() {
    const rows = await OfferDB.select("app_settings", "select=*&key=eq.payment_gateway", true);
    const value = rows[0] ? rows[0].value : {};
    document.getElementById("gateway-provider").value = value.provider || "stripe";
    document.getElementById("gateway-mode").value = value.checkout_mode || "payment";
    document.getElementById("gateway-subscription-interval").value = value.subscription_interval || "month";
    document.getElementById("gateway-external-url").value = value.external_url || "";
    updateGatewayFormVisibility();
  }

  function updateGatewayFormVisibility() {
    const external = document.getElementById("gateway-provider").value === "external";
    document.getElementById("gateway-mode-group").hidden = external;
    document.getElementById("gateway-stripe-options").hidden = external;
    document.getElementById("gateway-stripe-security").hidden = external;
    document.getElementById("gateway-stripe-checker").hidden = external;
    document.getElementById("gateway-external-options").hidden = !external;
  }

  async function saveGatewaySettings() {
    const button = document.getElementById("save-gateway-button");
    const mode = document.getElementById("gateway-mode").value;
    const provider = document.getElementById("gateway-provider").value;
    const externalUrl = document.getElementById("gateway-external-url").value.trim();
    if (provider === "external" && !/^https:\/\/[^\s]+$/i.test(externalUrl)) {
      showToast("Informe um link externo completo, começando com https://.", "error");
      document.getElementById("gateway-external-url").focus(); return;
    }
    const row = { key: "payment_gateway", value: {
      provider: provider,
      checkout_mode: mode,
      currency: "brl",
      subscription_interval: document.getElementById("gateway-subscription-interval").value,
      external_url: externalUrl
    }, updated_at: new Date().toISOString() };
    button.disabled = true;
    try { await OfferDB.upsert("app_settings", [row], "key", true); showToast(provider === "external" ? "Venda externa salva no banco." : "Gateway Stripe salvo no banco."); }
    catch (error) { showToast(error.message, "error"); }
    finally { button.disabled = false; }
  }

  function renderGatewayHealth(payload) {
    const summary = document.getElementById("gateway-health-summary");
    const list = document.getElementById("gateway-check-list");
    const state = payload.ready ? (payload.receiving_sales ? "ok" : "warning") : "error";
    const icon = state === "ok" ? "fa-circle-check" : state === "warning" ? "fa-triangle-exclamation" : "fa-circle-xmark";
    summary.className = "gateway-health-summary visible " + state;
    summary.innerHTML = "<i class=\"fa-solid " + icon + "\"></i><span></span>";
    summary.querySelector("span").textContent = payload.summary;
    list.replaceChildren();
    (payload.checks || []).forEach(function (check) {
      const item = document.createElement("li");
      item.className = "gateway-check-item " + check.status;
      const checkIcon = check.status === "ok" ? "fa-circle-check" : check.status === "warning" ? "fa-triangle-exclamation" : "fa-circle-xmark";
      item.innerHTML = "<i class=\"fa-solid " + checkIcon + "\"></i><strong></strong><span></span>";
      item.querySelector("strong").textContent = check.label;
      item.querySelector("span").textContent = check.detail;
      list.appendChild(item);
    });
  }

  async function checkGatewayHealth() {
    const button = document.getElementById("check-gateway-button");
    const summary = document.getElementById("gateway-health-summary");
    const list = document.getElementById("gateway-check-list");
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> Verificando';
    summary.className = "gateway-health-summary";
    list.innerHTML = '<li class="gateway-check-item"><i class="fa-solid fa-stethoscope" style="color:var(--color-rust)"></i><strong>Executando diagnóstico</strong><span class="gateway-check-skeleton"></span></li>';
    try {
      const token = await OfferDB.auth.accessToken();
      const response = await fetch("/api/gateway-health", { headers: { Authorization: "Bearer " + token, Accept: "application/json" } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível verificar o gateway.");
      renderGatewayHealth(payload);
    } catch (error) {
      renderGatewayHealth({ ready: false, receiving_sales: false, summary: "O diagnóstico não pôde ser concluído.", checks: [{ label: "Falha na verificação", status: "error", detail: error.message }] });
    } finally {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verificar novamente';
    }
  }

  function renderEbookPreview(url, fileName, fileSize) {
    const preview = document.getElementById("ebook-preview");
    const empty = document.getElementById("ebook-empty");
    const meta = document.getElementById("ebook-file-meta");
    const hasStoredEbook = Boolean(deliverySettings.storage_path);
    const selectButton = document.getElementById("select-ebook-button");
    const deleteButton = document.getElementById("delete-ebook-button");
    selectButton.innerHTML = hasStoredEbook ? '<i class="fa-solid fa-rotate"></i> Trocar PDF' : '<i class="fa-solid fa-file-arrow-up"></i> Selecionar PDF';
    deleteButton.hidden = !hasStoredEbook;
    if (!url) {
      preview.removeAttribute("data"); preview.classList.remove("visible"); empty.style.display = "grid"; meta.textContent = ""; return;
    }
    preview.data = url + (url.includes("#") ? "" : "#page=1&view=FitH");
    preview.classList.add("visible"); empty.style.display = "none";
    const size = fileSize ? " · " + (fileSize / 1024 / 1024).toFixed(2).replace(".", ",") + " MB" : "";
    meta.textContent = (fileName || "E-book configurado") + size;
  }

  function chooseEbookFile() {
    document.getElementById("ebook-file").click();
  }

  function setDeliveryStatus(message, type) {
    const status = document.getElementById("ebook-upload-status");
    status.textContent = message || "";
    status.className = "field-status" + (type ? " " + type : "");
  }

  async function loadDeliverySettings() {
    const rows = await OfferDB.select("app_settings", "select=*&key=eq.delivery", true);
    deliverySettings = rows[0] ? rows[0].value : {};
    if (deliverySettings.storage_path) {
      try {
        const url = await OfferDB.storage.signedUrl("ebooks", deliverySettings.storage_path, 3600);
        renderEbookPreview(url, deliverySettings.file_name, deliverySettings.file_size);
      } catch (error) { setDeliveryStatus("Não foi possível carregar a capa: " + error.message, "error"); }
    } else renderEbookPreview("", "", 0);
  }

  function selectEbookFile(event) {
    const file = event.target.files && event.target.files[0];
    selectedEbookFile = null;
    if (!file) return;
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
      event.target.value = ""; setDeliveryStatus("Selecione um arquivo PDF.", "error"); return;
    }
    if (file.size > 28 * 1024 * 1024) {
      event.target.value = ""; setDeliveryStatus("O PDF deve ter no máximo 28 MB.", "error"); return;
    }
    selectedEbookFile = file;
    if (ebookObjectUrl) URL.revokeObjectURL(ebookObjectUrl);
    ebookObjectUrl = URL.createObjectURL(file);
    renderEbookPreview(ebookObjectUrl, file.name, file.size);
    setDeliveryStatus("Arquivo pronto para upload.");
  }

  async function saveDeliverySettings() {
    const button = document.getElementById("save-delivery-button");
    if (!selectedEbookFile && !deliverySettings.storage_path) return setDeliveryStatus("Selecione o PDF que será enviado.", "error");
    button.disabled = true;
    setDeliveryStatus(selectedEbookFile ? "Enviando o PDF com segurança..." : "Salvando configurações...");
    try {
      if (selectedEbookFile) {
        await OfferDB.storage.upload("ebooks", "delivery/ebook.pdf", selectedEbookFile);
        deliverySettings.storage_path = "delivery/ebook.pdf";
        deliverySettings.file_name = selectedEbookFile.name;
        deliverySettings.file_size = selectedEbookFile.size;
      }
      deliverySettings = Object.assign({}, deliverySettings, {
        provider: "download"
      });
      await OfferDB.upsert("app_settings", [{ key: "delivery", value: deliverySettings, updated_at: new Date().toISOString() }], "key", true);
      selectedEbookFile = null;
      document.getElementById("ebook-file").value = "";
      await loadDeliverySettings();
      setDeliveryStatus("E-book e configurações salvos.", "success");
      showToast("Entrega automática configurada.");
    } catch (error) { setDeliveryStatus(error.message, "error"); showToast(error.message, "error"); }
    finally { button.disabled = false; }
  }

  async function deleteCurrentEbook() {
    if (!deliverySettings.storage_path) return;
    if (!window.confirm("Apagar o PDF atual? Clientes não poderão baixá-lo até que um novo arquivo seja enviado.")) return;
    const button = document.getElementById("delete-ebook-button");
    const path = deliverySettings.storage_path;
    button.disabled = true;
    setDeliveryStatus("Apagando o PDF atual...");
    try {
      await OfferDB.storage.remove("ebooks", path);
      deliverySettings = { provider: "download", storage_path: "", file_name: "", file_size: 0 };
      await OfferDB.upsert("app_settings", [{ key: "delivery", value: deliverySettings, updated_at: new Date().toISOString() }], "key", true);
      selectedEbookFile = null;
      document.getElementById("ebook-file").value = "";
      if (ebookObjectUrl) { URL.revokeObjectURL(ebookObjectUrl); ebookObjectUrl = ""; }
      renderEbookPreview("", "", 0);
      setDeliveryStatus("PDF apagado. Envie um novo arquivo antes de vender.", "success");
      showToast("PDF atual removido.");
    } catch (error) { setDeliveryStatus(error.message, "error"); showToast(error.message, "error"); }
    finally { button.disabled = false; }
  }

  function pageElementSelector(element, root) {
    if (element.dataset.editorKey) return '[data-editor-key="' + CSS.escape(element.dataset.editorKey) + '"]';
    if (element.id) return "#" + CSS.escape(element.id);
    const parts = [];
    let current = element;
    while (current && current !== root.body && current !== root.documentElement) {
      if (current.id) { parts.unshift("#" + CSS.escape(current.id)); break; }
      const parent = current.parentElement;
      if (!parent) break;
      const sameTag = Array.from(parent.children).filter(function (child) { return child.tagName === current.tagName; });
      parts.unshift(current.tagName.toLowerCase() + (sameTag.length > 1 ? ":nth-of-type(" + (sameTag.indexOf(current) + 1) + ")" : ""));
      current = parent;
    }
    return parts.join(" > ");
  }

  function setPageEditorStatus(message, type) {
    const status = document.getElementById("page-editor-status");
    status.textContent = message || "";
    status.className = "field-status" + (type ? " " + type : "");
  }

  function normalizedPageImage(file) {
    if (!file) throw new Error("Selecione a nova imagem.");
    if (file.size > 8 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 8 MB.");
    const extension = (file.name.split(".").pop() || "").toLowerCase();
    const mimeByExtension = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", avif: "image/avif", svg: "image/svg+xml" };
    const mime = mimeByExtension[extension];
    if (!mime) throw new Error("Formato não aceito. Use PNG, JPG, JPEG, WebP, GIF, AVIF ou SVG.");
    if (file.type && file.type !== mime) throw new Error("O conteúdo do arquivo não corresponde ao formato " + extension.toUpperCase() + ".");
    return file.type === mime ? file : new File([file], file.name, { type: mime });
  }

  function previewPageImageFile() {
    try {
      const file = normalizedPageImage(document.getElementById("page-editor-image").files[0]);
      if (pageEditorImageObjectUrl) URL.revokeObjectURL(pageEditorImageObjectUrl);
      pageEditorImageObjectUrl = URL.createObjectURL(file);
      document.getElementById("page-editor-image-preview").src = pageEditorImageObjectUrl;
      setPageEditorStatus("Prévia carregada. Clique em Publicar para salvar.", "success");
    } catch (error) { setPageEditorStatus(error.message, "error"); }
  }

  function verifyPublishedImage(url) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = resolve;
      image.onerror = function () { reject(new Error("O upload terminou, mas a imagem pública não pôde ser carregada.")); };
      image.src = url;
    });
  }

  function pageColorHex(color) {
    const match = String(color || "").match(/\d+/g);
    if (!match || match.length < 3) return "#c2521a";
    return "#" + match.slice(0, 3).map(function (part) { return Number(part).toString(16).padStart(2, "0"); }).join("");
  }

  function previewPageElementColor() {
    if (!selectedPageElement || selectedPageElement.type !== "style" || !selectedPageElement.element) return;
    selectedPageElement.element.style.setProperty("background-color", document.getElementById("page-editor-color").value, "important");
  }

  function selectPageElement(element, frameDocument) {
    if (!element || /^(HTML|BODY|SCRIPT|STYLE|SVG|PATH|IFRAME|FORM|INPUT|SELECT|TEXTAREA)$/.test(element.tagName)) return;
    const isImage = element.tagName === "IMG";
    const isCheckoutButton = element.matches(".container-order-form-two-step .form-btn");
    const selector = pageElementSelector(element, frameDocument);
    selectedPageElement = {
      selector: selector,
      storageSelector: isCheckoutButton ? "style::" + selector : (pageEditorPath === "/termos.html" ? "legal::" : "") + selector,
      type: isCheckoutButton ? "style" : (isImage ? "image" : "text"),
      value: isCheckoutButton ? pageColorHex(frameDocument.defaultView.getComputedStyle(element).backgroundColor) : (isImage ? element.currentSrc || element.src : element.textContent.trim()),
      element: element
    };
    document.getElementById("page-editor-empty").hidden = true;
    document.getElementById("page-editor-form").hidden = false;
    document.getElementById("page-editor-selector").textContent = selectedPageElement.selector;
    document.getElementById("page-editor-text-fields").hidden = isImage || isCheckoutButton;
    document.getElementById("page-editor-image-fields").hidden = !isImage;
    document.getElementById("page-editor-color-fields").hidden = !isCheckoutButton;
    if (isImage) document.getElementById("page-editor-image-preview").src = selectedPageElement.value;
    else if (isCheckoutButton) document.getElementById("page-editor-color").value = selectedPageElement.value;
    else document.getElementById("page-editor-value").value = selectedPageElement.value;
    document.getElementById("page-editor-image").value = "";
    setPageEditorStatus("");
  }

  function installEditorSelection(frame) {
    const frameDocument = frame.contentDocument;
    if (!frameDocument) return;
    const editorElementQuery = "img,span,strong,em,p,h1,h2,h3,h4,h5,h6,a,li,label,small";
    const counters = new Map();
    frameDocument.querySelectorAll(editorElementQuery).forEach(function (element) {
      if (element.dataset.editorKey) return;
      const owner = element.closest("[id]");
      const ownerKey = owner ? owner.id : "document";
      const ordinal = counters.get(ownerKey) || 0;
      counters.set(ownerKey, ordinal + 1);
      element.dataset.editorKey = ownerKey + "::" + ordinal;
    });
    const style = frameDocument.createElement("style");
    style.textContent = "[data-admin-edit-hover]{outline:3px solid #c2521a!important;outline-offset:2px!important;cursor:pointer!important}";
    frameDocument.head.appendChild(style);
    let hovered = null;
    frameDocument.addEventListener("mouseover", function (event) {
      const target = event.target.closest(".container-order-form-two-step .form-btn") || event.target.closest("img,span,strong,em,p,h1,h2,h3,h4,h5,h6,a,li,label,small");
      if (hovered) hovered.removeAttribute("data-admin-edit-hover");
      hovered = target;
      if (hovered) hovered.setAttribute("data-admin-edit-hover", "true");
    }, true);
    frameDocument.addEventListener("click", function (event) {
      const target = event.target.closest(".container-order-form-two-step .form-btn") || event.target.closest("img,span,strong,em,p,h1,h2,h3,h4,h5,h6,a,li,label,small");
      if (!target) return;
      event.preventDefault(); event.stopPropagation();
      selectPageElement(target, frameDocument);
    }, true);
  }

  function reloadPagePreview() {
    const frame = document.getElementById("page-editor-frame");
    frame.onload = function () {
      installEditorSelection(frame);
      const updatePreviewStatus = function (detail) {
        if (detail && detail.status === "error") setPageEditorStatus("A página não conseguiu carregar as alterações: " + detail.message, "error");
      };
      frame.contentWindow.addEventListener("managed-content-status", function (event) { updatePreviewStatus(event.detail); });
      const root = frame.contentDocument.documentElement;
      if (root.dataset.managedContentStatus) updatePreviewStatus({ status: root.dataset.managedContentStatus, message: root.dataset.managedContentDetail });
    };
    frame.src = pageEditorPath + (pageEditorPath.includes("?") ? "&" : "?") + "admin_preview=editor&refresh=" + Date.now();
    pageEditorStarted = true;
  }

  function changePageEditorSource(value) {
    pageEditorPath = value === "/termos.html" ? value : "/receitas";
    selectedPageElement = null;
    document.getElementById("page-editor-form").hidden = true;
    document.getElementById("page-editor-empty").hidden = false;
    reloadPagePreview();
  }

  async function savePageElement() {
    if (!selectedPageElement) return;
    const button = document.getElementById("save-page-element");
    button.disabled = true;
    setPageEditorStatus("Publicando alteração...");
    try {
      let value;
      if (selectedPageElement.type === "style") {
        value = document.getElementById("page-editor-color").value;
      } else if (selectedPageElement.type === "image") {
        const file = normalizedPageImage(document.getElementById("page-editor-image").files[0]);
        const extension = (file.name.split(".").pop() || "webp").toLowerCase().replace(/[^a-z0-9]/g, "");
        let hash = 0;
        for (let index = 0; index < selectedPageElement.storageSelector.length; index += 1) hash = ((hash << 5) - hash + selectedPageElement.storageSelector.charCodeAt(index)) | 0;
        const path = "page/asset-" + Math.abs(hash) + "-" + Date.now() + "." + extension;
        await OfferDB.storage.upload("page-assets", path, file);
        value = window.SUPABASE_CONFIG.url + "/storage/v1/object/public/page-assets/" + path;
        await verifyPublishedImage(value);
      } else {
        value = document.getElementById("page-editor-value").value.trim();
        if (!value) throw new Error("O texto não pode ficar vazio.");
      }
      const databaseType = selectedPageElement.type === "style" ? "text" : selectedPageElement.type;
      await OfferDB.upsert("page_content", [{ selector: selectedPageElement.storageSelector, content_type: databaseType, value: value, updated_at: new Date().toISOString() }], "selector", true);
      const verification = await OfferDB.select("page_content", "select=selector,content_type,value&selector=eq." + encodeURIComponent(selectedPageElement.storageSelector), true);
      if (!verification.length || verification[0].value !== value || verification[0].content_type !== databaseType) throw new Error("A alteração foi enviada, mas o banco não confirmou o conteúdo publicado.");
      setPageEditorStatus("Alteração salva e confirmada no banco.", "success");
      showToast("Conteúdo publicado e verificado.");
      reloadPagePreview();
    } catch (error) { setPageEditorStatus(error.message, "error"); showToast(error.message, "error"); }
    finally { button.disabled = false; }
  }

  async function resetPageElement() {
    if (!selectedPageElement || !window.confirm("Restaurar este elemento ao conteúdo original da página?")) return;
    try {
      await OfferDB.remove("page_content", "selector=eq." + encodeURIComponent(selectedPageElement.storageSelector), true);
      showToast("Conteúdo original restaurado.");
      selectedPageElement = null;
      document.getElementById("page-editor-form").hidden = true;
      document.getElementById("page-editor-empty").hidden = false;
      reloadPagePreview();
    } catch (error) { showToast(error.message, "error"); }
  }

  function renderHeatmap(frame, events) {
    const frameDocument = frame.contentDocument;
    if (!frameDocument) return;
    const oldLayer = frameDocument.getElementById("admin-heatmap-layer");
    if (oldLayer) oldLayer.remove();
    const layer = frameDocument.createElement("div");
    layer.id = "admin-heatmap-layer";
    layer.style.cssText = "position:absolute;inset:0 0 auto 0;height:" + frameDocument.documentElement.scrollHeight + "px;pointer-events:none;z-index:2147483000;overflow:hidden";
    const clicks = events.filter(function (event) { return event.event_type === "click" && event.event_data; });
    const depthCounts = new Map();
    events.filter(function (event) { return event.event_type === "scroll_depth" && event.event_data; }).forEach(function (event) {
      const depth = Number(event.event_data.percent || 0);
      depthCounts.set(depth, (depthCounts.get(depth) || 0) + 1);
    });
    const maximumDepthCount = Math.max(1, ...depthCounts.values());
    depthCounts.forEach(function (count, depth) {
      const band = frameDocument.createElement("div");
      const opacity = .05 + (count / maximumDepthCount) * .14;
      band.style.cssText = "position:absolute;left:0;right:0;height:10%;top:" + Math.max(0, depth - 10) + "%;background:linear-gradient(90deg,rgba(194,82,26," + opacity + "),rgba(234,168,59," + (opacity * .55) + "),transparent 78%);border-bottom:1px solid rgba(194,82,26,.18)";
      layer.appendChild(band);
    });
    clicks.forEach(function (event) {
      const data = event.event_data;
      const dot = frameDocument.createElement("i");
      dot.style.cssText = "position:absolute;width:30px;height:30px;border-radius:50%;transform:translate(-50%,-50%);background:rgba(207,61,39,.42);border:2px solid rgba(207,61,39,.78);box-shadow:0 0 0 9px rgba(234,168,59,.18);left:" + (Number(data.x_ratio || 0) * 100) + "%;top:" + (Number(data.y_ratio || 0) * 100) + "%";
      layer.appendChild(dot);
    });
    frameDocument.body.appendChild(layer);
    document.getElementById("clarity-empty").hidden = clicks.length > 0;
  }

  function clarityPeriodStart() {
    const now = new Date();
    if (clarityPeriod === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    const durations = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };
    return new Date(now.getTime() - (durations[clarityPeriod] || 1) * 86400000);
  }

  function stopClarityRealtime() {
    if (clarityRefreshTimer) clearInterval(clarityRefreshTimer);
    clarityRefreshTimer = null;
  }

  function startClarityRealtime() {
    stopClarityRealtime();
    loadClarityData();
    clarityRefreshTimer = setInterval(function () {
      if (document.getElementById("page-panel-clarity").classList.contains("active")) loadClarityData();
    }, 10000);
  }

  function changeClarityPeriod(value) {
    clarityPeriod = ["today", "24h", "7d", "30d", "90d"].includes(value) ? value : "today";
    clarityFrameReady = false;
    startClarityRealtime();
  }

  async function loadClarityData() {
    if (clarityLoading) return;
    clarityLoading = true;
    const frame = document.getElementById("clarity-frame");
    const liveDot = document.getElementById("clarity-live-dot");
    liveDot.classList.add("loading");
    try {
      const since = clarityPeriodStart().toISOString();
      const events = await OfferDB.select("site_events", "select=session_id,event_type,event_data,created_at&event_type=in.(page_view,click,scroll_depth)&created_at=gte." + encodeURIComponent(since) + "&order=created_at.desc&limit=5000", true);
      const clicks = events.filter(function (event) { return event.event_type === "click"; });
      const scrolls = events.filter(function (event) { return event.event_type === "scroll_depth"; });
      const sessions = new Set(events.map(function (event) { return event.session_id; }));
      const sessionDepths = new Map();
      scrolls.forEach(function (event) {
        const depth = Number(event.event_data && event.event_data.percent || 0);
        sessionDepths.set(event.session_id, Math.max(sessionDepths.get(event.session_id) || 0, depth));
      });
      const average = sessionDepths.size ? Math.round(Array.from(sessionDepths.values()).reduce(function (sum, depth) { return sum + depth; }, 0) / sessionDepths.size) : 0;
      document.getElementById("clarity-click-count").textContent = number.format(clicks.length);
      document.getElementById("clarity-scroll-average").textContent = average + "%";
      document.getElementById("clarity-session-count").textContent = number.format(sessions.size);
      document.getElementById("clarity-last-update").textContent = "Atualizado às " + new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date());
      if (!clarityFrameReady || !frame.contentDocument || !frame.contentDocument.body) {
        frame.onload = function () {
          clarityFrameReady = true;
          setTimeout(function () { renderHeatmap(frame, events); }, 250);
        };
        frame.src = "/receitas?admin_preview=clarity&refresh=" + Date.now();
      } else renderHeatmap(frame, events);
      clarityStarted = true;
    } catch (error) {
      document.getElementById("clarity-last-update").textContent = "Falha na atualização";
      showToast("Não foi possível carregar o mapa: " + error.message, "error");
    } finally {
      clarityLoading = false;
      liveDot.classList.remove("loading");
    }
  }

  function openPagePanel(panel) {
    document.querySelectorAll("[data-page-panel]").forEach(function (control) { control.classList.toggle("active", control.dataset.pagePanel === panel); });
    document.querySelectorAll(".page-workspace-panel").forEach(function (element) { element.classList.toggle("active", element.id === "page-panel-" + panel); });
    if (panel === "editor") {
      stopClarityRealtime();
      if (!pageEditorStarted) reloadPagePreview();
    }
    if (panel === "clarity") startClarityRealtime();
  }

  function switchTab(tabId) {
    if (tabId !== "page") stopClarityRealtime();
    document.querySelectorAll(".menu-item").forEach(function (item) { item.classList.toggle("active", item.dataset.tab === tabId); });
    document.querySelectorAll(".tab-content").forEach(function (tab) { tab.classList.toggle("active", tab.id === "tab-" + tabId); });
    const titles = { dashboard: "Visão Geral", orders: "Pedidos & Vendas", products: "Produtos & Ofertas", customers: "Gerenciamento de Clientes", gateways: "Gateways de Pagamento", delivery: "Envio do E-book", page: "Página", blog: "Blog", settings: "Configurações do Funil" };
    document.getElementById("page-title-text").textContent = titles[tabId] || "Painel";
    document.querySelector(".menu-parent").classList.toggle("open", tabId === "page");
    if (tabId === "page") openPagePanel("editor");
    document.getElementById("sidebar").classList.remove("open");
  }

  async function verifyAdmin() {
    if (!OfferDB.configured()) { location.replace("login.html?config=missing"); return null; }
    const session = await OfferDB.auth.getSession();
    if (!session || !session.user) { location.replace("login.html"); return null; }
    const profiles = await OfferDB.select("admin_profiles", "select=user_id,email&user_id=eq." + encodeURIComponent(session.user.id), true);
    if (!profiles.length) { await OfferDB.auth.signOut(); location.replace("login.html?error=unauthorized"); return null; }
    document.querySelector(".admin-profile span").textContent = profiles[0].email;
    document.querySelector(".avatar").textContent = "VT";
    return session;
  }

  async function initialize() {
    try {
      const session = await verifyAdmin(); if (!session) return;
      document.querySelectorAll(".menu-item").forEach(function (item) { item.addEventListener("click", function () { switchTab(item.dataset.tab); }); });
      document.querySelectorAll("[data-page-panel]").forEach(function (control) { control.addEventListener("click", function (event) { event.stopPropagation(); switchTab("page"); openPagePanel(control.dataset.pagePanel); }); });
      document.getElementById("menu-toggle").addEventListener("click", function () { document.getElementById("sidebar").classList.add("open"); });
      document.getElementById("order-search").addEventListener("input", renderOrdersTable);
      document.getElementById("order-status-filter").addEventListener("change", renderOrdersTable);
      document.getElementById("customer-search").addEventListener("input", renderCustomersTable);
      document.getElementById("customer-state-filter").addEventListener("change", function () { populateCustomerRegionFilters(); renderCustomersTable(); });
      document.getElementById("customer-city-filter").addEventListener("change", renderCustomersTable);
      document.getElementById("customer-lifecycle-filter").addEventListener("change", renderCustomersTable);
      document.getElementById("customer-source-filter").addEventListener("change", renderCustomersTable);
      document.getElementById("gateway-provider").addEventListener("change", updateGatewayFormVisibility);
      document.getElementById("ebook-file").addEventListener("change", selectEbookFile);
      document.getElementById("page-editor-image").addEventListener("change", previewPageImageFile);
      document.getElementById("page-editor-color").addEventListener("input", previewPageElementColor);
      startLiveVisitors();
      await Promise.all([loadOrders(), loadMetrics(), loadProductsForm(), loadSettings(), loadGatewaySettings(), loadDeliverySettings()]);
    } catch (error) { showToast(error.message, "error"); }
  }

  window.switchTab = switchTab;
  window.saveProductsForm = saveProductsForm;
  window.resetProductsForm = loadProductsForm;
  window.saveSettings = saveSettings;
  window.saveGatewaySettings = saveGatewaySettings;
  window.checkGatewayHealth = checkGatewayHealth;
  window.saveDeliverySettings = saveDeliverySettings;
  window.chooseEbookFile = chooseEbookFile;
  window.deleteCurrentEbook = deleteCurrentEbook;
  window.reloadPagePreview = reloadPagePreview;
  window.changePageEditorSource = changePageEditorSource;
  window.savePageElement = savePageElement;
  window.resetPageElement = resetPageElement;
  window.loadClarityData = loadClarityData;
  window.changeClarityPeriod = changeClarityPeriod;
  window.closeModal = closeModal;
  window.queueResendFromModal = queueResendFromModal;
  window.logoutAdmin = async function () { await OfferDB.auth.signOut(); location.replace("login.html"); };
  window.addEventListener("DOMContentLoaded", initialize);
})();
