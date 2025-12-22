document.addEventListener("DOMContentLoaded", function () {
  // --- Intro & Outro Animations ---
  const preloader = document.getElementById("preloader");

  // Intro
  window.addEventListener("load", () => {
    if (preloader) {
      preloader.classList.add("hidden");
    }
  });

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
  function typewriter(element) {
    if (!element) return;
    const text = element.getAttribute("data-lang-text") || element.textContent;
    element.innerHTML = ""; // Leert den Inhalt zu Beginn
    element.classList.add("typing-cursor");
    let i = 0;

    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, 70); // Geschwindigkeit des Tippens
      } else {
        element.classList.remove("typing-cursor"); // Cursor entfernen
      }
    }
    type();
  }

  // --- Scroll Animations (Intersection Observer) ---
  const animatedElements = document.querySelectorAll(".animated-element");
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

  // --- QR-Code Generator ---
  function generateQrCode() {
    const text =
      "Hallo, ich möchte gern mein Rezept bei Ihnen einlösen. Könnten Sie mir bitte mitteilen, wann ich es abholen kann?";
    const whatsappUrl = `https://wa.me/4915678732257?text=${encodeURIComponent(
      text
    )}`;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      whatsappUrl
    )}`;
    const qrCodeImage = document.getElementById("whatsapp-qrcode");
    if (qrCodeImage) {
      qrCodeImage.src = qrCodeApiUrl;
    }
  }

  generateQrCode();
});

// --- Holiday Widget Logic ---
function checkHolidayWidget() {
  const widget = document.getElementById("holiday-widget");
  if (!widget) return;

  const now = new Date();

  // ECHTER ZEITRAUM (22.12.2025 bis 03.01.2026)
  // Monat beginnt bei 0 (Dezember = 11, Januar = 0)
  const startDate = new Date(2025, 11, 22);
  const endDate = new Date(2026, 0, 3, 23, 59, 59);

  // *** ZUM TESTEN HIER EINKOMMENTIEREN (damit es heute angezeigt wird): ***
  // const startDate = new Date(); // Start ist jetzt
  // const endDate = new Date(); endDate.setDate(endDate.getDate() + 1); // Ende ist morgen

  // Prüfen ob wir im Zeitraum sind
  if (now >= startDate && now <= endDate) {
    // Zeigen
    widget.classList.remove("hidden");
  } else {
    // Verstecken (sicherheitshalber)
    widget.classList.add("hidden");
  }
}

// Funktion zum Schließen (muss global verfügbar sein oder ans window gebunden werden)
window.closeHolidayWidget = function () {
  const widget = document.getElementById("holiday-widget");
  if (widget) {
    widget.classList.add("hidden");
  }
};

// Prüfung beim Laden starten
checkHolidayWidget();
