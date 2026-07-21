(function () {
  "use strict";

  let categories = [];
  let posts = [];
  let settings = {};
  let loaded = false;
  const files = { heroDesktop: null, heroMobile: null, postDesktop: null, postMobile: null };

  function el(id) { return document.getElementById(id); }
  function toast(message, error) {
    const box = el("toast"); el("toast-message").textContent = message;
    box.style.backgroundColor = error ? "#CE372E" : "#1B6B3A"; box.classList.add("show");
    setTimeout(function () { box.classList.remove("show"); }, 3500);
  }
  function slugify(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function publicAsset(path) { return window.SUPABASE_CONFIG.url + "/storage/v1/object/public/blog-assets/" + path.split("/").map(encodeURIComponent).join("/"); }
  async function upload(file, prefix) {
    if (!file) return "";
    const extension = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase();
    const path = prefix + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + extension;
    await OfferDB.storage.upload("blog-assets", path, file); return publicAsset(path);
  }
  function preview(input, image, key) {
    input.addEventListener("change", function () {
      files[key] = input.files[0] || null;
      if (files[key]) { image.src = URL.createObjectURL(files[key]); image.classList.add("visible"); }
    });
  }
  function showImage(image, url) { image.src = url || ""; image.classList.toggle("visible", Boolean(url)); }

  async function loadAll() {
    const results = await Promise.all([
      OfferDB.select("blog_categories", "select=*&order=sort_order.asc,name.asc", true),
      OfferDB.select("blog_posts", "select=*&order=updated_at.desc", true),
      OfferDB.select("blog_settings", "select=*&id=eq.main", true)
    ]);
    categories = results[0] || []; posts = results[1] || []; settings = results[2][0] || { id: "main" };
    renderLayout(); renderCategoryOptions(); renderCategories(); renderPosts(); loaded = true;
  }

  function renderLayout() {
    el("blog-site-title").value = settings.title || "Conteúdos de Vovó Tereza";
    el("blog-site-subtitle").value = settings.subtitle || "Informação prática para uma vida mais natural.";
    el("blog-public-url").value = settings.blog_url || (location.origin + "/blog.html");
    el("blog-primary-color").value = settings.primary_color || "#245438";
    el("blog-background-color").value = settings.background_color || "#f7f2e8";
    el("blog-custom-css").value = settings.custom_css || "";
    showImage(el("blog-hero-desktop-preview"), settings.hero_desktop_url);
    showImage(el("blog-hero-mobile-preview"), settings.hero_mobile_url);
    el("blog-open-link").href = settings.blog_url || "/blog.html";
  }

  function categoryName(category) {
    const parent = categories.find(function (item) { return item.id === category.parent_id; });
    return parent ? parent.name + " › " + category.name : category.name;
  }
  function renderCategoryOptions() {
    const postSelect = el("blog-post-category"); const parentSelect = el("blog-category-parent");
    const selectedPost = postSelect.value; const selectedParent = parentSelect.value;
    postSelect.innerHTML = '<option value="">Sem categoria</option>'; parentSelect.innerHTML = '<option value="">Nenhuma — categoria principal</option>';
    categories.forEach(function (category) {
      const option = document.createElement("option"); option.value = category.id; option.textContent = categoryName(category); postSelect.appendChild(option);
      if (!category.parent_id) { const parent = option.cloneNode(true); parentSelect.appendChild(parent); }
    });
    postSelect.value = selectedPost; parentSelect.value = selectedParent;
  }
  function renderCategories() {
    const list = el("blog-category-list"); list.innerHTML = "";
    categories.forEach(function (category) {
      const row = document.createElement("div"); row.className = "blog-category-item";
      const info = document.createElement("div"); const name = document.createElement("strong"); name.textContent = categoryName(category); const slug = document.createElement("div"); slug.style.cssText = "font-size:12px;color:var(--text-muted);margin-top:3px"; slug.textContent = "/blog.html?category=" + category.slug; info.append(name, slug);
      const actions = document.createElement("div");
      const edit = document.createElement("button"); edit.className = "btn-icon-only"; edit.title = "Editar"; edit.innerHTML = '<i class="fa-solid fa-pen"></i>'; edit.addEventListener("click", function () { editCategory(category); });
      const remove = document.createElement("button"); remove.className = "btn-icon-only"; remove.title = "Excluir"; remove.innerHTML = '<i class="fa-solid fa-trash"></i>'; remove.addEventListener("click", function () { deleteCategory(category); }); actions.append(edit, remove); row.append(info, actions); list.appendChild(row);
    });
    if (!categories.length) list.textContent = "Nenhuma categoria criada.";
  }
  function editCategory(category) { el("blog-category-id").value = category.id; el("blog-category-name").value = category.name; el("blog-category-parent").value = category.parent_id || ""; }
  async function saveCategory() {
    const id = el("blog-category-id").value; const name = el("blog-category-name").value.trim(); if (!name) return toast("Informe o nome da categoria.", true);
    const row = { name: name, slug: slugify(name), parent_id: el("blog-category-parent").value || null, active: true, updated_at: new Date().toISOString() };
    if (id) await OfferDB.update("blog_categories", "id=eq." + encodeURIComponent(id), row, true);
    else await OfferDB.insert("blog_categories", [row], true);
    el("blog-category-id").value = ""; el("blog-category-name").value = ""; el("blog-category-parent").value = ""; await loadAll(); toast("Categoria salva.");
  }
  async function deleteCategory(category) {
    if (!confirm("Excluir “" + category.name + "”? As postagens ficarão sem esta categoria.")) return;
    await OfferDB.remove("blog_categories", "id=eq." + encodeURIComponent(category.id), true); await loadAll(); toast("Categoria excluída.");
  }

  function renderPosts() {
    const list = el("blog-post-list"); list.innerHTML = "";
    posts.forEach(function (post) {
      const button = document.createElement("button"); button.className = "blog-list-item"; button.dataset.id = post.id;
      const title = document.createElement("strong"); title.textContent = post.title; const meta = document.createElement("span"); meta.textContent = (post.status === "published" ? "Publicado" : "Rascunho") + " · " + (categories.find(function (item) { return item.id === post.category_id; })?.name || "Sem categoria"); button.append(title, meta); button.addEventListener("click", function () { editPost(post); }); list.appendChild(button);
    });
    if (!posts.length) list.textContent = "Nenhuma postagem criada.";
  }
  function clearPost() {
    ["blog-post-id","blog-post-title","blog-post-slug","blog-post-excerpt","blog-post-content"].forEach(function (id) { el(id).value = ""; });
    el("blog-post-category").value = ""; el("blog-post-status").value = "draft"; el("blog-delete-post").disabled = true;
    files.postDesktop = null; files.postMobile = null; el("blog-post-desktop").value = ""; el("blog-post-mobile").value = ""; showImage(el("blog-post-desktop-preview"), ""); showImage(el("blog-post-mobile-preview"), "");
  }
  function editPost(post) {
    el("blog-post-id").value = post.id; el("blog-post-title").value = post.title; el("blog-post-slug").value = post.slug; el("blog-post-excerpt").value = post.excerpt || ""; el("blog-post-content").value = post.content || ""; el("blog-post-category").value = post.category_id || ""; el("blog-post-status").value = post.status; el("blog-delete-post").disabled = false;
    showImage(el("blog-post-desktop-preview"), post.desktop_image_url); showImage(el("blog-post-mobile-preview"), post.mobile_image_url);
    document.querySelectorAll(".blog-list-item").forEach(function (item) { item.classList.toggle("active", item.dataset.id === post.id); });
  }
  async function savePost() {
    const id = el("blog-post-id").value; const title = el("blog-post-title").value.trim(); if (!title) return toast("Informe o título da postagem.", true);
    const current = posts.find(function (item) { return item.id === id; }) || {};
    const desktop = await upload(files.postDesktop, "posts/desktop") || current.desktop_image_url || "";
    const mobile = await upload(files.postMobile, "posts/mobile") || current.mobile_image_url || desktop;
    const status = el("blog-post-status").value;
    const row = { title: title, slug: slugify(el("blog-post-slug").value || title), excerpt: el("blog-post-excerpt").value.trim(), content: el("blog-post-content").value, category_id: el("blog-post-category").value || null, status: status, desktop_image_url: desktop, mobile_image_url: mobile, published_at: status === "published" ? (current.published_at || new Date().toISOString()) : null, updated_at: new Date().toISOString() };
    if (id) await OfferDB.update("blog_posts", "id=eq." + encodeURIComponent(id), row, true); else await OfferDB.insert("blog_posts", [row], true);
    clearPost(); await loadAll(); toast("Postagem salva.");
  }
  async function deletePost() {
    const id = el("blog-post-id").value; if (!id || !confirm("Excluir esta postagem definitivamente?")) return;
    await OfferDB.remove("blog_posts", "id=eq." + encodeURIComponent(id), true); clearPost(); await loadAll(); toast("Postagem excluída.");
  }
  async function saveLayout() {
    const desktop = await upload(files.heroDesktop, "layout/desktop") || settings.hero_desktop_url || "";
    const mobile = await upload(files.heroMobile, "layout/mobile") || settings.hero_mobile_url || desktop;
    const row = { id: "main", title: el("blog-site-title").value.trim(), subtitle: el("blog-site-subtitle").value.trim(), blog_url: el("blog-public-url").value.trim() || location.origin + "/blog.html", primary_color: el("blog-primary-color").value, background_color: el("blog-background-color").value, hero_desktop_url: desktop, hero_mobile_url: mobile, custom_css: el("blog-custom-css").value, updated_at: new Date().toISOString() };
    await OfferDB.upsert("blog_settings", [row], "id", true); settings = row; renderLayout(); toast("Layout do blog publicado.");
  }
  function openPanel(name) { document.querySelectorAll(".blog-tab").forEach(function (tab) { tab.classList.toggle("active", tab.dataset.blogPanel === name); }); document.querySelectorAll(".blog-panel").forEach(function (panel) { panel.classList.toggle("active", panel.id === "blog-panel-" + name); }); }

  async function initialize() {
    document.querySelectorAll(".blog-tab").forEach(function (tab) { tab.addEventListener("click", function () { openPanel(tab.dataset.blogPanel); }); });
    preview(el("blog-hero-desktop"), el("blog-hero-desktop-preview"), "heroDesktop"); preview(el("blog-hero-mobile"), el("blog-hero-mobile-preview"), "heroMobile"); preview(el("blog-post-desktop"), el("blog-post-desktop-preview"), "postDesktop"); preview(el("blog-post-mobile"), el("blog-post-mobile-preview"), "postMobile");
    el("blog-post-title").addEventListener("input", function () { if (!el("blog-post-id").value) el("blog-post-slug").value = slugify(el("blog-post-title").value); });
    el("blog-save-layout").addEventListener("click", function () { saveLayout().catch(function (error) { toast(error.message, true); }); });
    el("blog-save-category").addEventListener("click", function () { saveCategory().catch(function (error) { toast(error.message, true); }); });
    el("blog-new-post").addEventListener("click", clearPost); el("blog-save-post").addEventListener("click", function () { savePost().catch(function (error) { toast(error.message, true); }); }); el("blog-delete-post").addEventListener("click", function () { deletePost().catch(function (error) { toast(error.message, true); }); });
    document.querySelector('[data-tab="blog"]').addEventListener("click", function () { if (!loaded) loadAll().catch(function (error) { toast("Execute o SQL do blog: " + error.message, true); }); });
  }
  window.addEventListener("DOMContentLoaded", initialize);
})();
