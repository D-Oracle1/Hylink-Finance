/* ==========================================================================
   HY-LINK FINANCE - shared site behaviour
   Navbar (mobile drawer + scroll state), active link, AOS bootstrap.
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var header = document.getElementById("site-header");

    /* ---- Mobile drawer -------------------------------------------------- */
    var burger = document.getElementById("menu-btn");
    if (header && burger) {
      burger.addEventListener("click", function () {
        var open = header.classList.toggle("nav-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });

      // Close the drawer after tapping a link inside it
      header.querySelectorAll(".nav-drawer a").forEach(function (a) {
        a.addEventListener("click", function () {
          header.classList.remove("nav-open");
          burger.setAttribute("aria-expanded", "false");
        });
      });
    }

    /* ---- Solidify the navbar once the page scrolls ---------------------- */
    if (header) {
      var setStuck = function () {
        header.classList.toggle("is-stuck", window.scrollY > 24);
      };
      setStuck();
      window.addEventListener("scroll", setStuck, { passive: true });
    }

    /* ---- Mark the current page in the nav ------------------------------- */
    var here = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("#site-header a[href]").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (href === here || (here === "index.html" && href === "index.html")) {
        if (link.classList.contains("nav-link")) link.classList.add("is-active");
      }
    });

    /* ---- Rotating text ---------------------------------------------------
       Rotators sharing a data-rotator-group advance together off one timer,
       so a headline and its own tagline always change as a pair.

       Each tick reads the current position back out of the DOM and then
       repaints every member from scratch, so the group self-heals: the pair
       cannot drift apart even if this setup is ever run twice. */
    var groups = {};
    var solo = 0;

    document.querySelectorAll("[data-rotator]").forEach(function (rotator) {
      if (rotator.getAttribute("data-rotator-ready")) return;

      var items = rotator.querySelectorAll(":scope > span");
      if (items.length < 2) return;
      rotator.setAttribute("data-rotator-ready", "1");

      var key = rotator.getAttribute("data-rotator-group") || "solo-" + ++solo;
      if (!groups[key]) groups[key] = { members: [], delay: 4500 };
      groups[key].members.push(items);

      var delay = parseInt(rotator.getAttribute("data-rotator-interval"), 10);
      if (delay) groups[key].delay = delay;
    });

    Object.keys(groups).forEach(function (key) {
      var group = groups[key];

      var paint = function (index) {
        group.members.forEach(function (items) {
          var target = index % items.length;
          items.forEach(function (el, k) {
            var on = k === target;
            el.classList.toggle("is-active", on);
            el.setAttribute("aria-hidden", on ? "false" : "true");
          });
        });
      };

      var advance = function () {
        var first = group.members[0];
        var current = 0;
        for (var k = 0; k < first.length; k++) {
          if (first[k].classList.contains("is-active")) { current = k; break; }
        }
        paint(current + 1);
      };

      paint(0);
      var timer = setInterval(advance, group.delay);

      // Don't cycle in a background tab
      document.addEventListener("visibilitychange", function () {
        clearInterval(timer);
        if (!document.hidden) timer = setInterval(advance, group.delay);
      });
    });

    /* ---- Hide banner strips whose artwork is missing --------------------- */
    window.addEventListener("load", function () {
      document.querySelectorAll("#advert").forEach(function (sec) {
        var imgs = sec.querySelectorAll("img");
        var any = Array.prototype.some.call(imgs, function (i) {
          return i.complete && i.naturalWidth > 0;
        });
        if (!any) sec.style.display = "none";
      });
    });

    /* ---- Animations ------------------------------------------------------
       Offsets are measured once at init, so they go stale as images finish
       loading and push content down - refresh after load (and on resize) or
       elements below the fold never reach their trigger point and stay at
       opacity 0. */
    if (window.AOS) {
      AOS.init({ duration: 800, once: true, offset: 40, easing: "ease-out-cubic" });

      var refresh = function () { AOS.refreshHard(); };
      window.addEventListener("load", function () {
        refresh();
        setTimeout(refresh, 400);
        setTimeout(refresh, 1200);
      });

      var t;
      window.addEventListener("resize", function () {
        clearTimeout(t);
        t = setTimeout(refresh, 200);
      });
    }
  });
})();
