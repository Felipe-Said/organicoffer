(function () {
  "use strict";
  const byId = function (id) { return document.getElementById(id); };
  let categories = [], posts = [], settings = {};
  const siteUrl = "https://receitasdavovotereza.site";
  function categoryName(id) { return categories.find(function (item) { return item.id === id; })?.name || "Sem categoria"; }
  function link(path, label) { const anchor = document.createElement("a"); anchor.href = path; anchor.textContent = label; return anchor; }
  function renderNavigation() {
    const nav = byId("blog-navigation"); nav.innerHTML = ""; nav.appendChild(link("/", "Home"));
    categories.filter(function (item) { return !item.parent_id; }).forEach(function (category) {
      const group = document.createElement("div"); group.className = "blog-nav-group"; group.appendChild(link("/categoria/" + encodeURIComponent(category.slug), category.name));
      const children = categories.filter(function (item) { return item.parent_id === category.id; });
      if (children.length) { const submenu = document.createElement("div"); submenu.className = "blog-nav-submenu"; children.forEach(function (child) { submenu.appendChild(link("/categoria/" + encodeURIComponent(child.slug), child.name)); }); group.appendChild(submenu); }
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
      copy.append(category, heading, excerpt, link("/artigos/" + encodeURIComponent(post.slug), "Ler publicação →")); card.appendChild(copy); grid.appendChild(card);
    });
  }
  function setMeta(selector, attributes, value) {
    let node = document.querySelector(selector);
    if (!node) { node = document.createElement(selector.startsWith("link") ? "link" : "meta"); document.head.appendChild(node); }
    Object.keys(attributes).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    if (value !== undefined) node.setAttribute("content", value);
  }
  function updatePostSeo(post) {
    const url = siteUrl + "/artigos/" + post.slug;
    const title = post.meta_title || post.title;
    const description = post.meta_description || post.excerpt || "Conteúdo educativo de Vovó Tereza.";
    document.title = title + " | Vovó Tereza";
    setMeta('meta[name="description"]', { name: "description" }, description);
    setMeta('meta[property="og:type"]', { property: "og:type" }, "article");
    setMeta('meta[property="og:title"]', { property: "og:title" }, title);
    setMeta('meta[property="og:description"]', { property: "og:description" }, description);
    setMeta('meta[property="og:url"]', { property: "og:url" }, url);
    const canonical = document.querySelector('link[rel="canonical"]'); if (canonical) canonical.href = url;
    let structured = byId("article-structured-data");
    if (!structured) { structured = document.createElement("script"); structured.id = "article-structured-data"; structured.type = "application/ld+json"; document.head.appendChild(structured); }
    structured.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: description, mainEntityOfPage: url, datePublished: post.published_at, dateModified: post.updated_at || post.published_at, author: { "@type": "Organization", name: post.author_name || "Equipe Vovó Tereza" }, publisher: { "@type": "Organization", name: "Vovó Tereza", url: siteUrl }, image: [post.desktop_image_url, post.mobile_image_url].filter(Boolean) });
  }
  function renderPost(post) {
    byId("blog-list-view").hidden = true; byId("blog-empty").hidden = true; const article = byId("blog-article-view"); article.hidden = false; article.innerHTML = "";
    if (post.desktop_image_url || post.mobile_image_url) article.appendChild(picture(post.desktop_image_url, post.mobile_image_url, post.title));
    const header = document.createElement("header"); header.className = "blog-article-header"; const category = document.createElement("span"); category.textContent = categoryName(post.category_id); const title = document.createElement("h1"); title.textContent = post.title; const excerpt = document.createElement("p"); excerpt.textContent = post.excerpt || ""; header.append(category, title, excerpt);
    const content = document.createElement("div"); content.className = "blog-article-content"; content.innerHTML = post.content; article.append(header, content);
    const related = posts.filter(function (item) { return item.id !== post.id && item.category_id === post.category_id; }).slice(0, 3);
    if (related.length) { const section = document.createElement("aside"); section.className = "blog-related"; const heading = document.createElement("h2"); heading.textContent = "Continue lendo"; section.appendChild(heading); related.forEach(function (item) { section.appendChild(link("/artigos/" + encodeURIComponent(item.slug), item.title)); }); article.appendChild(section); }
    updatePostSeo(post);
  }
  function route() {
    const query = new URLSearchParams(location.search), pathParts = location.pathname.split("/").filter(Boolean), postSlug = pathParts[0] === "artigos" ? decodeURIComponent(pathParts.slice(1).join("/")) : query.get("post"), categorySlug = pathParts[0] === "categoria" ? decodeURIComponent(pathParts.slice(1).join("/")) : query.get("category"); const breadcrumb = byId("blog-breadcrumb"); breadcrumb.innerHTML = ""; breadcrumb.appendChild(link("/", "Home"));
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
