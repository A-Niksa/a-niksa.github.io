/* Keep the Blog and private anniversary links visually separate from the main menu.
   Set SHOW_FOR_L to true before the anniversary, or false to hide it. */
const SHOW_FOR_L = false;

const NAV_SHORTCUT_STYLES = `
#sideNav .nav-shortcuts {
    align-items: stretch;
    margin-top: 1.65rem !important;
    padding: 0 1.6rem !important;
}

#sideNav .nav-shortcut {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.7rem;
    border-radius: 999px;
    font-family: "Saira Extra Condensed", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.18em;
    line-height: 1;
    text-transform: uppercase;
    text-decoration: none;
    transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

#sideNav .nav-shortcut--blog {
    color: #0a58ca;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(241, 246, 255, 0.92));
    border: 1px solid rgba(255, 255, 255, 0.72);
    box-shadow: 0 0.55rem 1.4rem rgba(0, 25, 80, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

#sideNav .nav-shortcut--blog::after {
    content: "";
    width: 0.38rem;
    height: 0.38rem;
    margin-left: 0.65rem;
    border-top: 1.5px solid currentColor;
    border-right: 1.5px solid currentColor;
    transform: rotate(45deg);
    transition: transform 180ms ease;
}

#sideNav .nav-shortcut--blog:hover {
    color: #063f98;
    background: #fff;
    border-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0.75rem 1.7rem rgba(0, 25, 80, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
}

#sideNav .nav-shortcut--blog:hover::after {
    transform: translateX(2px) rotate(45deg);
}

#sideNav .nav-shortcut:focus-visible {
    outline: 3px solid rgba(255, 255, 255, 0.68);
    outline-offset: 3px;
}

#sideNav .nav-shortcut--private {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.45);
}

@media (max-width: 991.98px) {
    #sideNav .nav-shortcuts {
        max-width: 14rem;
        margin-top: 1rem !important;
        padding: 0 0.25rem 1rem !important;
    }
}

@media (prefers-reduced-motion: reduce) {
    #sideNav .nav-shortcut,
    #sideNav .nav-shortcut--blog::after {
        transition: none;
    }
}
`;

function injectNavigationShortcutStyles() {
    if (document.getElementById('nav-shortcut-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'nav-shortcut-styles';
    style.textContent = NAV_SHORTCUT_STYLES;
    document.head.appendChild(style);
}

function styleShortcutLink(link, label, modifierClass) {
    link.className = `btn btn-sm nav-shortcut ${modifierClass}`;
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
        shortcuts.className = 'nav-shortcuts d-flex flex-column gap-2 w-100';
        shortcuts.setAttribute('aria-label', 'Additional links');
        menu.insertAdjacentElement('afterend', shortcuts);
    }

    const blogMenuItem = menu.querySelector('a[href="/blog/"]')?.closest('.nav-item');
    if (blogMenuItem) {
        const blogLink = blogMenuItem.querySelector('a');
        styleShortcutLink(blogLink, 'BLOG', 'nav-shortcut--blog');
        shortcuts.appendChild(blogLink);
        blogMenuItem.remove();
    }

    const forLMenuItem = menu.querySelector('[data-feature="for-l"]');
    if (forLMenuItem) {
        const forLLink = forLMenuItem.querySelector('a');
        forLLink.dataset.feature = 'for-l';
        styleShortcutLink(forLLink, 'FOR L', 'nav-shortcut--private');
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
    injectNavigationShortcutStyles();
    setupNavigationShortcuts();
    applyForLToggle();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
    initializeNavigation();
}
