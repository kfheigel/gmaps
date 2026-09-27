(() => {
  const copy = {
    en: {
      tagline: "Google Maps shortcut",
      description: "Search the current phrase in Google Maps directly from Google results.",
      languageLabel: "Language",
      autoOption: "Automatic (browser language)",
      polishOption: "Polski",
      englishOption: "English",
      supportLink: "Support the project",
      githubLink: "GitHub",
    },
    pl: {
      tagline: "Skrót do Map Google",
      description: "Otwórz bieżące wyszukiwanie w Mapach Google prosto z wyników Google.",
      languageLabel: "Język",
      autoOption: "Automatycznie (język przeglądarki)",
      polishOption: "Polski",
      englishOption: "English",
      supportLink: "Wesprzyj projekt",
      githubLink: "GitHub",
    },
  };

  const browserLanguage = chrome.i18n.getUILanguage().toLowerCase().startsWith("pl") ? "pl" : "en";
  const languageSelect = document.getElementById("language");

  const render = (preference) => {
    const language = preference === "auto"
      ? (browserLanguage.startsWith("pl") ? "pl" : "en")
      : preference;

    document.documentElement.lang = language;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = copy[language][element.dataset.i18n];
    });
    languageSelect.value = preference;
  };

  chrome.storage.sync.get({ language: "auto", automaticLanguage: "" }, ({ language, automaticLanguage }) => {
    render(["auto", "pl", "en"].includes(language) ? language : "auto");
    if (automaticLanguage !== browserLanguage) {
      chrome.storage.sync.set({ automaticLanguage: browserLanguage });
    }
  });

  languageSelect.addEventListener("change", () => {
    const language = languageSelect.value;
    render(language);
    chrome.storage.sync.set({ language, automaticLanguage: browserLanguage });
  });

  document.getElementById("version").textContent = `v${chrome.runtime.getManifest().version}`;
})();
