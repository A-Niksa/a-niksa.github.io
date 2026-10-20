/* Static-site client navigation: real URLs, accessible history, safe fallback. */
(() => {
  "use strict";
  if (window.__aniksaNavigation) return;
  window.__aniksaNavigation = true;
  const CONTENT = ".site-content";
  const fetchCache = new Map();
  let controller = null;
  let generation = 0;
  let activeKey = location.pathname + location.search;
  history.replaceState({ ...(history.state || {}), scrollY: window.scrollY }, "", location.href);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const normalized = url => url.pathname + url.search;
  const shouldHandle = (a, event) => {
    if (!a || (event && (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey))) return false;
    if (a.hasAttribute("download") || (a.target && a.target !== "_self") || a.dataset.noSpa !== undefined) return false;
    const url = new URL(a.href, location.href);
    return url.origin === location.origin && /^https?:$/.test(url.protocol) && !url.pathname.startsWith("/assets/") && !/\.(pdf|xml|txt|ico|svg|jpg|jpeg|png|webp)$/i.test(url.pathname);
  };
  const safeFetch = async (url, signal) => {
    const key = normalized(url);
    if (fetchCache.has(key)) return fetchCache.get(key);
    const response = await fetch(url.href, { signal, headers: { "Accept": "text/html" }, credentials: "same-origin" });
    if (!response.ok || !(response.headers.get("content-type") || "").includes("text/html")) throw new Error("HTML unavailable");
    const html = await response.text();
    if (!html.includes("site-content")) throw new Error("Incompatible page");
    return html;
  };
  const syncHead = next => {
    document.title = 'Arsha Niksa | آرشا نیک‌سا';
    document.documentElement.lang = next.documentElement.lang;
    document.documentElement.dir = next.documentElement.dir;
    const dynamicSelectors = [
      'meta[name="description"]', 'meta[name="theme-color"]',
      'link[rel="canonical"]', 'link[rel="alternate"]',
      'meta[property^="og:"]', 'meta[name^="twitter:"]',
      'script[type="application/ld+json"]'
    ];
    for (const selector of dynamicSelectors) {
      document.head.querySelectorAll(selector).forEach(n => n.remove());
      next.head.querySelectorAll(selector).forEach(n => document.head.append(n.cloneNode(true)));
    }
    // Keep one consistent, cache-busted icon even on older article pages.
    document.head.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="alternate icon"]').forEach(n => n.remove());
    for (const [rel, type, href] of [['icon', 'image/svg+xml', '/assets/img/favicon-v3.svg?v=3'], ['shortcut icon', 'image/x-icon', '/assets/img/favicon.ico?v=3']]) {
      const icon = document.createElement('link');
      icon.rel = rel;
      icon.type = type;
      icon.href = href;
      document.head.append(icon);
    }
    document.head.querySelectorAll("[data-page-style]").forEach(n => n.remove());
    const anchor = document.head.querySelector('link[href="/css/refined.css"]');
    const pageBase = next.querySelector('link[rel="canonical"]')?.href || location.href;
    const links = [...next.head.querySelectorAll('link[rel="stylesheet"]')]
      .filter(link => !new URL(link.getAttribute('href'), pageBase).pathname.endsWith("/css/refined.css"));
    for (const link of links) {
      const clone = link.cloneNode(true);
      clone.dataset.pageStyle = "1";
      clone.href = new URL(link.getAttribute('href'), pageBase).href;
      if (anchor) anchor.before(clone); else document.head.append(clone);
    }
    next.head.querySelectorAll("style").forEach(style => {
      const clone = style.cloneNode(true);
      clone.dataset.pageStyle = "1";
      document.head.append(clone);
    });
  };
  const loadPageScripts = async next => {
    const scripts = [...next.querySelectorAll('script[src]')];
    const onBlogIndex = scripts.some(s => new URL(s.getAttribute("src"), next.querySelector('link[rel="canonical"]')?.href || location.href).pathname.endsWith("/blog/blog.js"));
    if (onBlogIndex) {
      // Run once per replacement, with fresh references to the new buttons.
      const old = document.getElementById("blog-index-script");
      old?.remove();
      const s = document.createElement("script");
      s.id = "blog-index-script";
      s.src = "/blog/blog.js";
      document.body.append(s);
    }
    if (scripts.some(s => /mathjax/i.test(s.src))) {
      if (!window.MathJax) {
        window.MathJax = { tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']] }, options: { skipHtmlTags: ['script','noscript','style','textarea','pre','code'] } };
      }
      if (window.MathJax.typesetPromise) await window.MathJax.typesetPromise([document.querySelector(CONTENT)]);
      else await new Promise(resolve => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
        s.onload = resolve;
        s.onerror = resolve;
        document.head.append(s);
      });
      if (window.MathJax?.typesetPromise) await window.MathJax.typesetPromise([document.querySelector(CONTENT)]);
    }
  };
  async function navigate(target, { push = true, restoreY = null } = {}) {
    const url = new URL(target, location.href);
    const destination = normalized(url);
    if (activeKey === destination) {
      if (url.hash) document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
      return;
    }
    const sequence = ++generation;
    controller?.abort();
    controller = new AbortController();
    try {
      if (push) history.replaceState({ ...(history.state || {}), scrollY: window.scrollY }, "", location.href);
      const html = await safeFetch(url, controller.signal);
      if (sequence !== generation) return;
      const next = new DOMParser().parseFromString(html, "text/html");
      const nextContent = next.querySelector(CONTENT);
      if (!nextContent) throw new Error("Missing page content");
      const render = () => {
        syncHead(next);
        document.querySelector(".site-rail")?.replaceWith(next.querySelector(".site-rail").cloneNode(true));
        document.querySelector(CONTENT).replaceWith(nextContent);
        document.body.className = next.body.className;
      };
      if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        await document.startViewTransition(render).finished;
      } else render();
      if (push) history.pushState({ scrollY: 0 }, "", url.href);
      activeKey = destination;
      const hash = url.hash ? decodeURIComponent(url.hash.slice(1)) : "";
      if (hash) document.getElementById(hash)?.scrollIntoView();
      else window.scrollTo({ top: restoreY ?? 0, behavior: "instant" });
      try { await loadPageScripts(next); } catch (err) { console.warn("Page enhancement unavailable", err); }
    } catch (err) {
      if (err.name === "AbortError" || sequence !== generation) return;
      // The site remains navigable even with disabled scripts, failed fetches or CSP errors.
      location.assign(url.href);
    }
  }
  document.addEventListener("click", event => {
    const a = event.target.closest?.("a[href]");
    if (!shouldHandle(a, event)) return;
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.search === location.search) return;
    event.preventDefault();
    navigate(url.href);
  });
  document.addEventListener("mouseover", event => {
    const a = event.target.closest?.("a[href]");
    if (!shouldHandle(a)) return;
    const url = new URL(a.href, location.href);
    if (fetchCache.has(normalized(url))) return;
    // Prefetch at most on deliberate hover; failures do not disrupt ordinary links.
    safeFetch(url).then(html => fetchCache.set(normalized(url), html)).catch(() => {});
  }, { passive: true });
  window.addEventListener("popstate", e => navigate(location.href, { push: false, restoreY: e.state?.scrollY ?? 0 }));
})();
