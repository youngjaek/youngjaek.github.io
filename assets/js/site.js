/*!
 * Site interactions. Vanilla, deferred, no dependencies.
 * Every feature here is progressive enhancement: with JS off the page still
 * renders, navigates and reads correctly.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- Theme */

  function setTheme(next) {
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      /* Private mode: the theme still applies for this page view. */
    }
  }

  function toggleTheme() {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", toggleTheme);
  });

  /* --------------------------------------------------------------- Header */

  var header = document.getElementById("site-header");

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var navToggle = header.querySelector("[data-nav-toggle]");
    if (navToggle) {
      navToggle.addEventListener("click", function () {
        var open = header.getAttribute("data-open") === "true";
        header.setAttribute("data-open", String(!open));
        navToggle.setAttribute("aria-expanded", String(!open));
      });
    }
  }

  /* ------------------------------------------------------- Copy to clipboard */

  function flashCopied(btn) {
    btn.setAttribute("data-copied", "true");
    window.setTimeout(function () {
      btn.removeAttribute("data-copied");
    }, 1600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts (e.g. plain-http local preview).
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(field);
    }
    return Promise.resolve();
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    if (btn.classList.contains("palette__item")) return; // handled by the palette
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-copy")).then(function () {
        flashCopied(btn);
      });
    });
  });

  /* ------------------------------------------------------ Reveal on scroll */

  // We got here, so the fallback un-hide in head.liquid is no longer needed.
  window.clearTimeout(window.__revealFallback);

  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    root.classList.remove("reveal-armed");
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      // Threshold 0 so tall sections reveal the moment their top edge enters,
      // instead of leaving a blank band until 5% of a 2000px block is on screen.
      { rootMargin: "0px 0px -40px 0px", threshold: 0 }
    );
    revealables.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --------------------------------------------------------- Stack filter */

  var filter = document.querySelector("[data-filter]");

  if (filter) {
    var targets = document.querySelectorAll("[data-stack]");

    var applyFilter = function (value) {
      targets.forEach(function (el) {
        var stack = (el.getAttribute("data-stack") || "").toLowerCase();
        var matches = value === "all" || stack.indexOf(value) !== -1;
        el.setAttribute("data-dim", String(!matches));

        el.querySelectorAll(".tag").forEach(function (tag) {
          var hit = value !== "all" && tag.textContent.trim().toLowerCase() === value;
          if (hit) {
            tag.setAttribute("data-match", "on");
          } else {
            tag.removeAttribute("data-match");
          }
        });
      });
    };

    filter.addEventListener("click", function (event) {
      var chip = event.target.closest(".filter__chip");
      if (!chip) return;

      var value = (chip.getAttribute("data-value") || "all").toLowerCase();
      var wasOn = chip.getAttribute("aria-pressed") === "true";

      filter.querySelectorAll(".filter__chip").forEach(function (c) {
        c.setAttribute("aria-pressed", "false");
      });

      // Clicking the active chip clears the filter.
      if (wasOn || value === "all") {
        var allChip = filter.querySelector('[data-value="all"]');
        if (allChip) allChip.setAttribute("aria-pressed", "true");
        applyFilter("all");
      } else {
        chip.setAttribute("aria-pressed", "true");
        applyFilter(value);
      }
    });
  }

  /* ------------------------------------------------------ Command palette */

  var palette = document.getElementById("command-palette");

  if (palette && typeof palette.showModal === "function") {
    var input = document.getElementById("palette-input");
    var list = document.getElementById("palette-list");
    var empty = document.getElementById("palette-empty");
    var items = Array.prototype.slice.call(palette.querySelectorAll(".palette__item"));
    var groups = Array.prototype.slice.call(palette.querySelectorAll("[data-group]"));
    var visible = items.slice();
    var index = 0;

    var select = function (next) {
      if (!visible.length) return;
      index = (next + visible.length) % visible.length;
      items.forEach(function (el) {
        el.setAttribute("aria-selected", "false");
      });
      var current = visible[index];
      current.setAttribute("aria-selected", "true");
      current.scrollIntoView({ block: "nearest" });
    };

    var refresh = function () {
      var query = input.value.trim().toLowerCase();

      visible = items.filter(function (el) {
        var haystack = el.textContent.toLowerCase() + " " + (el.getAttribute("data-keywords") || "");
        var match = !query || haystack.indexOf(query) !== -1;
        el.hidden = !match;
        return match;
      });

      // Hide a group heading when every item under it is filtered out.
      groups.forEach(function (heading) {
        var node = heading.nextElementSibling;
        var any = false;
        while (node && !node.hasAttribute("data-group")) {
          if (node.classList.contains("palette__item") && !node.hidden) {
            any = true;
            break;
          }
          node = node.nextElementSibling;
        }
        heading.hidden = !any;
      });

      empty.hidden = visible.length > 0;
      select(0);
    };

    var open = function () {
      palette.showModal();
      input.value = "";
      refresh();
      input.focus();
    };

    document.querySelectorAll("[data-palette-open]").forEach(function (btn) {
      btn.addEventListener("click", open);
    });

    document.addEventListener("keydown", function (event) {
      var isK = event.key === "k" || event.key === "K";
      if (isK && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (palette.open) {
          palette.close();
        } else {
          open();
        }
        return;
      }

      // "/" opens search, unless the user is typing somewhere.
      if (event.key === "/" && !palette.open) {
        var tag = document.activeElement && document.activeElement.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        event.preventDefault();
        open();
      }
    });

    input.addEventListener("input", refresh);

    palette.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        select(index + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        select(index - 1);
      } else if (event.key === "Enter") {
        if (!visible.length) return;
        event.preventDefault();
        visible[index].click();
      }
    });

    // Clicking the backdrop (i.e. outside the dialog box) closes it.
    palette.addEventListener("click", function (event) {
      if (event.target === palette) palette.close();
    });

    items.forEach(function (el) {
      el.addEventListener("mousemove", function () {
        var at = visible.indexOf(el);
        if (at !== -1 && at !== index) select(at);
      });

      var action = el.getAttribute("data-action");
      if (!action) return;

      el.addEventListener("click", function () {
        if (action === "theme") {
          toggleTheme();
          palette.close();
        } else if (action === "copy-email") {
          copyText(el.getAttribute("data-copy")).then(function () {
            palette.close();
          });
        }
      });
    });
  }
})();
