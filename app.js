const PAYMENT_LINKS = {
  paypal: "https://www.paypal.com/paypalme/angolodellerisposte",
  satispay: "https://web.satispay.com/download/qrcode/S6Y-SVN--1A46081A-E2F9-446F-B4D7-3DCA97A360C2?locale=it_IT",
};

const ORDER_DESTINATION = {
  email: "angolodellerisposte@gmail.com",
  endpoint: "https://script.google.com/macros/s/AKfycbwv4kgkd2PSprrpTTH9ejI-9RNJoJLBtCBOCrYaAqpb-C5ibomWC8yeVtk3a7GyMdgs8A/exec",
};

const POSTEPAY_DETAILS = {
  holder: "Paola Zagoner",
  card: "4023601041327461",
  taxCode: "ZGNPLA83D54L219T",
};

const FIRST_ITEM_SHIPPING = 4.95;
const ADDITIONAL_SHIPPING = {
  cap: 1.95,
  tee: 1.45,
  baby: 1.45,
};
const PAYPAL_FEE_RATE = 0.034;
const PAYPAL_FIXED_FEE = 0.35;
const OFFER_END_AT = new Date("2026-06-19T23:59:00+02:00");

const products = [
  {
    id: "tee-fronte-retro",
    type: "tee",
    group: "tees",
    name: "Fronte + retro",
    description: "Logo davanti e frase dietro, con stampa su entrambi i lati.",
    listPrice: 23.9,
    price: 17.95,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "./tee-fronte-retro-model.png",
      "./tee-fronte-retro-product.png",
      "./tee-fronte-logo-lifestyle.png",
      "./tee-retro-lifestyle.png",
    ],
  },
  {
    id: "tee-solo-fronte",
    type: "tee",
    group: "tees",
    name: "Solo fronte",
    description: "Logo frontale discreto su cotone morbido e taglio sfiancato.",
    listPrice: 19.9,
    price: 12.95,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: ["./tee-fronte-logo-lifestyle.png", "./tee-fronte-logo-product.png"],
  },
  {
    id: "tee-solo-retro",
    type: "tee",
    group: "tees",
    name: "Solo retro",
    description: "Maglia nera con messaggio sul retro.",
    listPrice: 19.9,
    price: 12.95,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: ["./tee-retro-lifestyle.png", "./tee-retro-product.png"],
  },
  {
    id: "tee-solo-fronte-scritta",
    type: "tee",
    group: "tees",
    name: "Solo fronte con scritta",
    description: "Maglia nera con messaggio Non sono difficile sono Ariete sul fronte.",
    listPrice: 19.9,
    price: 12.95,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: ["./tee-fronte-scritta-lifestyle.png", "./tee-fronte-scritta-product.png"],
  },
  {
    id: "body-mini-ariete",
    type: "baby",
    group: "baby",
    name: "Body Arietiny",
    description: "Body bianco per piccoli Ariete in crescita.",
    listPrice: 18.9,
    price: 16,
    sizes: ["3-6M", "6-12M", "12-18M", "18-24M"],
    images: ["./body-fronte-retro-product.png"],
  },
  {
    id: "cap-ariete-black",
    type: "cap",
    group: "caps",
    name: "Ariete Inside nero",
    description: "Cappellino nero con logo Inside, taglia unica regolabile, 100% cotone.",
    listPrice: 15.9,
    price: 11,
    sizes: ["Taglia unica"],
    images: ["./cap-nero-logo-front.png", "./cap-nero-logo-lifestyle.png"],
  },
  {
    id: "cap-ariete-white",
    type: "cap",
    group: "caps",
    name: "Ariete Inside bianco",
    description: "Cappellino bianco con logo Inside, taglia unica regolabile, 100% cotone.",
    listPrice: 15.9,
    price: 11,
    sizes: ["Taglia unica"],
    images: ["./cap-bianco-front.png", "./cap-bianco-lifestyle.png"],
  },
  {
    id: "cap-non-sono-difficile",
    type: "cap",
    group: "caps",
    name: "Non sono difficile sono Ariete",
    description: "Cappellino nero con frase frontale Non sono difficile sono Ariete, taglia unica regolabile.",
    listPrice: 15.9,
    price: 11,
    sizes: ["Taglia unica"],
    images: ["./cap-nero-scritta-front.png", "./cap-nero-scritta-lifestyle.png"],
  },
];

const cart = [];
const formatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const grids = {
  caps: document.querySelector('[data-product-grid="caps"]'),
  tees: document.querySelector('[data-product-grid="tees"]'),
  baby: document.querySelector('[data-product-grid="baby"]'),
};
const cartCount = document.querySelector("[data-cart-count]");
const cartLines = document.querySelector("[data-cart-lines]");
const subtotalNode = document.querySelector("[data-subtotal]");
const shippingNode = document.querySelector("[data-shipping]");
const totalNode = document.querySelector("[data-total]");
const paypalTotalNode = document.querySelector("[data-paypal-total]");
const satispayTotalNode = document.querySelector("[data-satispay-total]");
const toast = document.querySelector("[data-toast]");
const countdownNode = document.querySelector("[data-countdown]");
const countdownLabelNode = document.querySelector("[data-countdown-label]");
const countdownCard = document.querySelector("[data-countdown-card]");

function money(value) {
  return formatter.format(value).replace(/\s/g, " ");
}

function isLaunchActive() {
  return Date.now() < OFFER_END_AT.getTime();
}

function productPrice(product) {
  return isLaunchActive() ? product.price : product.listPrice;
}

function shippingTotal(items) {
  if (items.length === 0) return 0;
  const additionalRates = items.flatMap((item) => Array.from({ length: item.quantity || 1 }, () => ADDITIONAL_SHIPPING[item.type]));
  const highestAdditionalRate = Math.max(...additionalRates);
  const additionalTotal = additionalRates.reduce((sum, rate) => sum + rate, 0);
  return FIRST_ITEM_SHIPPING + additionalTotal - highestAdditionalRate;
}

function cartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const shipping = shippingTotal(cart);
  const baseTotal = subtotal + shipping;
  const paypalTotal = baseTotal > 0 ? (baseTotal + PAYPAL_FIXED_FEE) / (1 - PAYPAL_FEE_RATE) : 0;
  return {
    subtotal,
    shipping,
    total: baseTotal,
    paypalFee: paypalTotal - baseTotal,
    paypalTotal,
  };
}

function productTotalWithFirstShipping(product) {
  return productPrice(product) + FIRST_ITEM_SHIPPING;
}

function renderProduct(product) {
  const selectedSize = product.sizes[0];
  const mediaClass = product.images.length > 1 ? "duo" : "single";
  const launchActive = isLaunchActive();
  const currentPrice = productPrice(product);
  const discount = launchActive && product.listPrice ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100) : 0;
  const galleryDots =
    product.images.length > 1
      ? `
        <div class="gallery-dots" aria-label="Altre foto del prodotto">
          ${product.images
            .map(
              (_, index) => `
                <button
                  class="gallery-dot ${index === 0 ? "active" : ""}"
                  type="button"
                  data-slide="${index}"
                  aria-label="Guarda foto ${index + 1} di ${product.images.length}"
                ></button>
              `,
            )
            .join("")}
        </div>
      `
      : "";
  return `
    <article class="product-card">
      ${launchActive ? '<div class="launch-badge">Offerta lancio primi 30 ordini</div>' : '<div class="launch-badge expired">Prezzo pieno attivo</div>'}
      <div class="product-media ${mediaClass}">
        ${product.images
          .map(
            (image, index) => `
              <button
                class="gallery-frame"
                type="button"
                data-lightbox-src="${image}"
                data-lightbox-alt="${product.name} - foto ${index + 1}"
              >
                <img src="${image}" alt="${product.name} - foto ${index + 1}" />
              </button>
            `,
          )
          .join("")}
      </div>
      ${galleryDots}
      <div class="product-copy">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">
          ${
            launchActive && product.listPrice
              ? `<span class="was-price">Prezzo pieno <s>${money(product.listPrice)}</s></span>`
              : ""
          }
          <strong>${money(currentPrice)}</strong>
          <span>${launchActive ? "Prezzo lancio senza spedizione" : "Prezzo pieno senza spedizione"}</span>
          ${discount ? `<b>Risparmi ${discount}% ora</b>` : ""}
          <span>+ ${money(FIRST_ITEM_SHIPPING)} spedizione</span>
          <em>${money(productTotalWithFirstShipping(product))} totale</em>
        </div>
      </div>
      <div class="options" data-options="${product.id}">
        ${product.sizes
          .map(
            (size) => `
              <button
                class="option ${size === selectedSize ? "selected" : ""}"
                type="button"
                data-size="${size}"
                aria-pressed="${size === selectedSize ? "true" : "false"}"
              >${size}</button>
            `,
          )
          .join("")}
      </div>
      <div class="quantity-control" aria-label="Quantita">
        <button type="button" data-qty-minus="${product.id}" aria-label="Diminuisci quantita">-</button>
        <input type="number" min="1" max="20" value="1" inputmode="numeric" data-qty="${product.id}" aria-label="Quantita ${product.name}" />
        <button type="button" data-qty-plus="${product.id}" aria-label="Aumenta quantita">+</button>
      </div>
      <button class="add-button" type="button" data-add="${product.id}">
        Aggiungi
      </button>
      <button class="checkout-button" type="button" data-go-cart>
        Vai al carrello
      </button>
    </article>
  `;
}

function renderProducts() {
  Object.entries(grids).forEach(([group, grid]) => {
    grid.innerHTML = products.filter((product) => product.group === group).map(renderProduct).join("");
  });
  initializeGalleries();
}

function initializeGalleries() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const media = card.querySelector(".product-media");
    const dots = [...card.querySelectorAll("[data-slide]")];
    if (!media || dots.length === 0) return;

    let animationFrame = 0;
    const updateDots = () => {
      const index = Math.round(media.scrollLeft / Math.max(media.clientWidth, 1));
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === index);
      });
    };

    media.addEventListener(
      "scroll",
      () => {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = window.requestAnimationFrame(updateDots);
      },
      { passive: true },
    );
    updateDots();
  });
}

function openLightbox(src, alt) {
  const lightbox = document.querySelector("[data-lightbox]");
  const image = document.querySelector("[data-lightbox-image]");
  if (!lightbox || !image) return;
  image.src = src;
  image.alt = alt;
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  const lightbox = document.querySelector("[data-lightbox]");
  const image = document.querySelector("[data-lightbox-image]");
  if (!lightbox || !image) return;
  lightbox.hidden = true;
  image.removeAttribute("src");
  image.alt = "";
  document.body.classList.remove("lightbox-open");
}

function renderCountdown() {
  if (!countdownNode || !countdownLabelNode || !countdownCard) return;
  const remaining = OFFER_END_AT.getTime() - Date.now();

  if (remaining <= 0) {
    countdownCard.classList.add("expired");
    countdownNode.textContent = "00:00:00";
    countdownLabelNode.textContent = "Offerta terminata: sono attivi i prezzi pieni.";
    return;
  }

  countdownCard.classList.remove("expired");
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const timeParts = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  countdownNode.textContent = days > 0 ? `${days}g ${timeParts}` : timeParts;
  countdownLabelNode.textContent = "Alla scadenza tornano i prezzi pieni.";
}

function syncCartPrices() {
  cart.forEach((item) => {
    const product = products.find((candidate) => candidate.id === item.id);
    if (product) item.price = productPrice(product);
  });
}

function selectedSize(productId) {
  const selected = document.querySelector(`[data-options="${productId}"] .option.selected`);
  return selected?.dataset.size || "Taglia unica";
}

function selectedQuantity(productId) {
  const input = document.querySelector(`[data-qty="${productId}"]`);
  const quantity = Number(input?.value || 1);
  return Math.max(1, Math.min(20, Number.isFinite(quantity) ? Math.round(quantity) : 1));
}

function addProductToCart(product) {
  const size = selectedSize(product.id);
  const quantity = selectedQuantity(product.id);
  const existingItem = cart.find((item) => item.id === product.id && item.size === size);

  if (existingItem) {
    existingItem.quantity = quantity;
    existingItem.price = productPrice(product);
  } else {
    cart.push({ ...product, price: productPrice(product), size, quantity });
  }

  renderCart();
  return quantity;
}

function renderCart() {
  cartCount.textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const { subtotal, shipping, total, paypalFee, paypalTotal } = cartTotals();

  if (cart.length === 0) {
    cartLines.innerHTML = '<p class="empty-cart">Il carrello &egrave; vuoto.</p>';
  } else {
    cartLines.innerHTML = cart
      .map(
        (item, index) => `
          <div class="cart-line">
            <div>
              <strong>${item.name}</strong>
              <span>${item.size} - ${item.quantity || 1} x ${money(item.price)}</span>
            </div>
            <button class="remove-line" type="button" data-remove="${index}">Rimuovi</button>
          </div>
        `,
      )
      .join("");
  }

  subtotalNode.textContent = money(subtotal);
  shippingNode.textContent = money(shipping);
  totalNode.textContent = money(total);
  paypalTotalNode.textContent = money(paypalTotal);
  satispayTotalNode.textContent = money(total);
}

function paymentLink(type) {
  const { total, paypalTotal } = cartTotals();
  const baseLink = PAYMENT_LINKS[type]?.replace(/\/$/, "");

  if (type === "paypal") {
    return `${baseLink}/${paypalTotal.toFixed(2)}`;
  }

  return baseLink;
}

function paymentLabel(type) {
  if (type === "paypal") return "PayPal";
  if (type === "satispay") return "Satispay";
  if (type === "postepay") return "PostePay";
  return "-";
}

function isPostepayConfigured() {
  return (
    POSTEPAY_DETAILS.holder &&
    POSTEPAY_DETAILS.card &&
    POSTEPAY_DETAILS.taxCode &&
    !POSTEPAY_DETAILS.holder.includes("INSERISCI_") &&
    !POSTEPAY_DETAILS.card.includes("INSERISCI_") &&
    !POSTEPAY_DETAILS.taxCode.includes("INSERISCI_")
  );
}

function postepayInstructions(total) {
  return [
    "Dati per pagamento PostePay:",
    `Intestatario: ${POSTEPAY_DETAILS.holder}`,
    `Numero PostePay: ${POSTEPAY_DETAILS.card}`,
    `Codice fiscale intestataria: ${POSTEPAY_DETAILS.taxCode}`,
    `Importo da ricaricare: ${money(total)}`,
    "Dopo la ricarica riceverai conferma definitiva entro 24 ore.",
  ].join("\n");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 5200);
}

function isPlausibleItalianAddress(value) {
  const address = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const routeWords = /\b(via|viale|v\.le|piazza|p\.zza|piazzale|corso|c\.so|largo|vicolo|strada|str\.|frazione|localita|loc\.|contrada|borgata|rione|traversa|salita|discesa|calle|campo|riva|lungomare)\b/;
  const hasNumberOrSnc = /(\d+[a-z]?\b|\bsnc\b|\bs\.n\.c\.)/.test(address);
  const enoughWords = address.split(" ").filter(Boolean).length >= 3;

  return address.length >= 10 && routeWords.test(address) && hasNumberOrSnc && enoughWords;
}

function checkoutPayload(paymentType = "") {
  const form = document.querySelector("[data-checkout-form]");
  const formData = new FormData(form);
  const order = cart.map((item) => `${item.quantity || 1} x ${item.name} (${item.size}) - ${money(item.price)}`).join(" | ");
  const { total, paypalFee, paypalTotal } = cartTotals();
  const customerName = formData.get("name") || "";
  const customerEmail = formData.get("email") || "";
  const selectedPaymentLabel = paymentLabel(paymentType);
  const orderTotal = paymentType === "paypal" ? paypalTotal : total;
  const postepayText = paymentType === "postepay" ? postepayInstructions(orderTotal) : "";
  const autoResponse = [
    `Ciao ${customerName || ""},`,
    "",
    "abbiamo ricevuto la tua richiesta d'ordine Ariete Inside.",
    "",
    "Riepilogo richiesta:",
    `Prodotti: ${order || "-"}`,
    `Totale: ${money(orderTotal)}`,
    `Metodo selezionato: ${selectedPaymentLabel}`,
    `Spedizione: ${formData.get("address") || ""}, ${formData.get("zip") || ""} ${formData.get("city") || ""}`,
    ...(postepayText ? ["", postepayText] : []),
    "Se hai appena completato il pagamento, controlleremo la conferma e riceverai una mail entro 24 ore con lo stato dell'ordine e l'avvio della produzione.",
    "",
    "Ogni capo viene realizzato su richiesta. Produzione + spedizione standard tracciata: circa 6-10 giorni lavorativi.",
    "",
    "Per supporto o informazioni puoi scrivere a angolodellerisposte@gmail.com.",
    "",
    "Grazie,",
    "Inside You",
  ].join("\n");
  const payloadData = {
    name: customerName,
    email: customerEmail,
    phone: formData.get("phone") || "",
    address: formData.get("address") || "",
    city: formData.get("city") || "",
    zip: formData.get("zip") || "",
    products: order,
    totalQuantity: cart.reduce((sum, item) => sum + (item.quantity || 1), 0),
    subtotal: money(cartTotals().subtotal),
    shipping: money(cartTotals().shipping),
    paypalFee: paymentType === "paypal" ? money(paypalFee) : "-",
    total: money(orderTotal),
    paymentMethod: selectedPaymentLabel,
    notes: formData.get("notes") || "-",
    postepayInstructions: paymentType === "postepay" ? postepayText : "",
    customerMessage: autoResponse,
    internalCheck: "",
  };

  const normalizedPhone = String(payloadData.phone).replace(/[^\d]/g, "");
  const normalizedZip = String(payloadData.zip).trim();
  const addressInput = form.querySelector('[name="address"]');
  if (normalizedPhone.length < 8) {
    form.querySelector('[name="phone"]')?.setCustomValidity("Inserisci un numero di telefono valido per il corriere.");
  } else {
    form.querySelector('[name="phone"]')?.setCustomValidity("");
  }
  if (!isPlausibleItalianAddress(payloadData.address)) {
    addressInput?.setCustomValidity("Inserisci un indirizzo completo e reale, per esempio: Via Roma 12 oppure Localita San Marco snc.");
  } else {
    addressInput?.setCustomValidity("");
  }
  if (!/^\d{5}$/.test(normalizedZip)) {
    form.querySelector('[name="zip"]')?.setCustomValidity("Inserisci un CAP italiano di 5 cifre.");
  } else {
    form.querySelector('[name="zip"]')?.setCustomValidity("");
  }

  return {
    isValid: form.reportValidity(),
    subject: `Nuovo ordine Ariete Inside - ${customerName || "cliente"}`,
    data: payloadData,
    text: [
      "Ordine Ariete Inside Collection",
      `Cliente: ${payloadData.name}`,
      `Email: ${payloadData.email}`,
      `Telefono: ${payloadData.phone}`,
      `Spedizione: ${payloadData.address}, ${payloadData.zip} ${payloadData.city}`,
      `Prodotti: ${order}`,
      `Commissione PayPal: ${payloadData.paypalFee}`,
      `Dati PostePay: ${payloadData.postepayInstructions || "-"}`,
      `Totale: ${payloadData.total}`,
      `Pagamento: ${payloadData.paymentMethod}`,
      `Note: ${payloadData.notes}`,
    ].join("\n"),
  };
}

function requireOrderPayload() {
  if (cart.length === 0) {
    showToast("Aggiungi almeno un prodotto prima di creare il riepilogo.");
    return null;
  }

  const payload = checkoutPayload();
  if (!payload.isValid) return null;
  return payload;
}

async function submitOrderToOwner(payload) {
  if (!ORDER_DESTINATION.endpoint || ORDER_DESTINATION.endpoint.includes("INSERISCI_LA_TUA_EMAIL_ORDINI")) {
    return false;
  }

  const response = await fetch(ORDER_DESTINATION.endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload.data),
  });

  return response.ok;
}

async function openPayment(type) {
  if (cart.length === 0) {
    showToast("Aggiungi almeno un prodotto prima di pagare.");
    return;
  }

  if (type === "postepay" && !isPostepayConfigured()) {
    showToast("Inserisci prima intestatario e numero PostePay in app.js.");
    return;
  }

  const payload = checkoutPayload(type);
  if (!payload.isValid) return;

  try {
    const submitted = await submitOrderToOwner(payload);
    if (!submitted) {
      showToast("Ordine non inviato: configura prima la ricezione ordini.");
      return;
    }
  } catch (error) {
    showToast("Ordine non inviato: controlla la connessione e riprova.");
    return;
  }

  if (type === "postepay") {
    showToast("Ordine inviato. Controlla la tua email: trovi le istruzioni PostePay e il totale da pagare. Conferma pagamento entro 24 ore.");
    return;
  }

  const link = paymentLink(type);
  if (!link || link.includes("INSERISCI_IL_TUO_LINK")) {
    showToast(`Inserisci il link ${type === "paypal" ? "PayPal" : "Satispay"} reale in app.js.`);
    return;
  }

  if (type === "satispay") {
    showToast(`Ordine inviato. Su Satispay inserisci il totale del carrello: ${totalNode.textContent}. Riceverai conferma entro 24 ore.`);
  }

  window.open(link, "_blank", "noopener,noreferrer");
}

document.addEventListener("click", (event) => {
  const slideButton = event.target.closest("[data-slide]");
  if (slideButton) {
    const card = slideButton.closest(".product-card");
    const media = card?.querySelector(".product-media");
    if (media) {
      media.scrollTo({
        left: media.clientWidth * Number(slideButton.dataset.slide),
        behavior: "smooth",
      });
    }
    return;
  }

  const imageButton = event.target.closest("[data-lightbox-src]");
  if (imageButton) {
    openLightbox(imageButton.dataset.lightboxSrc, imageButton.dataset.lightboxAlt || "Foto prodotto");
    return;
  }

  if (event.target.closest("[data-close-lightbox]") || event.target.matches("[data-lightbox]")) {
    closeLightbox();
    return;
  }

  const sizeButton = event.target.closest("[data-size]");
  if (sizeButton) {
    const group = sizeButton.closest(".options");
    group.querySelectorAll(".option").forEach((button) => {
      button.classList.remove("selected");
      button.setAttribute("aria-pressed", "false");
    });
    sizeButton.classList.add("selected");
    sizeButton.setAttribute("aria-pressed", "true");
    return;
  }

  const quantityMinus = event.target.closest("[data-qty-minus]");
  if (quantityMinus) {
    const input = document.querySelector(`[data-qty="${quantityMinus.dataset.qtyMinus}"]`);
    if (input) input.value = Math.max(1, selectedQuantity(quantityMinus.dataset.qtyMinus) - 1);
    return;
  }

  const quantityPlus = event.target.closest("[data-qty-plus]");
  if (quantityPlus) {
    const input = document.querySelector(`[data-qty="${quantityPlus.dataset.qtyPlus}"]`);
    if (input) input.value = Math.min(20, selectedQuantity(quantityPlus.dataset.qtyPlus) + 1);
    return;
  }

  const quantityInput = event.target.closest("[data-qty]");
  if (quantityInput) {
    quantityInput.value = selectedQuantity(quantityInput.dataset.qty);
    return;
  }

  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const product = products.find((item) => item.id === addButton.dataset.add);
    const quantity = addProductToCart(product);
    showToast(`${quantity} x ${product.name} aggiunto al carrello.`);
    return;
  }

  if (event.target.closest("[data-go-cart]")) {
    document.querySelector("#checkout").scrollIntoView({ behavior: "smooth" });
    return;
  }

  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    cart.splice(Number(removeButton.dataset.remove), 1);
    renderCart();
    return;
  }

  if (event.target.closest("[data-open-cart]")) {
    document.querySelector("#checkout").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (event.target.closest("[data-paypal]")) openPayment("paypal");
  if (event.target.closest("[data-satispay]")) openPayment("satispay");
  if (event.target.closest("[data-postepay]")) openPayment("postepay");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

document.body.dataset.launchActive = String(isLaunchActive());
syncCartPrices();
renderProducts();
renderCart();
renderCountdown();

window.setInterval(() => {
  const wasActive = document.body.dataset.launchActive === "true";
  const active = isLaunchActive();
  document.body.dataset.launchActive = String(active);
  renderCountdown();
  if (wasActive && !active) {
    syncCartPrices();
    renderProducts();
    renderCart();
  }
}, 1000);
