// Default config
const defaultConfig = {
  hero_headline_en: "Delicious fresh meal. Instantly.! 🍫",
  hero_headline_id: "Hidangan yang lezat, Instan! 🍫",
  hero_subheadline_en: "Your 24/7 partner for delicious foods and drinks! We bring the ultimate vending experience with cashless payments, strategic locations, and the tastiest treats.",
  hero_subheadline_id: "Mitra 24/7 Anda untuk makanan dan minuman lezat! Kami hadirkan pengalaman vending terbaik dengan pembayaran cashless, lokasi strategis, dan camilan terenak.",
  about_title_en: "Vending Made Yummy! 🍭",
  about_title_id: "Vending Jadi Yummy! 🍭",
  whatsapp_number: "+6281234567890"
};

// Current language
let currentLang = 'id';

// Initialize lightGallery
let lightGalleryInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // No Lightbox2 init required

  // Optional: configure Lightbox2 (only if you want)
  if (window.lightbox) {
    lightbox.option({
      resizeDuration: 200,
      wrapAround: true,
      albumLabel: "Image %1 of %2",
      fadeDuration: 200,
      imageFadeDuration: 200
    });
  }

  // Set initial language
  setLanguage('id');
});


function setLanguage(lang) {
  currentLang = lang;

  // Update language toggle buttons (Desktop)
  document.getElementById('lang-id').style.background = lang === 'id' ? 'var(--color-primary)' : 'transparent';
  document.getElementById('lang-id').style.color = lang === 'id' ? 'white' : 'var(--color-text)';
  document.getElementById('lang-en').style.background = lang === 'en' ? 'var(--color-primary)' : 'transparent';
  document.getElementById('lang-en').style.color = lang === 'en' ? 'white' : 'var(--color-text)';

  // Update language toggle buttons (Mobile)
  document.getElementById('mobile-lang-id').style.background = lang === 'id' ? 'var(--color-primary)' :
    'transparent';
  document.getElementById('mobile-lang-id').style.color = lang === 'id' ? 'white' : 'var(--color-text)';
  document.getElementById('mobile-lang-en').style.background = lang === 'en' ? 'var(--color-primary)' :
    'transparent';
  document.getElementById('mobile-lang-en').style.color = lang === 'en' ? 'white' : 'var(--color-text)';

  // Update all i18n elements
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang][key]) {
      element.innerHTML = translations[lang][key];
    }
  });

  // Update config-dependent elements
  const config = window.elementSdk ? window.elementSdk.config : defaultConfig;
  if (lang === 'en') {
    document.getElementById('hero-headline').innerHTML = config.hero_headline_en || defaultConfig
      .hero_headline_en;
    document.getElementById('hero-subheadline').innerHTML = config.hero_subheadline_en || defaultConfig
      .hero_subheadline_en;
    document.getElementById('about-title').innerHTML = config.about_title_en || defaultConfig.about_title_en;
  } else {
    document.getElementById('hero-headline').innerHTML = config.hero_headline_id || defaultConfig
      .hero_headline_id;
    document.getElementById('hero-subheadline').innerHTML = config.hero_subheadline_id || defaultConfig
      .hero_subheadline_id;
    document.getElementById('about-title').innerHTML = config.about_title_id || defaultConfig.about_title_id;
  }

  // Update WhatsApp links
  updateWhatsAppLinks();
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('active');
}

function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });

  // Show selected page
  document.getElementById(`page-${page}`).classList.add('active');

  // Scroll to top
  window.scrollTo(0, 0);
}


(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement('script');
      d.innerHTML =
        "window.__CF$cv$params={r:'9bb348bf505a9bda',t:'MTc2Nzk1NDg4Ny4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName('head')[0].appendChild(d)
    }
  }
  if (document.body) {
    var a = document.createElement('iframe');
    a.height = 1;
    a.width = 1;
    a.style.position = 'absolute';
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = 'none';
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    if ('loading' !== document.readyState) c();
    else if (window.addEventListener) document.addEventListener('DOMContentLoaded', c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        'loading' !== document.readyState && (document.onreadystatechange = e, c())
      }
    }
  }
})();