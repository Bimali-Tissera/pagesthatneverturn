(function () {
  "use strict";

  var app = document.getElementById("app");

  // ── Helpers ─────────────────────────────────────────────

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (typeof c === "string") node.appendChild(document.createTextNode(c));
        else if (c) node.appendChild(c);
      });
    }
    return node;
  }

  // ── Update meta tags ───────────────────────────────────

  function renderMeta(meta) {
    if (meta.pageTitle) document.title = meta.pageTitle;
    var ogImg = document.querySelector('meta[property="og:title"]');
    if (ogImg && meta.pageTitle) ogImg.setAttribute("content", meta.pageTitle);
  }

  // ── Masthead ───────────────────────────────────────────

  function renderMasthead(masthead) {
    var wrapper = el("section", { className: "masthead" });
    wrapper.style.backgroundImage = "url('" + masthead.backgroundImage + "')";

    var overlay = el("div", { className: "masthead__overlay" }, [
      el("h1", { className: "masthead__title" }, masthead.artistName),
      el("h2", { className: "masthead__subtitle" }, masthead.exhibitionTitle)
    ]);
    wrapper.appendChild(overlay);

    // Scroll-down arrow
    var arrow = el("a", { href: "#bio", className: "masthead__arrow" });
    arrow.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
    wrapper.appendChild(arrow);

    return wrapper;
  }

  // ── Header ─────────────────────────────────────────────

  function renderHeader(header) {
    var wrapper = el("header", { className: "site-header" }, [
      el("h1", { className: "artist-name" }, header.artistName),
      el("h2", { className: "exhibition-title" }, header.exhibitionTitle)
    ]);
    return wrapper;
  }

  // ── Bio ────────────────────────────────────────────────

  function renderBio(bio) {
    if (!bio || !bio.paragraphs || bio.paragraphs.length === 0) return null;
    var children = [];
    if (bio.image) {
      children.push(el("img", { src: bio.image, alt: "", className: "bio__image", loading: "lazy" }));
    }
    bio.paragraphs.forEach(function (p) {
      children.push(el("p", null, p));
    });
    return el("section", { className: "section section--text bio", id: "bio" }, children);
  }

  // ── Sections ───────────────────────────────────────────

  function placeholder(id) {
    return el("div", { className: "placeholder" }, [
      el("span", { className: "placeholder__label" }, id)
    ]);
  }

  function renderImage(s) {
    var children = [];
    if (s.src) {
      children.push(el("img", { src: s.src, alt: s.alt || "", loading: "lazy" }));
    } else {
      children.push(placeholder(s.id));
    }
    if (s.caption) {
      children.push(el("p", { className: "caption" }, s.caption));
    }
    return el("section", { className: "section section--image", id: s.id }, children);
  }

  function renderImagePair(s) {
    var imgs = s.images.map(function (img, i) {
      var itemChildren = [];
      if (img.src) {
        itemChildren.push(el("img", { src: img.src, alt: img.alt || "", loading: "lazy" }));
      } else {
        itemChildren.push(placeholder(s.id + "-" + (i + 1)));
      }
      if (img.caption) {
        itemChildren.push(el("p", { className: "caption" }, img.caption));
      }
      return el("div", { className: "image-pair__item" }, itemChildren);
    });
    var wrapper = el("section", { className: "section section--image-pair", id: s.id }, imgs);
    if (s.ratio === "40-60") {
      wrapper.style.gridTemplateColumns = "2fr 3fr";
    }
    return wrapper;
  }

  function renderVideo(s) {
    var children = [];
    if (s.src) {
      var video = el("video", {
        controls: "",
        playsinline: "",
        preload: "metadata",
        width: "100%"
      });
      if (s.poster) video.setAttribute("poster", s.poster);
      var source = el("source", { src: s.src, type: "video/mp4" });
      video.appendChild(source);
      children.push(video);
    } else {
      children.push(placeholder(s.id));
    }
    if (s.caption) {
      children.push(el("p", { className: "caption" }, s.caption));
    }
    return el("section", { className: "section section--video", id: s.id }, children);
  }

  function renderText(s) {
    var children = [];
    if (s.heading) {
      children.push(el("h3", { className: "section-heading" }, s.heading));
    }
    if (s.paragraphs) {
      s.paragraphs.forEach(function (p) {
        children.push(el("p", null, p));
      });
    }
    if (children.length === 0) return null;
    return el("section", { className: "section section--text", id: s.id }, children);
  }

  function renderContact(s) {
    var img = el("div", { className: "contact__image" }, [
      el("img", { src: s.image, alt: "", loading: "lazy" })
    ]);
    var items = s.details.map(function (d) {
      var val;
      if (d.url) {
        val = el("a", { href: d.url, target: "_blank", rel: "noopener" }, d.value);
      } else {
        val = document.createTextNode(d.value);
      }
      return el("p", { className: "contact__item" }, [
        el("span", { className: "contact__label" }, d.label + " :  "),
        val
      ]);
    });
    var info = el("div", { className: "contact__info" }, items);
    var heading = el("h3", { className: "section-heading contact__heading" }, "Contact");
    return el("section", { className: "section section--contact", id: s.id }, [heading, img, info]);
  }

  function renderArticles(s) {
    var children = [];
    if (s.heading) {
      children.push(el("h3", { className: "section-heading" }, s.heading));
    }
    if (s.items) {
      var list = s.items.map(function (item) {
        var attrs = { href: item.url, className: "article-card" };
        if (item.external) {
          attrs.target = "_blank";
          attrs.rel = "noopener";
        }
        var cardChildren = [];
        if (item.thumbnail) {
          cardChildren.push(el("img", { src: item.thumbnail, alt: item.title || "", loading: "lazy" }));
        }
        cardChildren.push(el("span", { className: "article-card__title" }, item.title || ""));
        return el("a", attrs, cardChildren);
      });
      children.push(el("div", { className: "articles__list" }, list));
    }
    return el("section", { className: "section section--articles", id: s.id }, children);
  }

  function renderSection(s) {
    switch (s.type) {
      case "image":      return renderImage(s);
      case "image-pair": return renderImagePair(s);
      case "video":      return renderVideo(s);
      case "text":       return renderText(s);
      case "articles":   return renderArticles(s);
      case "contact":    return renderContact(s);
      default:           return null;
    }
  }

  // ── Footer ─────────────────────────────────────────────

  function renderFooter(footer) {
    var children = [];

    if (footer.galleryName) {
      children.push(el("p", { className: "footer-gallery" }, footer.galleryName));
    }
    if (footer.address) {
      children.push(el("p", { className: "footer-address" }, footer.address));
    }

    var contactParts = [];
    if (footer.email) {
      contactParts.push(el("a", { href: "mailto:" + footer.email }, footer.email));
    }
    if (footer.phone) {
      if (contactParts.length > 0) {
        contactParts.push(document.createTextNode("  \u00B7  "));
      }
      contactParts.push(el("a", { href: "tel:" + footer.phone }, footer.phone));
    }
    if (footer.website) {
      if (contactParts.length > 0) {
        contactParts.push(document.createTextNode("  \u00B7  "));
      }
      contactParts.push(el("a", { href: footer.website, target: "_blank", rel: "noopener" }, footer.website.replace(/^https?:\/\//, "")));
    }
    if (contactParts.length > 0) {
      children.push(el("p", { className: "footer-contact" }, contactParts));
    }

    if (footer.socialLinks && footer.socialLinks.length > 0) {
      var links = footer.socialLinks.map(function (link) {
        return el("a", { href: link.url, target: "_blank", rel: "noopener", className: "social-link" }, link.label);
      });
      children.push(el("p", { className: "footer-social" }, links));
    }

    children.push(
      el("a", { href: "#top", className: "back-to-top" }, "Back to Top")
    );

    children.push(el("p", { className: "footer-credit" }, "Site by Bimali Tissera"));

    return el("footer", { className: "site-footer" }, children);
  }

  // ── Main Render ────────────────────────────────────────

  function render(data) {
    var fragment = document.createDocumentFragment();

    // Meta
    renderMeta(data.meta);

    // Masthead
    if (data.masthead) {
      fragment.appendChild(renderMasthead(data.masthead));
    }

    // Header
    fragment.appendChild(renderHeader(data.header));

    // Bio
    var bio = renderBio(data.bio);
    if (bio) fragment.appendChild(bio);

    // Content wrapper
    var content = el("main", { className: "site-content", id: "content" });
    data.sections.forEach(function (s) {
      var node = renderSection(s);
      if (node) content.appendChild(node);
    });
    fragment.appendChild(content);

    // Footer
    fragment.appendChild(renderFooter(data.footer));

    app.appendChild(fragment);
  }

  // ── Lightbox ──────────────────────────────────────────

  function initLightbox() {
    // Collect all gallery images on the page
    var allImages = [];
    var imgs = document.querySelectorAll(
      ".section--image img, .section--image-pair img"
    );
    imgs.forEach(function (img) {
      allImages.push(img.getAttribute("src"));
    });

    var currentIndex = 0;

    // Build lightbox DOM
    var overlay = el("div", { className: "lightbox" });
    var closeBtn = el("button", { className: "lightbox__close" });
    closeBtn.innerHTML = "&times;";
    var prevBtn = el("button", { className: "lightbox__arrow lightbox__arrow--prev" });
    prevBtn.innerHTML = "&#8249;";
    var nextBtn = el("button", { className: "lightbox__arrow lightbox__arrow--next" });
    nextBtn.innerHTML = "&#8250;";
    var imgEl = el("img", { className: "lightbox__img" });
    var counter = el("span", { className: "lightbox__counter" });

    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(imgEl);
    overlay.appendChild(nextBtn);
    overlay.appendChild(counter);
    document.body.appendChild(overlay);

    function show(index) {
      currentIndex = index;
      imgEl.setAttribute("src", allImages[currentIndex]);
      counter.textContent = (currentIndex + 1) + " / " + allImages.length;
      overlay.classList.add("lightbox--open");
      document.body.style.overflow = "hidden";
    }

    function hide() {
      overlay.classList.remove("lightbox--open");
      document.body.style.overflow = "";
    }

    function prev() {
      show(currentIndex <= 0 ? allImages.length - 1 : currentIndex - 1);
    }

    function next() {
      show(currentIndex >= allImages.length - 1 ? 0 : currentIndex + 1);
    }

    // Click handlers on gallery images
    imgs.forEach(function (img, i) {
      img.style.cursor = "pointer";
      img.addEventListener("click", function () {
        show(i);
      });
    });

    closeBtn.addEventListener("click", hide);
    prevBtn.addEventListener("click", function (e) { e.stopPropagation(); prev(); });
    nextBtn.addEventListener("click", function (e) { e.stopPropagation(); next(); });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) hide();
    });

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("lightbox--open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });
  }

  // ── Go ─────────────────────────────────────────────────

  render(siteData);
  initLightbox();

})();
