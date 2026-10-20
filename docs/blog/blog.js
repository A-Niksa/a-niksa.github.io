(() => {
const buttons = document.querySelectorAll('[data-language-button]');
const lists = document.querySelectorAll('[data-language-posts]');
const title = document.querySelector('[data-blog-title]');
const intro = document.querySelector('[data-blog-intro]');
const homeLink = document.querySelector('[data-home-link]');
const menuLinks = document.querySelectorAll('[data-menu-key]');
const railIdentity = document.querySelector('.rail-identity');
const railCaption = document.querySelector('.rail-caption');
const railHeading = document.querySelector('.rail-heading');

function showLanguage(language) {
    const fa = language === 'fa';
    const prefix = fa ? '/fa' : '';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.languageButton === language)));
    lists.forEach(list => { list.hidden = list.dataset.languagePosts !== language; });
    document.documentElement.lang = language;
    document.documentElement.dir = fa ? 'rtl' : 'ltr';
    document.title = 'Arsha Niksa | آرشا نیک‌سا';
    if (title) title.textContent = fa ? 'نوشته‌ها' : 'Writing';
    if (intro) intro.textContent = fa ? 'نوشته‌های شخصی به فارسی و یادداشت‌های پژوهشی به انگلیسی.' : 'Research notes in English, personal essays in Persian.';
    if (homeLink) { homeLink.href = fa ? '/fa/' : '/'; homeLink.textContent = fa ? 'آرشا نیک‌سا' : 'Arsha Niksa'; }
    if (railIdentity) { railIdentity.href = prefix + '/'; railIdentity.textContent = fa ? 'آرشا نیک‌سا' : 'Arsha Niksa'; }
    if (railCaption) railCaption.textContent = fa ? 'ریاضیات · علم داده · نوشتن' : 'Mathematics · Data Science · Writing';
    if (railHeading) railHeading.textContent = fa ? 'راهنما' : 'Navigation';
    const labels = fa ? ['خانه', 'پژوهش', 'نوشته‌ها', 'دربارهٔ من'] : ['Home', 'Research', 'Writing', 'About'];
    const hrefs = [prefix + '/', prefix + '/research/', '/blog/?lang=' + language, prefix + '/about/'];
    menuLinks.forEach(link => {
        const i = Number(link.dataset.menuKey);
        link.href = hrefs[i];
        if (link.lastChild && link.lastChild.nodeType === Node.TEXT_NODE) link.lastChild.textContent = labels[i];
    });
    document.querySelectorAll('[data-rail-language],[data-rail-lang-mobile]').forEach(link => {
        const next = fa ? 'en' : 'fa';
        link.href = '/blog/?lang=' + next;
        link.hreflang = next;
        const textNode = link.querySelector('span:first-child');
        if (textNode) textNode.textContent = fa ? 'English' : 'فارسی';
        else if (link.lastChild && link.lastChild.nodeType === Node.TEXT_NODE) link.lastChild.textContent = fa ? 'English' : 'فارسی';
    });
    try { localStorage.setItem('blog-language', language); } catch (_) {}
}

buttons.forEach(button => button.addEventListener('click', () => showLanguage(button.dataset.languageButton)));
const requested = new URLSearchParams(window.location.search).get('lang');
let saved = 'fa';
try { saved = localStorage.getItem('blog-language') || saved; } catch (_) {}
showLanguage(requested === 'fa' || requested === 'en' ? requested : (saved === 'en' ? 'en' : 'fa'));

})();
