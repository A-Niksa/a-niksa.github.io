/* Toggle the private anniversary link in the menu.
   Set SHOW_FOR_L to true before the anniversary, or false to hide it. */
const SHOW_FOR_L = true;

function applyForLToggle() {
    document.querySelectorAll('[data-feature="for-l"]').forEach((forLMenuItem) => {
        forLMenuItem.hidden = !SHOW_FOR_L;
        forLMenuItem.style.display = SHOW_FOR_L ? '' : 'none';
        forLMenuItem.setAttribute('aria-hidden', String(!SHOW_FOR_L));
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyForLToggle);
} else {
    applyForLToggle();
}
