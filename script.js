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

  function generateGesunddeQrCode() {
    const gesunddeUrl = "https://gesund.de/qrcode/8fd8f5e8-db99-40c0-9544-91c1ebc2dbe9";
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      gesunddeUrl
    )}`;
    const gesunddeQrImage = document.getElementById("gesundde-qrcode");
    if (gesunddeQrImage) {
      gesunddeQrImage.src = qrCodeApiUrl;
    }
  }

  generateQrCode();
  generateGesunddeQrCode();
});
