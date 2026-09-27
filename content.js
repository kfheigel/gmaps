(() => {
  let languagePreference = "auto";
  let automaticLanguage = "";

  const mapsUrl = (query) => {
    const url = new URL("https://www.google.com/maps/search/");
    url.searchParams.set("api", "1");
    url.searchParams.set("query", query);
    return url.href;
  };

  const getSearchInput = () =>
    document.querySelector('textarea[name="q"], input[name="q"], textarea.gLFyf');

  const getMapsLabel = () => {
    if (languagePreference === "pl") return "Mapa";
    if (languagePreference === "en") return "Map";

    const language = document.documentElement.lang.toLowerCase();
    const requestedLanguage = new URL(window.location.href).searchParams.get("hl")?.toLowerCase();
    return language.startsWith("pl") || requestedLanguage?.startsWith("pl") ||
      automaticLanguage === "pl" ? "Mapa" : "Map";
  };

  const getCurrentQuery = () => {
    const input = getSearchInput();
    if (input) return input.value.trim();

    return new URL(window.location.href).searchParams.get("q")?.trim() ?? "";
  };

  const tabLabel = (link) => [link.textContent, link.getAttribute("aria-label"), link.title]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
  };

  const findNavigation = () => {
    // Google removes href from the currently selected tab, so include all anchors.
    const links = [...document.querySelectorAll("a")]
      .filter((link) => link.id !== "gmapps-maps-shortcut" && isInViewport(link));
    const imageTab = links.find((link) => /[?&](tbm=isch|udm=2)(?:&|$)/i.test(link.href)) ??
      links.find((link) => /\b(images?|grafika|obrazy)\b/i.test(tabLabel(link)));
    if (!imageTab) return null;

    let tabBar = imageTab.parentElement;
    while (tabBar && tabBar !== document.body) {
      const visibleLinks = [...tabBar.querySelectorAll("a")]
        .filter(isInViewport);
      const allTab = visibleLinks.find((link) =>
        /\b(all|wszystko|wszystkie)\b/i.test(tabLabel(link)));
      if (allTab) {
        return { tabBar, allTab, imageTab };
      }
      tabBar = tabBar.parentElement;
    }
    return null;
  };

  const getRowItem = (element, tabBar) => {
    let item = element;
    while (item.parentElement && item.parentElement !== tabBar) {
      item = item.parentElement;
    }
    return item.parentElement === tabBar ? item : null;
  };

  const setLinkLabel = (link, label) => {
    const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();
    let labelSet = false;
    while (textNode) {
      if (textNode.nodeValue.trim()) {
        if (!labelSet) {
          textNode.nodeValue = label;
          labelSet = true;
        } else {
          textNode.nodeValue = "";
        }
      }
      textNode = walker.nextNode();
    }
    if (!labelSet) link.textContent = label;
    link.setAttribute("aria-label", label);
    link.title = label;
  };

  const makeShortcutItem = (templateLink, label, tabBar) => {
    const item = getRowItem(templateLink, tabBar);
    const clone = (item ?? templateLink).cloneNode(true);
    const clonedElements = [clone, ...clone.querySelectorAll("*")];
    clonedElements.forEach((element) => {
      element.removeAttribute("id");
      element.removeAttribute("aria-current");
      element.removeAttribute("aria-selected");
      element.classList.forEach((className) => {
        if (/msel|selected|active/i.test(className)) element.classList.remove(className);
      });
    });

    const link = clone.matches?.("a") ? clone : clone.querySelector("a");
    if (!link) return null;

    link.id = "gmapps-maps-shortcut";
    link.removeAttribute("aria-current");
    link.removeAttribute("aria-selected");
    link.removeAttribute("tabindex");
    setLinkLabel(link, label);
    link.addEventListener("click", (event) => {
      const query = getCurrentQuery();
      if (!query) return;
      event.preventDefault();
      window.location.assign(mapsUrl(query));
    });
    return { item: clone, link };
  };

  const ensureMapsShortcut = () => {
    const navigation = findNavigation();
    if (!navigation) return false;
    const { tabBar, allTab, imageTab } = navigation;
    const allItem = getRowItem(allTab, tabBar);
    if (!allItem) return false;

    let link = document.getElementById("gmapps-maps-shortcut");
    if (!link) {
      const otherTabs = [...tabBar.querySelectorAll('a[href]')]
        .filter((candidate) => candidate !== allTab && candidate !== imageTab && isInViewport(candidate));
      const templateLink = otherTabs.find((candidate) => {
        const item = getRowItem(candidate, tabBar);
        return !candidate.matches('[aria-current], [aria-selected="true"]') &&
          !item?.matches('[aria-current], [aria-selected="true"], [class*="msel"]');
      }) ?? otherTabs[0];
      if (!templateLink) return false;
      const shortcut = makeShortcutItem(templateLink, getMapsLabel(), tabBar);
      if (!shortcut) return false;
      link = shortcut.link;
      allItem.after(shortcut.item);
    } else {
      setLinkLabel(link, getMapsLabel());
      const shortcutItem = getRowItem(link, tabBar) ?? link;
      if (shortcutItem !== allItem.nextElementSibling) allItem.after(shortcutItem);
    }

    const nextUrl = mapsUrl(getCurrentQuery());
    if (link.href !== nextUrl) link.href = nextUrl;
    return true;
  };

  let scheduled = false;
  const scheduleShortcutUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      ensureMapsShortcut();
    });
  };

  document.addEventListener("input", (event) => {
    if (event.target.matches('textarea[name="q"], input[name="q"], textarea.gLFyf')) {
      scheduleShortcutUpdate();
    }
  }, true);

  window.addEventListener("popstate", scheduleShortcutUpdate);
  window.addEventListener("pageshow", scheduleShortcutUpdate);

  const observer = new MutationObserver(scheduleShortcutUpdate);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  try {
    chrome.storage.sync.get({ language: "auto", automaticLanguage: "" }, (settings) => {
      languagePreference = settings.language;
      automaticLanguage = settings.automaticLanguage;
      scheduleShortcutUpdate();
    });
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync") {
        if (changes.language) languagePreference = changes.language.newValue ?? "auto";
        if (changes.automaticLanguage) automaticLanguage = changes.automaticLanguage.newValue ?? "";
        scheduleShortcutUpdate();
      }
    });
  } catch {
    // Ignore stale content scripts when Chrome reloads the extension.
  }

  scheduleShortcutUpdate();
})();
