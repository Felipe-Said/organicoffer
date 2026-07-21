(function () {
  "use strict";
  const byId = function (id) { return document.getElementById(id); };
  let categories = [], posts = [], settings = {};
  function categoryName(id) { return categories.find(function (item) { return item.id === id; })?.name || "Sem categoria"; }
  function link(path, label) { const anchor = document.createElement("a"); anchor.href = path; anchor.textContent = label; return anchor; }
  function renderNavigation() {
    const nav = byId("blog-navigation"); nav.innerHTML = ""; nav.appendChild(link("/blog.html", "Home"));
    categories.filter(function (item) { return !item.parent_id; }).forEach(function (category) {
      const group = document.createElement("div"); group.className = "blog-nav-group"; group.appendChild(link("/blog.html?category=" + encodeURIComponent(category.slug), category.name));
      const children = categories.filter(function (item) { return item.parent_id === category.id; });
      if (children.length) { const submenu = document.createElement("div"); submenu.className = "blog-nav-submenu"; children.forEach(function (child) { submenu.appendChild(link("/blog.html?category=" + encodeURIComponent(child.slug), child.name)); }); group.appendChild(submenu); }
      nav.appendChild(group);
    });
  }
  function picture(desktop, mobile, alt) {
    const element = document.createElement("picture");
    if (mobile) { const source = document.createElement("source"); source.media = "(max-width:700px)"; source.srcset = mobile; element.appendChild(source); }
    const image = document.createElement("img"); image.src = desktop || mobile || ""; image.alt = alt || ""; image.loading = "lazy"; element.appendChild(image); return element;
  }
  function renderCards(list, title) {
    byId("blog-list-title").textContent = title || "Novos conteúdos"; const grid = byId("blog-post-grid"); grid.innerHTML = ""; byId("blog-list-view").hidden = false; byId("blog-article-view").hidden = true; byId("blog-empty").hidden = Boolean(list.length);
    list.forEach(function (post) {
      const card = document.createElement("article"); card.className = "blog-card"; if (post.desktop_image_url || post.mobile_image_url) card.appendChild(picture(post.desktop_image_url, post.mobile_image_url, post.title));
      const copy = document.createElement("div"); copy.className = "blog-card-copy"; const category = document.createElement("span"); category.className = "blog-card-category"; category.textContent = categoryName(post.category_id); const heading = document.createElement("h3"); heading.textContent = post.title; const excerpt = document.createElement("p"); excerpt.textContent = post.excerpt || "";
      copy.append(category, heading, excerpt, link("/blog.html?post=" + encodeURIComponent(post.slug), "Ler publicação →")); card.appendChild(copy); grid.appendChild(card);
    });
  }
  function renderPost(post) {
    byId("blog-list-view").hidden = true; byId("blog-empty").hidden = true; const article = byId("blog-article-view"); article.hidden = false; article.innerHTML = "";
    if (post.desktop_image_url || post.mobile_image_url) article.appendChild(picture(post.desktop_image_url, post.mobile_image_url, post.title));
    const header = document.createElement("header"); header.className = "blog-article-header"; const category = document.createElement("span"); category.textContent = categoryName(post.category_id); const title = document.createElement("h1"); title.textContent = post.title; const excerpt = document.createElement("p"); excerpt.textContent = post.excerpt || ""; header.append(category, title, excerpt);
    const content = document.createElement("div"); content.className = "blog-article-content"; content.innerHTML = post.content; article.append(header, content); document.title = post.title + " | " + (settings.title || "Vovó Tereza");
  }
  function route() {
    const query = new URLSearchParams(location.search), postSlug = query.get("post"), categorySlug = query.get("category"); const breadcrumb = byId("blog-breadcrumb"); breadcrumb.innerHTML = ""; breadcrumb.appendChild(link("/blog.html", "Home"));
    if (postSlug) { const post = posts.find(function (item) { return item.slug === postSlug; }); if (!post) return renderCards([], "Publicação não encontrada"); breadcrumb.append(" / " + post.title); return renderPost(post); }
    if (categorySlug) { const selected = categories.find(function (item) { return item.slug === categorySlug; }); if (!selected) return renderCards([], "Categoria não encontrada"); breadcrumb.append(" / " + selected.name); const ids = [selected.id].concat(categories.filter(function (item) { return item.parent_id === selected.id; }).map(function (item) { return item.id; })); return renderCards(posts.filter(function (post) { return ids.includes(post.category_id); }), selected.name); }
    renderCards(posts, "Novos conteúdos");
  }
  async function initialize() {
    if (!window.OfferDB || !OfferDB.configured()) return renderCards([], "Blog temporariamente indisponível");
    const result = await Promise.all([OfferDB.select("blog_categories", "select=*&active=eq.true&order=sort_order.asc,name.asc", false), OfferDB.select("blog_posts", "select=*&status=eq.published&order=published_at.desc", false), OfferDB.select("blog_settings", "select=*&id=eq.main", false)]);
    categories = result[0] || []; posts = result[1] || []; settings = result[2][0] || {}; document.documentElement.style.setProperty("--blog-primary", settings.primary_color || "#245438"); document.documentElement.style.setProperty("--blog-bg", settings.background_color || "#f7f2e8"); byId("blog-custom-style").textContent = settings.custom_css || ""; byId("blog-title").textContent = settings.title || "Conteúdos de Vovó Tereza"; byId("blog-subtitle").textContent = settings.subtitle || "";
    if (settings.hero_desktop_url) { byId("blog-hero-image").src = settings.hero_desktop_url; byId("blog-hero-image").alt = settings.title || "Blog"; } if (settings.hero_mobile_url) byId("blog-hero-mobile-source").srcset = settings.hero_mobile_url; renderNavigation(); route();
  }
  byId("blog-menu-toggle").addEventListener("click", function () { const nav = byId("blog-navigation"); nav.classList.toggle("open"); this.setAttribute("aria-expanded", nav.classList.contains("open")); });
  initialize().catch(function () { renderCards([], "Não foi possível carregar o blog"); });
})();
