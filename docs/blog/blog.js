const buttons = document.querySelectorAll('[data-language-button]');
const lists = document.querySelectorAll('[data-language-posts]');
const title = document.querySelector('[data-blog-title]');
const intro = document.querySelector('[data-blog-intro]');
const homeLink = document.querySelector('[data-home-link]');

function showLanguage(language) {
    const fa = language === 'fa';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.languageButton === language)));
    lists.forEach(list => { list.hidden = list.dataset.languagePosts !== language; });
    document.documentElement.lang = language;
    document.documentElement.dir = fa ? 'rtl' : 'ltr';
    if (title) title.textContent = fa ? 'نوشته‌ها' : 'Writing';
    if (intro) intro.textContent = fa ? 'جستارهای فارسی و یادداشت‌های پژوهشی به انگلیسی.' : 'Research notes in English, personal essays in Persian.';
    if (homeLink) { homeLink.href = fa ? '/fa/' : '/'; homeLink.textContent = fa ? 'آرشا نیکسا' : 'Arsha Niksa'; }
    try { localStorage.setItem('blog-language', language); } catch (_) {}
}

buttons.forEach(button => button.addEventListener('click', () => showLanguage(button.dataset.languageButton)));
const requested = new URLSearchParams(window.location.search).get('lang');
let saved = 'fa';
try { saved = localStorage.getItem('blog-language') || saved; } catch (_) {}
showLanguage(requested === 'fa' || requested === 'en' ? requested : (saved === 'en' ? 'en' : 'fa'));
