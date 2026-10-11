(() => {
  const copy = {
    en: {
      tagline: "Google Maps shortcut",
      description: "Search the current phrase in Google Maps directly from Google results.",
      languageLabel: "Language",
      autoOption: "Automatic (browser language)",
      supportLink: "Support the project",
      githubLink: "GitHub",
      otherExtensionsTitle: "More of my extensions",
      otherExtensionsDescription: "Discover my other browser tools.",
      timeSpeakDescription: "Speaking time tracker for Google Meet.",
      chromeStoreLink: "Chrome Web Store ↗",
    },
    pl: {
      tagline: "Skrót do Map Google",
      description: "Otwórz bieżące wyszukiwanie w Mapach Google prosto z wyników Google.",
      languageLabel: "Język",
      autoOption: "Automatycznie (język przeglądarki)",
      supportLink: "Wesprzyj projekt",
      githubLink: "GitHub",
      otherExtensionsTitle: "Inne moje wtyczki",
      otherExtensionsDescription: "Poznaj także moje pozostałe narzędzia do przeglądarki.",
      timeSpeakDescription: "Mierz czas wypowiedzi podczas spotkań w Google Meet.",
      chromeStoreLink: "Chrome Web Store ↗",
    },
    de: {
      tagline: "Google-Maps-Verknüpfung",
      description: "Öffne die aktuelle Suche direkt aus den Google-Ergebnissen in Google Maps.",
      languageLabel: "Sprache",
      autoOption: "Automatisch (Browsersprache)",
      supportLink: "Projekt unterstützen",
      githubLink: "GitHub",
      otherExtensionsTitle: "Weitere Erweiterungen von mir",
      otherExtensionsDescription: "Entdecke auch meine anderen Browser-Tools.",
      timeSpeakDescription: "Misst die Redezeit in Google-Meet-Besprechungen.",
      chromeStoreLink: "Chrome Web Store ↗",
    },
    es: {
      tagline: "Acceso directo a Google Maps",
      description: "Abre la búsqueda actual en Google Maps directamente desde los resultados de Google.",
      languageLabel: "Idioma",
      autoOption: "Automático (idioma del navegador)",
      supportLink: "Apoyar el proyecto",
      githubLink: "GitHub",
      otherExtensionsTitle: "Mis otras extensiones",
      otherExtensionsDescription: "Descubre también mis otras herramientas para el navegador.",
      timeSpeakDescription: "Mide el tiempo de habla en reuniones de Google Meet.",
      chromeStoreLink: "Chrome Web Store ↗",
    },
    fr: {
      tagline: "Raccourci vers Google Maps",
      description: "Ouvrez la recherche en cours dans Google Maps depuis les résultats Google.",
      languageLabel: "Langue",
      autoOption: "Automatique (langue du navigateur)",
      supportLink: "Soutenir le projet",
      githubLink: "GitHub",
      otherExtensionsTitle: "Mes autres extensions",
      otherExtensionsDescription: "Découvrez aussi mes autres outils pour le navigateur.",
      timeSpeakDescription: "Mesure le temps de parole lors des réunions Google Meet.",
      chromeStoreLink: "Chrome Web Store ↗",
    },
    ja: {
      tagline: "Google マップのショートカット",
      description: "Google の検索結果から、現在の検索内容を Google マップで直接開きます。",
      languageLabel: "言語",
      autoOption: "自動（ブラウザーの言語）",
      supportLink: "プロジェクトを応援",
      githubLink: "GitHub",
      otherExtensionsTitle: "その他の拡張機能",
      otherExtensionsDescription: "ほかのブラウザーツールもご覧ください。",
      timeSpeakDescription: "Google Meet の会議で発話時間を計測します。",
      chromeStoreLink: "Chrome ウェブストア ↗",
    },
    zh_CN: {
      tagline: "Google 地图快捷入口",
      description: "直接从 Google 搜索结果中在 Google 地图打开当前搜索内容。",
      languageLabel: "语言",
      autoOption: "自动（浏览器语言）",
      supportLink: "支持此项目",
      githubLink: "GitHub",
      otherExtensionsTitle: "我的其他扩展程序",
      otherExtensionsDescription: "也来看看我制作的其他浏览器工具。",
      timeSpeakDescription: "统计 Google Meet 会议中的发言时间。",
      chromeStoreLink: "Chrome 网上应用店 ↗",
    },
  };

  const supportedLanguages = Object.keys(copy);
  const resolveLanguage = (locale) => {
    const normalized = String(locale || "").toLowerCase().replaceAll("_", "-");
    if (normalized.startsWith("zh")) return "zh_CN";
    const language = normalized.split("-")[0];
    return supportedLanguages.includes(language) ? language : "en";
  };
  const browserLanguage = resolveLanguage(chrome.i18n.getUILanguage());
  const languageSelect = document.getElementById("language");

  const render = (preference) => {
    const language = preference === "auto"
      ? browserLanguage
      : (supportedLanguages.includes(preference) ? preference : "en");

    document.documentElement.lang = language === "zh_CN" ? "zh-CN" : language;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = copy[language][element.dataset.i18n];
    });
    languageSelect.value = preference;
  };

  chrome.storage.sync.get({ language: "auto", automaticLanguage: "" }, ({ language, automaticLanguage }) => {
    render(["auto", ...supportedLanguages].includes(language) ? language : "auto");
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
