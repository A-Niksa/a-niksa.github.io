const languageButtons = document.querySelectorAll("[data-language-button]");
const postLists = document.querySelectorAll("[data-language-posts]");

function showLanguage(language) {
    languageButtons.forEach((button) => {
        const isActive = button.dataset.languageButton === language;
        button.setAttribute("aria-pressed", String(isActive));
    });

    postLists.forEach((list) => {
        list.hidden = list.dataset.languagePosts !== language;
    });

    document.documentElement.lang = language === "fa" ? "fa" : "en";
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
    localStorage.setItem("blog-language", language);
}

languageButtons.forEach((button) => {
    button.addEventListener("click", () => showLanguage(button.dataset.languageButton));
});

const savedLanguage = localStorage.getItem("blog-language");
showLanguage(savedLanguage === "en" ? "en" : "fa");
