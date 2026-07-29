/* ============================================================
   "For Modak" — application script
   ------------------------------------------------------------
   IMPROVEMENTS over the original script.js:
   • Bootstrap JS dependency removed (nav is 15 lines of vanilla JS).
   • Header/footer/chapter-nav are generated from ONE data source
     (CHAPTERS) so navigation can never drift between pages.
   • Every feature is an isolated module that no-ops when its markup
     is absent — no more null-checks scattered through one big block.
   • Music state persists across pages via sessionStorage.
   • All animation respects prefers-reduced-motion.
   • Timers/observers are cleaned up; no leaked intervals.
   ============================================================ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Single source of truth for the journey ---------- */
  const CHAPTERS = [
    { file: "index.html",       title: "Welcome",       nav: "Home",     desc: "Where the birthday journey begins." },
    { file: "story.html",       title: "Our Story",     nav: "Story",    desc: "From fifth standard to today." },
    { file: "gallery.html",     title: "Gallery",       nav: "Gallery",  desc: "Moments we caught and kept." },
    { file: "qualities.html",   title: "What Makes You Special", nav: "Special", desc: "A few reasons you're unforgettable." },
    { file: "letter.html",      title: "The Letter",    nav: "Letter",   desc: "Something I wanted you to know." },
    { file: "game.html",        title: "Catch My Heart", nav: "Game",    desc: "A little game before the surprise." },
    { file: "gift.html",        title: "The Gift",      nav: "Gift",     desc: "A box that opens with love." },
    { file: "celebration.html", title: "Celebration",   nav: "Celebrate", desc: "Cake, candles and confetti." },
    { file: "doors.html",       title: "10 Little Doors", nav: "10 Doors", desc: "Ten small surprises for you." },
    { file: "finale.html",      title: "Finale",        nav: "Finale",   desc: "The last, softest chapter." },
  ];

  const currentFile = (() => {
    const name = window.location.pathname.split("/").pop();
    return !name || name === "" ? "index.html" : name;
  })();

  /* ---------- Chrome: header + footer + chapter navigation ---------- */
  function buildChrome() {
    const header = $("[data-header]");
    if (header) {
      const links = CHAPTERS.filter((c) => c.file !== "index.html")
        .map(
          (c) => `<li><a class="nav__link" href="${c.file}"${
            c.file === currentFile ? ' aria-current="page"' : ""
          }>${c.nav}</a></li>`,
        )
        .join("");

      header.innerHTML = `
        <div class="shell">
          <nav class="nav" aria-label="Primary">
            <a class="brand" href="index.html">
              <span class="brand__mark" aria-hidden="true">❤</span>
              <span class="brand__text">For Modak</span>
            </a>
            <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="primary-menu">
              <span aria-hidden="true"></span>
              <span class="visually-hidden">Toggle menu</span>
            </button>
            <ul class="nav__list" id="primary-menu">${links}</ul>
            <button class="music-btn" type="button" data-music aria-pressed="false">
              <span class="music-btn__icon" aria-hidden="true">♫</span>
              <span data-music-label>Music</span>
            </button>
          </nav>
        </div>`;

      const toggle = $(".nav__toggle", header);
      const list = $(".nav__list", header);
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        list.classList.toggle("is-open", !open);
      });

      const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const footer = $("[data-footer]");
    if (footer) {
      footer.innerHTML = `
        <div class="shell site-footer__inner">
          <p style="margin:0">Made with endless care, countless memories, and all my heart. ❤️</p>
          <p style="margin:0">— Ladu, for Modak</p>
        </div>`;
    }

    const chapterNav = $("[data-chapter-nav]");
    if (chapterNav) {
      const i = CHAPTERS.findIndex((c) => c.file === currentFile);
      const prev = i > 0 ? CHAPTERS[i - 1] : null;
      const next = i >= 0 && i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null;
      chapterNav.innerHTML = [
        prev
          ? `<a class="chapter-link chapter-link--prev" href="${prev.file}">
               <span class="chapter-link__label">← Previous</span>
               <span class="chapter-link__title">${prev.title}</span>
             </a>`
          : "<span></span>",
        next
          ? `<a class="chapter-link chapter-link--next" href="${next.file}">
               <span class="chapter-link__label">Next →</span>
               <span class="chapter-link__title">${next.title}</span>
             </a>`
          : "<span></span>",
      ].join("");
    }

    const chapterList = $("[data-chapter-list]");
    if (chapterList) {
      chapterList.innerHTML = CHAPTERS.slice(1)
        .map(
          (c, idx) => `<li>
            <a class="chapter-card reveal" href="${c.file}" style="--reveal-delay:${idx * 60}ms">
              <span class="chapter-card__index">${String(idx + 1).padStart(2, "0")}</span>
              <span class="chapter-card__title">${c.title}</span>
              <p class="chapter-card__desc">${c.desc}</p>
            </a>
          </li>`,
        )
        .join("");
    }
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target); // reveal once, then stop observing
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Loading screen (landing page only) ---------- */
  function initLoader() {
    const loader = $("[data-loader]");
    if (!loader) return;
    const hide = () => loader.classList.add("is-hidden");
    // Hide as soon as the page is usable, with a short minimum so the
    // animation does not flash. Original waited a fixed 2.4s always.
    const minimum = reduceMotion ? 0 : 1400;
    const start = performance.now();
    window.addEventListener("load", () => {
      const wait = Math.max(0, minimum - (performance.now() - start));
      setTimeout(hide, wait);
    });
    setTimeout(hide, 4000); // hard safety net
  }

  /* ---------- Background music (persists across pages) ---------- */
  const MUSIC_SRC = "images/Dheema.mp3";
  const MUSIC_KEY = "modak:music";

  function initMusic() {
    const buttons = $$("[data-music]");
    if (!buttons.length) return;

    let audio = null;
    const ensureAudio = () => {
      if (audio) return audio;
      audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.volume = 0.45;
      audio.preload = "none";
      return audio;
    };

    const paint = (on) => {
      buttons.forEach((btn) => {
        btn.setAttribute("aria-pressed", String(on));
        const label = $("[data-music-label]", btn);
        if (label) label.textContent = on ? "Playing" : "Music";
      });
    };

    const setPlaying = (on) => {
      const a = ensureAudio();
      if (on) {
        a.play()
          .then(() => {
            sessionStorage.setItem(MUSIC_KEY, "on");
            paint(true);
          })
          .catch(() => paint(false)); // autoplay blocked — stay silent, no console error
      } else {
        a.pause();
        sessionStorage.setItem(MUSIC_KEY, "off");
        paint(false);
      }
    };

    buttons.forEach((btn) =>
      btn.addEventListener("click", () =>
        setPlaying(btn.getAttribute("aria-pressed") !== "true"),
      ),
    );

    if (sessionStorage.getItem(MUSIC_KEY) === "on") setPlaying(true);
  }

  /* ---------- Confetti ---------- */
  const CONFETTI_COLORS = ["#ff6f9c", "#f6cd94", "#9be7ff", "#b38cff"];
  function confetti(count = 26) {
    if (reduceMotion) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.animationDuration = `${1.8 + Math.random() * 1.5}s`;
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      frag.appendChild(piece);
      setTimeout(() => piece.remove(), 3600);
    }
    document.body.appendChild(frag);
  }

  /* ---------- Gallery: filtering + lightbox ---------- */
  function initGallery() {
    const grid = $("[data-gallery]");
    if (!grid) return;

    const items = $$(".gallery__item", grid);
    $$("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        $$("[data-filter]").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === btn)),
        );
        items.forEach((item) => {
          item.hidden = filter !== "all" && item.dataset.type !== filter;
        });
      });
    });

    const dialog = $("[data-lightbox]");
    if (!dialog || typeof dialog.showModal !== "function") return;
    const img = $("img", dialog);
    $$("[data-zoom]", grid).forEach((trigger) => {
      trigger.addEventListener("click", () => {
        img.src = trigger.dataset.zoom;
        img.alt = trigger.dataset.zoomAlt || "";
        dialog.showModal();
      });
    });
    $("[data-lightbox-close]", dialog).addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
  }

  /* ---------- Catch My Heart ---------- */
  function initGame() {
    const zone = $("[data-game-zone]");
    if (!zone) return;

    const TARGET = 15;
    const scoreEl = $("[data-score]");
    const meterEl = $("[data-meter]");
    const messageEl = $("[data-game-message]");
    let score = 0;
    let timer = null;

    const finish = () => {
      clearInterval(timer);
      zone.innerHTML = '<p class="game__won">✨ Surprise unlocked. Happy birthday, Modak. ✨</p>';
      messageEl.textContent = "You caught every heart — the gift is waiting for you.";
      confetti(40);
    };

    const spawn = () => {
      const heart = document.createElement("button");
      heart.type = "button";
      heart.className = "heart-drop";
      heart.textContent = "❤️";
      heart.setAttribute("aria-label", "Catch a heart");
      heart.style.left = `${6 + Math.random() * 80}%`;
      heart.style.setProperty("--fall", `${zone.clientHeight + 60}px`);
      heart.style.animationDuration = `${2.6 + Math.random() * 1.4}s`;

      heart.addEventListener("click", () => {
        heart.remove();
        score += 1;
        scoreEl.textContent = String(score);
        meterEl.style.width = `${Math.min(100, (score / TARGET) * 100)}%`;
        if (score >= TARGET) finish();
      });

      heart.addEventListener("animationend", () => heart.remove());
      zone.appendChild(heart);
    };

    const restart = $("[data-game-restart]");
    const start = () => {
      clearInterval(timer);
      timer = setInterval(spawn, 780);
      spawn();
    };
    if (restart) {
      restart.addEventListener("click", () => {
        score = 0;
        scoreEl.textContent = "0";
        meterEl.style.width = "0%";
        zone.innerHTML = "";
        messageEl.textContent = "Tap the hearts as they drift by.";
        start();
      });
    }
    start();

    // Stop spawning when the tab is hidden — saves battery/CPU.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(timer);
      else if (score < TARGET) start();
    });
  }

  /* ---------- Gift box ---------- */
  function initGift() {
    const box = $("[data-gift]");
    if (!box) return;
    const message = $("[data-gift-message]");
    box.addEventListener("click", () => {
      if (box.classList.contains("is-open")) return;
      box.classList.add("is-open");
      box.setAttribute("aria-expanded", "true");
      message.textContent =
        "A little promise: you will always be the most beautiful part of my life.";
      confetti(34);
    });
  }

  /* ---------- Celebration ---------- */
  function initCelebration() {
    const scene = $("[data-celebrate]");
    if (!scene) return;
    const button = $("[data-celebrate-btn]");
    if (button) button.addEventListener("click", () => confetti(60));
    // A gentle burst as soon as the scene comes into view.
    if (!reduceMotion && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            confetti(30);
            io.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      io.observe(scene);
    }
  }

  /* ---------- 10 little doors ---------- */
  function initDoors() {
    const doors = $$("[data-door]");
    if (!doors.length) return;
    const reveal = $("[data-door-reveal]");
    const image = $("[data-door-image]");
    const text = $("[data-door-message]");

    doors.forEach((door) => {
      door.addEventListener("click", () => {
        door.classList.add("is-open");
        image.src = door.dataset.image;
        image.alt = `A memory behind door ${door.dataset.number}`;
        text.textContent = door.dataset.message;
        reveal.dataset.empty = "false";
        reveal.classList.add("is-visible");
        reveal.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        confetti(18);
      });
    });
  }

  /* ---------- Page transitions ---------- */
  function initPageTransitions() {
    if (reduceMotion) return;
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      const internal =
        url.origin === window.location.origin &&
        url.pathname.endsWith(".html") &&
        !link.target &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey;
      if (!internal) return;
      event.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(() => {
        window.location.href = link.href;
      }, 260);
    });
    // Restore state when navigating back via bfcache.
    window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));
  }

  /* ---------- Boot ---------- */
  function boot() {
    buildChrome();
    initLoader();
    initMusic();
    initReveal();
    initGallery();
    initGame();
    initGift();
    initCelebration();
    initDoors();
    initPageTransitions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
