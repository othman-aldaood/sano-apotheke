document.addEventListener("DOMContentLoaded", function () {
  // --- Intro & Outro Animations ---
  const preloader = document.getElementById("preloader");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Intro: Preloader ausblenden, sobald das HTML bereit ist
  // (nicht erst nach allen Bildern – sonst wartet der Besucher unnötig lange).
  function hidePreloader() {
    if (preloader) {
      preloader.classList.add("hidden");
    }
  }
  setTimeout(hidePreloader, prefersReducedMotion ? 0 : 300);
  // Sicherheitsnetz, falls etwas hängt
  window.addEventListener("load", hidePreloader);

  // Outro
  const internalLinks = document.querySelectorAll(
    'a[href^="impressum.html"], a[href^="#"]'
  );
  internalLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Nur für Links zur Impressum-Seite, nicht für Anker-Links
      if (href.includes("impressum.html")) {
        e.preventDefault();
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = href;
        }, 400); // Muss zur CSS-Transition-Dauer passen
      }
    });
  });

  // --- Keyboard (Typewriter) Effect ---
  let typewriterTimer = null;
  function typewriter(element) {
    if (!element) return;
    const text = element.getAttribute("data-lang-text") || element.textContent;
    // Screenreader lesen den vollständigen Text, nicht Buchstabe für Buchstabe
    element.setAttribute("aria-label", text);

    // Bei "Bewegung reduzieren" kein Tipp-Effekt
    if (prefersReducedMotion) {
      element.textContent = text;
      return;
    }

    clearTimeout(typewriterTimer); // Laufenden Effekt beim Sprachwechsel stoppen
    element.textContent = ""; // Leert den Inhalt zu Beginn
    element.classList.add("typing-cursor");
    let i = 0;

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        typewriterTimer = setTimeout(type, 70); // Geschwindigkeit des Tippens
      } else {
        element.classList.remove("typing-cursor"); // Cursor entfernen
      }
    }
    type();
  }

  // --- Scroll Animations (Intersection Observer) ---
  const animatedElements = document.querySelectorAll(".animated-element");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    animatedElements.forEach((element) => element.classList.add("visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Animation startet, wenn 10% des Elements sichtbar sind
      }
    );

    animatedElements.forEach((element) => {
      observer.observe(element);
    });
  }

  // --- Sprach-Logik ---
  let translations = {};

  async function loadTranslations() {
    try {
      const response = await fetch("translations.json");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      translations = await response.json();
      const savedLang = localStorage.getItem("selectedLanguage") || "de";
      applyLanguage(savedLang);
    } catch (error) {
      console.error("Could not load translations:", error);
    }
  }

  function applyLanguage(lang) {
    if (!translations[lang]) {
      console.error(`Language '${lang}' not found.`);
      return;
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-lang]").forEach((element) => {
      const key = element.getAttribute("data-lang");
      if (translations[lang][key]) {
        const newText = translations[lang][key];
        // Speichern des neuen Textes für den Typewriter-Effekt
        element.setAttribute("data-lang-text", newText);
        element.innerHTML = newText;
      }
    });

    // Meta-Tags (z. B. Beschreibung) mitübersetzen
    document.querySelectorAll("[data-lang-meta]").forEach((element) => {
      const key = element.getAttribute("data-lang-meta");
      if (translations[lang][key]) {
        element.setAttribute("content", translations[lang][key]);
      }
    });

    updateCopyrightYear();

    // Startet den Typewriter-Effekt nach dem Laden der Sprache neu
    const typewriterElement = document.querySelector('[data-effect="typing"]');
    if (typewriterElement) {
      typewriter(typewriterElement);
    }

    localStorage.setItem("selectedLanguage", lang);
  }

  function updateCopyrightYear() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  window.changeLanguage = function (lang) {
    applyLanguage(lang);
  };

  loadTranslations();

  // --- Google Maps erst nach Zustimmung laden (DSGVO) ---
  const MAP_SRC =
    "https://maps.google.com/maps?q=Sano-Apotheke,+Freiheit+1,+12555+Berlin&z=16&output=embed";

  function loadMap() {
    const wrapper = document.getElementById("map-wrapper");
    if (!wrapper || wrapper.querySelector("iframe")) return;
    const iframe = document.createElement("iframe");
    iframe.src = MAP_SRC;
    iframe.title = "Karte: Sano-Apotheke, Freiheit 1, 12555 Berlin";
    iframe.width = "100%";
    iframe.height = "350";
    iframe.style.border = "0";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.allowFullscreen = true;
    wrapper.innerHTML = "";
    wrapper.appendChild(iframe);
  }

  const mapButton = document.getElementById("map-load-btn");
  if (mapButton) {
    mapButton.addEventListener("click", function () {
      localStorage.setItem("mapConsent", "yes");
      loadMap();
    });
  }
  // Wer bereits zugestimmt hat, sieht die Karte direkt
  if (localStorage.getItem("mapConsent") === "yes") {
    loadMap();
  }

  // QR-Codes sind jetzt statische Dateien unter img/qr/
  // (keine Weitergabe von Daten an externe QR-Dienste).
});
