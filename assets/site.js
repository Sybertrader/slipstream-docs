/* TODO(Dave): after Marketplace approval, set this to the public listing URL.
   Until then every install button stays on the pricing section. */
var MARKETPLACE_URL = "#pricing";
var PAGE_REV = "e6e36c445b68";

(function () {
  var revKey = "slipstream-site-rev";
  if (sessionStorage.getItem(revKey) !== PAGE_REV) {
    fetch("/assets/site.js", { cache: "no-store" }).then(function (res) {
      return res.ok ? res.text() : "";
    }).then(function (text) {
      var found = text.match(/var PAGE_REV = "e6e36c445b68"]*)"/);
      if (!found || found[1] === PAGE_REV) return;
      if (new URL(location.href).searchParams.get("rev") === found[1]) return;
      sessionStorage.setItem(revKey, found[1]);
      var next = new URL(location.href);
      next.searchParams.set("rev", found[1]);
      location.replace(next.toString());
    }).catch(function () {});
  } else if (new URL(location.href).searchParams.get("rev") === PAGE_REV) {
    var clean = new URL(location.href);
    clean.searchParams.delete("rev");
    history.replaceState(null, "", clean.pathname + clean.search + clean.hash);
  }

  document.querySelectorAll("a[data-marketplace]").forEach(function (el) {
    el.setAttribute("href", MARKETPLACE_URL);
  });

  function closeMenus() {
    document.querySelectorAll("details.nav-menu[open]").forEach(function (menu) {
      menu.open = false;
      var summary = menu.querySelector("summary");
      if (summary) summary.focus();
    });
  }

  document.querySelectorAll("details.nav-menu").forEach(function (menu) {
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.open = false;
      });
    });
  });

  var chapters = document.querySelectorAll("main section[id]");
  var chapterNav = document.querySelector('nav[aria-label="Guide chapters"]');
  if (chapterNav && chapters.length && "IntersectionObserver" in window) {
    var links = chapterNav.querySelectorAll("a");
    var byId = {};
    links.forEach(function (link) {
      byId[(link.getAttribute("href") || "").replace("#", "")] = link;
    });
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.removeAttribute("aria-current");
          });
          var current = byId[entry.target.id];
          if (!current) return;
          current.setAttribute("aria-current", "true");
          var left = current.offsetLeft;
          var right = left + current.offsetWidth;
          if (left < chapterNav.scrollLeft || right > chapterNav.scrollLeft + chapterNav.clientWidth) {
            chapterNav.scrollLeft = left;
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0.01 },
    );
    chapters.forEach(function (section) {
      observer.observe(section);
    });
  }

  var root = document.getElementById("shot-lightbox");
  var full = root ? root.querySelector("img") : null;
  var closer = root ? root.querySelector(".shot-lightbox-close") : null;
  var title = root ? document.getElementById("shot-lightbox-title") : null;
  var last = null;

  function openShot(src, alt, trigger) {
    if (!root || !full || !closer) return;
    full.src = src;
    full.alt = alt || "Screenshot";
    if (title) title.textContent = full.alt;
    last = trigger;
    root.hidden = false;
    document.body.style.overflow = "hidden";
    closer.focus();
  }

  function closeShot() {
    if (!root || root.hidden || !full) return;
    root.hidden = true;
    full.removeAttribute("src");
    document.body.style.overflow = "";
    if (last) last.focus();
  }

  document.querySelectorAll("button.shot").forEach(function (button) {
    button.addEventListener("click", function () {
      var picture = button.querySelector("img");
      if (!picture) return;
      openShot(picture.getAttribute("data-full") || picture.currentSrc || picture.src, picture.alt, button);
    });
  });

  if (root) {
    root.addEventListener("click", function (event) {
      if (event.target === root || event.target === closer) closeShot();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (root && !root.hidden) closeShot();
      else closeMenus();
      return;
    }
    if (!root || root.hidden || event.key !== "Tab" || !closer) return;
    if (document.activeElement === closer) {
      event.preventDefault();
      closer.focus();
    }
  });
})();
