document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");
  const heroBg = document.getElementById("heroBg");
  const reservationBg = document.getElementById("reservationBg");
  const reservationForm = document.getElementById("reservationForm");
  const dateInput = document.getElementById("reservation-date");
  const timeSelect = document.getElementById("time");
  const themeToggle = document.getElementById("themeToggle");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const dietBtns = document.querySelectorAll(".diet-btn");
  const cuisineDropdown = document.getElementById("cuisine-filter");
  const menuSearch = document.getElementById("menu-search");
  const heroScroll = document.querySelector(".hero-scroll");
  const backToTopBtn = document.getElementById("backToTop");
  const orderDock = document.getElementById("orderDock");
  const orderToggle = document.getElementById("orderToggle");
  const orderTabs = document.querySelectorAll(".order-tab");
  const orderViews = document.querySelectorAll(".order-view");
  const cartItemsEl = document.getElementById("cartItems");
  const favoriteItemsEl = document.getElementById("favoriteItems");
  const cartCountEl = document.getElementById("cartCount");
  const cartTotalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  let currentCategory = "all";
  let currentDiet = "all";
  let autoScrollInterval = null;
  let cart = loadStoredList("lighthouse_cart");
  let favorites = loadStoredList("lighthouse_favorites");

  function loadStoredList(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function saveStoredList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function setReservationDateRange() {
    if (!dateInput) return;

    const tomorrow = new Date(Date.now() + 86400000);
    const maxDate = new Date(Date.now() + 90 * 86400000);

    dateInput.min = tomorrow.toISOString().split("T")[0];
    dateInput.max = maxDate.toISOString().split("T")[0];
  }

  function updateAvailableTimes() {
    if (!dateInput || !timeSelect) return;

    const selectedDate = dateInput.value;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    timeSelect.querySelectorAll("option").forEach((option) => {
      if (!option.value) return;

      const [hours, minutes] = option.value.split(":").map(Number);
      const optionMinutes = hours * 60 + minutes;
      const currentMinutes = today.getHours() * 60 + today.getMinutes() + 30;
      const isPastToday = selectedDate === todayStr && optionMinutes <= currentMinutes;

      option.disabled = isPastToday;
      if (isPastToday && option.selected) {
        timeSelect.value = "";
      }
    });
  }

  function closeMobileMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.style.overflow = "";
  }

  function toggleMobileMenu() {
    if (!navToggle || !navMenu) return;
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
    document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "";
  }

  function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 150;

    document.querySelectorAll("section[id]").forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;
      const sectionId = section.id;

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.dataset.section === sectionId);
        });
      }
    });
  }

  function handleScroll() {
    const currentScroll = window.scrollY;

    if (nav) {
      nav.classList.toggle("scrolled", currentScroll > 50);
    }

    if (!isTouchDevice) {
      if (heroBg) {
        heroBg.style.transform = `translateY(${currentScroll * 0.5}px)`;
      }

      const reservationSection = document.getElementById("reservation");
      if (reservationBg && reservationSection && currentScroll > window.innerHeight) {
        const offset = (currentScroll - reservationSection.offsetTop) * 0.3;
        reservationBg.style.transform = `translateY(${offset}px)`;
      }
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle("visible", currentScroll > 300);
    }

    updateActiveNavLink();
  }

  function smoothScroll(event) {
    const targetId = event.currentTarget.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: target.offsetTop - 80,
      behavior: prefersReduced ? "auto" : "smooth",
    });

    closeMobileMenu();
  }

  function filterMenuItems() {
    const cuisine = cuisineDropdown ? cuisineDropdown.value : "all";
    const search = menuSearch ? menuSearch.value.trim().toLowerCase() : "";
    let visibleCount = 0;

    document.querySelectorAll(".menu-content .menu-item").forEach((item) => {
      const title = item.querySelector("h3")?.textContent.toLowerCase() || "";
      const category = item.dataset.category || "all";
      const itemCuisine = item.dataset.cuisine || "all";
      const itemDiet = item.dataset.diet || (item.querySelector(".food-tag.nonveg") ? "non-veg" : "veg");
      const matchesCategory =
        currentCategory === "all" ||
        category === currentCategory ||
        (currentCategory === "veg" && itemDiet === "veg") ||
        (currentCategory === "nonveg" && itemDiet === "non-veg");

      const visible =
        matchesCategory &&
        (cuisine === "all" || itemCuisine === cuisine) &&
        (currentDiet === "all" || itemDiet === currentDiet) &&
        title.includes(search);

      item.classList.toggle("hidden-item", !visible);
      if (visible) visibleCount++;
    });

    let noResults = document.querySelector(".menu-content .no-results");
    if (!noResults) {
      noResults = document.createElement("p");
      noResults.className = "no-results";
      noResults.textContent = "No menu items found.";
      document.querySelector(".menu-content")?.appendChild(noResults);
    }
    noResults.style.display = visibleCount === 0 ? "block" : "none";
  }

  function setupThemeToggle() {
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem("theme");
    document.body.classList.toggle("light-theme", savedTheme === "light");
    themeToggle.textContent = savedTheme === "light" ? "\u2600" : "\u263E";

    themeToggle.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-theme");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      themeToggle.textContent = isLight ? "\u2600" : "\u263E";
    });
  }

  function validateReservationForm(event) {
    event.preventDefault();
    if (!reservationForm) return;

    let isValid = true;
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");

    reservationForm.querySelectorAll(".error-message").forEach((error) => error.remove());

    reservationForm.querySelectorAll("input, select, textarea").forEach((input) => {
      const invalid = input.required && !input.value.trim();
      input.style.borderColor = invalid ? "#c94a4a" : "";
      if (invalid) isValid = false;
    });

    if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim())) {
      addError(emailInput, "Please enter a valid email address.");
      isValid = false;
    }

    if (phoneInput && phoneInput.value.replace(/\D/g, "").length !== 10) {
      addError(phoneInput, "Phone number must contain exactly 10 digits.");
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Reservation Requested!";
    submitBtn.style.backgroundColor = "#4a9c6a";
    submitBtn.disabled = true;

    setTimeout(() => {
      reservationForm.reset();
      updateAvailableTimes();
      submitBtn.textContent = originalText;
      submitBtn.style.backgroundColor = "";
      submitBtn.disabled = false;
    }, 3000);
  }

  function addError(input, message) {
    input.style.borderColor = "#c94a4a";

    const error = document.createElement("small");
    error.className = "error-message";
    error.style.color = "#c94a4a";
    error.textContent = message;
    input.parentElement.appendChild(error);
  }

  function setupIntersectionObserver() {
    const animatedElements = document.querySelectorAll(
      ".about-content, .menu-panel, .reservation-form, .location-info"
    );
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      animatedElements.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -50px 0px" }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

  function setupAutoScroll() {
    if (!heroScroll) return;

    function stopAutoScroll() {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    }

    function startAutoScroll() {
      autoScrollInterval = setInterval(() => {
        window.scrollBy({ top: 2, behavior: "auto" });
        if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
          stopAutoScroll();
        }
      }, 15);
    }

    heroScroll.addEventListener("click", () => {
      autoScrollInterval ? stopAutoScroll() : startAutoScroll();
    });

    ["mousemove", "touchstart", "keydown", "wheel", "pointerdown"].forEach((eventName) => {
      window.addEventListener(eventName, stopAutoScroll, { passive: true });
    });
  }

  function setupReviews() {
    const storageKey = "lighthouse_reviews";
    const reviewForm = document.getElementById("review-form");
    const reviewMsg = document.getElementById("review-msg");
    const starBtns = document.querySelectorAll("#star-input .star-btn");
    let selectedRating = 0;

    const pinnedReview = {
      name: "Rasshi Srivastav",
      rating: 5,
      text: "Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant. A truly memorable dining experience - will definitely be coming back!",
      date: "14 May 2026",
    };

    function getReviews() {
      try {
        return JSON.parse(localStorage.getItem(storageKey)) || [];
      } catch {
        return [];
      }
    }

    function renderReviews() {
      const grid = document.getElementById("reviews-grid");
      if (!grid) return;

      grid.innerHTML = "";
      [pinnedReview, ...getReviews()].forEach((review) => {
        const card = document.createElement("div");
        card.className = "review-card";
        const stars = "\u2605".repeat(review.rating) + "\u2606".repeat(5 - review.rating);

        card.innerHTML = `
          <div class="review-stars">${stars}</div>
          <p class="review-text"></p>
          <div class="review-author">
            <div class="review-avatar"></div>
            <div>
              <span class="review-name"></span>
              <span class="review-date"></span>
            </div>
          </div>
        `;

        card.querySelector(".review-text").textContent = review.text;
        card.querySelector(".review-avatar").textContent = review.name.slice(0, 2).toUpperCase();
        card.querySelector(".review-name").textContent = review.name;
        card.querySelector(".review-date").textContent = review.date;
        grid.appendChild(card);
      });
    }

    function isValidName(name) {
      return /^[A-Za-z\s'-]{3,30}$/.test(name.trim());
    }

    function isMeaningfulReview(text) {
      const value = text.trim();
      const words = value.split(/\s+/);
      return words.length >= 3 && !/^(.)\1+$|^[a-zA-Z]{1,6}$/.test(value);
    }

    starBtns.forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        const value = Number(btn.dataset.value);
        starBtns.forEach((star) => star.classList.toggle("active", Number(star.dataset.value) <= value));
      });

      btn.addEventListener("mouseleave", () => {
        starBtns.forEach((star) => star.classList.toggle("active", Number(star.dataset.value) <= selectedRating));
      });

      btn.addEventListener("click", () => {
        selectedRating = Number(btn.dataset.value);
        document.getElementById("review-rating").value = selectedRating;
        starBtns.forEach((star) => star.classList.toggle("active", Number(star.dataset.value) <= selectedRating));
      });
    });

    if (reviewForm) {
      reviewForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("review-name").value.trim();
        const text = document.getElementById("review-text").value.trim();
        reviewMsg.style.display = "block";

        if (!selectedRating) {
          reviewMsg.textContent = "Please select a star rating.";
          reviewMsg.style.color = "#c94a4a";
          return;
        }

        if (!isValidName(name)) {
          reviewMsg.textContent = "Name should contain only letters and be 3-30 characters long.";
          reviewMsg.style.color = "#c94a4a";
          return;
        }

        if (text.length < 20 || !isMeaningfulReview(text)) {
          reviewMsg.textContent = "Please enter a meaningful review of at least 20 characters.";
          reviewMsg.style.color = "#c94a4a";
          return;
        }

        const reviews = getReviews();
        reviews.unshift({
          id: Date.now(),
          name,
          rating: selectedRating,
          text,
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
        });

        localStorage.setItem(storageKey, JSON.stringify(reviews));
        renderReviews();
        reviewForm.reset();
        selectedRating = 0;
        document.getElementById("review-rating").value = 0;
        starBtns.forEach((star) => star.classList.remove("active"));

        reviewMsg.textContent = "Review submitted successfully!";
        reviewMsg.style.color = "#4a9c6a";
        setTimeout(() => {
          reviewMsg.style.display = "none";
        }, 3000);
      });
    }

    renderReviews();
  }

  function getMenuItemData(item) {
    const title = item.querySelector("h3")?.textContent.trim() || "Menu item";
    const priceText = item.querySelector(".menu-price")?.textContent || "0";
    const price = Number(priceText.replace(/[^\d.]/g, "")) || 0;
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const image = item.querySelector("img")?.getAttribute("src") || "";

    return { id, title, price, image };
  }

  function setupOrderFeatures() {
    const menuItems = document.querySelectorAll(".menu-content .menu-item");
    if (!menuItems.length || !orderDock) return;

    menuItems.forEach((item) => {
      const data = getMenuItemData(item);
      item.dataset.itemId = data.id;

      const actions = document.createElement("div");
      actions.className = "menu-actions";
      actions.innerHTML = `
        <button class="menu-action-btn add-cart-btn" type="button" data-id="${data.id}">Add</button>
        <button class="menu-action-btn favorite-btn" type="button" data-id="${data.id}" aria-label="Add ${data.title} to favourites">\u2661</button>
      `;

      item.querySelector(".food-content")?.appendChild(actions);

      actions.querySelector(".add-cart-btn")?.addEventListener("click", () => addToCart(data));
      actions.querySelector(".favorite-btn")?.addEventListener("click", () => toggleFavorite(data));
    });

    orderToggle?.addEventListener("click", () => {
      const isOpen = orderDock.classList.toggle("open");
      orderToggle.setAttribute("aria-expanded", String(isOpen));
    });

    orderTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetView = tab.dataset.orderView;
        orderTabs.forEach((item) => item.classList.toggle("active", item === tab));
        orderViews.forEach((view) => view.classList.toggle("active", view.id === `${targetView}View`));
      });
    });

    checkoutBtn?.addEventListener("click", () => {
      if (!cart.length) return;

      const summary = cart.map((item) => `${item.qty} x ${item.title}`).join(", ");
      checkoutBtn.textContent = "Order Ready!";
      checkoutBtn.title = summary;
      setTimeout(() => {
        checkoutBtn.textContent = "Review Order";
        checkoutBtn.title = "";
      }, 2200);
    });

    renderOrderState();
  }

  function addToCart(item) {
    const existing = cart.find((cartItem) => cartItem.id === item.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }

    saveStoredList("lighthouse_cart", cart);
    renderOrderState();
    orderDock?.classList.add("open");
    orderToggle?.setAttribute("aria-expanded", "true");
  }

  function updateCartQty(id, delta) {
    const item = cart.find((cartItem) => cartItem.id === id);
    if (!item) return;

    item.qty += delta;
    cart = cart.filter((cartItem) => cartItem.qty > 0);
    saveStoredList("lighthouse_cart", cart);
    renderOrderState();
  }

  function toggleFavorite(item) {
    const exists = favorites.some((favorite) => favorite.id === item.id);
    favorites = exists
      ? favorites.filter((favorite) => favorite.id !== item.id)
      : [...favorites, item];

    saveStoredList("lighthouse_favorites", favorites);
    renderOrderState();
  }

  function renderOrderState() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (cartCountEl) cartCountEl.textContent = totalCount;
    if (cartTotalEl) cartTotalEl.textContent = `\u20B9${totalPrice}`;
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    document.querySelectorAll(".favorite-btn").forEach((btn) => {
      const isFavorite = favorites.some((item) => item.id === btn.dataset.id);
      btn.classList.toggle("active", isFavorite);
      btn.textContent = isFavorite ? "\u2665" : "\u2661";
    });

    renderCartItems();
    renderFavoriteItems();
  }

  function renderCartItems() {
    if (!cartItemsEl) return;

    cartItemsEl.innerHTML = "";
    if (!cart.length) {
      cartItemsEl.innerHTML = '<p class="order-empty">Your cart is empty.</p>';
      return;
    }

    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "order-item";
      row.innerHTML = `
        <div>
          <strong></strong>
          <span>\u20B9${item.price} each</span>
        </div>
        <div class="qty-control">
          <button type="button" data-action="decrease">-</button>
          <span>${item.qty}</span>
          <button type="button" data-action="increase">+</button>
        </div>
      `;

      row.querySelector("strong").textContent = item.title;
      row.querySelector('[data-action="decrease"]').addEventListener("click", () => updateCartQty(item.id, -1));
      row.querySelector('[data-action="increase"]').addEventListener("click", () => updateCartQty(item.id, 1));
      cartItemsEl.appendChild(row);
    });
  }

  function renderFavoriteItems() {
    if (!favoriteItemsEl) return;

    favoriteItemsEl.innerHTML = "";
    if (!favorites.length) {
      favoriteItemsEl.innerHTML = '<p class="order-empty">No favourites yet.</p>';
      return;
    }

    favorites.forEach((item) => {
      const row = document.createElement("div");
      row.className = "order-item";
      row.innerHTML = `
        <div>
          <strong></strong>
          <span>\u20B9${item.price}</span>
        </div>
        <button class="mini-add-btn" type="button">Add</button>
      `;

      row.querySelector("strong").textContent = item.title;
      row.querySelector(".mini-add-btn").addEventListener("click", () => addToCart(item));
      favoriteItemsEl.appendChild(row);
    });
  }

  function initSkeletonLoaders() {
    document.querySelectorAll(".food-card img, .hero-bg img, .about-image img, .reservation-bg img").forEach((img) => {
      img.classList.add("image-hidden");

      const revealImage = () => {
        img.classList.remove("image-hidden");
        img.classList.add("image-loaded");
      };

      if (img.complete && img.naturalWidth > 0) {
        revealImage();
      } else {
        img.addEventListener("load", revealImage, { once: true });
        img.addEventListener("error", revealImage, { once: true });
      }
    });
  }

  setReservationDateRange();
  updateAvailableTimes();
  setupThemeToggle();
  setupIntersectionObserver();
  setupAutoScroll();
  setupReviews();
  setupOrderFeatures();
  initSkeletonLoaders();
  filterMenuItems();
  handleScroll();

  dateInput?.addEventListener("change", updateAvailableTimes);
  navToggle?.addEventListener("click", toggleMobileMenu);
  reservationForm?.addEventListener("submit", validateReservationForm);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeMobileMenu();
  });

  navLinks.forEach((link) => link.addEventListener("click", smoothScroll));
  document.querySelectorAll(".nav-cta, .nav-cta-mobile, .hero-buttons a").forEach((link) => {
    link.addEventListener("click", smoothScroll);
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.filter || "all";
      filterMenuItems();
    });
  });

  dietBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      dietBtns.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      currentDiet = btn.dataset.diet || "all";
      filterMenuItems();
    });
  });

  cuisineDropdown?.addEventListener("change", filterMenuItems);
  menuSearch?.addEventListener("input", filterMenuItems);

  backToTopBtn?.addEventListener("click", () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });
});
