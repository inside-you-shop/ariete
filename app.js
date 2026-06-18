const PAYMENT_LINKS = {
  paypal: "https://www.paypal.com/paypalme/angolodellerisposte",
  satispay: "https://www.satispay.com/app/pay/zagoner_p",
};

const ORDER_DESTINATION = {
  email: "angolodellerisposte@gmail.com",
  endpoint: "https://formsubmit.co/ajax/angolodellerisposte@gmail.com",
};

const FIRST_ITEM_SHIPPING = 4.95;
const ADDITIONAL_SHIPPING = {
  cap: 1.95,
  tee: 1.45,
  baby: 1.45,
};
const PAYPAL_FEE_RATE = 0.034;
const PAYPAL_FIXED_FEE = 0.35;

const products = [
  {
    id: "tee-fronte-retro",
    type: "tee",
    group: "tees",
    name: "Fronte + retro",
    description: "Logo davanti e frase dietro, con stampa su entrambi i lati.",
    listPrice: 29.9,
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
    listPrice: 24.9,
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
    listPrice: 24.9,
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
    listPrice: 24.9,
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
    listPrice: 22.5,
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
    listPrice: 19.9,
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
    listPrice: 19.9,
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
    listPrice: 19.9,
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

function money(value) {
  return formatter.format(value).replace(/\s/g, " ");
}

function shippingTotal(items) {
  if (items.length === 0) return 0;
  const additionalRates = items.map((item) => ADDITIONAL_SHIPPING[item.type]);
  const highestAdditionalRate = Math.max(...additionalRates);
  const additionalTotal = additionalRates.reduce((sum, rate) => sum + rate, 0);
  return FIRST_ITEM_SHIPPING + additionalTotal - highestAdditionalRate;
}

function cartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
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
  return product.price + FIRST_ITEM_SHIPPING;
}

function renderProduct(product) {
  const selectedSize = product.sizes[0];
  const mediaClass = product.images.length > 1 ? "duo" : "single";
  const discount = product.listPrice ? Math.round(((product.listPrice - product.price) / product.listPrice) * 100) : 0;
  return `
    <article class="product-card">
      <div class="launch-badge">Offerta lancio primi 30 ordini</div>
      <div class="product-media ${mediaClass}">
        ${product.images
          .map((image) => `<img src="${image}" alt="${product.name}" />`)
          .join("")}
      </div>
      <div class="product-copy">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">
          ${
            product.listPrice
              ? `<span class="was-price">Prezzo pieno <s>${money(product.listPrice)}</s></span>`
              : ""
          }
          <strong>${money(product.price)}</strong>
          <span>Prezzo lancio senza spedizione</span>
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
      <button class="add-button" type="button" data-add="${product.id}">
        Aggiungi
      </button>
    </article>
  `;
}

function renderProducts() {
  Object.entries(grids).forEach(([group, grid]) => {
    grid.innerHTML = products.filter((product) => product.group === group).map(renderProduct).join("");
  });
}

function selectedSize(productId) {
  const selected = document.querySelector(`[data-options="${productId}"] .option.selected`);
  return selected?.dataset.size || "Taglia unica";
}

function renderCart() {
  cartCount.textContent = cart.length;
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
              <span>${item.size} - ${money(item.price)}</span>
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

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function checkoutPayload(paymentType = "") {
  const form = document.querySelector("[data-checkout-form]");
  const formData = new FormData(form);
  const order = cart.map((item) => `${item.name} (${item.size}) - ${money(item.price)}`).join(" | ");
  const { total, paypalFee, paypalTotal } = cartTotals();
  const customerName = formData.get("name") || "";
  const customerEmail = formData.get("email") || "";
  const paymentLabel = paymentType ? (paymentType === "paypal" ? "PayPal" : "Satispay") : "-";
  const orderTotal = paymentType === "paypal" ? paypalTotal : total;
  const payloadData = {
    _subject: `Nuovo ordine Ariete Inside - ${customerName || "cliente"}`,
    _template: "table",
    _captcha: "false",
    Nome: customerName,
    Email: customerEmail,
    Telefono: formData.get("phone") || "",
    Indirizzo: formData.get("address") || "",
    CAP: formData.get("zip") || "",
    Citta: formData.get("city") || "",
    Prodotti: order,
    CommissionePayPal: paymentType === "paypal" ? money(paypalFee) : "-",
    Totale: money(orderTotal),
    Pagamento: paymentLabel,
    Note: formData.get("notes") || "-",
  };

  return {
    isValid: form.reportValidity(),
    subject: payloadData._subject,
    data: payloadData,
    text: [
      "Ordine Ariete Inside Collection",
      `Cliente: ${payloadData.Nome}`,
      `Email: ${payloadData.Email}`,
      `Telefono: ${payloadData.Telefono}`,
      `Spedizione: ${payloadData.Indirizzo}, ${payloadData.CAP} ${payloadData.Citta}`,
      `Prodotti: ${order}`,
      `Commissione PayPal: ${payloadData.CommissionePayPal}`,
      `Totale: ${payloadData.Totale}`,
      `Pagamento: ${payloadData.Pagamento}`,
      `Note: ${payloadData.Note}`,
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

  const formBody = new FormData();
  Object.entries(payload.data).forEach(([key, value]) => {
    formBody.append(key, value);
  });

  const response = await fetch(ORDER_DESTINATION.endpoint, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formBody,
  });

  return response.ok;
}

async function openPayment(type) {
  if (cart.length === 0) {
    showToast("Aggiungi almeno un prodotto prima di pagare.");
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

  const link = paymentLink(type);
  if (!link || link.includes("INSERISCI_IL_TUO_LINK")) {
    showToast(`Inserisci il link ${type === "paypal" ? "PayPal" : "Satispay"} reale in app.js.`);
    return;
  }

  if (type === "satispay") {
    showToast(`Ordine inviato. Procedi su Satispay con il totale del carrello: ${totalNode.textContent}.`);
  }

  window.open(link, "_blank", "noopener,noreferrer");
}

document.addEventListener("click", (event) => {
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

  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const product = products.find((item) => item.id === addButton.dataset.add);
    cart.push({ ...product, size: selectedSize(product.id) });
    renderCart();
    showToast(`${product.name} aggiunto al carrello.`);
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
});

renderProducts();
renderCart();
