/**
 * Saporsi CMS - Frontend API Renderer
 * - Fetch 1 endpoint: /api/public/site (ubah kalau beda)
 * - Render: navbar, hero, about, services, gallery, locations, partners, footer
 * - Fix: setLanguage aman walau dipanggil sebelum data siap
 */

const API_URL = "https://cms.saporsi.com/api/public/site"; // <-- UBAH kalau endpoint kamu beda
const ASSET_BASE = "http://cms.saporsi.com"; // contoh: "https://domain.com" kalau image path perlu absolute

// const API_URL = "http://localhost:3000/api/public/site"; // <-- UBAH kalau endpoint kamu beda
// const ASSET_BASE = "http://localhost:3000"; // contoh: "https://domain.com" kalau image path perlu absolute


let SITE = null;
let LANG = "id";

/* =========================
   1) LANGUAGE GUARD (FIX)
   ========================= */
(function initLanguageGuard() {
  const pending = { lang: null };

  // setLanguage harus ada secepat mungkin (untuk onclick)
  window.setLanguage = function setLanguage(lang) {
    pending.lang = lang;
    // kalau data belum siap, simpan dulu aja
    if (!window.__SAPORSI_SITE_READY__) return;
    // kalau sudah ready, apply langsung
    window.__SAPORSI_APPLY_LANGUAGE__(lang);
  };

  window.__SAPORSI_GET_PENDING_LANG__ = () => pending.lang;
})();

/* =========================
   2) HELPERS
   ========================= */
function t(obj, keyId, keyEn) {
  if (!obj) return "";
  if (LANG === "en") return obj[keyEn] ?? "";
  return obj[keyId] ?? "";
}

function setText(el, text) {
  if (!el) return;
  el.textContent = text ?? "";
}

function setHTML(el, html) {
  if (!el) return;
  el.innerHTML = html ?? "";
}

function setAttr(el, attr, val) {
  if (!el) return;
  if (val === null || val === undefined) return;
  el.setAttribute(attr, String(val));
}

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function safeUrl(path) {
  if (!path) return "";
  // kalau sudah absolute
  if (/^https?:\/\//i.test(path)) return path;

  // kalau path sudah mulai /public/..., /uploads/..., dll
  if (path.startsWith("/")) return `${ASSET_BASE}${path}`;
  return `${ASSET_BASE}/${path}`;
}

function normalizeNavUrl(url) {
  if (!url) return "#";
  const u = String(url).trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("#")) return u;          // #about
  if (u.startsWith("/#")) return u.slice(1); // /#about -> #about
  // kalau dari DB cuma "about" / "services"
  return `#${u.replace(/^\/+/, "").replace(/^#/, "")}`;
}


function toggleLangButtons() {
  const idBtn = qs("#lang-id");
  const enBtn = qs("#lang-en");
  const midBtn = qs("#mobile-lang-id");
  const menBtn = qs("#mobile-lang-en");

  const active = ["bg-orange-500", "text-white"];
  const inactive = ["text-gray-700"];

  const all = [idBtn, enBtn, midBtn, menBtn].filter(Boolean);

  // reset semua button
  all.forEach((b) => {
    b.classList.remove(...active);
    b.classList.remove(...inactive);
  });

  // set state
  const isId = LANG === "id";

  if (idBtn && enBtn) {
    if (isId) {
      idBtn.classList.add(...active);
      enBtn.classList.add(...inactive);
    } else {
      enBtn.classList.add(...active);
      idBtn.classList.add(...inactive);
    }
  }

  if (midBtn && menBtn) {
    if (isId) {
      midBtn.classList.add(...active);
      menBtn.classList.add(...inactive);
    } else {
      menBtn.classList.add(...active);
      midBtn.classList.add(...inactive);
    }
  }
}

/* =========================
   3) RENDER FUNCTIONS
   ========================= */

function renderNavbar() {
  const navbar = SITE?.navbar;
  if (!navbar) return;

  // logo image (navbar)
  const logoImg = qs("nav a[href='#home'] img");
  if (logoImg && navbar.logo_path) {
    setAttr(logoImg, "src", safeUrl(navbar.logo_path));
  }

  // CTA label + url (desktop + mobile)
  const ctaDesktop = qs("nav .hidden.lg\\:flex a.btn-vending");
  const ctaMobile = qs("#mobile-menu a.btn-vending");
  const ctaLabel = LANG === "en" ? navbar.cta_label_en : navbar.cta_label_id;

  if (ctaDesktop) {
    setText(ctaDesktop, ctaLabel || "Book a Machine 🎉");
    setAttr(ctaDesktop, "href", navbar.cta_url || "#contact");
    setAttr(ctaDesktop, "target", "_blank");
  }
  if (ctaMobile) {
    setText(ctaMobile, ctaLabel || "Book a Machine 🎉");
    setAttr(ctaMobile, "href", navbar.cta_url || "#contact");
    setAttr(ctaMobile, "target", "_blank");
  }

  // show/hide language toggle
  const langWrapDesktop = qs("nav .hidden.lg\\:flex .flex.items-center.border-3");
  const langWrapMobile = qs("#mobile-menu .flex.items-center.space-x-2.py-4");
  const show = navbar.show_language_toggle == "1";

  if (langWrapDesktop) langWrapDesktop.style.display = show ? "" : "none";
  if (langWrapMobile) langWrapMobile.style.display = show ? "" : "none";

  // navbar items
  const items = (navbar.items || [])
    .filter((x) => x.is_active == 1)
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

  // desktop nav container
  const desktopNav = qs("nav .hidden.lg\\:flex.items-center.space-x-8");
  if (desktopNav) {
    setHTML(desktopNav, items.map((it) => {
      const label = LANG === "en" ? it.label_en : it.label_id;
      const url = normalizeNavUrl(it.url);
      return `
        <a href="${url}"
          class="font-bold text-gray-700 hover:text-orange-500 transition-colors">
          ${label || ""}
        </a>
      `;
    }).join(""));
  }

  // mobile nav container
  const mobileNavWrap = qs("#mobile-menu .mt-16.space-y-4");
  if (mobileNavWrap) {
    // di wrap ini ada links + language buttons + CTA
    // kita hanya replace bagian links saja biar tidak ganggu yang lain
    // cara aman: cari semua link sebelum div language toggle
    const langDiv = qs("#mobile-menu .mt-16.space-y-4 > .flex.items-center.space-x-2.py-4");
    if (langDiv) {
      // remove existing links sebelum langDiv
      let node = mobileNavWrap.firstElementChild;
      while (node && node !== langDiv) {
        const next = node.nextElementSibling;
        node.remove();
        node = next;
      }

      // insert new links sebelum langDiv
      const frag = document.createDocumentFragment();
      items.forEach((it) => {
        const a = document.createElement("a");
        a.href = normalizeNavUrl(it.url);
        a.onclick = function () {
          if (typeof toggleMobileMenu === "function") toggleMobileMenu();
        };
        a.className =
          "block py-3 text-lg font-bold border-b-2 border-orange-100 hover:text-orange-500";
        a.textContent = LANG === "en" ? it.label_en : it.label_id;
        frag.appendChild(a);
      });
      mobileNavWrap.insertBefore(frag, langDiv);
    }
  }

  toggleLangButtons();
}

function renderHero() {
  const hero = SITE?.hero;
  if (!hero) return;

  // headline + subheadline
  setText(qs("#badge-headline"), t(hero, "badge_id", "badge_en"));
  setText(qs("#hero-headline"), t(hero, "title_id", "title_en"));
  setText(qs("#hero-subheadline"), t(hero, "subtitle_id", "subtitle_en"));

  // CTA tombol hero pertama (Book/Order)
  const heroCta = qs("#home a.btn-vending");
  if (heroCta) {
    setText(heroCta, t(hero, "cta_label_id", "cta_label_en") || heroCta.textContent);
    setAttr(heroCta, "href", hero.cta_url || "#");
    setAttr(heroCta, "target", "_blank");

  }

  // HERO IMAGE (pakai image aktif dengan sort_order terendah)
  const heroImg = qs("#home img[alt='Modern Vending Machine']");
  const images = (hero.images || [])
    .filter((x) => String(x.is_active) === "1")
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  if (heroImg && images.length) {
    setAttr(heroImg, "src", safeUrl(images[0].image_path));
  }
}

function renderAbout() {
  const about = SITE?.about;
  if (!about) return;

  setText(qs("#about-badge"), t(about, "badge_id", "badge_en"));
  setText(qs("#about-title"), t(about, "title_id", "title_en"));
  const aboutDesc = qs("#about p[data-i18n='about_desc1']");
  setText(aboutDesc, t(about, "description_id", "description_en"));

  // vision/mission cards
  const cardsWrap = qs("#about .grid.md\\:grid-cols-2.gap-8.mb-16");
  if (cardsWrap) {
    const cards = (about.cards || [])
      .filter((x) => String(x.is_active) === "1")
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

    // NOTE: kita tetap pertahankan class existing, tapi inner-nya kita render ulang
    setHTML(
      cardsWrap,
      cards
        .map((c) => {
          const title = t(c, "title_id", "title_en");
          const desc = t(c, "description_id", "description_en");
          const isMission = c.card_type === "mission";
          const bg =
            isMission
              ? "background: linear-gradient(135deg, var(--color-secondary) 0%, #FFA726 100%);"
              : "";
          const icon =
            c.icon_key === "target"
              ? "https://api.iconify.design/mdi/target.svg?color=white&width=48&height=48"
              : "https://api.iconify.design/mdi/eye-outline.svg?color=white&width=48&height=48";

          return `
          <div class="vision-mission-card" style="${bg}">
            <div class="flex items-start gap-4 mb-6">
              <img src="${icon}" alt="${title}" class="w-12 h-12 flex-shrink-0" onerror="this.style.display='none'">
              <div>
                <h3>${title || ""}</h3>
                <p>${desc || ""}</p>
              </div>
            </div>
          </div>`;
        })
        .join("")
    );
  }

  // points/features grid
  const pointsWrap = qs("#about .snack-grid");
  if (pointsWrap) {
    const pts = (about.points || [])
      .filter((x) => String(x.is_active) === "1")
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

    // map icon_key ke iconify url yang sudah ada di HTML kamu
    const iconMap = {
      location: "https://api.iconify.design/mdi/map-marker-radius.svg?color=white&width=32&height=32",
      service: "https://api.iconify.design/mdi/cog-sync.svg?color=white&width=32&height=32",
      data: "https://api.iconify.design/mdi/chart-line.svg?color=white&width=32&height=32",
      brand: "https://api.iconify.design/mdi/gift-outline.svg?color=white&width=32&height=32",
    };

    const bgMap = {
      location: "from-orange-400 to-red-500",
      service: "from-amber-400 to-orange-500",
      data: "from-blue-400 to-purple-500",
      brand: "from-green-400 to-teal-500",
    };

    setHTML(
      pointsWrap,
      pts
        .map((p) => {
          const title = t(p, "title_id", "title_en");
          const desc = t(p, "description_id", "description_en");
          const icon = iconMap[p.icon_key] || iconMap.location;
          const bg = bgMap[p.icon_key] || bgMap.location;

          return `
          <div class="snack-card p-8">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center mb-6">
              <img src="${icon}" alt="${title}" class="w-8 h-8" onerror="this.style.display='none'">
            </div>
            <h3 class="font-display text-xl font-bold mb-3 text-gray-800">${title || ""}</h3>
            <p class="text-gray-600">${desc || ""}</p>
          </div>`;
        })
        .join("")
    );
  }
}

function renderServices() {
  const services = SITE?.services;
  if (!services) return;

  // header
  setText(qs("#services span#services-badge"), t(services, "badge_id", "badge_en"));
  setText(qs("#services h2#services-title"), t(services, "title_id", "title_en"));
  setText(qs("#services p#services-description"), t(services, "subtitle_id", "subtitle_en"));

  const grid = qs("#services .grid.md\\:grid-cols-2.lg\\:grid-cols-3.gap-8");
  if (!grid) return;

  const items = (services.items || [])
    .filter((x) => String(x.is_active) === "1")
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

  const accentMap = {
    orange: "from-orange-400 to-red-500",
    green: "from-green-400 to-emerald-500",
    blue: "from-blue-400 to-cyan-500",
    purple: "from-purple-400 to-pink-500",
    yellow: "from-amber-400 to-orange-500",
    red: "from-red-400 to-rose-500",
  };

  setHTML(
    grid,
    items
      .map((it, idx) => {
        const title = t(it, "title_id", "title_en");
        const desc = t(it, "description_id", "description_en");
        const bg = accentMap[it.accent] || accentMap.orange;

        // 👉 ICON LOGIC (IMPORTANT)
        let iconSrc = "";
        if (it.icon_key && it.icon_key.startsWith("/uploads/")) {
          iconSrc = ASSET_BASE + it.icon_key;
        } else iconSrc = "https://api.iconify.design/mdi/clock-fast.svg?color=white&width=48&height=48";

        return `
          <div class="snack-card p-8 text-center">
            <div class="w-24 h-24 rounded-3xl 
                flex items-center justify-center mx-auto mb-6 icon-bounce"
                style="animation-delay:${idx * 0.2}s;">
              <img
                src="${iconSrc}"
                alt="${title || "service icon"}"
                class="w-22 h-22 object-contain"
                onerror="this.style.display='none'"
              >
            </div>

            <h3 class="font-display text-2xl font-bold mb-4 text-gray-800">
              ${title || ""}
            </h3>

            <p class="text-gray-600">
              ${desc || ""}
            </p>
          </div>
        `;
      })
      .join("")
  );
}

function renderGallery() {
  const gallery = SITE?.gallery;
  if (!gallery) return;

  setText(qs("#gallery span#gallery-badge"), t(gallery, "badge_id", "badge_en"));
  setText(qs("#gallery h2#gallery-title"), t(gallery, "title_id", "title_en"));
  setText(qs("#gallery p#gallery-description"), t(gallery, "subtitle_id", "subtitle_en"));

  const wrap = qs("#lightgallery");
  if (!wrap) return;

  const items = (gallery.items || []).filter((x) => String(x.is_active) === "1");
  // kalau items kosong, biarin HTML default kamu tetap ada
  if (!items.length) return;

  setHTML(
    wrap,
    items
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
      .map((it) => {
        const full = safeUrl(it.image_full_path || it.image_path || it.image_url || "");
        const thumb = safeUrl(it.image_thumb_path || it.image_path || it.image_url || "");
        const title = t(it, "title_id", "title_en") || it.title || "Gallery";
        return `
          <a href="${full}" class="gallery-item aspect-square" data-lightbox="vending-gallery" data-title="${title}">
            <img src="${thumb}" alt="${title}"
              onerror="this.style.display='none'">
          </a>
        `;
      })
      .join("")
  );
}

function renderLocations() {
  const locations = SITE?.locations;
  if (!locations) return;

  setText(qs("#locations span#locations-badge"), t(locations, "badge_id", "badge_en"));
  setText(qs("#locations h2#locations-title"), t(locations, "title_id", "title_en"));
  setText(qs("#locations p#locations-desc"), t(locations, "subtitle_id", "subtitle_en"));

  const grid = qs("#locations .grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-5.gap-6");
  if (!grid) return;

  const items = (locations.items || [])
    .filter((x) => String(x.is_active) === "1")
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
    .filter((x) => (x.title_id || x.title_en)); // buang yang kosong

  const accentMap = {
    pink: "from-red-400 to-pink-500",
    blue: "from-blue-400 to-cyan-500",
    purple: "from-purple-400 to-indigo-500",
    green: "from-green-400 to-emerald-500",
    orange: "from-orange-400 to-amber-500",
  };

  const iconMap = {
    hospital: "https://api.iconify.design/mdi/hospital-building.svg?color=white&width=32&height=32",
    campus: "https://api.iconify.design/mdi/school.svg?color=white&width=32&height=32",
    office: "https://api.iconify.design/mdi/office-building.svg?color=white&width=32&height=32",
    gym: "https://api.iconify.design/mdi/dumbbell.svg?color=white&width=32&height=32",
    transport: "https://api.iconify.design/mdi/train-car.svg?color=white&width=32&height=32",
  };

  setHTML(
    grid,
    items
      .map((it) => {
        const title = t(it, "title_id", "title_en");
        const bg = accentMap[it.accent] || accentMap.orange;
        const icon = iconMap[it.icon_key] || "https://api.iconify.design/mdi/map-marker.svg?color=white&width=32&height=32";

        return `
          <div class="snack-card p-6 text-center">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center mx-auto mb-4">
              <img src="${icon}" alt="${title}" class="w-8 h-8" onerror="this.style.display='none'">
            </div>
            <h4 class="font-display font-bold text-gray-800">${title || ""}</h4>
          </div>
        `;
      })
      .join("")
  );
}

function renderPartners() {
  const partners = SITE?.partners;
  const navbar = SITE?.navbar;
  if (!partners) return;

  setText(qs("#partners h1[data-i18n='partners_page_title']"), t(partners, "title_id", "title_en"));
  setText(qs("#partners p[data-i18n='partners_page_desc']"), t(partners, "subtitle_id", "subtitle_en"));

  // CTA partner
  const partnerCta = qs("#partners a.btn-vending");
  if (partnerCta) {
    setText(partnerCta.querySelector("span") || partnerCta, t(partners, "cta_label_id", "cta_label_en"));
    setAttr(partnerCta, "href", navbar.cta_url || "#");
    setAttr(partnerCta, "target", "_blank");
  }

  // partner items grid
  const grid = qs("#partners .grid.grid-cols-2.sm\\:grid-cols-3.gap-6.mb-10");
  if (!grid) return;

  const items = (partners.items || [])
    .filter((x) => String(x.is_active) === "1")
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

  setHTML(
    grid,
    items
      .map((it) => {
        const name = t(it, "name_id", "name_en") || "";
        const logo = safeUrl(it.logo_path);
        return `
          <div class="p-5 rounded-2xl border border-orange-100 bg-orange-50/40 hover:bg-orange-50 transition">
            <img src="${logo}" alt="${name}" class="h-10 mx-auto object-contain mb-3" onerror="this.style.display='none'">
            <p class="text-sm font-semibold text-gray-700">${name}</p>
          </div>
        `;
      })
      .join("")
  );
}

function renderCTA() {
  const cta = SITE?.cta;
  console.log(cta);
  if (!cta) return;

  const title = qs("#cta-title");
  const subtitle = qs("#cta-desc");
  const btn = qs("#cta-button");

  setText(title, t(cta, "title_id", "title_en"));
  setText(subtitle, t(cta, "subtitle_id", "subtitle_en"));

  btn.href = cta.primary_url || "#contact";
  btn.textContent = t(cta, "primary_label_id", "primary_label_en");
}


function renderFooter() {
  const footer = SITE?.footer;
  if (!footer) return;

  // desc
  setText(qs("footer p[data-i18n='footer_desc']"), t(footer, "desc_id", "desc_en"));

  // email / phone / location
  const emailSpan = qsa("footer ul.space-y-3.text-gray-400 li span")[0];
  const phoneSpan = qs("#footer-phone");
  const locationSpan = qsa("footer ul.space-y-3.text-gray-400 li span")[2];

  if (emailSpan) setText(emailSpan, footer.contact_email || "");
  if (phoneSpan) setText(phoneSpan, footer.contact_phone || "");
  if (locationSpan) setText(locationSpan, t(footer, "contact_location_id", "contact_location_en"));

  // copyright
  const copyP = qs("footer .border-t p.text-gray-500");
  if (copyP) {
    setText(copyP, t(footer, "copyright_id", "copyright_en"));
  }

  // quick links (kolom tengah)
  const quickLinksList = qs("footer ul.space-y-3");
  if (quickLinksList && Array.isArray(footer.quick_links)) {
    const links = footer.quick_links
      .filter((x) => String(x.is_active) === "1")
      .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

    setHTML(
      quickLinksList,
      links
        .map((it) => {
          const label = LANG === "en" ? it.label_en : it.label_id;
          return `<li><a href="${it.url || "#"}" class="text-gray-400 hover:text-orange-400 transition-colors">${label || ""}</a></li>`;
        })
        .join("")
    );
  }

  toggleLangButtons();
}

/* =========================
   4) BOOTSTRAP
   ========================= */
window.__SAPORSI_SITE_READY__ = false;

window.__SAPORSI_APPLY_LANGUAGE__ = function applyLanguage(lang) {
  LANG = lang;

  // render semuanya
  renderNavbar();
  renderHero();
  renderAbout();
  renderServices();
  renderGallery();
  renderLocations();
  renderPartners();
  renderCTA();
  renderFooter();

  toggleLangButtons();
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(API_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    // jika API kamu return { data: {...} } atau langsung {...}
    SITE = json.data ? json.data : json;

    // mark ready
    window.__SAPORSI_SITE_READY__ = true;

    // kalau sempat klik language sebelum ready, apply yang terakhir
    const pendingLang = window.__SAPORSI_GET_PENDING_LANG__?.();
    if (pendingLang) {
      window.__SAPORSI_APPLY_LANGUAGE__(pendingLang);
    } else {
      // render default (id)
      window.__SAPORSI_APPLY_LANGUAGE__(LANG);
    }
  } catch (err) {
    console.error("Failed to load site data:", err);
  }
});
