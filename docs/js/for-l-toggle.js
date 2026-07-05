/* Toggle the private anniversary link in the menu.
   Set SHOW_FOR_L to true right before the anniversary. */
const SHOW_FOR_L = true;

document.addEventListener('DOMContentLoaded', () => {
    const forLMenuItem = document.querySelector('[data-feature="for-l"]');
    if (!forLMenuItem) return;

    forLMenuItem.hidden = !SHOW_FOR_L;
});
