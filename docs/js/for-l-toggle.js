/* Keep the Blog and private anniversary links visually separate from the main menu.
   Set SHOW_FOR_L to true before the anniversary, or false to hide it. */
const SHOW_FOR_L = false;

function styleShortcutLink(link, label, buttonClass) {
    link.className = `btn ${buttonClass} btn-sm`;
    link.textContent = label;
    link.setAttribute('role', 'button');
}

function setupNavigationShortcuts() {
    const navigation = document.getElementById('navbarResponsive');
    const menu = navigation?.querySelector('.navbar-nav');

    if (!navigation || !menu) {
        return;
    }

    let shortcuts = navigation.querySelector('.nav-shortcuts');
    if (!shortcuts) {
        shortcuts = document.createElement('div');
        shortcuts.className = 'nav-shortcuts d-flex flex-column gap-2 mt-3 px-3 w-100';
        shortcuts.setAttribute('aria-label', 'Additional links');
        menu.insertAdjacentElement('afterend', shortcuts);
    }

    const blogMenuItem = menu.querySelector('a[href="/blog/"]')?.closest('.nav-item');
    if (blogMenuItem) {
        const blogLink = blogMenuItem.querySelector('a');
        styleShortcutLink(blogLink, 'Blog', 'btn-light');
        shortcuts.appendChild(blogLink);
        blogMenuItem.remove();
    }

    const forLMenuItem = menu.querySelector('[data-feature="for-l"]');
    if (forLMenuItem) {
        const forLLink = forLMenuItem.querySelector('a');
        forLLink.dataset.feature = 'for-l';
        styleShortcutLink(forLLink, 'For L', 'btn-outline-light');
        shortcuts.appendChild(forLLink);
        forLMenuItem.remove();
    }
}

function applyForLToggle() {
    document.querySelectorAll('[data-feature="for-l"]').forEach((forLLink) => {
        forLLink.hidden = !SHOW_FOR_L;
        forLLink.style.display = SHOW_FOR_L ? '' : 'none';
        forLLink.setAttribute('aria-hidden', String(!SHOW_FOR_L));
    });
}

function initializeNavigation() {
    setupNavigationShortcuts();
    applyForLToggle();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
    initializeNavigation();
}
